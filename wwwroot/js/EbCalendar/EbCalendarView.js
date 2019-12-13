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

    this.init = function () {
        if (!this.EbObject)
            this.EbObject = new EbObjects.EbCalendarView(`EbCalendar${Date.now()}`);
        this.propGrid = new Eb_PropertyGrid({
            id: "propGridView",
            wc: this.Wc,
            cid: this.Cid,
            $extCont: $("#ppt-calendar-view"),
            isDraggable: true
        });

        commonO.Current_obj = this.EbObject;
        this.propGrid.setObject(this.EbObject, AllMetas["EbCalendarView"]);
        this.propGrid.PropertyChanged = this.popChanged.bind(this);
        if (this.EbObject.KeyColumns.$values.length > 0) {
            this.changeColumn = false;
            this.getColumns();
            this.GenerateButtons();
        }
    };

    this.GenerateButtons = function () {
        $("#obj_icons").empty();
        this.$submit = $("<button id='run' class='btn commonControl'><i class='fa fa-play' aria-hidden='true'></i></button>");
        $("#obj_icons").append(this.$submit);
        this.$submit.click(this.getData.bind(this));
    };

    this.popChanged = function (obj, pname, newval, oldval) {
        if (pname === "DataSourceRefId") {
            this.changeColumn = true;
            this.getColumns();
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
        $(".calendar_wrapper").prepend(`
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
        if (typeof FilterDialog !== "undefined") {
            $(".param-div-cont").show();
            this.stickBtn = new EbStickButton({
                $wraper: $(".param-div"),
                $extCont: $(".param-div"),
                icon: "fa-filter",
                dir: "left",
                label: "Parameters"
            });
            this.filterDialog = FilterDialog;
        }
        else {
            $(".param-div-cont").hide();
            this.filterDialog = null;
        }
        if (this.changeColumn) {
            this.returnobj = CalendarColumns;
            this.EbObject.Columns.$values = this.returnobj.Columns.$values;
            this.EbObject.KeyColumns.$values = this.returnobj.KeyColumns.$values;
            this.EbObject.LinesColumns.$values = this.returnobj.LinesColumns.$values;
            this.EbObject.DataColumns.$values = _.cloneDeep(this.EbObject.LinesColumns.$values);
        }
        this.propGrid.setObject(this.EbObject, AllMetas["EbCalendarView"]);
    };

    this.CloseParamDiv = function () {
        this.stickBtn.minimise();
    };

    this.getData = function () {
        this.propGrid.ClosePG();
        if (this.filterDialog)
            this.stickBtn.minimise();
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
            this.EbObject.Columns.$values = this.EbObject.Columns.$values.filter(col => !col.IsCustomColumn);
        }
        return fltr_collection;
    };

    this.receiveAjaxData = function (result) {
        //this.SetColumnRef();
        this.ModifyDv = false;
        if (result) {
            this.result = result;
            this.EbObject = JSON.parse(result.returnObjString);
            this.propGrid.setObject(this.EbObject, AllMetas["EbCalendarView"]);
            this.formatteddata = result.formattedData;
            this.drawCalendar();
        }
    };

    this.drawCalendar = function () {
        let id = "table1";
        $("#calendar-user-view").empty();
        $("#calendar-user-view").append(`<table id="${id}" class="table display table-bordered compact"></table>`);
        this.CustomDataCols = this.EbObject.DataColumns.$values.filter(col => col.IsCustomColumn);
        let _AllColumns = this.EbObject.KeyColumns.$values.concat(this.EbObject.LinesColumns.$values, this.CustomDataCols, this.EbObject.DateColumns.$values);
        var o = {};
        o.dsid = this.EbObject.DataSourceRefId;
        o.tableId = id;
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
        $.each(this.VisibleDataCols, function (i, obj) {
                $(`#ShowDataColumndd .dropdown-menu`).append(`<a class="dropdown-item" data-item='${obj.name}'>${obj.name}</a>`);
                if (i > 0)
                    $(`.${obj.name}_class`).hide();
        }.bind(this));
        $(`#ShowDataColumndd a`).off("click").on("click", this.showDatColumn.bind(this));
        $(`#ShowDataColumndd #action`).text(this.VisibleDataCols[0].name);
        $(`#ShowDataColumndd #action`).append(`<span class="open"><i class="fa fa-caret-down "></i></span>`);
        this.dt.Api.columns.adjust();
    };

    this.showDatColumn = function (e) {
        $(".dataclass").not(`.${$(e.target).attr("data-item")}_class`).hide();
        $(`.${$(e.target).attr("data-item")}_class`).show();
        $(`#ShowDataColumndd #action`).text($(e.target).attr("data-item"));
        $(`#ShowDataColumndd #action`).append(`<span class="open"><i class="fa fa-caret-down "></i></span>`);
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
        return true;
    };

    this.init();
}