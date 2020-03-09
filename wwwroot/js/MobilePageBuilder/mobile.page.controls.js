function MobileControls(root) {
    this.Root = root;

    this.InitVis = function (o) {
        let id = "Tab" + this.Root.Conf.TabNum + "_TableLayout" + CtrlCounters["MobileTableLayoutCounter"]++;
        var obj = new EbObjects.EbMobileTableLayout(id);
        this.Root.Procs[id] = obj;
        $(`#${o.EbSid} .eb_mob_container_inner .vis-table-container`).append(obj.$Control.outerHTML());

        if (this.Root.Mode === "edit") {
            $.extend(obj, this.Root.EditObj.Container.DataLayout);
        }

        $(`#${obj.EbSid} .eb_mob_tablelayout_inner`).append(this.getTableHtml(obj));
        this.makeFilterColsDropable(o);
        this.makeTdDropable(o);
        this.makeResizable(o);
        if (this.Root.Mode === "edit" && this.Root.EditObj !== null)
            this.renderVisOnEdit(obj);
    };

    this.makeFilterColsDropable = function (container) {
        $(`#${container.EbSid} .vis-filter-container`).droppable({
            accept: ".draggable_column",
            hoverClass: "drop-hover-td",
            drop: function (event, ui) {
                let dragged = $(ui.draggable);
                let id = "Tab" + this.Root.Conf.TabNum + "DataColumn" + CtrlCounters["MobileDataColumnCounter"]++;
                var obj = new EbObjects.EbMobileDataColumn(id);

                obj.Type = dragged.attr("DbType");
                obj.ColumnName = dragged.attr("ColName");
                obj.ColumnIndex = dragged.attr("index");
                obj.TableIndex = dragged.attr("tableIndex");

                this.Root.Procs[id] = obj;
                $(event.target).append(obj.$Control.outerHTML());
                this.Root.RefreshControl(obj);
                $("#" + obj.EbSid).off("focus");
            }.bind(this)
        });
    };

    this.renderVisOnEdit = function (o) {
        let cellcollection = this.Root.EditObj.Container.DataLayout.CellCollection.$values;
        for (let i = 0; i < cellcollection.length; i++) {
            this.renderCellControl(o, cellcollection[i]);
        }

        let filters = this.Root.EditObj.Container.Filters.$values;
        for (let i = 0; i < filters.length; i++) {
            this.renderFilter(filters[i]);
        }

        this.refreshList();
    };

    this.renderFilter = function (filterCol) {//render filter cols on edit
        let id = "Tab" + this.Root.Conf.TabNum + "DataColumn" + CtrlCounters["MobileDataColumnCounter"]++;
        var obj = new EbObjects.EbMobileDataColumn(id);
        $.extend(obj, filterCol);
        this.Root.Procs[id] = obj;
        $(".mob_container .vis-filter-container").append(obj.$Control.outerHTML());
        this.Root.RefreshControl(obj);
        $("#" + obj.EbSid).off("focus");
    };

    this.renderCellControl = function (eb_table, cell) {
        let ctrlCollection = cell.ControlCollection.$values;
        for (let k = 0; k < ctrlCollection.length; k++) {
            let id = "Tab" + this.Root.Conf.TabNum + "DataColumn" + CtrlCounters["MobileDataColumnCounter"]++;
            var obj = new EbObjects.EbMobileDataColumn(id);
            $.extend(obj, ctrlCollection[k]);
            this.Root.Procs[id] = obj;
            $(`#${eb_table.EbSid} tr:eq(${cell.RowIndex}) td:eq(${cell.ColIndex})`).append(obj.$Control.outerHTML());
            $(`#${eb_table.EbSid} tr:eq(${cell.RowIndex}) td:eq(${cell.ColIndex})`).not(":last-child").css("width", `${cell.Width}%`);
            this.Root.RefreshControl(obj);
            $(`#${obj.EbSid}`).off("focus").on("focus", this.Root.elementOnFocus.bind(this.Root));
        }
    };

    this.makeTdDropable = function (table) {
        $(`#${table.EbSid} .eb_tablelayout_td`).droppable({
            accept: ".draggable_column",
            hoverClass: "drop-hover-td",
            drop: this.onDropColumn.bind(this)
        });
    };

    this.makeResizable = function (o) {
        $(`#${o.EbSid} .eb_tablelayout_tr:first-child .eb_tablelayout_td:not(:last-child)`).resizable({
            handles: "e",
            stop: function () { this.refreshList(); }.bind(this)
        });
    };

    this.refreshList = function () {
        let html = $(`div[eb-type="EbMobileVisualization"] [eb-type="EbMobileTableLayout"]`).html();
        $(`div[eb-type="EbMobileVisualization"] .vis-preview-container`).html(`<div class="list_item">${html}</div>`);
    };

    this.onDropColumn = function (event, ui) {
        let dragged = $(ui.draggable);
        let id = "Tab" + this.Root.Conf.TabNum + "DataColumn" + CtrlCounters["MobileDataColumnCounter"]++;
        var obj = new EbObjects.EbMobileDataColumn(id);

        obj.Type = dragged.attr("DbType");
        obj.ColumnName = dragged.attr("ColName");
        obj.ColumnIndex = dragged.attr("index");
        obj.TableIndex = dragged.attr("tableIndex");

        this.Root.Procs[id] = obj;
        $(event.target).append(obj.$Control.outerHTML());
        this.Root.RefreshControl(obj);
        this.refreshList();
        $(`#${obj.EbSid}`).off("focus").on("focus", this.Root.elementOnFocus.bind(this.Root));
    };

    this.getListHtml = function () {
        let html = [];
        html.push(`<div class='eb_mob_listwraper'>
                        <div class='eb_mob_listinner'>
                            
                        </div>
                </div >`);
        return html.join("");
    };

    this.InitTableLayout = function (o) {
        $(`#${o.EbSid} .eb_mob_tablelayout_inner`).append(this.getTableHtml(o));
    };

    this.getTableHtml = function (o) {
        let html = [];
        html.push(`<table class='eb_tablelayout_table'>`);
        for (let i = 0; i < o.RowCount; i++) {
            html.push(`<tr class='eb_tablelayout_tr'>`);
            for (let k = 0; k < o.ColumCount; k++) {
                html.push('<td class="eb_tablelayout_td"></td>');
            }
            html.push(`</tr>`);
        }
        html.push(`</table>`);
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
                            <span eb-type='${ebtype}'
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

    this.initDataGrid = function (o) {
        this.Root.makeDropable(o.EbSid, "EbMobileForm");
        this.Root.makeSortable(o.EbSid);

        let id = "Tab" + this.Root.Conf.TabNum + "_TableLayout" + CtrlCounters["MobileTableLayoutCounter"]++;
        var obj = new EbObjects.EbMobileTableLayout(id);
        this.Root.Procs[id] = obj;
        $(`#${o.EbSid} .ctrl_as_container .data_layout`).append(obj.$Control.outerHTML());
        if (this.Root.Mode === "edit") {
            $.extend(obj, o.DataLayout || {});
        }

        $(`#${obj.EbSid} .eb_mob_tablelayout_inner`).append(this.getTableHtml(obj));
        this.makeTdDropable(obj);
        this.makeResizable(obj);
        return obj;
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
            this.Root.Controls.makeTdDropable(obj);
        }
        else if (eType === "add_column") {
            $table.find("tr").each(function (i, o) {
                $(o).append(`<td class="eb_tablelayout_td"></td>`);
            });
            this.Root.Controls.makeTdDropable(obj);
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

function SetControlFunctions(obj) {
    var Name = obj.constructor.name;
    var Functions = {
        "EbMobileSimpleSelect": null,
        "EbMobileGeoLocation": null
    };
    if (Name in Functions) {
        let o = window.ControlFunctions[Name];
        $.extend(obj, o);
    }
}

window.ControlFunctions = {
    "EbMobileSimpleSelect": {
        _getColumns: function (ds_refid, callback) {
            if (ds_refid !== "") {
                $.ajax({
                    url: "../RB/GetColumns",
                    type: "POST",
                    cache: false,
                    data: { refID: ds_refid },
                    beforeSend: function () { },
                    success: function (data) {
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
                                callback();
                            }
                            c++;
                        }.bind(this));
                    }.bind(this)
                });
            }
        }
    },
    "EbMobileGeoLocation": {
        _toggleSearchBar: function () {
            if (this.HideSearchBox) {
                $(`#${this.EbSid} .eb_mob_textbox`).hide();
            }
            else {
                $(`#${this.EbSid} .eb_mob_textbox`).show();
            }
        }
    }
}