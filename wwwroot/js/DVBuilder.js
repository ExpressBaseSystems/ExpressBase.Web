class DvBuilder {
    constructor(option) {
        this.type = option.ObjType || null;
        this.EbObject = option.dvObj || null;
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
        this.tableHeaderCounter = 0;
        this.RwogroupCounter = 0;
        this.CurrentRowgroup = {};
        this.CurrentRowgroupkey = {};

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

        this.EventBind();
        this.init();
    }

    init() {
        if (this.isNew)
            this.EbObject = new EbObjects["EbTableVisualization"]("Container_" + Date.now());
        else {
            this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
            this.getColumns();
        }

        this.propGrid.PropertyChanged = this.PropertyChanged.bind(this);
        this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
    }

    EventBind() {
        $("#NewTableHeader").off("click").on("click", this.AddNewTableHeader.bind(this));
        $("#NewRowGroup").off("click").on("click", this.AddNewRowGroup.bind(this));
        $("#columns-list").off("focusin").on("focusin", this.ColumnDivFocused.bind(this));
    }

    PropertyChanged(obj, pname) {
        if (pname === "DataSourceRefId") {
            this.getColumns();
        }
    }

    getColumns() {
        $("#get-col-loader").show();
        $.ajax({
            url: "../DV/GetColumns",
            type: "POST",
            cache: false,
            data: { dvobjt: JSON.stringify(this.EbObject) },
            success: function (result) {
                this.EbObject = JSON.parse(result);
                this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
                $("#get-col-loader").hide();
                $("#data-table-list ul[id='dataSource']").empty();
                this.drawDsColTree();
                //if (result.paramsList) {
                //    $("#ds_parameter_list ul[id='ds_parameters']").empty();
                //    this.drawDsParmsTree(result.paramsList);
                //}
            }.bind(this)
        });
    }

    drawDsColTree() {
        var type, icon = "";
        $.each(this.EbObject.ColumnsCollection.$values, function (i, columnCollection) {
            $("#data-table-list ul[id='dataSource']").append(" <li><a>Table " + i + "</a><ul id='t" + i + "' class='tablecolumns'></ul></li>");
            $.each(columnCollection.$values, function (j, obj) {
                type = this.getType(obj.Type); icon = this.getIcon(obj.Type);
                $("#data-table-list ul[id='t" + i + "']").append(`<li eb-type='${type}' DbType='${obj.Type}' eb-index="${j}" eb-name="${obj.name}" class='columns textval' style='font-size: 13px;'><i class='fa ${icon}'></i> ${obj.name}</li>`);
            }.bind(this));
        }.bind(this));
        $('#data-table-list').killTree();
        $('#data-table-list').treed();
        this.initializeDragula();
        this.ColumnDropped();
        if (!this.isNew) {
            this.RowgroupColumnDropped();
        }
    }

    initializeDragula() {
        this.drake = new dragula([document.getElementById("columns-list-body")], {
            accepts: this.acceptDrop.bind(this),
            copy: true
        });
        for (var i = 0; i < $(".tablecolumns").length; i++) {
            this.drake.containers.push(document.getElementById("t" + i));
        }

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

    ColumnDivFocused() {
        this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
    }

    acceptDrop(el, target, source, sibling) {
        if ($(target).attr("id") === "columns-list-body" && $(source).hasClass("tablecolumns")) {
            let key = $(el).attr("eb-name");
            if (key in this.objCollection)
                return false;
            else
                return true;
        }
        if ($(target).attr("id") === "rowgroup_body" && $(source).hasClass("tablecolumns")) {
            let key = $(el).attr("eb-name");
            let obj = $.grep(this.CurrentRowgroup.RowGrouping.$values, function (obj) { return obj.name === key; });//n Or N
            if (obj.length === 0)
                return true;
            else
                return false;
        }
        return false;
    }

    columnsDrop(el, target, source, sibling) {
        if ($(target).attr("id") === "rowgroup_body") {
            this.RowgroupColumnDrop(el);
        }
        else if ($(target).attr("id") === "columns-list-body") {
            this.ColumnDropRelated(el);
            let index = this.col.attr('eb-index');
            this.EbObject.Columns.$values[index].bVisible = true;
            $(el).off("click").on("click", this.elementOnFocus.bind(this));
        }
        $(el).children(".close").off("click").on("click", this.RemoveColumn.bind(this));
    }

    elementOnFocus(e) {
        let key = $(e.target).closest("li").attr("eb-name");
        var obj = this.objCollection[key];
        var type = $(e.target).closest("li").attr('eb-type');
        this.propGrid.setObject(obj, AllMetas[type]);
    }

    AddNewTableHeader() {
        this.tableHeaderCounter++;
        if (this.tableHeaderCounter === 1) {
            $("#table_header1 .tool_item_head").append(`<i class="fa fa-trash" id="deleteTableHeader${this.tableHeaderCounter}"></i>`);
            $("#table_header1 .tool_item_head").after(`<div class="tool_item_headerbody"></div>`);
        }
        else {
            $("#table_header1 .fa-trash").remove();
            $("#table_header" + (this.tableHeaderCounter - 1)).after(`<div id="table_header${this.tableHeaderCounter}" class="dv-divs tableheader"  data-tableheaderCount="${this.tableHeaderCounter}">
                <div class="tool_item_head">
                    <i class="fa fa-caret-down"></i> <label>Table Header${this.tableHeaderCounter}</label>
                    <i class="fa fa-trash" id="deleteTableHeader${this.tableHeaderCounter}"></i>
                </div>
                <div class="tool_item_headerbody"></div>
            </div>`);
        }
        $(`#deleteTableHeader${this.tableHeaderCounter}`).off("click").on("click", this.deleteTableHeader.bind(this));
    }

    deleteTableHeader(e) {
        let headerCount = $(e.target).closest("tableheader").attr("tableheaderCount");
        if (this.tableHeaderCounter === 1) {
            $(e.target).parents().closest(".tool_item_head").siblings(".tool_item_headerbody").remove();
            $(e.target).closest(".fa-trash").remove();
            this.tableHeaderCounter--;
        }
        else {
            $(e.target).closest(".tableheader").remove();
            this.tableHeaderCounter--;
            if (this.tableHeaderCounter === 1) {
                $("#table_header1 .tool_item_head").append(`<i class="fa fa-trash" id="deleteTableHeader${this.tableHeaderCounter}"></i>`);
                $(`#deleteTableHeader${this.tableHeaderCounter}`).off("click").on("click", this.deleteTableHeader.bind(this));
            }
        }
    }

    ColumnDropped() {
        $.each(this.EbObject.Columns.$values, function (i, obj) {
            if (obj.bVisible) {
                let element = $(`<li eb-type='${this.getType(obj.Type)}' DbType='${obj.Type}' eb-index="${i}" eb-name="${obj.name}" class='columns textval' style='font-size: 13px;'><i class='fa ${this.getIcon(obj.Type)}'></i> ${obj.name}</li>`);
                this.ColumnDropRelated(element);
                $("#columns-list-body").append(element);
                $(element).off("click").on("click", this.elementOnFocus.bind(this));
                $(element).children(".close").off("click").on("click", this.RemoveColumn.bind(this));
            }
        }.bind(this));

    }

    RowgroupColumnDropped() {
        let type = "";
        let options = "";
        $.each(this.EbObject.RowGroupCollection.$values, function (i, objOuter) {
            this.RwogroupCounter++;
            $("#Rowgroup_cont #rowgroup_body").empty();
            if (i === 0) {
                this.MakeDiv4Rowgroup();
            }
            options = `<option value=${objOuter.Name}>${objOuter.DisplayName}</option>`;
            if (objOuter.$type.indexOf("MultipleLevelRowGroup") > -1) {
                type = "MultipleLevelRowGroup";
                this.RowgroupDropRelated(type, objOuter);
            }
            else {
                type = "SingleLevelRowGroup";
                this.RowgroupDropRelated(type, objOuter);
            }            
            this.drawRowgroupColumn(objOuter);
            $(".rowgroup_select").append(options);
        }.bind(this));
        $(".rowgroup_select").selectpicker();
        $('.rowgroup_select').on('changed.bs.select', this.RowgroupChanged.bind(this));
        $('.rowgroup_select option').eq(0).trigger("change");
    }

    getType(type) {
        if (type === 16) {
            return "DVStringColumn";
        }
        else if (type === 7 || type === 8 || type === 10 || type === 11 || type === 12 || type === 21) {
            return "DVNumericColumn";
        }
        else if (type === 3) {
            return "DVbooleanColumn";
        }
        else if (type === 5 || type === 6 || type === 17 || type === 26) {
            return "DVDateTimeColumn";
        }
    }

    getIcon(type) {
        if (type === 16) {
            return this.EbParams.Icons["String"];
        }
        else if (type === 7 || type === 8 || type === 10 || type === 11 || type === 12 || type === 21) {
            return this.EbParams.Icons["Numeric"];
        }
        else if (type === 3) {
            return this.EbParams.Icons["Bool"];
        }
        else if (type === 5 || type === 6 || type === 17 || type === 26) {
            return this.EbParams.Icons["DateTime"];
        }
    }

    ColumnDropRelated(el) {
        this.Counter++;
        this.col = $(el);
        this.Objtype = this.col.attr('eb-type');
        let name = this.col.attr('eb-name');
        let obj = {};
        if (this.isNew)
            obj = new EbObjects[this.Objtype](name);
        else
            obj = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.name === name; })[0];
        this.objCollection[name] = obj;
        //this.propGrid.addToDD(obj);
        this.col.attr("id", obj.EbSid).attr("tabindex", "1");
        this.propGrid.setObject(obj, AllMetas[this.Objtype]);
        this.AlldropElements(this.col);
    }

    RowgroupColumnDrop(el) {
        this.col = $(el);
        this.Objtype = this.col.attr('eb-type');
        let name = this.col.attr('eb-name');
        let obj = new EbObjects[this.Objtype](name);
        this.CurrentRowgroup.RowGrouping.$values.push(obj);
        this.AlldropElements(this.col);
    }

    RowgroupDropRelated(type, Rowobj) {
        this.Objtype = type;
        let name = Rowobj.Name;
        this.CurrentRowgroupkey = name;
        this.objCollection[name] = Rowobj;
        this.CurrentRowgroup = Rowobj;
        this.propGrid.setObject(Rowobj, AllMetas[this.Objtype]);
    }

    AlldropElements(el) {
        this.col = el;
        this.col.addClass("colTile");
        this.col.append(`<button class="close"> <i class="fa fa-close"></i> </button>`);
    }

    RemoveColumn(e) {
        let element = $(e.target).closest("li");
        let key = element.attr("eb-name");
        let index = element.attr("eb-index");
        delete this.objCollection[key];
        this.EbObject.Columns.$values[index].bVisible = false;
        element.remove();
    }

    AddNewRowGroup() {
        $("#Rowgroup_cont #rowgroup_body").empty();
        //if (this.CurrentRowgroup.RowGrouping.$values.length === 0)
        //    return false;
        //let emptyObject = this.check4EmptyRowgroupObject();
        //if (emptyObject)
        if (this.RwogroupCounter === 0) {
            this.MakeDiv4Rowgroup();
            $(".rowgroup_select").selectpicker();
            $('.rowgroup_select').on('changed.bs.select', this.RowgroupChanged.bind(this));
        }
        if (!jQuery.isEmptyObject(this.CurrentRowgroup)) {
            let index;
            let obj = $.grep(this.EbObject.RowGroupCollection.$values, function (obj, i) { return obj.Name === this.CurrentRowgroup.Name; }.bind(this));
            if (obj.length === 0) {
                this.EbObject.RowGroupCollection.$values.push(this.CurrentRowgroup);
                let options = `<option value=${this.CurrentRowgroup.Name}>${this.CurrentRowgroup.DisplayName}</option>`;
                $("select[class='rowgroup_select']").append(options);
                $(".rowgroup_select").selectpicker('refresh');
            }
            else
                this.EbObject.RowGroupCollection.$values[i] = this.CurrentRowgroup;
        }
        let type = $("select[class='rowgrouptype_select']").val();
        let obj = new EbObjects[type](type + this.RwogroupCounter);
        obj.DisplayName = obj.Name;
        this.RowgroupDropRelated(type, obj);
        this.RwogroupCounter++;
    }

    RemoveRowGroupColumn(e) {
        let element = $(e.target).closest("li");
        let key = element.attr("eb-name");
        this.CurrentRowgroup.RowGrouping.$values = this.CurrentRowgroup.RowGrouping.$values.filter((item) => item.Name !== key);
        element.remove();
    }

    RowgroupChanged(e, clickedIndex, isSelected, previousValue) {
        $("#Rowgroup_cont #rowgroup_body").empty();
        clickedIndex = typeof (clickedIndex) !== "undefined" ? clickedIndex: 0;
        let option = $(e.target).children("option").eq(clickedIndex);
        this.CurrentRowgroupkey = $(option).attr("value");
        let obj = this.objCollection[this.CurrentRowgroupkey];
        this.CurrentRowgroup = obj;
        this.propGrid.setObject(obj, AllMetas[this.Objtype]);
        this.drawRowgroupColumn(obj);
    }

    drawRowgroupColumn(objOuter) {
        $.each(objOuter.RowGrouping.$values, function (i, obj) {
            let element = $(`<li eb-type='${type}'  eb-name="${objOuter.Name}" class='columns textval' style='font-size: 13px;'><i class='fa ${this.getIcon(obj.Type)}'></i> ${obj.name}</li>`);
            this.AlldropElements(element);
            $("#rowgroup_body").append(element);
            $(element).children(".close").off("click").on("click", this.RemoveRowGroupColumn.bind(this));
        }.bind(this));
    }

    MakeDiv4Rowgroup() {
        $("#Rowgroup_cont").css("height", "100px");
        $("#Rowgroup_cont .tool_item_head").after(`<div class="tool_item_body" id="rowgroup_body"></div>`);
        let elements = `<input type="text" placeholder="Untitled..."><select class='rowgrouptype_select'><option value='SingleLevelRowGroup'>SingleLevelRowGroup</option><option value='MultipleLevelRowGroup'>MultipleLevelRowGroup</option></select><i class="fa fa-trash" id="deleteRowGroup"></i>`;
        $("#Rowgroup_cont .tool_item_head").append(elements);
        this.drake.containers.push(document.getElementById("rowgroup_body"));
        $("#Rowgroup_cont .tool_item_head").append("<select class='rowgroup_select'></select>");
        $("#deleteRowGroup").off("click").on("click", this.deleteRowgroup.bind(this));
        $(".rowgrouptype_select").selectpicker();
    }

    deleteRowgroup() {
        let obj = $.grep(this.EbObject.RowGroupCollection.$values, function (obj, i) { return obj.Name === this.CurrentRowgroup.Name; }.bind(this));
        if (obj.length !== 0) {
            this.RwogroupCounter--;
            this.EbObject.RowGroupCollection.$values = this.EbObject.RowGroupCollection.$values.filter((item) => item.Name !== this.CurrentRowgroupkey);
            $("select[class='rowgroup_select'] option[value='" + this.CurrentRowgroupkey+"']").remove();
            $(".rowgroup_select").selectpicker('refresh');
        }
        delete this.objCollection[this.CurrentRowgroupkey];
        $('.rowgroup_select option').eq(0).trigger("change");
        if ($('.rowgroup_select option').length === 0) {
            $("#Rowgroup_cont").css("height", "25px");
            $("#Rowgroup_cont .tool_item_head input").remove();
            $("#deleteRowGroup").remove();
            $(".rowgroup_select").remove();
            $(".rowgrouptype_select").remove();
            $("#rowgroup_body").remove();
            this.CurrentRowgroup = {};
        }
    }

    check4EmptyRowgroupObject() {
        let Outerobj = $.grep(Object.values(this.objCollection), function (obj) { return obj.$type.indexOf("MultipleLevelRowGroup") !== -1 || obj.$type.indexOf("SingleLevelRowGroup") !== -1; });
        if (Outerobj.length > 0) {
            let obj = $.grep(Outerobj, function (obj) { return obj.RowGrouping.$values.length === 0; });
            if (obj.length > 0)
                return obj;
            else
                return false;
        }
    }
}