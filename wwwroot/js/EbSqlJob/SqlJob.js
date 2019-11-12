

function EB_SqlJob_entry(option) {
    this.Config = $.extend({}, option);
    this.validate = function () {
        return true;
    };

    if (this.validate()) {
        if (window.SqlJob === null || window.SqlJob === undefined) {
            window.SqlJob = {};}
            window.SqlJob["Tab" + this.Config.TabNum] = {};
            window.SqlJob["Tab" + this.Config.TabNum].Creator = new EbSqlJob(this.Config);
            return window.SqlJob["Tab" + this.Config.TabNum].Creator;
    }
    else {
        console.log("initialization error");
        return null;
    }
};

function EbSqlJob(options) {

    this.conf = options; //Object

    this.Refid = options.RefId;
    this.Cid = options.Cid;
    this.ObjectType = options.ObjType;
    this.EbObject = options.sqlJobObj;
    this.Version = options.Version;
    this.Wc = options.Wc;
    this.TabNum = options.TabNum;

    this.pg = new Eb_PropertyGrid({
        id: "tb" + this.TabNum + "_SqlJob_PropGrid",
        wc: this.Wc,
        cid: this.Cid,
        $extCont: $("#tb" + this.TabNum + "_SqlJob_PGgrid")
    });


    this.DragDrop_Items = function () {
        let dritem = `tb${this.TabNum}_SqlJob_drag_cont`;
        var drg = dragula([document.getElementById(dritem), document.getElementById(`tb${this.TabNum}_SqlJob_drop_cont`)],
            {
                copy: function (el, source) {
                    return source === document.getElementById(dritem);
                },
                accepts: function (el, target) {
                    return target !== document.getElementById(dritem);
                }
            });
        drg.on("drop", this.onDropFn.bind(this));
    };//drag drop starting func

    this.onDropFn = function (el, target, source, yy) {

        if (!$(el).hasClass("dropped")) {
            let o = this.makeElement(el);
            $(el).replaceWith(o.$Control.outerHTML());
            this.RefreshControl(o);
        }
    };
   
    this.makeElement = function (el) {
        let ebtype = $(el).attr("val");
        var id = "tb" + this.TabNum + ebtype;
        this.Procs = new EbObjects.EbSqlJob("tb" + this.Conf.TabNum + "SqlJOb");
        this.Procs[id].Label = $(el).attr("ctrname");
        return this.Procs[id];
    };


    this.start = function () {
        this.DragDrop_Items();
    };

    this.start();
}



//var SqlJobWrapper = function (options) {
//    this.Refid = options.RefId;
//    this.Cid = options.Cid;
//    this.ObjectType = options.ObjType;
//    this.EbObject = options.sqlJobObj;
//    this.Version = options.Version;
//    this.Wc = options.Wc;

//    this.dragulafun = function () {
//        var drake =  dragula([document.getElementById("left"), document.getElementById("right")], {
//            copy: function (el, source) {
//                return source === document.getElementById("left")
//            },
//            accepts: function (el, target) {
//                return target == document.getElementById("right")
//            },
//        });
//        drake.on("drop", this.onDropFn.bind(this));
//    }
//    this.onDropFn = function (el, target, source, yy) {
//        alert("bdh");
//    }
//    this.init = function () {
//        this.dragulafun();
//        if (this.EbObject === null) {
//            this.EbObject = new EbObjects.EbSqlJob("tb" + this.Conf.TabNum + "SqlJOb");
//        }
//        this.propGrid = new Eb_PropertyGrid({
//            id: "propGrid",
//            wc: this.Wc,
//            cid: this.Cid,
//            $extCont: $("#ppt-dash"),
//            isDraggable: true
//        });
//        this.propGrid.setObject(this.EbObject, AllMetas["EbSqlJob"]);
//        commonO.Current_obj = this.EbObject;
//    }

   
//    this.init();
//}