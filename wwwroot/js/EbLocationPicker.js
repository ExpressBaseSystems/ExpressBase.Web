let LocationPicker = function (options) {
    this.data =  [];
    this.TreeApi = null;
    this.Tid = options.Tid || null;
    this.Uid = options.Uid || null;
    this.Locations = JSON.parse(options.Location) || [];
    const LocModId = "#loc_switchModal";
    const TriggerId = "#switch_loc";
    const SetLoc = "#setLocSub";
    const container = ".loc_switchModal_outer";
    const EmptyLocs = ".no_loc_config";
    this.EbHeader = new EbHeader();
    this.Listener = {
        ChangeLocation: function (LocObject) {

        }
    };

    this.Init = function () {
        this.CurrentLoc = this.getCurrent();
        this.PrevLocation = this.CurrentLoc;
        this.CurrentLocObj = this.Locations.filter(el => el.LocId === parseInt(this.CurrentLoc))[0];
        this.EbHeader.setLocation(this.CurrentLocObj.ShortName);
        this.ModifyLocationObject();
        this.drawLocsTree();
        this.setDefault();
        $(TriggerId).off("click").on("click", this.showSwitcher.bind(this));
        $(SetLoc).off("click").on("click", this.setLocation.bind(this));
        $("#loc-search").off("keyup").on("keyup", this.searchLoc.bind(this));        
    };

    this.getCurrent = function () {
        if (store.get("Eb_Loc-" + this.Tid + this.Uid)) {
            return store.get("Eb_Loc-" + this.Tid + this.Uid);
        }
        else {
            return ["0", "-1", 0, -1].indexOf(options.Current) > 0 ? 1 : options.Current;
        }
    };

    this.ModifyLocationObject = function () {
        for (let i = 0; i < this.Locations.length; i++) {
            this.data.push({ id: this.Locations[i].LocId, pid: this.Locations[i].ParentId, name: this.Locations[i].LongName});
        }
        this.Tempdata = JSON.parse(JSON.stringify(this.data));
    };

    this.drawLocsTree = function () {
        if (this.Tempdata.length > 0) {
            this.TreeApi = simTree({
                el: $(container + " .locs_bdy"),
                data: this.Tempdata,
                check: options.showCheckbox || false,
                linkParent: options.linkParent || false,
                onClick: this.ClickLocation.bind(this),
                //onChange: this.ChangeLocationSelector.bind(this)
            });
        }
        else {
            $(EmptyLocs).show();
        }
    };

    this.setDefault = function () {
        $(".loc_switchModal_box").find(`li[data-id='${this.CurrentLoc}'] a`).eq(0).trigger("click");
        store.set("Eb_Loc-" + this.Tid + this.Uid, this.CurrentLoc);
    };

    this.ClickLocation = function (items) {
        if (items.length > 0) {
            $(".loc_switchModal_box .locs_bdy li").removeClass("active-loc");
            $(".loc_switchModal_box .locs_bdy li[data-id=" + items[0].id + "]").addClass("active-loc").parents("ul").addClass("show");
            this.CurrentLoc = items[0].id;
            this.CurrentLocObj = this.Locations.filter(el => el.LocId === parseInt(this.CurrentLoc))[0];
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

    this.searchLoc = function (e) {
        let val = $(e.target).val().toLowerCase();
        $(container + " .locs_bdy").empty();
        this.Tempdata =JSON.parse(JSON.stringify( this.data.filter(qq => qq.name.toLowerCase().indexOf(val) >= 0)));
        this.drawLocsTree();
        this.setDefault();
    };

    this.SwitchLocation = function (id) {
        try {
            let locContainer = $(container + " .locs_bdy").find(`li[data-id='${id}']`);
            this.CurrentLoc = locContainer.attr("data-id");
            this.PrevLocation = this.CurrentLoc;
            this.CurrentLocObj = this.Locations.filter(el => el.LocId === parseInt(this.CurrentLoc))[0];
            if ($.isEmptyObject(this.CurrentLocObj) || this.CurrentLocObj === undefined)
                throw "no such location";
            else {
                {
                    $(".loc_switchModal_box").find(`li[data-id='${this.CurrentLoc}'] a`).eq(0).trigger("click");
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
    };

    this.Init();
};