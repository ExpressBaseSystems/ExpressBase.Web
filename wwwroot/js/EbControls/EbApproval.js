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
    this.nextRole = getKeyByVal(EbEnums.KuSApproverRole, this.ctrl.FormStages.$values[0].ApproverRole + "");

    ctrl.setEditModeRows = function (SingleTable) {/////////// need change
        return this.setEditModeRows(SingleTable);
    }.bind(this);

    this.setEditModeRows = function (SingleTable) {
        console.log(SingleTable);
    };

    this.ctrl.ChangedRowObject = function () {
        return this.changedRowWT();
    }.bind(this);

    this.changedRowWT = function () {
        let SingleTable = [];
        SingleTable.push(this.getCurRowValues());
        console.log(SingleTable);
        return SingleTable;
    };

    this.getCurRowValues = function () {
        this.$AccessibleRow;

        let objArr = [{
            Name: "stage",
            Value: this.$AccessibleRow.attr("name"),
            Type: 16
        }, {
            Name: "approver_role",
            Value: this.$AccessibleRow.attr("role"),
            Type: 16
        }, {
            Name: "status",
            Value: this.$AccessibleRow.find("[col='status'] .selectpicker").selectpicker('val'),
            Type: 7
        }, {
            Name: "remarks",
                Value: this.$AccessibleRow.find("[col='remarks'] .fs-textarea").val(),
            Type: 16
        }];

        return objArr;
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
        if (btnTxt === "Yes")
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

    this.disableAllCtrls = function () {
        $('.selectpicker').selectpicker();
        this.$table.find(".fstd-div .fs-textarea").attr('disabled', 'disabled').css('pointer-events', 'none');
        this.$table.find("td[col='status'] .dropdown-toggle").attr('disabled', 'disabled').css('pointer-events', 'none').find(".bs-caret").hide();
    };
    this.enableRow = function ($row) {
        $row.find(".fstd-div .fs-textarea").prop('disabled', false).css('pointer-events', 'inherit');
        $row.find("td[col='status'] .dropdown-toggle").prop('disabled', false).css('pointer-events', 'inherit').find(".bs-caret").show();
    };

    this.enableAccessibleRow = function () {
        this.userObj.Roles.push(this.nextRole); /// TEMP
        if (this.userObj.Roles.includes(this.nextRole)) {
            this.$AccessibleRow = this.$table.find(`tr[role='${this.nextRole}']`);
            this.enableRow(this.$AccessibleRow);
        }
    };

    this.init = function () {
        this.disableAllCtrls();
        this.enableAccessibleRow();
        this.$container.on("click", ".fs-submit", this.submit);
    };

    this.init();
};