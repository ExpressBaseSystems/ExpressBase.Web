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

function EbMobStudio(){
    this.Conf = config;
    this.EditObj = $.isEmptyObject(this.Conf.DsObj) ? null : this.Conf.DsObj;
    this.EbObject = null;

    this.pg = new Eb_PropertyGrid({
        id: "eb_mobpage_properties" + this.Conf.TabNum,
        wc: this.Conf.Wc,
        cid: this.Conf.TenantId,
        $extCont: $("#eb_mobpage_property_wrapr" + this.Conf.TabNum)
    });

    this.exe = function () {

    };

    this.exe();
}