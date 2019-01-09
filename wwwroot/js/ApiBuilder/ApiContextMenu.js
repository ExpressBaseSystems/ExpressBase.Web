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

        if (o.Refid !== "" && o.Refid !== null) {
            $.ajax({
                url: "../Api/GetReq_respJson",
                type: "GET",
                cache: false,
                data: { "refid": o.Refid },
                success: function (result) {
                    this.Api.toggleReqWindow(result);
                }.bind(this)
            });
        }
        else {
            $(`#${o.EbSid}`).children(".drpbox").toggleClass("refIdMsetNotfy");
            EbMessage("show", { Message: "RefId must be set!", Background: "red" });
        }
    };

    this.options = {
        "delete": { name: "Delete", icon: "delete", callback: this.contextMenudelete.bind(this) },
        "req&resp": {name:"Request JSON & Response JSON",icon:"",callback:this.getReq_RespJSON.bind(this)}
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
        return m;
    };
    this.initContextMenu();
};