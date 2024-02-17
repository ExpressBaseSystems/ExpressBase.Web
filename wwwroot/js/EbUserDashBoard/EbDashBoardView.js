﻿let DashBoardViewWrapper = function (options) {
    this.Version = options.Version;
    this.ObjType = options.ObjType;
    this.EbObject = options.dvObj || null;
    this.Statu = options.Statu;
    this.TileCollection = {};
    this.CurrentTile;
    this.Wc = options.Wc;
    this.Cid = options.Cid;
    this.objGrid;
    this.googlekey = options.googlekey || null;
    this.DashBoardList = options.AllDashBoards || null;
    this.stickBtn;
    this.filtervalues = [];
    this.TabNum = options.tabNum ? options.tabNum : 0;
    this.rowData = options.rowData ? JSON.parse(decodeURIComponent(escape(window.atob(options.rowData)))) : null;
    this.FilterVal = options.filterValues ? JSON.parse(decodeURIComponent(escape(window.atob(options.filterValues)))) : [];
    this.filterDialogRefid = this.EbObject.Filter_Dialogue ? this.EbObject.Filter_Dialogue : "";
    this.Procs = {};
    this.Rowdata = {};
    this.loader = $("#eb_common_loader");
    this.IsRendered = false;
    this.GridStackInit = function () {
        grid = GridStack.init({ resizable: { handles: 'e, se, s, sw, w' }, column: 40, float: true });
        grid.on('gsresizestop', this.Redrawfn.bind(this));
        //grid.on('dragstart', this.DragStartFn.bind(this));
        //grid.on('dragstop', this.DragStopFn.bind(this));
        grid.cellHeight(20);
    };



    this.Redrawfn = function (items, element) {
        var newHeight = $(element).attr('data-gs-height');
        var id = $(element).context.children[0].id;
        this.RedrwFnHelper(id);
    };

    this.RedrwFnHelper = function (id) {
        let currentobj = this.TileCollection[id];
        var height = $(`[data-id=${id}`).height();
        $.each(currentobj.ControlsColl.$values, function (i, obj) {
            $(`[data-id=${id}] #${obj.EbSid}`).css("max-height", `${height} !important`);
            var eb_type = obj.$type.split('.').join(",").split(',')[2].split("Eb")[1];
            //this.labelstyleApplylabelstyleApply(this.CurrentTile);
            if (eb_type === "Gauge") {
                if (obj.DataObjCtrlName === "" || obj.DataObjColName === "") {
                    let xx = EbGaugeWrapper(obj, { isEdit: false });
                }
                this.GaugeDrop(obj.DataObjCtrlName, obj.DataObjColName, obj.EbSid, "Gauge");
            }
            else if (eb_type === "SpeedoMeter") {
                if (obj.DataObjCtrlName === "" || obj.DataObjColName === "") {
                    let xx = SpeedoMeterWrapper(obj, { isEdit: false });
                }
                this.GaugeDrop(obj.DataObjCtrlName, obj.DataObjColName, obj.EbSid, "speedometer");
            }
            else if (eb_type === "ProgressGauge") {
                if (obj.DataObjCtrlName === "" || obj.DataObjColName === "") {
                    let xx = ProgressGaugeWrapper(obj, { isEdit: false });
                }
                $(`#${obj.EbSid}`).css("max-width", $(`#${obj.EbSid}`).height() + 10 + "px");
                this.GaugeDrop(obj.DataObjCtrlName, obj.DataObjColName, obj.EbSid, "ProgressGauge");
            }
        }.bind(this));

    };

    this.GridStackInit();


    //Filter Dialogue
    this.getColumns = function () {
        this.loader.EbLoader("show");
        $.post("../DashBoard/GetFilterBody", { dvobj: JSON.stringify(this.EbObject), contextId: "paramdiv" }, this.AppendFD.bind(this));
    };

    this.AppendFD = function (result) {
        $(".form-group #filter-dg").remove();
        $(".form-group").prepend(`<button class="btn filter_menu" id="filter-dg">
                                    <i class="fa fa-filter" aria-expanded="false"></i>
                                </button>`);
        this.loader.EbLoader("hide");
        $('.db-user-filter').remove();
        $("#dashbord-user-view").prepend(`
                <div id='paramdiv-Cont${this.TabNum}' class='db-user-filter'>
                <div id='paramdiv${this.TabNum}' class='param-div fd'>
                    <div class='pgHead'>
                        <h6 class='smallfont' style='font-size: 12px;display:inline'>Filter</h6>
                        <div class="icon-cont  pull-right" id='close_paramdiv${this.TabNum}'><i class="fa fa-times" aria-hidden="true"></i></div>
                    </div>
                    </div>
                    </div>
                `);
        $('#paramdiv' + this.TabNum).append(result);
        this.FilterObj = (typeof (FilterDialog) !== "undefined") ? FilterDialog : {};
        if (this.FilterVal.length > 0) {
            //this.filterValues = this.FilterVal;
            //this.placefiltervalues();
            $.each(getFlatCtrlObjs(this.FilterObj.FormObj), function (i, obj) {
                var mapobj = getObjByval(this.FilterVal, "Name", obj.Name);
                if (typeof mapobj !== "undefined") {
                    let val = mapobj.Value;
                    obj.setValue(val);
                }
            }.bind(this));
        }
        $('#close_paramdiv' + this.TabNum).off('click').on('click', this.CloseParamDiv.bind(this));
        $("#btnGo").off("click").on("click", this.GetFilterValues.bind(this));
        $("#btnGo").empty().append("Apply");
        if (typeof FilterDialog !== "undefined") {
            $(".param-div-cont").show();
            //this.stickBtn = new EbStickButton({
            //    $wraper: $(".db-user-filter"),
            //    $extCont: $(".db-user-filter"),
            //    icon: "fa-filter",
            //    dir: "left",
            //    label: "Parameters",
            //    style: { top: "85px" },
            //    delay:1
            //});
            this.filterDialog = FilterDialog;
            //this.placefiltervalues();
            //if (this.FilterObj.FormObj.AutoRun) {
            //    if (!this.IsRendered) $("#btnGo").trigger("click");
            //    this.CloseParamDiv();
            //}
            $("#filter-dg").off("click").on("click", this.toggleFilter.bind(this));
        }
        else {
            $(".param-div-cont").hide();
            this.filterDialog = null;
        }
    };

    this.toggleFilter = function () {
        $(".db-user-filter").toggle('drop', { direction: 'right' }, 150);
    };

    this.CloseParamDiv = function () {
        $(".db-user-filter").hide(300);
    };

    this.placefiltervalues = function () {
        $.each(getFlatCtrlObjs(this.FilterObj.FormObj), function (i, obj) {
            var mapobj = getObjByval(this.FilterVal, "Name", obj.Name);
            if (typeof mapobj !== "undefined") {
                let val = mapobj.Value;
                obj.setValue(val);
            }
        }.bind(this));
    };


    this.DashboardDropdown = function () {
        let k = Object.keys(this.DashBoardList);
        let html = [`<div id="UserDashBoardSwitchList" class="DropMenuUserDash"  hide>`];
        ebcontext.header.setNameAsHtml(`<button class="DropDown4DB" id="UserDashBoardSwitchBtn"> ${this.EbObject.DisplayName} <span class="caret"></span> </button> `);
        for (let i = 0; i < k.length; i++) {
            if (this.DashBoardList[k[i]].RefId) {
                html.push(`<div style="padding:3px;"> <button class="Btn4SwitchDB btn btn-default" type="button" value="${this.DashBoardList[k[i]].RefId}">${this.DashBoardList[k[i]].DisplayName} </button></div>`);
            }
        }
        html.push("</div>");
        $("body").append(html.join(""));
        $('#objname #DashBoardObjectSelection').val(this.EbObject.RefId);
        $('.Btn4SwitchDB').off("click").on("click", this.DashBoardSwitch.bind(this));
        $('#objname #UserDashBoardSwitchBtn').off("click").on("click", this.DashBoardSwitchMenuShow.bind(this));
        $('#objname #UserDashBoardSwitchBtn').off("focusout").on("focusout", this.DashBoardSwitchMenuHide.bind(this));
    };

    this.DashBoardSwitchMenuShow = function () {
        var p = $("#UserDashBoardSwitchBtn").last();
        var offset = p.offset();
        $("#UserDashBoardSwitchList").css({ "top": (offset.top + 18), "left": offset.left });
        $("#UserDashBoardSwitchList").toggle();

    }
    this.DashBoardSwitchMenuHide = function () {
        // $("#UserDashBoardSwitchList").hide();

    }

    this.DashBoardSwitch = function (e) {
        $('.Btn4SwitchDB').removeAttr("disabled");
        let refid = e.target.getAttribute("value");
        $(`[Value=${refid}]`).attr("disabled", true);
        grid.removeAll();
        this.Version = this.DashBoardList[refid].VersionNumber;
        this.EbObject = this.DashBoardList[refid];
        this.Statu = this.DashBoardList[refid].Status;
        this.TileCollection = {};
        this.CurrentTile;
        this.filterDialogRefid = this.EbObject.Filter_Dialogue ? this.EbObject.Filter_Dialogue : "";
        this.init();
    }

    this.init = function () {
        this.loader.EbLoader("show");
        $(".grid-stack").removeAttr("style");
        if (this.DashBoardList) {
            this.DashboardDropdown();
        }
        else if (this.EbObject !== null) {
            //ebcontext.header.setName(this.EbObject.DisplayName);
            $("#objname").empty().append(this.EbObject.DisplayName);
        }
        else {
            this.loader.EbLoader("hide");
        }
        if (this.EbObject.RefId != "") $(`[Value=${this.EbObject.RefId}]`).attr("disabled", true);
        $("title").empty().append(this.EbObject.DisplayName);
        //
        if (this.EbObject.Filter_Dialogue === null || this.EbObject.Filter_Dialogue === undefined || this.EbObject.Filter_Dialogue === "" && this.EbObject.Tiles.$values.length !== 0) {
            this.EbObject.Filter_Dialogue = "";
            $('.db-user-filter').remove();
            $(".form-group #filter-dg").remove();
            grid.removeAll();
            this.GetFilterValuesForDataSource();
            this.DrawTiles();
        }
        else if (this.EbObject.Tiles.$values.length !== 0) {
            this.getColumns();
        }
        else {
            this.loader.EbLoader("hide");
        }
        let header = new EbHeader();
        header.clearHeader();
        header.addRootObjectHelp(this.EbObject);
        header.insertButton(`<button id="dashboard-refresh-btn" class='btn' title='Refresh'><i class="fa fa-refresh" aria-hidden="true"></i></button>`);
        $("#dashbord-user-view").off("click").on("click", ".tile-opt", this.TileOptions.bind(this));
        $("#dashboard-refresh-btn").off("click").on("click", this.DashBoardRefresh.bind(this));
        $(".link-dashboard-pane").off("click").on("click", this.TileslinkRedirectFn.bind(this));
        //$(".ext-linktoform").off("click").on("click", this.TileslinkRedirectFn.bind(this));
    }
    this.DashBoardRefresh = function () {
        this.IsRendered = false;
        grid.removeAll();
        this.init();
    };

    this.TileslinkRedirectFn = function (e) {
        let id = e.target.id;
        let href;
        if (id != "") {
            href = $(`#${id} .link-target`).attr('href');
        }
        //let href = e.target.attr('href');
        if (href === undefined) {
            id = e.target.parentElement.getAttribute("id");
            href = $(`#${id} .link-target`).attr('href');
        }
        if (href === undefined) {
            id = e.target.parentElement.parentElement.id;
            href = $(`#${id} .link-target`).attr('href');
        }
        if (href != undefined) {
            window.open(href, '_blank');
        }
    };
    this.DrawTiles = function () {
        grid.removeAll();
        this.Procs = {};
        //$("#layout_div").css("background-color", "").css("background-color", this.EbObject.BackgroundColor);
        Eb_Dashboard_Bg(this.EbObject);
        if (this.EbObject.Tiles.$values.length > 0) {
            for (let i = 0; i < this.EbObject.Tiles.$values.length; i++) {
                let currentobj = this.EbObject.Tiles.$values[i];
                let tile_id = "t" + i;
                let t_id = "tile" + i;
                let x = this.EbObject.Tiles.$values[i].TileDiv.Data_x;
                let y = this.EbObject.Tiles.$values[i].TileDiv.Data_y;
                let dh = this.EbObject.Tiles.$values[i].TileDiv.Data_height;
                let dw = this.EbObject.Tiles.$values[i].TileDiv.Data_width;
                grid.addWidget(`<div id="${tile_id}" eb-id="${t_id}" data-gs-min-width="7" data-gs-min-height="2">
               
                    <div class="grid-stack-item-content" id=${t_id}>
                    
                    <div id="${this.TabNum}_Label_${t_id}"></div>
                    <div data-id="${t_id}" class="db-tbl-wraper tile_dt_cont" id="${this.drop_id}">
                    </div></div></div>`, x, y, dw, dh, false);
                this.CurrentTile = t_id;
                this.TileCollection[t_id] = this.EbObject.Tiles.$values[i];
                let refid = this.EbObject.Tiles.$values[i].RefId;
                Eb_Tiles_StyleFn(this.TileCollection[this.CurrentTile], this.CurrentTile, this.TabNum);
                if (refid !== "") {
                    this.loader.EbLoader("show");
                    $(`[data-id = ${this.CurrentTile}]`).css("display", "block");
                    $.ajax(
                        {
                            url: '../DashBoard/DashBoardGetObj',
                            type: 'POST',
                            data: { refid: refid },
                            error: function (request, error) {
                                this.loader.EbLoader("hide");
                                EbPopBox("show", {
                                    Message: "Failed to get data from DataSourse",
                                    ButtonStyle: {
                                        Text: "Ok",
                                        Color: "white",
                                        Background: "#508bf9",
                                        Callback: function () {
                                            //$(".dash-loader").hide();
                                        }
                                    }
                                });
                            }.bind(this),
                            success: this.TileRefidChangesuccess.bind(this, this.CurrentTile)
                        });
                }
                else {
                    this.loader.EbLoader("show");
                    $(`#${this.TabNum}_restart_${t_id}`).remove();
                    $(`#${this.TabNum}_link_${t_id}`).remove();
                    $(`#${t_id}`).attr("eb-type", "gauge");
                    $(`#${t_id} .tile-header`).removeClass("tile-header");

                    this.waitDrawTiles = false;
                    this.EbObject.__continueDrawTiles = this.continueDrawTiles.bind(this, currentobj, t_id, tile_id);
                    $.each(currentobj.ComponentsColl.$values, function (i, Cobj) {
                        if (!this.Procs.hasOwnProperty(Cobj.EbSid)) {
                            this.Procs[Cobj.EbSid] = Cobj;
                            var Cobject = new EbObjects["EbDataObject"](Cobj.EbSid);
                            $.extend(Cobject, Cobj);
                            this.ComponentDrop("#component_cont", Cobject);
                            this.GetComponentColumns(Cobject);
                        }
                    }.bind(this));

                    if (!this.waitDrawTiles)
                        this.EbObject.__continueDrawTiles();
                }

            }
            //this.addTilecontext()
            //this.Tilecontext();
            grid.movable('.grid-stack-item', false);
            grid.resizable('.grid-stack-item', false);
        }
        else {
            //this.GridStackInit
            grid.movable('.grid-stack-item', false);
            grid.resizable('.grid-stack-item', false);
            this.loader.EbLoader("hide");
        }
    };

    this.continueDrawTiles = function (currentobj, t_id, tile_id) {
        this.EbObject.__continueDrawTiles = null;
        $.each(currentobj.ControlsColl.$values, function (i, obj) {
            var eb_type = obj.$type.split('.').join(",").split(',')[2].split("Eb")[1];
            this.makeElement(eb_type, obj);
            let object = this.Procs[this.currentId];
            this.TileCollection[t_id].ControlsColl.$values[i] = object;
            $(`[data-id="${this.CurrentTile}"]`).append(object.$Control[0]);
            //this.labelstyleApply(this.CurrentTile);
            if (eb_type === "Gauge") {
                if (object.DataObjCtrlName === "" || object.DataObjColName === "") {
                    let xx = EbGaugeWrapper(obj, { isEdit: false });
                }
                this.GaugeDrop(object.DataObjCtrlName, object.DataObjColName, object.EbSid, "Gauge");
            }
            else if (eb_type === "SpeedoMeter") {
                if (object.DataObjCtrlName === "" || object.DataObjColName === "") {
                    let xx = SpeedoMeterWrapper(obj, { isEdit: false });
                    this.loader.EbLoader("hide");
                }
                this.GaugeDrop(object.DataObjCtrlName, object.DataObjColName, object.EbSid, "speedometer");
            }
            else if (eb_type === "ProgressGauge") {
                if (object.DataObjCtrlName === "" || object.DataObjColName === "") {
                    let xx = ProgressGaugeWrapper(obj, { isEdit: false });
                }
                $(`#${object.EbSid}`).css("max-width", $(`#${object.EbSid}`).height() + 10 + "px");
                this.GaugeDrop(object.DataObjCtrlName, object.DataObjColName, object.EbSid, "ProgressGauge");
            }
        }.bind(this));
        Eb_Tiles_StyleFn(this.TileCollection[this.CurrentTile], this.CurrentTile, this.TabNum);
        $.each(currentobj.LabelColl.$values, function (i, obj) {

            if (currentobj.HiddenExpr && currentobj.HiddenExpr.Code && currentobj.HiddenExpr.Lang == 0) {
                try {
                    let valRes = new Function('Rowdata', `event`, atob(currentobj.HiddenExpr.Code)).bind(currentobj, this.Rowdata)();
                    if (valRes) {
                        $(`#${this.CurrentTile}`).hide();
                        return;
                    }
                }
                catch (e) {
                    console.error(e);
                }
            }

            var eb_type = obj.$type.split('.').join(",").split(',')[2].split("Eb")[1];
            this.makeElement(eb_type, obj);
            this.LabelDrop(obj.DataObjCtrlName, obj.DataObjColName, obj.EbSid);
            let object = this.Procs[this.currentId];
            let designHtml = this.MakeDashboardLabel(object);
            $(`[data-id="${this.CurrentTile}"]`).append(designHtml);
            this.labelstyleApply(this.CurrentTile);
            EbDataLabelFn(obj, this.CurrentTile);
            if (obj.Object_Selector)
                $(`[data-id="${this.CurrentTile}"] .label-cont`).off("click").on("click", this.DisplayBlockLink.bind(this))
            this.TileCollection[t_id].LabelColl.$values[i] = object;
        }.bind(this));
        if (currentobj.LinksColl) {
            $.each(currentobj.LinksColl.$values, function (i, obj) {

                if (currentobj.HiddenExpr && currentobj.HiddenExpr.Code && currentobj.HiddenExpr.Lang == 0) {
                    try {
                        let valRes = new Function('Rowdata', `event`, atob(currentobj.HiddenExpr.Code)).bind(currentobj, this.Rowdata)();
                        if (valRes) {
                            $(`#${this.CurrentTile}`).hide();
                            return;
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                }

                this.loader.EbLoader("show");
                var eb_type = obj.$type.split('.').join(",").split(',')[2].split("Eb")[1];
                this.makeElement(eb_type, obj);
                let object = this.Procs[this.currentId];
                let designHtml = this.MakeLinks(object);
                $(`[data-id="${this.CurrentTile}"]`).append(designHtml);
                $(`#${this.CurrentTile}`).addClass("eb-tile-link");
                //$(`#${this.CurrentTile} .db-title-parent`).addClass("eb-tile-link");//
                $(`#${this.CurrentTile} .db-title-parent`).css("display", "none");
                $(`#${this.CurrentTile} .db-title`).addClass("eb-tile-link");
                $(`#${tile_id}`).removeClass('ext-linktoform').addClass('ext-linktoform');
                this.labelstyleApply(this.CurrentTile);
                LinkStyle(obj, this.CurrentTile, this.TabNum, this.GetFilterValuesForDataSource());
                this.TileCollection[t_id].LinksColl.$values[i] = object;
                this.loader.EbLoader("hide");
                $(".link-dashboard-pane").off("click").on("click", this.TileslinkRedirectFn.bind(this));
                //$(".ext-linktoform").off("click").on("click", this.TileslinkRedirectFn.bind(this));
            }.bind(this));
        }
        if (currentobj.Transparent) {
            this.labelstyleApply(this.CurrentTile);
        }
        this.RedrwFnHelper(this.CurrentTile);
        this.loader.EbLoader("hide");
    };


    this.labelstyleApply = function (tileId) {
        $(`[data-id="${tileId}"]`).parent().css("background", "transparent");
        $(`[data-id="${tileId}"]`).parent().css("border", "0px solid");
        $(`[data-id="${tileId}"]`).parent().css("border", "0px solid");
        $(`#${tileId} .db-title`).empty();
        $(`#${tileId}`).addClass("user-control-tile-opt");
        $(`#${tileId} .i-opt-obj`).hide(); $(`#${tileId} .i-opt-restart`).hide();
        $(`#${tileId} .tile-header`).removeClass("tile-header");
    }

    this.GaugeDrop = function (component, column, controlname, type) {

        if (component !== "" && column !== "" && this.Rowdata[component + "Row"] !== null) {
            let abc = getObjByval(this.Procs[component].Columns.$values, "name", column);
            if (abc !== undefined) {
                let index = abc.data;
                let _data = this.Rowdata[component + "Row"][index];

                if (type === "ProgressGauge") {
                    this.Procs[controlname].GaugeValue = _data;
                    this.Procs[controlname].GaugeContainer = controlname;
                    ProgressGaugeWrapper(this.Procs[controlname], { isEdit: false });
                }
                else if (type === "Gauge") {
                    this.Procs[controlname].GaugeConfig.GaugeValue = _data;
                    this.Procs[controlname].GaugeConfig.GaugeContainer = controlname;
                    let xx = EbGaugeWrapper(this.Procs[controlname], { isEdit: true });
                }
                else if (type === "speedometer") {
                    this.Procs[controlname].GaugeValue = _data;
                    this.Procs[controlname].GaugeContainer = controlname;
                    SpeedoMeterWrapper(this.Procs[controlname], { isEdit: false });
                }
            }
        }
    };

    this.LabelDrop = function (component, column, controlname, tileid) {
        let val = getObjByval(this.Procs[component].Columns.$values, "name", column);
        if (component !== "" && column !== "" && val !== undefined && this.Rowdata[component + "Row"] !== null && this.Rowdata[component + "Row"] !== undefined) {
            let index = val.data;
            let _data = this.Rowdata[component + "Row"][index];
            this.Procs[controlname].DynamicLabel = _data;
            if (this.Procs[controlname].StaticLabel == "") {
                this.Procs[controlname].StaticLabel = column;
            }
            this.Procs[controlname].DataObjCtrlName = component;
            this.Procs[controlname].DataObjColName = column;
        }
    };

    this.makeElement = function (el, obj) {
        let ebtype = $(el).attr("eb-type");
        if (ebtype === undefined) {
            ebtype = el;
        }
        this.currentId = "tb" + this.TabNum + ebtype + CtrlCounters[ebtype + "Counter"]++;
        if (obj) { obj.EbSid = this.currentId; }
        this.Procs[this.currentId] = obj ? $.extend(new EbObjects["Eb" + ebtype](this.currentId), obj) : new EbObjects["Eb" + ebtype](this.currentId);
        this.dropedCtrlInit(this.Procs[this.currentId].$Control, ebtype, this.currentId);
    };
    this.MakeDashboardLabel = function (obj) {
        let a;
        if (obj.LabelStyle == 0) {
            a = `<div class="display-block label-cont" id="${obj.EbSid}" eb-type="DataLabel"> 
        <div class="card-icon" id="${obj.EbSid}_icon"><i class=""></i></div>
        <div id="${obj.EbSid}_Data_pane" class="Label_Data_pane" >
        <div class="lbl db-static-label" id="${obj.EbSid}_static"> ${obj.StaticLabel}</div>  
        <div class=" lbl db-label-desc"  id="${obj.EbSid}_description"></div>
        <div class="lbl db-dynamic-label" id="${obj.EbSid}_dynamic"> ${obj.DynamicLabel}</div>
        <div class="label-footer" id="${obj.EbSid}_footer"><div class="footer-inner"><i class="fa fa-address-book" aria-hidden="true"></i><label></label></div></div>
        </div></div>`;
        }
        else if (obj.LabelStyle == 1) {
            a = `<div class="display-block label2-cont" id="${obj.EbSid}" eb-type="DataLabel"> 
        <div id="${obj.EbSid}_Data_pane" class="Label_Data_pane" >
        <div class="card-icon" id="${obj.EbSid}_icon"><i class=""></i></div><div class='lb2-data'>
        <div class="lbl db-static-label" id="${obj.EbSid}_static"> ${obj.StaticLabel}</div>  
        <div class=" lbl db-label-desc"  id="${obj.EbSid}_description"></div>
        <div class="lbl db-dynamic-label" id="${obj.EbSid}_dynamic"> ${obj.DynamicLabel}</div>
        <div class="label-footer" id="${obj.EbSid}_footer"><div class="footer-inner"><i class="fa fa-address-book" aria-hidden="true"></i><label></label></div></div>
        </div></div></div>`;
        }
        else if (obj.LabelStyle == 2) {
            a = `<div class="display-block label3-cont" id="${obj.EbSid}" eb-type="DataLabel"> 
        <div id="${obj.EbSid}_Data_pane" class="Label_Data_pane" >
        <div class='lb3-data'>
        <div class="lbl db-static-label" id="${obj.EbSid}_static"> ${obj.StaticLabel}</div>  
        <div class=" lbl db-label-desc"  id="${obj.EbSid}_description"></div>
        <div class="lbl db-dynamic-label" id="${obj.EbSid}_dynamic"> ${obj.DynamicLabel}</div>
        <div class="label-footer" id="${obj.EbSid}_footer"><div class="footer-inner"><i class="fa fa-address-book" aria-hidden="true"></i><label></label></div></div>
        </div><div class="card-icon" id="${obj.EbSid}_icon"><i class=""></i></div>
        </div></div>`;
        }
        else if (obj.LabelStyle == 3) {
            a = `<div class="row display-block datalabel4 eb-full-width" id="${obj.EbSid}" eb-type="DataLabel">
            <div class="col-lg-4 col-sm-4 col-md-4 eb-full-height eb-nopadding icon-pane">
            <div class="icon4 eb-full-height" id="${obj.EbSid}_icon"><i></i></div></div>
            <div class="col-lg-8 col-sm-8 col-md-8 eb-full-height body-pane">
                <div class="card" id="${obj.EbSid}_Data_pane" style="width: 100%;">
                    <h5 class="card-header lbl" id="${obj.EbSid}_static"> ${obj.StaticLabel} </h5>
                    <div class="card-body">
<p class="card-text" id="${obj.EbSid}_description lbl"></p>
<p class="card-text" id="${obj.EbSid}_dynamic lbl">${obj.DynamicLabel}</p>
                    </div>
                <div class="card-footer text-muted" id="${obj.EbSid}_footer">
                <div class="row">
<div class="col-sm-3"><i class="fa fa-address-book" aria-hidden="true"></i></div>
<div class="col-sm-9 eb-nopadding"> <label></label></div>
                </div>
             </div>
            </div>
            </div> `;
        }
        else if (obj.LabelStyle == 4) {
            a = `<div class="row display-block datalabel5 eb-full-width" id="${obj.EbSid}" eb-type="DataLabel">
    <div class="col-lg-8 col-sm-8 col-md-8 eb-full-height body-pane">
        <div class="card eb-full-width" id="${obj.EbSid}_Data_pane" style="width: 100%;">
            <h5 class="card-header lbl" id="${obj.EbSid}_static"> ${obj.StaticLabel} </h5>
            <div class="card-body">
                <p class="card-text lbl" id="${obj.EbSid}_description">  </p>
                <p class="card-text" id="${obj.EbSid}_dynamic"> ${obj.DynamicLabel}</p>
            </div>
            <div class="card-footer text-muted" id="${obj.EbSid}_footer">
                <div class="row">
                    <div class="col-sm-3">
                        <i class="fa fa-address-book" aria-hidden="true"></i>
                    </div>
                    <div class="col-sm-9 eb-nopadding"> <label></label></div>
                </div>
            </div>
        </div>
    </div>
    <div class="col-lg-4 col-sm-4 col-md-4 eb-full-height eb-nopadding icon-pane">
        <div class="icon4 eb-full-height" id="${obj.EbSid}_icon"><i></i></div>
    </div>
</div>`;
        }
        return a;
    };

    this.MakeLinks = function (obj) {
        let a = `<div id="${obj.EbSid}" class="link-dashboard-pane"  eb-type="Links"> 
            <div id="${obj.EbSid}_icon" class="link-icon" >  <i class="fa fa-external-link-square"> </i> </div>
            <div id="${obj.EbSid}_text" class="link-text">  <div class="link-target" id="${obj.EbSid}_link" href="#" target="_blanc"></div> </div>
        </div>`;
        return a;
    };


    this.dropedCtrlInit = function ($ctrl, type, id) {
        $ctrl.attr("tabindex", "1");
        $ctrl.attr("id", id).attr("ebsid", id);
        $ctrl.attr("eb-type", type);
    };

    this.ComponentDrop = function (target, o) {

    };

    this.GetComponentColumns = function (obj) {
        let Refid = obj["DataSource"];
        this.Rowdata[obj.EbSid + "Row"] = null;
        //this.GetFilterValuesForDataSource();
        this.loader.EbLoader("show");
        this.waitDrawTiles = true;
        if (!obj.__syncObj) {
            obj.__syncObj = { sendReqts: 0, receiveReqts: 0 };
        }
        obj.__syncObj.sendReqts++;

        $.ajax({
            type: "POST",
            url: "../DS/GetData4DashboardControl",
            data: { DataSourceRefId: Refid, param: this.filtervalues },
            async: false,
            error: function (request, error) {
                this.loader.EbLoader("hide");
                EbPopBox("show", {
                    Message: "Failed to get data from DataSourse",
                    ButtonStyle: {
                        Text: "Ok",
                        Color: "white",
                        Background: "#508bf9",
                        Callback: function () {
                            //$(".dash-loader").hide();
                        }
                    }
                });
                obj.__syncObj.receiveReqts++;
                if (obj.__syncObj.sendReqts == obj.__syncObj.receiveReqts && this.EbObject.__continueDrawTiles) {
                    this.EbObject.__continueDrawTiles();
                }
            }.bind(this),
            success: function (resp) {
                obj["Columns"] = JSON.parse(resp.columns);
                //this.propGrid.setObject(obj, AllMetas["EbDataObject"]);
                this.DisplayColumns(obj);
                this.Rowdata[obj.EbSid + "Row"] = resp.row;
                this.loader.EbLoader("hide");

                obj.__syncObj.receiveReqts++;
                if (obj.__syncObj.sendReqts == obj.__syncObj.receiveReqts && this.EbObject.__continueDrawTiles) {
                    this.EbObject.__continueDrawTiles();
                }

            }.bind(this)
        });
    };

    this.DisplayColumns = function (obj) {
        $(`#${obj.EbSid} .eb-ctrl-label`).empty().append(obj.Name);
        $(`#Inner_Cont_${obj.EbSid}`).empty();
        for (let i = 0; i < obj['Columns'].$values.length; i++) {
            let column = obj['Columns'].$values[i];
            let name = column.name;
            $(`#Inner_Cont_${obj.EbSid}`).append(`<div data-ctrl='${obj.EbSid}' data-column='${name}' type=${column.Type} class='col-div-blk' eb-type="DataLabel"> ${name}</div>`);
        }
    };


    this.Ajax4fetchVisualization = function (refid) {
        this.loader.EbLoader("show");
        if (refid !== "") {
            $.ajax(
                {
                    url: '../DashBoard/DashBoardGetObj',
                    type: 'POST',
                    data: { refid: refid },
                    error: function (request, error) {
                        this.loader.EbLoader("hide");
                        EbPopBox("show", {
                            Message: "Failed to get data from DataSourse",
                            ButtonStyle: {
                                Text: "Ok",
                                Color: "white",
                                Background: "#508bf9",
                                Callback: function () {
                                    //$(".dash-loader").hide();
                                }
                            }
                        });
                    }.bind(this),
                    success: this.TileRefidChangesuccess.bind(this, this.CurrentTile)
                });
        }
    };


    this.TileOptions = function (e) {
        this.CurrentTile = e.target.getAttribute("tile-id");
        var id = e.target.getAttribute("link");
        if (id === "open") {
            //let TileRefid = this.TileCollection[tileid].RefId;
            this.linkDV = this.TileCollection[this.CurrentTile].RefId;
            let url = "../DV/dv?refid=" + this.linkDV;
            this.DvExternalLinkTrigger();
            //let _form = document.createElement("form");
            //_form.setAttribute("method", "post");
            //_form.setAttribute("action", url);
            //_form.setAttribute("target", "_blank");

            //let input1 = document.createElement('input');
            //input1.type = 'hidden';
            //input1.name = "filterValues";
            //input1.value = btoa(unescape(encodeURIComponent(JSON.stringify(this.filtervalues))));
            //_form.appendChild(input1);

            //document.body.appendChild(_form);

            //_form.submit();
            //document.body.removeChild(_form);
        }
        if (id === "refresh") {
            $(`[data-id="${this.CurrentTile}"]`).empty();
            let Refid = this.TileCollection[this.CurrentTile].RefId;
            this.Ajax4fetchVisualization(Refid);
        }
    };


    this.Tilecontext = function () {
        //$.contextMenu({
        //    selector: '.grid-stack-item-content',
        //    trigger: 'right',
        //    items: {
        //        "FullScreenView": {
        //            name: "Open in NewTab ", icon: "fa-external-link", callback: this.FullScreenViewTrigger.bind(this),
        //        },
        //    }
        //});
    };

    this.TileRefidChangesuccess = function (id, data) {
        if (this.FilterVal.length > 0) {
            this.filterValues = this.FilterVal;
            //this.placefiltervalues();
        }
        else if (this.filtervalues.length === 0 || this.filtervalues === undefined) {
            this.GetFilterValuesForDataSource();
        }
        let obj = JSON.parse(data);
        $(`[name-id="${id}"]`).empty().append(obj.DisplayName);
        if (obj.$type.indexOf("EbTableVisualization") >= 0) {
            this.AppendMenuForVisualization(id);
            $(`[data-id="${id}"]`).append(`<div id="content_tb1${id}" class="wrapper-cont"><table id="tb1${id}" class="table display table-bordered compact"></table></div>`);
            var o = {};
            o.dsid = obj.DataSourceRefId;
            o.tableId = "tb1" + id;
            o.containerId = id;
            o.columns = obj.Columns.$values;
            o.dvObject = obj;
            o.IsPaging = false;
            o.showFilterRow = false;
            o.showCheckboxColumn = false;
            o.Source = "DashBoard";
            o.drawCallBack = this.drawCallBack.bind(this, id);
            o.filterValues = btoa(unescape(encodeURIComponent(JSON.stringify(this.filtervalues))));
            var dt = new EbCommonDataTable(o);
            $(`#${id}`).addClass("box-shadow-style");
        }
        else if (obj.$type.indexOf("EbChartVisualization") >= 0) {
            this.AppendMenuForVisualization(id);
            $(`[data-id="${id}"]`).append(`<div id="canvasDivtb1${id}" class="CanvasDiv"></div>`);
            var o = {};
            o.tableId = "tb1" + id;
            o.dvObject = obj;
            o.filtervalues = this.filtervalues;
            o.zoomDisabled = obj.DisableZoom;
            var dt = new EbBasicChart(o);
            $(`[data-id="${id}"]`).parent().removeAttr("style");
            $(`#${id}`).addClass("box-shadow-style");
        }
        else if (obj.$type.indexOf("EbUserControl") >= 0) {
            //$(`[data-id="${id}"]`).append(`<div id="${id}_UserCtrl" class="Db-user-ctrl"></div>`);
            //let opts = {
            //    parentDiv: '#' + id + '_UserCtrl',
            //    refId: obj.RefId
            //}
            ////new EbUserCtrlHelper(opts);
            //$(`[data-id="${id}"]`).parent().css("background", "transparent");
            //$(`[data-id="${id}"]`).parent().css("border", "0px solid");
            //$(`[data-id="${id}"]`).parent().css("border", "0px solid");
            //$(`#${id} .db-title`).empty();
            //$(`#${id}`).addClass("user-control-tile-opt");
            //$(`#${id} .i-opt-obj`).hide();
            //$(`#${id} .i-opt-restart`).css({ "border": "solid 0px #dcdcdc" });
        }
        else if (obj.$type.indexOf("EbGoogleMap") >= 0) {
            this.AppendMenuForVisualization(id);
            $(`[data-id="${id}"]`).append(`<div id="canvasDivtb1${id}" class="CanvasDiv"></div>`);
            var o = {};
            o.tableId = "tb1" + id;
            o.dsobj = obj;
            o.Source = "Dashboard";
            o.filtervalues = this.filtervalues;
            o.googlekey = this.googlekey;
            var dt = new EbGoogleMap(o);
            $(`[data-id="${id}"]`).parent().removeAttr("style");
            $(`#${id}`).addClass("box-shadow-style");
        }
        this.loader.EbLoader("hide");
    };


    this.AppendMenuForVisualization = function (id) {
        debugger;
        try {
            $(`#${id}_grid_menu`).remove();
        }
        catch (err) {

        }
        finally {
            $(`#${id}`).parent().prepend(`            
                <div class="dropdown dropleft float-right" id="${id}_grid_menu">
                    <i class="fa fa-bars float-right " aria-hidden="true" dropdown-toggle" data-toggle="dropdown"></i>
                     <ul class="dropdown-menu">
                        <li><a class="grid-menu-list" link="open" tile-id="${id}">Open</a></li>
                        <li><a class="grid-menu-list" link="refresh" tile-id="${id}">Refresh</a></li>
                    </ul>
                </div>
             `);
            $(".grid-menu-list").off("click").on("click", this.TileOptions.bind(this));
        }
    }
    this.drawCallBack = function (id) {
        $(`[data-id="${id}"]`).parent().removeAttr("style");
        let a = $(`#${id} .dataTables_scrollHeadInner`).height() - 3;
        $(`#${id} .dataTables_scrollBody`).css("max-height", `calc(100% - ${a}px)`);
        Eb_Tiles_StyleFn(this.TileCollection[id], id, this.TabNum);
    }.bind(this);


    this.GetFilterValuesForDataSource = function () {
        this.filtervalues = [];
        if (this.filterDialog && this.EbObject.Filter_Dialogue != "")
            this.filtervalues = getValsForViz(this.filterDialog.FormObj);

        let temp = $.grep(this.filtervalues, function (obj) { return obj.Name === "eb_loc_id"; });
        if (temp.length === 0) {
            let abc = store.get("Eb_Loc-" + ebcontext.sid + ebcontext.user.UserId);
            this.filtervalues.push(new fltr_obj(11, "eb_loc_id", abc ? abc : 1));
        }
        temp = $.grep(this.filtervalues, function (obj) { return obj.Name === "eb_currentuser_id"; });
        if (temp.length === 0)
            this.filtervalues.push(new fltr_obj(11, "eb_currentuser_id", ebcontext.user.UserId));
        if (ebcontext.languages != undefined) {
            temp = $.grep(this.filtervalues, function (obj) { return obj.Name === "eb_current_language_id"; });
            if (temp.length === 0)
                this.filtervalues.push(new fltr_obj(11, "eb_current_language_id", ebcontext.languages.getCurrentLanguage()));

            temp = $.grep(this.filtervalues, function (obj) { return obj.Name === "eb_current_locale"; });
            if (temp.length === 0)
                this.filtervalues.push(new fltr_obj(16, "eb_current_locale", ebcontext.languages.getCurrentLocale()));
        }
        //if (this.stickBtn) { this.stickBtn.minimise(); }
        return this.filtervalues;
    };


    this.GetFilterValues = function () {
        this.IsRendered = true;
        this.loader.EbLoader("show");
        this.filtervalues = [];
        //if (this.stickBtn) { this.stickBtn.minimise(); }
        if (this.FilterVal.length > 0)
            this.filtervalues = this.FilterVal;
        else if (this.filterDialog)
            this.filtervalues = getValsForViz(this.filterDialog.FormObj);

        let temp = $.grep(this.filtervalues, function (obj) { return obj.Name === "eb_loc_id"; });
        if (temp.length === 0)
            this.filtervalues.push(new fltr_obj(11, "eb_loc_id", store.get("Eb_Loc-" + ebcontext.sid + ebcontext.user.UserId)));

        temp = $.grep(this.filtervalues, function (obj) { return obj.Name === "eb_currentuser_id"; });
        if (temp.length === 0)
            this.filtervalues.push(new fltr_obj(11, "eb_currentuser_id", ebcontext.user.UserId));

        if (ebcontext.languages !== undefined) {
            temp = $.grep(this.filtervalues, function (obj) { return obj.Name === "eb_current_language_id"; });
            if (temp.length === 0)
                this.filtervalues.push(new fltr_obj(11, "eb_current_language_id", ebcontext.languages.getCurrentLanguage()));

            temp = $.grep(this.filtervalues, function (obj) { return obj.Name === "eb_current_locale"; });
            if (temp.length === 0)
                this.filtervalues.push(new fltr_obj(16, "eb_current_locale", ebcontext.languages.getCurrentLocale()));
        }

        if (this.EbObject.Filter_Dialogue !== "") {
            this.Procs = {};
            CtrlCounters.DataLabelCounter = 0;
            CtrlCounters.DataObjectCounter = 0;
            //this.DrawTiles();
            grid.removeAll();
            setTimeout(this.DrawTiles.bind(this), 500);
            setTimeout(this.loader.EbLoader("show"), 1);
        }
        this.CloseParamDiv();
    };

    this.DisplayBlockLink = function (e) {
        this.linkDV = $(e.target.closest(".label-cont")).attr("ref-id");
        if (this.FilterVal.length > 0) {
            this.filtervalues = this.FilterVal;
        }
        else
            this.filtervalues = this.GetFilterValuesForDataSource();
        var splitarray = this.linkDV.split("-");
        if (splitarray[2] === "3") {
            var url = "../ReportRender/BeforeRender?refid=" + this.linkDV;
            var copycelldata = cData.replace(/[^a-zA-Z ]/g, "").replace(/ /g, "_");
            if ($(`#RptModal${copycelldata}`).length !== 0)
                $(`#RptModal${copycelldata}`).remove();
            $("body").append(`<div class="modal fade RptModal" id="RptModal${copycelldata}" role="dialog">
                <div class="modal-dialog modal-sm">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal">&times;</button>                              
                        </div>
                        <div class="modal-body"> <iframe id="reportIframe${copycelldata}" class="reportIframe" src='../ReportRender/Renderlink?refid=${this.linkDV}&_params=${btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValues))))}'></iframe>
            </div>
                    </div>
                </div>
            </div>
            `);
            $(`#RptModal${copycelldata}`).modal();
            $(`#reportIframe${copycelldata}`).css("height", "80vh");
            //else {
            //    $(`#RptModal${copycelldata}`).modal();
            //    $.LoadingOverlay("hide");
            //}
        }
        else if (splitarray[2] === "0") {
            let _locale = ebcontext.languages.getCurrentLocale();
            let url = "../webform/index?_r=" + this.linkDV + "_lo=" + _locale;
            var _form = document.createElement("form");
            _form.setAttribute("method", "post");
            _form.setAttribute("action", url);
            _form.setAttribute("target", "_blank");

            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_params";
            input.value = btoa(unescape(encodeURIComponent(JSON.stringify(this.filtervalues))));
            _form.appendChild(input);

            //input = document.createElement('input');
            //input.type = 'hidden';
            //input.name = "_mode";
            //input.value = this.dvformMode;
            //_form.appendChild(input);

            //input = document.createElement('input');
            //input.type = 'hidden';
            //input.name = "_locId";
            //input.value = store.get("Eb_Loc-" + this.TenantId + this.UserId);
            //_form.appendChild(input);

            document.body.appendChild(_form);
            _form.submit();
            document.body.removeChild(_form);
        }
        else if (splitarray[2] === "22") {
            this.tabNum++;
            let url = "../DashBoard/DashBoardView?refid=" + this.linkDV;

            let _form = document.createElement("form");
            _form.setAttribute("method", "post");
            _form.setAttribute("action", url);
            _form.setAttribute("target", "_blank");

            let input1 = document.createElement('input');
            input1.type = 'hidden';
            input1.name = "filterValues";
            input1.value = btoa(unescape(encodeURIComponent(JSON.stringify(this.filtervalues))));
            _form.appendChild(input1);

            let input2 = document.createElement('input');
            input2.type = 'hidden';
            input2.name = "tabNum";
            input2.value = this.tabNum;
            _form.appendChild(input2);

            document.body.appendChild(_form);

            //note I am using a post.htm page since I did not want to make double request to the page 
            //it might have some Page_Load call which might screw things up.
            //window.open("post.htm", name, windowoption);       
            _form.submit();
            document.body.removeChild(_form);
        }

        else {
            this.DvExternalLinkTrigger();
        }
    }

    this.placefiltervalues = function () {
        $.each(getFlatCtrlObjs(this.FilterObj.FormObj), function (i, obj) {
            let getobjval = getObjByval(this.filtervalues, "Name", obj.Name)
            if (getobjval !== undefined) {
                let val = getobjval.Value;
                obj.setValue(val);
            }
        }.bind(this));
    }

    this.DvExternalLinkTrigger = function () {
        var splitarray = this.linkDV.split("-");
        //this.filtervalues = this.GetFilterValuesForDataSource();
        this.TabNum++;
        let url = "../DV/dv?refid=" + this.linkDV;

        let _form = document.createElement("form");
        _form.setAttribute("method", "post");
        _form.setAttribute("action", url);
        _form.setAttribute("target", "_blank");

        let input = document.createElement('input');
        input.type = 'hidden';
        input.name = "rowData";

        //input.value = btoa(unescape(encodeURIComponent(JSON.stringify(this.rowData))));
        //_form.appendChild(input);

        let input1 = document.createElement('input');
        input1.type = 'hidden';
        input1.name = "filterValues";
        input1.value = btoa(unescape(encodeURIComponent(JSON.stringify(this.filtervalues))));
        _form.appendChild(input1);

        let input2 = document.createElement('input');
        input2.type = 'hidden';
        input2.name = "tabNum";
        input2.value = this.TabNum;
        _form.appendChild(input2);

        document.body.appendChild(_form);

        //note I am using a post.htm page since I did not want to make double request to the page 
        //it might have some Page_Load call which might screw things up.
        //window.open("post.htm", name, windowoption);       
        _form.submit();
        document.body.removeChild(_form);
    }

    this.init();
}


function LinkStyle(Obj, tile, TabNum) {
    $(`#${Obj.EbSid}_link`).text(Obj.LinkName);
}