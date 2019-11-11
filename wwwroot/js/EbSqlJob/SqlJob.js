

function EB_SqlJob_entry(option) {
    this.Config = $.extend({}, option);
    this.validate = function () {
        return true;
    };

    if (this.validate()) {
        if (window.SqlJob === null || window.SqlJob === undefined)
            window.SqlJob = {};
        window.SqlJob["Tab" + this.Config.TabNum] = {};
        window.SqlJob["Tab" + this.Config.TabNum].Constants = {};
        window.SqlJob["Tab" + this.Config.TabNum].Creator = new EbSqlJob(this.Config);
        window.SqlJob["Tab" + this.Config.TabNum].JsonWindow = new EbPrettyJson({
            ContetEditable: ["Value"],
            HideFields: ["ValueTo"]
        });
        return window.SqlJob["Tab" + this.Config.TabNum].Creator;
    }
    else {
        console.log("initialization error");
        return null;
    }
};


var SqlJobWrapper = function (options) {
    this.Refid = options.RefId;
    this.Cid = options.Cid;
    this.ObjectType = options.ObjType;
    this.EbObject = options.sqlJobObj;
    this.Version = options.Version;
    this.Wc = options.Wc;

    this.dragulafun = function () {
        var drake =  dragula([document.getElementById("left"), document.getElementById("right")], {
            copy: function (el, source) {
                return source === document.getElementById("left")
            },
            accepts: function (el, target) {
                return target == document.getElementById("right")
            },
        });
        drake.on("drop", this.onDropFn.bind(this));
    }
    this.onDropFn = function (el, target, source, yy) {
        alert("bdh");
    }
    this.init = function () {
        this.dragulafun();
        if (this.EbObject === null) {
            this.EbObject = new EbObjects.EbSqlJob("tb" + this.Conf.TabNum + "SqlJOb");
        }
        this.propGrid = new Eb_PropertyGrid({
            id: "propGrid",
            wc: this.Wc,
            cid: this.Cid,
            $extCont: $("#ppt-dash"),
            isDraggable: true
        });
        this.propGrid.setObject(this.EbObject, AllMetas["EbSqlJob"]);
        commonO.Current_obj = this.EbObject;
    }

   
    this.init();
}