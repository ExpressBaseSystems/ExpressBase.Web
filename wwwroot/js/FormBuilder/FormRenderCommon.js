const FormRenderCommon = function (options) {
    this.FO = options.FO;
    this.$submitButton = options.submitButtonHtml;

    Number.prototype.fixRounding = function (precision) {
        var power = Math.pow(10, precision || 0);
        return Math.round(this * power) / power;
    };



    this.fireInitOnchange = function (inpCtrl) {
        if (inpCtrl.OnChangeFn && inpCtrl.OnChangeFn.Code && inpCtrl.OnChangeFn.Code.trim() !== '') {
            try {
                /*console.eb_log(`>> Starting execution of OnChange function of 'form.${inpCtrl.Name}'`);*/
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
    this.setDefaultValue = function (ctrl) {
        if (ctrl.DefaultValueExpression && ctrl.DefaultValueExpression.Code) {
            try {
                let val = new Function("form", "user", `event`, atob(ctrl.DefaultValueExpression.Code)).bind(ctrl, this.FO.formObject, this.FO.userObject)();

                let PSInitCompleteCallBFn = function (select) {
                    this.FO.IsPSsInitComplete[select.EbSid_CtxId] = true;
                    if (isAllValuesTrue(this.FO.IsPSsInitComplete))
                        this.FO._allPSsInit = true;
                    select.initializer.V_hideDD();
                }.bind(this);

                if (ctrl.ObjType === "PowerSelect" && !ctrl.RenderAsSimpleSelect)
                    ctrl.setValue(val, PSInitCompleteCallBFn.bind(this));
                else
                    ctrl.justSetValue(val);
            } catch (e) {
                console.eb_log("eb error :");
                console.eb_log(e);
                alert("error in 'DefaultValueExpression' of : " + ctrl.Name + " - " + e.message);
            }
        }
    };

    this.setDefaultvalsNC = function (flatControls) {
        $.each(flatControls, function (k, Obj) {
            this.setDefaultValue(Obj);
        }.bind(this));
    };

    this.execDefaultvalsNC = function (defaultValsExecOrder) {
        if (!defaultValsExecOrder) {//for old forms
            console.error("Eb error: defaultValsExecOrder not found,  please try saving form in dev side");
            return;
        }
        defaultValsExecOrderArr = defaultValsExecOrder.$values;
        for (let i = 0; i < defaultValsExecOrderArr.length; i++) {
            let ctrlPath = defaultValsExecOrderArr[i];
            let ctrl = this.FO.formObject.__getCtrlByPath(ctrlPath);
            this.setDefaultValue(ctrl);
        }
    };

    this.setValueExpValsNC = function (flatControls) {
        for (let i = 0; i < flatControls.length; i++) {
            let ctrl = flatControls[i];
            if (ctrl.DoNotPersist)
                EbRunValueExpr(ctrl, this.FO.formObject, this.FO.userObject, this.FO.FormObj);
        }
    };


    this.bindFnsToCtrl = function (Obj) {
        if (Obj.Required)
            this.bindRequired(Obj);
        if (Obj.Unique)
            this.bindUniqueCheck(Obj);

        if (Obj.DependedValExp.$values.length > 0 || (Obj.DependedDG && Obj.DependedDG.$values.length > 0) || Obj.DataImportId)
            this.bindValueUpdateFns_OnChange(Obj);

        if ((Obj.OnChangeFn && Obj.OnChangeFn.Code && Obj.OnChangeFn.Code.trim() !== "") ||
            Obj.HiddenExpr && Obj.HiddenExpr.Code && Obj.HiddenExpr.Code.trim() !== "" ||
            Obj.DisableExpr && Obj.DisableExpr.Code && Obj.DisableExpr.Code.trim() !== "")
            this.bindBehaviorFns_OnChange(Obj);

        if (Obj.Validators && Obj.Validators.$values.length > 0)
            this.bindValidators(Obj);
    };

    this.bindValidators = function (control) {
        $("#" + control.EbSid_CtxId).on("blur", this.isValidationsOK.bind(this, control));
    };

    this.setDisabledControls = function (flatControls) {
        $.each(flatControls, function (k, Obj) {
            if (Obj.IsDisable)
                Obj.disable();
        }.bind(this));
    };

    this.fireInitOnchangeNC = function (flatControls) {
        for (let i = 0; i < flatControls.length; i++) {
            let Obj = flatControls[i];
            if (Obj.ObjType === "ScriptButton")
                continue;
            this.fireInitOnchange(Obj);
        }
        //$.each(flatControls, function (k, Obj) {
        //    if (Obj.ObjType === "ScriptButton")
        //        return true;
        //    this.fireInitOnchange(Obj);
        //}.bind(this));
    };

    this.bindFnsToCtrls = function (flatControls) {
        $.each(flatControls, function (k, Obj) {
            this.bindFnsToCtrl(Obj);
        }.bind(this));
    };

    this.bindEbOnChange2Ctrls = function (flatControls) {
        $.each(flatControls, function (k, Obj) {
            this.bindEbFnOnChange(Obj);
        }.bind(this));
    };

    this.wrapInFn = function (fn) {
        return `(function(){${fn}})();`
    };

    this.bindValueUpdateFns_OnChange = function (control) {
        try {
            let FnString = 
                ((control.DependedValExp && control.DependedValExp.$values.length !== 0 || control.DependedDG && control.DependedDG.$values.length !== 0 || control.DataImportId) ? `
                if(!this.___isNotUpdateValExpDepCtrls){
                    form.updateDependentControls(${control.__path}, form);
                }
                this.___isNotUpdateValExpDepCtrls = false;` : "");/// cleanup, return if no ...
            let onChangeFn = new Function("form", "user", `event`, FnString).bind(control, this.FO.formObject, this.FO.userObject);
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////developer  return statement prevent form.updateDependentControls calling
            control.__onChangeFn = onChangeFn;
            control.bindOnChange(onChangeFn);
        } catch (e) {
            console.eb_log("eb error :");
            console.eb_log(e);
            alert("error in 'On Change function' of : " + control.Name + " - " + e.message);
        }
    };

    this.bindBehaviorFns_OnChange = function (control) {
        try {
            let FnString =
                this.wrapInFn(atob(control.OnChangeFn.Code)) +
                    ((control.HiddenExpDependants && control.HiddenExpDependants.$values.length !== 0 || control.DisableExpDependants && control.DisableExpDependants.$values.length !== 0) ? ` ;
                    form.updateDependentControlsBehavior(${control.__path}, form);` : "");
            let onChangeFn = new Function("form", "user", `event`, FnString).bind(control, this.FO.formObject, this.FO.userObject);
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////developer  return statement prevent form.updateDependentControls calling
            control.__onChangeFn = onChangeFn;
            control.bindOnChange(onChangeFn);
        } catch (e) {
            console.eb_log("eb error :");
            console.eb_log(e);
            alert("error in 'On Change function' of : " + control.Name + " - " + e.message);
        }
    };

    this.populateDateCtrlsWithInitialVal = function (formObj) {
        let allTypeDateCtrls = getFlatObjOfTypes(formObj, ["Date", "SysModifiedAt", "SysCreatedAt"]);
        for (let i = 0; i < allTypeDateCtrls.length; i++) {
            let ctrl = allTypeDateCtrls[i];
            if (ctrl.DefaultValueExpression && ctrl.DefaultValueExpression.Code)
                continue;
            if (!ctrl.IsNullable) {
                if (ctrl.ShowDateAs_ === 1)
                    ctrl.DataVals.Value = moment(new Date()).format('MM-YYYY');
                else
                    ctrl.DataVals.Value = moment(new Date()).format('YYYY-MM-DD');
            }
        }
    };

    this.populateRGCtrlsWithInitialVal = function (formObj) {
        let allTypeRGCtrls = getFlatObjOfTypes(formObj, ["RadioGroup"]);
        for (let i = 0; i < allTypeRGCtrls.length; i++) {
            let ctrl = allTypeRGCtrls[i];
            ctrl.setValue(ctrl.getValueFromDOM());
        }
    };

    //this.populateSysLocCtrlsWithInitialVal = function (formObj) {
    //    let allTypeSLCtrls = getFlatObjOfTypes(formObj, ["SysLocation"]);
    //    for (let i = 0; i < allTypeSLCtrls.length; i++) {
    //        let ctrl = allTypeSLCtrls[i];
    //        ctrl.setValue(ebcontext.locations.CurrentLocObj.LocId);
    //    }
    //};

    //this.populateCheckBoxCtrlsWithInitialVal = function (formObj) {
    //    let allTypeCBCtrls = getFlatObjOfTypes(formObj, ["RadioButton"]);
    //    for (let i = 0; i < allTypeCBCtrls.length; i++) {
    //        let ctrl = allTypeCBCtrls[i];
    //        ctrl.setValue("false");
    //    }
    //};

    this.populateSSCtrlsWithInitialVal = function (formObj) {
        let allTypeRGCtrls = getFlatObjOfTypes(formObj, ["SimpleSelect", "PowerSelect"]);
        for (let i = 0; i < allTypeRGCtrls.length; i++) {
            let ctrl = allTypeRGCtrls[i];
            if (ctrl.ObjType === "SimpleSelect" || (ctrl.ObjType === "PowerSelect" && ctrl.RenderAsSimpleSelect))
                ctrl.setValue(ctrl.getValueFromDOM());
        }
    };

    this.bindEbFnOnChange = function (control) {
        try {
            let onChangeFn = function (form, user, event) {
                if (this.DataVals) {
                    this.DataVals.Value = this.getValueFromDOM();
                    this.DataVals.D = this.getDisplayMemberFromDOM();
                }
            }.bind(control, this.FO.formObject, this.FO.userObject);
            control.__onChangeFn = onChangeFn;
            control.bindOnChange(onChangeFn);
        } catch (e) {
            console.eb_log("eb error :");
            console.eb_log(e);
            console.log("error in 'bindEbFnOnChange function' of : " + control.Name + " - " + e.message);
        }
    };


    this.setFormObjHelperfns = function () {
        this.FO.formObject.__getCtrlByPath = function (path) {
            try {
                let form = this.FO.formObject;
                let ctrl = {};
                let pathArr = path.split(".");
                if (pathArr.length === 3) {
                    path = pathArr[0] + '.' + pathArr[1] + '.' + "currentRow" + '.' + pathArr[2];
                    ctrl = eval(path);
                    ctrl.IsDGCtrl = true;
                } else {
                    ctrl = eval(path);
                }
                return ctrl;
            }
            catch (e) {
                console.warn("could not find:" + path);
                return "not found";
            }
        }.bind(this);
    }.bind(this);

    this.UpdateValExpDepCtrls = function (curCtrl) {
        $.each(curCtrl.DependedValExp.$values, function (i, depCtrl_s) {
            let depCtrl = this.FO.formObject.__getCtrlByPath(depCtrl_s);
            if (depCtrl === "not found")
                return;
            try {
                if (depCtrl.ObjType === "TVcontrol") {
                    depCtrl.reloadWithParam(curCtrl);
                }
                else {
                    if (depCtrl.ValueExpr && depCtrl.ValueExpr.Lang === 0) {
                        let valExpFnStr = atob(depCtrl.ValueExpr.Code);
                        let ValueExpr_val = new Function("form", "user", `event`, valExpFnStr).bind(depCtrl_s, this.FO.formObject, this.FO.userObject)();
                        if (valExpFnStr) {
                            if (this.FO.formObject.__getCtrlByPath(curCtrl.__path).IsDGCtrl || !depCtrl.IsDGCtrl) {
                                //if (depCtrl.DoNotPersist && depCtrl.isInitialCallInEditMode)

                                // if persist - manual onchange only setValue. DoNotPersist always setValue
                                //if ((!this.FO.Mode.isView && !this.FO.isInitialEditModeDataSet) || depCtrl.DoNotPersist) {
                                if ((!this.FO.isInitialProgramaticOnchange) || depCtrl.DoNotPersist) {
                                    //depCtrl.setValue(ValueExpr_val);
                                    depCtrl.___isNotUpdateValExpDepCtrls = true;
                                    depCtrl.setValue(ValueExpr_val);
                                    //this.isRequiredOK(depCtrl);
                                }
                            }
                            else {
                                $.each(depCtrl.__DG.AllRowCtrls, function (rowid, row) {
                                    row[depCtrl.Name].setValue(ValueExpr_val);
                                }.bind(this));
                            }
                            //if (depCtrl.IsDGCtrl && depCtrl.__Col.IsAggragate)
                            //    depCtrl.__Col.__updateAggCol({ target: $(`#${depCtrl.EbSid_CtxId}`)[0] });
                        }
                    }
                    else if (depCtrl.ValueExpr && depCtrl.ValueExpr.Lang === 2) {
                        let params = [];

                        $.each(depCtrl.ValExpParams.$values, function (i, depCtrl_s) {// duplicate code in eb_utility.js
                            try {
                                let paramCtrl = this.FO.formObject.__getCtrlByPath(depCtrl_s);
                                let valExpFnStr = atob(paramCtrl.ValueExpr.Code);
                                let param = { Name: paramCtrl.Name, Value: paramCtrl.getValue(), Type: "11" };
                                params.push(param);
                            }
                            catch (e) {
                                console.eb_log("eb error :");
                                console.eb_log(e);
                                alert("error in 'Value Expression' of : " + curCtrl.Name + " - " + e.message);
                            }
                        }.bind(this));

                        ExecQuery(this.FO.FormObj.RefId, depCtrl.Name, params, depCtrl);
                    }
                }
            }
            catch (e) {
                console.eb_log("eb error :");
                console.eb_log(e);
                alert("error in 'Value Expression' of : " + curCtrl.Name + " - " + e.message);
            }
        }.bind(this));
    }.bind(this);

    this.importDGRelatedUpdates = function (curCtrl) {
        $.each(curCtrl.DependedDG.$values, function (i, depCtrl_s) {
            try {
                let depCtrl = this.FO.formObject.__getCtrlByPath('form.' + depCtrl_s);
                depCtrl.__setSuggestionVals();
            }
            catch (e) {
                console.eb_log("eb error :");
                console.eb_log(e);
                alert("error in 'Value Expression' of : " + curCtrl.Name + " - " + e.message);
            }
        }.bind(this));
    }.bind(this);

    this.PSImportRelatedUpdates = function (curCtrl) {
        curCtrl.isDataImportCtrl = true;
        this.FO.psDataImport(curCtrl);
    }.bind(this);

    this.UpdateHideExpDepCtrls = function (curCtrl) {
        let depCtrls_SArr = curCtrl.HiddenExpDependants.$values;

        for (let i = 0; i < depCtrls_SArr.length; i++) {
            let depCtrl_s = depCtrls_SArr[i];
            let depCtrl = this.FO.formObject.__getCtrlByPath(depCtrl_s);
            if (depCtrl.HiddenExpr) {
                let hideExpFnStr = atob(depCtrl.HiddenExpr.Code);
                let hideExpVal = new Function("form", "user", `event`, hideExpFnStr).bind(depCtrl_s, this.FO.formObject, this.FO.userObject)();
                if (hideExpVal)
                    depCtrl.hide();
                else
                    depCtrl.show();
            }
        }
    }.bind(this);

    this.UpdateDisableExpDepCtrls = function (curCtrl) {
        let depCtrls_SArr = curCtrl.DisableExpDependants.$values;
        for (let i = 0; i < depCtrls_SArr.length; i++) {
            let depCtrl_s = depCtrls_SArr[i];
            let depCtrl = this.FO.formObject.__getCtrlByPath(depCtrl_s);
            if (depCtrl.DisableExpr) {
                let disableExpFnStr = atob(depCtrl.DisableExpr.Code);
                let disableExpVal = new Function("form", "user", `event`, disableExpFnStr).bind(depCtrl_s, this.FO.formObject, this.FO.userObject)();
                if (disableExpVal) {
                    depCtrl.disable();
                }
                else
                    depCtrl.enable();
            }
        }
    }.bind(this);

    this.setUpdateDependentControlsFn = function () {
        this.FO.formObject.updateDependentControls = function (curCtrl) { //calls in onchange
            if (curCtrl.DependedValExp && curCtrl.DependedValExp.$values.length !== 0) {
                this.UpdateValExpDepCtrls(curCtrl);
            }
            if (curCtrl.DependedDG) {
                this.importDGRelatedUpdates(curCtrl);
            }
            if (curCtrl.DataImportId && this.FO.Mode.isNew) {
                this.PSImportRelatedUpdates(curCtrl);
            }
        }.bind(this);
    };

    this.setUpdateDependentControlsBehaviorFns = function () {
        this.FO.formObject.updateDependentControlsBehavior = function (curCtrl) { //calls in onchange
            if (curCtrl.HiddenExpDependants && curCtrl.HiddenExpDependants.$values.length !== 0) {
                this.UpdateHideExpDepCtrls(curCtrl);
            }
            if (curCtrl.DisableExpDependants && curCtrl.DisableExpDependants.$values.length !== 0) {
                this.UpdateDisableExpDepCtrls(curCtrl);
            }
        }.bind(this);
    };

    this.bindRequired = function (control) {
        if (control.ObjType === "SimpleSelect" || control.RenderAsSimpleSelect)
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
        let val = ctrl.getValueFromDOM();
        let tableName = ctrl.TableName || this.FO.FormObj.TableName;
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
                TableName: tableName, Field: ctrl.Name, Value: val, type: "Eb" + ctrl.ObjType
            },
            success: function (isUnique) {
                //this.FO.hideLoader();
                hide_inp_loader($ctrl, this.FO.$saveBtn);
                if (!isUnique) {
                    //unique_flag = false;
                    $ctrl.attr("uniq-ok", "false");
                    ctrl.addInvalidStyle("This field is unique, try another value");
                }
                else {
                    $ctrl.attr("uniq-ok", "true");
                    ctrl.removeInvalidStyle();
                }
                //return unique_flag;
            }.bind(this)
        });
    };

    this.isSameValInUniqCtrl = function (ctrl) {
        let val = ctrl.getValue();
        return val === this.FO.uniqCtrlsInitialVals[ctrl.EbSid];
    };


    // checks a control value is emptyString
    this.sysValidationsOK = function (ctrl) {
        // email validation
        if ((ctrl.ObjType === "TextBox" && ctrl.TextMode === 2) || ctrl.ObjType === "Email") {
            if (EbvalidateEmail(ctrl.getValueFromDOM())) {
                ctrl.removeInvalidStyle();
                return true;
            }
            else {
                ctrl.addInvalidStyle("Invalid email");
                return false;
            }
        }

        return true;
    };

    /////////////
    this.AllRequired_valid_Check = function () {
        let required_valid_flag = true;
        let $notOk1stCtrl = null;
        $.each(this.FO.flatControlsWithDG, function (i, ctrl) {
            let $ctrl = $("#" + ctrl.EbSid_CtxId);
            if (!this.isRequiredOK(ctrl) || !this.isValidationsOK(ctrl) || !this.sysValidationsOK(ctrl)) {
                required_valid_flag = false;
                if (!$notOk1stCtrl)
                    $notOk1stCtrl = $ctrl;
            }
        }.bind(this));

        if ($notOk1stCtrl && $notOk1stCtrl.length !== 0) {
            $notOk1stCtrl.select();
            $notOk1stCtrl[0].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
        }
        required_valid_flag = required_valid_flag && this.runFormValidations();
        return required_valid_flag;
    }.bind(this);

    this.runFormValidations = function () {
        let ctrl = this.FO.FormObj;
        if (!ctrl.Validators)
            return true;
        let formValidationflag = true;
        ctrl.Validators.$values = sortByProp(ctrl.Validators.$values, "IsWarningOnly");// sort Validators like warnings comes last
        $.each(ctrl.Validators.$values, function (i, Validator) {
            EbMessage("hide", "");// reset EbMakeValid
            if (Validator.IsDisabled || !Validator.Script.Code)// continue; from loop if current validation IsDisabled
                return true;
            let func = new Function('form', 'user', `event`, atob(Validator.Script.Code)).bind(ctrl, this.FO.formObject, this.FO.userObject);
            this.updateFormValues();
            let valRes = func(this.FO.formValues, this.FO.userObject);
            if (valRes === false) {
                if (!Validator.IsWarningOnly) {
                    color = "#aa0000";
                    EbMessage("show", { Message: Validator.FailureMSG, AutoHide: true, Background: "#aa0000" });
                    formValidationflag = false;
                    return false;// break; from loop if one validation failed
                }
                //this.addInvalidStyle(ctrl, Validator.FailureMSG, (Validator.IsWarningOnly ? "warning" : "danger"));
                EbMessage("show", { Message: Validator.FailureMSG, AutoHide: true, Background: 'rgb(245, 144, 58)' });
            } else if (valRes !== true && valRes !== undefined) {
                console.warn(`validator '${Validator.Name}' of '${ctrl.Name}' returns ${valRes}`);
            }
        }.bind(this));
        return formValidationflag;
    };

    this.isValidationsOK = function (ctrl) {
        if (!ctrl.Validators)
            return true;
        let formValidationflag = true;
        ctrl.Validators.$values = sortByProp(ctrl.Validators.$values, "IsWarningOnly");// sort Validators like warnings comes last
        $.each(ctrl.Validators.$values, function (i, Validator) {
            this.removeInvalidStyle(ctrl);// reset EbMakeValid
            if (Validator.IsDisabled || !Validator.Script.Code)// continue; from loop if current validation IsDisabled
                return true;
            let func = new Function('form', 'user', `event`, atob(Validator.Script.Code)).bind(ctrl, this.FO.formObject, this.FO.userObject);
            this.updateFormValues();
            let valRes = func(this.FO.formValues, this.FO.userObject);
            if (valRes === false) {
                //EbMakeInvalid(`#cont_${ctrl.EbSid_CtxId}`, `#${ctrl.EbSid_CtxId}Wraper`, Validator.FailureMSG, Validator.IsWarningOnly ? "warning" : "danger");
                this.addInvalidStyle(ctrl, Validator.FailureMSG, (Validator.IsWarningOnly ? "warning" : "danger"));
                if (!Validator.IsWarningOnly) {
                    formValidationflag = false;
                    return false;// break; from loop if one validation failed
                }
            } else if (valRes !== true && valRes !== undefined) {
                console.warn(`validator '${Validator.Name}' of '${ctrl.Name}' returns ${valRes}`);
            }
        }.bind(this));
        return formValidationflag;
    };

    this.updateFormValues = function () {
        $.each(this.FO.flatControls, function (i, ctrl) {
            if (ctrl.ObjType !== "FileUploader")
                this.FO.formValues[ctrl.Name] = ctrl.getValue();
        }.bind(this));
    };

    this.removeInvalidStyle = function (ctrl) {
        EbMakeValid(`#cont_${ctrl.EbSid_CtxId}`, `.ctrl-cover`);
    };

    // checks a control value is emptyString
    this.isRequiredOK = function (ctrl) {
        let $ctrl = $("#" + ctrl.EbSid_CtxId);
        if (ctrl.ObjType === "DataGrid" && !ctrl.rowRequired_valid_Check()) {
            this.addInvalidStyle(ctrl);
            return false;
        }
        else if ($ctrl.length !== 0 && ctrl.Required && !ctrl.isRequiredOK()) {
            this.addInvalidStyle(ctrl);
            return false;
        }
        else {
            this.removeInvalidStyle(ctrl);
            return true;
        }
    };

    this.addInvalidStyle = function (ctrl, msg, type) {
        if (ctrl.ObjType === "PowerSelect" && !ctrl.RenderAsSimpleSelect)
            EbMakeInvalid(`#${ctrl.EbSid_CtxId}Container`, `#${ctrl.EbSid_CtxId}Wraper`, msg, type);
        else
            EbMakeInvalid(`#cont_${ctrl.EbSid_CtxId}`, `.ctrl-cover`, msg, type);
    };
};