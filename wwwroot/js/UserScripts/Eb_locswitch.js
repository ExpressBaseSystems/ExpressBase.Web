let LocSwitch = function (options) {
    const GetLocUrl = "gdgtd";
    const SetUrl = "/TenantUser/UpdateLocation";
    const LocModId = "#loc_switchModal";
    const TriggerId = "#switch_loc";
    const LocTile = ".locationwrapper";
    const SetLoc = "#setLocSub";
    const container = ".loc_switchModal_outer";
    const EmptyLocs = ".no_loc_config";
    this.Listener = {
        ChangeLocation: function (LocObject) {

        }
    };

    this.Tid = options.Tid || null;
    this.Uid = options.Uid || null;

    this.Locations = JSON.parse(options.Location) || [];
    this.CurrentLoc = (["0", "-1", 0, -1].indexOf(options.Current) > 0) ? 1 : options.Current;
    this.CurrentLocObj = this.Locations.filter(el => el.LocId === parseInt(this.CurrentLoc))[0];
    this.EbHeader = new EbHeader();

    this.trigger = function () {
        //$(document).bind('keypress', function (event) {
        //    if (event.which === 108)
        //        this.showSwitcher();
        //}.bind(this));
        this.EbHeader.setLocation(this.CurrentLocObj.ShortName);
        this.drawLocs();
        this.setDeafault();
        $(TriggerId).off("click").on("click", this.showSwitcher.bind(this));
        $(LocTile).off("click").on("click", this.selectLoc.bind(this));
        $(SetLoc).off("click").on("click", this.setLocation.bind(this));
    };

    this.drawLocs = function () {
        if (this.Locations.length > 0) {
            for (let i = 0; i < this.Locations.length; i++) {
                $(container + " .locs_bdy").append(`<div class="locationwrapper display-flex">
                                    <div class="col-md-2 flex-center">
                                        <div class="md-radio_wrapr" ischecked="false" LocId="${this.Locations[i].LocId}">
                                            <i class="material-icons checked">
                                                radio_button_checked
                                            </i>
                                            <i class="material-icons unchecked">
                                                radio_button_unchecked
                                            </i>
                                        </div>
                                    </div>
                                    <div class="col-md-4 flex-center">
                                        <img src="~/images/EB_Logo.png" class="w-100" />
                                    </div>
                                    <div class="col-md-6 loc_info display-flex">
                                        <h5 class="mr-0">${this.Locations[i].LongName}</h5>
                                        <p class="mr-0">${this.Locations[i].ShortName}</p>
                                    </div>
                                </div>`);
            }
        }
        else {
            $(EmptyLocs).show();
        }
    };

    this.setDeafault = function () {
        $(".locationwrapper").find(`div[LocId='${this.CurrentLoc}']`).find(".checked").show();
        $(".locationwrapper").find(`div[LocId='${this.CurrentLoc}']`).find(".unchecked").hide();
        //this.uncheckOthers($(".locationwrapper"));
        store.clearAll();
        store.set("Eb_Loc-" + this.Tid + this.Uid, this.CurrentLoc);
    };

    this.selectLoc = function (e) {
        let radioContainer = $(e.target).closest(".locationwrapper").find(".md-radio_wrapr");
        try {
            if (!eval(radioContainer.attr("ischecked"))) {
                radioContainer.find(".checked").show();
                radioContainer.find(".unchecked").hide();
                radioContainer.attr("ischecked", true);
                this.CurrentLoc = radioContainer.attr("LocId");
                this.CurrentLocObj = this.Locations.filter(el => el.LocId === parseInt(this.CurrentLoc))[0];
                this.EbHeader.setLocation(this.CurrentLocObj.ShortName);
                this.uncheckOthers($(e.target).closest(".locationwrapper"));
                this.Listener.ChangeLocation(this.CurrentLocObj);
            }
            else {
                this.uncheckOthers($(e.target).closest(".locationwrapper"));
            }
        }
        catch (err) {
            console.log(err);
            this.Listener.ChangeLocation(null);
        }
    };

    this.uncheckOthers = function ($t) {
        $t.siblings().each(function (k, o) {
            let wrap = $(o).find(".md-radio_wrapr");
            wrap.find(".checked").hide();
            wrap.find(".unchecked").show();
            wrap.attr("ischecked", false);
        });
    };

    this.setLocation = function (e) {
        store.clearAll();
        store.set("Eb_Loc-" + this.Tid + this.Uid, this.CurrentLoc);
        this.showSwitcher();
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
            let radioContainer = $(container + " .locs_bdy").find(`div[Locid='${id}']`);
            this.CurrentLoc = radioContainer.attr("LocId");
            this.CurrentLocObj = this.Locations.filter(el => el.LocId === parseInt(this.CurrentLoc))[0];
            if ($.isEmptyObject(this.CurrentLocObj) || this.CurrentLocObj === undefined)
                throw "no such location";
            else {
                radioContainer.find(".checked").show();
                radioContainer.find(".unchecked").hide();
                radioContainer.attr("ischecked", true);
                this.EbHeader.setLocation(this.CurrentLocObj.ShortName);
                this.uncheckOthers(radioContainer.closest(".locationwrapper"));
                return true;
            }        
        }
        catch (error) {
            console.log(error);
            return false;
        }
    };

    this.trigger();
};