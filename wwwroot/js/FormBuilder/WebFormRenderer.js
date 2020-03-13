/*!
* WebFormRender.js
* to Render WebForm
* EXPRESSbase Systems Pvt. Ltd , Jith Job
*/
var a___builder = 0;
var a___MT = 0;

const WebFormRender = function (option) {
    ebcontext.renderContext = "WebForm";
    this.FormObj = option.formObj;
    this.$form = $(`#${this.FormObj.EbSid}`);
    this.$saveBtn = $('#' + option.headerBtns['Save']);
    this.$deleteBtn = $('#' + option.headerBtns['Delete']);
    this.$editBtn = $('#' + option.headerBtns['Edit']);
    this.$cancelBtn = $('#' + option.headerBtns['Cancel']);
    this.$auditBtn = $('#' + option.headerBtns['AuditTrail']);
    this.$closeBtn = $('#' + option.headerBtns['Close']);
    this.$cloneBtn = $('#webformclone');
    this.Env = option.env;
    this.Cid = option.cid;
    this.initControls = new InitControls(this);
    //this.editModeObj = option.editModeObj;
    this.formRefId = option.formRefId || "";
    this.rowId = option.rowId;
    this.mode = option.mode;
    this.userObject = option.userObject;
    this.cloneRowId = option.cloneRowId;
    this.isOpenedInCloneMode = !!option.cloneRowId;
    this.isPartial = option.isPartial;//value is true if form is rendering in iframe
    this.headerObj = option.headerObj;//EbHeader
    this.formPermissions = option.formPermissions;
    this.formDataWrapper = option.formData;
    this.formData = option.formData === null ? null : option.formData.FormData;
    this.EditModeFormData = this.formData === null ? null : this.formData.MultipleTables;//EditModeFormData
    this.FormDataExtended = this.formData === null ? null : this.formData.ExtendedTables;
    this.TableNames;
    this.DisableDeleteData = this.formData === null ? {} : this.formData.DisableDelete;
    this.DisableCancelData = this.formData === null ? {} : this.formData.DisableCancel;
    this.FormDataExtdObj = { val: this.FormDataExtended };
    this.Mode = { isEdit: this.mode === "Edit Mode", isView: this.mode === "View Mode", isNew: this.mode === "New Mode" };// to pass by reference
    this.flatControls = getFlatCtrlObjs(this.FormObj);// here without functions
    this.FlatContControls = getInnerFlatContControls(this.FormObj);
    this.DataMODEL = this.EditModeFormData;
    this.MasterTable = this.FormObj.TableName;
    this.formValues = {};
    this.IsPSsInitComplete = {};
    this.formValidationflag = true;
    this.isEditModeCtrlsSet = false;
    this.DGBuilderObjs = {};
    this.uniqCtrlsInitialVals = {};
    this.PSsIsInit = {};
    this.isInitNCs = false;
    this.DynamicTabObject = null;
    this.TabControls = null;
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
        //if (this.Mode.isNew)
        //    this.FRC.setValueExpValsNC(this.flatControls); // issue with powerselect 'initializer' not set on load

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

    this.initReviewCtrl = function () {
        if (this.ReviewCtrl) {
            let opt = { Mode: this.Mode, formsaveFn: this.saveForm.bind(this), formObject: this.formObject, userObject: this.userObject, FormDataExtdObj: this.FormDataExtdObj, formObject_Full: this.FormObj, formRenderer: this };
            this.ApprovalCtrlBuilder = this.initControls.init(this.ReviewCtrl, opt);
        }
    };

    this.initDGs = function () {
        $.each(this.DGs, function (k, DG) {//dginit
            this.DGBuilderObjs[DG.Name] = this.initControls.init(DG, { Mode: this.Mode, formObject: this.formObject, userObject: this.userObject, FormDataExtdObj: this.FormDataExtdObj, formObject_Full: this.FormObj, formRefId: this.formRefId, formRenderer: this });
            this.DGBuilderObjs[DG.Name].MultipleTables = this.DataMODEL | [];
        }.bind(this));
    };

    this.initNCs = function () {
        $.each(this.flatControls, function (k, Obj) {
            let opt = {};
            if (Obj.ObjType === "PowerSelect" && !Obj.RenderAsSimpleSelect)
                opt.getAllCtrlValuesFn = this.getWebFormVals;
            else if (Obj.ObjType === "FileUploader") {
                opt.FormDataExtdObj = this.FormDataExtdObj;
                opt.DpControlsList = getFlatObjOfType(this.FormObj, "DisplayPicture");
            }
            else if (Obj.ObjType === "Date") {
                opt.source = "webform";
            }
            else if (Obj.ObjType === "ProvisionUser" || Obj.ObjType === "ProvisionLocation")
                opt.flatControls = this.flatControls;
            this.initControls.init(Obj, opt);
        }.bind(this));
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
        this.TabControls = getFlatContObjsOfType(this.FormObj, "TabControl");// all TabControl in the formObject
        let opts = {
            allTabCtrls: this.TabControls,
            formModel: _formData,
            initControls: this.initControls,
            mode: this.Mode,
            formObjectGlobal: this.formObject,
            userObject: this.userObject,
            formDataExtdObj: this.FormDataExtdObj,
            formObject_Full: this.FormObj,
            formRefId: this.formRefId,
            formRenderer: this
        };
        this.DynamicTabObject = new EbDynamicTab(opts);

        JsonToEbControls(this.FormObj);
        this.flatControls = getFlatCtrlObjs(this.FormObj);// here with functions
        this.formObject = {};// for passing to user defined functions
        this.SetWatchers();
        this.formObject.__mode = "new";// added a watcher to update form attribute

        this.PSs = getFlatObjOfType(this.FormObj, "PowerSelect");// all PSs in formObject
        this._allPSsInit = false;

        this.DGs = getFlatContObjsOfType(this.FormObj, "DataGrid");// all DGs in formObject
        //this.addApprovalMockDATAMODEL();
        this.ApprovalCtrl = getFlatContObjsOfType(this.FormObj, "Approval")[0];//Approval controls in formObject
        this.setFormObject();
        this.updateCtrlsUI();
        this.initNCs();// order 1
        this.FRC.bindEbOnChange2Ctrls(this.flatControls);// order 2
        this.FRC.bindFnsToCtrls(this.flatControls);// order 3
        this.initDGs();
        this.initReviewCtrl();


        //if (this.Mode.isNew)
        //    this.initDataMODEL();

        this.FRC.fireInitOnchangeNC(this.flatControls);

        $.each(this.DGs, function (k, DG) {
            let _DG = new ControlOps[DG.ObjType](DG);
            if (_DG.OnChangeFn.Code === null)
                _DG.OnChangeFn.Code = "";
            this.FRC.bindOnChange(_DG);
        }.bind(this));
    };

    this.addApprovalMockDATAMODEL = function () {
        if (!this.ReviewCtrl)
            return;
        this.DataMODEL[this.ReviewCtrl.TableName] = [
            {
                RowId: 1,
                LocId: 0,
                pId: null,
                IsUpdate: false,
                IsDelete: false,
                Columns: [
                    { Name: "stage_unique_id", Value: "Review1_approvalstage1", Type: 16, D: null, R: null, ObjType: "action_unique_id", F: "" },
                    { Name: "action_unique_id", Value: 1, Type: 16, D: null, R: null, ObjType: "action_unique_id", F: "" },
                    { Name: "eb_my_actions_id", Value: 1, Type: 16, D: null, R: null, ObjType: "TextBox", F: "" },
                    { Name: "comments", Value: "comments_111111", Type: 16, D: null, R: null, ObjType: "TextBox", F: "" },
                    { Name: "eb_created_at", Value: null, Type: 16, D: null, R: null, ObjType: "TextBox", F: "" },
                    { Name: "eb_created_by", Value: null, Type: 16, D: null, R: null, ObjType: "TextBox", F: "" }
                ]
            },
            {
                RowId: 2,
                LocId: 0,
                pId: null,
                IsUpdate: false,
                IsDelete: false,
                Columns: [
                    { Name: "stage_unique_id", Value: "Review1_approvalstage2", Type: 16, D: null, R: null, ObjType: "action_unique_id", F: "" },
                    { Name: "action_unique_id", Value: 1, Type: 16, D: null, R: null, ObjType: "action_unique_id", F: "" },
                    { Name: "eb_my_actions_id", Value: 1, Type: 16, D: null, R: null, ObjType: "TextBox", F: "" },
                    { Name: "comments", Value: "comments_222222", Type: 16, D: null, R: null, ObjType: "TextBox", F: "" },
                    { Name: "eb_created_at", Value: null, Type: 16, D: null, R: null, ObjType: "TextBox", F: "" },
                    { Name: "eb_created_by", Value: null, Type: 16, D: null, R: null, ObjType: "TextBox", F: "" }
                ]
            },
            {
                RowId: 0,
                LocId: 0,
                pId: null,
                IsUpdate: false,
                IsDelete: false,
                Columns: [
                    { Name: "stage_unique_id", Value: "Review1_approvalstage3", Type: 16, D: null, R: null, ObjType: "action_unique_id", F: "" },
                    { Name: "action_unique_id", Value: 1, Type: 16, D: null, R: null, ObjType: "action_unique_id", F: "" },
                    { Name: "eb_my_actions_id", Value: 1, Type: 16, D: null, R: null, ObjType: "TextBox", F: "" },
                    { Name: "comments", Value: "comments_33333", Type: 16, D: null, R: null, ObjType: "TextBox", F: "" },
                    { Name: "eb_created_at", Value: null, Type: 16, D: null, R: null, ObjType: "TextBox", F: "" },
                    { Name: "eb_created_by", Value: null, Type: 16, D: null, R: null, ObjType: "TextBox", F: "" }
                ]
            }]
    };

    DynamicTabPaneGlobals = null;//{ DG: 'this.ctrl', $tr: '$tr', action: 'action', event: 'event'};
    DynamicTabPane = function (args) {
        if (DynamicTabPaneGlobals === null) {
            console.log('Dynamic tab not supported. Please initiate from a data grid.');
            return;
        }
        let $initiatorDG = $("#cont_" + DynamicTabPaneGlobals.DG.EbSid);
        if ($initiatorDG.length === 0) {
            console.log('Dynamic tab not supported. Data grid not found. EbSid : ' + DynamicTabPaneGlobals.DG.EbSid);
            return;
        }
        let $initiatorTab = $initiatorDG.closest("[ctype=TabControl]");
        if ($initiatorTab.length === 0) {
            console.log('Dynamic tab not supported. Please initiate from a data grid placed in tab control.');
            return;
        }

        let DgCtrl = DynamicTabPaneGlobals.DG;
        let TabCtrl = getObjByval(this.TabControls, 'EbSid', $initiatorTab.attr("ebsid"));
        this.DynamicTabObject.initDynamicTabPane($.extend(args, { srcDgCtrl: DgCtrl, srcTabCtrl: TabCtrl, action: DynamicTabPaneGlobals.action }));
        DynamicTabPaneGlobals = null;
    }.bind(this);

    this.updateCtrlsUI = function () {
        let allFlatControls = [this.FormObj, ...getInnerFlatContControls(this.FormObj).concat(this.flatControls)];
        $.each(allFlatControls, function (k, Obj) {
            this.updateCtrlUI(Obj);
        }.bind(this));
    };

    this.psDataImport = function (PScontrol) {
        if (PScontrol.isEmpty())
            return;
        this.showLoader();
        $.ajax({
            type: "POST",
            //url: this.ssurl + "/bots",
            url: "/WebForm/ImportFormData",
            data: {
                _refid: this.formRefId,
                _rowid: this.rowId,
                _triggerctrl: PScontrol.Name,
                _params: [{ Name: PScontrol.Name, Value: PScontrol.getValue() }]
            },
            error: function (xhr, ajaxOptions, thrownError) {
                this.hideLoader();
                EbMessage("show", { Message: `Something Unexpected Occurred when tried to import data`, AutoHide: true, Background: '#aa0000' });
            }.bind(this),
            //beforeSend: function (xhr) {
            //    xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
            //}.bind(this),
            success: this.reloadForm.bind(this)
        });

    };

    // to add fetched values to data model 
    // parameter - _respObj : data model of imported data
    this.modifyFormData4Import = function (_respObj) {

        this.EditModeFormData = _respObj.FormData.MultipleTables;
        let editModeFormData = _respObj.FormData.MultipleTables;

        let SourceEditModeFormDataExceptDG = editModeFormData[this.FormObj.Name];

        for (let i = 0; i < this.flatControls.length; i++) {
            let ctrl = this.flatControls[i];
            let dataObj = getObjByval(SourceEditModeFormDataExceptDG[0].Columns, "Name", ctrl.Name);
            if (dataObj) {
                let val = dataObj.Value;
                ctrl.DataVals.Value = val;
            }
        }

    };

    this.reloadForm = function (_respObjStr) {// need cleanup
        this.hideLoader();
        let _respObj = JSON.parse(_respObjStr);
        console.log(_respObj);
        if (_respObj.Status === 200) {
            //this.modifyFormData4Import(_respObj);
            this.resetDataMODEL(_respObj);

            this.isEditModeCtrlsSet = false;
            this.setEditModeCtrls();
        }
        else
            console.error(_respObj.MessageInt);

    }.bind(this);

    this.resetDataMODEL = function (_respObj) {
        let editModeFormData = _respObj.FormData.MultipleTables;

        // DG = replace DG dataModel with  new one
        $.each(editModeFormData, function (tblName, Data) {
            if (tblName !== this.FormObj.TableName) {
                let DG = getObjByval(this.DGs, "TableName", tblName);
                if (!DG)
                    return true;
                let DGTblName = DG.TableName;
                delete this.EditModeFormData[tblName];
                this.EditModeFormData[DGTblName] = Data;
                this.DataMODEL[DGTblName] = Data;
            }
        }.bind(this));




        //this.EditModeFormData = _respObj.FormData.MultipleTables;
        //this.DataMODEL = this.EditModeFormData;
    };

    //this.removeRowIds = function () {

    //};

    //this.unbindUniqueCheck = function (control) {
    //    $("#" + control.EbSid_CtxId).off("blur.dummyNameSpace");
    //};

    this.getWebFormVals = function () {
        return getValsFromForm(this.FormObj);
    }.bind(this);

    this.setNCCSingleColumns = function (NCCSingleColumns_flat_editmode_data) {
        $.each(NCCSingleColumns_flat_editmode_data, function (i, SingleColumn) {
            let val = SingleColumn.Value;

            if (SingleColumn.Name === "id")
                return true;
            if (val === null)
                return true;

            let ctrl = getObjByval(this.flatControls, "Name", SingleColumn.Name);
            if (ctrl.isDataImportCtrl)// to skip if call comes from data import function
                return true;
            ctrl.__eb_EditMode_val = val;
            if (ctrl.ObjType === "PowerSelect" && !ctrl.RenderAsSimpleSelect) {
                //ctrl.setDisplayMember = EBPSSetDisplayMember;
                ctrl.setDisplayMember(val);
            }
            else
                ctrl.setValue(val);
        }.bind(this));
        this.isInitNCs = true;
    };

    this.getNCCTblNames = function () {
        let NCCTblNames = [];
        let FlatContControls = getFlatContControls(this.FormObj);
        $.each(FlatContControls, function (i, CC) {
            let TableName = CC.TableName.trim();
            if (!CC.IsSpecialContainer && TableName !== '' && !NCCTblNames.includes(TableName))
                NCCTblNames.push(TableName);
        });
        return NCCTblNames;
    };

    this.getNCCSingleColumns_flat = function (EditModeFormData, NCCTblNames) {
        let NCCSingleColumns_flat = [];
        $.each(NCCTblNames, function (i, TblName) {
            try {
                let SingleRowColums = EditModeFormData[TblName][0].Columns;
                NCCSingleColumns_flat = NCCSingleColumns_flat.concat(SingleRowColums);
            }
            catch (e) {
                console.log(e.message);
            }
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
        let NCCTblNames = this.getNCCTblNames();
        //let DGTblNames = this.getSCCTblNames(EditModeFormData, "DataGrid");
        for (let DGName in this.DGBuilderObjs) {
            let DGB = this.DGBuilderObjs[DGName];
            if (!this.DataMODEL.hasOwnProperty(DGB.ctrl.TableName)) {
                this.DataMODEL[DGB.ctrl.TableName] = [];
                DGB.DataMODEL = this.DataMODEL[DGB.ctrl.TableName];
                continue;
            }
            //let DataMODEL = EditModeFormData[DGB.ctrl.TableName];
            let DataMODEL = this.DataMODEL[DGB.ctrl.TableName];
            DGB.setEditModeRows(DataMODEL);
        }

        //if (this.ApprovalCtrl.__ready) {
        //let DataMODEL = EditModeFormData[this.ApprovalCtrl.TableName];
        //this.ApprovalCtrl.setEditModeRows(DataMODEL);
        //}

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
        if (this.ReviewCtrl) {
            let tOb = this.ReviewCtrl.ChangedRowObject();
            if (tOb)
                FVWTObjColl[this.ReviewCtrl.TableName] = tOb;
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

    //this.ProcRecurForDataModels = function (src_obj, FVWTObjColl) {
    //    $.each(src_obj.Controls.$values, function (i, obj) {
    //        if (obj.IsContainer) {
    //            if (obj.IsSpecialContainer)
    //                return true;
    //            if (obj.TableName === "" || obj.TableName === null)
    //                obj.TableName = src_obj.TableName;
    //            if (FVWTObjColl[obj.TableName] === undefined) {
    //                let rowId = this.Mode.isEdit ? (this.EditModeFormData[obj.TableName] ? this.EditModeFormData[obj.TableName][0].RowId : 0) : 0;
    //                FVWTObjColl[obj.TableName] = [{
    //                    RowId: rowId,
    //                    IsUpdate: false,
    //                    Columns: []
    //                }];
    //            }
    //            this.ProcRecurForDataModels(obj, FVWTObjColl);
    //        }
    //        else if (obj.ObjType !== "FileUploader") {
    //            FVWTObjColl[src_obj.TableName][0].Columns.push(getSingleColumn(obj));
    //        }
    //    }.bind(this));

    //};

    //this.getForm_dataModels = function () {
    //    let FormDataModels = {};
    //    FormDataModels[this.FormObj.TableName] = [{
    //        RowId: this.rowId,
    //        IsUpdate: false,
    //        Columns: []
    //    }];
    //    this.ProcRecurForDataModels(this.FormObj, FormDataModels);
    //    return FormDataModels;
    //};

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


        //WebformData.MultipleTables = $.extend(formTables, gridTables, approvalTable);
        this.DynamicTabObject.updateDataModel();
        WebformData.MultipleTables = this.formateDS(this.DataMODEL);
        //$.extend(WebformData.MultipleTables, this.formateDS(this.DynamicTabObject.getDataModels()));
        WebformData.ExtendedTables = this.getExtendedTables();
        console.log("form data --");


        //console.log("old data --");
        //console.log(JSON.stringify(WebformData.MultipleTables));

        console.log("new data --");
        console.log(JSON.stringify(this.formateDS(this.DataMODEL)));
        return JSON.stringify(WebformData);
    };

    this.formateDS = function (_multipleTables) {
        let multipleTables = $.extend(true, {}, _multipleTables);
        let tableNames = Object.keys(multipleTables);
        for (let i = 0; i < tableNames.length; i++) {
            let tableName = tableNames[i];
            let table = multipleTables[tableName];
            for (let j = 0; j < table.length; j++) {
                let row = table[j];
                let columns = row.Columns;
                for (let k = 0; k < columns.length; k++) {
                    let singleColumn = columns[k];
                    delete singleColumn["D"];
                    delete singleColumn["F"];
                    delete singleColumn["R"];
                    delete singleColumn["ValueExpr_val"];
                    delete singleColumn["DisplayMember"];
                }
            }
        }
        return multipleTables;
    };

    this.getCellObjFromEditModeObj = function (ctrl, formData) {
        let CellObj;
        for (let i = 0; i < this.TableNames.length; i++) {
            let tableName = this.TableNames[i];
            CellObj = getObjByval(formData[tableName][0].Columns, "Name", ctrl.Name);
            if (CellObj)
                return CellObj;
        }

        return CellObj;
    };

    this.RefreshOuterFormControls = function (formData) {
        for (let i = 0; i < this.flatControls.length; i++) {
            let ctrl = this.flatControls[i];
            let cellObj = this.getCellObjFromEditModeObj(ctrl, formData);
            if (ctrl.ObjType === "AutoId" && this.isOpenedInCloneMode)
                continue;
            if (cellObj !== undefined)
                ctrl.reset(cellObj.Value);
            else
                ctrl.clear();
        }
    };

    this.RefreshDGControlValues = function (formData) {
        for (let DGName in this.DGBuilderObjs) {
            let DGB = this.DGBuilderObjs[DGName];
            let DataMODEL = formData[DGB.ctrl.TableName];
            if (DataMODEL)
                DGB.resetControlValues(DataMODEL);
            else
                DGB.clearDG();
        }
    };

    this.RefreshFormControlValues = function (formData) {
        this.RefreshOuterFormControls(formData);
        this.RefreshDGControlValues(formData);
    };

    this.saveSuccess = function (_respObj) {
        this.hideLoader();
        let respObj = JSON.parse(_respObj);
        ebcontext._formSaveResponse = respObj;

        if (respObj.Status === 200) {
            if (_renderMode === 3) {
                EbMessage("show", { Message: "Sign up success. Plaese check mail to login ", AutoHide: false, Background: '#00aa00' });
                setTimeout(function () {
                    ebcontext.setup.ss.onLogOutMsg();
                }, 3000);
                return;
            }

            respObj.FormData = JSON.parse(respObj.FormData);
            let locName = ebcontext.locations.CurrentLocObj.LongName;
            let formName = this.FormObj.DisplayName;
            if (this.rowId > 0)
                EbMessage("show", { Message: "Edited " + formName + " from " + locName, AutoHide: true, Background: '#00aa00' });
            else
                EbMessage("show", { Message: "New " + formName + " entry in " + locName + " created", AutoHide: true, Background: '#00aa00' });
            this.rowId = respObj.RowId;
            this.EditModeFormData = respObj.FormData.MultipleTables;
            this.DataMODEL = this.EditModeFormData;
            a___MT = this.DataMODEL;
            attachModalCellRef_form(this.FormObj, this.DataMODEL);

            this.FormDataExtdObj.val = respObj.FormData.ExtendedTables;
            this.FormDataExtended = respObj.FormData.ExtendedTables;
            this.DynamicTabObject.disposeDynamicTab();
            this.RefreshFormControlValues(this.EditModeFormData);
            this.afterSaveAction();
            //window.parent.closeModal();
        }
        else if (respObj.Status === 403) {
            EbMessage("show", { Message: "Access denied to update this data entry!", AutoHide: true, Background: '#aa0000' });
        }
        else {
            EbMessage("show", { Message: respObj.Message, AutoHide: true, Background: '#aa0000' });
            console.error(respObj.MessageInt);
        }
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

    //this.IsDGsHavePartialEntry = function () {
    //    let IsDGsHavePartialEntry = false;
    //    $.each(this.DGBuilderObjs, function (k, DGB) {
    //        if (!DGB.isCurRowEmpty()) {
    //            IsDGsHavePartialEntry = true;
    //            return false;
    //        }
    //    }.bind(this));
    //    return IsDGsHavePartialEntry;
    //};

    this.IsDGsHaveActiveRows = function () {
        let hasActiveRows = false;
        $.each(this.DGBuilderObjs, function (k, DGB) {
            if (DGB.hasActiveRow()) {
                hasActiveRows = true;
                return false;
            }
        }.bind(this));
        return hasActiveRows;
    };

    this.DGsB4Save = function () {
        if (this.IsDGsHaveActiveRows()) {
            EbDialog("show", {
                Message: "Please commit or delete uncommited rows",
                //Buttons: {
                //    "Yes": {
                //        Background: "green",
                //        Align: "right",
                //        FontColor: "white;"
                //    },
                //    "No": {
                //        Background: "red",
                //        Align: "left",
                //        FontColor: "white;"
                //    }
                //},
                //CallBack: this.dialogboxAction.bind(this)
            });
            return false;
        }
        else
            return true;
    };

    this.dialogboxAction = function (value) {
        if (value === "Yes")
            this.saveForm_call();
    };

    this.DGsB4SaveActions = function () {
        $.each(this.DGBuilderObjs, function (k, DGB) {
            DGB.B4saveActions();
        }.bind(this));

    };

    this.cloneForm = function () {
        window.open("index?refid=" + this.formRefId + "&mode=clone&rowid=" + this.rowId);
    };

    this.saveForm = function () {
        this.BeforeSave();

        setTimeout(function () {// temp
            if (!this.FRC.AllRequired_valid_Check())
                return;
            if (!this.isAllUniqOK())
                return;
            if (!this.DGsB4Save())
                return;
            this.DGsB4SaveActions();

            this.saveForm_call();
        }.bind(this), 2);
    };

    this.saveForm_call = function () {
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
        this.$cloneBtn.show(200);
        this.formObject.__mode = "view";
        this.Mode.isView = true;
        this.Mode.isEdit = false;
        this.Mode.isNew = false;
        this.setHeader("View Mode");
        this.BeforeModeSwitch("View Mode");
        this.flatControls = getFlatCtrlObjs(this.FormObj);// here re-assign objectcoll with functions
        this.setEditModeCtrls();

        if (this.ReviewCtrl && this.DataMODEL.hasOwnProperty(this.ReviewCtrl.TableName)) {
            let DataMODEL = this.DataMODEL[this.ReviewCtrl.TableName];
            this.ReviewCtrl._Builder.switch2viewMode(DataMODEL);
            //let DataMODEL = EditModeFormData[this.ApprovalCtrl.TableName];
            //this.ApprovalCtrl.setEditModeRows(DataMODEL);
        }

        //    this.ApprovalCtrl.disableAllCtrls();
        $.each(this.flatControls, function (k, ctrl) {
            ctrl.disable();
        }.bind(this));
        $.each(this.DGs, function (k, DG) {
            this.DGBuilderObjs[DG.Name].SwitchToViewMode();
        }.bind(this));
        this.DynamicTabObject.switchToViewMode();
    };

    this.SwitchToEditMode = function () {
        this.$cloneBtn.hide(200);
        this.formObject.__mode = "edit";
        this.Mode.isEdit = true;
        this.Mode.isView = false;
        this.Mode.isNew = false;
        if (this.ReviewCtrl) {
            this.ReviewCtrl._Builder.switch2editMode();
            if (!this.ReviewCtrl._Builder.isFormDataEditable)
                return;
        }
        this.setEditModeCtrls();
        //    this.ApprovalCtrl.enableAccessibleRow(this.DataMODEL[this.ApprovalCtrl.TableName]);
        this.BeforeModeSwitch("Edit Mode");
        this.setHeader("Edit Mode");
        this.flatControls = getFlatCtrlObjs(this.FormObj);// here re-assign objectcoll with functions
        $.each(this.flatControls, function (k, ctrl) {
            if (!ctrl.IsDisable)
                ctrl.enable();
            if (ctrl.Unique)
                this.uniqCtrlsInitialVals[ctrl.EbSid] = ctrl.getValue();

        }.bind(this));
        this.DynamicTabObject.switchToEditMode();
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
        this.headerObj.hideElement(["webformsave-selbtn", "webformnew", "webformedit", "webformdelete", "webformcancel", "webformaudittrail", "webformclose", "webformprint-selbtn"]);

        if (this.isPartial === "True") {
            if ($(".objectDashB-toolbar").find(".pd-0:first-child").children("#switch_loc").length > 0) {
                $(".objectDashB-toolbar").find(".pd-0:first-child").children("#switch_loc").remove();
                $(".objectDashB-toolbar").find(".pd-0:first-child").children(".solution_logo_cont").remove();
                $(".objectDashB-toolbar").find(".pd-0:nth-child(2)").find(".form-group").remove();
                $("#quik_menu").remove();
            }
            this.headerObj.showElement(["webformclose"]);
        }

        this.mode = reqstMode;//
        //reqstMode = "Edit Mode" or "New Mode" or "View Mode"
        if (reqstMode === "Edit Mode") {
            this.headerObj.showElement(this.filterHeaderBtns(["webformnew", "webformsave-selbtn", "webformaudittrail"], currentLoc, reqstMode));
        }
        else if (reqstMode === "New Mode" || reqstMode === "Prefill Mode") {
            this.headerObj.showElement(this.filterHeaderBtns(["webformsave-selbtn"], currentLoc, reqstMode));
        }
        else if (reqstMode === "View Mode") {
            this.headerObj.showElement(this.filterHeaderBtns(["webformnew", "webformedit", "webformdelete", "webformcancel", "webformaudittrail", "webformprint-selbtn"], currentLoc, reqstMode));
        }
        else if (reqstMode === "Fail Mode") {
            EbMessage("show", { Message: 'Error in loading data !', AutoHide: false, Background: '#aa0000' });
            console.error(this.formDataWrapper.Message);
        }
        else if (reqstMode === "Preview Mode") {
            this.mode = "New Mode";////////////
        }

        let title_val = '';
        try {
            if (_formObj.TitleExpression && _formObj.TitleExpression.Code && _formObj.TitleExpression.Code !== '') {
                if (this.formObject) {
                    title_val = " - " + new Function("form", "user", atob(_formObj.TitleExpression.Code)).bind('', this.formObject, ebcontext.user)();
                }
            }
        }
        catch (e) { console.log("Error in title expression  " + e.message); }
        this.headerObj.setName(_formObj.DisplayName + title_val);
        let rMode = reqstMode === 'Prefill Mode' ? 'New Mode' : reqstMode;
        this.headerObj.setMode(`<span mode="${reqstMode}" class="fmode">${rMode}</span>`);
        $('title').text(this.FormObj.DisplayName + title_val + `(${rMode})`);

        if (this.isPartial === "True") {
            this.headerObj.hideElement(["webformnew", "webformdelete", "webformcancel", "webformaudittrail"]);
        }
    };

    this.filterHeaderBtns = function (btns, loc, mode) {
        let r = [];
        // ["webformsave-selbtn", "webformnew", "webformedit", "webformdelete", "webformcancel", "webformaudittrail"];
        // ["New", "View", "Edit", "Delete", "Cancel", "AuditTrail"]
        for (let i = 0; i < btns.length; i++) {
            if (btns[i] === "webformsave-selbtn" && this.formPermissions[loc].indexOf('New') > -1 && (mode === 'New Mode' || mode === 'Prefill Mode'))
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
            else if (btns[i] === "webformprint-selbtn" && mode === 'View Mode' && this.FormObj.PrintDocs && this.FormObj.PrintDocs.$values.length > 0)
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
        if (this.FormObj.PrintDocs && this.FormObj.PrintDocs.$values.length > 0) {
            let $sel = $("#webformprint-selbtn .selectpicker");
            for (let i = 0; i < this.FormObj.PrintDocs.$values.length; i++) {
                let tle = this.FormObj.PrintDocs.$values[i].Title || this.FormObj.PrintDocs.$values[i].ObjDisplayName;
                $sel.append(`<option data-token="${this.FormObj.PrintDocs.$values[i].ObjRefId}" data-title="${tle}">${tle}</option>`);
            }
            //test data hardcoded
            //$("#webformprint-selbtn .selectpicker").append(`<option data-token="hairocraft_stagging-hairocraft_stagging-3-424-527-424-527" data-title="Document 1">Document 1</option>`);
            //$("#webformprint-selbtn .selectpicker").append(`<option data-token="hairocraft_stagging-hairocraft_stagging-3-425-528-425-528" data-title="Document 2">Document 2</option>`);

            $sel.selectpicker({ iconBase: 'fa', tickIcon: 'fa-check' });
            $("#webformprint-selbtn").on("click", ".dropdown-menu li", this.printDocument.bind(this));
            $("#webformprint").on("click", function () { this.printDocument(); }.bind(this));
        }

        //if (this.FormObj.PrintDoc && this.FormObj.PrintDoc !== '') {
        //    $("#webformprint").attr('data-refid', this.FormObj.PrintDoc);
        //    $("#webformprint").on("click", this.printDocument.bind(this));
        //}
    };

    this.printDocument = function () {
        let rptRefid = $("#webformprint-selbtn .selectpicker").find("option:selected").attr("data-token");
        //let rptRefid = $("#webformprint").attr('data-refid');
        $("#iFramePdf").attr("src", "/WebForm/GetPdfReport?refId=" + rptRefid + "&rowId=" + this.rowId);
        $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#WebForm-cont" } });
    };

    //this.initDataMODEL = function () {
    //    this.DataMODEL = {};
    //    this.FormDataModels = this.getForm_dataModels();
    //    this.gridTables = this.getDG_tbl();
    //    if (this.ApprovalCtrl)
    //        this.approvalTable = this.getApprovalRow();

    //    this.DataMODEL = $.extend(this.FormDataModels, this.gridTables, this.approvalTable);
    //    console.log("form data --");
    //    console.log(this.DataMODEL);

    //};


    //this.getDG_tbl = function () {
    //    let DG_dataModels = {};
    //    $.each(this.DGBuilderObjs, function (i, DGB) {
    //        DGB.DataMODEL = [];
    //        DG_dataModels[DGB.ctrl.TableName] = DGB.DataMODEL;
    //    });
    //    return DG_dataModels;
    //};

    this.LocationInit = function () {
        if (ebcontext.locations.Listener) {
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
        }
    };

    this.locInit4viewMode = function () {
        let ol = store.get("Eb_Loc-" + this.userObject.CId + this.userObject.UserId).toString();
        let nl = this.formData.MultipleTables[this.formData.MasterTable][0].LocId.toString();
        if (ol !== nl) {
            let odlocO = getObjByval(ebcontext.locations.Locations, "LocId", ol);
            let nwlocO = getObjByval(ebcontext.locations.Locations, "LocId", nl);
            if (typeof nwlocO === "undefined") {
                console.error("Unknown location id found. LocId = " + nl);
                EbDialog("show", {
                    Message: "This data is no longer available in " + odlocO.LongName + ". Redirecting to new mode...",
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
            else {
                EbMessage("show", { Message: `Switching from ${odlocO.LongName} to ${nwlocO.LongName}`, AutoHide: true, Background: '#0000aa', Delay: 3000 });
                ebcontext.locations.SwitchLocation(this.formData.MultipleTables[this.formData.MasterTable][0].LocId);
                this.setHeader(this.mode);
                //EbDialog("show", {
                //    Message: "Switching from " + odlocO.LongName + " to " + nwlocO.LongName,
                //    Buttons: {
                //        "Ok": {
                //            Background: "green",
                //            Align: "right",
                //            FontColor: "white;"
                //        }
                //    },
                //    CallBack: function (name) {
                //        ebcontext.locations.SwitchLocation(this.formData.MultipleTables[this.formData.MasterTable][0].LocId);
                //        this.setHeader(this.mode);
                //    }.bind(this)
                //});
            }
        }
    };

    this.bindEventFns = function () {
        $("[eb-form=true]").on("submit", function () { event.preventDefault(); });
        $("#webformsave-selbtn").on("click", ".dropdown-menu li", this.saveSelectChange);
        $("#webformsave-selbtn .selectpicker").selectpicker({ iconBase: 'fa', tickIcon: 'fa-check' });

        this.$saveBtn.on("click", this.saveForm.bind(this));
        this.$deleteBtn.on("click", this.deleteForm.bind(this));
        this.$cancelBtn.on("click", this.cancelForm.bind(this));
        this.$editBtn.on("click", this.SwitchToEditMode.bind(this));
        this.$auditBtn.on("click", this.GetAuditTrail.bind(this));
        this.$closeBtn.on("click", function () { window.parent.closeModal(); });
        this.$cloneBtn.on("click", this.cloneForm.bind(this));
        //$("body").on("blur", "[ui-inp]", function () {
        //    window.justbluredElement = event.target;
        //});
        $("body").on("focus", "[ui-inp]", function () {
            let el = event.target;
            if (event && event.target &&
                !(el.getAttribute("type") === "search" &&
                    ($(el).closest("[ctype='PowerSelect']").length === 1 || $(el).closest("[tdcoltype='DGPowerSelectColumn']").length === 1)))
                $(event.target).select();
        });

        //$("body").on("focus", "[ui-inp]", function () {
        //    let el = event.target;
        //    if (event && el) {
        //        if (el.getAttribute("type") === "search" && window.justbluredElement !== el && $(el).closest("[ctype='PowerSelect']").length === 1)
        //            $(event.target).select();
        //    }
        //});
        $(window).off("keydown").on("keydown", this.windowKeyDown);
    };

    this.setMode = function () {
        this.Mode.isView = false;
        this.Mode.isEdit = false;
        this.Mode.isNew = false;
        this.Mode.isPrefill = false;
        this.Mode.isFail = false;
        this.Mode.isPreview = false;

        if (this.mode === "View Mode")
            this.Mode.isView = true;
        else if (this.mode === "New Mode")
            this.Mode.isNew = true;
        else if (this.mode === "Fail Mode")
            this.Mode.isFail = true;
        else if (this.mode === "Edit Mode")
            this.Mode.isEdit = true;
        else if (this.mode === "Prefill Mode")
            this.Mode.isPrefill = true;
        else if (this.mode === "Preview Mode")
            this.Mode.isPreview = true;
    };
    this.resetRowIds = function (multipleTables) {
        multipleTables[this.MasterTable][0].RowId = 0;// foem data

        $.each(this.DGBuilderObjs, function (k, DGB) { // all dg datas
            let rows = multipleTables[DGB.ctrl.TableName];
            let i = 0;
            for (i = 0; i < rows.length; i++) {
                let row = rows[i];
                row.RowId = -(i + 1);
            }
            DGB.cloneMode = true;
        }.bind(this));

    };

    this.fillCloneData = function (rowId) {
        this.showLoader();
        $.ajax({
            type: "POST",
            url: "/WebForm/getRowdata",
            data: {
                refid: this.formRefId, rowid: parseInt(rowId)
            },
            error: function (xhr, ajaxOptions, thrownError) {
                this.hideLoader();
                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
            }.bind(this),
            success: function (_respObjStr) {
                this.hideLoader();
                let _respObj = JSON.parse(_respObjStr);
                if (_respObj.Status === 200) {
                    this.resetRowIds(_respObj.FormData.MultipleTables);
                    this.resetDataMODEL(_respObj);
                    this.RefreshFormControlValues(_respObj.FormData.MultipleTables);
                }
                else
                    console.error(_respObj.MessageInt);
                this.hideLoader();
            }.bind(this)
        });
    };

    this.CheckSubmitButton = function () {
        let btn = getFlatObjOfType(this.FormObj, "SubmitButton");
        if (btn && btn.length > 0) {
            $('#webformsave-selbtn').remove();
            this.$saveBtn = $('#webformsave');
        }
    };

    this.init = function () {
        if (this.formDataWrapper.Status !== 200) {
            $("body").empty().html(this.formDataWrapper.Message);

            if (this.formDataWrapper.Status === 401)
                window.location.replace(`../statuscode/${this.formDataWrapper.Status}`);

            return;
        }


        this.CheckSubmitButton();
        this.TableNames = this.getNCCTblNames();
        this.ReviewCtrl = getFlatContObjsOfType(this.FormObj, "Review")[0];//Approval controls in formObject
        this.setHeader(this.mode);
        $('[data-toggle="tooltip"]').tooltip();// init bootstrap tooltip
        this.bindEventFns();
        attachModalCellRef_form(this.FormObj, this.DataMODEL);
        this.initWebFormCtrls();
        this.initPrintMenu();
        this.afterSaveAction = this.getAfterSaveActionFn(getKeyByVal(EbEnums.WebFormAfterSaveModes, this.FormObj.FormModeAfterSave.toString()).split("_")[0].toLowerCase());
        this.setMode();


        //if (this.Mode.isNew && this.EditModeFormData)
        //    this.setEditModeCtrls();
        if (this.Mode.isPrefill)
            this.setEditModeCtrls();

        else if (this.Mode.isNew) {
            this.FRC.setDefaultvalsNC(this.flatControls);
            if (this.ReviewCtrl)
                this.ApprovalCtrlBuilder.hide();
            if (this.cloneRowId)
                this.fillCloneData(this.cloneRowId);
        }
        //else {
        //    this.DataMODEL = this.EditModeFormData;
        //}

        if (this.Mode.isView) {
            this.setEditModeCtrls();// should remove
            this.SwitchToViewMode();
            this.locInit4viewMode();
        }
        this.LocationInit();

        //if (this.Mode.isNew) {
        //    this.FRC.populateDateCtrlsWithInitialVal(this.FormObj);
        //    this.FRC.populateRGCtrlsWithInitialVal(this.FormObj);
        //    this.FRC.populateSSCtrlsWithInitialVal(this.FormObj);
        //    this.FRC.populateSysLocCtrlsWithInitialVal(this.FormObj);
        //    this.FRC.populateCheckBoxCtrlsWithInitialVal(this.FormObj);
        //}
    };

    let t0 = performance.now();

    this.showLoader();
    this.init();
    this.hideLoader();

    let t1 = performance.now();
    console.dev_log("WebFormRender : init() took " + (t1 - t0) + " milliseconds.");

    window.onbeforeunload = function (e) {
        if (this.Mode.isEdit) {
            var dialogText = 'Changes you made may not be saved.';
            e.returnValue = dialogText;
            return dialogText;
        }
    }.bind(this);

    a___builder = this;
    a___MT = this.DataMODEL;
    a___EO = this.EditModeFormData;
};