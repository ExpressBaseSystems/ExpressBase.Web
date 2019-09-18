let DashBoardViewWrapper = function (options) {
    this.Version = options.Version;
    this.ObjType = options.ObjType;
    this.EbObject = options.dvObj;
    this.Statu = options.Statu;
    this.TileCollection = {};
    this.CurrentTile;

    this.GenerateButtons = function () {

    }

    this.init = function () {
        this.DrawTiles();
    }

    this.DrawTiles = function () {

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
                   </div>
                    <div data-id="${t_id}" class="db-tbl-wraper"></div>
                    </div></div>`);
                $('.grid-stack').gridstack();
                this.CurrentTile = t_id;
                this.TileCollection[t_id] = this.EbObject.Tiles.$values[i];
                let refid = this.EbObject.Tiles.$values[i].TileRefId;
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
        }
    }


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
    }


    this.init();
}

