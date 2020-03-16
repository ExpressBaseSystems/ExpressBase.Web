let DashBoardViewWrapper = function (options) {
    this.Version = options.Version;
    this.ObjType = options.ObjType;
    this.EbObject = options.dvObj;
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
    this.rowData = options.rowData ? JSON.parse(decodeURIComponent(escape(window.atob(options.rowData)))) : null;
    this.filtervalues = options.filterValues ? JSON.parse(decodeURIComponent(escape(window.atob(options.filterValues)))) : [];
    this.filterDialogRefid = this.EbObject.Filter_Dialogue ? this.EbObject.Filter_Dialogue : "";
    this.Procs = {};
    this.Rowdata = {};

    this.GridStackInit = function () {
        this.objGrid1 = $('.grid-stack').gridstack({ resizable: { handles: 'e, se, s, sw, w' }, column: 40 });
        this.grid = $('.grid-stack').data("gridstack");
        this.grid.cellHeight(20);
        $('.grid-stack').on('gsresizestop', this.Redrawfn.bind(this));
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
        $.post("../DashBoard/GetFilterBody", { dvobj: JSON.stringify(this.EbObject), contextId: "paramdiv" }, this.AppendFD.bind(this));
    };

    this.AppendFD = function (result) {
        $('.db-user-filter').remove();
        $("#dashbord-user-view").prepend(`
                <div id='paramdiv-Cont${this.TabNum}' class='db-user-filter'>
                <div id='paramdiv${this.TabNum}' class='param-div fd'>
                    <div class='pgHead'>
                        <h6 class='smallfont' style='font-size: 12px;display:inline'>Filter Dialogue</h6>
                        <div class="icon-cont  pull-right" id='close_paramdiv${this.TabNum}'><i class="fa fa-times" aria-hidden="true"></i></div>
                    </div>
                    </div>
                    </div>
                `);
        $('#paramdiv' + this.TabNum).append(result);
        $('#close_paramdiv' + this.TabNum).off('click').on('click', this.CloseParamDiv.bind(this));
        $("#btnGo").off("click").on("click", this.GetFilterValues.bind(this));
        if (typeof FilterDialog !== "undefined") {
            $(".param-div-cont").show();
            this.stickBtn = new EbStickButton({
                $wraper: $(".db-user-filter"),
                $extCont: $(".db-user-filter"),
                icon: "fa-filter",
                dir: "left",
                label: "Parameters",
                style: { top: "85px" }
            });
            this.filterDialog = FilterDialog;
            //this.placefiltervalues();
            $("#btnGo").trigger("click");
        }
        else {
            $(".param-div-cont").hide();
            this.filterDialog = null;
        }
    };

    this.CloseParamDiv = function () {
        this.stickBtn.minimise();
    }

    this.placefiltervalues = function () {
        $.each(getFlatControls(this.filterDialog.FormObj), function (i, obj) {
            var mapobj = getObjByval(this.filtervalues, "Name", obj.Name);
            if (typeof mapobj !== "undefined") {
                let val = mapobj.Value;
                obj.setValue(val);
            }
        }.bind(this));
    }


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
        this.grid.removeAll();
        this.Version = this.DashBoardList[refid].VersionNumber;
        this.EbObject = this.DashBoardList[refid];
        this.Statu = this.DashBoardList[refid].Status;
        this.TileCollection = {};
        this.CurrentTile;
        this.filterDialogRefid = this.EbObject.Filter_Dialogue ? this.EbObject.Filter_Dialogue : "";
        this.init();
    }

    this.init = function () {
        $(".grid-stack").removeAttr("style");
        if (this.DashBoardList) {
            this.DashboardDropdown();
        }
        else {
            ebcontext.header.setName(this.EbObject.DisplayName);
        }
        $(`[Value=${this.EbObject.RefId}]`).attr("disabled", true);
        $("title").empty().append(this.EbObject.DisplayName);
        //
        if (this.EbObject.Filter_Dialogue === null || this.EbObject.Filter_Dialogue === undefined || this.EbObject.Filter_Dialogue === "") {
            $('.db-user-filter').remove();
            if (this.stickBtn) { this.stickBtn.$stickBtn.remove(); }
            this.grid.removeAll();
            this.DrawTiles();
        }
        else {
            this.getColumns();
        }  
        $("#dashbord-user-view").off("click").on("click", ".tile-opt", this.TileOptions.bind(this));

    }

    this.DrawTiles = function () {
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
                $('.grid-stack').data('gridstack').addWidget($(`<div id="${tile_id}"> 
                    <div class="grid-stack-item-content" id=${t_id}>
                    <div style="display:flex" class="db-title-parent tile-header">
                    <div class="db-title" name-id="${t_id}" style="display:float"></div>
                    <div style="float:right;display:flex" u-id="${t_id}">
                    <i class="fa fa-retweet tile-opt i-opt-restart" aria-hidden="true" link="restart-tile" id="${this.TabNum}_restart_${t_id}"></i>
                    <i class="fa fa-external-link tile-opt i-opt-obj" aria-hidden="true" link="ext-link" id="${this.TabNum}_link_${t_id}"></i>
                    </div></div>
                    <div data-id="${t_id}" class="db-tbl-wraper tile_dt_cont_view">
                    </div></div></div>`), x, y, dw, dh, false);
                this.CurrentTile = t_id;
                this.TileCollection[t_id] = this.EbObject.Tiles.$values[i];
                let refid = this.EbObject.Tiles.$values[i].RefId;
                Eb_Tiles_StyleFn(this.TileCollection[this.CurrentTile], this.CurrentTile, this.TabNum);
                if (refid !== "") {
                    $(`[data-id = ${this.CurrentTile}]`).css("display", "block");
                    $.ajax(
                        {
                            url: '../DashBoard/DashBoardGetObj',
                            type: 'POST',
                            data: { refid: refid },
                            success: this.TileRefidChangesuccess.bind(this, this.CurrentTile)
                        });

                }
                else {
                    $(`#${this.TabNum}_restart_${t_id}`).remove();
                    $(`#${this.TabNum}_link_${t_id}`).remove();
                    $(`#${t_id}`).attr("eb-type", "gauge");
                    $(`#${t_id} .tile-header`).removeClass("tile-header");

                    $.each(currentobj.ComponentsColl.$values, function (i, Cobj) {
                        if (!this.Procs.hasOwnProperty(Cobj.EbSid)) {
                            this.Procs[Cobj.EbSid] = Cobj;
                            var Cobject = new EbObjects["EbDataObject"](Cobj.EbSid);
                            $.extend(Cobject, Cobj);
                            this.ComponentDrop("#component_cont", Cobject);
                            this.GetComponentColumns(Cobject);
                        }
                    }.bind(this));

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
                        var eb_type = obj.$type.split('.').join(",").split(',')[2].split("Eb")[1];
                        this.makeElement(eb_type, obj);
                        this.LabelDrop(obj.DataObjCtrlName, obj.DataObjColName, obj.EbSid);
                        let object = this.Procs[this.currentId];
                        let designHtml = this.MakeDashboardLabel(object);
                        $(`[data-id="${this.CurrentTile}"]`).append(designHtml);

                        this.labelstyleApply(this.CurrentTile);
                        EbDataLabelFn(obj);
                        this.TileCollection[t_id].LabelColl.$values[i] = object;
                    }.bind(this));
                    if (currentobj.LinksColl) {
                        $.each(currentobj.LinksColl.$values, function (i, obj) {
                            var eb_type = obj.$type.split('.').join(",").split(',')[2].split("Eb")[1];
                            this.makeElement(eb_type, obj);
                            let object = this.Procs[this.currentId];
                            let designHtml = this.MakeLinks(object);
                            $(`[data-id="${this.CurrentTile}"]`).append(designHtml);
                            this.labelstyleApply(this.CurrentTile);
                            LinkStyle(obj, this.CurrentTile, this.TabNum);
                            this.TileCollection[t_id].LinksColl.$values[i] = object;
                        }.bind(this));
                    }
                    if (currentobj.Transparent) {
                        this.labelstyleApply(this.CurrentTile);
                    }
                    this.RedrwFnHelper(this.CurrentTile);
                }
               
            }
            //this.addTilecontext()
            this.Tilecontext();
        }
        else {
            $('.grid-stack').gridstack();
        }
        var grid = $('.grid-stack').data('gridstack');
        grid.enableMove(false, true);
        grid.enableResize(false, true);
    }


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
        if (component !== "" && column !== "") {
            let index = getObjByval(this.Procs[component].Columns.$values, "name", column).data;
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
    };

    this.LabelDrop = function (component, column, controlname, tileid) {
        if (component !== "" && column !== "") {
            let index = getObjByval(this.Procs[component].Columns.$values, "name", column).data;
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
        let a = `<div class="label-cont" id="${obj.EbSid}" eb-type="DataLabel"> 
        <div class="card-icon" id="${obj.EbSid}_icon"><i class=""></i></div>
        <div id="${obj.EbSid}_Data_pane" class="Label_Data_pane" >
        <div class="lbl db-static-label" id="${obj.EbSid}_static"> ${obj.StaticLabel}</div>  
        <div class=" lbl db-label-desc"  id="${obj.EbSid}_description"></div>
        <div class="lbl db-dynamic-label" id="${obj.EbSid}_dynamic"> ${obj.DynamicLabel}</div>
        <div class="label-footer" id="${obj.EbSid}_footer"><div class="footer-inner"><i class="fa fa-address-book" aria-hidden="true"></i><label></label></div></div>
        </div></div>`;
        return a;
    };

    this.MakeLinks = function (obj) {
        let a = `<div id="${obj.EbSid}" class="link-dashboard-pane"  eb-type="Links"> 
          <i class="fa fa-external-link-square"> </i>
          <a id="${obj.EbSid}_link"></a>
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
        $.LoadingOverlay('show');
        $.ajax({
            type: "POST",
            url: "../DS/GetData4DashboardControl",
            data: { DataSourceRefId: Refid, param: this.filtervalues },
            async: false,
            success: function (resp) {
                obj["Columns"] = JSON.parse(resp.columns);
                //this.propGrid.setObject(obj, AllMetas["EbDataObject"]);
                $.LoadingOverlay('hide');
                this.DisplayColumns(obj);
                this.Rowdata[obj.EbSid + "Row"] = resp.row;
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
        if (refid !== "") {
            $.ajax(
                {
                    url: '../DashBoard/DashBoardGetObj',
                    type: 'POST',
                    data: { refid: refid },
                    success: this.TileRefidChangesuccess.bind(this, this.CurrentTile)
                });
        }
    }


    this.TileOptions = function (e) {
        var tileid = e.target.parentElement.getAttribute("u-id");
        this.CurrentTile = tileid;
        var id = e.target.getAttribute("link");
        if (id === "ext-link") {
            let TileRefid = this.TileCollection[tileid].RefId;
            //window.open(location.origin + "/DV/dv?refid=" + TileRefid, '_blank');
            let url = "../DV/dv?refid=" + TileRefid;

            let _form = document.createElement("form");
            _form.setAttribute("method", "post");
            _form.setAttribute("action", url);
            _form.setAttribute("target", "_blank");

            let input1 = document.createElement('input');
            input1.type = 'hidden';
            input1.name = "filterValues";
            input1.value = btoa(unescape(encodeURIComponent(JSON.stringify(this.filtervalues))));
            _form.appendChild(input1);

            document.body.appendChild(_form);

            _form.submit();
            document.body.removeChild(_form);
        }
        if (id === "restart-tile") {
            $(`[data-id="${this.CurrentTile}"]`).empty();
            let Refid = this.TileCollection[tileid].RefId;
            this.Ajax4fetchVisualization(Refid);
        }
    }


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
    }

    this.TileRefidChangesuccess = function (id, data) {
        if (this.filtervalues.length === 0 || this.filtervalues === undefined) {
            this.GetFilterValues();
        }
        let obj = JSON.parse(data);
        $(`[name-id="${id}"]`).empty().append(obj.DisplayName);
        if (obj.$type.indexOf("EbTableVisualization") >= 0) {

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
            $(`[data-id="${id}"]`).append(`<div id="canvasDivtb1${id}" class="CanvasDiv"></div>`);
            var o = {};
            o.tableId = "tb1" + id;
            o.dvObject = obj;
            o.filtervalues = this.filtervalues;
            var dt = new EbBasicChart(o);
            $(`[data-id="${id}"]`).parent().removeAttr("style");
            $(`#${id}`).addClass("box-shadow-style");
        }
        else if (obj.$type.indexOf("EbUserControl") >= 0) {
            $(`[data-id="${id}"]`).append(`<div id="${id}_UserCtrl" class="Db-user-ctrl"></div>`);
            let opts = {
                parentDiv: '#' + id + '_UserCtrl',
                refId: obj.RefId
            }
            new EbUserCtrlHelper(opts);
            $(`[data-id="${id}"]`).parent().css("background", "transparent");
            $(`[data-id="${id}"]`).parent().css("border", "0px solid");
            $(`[data-id="${id}"]`).parent().css("border", "0px solid");
            $(`#${id} .db-title`).empty();
            $(`#${id}`).addClass("user-control-tile-opt");
            $(`#${id} .i-opt-obj`).hide();
            $(`#${id} .i-opt-restart`).css({ "border": "solid 0px #dcdcdc" });
        }
        else if (obj.$type.indexOf("EbGoogleMap") >= 0) {
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
    }

    this.drawCallBack = function (id) {
        $(`[data-id="${id}"]`).parent().removeAttr("style");
        let a = $(`#${id} .dataTables_scrollHeadInner`).height() - 3;
        $(`#${id} .dataTables_scrollBody`).css("max-height", `calc(100% - ${a}px)`);
        Eb_Tiles_StyleFn(this.TileCollection[id], id, this.TabNum);
    }.bind(this);

    this.GetFilterValues = function () {
        this.filtervalues = [];

        if (this.filterDialog)
            this.filtervalues = getValsForViz(this.filterDialog.FormObj);

        let temp = $.grep(this.filtervalues, function (obj) { return obj.Name === "eb_loc_id"; });
        if (temp.length === 0)
            this.filtervalues.push(new fltr_obj(11, "eb_loc_id", store.get("Eb_Loc-" + ebcontext.sid + ebcontext.user.UserId)));
        temp = $.grep(this.filtervalues, function (obj) { return obj.Name === "eb_currentuser_id"; });
        if (temp.length === 0)
            this.filtervalues.push(new fltr_obj(11, "eb_currentuser_id", ebcontext.user.UserId));
        if (this.filterDialogRefid !== "") {
            this.grid.removeAll();
            this.DrawTiles();
        }
        if (this.stickBtn) { this.stickBtn.minimise(); }
    };
    this.init();
}


function LinkStyle(Obj, tile, TabNum) {
    $(`#${Obj.EbSid}_link`).text(Obj.LinkName);
}