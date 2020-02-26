const EbReview = function (ctrl, options) {
    this.ctrl = ctrl;
    this.userObj = options.userObject;
    this.FormSaveFn = options.formsaveFn;
    this.TableId = `tbl_${this.ctrl.EbSid_CtxId}`;
    this.$container = $(`#cont_${this.ctrl.EbSid_CtxId}`);
    this.$table = $(`#${this.TableId}`);
    this.Mode = options.Mode;
    this.stages = this.ctrl.FormStages.$values;
    this.FirstStage = this.stages[0];
    this.nextRole = this.stages[0].ApproverRole + "";
    this.$currentTr = null;

    ctrl.enableAccessibleRow = function (SingleTable) {/////////// need change
        if (!this.isEditable())
            return;
        if (SingleTable.length === 0) {
            this.$currentTr = this.$table.find(`tr[name='${this.stages[0].Name}']`);
        }
        else {
            let sortedSingleTable = SingleTable.sort(function (a, b) { return parseInt(b.RowId) - parseInt(a.RowId); });
            let lastRow = sortedSingleTable[0];
            let prevStageName = getObjByval(lastRow.Columns, "Name", "stage").Value;
            let prevRowData = this.getLatestRowDataOf(prevStageName, sortedSingleTable);
            let pevStatusInt = getObjByval(prevRowData, "Name", "status").Value;

            let prevStageObj = getObjByval(this.stages, "Name", prevStageName);
            let prevStageIdx = this.stages.indexOf(prevStageObj);
            let nextStageIdx = prevStageIdx + 1;
            this.setPrevStageData(sortedSingleTable, nextStageIdx);

            if (nextStageIdx > this.stages.length - 1 && pevStatusInt === 1)// if all staged completed
            {
                this.isStagesCompleted = true;
                this.disableAllCtrls();
                this.$currentTr = null;
            }
            else {

                if (pevStatusInt === 1) {
                    this.nextRole = this.stages[nextStageIdx].ApproverRole + "";
                    this.$currentTr = this.$table.find(`tr[name='${this.stages[nextStageIdx].Name}']`);
                }
                else {
                    this.nextRole = this.stages[prevStageIdx].ApproverRole + "";
                    this.$currentTr = this.$table.find(`tr[name='${this.stages[prevStageIdx].Name}']`);
                }

                this.disableAllCtrls();
                this.isStagesCompleted = false;
            }
        }
        this.enableRow(this.$currentTr);
    }.bind(this);

    ctrl.setEditModeRows = function (SingleTable) {/////////// need change
        return this.setEditModeRows(SingleTable);
    }.bind(this);

    ctrl.disableAllCtrls = function () {
        this.disableAllCtrls();
    }.bind(this);

    this.setEditModeRows = function (SingleTable) {
        if (SingleTable.length === 0) {
            this.$currentTr = this.$table.find(`tr[name='${this.stages[0].Name}']`);
            return;
        }
        let sortedSingleTable = SingleTable.sort(function (a, b) { return parseInt(b.RowId) - parseInt(a.RowId); });
        let lastRow = sortedSingleTable[0];
        let lastInsertedrowId = lastRow.RowId;
        let prevStageName = getObjByval(lastRow.Columns, "Name", "stage").Value;
        let prevRowData = this.getLatestRowDataOf(prevStageName, sortedSingleTable);
        let pevStatusInt = getObjByval(prevRowData, "Name", "status").Value;

        let prevStageObj = getObjByval(this.stages, "Name", prevStageName);
        let prevStageIdx = this.stages.indexOf(prevStageObj);
        let nextStageIdx = prevStageIdx + 1;
        this.setPrevStageData(sortedSingleTable, nextStageIdx);

        if (nextStageIdx > this.stages.length - 1 && pevStatusInt === 1)// if all staged completed
        {
            this.isStagesCompleted = true;
            this.disableAllCtrls();
            this.$currentTr = null;
        }
        else {

            if (pevStatusInt === 1) {
                this.nextRole = this.stages[nextStageIdx].ApproverRole + "";
                this.$currentTr = this.$table.find(`tr[name='${this.stages[nextStageIdx].Name}']`);
            }
            else {
                this.nextRole = this.stages[prevStageIdx].ApproverRole + "";
                this.$currentTr = this.$table.find(`tr[name='${this.stages[prevStageIdx].Name}']`);
            }

            this.disableAllCtrls();
            this.isStagesCompleted = false;
            this.enableRow(this.$currentTr);
        }
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
        if (this.isEditable())
            return this.changedRowWT();
        else
            return null;
    }.bind(this);

    this.changedRowWT = function () {
        let SingleTable = [];
        SingleTable.push(this.getCurRowValues());
        console.log(SingleTable);
        return SingleTable;
    };

    this.getCurRowValues = function () {
        let SingleRow = {};
        if (this.$currentTr === null)
            return SingleRow;

        SingleRow.RowId = -1;
        SingleRow.IsUpdate = false;
        SingleRow.Columns = [{
            Name: "stage",
            Value: this.$currentTr.attr("name"),
            Type: 16
        }, {
            Name: "approver_role",
            Value: this.$currentTr.attr("role"),
            Type: 16
        }, {
            Name: "status",
            Value: this.$currentTr.find("[col='status'] .selectpicker").selectpicker('val'),
            Type: 7
        }, {
            Name: "remarks",
            Value: this.$currentTr.find("[col='remarks'] .fs-textarea").val(),
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
        this.$submit.hide();
        this.$container.find("tr").attr("active", "false");
    };

    this.enableRow = function ($row) {
        if (!$row)
            return;

        let role_id = this.$currentTr.attr('role');
        if (this.ctrl.Roles.hasOwnProperty(role_id) && this.Mode.isEdit && !this.isStagesCompleted) {
            $row.find(".fstd-div .fs-textarea").prop('disabled', false).css('pointer-events', 'inherit');
            $row.find("td[col='status'] .dropdown-toggle").prop('disabled', false).css('pointer-events', 'inherit').find(".bs-caret").show();
            this.$submit.show(300);
            $row.attr("active", "true");

            let url = `url(../images/dp/${this.userObj.UserId}.png)`;
            $row.find("[col='review-dtls'] .fs-dp").css("background-image", url);
            $row.find("[col='review-dtls'] .fs-uname").text(this.userObj.FullName);
        }
    };

    this.isEditable = function () {
        if (this.ctrl.Roles.hasOwnProperty(this.nextRole) && this.Mode.isEdit && !this.isStagesCompleted)
            this.editable = true;
        else
            this.editable = false;

        return this.editable;
    };

    //this.enableAccessibleRow = function (curRole) {

    //    if (this.isEditable()) {
    //        this.$AccessibleRow = this.$table.find(`tr[role='${this.nextRole}']`);

    //        this.enableRow(this.$AccessibleRow);
    //    }
    //};

    this.init = function () {
        this.isStagesCompleted = false;
        this.$submit = this.$container.find(".fs-submit");
        this.$container.on("click", ".fs-submit", this.submit);

        this.disableAllCtrls();
        //this.enableAccessibleRow(this.nextRole);
    };

    this.init();
};