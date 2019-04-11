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
    this.isPw = false;

    const _DataReader = "DataReader";
    const _DataWriter = "DataWriter";
    const _SqlFunction = "SqlFunction";
    const _SqlFuncSyntax = `CREATE OR REPLACE FUNCTION function_name(parameter_name...)
            RETURN return_datatype
            { IS | AS }
            BEGIN
                <function_body>
            END;`;

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
            $e.attr("state", "advanced");
            $simpleSec.hide(this.delay);
            $advSec.show(this.delay);
            $simpleSec.animate({});
        }
        else {
            if ($e.attr("is-edited") === "true")
                return;
            $e.attr("state", "simple");
            $simpleSec.show(this.delay);
            $advSec.hide(this.delay);
        }
    };

    this.Init = function () {
        let dsType = "";
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
            this.EbObject = new EbObjects["Eb" + dsType](dsType + "_" + Date.now().toString(36));
            this.EbObject.DisplayName = this.EbObject.Name;
            commonO.Current_obj = this.EbObject;
            if (this.ObjectType === 5)
                this.EbObject.Sql = btoa(_SqlFuncSyntax);
        }
        else {
            if (this.EbObject.FilterDialogRefId !== "") {
                var callback = true;
                this.GetFD(callback);
            }
        }
        this.propGrid.setObject(this.EbObject, AllMetas["Eb" + dsType]);
        this.GenerateButtons();
        this.Name = this.EbObject.Name;
        window["editor" + tabNum].setValue(atob(this.EbObject.Sql));
        $("#parmSetupSave").off("click").on("click", this.SaveParamsetup.bind(this));
    };

    this.SaveParamsetup = function (ev) {
        if (this.ObjectType === 5) {
            $.ajax({
                type: 'POST',
                url: "../CE/ExecSqlFunction",
                data: { "fname": this.EbObject.Name, "_params": JSON.stringify(this.getParamVal(this.InputParams)) },
                beforeSend: function () {
                }
            }).done(function (data) {
                this.DrawDataTable(data);
            }.bind(this));
        }
        else {
            this.EbObject.InputParams.$values = this.getParamVal(this.InputParams);
            commonO.Save();
            this.DrawTable();
        }
    };

    //duplicated for sql function need to change.
    this.DrawDataTable = function (_table) {
        commonO.tabNum++;
        var nav = "<li><a data-toggle='tab' tnum =" + commonO.tabNum + " href='#vernav" + commonO.tabNum + "'>Result-" + this.EbObject.VersionNumber + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tab = "<div id='vernav" + commonO.tabNum + "' class='tab-pane fade'>";
        this.AddTab(nav, tab);
        $('#vernav' + commonO.tabNum).append(" <div class=' filter_modal_body'>" +
            "<table class='table table-striped table-bordered' id='sample" + commonO.tabNum + "'></table>" +
            "</div>");
        var o = {};
        o.tableId = "sample" + commonO.tabNum;
        o.data = _table.rows;
        o.columns = _table.colums;
        o.showFilterRow = false;
        o.showSerialColumn = false;
        o.showCheckboxColumn = false;
        let res = new EbBasicDataTable(o);
        res.Api.columns.adjust();
    };

    this.getParamVal = function (_params) {
        for (let i = 0; i < _params.length; i++) {
            _params[i].Type = eval($(`select[name="${_params[i].Name}-DBTYPE"]`).val());
            _params[i].Value = $(`input[name="${_params[i].Name}-VLU"]`).val();
        }
        return _params;
    };

    this.configParamWindo = function () {
        $("#parmSetupSave").html(`Run <i class="fa fa-play" aria-hidden="true"></i>`);
    };

    this.GenerateButtons = function () {
        $("#obj_icons").empty().append(`<button class='btn run' id= 'run' data-toggle='tooltip' data-placement='bottom' title= 'Run'>
                                            <i class='fa fa-play' aria-hidden='true'></i>
                                        </button>
                                    <button class='btn' id='explaine_btn' data-toggle='tooltip' data-placement='bottom' title= 'Explain'>
                                            <i class='fa fa-sitemap ' aria-hidden='true'></i>
                                        </button>`);

        $("#run").off("click").on("click", this.RunClick.bind(this));
        $("#explaine_btn").off("click").on("click", this.Explain.bind(this));
        $(".simple-dsb-cont").hide(this.delay);
    };

    this.RunClick = function () {
        if (this.EbObject.FilterDialogRefId) {
            this.isPw = false;
            this.RunDs();
        }
        else {
            this.isPw = true;
            this.getInputParams();
        }
    };

    this.getInputParams = function () {
        this.Sql = window["editor" + tabNum].getValue().trim();
        $.ajax({
            type: 'POST',
            url: "../CE/GetSqlParams",
            data: { "sql": this.Sql, "obj_type": this.ObjectType },
            beforeSend: function () { }
        }).done(function (data) {
            this.InputParams = JSON.parse(data);
            if (this.InputParams.length > 0) {
                $(`#paramsModal-toggle`).modal("show");
                this.configParamWindo();
                if (this.ObjectType === 5)
                    this.AppendInpuParams();
                else {
                    this.AppendInpuParams();
                    this.setValues();
                }
            }
            else {
                this.isPw = false;
                this.RunDs();
            }
        }.bind(this));
    };

    this.AppendInpuParams = function () {
        let param_list = [];
        param_list = this.InputParams;
        this.EbObject.InputParams.$values = this.InputParams;

        $("#paraWinTab_" + tabNum + " tbody").empty();
        if (param_list.length <= 0) {
            $(".emptyPMsg").show();
        }
        else {
            for (let i = 0; i < param_list.length; i++) {
                $("#paraWinTab_" + tabNum + " tbody").append(`<tr>
                            <td>${param_list[i].Name}</td>
                            <td>
                                <select name="${param_list[i].Name}-DBTYPE" class="form-control">
                                    ${this.setDbType()}
                                </select>
                            </td>
                            <td><input type="text" name="${param_list[i].Name}-VLU" class="form-control"/></td>
                        </tr>`);
            }
        }
    };

    this.setDbType = function () {
        let d = [];
        for (let k in EbDbType) {
            d.push(`<option value="${EbDbType[k]}">${k}</option>`);
        }
        return d.join(",");
    };

    this.setValues = function () {
        for (let i = 0; i < this.EbObject.InputParams.$values.length; i++) {
            $(`select[name="${this.EbObject.InputParams.$values[i].Name}-DBTYPE"]`).val(this.EbObject.InputParams.$values[i].Type);
            $(`input[name="${this.EbObject.InputParams.$values[i].Name}-VLU"]`).val(this.EbObject.InputParams.$values[i].Value);
        }
    };

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
            label: "Parameters"
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

    this.AddTab = function (nav, tab) {
        $('#versionNav').append(nav);
        $('#versionTab').append(tab);
        $("#versionNav a[href='#vernav" + tabNum + "']").tab('show');
        $('.closeTab').off("click").on("click", this.deleteTab.bind(this));
        $('a[data-toggle="tab"]').off('click').on('click', commonO.TabChangeSuccess.bind(commonO));
    };

    this.deleteTab = function (e) {
        var tabContentId = $(e.target).parent().attr("href");
        $(e.target).parent().parent().remove(); //remove li of tab
        $(tabContentId).remove();
        $('#versionNav a:last').tab('show'); // Select first tab        
    };

    this.RunDs = function () {
        commonO.flagRun = true;
        //$.LoadingOverlay("show");
        $("#eb_common_loader").EbLoader("show");
        if (this.EbObject.VersionNumber === "")
            commonO.Save();
        else if (this.EbObject.VersionNumber !== null && this.EbObject.VersionNumber !== undefined) {
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
    }.bind(this);

    this.DrawTable = function () {
        var paramsArray = null;
        if (this.isPw)
            paramsArray = this.EbObject.InputParams.$values;
        else
            paramsArray = this.CreateObjString();

        commonO.tabNum++;
        var nav = "<li><a data-toggle='tab' tnum =" + commonO.tabNum + " href='#vernav" + commonO.tabNum + "'>Result-" + this.EbObject.VersionNumber + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tab = "<div id='vernav" + commonO.tabNum + "' class='tab-pane fade'>";
        this.AddTab(nav, tab);
        $('#vernav' + commonO.tabNum).append(`<div class='filter_modal_body'><div class="accordion" id="accordion${commonO.tabNum}"></div></div>`);

        $.post('../CE/GetColumnsCollection', {
            ds_refid: this.Refid,
            parameter: paramsArray
        }, this.Load_Table_Columns.bind(this));
        $("#obj_icons").hide();
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
            var colscollection = JSON.parse(result);
            $.each(colscollection.$values, function (i, columns) {
                //var ariastring = (i === 0) ? "aria-expanded='true'" : "";
                //var showstring = (i === 0) ? "in" : "";
                var ariastring = "aria-expanded='true'";
                var showstring = "in";
                $('#vernav' + commonO.tabNum + ' .accordion').append(`<div class="card">
                        <div class="card-header" id="card-header${commonO.tabNum}_${i}">
                          <h5 class="mb-0">
                            <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#TableParent${commonO.tabNum}_${i}" ${ariastring} aria-controls="TableParent${commonO.tabNum}_${i}">
                              Table${i}
                            </button>
                          </h5>
                        </div>`);
                $('#vernav' + commonO.tabNum + ' .accordion').append(`<div id='TableParent${commonO.tabNum}_${i}' class="collapse ${showstring}" aria-labelledby="card-header${commonO.tabNum}_${i}" data-parent="#accordion${commonO.tabNum}"> 
                    <div class="card-body"><table class='table table-striped table-bordered' id='Table${commonO.tabNum}_${i}'></table></div></div>`);
                var o = {};
                o.tableId = "Table" + commonO.tabNum + "_" + i;
                o.dsid = this.Refid;
                o.columns = columns;
                o.showFilterRow = (i === 0) ? true : false;
                o.showSerialColumn = true;
                o.showCheckboxColumn = false;
                o.getFilterValuesFn = (this.isPw) ? this.getInputData.bind(this) : this.CreateObjString;
                o.source = "datareader";
                o.IsPaging = (i === 0) ? true : false;
                o.scrollHeight = "250";
                o.QueryIndex = i;
                o.datetimeformat = true;
                let res = new EbBasicDataTable(o);
                res.Api.columns.adjust();
            }.bind(this));
            //$("#sample" + commonO.tabNum).dataTable({
            //    aoColumns: cols,
            //    serverSide: true,
            //    lengthMenu: [[20, 50, 100], [20, 50, 100]],
            //    scrollX: "100%",
            //    scrollY: "300px",
            //    processing: true,
            //    dom: "<lip>rt",
            //    paging: true,
            //    lengthChange: true,
            //    ajax: {
            //        //url: this.Ssurl + "/ds/data/" + this.Refid,
            //        url: "../CE/getData",
            //        type: "POST",
            //        data: this.Load_tble_Data.bind(this),
            //        crossDomain: true,
            //        beforeSend: function (xhr) {
            //            xhr.setRequestHeader("Authorization", "Bearer " + getToken());
            //        },
            //        dataSrc: function (dd) { return dd.data; },
            //    }
            //});

            $("#versionNav a[href='#vernav" + commonO.tabNum + "']").tab('show');
        }
        $("#eb_common_loader").EbLoader("hide");
    };

    this.getInputData = function () {
        return this.EbObject.InputParams.$values;
    };

    this.Load_tble_Data = function (dq) {
        delete dq.columns; delete dq.order; delete dq.search;
        dq.RefId = this.Refid;
        dq.TFilters = [];
        if (this.isPw)
            dq.Params = this.EbObject.InputParams.$values;
        else
            dq.Params = this.CreateObjString();
        return dq;
    };

    this.AfterCommit = function () {
        window["editor" + tabNum].options.readOnly = true;
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
    this.Explain = function () {
        commonO.tabNum++;
        var nav = "<li><a data-toggle='tab' tnum =" + commonO.tabNum + " href='#vernav" + commonO.tabNum + "'>Explain-" + this.EbObject.VersionNumber + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tab = "<div id='vernav" + commonO.tabNum + "' class='tab-pane fade'>";
        this.AddTab(nav, tab);
        $('#vernav' + commonO.tabNum).append(`<section class="container-fluid">
        <div id="JsonD${commonO.tabNum}" class = "jsonD"></div>
        </section>
        <div id="item">
        </div>`);
        $("#versionNav a[href='#vernav" + commonO.tabNum + "']").tab('show');
    };
    this.Init();
};