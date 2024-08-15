const CallWebFormCollectionRender = function (Option) {
    if (ebcontext.webform)
        ebcontext.webform.Init(Option);
    else if (Option._source === 'master')
        ebcontext.webform = new WebFormCollectionRender(Option);
    else {
        ebcontext.webform = new WebFormCollectionRender(null);
        ebcontext.webform.Init(Option);
    }
    ebcontext.webform.locationInit();
};

const WebFormCollectionRender = function (Option) {
    this.RenderCollection = [];//renderer collection
    this.RenderCounter = 1;
    this.ObjectCollection = [];
    this.MasterHeader = null;
    this.IsMasterAvail = false;
    this.CurrentSubForm = null;//critical - must updated on each event
    this.LastResponse = {};//for debugging
    this.InterContextObj = [];//inter form communication (eg: export btn save -> tv refresh)
    this.PopupLoading = false;

    this.Init = function (Op) {
        if (Op === null) return;
        if (Op._source === 'master' && Op._formObjJsUrl) {
            this.LoadScriptSync(Op._formObjJsUrl, this.InitInner.bind(this, Op, true));
        }
        else {
            this.InitInner(Op, false);
        }
    }

    this.InitInner = function (Op, JsonCached) {
        if (Op === null) return;

        if (Op._source === 'master') {

            let _obj = {
                formObj: JsonCached ? JSON.stringify(this.TryEval(Op._formRefId)) : Op._formObj,
                formRefId: Op._formRefId,
                formHTML: Op._formHTML,
                formPermissions: Op._formPermissions,
                relatedData: Op._relatedData
            };
            this.ObjectCollection.push(_obj);
            this.IsMasterAvail = true;
            let tmp = JSON.parse(_obj.formObj);

            let _options = {
                formObj: tmp,
                $formCont: $("#WebForm-cont"),
                headerBtns: this.GetMasterHeaderBtns(tmp),
                formRefId: Op._formRefId,
                mode: Op._mode,
                renderMode: Op._renderMode,
                rowId: Op._rowId,
                draftId: Op._draftId,
                draftInfo: Op._draftInfo,
                formData: Op._formData,
                userObject: Op._userObject,
                cid: Op._cid,
                env: Op._env,
                isPartial: Op._isPartial,
                formPermissions: Op._formPermissions,
                headerObj: this.MasterHeader,
                formHTML: Op._formHTML,
                disableEditBtn: Op._disableEditButton,
                __MultiRenderCxt: this.RenderCounter++,
                relatedData: Op._relatedData
            };

            let WebForm = new WebFormRender(_options);
            this.RenderCollection.push(WebForm);
        }
        else if (Op._source === 'tv') {
            this.PopupForm(Op._refId, Op._params, Op._mode, { Callback: Op._callback, srcCxt: 99999, initiator: { ObjType: 'TVcontrol' } });
        }
        else if (Op._source === 'ps') {
            this.PopupForm(Op._refId, Op._params, Op._mode, { locId: Op._locId });
        }

        window.onbeforeunload = function (e) {
            for (let i = 0; i < this.RenderCollection.length; i++) {
                let renObj = this.RenderCollection[i];
                if (renObj && renObj.isCloseConfirmRequired()) {
                    var dialogText = 'Changes you made may not be saved.';
                    e.returnValue = dialogText;
                    return dialogText;
                }
            }
        }.bind(this);

        $(window).off("keydown").on("keydown", this.windowKeyDownListener);
    };

    this.LoadScriptSync = function (src, callback) {
        var s = document.createElement('script');
        s.src = src;
        s.type = "text/javascript";
        s.async = false;
        s.onload = function () {
            callback();
        }
        document.getElementsByTagName('head')[0].appendChild(s);
    };

    this.TryEval = function (id) {
        let v = null;
        try {
            v = eval(id.replaceAll('-', '_'))
        }
        catch (e) {
            console.error('Object eval failed: ' + e.message);
        }
        return v;
    };

    this.PopupForm = function (refId, params, mode, options = {}) {

        //$.extend({
        //    srcCxt: 0,//source context id
        //    initiator: {},//initiating control object
        //    locId: 0,
        //    Callback: function (dataId, isSaved, dataAsParams) { },//called when popup form is closed
        //    editModePrefill: false,
        //    editModePrefillParams: null,
        //    editModeAutoSave: false
        //}, options);

        if (!refId) {
            console.error('Invalid refId for popup form');
            return;
        }
        if (this.PopupLoading)
            return;
        this.PopupLoading = true;
        this.showSubFormLoader();
        let randomizeId = this.RenderCollection.findIndex(e => e.formRefId === refId) >= 0;
        let dataOnly = (this.ObjectCollection.findIndex(e => e.formRefId === refId) >= 0 || this.TryEval(refId) != null) && !randomizeId;

        $.ajax({
            type: "POST",
            url: "/WebForm/GetFormForRendering",
            data: {
                _refId: refId,
                _params: params,
                _mode: mode,
                _locId: options.locId || ebcontext.locations.getCurrent(),
                _renderMode: 2,
                _dataOnly: dataOnly,
                _randomizeId: randomizeId
            },
            error: function (xhr, ajaxOptions, thrownError) {
                this.PopupLoading = false;
                this.hideSubFormLoader();
                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
            }.bind(this),
            success: this.GetFormForRenderingSuccess.bind(this, dataOnly, randomizeId, options)
        });
    };

    this.GetFormForRenderingSuccess = function (dataOnly, randomizeId, options, result) {
        let resp = JSON.parse(result);
        this.LastResponse = resp;
        if (resp.ErrorMessage) {
            console.error(resp.ErrorMessage);
            EbMessage("show", { Message: resp.Message, AutoHide: true, Background: '#aa0000' });
            this.PopupLoading = false;
            this.hideSubFormLoader();
            return;
        }
        if (!dataOnly && resp.WebFormObjJsUrl) {
            this.LoadScriptSync(resp.WebFormObjJsUrl, this.GetFormForRenderingSuccess_inner.bind(this, resp, dataOnly, randomizeId, options, result));
        }
        else {
            this.GetFormForRenderingSuccess_inner(resp, dataOnly, randomizeId, options, result)
        }
    };

    this.GetFormForRenderingSuccess_inner = function (resp, dataOnly, randomizeId, options, result) {
        this.PopupLoading = false;
        this.hideSubFormLoader();
        let _obj;
        if (!dataOnly) {
            let FormJson;
            if (resp.WebFormObjJsUrl) {
                FormJson = JSON.stringify(this.TryEval(resp.RefId));
            }
            else {
                FormJson = resp.WebFormObj;
            }
            let FormObj = JSON.parse(FormJson);

            if (!FormObj.MakeEbSidUnique) {
                console.error('MakeEbSidUnique must be true for popup form');
                EbMessage("show", { Message: "Form rendering failed. Contact admin. [MakeEbSidUnique]", AutoHide: false, Background: '#aa0000' });
                return;
            }
            _obj = {
                formObj: FormJson,
                formRefId: resp.RefId,
                formHTML: resp.WebFormHtml,
                formPermissions: resp.FormPermissions,
                relatedData: resp.RelatedData
            }
            if (!randomizeId)
                this.ObjectCollection.push(_obj);
        }
        else
            _obj = this.ObjectCollection.find(e => e.formRefId === resp.RefId);
        let cxt = this.RenderCounter++;
        let _formObj = JSON.parse(_obj.formObj);
        this.SetSubFormModal(cxt, _formObj.DisableOpenInNewTab);
        let keepHidden = this.isFormKeepHidden(resp, _formObj, options);
        if (!keepHidden)
            this.showSubForm(cxt);
        this.CurrentSubForm = null;
        try {
            let WebForm = new WebFormRender({
                formObj: _formObj,
                $formCont: $(`#subForm-cont${cxt}`),
                headerBtns: this.GetSlaveHeaderBtns(cxt),
                formRefId: _obj.formRefId,
                mode: resp.Mode,
                renderMode: 2,//Partial
                rowId: resp.RowId,
                draftId: resp.DraftId,
                draftInfo: resp.DraftInfo,
                formData: (resp.DraftId > 0 ? JSON.parse(resp.Draft_FormData) : JSON.parse(resp.FormDataWrap).FormData),
                userObject: ebcontext.user,
                cid: ebcontext.sid,
                env: ebcontext.env,
                isPartial: false,
                formPermissions: _obj.formPermissions,
                headerObj: this.subFormHeaderObj,
                formHTML: _obj.formHTML,
                disableEditBtn: resp.DisableEditButton,
                editModePrefillParams: (resp.RowId > 0 && options.editModePrefill && options.editModePrefillParams) ? options.editModePrefillParams : null,
                editModeAutoSave: options.editModeAutoSave,
                keepHidden: keepHidden,
                __MultiRenderCxt: cxt,
                relatedData: _obj.relatedData
            });
            WebForm.__MultiRenderUrl = resp.Url;
            this.RenderCollection.push(WebForm);
            this.CurrentSubForm = WebForm;
            this.maximizeSubForm(cxt, 'e', false, true);
            this.TryToAddInterCxtObj(options, cxt);
        }
        catch (e) {
            EbMessage("show", { Message: '[F_ERR] Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
            console.error(e);
            this.RenderCollection.push({ __MultiRenderCxt: cxt, Mode: { isEdit: false }, DISPOSE: function () { } });//DUMMY rendObj
            this.hideSubForm(cxt);
        }
    };

    this.isFormKeepHidden = function (resp, _formObj, options) {
        if (resp.RowId > 0 && options.editModePrefill && options.editModePrefillParams && options.editModeAutoSave) {
            if (_formObj.FormModeAfterEdit == 3 && !_formObj.EditReasonCtrl) { //close mode
                return true;
            }
        }
        return false;
    };

    this.GetSlaveHeaderBtns = function (cxt) {
        return {
            New: "subformnew" + cxt,
            NewSel: "subformnew-selbtn" + cxt,
            Edit: "subformedit" + cxt,
            Save: "subformsave" + cxt,
            SaveSel: "subformsave-selbtn" + cxt,
            OpenInNewTab: "subformopen" + cxt,
            Clone: "subformclone" + cxt,
            Print: "subformprint" + cxt,
            PrintSel: "subformprint-selbtn" + cxt,
            PrintPrev: "subformprintprev" + cxt,
            PrintPrevSel: "subformprintprev-selbtn" + cxt,
            Discard: "subformdiscardedit" + cxt,
            Details: "subformdetails" + cxt
        };
    };

    this.showSubForm = function (cxt) {
        $(`#subFormHeader${cxt} .sfh-title`).html('Loading...');
        $(`#subForm-cont${cxt}`).empty();
        $('.sf-container-top').removeClass('sf-container-top');
        $(`#subFormModal${cxt}`).addClass('sf-container-top');
        $(`#subFormModal${cxt},.sf-msk`).fadeIn();
    };

    this.hideSubForm = function (cxt) {
        let proceed = true;
        let renIdx = this.RenderCollection.findIndex(e => e.__MultiRenderCxt === cxt);
        let renObj = this.RenderCollection[renIdx];
        if (renObj && renObj.isCloseConfirmRequired()) {
            if (!confirm('Changes you made may not be saved'))
                proceed = false;
        }
        if (proceed) {
            $(`#subFormModal${cxt}`).fadeOut();
            $(`#subFormModal${cxt}`).removeClass('sf-container-top');
            if ((this.RenderCollection.length === 1 && !this.IsMasterAvail) || (this.RenderCollection.length === 2 && this.IsMasterAvail))
                $(`.sf-msk`).fadeOut();
            if (renObj) {
                this.refreshRelatedForm(cxt);
                renObj.DISPOSE();
                $(`#subFormModal${cxt}`).remove();
                this.RenderCollection.splice(renIdx, 1);
            }
            if (this.RenderCollection.length === 0 || (renIdx === 1 && this.IsMasterAvail))
                this.CurrentSubForm = null;
            else if (renIdx - 1 >= 0) {
                this.CurrentSubForm = this.RenderCollection[renIdx - 1];
                $(`#subFormModal${this.CurrentSubForm.__MultiRenderCxt}`).addClass('sf-container-top');
            }
        }
    };

    this.maximizeSubForm = function (cxt, event, forcemax = false, forceres = false) {
        let size = {
            0: { h: '40vh', w: '40%' },
            1: { h: '60vh', w: '60%' },
            2: { h: '80vh', w: '80%' },
            3: { h: '100vh', w: '100%' }
        };

        let $mxBtn = $(`#subformmaximize${cxt}`);

        if (($mxBtn.children().hasClass('fa-window-maximize') && !forceres) || forcemax) {
            $mxBtn.children().removeClass('fa-window-maximize').addClass('fa-window-restore');
            $mxBtn.prop('title', 'Restore');
            $(`#subForm-cont${cxt}`).css('height', 'calc(100vh - 38px)');
            $(`#subFormModal${cxt} .sf-cont-body`).animate({ width: '100%', height: '100vh', left: '0px', top: '0px' });
        }
        else {
            $mxBtn.children().removeClass('fa-window-restore').addClass('fa-window-maximize');
            $mxBtn.prop('title', 'Maximize');
            let Idx = 1;
            let renObj = this.RenderCollection.find(e => e.__MultiRenderCxt === cxt);
            if (renObj) {
                let pfSize = renObj.FormObj.PopupFormSize;
                if (typeof (pfSize) === 'number' && pfSize >= 0 && pfSize <= 3)
                    Idx = pfSize;
            }
            $(`#subForm-cont${cxt}`).css('height', `calc(${size[Idx].h} - 40px)`);
            $(`#subFormModal${cxt} .sf-cont-body`).animate({ width: size[Idx].w, height: size[Idx].h, left: '0px', top: '0px' });
        }
    };

    this.showSubFormLoader = function (cxt) {
        if (cxt >= 0)
            $("#sf_loader" + cxt).EbLoader("show", { maskItem: { Id: "body" } });
        else
            $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "body" } });
    };

    this.hideSubFormLoader = function (cxt) {
        if (cxt >= 0)
            $("#sf_loader" + cxt).EbLoader("hide");
        else
            $("#eb_common_loader").EbLoader("hide");
    };

    this.GetMasterHeaderBtns = function (_formObj) {
        let header = new EbHeader();
        header.insertButton(`<button id="webformdetails" class='btn' title='Details & More Options' style='display: none;'><i class="fa fa-ellipsis-v" aria-hidden="true"></i></button>`);
        header.insertButton(`<button id="webformdiscardedit" class='btn' title='Discard Changes (Ctrl+Q)' style='display: none;'><i class="fa fa-times-circle-o" aria-hidden="true"></i></button>`);
        header.insertButton(`<button id="webformclone" class='btn' title='Copy this form to a new form' style='display: none;'><i class="fa fa-files-o" aria-hidden="true"></i></button>`);
        //header.insertButton(`<button id="webformnew" class="btn" title="New form (Alt+N)"  style="display: none;"><i class="fa fa-plus" aria-hidden="true"></i></button>`);

        header.insertButton(`<div id="webformnew-selbtn"  style='display: none;' class="btn-select btn">
                                <button id="webformnew" class="savebtn" title="New form (Alt+N)"><i class="fa fa-plus" aria-hidden="true"></i></button>
                                <select class="selectpicker"></select>
                            </div>`);

        header.insertButton(`<button id="webformedit" class='btn' title='Edit (Ctrl+E)' style='display: none;'><i class="fa fa-pencil" aria-hidden="true"></i></button>`);
        header.insertButton(`<div id="webformsave-selbtn"  style='display: none;' class="btn-select btn">
                                <button id="webformsave" class="savebtn" title="Save form (Ctrl+S)"><i class="fa fa-save" aria-hidden="true"></i></button>
                                <select class="selectpicker"></select>
                            </div>`);
        header.insertButton(`<div id="webformexcel-selbtn"  style='display: none;' class="btn-select btn">
                                <button id="webformexcel" class="savebtn" title="Excel form"><i class="fa fa-file-excel-o" aria-hidden="true"></i></button>
                                <select class="selectpicker">
                                  <option data-token="import" data-title="Import" data-icon="fa-upload"> Import</option>
                                  <option data-token="template-export" data-title="Form template" data-icon="fa-download"> Form template</option>
                                </select>
                            </div>`);
        header.insertButton(`<div id="webformprint-selbtn" style='display: none;' class="btn-select btn">
                                <button id="webformprint" class="savebtn" title="Print (Ctrl+P)"><i class="fa fa-print" aria-hidden="true"></i></button>
                                <select class="selectpicker" data-opr="print"></select>
                            </div>`);
        header.insertButton(`<div id="webformprintprev-selbtn" style='display: none;' class="btn-select btn">
                                <button id="webformprintprev" class="savebtn" title="Print Preview"><i class="fa fa-file-pdf-o" aria-hidden="true"></i></button>
                                <select class="selectpicker" data-opr="preview"></select>
                            </div>`);
        header.insertButton(`<button id="webforminvalidmsgs" onclick='ebcontext.webform.RenderCollection[0].FRC.toggleInvalidMSGs()' role="invalid-msgs" class="btn" title="Show all invalid inputs"><i class="icofont-exclamation-circle"></i></i></button>`);

        header.addRootObjectHelp(_formObj);
        this.MasterHeader = header;

        let headerBtns = {
            New: "webformnew",
            NewSel: "webformnew-selbtn",
            Edit: "webformedit",
            Save: "webformsave",
            SaveSel: "webformsave-selbtn",
            Clone: "webformclone",
            Excel: "webformexcel",
            ExcelSel: "webformexcel-selbtn",
            Print: "webformprint",
            PrintSel: "webformprint-selbtn",
            PrintPrev: "webformprintprev",
            PrintPrevSel: "webformprintprev-selbtn",
            GotoInvalid: "webforminvalidmsgs",
            Discard: "webformdiscardedit",
            Details: "webformdetails"
        }
        return headerBtns;
    };

    this.SetSubFormModal = function (cxt, DisableOpenInNewTab) {
        if ($(`#subFormModal${cxt}`).length === 0) {
            if ($('.sf-msk').length === 0)
                $("body").append(`<div class="sf-msk" style='display: none;'></div>`);
            let curLoc = ebcontext.locations.CurrentLocObj;
            $("body").append(`
<div id="subFormModal${cxt}" class="sf-container" style='display: none;'>
    <div class="sf-cont-body">
        <div id="subFormHeader${cxt}" class='sub-form-header'>
            <div class='sfh-loc'>
                <div style="font-size: 11px; white-space: nowrap;">${curLoc.TypeName}</div>
                <div style="white-space: nowrap;">${curLoc.ShortName}</div>
            </div>
            <div class='sfh-title'> Loading... </div>
            <div class='sfh-toolbar'> 
                <div class='sfh-tool-btns'>
                    <button id="subforminvalidmsgs${cxt}" style='display: none;' onclick='ebcontext.webform.RenderCollection[${this.RenderCollection.length - 1}].FRC.toggleInvalidMSGs()' role="invalid-msgs" class="btn" title="Show all invalid inputs"><i class="icofont-exclamation-circle"></i></i></button>
                    <div id="subformprintprev-selbtn${cxt}" style='display: none;' class="btn-select btn">
                        <button id="subformprintprev${cxt}" class="savebtn" title="Print Preview"><i class="fa fa-file-pdf-o" aria-hidden="true"></i></button>
                        <select class="selectpicker" data-opr="preview"></select>
                    </div>
                    <div id="subformprint-selbtn${cxt}" style='display: none;' class="btn-select btn">
                        <button id="subformprint${cxt}" class="savebtn" title="Print (Ctrl+P)"><i class="fa fa-print" aria-hidden="true"></i></button>
                        <select class="selectpicker" data-opr="print"></select>
                    </div>
                    <div id="subformsave-selbtn${cxt}"  style='display: none;' class="btn-select btn">
                        <button id="subformsave${cxt}" class="savebtn" title="Save form (Ctrl+S)"><i class="fa fa-save" aria-hidden="true"></i></button>
                        <select class="selectpicker"></select>
                    </div>                    
                    <button id="subformedit${cxt}" class='btn' title='Edit (Ctrl+E)' style='display: none;'><i class="fa fa-pencil" aria-hidden="true"></i></button>
                    
                    <div id="subformnew-selbtn${cxt}"  style='display: none;' class="btn-select btn">
                        <button id="subformnew${cxt}" class="savebtn" title="New (Alt+N)"><i class="fa fa-plus" aria-hidden="true"></i></button>
                        <select class="selectpicker"></select>
                    </div> 

                    <button id="subformclone${cxt}" class='btn' title='Copy this form to a new form' style='display: none;'><i class="fa fa-files-o" aria-hidden="true"></i></button>
                    <button id="subformdiscardedit${cxt}" class='btn' title='Discard Changes (Ctrl+Q)' style='display: none;'><i class="fa fa-times-circle-o" aria-hidden="true"></i></button>
                    <button id="subformdetails${cxt}" class='btn' title='Details & More Options'><i class="fa fa-ellipsis-v" aria-hidden="true"></i></button>

                    <button id="subformopen${cxt}" class='subformopen' title='Open in new tab' ${(DisableOpenInNewTab ? "style='display: none;'" : "")}><i class="fa fa-external-link" aria-hidden="true"></i></button>
                    <button id="subformmaximize${cxt}" class='subformmaximize' title='Maximize'><i class="fa fa-window-maximize" aria-hidden="true"></i></button>
                    <button id="subformclose${cxt}" class='' title='Close' data-dismiss="modal"><i class="fa fa-times" aria-hidden="true"></i></button>
                </div> 
            </div>
            <div class="sf_loader" id="sf_loader${cxt}" style="top: 35px;"></div>
        </div>
        <div id="subFormOverlay${cxt}" class='sub-form-overlay'>
            <div style="position: relative; top: 50%;"><i class="fa fa-spinner fa-pulse" aria-hidden="true"></i> Loading...</div>
        </div>
        <div id="subForm-cont${cxt}" class='sub-form-cont'><div>
    </div>
</div>
   
`);
            $(`#subformclose${cxt}`).off('click').on('click', this.hideSubForm.bind(this, cxt));
            $(`#subformmaximize${cxt}`).off('click').on('click', this.maximizeSubForm.bind(this, cxt));

            $(`#subFormModal${cxt}`).find('.sf-cont-body')
                .css({
                    width: '60%',
                    height: '60vh',
                })
                //.resizable({
                //    minWidth: 625,
                //    minHeight: 175,
                //    handles: 'n, e, s, w, ne, sw, se, nw',
                //})
                .draggable({
                    handle: `#subFormHeader${cxt}`//,
                    //stop: function (event, ui) {
                    //    $('#subFormModal .sf-cont-body').css('top');
                    //}
                });
        }
    };

    this.TryToAddInterCxtObj = function (options, destCxt) {
        if (options && options.srcCxt && options.initiator) {
            this.InterContextObj.push({
                SourceCxt: options.srcCxt,
                DestCxt: destCxt,
                Initiator: options.initiator,
                ChangeDetected: false,
                Callback: options.Callback ? options.Callback : function (dataId, isSaved, dataAsParams) { }
            });
        }
    };

    this.refreshRelatedForm = function (cxt) {
        let x = this.InterContextObj.find(e => e.DestCxt === cxt);
        if (!x)
            return;

        if (x.Initiator.ObjType === 'TVcontrol' && x.ChangeDetected && x.Callback) {
            x.Callback();
            return;
        }

        let srcRen = this.RenderCollection.find(e => e.__MultiRenderCxt === x.SourceCxt);
        if (!srcRen)
            return;

        if (x.Initiator.ObjType === 'CalendarControl') {
            if (x.Callback) {
                try {
                    let destRender = this.RenderCollection.find(e => e.__MultiRenderCxt === cxt);
                    if (destRender) {
                        let vals = destRender.getWebFormVals();
                        x.Callback(destRender.rowId, x.ChangeDetected, vals);
                    }
                }
                catch (e) {
                    EbMessage("show", { Message: 'CalendarControl callback error: ' + e.message, AutoHide: true, Background: '#aa0000' });
                }
            }
        }

        if (!x.ChangeDetected)
            return;
        if (x.Initiator.ObjType === 'ExportButton' || x.Initiator.ObjType === 'Label') {
            let tvCtrls = getFlatObjOfType(srcRen.FormObj, "TVcontrol");
            for (let i = 0; i < tvCtrls.length; i++) {
                if (!tvCtrls[i].AssocCtrls || tvCtrls[i].AssocCtrls.$values.length === 0)
                    continue;
                let a = tvCtrls[i].AssocCtrls.$values;
                for (let j = 0; j < a.length; j++) {
                    if (a[j].ControlName && a[j].ControlName === x.Initiator.Name)
                        tvCtrls[i].reloadWithParamAll();
                }
            }
            let destRender = this.RenderCollection.find(e => e.__MultiRenderCxt === cxt);
            if (destRender) {
                x.Initiator.reverseUpdateData(destRender);
            }
        }
        else if (x.Initiator.ObjType === 'PowerSelect') {
            let destRender = this.RenderCollection.find(e => e.__MultiRenderCxt === cxt);
            if (x.Initiator.IsDGCtrl) {
                if (destRender) {
                    x.Initiator.reverseUpdateData(destRender);
                }
            }
            if (x.Callback && x.Initiator.PsJsObj) {
                x.Callback(destRender.rowId);
            }
        }
    };

    this.locationInit = function () {
        if (ebcontext.locations.Listener) {
            ebcontext.locations.Listener.ChangeLocation = function (o) {
                let a = this.RenderCollection;
                for (let i = 0; i < a.length; i++) {
                    if (a[i].rowId <= 0 && !a[i].FormObj.IsLocIndependent) {
                        let sysLocCtrls = getFlatObjOfType(a[i].FormObj, "SysLocation");
                        $.each(sysLocCtrls, function (i, ctrl) {
                            let oldLocId = ctrl.getValue();
                            if (oldLocId !== o.LocId)
                                ctrl.setValue(o.LocId);
                        }.bind(this));
                    }
                }
            }.bind(this);
        }
    }.bind(this);

    //#region EXTERNAL_Functions ##############

    this.SetPopupFormTitle = function (title, mode, html) {
        title = title + `<span mode="${mode}" class="fmode">${mode}</span>` + html;
        let cxt = '';
        if (this.CurrentSubForm)
            cxt = this.CurrentSubForm.__MultiRenderCxt;
        else
            cxt = this.RenderCounter - 1;
        $(`#subFormHeader${cxt} .sfh-title`).html(title);
    };

    this.windowKeyDownListener = function (event) {
        if (this.CurrentSubForm)
            this.CurrentSubForm.windowKeyDown(event);
        else if (this.IsMasterAvail)
            this.RenderCollection[0].windowKeyDown(event);
    }.bind(this);

    this.showLoader = function () {
        if (this.CurrentSubForm)
            this.showSubFormLoader(this.CurrentSubForm.__MultiRenderCxt);
        else
            $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "body" } });
    }.bind(this);

    this.hideLoader = function () {
        if (this.CurrentSubForm)
            this.hideSubFormLoader(this.CurrentSubForm.__MultiRenderCxt);
        else
            $("#eb_common_loader").EbLoader("hide");
    }.bind(this);

    this.subFormHeaderObj = {
        showElement: function (arr) {
            if (!arr)
                return;
            for (let i = 0; i < arr.length; i++) {
                $(`#${arr[i]}`).show();
            }
        },
        hideElement: function (arr) {
            if (!arr)
                return;
            for (let i = 0; i < arr.length; i++) {
                $(`#${arr[i]}`).hide();
            }
        },
        setFormMode: function (html) {
            if (this.CurrentSubForm) {
                let cxt = this.CurrentSubForm.__MultiRenderCxt;
                $($(`#subFormHeader${cxt} .sfh-title span`)[0]).html(html);
            }
        }
    };

    this.UpdateInterCxtObj = function (destCxt) {
        let x = this.InterContextObj.find(e => e.DestCxt === destCxt);
        if (x)
            x.ChangeDetected = true;
    }.bind(this);

    //#endregion EXTERNAL_Functions #############

    this.Init(Option);
}


//this.SetEbSidUnique = function (obj) {
//    let allCtrls = getAllctrlsFrom(obj);
//    let ts = Date.now().toString(36);
//    for (let i = 0; i < allCtrls.length; i++) {
//        let id = allCtrls[i].EbSid_CtxId;
//        if (id) {
//            if (id.includes('_'))
//                allCtrls[i].EbSid_CtxId = id.substr(0, id.lastIndexOf('_')) + '_' + ts;
//            else
//                allCtrls[i].EbSid_CtxId = id + '_' + ts;
//        }
//    }
//};
