const EbDataGrid = function (ctrl, options) {
    this.ctrl = ctrl;
    this.FormDataExtdObj = options.FormDataExtdObj;
    this.ctrl.formObject = options.formObject;
    this.formObject_Full = options.formObject_Full;
    this.formRenderer = options.formRenderer;
    this.formRefId = options.formRefId;
    this.ctrl.__userObject = options.userObject;
    this.ctrl.__userObject.decimalLength = 2;// Hard coding 29-08-2019
    //this.ctrl.__DGB = this;
    this.initControls = new InitControls(this);
    this.Mode = options.Mode;
    this.RowDataModel = this.formRenderer.formData.DGsRowDataModel[this.ctrl.TableName];
    this.DataMODEL = options.isDynamic ? [] : this.formRenderer.DataMODEL[this.ctrl.TableName];
    this.TableId = `tbl_${this.ctrl.EbSid_CtxId}`;
    this.$table = $(`#${this.TableId}`);
    this.$gridCont = $(`#cont_${this.ctrl.EbSid} .grid-cont`);
    this.$SlTable = $(`#slno_${this.ctrl.EbSid}`);
    this.SlTableId = `#slno_${this.ctrl.EbSid}`;
    this.$DGbody = $(`#${this.ctrl.EbSid}Wraper .Dg_body`);

    this.mode_s = "";
    if (this.Mode.isEdit)
        this.mode_s = "edit";
    else if (this.Mode.isNew)
        this.mode_s = "new";
    else if (this.Mode.isView)
        this.mode_s = "view";

    this.objectMODEL = {};
    this.objectMODELdict = {};

    this.resetBuffers = function () {
        this.curRowObjectMODEL = {};
        this.curRowDataMODEL = {};
        this.newRowCounter = 0;
        this.rowSLCounter = 0;
    }.bind(this);
    this.resetBuffers();

    this.setEditModeRows = function (dataModel) {
        this.DataMODEL = dataModel;
        ////{ last change
        //this.DataMODEL.clear();
        //this.DataMODEL.push(...dataModel);
        ////}
        this.curRowDataMODEL = this.getRowDataModel_();
        this.constructObjectModel(this.DataMODEL);// and attach dataModel reff
        this.fixValExpInDataModel();
        this.drawHTMLView();
        this.updateAggCols(false);
    }.bind(this);

    this.constructObjectModel = function (dataRows) {
        this.objectMODEL = {};
        this.objectMODELdict = {};
        let visibleCtrlIdx = 0;
        for (let i = 0; i < dataRows.length; i++) {
            let dataRow = dataRows[i];
            let rowId = dataRow.RowId;
            this.objectMODEL[rowId] = [];

            for (let colIndex = 0; colIndex < this.ctrl.Controls.$values.length; colIndex++) {
                let col = this.ctrl.Controls.$values[colIndex];
                let inpCtrlType = col.InputControlType;
                let ctrlEbSid = "ctrl_" + Date.now().toString(36) + visibleCtrlIdx++;// creates a unique id
                let inpCtrl = new EbObjects[inpCtrlType](ctrlEbSid, col);// creates object
                inpCtrl.__isEditing = false;
                inpCtrl.DataVals = getObjByval(dataRow.Columns, "Name", col.Name);
                inpCtrl.curRowDataVals = getObjByval(this.curRowDataMODEL.Columns, "Name", col.Name);
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
                let ValueExpr_val = getValueExprValue(inpCtrl, this.ctrl.formObject, this.ctrl.__userObject, this.formObject_Full);
                if (inpCtrl.DoNotPersist && ValueExpr_val !== undefined)
                    inpCtrl.DataVals.Value = ValueExpr_val;
            }
            this.onRowPaintFn(["tr"], "check", "e");// --
        }.bind(this));
    };

    this.drawHTMLView = function () {
        $(`#${this.TableId} tbody`).empty();
        this.resetBuffers();
        let trsHTML = this.getTrsHTML_();

        //if (!this.ctrl.AscendingOrder)
        //    this.UpdateSlNo();
        $(`#${this.TableId}>tbody`).append(trsHTML);
        $(`#${this.TableId}>tbody`).find(".ctrlstd .check-row").hide();
        $(`#${this.TableId}>tbody`).find(".ctrlstd .del-row").show();
        $(`#${this.TableId}>tbody`).find(".ctrlstd .edit-row").show();
    };

    this.getTrsHTML_ = function () {
        let TrsHTML = [];
        //let rowIds = Object.keys(this.objectMODEL);
        let rowIds = this.DataMODEL.map(a => a.RowId);
        let i = 0;
        for (i = 0; i < rowIds.length; i++) {
            let rowId = rowIds[i];
            TrsHTML.push(this.getTrHTML_(this.objectMODEL[rowId], rowId, false));
        }
        if (this.cloneMode && this.formRenderer.notSavedOnce)
            this.newRowCounter = -i;
        return TrsHTML.join();
    };

    this.getTrHTML_ = function (rowCtrls, rowid, isAdded = true) {
        let isAnyColEditable = false;
        let tr = `<tr class='dgtr' is-editing='${isAdded}' is-initialised='false' is-checked='true' is-added='${isAdded}' tabindex='0' rowid='${rowid}'>
                    <td class='row-no-td' idx='${++this.rowSLCounter}'>${this.rowSLCounter}</td>`;

        let visibleCtrlIdx = 0;

        for (let i = 0; i < rowCtrls.length; i++) {
            let inpCtrl = rowCtrls[i];
            if (inpCtrl.Hidden)
                continue;
            if (!inpCtrl.DataVals && !col.DoNotPersist)
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

    this.getTdHtml_ = function (inpCtrl, visibleCtrlIdx) {
        let col = inpCtrl.__Col;
        if (!inpCtrl.DoNotPersist)
            inpCtrl.__eb_EditMode_val = inpCtrl.DataVals.Value;

        return `<td id ='td_@ebsid@' ctrltdidx='${visibleCtrlIdx}' tdcoltype='${col.ObjType}' agg='${col.IsAggragate}' colname='${col.Name}' style='width:${this.getTdWidth(visibleCtrlIdx, col)}'>
                    <div id='@ebsid@Wraper' style='display:none' class='ctrl-cover' eb-readonly='@isReadonly@' @singleselect@>${col.DBareHtml || inpCtrl.BareControlHtml}</div>
                    <div class='tdtxt' style='display:block' coltype='${col.ObjType}'>
                      <span>${this.getDispMembr(inpCtrl)}</span>
                    </div >                                               
                </td>`
            .replace("@isReadonly@", col.IsDisable)
            .replace("@singleselect@", col.MultiSelect ? "" : `singleselect=${!col.MultiSelect}`)
            .replace(/@ebsid@/g, inpCtrl.EbSid_CtxId);
    };

    this.editRow_click = function (e) {
        let $addRow = $(`[ebsid='${this.ctrl.EbSid}'] [is-checked='false']`);
        let td = $addRow.find(".ctrlstd")[0];
        let isSameRow = $(event.target).closest("tr") === $addRow;
        if ($addRow.length !== 0 && !this.checkRow_click({ target: td }, false, false, isSameRow))
            return;

        let $td = $(e.target).closest("td");
        let $tr = $td.closest("tr");
        let rowId = $tr.attr("rowid");
        this.setCurRow(rowId);
        if ($tr.attr("is-initialised") === 'false')
            this.rowInit_E($tr, rowId);
        $td.find(".del-row").hide();
        $(`[ebsid='${this.ctrl.EbSid}'] tr[is-checked='true']`).find(`.edit-row`).hide();
        //$addRow.hide(300).attr("is-editing", "false");
        $td.find(".check-row").show();
        this.$addRowBtn.addClass("eb-disablebtn");
        $tr.attr("is-editing", "true");
        this.spanToCtrl_row($tr);
        $(`#${this.TableId}>tbody>[is-editing=true]:first *:input[type!=hidden]:first`).focus();
        //if (!this.curRowObjectMODEL[this.colNames[0]].__isEditing)
        this.setcurRowDataMODELWithOldVals(rowId);
        this.changeEditFlagInRowCtrls(true, rowId);
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

        $tr.attr("is-initialised", "true");
    };

    this.initRowCtrls = function (rowId, IsNoValExp) {
        let CurRowCtrls = this.objectMODEL[rowId];
        this.changeEditFlagInRowCtrls(true, rowId);

        //// initialise all controls in added row
        for (let i = 0; i < CurRowCtrls.length; i++) {
            let inpCtrl = CurRowCtrls[i];
            let opt = {};
            if (inpCtrl.ObjType === "PowerSelect")// || inpCtrl.ObjType === "DGPowerSelectColumn")
                opt.getAllCtrlValuesFn = this.getFormVals;
            else if (inpCtrl.ObjType === "Date") {
                opt.source = "webform";
                opt.userObject = this.ctrl.__userObject;
            }

            let t0 = performance.now();
            this.initControls.init(inpCtrl, opt);

            let t1 = performance.now();
            //console.dev_log("initControls : " + inpCtrl.ObjType + " took " + (t1 - t0) + " milliseconds.");

        }

        //should fire after onChangeFn init
        for (let j = 0; j < CurRowCtrls.length; j++) {
            let inpCtrl = CurRowCtrls[j];

            if (!IsNoValExp) {
                // DefaultValueExpression
                if (inpCtrl.DefaultValueExpression && inpCtrl.DefaultValueExpression.Code) {
                    let fun = new Function("form", "user", `event`, atob(inpCtrl.DefaultValueExpression.Code)).bind(inpCtrl, this.ctrl.formObject, this.ctrl.__userObject);
                    let val = fun();
                    inpCtrl.setValue(val);
                }
            }

            // disble 
            if (inpCtrl.IsDisable)
                inpCtrl.disable();

            //// run DG onChangeFns initially
            //if (inpCtrl.OnChangeFn && inpCtrl.OnChangeFn.Code && inpCtrl.OnChangeFn.Code.trim() !== '') {
            //    try {
            //        let FnString = atob(inpCtrl.OnChangeFn.Code) +
            //            `;console.log('GOT IT initially inside dg---'); console.log(this)`;
            //        let onChangeFn = new Function('form', 'user', `event`, FnString).bind(inpCtrl, this.ctrl.formObject, this.ctrl.__userObject);
            //        inpCtrl.__onChangeFn = onChangeFn;
            //        console.log(`>> Starting execution of OnChange function of 'form.${this.ctrl.Name}.${inpCtrl.Name}'`);
            //        inpCtrl.__onChangeFn();
            //    }
            //    catch (e) {
            //        console.eb_log("eb error :");
            //        console.eb_log(e);
            //        alert("  error in 'OnChange function' of : " + inpCtrl.Name + " - " + e.message);
            //    }
            //}

        }


        ////////////////////
        //if (SingleRow) {
        //    this.setDataInRow(SingleRow, rowid, CurRowCtrls);
        //}
        ////////////////////

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
                if (ctrl.ObjType === "PowerSelect") {
                    //ctrl.setDisplayMember = EBPSSetDisplayMember;//////
                    ctrl.justInit = true;
                    ctrl.setDisplayMember(Value);
                }
                else
                    ctrl.justSetValue(Value);// should remove
            }
        }
    };

    this.resetControlValues = function (dataModel) {
        console.log(dataModel);
        this.setEditModeRows(dataModel);
    };


    this.getPSDispMembrs = function (inpCtrl) { // need to rework
        let rowId = inpCtrl.__rowid;
        let cellObj = inpCtrl.DataVals;
        let col = inpCtrl.__Col;
        if (col.RenderAsSimpleSelect)
            return this.getSSDispMembrs(cellObj, rowId, col);

        if (!cellObj.Value && cellObj.Value !== 0)
            return "";

        let valMsArr = cellObj.Value.toString().split(',');
        let textspn = "";

        for (let i = 0; i < valMsArr.length; i++) {
            textspn += "<span iblock>";
            let vm = parseInt(valMsArr[i]);
            let dispA = cellObj.D[vm];
            for (let j = 0; j < col.DisplayMembers.$values.length; j++) {
                let DMName = col.DisplayMembers.$values[j].name;
                let DMVal = dispA[DMName];
                textspn += `<span class='selected-tag'>${DMVal === null ? "" : DMVal}</span>`;
            }
            textspn += "</span>&nbsp;&nbsp;&nbsp;";
        }

        return textspn.substr(0, textspn.length - 18);
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

    this.getBooleanDispMembrs = function (cellObj, rowId, col) {
        if (cellObj.Value === true)
            return "✔";
        else
            return "✖";
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
            dspMmbr = this.getBooleanDispMembrs(cellObj, rowId, col);
        }
        else if (col.ObjType === "DGNumericColumn") {
            dspMmbr = cellObj.F || cellObj.Value || "0.00"; // temporary fix
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
            let spn = `<img class='sysctrl_usrimg' src='/images/dp/${cellObj.Value.split('$$')[0]}.png' alt='' onerror=this.onerror=null;this.src='/images/nulldp.png'>`;
            spn += `<span class='sysctrl_usrname'>${cellObj.Value.split('$$')[1]}</span>`;
            // dspMmbr = cellObj.Value.split('$$')[1];
            dspMmbr = spn;
        }
        else if (col.ObjType === "EbDGUserSelectColumn") {
            alert();
            //let spn = `<div class="ulstc-disp-img-c" style="background-image: url(/images/dp/${cellObj.Value.split('$$')[0]}.png;), url(/images/nulldp.png;);></div>`

            //spn += `<div class="ulstc-disp-txt">${cellObj.Value.split('$$')[1]}</div>`;
            //// dspMmbr = cellObj.Value.split('$$')[1];
            //dspMmbr = spn;
        }
        else
            dspMmbr = cellObj.Value || "";

        return dspMmbr;
    };

    //this.getDataValsObj = function (rowIndex, col) {
    //    let dataRow = this.DataMODEL[rowIndex];
    //    return getObjByval(dataRow.Columns, "Name", col.Name);
    //};

    ctrl.ChangedRowObject = function () {
        return this.changedRowWT();
    }.bind(this);

    ctrl.isValid = function () {
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

    //this.setTdVal = function (inpCtrl) {
    //    $(`#td_${inpCtrl.EbSid_CtxId} .tdtxt>span`).text(inpCtrl.DataVals.Value);
    //};

    this.initCtrl4EditMode = function (inpCtrl) {
        let t0 = performance.now();
        if (inpCtrl.ObjType === "PowerSelect") {
            inpCtrl.initializer = {};//temporary init
            inpCtrl.initializer.Vobj = {};//temporary init
            inpCtrl.initializer.dmNames = inpCtrl.DisplayMembers.$values.map(function (obj) { return obj["name"]; });
            inpCtrl.initializer.columnVals = {};//temporary init

            inpCtrl.initializer.setValues = function (p1, p2) { $(`#${inpCtrl.EbSid_CtxId}Wraper [ui-inp]`).val(p1);/*.trigger('change'); */ };

            inpCtrl.getColumn = function (colName) {
                let columnVals = getEbFormatedPSRows(this);
                return inpCtrl.MultiSelect ? columnVals[colName] : columnVals[colName][0];
            };
        }
        //else {
        //    inpCtrl.setValue = function (p1) {
        //        $(`#${inpCtrl.EbSid_CtxId}Wraper [ui-inp]`).val(p1).trigger('change');
        //    };//temporary init
        //}
        let t1 = performance.now();
        //console.dev_log("DataGrid : initCtrl4EditMode took " + (t1 - t0) + " milliseconds.");
    };

    this.tryAddRow = function () {
        if ((this.Mode.isEdit || this.Mode.isNew) && this.ctrl.IsAddable && !this.ctrl.IsDisable)
            this.addRow();
        if (this.Mode.isEdit)
            $(`.ctrlstd[mode] `).attr("mode", "edit");
        if (this.Mode.isNew)
            $(`.ctrlstd[mode] `).attr("mode", "new");
    };

    this.SwitchToEditMode = function () {
        this.rowSLCounter = this.rowSLCounter - $(`#${this.TableId} tbody [is-editing=true]`).remove().length;
        $(`#${this.TableId} tbody>tr>.ctrlstd`).attr("mode", "edit");
        this.mode_s = "edit";
        //this.tryAddRow();
    };

    this.SwitchToViewMode = function () {
        $(`#${this.TableId} tbody [is-editing=true]`).remove();
        $(`#${this.TableId} tbody>tr>.ctrlstd`).attr("mode", "view");
        this.mode_s = "view";
        if (!this.ctrl.AscendingOrder)
            this.UpdateSlNo();
    };

    this.getRowDataModel_ = function (rowId = 0, rowObjectMODEL) {
        let SingleRow = {};
        SingleRow.RowId = rowId;
        SingleRow.Columns = [];
        SingleRow.Columns.push({
            Name: "eb_row_num",
            Value: parseInt($(`#${this.TableId} tbody tr[rowid=${rowId}] td.row-no-td`).attr("idx")),
            Type: 7
        });
        $.each(this.ctrl.Controls.$values, function (i, col) {
            if (col.ObjType === "DGUserControlColumn") {
                $.each(col.Columns.$values, function (i, ctrl) {
                    SingleRow.Columns.push(getSingleColumn(ctrl));
                }.bind(this));
            }
            else
                SingleRow.Columns.push(getSingleColumn(col));
        }.bind(this));
        return SingleRow;
    };

    this.getRowDataModel = function (rowId, rowObjectMODEL) {
        //let SingleRow = {};
        //SingleRow.RowId = rowId;
        //SingleRow.IsUpdate = (rowId !== 0);
        //SingleRow.IsDelete = rowObjectMODEL.IsDelete;
        //SingleRow.Columns = [];
        //SingleRow.Columns.push({
        //    Name: "eb_row_num",
        //    Value: parseInt($(`#${this.TableId} tbody tr[rowid=${rowId}] td.row-no-td`).attr("idx")),
        //    Type: 7
        //});

        //$.each(rowObjectMODEL, function (i, obj) {
        //    //if (!obj.DoNotPersist) {
        //    if (obj.ObjType === "DGUserControlColumn") {
        //        $.each(obj.Columns.$values, function (i, ctrl) {
        //            SingleRow.Columns.push(getSingleColumn(ctrl));
        //        }.bind(this));
        //    }
        //    else
        //        SingleRow.Columns.push(getSingleColumn(obj));
        //    //}
        //}.bind(this));
        //return SingleRow;

        let rowDataModel = JSON.parse(JSON.stringify(this.RowDataModel));
        let eb_row_num = parseInt($(`#${this.TableId} tbody tr:last td.row-no-td`).attr("idx")) + 1;
        rowDataModel.RowId = rowId;
        getObjByval(rowDataModel.Columns, "Name", "eb_row_num").Value = eb_row_num;
        this.attachModalCellRef_Row(rowDataModel, rowObjectMODEL);
        return rowDataModel;
    };

    this.changedRowWT = function () {
        let dataModel = [];
        $.each(this.objectMODEL, function (rowId, rowObjectMODEL) {
            if (parseInt(rowId) < 0 && $(`#${this.TableId} tbody tr[rowid=${rowId}]`).length === 0)// to skip newly added and then deleted rows
                return true;
            if ($(`#${this.TableId} tbody tr[rowid=${rowId}]`).attr("is-checked") === "true") /* - if checked*/
                dataModel.push(this.getRowDataModel(rowId, rowObjectMODEL));
            else if ($(`#${this.TableId} tbody tr[rowid=${rowId}]`).length === 0)// to manage deleted row
                dataModel.push({ RowId: rowId, IsDelete: true });
        }.bind(this));
        console.log(dataModel);
        return dataModel;
    }.bind(this);

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
                let NewInpCtrl = $.extend({}, new EbObjects[this.getType(_inpCtrl)](_ctrlEbSid, _inpCtrl));
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
            //$.each(inpCtrl.Columns.$values, function (i, col) {
            //}.bind(this));
        }
        return new ControlOps[colType](inpCtrl);
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
        inpCtrl.Columns.$values = this.cloneObjArr(inpCtrl.Columns.$values);

        inpCtrl.__DG = dg;
        inpCtrl.__DGUCC = dgucc;

        col = this.attachFns(col, col.ObjType);
    };

    this.getNewTrHTML = function (rowid, isAdded = true) {
        let isAnyColEditable = false;
        let tr = `<tr class='dgtr' is-editing='${isAdded}' is-checked='false' is-added='${isAdded}' tabindex='0' rowid='${rowid}'>
                    <td class='row-no-td' idx='${++this.rowSLCounter}'>${this.rowSLCounter}</td>`;
        this.objectMODEL[rowid] = [];

        let visibleCtrlIdx = 0;
        //$.each(this.ctrl.Controls.$values, function (i, col) {
        for (let i = 0; i < this.ctrl.Controls.$values.length; i++) {
            let col = this.ctrl.Controls.$values[i];
            let inpCtrlType = col.InputControlType;
            let ctrlEbSid = "ctrl_" + Date.now().toString(36) + visibleCtrlIdx;
            let inpCtrl = new EbObjects[inpCtrlType](ctrlEbSid, col);
            //if (col.Hidden) {
            //    //inpCtrl.EbSid_CtxId = ctrlEbSid;
            //    //inpCtrl.__rowid = rowid;
            //    //inpCtrl.__Col = col;
            //    continue;
            //}
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
        //}.bind(this));
        this.S_cogsTdHtml = this.getCogsTdHtml(isAnyColEditable);
        tr += this.S_cogsTdHtml;
        return tr;
    };

    this.getTdHtml = function (inpCtrl, col, i) {
        return `<td id ='td_@ebsid@' ctrltdidx='${i}' tdcoltype='${col.ObjType}' agg='${col.IsAggragate}' colname='${col.Name}' style='width:${this.getTdWidth(i, col)}'>
                    <div id='@ebsid@Wraper' class='ctrl-cover' eb-readonly='@isReadonly@' @singleselect@>${col.DBareHtml || inpCtrl.BareControlHtml}</div>
                    <div class='tdtxt' coltype='${col.ObjType}'><span></span></div>                        
                </td>`
            .replace("@isReadonly@", col.IsDisable)
            .replace("@singleselect@", col.MultiSelect ? "" : `singleselect=${!col.MultiSelect}`)
            .replace(/@ebsid@/g, inpCtrl.EbSid_CtxId);
    };

    this.getCogsTdHtml = function (isAnyColEditable) {
        return `@cogs@
                </tr>`
            .replace("@cogs@", !this.ctrl.IsDisable ? `
                <td class='ctrlstd' mode='${this.mode_s}' style='width:50px;'>
                    @editBtn@
                    <button type='button' class='check-row rowc'><span class='fa fa-check'></span></button>
                    <button type='button' class='cancel-row rowc'><span class='fa fa-times'></span></button>
                    <button type='button' class='del-row rowc @del-c@'><span class='fa fa-trash'></span></button>
                </td>` : "")
            .replace("@editBtn@", isAnyColEditable ? "<button type='button' class='edit-row rowc'><span class='fa fa-pencil'></span></button>" : "")
            .replace("@del-c@", !isAnyColEditable ? "del-c" : "");
    };

    this.getTdWidth = function (i, col) {
        return (i === 0 ? col.Width + 0.1 : col.Width) + "%";
    };

    this.getAggTrHTML = function () {
        let tr = `<tr class='dgtr' agg='true' tabindex='0'>
                    <td class='row-no-td'></td>`;
        $.each(this.ctrl.Controls.$values, function (i, col) {
            if (col.Hidden)
                return true;
            tr += `<td id ='td_@ebsid@' ctrltdidx='${i}' colname='${col.Name}' style='width:${this.getTdWidth(i, col)}'>
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
        let editModeData = opt.editModeData;
        rowId = rowId || --this.newRowCounter;
        let tr = this.getNewTrHTML(rowId, isAdded);
        let $tr = $(tr).hide();
        this.addRowDataModel(rowId, this.objectMODEL[rowId]);
        if (insertIdx) {
            this.insertRowAt(insertIdx, $tr);
        } else {
            if (!this.ctrl.AscendingOrder) {
                if (isAddBeforeLast && $(`#${this.TableId}>tbody>tr:first`).length > 0) {
                    $tr.insertBefore($(`#${this.TableId}>tbody>tr:eq(1)`));
                }
                else
                    $(`#${this.TableId}>tbody`).prepend($tr);
            }
            else {
                if (isAddBeforeLast && $(`#${this.TableId}>tbody>tr:last`).length > 0) {
                    $tr.insertBefore($(`#${this.TableId}>tbody>tr:last`));
                }
                else
                    $(`#${this.TableId}>tbody`).append($tr);
            }
        }
        if (!this.ctrl.AscendingOrder)
            this.UpdateSlNo();
        $tr.show(300);
        this.setCurRow(rowId);
        let rowCtrls = this.initRowCtrls(rowId, editModeData);

        this.changeEditFlagInRowCtrls(true, rowId);

        this.bindReq_Vali_UniqRow($tr);
        this.updateAggCols();
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

        for (let i = 0, j = 1; i < this.DataMODEL.length; i++) {
            let row = this.DataMODEL[i];
            let eb_row_num = getObjByval(row.Columns, "Name", "eb_row_num");
            if (eb_row_num.Value > 0)
                eb_row_num.Value = j++;
        }
    };

    this.addSlNo = function () {
        let slnoTrHtml = `<tr><td class='row-no-td' idx='${++this.rowSLCounter}'>${this.rowSLCounter}</td></tr>`;
        $(`${this.SlTableId}>tbody`).append(slnoTrHtml);
    }.bind(this);

    this.addAggragateRow = function () {
        let tr = this.getAggTrHTML();
        let $tr = $(tr);
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
            this.bindDGUniqueCheck(ctrl);//DB check
        }
        if (ctrl.Validators.$values.length > 0)
            this.bindValidators($ctrl, ctrl);
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
                ctrl.addInvalidStyle("This field is unique, try another value");
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

    //this.addInvalidStyle = function (ctrl, msg, type) {
    //    EbMakeInvalid(`#td_${ctrl.EbSid_CtxId}`, `.ctrl-cover`, msg, type);
    //};

    this.removeInvalidStyle = function (ctrl) {
        EbMakeValid(`#td_${ctrl.EbSid_CtxId}`, `.ctrl-cover`);
    };

    this.setDataInRow = function (SingleRow, rowid, CurRowCtrls) {

        $.each(SingleRow.Columns, function (j, SingleColumn) {// loop through column controls
            if (j === 0)// to skip id column
                return true;
            let ctrl = getObjByval(CurRowCtrls, "Name", SingleColumn.Name);// get control if SingleRow.Columns contains data of it

            if (ctrl === undefined) {
                $.each(CurRowCtrls, function (i, obj) {
                    if (obj.ObjType === "DGUserControlColumn") {
                        let innerCtrl = getObjByval(obj.Columns.$values, "Name", SingleColumn.Name);
                        if (innerCtrl) {
                            let val = SingleColumn.Value;
                            if (obj.__DGUCC.AllCtrlValues[rowid] === undefined)
                                obj.__DGUCC.AllCtrlValues[rowid] = {};
                            obj.__DGUCC.AllCtrlValues[rowid][innerCtrl.EbSid] = val;
                        }
                    }
                }.bind(this));
            }

            if (!ctrl) {// to alert if no ctrl for such data
                if (SingleColumn.Name !== "eb_row_num")
                    console.warn(" no ctrl for such data");
                return true;
            }


            let val = SingleColumn.Value;
            ctrl.__eb_EditMode_val = val;
            if (val === null)
                return true;

            if (ctrl.ObjType === "PowerSelect") {
                //ctrl.setDisplayMember = EBPSSetDisplayMember;///////////
                if (val)
                    ctrl.setDisplayMember(val);
            }
            else
                ctrl.setValue(val);

        }.bind(this));
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
        let t0 = performance.now();
        let $tr = this.$table.find(`[rowid=${rowid}]`);
        let tds = $tr.find("td[ctrltdidx]");
        for (var i = 0; i < tds.length; i++) {
            //setTimeout(function (tds, i) {//============
            this.ctrlToSpan_td($(tds[i]));
            //}.bind(this, tds, i), 0);
        }
        console.dev_log("ctrlToSpan_row : took " + (performance.now() - t0) + " milliseconds.");
    }.bind(this);

    this.getCtrlByTd = function ($td) {
        let rowid = $td.closest("tr").attr("rowid");
        let ctrlTdIdx = $td.attr("ctrltdidx");
        return this.objectMODEL[rowid][ctrlTdIdx];
    };

    this.ctrlToSpan_td = function ($td, flag) {
        let t0 = performance.now();
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
            $td.find(".tdtxt span").append(`<img class='sysctrl_usrimg' src='/images/dp/${usid}.png' alt='' onerror=this.onerror=null;this.src='/images/nulldp.png';>`);
            $td.find(".tdtxt span").append(`<span class='sysctrl_usrname'>${val}</span>`);

        }
        else if (ctrl.ObjType === "UserSelect") {
            let val = ctrl.getDisplayMemberFromDOM() || ctrl.getValue();
            $td.find(".tdtxt span").empty();
            $td.find(".tdtxt span").append(`<img class='ulstc-disp-img-c' src='/images/dp/${val['img']}.png' alt='' onerror=this.onerror=null;this.src='/images/nulldp.png';>`);
            $td.find(".tdtxt span").append(`<span class='ulstc-disp-txt' > ${val['dm1']}</span>`);
        }
        else if (ctrl.ObjType === "Numeric") {
            let val = ctrl.getDisplayMemberFromDOM() || "0.00";// temporary fix
            $td.find(".tdtxt span").text(val);
        }
        else {
            //let t0 = performance.now();
            let val = ctrl.getDisplayMemberFromDOM() || ctrl.getValue();
            $td.find(".tdtxt span").text(val);
            //console.dev_log("ctrlToSpan_td else: took " + (performance.now() - t0) + " milliseconds.");
        }
        if (!flag)
            $td.find(".tdtxt").show();
        console.dev_log("ctrlToSpan_td " + (performance.now() - t0) + " milliseconds.");
    }.bind(this);

    ebUpdateDGTD = function ($td) {
        this.ctrlToSpan_td($td, true);
    }.bind(this);

    this.RowRequired_valid_Check = function (rowid = this.curRowId) {//////
        let required_valid_flag = true;
        let $notOk1stCtrl = null;
        let $tr = this.get$RowByRowId(rowid);
        if (!((this.Mode.isEdit || this.cloneMode) && $tr.attr('is-initialised') !== 'true')) {
            $.each(this.objectMODEL[rowid], function (i, Col) {
                let $ctrl = $("#" + Col.EbSid_CtxId);
                if (!this.isRequiredOK(Col)) {
                    required_valid_flag = false;
                    if (!$notOk1stCtrl)
                        $notOk1stCtrl = $ctrl;
                }
            }.bind(this));
        }

        if ($notOk1stCtrl) {
            setTimeout(function () {
                $notOk1stCtrl.select();
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
            console.log(i);
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
        let $tr = $td.closest("tr");
        let rowid = $tr.attr("rowid");
        this.setOldVals2RowDOMobjs();
        this.updateAggCols(false);
        let td = $td[0];
        this.checkRow_click({ target: td }, true, true);
        //this.lastEditedRowDMvalues = {};
    }.bind(this);

    this.setOldVals2RowDOMobjs = function () {
        let Names = Object.keys(this.curRowObjectMODEL);
        for (let i = 0; i < Names.length; i++) {
            let name = Names[i];
            let inpCtrl = this.curRowObjectMODEL[name];
            let OldVal = inpCtrl.DataVals.Value;
            //let OldDMVal = this.lastEditedRowDMvalues[name];
            if (!(inpCtrl.ObjType === "PowerSelect" && OldVal === "") && OldVal !== inpCtrl.getValueFromDOM())
                inpCtrl.setValue(OldVal);
            //    if (ctrl.ObjType === "PowerSelect" && OldDMVal)
            //        ctrl.initializer.Vobj.displayMembers_cpy = OldDMVal;
        }
    };

    this.addRowBtn_click = function () {
        let $curentRow = $(`[ebsid='${this.ctrl.EbSid}'] [rowid='${this.curRowId}']`);//fresh row. ':last' to handle dynamic addrow()(delayed check if row contains PoweSelect)
        if ($curentRow.length === 0 || $curentRow.attr("is-editing") === "false")// for editmode first click
            this.tryAddRow();
        else {
            let td = $curentRow.find(".ctrlstd")[0];
            this.checkRow_click({ target: td }, true, false);
            //if ($curentRow.length === 1 && $curentRow.attr("is-editing") === "false")
            //    this.tryAddRow();
        }

    }.bind(this);

    this.row_dblclick = function (e) {
        let $activeTr = $(`#${this.TableId}>tbody tr[is-editing="true"]`);
        let rowId = $activeTr.attr("rowid");
        if ($activeTr.length === 1) {
            if (!this.RowRequired_valid_Check(rowId))
                return;

            //let td = $activeTr.find(".ctrlstd")[0];
            //this.checkRow_click({ target: td }, false);
            this.confirmRow(rowId);
        }
        let $e = $(e.target);
        let $tr = $e.closest("tr");
        if (this.isDGEditable()) {
            $tr.find(".edit-row").trigger("click");

            $tr.find(".edit-row").trigger("click");
            setTimeout(function () {
                $e.closest("td").find("[ui-inp]").select();
            }, 310);
        }
    }.bind(this);

    this.confirmRow = function (rowId) {
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
        $(`#${this.TableId}>tbody>[is-editing=true]:first *:input[type!=hidden]:first`).focus();
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

        $(`[ebsid='${this.ctrl.EbSid}'] tr[is-checked='true']`).find(`.edit-row`).show();// show all rows edit button
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
        $(`#${this.TableId}>tbody>[is-editing=true]:first *:input[type!=hidden]:first`).focus();
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

        $(`[ebsid='${this.ctrl.EbSid}'] tr[is-checked='true']`).find(`.edit-row`).show();// show all rows edit button
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
        $(`#${this.TableId}>tbody>[is-editing=true]:first *:input[type!=hidden]:first`).focus();
        //this.onRowPaintFn($tr, "check", e);
        return true;
    }.bind(this);

    this.onRowPaintFn = function ($tr, action, event) {
        if ((this.ctrl.OnRowPaint && this.ctrl.OnRowPaint.Code && this.ctrl.OnRowPaint.Code.trim() !== '')) {
            let FnString = atob(this.ctrl.OnRowPaint.Code);
            DynamicTabPaneGlobals = { DG: this.ctrl, $tr: $tr, action: action, event: event };
            new Function("form", "user", "tr", "action", `event`, FnString).bind(this.ctrl.currentRow, this.ctrl.formObject, this.ctrl.__userObject, $tr[0], action, event)();
        }
    };

    this.setcurRowDataMODELWithNewVals = function (rowId) {
        $.each(this.objectMODEL[rowId], function (i, inpCtrl) {
            if (inpCtrl.DataVals !== undefined) {
                inpCtrl.DataVals.Value = JSON.parse(JSON.stringify(inpCtrl.curRowDataVals.Value));
                inpCtrl.DataVals.D = JSON.parse(JSON.stringify(inpCtrl.curRowDataVals.D));
            }
        }.bind(this));
    };

    this.setcurRowDataMODELWithOldVals = function (rowId) {
        let curRowCtrls = this.objectMODEL[rowId];
        for (let i = 0; i < curRowCtrls.length; i++) {
            let inpCtrl = curRowCtrls[i];
            if (inpCtrl.DataVals !== undefined) {
                inpCtrl.curRowDataVals.Value = JSON.parse(JSON.stringify(inpCtrl.DataVals.Value));
                inpCtrl.curRowDataVals.D = JSON.parse(JSON.stringify(inpCtrl.DataVals.D));
            }
        }
    };

    //this.updateAggCols = function (rowId) {
    //    $.each(this.objectMODEL[rowId], function (i, inpctrl) {
    //        if (inpctrl.IsAggragate) {
    //            let colname = inpctrl.Name;
    //            $(`#${this.TableId}_footer tbody tr [colname='${colname}'] .tdtxt-agg span`).text(this.getAggOfCol(colname));
    //        }
    //    }.bind(this));

    //};

    this.updateAggCols = function (updateDpnt) {
        $.each(this.ctrl.Controls.$values, function (i, col) {
            if (col.IsAggragate) {
                let colname = col.Name;
                $(`#${this.TableId}_footer tbody tr [colname='${colname}'] .tdtxt-agg span`).text(this.getAggOfCol(colname, updateDpnt));
            }
        }.bind(this));

    };

    this.updateAggCol = function (e) {
        setTimeout(function () {// need to change=====================================================================================
            let $td = $(e.target).closest("td");
            let colname = $td.attr("colname");
            $(`#${this.TableId}_footer tbody tr [colname='${colname}'] .tdtxt-agg span`).text(this.getAggOfCol(colname));
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
            if (document.getElementById(inpCtrl.EbSid_CtxId) === document.activeElement)
                val = document.activeElement.value;
            else {
                if (inpCtrl.__isEditing)
                    val = inpCtrl.curRowDataVals.Value || 0;
                else
                    val = inpCtrl.DataVals.Value || 0;
            }
            sum += parseFloat(val) || 0;
            sum = parseFloat(sum.toFixed(this.ctrl.__userObject.decimalLength));
        }

        this.ctrl[colname + "_sum"] = sum;
        if (updateDpnt)
            this.updateDepCtrl(getObjByval(this.ctrl.Controls.$values, "Name", colname));
        return this.appendDecZeros(sum);
    };

    this.sumOfCol = function (colName) {
        return parseFloat(this.getAggOfCol(colName));
    };



    this.appendDecZeros = function (num) {
        let decCharector = ".";
        let decLength = 2;
        let neededNo = decLength;
        num = num + "";
        if (num.includes(decCharector)) {
            let numA = num.split(decCharector);
            let decStr = numA[1].substr(0, decLength);
            neededNo = decLength - decStr.length;

            num = num + "0".repeat(neededNo);
        }
        else
            num = num + decCharector + "0".repeat(neededNo);
        return num;
    };

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
                alert("error in 'Value Expression' of : " + Col.Name + " - " + e.message);
            }
        }.bind(this));
    };

    this.removeTr = function ($tr) {
        let rowId = $tr.attr("rowid");
        $tr.find("td *").hide(100);
        this.markDelColCtrls(rowId);
        setTimeout(function () {
            $tr.remove();
            this.updateAggCols();
        }.bind(this), 101);
    };

    this.delRow_click = function (e) {
        $tr = $(e.target).closest("tr");
        let rowid = $tr.attr("rowid");
        let rowDataModel = getObjByval(this.DataMODEL, "RowId", rowid);
        if ($tr.attr("is-added") === "false")
            rowDataModel.IsDelete = true;
        else {
            let index = this.DataMODEL.indexOf(rowDataModel);
            if (index > -1)
                this.DataMODEL.splice(index, 1);
        }
        this.setCurRow(rowid);
        this.onRowPaintFn($tr, "delete", e);

        this.removeTr($tr);
        this.resetRowSlNoUnder($tr);

    }.bind(this);

    this.UpdateSlNo = function () {
        let $rows = $(`#${this.TableId}>tbody>tr`);
        for (let i = 0; i < $rows.length; i++) {
            let $row = $($rows[i]);
            let SlNo = i + 1;
            $row.find("td.row-no-td").attr("idx", SlNo).text(SlNo);
        }
    };

    this.resetRowSlNoUnder = function ($tr) {
        let curIdx = parseInt($tr.find(".row-no-td").attr("idx"));
        let rowCount = $(`#${this.TableId}>tbody>tr`).length - 1;
        this.rowSLCounter = curIdx;
        for (this.rowSLCounter; this.rowSLCounter < rowCount + 1; this.rowSLCounter++) {
            $(`#${this.TableId}>tbody>tr td.row-no-td[idx=${this.rowSLCounter + 1}]`).attr("idx", this.rowSLCounter).text(this.rowSLCounter);
        }
        this.rowSLCounter--;
    };

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
        let ctrl = this.getCtrlByTd($td);
        let oldVal = ctrl.getValue();
        $td.attr("edited", "true");
        $td.find(".tdtxt").hide(300);
        $td.find(".ctrl-cover").show(300);
    }.bind(this);

    this.isDGEditable = function () {
        return (this.Mode.isEdit || this.Mode.isNew);
    };

    this.dg_rowKeydown = function (e) {
        let $e = $(e.target);
        let $tr = $e.closest("tr");
        if (e.which === 40)//down arrow
            $e.next().focus();
        if (e.which === 38)//up arrow
            $e.prev().focus();
        if (e.which === 27) {//esc
            if (this.isDGEditable() && $tr.find(".cancel-row").css("display") !== "none")
                $tr.find(".cancel-row").trigger("click");
        }
        //alt + enter
        if ((event.altKey || event.metaKey) && event.which === 13) {
            if (this.$table.has(document.activeElement).length === 1) {
                document.activeElement.blur();
                this.addRowBtn_click();
            }
        }
    }.bind(this);

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
    this.resetRowSlNo = function (slno) {
        let rowCount = $(`#${this.TableId}>tbody>tr`).length;
        for (let i = slno; i < rowCount; i++) {
            $(`#${this.TableId}>tbody>tr td.row-no-td:eq(${i})`).attr("idx", i + 1).text(i + 1);
        }
    };

    this.ColGetvalueFn = function (p1) {
        return $('[ebsid=' + this.__DG.EbSid + ']').find(`tr[is-editing=true] [colname=${this.Name}] [ui-inp]`).val();
    };

    this.ColSetvalueFn = function (p1) {
        return $('[ebsid=' + this.__DG.EbSid + ']').find(`tr[is-editing=true] [colname=${this.Name}] [ui-inp]`).val();
    };

    this.EnableFn = function (p1) {
        return $('[ebsid=' + this.__DG.EbSid + ']').find(`tr[is-editing=true] [colname=${this.Name}] .ctrl-cover *`).prop('disabled', false).css('pointer-events', 'inherit').find('input').css('background-color', '#fff');
    };

    this.DisableFn = function (p1) {
        return $('[ebsid=' + this.__DG.EbSid + ']').find(`tr[is-editing=true] [colname=${this.Name}] .ctrl-cover *`).attr('disabled', 'disabled').css('pointer-events', 'none').find('input').css('background-color', '#eee');
    };

    this.clearDG = function (isAddrow = true) {
        $(`#${this.TableId}>tbody>tr`).each(function (i, e) {
            //$(e).trigger("click");
            this.delRow_click({ target: e });
        }.bind(this));
        $(`#${this.TableId}>tbody>.dgtr`).remove();
        this.resetBuffers();
        //if (!this.ctrl.IsDisable && isAddrow)
        //    this.addRow();
    };

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
            inpCtrl.disable();
        }.bind(this));
    };

    this.enableRow = function (rowId) {
        let $tr = this.get$RowByRowId(rowId);
        $tr.find(".ctrlstd").removeAttr('mode').removeAttr('title');
        $.each(this.objectMODEL[rowId], function (i, inpCtrl) {
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
    };

    this.disable = function () {
        $(`#${this.TableId}`).attr("is-disabled", "true");
        this.$gridCont.attr("is-disabled", "true");
        if ($(`#${this.TableId}>tbody>tr.dgtr:last`).attr("is-editing") === "true")
            $(`#${this.TableId}>tbody>tr.dgtr:last`).hide(300);
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
        this.ctrl.addRow = this.AddRowWithData.bind(this);
        this.ctrl.clear = this.clearDG.bind(this);

        this.ctrl.updateRowByRowId = this.updateRowByRowId.bind(this);
        this.ctrl.updateRowByRowIndex = this.updateRowByRowIndex.bind(this);
        this.ctrl.updateRowBySlno = this.updateRowBySlno.bind(this);

        this.ctrl.disableRow = this.disableRow.bind(this);
        this.ctrl.enableRow = this.enableRow.bind(this);

        this.ctrl.disable = this.disable.bind(this);
        this.ctrl.enable = this.enable.bind(this);

        this.ctrl.showRow = this.showRow.bind(this);//  + showRows
        this.ctrl.hideRow = this.hideRow.bind(this);
        this.ctrl.hideRows = this.hideRows.bind(this);

        this.ctrl.getRowBySlno = this.getRowBySlno.bind(this);
    };

    this.makeColsResizable = function () {
        $(`#${this.TableId}_head .ebResizable`).resizable({
            handles: 'e',
            resize: function (event, ui) {
                let $curTd = ui.element;
                let tdWidth = $curTd.outerWidth();
                let $bodyTbl = $curTd.closest(".grid-cont").closestInner(".Dg_body");
                let $footerTbl = $curTd.closest(".grid-cont").closestInner(".grid-cont>.Dg_footer");

                $bodyTbl.find(`td[colname=${$curTd.attr("name")}]:first`).outerWidth(tdWidth);
                $footerTbl.find(`td[colname=${$curTd.attr("name")}]:first`).outerWidth(tdWidth);

                getObjByval(this.ctrl.Controls.$values, "Name", $curTd.attr("name")).Width = (tdWidth / $bodyTbl.outerWidth()) * 100;
                //getObjByval(this.ctrl.Controls.$values, "Name", $curTd.attr("name")).Width = tdWidth;
            }.bind(this)
        });
    };

    this.setSuggestionVals = function () {
        //if (!this.formRenderer.isInitNCs)
        //    return;
        let paramsColl__ = this.getParamsColl();
        let paramsColl = paramsColl__[0];
        let lastCtrlName = paramsColl__[1];
        let isFull = paramsColl__[2];

        if (isFull)
            this.refreshDG(paramsColl, lastCtrlName);
        else
            this.clearDG(false);
    }.bind(this);

    this.ctrl.__setSuggestionVals = this.setSuggestionVals;

    this.getParamsColl = function () {
        let dependantCtrls = this.ctrl.Eb__paramControls.$values;
        let isFull = true;
        let params = [];
        let lastCtrlName;
        $.each(dependantCtrls, function (i, ctrlName) {
            let ctrl = this.ctrl.formObject[ctrlName];
            let val = ctrl.getValue();
            let obj = { Name: ctrlName, Value: val };
            //let obj = { Name: ctrlName, Value: "2026" };
            lastCtrlName = ctrlName;
            params.push(obj);
            if (isFull && ctrl.isEmpty())
                isFull = false;
        }.bind(this));
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
            //url: this.ssurl + "/bots",
            url: "/WebForm/ImportFormData",
            data: {
                _refid: this.formRefId,
                _rowid: this.formRenderer.rowId,
                _triggerctrl: lastCtrlName,
                _params: paramsColl
            },
            error: function (xhr, ajaxOptions, thrownError) {
                this.hideLoader();
                EbMessage("show", { Message: `Couldn't Update ${this.ctrl.Label}, Something Unexpected Occurred`, AutoHide: true, Background: '#aa0000' });
            }.bind(this),
            //beforeSend: function (xhr) {
            //    xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
            //}.bind(this),
            success: this.reloadDG.bind(this)
        });

    }.bind(this);

    this.reloadDG = function (_respObjStr) {// need cleanup
        this.hideLoader();
        let _respObj = JSON.parse(_respObjStr);
        console.log(_respObj);
        if (_respObj.Status !== 200) {
            console.error('Data not loaded : ' + _respObj.Message);
            ebcontext._formLastResponse = _respObj;
            return;
        }
        let dataModel = _respObj.FormData.MultipleTables[this.ctrl.TableName];

        $(`#${this.TableId}>tbody>.dgtr`).remove();
        //$(`#${this.TableId}_head th`).not(".slno,.ctrlth").remove();
        this.setEditModeRows(dataModel);
    };

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
        //this.lastEditedRowDMvalues = {};
        this.ctrl.currentRow.isEmpty = this.isCurRowEmpty;
        this.ctrl.RowRequired_valid_Check = this.RowRequired_valid_Check;
        this.ctrl.sum = this.sumOfCol;
        this.ctrl.getRowByIndex = this.getRowByIndex;
        this.isAggragateInDG = false;
        this.isPSInDG = false;
        this.S_cogsTdHtml = "";
        this.rowSLCounter = 0;
        this.$addRowBtn = $(`#${this.ctrl.EbSid}Wraper .addrow-btn`);
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
        }.bind(this));

        if (this.ctrl.IsColumnsResizable)
            this.makeColsResizable();

        this.addUtilityFnsForUDF();
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
        this.$table.on("click", ".check-row", this.checkRow_click_New);
        this.$table.on("click", ".cancel-row", this.cancelRow_click);
        this.$table.on("click", ".del-row", this.delRow_click);
        this.$table.on("click", ".edit-row", this.editRow_click);
        this.$table.on("keydown", ".dgtr", this.dg_rowKeydown);
        this.$table.on("dblclick", ".tdtxt", this.row_dblclick);

        $(`#${this.ctrl.EbSid}Wraper .Dg_Hscroll`).on("scroll", this.dg_HScroll);
        $(`#${this.ctrl.EbSid}Wraper .DgHead_Hscroll`).on("scroll", this.dg_HScroll);
        $(`#${this.ctrl.EbSid}Wraper .Dg_footer`).on("scroll", this.dg_HScroll);
        $(`#${this.ctrl.EbSid}Wraper .dg-body-vscroll`).on("scroll", this.dg_HScroll);
        $.contextMenu(this.CtxSettingsObj);
    };

    this.ctxBuildFn = function ($trigger, e) {
        return {
            items: {
                "deleteRow": {
                    name: "Delete row",
                    icon: "fa-trash",
                    callback: this.del
                },
                "insertRowBelow": {
                    name: "Insert row below",
                    icon: "fa-trash",
                    callback: this.insertRowBelow

                },
                //"insertRowAbove": {
                //    name: "Insert row above",
                //    icon: "fa-trash",
                //    callback: this.insertRowAbove

                //}
            }
        };
    }.bind(this);

    this.CtxSettingsObj = {
        selector: '[eb-form="true"][mode="edit"] .dgtr .tdtxt,[eb-form="true"][mode="new"] .dgtr .tdtxt',
        autoHide: true,
        build: this.ctxBuildFn.bind(this)
    };

    this.insertRowBelow = function (eType, selector, action, originalEvent) {
        let $activeRow = $(`#${this.TableId} tbody tr[is-editing="true"]`);
        if ($activeRow.length === 1) {
            if (this.RowRequired_valid_Check($activeRow.attr("rowid"))); {
                let td = $activeRow.find('td:last')[0];
                this.checkRow_click({ target: td }, false, false);
            }
        }
        let $e = selector.$trigger;
        let $tr = $e.closest("tr");
        this.addRow({ insertIdx: $tr.index() + 1 });
    }.bind(this);

    this.del = function (eType, selector, action, originalEvent) {
        let $e = selector.$trigger;
        let $tr = $e.closest("tr");
        $tr.find(".del-row").trigger("click");
    }.bind(this);

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

    this.preInit = function () {
        if (this.ctrl.DataSourceId) {
            if (this.Mode.isNew || (this.IsLoadDataSourceInEditMode && (this.Mode.isEdit || this.Mode.isView))) {
                this.isDataImport = true;
                this.setSuggestionVals();
            }
        }
        this.init();
    }.bind(this);

    this.preInit();
};