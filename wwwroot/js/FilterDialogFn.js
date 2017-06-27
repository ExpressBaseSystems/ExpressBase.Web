var DataSource = function (obj_id, is_new, ver_num, cid) {
    this.Obj_Id = obj_id;
    this.Name;
    this.Description;
    this.Code;
    this.Is_New = is_new;
    this.Version_num = ver_num;
    this.Cid = cid;
    this.CommitBtn;
    this.SaveBtn;
    this.Fd_DropDown;
    this.VersionHistBtn;
    this.Versions;
    this.var_id
    // this.openPrevVersions;

    this.Init = function () {
        this.SaveBtn = $('#save');
        this.CommitBtn = $('#commit');
        this.VersionHistBtn = $('#ver_his');
        //this.openPrevVersions = $('.view_code');

        $(this.SaveBtn).off("click").on("click", this.Save.bind(this));
        $(this.CommitBtn).off("click").on("click", this.Commit.bind(this));
        $(this.VersionHistBtn).off("click").on("click", this.VerHistory.bind(this));
        //$(this.openPrevVersions).off("click").on("click", this.OpenPrevVer.bind(this));

        var MyFd = new FilterDialog(this.Obj_Id);
    }

    this.SetValues = function () {
        this.Code = window.editor.getValue();
        this.Name = $('#obj_name').val();
        this.Description = $('#obj_desc').val();
    }

    this.Save = function () {
        this.SetValues();
        alert('save');
        if (this.Is_New === true) {
            $(".commit").trigger("click");
        }
        else {
            $(".eb-loader").show();
            $.post("http://dev.eb_roby_dev.localhost:53431/Tenant/SaveEbDataSource",
                {
                    "Id": this.Obj_Id,
                    "Code": this.Code,
                    "Name": this.Name,
                    "Description": this.Description,
                    "Token": getToken(),
                    "isSave": "true",
                    "VersionNumber": this.Version_num
                }, this.Success_alert.bind(this));
        };
    }

    this.Commit = function () {
        $(".eb-loader").show();
        this.SetValues();
        if (this.Obj_Id === 0) {
            $.post("http://dev.eb_roby_dev.localhost:53431/Tenant/CommitEbDataSource",
                   {
                       "Id": this.Obj_Id,
                       "Code": this.Code,
                       "Name": this.Name,
                       "Description": this.Description,
                       "Token": getToken(),
                       "isSave": "true",
                       "VersionNumber": this.Version_num
                   }, this.Success_alert.bind(this));
        }
        var Dswzd = new EbWizard("http://dev.eb_roby_dev.localhost:53431/Tenant/ds_save", "http://dev.eb_roby_dev.localhost:53431/Tenant/CommitEbDataSource", 400, 500, "Commit", "fa-database", "'" + this.Cid + "'");
        Dswzd.CustomWizFunc = new CustomCodeEditorFuncs("'" + this.Cid + "'", this.Obj_Id, this.Name, this.Description, this.Code, this.Version_num).DataSource;

    }

    this.Success_alert = function (result) {
        $(".eb-loader").hide();
        $('.alert').remove();
        $('.help').append("<div class='alert alert-success alert-dismissable'>" +
    "<a class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
    "<strong>Success!</strong>" +
    "</div>");
    }

    this.VerHistory = function () {
        $(".eb-loader").show();
        $.post("http://dev.eb_roby_dev.localhost:53431/Tenant/GetVersions",
                          {
                              "Id": this.Obj_Id
                          }, this.Version_List.bind(this));
    }

    this.Version_List = function (result) {
        $(".eb-loader").hide();
        this.Versions = result;
        $('#vertbody').children().remove();
        $.each(this.Versions, function (i, obj) {
            $('#vertbody').append("<tr>" +
                                       "<td>" + obj.versionNumber + "</td> " +
                                       "<td>" + obj.changeLog + "</td> " +
                                       "<td>" + obj.commitUname + "</td> " +
                                       "<td>" + obj.commitTs + "</td> " +
                                        "<td><input type='button' class='view_code' value='View' data-id=" + obj.id + "></td>" +
                                 " </tr>");
        });

        $('#versionHist').modal('show');
        $('.view_code').off("click").on("click", this.OpenPrevVer.bind(this));
    }

    this.OpenPrevVer = function (e) {
        this.var_id = $(e.target).attr("data-id");
        // window.open("'http://dev.eb_roby_dev.localhost:53431/Tenant/VersionCodes?objid=' + var_id",'_blank');
        $('#versionHist').modal('hide');
        $.post("http://dev.eb_roby_dev.localhost:53431/Tenant/VersionCodes",
                             {
                                 "objid": this.var_id
                             }); //this.Version_List.bind(this));
    }

    this.Init();
}


var FilterDialog = function (obj_id) {
    this.Fd_Id;
    this.Fd_Name;
    this.Fd_Description;
    this.Code;
    this.Ds_id = obj_id;
    this.Object_String_WithVal;
    this.ObjectString_WithoutVal;
    this.ValidInput = true;
    this.Parameter_Count;
    this.Filter_Params;
    this.SelectedFdId;

    this.Init = function () {
        this.Fd_DropDown = $('#fd');
        this.Fd_Save = $('#saveFilter');
        this.ExecBtn = $('#execute');
        this.RunBtn = $('#run');

        $(this.Fd_DropDown).off("change").on("change", this.SelectFD.bind(this));
        $(this.Fd_Save).off("click").on("click", this.SaveFilterDialog.bind(this));
        $(this.ExecBtn).off("click").on("click", this.Execute.bind(this));
        $(this.RunBtn).off("click").on("click", this.RunDs.bind(this));
    }

    this.SetValues = function () {
        this.Code = window.editor.getValue();
        this.Fd_Name = $('#fdname').val();
        this.Fd_Description = $('#fddesc').val();
    }

    this.SelectFD = function () {
        this.SetValues();
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
            }
        }
    }

    this.Find_parameters = function () {
        var result = this.Code.match(/\@\w+/g);
        var filterparams = [];
        if (result.length > 0) {
            for (var i = 0; i < result.length; i++) {
                result[i] = result[i].substr(1);
                if (result[i] === "search" || result[i] === "and_search" || result[i] === "search_and" || result[i] === "where_search" || result[i] === "limit" || result[i] === "offset" || result[i] === "orderby") {
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

        $.post("http://dev.eb_roby_dev.localhost:53431/Tenant/SaveFilterDialog", {
            "Id": this.Fd_Id,
            "DsId": this.Ds_id,
            "FilterDialogJson": this.ObjectString_WithoutVal,
            "Name": $('#fdname').val(),
            "Description": $('#fddesc').val(),
            "Token": getToken(),
            "isSave": "false",
            "VersionNumber": "1"
        }, this.Save_Success.bind(this));
    }

    this.Load_Fd = function () {
        $.post("http://dev.eb_roby_dev.localhost:53431/Tenant/GetByteaEbObjects_json", { "ObjId": this.SelectedFdId, "Ebobjtype": "FilterDialog" },
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
            $('#saveFilter').hide();
            $('#run').show();
        });
    }

    this.RunDs = function () {
        this.Find_parameters();
        this.CreateObjString();
        this.DrawTable();
    }

    this.Execute = function () {
        $(".eb-loader").show();
        this.SetValues();
        this.Find_parameters();
        if (this.Parameter_Count === 0) {
            this.ValidInput = true;
            this.Object_String_WithVal = "";
            this.DrawTable();
        }
        else if ($('#fd option:selected').text() === "Select Filter Dialog") {
            alert("Please select a filter dialog");
        }
        else if ($('#fd option:selected').text() !== "Auto Generate Filter Dialog") {
            this.SelectedFdId = $('#fd option:selected').val();
            this.Load_Fd();
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
        alert('this.Object_String_WithVal' + this.Object_String_WithVal);
    }

    this.DrawTable = function () {
        if (this.ValidInput === true) {
            $.post('GetColumns4Trial', {
                dsid: this.Ds_id,
                parameter: this.Object_String_WithVal
            }, this.Load_Table_Columns.bind(this));
        }
        else {
            alert('not valid');
        }
    }

    this.Load_Table_Columns = function (result) {
        if (result === "") {
            $('#filterDialog').modal('hide');
            alert('Error in Query');
        }
        else {
            console.log(cols);
            var cols = JSON.parse(result);
            $("#sample").dataTable({
                columns: cols,
                serverSide: true,
                lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
                scrollX: "100%",
                scrollY: "300px",
                ajax: {
                    url: "https://expressbaseservicestack.azurewebsites.net/ds/data/" + this.Ds_id,
                    type: "POST",
                    data: this.Load_tble_Data.bind(this),
                    dataSrc: function (dd) { return dd.data; },
                }
            });
            $(".eb-loader").hide();
            $('#filterDialog').modal('hide');
            $('#filterRun').modal('show');
        }
    }

    this.Load_tble_Data = function (dq) {
        delete dq.columns; delete dq.order; delete dq.search;
        dq.Id = this.Ds_id;
        dq.Token = getToken();
        //dq.rToken = getrToken();
        dq.TFilters = [];
        dq.Params = this.Object_String_WithVal;
    }

    this.Save_Success = function (result) {
        this.Success_alert();
        this.SelectedFdId = result;
        this.Load_Fd();
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
