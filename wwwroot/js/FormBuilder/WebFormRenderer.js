const WebFormRender = function (option) {
    this.FormObj = option.formObj;
    this.$saveBtn = option.$saveBtn;
    this.initControls = new InitControls(this);
    this.editModeObj = option.editModeObj;
    this.formRefId = option.formRefId || "";
    this.isEditMode = !!this.editModeObj;
    this.flatControls = getFlatCtrlObjs(this.FormObj);// here without functions
    this.formValues = {};
    this.rowId = 0;
    this.formValidationflag = true;
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
                        if (cObj.ObjType === "TableLayout" || cObj.ObjType === "GroupBox")
                            EbOnChangeUIfns[NS1][NS2](cObj.EbSid_CtxId, cObj);
                        else
                            EbOnChangeUIfns[NS1][NS2]("cont_" + cObj.EbSid_CtxId, cObj);
                    }
                    catch (e) {
                        alert(e.message);
                    }
                }
            }
        });
    };

    this.init = function () {
        $('[data-toggle="tooltip"]').tooltip();// init bootstrap tooltip
        this.$saveBtn.on("click", this.saveForm.bind(this));
        this.initWebFormCtrls();
        if (this.isEditMode)
            this.flatControls = getFlatCtrlObjs(this.FormObj);// here re-assign objectcoll with functions
        let allFlatControls = getInnerFlatContControls(this.FormObj).concat(this.flatControls);
        $.each(allFlatControls, function (k, Obj) {
            this.updateCtrlUI(Obj);
        }.bind(this));
    };

    this.initWebFormCtrls = function () {
        JsonToEbControls(this.FormObj);
        this.flatControls = getFlatCtrlObjs(this.FormObj);// here with functions
        $.each(this.flatControls, function (k, Obj) {
            let opt = {};
            if (Obj.ObjType === "PowerSelect")
                opt.getAllCtrlValuesFn = this.getWebFormVals;
            this.initControls.init(Obj, opt);
            if (Obj.Required)
                this.bindRequired(Obj);
            if (Obj.Unique)
                this.bindUniqueCheck(Obj);
            if (Obj.Validators.$values.length > 0)
                this.bindValidators(Obj);

        }.bind(this));
        // temp
        this.DGs = getFlatObjOfType(this.FormObj, "DataGrid");
        $.each(this.DGs, function (k, DG) {
            this.initControls.init(DG, { isEditMode: this.isEditMode });
        }.bind(this));

        if (this.isEditMode)
            this.populateControls();
    };

    this.bindValidators = function (control) {
        $("#" + control.EbSid_CtxId).on("blur", this.FRC.isValidationsOK.bind(this.FRC, control));
    };

    this.bindRequired = function (control) {
        $("#" + control.EbSid_CtxId).on("blur", this.FRC.isRequiredOK.bind(this.FRC, control)).on("focus", this.FRC.removeInvalidStyle.bind(this, control));
    };

    this.bindUniqueCheck = function (control) {
        $("#" + control.EbSid_CtxId).on("blur", this.checkUnique.bind(this, control));
    };

    this.checkUnique = function (ctrl) {/////////////// move
        let val = ctrl.getValue();
        if (isNaNOrEmpty(val))
            return;
        this.showLoader();
        $.ajax({
            type: "POST",
            url: "../WebForm/DoUniqueCheck",
            data: {
                TableName: this.FormObj.TableName, Field: ctrl.Name, Value: ctrl.getValue(), type: "Eb" + ctrl.ObjType
            },
            success: function (isUnique) {
                this.hideLoader();
                if (!isUnique)
                    this.FRC.addInvalidStyle(ctrl, "This field is unique, try another value");
                else
                    this.FRC.removeInvalidStyle()
            }.bind(this),
        });
    };

    this.getWebFormVals = function () {
        return getValsFromForm(this.FormObj);
    }.bind(this);


    this.populateControls = function () {
        this.rowId = getObjByval(this.editModeObj, "Name", "id").Value;
        this.getEditModeFormData(this.rowId);
    };

    this.setNCCSingleColumns = function (NCCSingleColumns_flat) {
        $.each(NCCSingleColumns_flat, function (i, SingleColumn) {
            if (SingleColumn.name === "id")
                return true;
            let ctrl = getObjByval(this.flatControls, "Name", SingleColumn.name);
            ctrl.setValue(SingleColumn.value);
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

    this.getNCCSingleColumns_flat = function (FormData, NCCTblNames) {
        let NCCSingleColumns_flat = [];
        $.each(NCCTblNames, function (i, TblName) {
            let SingleRowColums = FormData[TblName][0].columns;
            NCCSingleColumns_flat = NCCSingleColumns_flat.concat(SingleRowColums);
        });
        return NCCSingleColumns_flat;
    };

    this.setEditModeCtrls = function () {
        let FormData = this.EditModeFormData;
        let NCCTblNames = this.getNCCTblNames(FormData);
        //let DGTblNames = this.getSCCTblNames(FormData, "DataGrid");
        $.each(this.DGs, function (k, DG) {
            let SingleTable = FormData[DG.TableName];
            DG.setEditModeRows(SingleTable);
        }.bind(this));

        let NCCSingleColumns_flat = this.getNCCSingleColumns_flat(FormData, NCCTblNames);
        this.setNCCSingleColumns(NCCSingleColumns_flat);
    };

    this.getEditModeFormData = function (rowId) {
        this.showLoader();
        $.ajax({
            type: "POST",
            url: "../WebForm/getRowdata",
            data: {
                refid: this.formRefId, rowid: parseInt(rowId)
            },
            success: function (data) {
                this.EditModeFormData = data.formData.multipleTables;
                this.setEditModeCtrls();
                this.hideLoader();
            }.bind(this),
        });
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
                    let rowId = this.isEditMode ? this.EditModeFormData[obj.TableName][0].rowId : 0;
                    FVWTObjColl[obj.TableName] = [{
                        RowId: rowId,
                        IsUpdate: false,
                        Columns: []
                    }];
                }
                this.ProcRecurForVal(obj, FVWTObjColl);
            }
            else {
                FVWTObjColl[src_obj.TableName][0].Columns.push(getSingleColumn(obj));
            }
        }.bind(this));

    };

    this.getFormTables = function () {
        let FormTables = {};
        FormTables[this.FormObj.TableName] = [{
            RowId: this.rowId,
            IsUpdate: false,
            Columns: [],
        }];
        this.ProcRecurForVal(this.FormObj, FormTables);
        return FormTables;
    };

    this.getFormValuesObjWithTypeColl = function () {
        let WebformData = {};
        WebformData.MasterTable = this.FormObj.TableName;

        let formTables = this.getFormTables();
        let gridTables = this.getDG_FVWTObjColl();

        WebformData.MultipleTables = $.extend(formTables, gridTables);
        return JSON.stringify(WebformData);
    };

    this.ajaxsuccess = function (rowAffected) {
        this.hideLoader();
        let msg = "";
        if (rowAffected > 0) {
            EbMessage("show", { Message: "DataCollection success", AutoHide: true, Background: '#1ebf1e' });
            msg = `Your ${this.FormObj.EbSid_CtxId} form submitted successfully`;
        }
        else {
            EbMessage("show", { Message: "Something went wrong", AutoHide: true, Background: '#bf1e1e' });
            msg = `Your ${this.FormObj.EbSid_CtxId} form submission failed`;
        }
    };

    this.saveForm = function () {
        if (!this.FRC.AllRequired_valid_Check())
            return;
        this.showLoader();
        $.ajax({
            type: "POST",
            //url: this.ssurl + "/bots",
            url: "../WebForm/InsertWebformData",
            data: {
                TableName: this.FormObj.TableName, ValObj: this.getFormValuesObjWithTypeColl(), RefId: this.formRefId, RowId: this.rowId
            },
            //beforeSend: function (xhr) {
            //    xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
            //}.bind(this),
            success: this.ajaxsuccess.bind(this),
        });

    };

    this.showLoader = function () {
        $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#WebForm-cont" } });
    };

    this.hideLoader = function () {
        $("#eb_common_loader").EbLoader("hide");
    };

    this.init();
}