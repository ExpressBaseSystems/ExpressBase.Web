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

    //this.setRowData = function ($row, latestRowData) {
    //    $.each(latestRowData, function (i, cell) {
    //        if (cell.Name === "status")
    //            $row.find("[col='status'] .selectpicker").selectpicker('val', cell.Value);
    //        else if (cell.Name === "remarks")
    //            $row.find("[col='remarks'] .fs-textarea").val(cell.Value);
    //        else if (cell.Name === "eb_created_at") {
    //            $row.find("[col='review-dtls'] .fs-time").text(cell.Value);
    //        }
    //        else if (cell.Name === "eb_created_by_name") {
    //            $row.find("[col='review-dtls'] .fs-uname").text(cell.Value);
    //        }
    //        else if (cell.Name === "eb_created_by_id") {
    //            let url = `url(../images/dp/${cell.Value}.png), url(../images/nulldp.png)`;
    //            $row.find("[col='review-dtls'] .fs-dp").css("background-image", url);
    //        }
    //    }.bind(this));
    //};

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
        if (this.resetFlow) {
            let data = {
                Columns: [
                    {
                        Name: 'stage_unique_id',
                        Type: 16,
                        Value: '__system_stage'
                    },
                    {
                        Name: 'action_unique_id',
                        Type: 16,
                        Value: '__review_reset'
                    },
                    {
                        Name: 'comments',
                        Type: 16,
                        Value: $(`#${this.resetPopUpId} textarea`).val()
                    },
                    {
                        Name: 'eb_my_actions_id',
                        Type: 7,
                        Value: 0
                    }
                ]
            };
            this.resetFlow = false;
            return data;
        }

        let action_unique_id, comments;


        if (this.ctrl.RenderAsTable) {
            action_unique_id = this.$curActiveRow.find("[col='status'] .selectpicker").selectpicker('val');
            comments = this.$curActiveRow.find("[col='remarks'] .fs-textarea").val();
        }
        else {
            action_unique_id = this.$container.find(".rc-inp-cont .selectpicker").selectpicker('val');
            comments = this.$container.find(".rc-inp-cont .rc-txtarea").val();
        }

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
        $.ajax({
            type: "POST",
            //url: this.ssurl + "/bots",
            url: "/WebForm/ExecuteReview",
            data: {
                Data: this.getDATAMODEL(),
                RefId: this.formRenderer.formRefId,
                RowId: this.formRenderer.rowId,
                CurrentLoc: this.formRenderer.getLocId()
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
        if (this.ctrl.RenderAsTable)
            this.disableAllCtrls();
        else
            this.$container.find(".rc-inp-cont").hide();
    };

    this.switch2viewMode = function (DataMODEL) {
        if (!this.ctrl.Hidden)
            this.show();
        this.DataMODEL = DataMODEL;
        this.set();
    };

    this.isValidationsOK = function () {
        let validationOK = true;
        if (this.CurStageDATA) {
            let stageUqid = getObjByval(this.CurStageDATA.Columns, "Name", "stage_unique_id").Value;
            let stage = getObjByval(this.stages, "EbSid", stageUqid);
            //let actUniqueId = getObjByval(row.Columns, "Name", "action_unique_id").Value;

            if (stage && stage.Validators) {
                stage.Validators.$values = sortByProp(stage.Validators.$values, "IsWarningOnly");
                $.each(stage.Validators.$values, function (i, Validator) {
                    if (Validator.IsDisabled || !Validator.Script.Code)// continue
                        return true;
                    try {
                        let res = new Function("form", "user", atob(Validator.Script.Code)).bind(this.ctrl, this.formRenderer.formObject, this.formRenderer.userObject)();
                        if (!res) {
                            if (Validator.IsWarningOnly) {
                                alert(`Validation warning while executing review in stage '${stage.Name}': ${Validator.FailureMSG}`);
                            }
                            else {
                                EbMessage("show", { Message: `Validation error while executing review in stage '${stage.Name}': ${Validator.FailureMSG}`, AutoHide: true, Background: '#aa0000' });
                                validationOK = false;
                                return false;
                            }
                        }
                    }
                    catch (e) {
                        console.error(e);
                        EbMessage("show", { Message: `Error while executing validation in stage '${stage.Name}': ${e.message}`, AutoHide: true, Background: '#aa0000' });
                        validationOK = false;
                        return false;
                    }
                }.bind(this));
            }
        }
        return validationOK;
    };

    this.submit = function () {
        if (!this.isValidationsOK())
            return;

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

    //this.appendChatInpSection = function () {
    //    if (!this.CurStageDATA || !this.hasPermission)
    //        return;
    //    this.$container.find(".rc-action-dd-wrap").append(this.curDDHtml);
    //    this.$container.find(`.rc-action-dd-wrap .selectpicker`).selectpicker('val', this.curDDval);
    //};

    this.drawCommentBox = function () {
        this.$container.find(".rc-msg-box").empty();
        for (let i = 0; i < this.DataMODEL.length; i++) {
            let row = this.DataMODEL[i];
            let ebsid = getObjByval(row.Columns, "Name", "stage_unique_id").Value;
            let actUniqueId = getObjByval(row.Columns, "Name", "action_unique_id").Value;
            let stage = getObjByval(this.stages, "EbSid", ebsid);
            let html;
            if (ebsid === '__system_stage' && actUniqueId === '__review_reset')
                html = `<div class='message' rowid='@rowid@' rowid='@rowid@'>
   <div class='fs-dp' @dpstyle@></div>
   <div class='bubble'>
	  <div class='msg-head'>System (Reset)</div>
	  <div class='msg-comment'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;@comment@</div>
	  <span class='msg-uname'>@uname@</span>
	  <div class='corner'></div>
	  <span data-toggle='tooltip' title data-original-title='@timeTitle@'>@time@</span>
   </div>
</div>`;
            else if (!stage)
                continue;
            else
                html = stage.Html;

            html = html.replace("@rowid@", row.RowId);
            html = html.replace("@slno@", i + 1);

            for (let j = 0; j < row.Columns.length; j++) {
                let column = row.Columns[j];
                if (column.Name === "eb_created_by") {
                    let userId = column.Value;
                    let userName = row.RowId === 0 ? "" : column.F;
                    let url = `url(../images/dp/${userId}.png), url(../images/nulldp.png)`;

                    if (!userId)
                        url = `url(../images/proimg.jpg)`;

                    html = html.replace("@dpstyle@", `style='background-image:${url}'`)
                        .replace("@uname@", userName);

                    if (row.RowId === 0) {
                        let $curDP = $(html).find(".fs-dp").clone();
                        html = html.replace(url, `url(../images/proimg.jpg)`)
                        this.$container.find(".rc-inp-cont .rc-action-dp-wrap").empty().prepend($curDP);
                        this.$container.find(".rc-inp-cont .rc-inp-head").empty().text(stage.Name);
                    }
                }
                if (column.Name === "action_unique_id") {
                    if (row.RowId === 0) {

                        this.$container.find(".rc-action-dd-wrap").empty().append(stage.DDHtml);
                        this.$container.find(`.rc-action-dd-wrap .selectpicker`).selectpicker('val', column.Value);
                        this.$container.find(`.rc-inp-cont .rc-txtarea`).val('');
                        html = html.replace("@action@", ``);
                        //this.curDDHtml = stage.DDHtml;
                        //this.curDDval = column.Value;
                    }
                    else if (stage)
                        html = html.replace("@action@", `(${getObjByval(stage.StageActions.$values, "EbSid", column.Value).Name})`);
                }
                else if (column.Name === "eb_created_at") {

                    if (row.RowId === 0 || column.Value === null)
                        html = html.replace("@timeTitle@", "").replace("@time@", '<i class="fa fa-clock-o" aria-hidden="true" style="font-size: 14px;"></i>');
                    else {
                        let dateString = column.Value,
                            dateTimeParts = dateString.split(' '),
                            timeParts = dateTimeParts[1].split(':'),
                            dateParts = dateTimeParts[0].split('-'),
                            date;

                        date = new Date(dateParts[0], parseInt(dateParts[1], 10) - 1, dateParts[2], timeParts[0], timeParts[1], timeParts[2]);

                        html = html.replace("@timeTitle@", column.Value).replace("@time@", timeDifference(Date.now(), date.getTime()));
                    }
                }
                else if (column.Name === "comments") {
                    if (row.RowId === 0)
                        html = html.replace("@comment@", "<span class='span-proc'>Stage in Processing...<span>");
                    else
                        html = html.replace("@comment@", column.Value || '');
                }
            }
            this.$container.find(".rc-msg-box").prepend(html);
        }

        if (!this.hasPermission) {
            this.$submit.hide();
        }

    };

    this.ctrl.setRowBackGroundColor = function (color) {
        this.ctrl.__RowBackGroundColor = color;
    }.bind(this);

    this.drawTable = function () {
        this.$tableBody.empty();
        let slnoCounter = 1;

        let execHideRowExpr = null;
        let expr = this.ctrl.HideRowExpr;
        if (expr && expr.Lang == 0 && expr.Code) {
            try {
                execHideRowExpr = atob(expr.Code);
            }
            catch (e) {
                console.error(e);
            }
        }

        for (let i = 0; i < this.DataMODEL.length; i++) {
            let row = this.DataMODEL[i];
            let ebsid = getObjByval(row.Columns, "Name", "stage_unique_id").Value;
            let actUniqueId = getObjByval(row.Columns, "Name", "action_unique_id").Value;
            let stage = getObjByval(this.stages, "EbSid", ebsid);

            let hideRowExprRes = false;
            this.ctrl.__RowBackGroundColor = null;
            if (execHideRowExpr) {
                let stageName = null, actionName = null;
                if (stage) {
                    stageName = stage.Name;
                    let action = stage.StageActions.$values.find(function (action) { return action.EbSid == actUniqueId; });
                    if (action)
                        actionName = action.Name;
                }

                this.ctrl.currentStage = stageName || ebsid;
                this.ctrl.currentAction = actionName || actUniqueId;
                this.ctrl.currentRowId = row.RowId;
                try {
                    hideRowExprRes = new Function("form", "user", execHideRowExpr).bind(this.ctrl, this.formRenderer.formObject, this.formRenderer.userObject)();
                }
                catch (e) {
                    console.error(e);
                }
            }
            if (hideRowExprRes)
                continue;

            let html;
            if (ebsid === '__system_stage' && actUniqueId === '__review_reset') {
                html = `<tr name='Stage One' rowid='@rowid@' style='@bg@'>
	<td class='row-no-td rc-slno'>@slno@</td>
	<td class='row-no-td rc-stage' col='stage'><span class='fstd-div'>System</span></td>
	<td class='row-no-td rc-status' col='status' class='fs-ctrl-td'>
		<span class='fstd-div'>Reset</span>
	</td>
	<td class='fs-ctrl-td rc-by' col='review-dtls'>
		<div class='fstd-div'>
			<div class='fs-user-cont'>
				<div class='fs-dp' @dpstyle@></div>
				<div class='fs-udtls-cont'>
					<span class='fs-uname'> @uname@ </span>
					<span class='fs-time'> @time@ </span>
				</div>
			</div>
		</div>
	</td>
	<td class='fs-ctrl-td rc-remarks' col='remarks'><div class='fstd-div'> <textarea class='fs-textarea' style ='@bg@ @bgimg@'>@comment@</textarea> </div></td>
</tr>`;
            }
            else if (!stage)
                continue;
            else
                html = stage.Html;

            html = html.replace("@rowid@", row.RowId);
            html = html.replace("@slno@", slnoCounter++);
            if (this.ctrl.__RowBackGroundColor) {
                html = html.replaceAll("@bg@", `background-color: ${this.ctrl.__RowBackGroundColor} !important;`);
                html = html.replace("@bgimg@", 'background-image: none;');
            }
            else {
                html = html.replaceAll("@bg@", '');
                html = html.replace("@bgimg@", '');
            }

            for (let j = 0; j < row.Columns.length; j++) {
                let column = row.Columns[j];
                if (column.Name === "eb_created_by") {
                    let userId = column.Value;
                    let userName = column.F || "-------";
                    let url = `url(../images/dp/${userId}.png), url(../images/nulldp.png)`;
                    if (!userId)
                        url = `url(../images/proimg.jpg)`;
                    html = html.replace("@dpstyle@", `style='background-image:${url}'`)
                        .replace("@uname@", userName);
                }
                if (column.Name === "action_unique_id") {
                    this.afterRenderFuncs.push(function (stage) {
                        let $sel = this.$tableBody.find(`tr[rowid='${row.RowId}'] [col='status'] .selectpicker`);
                        if ($sel.length > 0) {
                            if (row.RowId > 0) {
                                let action = stage.StageActions.$values.find(function (action) { return action.EbSid == column.Value; });
                                let actname = action ? action.Name : '';
                                $sel.closest('.rc-status').html(`<span class='fstd-div'>${actname}</span>`);
                            }
                            else {
                                $sel.selectpicker({
                                    container: `#${this.formRenderer.FormObj.EbSid_CtxId}`
                                });
                                $sel.selectpicker('val', column.Value);
                            }
                        }
                    }.bind(this));
                }
                else if (column.Name === "eb_created_at") {
                    html = html.replace("@time@", column.F || column.Value || "--/--/----");
                }
                else if (column.Name === "comments") {
                    html = html.replace("@comment@", column.Value || '');
                }
            }
            this.$tableBody.append(html);
            this.runAfterRenderFuncs(stage);
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

    this.runAfterRenderFuncs = function (stage) {
        for (let i = 0; i < this.afterRenderFuncs.length; i++) {
            this.afterRenderFuncs[i](stage);
        }
    };

    this.disableAllCtrls = function () {
        //this.$table.find('.selectpicker').selectpicker();
        this.$table.find(".fstd-div .fs-textarea").attr('disabled', 'disabled').css('pointer-events', 'none');
        this.$table.find("td[col='status'] .dropdown-toggle").attr('disabled', 'disabled').css('pointer-events', 'none').find(".bs-caret").hide();
        this.$tableBody.find("tr[rowid='0']").hide();
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

        $row.show();
        $row.find(".fstd-div .fs-textarea").prop('disabled', false).css('pointer-events', 'inherit');
        $row.find("td[col='status'] .dropdown-toggle").prop('disabled', false).css('pointer-events', 'inherit').find(".bs-caret").show();
        $row.attr("active", "true");
    };

    this.set = function () {
        this.CurStageDATA = false;
        this.CurStageDATA = getObjByval(this.DataMODEL, "RowId", 0);
        this.isFormDataEditable = false;
        if (this.CurStageDATA) {
            this.hasPermission = getObjByval(this.CurStageDATA.Columns, "Name", "has_permission").Value === "T";//false;//
            this.isFormDataEditable = getObjByval(this.CurStageDATA.Columns, "Name", "is_form_data_editable").Value === "T";
            if (!this.isFormDataEditable)
                this.formRenderer.disableformEditbtn();////
            else
                this.formRenderer.enableformEditbtn();
        }
        else if (this.ctrl.AllowEditOnCompletion || this.DataMODEL.length === 0)
            this.isFormDataEditable = true;


        if (this.ctrl.RenderAsTable) {
            this.drawTable();
            this.disableAllCtrls();
            if (this.CurStageDATA)
                this.enableRow();
        }
        else {
            this.drawCommentBox();
            this.$container.find(".message[rowid='0']").show();
            this.$container.find(".rc-inp-cont").hide();
            this.showResetBtn();
            if (!this.CurStageDATA || !this.hasPermission)
                return;

            //this.$container.find(".message[rowid='0']").hide();
            this.$container.find(".rc-inp-cont").show();
        }

        this.showResetBtn();

        if (!this.CurStageDATA || !this.hasPermission)
            return;

        this.$submit.show(300);
    };

    this.showResetBtn = function () {
        let roleIds = [];
        let hasResetPerm = false;
        if (this.ctrl.ResetterRoles && this.ctrl.ResetterRoles.$values)
            roleIds = this.ctrl.ResetterRoles.$values;
        if (ebcontext.user.RoleIds.includes(1) || ebcontext.user.RoleIds.includes(2) || ebcontext.user.RoleIds.some(e => roleIds.includes(e)))
            hasResetPerm = true;

        if (!hasResetPerm)
            return;
        let $btnParent = this.$container.find('.fs-grid-cont');
        if ($btnParent.length > 0 && $btnParent.find('.reset-btn').length === 0)
            $btnParent.append(`<div class="reset-btn"><i class="fa fa-wrench" aria-hidden="true"></i> Reset</div>`);

        this.resetPopUpId = `${this.ctrl.EbSid_CtxId}-reset`;
        let popUpContent = `
            <div id='${this.resetPopUpId}' class='review-reset-popover'>
                <div>
                    <div style='color: #555;'>Remarks</div>
                    <textarea></textarea>
                </div>
                <div class='review-reset-btn-cont'>
                    <div class='review-reset-btn'>Reset</div>
                </div>
            </div>`
        let $resetBtn = this.$container.find('.fs-grid-cont .reset-btn');

        let $poTrig = $resetBtn.popover({
            trigger: 'manual',
            html: true,
            container: "body",
            placement: 'left',
            content: popUpContent,
            delay: { "hide": 100 }
        });

        let timer1;

        let OnMouseEnter = function () {
            clearTimeout(timer1);
            let _this = this;
            let $poDiv = $('#' + $(_this).attr('aria-describedby'));
            if (!$poDiv.length) {
                $(_this).popover("show");
                $poDiv = $('#' + $(_this).attr('aria-describedby'));
            }
            $poDiv.off("mouseleave").on("mouseleave", function () {
                timer1 = setTimeout(function () { $(_this).popover('hide'); }, 500);
            });

            $poDiv.off("mouseenter").on("mouseenter", function () {
                clearTimeout(timer1);
            });
        };

        let OnMouseLeave = function () {
            let _this = this;
            timer1 = setTimeout(function () {
                if (!$('#' + $(_this).attr('aria-describedby') + ':hover').length) {
                    $(_this).popover("hide");
                }
            }, 500);
        };

        let initiateReset = function () {
            this.resetFlow = true;
            $poTrig.popover('hide');
            this.saveForm_call();
        };

        $poTrig.on('click', OnMouseEnter.bind($poTrig));
        $poTrig.on('mouseleave', OnMouseLeave.bind($poTrig));
        $('body').off('click', `#${this.resetPopUpId} .review-reset-btn`).on('click', `#${this.resetPopUpId} .review-reset-btn`, initiateReset.bind(this));
    };

    this.init();
};