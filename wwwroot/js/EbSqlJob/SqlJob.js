

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
    this.Procs = {};
    this.Lines = {};
    this.process = [];
    this.process2 = [];
    this.dropArea = "tb" + this.TabNum + "_SqlJob_drop_cont";
    this.FlagRun = false;
    this.ComponentRun = false;
    this.Component = null;
    this.ResultData = {};
    this.Request = { Default: [], Custom: [] };
    this.Customparams = {};
    this.drg;

    this.pg = new Eb_PropertyGrid({
        id: "tb" + this.TabNum + "_SqlJob_PropGrid",
        wc: this.Wc,
        cid: this.Cid,
        $extCont: $("#tb" + this.TabNum + "_SqlJob_PGgrid")
    });


    this.DragDrop_Items = function () {
        let dritem = `tb${this.TabNum}_SqlJob_drag_cont`;
        this.drg = dragula([$(`#${dritem}`)[0], $(`#tb${this.TabNum}_SqlJob_drop_cont`)[0]],
            {
                copy: function (el, source) {
                    return source === document.getElementById(dritem);
                },
                accepts: function (el, target) {
                    return target !== document.getElementById(dritem);
                }
            });
        this.drg.on("drop", this.onDropFn.bind(this));
    };//drag drop starting func

    this.onDropFn = function (el, target, source, yy) {
        let o;
        if (!$(el).hasClass("dropped")) {
            o = this.makeElement(el);
            $(el).replaceWith(o.$Control.outerHTML());
            this.RefreshControl(o);
            if ((o.Label == "Transaction" || o.Label == "Loop") && target !== null) {
                this.drg.containers.push($(`#${o.EbSid} .Sql_Dropable`)[0]);
            }
        }
            this.resetLinks();
    };

    //this.Dropable_trigger = function (obj) {
    //    let dritem = `tb${this.TabNum}_SqlJob_drag_cont`;

    //    var drake = dragula([$(`#${dritem}`)[0], $(`#${obj.EbSid} .Sql_Dropable`)[0]],
    //        {
    //            copy: function (el, source) {
    //                return source === $(`#${dritem}`)[0]
    //            },
    //            accepts: function (el, target) {
    //                return target !== $(`#${dritem}`)[0]
    //            }
    //        });
    //    drake.on("drop", this.onDropFn.bind(this));
    //};

    this.makeElement = function (el) {
        let ebtype = $(el).attr("eb-type");
        var id = "tb" + this.TabNum + ebtype + CtrlCounters[$(el).attr("eb-type") + "Counter"]++;
        this.Procs[id] = new EbObjects["Eb" + ebtype](id);
        this.Procs[id].Label = $(el).attr("ctrname");
        return this.Procs[id];
    };

    this.RefreshControl = function (obj) {
        var NewHtml = obj.$Control.outerHTML();
        var metas = AllMetas["Eb" + $("#" + obj.EbSid).attr("eb-type")];
        $.each(metas, function (i, meta) {
            var name = meta.name;
            if (meta.IsUIproperty) {
                NewHtml = NewHtml.replace('@' + name + ' ', obj[name]);
            }
        });
        $("#" + obj.EbSid).replaceWith(NewHtml);
        $("#" + obj.EbSid + " .drpbox").off("focus").on("focus", this.elementOnFocus.bind(this));
        
    };//render after pgchange

    this.elementOnFocus = function (event) {
        event.stopPropagation();
        var curControl = $(event.target).closest(".SqlJobItem");
        var curObject = this.Procs[curControl.attr("id")];
        var type = curControl.attr('eb-type');
        this.pg.setObject(curObject, AllMetas["Eb" + type]);
    };


    this.resetLinks = function () {
        this.rmLines();
        let n = 0;

        this.process = $(`#${this.dropArea}`).find(".lineDrp");
        ////this.process2 = {};
        //$(`#${this.dropArea}`).children().each(function (index, object) {
        //    //this.process = $(`#${this.getAttribute("id")}`).children();
        //    this.process[index] = object;
        //    if (object.getAttribute("eb-type") == "Transaction" || object.getAttribute("eb-type")== "Loop") {

        //    }
        //}.bind(this));
       
        while (n < this.process.length - 1) {
            this.setLine(this.process[n].id, this.process[n + 1].id);
            n = n + 1;
        }
    };

    this.setLine = function (startid, endid) {
        let name = startid + endid;
        this.Lines[name] = new LeaderLine(
            document.getElementById(startid),
            document.getElementById(endid), {
            color: "#316396"
        }
        );
        this.Lines[name].position();
    }

    this.rmLines = function () {
        try {
            for (var line in this.Lines) {
                this.Lines[line].remove();
            }
            this.Lines = {};
        }
        catch (exp) {
            this.Lines = {};
        }
    };

    this.start = function () {
        this.DragDrop_Items();
        $(`#tb${this.TabNum}_SqlJob_drop_cont`).on("click", ".drpboxInt", this.elementOnFocus.bind(this));
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