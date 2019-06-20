const EbDataGrid = function (ctrl, options) {
    this.ctrl = ctrl;
    this.FormDataExtdObj = options.FormDataExtdObj;
    this.ctrl.formObject = options.formObject;
    this.formObject_Full = options.formObject_Full;
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
        this.AllRowCtrls = {};
        this.newRowCounter = 0;
        this.rowSLCounter = 0;
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
        $.each(this.AllRowCtrls, function (rowId, inpCtrls) {
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
        this.rowSLCounter = this.rowSLCounter - $(`#${this.TableId} tbody [is-editing=true]`).remove().length;
        $(`#${this.TableId} tbody>tr>.ctrlstd`).attr("mode", "edit");
        this.mode_s = "edit";
        this.tryAddRow();
    };

    this.SwitchToViewMode = function () {
        $(`#${this.TableId} tbody [is-editing=true]`).remove();
        $(`#${this.TableId} tbody>tr>.ctrlstd`).attr("mode", "view");
        this.mode_s = "view";
    };

    //this.j = function (p1) {
    //    let VMs = this.initializer.Vobj.valueMembers;
    //    let DMs = this.initializer.Vobj.displayMembers;
    //    let columnvals = this.initializer.columnvals;

    //    if (VMs.length > 0)// clear if already values there
    //        this.initializer.clearValues();

    //    let valMsArr = p1[0].split(',');
    //    let DMtable = p1[1];


    //    $.each(valMsArr, function (i, vm) {
    //        VMs.push(vm);
    //        $.each(this.DisplayMembers.$values, function (j, dm) {
    //            $.each(DMtable, function (j, r) {
    //                if (getObjByval(r.Columns, 'Name', this.ValueMember.name).Value === vm) {
    //                    let _dm = getObjByval(r.Columns, 'Name', dm.name).Value;
    //                    DMs[dm.name].push(_dm);
    //                }
    //            }.bind(this));
    //        }.bind(this));
    //    }.bind(this));

    //    $.each(DMtable, function (j, r) {
    //        $.each(r.Columns, function (j, item) {
    //            if (!columnvals[item.Name]) {
    //                console.warn('Mismatch found in Colums in datasource and Colums in object');
    //                return true;
    //            }
    //            columnvals[item.Name].push(item.Value);
    //        }.bind(this));
    //    }.bind(this));

    //};

    this.addEditModeRows = function (SingleTable) {
        $(`#${this.TableId} tbody`).empty();
        this.resetBuffers();
        $.each(SingleTable, function (i, SingleRow) {
            let rowid = SingleRow.RowId;
            this.addRow({ rowid: rowid, isAdded: false });
            let CurRowCtrls = this.AllRowCtrls[rowid];
            $.each(SingleRow.Columns, function (j, SingleColumn) {// loop through column controls
                if (j === 0)// to skip id column
                    return true;
                if (j === 3)
                    console.log(j);
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
                    console.warn(" no ctrl for such data");
                    return true;
                }


                let val = SingleColumn.Value;
                if (val === null)
                    return true;

                if (ctrl.ObjType === "PowerSelect") {
                    //ctrl.setDisplayMember = this.j;
                    ctrl.setDisplayMember([val, this.FormDataExtdObj.val[ctrl.EbSid]]);
                }
                else
                    ctrl.setValue(val);

            }.bind(this));
            {
                let td = $(`#${this.TableId} tbody tr[rowid=${rowid}] td:last`)[0];
                // call checkRow_click() pass event.target directly
                setTimeout(function () {
                    this.checkRow_click({ target: td });
                }.bind(this), 1);
            }
        }.bind(this));
    };

    this.getRowWTs = function (rowId, inpCtrls) {
        let SingleRow = {};
        SingleRow.RowId = rowId;
        SingleRow.IsUpdate = (rowId !== 0);
        SingleRow.IsDelete = inpCtrls.IsDelete;
        SingleRow.Columns = [];
        SingleRow.Columns.push({
            Name: "eb_row_num",
            Value: parseInt($(`#${this.TableId} tbody tr[rowid=${rowId}] td.row-no-td`).attr("idx")),
            AutoIncrement: false,
            Type: 7
        });
        $.each(inpCtrls, function (i, obj) {
            if (!obj.DoNotPersist) {
                if (obj.ObjType === "DGUserControlColumn") {
                    $.each(obj.Columns.$values, function (i, ctrl) {
                        SingleRow.Columns.push(getSingleColumn(ctrl));
                    }.bind(this));
                }
                else
                    SingleRow.Columns.push(getSingleColumn(obj));
            }
        }.bind(this));
        return SingleRow;
    };

    this.changedRowWT = function () {
        let SingleTable = [];
        $.each(this.AllRowCtrls, function (rowId, inpCtrls) {
            if (parseInt(rowId) < 0 && $(`#${this.TableId} tbody tr[rowid=${rowId}]`).length === 0)// to skip newly added and then deleted rows
                return true;
            if ($(`#${this.TableId} tbody tr[rowid=${rowId}]`).attr("is-checked") === "true" || /* - if checked*/
                $(`#${this.TableId} tbody tr[rowid=${rowId}]`).length === 0)// to manage deleted row
                SingleTable.push(this.getRowWTs(rowId, inpCtrls));
        }.bind(this));
        console.log(SingleTable);
        return SingleTable;
    };

    this.getType = function (_inpCtrl) {
        let type = _inpCtrl.ObjType;
        if (type === "TextBox")
            type = "String";
        return `EbDG${type}Column`;
    };

    this.initInpCtrl = function (inpCtrl, col, ctrlEbSid, rowid) {
        //inpCtrl.Name = col.Name;
        //inpCtrl.EbDbType = col.EbDbType;
        inpCtrl.EbSid_CtxId = ctrlEbSid;
        inpCtrl.__rowid = rowid;
        inpCtrl.__Col = col;

        if (inpCtrl.ObjType === "DGUserControlColumn") {///////////
            $.each(col.Columns.$values, function (i, _inpCtrl) {
                let _ctrlEbSid = "ctrl_" + (Date.now() + i).toString(36);
                let NewInpCtrl = $.extend({}, new EbObjects[this.getType(_inpCtrl)](_ctrlEbSid, _inpCtrl));
                NewInpCtrl.EbSid_CtxId = _ctrlEbSid;
                inpCtrl.Columns.$values[i] = this.initInpCtrl(NewInpCtrl, col, _ctrlEbSid, rowid);
            }.bind(this));
        }
        else
            inpCtrl.ObjType = col.InputControlType.substr(2);
        return inpCtrl;
    };

    this.attachFns = function (inpCtrl, colType) {
        if (colType === "DGUserControlColumn") {
            $.each(inpCtrl.Columns.$values, function (i, col) {
                inpCtrl.Columns.$values[i] = this.attachFns(col, col.ObjType);
            }.bind(this));
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
        this.AllRowCtrls[rowid] = [];

        $.each(this.ctrl.Controls.$values, function (i, col) {
            if (col.Hidden)
                return true;
            let inpCtrlType = col.InputControlType;
            let ctrlEbSid = "ctrl_" + (Date.now() + i).toString(36);
            let inpCtrl = new EbObjects[inpCtrlType](ctrlEbSid, col);
            if (inpCtrlType === "EbUserControl")
                this.manageUCObj(inpCtrl, col);
            this.initInpCtrl(inpCtrl, col, ctrlEbSid, rowid);
            inpCtrl = this.attachFns(inpCtrl, col.ObjType);
            this.AllRowCtrls[rowid].push(inpCtrl);

            tr += this.getTdHtml(inpCtrl, col, i);
            if (col.IsEditable)
                isAnyColEditable = true;
        }.bind(this));
        this.S_cogsTdHtml = this.getCogsTdHtml(isAnyColEditable);
        tr += this.S_cogsTdHtml;
        return tr;
    };

    this.getTdHtml = function (inpCtrl, col, i) {
        return `<td id ='td_@ebsid@' ctrltdidx='${i}' tdcoltype='${col.ObjType}' colname='${col.Name}' style='width:${this.getTdWidth(i, col)}'>
                    <div id='@ebsid@Wraper' class='ctrl-cover'>${col.DBareHtml || inpCtrl.BareControlHtml}</div>
                    <div class='tdtxt' coltype='${col.ObjType}'><span></span></div>                        
                </td>`.replace(/@ebsid@/g, inpCtrl.EbSid_CtxId);
    };

    this.getCogsTdHtml = function (isAnyColEditable) {
        return `@cogs@
                </tr>`
            .replace("@cogs@", !this.ctrl.IsDisable ? `
                <td class='ctrlstd' mode='${this.mode_s}' style='width:50px;'>
                    @editBtn@
                    <button type='button' class='check-row rowc'><span class='fa fa-check'></span></button>
                    <button type='button' class='del-row rowc @del-c@'><span class='fa fa-minus'></span></button>
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

    this.addRow = function (opt = {}) {
        let rowid = opt.rowid;
        let isAdded = opt.isAdded;
        let isAddBeforeLast = opt.isAddBeforeLast;
        rowid = rowid || --this.newRowCounter;
        let tr = this.getNewTrHTML(rowid, isAdded);
        let $tr = $(tr).hide();
        if (isAddBeforeLast && $(`#${this.TableId}>tbody>tr:last`).length > 0) {
            $tr.insertBefore($(`#${this.TableId}>tbody>tr:last`));
        }
        else
            $(`#${this.TableId}>tbody`).append($tr);
        $tr.show(300);
        this.bindReq_Vali_UniqRow($tr);
        this.setCurRow(rowid);
        this.updateAggCols(rowid);
        return [$tr, this.initRowCtrls(rowid)];

    }.bind(this);

    this.addAggragateRow = function () {
        let tr = this.getAggTrHTML();
        let $tr = $(tr);
        $(`#${this.TableId}_footer>tbody`).append($tr);
    };

    this.bindReq_Vali_UniqRow = function ($tr) {
        let rowid = $tr.attr("rowid");
        $.each(this.AllRowCtrls[rowid], function (i, Col) {
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
        $.each(this.AllRowCtrls[rowid], function (i, inpCtrl) {
            let opt = {};
            if (inpCtrl.ObjType === "PowerSelect")// || inpCtrl.ObjType === "DGPowerSelectColumn")
                opt.getAllCtrlValuesFn = this.getFormVals;
            else if (inpCtrl.ObjType === "Date") {
                opt.source = "webform";
                opt.userObject = this.ctrl.__userObject;
            }
            this.initControls.init(inpCtrl, opt);
        }.bind(this));
        //should fire after onChangeFn init
        $.each(this.AllRowCtrls[rowid], function (i, inpCtrl) {
            if (inpCtrl.DefaultValue)
                inpCtrl.setValue(inpCtrl.DefaultValue);
            if (inpCtrl.IsDisable)
                inpCtrl.disable();
            // run DG onChangeFns initially
            if (inpCtrl.OnChangeFn && inpCtrl.OnChangeFn.Code && inpCtrl.OnChangeFn.Code.trim() !== '') {
                try {
                    let onChangeFn = new Function('form', 'user', `event`, atob(inpCtrl.OnChangeFn.Code)).bind(inpCtrl, this.ctrl.formObject, this.ctrl.__userObject);
                    inpCtrl.__onChangeFn = onChangeFn;
                    console.eb_log(`>> Starting execution of OnChange function of 'form.${this.ctrl.Name}.${inpCtrl.Name}'`);
                    onChangeFn();
                }
                catch (e) {
                    console.eb_log("eb error :");
                    console.eb_log(e);
                    alert("  error in 'On Change function' of : " + inpCtrl.Name + " - " + e.message);
                }
            }
        }.bind(this));
        return this.AllRowCtrls[rowid];
    };

    this.getFormVals = function () {
        return getValsFromForm(this.formObject_Full);
    }.bind(this);

    this.getValues = function () {
        this.FVWTObjColl = [];
        $.each(this.AllRowCtrls, function (rowid, ctrls) {
            let rowObjs = {};
            rowObjs[0] = [];
            $.each(ctrls, function (i, obj) {
                let colObj = {};
                colObj.Name = obj.Name;
                _type = obj.EbDbType;
                colObj.Value = (_type === 7) ? parseFloat(obj.getValue()) : obj.getValue();
                colObj.Type = _type;
                colObj.AutoIncrement = obj.AutoIncrement || false;
                rowObjs[0].push(colObj);
            }.bind(this));
            this.FVWTObjColl.push(rowObjs);
        }.bind(this));
    }.bind(this);

    t = this.getValues;

    this.ctrlToSpan_row = function (rowid) {
        let $tr = this.$table.find(`[rowid=${rowid}]`);
        $.each($tr.find("td[ctrltdidx]"), function (i, td) {
            this.ctrlToSpan_td($(td));
        }.bind(this));
    }.bind(this);

    this.getCtrlByTd = function ($td) {
        let rowid = $td.closest("tr").attr("rowid");
        let ctrlTdIdx = $td.attr("ctrltdidx");
        return this.AllRowCtrls[rowid][ctrlTdIdx];
    };

    this.ctrlToSpan_td = function ($td) {
        let ctrl = this.getCtrlByTd($td);
        $td.find(".ctrl-cover").hide(100);
        if (ctrl.ObjType === "PowerSelect") {
            let html = "";
            $("#" + ctrl.EbSid_CtxId + "Wraper .search-block").each(function (i, block) {
                html += "<span iblock>";
                $(block).find(".selected-tag").each(function (i, tag) { html += $(tag).outerHTML(); });
                html += "</span>&nbsp;&nbsp;&nbsp;";
            });
            $td.find(".tdtxt span").html(html.substr(0, html.length - 18));
        }
        else {
            let val = ctrl.getDisplayMember() || ctrl.getValue();
            $td.find(".tdtxt span").text(val);
        }
        $td.find(".tdtxt").show(300);
    }.bind(this);

    this.AllRequired_valid_Check = function (rowid) {//////
        let required_valid_flag = true;
        let $notOk1stCtrl = null;
        $.each(this.AllRowCtrls[rowid], function (i, Col) {
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

    this.editRow_click = function (e) {
        $td = $(e.target).closest("td");
        $td.find(".del-row").hide();
        $addRow = $(`[ebsid='${this.ctrl.EbSid}'] [is-checked='false']`);
        $(`[ebsid='${this.ctrl.EbSid}'] tr[is-checked='true']`).find(`.edit-row`).hide();
        $addRow.hide(300).attr("is-editing", "false");
        $td.find(".check-row").show();
        let $tr = $td.closest("tr");
        $tr.attr("is-editing", "true");
        let rowid = $tr.attr("rowid");
        this.spanToCtrl_row($tr);
        this.setCurRow(rowid);
        $(`#${this.TableId}>tbody>[is-editing=true]:first *:input[type!=hidden]:first`).focus();
    }.bind(this);

    this.checkRow_click = function (e, isAddRow = true) {
        $td = $(e.target).closest("td");
        $addRow = $(`[ebsid='${this.ctrl.EbSid}'] [is-checked='false']:last`);//fresh row. ':last' to handle dynamic addrow()(delayed check if row contains PoweSelect)
        let $tr = $td.closest("tr");
        $tr.attr("mode", "false");
        let rowid = $tr.attr("rowid");
        if (!this.AllRequired_valid_Check(rowid))
            return;
        $td.find(".check-row").hide();
        $td.find(".del-row").show();
        $td.find(".edit-row").show();

        $(`[ebsid='${this.ctrl.EbSid}'] tr[is-checked='true']`).find(`.edit-row`).show();
        $addRow.show().attr("is-editing", "true");

        this.ctrlToSpan_row(rowid);
        if (($tr.attr("is-checked") !== "true" && isAddRow) && $tr.attr("is-added") === "true" && !this.ctrl.IsDisable)
            this.addRow();
        else
            this.setCurRow($addRow.attr("rowid"));
        $tr.attr("is-checked", "true").attr("is-editing", "false");
        this.updateAggCols($addRow.attr("rowid"));
        //$addRow.focus();
        $(`#${this.TableId}>tbody>[is-editing=true]:first *:input[type!=hidden]:first`).focus();

    }.bind(this);

    this.updateAggCols = function (rowId) {
        $.each(this.AllRowCtrls[rowId], function (i, inpctrl) {
            if (inpctrl.IsAggragate) {
                let colname = inpctrl.Name;
                $(`#${this.TableId}_footer tbody tr [colname='${colname}'] .tdtxt-agg span`).text(this.getAggOfCol(colname));
            }
        }.bind(this));

    };

    this.updateAggCol = function (e) {
        let $td = $(e.target).closest("td");
        let colname = $td.attr("colname");
        $(`#${this.TableId}_footer tbody tr [colname='${colname}'] .tdtxt-agg span`).text(this.getAggOfCol(colname));
    };

    this.getAggOfCol = function (colname) {
        let sum = 0;
        $.each($(`#${this.TableId} > tbody [colname='${colname}'] [ui-inp]`), function (i, Iter_Inp) {
            let val;

            if (event && event.target === Iter_Inp) {
                let typing_inp = event.target;
                val = parseFloat(typing_inp.value);
            }
            else
                val = parseFloat($(Iter_Inp).val());

            sum += val || 0;
        }.bind(this));
        this.ctrl[colname + "_sum"] = sum;
        return sum;
    };

    this.removeTr = function ($tr) {
        let rowId = $tr.attr("rowid");
        $tr.find("td *").hide(200);
        setTimeout(function () { $tr.remove(); }, 201);
        this.AllRowCtrls[rowId].IsDelete = true;
    };

    this.delRow_click = function (e) {
        $tr = $(e.target).closest("tr");
        this.removeTr($tr);
        this.resetRowSlNoUnder($tr);
    }.bind(this);

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

    this.dg_rowKeydown = function (e) {
        if (e.which === 40)//down arrow
            $(e.target).next().focus();
        if (e.which === 38)//up arrow
            $(e.target).prev().focus();
        //alt + enter
        if ((event.altKey || event.metaKey) && event.which === 13) {
            if (this.$table.has(document.activeElement).length === 1) {
                $(document.activeElement).closest(".dgtr").find(".check-row").trigger("click");
            }
        }
    }.bind(this);

    this.initAgg = function () {
        this.addAggragateRow();

        $.each(this.ctrl.Controls.$values, function (i, col) {
            this.ctrl[col.Name + "_sum"] = 0;
        }.bind(this));

        this.$table.on("keyup", "[tdcoltype=DGNumericColumn] [ui-inp]", this.updateAggCol.bind(this));
    };

    this.AddRowWithData = function (_rowdata) {
        let addedRowObj = this.addRow({ isAddBeforeLast: true });
        let $addedRow = addedRowObj[0];
        let addedRowCols = addedRowObj[1];
        let callBFn = function () {
            setTimeout(function () {
                let td = $(`#${this.TableId}>tbody>tr[rowid=${addedRowCols[0].__rowid}] td:last`)[0];
                {// experimental code
                    $.each(addedRowCols, function (i, col) {
                        if (col.__onChangeFn && col.OnChangeFn.Code && col.OnChangeFn.Code.trim() !== '')
                            col.__onChangeFn();
                    }.bind(this));
                }
                this.checkRow_click({ target: td }, false);
            }.bind(this), 1);
        }.bind(this);
        $.each(addedRowCols, function (i, col) {
            let data = _rowdata[col.Name];
            if (data !== null) {
                if (col.ObjType === "PowerSelect")
                    col.setValue(data, callBFn);
                else {
                    col.setValue(data);
                }

            }
        }.bind(this));

        this.resetRowSlNo($addedRow.index());
        if (!this.isPSInDG)
            setTimeout(callBFn, 1);// call checkRow_click() pass event.target directly
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

    this.clearDG = function () {
        $(`#${this.TableId}>tbody>tr`).each(function (i, e) {
            //$(e).trigger("click");
            this.delRow_click({ target: e });
        }.bind(this));
        $(`#${this.TableId}>tbody>.dgtr`).remove();
        this.resetBuffers();
        if (!this.ctrl.IsDisable)
            this.addRow();
    };

    this.updateRowByRowIndex = function (rowIdx, rowData) {
        let rowId = $(`#${this.TableId}>tbody>tr:eq(${(rowIdx - 1)})`).attr("rowid");
        this.updateRowByRowId(rowId, rowData);
    };

    this.updateRowBySlno = function (slno, rowData) {
        let rowId = $(`#${this.TableId}>tbody>tr>td.row-no-td[idx=${slno}]`).parent().attr("rowid");
        this.updateRowByRowId(rowId, rowData);
    };

    this.updateRowByRowId = function (rowId, rowData) {

        let $tr = $(`#${this.TableId}>tbody>tr[rowid=${rowId}]`);
        if ($tr.length === 0) {
            console.log(`eb error :    No row with rowId '${rowId}' exist`);
            return;
        }

        $.each(Object.keys(rowData), function (i, key) {
            let obj = getObjByval(this.AllRowCtrls[rowId], "Name", key);
            if (obj) {
                obj.setValue(rowData[key]);
            }
        }.bind(this));

        if ($tr.attr("is-editing") === "false")
            this.ctrlToSpan_row(rowId);
    };

    this.disableRow = function (rowId) {
        let $tr = $(`#${this.TableId}>tbody>tr[rowid=${rowId}]`);
        $tr.find(".ctrlstd").attr("mode", "view").attr("title", "Row Disabled");
        $.each(this.AllRowCtrls[rowId], function (i, inpCtrl) {
            inpCtrl.disable();
        }.bind(this));
    };

    this.enableRow = function (rowId) {
        let $tr = $(`#${this.TableId}>tbody>tr[rowid=${rowId}]`);
        $tr.find(".ctrlstd").removeAttr('mode').removeAttr('title');
        $.each(this.AllRowCtrls[rowId], function (i, inpCtrl) {
            inpCtrl.enable();
        }.bind(this));
    };

    this.hideRow = function (rowId) {
        $(`#${this.TableId}>tbody>tr[rowid=${rowId}]`).hide(200);
    };

    this.hideRows = function (rowIds) {
        arguments.each(function (i, rowId) {
            this.hideRow(rowId);
        }.bind(this));
    };

    this.showRow = function (rowId) {
        $(`#${this.TableId}>tbody>tr[rowid=${rowId}]`).show(200);
    };

    this.showRows = function (rowIds) {
        arguments.each(function (i, rowId) {
            this.showRow(rowId);
        }.bind(this));
    };

    this.setCurRow = function (rowId) {
        this.ctrl.currentRow = [];
        $.each(this.AllRowCtrls[rowId], function (i, inpctrl) {
            this.ctrl.currentRow[inpctrl.__Col.Name] = inpctrl;
        }.bind(this));
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


    this.init = function () {
        this.ctrl.currentRow = [];
        this.isAggragateInDG = false;
        this.isPSInDG = false;
        this.S_cogsTdHtml = "";
        this.rowSLCounter = 0;
        $.each(this.ctrl.Controls.$values, function (i, col) {
            col.__DG = this.ctrl;
            col.getValue = this.ColGetvalueFn;
            col.setValue = this.ColSetvalueFn;
            col.enable = this.EnableFn;
            col.disable = this.DisableFn;
            if (col.IsAggragate)
                this.isAggragateInDG = true;
            if (col.ObjType === "DGPowerSelectColumn")
                this.isPSInDG = true;
            if (col.ObjType === "DGUserControlColumn")
                col.__DGUCC = new DGUCColumn(col, this.ctrl.__userObject);
        }.bind(this));

        this.tryAddRow();
        if (this.isAggragateInDG) {
            this.initAgg();
            $(`#${this.ctrl.EbSid}Wraper .Dg_footer`).show();
        }
        if (!this.ctrl.IsShowSerialNumber)
            $(`#${this.ctrl.EbSid}Wraper`).attr("hideslno", "true");

        this.ctrl.addRow = this.AddRowWithData.bind(this);
        this.ctrl.clear = this.clearDG.bind(this);

        this.ctrl.updateRowByRowId = this.updateRowByRowId.bind(this);
        this.ctrl.updateRowByRowIndex = this.updateRowByRowIndex.bind(this);
        this.ctrl.updateRowBySlno = this.updateRowBySlno.bind(this);

        this.ctrl.disableRow = this.disableRow.bind(this);
        this.ctrl.enableRow = this.enableRow.bind(this);

        this.ctrl.showRow = this.showRow.bind(this);
        this.ctrl.hideRow = this.hideRow.bind(this);
        this.defineRowCount();

        this.$table.on("click", ".check-row", this.checkRow_click);
        this.$table.on("click", ".del-row", this.delRow_click);
        this.$table.on("click", ".edit-row", this.editRow_click);
        this.$table.on("keydown", ".dgtr", this.dg_rowKeydown);
    };

    this.init();
};