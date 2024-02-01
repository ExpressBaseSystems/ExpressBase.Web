/*!
* WebFormRender.js
* to Render WebForm
* EXPRESSbase Systems Pvt. Ltd , Jith Job
*/
var a___builder = 0;
var a___MT = 0;

const WebFormRender = function (option) {

    //let AllMetas = AllMetasRoot["EbObject"];// newly added line to declare a local variable named "AllMetas"  which contains contextaul metas

    this.updateCtrlUI = function (cObj) {
        $.each(cObj, function (prop, val) {
            //prop = prop.charAt(0).toUpperCase() + prop.slice(1);
            let meta = getObjByval(AllMetas_w["Eb" + cObj.ObjType], "name", prop);
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
        this.flatControlsWithDG = this.flatControlsWithDG.concat(this.DGsNew);// all DGsNew in the formObject + all controls as flat
        $.each(this.flatControlsWithDG, function (i, ctrl) {
            this.formObject[ctrl.Name] = ctrl;
        }.bind(this));
        if (this.ReviewCtrl && !this.formObject['review'])
            this.formObject['review'] = this.ReviewCtrl;
        this.FRC.setFormObjHelperfns();// adds __getCtrlByPath() to formObject
        this.setFormObjectMode();
        this.FRC.setUpdateDependentControlsFn();// adds updateDependentControls() to formObject 
        this.FRC.setUpdateDependentCtrlWithDrFn();// adds updateDependentControls() to formObject 
        this.FRC.setUpdateDependentControlsBehaviorFns();// adds updateDependentControlsBehaviorFns() to formObject

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
            let opt = { Mode: this.Mode, formsaveFn: this.saveForm.bind(this), formObject: this.formObject, userObject: this.userObject, formRenderer: this };
            this.ReviewCtrlBuilder = this.initControls.init(this.ReviewCtrl, opt);
        }
    };

    this.initWizards = function () {
        this.WizardControls = getFlatObjOfType(this.FormObj, "WizardControl");

        $.each(this.WizardControls, function (i, wizControl) {//WizControl Init
            let $Tab = $(`#cont_${wizControl.EbSid_CtxId}>.RenderAsWizard`);

            wizControl.SwitchToEditMode = function () {
                $Tab.find('.sw-btn-edit').addClass('disabled');
                $Tab.find('.sw-btn-save').removeClass('disabled');
            }.bind(this);

            if ($Tab.length === 0)
                return false;

            let extraHtml = '';
            if (this.Mode.isNew) {
                if (this.FormObj.CanSaveAsDraft)
                    extraHtml += `<button class="btn sw-btn sw-btn-save-draft">${(wizControl.SaveAsDraftButtonText || 'Save as Draft')}</button>`;
                extraHtml += `<button class="btn sw-btn sw-btn-save ${(wizControl.Controls.$values.length > 1 ? 'disabled' : '')}">${(wizControl.SubmitButtonText || 'Submit')}</button>`;
            }
            else if (this.Mode.isView) {
                if ($('#' + this.hBtns.Edit).is(':visible:enabled'))
                    extraHtml += `<button class="btn sw-btn sw-btn-edit">Edit</button>`;
                extraHtml += `<button class="btn sw-btn sw-btn-save disabled">${(wizControl.SubmitButtonText || 'Submit')}</button>`;
            }

            let hiddenSteps = [], doneSteps = [];
            for (let i = 0; i < wizControl.Controls.$values.length; i++) {
                if (wizControl.Controls.$values[i].Hidden)
                    hiddenSteps.push(i);
                if (!this.Mode.isNew)
                    doneSteps.push(i);
            }

            $Tab.smartWizard({
                theme: 'arrows',
                enableUrlHash: false, // Enable selection of the step based on url hash
                autoAdjustHeight: window.innerWidth <= 768,
                transition: {
                    animation: 'none', // Effect on navigation, none/fade/slide-horizontal/slide-vertical/slide-swing
                    speed: '200', // Transion animation speed
                    easing: '' // Transition animation easing. Not supported without a jQuery easing plugin
                },
                toolbar: {
                    position: 'bottom', // none, top, bottom, both
                    toolbarButtonPosition: 'right', // left, right, center
                    showNextButton: true, // show/hide a Next button
                    showPreviousButton: true, // show/hide a Previous button
                    extraHtml: extraHtml
                },
                anchor: {
                    enableNavigationAlways: !this.Mode.isNew
                },
                keyboard: {
                    keyNavigation: false, // Enable/Disable keyboard navigation(left and right keys are used if enabled)
                },
                lang: {
                    next: (wizControl.NextButtonText || 'Next') + ' >',
                    previous: '< ' + (wizControl.PreviousButtonText || 'Previous')
                }
            });

            $Tab.smartWizard("setState", hiddenSteps, "disable");
            $Tab.smartWizard("setState", doneSteps, "done");

            $Tab.off("leaveStep").on("leaveStep", function (e, anchorObject, currentStepIndex, nextStepIndex, stepDirection) {
                let leave = false;
                if (stepDirection === 'forward') {
                    //e.stopPropagation();
                    let pane = wizControl.Controls.$values[currentStepIndex];
                    let innerCtrlsWithDGs = getFlatCtrlObjs(pane).concat(getFlatContObjsOfType(pane, "DataGrid"));
                    if (this.FRC.AllRequired_valid_Check(innerCtrlsWithDGs)) {
                        leave = true;
                    }
                }
                else
                    leave = true;

                if (leave && (this.Mode.isNew)) {
                    if ($Tab.find('li.nav-item:visible').last().index() == nextStepIndex) {
                        $Tab.find('.sw-btn-save').removeClass('disabled');
                    }
                    else {
                        $Tab.find('.sw-btn-save').addClass('disabled');
                    }
                }

                return leave;
            }.bind(this));

            $Tab.off("showStep").on("showStep", function (e, anchorObject, stepIndex, stepDirection, stepPosition) {
                $Tab.find('.tab-content').scrollTop(0);
                $Tab.closest('[eb-root-obj-container]').scrollTop(0);
            });

            $Tab.off('click', '.sw-btn-save-draft').on('click', '.sw-btn-save-draft', function (e) {
                if (this.FormObj.CanSaveAsDraft && this.Mode.isNew) {
                    this.saveAsDraft();
                }
            }.bind(this));

            $Tab.off('click', '.sw-btn-save').on('click', '.sw-btn-save', function (e) {
                let stepInfo = $Tab.smartWizard("getStepInfo");
                if ((stepInfo.currentStep === $Tab.find('li.nav-item:visible').last().index() && this.Mode.isNew) || this.Mode.isEdit) {
                    this.saveForm();
                }
            }.bind(this));

            $Tab.off('click', '.sw-btn-edit').on('click', '.sw-btn-edit', function (e) {
                if (this.Mode.isView && $('#' + this.hBtns.Edit).is(':visible:enabled')) {
                    this.SwitchToEditMode();
                }
            }.bind(this));

            if (window.innerWidth > 768) {
                let w = `calc(100vh - 112px - ${$Tab.children('.nav').css('height')})`;
                $Tab.find('.tab-content').css('height', w);
            }
            else {
                $Tab.find('.tab-content').css('height', 'unset');
                $Tab.closest('[eb-root-obj-container]').css('padding-bottom', '62px');
            }

        }.bind(this));
    };

    this.initDGs = function () {
        $.each(this.DGs, function (k, DG) {//dg Init
            this.DGBuilderObjs[DG.EbSid_CtxId] = this.initControls.init(DG, { Mode: this.Mode, formObject: this.formObject, userObject: this.userObject, formObject_Full: this.FormObj, formRefId: this.formRefId, formRenderer: this });
            this.DGBuilderObjs[DG.EbSid_CtxId].MultipleTables = this.DataMODEL | [];
            if (!DG.DisableRowDelete || DG.IsAddable) {
                if (!this.__IsDGctxMenuSet)
                    $.contextMenu({
                        selector: '[eb-form="true"][mode="edit"] .Dg_body .dgtr > td,[eb-form="true"][mode="new"] .Dg_body .dgtr > td',
                        autoHide: true,
                        build: this.ctxBuildFn.bind(this, DG)
                    });
                this.__IsDGctxMenuSet = true;//old window?
            }
        }.bind(this));
    };

    this.initRQCs = function () {
        $.each(this.RQCs, function (k, RQC) {//dg Init
            this.DGBuilderObjs[RQC.EbSid_CtxId] = this.initControls.init(RQC, { Mode: this.Mode, formObject: this.formObject, userObject: this.userObject, formObject_Full: this.FormObj, formRefId: this.formRefId, formRenderer: this });
            this.DGBuilderObjs[RQC.EbSid_CtxId].MultipleTables = this.DataMODEL | [];
        }.bind(this));
    };

    this.initDGsNew = function () {
        $.each(this.DGsNew, function (k, DG) {//dg Init
            this.DGNewBuilderObjs[DG.EbSid_CtxId] = this.initControls.init(DG, { Mode: this.Mode, formObject: this.formObject, userObject: this.userObject, formObject_Full: this.FormObj, formRefId: this.formRefId, formRenderer: this });
        }.bind(this));
    };

    this.ctxBuildFn = function (DG, $trigger, e) {
        let cxtMnuItems = {};
        if (DG.IsAddable) {
            cxtMnuItems["duplicateRow"] = {
                name: "Duplicate row",
                icon: "fa-files-o",
                callback: this.duplicateRow,
                //disabled: this.insertRowBelowDisableFn
            };
            cxtMnuItems["insertRowAbove"] = {
                name: "Insert row above",
                icon: "fa-angle-up",
                callback: this.insertRowAbove
            };
            cxtMnuItems["insertRowBelow"] = {
                name: "Insert row below",
                icon: "fa-angle-down",
                callback: this.insertRowBelow,
                //disabled: this.insertRowBelowDisableFn
            };
        }
        if (!DG.DisableRowDelete) {
            cxtMnuItems["deleteRow"] = {
                name: "Delete row",
                icon: "fa-trash",
                callback: this.del
            };
        }
        return { items: cxtMnuItems };
    }.bind(this);

    this.insertRowBelowDisableFn = function (key, opt) {
        return $(`#${this.TableId}>tbody tr[is-editing="true"]`).length === 1;
    }.bind(this);

    this.insertRowBelow = function (eType, selector, action, originalEvent) {
        let $e = selector.$trigger;
        let $tr = $e.closest("tr");
        let clickedDGEbSid_CtxId = $tr.closest("[ctype=DataGrid]").attr("ebsid");
        let clickedDGB = this.DGBuilderObjs[clickedDGEbSid_CtxId];

        let $activeRow = $(`#${clickedDGB.TableId} tbody tr[is-editing="true"]`);
        if ($activeRow.length === 1) {
            if (clickedDGB.RowRequired_valid_Check($activeRow.attr("rowid")))
                clickedDGB.confirmRow();
            else
                return;
        }
        clickedDGB.addRow({ insertIdx: $tr.index() + 1 });
    }.bind(this);

    this.insertRowAbove = function (eType, selector, action, originalEvent) {
        let $e = selector.$trigger;
        let $tr = $e.closest("tr");
        let clickedDGEbSid_CtxId = $tr.closest("[ctype=DataGrid]").attr("ebsid");
        let clickedDGB = this.DGBuilderObjs[clickedDGEbSid_CtxId];

        let $activeRow = $(`#${clickedDGB.TableId} tbody tr[is-editing="true"]`);
        if ($activeRow.length === 1) {
            if (clickedDGB.RowRequired_valid_Check($activeRow.attr("rowid")))
                clickedDGB.confirmRow();
            else
                return;
        }
        clickedDGB.addRow({ insertIdx: $tr.index() });
    }.bind(this);

    this.del = function (eType, selector, action, originalEvent) {
        let $e = selector.$trigger;
        let $tr = $e.closest("tr");
        $tr.find(".del-row").trigger("click");
    }.bind(this);

    this.duplicateRow = function (eType, selector, action, originalEvent) {
        try {
            let $e = selector.$trigger;
            let $tr = $e.closest("tr");
            let clickedDGEbSid_CtxId = $tr.closest("[ctype=DataGrid]").attr("ebsid");
            let clickedDGB = this.DGBuilderObjs[clickedDGEbSid_CtxId];

            let $activeRow = $(`#${clickedDGB.TableId} tbody tr[is-editing="true"]`);
            if ($activeRow.length === 1) {
                if (clickedDGB.RowRequired_valid_Check($activeRow.attr("rowid")))
                    clickedDGB.confirmRow();
                else
                    return;
            }
            let rowId = $tr.attr("rowid");
            let rowDataModel = getObjByval(clickedDGB.DataMODEL, "RowId", rowId);
            let _rowdata = {};
            for (let i = 0; i < rowDataModel.Columns.length; i++)
                _rowdata[rowDataModel.Columns[i].Name] = rowDataModel.Columns[i].Value;
            document.activeElement.blur();
            clickedDGB.AddRowWithData(_rowdata);
            if (clickedDGB.ctrl.AscendingOrder)
                clickedDGB.$DGbody.scrollTo(clickedDGB.$DGbody[0].scrollHeight);
            else
                clickedDGB.$DGbody.scrollTo(0);
        }
        catch (e) {
            console.error(e);
        }
    }.bind(this);

    this.initNCs = function () {
        for (let i = 0; i < this.flatControls.length; i++) {
            let Obj = this.flatControls[i]
            let opt = {};
            if (Obj.ObjType === "PowerSelect" && !Obj.RenderAsSimpleSelect) {
                opt.getAllCtrlValuesFn = this.getWebFormVals;
                opt.parentCont = this.FormObj.EbSid_CtxId;
            }
            else if (Obj.ObjType === "FileUploader") {
                opt.FormDataExtdObj = this.FormDataExtdObj;
                opt.DpControlsList = getFlatObjOfType(this.FormObj, "DisplayPicture");
            }
            else if (Obj.ObjType === "Date") {
                opt.source = "webform";
            }
            else if ((Obj.ObjType === "ExportButton") || (Obj.ObjType === "Phone")) {
                opt.formObj = this.FormObj;
                opt.dataRowId = this.DataMODEL[this.FormObj.TableName][0].RowId;
            }
            else if (Obj.ObjType === "ProvisionUser" || Obj.ObjType === "ProvisionLocation")
                opt.flatControls = this.flatControls;
            else if (Obj.ObjType === "SubmitButton") {
                opt.renderMode = this.renderMode;
            }
            else if (Obj.ObjType === "PowerSelect" || Obj.ObjType === "SimpleSelect" || Obj.ObjType === "BooleanSelect") {
                opt.parentCont = this.FormObj.EbSid_CtxId;
            }
            this.initControls.init(Obj, opt);
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
        JsonToEbControls(this.FormObj, 'webform');// extend eb functions to control object (setValue(), disable()...)
        this.flatControls = getFlatCtrlObjs(this.FormObj);// here with functions
        this.formObject = {};// for passing to user defined functions
        this.SetWatchers();//added a watcher to update form attribute
        this.formObject.__mode = "new";// default value new

        this.PSs = getFlatObjOfType(this.FormObj, "PowerSelect");// all PSs in formObject - done for filterdialog default value
        this._allPSsInit = false;

        this.RQCs = getFlatContObjsOfType(this.FormObj, "RenderQuestionsControl");// all RQCs in formObject
        this.DGs = getFlatContObjsOfType(this.FormObj, "DataGrid");// all DGs in formObject
        this.DGsNew = getFlatContObjsOfType(this.FormObj, "DataGrid_New");// all DGs in formObject        
        this.GroupBoxes = getFlatContObjsOfType(this.FormObj, "GroupBox");
        this.setFormObject();// set helper functions to this.formObject and other...
        this.updateCtrlsUI();
        this.setExecReviewCont();
        this.initNCs();// order 1
        this.FRC.bindFunctionToCtrls(this.flatControls);// order 2 - bind data model update to onChange(internal)
        //this.FRC.bindEbOnChange2Ctrls(this.flatControls);// order 2 - bind data model update to onChange(internal)
        //this.FRC.bindFnsToCtrls(this.flatControls);// order 3


        this.FRC.setDisabledControls(this.flatControls);// disables disabled controls 
        this.initDGs();
        this.initRQCs();
        this.initDGsNew();
        this.initReviewCtrl();
        this.initWizards();

        $.each(this.DGs, function (k, DG) {
            let _DG = new ControlOps_w[DG.ObjType](DG);
            if (_DG.OnChangeFn.Code === null)
                _DG.OnChangeFn.Code = "";
            this.FRC.bindFunctionToDG(_DG);
            //this.FRC.bindValueUpdateFns_OnChange(_DG);
        }.bind(this));
    };

    this.updateCtrlsUI = function () {
        let allFlatControls = [this.FormObj, ...getInnerFlatContControls(this.FormObj).concat(this.flatControls)];
        $.each(allFlatControls, function (k, Obj) {
            this.updateCtrlUI(Obj);
        }.bind(this));
    };

    this.setExecReviewCont = function () {
        if (this.ReviewCtrl && this.ReviewCtrl.RenderAsTable) {

            this.ReviewCtrl.execReviewCont = this.$formCont.find('.form-cont-second');
            this.ReviewCtrl.execReviewCont.empty();
            this.ReviewCtrl.includeReviewData = false;

            let revDataMdl = this.DataMODEL[this.ReviewCtrl.TableName];
            let CurStageDATA = getObjByval(revDataMdl, "RowId", 0);
            let hasPermission = false, isFormDataEditable = false;
            if (CurStageDATA) {
                hasPermission = getObjByval(CurStageDATA.Columns, "Name", "has_permission").Value === "T";//false;//
                isFormDataEditable = getObjByval(CurStageDATA.Columns, "Name", "is_form_data_editable").Value === "T";
                if (!hasPermission)
                    return;
            }
            else
                return;
            let stageUqid = getObjByval(CurStageDATA.Columns, "Name", "stage_unique_id").Value;
            let stage = getObjByval(this.ReviewCtrl.FormStages.$values, "EbSid", stageUqid);
            if (!stage) return;

            let _ctrlHtml = '';
            let _ctrls = [];

            if (isFormDataEditable && stage.AssocCtrls && stage.AssocCtrls.$values.length) {
                for (let i = 0; i < stage.AssocCtrls.$values.length; i++) {
                    let ctrlName = stage.AssocCtrls.$values[i].ControlName;
                    if (ctrlName) {
                        let c = this.formObject.__getCtrlByPath('form.' + ctrlName);
                        if (c != "not found") {
                            _ctrls.push(c);
                            _ctrlHtml += $("<div />").append($('#cont_' + c.EbSid_CtxId).remove()).html();
                        }
                    }
                }
            }
            this.ReviewCtrl.execReviewCont.append(
                `<div class="exec-rev-cont" eb-root-obj-container>
                    <div class="exec-rev-header">
                        <div class="exec-rev-title">${this.ReviewCtrl.Label}</div>
                        <button class="btn rev-cancel" title="Close"> <i class="material-icons">close</i> </button>
                    </div>
                    <div class="exec-rev-body">
                        ${_ctrlHtml}
                        <div class="form-group" style='margin: 4px; padding-top: 5px;'>
                            <span class='eb-ctrl-label'>${this.ReviewCtrl.StatusTitle || 'Status'}</span>
                            <select id="${this.ReviewCtrl.EbSid_CtxId}_status" class="form-control" style="border-radius: 0; padding: 7px 4px;"></select>
                        </div>
                        <div class="form-group" style='margin: 4px; padding-top: 5px;'>
                            <span class='eb-ctrl-label'>${this.ReviewCtrl.RemarksTitle || 'Remarks'}</span>
                            <textarea id="${this.ReviewCtrl.EbSid_CtxId}_remarks" class="form-control" style="height: 100px !important; resize:none; border-radius: 0;"></textarea>
                        </div>
                        <div class="exec-rev-footer">
                            <button class="rev-submit ebbtn eb_btn-sm eb_btnblue">${this.ReviewCtrl.ExecuteBtnText || 'Execute Review'}</button>
                            <button class="rev-cancel ebbtn eb_btn-sm eb_btnplain">Cancel</button>
                        </div>
                    </div>
                    
                </div>`);
            this.ReviewCtrl.CurStageAssocCtrls = _ctrls;

            this.ReviewCtrl.execReviewCont.off('click', `#${this.ReviewCtrl.EbSid_CtxId}_status`).on('change', `#${this.ReviewCtrl.EbSid_CtxId}_status`, function (e) {
                if (!this.ReviewCtrl._Builder.CurStageDATA)
                    return;
                let actionDataVals = getObjByval(this.ReviewCtrl._Builder.CurStageDATA.Columns, "Name", "action_unique_id");
                actionDataVals.Value = $(e.target).val();
            }.bind(this));

            this.ReviewCtrl.execReviewCont.off('click', '.rev-submit').on('click', '.rev-submit', function (e) {
                if (!this.ReviewCtrl._Builder.isValidationsOK())
                    return;
                if (this.ReviewCtrl.CurStageAssocCtrls.length > 0) {
                    this.saveForm();
                }
                else {
                    this.ReviewCtrl._Builder.saveForm_call();
                }
            }.bind(this));

            this.ReviewCtrl.execReviewCont.off('click', '.rev-cancel').on('click', '.rev-cancel', function (e) {
                this.hideExecReviewCont();
            }.bind(this));
        }
    };

    this.showExecReviewCont = function () {
        this.$formCont.find('.form-cont-first').addClass('active');
        this.ReviewCtrl.execReviewCont.addClass('active');

        if (!this.S2EmodeReviewCtrl())
            return;

        if (this.ReviewCtrl.CurStageAssocCtrls.length > 0) {
            this.ReviewCtrl.includeReviewData = true;

            $.each(this.ReviewCtrl.CurStageAssocCtrls, function (i, ctrl) {
                if ((ctrl.IsDisable && ctrl.__IsDisableByExp === undefined) || ctrl.__IsDisableByExp === true)
                    return;
                ctrl.enable();
            }.bind(this));
        }
    };

    this.hideExecReviewCont = function () {
        this.ReviewCtrl.includeReviewData = false;
        this.$formCont.find('.form-cont-first').removeClass('active');
        this.ReviewCtrl.execReviewCont.removeClass('active');
        this.ReviewCtrl._Builder.enableAllCtrls();
    };

    //psDataImport
    this.psDataImportV1 = function (PScontrol) {
        if (PScontrol.isEmpty())
            return;
        this.showLoader();
        $.ajax({
            type: "POST",
            url: "/WebForm/ImportFormData",
            data: {
                _refid: this.formRefId,
                _rowid: this.rowId,
                _triggerctrl: PScontrol.Name,
                _params: [{ Name: PScontrol.Name, Value: PScontrol.getValue() }]
            },
            error: function (xhr, ajaxOptions, thrownError) {
                this.hideLoader();
                EbMessage("show", { Message: `Something Unexpected Occurred when tried to import data`, AutoHide: true, Background: '#aa0000', Delay: 5000 });
            }.bind(this),
            success: this.psImportreloadForm.bind(this)
        });

    };

    //psDataImportV2
    this.psDataImport = function (PScontrol) {
        if (PScontrol.isEmpty())
            return;
        this.showLoader();
        let fd = JSON.parse(JSON.stringify(this.formData));
        fd.MultipleTables = this.formateDS(fd.MultipleTables);
        $.ajax({
            type: "POST",
            url: "/WebForm/PSImportFormData",
            data: {
                _refid: this.formRefId,
                _rowid: this.rowId,
                _triggerctrl: PScontrol.Name,
                _formModel: JSON.stringify(fd)
            },
            error: function (xhr, ajaxOptions, thrownError) {
                this.hideLoader();
                EbMessage("show", { Message: `Something Unexpected Occurred when tried to import data`, AutoHide: true, Background: '#aa0000', Delay: 5000 });
            }.bind(this),
            success: this.psImportreloadForm.bind(this)
        });

    };

    this.psImportreloadForm = function (_respObjStr) {
        this.hideLoader();
        let _respObj = JSON.parse(_respObjStr);
        if (_respObj.Status === 200) {
            //this.__fromImport = true;//this flag is not required!

            this.softReloadForm(_respObj);
        }
        else {
            console.error(_respObj.MessageInt);
            EbMessage("show", { Message: `Failed to Import data`, AutoHide: true, Background: '#aa0000' });
        }
    }.bind(this);

    this.softReloadForm = function (_respObj) {
        try {
            let OuterCtrlsTblNames = this.getNormalTblNames();
            let newModel = _respObj.FormData.MultipleTables;
            $.each(newModel, function (tblName, Table) {
                if (this.DataMODEL[tblName]) {
                    let TableBkup = this.DataMODEL[tblName];
                    if (OuterCtrlsTblNames.includes(tblName)) {
                        let bkupIdx = TableBkup[0].Columns[0].Name == 'id' ? 1 : 0;
                        for (let i = 0; i < Table[0].Columns.length; i++) {
                            let c1 = TableBkup[0].Columns[i + bkupIdx];
                            let c2 = Table[0].Columns[i];
                            c1.Value = c2.Value;
                            c1.D = c2.D;
                            c1.R = c2.R;
                            c1.F = c2.F;
                            c1.M = c2.M;
                        }
                    }
                }
                else {
                    this.DataMODEL[tblName] = Table;
                }
            }.bind(this));

            let outerCtrlsSingleColumns_flat = this.getOuterCtrlsSingleColumns_flat(this.DataMODEL, OuterCtrlsTblNames);
            this.isInitiallyPopulating = true;
            this.populateFormOuterCtrlsWithDataModel(outerCtrlsSingleColumns_flat);
            this.isInitiallyPopulating = false;
            for (let EbSid_CtxId in this.DGBuilderObjs) {
                let DGB = this.DGBuilderObjs[EbSid_CtxId];
                DGB.reloadDgUsingNewModel(newModel[DGB.ctrl.TableName]);
            }
            this.FRC.execAllDefaultValExpr();
        }
        catch (e) {
            console.error(e);
            EbMessage("show", { Message: `Reloading failed: ${e.message}`, AutoHide: false, Background: '#aa0000' });
        }
    }.bind(this);

    //this.unbindUniqueCheck = function (control) {
    //    $("#" + control.EbSid_CtxId).off("blur.dummyNameSpace");
    //};

    this.getWebFormVals = function () {
        let fltr_collection = getValsFromForm(this.FormObj);
        fltr_collection.push(new fltr_obj(11, this.FormObj.TableName + '_id', this.rowId));
        fltr_collection.push(new fltr_obj(11, 'id', this.rowId));
        return fltr_collection;
    }.bind(this);

    this.populateFormOuterCtrlsWithDataModel = function (NCCSingleColumns_flat_editmode_data) {
        for (let i = 0; i < NCCSingleColumns_flat_editmode_data.length; i++) {
            let SingleColumn = NCCSingleColumns_flat_editmode_data[i];
            let val = SingleColumn.Value;

            if (SingleColumn.Name === "id")
                continue;

            let ctrl = getObjByval(this.flatControls, "Name", SingleColumn.Name);
            if (!ctrl) {
                EbMessage("show", { Message: `Form rendering failed. Contact admin. [${SingleColumn.Name} not found]`, AutoHide: false, Background: '#aa0000' });
                continue;
            }
            if (val === null && ctrl.ObjType != "TextBox")////SoftReloadForm issue
                continue;

            if (ctrl.DrDependents && ctrl.DrDependents.$values.length > 0)
                ctrl.__isInitiallyPopulating = true;// need detail comment

            ctrl.___DoNotUpdateDataVals = true;

            if (ctrl.ObjType === "PowerSelect" && !ctrl.RenderAsSimpleSelect) {
                ctrl.setDisplayMember(val);
            }
            else if (ctrl.ObjType === "TextBox") {
                if (val)
                    val = val.replace(/\r/g, '');
                ctrl.justSetValue(val);
                if (val && ctrl.getValueFromDOM() !== val) {
                    ctrl.__EbAlert.alert({
                        id: ctrl.EbSid_CtxId + "-al",
                        head: "Value Trimmed by mistake(Old Value : " + val + ", New Value:" + ctrl.getValueFromDOM() + " ) - contact Support",
                        body: " : <div tabindex='1' class='eb-alert-item' cltrof='" + ctrl.EbSid_CtxId + "' onclick='ebcontext.webform.RenderCollection[" + (this.__MultiRenderCxt - 1) + "].FRC.goToCtrlwithEbSid()'>"
                            + ctrl.Label + (ctrl.Hidden ? ' <b>(Hidden)</b>' : '') + '<i class="fa fa-external-link-square" aria-hidden="true"></i></div>',
                        type: "danger"
                    });
                    $(`#${this.hBtns['Edit']}`).attr("disabled", true);
                }
            }
            else {
                ctrl.justSetValue(val);
            }

            ctrl.___DoNotUpdateDataVals = false;
        }
    };

    this.getNormalTblNames = function () {
        let NCCTblNames = [];
        let FlatContControls = getFlatContControls(this.FormObj);
        $.each(FlatContControls, function (i, ctrl) {
            if (ctrl.IsSpecialContainer || !ctrl.TableName) {
                return;
            }
            let TableName = ctrl.TableName.trim();
            if (!NCCTblNames.includes(TableName))
                NCCTblNames.push(TableName);
        });
        return NCCTblNames;
    };

    this.getOuterCtrlsSingleColumns_flat = function (DataMODEL, OuterCtrlsTblNames) {
        let OuterCtrlsSingleColumns_flat = [];
        $.each(OuterCtrlsTblNames, function (i, TblName) {
            try {
                let SingleRowColums = DataMODEL[TblName][0].Columns;
                OuterCtrlsSingleColumns_flat = OuterCtrlsSingleColumns_flat.concat(SingleRowColums);
            }
            catch (e) {
                console.log(e.message);
            }
        });
        return OuterCtrlsSingleColumns_flat;
    };

    // populateControlsWithDataModel
    this.populateControlsWithDataModel = function (DataMODEL) {
        let OuterCtrlsTblNames = this.getNormalTblNames();
        for (let EbSid_CtxId in this.DGBuilderObjs) {
            let DGB = this.DGBuilderObjs[EbSid_CtxId];
            if (!DataMODEL.hasOwnProperty(DGB.ctrl.TableName)) {// if no Table in datamodel add empty array
                DataMODEL[DGB.ctrl.TableName] = [];
                DGB.DataMODEL = DataMODEL[DGB.ctrl.TableName];
                continue;
            }

            let DGDataMODEL = DataMODEL[DGB.ctrl.TableName];
            DGB.populateDGWithDataModel(DGDataMODEL);
        }

        //for dg_new
        for (let EbSid_CtxId in this.DGNewBuilderObjs) {
            let DGB = this.DGNewBuilderObjs[EbSid_CtxId];
            if (!DataMODEL.hasOwnProperty(DGB.ctrl.TableName)) {// if no Table in datamodel add empty array
                DataMODEL[DGB.ctrl.TableName] = [];
                DGB.DataMODEL = DataMODEL[DGB.ctrl.TableName];
                continue;
            }

            let DGDataMODEL = DataMODEL[DGB.ctrl.TableName];
            DGB.populateDGWithDataModel(DGDataMODEL);
        }

        let outerCtrlsSingleColumns_flat = this.getOuterCtrlsSingleColumns_flat(DataMODEL, OuterCtrlsTblNames);
        this.populateFormOuterCtrlsWithDataModel(outerCtrlsSingleColumns_flat);
    };

    this.getExtendedTables = function () {
        let ExtendedTables = {};
        $.each(this.uploadedFileRefList, function (key, values) {
            ExtendedTables[key] = [];

            for (let i = 0; i < values.length; i++) {
                let SingleColumn = {};
                SingleColumn.Name = key;
                SingleColumn.Value = values[i];
                SingleColumn.Type = EbEnums_w.EbDbTypes.Decimal;
                ExtendedTables[key].push({
                    IsUpdate: false,
                    Columns: [SingleColumn]
                });
            }
        });
        return ExtendedTables;
    };

    this.getFormValuesObjWithTypeColl = function () {
        let WebformData = {};

        //WebformData.MultipleTables = $.extend(formTables, gridTables, approvalTable);
        WebformData.MultipleTables = this.formateDS(this.DataMODEL);
        if (this.ReviewCtrl && this.ReviewCtrl.includeReviewData) {
            WebformData.MultipleTables[this.ReviewCtrl.TableName].push(this.ReviewCtrl._Builder.getCurRowValues());
        }

        for (let EbSid_CtxId in this.DGBuilderObjs) {
            let DGB = this.DGBuilderObjs[EbSid_CtxId];
            let Script = DGB.ctrl.PersistRowOnlyIf;
            if (!Script || Script.Lang != 0 || !Script.Code)
                continue;
            let Table = WebformData.MultipleTables[DGB.ctrl.TableName];
            if (!Table || Table.length === 0)
                continue;
            Table = JSON.parse(JSON.stringify(Table));
            let NwTable = [];
            try {
                let FnString = atob(Script.Code);
                for (let i = 0; i < Table.length; i++) {
                    let res = false;
                    if (DGB.objectMODEL[Table[i].RowId]) {
                        DGB.setCurRow(Table[i].RowId);
                        res = new Function("form", "user", FnString).bind(DGB.ctrl.currentRow, this.formObject, this.userObject)();
                    }
                    else
                        res = true;
                    if (res)
                        NwTable.push(Table[i]);
                    else if (Table[i].RowId > 0) {
                        Table[i].IsDelete = true;
                        NwTable.push(Table[i]);
                    }
                }
            }
            catch (e) {
                console.error(e);
                NwTable = Table;
            }
            WebformData.MultipleTables[DGB.ctrl.TableName] = NwTable;
        }

        WebformData.ExtendedTables = this.getExtendedTables();
        WebformData.ModifiedAt = this.formData.ModifiedAt;
        console.log("form data --");

        //console.log("old data --");
        //console.log(JSON.stringify(WebformData.MultipleTables));

        console.log("new data --");
        console.log(JSON.stringify(this.formateDS(this.DataMODEL)));
        return JSON.stringify(WebformData);
    };

    this.formateDS = function (_multipleTables) {
        return formatData4webform(_multipleTables);
    };

    this.saveSuccess = function (_respObj) {
        this.hideLoader();
        this.LockSave = false;
        let respObj = JSON.parse(_respObj);
        ebcontext._formSaveResponse = respObj;

        if (respObj.Status === 200) {
            this.manualChangeInData = false;
            if (this.renderMode === 3) {
                EbMessage("show", { Message: "Sign up success.", AutoHide: true, Background: '#00aa00', Delay: 4000 });
                this.showLoader();
                if (respObj.MetaData && respObj.MetaData.signup_user) {
                    let signup_user = JSON.parse(respObj.MetaData.signup_user);
                    if (signup_user.VerificationRequired) {
                        EbMessage("show", { Message: "Sign up success. Please check email for verification code", AutoHide: true, Background: '#00aa00', Delay: 4000 });
                        signup_user.Exp = Date.now() + 300000;
                        store.set('eb_signup_info', signup_user);
                    }
                }
                setTimeout(function () {
                    //ebcontext.setup.se.onLogOutMsg();
                    //document.location.href = '/Ext/UsrSignIn?Page=False';
                    if (this.FormObj.AfterSavePage) {
                        document.location.href = `/pages/${this.FormObj.AfterSavePage}`;
                        return;
                    }
                    else {
                        document.location.href = '/Ext/UsrSignIn?Page=False';
                    }
                }.bind(this), 3000);
                return;
            }
            if (this.FormObj.AfterSavePage) {
                document.location.href = `/pages/${this.FormObj.AfterSavePage}`;
                return;
            }
            if (this.renderMode === 5) {
                this.$formCont.html(`<div id="" style="height:calc(100vh - 38px);"> <div style="text-align: center;  position: relative; top: 45%; font-size: 20px; color: #aaa; "> <i class="fa fa-check" aria-hidden="true" style="color: green;"></i>&nbsp;Submitted successfully </div></div>`);
                //EbMessage("show", { Message: "Form save success ", AutoHide: true, Background: '#00aa00' });
                $(`#eb_messageBox_container`).children().hide();//// temp fix to avoid SE message (FormEdit btn enabled....)
                $(`#eb_messageBox_container`).css("padding", "0");////
                return;
            }

            if (this.renderMode === 4) {
                EbMessage("show", { Message: "My profile updated successfully", AutoHide: true, Background: '#00aa00', Delay: 3000 });
            }
            else {
                let locName = this.getLocObj().LongName;
                let formName = this.FormObj.DisplayName;
                if (this.rowId > 0)
                    EbMessage("show", { Message: "Edited " + formName + " from " + locName, AutoHide: true, Background: '#00aa00', Delay: 3000 });
                else
                    EbMessage("show", { Message: "New " + formName + " entry in " + locName + " created", AutoHide: true, Background: '#00aa00', Delay: 3000 });
            }

            respObj.FormData = JSON.parse(respObj.FormData);//======
            this.relatedSubmissionsHtml = null;

            if (this.AfterSavePrintDoc) {
                this.printDocument_inner(this.AfterSavePrintDoc, respObj.RowId);
                this.AfterSavePrintDoc = null;
            }
            ebcontext.webform.UpdateInterCxtObj(this.__MultiRenderCxt);
            this.renderInAfterSaveMode(respObj);
        }
        else {
            //EbDialog("show", {
            //    Message: respObj.Message,
            //    Buttons: { "Ok": { Background: "green", Align: "right", FontColor: "white;" } }
            //});
            if (this.keepHidden)
                ebcontext.webform.showSubForm(this.__MultiRenderCxt);
            EbMessage("show", { Message: respObj.Message, AutoHide: false, Background: '#aa0000', ShowCopyBtn: true, Details: respObj.MessageInt + ' ' + respObj.StackTraceInt });
            console.error(respObj.MessageInt);
        }
    }.bind(this);

    this.saveDraftSuccess = function (_respObj) {
        this.hideLoader();
        let respObj = JSON.parse(_respObj);
        ebcontext._formSaveResponse = respObj;

        if (respObj.Status === 200) {
            EbMessage("show", { Message: "Form saved as draft", AutoHide: true, Background: '#00aa00', Delay: 3000 });
            if (respObj.DraftId > 0) {
                this.draftId = respObj.DraftId;
                option.draftId = this.draftId;
                this.headerObj.setFormMode(`<span mode="Draft Mode" class="fmode">Draft</span>`);
                let _l = ebcontext.languages.getCurrentLanguageCode();
                let _url = `/WebForm/Index?_r=${this.formRefId}&_p=${btoa(JSON.stringify([{ Name: "id", Type: "7", Value: this.draftId }]))}&_m=8&_l=${this.getLocId()}&_lg=${_l}`;
                let stateObj = { draftId: this.draftId };
                window.history.replaceState(stateObj, this.FormObj.DisplayName + '(Draft)', _url);
            }
        }
        else if (respObj.Status === 403) {
            EbMessage("show", { Message: "Access denied to update this data entry!", AutoHide: true, Background: '#aa0000', Delay: 4000 });
        }
        else {
            EbMessage("show", { Message: respObj.Message, AutoHide: true, Background: '#aa0000', Delay: 4000 });
            console.error(respObj.MessageInt);
        }

        //this.AdjustDraftBtnsVisibility();
    }.bind(this);

    this.renderInAfterSaveMode = function (respObj) {
        if (!this.afterSavemodeS) {
            if (this.rowId > 0) //edit
                this.afterSavemodeS = getKeyByVal(EbEnums_w.WebFormAfterSaveModes, this.FormObj.FormModeAfterEdit.toString()).split("_")[0].toLowerCase();
            else
                this.afterSavemodeS = this.defaultAfterSavemodeS;
        }
        let mode_s = this.afterSavemodeS.charAt(0).toUpperCase() + this.afterSavemodeS.slice(1) + " Mode"
        if (mode_s === "Edit Mode" || mode_s === "View Mode") {
            this.FORCE_RELOAD(respObj.RowId, respObj.FormData, mode_s);
        }
        else if (mode_s === "New Mode") {
            this.startNewMode();
            return;
        }
        else if (mode_s === "Close Mode") {
            this.Mode.isEdit = false;
            this.rowId = respObj.RowId;//label link reverse filling
            if (this.renderMode === 2) {
                ebcontext.webform.hideSubForm(this.__MultiRenderCxt);
            }
            else {
                try {
                    window.top.close();
                }
                catch (e) {
                    console.log(e);
                }
                this.showLoader();
                document.location.href = "/";
            }
        }
    }.bind(this);

    this.DISPOSE = function () {
        if (this.renderMode !== 2) {
            $.contextMenu('destroy');
            this.__IsDGctxMenuSet = undefined;
            $(".xdsoft_datetimepicker.xdsoft_noselect.xdsoft_").remove();
        }

        $(`#${this.FormObj.EbSid_CtxId} [data-toggle="tooltip"]`).tooltip('destroy').tooltip();

        let tvCtrls = getFlatObjOfType(this.FormObj, "TVcontrol");
        $.each(tvCtrls, function (a, b) { b.__filterValues = []; });

        this.$formCont.empty();
        this.Mode = {};
        this.mode = '';
        $("#EbFnOuterCont").remove();
    };

    this.FORCE_RELOAD = function (rowId, formData, mode_s) {
        if (this.renderMode === 1) {
            let stateObj = { id: rowId };
            if (rowId > 0) {
                let _l = ebcontext.languages.getCurrentLanguageCode();
                let _url = `/WebForm/Index?_r=${this.formRefId}&_p=${btoa(JSON.stringify([{ Name: "id", Type: "7", Value: rowId }]))}&_m=${this.isPartial === 'True' ? 11 : 1}&_l=${this.getLocId()}&_lg=${_l}`;
                //if (this.rowId > 0)
                window.history.replaceState(stateObj, this.FormObj.DisplayName, _url);
                //else
                //    window.history.pushState(stateObj, this.FormObj.DisplayName, _url);
            }
            else {
                let _l = ebcontext.languages.getCurrentLanguageCode();
                let _url = `/WebForm/Index?_r=${this.formRefId}&_m=${this.isPartial === 'True' ? 12 : 2}&_l=${this.getLocId()}&_lo=${_l}`;
                window.history.replaceState(stateObj, this.FormObj.DisplayName, _url);
            }
        }
        let forceRelaodOptions = {
            rowId: rowId,
            formData: formData,
            modeS: mode_s
        }

        //let t0 = performance.now();

        if (this.renderMode !== 2) {
            $.contextMenu('destroy');
            this.__IsDGctxMenuSet = undefined;
            $(".xdsoft_datetimepicker.xdsoft_noselect.xdsoft_").remove();
        }

        $(`#${this.FormObj.EbSid_CtxId} [data-toggle="tooltip"]`).tooltip('destroy').tooltip();

        let tvCtrls = getFlatObjOfType(this.FormObj, "TVcontrol");
        $.each(tvCtrls, function (a, b) { b.__filterValues = []; });
        if (this.ReviewCtrl && $(`#${this.ReviewCtrl.EbSid_CtxId}_execRevMdl`).length > 0)
            $(`#${this.ReviewCtrl.EbSid_CtxId}_execRevMdl`).remove();

        this.resetBuilderVariables(forceRelaodOptions);
        this.init(option);
        $("#EbFnOuterCont").remove();
        //console.dev_log("WebFormRender : FORCE_RELOAD took " + (performance.now() - t0) + " milliseconds.");

    };

    this.resetBuilderVariables = function (newOptions) {
        let keys = Object.keys(this);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            if (typeof this[key] !== typeof function () { }) {
                if (!(key == "emptyFormDataModel_copy" || key == "__fromImport" || key == "__IsDGctxMenuSet" || key == "__MultiRenderCxt" || key == "relatedSubmissionsHtml"))// persist
                    delete this[key];
            }
        }

        option.formData = newOptions.formData;
        option.mode = newOptions.modeS;
        option.rowId = newOptions.rowId;
        if (!this.__fromImport && option.draftId > 0)
            option.draftId = 0;
    }.bind(this);

    this.startNewMode = function () {
        if (this.emptyFormDataModel_copy) {
            this.FORCE_RELOAD(0, this.emptyFormDataModel_copy, "New Mode");
        }
        else {
            this.showLoader();
            $.ajax({
                type: "POST",
                url: "/WebForm/getRowdata",
                data: {
                    refid: this.formRefId, rowid: 0
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    this.hideLoader();
                    EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000', Delay: 4000 });
                }.bind(this),
                success: function (_respObjStr) {
                    this.hideLoader();
                    let _respObj = JSON.parse(_respObjStr);
                    if (_respObj.Status === 200) {
                        this.showLoader();
                        this.FORCE_RELOAD(0, _respObj.FormData, "New Mode");
                        this.hideLoader();
                    }
                    else
                        console.error(_respObj.MessageInt);
                    this.hideLoader();
                }.bind(this)
            });
        }
    }.bind(this);

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
        let dgb;
        $.each(this.DGBuilderObjs, function (k, DGB) {
            if (DGB.hasActiveRow()) {
                DGB.checkActiveRecord();
                //dgb = DGB;
                //hasActiveRows = true;
                //return false;
            }
        }.bind(this));
        return { DGB: dgb, hasActiveRows: hasActiveRows };
    };

    this.DGsB4Save = function () {
        let actRows = this.IsDGsHaveActiveRows();
        if (actRows.hasActiveRows) {
            EbDialog("show", {
                Message: `
<div class='dg-commit-dilog-msgbox'>
    Please confirm <span class="fa fa-check"></span> or delete <span class="fa fa-trash"></span>
    <br>unconfirmed entry in : <span class="fa fa-table"></span>${actRows.DGB.ctrl.Label.trim() || actRows.DGB.ctrl.Name}
</div>`,
                hideClose: true,
                $for: $('#layout_div'),
                Buttons: {
                    "OK": {
                        Background: "green",
                        Align: "right",
                        FontColor: "white;"
                    },
                },
                CallBack: this.dialogboxAction.bind(this, actRows)
            });
            return false;
        }
        else
            return true;
    };

    this.dialogboxAction = function (actRows, value) {
        if (value === "OK")
            this.FRC.GoToCtrl(actRows.DGB.objectMODEL[actRows.DGB.curRowId][0], actRows.DGB.ctrl);
    };

    this.DGsNewB4Save = function () {
        let hasActiveRows = false;
        $.each(this.DGNewBuilderObjs, function (k, DGB) {
            if (DGB.hasActiveRow()) {
                hasActiveRows = true;
                return false;
            }
        }.bind(this));
        if (hasActiveRows) {
            EbDialog("show", { Message: "Please commit or delete uncommited rows" });
            return false;
        }
        else
            return true;
    };

    this.MeetingB4Save = function () {
        let resp = true;
        $.each($(`.meeting-scheduler-outer .m-validate`), function (i, Obj) {
            if (Obj.value == "") {
                resp = false;
                $(Obj).css("box-shadow", `0px 0px 2px 0px rgba(255,0,0,1)`);
            }
            else {
                $(Obj).css("box-shadow", `none`);
            }
        });
        return resp;
    };

    this.DGsB4SaveActions = function () {
        $.each(this.DGBuilderObjs, function (k, DGB) {
            DGB.B4saveActions();
        }.bind(this));
    };

    this.cloneForm = function () {
        let params = [];
        params.push(new fltr_obj(11, "srcRowId", this.rowId));
        let _l = ebcontext.languages.getCurrentLanguageCode();
        let url = `../WebForm/Index?_r=${this.formRefId}&_p=${btoa(JSON.stringify(params))}&_m=9&_l=${this.getLocId()}&_lo=${_l}`;
        window.open(url, '_blank');
    };

    this.openSourceForm = function () {
        if (this.formData.SrcDataId > 0) {
            let params = [];
            params.push(new fltr_obj(11, "id", this.formData.SrcDataId));

            let _l = ebcontext.languages.getCurrentLanguageCode();
            let url = `&_p=${btoa(JSON.stringify(params))}&_m=1&_l=${this.getLocId()}&_lo=${_l}`;
            if (this.formData.SrcRefId?.length > 0)
                url = `../WebForm/Index?_r=${this.formData.SrcRefId}${url}`;
            else if (this.formData.SrcVerId > 0)
                url = `../WebForm/Inde?_r=${this.formData.SrcVerId}${url}`;
            else
                return;
            window.open(url, '_blank');
        }
    };

    this.saveForm = function () {
        if (this.LockSave)
            return;
        this.LockSave = true;
        this.AfterSavePrintDoc = null;
        this.BeforeSave();

        setTimeout(function () {// temp
            let ret = false;
            if (!this.FRC.AllRequired_valid_Check())
                ret = true;
            else if (!this.isAllUniqOK())
                ret = true;
            else if (!this.DGsB4Save())
                ret = true;
            else if (!this.DGsNewB4Save())
                ret = true;
            else if (!this.MeetingB4Save())
                ret = true;
            else if (!this.checkDataConsistency())
                ret = true;

            if (ret) {
                if (this.keepHidden)
                    ebcontext.webform.showSubForm(this.__MultiRenderCxt);
                this.LockSave = false;
                return;
            }

            this.GetEditReason();

        }.bind(this), 4);
    };

    this.checkDataConsistency = function () {

        if (!this.FormObj.CheckDataConsistency)
            return true;

        for (let eid in this.DGBuilderObjs) {
            let DGB = this.DGBuilderObjs[eid];
            let idx = 1;
            //let DgChanged = false;

            for (let rowId in DGB.objectMODEL) {
                DGB.setCurRow(rowId);
                //let rowChanged = false;
                let _ctrls = DGB.objectMODEL[rowId];
                for (let i = 0; i < _ctrls.length; i++) {
                    let ctrl = _ctrls[i];
                    //if ((ctrl.__initDataValue || '') != (ctrl.getValue() || ''))
                    //    rowChanged = true;
                    if (ctrl.ValueExpr && ctrl.ValueExpr.Code && ctrl.ValueExpr.Lang == 0) {
                        if (ctrl.IsDisable && (!(ctrl.DisableExpr && ctrl.DisableExpr.Code) || (ctrl.DisableExpr && ctrl.DisableExpr.Code && ctrl.__IsDisableByExp))) {
                            //if (ctrl.__initDataValue == undefined || (ctrl.__initDataValue || '') != (ctrl.getValue() || '') || rowChanged) {
                            //    DgChanged = true;
                            let _val = null;
                            try {
                                let _FnStr = atob(ctrl.ValueExpr.Code);
                                _val = new Function("form", "user", "sourcectrl", `event`, _FnStr).bind(ctrl, this.formObject, this.userObject, null)();
                                _val = this.FRC.getProcessedValue(ctrl, _val);
                                if ((_val || '') != (ctrl.getValue() || '')) {
                                    EbMessage("show", { Message: `Data inconsistency found in grid '${DGB.ctrl.Label || DGB.ctrl.Name}', Column '${ctrl.Title || ctrl.Name}' Row#${idx} with value '${ctrl.getValue()}' suggested value '${_val}'. Please re-enter Row#${idx}`, AutoHide: false, Background: '#aa0000' });
                                    return false;
                                }
                            }
                            catch (e) {
                                console.error(e);
                                EbMessage("show", { Message: `Data inconsistency found in grid '${DGB.ctrl.Label || DGB.ctrl.Name}', Column '${ctrl.Title || ctrl.Name}' Row#${idx} - Calculation issue - ${e.message}`, AutoHide: false, Background: '#aa0000' });
                                return false;
                            }
                            //}
                        }
                    }
                }
                idx++;
            }

            //if (DgChanged) {
            //    let ctrls = DGB.ctrl.Controls.$values;
            //    for (let i = 0; i < ctrls.length; i++) {
            //        let depCtrlsP = ctrls[i].DependedValExp ? ctrls[i].DependedValExp.$values : [];
            //        for (let j = 0; j < depCtrlsP.length; j++) {
            //            if (depCtrlsP[j].split('.').length == 2) {
            //                let ctrl = this.formObject.__getCtrlByPath(depCtrlsP[j]);
            //                if (ctrl == 'not found')
            //                    continue;
            //                ctrl.__forceIntegrityCheck = true;
            //            }
            //        }
            //    }
            //}
        }

        for (let i = 0; i < this.flatControls.length; i++) {
            let ctrl = this.flatControls[i];
            if (ctrl.ValueExpr && ctrl.ValueExpr.Code && ctrl.ValueExpr.Lang == 0) {
                if (ctrl.IsDisable && (!(ctrl.DisableExpr && ctrl.DisableExpr.Code) || (ctrl.DisableExpr && ctrl.DisableExpr.Code && ctrl.__IsDisableByExp))) {
                    //if (ctrl.__initDataValue == undefined || ctrl.__forceIntegrityCheck || (ctrl.__initDataValue || '') != (ctrl.getValue() || '')) {
                    let _val = null;
                    try {
                        let _FnStr = atob(ctrl.ValueExpr.Code);
                        _val = new Function("form", "user", "sourcectrl", `event`, _FnStr).bind(ctrl, this.formObject, this.userObject, null)();
                        _val = this.FRC.getProcessedValue(ctrl, _val);
                        if ((_val || '') != (ctrl.getValue() || '')) {
                            EbMessage("show", { Message: `Data inconsistency found - ${ctrl.Label || ctrl.Name} with value '${ctrl.getValue()}' suggested value '${_val}'`, AutoHide: false, Background: '#aa0000' });
                            return false;
                        }
                    }
                    catch (e) {
                        console.error(e);
                        EbMessage("show", { Message: `Data inconsistency found - Calculation issue: ${ctrl.Label || ctrl.Name} - ${e.message}`, AutoHide: false, Background: '#aa0000' });
                        return false;
                    }
                    //}
                }
            }
        }

        return true;
    };

    this.GetEditReason = function () {
        let clearLockFlag = true;
        if (this.FormObj.EditReasonCtrl && this.Mode.isEdit) {
            let ctrl = getObjByval(this.flatControls, "Name", this.FormObj.EditReasonCtrl);
            if (ctrl && ctrl.ObjType == "TextBox") {
                clearLockFlag = false;
                EbDialog("show",
                    {
                        Message: "Enter Edit Reason",
                        Buttons: {
                            "Confirm": { Background: "green", Align: "left", FontColor: "white;" },
                            "Back": { Background: "violet", Align: "right", FontColor: "white;" }
                        },
                        IsPrompt: true,
                        PromptLines: ctrl.TextMode == 4 ? (ctrl.RowsVisible ? ctrl.RowsVisible : 3) : 1,
                        CallBack: function (ctrl, name, prompt) {
                            if (name === "Confirm") {
                                if (prompt && prompt.trim() != '') {
                                    let reasonTxt = prompt.trim();
                                    ctrl.justSetValue(reasonTxt);

                                    //this.FRC.checkUnique4All_save(this.flatControls, true);

                                    new EbProvUserUniqueChkJs({
                                        FormObj: this.FormObj,
                                        CallBackFn: this.userProvCallBack.bind(this),
                                        showLoaderFn: this.showLoader,
                                        hideLoaderFn: this.hideLoader,
                                        renderMode: this.renderMode,
                                        renderer: this
                                    });
                                }
                                else {
                                    EbMessage("show", { Message: 'Please Enter Reason', AutoHide: true, Background: '#aa0000', Delay: 2000 });
                                    return true;
                                }
                            }
                            else
                                this.LockSave = false;
                        }.bind(this, ctrl)
                    });
            }
        }
        if (clearLockFlag) {
            new EbProvUserUniqueChkJs({
                FormObj: this.FormObj,
                CallBackFn: this.userProvCallBack.bind(this),
                showLoaderFn: this.showLoader,
                hideLoaderFn: this.hideLoader,
                renderMode: this.renderMode,
                renderer: this
            });
        }
    }.bind(this);

    //Provision user related unique check callback function
    this.userProvCallBack = function (ok) {
        if (ok) {
            this.FRC.checkUnique4All_save(this.flatControls, true);
        }
        else {
            this.LockSave = false;
            if (this.keepHidden)
                ebcontext.webform.showSubForm(this.__MultiRenderCxt);
        }
    };

    this.saveAsDraft_Call = function (title) {
        this.showLoader();
        $.ajax({
            type: "POST",
            url: "/WebForm/SaveFormDraft",
            data: {
                RefId: this.formRefId,
                DraftId: this.draftId,
                Json: JSON.stringify(this.formData),
                CurrentLoc: this.getLocId(),
                Title: title
            },
            error: function (xhr, ajaxOptions, thrownError) {
                this.hideLoader();
                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000', Delay: 4000 });
            }.bind(this),
            success: this.saveDraftSuccess.bind(this)
        });
    }.bind(this);

    this.saveAsDraft = function () {
        let title = '';

        try {
            if (this.FormObj.DraftTitleExpression && this.FormObj.DraftTitleExpression.Code && this.FormObj.DraftTitleExpression.Code !== '') {
                if (this.formObject)
                    title = new Function("form", "user", atob(this.FormObj.DraftTitleExpression.Code)).bind('', this.formObject, ebcontext.user)();
            }
        }
        catch (e) { console.log("Error in draft title expression  " + e.message); }

        if (!title)
            title = this.FormObj.DisplayName;

        this.saveAsDraft_Call(title);

        //EbDialog("show",
        //    {
        //        Message: "Draft Title",
        //        IsPrompt: true,
        //        DefaultText: title,
        //        Buttons: {
        //            "Continue": { Background: "green", Align: "left", FontColor: "white;" },
        //            "Cancel": { Background: "violet", Align: "right", FontColor: "white;" }
        //        },
        //        CallBack: function (name, inputText) {
        //            if (name === "Continue") {
        //                this.saveAsDraft_Call(inputText);
        //            }
        //        }.bind(this)
        //    });
    }.bind(this);

    this.saveForm_call = function () {
        this.showLoader();
        $.ajax({
            type: "POST",
            url: "/WebForm/InsertWebformData",
            data: {
                ValObj: this.getFormValuesObjWithTypeColl(),
                RefId: this.formRefId,
                RowId: this.rowId,
                DraftId: this.draftId,
                CurrentLoc: this.getLocId(),
                sseChannel: this.sseChannel,
                sse_subscrId: ebcontext.subscription_id,
                fsCxtId: this.fsCxtId
            },
            error: function (xhr, ajaxOptions, thrownError) {
                this.hideLoader();
                this.LockSave = false;
                if (this.keepHidden)
                    ebcontext.webform.showSubForm(this.__MultiRenderCxt);
                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000', Delay: 4000 });
            }.bind(this),
            success: this.saveSuccess.bind(this)
        });
    };

    //functions to be executed before save in frontend
    this.BeforeSave = function () {
        $(":focus").blur();
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
        this.mode = "View Mode";
        this.setHeader(this.mode);
        this.BeforeModeSwitch(this.mode);
        this.flatControls = getFlatCtrlObjs(this.FormObj);// here re-assign objectcoll with functions

        if (this.ReviewCtrl && this.DataMODEL.hasOwnProperty(this.ReviewCtrl.TableName)) {
            let DataMODEL = this.DataMODEL[this.ReviewCtrl.TableName];
            this.ReviewCtrl._Builder.switch2viewMode(DataMODEL);
        }

        this.disbleControlsInViewMode();
        //$.each(this.DGs, function (k, DG) {
        //    this.DGBuilderObjs[DG.EbSid_CtxId].SwitchToViewMode();
        //}.bind(this));
    };

    this.S2EmodeReviewCtrl = function () {
        if (this.ReviewCtrl) {
            this.ReviewCtrl._Builder.switch2editMode();
            if (!this.ReviewCtrl._Builder.isFormDataEditable) {
                return false;
            }
        }
        return true;
    }.bind(this);

    this.S2EmodeDGCtrls = function () {
        $.each(this.DGs, function (k, DG) {
            this.DGBuilderObjs[DG.EbSid_CtxId].SwitchToEditMode();
        }.bind(this));
        $.each(this.DGsNew, function (k, DG) {
            this.DGNewBuilderObjs[DG.EbSid_CtxId].SwitchToEditMode();
        }.bind(this));
        $.each(this.WizardControls, function (i, wizControl) {
            wizControl.SwitchToEditMode();
        }.bind(this));
    }.bind(this);

    this.enableControlsInEditMode = function () {
        $.each(this.flatControls, function (i, ctrl) {
            if ((ctrl.IsDisable && ctrl.__IsDisableByExp === undefined) || ctrl.__IsDisableByExp === true)
                return;
            if (ctrl.ObjType === "ExportButton" && ctrl.DisableInEditMode) {
                ctrl.disable();
                return;
            }
            ctrl.enable();
        }.bind(this));
    };

    this.disbleControlsInViewMode = function () {
        $.each(this.flatControls, function (k, ctrl) {
            if (ctrl.ObjType === "ExportButton") {
                return true;
            }
            if (!ctrl.__IsDisable) {
                ctrl.disable();
            }
        }.bind(this));
    };

    this.setUniqCtrlsInitialVals = function () {
        $.each(this.flatControls, function (i, ctrl) {
            if (ctrl.Unique)
                this.uniqCtrlsInitialVals[ctrl.EbSid] = ctrl.getValue();
        }.bind(this));
    };

    //this.CheckToAllowEditMode = function () {
    //    this.showLoader();
    //    $.ajax({
    //        type: "POST",
    //        url: "/WebForm/EnableEditMode_SSE",
    //        data: {
    //            formId: option.formRefId,
    //            dataId: option.rowId,
    //            sseChannel: this.sseChannel,
    //            sse_subscrId: ebcontext.subscription_id
    //        },
    //        headers: { 'eb_sse_subid': ebcontext.subscription_id },
    //        error: function (xhr, ajaxOptions, thrownError) {
    //            EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: 'aa0000' });
    //            this.hideLoader();
    //        }.bind(this),
    //        success: function (result) {
    //            this.hideLoader();
    //            if (result) {
    //                this.SwitchToEditMode();
    //            }
    //            else {
    //                ($(`.objectDashB-toolbar #webformedit`).attr("disabled", true));
    //                EbMessage("show", { Message: "Another user is currently editing the same form", AutoHide: true, Background: 'blue' });

    //            }
    //        }.bind(this)
    //    });
    //};


    this.SwitchToEditMode = function () {
        if (!this.S2EmodeReviewCtrl()) // switch to Edit mode  - ReviewCtrl
            return;
        if (!ebcontext.finyears.canSwitchToEditMode(this.__MultiRenderCxt))
            return;
        this.formObject.__mode = "edit";
        this.Mode.isEdit = true;
        this.Mode.isView = false;
        this.Mode.isNew = false;

        this.S2EmodeDGCtrls();// switch to Edit mode  - all DG controls
        //    this.ApprovalCtrl.enableAccessibleRow(this.DataMODEL[this.ApprovalCtrl.TableName]);
        this.mode = "Edit Mode";
        this.BeforeModeSwitch(this.mode);
        this.setHeader(this.mode);
        this.flatControls = getFlatCtrlObjs(this.FormObj);// here re-assign objectcoll with functions
        this.enableControlsInEditMode();
        this.setUniqCtrlsInitialVals();
    };

    this.isBtnDisableFor_eb_default = function () {
        this.flatControls = getFlatCtrlObjs(this.FormObj);
        // if eb_default control is true disable some operations on form entry
        for (let i = 0; i < this.flatControls.length; i++) {
            let ctrl = this.flatControls[i];
            if (ctrl.ObjType === "RadioButton" && ctrl.Name === "eb_default") {
                let c = getObjByval(this.DataMODEL[this.FormObj.TableName][0].Columns, "Name", "eb_default");
                if (c !== undefined && c.Value === "T") {
                    if (!(this.userObject.Roles.contains("SolutionOwner") || this.userObject.Roles.contains("SolutionAdmin") || this.userObject.Roles.contains("SolutionPM")))
                        return true;
                }
                return false;
            }
        }
    };

    this.isDisableDelete = function () {
        // EbSQLValidator conditions for form entry delete permission
        for (let k in this.FormObj.DisableDelete.$values) {
            let obj = this.FormObj.DisableDelete.$values[k];
            if (!obj.IsDisabled && !obj.IsWarningOnly) {
                if (this.DisableDeleteData[obj.Name])
                    return true;
            }
        }
        return false;
    };

    this.isDisableCancel = function () {
        // EbSQLValidator conditions for form entry cancel permission
        for (let k in this.FormObj.DisableCancel.$values) {
            let obj = this.FormObj.DisableCancel.$values[k];
            if (!obj.IsDisabled && !obj.IsWarningOnly) {
                if (this.DisableCancelData[obj.Name])
                    return true;
            }
        }
        return false;
    };

    this.BeforeModeSwitch = function (newMode) {
        if (this.renderMode === 2) return;

        if (newMode === "View Mode") {
            // if eb_default control is true disable some operations on form entry
            if (this.isBtnDisableFor_eb_default()) {
                this.$saveBtn.prop("disabled", true);
                //this.$deleteBtn.prop("disabled", true);
                this.$editBtn.prop("disabled", true);
                //this.$cancelBtn.prop("disabled", true);
                //this.$saveBtn.prop("title", "Save Disabled");  
            }

            $.each(this.formData.DisableEdit, function (k, status) {
                if (status) {
                    this.$editBtn.prop("disabled", true);
                    return;
                }
            }.bind(this));
        }
        else {
            //this.$saveBtn.prop("disabled", false);
            //this.$deleteBtn.prop("disabled", false);
            //this.$editBtn.prop("disabled", false);
            //this.$cancelBtn.prop("disabled", false);
        }
    };

    this.deleteForm = function () {
        this.hideInfoWindow();
        EbDialog("show",
            {
                Message: "Are you sure to delete this data entry?",
                Buttons: {
                    "Yes": { Background: "green", Align: "left", FontColor: "white;" },
                    "No": { Background: "violet", Align: "right", FontColor: "white;" }
                },
                CallBack: function (name) {
                    if (name === "Yes") {
                        this.showLoader();
                        $.ajax({
                            type: "POST",
                            url: "/WebForm/DeleteWebformData",
                            data: { RefId: this.formRefId, RowId: this.rowId, CurrentLoc: this.getLocId() },
                            error: function (xhr, ajaxOptions, thrownError) {
                                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000', Delay: 4000 });
                                this.hideLoader();
                            }.bind(this),
                            success: function (result) {
                                this.hideLoader();
                                if (result > 0) {
                                    EbMessage("show", { Message: "Deleted " + this.FormObj.DisplayName + " entry from " + this.getLocObj().LongName, AutoHide: true, Background: '#00aa00', Delay: 3000 });
                                    setTimeout(function () {
                                        if (this.renderMode === 2)
                                            ebcontext.webform.hideSubForm(this.__MultiRenderCxt);
                                        else
                                            window.top.close();
                                    }.bind(this), 3000);
                                }
                                else if (result === -1) {
                                    EbMessage("show", { Message: 'Delete operation failed due to validation failure.', AutoHide: true, Background: '#aa0000', Delay: 4000 });
                                }
                                else if (result === -2) {
                                    EbMessage("show", { Message: 'Access denied to delete this entry.', AutoHide: true, Background: '#aa0000', Delay: 4000 });
                                }
                                else {
                                    EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Background: '#aa0000', Delay: 4000 });
                                }
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
    };

    this.deleteDraft = function () {
        this.hideInfoWindow();
        EbDialog("show",
            {
                Message: "Are you sure to delete this draft entry?",
                Buttons: {
                    "Yes": { Background: "green", Align: "left", FontColor: "white;" },
                    "No": { Background: "violet", Align: "right", FontColor: "white;" }
                },
                CallBack: function (name) {
                    if (name === "Yes") {
                        this.showLoader();
                        $.ajax({
                            type: "POST",
                            url: "/WebForm/DiscardFormDraft",
                            data: { RefId: this.formRefId, DraftId: this.draftId },
                            error: function (xhr, ajaxOptions, thrownError) {
                                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000', Delay: 4000 });
                                this.hideLoader();
                            }.bind(this),
                            success: function (result) {
                                this.hideLoader();
                                let resp = JSON.parse(result);
                                if (resp.Status === 200) {
                                    EbMessage("show", { Message: "Draft entry Deleted successfully", AutoHide: true, Background: '#00aa00', Delay: 4000 });
                                    setTimeout(function () {
                                        if (this.renderMode === 2)
                                            ebcontext.webform.hideSubForm(this.__MultiRenderCxt);
                                        else
                                            window.top.close();
                                    }.bind(this), 3000);
                                }
                                else {
                                    EbMessage("show", { Message: resp.Message, AutoHide: true, Background: '#aa0000', Delay: 4000 });
                                }
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
    };

    this.cancelForm = function () {
        this.hideInfoWindow();
        let msg = `Are you sure to ${this.formData.IsCancelled ? 'Revoke Cancellation of' : 'Cancel'} this data entry?`;
        let yesBtnTxt = 'Yes';
        let noBtnTxt = 'No';
        if (this.FormObj.CancelReason) {
            msg = `Enter Reason for Cancellation ${this.formData.IsCancelled ? 'Revoke' : ''}`;
            yesBtnTxt = 'Confirm';
            noBtnTxt = 'Back';
        }
        EbDialog("show",
            {
                Message: msg,
                Buttons: {
                    [yesBtnTxt]: { Background: "green", Align: "left", FontColor: "white;" },
                    [noBtnTxt]: { Background: "violet", Align: "right", FontColor: "white;" }
                },
                IsPrompt: this.FormObj.CancelReason,
                PromptLines: 3,
                CallBack: function (name, prompt) {
                    let reasonTxt = '';
                    if (name === "Confirm") {
                        if (prompt && prompt.trim() != '') {
                            reasonTxt = prompt.trim();
                        }
                        else {
                            EbMessage("show", { Message: 'Please Enter Reason', AutoHide: true, Background: '#aa0000', Delay: 2000 });
                            return true;
                        }
                    }
                    if (name === "Yes" || name === "Confirm") {
                        this.showLoader();
                        $.ajax({
                            type: "POST",
                            url: "/WebForm/CancelWebformData",
                            data: {
                                RefId: this.formRefId,
                                RowId: this.rowId,
                                CurrentLoc: this.getLocId(),
                                Cancel: !this.formData.IsCancelled,
                                Reason: reasonTxt
                            },
                            error: function (xhr, ajaxOptions, thrownError) {
                                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000', Delay: 4000 });
                                this.hideLoader();
                            }.bind(this),
                            success: function (result) {
                                this.hideLoader();
                                if (result.item1 > 0) {
                                    EbMessage("show", { Message: `${this.formData.IsCancelled ? 'Cancellation Revoked' : 'Canceled'} ${this.FormObj.DisplayName} entry from ${this.getLocObj().LongName}`, AutoHide: true, Background: '#00aa00', Delay: 3000 });
                                    this.formData.IsCancelled = !this.formData.IsCancelled;
                                    this.formData.ModifiedAt = result.item2;
                                    this.setHeader(this.mode);
                                }
                                else if (result.item1 === -1) {
                                    EbMessage("show", { Message: `${this.formData.IsCancelled ? 'Revoke Cancel' : 'Cancel'} operation failed due to validation failure.`, AutoHide: true, Background: '#aa0000', Delay: 4000 });
                                }
                                else if (result.item1 === -2) {
                                    EbMessage("show", { Message: `Access denied to ${this.formData.IsCancelled ? 'Revoke Cancellation of' : 'Cancel'} this entry.`, AutoHide: true, Background: '#aa0000', Delay: 4000 });
                                }
                                else {
                                    EbMessage("show", { Message: `Something went wrong`, AutoHide: true, Background: '#aa0000', Delay: 4000 });
                                }
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
    };

    this.lockUnlockForm = function () {
        this.hideInfoWindow();
        EbDialog("show",
            {
                Message: `Are you sure to ${this.formData.IsLocked ? 'UNLOCK' : 'LOCK'} this data entry?`,
                Buttons: {
                    "Yes": { Background: "green", Align: "left", FontColor: "white;" },
                    "No": { Background: "violet", Align: "right", FontColor: "white;" }
                },
                CallBack: function (name) {
                    if (name === "Yes") {
                        this.showLoader();
                        $.ajax({
                            type: "POST",
                            url: "/WebForm/LockUnlockWebformData",
                            data: {
                                RefId: this.formRefId,
                                RowId: this.rowId,
                                CurrentLoc: this.getLocId(),
                                Lock: !this.formData.IsLocked
                            },
                            error: function (xhr, ajaxOptions, thrownError) {
                                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000', Delay: 4000 });
                                this.hideLoader();
                            }.bind(this),
                            success: function (result) {
                                this.hideLoader();
                                if (result.item1 > 0) {
                                    this.formData.IsLocked = !this.formData.IsLocked;
                                    this.formData.ModifiedAt = result.item2;
                                    EbMessage("show", { Message: `${this.formData.IsLocked ? 'Locked' : 'Unlocked'} ${this.FormObj.DisplayName} entry from ${this.getLocObj().LongName}`, AutoHide: true, Background: '#00aa00', Delay: 3000 });
                                    this.setHeader(this.mode);
                                }
                                else if (result.item1 === -1) {
                                    EbMessage("show", { Message: `${this.formData.IsLocked ? 'Unlock' : 'Lock'} operation failed due to validation failure.`, AutoHide: true, Background: '#aa0000', Delay: 4000 });
                                }
                                else if (result.item1 === -2) {
                                    EbMessage("show", { Message: `Access denied to ${this.formData.IsLocked ? 'Unlock' : 'Lock'} this entry.`, AutoHide: true, Background: '#aa0000', Delay: 4000 });
                                }
                                else {
                                    EbMessage("show", { Message: `Something went wrong`, AutoHide: true, Background: '#aa0000', Delay: 4000 });
                                }
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
    };

    this.NotifyBtnClicked = function () {
        this.hideInfoWindow();
        //EbFormNotification 2nd
        $("#EbFnOuterCont").remove();
        this.ebfn_usersTile = null;

        if ($("#EbFnModal").length === 0) {
            $("body").append(`
<div id="EbFnOuterCont">
    <div class="modal fade" id="EbFnModal" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" style="opacity: 1;">&times;</button>
                    <h4 class="modal-title">Send Message</h4>
                </div>
                <div class="modal-body">
                    <div id="EbFnInnerCont"> <div class="ebfn-loaderdiv"><i class="fa fa-spinner fa-pulse"></i> Loading...</div> </div>
                    <div class='ebfn-msg-cont'>
                        <div>Message</div>
                        <textarea id="ebfn-msg">Please check '${this.FormObj.DisplayName}'</textarea>
                    </div>
                </div>
                <div class="modal-footer">                    
                    <button id="EbFnSend" class="ebbtn eb_btn-sm eb_btnblue">Send</button>
                    <button class="ebbtn eb_btn-sm eb_btnplain" data-dismiss="modal">Cancel</button>
                </div>
            </div>
        </div>
    </div>
    <div id="EbFnCont2"></div>
</div>
`)
        }

        $("#EbFnSend").off("click").on("click", this.SendNoificationClicked.bind(this));
        $("#EbFnModal").modal("show");

        if (this.ebfn_usersTile) {
            this.ebfn_usersTile.clearItems();
            this.ebfn_usersTile.onClickBtnAddModal();
        }
        else {
            this.getUsersList();
        }
    };

    this.SendNoificationClicked = function () {
        let msg = $('#ebfn-msg').val();
        if (!(typeof (msg) == "string" && msg.trim())) {
            alert('Message is required');
            return;
        }
        if (!this.rowId) {
            alert('Validation failed: Not a valid record.');
            return;
        }
        if (!this.ebfn_usersTile) {
            alert('Something went wrong in user selection');
            return;
        }
        let ids = this.ebfn_usersTile.getItemIds();
        if (!ids) {
            alert('Validation failed: select atleast one user.');
            return;
        }
        $("#EbFnModal").modal("hide");
        this.showLoader();
        EbMessage("show", { Message: `Sending message...`, AutoHide: true, Background: '#0000aa', Delay: 1000 });
        let params = [];
        params.push(new fltr_obj(11, "id", this.rowId));
        let _l = ebcontext.languages.getCurrentLanguageCode();
        let uurl = `../WebForm/Index?_r=${this.formRefId}&_p=${btoa(JSON.stringify(params))}&_m=1&_l=${this.getLocId()}&_lg=${_l}`;
        $.ajax({
            type: "POST",
            url: "/WebForm/SendNotification",
            data: {
                link: uurl,
                message: msg,
                uids: ids
            },
            error: function () {
                this.hideLoader();
                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000', Delay: 4000 });
            },
            success: function (result) {
                this.hideLoader();
                if (result == 'success')
                    EbMessage("show", { Message: `Message sent successfully!`, AutoHide: true, Background: '#00aa00', Delay: 3000 });
                else
                    EbMessage("show", { Message: 'Exception: ' + result, AutoHide: true, Background: '#aa0000', Delay: 4000 });
            }.bind(this)
        });
    };

    this.getUsersList = function () {
        $.ajax({
            type: "POST",
            url: "/Security/GetUsersList",
            data: {},
            error: function () {
                $("#EbFnModal").modal("hide");
                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000', Delay: 4000 });
            },
            success: function (result) {
                try {
                    let allus = JSON.parse(result);
                    let $modal = $("#EbFnModal");
                    let metadata2 = ['Id', 'Name', 'Email', 'ProfilePicture', '_simpleClose'];

                    this.ebfn_usersTile = new TileSetupJs({
                        $container: $modal.find("#EbFnInnerCont"),
                        title: "Add",
                        initObjList: [],
                        searchObjList: allus,
                        objMetadata: metadata2,
                        modalContainer: '#EbFnCont2',
                        outerSearch: false,
                        longTitle: 'Selected users',
                        col_md: 'col-md-6',
                        confirmDelete: false,
                        addItemModalTitle: 'Select user(s)'
                    });
                    this.ebfn_usersTile.onClickBtnAddModal();
                }
                catch (e) {
                    $("#EbFnModal").modal("hide");
                    EbMessage("show", { Message: e, AutoHide: true, Background: '#aa0000', Delay: 4000 });
                }
            }.bind(this)
        });
    };

    this.GetAuditTrail = function () {
        this.hideInfoWindow();
        $("#AuditHistoryModal .modal-title").text("Audit Trail - " + this.FormObj.DisplayName);
        $("#AuditHistoryModal").modal("show");
        $("#divAuditTrail").children().remove();
        $("#divAuditTrail").append(`<div class="at-loaderdiv"><i class="fa fa-spinner fa-pulse"></i> Loading...</div>`);
        $.ajax({
            type: "POST",
            url: "/WebForm/GetAuditTrail",
            data: { refid: this.formRefId, rowid: this.rowId, CurrentLoc: this.getLocId() },
            error: function () {
                $("#divAuditTrail").children().remove();
                $("#divAuditTrail").append(`<div class="at-infodiv"> Something unexpected occured </div>`);
            },
            success: function (result) {
                if (result === "{}") {
                    $("#divAuditTrail").children().remove();
                    $("#divAuditTrail").append(`<div class="at-infodiv"> Audit Trail data not found. Contact Admin. </div>`);
                    return;
                }
                let auditObj;
                try {
                    auditObj = JSON.parse(result);
                }
                catch (e) {
                    $("#divAuditTrail").children().remove();
                    $("#divAuditTrail").append(`<div class="at-infodiv"> ${result} </div>`);
                    return;
                }
                this.drawAuditTrailTest(auditObj);
            }.bind(this)
        });
    };

    this.drawAuditTrailTest = function (auditObj) {

        let $transAll = $(`<div></div>`);

        $.each(auditObj, function (idx, Obj) {
            let $trans = $(`<div></div>`);
            let temptitle = Obj.ActionType + " by " + Obj.CreatedBy + " at " + Obj.CreatedAt;
            let chevronIcon = Obj.ActionType === 'Updated' ? `<div class="at-colaparrow"><i class="fa fa-chevron-down"></i></div>` : '';
            $trans.append(` <div class="at-trans-head row ${(Obj.ActionType === 'Updated' ? 'at-updatetr' : '')}">
                                <div class="col-md-10" style="padding: 5px 8px;">
                                    ${chevronIcon}
                                    <div style="display:inline-block;">${temptitle}</div>
                                </div>
                                <div class="col-md-2">
                                    <div style="float: right;">
                                        <img src="/images/dp/${Obj.CreatedById}.png" onerror="this.src = '/images/proimg.jpg';" class="at-dp">
                                    </div>
                                </div>
                            </div>
                            <div class="at-trans-body collapse in"></div>`);

            let trArr = [];

            $.each(Obj.Tables, function (i, Tbl) {
                $.each(Tbl.Columns, function (j, Col) {
                    let temp = `
                        <tr>
                            <td>${Col.Title}</td>
                            <td style="text-decoration: line-through; ${Col.IsModified ? 'color: #ff5e20;' : ''}">${Col.OldValue}</td>
                            <td style="color: #2222e7;">${Col.NewValue}</td>                            
                        </tr>`;
                    trArr.push(temp);
                });
            });
            if (trArr.length > 0) {
                let temp = `
                    <div class="at-inline-div">
                        <table class="table at-first-tbl">
                                <thead><tr class="at-title-tr"><th></th><th>Old value</th><th>New value</th></tr></thead>
                                <tbody> @replacethis@ </tbody>
                        </table>
                    </div>`;

                let trArr1 = trArr.splice(0, (trArr.length + 1) / 2);
                let tmpHtml = temp.replace('@replacethis@', trArr1.join(''));
                if (trArr.length > 0)
                    tmpHtml += temp.replace('@replacethis@', trArr.join(''));

                $trans.children(".at-trans-body").append(tmpHtml);
            }

            let tempHtml = ``;

            $.each(Obj.GridTables, function (i, Tbl) {
                let isTrAvail = false;
                let tableHtml = `<div class="at-table-div"><div>${Tbl.Title}</div><table class="table at-second-tbl">
                                <thead>
                                    <tr class="at-title-tr">
                                        <th></th>`;
                $.each(Tbl.ColumnMeta, function (j, cmeta) {
                    tableHtml += `<th style='${(cmeta.IsNumeric ? 'text-align: right;' : '')}'>${cmeta.Title}</th>`;
                });
                tableHtml += `     </tr>
                                </thead><tbody>`;

                let slno = 1;
                $.each(Tbl.NewRows, function (m, Cols) {
                    let newRow = `<tr class='at-tr-added'><td style=''>Added(${slno++})</td>`;
                    $.each(Cols.Columns, function (n, Col) {
                        newRow += `<td ${(Col.IsNumeric ? "style='text-align: right;'" : '')}>${Col.NewValue}</td>`;
                    });
                    newRow += `</tr>`;
                    tableHtml += newRow;
                    isTrAvail = true;
                });

                slno = 1;
                $.each(Tbl.DeletedRows, function (m, Cols) {
                    let oldRow = `<tr class='at-tr-deleted'><td style=''>Deleted(${slno++})</td>`;
                    $.each(Cols.Columns, function (n, Col) {
                        oldRow += `<td style='text-decoration: line-through;${(Col.IsNumeric ? 'text-align: right;' : '')}'>${Col.OldValue}</td>`;
                    });
                    oldRow += `</tr>`;
                    tableHtml += oldRow;
                    isTrAvail = true;
                });

                slno = 1;
                $.each(Tbl.EditedRows, function (m, Cols) {
                    let oldRow = `<tr class='at-tr-edited'><td></td>`;
                    let newRow = `<tr class='at-tr-edited'><td style = 'border: 0;'>Edited(${slno++})</td>`;
                    let changeFound = false;
                    $.each(Cols.Columns, function (n, Col) {
                        if (Col.IsModified) {
                            oldRow += `<td style="color: #ff5e20; text-decoration: line-through; ${(Col.IsNumeric ? 'text-align: right;' : '')}">${Col.OldValue}</td>`;
                            newRow += `<td style='border: 0; ${(Col.IsNumeric ? 'text-align: right;' : '')}'>${Col.NewValue}</td>`;
                            changeFound = true;
                        }
                        else {
                            oldRow += `<td></td>`;
                            newRow += `<td style = 'border: 0; ${(Col.IsNumeric ? 'text-align: right;' : '')}'>${Col.NewValue}</td>`;
                        }
                    });
                    newRow += `</tr>`;
                    oldRow += `</tr>`;
                    if (changeFound) {
                        tableHtml += oldRow + newRow;
                        isTrAvail = true;
                    }
                });

                tableHtml += `</tbody></table></div>`;
                if (isTrAvail)
                    tempHtml += tableHtml;
            });
            $trans.children(".at-trans-body").append(tempHtml);
            $transAll.append($trans);
        });

        $("#divAuditTrail").children().remove();
        $("#divAuditTrail").append($transAll);

        $("#divAuditTrail .at-trans-head").off("click").on("click", function (e) {
            $(e.target).closest(".at-trans-head").next().collapse('toggle');
            let $iele = $(e.target).closest(".at-trans-head").find("i");

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
        if (this.renderMode === 2)
            ebcontext.webform.showSubFormLoader(this.__MultiRenderCxt);
        else
            $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#WebForm-cont" } });
    };

    this.hideLoader = function () {
        if (this.renderMode === 2)
            ebcontext.webform.hideSubFormLoader(this.__MultiRenderCxt);
        else
            $("#eb_common_loader").EbLoader("hide");
    };

    this.getLocId = function (strictMode = false) {
        let d = this.DataMODEL;
        let t = this.FormObj.TableName;
        let p = getFlatObjOfType(this.FormObj, "ProvisionLocation");
        let loc = ebcontext.locations ? ebcontext.locations.getCurrent() : 0;
        if (this.rowId > 0) {//edit mode
            if (p && p.length > 0) {
                if (p[0].getValue && p[0].getValue() > 0)
                    return p[0].getValue();
                else if (!strictMode && d && t && d[t] && d[t].length > 0 && d[t][0].LocId > 0)
                    return d[t][0].LocId;
                else {
                    console.error('Invalid Prov location value');
                    return strictMode ? 0 : loc;
                }
            }
            else {
                if (d && t && d[t] && d[t].length > 0 && d[t][0].LocId > 0)
                    return d[t][0].LocId;
                else {
                    console.error('Invalid location id');
                    return strictMode ? 0 : loc;
                }
            }
        }
        else {//new mode
            if (p && p.length > 0 && strictMode)
                return 0;
            if (this.mode === 'Export Mode' && d && t && d[t] && d[t].length > 0 && d[t][0].LocId > 0)
                return d[t][0].LocId;
            return loc;
        }
        //if (this.rowId > 0 && p && p.length > 0 && p[0].getValue && p[0].getValue() > 0)
        //    return p[0].getValue();
        //else if (d && t && d[t] && d[t].length > 0 && d[t][0].LocId > 0)
        //    return d[t][0].LocId;
        //else
        //    return ebcontext.locations.getCurrent();
    };

    this.getLocObj = function () {
        let locObj = getObjByval(ebcontext.locations.Locations, "LocId", this.getLocId());
        if (locObj)
            return locObj;
        return ebcontext.locations.CurrentLocObj;//
    };

    //key event listener
    this.windowKeyDown = function (event) {
        if (event.ctrlKey || event.metaKey) {
            if (event.which === 83) {// ctrl+S -> save
                if ((this.Mode.isEdit || (this.Mode.isNew && !this.FormObj.IsDisable)) && this.preventCheck(event)) {
                    if (this.renderMode === 3 || this.renderMode === 5) {//signup or public
                        let c = getFlatContObjsOfType(this.FormObj, "SubmitButton");
                        if (c) {
                            $(`#webform_submit_${c[0].EbSid_CtxId}`).click();
                        }
                        else {
                            $('#webform_submit').click();
                        }
                    }
                    else
                        this.saveForm();
                }
            }
            else if (event.which === 69) {// ctrl+E -> edit
                if (this.$editBtn.css("display") !== "none" && this.preventCheck(event)) {
                    if ($(`#${this.hBtns['Edit']}:enabled`).length > 0)
                        this.SwitchToEditMode();
                }
            }
            else if (event.which === 81) {// ctrl+Q -> discard
                if ($(`#${this.hBtns['Discard']}`).css("display") !== "none" && this.preventCheck(event)) {
                    this.DiscardChanges();
                }
            }
            else if (event.which === 80) {// ctrl+P //check in no print form
                if (this.preventCheck(event)) {
                    if (this.Mode.isNew) {
                        let prOps = $(`#${this.hBtns['SaveSel']} .selectpicker`).find("option[data-ref]");
                        if (prOps.length > 0) {
                            this.saveForm();
                            this.afterSavemodeS = $(prOps[0]).attr("data-token");
                            this.AfterSavePrintDoc = $(prOps[0]).attr("data-ref");
                        }
                    }
                    else if ($(`#${this.hBtns['PrintSel']}`).css("display") !== "none") {
                        $(`#${this.hBtns['Print']}`).trigger('click');
                    }
                }
            }
        }
        else if (event.altKey || event.metaKey) {// alt+N -> new
            if (event.which === 78) {
                if ($(`#${this.hBtns['New']}`).css("display") !== "none" && this.preventCheck(event)) {
                    this.startNewMode();
                }
            }
            else if (event.which === 80) {// alt+P - Print dd
                if ($(`#${this.hBtns['PrintSel']}`).css("display") !== "none" && this.preventCheck(event)) {
                    $(`#${this.hBtns['PrintSel']} .selectpicker`).selectpicker('toggle');
                }
            }
            else if (event.which === 83) {// alt+S - Save dd
                if ($(`#${this.hBtns['SaveSel']}`).css("display") !== "none" && this.preventCheck(event)) {
                    $(`#${this.hBtns['SaveSel']} .selectpicker`).selectpicker('toggle');
                }
            }
            else if (event.which === 82) {// alt+R - Grid add row
                if ((this.Mode.isEdit || this.Mode.isNew) && this.preventCheck(event)) {
                    this.AddRowToGrid();
                }
            }
        }
    }.bind(this);

    this.preventCheck = function (event) {
        event.preventDefault();
        if ($('.loader_mask_EB .lds-spinner').length > 0)// quick fix
            return false;
        return true;
    };

    this.AddRowToGrid = function () {
        $.each(this.DGBuilderObjs, function (key, val) {
            if (val.$table.is(":visible")) {
                document.activeElement.blur();
                val.addRowBtn_click();
                return false;
            }
        }.bind(this));
    };

    this.disableformEditbtn = function () {
        //$("#webformedit").addClass('eb-disablebtn')
        //    .attr('data-toggle', "tooltip")
        //    .attr('data-placement', "bottom")
        //    .attr("tittle", "Can’t edit this form as it is waiting for approval").tooltip();

        $(`#${this.hBtns['Edit']}`).attr("disabled", true);
    };

    this.enableformEditbtn = function () {
        //$("#webformedit").removeClass('eb-disablebtn').attr("tittle", "Edit").tooltip();
        $(`#${this.hBtns['Edit']}`).attr("disabled", false);
    };

    //this.AdjustDraftBtnsVisibility = function () {
    //    if (this.FormObj.CanSaveAsDraft && this.Mode.isNew) {
    //        this.headerObj.showElement([this.hBtns['DraftSave']]);
    //        if (this.draftId > 0)
    //            this.headerObj.showElement([this.hBtns['DraftDelete']]);
    //    }
    //};

    this.appendRelatedSubmissions = function ($div) {
        if (this.relatedSubmissionsHtml) {
            $div.append(this.relatedSubmissionsHtml);
            return;
        }
        $div.html(`<div style="color: #ccc;"><i class="fa fa-spinner fa-pulse"></i> Loading...</div>`);
        $.ajax({
            type: "POST",
            url: "/WebForm/GetPushedDataInfo",
            data: {
                RefId: this.formRefId, RowId: this.rowId, CurrentLoc: this.getLocId()
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.error('GetPushedDataInfo: Failed to load');
                $div.empty();
            }.bind(this),
            success: function ($div, _resp) {
                try {
                    $div.empty();
                    let _respObj = JSON.parse(_resp);
                    if ($.isEmptyObject(_respObj)) {
                        console.warn('GetPushedDataInfo: Nothing to display');
                    }
                    else {
                        let html = '<div>Related Form Submissions</div><div>';
                        $.each(_respObj, function (k, v) {
                            html += `<span data-link='${v}'>${k}</span><br>`;
                        });
                        html += '</div>';
                        $div.html(html);
                        this.relatedSubmissionsHtml = html;
                    }
                }
                catch (e) {
                    console.log(_resp);
                    console.error(e);
                }
            }.bind(this, $div)
        });
    };

    //this.DataPushedPopover = function () {
    //    $(`#${this.hBtns['Dependent']}`).show();
    //    let timer1;
    //    let contentHtml = null;

    //    let contentFn = function (type) {
    //        let _html = '';
    //        if (type === 'loader') {
    //            _html += `<div style='color: #888;'><i class="fa fa-spinner fa-pulse" aria-hidden="true"></i> Loading...</div>`;
    //        }
    //        else if (type === 'init') {
    //            if (contentHtml)
    //                _html += contentHtml;
    //            else
    //                _html += `<div ><button class='btn' id='${this.hBtns['Dependent']}_btn'><i class="fa fa-refresh"></i> Refresh</button></div>`;
    //        }
    //        else if (type === 'error') {
    //            _html += `<div><button class='btn' id='${this.hBtns['Dependent']}_btn'><i class="fa fa-refresh"></i> Refresh</button><div style="color: #a88;">Error in loading!</div></div>`;
    //        }
    //        return _html;
    //    };

    //    let $poTrig = $(`#${this.hBtns['Dependent']}`).popover({
    //        trigger: 'manual',
    //        html: true,
    //        container: "body",
    //        placement: 'bottom',
    //        content: `<div id='${this.hBtns['Dependent']}-div' style = 'min-height: 80px; min-width: 250px; display: flex; justify-content: center; align-items: center;'></div>`,
    //        delay: { "hide": 100 }
    //    });

    //    let OnMouseEnter = function () {
    //        clearTimeout(timer1);
    //        let _this = this;
    //        let $poDiv = $('#' + $(_this).attr('aria-describedby'));
    //        if (!$poDiv.length) {
    //            $(_this).popover("show");
    //            $poDiv = $('#' + $(_this).attr('aria-describedby'));
    //        }
    //        $poDiv.off("mouseleave").on("mouseleave", function () {
    //            timer1 = setTimeout(function () { $(_this).popover('hide'); }, 300);
    //        });

    //        $poDiv.off("mouseenter").on("mouseenter", function () {
    //            clearTimeout(timer1);
    //        });
    //    };

    //    let OnMouseLeave = function () {
    //        let _this = this;
    //        timer1 = setTimeout(function () {
    //            if (!$('#' + $(_this).attr('aria-describedby') + ':hover').length) {
    //                $(_this).popover("hide");
    //            }
    //        }, 300);
    //    };

    //    let LoadData = function () {
    //        if (contentHtml) {
    //            $(`#${this.hBtns['Dependent']}-div`).html(contentFn('init'));
    //            return;
    //        }
    //        $(`#${this.hBtns['Dependent']}-div`).html(contentFn('loader'));
    //        $.ajax({
    //            type: "POST",
    //            url: "/WebForm/GetPushedDataInfo",
    //            data: {
    //                RefId: this.formRefId, RowId: this.rowId, CurrentLoc: this.getLocId()
    //            },
    //            error: function (xhr, ajaxOptions, thrownError) {
    //                $(`#${this.hBtns['Dependent']}-div`).html(contentFn('error'));
    //            }.bind(this),
    //            success: function (_resp) {
    //                try {
    //                    let _respObj = JSON.parse(_resp);
    //                    if ($.isEmptyObject(_respObj)) {
    //                        contentHtml = '<div style="color: #888;">Nothing to Display</div>'
    //                        $(`#${this.hBtns['Dependent']}-div`).html(contentHtml);
    //                    }
    //                    else {
    //                        contentHtml = '<div>'
    //                        $.each(_respObj, function (k, v) {
    //                            contentHtml += `<div style='padding: 2px 0px;'><a href='${v}' target='_blank'>${k}</a></div>`;
    //                        });
    //                        contentHtml += '</div>';
    //                        $(`#${this.hBtns['Dependent']}-div`).html(contentHtml);
    //                    }
    //                }
    //                catch (e) {
    //                    $(`#${this.hBtns['Dependent']}-div`).html(contentFn('error'));
    //                    console.log(_resp);
    //                    console.error(e);
    //                }
    //            }.bind(this)
    //        })
    //    };

    //    $poTrig.on('click', OnMouseEnter.bind($poTrig));
    //    $poTrig.on('mouseleave', OnMouseLeave.bind($poTrig));
    //    $(`#${this.hBtns['Dependent']}`).off('shown.bs.popover').on('shown.bs.popover', LoadData.bind(this));
    //    $('body').off('click', `#${this.hBtns['Dependent']}_btn`).on('click', `#${this.hBtns['Dependent']}_btn`, LoadData.bind(this));
    //};

    this.setHeader = function (reqstMode) {
        if (this.isPartial === "True") {
            if ($(".objectDashB-toolbar").find(".pd-0:first-child").children("#switch_loc").length > 0) {
                $(".objectDashB-toolbar").find(".pd-0:first-child").children("#switch_loc").remove();
                $(".objectDashB-toolbar").find(".pd-0:first-child").children(".solution_logo_cont").remove();
                $(".objectDashB-toolbar").find(".pd-0:nth-child(2)").find(".form-group").remove();
                $("#quik_menu").remove();
            }
            //this.headerObj.showElement(["webformclose"]);
        }

        let _html = this.AdjustBtnsVisibility(reqstMode);
        let title_val = '';
        try {
            if (this.FormObj.TitleExpression && this.FormObj.TitleExpression.Code && this.FormObj.TitleExpression.Code !== '') {
                if (this.formObject)
                    title_val = " - " + new Function("form", "user", atob(this.FormObj.TitleExpression.Code)).bind('', this.formObject, ebcontext.user)();
            }
        }
        catch (e) { console.log("Error in title expression  " + e.message); }

        let modeText = this.mode;

        if (reqstMode === "New Mode" || reqstMode === "Preview Mode" || reqstMode === "Export Mode" || reqstMode === "Clone Mode" || reqstMode === "Prefill Mode") {
            if (this.FormObj.IsDisable) {
                modeText = "ReadOnly";
                reqstMode = "ReadOnly";
                console.warn("ReadOnly form!.............");
            }
            else
                modeText = "New Mode";
        }
        else if (reqstMode === "Draft Mode" && this.draftId > 0)
            modeText = "Draft";

        modeText = modeText.replace(' Mode', '');

        if (this.renderMode === 2) {//partial
            ebcontext.webform.SetPopupFormTitle(this.FormObj.DisplayName + title_val, modeText, _html);
            return;
        }

        this.headerObj.setName(this.FormObj.DisplayName + title_val);
        if (this.renderMode !== 3 && this.renderMode !== 5)
            this.headerObj.setFormMode(`<span mode="${reqstMode}" class="fmode">${modeText}</span>${_html}`);
        $('title').text(this.FormObj.DisplayName + title_val + `(${modeText})`);

        if (this.isPartial === "True") {
            this.headerObj.hideElement([this.hBtns['New'], this.hBtns['Delete'], this.hBtns['Cancel'], this.hBtns['AuditTrail']]);
        }
    };

    this.AdjustBtnsVisibility = function (reqstMode) {
        let currentLoc = this.getLocId();
        let _html = '';
        this.headerObj.hideElement([this.hBtns['SaveSel'], this.hBtns['New'], this.hBtns['Edit'], this.hBtns['PrintSel'], this.hBtns['PrintPrevSel'], this.hBtns['Clone'], this.hBtns['ExcelSel'], this.hBtns['Discard'], this.hBtns['Details']]);

        //reqstMode = "Edit Mode" or "New Mode" or "View Mode"
        if (this.Mode.isEdit) {
            this.headerObj.showElement(this.filterHeaderBtns([this.hBtns['New'], this.hBtns['SaveSel']], currentLoc, reqstMode));
            this.headerObj.showElement([this.hBtns['Discard'], this.hBtns['Details']]);
        }
        else if (this.Mode.isNew) {
            if (!this.FormObj.IsDisable) {
                this.headerObj.showElement(this.filterHeaderBtns([this.hBtns['SaveSel'], this.hBtns['ExcelSel']], currentLoc, "New Mode"));
                if (this.draftId > 0)
                    this.headerObj.showElement([this.hBtns['Details']]);
            }
        }
        else if (this.Mode.isView) {
            let btnsArr = [this.hBtns['New'], this.hBtns['Edit'], this.hBtns['PrintSel'], this.hBtns['PrintPrevSel'], this.hBtns['Clone']];
            if (this.formData.IsReadOnly || this.formData.IsLocked || this.formData.IsCancelled)
                btnsArr.splice(1, 1);//
            if (this.formData.IsReadOnly) {
                console.warn("ReadOnly record!.............");
                _html += "<span class='fmode' style='background-color: gray;'><i class='fa fa-eye'></i> ReadOnly</span>";
            }
            if (this.formData.IsLocked) {
                console.warn("Locked record!.............");
                _html += "<span class='fmode' style='background-color: blue;'><i class='fa fa-lock'></i> Locked</span>";
            }
            if (this.formData.IsCancelled) {
                console.warn("Cancelled record!.............");
                _html += "<span class='fmode' style='background-color: red;'><i class='fa fa-ban'></i> Cancelled</span>";
            }

            this.headerObj.showElement(this.filterHeaderBtns(btnsArr, currentLoc, reqstMode));
            this.headerObj.showElement([this.hBtns['Details']]);
        }
        return _html;
    };

    this.filterHeaderBtns = function (btns, loc, mode) {
        let r = [];
        if (this.renderMode === 4) {
            if (mode === 'View Mode')
                r.push(this.hBtns['Edit']);
        }
        else {
            if (this.FormObj.IsLocIndependent)
                loc = 0;
            if (!this.formPermissions[loc])
                return r;
            let op = { New: 0, View: 1, Edit: 2, Delete: 3, Cancel: 4, AuditTrail: 5, Clone: 6, ExcelImport: 7, OwnData: 8, LockUnlock: 9, RevokeDelete: 10, RevokeCancel: 11 };
            for (let i = 0; i < btns.length; i++) {
                if (btns[i] === this.hBtns['SaveSel'] && this.formPermissions[loc].includes(op.New) && (mode === 'New Mode'))
                    r.push(btns[i]);
                else if (btns[i] === this.hBtns['SaveSel'] && (this.formPermissions[loc].includes(op.Edit) || (this.formPermissions[loc].includes(op.OwnData) && this.formData.CreatedBy === this.userObject.UserId)) && mode === 'Edit Mode')
                    r.push(btns[i]);
                else if (btns[i] === this.hBtns['Edit'] && (this.formPermissions[loc].includes(op.Edit) || (this.formPermissions[loc].includes(op.OwnData) && this.formData.CreatedBy === this.userObject.UserId)))
                    r.push(btns[i]);
                else if (btns[i] === this.hBtns['New'] && this.formPermissions[loc].includes(op.New) && !this.FormObj.IsDisable)
                    r.push(btns[i]);
                else if ((btns[i] === this.hBtns['PrintSel'] || btns[i] === this.hBtns['PrintPrevSel']) && mode === 'View Mode' && this.FormObj.PrintDocs && this.FormObj.PrintDocs.$values.length > 0)
                    r.push(btns[i]);
                else if (btns[i] === this.hBtns['ExcelSel'] && this.formPermissions[loc].includes(op.ExcelImport) && mode === 'New Mode' && this.FormObj.EnableExcelImport)
                    r.push(btns[i]);
                else if (btns[i] === this.hBtns['Clone'] && this.formPermissions[loc].includes(op.Clone) && mode === 'View Mode' && !this.FormObj.IsDisable)
                    r.push(btns[i]);
            }
        }
        return r;
    };

    this.checkPermission = function (opStr) {
        let loc = this.FormObj.IsLocIndependent ? 0 : this.getLocId();
        if (!this.formPermissions[loc])
            return false;
        let op = { New: 0, View: 1, Edit: 2, Delete: 3, Cancel: 4, AuditTrail: 5, Clone: 6, ExcelImport: 7, OwnData: 8, LockUnlock: 9, RevokeDelete: 10, RevokeCancel: 11 };
        if (opStr === 'DraftSave')
            return this.formPermissions[loc].includes(op['New']) && this.FormObj.CanSaveAsDraft && this.Mode.isNew;
        if (opStr === 'DraftDelete')
            return this.draftId > 0 && this.Mode.isNew;
        if (op[opStr] && !this.Mode.isNew)
            return this.formPermissions[loc].includes(op[opStr]);
        return false;
    };

    //this.filterHeaderBtns_split = function () {
    //    if (btns[i] === this.hBtns['Delete'] && this.formPermissions[loc].includes(op.Delete))
    //        r.push(btns[i]);
    //    else if (btns[i] === this.hBtns['Cancel'] && ((this.formPermissions[loc].includes(op.Cancel) && !this.formData.IsCancelled) || (this.formPermissions[loc].includes(op.RevokeCancel) && this.formData.IsCancelled)))
    //        r.push(btns[i]);
    //    else if (btns[i] === this.hBtns['AuditTrail'] && this.formPermissions[loc].includes(op.AuditTrail))
    //        r.push(btns[i]);
    //    else if (btns[i] === this.hBtns['OpenSrc'] && this.formPermissions[loc].includes(op.View) && mode === 'View Mode')
    //        r.push(btns[i]);
    //    else if (btns[i] === this.hBtns['Lock'] && this.formPermissions[loc].includes(op.LockUnlock) && mode === 'View Mode')
    //        r.push(btns[i]);
    //    else if (btns[i] === this.hBtns['DraftSave'] && this.formPermissions[loc].includes(op.New) && this.FormObj.CanSaveAsDraft && this.Mode.isNew)
    //        r.push(btns[i]);
    //    else if (btns[i] === this.hBtns['DraftDelete'] && this.FormObj.CanSaveAsDraft && this.draftId > 0 && this.Mode.View)
    //        r.push(btns[i]);
    //};

    this.saveSelectChange = function () {
        let selOpt = $(`#${this.hBtns['SaveSel']} .selectpicker`).find("option:selected");
        if (selOpt.attr("data-token") === 'draft') {
            this.saveAsDraft();
        }
        else {
            this.saveForm();
            this.afterSavemodeS = selOpt.attr("data-token");
            this.AfterSavePrintDoc = selOpt.attr("data-ref");
        }
    }.bind(this);

    this.setupPrintiFrame = function () {
        if ($("#iFramePdfModal").length != 0)
            return;
        $("body").append(`
<div id='iFramePdfModal' style='display:none;'>
    <button id='iFramePdfCloseBtn' class="btn" style=''><i class="fa fa-close"></i></button>
    <button id='iFramePdfResizeBtn' class="btn" style=''><i class="fa fa-long-arrow-right"></i></button>
    <div id='iFramePdfCont' class='eb_iframe-Cont' style=" ">
        <iframe id='iFramePdf'></iframe>
    </div>
</div>`);
        $("#iFramePdf").on('load', function (evt) {
            try {
                if ($(evt.target).attr("src") !== undefined) {
                    if (document.getElementById("iFramePdf").contentWindow.document.embeds.length === 1) {
                        if ($("#iFramePdf").data('data-opr') == 'preview') {
                            $("#iFramePdfModal").show();
                        }
                        else {
                            document.getElementById("iFramePdf").focus();
                            document.getElementById("iFramePdf").contentWindow.print();
                        }
                    }
                    else {
                        EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Background: '#aa0000' });
                    }
                    ebcontext.webform.hideLoader();
                }
            }
            catch (e) {
                ebcontext.webform.hideLoader();
                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
            }
        });

        $('#iFramePdfCloseBtn').on('click', function (e) {
            let target = $(e.target).closest('button').parent();
            if (target.attr("id") == "iFramePdfModal") {
                target.hide();
            }
        });

        $('#iFramePdfResizeBtn').on('click', function (e) {
            let $c = $("#iFramePdfModal");
            let $i = $(e.currentTarget).find('i');
            $i.removeClass('fa-long-arrow-right').removeClass('fa-long-arrow-left').removeClass('fa-arrows-h');
            if ($c[0].style.width === '50%') {
                if ($c[0].style.left === '50%') {
                    $c.css('left', '0');
                    $i.addClass('fa-arrows-h');
                }
                else {
                    $c.css('width', '100%').css('left', '0');
                    $i.addClass('fa-long-arrow-right');
                }
            }
            else {
                $c.css('width', '50%').css('left', '50%');
                $i.addClass('fa-long-arrow-left');
            }
        });
    }.bind(this);

    this.initPrintMenu = function () {
        if (this.FormObj.PrintDocs && this.FormObj.PrintDocs.$values.length > 0) {
            this.setupPrintiFrame();
            let $sel = $(`#${this.hBtns['PrintSel']} .selectpicker`);
            let $sel2 = $(`#${this.hBtns['PrintPrevSel']} .selectpicker`);
            for (let i = 0; i < this.FormObj.PrintDocs.$values.length; i++) {
                let tle = this.FormObj.PrintDocs.$values[i].Title || this.FormObj.PrintDocs.$values[i].ObjDisplayName;
                let str = `<option data-token="${this.FormObj.PrintDocs.$values[i].ObjRefId}" data-title="${tle}">${tle}</option>`;
                $sel.append(str);
                $sel2.append(str);
            }

            $sel.selectpicker({ iconBase: 'fa', tickIcon: 'fa-check' });
            $sel2.selectpicker({ iconBase: 'fa', tickIcon: 'fa-check' });
            $(`#${this.hBtns['PrintSel']}, #${this.hBtns['PrintPrevSel']}`).off("click", ".dropdown-menu li").on("click", ".dropdown-menu li", this.printDocument.bind(this));
            $(`#${this.hBtns['Print']}, #${this.hBtns['PrintPrev']}`).off("click").on("click", this.printDocument.bind(this));
        }
    };

    this.printDocument = function (e) {
        let sel = $(e.currentTarget).closest('.btn-select').find(`.selectpicker`);
        let op = sel.attr('data-opr');
        let rptRefid = sel.find("option:selected").attr("data-token");
        this.printDocument_inner(rptRefid, this.rowId, op);
    };

    this.printDocument_inner = function (rptRefid, rowId, op = 'print') {
        $("#iFramePdf").data('data-opr', op);
        $("#iFramePdf").attr("src", "/WebForm/GetPdfReport?refId=" + rptRefid + "&rowId=" + rowId);
        if (this.defaultAfterSavemodeS === 'close')
            setTimeout(function () { ebcontext.webform.showLoader(); }, 100);
        else
            ebcontext.webform.showLoader();
    };

    this.initSaveMenu = function () {
        let $sel = $(`#${this.hBtns['SaveSel']} .selectpicker`);
        let loc = this.FormObj.IsLocIndependent ? 0 : this.getLocId();
        if (this.formPermissions[loc] && this.formPermissions[loc].includes(0) && !this.FormObj.IsDisable)
            $sel.append(`<option data-token="new" data-title="Save and new">Save & New</option>`);
        if (this.formPermissions[loc] && (this.formPermissions[loc].includes(2) || (this.formPermissions[loc].includes(8)) && this.formData.CreatedBy === this.userObject.UserId))
            $sel.append(`<option data-token="edit" data-title="Save and edit">Save & Continue</option>`);
        $sel.append(`<option data-token="view" data-title="Save and view">Save & View</option>`);
        $sel.append(`<option data-token="close" data-title="Save and close">Save & Close</option>`);
        if (this.checkPermission('DraftSave'))
            $sel.append(`<option data-token="draft" data-title="Save as Draft">Save as Draft</option>`);

        if (this.FormObj.PrintDocs && this.FormObj.PrintDocs.$values.length > 0) {
            let printHtml = '<optgroup label="Save & Print">';
            for (let i = 0; i < this.FormObj.PrintDocs.$values.length; i++) {
                let tle = this.FormObj.PrintDocs.$values[i].Title || this.FormObj.PrintDocs.$values[i].ObjDisplayName;
                printHtml += `<option data-token="${(this.renderMode === 2 ? this.defaultAfterSavemodeS : 'view')}" data-ref="${this.FormObj.PrintDocs.$values[i].ObjRefId}" data-title="${tle}">${tle}</option>`;
            }
            printHtml += '</optgroup>';
            $sel.append(printHtml);
        }
        $sel.selectpicker();
    };

    //this.LocationInit = function () {
    //    if (ebcontext.locations.Listener && !this.FormObj.IsLocIndependent) {
    //        ebcontext.locations.Listener.ChangeLocation = function (o) {
    //            if (this.rowId > 0) {
    //                if (this.renderMode !== 4) {
    //                    EbDialog("show", {
    //                        Message: "This data is no longer available in " + o.LongName + ". Redirecting to new mode...",
    //                        Buttons: {
    //                            "Ok": { Background: "green", Align: "right", FontColor: "white;" }
    //                        },
    //                        CallBack: function (name) {
    //                            this.startNewMode();
    //                        }.bind(this)
    //                    });
    //                }
    //            }
    //            else {
    //                let sysLocCtrls = getFlatObjOfType(this.FormObj, "SysLocation");
    //                $.each(sysLocCtrls, function (i, ctrl) {
    //                    let oldLocId = ctrl.getValue();
    //                    if (oldLocId !== o.LocId)
    //                        ctrl.setValue(o.LocId);
    //                }.bind(this));
    //            }
    //        }.bind(this);
    //    }
    //};

    this.locInit4viewMode = function () {
        if (this.FormObj.IsLocIndependent)
            return;

        let locId = this.getLocId();
        let locObj = null;
        if (locId)
            locObj = getObjByval(ebcontext.locations.Locations, "LocId", locId);
        if (!locObj) {
            console.error("Unknown location id found. LocId = " + locId);
            EbDialog("show", {
                Message: "This data is no longer available. Redirecting to new mode...",
                Buttons: {
                    "Ok": { Background: "green", Align: "right", FontColor: "white;" }
                },
                CallBack: function (name) {
                    this.startNewMode();
                }.bind(this)
            });
        }

        //let ol = ebcontext.locations.getCurrent().toString();
        //let nl = this.formData.MultipleTables[this.formData.MasterTable][0].LocId.toString();
        //if (ol !== nl) {
        //    let odlocO = getObjByval(ebcontext.locations.Locations, "LocId", ol);
        //    let nwlocO = getObjByval(ebcontext.locations.Locations, "LocId", nl);
        //    if (typeof nwlocO === "undefined") {
        //        console.error("Unknown location id found. LocId = " + nl);
        //        EbDialog("show", {
        //            Message: "This data is no longer available in " + odlocO.LongName + ". Redirecting to new mode...",
        //            Buttons: {
        //                "Ok": {
        //                    Background: "green",
        //                    Align: "right",
        //                    FontColor: "white;"
        //                }
        //            },
        //            CallBack: function (name) {
        //                this.startNewMode();
        //            }.bind(this)
        //        });
        //    }
        //    else {
        //        EbMessage("show", { Message: `Switching from ${odlocO.LongName} to ${nwlocO.LongName}`, AutoHide: true, Background: '#0000aa', Delay: 3000 });
        //        ebcontext.locations.SwitchLocation(this.formData.MultipleTables[this.formData.MasterTable][0].LocId);
        //        this.setHeader(this.mode);
        //    }
        //}
    };

    this.editModePrefill = function (opts) {
        try {
            let p = JSON.parse(atob(opts.editModePrefillParams));
            for (let i = 0; i < p.length; i++) {
                let c = this.formObject.__getCtrlByPath('form.' + p[i].Name);
                if (c != "not found") {
                    c.setValue(p[i].Value);
                }
            }
            if (opts.editModeAutoSave) {
                opts.editModeAutoSave = false;
                this.saveForm();
            }
        }
        catch (e) {
            if (this.keepHidden)
                ebcontext.webform.showSubForm(this.__MultiRenderCxt);
            console.error('Edit mode prefill error: ' + e.message);
        }
    }.bind(this);

    this.bindEventFns = function () {
        $("[eb-form=true]").off("submit").on("submit", function () { event.preventDefault(); });

        this.$newBtn = $('#' + this.hBtns['New']);
        this.$editBtn = $('#' + this.hBtns['Edit']);
        this.$saveBtn = $('#' + this.hBtns['Save']);

        this.$newBtn.off("click").on("click", this.startNewMode.bind(this));
        this.$editBtn.off("click").on("click", this.SwitchToEditMode.bind(this));
        this.$saveBtn.off("click").on("click", this.saveForm.bind(this));

        if (this.renderMode === 2) {
            this.$openInNewBtn = $('#' + this.hBtns['OpenInNewTab']);
            this.$openInNewBtn.off("click").on("click", this.OpenInNewTab.bind(this));
        }
        else {
            this.$exceleBtn = $('#' + this.hBtns['Excel']);
            this.$excelSelBtn = $('#' + this.hBtns['ExcelSel']);

            this.$excelSelBtn.off("click", ".dropdown-menu li").on("click", ".dropdown-menu li", this.excelExportImport.bind(this));
            $(`#${this.hBtns['ExcelSel']} .selectpicker`).selectpicker({ iconBase: 'fa', tickIcon: 'fa-check' });
            $("#excelfile").off('change').on('change', this.excelUpload.bind(this));
            //this.$draftDeleteBtn = $('#' + this.hBtns['DraftDelete']);
            ///$('#' + this.hBtns['DraftDelete']).off("click").on("click", this.deleteDraft);
        }

        this.$saveSelBtn = $('#' + this.hBtns['SaveSel']);
        this.$cloneBtn = $('#' + this.hBtns['Clone']);
        this.$printBtn = $('#' + this.hBtns['Print']);
        this.$printSelBtn = $('#' + this.hBtns['PrintSel']);
        this.$gotoInvalidBtn = $('#' + this.hBtns['GotoInvalid']);
        //this.$deleteBtn = $('#' + this.hBtns['Delete']);
        //this.$cancelBtn = $('#' + this.hBtns['Cancel']);
        //this.$auditBtn = $('#' + this.hBtns['AuditTrail']);
        //this.$lockBtn = $('#' + this.hBtns['Lock']);
        //this.$draftSaveBtn = $('#' + this.hBtns['DraftSave']);
        //this.$openSrcBtn = $('#' + this.hBtns['OpenSrc']);
        //this.$deleteBtn.off("click").on("click", this.deleteForm.bind(this));
        //this.$cancelBtn.off("click").on("click", this.cancelForm.bind(this));
        //this.$auditBtn.off("click").on("click", this.GetAuditTrail.bind(this));
        //this.$lockBtn.off("click").on("click", this.lockUnlockForm.bind(this));
        //$('#' + this.hBtns['DraftSave']).off("click").on("click", this.saveAsDraft);
        //this.$openSrcBtn.off("click").on("click", this.openSourceForm.bind(this));

        this.$saveSelBtn.off("click", ".dropdown-menu li").on("click", ".dropdown-menu li", this.saveSelectChange);
        this.$cloneBtn.off("click").on("click", this.cloneForm.bind(this));
        $('#' + this.hBtns['Discard']).off("click").on("click", this.DiscardChanges.bind(this));
        $('#' + this.hBtns['Details']).off("click").on("click", this.toggleFormDetails.bind(this));////////////////

        $("body").off("focus", "[ui-inp]").on("focus", "[ui-inp]", this.selectUIinpOnFocus);
    };

    this.OpenInNewTab = function () {
        let url = this.__MultiRenderUrl;
        if (!url) {
            let _l = ebcontext.languages.getCurrentLanguageCode();
            url = `../WebForm/Index?_r=${this.formRefId}&_m=1&_l=${this.getLocId()}&_lg=${_l}`;
        }
        if (this.rowId > 0) {
            let params = [];
            params.push(new fltr_obj(11, "id", this.rowId));
            let _l = ebcontext.languages.getCurrentLanguageCode();
            url = `../WebForm/Index?_r=${this.formRefId}&_p=${btoa(JSON.stringify(params))}&_m=1&_l=${this.getLocId()}&_lg=${_l}`;
        }
        window.open(url, '_blank');
    };

    this.DiscardChanges = function () {
        if (!this.isCloseConfirmRequired()) {
            this.FORCE_RELOAD(this.rowId, this.formDataBackUp, "View Mode");
            return;
        }
        EbDialog("show",
            {
                Message: "Are you sure to Discard all changes?",
                Buttons: {
                    "Yes": { Background: "green", Align: "left", FontColor: "white;" },
                    "No": { Background: "violet", Align: "right", FontColor: "white;" }
                },
                CallBack: function (name) {
                    if (name === "Yes") {
                        this.FORCE_RELOAD(this.rowId, this.formDataBackUp, "View Mode");
                    }
                }.bind(this)
            });
    };

    this.hideInfoWindow = function () {
        $(`#${this.hBtns['Details']}cont`).hide("slide", { direction: 'right' });
        this.$formCont.children('.wfd-overlay').hide();
    };

    this.toggleFormDetails = function () {
        let id = this.hBtns['Details'];
        if (this.$formCont.children('.webformdetails').length === 0) {
            this.$formCont.append(`
<div class='webformdetails' id='${id}cont'> 
    <div class='wfd-header'>Details & More Options
        <button class="btn wfd-close" title="Close">
            <i class="material-icons">close</i>
        </button>
    </div>
    <div class='wfd-inner-cont'>
        
    </div>
    <div class='wfd-footer'>
        <div>Form Version: ${this.formData.FormVersionId}</div>
        <div>Internal Id: ${this.rowId}</div>
    </div>
</div>`);
            this.$formCont.append(`<div class="wfd-overlay" style="position: relative;top: -100%;width: 100%;height: 100%;z-index: 7;background: black;opacity: 0.4;"></div>`);
            this.$formCont.children('.wfd-overlay').off("click").on("click", this.hideInfoWindow.bind(this));
        }

        if ($(`#${id}cont:visible`).length === 0) {
            $(`#${id}cont`).show("slide", { direction: 'right' });
            $(`#${id}cont`).find('.wfd-close').off("click").on("click", this.hideInfoWindow.bind(this));
            this.$formCont.children('.wfd-overlay').show();
        }
        else {
            $(`#${id}cont`).hide("slide", { direction: 'right' });
            this.$formCont.children('.wfd-overlay').hide();
            return;
        }

        let $cont = $(`#${id}cont .wfd-inner-cont`);
        $cont.empty();
        let info = this.draftId > 0 ? (this.draftInfo ? JSON.parse(this.draftInfo) : {}) : this.formData.Info;
        if (info) {
            if (info.CreBy)
                $cont.append(`<div class='wfd-info'> Created By <br/> ${info.CreBy} at ${info.CreAt}</div>`);
            if (info.ModBy && info.ModAt)
                $cont.append(`<div class='wfd-info'> Last Modified By <br/> ${info.ModBy} at ${info.ModAt}</div>`);
            if (info.CreFrom)
                $cont.append(`<div class='wfd-info'> Created From Location: ${info.CreFrom} </div>`);
        }
        if (this.formData.IsReadOnly)
            $cont.append(`<div class='wfd-linkdiv'> This is a <b> Read Only </b> record. </div>`);

        if (this.formData.IsLocked) {
            let $el = $(`<div class='wfd-lock wfd-linkdiv'> This is a <b> Locked </b> Form Submission </div>`);
            if (!this.formData.IsReadOnly && this.checkPermission('LockUnlock')) {
                $el.append(`<span> Unlock </span>`);
            }
            $cont.append($el);
        }
        else if (!this.formData.IsReadOnly && this.checkPermission('LockUnlock')) {
            $cont.append(`<div class='wfd-lock wfd-linkdiv'><span>Lock</span> this Form Submission</div>`);
        }

        let hasSrcForm = this.formData.SrcDataId > 0 && (this.formData.SrcRefId?.length > 0 || this.formData.SrcVerId > 0);

        if (this.formData.IsCancelled) {
            let infoIcon = '';
            if (this.formData.CancelReason) {
                infoIcon = `<i class="fa fa-info-circle" style='color: blue;font-size: 14px;' title='Reason' data-content="${this.formData.CancelReason}"></i>`;
            }
            let $el = $(`<div class='wfd-cancel wfd-linkdiv'>${infoIcon} This is a <b> Cancelled </b> Form Submission </div>`);
            if (!this.formData.IsReadOnly && !this.formData.IsLocked && !hasSrcForm && this.checkPermission('RevokeCancel')) {
                $el.append(`<span> Undo </span>`);
            }
            $cont.append($el);

            if (this.formData.CancelReason) {
                $($el.find('.fa-info-circle')).popover();
            }
        }
        else if (!this.formData.IsReadOnly && !this.formData.IsLocked && !hasSrcForm && this.checkPermission('Cancel')) {
            if (!(this.isBtnDisableFor_eb_default() || this.isDisableCancel()))
                $cont.append(`<div class='wfd-cancel wfd-linkdiv'><span>Cancel</span> this Form Submission</div>`);
        }

        if (this.checkPermission('AuditTrail')) {
            $cont.append(`<div class='wfd-audtrail wfd-btndiv'>
                <div><i class="fa fa-info-circle"></i> Detailed Audit Trail</div>
            </div>`);
        }

        $cont.append(`<div class='wfd-notify wfd-btndiv'>
            <div><i class="fa fa-paper-plane"></i> Send Message</div>
        </div>`);

        $cont.find('.wfd-lock span').off("click").on("click", this.lockUnlockForm.bind(this));
        $cont.find('.wfd-cancel span').off("click").on("click", this.cancelForm.bind(this));
        $cont.find('.wfd-audtrail div').off("click").on("click", this.GetAuditTrail.bind(this));
        $cont.find('.wfd-notify div').off("click").on("click", this.NotifyBtnClicked.bind(this));

        if (this.FormObj.DataPushers && this.FormObj.DataPushers.$values.length > 0) {
            let aValidDP = this.FormObj.DataPushers.$values.find(e => e.$type.includes('EbFormDataPusher') || e.$type.includes('EbBatchFormDataPusher'));
            if (aValidDP && this.checkPermission('AuditTrail')) {
                $cont.append(`<div class='wfd-depend wfd-linkdiv'></div>`);
                this.appendRelatedSubmissions($cont.find('.wfd-depend'));

                $cont.off('click', '.wfd-depend span').on('click', '.wfd-depend span', function (e) {
                    //this.hideInfoWindow();
                    window.open($(e.target).attr('data-link'));
                }.bind(this));
            }
        }

        if (hasSrcForm) {
            $cont.append(`<div class='wfd-source wfd-depend wfd-linkdiv'><span>Open</span> Source Form Submission</div>`);
            $cont.find('.wfd-source span').off("click").on("click", this.openSourceForm.bind(this));
        }

        if (this.checkPermission('DraftDelete')) {
            $cont.append(`<div class='wfd-delete wfd-btndiv'>
                <div><i class="fa fa-trash"></i> Delete Draft</div>
            </div>`);
            $cont.find('.wfd-delete div').off("click").on("click", this.deleteDraft.bind(this));
        }
        else if (this.checkPermission('Delete') && !this.formData.IsReadOnly && !this.formData.IsLocked && !hasSrcForm) {
            if (!(this.isBtnDisableFor_eb_default() || this.isDisableDelete())) {
                $cont.append(`<div class='wfd-delete wfd-btndiv'>
                    <div><i class="fa fa-trash"></i> Delete the Submission</div>
                </div>`);
                $cont.find('.wfd-delete div').off("click").on("click", this.deleteForm.bind(this));
            }
        }
    };

    //this.IsAnyChangesInFormData = function () {
    //    let changeDetected = false;
    //    let modelBkUp = this.formDataBackUp.MultipleTables;
    //    $.each(this.DataMODEL, function (k, Table) {
    //        if (!modelBkUp[k] || (modelBkUp[k] && modelBkUp[k].length != Table.length)) {
    //            changeDetected = true;
    //            return false;
    //        }
    //        for (let i = 0; i < Table.length; i++) {
    //            let RowBkUp = modelBkUp[k].find(e => e.RowId === Table[i].RowId);
    //            if (!RowBkUp || (RowBkUp && RowBkUp.Columns.length != Table[i].Columns.length)) {
    //                changeDetected = true;
    //                return false;
    //            }
    //            for (let j = 0; j < Table[i].Columns.length; j++) {
    //                let ColumnBkUp = RowBkUp.Columns.find(e => e.Name === Table[i].Columns[j].Name);
    //                if (!ColumnBkUp || (ColumnBkUp && Table[i].Columns[j].Value !== ColumnBkUp.Value)) {
    //                    let ctrl = this.flatControls.find(e => e.Name === ColumnBkUp.Name);
    //                    if (!(ctrl && ctrl.DoNotPersist)) {
    //                        changeDetected = true;
    //                        return false;
    //                    }
    //                }
    //            }
    //        }
    //    }.bind(this));
    //    return changeDetected;
    //}.bind(this);

    this.isCloseConfirmRequired = function () {
        if (this.Mode.isNew || this.Mode.isEdit) {
            return this.manualChangeInData;
        }
        return false;
    }.bind(this);

    this.excelUpload = function () {
        this.showLoader();
        var fileUpload = $("#excelfile").get(0);
        //var fileUpload = document.getElementById("excelfile");
        var files = fileUpload.files;
        var data1 = new FormData();
        for (var i = 0; i < files.length; i++) {
            data1.append(files[i].name, files[i]);
        }
        fileName = this.FormObj.Name + ".xlsx";
        //fileName = files[0].name;
        if (fileName === '') {
            $("#alert").show();
            $("#alert").text("Please upload excel file");
            $("#alert").append(`<a href = "#" class = "close" data-dismiss = "alert">&times;</a>`);
        }

        data1.append("RefId", this.formRefId);

        if (fileName !== '') {
            var Extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
            if (Extension === "xls" || Extension === "xlsx") {
                $.ajax({
                    type: "POST",
                    url: "/Excel/UploadExcelAsync",
                    processData: false,
                    contentType: false,
                    data: data1,
                    success: function (message) {
                        EbMessage("show", { Message: 'Successfully Imported', AutoHide: true, Background: '#00aa00', Delay: 4000 });
                        this.hideLoader();
                    }.bind(this),
                    error: function () {
                        EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000', Delay: 4000 });
                        this.hideLoader();
                    }.bind(this)
                });
            }
        }
    };

    this.excelExportImport = function (e) {
        let val = $("#webformexcel-selbtn .selectpicker").find("option:selected").attr("data-token");
        if (val === "template-export") {
            this.showLoader();
            $.ajax({
                type: "POST",
                url: "/Excel/download",
                data: {
                    refid: this.formRefId
                },
                xhrFields: { responseType: 'blob' },
                success: function (data, textStatus, jqXHR) {
                    var link = document.createElement('a');
                    link.href = window.URL.createObjectURL(data);
                    link.download = this.FormObj.Name + ".xlsx";
                    document.body.append(link);
                    link.click();
                    this.hideLoader();
                }.bind(this),
                error: function (e) {
                    console.log(e);
                    this.hideLoader();
                    $("#alert").text("Error");
                }.bind(this)

            });
        }
        if (val === "import") {
            $("#excelfile").trigger('click');
        }
    };

    this.selectUIinpOnFocus = function () {
        if (!event)
            return;
        let el = event.target;
        if (!el.hasAttribute('ui-inp'))
            return;
        if (event && event.target &&
            !(el.getAttribute("type") === "search" &&
                ($(el).closest("[ctype='PowerSelect']").length === 1 || $(el).closest("[tdcoltype='DGPowerSelectColumn']").length === 1)))
            $(event.target).select();
    };

    this.setMode = function () {
        this.Mode.isView = false;
        this.Mode.isEdit = false;
        this.Mode.isNew = false;

        if (this.mode === "View Mode") {
            if (this.renderMode === 5 && this.FormObj.FormModeAfterSave === 2)//public form and after save mode is edit
                this.Mode.isEdit = true;
            else
                this.Mode.isView = true;
        }
        else if (this.mode === "New Mode" || this.mode === "Export Mode" || this.mode === "Clone Mode" || this.mode === "Draft Mode" || this.mode === "Prefill Mode" || this.mode === "Preview Mode")
            this.Mode.isNew = true;
        else if (this.mode === "Edit Mode")
            this.Mode.isEdit = true;
    };

    this.InitPsAddButton = function (options) {
        let $btn = $('#' + options.EbSid_CtxId);

        if ($btn.length == 0)
            return;
        if (options.IsDGCtrl) {
            $btn.removeAttr("disabled");
            $btn.on('click', this.PsAddBtnClicked.bind(this, $btn, options));
        }
    }.bind(this);

    this.PsAddBtnClicked = function ($btn, options) {
        let dgEbsid = $btn.closest('[ctype=DataGrid]').attr('ebsid');
        let DGB = this.DGBuilderObjs[dgEbsid];
        let $td = $btn.closest("td");
        let rowid = $td.closest("tr").attr("rowid");
        let ctrlname = $td.attr('colname');
        let ctrl = DGB.objectMODEL[rowid] ? DGB.objectMODEL[rowid].find(e => e.Name == ctrlname) : null;

        if (!ctrl) {
            console.error('PsAddBtnClicked - ctrl not found');
            return;
        }
        if (!ctrl.FormRefId) {
            console.error('PsAddBtnClicked - invalid form refid');
            return;
        }
        let _params = this.getPsAddBtnParameters(ctrl.DataFlowMap, rowid, DGB);
        let _mode = 1;//view

        if (_params.findIndex(e => e.Name === 'id') === -1) //prefill
            _mode = 2;

        options['reverseUpdateData'] = this.reverseUpdateData.bind(this, ctrl.DataFlowMap, rowid, DGB);

        if (ctrl.OpenInNewTab) {
            let _lang = ebcontext.languages.getCurrentLanguageCode();
            let url = `../WebForm/Index?_r=${ctrl.FormRefId}&_p=${btoa(JSON.stringify(_params))}&_m=${_mode}&_l=${this.getLocId()}&_lg=${_lang}`;
            window.open(url, '_blank');
        }
        else {
            ebcontext.webform.PopupForm(ctrl.FormRefId, btoa(JSON.stringify(_params)), _mode,
                {
                    srcCxt: this.__MultiRenderCxt,
                    initiator: options,
                    locId: this.getLocId()
                });
        }
    };

    this.getPsAddBtnParameters = function (DataFlowMap, rowid, DGB) {
        let destid = 0;
        let params = [];
        let pushMasterId = true;
        let pushLinesId = true;

        if (DataFlowMap && DataFlowMap.$values.length > 0) {
            let pMap = DataFlowMap.$values;
            for (let i = 0; i < pMap.length; i++) {
                if (!pMap[i].$type.includes('DataFlowForwardMap'))
                    continue;

                if (pMap[i].SrcCtrlName === 'id') {//source table id
                    params.push({ Name: pMap[i].DestCtrlName, Type: 7, Value: this.rowId });
                    pushMasterId = false;
                    continue;
                }
                else if (pMap[i].SrcCtrlName === DGB.ctrl.TableName + '_id') {//current row id
                    params.push({
                        Name: pMap[i].DestCtrlName,
                        Type: 7,
                        Value: rowid > 0 ? rowid : 0
                    });
                    pushLinesId = false;
                    continue;
                }

                let dgCtrl = DGB.objectMODEL[rowid].find(e => e.__Col.Name === pMap[i].SrcCtrlName);
                if (pMap[i].DestCtrlName === 'id') {
                    if (dgCtrl) {
                        if (dgCtrl.getValue() > 0) {
                            destid = dgCtrl.getValue();
                            params = [{ Name: 'id', Type: 7, Value: destid }];
                            pushMasterId = false;
                            break;
                        }
                        continue;
                    }
                    let outCtrl = DGB.ctrl.formObject[pMap[i].SrcCtrlName];
                    if (outCtrl) {
                        if (outCtrl.getValue() > 0) {
                            destid = outCtrl.getValue();
                            params = [{ Name: 'id', Type: 7, Value: destid }];
                            pushMasterId = false;
                            break;
                        }
                    }
                }
                else {
                    if (dgCtrl) {
                        params.push({
                            Name: pMap[i].DestCtrlName,
                            Type: dgCtrl.EbDbType,
                            Value: dgCtrl.getValue()
                        });
                    }
                    else {
                        let outCtrl = DGB.ctrl.formObject[pMap[i].SrcCtrlName];
                        if (outCtrl) {
                            params.push({
                                Name: pMap[i].DestCtrlName,
                                Type: outCtrl.EbDbType,
                                Value: outCtrl.getValue()
                            });
                        }
                    }
                }
            }
        }
        if (pushMasterId) {
            params.push({ Name: this.MasterTable, Type: 7, Value: this.rowId });
            if (pushLinesId)
                params.push({ Name: DGB.ctrl.TableName + '_id', Type: 7, Value: rowid > 0 ? rowid : 0 });
        }

        return params;
    };

    this.reverseUpdateData = function (DataFlowMap, rowid, DGB, destRender) {
        if (DataFlowMap && DataFlowMap.$values.length > 0) {
            DGB.setCurRow(rowid);
            let pMap = DataFlowMap.$values;
            for (let i = 0; i < pMap.length; i++) {
                if (!pMap[i].$type.includes('DataFlowReverseMap'))
                    continue;
                let dgCtrl = DGB.objectMODEL[rowid].find(e => e.__Col.Name === pMap[i].DestCtrlName);
                if (!dgCtrl)
                    continue;

                if (pMap[i].SrcCtrlName === 'id') {
                    dgCtrl.setValue(destRender.rowId);
                }
                else {
                    let outCtrl = destRender.formObject[pMap[i].SrcCtrlName];
                    if (outCtrl)
                        dgCtrl.setValue(outCtrl.getValue());
                }
            }
        }
    };

    this.init = function (option) {
        //let t0 = performance.now();

        this.rendererName = 'WebForm';
        this.__MultiRenderCxt = option.__MultiRenderCxt;
        this.fsCxtId = Date.now().toString(36);
        this.keepHidden = option.keepHidden;

        this.$formCont = option.$formCont;
        this.formHTML = option.formHTML;
        this.$formCont.empty();
        this.$formCont.append(`<div class="form-cont-first">${this.formHTML}</div><div class="form-cont-second"></div>`);

        this.sseChannel = option.formRefId + "_" + option.rowId;
        if (!ebcontext.sse_channels.includes(this.sseChannel))
            ebcontext.sse_channels.push(this.sseChannel);

        ebcontext.renderContext = "WebForm";//reference - Eb_select.js, InitformControls
        this.FormObj = JSON.parse(JSON.stringify(option.formObj));
        this.$form = $(`#${this.FormObj.EbSid_CtxId}`);

        this.Env = option.env;
        this.initControls = new InitControls(this);
        this.formRefId = option.formRefId || "";
        this.rowId = option.rowId;
        this.draftId = option.draftId;
        this.draftInfo = option.draftInfo;
        this.mode = option.mode;
        this.renderMode = option.renderMode;
        this.userObject = option.userObject;
        this.isPartial = option.isPartial;//value is true if form is rendering in iframe
        this.headerObj = option.headerObj;//EbHeader
        this.hBtns = option.headerBtns;
        this.formPermissions = option.formPermissions;
        this.uploadedFileRefList = {};

        this.formData = option.formData;
        this.formDataBackUp = JSON.parse(JSON.stringify(this.formData));
        if (this.mode === "New Mode" || this.mode === "Prefill Mode")
            this.emptyFormDataModel_copy = JSON.parse(JSON.stringify(this.formData));// takes a copy (if switched to new mode)
        this.DataMODEL = this.formData.MultipleTables;
        this.FormDataExtdObj = { val: this.formData.ExtendedTables }; // next iteration

        this.DisableDeleteData = this.formData.DisableDelete;
        this.DisableCancelData = this.formData.DisableCancel;
        this.Mode = {};
        if (this.mode == "Edit Mode" && !this.checkPermission("Edit"))
            this.mode == "View Mode";
        this.setMode();
        //this.Mode = { isEdit: this.mode === "Edit Mode", isView: this.mode === "View Mode", isNew: this.mode === "New Mode" };// to pass by reference
        this.flatControls = getFlatCtrlObjs(this.FormObj);// here without functions
        this.FlatContControls = getInnerFlatContControls(this.FormObj);
        this.MasterTable = this.FormObj.TableName;
        this.IsPSsInitComplete = {};
        this.DGBuilderObjs = {};
        this.RQCRenderer = {};
        this.DGNewBuilderObjs = {};
        this.uniqCtrlsInitialVals = {};
        this.FRC = new FormRenderCommon({ FO: this });
        this.TableNames = this.getNormalTblNames();
        this.ReviewCtrl = getFlatContObjsOfType(this.FormObj, "Review")[0];//Review control in formObject
        this.TabControls = getFlatContObjsOfType(this.FormObj, "TabControl");// all TabControl in the formObject

        $(`#${this.FormObj.EbSid_CtxId} [data-toggle="tooltip"]`).tooltip();// init bootstrap tooltip
        if (parseInt(option.disableEditBtn.disableEditButton)) {
            ($(`#${this.hBtns['Edit']}`).attr("disabled", true))
        }
        this.bindEventFns();
        this.setHeader(this.mode);// contains a hack for preview mode(set as newmode)
        a___MT = this.DataMODEL; // debugg helper
        attachModalCellRef_form(this.FormObj, this.DataMODEL);
        this.EbAlert = new EbAlert({
            id: this.FormObj.EbSid_CtxId + "_formAlertBox",
            class: 'webform-alert-box',
            top: 60,
            right: 24,
            onClose: this.FRC.invalidBoxOnClose
        });
        this.manualChangeInData = false;
        this.isInitiallyPopulating = true;
        this.defaultAfterSavemodeS = getKeyByVal(EbEnums_w.WebFormAfterSaveModes, this.FormObj.FormModeAfterSave.toString()).split("_")[0].toLowerCase();
        this.afterSavemodeS = null;
        this.initWebFormCtrls();
        this.initPrintMenu();
        this.initSaveMenu();
        this.populateControlsWithDataModel(this.DataMODEL);// 1st
        this.isInitiallyPopulating = false;

        if (this.Mode.isNew)
            this.FRC.execAllDefaultValExpr();//exec default Value Expression 2nd
        else
            this.FRC.execAllValExprForDoNotPersistCtrls();//================== exec Value Expression   2nd

        if (this.ReviewCtrl && (this.Mode.isNew || this.ReviewCtrl.Hidden))
            this.ReviewCtrlBuilder.hide();

        if (this.Mode.isView) {
            this.SwitchToViewMode();
            this.locInit4viewMode();
        }
        else if (this.Mode.isEdit) {
            //this.SwitchToEditMode();
            this.locInit4viewMode();
        }

        if (option.editModePrefillParams)
            this.editModePrefill(option);

        //this.LocationInit();

        //console.dev_log("WebFormRender : init() took " + (performance.now() - t0) + " milliseconds.");



        //this.EbAlert = new EbAlert({
        //    id: this.FormObj.EbSid_CtxId + "_formAlertBox",
        //    class: 'webform-alert-box',
        //    top: 60,
        //    right: 24,
        //    onClose: this.FRC.invalidBoxOnClose
        //});

        //window.onbeforeunload = function (m, e) {
        //    if (this.Mode.isEdit) {
        //        $.ajax({
        //            type: "POST",
        //            url: "/WebForm/FormEdit_TabClosed",
        //            data: {
        //                formId: option.formRefId,
        //                dataId: option.rowId,
        //                sseChannel: this.sseChannel,
        //                sse_subscrId: ebcontext.subscription_id
        //            },
        //            headers: { 'eb_sse_subid': ebcontext.subscription_id }
        //        });
        //    }
        //}.bind(this);
    };

    this.init(option);
    a___builder = this;
};