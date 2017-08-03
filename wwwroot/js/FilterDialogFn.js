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

    this.MyFd = new FilterDialog();

    this.Init = function () {
        this.SaveBtn = $('#save');
        this.CommitBtn = $('#commit');
        this.VersionHistBtn = $('#ver_his');
        this.CloseTabBtn = $('.closeTab');
        //this.Fd_DropDown = $('#fd');

        $(this.VersionHistBtn).off("click").on("click", this.VerHistory.bind(this));
        $(this.CloseTabBtn).off("click").on("click", this.deleteTab.bind(this));
        //$(this.Fd_DropDown).off("change").on("change", this.SelectFD.bind(this));       
        $('#execute').off("click").on("click", this.Execute.bind(this));
        $('#runSqlFn0').off("click").on("click", this.RunSqlFn.bind(this));
        $('#testSqlFn0').off("click").on("click", this.TestSqlFn.bind(this));
        $('#selected_Ver').off("change").on("change", this.Differ.bind(this));
        $('#fd').off("change").on("change", this.Clear_fd.bind(this));
        $(".selectpicker").selectpicker();
        $("#fdlist .bootstrap-select").off("click").on("click", this.Load_filter_dialog_list.bind(this));
        $('#fd').off("loaded.bs.select").on("loaded.bs.select", this.SetFdInit(this,this.FilterDId));
    }

    this.SetValues = function () {
        this.Code = window.editor.getValue();
        this.Name = $('#obj_name').val();
        this.Description = $('#obj_desc').val();
    }

    this.Success_alert = function (result) {
        $.LoadingOverlay("hide");
    }
    this.SetFdInit= function (me,fdId) {
        if (this.Is_New === false) {
            if (fdId === 0) {
                var val = "Select Filter Dialog";
            }
            else {
                var val = this.FilterDId;
            }
            this.Load_filter_dialog_list(val);
          
        }
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
                url: "../Dev/GetObjects",
                type: 'post',
                data: { obj_type: 12 },
                success: function (data) {
                    $('#fdlist #fd').children().remove();
                    $('#fdlist #fd').append("<option value='Select Filter Dialog' data-tokens='Select Filter Dialog'>Select Filter Dialog</option>");
                    $.each(data, function (i, obj) {
                        $('#fd').append("<option value=" + i + " data-tokens=" + obj + ">" + obj.name + "</option>")
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
        $.post("../Dev/GetVersions",
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
                                    "<td><input type='button' id='view_code" + this.Obj_Id + tabNum + i + "' class='view_code' value='View' data-id=" + obj.id + " data-verNum=" + obj.versionNumber + " data-changeLog=" + obj.changeLog + " data-commitUname=" + obj.commitUname + " data-commitTs=" + obj.commitTs + "></td>" +
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
        $.post('../Dev/VersionCodes', { objid: this.var_id, objtype: this.ObjectType })
        .done(this.VersionCode_success.bind(this));
    }

    this.VersionCode_drpListItem = function (i, version) {
        var vnum = version.versionNumber;
        $('#vernav' + this.Obj_Id + tabNum + " select").append("<option value='" + version.id + "' data-tokens='" + vnum + "'> Version " + version.versionNumber + "</option>");
    };

    this.VersionCode_success = function (data) {
        $('#versionNav').append("<li><a data-toggle='tab' href='#vernav" + this.Obj_Id + tabNum + "' data-verNum='" + this.HistoryVerNum + "'>" + this.Name + " V." + this.HistoryVerNum + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>");
        $('#versionTab').append("<div id='vernav" + this.Obj_Id + tabNum + "' class='tab-pane fade'>");
        $('#vernav' + this.Obj_Id + tabNum).append("<div class='form-inline well'>  " +
                   " <a href='#' id='execute'class='btn btn-default' data-toggle='tooltip' title='Execute'><i class='fa fa-play fa-1x' aria-hidden='true'></i></a>" +
                              "<div class='verlist input-group'>" +
                                  "<select id='selected_Ver" + tabNum + "' name='selected_Ver' class='selected_Ver selectpicker show-tick form-control' data-live-search='true'>" +
                                  "<option value='Select Version' data-tokens='Select Version'>Compare With</option>")
        $.each(this.Versions, this.VersionCode_drpListItem.bind(this));
        $('#vernav' + this.Obj_Id + tabNum).append("</select>" +
                        "</div>" +
                        "<div id='inner_well" + tabNum + "'></div>"
                        );
        $('#vernav' + this.Obj_Id + tabNum).append("</div>");
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
            readOnly: true,
            foldGutter: { rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.brace, CodeMirror.fold.comment) },
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });
        var getNav = $("#versionNav li.active a").attr("href");
        $("#versionNav a[href='#vernav" + this.Obj_Id + tabNum + "']").tab('show');
        $(getNav + ' #selected_Ver' + tabNum).off("change").on("change", this.Differ.bind(this));
        // $(getNav+' #execute').off("click").on("click", this.Execute.bind(this));
        $(getNav + ' #execute').off('shown.bs.collapse').on('shown.bs.collapse', this.Execute.bind(this));
        $.LoadingOverlay("hide");
        //setTimeout(function () {
        //    window.editor.refresh();
        //}, 500);
        $('.selectpicker').selectpicker({
            //style: 'btn-info',
            size: 4
        });

    };

    //this.SelectFD = function () {
    // var selectVal = $('#fd option:selected').text();
    //if (selectVal === "Auto Generate Filter Dialog") {
    //    this.Find_parameters();
    //    if (this.Parameter_Count !== 0) {
    //        $('.fdthead').children().remove();
    //        $('.fdthead').append(" <tr>" +
    //                "<th>Parameter Name</th>" +
    //                "<th>Parameter Type</th>" +
    //        " </tr>");
    //        $('#fdtbody').children().remove();
    //        $.each(this.Filter_Params, function (i, obj) {
    //            $('#fdtbody').append("<tr><td><label class='align_singleLine'>" + obj + "</label>" +
    //                                  "  </td>" +
    //                                   " <td>" +
    //                                    "    <select id=" + obj + " name='fdtype' class='param_val selectpicker show-tick align_singleLine' data-live-search='true' style='display:inline-block !important'>" +
    //                                     "       <option value='text' data-tokens='text'>text</option>' " +
    //                                     "       <option value='integer' data-tokens='integer'>integer</option>" +
    //                                       "     <option value='datetime' data-tokens='datetime'>datetime</option>" +
    //                                         "   <option value='boolean' data-tokens='boolean'>boolean</option>" +
    //                                        "</select>" +
    //                                   " </td>" +
    //                               " </tr>");
    //        });
    //        $('#filterDialog').modal('show');
    //        $('#run').hide();
    //        $('#saveFilter').show();
    //    }
    //    else {
    //        alert("no filters ");
    //          $.LoadingOverlay("hide");
    //    }
    //}
    //  }

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
                this.Find_parameters();
               // this.Save(false);
                this.SelectedFdId = $('#fd option:selected').val();
                this.Load_Fd();
            }
            //else if ($('#fd option:selected').text() === "Auto Generate Filter Dialog") {//auto generate
            //    this.Save(false);
            //    this.Find_parameters();
            //    if (this.Parameter_Count === 0) {
            //        this.ValidInput = true;
            //        this.Object_String_WithVal = "";
            //        this.DrawTable();
            //    }
            //}
        }
    }

    this.RunSqlFn = function () {
        $.LoadingOverlay("show");
        this.SetValues();
        if ($('#fd option:selected').text() === "Select Filter Dialog") {
            alert("Please select a filter dialog");
            $.LoadingOverlay("hide");
        }
        else if ($('#fd option:selected').text() === "Auto Generate Filter Dialog") {
            this.Save(true);
            //create fd
            alert("create fd");
        }
        this.Save(true);
    }

    this.TestSqlFn = function () {
        $.LoadingOverlay("show");
        alert("Test");
    }

    this.Differ = function () {
        $.LoadingOverlay("show");
        var getNav = $("#versionNav li.active a").attr("href");
        var verid = $(getNav + ' .selected_Ver option:selected').val();
        var ver_number = $(getNav + ' .selected_Ver option:selected').attr("data-tokens");
        if (verid === "Select Version") {
            alert("Please Select A Version");
        }
        else {
            $.post('../Dev/VersionCodes', { "objid": verid, "objtype": this.ObjectType }).done(this.CallDiffer.bind(this, ver_number));
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
            $.LoadingOverlay("show");
            this.FilterDId = $('#fd option:selected').val();
            if (this.FilterDId === "Select Filter Dialog") {
                this.FilterDId = null;
            }
            if (this.ObjectType === 5) {
                this.SetSqlFnName();
            }
            $.post("../Dev/SaveEbDataSource",
                {
                    "Id": this.Obj_Id,
                    "Code": this.Code,
                    "Name": this.Name,
                    "Description": this.Description,
                    "ObjectType": this.ObjectType,
                    "Token": getToken(),
                    "isSave": "true",
                    "VersionNumber": this.Version_num,
                    "FilterDialogId": this.FilterDId,
                    "NeedRun": needRun
                }, this.Success_alert.bind(this));
        };
    }

    this.Commit = function (needRun) {
        $.LoadingOverlay("show");
        this.SetValues();
        if (this.ObjectType === 5) {
            this.SetSqlFnName();
        }
        this.Find_parameters();
        if (this.Parameter_Count !== 0 && ($('#fd option:selected').text() === "Select Filter Dialog")) {
            if (confirm('Are you sure you want to save this without selecting a filter dialog?')) {

                this.SetValues();
                this.FilterDId = $('#fd option:selected').val();
                this.GetUsedSqlFns(needRun);
            }
            else {
                $.LoadingOverlay("hide");
            }
        }
        else {
            this.SetValues();
            this.FilterDId = $('#fd option:selected').val();
            this.GetUsedSqlFns(needRun);
        }
    }

    $(this.SaveBtn).off("click").on("click", this.Save.bind(this, false));
    $(this.CommitBtn).off("click").on("click", this.Commit.bind(this, false));

    this.Find_parameters = function () {
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
            $('#versionNav').append("<li><a data-toggle='tab' href='#vernav" + this.Name + tabNum + "'>Result-" + this.Name + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>");
            $('#versionTab').append("<div id='vernav" + this.Name + tabNum + "' class='tab-pane fade'>");
            $('#vernav' + this.Name + tabNum).append("  <div class=' filter_modal_body'>" +
                      "<table class='table table-striped table-bordered' id='sample" + tabNum + "'></table>" +
                  "</div>");
            $('.closeTab').off("click").on("click", this.deleteTab.bind(this));

            $.post('GetColumns4Trial', {
                dsid: this.Obj_Id,
                parameter: this.Object_String_WithVal
            }, this.Load_Table_Columns.bind(this));
            $("#versionNav a[href='#vernav" + this.Name + tabNum + "']").tab('show');
            alert(":11");
        }
        else {
            $.LoadingOverlay("hide");
            alert('not valid');
        }
        alert(":122");
        return false;
    };

    this.Load_Table_Columns = function (result) {
        if (result === "") {
            // $('#filterDialog').modal('hide');
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
          //      "processing": true,
                ajax: {
                    url: "https://expressbaseservicestack.azurewebsites.net/ds/data/" + this.Obj_Id,
                    type: "POST",
                    data: this.Load_tble_Data.bind(this),
                    dataSrc: function (dd) { return dd.data; },
                }
            });
            $.LoadingOverlay("hide");           
        }
    };

    this.Load_tble_Data = function (dq) {
        delete dq.columns; delete dq.order; delete dq.search;
        dq.Id = this.Obj_Id;
        dq.Token = getToken();
        //dq.rToken = getrToken();
        dq.TFilters = [];
        dq.Params = this.Object_String_WithVal;
        return dq;
    };

    this.Load_Fd = function () {
        var getNav = $("#versionNav li.active a").attr("href");
        //  $(getNav + ' #inner_well').children().remove();
        if ($(getNav + ' #inner_well').children().length === 0) {
            $.post("../Dev/GetByteaEbObjects_json", { "ObjId": this.SelectedFdId, "Ebobjtype": "FilterDialog" },
            function (result) {
                $(getNav + ' #inner_well').append(result);
                $(getNav + ' #run').removeClass('disabled');
                $.LoadingOverlay("hide");
            });
        }
        $.LoadingOverlay("hide");
        $(getNav + ' #run').removeClass('disabled');
        $(getNav + " #run").off("click").on("click", this.RunDs.bind(this));
        
    };

    this.RunDs = function () {
        if (this.Parameter_Count === 0) {
        this.Save(false);
        this.ValidInput === true
        this.Object_String_WithVal = "";
        this.DrawTable();
        }
        else{
        this.Find_parameters();
        this.CreateObjString();
        this.DrawTable();
        }
    };

    this.CallDiffer = function (selected_ver_number, data) {
        var curr_ver = $("#versionNav li.active a").attr("data-verNum");// data-token
        var getNav = $("#versionNav li.active a").attr("href");
        var vername = $(getNav + ' #selected_Ver option:selected').attr("data-tokens");
        var _code = $(getNav + " .code").text();
        this.SetValues();
        if (selected_ver_number > curr_ver) {
            $.post("../Dev/GetDiffer", {
                NewText: data, OldText: _code
            })
       .done(this.showDiff.bind(selected_ver_number, curr_ver, this));
        }
        else {
            $.post("../Dev/GetDiffer", {
                NewText: _code, OldText: data
            })
       .done(this.showDiff.bind(this, curr_ver, selected_ver_number));
        }
    };

    this.showDiff = function (new_ver_num, old_ver_num, data) {
        var getNav = $("#versionNav li.active a").attr("href");
        var verid = $(getNav + ' #selected_Ver option:selected').val();
        //  var vername = $(getNav + ' #selected_Ver option:selected').attr("data-tokens");
        tabNum++;
        $('#versionNav').append("<li><a data-toggle='tab' href='#vernav" + verid + tabNum + "'> v." + old_ver_num + " v/s v." + new_ver_num + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>");
        $('#versionTab').append("<div id='vernav" + verid + tabNum + "' class='tab-pane fade'>");
        $('#vernav' + verid + tabNum).append("<div id='oldtext" + verid + tabNum + "'class='leftPane'>" +
              "</div>" +
              "  <div id='newtext" + verid + tabNum + "' class='rightPane'>" +
              "</div>");
        $("#versionNav a[href='#vernav" + verid + tabNum + "']").tab('show');
        $('.closeTab').off("click").on("click", this.deleteTab.bind(this));
        $('#oldtext' + verid + tabNum).html("<div class='diffHeader'>v." + old_ver_num + "</div>" + data[0]);
        $('#newtext' + verid + tabNum).html("<div class='diffHeader'>v." + new_ver_num + "</div>" + data[1]);
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

    this.GetUsedSqlFns = function (needRun) {
        $.post("../Dev/GetObjects", { obj_type: 5 }, this.FetchUsedSqlFns.bind(this, needRun));
    };

    this.FetchUsedSqlFns = function (needRun, data) {
        this.Rel_object = null;
        var rel_arr = [];
        $.each(data, this.FetchUsedSqlFns_inner.bind(this, rel_arr));
        this.Rel_object = rel_arr.toString();
        //var Dswzd = new EbWizard("../Dev/ds_save", "../Dev/CommitEbDataSource", 400, 500, "Commit", "fa-database", "'" + this.Cid + "'");
        //Dswzd.CustomWizFunc = new CustomCodeEditorFuncs("'" + this.Cid + "'", this.Obj_Id, this.Name, this.Description, this.Code, this.Version_num, this.FilterDId, this.ObjectType, this.Rel_object, needRun).DataSource;
        var _json = { $type: "ExpressBase.Objects.EbDataSource, ExpressBase.Objects", filterdialogid: this.FilterDId, sql: btoa(unescape(encodeURIComponent(this.Code))) }
        $.post("../Dev/CommitEbDataSource", {
            "objtype":this.ObjectType,
            "id":this.Obj_Id,
            "name":this.Name,
            "code": btoa(unescape(encodeURIComponent(this.Code))),            
            "description":this.Description,
            "filterDialogId":this.FilterDId,
            "changeLog":"changed",
            "json": JSON.stringify(_json),
            "rel_obj":this.Rel_object
        });

        $.LoadingOverlay("hide");
    };

    this.FetchUsedSqlFns_inner = function (rel_arr, i, sqlFn) {
        if (this.Code.search(sqlFn.name) !== -1) {
            rel_arr.push(i);
        }
    };

}


var FilterDialog = function () {
    this.Fd_Id;
    this.Fd_Name;
    this.Fd_Description;
    this.ObjectString_WithoutVal;
    this.SelectedFdId = null;

    this.Init = function () {
        this.Fd_Save = $('#saveFilter');
        $(this.Fd_Save).off("click").on("click", this.SaveFilterDialog.bind(this));
    }

    this.SetValues = function () {
        this.Fd_Name = $('#fdname').val();
        this.Fd_Description = $('#fddesc').val();
    }

    this.SaveFilterDialog = function () {
        $.LoadingOverlay("show");
        this.Fd_Id = "0";
        var AllInputs = $('.filter_modal_body').find("input, select");
        var ObjString = "[";
        $.each(AllInputs, function (i, inp) {
            if ($(inp).hasClass("param_val")) {
                //ObjString += '{"' + $(inp).attr("id") + '"' + ':"' + $("#" + $(inp).attr("id")).val() + '"},';
                ObjString += '{\"name\":\"' + $(inp).attr("id") + '\",\"type\":\"' + $("#" + $(inp).attr("id")).val() + '\"},';
            }
        })
        this.ObjectString_WithoutVal = ObjString.slice(0, -1) + ']';

        $.post("../Dev/SaveFilterDialog", {
            "Id": this.Fd_Id,
            "FilterDialogJson": this.ObjectString_WithoutVal,
            "Name": $('#fdname').val(),
            "Description": $('#fddesc').val(),
            "Token": getToken(),
            "isSave": "false",
            "VersionNumber": "1"
        }, this.Save_Success.bind(this));
    }

    this.Save_Success = function (result) {
        this.Success_alert();
        this.SelectedFdId = result;
    }

    this.Success_alert = function (result) {
        $.LoadingOverlay("hide");
    }

    this.Init();
}
