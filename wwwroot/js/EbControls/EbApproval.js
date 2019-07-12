const EbApproval = function (ctrl, options) {
    this.ctrl = ctrl;
    this.FormDataExtdObj = options.FormDataExtdObj;
    this.ctrl.formObject = options.formObject;
    this.formObject_Full = options.formObject_Full;
    this.userObj = options.userObject;
    this.FormSaveFn = options.formsaveFn;
    this.TableId = `tbl_${this.ctrl.EbSid_CtxId}`;
    this.$container = $(`#cont_${this.ctrl.EbSid_CtxId}`);
    this.$table = $(`#${this.TableId}`);

    this.EditableRowId = ///////////////////////

        this.ctrl.ChangedRowObject = function () {
            return this.changedRowWT();
        }.bind(this);

    this.changedRowWT = function () {
        let SingleTable = [];
        let inpCtrls = this.getEditedRowCtrls();
        SingleTable.push(this.getRowWTs(this.EditableRowId, inpCtrls));

        console.log(SingleTable);
        return SingleTable;
    };

    this.getRowWTs = function (rowId, inpCtrls) {
        let SingleRow = {};
        SingleRow.RowId = -1;
        SingleRow.IsUpdate = false;
        SingleRow.Columns = [];

        $.each(inpCtrls, function (i, obj) {
            SingleRow.Columns.push(getSingleColumn(obj));
        }.bind(this));
        return SingleRow;
    };

    this.confirmBoxCallBack = function (btnTxt) {
        if (btnTxt === "No")
            return;
        this.FormSaveFn();
    };

    this.submit = function () {
        EbDialog("show", {
            Message: "Are you sure, you want to submit ?",
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
            CallBack: this.confirmBoxCallBack.bind(this)
        });
    }.bind(this);

    this.init = function () {
        this.$container.on("click", ".fs-submit", this.submit);
    };

    this.init();
};