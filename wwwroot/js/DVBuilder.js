(function ($) {
    $.each(['show', 'hide'], function (i, ev) {
        var el = $.fn[ev];
        $.fn[ev] = function () {
            this.trigger(ev);
            return el.apply(this, arguments);
        };
    });
})(jQuery);


//let AllMetas = AllMetasRoot["EbDataVisualizationObject"];// newly added line to declare a local variable named "AllMetas"  which contains contextaul metas

class DvBuilder {
    constructor(option) {
        this.type = option.ObjType || null;
        this.EbObject = option.dvObj || null;
        this.OldEbObject = null;
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
        this.isPreview = false;
        this.MisMatchedColumns = [];
        this.NewlyAddedColumns = [];
        this.returnobj = null;
        this.__OSElist = [];
        this.__oldValues = [];

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
        $("#obj_icons").append(`<a class='btn' id="preview" data-toggle="tooltip" data-placement="bottom" title="Preview"><i class="fa fa-eye" aria-hidden="true"></i></a>`);
        if(this.EbObject.DataSourceRefId)
            $("#obj_icons").append(`<button class='btn' id="refresh" data-toggle="tooltip" data-placement="bottom" title="Refresh"><i class="fa fa-refresh" aria-hidden="true"></i></button>`);
        $("#preview").off("click").on("click", this.previewClick.bind(this));
        $("#refresh").off("click").on("click", this.DatasourceModified.bind(this));
        if (this.EbObject.IsDataFromApi)
            this.GenerateRunbutton();
    }

    previewClick() {
        this.isPreview = true;
        commonO.Save();
    }

    rendertable() {
        this.SetColumnRef();
        if (this.isPreview)
            window.open(`../DV/dv?refid=${this.EbObject.RefId}`, '_blank');
        this.isPreview = false;
    }

    init() {
        if (this.isNew)
            this.EbObject = new EbObjects["EbTableVisualization"]("Container_" + Date.now());
        else {
            this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
            this.check4Customcolumn();
            if (this.EbObject.ColumnsCollection.$values.length === 0) {
                if(this.EbObject.DataSourceRefId)
                    this.getColumns();//get Columncollection,parameter list
                else
                    this.UrlModified();
            }
            else
                this.DrawBuilder();
        }
        this.propGrid.PropertyChanged = this.PropertyChanged.bind(this);
        this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
        commonO.saveOrCommitSuccess = this.rendertable.bind(this);
        commonO.Current_obj = this.EbObject;
    }

    EventBind() {
        $("#NewTableHeader").off("click").on("click", this.AddNewTableHeader.bind(this));
        $("#NewRowGroup").off("click").on("click", this.AddNewRowGroup.bind(this));
        $("#columns-list").off("click").on("click", this.ColumnDivFocused.bind(this));
        $("#add_calcfield").on("click", this.newCalcFieldSum.bind(this));
        $("#add_approvalColumn").on("click", this.DropApprovalColumn.bind(this));
        $("#add_actionColumn").on("click", this.DropActionColumn.bind(this));
        document.onkeydown = this.ColumnKeyMove.bind(this);
        $("#Rowgroup_submit").off("click").on("click", this.ShowRowgroupDiv.bind(this));
        $(".resized").resizable({
            animate: true,
            animateDuration: "fast",
            animateEasing: "easeOutBounce",
            handles: "n,s"
        });
    }

    PropertyChanged(obj, pname, newval, oldval) {

        if (pname === "DataSourceRefId") {
            this.OldDataSourceRefid = oldval;
            this.DatasourceModified();
        }
        else if (pname === "sTitle")
            $("#" + obj.name + "_columntitle").val(newval);
        else if (pname === "Url") {
            this.GenerateRunbutton();
        }
    }

    GenerateRunbutton() {
        if ($("#run").length === 0) {
            $("#obj_icons").append(`<button class='btn' id="run" data-toggle="tooltip" data-placement="bottom" title="Run"><i class="fa fa-play" aria-hidden="true"></i></button>`);
            $("#run").off("click").on("click", this.UrlModified.bind(this));
        }
    }

    UrlModified() {
        if (this.EbObject.IsDataFromApi && this.EbObject.Url) {
            $("#eb_common_loader").EbLoader("show");
            this.RemoveColumnRef();
            $.ajax({
                url: "../DV/GetColumnsFromApi",
                type: "POST",
                cache: false,
                data: { dvobjt: JSON.stringify(this.EbObject) },
                success: this.getcolumnSuccess.bind(this)
            });
        }
    }

    DatasourceModified() {
        this.check4Customcolumn();
        if (this.isCustomColumnExist) {
            EbDialog("show", {
                Message: "Retain Custom Columns?",
                Buttons: {
                    "Yes": {
                        Background: "green",
                        Align: "right",
                        FontColor: "white;"
                    },
                    "No": {
                        Background: "red",
                        Align: "left",
                        FontColor: "white;"
                    }
                },
                CallBack: this.dialogboxAction.bind(this)
            });
        }
        else
            this.getColumns();
    }

    DrawBuilder() {
        commonO.Current_obj = this.EbObject;
        $("#get-col-loader").hide();
        $("#eb_common_loader").EbLoader("hide");
        $("#data-table-list ul[id='dataSource']").empty();
        //if (result.paramsList) {
        //    $("#ds_parameter_list ul[id='ds_parameters']").empty();
        //    this.drawDsParmsTree(result.paramsList);
        //}
        this.drawDsColTree();
    }

    check4Customcolumn = function () {
        var temp = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.IsCustomColumn; });
        if (temp.length === 0)
            this.isCustomColumnExist = false;
        else
            this.isCustomColumnExist = true;
    };

    CheckforTree = function () {
        var temp = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.IsTree; });
        if (temp.length > 0) {
            this.IsTree = true;
            this.treeColumn = temp[0];
        }
    }

    dialogboxAction = function (value) {
        this.getColumns(value);
    }

    getColumns(value) {
        var isCustom = (typeof (value) !== "undefined") ? ((value === "Yes") ? true : false) : true;
        this.RemoveColumnRef();
        $("#get-col-loader").show();
        $("#eb_common_loader").EbLoader("show");
        $.ajax({
            url: "../DV/GetColumns",
            type: "POST",
            cache: false,
            data: { dvobjt: JSON.stringify(this.EbObject), CustomColumn: isCustom },
            success: this.getcolumnSuccess.bind(this)
        });
    }

    getcolumnSuccess(result) {
        this.MisMatchedColumns = [];
        this.NewlyAddedColumns = [];
        this.returnobj = JSON.parse(result);
        if (this.EbObject.Columns.$values.length > 0)
            this.checkOldAndNewColumns();
        this.RemoveDuplicateMismatchedColumns();
        if (this.MisMatchedColumns.length > 0 || this.NewlyAddedColumns.length > 0) {
            this.ShowMessagebox();
        }
        else {
            this.Columnconfirmation("Yes");
        }
    }

    checkOldAndNewColumns() {
        $.each(this.EbObject.Columns.$values, function (i, obj) {
            let temp = this.returnobj.ColumnOrginal.$values.filter((item) => item.name === obj.name && item.Type === obj.Type);
            if (temp.length === 0)
                this.MisMatchedColumns.push(obj);
        }.bind(this));

        this.checkNewColumns();
    }

    checkNewColumns() {
        $.each(this.returnobj.ColumnOrginal.$values, function (i, obj) {
            let temp = this.EbObject.Columns.$values.filter((item) => item.name === obj.name && item.Type === obj.Type);
            if (temp.length === 0)
                this.NewlyAddedColumns.push(obj);
        }.bind(this));
    }

    ShowMessagebox() {
        let RemovedTemparray = this.MisMatchedColumns.map(function (ob) { return ob.name; });
        let AddedTemparray = this.NewlyAddedColumns.map(function (ob) { return ob.name; });
        let _message = "";
        if (this.MisMatchedColumns.length > 0) {
            _message = "The columns " + RemovedTemparray.join(", ");
            _message += " not present in new data reader. It will be Removed from existing configurations..";
        }
        if (this.NewlyAddedColumns.length > 0) {
            if (_message !== "")
                _message += "And ";
            _message += "The Columns " + AddedTemparray.join(", ");
            _message += " present in new data reader. It will be Added..  Do u want to Continue ? ";
        }
        else {
            _message += "Do u want to Continue ? ";
        }
        EbDialog("show", {
            Message: _message,
            Buttons: {
                "Yes": {
                    Background: "green",
                    Align: "right",
                    FontColor: "white;"
                },
                "No": {
                    Background: "red",
                    Align: "left",
                    FontColor: "white;"
                }
            },
            CallBack: this.Columnconfirmation.bind(this)
        });
    }

    Columnconfirmation(flag) {
        if (flag === "Yes") {
            this.RemoveOldColumnsAndSetNewColumns();
            this.RemoveOldColumnsFromDependentObjects();
        }
        else {
            this.EbObject.DataSourceRefId = this.OldDataSourceRefid;
            commonO.Current_obj = this.EbObject;
            this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
            $("#get-col-loader").hide();
            $("#eb_common_loader").EbLoader("hide");
        }
    }

    RemoveOldColumnsAndSetNewColumns() {
        this.EbObject.Columns.$values = this.returnobj.Columns.$values;
        this.EbObject.ColumnsCollection.$values = this.returnobj.ColumnsCollection.$values;
        this.EbObject.ParamsList.$values = (this.returnobj.Paramlist === null) ? [] : this.returnobj.Paramlist.$values;
        this.EbObject.DSColumns.$values = this.returnobj.DsColumns.$values;
        this.DrawBuilder();
        this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
    }

    RemoveOldColumnsFromDependentObjects() {
        this.RemoveFromOrderbyObject();
        this.RemoveFromRowgroupObject();
        this.RemoveFromColumnObjects();
    }

    RemoveFromOrderbyObject() {
        $.each(this.EbObject.OrderBy.$values, function (i, obj) {
            let temp = this.EbObject.Columns.$values.filter((item) => item.name === obj.name && item.Type === obj.Type);
            if (temp.length === 0)
                this.EbObject.OrderBy.$values = this.EbObject.OrderBy.$values.filter(function (ob) { return ob.name !== obj.name; });
            else
                obj.data = temp[0].data;
        }.bind(this));
    }

    RemoveFromRowgroupObject() {
        $.each(this.EbObject.RowGroupCollection.$values, function (i, obj) {
            $.each(obj.RowGrouping.$values, function (j, col) {
                let temp = this.EbObject.Columns.$values.filter((item) => item.name === col.name && item.Type === col.Type);
                if (temp.length === 0)
                    this.EbObject.RowGroupCollection.$values[i].RowGrouping.$values = obj.RowGrouping.$values.filter(function (ob) { return ob.name !== col.name; });
                else
                    col.data = temp[0].data;
            }.bind(this));
            $.each(obj.OrderBy.$values, function (j, col) {
                let temp = this.returnobj.ColumnOrginal.$values.filter((item) => item.name === col.name && item.Type === col.Type);
                if (temp.length === 0)
                    this.EbObject.RowGroupCollection.$values[i].OrderBy.$values = obj.OrderBy.$values.filter(function (ob) { return ob.name !== col.name; });
                else
                    col.data = temp[0].data;
            }.bind(this));
        }.bind(this));
    }

    RemoveFromColumnObjects() {
        $.each(this.EbObject.Columns.$values, function (i, obj) {
            if (obj.IsTree) {
                this.RemoveOldColumnFromTreeColumn(obj);
            }
            if (obj.LinkRefId !== null) {
                if (parseInt(obj.LinkRefId.split("-")[2]) === EbObjectTypes.WebForm) {
                    this.RemoveOldColumnFromFormLink(obj);
                }
            }
            if (obj.InfoWindow.$values.length > 0) {
                this.RemoveFromInfoWindowObjects(obj);
            }
            //not checked for customcolumn
        }.bind(this));
    }

    RemoveOldColumnFromTreeColumn(treecol) {
        $.each(treecol.GroupFormId.$values, function (i, obj) {
            let temp = $.grep(this.EbObject.Columns.$values, function (ob) { return ob.name === obj.name; });
            if (temp.length === 0)
                treecol.GroupFormId.$values = treecol.GroupFormId.$values.filter(function (ob) { return ob.name !== obj.name; });
            else
                obj.data = temp[0].data;
        }.bind(this));
        $.each(treecol.GroupFormParameters.$values, function (i, obj) {
            let temp = $.grep(this.EbObject.Columns.$values, function (ob) { return ob.name === obj.name; });
            if (temp.length === 0)
                treecol.GroupFormParameters.$values = treecol.GroupFormParameters.$values.filter(function (ob) { return ob.name !== obj.name; });
            else
                obj.data = temp[0].data;
        }.bind(this));
        $.each(treecol.ItemFormId.$values, function (i, obj) {
            let temp = $.grep(this.EbObject.Columns.$values, function (ob) { return ob.name === obj.name; });
            if (temp.length === 0)
                treecol.ItemFormId.$values = treecol.ItemFormId.$values.filter(function (ob) { return ob.name !== obj.name; });
            else
                obj.data = temp[0].data;
        }.bind(this));
        $.each(treecol.ItemFormParameters.$values, function (i, obj) {
            let temp = $.grep(this.EbObject.Columns.$values, function (ob) { return ob.name === obj.name; });
            if (temp.length === 0)
                treecol.ItemFormParameters.$values = treecol.ItemFormParameters.$values.filter(function (ob) { return ob.name !== obj.name; });
            else
                obj.data = temp[0].data;
        }.bind(this));
        $.each(treecol.GroupingColumn.$values, function (i, obj) {
            let temp = $.grep(this.EbObject.Columns.$values, function (ob) { return ob.name === obj.name; });
            if (temp.length === 0)
                treecol.GroupingColumn.$values = treecol.GroupingColumn.$values.filter(function (ob) { return ob.name !== obj.name; });
            else
                obj.data = temp[0].data;
        }.bind(this));
        $.each(treecol.ParentColumn.$values, function (i, obj) {
            let temp = $.grep(this.EbObject.Columns.$values, function (ob) { return ob.name === obj.name; });
            if (temp.length === 0)
                treecol.ParentColumn.$values = treecol.ParentColumn.$values.filter(function (ob) { return ob.name !== obj.name; });
            else
                obj.data = temp[0].data;
        }.bind(this));
    }

    RemoveOldColumnFromFormLink(FormCol) {
        $.each(FormCol.FormId.$values, function (i, obj) {
            let temp = $.grep(this.EbObject.Columns.$values, function (ob) { return ob.name === obj.name; });
            if (temp.length === 0)
                FormCol.FormId.$values = FormCol.FormId.$values.filter(function (ob) { return ob.name !== obj.name; });
            else
                obj.data = temp[0].data;
        }.bind(this));
        $.each(FormCol.FormParameters.$values, function (i, obj) {
            let temp = $.grep(this.EbObject.Columns.$values, function (ob) { return ob.name === obj.name; });
            if (temp.length === 0)
                FormCol.FormParameters.$values = FormCol.FormParameters.$values.filter(function (ob) { return ob.name !== obj.name; });
            else
                obj.data = temp[0].data;
        }.bind(this));
    }

    RemoveFromInfoWindowObjects(infocol) {
        $.each(infocol.InfoWindow.$values, function (i, obj) {
            let temp = $.grep(this.EbObject.Columns.$values, function (ob) { return ob.name === obj.name; });
            if (temp.length === 0)
                infocol.InfoWindow.$values = infocol.InfoWindow.$values.filter(function (ob) { return ob.name !== obj.name; });
            else
                obj.data = temp[0].data;
        }.bind(this));
    }

    RemoveDuplicateMismatchedColumns() {
        this.MisMatchedColumns = this.MisMatchedColumns.filter((thing, index, self) =>
            index === self.findIndex((t) => (
                t.name === thing.name
            ))
        )

        this.MisMatchedColumns = this.MisMatchedColumns.filter((item) => !item.IsCustomColumn);
    }

    SetColumnRef() {
        $.each(this.EbObject.Columns.$values, function (i, obj) {
            obj.ColumnsRef = this.EbObject.Columns;
            obj.__OSElist = this.__OSElist[i];
            obj.__oldValues = this.__oldValues[i];
        }.bind(this));
    }

    drawDsColTree() {
        var type, icon = "";
        $.each(this.EbObject.ColumnsCollection.$values, function (i, columnCollection) {
            $("#data-table-list ul[id='dataSource']").append(" <li><a>Table " + i + "</a><ul id='t" + i + "' class='tablecolumns'></ul></li>");
            $.each(columnCollection.$values, function (j, obj) {
                if (!obj.IsCustomColumn) {
                    type = this.getType(obj.RenderType); icon = this.getIcon(obj.RenderType);
                    $("#data-table-list ul[id='t" + i + "']").append(`<li eb-type='${type}' DbType='${obj.Type}' eb-name="${obj.name}" class='' style='font-size: 13px;'><span><i class='fa ${icon}'></i> ${obj.name}</span></li>`);
                }
            }.bind(this));
        }.bind(this));
        $.each(this.EbObject.Columns.$values, function (i, obj) {
            if (obj.IsCustomColumn) {
                this.calcfieldCounter++;
                if (obj.$type.indexOf("DVApprovalColumn") > -1)
                    $("#ApprovalColumns ul[id='ApprovalColumns-childul']").append(`<li eb-type='DVApprovalColumn'  eb-name="${obj.name}" 
                    class='calcfield' style='font-size: 13px;'><span><i class='fa ${this.getIcon(obj.RenderType)}'></i> ${obj.name}</span></li>`);
                else if (obj.$type.indexOf("DVActionColumn") > -1)
                    $("#ActionColumns ul[id='ActionColumns-childul']").append(`<li eb-type='DVActionColumn'  eb-name="${obj.name}" 
                        class='calcfield' style='font-size: 13px;'><span><i class='fa ${this.getIcon(obj.RenderType)}'></i> ${obj.name}</span></li>`);
                else
                    $("#calcFields ul[id='calcfields-childul']").append(`<li eb-type='${this.getType(obj.RenderType)}' DbType='${obj.Type}'  eb-name="${obj.name}" 
                        class='calcfield' style='font-size: 13px;'><span><i class='fa ${this.getIcon(obj.RenderType)}'></i> ${obj.name}</span></li>`);

            }
        }.bind(this));
        $('#data-table-list').killTree();
        $('#data-table-list').treed();
        $('#calcFields').killTree();
        $('#calcFields').treed();
        $('#ApprovalColumns').killTree();
        $('#ApprovalColumns').treed();
        $('#ActionColumns').killTree();
        $('#ActionColumns').treed();
        this.SetContextmenu4CalcField();
        this.SetColumnRef();
        this.initializeDragula();
        this.ColumnDropped();
        this.RowgroupColumnDropped();
        this.OrderbyColumnDropped();
        if (!this.isNew) {
            this.CreateButtons();
        }
    }

    initializeDragula() {
        if (this.drake === null) {
            this.drake = new dragula([document.getElementById("columns-list-body"), document.getElementById("columns-list-orderby"), document.getElementById("calcfields-childul")], {
                accepts: this.acceptDrop.bind(this),
                copy: this.copyfunction.bind(this)
            });
        }
        else {
            this.drake.containers.push(document.getElementById("columns-list-body"));
            this.drake.containers.push(document.getElementById("columns-list-orderby"));
            this.drake.containers.push(document.getElementById("calcfields-childul"));
        }
        for (var i = 0; i < $(".tablecolumns").length; i++) {
            this.drake.containers.push(document.getElementById("t" + i));
        }

        this.drake.off("drop").on("drop", this.columnsDrop.bind(this));
    }

    ColumnDivFocused(e) {
        if ($(e.target).attr("id") === "columns-list-body") {
            $(".columnelemsCont").removeClass("focused focusedColumn");
            this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
        }
    }

    acceptDrop(el, target, source, sibling) {
        if ($(target).attr("id") === "columns-list-body" && $(source).hasClass("tablecolumns")) {
            let key = $(el).attr("eb-name");
            if (key in this.objCollection)
                return false;
            else
                return true;
        }
        if ($(target).hasClass("rowgroup_Inner_HeaderColumnCont") && $(source).hasClass("tablecolumns")) {
            let key = $(el).attr("eb-name");
            let obj = $.grep(this.CurrentRowgroup.RowGrouping.$values, function (obj) { return obj.name === key; });//n Or N
            if (obj.length === 0)
                return true;
            else
                return false;
        }
        if ($(target).hasClass("rowgroup_OrderbyCont") && $(source).hasClass("tablecolumns")) {
            let key = $(el).attr("eb-name");
            let obj = $.grep(this.CurrentRowgroup.OrderBy.$values, function (obj) { return obj.name === key; });//n Or N
            let obj1 = $.grep(this.CurrentRowgroup.RowGrouping.$values, function (obj) { return obj.name === key; });//n Or N
            if (obj.length === 0 && obj1.length === 0 && this.CurrentRowgroup.RowGrouping.$values.length > 0)
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
        if ($(target).attr("id") === "columns-list-orderby" && $(source).hasClass("tablecolumns")) {
            let key = $(el).attr("eb-name");
            let obj = $.grep(this.EbObject.OrderBy.$values, function (obj) { return obj.name === key; });//n Or N
            if (obj.length === 0)
                return true;
            else
                return false;
        }
        if ($(target).attr("id") === "columns-list-body" && $(source).attr("id") === "columns-list-body") {
            return true;
        }
        if ($(target).attr("id") === "columns-list-orderby" && $(source).attr("id") === "columns-list-orderby") {
            return true;
        }
        return false;
    }

    copyfunction(el, source) {
        if ($(source).attr("id") === "columns-list-orderby")
            return false;
        else if ($(source).attr("id") === "columns-list-body")
            return false;
        else
            return true;
    }

    columnsDrop(el, target, source, sibling) {
        if ($(target).hasClass("rowgroup_Inner_HeaderColumnCont")) {
            let name = $(el).attr("eb-name");
            $(el).attr("eb-keyname", this.CurrentRowgroup.Name);
            $(el).find("span").wrap(`<div id="${this.CurrentRowgroup.Name}_${name}_elemsrowgroupCont" class="columnelemsCont"><div id="${this.CurrentRowgroup.Name}_${name}_spanrowgroupCont" class="columnspanCont"></div></div>`);
            $(el).find(`#${this.CurrentRowgroup.Name}_${name}_spanrowgroupCont`).after(`<input class="rowgroupcolumntitle" type="text" id="${this.CurrentRowgroup.Name}_${name}_rowgroupcolumntitle"/>`);
            this.RowgroupColumnDrop(el);
            $(el).find(".close").off("click").on("click", this.RemoveRowGroupColumn.bind(this));
            let index = this.EbObject.Columns.$values.findIndex(function (obj) { return obj.name === name; }.bind(this));
            $(`#${this.CurrentRowgroup.Name}_${name}_rowgroupcolumntitle`).val(this.EbObject.Columns.$values[index].sTitle);
            $(".rowgroupcolumntitle").off("change").on("change", this.RowgroupColumnTitleChanged.bind(this));
        }
        else if ($(target).hasClass("rowgroup_OrderbyCont")) {
            let name = $(el).attr("eb-name");
            $(el).attr("eb-keyname", this.CurrentRowgroup.Name);
            $(el).find("span").wrap(`<div id="${this.CurrentRowgroup.Name}_${name}_elemsrowgrouporderbyCont" class="columnelemsCont"></div>`);
            $(el).find("span").after(`<span class="spancheck"><input id="${this.CurrentRowgroup.Name}_${name}_rowgroupOrderbyCheckbox" type="checkbox" class="rowgrouporderbycheckbox" checked data-toggle="toggle" data-size="mini" data-onstyle="default"/></span>`);
            this.RowgroupOrderbyColumnDrop(el);
            $(el).find(".close").off("click").on("click", this.RemoveRowGroupOrderbyColumn.bind(this));
            $(`#${this.CurrentRowgroup.Name}_${name}_rowgroupOrderbyCheckbox`).bootstrapToggle({
                on: 'Asc',
                off: 'Desc'
            });
            $(`#${this.CurrentRowgroup.Name}_${name}_rowgroupOrderbyCheckbox`).off("change").on("change", this.RowgroupOrderbyCheckboxChanged.bind(this));
        }
        else if ($(target).attr("id") === "columns-list-body" && $(source).attr("id") === "columns-list-body") {
            //this.ReplaceObjects(el, target, source, sibling);
        }
        else if ($(target).attr("id") === "columns-list-body") {
            let name = $(el).attr("eb-name");
            $(el).attr("eb-keyname", name);
            $(el).addClass("column");
            $(el).find("span").wrap(`<div id="${name}_elemsCont" class="columnelemsCont"><div id="${name}_spanCont" class="columnspanCont"></div></div>`);
            $(el).find(`#${name}_spanCont`).after(`<input class="columntitle" type="text" id="${name}_columntitle"/>`);
            this.ColumnDropRelated(el);
            let index = this.EbObject.Columns.$values.findIndex(function (obj) { return obj.name === name; }.bind(this));
            this.EbObject.Columns.$values[index].bVisible = true;
            $(el).off("click").on("click", this.elementOnFocus.bind(this));
            $(el).find(".close").off("click").on("click", this.RemoveColumn.bind(this));
            $(`#${name}_columntitle`).val(this.EbObject.Columns.$values[index].sTitle);
            $(".columntitle").off("change").on("change", this.ColumnTitleChanged.bind(this));
            $(".columntitle").not(`#${name}_columntitle`).prop("disabled", true);
            $(".columnelemsCont").removeClass("focused focusedColumn");
            $(`#${name}_elemsCont`).addClass("focused focusedColumn");
        }
        else if ($(target).attr("id") === "columns-list-orderby" && $(source).attr("id") === "columns-list-orderby") {
            //this.ReplaceObjects(el, target, source, sibling);
        }
        else if ($(target).attr("id") === "columns-list-orderby") {
            let name = $(el).attr("eb-name");
            $(el).attr("eb-keyname", name + "orderby");
            $(el).find("span").wrap(`<div id="${name}_elemsorderbyCont" class="columnelemsCont"></div>`);
            $(el).find("span").after(`<span class="spancheck"><input id="${name}_orderbyCheckbox" type="checkbox" class="orderbycheckbox" checked data-toggle="toggle" data-size="mini" data-onstyle="default"/></span>`);
            this.OrderbyColumnDropRelated(el);
            let obj = this.EbObject.Columns.$values.filter(function (obj) { return obj.name === name; }.bind(this))[0];
            this.EbObject.OrderBy.$values.push(obj);
            $(el).off("click").on("click", this.elementOnFocus.bind(this));
            $(el).find(".close").off("click").on("click", this.RemoveOrderbyColumn.bind(this));
            $(`#${obj.name}_orderbyCheckbox`).bootstrapToggle({
                on: 'Asc',
                off: 'Desc'
            });
            $(`#${obj.name}_orderbyCheckbox`).off("change").on("change", this.OrderbyCheckboxChanged.bind(this));
        }
    }

    elementOnFocus(e) {
        $(e.target).closest("li").focusin();
        $("#page-outer-cont").find(".columnelemsCont").removeClass("focused focusedColumn");
        let key = $(e.target).closest("li").attr("eb-keyname");
        var obj = this.objCollection[key];
        var type = $(e.target).closest("li").attr('eb-type');
        this.propGrid.setObject(obj, AllMetas[type]);
        $(e.target).closest(".columnelemsCont").addClass("focusedColumn");
        if (!$(e.target).is("input")) {
            $(e.target).closest(".columnelemsCont").addClass("focused");
        }
        else {
            $(e.target).closest(".columnelemsCont").removeClass("focused");
        }
    }

    AddNewTableHeader() {
        //this.tableHeaderCounter++;
        if (this.tableHeaderCounter === 0) {
            this.tableHeaderCounter++;
            $("#table_header1 .tool_item_head").append(`<i class="fa fa-trash" id="deleteTableHeader${this.tableHeaderCounter}"></i>`);
            $("#table_header1 .tool_item_head").after(`<div class="tool_item_headerbody"></div>`);
        }
        //else {
        //    $("#table_header1 .fa-trash").remove();
        //    $("#table_header" + (this.tableHeaderCounter - 1)).after(`<div id="table_header${this.tableHeaderCounter}" class="dv-divs tableheader"  data-tableheaderCount="${this.tableHeaderCounter}">
        //        <div class="tool_item_head">
        //            <i class="fa fa-caret-down"></i> <label>Table Header${this.tableHeaderCounter}</label>
        //            <i class="fa fa-trash" id="deleteTableHeader${this.tableHeaderCounter}"></i>
        //        </div>
        //        <div class="tool_item_headerbody"></div>
        //    </div>`);
        //}
        $(`#deleteTableHeader${this.tableHeaderCounter}`).off("click").on("click", this.deleteTableHeader.bind(this));
    }

    deleteTableHeader(e) {
        let headerCount = $(e.target).closest("tableheader").attr("tableheaderCount");
        if (this.tableHeaderCounter === 1) {
            $(e.target).parents().closest(".tool_item_head").siblings(".tool_item_headerbody").remove();
            $(e.target).closest(".fa-trash").remove();
            this.tableHeaderCounter--;
        }
        //else {
        //    $(e.target).closest(".tableheader").remove();
        //    this.tableHeaderCounter--;
        //    if (this.tableHeaderCounter === 1) {
        //        $("#table_header1 .tool_item_head").append(`<i class="fa fa-trash" id="deleteTableHeader${this.tableHeaderCounter}"></i>`);
        //        $(`#deleteTableHeader${this.tableHeaderCounter}`).off("click").on("click", this.deleteTableHeader.bind(this));
        //    }
        //}
    }

    ColumnDropped() {
        $("#columns-list-body").empty();
        $.each(this.EbObject.Columns.$values, function (i, obj) {
            if (obj.bVisible) {
                let type = this.getType(obj.RenderType);
                if (obj.$type.indexOf("DVApprovalColumn") > -1)
                    type = "DVApprovalColumn";
                else if (obj.$type.indexOf("DVActionColumn") > -1)
                    type = "DVActionColumn";
                let element = $(`<li eb-type='${type}' DbType='${obj.Type}'  eb-name="${obj.name}" eb-keyname="${obj.name}" class='column' style='font-size: 13px;'><div id="${obj.name}_elemsCont" class="columnelemsCont"><div id="${obj.name}_spanCont" class="columnspanCont"><span><i class='fa ${this.getIcon(obj.RenderType)}'></i> ${obj.name}</span></div><input class="columntitle" type="text" id="${obj.name}_columntitle"/></div></li>`);
                this.ColumnDropRelated(element);
                $("#columns-list-body").append(element);
                $(element).off("click").on("click", this.elementOnFocus.bind(this));
                $(element).find(".close").off("click").on("click", this.RemoveColumn.bind(this));
                $(`#${obj.name}_columntitle`).val(obj.sTitle);
                $(".columntitle").off("change").on("change", this.ColumnTitleChanged.bind(this));
            }
        }.bind(this));
    }

    OrderbyColumnDropped() {
        $("#columns-list-orderby").empty();
        $.each(this.EbObject.OrderBy.$values, function (i, obj) {
            let element = $(`<li eb-type='${this.getType(obj.RenderType)}' DbType='${obj.Type}'  eb-name="${obj.name}"  eb-keyname="${obj.name}orderby" class='columns textval' style='font-size: 13px;'><div id="${obj.name}_elemsorderbyCont" class="columnelemsCont"><span><i class='fa ${this.getIcon(obj.RenderType)}'></i> ${obj.name}</span></div></li>`);
            this.OrderbyColumnDropRelated(element);
            $("#columns-list-orderby").append(element);
            $(element).find("span").after(`<span class="spancheck"><input id="${obj.name}_orderbyCheckbox" type="checkbox" class="orderbycheckbox" checked data-toggle="toggle" data-size="mini" data-onstyle="default"/></span>`);

            $(`#${obj.name}_orderbyCheckbox`).bootstrapToggle({
                on: 'Asc',
                off: 'Desc'
            });
            $(`#${obj.name}_orderbyCheckbox`).off("change").on("change", this.OrderbyCheckboxChanged.bind(this));

            if (obj.Direction === parseInt(EbEnums.OrderByDirection.ASC))
                $(`#${obj.name}_orderbyCheckbox`).bootstrapToggle("on");
            else
                $(`#${obj.name}_orderbyCheckbox`).bootstrapToggle("off");
            $(element).off("click").on("click", this.elementOnFocus.bind(this));
            $(element).find(".close").off("click").on("click", this.RemoveOrderbyColumn.bind(this));
        }.bind(this));
    }

    RowgroupColumnDropped() {
        $("#Rowgroup_Inner_cont .rowgroup_outercont").remove();
        $.each(this.EbObject.RowGroupCollection.$values, function (i, objOuter) {
            this.ShowRowgroupDiv(objOuter);
            this.drawRowgroupColumn(objOuter);
            this.drawRowgroupOrderByColumn(objOuter);
        }.bind(this));
    }

    ColumnDropRelated(el) {
        this.Counter++;
        this.col = $(el);
        this.Objtype = this.col.attr('eb-type');
        let name = this.col.attr('eb-name');
        let obj = {};
        obj = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.name === name; })[0];
        this.objCollection[name] = obj;
        this.col.attr("id", obj.EbSid).attr("tabindex", "1");
        this.propGrid.setObject(obj, AllMetas[this.Objtype]);
        this.AllColumndropElements(this.col);
    }

    OrderbyColumnDropRelated(el) {
        this.col = $(el);
        let name = this.col.attr('eb-name');
        let keyname = this.col.attr('eb-keyname');
        let obj = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.name === name; })[0];
        this.objCollection[keyname] = obj;
        this.col.attr("id", obj.EbSid).attr("tabindex", "1");
        this.Objtype = this.col.attr('eb-type');
        this.propGrid.setObject(obj, AllMetas[this.Objtype]);
        this.AllOtherColumndropElements(this.col);
    }

    RowgroupColumnDrop(el) {
        this.col = $(el);
        this.Objtype = this.col.attr('eb-type');
        let name = this.col.attr('eb-name');
        let obj = this.EbObject.Columns.$values.filter(function (obj) { return obj.name === name; })[0];
        this.CurrentRowgroup.RowGrouping.$values.push(obj);
        this.AllOtherColumndropElements(this.col);
        this.ColumnAppendToRowgroupOrderByDiv(this.CurrentRowgroup, obj, true);
    }

    RowgroupOrderbyColumnDrop(el) {
        this.col = $(el);
        this.Objtype = this.col.attr('eb-type');
        let name = this.col.attr('eb-name');
        let obj = this.EbObject.Columns.$values.filter(function (obj) { return obj.name === name; })[0];
        this.CurrentRowgroup.OrderBy.$values.push(obj);
        this.AllOtherColumndropElements(this.col);
    }

    AllColumndropElements(el) {
        let name = $(el).attr("eb-name");
        this.col = el;
        this.col.addClass("colTile1");
        this.col.find(`#${name}_columntitle`).after(`<button class="close close1"> <i class="fa fa-close"></i> </button>`);
    }

    AllOtherColumndropElements(el) {
        let name = $(el).attr("eb-name");
        this.col = el;
        this.col.addClass("colTile1");
        this.col.find(`.columnelemsCont`).append(`<button class="close"> <i class="fa fa-close"></i> </button>`);
    }

    RemoveColumn(e) {
        let element;
        if (e.target)
            element = $(e.target).closest("li");
        else
            element = e;
        let key = element.attr("eb-name");
        let index = this.EbObject.Columns.$values.findIndex(function (obj) { return obj.name === key; }.bind(this));
        delete this.objCollection[key];
        this.EbObject.Columns.$values[index].bVisible = false;
        $("#page-outer-cont").find(".focused").removeClass("focused focusedColumn");
        if (element.next().length === 1) {
            element.next().find(".columnelemsCont").addClass("focused focusedColumn");
        }
        else {
            element.prev().find(".columnelemsCont").addClass("focused focusedColumn");
        }
        element.remove();
    }

    RemoveOrderbyColumn(e) {
        let element;
        if (e.target)
            element = $(e.target).closest("li");
        else
            element = e;
        let key = element.attr("eb-name");
        this.EbObject.OrderBy.$values = this.EbObject.OrderBy.$values.filter(function (obj) { return obj.name !== key; }.bind(this));
        $("#page-outer-cont").find(".focused").removeClass("focused focusedColumn");
        if (element.next().length === 1) {
            element.next().find(".columnelemsCont").addClass("focused focusedColumn");
        }
        else {
            element.prev().find(".columnelemsCont").addClass("focused focusedColumn");
        }
        element.remove();
        key = element.attr("eb-keyname");
        delete this.objCollection[key];
    }

    OrderbyCheckboxChanged(e) {
        let name = $(e.target).closest("li").attr("eb-name");
        let obj = this.EbObject.Columns.$values.filter(function (obj) { return obj.name === name; }.bind(this))[0];
        if ($(e.target).is(":checked"))
            obj.Direction = parseInt(EbEnums.OrderByDirection.ASC);
        else
            obj.Direction = parseInt(EbEnums.OrderByDirection.DESC);
    }

    RowgroupOrderbyCheckboxChanged(e) {
        let name = $(e.target).closest("li").attr("eb-name");
        let obj = this.CurrentRowgroup.OrderBy.$values.filter(function (obj) { return obj.name === name; }.bind(this));
        if (obj.length === 0)
            obj = this.CurrentRowgroup.RowGrouping.$values.filter(function (obj) { return obj.name === name; }.bind(this));
        if ($(e.target).is(":checked"))
            obj[0].Direction = parseInt(EbEnums.OrderByDirection.ASC);
        else
            obj[0].Direction = parseInt(EbEnums.OrderByDirection.DESC);
    }

    ColumnTitleChanged(e) {
        let name = $(e.target).closest("li").attr("eb-name");
        let obj = this.EbObject.Columns.$values.filter(function (obj) { return obj.name === name; }.bind(this))[0];
        obj.sTitle = $(e.target).val();
        var type = $(e.target).closest("li").attr('eb-type');
        this.propGrid.setObject(obj, AllMetas[type]);
        if (this.CurrentRowgroup.Name)
            $(`#${this.CurrentRowgroup.Name}_${name}_rowgroupcolumntitle`).val(obj.sTitle);
        this.RowgroupObjectchanges(obj);
    }

    RowgroupColumnTitleChanged(e) {
        let name = $(e.target).closest("li").attr("eb-name");
        let obj = this.EbObject.Columns.$values.filter(function (obj) { return obj.name === name; }.bind(this))[0];
        obj.sTitle = $(e.target).val();
        var type = $(e.target).closest("li").attr('eb-type');
        $(`#${name}_columntitle`).val(obj.sTitle);
        this.propGrid.setObject(obj, AllMetas[type]);
        this.RowgroupObjectchanges(obj);
    }

    RowgroupObjectchanges(obj) {
        $.each(this.EbObject.RowGroupCollection.$values, function (i, _rowgroupobj) {
            $.each(_rowgroupobj.RowGrouping.$values, function (j, _col) {
                if (_col.name === obj.name) {
                    _rowgroupobj.RowGrouping.$values[j] = obj;
                }
            });
        });
    }

    ColumnKeyMove(e) {
        let curElement = $("#page-outer-cont").find(".focused").parent("li");
        if (curElement.length === 1) {
            if (e.which === 39 || e.which === 40) {
                let nextElement = $(curElement).next();
                if (nextElement.length === 1) {
                    $(curElement).find(".columnelemsCont").removeClass("focused focusedColumn");
                    $(nextElement).find(".columnelemsCont").addClass("focused focusedColumn");
                    $(nextElement).find(".columnelemsCont").trigger("click");
                }
            }
            else if (e.which === 37 || e.which === 38) {
                let prevElement = $(curElement).prev();
                if (prevElement.length === 1) {
                    $(curElement).find(".columnelemsCont").removeClass("focused focusedColumn");
                    $(prevElement).find(".columnelemsCont").addClass("focused focusedColumn");
                    $(prevElement).find(".columnelemsCont").trigger("click");
                }
            }
            else if (e.which === 46) {
                if (curElement.parent("#columns-list-body").length === 1) {
                    this.RemoveColumn(curElement);
                }
                else if (curElement.parent("#columns-list-orderby").length === 1) {
                    this.RemoveOrderbyColumn(curElement);
                }
            }
        }
    }

    AddNewRowGroup(e) {
        e.stopPropagation();
        if (this.EbObject.Columns.$values.length > 0) {
            $("#RowgroupModal").modal("show");
            $("#rowgroup_name").val("");
        }
        else
            alert("Pls select Data reader");
    }

    ShowRowgroupDiv(objouter) {
        $(`#Rowgroup_${this.RwogroupCounter}_innerCont`).hide();
        if (objouter.Name)
            this.GetRowGroupObject(objouter);
        else
            this.CreateRowGroupObject();
        if (this.RwogroupCounter > 0) {
            let div = `<div id="Rowgroup_${this.RwogroupCounter}_Outercont" class="rowgroup_outercont">
                                    <div id="Rowgroup_${this.RwogroupCounter}_Header" class="rowgroup_header" >
                                        <div id="Rowgroup_${this.RwogroupCounter}_Collapse"class="rowgroup_collapse_button headeritems"><i class="fa fa-caret-down"></i></div>
                                        <input type="text" id="Rowgroup_${this.RwogroupCounter}_displayname" placeholder="Display Name Here..." class="rowgroup_name headeritems" value="Untitled.....">
                                        <select class='rowgrouptype_select headeritems' id="Rowgroup_${this.RwogroupCounter}_typeselect" tabindex="1">
                                            <option value='SingleLevelRowGroup'>Single Level</option>
                                            <option value='MultipleLevelRowGroup'>Multi Level</option>
                                        </select>
                                        <i class="fa fa-trash headeritems" id="DeleteRowGroup_${this.RwogroupCounter}" tabindex="1"></i>
                                    </div>
                                    <div id="Rowgroup_${this.RwogroupCounter}_innerCont" class="col-md-12 Rowgroup_innerCont" data-key="${this.CurrentRowgroup.Name}">
                                        <div id="Rowgroup_${this.RwogroupCounter}_ColumnCont" class="col-md-9 rowgroup_Outer_ColumnCont">
                                            <div id="Rowgroup_${this.RwogroupCounter}_Header_columns" class="rowgroup_Inner_HeaderColumnCont">
                                                <div id="Rowgroup_${this.RwogroupCounter}_Header_columns_header" class="rowgroup_controlfit">Rowgroup Columns</div>
                                            </div>
                                            <div id="Rowgroup_${this.RwogroupCounter}_Footer_columns" class="rowgroup_Inner_FooterColumnCont">
                                                <div id="Rowgroup_${this.RwogroupCounter}_Footer_columns_header" class="rowgroup_controlfit">Rowgroup Footer Columns</div>
                                            </div>
                                        </div>
                                        <div id="Rowgroup_${this.RwogroupCounter}_OrderbyCont" class="col-md-3 rowgroup_OrderbyCont">
                                            <div id="Rowgroup_${this.RwogroupCounter}_Orderby_header" class="rowgroup_controlfit">Rowgroup Orderby</div>
                                        </div>
                                    </div>
                                </div>`;
            $("#Rowgroup_Inner_cont").append(div);

            this.drake.containers.push(document.getElementById(`Rowgroup_${this.RwogroupCounter}_Header_columns`));
            //this.drake.containers.push(document.getElementById(`Rowgroup_${this.RwogroupCounter}_Footer_columns`));
            this.drake.containers.push(document.getElementById(`Rowgroup_${this.RwogroupCounter}_OrderbyCont`));

            $(`#Rowgroup_${this.RwogroupCounter}_displayname`).val(this.CurrentRowgroup.DisplayName);
            let type = this.getRowgrouptype(this.CurrentRowgroup);
            $(`#Rowgroup_${this.RwogroupCounter}_typeselect`).selectpicker();
            $(`#Rowgroup_${this.RwogroupCounter}_typeselect`).on('changed.bs.select', this.RowgroupObjectChanged.bind(this));
            $(`#Rowgroup_${this.RwogroupCounter}_typeselect`).val(type);
            $(`#Rowgroup_${this.RwogroupCounter}_typeselect option[value=${type}]`).trigger("change");
            $("#RowgroupModal").modal("hide");
            $(`#Rowgroup_${this.RwogroupCounter}_innerCont`).on('show', this.ShowRowgroup.bind(this));
            $(`#Rowgroup_${this.RwogroupCounter}_innerCont`).on('hide', this.HideRowgroup.bind(this));
            $(`#DeleteRowGroup_${this.RwogroupCounter}`).off("click").on("click", this.deleteRowgroup.bind(this));
            $(`#Rowgroup_${this.RwogroupCounter}_displayname`).off("change").on("change", this.RowgroupDispalyNameChanged.bind(this));
            $(`#Rowgroup_${this.RwogroupCounter}_displayname,.rowgrouptype_select ,#DeleteRowGroup_${this.RwogroupCounter}`).off("click").on("click", function (e) {
                //e.stopPropagation();
            });
            $(`#Rowgroup_${this.RwogroupCounter}_Header`).off("click").on("click", this.ShowOrHideRowgroup.bind(this));
            $(`#Rowgroup_${this.RwogroupCounter}_Header`).trigger("click");
        }
    }

    CreateRowGroupObject() {
        let name = $("#rowgroup_name").val();
        let type = $('input[name=rowgroup]:checked').val();
        if (type) {
            this.RwogroupCounter++;
            let obj = new EbObjects[type](type + this.RwogroupCounter);
            if (name)
                obj.DisplayName = name;
            else
                obj.DisplayName = obj.Name;
            this.CurrentRowgroup = obj;
            this.objCollection[obj.Name] = this.CurrentRowgroup;
            this.EbObject.RowGroupCollection.$values.push(this.CurrentRowgroup);
        }
    }

    GetRowGroupObject(Rowobj) {
        this.RwogroupCounter++;
        this.Objtype = this.getRowgrouptype(Rowobj);
        let name = Rowobj.Name;
        this.CurrentRowgroupkey = name;
        this.objCollection[name] = Rowobj;
        this.CurrentRowgroup = Rowobj;
    }

    RowgroupObjectChanged(e, clickedIndex) {
        let type = this.getRowgrouptype(this.CurrentRowgroup);
        clickedIndex = typeof (clickedIndex) !== "undefined" ? clickedIndex : $(`#Rowgroup_${this.RwogroupCounter}_typeselect option[value=${type}]`).index();
        let option = $(e.target).find("option").eq(clickedIndex);
        type = $(option).attr("value");
        let obj = new EbObjects[type](type + this.RwogroupCounter);
        this.CurrentRowgroup.$type = obj.$type;
    }

    ShowOrHideRowgroup(e) {
        let elem = $(document.activeElement);
        if (elem.is("input") || elem.is("button") || elem.is("i")) {
            if (elem.is("i"))
                this.deleteRowgroup(e);
            else
                $(e.target).siblings(".Rowgroup_innerCont").show();
        }
        else {
            if ($(e.target).siblings(".Rowgroup_innerCont").is(':visible'))
                $(e.target).siblings(".Rowgroup_innerCont").hide();
            else
                $(e.target).siblings(".Rowgroup_innerCont").show();
        }
    }

    ShowRowgroup(e) {
        $(".Rowgroup_innerCont").not(e.target).hide();
        $(e.target).siblings().closest(".rowgroup_header").children().removeClass("disabledItems");
        let key = $(e.target).attr("data-key");
        this.CurrentRowgroup = this.objCollection[key];
    }

    HideRowgroup(e) {
        if (!$(e.target).siblings().closest(".rowgroup_header").children().hasClass("disabledItems"))
            $(e.target).siblings().closest(".rowgroup_header").children().addClass("disabledItems");
    }

    RemoveRowGroupColumn(e) {
        let element = $(e.target).closest("li");
        let key = element.attr("eb-name");
        this.CurrentRowgroup.RowGrouping.$values = this.CurrentRowgroup.RowGrouping.$values.filter((item) => item.name !== key);
        element.remove();
        $(`#${this.CurrentRowgroup.Name}_${key}_elemsrowgrouporderbyCont`).parents().closest("li").remove();
    }

    RemoveRowGroupOrderbyColumn(e) {
        let element = $(e.target).closest("li");
        let key = element.attr("eb-name");
        this.CurrentRowgroup.OrderBy.$values = this.CurrentRowgroup.OrderBy.$values.filter((item) => item.name !== key);
        element.remove();
    }

    drawRowgroupColumn(objOuter) {
        $.each(objOuter.RowGrouping.$values, function (i, obj) {
            let element = $(`<li eb-type='${this.getType(obj.RenderType)}' DbType='${obj.Type}'  eb-name="${obj.name}" eb-keyname="${objOuter.Name}" class='columns textval' style='font-size: 13px;'>
                <div id="${objOuter.Name}_${obj.name}_elemsrowgroupCont" class="columnelemsCont">
                    <div id="${objOuter.Name}_${obj.name}_spanrowgroupCont" class="columnspanCont">
                        <span><i class='fa ${this.getIcon(obj.RenderType)}'></i> ${obj.name}</span>
                    </div>
                    <input class="rowgroupcolumntitle" type="text" id="${objOuter.Name}_${obj.name}_rowgroupcolumntitle"/>
                </div></li>`);
            this.AllOtherColumndropElements(element);
            $(`#Rowgroup_${this.RwogroupCounter}_Header_columns`).append(element);
            $(element).find(".close").off("click").on("click", this.RemoveRowGroupColumn.bind(this));
            obj.sTitle = (obj.sTitle === "") ? obj.name : obj.sTitle;
            $(`#${objOuter.Name}_${obj.name}_rowgroupcolumntitle`).val(obj.sTitle);
            $(".rowgroupcolumntitle").off("change").on("change", this.RowgroupColumnTitleChanged.bind(this));
            this.ColumnAppendToRowgroupOrderByDiv(objOuter, obj, true);
        }.bind(this));
    }

    drawRowgroupOrderByColumn(objOuter) {
        $.each(objOuter.OrderBy.$values, function (i, obj) {
            this.ColumnAppendToRowgroupOrderByDiv(objOuter, obj, false);
        }.bind(this));
    }

    ColumnAppendToRowgroupOrderByDiv(objOuter, obj, rowgrouped) {
        let element = $(`<li eb-type='${obj.RenderType}' DbType='${obj.Type}' eb-name="${obj.name}" eb-keyname="${objOuter.Name}" class='columns textval' style='font-size: 13px;'>
            <div id="${objOuter.Name}_${obj.name}_elemsrowgrouporderbyCont" class="columnelemsCont">
                <span><i class='fa ${this.getIcon(obj.RenderType)}'></i> ${obj.name}</span>
            </div></li>`);

        $(`#Rowgroup_${this.RwogroupCounter}_OrderbyCont`).append(element);
        this.AllOtherColumndropElements(element);
        $(element).find("span").after(`<span class="spancheck"><input id="${objOuter.Name}_${obj.name}_rowgroupOrderbyCheckox" type="checkbox" class="rowgrouporderbycheckbox" checked data-toggle="toggle" data-size="mini" data-onstyle="default"/></span>`);

        $(`#${objOuter.Name}_${obj.name}_rowgroupOrderbyCheckox`).bootstrapToggle({
            on: 'Asc',
            off: 'Desc'
        });
        $(`#${objOuter.Name}_${obj.name}_rowgroupOrderbyCheckox`).off("change").on("change", this.RowgroupOrderbyCheckboxChanged.bind(this));
        if (obj.Direction === parseInt(EbEnums.OrderByDirection.ASC))
            $(`#${objOuter.Name}_${obj.name}_rowgroupOrderbyCheckox`).bootstrapToggle("on");
        else
            $(`#${objOuter.Name}_${obj.name}_rowgroupOrderbyCheckox`).bootstrapToggle("off");
        $(element).find(".close").off("click").on("click", this.RemoveRowGroupOrderbyColumn.bind(this));
        if (rowgrouped)
            $(`#${objOuter.Name}_${obj.name}_elemsrowgrouporderbyCont`).children().not(".spancheck").addClass("disabledItems");

    }

    deleteRowgroup(e) {
        delete this.objCollection[this.CurrentRowgroup.Name];
        this.EbObject.RowGroupCollection.$values = this.EbObject.RowGroupCollection.$values.filter((item) => item.Name !== this.CurrentRowgroup.Name);
        $(e.target).parents().closest(".rowgroup_outercont").remove();
    }

    RowgroupDispalyNameChanged(e) {
        this.CurrentRowgroup.DisplayName = $(e.target).val();
    }

    DropApprovalColumn = function () {
        let name = "eb_approval"+this.calcfieldCounter++;
        let type = "DVApprovalColumn";
        let obj = new EbObjects[type](name);
        obj.Type = 16;
        obj.RenderType = 16;
        obj.ColumnsRef = this.EbObject.Columns.$values[0].ColumnsRef;
        this.objCollection[name] = obj;
        obj.name = name;
        obj.Title = obj.name;
        obj.bVisible = true;
        obj.IsCustomColumn = true;
        obj.data = this.EbObject.Columns.$values.length;
        $("#ApprovalColumns ul[id='ApprovalColumns-childul']").append(`<li eb-type='${type}'  eb-name="${obj.name}" 
            class='columns textval calcfield' style='font-size: 13px;'><span><i class='fa ${this.getIcon(obj.Type)}'></i> ${obj.name}</span></li>`);
        this.addApprovalFieldToColumnlist(obj);
        $('#ApprovalColumns').killTree();
        $('#ApprovalColumns').treed();
        //this.SetContextmenu4CalcField();
    }

    DropActionColumn = function () {
        let name = "eb_action" + this.calcfieldCounter++;
        let type = "DVActionColumn";
        let obj = new EbObjects[type](name);
        obj.Type = 16;
        obj.RenderType = 16;
        obj.ColumnsRef = this.EbObject.Columns.$values[0].ColumnsRef;
        this.objCollection[name] = obj;
        obj.name = name;
        obj.Title = name;
        obj.bVisible = true;
        obj.IsCustomColumn = true;
        obj.Align = EbEnums.Align.Center;
        obj.data = this.EbObject.Columns.$values.length;
        $("#ActionColumns ul[id='ActionColumns-childul']").append(`<li eb-type='${type}'  eb-name="${obj.name}" 
            class='columns textval calcfield' style='font-size: 13px;'><span><i class='fa ${this.getIcon(obj.Type)}'></i> ${obj.name}</span></li>`);
        this.addActionFieldToColumnlist(obj);
        $('#ActionColumns').killTree();
        $('#ActionColumns').treed();
        //this.SetContextmenu4CalcField();
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
        obj.Type = result.Type;
        obj.RenderType = result.Type;
        this.objCollection[name] = obj;
        obj.name = name;
        obj.Title = obj.name;
        obj._Formula.Code = btoa(ValueExpression);
        obj._Formula.Lang = 1;
        obj.IsCustomColumn = true;
        obj.bVisible = true;
        obj.data = this.EbObject.Columns.$values.length;
        $("#calcFields ul[id='calcfields-childul']").append(`<li eb-type='${type}' DbType='${obj.Type}'  eb-name="${obj.name}" 
            class='columns textval calcfield' style='font-size: 13px;'><span><i class='fa ${this.getIcon(obj.Type)}'></i> ${obj.name}</span></li>`);
        this.addCalcFieldToColumnlist(obj);
        $('#calcFields').killTree();
        $('#calcFields').treed();
        this.SetContextmenu4CalcField();
    }

    addCalcFieldToColumnlist(obj) {
        this.EbObject.Columns.$values.push(obj);
        obj.sTitle = obj.name;
        let element = $(`<li eb-type='${this.getType(obj.Type)}' DbType='${obj.Type}' eb-name="${obj.name}" eb-keyname="${obj.name}" class='columns' style='font-size: 13px;'>
            <div id="${obj.name}_elemsCont" class="columnelemsCont">
                <div id="${obj.name}_spanCont" class="columnspanCont"><span><i class='fa ${this.getIcon(obj.Type)}'></i> ${obj.name}</span></div>
                <input class="columntitle" type="text" id="${obj.name}_columntitle"/>
            </div></li>`);
        this.ColumnDropRelated(element);
        this.DropeventHandlers(element, obj);
    }

    addApprovalFieldToColumnlist(obj) {
        this.EbObject.Columns.$values.push(obj);
        obj.sTitle = obj.name;
        let element = $(`<li eb-type='DVApprovalColumn' eb-name="${obj.name}" eb-keyname="${obj.name}" class='columns' style='font-size: 13px;'>
            <div id="${obj.name}_elemsCont" class="columnelemsCont">
                <div id="${obj.name}_spanCont" class="columnspanCont"><span><i class='fa ${this.getIcon(obj.Type)}'></i> ${obj.name}</span></div>
                <input class="columntitle" type="text" id="${obj.name}_columntitle"/>
            </div></li>`);
        this.ColumnDropRelated(element);
        this.DropeventHandlers(element, obj);
    }

    addActionFieldToColumnlist(obj) {
        this.EbObject.Columns.$values.push(obj);
        obj.sTitle = obj.name;
        let element = $(`<li eb-type='DVActionColumn' eb-name="${obj.name}" eb-keyname="${obj.name}" class='columns' style='font-size: 13px;'>
            <div id="${obj.name}_elemsCont" class="columnelemsCont">
                <div id="${obj.name}_spanCont" class="columnspanCont"><span><i class='fa ${this.getIcon(obj.Type)}'></i> ${obj.name}</span></div>
                <input class="columntitle" type="text" id="${obj.name}_columntitle"/>
            </div></li>`);
        this.ColumnDropRelated(element);
        this.DropeventHandlers(element, obj);
    }

    DropeventHandlers = function (element, obj) {
        $("#columns-list-body").append(element);
        $(element).off("click").on("click", this.elementOnFocus.bind(this));
        $(element).find(".close").off("click").on("click", this.RemoveColumn.bind(this));
        $(`#${obj.name}_columntitle`).val(obj.sTitle);
        $(".columntitle").off("change").on("change", this.ColumnTitleChanged.bind(this));
        this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
    }

    BeforeSave() {
        this.ReArrangeColumnObjects();
        this.ReArrangeOrderbyObjects();
        this.RemoveColumnRef();
        return true;
    }

    ReArrangeColumnObjects() {
        let elemnts = $("#columns-list-body li");
        let visibleobjects = [];
        $.each(elemnts, function (i, item) {
            let name = $(item).attr("eb-name");
            let obj = this.EbObject.Columns.$values.filter(function (obj) { return obj.name === name; });
            visibleobjects.push(obj[0]);
        }.bind(this));

        let nonvisibleobjcts = this.EbObject.Columns.$values.filter(function (obj) { return obj.bVisible !== true; });
        this.EbObject.NotVisibleColumns.$values = nonvisibleobjcts;
        this.EbObject.Columns.$values = visibleobjects.concat(nonvisibleobjcts);
    }

    ReArrangeOrderbyObjects() {
        this.EbObject.OrderBy.$values = [];
        let elemnts = $("#columns-list-orderby li");
        $.each(elemnts, function (i, item) {
            let name = $(item).attr("eb-name");
            let obj = this.EbObject.Columns.$values.filter(function (obj) { return obj.name === name; });
            this.EbObject.OrderBy.$values.push(obj[0]);
        }.bind(this));
    }

    ReplaceObjects(el, target, source, sibling) {
        let curcolName = $(el).attr("eb-name");
        let nextorPrevName = (sibling !== null) ? $(sibling).attr("eb_name") : curcol.prev().attr("eb_name");
    }

    SetContextmenu4CalcField() {
        $.contextMenu('destroy', ".calcfield");
        $.contextMenu({
            selector: ".calcfield",
            build: function ($trigger, e) {
                return {
                    items: {
                        "Delete": { name: "Delete", icon: "fa-trash", callback: this.DeleteCalcField.bind(this) }
                    }
                };
            }.bind(this)

        });
    }

    DeleteCalcField(key, opt, event) {
        let elem = opt.$trigger;
        let name = elem.attr("eb-name");
        this.EbObject.Columns.$values = this.EbObject.Columns.$values.filter(function (obj) { return obj.name !== name; });
        delete this.objCollection[name];
        elem.remove();
        $("#columns-list-body li[eb-name=" + name + "]").remove();
        this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
    }

    RemoveColumnRef() {
        this.__OSElist = [];
        this.__oldValues = [];
        $.each(this.EbObject.Columns.$values, function (i, obj) {
            obj.ColumnsRef = null;
            this.__OSElist.push($.extend({}, obj.__OSElist));
            obj.__OSElist = null;
            this.__oldValues.push($.extend({}, obj.__oldValues));
            obj.__oldValues = null;
        }.bind(this));
    }

    getRowgrouptype(objOuter) {
        if (objOuter.$type.indexOf("MultipleLevelRowGroup") > -1) {
            return "MultipleLevelRowGroup";
        }
        else {
            return "SingleLevelRowGroup";
        }
    }

    getType(type) {
        if (type === 16) {
            return "DVStringColumn";
        }
        else if (type === 7 || type === 8 || type === 10 || type === 11 || type === 12 || type === 21) {
            return "DVNumericColumn";
        }
        else if (type === 3) {
            return "DVBooleanColumn";
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
}