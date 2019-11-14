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

function EbMobStudio(config) {
    this.Conf = config;
    this.EditObj = $.isEmptyObject(this.Conf.DsObj) ? null : this.Conf.DsObj;
    this.EbObject = null;
    this.Procs = {};
    this.droparea = `#eb_mobpage_pane${this.Conf.TabNum}`;
    this.Controls = {};
    this.Menu = {};

    this.GenerateButtons = function () { };

    this.pg = new Eb_PropertyGrid({
        id: "eb_mobpage_properties" + this.Conf.TabNum,
        wc: this.Conf.Wc,
        cid: this.Conf.TenantId,
        $extCont: $("#eb_mobpage_property_wrapr" + this.Conf.TabNum)
    });

    this.RefreshControl = function (obj) {
        var NewHtml = obj.$Control.outerHTML();
        var metas = AllMetas[$("#" + obj.EbSid).attr("eb-type")];
        $.each(metas, function (i, meta) {
            var name = meta.name;
            if (meta.IsUIproperty) {
                NewHtml = NewHtml.replace('@' + name + ' ', obj[name]);
            }
        });
        $("#" + obj.EbSid).replaceWith(NewHtml);
        $("#" + obj.EbSid).off("focus").on("focus", this.elementOnFocus.bind(this));
        $("#" + obj.EbSid).off("click").on("click", function (evt) { evt.stopPropagation(); });
    };

    this.elementOnFocus = function (event) {
        event.stopPropagation();
        var curControl = $(event.target);//.closest(".eb_stacklayout")
        var curObject = this.Procs[curControl.attr("id")];
        var type = curControl.attr('eb-type');
        this.pg.setObject(curObject, AllMetas[type]);
    };

    this.newMobPage = function () {
        let name = "tab_" + this.Conf.TabNum + "MobilePage" + Date.now();
        this.EbObject = new EbObjects["EbMobilePage"](name);
        this.pg.setObject(this.EbObject, AllMetas["EbMobilePage"]);
    };

    this.getType = function (assembly) {
        return assembly.split(",")[0].split(".")[2];
    }

    this.editMobPage = function () {
        this.EbObject = new EbObjects["EbMobilePage"](this.EditObj.Name);
        {
            var _o = $.extend(true, {}, this.EditObj);
            $.extend(this.EbObject, _o);
        }
        this.pg.setObject(this.EbObject, AllMetas["EbMobilePage"]);
        this.EbObject.Layout = null;
        this.setLayoutOnEdit();
    };

    this.setLayoutOnEdit = function () {
        let ebtype = this.getType(this.EditObj.Layout.$type);
        let id = "Tab" + this.Conf.TabNum + "_" + ebtype + CtrlCounters[ebtype.replace("Eb", "") + "Counter"]++;
        let o = new EbObjects[ebtype](id)
        $.extend(o, this.EditObj.Layout);
        this.Procs[id] = o;
        $(this.droparea).append(o.$Control.outerHTML());
        this.makeDropable(o.EbSid);
        this.setCtrls(o.EbSid);
    };

    this.setCtrls = function (_layoutid) {
        for (let i = 0; i < this.EditObj.Layout.ChiledControls.$values.length; i++) {
            let _obj = this.EditObj.Layout.ChiledControls.$values[i];
            let ebtype = this.getType(_obj.$type);
            let id = "Tab" + this.Conf.TabNum + "_" + ebtype + CtrlCounters[ebtype.replace("Eb", "") + "Counter"]++;
            let o = new EbObjects[ebtype](id)
            $.extend(o, _obj);
            this.Procs[id] = o;
            $(`#${_layoutid} .eb_mob_layout_inner`).append(o.$Control.outerHTML());
            this.RefreshControl(this.Procs[id]);
        }
    }

    this.makeDragable = function () {
        $(".draggable").draggable({
            cancel: "a.ui-icon",
            revert: "invalid",
            helper: "clone",
            cursor: "move",
            appendTo: "body",
            drag: function (event, ui) {
                $(ui.helper).css({ "background": "white", "border": "1px dotted black", "width": "auto", "padding": "15px", "border-radius": "4" });
            }
        });

        $(".layout").draggable({
            cancel: "a.ui-icon",
            revert: "invalid",
            helper: "clone",
            cursor: "move",
            appendTo: "body",
            drag: function (event, ui) {
                $(ui.helper).css({ "background": "white", "border": "1px dotted black", "width": "auto", "padding": "15px", "border-radius": "4" });
            }
        });
    };

    this.makeDropable = function (ebsid) {
        $(`#${ebsid} .eb_mob_layout_inner`).droppable({
            accept: ".draggable",
            hoverClass: "drop-hover-layout",
            drop: this.onDropFn.bind(this)
        });
    };

    this.LayoutOnClick = function (evt) {
        let div = $(evt.target).closest(".layout");
        let type = div.attr("eb-type");
        this.pg.setObject(this.Procs[div.attr("id")], AllMetas[type]);
    };

    this.makeSortable = function (ebsid) {
        $(`#${ebsid}`).sortable({
            //axis: "y",
            appendTo: document.body
        });
    };

    this.onDropFn = function (event, ui) {
        let dragged = $(ui.draggable);
        let ebtype = dragged.attr("eb-type");
        let o = this.makeElement(dragged);
        $(event.target).append(o.$Control.outerHTML());
        this.RefreshControl(o);
        this.makeSortable(o.EbSid);
        if (ebtype === "EbMobileTableLayout") {
            this.Controls.InitTableLayout(o);
        }
    };

    this.OnLayoutDrop = function (event, ui) {
        let dropLoc = $(event.target);
        if (dropLoc.find(".layout").length <= 0) {
            let draged = $(ui.draggable);
            let ebtype = draged.attr("eb-type");
            let o = this.makeElement(draged);
            dropLoc.append(o.$Control.outerHTML());
            if (ebtype === "EbMobileForm") {
                this.makeDropable(o.EbSid);
            }
            else if (ebtype === "EbMobileVisualization") {
                this.Controls.InitVis(o);
            }
            $(`#${o.EbSid}`).on("click", this.LayoutOnClick.bind(this));
        }
    };

    this.makeElement = function (el) {
        let ebtype = $(el).attr("eb-type");
        let ctrlname = $(el).attr("ctrname");
        let counter = CtrlCounters[ebtype.replace("Eb", "") + "Counter"]++;
        var id = "Tab" + this.Conf.TabNum + "_" + ctrlname + counter;
        this.Procs[id] = new EbObjects[ebtype](id);
        this.Procs[id].Label = ctrlname + (counter);
        return this.Procs[id];
    };

    //save
    this.BeforeSave = function () {
        let layout = $(this.droparea).find(".layout");
        if (layout.length <= 1 || layout.length >= 0) {
            let div = $(this.droparea).find(".layout")[0];
            this.EbObject.Layout = this.Procs[div.id];

            if (div.hasClass("eb_mob_formlayout")) {
                this.EbObject.Layout.ChiledControls.$values.length = 0;
                $(div).find(".control").each(this.findLayoutItems.bind(this));
            }
        }
        commonO.Current_obj = this.EbObject;
        return true;
    };

    //save
    this.findLayoutItems = function (i, o) {
        let jsobj = this.Procs[o.id];
        this.EbObject.Layout.ChiledControls.$values.push(jsobj);
    };

    this.getCol = function (ds_refid) {
        if (ds_refid !== "") {
            $.ajax({
                url: "../RB/GetColumns",
                type: "POST",
                cache: false,
                data: { refID: ds_refid },
                beforeSend: function () { $("#eb_common_loader").EbLoader("show") },
                success: function (result) {
                    $("#eb_common_loader").EbLoader("hide")
                    this.Controls.drawDsColTree(result.columns);
                    $(".branch").click();
                    if (!$(`#eb_mobtree_body_${this.Conf.TabNum}`).is(":visible"))
                        $(`#eb_mobtree_body_${this.Conf.TabNum}`).animate({ width: ["toggle", "swing"] });
                }.bind(this),
                error: function () { $("#eb_common_loader").EbLoader("hide")}
            });
        }
    };

    //pg onchange
    this.pg.PropertyChanged = function (obj, pname) {
        if (pname === "Label") {
            this.RefreshControl(obj);
        }
        else if (pname === "DataSourceRefId") {
            this.getCol(obj.DataSourceRefId);
        }
    }.bind(this);

    this.exe = function () {
        if (this.EditObj === null || this.EditObj === undefined)
            this.newMobPage();
        else
            this.editMobPage();

        this.makeDragable();

        $(this.droparea).droppable({
            accept: ".layout",
            hoverClass: "drop-hover",
            drop: this.OnLayoutDrop.bind(this)
        });

        this.Controls = new MobileControls(this);
        this.Menu = new MobileMenu(this);
    };

    this.exe();
};