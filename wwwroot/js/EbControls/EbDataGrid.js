const EbDataGrid = function (ctrl, options) {
    this.ctrl = ctrl;
    this.ctrl.formObject = options.formObject;
    this.ctrl.__userObject = options.userObject;
    this.initControls = new InitControls(this);
    this.Mode = options.Mode;
    this.TableId = `tbl_${this.ctrl.EbSid_CtxId}`;
    this.$table = $(`#${this.TableId}`);

    this.mode_s = "";
    if (this.Mode.isEdit)
        this.mode_s = "edit";
    else if (this.Mode.isNew)
        this.mode_s = "new";
    else if (this.Mode.isView)
        this.mode_s = "view";

    this.resetBuffers = function () {
        this.rowCtrls = {};
        this.newRowCounter = 0;
    }.bind(this);
    this.resetBuffers();


    ctrl.setEditModeRows = function (SingleTable) {/////////// need change
        return this.setEditModeRows(SingleTable);
    }.bind(this);

    ctrl.ChangedRowObject = function () {
        return this.changedRowWT();
    }.bind(this);

    ctrl.isValid = function () {
        return this.isValid() && this.isFinished();
    }.bind(this);

    this.isFinished = function () {
        let isEditing = false;
        $.each(this.rowCtrls, function (rowId, inpCtrls) {
            if ($(`#${this.TableId} tbody tr[rowid=${rowId}]`).attr("is-editing") === "true") {
                isEditing = true;
                EbMessage("show", { Message: "Finish DataGrid editing before Saving", Background: "#ee7700" });
            }
        }.bind(this));
        return !isEditing;
    };

    this.setEditModeRows = function (SingleTable) {
        this.addEditModeRows(SingleTable);
        this.tryAddRow();
    };

    this.tryAddRow = function () {
        if ((this.Mode.isEdit || this.Mode.isNew) && this.ctrl.IsAddable)
            this.addRow();
        if (this.Mode.isEdit)
            $(`.ctrlstd[mode] `).attr("mode", "edit");
        if (this.Mode.isNew)
            $(`.ctrlstd[mode] `).attr("mode", "new");
    };

    this.SwitchToEditMode = function () {
        this.tryAddRow();

    };

    this.addEditModeRows = function (SingleTable) {
        $(`#${this.TableId} tbody`).empty();
        this.resetBuffers();
        $.each(SingleTable, function (i, SingleRow) {
            let rowid = SingleRow.RowId;
            this.addRow(rowid, false);
            $.each(SingleRow.Columns, function (j, SingleColumn) {
                if (j === 0)// to skip id column
                    return true;
                let ctrl = this.rowCtrls[rowid][(j - 1)];
                let val = SingleColumn.Value;
                console.log(val);
                ctrl.setValue(val);
                ctrl.Name = SingleColumn.Name;
            }.bind(this));
            {// call checkRow_click() pass event.target directly
                let td = $(`#${this.TableId} tbody tr[rowid=${rowid}] td:last`)[0];
                this.checkRow_click({ target: td });
            }
        }.bind(this));
    };

    this.getRowWTs = function (rowId, inpCtrls) {
        let SingleRow = {};
        SingleRow.RowId = rowId;
        SingleRow.IsUpdate = (rowId !== 0);
        SingleRow.Columns = [];
        $.each(inpCtrls, function (i, obj) {
            if (!obj.DoNotPersist)
                SingleRow.Columns.push(getSingleColumn(obj));
        }.bind(this));
        return SingleRow;
    };

    this.changedRowWT = function () {
        let SingleTable = [];
        //            [
        //              { RowId: 1,
        //                IsUpdate: true,
        //                Columns:[{ name: 1, val: 100 }, { name: 10, val: 100 }, { name: 10, val: 100 }, { name: 10, val: 100 }, { name: 10, val: 100 },]
        //              },
        //              {
        //                RowId: 0,
        //                IsUpdate: false,
        //                Columns:[{ name: 1, val: 100 }, { name: 10, val: 100 }, { name: 10, val: 100 }, { name: 10, val: 100 }, { name: 10, val: 100 },]
        //              },
        //              {
        //                RowId: 0,
        //                IsUpdate: false,
        //                Columns:[{ name: 1, val: 100 }, { name: 10, val: 100 }, { name: 10, val: 100 }, { name: 10, val: 100 }, { name: 10, val: 100 },]
        //              },
        //            ]
        $.each(this.rowCtrls, function (rowId, inpCtrls) {
            if ($(`#${this.TableId} tbody tr[rowid=${rowId}]`).attr("is-checked") === "true")
                SingleTable.push(this.getRowWTs(rowId, inpCtrls));
        }.bind(this));
        console.log(SingleTable);
        return SingleTable;
    };

    this.getNewTrHTML = function (rowid, isAdded = true) {
        let anyColEditable = false;
        let tr = `<tr class='dgtr' is-editing='${isAdded}' is-checked='false' is-added='${isAdded}' tabindex='0' rowid='${rowid}'>`;
        this.rowCtrls[rowid] = [];
        $.each(this.ctrl.Controls.$values, function (i, col) {
            if (col.Hidden)
                return true;
            let inpCtrlType = col.InputControlType;
            editBtn = "";
            let ctrlEbSid = "ctrl_" + (Date.now() + i).toString(36);
            let inpCtrl = new EbObjects[inpCtrlType](ctrlEbSid, col);
            inpCtrl.EbDbType = col.EbDbType;
            inpCtrl.EbSid_CtxId = ctrlEbSid;
            //inpCtrl.EbSid = ctrlEbSid;
            inpCtrl.ObjType = inpCtrlType.substr(2);
            inpCtrl = new ControlOps[inpCtrl.ObjType](inpCtrl);
            this.rowCtrls[rowid].push(inpCtrl);
            tr += `<td id ='td_@ebsid@' ctrltdidx='${i}' colname='${inpCtrl.Name}'>
                        <div id='@ebsid@Wraper' class='ctrl-cover'>${col.DBareHtml || inpCtrl.BareControlHtml}</div>
                        <div class='tdtxt' coltype='${col.ObjType}'><span></span></div>                        
                    </td>`.replace(/@ebsid@/g, inpCtrl.EbSid_CtxId);
            if (col.IsEditable)
                anyColEditable = true;

        }.bind(this));
        tr += `<td class='ctrlstd' mode='${this.mode_s}'>
                    @editBtn@
                    <span class='check-row rowc' tabindex='1'><span class='fa fa-plus'></span></span>
                    <span class='del-row rowc @del-c@' tabindex='1'><span class='fa fa-minus'></span></span>
                </td></tr>`
            .replace("@editBtn@", anyColEditable ? "<span class='edit-row rowc' tabindex='1'><span class='fa fa-pencil'></span></span>" : "")
            .replace("@del-c@", !anyColEditable ? "del-c" : "");
        return tr;
    };

    this.getAggTrHTML = function () {
        let tr = `<tr class='dgtr' agg='true' tabindex='0'>`;
        $.each(this.ctrl.Controls.$values, function (i, col) {
            if (col.Hidden)
                return true;
            tr += `<td id ='td_@ebsid@' ctrltdidx='${i}' colname='${col.Name}'>
                        <div class='tdtxt-agg' coltype='${col.ObjType}'><span></span></div>                        
                   </td>`;

        }.bind(this));
        tr += `<td></td></tr>`;
        return tr;
    };

    this.addRow = function (rowid, isAdded) {
        rowid = rowid || --this.newRowCounter;
        let tr = this.getNewTrHTML(rowid, isAdded);
        let $tr = $(tr);
        if ($(`#${this.TableId} tbody [agg='true']`).length === 0)
            $(`#${this.TableId} tbody`).append($tr);
        else
            $(`#${this.TableId} tbody tr:last`).prev().after($tr);
        this.bindReq_Vali_UniqRow($tr);
        this.initRowCtrls(rowid);
    }.bind(this);

    this.addAggragateRow = function () {
        let tr = this.getAggTrHTML();
        let $tr = $(tr);
        $(`#${this.TableId} tbody`).append($tr);
    };

    this.bindReq_Vali_UniqRow = function ($tr) {
        let rowid = $tr.attr("rowid");
        $.each(this.rowCtrls[rowid], function (i, Col) {
            this.bindReq_Vali_UniqCtrl(Col);
        }.bind(this));
    };

    this.bindReq_Vali_UniqCtrl = function (Col) {
        let $ctrl = $(`#${Col.EbSid_CtxId}`);
        if (Col.Required)
            this.bindRequired($ctrl, Col);
        if (Col.Unique)
            this.bindUniqueCheck($ctrl, Col);
        if (Col.Validators.$values.length > 0)
            this.bindValidators($ctrl, Col);
    };

    this.bindRequired = function ($ctrl, control) {
        $ctrl.on("blur", this.isRequiredOK.bind(this, control)).on("focus", this.removeInvalidStyle.bind(this, control));
    };

    // checks a control value is emptyString
    this.isRequiredOK = function (ctrl) {
        let $ctrl = $("#" + ctrl.EbSid_CtxId);
        if ($ctrl.length !== 0 && ctrl.Required && !ctrl.isRequiredOK()) {
            this.addInvalidStyle(ctrl);
            return false;
        }
        else {
            this.removeInvalidStyle(ctrl);
            return true;
        }
    };

    this.addInvalidStyle = function (ctrl, msg, type) {
        EbMakeInvalid(`#td_${ctrl.EbSid_CtxId}`, `.ctrl-cover`, msg, type);
    };

    this.removeInvalidStyle = function (ctrl) {
        EbMakeValid(`#td_${ctrl.EbSid_CtxId}`, `.ctrl-cover`);
    };

    this.initRowCtrls = function (rowid) {
        $.each(this.rowCtrls[rowid], function (i, inpCtrl) {
            let opt = {};
            if (inpCtrl.ObjType === "PowerSelect")// || inpCtrl.ObjType === "DGPowerSelectColumn")
                opt.getAllCtrlValuesFn = function () {
                    return [];//getValsFromForm(this.FormObj);
                }.bind(this);
            this.initControls.init(inpCtrl, opt);
        }.bind(this));
    };

    this.getValues = function () {
        this.FVWTObjColl = [];
        $.each(this.rowCtrls, function (rowid, ctrls) {
            let rowObjs = {};
            rowObjs[0] = [];
            $.each(ctrls, function (i, obj) {
                let colObj = {};
                colObj.Name = obj.Name;
                _type = obj.EbDbType;
                colObj.Value = (_type === 7) ? parseInt(obj.getValue()) : obj.getValue();
                colObj.Type = _type;
                colObj.AutoIncrement = obj.AutoIncrement || false;
                rowObjs[0].push(colObj);
            }.bind(this));
            this.FVWTObjColl.push(rowObjs);
        }.bind(this));
    }.bind(this);

    t = this.getValues;

    this.ctrlToSpan_row = function (rowid) {
        let $tr = $(`#${this.TableId}`).find(`[rowid=${rowid}]`);
        $.each($tr.find("td[ctrltdidx]"), function (i, td) {
            this.ctrlToSpan_td($(td));
        }.bind(this));
    }.bind(this);

    this.getCtrlByTd = function ($td) {
        let rowid = $td.closest("tr").attr("rowid");
        let ctrlTdIdx = $td.attr("ctrltdidx");
        return this.rowCtrls[rowid][ctrlTdIdx];
    };

    this.ctrlToSpan_td = function ($td) {
        let ctrl = this.getCtrlByTd($td);
        $td.find(".ctrl-cover").hide();
        let val = ctrl.getDisplayMember() || ctrl.getValue();
        $td.find(".tdtxt span").text(val);
        $td.find(".tdtxt").show();
    }.bind(this);

    this.editRow_click = function (e) {
        $td = $(e.target).closest("td");
        $td.find(".del-row").hide();
        $(`[ebsid='${this.ctrl.EbSid}'] tr[is-checked='true']`).find(`.edit-row`).hide();
        $(`[ebsid='${this.ctrl.EbSid}'] [is-checked='false']`).hide().attr("is-editing", "false");
        $td.find(".check-row").show();
        let $tr = $td.closest("tr");
        $tr.attr("is-editing", "true");
        let rowid = $tr.attr("rowid");
        this.spanToCtrl_row($tr);
    }.bind(this);

    this.AllRequired_valid_Check = function (rowid) {//////
        let required_valid_flag = true;
        let $notOk1stCtrl = null;
        $.each(this.rowCtrls[rowid], function (i, Col) {
            let $ctrl = $("#" + Col.EbSid_CtxId);
            if (!this.isRequiredOK(Col)) {
                required_valid_flag = false;
                if (!$notOk1stCtrl)
                    $notOk1stCtrl = $ctrl;
            }
        }.bind(this));

        if ($notOk1stCtrl)
            $notOk1stCtrl.select();
        return required_valid_flag;
    };

    this.checkRow_click = function (e) {
        $td = $(e.target).closest("td");
        let $tr = $td.closest("tr");
        $tr.attr("mode", "false");
        let rowid = $tr.attr("rowid");
        if (!this.AllRequired_valid_Check(rowid))
            return;
        $td.find(".check-row").hide();
        $td.find(".del-row").show();
        $td.find(".edit-row").show();

        $(`[ebsid='${this.ctrl.EbSid}'] tr[is-checked='true']`).find(`.edit-row`).show();
        $(`[ebsid='${this.ctrl.EbSid}'] [is-checked='false']`).show().attr("is-editing", "true").focus();

        this.ctrlToSpan_row(rowid);
        if ($tr.attr("is-checked") !== "true" && $tr.attr("is-added") === "true")
            this.addRow();
        $tr.attr("is-checked", "true");

        if (this.isAggragateInDG) {
            $.each(this.ctrl.Controls.$values, function (i, col) {
                if (col.IsAggragate)
                    $(`[agg='true'] [colname='${col.Name}'] .tdtxt-agg span`).text(this.getAggOfCol(col));
            }.bind(this));
        }

    }.bind(this);

    this.getAggOfCol = function (col) {
        let sum = 0;
        $.each($(`[colname='${col.Name}'] .tdtxt span`), function (i, span) {
            let val = parseInt($(span).text());
            sum += val || 0;
        }.bind(this));
        return sum;
    };

    this.delRow_click = function (e) {
        $td = $(e.target).closest("td");
        $td.closest("tr").remove();
    }.bind(this);

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
        $td.find(".tdtxt").hide();
        $td.find(".ctrl-cover").show();
    }.bind(this);

    this.dg_rowKeydown = function (e) {
        if (e.which === 40)//down arrow
            $(e.target).next().focus();
        if (e.which === 38)//up arrow
            $(e.target).prev().focus();
    }.bind(this);

    this.init = function () {
        this.tryAddRow();
        this.ctrl.currentRow = [];
        this.isAggragateInDG = false;
        $.each(this.ctrl.Controls.$values, function (i, col) {
            col.__DG = this.ctrl;
            this.ctrl.currentRow[col.Name] = col;

            if (col.IsAggragate)
                this.isAggragateInDG = true;
        }.bind(this));


        this.addAggragateRow();

        this.$table.on("click", ".check-row", this.checkRow_click);
        this.$table.on("click", ".del-row", this.delRow_click);
        this.$table.on("click", ".edit-row", this.editRow_click);
        this.$table.on("keydown", ".dgtr", this.dg_rowKeydown);
    };

    this.init();
};