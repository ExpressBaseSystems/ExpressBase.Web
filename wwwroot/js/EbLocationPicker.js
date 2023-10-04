let LocationPicker = function (options) {

    try {
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
        const Loc_close = "#eb-location-switch-close,#eb-location-switch-fade";
        this.EbHeader = new EbHeader();
        this.loc_parents = {};
        this.loc_parent_id = {};
        this.loc_count = this.Locations.length;
        this.Listener = {
            ChangeLocation: function (LocObject) {

            }
        };

        this.Init = function () {
            if (this.loc_count > 20) {
                $(".locs_bdy").css('min-height', '70vh');
            }
            if (this.loc_count == 1) {
                $(TriggerId).hide();
            }
            $("#loc_tot_count").text(this.loc_count + " locations");
            this.CurrentLoc = this.getCurrent();
            this.PrevLocation = this.CurrentLoc;
            this.CurrentLocObj = this.Locations.filter(el => el.LocId === parseInt(this.CurrentLoc))[0];
            if (typeof this.CurrentLocObj === 'undefined' || this.CurrentLocObj === null) {
                this.CurrentLocObj = this.Locations[0];
                this.CurrentLoc = this.CurrentLocObj.LocId;
                this.PrevLocation = this.CurrentLoc;
            }
            this.prev_loc_name = this.CurrentLocObj.LongName;
            this.prev_loc = this.CurrentLoc;
            this.EbHeader.setLocation(this.CurrentLocObj.ShortName);
            this.EbHeader.setLocation_type(this.CurrentLocObj.TypeName);

            this.ModifyLocationObject();
            this.findParent_loc();
            this.drawLocsTree();
            this.setDefault();
            $(TriggerId).off("click").on("click", this.showSwitcher.bind(this));
            $(SetLoc).off("click").on("click", this.setLocation.bind(this));
            $(Loc_close).off("click").on("click", this.close_LocSwitch.bind(this));
            $(".locs_bdy").off("dblclick").on("dblclick", "li a", this.confirmLocFn.bind(this));
            $("#loc-search").off("keyup").on("keyup", this.searchLoc.bind(this));

            //$(".locs_bdy").off("keyup").on("keyup", "li a", this.SelectLoc_enter.bind(this));
            // $("body").off("keyup").on("keyup", this.SelectLoc_esc.bind(this));
            $("body").off("keydown").on("keydown", this.Keypress_selectLoc.bind(this));
            let s = this.getParentPath(this.CurrentLoc);
            $('#current_loc').attr('loc_id', this.CurrentLoc).text(s);
            document.addEventListener('keydown', function (e) {
                if (e.ctrlKey && e.altKey && e.keyCode == 76) {
                    this.showSwitcher();
                }
            }.bind(this));
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
                let type = `<span class="loc_typ">${this.Locations[i].TypeName}</span>`;
                this.data.push({
                    id: this.Locations[i].LocId,
                    pid: this.Locations[i].ParentId,
                    name: (this.Locations[i].LongName === this.Locations[i].ShortName) ? (this.Locations[i].LongName + type) : (this.Locations[i].LongName + `  (${this.Locations[i].ShortName + type})`)
                });
            }
            this.Tempdata = JSON.parse(JSON.stringify(this.data));
            if (this.Tempdata.findIndex(e => e.pid < 0) == -1) {
                this.Tempdata.sort(function (a, b) {
                    var textA = a.name.toUpperCase().trim();
                    var textB = b.name.toUpperCase().trim();
                    return textA.localeCompare(textB);
                });
            }
            this.loc_data = this.Tempdata;
        };

        this.drawLocsTree = function () {
            if (this.Tempdata.length > 0) {
                $(EmptyLocs).hide();
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
                $("#loc_tot_count").text("0 of " + this.loc_count + " locations");
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
                if (this.PrevLocation != items[0].id) {
                    $(SetLoc).prop("disabled", false);
                }
                else {
                    $(SetLoc).prop("disabled", true);
                }
                this.CurrentLoc = items[0].id;
                this.CurrentLocObj = this.Locations.filter(el => el.LocId === parseInt(this.CurrentLoc))[0];
            }
            else {
                if ($(LocModId).is(":visible")) {
                    if ($('#loc-search').val() !== "") {
                        this.setParentPath($('#loc-search').val());
                    }
                }
            }
        };

        this.setLocation = function (e) {
            store.clearAll();
            store.set("Eb_Loc-" + this.Tid + this.Uid, this.CurrentLoc);
            ebcontext.menu.reset();
            this.EbHeader.setLocation(this.CurrentLocObj.ShortName);
            this.EbHeader.setLocation_type(this.CurrentLocObj.TypeName);
            if (this.PrevLocation !== this.CurrentLoc) {
                this.Listener.ChangeLocation(this.CurrentLocObj);
                this.PrevLocation = this.CurrentLoc;
                this.prev_loc_name = this.CurrentLocObj.LongName;
                this.prev_loc = this.CurrentLoc;
                if ($('#dashboard-refresh-btn').length !== 0)
                    $('#dashboard-refresh-btn').trigger("click");
            }
            let s = this.getParentPath(this.CurrentLoc);
            this.showSwitcher();
            $('#current_loc').text(s);
        };

        this.Keypress_selectLoc = function (e) {
            if ($(LocModId).is(":visible")) {
                var keycode = (e.keyCode ? e.keyCode : e.which);
                if (keycode >= '37' && keycode <= '40') {
                    e.preventDefault();
                    e.stopPropagation();
                }
                if (keycode == '13') {
                    if ($("#confirmLoc").is(":visible")) {
                        this.confirm_LocSwitch();
                        $('#confirmLoc').modal('hide');
                    }
                    else {
                        this.confirmLocFn();
                    }

                }
                else if (keycode == '27') {
                    if ($("#confirmLoc").is(":visible")) {
                        $('#confirmLoc').modal('hide');
                    }
                    else {
                        $(LocModId).hide();
                        $(".loc_switchModal_fade").hide();
                    }

                }
                else if (keycode == '8') {
                    var y = $(".locs_bdy [data-id='" + this.CurrentLoc + "'] ");
                    if (y.closest("ul.show").length) {
                        y = y.closest("ul.show");
                        let k = y.closest("li");
                        k.find("a:first").trigger('click');
                        k.find('.sim-tree-spread:first').trigger('click');
                    }
                }
                else if (keycode == '37') {
                    var y = $(".locs_bdy [data-id='" + this.CurrentLoc + "'] ");
                    if (y.find("ul.show").length) {
                        y = y.find("ul.show:first");
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
                        let z = y.prev();
                        if (z.children("ul.show").length) {
                            z = z.find('ul.show:first').find('li:last')
                        }
                        z = z.find('a:first');
                        z.trigger('click');
                        z.focus();
                    }
                    else {
                        if (y.closest('ul.show').length) {
                            if (y.closest('ul.show').closest("li").length) {
                                y = y.closest('ul.show').closest("li");
                                y = y.find("a:first")
                                y.trigger('click');
                                y.focus();
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
                            y = y.find("a:first")
                            y.trigger('click');
                            y.focus();
                        }
                    }
                }
                else if (keycode == '40') {
                    let y = $(".locs_bdy [data-id='" + this.CurrentLoc + "'] ");
                    if (y.children("ul:first").hasClass("show")) {
                        y = y.find("ul:first").find("li:first")
                    }
                    else
                        if (y.next('li').length) {
                            y = y.next('li');
                        }
                        else {
                            let c = 0;
                            while ((c == 0) && (y.closest('ul.show').parent("li").length == 1)) {
                                if (y.closest('ul.show').parent("li").next("li").length) {
                                    y = y.closest('ul.show').parent("li").next("li");
                                    c = 1;
                                }
                                else {
                                    y = y.closest('ul.show').parent("li");
                                }

                            }
                        }
                    y = y.find("a:first")
                    y.trigger('click');
                    y.focus();
                }
            }
        }

        this.showSwitcher = function (e) {

            let $overlay = $("#eb-location-switch-overlay");

            ebcontext.menu.close();
            ebcontext.finyears.close();

            if (!$overlay.is(":visible")) {
                $("#eb-location-switch-fade").show();
                $overlay.show('slide', { direction: 'left' }, function () {
                    this.locWindowOnOpen();
                }.bind(this));
            }
            else {
                $("#eb-location-switch-fade").hide();
                $overlay.hide();
            }
        };

        this.locWindowOnOpen = function () {

            $(".locs_bdy").empty();

            this.CurrentLoc = this.getCurrent();
            this.PrevLocation = this.CurrentLoc;
            this.CurrentLocObj = this.Locations.filter(el => el.LocId === parseInt(this.CurrentLoc))[0];
            if (!this.CurrentLocObj) {
                this.CurrentLocObj = this.Locations[0];
                this.CurrentLoc = this.CurrentLocObj.LocId;
                this.PrevLocation = this.CurrentLoc;
            }
            this.prev_loc_name = this.CurrentLocObj.LongName;
            this.prev_loc = this.CurrentLoc;
            this.Tempdata = this.loc_data;
            this.drawLocsTree();
            this.setDefault();

            this.setIcon(this.CurrentLoc);
            var scrollTo = $(".loc_switchModal_box").find(`li[data-id='${this.CurrentLoc}'] a:first`);
            scrollTo.trigger('click');
            //var container = $('.locs_bdy');
            //container.animate({
            //    scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop() - 100
            //}, 'medium');
            scrollTo.focus();
            $(SetLoc).prop("disabled", true);
        };

        this.close_LocSwitch = function () {
            this.showSwitcher();
        }

        this.close = function () {
            $("#eb-location-switch-fade").hide();
            $("#eb-location-switch-overlay").hide();
        }

        this.searchLoc = function (e) {
            let val = $(e.target).val().toLowerCase();
            $(container + " .locs_bdy").empty();
            this.Tempdata = JSON.parse(JSON.stringify(this.data.filter(qq => qq.name.toLowerCase().indexOf(val) >= 0)));
            this.Tempdata.sort(function (a, b) {
                var textA = a.name.toUpperCase().trim();
                var textB = b.name.toUpperCase().trim();
                return textA.localeCompare(textB);
            });
            if ($("#loc-search").val() == "") {
                $("#loc_tot_count").text(this.loc_count + " locations");
            }
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
                    this.EbHeader.setLocation_type(this.CurrentLocObj.TypeName);
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
                let x = [];
                let l = this.Locations[i].LocId;
                let p = this.Locations[i].ParentId;
                let n = this.Locations[i].LongName;
                t.push(n);
                x.push(l);
                while (p > 0) {
                    idx = this.Locations.findIndex(x => x.LocId === p);
                    if (idx > 0) {
                        l = this.Locations[idx].LocId;
                        p = this.Locations[idx].ParentId;
                        n = this.Locations[idx].LongName;
                        t.push(n);
                        x.push(l);
                    }
                    else {
                        break;
                    }

                }
                t.reverse();
                x.reverse();
                this.loc_parents[this.Locations[i].LocId] = t;
                this.loc_parent_id[this.Locations[i].LocId] = x;

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

        this.setIcon = function (k) {
            if (this.loc_parent_id.hasOwnProperty(k)) {
                for (let i = 0; i < this.loc_parent_id[k].length; i++) {
                    if (i < this.loc_parents[k].length - 1) {
                        var x = $(".locs_bdy [data-id='" + this.loc_parent_id[k][i] + "'] ");
                        var y = x.find(".sim-icon-r:first")
                        if (y.length) {
                            y.removeClass("sim-icon-r").addClass("sim-icon-d");
                        }
                    }

                }
            }
        };

        this.setParentPath = function (val) {
            let temoloc = this.Locations.filter(qq => qq.LongName.toLowerCase().indexOf(val) >= 0 || qq.ShortName.toLowerCase().indexOf(val) >= 0);
            if (temoloc.length <= 100) {
                for (i = 0; i < temoloc.length; i++) {
                    p = this.getParentPath(temoloc[i].LocId);
                    let k = $(".loc_switchModal_box .locs_bdy li[data-id=" + temoloc[i].LocId + "]").find('a')[0];
                    $(k).prepend(`<span><span class="parent_path">${p}</span></span>`);
                }
            }
            $("#loc_tot_count").text(temoloc.length + " of " + this.loc_count + " locations");
        };

        this.confirmLocFn = function () {
            if (this.prev_loc != this.CurrentLoc) {
                $("#confirmLoc").remove();
                let m = `<div class="modal fade" id="confirmLoc"  style="position: absolute;top: 58%;left: 50%;transform: translate(-50%, -50%);display: block;padding-right: 16px;" role="dialog">
                            <div class="modal-dialog">
                              <div class="modal-content">
                                <div class="modal-body" style="display: flex;justify-content: center;">
                                  <span id="confirmLocspan" style=" text-align:center; font-size:16px;">Change location from <strong> ${this.prev_loc_name} </strong> to <strong> ${this.CurrentLocObj.LongName}</strong>.</span>
                                </div>
                                <div class="modal-footer">
                                  <button type="button" id="loc_cancel" style="background:red;color:white;" class="btn btn-default pull-left" data-dismiss="modal">Cancel</button>
                                  <button type="button" id="loc_confirm" style="background:green;color:white;" class="btn btn-default pull-right" data-dismiss="modal">Confirm</button>
                                </div>
                              </div>
      
                            </div>
                          </div>`;
                $('body').append(m);

                $('#confirmLoc').modal('show');
                $("#loc_confirm").off("click").on("click", this.confirm_LocSwitch.bind(this));
            }
            else if (this.prev_loc == this.CurrentLoc) {
                this.confirm_LocSwitch();
            }

        }.bind(this);

        this.confirm_LocSwitch = function () {
            this.setLocation();
        }.bind(this);

        this.Init();
    }
    catch (er) {
        console.log(er);
        if (!ebcontext.user.RoleIds.length > 0) {
            var html = `<div class="eb_dlogBox_container eb_dlogBox_blurBG" id="eb_dlogBox_logout">
                                    <div class="cw">
                                        <div class="msgbdy">You don’t have any roles assigned to you</div>
                                        <div class="cnfrmBox-btnc">
                                            <button name="Logout" onclick="location.href = '/Tenantuser/Logout';" class="btn dlgBoxBtn-cust  pull-right" style="background:red;color:white;">Logout</button>
                                        </div>
                                    </div>
                                </div>`;
            $('body').append(html);
        }

        else if (window.location.pathname != ("/SupportTicket/bugsupport") && window.location.pathname != ("/SupportTicket/EditTicket")) {

            var message = {
                'Error_Message': er.stack,
                'URL': "",
                'Line': "",
                'Column': "",
                'Error_object': ""
            }
            $.ajax({
                url: "../Security/BrowserExceptions",
                data: { errorMsg: JSON.stringify(message) },
                cache: false,
                type: "POST"
            });

            if (confirm("An error occured while selecting location, do you want to report it?")) {
                window.location = '/SupportTicket/bugsupport';
            } else {
                window.location = "/Tenantuser/Logout"
            }
        }
    }
};

let LanguagePicker = function (options) {
    try {
        this.languages = Object.entries(options.LanguagesList);
        this.Tid = options.Tid || null;
        this.Uid = options.Uid || null;
        this.lang_storeKey = "Eb_language-" + this.Tid + this.Uid;
        this.locale_storeKey = "Eb_locale-" + this.Tid + this.Uid;

        if (this.languages.length > 0) {
            this.$switcherbtn = $("#language-switcher");
            this.init = function () {
                if (this.languages == null)
                    return;

                this.current_language = store.get(this.lang_storeKey);
                this.current_locale = store.get(this.locale_storeKey);
                this.appendDD();
                if (this.current_language > 0)
                    this.$switcherbtn.val(this.current_language);
                this.$switcherbtn.show();
            };

            this.appendDD = function () {
                for (let i = 0; i < this.languages.length; i++) {
                    let lcl = this.languages[i][0].match(/\((.*)\)/);
                    this.$switcherbtn.append(`<option value = "${this.languages[i][1]}" locale ="${lcl[1]}">${this.languages[i][0].replace(lcl[0], '').trim()}</option>`);
                }

                this.$switcherbtn.on("change", this.language_change.bind(this));
            };

            this.language_change = function (e) {
                this.current_language = this.$switcherbtn.val();
                this.current_locale = $("#language-switcher option:selected").attr("locale");
                store.set(this.lang_storeKey, this.current_language);
                store.set(this.locale_storeKey, this.current_locale);
                let _href = window.location.href;
                if (_href.includes("&_lo=")) {
                    const myArray = _href.split("&_lo=");
                    if (myArray.length > 1) {
                        window.location.href = _href.replace("&_lo=" + myArray[1], "&_lo=" + this.current_locale);
                    }
                }
            };
        }

        this.getCurrentLocale = function () {
            if (this.languages.length > 0)
                return store.get(this.locale_storeKey);
            else return 0;
        };

        this.getCurrentLanguage = function () {
            if (this.languages.length > 0)
                return store.get(this.lang_storeKey);
            else return 0;
        };

        if (this.languages.length > 0) {
            this.init();
        }
    }
    catch (e) {
        console.error(e);
    }
};

let FinYearPicker = function (options) {
    try {
        this.finyears = options.FinYears;
        this.Tid = options.Tid || null;
        this.Uid = options.Uid || null;
        this.$toggleBtn = $("#switch_finyear");
        this.storeKey = "Eb_Fy-" + this.Tid + this.Uid;//to store active period id
        this.SELECTORS_FY = [];
        this.SELECTORS_AP = [];
        this.DATE_CTRLS = [];//[{ctrl: null, formRenderer: null}]
        this.DtFormat = ebcontext.user.Preference.ShortDatePattern;

        this.init = function () {
            if (this.finyears == null || this.finyears.List == null)
                return;
            this.setupDom();
            this.$toggleBtn.show();
        };

        this.switchBtnClicked = function (e) {
            let opt = this.$body.find(`li.ebfy.active`).find(`select.selectpicker option:selected`);
            if (opt.length > 0) {
                let id = parseInt(opt.attr('data-id'));
                let locked = opt.attr('data-lkd') == 't';
                let plkd = opt.attr('data-plkd') == 't';
                if (!locked && !plkd) {
                    store.set(this.storeKey, id);
                    this.resetAllDateInputs();
                    this.close();
                }
                else if (!locked && plkd && (this.finyears.IsFyAdmin || this.finyears.IsFyUser)) {
                    store.set(this.storeKey, id);
                    this.resetAllDateInputs();
                    this.close();
                }
                else {
                    EbDialog("show", {
                        Message: "Can't switch to Locked active period",
                        Buttons: { "Ok": { Background: "green", Align: "right", FontColor: "white;" } }
                    });
                }
            }
        };


        this.toggleBtnClicked = function (e) {
            //this.setActiveInDom();
            //this.resetAllDateInputs();
            //this.$modal.show('fast');
            //this.$fade.show('fast');

            ebcontext.menu.close();
            ebcontext.locations.close();

            let $overlay = $("#eb-finyear-overlay");
            if (!$overlay.is(":visible")) {
                $("#eb-finyear-fade").show();
                this.drawFyList();
                $overlay.show('slide', { direction: 'left' }, function () {
                    //this.locWindowOnOpen();
                }.bind(this));
            }
            else {
                $("#eb-finyear-fade").hide();
                $overlay.hide();
            }
        };

        this.close = function () {
            $("#eb-finyear-fade").hide();
            $("#eb-finyear-overlay").hide();
        }.bind(this);

        this.setActiveInDom = function () {
            this.$body.find('li.ebfy').removeClass('active');
            let obj = this.getCurrent();
            if (obj) {
                let $li = this.$body.find(`li.ebfy[data-id=${obj.FyId}]`);
                $li.addClass('active');
                $li.find(`select.selectpicker`).selectpicker('val', obj.ActStart_disp);
                this.setBtnVisibility();
            }
            else if (this.finyears.IsFyAdmin) {
                this.$newFyBtn.show();
            }
        };

        this.getCurrent = function () {
            if (this.finyears.List.length <= 0)
                return null;
            let id = store.get(this.storeKey);
            let obj = null;
            if (id) {
                obj = this.getActivePeriodById(id);
            }
            if (!obj) {
                store.set(this.storeKey, this.finyears.Current);
                obj = this.getActivePeriodById(this.finyears.Current);
            }
            return obj;
        };

        this.getActivePeriodById = function (id) {
            let obj = null;
            for (let i = 0; i < this.finyears.List.length; i++) {
                let fy = this.finyears.List[i];
                obj = fy.List.find(e => e.Id == id);
                if (obj)
                    break;
            }
            return obj;
        };

        this.getActivePeriodByDate = function (date) {
            let _date = moment(date, 'YYYY-MM-DD');
            let obj = null;
            for (let i = 0; i < this.finyears.List.length; i++) {
                let fy = this.finyears.List[i];
                for (let j = 0; j < fy.List.length; j++) {
                    let startDt = moment(fy.List[j].ActStart_s, this.DtFormat);
                    let endDt = moment(fy.List[j].ActEnd_s, this.DtFormat);
                    if (startDt <= _date && endDt >= _date) {
                        obj = fy.List[j];
                        break;
                    }
                }
                if (obj)
                    break;
            }
            return obj;
        };

        this.resetAllDateInputs = function () {
            for (let i = 0; i < this.DATE_CTRLS.length; i++) {
                this.setFinacialYear(this.DATE_CTRLS[i]);
            }
        };

        //EXTERNAL fn - wenformrender
        this.canSwitchToEditMode = function (MultiRenderCxt) {
            let locId = ebcontext.locations.CurrentLocObj.LocId;
            for (let i = 0; i < this.DATE_CTRLS.length; i++) {
                let o = this.DATE_CTRLS[i];
                if (o.formRenderer.__MultiRenderCxt == MultiRenderCxt) {
                    let fp = this.getActivePeriodByDate(o.ctrl.getValue());
                    if (!fp || fp.LockedIds.includes(locId) || (fp.PartiallyLockedIds.includes(locId) && !(this.finyears.IsFyAdmin || this.finyears.IsFyUser))) {
                        let period = fp ? `between ${fp.ActStart_s} and ${fp.ActEnd_s}` : '';
                        EbMessage("show", { Message: `Edit is blocked - Financial Period ${period} is locked`, AutoHide: true, Background: '#aa0000', Delay: 4000 });
                        return false;
                    }
                }
            }
            return true;
        };

        //EXTERNAL fn - initformctrls
        this.setFinacialYear = function (opts) {

            if (opts.ctrl.RestrictionRule != 1 && opts.ctrl.RestrictionRule != 2)
                return;

            let fpObj = this.getCurrent();
            if (!fpObj) return;

            let objIdx = this.DATE_CTRLS.findIndex(o => o.ctrl.EbSid_CtxId == opts.ctrl.EbSid_CtxId);
            if (objIdx >= 0) {
                if (this.DATE_CTRLS[objIdx].formRenderer.__MultiRenderCxt != opts.formRenderer.__MultiRenderCxt) {
                    this.DATE_CTRLS.splice(objIdx, 1);
                    this.DATE_CTRLS.push(opts);
                }
            }
            else {
                this.DATE_CTRLS.push(opts);
            }

            //$('#' + opts.ctrl.EbSid_CtxId).datetimepicker({
            //    minDate: fpObj.ActStart_s,
            //    maxDate: fpObj.ActEnd_s
            //});

        }.bind(this);

        //EXTERNAL fn - frc
        this.getWarningMessage = function (dateIn_s) {
            let fp = this.getActivePeriodByDate(dateIn_s);
            let locId = ebcontext.locations.CurrentLocObj.LocId;
            if (!fp || fp.LockedIds.includes(locId) || (fp.PartiallyLockedIds.includes(locId) && !(this.finyears.IsFyAdmin || this.finyears.IsFyUser))) {
                let period = fp ? `between ${fp.ActStart_s} and ${fp.ActEnd_s}` : '';
                EbMessage("show", { Message: `Financial Period ${period} is locked`, AutoHide: true, Background: '#aa0000', Delay: 4000 });
                return 'Locked date';
            }
            return null;
        }.bind(this);

        //EXTERNAL fn - frc
        this.getWarningMessage = function (dateIn_s) {
            let obj = this.getCurrent();
            if (!obj || !dateIn_s)
                return null;
            let startDt, endDt, date;

            startDt = moment(obj.ActStart_s, this.DtFormat);
            endDt = moment(obj.ActEnd_s, this.DtFormat);

            date = moment(dateIn_s, 'YYYY-MM-DD');
            if (startDt <= date && endDt >= date) {
                return null;
            }
            else {
                let fp = this.getActivePeriodByDate(dateIn_s);
                let locId = ebcontext.locations.CurrentLocObj.LocId;
                if (!fp || fp.LockedIds.includes(locId) || (fp.PartiallyLockedIds.includes(locId) && !(this.finyears.IsFyAdmin || this.finyears.IsFyUser))) {
                    let period = fp ? `between ${fp.ActStart_s} and ${fp.ActEnd_s}` : '';
                    EbMessage("show", { Message: `Financial Period ${period} is locked`, AutoHide: true, Background: '#aa0000', Delay: 4000 });
                    return 'Locked date';
                }
                else {
                    EbDialog("show",
                        {
                            Message: `Entered date (${date.format(this.DtFormat)}) is not inside current active period! Click Ok to switch active period.`,
                            Buttons: {
                                "Ok": { Background: "blue", Align: "right", FontColor: "white;" },
                                "Cancel": { Background: "green", Align: "left", FontColor: "white;" }
                            },
                            CallBack: function (fp, name) {
                                if (name == "Ok") {
                                    store.set(this.storeKey, parseInt(fp.Id));
                                    EbMessage("show", { Message: `Current active period is switched to ${fp.ActStart_disp}. Please try again to save the form.`, AutoHide: true, Background: '#0000aa', Delay: 4000 });
                                }
                            }.bind(this, fp)
                        });
                    return 'Active period mismatch';
                }
            }

            return null;
        }.bind(this);

        this.setupDom = function () {
            let hhhtml = `
<div class="EbMsideBaroverlay_fade" id="eb-finyear-fade"></div>
<div class="EbQuickMoverlaySideWRpr" id="eb-finyear-overlay" style="min-width:500px;">
    <div class="EbQuickMoverlaySideWRpr-inner">
        <div class="header" id="eb-finyear-head" style="height:41px;">
            <h5 style="margin:0;margin-left:10px;">Financial Years</h5>
            <button class="btn c_btn" title="Close" id="eb-finyear-close" style="right:5px; position:absolute;">
                <i class="material-icons">close</i>
            </button>
        </div>
        <div class="InnerBlock finyearModal_outer">
            <div class="h-100 w-100" style="padding-top:10px;">
                <div id="eb-finyear-body" class="h-100" style="overflow-y:auto;padding-right:10px;">

                </div>
            </div>
        </div>
        <div class="FooterBlock" style="padding: 0 10px;">
            <div class="footer-buttons w-100">
                <button class="footer-btn" id="eb-finyear-new-fy" style="display:none;">Create FY</button>
                <button class="footer-btn" id="eb-finyear-edit-fy" style="display:none;">Edit FY</button>
                <button class="footer-btn" id="eb-finyear-lock-fy" style="display:none;">Lock FY</button>
                <button class="footer-btn" id="eb-finyear-lock-fp" style="display:none;">Lock Period</button>
                <button class="footer-btn" id="eb-finyear-plock-fp" style="display:none;">Partial Lock Period</button>
                <button class="footer-btn" id="eb-finyear-sw-btn">Switch</button>
            </div>
        </div>
    </div>
</div>`;

            $('#eb-finyear-switch').html(hhhtml);

            this.$overlay = $("#eb-finyear-overlay");
            this.$fade = $("#eb-finyear-fade");
            this.$closeBtn = $("#eb-finyear-close,#eb-finyear-fade");
            this.$head = $("#eb-finyear-head");
            this.$body = $("#eb-finyear-body");

            this.$newFyBtn = $("#eb-finyear-new-fy");
            this.$editFyBtn = $("#eb-finyear-edit-fy");
            this.$lockFyBtn = $("#eb-finyear-lock-fy");
            this.$lockFpBtn = $("#eb-finyear-lock-fp");
            this.$plockFpBtn = $("#eb-finyear-plock-fp");
            this.$switchBtn = $("#eb-finyear-sw-btn");

            this.$toggleBtn.off('click').on('click', this.toggleBtnClicked.bind(this));
            this.$closeBtn.off('click').on('click', this.toggleBtnClicked.bind(this));
            this.$body.off('click', 'li').on('click', 'li', this.liClicked.bind(this));
            this.$switchBtn.off('click').on('click', this.switchBtnClicked.bind(this));
            this.$newFyBtn.off('click').on('click', this.newFyBtnClicked.bind(this));
            this.$editFyBtn.off('click').on('click', this.editFyBtnClicked.bind(this));
            this.$lockFyBtn.off('click').on('click', this.lockFyBtnClicked.bind(this));
            this.$lockFpBtn.off('click').on('click', this.lockFpBtnClicked.bind(this));
            this.$plockFpBtn.off('click').on('click', this.plockFpBtnClicked.bind(this));
        };

        this.newFyBtnClicked = function () {
            this.appendCreateFyHtml();
            this.setNewFinancialYearStart();
            this.showNewFyMdl();
        };

        this.editFyBtnClicked = function () {
            this.appendCreateFyHtml();
            this.setEditFinancialYearStart();
            this.showNewFyMdl();
        };

        this.appendCreateFyHtml = function () {
            if ($("#create_fy_mdl_warp").length == 0) {
                $('body').prepend(`
<div id="create_fy_mdl_warp">
    <div class="create_fy_mdl_fade" id="create_fy_mdl_fade"></div>
    <div class="create_fy_modal" id="create_fy_modal">
        <div class="create_fy_mdl_outer">
            <div class="create_fy_mdl_box">
                <div class="create_fy_mdl_head">
                    <button type="button" id="create_fy_mdl_close" class="create_fy_mdl_close">&times;</button>                    
                    <h5 style="color:#333;">Create New Financial Year</h5>
                </div>
                <div class="create_fy_mdl_bdy">
                    <div class="row">
                        <div class="col-md-4">
                            <div style='text-align: center'><i>Financial Year</i></div>
                            <div class="form-group">
                                <label>Start Date</label>
                                <div class="input-group">
                                    <input id="create_fy_mdl_stDate" type="text" class="form-control" autocomplete="off">
                                    <span class="input-group-addon" onclick="$('#create_fy_mdl_stDate').focusin();"><i class="fa fa-calendar"></i></span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>End Date</label>
                                <div class="input-group">
                                    <input id="create_fy_mdl_enDate" type="text" class="form-control" autocomplete="off" disabled>
                                    <span class="input-group-addon" onclick="$('#create_fy_mdl_enDate').focusin();"><i class="fa fa-calendar"></i></span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-8">
                            <div style='text-align: center'><i>Active Periods</i></div>
                            <div>Periodicity:</div>
                            <div class="row" style="padding: 5px 0px;">
                                <div class="create_fy_mdl_rad-div">
                                    <div class="form-check">
                                        <input type="radio" class="form-check-input" id="create_fy_mdl_rad1" name="create_fy_mdl_optrad" value="Yearly" checked>
                                        <label class="form-check-label" for="create_fy_mdl_rad1">Yearly</label>
                                    </div>
                                </div>
                                <div class="create_fy_mdl_rad-div">
                                    <div class="form-check">
                                        <input type="radio" class="form-check-input" id="create_fy_mdl_rad2" name="create_fy_mdl_optrad" value="Half Yearly">
                                        <label class="form-check-label" for="create_fy_mdl_rad2">Half Yearly</label>
                                    </div>
                                </div>
                                <div class="create_fy_mdl_rad-div">
                                    <div class="form-check">
                                        <input type="radio" class="form-check-input" id="create_fy_mdl_rad3" name="create_fy_mdl_optrad" value="Quarterly">
                                        <label class="form-check-label" for="create_fy_mdl_rad3">Quarterly</label>
                                    </div>
                                </div>
                                <div class="create_fy_mdl_rad-div">
                                    <div class="form-check">
                                        <input type="radio" class="form-check-input" id="create_fy_mdl_rad4" name="create_fy_mdl_optrad" value="Monthly">
                                        <label class="form-check-label" for="create_fy_mdl_rad4">Monthly</label>
                                    </div>
                                </div>
                            </div>
                            <div id="create_fy_mdl_prds">
                                
                            </div>
                        </div>
                    </div>
                </div>
                <div class="create_fy_mdl_foot">
                    <button class="btn btn-sm create_fy_mdl_btn pull-right" id="create_fy_mdl_btn">Create</button>
                </div>
            </div>
        </div>
    </div>
</div>`);

                this.$new_fy_mdl = $("#create_fy_modal");
                this.$new_fy_fade = $("#create_fy_mdl_fade");
                this.$new_fy_head = $("#create_fy_modal .create_fy_mdl_head");
                this.$new_fy_close_btn = $("#create_fy_mdl_close");
                this.$new_fy_create_btn = $("#create_fy_mdl_btn");
                this.$new_fy_startDate = $("#create_fy_mdl_stDate");
                this.$new_fy_endDate = $("#create_fy_mdl_enDate");

                this.$new_fy_close_btn.off("click").on("click", this.hideNewFyMdl.bind(this));
                this.$new_fy_create_btn.off("click").on("click", this.createNewFy.bind(this));
                this.$new_fy_startDate.off("change").on("change", this.newFyStartDateChanged.bind(this));
                $('input[type=radio][name=create_fy_mdl_optrad]').off("change").on("change", this.frequencyBtnChanged.bind(this));
            }
        };

        this.frequencyBtnChanged = function (e) {
            let val = $('input[type=radio][name=create_fy_mdl_optrad]:checked').val();
            let freq = 12;
            if (val == "Half Yearly")
                freq = 6;
            else if (val == "Quarterly")
                freq = 3;
            else if (val == "Monthly")
                freq = 1;
            this.showNewActivePeriods(freq);
        };

        this.showNewActivePeriods = function (freq) {
            let fyEnd = moment(this.$new_fy_endDate.val(), this.DtFormat);
            let nwFpStart = moment(this.$new_fy_startDate.val(), this.DtFormat);
            let nwFpEnd = nwFpStart.clone().add(freq, 'months').add(-1, 'days');
            let _html = '';
            let cnt = 1;
            while (nwFpEnd <= fyEnd) {
                _html += `<div>${cnt++}. ${nwFpStart.format(this.DtFormat)} to ${nwFpEnd.format(this.DtFormat)} </div>`;
                nwFpStart = nwFpEnd.add(1, 'days');
                nwFpEnd = nwFpStart.clone().add(freq, 'months').add(-1, 'days');
            }

            $("#create_fy_mdl_prds").html(_html);
        };

        this.newFyStartDateChanged = function () {
            let stDate = moment(this.$new_fy_startDate.val(), this.DtFormat);
            stDate = stDate.add(1, 'years').add(-1, 'days');
            this.$new_fy_endDate.val(stDate.format(this.DtFormat));
            this.frequencyBtnChanged();
        };

        this.setEditFinancialYearStart = function () {
            let fyId = this.$body.find(`li.ebfy.active`).attr(`data-id`);
            this.$new_fy_head.data('data-id', fyId);
            this.$new_fy_head.find('h5').text('Edit Financial Year');
            this.$new_fy_create_btn.text('Update');
            let _date = null;
            for (let i = 0; i < this.finyears.List.length; i++) {
                if (this.finyears.List[i].Id == fyId) {
                    _date = this.finyears.List[i].FyStart_s;
                    break;
                }
            }
            if (_date != null) {
                this.$new_fy_startDate.val(_date);
                this.$new_fy_startDate.prop("disabled", true);
                this.newFyStartDateChanged();
                this.frequencyBtnChanged();
            }
        };

        this.setNewFinancialYearStart = function () {
            this.$new_fy_head.data('data-id', '0');
            this.$new_fy_head.find('h5').text('Create New Financial Year');
            this.$new_fy_create_btn.text('Create');
            let _date = moment().startOf('year');
            let f = false;
            for (let i = 0; i < this.finyears.List.length; i++) {
                let endDt = moment(this.finyears.List[i].FyEnd_s, this.DtFormat);
                if (endDt > _date) {
                    _date = endDt.add(1, 'days');
                    f = true;
                }
            }
            this.$new_fy_startDate.val(_date.format(this.DtFormat));
            this.newFyStartDateChanged();
            if (!f) {
                this.$new_fy_startDate.datetimepicker({
                    datepicker: true,
                    timepicker: false,
                    formatDate: this.DtFormat,
                    format: this.DtFormat
                });
                this.$new_fy_startDate.prop("disabled", false);
            }
            else {
                this.$new_fy_startDate.prop("disabled", true);
            }
            this.frequencyBtnChanged();
        };

        this.showNewFyMdl = function () {
            this.$new_fy_mdl.show("fast");
            this.$new_fy_fade.show("fast");
        };

        this.hideNewFyMdl = function () {
            this.$new_fy_mdl.hide("fast");
            this.$new_fy_fade.hide("fast");
        };

        this.createNewFy = function () {
            let _duration = $('input[type=radio][name=create_fy_mdl_optrad]:checked').val();
            let _start = moment(this.$new_fy_startDate.val(), this.DtFormat).format('YYYY-MM-DD');
            this.hideNewFyMdl();
            $("#eb_common_loader").EbLoader("show");
            $.ajax({
                type: "POST",
                url: "/TenantUser/CreateEditNewFy",
                data: {
                    id: this.$new_fy_head.data('data-id'),
                    duration: _duration,
                    start: _start
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    $("#eb_common_loader").EbLoader("hide");
                    EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000', Delay: 4000 });
                }.bind(this),
                success: function (resp) {
                    $("#eb_common_loader").EbLoader("hide");
                    let obj = JSON.parse(resp);
                    if (obj.Status == 200) {
                        this.finyears = obj.RespObject;
                        this.drawFyList();
                        EbMessage("show", { Message: obj.Message, AutoHide: true, Background: '#00aa00', Delay: 4000 });
                    }
                    else {
                        EbMessage("show", { Message: obj.Message, AutoHide: true, Background: '#aa0000', Delay: 4000 });
                    }
                }.bind(this)
            });
        };

        this.lockFyBtnClicked = function () {

        };

        this.lockFpBtnClicked = function () {
            let opt = this.$body.find(`li.ebfy.active`).find(`select.selectpicker option:selected`);
            EbDialog("show",
                {
                    Message: `Do you want to ${(opt.attr('data-lkd') == 't' ? 'Unlock' : 'Lock')} for All Locations or Current Location?`,
                    Buttons: {
                        "All Locations": { Background: "blue", Align: "left", FontColor: "white;" },
                        "Current Location": { Background: "green", Align: "right", FontColor: "white;" }
                    },
                    CallBack: function (name) {
                        if (name == "All Locations" || name == "Current Location") {
                            let opt = this.$body.find(`li.ebfy.active`).find(`select.selectpicker option:selected`);
                            let action = opt.attr('data-lkd') == 't' ? 'unlock' : 'lock';
                            this.LockUnlockFy(name, action, opt);
                        }
                    }.bind(this)
                });
        };

        this.plockFpBtnClicked = function () {
            let opt = this.$body.find(`li.ebfy.active`).find(`select.selectpicker option:selected`);
            if (opt.attr('data-lkd') == 't') {
                EbMessage("show", { Message: "Unlock the selected active period to continue", AutoHide: true, Background: '#aa0000', Delay: 4000 });
            }
            EbDialog("show",
                {
                    Message: `Do you want to ${(opt.attr('data-plkd') == 't' ? 'Partial Unlock' : 'Partial Lock')} for All Locations or Current Location?`,
                    Buttons: {
                        "All Locations": { Background: "blue", Align: "left", FontColor: "white;" },
                        "Current Location": { Background: "green", Align: "right", FontColor: "white;" }
                    },
                    CallBack: function (name) {
                        if (name == "All Locations" || name == "Current Location") {
                            let opt = this.$body.find(`li.ebfy.active`).find(`select.selectpicker option:selected`);
                            let action = opt.attr('data-plkd') == 't' ? 'partial_unlock' : 'partial_lock';
                            this.LockUnlockFy(name, action, opt);
                        }
                    }.bind(this)
                });
        };

        this.LockUnlockFy = function (name, action, opt) {
            $("#eb_common_loader").EbLoader("show");
            $.ajax({
                type: "POST",
                url: "/TenantUser/LockUnlockFy",
                data: {
                    req:
                        JSON.stringify({
                            FpIdList: [parseInt(opt.attr('data-id'))],
                            CurrentLoc: (name == "All Locations" ? -1 : ebcontext.locations.CurrentLocObj.LocId),
                            Action: action
                        })
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    $("#eb_common_loader").EbLoader("hide");
                    EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000', Delay: 4000 });
                }.bind(this),
                success: function (resp) {
                    $("#eb_common_loader").EbLoader("hide");
                    let obj = JSON.parse(resp);
                    if (obj.Status == 200) {
                        this.finyears = obj.RespObject;
                        this.drawFyList();
                        EbMessage("show", { Message: obj.Message, AutoHide: true, Background: '#00aa00', Delay: 4000 });
                    }
                    else {
                        EbMessage("show", { Message: obj.Message, AutoHide: true, Background: '#aa0000', Delay: 4000 });
                    }
                }.bind(this)
            });
        };

        this.setBtnVisibility = function () {
            this.$newFyBtn.hide();
            this.$editFyBtn.hide();
            this.$lockFyBtn.hide();
            this.$lockFpBtn.hide();
            this.$plockFpBtn.hide();

            if (this.finyears.IsFyAdmin) {
                this.$newFyBtn.show();
                this.$editFyBtn.show();
                let opt = this.$body.find(`li.ebfy.active`).find(`select.selectpicker option:selected`);
                if (opt.length == 1) {
                    let locked = opt.attr('data-lkd') == 't';
                    let plkd = opt.attr('data-plkd') == 't';
                    this.$lockFpBtn.show();
                    if (locked) {
                        this.$lockFpBtn.text('Unlock Period');
                    }
                    else {
                        this.$lockFpBtn.text('Lock Period');
                        this.$plockFpBtn.show();
                        if (plkd) {
                            this.$plockFpBtn.text('Partial Unlock Period');
                        }
                        else {
                            this.$plockFpBtn.text('Partial Lock Period');
                        }
                    }

                    let lkdOpt = this.$body.find(`li.ebfy.active`).find(`select.selectpicker option[data-lkd=f]`);
                    if (lkdOpt.length > 0) {
                        //this.$lockFyBtn.show();
                    }
                }
            }
        };

        this.drawFyList = function () {
            let curLocObj = ebcontext.locations.CurrentLocObj;

            this.$head.find('h5').text('Financial Years - ' + curLocObj.ShortName);

            let _html = `<div style='display: flex; justify-content: space-around;'>
                            <span><i>Financial Year</i></span>
                            <span><i>Active Period</i></span>
                         </div><ul class='ebfy'>`;

            for (let i = 0; i < this.finyears.List.length; i++) {
                let fy = this.finyears.List[i];
                _html += `<li class='ebfy' data-id='${fy.Id}'>                            
                            <span>${fy.FyStart_sl} to ${fy.FyEnd_sl}</span>
                            <span>
                                <select class='selectpicker'>`;

                for (let j = 0; j < fy.List.length; j++) {
                    let fp = fy.List[j];
                    let lkd = fp.LockedIds.includes(curLocObj.LocId) ? 't' : 'f';
                    let plkd = fp.PartiallyLockedIds.includes(curLocObj.LocId) ? 't' : 'f';
                    let lockicon = lkd == 't' ? "<i class='fa fa-lock'></i>" : (plkd == 't' ? "<i class='fa fa-unlock-alt'></i>" : "<i class='fa fa-tint'></i>");
                    _html += `<option data-id='${fp.Id}' data-lkd='${lkd}' data-plkd='${plkd}' data-content="${lockicon} ${fp.ActStart_disp}">${fp.ActStart_disp}</option>`;
                }
                _html += `</select>
                            </span>
                        </li>`;
            }
            _html += `</ul>`;
            this.$body.html(_html);
            this.$body.find('select.selectpicker').selectpicker();
            this.setActiveInDom();
        };

        this.liClicked = function (e) {
            if (!$(e.currentTarget).hasClass('active')) {
                this.$body.find('li').removeClass('active');
                $(e.currentTarget).addClass('active');
            }
            let $opt = this.$body.find(`li.ebfy.active`).find(`select.selectpicker option:selected`);
            if ($opt.length > 0) {
                let fpId = parseInt($opt.attr('data-id'));
                if (this.lastSelectedFpId != fpId) {
                    this.lastSelectedFpId = fpId;
                    this.setBtnVisibility();
                }
            }
        };

        this.init();
    }
    catch (e) {
        console.error(e);
    }
};


