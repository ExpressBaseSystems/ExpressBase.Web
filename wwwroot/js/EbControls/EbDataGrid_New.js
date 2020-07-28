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
    this.DGColCtrls = {};// datagird column controls// key: col index
    this.dataModel = null;
    this.objectModel = null;// key: row id
    this.mode_s = options.Mode.isView ? "view" : "edit";
    this.addRowCounter = -1;
    this.currentTrIndex = -1;// datatable tr index

    //dataTable related variables
    this.DVColumns = null; //DVColumnCollection
    this.datatable = null; //EbBasicDataTable object

    this.init = function () {
        this.initDGColCtrls();
        this.makeHtmlSuitable();//temporary
        this.initBasicDataTable();

        $(`#${this.ctrl.EbSid}Wraper`).on("click", ".addrow-btn", this.addRowBtn_click.bind(this));
        
        this.$Table.on("click", ".check-row", this.checkRow_click.bind(this));
        //this.$Table.on("click", ".cancel-row", this.cancelRow_click);
        this.$Table.on("click", ".del-row", this.delRow_click.bind(this));
        this.$Table.on("click", ".edit-row", this.editRow_click.bind(this));
    };

    //remove unwanted html from old dg bare html - temporary
    this.makeHtmlSuitable = function () {
        this.$Table = $(`#tbl_${this.ctrl.EbSid_CtxId}`);
        this.$Table.empty();
        this.$Table.parent().attr("id", `tblcont_${this.ctrl.EbSid_CtxId}`);
        this.$Table.parent().css("overflow-y", "unset");
        this.$Table.parent().css("padding-top", "1px");
        this.$Table.parent().removeClass("Dg_body");
        this.$Table.parent().siblings('.Dg_head, .Dg_footer').remove();
    };

    this.initBasicDataTable = function () {
        this.DVColumns = this.ctrl.DVColumnColl;
        let tempData = {};
        //for (let i = 0; i < this.DVColumns.$values.length; i++)
        //    tempData[i] = null;
        //tempData[this.DVColumns.$values.length] = 0;
        tempData = { data: [] }; //temp fix

        let o = {};
        o.containerId = `tblcont_${this.ctrl.EbSid_CtxId}`;
        //o.dsid = this.dsid;
        o.tableId = `tbl_${this.ctrl.EbSid_CtxId}`;
        o.showSerialColumn = true;
        o.showCheckboxColumn = false;
        o.showFilterRow = false;
        //o.scrollHeight = this.ComboObj.DropdownHeight === 0 ? "500px" : this.ComboObj.DropdownHeight + "px";
        //o.fnDblclickCallback = this.dblClickOnOptDDEventHand.bind(this);
        //o.fnKeyUpCallback = this.xxx.bind(this);
        //o.arrowFocusCallback = this.arrowSelectionStylingFcs;
        //o.arrowBlurCallback = this.arrowSelectionStylingBlr;
        //o.fninitComplete = this.initDTpost.bind(this);
        o.dom = "<p>rt";
        //o.IsPaging = true;
        //o.pageLength = this.ComboObj.DropDownItemLimit;
        o.Source = "datagrid";
        o.hiddenFieldName = "id";
        o.keys = true;
        o.LeftFixedColumn = 1;
        o.RightFixedColumn = 1;
        //o.hiddenFieldName = this.vmName;
        //o.keyPressCallbackFn = this.DDKeyPress.bind(this);
        o.columns = this.DVColumns.$values;//////////////////////////////////////////////////////  
        //o.fninitComplete4SetVal = this.fninitComplete4SetVal;
        //o.searchCallBack = this.searchCallBack;
        o.data = tempData;
        this.datatable = new EbCommonDataTable(o);
    };

    this.initDGColCtrls = function () {
        this.DGColCtrls = {};
        for (let i = 0; i < this.ctrl.Controls.$values.length; i++) {            
            let ctrl = this.ctrl.Controls.$values[i];
            let inpCtrl = new EbObjects[ctrl.InputControlType](ctrl.EbSid_CtxId, ctrl);// creates object
            inpCtrl.ObjType = ctrl.InputControlType.substring(2);
            inpCtrl = new ControlOps[inpCtrl.ObjType](inpCtrl);// attach getValue(), ... methods
            let ctrlHtml = `<div id='@ebsid@Wraper' style='' class='ctrl-cover' eb-readonly='@isReadonly@' @singleselect@>${ctrl.DBareHtml || inpCtrl.BareControlHtml}</div>`
                .replace("@isReadonly@", ctrl.IsDisable)
                .replace("@singleselect@", ctrl.MultiSelect ? "" : `singleselect=${!ctrl.MultiSelect}`)
                .replace(/@ebsid@/g, inpCtrl.EbSid_CtxId);
            this.DGColCtrls[i] = { colCtrl: ctrl, html: ctrlHtml, inpCtrl: inpCtrl};
        }
    };

    this.addRowBtn_click = function () {
        this.setupCurTrCtrls(true, 0, 0);
    };

    this.setupCurTrCtrls = function (isNew, index, RowId) {
        if (this.currentTrIndex !== -1) {
            console.log('active row found. unable to continue.');
            return;
        }
        let Row, dtTr;
        if (isNew) {
            Row = JSON.parse(JSON.stringify(this.RowDataModel_empty));
            Row.RowId = this.addRowCounter--;
        }
        else {
            Row = getObjByval(this.dataModel, "RowId", parseInt(RowId));
        }
        
        let curRow = {};
        let j = 0;
        for (; j < this.ctrl.Controls.$values.length; j++) {
            let inpCtrl = this.DGColCtrls[j].inpCtrl;
            let Column = getObjByval(Row.Columns, "Name", inpCtrl.Name);
            inpCtrl.DataVals = Column;
            curRow[j] = this.DGColCtrls[j].html;
        }
        curRow[j++] = Row.RowId;
        curRow[j] = this.getCogTdHtml('editing');
        if (isNew) {
            dtTr = this.datatable.Api.row.add(curRow).draw(false);
        }
        else {
            dtTr = this.datatable.Api.row(index).data(curRow).draw(false);
        }

        this.currentTrIndex = dtTr.index();

        this.dataModel.push(Row);
        let rowFlatCtrls = [];

        for (let i = 0; i < this.ctrl.Controls.$values.length; i++) {
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
        this.formRenderer.FRC.bindEbOnChange2Ctrls(rowFlatCtrls);
    };

    this.getFormVals = function () {
        return getValsFromForm(this.formObject_Full);
    };

    this.editRow_click = function (e) {
        let $tr = $(e.target).closest('tr');        
        let data_row = this.datatable.Api.row($tr.index()).data();
        let rowid = data_row[this.datatable.hiddenIndex];
        this.setupCurTrCtrls(false, $tr.index(), parseInt(rowid));        
    };

    this.checkRow_click = function (e) {
        let $tr = $(e.target).closest('tr');
        let data_row = this.datatable.Api.row($tr.index()).data();
        let rowid = data_row[this.datatable.hiddenIndex];
        let Row = getObjByval(this.dataModel, "RowId", parseInt(rowid));
        let curRow = {};
        let j = 0;
        for (; j < this.ctrl.Controls.$values.length; j++) {
            let _control = this.ctrl.Controls.$values[j];
            let Column = getObjByval(Row.Columns, "Name", _control.Name);
            curRow[j] = this.getTdDivHtml(Column);
        }
        curRow[j++] = Row.RowId + '';
        curRow[j] = this.getCogTdHtml('viewing');
        this.datatable.Api.row($tr.index()).data(curRow).draw();
        this.currentTrIndex = -1;// will be equal to $tr.index() - use if cross check required
    };

    this.delRow_click = function (e) {
        let $tr = $(e.target).closest('tr');
        let data_row = this.datatable.Api.row($tr.index()).data();
        let rowid = parseInt(data_row[this.datatable.hiddenIndex]);
        if (rowid > 0) {
            let Row = getObjByval(this.dataModel, "RowId", rowid);
            Row.IsDelete = true;
        }
        else {
            let index = this.dataModel.findIndex(function (Row) { return Row.RowId === rowid; });
            this.dataModel.splice(index, 1);
        }
        this.datatable.Api.row($(e.target).closest("tr")).remove().draw();
    };

    //public function
    this.populateDGWithDataModel = function (DgDataModel) {
        this.dataModel = DgDataModel || [];
        let dvdata = [];
        for (let i = 0; i < this.dataModel.length; i++) {
            let Row = this.dataModel[i];
            let curRow = {};
            let j = 0;
            for (; j < this.ctrl.Controls.$values.length; j++) {
                let _control = this.ctrl.Controls.$values[j];
                let Column = getObjByval(Row.Columns, "Name", _control.Name);
                curRow[j] = this.getTdDivHtml(Column);
            }
            curRow[j++] = Row.RowId + '';
            curRow[j] = this.getCogTdHtml('viewing');
            dvdata.push(curRow);
            this.datatable.Api.row.add(curRow).draw(false);
        }
        if (this.dataModel.length === 0) { //temp fix
            let tempData = {};
            for (let i = 0; i < this.DVColumns.$values.length; i++)
                tempData[i] = null;
            dvdata.push(tempData);
        }
        //this.datatable.Api.rows.add({ data: dvdata}).draw(false);
    };

    this.getTdDivHtml = function (Column) {
        return `<div class='dispdiv' style='min-height: 35px; display: flex; align-items: center;';>${Column.F || Column.Value}</div>`;
    };

    this.getTdCtrlHtml = function (col) {
        return `<div id='@ebsid@Wraper' class='ctrl-cover' eb-readonly='@isReadonly@' @singleselect@>${col.DBareHtml}</div>`
            .replace("@isReadonly@", col.IsDisable)
            .replace("@singleselect@", col.MultiSelect ? "" : `singleselect=${!col.MultiSelect}`)
            .replace(/@ebsid@/g, col.EbSid_CtxId);
    };

    this.getCogTdHtml = function (rowState) {
        return `
        <div class='ctrlstd' mode='${this.mode_s}' >
            <button type='button' class='edit-row rowc' style='display: ${(rowState === 'viewing' ? 'block': 'none')};'><span class='fa fa-pencil'></span></button>
            <button type='button' class='check-row rowc' style='display: ${(rowState === 'editing' ? 'block' : 'none')};'><span class='fa fa-check'></span></button>
            <button type='button' class='del-row rowc' style='display: ${(rowState === 'viewing' ? 'block' : 'none')};'><span class='fa fa-trash'></span></button>
        </div>`;
        //<button type='button' class='cancel-row rowc' style='display: ${(rowState === 'editing' ? 'block' : 'none')};'><span class='fa fa-times'></span></button>
    };

    //public function
    this.SwitchToEditMode = function () {
        this.$Table.find(`.ctrlstd`).attr("mode", "edit");
        this.mode_s = "edit";
    };

    this.init();
};

//this.datatable.Api.rows().data();//full data collection
        //this.datatable.Api.row($tr.index()).data({ 0: null, 1: "<input type='text'>", 2: null, 3: null, 4: null, 5: null, 6: null }).draw();
        //let $dispDiv = $tr.find('.dispdiv');
        //for (let i = 0; i < $dispDiv.length; i++) {
        //    let colId = parseInt($($dispDiv[i]).attr('data-col-id'));
        //    let $ctrlDiv = $($dispDiv[i]).siblings('.ctrldiv');
        //    $ctrlDiv.empty();
        //    $ctrlDiv.append(this.ColumnCollection[colId].$ctrl);
        //    $($dispDiv[i]).hide();
        //    $ctrlDiv.show();
        //} 

//this.addRowBtn_click = function () {
//    let Row = JSON.parse(JSON.stringify(this.RowDataModel_empty));
//    Row.RowId = this.addRowCounter;
//    let curRow = { };
//    let j = 0;
//    for (; j < this.ctrl.Controls.$values.length; j++) {
//        let inpCtrl = this.DGColCtrls[j].inpCtrl;
//        let Column = getObjByval(Row.Columns, "Name", inpCtrl.Name);
//        inpCtrl.DataVals = Column;
//        curRow[j] = this.DGColCtrls[j].html;
//    }
//    curRow[j++] = this.addRowCounter--;
//    curRow[j] = this.getCogTdHtml('editing');
//    let dtTr = this.datatable.Api.row.add(curRow).draw(false);
//    this.currentTrIndex = dtTr.index();

//    this.dataModel.push(Row);
//    let rowFlatCtrls = [];

//    for (let i = 0; i < this.ctrl.Controls.$values.length; i++) {
//        let inpCtrl = this.DGColCtrls[i].inpCtrl;
//        let opt = {};
//        if (inpCtrl.ObjType === "PowerSelect")// || inpCtrl.ObjType === "DGPowerSelectColumn")
//            opt.getAllCtrlValuesFn = this.getFormVals;
//        else if (inpCtrl.ObjType === "Date") {
//            opt.source = "webform";
//            opt.userObject = this.ctrl.__userObject;
//        }
//        this.initControls.init(inpCtrl, opt);

//        if (inpCtrl.DataVals.Value !== null) {
//            inpCtrl.___DoNotUpdateDataVals = true;
//            if (ctrl.ObjType === "PowerSelect") 
//                inpCtrl.setDisplayMember(inpCtrl.DataVals.Value);
//            else
//                inpCtrl.justSetValue(inpCtrl.DataVals.Value);
//            inpCtrl.___DoNotUpdateDataVals = false;
//        }
//        rowFlatCtrls.push(inpCtrl);
//    }
//    this.formRenderer.FRC.bindEbOnChange2Ctrls(rowFlatCtrls);
//};