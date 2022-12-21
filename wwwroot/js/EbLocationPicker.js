﻿let LocationPicker = function (options) {

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
                    this.$switcherbtn.append(`<option value = "${this.languages[i][1]}" locale ="${this.languages[i][0].match(/\((.*)\)/)[1]}">${this.languages[i][0]}</option>`);
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
        this.storeKey = "Eb_Fy-" + this.Tid + this.Uid;
        this.SELECTORS_FY = [];
        this.SELECTORS_AP = [];

        this.init = function () {
            if (this.finyears == null || this.finyears.List == null || this.finyears.List.length <= 0)
                return;
            this.appendModal();
            this.$toggleBtn.show();

            this.$toggleBtn.on('click', this.toggleBtnClicked.bind(this));
            this.$modalClose.on('click', this.closeBtnClicked.bind(this));
            this.$switchBtn.on('click', this.switchBtnClicked.bind(this));
            this.$modalTbl.on('click', 'tr[lock="false"][active="false"]', this.clickedOnTr.bind(this));
        };

        this.switchBtnClicked = function (e) {
            store.set(this.storeKey, this.$modalTbl.find(`tr[active='true']`).attr('data-id'));
            this.closeBtnClicked();
        };

        this.clickedOnTr = function (e) {
            this.$modalTbl.find('tr[active="true"]').attr('active', 'false');
            $(e.currentTarget).attr('active', 'true');
        };

        this.toggleBtnClicked = function (e) {
            this.setActiveInDom();
            this.resetAllDateInputs();
            this.$modal.show('fast');
            this.$fade.show('fast');
        };

        this.closeBtnClicked = function (e) {
            this.$modal.hide('fast');
            this.$fade.hide('fast');
            this.resetAllDateInputs();
        };

        this.setActiveInDom = function () {
            this.$modalTbl.find('tr[active="true"]').attr('active', 'false');
            let obj = this.getCurrent();
            if (obj) {
                this.$modalTbl.find(`tr[data-id=${obj.Id}]`).attr('active', 'true');
            }
        };

        this.getCurrent = function () {
            if (this.finyears.List.length <= 0)
                return null;
            let id = store.get(this.storeKey);
            let obj = null;
            if (id) {
                obj = this.finyears.List.find(e => e.Id == id);
            }
            if (!obj) {
                store.set(this.storeKey, this.finyears.Current);
                obj = this.finyears.List.find(e => e.Id == this.finyears.Current);
            }
            return obj;
        };

        this.resetAllDateInputs = function () {
            for (let i = 0; i < this.SELECTORS_AP.length; i++) {
                this.setFinacialYear(this.SELECTORS_AP[i], true);
            }
            for (let i = 0; i < this.SELECTORS_FY.length; i++) {
                this.setFinacialYear(this.SELECTORS_FY[i], false);
            }
        };

        //EXTERNAL fn - initformctrls
        this.setFinacialYear = function (selector, isActivePeriod = false) {
            let obj = this.getCurrent();
            if (!obj) return;
            if (isActivePeriod) {
                if (!this.SELECTORS_AP.includes(selector))
                    this.SELECTORS_AP.push(selector);

                $(selector).datetimepicker({
                    minDate: obj.ActStart_s,
                    maxDate: obj.ActEnd_s,
                });
            }
            else {
                if (!this.SELECTORS_FY.includes(selector))
                    this.SELECTORS_FY.push(selector);

                $(selector).datetimepicker({
                    minDate: obj.FyStart_s,
                    maxDate: obj.FyEnd_s,
                });
            }
        }.bind(this);

        //EXTERNAL fn - frc
        this.checkDate = function (dateIn_s, isActivePeriod = false) {
            let obj = this.getCurrent();
            if (!obj || !dateIn_s) return true;
            let startDt, endDt, date;
            if (isActivePeriod) {
                startDt = moment(obj.ActStart_s, ebcontext.user.Preference.ShortDatePattern);
                endDt = moment(obj.ActEnd_s, ebcontext.user.Preference.ShortDatePattern);
            }
            else {
                startDt = moment(obj.FyStart_s, ebcontext.user.Preference.ShortDatePattern);
                endDt = moment(obj.FyEnd_s, ebcontext.user.Preference.ShortDatePattern);
            }
            date = moment(dateIn_s, 'YYYY-MM-DD');
            if (startDt <= date && endDt >= date)
                return true;

            return false;
        }.bind(this);

        //EXTERNAL fn - frc
        this.getDateRangeToDisplay = function (isActivePeriod = false) {
            let obj = this.getCurrent();
            if (!obj) return true;
            if (isActivePeriod)
                return obj.ActStart_s + ' and ' + obj.ActEnd_s;
            else
                return obj.FyStart_s + ' and ' + obj.FyEnd_s;
        }.bind(this);

        this.appendModal = function () {
            $('body').prepend(`<div id="finyear_switch_warp">
                                    <div class="finyear_switchModal_fade" id="finyear_modal_fade"></div>
                                    <div class="finyear_switchModal" id="finyear_modal">
                                        <div class="finyear_switchModal_outer">
                                            <div class="finyear_switchModal_box">
                                                <div class="fin_head">
                                                    <button type="button" id="finyear_modal_close" class="finyear_switchModal_close">&times;</button>                    
                                                    <h5 style="color:#333;">Switch Financial Years</h5>
                                                </div>
                                                <div class="fin_bdy"></div>
                                                <div class="fin_foot">
                                                    <button class="btn btn-sm fin-switchbtn pull-right" id="setfinyear">Switch</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>`);
            this.$modal = $("#finyear_modal");
            this.$fade = $("#finyear_modal_fade");
            this.$modalClose = $("#finyear_modal_close");
            this.$modalbody = $("#finyear_modal .fin_bdy");
            this.$switchBtn = $("#setfinyear");

            let tableHtm = `<table class='table'>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Year Start</th>
                                        <th>Year End</th>
                                        <th>Active Period</th>
                                    </tr>
                                </thead>
                                <tbody>`;
            for (let i = 0; i < this.finyears.List.length; i++) {
                let fy = this.finyears.List[i];
                tableHtm += `<tr data-id='${fy.Id}' lock='${(fy.Locked && !this.finyears.SysUser) ? "true" : "false"}' active='false'>
                                <td style="text-align: left;"><i class="fa fa-globe" title='Global location'></i> ${fy.Locked ? '<i class="fa fa-lock" title="Locked"></i>' : ''}</td>
                                <td>${fy.FyStart_sl}</td>
                                <td>${fy.FyEnd_sl}</td>
                                <td>(${fy.ActStart_sl} &nbsp <i>to</i> &nbsp ${fy.ActEnd_sl})</td>
                            </tr>`;
            }
            tableHtm += `</tbody></table>`;
            this.$modalbody.html(tableHtm);
            this.$modalTbl = this.$modalbody.find('table');
        };

        this.init();
    }
    catch (e) {
        console.error(e);
    }
};


