﻿const CallWebFormCollectionRender = function (Option) {
    if (ebcontext.webform)
        ebcontext.webform.Init(Option);
    else if (Option._source === 'master')
        ebcontext.webform = new WebFormCollectionRender(Option);
    else {
        ebcontext.webform = new WebFormCollectionRender(null);
        ebcontext.webform.Init(Option);
    }
};

const WebFormCollectionRender = function (Option) {
    this.RenderCollection = [];//renderer collection
    this.RenderCounter = 0;
    this.ObjectCollection = [];
    this.MasterHeader = null;
    this.IsMasterAvail = false;
    this.CurrentSubForm = null;//critical - must updated on each event
    this.LastResponse = {};//for debugging

    this.Init = function (Op) {
        if (Op === null) return;

        if (Op._source === 'master') {
            let _obj = {
                formObj: Op._formObj,
                formRefId: Op._formRefId,
                formHTML: Op._formHTML,
                formPermissions: Op._formPermissions
            };
            this.ObjectCollection.push(_obj);
            this.IsMasterAvail = true;

            let _options = {
                formObj: JSON.parse(Op._formObj),
                $formCont: $("#WebForm-cont"),
                headerBtns: this.GetMasterHeaderBtns(Op),
                formRefId: Op._formRefId,
                mode: Op._mode,
                renderMode: Op._renderMode,
                rowId: Op._rowId,
                draftId: Op._draftId,
                formData: Op._formData,
                userObject: Op._userObject,
                cid: Op._cid,
                env: Op._env,
                isPartial: Op._isPartial,
                formPermissions: Op._formPermissions,
                headerObj: this.MasterHeader,
                formHTML: Op._formHTML,
                disableEditBtn: Op._disableEditButton
            };

            let WebForm = new WebFormRender(_options);
            this.RenderCollection.push(WebForm);
        }
        else if (Op._source === 'tv') {
            this.PopupForm(Op._refId, Op._params, Op._mode);
        }
        else if (Op._source === 'ps') {
            this.PopupForm(Op._refId, Op._params, Op._mode);
        }

        window.onbeforeunload = function (e) {
            if (this.RenderCollection.find(e => e.Mode.isEdit)) {
                var dialogText = 'Changes you made may not be saved.';
                e.returnValue = dialogText;
                return dialogText;
            }
        }.bind(this);

        $(window).off("keydown").on("keydown", this.windowKeyDownListener);
    };

    this.PopupForm = function (refId, params, mode) {
        if (!refId) {
            console.error('Invalid refId for popup form');
            return;
        }
        let randomizeId = this.RenderCollection.findIndex(e => e.formRefId === refId) >= 0;
        let dataOnly = this.ObjectCollection.findIndex(e => e.formRefId === refId) >= 0 && randomizeId;

        this.showSubFormLoader();
        $.ajax({
            type: "POST",
            url: "/WebForm/GetFormForRendering",
            data: {
                _refId: refId,
                _params: params,
                _mode: mode,
                _locId: ebcontext.locations.getCurrent(),
                _renderMode: 2,
                _dataOnly: dataOnly,
                _randomizeId: randomizeId
            },
            error: function (xhr, ajaxOptions, thrownError) {
                this.hideSubFormLoader();
                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000' });
            }.bind(this),
            success: this.GetFormForRenderingSuccess.bind(this, dataOnly, randomizeId)
        });
    };

    this.GetFormForRenderingSuccess = function (dataOnly, randomizeId, result) {
        this.hideSubFormLoader();
        let resp = JSON.parse(result);
        this.LastResponse = resp;

        if (resp.ErrorMessage) {
            console.error(resp.ErrorMessage);
            EbMessage("show", { Message: resp.Message, AutoHide: true, Background: '#aa0000' });
            return;
        }
        let _obj;
        if (!dataOnly) {
            let FormObj = JSON.parse(resp.WebFormObj);
            if (!FormObj.MakeEbSidUnique) {
                console.error('MakeEbSidUnique must be true for popup form');
                EbMessage("show", { Message: "Form rendering failed. Contact admin.", AutoHide: true, Background: '#aa0000' });
                return;
            }
            _obj = {
                formObj: resp.WebFormObj,
                formRefId: resp.RefId,
                formHTML: resp.WebFormHtml,
                formPermissions: resp.FormPermissions
            }
            if (!randomizeId)
                this.ObjectCollection.push(_obj);
        }
        else
            _obj = this.ObjectCollection.find(e => e.formRefId === resp.RefId);
        let cxt = this.RenderCounter++;
        this.SetSubFormModal(cxt);
        this.showSubForm(cxt);
        this.CurrentSubForm = null;
        let WebForm = new WebFormRender({
            formObj: JSON.parse(_obj.formObj),
            $formCont: $(`#subForm-cont${cxt}`),
            headerBtns: this.GetSlaveHeaderBtns(cxt),
            formRefId: _obj.formRefId,
            mode: resp.Mode,
            renderMode: 2,//Partial
            rowId: resp.RowId,
            draftId: resp.DraftId,
            formData: (resp.DraftId > 0 ? JSON.parse(resp.Draft_FormData) : JSON.parse(resp.FormDataWrap).FormData),
            userObject: ebcontext.user,
            cid: ebcontext.sid,
            env: ebcontext.env,
            isPartial: false,
            formPermissions: _obj.formPermissions,
            headerObj: this.subFormHeaderObj,
            formHTML: _obj.formHTML,
            disableEditBtn: resp.DisableEditButton
        });
        WebForm.__MultiRenderCxt = cxt;
        WebForm.__MultiRenderUrl = resp.Url;
        this.RenderCollection.push(WebForm);
        this.CurrentSubForm = WebForm;
        this.maximizeSubForm(cxt, 'e', false, true);
    };

    this.GetSlaveHeaderBtns = function (cxt) {
        return {
            New: "subformnew" + cxt,
            Edit: "subformedit" + cxt,
            Save: "subformsave" + cxt,
            SaveSel: "subformsave-selbtn" + cxt,
            OpenInNewTab: "subformopen" + cxt,
            Close: "subformclose" + cxt,//& Open in new tab//&& Cancel editing.
            Delete: "subformdelete" + cxt,
            Cancel: "subformcancel" + cxt,
            AuditTrail: "subformaudittrail" + cxt,
            Clone: "subformclone" + cxt,
            Lock: "subformlock" + cxt,
            Print: "subformprint" + cxt,
            PrintSel: "subformprint-selbtn" + cxt,
            DraftSave: "subformsavedraft" + cxt,
            OpenSrc: "subformopensrc" + cxt,
            Discard: "subformdiscardedit" + cxt,
            Dependent: "subformpusheddata" + cxt
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
        if (renObj && renObj.Mode.isEdit) {
            if (!confirm('Changes you made may not be saved.'))
                proceed = false;
        }
        if (proceed) {
            $(`#subFormModal${cxt}`).fadeOut();
            $(`#subFormModal${cxt}`).removeClass('sf-container-top');
            if ((this.RenderCollection.length === 1 && !this.IsMasterAvail) || (this.RenderCollection.length === 2 && this.IsMasterAvail))
                $(`.sf-msk`).fadeOut();
            if (renObj) {
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

    this.showSubFormLoader = function () {
        this.showHideSubFormLoader("show", { maskItem: { Id: "body" } });
    };

    this.hideSubFormLoader = function () {
        this.showHideSubFormLoader("hide");
    };

    this.showHideSubFormLoader = function (op, ob) {
        let cxt = '';
        if (this.CurrentSubForm)
            cxt = this.CurrentSubForm.__MultiRenderCxt;
        $("#sf_loader" + cxt).EbLoader(op, ob);
    };

    this.GetMasterHeaderBtns = function (Op) {
        let header = new EbHeader();
        header.insertButton(`<button id="webformdiscardedit" class='btn' title='Discard Changes (Ctrl+Q)' style='display: none;'><i class="fa fa-times-circle-o" aria-hidden="true"></i></button>`);
        header.insertButton(`<button id="webformclone" class='btn' title='Copy this form to a new form' style='display: none;'><i class="fa fa-files-o" aria-hidden="true"></i></button>`);
        header.insertButton(`<button id="webformopensrc" class='btn' title='Open source record' style='display: none;'><i class="fa fa-external-link" aria-hidden="true"></i></button>`);

        header.insertButton(`<button id="webformclose" class='btn' title='Close' style='display: none;'><i class="fa fa-times" aria-hidden="true"></i></button>`);
        header.insertButton(`<button id="webformdelete" class='btn' title='Delete (Alt+D)' style='display: none;'><i class="fa fa-trash" aria-hidden="true"></i></button>`);
        header.insertButton(`<button id="webformlock" class='btn' title='Lock/Unlock' style='display: none;'><i class="fa fa-unlock-alt" aria-hidden="true"></i></button>`);
        header.insertButton(`<button id="webformcancel" class='btn' title='Cancel (Alt+C)' style='display: none;'><i class="fa fa-ban" aria-hidden="true"></i></button>`);
        header.insertButton(`<button id="webformnew" class="btn" title="New form (Alt+N)"  style="display: none;"><i class="fa fa-plus" aria-hidden="true"></i></button>`);
        header.insertButton(`<button id="webformedit" class='btn' title='Edit (Ctrl+E)' style='display: none;'><i class="fa fa-pencil" aria-hidden="true"></i></button>`);
        header.insertButton(`<div id="webformsave-selbtn"  style='display: none;' class="btn-select btn">
                                <button id="webformsave" class="savebtn" title="Save form (Ctrl+S)"><i class="fa fa-save" aria-hidden="true"></i></button>
                                <select class="selectpicker">
                                  
                                </select>
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
                                <select class="selectpicker"></select>
                            </div>`);

        header.insertButton(`<button id="webformaudittrail" class="btn" title="Audit Trail (Alt+H)" style='display: none;'><i class="fa fa-history" aria-hidden="true"></i></button>`);
        header.insertButton(`<button id="webformpusheddata" class="btn" title="Dependent Form Submissions" style='display: none;'><i class="fa fa-tags" aria-hidden="true"></i></button>`);

        header.insertButton(`<button id="webformsavedraft" role="save-draft" class="btn" title="Save as draft"><i class="icofont-ui-clip-board"></i></button>`);
        header.insertButton(`<button id="webformdeletedraft" role="delete-draft" class="btn" title="Delete draft"><i class="icofont-bin"></i></i></button>`);
        header.insertButton(`<button id="webforminvalidmsgs" onclick='ebcontext.webform.RenderCollection[0].FRC.toggleInvalidMSGs()' role="invalid-msgs" class="btn" title="Show all invalid inputs"><i class="icofont-exclamation-circle"></i></i></button>`);

        header.addRootObjectHelp(Op._formObj);
        this.MasterHeader = header;

        let headerBtns = {
            New: "webformnew",
            Edit: "webformedit",
            Save: "webformsave",
            SaveSel: "webformsave-selbtn",
            Delete: "webformdelete",
            Cancel: "webformcancel",
            AuditTrail: "webformaudittrail",
            Close: "webformclose",//& Open in new tab//&& Cancel editing.
            Clone: "webformclone",
            Lock: "webformlock",

            Excel: "webformexcel",
            ExcelSel: "webformexcel-selbtn",
            Print: "webformprint",
            PrintSel: "webformprint-selbtn",
            DraftSave: "webformsavedraft",
            DraftDelete: "webformdeletedraft",
            GotoInvalid: "webforminvalidmsgs",
            OpenSrc: "webformopensrc",
            Discard: "webformdiscardedit",
            Dependent: "webformpusheddata"
        }
        return headerBtns;
    };

    this.SetSubFormModal = function (cxt) {
        if ($(`#subFormModal${cxt}`).length === 0) {
            if ($('.sf-msk').length === 0)
                $("body").append(`<div class="sf-msk" style='display: none;'></div>`);
            let curLoc = ebcontext.locations.CurrentLocObj;
            $("body").append(`
<div id="subFormModal${cxt}" class="sf-container" style='display: none;'>
    <div class="sf-cont-body">
        <div id="subFormHeader${cxt}" class='sub-form-header'>
            <div class='sfh-loc'>
                <div style="font-size: 11px;">${curLoc.TypeName}</div>
                <div>${curLoc.ShortName}</div>
            </div>
            <div class='sfh-title'> Loading... </div>
            <div class='sfh-toolbar'> 
                <div class='sfh-tool-btns'>
                    <button id="subforminvalidmsgs${cxt}" style='display: none;' onclick='ebcontext.webform.RenderCollection[${this.RenderCollection.length}].FRC.toggleInvalidMSGs()' role="invalid-msgs" class="btn" title="Show all invalid inputs"><i class="icofont-exclamation-circle"></i></i></button>
                    <button id="subformsavedraft${cxt}" role="save-draft" class="btn" title="Save as draft" style='display: none;'><i class="icofont-ui-clip-board"></i></button>
                    <button id="subformpusheddata${cxt}" class="btn" title="Dependent Form Submissions" style='display: none;'><i class="fa fa-tags" aria-hidden="true"></i></button>
                    <button id="subformaudittrail${cxt}" class="btn" title="Audit Trail (Alt+H)" style='display: none;'><i class="fa fa-history" aria-hidden="true"></i></button>
                    <div id="subformprint-selbtn${cxt}" style='display: none;' class="btn-select btn">
                        <button id="subformprint${cxt}" class="savebtn" title="Print (Ctrl+P)"><i class="fa fa-print" aria-hidden="true"></i></button>
                        <select class="selectpicker"></select>
                    </div>
                    <div id="subformsave-selbtn${cxt}"  style='display: none;' class="btn-select btn">
                        <button id="subformsave${cxt}" class="savebtn" title="Save form (Ctrl+S)"><i class="fa fa-save" aria-hidden="true"></i></button>
                        <select class="selectpicker"></select>
                    </div>                    
                    <button id="subformedit${cxt}" class='btn' title='Edit (Ctrl+E)' style='display: none;'><i class="fa fa-pencil" aria-hidden="true"></i></button>
                    <button id="subformnew${cxt}" class="btn" title="New (Alt+N)" style='display: none;'><i class="fa fa-plus" aria-hidden="true"></i></button>
                    <button id="subformcancel${cxt}" class='btn' title='Cancel (Alt+C)' style='display: none;'><i class="fa fa-ban" aria-hidden="true"></i></button>
                    <button id="subformlock${cxt}" class='btn' title='Lock/Unlock' style='display: none;'><i class="fa fa-unlock-alt" aria-hidden="true"></i></button>
                    <button id="subformdelete${cxt}" class='btn' title='Delete (Alt+D)' style='display: none;'><i class="fa fa-trash" aria-hidden="true"></i></button>
                    <button id="subformdelete${cxt}" class='btn' title='Delete (Alt+D)' style='display: none;'><i class="fa fa-trash" aria-hidden="true"></i></button>
                    <button id="subformopensrc${cxt}" class='btn' title='Open source record' style='display: none;'><i class="fa fa-external-link" aria-hidden="true"></i></button>
                    <button id="subformclone${cxt}" class='btn' title='Copy this form to a new form' style='display: none;'><i class="fa fa-files-o" aria-hidden="true"></i></button>
                    <button id="subformdiscardedit${cxt}" class='btn' title='Discard Changes (Ctrl+Q)' style='display: none;'><i class="fa fa-times-circle-o" aria-hidden="true"></i></button>
                    <button id="subformopen${cxt}" class='' title='Open in new tab'><i class="fa fa-external-link" aria-hidden="true"></i></button>
                    <button id="subformmaximize${cxt}" class='' title='Maximize'><i class="fa fa-window-maximize" aria-hidden="true"></i></button>
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

    //#region EXTERNAL_Functions

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

    //#endregion EXTERNAL_Functions

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
