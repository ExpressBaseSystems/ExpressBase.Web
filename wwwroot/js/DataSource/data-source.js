class DataSource {
    explain() { }
    run() { }
    SaveSuccess() { }
    GenerateButtons() { this.setToolbar();}

    constructor(o) {
        this.Mode;
        this.Parameters = [];
        const Default = {
            Object: null,
            Version: "",
            RefId: "",
            Status: "",
            TabNumber: 0,
            SSUrl: ""
        };
        this.AllowedDbTypes = {
            BooleanOriginal: {
                Alias: "Boolean",
                IntCode: EbDbType["BooleanOriginal"],
            },
            Date: null,
            DateTime: null,
            Decimal: null,
            Double: null,
            Int16: null,
            Int32: null,
            Json: null,
            String: null,
        }

        this.BuilderMode = {
            NEW: "new",
            EDIT: "edit"
        };

        this.Refid = null;
        this.BuilderType;
        this.Settings = $.extend(Default, o);
        this.EbObject = this.Settings.Object;
        if (this.EbObject === null)
            this.Mode = this.BuilderMode.NEW;
        else
            this.Mode = this.BuilderMode.EDIT
        this.initPg();
    }

    get uniqName() {
        return this.constructor.name + Date.now().toString(36);
    }

    loader(op) {
        if (op === "show")
            $("#eb_common_loader").EbLoader("show");
        else
            $("#eb_common_loader").EbLoader("hide");
    }

    initPg() {
        this.PropertyGrid = new Eb_PropertyGrid({
            id: "dspropgrid" + this.Settings.TabNumber,
            wc: "",
            cid: window.ebcontext.sid,
            $extCont: $(".ds-prop"),
            $scope: $(".adv-dsb-cont")
        });
    }

    closeParamDiv() {

    }

    setObj(o, meta) {
        this.PropertyGrid.setObject(o, meta);
    }

    setToolbar() {
        $("#obj_icons").empty().append(`
        <button class='btn run' id= 'run' data-toggle='tooltip' data-placement='bottom' title='Run'>
            <i class='fa fa-play' aria-hidden='true'></i>
        </button>
        <button class='btn' id='explaine_btn' data-toggle='tooltip' data-placement='bottom' title= 'Explain'>
            <i class='fa fa-sitemap ' aria-hidden='true'></i>
        </button>`);
        this.bindEvents();
    }

    bindEvents() {
        $("#run").off("click").on("click", this.run.bind(this));
        $("#explaine_btn").off("click").on("click", this.explain.bind(this));
        $("#parmSetupSave").off("click").on("click", this.executeDs.bind(this));
    }

    setQuery() {
        window["editor" + this.Settings.TabNumber].setValue(atob(this.EbObject.Sql));
    }

    getQuery(regex) {
        if (regex)
            return window["editor" + this.Settings.TabNumber].getValue().match(regex);
        else
            return window["editor" + this.Settings.TabNumber].getValue();
    }

    getParamValues(_params) {
        for (let i = 0; i < _params.length; i++) {
            _params[i].Type = parseInt($(`select[name="${_params[i].Name}-DBTYPE"]`).val());
            _params[i].Value = $(`input[name="${_params[i].Name}-VLU"]`).val();
        }
        return _params;
    }

    openTab(title) {
        $('#versionNav').append(`<li>
                                    <a data-toggle='tab' tnum ="${commonO.tabNum}" href='#vernav${commonO.tabNum}'>${title}
                                        <button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button>
                                    </a>
                                </li>`);
        $('#versionTab').append(`<div id='vernav${commonO.tabNum}' class='tab-pane fade'>`);
        $("#versionNav a[href='#vernav" + commonO.tabNum + "']").tab('show');
        $('.closeTab').off("click").on("click", this.delTab.bind(this));
    }

    delTab(e) {
        var tabContentId = $(e.target).closest("a").attr("href");
        $(e.target).closest("li").remove();
        $(tabContentId).remove();
        $('#versionNav a:last').tab('show');
    }

    pwFlow() {
        this.EbObject.Sql = this.getQuery().trim();
        $.ajax({
            type: 'POST',
            url: "../CE/GetSqlParams",
            data: {
                "sql": this.EbObject.Sql,
                "obj_type": this.BuilderType
            }
        }).done(function (data) {
            this.Parameters = JSON.parse(data);
            if (this.Parameters.length > 0) {
                $(`#paramsModal-toggle`).modal("show");
                this.configPwWindow();
                this.appendPHTML();
                this.setPValues();
            }
            else {
                //this.;
            }
        }.bind(this));
    }

    configPwWindow() {
        $("#parmSetupSave").html(`Run <i class="fa fa-play" aria-hidden="true"></i>`);
    }

    appendPHTML() {
        $("#paraWinTab_" + this.Settings.TabNumber + " tbody").empty();
        for (let i = 0; i < this.Parameters.length; i++) {
            $("#paraWinTab_" + this.Settings.TabNumber + " tbody").append(`<tr>
                            <td>${this.Parameters[i].Name}</td>
                            <td>
                                <select name="${this.Parameters[i].Name}-DBTYPE" class="form-control">
                                    ${this.setDbType()}
                                </select>
                            </td>
                            <td><input type="text" name="${this.Parameters[i].Name}-VLU" class="form-control"/></td>
                        </tr>`);
        }
    }

    setDbType() {
        let d = [];
        for (let k in EbDbType) {
            if (k in this.AllowedDbTypes) {
                let name = (this.AllowedDbTypes[k] !== null) ? this.AllowedDbTypes[k].Alias : k;
                let val = (this.AllowedDbTypes[k] !== null) ? this.AllowedDbTypes[k].IntCode : EbDbType[k];
                d.push(`<option value="${val}">${name}</option>`);
            }
        }
        return d.join("");
    }

    setPValues() {
        for (let i = 0; i < this.EbObject.InputParams.$values.length; i++) {
            $(`select[name="${this.EbObject.InputParams.$values[i].Name}-DBTYPE"]`).val(this.EbObject.InputParams.$values[i].Type);
            $(`input[name="${this.EbObject.InputParams.$values[i].Name}-VLU"]`).val(this.EbObject.InputParams.$values[i].Value);
        }
    }

    executeDs() {
        this.EbObject.InputParams.$values = this.getParamValues(this.Parameters);
        commonO.Save();
    }
}

class DataReader extends DataSource {
    constructor(o) {
        super(o);
        this.FilterDialog = null;
        this.BuilderType = 2;
        this.init();
    }

    init() {
        if (this.Mode === this.BuilderMode.NEW) {
            this.EbObject = new EbObjects.EbDataReader(this.uniqName);
            this.EbObject.DisplayName = this.EbObject.Name;
            commonO.Current_obj = this.EbObject;
        }
        else {
            if (this.EbObject.FilterDialogRefId !== "") {
                this.getFD();
            }
        }
        this.setObj(this.EbObject, AllMetas.EbDataReader);
        this.setToolbar();
        this.setQuery();
    }

    getFD() {
        try {
            $.post("../CE/GetFilterBody",
                {
                    dvobj: JSON.stringify(this.EbObject),
                    contextId: "paramdiv" + this.Settings.TabNumber
                },
                this.drawFD.bind(this));
        }
        catch (err) {
            console.error(err);
        }
    }

    drawFD(html) {
        $('#paramdiv' + this.Settings.TabNumber).remove();
        $('#ds-page' + this.Settings.TabNumber).prepend(`
                <div id='paramdiv-Cont${this.Settings.TabNumber}' class='param-div-cont'>
                    <div id='paramdiv${this.Settings.TabNumber}' class='param-div fd'>
                        <div class='pgHead'>
                            <h6 class='smallfont' style='font-size: 12px;display:inline'>Parameter Div</h6>
                            <div class="icon-cont  pull-right" id='close_paramdiv${tabNum}'>
                                <i class="fa fa-times" aria-hidden="true"></i>
                            </div>
                        </div>
                    </div>
                </div>`);
        $('#paramdiv' + this.Settings.TabNumber).append(html);
        $('#close_paramdiv' + this.Settings.TabNumber).off('click').on('click', this.closeParamDiv.bind(this));
        this.fdStick();//filter dialog stick button
        this.FilterDialog = FilterDialog;
    }

    fdStick() {
        this.stickBtn = new EbStickButton({
            $wraper: $(".param-div"),
            $extCont: $(".param-div"),
            icon: "fa-filter",
            dir: "left",
            label: "Parameters"
        });
    }

    run() {
        if (this.EbObject.FilterDialogRefId)
            this.filterFlow();
        else
            this.pwFlow();
    }

    filterFlow() {
        commonO.flagRun = true;
        this.loader("show");
        var _fv = null;
        if (this.EbObject.FilterDialogRefId)
            _fv = getValsForViz(this.FilterDialog.FormObj);
        else
            _fv = this.EbObject.InputParams.$values;

        commonO.Save(function (res) {
            this.RefId = res.refid;
            commonO.tabNum++; //increment tab num

            this.openTab("Result" + this.EbObject.VersionNumber);
            $.post('../CE/GetColumnsCollection', {
                ds_refid: this.RefId,
                parameter: _fv
            }, function (result) {
                this.renderTable(result, _fv);
            }.bind(this));

            $("#obj_icons,#save,#commit_outer,#create_button").hide();
            $('#compare,#status,#ver_his').show();
        }.bind(this));
    }

    renderTable(result, filter) {
        if (result !== null) {
            if (result.message !== null)
                EbMessage("show", { Message: result.message, Background: "#aa0000", AutoHide: false, Delay: 8000 });
            else {
                var colscollection = JSON.parse(result.data);
                $.each(colscollection.$values, function (i, columns) {
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
                    o.dsid = this.RefId;
                    o.columns = columns;
                    o.showFilterRow = (i === 0) ? true : false;
                    o.showSerialColumn = true;
                    o.showCheckboxColumn = false;
                    o.getFilterValuesFn = function () { return filter };
                    o.source = "datareader";
                    o.IsPaging = (i === 0) ? true : false;
                    o.scrollHeight = "250";
                    o.QueryIndex = i;
                    o.datetimeformat = true;
                    let res = new EbBasicDataTable(o);
                    res.Api.columns.adjust();
                }.bind(this));
                $("#versionNav a[href='#vernav" + commonO.tabNum + "']").tab('show');
            }
        }
        this.loader("hide");
    }

    getFilterValues() {
        var result = this.getQuery("/\:\w+|\@\w+/g");
        let _filterParams = [];
        if (result !== null) {
            var _conditions = ["search", "and_search", "search_and", "where_search", "limit", "offset", "orderby"]
            for (let i = 0; i < result.length; i++) {
                result[i] = result[i].substr(1);
                if (_conditions.indexOf(result[i]) < 0) {
                    if ($.inArray(result[i], _filterParams) === -1)
                        _filterParams.push(result[i]);
                }
            }
            _filterParams.sort();
        }
        return _filterParams;
    }   

    executeDs() {
        this.EbObject.InputParams.$values = this.getParamValues(this.Parameters);
        this.filterFlow();
    }
}

class DataWriter extends DataSource {
    constructor(o) {
        super(o);
        this.BuilderType = 4;
        this.init();
    }

    init() {
        if (this.Mode === this.BuilderMode.NEW) {
            this.EbObject = new EbObjects.EbDataWriter(this.uniqName);
            this.EbObject.DisplayName = this.EbObject.Name;
            commonO.Current_obj = this.EbObject;
        }
        setObj(this.EbObject, AllMetas.EbDataReader);
        setToolbar();
    }
}

class SqlFunction extends DataSource {

    static get SqlSyntax() {
        return btoa(`CREATE OR REPLACE FUNCTION function_name(parameter_name...)
            RETURN return_datatype
            { IS | AS }
            BEGIN
                <function_body>
            END;`);
    }

    constructor(o) {
        super(o);
        this.BuilderType = 5;
        var Syntax =

            this.init();
    }

    init() {
        if (this.Mode === this.BuilderMode.NEW) {
            this.EbObject = new EbObjects.EbSqlFunction(this.uniqName);
            this.EbObject.DisplayName = this.EbObject.Name;
            commonO.Current_obj = this.EbObject;
            this.EbObject.Sql = this.SqlSyntax;
        }
    }
}