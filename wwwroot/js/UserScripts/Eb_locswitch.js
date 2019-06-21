let LocSwitch = function (options) {
    const GetLocUrl = "gdgtd";
    const SetUrl = "/TenantUser/UpdateLocation";
    const LocModId = "#loc_switchModal";
    const TriggerId = "#switch_loc";
    const LocTile = ".loc-item-inner";
    const SetLoc = "#setLocSub";
    const container = ".loc_switchModal_outer";
    const EmptyLocs = ".no_loc_config";
    this.Listener = {
        ChangeLocation: function (LocObject) {

        }
    };

    this.Tid = options.Tid || null;
    this.Uid = options.Uid || null;
    this.PrevLocation = null;

    this.Locations = JSON.parse(options.Location) || [];
    this.EbHeader = new EbHeader();

    this.getCurrent = function () {
        if (store.get("Eb_Loc-" + this.Tid + this.Uid)) {
            return store.get("Eb_Loc-" + this.Tid + this.Uid);
        }
        else {
            return (["0", "-1", 0, -1].indexOf(options.Current) > 0) ? 1 : options.Current;
        }
    }

    this.trigger = function () {
        //$(document).bind('keypress', function (event) {
        //    if (event.which === 108)
        //        this.showSwitcher();
        //}.bind(this));
        this.CurrentLoc = this.getCurrent();
        this.PrevLocation = this.CurrentLoc;
        this.CurrentLocObj = this.Locations.filter(el => el.LocId === parseInt(this.CurrentLoc))[0];
        this.EbHeader.setLocation(this.CurrentLocObj.ShortName);
        this.drawLocs();
        this.setDefault();
        $(TriggerId).off("click").on("click", this.showSwitcher.bind(this));
        $(LocTile).off("click").on("click", this.selectLoc.bind(this));
        $(SetLoc).off("click").on("click", this.setLocation.bind(this));
        $("#loc-search").off("keyup").on("keyup", this.searchLoc.bind(this));
    };

    this.drawLocs = function () {
        if (this.Locations.length > 0) {
            for (let i = 0; i < this.Locations.length; i++) {
                this.appendLoc(this.Locations[i]);
            }
        }
        else {
            $(EmptyLocs).show();
        }
    };

    this.appendLoc = function (obj) {
        $(container + " .locs_bdy").append(`<div class="loc-item">
                                    <div class="loc-item-inner" LocId="${obj.LocId}" title="${obj.LongName}">
                                        <div class="loc-item-imgsec">
                                            <img src="../images/your-logo.png" />
                                        </div>
                                        <div class="loc-item-content">
                                            ${obj.LongName}
                                            <div class="subtitle">${obj.ShortName}</div>
                                        </div>
                                    </div>
                                </div>`);
    };

    this.setDefault = function () {
        $(".loc_switchModal_box").find(`div[LocId='${this.CurrentLoc}']`).addClass("active-loc");
        store.clearAll();
        store.set("Eb_Loc-" + this.Tid + this.Uid, this.CurrentLoc);
    };

    this.selectLoc = function (e) {
        let locContainer = $(e.target).closest(".loc-item-inner");
        try {
            {
                $(".active-loc").removeClass("active-loc");
                locContainer.addClass("active-loc");
            }
            this.CurrentLoc = locContainer.attr("LocId");
            this.CurrentLocObj = this.Locations.filter(el => el.LocId === parseInt(this.CurrentLoc))[0];
        }
        catch (err) {
            console.log(err);
        }
    };

    this.setLocation = function (e) {
        store.clearAll();
        store.set("Eb_Loc-" + this.Tid + this.Uid, this.CurrentLoc);
        this.showSwitcher();
        ebcontext.menu.reset();
        this.EbHeader.setLocation(this.CurrentLocObj.ShortName);
        if (this.PrevLocation !== this.CurrentLoc) {
            this.Listener.ChangeLocation(this.CurrentLocObj);
            this.PrevLocation = this.CurrentLoc;
        }
    };

    this.showSwitcher = function (e) {
        $(LocModId).toggle("fast", function () {
            if ($(this).is(":visible")) {
                $(".loc_switchModal_fade").show();
            }
            else
                $(".loc_switchModal_fade").hide();
        });
    };

    this.SwitchLocation = function (id) {
        try {
            let locContainer = $(container + " .locs_bdy").find(`div[Locid='${id}']`);
            this.CurrentLoc = locContainer.attr("LocId");
            this.PrevLocation = this.CurrentLoc;
            this.CurrentLocObj = this.Locations.filter(el => el.LocId === parseInt(this.CurrentLoc))[0];
            if ($.isEmptyObject(this.CurrentLocObj) || this.CurrentLocObj === undefined)
                throw "no such location";
            else {
                {
                    $(".active-loc").removeClass("active-loc");
                    locContainer.addClass("active-loc");
                }
                this.EbHeader.setLocation(this.CurrentLocObj.ShortName);
                store.clearAll();
                store.set("Eb_Loc-" + this.Tid + this.Uid, this.CurrentLoc);
                ebcontext.menu.reset();
                return true;
            }
        }
        catch (error) {
            console.log(error);
            return false;
        }
    };

    this.clearSwitchedLoc = function () {
        store.remove("Eb_Loc-" + this.Tid + this.Uid);
    }

    this.searchLoc = function (e) {
        let val = $(e.target).val().toLowerCase();
        $(container + " .locs_bdy").empty();
        for (let i = 0; i < this.Locations.length; i++) {
            if (this.Locations[i].LongName.toLowerCase().indexOf(val) >= 0)
                this.appendLoc(this.Locations[i]);
        }
        $(LocTile).off("click").on("click", this.selectLoc.bind(this));
        this.setDefault();
    };

    this.trigger();
};