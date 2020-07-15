const EbReview = function (ctrl, options) {
    this.formRenderer = options.formRenderer;
    this.afterRenderFuncs = [];
    this.ctrl = ctrl;
    ctrl._Builder = this;
    this.DataMODEL = this.formRenderer.DataMODEL[this.ctrl.TableName];
    this.userObj = options.userObject;
    this.FormSaveFn = options.formsaveFn;
    this.TableId = `tbl_${this.ctrl.EbSid_CtxId}`;
    this.$container = $(`#cont_${this.ctrl.EbSid_CtxId}`);
    this.$table = $(`#${this.TableId}`);
    this.$tableBody = $(`#${this.TableId} tbody`);
    this.Mode = options.Mode;
    this.stages = this.ctrl.FormStages.$values;
    this.FirstStage = this.stages[0];
    this.nextRole = this.stages[0].ApproverRole + "";
    this.$curActiveRow = null;

    //ctrl.populateReviewCtrlWithDataModel = function (SingleTable) {/////////// need change
    //    return this.populateReviewCtrlWithDataModel(SingleTable);
    //}.bind(this);

    ctrl.disableAllCtrls = function () {
        this.disableAllCtrls();
    }.bind(this);

    this.hide = function () {
        this.$container.hide();
    };

    this.show = function () {
        this.$container.show();
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
                let url = `url(../images/dp/${cell.Value}.png), url(../images/nulldp.png)`;
                $row.find("[col='review-dtls'] .fs-dp").css("background-image", url);
            }
        }.bind(this));
    };

    //this.ctrl.ChangedRowObject = function () {
    //    return this.changedRowWT();
    //}.bind(this);

    this.changedRowWT = function () {
        let SingleTable = [];
        SingleTable.push(this.getCurRowValues());
        console.log(SingleTable);
        return SingleTable;
    };

    this.getCurRowValues = function () {
        let action_unique_id = this.$curActiveRow.find("[col='status'] .selectpicker").selectpicker('val');
        let comments = this.$curActiveRow.find("[col='remarks'] .fs-textarea").val();

        for (let j = 0; j < this.CurStageDATA.Columns.length; j++) {
            let column = this.CurStageDATA.Columns[j];
            if (column.Name === "action_unique_id") {
                column.Value = action_unique_id;
            }
            else if (column.Name === "comments") {
                column.Value = comments;
            }
        }
        return this.CurStageDATA;
    };

    this.submitReview = function () {
        this.saveForm_call();
    };

    this.getReviewTable = function () {
        let FVWTObjColl = {};
        let tOb = this.changedRowWT();
        if (tOb)
            FVWTObjColl[this.ctrl.TableName] = tOb;
        return FVWTObjColl;
    };

    this.getDATAMODEL = function () {
        let WebformData = {};
        let reviewTable = {};
        WebformData.MultipleTables = {};

        reviewTable = this.getReviewTable();

        WebformData.MultipleTables = $.extend(WebformData.MultipleTables, reviewTable);// attach approvalTable 
        console.log(WebformData);
        return JSON.stringify(WebformData);
    };

    this.saveForm_call = function () {
        this.formRenderer.showLoader();
        let currentLoc = store.get("Eb_Loc-" + _userObject.CId + _userObject.UserId) || _userObject.Preference.DefaultLocation;
        $.ajax({
            type: "POST",
            //url: this.ssurl + "/bots",
            url: "/WebForm/InsertWebformData",
            data: {
                TableName: this.formRenderer.FormObj.TableName,
                ValObj: this.getDATAMODEL(),
                RefId: this.formRenderer.formRefId,
                RowId: this.formRenderer.rowId,
                CurrentLoc: currentLoc
            },
            error: function (xhr, ajaxOptions, thrownError) {
                this.formRenderer.hideLoader();
                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
            }.bind(this),
            //beforeSend: function (xhr) {
            //    xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
            //}.bind(this),
            success: this.saveSuccess.bind(this)
        });
    };

    this.saveSuccess = function (_respObj) {
        this.formRenderer.hideLoader();
        let respObj = JSON.parse(_respObj);
        ebcontext._formSaveResponse = respObj;

        if (respObj.Status === 200) {
            EbMessage("show", { Message: "Review submited successfully", AutoHide: true, Background: '#00aa00', Delay: 5000 });
            respObj.FormData = JSON.parse(respObj.FormData);
            this.DataMODEL = respObj.FormData.MultipleTables[this.ctrl.TableName];
            this.switch2viewMode(this.DataMODEL);
        }
        //else if (respObj.Status === 403) {
        //    EbMessage("show", { Message: "Access denied to update this data entry!", AutoHide: true, Background: '#aa0000' });
        //}
        else {
            EbMessage("show", { Message: respObj.Message, AutoHide: true, Background: '#aa0000' });
            console.error(respObj.MessageInt);
        }
    };

    this.confirmBoxCallBack = function (btnTxt) {
        //if (btnTxt === "Yes")
        //    this.FormSaveFn(true);
        if (btnTxt === "Yes")
            this.submitReview(true);
    };

    this.switch2editMode = function () {
        this.disableAllCtrls();
    };

    this.switch2viewMode = function (DataMODEL) {
        this.show();
        this.DataMODEL = DataMODEL;
        this.set();
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

    this.enableRow = function () {
        let $row = this.$tableBody.find("tr[rowid=0]");
        this.$curActiveRow = $row;
        if ($row.length === 0)
            return;

        if (!this.CurStageDATA || !this.hasPermission)
            return;

        $row.find(".fstd-div .fs-textarea").prop('disabled', false).css('pointer-events', 'inherit');
        $row.find("td[col='status'] .dropdown-toggle").prop('disabled', false).css('pointer-events', 'inherit').find(".bs-caret").show();
        this.$submit.show(300);
        $row.attr("active", "true");
    };


    this.drawTable = function () {
        this.$tableBody.empty();

        for (let i = 0; i < this.DataMODEL.length; i++) {
            let row = this.DataMODEL[i];
            let ebsid = getObjByval(row.Columns, "Name", "stage_unique_id").Value;
            let stage = getObjByval(this.stages, "EbSid", ebsid);
            let html = stage.Html;

            html = html.replace("@rowid@", row.RowId);
            html = html.replace("@slno@", i + 1);
            for (let j = 0; j < row.Columns.length; j++) {
                let column = row.Columns[j];
                if (column.Name === "eb_created_by") {
                    let userId = column.Value.split("$$")[0];
                    let userName = column.Value.split("$$")[1] || "-------";
                    let url = `url(../images/dp/${userId}.png), url(../images/nulldp.png)`;
                    if (!userId)
                        url = `url(../images/proimg.jpg)`;
                    html = html.replace("@dpstyle@", `style='background-image:${url}'`)
                        .replace("@uname@", userName);
                }
                if (column.Name === "action_unique_id") {
                    this.afterRenderFuncs.push(function (val) {
                        this.$tableBody.find(`tr[rowid='${row.RowId}'] [col='status'] .selectpicker`).selectpicker('val', column.Value);
                    }.bind(this));
                }
                //else if (column.Name === "eb_created_by") {
                //    html = html.replace("@uname@", column.Value);
                //}
                else if (column.Name === "eb_created_at") {
                    html = html.replace("@time@", column.Value || "--/--/----");
                }
                else if (column.Name === "comments") {
                    html = html.replace("@comment@", column.Value || '');
                }
            }
            this.$tableBody.append(html);
            this.runAfterRenderFuncs();
            //let $html = $(html);
            //this.$tableBody.append($html);
        }
        if (!this.hasPermission) {
            this.$tableBody.find("tr[rowid='0'] [col='review-dtls']").remove();
            this.$tableBody.find("tr[rowid='0'] [col='remarks']").remove();
            this.$tableBody.find("tr[rowid='0'] [col='status']").attr("colspan", "3").addClass("processing-td").html("Stage in Processing");
            this.$submit.hide();
        }

    };

    this.init = function () {
        this.ctrl.__ready = true;
        this.$submit = this.$container.find(".fs-submit");
        this.$container.on("click", ".fs-submit", this.submit);
    };

    this.runAfterRenderFuncs = function () {
        for (let i = 0; i < this.afterRenderFuncs.length; i++) {
            this.afterRenderFuncs[i]();
        }
    };

    this.set = function () {
        this.CurStageDATA = false;
        this.CurStageDATA = getObjByval(this.DataMODEL, "RowId", 0);
        this.isFormDataEditable = false;
        if (this.CurStageDATA) {
            this.hasPermission = getObjByval(this.CurStageDATA.Columns, "Name", "has_permission").Value === "T";
            this.isFormDataEditable = getObjByval(this.CurStageDATA.Columns, "Name", "is_form_data_editable").Value === "T";
        }
        this.drawTable();
        this.disableAllCtrls();
        if (this.CurStageDATA)
            this.enableRow();
    };

    this.init();
};