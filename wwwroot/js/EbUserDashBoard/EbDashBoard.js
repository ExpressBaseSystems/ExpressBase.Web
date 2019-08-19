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
        let TClass = e.target.getAttribute('class');
        if (TClass === "grid-stack-item") {
            let val = e.target.getAttribute('id');
            if (this.TileCollection[val] == null) {
                this.TileCollection[val] = new EbObjects.Tiles();
            }
            this.propGrid.setObject(this.TileCollection[`${val}`], AllMetas["Tiles"]);
        }
        this.propGrid.setObject(this.EbObject, AllMetas["EbDashBoard"]);
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

        $(".grid-stack").on("click", this.TileSelectorJs.bind(this));
        //$(".grid-stack").on("click", this.DashBoardSelectorJs.bind(this));
    }

    this.init();
}

