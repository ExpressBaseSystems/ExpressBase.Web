function EB_MobilePage(option) {
    this.Config = $.extend({}, option);
    this.validate = function () {
        return true;
    };

    if (this.validate()) {
        if (window.MobilePage === null || window.MobilePage === undefined)
            window.MobilePage = {};
        window.MobilePage["Tab" + this.Config.TabNum] = {};
        window.MobilePage["Tab" + this.Config.TabNum].Constants = {};
        window.MobilePage["Tab" + this.Config.TabNum].Creator = new EbMobStudio(this.Config);
        return window.MobilePage["Tab" + this.Config.TabNum].Creator;
    }
    else {
        console.log("initialization error");
        return null;
    }
};

function EbMobStudio(config){
    this.Conf = config;
    this.EditObj = $.isEmptyObject(this.Conf.DsObj) ? null : this.Conf.DsObj;
    this.EbObject = null;
    this.Procs = {};

    this.pg = new Eb_PropertyGrid({
        id: "eb_mobpage_properties" + this.Conf.TabNum,
        wc: this.Conf.Wc,
        cid: this.Conf.TenantId,
        $extCont: $("#eb_mobpage_property_wrapr" + this.Conf.TabNum)
    });

    this.newMobPage = function () {
        this.EbObject = new EbObjects["EbMobilePage"]("tb" + this.Conf.TabNum + "MobilePage");
        this.pg.setObject(this.EbObject, AllMetas["EbMobilePage"]);
    };

    this.editMobPage = function () {

    };

    this.DragDrop_Items = function () {
        let dritem = `eb_mobpage_toolbox${this.Conf.TabNum}_draggable`;
        var drg = dragula([document.getElementById(dritem), document.getElementById(`eb_mob_layoutdrop`)],
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
        let ebtype = $(el).attr("eb-type");
        var id = "tb" + this.Conf.TabNum + ebtype + CtrlCounters[$(el).attr("eb-type") + "Counter"]++;
        this.Procs[id] = new EbObjects["Eb" + ebtype](id);
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
        $("#" + obj.EbSid).off("focus").on("focus", this.elementOnFocus.bind(this));
    };//render after pgchange

    this.elementOnFocus = function (event) {
        event.stopPropagation();
        var curControl = $(event.target).closest(".apiPrcItem");
        var curObject = this.Procs[curControl.attr("id")];
        var type = curControl.attr('eb-type');
        this.pg.setObject(curObject, AllMetas["Eb" + type]);
    };

    this.exe = function () {
        if (this.EditObj === null || this.EditObj === "undefined")
            this.newMobPage();
        else
            this.editMobPage();

        this.DragDrop_Items();
    };

    this.exe();
}