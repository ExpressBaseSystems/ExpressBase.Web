let LocationPicker = function (options) {
    this.data = [];
    this.TreeApi = null;
    this.Tid = options.Tid || null;
    this.Uid = options.Uid || null;
    this.Locations = JSON.parse(options.Location) || [];
    const LocModId = "#loc_switchModal";
    const TriggerId = "#switch_loc";
    const SetLoc = "#setLocSub";
    const container = ".loc_switchModal_outer";
    const EmptyLocs = ".no_loc_config";
    const Loc_close = "#loc_switchModal_close";
    this.EbHeader = new EbHeader();
    this.loc_parents = {};
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
        this.findParent_loc();
        this.drawLocsTree();
        this.setDefault();
        $(TriggerId).off("click").on("click", this.showSwitcher.bind(this));
        $(SetLoc).off("click").on("click", this.setLocation.bind(this));
        $(Loc_close).off("click").on("click", this.close_LocSwitch.bind(this));
        $(".locs_bdy").off("dblclick").on("dblclick", "li a", this.confirmLocFn.bind(this));
        $("#loc-search").off("keyup").on("keyup", this.searchLoc.bind(this));
        $("body").off("keyup").on("keyup", this.Keypress_selectLoc.bind(this));
        let s = this.getParentPath(this.CurrentLoc);
        $('#current_loc').attr('loc_id', this.CurrentLoc).text(s);
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
            this.data.push({ id: this.Locations[i].LocId, pid: this.Locations[i].ParentId, name: this.Locations[i].LongName + `  (${this.Locations[i].ShortName})` });
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
        else {
            if ($(LocModId).is(":visible")) {
                if ($('#loc-search').val() != "") {
                    this.setParentPath();
                }
            }
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
        let s = this.getParentPath(this.CurrentLoc);
        //$('#current_loc').text(this.CurrentLocObj.LongName + ` (${this.CurrentLocObj.ShortName})`);
        $('#current_loc').text(s);
    };

    this.Keypress_selectLoc = function (e) {
        var keycode = (e.keyCode ? e.keyCode : e.which);
        if (keycode == '13') {
            this.confirmLocFn();
        }
        else if (keycode == '27') {
            this.showSwitcher();
        }
        else if (keycode == '37') {
            var y = $(".locs_bdy [data-id='" + this.CurrentLoc + "'] ");
            if (y.find("ul.show").length) {
                y = y.find("ul.show");
                while (y.hasClass("show")) {
                    let k = y.closest("li");
                    k.find("a:first").trigger('click');
                    k.find('.sim-tree-spread:first').trigger('click');
                }
            }
        }
        else if (keycode == '38') {
            let y = $(".locs_bdy [data-id='" + this.CurrentLoc + "'] ");

            if (y.prev().length) {
                y = y.prev();
                if (y.children("ul.show").length) {
                    y = y.find('ul.show').find('li:last-child')
                }
                y.find('a:first').trigger('click');
            }
            else {
                if (y.closest('ul.show').length) {
                    if (y.closest('ul.show').closest("li").length) {
                        y = y.closest('ul.show').closest("li");
                        y.find('a:first').trigger('click');
                    }
                }

            }
        }
        else if (keycode == '39') {
            let y = $(".locs_bdy [data-id='" + this.CurrentLoc + "'] ");

            if (y.children("ul:first").length) {
                if (!y.children("ul:first").hasClass("show")) {
                    y.find('.sim-tree-spread:first').trigger('click');

                }
                else {
                    y = y.find("ul:first").find("li:first")
                    y.find("a:first").trigger('click');
                }
            }
        }
        else if (keycode == '40') {
            let y = $(".locs_bdy [data-id='" + this.CurrentLoc + "'] ");
            if (y.children("ul:first").hasClass("show")) {
                y = y.find("ul:first").find("li:first")
            }
            else if (y.next('li').length) {
                y = y.next('li');
            }
            else {
                y = y.closest('ul.show').parent("li").next("li");
            }

            y.find("a:first").trigger('click');

        }

    }


    this.showSwitcher = function (e) {
        $(LocModId).toggle("fast", function () {
            if ($(this).is(":visible")) {
                $(".loc_switchModal_fade").show();
            }
            else
                $(".loc_switchModal_fade").hide();
        });
    };

    this.close_LocSwitch = function () {
        this.showSwitcher();
    }

    this.searchLoc = function (e) {
        let val = $(e.target).val().toLowerCase();
        $(container + " .locs_bdy").empty();
        this.Tempdata = JSON.parse(JSON.stringify(this.data.filter(qq => qq.name.toLowerCase().indexOf(val) >= 0)));
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

    this.findParent_loc = function () {
        for (let i = 0; i < this.Locations.length; i++) {
            let t = [];
            let l = this.Locations[i].LocId;
            let p = this.Locations[i].ParentId;
            let n = this.Locations[i].LongName;
            t.push(n);
            while (p > 0) {
                idx = this.Locations.findIndex(x => x.LocId === p);
                l = this.Locations[idx].LocId;
                p = this.Locations[idx].ParentId;
                n = this.Locations[idx].LongName;
                t.push(n);
            }
            t.reverse();
            this.loc_parents[this.Locations[i].LocId] = t;

        }
    };

    this.getParentPath = function (k) {
        if (this.loc_parents.hasOwnProperty(k)) {
            let m = "";
            for (let i = 0; i < this.loc_parents[k].length; i++) {
                m += this.loc_parents[k][i];
                if (i < this.loc_parents[k].length - 1)
                //{ m += " " + '\u2192' + " "; }
                { m += " > "; }
                else if (i == this.loc_parents[k].length - 1) {
                    let idx = this.Locations.findIndex(x => x.LocId === k);
                    m += " (" + this.Locations[idx].ShortName + ")";
                }
            }
            return m;
        }
        return;
    }

    this.setParentPath = function () {
        for (i = 0; i < this.Locations.length; i++) {
            p = this.getParentPath(this.Locations[i].LocId);
            let k = $(".loc_switchModal_box .locs_bdy li[data-id=" + this.Locations[i].LocId + "]").find('a')[0];
            $(k).prepend(`<span>${p}</span>`);
        }

    }

    this.confirmLocFn = function () {
        let m = `<div class="modal fade" id="confirmLoc" role="dialog">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-body">
          <p style=" text-align: center; font-size:18px;font-weight:600;">Change current location.</p>
        </div>
        <div class="modal-footer">
          <button type="button" id="loc_cancel" style="background:red;color:white;" class="btn btn-default pull-left" data-dismiss="modal">Cancel</button>
          <button type="button" id="loc_confirm" style="background:green;color:white;" class="btn btn-default pull-right" data-dismiss="modal">Confirm</button>
        </div>
      </div>
      
    </div>
  </div>`
        $('body').append(m);
        $('#confirmLoc').modal('show');
        $("#loc_confirm").off("click").on("click", this.close_LocSwitch.bind(this));
    }.bind(this);
    this.close_LocSwitch = function () {
        this.setLocation();
    }
    this.Init();
};