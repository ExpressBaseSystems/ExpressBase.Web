var tabNum = 0;
var DataSource = function (obj_id, is_new, ver_num, cid, type, fd_id) {
    this.Obj_Id = obj_id;
    this.Name;
    this.Description;
    this.Code;
    this.ObjectType = type;
    this.Is_New = is_new;
    this.Version_num = ver_num;
    this.Cid = cid;
    this.CommitBtn;
    this.SaveBtn;
    this.Fd_DropDown;
    this.VersionHistBtn;
    this.CloseTabBtn;
    this.Versions;
    this.var_id;
    this.HistoryVerNum;
    this.changeLog;
    this.commitUname;
    this.commitTs;
    this.ValidInput = true;
    this.Object_String_WithVal;
    this.Filter_Params;
    this.Parameter_Count;
    this.SelectedFdId;
    this.FilterDId = fd_id;
    this.Rel_object;
    this.rel_arr = [];


    this.Init = function () {
        this.SaveBtn = $('#save');
        this.CommitBtn = $('#commit');
        this.VersionHistBtn = $('#ver_his');
        this.CloseTabBtn = $('.closeTab');

        $(this.VersionHistBtn).off("click").on("click", this.VerHistory.bind(this));
        $(this.CloseTabBtn).off("click").on("click", this.deleteTab.bind(this));
        $('#execute').off("click").on("click", this.Execute.bind(this));
        $('#runSqlFn0').off("click").on("click", this.RunSqlFn.bind(this));
        $('#testSqlFn0').off("click").on("click", this.TestSqlFn.bind(this));
        $('.compare_inner').off("click").on("click", this.Differ.bind(this));
        $(".selectpicker").selectpicker();
        $("#fdlist .bootstrap-select").off("click").on("click", this.Load_filter_dialog_list.bind(this));
        $('#fd').off("change").on("change", this.Clear_fd.bind(this));
        $('#fd').off("loaded.bs.select").on("loaded.bs.select", this.SetFdInit(this, this.FilterDId));
        $('#compare').off('click').on('click',this.Compare.bind(this));
    }

    this.SetValues = function () {
        this.Code = window.editor.getValue();
        this.Name = $('#obj_name').val();
        this.Description = $('#obj_desc').val();
    }

    this.Success_alert = function (result) {
        $.LoadingOverlay("hide");
    }

    this.SetFdInit = function (me, fdId) {
        var val = "Select Filter Dialog";
        if (this.Is_New === false && fdId !== 0) {
            val = this.FilterDId;
        }
        this.Load_filter_dialog_list(val);
    }

    this.Clear_fd = function () {
        var getNav = $("#versionNav li.active a").attr("href");
        $(getNav + ' #inner_well').children().remove();
        $('#execute').addClass('collapsed');
    };

    this.Load_filter_dialog_list = function (val) {
        if (!$('#fdlist .bootstrap-select').hasClass('open')) {
            $('#fdlist #fd').children().remove();
            $('#fdlist .selectpicker').selectpicker('refresh');
            $('#loader_fd').show();
            $.ajax({
                url: "../CE/GetObjects",
                type: 'post',
                data: { obj_type: 12 },
                success: function (data) {
                    $('#fdlist #fd').children().remove();
                    $('#fdlist #fd').append("<option value='Select Filter Dialog' data-tokens='Select Filter Dialog'>Select Filter Dialog</option>");
                    $.each(data, function (i, obj) {
                        $('#fd').append("<option value='" + obj.refId + "' data-tokens='" + obj.refId + "'>" + obj.name + "</option>")
                    });
                    $('#fdlist .selectpicker').selectpicker('refresh');
                    $('#fdlist .selectpicker').selectpicker('val', val);
                    $('#loader_fd').hide();
                },

            });

        }
    }

    this.deleteTab = function (e) {
        var tabContentId = $(e.target).parent().attr("href");
        $(e.target).parent().parent().remove(); //remove li of tab
        $(tabContentId).remove();
        $('#versionNav a:last').tab('show'); // Select first tab        
    };

    this.VerHistory = function () {
        $.LoadingOverlay("show");
        $.post("../CE/GetVersions",
                          {
                              objid: this.Obj_Id
                          }, this.Version_List.bind(this));
    }

    this.Version_List = function (result) {
        $.LoadingOverlay("hide");
        this.SetValues();
        this.Versions = result;
        tabNum++;
        $('#versionNav').append("<li><a data-toggle='tab' href='#vernav" + this.Obj_Id + tabNum + "'>Version History<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>");
        $('#versionTab').append("<div id='vernav" + this.Obj_Id + tabNum + "' class='tab-pane fade'>" +
        "<table class='table table-striped table-bordered col-md-12' id='versions" + this.Obj_Id + tabNum + "'>" +
                       "<thead class='verthead" + this.Obj_Id + tabNum + "'>" +
                           "<tr>" +
                               "<th class='col-md-1'>Version Number</th>" +
                              "<th class='col-md-4'>Change Log</th>" +
                              "<th class='col-md-1'>Committed By</th>" +
                               "<th class='col-md-2'>Committed At</th>" +
                               "<th class='col-md-1'> </th>" +
                           "</tr>" +
                      " </thead>" +
                       "<tbody id='vertbody" + this.Obj_Id + tabNum + "' class='vertbody'></tbody>" +
                   "</table>" +
                   "</div>");
        $("#versionNav a[href='#vernav" + this.Obj_Id + tabNum + "']").tab('show');
        $('.closeTab').off("click").on("click", this.deleteTab.bind(this));

        this.ShowVersions();
    }

    this.ShowVersions = function () {
        $.each(this.Versions, this.ShowVersions_inner.bind(this));
    }

    this.ShowVersions_inner = function (i, obj) {
        $('#vertbody' + this.Obj_Id + tabNum).append("<tr>" +
                                   "<td>" + obj.versionNumber + "</td> " +
                                   "<td>" + obj.changeLog + "</td> " +
                                   "<td>" + obj.commitUname + "</td> " +
                                   "<td>" + obj.commitTs + "</td> " +
                                    "<td><input type='button' id='view_code" + this.Obj_Id + tabNum + i + "' class='view_code' value='View' data-id=" + obj.refId + " data-verNum=" + obj.versionNumber + " data-changeLog=" + obj.changeLog + " data-commitUname=" + obj.commitUname + " data-commitTs=" + obj.commitTs + "></td>" +
                             " </tr>");
        $('#view_code' + this.Obj_Id + tabNum + i).off("click").on("click", this.OpenPrevVer.bind(this));
    };

    this.OpenPrevVer = function (e) {
        $.LoadingOverlay("show");
        tabNum++;
        this.var_id = $(e.target).attr("data-id");
        this.HistoryVerNum = $(e.target).attr("data-verNum");
        this.changeLog = $(e.target).attr("data-changeLog");
        this.commitUname = $(e.target).attr("data-commitUname");
        this.commitTs = $(e.target).attr("data-commitTs");
        $.post('../CE/VersionCodes', { objid: this.var_id, objtype: this.ObjectType })
        .done(this.VersionCode_success.bind(this));
    }

    this.VersionCode_drpListItem = function (i, version) {
        var vnum = version.versionNumber;
        $('#vernav' + this.Obj_Id + tabNum + " select").append("<option value='" + version.id + "' data-tokens='" + vnum + "'> Version " + version.versionNumber + "</option>");
    };

    this.VersionCode_success = function (data) {
        $('#versionNav').append("<li><a data-toggle='tab' href='#vernav" + this.Obj_Id + tabNum + "' data-verNum='" + this.HistoryVerNum + "'>" + this.Name + " V." + this.HistoryVerNum + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>");
        $('#versionTab').append("<div id='vernav" + this.Obj_Id + tabNum + "' class='tab-pane fade'>");
        $('#vernav' + this.Obj_Id + tabNum).append("<div class='form-inline inner_toolbar' style='margin-bottom:0px;'>  " +
                  " <div class='btn btn-group'>"+
                        "<div class='verlist input-group'>" +
                                  "<select id='selected_Ver" + tabNum + "' name='selected_Ver' class='selected_Ver selectpicker show-tick form-control' data-live-search='true'>" +
                                  "<option value='Select Version' data-tokens='Select Version'>Compare With</option>");
                                     $.each(this.Versions, this.VersionCode_drpListItem.bind(this));
        $('#vernav' + this.Obj_Id + tabNum).append("</select>" +
                       "</div>" +
                    "<div class='dropdown fdlist btn-group' id='fdlist'>"+
                         "<select id='fd" + tabNum + "' name='fd' class='fd selectpicker show-tick' data-live-search='true'></select>" +
                         "<i class='fa fa-circle-o-notch fa-spin fa-1x fa-fw' id='loader_fd' style='display:none;color:dodgerblue;'></i>"+
                     "</div>"+
                   "<a href='#inner_well' class='btn btn-default collapsed' id='execute' data-toggle='collapse' title='Click to open Parameter dialog'><i class='fa fa-chevron-down fa-1x' aria-hidden='true'>Render</i></a>"+
                 "</div>"+ 
           "</div>"+
          "<div id='inner_well' class='collapse'></div>"+
                    "<div id='run' name='run' class='run btn btn-default disabled'>Run</div>");
        $('#fd' + tabNum).off("change").on("change", this.Clear_fd.bind(this));
        $('#fd' + tabNum).off("loaded.bs.select").on("loaded.bs.select", this.SetFdInit(this, this.FilterDId));
        $('#vernav' + this.Obj_Id + tabNum).append(
         " <div><label class = 'label label-default codeEditLabel'>Version V." + this.HistoryVerNum + "</label>" +
            " <label class = 'label label-default codeEditLabel'>ChangeLog: " + this.changeLog + "</label>" +
            "<label  class = 'label label-default codeEditLabel'>Committed By: " + this.commitUname + " </label>" +
            " <label class = 'label label-default codeEditLabel'>CommittedAt: " + this.commitTs + "</label>" +
            "<textarea id='vercode" + tabNum + "' name='vercode' class='code'>" + data + "</textarea>" +
            "</div>");
        $('.closeTab').off("click").on("click", this.deleteTab.bind(this));
        window.editor = CodeMirror.fromTextArea(document.getElementById("vercode" + tabNum), {
            mode: "text/x-sql",
            lineNumbers: true,
            lineWrapping: true,
            autoRefresh: true,
            readOnly: true,
            foldGutter: { rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.brace, CodeMirror.fold.comment) },
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });

        var getNav = $("#versionNav li.active a").attr("href");
        $("#versionNav a[href='#vernav" + this.Obj_Id + tabNum + "']").tab('show');
        $(getNav + ' #selected_Ver' + tabNum).off("change").on("change", this.Differ.bind(this));
        $(getNav + ' #execute').off('shown.bs.collapse').on('shown.bs.collapse', this.Execute.bind(this));
        $.LoadingOverlay("hide");
        setTimeout(function () {
            window.editor.refresh();
        }, 500);
        $('.selectpicker').selectpicker({
            size: 4
        });
    };

    this.Execute = function () {
        if (!$('#execute').hasClass('collapsed')) { }
        else {
            $.LoadingOverlay("show");
            if (this.Parameter_Count !== 0 && $('#fd option:selected').text() === "Select Filter Dialog") {
                alert("Please select a filter dialog");
                $.LoadingOverlay("hide");
            }
            else if (this.Parameter_Count === 0) {
                $.LoadingOverlay("hide");
                $(getNav + " #run").removeClass('disabled');
                $(getNav + " #run").off("click").on("click", this.RunDs.bind(this));
            }
            else {
                this.SetValues();
                this.Find_parameters(false, false, false);
                // this.Save(false);
                this.SelectedFdId = $('#fd option:selected').val();
                this.Load_Fd();
            }
        }
    }

    this.RunSqlFn = function () {
        $.LoadingOverlay("show");
        this.SetValues();
        if ($('.fd option:selected').text() === "Select Filter Dialog") {
            alert("Please select a filter dialog");
            $.LoadingOverlay("hide");
        }
        this.Save(true);
    }

    this.TestSqlFn = function () {
        $.LoadingOverlay("show");
        alert("Test");
    }

    this.Compare = function () {
        tabNum++;
        $('#versionNav').append("<li><a data-toggle='tab' href='#vernav" + tabNum + "'> compare <button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>");
        $('#versionTab').append("<div id='vernav" + tabNum + "' class='tab-pane fade'>");
       // $('#vernav' + tabNum).append("Compare With:");
        $("#versionNav a[href='#vernav"+ tabNum +"']").tab('show');
        $('.closeTab').off("click").on("click", this.deleteTab.bind(this));
    };

    this.Differ = function () {      
        $.LoadingOverlay("show");       
        if (verRefid === "Select Version") {
            alert("Please Select A Version");
        }
        else {
            if ($('input[name=compWith]:checked').val() === 1) {
                var verRefid = $('.selected_Ver option:selected').val();
                var selected_ver_number = $('.selected_Ver option:selected').attr("data-tokens");
                $.post('../CE/VersionCodes', { "objid": verRefid, "objtype": this.ObjectType }).done(this.CallDiffer.bind(this, selected_ver_number, this.Version_num));
            }
            else if ($('input[name=compWith]:checked').val() === 1) {

            }
        }
    }

    this.Init();

    this.Save = function (needRun) {
        $.LoadingOverlay("show");
        this.SetValues();
        if (this.Is_New === true) {
            this.Commit(needRun);
        }
        else {
            if (this.ObjectType === 5) {
                this.SetSqlFnName();
            }
            this.Find_parameters(true, true, needRun);
        };
    };

    this.Commit = function (needRun) {
        $.LoadingOverlay("show");
        this.SetValues();
        if (this.ObjectType === 5) {
            this.SetSqlFnName();
        }
        this.Find_parameters(true, false, needRun);
    }

    $(this.SaveBtn).off("click").on("click", this.Save.bind(this, false));
    $(this.CommitBtn).off("click").on("click", this.Commit.bind(this, false));

    this.Find_parameters = function (isCommitorSave, issave, needRun) {
        this.SetValues();
        var result = this.Code.match(/\@\w+/g);
        var filterparams = [];
        if (result !== null) {
            for (var i = 0; i < result.length; i++) {
                result[i] = result[i].substr(1);
                if (result[i] === "search" || result[i] === "and_search" || result[i] === "search_and" || result[i] === "where_search" || result[i] === "limit" || result[i] === "offset" || result[i] === "orderby") {
                    //
                }
                else {
                    if ($.inArray(result[i], filterparams) === -1)
                        filterparams.push(result[i]);
                }
            }
            filterparams.sort();
            this.Filter_Params = filterparams;
            this.Parameter_Count = filterparams.length;
        }
        else {
            this.Parameter_Count = 0;
        }
        if (isCommitorSave === true) {
            var _json = null;
            if (this.Parameter_Count !== 0 && ($('#fd option:selected').text() === "Select Filter Dialog")) {
                if (confirm('Are you sure you want to save this without selecting a filter dialog?')) {
                    this.SetValues();
                    this.FilterDId = null;
                    this.GetUsedSqlFns(needRun, issave);
                }
                else {
                    $.LoadingOverlay("hide");
                }
            }
            else {
                this.SetValues();
                this.GetUsedSqlFns(needRun, issave);
            }
        }
    }

    this.CreateObjString = function () {
        this.ValidInput = true;
        var ObjString = "[";
        var filter_control_list = "datefrom,dateto";
        var myarray = filter_control_list.split(',');
        for (var i = 0; i < myarray.length; i++) {
            console.log($("#" + myarray[i]).val());
            if (typeof $("#" + myarray[i]).val() === "undefined") {
                $(this).addClass('has-error');
                this.ValidInput = false;
            }
            var type = $('#' + myarray[i]).attr('data-ebtype');
            var name = $('#' + myarray[i]).attr('name');
            var value = $('#' + myarray[i]).val();
            if (type === '6')
                value = value.substring(0, 10);

            ObjString += '{\"name\":\"' + name + '\",';
            ObjString += '\"type\":\"' + type + '\",';
            ObjString += '\"value\":\"' + value + '\"},';
        }
        ObjString = ObjString.slice(0, -1) + ']';
        this.Object_String_WithVal = ObjString;
        console.log("Object_String_WithVal" + this.Object_String_WithVal);
    }

    this.DrawTable = function () {
        $.LoadingOverlay("show");
        if (this.ValidInput === true) {
            tabNum++;
            $('#versionNav').append("<li><a data-toggle='tab' href='#vernav" + this.Obj_Id + tabNum + "'>Result-" + this.Name + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>");
            $('#versionTab').append("<div id='vernav" + this.Obj_Id + tabNum + "' class='tab-pane fade'>");
            $('#vernav' + this.Obj_Id + tabNum).append("  <div class=' filter_modal_body'>" +
                      "<table class='table table-striped table-bordered' id='sample" + tabNum + "'></table>" +
                  "</div>");
            $('.closeTab').off("click").on("click", this.deleteTab.bind(this));

            $.post('GetColumns4Trial', {
                ds_refid: this.Obj_Id,
                parameter: this.Object_String_WithVal
            }, this.Load_Table_Columns.bind(this));

        }
        else {
            $.LoadingOverlay("hide");
            alert('not valid');
        }
    };

    this.Load_Table_Columns = function (result) {
        if (result === "") {
            alert('Error in Query');
        }
        else {
            var cols = JSON.parse(result);
            $("#sample" + tabNum).dataTable({
                columns: cols,
                serverSide: true,
                lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
                scrollX: "100%",
                scrollY: "300px",
                processing: true,
                ajax: {
                    url: "https://localhost:44377/ds/data/" + this.Obj_Id,
                    type: "POST",
                    data: this.Load_tble_Data.bind(this),
                    crossDomain: true,
                    //xhrFields: { withCredentials: true },

                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", "Bearer " + getToken());
                    },
                    dataSrc: function (dd) { return dd.data; },
                }
            });

            $("#versionNav a[href='#vernav" + this.Obj_Id + tabNum + "']").tab('show');
            $.LoadingOverlay("hide");
        }
    };

    this.Load_tble_Data = function (dq) {
        delete dq.columns; delete dq.order; delete dq.search;
        dq.RefId = this.Obj_Id;
        //dq.Token = getToken();
        //dq.rToken = getrToken();
        dq.TFilters = [];
        dq.Params = this.Object_String_WithVal;
        return dq;
    };

    this.Load_Fd = function () {
        var getNav = $("#versionNav li.active a").attr("href");
        if ($(getNav + ' #inner_well').children().length === 0) {
            $.post("../CE/GetFilterBody", { "ObjId": this.SelectedFdId, "Ebobjtype": "FilterDialog" },
            function (result) {
                $(getNav + ' #inner_well').append(result);
                $(getNav + ' #run').removeClass('disabled');
                $.LoadingOverlay("hide");
            });
        }
        else {
            $.LoadingOverlay("hide");
            $(getNav + ' #run').removeClass('disabled');
        }

        $(getNav + " #run").off("click").on("click", this.RunDs.bind(this));
    };

    this.RunDs = function () {
        if (this.Parameter_Count === 0) {
            this.Save(false);
            this.ValidInput === true
            this.Object_String_WithVal = "";
            this.DrawTable();
        }
        else {
            this.Find_parameters(false, false, false);
            this.CreateObjString();
            this.DrawTable();
        }
    };

    this.CallDiffer = function (selected_ver_number,curr_ver, data) {
        var getNav = $("#versionNav li.active a").attr("href");
       // var vername = $('#selected_Ver option:selected').attr("data-tokens");
        var _code = $(".code").text();
        this.SetValues();
        if (selected_ver_number > curr_ver) {
            $.post("../CE/GetDiffer", {
                NewText: data, OldText: _code
            })
       .done(this.showDiff.bind(selected_ver_number, curr_ver, this));
        }
        else {
            $.post("../CE/GetDiffer", {
                NewText: _code, OldText: data
            })
       .done(this.showDiff.bind(this, curr_ver, selected_ver_number));
        }
    };

    this.showDiff = function (new_ver_num, old_ver_num, data) {
        var getNav = $("#versionNav li.active a").attr("href");
      //  var verid = $(getNav + ' #selected_Ver option:selected').val();
    
        $('#compare_result').append("<div id='oldtext"+ tabNum + "'class='leftPane'>" +
              "</div>" +
              "  <div id='newtext"+ tabNum + "' class='rightPane'>" +
              "</div>");
        $('#oldtext' + tabNum).html("<div class='diffHeader'>v." + old_ver_num + "</div>" + data[0]);
        $('#newtext' + tabNum).html("<div class='diffHeader'>v." + new_ver_num + "</div>" + data[1]);
        $('.leftPane').scroll(function () {
            $('.rightPane').scrollTop($(this).scrollTop());
            $('.rightPane').scrollLeft($(this).scrollLeft());
        });
        $('.rightPane').scroll(function () {
            $('.leftPane').scrollTop($(this).scrollTop());
           $('.leftPane').scrollLeft($(this).scrollLeft());
        });
        $.LoadingOverlay("hide");
    };

    this.SetSqlFnName = function () {
        var result = this.Code.match(/create\s*FUNCTION\s*|create\s*or\s*replace\s*function\s*(.[\s\S]*?\))/i);
        if (result.length > 0) {
            var fnName = result[1].replace(/\s\s+/g, ' ');
            var x = fnName.replace('(', "_v" + this.Version_num + '(');
            var v = this.Code.replace(result[1], x);
            $('#obj_name').val(x);
            $('#code').val(v);
            editor.setValue(v);
        }
    };

    this.GetUsedSqlFns = function (needRun, issave) {

        this.rel_arr = [];
        this.Rel_object = null;
        $.post("../CE/GetObjects_refid_dict", { obj_type: 5 }, this.FetchUsedSqlFns.bind(this, issave, needRun));
    };

    this.FetchUsedSqlFns = function (issave, needRun, data) {
        $.each(data, this.FetchUsedSqlFns_inner.bind(this));

        var getNav = $("#versionNav li.active a").attr("href");
        var filter_dialog_refid = $(getNav + " #fdlist #fd  option:selected").val();

        if (filter_dialog_refid === "Select Filter Dialog") {
            filter_dialog_refid = null;
        }

        this.rel_arr.push(filter_dialog_refid);
        this.Rel_object = this.rel_arr.toString();
        _json = { $type: "ExpressBase.Objects.EbDataSource, ExpressBase.Objects", filterdialogrefid: filter_dialog_refid, sql: btoa(unescape(encodeURIComponent(this.Code))) }
        if (issave === true) {
            $.post("../CE/SaveEbDataSource",
                       {
                           "Id": this.Obj_Id,
                           "Name": this.Name,
                           "Description": this.Description,
                           "ObjectType": this.ObjectType,
                           "Token": getToken(),
                           "isSave": "true",
                           "VersionNumber": this.Version_num,
                           "filterDialogId": filter_dialog_refid,
                           "json": JSON.stringify(_json),
                           "NeedRun": needRun,
                           "rel_obj": this.Rel_object
                       }).done(alert("Save Success"));
        }
        else {

            $.post("../CE/CommitEbDataSource", {
                "objtype": this.ObjectType,
                "id": this.Obj_Id,
                "name": this.Name,
                "description": this.Description,
                "filterDialogId": filter_dialog_refid,
                "changeLog": "changed",
                "json": JSON.stringify(_json),
                "rel_obj": this.Rel_object
            }, function (result) {
                $.post("../CE/code_editor", {
                    "objid": result.refId
                })
            });
        }
        $.LoadingOverlay("hide");
    };

    this.FetchUsedSqlFns_inner = function (i, sqlFn) {
        if (this.Code.indexOf(sqlFn.name) !== -1) {
            this.rel_arr.push(i);
        }
    };
}