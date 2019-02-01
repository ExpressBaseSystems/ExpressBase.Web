const EbDataGrid = function (ctrl, options) {
    this.ctrl = ctrl;
    this.initControls = new InitControls(this);
    this.isEditMode = options.isEditMode;
    this.TableId = `tbl_${this.ctrl.EbSid_CtxId}`;
    this.$table = $(`#${this.TableId}`);
    this.resetBuffers = function () {
        this.rowCtrls = {};
        this.newRowCounter = 0;
    }.bind(this);
    this.resetBuffers();


    ctrl.setEditModeRows = function (SingleTable) {
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
        if (this.ctrl.IsAddable)
            this.addRow();
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
        let tr = `<tr class='dgtr' is-added='${isAdded}' tabindex='0' rowid='${rowid}'>`;
        this.rowCtrls[rowid] = [];
        $.each(this.ctrl.Controls.$values, function (i, col) {
            if (col.Hidden)
                return true;
            let inpCtrlType = col.InputControlType;
            editBtn = "";
            let ctrlEbSid = "ctrl_" + (Date.now() + i).toString(36);
            let inpCtrl = new EbObjects[inpCtrlType](ctrlEbSid, col);
            inpCtrl.EbSid_CtxId = ctrlEbSid;
            //inpCtrl.EbSid = ctrlEbSid;
            inpCtrl.ObjType = inpCtrlType.substr(2);
            inpCtrl = new ControlOps[inpCtrl.ObjType](inpCtrl);
            this.rowCtrls[rowid].push(inpCtrl);
            tr += `<td id ='td_@ebsid@' ctrltdidx='${i}'>
                        <div id='@ebsid@Wraper' class='ctrl-cover'>${col.DBareHtml || inpCtrl.BareControlHtml}</div>
                        <div class='tdtxt'><span></span></div>                        
                    </td>`.replace(/@ebsid@/g, inpCtrl.EbSid_CtxId);
            if (col.IsEditable)
                anyColEditable = true;

        }.bind(this));
        tr += `<td>
                    @editBtn@
                    <span class='check-row rowc' tabindex='1'><span class='fa fa-plus'></span></span>
                    <span class='del-row rowc @del-c@' tabindex='1'><span class='fa fa-minus'></span></span>
                </td></tr>`
            .replace("@editBtn@", anyColEditable ? "<span class='edit-row rowc' tabindex='1'><span class='fa fa-pencil'></span></span>" : "")
            .replace("@del-c@", !anyColEditable ? "del-c" : "");
        return tr;
    };

    this.addRow = function (rowid, isAdded) {
        rowid = rowid || --this.newRowCounter;
        let tr = this.getNewTrHTML(rowid, isAdded);
        let $tr = $(tr);
        $(`#${this.TableId} tbody`).append($tr);
        this.bindReq_Vali_UniqRow($tr);
        this.initRowCtrls(rowid);
    }.bind(this);

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
        $td.find(".edit-row").hide();
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
        $tr.attr("is-editing", "false");
        let rowid = $tr.attr("rowid");
        if (!this.AllRequired_valid_Check(rowid))
            return;
        $td.find(".check-row").hide();
        $td.find(".del-row").show();
        $td.find(".edit-row").show();
        this.ctrlToSpan_row(rowid);
        if ($tr.attr("is-checked") !== "true" && $tr.attr("is-added") === "true")
            this.addRow();
        $tr.attr("is-checked", "true");
    }.bind(this);

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
        if (this.ctrl.IsAddable) {
            if (!this.isEditMode)
                this.addRow();
        }
        this.$table.on("click", ".check-row", this.checkRow_click);
        this.$table.on("click", ".del-row", this.delRow_click);
        this.$table.on("click", ".edit-row", this.editRow_click);
        this.$table.on("keydown", ".dgtr", this.dg_rowKeydown);
    };

    this.init();
};