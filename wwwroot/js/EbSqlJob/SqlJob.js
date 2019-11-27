

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
    this.EditObj = $.isEmptyObject(options.sqlJobObj) ? null : options.sqlJobObj;
    this.EbObject = null;
    this.Version = options.Version;
    this.Wc = options.Wc;
    this.TabNum = options.TabNum;
    this.Procs = {};
    this.Loops = {};
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
    this.source;
    this.OuterEl = [];

    this.pg = new Eb_PropertyGrid({
        id: "tb" + this.TabNum + "_SqlJob_PropGrid",
        wc: this.Wc,
        cid: this.Cid,
        $extCont: $("#tb" + this.TabNum + "_SqlJob_PGgrid")
    });


    this.newSqlJob = function () {
        this.EbObject = new EbObjects["EbSqlJob"]("tb" + options.TabNum + "SqlJob");
        this.pg.setObject(this.EbObject, AllMetas["EbSqlJob"]);
        //this.setLine('start', 'stop');
        this.resetLinks();
    };

    this.editSqlJob = function () {
        this.EbObject = new EbObjects["EbSqlJob"](this.EditObj.Name);
        {
            var _o = $.extend(true, {}, this.EditObj);
            $.extend(this.EbObject, _o);
        }
        this.pg.setObject(this.EbObject, AllMetas["EbSqlJob"]);
        this.EbObject.Resources.$values.length = 0;
        this.drawSqlObj();
        this.resetLinks();
        this.Tilecontext();
        //this.setRequestW(this.EbObject.Request.Default.$values);
        //this.setRequestW(this.EbObject.Request.Custom.$values, 'custom');
        //this.Request.Default = this.EbObject.Request.Default.$values;
        //this.Request.Custom = this.EbObject.Request.Custom.$values;
    };
    this.drawSqlObj = function () {
        var o = this.EditObj.Resources.$values;
        let cont = $(`#${this.dropArea}`);
        this.drawProcsEmode(o , cont);
    }
    this.drawProcsEmode = function (o , cont) {
        for (let i = 0; i < o.length; i++) {
            var ebtype = o[i].$type.split(",")[0].split(".").pop().substring(2);
            var id = "tb" + this.conf.TabNum + ebtype + CtrlCounters[ebtype + "Counter"]++;
            var obj = new EbObjects["Eb" + ebtype](id);
            this.drawProcInnerMode(obj, o[i], ebtype, cont)
            this.Procs[id] = obj;
            if (ebtype !== "Transaction") {
                this.RefreshControl(this.Procs[id]);
            }
            if ((this.Procs[id].Label == "Transaction" || this.Procs[id].Label == "Loop")) {
                this.drg.containers.push($(`#${this.Procs[id].EbSid} .Sql_Dropable`)[0]);
            }
           
        }
    };

    this.drawProcInnerMode = function (obj, ext, ebtype, cont ) {
        $.extend(obj, ext);
        cont.append(obj.$Control.outerHTML());
        if (ebtype === "Transaction" || ebtype === "Loop") {
            var o = obj.InnerResources.$values;
            let cont = $(`#${this.dropArea} #${obj.EbSid} .Sql_Dropable`);
            this.drawProcsEmode(o , cont);
        }
    }

    this.drawProcInner2Mode = function () {

    }

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

    this.BeforeSave = function () {
        this.reidStat = true;
        this.EbObject.Resources.$values.length = 0;
        this.prepareSqlJobobject();
        if (this.reidStat)
            commonO.Current_obj = this.EbObject;
        else
            EbMessage("show", { Message: "Reference must be set!", Background: "red" });
        return this.reidStat;
    }

    this.prepareSqlJobobject = function () {
        var $elementsAll = $(".Sql-Job-Cont").find(".SqlJobItem");
        var $FirstLevel = $elementsAll.not($elementsAll.children().find($elementsAll));
        for (let i = 0; i < $FirstLevel.length; i++) {
            this.OuterEl.push($FirstLevel[i].id);
        }       
        this.loopProcess($FirstLevel, this.EbObject.Resources)
    }
    this.loopProcess = function (ele, obj) {
      
        ele.each(function (i, o) {
            if (o.getAttribute("eb-type") === "Loop" || o.getAttribute("eb-type") === "Transaction") {
                this.Procs[o.id].RouteIndex = $(o).index();
                this.LoopProcess2(o.id, this.Procs[o.id].InnerResources);
            }
            else if (o.id) {
                this.Procs[o.id].RouteIndex = $(o).index();
                obj.$values.push(this.Procs[o.id]);
            }
            else {
                this.reidStat = false;
                $(o).children(".drpbox").toggleClass("refIdMsetNotfy");
            }
        }.bind(this));
  
    }

    this.LoopProcess2 = function (id , obj) {
        var $elementsAll = $(`#${id} .Sql_Dropable`).find(`.SqlJobItem`);
        var inner = $elementsAll.not($elementsAll.children().find($elementsAll));
        this.Procs[id].InnerResources.$values.length = 0;
        this.loopProcess(inner, this.Procs[id].InnerResources);
        if (this.OuterEl.includes(id)) {
            this.EbObject.Resources.$values.push(this.Procs[id]);
        }
        else {
            this.Procs[id].InnerResources.$values.push(this.Procs[id])
        }
     
        
    };

    this.Tilecontext = function () {
        $.contextMenu({
            selector: '.lineDrp',
            trigger: 'right',
            items: {
                "RemoveTile": {
                    name: "Remove", icon: "remove", callback: this.RemoveDiv.bind(this),
                }
            }
        });
    }
    this.RemoveDiv = function (name, selector, event) {
        selector.$trigger.closest(".SqlJobItem")[0].remove();
        this.resetLinks();

    }

    this.start = function () {
        this.DragDrop_Items();
        if (this.EditObj === null || this.EditObj === "undefined") {
            this.newSqlJob();
        }
        else {
             this.editSqlJob();
        }
        
       
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