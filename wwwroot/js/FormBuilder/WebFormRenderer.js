/*!
* WebFormRender.js
* to Render WebForm
* EXPRESSbase Systems Pvt. Ltd , Jith Job
*/

const WebFormRender = function (option) {
    this.FormObj = option.formObj;
    this.$form = $(`#${this.FormObj.EbSid}`);
    this.$saveBtn = $('#' + option.headerBtns['Save']);
    this.$deleteBtn = $('#' + option.headerBtns['Delete']);
    this.$editBtn = $('#' + option.headerBtns['Edit']);
    this.$cancelBtn = $('#' + option.headerBtns['Cancel']);
    this.$auditBtn = $('#' + option.headerBtns['AuditTrail']);
    this.$closeBtn = $('#' + option.headerBtns['Close']);
    this.Env = option.env;
    this.Cid = option.cid;
    this.initControls = new InitControls(this);
    //this.editModeObj = option.editModeObj;
    this.formRefId = option.formRefId || "";
    this.rowId = option.rowId;
    this.mode = option.mode;
    this.userObject = option.userObject;
    this.isPartial = option.isPartial;//value is true if form is rendering in iframe
    this.headerObj = option.headerObj;//EbHeader
    this.formPermissions = option.formPermissions;
    this.EditModeFormData = option.formData === null ? null : option.formData.MultipleTables;//EditModeFormData
    this.FormDataExtended = option.formData === null ? null : option.formData.ExtendedTables;
    this.DisableDeleteData = option.formData === null ? {} : option.formData.DisableDelete;
    this.DisableCancelData = option.formData === null ? {} : option.formData.DisableCancel;
    this.FormDataExtdObj = { val: this.FormDataExtended };
    this.Mode = { isEdit: this.mode === "Edit Mode", isView: this.mode === "View Mode", isNew: this.mode === "New Mode" };// to pass by reference
    this.flatControls = getFlatCtrlObjs(this.FormObj);// here without functions
    this.formValues = {};
    this.IsPSsInitComplete = {};
    this.formValidationflag = true;
    this.isEditModeCtrlsSet = false;
    this.DGBuilderObjs = {};
    this.uniqCtrlsInitialVals = {};
    this.PSsIsInit = {};
    this.FRC = new FormRenderCommon({
        FO: this
    });

    this.updateCtrlUI = function (cObj) {
        $.each(cObj, function (prop, val) {
            //prop = prop.charAt(0).toUpperCase() + prop.slice(1);
            let meta = getObjByval(AllMetas["Eb" + cObj.ObjType], "name", prop);
            if (meta) {
                let NSS = meta.UIChangefn;
                if (NSS) {
                    let NS1 = NSS.split(".")[0];
                    let NS2 = NSS.split(".")[1];
                    try {
                        EbOnChangeUIfns[NS1][NS2](cObj.EbSid_CtxId, cObj);
                    }
                    catch (e) {
                        console.warn(e.message);
                    }
                }
            }
        });
    };

    this.setFormObject = function () {
        this.flatControlsWithDG = this.flatControls.concat(this.DGs);// all DGs in the formObject + all controls as flat
        $.each(this.flatControlsWithDG, function (i, ctrl) {
            this.formObject[ctrl.Name] = ctrl;
        }.bind(this));
        this.FRC.setFormObjHelperfns();
        this.setFormObjectMode();
        this.FRC.setUpdateDependentControlsFn();


        return this.formObject;
    };

    this.setFormObjectMode = function () {
        if (this.Mode.isView)
            this.formObject.__mode = "view";
        else if (this.Mode.isNew)
            this.formObject.__mode = "new";
        else if (this.Mode.Edit)
            this.formObject.__mode = "edit";
    };

    this.initDGs = function () {
        $.each(this.DGs, function (k, DG) {
            this.DGBuilderObjs[DG.Name] = this.initControls.init(DG, { Mode: this.Mode, formObject: this.formObject, userObject: this.userObject, FormDataExtdObj: this.FormDataExtdObj, formObject_Full: this.FormObj });
        }.bind(this));
    };

    this.initNCs = function () {
        $.each(this.flatControls, function (k, Obj) {
            let opt = {};
            if (Obj.ObjType === "PowerSelect")
                opt.getAllCtrlValuesFn = this.getWebFormVals;
            else if (Obj.ObjType === "FileUploader")
                opt.FormDataExtdObj = this.FormDataExtdObj;
            else if (Obj.ObjType === "Date") {
                opt.source = "webform";
            }
            else if (Obj.ObjType === "ProvisionUser" || Obj.ObjType === "ProvisionLocation")
                opt.flatControls = this.flatControls;
            this.initControls.init(Obj, opt);
        }.bind(this));
        if (this.ApprovalCtrl) {
            opt = { Mode: this.Mode, formsaveFn: this.saveForm.bind(this), formObject: this.formObject, userObject: this.userObject, FormDataExtdObj: this.FormDataExtdObj, formObject_Full: this.FormObj };
            this.initControls.init(this.ApprovalCtrl, opt);
        }
    };

    this.SetWatchers = function () {
        //this.formObject
        Object.defineProperty(this.formObject, "__mode", {
            set: function (value) {
                this.$form.attr("mode", value);
            }.bind(this),
            get: function () {
                return this.$form.attr("mode");
            }.bind(this)
        });
    };

    this.initWebFormCtrls = function () {
        JsonToEbControls(this.FormObj);
        this.flatControls = getFlatCtrlObjs(this.FormObj);// here with functions
        this.formObject = {};// for passing to user defined functions
        this.SetWatchers();
        this.formObject.__mode = "new";// added a watcher to update form attribute

        this.PSs = getFlatObjOfType(this.FormObj, "PowerSelect");// all PSs in the formObject
        this._allPSsInit = false;

        this.DGs = getFlatContObjsOfType(this.FormObj, "DataGrid");// all DGs in the formObject
        this.ApprovalCtrl = getFlatContObjsOfType(this.FormObj, "Approval")[0];//Approval in the formObject
        this.setFormObject();
        this.updateCtrlsUI();
        this.initNCs();// order 1
        this.FRC.setDefaultvalsNC(this.flatControls);// order 2
        this.FRC.bindFnsToCtrls(this.flatControls);// order 3
        this.initDGs();


        this.FRC.fireInitOnchangeNC(this.flatControls);

        $.each(this.DGs, function (k, DG) {
            let _DG = new ControlOps[DG.ObjType](DG);
            if (_DG.OnChangeFn.Code === null)
                _DG.OnChangeFn.Code = "";
            this.FRC.bindOnChange(_DG);
        }.bind(this));
    };

    this.updateCtrlsUI = function () {
        let allFlatControls = [this.FormObj, ...getInnerFlatContControls(this.FormObj).concat(this.flatControls)];
        $.each(allFlatControls, function (k, Obj) {
            this.updateCtrlUI(Obj);
        }.bind(this));
    };

    //this.unbindUniqueCheck = function (control) {
    //    $("#" + control.EbSid_CtxId).off("blur.dummyNameSpace");
    //};

    this.getWebFormVals = function () {
        return getValsFromForm(this.FormObj);
    }.bind(this);

    //this.j = function (p1) {
    //    let VMs = this.initializer.Vobj.valueMembers;
    //    let DMs = this.initializer.Vobj.displayMembers;

    //    if (VMs.length > 0)// clear if already values there
    //        this.initializer.clearValues();

    //    let valMsArr = p1[0].split(",");
    //    let DMtable = p1[1];


    //    $.each(valMsArr, function (i, vm) {
    //        VMs.push(vm);
    //        $.each(this.DisplayMembers.$values, function (j, dm) {
    //            valMsArr;
    //            DMtable;

    //            $.each(DMtable, function (j, r) {
    //                if (getObjByval(r.Columns, "Name", this.ValueMember.name).Value === vm) {
    //                    let _dm = getObjByval(r.Columns, "Name", dm.name).Value;
    //                    DMs[dm.name].push(_dm);
    //                }
    //            }.bind(this));
    //        }.bind(this));
    //    }.bind(this));
    //};

    this.setNCCSingleColumns = function (NCCSingleColumns_flat_editmode_data) {
        $.each(NCCSingleColumns_flat_editmode_data, function (i, SingleColumn) {
            let val = SingleColumn.Value;

            if (SingleColumn.Name === "id")
                return true;
            if (val === null)
                return true;

            let ctrl = getObjByval(this.flatControls, "Name", SingleColumn.Name);
            ctrl.__eb_EditMode_val = val;
            if (ctrl.ObjType === "PowerSelect") {
                //ctrl.setDisplayMember = this.j;
                ctrl.setDisplayMember([val, this.FormDataExtended[ctrl.EbSid]]);
            }
            else
                ctrl.setValue(val);
        }.bind(this));
    };

    this.getNCCTblNames = function (FormData) {
        let NCCTblNames = [];
        let FlatContControls = getFlatContControls(this.FormObj);
        $.each(FlatContControls, function (i, CC) {
            let TableName = CC.TableName.trim();
            if (!CC.IsSpecialContainer && TableName !== '')
                NCCTblNames.push(TableName);
        });
        return NCCTblNames;
    };

    this.getNCCSingleColumns_flat = function (EditModeFormData, NCCTblNames) {
        let NCCSingleColumns_flat = [];
        $.each(NCCTblNames, function (i, TblName) {
            let SingleRowColums = EditModeFormData[TblName][0].Columns;
            NCCSingleColumns_flat = NCCSingleColumns_flat.concat(SingleRowColums);
        });
        return NCCSingleColumns_flat;
    };

    this.ClearControls = function (isForceClear = false) {
        $.each(this.allFlatControls, function (control) {
            if (!control.IsMaintainValue && !isForceClear)
                control.clear();
        });
    };

    this.setEditModeCtrls = function () {
        if (this.isEditModeCtrlsSet) {// if already set while mode switching
            $.each(this.DGs, function (k, DG) {
                this.DGBuilderObjs[DG.Name].SwitchToEditMode();
            }.bind(this));
            return;
        }
        let EditModeFormData = this.EditModeFormData;
        let NCCTblNames = this.getNCCTblNames(EditModeFormData);
        //let DGTblNames = this.getSCCTblNames(EditModeFormData, "DataGrid");
        $.each(this.DGs, function (k, DG) {
            if (!EditModeFormData.hasOwnProperty(DG.TableName))
                return true;
            let SingleTable = EditModeFormData[DG.TableName];
            DG.setEditModeRows(SingleTable);
        }.bind(this));

        if (this.ApprovalCtrl) {
            if (EditModeFormData.hasOwnProperty(this.ApprovalCtrl.TableName)) {
                let SingleTable = EditModeFormData[this.ApprovalCtrl.TableName];
                this.ApprovalCtrl.setEditModeRows(SingleTable);
            }
        }

        let NCCSingleColumns_flat_editmode_data = this.getNCCSingleColumns_flat(EditModeFormData, NCCTblNames);
        this.setNCCSingleColumns(NCCSingleColumns_flat_editmode_data);
        this.isEditModeCtrlsSet = true;

        this.FRC.setValueExpValsNC(this.flatControls);
    };

    //this.getEditModeFormData = function (rowId) {
    //    this.showLoader();
    //    $.ajax({
    //        type: "POST",
    //        url: "/WebForm/getRowdata",
    //        data: {
    //            refid: this.formRefId, rowid: parseInt(rowId)
    //        },
    //        error: function (xhr, ajaxOptions, thrownError) {
    //            this.hideLoader();
    //            EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
    //        }.bind(this),
    //        success: function (data) {
    //            this.EditModeFormData = data.formData.multipleTables;
    //            this.setEditModeCtrls();
    //            this.hideLoader();
    //        }.bind(this),
    //    });
    //};

    this.getApprovalRow = function () {
        let FVWTObjColl = {};
        if (this.ApprovalCtrl) {
            let tOb = this.ApprovalCtrl.ChangedRowObject();
            if (tOb)
                FVWTObjColl[this.ApprovalCtrl.TableName] = tOb;
        }
        return FVWTObjColl;
    };

    this.getDG_FVWTObjColl = function () {
        let FVWTObjColl = {};
        $.each(this.DGs, function (i, DG) {
            FVWTObjColl[DG.TableName] = DG.ChangedRowObject();
        });
        return FVWTObjColl;
    };

    this.ProcRecurForVal = function (src_obj, FVWTObjColl) {
        let _val = null;
        $.each(src_obj.Controls.$values, function (i, obj) {
            if (obj.IsContainer) {
                if (obj.IsSpecialContainer)
                    return true;
                if (obj.TableName === "" || obj.TableName === null)
                    obj.TableName = src_obj.TableName;
                if (FVWTObjColl[obj.TableName] === undefined) {
                    let rowId = this.Mode.isEdit ? this.EditModeFormData[obj.TableName][0].RowId : 0;
                    FVWTObjColl[obj.TableName] = [{
                        RowId: rowId,
                        IsUpdate: false,
                        Columns: []
                    }];
                }
                this.ProcRecurForVal(obj, FVWTObjColl);
            }
            else if (obj.ObjType !== "FileUploader" && !obj.DoNotPersist) {
                FVWTObjColl[src_obj.TableName][0].Columns.push(getSingleColumn(obj));
            }
        }.bind(this));

    };

    this.getFormTables = function () {
        let FormTables = {};
        FormTables[this.FormObj.TableName] = [{
            RowId: this.rowId,
            IsUpdate: false,
            Columns: []
        }];
        this.ProcRecurForVal(this.FormObj, FormTables);
        return FormTables;
    };

    this.getExtendedTables = function () {
        let ExtendedTables = {};
        $.each(uploadedFileRefList, function (key, values) {
            ExtendedTables[key] = [];
            //ExtendedTables[key] = [{
            //    IsUpdate: false,
            //    Columns: []
            //}];
            for (let i = 0; i < values.length; i++) {
                let SingleColumn = {};
                SingleColumn.Name = key;
                SingleColumn.Value = values[i];
                SingleColumn.Type = EbEnums.EbDbTypes.Decimal;
                ExtendedTables[key].push({
                    IsUpdate: false,
                    Columns: [SingleColumn]
                });
                //ExtendedTables[key][0].Columns.push(SingleColumn);
            }
        });
        return ExtendedTables;
    };

    this.getFormValuesObjWithTypeColl = function () {
        let WebformData = {};
        let approvalTable = {};
        WebformData.MasterTable = this.FormObj.TableName;

        let formTables = this.getFormTables();
        let gridTables = this.getDG_FVWTObjColl();
        if (this.ApprovalCtrl)
            approvalTable = this.getApprovalRow();

        WebformData.MultipleTables = $.extend(formTables, gridTables, approvalTable);
        WebformData.ExtendedTables = this.getExtendedTables();
        return JSON.stringify(WebformData);
    };

    this.saveSuccess = function (_respObj) {// need cleanup
        this.hideLoader();
        let respObj = JSON.parse(_respObj);
        let locName = ebcontext.locations.CurrentLocObj.LongName;
        let formName = this.FormObj.DisplayName;
        if (this.rowId > 0) {// if edit mode 
            if (respObj.RowAffected > 0) {// edit success from editmode
                EbMessage("show", { Message: "Edited " + formName + " from " + locName, AutoHide: true, Background: '#00aa00' });
                this.EditModeFormData = respObj.FormData.MultipleTables;
                this.FormDataExtdObj.val = respObj.FormData.ExtendedTables;
                this.FormDataExtended = respObj.FormData.ExtendedTables;
                this.SwitchToViewMode();
            }
            else if (respObj.RowAffected === -2) {
                EbMessage("show", { Message: "Access denied to update this data entry!", AutoHide: true, Background: '#aa0000' });
            }
            else {
                EbMessage("show", { Message: "Something went wrong", AutoHide: true, Background: '#aa0000' });
            }
        }
        else {
            if (respObj.RowId > 0) {// if insertion success -NewToedit
                EbMessage("show", { Message: "New " + formName + " entry in " + locName + " created", AutoHide: true, Background: '#00aa00' });
                this.rowId = respObj.RowId;
                this.EditModeFormData = respObj.FormData.MultipleTables;
                this.FormDataExtdObj.val = respObj.FormData.ExtendedTables;
                this.FormDataExtended = respObj.FormData.ExtendedTables;
                this.SwitchToViewMode();
            }
            else if (respObj.RowId === -2) {
                EbMessage("show", { Message: "Access denied to save this data entry!", AutoHide: true, Background: '#aa0000' });
            }
            else {
                EbMessage("show", { Message: "Something went wrong", AutoHide: true, Background: '#aa0000' });
            }
        }
        this.afterSaveAction();
        //window.parent.closeModal();
    };

    this.isAllUniqOK = function () {
        let unique_flag = true;
        let $notOk1stCtrl = null;
        $.each(this.flatControls, function (i, control) {
            if (!control.Unique)
                return true;
            let $ctrl = $("#" + control.EbSid_CtxId);
            if ($ctrl.attr("uniq-ok") === "false") {
                this.FRC.addInvalidStyle(control, "This field is unique, try another value");
                unique_flag = false;
                if (!$notOk1stCtrl)
                    $notOk1stCtrl = $ctrl;
            }
        }.bind(this));

        if ($notOk1stCtrl)
            $notOk1stCtrl.select();
        return unique_flag;
    };

    this.saveForm = function () {
        this.BeforeSave();

        setTimeout(function () {// temp
            if (!this.FRC.AllRequired_valid_Check())
                return;
            if (!this.isAllUniqOK())
                return;
            //if (!this.FRC.AllUnique_Check())
            //    return;
            this.showLoader();
            let currentLoc = store.get("Eb_Loc-" + _userObject.CId + _userObject.UserId) || _userObject.Preference.DefaultLocation;
            $.ajax({
                type: "POST",
                //url: this.ssurl + "/bots",
                url: "/WebForm/InsertWebformData",
                data: {
                    TableName: this.FormObj.TableName,
                    ValObj: this.getFormValuesObjWithTypeColl(),
                    RefId: this.formRefId,
                    RowId: this.rowId,
                    CurrentLoc: currentLoc
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    this.hideLoader();
                    EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
                }.bind(this),
                //beforeSend: function (xhr) {
                //    xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
                //}.bind(this),
                success: this.saveSuccess.bind(this)
            });
        }.bind(this), 2);

    };

    //functions to be executed before save in frontend
    this.BeforeSave = function () {
        if (!this.FormObj.BeforeSaveRoutines)
            return;
        $.each(this.FormObj.BeforeSaveRoutines.$values, function (k, r) {
            if (!r.IsDisabled && r.Script.Lang === 0 && r.Script.Code !== "") {
                new Function("form", "user", `event`, atob(r.Script.Code)).bind(this.formObject, this.setFormObject(), this.userObject)();
            }
        }.bind(this));
    };

    this.SwitchToViewMode = function () {
        this.formObject.__mode = "view";
        this.Mode.isView = true;
        this.Mode.isEdit = false;
        this.Mode.isNew = false;
        this.setHeader("View Mode");
        this.BeforeModeSwitch("View Mode");
        this.flatControls = getFlatCtrlObjs(this.FormObj);// here re-assign objectcoll with functions
        this.setEditModeCtrls();
        $.each(this.flatControls, function (k, ctrl) {
            ctrl.disable();
        }.bind(this));
        $.each(this.DGs, function (k, DG) {
            this.DGBuilderObjs[DG.Name].SwitchToViewMode();
        }.bind(this));
    };

    this.SwitchToEditMode = function () {
        this.formObject.__mode = "edit";
        this.Mode.isEdit = true;
        this.Mode.isView = false;
        this.Mode.isNew = false;
        this.setEditModeCtrls();
        if (this.ApprovalCtrl)
            this.ApprovalCtrl.enableAccessibleRow();
        this.BeforeModeSwitch("Edit Mode");
        this.setHeader("Edit Mode");
        this.flatControls = getFlatCtrlObjs(this.FormObj);// here re-assign objectcoll with functions
        $.each(this.flatControls, function (k, ctrl) {
            if (!ctrl.IsDisable)
                ctrl.enable();
            if (ctrl.Unique)
                this.uniqCtrlsInitialVals[ctrl.EbSid] = ctrl.getValue();

        }.bind(this));
    };

    this.BeforeModeSwitch = function (newMode) {
        if (newMode === "View Mode") {
            this.flatControls = getFlatCtrlObjs(this.FormObj);
            $.each(this.flatControls, function (k, ctrl) {
                if (ctrl.ObjType === "RadioButton" && ctrl.Name === "eb_default") {
                    let c = getObjByval(this.EditModeFormData[this.FormObj.TableName][0].Columns, "Name", "eb_default");
                    if (c !== undefined && c.Value === "T") {
                        if (this.userObject.Roles.contains("SolutionOwner") || this.userObject.Roles.contains("SolutionAdmin") || this.userObject.Roles.contains("SolutionPM"))
                            return;
                        this.$saveBtn.prop("disabled", true);
                        this.$deleteBtn.prop("disabled", true);
                        this.$editBtn.prop("disabled", true);
                        this.$cancelBtn.prop("disabled", true);
                        //this.$saveBtn.prop("title", "Save Disabled");                        
                    }
                    return;
                }
            }.bind(this));
            $.each(this.FormObj.DisableDelete.$values, function (k, v) {
                if (!v.IsDisabled && !v.IsWarningOnly) {
                    if (this.DisableDeleteData[v.Name]) {
                        this.$deleteBtn.prop("disabled", true);
                        return;
                    }
                }
            }.bind(this));
            $.each(this.FormObj.DisableCancel.$values, function (k, v) {
                if (!v.IsDisabled && !v.IsWarningOnly) {
                    if (this.DisableCancelData[v.Name]) {
                        this.$cancelBtn.prop("disabled", true);
                        return;
                    }
                }
            }.bind(this));
        }
        else {
            this.$saveBtn.prop("disabled", false);
            this.$deleteBtn.prop("disabled", false);
            this.$editBtn.prop("disabled", false);
            this.$cancelBtn.prop("disabled", false);
        }
    };

    this.deleteForm = function () {
        let currentLoc = store.get("Eb_Loc-" + _userObject.CId + _userObject.UserId) || _userObject.Preference.DefaultLocation;
        EbDialog("show",
            {
                Message: "Are you sure to delete this data entry?",
                Buttons: {
                    "Yes": {
                        Background: "green",
                        Align: "left",
                        FontColor: "white;"
                    },
                    "No": {
                        Background: "violet",
                        Align: "right",
                        FontColor: "white;"
                    }
                },
                CallBack: function (name) {
                    if (name === "Yes") {
                        this.showLoader();
                        $.ajax({
                            type: "POST",
                            url: "/WebForm/DeleteWebformData",
                            data: { RefId: this.formRefId, RowId: this.rowId, CurrentLoc: currentLoc },
                            error: function (xhr, ajaxOptions, thrownError) {
                                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
                                this.hideLoader();
                            }.bind(this),
                            success: function (result) {
                                this.hideLoader();
                                if (result > 0) {
                                    EbMessage("show", { Message: "Deleted " + this.FormObj.DisplayName + " entry from " + ebcontext.locations.CurrentLocObj.LongName, AutoHide: true, Background: '#00aa00' });
                                    //EbMessage("show", { Message: 'Deleted Successfully', AutoHide: true, Background: '#00aa00' });
                                    setTimeout(function () { window.close(); }, 3000);
                                }
                                else if (result === -1) {
                                    EbMessage("show", { Message: 'Delete operation failed due to validation failure.', AutoHide: true, Background: '#aa0000' });
                                }
                                else if (result === -2) {
                                    EbMessage("show", { Message: 'Access denied to delete this entry.', AutoHide: true, Background: '#aa0000' });
                                }
                                else {
                                    EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Background: '#aa0000' });
                                }
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
    };

    this.cancelForm = function () {
        let currentLoc = store.get("Eb_Loc-" + _userObject.CId + _userObject.UserId) || _userObject.Preference.DefaultLocation;
        EbDialog("show",
            {
                Message: "Are you sure to cancel this data entry?",
                Buttons: {
                    "Yes": {
                        Background: "green",
                        Align: "left",
                        FontColor: "white;"
                    },
                    "No": {
                        Background: "violet",
                        Align: "right",
                        FontColor: "white;"
                    }
                },
                CallBack: function (name) {
                    if (name === "Yes") {
                        this.showLoader();
                        $.ajax({
                            type: "POST",
                            url: "/WebForm/CancelWebformData",
                            data: { RefId: this.formRefId, RowId: this.rowId, CurrentLoc: currentLoc },
                            error: function (xhr, ajaxOptions, thrownError) {
                                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
                                this.hideLoader();
                            }.bind(this),
                            success: function (result) {
                                this.hideLoader();
                                if (result > 0) {
                                    EbMessage("show", { Message: "Canceled " + this.FormObj.DisplayName + " entry from " + ebcontext.locations.CurrentLocObj.LongName, AutoHide: true, Background: '#00aa00' });
                                    //EbMessage("show", { Message: 'Canceled Successfully', AutoHide: true, Background: '#00aa00' });
                                    setTimeout(function () { window.close(); }, 3000);
                                }
                                else if (result === -1) {
                                    EbMessage("show", { Message: 'Cancel operation failed due to validation failure.', AutoHide: true, Background: '#aa0000' });
                                }
                                else if (result === -2) {
                                    EbMessage("show", { Message: 'Access denied to cancel this entry.', AutoHide: true, Background: '#aa0000' });
                                }
                                else {
                                    EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Background: '#aa0000' });
                                }
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
    };

    this.GetAuditTrail = function () {
        let currentLoc = store.get("Eb_Loc-" + _userObject.CId + _userObject.UserId) || _userObject.Preference.DefaultLocation;
        $("#AuditHistoryModal .modal-title").text("Audit Trail - " + this.FormObj.DisplayName);
        $("#AuditHistoryModal").modal("show");
        $("#divAuditTrail").children().remove();
        $("#divAuditTrail").append(`<div style="text-align: center;  position: relative; top: 45%;"><i class="fa fa-spinner fa-pulse" aria-hidden="true"></i> Loading...</div>`);
        $.ajax({
            type: "POST",
            url: "/WebForm/GetAuditTrail",
            data: { refid: this.formRefId, rowid: this.rowId, CurrentLoc: currentLoc },
            error: function () {
                $("#divAuditTrail").children().remove();
                $("#divAuditTrail").append(`<div style="text-align: center;  position: relative; top: 45%; font-size: 20px; color: #aaa; "> Something unexpected occured </div>`);
            },
            success: function (result) {
                if (result === "{}") {
                    $("#divAuditTrail").children().remove();
                    $("#divAuditTrail").append(`<div style="text-align: center; position: relative; top: 45%; font-size: 20px; color: #aaa; "> Nothing to Display </div>`);
                    return;
                }
                else if (result === "") {
                    $("#divAuditTrail").children().remove();
                    $("#divAuditTrail").append(`<div style="text-align: center;  position: relative; top: 45%; font-size: 20px; color: #aaa; "> Something went wrong </div>`);
                    return;
                }
                this.drawAuditTrailTest(result);
            }.bind(this)
        });
    };

    this.drawAuditTrailTest = function (result) {
        let auditObj = JSON.parse(result);
        let $transAll = $(`<div></div>`);

        $.each(auditObj, function (idx, Obj) {
            let $trans = $(`<div class="single-trans"></div>`);
            let temptitle = (Obj.ActionType === "Insert" ? "Created by " : "Updated by ") + Obj.CreatedBy + " at " + Obj.CreatedAt;
            $trans.append(` <div class="trans-head row">
                                <div class="col-md-10" style="padding: 5px 8px;">
                                    <div style="display:inline-block;"><i class="fa fa-chevron-down"></i></div>
                                    <div style="display:inline-block;">${temptitle}</div>
                                </div>
                                <div class="col-md-2">
                                    <div style="float: right;">
                                        <img src="/images/dp/${Obj.CreatedById}.png" onerror="this.src = '/images/imagenotfound.svg';" style="height: 30px; border-radius: 15px;">
                                    </div>                                    
                                </div>
                            </div>`);

            $trans.append(`<div class="trans-body collapse in"></div>`);
            let tempHtml = ``;

            $.each(Obj.Tables, function (i, Tbl) {
                $.each(Tbl.Columns, function (j, Row) {
                    tempHtml += `
                        <tr>
                            <td class="col-md-4 col-sm-4">${Row.Title}</td>
                            <td class="col-md-4 col-sm-4" style="color: red;">${Row.NewValue}</td>
                            <td class="col-md-4 col-sm-4">${Row.OldValue}</td>
                        </tr>`;
                });
            });
            if (tempHtml.length !== 0) {
                tempHtml = `<div class="form-table-div"><table class="table table-bordered first-table" style="width:100%; margin: 0px;">
                                <thead>
                                    <tr class="table-title-tr">
                                        <th class="col-md-4 col-sm-4">Field Name</th>
                                        <th class="col-md-4 col-sm-4">New Value</th>
                                        <th class="col-md-4 col-sm-4">Old Value</th>
                                    </tr>
                                </thead>
                                <tbody>`
                    + tempHtml +
                    `</tbody>
                            </table></div>`;
                $trans.children(".trans-body").append(tempHtml);
            }

            tempHtml = ``;

            $.each(Obj.GridTables, function (i, Tbl) {
                tempHtml += `<div class="line-table-div"><div>${Tbl.Title}</div><table class="table table-bordered second-table" style="width:100%; margin: 0px;">
                                <thead>
                                    <tr class="table-title-tr">
                                        <th></th>`;
                $.each(Tbl.ColumnMeta, function (j, cmeta) {
                    tempHtml += `<th>${cmeta}</th>`;
                });
                tempHtml += `     </tr>
                                </thead><tbody>`;
                $.each(Tbl.Rows, function (m, Cols) {
                    let newRow = `<tr><td>New</td>`;
                    let oldRow = `<tr><td>Old</td>`;
                    $.each(Cols.Columns, function (n, Col) {
                        if (Col.IsModified)
                            newRow += `<td style="color: red;">${Col.NewValue}</td>`;
                        else
                            newRow += `<td>${Col.NewValue}</td>`;
                        oldRow += `<td>${Col.OldValue}</td>`;
                    });
                    newRow += `</tr>`;
                    oldRow += `</tr>`;
                    tempHtml += newRow + oldRow;
                });

                tempHtml += `</tbody></table></div>`;
            });
            $trans.children(".trans-body").append(tempHtml);
            $transAll.append($trans);
        });

        $("#divAuditTrail").children().remove();
        $("#divAuditTrail").append($transAll);

        $("#divAuditTrail .trans-head").on("click", function (e) {
            $(e.target).closest(".trans-head").next().collapse('toggle');
            let $iele = $(e.target).closest(".trans-head").find("i");

            if ($iele.hasClass("fa-chevron-right")) {
                $iele.removeClass("fa-chevron-right");
                $iele.addClass("fa-chevron-down");
            }
            else if ($iele.hasClass("fa-chevron-down")) {
                $iele.removeClass("fa-chevron-down");
                $iele.addClass("fa-chevron-right");
            }

        });
    };

    this.showLoader = function () {
        $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#WebForm-cont" } });
    };

    this.hideLoader = function () {
        $("#eb_common_loader").EbLoader("hide");
    };

    this.windowKeyDown = function (event) {
        if (event.ctrlKey || event.metaKey) {
            if (event.which === 83) {
                event.preventDefault();
                if (this.Mode.isEdit || this.Mode.isNew)
                    this.saveForm();
            }
        }

        if (event.altKey || event.metaKey) {
            if (event.which === 78) {
                event.preventDefault();
                if ($("#webformnew").css("display") !== "none")
                    window.location.href = window.location.href;
            }
        }
    }.bind(this);

    this.setHeader = function (reqstMode) {
        let currentLoc = store.get("Eb_Loc-" + this.userObject.CId + this.userObject.UserId);
        this.headerObj.hideElement(["webformsave-selbtn", "webformnew", "webformedit", "webformdelete", "webformcancel", "webformaudittrail", "webformclose", "webformprint"]);

        if (this.isPartial === "True") {
            if ($(".objectDashB-toolbar").find(".pd-0:first-child").children("button").length > 0) {
                $(".objectDashB-toolbar").find(".pd-0:first-child").children("button").remove();
                $(".objectDashB-toolbar").find(".pd-0:nth-child(2)").find(".form-group").remove();
                $("#Eb_com_menu").remove();
            }
            this.headerObj.showElement(["webformclose"]);
        }

        this.mode = reqstMode;//
        //reqstMode = "Edit Mode" or "New Mode" or "View Mode"
        if (reqstMode === "Edit Mode") {
            this.headerObj.showElement(this.filterHeaderBtns(["webformnew", "webformsave-selbtn", "webformaudittrail"], currentLoc, reqstMode));
        }
        else if (reqstMode === "New Mode") {
            this.headerObj.showElement(this.filterHeaderBtns(["webformsave-selbtn"], currentLoc, reqstMode));
        }
        else if (reqstMode === "View Mode") {
            this.headerObj.showElement(this.filterHeaderBtns(["webformnew", "webformedit", "webformdelete", "webformcancel", "webformaudittrail", "webformprint"], currentLoc, reqstMode));
        }
        else if (reqstMode === "Fail Mode") {
            EbMessage("show", { Message: 'Error in loading data !', AutoHide: false, Background: '#aa0000' });
        }
        else if (reqstMode === "Preview Mode") {
            this.mode = "New Mode";////////////
        }
        this.headerObj.setName(_formObj.DisplayName);
        this.headerObj.setMode(`<span mode="${reqstMode}" class="fmode">${reqstMode}</span>`);
        $('title').text(this.FormObj.DisplayName + `(${reqstMode})`);

        if (this.isPartial === "True") {
            this.headerObj.hideElement(["webformnew", "webformdelete", "webformcancel", "webformaudittrail"]);
        }
    };

    this.filterHeaderBtns = function (btns, loc, mode) {
        let r = [];
        // ["webformsave-selbtn", "webformnew", "webformedit", "webformdelete", "webformcancel", "webformaudittrail"];
        // ["New", "View", "Edit", "Delete", "Cancel", "AuditTrail"]
        for (let i = 0; i < btns.length; i++) {
            if (btns[i] === "webformsave-selbtn" && this.formPermissions[loc].indexOf('New') > -1 && mode === 'New Mode')
                r.push(btns[i]);
            else if (btns[i] === "webformsave-selbtn" && this.formPermissions[loc].indexOf('Edit') > -1 && mode === 'Edit Mode')
                r.push(btns[i]);
            else if (btns[i] === "webformedit" && this.formPermissions[loc].indexOf('Edit') > -1)
                r.push(btns[i]);
            else if (btns[i] === "webformdelete" && this.formPermissions[loc].indexOf('Delete') > -1)
                r.push(btns[i]);
            else if (btns[i] === "webformcancel" && this.formPermissions[loc].indexOf('Cancel') > -1)
                r.push(btns[i]);
            else if (btns[i] === "webformaudittrail" && this.formPermissions[loc].indexOf('AuditTrail') > -1)
                r.push(btns[i]);
            else if (btns[i] === "webformnew" && this.formPermissions[loc].indexOf('New') > -1)
                r.push(btns[i]);
            else if (btns[i] === "webformprint" && mode === 'View Mode' && this.FormObj.PrintDoc && this.FormObj.PrintDoc !== '')
                r.push(btns[i]);
        }
        return r;
    };

    this.newAfterSave = function () {
        this.showLoader();
        reloadFormPage();
    }.bind(this);

    this.continueAfterSave = function () {
        this.SwitchToEditMode();
    }.bind(this);

    this.viewAfterSave = function () {
        this.SwitchToViewMode();
    }.bind(this);

    this.closeAfterSave = function () {
        this.showLoader();
        document.location.href = "/";
    }.bind(this);

    this.saveSelectChange = function () {
        this.saveForm();
        let val = $("#webformsave-selbtn .selectpicker").find("option:selected").attr("data-token");
        this.afterSaveAction = this.getAfterSaveActionFn(val);
    }.bind(this);

    this.getAfterSaveActionFn = function (mode) {
        if (mode === "new")
            return this.newAfterSave;
        else if (mode === "edit")
            return this.continueAfterSave;
        else if (mode === "view")
            return this.viewAfterSave;
        else if (mode === "close")
            return this.closeAfterSave;
    };

    this.initPrintMenu = function () {
        //test data hardcoded
        //$("#webformprint-selbtn .selectpicker").append(`<option data-token="hairocraft_stagging-hairocraft_stagging-3-424-527-424-527" data-title="Document 1">Document 1</option>`);
        //$("#webformprint-selbtn .selectpicker").append(`<option data-token="hairocraft_stagging-hairocraft_stagging-3-425-528-425-528" data-title="Document 2">Document 2</option>`);

        //$("#webformprint-selbtn .selectpicker").selectpicker({ iconBase: 'fa', tickIcon: 'fa-check' });
        //$("#webformprint-selbtn").on("click", ".dropdown-menu li", this.printDocument.bind(this));
        if (this.FormObj.PrintDoc && this.FormObj.PrintDoc !== '') {
            $("#webformprint").attr('data-refid', this.FormObj.PrintDoc);
            $("#webformprint").on("click", this.printDocument.bind(this));
        }
    };

    this.printDocument = function () {
        //let rptRefid = $("#webformprint-selbtn .selectpicker").find("option:selected").attr("data-token");
        let rptRefid = $("#webformprint").attr('data-refid');
        $("#iFramePdf").attr("src", "/WebForm/GetPdfReport?refId=" + rptRefid + "&rowId=" + this.rowId);
        $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#WebForm-cont" } });
    };

    this.init = function () {
        this.setHeader(this.mode);
        $('[data-toggle="tooltip"]').tooltip();// init bootstrap tooltip
        $("[eb-form=true]").on("submit", function () { event.preventDefault(); });
        $("#webformsave-selbtn").on("click", ".dropdown-menu li", this.saveSelectChange);
        $("#webformsave-selbtn .selectpicker").selectpicker({ iconBase: 'fa', tickIcon: 'fa-check' });

        this.$saveBtn.on("click", this.saveForm.bind(this));
        this.$deleteBtn.on("click", this.deleteForm.bind(this));
        this.$cancelBtn.on("click", this.cancelForm.bind(this));
        this.$editBtn.on("click", this.SwitchToEditMode.bind(this));
        this.$auditBtn.on("click", this.GetAuditTrail.bind(this));
        this.$closeBtn.on("click", function () { window.parent.closeModal(); });
        $("body").on("focus", "[ui-inp]", function () {
            if (event && event.target)
                $(event.target).select();
        });
        $(window).off("keydown").on("keydown", this.windowKeyDown);
        this.initWebFormCtrls();

        this.initPrintMenu();

        this.afterSaveAction = this.getAfterSaveActionFn(getKeyByVal(EbEnums.WebFormAfterSaveModes, this.FormObj.FormModeAfterSave.toString()).split("_")[0].toLowerCase());

        if (this.Mode.isNew && this.EditModeFormData)
            this.setEditModeCtrls();

        if (this.mode === "View Mode") {
            this.setEditModeCtrls();
            this.SwitchToViewMode();

            let ol = store.get("Eb_Loc-" + this.userObject.CId + this.userObject.UserId).toString();
            let nl = _formData.MultipleTables[_formData.MasterTable][0].LocId.toString();
            if (ol !== nl) {
                EbDialog("show", {
                    Message: "Switching from " + getObjByval(ebcontext.locations.Locations, "LocId", ol).LongName + " to " + getObjByval(ebcontext.locations.Locations, "LocId", nl).LongName,
                    Buttons: {
                        "Ok": {
                            Background: "green",
                            Align: "right",
                            FontColor: "white;"
                        }
                    },
                    CallBack: function (name) {
                        ebcontext.locations.SwitchLocation(_formData.MultipleTables[_formData.MasterTable][0].LocId);
                        this.setHeader(this.mode);
                    }.bind(this)
                });
            }

        }

        ebcontext.locations.Listener.ChangeLocation = function (o) {
            if (this.rowId > 0) {
                EbDialog("show", {
                    Message: "This data is no longer available in " + o.LongName + ". Redirecting to new mode...",
                    Buttons: {
                        "Ok": {
                            Background: "green",
                            Align: "right",
                            FontColor: "white;"
                        }
                    },
                    CallBack: function (name) {
                        reloadFormPage();
                    }.bind(this)
                });
            }
        }.bind(this);
    };

    this.init();
};