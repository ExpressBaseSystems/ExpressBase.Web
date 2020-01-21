var grid;
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
    this.ObjTypeName = { 16: "TableVisualization", 17: "ChartVisualization", 14: "UserControl", 21: "GoogleMap" }
    this.ObjIcons = { 16: "fa fa-table", 17: "fa fa-bar-chart", 14: "fa fa-puzzle-piece", 21: "fa fa-map-marker" }
    this.rowData = options.rowData ? JSON.parse(decodeURIComponent(escape(window.atob(options.rowData)))) : null;
    this.filtervalues = options.filterValues ? JSON.parse(decodeURIComponent(escape(window.atob(options.filterValues)))) : [];
    this.toolboxhtml = options.Toolhtml;
    if (this.EbObject !== null) {
        this.filterDialogRefid = this.EbObject.Filter_Dialogue ? this.EbObject.Filter_Dialogue : "";
    }

    this.GridStackInit = function () {
        this.objGrid1 = $('.grid-stack').gridstack({ resizable: { handles: 'e, se, s, sw, w' }} );
        this.grid = $('.grid-stack').data("gridstack");
        this.grid.cellHeight(25);
        grid = this.grid;
    }
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
    }


    //Toolbox
    this.AppendToolBox = function () {
        $('.ToolBox-div').remove();
        $("#dashbord-view").prepend(`
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

    //<div class="tool_item_head" data-toggle="collapse" data-target="#toolb_views"><i class="fa fa-caret-down"></i> Views </div>
    //    <div id="toolb_views" ebclass="tool-sec-cont" class="tool-sec-cont collapse in" aria-expanded="true" style="">
    //        bqahbbxdw ghvhgwa
    //    </div>

    this.DrawObjectOnMenu = function () {
        let myarr4EbType = [];
        let count = 0;
        let containers = [];
        $("#Eb-obj-sidebar-cont").append(`<div class="tool_item_head" data-toggle="collapse" data-target="#view_pane"> <i class="fa fa-caret-down"></i>  Views</div>
            <div id="view_pane" ebclass="tool-sec-cont" class="tool-sec-cont collapse in" ></div>`);
        $.each(this.ebObjList, function (key, Val) {
            $.each(Val, function (i, Obj) {
                if (myarr4EbType.indexOf(Obj.EbObjectType) === -1) {
                    $("#view_pane").append(`
                        <div class="tool_item_head" data-toggle="collapse" data-target="#${Obj.EbObjectType}" style="padding-left:30px"><i class="fa fa-caret-down"></i> ${this.ObjTypeName[Obj.EbObjectType]} </div>
                        <div id="${Obj.EbObjectType}" ebclass="tool-sec-cont" class="tool-sec-cont collapse in" style="">
                            <div class="sidebar-content"><div refid="${Obj.RefId}" class="db-draggable-obj">${Obj.DisplayName}</div></div> 
                        </div>`);
                    myarr4EbType.push(Obj.EbObjectType);
                    containers.push(document.getElementById(`${Obj.EbObjectType}`));

                }
                else {
                    $(`#${Obj.EbObjectType}`).append(`<div refid="${Obj.RefId}" class="db-draggable-obj">${Obj.DisplayName}</div>`);

                }
            }.bind(this));


        }.bind(this));
        $("#Eb-obj-sidebar-cont").append(this.toolboxhtml);
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
    };

    this.columnsdrag = function (el, source) {
        if (source === $("#grid-cont")) {
            return false;
        }
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
        this.drake.containers.pop(document.getElementById('grid-cont'));
        this.VisRefid = el.getAttribute("refid");
        el.remove();
        if (target && source !== null) {
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

    };

    this.GenerateButtons = function () {

    }

    this.sideBarHeadToggle = function (e) {
        let abc = e.target.getAttribute("hs-id");
        $(`#${abc}`).toggle(100);

    }

    this.init = function () {
        this.AppendToolBox();

        if (this.EbObject === null) {
            this.EbObject = new EbObjects.EbDashBoard(`EbDashBoar${Date.now()}`);
            this.filterDialogRefid = "";
        }
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
    }
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
        if (this.EbObject.Tiles.$values.length > 0) {

            for (let i = 0; i < this.EbObject.Tiles.$values.length; i++) {
                let tile_id = "t" + i;
                let t_id = "tile" + i;
                let x = this.EbObject.Tiles.$values[i].TileDiv.Data_x;
                let y = this.EbObject.Tiles.$values[i].TileDiv.Data_y;
                let dh = this.EbObject.Tiles.$values[i].TileDiv.Data_height;
                let dw = this.EbObject.Tiles.$values[i].TileDiv.Data_width;
                $('.grid-stack').data('gridstack').addWidget($(`<div id="${tile_id}"> 
                    <div class="grid-stack-item-content" id=${t_id}>
                    <div style="display:flex" class="db-title-parent">
                    <div class="db-title" name-id="${t_id}" style="display:float"></div>
                    <div style="float:right;display:flex" u-id="${t_id}">
                    <i class="fa fa-retweet tile-opt i-opt-restart" aria-hidden="true" link="restart-tile"></i>
                    <i class="fa fa-external-link tile-opt i-opt-obj" aria-hidden="true" link="ext-link"></i>
                    <i class="fa fa-times tile-opt i-opt-close" aria-hidden="true" link="close"></i>
                    </div></div>
                    <div data-id="${t_id}" class="db-tbl-wraper">
                    </div></div></div>`), x, y, dw, dh, false);
                this.CurrentTile = t_id;
                this.TileCollection[t_id] = this.EbObject.Tiles.$values[i];
                let refid = this.EbObject.Tiles.$values[i].RefId;
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
            //this.addTilecontext()
            this.Tilecontext()
        }
        else {
            $('.grid-stack').gridstack();
        }
        $(".grid-stack").on("click", this.TileSelectorJs.bind(this));
        //this.addTilecontext()
        this.Tilecontext();

    }

    this.AddNewTile = function () {
        $('.grid-stack').gridstack();
        this.NewTileCount++;
        let j = this.NewTileCount;
        let tile_id = "t" + j;
        let t_id = "tile" + j;
        $(`.grid-stack`).data(`gridstack`).addWidget($(`<div id="${tile_id}"><div class="grid-stack-item-content" id="${t_id}">
                    <div style="display:flex;" class="db-title-parent">
                    <div class="db-title" name-id="${t_id}" style="display:float"></div>
                    <div style="float:right;display:flex" u-id="${t_id}">
                    <i class="fa fa-retweet tile-opt i-opt-restart" aria-hidden="true" link="restart-tile"></i>
                    <i class="fa fa-external-link tile-opt i-opt-obj" aria-hidden="true" link="ext-link"></i>
                    <i class="fa fa-times tile-opt i-opt-close" aria-hidden="true" link="close"></i>
                    </div></div>
                 <div data-id="${t_id}" class="db-tbl-wraper"></div></div></div>`), null, null, 4, 3, true);
        this.TileCollection[t_id] = new EbObjects.Tiles("Tile" + Date.now());
        this.CurrentTile = t_id;
    }

    this.TileSelectorJs = function (e) {
        let a = $(event.target).closest(".grid-stack-item-content").attr("id");
        if (a != null) {
            this.CurrentTile = a;
            this.propGrid.setObject(this.TileCollection[`${this.CurrentTile}`], AllMetas["Tiles"]);

        }
        else {
            this.propGrid.setObject(this.EbObject, AllMetas["EbDashBoard"]);
        }

    }.bind(this);



    this.popChanged = function (obj, pname, newval, oldval) {
        if (pname === "TileCount") {
            //   $(".grid-stack").append(`<div class="grid-stack-item ui-draggable ui-resizable" data-gs-x="0" data-gs-y="0" data-gs-width="5" data-gs-height="4">
            //            <div class="grid-stack-item-content panel panel-primary ui-draggable-handle" id="tile1">
            //            </div>uj
            //        <div class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se" style="z-index: 90; display: block;"></div></div>`)
        }
        if (pname == "TileRefId") {
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

        if (pname == "Filter_Dialogue") {
            if (newval !== "") {
                this.getColumns();
            }
            else {
                $('.param-div-cont').remove();
                if (this.stickBtn) { this.stickBtn.$stickBtn.remove(); }
            }
        }
    }
    //this.addTilecontext = function () {
    //    $.contextMenu({
    //        selector: '.grid-stack',
    //        trigger: 'right',
    //        items: {
    //            "Add Tile": {
    //                name: "Add Tile", icon: "add", callback: this.AddNewTile.bind(this)
    //            },
    //        }
    //    });
    //}



    this.Tilecontext = function () {
        //$.contextMenu({
        //    selector: '.grid-stack-item-content',
        //    trigger: 'right',
        //    items: {
        //        "RemoveTile": {
        //            name: "Remove Tile", icon: "add", callback: this.RemoveTile.bind(this),
        //        },
        //        "FullScreenView": {
        //            name: "Open in NewTab ", icon: "fa-external-link", callback: this.FullScreenViewTrigger.bind(this),
        //        },
        //    }
        //});
    }

    //this.RemoveTile = function (name, selector, event) {
    //    var grid = $('.grid-stack').data('gridstack');
    //    el = selector.$trigger.parent();
    //    grid.removeWidget(el);
    //}
    //this.FullScreenViewTrigger = function (name, selector, event) {
    //    let id = selector.$trigger[0].getAttribute("id");
    //    let TileRefid = this.TileCollection[id].TileRefId;
    //    window.open(location.origin + "/DV/dv?refid=" + TileRefid, '_blank');
    //}


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

}


