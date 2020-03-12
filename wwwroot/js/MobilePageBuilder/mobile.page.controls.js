function MobileControls(root) {
    this.Root = root;

    this.initForm = function (o) {
        this.Root.makeDropable(o.EbSid, "EbMobileForm");
        this.Root.makeSortable(o.EbSid);
        this.setColumnTree(o);

        if (this.Root.Mode === "edit" && this.Root.EditObj !== null) {
            this.Root.setCtrls($(`#${o.EbSid} .eb_mob_container_inner`), this.Root.EditObj.Container.ChildControls.$values);
            this.refreshColumnTree();
        }
    };

    this.initVisualization = function (o) {

        let tobj = this.Root.makeElement("EbMobileTableLayout", "TableLayout");
        $(`#${o.EbSid} .eb_mob_container_inner .vis-table-container`).append(tobj.$Control.outerHTML());
        if (this.Root.Mode === "edit") {
            $.extend(tobj, this.Root.EditObj.Container.DataLayout);
        }
        tobj.trigger(this.Root);
        this.makeFilterColsDropable(o);

        if (this.Root.Mode === "edit" && this.Root.EditObj !== null) {
            tobj.fillControls(this.Root.EditObj.Container.DataLayout.CellCollection.$values, this.Root);//fill table cells

            let filters = this.Root.EditObj.Container.Filters.$values;
            for (let i = 0; i < filters.length; i++) {
                this.renderFilter(filters[i]);
            }
            this.refreshList();
            this.Root.getColums4ListView(o.DataSourceRefId);
        }
    };

    this.initDashBoard = function (o) {
        this.Root.makeDropable(o.EbSid, "EbMobileDashBoard");
        if (this.Root.Mode === "edit" && this.Root.EditObj !== null) {
            this.Root.setCtrls($(`#${o.EbSid} .eb_mob_container_inner`), o.ChildControls.$values);//need to change
        }
    };

    this.makeFilterColsDropable = function (container) {
        $(`#${container.EbSid} .vis-filter-container`).droppable({
            accept: ".draggable_column",
            hoverClass: "drop-hover-td",
            drop: function (event, ui) {
                let dragged = $(ui.draggable);
                let ctrlname = dragged.attr("ctrname");
                let obj = this.Root.makeElement("EbMobileDataColumn", ctrlname);
                obj.Type = dragged.attr("DbType");
                obj.ColumnName = dragged.attr("ColName");
                obj.ColumnIndex = dragged.attr("index");
                obj.TableIndex = dragged.attr("tableIndex");
                $(event.target).append(obj.$Control.outerHTML());
                this.Root.refreshControl(obj);
                $("#" + obj.EbSid).off("focus");
            }.bind(this)
        });
    };

    this.renderFilter = function (filterCol) {//render filter cols on edit
        let obj = this.Root.makeElement("EbMobileDataColumn", "DataColumn");
        $.extend(obj, filterCol);
        $(".mob_container .vis-filter-container").append(obj.$Control.outerHTML());
        this.Root.refreshControl(obj);
        $("#" + obj.EbSid).off("focus");
    };

    this.refreshList = function () {
        let html = $(`div[eb-type="EbMobileVisualization"] [eb-type="EbMobileTableLayout"]`).html();
        $(`div[eb-type="EbMobileVisualization"] .vis-preview-container`).html(`<div class="list_item">${html}</div>`);
    };

    this.getListHtml = function () {
        let html = [];
        html.push(`<div class='eb_mob_listwraper'>
                        <div class='eb_mob_listinner'>
                            
                        </div>
                </div >`);
        return html.join("");
    };

    this.drawDsColTree = function (colList) {
        $(`#ds_parameter_list${this.Root.Conf.TabNum} ul[class='ds_cols']`).empty();
        var type = "EbMobileDataColumn";
        $.each(colList, function (i, columnCollection) {
            $(`#ds_parameter_list${this.Root.Conf.TabNum} ul[class='ds_cols']`).append("<li><a>Table " + i + "</a><ul id='t" + i + "'></ul></li>");
            $.each(columnCollection, function (j, obj) {
                let icon = this.getIconByType(obj.type);
                let $div = $(`#ds_parameter_list${this.Root.Conf.TabNum} ul[id='t${i}']`);
                $div.append(`<li class='styl'>
                                <span eb-type='${type}'
                                    ctrname="DataColumn"
                                    tableIndex="${i}"
                                    index='${obj.columnIndex}'
                                    DbType='${obj.type}'
                                    ColName='${obj.columnName}'
                                    class='draggable_column'>
                                    <i class='fa ${icon} column_tree_typeicon'></i> ${obj.columnName}
                                </span>
                            </li>`);
            }.bind(this));
        }.bind(this));
        $(`#ds_parameter_list${this.Root.Conf.TabNum}`).killTree();
        $(`#ds_parameter_list${this.Root.Conf.TabNum}`).treed();
        this.makeTreeNodeDraggable();
    };

    this.makeTreeNodeDraggable = function () {
        $(`.draggable_column`).draggable({
            cancel: "a.ui-icon",
            revert: "invalid",
            helper: "clone",
            cursor: "move",
            appendTo: "body",
            drag: function (event, ui) {
                $(ui.helper).css({ "background": "white", "border": "1px dotted black", "width": "auto", "padding": "5px", "border-radius": "4" });
            }
        });
    };

    this.setColumnTree = function () {
        $(`#eb_mobtree_body_${this.Root.Conf.TabNum}`).animate({ width: ["toggle", "swing"] });
    };

    var tableCounter = 0;

    this.refreshColumnTree = function () {
        tableCounter = 0;
        let html = {};
        let container = $(this.Root.droparea).find(".mob_container");
        if (container.length <= 1 || container.length >= 0) {
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

        $(`#ds_parameter_list${this.Root.Conf.TabNum} ul[class='ds_cols']`).empty().append(htmlString);
        $(`#ds_parameter_list${this.Root.Conf.TabNum}`).killTree();
        $(`#ds_parameter_list${this.Root.Conf.TabNum}`).treed();
        $(".branch").click();
        this.makeTreeNodeDraggable();
    };

    var nonPersistControls = ["EbMobileTableLayout", "EbMobileDataGrid", "EbMobileFileUpload"];

    this.loopControlContainer = function (html, propName, i, o) {
        let jsobj = this.Root.Procs[o.id];
        let ebtype = this.Root.getType(jsobj.$type);
        if (nonPersistControls.includes(ebtype)) {
            if (ebtype === "EbMobileDataGrid") {
                html[jsobj.Name] = [];
                html[jsobj.Name].push(`<li><a>${jsobj.TableName || "Table " + tableCounter++}</a><ul>`);
                $(`#${jsobj.EbSid} .ctrl_as_container .control_container`).find(".mob_control").each(this.loopControlContainer.bind(this, html, jsobj.Name));
                html[jsobj.Name].push(`</ul></li>`);
            }
        }
        else {
            html[propName].push(`<li class='styl'>
                            <span eb-type='EbMobileDataColumn'
                                  ctrname="DataColumn"
                                  DbType='${jsobj.EbDbType}'
                                  ColName='${jsobj.Name}' 
                                  class='draggable_column'><i class='fa ${this.getIconByType(jsobj.EbDbType)} column_tree_typeicon'></i> ${jsobj.Name} 
                            </span>
                        </li>`);
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
        let eb_type = this.Root.getType(o.$type);

        delete this.Root.Procs[id];
        this.Root.pg.removeFromDD(id);

        if (eb_type === "mob_container") {
            this.Root.Procs = {};
            $(`#ds_parameter_list${this.Root.Conf.TabNum} ul[class='ds_cols']`).empty();
            $(`#eb_mobtree_body_${this.Root.Conf.TabNum}`).hide();
        }
        $(selector.$trigger).remove();
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
            if (rowcount > 2) {
                $row.remove();
            }
        }
        else if (eType === "delete_column") {
            let $cols = selector.$trigger.find(".eb_tablelayout_td:last-child");
            if ($cols.length > 1)
                $cols.remove();
        }
    };

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
        "TableLayout": {
            "add_row": { name: "Add Row", icon: "plus", callback: this.tableLayoutLinks.bind(this) },
            "add_column": { name: "Add Column", icon: "plus", callback: this.tableLayoutLinks.bind(this) },
            "delete_row": { name: "Delete Row", icon: "plus", callback: this.tableLayoutLinks.bind(this) },
            "delete_column": { name: "Delete Column", icon: "plus", callback: this.tableLayoutLinks.bind(this) }
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
        if (ebtype === "EbMobileTableLayout") {
            $.extend(m, this.ContextLinks["TableLayout"]);
        }
        return m;
    };

    this.initContextMenu();
}