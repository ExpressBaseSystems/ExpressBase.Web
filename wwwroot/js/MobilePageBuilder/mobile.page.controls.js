﻿function MobileControls(root) {
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