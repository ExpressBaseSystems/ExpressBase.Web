(function (doc) {
    var d = doc || document;

    window.getCurrent = function () {
        var id = $("#versionTab .tab-pane.active").attr("id");
        let creator = window.MobilePage["Tab" + id.charAt(id.length - 1)].Creator;
        console.log("mode : " + creator.Mode);
        return creator.EbObject;
    };

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
            trigger: function (root) {
                this.tab = root.Conf.TabNum || "";
            },
            setObject: function () { return null; },
            propertyChanged: function (propname) { },
            blackListProps: [],
            refresh: function () { }
        };

        $.extend(o, common, window.expandable[constructor] || {});
    };

    window.expandable = {
        "EbMobileSimpleSelect": {
            getColumns: function (ds_refid, root) {
                //root is the main object
                root.dataSourceColumn(ds_refid, function (data) {
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
        "EbMobileGeoLocation": {
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
        "EbMobileTableLayout": {
            trigger: function (root) {
                this.tab = "Tab" + root.Conf.TabNum;
                $(`#${this.EbSid} .eb_mob_tablelayout_inner`).append(this.getHtml());
                this.droppable();
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
            droppable: function () {
                $(`#${this.EbSid} .eb_tablelayout_td`).droppable({
                    accept: ".draggable_column",
                    hoverClass: "drop-hover-td",
                    drop: this.onDrop.bind(this)
                });
            },
            onDrop: function (event, ui) {
                let dragged = $(ui.draggable);
                let ebtype = dragged.attr("eb-type");
                let ctrlname = dragged.attr("ctrname");
                let o = window.MobilePage[this.tab].Creator.makeElement(ebtype, ctrlname);
                $(event.target).append(o.$Control.outerHTML());

                if (ebtype === "EbMobileDataColumn") {
                    o.Type = dragged.attr("DbType");
                    o.ColumnName = dragged.attr("ColName");
                    o.ColumnIndex = dragged.attr("index");
                    o.TableIndex = dragged.attr("tableIndex");
                }
                window.MobilePage[this.tab].Creator.refreshControl(o);
            },
            resizable: function () {
                $(`#${this.EbSid} .eb_tablelayout_tr:first-child .eb_tablelayout_td:not(:last-child)`).resizable({
                    handles: "e",
                    stop: function () { }.bind(this)
                });
            },
            fillControls: function (cells, root) {
                for (let i = 0; i < cells.length; i++) {
                    let ctrls = cells[i].ControlCollection.$values;

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
                this.RowCount = $(`#${this.EbSid} .eb_tablelayout_tr`).length;
                this.ColumCount = $(`#${this.EbSid} .eb_tablelayout_tr:first-child .eb_tablelayout_td`).length;

                $(`#${this.EbSid} .eb_tablelayout_td`).each(function (i, td) {
                    let rowindex = $(td).closest(".eb_tablelayout_tr").index();
                    let colindex = $(td).index();

                    let cell = new EbObjects.EbMobileTableCell(`TableCell_${rowindex}_${colindex}`);
                    cell.RowIndex = rowindex;
                    cell.ColIndex = colindex;
                    cell.Width = parseFloat($(td).width() / $(`#${this.EbSid}`).width() * 100);

                    $(td).find(".mob_control").each(function (i, ctrl) {
                        let ebo = window.MobilePage[this.tab].Creator.Procs[ctrl.id];
                        cell.ControlCollection.$values.push(ebo);
                    }.bind(this));

                    this.CellCollection.$values.push(cell);
                }.bind(this));
            }
        },
        "EbMobileDataGrid": {
            trigger: function (root) {
                root.makeDropable(this.EbSid, "EbMobileForm");
                root.makeSortable(this.EbSid);

                let tobj = root.makeElement("EbMobileTableLayout", "TableLayout");
                $(`#${this.EbSid} .ctrl_as_container .data_layout`).append(tobj.$Control.outerHTML());
                if (root.Mode === "edit") {
                    $.extend(tobj, this.DataLayout || {});
                }
                tobj.trigger(root);
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
        "EbMobileNumericBox": {
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
        "EbMobileVisualization": {
            refresh: function (root) {
                if (this.hasOwnProperty("LinkTypeForm") && this.LinkTypeForm) {
                    root.pg.ShowProperty('FormMode');
                    root.pg.ShowProperty('LinkFormParameters');
                }
                else {
                    root.pg.HideProperty('FormMode');
                    root.pg.HideProperty('LinkFormParameters');
                }
            }
        }
    };
})(jQuery);

function PgHelperMobile(g) {

    this.grid = g;

    this.hideBlackListed = function (o) {
        let props = o.blackListProps;
        for (let i = 0; i < props.length; i++) {
            let el = this.grid.$PGcontainer.find(`tr[name="${props[i]}Tr"]`);

            if (el.prevAll(":visible:first").hasClass("pgGroupRow") && el.next(":visible:first").hasClass("pgGroupRow")) {
                el.prevAll(":visible:first").hide();
            }
            el.hide();
        }
    };
}