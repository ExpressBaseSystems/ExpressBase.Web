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
    // checks a control value is emptyString
    this.isRequiredOK = function (ctrl) {
        let $ctrl = $("#" + ctrl.EbSid_CtxId);
        if ($ctrl.length !== 0 && ctrl.Required && isNaNOrEmpty(ctrl.getValue())) {
            this.addInvalidStyle(ctrl);
            return false;
        }
        else
            return true;
    };

    this.addInvalidStyle = function (ctrl, msg, type) {
        EbMakeInvalid(`#cont_${ctrl.EbSid_CtxId}`, `.ctrl-cover`, msg, type);
    };

    this.removeInvalidStyle = function (ctrl) {
        EbMakeValid(`#cont_${ctrl.EbSid_CtxId}`, `.ctrl-cover`);
    };

    this.init = function () {
        this.$saveBtn.on("click", this.saveForm.bind(this));
        this.initWebFormCtrls();
        if (this.isEditMode)
            this.flatControls = getFlatCtrlObjs(this.FormObj);// here re-assign objectcoll with functions
        let allFlatControls = getFlatContControls(this.FormObj).concat(this.flatControls);
        $.each(allFlatControls, function (k, Obj) {
            this.updateCtrlUI(Obj);
        }.bind(this));
    };

    this.initWebFormCtrls = function () {
        JsonToEbControls(this.FormObj);
        this.flatControls = getFlatCtrlObjs(this.FormObj);// here with functions
        $.each(this.flatControls, function (k, Obj) {
            let opt = {};
            if (Obj.ObjType === "ComboBox")
                opt.getAllCtrlValuesFn = this.getWebFormVals;
            this.initControls.init(Obj, opt);
            if (Obj.Required)
                this.bindRequired(Obj);
            if (Obj.Unique)
                this.bindUniqueCheck(Obj);
            if (Obj.Validators.$values.length > 0)
                this.bindValidators(Obj);

        }.bind(this));
        if (this.isEditMode)
            this.populateControls();
        // temp
        let contControls = getFlatContControls(this.FormObj);
        $.each(contControls, function (k, Obj) {
            if (Obj.ObjType === "DataGrid") {
                this.initControls.init(Obj);
            }
        }.bind(this));
    };

    this.bindValidators = function (control) {
        $("#" + control.EbSid_CtxId).on("blur", this.isValidationsOK.bind(this, control));
    };

    this.bindRequired = function (control) {
        $("#" + control.EbSid_CtxId).on("blur", this.isRequiredOK.bind(this, control)).on("focus", this.removeInvalidStyle.bind(this, control));
    };

    this.bindUniqueCheck = function (control) {
        $("#" + control.EbSid_CtxId).on("blur", this.checkUnique.bind(this, control));
    };

    // check all validations in a control
    this.isValidationsOK = function (ctrl) {
        let formValidationflag = true;
        ctrl.Validators.$values = sortByProp(ctrl.Validators.$values, "IsWarningOnly");// sort Validators like warnings comes last
        $.each(ctrl.Validators.$values, function (i, Validator) {
            this.removeInvalidStyle(ctrl);// reset EbMakeValid
            if (Validator.IsDisabled)
                return true;// continue; from loop if current validation IsDisabled
            let func = new Function("form", atob(Validator.JScode));
            this.updateFormValues();
            if (!func(this.formValues)) {
                //EbMakeInvalid(`#cont_${ctrl.EbSid_CtxId}`, `#${ctrl.EbSid_CtxId}Wraper`, Validator.FailureMSG, Validator.IsWarningOnly ? "warning" : "danger");
                this.addInvalidStyle(ctrl, Validator.FailureMSG, (Validator.IsWarningOnly ? "warning" : "danger"));
                if (!Validator.IsWarningOnly) {
                    formValidationflag = false;
                    return false;// break; from loop if one validation failed
                }
            }
        }.bind(this));
        return formValidationflag;
    };

    this.updateFormValues = function () {
        $.each(this.flatControls, function (i, ctrl) {
            this.formValues[ctrl.Name] = ctrl.getValue();
        }.bind(this));
    };

    this.checkUnique = function (ctrl) {
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
                    this.addInvalidStyle(ctrl, "This field is unique, try another value");
                else
                    this.removeInvalidStyle()
            }.bind(this),
        });
    }

    this.getWebFormVals = function () {
        return getValsFromForm(this.filterObj);
    }.bind(this);


    this.populateControls = function () {
        this.rowId = getObjByval(this.editModeObj, "Name", "id").Value;
        this.setEditModevalues(this.rowId);
    }

    this.setEditModevalues = function (rowId) {
        this.showLoader();
        $.ajax({
            type: "POST",
            url: "../WebForm/getRowdata",
            data: {
                refid: this.formRefId, rowid: parseInt(rowId)
            },
            success: function (data) {
                this.EditModevalues = data.rowValues;
                $.each(this.flatControls, function (i, Obj) {
                    Obj.setValue(this.EditModevalues[i]);
                }.bind(this));
                console.log(data);
                this.hideLoader();
            }.bind(this),
        });
    };

    this.ProcRecurForVal = function (src_obj, FVWTObjColl) {
        let _val = null;
        $.each(src_obj.Controls.$values, function (i, obj) {
            if (obj.IsContainer) {
                if (obj.TableName === "" || obj.TableName === null)
                    obj.TableName = src_obj.TableName;
                if (FVWTObjColl[obj.TableName] === undefined)
                    FVWTObjColl[obj.TableName] = [];
                this.ProcRecurForVal(obj, FVWTObjColl);
            }
            else {
                let colObj = {};
                colObj.Name = obj.Name;
                _type = obj.EbDbType;
                colObj.Value = (_type === 7) ? parseInt(obj.getValue()) : obj.getValue();
                colObj.Type = _type;
                colObj.AutoIncrement = obj.AutoIncrement || false;
                FVWTObjColl[src_obj.TableName].push(colObj);
            }
        }.bind(this));

    };

    this.getDG_FVWTObjColl = function () {
        let DGs = getFlatObjOfType("DataGrid");
    };

    this.getFormValuesObjWithTypeColl = function () {
        let FVWTObjColl = {};
        let DG_FVWTObjColl = this.getDG_FVWTObjColl();
        //{
        //    "tblName1":
        //        [
        //            { "rowid1": [{ name: 1, val: 100 }, { name: 10, val: 100 },] },
        //            { "0": [{ name: 1, val: 100 }, { name: 10, val: 100 }, { name: 1, val: 100 }, { name: 10, val: 100 }, { name: 1, val: 100 }, { name: 10, val: 100 },] },
        //            { "0": [{ name: 1, val: 100 }, { name: 10, val: 100 }, { name: 1, val: 100 }, { name: 10, val: 100 }, { name: 1, val: 100 }, { name: 10, val: 100 },] },
        //        ],
        //    "tblName2":
        //        [
        //            { "rowid1": [{ name: 1, val: 100 }, { name: 10, val: 100 },] },
        //            { "0": [{ name: 1, val: 100 }, { name: 10, val: 100 }, { name: 1, val: 100 }, { name: 10, val: 100 }, { name: 1, val: 100 }, { name: 10, val: 100 },] },
        //            { "0": [{ name: 1, val: 100 }, { name: 10, val: 100 }, { name: 1, val: 100 }, { name: 10, val: 100 }, { name: 1, val: 100 }, { name: 10, val: 100 },] },
        //        ]
        //};

        FVWTObjColl[this.FormObj.TableName] = [];
        this.ProcRecurForVal(this.FormObj, FVWTObjColl);

        let fval = {
            "nfv": FVWTObjColl,
            "dgv": DG_FVWTObjColl
        }
        return JSON.stringify(fval);
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
        if (!this.AllRequired_valid_Check())
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
    }

    this.AllRequired_valid_Check = function () {
        let required_valid_flag = true;
        let $notOk1stCtrl = null;
        $.each(this.flatControls, function (i, control) {
            let $ctrl = $("#" + control.EbSid_CtxId);
            if (!this.isRequiredOK(control) || !this.isValidationsOK(control)) {
                required_valid_flag = false;
                if (!$notOk1stCtrl)
                    $notOk1stCtrl = $ctrl;
            }
        }.bind(this));

        if ($notOk1stCtrl)
            $notOk1stCtrl.select();
        return required_valid_flag;
    };

    this.init();
}