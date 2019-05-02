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
        this.calcfieldCounter = 0;
        this.isCustomColumnExist = false;

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

    GenerateButtons() {
        this.CreateButtons();
    }

    CreateButtons() {
        let objid = null;
        if (this.EbObject.RefId)
            objid = this.EbObject.RefId.split("-")[3];
        $("#obj_icons ").empty();
        $("#obj_icons").append(`<a class='btn' id="preview" ><i class="fa fa-eye" aria-hidden="true"></i></a>`);
        $("#obj_icons").prepend(`<a class='btn' id="oldbuilder" href='../Eb_Object/index?objid=${objid}&objtype=16&buildermode=false'>
            <i class="fa fa-external-link" aria-hidden="true"></i></a>`);
        $("#preview").off("click").on("click", this.previewClick.bind(this));
    }

    previewClick() {
        commonO.Save().then(this.rendertable.bind(this));
    }

    rendertable(res) {
        setTimeout(function () { window.open(`../DV/dv?refid=${this.EbObject.RefId}`, '_blank');}.bind(this), 100);
    }

    init() {
        if (this.isNew)
            this.EbObject = new EbObjects["EbTableVisualization"]("Container_" + Date.now());
        else {
            this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
            this.check4Customcolumn();
            this.getColumns();//get Columncollection,parameter list
        }

        this.propGrid.PropertyChanged = this.PropertyChanged.bind(this);
        this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
        let objid = null;
        if (this.EbObject.RefId)
            objid = this.EbObject.RefId.split("-")[3];
        $("#obj_icons").prepend(`<a class='btn' id="oldbuilder" href='../Eb_Object/index?objid=${objid}&objtype=16&buildermode=false'><i class="fa fa-external-link" aria-hidden="true"></i></a>`);

        //commonO.saveOrCommitSuccess = this.rendertable.bind(this);
        //commonO.PreviewObject = function () {
        //    $("#preview_wrapper").empty();
        //    commonO.Save();
        //};

        //commonO.saveOrCommitSuccess = function (res) {
        //   this.renderTable();
        //}.bind(this);
    }

    //renderTable() {
    //    $.ajax({
    //        url: `../DV/dv?refid=${this.EbObject.RefId}`,
    //        type: "POST",
    //        cache: false,
    //        success: function (result) {
    //            $("#preview_wrapper").html(result);
    //            $("#btnGo").off("click").on("click", this.render.bind(this));
    //            if ($("#btnGo").length <= 0) {
    //                $("#sub_windows_sidediv_dv").hide();
    //                $("#content_dv").removeClass("col-md-9").addClass("col-md-12");
    //                $("#reportIframe").attr("src", `../ReportRender/RenderReport2?refid=${this.refid}`);
    //            }
    //        }.bind(this)
    //    });
    //}

    EventBind() {
        $("#NewTableHeader").off("click").on("click", this.AddNewTableHeader.bind(this));
        $("#NewRowGroup").off("click").on("click", this.AddNewRowGroup.bind(this));
        $("#columns-list").off("focusin").on("focusin", this.ColumnDivFocused.bind(this));
        $(".add_calcfield").on("click", this.newCalcFieldSum.bind(this));
    }

    PropertyChanged(obj, pname) {
        if (pname === "DataSourceRefId") {
            this.check4Customcolumn();
            this.getColumns();
        }
    }

    check4Customcolumn = function () {
        var temp = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.IsCustomColumn; });
        if (temp.length === 0)
            this.isCustomColumnExist = false;
        else
            this.isCustomColumnExist = true;
    };

    getColumns() {
        $("#get-col-loader").show();
        $.ajax({
            url: "../DV/GetColumns",
            type: "POST",
            cache: false,
            data: { dvobjt: JSON.stringify(this.EbObject), CustomColumn: this.isCustomColumnExist },
            success: function (result) {
                let returnobj = JSON.parse(result);
                this.EbObject.Columns.$values = returnobj.Columns.$values;
                this.EbObject.ColumnsCollection.$values = returnobj.ColumnsCollection.$values;
                this.EbObject.ParamsList.$values = returnobj.Paramlist.$values;
                this.EbObject.DSColumns.$values = returnobj.DsColumns.$values;
                commonO.Current_obj = this.EbObject;
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
                $("#data-table-list ul[id='t" + i + "']").append(`<li eb-type='${type}' DbType='${obj.Type}' eb-name="${obj.name}" class='columns textval' style='font-size: 13px;'><i class='fa ${icon}'></i> ${obj.name}</li>`);
            }.bind(this));
        }.bind(this));
        $('#data-table-list').killTree();
        $('#data-table-list').treed();
        this.initializeDragula();
        this.ColumnDropped();
        if (!this.isNew) {
            this.RowgroupColumnDropped();
            this.CreateButtons()
        }
    }

    initializeDragula() {
        this.drake = new dragula([document.getElementById("columns-list-body"), document.getElementById("calcfields-childul")], {
            accepts: this.acceptDrop.bind(this),
            copy: this.copyfunction.bind(this)
        });
        for (var i = 0; i < $(".tablecolumns").length; i++) {
            this.drake.containers.push(document.getElementById("t" + i));
        }

        this.drake.off("drop").on("drop", this.columnsDrop.bind(this));
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
        if ($(target).attr("id") === "columns-list-body" && $(source).attr("id") === "calcfields-childul") {
            let key = $(el).attr("eb-name");
            if (key in this.objCollection)
                return false;
            else
                return true;
        }
        if ($(target).attr("id") === "columns-list-body" && $(source).attr("id") === "columns-list-body") {
            return true;
        }
        return false;
    }

    copyfunction(el, source) {
        return $(source).attr("id") !== "columns-list-body";
    }

    columnsDrop(el, target, source, sibling) {
        if ($(target).attr("id") === "rowgroup_body") {
            this.RowgroupColumnDrop(el);
            $(el).children(".close").off("click").on("click", this.RemoveRowGroupColumn.bind(this));
        }
        else if ($(target).attr("id") === "columns-list-body" && $(source).attr("id") === "columns-list-body") {
            return true;
        }
        else if ($(target).attr("id") === "columns-list-body") {
            this.ColumnDropRelated(el);
            let name = $(el).attr("eb-name");
            let index = this.EbObject.Columns.$values.findIndex(function (obj) { return obj.name === name; }.bind(this));
            this.EbObject.Columns.$values[index].bVisible = true;
            $(el).off("click").on("click", this.elementOnFocus.bind(this));
            $(el).children(".close").off("click").on("click", this.RemoveColumn.bind(this));
        }
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
                let element = $(`<li eb-type='${this.getType(obj.Type)}' DbType='${obj.Type}'  eb-name="${obj.name}" class='columns textval' style='font-size: 13px;'><i class='fa ${this.getIcon(obj.Type)}'></i> ${obj.name}</li>`);
                this.ColumnDropRelated(element);
                $("#columns-list-body").append(element);
                $(element).off("click").on("click", this.elementOnFocus.bind(this));
                $(element).children(".close").off("click").on("click", this.RemoveColumn.bind(this));
            }
            if (obj.IsCustomColumn) {
                $("#calcFields ul[id='calcfields-childul']").append(`<li eb-type='${this.getType(obj.Type)}' DbType='${obj.Type}'  eb-name="${obj.name}" 
            class='columns textval' style='font-size: 13px;'><i class='fa ${this.getIcon(obj.Type)}'></i> ${obj.name}</li>`);
            }
        }.bind(this));
        $('#calcFields').killTree();
        $('#calcFields').treed();
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
        $('.rowgroup_select option').eq(1).trigger("change");
        $(".rowgroup_select").val(this.CurrentRowgroup.Name);
        $(".rowgroup_select").selectpicker('refresh');
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
        //if (this.isNew)
        //    obj = new EbObjects[this.Objtype](name);
        //else
        obj = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.name === name; })[0];
        this.objCollection[name] = obj;
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
        let index = this.EbObject.Columns.$values.findIndex(function (obj) { return obj.name === key; }.bind(this));
        delete this.objCollection[key];
        this.EbObject.Columns.$values[index].bVisible = false;
        element.remove();
    }

    AddNewRowGroup(e) {
        $(e.target).hide();
        $("#Rowgroup_cont #rowgroup_body").empty();
        if (this.RwogroupCounter === 0) {
            this.MakeDiv4Rowgroup();
            $(".rowgroup_select").selectpicker();
            $('.rowgroup_select').on('changed.bs.select', this.RowgroupChanged.bind(this));
        }
        else {
            if (this.CurrentRowgroup.RowGrouping.$values.length === 0) { return false; }
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
        this.CurrentRowgroup.RowGrouping.$values = this.CurrentRowgroup.RowGrouping.$values.filter((item) => item.name !== key);
        element.remove();
    }

    RowgroupChanged(e, clickedIndex, isSelected, previousValue) {
        $("#Rowgroup_cont #rowgroup_body").empty();
        clickedIndex = typeof (clickedIndex) !== "undefined" ? clickedIndex : $(`.rowgroup_select option[value='${this.CurrentRowgroup.Name}']`).index();
        let option = $(e.target).children("option").eq(clickedIndex);
        this.CurrentRowgroupkey = $(option).attr("value");
        let obj = this.objCollection[this.CurrentRowgroupkey];
        this.CurrentRowgroup = obj;
        this.propGrid.setObject(obj, AllMetas[this.Objtype]);
        this.drawRowgroupColumn(obj);
    }

    drawRowgroupColumn(objOuter) {
        $.each(objOuter.RowGrouping.$values, function (i, obj) {
            let element = $(`<li eb-type='${obj.Type}'  eb-name="${obj.name}" class='columns textval' style='font-size: 13px;'><i class='fa ${this.getIcon(obj.Type)}'></i> ${obj.name}</li>`);
            this.AlldropElements(element);
            $("#rowgroup_body").append(element);
            $(element).children(".close").off("click").on("click", this.RemoveRowGroupColumn.bind(this));
        }.bind(this));
    }

    MakeDiv4Rowgroup() {
        $("#Rowgroup_cont").css("height", "100px");
        $("#Rowgroup_cont .tool_item_head").after(`<div class="tool_item_body" id="rowgroup_body"></div>`);
        let elements = `<input type="text" placeholder="Untitled...">
            <select class='rowgrouptype_select'>
                <option value='SingleLevelRowGroup'>SingleLevelRowGroup</option>
                <option value='MultipleLevelRowGroup'>MultipleLevelRowGroup</option>
            </select><i class="fa fa-save" id="saveRowGroup"></i><i class="fa fa-trash" id="deleteRowGroup"></i>`;
        $("#Rowgroup_cont .tool_item_head").append(elements);
        this.drake.containers.push(document.getElementById("rowgroup_body"));
        $("#Rowgroup_cont .tool_item_head").append(`<select class='rowgroup_select' title="Choose one of the following..."></select>`);
        $("#deleteRowGroup").off("click").on("click", this.deleteRowgroup.bind(this));
        $("#saveRowGroup").off("click").on("click", this.SaveRowgroup.bind(this));
        $(".rowgrouptype_select").selectpicker();
    }

    deleteRowgroup() {
        let obj = $.grep(this.EbObject.RowGroupCollection.$values, function (obj, i) { return obj.Name === this.CurrentRowgroup.Name; }.bind(this));
        let objectExist = false;
        if (obj.length !== 0) {
            this.EbObject.RowGroupCollection.$values = this.EbObject.RowGroupCollection.$values.filter((item) => item.Name !== this.CurrentRowgroupkey);
            $("select[class='rowgroup_select'] option[value='" + this.CurrentRowgroupkey + "']").remove();
            $(".rowgroup_select").selectpicker('refresh');
            this.RwogroupCounter--;
            objectExist = true;
        }
        if (this.objCollection.hasOwnProperty(this.CurrentRowgroupkey)) {
            delete this.objCollection[this.CurrentRowgroupkey];
            if (!objectExist)
                this.RwogroupCounter--;
        }
        if ($('.rowgroup_select option').length > 1) {
            $('.rowgroup_select option').eq(1).trigger("change");
            $(".rowgroup_select").val(this.CurrentRowgroup.Name);
            $(".rowgroup_select").selectpicker('refresh');
        }
        if ($('.rowgroup_select option').length === 1) {
            $("#Rowgroup_cont").css("height", "25px");
            $("#Rowgroup_cont .tool_item_head input").remove();
            $("#deleteRowGroup").remove();
            $("#saveRowGroup").remove();
            $(".rowgroup_select").remove();
            $(".rowgrouptype_select").remove();
            $("#rowgroup_body").remove();
            this.CurrentRowgroup = {};
            this.RwogroupCounter = 0;
        }
        $("#NewRowGroup").show();
    }

    SaveRowgroup() {
        if (!jQuery.isEmptyObject(this.CurrentRowgroup)) {
            let index = this.EbObject.RowGroupCollection.$values.findIndex(function (obj) { return obj.Name === this.CurrentRowgroup.Name; }.bind(this));
            if (index === -1 && this.CurrentRowgroup.RowGrouping.$values.length > 0) {
                this.EbObject.RowGroupCollection.$values.push(this.CurrentRowgroup);
                let options = `<option value=${this.CurrentRowgroup.Name}>${this.CurrentRowgroup.DisplayName}</option>`;
                $("select[class='rowgroup_select']").append(options);
                $(".rowgroup_select").val(this.CurrentRowgroup.Name);
                $(".rowgroup_select").selectpicker('refresh');
                $("#NewRowGroup").show();
                $(`.rowgroup_select option[value='${this.CurrentRowgroup.Name}']`).trigger("change");

            }
            else if (index !== -1 && this.CurrentRowgroup.RowGrouping.$values.length > 0) {
                this.EbObject.RowGroupCollection.$values[index] = this.CurrentRowgroup;
                $("#NewRowGroup").show();
                $(`.rowgroup_select option[value='${this.CurrentRowgroup.Name}']`).trigger("change");
                $(".rowgroup_select").val(this.CurrentRowgroup.Name);
                $(".rowgroup_select").selectpicker('refresh');
            }
            else
                return false;
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

    newCalcFieldSum = function () {
        $("#eb_calcF_summarry").modal("toggle");
        $("#calcF_submit").off("click").on("click", this.addCalcField.bind(this));
    }

    addCalcField = function () {
        let ValueExpression = $("#calcF_valueExpr").val().trim();
        $("#eb_calcF_summarry").modal("toggle");
        if (ValueExpression)
            this.ValidateCalcExpression(ValueExpression);//returns the type of expression
    }

    ValidateCalcExpression = function (ValueExpression) {
        $.ajax({
            url: "../RB/ValidateCalcExpression",
            type: "POST",
            cache: false,
            data: {
                refid: this.EbObject.DataSourceRefId,
                expression: ValueExpression
            },
            success: function (result) {
                this.setCalcFieldType(ValueExpression, JSON.parse(result));
            }.bind(this)
        });
    }

    setCalcFieldType = function (ValueExpression, result) {
        let name = $("#calcF_name").val().trim();
        let type = this.getType(result.Type);
        let objid = type + this.calcfieldCounter++;
        let obj = new EbObjects[type](objid);
        this.objCollection[name] = obj;
        obj.name = name;
        obj.Title = obj.name;
        obj._Formula.Code = btoa(ValueExpression);
        obj._Formula.Lang = 1;
        obj.IsCustomColumn = true;
        obj.bVisible = true;
        obj.data = this.EbObject.Columns.$values.length;
        $("#calcFields ul[id='calcfields-childul']").append(`<li eb-type='${type}' DbType='${obj.Type}'  eb-name="${obj.name}" 
            class='columns textval' style='font-size: 13px;'><i class='fa ${this.getIcon(obj.Type)}'></i> ${obj.name}</li>`);
        this.addCalcFieldToColumnlist(obj);
        $('#calcFields').killTree();
        $('#calcFields').treed();
    }
    addCalcFieldToColumnlist(obj) {
        this.EbObject.Columns.$values.push(obj);
        let element = $(`<li eb-type='${this.getType(obj.Type)}' DbType='${obj.Type}' eb-name="${obj.name}" class='columns textval' style='font-size: 13px;'><i class='fa ${this.getIcon(obj.Type)}'></i> ${obj.name}</li>`);
        this.ColumnDropRelated(element);
        $("#columns-list-body").append(element);
        $(element).off("click").on("click", this.elementOnFocus.bind(this));
        $(element).children(".close").off("click").on("click", this.RemoveColumn.bind(this));
    }
}