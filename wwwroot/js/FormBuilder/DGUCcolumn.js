const DGUCColumn = function (_col, userObject) {
    this._col = _col;
    this.base = {};
    this.userObject = userObject;
    this.base.values = {};
    this.UCs = {};
    this._col.__base = this.base;
    this.initControls = new InitControls(this);

    this.addModal = function () {
        this.$modal = $(`
<div class='modal fade' id='${this._col.EbSid}_usercontrolmodal' tabindex='-1' role='dialog' aria-labelledby='@ebsid@Title' aria-hidden='true'>
  <div class='modal-dialog modal-dialog-centered' role='document'>
    <div class='modal-content'>
      <div class='modal-header'>
        <h5 class='modal-title' id='exampleModalLongTitle'>@modaltitle@</h5>
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
            if (this.base.values[this.curRowid]) {
                let val = this.base.values[this.curRowid][ctrl.EbSid];
                if (val)
                    ctrl.setValue(val);
            }
        }.bind(this));
    };

    this.modalShowCallBack = function () {
        this.$OkBtn.attr("rowid", this.curRowid);
        this.loadValues();
    }.bind(this);

    this.modalShowBtn_click = function (e) {
        this.curRowid = $(e.target).closest("tr").attr("rowid");
        this.curCtrl = this.UCs[this.curRowid];
    }.bind(this);

    this.ok_click = function () {
        let rowId = this.$OkBtn.attr("rowid");
        this.SetCtrlValues(rowId);
    }.bind(this);

    this.bindFns = function () {
        this.$OkBtn.on("click", this.ok_click);
        this.$modal.on("show.bs.modal", this.modalShowCallBack);
    };

    this.setCtrlFns = function (Uctrl) {///////////////
        $.each(Uctrl.Columns.$values, function (i, _ctrl) {
            _ctrl.getValueForModal = function () { return $("#" + this.EbSid).val(); };
            _ctrl.getValue = function (uc) { return this.__tempVal; };
            _ctrl.setValue = function (p1) { $('#' + this.EbSid).val(p1).trigger('change'); }

        }.bind(this));
    };

    this.SetCtrlValues = function (rowId) {
        let valDict = this.base.values;
        valDict[rowId] = {};
        $.each(this.curCtrl.Columns.$values, function (i, ctrl) {
            ctrl.__tempVal = ctrl.getValueForModal();
            valDict[rowId][ctrl.EbSid] = ctrl.__tempVal;
            this.curCtrl.__Col.Columns.$values[i].clear();
        }.bind(this));
        console.log(valDict);
    };

    this.initForctrl = function (ctrl) {
        this.curCtrl = ctrl;
        //this.initCtrlChildrens(ctrl);
        this.setCtrlFns(ctrl);
        this.UCs[this.curCtrl.__rowid] = this.curCtrl;
        this.$modalShowBtn = $(`#${this.curCtrl.EbSid_CtxId}_showbtn`);
        this.$modalShowBtn.on("click", this.modalShowBtn_click);
    };

    this.initModalCtrls = function () {
        this.ChildCtrls.forEach(function (ctrl, i) {
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

    this.init = function () {
        //this.$modalShowBtns = $(`#${this._col.EbSid}_showbtn`);
        //this.$modal = $(`#${this._col.EbSid}_usercontrolmodal`);
        this.ChildCtrls = this._col.Columns.$values;
        this.addModal();
        this.initModalCtrls();

        this.$modalBody = $(`#${this._col.EbSid}_usercontrolmodal .modal-body`);
        this.$OkBtn = $(`#${this._col.EbSid}_ucmodalok`);
        this.bindFns();

    };

    this.init();
};