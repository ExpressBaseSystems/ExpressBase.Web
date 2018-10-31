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

    this.checkRequired = function (control) {
        let $ctrl = $("#" + control.EbSid_CtxId);
        if ($ctrl.length !== 0 && control.Required && $ctrl.val().trim() === "")
            EbMakeInvalid(`#cont_${control.EbSid_CtxId}`, `.${control.EbSid_CtxId}Wraper`);
    };

    this.removeReqFm = function (control) {
        EbMakeValid(`#cont_${control.EbSid_CtxId}`, `.${control.EbSid_CtxId}Wraper`);
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
    };

    this.bindValidators = function (control) {
        $("#" + control.EbSid_CtxId).on("blur", this.checkValidations.bind(this, control));
    };

    this.bindRequired = function (control) {
        $("#" + control.EbSid_CtxId).on("blur", this.checkRequired.bind(this, control)).on("focus", this.removeReqFm.bind(this, control));
    };

    this.bindUniqueCheck = function (control) {
        $("#" + control.EbSid_CtxId).on("blur", this.checkUnique.bind(this, control));
    };

    this.checkValidations = function (Obj) {
        Obj.Validators.$values = sortByProp(Obj.Validators.$values, "IsWarningOnly");// sort Validators like warnings comes last
        $.each(Obj.Validators.$values, function (i, Validator) {
            EbMakeValid(`#cont_${Obj.EbSid_CtxId}`, `#${Obj.EbSid_CtxId}Wraper`);// reset EbMakeValid
            this.formValidationflag = true;// reset formValidationflag
            if (Validator.IsDisabled)
                return true;// continue; from loop if current validation IsDisabled
            let func = new Function("form", atob(Validator.JScode));
            this.updateFormValues();
            if (!func(this.formValues)) {
                EbMakeInvalid(`#cont_${Obj.EbSid_CtxId}`, `#${Obj.EbSid_CtxId}Wraper`, Validator.FailureMSG, Validator.IsWarningOnly ? "warning" : "danger");
                if (!Validator.IsWarningOnly) {
                    this.formValidationflag = false;
                    return false;// break; from loop if one validation failed
                }
            }

        }.bind(this));
    };

    this.updateFormValues = function () {
        $.each(this.flatControls, function (i, obj) {
            this.formValues[obj.Name] = obj.getValue();
        }.bind(this));
    };

    this.checkUnique = function (Obj) {
        let val = Obj.getValue();
        if ((typeof val === "number" && isNaN(val)) || (typeof val === "string" && val.trim() === ""))
            return;
        this.showLoader();
        $.ajax({
            type: "POST",
            url: "../WebForm/DoUniqueCheck",
            data: {
                TableName: this.FormObj.TableName, Field: Obj.Name, Value: Obj.getValue(), type: "Eb" + Obj.ObjType
            },
            success: function (isUnique) {
                this.hideLoader();
                if (!isUnique)
                    EbMakeInvalid(`#cont_${Obj.EbSid_CtxId}`, `#${Obj.EbSid_CtxId}Wraper`, "This field is unique, try another value");
                else
                    EbMakeValid(`#cont_${Obj.EbSid_CtxId}`, `#${Obj.EbSid_CtxId}Wraper`);
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

    this.getFormValuesObjWithTypeColl = function () {
        let FVWTObjColl = {};
        FVWTObjColl[this.FormObj.TableName] = []
        this.ProcRecurForVal(this.FormObj, FVWTObjColl);
        return JSON.stringify(FVWTObjColl);
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
        if (!this.submitReqCheck() || !this.formValidationflag)
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

    this.submitReqCheck = function () {
        let $firstCtrl = null;
        $.each(this.flatControls, function (i, control) {
            let $ctrl = $("#" + control.EbSid_CtxId);
            if ($ctrl.length !== 0 && control.Required && $ctrl.val().trim() === "") {
                if (!$firstCtrl)
                    $firstCtrl = $ctrl;
                this.checkRequired(control);
            }
        }.bind(this));

        if ($firstCtrl) {
            $firstCtrl.select();
            return false
        }
        else
            return true;
    };

    this.init();
}