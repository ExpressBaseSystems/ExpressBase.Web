class DvBuilder {
    constructor(option) {
        this.type = option.ObjType || null;
        this.dsobj = option.DsObj || null;
        this.tabNum = option.TabNum || null;
        this.ssurl = option.ServiceUrl || null;
        this.wc = option.Wc;
        this.Tenantid = option.Cid;
        this.isNew = $.isEmptyObject(this.EbObject) ? true : false;
        this.objCollection = {};
        this.RefId = option.RefId || null;
        this.drake = null;
        this.Counter = -1;
        this.objCollection = {};

        this.propGrid = new Eb_PropertyGrid({
            id: "propGrid",
            wc: this.wc,
            cid: this.Tenantid,
            $extCont: $("#PGgrid-dv")
        });

        this.EbParams = {
            Icons: {
                "Numeric": "fa-sort-numeric-asc",
                "String": "fa-font",
                "DateTime": "fa-calendar",
                "Bool": ""
            },
            EbType: {
                "Numeric": "ParamNumeric",
                "String": "ParamText",
                "DateTime": "ParamDateTime",
                "Bool": "ParamBoolean"
            }
        };

        this.init();
    }

    init() {
        if (this.isNew)
            this.EbObject = new EbObjects["EbTableVisualization"]("Container_" + Date.now());
        else
            this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);

        this.propGrid.PropertyChanged = this.PropertyChanged.bind(this);
        this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
    }

    PropertyChanged(obj, pname) {
        if (pname === "DataSourceRefId") {
            this.getColumns(obj.DataSourceRefId);
        }
    }

    getColumns(refid) {
        if (refid !== "") {
            $("#get-col-loader").show();
            $.ajax({
                url: "../RB/GetColumns",
                type: "POST",
                cache: false,
                data: { refID: refid },
                success: function (result) {
                    $("#get-col-loader").hide();
                    if (result.columns) {
                        $("#data-table-list ul[id='dataSource']").empty();
                        this.drawDsColTree(result.columns);
                    }
                    //if (result.paramsList) {
                    //    $("#ds_parameter_list ul[id='ds_parameters']").empty();
                    //    this.drawDsParmsTree(result.paramsList);
                    //}
                }.bind(this)
            });
        }
    }

    drawDsColTree(colList) {
        var type, icon = "";
        this.EbObject.Columns.$values = colList[0];
        $.each(colList, function (i, columnCollection) {
            $("#data-table-list ul[id='dataSource']").append(" <li><a>Table " + i + "</a><ul id='t" + i + "' class='tablecolumns'></ul></li>");
            $.each(columnCollection, function (j, obj) {
                if (obj.type === 16) {
                    type = "DVStringColumn"; icon = this.EbParams.Icons["String"];
                }
                else if (obj.type === 7 || obj.type === 8 || obj.type === 10 || obj.type === 11 || obj.type === 12 || obj.type === 21) {
                    type = "DVNumericColumn"; icon = this.EbParams.Icons["Numeric"];
                }
                else if (obj.type === 3) {
                    type = "DVbooleanColumn"; icon = this.EbParams.Icons["Bool"];
                }
                else if (obj.type === 5 || obj.type === 6 || obj.type === 17 || obj.type === 26) {
                    type = "DVDateTimeColumn"; icon = this.EbParams.Icons["DateTime"];
                }
                $("#data-table-list ul[id='t" + i + "']").append(`<li class='styl' eb-type='${type}' DbType='${obj.type}' class='columns textval' style='font-size: 13px;'><i class='fa ${icon}'></i> ${obj.columnName}</li>`);
            }.bind(this));
        }.bind(this));
        $('#data-table-list').killTree();
        $('#data-table-list').treed();
        this.initializeDragula();
    }

    initializeDragula() {
        this.drake = new dragula([document.getElementById("t0"), document.getElementById("columns-list"), document.getElementById("orderby-list")], {
            accepts: this.acceptDrop.bind(this),
            copy:true
        });
        this.drake.off("drop").on("drop", this.columnsDrop.bind(this));
        //$('.columns').draggable({
        //    cancel: "a.ui-icon",
        //    revert: "invalid",
        //    helper: "clone",
        //    cursor: "move",
        //    appendTo: "body",
        //    drag: function (event, ui) {
        //        $(ui.helper).css({ "background": "white", "border": "1px dotted black", "width": "auto" });
        //        $(ui.helper).children(".shape-text").remove();
        //        $(ui.helper).children().find('i').css({ "font-size": "50px", "background-color": "transparent" });
        //    },
        //    //start: this.dragStartFirst.bind(this),
        //});
        //$('.xx').droppable({
        //    accept: ".columns",
        //    hoverClass: "drop-hover",
        //    drop: this.columnsDrop.bind(this)
        //});
    }

    acceptDrop(el, target, source, sibling) {
        return true;
    }

    columnsDrop(el, target, source, sibling) {
        this.Counter++;
        this.col = $(el);
        this.Objtype = this.col.attr('eb-type');
        var obj = new EbObjects[this.Objtype](this.Objtype + this.Counter);
        this.objCollection[this.Objtype + this.Counter] = obj;
        //this.propGrid.addToDD(obj);
        this.col.attr("id", obj.EbSid).attr("tabindex", "1");
        this.propGrid.setObject(obj, AllMetas[this.Objtype]);
        $("#" + obj.EbSid).off("click").on("click", this.elementOnFocus.bind(this));
    }

    elementOnFocus(e) {
        var obj = this.objCollection[e.target.id];
        var type = $(e.target).attr('eb-type');
        this.propGrid.setObject(obj, AllMetas[type]);
    }
}