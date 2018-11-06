const EbDataGrid = function (ctrl, options) {
    this.ctrl = ctrl;

    this.getNewTrHTML = function () {
        let tr = "<tr>";
        $.each(this.ctrl.Controls.$values, function (i, col) {
            let inpCtrlType = col.InputControlType;
            let inpCtrl = new EbObjects[inpCtrlType]("ctrl_" + Date.now());
            tr += `<td><div  id='@ebsid@Wraper' class='ctrl-cover'>${inpCtrl.BareControlHtml }</div></td>`;

        }.bind(this));
        tr += "</tr>";
        return tr;
    };

    this.addRow = function (e) {
        let tr = this.getNewTrHTML();
        let $tr = $(tr);
        $(`#tbl_${this.ctrl.EbSid_CtxId} tbody`).append($tr);
    }.bind(this);

    this.init = function () {
        $(`#add_${this.ctrl.EbSid_CtxId}`).off("click").on("click", this.addRow);
    };

    this.init();
};