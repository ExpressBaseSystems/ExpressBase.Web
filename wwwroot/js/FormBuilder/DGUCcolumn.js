const DGUCColumn = function (_col, _ctrlOpt) {
    this._col = _col;
    this.base = {};
    this._col.__base = this.base;

    this.addModal = function () {
        this.$modal = `
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
`.replace("@modaltitle@", this._col.Title);
        $("body").prepend(this.$modal);
    };

    this.SetCtrlValues = function (rowId) {
        let ctrls = this.curCtrl.Columns.$values;
        let valDict = this.curCtrl.__base.values;
        valDict[rowId] = {};

        $.each(ctrls, function (i, ctrl) {
            valDict[rowId][ctrl.EbSid] = ctrl.getValue();
            ctrl.clear();
        }.bind(this));
        console.log(valDict);
    };

    this.modalShowBtn_click = function () {
        let ctrls = this.curCtrl.Columns.$values;
        let rowId = this.$modalShowBtn.closest("tr").attr("rowid");
        this.$OkBtn.attr("rowid", rowId);
        let valDict = this.curCtrl.__base.values;

        $.each(ctrls, function (i, ctrl) {
            if (valDict[rowId]) {
                let val = valDict[rowId][ctrl.EbSid];
                if (val)
                    ctrl.setValue(val);
            }
        }.bind(this));

    }.bind(this);

    this.ok_click = function () {
        let rowId = this.$OkBtn.attr("rowid");
        this.SetCtrlValues(rowId);
    }.bind(this);

    this.bindFns = function () {
        this.$OkBtn.on("click", this.ok_click);
    };

    this.initForctrl = function (ctrl) {
        this.curCtrl = ctrl;
        this.curCtrl.__base.values = {};
        this.$modalShowBtn = $(`#${this.curCtrl.EbSid_CtxId}_showbtn`);
        this.$modalShowBtn.on("click", this.modalShowBtn_click);
    };

    this.init = function () {
        //this.$modalShowBtns = $(`#${this._col.EbSid}_showbtn`);
        //this.$modal = $(`#${this._col.EbSid}_usercontrolmodal`);
        this.addModal();

        this.$modalBody = $(`#${this._col.EbSid}_usercontrolmodal .modal-body`);
        this.$OkBtn = $(`#${this._col.EbSid}_ucmodalok`);
        this.bindFns();
    };

    this.init();
};