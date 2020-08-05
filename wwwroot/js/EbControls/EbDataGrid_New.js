const EbDataGrid_New = function (ctrl, options) {
    this.ctrl = ctrl;
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
        this.setupCurTrCtrls(true, null, 0);

        //move tr_pointer to last then show
    };

    this.getFormVals = function () {
        return getValsFromForm(this.formObject_Full);
    };

    this.editRow_click = function (e) {
        if (this.currentTr !== null) {
            console.log('active row found. commit then continue.');
            return;
        }
        let $tr = $(e.target).closest('tr');        
        let data_row = this.datatable.Api.row($tr).data();
        let rowid = data_row[this.datatable.hiddenIndex];
        this.setupCurTrCtrls(false, $tr, parseInt(rowid));
        this.datatable.Api.columns.adjust();
        //move tr_pointer to index than show
    };

    this.checkRow_click = function (e) {
        let $tr = $(e.target).closest('tr');
        this.finalizeTrEdit($tr, 'check');
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
        this.datatable.Api.row($(e.target).closest("tr")).remove().draw(false);
    };

    this.cancelRow_click = function (e) {
        let $tr = $(e.target).closest('tr');
        this.finalizeTrEdit($tr, 'cancel');
    };

    this.finalizeTrEdit = function ($tr, action) {
        //$tr => current tr;action => check, cancel;
        let data_row = this.datatable.Api.row($tr).data();
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
        this.datatable.Api.row($tr).data(curRow).draw(false);
        this.currentTr = null;
        this.CurRowModel = null;
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

    this.setupCurTrCtrls = function (isNew, $tr, RowId) {
        if (this.currentTr !== null) {
            console.log('active row found. unable to continue.');
            return;
        }
        let Row;// SingleRow
        if (isNew) {
            Row = JSON.parse(JSON.stringify(this.RowDataModel_empty));
            Row.RowId = this.addRowCounter--;
        }
        else {
            Row = getObjByval(this.dataMODEL, "RowId", parseInt(RowId));
        }
        this.CurRowModel = JSON.parse(JSON.stringify(Row));
        this.CurRowModel._ActiveRow = Row;

        let curRow = {};
        let objModelEntry = [];
        let j = 0;
        for (; j < this.DGColCtrls.length; j++) {
            let inpCtrl = this.DGColCtrls[j].inpCtrl;
            let Column = getObjByval(this.CurRowModel.Columns, "Name", inpCtrl.Name);
            inpCtrl.DataVals = Column;
            curRow[j] = this.DGColCtrls[j].html;
            let Column2 = getObjByval(Row.Columns, "Name", inpCtrl.Name);
            objModelEntry.push({ DataVals: Column2, DGColCtrlObj: this.DGColCtrls[j] });
        }
        curRow[j++] = this.CurRowModel.RowId;
        curRow[j] = this.getCogTdHtml('editing');
        if (isNew) {
            this.currentTr = this.datatable.Api.row.add(curRow).draw(false);
            this.dataMODEL.push(Row);
            this.objectMODEL[Row.RowId] = objModelEntry;
            let $scrollBody = $(this.datatable.Api.table().node()).parent();
            $scrollBody.scrollTop($scrollBody.get(0).scrollHeight);
        }
        else {
            this.currentTr = this.datatable.Api.row($tr).data(curRow).draw(false);
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
        //this.fixValExpInDataModel(this.objectMODEL);
        
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
                objModelRow.push(this.getObjModelEntry(Column, this.DGColCtrls[j]));
            }
            objModel[Row.RowId] = objModelRow;
        }
        return objModel;
    };

    //construct object model as required for expression exec
    this.getObjModelEntry = function (Column, DGColCtrlObj) {
        let ObjModelEntry = { DataVals: Column, DGColCtrlObj: DGColCtrlObj };
        ObjModelEntry['getValue'] = function () { return this.DataVals.Value; };
        if (DGColCtrlObj.inpCtrl.ObjType === 'PowerSelect') {
            ObjModelEntry['getColumn'] = function () { console.error('Not implemented'); return {}; };
        }
        return ObjModelEntry;
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
            //this.setCurRow(rowId);

            for (let i = 0; i < ObjModelRow.length; i++) {
                let inpCtrl = ObjModelRow[i].DGColCtrlObj.inpCtrl;
                let ValueExpr_val = null;
                if (inpCtrl.ValueExpr && inpCtrl.ValueExpr.Lang === 0 && inpCtrl.ValueExpr.Code) {
                    let fun = new Function("form", "user", `event`, atob(inpCtrl.ValueExpr.Code)).bind(ObjModelRow[i], this.formObject, this.userObject);
                    ValueExpr_val = fun();
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
        return html + '</div>';
    };

    //public function
    this.SwitchToEditMode = function () {
        this.$TableCont.find(`.ctrlstd_dg`).attr("mode", "edit");
        this.mode_s = "edit";
    };

    this.init();
};
