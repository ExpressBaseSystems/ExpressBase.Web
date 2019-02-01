function EB_Api_entry(option) {
    this.Config = $.extend({}, option);
    this.validate = function () {
        return true;
    };

    if (this.validate()) {
        window.Api = {};
        window.Api.Constants = {};
        window.Api.Creator = new EbApiBuild(this.Config);
        window.Api.JsonWindow = new EbPrettyJson({ ContetEditable: ["Value"], HideFields: ["ValueTo"] });
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
    this.FlagRun = false;

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

    this.toggleReqWindow = function (resp,ref) {
        $(`#Json_reqOrRespWrp`).show();
        $(`#Json_reqOrRespWrp`).attr("ref_id", ref);
        $(`#Json_reqOrRespWrp #JsonReq_CMW`).html(window.Api.JsonWindow.build(resp));
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

    this.setBtns = function () {
        $("#obj_icons").empty().append(`<button class='btn run' id='api_run' data-toggle='tooltip' data-placement='bottom' title= 'Run'>
                                            <i class='fa fa-play' aria-hidden='true'></i>
                                        </button>`);
        $("#api_run").off("click").on("click", this.apiRun.bind(this));
    };

    this.apiRun = function (ev) {
        this.FlagRun = true;
        commonO.Save();
    }

    commonO.saveOrCommitSuccess = function (refid) {
        var ref = null;
        if (this.FlagRun) {
            for (let i = 0; i < this.EbObject.Resources.$values.length; i++) {
                let eb_type = this.EbObject.Resources.$values[i].$type.split(",")[0].split(".")[2];
                if (eb_type === "EbSqlReader" || eb_type === "EbSqlFunc" || eb_type === "EbSqlWriter ") {
                    ref = this.EbObject.Resources.$values[i].Refid;
                    break;
                }
            }
            if (ref) {
                $.ajax({
                    url: "../Dev/GetReq_respJson",
                    type: "GET",
                    cache: false,
                    data: { "refid": ref },
                    success: function (result) {
                        this.toggleReqWindow(JSON.parse(result), ref);
                        this.FlagRun = false;
                    }.bind(this)
                });
            }
        }
    }.bind(this)

    this.getApiResponse = function (ev) {
        var ref = $(ev.target).closest('.Json_reqOrRespWrpr').attr("ref_id");
        var name = this.EbObject.Name;
        var ver = commonO.Current_obj.VersionNumber;
        $.ajax({
            url: "../Dev/GetApiResponse",
            type: "GET",
            cache: false,
            data: {
                "name": name,
                "vers": ver,
                "param": $(`#Json_reqOrRespWrp #JsonReq_CMW`).text()
            },
            success: function (result) {
                this.toggleRespWindow(JSON.parse(result), ref);
                this.FlagRun = false;
            }.bind(this)
        });
    };

    this.toggleRespWindow = function (result) {
        $(`#Json_reqOrRespWrp`).show();
        $(`#Json_reqOrRespWrp #JsonResp_CMW`).html(window.Api.JsonWindow.build(result));
    };

    this.start = function () {
        this.setBtns();

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
        $(".runReq_btn").off("click").on("click", this.getApiResponse.bind(this));
    };

    this.start();
}