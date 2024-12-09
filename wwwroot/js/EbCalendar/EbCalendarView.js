var EbCalendar = function (options) {
    this.EbObject = options.dvObj || null;
    this.RefId = options.RefId;
    this.Version = options.Version;
    this.ObjType = options.ObjType;
    this.Statu = options.Status;
    this.TabNum = options.TabNum;
    this.ServiceUrl = options.ServiceUrl;
    this.Wc = options.Wc;
    this.Cid = options.Cid;
    this.propGrid = null;
    this.ModifyDv = true;
    this.filterDialog = null;
    this.tableId = "table1";

    this.init = function () {
        if (!this.EbObject)
            this.EbObject = new EbObjects.EbCalendarView(`EbCalendar${Date.now()}`);
        if (this.Wc === "dc") {
            this.propGrid = new Eb_PropertyGrid({
                id: "pp_inner",
                wc: this.Wc,
                cid: this.Cid,
                $extCont: $(".ppcont"),
                isDraggable: true
            });
            commonO.Current_obj = this.EbObject;
            this.propGrid.setObject(this.EbObject, AllMetas["EbCalendarView"]);
            this.propGrid.PropertyChanged = this.popChanged.bind(this);
        }
        if (this.EbObject.KeyColumns.$values.length > 0) {
            this.changeColumn = false;
            this.getColumns();
            this.GenerateButtons();
        }
        $("#objname").text(this.EbObject.DisplayName);
    };

    this.GenerateButtons = function () {
        $("#obj_icons").empty();
        this.$submit = $("<button id='run' class='btn commonControl'><i class='fa fa-play' aria-hidden='true'></i></button>");
        $("#obj_icons").append(this.$submit);
        this.$submit.click(this.getData.bind(this));
        if (this.filterDialog) {
            this.filterid = "filter" + this.tableId;
            this.$filter = $("<button id='" + this.filterid + "' class='btn commonControl'><i class='fa fa-filter' aria-hidden='true'></i></button>");
            $("#obj_icons").append(this.$filter);
            this.$filter.click(this.CloseParamDiv.bind(this));
        }
        if (this.Wc === "dc")
            this.CreatePgButton();
    };

    this.popChanged = function (obj, pname, newval, oldval) {
        if (pname === "DataSourceRefId") {
            this.changeColumn = true;
            this.getColumns();
        }
        if (pname === "DefaultCalendarType") {
            this.ChangeFDParams(newval);
        }
        if (this.Wc === "dc")
            commonO.Current_obj = this.EbObject;
        if (pname === "Name") {
            $("#objname").text(obj.DisplayName);
            console.log(obj);
        }
    };

    this.ChangeFDParams = function (newval) {
        if (FilterDialog) {
            let id = FilterDialog.FormObj.Controls.$values[0].EbSid_CtxId;
            let $input = $("#" + id);
            newval = getKeyByVal(EbEnums.AttendanceType, newval.toString());
            $input.find("select option[value='" + newval + "']").attr("selected", "selected");
            $input.find("select").trigger("change");
        }
    };

    this.getColumns = function () {
        this.RemoveColumnRef();
        $.ajax({
            url: "../Calendar/GetFilterBody",
            type: "POST",
            cache: false,
            data: { dvobjt: JSON.stringify(this.EbObject), _flag: this.changeColumn },
            success: this.AppendFD.bind(this)
        });
    };

    this.AppendFD = function (result) {
        $('.param-div-cont').remove();
        $(".calendar_wrapper").append(`
                <div id='paramdiv-Cont${this.TabNum}' class='param-div-cont'>
                <div id='paramdiv${this.TabNum}' class='param-div fd'>
                    <div class='pgHead'>
                        <h6 class='smallfont' style='font-size: 12px;display:inline'>Parameter Div</h6>
                        <div class="icon-cont  pull-right" id='close_paramdiv${this.TabNum}'><i class="fa fa-times" aria-hidden="true"></i></div>
                    </div>
                    </div>
                    </div>
                `);

        $('#paramdiv' + this.TabNum).append(result);
        $('#close_paramdiv' + this.TabNum).off('click').on('click', this.CloseParamDiv.bind(this));
        $("#btnGo").off("click").on("click", this.getData.bind(this));
        this.FDCont = $(".param-div-cont");
        if (typeof FilterDialog !== "undefined") {
            this.FDCont.show();
            //this.stickBtn = new EbStickButton({
            //    $wraper: $(".param-div-cont"),
            //    $extCont: $(".param-div-cont"),
            //    icon: "fa-filter",
            //    dir: "right",
            //    label: "Parameters"
            //});
            this.filterDialog = FilterDialog;
            let id = FilterDialog.FormObj.Controls.$values[0].EbSid_CtxId;
            let $input = $("#" + id);
            this.EbObject.CalendarType = this.EbObject.DefaultCalendarType;
            $input.find("select").data('data-calndr-obj', this.EbObject);
            //$input.find("select").on('change', function (e) {
            //    let newval = EbEnums.AttendanceType[$(e.target).val()];
            //    this.EbObject.CalendarType = parseInt(newval);
            //}.bind(this));
            this.filterid = "filter" + this.tableId;
            this.$filter = $("<button id='" + this.filterid + "' class='btn commonControl'><i class='fa fa-filter' aria-hidden='true'></i></button>");
            $("#obj_icons").append(this.$filter);
            this.$filter.click(this.CloseParamDiv.bind(this));
        }
        else {
            this.FDCont.hide();
            this.filterDialog = null;
        }
        if (this.changeColumn) {
            this.returnobj = CalendarColumns;
            this.EbObject.Columns.$values = this.returnobj.Columns.$values;
            this.EbObject.KeyColumns.$values = this.returnobj.KeyColumns.$values;
            this.EbObject.LinesColumns.$values = this.returnobj.LinesColumns.$values;
            this.EbObject.DataColumns.$values = _.cloneDeep(this.EbObject.LinesColumns.$values);
        }
        if (this.Wc === "dc") {
            //this.CreatePgButton();
            this.propGrid.setObject(this.EbObject, AllMetas["EbCalendarView"]);
        }
        //this.ChangeFDParams(this.EbObject.DefaultCalendarType);
    };

    this.CloseParamDiv = function () {
        //this.stickBtn.minimise();
        this.FDCont.toggle('drop', { direction: 'right' }, 150);
        if (this.FDCont.is(":visible"))
            $(".ppcont").hide();
    };

    this.CreatePgButton = function () {
        $("#obj_icons").append(`<button class="btn filter_menu" id="ppt-grid">
                                    <i class="fa fa-cog" aria-expanded="false"></i>
                                </button>`);
        $(".stickBtn").hide();
        this.PropertyDiv = $("#pp_inner");
        $("#ppt-grid").off("click").on("click", this.togglePG.bind(this));
        $("#pp_inner").find(".pgpin").remove();
        $("#pp_inner .pgHead").append(`<div class="icon-cont  pull-right pgpin" id="${this.tabNum}_pg-close">
                <i class="fa fa-thumb-tack" style="transform: rotate(90deg);"></i></div>`);
        $(`#${this.tabNum}_pg-close`).off("click").on("click", this.togglePG.bind(this));
    };

    this.togglePG = function (e) {
        $(".ppcont").toggle();
        if ($(".ppcont").is(":visible"))
            this.FDCont.hide();
        e.stopPropagation();
    };

    this.getData = function () {
        if (this.Wc === "dc")
            this.propGrid.ClosePG();
        //if (this.filterDialog)
        //    this.stickBtn.minimise();
        $(".ppcont").hide();
        this.FDCont.hide();
        $("#eb_common_loader").EbLoader("show");
        this.filtervalues = this.getFilterValues();
        this.RemoveColumnRef();
        $.ajax({
            url: "../dv/getData",
            type: 'POST',
            data: { RefId: this.EbObject.DataSourceRefId, DataVizObjString: JSON.stringify(this.EbObject), ModifyDv: this.ModifyDv, Params: this.filtervalues, LocId: store.get("Eb_Loc-" + ebcontext.sid + ebcontext.user.UserId) },
            success: this.receiveAjaxData.bind(this),
        });
    };

    this.getFilterValues = function (from) {
        var fltr_collection = [];
        if (this.filterDialog) {
            fltr_collection = getValsForViz(this.filterDialog.FormObj);
            this.ModifyDv = true;
            this.EbObject.DateColumns.$values = [];
            this.EbObject.Columns.$values = this.EbObject.Columns.$values.filter(col => !col.IsCustomColumn && col.name !== "Total");
        }
        return fltr_collection;
    };

    this.receiveAjaxData = function (result) {
        //this.SetColumnRef();
        this.ModifyDv = false;
        if (result) {
            this.result = result;
            this.EbObject = JSON.parse(result.returnObjString);
            if (this.filterDialog)
                $("#" + this.filterDialog.FormObj.Controls.$values[0].EbSid_CtxId).find("select").data('data-calndr-obj', this.EbObject);
            if (this.Wc === "dc")
                this.propGrid.setObject(this.EbObject, AllMetas["EbCalendarView"]);
            this.formatteddata = result.formattedData;
            this.drawCalendar();
            this.updateTitle();
        }
    };

    this.updateTitle = function () {
        let title = this.EbObject.DisplayName;
        for (let i = 0; i < this.filtervalues.length; i++) {
            let f = this.filtervalues[i];
            if (!f.isHidden && f.ValueF)
                title += " - " + f.ValueF;
        }
        $("#objname").text(title);
        $("#objname").prop("title", title);
        $('title').text(title);
    };

    this.drawCalendar = function () {
        $("#calendar-user-view").empty();
        $("#calendar-user-view").append(`<table id="${this.tableId}" class="table display table-bordered compact"></table>`);
        this.CustomDataCols = this.EbObject.DataColumns.$values.filter(col => col.IsCustomColumn);
        let _AllColumns = this.EbObject.KeyColumns.$values.concat(this.EbObject.LinesColumns.$values, this.CustomDataCols, this.EbObject.DateColumns.$values);
        _AllColumns.push(this.EbObject.Columns.$values[this.EbObject.Columns.$values.length - 1]);
        var o = {};
        o.dsid = this.EbObject.DataSourceRefId;
        o.tableId = this.tableId;
        o.containerId = "calendar-user-view";
        o.columns = _AllColumns;
        o.IsPaging = false;
        o.showFilterRow = false;
        o.showCheckboxColumn = false;
        o.showSerialColumn = false;
        o.Source = "Calendar";
        o.data = this.result;
        o.drawCallBack = this.drawCallBackFn.bind(this);
        o.LeftFixedColumn = this.EbObject.LeftFixedColumn;
        o.RowHeight = this.EbObject.RowHeight;
        o.ObjectLinks = this.EbObject.ObjectLinks.$values;
        this.dt = new EbCommonDataTable(o);

        $("#eb_common_loader").EbLoader("hide");
        this.VisibleDataCols = this.EbObject.DataColumns.$values.filter(col => col.bVisible);
        if (this.VisibleDataCols.length > 0)
            this.CreateDataColumnLinks();
    };

    this.drawCallBackFn = function () {
        //this.CreateContextmenu4ObjectSelector();
    };

    this.CreateDataColumnLinks = function () {
        $("#obj_icons #ShowDataColumndd").remove();
        $("#obj_icons").append(`<div class="btn-group" id="ShowDataColumndd">
          <button type="button" class="btn dropdown-toggle" id="action" data-toggle="dropdown"></button>         
          <div class="dropdown-menu">
          </div>
        </div>`);
        let firstSymbol = "";
        $.each(this.VisibleDataCols, function (i, obj) {
            let symbol = "";
            if (obj.ConditionalFormating.$values.length > 0)
                symbol = "";
            else if (obj.AggregateFun.toString() === EbEnums.AggregateFun.Count)
                symbol = "&lowast;";
            else if (obj.AggregateFun.toString() === EbEnums.AggregateFun.Sum)
                symbol = "&sum;";
            $(`#ShowDataColumndd .dropdown-menu`).append(`<a class="dropdown-item" data-symbol="${symbol}" data-item='${obj.name}' data-title='${obj.sTitle ?? obj.name}' data-index='${i}'>${symbol} ${obj.sTitle ?? obj.name} </a>`);
            if (i > 0)
                $(`.${obj.name}_class`).hide();
            else
                firstSymbol = symbol;
        }.bind(this));
        $(`#ShowDataColumndd a`).off("click").on("click", this.showDatColumn.bind(this));
        $(`#ShowDataColumndd #action`).text(this.VisibleDataCols[0].sTitle ?? this.VisibleDataCols[0].name);
        $(`#ShowDataColumndd`).prepend(`<span class="datacolumnsymbol">${firstSymbol}</span>`);
        $(`#ShowDataColumndd #action`).append(`<span class="open"><i class="fa fa-caret-down "></i></span>`);
        this.dt.Api.columns.adjust();
    };

    this.showDatColumn = function (e) {
        $("#eb_common_loader").EbLoader("show");
        $(".dataclass:visible").hide();
        $(`.${$(e.target).attr("data-item")}_class`).show();
        $(`#ShowDataColumndd #action`).text($(e.target).attr("data-title"));
        $(`#ShowDataColumndd .datacolumnsymbol`).remove();
        $(`#ShowDataColumndd`).prepend(`<span class="datacolumnsymbol">${$(e.target).attr("data-symbol")}</span>`);
        $(`#ShowDataColumndd #action`).append(`<span class="open"><i class="fa fa-caret-down "></i></span>`);
        this.setFooterVals(e);
        $("#eb_common_loader").EbLoader("hide");
    };

    this.setFooterVals = function (e) {
        let colindex = $(e.target).attr("data-index");
        let tableId = "table1";
        let opScroll = $('.dataTables_scrollFootInner #' + tableId + '_ftr_sel0').text().trim();
        let opLF = $('.DTFC_LeftFootWrapper #' + tableId + '_ftr_sel0').text().trim();
        let opRF = $('.DTFC_RightFootWrapper #' + tableId + '_ftr_sel0').text().trim();
        $.each(this.dt.eb_agginfo, function (index, agginfo) {
            if (agginfo.colname) {
                //let opScroll = $('.dataTables_scrollFootInner #' + tableId + '_' + agginfo.colname + '_ftr_sel0').text().trim();               
                let ftrtxtScroll = '.dataTables_scrollFootInner #' + tableId + '_' + agginfo.colname + '_ftr_txt0';
                let ftrtxtLF = '.DTFC_LeftFootWrapper #' + tableId + '_' + agginfo.colname + '_ftr_txt0';
                let ftrtxtRF = '.DTFC_RightFootWrapper #' + tableId + '_' + agginfo.colname + '_ftr_txt0';

                var col = this.dt.Api.column(agginfo.colname + ':name');
                var summary_val = 0;
                if (opScroll === '∑' || opLF === '∑' || opRF === '∑') {
                    //summary_val = (typeof this.dt.summary[agginfo.data] !== "undefined") ? this.dt.summary[agginfo.data][2 * colindex] : 0; even no. for sum, odd for avg
                    summary_val = (typeof this.dt.summary[agginfo.data] !== "undefined") ? this.dt.summary[agginfo.data][colindex] : 0;
                }
                if (opScroll === 'x̄' || opLF === 'x̄' || opRF === 'x̄') {
                    summary_val = (typeof this.dt.summary[agginfo.data] !== "undefined") ? this.dt.summary[agginfo.data][(2 * colindex) + 1] : 0;
                }
                if (opScroll !== "")
                    $(ftrtxtScroll).text(summary_val);
                if (opLF !== "")
                    $(ftrtxtLF).text(summary_val);
                if (opRF !== "")
                    $(ftrtxtRF).text(summary_val);
            }
        }.bind(this));
        this.dt.Api.columns.adjust();
    };
    this.RemoveColumnRef = function () {
        this.EbObject.__oldValues = null;
        this.__KeyOSElist = [];
        this.__KeyoldValues = [];
        this.__LineOSElist = [];
        this.__LineoldValues = [];
        $.each(this.EbObject.Columns.$values, function (i, obj) {
            obj.ColumnsRef = null;
            obj.__oldValues = null;
        }.bind(this));
        $.each(this.EbObject.KeyColumns.$values, function (i, obj) {
            obj.ColumnsRef = null;
            this.__KeyOSElist.push($.extend({}, obj.__OSElist));
            obj.__OSElist = null;
            this.__KeyoldValues.push($.extend({}, obj.__oldValues));
            obj.__oldValues = null;
        }.bind(this));
        $.each(this.EbObject.DataColumns.$values, function (i, obj) {
            obj.ColumnsRef = null;
            obj.__oldValues = null;
        }.bind(this));
        $.each(this.EbObject.DateColumns.$values, function (i, obj) {
            obj.ColumnsRef = null;
            obj.__oldValues = null;
        }.bind(this));
        $.each(this.EbObject.LinesColumns.$values, function (i, obj) {
            obj.ColumnsRef = null;
            this.__LineOSElist.push($.extend({}, obj.__OSElist));
            obj.__OSElist = null;
            this.__LineoldValues.push($.extend({}, obj.__oldValues));
            obj.__oldValues = null;
        }.bind(this));
        if (this.EbObject.PrimaryKey)
            this.EbObject.PrimaryKey.ColumnsRef = null;
        if (this.EbObject.ForeignKey)
            this.EbObject.ForeignKey.ColumnsRef = null;
    };

    this.SetColumnRef = function () {

        $.each(this.EbObject.KeyColumns.$values, function (i, obj) {
            obj.__OSElist = this.__KeyOSElist[i];
            obj.__oldValues = this.__KeyoldValues[i];
        }.bind(this));

        $.each(this.EbObject.LinesColumns.$values, function (i, obj) {
            obj.__OSElist = this.__LineOSElist[i];
            obj.__oldValues = this.__LineoldValues[i];
        }.bind(this));
    };

    this.BeforeSave = function () {
        this.RemoveColumnRef();
        return true;
    };

    this.init();
}