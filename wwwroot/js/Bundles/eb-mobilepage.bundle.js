
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
    DS_COLUMN: ".ds-column",
    DATA_LABEL: ".data-label",
    DROPPED: ".dropped"
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
            let tobj = o.trigger(this, null, this.ContainerType);
            if (ebtype === "EbMobileDataGrid") {
                tobj.fillControls(tobj.CellCollection.$values, this);
                this.setCtrls($(`#${o.EbSid} .ctrl_as_container .control_container`), o.ChildControls.$values);
            }
            else if (ebtype === "EbMobileTableLayout") {
                o.fillControls(o.CellCollection.$values, this);
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
        o.trigger(this, 'drop', this.ContainerType);
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
                    this.Controls.initDashBoard(o);
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
                $(div).find(".eb_mob_container_inner").children(".mob_dash_control").each(this.findDashContainerItems.bind(this));
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
        if (ebtype === "EbMobileDataGrid" || ebtype === "EbMobileTableLayout")
            jsobj.setObject(this);
        ebContainer.$values.push(jsobj);
    };

    //dash save
    this.findDashContainerItems = function (i, o) {
        let jsobj = this.Procs[o.id];
        jsobj.setObject();
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
        $(`${$div} .toolitems`).not(".page-container").hide();
        $(`${$div} [tool-types*="${ctype}"]`).show();
        $(`${$div} .eb_mobpage_tbxcategory`).each(function (i, obj) {
            if ($(obj).find(".toolitems:visible").length <= 0) {
                $(obj).hide();
            }
            else {
                $(obj).show();
            }
        });
    }
    else {
        $(`${$div} .toolitems`).show();
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

function setPadding(obj, $el) {

}

function setShadow($el, color = "rgba(0,0,0,0.15)") {
    $el.css({
        "box-shadow": `0px 3px 12px 0px ${color}`,
        "border-color": "transparent"
    });
}

function setBorderColor($el, color = "#ccc") {
    $el.css({
        "box-shadow": "none",
        "border-color": color
    })
}
function MobileControls(root) {
    this.Root = root;
    this.FilterControls = [];

    this.initForm = function (o) {
        this.Root.$Selectors.pageWrapper.find(`.emulator_f`).text(o.SubmitButtonText || "Save").css("display", "flex");
        this.Root.makeDropable(o.EbSid, "EbMobileForm");
        this.Root.makeSortable(o.EbSid);
        this.setColumnTree(o);
        if (this.Root.Mode === "edit" && this.Root.EditObj !== null) {
            this.Root.setCtrls($(`#${o.EbSid} .eb_mob_container_inner`), this.Root.EditObj.Container.ChildControls.$values);
            this.refreshColumnTree();
        }
    };

    this.initVisualization = function (viz) {
        this.Root.$Selectors.pageWrapper.find(`.emulator_f`).css("display", "none");
        let tobj = this.Root.makeElement("EbMobileTableLayout", "TableLayout");
        $(`#${viz.EbSid} .eb_mob_container_inner .vis-table-container`).append(tobj.$Control.outerHTML());

        if (this.Root.Mode === "edit") {
            $.extend(tobj, this.Root.EditObj.Container.DataLayout);
        }
        tobj.trigger(this.Root);
        this.makeFilterColsDropable(viz);

        if (this.Root.Mode === "edit" && this.Root.EditObj !== null) {
            tobj.fillControls(this.Root.EditObj.Container.DataLayout.CellCollection.$values, this.Root);

            let filterControls = this.Root.EditObj.Container.FilterControls.$values;
            this.Root.setCtrls($(`#${viz.EbSid} .eb_mob_container_inner .vis-filter-container`), filterControls);
            this.setSortColumns(viz);
            this.setSearchColumns(viz);
            this.LoadVSDataOnEdit(viz);
        }
        viz.propertyChanged("Type", this.Root);
    };

    this.LoadVSDataOnEdit = function (viz) {
        if (!viz.DataSourceRefId && !viz.LinkRefId && !viz.FabLinkRefId)
            return;
        EbCommonLoader.EbLoader("show");
        $.when(getDSColums(viz.DataSourceRefId), getLinkType(viz.LinkRefId), getLinkType(viz.FabLinkRefId))
            .done(function (dsColumns, formControls, fabControls) {
                if (dsColumns) {
                    viz.loadDsColumns(dsColumns[0], this.Root);
                }
                if (formControls) {
                    viz.loadLinkFormControls(formControls[0], this.Root);
                }
                if (fabControls) {
                    viz.setFabC2ControlMap(fabControls[0], this.Root);
                }
                EbCommonLoader.EbLoader("hide");
            }.bind(this));
    };

    this.initDashBoard = function (dashboard) {
        this.Root.$Selectors.pageWrapper.find(`.emulator_f`).css("display", "none");
        this.Root.makeDropable(dashboard.EbSid, "EbMobileDashBoard");
        dashboard.sortable();
        if (this.Root.Mode === "edit" && this.Root.EditObj !== null) {
            this.Root.setCtrls($(`#${dashboard.EbSid} .eb_mob_container_inner`), dashboard.ChildControls.$values);

            if (dashboard.DataSourceRefId) {
                dashboard.propertyChanged("DataSourceRefId", this.Root);
            }
        }
    };

    this.makeFilterColsDropable = function (container) {
        $(`#${container.EbSid} .vis-filter-container`).droppable({
            accept: this.Root.getDropAcceptClass("EbMobileForm"),
            hoverClass: "drop-hover-td",
            tolerance: "fit",
            greedy: true,
            drop: function (event, ui) {
                let o = this.Root.onDropFn(event, ui);
                if ($(ui.draggable).hasClass("filter_controls")) {
                    let name = $(ui.draggable).attr("name");
                    let ctrl = this.FilterControls.find(el => el.Name === name) || {};
                    ctrl.EbSid = undefined;
                    $.extend(true, o, ctrl);
                    this.Root.refreshControl(o);
                }
            }.bind(this)
        });
        $(`#${container.EbSid} .vis-sort-container, #${container.EbSid} .vis-search-container`).droppable({
            accept: Constants.DS_COLUMN,
            hoverClass: "drop-hover-td",
            drop: this.sortAndSearchDrop.bind(this)
        });
    };

    this.sortAndSearchDrop = function (event, ui) {
        let dragged = $(ui.draggable);
        let ctrlname = dragged.attr("ctrname");
        let obj = this.Root.makeElement("EbMobileDataColumn", ctrlname);
        obj.Type = dragged.attr("DbType");
        obj.ColumnName = dragged.attr("ColName");
        obj.ColumnIndex = dragged.attr("index");
        $(event.target).append(obj.$Control.outerHTML());
        this.Root.refreshControl(obj);
        $("#" + obj.EbSid).off("focus");
    }

    this.setSortColumns = function (vis) {
        let filters = vis.SortColumns.$values;
        for (let i = 0; i < filters.length; i++) {
            let obj = this.Root.makeElement("EbMobileDataColumn", "DataColumn");
            $.extend(obj, filters[i]);
            $(`#${vis.EbSid} .vis-sort-container`).append(obj.$Control.outerHTML());
            this.Root.refreshControl(obj);
            $("#" + obj.EbSid).off("focus");
        }
    };

    this.setSearchColumns = function (vis) {
        let searches = vis.SearchColumns.$values;
        for (let i = 0; i < searches.length; i++) {
            let obj = this.Root.makeElement("EbMobileDataColumn", "DataColumn");
            $.extend(obj, searches[i]);
            $(`#${vis.EbSid} .vis-search-container`).append(obj.$Control.outerHTML());
            this.Root.refreshControl(obj);
            $("#" + obj.EbSid).off("focus");
        }
    };

    this.drawFormControls = function () {
        controls = this.FilterControls;
        if (!controls) return;
        this.Root.$Selectors.treeContainer.find("#form_controls_tab").show();
        for (let i = 0; i < controls.length; i++) {
            let ebtype = this.Root.getType(controls[i].$type);
            this.Root.$Selectors.filterContainer.append(`
            <div class="${Constants.FORM_CONTROL.replace(".", "")} filter_controls"
                 eb-type="${ebtype}" 
                 ctrname="${ebtype.replace("EbMobile", "")}" 
                 name="${controls[i].Name}">
                    <i class="fa ${controls[i].Icon}" style="margin-right:10px;"></i>
                ${controls[i].Name}
            </div>`);
        }
        this.Root.makeDragable($(`${Constants.FORM_CONTROL}`));
    };

    this.drawDsColTree = function (colList, ebtype) {
        var $columnContainer = this.Root.$Selectors.columnTree.empty();
        var type = ebtype || "EbMobileDataColumn";
        $.each(colList, function (i, columnCollection) {
            $columnContainer.append("<li><a>Table " + i + "</a><ul id='t" + i + "'></ul></li>");
            $.each(columnCollection, function (j, obj) {
                let icon = this.getIconByType(obj.type);
                let $div = $columnContainer.find(`ul[id='t${i}']`);
                $div.append(`<li class='styl'>
                                <span eb-type='${type}'
                                    ctrname="DataColumn"
                                    TableIndex="${i}"
                                    index='${obj.columnIndex}'
                                    DbType='${obj.type}'
                                    ColName='${obj.columnName}'
                                    class='${Constants.DS_COLUMN.replace(".", "")}'>
                                    <i class='fa ${icon} column_tree_typeicon'></i> 
                                    ${obj.columnName}
                                </span>
                            </li>`);
            }.bind(this));
        }.bind(this));
        $columnContainer.killTree().treed().find('.branch').click();
        this.makeTreeNodeDraggable();
    };

    this.makeTreeNodeDraggable = function () {
        var $ds = $(Constants.DS_COLUMN);
        this.Root.makeDragable($ds);
    };

    this.setColumnTree = function () {
        this.Root.$Selectors.treeContainer.animate({ width: ["toggle", "swing"] });
    };

    var tableCounter = 0;

    this.refreshColumnTree = function () {
        tableCounter = 0;
        let html = {};
        let container = $(this.Root.droparea).find(".mob_container");
        if (container.length === 1) {
            let divObj = this.Root.Procs[container[0].id];
            html[divObj.Name] = [];
            html[divObj.Name].push(`<li><a>${divObj.TableName || "Table " + tableCounter++}</a><ul>`);

            container.find(".eb_mob_container_inner").children(".mob_control").each(this.loopControlContainer.bind(this, html, divObj.Name));
            html[divObj.Name].push(`</ul></li>`);
        }
        let htmlString = "";
        for (var key in html) {
            if (html.hasOwnProperty(key)) {
                htmlString += html[key].join("");
            }
        }
        this.Root.$Selectors.columnTree.empty().append(htmlString);
        this.Root.$Selectors.columnTree.killTree().treed().find(".branch").click();
        this.makeTreeNodeDraggable();
    };

    var nonPersistControls = ["EbMobileTableLayout", "EbMobileDataGrid", "EbMobileFileUpload", "EbMobileButton"];

    this.loopControlContainer = function (html, propName, i, o) {
        let jsobj = this.Root.Procs[o.id];
        let ebtype = this.Root.getType(jsobj.$type);
        if (nonPersistControls.includes(ebtype)) {
            if (ebtype === "EbMobileDataGrid") {
                html[jsobj.Name] = [];
                html[jsobj.Name].push(`<li><a>${jsobj.TableName || "Table " + tableCounter++}</a><ul>`);
                var $cont = $(`#${jsobj.EbSid} .ctrl_as_container .control_container`);
                $cont.find(".mob_control").each(this.loopControlContainer.bind(this, html, jsobj.Name));
                html[jsobj.Name].push(`</ul></li>`);
            }
        }
        else {
            var $item = `<li class='styl'>
                            <span eb-type='EbMobileDataColumn'
                                    ctrname="DataColumn"
                                    DbType='${jsobj.EbDbType}' 
                                    class="${Constants.DS_COLUMN.replace(".", "")}" 
                                    ColName='${jsobj.Name}'>
                                        <i class='fa ${this.getIconByType(jsobj.EbDbType)} column_tree_typeicon'></i> 
                                        ${jsobj.Name} 
                            </span>
                        </li>`
            html[propName].push($item);
        }
    };

    this.getIconByType = function (type) {
        if (type === 16)
            return "fa-font";
        else if ([7, 8, 10, 11, 12, 21].includes(type))
            return "fa-sort-numeric-asc";
        else if (type === 30)
            return "fa-check";
        else if ([5, 6, 17, 26].includes(type))
            return "fa-calendar";
        else
            return "fa-question";
    };
}

function MobileMenu(option) {
    this.Root = option;

    this.contextMenudelete = function (eType, selector, action, originalEvent) {
        let id = selector.$trigger.attr("id");
        let o = this.Root.Procs[id];

        delete this.Root.Procs[id];
        this.Root.pg.removeFromDD(id);

        if (selector.$trigger.hasClass("mob_container")) {
            this.Root.Procs = {};
            this.Root.$Selectors.columnTree.find(`ul[class='ds_cols']`).empty();
            this.Root.$Selectors.treeContainer.hide();
            this.Root.ContainerObject = null;
            FilterToolBox(null, this.Root.Conf.TabNum);
        }
        selector.$trigger.remove();
        if (this.Root.ContainerType === "EbMobileForm")
            this.Root.Controls.refreshColumnTree();
    };

    this.tableLayoutLinks = function (eType, selector, action, originalEvent) {
        let $table = selector.$trigger.closest(".eb_mob_tablelayout");
        let obj = this.Root.Procs[$table.attr("id")];
        if (eType === "add_row") {
            let colcount = $table.find("tr:first-child td").length;

            let html = ["<tr class='eb_tablelayout_tr'>"];
            for (let i = 0; i < colcount; i++) {
                html.push(`<td class="eb_tablelayout_td"></td>`);
            }
            html.push("</tr>");
            $table.find("tbody").append(html.join(""));
            obj.droppable();
        }
        else if (eType === "add_column") {
            $table.find("tr").each(function (i, o) {
                $(o).append(`<td class="eb_tablelayout_td"></td>`);
            });
            obj.droppable();
            obj.resizable();
        }
        else if (eType === "delete_row") {
            let $row = selector.$trigger.find(".eb_tablelayout_tr:last-child");
            let rowcount = $table.find(".eb_tablelayout_tr").length;
            if (rowcount > 1) {
                $row.remove();
            }
        }
        else if (eType === "delete_column") {
            let $cols = selector.$trigger.find(".eb_tablelayout_td:last-child");
            if ($cols.length > 1)
                $cols.remove();
        }
    };

    this.dataLayoutTableOperation = function (eType, selector, action, originalEvent) {
        let $dataLink = selector.$trigger.closest("div[eb-type='EbMobileDataLink']");
        let obj = this.Root.Procs[$dataLink.attr("id")];
        let $table = $dataLink.find(".eb_datalink_table");
        if (eType === "add_row") {
            let colcount = $table.find("tr:first-child td").length;

            let html = ["<tr class='eb_datalink_tr'>"];
            for (let i = 0; i < colcount; i++) {
                html.push(`<td class="eb_datalink_td"></td>`);
            }
            html.push("</tr>");
            $table.find("tbody").append(html.join(""));
            obj.droppable();
        }
        else if (eType === "add_column") {
            $table.find("tr").each(function (i, o) {
                $(o).append(`<td class="eb_datalink_td"></td>`);
            });
            obj.droppable();
            obj.resizable();
        }
        else if (eType === "delete_row") {
            let $row = selector.$trigger.find(".eb_datalink_tr:last-child");
            let rowcount = $table.find(".eb_datalink_tr").length;
            if (rowcount > 1) {
                $row.remove();
            }
        }
        else if (eType === "delete_column") {
            let $cols = selector.$trigger.find(".eb_datalink_td:last-child");
            if ($cols.length > 1)
                $cols.remove();
        }
    }

    this.disableMenuItem = function (key, opt) {
        let flag = opt.$trigger.data('cutDisabled');
        let ebtype = opt.$trigger.attr("eb-type");

        if (key === "delete") {
            if (ebtype === "EbMobileTableLayout" && opt.$trigger.closest(".mob_container").hasClass("eb_mob_vis_container")) {
                flag = !opt.$trigger.data('cutDisabled');
            }
            else if (ebtype === "EbMobileTableLayout" && opt.$trigger.closest(".ctrl_as_container").length > 0) {
                flag = !opt.$trigger.data('cutDisabled');
            }
        }
        return flag;
    };

    this.options = {
        "delete": {
            name: "Delete",
            icon: "delete",
            callback: this.contextMenudelete.bind(this),
            disabled: this.disableMenuItem.bind(this)
        }
    };

    this.ContextLinks = {
        EbMobileTableLayout: {
            "add_row": { name: "Add Row", icon: "plus", callback: this.tableLayoutLinks.bind(this) },
            "add_column": { name: "Add Column", icon: "plus", callback: this.tableLayoutLinks.bind(this) },
            "delete_row": { name: "Delete Row", icon: "plus", callback: this.tableLayoutLinks.bind(this) },
            "delete_column": { name: "Delete Column", icon: "plus", callback: this.tableLayoutLinks.bind(this) }
        },
        EbMobileDataLink: {
            "add_row": { name: "Add Row", icon: "plus", callback: this.dataLayoutTableOperation.bind(this) },
            "add_column": { name: "Add Column", icon: "plus", callback: this.dataLayoutTableOperation.bind(this) },
            "delete_row": { name: "Delete Row", icon: "plus", callback: this.dataLayoutTableOperation.bind(this) },
            "delete_column": { name: "Delete Column", icon: "plus", callback: this.dataLayoutTableOperation.bind(this) }
        }
    };

    this.initContextMenu = function () {
        $.contextMenu({
            selector: '#eb_mobpage_pane' + this.Root.Conf.TabNum + ' .dropped',
            autoHide: true,
            build: function ($trigger, e) {
                return { items: this.getMenu($trigger, e) };
            }.bind(this)
        });
    };

    this.getMenu = function ($trigger, e) {
        let m = $.extend({}, this.options);
        let ebtype = $trigger.attr("eb-type");

        if (this.ContextLinks.hasOwnProperty(ebtype)) {
            $.extend(m, this.ContextLinks[ebtype]);
        }
        return m;
    };

    this.initContextMenu();
}
(function (doc) {
    window.dataColToMobileCol = function (datacols) {
        datacols = datacols || [];
        var mobcols = [];

        for (let i = 0; i < datacols.length; i++) {
            let mcol = new EbObjects.EbMobileDataColToControlMap("colref_mobilecols" + i);

            mcol.Name = datacols[i].columnName;
            mcol.ColumnName = datacols[i].columnName;
            mcol.Type = datacols[i].type;

            mobcols.push(mcol);
        }
        return mobcols;
    };

    window.expand = function (o) {
        let constructor = o.constructor.name;
        let common = {
            tab: "",
            trigger: function (root, event, containerType) {
                this.tab = root.Conf.TabNum || "";
            },
            setObject: function () { return null; },
            propertyChanged: function (propname, root) { },
            blackListProps: [],
            refresh: function () { },
            pgSetObject: function (root) { }
        };

        $.extend(o, common, window.expandable[constructor] || {});
    };

    window.expandable = {
        EbMobilePage: {
            propertyChanged: function (propname, root) {
                if (propname === "DisplayName") {
                    root.setEmulatorTitle(this.DisplayName);
                }
            },
        },
        EbMobileSimpleSelect: {
            propertyChanged: function (propname, root) {
                if (propname === "DataSourceRefId") {
                    this.getColumns(root);
                }
            },
            getColumns: function (root) {
                EbCommonLoader.EbLoader("show");
                getDSColums(this.DataSourceRefId).done(function (data) {
                    EbCommonLoader.EbLoader("hide");
                    let keys = Object.keys(data.columns).length;
                    let c = 1;
                    this.Columns.$values.length = 0;
                    this.Parameters.$values = data.paramsList;
                    $.each(data.columns, function (i, columnCollection) {
                        for (let i = 0; i < columnCollection.length; i++) {

                            let o = new EbObjects.EbMobileDataColumn(columnCollection[i].columnName);
                            o.ColumnIndex = columnCollection[i].columnIndex;
                            o.ColumnName = columnCollection[i].columnName;
                            o.Type = columnCollection[i].type;

                            this.Columns.$values.push(o);
                        }
                        if (c === keys) {
                            root.pg.refresh();
                        }
                        c++;
                    }.bind(this));
                }.bind(this));
            }
        },
        EbMobileGeoLocation: {
            _toggleSearchBar: function () {
                if (this.HideSearchBox) {
                    $(`#${this.EbSid} .eb_mob_textbox`).hide();
                }
                else {
                    $(`#${this.EbSid} .eb_mob_textbox`).show();
                }
            },
            propertyChanged: function (propname) {
                if (propname === "HideSearchBox") {
                    this._toggleSearchBar();
                }
            }
        },
        EbMobileTableLayout: {
            trigger: function (root, event, containerType) {
                this.tab = "Tab" + root.Conf.TabNum;
                $(`#${this.EbSid} .eb_mob_tablelayout_inner`).append(this.getHtml());
                this.droppable(containerType);
                this.resizable();
            },
            getHtml: function () {
                let html = [];
                html.push(`<table class='eb_tablelayout_table'>`);
                for (let i = 0; i < this.RowCount; i++) {
                    html.push(`<tr class='eb_tablelayout_tr'>`);
                    for (let k = 0; k < this.ColumCount; k++) {
                        html.push('<td class="eb_tablelayout_td"></td>');
                    }
                    html.push(`</tr>`);
                }
                html.push(`</table>`);
                return html.join("");
            },
            droppable: function (containerType) {
                if (containerType === 'EbMobileForm')
                    accept = [Constants.FORM_CONTROL];
                else
                    accept = [Constants.DS_COLUMN, Constants.LIST_CONTROL];

                $(`#${this.EbSid} .eb_tablelayout_td`).droppable({
                    accept: accept.join(","),
                    hoverClass: "drop-hover-td",
                    drop: this.onDrop.bind(this),
                    greedy: true
                });
            },
            onDrop: function (event, ui) {
                let $dragged = $(ui.draggable);
                let ebtype = $dragged.attr("eb-type");
                let ctrlname = $dragged.attr("ctrname");
                let root = window.MobilePage[this.tab].Creator;
                let o = root.makeElement(ebtype, ctrlname);
                o.trigger(root);
                $(event.target).append(o.$Control.outerHTML());

                if (ebtype === "EbMobileDataColumn") {
                    o.Type = $dragged.attr("DbType");
                    o.ColumnName = $dragged.attr("ColName") || 'column' + CtrlCounters['MobileDataColumnCounter'];
                    o.ColumnIndex = $dragged.attr("index");
                }
                root.refreshControl(o);
            },
            resizable: function () {
                $(`#${this.EbSid} .eb_tablelayout_tr:first-child .eb_tablelayout_td:not(:last-child)`).resizable({
                    handles: "e",
                    stop: function () { }.bind(this)
                });
            },
            fillControls: function (cells, root) {
                for (let i = 0; i < cells.length; i++) {
                    let $tr = $(`#${this.EbSid} tr:eq(${cells[i].RowIndex})`);
                    if ($tr.is(":first-child"))
                        $(`#${this.EbSid} tr:eq(${cells[i].RowIndex}) td:eq(${cells[i].ColIndex})`).not(":last-child").css("width", `${cells[i].Width}%`);

                    let ctrls = cells[i].ControlCollection.$values;

                    for (let k = 0; k < ctrls.length; k++) {
                        let ebtype = root.getType(ctrls[k].$type);
                        let o = root.makeElement(ebtype, ebtype);
                        $.extend(o, ctrls[k]);
                        $(`#${this.EbSid} tr:eq(${cells[i].RowIndex}) td:eq(${cells[i].ColIndex})`).append(o.$Control.outerHTML());
                        root.refreshControl(o);
                        o.trigger(root);
                    }
                }
            },
            setObject: function () {
                this.CellCollection.$values.length = 0;
                this.RowCount = $(`#${this.EbSid} .eb_tablelayout_tr`).length;
                this.ColumCount = $(`#${this.EbSid} .eb_tablelayout_tr:first-child .eb_tablelayout_td`).length;
                let widthAdjustement = 0.0;
                let totalwidth = 0;
                $(`#${this.EbSid} .eb_tablelayout_td`).each(function (i, td) {
                    totalwidth += $(td).width();
                }.bind(this));
                if (this.RowCount > 1)
                    totalwidth /= this.RowCount;
                $(`#${this.EbSid} .eb_tablelayout_td`).each(function (i, td) {
                    let rowindex = $(td).closest(".eb_tablelayout_tr").index();
                    let colindex = $(td).index();

                    let cell = new EbObjects.EbMobileTableCell(`TableCell_${rowindex}_${colindex}`);
                    cell.RowIndex = rowindex;
                    cell.ColIndex = colindex;
                    let floatwidth = ($(td).width() * 100.0) / totalwidth;
                    widthAdjustement += floatwidth % 1;
                    cell.Width = parseInt(floatwidth);
                    if (widthAdjustement >= 1) {
                        cell.Width += 1;
                        widthAdjustement--;
                    }

                    $(td).find(".mob_control").each(function (i, ctrl) {
                        let ebo = window.MobilePage[this.tab].Creator.Procs[ctrl.id];
                        cell.ControlCollection.$values.push(ebo);
                    }.bind(this));

                    this.CellCollection.$values.push(cell);
                }.bind(this));
            }
        },
        EbMobileDataGrid: {
            trigger: function (root, event = null) {
                root.makeDropable(this.EbSid, "EbMobileForm");
                root.makeSortable(this.EbSid);

                let tobj = root.makeElement("EbMobileTableLayout", "TableLayout");
                $(`#${this.EbSid} .ctrl_as_container .data_layout`).append(tobj.$Control.outerHTML());
                if (root.Mode === "edit" && this.DataLayout && !event) {
                    $.extend(tobj, this.DataLayout);
                    if (tobj.RowCount <= 0) tobj.RowCount = 2;
                    if (tobj.ColumCount <= 0) tobj.ColumCount = 2;
                    tobj.CellCollection = this.DataLayout.CellCollection;
                }
                tobj.trigger(root, null, 'EbMobileDataGrid');
                return tobj;
            },
            setObject: function (root) {
                this.ChildControls.$values.length = 0;
                let tableLayout = $(`#${this.EbSid} .data_layout div[eb-type="EbMobileTableLayout"]`)[0];
                let tobj = root.Procs[tableLayout.id];
                tobj.setObject();
                this.DataLayout = tobj;

                $(`#${this.EbSid} .control_container`).find(".mob_control").each(function (k, obj) {
                    root.findFormContainerItems(k, obj, this.ChildControls);
                }.bind(this));
            },
            propertyChanged: function (propname) {
                if (propname === "Label") {
                    $(`#${this.EbSid}`).children(".ctrl_label").text(this.Label);
                }
            }
        },
        EbMobileNumericBox: {
            trigger: function (root) {
                this.propertyChanged("RenderType");
            },
            propertyChanged: function (propname) {
                if (propname === "RenderType") {
                    if (this.RenderType === 1) {
                        $(`#${this.EbSid} .eb_mob_numericbox`).hide();
                        $(`#${this.EbSid} .eb_mob_numericbox-btntype`).show();
                    }
                    else {
                        $(`#${this.EbSid} .eb_mob_numericbox`).show();
                        $(`#${this.EbSid} .eb_mob_numericbox-btntype`).hide();
                    }
                }
            }
        },
        EbMobileForm: {
            propertyChanged: function (propname, root) {
                if (propname === "RenderValidatorRefId") {
                    getDSColums(this.RenderValidatorRefId).done(function (result) {
                        try {
                            this.RenderValidatorParams.$values = result.paramsList || [];
                        }
                        catch (err) {
                            console.error("get datasource colum error in EbMobileForm propchange");
                            console.log(JSON.stringify(result));
                        }
                    }.bind(this));
                }
                else if (propname === "SubmitButtonText") {
                    root.$Selectors.pageWrapper.find(`.emulator_f`).text(this.SubmitButtonText || "Save");
                }
            }
        },
        EbMobileVisualization: {
            LinkSettingsProps: ["FormMode", "RenderAsPopup", "FormId", "LinkFormParameters"],//"ContextToControlMap"
            propertyChanged: function (propname, root) {
                if (propname == "DataSourceRefId") {
                    if (!this.DataSourceRefId) {
                        this.loadDsColumns({}, root);
                        return;
                    }
                    EbCommonLoader.EbLoader("show");
                    getDSColums(this.DataSourceRefId).done(function (response) {
                        this.loadDsColumns(response, root);
                        EbCommonLoader.EbLoader("hide");
                    }.bind(this));
                }
                else if (propname === "LinkRefId") {
                    if (!this.LinkRefId) {
                        this.loadLinkFormControls(null, root);
                        return;
                    }
                    EbCommonLoader.EbLoader("show");
                    getLinkType(this.LinkRefId).done(function (response) {
                        this.loadLinkFormControls(response, root);
                        EbCommonLoader.EbLoader("hide");
                    }.bind(this));
                }
                else if (propname == "FabLinkRefId") {
                    if (!this.FabLinkRefId) {
                        this.setFabC2ControlMap(null, root);
                        return;
                    }
                    EbCommonLoader.EbLoader("show");
                    getLinkType(this.FabLinkRefId).done(function (response) {
                        this.setFabC2ControlMap(response, root);
                        EbCommonLoader.EbLoader("hide");
                    }.bind(this));
                }
                else if (propname == "Type") {
                    if (this.Type === 0) {
                        root.pg.refresh();
                        $(`#${this.EbSid} .filter_sort-tab`).removeClass("fst-fade-mask");
                        if (this.DataSourceRefId) {
                            root.showTreeContainer();
                        }
                    }
                    else {
                        $(`#${this.EbSid} .filter_sort-tab`).addClass("fst-fade-mask");
                        root.$Selectors.treeContainer.hide(200);
                    }
                }
            },
            setFabC2ControlMap: function (response, root) {
                if (!response) {
                    this.FabControlMetas.$values.length = 0;
                    this.FabLinkTypeForm = false;
                    return;
                }
                let controlInfo = JSON.parse(response);
                this.FabLinkTypeForm = controlInfo.IsForm;
                root.pg.refresh();
            },
            loadDsColumns: function (getColumnResp, root) {
                this.DataSourceParams.$values = getColumnResp.paramsList || [];
                if (getColumnResp.columns && getColumnResp.columns.length > 0) {
                    this.DataColumns.$values = window.dataColToMobileCol(getColumnResp.columns[0]);
                }
                else {
                    this.DataColumns.$values.length = 0;
                }
                root.DSColumnsJSON = getColumnResp.columns || [];
                root.Controls.drawDsColTree(getColumnResp.columns);
                if (this.Type === 0) {
                    root.showTreeContainer();
                }
            },
            loadLinkFormControls: function (response, root) {
                if (!response) {
                    root.Controls.FilterControls = [];
                    this.FormControlMetas.$values.length = 0;
                    this.LinkTypeForm = false;
                    return;
                }
                var controlInfo = JSON.parse(response);
                root.Controls.FilterControls = controlInfo.Controls.$values;
                this.FormControlMetas.$values = controlInfo.ControlMetas.$values;
                this.LinkTypeForm = controlInfo.IsForm;
                root.pg.refresh();
                root.Controls.drawFormControls();
            }
        },
        EbMobileDataColumn: {
            trigger: function (root) {
                this.propertyChanged("HorrizontalAlign");
            },
            propertyChanged: function (propname, root) {
                if (propname === "HorrizontalAlign") {
                    window.alignHorrizontally($(`#${this.EbSid}`), this.HorrizontalAlign);
                }
                else if (propname === "ColumnName") {
                    root.refreshControl(this);
                }
            }
        },
        EbMobileButton: {
            __FormIdCopy: null,
            trigger: function (root) {
                this.propertyChanged("HorrizontalAlign");
                this.propertyChanged("LinkRefId", root);
                this.__FormIdCopy = this.FormId;
            },
            propertyChanged: function (propname, root) {
                if (propname === "HorrizontalAlign") {
                    window.alignHorrizontally($(`#${this.EbSid}`), this.HorrizontalAlign);
                }
                else if (propname === "LinkRefId") {
                    this.setC2ControlMap(root);
                }
            },
            setC2ControlMap: function (root) {
                if (!this.LinkRefId) return;
                EbCommonLoader.EbLoader("show");
                getLinkType(this.LinkRefId).done(function (response) {
                    EbCommonLoader.EbLoader("hide");
                    let controlInfo = JSON.parse(response);
                    let ds_cols = root.DSColumnsJSON || [];
                    if (ds_cols.length >= 1) {
                        this.DataColumns.$values = window.dataColToMobileCol(ds_cols[0]);
                    }
                    this.FormControlMetas.$values = controlInfo.ControlMetas.$values;
                    this.LinkTypeForm = controlInfo.IsForm;
                    root.pg.refresh();
                }.bind(this));
            },
            pgSetObject: function (root) {
                if (this.DataColumns == null || this.DataColumns.$values.length <= 0) {
                    let ds_cols = root.DSColumnsJSON || [];
                    if (ds_cols.length >= 1) {
                        this.DataColumns.$values = window.dataColToMobileCol(ds_cols[0]);
                    }
                }
                this.FormId = this.__FormIdCopy;
                root.pg.refresh();
            }
        },
        EbMobileRating: {
            propertyChanged: function () {
                let htm = "";
                for (i = 0; i < this.MaxValue; i++)
                    htm += "<span class='fa fa-star-o wrd_spacing'></span>";
                $(`#${this.EbSid} .eb_ctrlhtml`).empty().append(htm);
                $(`#${this.EbSid} .eb_ctrlhtml .wrd_spacing`).css("padding-right", this.Spacing);
            },
            trigger: function () {
                let htm = "";
                for (i = 0; i < this.MaxValue; i++)
                    htm += "<span class='fa fa-star-o wrd_spacing'></span>"
                $(`#${this.EbSid} .eb_ctrlhtml`).empty().append(htm);
                $(`#${this.EbSid} .eb_ctrlhtml .wrd_spacing`).css("padding-right", this.Spacing);
            },
        },
        EbMobileStackLayout: {
            trigger: function (root) {
                this.tab = "Tab" + root.Conf.TabNum;
                root.makeDropable(this.EbSid, "EbMobileDashBoard");
                root.makeSortable(this.EbSid);

                if (root.Mode == "edit") {
                    this.fillControls(root);
                }
            },
            fillControls: function (root) {
                let controls = this.ChildControls.$values || [];
                for (let i = 0; i < controls.length; i++) {
                    let ebtype = root.getType(controls[i].$type);
                    let o = root.makeElement(ebtype, ebtype);
                    $(`#${this.EbSid} .control_container`).append(o.$Control.outerHTML());
                    $.extend(o, controls[i]);
                    root.refreshControl(o);
                    o.trigger(root);
                }
            },
            setObject: function () {
                this.ChildControls.$values.length = 0;
                $(`#${this.EbSid} .control_container`).children(".mob_dash_control ").each(function (i, ctrl) {
                    let ebo = window.MobilePage[this.tab].Creator.Procs[ctrl.id];
                    ebo.setObject();
                    this.ChildControls.$values.push(ebo);
                }.bind(this));
            }
        },
        EbMobileLabel: {
            trigger: function (root) {
                if (root.ContainerType === "EbMobileVisualization") {
                    this.BindableParams.$values = root.ContainerObject.StaticParameters.$values;
                }
            },
            propertyChanged: function (propname) {
                if (propname === "HorrizontalAlign") {
                    window.alignHorrizontally($(`#${this.EbSid}`), this.HorrizontalAlign);
                }
            }
        },
        EbMobileDataLink: {
            trigger: function (root) {
                this.tab = "Tab" + root.Conf.TabNum;
                $(`#${this.EbSid} .eb_mob_datalink_layout`).append(this.getHtml());
                this.droppable();
                this.resizable();

                if (root.Mode == "edit") {
                    this.fillControls(root);
                }
            },
            getHtml: function () {
                let html = [];
                html.push(`<table class='eb_datalink_table'>`);
                for (let i = 0; i < this.RowCount; i++) {
                    html.push(`<tr class='eb_datalink_tr'>`);
                    for (let k = 0; k < this.ColumCount; k++) {
                        html.push('<td class="eb_datalink_td"></td>');
                    }
                    html.push(`</tr>`);
                }
                html.push(`</table>`);
                return html.join("");
            },
            droppable: function () {
                $(`#${this.EbSid} .eb_datalink_td`).droppable({
                    accept: Constants.DS_COLUMN + "," + Constants.DATA_LABEL,
                    hoverClass: "drop-hover-td",
                    greedy: true,
                    drop: this.onDrop.bind(this)
                });
            },
            onDrop: function (event, ui) {
                let $dragged = $(ui.draggable);
                let ebtype = $dragged.attr("eb-type");
                let ctrlname = $dragged.attr("ctrname");
                let root = window.MobilePage[this.tab].Creator;
                let o = root.makeElement(ebtype, ctrlname);
                o.trigger(root);
                $(event.target).append(o.$Control.outerHTML());
                if ($dragged.hasClass("ds-column")) {
                    o.BindingParam = `T${$dragged.attr("tableindex")}.${$dragged.attr("colname")}`;
                    o.Text = $dragged.attr("colname");
                }
                root.refreshControl(o);
            },
            resizable: function () {
                $(`#${this.EbSid} .eb_datalink_tr:first-child .eb_datalink_td:not(:last-child)`).resizable({
                    handles: "e",
                    stop: function () { }.bind(this)
                });
            },
            fillControls: function (root) {
                let cells = this.CellCollection.$values || [];
                for (let i = 0; i < cells.length; i++) {
                    let ctrls = cells[i].ControlCollection.$values || [];

                    for (let k = 0; k < ctrls.length; k++) {
                        let ebtype = root.getType(ctrls[k].$type);
                        let o = root.makeElement(ebtype, ebtype);
                        $.extend(o, ctrls[k]);

                        $(`#${this.EbSid} tr:eq(${cells[i].RowIndex}) td:eq(${cells[i].ColIndex})`).append(o.$Control.outerHTML());
                        let $tr = $(`#${this.EbSid} tr:eq(${cells[i].RowIndex})`);
                        if ($tr.is(":first-child")) {
                            $(`#${this.EbSid} tr:eq(${cells[i].RowIndex}) td:eq(${cells[i].ColIndex})`).not(":last-child").css("width", `${cells[i].Width}%`);
                        }

                        root.refreshControl(o);
                        o.trigger(root);
                    }
                }
            },
            setObject: function () {
                this.CellCollection.$values.length = 0;
                this.RowCount = $(`#${this.EbSid} .eb_datalink_tr`).length;
                this.ColumCount = $(`#${this.EbSid} .eb_datalink_tr:first-child .eb_datalink_td`).length;

                $(`#${this.EbSid} .eb_datalink_td`).each(function (i, td) {
                    let rowindex = $(td).closest(".eb_datalink_tr").index();
                    let colindex = $(td).index();

                    let cell = new EbObjects.EbMobileDataCell(`DataCell_${rowindex}_${colindex}`);
                    cell.RowIndex = rowindex;
                    cell.ColIndex = colindex;
                    cell.Width = parseFloat($(td).width() / $(`#${this.EbSid}`).width() * 100);

                    $(td).find(".mob_dash_control").each(function (i, ctrl) {
                        let ebo = window.MobilePage[this.tab].Creator.Procs[ctrl.id];
                        cell.ControlCollection.$values.push(ebo);
                    }.bind(this));

                    this.CellCollection.$values.push(cell);
                }.bind(this));
            }
        },
        EbMobileDashBoard: {
            propertyChanged: function (propname, root) {
                if (propname == "DataSourceRefId") {
                    if (!this.DataSourceRefId) return;
                    EbCommonLoader.EbLoader("show");
                    getDSColums(this.DataSourceRefId).done(function (response) {
                        root.Controls.drawDsColTree(response.columns, "EbMobileDataLabel");
                        root.showTreeContainer();
                        EbCommonLoader.EbLoader("hide");
                    }.bind(this));
                }
            },
            sortable: function () {
                $(`#${this.EbSid} .eb_mob_container_inner`).sortable({
                    axis: "y",
                    appendTo: document.body
                });
            }
        },
        EbMobileApprovalButton: {
            __FormIdCopy: null,
            trigger: function (root) {
                this.propertyChanged("HorrizontalAlign");
                this.__FormIdCopy = this.FormId;
            },
            propertyChanged: function (propname, root) {
                if (propname === "HorrizontalAlign") {
                    window.alignHorrizontally($(`#${this.EbSid}`), this.HorrizontalAlign);
                }
            },
            pgSetObject: function (root) {
                if (this.DataColumns == null || this.DataColumns.$values.length <= 0) {
                    let ds_cols = root.DSColumnsJSON || [];
                    if (ds_cols.length >= 1) {
                        this.DataColumns.$values = window.dataColToMobileCol(ds_cols[0]);
                    }
                }
                this.FormId = this.__FormIdCopy;
                root.pg.refresh();
            }
        }
    };
})(jQuery);