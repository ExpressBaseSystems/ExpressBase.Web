//var tabNum = 0;
var DataSourceWrapper = function (refid, ver_num, type, dsobj, cur_status, tabNum) {
    this.Code;
    this.ObjectType = type;
    this.Versions;
    this.Refid = refid;
    this.changeLog;
    this.commitUname;
    this.commitTs;
    this.Object_String_WithVal;
    this.Filter_Params;
    this.Parameter_Count;
    this.SelectedFdId;
    this.Rel_object;
    this.rel_arr = [];

    this.EbObject = dsobj;
    this.propGrid = new Eb_PropertyGrid("dspropgrid" + tabNum);

    this.Init = function () {
        $('#execute' + tabNum).off("click").on("click", this.Execute.bind(this));
        $('#runSqlFn0').off("click").on("click", this.RunSqlFn.bind(this));
        $('#testSqlFn0').off("click").on("click", this.TestSqlFn.bind(this));
        $('#codewindow' + tabNum + ' .CodeMirror textarea').keypress(this.SetCode.bind(this));
        $(".selectpicker").selectpicker();

        if (this.EbObject === null) {
            this.EbObject = new EbObjects["EbDataSource"]("EbDataSource1");
        }

        this.propGrid.setObject(this.EbObject, AllMetas["EbDataSource"]);
        this.Name = this.EbObject.Name;

    }
    
    this.SetCode = function (e) {
        alert($(e.target));
        alert($(e.target).getValue());
        this.Current_obj.Sql = $(e.target).getValue();
    };

    this.propGrid.PropertyChanged = function (obj, pname) {
        this.EbObject = obj;
        if (pname === "FilterDialogRefId") {
            $('#paramdiv' + tabNum + ' #filterBox').remove();
            $('#paramdiv' + tabNum).show();
            $('#codewindow' + tabNum).removeClass("col-md-10");
            $('#codewindow' + tabNum).addClass("col-md-8");

            $.post("../CE/GetFilterBody", { "ObjId": obj.FilterDialogRefId },
                function (result) {
                    $('#paramdiv' + tabNum).append(result);
                    $.LoadingOverlay("hide");
                });
        }
    }.bind(this);

    this.AddVerNavTab = function (navitem, tabitem) {
        $("#versionNav a[href='#vernav" + tabNum + "']").tab('show');
        $('#versionNav').append(navitem);
        $('#versionTab').append(tabitem);
        $("#versionNav a[href='#vernav" + tabNum + "']").tab('show');
        $('.closeTab').off("click").on("click", this.deleteTab.bind(this));       
    }
   
    this.deleteTab = function (e) {
        var tabContentId = $(e.target).parent().attr("href");
        $(e.target).parent().parent().remove(); //remove li of tab
        $(tabContentId).remove();
        $('#versionNav a:last').tab('show'); // Select first tab        
    };
    

    //this.VersionCode_drpListItem = function (i, version) {
    //    var vnum = version.versionNumber;
    //    $('#vernav' + tabNum + " select").append("<option value='" + version.id + "' data-tokens='" + vnum + "'> v " + version.versionNumber + "</option>");
    //};

    this.Execute = function () {
        if (!$('#execute' + tabNum).hasClass('collapsed')) {
            //dasdsd
        }
        else {
            this.Find_parameters(false, false, false);
            $.LoadingOverlay("show");
            if (this.Parameter_Count !== 0 && $('#fd' + tabNum + ' option:selected').text() === "Select Filter Dialog") {
                alert("Please select a filter dialog");
                $.LoadingOverlay("hide");
            }
            else if (this.Parameter_Count === 0) {
                $.LoadingOverlay("hide");
                var getNav = $("#versionNav li.active a").attr("href");
            }
            else {
                this.Find_parameters(false, false, false);
                // this.Save(false);
                this.SelectedFdId = $('#fd' + tabNum + ' option:selected').val();
                this.Load_Fd();
            }
        }
    }

    this.RunSqlFn = function () {
        $.LoadingOverlay("show");
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

   
    

    this.Save = function (needRun) {
        $.LoadingOverlay("show");
        if (this.ObjectType === 5) {
            this.SetSqlFnName();
        }
        this.Find_parameters(true, true, needRun);
    };

    this.Commit = function (needRun) {
        $.LoadingOverlay("show");
        if (this.ObjectType === 5) {
            this.SetSqlFnName();
        }
        this.Find_parameters(true, false, needRun);
    }
    
    this.Find_parameters = function (isCommitorSave, issave, needRun) {
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
            if (this.Parameter_Count !== 0 && ($('#fd' + tabNum + ' option:selected').text() === "Select Filter Dialog")) {
                if (confirm('Are you sure you want to save this without selecting a filter dialog?')) {
                    this.GetUsedSqlFns(needRun, issave);
                }
                else {
                    $.LoadingOverlay("hide");
                }
            }
            else {
                this.GetUsedSqlFns(needRun, issave);
            }
        }
    }

    this.CreateObjString = function () {
        if (this.Parameter_Count !== 0) {
            var ObjString = "[";
            var filter_control_list = "datefrom,dateto";
            var myarray = filter_control_list.split(',');
            for (var i = 0; i < myarray.length; i++) {
                console.log($("#" + myarray[i]).val());
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
        }
        else {
            this.Object_String_WithVal = null;
        }
        console.log("Object_String_WithVal" + this.Object_String_WithVal);
    }

    this.DrawTable = function () {
        $.LoadingOverlay("show");
        tabNum++;
        var navitem = "<li><a data-toggle='tab' href='#vernav" + tabNum + "'>Result-" + this.Current_obj.Name + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + tabNum + "' class='tab-pane fade'>";
        this.AddVerNavTab(navitem, tabitem);
        $('#vernav' + tabNum).append(" <div class=' filter_modal_body'>" +
            "<table class='table table-striped table-bordered' id='sample" + tabNum + "'></table>" +
            "</div>");
        $.post('GetColumns4Trial', {
            ds_refid: this.ver_Refid,
            parameter: this.Object_String_WithVal
        }, this.Load_Table_Columns.bind(this));
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
                    url: "http://localhost:8000/ds/data/" + this.ver_Refid,
                    type: "POST",
                    data: this.Load_tble_Data.bind(this),
                    crossDomain: true,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", "Bearer " + getToken());
                    },
                    dataSrc: function (dd) { return dd.data; },
                }
            });

            $("#versionNav a[href='#vernav" + tabNum + "']").tab('show');
            $.LoadingOverlay("hide");
        }
    };

    this.Load_tble_Data = function (dq) {
        delete dq.columns; delete dq.order; delete dq.search;
        dq.RefId = this.ver_Refid;
        dq.TFilters = [];
        dq.Params = this.Object_String_WithVal;
        return dq;
    };

    this.Load_Fd = function () {
        var getNav = $("#versionNav li.active a").attr("href");
        if ($(getNav + ' #inner_well' + tabNum).children().length === 0) {
            $.post("../CE/GetFilterBody", { "ObjId": this.SelectedFdId },
                function (result) {
                    $(getNav + ' #inner_well' + tabNum).append(result);

                }, $.LoadingOverlay("hide"));
        }
        else {
            $.LoadingOverlay("hide");
        }
    };

    this.RunDs = function () {
        $.LoadingOverlay("show");
        if (this.Parameter_Count === 0) {
            this.Save(false);
            this.Object_String_WithVal = "";
            // this.DrawTable();
        }
        else {
            this.Find_parameters(true, true, true);
        }
    };


    $("#run").off("click").on("click", this.RunDs.bind(this));

    this.SetSqlFnName = function () {
        var result = this.Code.match(/create\s*FUNCTION\s*|create\s*or\s*replace\s*function\s*(.[\s\S]*?\))/i);
        if (result.length > 0) {
            var fnName = result[1].replace(/\s\s+/g, ' ');
            var x = fnName.replace('(', "_v" + this.Current_obj.versionNumber + '(');
            var v = this.Code.replace(result[1], x);
            $('#obj_name').val(x);
            $('#code' + tabNum).val(v);
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
        var filter_dialog_refid = $(getNav + ' #fdlist' + tabNum + ' #fd' + tabNum + ' option:selected').val();

        if (filter_dialog_refid === "Select Filter Dialog") {
            filter_dialog_refid = null;
        }
        this.rel_arr.push(filter_dialog_refid);
        this.Rel_object = this.rel_arr.toString();
        this.EbObject.Sql = btoa(this.Code);
        var tagvalues = $('#tags').val();
        if (issave === true) {
            $.post("../Eb_ObjectController/SaveEbObject",
                {
                    "Id": this.ver_Refid,
                    "json": JSON.stringify(this.Current_obj),
                    "rel_obj": "",
                    "tags": tagvalues
                }, this.CallDrawTable.bind(this, needRun));
        }
        else {

            $.post("../Eb_ObjectController/CommitEbObject", {
                "id": this.ver_Refid,
                "changeLog": this.changeLog,
                "json": JSON.stringify(this.Current_obj),
                "rel_obj": this.Rel_object,
                "tags": tagvalues
            }, this.CallDrawTable.bind(this, needRun));
        }

    };

    this.CallDrawTable = function (needRun, result) {
        if (needRun === true) {
            var getNav = $("#versionNav li.active a").attr("href");
            this.ver_Refid = $(getNav).attr("data-id");
            if (this.ver_Refid === "new") {
                this.ver_Refid = result.refId;
                alert(this.ver_Refid);
            }
            this.CreateObjString();
            this.DrawTable();
        }
        alert("Success");
        $("#close_popup").click();
        $.LoadingOverlay("hide");
    };

    this.FetchUsedSqlFns_inner = function (i, sqlFn) {
        if (this.Code.indexOf(sqlFn.name) !== -1) {
            this.rel_arr.push(i);
        }
    };

    this.Init();
}