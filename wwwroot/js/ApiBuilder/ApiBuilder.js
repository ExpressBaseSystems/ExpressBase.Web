﻿function EB_Api_entry(option) {
    this.Config = $.extend({}, option);
    this.validate = function () {
        return true;
    };

    if (this.validate()) {
        window.Api = {};
        window.Api.Constants = {};
        window.Api.Creator = new EbApiBuild(this.Config);
        window.Api.JsonWindow = new EbPrettyJson({
            ContetEditable: ["Value"],
            HideFields: ["ValueTo"]
        });
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
    this.ComponentRun = false;
    this.Component = null;
    this.ResultData = {};

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
        this.prepareApiobject();
        if (this.reidStat)
            commonO.Current_obj = this.EbObject;
        else
            EbMessage("show", { Message: "Reference must be set!", Background: "red" });
        return this.reidStat;
    };//save

    this.prepareApiobject = function () {
        $(`#${this.dropArea}`).find(".apiPrcItem").each(this.loopProcess.bind(this));
    }

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
        if ('Reference' in this.Procs[id]) {
            if (this.Procs[id].Reference === "" || this.Procs[id].Reference === null)
                return false;
            else
                return true;
        }
        else {
            return true;
        }
    };

    this.pg.PropertyChanged = function (obj, pname) {
        if (pname === "Reference" && obj.Reference !== "" && obj.Reference !== null) {
            $("#" + obj.EbSid).children(".drpbox").removeClass("refIdMsetNotfy");
            this.getComponent(obj);
        }
    }.bind(this);

    this.getComponent = function (obj) {
        if (obj.Reference) {
            $.ajax({
                url: "../Dev/GetComponent",
                type: "GET",
                cache: false,
                beforeSend: function () {
                },
                data: { "refid": obj.Refid },
                success: function (component) {
                    obj.RefName = component.name;
                    obj.Version = component.version;
                    this.RefreshControl(obj);
                }.bind(this)
            });
        }
    };

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
            //this.getComponent(obj.Refid, obj.EbSid);
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
        $(`#Json_reqOrRespWrp #JsonReq_CMW`).html(window.Api.JsonWindow.build(resp));
        $(`#Json_reqOrRespWrp #JsonResp_CMW`).empty();
        this.setSampleCode(resp);
    };

    this.setSampleCode = function (req) {
        $('#api_scodeMd .url').text(`'${location.origin}/api/${this.EbObject.Name}/${commonO.getVersion()}'`);
        $('#api_scodeMd .method').text(`'${this.EbObject.Method || "POST/GET"}'`);
        var s = "";
        var o = {};
        for (let i = 0; i < req.length; i++) {
            s = s + req[i].Name + "=" + req[i].ValueTo + ((i == req.length - 1) ? "" : "&");
            o[req[i].Name] = req[i].ValueTo;
        }
        $(`#api_scodeMd #js .data`).text(`'${s}'`);
        $(`#api_scodeMd #ajax .data`).text(JSON.stringify(o));
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

    commonO.saveOrCommitSuccess = function (ref) {
        this.setBtns();
    }.bind(this)

    this.GenerateButtons = function () {
        this.setBtns();
    };

    this.apiRun = function (ev) {
        this.reidStat = true;
        this.prepareApiobject();
        if (this.reidStat) {
            $.ajax({
                url: "../Dev/GetReq_respJson",
                type: "GET",
                cache: false,
                beforeSend: function () {
                    $("#eb_common_loader").EbLoader("show");
                },
                data: { "components": JSON.stringify(this.EbObject.Resources) },
                success: function (result) {
                    this.toggleReqWindow(JSON.parse(result));
                    this.ComponentRun = false;
                    $("#eb_common_loader").EbLoader("hide");
                }.bind(this)
            });
        }
    }

    this.getApiResponse = function (ev) {
        let _data = null;
        if (!this.ComponentRun) {
            _data = { "name": this.EbObject.Name, "vers": commonO.getVersion(), "param": $(`#Json_reqOrRespWrp #JsonReq_CMW`).text() };
        }
        else {
            _data = { "param": $(`#Json_reqOrRespWrp #JsonReq_CMW`).text(), "component": JSON.stringify(this.Component) }
        }
        $.ajax({
            url: "../Dev/GetApiResponse",
            type: "GET",
            cache: false,
            beforeSend: function () {
                $("#eb_common_loader").EbLoader("show", { maskItem: { Id: '#JsonResp_CMW', Style: { "top": "0", "left": "0" } } });
            },
            data: _data,
            success: function (result) {
                (this.ComponentRun) ? this.toggleRespWindow(JSON.parse(result).Result, this.Component) : this.toggleRespWindow(JSON.parse(result), this.EbObject);
                $("#eb_common_loader").EbLoader("hide");
            }.bind(this)
        });
    };

    this.toggleRespWindow = function (result, o) {
        this.ResultData = result;
        let _html = window.Api.JsonWindow.build(result);
        $(`#Json_reqOrRespWrp`).show();
        $(`#Json_reqOrRespWrp #JsonResp_CMW`).html(_html);
        $(`#api_RqFullSwrapr .FS_bdy`).html(_html);
        $(`#api_RqFullSwrapr .FS_head .Comp_Name`).text(`${o.RefName || o.Name} (${o.Version || o.VersionNumber})`);
    };

    this.showSampleCode = function (ev) {
        $("#api_scodeMd").modal("toggle");
    };

    this.foramatChange = function (ev) {
        let o = null;
        let html = "";
        if (this.ComponentRun) 
            o = this.Component;
        else 
            o = this.EbObject;

        if ($(ev.target).val() === 'xml') {
            html = window.Api.JsonWindow.json2xml(this.ResultData);
        }
        else if ($(ev.target).val() === 'json')
            html = window.Api.JsonWindow.build(this.ResultData);
        else if ($(ev.target).val() === 'raw')
            html = window.Api.JsonWindow.rawData(this.ResultData);

        $(`#Json_reqOrRespWrp #JsonResp_CMW`).html(html);
        $(`#api_RqFullSwrapr .FS_bdy`).html(html);
        $(`#api_RqFullSwrapr .FS_head .Comp_Name`).text(`${o.RefName || o.Name} (${o.Version || o.VersionNumber})`);
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
        //$("#sample_codes").off("click").on("click", this.showSampleCode.bind(this));
        $('.format_type').off("change").on("change", this.foramatChange.bind(this));
    };

    this.start();
}