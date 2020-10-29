
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
}

const Constants = {
    PAGE_CONTAINER: ".page-container",
    TOOL_ITEM: ".toolitems",
    FORM_CONTROL: ".mform-control",
    LIST_CONTROL: ".mlist-control",
    DASH_CONTROL: ".mdash-control",
    DS_COLUMN: ".ds-column"
};

$.fn.visibility = function (flag) {
    return flag ? this.show(200) : this.hide(200);
}

function getDSColums(datasourceRefID) {
    if (!datasourceRefID)
        return null;
    return $.ajax({
        url: "../RB/GetColumns",
        type: "POST",
        cache: false,
        data: { refID: datasourceRefID }
    });
}

function getLinkType(pageLinkRefID) {
    if (!pageLinkRefID)
        return null;
    return $.ajax({
        url: "../Dev/GetMobileFormControls",
        type: "GET",
        cache: false,
        data: { refid: pageLinkRefID }
    });
}

var EbCommonLoader = $("#eb_common_loader");

function EbMobStudio(config) {
    this.Conf = config;
    this.EditObj = $.isEmptyObject(this.Conf.DsObj) ? null : this.Conf.DsObj;
    this.EbObject = null;
    this.Procs = {};
    this.droparea = `#eb_mobpage_pane${this.Conf.TabNum}`;
    this.Controls = {};
    this.Menu = {};
    this.Mode = this.EditObj === null ? "new" : "edit";
    this.ContainerType = null;
    this.DSColumnsJSON = null;
    this.ContainerObject = null;
    this.GenerateButtons = function () { };

    this.pg = new Eb_PropertyGrid({
        id: `eb_mobpage_properties${this.Conf.TabNum}`,
        wc: this.Conf.Wc,
        cid: this.Conf.TenantId,
        $extCont: $("#eb_mobpage_property_wrapr" + this.Conf.TabNum)
    });

    this.refreshControl = function (obj) {
        var NewHtml = obj.$Control.outerHTML();
        var metas = AllMetas[$("#" + obj.EbSid).attr("eb-type")];
        $.each(metas, function (i, meta) {
            var name = meta.name;
            if (meta.IsUIproperty) {
                NewHtml = NewHtml.replace(`@${name}`, obj[name]);
            }
        });
        $("#" + obj.EbSid).replaceWith(NewHtml);
        $("#" + obj.EbSid).off("focus").on("focus", this.elementOnFocus.bind(this));
        $("#" + obj.EbSid).off("click").on("click", function (evt) { evt.stopPropagation(); });
    };

    this.elementOnFocus = function (event) {
        event.stopPropagation();
        var curControl = $(event.target);
        var curObject = this.Procs[curControl.attr("id")];
        var type = curControl.attr('eb-type');
        this.pg.setObject(curObject, AllMetas[type]);
        curObject.pgSetObject(this);
    };

    this.newMobPage = function () {
        let name = `tab_${this.Conf.TabNum}MobilePage${Date.now()}`;
        this.EbObject = new EbObjects["EbMobilePage"](name);
        this.pg.setObject(this.EbObject, AllMetas["EbMobilePage"]);
        window.expand(this.EbObject);
    };

    this.getType = function (assembly) {
        return assembly.split(",")[0].split(".")[2];
    };

    this.editMobPage = function () {
        this.EbObject = new EbObjects["EbMobilePage"](this.EditObj.Name);
        {
            var _o = $.extend(true, {}, this.EditObj);
            $.extend(this.EbObject, _o);
            window.expand(this.EbObject);
        }
        this.pg.setObject(this.EbObject, AllMetas["EbMobilePage"]);
        this.EbObject.Container = null;
        this.setContainerOnEdit();
    };

    this.setContainerOnEdit = function () {
        let ebtype = this.getType(this.EditObj.Container.$type);
        this.ContainerType = ebtype;
        let id = "Tab" + this.Conf.TabNum + "_" + ebtype + CtrlCounters[ebtype.replace("Eb", "") + "Counter"]++;
        let o = new EbObjects[ebtype](id);
        $.extend(o, this.EditObj.Container);
        this.Procs[id] = o;
        this.ContainerObject = o;
        window.expand(o);
        $(this.droparea).append(o.$Control.outerHTML());

        switch (ebtype) {
            case "EbMobileForm":
                this.Controls.initForm(o);
                break;
            case "EbMobileVisualization":
                this.Controls.initVisualization(o);
                break;
            case "EbMobileDashBoard":
                this.Controls.initDashBoard(o);
                break;
            default:
                console.error("undefined container");
        }
        $(`#${o.EbSid}`).on("click", this.ContainerOnClick.bind(this));
        FilterToolBox(ebtype, this.Conf.TabNum);
        this.EditObj = null;
    };

    this.setCtrls = function ($container, controllCollection) {
        for (let i = 0; i < controllCollection.length; i++) {
            let edit_obj = controllCollection[i];
            let ebtype = this.getType(edit_obj.$type);
            let o = this.makeElement(ebtype, ebtype);
            $.extend(o, edit_obj);
            $container.append(o.$Control.outerHTML());
            this.refreshControl(o);
            let tobj = o.trigger(this);
            if (ebtype === "EbMobileDataGrid") {
                tobj.fillControls(tobj.CellCollection.$values, this);
                this.setCtrls($(`#${o.EbSid} .ctrl_as_container .control_container`), o.ChildControls.$values);
            }
        }
    };

    this.makeDragable = function ($el) {
        $el.draggable({
            cancel: "a.ui-icon",
            revert: "invalid",
            helper: "clone",
            cursor: "move",
            zIndex: 1000,
            appendTo: "body",
            drag: function (event, ui) {
                $(ui.helper).addClass("draggable_style");
            }
        });
    };

    this.makeDropable = function (ebsid, ebtype) {
        $(`#${ebsid} .eb_mob_container_inner,#${ebsid} .ctrl_as_container .control_container`).droppable({
            accept: this.getDropAcceptClass(ebtype),
            hoverClass: "drop-hover-layout",
            tolerance: "fit",
            greedy: true,
            drop: this.onDropFn.bind(this)
        });
    };

    this.getDropAcceptClass = function (ebtype) {
        if (ebtype === "EbMobileForm")
            return Constants.FORM_CONTROL;
        else if (ebtype === "EbMobileDashBoard")
            return Constants.DASH_CONTROL;
        else
            return Constants.TOOL_ITEM;
    };

    this.ContainerOnClick = function (evt) {
        let div = $(evt.target).closest(".mob_container");
        let type = div.attr("eb-type");
        let o = this.Procs[div.attr("id")];
        this.pg.setObject(o, AllMetas[type]);
        o.pgSetObject(this);
        o.refresh(this);
    };

    this.makeSortable = function (ebsid) {
        $(`#${ebsid} .eb_mob_container_inner, #${ebsid} .ctrl_as_container .control_container`).sortable({
            axis: "y",
            appendTo: document.body
        });
    };

    this.onDropFn = function (event, ui) {
        let dragged = $(ui.draggable);
        let ebtype = dragged.attr("eb-type");
        let ctrlname = dragged.attr("ctrname");
        let o = this.makeElement(ebtype, ctrlname);
        $(event.target).append(o.$Control.outerHTML());
        this.refreshControl(o);
        o.trigger(this);
        if (this.ContainerType === "EbMobileForm") {
            this.Controls.refreshColumnTree();
        }
        return o;
    };

    this.containerOnDrop = function (event, ui) {
        let $dropLoc = $(event.target);
        let $draged = $(ui.draggable);

        if ($dropLoc.find(".mob_container").length <= 0) {
            let ebtype = $draged.attr("eb-type");
            let ctrlname = $draged.attr("ctrname");
            this.ContainerType = ebtype;
            let o = this.makeElement(ebtype, ctrlname);
            this.ContainerObject = o;
            $dropLoc.append(o.$Control.outerHTML());
            window.expand(o);
            switch (ebtype) {
                case "EbMobileForm":
                    this.Controls.initForm(o);
                    break;
                case "EbMobileVisualization":
                    this.Controls.initVisualization(o);
                    break;
                case "EbMobileDashBoard":
                    this.makeDropable(o.EbSid, ebtype);
                    break;
                default:
                    console.error("undefined container");
            }
            $(`#${o.EbSid}`).off("click").on("click", this.ContainerOnClick.bind(this));
            this.pg.setObject(o, AllMetas[ebtype]);
            FilterToolBox(ebtype, this.Conf.TabNum);
        }
    };

    this.makeElement = function (ebtype, ctrlname) {
        let counter = CtrlCounters[ebtype.replace("Eb", "") + "Counter"]++;
        var id = "Tab" + this.Conf.TabNum + "_" + ctrlname + counter;
        this.Procs[id] = new EbObjects[ebtype](id);
        this.Procs[id].Label = ctrlname + counter;
        window.expand(this.Procs[id]);
        return this.Procs[id];
    };

    //save
    this.BeforeSave = function () {
        let container = $(this.droparea).find(".mob_container");
        if (this.isReadyToSave(container)) {
            let div = container[0];
            this.EbObject.Container = this.Procs[div.id];

            if ($(div).hasClass("eb_mob_form_container")) {
                this.EbObject.Container.ChildControls.$values.length = 0;
                $(div).find(".eb_mob_container_inner").children(".mob_control").each(function (i, o) {
                    this.findFormContainerItems(i, o, this.EbObject.Container.ChildControls);
                }.bind(this));
            }
            else if ($(div).hasClass("eb_mob_vis_container")) {
                this.findVisContainerItems($(div).find(".eb_mob_tablelayout")[0]);
            }
            else if ($(div).hasClass("eb_mob_dashboard_container")) {
                this.EbObject.Container.ChildControls.$values.length = 0;
                $(div).find(".mob_dash_control").each(this.findDashContainerItems.bind(this));
            }
            commonO.Current_obj = this.EbObject;
            return true;
        }
        else
            return false;
    };

    commonO.saveOrCommitSuccess = function (response) {
        let current = getCurrent();
        let container = current.Container.$type.split(",")[0].split(".")[2];
        if (container === "EbMobileForm") {
            let mobileForm = current.Container;
            if ((mobileForm.AutoDeployMV && !mobileForm.AutoGenMVRefid) || !mobileForm.WebFormRefId) {
                commonO.UpdateBuilder();
            }
        }
    };

    this.isReadyToSave = function ($container) {
        if ($container.length <= 0) {
            EbPopBox("show", { Message: "A page must have a container :(" });
            return false;
        }
        if (!this.EbObject.DisplayName) {
            EbPopBox("show", { Message: "DisplayName not specified :(" });
            return false;
        }
        return true;
    };

    //form save
    this.findFormContainerItems = function (i, o, ebContainer) {
        let jsobj = this.Procs[o.id];
        let ebtype = this.getType(jsobj.$type);
        if (ebtype === "EbMobileDataGrid")
            jsobj.setObject(this);
        ebContainer.$values.push(jsobj);
    };

    //dash save
    this.findDashContainerItems = function (i, o) {
        let jsobj = this.Procs[o.id];
        this.EbObject.Container.ChildControls.$values.push(jsobj);
    };

    //vis save
    this.findVisContainerItems = function (table) {
        let o = this.Procs[table.id];
        o.setObject();
        this.EbObject.Container.DataLayout = o;

        this.EbObject.Container.FilterControls.$values.length = 0;
        $(`#${o.EbSid}`).closest(".mob_container").find(".vis-filter-container .mob_control").each(function (j, obj) {
            this.findFormContainerItems(j, obj, this.EbObject.Container.FilterControls);
        }.bind(this));

        this.EbObject.Container.SortColumns.$values.length = 0;
        $(`#${o.EbSid}`).closest(".mob_container").find(".vis-sort-container .data_column").each(function (j, obj) {
            let data_col = this.Procs[obj.id];
            this.EbObject.Container.SortColumns.$values.push(data_col);
        }.bind(this));

        this.EbObject.Container.SearchColumns.$values.length = 0;
        $(`#${o.EbSid}`).closest(".mob_container").find(".vis-search-container .data_column").each(function (j, obj) {
            let data_col = this.Procs[obj.id];
            this.EbObject.Container.SearchColumns.$values.push(data_col);
        }.bind(this));
    };

    this.showTreeContainer = function () {
        if (!this.$Selectors.treeContainer.is(":visible")) {
            var $branch = this.$Selectors.columnTree.find(`.branch`);
            if (!$branch.hasClass("in")) {
                $branch.click();
            }
            this.$Selectors.treeContainer.animate({ width: ["toggle", "swing"] });
        }
    }

    this.pg.PropertyChanged = function (obj, pname) {

        let constructor = obj.constructor.name;

        if (pname === "Label" && constructor !== "EbMobileDataGrid") {
            this.refreshControl(obj);
        }

        if ("propertyChanged" in obj) {
            obj.propertyChanged(pname, this);
        }

        if (this.ContainerType === "EbMobileForm") {
            if (pname === "Name" || pname === "TableName") {
                this.Controls.refreshColumnTree();
            }
        }
    }.bind(this);

    this.pg.CXVE.onAddToCE = function (currentProp, $values, obj) {
        if (this.ContainerType === "EbMobileVisualization") {
            if (currentProp === "Items") {
                var params = this.ContainerObject.StaticParameters.$values || [];
                for (let i = 0; i < params.length; i++) {
                    var p = params[i];
                    var o = this.makeElement("EbMobileStaticParameter", "ebmobilestaticparameter");
                    o.Name = p.Name;
                    o.Value = p.Value;
                    obj.Parameters.$values.push(o);
                }
            }
        }
    }.bind(this);

    this.labelOnDoubleClick = function (e) {
        let label = $(e.target).closest(".ctrl_label");
        label.prop("contenteditable", true);
        label.addClass("content-editable");
        this.placeCaretAtEnd(e.target);
        label.off("focusout").on("focusout", function (e) {
            let o = this.Procs[label.closest(".eb_stacklayout").attr("id")];
            o.Label = label.text().trim();
            label.removeClass("content-editable");
            this.pg.refresh();
        }.bind(this));
    };

    this.placeCaretAtEnd = function (label) {
        var setpos = document.createRange();
        var set = window.getSelection();
        setpos.setStart(label.childNodes[0], label.innerText.length + 1);
        setpos.collapse(true);
        set.removeAllRanges();
        set.addRange(setpos);
        label.focus();
    }

    this.refreshEmulator = function () {
        let h = this.$Selectors.toolBox.height();
        this.$Selectors.pageWrapper.find(`.eb_mobpage_pane_layout`).height(h - 10);
        this.$Selectors.pageWrapper.find(`.eb_mobtree_body`).height(h);
    };

    this.setEmulatorTitle = function (value) {
        this.$Selectors.emulatorTitle.text(value);
    };

    this.setRoot = function () {
        this.pg.setObject(this.EbObject, AllMetas["EbMobilePage"]);
    };

    this.makeLayoutDroppable = function () {
        $(this.droparea).droppable({
            accept: Constants.PAGE_CONTAINER,
            hoverClass: "drop-hover",
            drop: this.containerOnDrop.bind(this)
        });
    };

    this.initSelectors = function () {
        this.$Selectors = {};
        this.$Selectors.emulatorTitle = $(`#eb_emulater_title${this.Conf.TabNum}`);
        this.$Selectors.pageWrapper = $(`#eb_mobpage_wraper${this.Conf.TabNum}`);
        this.$Selectors.toolBox = $(`#eb_mobpage_toolbox${this.Conf.TabNum}`);
        this.$Selectors.columnTree = $(`#ds_parameter_list${this.Conf.TabNum}`);
        this.$Selectors.treeContainer = $(`#eb_mobtree_body_${this.Conf.TabNum}`);
        this.$Selectors.filterContainer = $(`#form_controls_list${this.Conf.TabNum}`);
    };

    this.exe = function () {
        this.initSelectors();
        this.Controls = new MobileControls(this);
        if (!this.EditObj)
            this.newMobPage();
        else
            this.editMobPage();

        this.makeDragable($(Constants.TOOL_ITEM));
        this.makeLayoutDroppable();
        this.Menu = new MobileMenu(this);
        $("body").on("dblclick", ".ctrl_label", this.labelOnDoubleClick.bind(this));
        $(".eb_mobpage_pane_layout").on("focus", this.setRoot.bind(this));
        this.refreshEmulator();
        this.setEmulatorTitle(this.EbObject.DisplayName || "Untitled");
        $(window).resize(function () { this.refreshEmulator(); }.bind(this));
        extendPropertyGrid(this.pg);
    };

    this.exe();
}

function getCurrent() {
    var id = $("#versionTab .tab-pane.active").attr("id");
    let creator = window.MobilePage["Tab" + id.charAt(id.length - 1)].Creator;
    console.log("mode : " + creator.Mode);
    return creator.EbObject;
};

function extendPropertyGrid(pg) {

    pg.HidePropertiesExt = function (propArray) {
        if (!propArray) return;
        for (let i = 0; i < propArray.length; i++) {
            this.HideProperty(propArray[i]);
        }
    };

    pg.ShowPropertiesExt = function (propArray) {
        if (!propArray) return;
        for (let i = 0; i < propArray.length; i++) {
            this.ShowProperty(propArray[i]);
        }
    };

    pg.HideGroupsExt = function (groupArray) {
        if (!groupArray) return;
        for (let i = 0; i < groupArray.length; i++) {
            this.HideGroup(groupArray[i]);
        }
    }

    pg.ShowGroupsExt = function (groupArray) {
        if (!groupArray) return;
        for (let i = 0; i < groupArray.length; i++) {
            this.ShowGroup(groupArray[i]);
        }
    }
}

function FilterToolBox(ctype, tab) {
    let $div = `#eb_mobpage_toolbox${tab}`;
    if (ctype) {
        $(`${$div} .eb_mobpage_tbxcategory`).hide();
        $(`${$div} [tool-types*="${ctype}"]`).show();
        $(`${$div} [tool-types="*"]`).show();
    }
    else {
        $(`${$div} .eb_mobpage_tbxcategory`).show();
    }
}

function alignHorrizontally($div, align) {
    if (align === 0) {
        $div.css("justify-content", "flex-start");
        $div.find("*").css("width", "auto");
    }
    else if (align === 1) {
        $div.css("justify-content", "center");
        $div.find("*").css("width", "auto");
    }
    else if (align === 2) {
        $div.css("justify-content", "flex-end");
        $div.find("*").css("width", "auto");
    }
    else {
        $div.css("justify-content", "flex-start");
        $div.find("*").css("width", "100%");
    }
}