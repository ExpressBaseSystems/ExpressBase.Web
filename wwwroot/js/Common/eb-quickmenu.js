﻿var EbMenu = function (option) {
    this.login = option.Console;
    this.Tid = option.Sid;
    this.Uid = option.Uid;
    this.resultObj = null;
    this.objTypes = null;
    this.isSolOwner = false;
    this.attempt = 0;

    this.start = function () {

        $(document).bind('keypress', function (event) {
            if (event.which === 10 && event.ctrlKey) {
                this.showMenuOverlay();
            }
        }.bind(this));

        $('#quik_menu').off("click").on("click", this.showMenuOverlay.bind(this));
        $("#ebm-close").off("click").on("click", this.closeMenuOverlay.bind(this));

        if (this.login === "dc") {
            $("#ebm-new").off("click").on("click", this.toggleNewW.bind(this));
        }

        if (this.login !== "tc") {
            $("#menu_refresh").off("click").on('click', this.refreshMenu.bind(this));
            $(".Eb_quick_menu #ebm-objsearch").off("keyup").on("keyup", this.searchFAllObjects.bind(this));

            if (this.login === "uc") {
                $("#ebm-objectcontainer").off("click", ".btn-setfav").on("click", ".btn-setfav", this.setAsFavourite.bind(this));
                $("#ebm-objectcontainer").off("click", ".favourited").on("click", ".favourited", this.removeFavorite.bind(this));
            }
            $("#ebm-objectcontainer").off("click", ".btn-new-tab").on("click", ".btn-new-tab", this.openInNewTab.bind(this));
        }
        //$(document).off("keyup").on("keyup", this.listKeyControl.bind(this));
        $("#ebm-overlayfade").off("click").on("click", function (e) { this.showMenuOverlay(); }.bind(this));
    };

    this.reset = function () {
        $("#ebm-overlayfade").hide();
        $("#ebquickmsideoverlay").hide();
        $("#ebquickmsideoverlay #appList").empty();
        $("#ebm-objtcontainer").hide();
        $("#ebm-objtcontainer .objtypes").empty();
        $("#ebm-objectcontainer").hide();
        $("#ebm-objectcontainer .ebm-objlist").empty();
        $("#ebm-security").hide();
    };

    this.toggleNewW = function (e) {
        $("#ebm-objtcontainer").hide();
        $("#ebm-objectcontainer").hide();
        if (!$("#ebm-newobject").is(":visible")) {
            $("#ebm-newobject").css("display", "flex");
        }
        else {
            $("#ebm-newobject").hide();
        }
    };

    this.showMenuOverlay = function (e) {

        let $overlay = $("#ebquickmsideoverlay");

        if (!$overlay.is(":visible")) {

            if (ebcontext.locations && ebcontext.locations.hasOwnProperty('close')) {
                ebcontext.locations.close();
            }
            if (ebcontext.finyears && ebcontext.finyears.hasOwnProperty('close')) {
                ebcontext.finyears.close();
            }

            $("#ebm-overlayfade").show();

            $overlay.show('slide', { direction: 'left' }, function () {
                if (this.attempt <= 0 && this.login === "dc") {
                    this.LoadApps();
                    this.attempt = 1;
                }
                else {
                    this.LoadApps();
                }
                this.setCaretOnSearch();
            }.bind(this));
        }
        else {
            $("#ebm-overlayfade").hide();
            $overlay.hide();
        }
    };

    this.setCaretOnSearch = function () {
        $("#ebm-objsearch").focus();
    };

    this.closeMenuOverlay = function () {
        $("#ebm-overlayfade").hide();
        $("#ebquickmsideoverlay").hide();
    };

    this.LoadApps = function () {

        let o = store.get("EbMenuObjects_" + this.Tid + this.Uid + this.login) || {};

        let locId = store.get("Eb_Loc-" + this.Tid + this.Uid) || null;

        if ($.isEmptyObject(o)) {
            $("#quick_menu_load").EbLoader("show");
            $.ajax({
                url: location.origin + "/TenantUser/getSidebarMenu",
                type: "GET",
                data: {
                    LocId: locId
                }
            }).done(function (result) {
                store.set("EbMenuObjects_" + this.Tid + this.Uid + this.login + "mhtml", result);
                $("#quick_menu_load").EbLoader("hide");
                $("#ebquickmsideoverlay #appList").html(result);
                $("#ebquickmsideoverlay #menu-app-count").text()
                $(`li[trigger='menu']`).off("click").on("click", this.appendObType.bind(this));
                if (this.login === "uc") {
                    $('li[trigger="security"]').off("click").on("click", this.showSecurity.bind(this));
                    $("li[trigger='favourites']").off("click").on("click", this.showfavourites.bind(this));
                    $("li[trigger='favourites'] .Obj_link ").click();

                    setTimeout(function () {
                        if ($(".Eb_quick_menu #ebm-objsearch").val().trim() !== "")
                            $(".Eb_quick_menu #ebm-objsearch").trigger("keyup");
                    }.bind(this), 800)
                }
            }.bind(this));
        }
        else {
            $("#quick_menu_load").EbLoader("hide");
            $("#ebquickmsideoverlay #appList").html(store.get("EbMenuObjects_" + this.Tid + this.Uid + this.login + "mhtml"));
            $(`li[trigger='menu']`).off("click").on("click", this.appendObType.bind(this));
            if (this.login === "uc") {
                $('li[trigger="security"]').off("click").on("click", this.showSecurity.bind(this));
                $("li[trigger='favourites']").off("click").on("click", this.showfavourites.bind(this));
                $("li[trigger='favourites'] .Obj_link").click();
            }
        }
    };

    this.appendObType = function (e) {
        {
            $("#ebm-newobject").hide();//close new object if it is open
            $("#ebm-objtcontainer").hide();
            $("#ebm-objectcontainer").hide();
            $("#ebm-security").hide();
        }
        this.active($(e.target));
        $("#ebm-objtcontainer .objtypes").empty();
        var appid = $(e.target).closest(`li[trigger='menu']`).attr("Appid");
        if (!$.isEmptyObject(this.resultObj.Data[appid])) {
            for (var otype in this.resultObj.Data[appid].Types) {
                if (eval(otype) !== -1) {
                    var _obj = this.resultObj.Data[appid].Types[otype].Objects;
                    $("#ebm-objtcontainer .objtypes").append(`<div class="ObjType-item" appid="${appid}" obType="${otype}" klink="true">
                                                        <span><i class="fa ${this.objTypes[otype].Icon} obtypeic"></i></span>
                                                        ${this.objTypes[otype].Name}s<span class="obj_count">(${_obj.length})</span>
                                                    </div>`);
                }
            }
            $("#ebm-objtcontainer").show('slide', { direction: 'left' });
        }
        $(".ObjType-item").off("click").on("click", this.appendObjectByType.bind(this));
    };

    this.appendObjectByType = function (e) {
        $("#ebm-newobject").hide();//close new object if it is open
        let el = $(e.target).closest(".ObjType-item");
        this.active(el);
        let appid = parseInt(el.attr("appid"));
        let objtype = parseInt(el.attr("obtype"));
        var _objArray = this.resultObj.Data[appid].Types[objtype].Objects;
        {
            $("#ebm-objectcontainer .ebm-objlist").empty();
            if (!$("#ebm-objectcontainer").is(":visible"))
                $("#ebm-objectcontainer").show('slide', { direction: 'left' });
        }
        for (let i = 0; i < _objArray.length; i++) {
            this.appendObjects(_objArray[i], false);
        }
    };

    this.appendObjects = function (_obj, isfav) {
        let set_fav = "";
        if (this.login === "uc" && !isfav) {
            let isfav = "";
            let tooltip = "";
            if (_obj.Favourite) {
                isfav = "favourited";
                tooltip = "Remove from Favourites.";
            }
            else {
                isfav = "btn-setfav";
                tooltip = "Add to Favourites.";
            }
            set_fav = `<button appid="${_obj.AppId}" otype="${_obj.EbObjectType}" title="${tooltip}" objid="${_obj.Id}" class="${isfav}"><i class="fa fa-heart"></i></button>`;
        }
        $("#ebm-objectcontainer .ebm-objlist").append(`<div class="obj-item" klink="true">
                                                        <a href='${this.decideUrl(_obj)}' objid='${_obj.Id}'>
                                                            ${_obj.DisplayName || 'Untitled'}
                                                        </a>
                                                        ${set_fav}
                                                        <button class="btn-new-tab" title="Open in new tab">
                                                            <i class="fa fa-external-link"></i>
                                                        </button>
                                                  </div>`);
    };

    this.decideUrl = function (_obj) {
        var _url = `/Eb_Object/Index?objid=${_obj.Id}&objtype=${_obj.EbObjectType}`;
        if (this.login === "uc") {
            if (_obj.EbType === "TableVisualization" || _obj.EbType === "ChartVisualization" || _obj.EbType === "MapView" || _obj.EbType === "OpenStreetMap") {
                _url = "/DV/dv?refid=" + _obj.Refid;
            }
            else if (_obj.EbType === "Report") {
                _url = "/ReportRender/Index?refid=" + _obj.Refid;
            }
            else if (_obj.EbType === "WebForm") {
                _url = "/WebForm/Index?_r=" + _obj.Refid;
            }
            else if (_obj.EbType === "DashBoard") {
                _url = "/DashBoard/DashBoardView?refid=" + _obj.Refid;
            }
            else if (_obj.EbType === "CalendarView") {
                _url = "/Calendar/CalendarView?refid=" + _obj.Refid;
            }
        }

        if (ebcontext.languages != undefined) {
            let _l = ebcontext.languages.getCurrentLanguageCode();
            if (_l)
                _url = _url + "&_lg=" + _l;
        }
        return _url;
    };

    this.refreshMenu = function () {
        store.remove("EbMenuObjects_" + this.Tid + this.Uid + this.login + "mhtml");
        store.remove("EbMenuObjects_" + this.Tid + this.Uid + this.login);
        $("#ebm-objectcontainer").hide();
        $("#ebm-objtcontainer").hide();
        $("#ebm-security").hide();
        $("#ebm-newobject").hide();
        this.LoadApps();
    };

    this.showSecurity = function (e) {
        this.active($(e.target));
        {
            $("#ebm-objtcontainer").hide();
            $("#ebm-newobject").hide();
            $("#ebm-objectcontainer").hide();
        }
        if (!$("#ebm-security").is(":visible")) {
            $("#ebm-security").show();
        }
        else {
            $("#ebm-security").hide();
        }
    };

    this.searchFAllObjects = function (e) {
        var _tempsearch = [];
        $(".active_link").removeClass("active_link");
        let min = (this.login === "uc") ? 1 : 3;
        {
            $("#ebm-objtcontainer").hide();
            $("#ebm-newobject").hide();
            $("#ebm-security").hide();
        }
        let f = false;
        if (!$("#ebm-objectcontainer").is(":visible"))
            $("#ebm-objectcontainer").show('slide', { direction: 'left' });
        $("#ebm-objectcontainer .ebm-objlist").empty();
        var srch = $(e.target).val().toLowerCase();
        if (srch !== "" && srch.length >= min) {
            $.each(this.resultObj.Data, function (i, Types) {
                $.each(Types.Types, function (i, _obj) {
                    _obj.Objects.forEach(function (obItem) {
                        if (obItem.DisplayName.toLowerCase().indexOf(srch) !== -1) {
                            if (_tempsearch.indexOf(obItem.Id) < 0) {
                                this.appendObjByCategory(obItem, false);
                                f = true;
                                _tempsearch.push(obItem.Id);
                            }
                        }
                    }.bind(this));
                }.bind(this));
            }.bind(this));

            if (!f)
                $("#ebm-objectcontainer .ebm-objlist").append("<div class='not_found text-center'>No match found.</div>");
        }
        else if (srch.length < min) {
            $("#ebm-objectcontainer .ebm-objlist").append(`<div class='not_found text-center'>Type ${min - srch.length} more letter(s). </div>`);
        }
        else {
            $("#ebm-objectcontainer").show();
        }
    };

    this.active = function ($el) {
        $el.closest(`[slider='true']`).find(".active_link").removeClass("active_link");
        $el.addClass("active_link");
    };

    this.setAsFavourite = function (e) {
        let objid = parseInt($(e.target).closest("button").attr("objid"));
        let appid = parseInt($(e.target).closest("button").attr("appid"));
        let otype = parseInt($(e.target).closest("button").attr("otype"));
        $.ajax({
            url: location.origin + "/TenantUser/AddFavourite",
            type: "POST",
            data: {
                objid: objid
            },
        }).done(function (result) {
            if (result) {
                var obj = this.resultObj.Data[appid].Types[otype].Objects.filter(ob => ob.Id === objid);
                this.resultObj.Favourites.push(obj[0]);
                $(e.target).closest("button").addClass("favourited");
                obj[0].Favourite = true;
            }
        }.bind(this));
    };

    this.removeFavorite = function (e) {
        let objid = parseInt($(e.target).closest("button").attr("objid"));
        let appid = parseInt($(e.target).closest("button").attr("appid"));
        let otype = parseInt($(e.target).closest("button").attr("otype"));
        $.ajax({
            url: location.origin + "/TenantUser/RemoveFavourite",
            type: "POST",
            data: {
                objid: objid
            },
        }).done(function (result) {
            if (result) {
                $.each(this.resultObj.Favourites, function (i, ob) {
                    if (ob.Id === objid) {
                        let obj = this.resultObj.Data[appid].Types[otype].Objects.filter(_ob => _ob.Id === objid);
                        this.resultObj.Favourites.splice(i, 1);
                        obj[0].Favourite = false;
                        if ($(e.target).closest(".obj-item").hasClass("fav")) {
                            let len = this.resultObj.Favourites.filter(item => item.EbObjectType === obj[0].EbObjectType).length;
                            $(e.target).closest(".obj-item-categorised").find(".category_objCount").text(`(${len})`)
                        }
                        $(e.target).closest(".obj-item").remove();
                        return false;
                    }
                }.bind(this));
            }
        }.bind(this));
    };

    this.openInNewTab = function (e) {
        let url = $(e.target).closest('.obj-item').find('a').attr('href');
        if (url)
            window.open(url, '_blank');
    };

    this.showfavourites = function (e) {
        this.active($(e.target));
        {
            $("#ebm-objtcontainer").hide();
            $("#ebm-newobject").hide();
            $("#ebm-security").hide();
        }
        $("#ebm-objectcontainer .ebm-objlist").empty();
        if (!$("#ebm-objectcontainer").is(":visible"))
            $("#ebm-objectcontainer").show('slide', { direction: 'left' });
        if (this.resultObj.Favourites.length > 0) {
            for (let i = 0; i < this.resultObj.Favourites.length; i++) {
                this.appendObjByCategory(this.resultObj.Favourites[i], true);
            }
        }
        else {
            $("#ebm-objectcontainer .ebm-objlist").append(`<div class='not_found text-center'>
                                                                Favorites empty.
                                                            </div>`);
        }
    };

    this.appendObjByCategory = function (_obj, isfav) {
        let set_fav = "";
        let fav = "";
        if (this.login === "uc" && !isfav) {
            let isfav = "";
            let tooltip = "";
            if (_obj.Favourite) {
                isfav = "favourited";
                tooltip = "Remove from Favourites.";
            }
            else {
                isfav = "btn-setfav";
                tooltip = "Add to Favourites.";
            }
            set_fav = `<button appid="${_obj.AppId}" otype="${_obj.EbObjectType}" title="${tooltip}" objid="${_obj.Id}" class="${isfav}"><i class="fa fa-heart"></i></button>`;
        }
        else if (this.login === "uc" && isfav) {
            fav = "fav";
            isfav = "favourited";
            tooltip = "Remove from Favourites.";
            set_fav = `<button appid="${_obj.AppId}" otype="${_obj.EbObjectType}" title="${tooltip}" objid="${_obj.Id}" class="${isfav}"><i class="fa fa-heart"></i></button>`;
        }

        if ($(`#ebm-objectcontainer #categoryType${_obj.EbObjectType}`).length <= 0) {
            $("#ebm-objectcontainer .ebm-objlist").append(`<div class="obj-item-categorised" id="ctypeContaner${_obj.EbObjectType}">
                                                            <div class="head"><i class="fa ${this.objTypes[_obj.EbObjectType].Icon}"></i> ${this.objTypes[_obj.EbObjectType].Name}s<span class="category_objCount"></span></div>
                                                            <div class="body" id="categoryType${_obj.EbObjectType}"></div>
                                                        </div>`);
        }

        $(`#ebm-objectcontainer #categoryType${_obj.EbObjectType}`).append(`<div class="obj-item ${fav}" klink="true">
                                                        <a href='${this.decideUrl(_obj)}' objid='${_obj.Id}'>
                                                            ${_obj.DisplayName || 'Untitled'}
                                                        </a>
                                                        ${set_fav}
                                                        <button class="btn-new-tab" title="Open in new tab">
                                                            <i class="fa fa-external-link"></i>
                                                        </button>
                                                  </div>`);

        let len = $(`#ebm-objectcontainer #ctypeContaner${_obj.EbObjectType}`).find(".obj-item").length;
        $(`#ebm-objectcontainer #ctypeContaner${_obj.EbObjectType} .category_objCount`).text("(" + len + ")");
    };

    this.listKeyControl = function (e) {
        e.preventDefault();
        e.stopPropagation();
        //$(".active_link").removeClass("active_link");
        if ($(".EbQuickMoverlaySideWRpr").is(":visible")) {
            if ($(".EbQuickMoverlaySideWRpr").find(":focus").length <= 0) {
                $(".AppContainer").find(`[klink='true']`).eq(0).attr("tabindex", "1").focus();
            }
            else {
                let $current = $(".EbQuickMoverlaySideWRpr").find(":focus");
                if (e.which === 40) {
                    if ($current.nextAll('[klink="true"]:visible').length > 0) {
                        $current.nextAll('[klink="true"]:visible').eq(0).attr("tabindex", "1").focus();
                    }
                    else {
                        let domArray = $current.closest(`[slider='true']`).find('[klink="true"]:visible').toArray();
                        let filter = $.map(domArray, function (val, i) { if ($(val).is($current)) return i; });
                        $(domArray[filter[0] + 1]).attr("tabindex", "1").focus();
                    }
                }
                else if (e.which === 38) {
                    if ($current.prev('[klink="true"]:visible').length > 0) {
                        $current.prevAll('[klink="true"]:visible').eq(0).attr("tabindex", "1").focus();
                    }
                    else {
                        let domArray = $current.closest(`[slider='true']`).find('[klink="true"]:visible').toArray();
                        let filter = $.map(domArray, function (val, i) { if ($(val).is($current)) return i; });
                        $(domArray[filter[0] - 1]).attr("tabindex", "1").focus();
                    }
                }
                else if (e.which === 13) {
                    if ($current.find("a").length > 0) {
                        $current.find("a")[0].click();
                    }
                    else {
                        $current[0].click();
                    }
                }
                else if (e.which === 39) {
                    $current.closest("[slider='true']").nextAll("[slider='true']:visible").eq(0).find('[klink="true"]').eq(0).attr("tabindex", "1").focus();
                }
                else if (e.which === 37) {
                    $current.closest("[slider='true']").prevAll("[slider='true']:visible").eq(0).find('[klink="true"]').eq(0).attr("tabindex", "1").focus();
                }
            }
        }
    };

    this.close = function () {
        if ($("#ebquickmsideoverlay").is(':visible')) {
            this.closeMenuOverlay();
        }
    }

    this.refresh = function () {
        store.remove("EbMenuObjects_" + this.Tid + this.Uid + this.login + "mhtml");
        store.remove("EbMenuObjects_" + this.Tid + this.Uid + this.login);
    };

    this.start();
}