
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

    this.GenerateButtons = function () { };

    this.pg = new Eb_PropertyGrid({
        id: "eb_mobpage_properties" + this.Conf.TabNum,
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
        curObject.pgSetObject(this);
        this.pg.__extension.hideBlackListed(curObject);
    };

    this.newMobPage = function () {
        let name = "tab_" + this.Conf.TabNum + "MobilePage" + Date.now();
        this.EbObject = new EbObjects["EbMobilePage"](name);
        this.pg.setObject(this.EbObject, AllMetas["EbMobilePage"]);
    };

    this.getType = function (assembly) {
        return assembly.split(",")[0].split(".")[2];
    };

    this.editMobPage = function () {
        this.EbObject = new EbObjects["EbMobilePage"](this.EditObj.Name);
        {
            var _o = $.extend(true, {}, this.EditObj);
            $.extend(this.EbObject, _o);
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
        expand(o);
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
                tobj.fillControls(tobj.CellCollection.$values, this);//fill table cells
                this.setCtrls($(`#${o.EbSid} .ctrl_as_container .control_container`), o.ChildControls.$values);
            }
        }
    };

    this.makeDragable = function () {
        $(".draggable,.container_draggable,.draggable_dashctrl").draggable({
            cancel: "a.ui-icon",
            revert: "invalid",
            helper: "clone",
            cursor: "move",
            zIndex: 1000,
            appendTo: "body",
            drag: function (event, ui) {
                $(ui.helper).css({
                    "background": "white",
                    "border": "1px dotted black",
                    "width": "auto",
                    "padding": "15px",
                    "border-radius": "4"
                });
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
            return ".draggable";
        else if (ebtype === "EbMobileDashBoard")
            return ".draggable_dashctrl";
        else
            return ".draggable";
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

        //set tree col if form
        if (this.ContainerType === "EbMobileForm")
            this.Controls.refreshColumnTree();

        return o;
    };

    this.containerOnDrop = function (event, ui) {
        let dropLoc = $(event.target);
        let draged = $(ui.draggable);

        if (dropLoc.find(".mob_container").length <= 0) {
            let ebtype = draged.attr("eb-type");
            let ctrlname = draged.attr("ctrname");
            this.ContainerType = ebtype;
            let o = this.makeElement(ebtype, ctrlname);
            dropLoc.append(o.$Control.outerHTML());
            expand(o);
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
            o.refresh(this);
            FilterToolBox(ebtype, this.Conf.TabNum);
        }
    };

    this.makeElement = function (ebtype, ctrlname) {
        let counter = CtrlCounters[ebtype.replace("Eb", "") + "Counter"]++;
        var id = "Tab" + this.Conf.TabNum + "_" + ctrlname + counter;
        this.Procs[id] = new EbObjects[ebtype](id);
        this.Procs[id].Label = ctrlname + counter;
        expand(this.Procs[id]);
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
            //set root object to objdash current object
            commonO.Current_obj = this.EbObject;
            return true;
        }
        else
            return false;
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
    };

    this.getColums4ListView = function (obj) {
        this.dataSourceColumn(obj.DataSourceRefId, function (vis, result) {
            vis.DataSourceParams.$values = result.paramsList || [];

            if (result.columns && result.columns.length > 0) {
                vis.DataColumns.$values = window.dataColToMobileCol(result.columns[0]);
            }

            this.DSColumnsJSON = result.columns || [];

            this.Controls.drawDsColTree(result.columns);
            $(".branch").click();
            if (!$(`#eb_mobtree_body_${this.Conf.TabNum}`).is(":visible"))
                $(`#eb_mobtree_body_${this.Conf.TabNum}`).animate({ width: ["toggle", "swing"] });
        }.bind(this, obj));
    };

    this.dataSourceColumn = function (ds_refid, callback) {
        if (!callback)
            console.error("dataSourceColumn must have callback function");

        if (ds_refid) {
            $.ajax({
                url: "../RB/GetColumns",
                type: "POST",
                cache: false,
                data: { refID: ds_refid },
                beforeSend: function () { $("#eb_common_loader").EbLoader("show"); },
                success: function (result) {
                    $("#eb_common_loader").EbLoader("hide");
                    callback(result);
                }.bind(this),
                error: function () {
                    $("#eb_common_loader").EbLoader("hide");
                }
            });
        }
    };

    //pg onchange
    this.pg.PropertyChanged = function (obj, pname) {

        let constructor = obj.constructor.name;

        if (pname === "Label" && constructor !== "EbMobileDataGrid") {
            this.refreshControl(obj);
        }
        else if (constructor === "EbMobileSimpleSelect" && pname === "DataSourceRefId") {
            obj.getColumns(obj.DataSourceRefId, this);
        }
        else if (constructor === "EbMobileVisualization") {
            if (pname === "DataSourceRefId") {
                this.getColums4ListView(obj);
            }
            else if (pname === "LinkRefId") {
                this.Controls.setLinkFormControls(obj);
            }
        }
        else if (pname === "DisplayName" && constructor === "EbMobilePage") {
            this.setEmulatorTitle(obj[pname]);
        }
        else {
            console.log("pg changed");
        }

        if ("propertyChanged" in obj)
            obj.propertyChanged(pname, this);

        //set tree col if form
        if (this.ContainerType === "EbMobileForm" && (pname === "Name" || pname === "TableName"))
            this.Controls.refreshColumnTree();
    }.bind(this);

    this.labelOnDoubleClick = function (e) {
        let label = $(e.target).closest(".ctrl_label");
        label.prop("contenteditable", true);
        label.addClass("content-editable");
        label.focus();
        label.off("focusout").on("focusout", function (e) {
            let o = this.Procs[label.closest(".eb_stacklayout").attr("id")];
            o.Label = label.text().trim();
            label.removeClass("content-editable");
            this.pg.refresh();
        }.bind(this));
    };

    this.refreshEmulator = function () {
        let h = $(`#eb_mobpage_toolbox${this.Conf.TabNum}`).height();
        $(`#eb_mobpage_wraper${this.Conf.TabNum} .eb_mobpage_pane_layout`).height(h - 10);
        $(`#eb_mobpage_wraper${this.Conf.TabNum} .eb_mobtree_body`).height(h);
    };

    this.setEmulatorTitle = function (value) {
        $("#eb_emulater_title" + this.Conf.TabNum).text(value);
    };

    this.setRoot = function () {
        this.pg.setObject(this.EbObject, AllMetas["EbMobilePage"]);
    };

    this.exe = function () {
        this.Controls = new MobileControls(this);
        if (this.EditObj === null || this.EditObj === undefined)
            this.newMobPage();
        else
            this.editMobPage();

        this.makeDragable();

        $(this.droparea).droppable({
            accept: ".container_draggable",
            hoverClass: "drop-hover",
            drop: this.containerOnDrop.bind(this)
        });
        this.Menu = new MobileMenu(this);
        $("body").on("dblclick", ".ctrl_label", this.labelOnDoubleClick.bind(this));
        $(".eb_mobpage_pane_layout").on("focus", this.setRoot.bind(this));
        this.refreshEmulator();
        this.setEmulatorTitle(this.EbObject.DisplayName || "Untitled");
        $(window).resize(function () { this.refreshEmulator(); }.bind(this));
        this.pg.__extension = new PgHelperMobile(this.pg);
    };

    this.exe();
}