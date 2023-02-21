const EbDataGrid = function (ctrl, options) {
    this.ctrl = ctrl;
    this.DGcols = this.ctrl.Controls.$values;
    this.ctrl.formObject = options.formObject; //'form' in JsScript
    this.formObject_Full = options.formObject_Full; //original object
    this.formRenderer = options.formRenderer;
    this.formRefId = options.formRefId;
    this.ctrl.__userObject = options.userObject;
    this.initControls = new InitControls(this.formRenderer);
    this.Mode = options.Mode;
    this.RowDataModel_empty = this.formRenderer.formData.DGsRowDataModel[this.ctrl.TableName];
    this.DataMODEL = options.isDynamic ? [] : this.formRenderer.DataMODEL[this.ctrl.TableName];
    this.TableId = `tbl_${this.ctrl.EbSid_CtxId}`;
    this.$table = $(`#${this.TableId}`);
    this.$gridCont = $(`#cont_${this.ctrl.EbSid} .grid-cont`);
    this.$SlTable = $(`#slno_${this.ctrl.EbSid}`);
    this.SlTableId = `#slno_${this.ctrl.EbSid}`;
    this.$DGbody = $(`#${this.ctrl.EbSid}Wraper .Dg_body`);
    this.$ActiveTd = null;
    this.trHeightInPx = 38;
    this.visibleTrViewSize = 60;
    this.visibleTrViewMargin = 70;//top and bottom margin
    this.visibleTrWindowSize = this.visibleTrViewSize + this.visibleTrViewMargin * 2;
    this.disableVScrollAdjust = false;

    this.mode_s = "";
    if (this.Mode.isEdit)
        this.mode_s = "edit";
    else if (this.Mode.isNew)
        this.mode_s = "new";
    else if (this.Mode.isView)
        this.mode_s = "view";

    this.objectMODEL = {};

    this.resetBuffers = function () {
        this.curRowObjectMODEL = {};
        this.curRowDataMODEL = {};
        this.newRowCounter = 0;
        this.rowSLCounter = 0;
    }.bind(this);
    this.resetBuffers();

    this.populateDGWithDataModel = function (dataModel, fromRefresh) {
        this.DataMODEL = dataModel;
        //this.curRowDataMODEL = this.getRowDataModel_();
        this.curRowDataMODEL = JSON.parse(JSON.stringify(this.RowDataModel_empty));
        this.constructObjectModel(this.DataMODEL);// and attach dataModel reff
        this.fixValExpInDataModel();
        this.drawHTMLView();
        this.callOnRowPaintFns();
        this.updateAggCols(fromRefresh);
        if (this.DataMODEL.length > 1 && this.DataMODEL[this.DataMODEL.length - 1].RowId < 0)
            this.newRowCounter = this.DataMODEL[this.DataMODEL.length - 1].RowId; // for clone or import
    }.bind(this);

    this.constructObjectModel = function (dataRows) {
        this.objectMODEL = {};
        let visibleCtrlIdx = 0;
        for (let i = 0; i < dataRows.length; i++) {
            let dataRow = dataRows[i];
            let rowId = dataRow.RowId;
            this.objectMODEL[rowId] = [];

            for (let colIndex = 0; colIndex < this.ctrl.Controls.$values.length; colIndex++) {
                let col = this.ctrl.Controls.$values[colIndex];
                let inpCtrlType = col.InputControlType;
                let ctrlEbSid = "ctrl_" + Date.now().toString(36) + visibleCtrlIdx++;// creates a unique id
                let inpCtrl = new EbObjects_w[inpCtrlType](ctrlEbSid, col);// creates object
                inpCtrl.__isEditing = false;
                inpCtrl.DataVals = getObjByval(dataRow.Columns, "Name", col.Name);
                inpCtrl.curRowDataVals = JSON.parse(JSON.stringify(getObjByval(this.curRowDataMODEL.Columns, "Name", col.Name)));
                inpCtrl.curRowDataVals = Object.assign(inpCtrl.curRowDataVals, inpCtrl.DataVals);
                this.addPropsToInpCtrl(inpCtrl, col, ctrlEbSid, rowId);
                inpCtrl = this.attachFns(inpCtrl, col.ObjType);// attach getValue(), ... methods
                this.objectMODEL[rowId].push(inpCtrl);
            }
        }
    };

    this.fixValExpInDataModel = function () {
        $.each(this.objectMODEL, function (rowId, inpCtrls) {
            this.setCurRow(rowId);
            for (let i = 0; i < inpCtrls.length; i++) {
                let inpCtrl = inpCtrls[i];
                if (inpCtrl.DoNotPersist && inpCtrl.ValueExpr && inpCtrl.ValueExpr.Lang === 0 && inpCtrl.ValueExpr.Code) {
                    let ValueExpr_val = getValueExprValue(inpCtrl, this.ctrl.formObject, this.ctrl.__userObject);
                    ValueExpr_val = this.formRenderer.FRC.getProcessedValue(inpCtrl, ValueExpr_val);
                    inpCtrl.DataVals.Value = ValueExpr_val;
                    if (inpCtrl.ObjType === "Numeric")
                        inpCtrl.DataVals.F = ValueExpr_val.toFixed(inpCtrl.DecimalPlaces);
                }
            }
            //this.onRowPaintFn(["tr"], "check", "e");// --
        }.bind(this));
    };

    this.execDisableExpr = function () {
        if (!this.ctrl.currentRow)
            return;
        $.each(this.ctrl.currentRow, function (rowId, inpCtrl) {
            try {
                if (!inpCtrl.Hidden && inpCtrl.DisableExpr && inpCtrl.DisableExpr.Lang === 0 && inpCtrl.DisableExpr.Code) {
                    let isDisable = new Function("form", "user", `event`, atob(inpCtrl.DisableExpr.Code)).bind(inpCtrl, this.ctrl.formObject, this.ctrl.__userObject)();
                    if (isDisable) {
                        inpCtrl.disable();
                        inpCtrl.__IsDisableByExp = true;
                    }
                    else {
                        if (!this.formRenderer.Mode.isView) {
                            inpCtrl.enable();
                            inpCtrl.__IsDisableByExp = false;
                        }
                    }
                    inpCtrl.IsDisable = val ? true : false;
                }
            }
            catch (e) {
                console.error(e);
            }
        }.bind(this));
    };

    this.callOnRowPaintFns = function () {
        $.each(this.objectMODEL, function (rowId, inpCtrls) {
            this.setCurRow(rowId);
            this.onRowPaintFn(["tr"], "check", "e");
        }.bind(this));
    };

    this.drawHTMLView = function () {
        $(`#${this.TableId} tbody`).empty();
        this.resetBuffers();
        let trsHTML = this.getTrsHTML_(0);
        if (this.ctrl.DeferRender)
            this.adjustMargin(0);
        //if (!this.ctrl.AscendingOrder)
        //    this.UpdateSlNo();
        $(`#${this.TableId}>tbody`).append(trsHTML);
        $(`#${this.TableId}>tbody`).find(".ctrlstd .check-row").hide();
        $(`#${this.TableId}>tbody`).find(".ctrlstd .del-row").show();
        $(`#${this.TableId}>tbody`).find(".ctrlstd .edit-row").show();
    };

    this.getTrsHTML_ = function (startIdx) {
        let TrsHTML = [];
        //let rowIds = Object.keys(this.objectMODEL);
        let rowIds = this.DataMODEL.filter(e => !e.IsDelete).map(a => a.RowId);
        this.rowSLCounter = startIdx;
        for (let i = startIdx, j = 0; i < rowIds.length && (!this.ctrl.DeferRender || j < this.visibleTrWindowSize); i++, j++) {
            let rowId = rowIds[i];
            TrsHTML.push(this.getTrHTML_(this.objectMODEL[rowId], rowId, false));
        }
        this.rowSLCounter = rowIds.length;
        return TrsHTML.join();
    };

    //full grid draw
    this.getTrHTML_ = function (rowCtrls, rowid, isAdded) {
        let isAnyColEditable = false;
        let tr = `<tr class='dgtr' is-editing='${isAdded}' is-initialised='false' is-checked='true' is-added='${isAdded}' rowid='${rowid}' rownum='${++this.rowSLCounter}'>
                    <td class='row-no-td ${(rowid <= 0 ? "new-dgtr' title='Newly added row" : '')}' id='${this.TableId + "_" + this.rowSLCounter}_sl' idx='${this.rowSLCounter}'>${this.rowSLCounter}</td>`;

        let visibleCtrlIdx = 0;

        for (let i = 0; i < rowCtrls.length; i++) {
            let inpCtrl = rowCtrls[i];
            if (inpCtrl.Hidden)
                continue;
            if (!inpCtrl.DataVals && !inpCtrl.DoNotPersist)
                continue;
            tr += this.getTdHtml_(inpCtrl, visibleCtrlIdx);
            if (inpCtrl.IsEditable)
                isAnyColEditable = true;
            visibleCtrlIdx++;
        }

        this.S_cogsTdHtml = this.getCogsTdHtml(isAnyColEditable);
        tr += this.S_cogsTdHtml;
        return tr;
    };

    //full grid draw
    this.getTdHtml_ = function (inpCtrl, visibleCtrlIdx) {
        let col = inpCtrl.__Col;
        let html = `<td id ='td_@ebsid@' ctrltdidx='${visibleCtrlIdx}' tabindex='0' tdcoltype='${col.ObjType}' agg='${col.IsAggragate}' colname='${col.Name}' style='width:${this.getTdWidth(visibleCtrlIdx, col)}; background-color: @back-color@; display: inline-block;' form-link='@form-link@'>`;

        if (this.canAddCtrlHtml(inpCtrl))
            html += `<div id='@ebsid@Wraper' style='display:none' class='ctrl-cover' eb-readonly='@isReadonly@' @singleselect@>${col.DBareHtml || inpCtrl.BareControlHtml}</div>`;

        html += `<div class='tdtxt' style='display:block' coltype='${col.ObjType}'>
                   <span>${this.getDispMembr(inpCtrl)}</span>
                 </div >
               </td>`;

        html = html.replace("@isReadonly@", col.IsDisable)
            .replace("@back-color@", col.IsDisable ? 'rgba(238,238,238,0.6)' : 'transparent')
            .replace("@singleselect@", col.MultiSelect ? "" : `singleselect=${!col.MultiSelect}`)
            .replace("@form-link@", col.FormRefId ? 'true' : 'false')
            .replace(/@ebsid@/g, inpCtrl.EbSid_CtxId);

        return html;
    };

    //new row html
    this.getTdHtml = function (inpCtrl, col, i) {
        let html = `<td id ='td_@ebsid@' ctrltdidx='${i}' tabindex='0' tdcoltype='${col.ObjType}' agg='${col.IsAggragate}' colname='${col.Name}' style='width:${this.getTdWidth(i, col)}; display: inline-block;' form-link='@form-link@'>`;

        if (this.canAddCtrlHtml(inpCtrl))
            html += `<div id='@ebsid@Wraper' class='ctrl-cover' eb-readonly='@isReadonly@' @singleselect@>${col.DBareHtml || inpCtrl.BareControlHtml}</div>`;

        html += `<div class='tdtxt' coltype='${col.ObjType}'><span></span></div>
                </td>`;

        html = html
            .replace("@isReadonly@", col.IsDisable)
            .replace("@singleselect@", col.MultiSelect ? "" : `singleselect=${!col.MultiSelect}`)
            .replace("@form-link@", col.FormRefId ? 'true' : 'false')
            .replace(/@ebsid@/g, inpCtrl.EbSid_CtxId);

        return html;
    };

    this.canAddCtrlHtml = function (inpCtrl) {
        return !(inpCtrl.IsDisable && inpCtrl.ObjType == 'TextBox' && inpCtrl.ValueExpr && !inpCtrl.ValueExpr.Code);
    }.bind(this);

    this.changeEditFlagInRowCtrls = function (val, rowId) {
        let curRowCtrls = this.objectMODEL[rowId];
        for (let i = 0; i < curRowCtrls.length; i++) {
            let inpCtrl = curRowCtrls[i];
            inpCtrl.__isEditing = val;
        }
    };

    this.rowInit_E = function ($tr, rowId) {
        for (let i = 0; i < this.ctrl.Controls.$values.length; i++) {
            let col = this.ctrl.Controls.$values[i];
            let inpCtrl = getObjByval(this.objectMODEL[rowId], "Name", col.Name);
            let inpCtrlType = col.InputControlType;
            if (inpCtrlType === "EbUserControl")
                this.manageUCObj(inpCtrl, col);
        }
        this.initRowCtrls(rowId, true);
        //
        let curRowCtrls = this.objectMODEL[rowId];

        this.setRowValues_E(curRowCtrls);
        //this.attachModalCellRef_Row(getObjByval(this.DataMODEL, "RowId", rowid), curRowCtrls);

        this.bindReq_Vali_UniqRow($tr);// need to check relavance

        $tr.attr("is-initialised", "true");
    };

    this.initRowCtrls = function (rowId, IsNoValExp) {
        let CurRowCtrls = this.objectMODEL[rowId];
        this.changeEditFlagInRowCtrls(true, rowId);

        //// initialise all controls in added row
        for (let i = 0; i < CurRowCtrls.length; i++) {
            let inpCtrl = CurRowCtrls[i];
            if (!this.canAddCtrlHtml(inpCtrl))
                continue;
            let opt = {};
            if (inpCtrl.ObjType === "PowerSelect")// || inpCtrl.ObjType === "DGPowerSelectColumn")
                opt.getAllCtrlValuesFn = this.getFormVals;
            else if (inpCtrl.ObjType === "Date") {
                opt.source = "webform";
                opt.userObject = this.ctrl.__userObject;
            }

            //let t0 = performance.now();
            this.initControls.init(inpCtrl, opt);
            //console.dev_log("initControls : " + inpCtrl.ObjType + " took " + (performance.now() - t0) + " milliseconds.");

        }

        //should fire after onChangeFn init
        for (let j = 0; j < CurRowCtrls.length; j++) {
            let inpCtrl = CurRowCtrls[j];

            if (!IsNoValExp) {
                // DefaultValueExpression
                if (inpCtrl.DefaultValueExpression && inpCtrl.DefaultValueExpression.Code) {
                    try {
                        let fun = new Function("form", "user", `event`, atob(inpCtrl.DefaultValueExpression.Code)).bind(inpCtrl, this.ctrl.formObject, this.ctrl.__userObject);
                        let val = fun();
                        inpCtrl.setValue(val);
                    }
                    catch (e) {
                        console.error('error in grid default value expr: ' + inpCtrl.Name);
                        console.warn(e);
                    }
                }
            }

            // disble 
            if (inpCtrl.IsDisable && !inpCtrl.Hidden && this.canAddCtrlHtml(inpCtrl))
                inpCtrl.disable();

        }

        //should fire after all default value set
        if (!IsNoValExp) {
            $.each(this.objectMODEL[rowId], function (i, inpCtrl) {
                EbRunValueExpr(inpCtrl, this.ctrl.formObject, this.ctrl.__userObject, this.formObject_Full);
            }.bind(this));
        }

        return this.objectMODEL[rowId];
    };

    this.setRowValues_E = function (curRowCtrls) {
        for (let i = 0; i < curRowCtrls.length; i++) {
            let ctrl = curRowCtrls[i];
            let Value = ctrl.DataVals.Value;
            if (Value !== null) {

                ctrl.___DoNotUpdateDataVals = true;

                if (!this.canAddCtrlHtml(ctrl)) {
                    //ctrl.setDisplayMember(Value);
                }
                else if (ctrl.ObjType === "PowerSelect") {
                    ctrl.__isInitiallyPopulating = true;
                    ctrl.setDisplayMember(Value);
                }
                else
                    ctrl.justSetValue(Value);

                ctrl.___DoNotUpdateDataVals = false;
            }
        }
    };

    this.getPSDispMembrs = function (inpCtrl) {
        let rowId = inpCtrl.__rowid;
        let cellObj = inpCtrl.DataVals;
        let col = inpCtrl.__Col;
        if (col.RenderAsSimpleSelect) {
            let v = this.getSSDispMembrs(cellObj, rowId, col)
            return `<span style='padding: 8px 6px; display: flex;'>${v}</span>`;
        }
        if (!cellObj.Value && cellObj.Value !== 0)
            return "";

        let valMsArr = cellObj.Value.toString().split(',');
        let textspn = "";

        let vm0 = parseInt(valMsArr[0]);
        let dispDict0 = cellObj.D[vm0];
        let dispKeys = Object.keys(dispDict0);
        for (let j = 0; j < dispKeys.length; j++) {
            let dispKey = dispKeys[j]
            let widthStyle = `style="width: 100%; pointer-events: auto;"`;
            if (inpCtrl.DisplayMembers) {
                let widthper = inpCtrl.DisplayMembers.$values.find(e => e.name == dispKey).Width;
                if (widthper > 0 && widthper <= 100)
                    widthStyle = `style="width: ${widthper}%; pointer-events: auto;"`;
            }
            textspn += `<div iblock ${widthStyle}>`;
            for (let k = 0; k < valMsArr.length; k++) {
                let vm = parseInt(valMsArr[k]);
                let dispDict = cellObj.D[vm];
                let DMVal = dispDict[dispKey] == null ? "" : dispDict[dispKey];
                textspn += `<div class='selected-tag' title="${DMVal}">${DMVal}</div>`;

            }

            textspn += "</div>";
        }

        return textspn;//.substr(0, textspn.length - 18);
    };

    this.getSSDispMembrs = function (cellObj, rowId, col) {
        if (!cellObj.Value && cellObj.Value !== 0)
            return "";
        let opts = col.Options.$values;
        let val;
        for (var i = 0; i < opts.length; i++) {
            let opt = opts[i];
            if (opt.Value === cellObj.Value.toString())
                val = opt.DisplayName;
        }
        return val === undefined ? "" : val;
    };

    this.getBSDispMembrs = function (cellObj, rowId, col) {
        if (cellObj.Value === true)
            return col.TrueText;
        else
            return col.FalseText;
    };

    this.getBooleanDispMembrs = function (val) {
        if (val === true)
            return "<span style='text-align: center;'><i class='fa fa-check-square-o' style='width: 100%;'></i></span>";
        else
            return "<span style='text-align: center;'><i class='fa fa-square-o' style='width: 100%;'></i></span>";
    };

    this.getDispMembr = function (inpCtrl) {
        let rowId = inpCtrl.__rowid;
        let cellObj = inpCtrl.DataVals;
        let col = inpCtrl.__Col;
        let dspMmbr = "";

        if (!cellObj.Value === null)
            return "";

        else if (col.ObjType === "DGPowerSelectColumn") {
            dspMmbr = this.getPSDispMembrs(inpCtrl);
        }
        else if (col.ObjType === "DGSimpleSelectColumn") {
            dspMmbr = this.getSSDispMembrs(cellObj, rowId, col);
        }
        else if (col.ObjType === "DGBooleanSelectColumn") {
            dspMmbr = this.getBSDispMembrs(cellObj, rowId, col);
        }
        else if (col.ObjType === "DGBooleanColumn") {
            dspMmbr = this.getBooleanDispMembrs(cellObj.Value || false);
        }
        else if (col.ObjType === "DGNumericColumn") {
            dspMmbr = col.InputMode == 1 ? cellObj.Value.toLocaleString('en-IN', { maximumFractionDigits: col.DecimalPlaces, minimumFractionDigits: col.DecimalPlaces }) : cellObj.Value.toFixed(col.DecimalPlaces);// cellObj.F || (col.DecimalPlaces === 0 ? '0' : ('0.' + '0'.repeat(col.DecimalPlaces))); // temporary fix
        }
        else if ((col.ObjType === "DGDateColumn") || (col.ObjType === "DGCreatedAtColumn") || (col.ObjType === "DGModifiedAtColumn")) {
            if (cellObj.Value === null)
                dspMmbr = "";//ebcontext.user.Preference.ShortDatePattern.replace(/-/g, "/").replace(/D|M|Y|d|m|y/g, "-");
            else
                dspMmbr = cellObj.F;
            //else if (col.EbDbType === 6)
            //    dspMmbr = moment(cellObj.Value).format(ebcontext.user.Preference.ShortDatePattern + " " + ebcontext.user.Preference.ShortTimePattern);
            //else if (col.EbDbType === 5)
            //    dspMmbr = moment(cellObj.Value).format(ebcontext.user.Preference.ShortDatePattern);
            //else if (col.EbDbType === 17)
            //    dspMmbr = moment(cellObj.Value).format(ebcontext.user.Preference.ShortTimePattern);
        }
        else if (col.ObjType === "DGCreatedByColumn" || col.ObjType === "DGModifiedByColumn") {
            let spn = '';
            if (cellObj.Value == null) {
                spn = `<img class='sysctrl_usrimg' src='/images/nulldp.png' alt='' onerror="this.onerror=null; this.src='/images/nulldp.png';">`;
            }
            else {
                spn = `<img class='sysctrl_usrimg' src='/images/dp/${cellObj.Value}.png' alt='' onerror="this.onerror=null; this.src='/images/nulldp.png';">`;
                spn += `<span class='sysctrl_usrname'>${cellObj.F}</span>`;
            }
            dspMmbr = spn;
        }
        else if (col.ObjType === "DGUserSelectColumn") {
            let ulObj = inpCtrl.UserList.$values.find(e => e.vm === cellObj.Value);
            if (ulObj)
                dspMmbr = `<img class='sysctrl_usrimg' src='/images/dp/${ulObj.vm}.png' alt='' onerror="this.src='/images/nulldp.png'"> <span class='sysctrl_usrname'>${ulObj.dm1}</span>`;
        }
        else
            dspMmbr = cellObj.Value || "";

        return dspMmbr;
    };

    ctrl.isValid = function () { //////////////????
        return this.isValid() && this.isFinished();
    }.bind(this);

    this.isFinished = function () {
        let isEditing = false;
        $.each(this.objectMODEL, function (rowId, inpCtrls) {
            if ($(`#${this.TableId} tbody tr[rowid=${rowId}]`).attr("is-editing") === "true") {
                isEditing = true;
                EbMessage("show", { Message: "Finish DataGrid editing before Saving", Background: "#ee7700" });
            }
        }.bind(this));
        return !isEditing;
    };

    this.tryAddRow = function () {
        if ((this.Mode.isEdit || this.Mode.isNew) && this.ctrl.IsAddable && !this.ctrl.IsDisable) {
            this.addRow();
            //this.focusOnFirstInput($(`#${this.TableId}>tbody tr[is-editing="true"]`));
        }
        //if (this.Mode.isEdit)
        //    $(`.ctrlstd[mode] `).attr("mode", "edit");
        //if (this.Mode.isNew)
        //    $(`.ctrlstd[mode] `).attr("mode", "new");
    };

    this.focusOnFirstInput = function ($tr) {
        let a = $tr.find('td input:enabled:visible');
        if (a.length > 0) {
            if (!(this.DGcols[0].Hidden || this.DGcols[0].IsDisable))
                $(a[0]).focus();
            else if (a.filter('[ui-inp]').length > 0)
                $(a.filter('[ui-inp]')[0]).focus();
        }
    };

    this.SwitchToEditMode = function () {
        this.rowSLCounter = this.rowSLCounter - $(`#${this.TableId} tbody [is-editing=true]`).remove().length;
        $(`#${this.TableId} tbody>tr>.ctrlstd`).attr("mode", "edit");
        this.mode_s = "edit";
        //this.tryAddRow();
    };

    //this.SwitchToViewMode = function () {
    //    $(`#${this.TableId} tbody [is-editing=true]`).remove();
    //    $(`#${this.TableId} tbody>tr>.ctrlstd`).attr("mode", "view");
    //    this.mode_s = "view";
    //    if (!this.ctrl.AscendingOrder)
    //        this.UpdateSlNo();
    //};

    //this.getRowDataModel_ = function (rowId = 0, rowObjectMODEL) {
    //    let SingleRow = {};
    //    SingleRow.RowId = rowId;
    //    SingleRow.Columns = [];
    //    SingleRow.Columns.push({
    //        Name: "eb_row_num",
    //        Value: parseInt($(`#${this.TableId} tbody tr[rowid=${rowId}] td.row-no-td`).attr("idx")),
    //        Type: 7
    //    });
    //    $.each(this.ctrl.Controls.$values, function (i, col) {
    //        if (col.ObjType === "DGUserControlColumn") {
    //            $.each(col.Columns.$values, function (i, ctrl) {
    //                SingleRow.Columns.push(getSingleColumn(ctrl));
    //            }.bind(this));
    //        }
    //        else
    //            SingleRow.Columns.push(getSingleColumn(col));
    //    }.bind(this));
    //    return SingleRow;
    //};

    this.getRowDataModel = function (rowId, rowObjectMODEL) {
        let rowDataModel = JSON.parse(JSON.stringify(this.RowDataModel_empty));
        let eb_row_num = parseInt($(`#${this.TableId} tbody tr:last td.row-no-td`).attr("idx")) + 1;
        rowDataModel.RowId = rowId;
        //getObjByval(rowDataModel.Columns, "Name", "eb_row_num").Value = eb_row_num;
        this.attachModalCellRef_Row(rowDataModel, rowObjectMODEL);
        return rowDataModel;
    };

    this.getType = function (_inpCtrl) {
        let type = _inpCtrl.ObjType;
        if (type === "TextBox")
            type = "String";
        return `EbDG${type}Column`;
    };

    this.addPropsToInpCtrl = function (inpCtrl, col, ctrlEbSid, rowid) {
        //inpCtrl.Name = col.Name;
        //inpCtrl.EbDbType = col.EbDbType;
        inpCtrl.EbSid_CtxId = ctrlEbSid;
        inpCtrl.__rowid = rowid;
        inpCtrl.__Col = col;
        inpCtrl.TableName = col.__DG.TableName;

        if (inpCtrl.ObjType === "DGUserControlColumn") {///////////
            $.each(col.Columns.$values, function (i, _inpCtrl) {
                let _ctrlEbSid = "ctrl_" + Date.now().toString(36) + i;
                let NewInpCtrl = $.extend({}, new EbObjects_w[this.getType(_inpCtrl)](_ctrlEbSid, _inpCtrl));
                NewInpCtrl.EbSid_CtxId = _ctrlEbSid;
                inpCtrl.Columns.$values[i] = this.addPropsToInpCtrl(NewInpCtrl, col, _ctrlEbSid, rowid);
            }.bind(this));
        }
        else
            inpCtrl.ObjType = col.InputControlType.substr(2);
        return inpCtrl;
    };

    this.attachFns = function (inpCtrl, colType) {
        if (colType === "DGUserControlColumn") {
            for (let i = 0; i < inpCtrl.Columns.$values.length; i++) {
                let col = inpCtrl.Columns.$values[i];
                inpCtrl.Columns.$values[i] = this.attachFns(col, col.ObjType);
            }
        }
        return new ControlOps_w[colType](inpCtrl);
    };

    this.cloneObjArr = function (arr) {
        let newArr = [];
        $.each(arr, function (i, obj) { newArr[i] = $.extend(true, {}, obj); });
        return newArr;
    };

    //remove circular reference and take copy
    this.manageUCObj = function (inpCtrl, col) {
        let dg = inpCtrl.__DG;
        let dgucc = inpCtrl.__DGUCC;

        delete inpCtrl.__DG;
        delete inpCtrl.__DGUCC;

        inpCtrl.Columns = { ...inpCtrl.Columns };
        inpCtrl.Columns.$values = this.cloneObjArr(inpCtrl.Columns.$values);////////////

        inpCtrl.__DG = dg;
        inpCtrl.__DGUCC = dgucc;

        col = this.attachFns(col, col.ObjType);
    };

    //manuel row add
    this.getNewTrHTML = function (rowid, isAdded = true) {
        let isAnyColEditable = false;
        let tr = `<tr class='dgtr' is-editing='${isAdded}' is-checked='false' is-added='${isAdded}' rowid='${rowid}'>
                    <td class='row-no-td new-dgtr' title='Newly added row' id='${this.TableId + "_" + (++this.rowSLCounter)}_sl' idx='${this.rowSLCounter}'>${this.rowSLCounter}</td>`;
        this.objectMODEL[rowid] = [];

        let visibleCtrlIdx = 0;
        for (let i = 0; i < this.ctrl.Controls.$values.length; i++) {
            let col = this.ctrl.Controls.$values[i];
            let inpCtrlType = col.InputControlType;
            let ctrlEbSid = "ctrl_" + Date.now().toString(36) + visibleCtrlIdx;
            let inpCtrl = new EbObjects_w[inpCtrlType](ctrlEbSid, col);
            if (inpCtrlType === "EbUserControl")
                this.manageUCObj(inpCtrl, col);
            this.addPropsToInpCtrl(inpCtrl, col, ctrlEbSid, rowid);
            inpCtrl = this.attachFns(inpCtrl, col.ObjType);
            this.objectMODEL[rowid].push(inpCtrl);
            if (!col.Hidden) {
                tr += this.getTdHtml(inpCtrl, col, visibleCtrlIdx);
            }
            if (col.IsEditable)
                isAnyColEditable = true;
            visibleCtrlIdx++;
        }
        this.S_cogsTdHtml = this.getCogsTdHtml(isAnyColEditable);
        tr += this.S_cogsTdHtml;
        return tr;
    };

    this.getCogsTdHtml = function (isAnyColEditable) {///////
        return `@cogs@
                </tr>`
            .replace("@cogs@", `
                <td class='ctrlstd' mode='${this.mode_s}'>
                    @editBtn@
                    <button type='button' class='check-row rowc' tabindex='-1'><span class='fa fa-check'></span></button>
                    <button type='button' class='cancel-row rowc' tabindex='-1'><span class='fa fa-times'></span></button>
                    <button type='button' class='del-row rowc @del-c@ @disable-del@' tabindex='-1'><span class='fa fa-trash'></span></button>
                </td>`)
            .replace("@editBtn@", isAnyColEditable ? "<button type='button' class='edit-row rowc @disable-edit@' tabindex='-1'><span class='fa fa-pencil'></span></button>" : "")
            .replace("@del-c@", !isAnyColEditable ? "del-c" : "")
            .replace("@disable-edit@", this.ctrl.DisableRowEdit ? "disable-edit" : "")
            .replace("@disable-del@", this.ctrl.DisableRowDelete ? "disable-del" : "");
    };

    this.getTdWidth = function (i, col) {
        //let lastCtrl = null;
        //for (let x = 0; x < this.DGcols.length; x++) {
        //    if (!this.DGcols[x].Hidden)
        //        lastCtrl = this.DGcols[x];
        //}
        //return lastCtrl === col ? `calc(${col.Width}% - 60px)` : `${col.Width}%`;

        return `${col.Width}%`;
    };

    this.getAggTrHTML = function () {
        let tr = `<tr class='dgtr' agg='true' tabindex='0'>
                    <td class='row-no-td'></td>`;
        $.each(this.ctrl.Controls.$values, function (i, col) {
            if (col.Hidden)
                return true;
            tr += `<td id ='td_@ebsid@' ctrltdidx='${i}' colname='${col.Name}' style='width:${this.getTdWidth(i, col)}; display: inline-block;'>
                        <div class='tdtxt-agg' coltype='${col.ObjType}'><span></span></div>                        
                   </td>`;

        }.bind(this));
        tr += `<td></td></tr>`;
        return tr;
    };

    this.addRowDataModel = function (rowId, rowObjectMODEL) {
        if (!this.ctrl.AscendingOrder)
            this.DataMODEL.unshift(this.getRowDataModel(rowId, rowObjectMODEL));
        else
            this.DataMODEL.push(this.getRowDataModel(rowId, rowObjectMODEL));
    };

    this.addRow = function (opt = {}) {
        let rowId = opt.rowid;
        let isAdded = opt.isAdded;
        let insertIdx = opt.insertIdx;
        let isAddBeforeLast = opt.isAddBeforeLast;
        rowId = rowId || --this.newRowCounter;
        let tr = this.getNewTrHTML(rowId, isAdded);
        let $tr = $(tr).hide();
        if (insertIdx !== undefined) {
            this.addRowDataModel(rowId, this.objectMODEL[rowId]);
            this.insertRowAt(insertIdx, $tr);
            this.resetRowSlNo(insertIdx);
        }
        else {
            if (!this.ctrl.AscendingOrder) {
                //if (isAddBeforeLast && $(`#${this.TableId}>tbody>tr:first`).length > 0) {///
                //    $tr.insertBefore($(`#${this.TableId}>tbody>tr:eq(1)`));
                //}
                //else

                this.scrollToTop();
                $(`#${this.TableId}>tbody`).prepend($tr);
            }
            else {
                //if (isAddBeforeLast && $(`#${this.TableId}>tbody>tr:last`).length > 0) {
                //    $tr.insertBefore($(`#${this.TableId}>tbody>tr:last`));
                //}
                //else

                this.scrollToBottom();
                $(`#${this.TableId}>tbody`).append($tr);
            }
            this.addRowDataModel(rowId, this.objectMODEL[rowId]);
            if (!this.ctrl.AscendingOrder)
                this.resetRowSlNo();
        }
        $tr.show(300);
        this.setCurRow(rowId);
        let rowCtrls = this.initRowCtrls(rowId, false);

        this.changeEditFlagInRowCtrls(true, rowId);

        this.bindReq_Vali_UniqRow($tr);
        this.updateAggCols();
        this.execDisableExpr();

        let a = $tr.find('td[tdcoltype]');
        if (a && a.length > 0)
            $(a[0]).focus();

        return [$tr, rowCtrls];

    }.bind(this);

    this.insertRowAt = function (insertIdx, $tr) {
        if (insertIdx < 1)
            $(`#${this.TableId}>tbody`).prepend($tr);
        else if ($(`#${this.TableId}>tbody>tr`).length === insertIdx)
            $tr.insertAfter($(`#${this.TableId}>tbody>tr:eq(${insertIdx - 1})`));
        else
            $tr.insertBefore($(`#${this.TableId}>tbody>tr:eq(${insertIdx})`));

        let rowDataModel = getObjByval(this.DataMODEL, "RowId", $tr.attr("rowid"));
        let rowDataModelIdx = this.DataMODEL.indexOf(rowDataModel);
        this.DataMODEL.splice(rowDataModelIdx, 1);

        this.DataMODEL.splice(insertIdx, 0, rowDataModel);
        //this.objectMODEL.splice(insertIdx, 0, item);

        //for (let i = 0, j = 1; i < this.DataMODEL.length; i++) {/// ????
        //    let row = this.DataMODEL[i];
        //    let eb_row_num = getObjByval(row.Columns, "Name", "eb_row_num");
        //    if (eb_row_num.Value > 0)
        //        eb_row_num.Value = j++;
        //}
    };

    this.addSlNo = function () {//////DG H scroll ?
        let slnoTrHtml = `<tr><td class='row-no-td' id='${this.TableId + "_" + (++this.rowSLCounter)}_sl' idx='${this.rowSLCounter}'>${this.rowSLCounter}</td></tr>`;
        $(`${this.SlTableId}>tbody`).append(slnoTrHtml);
    }.bind(this);

    this.addAggragateRow = function () {
        let tr = this.getAggTrHTML();
        let $tr = $(tr);
        $tr.attr('tabindex', '-1');
        $(`#${this.TableId}_footer>tbody`).append($tr);
    };

    this.bindReq_Vali_UniqRow = function ($tr) {
        let rowid = $tr.attr("rowid");
        $.each(this.objectMODEL[rowid], function (i, Col) {
            this.bindReq_Vali_UniqCtrl(Col);
        }.bind(this));
    };

    this.bindReq_Vali_UniqCtrl = function (ctrl) {
        let $ctrl = $(`#${ctrl.EbSid_CtxId}`);
        if (ctrl.Required)
            this.bindRequired($ctrl, ctrl);
        if (ctrl.Unique) {
            //this.formRenderer.FRC.bindUniqueCheck(ctrl);//DB check
            this.bindDGUniqueCheck(ctrl);
        }
        if (ctrl.Validators.$values.length > 0)////??
            this.formRenderer.FRC.bindValidators(ctrl);
    };

    this.bindDGUniqueCheck = function (control) {
        $("#" + control.EbSid_CtxId).keyup(debounce(this.checkUnique4DG.bind(this, control), 1000)); //delayed check 
        ///.on("blur.dummyNameSpace", this.checkUnique.bind(this, control));
    };

    this.checkUnique4DG = function (ctrl) {/////////////// move
        if (ctrl.ObjType === "Numeric" && ctrl.getValue() === 0)// avoid check if numeric and value is 0
            return;

        //let unique_flag = true;
        let $ctrl = $("#" + ctrl.EbSid_CtxId);
        let val = ctrl.getValueFromDOM();
        if (isNaNOrEmpty(val))
            return;

        let colCtrls = this.getColCtrls(ctrl.__Col.Name);
        for (let i = 0; i < colCtrls.length; i++) {
            let inpCtrl = colCtrls[i];
            if (inpCtrl === ctrl)
                continue;
            if (inpCtrl.getValue() === val) {
                $ctrl.attr("uniq-ok", "false");
                ctrl.addInvalidStyle("This column allows only unique values.");
            }
            else {
                $ctrl.attr("uniq-ok", "true");
                ctrl.removeInvalidStyle();
            }
        }
    };

    this.bindRequired = function ($ctrl, control) {
        $ctrl.on("blur", this.isRequiredOK.bind(this, control)).on("focus", this.removeInvalidStyle.bind(this, control));
    };

    // checks a control value is emptyString
    this.isRequiredOK = function (ctrl) {
        let $ctrl = $("#" + ctrl.EbSid_CtxId);
        if ($ctrl.length !== 0 && ctrl.Required && !ctrl.isRequiredOK()) {
            ctrl.addInvalidStyle();
            return false;
        }
        else {
            ctrl.removeInvalidStyle();
            return true;
        }
    };

    this.removeInvalidStyle = function (ctrl) {
        EbMakeValid(`#td_${ctrl.EbSid_CtxId}`, `.ctrl-cover`, ctrl);
    };

    this.getFormVals = function () {
        return getValsFromForm(this.formObject_Full);
    }.bind(this);

    this.getValues = function () {
        this.FVWTObjColl = [];
        $.each(this.objectMODEL, function (rowid, ctrls) {
            let rowObjs = {};
            rowObjs[0] = [];
            $.each(ctrls, function (i, obj) {
                let colObj = {};
                colObj.Name = obj.Name;
                _type = obj.EbDbType;
                colObj.Value = (_type === 7) ? parseFloat(obj.getValue()) : obj.getValue();
                colObj.Type = _type;
                //colObj.AutoIncrement = obj.AutoIncrement || false;
                rowObjs[0].push(colObj);
            }.bind(this));
            this.FVWTObjColl.push(rowObjs);
        }.bind(this));
    }.bind(this);

    this.ctrlToSpan_row = function (rowid) {
        //let t0 = performance.now();
        let $tr = this.$table.find(`[rowid=${rowid}]`);
        let tds = $tr.find("td[ctrltdidx]");
        for (var i = 0; i < tds.length; i++) {
            this.ctrlToSpan_td($(tds[i]));
        }
        //console.dev_log("ctrlToSpan_row : took " + (performance.now() - t0) + " milliseconds.");
    }.bind(this);

    this.getCtrlByTd = function ($td) {
        let rowid = $td.closest("tr").attr("rowid");
        return this.objectMODEL[rowid].filter(function (obj) { return obj.Name === $td.attr("colname") })[0];
    };

    this.ctrlToSpan_td = function ($td, flag) {
        //let t0 = performance.now();
        if ($td.find(".ctrl-cover").length == 0)
            return;
        let ctrl = this.getCtrlByTd($td);
        if (!flag)
            $td.find(".ctrl-cover").hide();
        if (ctrl.ObjType === "PowerSelect") {
            if (!ctrl.DataVals.Value)
                return;
            let html = this.getPSDispMembrs(ctrl);
            $td.find(".tdtxt span").html(html);
        }
        else if ((ctrl.ObjType === "SysCreatedBy") || (ctrl.ObjType === "SysModifiedBy")) {
            let val = ctrl.getDisplayMemberFromDOM() || ctrl.getValue();
            let usid = ctrl.getValue();
            $td.find(".tdtxt span").empty();
            $td.find(".tdtxt span").append(`<img class='sysctrl_usrimg' src='/images/dp/${usid}.png' alt='' onerror="this.onerror=null; this.src='/images/nulldp.png';">`);
            $td.find(".tdtxt span").append(`<span class='sysctrl_usrname'>${val}</span>`);

        }
        else if (ctrl.ObjType === "UserSelect") {
            let val = ctrl.getDisplayMemberFromDOM() || ctrl.getValue();
            if (val != null) {
                $td.find(".tdtxt span").empty();
                $td.find(".tdtxt span").append(`<img class='ulstc-disp-img-c' src='/images/dp/${val['img']}.png' alt='' onerror="this.onerror=null; this.src='/images/nulldp.png';">`);
                $td.find(".tdtxt span").append(`<span class='ulstc-disp-txt' > ${val['dm1']}</span>`);
            }

        }
        else if (ctrl.ObjType === "Numeric") {
            let val = ctrl.getDisplayMemberFromDOM() || "0.00";// temporary fix
            $td.find(".tdtxt span").text(val);
        }
        else if (ctrl.ObjType === "CheckBox") {
            let val = ctrl.getValue();
            $td.find(".tdtxt span").html(this.getBooleanDispMembrs(val));
        }
        else {
            //let t0 = performance.now();
            let val = ctrl.getDisplayMemberFromDOM() || ctrl.getValue();
            $td.find(".tdtxt span").text(val);
            //console.dev_log("ctrlToSpan_td else: took " + (performance.now() - t0) + " milliseconds.");
        }
        if (!flag)
            $td.find(".tdtxt").show();
        //console.dev_log("ctrlToSpan_td " + (performance.now() - t0) + " milliseconds.");
    }.bind(this);

    this.ebUpdateDGTD = function ($td) {
        this.ctrlToSpan_td($td, true);
    }.bind(this);

    this.RowRequired_valid_Check = function (rowid = this.curRowId) {//////
        let required_valid_flag = true;
        let $notOk1stCtrl = null;
        let $tr = this.get$RowByRowId(rowid);
        if (!(this.Mode.isEdit && $tr.attr('is-initialised') !== 'true') ||//in edit mode or clone mode untouched DG row skip for 4 checking
            this.Mode.isEdit && $tr.attr("is-added") === "true")// avoid newly added rows from first check
        {
            $.each(this.objectMODEL[rowid], function (i, ctrl) {
                let $ctrl = $("#" + ctrl.EbSid_CtxId);
                if (!this.isRequiredOK(ctrl) || !this.formRenderer.FRC.isValidationsOK(ctrl) || !this.formRenderer.FRC.sysValidationsOK(ctrl)) {
                    required_valid_flag = false;
                    if (!$notOk1stCtrl)
                        $notOk1stCtrl = $ctrl;
                }
            }.bind(this));
        }

        if ($notOk1stCtrl) {
            setTimeout(function () {
                $notOk1stCtrl.focus();
            }.bind(this), 500);
        }
        return required_valid_flag;
    }.bind(this);

    this.attachModalCellRef = function () {
        for (let i = 0; i < this.DataMODEL.length; i++) {
            let row = this.DataMODEL[i];
            this.attachModalCellRef_Row(row, this.objectMODEL[row.RowId]);
        }
    }.bind(this);

    this.attachModalCellRef_Row = function (row, rowObjectMODEL) {
        for (let i = 0; i < rowObjectMODEL.length; i++) {
            let inpCtrl = rowObjectMODEL[i];
            let SingleColumn = getObjByval(row.Columns, "Name", inpCtrl.Name);
            if (SingleColumn) {
                inpCtrl.DataVals = SingleColumn;
                inpCtrl.curRowDataVals = $.extend(true, {}, SingleColumn);
            }
        }
    }.bind(this);

    this.cancelRow_click = function (e) {
        let $td = $(e.target).closest("td");
        this.setOldVals2RowDOMobjs();
        this.updateAggCols(false);
        let td = $td[0];
        this.checkRow_click({ target: td }, true, true);
    }.bind(this);

    this.setOldVals2RowDOMobjs = function () {
        let Names = Object.keys(this.curRowObjectMODEL);
        for (let i = 0; i < Names.length; i++) {
            let name = Names[i];
            let inpCtrl = this.curRowObjectMODEL[name];
            let OldVal = inpCtrl.DataVals.Value;
            if (!(inpCtrl.ObjType === "PowerSelect" && OldVal === "") && !inpCtrl.Hidden && OldVal !== inpCtrl.getValueFromDOM())
                inpCtrl.setValue(OldVal);
        }
    };

    this.addRowBtn_click = function () {
        let $curentRow = $(`[ebsid='${this.ctrl.EbSid}'] [rowid='${this.curRowId}']`);//fresh row. ':last' to handle dynamic addrow()(delayed check if row contains PoweSelect)
        if ($curentRow.length === 0 || $curentRow.attr("is-editing") === "false")// for editmode first click
            this.tryAddRow();
        else {
            if (this.checkRow_click_New({ target: $curentRow.find(".ctrlstd")[0] })) {
                this.tryAddRow();
            }
            //if ($curentRow.length === 1 && $curentRow.attr("is-editing") === "false")
            //    this.tryAddRow();
        }

    }.bind(this);

    this.excelUploadBtn_click = function () {
        let $fileInp = $("#dgexcelfileupload");
        if ($fileInp.length == 0) {
            $("body").prepend(`<input type="file" name="dgexcelfileupload" id="dgexcelfileupload" style="display: none;" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel">`);
            $fileInp = $("#dgexcelfileupload");
        }
        $fileInp.off('change');
        $fileInp.val('');
        $fileInp.trigger('click');
        $fileInp.on('change', function (e) {
            this.showLoader();
            let fileUpload = $("#dgexcelfileupload").get(0);
            let files = fileUpload.files;
            if (files.length == 0) {
                EbMessage("show", { Message: 'Please select a file to upload', AutoHide: true, Background: '#aa0000', Delay: 2000 });
                return;
            }
            let fileName = files[0].name;
            if (!fileName) {
                EbMessage("show", { Message: 'Invalid file name', AutoHide: true, Background: '#aa0000', Delay: 2000 });
                return;
            }
            let data1 = new FormData();
            data1.append(fileName, files[0]);
            data1.append("RefId", this.formRefId);
            data1.append("DgName", this.ctrl.Name);

            let ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
            if (ext === "xls" || ext === "xlsx") {
                $.ajax({
                    type: "POST",
                    url: "/WebForm/GetDgDataFromExcel",
                    processData: false,
                    contentType: false,
                    data: data1,
                    error: function () {
                        EbMessage("show", { Message: 'Something Unexpected Occurred and Data loading failed', AutoHide: true, Background: '#aa0000', Delay: 4000 });
                        this.hideLoader();
                    }.bind(this),
                    success: this.reloadDG.bind(this)
                });
            }
        }.bind(this));
    }.bind(this);

    this.refreshDgDrBtn_clicked = function () {
        let paramsColl__ = this.getParamsColl();
        let paramsColl = paramsColl__[0];
        this.refreshDG(paramsColl);
    }.bind(this);

    this.editRow_click = function (e) {
        let $addRow = $(`[ebsid='${this.ctrl.EbSid}'] [is-checked='false']`);
        let td = $addRow.find(".ctrlstd")[0];
        let isSameRow = $(event.target).closest("tr") === $addRow;
        if ($addRow.length !== 0 && !this.confirmRow())
            return;

        let $td = $(e.target).closest("td");
        let $tr = $td.closest("tr");
        let rowId = $tr.attr("rowid");
        this.setCurRow(rowId);
        if ($tr.attr("is-initialised") === 'false')
            this.rowInit_E($tr, rowId);
        $td.find(".del-row").hide();
        $(`[ebsid='${this.ctrl.EbSid}'] tr[is-checked='true']`).find(".edit-row").hide();
        //$addRow.hide(300).attr("is-editing", "false");
        $td.find(".check-row").show();
        this.$addRowBtn.addClass("eb-disablebtn");
        $tr.attr("is-editing", "true");
        this.spanToCtrl_row($tr);
        //$(`#${this.TableId}>tbody>[is-editing=true]:first *:input[type!=hidden]:first`).focus();
        //if (!this.curRowObjectMODEL[this.colNames[0]].__isEditing)
        this.setcurRowDataMODELWithOldVals(rowId);
        this.changeEditFlagInRowCtrls(true, rowId);

        //this.focusOnFirstInput($tr);
        //let enabledUiInps = $tr.find("td [ui-inp]:enabled");
        //if (enabledUiInps.length > 0)
        //    $(enabledUiInps[0]).select();
        this.execDisableExpr();
    }.bind(this);

    this.row_tdClicked = function (e) {
        if (!($(e.target).hasClass("tdtxt") || $(e.target).is($(`#${this.TableId}>tbody > tr >td`)) || $(e.target).is($(`#${this.TableId}>tbody > tr`)))) {
            return;
        }
        if (this.ctrl.DisableRowEdit && $(e.target).closest('tr[is-added="false"]').length > 0)
            return;
        if (this.Mode.isView)
            return;
        if ($(e.currentTarget).hasClass('ctrlstd'))
            return;

        let $activeTr = $(`#${this.TableId}>tbody tr[is-editing="true"]`);
        let rowId = $activeTr.attr("rowid");
        let $e = $(e.target);
        let $tr = $e.closest("tr");
        let new_rowId = $tr.attr("rowid");
        let $td = $e.closest("td");
        if (rowId === new_rowId) {
            //this.execDisableExpr();
            let UiInps = $td.find("[ui-inp]:enabled");
            if (UiInps.length > 0 && e.originalEvent) {
                if ($td.attr('tdcoltype') == "DGBooleanColumn")
                    $td.find("[ui-inp]").click();
                else if ($td.attr('tdcoltype') == "DGLabelColumn")
                    $td.find(".tdtxt span").click();
            }
            return;
        }

        if ($activeTr.length === 1) {
            if (!this.RowRequired_valid_Check(rowId))
                return;
            this.confirmRow(rowId);
        }
        //if (this.isDGEditable()) {
        //    $tr.find(".edit-row").trigger("click");
        //    setTimeout(function () {
        //        let UiInps = $e.closest("td").find("[ui-inp]");
        //        if (UiInps.length > 0) {
        //            $e.closest("td").find("[ui-inp]").focus();
        //        }
        //    }, 310);
        //}
    }.bind(this);

    this.row_focusout = function (e) {
        if (this.Mode.isView)
            return;
        if ($(e.target).parents(`#cont_${this.ctrl.EbSid}`).length > 0)
            return;

        this.checkActiveRecord();
        //this.$ActiveTd = null;
        //setTimeout(this.row_focusout_inner.bind(this, e), 200);
    };

    //external + internal fn
    this.checkActiveRecord = function (e) {
        let $activeTr = $(`#${this.TableId}>tbody tr[is-editing="true"]`);
        if ($activeTr.length === 1 && $(document.activeElement).parents(`#${this.TableId}`).length === 0 &&
            $('.DDdiv:visible').length === 0 && $('.eb-ss-ddup:visible').length === 0 && $('.eb-ss-dd:visible').length === 0) {
            $activeTr.find('.check-row').trigger('click');
            this.$ActiveTd = null;
        }
    };

    this.row_focusin = function (e) {
        if (!this.canContinueFocus(e))
            return;
        let $curTarget = $(e.currentTarget);
        let $activeTr = $(`#${this.TableId}>tbody tr[is-editing="true"]`);
        let rowId = $activeTr.attr("rowid");
        let $tr = $curTarget.closest('tr');
        let new_rowId = $tr.attr("rowid");
        if (rowId != new_rowId && new_rowId) {
            if ($activeTr.length > 0) {
                if (this.confirmRow(rowId)) {
                    this.editRow_click({ target: $tr.find('.edit-row')[0] });
                    //this.focusOnCtrlInTd($curTarget);
                    //this.$ActiveTd = $curTarget;
                    //$tr.find('.edit-row').trigger('click');
                }
            }
            else {
                this.editRow_click({ target: $tr.find('.edit-row')[0] });
                //this.focusOnCtrlInTd($curTarget);
                //this.$ActiveTd = $curTarget;
                //$tr.find('.edit-row').trigger('click');
            }
        }
        else {
            //this.focusOnCtrlInTd($curTarget);
            //this.$ActiveTd = $curTarget;
        }
    };

    this.row_focus = function (e) {
        if (!this.canContinueFocus(e))
            return;
        let $curTarget = $(e.currentTarget);
        this.focusOnCtrlInTd($curTarget);
        this.$ActiveTd = $curTarget;
    };

    this.focusOnCtrlInTd = function ($td) {
        let enabledUiInps = $td.find("input:enabled:visible");//[ui-inp]:enabled:visible
        if (enabledUiInps.length > 0) {
            setTimeout(function () {
                $(enabledUiInps[0]).focus();
            }, 10);
            //$(enabledUiInps[0]).select();
        }
        //else
        //    $td.focus();
    };

    this.canContinueFocus = function (e) {
        let v = true;
        let $curTarget = $(e.currentTarget);
        if (this.Mode.isView)
            v = false;
        else if ($(e.target).hasClass('rowc'))
            v = false;
        else if ($curTarget.is(this.$ActiveTd))
            v = false;
        else if (this.ctrl.DisableRowEdit && $(e.target).closest('tr[is-added="false"]').length > 0)
            v = false;

        return v;
    };

    //key event listener
    this.dg_rowKeydown = function (e) {
        let $e = $(e.target);
        let $tr = $(e.currentTarget);

        if (e.which === 40 || e.which === 38 || e.which === 37 || e.which === 39) {//37 left arrow | 38 up | 39 right | 40 down
            //if ($e.closest('[tdcoltype="DGNumericColumn"], [tdcoltype="DGStringColumn"], [tdcoltype="DGDateColumn"], [tdcoltype="DGBooleanColumn"]').length === 0)
            //    return;

            let temp = performance.now();
            if (this.lastUpDownArrowTs && temp - this.lastUpDownArrowTs < 100)
                return;
            this.lastUpDownArrowTs = performance.now();

            let $td = $(e.target).closest('td');

            if ($e.closest('[tdcoltype="DGPowerSelectColumn"]').length === 1 && !$td.is(':focus'))
                return;

            if ((e.which === 37 || e.which === 39) && !(event.altKey || event.metaKey)) {
                let $td = $(e.target).closest('td');
                let uiInp = $td.find("input:enabled:visible");

                if (uiInp.length && uiInp[0].type == 'text') {
                    if (!(((e.which === 39 && uiInp[0].selectionEnd == uiInp[0].value.length) || (e.which === 37 && uiInp[0].selectionStart == 0)) &&
                        uiInp[0].selectionStart == uiInp[0].selectionEnd))
                        return;
                }
            }

            e.preventDefault();

            let indx = $(e.target).closest('td').index();
            if (e.which === 40 || e.which === 38) {
                let $nxtTr;
                if (event.altKey || event.metaKey) {//alt
                    let sel = e.which === 40 ? ':last' : ':first';
                    $nxtTr = $(e.currentTarget).siblings(sel);
                }
                else {
                    let func = e.which === 40 ? 'next' : 'prev';
                    $nxtTr = $(e.currentTarget)[func]();
                }

                if ($nxtTr.length > 0) {
                    let $nxtTd = $($nxtTr.find('td')[indx]);
                    document.activeElement.blur();
                    //$nxtTd.trigger('click');
                    $nxtTd.trigger('focus');
                }
            }
            else {
                let $nxtTd;
                if (event.altKey || event.metaKey) {
                    let sel = e.which === 39 ? '[tdcoltype]:last' : '[tdcoltype]:first';
                    $nxtTd = $td.siblings(sel);
                }
                else {
                    let uiInp = $td.find("input:enabled:visible");
                    let func = null;
                    if (uiInp.length && uiInp[0].type == 'text') {
                        if (((e.which === 39 && uiInp[0].selectionEnd == uiInp[0].value.length) ||
                            (e.which === 37 && uiInp[0].selectionStart == 0)) &&
                            uiInp[0].selectionStart == uiInp[0].selectionEnd)
                            func = e.which === 39 ? 'next' : 'prev';
                    }
                    else
                        func = e.which === 39 ? 'next' : 'prev';
                    if (func)
                        $nxtTd = $td[func]();

                }
                if ($nxtTd && $nxtTd.length > 0 && $nxtTd.attr('tdcoltype')) {
                    document.activeElement.blur();
                    $nxtTd.trigger('focus');
                }
            }
        }
        else if (e.which === 27) {//esc
            if (this.isDGEditable() && $tr.find(".cancel-row").css("display") !== "none")
                $tr.find(".cancel-row").trigger("click");
        }
        //alt + enter
        //else if ((event.altKey || event.metaKey) && event.which === 82) { //alt+R
        //    if (this.$table.has(document.activeElement).length === 1) {
        //        document.activeElement.blur();
        //        this.addRowBtn_click();
        //    }
        //}

    }.bind(this);

    this.confirmRow = function (rowId) {
        if (!rowId) {
            let $activeTr = $(`#${this.TableId}>tbody tr[is-editing="true"]`);
            rowId = $activeTr.attr("rowid");
        }
        if (!this.RowRequired_valid_Check(rowId))
            return false;

        let $td = $(`#${this.TableId}>tbody>tr[rowid=${rowId}] td.ctrlstd`);
        let $activeTr = $td.closest("tr");
        $td.find(".check-row").hide();
        $td.find(".del-row").show();
        $td.find(".edit-row").show();
        this.$addRowBtn.removeClass("eb-disablebtn");
        //if ($activeTr.attr("is-checked") === "true") {
        this.setcurRowDataMODELWithNewVals(rowId);
        this.changeEditFlagInRowCtrls(false, rowId);
        //}

        this.ctrlToSpan_row(rowId);
        $activeTr.attr("is-checked", "true").attr("is-editing", "false");
        //$(`#${this.TableId}>tbody>[is-editing=true]:first *:input[type!=hidden]:enabled:visible:first`).focus();
        this.onRowPaintFn($activeTr, "check", event);
        return true;
    };

    this.checkRow_click = function (e, isAddRow = true, isFromCancel, isSameRow = true) {
        let $td = $(e.target).closest("td");
        let $addRow = $(`#${this.TableId}>tbody>[is-editing=true]`);//fresh row. ':last' to handle dynamic addrow()(delayed check if row contains PoweSelect)
        let $tr = $td.closest("tr");
        $tr.attr("mode", "false");
        let rowid = $tr.attr("rowid");
        if (!this.RowRequired_valid_Check(rowid))
            return false;
        $td.find(".check-row").hide();
        $td.find(".del-row").show();
        $td.find(".edit-row").show();
        this.$addRowBtn.removeClass("eb-disablebtn");

        $(`[ebsid='${this.ctrl.EbSid}'] tr[is-checked='true']`).find(".edit-row").show();// show all rows edit button
        $addRow.show().attr("is-editing", "true");
        if (!isFromCancel && isSameRow) {
            this.setcurRowDataMODELWithNewVals(rowid);
            this.changeEditFlagInRowCtrls(false, rowid);
        }
        this.ctrlToSpan_row(rowid);
        if (($tr.attr("is-checked") !== "true" && isAddRow) && $tr.attr("is-added") === "true" && !this.ctrl.IsDisable)
            this.addRow();
        else
            this.setCurRow($addRow.attr("rowid"));
        $tr.attr("is-checked", "true").attr("is-editing", "false");
        //$(`#${this.TableId}>tbody>[is-editing=true]:first *:input[type!=hidden]:enabled:visible:first`).focus();
        return true;
    }.bind(this);

    this.checkRow_click_New = function (e) {
        let $td = $(e.target).closest("td");
        let $addRow = $(`#${this.TableId}>tbody>[is-editing=true]`);//fresh row. ':last' to handle dynamic addrow()(delayed check if row contains PoweSelect)
        let $tr = $td.closest("tr");
        $tr.attr("mode", "false");
        let rowid = $tr.attr("rowid");
        if (!this.RowRequired_valid_Check(rowid))
            return false;
        $td.find(".check-row").hide();
        $td.find(".del-row").show();
        $td.find(".edit-row").show();
        this.$addRowBtn.removeClass("eb-disablebtn");

        $(`[ebsid='${this.ctrl.EbSid}'] tr[is-checked='true']`).find(".edit-row").show();// show all rows edit button
        $addRow.show().attr("is-editing", "true");
        this.setcurRowDataMODELWithNewVals(rowid);
        this.changeEditFlagInRowCtrls(false, rowid);
        this.ctrlToSpan_row(rowid);
        if (($tr.attr("is-checked") !== "true") && $tr.attr("is-added") === "true" && !this.ctrl.IsDisable) {
            this.onRowPaintFn($tr, "check", e);
            //this.addRow();
        }
        else {
            this.setCurRow($addRow.attr("rowid"));
            this.onRowPaintFn($tr, "check", e);
        }
        $tr.attr("is-checked", "true").attr("is-editing", "false");
        //this.onRowPaintFn($tr, "check", e);
        return true;
    }.bind(this);

    this.onRowPaintFn = function ($tr, action, event) {
        if ((this.ctrl.OnRowPaint && this.ctrl.OnRowPaint.Code && this.ctrl.OnRowPaint.Code.trim() !== '')) {
            try {
                let FnString = atob(this.ctrl.OnRowPaint.Code);
                new Function("form", "user", "tr", "action", `event`, FnString).bind(this.ctrl.currentRow, this.ctrl.formObject, this.ctrl.__userObject, $tr[0], action, event)();
            }
            catch (e) {
                console.error('error in onRowPaintFn: ' + this.ctrl.Name);
                console.warn(e);
            }
        }
    };

    this.setcurRowDataMODELWithNewVals = function (rowId) {
        $.each(this.objectMODEL[rowId], function (i, inpCtrl) {
            if (inpCtrl.DataVals !== undefined) {
                inpCtrl.DataVals.Value = inpCtrl.curRowDataVals.Value ? JSON.parse(JSON.stringify(inpCtrl.curRowDataVals.Value)) : inpCtrl.curRowDataVals.Value;
                inpCtrl.DataVals.D = inpCtrl.curRowDataVals.D ? JSON.parse(JSON.stringify(inpCtrl.curRowDataVals.D)) : inpCtrl.curRowDataVals.D;
            }
        }.bind(this));
    };

    this.setcurRowDataMODELWithOldVals = function (rowId) {
        let curRowCtrls = this.objectMODEL[rowId];
        for (let i = 0; i < curRowCtrls.length; i++) {
            let inpCtrl = curRowCtrls[i];
            if (inpCtrl.DataVals !== undefined) {
                inpCtrl.curRowDataVals.Value = inpCtrl.DataVals.Value ? JSON.parse(JSON.stringify(inpCtrl.DataVals.Value)) : inpCtrl.DataVals.Value;
                inpCtrl.curRowDataVals.D = inpCtrl.DataVals.Value ? JSON.parse(JSON.stringify(inpCtrl.DataVals.D)) : inpCtrl.DataVals.Value;
            }
        }
    };

    this.updateAggCols = function (updateDpnt) {
        $.each(this.ctrl.Controls.$values, function (i, col) {
            if (col.IsAggragate) {
                let colname = col.Name;
                let val = parseFloat(this.getAggOfCol(colname, updateDpnt));
                val = col.InputMode == 1 ? val.toLocaleString('en-IN', { maximumFractionDigits: col.DecimalPlaces, minimumFractionDigits: col.DecimalPlaces }) : val.toFixed(col.DecimalPlaces);
                $(`#${this.TableId}_footer tbody tr [colname='${colname}'] .tdtxt-agg span`).text(val);
            }
        }.bind(this));
    };

    this.updateAggCol = function (e) {
        setTimeout(function () {// need to change=====================================================================================
            let $td = $(e.target).closest("td");
            let colname = $td.attr("colname");
            let val = parseFloat(this.getAggOfCol(colname));
            let col = this.ctrl.Controls.$values.find(e => e.Name === colname);
            val = col.InputMode == 1 ? val.toLocaleString('en-IN', { maximumFractionDigits: col.DecimalPlaces, minimumFractionDigits: col.DecimalPlaces }) : val.toFixed(col.DecimalPlaces);
            $(`#${this.TableId}_footer tbody tr [colname='${colname}'] .tdtxt-agg span`).text(val);
        }.bind(this), 10);
    }.bind(this);

    this.getColCtrls = function (colName) {
        let colCtrls = [];
        let rowIds = Object.keys(this.objectMODEL);
        for (let i = 0; i < rowIds.length; i++) {
            let rowId = rowIds[i];
            let rowCtrls = this.objectMODEL[rowId];
            colCtrls.push(getObjByval(rowCtrls, "Name", colName));
        }
        return colCtrls;
    };

    this.markDelColCtrls = function (rowId) {
        let rowCtrls = this.objectMODEL[rowId];
        if (!rowCtrls)
            return;
        for (let i = 0; i < rowCtrls.length; i++) {
            let inpCtrl = rowCtrls[i];
            inpCtrl.__isDeleted = true;
        }
    };

    this.getAggOfCol = function (colname, updateDpnt = true) {
        let sum = 0;
        let colCtrls = this.getColCtrls(colname);
        for (let i = 0; i < colCtrls.length; i++) {
            let inpCtrl = colCtrls[i];
            if (inpCtrl.__isDeleted)
                continue;
            //if (document.getElementById(inpCtrl.EbSid_CtxId) === document.activeElement)
            //    val = document.activeElement.value.replace(/,/g, '');
            //else {
            if (inpCtrl.__isEditing)
                val = inpCtrl.curRowDataVals.Value || 0;
            else
                val = inpCtrl.DataVals.Value || 0;
            //}
            sum += parseFloat(val) || 0;
        }
        sum = sum.toFixed(getObjByval(this.ctrl.Controls.$values, "Name", colname).DecimalPlaces);

        this.ctrl[colname + "_sum"] = parseFloat(sum);
        if (updateDpnt && !this.formRenderer.isInitiallyPopulating)
            this.updateDepCtrl(getObjByval(this.ctrl.Controls.$values, "Name", colname));
        return sum;
    };

    this.sumOfCol = function (updateDpnt, colName) {
        return parseFloat(this.getAggOfCol(colName, updateDpnt));
    }.bind(this);

    this.updateDepCtrl = function (Col) {
        $.each(Col.DependedValExp.$values, function (i, depCtrl_s) {
            try {
                let depCtrl = this.ctrl.formObject.__getCtrlByPath(depCtrl_s);
                let valExpFnStr = atob(depCtrl.ValueExpr.Code);
                if (valExpFnStr) {
                    if (!depCtrl.IsDGCtrl) {
                        let val = new Function("form", "user", `event`, valExpFnStr).bind(depCtrl_s, this.ctrl.formObject, this.ctrl.__userObject)();
                        depCtrl.DataVals.ValueExpr_val = val;
                        depCtrl.setValue(val);
                    }
                    //else {
                    //    $.each(depCtrl.__DG.objectMODEL, function (rowid, row) {
                    //        let val = new Function("form", "user", `event`, valExpFnStr).bind(depCtrl_s, this.ctrl.formObject, this.FO.userObject)();
                    //        row[depCtrl.Name].setValue(val);
                    //    }.bind(this));
                    //}
                }
            }
            catch (e) {
                console.eb_log("eb error :");
                console.eb_log(e);
                //alert("error in 'Value Expression' of : " + Col.Name + " - " + e.message);
            }
        }.bind(this));
    };

    this.removeTr = function ($tr) {
        let rowId = $tr.attr("rowid");
        $tr.hide(100);
        this.markDelColCtrls(rowId);
        setTimeout(function () {
            let trIdx = $tr.index();
            $tr.remove();
            //let t0 = performance.now();
            this.resetRowSlNo(trIdx);
            //console.dev_log("resetRowSlNoUnder :  took " + (performance.now() - t0) + " milliseconds.");
            this.updateAggCols();
        }.bind(this), 101);
    };

    this.delRow_click = function (e) {
        let $tr = $(e.target).closest("tr");
        let rowId = $tr.attr("rowid");
        let rowDataModel = getObjByval(this.DataMODEL, "RowId", rowId);
        if (rowId > 0)
            rowDataModel.IsDelete = true;
        else {
            let index = this.DataMODEL.indexOf(rowDataModel);
            if (index > -1)
                this.DataMODEL.splice(index, 1);
        }
        this.setCurRow(rowId);
        this.onRowPaintFn($tr, "delete", e);

        this.removeTr($tr);
        //this.resetRowSlNoUnder($tr);

    }.bind(this);

    this.delAllRows = function () {
        for (let i = 0, j = 1; i < this.DataMODEL.length; i++) {
            let rowDataModel = this.DataMODEL[i];

            if (rowDataModel.RowId > 0)
                rowDataModel.IsDelete = true;
            else {
                this.DataMODEL.splice(i--, 1);
            }
            this.markDelColCtrls(rowDataModel.RowId);
        }
        $(`#${this.TableId}>tbody>.dgtr`).remove();

    }.bind(this);

    this.clearDG = function (isAddrow = true) {
        this.delAllRows();
        this.updateAggCols();
        this.resetBuffers();
        if (this.ctrl.__continue) this.ctrl.__continue();
        //if (!this.ctrl.IsDisable && isAddrow)
        //    this.addRow();
    };

    //this.UpdateSlNo = function () {
    //    if (!this.ctrl.IsShowSerialNumber)
    //        return;
    //    let $rows = $(`#${this.TableId}>tbody>tr`);
    //    for (let i = 0; i < $rows.length; i++) {
    //        let $row = $($rows[i]);
    //        let SlNo = i + 1;
    //        $row.find("td.row-no-td").attr("id", `${this.TableId + "_" + SlNo}_sl`).attr("idx", SlNo).text(SlNo);
    //    }
    //};

    this.resetRowSlNo = function (slno = 0) {
        if (!this.ctrl.IsShowSerialNumber)
            return;
        let rowCount = $(`#${this.TableId}>tbody>tr`).length;
        for (let i = slno; i < rowCount; i++) {
            $(`#${this.TableId}>tbody>tr td.row-no-td:eq(${i})`).attr("id", `${this.TableId + "_" + (i + 1)}_sl`).attr("idx", i + 1).text(i + 1);
        }
        this.rowSLCounter = rowCount;
    };

    //this.resetRowSlNoUnder = function ($tr) {
    //    if (!this.ctrl.IsShowSerialNumber)
    //        return;
    //    let curIdx = parseInt($tr.find(".row-no-td").attr("idx"));
    //    let rowCount = $(`#${this.TableId}>tbody>tr`).length - 1;
    //    this.rowSLCounter = curIdx;
    //    for (this.rowSLCounter; this.rowSLCounter < rowCount + 1; this.rowSLCounter++) {
    //        $(`#${this.TableId + "_" + (this.rowSLCounter + 1)}_sl`).attr("id", `${this.TableId + "_" + this.rowSLCounter}_sl`).attr("idx", this.rowSLCounter).text(this.rowSLCounter);
    //    }
    //    this.rowSLCounter--;
    //};

    this.spanToCtrl_row = function ($tr) {
        $tds = $tr.find("td[ctrltdidx]");
        $.each($tds, function (i, td) {
            let $td = $(td);
            let ctrlTdIdx = $td.attr("ctrltdidx");
            if (this.ctrl.Controls.$values[ctrlTdIdx].IsEditable)
                this.spanToCtrl_td($td);

        }.bind(this));
    }.bind(this);

    this.spanToCtrl_td = function ($td) {
        //let ctrl = this.getCtrlByTd($td);
        $td.attr("edited", "true");
        if ($td.find(".ctrl-cover").length == 0)
            return;
        $td.find(".tdtxt").hide();
        $td.find(".ctrl-cover").show(this.RowShowDelay);
    }.bind(this);

    this.isDGEditable = function () {
        return (this.Mode.isEdit || this.Mode.isNew);
    };



    this.initAgg = function () {
        this.addAggragateRow();

        $.each(this.ctrl.Controls.$values, function (i, col) {
            this.ctrl[col.Name + "_sum"] = 0;
        }.bind(this));

        this.$table.on("keyup", "[tdcoltype=DGNumericColumn][agg=true] [ui-inp]", this.updateAggCol.bind(this));
        this.$table.on("change", "[tdcoltype=DGNumericColumn][agg=true] [ui-inp]", this.updateAggCol.bind(this));
    };

    this.PScallBFn = function (Row) {
        setTimeout(function () {
            let td = $(`#${this.TableId}>tbody>tr[rowid=${Row[0].__rowid}] td:last`)[0];
            {// experimental code
                $.each(Row, function (i, col) {
                    if (col.__onChangeFn && col.OnChangeFn.Code && col.OnChangeFn.Code.trim() !== '')
                        col.__onChangeFn();
                }.bind(this));
            }
            this.checkRow_click({ target: td }, false);
        }.bind(this), 1);
    }.bind(this);

    this.AddRowWithData = function (_rowdata) {
        let addedRowObj = this.addRow({ isAddBeforeLast: true });
        let $addedRow = addedRowObj[0];
        let addedRowCols = addedRowObj[1];
        $.each(addedRowCols, function (i, col) {
            let data = _rowdata[col.Name];
            if (data !== null) {
                if (col.ObjType === "PowerSelect")
                    col.setValue(data, this.PScallBFn.bind(this, addedRowCols));
                else {
                    col.setValue(data);
                }

            }
        }.bind(this));

        this.resetRowSlNo($addedRow.index());
        if (!this.isPSInDG)
            setTimeout(this.PScallBFn.bind(this, addedRowCols), 1);// call checkRow_click() pass event.target directly
    };

    //this.ColGetvalueFn = function (p1) {
    //    return $('[ebsid=' + this.__DG.EbSid + ']').find(`tr[is-editing=true] [colname=${this.Name}] [ui-inp]`).val();
    //};

    //this.ColSetvalueFn = function (p1) {
    //    return $('[ebsid=' + this.__DG.EbSid + ']').find(`tr[is-editing=true] [colname=${this.Name}] [ui-inp]`).val();
    //};

    //this.EnableFn = function (p1) {
    //    return $('[ebsid=' + this.__DG.EbSid + ']').find(`tr[is-editing=true] [colname=${this.Name}] .ctrl-cover *`).prop('disabled', false).css('pointer-events', 'inherit').find('input').css('background-color', '#fff');
    //};

    //this.DisableFn = function (p1) {
    //    return $('[ebsid=' + this.__DG.EbSid + ']').find(`tr[is-editing=true] [colname=${this.Name}] .ctrl-cover *`).attr('disabled', 'disabled').css('pointer-events', 'none').find('input').css('background-color', '#eee');
    //};

    this.updateRowByRowIndex = function (rowIdx, rowData) {
        let rowId = $(`#${this.TableId}>tbody>tr:eq(${(rowIdx - 1)})`).attr("rowid");
        this.updateRowByRowId(rowId, rowData);
    };

    this.getRowIdBySlno = function (slno) {
        return $(`#${this.TableId}>tbody>tr>td.row-no-td[idx=${slno}]`).parent().attr("rowid");
    };

    this.get$RowByRowId = function (rowId) {
        return $(`#${this.TableId}>tbody>tr[rowid=${rowId}]`);
    };

    this.updateRowBySlno = function (slno, rowData) {
        let rowId = this.getRowIdBySlno(slno);
        this.updateRowByRowId(rowId, rowData);
    };

    this.getRowBySlno = function (slno, rowId) {
        if (rowId === undefined)
            rowId = this.getRowIdBySlno(slno);
        if (rowId) {
            let rowDict = this.Arr2dict(this.objectMODEL[rowId]);
            return rowDict;
        }
        else
            console.eb_error(`Row with Serial number '${slno}' not found`);
    };

    this.getValuesOfColumn = function (column) {
        let vals = [];
        for (let i = 0, j = 1; i < this.DataMODEL.length; i++) {
            let row = this.DataMODEL[i];
            let colObj = getObjByval(row.Columns, "Name", column);
            if (!colObj) {
                console.error("no column '" + column + "' found in DataGrid" + this.ctrl.Name);
                return;
            }
            vals.push(colObj.Value);
        }
        return vals;
    }.bind(this);

    this.getRowByIndex = function (idx) {
        let rowId = $(`#${this.TableId}>tbody>tr.dgtr:eq(${idx})`).attr("rowid");
        return this.getRowBySlno(false, rowId);
    }.bind(this);

    this.Arr2dict = function (Arr) {
        let dict = {};
        for (let i = 0; i < Arr.length; i++) {
            let obj = Arr[i];
            dict[obj.Name] = obj;
        }
        return dict;
    };

    this.setCurRow = function (rowId) {
        this.curRowId = rowId;
        this.curRowObjectMODEL = {};
        this.ctrl.currentRow = this.curRowObjectMODEL;
        let inpctrls = this.objectMODEL[rowId];

        for (var i = 0; i < inpctrls.length; i++) {
            let inpctrl = inpctrls[i];
            if (!this.curRowObjectMODEL[inpctrl.__Col.Name])
                this.curRowObjectMODEL[inpctrl.__Col.Name] = inpctrl;
        }

    };

    this.updateRowByRowId = function (rowId, rowData) {
        let $tr = this.get$RowByRowId(rowId);
        if ($tr.length === 0) {
            console.log(`eb error :    No row with rowId '${rowId}' exist`);
            return;
        }

        $.each(Object.keys(rowData), function (i, key) {
            let obj = getObjByval(this.objectMODEL[rowId], "Name", key);
            if (obj) {
                if (obj.ObjType === "PowerSelect" && this.isPSInDG) {
                    this.editRow_click({ target: $tr.find(".edit-row")[0] });// click edit button if contains PS
                    obj.setValue(rowData[key], this.PScallBFn.bind(this, this.objectMODEL[rowId])); //click check button 
                }
                else
                    obj.setValue(rowData[key]);
            }
        }.bind(this));

        //if ($tr.attr("is-editing") === "false")
        //    this.ctrlToSpan_row(rowId);
        this.updateAggCols();
    };

    this.disableRow = function (rowId) {
        let $tr = this.get$RowByRowId(rowId);
        $tr.find(".ctrlstd").attr("mode", "view").attr("title", "Row Disabled");
        $.each(this.objectMODEL[rowId], function (i, inpCtrl) {
            if (this.canAddCtrlHtml(inpCtrl))
                inpCtrl.disable();
        }.bind(this));
    };

    this.enableRow = function (rowId) {
        let $tr = this.get$RowByRowId(rowId);
        $tr.find(".ctrlstd").removeAttr('mode').removeAttr('title');
        $.each(this.objectMODEL[rowId], function (i, inpCtrl) {
            if (this.canAddCtrlHtml(inpCtrl))
                inpCtrl.enable();
        }.bind(this));
    };

    this.hideRow = function (rowId) {
        $(`#${this.TableId}>tbody>tr[rowid=${rowId}]`).hide(200);
    };

    this.hideRows = function (rowIds) {
        for (let i = 0; i < arguments.length; i++) {
            this.hideRow(arguments[i]);
        }
    };

    this.showRow = function (rowId) {
        $(`#${this.TableId}>tbody>tr[rowid=${rowId}]`).show(200);
    };

    this.showRows = function (rowIds) {
        arguments.each(function (i, rowId) {
            this.showRow(rowId);
        }.bind(this));
    };

    this.enable = function () {
        $(`#${this.TableId}`).attr("is-disabled", "false");
        this.$gridCont.attr("is-disabled", "false");
        if ($(`#${this.TableId}>tbody>tr.dgtr:last`).attr("is-editing") === "true")
            $(`#${this.TableId}>tbody>tr.dgtr:last`).show(300);
        this.$addRowBtn.removeClass("eb-disablebtn");
        $(`#cont_${this.ctrl.EbSid_CtxId}`).attr("eb-readonly", "false");
        this.ctrl.IsDisable = false;
    };

    this.disable = function () {
        $(`#${this.TableId}`).attr("is-disabled", "true");
        this.$gridCont.attr("is-disabled", "true");
        if ($(`#${this.TableId}>tbody>tr.dgtr:last`).attr("is-editing") === "true")
            $(`#${this.TableId}>tbody>tr.dgtr:last`).hide(300);
        this.$addRowBtn.addClass("eb-disablebtn");
        $(`#cont_${this.ctrl.EbSid_CtxId}`).attr("eb-readonly", "true");
        this.ctrl.IsDisable = true;
    };

    this.defineRowCount = function () {
        this.ctrl.RowCount = 0;
        Object.defineProperty(this.ctrl, "RowCount", {
            get: function () {
                return $(`#${this.TableId}>tbody>tr`).length;
            }.bind(this),
            set: function (value) {
                if (value !== this.ctrl.RowCount)
                    alert(`you have no right to  modify '${this.ctrl.Name}.RowCount'`);
            }.bind(this)
        });
    };

    //this.isCurRowEmpty = function () {
    //    let isCurRowEmpty = true;
    //    $.each(this.objectMODEL[this.curRowId], function (name, ctrl) {
    //        console.log(name);
    //        if (!ctrl.isEmpty()) {
    //            isCurRowEmpty = false;
    //            return false;
    //        }
    //    });
    //    return isCurRowEmpty;
    //}.bind(this);

    this.hasActiveRow = function () {
        let $activeRow = $(`#${this.TableId} tbody tr[is-editing="true"]`);
        if ($activeRow.length === 1)
            return true;
        else
            return false;
    };

    this.isCurRowEmpty = function () {
        let isCurRowEmpty = true;
        $.each(this.objectMODEL[this.curRowId], function (name, ctrl) {
            console.log(name);
            if (!ctrl.isEmpty()) {
                isCurRowEmpty = false;
                return false;
            }
        });
        return isCurRowEmpty;
    }.bind(this);

    this.B4saveActions = function () {
        //let $curRow = $(`[ebsid='${this.ctrl.EbSid}'] [rowid='${this.curRowId}']`);//fresh row. ':last' to handle dynamic addrow()(delayed check if row contains PoweSelect)
        ////if (!this.isCurRowEmpty()) {
        //if ($curRow.length === 1 && $curRow.attr("is-editing") === "true") {
        //    let td = $curRow.find(".ctrlstd")[0];
        //    this.checkRow_click({ target: td }, false);
        //}
    };

    //isCurRowEmpty = this.isCurRowEmpty;

    this.addUtilityFnsForUDF = function () {
        this.ctrl.currentRow.isEmpty = this.isCurRowEmpty;// return false if any column has value
        this.ctrl.rowRequired_valid_Check = this.RowRequired_valid_Check;// checks row validations and returns bool
        this.ctrl.sum = this.sumOfCol.bind(this, false);// returns sum of a numeric column
        this.ctrl.getRowByIndex = this.getRowByIndex;// get row by index (0,1...)
        this.ctrl.getValuesOfColumn = this.getValuesOfColumn;// returns value array of particular column
        this.ctrl.getCurrentRowId = function () { return this.curRowId; }.bind(this);

        this.ctrl.addRow = this.AddRowWithData.bind(this);
        this.ctrl.clear = this.clearDG.bind(this);

        this.ctrl.updateRowByRowId = this.updateRowByRowId.bind(this);
        this.ctrl.updateRowByRowIndex = this.updateRowByRowIndex.bind(this);
        this.ctrl.updateRowBySlno = this.updateRowBySlno.bind(this);

        this.ctrl.disableRow = this.disableRow.bind(this);
        this.ctrl.enableRow = this.enableRow.bind(this);

        this.ctrl.disable = this.disable.bind(this);// disable DG
        this.ctrl.enable = this.enable.bind(this);// enable DG

        this.ctrl.showRow = this.showRow.bind(this);//  + showRows
        this.ctrl.hideRow = this.hideRow.bind(this);
        this.ctrl.hideRows = this.hideRows.bind(this);

        this.ctrl.getRowBySlno = this.getRowBySlno.bind(this);
    };

    this.makeColsResizable = function () {
        //$(`#${this.TableId}_head .ebResizable`).resizable({
        //    handles: 'e',
        //    resize: function (event, ui) {
        //        let $curTd = ui.element;
        //        let tdWidth = $curTd.outerWidth();
        //        let $bodyTbl = $curTd.closest(".grid-cont").closestInner(".Dg_body");
        //        let $footerTbl = $curTd.closest(".grid-cont").closestInner(".grid-cont>.Dg_footer");

        //        $bodyTbl.find(`td[colname=${$curTd.attr("name")}]:first`).outerWidth(tdWidth);
        //        $footerTbl.find(`td[colname=${$curTd.attr("name")}]:first`).outerWidth(tdWidth);

        //        getObjByval(this.ctrl.Controls.$values, "Name", $curTd.attr("name")).Width = (tdWidth / $bodyTbl.outerWidth()) * 100;
        //        //getObjByval(this.ctrl.Controls.$values, "Name", $curTd.attr("name")).Width = tdWidth;
        //        //if ($curTd.attr("type") === "DGCreatedByColumn" || $curTd.next().attr("type") === "DGCreatedByColumn") {
        //        //    let width = $curTd.width() - 34;
        //        //    $(`#${this.TableId} [tdcoltype='DGCreatedByColumn']`).css("width", width + "px");                    
        //        //}
        //    }.bind(this)
        //});
    };

    this.setSuggestionVals = function () {
        let paramsColl__ = this.getParamsColl();
        let paramsColl = paramsColl__[0];
        let lastCtrlName = paramsColl__[1];
        let isFull = paramsColl__[2];

        if (isFull) {
            this.refreshDG(paramsColl, lastCtrlName);
        }
        else {
            //this.clearDG(false);//?
            if (this.ctrl.__continue)
                this.ctrl.__continue();
        }
    }.bind(this);

    this.ctrl.__setSuggestionVals = this.setSuggestionVals;

    this.getParamsColl = function () {
        let dependantCtrls = this.ctrl.Eb__paramControls.$values;
        let isFull = true;
        let params = [];
        let lastCtrlName;
        $.each(dependantCtrls, function (i, ctrlName) {
            let val = null;

            if (ctrlName === "eb_currentuser_id")
                val = ebcontext.user.UserId;
            else if (ctrlName === "eb_loc_id")
                val = this.formRenderer.getLocId();
            else if (ctrlName === "id")
                val = this.formRenderer.rowId;
            else if (ctrlName === "eb_current_language_id")
                val = ebcontext.languages.getCurrentLanguage();
            else if (ctrlName === "eb_current_locale")
                val = ebcontext.languages.getCurrentLocale();

            if (val !== null) {
                let obj = { Name: ctrlName, Value: val };
                params.push(obj);
                return;
            }

            let ctrl = this.ctrl.formObject[ctrlName];
            if (ctrl) {
                val = ctrl.getValue();
                lastCtrlName = ctrlName;
            }
            else
                console.error('Dg dr parameter control not found: ' + ctrlName);

            let obj = { Name: ctrlName, Value: val };
            params.push(obj);

            if (!this.ctrl.IsLoadDataSourceAlways && isFull && ctrl && !val && !(this.formRenderer.rowId <= 0 && this.ctrl.IsLoadDsNewModeOnloadAlways))
                isFull = false;
        }.bind(this));
        if (this.ctrl.CustomSelectDS && this.formRenderer.rowId <= 0)
            isFull = false;
        return [params, lastCtrlName, isFull];
    };

    this.showLoader = function () {
        $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#WebForm-cont" } });
    };

    this.hideLoader = function () {
        $("#eb_common_loader").EbLoader("hide");
    };

    this.refreshDG = function (paramsColl, lastCtrlName) {
        this.showLoader();
        $.ajax({
            type: "POST",
            url: "/WebForm/ImportFormData",
            data: {
                _refid: this.formRefId,
                _rowid: this.formRenderer.rowId,
                _triggerctrl: this.ctrl.Name,
                _params: paramsColl
            },
            error: function (xhr, ajaxOptions, thrownError) {
                this.hideLoader();
                EbMessage("show", { Message: `Couldn't Update ${this.ctrl.Label}, Something Unexpected Occurred`, AutoHide: false, Background: '#aa0000' });
                console.warn(`Couldn't Update ${this.ctrl.Label}, Something Unexpected Occurred`);
                if (this.formRenderer.rowId === 0)
                    this.clearDG(false);
                if (this.ctrl.__continue) this.ctrl.__continue();
            }.bind(this),
            success: this.reloadDG.bind(this)
        });

    }.bind(this);

    this.reloadDG = function (_respObjStr) {// need cleanup
        this.hideLoader();
        let _respObj = JSON.parse(_respObjStr);
        console.log(_respObj);
        if (_respObj.Status !== 200) {
            console.error('Data not loaded : ' + _respObj.Message);
            EbMessage("show", { Message: `Data loading in Datagrid (${this.ctrl.Label || this.ctrl.Name}) failed; ${_respObj.Message};`, AutoHide: true, Background: '#0000aa' });
            ebcontext._formLastResponse = _respObj;
            return;
        }
        let dataModel = _respObj.FormData.MultipleTables[this.ctrl.TableName];
        this.reloadDgUsingNewModel(dataModel);
        if (this.ctrl.__continue) this.ctrl.__continue();
    };

    this.reloadDgUsingNewModel = function (dataModel) {
        let lastModel = this.DataMODEL;

        let newModel = [], delModel = [], rowCntr = -501;
        if (this.ctrl.MergeData && lastModel.length > 0 && dataModel.length > 0) {
            let keyIdx1 = 0;
            let keyColumnName = dataModel[0].Columns[keyIdx1].Name;

            while (lastModel.length > 0) {
                let oldRow = lastModel.splice(0, 1)[0];
                //oldRow.IsDelete = false;
                let keyIdx2 = oldRow.Columns.findIndex(e => e.Name === keyColumnName);
                let newIdx = dataModel.findIndex(e => e.Columns[keyIdx1].Value === oldRow.Columns[keyIdx2].Value);
                if (newIdx >= 0 && !oldRow.IsDelete) {
                    dataModel.splice(newIdx, 1);
                    if (oldRow.RowId <= 0)
                        oldRow.RowId = rowCntr--;
                    newModel.push(oldRow);
                }
                else if (oldRow.RowId > 0) {
                    delModel.push(oldRow);
                }
            }
            for (let i = 0; i < dataModel.length; i++) {
                if (dataModel[i].RowId <= 0)
                    dataModel[i].RowId = rowCntr--;
                newModel.push(dataModel[i]);
            }
        }
        else {
            newModel = dataModel;
        }

        this.formRenderer.DataMODEL[this.ctrl.TableName] = newModel;// attach to master model object
        $(`#${this.TableId}>tbody>.dgtr`).remove();
        //$(`#${this.TableId}_head th`).not(".slno,.ctrlth").remove();
        this.populateDGWithDataModel(newModel, true);

        lastModel = lastModel.concat(delModel);
        for (let i = 0; i < lastModel.length; i++) {
            if (lastModel[i].RowId > 0 && this.DataMODEL.findIndex(e => e.RowId == lastModel[i].RowId) == -1) {
                lastModel[i].IsDelete = true;
                this.DataMODEL.push(lastModel[i]);
            }
        }
    }.bind(this);

    this.getDGIterable = function () {
        let DGrows = [];
        let rowIds = Object.keys(this.objectMODEL);
        for (let i = 0; i < rowIds.length; i++) {
            let rowId = rowIds[i];
            if (getObjByval(this.DataMODEL, "RowId", rowId) && getObjByval(this.DataMODEL, "RowId", rowId).IsDelete === false) {
                let row = this.getRowBySlno(false, rowId);
                if (row)
                    DGrows.push(row);
                else
                    console.error("could not find row for rowId :" + rowId);
            }
        }
        return DGrows;
    };

    this.clickedOnPsSeletedTag = function (e) {
        if (!($(e.target).hasClass('selected-tag')))
            return;
        let $td = $(e.currentTarget).closest("td");
        let rowid = $td.closest("tr").attr("rowid");
        let psname = $td.attr('colname');
        let psctrl = this.objectMODEL[rowid] ? this.objectMODEL[rowid].find(e => e.Name == psname) : null;
        if (!psctrl)
            return;
        let vmvalue = psctrl.DataVals.Value + '';
        if (psctrl.FormRefId && vmvalue) {
            let vms = vmvalue.split(",");
            if (vms.length > 0) {
                let _params = btoa(JSON.stringify([{ Name: 'id', Type: '7', Value: vms[$(e.currentTarget).index()] }]));
                if (psctrl.OpenInNewTab) {
                    let _locale = ebcontext.languages.getCurrentLocale();
                    let url = `../WebForm/Index?_r=${psctrl.FormRefId}&_p=${_params}&_m=${1}&_l=${ebcontext.locations.getCurrent()}&_lo=${_locale}`;
                    window.open(url, '_blank');
                }
                else
                    CallWebFormCollectionRender({ _source: 'ps', _refId: psctrl.FormRefId, _params: _params, _mode: 1, _locId: this.formRenderer.getLocId() });
            }
        }
    };

    this.clickedOnLabelLink = function (e) {
        let $spn = $(e.currentTarget);
        if (!$spn.text())
            return;
        let $td = $spn.closest("td");
        let rowid = $td.closest("tr").attr("rowid");
        let ctrlname = $td.attr('colname');
        let ctrl = this.objectMODEL[rowid] ? this.objectMODEL[rowid].find(e => e.Name == ctrlname) : null;
        if (!ctrl) {
            console.error('clickedOnLabelLink - ctrl not found');
            return;
        }

        if (ctrl.LinkVersionId && ctrl.LinkDataId) {
            let verIdCtrl = this.objectMODEL[rowid].find(e => e.Name == ctrl.LinkVersionId);
            let dataIdCtrl = this.objectMODEL[rowid].find(e => e.Name == ctrl.LinkDataId);
            if (verIdCtrl && dataIdCtrl) {
                let verId = verIdCtrl.getValue();
                let dataId = dataIdCtrl.getValue();
                if (verId && dataId) {
                    let params = [];
                    params.push(new fltr_obj(11, "id", dataId));
                    let url = `/WebForm/Inde?_r=${verId}&_p=${btoa(JSON.stringify(params))}&_m=1&_l=${this.formRenderer.getLocId()}`;
                    window.open(url, '_blank');
                    return;
                }
            }
        }

        if (!(ctrl.LinkedObjects && ctrl.LinkedObjects.$values.length > 0)) {
            console.error('clickedOnLabelLink - no linked objects');
            return;
        }
        let linkObj = ctrl.LinkedObjects.$values[0];

        if (!linkObj.ObjRefId) {
            console.error('clickedOnLabelLink - invalid obj refid');
            return;
        }
        if (linkObj.LinkType !== 3) {
            console.error('clickedOnLabelLink - only popup supported');
            return;
        }

        let _params = this.getLabelLinkParameters(linkObj, rowid);

        let _mode = 1;//view
        if (linkObj.FormMode && linkObj.FormMode == 3)
            _mode = 3;//edit

        if (_params.findIndex(e => e.Name === 'id') === -1) //prefill
            _mode = 2;

        ctrl.reverseUpdateData = this.reverseUpdateData.bind(this, linkObj, rowid);

        ebcontext.webform.PopupForm(linkObj.ObjRefId, btoa(JSON.stringify(_params)), _mode,
            {
                srcCxt: this.formRenderer.__MultiRenderCxt,
                initiator: ctrl,
                locId: this.formRenderer.getLocId()
            });
    };

    this.getLabelLinkParameters = function (linkObj, rowid) {
        let destid = 0;
        let params = [];
        let pushMasterId = true;
        let pushLinesId = true;

        if (linkObj.DataFlowMap && linkObj.DataFlowMap.$values.length > 0) {
            let pMap = linkObj.DataFlowMap.$values;
            for (let i = 0; i < pMap.length; i++) {
                if (!pMap[i].$type.includes('DataFlowForwardMap'))
                    continue;

                if (pMap[i].SrcCtrlName === 'id') {//source table id
                    params.push({ Name: pMap[i].DestCtrlName, Type: 7, Value: this.formRenderer.rowId });
                    pushMasterId = false;
                    continue;
                }
                else if (pMap[i].SrcCtrlName === this.ctrl.TableName + '_id') {//current row id
                    if (pMap[i].DestCtrlName === 'id') {
                        params = [{ Name: 'id', Type: 7, Value: rowid > 0 ? rowid : 0 }];
                        pushMasterId = false;
                        break;
                    }
                    params.push({
                        Name: pMap[i].DestCtrlName,
                        Type: 7,
                        Value: rowid > 0 ? rowid : 0
                    });
                    pushLinesId = false;
                    continue;
                }

                let dgCtrl = this.objectMODEL[rowid].find(e => e.__Col.Name === pMap[i].SrcCtrlName);
                if (pMap[i].DestCtrlName === 'id') {
                    if (dgCtrl) {
                        if (dgCtrl.getValue() > 0) {
                            destid = dgCtrl.getValue();
                            params = [{ Name: 'id', Type: 7, Value: destid }];
                            pushMasterId = false;
                            break;
                        }
                        continue;
                    }
                    let outCtrl = this.ctrl.formObject[pMap[i].SrcCtrlName];
                    if (outCtrl) {
                        if (outCtrl.getValue() > 0) {
                            destid = outCtrl.getValue();
                            params = [{ Name: 'id', Type: 7, Value: destid }];
                            pushMasterId = false;
                            break;
                        }
                    }
                }
                else {
                    if (dgCtrl) {
                        params.push({
                            Name: pMap[i].DestCtrlName,
                            Type: dgCtrl.EbDbType,
                            Value: dgCtrl.getValue()
                        });
                    }
                    else {
                        let outCtrl = this.ctrl.formObject[pMap[i].SrcCtrlName];
                        if (outCtrl) {
                            params.push({
                                Name: pMap[i].DestCtrlName,
                                Type: outCtrl.EbDbType,
                                Value: outCtrl.getValue()
                            });
                        }
                    }
                }
            }
        }
        if (pushMasterId) {
            params.push({ Name: this.formRenderer.MasterTable + '_id', Type: 7, Value: this.formRenderer.rowId });
            if (pushLinesId)
                params.push({ Name: this.ctrl.TableName + '_id', Type: 7, Value: rowid > 0 ? rowid : 0 });
        }

        return params;
    };

    this.reverseUpdateData = function (linkObj, rowid, destRender) {
        if (linkObj.DataFlowMap && linkObj.DataFlowMap.$values.length > 0) {
            this.setCurRow(rowid);
            let pMap = linkObj.DataFlowMap.$values;
            for (let i = 0; i < pMap.length; i++) {
                if (!pMap[i].$type.includes('DataFlowReverseMap'))
                    continue;
                let dgCtrl = this.objectMODEL[rowid].find(e => e.__Col.Name === pMap[i].DestCtrlName);
                if (!dgCtrl)
                    continue;

                if (pMap[i].SrcCtrlName === 'id') {
                    dgCtrl.setValue(destRender.rowId);
                }
                else {
                    let outCtrl = destRender.formObject[pMap[i].SrcCtrlName];
                    if (outCtrl)
                        dgCtrl.setValue(outCtrl.getValue());
                }
            }
        }
    };

    this.init = function () {
        this.curRowObjectMODEL = {};
        this.ctrl.currentRow = this.curRowObjectMODEL;
        this.ctrl.Rows = [];


        Object.defineProperty(this.ctrl, "Rows", {
            set: function (value) {
                ;
            }.bind(this),
            get: function () {
                return this.getDGIterable();
            }.bind(this)
        });

        this.colNames = this.ctrl.Controls.$values.map(function (obj) { return obj["Name"]; }.bind(this));

        this.addUtilityFnsForUDF();

        this.isAggragateInDG = false;
        this.isPSInDG = false;
        this.S_cogsTdHtml = "";
        this.rowSLCounter = 0;
        this.$addRowBtn = $(`#${this.ctrl.EbSid}Wraper .addrow-btn`);
        this.RowShowDelay = 0;
        $.each(this.ctrl.Controls.$values, function (i, col) {
            col.__DG = this.ctrl;
            col.__DG.objectMODEL = this.objectMODEL;
            col.getValue = this.ColGetvalueFn;
            col.setValue = this.ColSetvalueFn;
            col.enable = this.EnableFn;
            col.disable = this.DisableFn;
            col.__updateAggCol = this.updateAggCol;
            if (col.IsAggragate)
                this.isAggragateInDG = true;
            if (col.ObjType === "DGPowerSelectColumn")
                this.isPSInDG = true;
            if (col.ObjType === "DGUserControlColumn")
                col.__DGUCC = new DGUCColumn(col, this.ctrl.__userObject);
            if (col.ObjType === "DGPowerSelectColumn" || col.ObjType === "DGDateColumn")
                this.RowShowDelay = 300;

            //create input ctrl here

        }.bind(this));

        if (this.ctrl.IsColumnsResizable)
            this.makeColsResizable();

        //this.tryAddRow();
        if (this.isAggragateInDG) {
            this.initAgg();
            $(`#${this.ctrl.EbSid}Wraper .Dg_footer`).show();
        }
        if (!this.ctrl.IsShowSerialNumber)
            $(`#${this.ctrl.EbSid}Wraper`).attr("hideslno", "true");

        this.defineRowCount();

        $(`#${this.ctrl.EbSid}Wraper`).on("click", ".addrow-btn", this.addRowBtn_click);
        $(`#${this.ctrl.EbSid}addrow`).keypress(function (e) {
            if ((e.which == 13) || (e.keyCode === 13)) {
                this.addRowBtn_click();
            }
        }.bind(this));
        $(`#${this.ctrl.EbSid}Wraper`).on("click", ".excelupload-btn", this.excelUploadBtn_click);
        $(`#${this.ctrl.EbSid}Wraper`).on("click", ".refreshdgdr-btn", this.refreshDgDrBtn_clicked);
        this.$table.on("click", ".check-row", this.checkRow_click_New);
        this.$table.on("click", ".cancel-row", this.cancelRow_click);
        this.$table.on("click", ".del-row", this.delRow_click);
        this.$table.on("click", ".edit-row", this.editRow_click);
        this.$table.on("keydown", ".dgtr", this.dg_rowKeydown);
        //this.$table.on("dblclick", ".dgtr > td", this.row_dblclick);
        this.$table.on("click", ".dgtr > td", this.row_tdClicked);
        this.$table.on("focusin", ".dgtr > td", this.row_focusin.bind(this));
        this.$table.on("focus", ".dgtr > td", this.row_focus.bind(this));
        //this.$table.on("focusout", ".dgtr", this.row_focusout.bind(this));
        $(document).on('mouseup', this.row_focusout.bind(this));
        this.$table.on("click", ".dgtr > td[tdcoltype='DGPowerSelectColumn'] > [coltype='DGPowerSelectColumn'] .selected-tag", this.clickedOnPsSeletedTag.bind(this));
        this.$table.on("click", ".dgtr > td[tdcoltype='DGLabelColumn'] > [coltype='DGLabelColumn'] span", this.clickedOnLabelLink.bind(this));
        this.$table.on("click", ".dgtr > td[tdcoltype='DGLabelColumn'] .ebdg-label-link span", this.clickedOnLabelLink.bind(this));

        $(`#${this.ctrl.EbSid}Wraper .Dg_Hscroll`).on("scroll", this.dg_HScroll);
        $(`#${this.ctrl.EbSid}Wraper .DgHead_Hscroll`).on("scroll", this.dg_HScroll);
        $(`#${this.ctrl.EbSid}Wraper .Dg_footer`).on("scroll", this.dg_HScroll);
        $(`#${this.ctrl.EbSid}Wraper .dg-body-vscroll`).on("scroll", this.dg_HScroll);
        for (let i = 0; i < this.ctrl.Controls.$values.length; i++) {
            this.initControls.initInfo(this.ctrl.Controls.$values[i]);
        }

        this.$TblBody = this.$table.children('tbody');///
        if (this.ctrl.DeferRender)
            this.$DGbody.on("scroll", this.dg_VScroll);
    };

    this.dg_HScroll = function (e) {
        let $e = $(event.target);
        let scrollLeft = $e.scrollLeft();

        let $headHScroll = $(`#${this.ctrl.EbSid}Wraper .DgHead_Hscroll`);
        let $footerHScroll = $(`#${this.ctrl.EbSid}Wraper .Dg_footer`);
        let $bodyHScroll = $(`#${this.ctrl.EbSid}Wraper .dg-body-vscroll`);

        if ($e !== $headHScroll && $headHScroll.scrollLeft() !== scrollLeft)
            $headHScroll.scrollLeft(scrollLeft);
        if ($e !== $bodyHScroll && $bodyHScroll.scrollLeft() !== scrollLeft)
            $bodyHScroll.scrollLeft(scrollLeft);
        if ($e !== $footerHScroll && $footerHScroll.scrollLeft() !== scrollLeft)
            $footerHScroll.scrollLeft(scrollLeft);
    }.bind(this);

    this.timer = null;

    this.dg_VScroll = function (e) {
        if (this.visibleTrWindowSize >= this.DataMODEL.length)
            return;
        if (this.disableVScrollAdjust) {
            this.disableVScrollAdjust = false;
            return;
        }
        clearTimeout(this.timer);
        this.timer = setTimeout(this.dg_VScroll_inner, 300);
    }.bind(this);

    this.dg_VScroll_inner = function (e) {
        let scrollTop = this.$DGbody.scrollTop();
        let topRowIndx = parseInt(scrollTop / this.trHeightInPx);
        this.dg_VScroll_inner2(topRowIndx);
    }.bind(this);

    this.dg_VScroll_inner2 = function (topRowIndx) {
        let visTrNum = parseInt(this.$TblBody.children('tr').first().attr('rownum'));

        if (topRowIndx >= visTrNum && topRowIndx <= visTrNum + this.visibleTrViewMargin * 2)
            return;

        let $activeTr = $(`#${this.TableId}>tbody tr[is-editing="true"]`);
        if ($activeTr.length > 0) {
            let rowId = $activeTr.attr("rowid");
            if (!this.confirmRow(rowId)) {
                this.cancelRow_click({ target: $activeTr.find('.cancel-row')[0] });
            }
        }

        let topMarginRowIndx = topRowIndx - this.visibleTrViewMargin > 0 ? topRowIndx - this.visibleTrViewMargin : 0;

        this.$TblBody.empty();
        let trsHTML = this.getTrsHTML_(topMarginRowIndx);
        this.$TblBody.append(trsHTML);
        this.adjustMargin(topMarginRowIndx);

        this.$TblBody.find(".ctrlstd .check-row").hide();
        this.$TblBody.find(".ctrlstd .del-row").show();
        this.$TblBody.find(".ctrlstd .edit-row").show();
    }.bind(this);

    this.scrollToTop = function () {
        if (!this.ctrl.DeferRender)
            return;
        if (this.visibleTrWindowSize >= this.DataMODEL.length)
            return;
        this.disableVScrollAdjust = true;
        this.dg_VScroll_inner2(0);
        this.$DGbody.scrollTop(0);
    }.bind(this);

    this.scrollToBottom = function () {
        if (!this.ctrl.DeferRender)
            return;
        if (this.visibleTrWindowSize >= this.DataMODEL.length)
            return;
        this.disableVScrollAdjust = true;
        let topRowIndx = 0;
        if (this.visibleTrWindowSize < this.DataMODEL.length)
            topRowIndx = this.DataMODEL.length - this.visibleTrWindowSize + this.visibleTrViewMargin;
        this.dg_VScroll_inner2(topRowIndx);
        this.$DGbody.scrollTop(this.$DGbody[0].scrollHeight);
    }.bind(this);

    this.adjustMargin = function (topRowIndx) {
        let trCount = this.DataMODEL.length;

        if (topRowIndx > 0) {
            this.$table.css('margin-top', parseInt(topRowIndx * this.trHeightInPx) + 'px');
            if (topRowIndx + this.visibleTrWindowSize < trCount) {
                let bPad = (trCount - topRowIndx - this.visibleTrWindowSize) * this.trHeightInPx;
                this.$table.css('margin-bottom', parseInt(bPad) + 'px');
            }
            else {
                this.$table.css('margin-bottom', '0px');
            }
        }
        else {
            this.$table.css('margin-top', '0px');
            if (topRowIndx + this.visibleTrWindowSize < trCount) {
                let bPad = (trCount - topRowIndx - this.visibleTrWindowSize) * this.trHeightInPx;
                this.$table.css('margin-bottom', parseInt(bPad) + 'px');
            }
            else {
                this.$table.css('margin-bottom', '0px');
            }
        }
    }.bind(this);

    this.preInit = function () {
        //if (this.ctrl.DataSourceId) {
        //    if (!this.formRenderer.isInitiallyPopulating && (this.Mode.isNew || (this.ctrl.IsLoadDataSourceInEditMode && this.Mode.isEdit))) {
        //        this.isDataImport = true;// is this using??
        //        this.setSuggestionVals();
        //    }
        //}
        this.init();
    }.bind(this);

    this.preInit();
};