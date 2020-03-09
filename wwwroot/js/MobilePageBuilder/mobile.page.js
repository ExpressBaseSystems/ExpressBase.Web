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
        let id = "Tab" + this.Conf.TabNum + "_" + ebtype + CtrlCounters[ebtype.replace("Eb", "") + "Counter"]++;
        let o = new EbObjects[ebtype](id);
        $.extend(o, this.EditObj.Container);
        this.Procs[id] = o;
        $(this.droparea).append(o.$Control.outerHTML());
        if (ebtype === "EbMobileForm") {
            this.makeDropable(o.EbSid, ebtype);
            this.makeSortable(o.EbSid);
            this.setCtrls($(`#${o.EbSid} .eb_mob_container_inner`), this.EditObj.Container.ChildControls.$values);
            this.Controls.setColumnTree();
            this.Controls.refreshColumnTree();
        }
        else if (ebtype === "EbMobileVisualization") {
            this.getCol(o.DataSourceRefId);
            this.Controls.InitVis(o);
        }
        else if (ebtype === "EbMobileDashBoard") {
            this.makeDropable(o.EbSid, ebtype);
            this.setCtrls(o.EbSid);//need to change
        }
        $(`#${o.EbSid}`).on("click", this.ContainerOnClick.bind(this));
        this.EditObj = null;
    };

    this.setCtrls = function ($container, controllCollection) {
        for (let i = 0; i < controllCollection.length; i++) {
            let _obj = controllCollection[i];
            let ebtype = this.getType(_obj.$type);
            let id = "Tab" + this.Conf.TabNum + "_" + ebtype + CtrlCounters[ebtype.replace("Eb", "") + "Counter"]++;
            let o = new EbObjects[ebtype](id);
            $.extend(o, _obj);
            this.Procs[id] = o;
            SetControlFunctions(this.Procs[id]);
            $container.append(o.$Control.outerHTML());
            this.RefreshControl(this.Procs[id]);
            if (ebtype === "EbMobileDataGrid") {
                this.setGridOnEdit(o);
            }
        }
    };

    this.setGridOnEdit = function (grid) {
        let tobj = this.Controls.initDataGrid(grid);
        let cellcollection = tobj.CellCollection.$values;

        for (let i = 0; i < cellcollection.length; i++) {
            this.Controls.renderCellControl(tobj, cellcollection[i]);
        }
        this.setCtrls($(`#${grid.EbSid} .ctrl_as_container .control_container`), grid.ChildControls.$values);
    };

    this.makeDragable = function () {
        $(".draggable,.container_draggable,.draggable_dashctrl").draggable({
            cancel: "a.ui-icon",
            revert: "invalid",
            helper: "clone",
            cursor: "move",
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
        this.pg.setObject(this.Procs[div.attr("id")], AllMetas[type]);
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
        let o = this.makeElement(dragged);
        $(event.target).append(o.$Control.outerHTML());
        this.RefreshControl(o);
        if (ebtype === "EbMobileTableLayout") {
            this.Controls.InitTableLayout(o);
        }
        else if (ebtype === "EbMobileDataGrid") {
            this.Controls.initDataGrid(o);
        }

        //set tree col if form
        if (this.ContainerType === "EbMobileForm")
            this.Controls.refreshColumnTree();
    };

    this.OnContainerDrop = function (event, ui) {
        let dropLoc = $(event.target);
        if (dropLoc.find(".mob_container").length <= 0) {
            let draged = $(ui.draggable);
            let ebtype = draged.attr("eb-type");
            this.ContainerType = ebtype;
            let o = this.makeElement(draged);
            dropLoc.append(o.$Control.outerHTML());
            if (ebtype === "EbMobileForm") {
                this.makeDropable(o.EbSid, ebtype);
                this.makeSortable(o.EbSid);
                this.Controls.setColumnTree(o);
            }
            else if (ebtype === "EbMobileVisualization") {
                this.Controls.InitVis(o);
            }
            else if (ebtype === "EbMobileDashBoard") {
                this.makeDropable(o.EbSid, ebtype);
            }
            $(`#${o.EbSid}`).on("click", this.ContainerOnClick.bind(this));
        }
    };

    this.makeElement = function (el) {
        let ebtype = $(el).attr("eb-type");
        let ctrlname = $(el).attr("ctrname");
        let counter = CtrlCounters[ebtype.replace("Eb", "") + "Counter"]++;
        var id = "Tab" + this.Conf.TabNum + "_" + ctrlname + counter;
        this.Procs[id] = new EbObjects[ebtype](id);
        this.Procs[id].Label = ctrlname + counter;
        SetControlFunctions(this.Procs[id]);
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
                let table = $(div).find(".eb_mob_tablelayout")[0];
                this.findVisContainerItems(table);
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

        if (ebtype === "EbMobileDataGrid") {
            jsobj.ChildControls.$values.length = 0;
            let tableLayout = $(`#${jsobj.EbSid} .data_layout div[eb-type="EbMobileTableLayout"]`)[0];
            let tobj = this.Procs[tableLayout.id];
            this.getTableLayoutControls(tobj);//data layout save
            jsobj.DataLayout = tobj;
            $(`#${jsobj.EbSid} .control_container`).find(".mob_control").each(function (k, obj) {
                this.findFormContainerItems(k, obj, jsobj.ChildControls);
            }.bind(this));
            ebContainer.$values.push(jsobj);//grid controls save
        }
        else
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
        this.getTableLayoutControls(o);
        this.EbObject.Container.DataLayout = o;

        this.EbObject.Container.Filters.$values.length = 0;
        $(`#${o.EbSid}`).closest(".mob_container").find(".vis-filter-container .data_column").each(function (j, obj) {
            let data_col = this.Procs[obj.id];
            this.EbObject.Container.Filters.$values.push(data_col);
        }.bind(this));
    };

    this.getTableLayoutControls = function (tobj) {

        tobj.CellCollection.$values.length = 0;
        tobj.RowCount = $(`#${tobj.EbSid} .eb_tablelayout_tr`).length;
        tobj.ColumCount = $(`#${tobj.EbSid} .eb_tablelayout_tr:first-child .eb_tablelayout_td`).length;

        $(`#${tobj.EbSid} .eb_tablelayout_td`).each(function (i, obj) {
            let rowindex = $(obj).closest(".eb_tablelayout_tr").index();
            let colindex = $(obj).index();

            let cell = new EbObjects.EbMobileTableCell(`TableCell_${rowindex}_${colindex}`);
            cell.RowIndex = rowindex;
            cell.ColIndex = colindex;
            cell.Width = parseFloat($(obj).width() / $(`#${tobj.EbSid}`).width() * 100);

            tobj.CellCollection.$values.push(this.getCellControls(cell, $(obj)));
        }.bind(this));
    };

    this.getCellControls = function (eb_cell, $td) {
        $td.find(".mob_control").each(function (i, _obj) {
            eb_cell.ControlCollection.$values.push(this.Procs[_obj.id]);
        }.bind(this));
        return eb_cell;
    };

    this.getCol = function (ds_refid) {
        if (ds_refid !== "") {
            $.ajax({
                url: "../RB/GetColumns",
                type: "POST",
                cache: false,
                data: { refID: ds_refid },
                beforeSend: function () { $("#eb_common_loader").EbLoader("show"); },
                success: function (result) {
                    $("#eb_common_loader").EbLoader("hide");
                    this.Controls.drawDsColTree(result.columns);
                    $(".branch").click();
                    if (!$(`#eb_mobtree_body_${this.Conf.TabNum}`).is(":visible"))
                        $(`#eb_mobtree_body_${this.Conf.TabNum}`).animate({ width: ["toggle", "swing"] });
                }.bind(this),
                error: function () { $("#eb_common_loader").EbLoader("hide"); }
            });
        }
    };

    //pg onchange
    this.pg.PropertyChanged = function (obj, pname) {
        if (pname === "Label" && obj.constructor.name !== "EbMobileDataGrid") {
            this.RefreshControl(obj);
        }
        else if (pname === "Label" && obj.constructor.name === "EbMobileDataGrid") {
            $(`#${obj.EbSid}`).children(".ctrl_label").text(obj.Label);
        }
        else if (obj.constructor.name === "EbMobileSimpleSelect" && pname === "DataSourceRefId") {
            obj._getColumns(obj.DataSourceRefId, function () {
                this.pg.refresh();
            }.bind(this));
        }
        else if (pname === "DataSourceRefId") {
            this.getCol(obj.DataSourceRefId);
        }
        else if (obj.constructor.name === "EbMobileGeoLocation" && pname === "HideSearchBox") {
            obj._toggleSearchBar();
        }
        else {
            console.log("pg changed");
        }

        //set tree col if form
        if (this.ContainerType === "EbMobileForm" && (pname === "Name" || pname === "TableName"))
            this.Controls.refreshColumnTree();
    }.bind(this);

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
            drop: this.OnContainerDrop.bind(this)
        });
        this.Menu = new MobileMenu(this);
    };

    this.exe();
}