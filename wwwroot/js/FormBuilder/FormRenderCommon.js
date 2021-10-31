const FormRenderCommon = function (options) {
    this.FO = options.FO;

    this.fireInitOnchange = function (inpCtrl) { // FD only
        if (inpCtrl.OnChangeFn && inpCtrl.OnChangeFn.Code && inpCtrl.OnChangeFn.Code.trim() !== '') {
            try {
                /*console.eb_log(`>> Starting execution of OnChange function of 'form.${inpCtrl.Name}'`);*/
                inpCtrl.__onChangeFn();
            }
            catch (e) {
                console.eb_log("eb error :");
                console.eb_log(e);
                EbMessage("show", { Message: `Error in 'OnChange fn': ${inpCtrl.Name} - ${e.message}`, AutoHide: true, Background: '#aa0000' });
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
                EbMessage("show", { Message: `Error in 'DefaultValueExpression': ${ctrl.Name} - ${e.message}`, AutoHide: true, Background: '#aa0000' });
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
        let defaultValsExecOrderArr = defaultValsExecOrder.$values;
        for (let i = 0; i < defaultValsExecOrderArr.length; i++) {
            let ctrlPath = defaultValsExecOrderArr[i];
            let ctrl = this.FO.formObject.__getCtrlByPath(ctrlPath);
            ctrl.___DoNotUpdateDrDepCtrls = this.FO.__fromImport;
            this.setDefaultValue(ctrl);
        }
        this.FO.__fromImport = false;
    };

    this.DrCallBack = function (ctrl, CtrlPaths, Index, ExprName) {
        ctrl.__continue = null;
        this.execAllDefaultValExpr_Inner(CtrlPaths, Index, ExprName);
    };

    //this.execAllValExprForDoNotPersistCtrls = function () {
    //    if (!this.FO.FormObj.DoNotPersistExecOrder) {//for old forms
    //        console.error("Eb error: DoNotPersistExecOrder not found,  please try saving form in dev side");
    //        return;
    //    }
    //    this.execAllDefaultValExpr_Inner(this.FO.FormObj.DoNotPersistExecOrder, 0, 'ValueExpr');
    //};

    //this.execAllDefaultValExpr = function () {
    //    if (!this.FO.FormObj.DefaultValsExecOrder) {//for old forms
    //        console.error("Eb error: defaultValsExecOrder not found,  please try saving form in dev side");
    //        return;
    //    }
    //    this.execAllDefaultValExpr_Inner(this.FO.FormObj.DefaultValsExecOrder, 0, 'DefaultValueExpression');
    //};

    this.execAllDefaultValExpr_Inner = function (CtrlPaths, Index, ExprName) {

        for (; Index < CtrlPaths.$values.length; Index++) {
            let ctrl = this.FO.formObject.__getCtrlByPath(CtrlPaths.$values[Index]);
            ctrl.___DoNotUpdateDrDepCtrls = this.FO.__fromImport;

            if (ctrl === "not found")
                continue;
            try {
                if (!ctrl[ExprName])
                    continue;
                if (ctrl[ExprName].Lang === 0) {
                    let jsExpr = atob(ctrl[ExprName].Code);
                    let result = new Function("form", "user", `event`, jsExpr).bind(ctrl, this.FO.formObject, this.FO.userObject)();
                    if (result) {
                        if (!ctrl.IsDGCtrl) {
                            ctrl.__defaultValExprExec = true;
                            if (ctrl.ObjType === 'PowerSelect') {
                                ctrl.__continue = this.DrCallBack.bind(this, ctrl, CtrlPaths, Index + 1, ExprName);
                                ctrl.justSetValue(result);
                                EbBlink(ctrl);
                                break;
                            }
                            else {
                                ctrl.justSetValue(result);
                                this.validateCtrl(ctrl);
                                EbBlink(ctrl);
                            }
                        }
                        else {
                            $.each(ctrl.__DG.AllRowCtrls, function (rowid, row) {
                                row[ctrl.Name].setValue(result);
                            }.bind(this));
                        }
                        //if (depCtrl.IsDGCtrl && depCtrl.__Col.IsAggragate)
                        //    depCtrl.__Col.__updateAggCol({ target: $(`#${depCtrl.EbSid_CtxId}`)[0] });
                    }
                }
                else if (ctrl[ExprName].Lang === 2) {
                    let filterValues = [];
                    $.each(ctrl.ValExpParams.$values, function (i, depCtrl) {
                        let paramCtrl = this.FO.formObject.__getCtrlByPath(depCtrl);
                        filterValues.push(new fltr_obj(paramCtrl.EbDbType > 0 ? paramCtrl.EbDbType : 16, paramCtrl.Name, paramCtrl.getValue()));
                    }.bind(this));
                    filterValues.push(new fltr_obj(11, "eb_loc_id", ebcontext.locations.getCurrent()));
                    filterValues.push(new fltr_obj(11, "eb_currentuser_id", ebcontext.user.UserId));
                    filterValues.push(new fltr_obj(11, "id", this.FO.rowId));
                    ctrl.__continue = this.DrCallBack.bind(this, ctrl, CtrlPaths, Index + 1, ExprName);
                    this.ExecuteSqlValueExpr(ctrl, filterValues, ExprName === 'ValueExpr' ? 0 : 1);
                    break;
                }
            }
            catch (e) {
                console.error('Error in default/value expression: ' + ctrl.Name);
                console.log(e);
            }
        }
        if (Index >= CtrlPaths.$values.length) {
            if (!this.FO.__fromImport) {
                let Dgs = [];
                let TvCtrls = {};
                for (let i = 0; i < CtrlPaths.$values.length; i++) {
                    let ctrl = this.FO.formObject.__getCtrlByPath(CtrlPaths.$values[i]);
                    if (ctrl != "not found" && ctrl.DrDependents && ctrl.DrDependents.$values) {
                        let dd = ctrl.DrDependents.$values;
                        for (let j = 0; j < dd.length; j++) {
                            let _ctrl = this.FO.formObject.__getCtrlByPath(dd[j]);
                            if (_ctrl.ObjType === "TVcontrol") {
                                if (!TvCtrls.hasOwnProperty(dd[j]))
                                    TvCtrls[dd[j]] = { ctrl: _ctrl, params: [] };
                                TvCtrls[dd[j]].params.push(ctrl);
                            }
                            else if (_ctrl.ObjType === "DataGrid") {
                                if (!Dgs.includes(dd[j]))
                                    Dgs.push(dd[j]);
                            }
                        }
                    }
                }

                if (ExprName === 'DefaultValueExpression') {
                    for (let i = 0; i < this.FO.DGs.length; i++) {
                        if (this.FO.DGs[i].Eb__paramControls && this.FO.DGs[i].Eb__paramControls.$values.length === 0) {
                            Dgs.push('form.' + this.FO.DGs[i].Name);
                        }
                    }
                }

                if (Dgs.length > 0) {
                    this.importDGRelatedUpdates(Dgs);
                }
                $.each(TvCtrls, function (k, obj) {
                    obj.ctrl.reloadWithParamAll(obj.params);
                }.bind(this));
            }
            this.FO.__fromImport = false;
        }
    };

    this.execValueExpNC = function (DoNotPersistExecOrder) {
        if (!DoNotPersistExecOrder) {//for old forms
            console.error("Eb error: DoNotPersistExecOrder not found,  please try saving form in dev side");
            return;
        }
        let doNotPersistExecOrderArr = DoNotPersistExecOrder.$values;
        for (let i = 0; i < doNotPersistExecOrderArr.length; i++) {
            let ctrlPath = doNotPersistExecOrderArr[i];
            let ctrl = this.FO.formObject.__getCtrlByPath(ctrlPath);
            EbRunValueExpr_n(ctrl, this.FO.formObject, this.FO.userObject, this.FO.FormObj);
        }
    };

    //Duplicate for FD - first time execution only - correct object refrence issue or default on change triggering
    //this will avoid multiple execution of onchange fn
    this.bindFnsToCtrl_FD = function (Obj) {
        if ((Obj.OnChangeFn && Obj.OnChangeFn.Code && Obj.OnChangeFn.Code.trim() !== "") ||
            Obj.HiddenExpDependants && Obj.HiddenExpDependants.$values.length > 0 ||
            Obj.DisableExpDependants && Obj.DisableExpDependants.$values.length > 0) {
            try {
                let control = Obj;
                let FnString =
                    this.wrapInFn(atob(control.OnChangeFn.Code)) +
                    ((control.HiddenExpDependants && control.HiddenExpDependants.$values.length !== 0 || control.DisableExpDependants && control.DisableExpDependants.$values.length !== 0) ? ` ;
                    form.updateDependentControlsBehavior(${control.__path}, form);` : "");
                let onChangeFn = new Function("form", "user", `event`, FnString).bind(control, this.FO.formObject, this.FO.userObject);
                control.__onChangeFn = onChangeFn;// for FD only need clenup
            } catch (e) {
                console.eb_log("eb error :");
                console.eb_log(e);
                EbMessage("show", { Message: `Error in 'OnChange fn or BehaviourExpression': ${control.Name} - ${e.message}`, AutoHide: true, Background: '#aa0000' });
            }
        }

    };

    this.bindFnsToCtrl = function (Obj) {
        if (Obj.Required)
            this.bindRequired(Obj);
        if (Obj.Unique)
            this.bindUniqueCheck(Obj);

        if (Obj.DependedValExp.$values.length > 0 || (Obj.DependedDG && Obj.DependedDG.$values.length > 0) || Obj.DataImportId || (Obj.IsImportFromApi && Obj.ImportApiUrl))
            this.bindValueUpdateFns_OnChange(Obj);

        if (Obj.DrDependents.$values.length > 0)
            this.bindDrUpdateFns_OnChange(Obj);

        if ((Obj.OnChangeFn && Obj.OnChangeFn.Code && Obj.OnChangeFn.Code.trim() !== "") ||
            Obj.HiddenExpDependants && Obj.HiddenExpDependants.$values.length > 0 ||
            Obj.DisableExpDependants && Obj.DisableExpDependants.$values.length > 0)
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

    this.wrapInFn = function (fn) { return `(function(){${fn}})();` };

    this.bindValueUpdateFns_OnChange = function (control) {//2nd onchange Fn bind
        try {
            let FnString =
                ((control.DependedValExp && control.DependedValExp.$values.length !== 0 || control.DependedDG && control.DependedDG.$values.length !== 0 || control.DataImportId || (control.IsImportFromApi && control.ImportApiUrl)) ? `
                if(!this.___isNotUpdateValExpDepCtrls){
                    form.updateDependentControls(${control.__path}, form);
                }
                this.___isNotUpdateValExpDepCtrls = false;` : "");
            let onChangeFn = new Function("form", "user", `event`, FnString).bind(control, this.FO.formObject, this.FO.userObject);
            control.bindOnChange(onChangeFn);
        } catch (e) {
            console.eb_log("eb error :");
            console.eb_log(e);
            EbMessage("show", { Message: `Error in 'ValueExpression': ${control.Name} - ${e.message}`, AutoHide: true, Background: '#aa0000' });
        }
    };

    this.bindDrUpdateFns_OnChange = function (control) {//2.5nd onchange Fn bind
        let FnString =
            ((control.DrDependents && control.DrDependents.$values.length !== 0 || control.DependedDG && control.DependedDG.$values.length !== 0 || control.DataImportId || (control.IsImportFromApi && control.ImportApiUrl)) ? `
                    form.updateDependentCtrlWithDr(${control.__path}, form);` : "");
        let onChangeFn = new Function("form", "user", `event`, FnString).bind(control, this.FO.formObject, this.FO.userObject);
        control.bindOnChange(onChangeFn);
    };

    this.bindBehaviorFns_OnChange = function (control) {// 3rd onchange Fn bind
        try {
            let FnString =
                this.wrapInFn(atob(control.OnChangeFn.Code)) +
                ((control.HiddenExpDependants && control.HiddenExpDependants.$values.length !== 0 || control.DisableExpDependants && control.DisableExpDependants.$values.length !== 0) ? ` ;
                    form.updateDependentControlsBehavior(${control.__path}, form);` : "");
            let onChangeFn = new Function("form", "user", `event`, FnString).bind(control, this.FO.formObject, this.FO.userObject);
            control.__onChangeFn = onChangeFn;// for FD only need clenup
            control.bindOnChange(onChangeFn);
        } catch (e) {
            console.eb_log("eb error :");
            console.eb_log(e);
            EbMessage("show", { Message: `Error in 'OnChange fn or BehaviourExpression': ${control.Name} - ${e.message}`, AutoHide: true, Background: '#aa0000' });
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

    this.populateSSCtrlsWithInitialVal = function (formObj) {
        let allTypeRGCtrls = getFlatObjOfTypes(formObj, ["SimpleSelect", "PowerSelect"]);
        for (let i = 0; i < allTypeRGCtrls.length; i++) {
            let ctrl = allTypeRGCtrls[i];
            if (ctrl.ObjType === "SimpleSelect" || (ctrl.ObjType === "PowerSelect" && ctrl.RenderAsSimpleSelect))
                ctrl.setValue(ctrl.getValueFromDOM());
        }
    };

    this.DataValsUpdate = function (form, user, event) {
        if (!this.___DoNotUpdateDataVals) {
            if (this.DataVals) {
                this.DataVals.Value = this.getValueFromDOM();
                this.DataVals.D = this.getDisplayMemberFromDOM();

                if (this.ObjType === 'PowerSelect' && this.__continue) {
                    this.__continue();
                }
            }
        }
    };

    this.bindEbFnOnChange = function (control) {//1st onchange Fn bind
        try {
            control.__onChangeFn = this.DataValsUpdate.bind(control, this.FO.formObject, this.FO.userObject); // takes a copy
            control.bindOnChange(control.__onChangeFn);// binding to onchange
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

    this.UpdateDrDepCtrls = function (curCtrl) {
        for (let i = 0; i < curCtrl.DrDependents.$values.length; i++) {
            let depCtrl_s = curCtrl.DrDependents.$values[i];
            let depCtrl = this.FO.formObject.__getCtrlByPath(depCtrl_s);
            if (depCtrl === "not found")
                return;
            if (depCtrl.ObjType === "TVcontrol") {
                depCtrl.reloadWithParam(curCtrl);
            }
            else if (depCtrl.ObjType === "PowerSelect") {
                if (!curCtrl.__isInitiallyPopulating && !curCtrl.___DoNotUpdateDrDepCtrls) {
                    if (depCtrl.initializer && (!depCtrl.IsDGCtrl || (depCtrl.IsDGCtrl && depCtrl.__DG.RowCount > 0))) {
                        depCtrl.initializer.reloadWithParams(curCtrl);
                    }
                }
                else {
                    curCtrl.__isInitiallyPopulating = false;
                    curCtrl.___DoNotUpdateDrDepCtrls = false;
                }
            }
        }
    }.bind(this);

    this.validateCtrl = function (ctrl) {
        this.isRequiredOK(ctrl);
        this.isValidationsOK(ctrl);
        this.sysValidationsOK(ctrl);
    };

    this.waitLoop = function (depCtrl, curCtrl, index) {
        depCtrl.__continue = null;
        this.UpdateValExpDepCtrls(curCtrl, index);
    };

    this.UpdateValExpDepCtrls = function (curCtrl, index) {
        let i = typeof (index) === 'number' ? (index + 1) : 0;
        for (; i < curCtrl.DependedValExp.$values.length; i++) {
            let depCtrl_s = curCtrl.DependedValExp.$values[i];
            let depCtrl = this.FO.formObject.__getCtrlByPath(depCtrl_s);
            if (depCtrl === "not found")
                continue;
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
                                // if persist - manual onchange only setValue. DoNotPersist always setValue
                                if (depCtrl.ObjType === 'PowerSelect') {
                                    depCtrl.__continue = this.waitLoop.bind(this, depCtrl, curCtrl, i);
                                    depCtrl.justSetValue(ValueExpr_val);
                                    EbBlink(depCtrl);
                                    break;
                                }
                                else {
                                    depCtrl.justSetValue(ValueExpr_val);
                                    this.validateCtrl(depCtrl);
                                    EbBlink(depCtrl);
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
                        let filterValues = [];
                        $.each(depCtrl.ValExpParams.$values, function (i, depCtrl_s) {
                            let paramCtrl = this.FO.formObject.__getCtrlByPath(depCtrl_s);
                            filterValues.push(new fltr_obj(paramCtrl.EbDbType > 0 ? paramCtrl.EbDbType : 16, paramCtrl.Name, paramCtrl.getValue()));
                        }.bind(this));
                        filterValues.push(new fltr_obj(11, "eb_loc_id", ebcontext.locations.getCurrent()));
                        filterValues.push(new fltr_obj(11, "eb_currentuser_id", ebcontext.user.UserId));
                        filterValues.push(new fltr_obj(11, "id", this.FO.rowId));
                        depCtrl.__continue = this.waitLoop.bind(this, depCtrl, curCtrl, i);
                        this.ExecuteSqlValueExpr(depCtrl, filterValues, 0);
                        break;
                    }
                }
            }
            catch (e) {
                console.eb_log("eb error :");
                console.eb_log(e);
                EbMessage("show", { Message: `Error in 'ValueExpression': ${curCtrl.Name} - ${e.message}`, AutoHide: true, Background: '#aa0000' });
            }
        }

        if (i === curCtrl.DependedValExp.$values.length && curCtrl.__continue2) {
            curCtrl.__continue2();
            curCtrl.__continue2 = null;
        }
    }.bind(this);

    this.ExecuteSqlValueExpr = function (depCtrl, filterValues, type) {
        this.FO.showLoader();
        $.ajax({
            type: "POST",
            url: "/WebForm/ExecuteSqlValueExpr",
            data: { _refid: this.FO.FormObj.RefId, _triggerctrl: depCtrl.Name, _params: filterValues, _type: type },
            error: function (xhr, ajaxOptions, thrownError) {
                EbMessage("show", { Message: `Couldn't Update ${depCtrl.Label || depCtrl.Name}, Something Unexpected Occurred`, AutoHide: true, Background: '#aa0000' });
                this.FO.hideLoader();
                if (depCtrl.__continue) depCtrl.__continue();
            }.bind(this),
            success: function (ctrl, val) {
                this.FO.hideLoader();
                val = JSON.parse(val);
                if (val) {
                    val.Value = this.getProcessedValue(ctrl, val.Value);
                    depCtrl.justSetValue(val.Value);
                }
                else
                    console.error('ExecuteSqlValueExpr did not respond properly: ' + ctrl.Name);
                if (depCtrl.ObjType !== 'PowerSelect' && depCtrl.__continue) {
                    depCtrl.__continue();
                }
            }.bind(this, depCtrl)
        });
    };

    this.importDGRelatedUpdates = function (DependedDGs) {
        $.each(DependedDGs, function (i, depCtrl_s) {
            try {
                let depCtrl = this.FO.formObject.__getCtrlByPath(depCtrl_s);
                if (depCtrl.DataSourceId && (this.FO.Mode.isNew || (depCtrl.IsLoadDataSourceInEditMode && (this.FO.Mode.isEdit || this.FO.Mode.isView))))
                    depCtrl.__setSuggestionVals();
            }
            catch (e) {
                console.eb_log("eb error :");
                console.eb_log(e);
                EbMessage("show", { Message: `Error in 'ValueExpression': ${curCtrl.Name} - ${e.message}`, AutoHide: true, Background: '#aa0000' });
            }
        }.bind(this));
    }.bind(this);

    this.PSImportRelatedUpdates = function (curCtrl) {
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
                    depCtrl.__IsDisableByExp = true;
                }
                else {
                    if (!this.FO.Mode.isView) {
                        depCtrl.enable();
                        depCtrl.__IsDisableByExp = false;
                    }
                }
            }
        }
    }.bind(this);

    this.setUpdateDependentControlsFn = function () {
        this.FO.formObject.updateDependentControls = function (curCtrl) { //calls in onchange
            if (event && curCtrl.ObjType === "Date") { // to manage unnecessorily change triggering while blur from date pluggin
                if (!curCtrl.__lastval) {
                    curCtrl.__lastval = this.getOldDataVal(this.FO.formDataBackUp, curCtrl);
                }
                if (curCtrl.getValue() !== curCtrl.__lastval)
                    curCtrl.__lastval = curCtrl.getValue();
                else
                    return;
            }
            if (curCtrl.DependedValExp && curCtrl.DependedValExp.$values.length !== 0) {
                curCtrl.__continue2 = this.updateDependentControls_inner.bind(this, curCtrl);
                this.UpdateValExpDepCtrls(curCtrl);
            }
            else
                this.updateDependentControls_inner(curCtrl);
        }.bind(this);
    };

    this.updateDependentControls_inner = function (curCtrl) {
        if (curCtrl.DependedDG && curCtrl.DependedDG.$values) {
            this.importDGRelatedUpdates(curCtrl.DependedDG.$values);
        }
        if ((curCtrl.DataImportId || (curCtrl.IsImportFromApi && curCtrl.ImportApiUrl)) && this.FO.Mode.isNew) {
            if (!curCtrl.___DoNotImport)
                this.PSImportRelatedUpdates(curCtrl);
            curCtrl.___DoNotImport = false;
        }
    };

    this.setUpdateDependentCtrlWithDrFn = function () {
        this.FO.formObject.updateDependentCtrlWithDr = function (curCtrl) { //calls in onchange
            if (event && event.type === "blur" && curCtrl.ObjType === "Date") // to manage unnecessorily change triggering while blur from date pluggin
                return;
            if (curCtrl.DrDependents && curCtrl.DrDependents.$values.length !== 0) {
                this.UpdateDrDepCtrls(curCtrl);
            }
        }.bind(this);
    };

    this.setUpdateDependentControlsBehaviorFns = function () {
        this.FO.formObject.updateDependentControlsBehavior = function (curCtrl) { //calls in onchange
            if (event && event.type === "blur" && curCtrl.ObjType === "Date") // to manage unnecessorily change triggering while blur from date pluggin
                return;
            if (curCtrl.HiddenExpDependants && curCtrl.HiddenExpDependants.$values.length !== 0) {
                this.UpdateHideExpDepCtrls(curCtrl);
            }
            if (curCtrl.DisableExpDependants && curCtrl.DisableExpDependants.$values.length !== 0) {
                this.UpdateDisableExpDepCtrls(curCtrl);
            }
        }.bind(this);
    };

    this.getOldDataVal = function (formDataBackUp, ctrlObj) {
        let val = null;
        $.each(formDataBackUp.MultipleTables, function (i, Table) {
            for (let x = 0; x < Table.length; x++) {
                let Column = Table[x].Columns.find(e => e.Name === ctrlObj.Name);
                if (Column) {
                    val = Column.Value;
                    return false;
                }
            }
        }.bind(this));
        return val;
    };

    this.bindRequired = function (control) {
        if (control.ObjType === "SimpleSelect" || control.RenderAsSimpleSelect)
            $("#cont_" + control.EbSid_CtxId + " .dropdown-toggle").on("blur", this.isRequiredOK.bind(this, control)).on("focus", this.removeInvalidStyle.bind(this, control));
        else
            $("#" + control.EbSid_CtxId).on("blur", this.isRequiredOK.bind(this, control)).on("focus", this.removeInvalidStyle.bind(this, control));
    };

    this.bindUniqueCheck = function (control) {
        $("#" + control.EbSid_CtxId).on("input", debounce(this.checkUnique.bind(this, control), 1000)); //delayed check 
        ///.on("blur.dummyNameSpace", this.checkUnique.bind(this, control));
    };

    this.isSameValInUniqCtrl = function (ctrl) {
        let val = ctrl.getValueFromDOM();
        if (typeof val === 'string')
            val = val.trim().toLowerCase();
        let initVal = this.FO.uniqCtrlsInitialVals[ctrl.EbSid];
        if (typeof initVal === 'string')
            initVal = initVal.trim().toLowerCase();
        return val === initVal;
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
        else if (ctrl.ObjType === "Date" && ctrl.RestrictionRule > 0) {
            if (!ebcontext.finyears.checkDate(ctrl.getValue(), ctrl.RestrictionRule === 2)) {
                ctrl.addInvalidStyle("Must be between " + ebcontext.finyears.getDateRangeToDisplay(ctrl.RestrictionRule === 2), 'warning');
                return false;
            }
        }
        return true;
    };

    /////////////
    this.AllRequired_valid_Check = function (ctrlsArray = this.FO.flatControlsWithDG) {
        let required_valid_flag = true;
        let $notOk1stCtrl = null;
        let notOk1stCtrl = null;
        $.each(ctrlsArray, function (i, ctrl) {
            let $ctrl = $("#" + ctrl.EbSid_CtxId);
            if (this.FO.EbAlert)
                this.FO.EbAlert.clearAlert(ctrl.EbSid_CtxId + "-al");
            if (!this.isRequiredOK(ctrl) || !this.isValidationsOK(ctrl) || !this.sysValidationsOK(ctrl)) {
                required_valid_flag = false;
                this.addInvalidStyle2TabPanes(ctrl);
                if (this.FO.EbAlert) {
                    this.FO.EbAlert.alert({
                        id: ctrl.EbSid_CtxId + "-al",
                        head: "Required",
                        body: " : <div tabindex='1' class='eb-alert-item' cltrof='" + ctrl.EbSid_CtxId + "' onclick='ebcontext.webform.RenderCollection[" + this.FO.__MultiRenderCxt + "].FRC.goToCtrlwithEbSid()'>"
                            + ctrl.Label + (ctrl.Hidden ? ' <b>(Hidden)</b>' : '') + '<i class="fa fa-external-link-square" aria-hidden="true"></i></div>',
                        type: "danger"
                    });
                }

                if (!$notOk1stCtrl) {
                    $notOk1stCtrl = $ctrl;
                    notOk1stCtrl = ctrl;
                }
            }
        }.bind(this));

        if ($notOk1stCtrl && $notOk1stCtrl.length !== 0) {
            this.GoToCtrl(notOk1stCtrl);
        }
        required_valid_flag = required_valid_flag && this.runFormValidations();
        if (this.FO.headerObj && this.FO.EbAlert) {
            if (!required_valid_flag)
                this.FO.headerObj.showElement([this.FO.hBtns['GotoInvalid']]);
            else
                this.FO.headerObj.hideElement([this.FO.hBtns['GotoInvalid']]);
        }

        return required_valid_flag;
    }.bind(this);

    this.invalidBoxOnClose = function () {
        if ($(event.target).closest('.ebalert-cont').children('.alert').length === 1)
            $(`#${this.FO.FormObj.EbSid_CtxId + "_formAlertBox"}`).hide();
    }.bind(this);

    this.GoToCtrl = function (ctrl, parent) {
        let $inp = (ctrl.ObjType === "PowerSelect" && !ctrl.RenderAsSimpleSelect) ? $(ctrl.initializer.$searchBoxes[0]) : $("#" + ctrl.EbSid_CtxId);
        this.activateTabHierarchy(ctrl, parent);
        setTimeout(function () {
            $inp[0].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            setTimeout(function () {
                $inp.select();
                EbBlink(ctrl);
            }, 400);
        }.bind(this), (ctrl.__noOfParentPanes || 0) * 400);
    };

    this.toggleInvalidMSGs = function () {
        if ($(`#${this.FO.FormObj.EbSid_CtxId + "_formAlertBox"}`).css('display') === 'none')
            this.AllRequired_valid_Check();
        $(`#${this.FO.FormObj.EbSid_CtxId + "_formAlertBox"}`).toggle();
    };

    this.goToCtrlwithEbSid = function () {
        let ebSid_CtxId = $(event.target).closest("div").attr("cltrof");
        let flatCtrls = getAllctrlsFrom(this.FO.FormObj);
        let ctrl = getObjByval(flatCtrls, "EbSid_CtxId", ebSid_CtxId)
        this.GoToCtrl(ctrl);
    };

    this.activateTabHierarchy = function (ctrl, parent) {
        let TabPaneParents = parent ? getParentsOfType('TabPane', parent, this.FO.FormObj) : getParentsOfType('TabPane', ctrl, this.FO.FormObj);
        ctrl.__noOfParentPanes = TabPaneParents.length;
        for (let i = TabPaneParents.length - 1; i >= 0; i--) {
            let $a = $(`a[href='#${TabPaneParents[i].EbSid_CtxId}']`);
            if ($a.closest('ul').parent().hasClass('RenderAsWizard'))
                $a.trigger('click');
            else
                $a.tab('show');
        }
    };

    this.addInvalidStyle2TabPanes = function (ctrl) {
        let TabPaneParents = getParentsOfType('TabPane', ctrl, this.FO.FormObj);
        for (let i = TabPaneParents.length - 1; i >= 0; i--) {
            let $el = $(`a[href='#${TabPaneParents[i].EbSid_CtxId}']>.eb-tab-warn-icon-cont`);
            let attrval = 'invalid-by-' + ctrl.EbSid_CtxId;
            $el.addClass(attrval);
            let ebinvalCtrls = $el.attr('ebinval-ctrls') || '';
            ebinvalCtrls = ebinvalCtrls.replaceAll(' ' + attrval, '') + ' ' + attrval;
            $el.attr('ebinval-ctrls', ebinvalCtrls);
            let ctrls = $el[0].className.replace('eb-tab-warn-icon-cont ', '').split(' ');
            let content = 'issues in : ';

            ctrls.every(function (inval_ebSid_CtxId) {
                let ebSid_CtxId = inval_ebSid_CtxId.replace('invalid-by-', '');
                let flatCtrls = getAllctrlsFrom(this.FO.FormObj);
                content += getObjByval(flatCtrls, "EbSid_CtxId", ebSid_CtxId).Label + ', ';
            }.bind(this))

            $el.attr("data-content", content.replace(/, \s*$/, ""));
            let root_cont_id = $el.closest('[eb-root-obj-container]').attr('id');
            if ($el.attr('set-hover') !== 'true') {
                $el.popover({
                    trigger: 'hover',
                    html: true,
                    container: '#' + root_cont_id
                });
                $el.attr('set-hover', 'true');
            }
        }
    };

    this.checkUnique4All_save = function (controls, isSaveAfter) {/////////////// move  
        let isFromCtrl = !isSaveAfter;
        if (isFromCtrl)
            var $ctrl_ = $("#" + controls[0].EbSid_CtxId);
        let UniqObjs = [];
        let UniqCtrls = {};

        $.each(controls, function (i, ctrl) {
            if (ctrl.Unique) {
                let $ctrl = $("#" + ctrl.EbSid_CtxId);
                let val = ctrl.getValueFromDOM();

                if (isNaNOrEmpty(val) || ctrl.ObjType === "Numeric" && val === 0// avoid check if numeric and value is 0
                    || Object.entries(this.FO.uniqCtrlsInitialVals).length !== 0 && this.isSameValInUniqCtrl(ctrl)) {// avoid check if edit mode and value is same as initial

                    $ctrl.attr("uniq-ok", "true");
                    ctrl.removeInvalidStyle();
                    hide_inp_loader($ctrl, this.FO.$saveBtn);
                    return;
                }

                let tableName = ctrl.TableName || this.FO.FormObj.TableName;
                let UniqObj = { TableName: tableName, Field: ctrl.Name, Value: val, TypeI: ctrl.EbDbType };

                UniqObjs.push(UniqObj);
                UniqCtrls[ctrl.Name] = ctrl;
            }
        }.bind(this));

        if (UniqObjs.length === 0 && !isSaveAfter) {
            this.FO.LockSave = false;
            return true;
        }

        if (UniqObjs.length === 0 && isSaveAfter) {
            this.FO.saveForm_call();
            return true;
        }

        if (isFromCtrl) {
            hide_inp_loader($ctrl_, this.FO.$saveBtn);
            show_inp_loader($ctrl_, this.FO.$saveBtn);
        }
        else {
            this.FO.hideLoader();
            this.FO.showLoader();
        }

        $.ajax({
            type: "POST",
            url: "../WebForm/DoUniqueCheck",
            data: { uniqCheckParams: UniqObjs },
            success: function (resS) {
                let res = JSON.parse(resS);
                let unique_flag = true;


                if (isFromCtrl)
                    hide_inp_loader($ctrl_, this.FO.$saveBtn);
                else
                    this.FO.hideLoader();

                let ctrlNames = Object.keys(res);
                for (let i = 0; i < ctrlNames.length; i++) {
                    let ctrlName = ctrlNames[i];
                    let ctrl = UniqCtrls[ctrlName];
                    let $ctrl = $("#" + ctrl.EbSid_CtxId);
                    let ctrlRes = res[ctrlName];

                    if (!ctrlRes) {
                        $ctrl.attr("uniq-ok", "false");
                        ctrl.addInvalidStyle("This field is unique, try another value");
                        unique_flag = false;
                    }
                    else {
                        $ctrl.attr("uniq-ok", "true");
                        ctrl.removeInvalidStyle();
                    }
                }

                if (isSaveAfter && unique_flag) {
                    //this.FO.DGsB4SaveActions();
                    this.FO.saveForm_call();
                }
                else
                    this.FO.LockSave = false;
            }.bind(this),
            error: function (error) {
                if (isFromCtrl) {
                    hide_inp_loader($ctrl_, this.FO.$saveBtn);
                    EbMessage("show", { Message: `Unique check for ${controls[0].Label || controls[0].Name} failed`, AutoHide: true, Background: '#aa0000' });
                }
                else {
                    this.FO.hideLoader();
                    EbMessage("show", { Message: `Unique check failed`, AutoHide: true, Background: '#aa0000' });
                }
                this.FO.LockSave = false;
            }.bind(this)
        });
    };

    this.checkUnique = function (ctrl) {
        this.checkUnique4All_save([ctrl], false);
    }

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
            let valRes = func();
            if (valRes === false) {
                if (!Validator.IsWarningOnly) {
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
            let valRes = func();
            if (valRes === false) {
                //EbMakeInvalid(ctrl, `#cont_${ctrl.EbSid_CtxId}`, `#${ctrl.EbSid_CtxId}Wraper`, Validator.FailureMSG, Validator.IsWarningOnly ? "warning" : "danger");
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

    this.removeInvalidStyle = function (ctrl) {
        let contSel = `#cont_${ctrl.EbSid_CtxId}`;
        if (ctrl.IsDGCtrl)
            contSel = '#td_' + ctrl.EbSid_CtxId;
        EbMakeValid(contSel, `.ctrl-cover`, ctrl);
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
        //if (ctrl.ObjType === "PowerSelect" && !ctrl.RenderAsSimpleSelect)
        //    EbMakeInvalid(ctrl,`#cont_${ctrl.EbSid_CtxId}`, `#${ctrl.EbSid_CtxId}Wraper`, msg, type);
        //else
        let contSel = '#cont_' + ctrl.EbSid_CtxId;
        if (ctrl.IsDGCtrl)
            contSel = '#td_' + ctrl.EbSid_CtxId;
        EbMakeInvalid(ctrl, contSel, `.ctrl-cover`, msg, type);
    };

    //#region SingleBinding - New ---------------------------------------------------

    this.GetDepHandleObj_ForDefValExpr = function (CtrlPaths, ExprName) {
        let DepHandleObj = {
            curCtrl: {},
            isInitSetup: true,
            exprName: ExprName,
            ValueP: [], ValueC: [],
            DrPaths: [], DrCtrls: [],
            HideP: [], HideC: [],
            DisableP: [], DisableC: []
        };

        this.GetDepHandleObj_ForDefValExpr_inner(CtrlPaths, DepHandleObj, 'ValueP', 'ValueC');
        let a = DepHandleObj.ValueC;
        for (let i = 0; i < a.length; i++) {
            a[i].__lockDependencyExec = true;
        }

        a = this.FO.flatControls;
        for (let i = 0; i < a.length; i++) {
            this.GetDepHandleObj_ForDefValExpr_inner(a[i].HiddenExpDependants, DepHandleObj, 'HideP', 'HideC');
            this.GetDepHandleObj_ForDefValExpr_inner(a[i].DisableExpDependants, DepHandleObj, 'DisableP', 'DisableC');
        }

        if (!this.FO.__fromImport) {
            for (let i = 0; i < a.length; i++) {
                let dd = a[i].DrDependents.$values;
                for (let j = 0; j < dd.length; j++) {
                    let _ctrl = this.FO.formObject.__getCtrlByPath(dd[j]);
                    if (_ctrl === 'not found')
                        continue;
                    if (_ctrl.ObjType === "TVcontrol") {
                        if (!DepHandleObj.DrPaths.includes(dd[j])) {
                            DepHandleObj.DrPaths.push(dd[j]);
                            DepHandleObj.DrCtrls.push(_ctrl);
                            _ctrl.__filterControls = [];
                        }
                        _ctrl.__filterControls.push(a[i]);
                    }
                    else if (_ctrl.ObjType === "DataGrid" && this.FO.Mode.isNew) {
                        if (!DepHandleObj.DrPaths.includes(dd[j])) {
                            DepHandleObj.DrPaths.push(dd[j]);
                            DepHandleObj.DrCtrls.push(_ctrl);
                        }
                    }
                }
            }
            if (ExprName === 'DefaultValueExpression') {
                for (let i = 0; i < this.FO.DGs.length; i++) {
                    if (this.FO.DGs[i].Eb__paramControls && this.FO.DGs[i].Eb__paramControls.$values.length === 0) {
                        DepHandleObj.DrPaths.push('form.' + this.FO.DGs[i].Name);
                        DepHandleObj.DrCtrls.push(this.FO.DGs[i]);
                    }
                }
            }
        }
        this.FO.__fromImport = false;
        return DepHandleObj;
    };

    this.GetDepHandleObj_ForDefValExpr_inner = function (ctrlPaths, DepHandleObj, prop1, prop2) {
        if (ctrlPaths && ctrlPaths.$values) {
            let a = ctrlPaths.$values;
            for (let i = 0; i < a.length; i++) {
                let ctrl = this.FO.formObject.__getCtrlByPath(a[i]);
                if (ctrl != 'not found' && !DepHandleObj[prop1].includes(a[i])) {
                    DepHandleObj[prop1].push(a[i]);
                    DepHandleObj[prop2].push(ctrl);
                }
            }
        }
    };

    this.execAllValExprForDoNotPersistCtrls = function () {
        if (!this.FO.FormObj.DoNotPersistExecOrder) {//for old forms
            console.error("Eb error: DoNotPersistExecOrder not found,  please try saving form in dev side");
            return;
        }
        let DepHandleObj = this.GetDepHandleObj_ForDefValExpr(this.FO.FormObj.DoNotPersistExecOrder, 'ValueExpr');
        this.ctrlChangeListener_inner0(DepHandleObj);
    };

    this.execAllDefaultValExpr = function () {
        let DepHandleObj;
        if (this.FO.mode != "Clone Mode" && this.FO.mode != "Draft Mode") { // DefValExpr blocked for Clone & Draft. In Export, it will exec[21.08.04]
            if (!this.FO.FormObj.DefaultValsExecOrder) {//for old forms
                console.error("Eb error: defaultValsExecOrder not found,  please try saving form in dev side");
                return;
            }
            DepHandleObj = this.GetDepHandleObj_ForDefValExpr(this.FO.FormObj.DefaultValsExecOrder, 'DefaultValueExpression');
            this.ctrlChangeListener_inner0(DepHandleObj);
        }
    };

    this.GetDepHandleObj = function (curCtrl) {
        let DepHandleObj = {
            curCtrl: curCtrl,
            isInitSetup: false,
            exprName: 'ValueExpr',
            ValueP: [], ValueC: [],
            DrPaths: [], DrCtrls: [],
            HideP: [], HideC: [],
            DisableP: [], DisableC: []
        };
        this.DepHandleObj_create_rec(null, DepHandleObj, []);
        return DepHandleObj;
    };

    this.DepHandleObj_create_rec = function (depCtrl, DepHandleObj, predCtrls) {
        this.DepHandleObj_create_inner_val(depCtrl, 'DependedValExp', DepHandleObj, 'ValueP', 'ValueC', predCtrls);
        this.DepHandleObj_create_rec_inner(depCtrl, 'DrDependents', DepHandleObj, 'DrPaths', 'DrCtrls', false);
        this.DepHandleObj_create_inner_HD(depCtrl, 'HiddenExpDependants', DepHandleObj, 'HideP', 'HideC');
        this.DepHandleObj_create_inner_HD(depCtrl, 'DisableExpDependants', DepHandleObj, 'DisableP', 'DisableC');
    };

    this.DepHandleObj_create_inner_val = function (depCtrl, Prop, DepHandleObj, prop1, prop2, predCtrls) {
        if (depCtrl === null)
            depCtrl = DepHandleObj.curCtrl;

        predCtrls.push(depCtrl.__path);//predecessors

        if (depCtrl[Prop] && depCtrl[Prop].$values.length > 0) {
            let a = depCtrl[Prop].$values;
            for (let i = 0; i < a.length; i++) {
                let nxtCtrl = this.FO.formObject.__getCtrlByPath(a[i]);
                if (nxtCtrl == 'not found')
                    continue;
                if (predCtrls.includes(a[i]))
                    continue;
                if (depCtrl.__path === a[i])
                    continue;
                nxtCtrl.__lockDependencyExec = false;
                let indx = DepHandleObj[prop1].indexOf(a[i]);
                if (indx >= 0) {
                    let commindx = -1;
                    for (let j = indx; j <= DepHandleObj[prop1].length; j++) {
                        if (predCtrls.includes(DepHandleObj[prop1][j])) {
                            commindx = j;
                            break;
                        }
                    }
                    if (commindx >= 0) {
                        let arr1 = DepHandleObj[prop1].splice(indx, commindx - indx);
                        let arr2 = DepHandleObj[prop2].splice(indx, commindx - indx);
                        DepHandleObj[prop1] = DepHandleObj[prop1].concat(arr1);
                        DepHandleObj[prop2] = DepHandleObj[prop2].concat(arr2);
                    }
                }
                else {
                    DepHandleObj[prop1].push(a[i]);
                    DepHandleObj[prop2].push(nxtCtrl);
                    if (!nxtCtrl.___isNotUpdateValExpDepCtrls)
                        nxtCtrl.__lockDependencyExec = true;
                    this.DepHandleObj_create_rec(nxtCtrl, DepHandleObj, predCtrls.slice(0));
                }
            }
        }
    };

    this.DepHandleObj_create_inner_HD = function (depCtrl, Prop, DepHandleObj, prop1, prop2) {
        if (depCtrl === null)
            depCtrl = DepHandleObj.curCtrl;
        if (depCtrl[Prop] && depCtrl[Prop].$values.length > 0) {
            let a = depCtrl[Prop].$values;
            for (let i = 0; i < a.length; i++) {
                let nxtCtrl = this.FO.formObject.__getCtrlByPath(a[i]);
                if (nxtCtrl != 'not found' && !DepHandleObj[prop1].includes(a[i])) {
                    DepHandleObj[prop1].push(a[i]);
                    DepHandleObj[prop2].push(nxtCtrl);
                }
            }
        }
    };

    this.DepHandleObj_create_rec_inner = function (depCtrl, Prop, DepHandleObj, prop1, prop2, rec) {
        if (DepHandleObj.curCtrl === depCtrl)
            return;
        if (depCtrl === null)
            depCtrl = DepHandleObj.curCtrl;
        if (depCtrl[Prop] && depCtrl[Prop].$values.length > 0) {
            let a = depCtrl[Prop].$values;
            for (let i = 0; i < a.length; i++) {
                let nxtCtrl = this.FO.formObject.__getCtrlByPath(a[i]);
                if (nxtCtrl != 'not found') {
                    nxtCtrl.__lockDependencyExec = false;
                    let indx = DepHandleObj[prop1].indexOf(a[i]);
                    if (indx >= 0) {
                        DepHandleObj[prop1].splice(indx, 1);
                        DepHandleObj[prop2].splice(indx, 1);
                    }
                    let ph = true;
                    if (Prop === 'DrDependents') {
                        if (nxtCtrl.ObjType === 'DataGrid') {
                            let x = DepHandleObj[prop1].findIndex(e => e.includes(a[i]));
                            while (x >= 0) {
                                DepHandleObj[prop1].splice(x, 1);
                                DepHandleObj[prop2].splice(x, 1);
                                x = DepHandleObj[prop1].findIndex(e => e.includes(a[i]));
                            }
                        }
                        else if (nxtCtrl.ObjType === 'PowerSelect' && nxtCtrl.IsDGCtrl) {
                            let dgpath = a[i].substring(0, a[i].lastIndexOf('.'));
                            let x = DepHandleObj[prop1].findIndex(e => e === dgpath);
                            if (x >= 0)
                                ph = false;
                        }
                    }
                    if (ph) {
                        DepHandleObj[prop1].push(a[i]);
                        DepHandleObj[prop2].push(nxtCtrl);

                        if (rec) {
                            if (!nxtCtrl.___isNotUpdateValExpDepCtrls && Prop === 'DependedValExp')
                                nxtCtrl.__lockDependencyExec = true;
                            this.DepHandleObj_create_rec(nxtCtrl, DepHandleObj);
                        }
                    }
                }
            }
        }
    };

    this.bindFunctionToDG = function (DG) {
        $.each(DG.Controls.$values, function (i, col) {// need change
            col.bindOnChange({ form: this.FO.formObject, col: col, DG: DG, user: this.FO.userObject }, this.DgchangeListener.bind(this, col));
        }.bind(this));
    };

    this.DgchangeListener = function (Obj, event) {
        //let __this = form.__getCtrlByPath(this.__path);
        let __this = $(event.target).data('ctrl_ref');// when trigger change from setValue(if the setValue called from inactive row control)
        if (__this === undefined)
            __this = this.FO.formObject.__getCtrlByPath(Obj.__path);
        let valChanged = false;
        if (__this.DataVals !== undefined) {
            let v = __this.getValueFromDOM();
            let d = __this.getDisplayMemberFromDOM();
            if (__this.ObjType === 'Numeric')
                v = parseFloat(v);
            if (__this.__isEditing) {
                valChanged = __this.curRowDataVals.Value != v;
                __this.curRowDataVals.Value = v;
                __this.curRowDataVals.D = d;
            }
            else {
                valChanged = __this.DataVals.Value != v;
                __this.DataVals.Value = v;
                __this.DataVals.D = d;

                if ($(event.target).data('ctrl_ref'))// when trigger change from setValue(if the setValue called from inactive row control) update DG table td
                    ebUpdateDGTD($('#td_' + __this.EbSid_CtxId));
            }
        }
        if (__this.___isNotUpdateValExpDepCtrls) {
            __this.___isNotUpdateValExpDepCtrls = false;
            return;
        }
        if (!valChanged)
            return;

        let DepHandleObj = this.GetDepHandleObj(__this);

        if (DepHandleObj.ValueP.length > 0) {
            __this.__continue2 = this.ctrlChangeListener_inner1.bind(this, DepHandleObj);
            this.UpdateDependency1(DepHandleObj);
        }
        else {
            this.ctrlChangeListener_inner1(DepHandleObj);
        }


    }.bind(this);

    this.bindFunctionToCtrls = function (flatControls) {
        $.each(flatControls, function (k, Obj) {
            Obj.bindOnChange(this.ctrlChangeListener.bind(this, Obj));

            if (Obj.Required) {
                if (Obj.ObjType === "SimpleSelect" || Obj.RenderAsSimpleSelect)
                    $("#cont_" + Obj.EbSid_CtxId + " .dropdown-toggle").on("blur", this.isRequiredOK.bind(this, Obj)).on("focus", this.removeInvalidStyle.bind(this, Obj));
                else
                    $("#" + Obj.EbSid_CtxId).on("blur", this.isRequiredOK.bind(this, Obj)).on("focus", this.removeInvalidStyle.bind(this, Obj));
            }

            if (Obj.Unique)
                $("#" + Obj.EbSid_CtxId).on("input", debounce(this.checkUnique.bind(this, Obj), 1000));

            if (Obj.Validators && Obj.Validators.$values.length > 0) {
                $("#" + Obj.EbSid_CtxId).on("blur", this.isValidationsOK.bind(this, Obj));
            }
        }.bind(this));
    };

    //listener entry point
    this.ctrlChangeListener = function (Obj, event) {

        let valChanged = Obj.getValue() != Obj.getValueFromDOM();

        if (valChanged) {
            if (Obj.DataVals) {
                Obj.DataVals.Value = Obj.getValueFromDOM();
                Obj.DataVals.D = Obj.getDisplayMemberFromDOM();

                if (Obj.ObjType === 'PowerSelect' && Obj.__continue) {
                    Obj.__continue();
                }
            }
        }

        if (valChanged && !this.FO.__fromImport && this.isPsImportFlow(Obj)) {
            //console.log('Ps import flow: ' + Obj.Name);
            this.FO.__fromImport = false;
            return;
        }

        if (Obj.__defaultValExprExec) {
            //console.log('default val expr: ' + Obj.Name);
            Obj.__defaultValExprExec = false;
            Obj.___isNotUpdateValExpDepCtrls = false;
            return;
        }

        if (this.FO.isInitiallyPopulating) {
            //console.log('initial loading: ' + Obj.Name);
            Obj.___isNotUpdateValExpDepCtrls = false;
            return;
        }

        if (Obj.___isNotUpdateValExpDepCtrls) {
            //console.log('should be from justsetvalue: ' + Obj.Name);
            Obj.___isNotUpdateValExpDepCtrls = false;
            return;
        }

        if (Obj.__lockDependencyExec) {
            //console.log('dependency execution blocked: ' + Obj.Name);
            return;
        }

        if (!valChanged) {
            //console.log('value not changed: ' + Obj.Name);
            return;
        }

        let DepHandleObj = this.GetDepHandleObj(Obj);
        this.ctrlChangeListener_inner0(DepHandleObj);
    };

    this.ctrlChangeListener_in = function (Obj) {
        if (Obj.ObjType === 'PowerSelect' && Obj.RefreshDpndcy) {
            let DepHandleObj = this.GetDepHandleObj(Obj);
            this.ctrlChangeListener_inner0(DepHandleObj);
        }
    }; 

    this.isPsImportFlow = function (ctrl) {
        let b = !1;
        if (ctrl.ObjType === 'PowerSelect' && (ctrl.DataImportId || (ctrl.IsImportFromApi && ctrl.ImportApiUrl)) && this.FO.Mode.isNew) {
            if (!ctrl.___DoNotImport && !ctrl.isEmpty()) {
                this.FO.psDataImport(ctrl);
                b = !0;
            }
            ctrl.___DoNotImport = false;
        }
        return b;
    };

    this.ctrlChangeListener_inner0 = function (DepHandleObj) {
        if (DepHandleObj.ValueP.length > 0 && !DepHandleObj.curCtrl.___isNotUpdateValExpDepCtrls) {
            DepHandleObj.curCtrl.__continue2 = this.ctrlChangeListener_inner1.bind(this, DepHandleObj);
            this.UpdateDependency1(DepHandleObj);
        }
        else {
            DepHandleObj.curCtrl.___isNotUpdateValExpDepCtrls = false;
            this.ctrlChangeListener_inner1(DepHandleObj);
        }
    };

    //val expr completed
    this.ctrlChangeListener_inner1 = function (DepHandleObj) {
        if (DepHandleObj.DrPaths.length > 0) {
            DepHandleObj.curCtrl.__continue3 = this.ctrlChangeListener_inner2.bind(this, DepHandleObj);
            this.UpdateDependency2(DepHandleObj);
        }
        else
            this.ctrlChangeListener_inner2(DepHandleObj);
    };

    //hidden disable onchange
    this.ctrlChangeListener_inner2 = function (DepHandleObj) {
        for (let i = 0; i < DepHandleObj.HideC.length; i++) {
            let depCtrl = DepHandleObj.HideC[i];
            let depCtrl_s = DepHandleObj.HideP[i];
            try {
                let code = atob(depCtrl.HiddenExpr.Code);
                let hideExpVal = new Function("form", "user", `event`, code).bind(depCtrl_s, this.FO.formObject, this.FO.userObject)();
                if (hideExpVal)
                    depCtrl.hide();
                else
                    depCtrl.show();
            }
            catch (e) {
                console.error(e);
                EbMessage("show", { Message: `Failed to execute 'HideExpression': ${depCtrl.Name} - ${e.message}`, AutoHide: true, Background: '#aa0000' });
            }
        }
        for (let i = 0; i < DepHandleObj.DisableC.length; i++) {
            let depCtrl = DepHandleObj.DisableC[i];
            let depCtrl_s = DepHandleObj.DisableP[i];
            try {
                let code = atob(depCtrl.DisableExpr.Code);
                let hideExpVal = new Function("form", "user", `event`, code).bind(depCtrl_s, this.FO.formObject, this.FO.userObject)();
                if (hideExpVal) {
                    depCtrl.disable();
                    depCtrl.__IsDisableByExp = true;
                }
                else {
                    if (!this.FO.Mode.isView) {
                        depCtrl.enable();
                        depCtrl.__IsDisableByExp = false;
                    }
                }
            }
            catch (e) {
                console.error(e);
                EbMessage("show", { Message: `Failed to execute 'ReadOnlyExpression': ${depCtrl.Name} - ${e.message}`, AutoHide: true, Background: '#aa0000' });
            }
        }
        if (DepHandleObj.isInitSetup)
            return;
        let chngFn = DepHandleObj.curCtrl.OnChangeFn;
        if (chngFn && chngFn.Code && chngFn.Code.trim() !== "") {
            try {
                new Function("form", "user", `event`, atob(chngFn.Code)).bind(DepHandleObj.curCtrl, this.FO.formObject, this.FO.userObject)();
            }
            catch (e) {
                console.error(e);
                EbMessage("show", { Message: `Failed to execute 'OnChange Function': ${DepHandleObj.curCtrl.Name} - ${e.message}`, AutoHide: true, Background: '#aa0000' });
            }
        }

    };

    //resume val expr
    this.resumeExec1 = function (depCtrl, DepHandleObj) {
        depCtrl.__continue = null;
        depCtrl.__lockDependencyExec = false;
        this.UpdateDependency1(DepHandleObj);
    };

    //ValueExpression
    this.UpdateDependency1 = function (DepHandleObj) {
        let curCtrl = DepHandleObj.curCtrl;
        if (DepHandleObj.ValueP.length === 0) {
            if (curCtrl.__continue2) {
                curCtrl.__continue2();
                curCtrl.__continue2 = null;
            }
            return;
        }
        let depCtrl_s = DepHandleObj.ValueP.splice(0, 1)[0]
        let depCtrl = DepHandleObj.ValueC.splice(0, 1)[0];
        let wait = false;
        depCtrl.__continue = null;

        if (depCtrl[DepHandleObj.exprName] && depCtrl[DepHandleObj.exprName].Code && depCtrl[DepHandleObj.exprName].Lang === 0) {
            let ValueExpr_val = null;
            try {
                let valExpFnStr = atob(depCtrl[DepHandleObj.exprName].Code);
                ValueExpr_val = new Function("form", "user", `event`, valExpFnStr).bind(depCtrl_s, this.FO.formObject, this.FO.userObject)();
                ValueExpr_val = this.getProcessedValue(depCtrl, ValueExpr_val);
            }
            catch (e) {
                console.error(e);
                EbMessage("show", { Message: `Failed to execute '${(DepHandleObj.exprName === 'ValueExpr' ? '' : 'Default')}ValueExpression': ${depCtrl.Name} - ${e.message}`, AutoHide: true, Background: '#aa0000' });
            }
            if (DepHandleObj.isInitSetup || this.FO.formObject.__getCtrlByPath(curCtrl.__path).IsDGCtrl || !depCtrl.IsDGCtrl) {
                // if persist - manual onchange only setValue. DoNotPersist always setValue
                if (depCtrl.ObjType === 'PowerSelect') {
                    depCtrl.__continue = this.resumeExec1.bind(this, depCtrl, DepHandleObj);
                    depCtrl.justSetValue(ValueExpr_val);
                    EbBlink(depCtrl);
                    wait = true;
                }
                else {
                    depCtrl.justSetValue(ValueExpr_val);
                    this.validateCtrl(depCtrl);
                    EbBlink(depCtrl);
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
        else if (depCtrl[DepHandleObj.exprName] && depCtrl[DepHandleObj.exprName].Lang === 2) {
            let filterValues = [];
            $.each(depCtrl.ValExpParams.$values, function (i, depCtrl_s) {
                let paramCtrl = this.FO.formObject.__getCtrlByPath(depCtrl_s);
                filterValues.push(new fltr_obj(paramCtrl.EbDbType > 0 ? paramCtrl.EbDbType : 16, paramCtrl.Name, paramCtrl.getValue()));
            }.bind(this));
            filterValues.push(new fltr_obj(11, "eb_loc_id", this.FO.getLocId()));
            filterValues.push(new fltr_obj(11, "eb_currentuser_id", ebcontext.user.UserId));
            filterValues.push(new fltr_obj(11, "id", this.FO.rowId));
            depCtrl.__continue = this.resumeExec1.bind(this, depCtrl, DepHandleObj);
            this.ExecuteSqlValueExpr(depCtrl, filterValues, DepHandleObj.exprName === 'ValueExpr' ? 0 : 1);
            wait = true;
        }
        if (!wait) {
            depCtrl.__lockDependencyExec = false;
            this.UpdateDependency1(DepHandleObj);
        }

    };

    //resume dr dependency
    this.resumeExec2 = function (depCtrl, DepHandleObj) {
        depCtrl.__continue = null;
        depCtrl.__lockDependencyExec = false;
        this.UpdateDependency2(DepHandleObj);
    };

    //Dr dependency
    this.UpdateDependency2 = function (DepHandleObj) {
        let curCtrl = DepHandleObj.curCtrl;
        if (DepHandleObj.DrPaths.length === 0) {
            if (curCtrl.__continue3) {
                curCtrl.__continue3();
                curCtrl.__continue3 = null;
            }
            return;
        }
        let depCtrl_s = DepHandleObj.DrPaths.splice(0, 1)[0];
        let depCtrl = DepHandleObj.DrCtrls.splice(0, 1)[0];
        let wait = false;
        depCtrl.__continue = null;

        if (depCtrl.ObjType === "TVcontrol") {
            if (DepHandleObj.isInitSetup) {
                depCtrl.reloadWithParamAll();
            }
            else {
                depCtrl.reloadWithParam(curCtrl);
            }
        }
        else if (depCtrl.ObjType === "PowerSelect") {
            if (depCtrl.initializer && (!depCtrl.IsDGCtrl || (depCtrl.IsDGCtrl && depCtrl.__DG.RowCount > 0))) {
                depCtrl.__continue = this.resumeExec2.bind(this, depCtrl, DepHandleObj);
                depCtrl.initializer.reloadWithParams(true);
                wait = true;
            }
        }
        else if (depCtrl.ObjType === "DataGrid") {
            try {
                if (depCtrl.DataSourceId && (this.FO.Mode.isNew || (depCtrl.IsLoadDataSourceInEditMode && (this.FO.Mode.isEdit || this.FO.Mode.isView)))) {
                    depCtrl.__continue = this.resumeExec2.bind(this, depCtrl, DepHandleObj);
                    depCtrl.__setSuggestionVals();
                    wait = true;
                }
            }
            catch (e) {
                console.error(e);
                EbMessage("show", { Message: `Failed to load 'DataGrid': ${depCtrl.Name} - ${e.message}`, AutoHide: true, Background: '#aa0000' });
            }
        }
        if (!wait) {
            depCtrl.__lockDependencyExec = false;
            this.UpdateDependency2(DepHandleObj);
        }
    }.bind(this);

    this.getProcessedValue = function (ctrl, value) {
        if (value)
            return value;
        let _t = ctrl.EbDbType;
        if (_t === 16 || _t === 0)
            return '';
        if (_t === 7 || _t === 8 || _t === 10 || _t === 11 || _t === 12)
            return 0;
        if (_t === 3 || _t === 30)
            return false;
        if (_t === 5 || _t === 6 || _t === 17) {
            if (ctrl.IsNullable)
                return null;
            if (_t === 5)
                return moment('0001-01-01').format('YYYY-MM-DD');
            if (_t === 6)
                return moment('0001-01-01 00:00:00').format('YYYY-MM-DD HH:mm:ss');
            if (_t === 17)
                return moment('00:00:00').format('HH:mm:ss');
        }
        if (value === undefined)
            return null;
        return value;
    };

    //#endregion SingleBinding
};