﻿const formBuilder = function (options) {

    //let AllMetas = AllMetasRoot["EbObject"];// newly added line to declare a local variable named "AllMetas"  which contains contextaul metas

    this.AllMetas = options.root === 'webform' ? (AllMetas_w || AllMetas) : AllMetas;
    this.EbObjects = options.root === 'webform' ? (EbObjects_w || EbObjects) : EbObjects;

    this.wc = options.wc;
    this.cid = options.cid;
    this.formId = options.formId;
    this.Name = this.formId;
    this.toolBoxid = options.toolBoxId;
    this.primitiveToolsId = options.primitiveToolsId;
    this.rootContainerObj = null;
    this.builderType = options.builderType;
    this.toolContClass = "tool-sec-cont";
    this.$propGrid = $("#" + options.PGId);

    this.beforeSave = function () {
        let allFlatControls = getAllctrlsFrom(this.EbObject);

        for (let i = 0; i < allFlatControls.length; i++) {
            let ctrl = allFlatControls[i];
            if (ctrl.hasOwnProperty("__OSElist"))
                delete ctrl.__OSElist;
            if (ctrl.hasOwnProperty("__oldValues"))
                delete ctrl.__oldValues;

            if (ctrl.ObjType === "PowerSelect" && ctrl.IsDataFromApi) {
                if (ctrl.Url.includes('?'))
                    ctrl.Url = ctrl.Url.substring(0, ctrl.Url.indexOf('?'));
            }
        }

        this.PGobj.getvaluesFromPG();
        return true;
    }.bind(this);

    this.BeforeSave = this.beforeSave;


    //functions to be executed before UpdateDashboard
    this.BeforeUpdateDashboard = function () {
        $.LoadingOverlay("show");
    }.bind(this);

    //functions to be executed after UpdateDashboard
    this.afterUpdateDashboard = function () {
        $.LoadingOverlay("hide");
    }.bind(this);

    //functions to be executed before UpdateBuilder
    this.beforeUpdateBuilder = function () {
        $.LoadingOverlay("show");
        $.contextMenu('destroy');
    }.bind(this);

    //functions to be executed after UpdateBuilder
    this.afterUpdateBuilder = function () {
        $.LoadingOverlay("hide");
    }.bind(this);

    $(`[eb-form=true]`).attr("ebsid", this.formId).attr("id", this.formId);

    this.$form = $("#" + this.formId);
    this.EbObject = options.objInEditMode;
    this.isEditMode = false;
    commonO.Current_obj = this.EbObject;

    this.controlCounters = CtrlCounters;//Global
    this.currentProperty = null;
    this.CurRowCount = 2;
    this.CurColCount = 2;
    this.movingObj = {};

    this.DraggableConts = [...(document.querySelectorAll("[ebclass=tool-sec-cont]")), document.getElementById(this.formId)];


    this.GenerateButtons = function () {
        if (options.builderType === 'WebForm' && options.objInEditMode !== null) {
            $("#obj_icons").empty().append(`<button class='btn' id= 'form_preview' data-toggle='tooltip' data-placement='bottom' title= 'Preview'>
                                            <i class='fa fa-eye' aria-hidden='true'></i>
                                        </button>
                                        <button class='btn' id= 'form_update_index' data-toggle='tooltip' data-placement='bottom' title= 'Update index table'>
                                            <i class='fa fa-pencil-square-o' aria-hidden='true'></i>
                                        </button>
                                        <button class='btn' id= 'form_datapush_json' data-toggle='tooltip' data-placement='bottom' title= 'Get datapush JSON'>
                                            <i class='fa fa-file-text-o' aria-hidden='true'></i>
                                        </button>`);
            $("#form_preview").tooltip().off("click").on("click", function () {
                if (this.EbObject.RefId === null || this.EbObject.RefId === "")
                    EbMessage("show", { Message: 'Refresh page then Try again', AutoHide: true, Background: '#1e1ebf' });
                else {
                    let url = window.location.origin.replace('-dev', '') + "/WebForm/Index?_r=" + this.EbObject.RefId;
                    if (ebcontext.languages != undefined)
                        url += "&_lg=" + ebcontext.languages.getCurrentLanguageCode();
                    window.open(url, '_blank');
                }
            }.bind(this));
            $("#form_update_index").tooltip().off("click").on("click", function () {
                if (this.EbObject.RefId === null || this.EbObject.RefId === "")
                    EbMessage("show", { Message: 'Refresh page then Try again', AutoHide: true, Background: '#1e1ebf' });
                else
                    window.open("../WebForm/UpdateIndexes?refid=" + this.EbObject.RefId, '_blank');
            }.bind(this));
            $("#form_datapush_json").tooltip().off("click").on("click", function () {
                if (this.EbObject.RefId === null || this.EbObject.RefId === "")
                    EbMessage("show", { Message: 'Refresh page then Try again', AutoHide: true, Background: '#1e1ebf' });
                else
                    window.open("../WebForm/GetDataPusherJson?RefId=" + this.EbObject.RefId, '_blank');
            }.bind(this));
        }
    }.bind(this);

    this.del = function (eType, selector, action, originalEvent) {
        let $e = selector.$trigger;
        let ebsid = $e.attr("ebsid");
        let ControlTile = $(`#cont_${ebsid}`).closest(".Eb-ctrlContainer");
        let ctrl = this.rootContainerObj.Controls.PopByName(ebsid);
        if (ctrl.ObjType === "Approval")
            this.ApprovalCtrl = null;
        if (ctrl.ObjType === "Review")
            this.ReviewCtrl = null;
        else if (ctrl.ObjType === "ProvisionLocation")
            this.ProvisionLocationCtrl = null;
        ControlTile.parent().focus();
        ControlTile.remove();
        this.PGobj.removeFromDD(ebsid);
        this.saveObj();
        return ctrl;
    }.bind(this);

    this.cut = function (eType, selector, action, originalEvent) {
        this.copy(eType, selector, action, originalEvent);
        this.del(eType, selector, action, originalEvent);
    }.bind(this);

    this.copy = function (eType, selector, action, originalEvent) {
        let $e = selector.$trigger;
        let ebsid = $e.attr("ebsid");
        let ctrl = this.rootContainerObj.Controls.GetByName(ebsid);
        let clonedCtrl = { ...ctrl };
        if (ctrl.ObjType === "Approval")
            this.ApprovalCtrl = null;
        if (ctrl.ObjType === "Review")
            this.ReviewCtrl = null;
        else if (ctrl.ObjType === "ProvisionLocation")
            this.ProvisionLocationCtrl = null;

        delete clonedCtrl["$Control"];
        delete clonedCtrl["__oldValues"];
        localStorage.eb_form_control = JSON.stringify(clonedCtrl);
        localStorage.eb_form_$control = $(`[ebsid='${JSON.parse(localStorage.eb_form_control).EbSid_CtxId}']`)[0].outerHTML;
    }.bind(this);

    this.copyToClipboard = function (eType, selector, action, originalEvent) {
        let $e = selector.$trigger;
        let ebsid = $e.attr("ebsid");
        let ctrl = this.rootContainerObj.Controls.GetByName(ebsid);
        let copyCtrlJson = this.getCopyControlJson(ctrl);
        let $ctrl = $(`[ebsid='${ctrl.EbSid_CtxId}']`)[0].outerHTML;
        let cpyText = copyCtrlJson + '$$$webform-control-copy$$$' + $ctrl;
        this.copyTextToClipboard(cpyText);
        localStorage.removeItem("eb_form_control");
        localStorage.removeItem("eb_form_$control");
    }.bind(this);

    this.getCopyControlJson = function (ctrl) {
        let newCtrl = JSON.parse(JSON.stringify(ctrl));

        let flatControls = getAllctrlsFrom(newCtrl);
        for (let i = 0; i < flatControls.length; i++) {
            let _ctrl = flatControls[i];
            if (_ctrl.ObjType === "PowerSelect" || _ctrl.ObjType === "DGPowerSelectColumn") {
                _ctrl.Columns.$values = [];
                _ctrl.DisplayMembers.$values = [];
                _ctrl.DisplayMember = null;
                _ctrl.ValueMember = null;
                _ctrl.DataImportId = null;
                _ctrl.DataSourceId = null;
                _ctrl.FormRefId = null;
            }
            else if (_ctrl.ObjType === "SimpleSelect" || _ctrl.ObjType === "DGSimpleSelectColumn") {
                _ctrl.DataSourceId = null;
                _ctrl.Columns.$values = [];
                _ctrl.ValueMember = null;
                _ctrl.DisplayMember = null;
            }
            else if (_ctrl.ObjType === "Label" || _ctrl.ObjType === "DGLabelColumn") {
                _ctrl.LinkedObjects.$values = [];
            }
            else if (_ctrl.ObjType === "DataGrid") {
                _ctrl.DataSourceId = null;
                _ctrl.CustomSelectDS = null;
                _ctrl.TableName = '';
            }
            else if (_ctrl.ObjType === "ExportButton") {
                _ctrl.FormRefId = null;
            }
        }

        return JSON.stringify(newCtrl);
    }.bind(this);

    this.getTextFromClipboard = async function (showWarning) {
        let __val = null;
        try {
            let __v = await navigator.clipboard.readText();
            if (__v && __v.includes('$$$webform-control-copy$$$')) {
                __val = __v;
            }
        }
        catch (e) {
            if (showWarning)
                alert("Failed to read from clipboard: " + e.message);
            console.error(e.message);
        }
        return __val;
    }.bind(this);

    this.copyTextToClipboard = async function (text) {
        try {
            await navigator.clipboard.writeText(text);
            console.log('Content copied to clipboard');
        }
        catch (err) {
            alert('Failed to copy: ' + err);
        }
        return;
    }.bind(this);

    this.paste = async function (eType, selector, action, originalEvent) {
        let $e = $(event.target); // need optimize
        if (localStorage.eb_form_control) {
            this.paste_inner($e, localStorage.eb_form_control, localStorage.eb_form_$control);
        }
        else {
            let st = await this.getTextFromClipboard(true);
            if (st) {
                st = st.split('$$$webform-control-copy$$$');
                this.paste_inner($e, st[0], st[1]);
            }
            else {
                this.EbAlert.clearAlert("pasteError");
                this.EbAlert.alert({
                    id: "pasteError",
                    head: "Copy again and try.",
                    body: "Try after copying",
                    type: "info",
                    delay: 2100
                });
            }
        }
    }.bind(this);

    this.paste_inner = function ($e, ctrl_string, ctrl_obj_string) {
        let ctrl = JSON.parse(ctrl_string);
        let cloneCtrl = JSON.parse(JSON.stringify(ctrl));
        let copiedCtrl = this.getCopiedCtrl(ctrl);
        let $copiedCtrl = this.getCopied$Ctrl(copiedCtrl, cloneCtrl, ctrl_obj_string);
        let offset = $e.closest('.context-menu-list').offset();
        $('#context-menu-layer').css('z-index', 0);
        $('.context-menu-list.context-menu-root').css('z-index', 0);
        let $clickedEl = $(document.elementFromPoint(offset.left, offset.top));//$('.context-menu-active');//
        let $clickedColTile = $clickedEl.closest('[ebsid]');
        let clickedCtrl = $clickedColTile[0].hasAttribute('eb-root-obj-container') ? this.rootContainerObj : this.rootContainerObj.Controls.GetByName($clickedColTile.attr('ebsid'));

        if (clickedCtrl.IsContainer) {
            clickedCtrl.Controls.$values.push(copiedCtrl);
            ($clickedEl.hasClass('ebcont-inner') ? $clickedEl : $clickedEl.find('.ebcont-inner')).append($copiedCtrl);
        }
        else {
            if (this.rootContainerObj.Controls.GetByName($clickedColTile.attr('ebsid'))) {
                this.rootContainerObj.Controls.InsertAfter(clickedCtrl, copiedCtrl);
                $copiedCtrl.insertAfter($clickedColTile);
            }
        }

        let flatControlsModified = [...getAllctrlsFrom(copiedCtrl)];
        for (let i = 0; i < flatControlsModified.length; i++) {
            this.updateControlUI(flatControlsModified[i].EbSid_CtxId);
        }
        this.pushElmsToDraggable($copiedCtrl);
        EbBlink(copiedCtrl, `[ebsid='${copiedCtrl.EbSid_CtxId}']`);
    };

    this.pushElmsToDraggable = function ($copiedCtrl) {
        $copiedCtrl.closestInners('.ebcont-inner').each(function (i, el) {
            if (this.DraggableConts.contains(el))
                console.eb_log('already contains')
            else
                this.DraggableConts.push(el);
        }.bind(this));

    };

    this.dropedCtrlInit = function ($ctrl, type, id) {
        $ctrl.attr("tabindex", "1");
        this.ctrlOnClickBinder($ctrl, type);
        $ctrl.on("focus", this.controlOnFocus.bind(this));
        $ctrl.attr("id", "cont_" + id).attr("ebsid", id);
        $ctrl.attr("eb-type", type);
    };

    this.getCopied$Ctrl = function (ModifiedCtrl, OriginalCtrl, ctrl_obj_string) {
        let flatControlsModified = getAllctrlsFrom(ModifiedCtrl);
        let flatControlsOriginal = [...getAllctrlsFrom(OriginalCtrl)];
        let $ctrl = $(ctrl_obj_string).removeClass('context-menu-active').clone();
        for (let i = 0; i < flatControlsModified.length; i++) {
            let ctrlModified = flatControlsModified[i];
            let $_ctrl = (i === 0) ? $ctrl : $ctrl.find(`[ebsid='${flatControlsOriginal[i].EbSid_CtxId}']`);

            this.ctrlOnClickBinder($_ctrl, type);
            $_ctrl.on("focus", this.controlOnFocus.bind(this));
            $_ctrl.attr("id", "cont_" + ctrlModified.EbSid_CtxId).attr("ebsid", ctrlModified.EbSid_CtxId);
        }
        return $ctrl;
    }

    this.getCopiedCtrl = function (control) {
        let flatControls = getAllctrlsFrom(control);
        for (let i = 0; i < flatControls.length; i++) {
            let _ctrl = flatControls[i];
            let copyStr = this.getNxtCtrlCopyStr(_ctrl);
            _ctrl.Name = _ctrl.Name + copyStr.toLowerCase();
            _ctrl.EbSid_CtxId = _ctrl.EbSid_CtxId + copyStr;
            _ctrl.EbSid = _ctrl.EbSid + copyStr;
            _ctrl.Label = (_ctrl.Label || '') + copyStr;
            _ctrl.Id = (_ctrl.Id || '') + copyStr;
            if (_ctrl.IsContainer)
                _ctrl.Controls = new EbControlCollection(_ctrl.Controls);
        }
        return control;
    }

    this.getNxtCtrlCopyStr = function (ctrl) {
        let num = 1;
        let copyStr = '';
        for (let i = 0; i < 1000; i++) {
            copyStr = (i === 0 ? '' : 'Copy' + i);
            let ifCtrl = this.rootContainerObj.Controls.GetByName(ctrl.EbSid_CtxId + copyStr);
            if (!ifCtrl) {
                num = i;
                break;
            }
        }
        return copyStr;
    };

    this.controlOnFocus = function (e) {
        e.stopPropagation();
        let $e = $(e.target);
        if (this.curControl && this.curControl.attr("ebsid") === $(e.target).attr("ebsid"))
            return;
        if ($e.attr("id") === this.formId) {
            this.curControl = $e;
            this.CreatePG(this.rootContainerObj);
            return;
        }
        else
            this.curControl = $e.closest(".Eb-ctrlContainer");
        let ebsid = this.curControl.attr("ebsid");
        this.CreatePG(this.rootContainerObj.Controls.GetByName(ebsid));
        //  this.PGobj.ReadOnly();
    }.bind(this);

    this.InitContCtrl = function (ctrlObj, $ctrl) {///////////////////////////////////////////////////////////////////////////////////////////////////
        let parentObj = this.rootContainerObj.Controls.getParent(ctrlObj);
        ctrlObj.TableName = parentObj.TableName;
        ctrlObj.isTableNameFromParent = true;
        if (ctrlObj.ObjType === "TableLayout") {
            this.makeTdsDropable_Resizable();
            let tds = $ctrl.find("td");
            $.each(ctrlObj.Controls.$values, function (i, td) {
                $(tds[i]).attr("ebsid", td.EbSid).attr("id", td.EbSid);
            });
        }
        else if (ctrlObj.ObjType === "TabControl") {
            let tapPanes = $ctrl.find(".tab-pane");
            let tapBtns = $ctrl.find("ul.nav-tabs a");
            $.each(ctrlObj.Controls.$values, function (i, pane) {
                $(tapPanes[0]).attr("ebsid", pane.EbSid).attr("id", pane.EbSid);
                $(tapBtns[0]).attr("href", "#" + pane.EbSid).find("span").text(pane.Name).closest("li").attr("li-of", pane.EbSid).attr("ebsid", pane.EbSid);
            });
            this.makeTabsDropable();
        }
        else if (ctrlObj.ObjType === "GroupBox") {
            let el = $(`[ebsid=${ctrlObj.EbSid}] .group-box`)[0];
            this.makeElementDropable(el);
        }
    };

    this.makeGBsDropable = function () {
        $.each($("#" + this.formId + " .group-box"), function (i, el) {
            this.makeElementDropable(el);
        }.bind(this));
    };

    this.makeDataObjectDropable = function () {
        $.each($("#" + this.formId + " .Dt-Rdr-col-cont"), function (i, el) {
            this.makeElementDropable(el);
        }.bind(this));
    }

    this.makeElementDropable = function (el) {
        if (this.drake) {
            if (!this.drake.containers.contains(el)) {
                this.drake.containers.push(el);
            }
        }
    };

    this.makeTabsDropable = function () {
        $.each($("#" + this.formId + " .tab-pane"), function (i, el) {
            this.makeElementDropable(el);
        }.bind(this));
    };

    this.makeTdsDropable_Resizable = function () {
        $.each($(".ebResizable"), function (i, el) {
            let $e = $(el);
            this.pushToDragables($($e.children()[0]));
            if (($(".ebResizable").length - 1) !== i)
                this.makeTdResizable($e);
        }.bind(this));
    };

    this.makeTdResizable = function ($el) {
        $el.resizable({
            handles: 'e',
            stop: this.tdDragStop.bind(this)
        });
    }.bind(this);

    this.tdDragStop = function (event, ui) {
        let $curTd = ui.element;
        let $tbl = $curTd.closest("table");
        let $tableCont = $tbl.closest(".Eb-ctrlContainer");
        let tblWidth = $tbl.outerWidth();
        let curTdWidth = $curTd.outerWidth();
        let curTdWidthPerc = (curTdWidth / tblWidth) * 100;
        let cuTdobj = this.rootContainerObj.Controls.GetByName($curTd.attr("ebsid"));
        cuTdobj.WidthPercentage = curTdWidthPerc;
        cuTdobj.Width = parseInt(curTdWidthPerc);
        $(event.target).css("width", curTdWidthPerc.toString() + "%");
    };

    this.pushToDragables = function ($e) {
        let el = $e[0];
        if (this.drake) {
            if (!this.drake.containers.contains(el)) {
                this.drake.containers.push(el);
            }
        }
    };

    this.InitEditModeCtrls = function (editModeObj) {
        let ObjCopy = { ...editModeObj };
        let newObj = new this.EbObjects["Eb" + editModeObj.ObjType](editModeObj.EbSid, editModeObj);
        this.rootContainerObj = newObj;
        this.rootContainerObj.Name = ObjCopy.Name;
        this.rootContainerObj.EbSid_CtxId = ObjCopy.EbSid_CtxId;

        commonO.Current_obj = this.rootContainerObj;
        this.EbObject = this.rootContainerObj;

        // convert json to ebobjects
        Proc(editModeObj, this.rootContainerObj);
        $(".Eb-ctrlContainer").each(function (i, el) {
            if (el.getAttribute("childOf") === 'EbUserControl')
                return true;
            this.initCtrl(el);
        }.bind(this));
        $(".form-render-table-Td").each(function (i, el) {// td styles seprately
            if (el.getAttribute("childOf") === 'EbUserControl')
                return true;
            this.updateControlUI(el.getAttribute("ebsid"));
        }.bind(this));
        $("#" + this.rootContainerObj.EbSid).focus();
    };

    this.initCtrl = function (el) {
        let $el = $(el);
        let type = $el.attr("ctype").trim();
        let attr_ebsid = $el.attr("ebsid");
        let attrEbsid_Dgt = parseInt(attr_ebsid.match(/\d+$/)[0]);
        let attrEbsid_Except_Dgt = attr_ebsid.substring(0, attr_ebsid.length - attrEbsid_Dgt.toString().length);

        let ctrlCount = this.controlCounters[type + "Counter"];
        this.controlCounters[type + "Counter"] = (attrEbsid_Dgt > ctrlCount) ? attrEbsid_Dgt : ctrlCount;
        let ebsid = attrEbsid_Except_Dgt + attrEbsid_Dgt;// inc counter
        $el.attr("tabindex", "1");
        this.ctrlOnClickBinder($el, type);
        $el.on("focus", this.controlOnFocus.bind(this));
        $el.attr("eb-type", type);
        $el.attr("ebsid", ebsid);
        if (type !== "UserControl")
            this.updateControlUI(ebsid);
        if (type == "BluePrint") {
            let ctrlobjt = this.rootContainerObj.Controls.GetByName(ebsid);
            var blueprintModaledt = new blueprintModalfn(ctrlobjt);
        }
        else if (type == "WizardControl") {
            let ctrlobjt = this.rootContainerObj.Controls.GetByName(ebsid);
            this.initWizard(ctrlobjt);
        }
        else if (type === "SimpleSelect" || type === "BooleanSelect") {
            $el.find(".selectpicker").selectpicker();
            this.updateControlUI(ebsid);
        }
        this.PGobj.addToDD(this.rootContainerObj.Controls.GetByName(ebsid));
    };

    this.wizStepDelValidationOK = function (Obj) {
        if ((Obj.ObjType === "WizardControl" || Obj.ObjType === "TabControl") && Obj.Controls.$values.length === 1) {
            this.EbAlert.alert({
                id: Obj.EbSid + 'tabremove',
                head: Obj.ObjType + " need atleast a single step.",
                body: "Try removing control",
                type: "warning",
                delay: 2500
            });
            return false;
        }
        return true;
    }.bind(this);

    this.wizAddClick = function (e) {////////////////////////////////
        let $ControlTile = $(e.target).closest(".Eb-ctrlContainer");
        let TabEdsid = $ControlTile.attr("ebsid");
        let numStr = this.PGobj.CXVE.getMaxNumberFromItemName($ControlTile.find(".RenderAsWizard > ul > li"));//PrevObjEbsid.substr(PrevObjEbsid.length - 3).replace(/[^0-9]/g, '');

        let lastNum = parseInt(numStr) || 0;
        let ShortName = "Step" + (lastNum + 1);
        let TabObj = this.rootContainerObj.Controls.GetByName(TabEdsid);
        let ebsid = TabEdsid + "_" + ShortName;
        let newObj = new this.EbObjects["EbWizardStep"](ebsid);
        newObj.Name = ShortName;
        newObj.Title = ShortName;

        this.PGobj.setObject(TabObj, this.AllMetas["EbWizardControl"]);

        TabObj.Controls.$values.push(newObj);
        this.addWizardStep(this.PGobj.PropsObj, "Controls", "val", newObj);

    }.bind(this);


    this.contTabDelClick = function (e) {/////////////////////////
        let $e = $(e.target).closest("li");
        let PaneEbsid = $e.attr("ebsid");

        let $ControlTile = $(e.target).closest(".Eb-ctrlContainer");
        let TabEdsid = $ControlTile.attr("ebsid");

        let TabObj = this.rootContainerObj.Controls.GetByName(TabEdsid);
        let PaneObj = this.rootContainerObj.Controls.GetByName(PaneEbsid);
        let ctrlMeta = this.AllMetas["EbTabControl"];
        this.PGobj.setObject(TabObj, ctrlMeta);

        let index = TabObj.Controls.$values.indexOf(PaneObj);
        if (!this.wizStepDelValidationOK(TabObj))
            return;

        let delobj = TabObj.Controls.$values.splice(index, 1)[0];
        if (TabObj.ObjType === "WizardControl") {
            this.RemoveWizardStep(this.PGobj.PropsObj, "Controls", "val", delobj);
        }
        else {
            this.RemoveTabPane(this.PGobj.PropsObj, "Controls", "val", delobj);
        }
    }.bind(this);

    this.initWizard = function (ctrl) {
        let $Tab = $(`#cont_${ctrl.EbSid_CtxId}>.RenderAsWizard`);
        if ($Tab.length === 0)
            return false;
        $Tab.smartWizard({
            theme: 'arrows',
            enableUrlHash: false, // Enable selection of the step based on url hash
            transition: {
                animation: 'fade', // Effect on navigation, none/fade/slide-horizontal/slide-vertical/slide-swing
                speed: '400', // Transion animation speed
                easing: '' // Transition animation easing. Not supported without a jQuery easing plugin
            },
            toolbar: {
                showNextButton: false, // show/hide a Next button
                showPreviousButton: false, // show/hide a Previous button
            },
            anchor: {
                anchorClickable: true, // Enable/Disable anchor navigation
                enableAllAnchors: true, // Activates all anchors clickable all times
                markDoneStep: false, // Add done state on navigation
                enableNavigationAlways: true
            },
            keyboard: {
                keyNavigation: false, // Enable/Disable keyboard navigation(left and right keys are used if enabled)
            }
        });
        $Tab.off("click.wiz").on("click.wiz", ".ebtab-close-btn", this.contTabDelClick.bind(this));
        $Tab.children(".wiz-addbtn").on("click.wiz", this.wizAddClick.bind(this));
    }.bind(this);

    this.ctrlOnClickBinder = function ($ctrl, type) {
        if (type === "TabControl")
            $ctrl.on("click", function myfunction() {
                let $e = $(event.target);
                if ($e.closest(".cont-prop-btn").length === 1 || $e.closest(".ebtab-add-btn").length === 1)// to skip event.stopPropagation()
                    return;

                if ($e.closest("a").attr("data-toggle") !== "tab")
                    event.stopPropagation();
                $(event.target).closest(".Eb-ctrlContainer").focus();
            });
        else
            $ctrl.on("click", function myfunction() {
                let $e = $(event.target);
                if ($e.closest(".cont-prop-btn").length === 1)// to skip event.stopPropagation()
                    return;

                event.stopPropagation();
                if ($e.attr("class") !== "eb-lbltxtb")
                    $(this).focus();
            });
    };

    this.updateControlUI = function (ebsid, type) {
        let obj = this.rootContainerObj.Controls.GetByName(ebsid);
        let _type = obj.ObjType;
        $.each(obj, function (propName, propVal) {
            let meta = getObjByval(this.AllMetas["Eb" + _type], "name", propName);
            if (meta && meta.IsUIproperty)
                this.updateUIProp(propName, ebsid, _type);
        }.bind(this));
    };

    this.updateUIProp = function (propName, id, type) {
        let obj = this.rootContainerObj.Controls.GetByName(id);
        let NSS = getObjByval(this.AllMetas["Eb" + type], "name", propName).UIChangefn;
        if (NSS) {
            let NS1 = NSS.split(".")[0];
            let NS2 = NSS.split(".")[1];
            EbOnChangeUIfns[NS1][NS2](id, obj);
        }
    };

    this.PGobj = new Eb_PropertyGrid({
        id: "pgWraper",
        wc: this.wc,
        cid: this.cid,
        $extCont: $(".property-grid-cont"),
        isDraggable: true
    });

    this.PGobj.CXVE.onRemoveCEValidationOK = this.wizStepDelValidationOK;

    //Edit mode
    if (this.EbObject) {
        this.isEditMode = true;
        this.InitEditModeCtrls(this.EbObject);
    }
    if (this.EbObject === null) {
        this.rootContainerObj = new this.EbObjects["Eb" + this.builderType](this.formId);
        commonO.Current_obj = this.rootContainerObj;
        this.EbObject = this.rootContainerObj;
    }

    this.curControl = null;
    this.drake = null;

    this.CreatePG = function (control) {
        console.log("CreatePG called for:" + control.Name);
        this.$propGrid.css("visibility", "visible");
        this.PGobj.setObject(control, this.AllMetas["Eb" + this.curControl.attr("eb-type")]);////
    };

    this.saveObj = function () {
        this.PGobj.getvaluesFromPG();
    };

    this.onDragFn = function (el, source) {
        let $source = $(source);
        //if drag start within the form
        if ($source.attr("ebclass") !== this.toolContClass) {
            let id = $(el).closest(".Eb-ctrlContainer").attr("ebsid");
            this.movingObj = this.rootContainerObj.Controls.PopByName(id);
            if ($source.closest(".ebcont-ctrl").attr("ctype") === "TabPane")
                this.adjustPanesHeight($source);
        }
        else
            this.movingObj = null;
    };// start

    this.onDragendFn = function (el) {
        let $sibling = $(el).next();
        let $target = $(el).parent();
        if (this.movingObj) {
            //Drag end with in the form
            if ($target.attr("ebclass") !== this.toolContClass) {
                if ($sibling.attr("id")) {
                    //let idx = $sibling.index() - 1;
                    let idx = $(el).parent().children('.Eb-ctrlContainer').index(el);
                    this.rootContainerObj.Controls.InsertAt(idx, this.movingObj);
                }
                else {
                    this.rootContainerObj.Controls.Append(this.movingObj);
                }
                this.saveObj();
                $(el).off("focus").on("focus", this.controlOnFocus.bind(this));
            }
        }
    };

    this.onDropFn = function (el, target, source, sibling) {
        if (el.contains(target))
            return;
        let $target = $(target);
        if (target) {
            //drop from toolbox to form
            if ($(source).attr("ebclass") === this.toolContClass) {
                let $el = $(el);
                let type = $el.attr("eb-type").trim();
                let ebsid = type + ++(this.controlCounters[type + "Counter"]);
                let $sibling = $(sibling);
                $el.remove();
                let ctrlObj = new this.EbObjects["Eb" + type](ebsid);
                let $ctrl = ctrlObj.$Control;

                if (type === "UserControl") {///user control refid set on ctrlobj
                    ctrlObj["RefId"] = $(el).find("option:selected").attr('refid');
                    this.AsyncLoadHtml(ctrlObj["RefId"], "cont_" + ctrlObj["EbSid"]);
                }
                else if (type === "Approval") {
                    ctrlObj.TableName = this.rootContainerObj.TableName + "_approval";
                    this.ApprovalCtrl = ctrlObj;
                }
                else if (type === "Review") {
                    ctrlObj.TableName = this.rootContainerObj.TableName + "_reviews";
                    this.ReviewCtrl = ctrlObj;
                }
                else if (type === "ProvisionLocation") {
                    this.ProvisionLocationCtrl = ctrlObj;
                }
                else if (type === "SimpleSelect" || type === "BooleanSelect") {
                    $ctrl.find(".selectpicker").selectpicker();
                }


                this.dropedCtrlInit($ctrl, type, ebsid);
                if (sibling) {
                    $ctrl.insertBefore($sibling);
                    this.rootContainerObj.Controls.InsertBefore(this.rootContainerObj.Controls.GetByName($sibling.attr('ebsid')), ctrlObj);
                }
                else {
                    $target.append($ctrl);
                    this.rootContainerObj.Controls.Append(ctrlObj);
                }

                if (type === "DataObject" && this.builderType === "UserControl") {
                    //this.DraggableConts.push(document.querySelectorAll(".Dt-Rdr-col-cont")[1]);

                    this.DraggableConts.push($(`#cont_${ctrlObj.EbSid_CtxId} .Dt-Rdr-col-cont`)[0]);

                }
                else if (type === "BluePrint") {
                    var blueprintModal = new blueprintModalfn(ctrlObj);

                }
                else if (type == "WizardControl") {
                    this.initWizard(ctrlObj);
                }

                $ctrl.focus();
                ctrlObj.Label = ebsid + " Label";
                ctrlObj.HelpText = "";
                if (ctrlObj.IsContainer)
                    this.InitContCtrl(ctrlObj, $ctrl);
                $ctrl.focus();
                this.updateControlUI(ebsid);
            }
            //drop from blk-cont to form(Eb Data object control)
            if ($(source).attr("ebclass") === "blk-cont") {
                let $el = $(el);
                let type = $el.attr("eb-type").trim();
                let CntrlName = $el.attr("data-ctrl").trim();
                let ColumnlName = $el.attr("data-column").trim();
                let ebsid = type + ++(this.controlCounters[type + "Counter"]);
                let $sibling = $(sibling);
                $el.remove();
                let ctrlObj = new this.EbObjects["Eb" + type](ebsid);
                ctrlObj.DataObjCtrlName = CntrlName;
                ctrlObj.DataObjColName = ColumnlName;
                ctrlObj.Label = ColumnlName;
                let $ctrl = ctrlObj.$Control;

                if (type === "UserControl") {///user control refid set on ctrlobj
                    ctrlObj["RefId"] = $(el).find("option:selected").attr('refid');
                    this.AsyncLoadHtml(ctrlObj["RefId"], "cont_" + ctrlObj["EbSid"]);
                }
                else if (type === "Approval") {
                    ctrlObj.TableName = this.rootContainerObj.TableName + "_reviews";
                    this.ApprovalCtrl = ctrlObj;
                }
                else if (type === "Review") {
                    ctrlObj.TableName = this.rootContainerObj.TableName + "_reviews";
                    this.ReviewCtrl = ctrlObj;
                }
                else if (type === "ProvisionLocation") {
                    this.ProvisionLocationCtrl = ctrlObj;
                }
                else if (type === "SimpleSelect" || type === "BooleanSelect") {
                    $ctrl.find(".selectpicker").selectpicker();
                }

                this.dropedCtrlInit($ctrl, type, ebsid);
                if (sibling) {
                    $ctrl.insertBefore($sibling);
                    this.rootContainerObj.Controls.InsertBefore(this.rootContainerObj.Controls.GetByName($sibling.attr('ebsid')), ctrlObj);
                }
                else {
                    $target.append($ctrl);
                    this.rootContainerObj.Controls.Append(ctrlObj);
                }

                if (type === "DataObject" && this.builderType === "UserControl") {
                    this.DraggableConts.push(document.querySelectorAll(".Dt-Rdr-col-cont")[0]);
                }

                $ctrl.focus();

                ctrlObj.HelpText = "";
                if (ctrlObj.IsContainer)
                    this.InitContCtrl(ctrlObj, $ctrl);
                this.updateControlUI(ebsid);
            }


            let $parent = $target.closest(".ebcont-ctrl");
            if ($parent.attr("ctype") === "TabPane")
                this.adjustPanesHeight($parent);
        }
    };

    this.onClonedFn = function (clone, original, type) {
        if ($(original).attr("eb-type") === "UserControl" && type === "copy") {
            $(clone).find("select").val($(original).find("option:selected").val());
        }
    };

    this.AsyncLoadHtml = function (refId, divId) {
        setTimeout(function () {
            $("#" + divId).append(`<i class="fa fa-spinner fa-pulse" aria-hidden="true"></i>`);
        }, 1);

        $.ajax({
            type: "POST",
            url: "../WebForm/getDesignHtml",
            data: { refId: refId },
            success: function (html) {
                $("#" + divId).html(html);
            }
        });
    };

    this.GetLocationConfig = function (_ctrl) {
        if (_ctrl.hasOwnProperty('_locationConfig'))
            return;
        $.ajax({
            type: "POST",
            url: "../WebForm/GetLocationConfig",
            data: {},
            success: function (ctrl, configObj) {
                ctrl._locationConfig = JSON.parse(configObj);
                $.each(ctrl._locationConfig, function (i, config) {
                    let newo = new this.EbObjects.UsrLocField(config.Name.replace(/\s/g, '').toLowerCase());
                    newo.DisplayName = config.Name;
                    newo.IsRequired = config.IsRequired;
                    newo.Type = config.Type;
                    ctrl.Fields.$values.push(newo);
                });
                //EbOnChangeUIfns.EbProvisionLocation.mapping(ctrl.EbSid, ctrl);
            }.bind(this, _ctrl)
        });
    };

    this.adjustPanesHeight = function ($target) {
        let parent = $target.attr("eb-form") ? this.rootContainerObj : this.rootContainerObj.Controls.GetByName($target.attr("ebsid"));
        let tabControl = this.rootContainerObj.Controls.GetByName($target.closest(".Eb-ctrlContainer").attr("ebsid"));
        EbOnChangeUIfns.EbTabControl.adjustPanesHeightToHighest(tabControl.EbSid, tabControl);
    };

    //this.controlCloseOnClick = function (e) {
    //    var ControlTile = $(e.target).parent().parent();
    //    var id = ControlTile.attr("id");
    //    this.PGobj.removeFromDD(this.rootContainerObj.Controls.GetByName(id).EbSid);
    //    this.PGobj.clear();
    //    this.rootContainerObj.Controls.DelByName(id);
    //    ControlTile.siblings().focus();
    //    ControlTile.remove();
    //    e.preventDefault();
    //    this.saveObj();
    //};

    //this.initCtrl = function (el) {
    //    var $EbCtrl = $(el);
    //    var $ControlTile = $("<div class='controlTile' tabindex='1' onclick='event.stopPropagation();$(this).focus()'></div>");
    //    var type = $EbCtrl.attr("Ctype").trim();// get type from Eb-ctrlContainer html
    //    var id = type + (this.controlCounters[type + "Counter"])++;
    //    $ControlTile.attr("onfocusout", "$(this).children('.ctrlHead').hide()").on("focus", this.controlOnFocus.bind(this));
    //    $ControlTile.attr("eb-type", type).attr("id", id);
    //    $(".controls-dd-cont select").append("<option id='SelOpt" + id + "'>" + id + "</option>");//need to test///////////////
    //    $ControlTile.find(".close").on("click", this.controlCloseOnClick.bind(this));
    //    $EbCtrl.wrap($ControlTile);
    //    $("<div class='ctrlHead' style='display:none;'><i class='fa fa-arrows moveBtn' aria-hidden='true'></i><a href='#' class='close' style='cursor:default' data-dismiss='alert' aria-label='close' title='close'>×</a></div>").insertBefore($EbCtrl);
    //};

    this.CreateRelationString = function () { };

    this.movesfn = function (el, source, handle, sibling) {
        if ($(handle).hasClass("ui-resizable-handle"))//if handle is resizable's handle of table layout
            return false;
        return true;
    };

    this.acceptFn = function (el, target, source, sibling) {
        if (el.contains(target))
            return;

        if ($(source).hasClass(this.toolContClass) && (
            el.getAttribute("eb-type") === "Approval" && this.ApprovalCtrl ||
            el.getAttribute("eb-type") === "Review" && this.ReviewCtrl
        )
        ) {
            this.EbAlert.clearAlert("reviewCtrl");
            this.EbAlert.alert({
                id: "reviewCtrl",
                head: "Form already contains a Review control.",
                body: "You cannot add more than one approval control into the form",
                type: "warning",
                delay: 3000
            });
            return false;
        }

        if ($(source).hasClass(this.toolContClass) && el.getAttribute("eb-type") === "ProvisionLocation" && this.ProvisionLocationCtrl) {
            this.EbAlert.clearAlert("mngLocCtrl");
            this.EbAlert.alert({
                id: "mngLocCtrl",
                head: "Form already contains a provision location control.",
                body: "You cannot add more than one provision location control into the form",
                type: "warning",
                delay: 3000
            });
            return false;
        }

        let _class = $(target).attr("ebclass");
        if (_class !== this.toolContClass && _class !== "blk-cont")
            return true;
        else
            return false;

        //if ($(source).attr("id") === this.primitiveToolsId && $(target).attr("id") === this.primitiveToolsId) {
        //    return false;
        //}
        //// allow copy except toolbox
        //if ($(source).attr("id") === this.primitiveToolsId && $(target).attr("id") !== this.primitiveToolsId) {
        //    return true;
        //}
        //// sortable with in the container
        //if ($(source).attr("id") !== this.primitiveToolsId && source === target) {
        //    return true;
        //}
        //else {
        //    return true;
        //}

    };

    this.drake = new dragula(this.DraggableConts, {
        revertOnSpill: true,
        copy: function (el, source) { return (source.className.includes('tool-sec-cont') || source.className.includes('Dt-Rdr-col-cont')); },
        copySortSource: true,
        moves: this.movesfn.bind(this),
        accepts: this.acceptFn.bind(this)
    });

    this.addTabPane = function (SelectedCtrl, prop, val, addedObj) {
        let id = SelectedCtrl.EbSid;
        let $ctrl = $("#cont_" + id);
        let $tabMenu = $(`<li li-of="${addedObj.EbSid}" ebsid="${addedObj.EbSid}">
                            <a data-toggle="tab" class="ppbtn-cont" href="#${addedObj.EbSid}">
                                <span class='eb-label-editable'>${addedObj.Name}</span>
                                <input id='${addedObj.EbSid}lbltxtb' class='eb-lbltxtb' type='text'/>
                                <div class='ebtab-close-btn eb-fb-icon' title='Remove'><i class='fa fa-times' aria-hidden='true'></i></div>
                                <div ctrl-ebsid='${addedObj.EbSid}' class='cont-prop-btn'><i class='fa fa-ellipsis-v' aria-hidden='true'></i></div>
                            </a>
                            <div class='ebtab-add-btn eb-fb-icon'><i class='fa fa-plus' aria-hidden='true'></i></div>
                        </li>`);
        let $tabPane = $(`<div id="${addedObj.EbSid}" ctype="${addedObj.ObjType}" ebsid="${addedObj.EbSid}" class="tab-pane fade  ebcont-ctrl"></div>`);
        $ctrl.closestInner(".nav-tabs").append($tabMenu);
        $ctrl.closestInner(".tab-content").append($tabPane);
        this.drake.containers.push($tabPane[0]);
    };

    this.addWizardStep = function (SelectedCtrl, prop, val, addedObj) {
        let id = SelectedCtrl.EbSid;
        let $wizard = $("#cont_" + id + ">.RenderAsWizard");
        let $wizMenu = $wizard.closestInner('ul>li[li-of]:first').clone();
        $wizMenu.children('a').attr('href', '#' + addedObj.EbSid_CtxId).removeClass('active');
        $wizMenu.find('.eb-label-editable').text(addedObj.Title);
        $wizMenu.attr('li-of', addedObj.EbSid_CtxId).attr('ebsid', addedObj.EbSid_CtxId);
        let $tabPane = $wizard.closestInner('.tab-content>[ctype="WizardStep"]:first').clone().empty();
        $tabPane.attr('id', addedObj.EbSid_CtxId).attr('ebsid', addedObj.EbSid_CtxId);
        $wizard.closestInner(".nav").append($wizMenu);
        $tabPane.hide();
        $wizard.closestInner(".tab-content").append($tabPane);
        let smartWizardObj = $wizard.data('smartWizard')
        smartWizardObj.steps.push($wizMenu.children('a')[0]);
        $wizMenu.children('a').on("click", smartWizardObj.nextButtonEventFun)
        this.drake.containers.push($tabPane[0]);
    };

    this.RemoveTabPane = function (SelectedCtrl, prop, val, delobj) {
        let id = SelectedCtrl.EbSid;
        let $ctrl = $("#cont_" + id);
        let $tabMenu = $ctrl.find(`[li-of=${delobj.EbSid}]`).remove();
        let $tabPane = $(`#${delobj.EbSid_CtxId}`).remove();
    };

    this.RemoveWizardStep = function (SelectedCtrl, prop, val, delobj) {
        let id = SelectedCtrl.EbSid;
        let $wizard = $("#cont_" + id + ">.RenderAsWizard");
        let smartWizardObj = $wizard.data('smartWizard')
        let $wizMenu = $wizard.find(`[li-of=${delobj.EbSid}]`);
        $wizMenu.siblings(':first').children('a').trigger('click');
        $wizMenu.remove();
        $(`#${delobj.EbSid_CtxId}`).remove();
        smartWizardObj.steps.splice(smartWizardObj.steps.toArray().indexOf($wizMenu.children('a')[0]), 1);
    };

    this.PGobj.CXVE.onAddToCE = function (prop, val, addedObj) {
        if (this.PGobj.PropsObj.ObjType === "TableLayout" && prop === "Controls") {
            let $tblTr = $(`#cont_${this.PGobj.CurObj.EbSid}>table>tbody>tr`);
            let $td = $(`<td id='@name@' ebsid='${addedObj.EbSid}' style='padding: 3px; width:auto;' class='form-render-table-Td ebResizable ebcont-ctrl ppbtn-cont'>
                            <div class='tdInnerDiv'><div ctrl-ebsid='${addedObj.EbSid}' class='cont-prop-btn'><i class='fa fa-ellipsis-v' aria-hidden='true'></i></div></div>
                       </td>`);
            $tblTr.append($td);
            this.pushToDragables($($td.children()[0]));
            this.makeTdResizable($td.prev("td"));
        }
        else if (this.PGobj.PropsObj.ObjType === "TabControl" && prop === "Controls") {
            //addedObj.EbSid = parent.EbSid + addedObj.EbSid;
            addedObj.Name = addedObj.Name.substr(-5);//furthure shorten name 
            this.addTabPane(this.PGobj.PropsObj, prop, val, addedObj);
        }
        else if (this.PGobj.PropsObj.ObjType === "WizardControl" && prop === "Controls") {
            //addedObj.EbSid = parent.EbSid + addedObj.EbSid;
            addedObj.Name = addedObj.Name.substr(-5);//furthure shorten name 
            this.addWizardStep(this.PGobj.PropsObj, prop, val, addedObj);
        }
    }.bind(this);

    this.PGobj.PropertyChanged = function (PropsObj, CurProp) {
        if (CurProp === "TableName" && PropsObj.IsContainer) {
            let TblName = PropsObj.TableName;
            PropsObj.isTableNameFromParent = false;
            this.updateChildTablesName(PropsObj, TblName);
        }
        let Refid = PropsObj[CurProp];
        let ObjType = PropsObj.ObjType;
        if (ObjType === "DataObject" && CurProp === "DataSource") {
            $.LoadingOverlay('show');
            $.ajax({
                type: "POST",
                url: "../DS/GetColumns4Control",
                data: { DataSourceRefId: Refid },
                success: function (Columns) {
                    PropsObj["Columns"] = JSON.parse(Columns);
                    $.LoadingOverlay('hide');
                    this.updateControlUI(PropsObj.EbSid_CtxId);
                }.bind(this)
            });
        }


        //if (ObjType === "WebForm" && CurProp === "DataPushers") {
        //    $.LoadingOverlay('show');
        //    $.ajax({
        //        type: "POST",
        //        url: "../WebForm/GetDataPusherJson",
        //        data: { RefId: PropsObj.DataPushers.$values[0].FormRefId },
        //        success: function (Json) {
        //            console.log(Json);
        //            $.LoadingOverlay('hide');
        //        }.bind(this)
        //    });
        //}


    }.bind(this);

    this.updateChildTablesName = function (PropsObj, TblName) {
        for (var i = 0; i < PropsObj.Controls.$values.length; i++) {
            let ctrl = PropsObj.Controls.$values[i];
            if (ctrl.IsContainer && ctrl.isTableNameFromParent) {
                ctrl.TableName = TblName;
                if (ctrl.isTableNameFromParent)
                    this.updateChildTablesName(ctrl, TblName);
            }
        }
    };

    this.lbltxtbKeyUp = function (e) {

        let $e = $(event.target);
        let count = $e.val().length;
        let width = "15px";
        //if (count !== 0)
        //    width = (count * 6.4 + 8) + "px";

        //$e.css("width", width);

        let val = $e.val();
        let $colTile = $e.closest(".Eb-ctrlContainer");
        let ebsid = $colTile.attr("ebsid");
        let ctrlType = $colTile.attr("eb-type");
        let ctrlMeta = this.AllMetas["Eb" + ctrlType];
        if (ctrlType === "TabControl" || ctrlType === "WizardControl") {
            ebsid = $e.closest("li").attr("ebsid");
            let ctrl = this.rootContainerObj.Controls.GetByName(ebsid);
            let paneMeta = this.AllMetas["Eb" + ctrl.ObjType];
            ctrl["Title"] = val;
            this.PGobj.execUiChangeFn(getObjByval(paneMeta, "name", "Title").UIChangefn, ctrl);
        }
        if (ctrlType === "DataGrid") {
            if ($e.closest("th").length === 1)
                ebsid = $e.closest("th").attr("ebsid");// for TH label
            else
                ebsid = $e.closest(".Eb-ctrlContainer").attr("ebsid");// for DG label
            let ctrl = this.rootContainerObj.Controls.GetByName(ebsid);
            let ColMeta = this.AllMetas["Eb" + ctrl.ObjType];
            ctrl["Title"] = val;

            if ($e.closest("th").length === 1)
                this.PGobj.execUiChangeFn(getObjByval(ColMeta, "name", "Title").UIChangefn, ctrl);// for TH label
            else
                this.PGobj.changePropertyValue("Label", val);// for DG label
        }
        else {
            let ctrl = this.rootContainerObj.Controls.GetByName(ebsid);
            if (this.PGobj.CurObj !== ctrl)
                this.PGobj.setObject(ctrl, ctrlMeta);
            this.PGobj.changePropertyValue("Label", val);
        }

    };

    this.contPropBtnClick = function (e) {
        $(".stickBtn").hide(); // hard coding temp2 23-08 -19
        $("#form-buider-propGrid").show();

        let $ControlTile = $(e.target).closest(".Eb-ctrlContainer");
        let ebsid = $ControlTile.attr("ebsid");
        let ctrlType = $ControlTile.attr("eb-type");
        let ctrl = this.rootContainerObj.Controls.GetByName(ebsid);
        let ctrlMeta = this.AllMetas["Eb" + ctrlType];
        this.PGobj.setObject(ctrl, ctrlMeta);
        let colEbsid = $(e.target).closest(`[ctrl-ebsid]`).attr("ctrl-ebsid");
        this.PGobj.CXVE.colTile2FocusSelec = `[ebsid=${colEbsid}].colTile`;
        $(`#${this.PGobj.wraperId} [for='Controls']`).trigger("click");

    }.bind(this);

    this.contTabAddClick = function (e) {////////////////////////////////
        let $ControlTile = $(e.target).closest(".Eb-ctrlContainer");
        let TabEdsid = $ControlTile.attr("ebsid");
        let PrevObjEbsid = $ControlTile.find(".tab-btn-cont > ul > li:last-child").attr("ebsid");


        let numStr = this.PGobj.CXVE.getMaxNumberFromItemName($ControlTile.find(".tab-btn-cont > ul > li"));//PrevObjEbsid.substr(PrevObjEbsid.length - 3).replace(/[^0-9]/g, '');

        let lastNum = parseInt(numStr) || 0;
        let nextCount = lastNum + 1;
        let ShortName = "Pane" + nextCount;

        let ebsid = TabEdsid + "_" + ShortName;

        let newObj = new this.EbObjects["EbTabPane"](ebsid);

        newObj.Name = ShortName;
        newObj.Title = ShortName;

        let TabObj = this.rootContainerObj.Controls.GetByName(TabEdsid);


        let ctrlMeta = this.AllMetas["EbTabControl"];
        this.PGobj.setObject(TabObj, ctrlMeta);

        TabObj.Controls.$values.push(newObj);

        this.addTabPane(this.PGobj.PropsObj, "Controls", "val", newObj);

    }.bind(this);

    this.ctrlLblDblClick = function (e) {
        let $e = $(event.target);
        $e.hide();
        if ($e.parent().attr("data-toggle") === "tab" || $e.parent().attr("data-toggle") === "wizard") {
            $e.closest("li").find(".ebtab-close-btn").hide();
            $e.siblings(".eb-lbltxtb").val($e.text()).show().select();
        }
        else if ($e.hasClass('grid-col-title')) {
            $e.siblings(".eb-lbltxtb").val($e.text()).show().select();
        }
        else {
            $e.siblings(".eb-lbltxtb").val($e.text()).show().select();
        }
    };

    this.lbltxtbBlur = function (e) {
        $e = $(event.target);
        $e.hide();

        if ($e.parent().attr("data-toggle") === "tab" || $e.parent().attr("data-toggle") === "wizard") {
            $e.closest('li').find(".eb-label-editable").show();
            $e.siblings(".ebtab-close-btn").show();
        }
        else if ($e.siblings('.grid-col-title').length === 1) {
            $e.siblings('.grid-col-title').text($e.val()).show().select();
        }
        else
            $e.siblings("[ui-label]").show();
    };

    this.PGobj.CXVE.onRemoveFromCE = function (prop, val, delobj) {
        if (this.PGobj.PropsObj.ObjType === "TableLayout" && prop === "Controls")
            alert();
        else if (this.PGobj.PropsObj.ObjType === "TabControl" && prop === "Controls")
            this.RemoveTabPane(this.PGobj.PropsObj, prop, val, delobj);
        else if (this.PGobj.PropsObj.ObjType === "WizardControl" && prop === "Controls")
            this.RemoveWizardStep(this.PGobj.PropsObj, prop, val, delobj);
    }.bind(this);

    this.keyUp = function (e) {
        if (e.keyCode === 46) {// if delete key
            let $e = $(e.target);
            if ($e.hasClass("Eb-ctrlContainer")); {
                let ebsid = $e.attr("ebsid");
                let ControlTile = $(`#cont_${ebsid}`).closest(".Eb-ctrlContainer");
                this.PGobj.removeFromDD(this.rootContainerObj.Controls.GetByName(ebsid).EbSid);
                let ctrl = this.rootContainerObj.Controls.PopByName(ebsid);
                if (ctrl.ObjType === "Approval")
                    this.ApprovalCtrl = null;
                if (ctrl.ObjType === "Review")
                    this.ReviewCtrl = null;
                else if (ctrl.ObjType === "ProvisionLocation")
                    this.ProvisionLocationCtrl = null;
                ControlTile.parent().focus();
                ControlTile.remove();
                this.PGobj.removeFromDD(ebsid);
                this.saveObj();
                return ctrl;
            }
        }
    };

    this.ctxBuildFn = function ($trigger, e) {
        return {
            items: {
                "Delete": {
                    name: "Remove",
                    icon: "fa-trash",
                    callback: this.del,
                    visible: this.cpyVisible
                },
                "Cut": {
                    name: "Cut",
                    icon: "fa-scissors",
                    callback: this.cut,
                    visible: this.cpyVisible
                },
                "Copy": {
                    name: "Copy",
                    icon: "fa-clone",
                    callback: this.copy,
                    visible: this.cpyVisible
                },
                "Copy to clipboard": {
                    name: "Copy to Clipboard",
                    icon: "fa-clipboard",
                    callback: this.copyToClipboard,
                    visible: this.cpyVisible
                },
                "Paste": {
                    name: "Paste",
                    icon: "fa-files-o",
                    callback: this.paste,
                    visible: this.pasteVisible
                }
            }
        };
    }.bind(this);

    this.CtxSettingsObj = {
        selector: '.Eb-ctrlContainer,[eb-form="true"]',
        autoHide: true,
        build: this.ctxBuildFn.bind(this)
    };

    this.cpyVisible = function (key, opt) {
        return !opt.$trigger[0].hasAttribute('eb-root-obj-container');
    }.bind(this);

    this.pasteVisible = function (key, opt) {
        if (localStorage.eb_form_control) {
            return true;
        }
        else {
            this.getTextFromClipboard(false).then(function (key, opt, st) {
                if (st && st.includes('$$$webform-control-copy$$$')) {
                    opt.items.Paste.$node.show()
                }
            }.bind(this, key, opt));
        }
        return false;
    }.bind(this);

    this.Init = function () {
        $.contextMenu(this.CtxSettingsObj);
        this.drake.on("drop", this.onDropFn.bind(this));
        this.drake.on("drag", this.onDragFn.bind(this));
        this.drake.on("dragend", this.onDragendFn.bind(this));
        this.drake.on("cloned", this.onClonedFn.bind(this));
        this.$form.on("focus", this.controlOnFocus.bind(this));
        this.$form.on("dblclick", ".eb-label-editable", this.ctrlLblDblClick.bind(this));
        this.$form.on("blur", ".eb-lbltxtb", this.lbltxtbBlur.bind(this));
        this.$form.on("keyup", ".eb-lbltxtb", this.lbltxtbKeyUp.bind(this));
        this.$form.on("click", ".cont-prop-btn", this.contPropBtnClick.bind(this));
        this.$form.on("click", ".ebtab-add-btn", this.contTabAddClick.bind(this));
        this.$form.on("click", ".ebtab-close-btn", this.contTabDelClick.bind(this));
        this.$form.on("keyup", this.keyUp.bind(this));
        this.ctxClipboard = {};
        if (options.builderType === 'WebForm' && this.rootContainerObj.TableName.trim() === "")
            this.rootContainerObj.TableName = this.rootContainerObj.Name + "_tbl";
        if (this.rootContainerObj.DisplayName.trim() === "")
            this.rootContainerObj.DisplayName = this.rootContainerObj.Name;
        this.$form.focus();
        if (this.isEditMode) {
            this.makeTdsDropable_Resizable();
            this.makeTabsDropable();
            this.makeGBsDropable();
            this.makeDataObjectDropable();
        }
        this.ApprovalCtrl = getFlatContObjsOfType(this.rootContainerObj, "Approval")[0];
        this.ReviewCtrl = getFlatContObjsOfType(this.rootContainerObj, "Review")[0];
        this.ProvisionLocationCtrl = getFlatObjOfType(this.rootContainerObj, "ProvisionLocation")[0];


        this.EbAlert = new EbAlert({
            id: this.toolBoxid + "ToolBoxAlertCont",
            top: 24,
            left: 24
        });

        this.GenerateButtons();

    };

    this.DSchangeCallBack = function () {

    };

    this.Init();
};