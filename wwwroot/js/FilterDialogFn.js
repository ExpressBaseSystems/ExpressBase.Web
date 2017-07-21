var tabNum = 0;
var DataSource = function (obj_id, is_new, ver_num, cid, type) {
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
    this.FilterDId;
    this.Rel_object;

    this.MyFd = new FilterDialog();

    this.Init = function () {
        this.SaveBtn = $('#save');
        this.CommitBtn = $('#commit');
        this.VersionHistBtn = $('#ver_his');
        this.CloseTabBtn = $('.closeTab');
        this.Fd_DropDown = $('#fd');

        $(this.VersionHistBtn).off("click").on("click", this.VerHistory.bind(this));
        $(this.CloseTabBtn).off("click").on("click", this.deleteTab.bind(this));
        $(this.Fd_DropDown).off("change").on("change", this.SelectFD.bind(this));
        $('#run').off("click").on("click", this.RunDs.bind(this));
        $('#execute0').off("click").on("click", this.Execute.bind(this));
        $('#runSqlFn0').off("click").on("click", this.RunSqlFn.bind(this));
        $('#testSqlFn0').off("click").on("click", this.TestSqlFn.bind(this));

        $('#diff0').off("click").on("click", this.Differ.bind(this));
    }

    this.SetValues = function () {
        this.Code = window.editor.getValue();
        this.Name = $('#obj_name').val();
        this.Description = $('#obj_desc').val();
    }

    this.Success_alert = function (result) {
        $("#loader").hide();
        $('.alert').remove();
        $('.help').append("<div class='alert alert-success alert-dismissable'>" +
    "<a class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
    "<strong>Success!</strong>" +
    "</div>");
        //window.location.reload();
    }

    this.VerHistory = function () {
        $("#loader").show();
        $.post("../Dev/GetVersions",
                          {
                              objid: this.Obj_Id
                          }, this.Version_List.bind(this));
    }

    this.Version_List = function (result) {
        $("#loader").hide();
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
        $("#loader").show();
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
        $('#vernav' + this.Obj_Id + tabNum).append("<div class='col-md-12'>  " +
                   " <a href='#' id='execute" + tabNum + "' data-toggle='tooltip' title='Execute'><i class='btn btn-lg btn-default fa fa-play fa-1x' aria-hidden='true'></i></a>");
        if (this.Is_New === false) {
            $('#vernav' + this.Obj_Id + tabNum).append(
                              "<div class='verlist input-group'>" +
                                  "<select id='selected_Ver' name='selected_Ver' class='selectpicker show-tick form-control' data-live-search='true'>" +
                                  "<option value='Select Version' data-tokens='Select Version'>Select Version</option>")
            $.each(this.Versions, this.VersionCode_drpListItem.bind(this));
            $('#vernav' + this.Obj_Id + tabNum).append("</select>" +
                                 "  <span class='input-group-btn'>" +
                                       " <a href='#' class='diff' id='diff" + tabNum + "' data-toggle='tooltip' title='compare'><i class='btn btn-lg btn-default fa fa-play fa-1x' aria-hidden='true'></i></a>" +
                                   "</span>" +
                            "</div>");
        }
        $('#vernav' + this.Obj_Id + tabNum).append("</div>");
        $('#vernav' + this.Obj_Id + tabNum).append(
         " <div><label class = 'label  codeEditLabel'>Version V." + this.HistoryVerNum + "</label>" +
            " <label class = 'label  codeEditLabel'>ChangeLog: " + this.changeLog + "</label>" +
            "<label  class = 'label  codeEditLabel'>Committed By: " + this.commitUname + " </label>" +
            " <label class = 'label  codeEditLabel'>CommittedAt: " + this.commitTs + "</label>" +
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

        $("#versionNav a[href='#vernav" + this.Obj_Id + tabNum + "']").tab('show');
        $('#diff' + tabNum).off("click").on("click", this.Differ.bind(this));
        $('#execute' + tabNum).off("click").on("click", this.Execute.bind(this));
        $("#loader").hide();
        setTimeout(function () {
            window.editor.refresh();
        }, 500);
        $('.selectpicker').selectpicker({
            //style: 'btn-info',
            size: 4
        });

    };

    this.deleteTab = function (e) {
        var tabContentId = $(e.target).parent().attr("href");
        $(e.target).parent().parent().remove(); //remove li of tab
        $(tabContentId).remove();
        $('#versionNav a:last').tab('show'); // Select first tab        
    };

    this.SelectFD = function () {
        var selectVal = $('#fd option:selected').text();
        if (selectVal === "Auto Generate Filter Dialog") {
            this.Find_parameters();
            if (this.Parameter_Count !== 0) {
                $('.fdthead').children().remove();
                $('.fdthead').append(" <tr>" +
                        "<th>Parameter Name</th>" +
                        "<th>Parameter Type</th>" +
                " </tr>");
                $('#fdtbody').children().remove();
                $.each(this.Filter_Params, function (i, obj) {
                    $('#fdtbody').append("<tr><td><label class='align_singleLine'>" + obj + "</label>" +
                                          "  </td>" +
                                           " <td>" +
                                            "    <select id=" + obj + " name='fdtype' class='param_val selectpicker show-tick align_singleLine' data-live-search='true' style='display:inline-block !important'>" +
                                             "       <option value='text' data-tokens='text'>text</option>' " +
                                             "       <option value='integer' data-tokens='integer'>integer</option>" +
                                               "     <option value='datetime' data-tokens='datetime'>datetime</option>" +
                                                 "   <option value='boolean' data-tokens='boolean'>boolean</option>" +
                                                "</select>" +
                                           " </td>" +
                                       " </tr>");
                });

                $('#filterDialog').modal('show');
                $('#run').hide();
                $('#saveFilter').show();
            }
            else {
                alert("no filters ");
                $("#loader").hide();
            }
        }
    }

    this.Execute = function () {
        $("#loader").show();
        this.SetValues();
        if ($('#fd option:selected').text() === "Select Filter Dialog") {
            alert("Please select a filter dialog");
            $("#loader").hide();
        }
        else if ($('#fd option:selected').text() !== "Auto Generate Filter Dialog") {
            this.Save(false);
            this.SelectedFdId = $('#fd option:selected').val();
            this.Load_Fd();
        }
        else {//auto generate
            this.Save(false);
            this.Find_parameters();
            if (this.Parameter_Count === 0) {
                this.ValidInput = true;
                this.Object_String_WithVal = "";
                this.DrawTable();
            }
        }

    }

    this.RunSqlFn = function () {
        $("#loader").show();
        this.SetValues();
        if ($('#fd option:selected').text() === "Select Filter Dialog") {
            alert("Please select a filter dialog");
            $("#loader").hide();
        }
        else if ($('#fd option:selected').text() === "Auto Generate Filter Dialog") {
            this.Save(true);
            //create fd
            alert("create fd");
        }
        this.Save(true);
    }

    this.TestSqlFn = function () {
        $("#loader").show();
        alert("Test");
    }

    this.RunDs = function () {
        this.Find_parameters();
        this.CreateObjString();
        this.DrawTable();
    }

    this.Differ = function () {
        $("#loader").show();
        var getNav = $("#versionNav li.active a").attr("href");
        alert(getNav);
        var verid = $(getNav + ' #selected_Ver option:selected').val();
        alert(verid);
        var ver_number = $(getNav + ' #selected_Ver option:selected').attr("data-tokens");
        alert(ver_number);
        if (verid === "Select Version") {
            alert("Please Select A Version");
        }
        else {
            $.post('../Dev/VersionCodes', { "objid": verid })
               .done(this.CallDiffer.bind(this, ver_number));
        }
    }

    this.Init();

    this.Save = function (needRun) {
        this.SetValues();
        alert('save');
        if (this.Is_New === true) {
            this.Commit(needRun);
        }
        else {
            $(".eb-loader").show();
            this.FilterDId = $('#fd option:selected').val();
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
        $("#loader").show();
        $('.alert').remove();
        alert('commit');

        this.SetValues();
        if (this.ObjectType === 5) {
            this.SetSqlFnName();
        }
        if ($('#fd option:selected').text() === "Select Filter Dialog") {
            alert("Select A Filter Dialog");
        }
        else {
            this.SetValues();
            this.FilterDId = $('#fd option:selected').val();
            this.GetUsedSqlFns(needRun);
        }
        $("#loader").hide();
    }

    $(this.SaveBtn).off("click").on("click", this.Save.bind(this));
    $(this.CommitBtn).off("click").on("click", this.Commit.bind(this,false));

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
        var ObjString = "[";
        var name;
        var value;
        var type;
        $('.filter_modal_body tbody tr').each(function () {
            $(this).find("td label, select, input").each(function () {
                $(this).removeClass('has-error');
                if ($(this).hasClass("param_val")) {
                    if ($(this).hasClass("param_type")) {
                        //ObjString +='\"type\":\"'+  $(this).text()+'\",';
                        ObjString += '\"type\":\"5\",';
                    }
                    if ($(this).hasClass("param_name")) {
                        ObjString += '{\"name\":\"' + $(this).text() + '\",';
                    }
                    if ($(this).hasClass("param_value")) {
                        if (!$(this).val()) {
                            $(this).addClass('has-error');
                            this.ValidInput = false;
                        }
                        ObjString += '\"value\":\"' + $(this).val() + '\"},';
                    }
                }
            });
        });
        ObjString = ObjString.slice(0, -1) + ']';
        this.Object_String_WithVal = ObjString;
    }

    this.DrawTable = function () {
        $(".eb-loader").show();
        tabNum++;
        Fd_Name = $('#fdname').val();
        $('#versionNav').append("<li><a data-toggle='tab' href='#vernav" + Fd_Name + tabNum + "'>Result-" + Fd_Name + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>");
        $('#versionTab').append("<div id='vernav" + Fd_Name + tabNum + "' class='tab-pane fade'>");
        $('#vernav' + Fd_Name + tabNum).append("  <div class=' filter_modal_body'>" +
                  "<table class='table table-striped table-bordered' id='sample" + tabNum + "'></table>" +
              "</div>");
        $('.closeTab').off("click").on("click", this.deleteTab.bind(this));
        if (this.ValidInput === true) {
            $.post('GetColumns4Trial', {
                dsid: this.Obj_Id,
                parameter: this.Object_String_WithVal
            }, this.Load_Table_Columns.bind(this));
        }
        else {
            alert('not valid');
        }

        $("#versionNav a[href='#vernav" + Fd_Name + tabNum + "']").tab('show');
    };

    this.Load_Table_Columns = function (result) {
        if (result === "") {
            $('#filterDialog').modal('hide');
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
                ajax: {
                    url: "https://expressbaseservicestack.azurewebsites.net/ds/data/" + this.Obj_Id,
                    type: "POST",
                    data: this.Load_tble_Data.bind(this),
                    dataSrc: function (dd) { return dd.data; },
                }
            });
            $(".eb-loader").hide();
            $('#filterDialog').modal('hide');
        }
    };

    this.Load_tble_Data = function (dq) {
        delete dq.columns; delete dq.order; delete dq.search;
        dq.Id = this.Obj_Id;
        dq.Token = getToken();
        //dq.rToken = getrToken();
        dq.TFilters = [];
        dq.Params = this.Object_String_WithVal;
    };

    this.Load_Fd = function () {
        $.post("../Dev/GetByteaEbObjects_json", { "ObjId": this.SelectedFdId, "Ebobjtype": "FilterDialog" },
        function (result) {
            $('#fdtbody').children().remove();
            $('.fdthead').children().remove();
            $('.fdthead').append(" <tr>" +
                                           "<th>Parameter Name</th>" +
                                           "<th>Parameter Type</th>" +
                                          "<th>Parameter Value</th>" +
                   " </tr>");

            for (var key in result) {
                $('#fdname').val(result[key].name);
                $('#fddesc').val(result[key].description);
                var fdjson = result[key].filterDialogJson;
                $.each(JSON.parse(fdjson), function (i, fdj) {
                    $('#fdtbody').append("<tr><td><label class='param_val align_singleLine param_name'>" + fdj.name + "</label>" +
                                          "  </td>" +
                                          "<td><label class='param_val align_singleLine param_type'>" + fdj.type + "</label>" +
                                        " </td>" +
                                           " <td> <input type='text' name=" + fdj.name + " class='param_val param_value align_singleLine form-control' required/> </td>" +
                                       " </tr>");
                });
            }
            $('#filterDialog').modal('show');
            $(".eb-loader").hide();
            $('#saveFilter').hide();
            $('#run').show();
        });
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
       .done(this.showDiff.bind(curr_ver, selected_ver_number, this));
        }
    };

    this.showDiff = function (new_ver_num, old_ver_num, data) {
        var getNav = $("#versionNav li.active a").attr("href");
        var verid = $(getNav + ' #selected_Ver option:selected').val();
        alert("new_ver_num=" + new_ver_num + "   old_ver_num=" + old_ver_num + " verid=" + verid);
        //  var vername = $(getNav + ' #selected_Ver option:selected').attr("data-tokens");
        tabNum++;
        $('#versionNav').append("<li><a data-toggle='tab' href='#vernav" + verid + tabNum + "'> v." + old_ver_num + " v/s v." + new_ver_num + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>");
        $('#versionTab').append("<div id='vernav" + verid + tabNum + "' class='tab-pane fade'>");
        $('#vernav' + verid + tabNum).append("<div id='oldtext" + verid + tabNum + "'class='leftPane'>" +
              "</div>" +
              "  <div id='newtext" + verid + tabNum + "' class='rightPane'>" +
              "</div>");

        $('.closeTab').off("click").on("click", this.deleteTab.bind(this));
        $("#versionNav a[href='#vernav" + verid + tabNum + "']").tab('show');
        $('#oldtext' + verid + tabNum).html("<div class='diffHeader'>v." + old_ver_num + "</div>" + data[0]);
        $('#newtext' + verid + tabNum).html("<div class='diffHeader'>v." + new_ver_num + "</div>" + data[1]);
        $("#loader").hide();
    };

    this.SetSqlFnName = function () {
        var result = this.Code.match(/create\s*FUNCTION\s*|create\s*or\s*replace\s*function\s*(.[\s\S]*?\))/i);
        if (result.length > 0) {
            var fnName = result[1].replace(/\s\s+/g, ' ');
            // var open_brace=fnName.indexOf("(");
            var x = fnName.replace('(',"_v" + this.Version_num+'(');
            var v = this.Code.replace(result[1], x);
            alert(v);
            $('#obj_name').val(x);
            $('#code').val(v);
            // window.editor = CodeMirror.fromTextArea(document.getElementById("code"));
            //CodeMirror.fromTextArea(document.getElementById('code'), {
            //    lineNumbers: true
            //}).empty().setValue(v);
            editor.setValue(v);
        }
    };

    this.GetUsedSqlFns = function (needRun) {
        $.post("../Dev/GetObjects", { obj_type: 5 }, this.FetchUsedSqlFns.bind(this,needRun));
    };

    this.FetchUsedSqlFns = function (needRun,data) {
        this.Rel_object = null;
        var rel_arr = [];
        $.each(data, this.FetchUsedSqlFns_inner.bind(this, rel_arr));
        this.Rel_object = rel_arr.toString();
        alert("this.Rel_object" + this.Rel_object);
        var Dswzd = new EbWizard("../Dev/ds_save", "../Dev/CommitEbDataSource", 400, 500, "Commit", "fa-database", "'" + this.Cid + "'");
        Dswzd.CustomWizFunc = new CustomCodeEditorFuncs("'" + this.Cid + "'", this.Obj_Id, this.Name, this.Description, this.Code, this.Version_num, this.FilterDId, this.ObjectType, this.Rel_object, needRun).DataSource;
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
        $(".eb-loader").show();
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
        $(".eb-loader").hide();
        $('.alert').remove();
        $('.help').append("<div class='alert alert-success alert-dismissable'>" +
    "<a class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
    "<strong>Success!</strong>" +
    "</div>");
    }

    this.Init();
}
