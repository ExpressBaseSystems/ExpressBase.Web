//var JsonWindow = function () {
//    this.JsonHtml = [];
//    this.getJsonWindow = function (_json_string) {
//        this.JsonHtml = [];
//        let json = JSON.parse(_json_string);
//        if (Array.isArray(json)) {
//            this.drawArray(json)
//        }
//        else if (typeof json === "object")
//            this.JsonHtml.push(`<div class="a_ob_o">{</div>`);
//        return this.JsonHtml.join("");
//    }

//    this.drawArray = function (json) {
//        this.JsonHtml.push(`<div class="a_o">[</div>`);
//        this.JsonHtml.push(`<ol class="a_o">`);
//        for (let i = 0; i < json.length; i++) {
//            if (Array.isArray(json[i])) {

//            }
//            else if (typeof json[i] === "object") {
//                this.drawObj(json[i], (i === json.length - 1));

//            }
//        }
//        this.JsonHtml.push(`</ol>`);
//        this.JsonHtml.push(`<div class="a_c">]</div>`);
//    }

//    this.drawObj = function (json, isLast) {
//        this.JsonHtml.push(`<li class="a_ob_o">{`);
//        this.loopObj(json);
//        this.JsonHtml.push(`}`);
//        if (!isLast)
//            this.JsonHtml.push(`<span class="comma">,</span>`);
//        this.JsonHtml.push(`</li>`);
//    };

//    this.loopObj = function (json) {
//        this.JsonHtml.push(`<ul class="item">`);
//        let last = Object.keys(json)[Object.keys(json).length - 1];
//        for (let kvp in json) {
//            if (typeof json[kvp] === "string" || typeof json[kvp] === "number" || typeof json[kvp] === "boolean" || json[kvp] === null) {
//                this.JsonHtml.push(this.genJsonFjsObj(kvp, json[kvp], (kvp === last)));
//            }
//            else if (typeof json[kvp] === "object") {
//                this.loopObj(json[kvp]);
//            }
//        }
//        this.JsonHtml.push(`</ul>`);
//    };

//    this.genJsonFjsObj = function (k, v, isComa) {
//        let ce = (k === "Value") ? true : false;
//        let cma = (isComa) ? "" : '<span class="comma">,</span>';
//        let val = null;
//        if (v === null)
//            val = null;
//        else if (typeof v === "string")
//            val = `"${v}"`;
//        else if (typeof v === "number")
//            val = v;

//        return `<li class="wraper_line">
//                    <span class="objkey">"${k}"</span>
//                    <span class="colon">:</span>
//                    <span class="objval" contenteditable="${ce}">${val}</span>
//                    ${cma}
//                </li>`;
//    }
//};

function EB_Api_entry(option) {
    this.Config = $.extend({}, option);
    this.validate = function () {
        return true;
    };

    if (this.validate()) {
        window.Api = {};
        window.Api.Constants = {};
        window.Api.Creator = new EbApiBuild(this.Config);
        window.Api.JsonWindow = new JsonWindow({ ContetEditable: ["Value"], HideFields: []});
        return window.Api.Creator;
    }
    else {
        console.log("initialization error");
        return null;
    }
};

function EbApiBuild(config) {
    this.Conf = config;
    this.EditObj = $.isEmptyObject(this.Conf.DsObj) ? null : this.Conf.DsObj;
    this.EbObject = null;
    this.Lines = {};
    this.Procs = {};
    this.dropArea = "resource_Body_drparea";

    this.pg = new Eb_PropertyGrid({
        id: "pgContainer_wrpr",
        wc: this.Conf.Wc,
        cid: this.Conf.TenantId,
        $extCont: $("#pgContainer")
    });

    this.DragDrop_Items = function () {
        var drg = dragula([document.getElementById("draggable"), document.getElementById("resource_Body_drparea")],
            {
                copy: function (el, source) {
                    return source === document.getElementById("draggable")
                },
                accepts: function (el, target) {
                    return target !== document.getElementById("draggable")
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
        this.resetLinks();
    };

    this.makeElement = function (el) {
        let ebtype = $(el).attr("eb-type");
        var id = ebtype + CtrlCounters[$(el).attr("eb-type") + "Counter"]++;
        this.Procs[id] = new EbObjects["Eb" + ebtype](id);
        this.Procs[id].Label = $(el).attr("ctrname");

        return this.Procs[id];
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

    this.resetLinks = function () {
        this.rmLines();
        let n = 0;
        let process = $(`#${this.dropArea}`).find(".apiPrcItem");
        while (n < process.length - 1) {
            this.setLine(process[n].id, process[n + 1].id);
            n = n + 1;
        }
    };

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
        var curControl = $(event.target).closest(".apiPrcItem");
        var curObject = this.Procs[curControl.attr("id")];
        var type = curControl.attr('eb-type');
        this.pg.setObject(curObject, AllMetas["Eb" + type]);
    };

    this.BeforeSave = function () {
        this.reidStat = true;
        this.EbObject.Resources.$values.length = 0;
        $(`#${this.dropArea}`).find(".apiPrcItem").each(this.loopProcess.bind(this));
        if (this.reidStat)
            commonO.Current_obj = this.EbObject;
        else
            EbMessage("show", { Message: "RefId must be set!", Background: "red" });
        return this.reidStat;
    };//save

    this.loopProcess = function (i, o) {
        if (["start_item", "end_item"].indexOf(o.id) < 0) {
            if (this.validateRefid(o.id)) {
                this.Procs[o.id].RouteIndex = $(o).index();
                this.EbObject.Resources.$values.push(this.Procs[o.id]);
            }
            else {
                this.reidStat = false;
                $(o).children(".drpbox").toggleClass("refIdMsetNotfy");
            }
        }
    };

    this.validateRefid = function (id) {
        if (this.Procs[id].Refid === "" || this.Procs[id].Refid === null)
            return false;
        else
            return true;
    };

    this.pg.PropertyChanged = function (obj, pname) {
        if (pname === "Refid" && obj.Refid !== "" && obj.Refid !== null)
            $("#" + obj.EbSid).children(".drpbox").removeClass("refIdMsetNotfy");
    }.bind(this);

    this.drawProcsEmode = function () {
        var o = this.EditObj.Resources.$values;
        for (let i = 0; i < o.length; i++) {
            var ebtype = o[i].$type.split(",")[0].split(".").pop().substring(2);
            var id = ebtype + CtrlCounters[ebtype + "Counter"]++;
            var obj = new EbObjects["Eb" + ebtype](id);
            this.replaceProp(obj, o[i]);
            $(`#${this.dropArea} #end_item`).before(obj.$Control.outerHTML());
            this.Procs[id] = obj;
            this.RefreshControl(this.Procs[id]);
        }
    };

    this.replaceProp = function (source, destination) {
        for (var objPropIndex in source) {
            if (typeof source[objPropIndex] !== "object" && objPropIndex !== "$Control" && objPropIndex !== "EbSid") {
                source[objPropIndex] = destination[objPropIndex];
            }
        }
    }

    this.toggleReqWindow = function (resp) {
        $(`#Json_reqOrRespWrp`).show();
        $(`#Json_reqOrRespWrp #JsonReq_CMW`).html(window.Api.JsonWindow.getJsonWindow(resp));
    };

    this.newApi = function () {
        this.EbObject = new EbObjects["EbApi"]("Api");
        this.pg.setObject(this.EbObject, AllMetas["EbApi"]);
        this.setLine('start', 'stop');
    };

    this.editApi = function () {
        this.EbObject = new EbObjects["EbApi"](this.EditObj.Name);
        this.replaceProp(this.EbObject, this.EditObj);
        this.pg.setObject(this.EbObject, AllMetas["EbApi"]);
        this.EbObject.Resources.$values.length = 0;
        this.drawProcsEmode();
        this.resetLinks();
    };

    this.start = function () {
        if (this.EditObj === null || this.EditObj === "undefined")
            this.newApi();
        else
            this.editApi();
        this.DragDrop_Items();
        this.ApiMenu = new ApiMenu(this);
        var resize = $("#Json_reqOrRespWrp").resizable({
            handles: "n",
            minHeight: 50
        });
    };

    this.start();
}