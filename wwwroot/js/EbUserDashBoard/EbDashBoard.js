let DashBoardWrapper = function (options) {
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
    this.NewTileCount = (options.dvObj !== null) ? options.dvObj.TileCount : 2 ;

    this.GenerateButtons = function () {

    }

    this.init = function () {

        if (this.EbObject === null) {
            this.EbObject = new EbObjects.EbDashBoard(`EbDashBoar${Date.now()}`);
        }
        this.propGrid = new Eb_PropertyGrid({
            id: "propGrid",
            wc: this.Wc,
            cid: this.Cid,
            $extCont: $("#ppt-dash")
        });
        this.propGrid.setObject(this.EbObject, AllMetas["EbDashBoard"]);
        this.propGrid.PropertyChanged = this.popChanged.bind(this);
        commonO.Current_obj = this.EbObject;
        this.DrawTiles();
        //$("body").on("click", this.EbObjectshow.bind(this));
        //$(".grid-stack").on("click", this.DashBoardSelectorJs.bind(this));
        $("#dashbord-view").on("click", ".tile-opt", this.TileOptions.bind(this));
    }
    this.TileOptions = function (e) {
        var tileid= e.target.parentElement.getAttribute("u-id"); 
        var id = e.target.getAttribute("id");
        if (id === "i-opt-obj")  { 
        $(".stickBtn").hide();
        $("#ppt-dash").show(); 
        $("#propGrid_propGrid .pgCX-Editor-Btn").trigger("click");
        }
        else if (id === "i-opt-close") {
            var abc = $(`#${tileid}`).closest(".grid-stack-item");
            var grid = $('.grid-stack').data('gridstack');
            grid.removeWidget(abc);
           }
    }

    this.DrawTiles = function () {
      
        if (this.EbObject.Tiles.$values.length > 0) {
            
            for (let i = 0; i < this.EbObject.Tiles.$values.length; i++) {
                let tile_id = "t"+i;
                let t_id = "tile"+i;
                let x = this.EbObject.Tiles.$values[i].TileDiv.Data_x;
                let y = this.EbObject.Tiles.$values[i].TileDiv.Data_y;
                let dh = this.EbObject.Tiles.$values[i].TileDiv.Data_height;
                let dw = this.EbObject.Tiles.$values[i].TileDiv.Data_width;
                $(".grid-stack").append(`<div class="grid-stack-item " data-gs-x=${x} data-gs-y=${y} data-gs-width=${dw} data-gs-height=${dh} id=${tile_id}>
                    <div class="grid-stack-item-content" id=${t_id}>
                    <div style="display:flex" id="">
                    <div class="db-title" name-id="${t_id}" style="display:float"></div>
                    <div style="float:right;display:flex" u-id="${t_id}"><i class="fa fa-object-group tile-opt" aria-hidden="true" id="i-opt-obj"></i>
                    <i class="fa fa-times tile-opt" aria-hidden="true" id="i-opt-close"></i>
                    </div></div>
                    <div data-id="${t_id}" class="db-tbl-wraper"></div>
                    </div></div>`);
                this.CurrentTile = t_id;
                this.TileCollection[t_id] = this.EbObject.Tiles.$values[i];
                let refid = this.EbObject.Tiles.$values[i].TileRefId;
                if (refid !== "") {
                $.ajax(
                    {
                        url: '../DashBoard/DashBoardView',
                        type: 'POST',
                        data: { refid: refid },
                        success: this.TileRefidChangesuccess.bind(this , this.CurrentTile)
                    });
                }
            }
            this.addTilecontext()
            this.Tilecontext()
        }
        else {
            $('.grid-stack').gridstack();
            for (let i = 0; i < 2 ; i++) {
                let tile_id = "t" + i;
                let t_id = "tile" + i;          
                $('.grid-stack').data('gridstack').addWidget($(`<div id="${tile_id}"> <div class="grid-stack-item-content" id="${t_id}"> 
                     <div style="display:flex;border-bottom: solid 1px #dcdcdc;" id="">
                    <div class="db-title" name-id="${t_id}" style="display:float"></div>
                    <div style="float:right;display:flex" u-id="${t_id}"><i class="fa fa-object-group tile-opt" aria-hidden="true" id="i-opt-obj"></i>
                    <i class="fa fa-times tile-opt" aria-hidden="true" id="i-opt-close"></i>
                    </div></div>
                 <div data-id="${t_id}" class="db-tbl-wraper"></div></div></div>`), null, null, 4, 3, true);
                //this.AddNewTile();
                this.TileCollection[t_id] = new EbObjects.Tiles("Tile" + Date.now());
            }
        }
        $(".grid-stack").on("click", this.TileSelectorJs.bind(this));
        this.addTilecontext()
        this.Tilecontext()
    }

    this.AddNewTile = function () {
        $('.grid-stack').gridstack();
        this.NewTileCount++;
        let j = this.NewTileCount;
        let tile_id = "t" + j;
        let t_id = "tile" + j;
        $(`.grid-stack`).data(`gridstack`).addWidget($(`<div id="${tile_id}"><div class="grid-stack-item-content" id="${t_id}">
                    <div style="display:flex;border-bottom: solid 1px #dcdcdc;" id="">
                    <div class="db-title" name-id="${t_id}" style="display:float"></div>
                    <div style="float:right;display:flex" u-id="${t_id}"><i class="fa fa-object-group tile-opt" aria-hidden="true" id="i-opt-obj"></i>
                    <i class="fa fa-times tile-opt" aria-hidden="true" id="i-opt-close"></i>
                    </div></div>
                 <div data-id="${t_id}" class="db-tbl-wraper"></div></div></div>`), null, null, 4, 3, true);
        this.TileCollection[t_id] = new EbObjects.Tiles("Tile" + Date.now());
    }
  
    this.TileSelectorJs = function (e) {
        let a = $(event.target).closest(".grid-stack-item-content").attr("id");
        if (a != null) {
            //this.CurrentTile = $(a).attr('id');
            //if (this.TileCollection[this.CurrentTile] == null) {
            //    this.TileCollection[this.CurrentTile] = new EbObjects.Tiles("Tile" + Date.now());
            //}
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
                    url: '../DashBoard/DashBoardView',
                    type: 'POST',
                    data: { refid:  this.VisRefid },
                    success: this.TileRefidChangesuccess.bind(this, this.CurrentTile)
                });
        }
    }
    this.addTilecontext = function () {
        $.contextMenu({
            selector: '.grid-stack',
            trigger: 'right',
            items: {
                "Add Tile": {
                    name: "Add Tile", icon: "add", callback: this.AddNewTile.bind(this)
                },
            }
        });
    }

  

    this.Tilecontext = function () {
        $.contextMenu({
            selector: '.grid-stack-item-content',
            trigger: 'right',
            items: {
                "RemoveTile": {
                    name: "Remove Tile", icon: "add", callback: this.RemoveTile.bind(this)
                },
            }
        });
    }

    this.RemoveTile = function (name, selector, event) {
        var grid = $('.grid-stack').data('gridstack');
        el = selector.$trigger.parent();
           grid.removeWidget(el);
    }

   
    this.TileRefidChangesuccess = function ( id , data) {
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

    this.BeforeSave = function(){
        var obj = {};
        this.EbObject.Tiles.$values = [];
        this.EbObject.TileCount = 0;
        $(".grid-stack-item-content").each(function (j , val) {
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
        return true;
    };
    this.init();
}


$(function () {
  
});