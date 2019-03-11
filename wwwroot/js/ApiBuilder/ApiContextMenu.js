var ApiMenu = function (option) {
    this.Api = option;

    this.contextMenudelete = function (eType, selector, action, originalEvent) {
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
                        this.Api.toggleReqWindow(JSON.parse(result));
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
        "req&resp": { name: "Request JSON & Response JSON", icon:"fa-exchange",callback:this.getReq_RespJSON.bind(this)}
    };

    this.initContextMenu = function () {
        $.contextMenu({
            selector: '.dropped',
            autoHide: true,
            build: function ($trigger, e) {
                return { items: this.getMenu($trigger, e) };
            }.bind(this)
        });
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