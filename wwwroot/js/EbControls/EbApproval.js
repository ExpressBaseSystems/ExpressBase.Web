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
    this.stages = this.ctrl.FormStages.$values;
    this.nextRole = getKeyByVal(EbEnums.KuSApproverRole, this.stages[0].ApproverRole + "");

    ctrl.setEditModeRows = function (SingleTable) {/////////// need change
        return this.setEditModeRows(SingleTable);
    }.bind(this);

    this.setEditModeRows = function (SingleTable) {
        let sortedSingleTable = SingleTable.sort(function (a, b) { return parseInt(b.RowId) - parseInt(a.RowId); });
        let lastRow = sortedSingleTable[0];
        let lastInsertedrowId = lastRow.RowId;
        let prevStageName = getObjByval(lastRow.Columns, "Name", "stage").Value;
        let prevRowData = this.getLatestRowDataOf(prevStageName, sortedSingleTable);
        let pevStatusInt = getObjByval(prevRowData, "Name", "status").Value;

        let prevStageObj = getObjByval(this.stages, "Name", prevStageName);
        let nextStageIdx = this.stages.indexOf(prevStageObj) + 1;

        if (pevStatusInt === "1")
            this.nextRole = getKeyByVal(EbEnums.KuSApproverRole, nextStageIdx + "");
        else
            this.nextRole = getKeyByVal(EbEnums.KuSApproverRole, (nextStageIdx - 1) + "");

        this.disableAllCtrls();
        let curRole = this.nextRole;
        this.setPrevStageData(sortedSingleTable, nextStageIdx);
        this.enableAccessibleRow(curRole);
        if (this.nextRole === null)// if all staged completed
            this.disableAllCtrls();
    };

    this.setPrevStageData = function (sortedSingleTable, nextStageIdx) {
        $.each(this.stages, function (i, stage) {
            if (i === nextStageIdx)
                return false;
            let stageName = stage.Name;
            let $row = $(`[name='${stageName}']`);
            let latestRowData = this.getLatestRowDataOf(stageName, sortedSingleTable);
            this.setRowData($row, latestRowData);
        }.bind(this));
    };

    this.getLatestRowDataOf = function (stageName, sortedSingleTable) {
        let dataRow;
        $.each(sortedSingleTable, function (i, row) {
            if (getObjByval(row.Columns, "Name", "stage").Value === stageName) {
                dataRow = row.Columns;
                return false;
            }
        }.bind(this));

        return dataRow;
    };

    this.setRowData = function ($row, latestRowData) {
        $.each(latestRowData, function (i, cell) {
            if (cell.Name === "status")
                $row.find("[col='status'] .selectpicker").selectpicker('val', cell.Value);
            else if (cell.Name === "remarks")
                $row.find("[col='remarks'] .fs-textarea").val(cell.Value);
            else if (cell.Name === "eb_created_at") {
                $row.find("[col='review-dtls'] .fs-time").text(cell.Value);
            }
            else if (cell.Name === "eb_created_by_name") {
                $row.find("[col='review-dtls'] .fs-uname").text(cell.Value);
            }
            else if (cell.Name === "eb_created_by_id") {
                let url = `url(../images/dp/${cell.Value}.png)`;
                $row.find("[col='review-dtls'] .fs-dp").css("background-image", url);
            }
        }.bind(this));
    };

    this.ctrl.ChangedRowObject = function () {
        if (this.editable)
            return this.changedRowWT();
        else
            return {};
    }.bind(this);

    this.changedRowWT = function () {
        let SingleTable = [];
        SingleTable.push(this.getCurRowValues());
        console.log(SingleTable);
        return SingleTable;
    };

    this.getCurRowValues = function () {
        let SingleRow = {};
        SingleRow.RowId = -1;
        SingleRow.IsUpdate = false;
        SingleRow.Columns = [{
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
        this.$container.find(".fs-submit").hide();
        this.$container.find("tr").attr("active", "false");
    };

    this.enableRow = function ($row) {
        $row.find(".fstd-div .fs-textarea").prop('disabled', false).css('pointer-events', 'inherit');
        $row.find("td[col='status'] .dropdown-toggle").prop('disabled', false).css('pointer-events', 'inherit').find(".bs-caret").show();
        this.$container.find(".fs-submit").show();
        $row.attr("active", "true");

        let url = `url(../images/dp/${this.userObj.UserId}.png)`;
        $row.find("[col='review-dtls'] .fs-dp").css("background-image", url);
        $row.find("[col='review-dtls'] .fs-uname").text(this.userObj.FullName);
    };

    this.enableAccessibleRow = function (curRole) {
        //this.userObj.Roles.push(curRole); /// TEMP
        if (this.userObj.Roles.includes(this.nextRole)) {
            this.$AccessibleRow = this.$table.find(`tr[role='${this.nextRole}']`);
            this.enableRow(this.$AccessibleRow);
            this.editable = true;
        }
        else
            this.editable = false;
    };

    this.init = function () {
        this.disableAllCtrls();
        this.enableAccessibleRow(this.nextRole);
        this.$container.on("click", ".fs-submit", this.submit);
    };

    this.init();
};