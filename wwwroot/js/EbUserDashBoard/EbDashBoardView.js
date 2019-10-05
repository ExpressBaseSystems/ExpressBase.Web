let DashBoardViewWrapper = function (options) {
    this.Version = options.Version;
    this.ObjType = options.ObjType;
    this.EbObject = options.dvObj;
    this.Statu = options.Statu;
    this.TileCollection = {};
    this.CurrentTile;
    this.Wc = options.Wc;
    this.Cid = options.Cid;

    this.GenerateButtons = function () {

    }

    this.init = function () {
        this.DrawTiles();
        this.propGrid = new Eb_PropertyGrid({
            id: "propGridView",
            wc: this.Wc,
            cid: this.Cid,
            $extCont: $("#ppt-dash-view"),
            isDraggable: true
        });
        this.propGrid.setObject(this.EbObject, AllMetas["EbDashBoard"]);
        this.propGrid.PropertyChanged = this.popChanged.bind(this);
        $("#dashbord-user-view").on("click", ".tile-opt", this.TileOptions.bind(this));
    }

    this.DrawTiles = function () {
        $("#dashbord-user-view").css("background-color", "").css("background-color", this.EbObject.BackgroundColor);
        if (this.EbObject.Tiles.$values.length > 0) {

            for (let i = 0; i < this.EbObject.Tiles.$values.length; i++) {
                let tile_id = "t" + i;
                let t_id = "tile" + i;
                let x = this.EbObject.Tiles.$values[i].TileDiv.Data_x;
                let y = this.EbObject.Tiles.$values[i].TileDiv.Data_y;
                let dh = this.EbObject.Tiles.$values[i].TileDiv.Data_height;
                let dw = this.EbObject.Tiles.$values[i].TileDiv.Data_width;
                $(".grid-stack").append(`<div class="grid-stack-item " data-gs-x=${x} data-gs-y=${y} data-gs-width=${dw} data-gs-height=${dh} id=${tile_id}>
                    <div class="grid-stack-item-content" id=${t_id}>
                    <div style="display:flex" id="">
                    <div class="db-title" name-id="${t_id}" style="display:float"></div>
                    <div style="float:right;display:flex" u-id="${t_id}"><i class="fa fa-external-link tile-opt" aria-hidden="true" id="i-opt-obj"></i>
                    </div></div>
                    <div data-id="${t_id}" class="db-tbl-wraper"></div>
                    </div></div>`);
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

            this.Tilecontext()

        }
    }


    this.TileOptions = function (e) {
        var tileid = e.target.parentElement.getAttribute("u-id");
        var id = e.target.getAttribute("id");
        if (id === "i-opt-obj") {
            let TileRefid = this.TileCollection[tileid].RefId;
            window.open(location.origin + "/DV/dv?refid=" + TileRefid, '_blank');
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

    //this.FullScreenViewTrigger = function (name, selector, event) {
    //    let id = selector.$trigger[0].getAttribute("id");
    //    let TileRefid = this.TileCollection[id].TileRefId;
    //    window.open(location.origin + "/DV/dv?refid=" + TileRefid, '_blank');
    //}

    this.TileRefidChangesuccess = function (id, data) {
        let obj = JSON.parse(data);
        $(`[name-id="${id}"]`).append(obj.DisplayName);
        this.TileCollection[id].TileObject = obj;
        if (obj.$type.indexOf("EbTableVisualization") >= 0) {

            $(`[data-id="${id}"]`).append(`<table id="tb1${id}" class="table display table-bordered compact"></table>`);
            var o = {};
            o.dsid = obj.DataSourceRefId;
            o.tableId = "tb1" + id;
            o.containerId = id;
            o.columns = obj.Columns;
            o.dvObject = obj;
            o.IsPaging = false;
            o.showFilterRow = false;
            var dt = new EbBasicDataTable(o);
        }
        else if (obj.$type.indexOf("EbChartVisualization") >= 0) {
            $(`[data-id="${id}"]`).append(`<div id="canvasDivtb1${id}" class="CanvasDiv"></div>`);
            var o = {};
            o.tableId = "tb1" + id;
            o.dvObject = obj;
            var dt = new EbBasicChart(o);
        }
        else if (obj.$type.indexOf("EbUserControl") >= 0) {
            $(`[data-id="${id}"]`).append(`<div id="${id}_UserCtrl"></div>`);
            let opts = {
                parentDiv: '#' + id + '_UserCtrl',
                refId: obj.RefId
            }
             EbUserCtrlHelper(opts);
            $(`[data-id="${id}"]`).parent().css("background", "transparent");
            $(`[data-id="${id}"]`).parent().css("border", "0px solid");
            $(`[name-id="${id}"]`).empty();
        }
    }


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
            $("#dashbord-user-view").css("background-color", "").css("background-color", newval);
        }
    }


    this.init();
}

