const FormRenderCommon = function (options) {
    this.FO = options.FO;
    this.$submitButton = options.submitButtonHtml;



    this.fireInitOnchange = function (inpCtrl) {
        if (inpCtrl.OnChangeFn && inpCtrl.OnChangeFn.Code && inpCtrl.OnChangeFn.Code.trim() !== '') {
            try {
                console.eb_log(`>> Starting execution of OnChange function of 'form.${inpCtrl.Name}'`);
                inpCtrl.__onChangeFn();
            }
            catch (e) {
                console.eb_log("eb error :");
                console.eb_log(e);
                alert("  error in 'On Change function' of : " + inpCtrl.Name + " - " + e.message);
            }
        }
    };


    ////////////
    this.setDefaultValues = function (Obj) {
        if (Obj.DefaultValue)
            Obj.setValue(Obj.DefaultValue);
        if (Obj.DefaultValueExpression && Obj.DefaultValueExpression.Code) {
            let fun = new Function("form", "user", `event`, atob(Obj.DefaultValueExpression.Code)).bind(Obj, this.FO.formObject, this.FO.userObject);
            let val = fun();
            Obj.setValue(val);
        }
    };

    this.setDefaultvalsNC = function (flatControls) {
        $.each(flatControls, function (k, Obj) {
            this.setDefaultValues(Obj);
        }.bind(this));
    };


    this.bindFnsToCtrl= function (Obj) {
        if (Obj.Required)
            this.bindRequired(Obj);
        if (Obj.Unique)
            this.bindUniqueCheck(Obj);
        if ((Obj.OnChangeFn && Obj.OnChangeFn.Code && Obj.OnChangeFn.Code.trim() !== "") || Obj.DependedValExp.$values.length > 0)
            this.bindOnChange(Obj);
        if (Obj.Validators.$values.length > 0)
            this.bindValidators(Obj);
    };

    this.bindValidators = function (control) {
        $("#" + control.EbSid_CtxId).on("blur", this.isValidationsOK.bind(this, control));
    };

    this.fireInitOnchangeNC = function (flatControls) {
        $.each(flatControls, function (k, Obj) {
            this.fireInitOnchange(Obj);
        }.bind(this));
    };

    this.bindFnsToCtrls = function (flatControls) {
        $.each(flatControls, function (k, Obj) {
            this.bindFnsToCtrl(Obj);
        }.bind(this));
    };

    this.bindOnChange = function (control) {
        if (control.IsDisable)
            control.disable();
        if (control.OnChangeFn.Code.trim() !== "" && control.OnChangeFn.Code.trim() !== null) {
            try {
                let FnString = `console.log('${control.__path || control.Name}');` + atob(control.OnChangeFn.Code) + (control.DependedValExp.$values.length !== 0 ? ` ; form.updateDependentControls(${control.__path}, form)` : "");
                let onChangeFn = new Function("form", "user", `event`, FnString).bind(control, this.FO.formObject, this.FO.userObject);
                control.__onChangeFn = onChangeFn;
                control.bindOnChange(onChangeFn);
            } catch (e) {
                console.eb_log("eb error :");
                console.eb_log(e);
                alert("error in 'On Change function' of : " + control.Name + " - " + e.message);
            }
        }

    };

    this.setUpdateDependentControlsFn = function () {
        this.FO.formObject.updateDependentControls = function (curCtrl) {
            $.each(curCtrl.DependedValExp.$values, function (i, ctrl) {
                let form = this.FO.formObject;
                let depCtrl = eval(ctrl);
                let valExpFnStr = atob(depCtrl.ValueExpr.Code);
                if (valExpFnStr) {
                    depCtrl.setValue(new Function("form", "user", `event`, valExpFnStr).bind(ctrl, this.FO.formObject, this.FO.userObject)());
                }

            }.bind(this));
        }.bind(this);
    };

    this.bindRequired = function (control) {
        if (control.ObjType === "SimpleSelect")
            $("#cont_" + control.EbSid_CtxId + " .dropdown-toggle").on("blur", this.isRequiredOK.bind(this, control)).on("focus", this.removeInvalidStyle.bind(this, control));
        else
            $("#" + control.EbSid_CtxId).on("blur", this.isRequiredOK.bind(this, control)).on("focus", this.removeInvalidStyle.bind(this, control));
    };

    this.bindUniqueCheck = function (control) {
        $("#" + control.EbSid_CtxId).keyup(debounce(this.checkUnique.bind(this, control), 1000)); //delayed check 
        ///.on("blur.dummyNameSpace", this.checkUnique.bind(this, control));
    };

    this.checkUnique = function (ctrl) {/////////////// move
        if (Object.entries(this.FO.uniqCtrlsInitialVals).length !== 0 && this.isSameValInUniqCtrl(ctrl))// avoid check if edit mode and value is same as initial
            return;
        if (ctrl.ObjType === "Numeric" && ctrl.getValue() === 0)// avoid check if numeric and value is 0
            return;

        //let unique_flag = true;
        let $ctrl = $("#" + ctrl.EbSid_CtxId);
        let val = ctrl.getValue();
        if (isNaNOrEmpty(val))
            return;
        //this.FO.hideLoader();
        //this.FO.showLoader();
        hide_inp_loader($ctrl, this.FO.$saveBtn);
        show_inp_loader($ctrl, this.FO.$saveBtn);
        $.ajax({
            type: "POST",
            url: "../WebForm/DoUniqueCheck",
            data: {
                TableName: this.FO.FormObj.TableName, Field: ctrl.Name, Value: ctrl.getValue(), type: "Eb" + ctrl.ObjType
            },
            success: function (isUnique) {
                //this.FO.hideLoader();
                hide_inp_loader($ctrl, this.FO.$saveBtn);
                if (!isUnique) {
                    //unique_flag = false;
                    $ctrl.attr("uniq-ok", "false");
                    this.addInvalidStyle(ctrl, "This field is unique, try another value");
                }
                else {
                    $ctrl.attr("uniq-ok", "true");
                    this.removeInvalidStyle(ctrl);
                }
                //return unique_flag;
            }.bind(this)
        });
    };

    this.isSameValInUniqCtrl = function (ctrl) {
        let val = ctrl.getValue();
        return val === this.FO.uniqCtrlsInitialVals[ctrl.EbSid];
    };
    /////////////
    this.AllRequired_valid_Check = function () {
        let required_valid_flag = true;
        let $notOk1stCtrl = null;
        $.each(this.FO.flatControlsWithDG, function (i, control) {
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

    //this.AllUnique_Check = function () {
    //    let unique_flag = true;
    //    let $notOk1stCtrl = null;
    //    $.each(this.FO.flatControlsWithDG, function (i, control) {
    //        let $ctrl = $("#" + control.EbSid_CtxId);
    //        if (!this.FO.checkUnique(control)) {
    //            unique_flag = false;
    //            if (!$notOk1stCtrl)
    //                $notOk1stCtrl = $ctrl;
    //        }
    //    }.bind(this));

    //    if ($notOk1stCtrl)
    //        $notOk1stCtrl.select();
    //    return unique_flag;
    //};

    // check all validations in a control
    this.isValidationsOK = function (ctrl) {
        let formValidationflag = true;
        ctrl.Validators.$values = sortByProp(ctrl.Validators.$values, "IsWarningOnly");// sort Validators like warnings comes last
        $.each(ctrl.Validators.$values, function (i, Validator) {
            this.removeInvalidStyle(ctrl);// reset EbMakeValid
            if (Validator.IsDisabled || !Validator.Script.Code)// continue; from loop if current validation IsDisabled
                return true;
            let func = new Function('form', 'user', `event`, atob(Validator.Script.Code)).bind(ctrl, this.FO.formObject, this.FO.userObject);
            this.updateFormValues();
            if (!func(this.FO.formValues, this.FO.userObject)) {
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
        $.each(this.FO.flatControls, function (i, ctrl) {
            this.FO.formValues[ctrl.Name] = ctrl.getValue();
        }.bind(this));
    };

    this.removeInvalidStyle = function (ctrl) {
        EbMakeValid(`#cont_${ctrl.EbSid_CtxId}`, `.ctrl-cover`);
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
        if (ctrl.ObjType === "PowerSelect")
            EbMakeInvalid(`#${ctrl.EbSid_CtxId}Container`, `#${ctrl.EbSid_CtxId}Wraper`, msg, type);
        else
            EbMakeInvalid(`#cont_${ctrl.EbSid_CtxId}`, `.ctrl-cover`, msg, type);
    };
};