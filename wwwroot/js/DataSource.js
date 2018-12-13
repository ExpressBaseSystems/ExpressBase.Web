//var tabNum = 0;
var DataSourceWrapper = function (refid, ver_num, type, dsobj, cur_status, tabNum, ssurl) {
    this.Code;
    this.ObjectType = type;
    this.Versions;
    this.Refid = refid;
    this.relatedObjects;
    this.FilterDialogRefId;
    this.rel_arr = [];
    this.Filter_Params;
    this.Parameter_Count;
    this.Object_String_WithVal;
    //this.FD = false;
    this.Ssurl = ssurl;
    this.delay = 300;

    const _DataReader = "DataReader";
    const _DataWriter = "DataWriter";
    const _SqlFunction = "SqlFunction";
    const _SqlFuncSyntax = `CREATE OR REPLACE FUNCTION function_name 
    (parameter_name[IN | OUT | IN OUT]type [, ...])

    RETURN return_datatype
    { IS | AS }

    BEGIN

        <function_body>

    END[function_name];`;

    this.EbObject = dsobj;
    commonO.Current_obj = this.EbObject;
    this.Sql = null;
    //this.propGrid = new Eb_PropertyGrid("dspropgrid" + tabNum);

    this.propGrid = new Eb_PropertyGrid({
        id: "dspropgrid" + tabNum,
        wc: this.wc,
        cid: this.cid,
        $extCont: $(".ds-prop"),
        $scope: $(".adv-dsb-cont")
    });

    this.toggleBuilder = function (e) {
        var $e = $(e.target).closest("button");
        var stat = $e.attr("state");
        var $simpleSec = $(".simple-dsb-cont");
        var $advSec = $(".adv-dsb-cont");
        if (stat === "simple") {
            $e.attr("state", "advanced")
            $simpleSec.hide(this.delay);
            $advSec.show(this.delay);

            $simpleSec.animate({});
        }
        else {
            if ($e.attr("is-edited") === "true")
                return;
            $e.attr("state", "simple")
            $simpleSec.show(this.delay);
            $advSec.hide(this.delay);
        }
    };

    this.Init = function () {
        let dsType = "";
        //$('#execute' + tabNum).off("click").on("click", this.Execute.bind(this));
        //$('#runSqlFn0').off("click").on("click", this.RunSqlFn.bind(this));
        //$('#testSqlFn0').off("click").on("click", this.TestSqlFn.bind(this));
        $('#codewindow' + tabNum + ' .CodeMirror textarea').bind('paste', (this.SetCode.bind(this)));
        $('#codewindow' + tabNum + ' .CodeMirror textarea').keyup(this.SetCode.bind(this));
        $(".selectpicker").selectpicker();

        if (this.ObjectType === 2)
            dsType = _DataReader;
        else if (this.ObjectType === 4)
            dsType = _DataWriter;
        else if (this.ObjectType === 5)
            dsType = _SqlFunction;

        if (this.EbObject === null) {
            this.EbObject = new EbObjects["Eb" + dsType](dsType + "1");
            commonO.Current_obj = this.EbObject;
            if (this.ObjectType === 5)
                this.EbObject.Sql = btoa(_SqlFuncSyntax);
            // this.FD = false;
        }
        else {
            if (this.EbObject.FilterDialogRefId !== "") {
                //this.FD = true;
                var callback = true;
                this.GetFD(callback);
            }
        }

        this.propGrid.setObject(this.EbObject, AllMetas["Eb" + dsType]);
        this.GenerateButtons();
        this.Name = this.EbObject.Name;
        window["editor" + tabNum].setValue(atob(this.EbObject.Sql));
        //$(".toolbar .toolicons").prepend(`<button class='btn ds-builder-toggle' is-edited='false' state='simple' id= 'ds-builder-toggle' data-toggle='tooltip' data-placement='bottom' title= 'Switch to advanced editor'> <i class='fa fa-share' aria-hidden='true'></i></button >`);
        //$('.ds-builder-toggle').on("click", this.toggleBuilder.bind(this));
        if (this.ObjectType === 4) {
            $("#paramsModal-toggle").on("show.bs.modal", this.getInputParams.bind(this));
            $("#parmSetupSave").off("click").on("click", this.SaveParamsetup.bind(this));
        }
    }

    this.SaveParamsetup = function (ev) {
        for (let i = 0; i < this.InputParams.length; i++) {
            this.InputParams[i].Type = eval($(`select[name="${this.InputParams[i].Column}-DBTYPE"]`).val());
            this.InputParams[i].Value = $(`input[name="${this.InputParams[i].Column}-VLU"]`).val();
        }
        this.EbObject.InputParams.$values = this.InputParams;
    };

    this.getInputParams = function () {
        if (this.Sql !== window["editor" + tabNum].getValue().trim()) {
            this.Sql = window["editor" + tabNum].getValue().trim();
            $.ajax({
                type: 'GET',
                url: "../CE/DataWriterSqlEval",
                data: { "sql": this.Sql },
                beforeSend: function () {
                }
            }).done(function (data) {
                this.InputParams = JSON.parse(data);
                this.AppendInpuParams();
                this.setValues();
            }.bind(this));
        }
    };

	this.setValues = function () {
		for (let i = 0; i < this.EbObject.InputParams.$values.length; i++) {
			$(`select[name="${this.EbObject.InputParams.$values[i].Column}-DBTYPE"]`).val(this.EbObject.InputParams.$values[i].Type);
			$(`input[name="${this.EbObject.InputParams.$values[i].Column}-VLU"]`).val(this.EbObject.InputParams.$values[i].Value);
		}
	};

    this.AppendInpuParams = function () {
        $("#paraWinTab_" + tabNum + " tbody").empty();
        for (let i = 0; i < this.InputParams.length; i++) {
            $("#paraWinTab_" + tabNum + " tbody").append(`<tr>
                            <td>${this.InputParams[i].Column}</td>
                            <td>
                                <select name="${this.InputParams[i].Column}-DBTYPE" class="form-control">
                                    ${this.setDbType()}
                                </select>
                            </td>
                            <td><input type="text" name="${this.InputParams[i].Column}-VLU" class="form-control"/></td>
                        </tr>`);
        }
    };

    this.setDbType = function () {
        let d = [];
        for (let k in EbDbType) {
            d.push(`<option value="${EbDbType[k]}">${k}</option>`);
        }
        return d.join(",");
    };

    this.GenerateButtons = function () {
        $("#obj_icons").empty();
        $("#obj_icons").append(`
            <button class='btn run' id= 'run' data-toggle='tooltip' data-placement='bottom' title= 'Run'> <i class='fa fa-play' aria-hidden='true'></i></button >
            `);

        $("#run").off("click").on("click", this.RunDs.bind(this));
        if (this.ObjectType === 4)
            $("#obj_icons").append(`<button class="btn" data-toggle="modal" data-target="#paramsModal-toggle">P</button>`);

        //$(".adv-dsb-cont").hide(this.delay);
        $(".simple-dsb-cont").hide(this.delay);
        //$("#btnToggleFD").off("click").on("click", this.ToggleFD.bind(this));
    }

    this.SetCode = function (e) {
        try {
            this.EbObject.Sql = btoa(window["editor" + tabNum].getValue());
            $('#save').removeClass('disabled');
            $('#commit_outer').removeClass('disabled');
        }
        catch (err) {
            alert(err.message);
            $('#save').addClass('disabled');
            $('#commit_outer').addClass('disabled');
        }
        // commonO.Current_obj = this.EbObject;
    };

    this.propGrid.PropertyChanged = function (obj, pname) {
        this.EbObject = obj;
        //commonO.Current_obj = this.EbObject;
        if (pname === "FilterDialogRefId") {
            if (obj[pname] !== null) {
                //this.FD = true;
                this.GetFD();
                this.GenerateButtons();
            }
        }
        if (pname === "Name") {
			$("#objname").text(this.EbObject.DisplayName);
        }
    }.bind(this);

    this.GetFD = function (callback) {
        this.FilterDialogRefId = this.EbObject.FilterDialogRefId;
        //this.relatedObjects += this.FilterDialogRefId;
        if (this.FilterDialogRefId !== "" && this.FilterDialogRefId)
            $.post("../CE/GetFilterBody", { dvobj: JSON.stringify(this.EbObject), contextId: "paramdiv" + tabNum }, this.AppendFD.bind(this, callback));
    };

    this.AppendFD = function (callback, result) {
        $('#paramdiv' + tabNum).remove();
        $('#ds-page' + tabNum).prepend(`
                <div id='paramdiv-Cont${tabNum}' class='param-div-cont'>
                <div id='paramdiv${tabNum}' class='param-div fd'>
                    <div class='pgHead'>
                        <h6 class='smallfont' style='font-size: 12px;display:inline'>Parameter Div</h6>
                        <div class="icon-cont  pull-right" id='close_paramdiv${tabNum}'><i class="fa fa-times" aria-hidden="true"></i></div>
                    </div>
                    </div>
                    </div>
                `);
        //$('#codewindow' + tabNum).removeClass("col-md-10").addClass("col-md-8 col-md-offset-2");
        $('#paramdiv' + tabNum).append(result);
        $('#close_paramdiv' + tabNum).off('click').on('click', this.CloseParamDiv.bind(this));
        $("#btnGo").off("click").on("click", this.RunDs.bind(this));
        //$.LoadingOverlay("hide");
        this.stickBtn = new EbStickButton({
            $wraper: $(".param-div"),
            $extCont: $(".param-div"),
            icon: "fa-filter",
            dir: "left",
            label: "Parameters",
        });

        if (callback)
            this.stickBtn.minimise();
        else
            this.stickBtn.maximise();
        this.filterDialog = FilterDialog;

    };

    this.CloseParamDiv = function () {
        this.stickBtn.minimise();
    };

    //this.ToggleFD = function () {
    //    if ($('#paramdiv' + tabNum).css("display") === "none") {
    //        $('#paramdiv' + tabNum).show();
    //        $('#codewindow' + tabNum).removeClass("col-md-10").addClass("col-md-8 col-md-offset-2");
    //    }
    //    else {
    //        this.CloseParamDiv();
    //    }
    //};

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

    //this.Execute = function () {
    //    if (!$('#execute' + tabNum).hasClass('collapsed')) {
    //        //dasdsd
    //    }
    //    else {
    //        this.Find_parameters(false, false, false);
    //        $.LoadingOverlay("show");
    //        if (this.Parameter_Count !== 0 && $('#fd' + tabNum + ' option:selected').text() === "Select Filter Dialog") {
    //            alert("Please select a filter dialog");
    //            $.LoadingOverlay("hide");
    //        }
    //        else if (this.Parameter_Count === 0) {
    //            $.LoadingOverlay("hide");
    //            var getNav = $("#versionNav li.active a").attr("href");
    //        }
    //        else {
    //            this.Find_parameters(false, false, false);
    //            // this.Save(false);
    //            this.SelectedFdId = $('#fd' + tabNum + ' option:selected').val();
    //        }
    //    }
    //}

    //this.RunSqlFn = function () {
    //    $.LoadingOverlay("show");
    //    if ($('.fd option:selected').text() === "Select Filter Dialog") {
    //        alert("Please select a filter dialog");
    //        $.LoadingOverlay("hide");
    //    }
    //    this.Save(true);
    //}

    //this.TestSqlFn = function () {
    //    $.LoadingOverlay("show");
    //    alert("Test");
    //}


    //this.Save = function (needRun) {
    //    $.LoadingOverlay("show");
    //    if (this.ObjectType === 5) {
    //        this.SetSqlFnName();
    //    }
    //    this.Find_parameters(true, true, needRun);
    //};

    //this.Commit = function (needRun) {
    //    $.LoadingOverlay("show");
    //    if (this.ObjectType === 5) {
    //        this.SetSqlFnName();
    //    }
    //    this.Find_parameters(true, false, needRun);
    //}
    this.RunDs = function () {
        commonO.flagRun = true;
        //$.LoadingOverlay("show");
        $("#eb_common_loader").EbLoader("show");
        if (this.EbObject.VersionNumber !== null && this.EbObject.VersionNumber !== undefined) {
            if (this.EbObject.VersionNumber.slice(-1) === "w") {
                commonO.Save();
            }
            else {
                this.SaveSuccess();
            }
        }
        else
            commonO.Save();
    };

    this.SaveSuccess = function () {
        if (commonO.flagRun)
            this.CountParameters();
    };

    this.CountParameters = function () {
        commonO.flagRun = false;
        var result = window["editor" + tabNum].getValue().match(/\:\w+|\@\w+/g);
        var filterparams = [];
        if (result !== null) {
            for (var i = 0; i < result.length; i++) {
                result[i] = result[i].substr(1);
                if (result[i] === "search" || result[i] === "and_search" || result[i] === "search_and" || result[i] === "where_search" || result[i] === "limit" || result[i] === "offset" || result[i] === "orderby" /*|| result[i] === "id"*/) {
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
        this.DrawTable();
    };

    this.CreateObjString = function () {
        var ParamsArray = [];
        if (this.FilterDialogRefId !== undefined)
            ParamsArray = getValsForViz(this.filterDialog.FormObj);
        return ParamsArray;
    };

    this.DrawTable = function () {
        commonO.tabNum++;
        var navitem = "<li><a data-toggle='tab' href='#vernav" + commonO.tabNum + "'>Result-" + this.EbObject.VersionNumber + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + commonO.tabNum + "' class='tab-pane fade'>";
        this.AddVerNavTab(navitem, tabitem);
        $('#vernav' + commonO.tabNum).append(" <div class=' filter_modal_body'>" +
            "<table class='table table-striped table-bordered' id='sample" + commonO.tabNum + "'></table>" +
            "</div>");
        $.post('../../CE/GetColumns4Trial', {
            ds_refid: this.Refid,
            parameter: this.CreateObjString()
        }, this.Load_Table_Columns.bind(this));
        $("#obj_icons").empty();
        $('#save').hide();
        $('#commit_outer').hide();
        $('#create_button').hide();
        $('#compare').show();
        $('#status').show();
        $('#ver_his').show();
    };

    this.Load_Table_Columns = function (result) {
        if (result === "") {
            alert('Error in Query');
        }
        else {
            var cols = JSON.parse(result);
            $("#sample" + commonO.tabNum).dataTable({
                aoColumns: cols,
                serverSide: true,
                lengthMenu: [[20, 50, 100], [20, 50, 100]],
                scrollX: "100%",
                scrollY: "300px",
                processing: true,
                dom: "<lip>rt",
                paging: true,
                lengthChange: true,
                ajax: {
                    //url: this.Ssurl + "/ds/data/" + this.Refid,
                    url: "../CE/getData",
                    type: "POST",
                    data: this.Load_tble_Data.bind(this),
                    crossDomain: true,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", "Bearer " + getToken());
                    },
                    dataSrc: function (dd) { return dd.data; },
                }
            });

            $("#versionNav a[href='#vernav" + commonO.tabNum + "']").tab('show');
        }

        //$.LoadingOverlay("hide");
        $("#eb_common_loader").EbLoader("hide");
    };

    this.Load_tble_Data = function (dq) {
        delete dq.columns; delete dq.order; delete dq.search;
        dq.RefId = this.Refid;
        dq.TFilters = [];
        dq.Params = this.CreateObjString();
        return dq;
    };

    this.SetSqlFnName = function () {
        var result = this.EbObject.Sql.match(/create\s*FUNCTION\s*|create\s*or\s*replace\s*function\s*(.[\s\S]*?\))/i);
        if (result.length > 0) {
            var fnName = result[1].replace(/\s\s+/g, ' ');
            var x = fnName.replace('(', "_v" + this.Current_obj.versionNumber + '(');
            var v = this.EbObject.Sql.replace(result[1], x);
            $('#obj_name').val(x);
            $('#code' + tabNum).val(v);
            editor.setValue(v);
        }
    };

    this.GetUsedSqlFns = function (needRun, issave) {

        this.rel_arr = [];
        this.relatedObjects = null;
        $.post("../CE/GetObjects_refid_dict", { obj_type: 5 }, this.FetchUsedSqlFns.bind(this, issave, needRun));
    };

    this.FetchUsedSqlFns = function (issave, needRun, data) {
        $.each(data, this.FetchUsedSqlFns_inner.bind(this));

        var getNav = $("#versionNav li.active a").attr("href");
        var filter_dialog_refid = $(getNav + ' #fdlist' + tabNum + ' #fd' + tabNum + ' option:selected').val();

        if (filter_dialog_refid === "Select Filter Dialog") {
            filter_dialog_refid = null;
        }
        //this.rel_arr.push(filter_dialog_refid);
        //this.relatedObjects = this.rel_arr.toString();
        //this.EbObject.Sql = btoa(this.EbObject.Sql);
        //var tagvalues = $('#tags').val();
        //if (issave === true) {
        //    $.post("../Eb_ObjectController/SaveEbObject",
        //        {
        //            "Id": this.ver_Refid,
        //            "json": JSON.stringify(this.Current_obj),
        //            "rel_obj": "",
        //            "tags": tagvalues
        //        }, this.CallDrawTable.bind(this, needRun));
        //}
        //else {

        //    $.post("../Eb_ObjectController/CommitEbObject", {
        //        "id": this.ver_Refid,
        //        "changeLog": this.changeLog,
        //        "json": JSON.stringify(this.Current_obj),
        //        "rel_obj": this.relatedObjects,
        //        "tags": tagvalues
        //    }, this.CallDrawTable.bind(this, needRun));
        //}

    };

    this.CallDrawTable = function (needRun, result) {
        if (needRun === true) {
            var getNav = $("#versionNav li.active a").attr("href");
            this.ver_Refid = $(getNav).attr("data-id");
            if (this.ver_Refid === "new") {
                this.ver_Refid = result.refId;
                alert(this.ver_Refid);
            }
            this.DrawTable();
        }
        alert("Success");
        $("#close_popup").click();
        //$.LoadingOverlay("hide");
        $("#eb_common_loader").EbLoader("hide");
    };

    this.CreateRelationString = function () {
        if (this.FilterDialogRefId !== "" && this.FilterDialogRefId)
            this.relatedObjects += this.FilterDialogRefId;
    };

    this.FetchUsedSqlFns_inner = function (i, sqlFn) {
        if (this.EbObject.Sql.indexOf(sqlFn.name) !== -1) {
            this.rel_arr.push(i);
        }
    };

    //commonO.PreviewObject = function () {
    //	$("#preview_wrapper").empty();
    //	this.RunDs();
    //}.bind(this);

    this.Init();
}