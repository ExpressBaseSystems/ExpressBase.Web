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

    this.TileSelectorJs = function (e) {
        let a = (!$(event.target).closest(".grid-stack-item").length);
        let TClass = e.target.getAttribute('class');
        if (TClass.indexOf("movable-div") > 0) {
            let val = e.target.getAttribute('id');
            if (this.TileCollection[val] == null) {
                this.TileCollection[val] = new EbObjects.Tiles();
            }
            this.propGrid.setObject(this.TileCollection[`${val}`], AllMetas["Tiles"]);
        }
        else {
            this.propGrid.setObject(this.EbObject, AllMetas["EbDashBoard"]);
        }
       
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
        this.propGrid.PropertyChanged = this.popChanged;
        $(".grid-stack").on("click", this.TileSelectorJs.bind(this));
        commonO.Current_obj = this.EbObject;

        //$("body").on("click", this.EbObjectshow.bind(this));
        //$(".grid-stack").on("click", this.DashBoardSelectorJs.bind(this));
    }

    this.popChanged = function (obj , pname ) {
       if (pname === "TileCount") {
        //   $(".grid-stack").append(`<div class="grid-stack-item ui-draggable ui-resizable" data-gs-x="0" data-gs-y="0" data-gs-width="5" data-gs-height="4">
        //            <div class="grid-stack-item-content panel panel-primary ui-draggable-handle" id="tile1">
        //            </div>
        //        <div class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se" style="z-index: 90; display: block;"></div></div>`)
       }
    }

    this.BeforeSave = function(){
        var obj = {};
        $(".grid-stack-item").each(function (i , val) {
            var id = $(val).attr("id");
            var id2 = $(`#${id}`).children().attr("id");
            this.TileCollection[id2].TileDiv.Data_x = ($(val).attr("data-gs-x"));
            this.TileCollection[id2].TileDiv.Data_y = ($(val).attr("data-gs-y"));
            this.TileCollection[id2].TileDiv.Data_width = ($(val).attr("data-gs-width"));
            this.TileCollection[id2].TileDiv.Data_height = ($(val).attr("data-gs-height"));
            
        }.bind(this));
    };
   
    this.init();
}

