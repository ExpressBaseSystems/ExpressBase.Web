﻿var ApiMenu = function (option) {
    this.Api = option;

    this.contextMenudelete = function (eType, selector, action, originalEvent) {
        let o = this.Api.Procs[selector.$trigger.attr("id")];
        let eb_type = o.$type.split(',')[0].split('.')[2];
        if (eb_type !== "EbProcessor") {
            if (o.Reference !== "" && o.Reference !== null) {
                $.ajax({
                    url: "../Dev/GetCompReqJson",
                    type: "GET",
                    cache: false,
                    data: { "refid": o.Reference },
                    success: function (result) {
                        let ob = JSON.parse(result);
                        for (let i = 0; i < ob.length; i++) {
                            this.Api.EbObject.Request.Default.$values = this.Api.EbObject.Request.Default.$values.filter(el => el.Name !== ob[i].Name);
                        }
                        $(`#Json_reqOrRespWrp #JsonReq_CMW .table tbody`).empty();
                        this.Api.setRequestW(this.Api.EbObject.Request.Default.$values);
                        this.Api.setRequestW(this.Api.EbObject.Request.Custom.$values,"custom");
                    }.bind(this)
                });
            }
        }
        delete this.Api.Procs[$(selector.$trigger).attr("id")];
        $(selector.$trigger).remove();
        this.Api.pg.removeFromDD($(selector.$trigger).attr("id"));
        this.Api.resetLinks();
    };

    this.getReq_RespJSON = function (eType, selector, action, originalEvent) {
        let o = this.Api.Procs[selector.$trigger.attr("id")];
        let eb_type = o.$type.split(',')[0].split('.')[2];
        this.Api.Component = o;
        if (eb_type !== "EbProcessor") {
            if (o.Reference !== "" && o.Reference !== null) {
                $.ajax({
                    url: "../Dev/GetCompReqJson",
                    type: "GET",
                    cache: false,
                    data: { "refid": o.Reference },
                    success: function (result) {
                        this.Api.toggleReqWindow(o.RefName,JSON.parse(result));
                        this.Api.ComponentRun = true;
                    }.bind(this)
                });
            }
            else {
                $(`#${o.EbSid}`).children(".drpbox").toggleClass("refIdMsetNotfy");
                EbMessage("show", { Message: "Reference must be set!", Background: "red" });
            }
        }
    };

    this.options = {
        "delete": { name: "Delete", icon: "delete", callback: this.contextMenudelete.bind(this) },
        "req&resp": { name: "Request Parameter", icon:"fa-exchange",callback:this.getReq_RespJSON.bind(this)}
    };

    this.initContextMenu = function () {
        $.contextMenu({
            selector: '.dropped',
            autoHide: true,
            build: function ($trigger, e) {
                return { items: this.getMenu($trigger, e) };
            }.bind(this)
        });
        $.contextMenu({
            selector: '#api_request',
            autoHide: false,
            build: function ($trigger, e) {
                return {
                    items: {
                        "Addcustomparam": {
                            name: "Add Custom Param", icon: "fa-plus", callback: function () { $("#api_scodeMd").modal("toggle"); } },
                        "requestparam": { name: "Request Parameter", icon: "fa-exchange", callback: this.requestParameters.bind(this) }
                    }
                };
            }.bind(this)
        });
    };

    this.requestParameters = function (eType, selector, action, originalEvent) {
        this.Api.ComponentRun = false;
        $("#Json_reqOrRespWrp .reqLabel").text(` (${this.Api.EbObject.Name || "Api"}) `);
        $(`#Json_reqOrRespWrp #JsonReq_CMW .table tbody`).empty();
        this.Api.setRequestW(this.Api.EbObject.Request.Default.$values);
        this.Api.setRequestW(this.Api.EbObject.Request.Custom.$values,'custom');
        this.Api.Request.Default = this.Api.EbObject.Request.Default.$values;
        this.Api.Request.Custom = this.Api.EbObject.Request.Custom.$values;
    };

    this.getMenu = function ($trigger, e) {
        let m = $.extend({}, this.options);
        let eb_type = $trigger.attr("eb-type");
        if (eb_type === "Processor")
            delete m["req&resp"];
        return m;
    };
    this.initContextMenu();
};