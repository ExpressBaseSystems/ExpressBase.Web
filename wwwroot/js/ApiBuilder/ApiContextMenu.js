var ApiMenu = function (option) {
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
                        $(`#tb${this.Api.Conf.TabNum}_Json_reqOrRespWrp #tb${this.Api.Conf.TabNum}_JsonReq_CMW .table tbody`).empty();
                        this.Api.setRequestW(this.Api.EbObject.Request.Default.$values);
                        this.Api.setRequestW(this.Api.EbObject.Request.Custom.$values, "custom");
                    }.bind(this)
                });
            }
        }

        delete this.Api.Procs[$(selector.$trigger).attr("id")];
        this.Api.pg.removeFromDD($(selector.$trigger).attr("id"));
        $(selector.$trigger).remove();
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
                        this.Api.toggleReqWindow(o.RefName, JSON.parse(result));
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
        "req&resp": { name: "Request Parameter", icon: "fa-exchange", callback: this.getReq_RespJSON.bind(this) }
    };

    this.initContextMenu = function () {
        $.contextMenu({
            selector: '#apiversion-body' + this.Api.Conf.TabNum + ' .dropped',
            autoHide: true,
            build: function ($trigger, e) {
                return { items: this.getMenu($trigger, e) };
            }.bind(this)
        });
        $.contextMenu({
            selector: '#tb' + this.Api.Conf.TabNum + '_api_request',
            autoHide: false,
            build: function ($trigger, e) {
                return {
                    items: {
                        "Addcustomparam": {
                            name: "Add Custom Param", icon: "fa-plus", callback: function () { $("#tb" + this.Api.Conf.TabNum+"_api_scodeMd").modal("toggle"); }.bind(this)
                        },
                        "requestparam": { name: "Request Parameter", icon: "fa-exchange", callback: this.requestParameters.bind(this) }
                    }
                };
            }.bind(this)
        });
    };

    this.requestParameters = function (eType, selector, action, originalEvent) {
        this.Api.ComponentRun = false;
        $("#tb" + this.Api.Conf.TabNum +"_Json_reqOrRespWrp .reqLabel").text(` (${this.Api.EbObject.Name || "Api"}) `);
        $(`#tb${this.Api.Conf.TabNum}_Json_reqOrRespWrp #tb${this.Api.Conf.TabNum}_JsonReq_CMW .table tbody`).empty();
        this.Api.setRequestW(this.Api.EbObject.Request.Default.$values);
        this.Api.setRequestW(this.Api.EbObject.Request.Custom.$values, 'custom');
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