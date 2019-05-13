const DGUCColumn = function (_col, userObject) {
    this._col = _col;// UserControl Column Object
    this.base = {};
    this.userObject = userObject;
    this.AllCtrlValues = {};// row wise userControls values dict 
    this.UCs = {};// All row UserControls dict [ { rowid : object } ]
    this.initControls = new InitControls(this);// form controls initializer library
    this.curCtrl = {};// usercontrol instance which is currently represented by the modal

    // prepend modal to body
    this.addModal = function () {
        this.$modal = $(`
<div class='modal fade uc-modal' id='${this._col.EbSid}_usercontrolmodal' tabindex='-1' role='dialog' aria-labelledby='@ebsid@Title' aria-hidden='true'>
  <div class='modal-dialog modal-dialog-centered modal-lg' role='document'>
    <div class='modal-content'>
      <div class='modal-header'>
        <h5 class='modal-title' id='exampleModalLongTitle'><b>@modaltitle@</b></h5>
        <button type='button' class='close' data-dismiss='modal' aria-label='Close'>
          <span aria-hidden='true'>&times;</span>
        </button>
      </div>
        <div class='modal-body'>
            ${this._col.ChildHtml}
        </div>
      <div class='modal-footer'>
        <button id='${this._col.EbSid}_ucmodalok' type='button' class='btn btn-secondary' data-dismiss='modal'>OK</button>
      </div>
    </div>
  </div>
</div>
`.replace("@modaltitle@", this._col.Title));
        $("body").prepend(this.$modal);
    };

    this.loadValues = function () {

        $.each(this.curCtrl.Columns.$values, function (i, ctrl) {
            if (this.AllCtrlValues[this.curRowid]) {
                let val = this.AllCtrlValues[this.curRowid][ctrl.EbSid];
                if (val)
                    ctrl.setValue(val);
            }
        }.bind(this));
    };

    this.modalShowCallBack = function () {
        this.$OkBtn.attr("rowid", this.curRowid);
        this.loadValues();
        this.$modal.find(`.modal-body input[type!=hidden]:last`).focus();
    }.bind(this);

    this.modalShowBtn_click = function (e) {
        this.curRowid = $(e.target).closest("tr").attr("rowid");
        this.curCtrl = this.UCs[this.curRowid];
    }.bind(this);

    this.ok_click = function () {
        let rowId = this.$OkBtn.attr("rowid");
        this.SetCtrlValues(rowId);
    }.bind(this);

    //bind functions to modal events
    this.bindFns = function () {
        this.$OkBtn.on("click", this.ok_click);
        this.$modal.on("show.bs.modal", this.modalShowCallBack);
    };

    this.setCtrlFns = function (Uctrl) {///////////////
        $.each(Uctrl.Columns.$values, function (i, _ctrl) {
            _ctrl.getValueForModal = function () { return $("#" + this.EbSid).val(); };
            _ctrl.getValue = function (uc) { return this.__tempVal; };
            _ctrl.setValue = function (p1) { $('#' + this.EbSid).val(p1).trigger('change'); };

        }.bind(this));
    };

    this.SetCtrlValues = function (rowId) {
        let valDict = this.AllCtrlValues;
        valDict[rowId] = {};
        $.each(this.curCtrl.Columns.$values, function (i, ctrl) {
            ctrl.__tempVal = ctrl.getValueForModal();
            valDict[rowId][ctrl.EbSid] = ctrl.__tempVal;
            this.curCtrl.__Col.Columns.$values[i].clear();
        }.bind(this));
        console.log(valDict);
    };

    // add and initialize new UserControl instance to this - when a new row with UserControl added to datagrid
    this.initForctrl = function (ctrl) {
        this.curCtrl = ctrl;
        //this.initCtrlChildrens(ctrl);
        this.setCtrlFns(ctrl);
        this.UCs[this.curCtrl.__rowid] = this.curCtrl;
        this.$modalShowBtn = $(`#${this.curCtrl.EbSid_CtxId}_showbtn`);
        this.$modalShowBtn.on("click", this.modalShowBtn_click);
    };

    //initialize Controls rendered inside modal
    this.initModalCtrls = function () {
        this.ChildCols.forEach(function (ctrl, i) {
            let opt = {};
            if (ctrl.ObjType === "PowerSelect")// || ctrl.ObjType === "DGPowerSelectColumn")
                opt.getAllCtrlValuesFn = function () {
                    return [];//getValsFromForm(this.FormObj);
                }.bind(this);
            else if (ctrl.ObjType === "Date") {
                opt.source = "webform";
                opt.userObject = this.userObject;
            }
            this.initControls.init(ctrl, opt);
        }.bind(this));
    };

    //this function initialize a modal exclusively for one UserControl column in a datagrid
    this.init = function () {
        this.ChildCols= this._col.Columns.$values;// list of controls in the userControl Column
        this.addModal();
        this.initModalCtrls();

        this.$OkBtn = $(`#${this._col.EbSid}_ucmodalok`);//OK button inside modal
        this.bindFns();

    };

    this.init();
};