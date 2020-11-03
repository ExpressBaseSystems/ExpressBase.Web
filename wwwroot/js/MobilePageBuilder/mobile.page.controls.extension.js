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
            trigger: function (root) {
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
                    accept: [Constants.DS_COLUMN, Constants.LIST_CONTROL].join(","),
                    hoverClass: "drop-hover-td",
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

                if (ebtype === "EbMobileDataColumn") {
                    o.Type = $dragged.attr("DbType");
                    o.ColumnName = $dragged.attr("ColName");
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
        EbMobileDataGrid: {
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
            propertyChanged: function (propname) {
                if (propname === "HorrizontalAlign") {
                    window.alignHorrizontally($(`#${this.EbSid}`), this.HorrizontalAlign);
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
                root.makeDropable(this.EbSid, "EbMobileDashBoard");
                root.makeSortable(this.EbSid);
            }
        },
        EbMobileLabel: {
            trigger: function (root) {
                if (root.ContainerType === "EbMobileVisualization") {
                    this.BindableParams.$values = root.ContainerObject.StaticParameters.$values;
                }
                setFontCss(this.Font, $(`#${this.EbSid}`));
            }
        }
    };
})(jQuery);