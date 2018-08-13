let LocSwitch = function (options) {
    const GetLocUrl = "gdgtd";
    const SetUrl = "/TenantUser/UpdateLocation";
    const LocModId = "#loc_switchModal";
    const TriggerId = "#switch_loc";
    const LocTile = ".locationwrapper";
    const SetLoc = "#setLocSub";
    const container = ".loc_switchModal_outer";
    const EmptyLocs = ".no_loc_config";

    this.Tid = options.Tid || null;
    this.Uid = options.Uid || null;
    this.CurrentLoc = JSON.parse(options.Location) || [];


    this.trigger = function () {
        $(document).bind('keypress', function (event) {
            if (event.which === 108)
                this.showSwitcher();
        }.bind(this));
        this.drawLocs();
        this.setDeafault();
        $(TriggerId).off("click").on("click", this.showSwitcher.bind(this));
        $(LocTile).off("click").on("click", this.selectLoc.bind(this));
        $(SetLoc).off("click").on("click", this.setLocation.bind(this));
    };

    this.drawLocs = function () {
        if (this.CurrentLoc.length > 0) {
            for (let i = 0; i < this.CurrentLoc.length; i++) {
                $(container + " .locs_bdy").append(`<div class="locationwrapper display-flex">
                                    <div class="col-md-2 flex-center">
                                        <div class="md-radio_wrapr" ischecked="false" LocId="${this.CurrentLoc[i].LocId}">
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
                                        <h5 class="mr-0">${this.CurrentLoc[i].LongName}</h5>
                                        <p class="mr-0">${this.CurrentLoc[i].ShortName}</p>
                                    </div>
                                </div>`);
            }
        }
        else {
            $(EmptyLocs).show();
        }

    };

    this.setDeafault = function () {
        $(".locationwrapper").find("div[LocId='1']").find(".checked").show();
        $(".locationwrapper").find("div[LocId='1']").find(".unchecked").hide();
        //this.uncheckOthers($(".locationwrapper"));
        this.CurrentLoc = 1;
        store.clearAll();
        store.set("Eb_Loc-" + this.Tid + this.Uid, this.CurrentLoc);
    };

    this.selectLoc = function (e) {
        let radioContainer = $(e.target).closest(".locationwrapper").find(".md-radio_wrapr");
        if (!eval(radioContainer.attr("ischecked"))) {
            radioContainer.find(".checked").show();
            radioContainer.find(".unchecked").hide();
            radioContainer.attr("ischecked", true);
            this.CurrentLoc = radioContainer.attr("LocId");
            this.uncheckOthers($(e.target).closest(".locationwrapper"));
        }
        else {
            this.uncheckOthers($(e.target).closest(".locationwrapper"));
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

    this.trigger();
};