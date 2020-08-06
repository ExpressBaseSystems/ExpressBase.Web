const EbDataGrid_New = function (ctrl, options) {
    this.ctrl = ctrl;
    this.ctrl.currentRow = {};
    this.formObject = options.formObject; //'form' in JsScript
    this.userObject = options.userObject;
    this.formObject_Full = options.formObject_Full; //original object
    this.formRefId = options.formRefId;
    this.formRenderer = options.formRenderer;
    this.initControls = new InitControls(options.formRenderer);
    this.RowDataModel_empty = this.formRenderer.formData.DGsRowDataModel[this.ctrl.TableName];

    this.$Table = null;
    this.DGColCtrls = [];// datagrid column controls - all info
    this.dataMODEL = null;// array of SingleRow
    this.objectMODEL = null;// object; key: row id
    this.mode_s = options.Mode.isView ? "view" : "edit";
    this.addRowCounter = -1;
    this.currentTr = null;// datatable active tr
    this.CurRowModel = null;

    //dataTable related variables
    this.DVColumns = null; //DVColumnCollection
    this.datatable = null; //EbBasicDataTable object

    this.init = function () {
        this.initDGColCtrls();
        this.makeHtmlSuitable();//temporary
        this.initBasicDataTable();

        $(`#${this.ctrl.EbSid}Wraper`).on("click", ".addrow-btn", this.addRowBtn_click.bind(this));

        this.$TableCont.on("click", ".edit-rowc", this.editRow_click.bind(this));
        this.$TableCont.on("click", ".check-rowc", this.checkRow_click.bind(this));
        this.$TableCont.on("click", ".del-rowc", this.delRow_click.bind(this));
        this.$TableCont.on("click", ".cancel-rowc", this.cancelRow_click.bind(this));
    };

    //remove unwanted html from old dg bare html - temporary
    this.makeHtmlSuitable = function () {
        this.$Table = $(`#tbl_${this.ctrl.EbSid_CtxId}`);
        this.$Table.empty();
        this.$TableCont = this.$Table.parent();
        this.$TableCont.attr("id", `tblcont_${this.ctrl.EbSid_CtxId}`);
        this.$TableCont.css("overflow-y", "unset");
        this.$TableCont.removeClass("Dg_body");
        this.$TableCont.siblings('.Dg_head, .Dg_footer').remove();
        this.TableCont = `tblcont_${this.ctrl.EbSid_CtxId}`;
    };

    this.initBasicDataTable = function () {
        this.DVColumns = this.ctrl.DVColumnColl;

        let o = {};
        o.containerId = this.TableCont;
        //o.dsid = this.dsid;
        o.tableId = `tbl_${this.ctrl.EbSid_CtxId}`;
        o.showSerialColumn = true;
        o.showCheckboxColumn = false;
        o.showFilterRow = false;
        o.scrollHeight = this.ctrl.Height === 0 ? 200 : (this.ctrl.Height - 35);
        o.fnDblclickCallback = this.dataTableTdDoubleClick.bind(this);
        //o.fnKeyUpCallback = this.xxx.bind(this);
        //o.arrowFocusCallback = this.arrowSelectionStylingFcs;
        //o.arrowBlurCallback = this.arrowSelectionStylingBlr;
        //o.fninitComplete = this.initDTpost.bind(this);
        o.initCompleteCallback = this.dataTableInitCallback.bind(this),
            o.dom = "<p>rt";
        //o.IsPaging = true;
        //o.pageLength = this.ComboObj.DropDownItemLimit;
        o.Source = "datagrid";
        o.hiddenFieldName = "id";
        o.keys = true;
        //o.LeftFixedColumn = 1;
        //o.RightFixedColumn = 1;
        //o.hiddenFieldName = this.vmName;
        o.keyFocusCallbackFn = this.dataTableTdKeyFocus.bind(this);
        o.columns = this.DVColumns.$values;//////////////////////////////////////////////////////  
        //o.fninitComplete4SetVal = this.fninitComplete4SetVal;
        //o.searchCallBack = this.searchCallBack;
        o.data = { data: [] };
        this.datatable = new EbCommonDataTable(o);
    };

    this.dataTableTdKeyFocus = function (e, datatable, cell, originalEvent) {
        if (originalEvent.keyCode === 9) {// if tab key pressed
            $(cell.node()).find('[ui-inp]').focus();
        }
    };

    this.dataTableTdDoubleClick = function (e) {
        if (this.mode_s == 'edit') {
            this.editRow_click(e);
        }
    };

    this.dataTableInitCallback = function () {

    };

    this.initDGColCtrls = function () {
        this.DGColCtrls = [];
        for (let i = 0; i < this.ctrl.Controls.$values.length; i++) {
            let ctrl = this.ctrl.Controls.$values[i];
            let inpCtrl = new EbObjects[ctrl.InputControlType](ctrl.EbSid_CtxId, ctrl);// creates object
            inpCtrl.ObjType = ctrl.InputControlType.substring(2);
            inpCtrl = new ControlOps[inpCtrl.ObjType](inpCtrl);// attach getValue(), ... methods
            let ctrlHtml = `<div id='@ebsid@Wraper' style='' class='ctrl-cover' eb-readonly='@isReadonly@' @singleselect@>${ctrl.DBareHtml || inpCtrl.BareControlHtml}</div>`
                .replace("@isReadonly@", ctrl.IsDisable)
                .replace("@singleselect@", ctrl.MultiSelect ? "" : `singleselect=${!ctrl.MultiSelect}`)
                .replace(/@ebsid@/g, inpCtrl.EbSid_CtxId);
            this.DGColCtrls.push({ colCtrl: ctrl, html: ctrlHtml, inpCtrl: inpCtrl });
        }
    };

    this.addRowBtn_click = function () {
        if (this.currentTr !== null) {
            if (this.canFinalizeTrEdit(this.currentTr))
                this.finalizeTrEdit(this.currentTr, 'check');
            else {
                console.log('active row found. commit then continue.');
                return;
            }
        }
        this.setupCurTrCtrls(true, null, 0);
    };

    this.getFormVals = function () {
        return getValsFromForm(this.formObject_Full);
    };

    this.editRow_click = function (e) {
        let $tr = $(e.target).closest('tr');
        let dtTr = this.datatable.Api.row($tr);
        let rowid = dtTr.data()[this.datatable.hiddenIndex];
        if (this.currentTr !== null) {
            if (rowid === this.CurRowModel.RowId)
                return;
            if (this.canFinalizeTrEdit(this.currentTr))
                this.finalizeTrEdit(this.currentTr, 'check');
            else {
                console.log('active row found. commit then continue.');
                return;
            }
        }
        this.setupCurTrCtrls(false, dtTr, parseInt(rowid));
        this.datatable.Api.columns.adjust();
    };

    this.checkRow_click = function (e) {
        let $tr = $(e.target).closest('tr');
        let dtTr = this.datatable.Api.row($tr);
        if (this.canFinalizeTrEdit(dtTr))
            this.finalizeTrEdit(dtTr, 'check');
    };

    this.delRow_click = function (e) {
        let $tr = $(e.target).closest('tr');
        let data_row = this.datatable.Api.row($tr).data();
        let rowid = parseInt(data_row[this.datatable.hiddenIndex]);
        if (rowid > 0) {
            let Row = getObjByval(this.dataMODEL, "RowId", rowid);
            Row.IsDelete = true;
        }
        else {
            let index = this.dataMODEL.findIndex(function (Row) { return Row.RowId === rowid; });
            this.dataMODEL.splice(index, 1);
        }
        delete this.objectMODEL[rowid];
        this.datatable.Api.row($(e.target).closest("tr")).remove().draw(false);

        if (this.CurRowModel.RowId === rowid) {
            this.currentTr = null;
            this.CurRowModel = null;
        }
    };

    this.cancelRow_click = function (e) {
        let $tr = $(e.target).closest('tr');
        let dtTr = this.datatable.Api.row($tr);
        this.finalizeTrEdit(dtTr, 'cancel');
    };

    this.finalizeTrEdit = function (dtTr, action) {
        //dtTr => current datatable tr;action => check, cancel;
        let data_row = dtTr.data();
        let rowid = data_row[this.datatable.hiddenIndex];
        let Row = getObjByval(this.dataMODEL, "RowId", parseInt(rowid));
        if (action === 'check') {
            if (parseInt(rowid) !== this.CurRowModel.RowId) {
                console.error('Mismatch in RowId and CurRowModel.RowId');
                return;
            }
            this.CopyRowToRow(this.CurRowModel, Row);
        }
        let curRow = {};
        let j = 0;
        for (; j < this.DGColCtrls.length; j++) {
            let _control = this.DGColCtrls[j].colCtrl;
            let Column = getObjByval(Row.Columns, "Name", _control.Name);
            curRow[j] = this.getTdPlainHtml(Column, _control);

            //must destroy all initialized controls
            if (_control.EbDateType === 5 || _control.EbDateType === 6 || _control.EbDateType === 17) {
                $('#' + _control.EbSid_CtxId).datetimepicker('destroy');
            }
            else if (_control.ObjType === 'DGSimpleSelectColumn') {
                $('#' + _control.EbSid_CtxId).selectpicker('destroy');
            }
        }
        curRow[j++] = Row.RowId;
        curRow[j] = this.getCogTdHtml('viewing');
        dtTr.data(curRow).draw(false);
        this.currentTr = null;
        this.CurRowModel = null;
    };

    this.canFinalizeTrEdit = function (dtTr) {
        let rowId = dtTr.data()[this.datatable.hiddenIndex];
        let canFinalize = true;
        $.each(this.objectMODEL[rowId], function (k, ObjModelColumn) {
            let inpCtrl = ObjModelColumn.DGColCtrlObj.inpCtrl;
            if (!((!inpCtrl.Required || this.isRequiredOK(inpCtrl)) && (!inpCtrl.Unique || this.isUniqueOK(inpCtrl, k)) &&
                (!inpCtrl.Validators || inpCtrl.Validators.$values.length === 0 || this.isValidationsOK(inpCtrl)))) {
                canFinalize = false;
                return false;
            }
        }.bind(this));
        return canFinalize;
    };

    this.CopyRowToRow = function (srcRow, destRow) {
        $.each(srcRow.Columns, function (i, obj) {
            let Column = getObjByval(destRow.Columns, "Name", obj.Name);
            if (Column) {
                Column.Value = obj.Value;
                Column.F = obj.F;
                Column.D = JSON.parse(JSON.stringify(obj.D));
                Column.R = JSON.parse(JSON.stringify(obj.R));
            }
        });
    };

    this.setupCurTrCtrls = function (isNew, dtTr, RowId) {
        //dtTr -> datatable tr
        if (this.currentTr !== null) {
            console.log('active row found. unable to continue.');
            return;
        }
        let Row;// SingleRow
        if (isNew) {
            Row = JSON.parse(JSON.stringify(this.RowDataModel_empty));
            Row.RowId = this.addRowCounter--;
            this.addToObjectModel(Row);
            this.fixDefaultValExpInDataModel(Row);
        }
        else {
            Row = getObjByval(this.dataMODEL, "RowId", parseInt(RowId));
        }
        this.CurRowModel = JSON.parse(JSON.stringify(Row));
        //this.CurRowModel._ActiveRow = Row;///////

        let curRow = {};
        let j = 0;
        for (; j < this.DGColCtrls.length; j++) {
            let inpCtrl = this.DGColCtrls[j].inpCtrl;
            let Column = getObjByval(this.CurRowModel.Columns, "Name", inpCtrl.Name);
            inpCtrl.DataVals = Column;
            curRow[j] = this.DGColCtrls[j].html;
        }
        curRow[j++] = this.CurRowModel.RowId;
        if (isNew)
            curRow[j] = this.getCogTdHtml('firstEditing');
        else
            curRow[j] = this.getCogTdHtml('editing');
        if (isNew) {
            this.currentTr = this.datatable.Api.row.add(curRow).draw(false);
            this.dataMODEL.push(Row);
            let $scrollBody = $(this.datatable.Api.table().node()).parent();
            $scrollBody.scrollTop($scrollBody.get(0).scrollHeight);
        }
        else {
            this.currentTr = dtTr.data(curRow).draw(false);
        }

        let rowFlatCtrls = [];

        for (let i = 0; i < this.DGColCtrls.length; i++) {
            let inpCtrl = this.DGColCtrls[i].inpCtrl;
            let opt = {};
            if (inpCtrl.ObjType === "PowerSelect")// || inpCtrl.ObjType === "DGPowerSelectColumn")
                opt.getAllCtrlValuesFn = this.getFormVals.bind(this);
            else if (inpCtrl.ObjType === "Date") {
                opt.source = "webform";
                opt.userObject = this.ctrl.__userObject;
            }
            this.initControls.init(inpCtrl, opt);

            if (inpCtrl.DataVals.Value !== null) {
                inpCtrl.___DoNotUpdateDataVals = true;
                if (ctrl.ObjType === "PowerSelect")
                    inpCtrl.setDisplayMember(inpCtrl.DataVals.Value);
                else
                    inpCtrl.justSetValue(inpCtrl.DataVals.Value);
                inpCtrl.___DoNotUpdateDataVals = false;
            }
            rowFlatCtrls.push(inpCtrl);
        }
        //this.formRenderer.FRC.bindEbOnChange2Ctrls(rowFlatCtrls);

        $.each(rowFlatCtrls, function (k, inpCtrl) {
            try {
                inpCtrl.bindOnChange(this.DataValsUpdate.bind(this, inpCtrl, this.DGColCtrls[k].colCtrl));// binding to onchange
            } catch (e) {
                console.eb_log("eb error :");
                console.eb_log(e);
                console.log("error in 'bindEbFnOnChange function' of : " + inpCtrl.Name + " - " + e.message);
            }
        }.bind(this));


        $.each(rowFlatCtrls, function (k, inpCtrl) {
            inpCtrl.__CheckFlags = { isRequiredOK: true, isUniqueOK: true, isValidationOK: true };
            let $inpCtrl = $(`#${inpCtrl.EbSid_CtxId}`);
            if (inpCtrl.Required)
                $inpCtrl.on("blur", this.isRequiredOK.bind(this, inpCtrl)).on("focus", this.removeInvalidStyle.bind(this, inpCtrl));
            if (inpCtrl.Unique) {
                $inpCtrl.keyup(debounce(this.isUniqueOK.bind(this, inpCtrl, k), 500));
            }
            if (inpCtrl.Validators && inpCtrl.Validators.$values.length > 0) {////??
                $inpCtrl.on("blur", this.isValidationsOK.bind(this, inpCtrl));
            }
        }.bind(this));
    };

    this.isValidationsOK = function (inpCtrl) {
        if (!inpCtrl.Validators || inpCtrl.Validators.$values.length === 0)
            return true;
        let isValidationSuccess = true;
        let failedValidator = null;
        inpCtrl.Validators.$values = sortByProp(inpCtrl.Validators.$values, "IsWarningOnly");// sort Validators like warnings comes last
        if (this.currentTr !== null) {
            let rowId = this.currentTr.data()[this.datatable.hiddenIndex];
            this.setCurRowInGlobals(rowId);
        }
        $.each(inpCtrl.Validators.$values, function (i, Validator) {
            if (Validator.IsDisabled || !Validator.Script.Code)// continue;
                return true;
            let func = new Function('form', 'user', `event`, atob(Validator.Script.Code)).bind(inpCtrl, this.formObject, this.userObject);
            let valRes = false;
            try {
                valRes = func();
            }
            catch (e) {
                console.error(`Error in validator: ${e}`);
                console.log(atob(Validator.Script.Code));
            }
            if (valRes !== true) {
                failedValidator = Validator;
                if (!Validator.IsWarningOnly) {
                    isValidationSuccess = false;
                    return false;// break; 
                }
            }
        }.bind(this));

        inpCtrl.__CheckFlags.isValidationOK = isValidationSuccess;
        if (failedValidator !== null) {
            this.EbMakeInvalid(inpCtrl, failedValidator.FailureMSG, (failedValidator.IsWarningOnly ? "warning" : "danger"));
        }
        if (isValidationSuccess) {
            if (inpCtrl.__CheckFlags.isRequiredOK && inpCtrl.__CheckFlags.isUniqueOK)
                this.EbMakeValid(inpCtrl);
        }
        return isValidationSuccess;
    };

    this.isUniqueOK = function (inpCtrl, ctrlIndex) {
        let value = inpCtrl.getValueFromDOM();
        if ((inpCtrl.ObjType === "Numeric" && value === 0) || value === null) {// avoid check if numeric and value is 0
            inpCtrl.__CheckFlags.isUniqueOK = true;
            return true;
        }
        let exists = false;
        $.each(this.objectMODEL, function (k, objModelRow) {
            if (parseInt(k) === this.CurRowModel.RowId)
                return true;
            if (objModelRow[ctrlIndex].getValue() === value) {
                exists = true;
                return false;
            }
        }.bind(this));

        if (exists) {
            inpCtrl.__CheckFlags.isUniqueOK = false;
            this.EbMakeInvalid(inpCtrl, "This field is unique, try another value");
            return false;
        }
        else {
            inpCtrl.__CheckFlags.isUniqueOK = true;
            if (inpCtrl.__CheckFlags.isRequiredOK && inpCtrl.__CheckFlags.isValidationOK)
                this.EbMakeValid(inpCtrl);
            return true;
        }
    };

    this.isRequiredOK = function (inpCtrl) {
        let $inpCtrl = $(`#${inpCtrl.EbSid_CtxId}`);
        if ($inpCtrl.length !== 0 && inpCtrl.Required && !inpCtrl.isRequiredOK()) {
            inpCtrl.__CheckFlags.isRequiredOK = false;
            this.EbMakeInvalid(inpCtrl);
            return false;
        }
        else {
            inpCtrl.__CheckFlags.isRequiredOK = true;
            if (inpCtrl.__CheckFlags.isUniqueOK && inpCtrl.__CheckFlags.isValidationOK)
                this.EbMakeValid(inpCtrl);
            return true;
        }
    };

    this.removeInvalidStyle = function (inpCtrl) {// for required
        if (inpCtrl.__CheckFlags.isUniqueOK && inpCtrl.__CheckFlags.isValidationOK)
            setTimeout(this.EbMakeValid.bind(this, inpCtrl), 1000);
        //EbMakeValid(`#td_${ctrl.EbSid_CtxId}`, `.ctrl-cover`);
    };

    this.DataValsUpdate = function (inpCtrl, _control) {
        if (!inpCtrl.___DoNotUpdateDataVals) {
            if (inpCtrl.DataVals) {
                inpCtrl.DataVals.Value = inpCtrl.getValueFromDOM();
                if (inpCtrl.ObjType === "PowerSelect") {
                    //inpCtrl.DataVals.D = {};// required values here!
                    //inpCtrl.DataVals.R = {};
                }
                else {
                    inpCtrl.DataVals.F = this.getTdPlainHtml(inpCtrl.DataVals, _control);
                }
            }
        }
    };

    //public function
    this.populateDGWithDataModel = function (DgDataModel) {
        this.dataMODEL = DgDataModel || [];
        this.objectMODEL = this.getObjectMODEL(this.dataMODEL);
        this.fixValExpInDataModel(this.objectMODEL);

        this.datatable.Api.clear();// Clear the table of all data
        if (this.dataMODEL.length > 0) {
            let dvdata = this.getDataTableData(this.dataMODEL);
            this.datatable.Api.rows.add(dvdata).draw(false);
        }
    };

    this.getObjectMODEL = function (DgDataModel) {
        let objModel = {};
        for (let i = 0; i < DgDataModel.length; i++) {
            let objModelRow = [];
            let Row = DgDataModel[i];
            for (let j = 0; j < this.DGColCtrls.length; j++) {
                let Column = getObjByval(Row.Columns, "Name", this.DGColCtrls[j].colCtrl.Name);
                objModelRow.push(this.getObjModelColumn(Column, this.DGColCtrls[j]));
            }
            objModel[Row.RowId] = objModelRow;
        }
        return objModel;
    };

    this.addToObjectModel = function (Row) {
        let objModelRow = [];
        for (let j = 0; j < this.DGColCtrls.length; j++) {
            let Column = getObjByval(Row.Columns, "Name", this.DGColCtrls[j].colCtrl.Name);
            objModelRow.push(this.getObjModelColumn(Column, this.DGColCtrls[j]));
        }
        this.objectMODEL[Row.RowId] = objModelRow;
    };

    //construct object model as required for expression exec
    this.getObjModelColumn = function (Column, DGColCtrlObj) {
        let ObjModelColumn = { DataVals: Column, DGColCtrlObj: DGColCtrlObj };
        ObjModelColumn['getValue'] = function () { return this.DataVals.Value; };
        if (DGColCtrlObj.inpCtrl.ObjType === 'PowerSelect') {
            ObjModelColumn['getColumn'] = function () { console.error('Not implemented'); return {}; };
        }
        return ObjModelColumn;
    };

    this.getDataTableData = function (DgDataModel) {
        let dvdata = [];
        for (let i = 0; i < DgDataModel.length; i++) {
            let Row = DgDataModel[i];
            let curRow = {};
            let j = 0;
            for (; j < this.DGColCtrls.length; j++) {
                let _control = this.DGColCtrls[j].colCtrl;
                let Column = getObjByval(Row.Columns, "Name", _control.Name);
                curRow[j] = this.getTdPlainHtml(Column, _control);
            }
            curRow[j++] = Row.RowId;
            curRow[j] = this.getCogTdHtml('viewing');
            dvdata.push(curRow);
        }
        return dvdata;
    };

    this.fixValExpInDataModel = function (DgObjectModel) {
        $.each(DgObjectModel, function (rowId, ObjModelRow) {
            this.setCurRowInGlobals(rowId);
            for (let i = 0; i < ObjModelRow.length; i++) {
                let inpCtrl = ObjModelRow[i].DGColCtrlObj.inpCtrl;
                let ValueExpr_val = null;
                if (inpCtrl.ValueExpr && inpCtrl.ValueExpr.Lang === 0 && inpCtrl.ValueExpr.Code) {
                    let fun = new Function("form", "user", `event`, atob(inpCtrl.ValueExpr.Code)).bind(ObjModelRow[i], this.formObject, this.userObject);
                    try {
                        ValueExpr_val = fun();
                    }
                    catch (e) {
                        console.error(`Error in valueExpression of ${inpCtrl.Name}: ${e}`);
                        console.log('Code: ' + atob(inpCtrl.ValueExpr.Code));
                    }
                    //val = EbConvertValue(val, ctrl.ObjType);
                }
                if (inpCtrl.DoNotPersist && ValueExpr_val !== null) {
                    ObjModelRow[i].DataVals.Value = ValueExpr_val;
                    //if (inpCtrl.ObjType === "Numeric")
                    //    inpCtrl.DataVals.F = ValueExpr_val.toFixed(inpCtrl.DecimalPlaces);
                }
            }
            //this.onRowPaintFn(["tr"], "check", "e");// --
        }.bind(this));
    };

    this.fixDefaultValExpInDataModel = function (Row) {
        this.setCurRowInGlobals(Row.RowId);
        let ObjModelRow = this.objectMODEL[Row.RowId];
        for (let i = 0; i < ObjModelRow.length; i++) {
            let inpCtrl = ObjModelRow[i].DGColCtrlObj.inpCtrl;
            let DefaultValueExpr_val = null;
            if (inpCtrl.DefaultValueExpression && inpCtrl.DefaultValueExpression.Lang === 0 && inpCtrl.DefaultValueExpression.Code) {
                let fun = new Function("form", "user", `event`, atob(inpCtrl.DefaultValueExpression.Code)).bind(ObjModelRow[i], this.formObject, this.userObject);
                try {
                    DefaultValueExpr_val = fun();
                }
                catch (e) {
                    console.error(`Error in DefaultValueExpression of ${inpCtrl.Name}: ${e}`);
                    console.log('Code: ' + atob(inpCtrl.ValueExpr.Code));
                }
            }
            if (inpCtrl.DoNotPersist && DefaultValueExpr_val !== null) {
                ObjModelRow[i].DataVals.Value = DefaultValueExpr_val;
            }
        }
    };

    this.setCurRowInGlobals = function (rowId) {
        if (this.ctrl.currentRow['__rowId'] && this.ctrl.currentRow['__rowId'] === rowId) {
            return;
        }
        this.ctrl.currentRow = {};
        let objModelRow = this.objectMODEL[rowId];
        for (let i = 0; i < objModelRow.length; i++) {
            this.ctrl.currentRow[objModelRow[i].DGColCtrlObj.colCtrl.Name] = objModelRow[i];
        }
        this.ctrl.currentRow['__rowId'] = rowId;
    };



    EbDataGrid_New_Extended.bind(this)();

    this.init();
};

const EbDataGrid_New_Extended = function () {
    //public function
    this.SwitchToEditMode = function () {
        this.$TableCont.find(`.ctrlstd_dg`).attr("mode", "edit");
        this.mode_s = "edit";
    };

    this.getTdCtrlHtml = function (col) {
        return `<div id='@ebsid@Wraper' class='ctrl-cover' eb-readonly='@isReadonly@' @singleselect@>${col.DBareHtml}</div>`
            .replace("@isReadonly@", col.IsDisable)
            .replace("@singleselect@", col.MultiSelect ? "" : `singleselect=${!col.MultiSelect}`)
            .replace(/@ebsid@/g, col.EbSid_CtxId);
    };

    this.getCogTdHtml = function (rowState) {
        let html = `<div class='ctrlstd_dg' mode='${this.mode_s}' >`;
        if (rowState == 'viewing')
            html += `<button type='button' class='edit-rowc'><span class='fa fa-pencil'></span></button>
                    <button type='button' class='del-rowc'><span class='fa fa-trash'></span></button>`;
        else if (rowState == 'editing')
            html += `<button type='button' class='check-rowc'><span class='fa fa-check'></span></button>
                    <button type='button' class='cancel-rowc'><span class='fa fa-times'></span></button>`;
        else if (rowState == 'firstEditing')
            html += `<button type='button' class='check-rowc'><span class='fa fa-check'></span></button>
                    <button type='button' class='del-rowc'><span class='fa fa-trash'></span></button>`;
        return html + '</div>';
    };

    this.getTdPlainHtml = function (Column, _control) {
        //return `${Column.Value}`;
        //----------------------------------
        if (!Column.Value === null)
            return "";

        let dspMmbr = "";

        if (_control.ObjType === "DGPowerSelectColumn") {
            dspMmbr = this.getPSDispMembrs(Column, _control);
        }
        else if (_control.ObjType === "DGSimpleSelectColumn") {
            dspMmbr = this.getSSDispMembrs(Column, _control);
        }
        else if (_control.ObjType === "DGBooleanSelectColumn") {
            dspMmbr = this.getBSDispMembrs(Column, _control);
        }
        else if (_control.ObjType === "DGBooleanColumn") {
            dspMmbr = this.getBooleanDispMembrs(Column, _control);
        }
        else if (_control.ObjType === "DGNumericColumn") {
            dspMmbr = Column.Value.toFixed(_control.DecimalPlaces);
        }
        else if ((_control.ObjType === "DGDateColumn") || (_control.ObjType === "DGCreatedAtColumn") || (_control.ObjType === "DGModifiedAtColumn")) {
            dspMmbr = this.getDateDispMembrs(Column, _control);
        }
        else if (_control.ObjType === "DGCreatedByColumn" || _control.ObjType === "DGModifiedByColumn") {
            let spn = '';
            if (Column.Value == null) {
                spn = `<img class='sysctrl_usrimg' src='/images/nulldp.png' alt='' onerror=this.onerror=null;this.src='/images/nulldp.png'>`;
            }
            else {
                spn = `<img class='sysctrl_usrimg' src='/images/dp/${Column.Value.split('$$')[0]}.png' alt='' onerror=this.onerror=null;this.src='/images/nulldp.png'>`;
                spn += `<span class='sysctrl_usrname'>${Column.Value.split('$$')[1]}</span>`;
            }
            dspMmbr = spn;
        }
        else if (_control.ObjType === "DGUserSelectColumn") {
            let ulObj = inpCtrl.UserList.$values.find(e => e.vm === Column.Value);
            if (ulObj)
                dspMmbr = `<img class='sysctrl_usrimg' src='/images/dp/${ulObj.vm}.png' alt='' onerror="this.src='/images/nulldp.png'"> <span class='sysctrl_usrname'>${ulObj.dm1}</span>`;
        }
        else
            dspMmbr = Column.Value || "";

        return dspMmbr;
    };

    this.getPSDispMembrs = function (Column, _control) {

        if (_control.RenderAsSimpleSelect)
            return this.getSSDispMembrs(Column, _control);

        if (!Column.Value && Column.Value !== 0)
            return "";

        let valMsArr = Column.Value.toString().split(',');
        let textspn = "";
        let vm0 = parseInt(valMsArr[0]);
        let dispDict0 = Column.D[vm0];
        let dispKeys = Object.keys(dispDict0);
        for (let j = 0; j < dispKeys.length; j++) {
            let dispKey = dispKeys[j]
            textspn += "<div iblock>";
            for (let k = 0; k < valMsArr.length; k++) {
                let vm = parseInt(valMsArr[k]);
                let dispDict = Column.D[vm];
                let DMVal = dispDict[dispKey];
                textspn += `<div class='selected-tag'>${DMVal === null ? "" : DMVal}</div>`;
            }
            textspn += "</div>&nbsp;&nbsp;&nbsp;";
        }
        return textspn.substr(0, textspn.length - 18);
    };

    this.getSSDispMembrs = function (Column, _control) {
        if (!Column.Value && Column.Value !== 0)
            return "";
        let opts = _control.Options.$values;
        let val;
        for (var i = 0; i < opts.length; i++) {
            let opt = opts[i];
            if (opt.Value === Column.Value.toString())
                val = opt.DisplayName;
        }
        return val === undefined ? "" : val;
    };

    this.getBSDispMembrs = function (Column, _control) {
        if (Column.Value === true)
            return _control.TrueText;
        else
            return _control.FalseText;
    };

    this.getBooleanDispMembrs = function (Column, _control) {
        if (Column.Value === true)
            return "✔";
        else
            return "✖";
    };

    this.getDateDispMembrs = function (Column, _control) {
        if (!Column.Value)
            return '';
        else if (_control.ShowDateAs_ === 1 || _control.ShowDateAs_ === 2) //month picker or year picker
            return Column.Value;
        else if (_control.EbDateType === 5) //Date
            return moment(Column.Value, 'YYYY-MM-DD').format(this.userObject.Preference.ShortDatePattern);
        else if (_control.EbDateType === 6) //DateTime
            return moment(Column.Value, 'YYYY-MM-DD HH:mm:ss').format(this.userObject.Preference.ShortDatePattern + ' ' + this.userObject.Preference.ShortTimePattern);
        else if (_control.EbDateType === 17) //Time
            return moment(Column.Value, 'HH:mm:ss').format(this.userObject.Preference.ShortTimePattern);
    };

    this.EbMakeInvalid = function (inpCtrl, msg = "This field is required", type = "danger") {
        let $cont = $(`#${inpCtrl.EbSid_CtxId}Wraper`);
        let shadowColor = "#ee0000b8";
        if (type === "warning")
            shadowColor = "rgb(236, 151, 31)";
        if ($cont.siblings('.req-cont').length !== 0)
            return;
        //var $ctrlCont = (this.curForm.renderAsForm) ? $(`${contSel}  .ctrl-wraper`) : $(`${contSel} .chat-ctrl-cont`);
        //let $ctrlCont = $(`${contSel}  ${_ctrlCont}:first`);
        $cont.after(`<div class="req-cont"><label class='text-${type}' style='left: 0px;'></label></div>`);
        $cont.css("box-shadow", `0 0 3px 1px ${shadowColor}`);//.siblings("[name=ctrlsend]").css('disabled', true);
        $cont.siblings('.req-cont').find(`.text-${type}`).text(msg).hide().slideDown(100);
    }

    this.EbMakeValid = function (inpCtrl) {
        //setTimeout(function () {
        let $cont = $(`#${inpCtrl.EbSid_CtxId}Wraper`);
        $cont.css("box-shadow", "inherit");//.siblings("[name=ctrlsend]").css('disabled', false);
        $cont.siblings('.req-cont').animate({ opacity: "0" }, 300).remove();
        //},400);
    }
};