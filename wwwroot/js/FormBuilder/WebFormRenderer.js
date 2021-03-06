﻿/*!
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
        this.TabControls = getFlatObjOfType(this.FormObj, "WizardControl");

        $.each(this.TabControls, function (i, tabControl) {//TabControl Init
            let $Tab = $(`#cont_${tabControl.EbSid_CtxId}>.RenderAsWizard`);
            if ($Tab.length === 0)
                return false;
            $Tab.smartWizard({
                theme: 'arrows',
                enableURLhash: false, // Enable selection of the step based on url hash
                transition: {
                    animation: 'fade', // Effect on navigation, none/fade/slide-horizontal/slide-vertical/slide-swing
                    speed: '400', // Transion animation speed
                    easing: '' // Transition animation easing. Not supported without a jQuery easing plugin
                },
                toolbarSettings: {
                    toolbarPosition: 'both', // none, top, bottom, both
                    toolbarButtonPosition: 'center', // left, right, center
                    showNextButton: true, // show/hide a Next button
                    showPreviousButton: true, // show/hide a Previous button
                },
                keyboardSettings: {
                    keyNavigation: false, // Enable/Disable keyboard navigation(left and right keys are used if enabled)
                }
            });

            $Tab.off("leaveStep").on("leaveStep", function (e, anchorObject, currentStepIndex, nextStepIndex, stepDirection) {
                if (stepDirection === 'forward') {
                    e.stopPropagation();
                    let pane = tabControl.Controls.$values[currentStepIndex];
                    let innerCtrlsWithDGs = getFlatCtrlObjs(pane).concat(getFlatContObjsOfType(pane, "DataGrid"));
                    if (this.FRC.AllRequired_valid_Check(innerCtrlsWithDGs)) {
                        if (this.FormObj.CanSaveAsDraft && this.Mode.isNew && !pane.savedAsDraft) {
                            pane.savedAsDraft = true;
                            this.saveAsDraft();
                        }
                        return true;
                    }
                    else
                        return false;
                }
                return true;
            }.bind(this));

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

        if (!DG.DisableRowDelete) {
            cxtMnuItems["deleteRow"] = {
                name: "Delete row",
                icon: "fa-trash",
                callback: this.del
            };
        }

        if (DG.IsAddable) {
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

    this.initNCs = function () {
        for (let i = 0; i < this.flatControls.length; i++) {
            let Obj = this.flatControls[i]
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
            else if ((Obj.ObjType === "ExportButton") || (Obj.ObjType === "Phone")) {
                opt.formObj = this.FormObj;
                opt.dataRowId = this.DataMODEL[this.FormObj.TableName][0].RowId;
            }
            else if (Obj.ObjType === "ProvisionUser" || Obj.ObjType === "ProvisionLocation")
                opt.flatControls = this.flatControls;
            else if (Obj.ObjType === "SubmitButton") {
                opt.renderMode = this.renderMode;
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
        let opts = {
            allTabCtrls: this.TabControls,
            formModel: null, //_formDataWraper,//test
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
        this.setFormObject();// set helper functions to this.formObject and other...
        this.updateCtrlsUI();
        this.initNCs();// order 1
        this.FRC.bindEbOnChange2Ctrls(this.flatControls);// order 2 - bind data model update to onChange(internal)
        this.FRC.bindFnsToCtrls(this.flatControls);// order 3
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
            this.FRC.bindValueUpdateFns_OnChange(_DG);
        }.bind(this));
    };

    DynamicTabPaneGlobals = null;//{ DG: 'this.ctrl', $tr: '$tr', action: 'action', event: 'event'};// multiple form related changes will come
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
    }.bind(this); // multiple form related changes will come

    this.updateCtrlsUI = function () {
        let allFlatControls = [this.FormObj, ...getInnerFlatContControls(this.FormObj).concat(this.flatControls)];
        $.each(allFlatControls, function (k, Obj) {
            this.updateCtrlUI(Obj);
        }.bind(this));
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
                EbMessage("show", { Message: `Something Unexpected Occurred when tried to import data`, AutoHide: true, Background: '#aa0000' });
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
                EbMessage("show", { Message: `Something Unexpected Occurred when tried to import data`, AutoHide: true, Background: '#aa0000' });
            }.bind(this),
            success: this.psImportreloadForm.bind(this)
        });

    };

    this.psImportreloadForm = function (_respObjStr) {
        this.hideLoader();
        let _respObj = JSON.parse(_respObjStr);
        if (_respObj.Status === 200) {
            this.__fromImport = true;
            let mode_s = "Export Mode";
            if (this.draftId > 0)
                mode_s = "Draft Mode"
            this.FORCE_RELOAD(0, _respObj.FormData, mode_s);
        }
        else
            console.error(_respObj.MessageInt);
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
            if (val === null)
                continue;

            let ctrl = getObjByval(this.flatControls, "Name", SingleColumn.Name);
            if (ctrl.DrDependents && ctrl.DrDependents.$values.length > 0)
                ctrl.__isInitiallyPopulating = true;// need detail comment

            ctrl.___DoNotUpdateDataVals = true;

            if (ctrl.ObjType === "PowerSelect" && !ctrl.RenderAsSimpleSelect) {
                ctrl.setDisplayMember(val);
            }
            else if (ctrl.ObjType === "TextBox") {
                ctrl.justSetValue(val);
                if (ctrl.getValueFromDOM() !== val) {
                    ctrl.__EbAlert.alert({
                        id: ctrl.EbSid_CtxId + "-al",
                        head: "Value Trimmed by mistake(Old Value : " + val + ", New Value:" + ctrl.getValueFromDOM() + " ) - contact Support",
                        body: " : <div tabindex='1' class='eb-alert-item' cltrof='" + ctrl.EbSid_CtxId + "' onclick='ebcontext.webform.FormCollection[0].FRC.goToCtrlwithEbSid()'>"
                            + ctrl.Label + (ctrl.Hidden ? ' <b>(Hidden)</b>' : '') + '<i class="fa fa-external-link-square" aria-hidden="true"></i></div>',
                        type: "danger"
                    });
                    $("#webformedit").attr("disabled", true);
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
        return formatData4webform(_multipleTables);
    };

    this.saveSuccess = function (_respObj) {
        this.hideLoader();
        let respObj = JSON.parse(_respObj);
        ebcontext._formSaveResponse = respObj;

        if (respObj.Status === 200) {
            if (this.renderMode === 3) {
                EbMessage("show", { Message: "Sign up success. Please check mail to login ", AutoHide: true, Background: '#00aa00' });
                setTimeout(function () {
                    ebcontext.setup.ss.onLogOutMsg();
                }, 3000);
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
                EbMessage("show", { Message: "My profile updated successfully", AutoHide: true, Background: '#00aa00' });
            }
            else {
                let locName = ebcontext.locations.CurrentLocObj.LongName;
                let formName = this.FormObj.DisplayName;
                if (this.rowId > 0)
                    EbMessage("show", { Message: "Edited " + formName + " from " + locName, AutoHide: true, Background: '#00aa00' });
                else
                    EbMessage("show", { Message: "New " + formName + " entry in " + locName + " created", AutoHide: true, Background: '#00aa00' });
            }

            respObj.FormData = JSON.parse(respObj.FormData);//======
            //this.DynamicTabObject.disposeDynamicTab();// febin

            this.renderInAfterSaveMode(respObj);

            this.curAfterSavemodeS = this.defaultAfterSavemodeS;
        }
        else {
            EbMessage("show", { Message: respObj.Message, AutoHide: true, Background: '#aa0000' });
            console.error(respObj.MessageInt);
        }
    }.bind(this);

    this.saveDraftSuccess = function (_respObj) {
        this.hideLoader();
        let respObj = JSON.parse(_respObj);
        ebcontext._formSaveResponse = respObj;

        if (respObj.Status === 200) {
            EbMessage("show", { Message: "Form saved as draft", AutoHide: true, Background: '#00aa00' });
        }
        else if (respObj.Status === 403) {
            EbMessage("show", { Message: "Access denied to update this data entry!", AutoHide: true, Background: '#aa0000' });
        }
        else {
            EbMessage("show", { Message: respObj.Message, AutoHide: true, Background: '#aa0000' });
            console.error(respObj.MessageInt);
        }
        this.draftId = respObj.DraftId;
        option.draftId = this.draftId;
        this.headerObj.setFormMode(`<span mode="Draft Mode" class="fmode">Draft</span>`);
        this.AdjustDraftBtnsVisibility();
    }.bind(this);

    this.renderInAfterSaveMode = function (respObj) {
        let mode_s = this.curAfterSavemodeS.charAt(0).toUpperCase() + this.curAfterSavemodeS.slice(1) + " Mode"
        if (mode_s === "Edit Mode" || mode_s === "View Mode") {
            this.FORCE_RELOAD(respObj.RowId, respObj.FormData, mode_s);
        }
        else if (mode_s === "New Mode") {
            this.startNewMode();
            return;
        }
        else if (mode_s === "Close Mode") {
            this.Mode.isEdit = false;
            if (this.renderMode === 2) {
                ebcontext.webform.hideSubForm();
            }
            else {
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
    };

    this.FORCE_RELOAD = function (rowId, formData, mode_s) {
        if (this.renderMode === 1) {
            let stateObj = { id: rowId };
            if (rowId > 0) {
                let _url = `Index?_r=${this.formRefId}&_p=${btoa(JSON.stringify([{ Name: "id", Type: "7", Value: rowId }]))}&_m=${this.isPartial === 'True' ? 11 : 1}&_l=${ebcontext.locations.CurrentLocObj.LocId}`;
                //if (this.rowId > 0)
                window.history.replaceState(stateObj, this.FormObj.DisplayName, _url);
                //else
                //    window.history.pushState(stateObj, this.FormObj.DisplayName, _url);
            }
            else {
                let _url = `Index?_r=${this.formRefId}&_m=${this.isPartial === 'True' ? 12 : 2}&_l=${ebcontext.locations.CurrentLocObj.LocId}`;
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

        this.resetBuilderVariables(forceRelaodOptions);
        this.init(option);

        //console.dev_log("WebFormRender : FORCE_RELOAD took " + (performance.now() - t0) + " milliseconds.");

    };

    this.resetBuilderVariables = function (newOptions) {
        let keys = Object.keys(this);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            if (typeof this[key] !== typeof function () { }) {
                if (!(key == "emptyFormDataModel_copy" || key == "__fromImport" || key == "__IsDGctxMenuSet"))// persist
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
                    EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
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
        let url = `../WebForm/Index?_r=${this.formRefId}&_p=${btoa(JSON.stringify(params))}&_m=7&_l=${ebcontext.locations.CurrentLocObj.LocId}`;
        window.open(url, '_blank');
    };

    this.openSourceForm = function () {
        if (this.formData.SrcDataId > 0) {
            let params = [];
            params.push(new fltr_obj(11, "id", this.formData.SrcDataId));
            let url = `&_p=${btoa(JSON.stringify(params))}&_m=1&_l=${ebcontext.locations.CurrentLocObj.LocId}`;
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
        this.BeforeSave();

        setTimeout(function () {// temp
            if (!this.FRC.AllRequired_valid_Check())
                return;
            if (!this.isAllUniqOK())
                return;
            if (!this.DGsB4Save())
                return;
            if (!this.DGsNewB4Save())
                return;
            if (!this.MeetingB4Save())
                return;
            //this.FRC.checkUnique4All_save(this.flatControls, true);

            EbProvUserUniqueChkJs({
                FormObj: this.FormObj,
                CallBackFn: this.userProvCallBack.bind(this),
                showLoaderFn: this.showLoader,
                hideLoaderFn: this.hideLoader
            });
        }.bind(this), 4);
    };

    //Provision user related unique check callback function
    this.userProvCallBack = function (ok) {
        if (ok) {
            this.FRC.checkUnique4All_save(this.flatControls, true);
        }
    };

    this.saveAsDraft = function () {
        this.showLoader();
        let currentLoc = ebcontext.locations.getCurrent();
        $.ajax({
            type: "POST",
            url: "/WebForm/SaveFormDraft",
            data: {
                RefId: this.formRefId,
                DraftId: this.draftId,
                Json: JSON.stringify(this.formData),
                CurrentLoc: currentLoc
            },
            error: function (xhr, ajaxOptions, thrownError) {
                this.hideLoader();
                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
            }.bind(this),
            success: this.saveDraftSuccess.bind(this)
        });
    }.bind(this);

    this.saveForm_call = function () {
        this.showLoader();
        let currentLoc = ebcontext.locations.getCurrent();
        $.ajax({
            type: "POST",
            url: "/WebForm/InsertWebformData",
            data: {
                ValObj: this.getFormValuesObjWithTypeColl(),
                RefId: this.formRefId,
                RowId: this.rowId,
                DraftId: this.draftId,
                CurrentLoc: currentLoc,
                sseChannel: this.sseChannel,
                sse_subscrId: ebcontext.subscription_id
            },
            error: function (xhr, ajaxOptions, thrownError) {
                this.hideLoader();
                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
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
        this.DynamicTabObject.switchToViewMode();// febin
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
    }.bind(this);

    this.enableControlsInEditMode = function () {
        $.each(this.flatControls, function (i, ctrl) {
            if ((ctrl.IsDisable && ctrl.__IsDisableByExp === undefined) || ctrl.__IsDisableByExp === true)
                return;
            ctrl.enable();
        }.bind(this));
    };

    this.disbleControlsInViewMode = function () {
        $.each(this.flatControls, function (k, ctrl) {
            if (ctrl.ObjType === "ExportButton")
                return true;
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
        this.formObject.__mode = "edit";
        this.Mode.isEdit = true;
        this.Mode.isView = false;
        this.Mode.isNew = false;

        if (!this.S2EmodeReviewCtrl()) // switch to Edit mode  - ReviewCtrl
            return;

        this.S2EmodeDGCtrls();// switch to Edit mode  - all DG controls
        //    this.ApprovalCtrl.enableAccessibleRow(this.DataMODEL[this.ApprovalCtrl.TableName]);
        this.mode = "Edit Mode";
        this.BeforeModeSwitch(this.mode);
        this.setHeader(this.mode);
        this.flatControls = getFlatCtrlObjs(this.FormObj);// here re-assign objectcoll with functions
        this.enableControlsInEditMode();
        this.setUniqCtrlsInitialVals();
        this.DynamicTabObject.switchToEditMode();// febin
    };

    this.BeforeModeSwitch = function (newMode) {
        if (this.renderMode === 2) return;

        if (newMode === "View Mode") {
            this.flatControls = getFlatCtrlObjs(this.FormObj);

            // if eb_default control is true disable some operations on form entry
            $.each(this.flatControls, function (k, ctrl) {
                if (ctrl.ObjType === "RadioButton" && ctrl.Name === "eb_default") {
                    let c = getObjByval(this.DataMODEL[this.FormObj.TableName][0].Columns, "Name", "eb_default");
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

            // EbSQLValidator conditions for form entry delete permission
            $.each(this.FormObj.DisableDelete.$values, function (k, EbSQLValidator) {
                if (!EbSQLValidator.IsDisabled && !EbSQLValidator.IsWarningOnly) {
                    if (this.DisableDeleteData[EbSQLValidator.Name]) {
                        this.$deleteBtn.prop("disabled", true);
                        return;
                    }
                }
            }.bind(this));

            // EbSQLValidator conditions for form entry Disable permission
            $.each(this.FormObj.DisableCancel.$values, function (k, EbSQLValidator) {
                if (!EbSQLValidator.IsDisabled && !EbSQLValidator.IsWarningOnly) {
                    if (this.DisableCancelData[EbSQLValidator.Name]) {
                        this.$cancelBtn.prop("disabled", true);
                        return;
                    }
                }
            }.bind(this));

            $.each(this.formData.DisableEdit, function (k, status) {
                if (status) {
                    this.$editBtn.prop("disabled", true);
                    return;
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
        let currentLoc = ebcontext.locations.getCurrent();
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
                            data: { RefId: this.formRefId, RowId: this.rowId, CurrentLoc: currentLoc },
                            error: function (xhr, ajaxOptions, thrownError) {
                                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
                                this.hideLoader();
                            }.bind(this),
                            success: function (result) {
                                this.hideLoader();
                                if (result > 0) {
                                    EbMessage("show", { Message: "Deleted " + this.FormObj.DisplayName + " entry from " + ebcontext.locations.CurrentLocObj.LongName, AutoHide: true, Background: '#00aa00' });
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

    this.deleteDraft = function () {
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
                            url: "/WebForm/DiscardFormDraft",
                            data: { RefId: this.formRefId, DraftId: this.draftId },
                            error: function (xhr, ajaxOptions, thrownError) {
                                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
                                this.hideLoader();
                            }.bind(this),
                            success: function (result) {
                                this.hideLoader();
                                if (result > 0) {
                                    EbMessage("show", { Message: "Deleted " + this.FormObj.DisplayName + " entry from " + ebcontext.locations.CurrentLocObj.LongName, AutoHide: true, Background: '#00aa00' });
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
        let currentLoc = ebcontext.locations.getCurrent();
        EbDialog("show",
            {
                Message: `Are you sure to ${this.formData.IsCancelled ? 'Revoke Cancellation of' : 'Cancel'} this data entry?`,
                Buttons: {
                    "Yes": { Background: "green", Align: "left", FontColor: "white;" },
                    "No": { Background: "violet", Align: "right", FontColor: "white;" }
                },
                CallBack: function (name) {
                    if (name === "Yes") {
                        this.showLoader();
                        $.ajax({
                            type: "POST",
                            url: "/WebForm/CancelWebformData",
                            data: {
                                RefId: this.formRefId,
                                RowId: this.rowId,
                                CurrentLoc: currentLoc,
                                Cancel: !this.formData.IsCancelled
                            },
                            error: function (xhr, ajaxOptions, thrownError) {
                                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
                                this.hideLoader();
                            }.bind(this),
                            success: function (result) {
                                this.hideLoader();
                                if (result > 0) {
                                    EbMessage("show", { Message: `${this.formData.IsCancelled ? 'Cancellation Revoked' : 'Canceled'} ${this.FormObj.DisplayName} entry from ${ebcontext.locations.CurrentLocObj.LongName}`, AutoHide: true, Background: '#00aa00' });
                                    this.formData.IsCancelled = !this.formData.IsCancelled;
                                    this.setHeader(this.mode);
                                }
                                else if (result === -1) {
                                    EbMessage("show", { Message: `${this.formData.IsCancelled ? 'Revoke Cancel' : 'Cancel'} operation failed due to validation failure.`, AutoHide: true, Background: '#aa0000' });
                                }
                                else if (result === -2) {
                                    EbMessage("show", { Message: `Access denied to ${this.formData.IsCancelled ? 'Revoke Cancellation of' : 'Cancel'} this entry.`, AutoHide: true, Background: '#aa0000' });
                                }
                                else {
                                    EbMessage("show", { Message: `Something went wrong`, AutoHide: true, Background: '#aa0000' });
                                }
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
    };

    this.lockUnlockForm = function () {
        let currentLoc = ebcontext.locations.getCurrent();
        EbDialog("show",
            {
                Message: `Are you sure to ${this.formData.IsLocked ? 'Unlock' : 'Lock'} this data entry?`,
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
                                CurrentLoc: currentLoc,
                                Lock: !this.formData.IsLocked
                            },
                            error: function (xhr, ajaxOptions, thrownError) {
                                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
                                this.hideLoader();
                            }.bind(this),
                            success: function (result) {
                                this.hideLoader();
                                if (result > 0) {
                                    this.formData.IsLocked = !this.formData.IsLocked;
                                    EbMessage("show", { Message: `${this.formData.IsLocked ? 'Locked' : 'Unlocked'} ${this.FormObj.DisplayName} entry from ${ebcontext.locations.CurrentLocObj.LongName}`, AutoHide: true, Background: '#00aa00' });
                                    this.setHeader(this.mode);
                                }
                                else if (result === -1) {
                                    EbMessage("show", { Message: `${this.formData.IsLocked ? 'Unlock' : 'Lock'} operation failed due to validation failure.`, AutoHide: true, Background: '#aa0000' });
                                }
                                else if (result === -2) {
                                    EbMessage("show", { Message: `Access denied to ${this.formData.IsLocked ? 'Unlock' : 'Lock'} this entry.`, AutoHide: true, Background: '#aa0000' });
                                }
                                else {
                                    EbMessage("show", { Message: `Something went wrong`, AutoHide: true, Background: '#aa0000' });
                                }
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
    };

    this.GetAuditTrail = function () {
        let currentLoc = ebcontext.locations.getCurrent();
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
                let auditObj;
                try {
                    auditObj = JSON.parse(result);
                }
                catch (e) {
                    $("#divAuditTrail").children().remove();
                    $("#divAuditTrail").append(`<div style="text-align: center;  position: relative; top: 45%; font-size: 20px; color: #aaa; "> ${result} </div>`);
                    return;
                }
                this.drawAuditTrailTest(auditObj);
            }.bind(this)
        });
    };

    this.drawAuditTrailTest = function (auditObj) {

        let $transAll = $(`<div></div>`);

        $.each(auditObj, function (idx, Obj) {
            let $trans = $(`<div class="single-trans"></div>`);
            let temptitle = Obj.ActionType + " by " + Obj.CreatedBy + " at " + Obj.CreatedAt;
            let chevronIcon = Obj.ActionType === 'Updated' ? `<div style="display:inline-block; width: 20px;"><i class="fa fa-chevron-down"></i></div>` : '';
            $trans.append(` <div class="trans-head row">
                                <div class="col-md-10" style="padding: 5px 8px;">
                                    ${chevronIcon}
                                    <div style="display:inline-block;">${temptitle}</div>
                                </div>
                                <div class="col-md-2">
                                    <div style="float: right;">
                                        <img src="/images/dp/${Obj.CreatedById}.png" onerror="this.src = '/images/imagenotfound.svg';" style="height: 30px; width: 30px; border-radius: 50%;">
                                    </div>
                                </div>
                            </div>`);

            if (Obj.ActionType === 'Updated') {
                $trans.find('.trans-head').css('cursor', 'pointer');
                $trans.find('.trans-head').hover(function () {
                    $(this).css("background-color", "#ddd");
                }, function () {
                    $(this).css("background-color", "#ccc");
                });
            }
            $trans.append(`<div class="trans-body collapse in"></div>`);
            let tempHtml = ``;
            let tempHtml2 = ``;

            $.each(Obj.Tables, function (i, Tbl) {
                let indx = 0;
                $.each(Tbl.Columns, function (j, Col) {
                    let temp = `
                        <tr>
                            <td class="col-md-4 col-sm-4" rowspan='2' style='vertical-align: middle;'>${Col.Title}</td>
                            <td class="col-md-4 col-sm-4">${Col.NewValue}</td>                            
                        </tr>
                        <tr>
                            <td class="col-md-4 col-sm-4" style="${Col.IsModified ? 'text-decoration: line-through;' : ''}">${Col.OldValue}</td>
                        </tr>`;
                    if (indx++ % 2 === 0)
                        tempHtml += temp;
                    else
                        tempHtml2 += temp;
                });
            });
            if (tempHtml.length !== 0) {
                let temp = `<div class="form-table-div"><table class="table table-bordered first-table" style="width:100%; margin: 0px;">
                     <tbody>`
                    + '@replacethis@' +
                    `</tbody>
                            </table></div>`;
                tempHtml = temp.replace('@replacethis@', tempHtml);
                if (tempHtml2.length !== 0)
                    tempHtml += temp.replace('@replacethis@', tempHtml2);
                else
                    tempHtml += `<div class="form-table-div"></div>`;
                $trans.children(".trans-body").append(tempHtml);
            }

            tempHtml = ``;

            $.each(Obj.GridTables, function (i, Tbl) {
                let isTrAvail = false;
                let tableHtml = `<div class="line-table-div"><div>${Tbl.Title}</div><table class="table table-bordered second-table" style="width:100%; margin: 0px;">
                                <thead>
                                    <tr class="table-title-tr">
                                        <th></th>`;
                $.each(Tbl.ColumnMeta, function (j, cmeta) {
                    tableHtml += `<th style='font-weight: 400;'>${cmeta}</th>`;
                });
                tableHtml += `     </tr>
                                </thead><tbody>`;
                $.each(Tbl.NewRows, function (m, Cols) {
                    let newRow = `<tr><td>Added</td>`;
                    $.each(Cols.Columns, function (n, Col) {
                        newRow += `<td>${Col.NewValue}</td>`;
                    });
                    newRow += `</tr>`;
                    tableHtml += newRow;
                    isTrAvail = true;
                });

                $.each(Tbl.DeletedRows, function (m, Cols) {
                    let oldRow = `<tr><td>Deleted</td>`;
                    $.each(Cols.Columns, function (n, Col) {
                        oldRow += `<td>${Col.OldValue}</td>`;
                    });
                    oldRow += `</tr>`;
                    tableHtml += oldRow;
                    isTrAvail = true;
                });

                $.each(Tbl.EditedRows, function (m, Cols) {
                    let newRow = `<tr><td rowspan='2' style='vertical-align: middle;'>Edited</td>`;
                    let oldRow = `<tr>`;
                    let changeFound = false;
                    $.each(Cols.Columns, function (n, Col) {
                        if (Col.IsModified) {
                            newRow += `<td>${Col.NewValue}</td>`;
                            oldRow += `<td style="text-decoration: line-through;">${Col.OldValue}</td>`;
                            changeFound = true;
                        }
                        else {
                            newRow += `<td>${Col.NewValue}</td>`;
                            oldRow += `<td>${Col.OldValue}</td>`;
                        }
                    });
                    newRow += `</tr>`;
                    oldRow += `</tr>`;
                    if (changeFound) {
                        tableHtml += newRow + oldRow;
                        isTrAvail = true;
                    }
                });

                tableHtml += `</tbody></table></div>`;
                if (isTrAvail)
                    tempHtml += tableHtml;
            });
            $trans.children(".trans-body").append(tempHtml);
            $transAll.append($trans);
        });

        $("#divAuditTrail").children().remove();
        $("#divAuditTrail").append($transAll);

        $("#divAuditTrail .trans-head").off("click").on("click", function (e) {
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
        if (this.renderMode === 2)
            ebcontext.webform.showSubFormLoader();
        else
            $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#WebForm-cont" } });
    };

    this.hideLoader = function () {
        if (this.renderMode === 2)
            ebcontext.webform.hideSubFormLoader();
        else
            $("#eb_common_loader").EbLoader("hide");
    };

    this.windowKeyDown = function (event) {
        if (event.ctrlKey || event.metaKey) {// ctrl + s - save form
            if (event.which === 83) {
                event.preventDefault();
                if (this.Mode.isEdit || this.Mode.isNew)
                    this.saveForm();
            }
        }

        if (event.altKey || event.metaKey) {// alt + n - new form
            if (event.which === 78) {
                event.preventDefault();
                if ($("#webformnew").css("display") !== "none")
                    this.startNewMode();
            }
        }
    }.bind(this);

    this.disableformEditbtn = function () {
        //$("#webformedit").addClass('eb-disablebtn')
        //    .attr('data-toggle', "tooltip")
        //    .attr('data-placement', "bottom")
        //    .attr("tittle", "Can’t edit this form as it is waiting for approval").tooltip();

        $("#webformedit").attr("disabled", true);
    };

    this.enableformEditbtn = function () {
        //$("#webformedit").removeClass('eb-disablebtn').attr("tittle", "Edit").tooltip();
        $("#webformedit").attr("disabled", false);
    };

    this.AdjustDraftBtnsVisibility = function () {
        if (this.FormObj.CanSaveAsDraft && this.Mode.isNew) {
            this.headerObj.showElement(["webformsavedraft"]);
            if (this.draftId > 0)
                this.headerObj.showElement(["webformdeletedraft"]);
        }
    };

    this.DataPushedPopover = function () {
        $('#webformpusheddata').show();
        let timer1;
        let contentHtml = null;

        let contentFn = function (type) {
            let _html = '';
            if (type === 'loader') {
                _html += `<div style='color: #888;'><i class="fa fa-spinner fa-pulse" aria-hidden="true"></i> Loading...</div>`;
            }
            else if (type === 'init') {
                if (contentHtml)
                    _html += contentHtml;
                else
                    _html += `<div ><button class='btn' id='webformpusheddata_btn'><i class="fa fa-refresh"></i> Refresh</button></div>`;
            }
            else if (type === 'error') {
                _html += `<div><button class='btn' id='webformpusheddata_btn'><i class="fa fa-refresh"></i> Refresh</button><div style="color: #a88;">Error in loading!</div></div>`;
            }
            return _html;
        };

        let $poTrig = $('#webformpusheddata').popover({
            trigger: 'manual',
            html: true,
            container: "body",
            placement: 'bottom',
            content: `<div id='webformpusheddata-div' style = 'min-height: 80px; min-width: 250px; display: flex; justify-content: center; align-items: center;'></div>`,
            delay: { "hide": 100 }
        });

        let OnMouseEnter = function () {
            clearTimeout(timer1);
            let _this = this;
            let $poDiv = $('#' + $(_this).attr('aria-describedby'));
            if (!$poDiv.length) {
                $(_this).popover("show");
                $poDiv = $('#' + $(_this).attr('aria-describedby'));
            }
            $poDiv.off("mouseleave").on("mouseleave", function () {
                timer1 = setTimeout(function () { $(_this).popover('hide'); }, 300);
            });

            $poDiv.off("mouseenter").on("mouseenter", function () {
                clearTimeout(timer1);
            });
        };

        let OnMouseLeave = function () {
            let _this = this;
            timer1 = setTimeout(function () {
                if (!$('#' + $(_this).attr('aria-describedby') + ':hover').length) {
                    $(_this).popover("hide");
                }
            }, 300);
        };

        let LoadData = function () {
            if (contentHtml) {
                $('#webformpusheddata-div').html(contentFn('init'));
                return;
            }
            $('#webformpusheddata-div').html(contentFn('loader'));
            $.ajax({
                type: "POST",
                url: "/WebForm/GetPushedDataInfo",
                data: {
                    RefId: this.formRefId, RowId: this.rowId, CurrentLoc: ebcontext.locations.getCurrent()
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    $('#webformpusheddata-div').html(contentFn('error'));
                }.bind(this),
                success: function (_resp) {
                    try {
                        let _respObj = JSON.parse(_resp);
                        if ($.isEmptyObject(_respObj)) {
                            contentHtml = '<div style="color: #888;">Nothing to Display</div>'
                            $('#webformpusheddata-div').html(contentHtml);
                        }
                        else {
                            contentHtml = '<div>'
                            $.each(_respObj, function (k, v) {
                                contentHtml += `<div style='padding: 2px 0px;'><a href='${v}' target='_blank'>${k}</a></div>`;
                            });
                            contentHtml += '</div>';
                            $('#webformpusheddata-div').html(contentHtml);
                        }
                    }
                    catch (e) {
                        $('#webformpusheddata-div').html(contentFn('error'));
                        console.log(_resp);
                        console.error(e);
                    }
                }.bind(this)
            })
        };

        $poTrig.on('click', OnMouseEnter.bind($poTrig));
        $poTrig.on('mouseleave', OnMouseLeave.bind($poTrig));
        $('#webformpusheddata').off('shown.bs.popover').on('shown.bs.popover', LoadData.bind(this));
        $('body').off('click', '#webformpusheddata_btn').on('click', '#webformpusheddata_btn', LoadData.bind(this));
    };

    this.setHeader = function (reqstMode) {
        let currentLoc = ebcontext.locations.getCurrent();
        if (this.renderMode === 2) {//partial
            this.$newBtn.hide();
            this.$editBtn.hide();
            this.$saveBtn.hide();
            this.$openInNewBtn.show();

            if (this.Mode.isEdit) {
                this.$saveBtn.show();
            }
            else if (this.Mode.isNew) {
                this.$saveBtn.show();
            }
            else if (this.Mode.isView) {
                this.$newBtn.show();
                if (!this.formData.IsLocked && !this.formData.IsReadOnly)
                    this.$editBtn.show();
            }
            let title_val = '';
            try {
                if (this.FormObj.TitleExpression && this.FormObj.TitleExpression.Code && this.FormObj.TitleExpression.Code !== '') {
                    if (this.formObject) {
                        title_val = " - " + new Function("form", "user", atob(this.FormObj.TitleExpression.Code)).bind('', this.formObject, ebcontext.user)();
                    }
                }
            }
            catch (e) { console.log("Error in title expression  " + e.message); }

            ebcontext.webform.SetPopupFormTitle(this.FormObj.DisplayName + title_val, reqstMode, this.formData.IsLocked, this.formData.IsCancelled, this.formData.IsReadOnly);

            return;
        }

        this.headerObj.hideElement(["webformsave-selbtn", "webformnew", "webformedit", "webformdelete", "webformcancel", "webformaudittrail", "webformclose", "webformprint-selbtn", "webformclone", "webformexcel-selbtn", "webformopensrc", "webformlock", "webformpusheddata", "webformdiscardedit"]);

        if (this.isPartial === "True") {
            if ($(".objectDashB-toolbar").find(".pd-0:first-child").children("#switch_loc").length > 0) {
                $(".objectDashB-toolbar").find(".pd-0:first-child").children("#switch_loc").remove();
                $(".objectDashB-toolbar").find(".pd-0:first-child").children(".solution_logo_cont").remove();
                $(".objectDashB-toolbar").find(".pd-0:nth-child(2)").find(".form-group").remove();
                $("#quik_menu").remove();
            }
            this.headerObj.showElement(["webformclose"]);
        }
        this.AdjustDraftBtnsVisibility();

        let lockedHtm = '';
        let cancelledHtm = '';
        //reqstMode = "Edit Mode" or "New Mode" or "View Mode"
        if (this.Mode.isEdit) {
            this.headerObj.showElement(this.filterHeaderBtns(["webformnew", "webformsave-selbtn"], currentLoc, reqstMode));
            this.headerObj.showElement(["webformdiscardedit"]);
        }
        else if (this.Mode.isNew) {
            this.headerObj.showElement(this.filterHeaderBtns(["webformsave-selbtn", "webformexcel-selbtn"], currentLoc, "New Mode"));
        }
        else if (this.Mode.isView) {

            if (this.FormObj.DataPushers && this.FormObj.DataPushers.$values.length > 0) {
                let aValidDP = this.FormObj.DataPushers.$values.find(e => e.$type.includes('EbFormDataPusher') || e.$type.includes('EbBatchFormDataPusher'));
                if (aValidDP && this.formPermissions[currentLoc].includes(5))
                    this.DataPushedPopover();
            }

            let btnsArr = ["webformnew", "webformedit", "webformdelete", "webformcancel", "webformaudittrail", "webformprint-selbtn", "webformclone", "webformlock"];
            if (this.formData.IsReadOnly) {
                btnsArr = ["webformnew", "webformaudittrail", "webformprint-selbtn", "webformclone"];
                console.warn("ReadOnly record!.............");
                lockedHtm = "<span class='fmode' style='background-color: gray;'><i class='fa fa-eye'></i> ReadOnly</span>";
            }
            else {
                if (this.formData.IsLocked) {
                    btnsArr.splice(1, 3);//
                    console.warn("Locked record!.............");
                    $("#webformlock").prop("title", "Unlock");
                    lockedHtm = "<span class='fmode' style='background-color: blue;'><i class='fa fa-lock'></i> Locked</span>";
                }
                else {
                    $("#webformlock").prop("title", "Lock");
                }
                if (this.formData.IsCancelled) {
                    //btnsArr.splice(3, 1);//
                    console.warn("Cancelled record!.............");
                    $("#webformcancel").prop("title", "Revoke Cancel");
                    cancelledHtm = "<span class='fmode' style='background-color: red;'><i class='fa fa-ban'></i> Cancelled</span>";
                }
                else {
                    $("#webformcancel").prop("title", "Cancel");
                }
            }
            if (this.formData.SrcDataId > 0 && (this.formData.SrcRefId?.length > 0 || this.formData.SrcVerId > 0)) {
                btnsArr.push("webformopensrc");
            }
            this.headerObj.showElement(this.filterHeaderBtns(btnsArr, currentLoc, reqstMode));
        }

        let title_val = '';
        try {
            if (this.FormObj.TitleExpression && this.FormObj.TitleExpression.Code && this.FormObj.TitleExpression.Code !== '') {
                if (this.formObject) {
                    title_val = " - " + new Function("form", "user", atob(this.FormObj.TitleExpression.Code)).bind('', this.formObject, ebcontext.user)();
                }
            }
        }
        catch (e) { console.log("Error in title expression  " + e.message); }
        this.headerObj.setName(this.FormObj.DisplayName + title_val);

        let modeText = this.mode;

        if (reqstMode === "Preview Mode" || reqstMode === "Export Mode" || reqstMode === "Prefill Mode") {
            modeText = "New Mode";
        }
        else if (reqstMode === "Draft Mode" && this.draftId > 0) {
            modeText = "Draft";
        }

        if (this.renderMode !== 3 && this.renderMode !== 5)
            this.headerObj.setFormMode(`<span mode="${reqstMode}" class="fmode">${modeText}</span>${lockedHtm}${cancelledHtm}`);

        $('title').text(this.FormObj.DisplayName + title_val + `(${modeText})`);

        if (this.isPartial === "True") {
            this.headerObj.hideElement(["webformnew", "webformdelete", "webformcancel", "webformaudittrail"]);
        }
    };

    this.filterHeaderBtns = function (btns, loc, mode) {
        let r = [];
        // ["webformsave-selbtn", "webformnew", "webformedit", "webformdelete", "webformcancel", "webformaudittrail"];
        // ["New", "View", "Edit", "Delete", "Cancel", "AuditTrail"]
        if (this.renderMode === 4) {
            if (mode === 'View Mode')
                r.push('webformedit');
        }
        else {
            let op = { New: 0, View: 1, Edit: 2, Delete: 3, Cancel: 4, AuditTrail: 5, Clone: 6, ExcelImport: 7, OwnData: 8, LockUnlock: 9, RevokeDelete: 10, RevokeCancel: 11 };
            for (let i = 0; i < btns.length; i++) {
                if (btns[i] === "webformsave-selbtn" && this.formPermissions[loc].includes(op.New) && (mode === 'New Mode'))
                    r.push(btns[i]);
                else if (btns[i] === "webformsave-selbtn" && (this.formPermissions[loc].includes(op.Edit) || (this.formPermissions[loc].includes(op.OwnData) && this.formData.CreatedBy === this.userObject.UserId)) && mode === 'Edit Mode')
                    r.push(btns[i]);
                else if (btns[i] === "webformedit" && (this.formPermissions[loc].includes(op.Edit) || (this.formPermissions[loc].includes(op.OwnData) && this.formData.CreatedBy === this.userObject.UserId)))
                    r.push(btns[i]);
                else if (btns[i] === "webformdelete" && this.formPermissions[loc].includes(op.Delete))
                    r.push(btns[i]);
                else if (btns[i] === "webformcancel" && ((this.formPermissions[loc].includes(op.Cancel) && !this.formData.IsCancelled) || (this.formPermissions[loc].includes(op.RevokeCancel) && this.formData.IsCancelled)))
                    r.push(btns[i]);
                else if (btns[i] === "webformaudittrail" && this.formPermissions[loc].includes(op.AuditTrail))
                    r.push(btns[i]);
                else if (btns[i] === "webformnew" && this.formPermissions[loc].includes(op.New) && !this.FormObj.IsDisable)
                    r.push(btns[i]);
                else if (btns[i] === "webformprint-selbtn" && mode === 'View Mode' && this.FormObj.PrintDocs && this.FormObj.PrintDocs.$values.length > 0)
                    r.push(btns[i]);
                else if (btns[i] === "webformexcel-selbtn" && this.formPermissions[loc].includes(op.ExcelImport) && mode === 'New Mode' && this.FormObj.EnableExcelImport)
                    r.push(btns[i]);
                else if (btns[i] === "webformclone" && this.formPermissions[loc].includes(op.Clone) && mode === 'View Mode' && !this.FormObj.IsDisable)
                    r.push(btns[i]);
                else if (btns[i] === "webformopensrc" && this.formPermissions[loc].includes(op.View) && mode === 'View Mode')
                    r.push(btns[i]);
                else if (btns[i] === "webformlock" && this.formPermissions[loc].includes(op.LockUnlock) && mode === 'View Mode')
                    r.push(btns[i]);
            }
        }
        return r;
    };

    this.saveSelectChange = function () {
        this.saveForm();
        let val = $("#webformsave-selbtn .selectpicker").find("option:selected").attr("data-token");
        this.curAfterSavemodeS = val;
    }.bind(this);

    this.initPrintMenu = function () {
        if (this.FormObj.PrintDocs && this.FormObj.PrintDocs.$values.length > 0) {
            let $sel = $("#webformprint-selbtn .selectpicker");
            for (let i = 0; i < this.FormObj.PrintDocs.$values.length; i++) {
                let tle = this.FormObj.PrintDocs.$values[i].Title || this.FormObj.PrintDocs.$values[i].ObjDisplayName;
                $sel.append(`<option data-token="${this.FormObj.PrintDocs.$values[i].ObjRefId}" data-title="${tle}">${tle}</option>`);
            }

            $sel.selectpicker({ iconBase: 'fa', tickIcon: 'fa-check' });
            $("#webformprint-selbtn").off("click", ".dropdown-menu li").on("click", ".dropdown-menu li", this.printDocument.bind(this));
            $("#webformprint").off("click").on("click", function () { this.printDocument(); }.bind(this));
        }
    };

    this.printDocument = function () {
        let rptRefid = $("#webformprint-selbtn .selectpicker").find("option:selected").attr("data-token");
        $("#iFramePdf").attr("src", "/WebForm/GetPdfReport?refId=" + rptRefid + "&rowId=" + this.rowId);
        $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#WebForm-cont" } });
    };

    this.LocationInit = function () {
        if (ebcontext.locations.Listener && !this.FormObj.IsLocIndependent) {
            ebcontext.locations.Listener.ChangeLocation = function (o) {
                if (this.rowId > 0) {
                    if (this.renderMode !== 4) {
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
                                this.startNewMode();
                            }.bind(this)
                        });
                    }
                }
                else {
                    let sysLocCtrls = getFlatObjOfType(this.FormObj, "SysLocation");
                    $.each(sysLocCtrls, function (i, ctrl) {
                        let oldLocId = ctrl.getValue();
                        if (oldLocId !== o.LocId)
                            ctrl.setValue(o.LocId);
                    }.bind(this));
                }
            }.bind(this);
        }
    };

    this.locInit4viewMode = function () {
        if (this.FormObj.IsLocIndependent)
            return;

        let ol = ebcontext.locations.getCurrent().toString();
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
                        this.startNewMode();
                    }.bind(this)
                });
            }
            else {
                EbMessage("show", { Message: `Switching from ${odlocO.LongName} to ${nwlocO.LongName}`, AutoHide: true, Background: '#0000aa', Delay: 3000 });
                ebcontext.locations.SwitchLocation(this.formData.MultipleTables[this.formData.MasterTable][0].LocId);
                this.setHeader(this.mode);
            }
        }
    };


    this.bindEventFns = function (headerBtns) {
        $("[eb-form=true]").off("submit").on("submit", function () { event.preventDefault(); });

        this.$newBtn = $('#' + headerBtns['New']);
        this.$editBtn = $('#' + headerBtns['Edit']);
        this.$saveBtn = $('#' + headerBtns['Save']);

        this.$newBtn.off("click").on("click", this.startNewMode.bind(this));
        this.$editBtn.off("click").on("click", this.SwitchToEditMode.bind(this));
        this.$saveBtn.off("click").on("click", this.saveForm.bind(this));

        if (this.renderMode === 2) {
            this.$openInNewBtn = $('#' + headerBtns['OpenInNewTab']);
            this.$openInNewBtn.off("click").on("click", this.OpenInNewTab.bind(this));
        }
        else {
            this.$saveSelBtn = $('#' + headerBtns['SaveSel']);
            this.$deleteBtn = $('#' + headerBtns['Delete']);
            this.$cancelBtn = $('#' + headerBtns['Cancel']);
            this.$auditBtn = $('#' + headerBtns['AuditTrail']);
            this.$cloneBtn = $('#' + headerBtns['Clone']);
            this.$lockBtn = $('#' + headerBtns['Lock']);
            this.$exceleBtn = $('#' + headerBtns['Excel']);
            this.$excelSelBtn = $('#' + headerBtns['ExcelSel']);
            this.$printBtn = $('#' + headerBtns['Print']);
            this.$printSelBtn = $('#' + headerBtns['PrintSel']);
            this.$draftSaveBtn = $('#' + headerBtns['DraftSave']);
            this.$draftDeleteBtn = $('#' + headerBtns['DraftDelete']);
            this.$gotoInvalidBtn = $('#' + headerBtns['GotoInvalid']);
            this.$openSrcBtn = $('#' + headerBtns['OpenSrc']);

            this.$saveSelBtn.off("click", ".dropdown-menu li").on("click", ".dropdown-menu li", this.saveSelectChange);
            $(`#${headerBtns['SaveSel']} .selectpicker`).selectpicker({ iconBase: 'fa', tickIcon: 'fa-check' });
            this.$deleteBtn.off("click").on("click", this.deleteForm.bind(this));
            this.$cancelBtn.off("click").on("click", this.cancelForm.bind(this));
            this.$auditBtn.off("click").on("click", this.GetAuditTrail.bind(this));
            this.$cloneBtn.off("click").on("click", this.cloneForm.bind(this));
            this.$lockBtn.off("click").on("click", this.lockUnlockForm.bind(this));
            this.$excelSelBtn.off("click", ".dropdown-menu li").on("click", ".dropdown-menu li", this.excelExportImport.bind(this));
            $(`#${headerBtns['ExcelSel']} .selectpicker`).selectpicker({ iconBase: 'fa', tickIcon: 'fa-check' });
            $("#excelfile").off('change').on('change', this.excelUpload.bind(this));

            $("#webformsavedraft").off("click").on("click", this.saveAsDraft);
            $("#webformdeletedraft").off("click").on("click", this.deleteDraft);
            this.$openSrcBtn.off("click").on("click", this.openSourceForm.bind(this));
            $("#webformdiscardedit").off("click").on("click", this.DiscardChanges.bind(this));
        }

        $("body").off("focus", "[ui-inp]").on("focus", "[ui-inp]", this.selectUIinpOnFocus);
        $(window).off("keydown").on("keydown", this.windowKeyDown);
    };

    this.OpenInNewTab = function () {
        let url = ebcontext.webform.LastResponse.Url;
        if (!url)
            url = `../WebForm/Index?_r=${this.formRefId}&_m=1&_l=${ebcontext.locations.getCurrent()}`;
        if (this.rowId > 0) {
            let params = [];
            params.push(new fltr_obj(11, "id", this.rowId));
            url = `../WebForm/Index?_r=${this.formRefId}&_p=${btoa(JSON.stringify(params))}&_m=1&_l=${ebcontext.locations.getCurrent()}`;
        }
        window.open(url, '_blank');
    };

    this.DiscardChanges = function () {
        if (!this.IsAnyChangesInFormData()) {
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

    this.IsAnyChangesInFormData = function () {
        let changeDetected = false;
        let modelBkUp = this.formDataBackUp.MultipleTables;
        $.each(this.DataMODEL, function (k, Table) {
            if (!modelBkUp[k] || (modelBkUp[k] && modelBkUp[k].length != Table.length)) {
                changeDetected = true;
                return false;
            }
            for (let i = 0; i < Table.length; i++) {
                let RowBkUp = modelBkUp[k].find(e => e.RowId === Table[i].RowId);
                if (!RowBkUp || (RowBkUp && RowBkUp.Columns.length != Table[i].Columns.length)) {
                    changeDetected = true;
                    return false;
                }
                for (let j = 0; j < Table[i].Columns.length; j++) {
                    let ColumnBkUp = RowBkUp.Columns.find(e => e.Name === Table[i].Columns[j].Name);
                    if (!ColumnBkUp || (ColumnBkUp && Table[i].Columns[j].Value !== ColumnBkUp.Value)) {
                        let ctrl = this.flatControls.find(e => e.Name === ColumnBkUp.Name);
                        if (!(ctrl && ctrl.DoNotPersist)) {
                            changeDetected = true;
                            return false;
                        }
                    }
                }
            }
        }.bind(this));
        return changeDetected;
    };

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
                        EbMessage("show", { Message: 'Successfully Imported', AutoHide: true, Background: '#00aa00' });
                        this.hideLoader();
                    }.bind(this),
                    error: function () {
                        EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
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
        let el = event.target;
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
        else if (this.mode === "New Mode" || this.mode === "Export Mode" || this.mode === "Draft Mode" || this.mode === "Prefill Mode" || this.mode === "Preview Mode")
            this.Mode.isNew = true;
        else if (this.mode === "Edit Mode")
            this.Mode.isEdit = true;
    };

    this.initConnectionCheck = function () {
        Offline.options = { checkOnLoad: true, checks: { image: { url: 'https://expressbase.com/images/logos/EB_Logo.png?' + Date.now() }, active: 'image' } };
        //Offline.options = {checks: {xhr: {url: '/WebForm/Status'}}};
        setInterval(this.connectionPing, 10000);///////////////////////////////////////////////////////////////
    };

    this.connectionPing = function () {
        Offline.options.checks.image.url = 'https://expressbase.com/images/logos/EB_Logo.png?' + Date.now();
        //Offline.options = { checks: { xhr: { url: '/WebForm/Status' } } };
        if (Offline.state === 'up')
            Offline.check();
        console.log(Offline.state);
    };

    this.init = function () {
        //let t0 = performance.now();

        this.rendererName = 'WebForm';

        this.$formCont = option.$formCont;
        this.formHTML = option.formHTML;
        this.$formCont.empty();
        this.$formCont.append(this.formHTML);

        this.sseChannel = option.formRefId + "_" + option.rowId;
        if (!ebcontext.sse_channels.includes(this.sseChannel))
            ebcontext.sse_channels.push(this.sseChannel);

        ebcontext.renderContext = "WebForm";//reference - Eb_select.js, InitformControls
        this.FormObj = JSON.parse(JSON.stringify(option.formObj));
        this.$form = $(`#${this.FormObj.EbSid_CtxId}`);

        //this.$saveBtn = $('#' + option.headerBtns['Save']);
        //this.$deleteBtn = $('#' + option.headerBtns['Delete']);
        //this.$editBtn = $('#' + option.headerBtns['Edit']);
        //this.$cancelBtn = $('#' + option.headerBtns['Cancel']);
        //this.$auditBtn = $('#' + option.headerBtns['AuditTrail']);
        //this.$closeBtn = $('#' + option.headerBtns['Close']);
        //this.$cloneBtn = $('#webformclone');
        //this.$openSrcBtn = $('#webformopensrc');

        this.Env = option.env;
        this.initControls = new InitControls(this);
        this.formRefId = option.formRefId || "";
        this.rowId = option.rowId;
        this.draftId = option.draftId;
        this.mode = option.mode;
        this.renderMode = option.renderMode;
        this.userObject = option.userObject;
        this.isPartial = option.isPartial;//value is true if form is rendering in iframe
        this.headerObj = option.headerObj;//EbHeader
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
        this.DynamicTabObject = null;
        this.FRC = new FormRenderCommon({ FO: this });
        this.TableNames = this.getNormalTblNames();
        this.ReviewCtrl = getFlatContObjsOfType(this.FormObj, "Review")[0];//Review control in formObject
        this.TabControls = getFlatContObjsOfType(this.FormObj, "TabControl");// all TabControl in the formObject

        $(`#${this.FormObj.EbSid_CtxId} [data-toggle="tooltip"]`).tooltip();// init bootstrap tooltip
        if (parseInt(option.disableEditBtn.disableEditButton)) {
            ($(`.objectDashB-toolbar #webformedit`).attr("disabled", true))
        }
        this.bindEventFns(option.headerBtns);
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
        this.isInitiallyPopulating = true;
        this.initWebFormCtrls();
        this.initPrintMenu();
        this.defaultAfterSavemodeS = getKeyByVal(EbEnums_w.WebFormAfterSaveModes, this.FormObj.FormModeAfterSave.toString()).split("_")[0].toLowerCase();
        this.curAfterSavemodeS = this.defaultAfterSavemodeS;
        this.populateControlsWithDataModel(this.DataMODEL);// 1st
        this.isInitiallyPopulating = false;

        if (this.Mode.isNew) {
            if (this.draftId === 0) // not new mode in draft
                this.FRC.execAllDefaultValExpr();//exec default Value Expression 2nd
        }
        else {
            this.FRC.execAllValExprForDoNotPersistCtrls();//================== exec Value Expression   2nd
        }

        if (this.ReviewCtrl && (this.Mode.isNew || this.ReviewCtrl.Hidden))
            this.ReviewCtrlBuilder.hide();

        if (this.Mode.isView) {
            this.SwitchToViewMode();
            this.locInit4viewMode();
        }
        else if (this.Mode.isEdit) {
            this.SwitchToEditMode();
        }

        this.LocationInit();

        //console.dev_log("WebFormRender : init() took " + (performance.now() - t0) + " milliseconds.");



        //this.EbAlert = new EbAlert({
        //    id: this.FormObj.EbSid_CtxId + "_formAlertBox",
        //    class: 'webform-alert-box',
        //    top: 60,
        //    right: 24,
        //    onClose: this.FRC.invalidBoxOnClose
        //});
        this.initConnectionCheck();

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