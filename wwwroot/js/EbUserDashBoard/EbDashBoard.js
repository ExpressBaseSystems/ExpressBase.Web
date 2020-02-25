﻿var grid;
var icon = { 16: "fa-table", 21: "fa-map-marker", 17: "fa-bar-chart", 14: "fa-tags" }
var DashBoardWrapper = function (options) {
    this.RefId = options.RefId;
    this.Version = options.Version;
    this.ObjType = options.ObjType;
    this.EbObject = options.dvObj;
    this.Statu = options.Statu
    this.TabNum = options.TabNum;
    this.ServiceUrl = options.ServiceUrl;
    this.Wc = options.Wc;
    this.Cid = options.Cid;
    this.TileCollection = {};
    this.CurrentTile;
    this.CurrentRefid;
    this.googlekey = options.googlekey || null;
    this.NewTileCount = (options.dvObj !== null) ? options.dvObj.TileCount : 2;
    this.ebObjList = options.EbObjList;
    this.ObjTypeName = { 16: "TableVisualization", 17: "ChartVisualization", 14: "UserControl", 21: "GoogleMap" };
    this.ObjIcons = { 16: "fa fa-table", 17: "fa fa-bar-chart", 14: "fa fa-puzzle-piece", 21: "fa fa-map-marker" };
    this.rowData = options.rowData ? JSON.parse(decodeURIComponent(escape(window.atob(options.rowData)))) : null;
    this.filtervalues = options.filterValues ? JSON.parse(decodeURIComponent(escape(window.atob(options.filterValues)))) : [];
    this.toolboxhtml = options.Toolhtml;
    this.Procs = {};
    this.Rowdata = {};
    this.currentGaugeSrc;
    this.EbParams = {
        Icons: {
            "Numeric": "fa-sort-numeric-asc",
            "String": "fa-font",
            "DateTime": "fa-calendar",
            "Bool": ""
        },
        EbType: {
            "Numeric": "ParamNumeric",
            "String": "ParamText",
            "DateTime": "ParamDateTime",
            "Bool": "ParamBoolean"
        }
    };

    if (this.EbObject !== null) {
        this.filterDialogRefid = this.EbObject.Filter_Dialogue ? this.EbObject.Filter_Dialogue : "";
    }

    this.GridStackInit = function () {
        this.objGrid1 = $('.grid-stack').gridstack({ resizable: { handles: 'e, se, s, sw, w' },  column: 40 });
        this.grid = $('.grid-stack').data("gridstack");
        this.grid.cellHeight(20);
        //this.grid.cellWidth(20);
        grid = this.grid;
        $('.grid-stack').on('gsresizestop', this.Redrawfn.bind(this));
    }

    //$('.grid-stack').on('gsresizestop', function (event, elem) {
    //    var newHeight = $(elem).attr('data-gs-height');
    //    var id = $(elem).context.children[0].id;
    //    this.Redrawfn();
    //});

    this.Redrawfn = function (items, element) {
        var newHeight = $(element).attr('data-gs-height');
        var id = $(element).context.children[0].id;
        let currentobj = this.TileCollection[id];
        var height =  $(`[data-id=${id}`).height();
        $.each(currentobj.ControlsColl.$values, function (i, obj) {
            $(`[data-id=${id}] #${obj.EbSid}`).css("max-height", `${height} !important`);
            var eb_type = obj.$type.split('.').join(",").split(',')[2].split("Eb")[1];
            //this.labelstyleApply(this.CurrentTile);
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

    this.getColumns = function () {
        $.post("../DashBoard/GetFilterBody", { dvobj: JSON.stringify(this.EbObject), contextId: "paramdiv" }, this.AppendFD.bind(this));
    };

    this.AppendFD = function (result) {
        $('.param-div-cont').remove();
        $("#dashbord-view").prepend(`
                <div id='paramdiv-Cont${this.TabNum}' class='param-div-cont'>
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
                $wraper: $(".param-div-cont"),
                $extCont: $(".param-div-cont"),
                icon: "fa-filter",
                dir: "left",
                label: "Parameters",
                style: { top: "230px" }
            });
            this.filterDialog = FilterDialog;
        }
        else {
            $(".param-div-cont").hide();
            this.filterDialog = null;
        }
        this.propGrid.setObject(this.EbObject, AllMetas["EbDashBoard"]);

    };

    this.CloseParamDiv = function () {
        this.stickBtn.minimise();
    };

    //Toolbox
    this.AppendToolBox = function () {
        $('.ToolBox-div').remove();
        $("#toolbox-dashboard").prepend(`
                <div id='ToolBox-div${this.TabNum}' class='ToolBox-div'>
                <div id='ToolBoxdiv${this.TabNum}' class='ToolBoxdiv fd'>
                    <div class='pgHead'>
                        <h6 class='smallfont' style='font-size: 12px;display:inline'>ToolBox</h6>
                        <div class="icon-cont  pull-right" id='close_ToolBoxdiv${this.TabNum}'><i class="fa fa-times" aria-hidden="true"></i></div>
                    </div>
                    <div id="mySidenav" class="sidenav">
                    <div class="search-div"> <input type="search" id="DashB-Search" placeholder="search.." /> </div>
                    <div id="DashB-Searched-Obj" hidden> </div>
                    <div id="Eb-obj-sidebar-cont">   </div>
                    </div>
                    </div>
                    </div>
                `);
       $("#Eb-obj-sidebar-cont").append(this.toolboxhtml);
       this.DrawObjectOnMenu();
        $('#close_ToolBoxdiv' + this.TabNum).off('click').on('click', this.CloseToolBoxDiv.bind(this));
        $(".ToolBox-div").hide();
        this.stickBtn4ToolBox = new EbStickButton({
            $wraper: $(".ToolBox-div"),
            $extCont: $(".ToolBox-div"),
            icon: "fa-wrench",
            dir: "left",
            label: "ToolBox",
            style: { top: "105px" }
        });
        this.stickBtn4ToolBox.minimise();
    };

    this.CloseToolBoxDiv = function () {
        this.stickBtn4ToolBox.minimise();
    };

    this.DrawObjectOnMenu = function () {
        let myarr4EbType = [];

        let containers = [];
        $("#Eb-obj-sidebar-cont").append(`<div class="tool_item_head" data-toggle="collapse" data-target="#toolbox_view_${this.TabNum}"> <i class="fa fa-caret-down"></i>  Views</div>
            <div id="toolbox_view_${this.TabNum}" ebclass="tool-sec-cont" class="tool-sec-cont collapse in"> </div>`);
        $.each(this.ebObjList, function (key, Val) {
            $.each(Val, function (i, Obj) {
                if (myarr4EbType.indexOf(Obj.EbObjectType) === -1) {
                    $(`#toolbox_view_${this.TabNum}`).append(`
                        <div class="tool_item_inner_head" data-toggle="collapse"  aria-expanded="false" aria-controls="${this.ObjTypeName[Obj.EbObjectType]}_${this.TabNum}" data-target="#${this.ObjTypeName[Obj.EbObjectType]}_${this.TabNum}" style="padding-left:30px"><i class="fa fa-caret-down"></i> ${this.ObjTypeName[Obj.EbObjectType]} </div>
                        <div id="${this.ObjTypeName[Obj.EbObjectType]}_${this.TabNum}")" ebclass="tool-sec-cont" class="tool-sec-cont collapse in views_cont" style="" >
                            <div refid="${Obj.RefId}" class="db-draggable-obj" data-toggle="tooltip" title="${Obj.DisplayName}"> <i class="obj-icon fa ${icon[Obj.EbObjectType]}"> </i>${Obj.DisplayName}</div></div>
                        </div>`);
                    myarr4EbType.push(Obj.EbObjectType);
                    containers.push(document.getElementById(`${this.ObjTypeName[Obj.EbObjectType]}_${this.TabNum}`));

                }
                else {
                    $(`#${this.ObjTypeName[Obj.EbObjectType]}_${this.TabNum}`).append(` <div refid="${Obj.RefId}" class="db-draggable-obj" data-toggle="tooltip" title="${Obj.DisplayName}"> <i class="obj-icon fa ${icon[Obj.EbObjectType]}"> </i>${Obj.DisplayName}</div>`);

                }
            }.bind(this));


        }.bind(this));
        
        //containers.push(document.getElementById("grid-cont"));
        containers.push(document.getElementById("toolb_basic_ctrls"));
        containers.push(document.getElementById("toolb_ph_cont_ctrls"));
        containers.push(document.getElementById("component_cont"));
        //containers.push(document.getElementById('grid-cont'));

        this.drake = dragula(containers, {
            copy: true,
            accepts: this.acceptfn,
        });
        this.drake.off("drag").on("drag", this.columnsdrag.bind(this));
        this.drake.off("shadow").on("shadow", this.columnsshadow.bind(this));
        this.drake.off("drop").on("drop", this.columnsdrop.bind(this));
    };

    this.acceptfn = function (el, target, source, sibling) {
        if (source === target) {
            return false;
        }
        else {
            if (($(source).hasClass("views_cont") || $(source).attr("id") === "toolb_basic_ctrls") && $(target).attr("id") === "component_cont")
                return false;
            else if ($(source).attr("id") === "toolb_ph_cont_ctrls" && $(target).attr("id") === "grid-cont")
                return false;
            else if (($(source).hasClass("views_cont") || $(source).attr("id") === "toolb_ph_cont_ctrls") && $(target).hasClass("tile_dt_cont"))
                return false;
            else
                return true;
        }// elements can be dropped in any of the `containers` by default
    };

    this.columnsdrag = function (el, source) {
        this.currentGaugeSrc = el;
        //this.drake.containers.push(document.getElementById("component_cont"));
        if ($(source) === $("#grid-cont")) {
            return false;
        }
        //else if ($(source).hasClass("data-reader-popup")) {
        //    this.drake.containers = this.drake.containers.filter(function (value)
        //    {
        //        return value != document.getElementById("component_cont");
        //    });      
        //}
        else {
            if (this.drake.containers.indexOf($("#grid-cont") === -1)) {

                this.drake.containers.push(document.getElementById('grid-cont'));
                return true;
            }
        }
    };

    this.columnsshadow = function (el, container, source) {
        if (source === $("#grid-cont")) {
            return false;
        }
    };

    this.columnsdrop = function (el, target, source, sibling) {
        this.drake.containers = this.drake.containers.filter(function (value) {
            return value != document.getElementById('grid-cont');
        });
        this.VisRefid = el.getAttribute("refid");
        el.remove();
        if (target && source !== null) {
            if ($(target).attr("id") === "grid-cont" && $(source).hasClass("views_cont")) {
                let a = this.AddNewTile();
                this.TileCollection[this.CurrentTile].RefId = this.VisRefid;
                $.ajax(
                    {
                        url: '../DashBoard/DashBoardGetObj',
                        type: 'POST',
                        data: { refid: this.VisRefid },
                        success: this.TileRefidChangesuccess.bind(this, this.CurrentTile)
                    });
            }
            //Add new Gauge
            else if ($(target).attr("id") === "grid-cont" && $(source).attr("id") === "toolb_basic_ctrls") {
                let eb_type = $(this.currentGaugeSrc).attr("eb-type");
                let drop_id = this.AddNewTile(10, 5);
                this.makeElement(el);
                let obj = this.Procs[this.currentId];
                $(`#${drop_id}`).append(obj.$Control[0]);
                this.drake.containers.push(document.getElementById(drop_id));
                this.drake.containers.push(document.getElementById(obj.EbSid));
                this.TileCollection[this.CurrentTile].ControlsColl.$values.push(obj);
                if (eb_type === "Gauge") {
                    let xx = EbGaugeWrapper(obj, { isEdit: false });
                }
                if (eb_type === "ProgressGauge") {
                    let xx = ProgressGaugeWrapper(obj, { isEdit: false });
                }
                if (eb_type === "SpeedoMeter") {
                    let xx = SpeedoMeterWrapper(obj, { isEdit: false });
                }
            }
            //Add new Gauge to existing tile
            else if ($(target).hasClass("tile_dt_cont") && $(source).attr("id") === "toolb_basic_ctrls") {
                this.makeElement(el);
                let obj = this.Procs[this.currentId];
                $(target).append(obj.$Control[0]);
                var eb_type = obj.$type.split('.').join(",").split(',')[2].split("Eb")[1];
                this.drake.containers.push(document.getElementById(obj.EbSid));
                this.TileCollection[$(target).attr("data-id")].ControlsColl.$values.push(obj);
                if (eb_type === "Gauge") {
                    let xx = EbGaugeWrapper(obj, { isEdit: false });
                }
                if (eb_type === "ProgressGauge") {
                    let xx = ProgressGaugeWrapper(obj, { isEdit: false });
                }
                if (eb_type === "SpeedoMeter") {
                    let xx = SpeedoMeterWrapper(obj, { isEdit: false });
                }
            }
            //Connect Gauge Value from component Container
            else if ($(target).hasClass("gaugeChart") && $(source).hasClass("inner_tree_structure")) {
                let component = $(el).attr("data-ctrl");
                let column = $(el).attr("data-column");
                let controlname = $(target).attr("id");
                let tileId = $(target).parent().attr("data-id");
                let obj = getObjByval(this.TileCollection[tileId].ControlsColl.$values, "EbSid", controlname);
                obj.DataObjCtrlName = component;
                obj.DataObjColName = column;
                this.TileCollection[tileId].ComponentsColl.$values.push(this.Procs[component]);
                this.GaugeDrop(component, column, controlname, "Gauge");
            }
            //Add new Component
            else if ($(target).attr("id") === "component_cont" && $(source).attr("id") === "toolb_ph_cont_ctrls") {
                this.makeElement(el);
                let o = this.Procs[this.currentId];
                this.ComponentDrop(target, o);
            }
            //Add Labels 
            else if ($(target).hasClass("grid-stack") && $(source).hasClass("inner_tree_structure")) {
                let drop_id = this.AddNewTile(8, 3);
                this.makeElement(el);
                let o = this.Procs[this.currentId];
                let component = $(el).attr("data-ctrl");
                let column = $(el).attr("data-column");
                let controlname = o.EbSid;
                let tileId = drop_id.split("_")[1];
                this.LabelDrop(component, column, controlname, drop_id.split("_")[1]);
                $(`#${drop_id}`).append(this.MakeDashboardLabel(o));
                this.labelstyleApply(tileId);
                Eb_Tiles_StyleFn(this.TileCollection[this.CurrentTile], tileId , this.TabNum) 
                this.TileCollection[tileId].ComponentsColl.$values.push(this.Procs[component]);
                this.drake.containers.push(document.getElementById(drop_id));
                this.drake.containers.push(document.getElementById(o.EbSid));
                this.TileCollection[this.CurrentTile].LabelColl.$values.push(o);
            }
            //Add Label tp existing tile
            else if ($(target).hasClass("tile_dt_cont") && $(source).hasClass("inner_tree_structure")) {
                this.makeElement(el);
                let o = this.Procs[this.currentId];
                let component = $(el).attr("data-ctrl");
                let column = $(el).attr("data-column");
                let controlname = o.EbSid;
                let tileId = $(target).parent().attr("id");
                let drop_id = $(target)[0].getAttribute("id");
                this.LabelDrop(component, column, controlname, tileId);
                $(target).append(this.MakeDashboardLabel(o));
                this.drake.containers.push(document.getElementById(drop_id));
                this.drake.containers.push(document.getElementById(o.EbSid));
                this.TileCollection[this.CurrentTile].LabelColl.$values.push(o);
            }

              //Connect progressGauge to exisitng gauge
            else if ($(target).hasClass("progressGauge") && $(source).hasClass("inner_tree_structure")) {
                let component = $(el).attr("data-ctrl");
                let column = $(el).attr("data-column");
                let controlname = $(target).attr("id");
                let tileId = $(target).parent().attr("data-id");
                let obj = getObjByval(this.TileCollection[tileId].ControlsColl.$values, "EbSid", controlname);
                obj.DataObjCtrlName = component;
                obj.DataObjColName = column;
                this.TileCollection[tileId].ComponentsColl.$values.push(this.Procs[component]);
                this.GaugeDrop(component, column, controlname, "ProgressGauge");
            }
                //Connect speedometer to exisitng gauge
            else if ($(target).hasClass("speedometer") && $(source).hasClass("inner_tree_structure")) {
                let component = $(el).attr("data-ctrl");
                let column = $(el).attr("data-column");
                let controlname = $(target).attr("id");
                let tileId = $(target).parent().attr("data-id");
                let obj = getObjByval(this.TileCollection[tileId].ControlsColl.$values, "EbSid", controlname);
                obj.DataObjCtrlName = component;
                obj.DataObjColName = column;
                this.TileCollection[tileId].ComponentsColl.$values.push(this.Procs[component]);
                this.GaugeDrop(component, column, controlname, "speedometer");
            }

            $("#component_cont .Eb-ctrlContainer").off("click").on("click", this.FocusOnControlObject.bind(this));
        }

    };

    this.labelstyleApply = function (tileId) {
        //$(`[data-id="${tileId}"]`).parent().css("background", "transparent");
        $(`[data-id="${tileId}"]`).parent().css("border", "0px solid");
        $(`[data-id="${tileId}"]`).parent().css("border", "0px solid");
        $(`#${tileId} .db-title`).empty();
        $(`#${tileId}`).addClass("user-control-tile-opt");
        $(`#${tileId} .i-opt-obj`).hide();
        $(`#${tileId} .i-opt-restart`).css({ "border": "solid 0px #dcdcdc" });
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
        <div class="db-static-label" id="${obj.EbSid}_static"> ${obj.StaticLabel}</div>  
        <div class="db-label-desc"  id="${obj.EbSid}_description"></div>
        <div class="db-dynamic-label" id="${obj.EbSid}_dynamic"> ${obj.DynamicLabel}</div></div>`;
        return a;
    };

    this.ComponentDrop = function (target, o) {
        $(target).append(o.$Control[0]);
        $(`#${o.$Control[0].id} .Dt-Rdr-col-cont`).append(`<div  id="Inner_Btn_${o.EbSid}" class="inner_col_up" target-id="${o.EbSid}" rel="popover" data-content="" data-original-title="A Title">
                  <i class="fa fa-angle-up" aria-hidden="true"></i> </div>`);
        //$("#component_columns_cont").append(`<div id="Inner_Cont_${o.EbSid}" style="display:none" class="component_col_div"> 
        //    <ul id="Inner_tree_${o.EbSid}" class="inner_com_col_cont"> </ul> 
        //    </div></div>`);
        $("#component_columns_cont").append(`<div id="Inner_Cont_${o.EbSid}" style="display:none" class="component_colomn_div">
              <div class="inner_component_colomn_div"><ul id="Inner_tree_${o.EbSid}" class="inner_tree_structure"> </ul></div>
              <div id="tailShadow"></div>
              <div id="tail1"></div>
              <div id="tail2"></div>
            </div>`);
        this.propGrid.setObject(o, AllMetas["EbDataObject"]);
        this.drake.containers.push(document.getElementById(`Inner_tree_${o.EbSid}`));
        $(`#Inner_Btn_${o.EbSid}`).off("click").on("click", this.ComponentColumContainerShow.bind(this));
        //$(`#Inner_Btn_${o.EbSid}`).off("click").on("click", this.PopOverTest.bind(this));

    };
    //this.PopOverTest = function (e) {
    //    var TargetId = e.target.getAttribute("target-id");
    //    if (TargetId == null) { TargetId = $(e.target).parent()[0].getAttribute("target-id"); }      
    //    $('[rel=popover]').popover({
    //        html: true,
    //        title: 'Schedule an appointment',
    //        content: function() {
    //            this.drake.containers.push(document.getElementById(`Inner_tree_${TargetId}`));
    //            return $(`#Inner_Cont_${TargetId}`).html();              
    //        }.bind(this),           
    //    }); 
       
    //};

    //Component Division
    this.ComponentColumContainerShow = function (e) {
        let TargetId = e.target.getAttribute("target-id");
        if (TargetId == null) { TargetId = $(e.target).parent()[0].getAttribute("target-id"); }
        var p = $(e.target).last();
        var offset = p.offset();
        var percentLeft = offset.left / $(window).width() * 100;
        var percentTop = offset.top / $(window).height() * 100;
        $(`#Inner_Cont_${TargetId}`).css({ "top": percentTop - 22 + "%", "left": percentLeft - 11 +  "%" })
        $(`#Inner_Cont_${TargetId}`).toggle();
    };

    this.FocusOnControlObject = function (e) {
        let elem = $(e.target).closest("Eb-ctrlContainer");
        let id = elem.attr("id");
        if (id === undefined) {
            elem = $($(e.target).parents(".Eb-ctrlContainer")[0]);
            id = elem.attr("id");
        }
        let eb_type = elem.attr("eb-type");
        if (eb_type == "DataObject") {
            this.propGrid.setObject(this.Procs[id], AllMetas["EbDataObject"]);
        }
    };



    this.dropedCtrlInit = function ($ctrl, type, id) {
        $ctrl.attr("tabindex", "1");
        $ctrl.attr("id", id).attr("ebsid", id);
        $ctrl.attr("eb-type", type);
    };


    this.GenerateButtons = function () {

    };

    this.sideBarHeadToggle = function (e) {
        let abc = e.target.getAttribute("hs-id");
        $(`#${abc}`).toggle(100);

    };

    this.init = function () {
        this.AppendToolBox();

        if (this.EbObject === null) {
            this.edit = false;
            this.EbObject = new EbObjects.EbDashBoard(`EbDashBoar${Date.now()}`);
            this.filterDialogRefid = "";
        }
        else
            this.edit = true;
        this.propGrid = new Eb_PropertyGrid({
            id: "propGrid",
            wc: this.Wc,
            cid: this.Cid,
            $extCont: $("#ppt-dash"),
            isDraggable: true
        });
        this.propGrid.setObject(this.EbObject, AllMetas["EbDashBoard"]);
        this.propGrid.PropertyChanged = this.popChanged.bind(this);
        commonO.Current_obj = this.EbObject;
        this.propGrid.ClosePG();
        if (this.filterDialogRefid == "") {
            this.DrawTiles();
        }
        else {
            this.getColumns();
        }

        $("#dashbord-view").on("click", ".tile-opt", this.TileOptions.bind(this));
        $("#mySidenav").on("click", ".sidebar-head", this.sideBarHeadToggle.bind(this));
        $("#DashB-Search").on("keyup", this.DashBoardSearch.bind(this));
        $('#myDropdown').on('hide.bs.dropdown', this.DropDownClose.bind(this));
        $('#myDropdown').on('click.bs.dropdown.data-api', '.dropdown.keep-inside-clicks-open', this.DropDownClose2.bind(this));
    }

    this.DropDownClose = function (e) {
        if (e.clickEvent) {
            e.preventDefault();
        }
    };

    this.DropDownClose2 = function (e) {
        if (e.clickEvent) {
            e.stopPropagation();
        }
    };

    this.TileOptions = function (e) {
        var tileid = e.target.parentElement.getAttribute("u-id");
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
        else if (id === "close") {
            var abc = $(`#${tileid}`).closest(".grid-stack-item");
            var grid = $('.grid-stack').data('gridstack');
            grid.removeWidget(abc);
        }
        else if (id === "restart-tile") {
            $(`[data-id="${this.CurrentTile}"]`).empty();
            let Refid = this.TileCollection[tileid].RefId;
            this.Ajax4fetchVisualization(Refid);
        }
    }

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

    this.DrawTiles = function () {
        $("#layout_div").css("background-color", "").css("background-color", this.EbObject.BackgroundColor);
        $(".component_cont .nav").css("background-color", "").css("background-color", this.EbObject.BackgroundColor);
        if (this.EbObject.Tiles.$values.length > 0) {

            for (let i = 0; i < this.EbObject.Tiles.$values.length; i++) {
                let currentobj = this.EbObject.Tiles.$values[i];
                let tile_id = "t" + i;
                let t_id = "tile" + i;
                let x = this.EbObject.Tiles.$values[i].TileDiv.Data_x;
                let y = this.EbObject.Tiles.$values[i].TileDiv.Data_y;
                let dh = this.EbObject.Tiles.$values[i].TileDiv.Data_height;
                let dw = this.EbObject.Tiles.$values[i].TileDiv.Data_width;
                this.drop_id = "drop_" + t_id;
                $('.grid-stack').data('gridstack').addWidget($(`<div id="${tile_id}"> 
                    <div class="grid-stack-item-content" id=${t_id}>
                    <div style="display:flex" class="db-title-parent">
                    <div class="db-title" name-id="${t_id}" style="display:float"></div>
                    <div style="float:right;display:flex" u-id="${t_id}">
                    <i class="fa fa-retweet tile-opt i-opt-restart" aria-hidden="true" link="restart-tile" id="${this.TabNum}_restart_${t_id}"></i>
                    <i class="fa fa-external-link tile-opt i-opt-obj" aria-hidden="true" link="ext-link" id="${this.TabNum}_link_${t_id}"></i>
                    <i class="fa fa-times tile-opt i-opt-close" aria-hidden="true" link="close" id="${this.TabNum}_close_${t_id}"></i>
                    </div></div>
                    <div id="${this.TabNum}_Label_${t_id}"></div>
                    <div data-id="${t_id}" class="db-tbl-wraper tile_dt_cont" id="${this.drop_id}">
                    </div></div></div>`), x, y, dw, dh, false);
                this.CurrentTile = t_id;
                this.TileCollection[t_id] = this.EbObject.Tiles.$values[i];
                let refid = this.EbObject.Tiles.$values[i].RefId;
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
                   
                    $.each(currentobj.ComponentsColl.$values, function (i, Cobj) {
                        if (!this.Procs.hasOwnProperty(Cobj.EbSid)) {
                            var eb_type = Cobj.$type.split('.').join(",").split(',')[2].split("Eb")[1];
                            this.makeElement(eb_type, Cobj);
                            let Cobject = this.Procs[this.currentId];
                            this.TileCollection[t_id].ComponentsColl.$values[i] = Cobject;
                            //$.extend(Cobject, Cobj);
                            this.ComponentDrop("#component_cont", Cobject);
                            this.GetComponentColumns(Cobject);
                        }
                    }.bind(this));

                    this.drake.containers.push(document.getElementById(this.drop_id));

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
                        this.drake.containers.push(document.getElementById(this.currentId));
                        //this.drake.containers.push(document.getElementById(this.drop_id));
                        this.propGrid.setObject(object, AllMetas["Eb" + eb_type]);
                    }.bind(this));

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
                        //this.drake.containers.push(document.getElementById(this.drop_id));
                        this.propGrid.setObject(object, AllMetas["Eb" + eb_type]);
                    }.bind(this));
                    Eb_Tiles_StyleFn(this.TileCollection[this.CurrentTile], this.CurrentTile, this.TabNum);
                    if (currentobj.Transparent) {
                        $(`[data-id="${this.CurrentTile}"]`).parent().css("background", "transparent");
                        $(`[data-id="${this.CurrentTile}"]`).parent().css("border", "0px solid");
                        $(`[data-id="${this.CurrentTile}"]`).parent().css("border", "0px solid");
                        $(`#${this.CurrentTile} .db-title`).empty();
                        $(`#${this.CurrentTile}`).addClass("user-control-tile-opt");
                        $(`#${this.CurrentTile} .i-opt-obj`).hide();
                        $(`#${this.CurrentTile} .i-opt-restart`).css({ "border": "solid 0px #dcdcdc" });
                    }

                }
              
            }
            //this.addTilecontext()
            this.Tilecontext();
        }
        else {
            $('.grid-stack').gridstack();
        }
        $(".grid-stack , .Eb-ctrlContainer").on("click", this.TileSelectorJs.bind(this));
        //this.addTilecontext()
        this.Tilecontext();

    }

    this.AddNewTile = function (data_width, data_height) {
        this.data_width = data_width ? data_width : 12;
        this.data_height = data_height ? data_height : 5;
        $('.grid-stack').gridstack();
        this.NewTileCount++;
        let j = this.NewTileCount;
        let tile_id = "t" + j;
        let t_id = "tile" + j;
        let drop_id = "drop_" + t_id;
        $(`.grid-stack`).data(`gridstack`).addWidget($(`<div id="${tile_id}"><div class="grid-stack-item-content" id="${t_id}">
                    <div style="display:flex;" class="db-title-parent">
                    <div class="db-title" name-id="${t_id}" style="display:float"></div>
                    <div style="float:right;display:flex" u-id="${t_id}">
                    <i class="fa fa-retweet tile-opt i-opt-restart" aria-hidden="true" link="restart-tile" id="${this.TabNum}_restart_${t_id}"></i>
                    <i class="fa fa-external-link tile-opt i-opt-obj" aria-hidden="true" link="ext-link" id="${this.TabNum}_link_${t_id}"></i>
                    <i class="fa fa-times tile-opt i-opt-close" aria-hidden="true" link="close" id="${this.TabNum}_close_${t_id}"></i>
                    </div></div>
                 <div id="${this.TabNum}_Label_${t_id}" class=""></div>
                 <div data-id="${t_id}" class="db-tbl-wraper tile_dt_cont" id="${drop_id}" ></div></div></div>`), null, null, this.data_width, this.data_height, true);
        this.TileCollection[t_id] = new EbObjects.Tiles("Tile" + Date.now());
        this.CurrentTile = t_id;
        Eb_Tiles_StyleFn(this.TileCollection[this.CurrentTile], this.CurrentTile, this.TabNum);
        return drop_id;
    };

    //focus Ebobjects
    this.TileSelectorJs = function (e) {
        let procId;
        this.JqObj = $(event.target).closest(".guage");
        if ($(event.target).closest(".guage").attr("id")) {
            procId = this.JqObj.attr("id");
            metaId = this.JqObj.attr("eb-type");
            if (metaId && procId) { this.propGrid.setObject(this.Procs[procId], AllMetas["Eb" + metaId]); }
        }
        else if ($(event.target).closest(".label-cont").attr("id")) {
            procId = $(event.target).closest(".label-cont").attr("id")
            metaId = $(event.target).closest(".label-cont").attr("eb-type");
            if (metaId && procId) { this.propGrid.setObject(this.Procs[procId], AllMetas["Eb" + metaId]); }
        }
        else if ($(event.target).closest(".grid-stack-item-content").attr("id")) {
            this.CurrentTile = $(event.target).closest(".grid-stack-item-content").attr("id");
            this.propGrid.setObject(this.TileCollection[`${this.CurrentTile}`], AllMetas["Tiles"]);
        }
        else {
            this.propGrid.setObject(this.EbObject, AllMetas["EbDashBoard"]);
        }
        //metaId = $(event.target).closest(".gaugeChart").attr("eb-type");
        //let a = $(event.target).closest(".grid-stack-item-content").attr("id");
        //if (procId != null) {
        //    this.propGrid.setObject(this.Procs[procId], AllMetas["Eb" + metaId]);
        //}
        //else if (a != null) {
        //    this.CurrentTile = a;
        //    this.propGrid.setObject(this.TileCollection[`${this.CurrentTile}`], AllMetas["Tiles"]);
        //}  
    }.bind(this);

    this.popChanged = function (obj, pname, newval, oldval) {
        if (pname === "TileRefId") {
            $(`[name-id="${this.CurrentTile}"]`).empty();
            $(`[data-id="${this.CurrentTile}"]`).empty();
            $(`.eb-loader-prcbar`).remove();
            this.VisRefid = newval;
            $.ajax(
                {
                    url: '../DashBoard/DashBoardGetObj',
                    type: 'POST',
                    data: { refid: this.VisRefid },
                    success: this.TileRefidChangesuccess.bind(this, this.CurrentTile)
                });
        }
        if (pname === "BackgroundColor") {
            $("#layout_div").css("background-color", "").css("background-color", newval);
        }
        if (pname === "Filter_Dialogue") {
            if (newval !== "") {
                this.getColumns();
            }
            else {
                $('.param-div-cont').remove();
                if (this.stickBtn) { this.stickBtn.$stickBtn.remove(); }
            }
        }
        if (obj.$type.indexOf("EbDataObject") > -1 && pname === "DataSource") {
            this.GetComponentColumns(obj);
        }
        if (obj.$type.indexOf("EbGauge") > 0) {
            let xx = EbGaugeWrapper(this.Procs[obj.EbSid], { isEdit: true });
        }
        if (obj.$type.split(".")[2].split(",")[0] === "EbDataLabel") {
            EbDataLabelFn(obj);
        }
        if (obj.$type.split(".")[2].split(",")[0] === "Tiles") {
            Eb_Tiles_StyleFn(obj, this.CurrentTile , this.TabNum);
        }
        if (obj.$type.indexOf("ProgressGauge") > 0) {
            let xx = ProgressGaugeWrapper(this.Procs[obj.EbSid], { isEdit: true });
        }
    };

    this.GetComponentColumns = function (obj) {
        let Refid = obj["DataSource"];
        $.LoadingOverlay('show');
        $.ajax({
            type: "POST",
            url: "../DS/GetData4DashboardControl",
            data: { DataSourceRefId: Refid },
            async: false,
            success: function (resp) {
                obj["Columns"] = JSON.parse(resp.columns);
                this.propGrid.setObject(obj, AllMetas["EbDataObject"]);
                $.LoadingOverlay('hide');
                this.DisplayColumns(obj);
                this.Rowdata[obj.EbSid + "Row"] = resp.row;
            }.bind(this)
        });
    };

    this.DisplayColumns = function (obj) {
        var DataObj = obj;
        $(`#${obj.EbSid} .eb-ctrl-label`).empty().append(obj.Name);
        $.each(obj.Columns.$values, function (j, obj) {
            icon = this.getIcon(obj.RenderType);
            $(`#Inner_tree_${DataObj.EbSid}`).append(`<li data-ctrl='${DataObj.EbSid}' data-column='${obj.name}' type=${obj.Type} class='col-div-blk' eb-type="DataLabel"><span ><i class='fa ${icon}'></i> ${obj.name}</span></li>`);
        }.bind(this));
        $(`#Inner_Cont_${obj.EbSid}`).killTree();
        $(`#Inner_Cont_${obj.EbSid}`).treed();
        //for (let i = 0; i < obj['Columns'].$values.length; i++) {
        //    let column = obj['Columns'].$values[i];
        //    let name = column.name;
        //    $(`#Inner_Cont_${obj.EbSid}`).append(`<div data-ctrl='${obj.EbSid}' data-column='${name}' type=${column.Type} class='col-div-blk' eb-type="DataLabel"> ${name}</div>`);
        //}
    };
    this.getIcon = function (type) {
        if (type === 16) {
            return this.EbParams.Icons["String"];
        }
        else if (type === 7 || type === 8 || type === 10 || type === 11 || type === 12 || type === 21) {
            return this.EbParams.Icons["Numeric"];
        }
        else if (type === 3) {
            return this.EbParams.Icons["Bool"];
        }
        else if (type === 5 || type === 6 || type === 17 || type === 26) {
            return this.EbParams.Icons["DateTime"];
        }
    };


    this.Tilecontext = function () {
    };

    this.TileRefidChangesuccess = function (id, data) {
        if (this.filtervalues.length === 0) {
            this.GetFilterValues();
        }
        let obj = JSON.parse(data);
        $(`[name-id="${id}"]`).empty().append(obj.DisplayName);
        //this.TileCollection[id].TileObject = obj;
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
            o.DisplayName = this.EbObject.DisplayName;
            o.drawCallBack = this.drawCallBack.bind(this, id);
            o.filterValues = btoa(unescape(encodeURIComponent(JSON.stringify(this.filtervalues))));
            var dt = new EbCommonDataTable(o);
            //$(`[data-id="${id}"]`).parent().removeAttr("style");
            //let a = $(`#${id} .dataTables_scrollHeadInner`).height() - 3;
            //$(`#${id} .dataTables_scrollBody`).css("height", `calc(100% - ${a}px)`);
            $("#objname").empty().text(this.EbObject.DisplayName);
            $(`#${id}`).addClass("box-shadow-style");
        }
        else if (obj.$type.indexOf("EbChartVisualization") >= 0) {
            $(`[data-id="${id}"]`).append(`<div id="canvasDivtb1${id}" class="CanvasDiv"></div>`);
            $(`#${id}`).addClass("chart-tile-opt");
            var o = {};
            o.tableId = "tb1" + id;
            o.dvObject = obj;
            o.filtervalues = this.filtervalues;
            o.DisplayName = this.EbObject.DisplayName;
            var dt = new EbBasicChart(o);
            $(`[data-id="${id}"]`).parent().removeAttr("style");
            $(`#${id}`).addClass("box-shadow-style");
        }
        else if (obj.$type.indexOf("EbUserControl") >= 0) {
            $(`[data-id="${id}"]`).append(`<div id="${id}_UserCtrl" class="Db-user-ctrl"></div>`);
            let height = $(`#${id}`).height();
            let opts = {
                parentDiv: '#' + id + '_UserCtrl',
                refId: obj.RefId,
                params: this.filtervalues,
                height: height
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
            o.DisplayName = this.EbObject.DisplayName;
            var dt = new EbGoogleMap(o);
            $(`[data-id="${id}"]`).parent().removeAttr("style");
            $(`#${id}`).addClass("box-shadow-style");
        }
    }

    this.drawCallBack = function (id) {
        $(`[data-id="${id}"]`).parent().removeAttr("style");
        let a = $(`#${id} .dataTables_scrollHeadInner`).height() - 3;
        $(`#${id} .dataTables_scrollBody`).css("max-height", `calc(100% - ${a}px)`);
    }.bind(this);

    this.BeforeSave = function () {
        var obj = {};
        this.EbObject.Tiles.$values = [];
        this.EbObject.TileCount = 0;
        $(".grid-stack-item-content").each(function (j, val) {
            var id = $(val).parent().attr("id");
            var id2 = $(val).attr("id");
            //var id2 = $(`#${id}`).children().attr("id");
            this.TileCollection[id2].TileDiv.Data_x = ($(`#${id}`).attr("data-gs-x"));
            this.TileCollection[id2].TileDiv.Data_y = ($(`#${id}`).attr("data-gs-y"));
            this.TileCollection[id2].TileDiv.Data_width = ($(`#${id}`).attr("data-gs-width"));
            this.TileCollection[id2].TileDiv.Data_height = ($(`#${id}`).attr("data-gs-height"));
            this.EbObject.Tiles.$values.push(this.TileCollection[id2]);
            this.EbObject.TileCount = this.EbObject.TileCount + 1;
        }.bind(this));
        //this.RemoveColumnRef();
        return true;
    };

    this.DashBoardSearch = function (e) {
        $(`#DashB-Searched-Obj`).empty();
        let val = $("#DashB-Search").val().trim();
        if (val === "" || val === null) {
            $(`#DashB-Searched-Obj`).hide().empty();
            $("#Eb-obj-sidebar-cont").show();
        }
        else {
            $(`#DashB-Searched-Obj`).show();
            $("#Eb-obj-sidebar-cont").hide();
            val = val.toLowerCase();
            let myarr = [];
            let count = 0;
            let containers = [];
            $.each(this.ebObjList, function (key, Val) {
                $.each(Val, function (i, Obj) {
                    if (Obj.DisplayName.toLowerCase().indexOf(val) != -1) {
                        if (myarr.indexOf(Obj.EbObjectType) === -1) {
                            $("#DashB-Searched-Obj").append(`<div> 
                        <div class="sidebar-head" hs-id="${Obj.EbObjectType}" style="display:flex;"> <div class="${this.ObjIcons[Obj.EbObjectType]} db-sidebar-icon"></div>
                       ${this.ObjTypeName[Obj.EbObjectType]}</div>
                       <div id="${Obj.EbObjectType}" class="sidebar-content"><div refid="${Obj.RefId}" class="db-draggable-obj">${Obj.DisplayName}</div></div> 
                        </div>`);
                            myarr.push(Obj.EbObjectType);
                            containers.push(document.getElementById(`${Obj.EbObjectType}`));
                        }
                        else {
                            $(`#${Obj.EbObjectType}`).append(`<div refid="${Obj.RefId}" class="db-draggable-obj">${Obj.DisplayName}</div>`);
                        }
                    }
                }.bind(this));


            }.bind(this));
            //containers.push(document.getElementById('grid-cont'));
            this.drake = dragula(containers, {
                copy: true,
                accepts: function (el, target, source, sibling) {
                    if (source == target) {
                        return false;
                    }
                    else
                        return true; // elements can be dropped in any of the `containers` by default
                },
            });
            this.drake.off("drag").on("drag", this.columnsdrag.bind(this));
            this.drake.off("shadow").on("shadow", this.columnsshadow.bind(this));
            this.drake.off("drop").on("drop", this.columnsdrop.bind(this));
        }
    };

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

    //this.RemoveColumnRef = function () {
    //    this.__OSElist = [];
    //    this.__oldValues = [];
    //    $.each(this.EbObject.Columns.$values, function (i, obj) {
    //        obj.ColumnsRef = null;
    //        this.__OSElist.push($.extend({}, obj.__OSElist));
    //        obj.__OSElist = null;
    //        this.__oldValues.push($.extend({}, obj.__oldValues));
    //        obj.__oldValues = null;
    //    }.bind(this));
    //}

    this.init();
    $('.component_cont').on('hide.bs.collapse', function (e) {
        $("#dashbord-view").css("height", 85+"vh" );
    })
    $('.component_cont').on('show.bs.collapse', function (e) {;
        $("#dashbord-view").css("height", 72.2 + "vh");
    })
}

//DataLabel Style Function

function EbDataLabelFn(Label) {

    if (Label.ChangeTextPositon) {
        if (Label.StaticLabelPosition.Left !== 0 && Label.StaticLabelPosition.Top !== 0) {
            $(`#${Label.EbSid}_static`).css({ "left": `${Label.StaticLabelPosition.Left}%`, "top": `${Label.StaticLabelPosition.Top}%`, "position": "absolute" });
        }

        if (Label.DescriptionPosition.Left !== 0 && Label.DescriptionPosition.Top !== 0) {
            $(`#${Label.EbSid}_description`).css({ "left": `${Label.DescriptionPosition.Left}%`, "top": `${Label.DescriptionPosition.Top}%`, "position": "absolute" });
        }

        if (Label.DynamicLabelPositon.Left !== 0 && Label.DynamicLabelPositon.Top !== 0) {
            $(`#${Label.EbSid}_dynamic`).css({ "left": `${Label.DynamicLabelPositon.Left}%`, "top": `${Label.DynamicLabelPositon.Top}%`, "position": "absolute" });
        }

    }
    else {
        $(`#${Label.EbSid}_static`).css("position", "").css("left","").css("top","");
        $(`#${Label.EbSid}_description`).css("position", "").css("left", "").css("top", "");
        $(`#${Label.EbSid}_dynamic`).css("position", "").css("left", "").css("top", "");
    }
    if (Label.TextPosition == 0) { this.TextPosition = "left" }
    if (Label.TextPosition == 1) { this.TextPosition = "center" }
    if (Label.TextPosition == 2) { this.TextPosition = "right" }
    $(`#${Label.EbSid}`).css("text-align", this.TextPosition);
    //Static label style
    $(`#${Label.EbSid}_static`).empty().append(Label.StaticLabel);
    if (Label.StaticLabelFont !== null) {
        GetFontCss(Label.StaticLabelFont, $(`#${Label.EbSid}_static`));
    }
   
    //description style
    $(`#${Label.EbSid}_description`).empty().append(Label.Description);
    if (Label.DescriptionFont !== null) {
        GetFontCss(Label.DescriptionFont, $(`#${Label.EbSid}_description`));
    }
  

    //Dynamic label style
    if (Label.DynamicLabelFont !== null) {
        GetFontCss(Label.DynamicLabelFont, $(`#${Label.EbSid}_dynamic`));
    }
    

    $(`#${Label.EbSid}`).css("border-radius", Label.LabelBorderRadius);
    $(`#${Label.EbSid}`).css("border-color", Label.LabelBorderColor);
    if (!Label.IsGradient) {
        $(`#${Label.EbSid}`).css("background", Label.LabelBackColor);
    }
    if (Label.IsGradient) {
        $(`#${Label.EbSid}`).css("background", "");
        let direction = GradientDirection(Label.Direction);
        let bg = "linear-gradient(" + direction + "," + Label.GradientColor1 + "," + Label.GradientColor2 + ")";
        $(`#${Label.EbSid}`).css('background-image', bg);
    }

}


function Eb_Tiles_StyleFn(Tile, TileId, TabNum) {
    //Tile Back Color
    if (Tile.IsGradient) {
        let direction = GradientDirection(Tile.Direction);
        let bg = "linear-gradient(" + direction + "," + Tile.GradientColor1 + "," + Tile.GradientColor2 + ")";
        $(`#${TileId}`).css("background-image", bg);
    }
    else {
        $(`#${TileId}`).css("background", Tile.TileBackColor);
    }

    //Tile border
    $(`#${TileId}`).css("border-radius", Tile.BorderRadius == 0 ? 4 + "px" : Tile.BorderRadius+"px" );
    $(`#${TileId}`).css("border", `solid 1px ${Tile.BorderColor}`);

    //Tile Label
    $(`#${TabNum}_Label_${TileId}`).empty().append(Tile.Label);
    $(`#${TabNum}_Label_${TileId}`).css("left", Tile.Left + "%").css("top", Tile.Top + "%").css("position", "absolute");
    if (Tile.LabelFont !== null) {
        GetFontCss(Tile.LabelFont, $(`#${TabNum}_Label_${TileId}`));
    }
   

}

function GradientDirection(val ) {
    gradient = [];
    gradient[0] = "to right";
    gradient[1] = "to left";
    gradient[2] = "to bottom";
    gradient[3] = "to bottom right";
    gradient[4] = "to bottom left";
    gradient[5] = "to top right";
    gradient[6] = "to top left";

    return gradient[val];
}

$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
});

