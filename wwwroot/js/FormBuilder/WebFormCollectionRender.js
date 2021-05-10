﻿const WebFormCollectionRender = function (Option) {
    this.FormCollection = [];//renderer collection
    this.MasterHeader = null;


    this.Init = function (Op) {
        if (Op._source === 'master') {
            let _options = {
                formObj: Op._formObj,
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
            this.FormCollection.push(WebForm);
        }
        else if (Op.Source === 'tv' || Op.Source === 'ps'){
            //
            //
            //
        }
        this.SetSubFormModal();
    };

    this.PopupForm = function (refId, params, mode) {

        this.showSubForm();

        let existing = this.FormCollection.find(e => e.formRefId === refId);

        if (existing) {
            existing.startNewMode();
            //
            //
        }
        else {
            this.showSubFormLoader();
            $.ajax({
                type: "POST",
                url: "/WebForm/GetFormForRendering",
                data: {
                    refId: refId,
                    _params: params,
                    _mode: mode,
                    _locId: ebcontext.locations.getCurrent()
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    this.hideSubFormLoader();
                    EbMessage("show", { Message: `Something Unexpected Occurred`, AutoHide: true, Background: '#aa0000' });
                }.bind(this),
                success: function (result) {
                    this.hideSubFormLoader();
                    let resp = JSON.parse(result);
                    if (resp.ErrorMessage) {
                        console.error(resp.ErrorMessage);
                        EbMessage("show", { Message: resp.Message, AutoHide: true, Background: '#aa0000' });
                        return;
                    }

                    let FormObj = JSON.parse(resp.WebFormObj);

                    if (!FormObj.MakeEbSidUnique) {
                        console.error('MakeEbSidUnique must be true for popup form');
                        EbMessage("show", { Message: "Form rendering failed. Contact admin.", AutoHide: true, Background: '#aa0000' });
                        return;
                    }

                    let WebForm = new WebFormRender({
                        formObj: FormObj,
                        $formCont: $("#subForm-cont"),
                        headerBtns: this.GetSlaveHeaderBtns(),
                        formRefId: FormObj.RefId,
                        mode: resp.Mode,
                        renderMode: 2,//Partial
                        rowId: resp.RowId,
                        draftId: resp.DraftId,
                        formData: (resp.DraftId > 0 ? JSON.parse(resp.Draft_FormData) : JSON.parse(resp.FormDataWrap).FormData),
                        userObject: ebcontext.user,
                        cid: ebcontext.sid,
                        env: ebcontext.env,
                        isPartial: false,
                        formPermissions: resp.FormPermissions,
                        headerObj: this.MasterHeader,
                        formHTML: resp.WebFormHtml,
                        disableEditBtn: resp.DisableEditButton
                    });

                    this.FormCollection.push(WebForm);

                }.bind(this)
            });
        }
    };

    this.GetSlaveHeaderBtns = function () {
        return {
            New: "subformnew",
            Edit: "subformedit",
            Save: "subformsave",
            OpenInNewTab: "subformopen",
            Close: "webformclose",//& Open in new tab//&& Cancel editing.            
        };
    };

    this.showSubForm = function () {
        $(`#subFormModal,.sf-msk`).fadeIn();
    };

    this.hideSubForm = function () {
        $(`#subFormModal,.sf-msk`).fadeOut();
    };

    this.showSubFormLoader = function () {
        $("#sf_loader").EbLoader("show", { maskItem: { Id: "#WebForm-cont" } });
    };

    this.hideSubFormLoader = function () {
        $("#sf_loader").EbLoader("hide");
    };

    this.GetMasterHeaderBtns = function (Op) {
        let header = new EbHeader();
        header.insertButton(`<button id="webformclone" class='btn' title='Copy this form to a new form' style='display: none;'><i class="fa fa-files-o" aria-hidden="true"></i></button>`);
        header.insertButton(`<button id="webformopensrc" class='btn' title='Open source record' style='display: none;'><i class="fa fa-external-link" aria-hidden="true"></i></button>`);

        header.insertButton(`<button id="webformclose" class='btn' title='Close' style='display: none;'><i class="fa fa-times" aria-hidden="true"></i></button>`);
        header.insertButton(`<button id="webformdelete" class='btn' title='Delete' style='display: none;'><i class="fa fa-trash" aria-hidden="true"></i></button>`);
        header.insertButton(`<button id="webformlock" class='btn' title='Lock/Unlock' style='display: none;'><i class="fa fa-unlock-alt" aria-hidden="true"></i></button>`);
        header.insertButton(`<button id="webformcancel" class='btn' title='Cancel' style='display: none;'><i class="fa fa-ban" aria-hidden="true"></i></button>`);
        header.insertButton(`<button id="webformnew" class="btn" title="New form(Alt+N)"  style="display: none;"><i class="fa fa-plus" aria-hidden="true"></i></button>`);
        header.insertButton(`<button id="webformedit" class='btn' title='Edit' style='display: none;'><i class="fa fa-pencil" aria-hidden="true"></i></button>`);
        header.insertButton(`<div id="webformsave-selbtn"  style='display: none;' class="btn-select btn">
                                <button id="webformsave" class="savebtn" title="Save form(Ctrl+S)"><i class="fa fa-save" aria-hidden="true"></i></button>
                                <select class="selectpicker">
                                  <option data-token="new" data-title="Save and new" data-icon="fa-save"> & New</option>
                                  <option data-token="edit" data-title="Save and edit" data-icon="fa-save"> & Continue</option>
                                  <option data-token="view" data-title="Save and view" data-icon="fa-save"> & View</option>
                                  <option data-token="close" data-title="Save and close" data-icon="fa-save"> & Close</option>
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
                                <button id="webformprint" class="savebtn" title="Print"><i class="fa fa-print" aria-hidden="true"></i></button>
                                <select class="selectpicker"></select>
                            </div>`);

        header.insertButton(`<button id="webformaudittrail" class="btn" title="Audit Trail" style='display: none;'><i class="fa fa-history" aria-hidden="true"></i></button>`);

        header.insertButton(`<button id="webformsavedraft" role="save-draft" class="btn" title="Save as draft"><i class="icofont-ui-clip-board"></i></button>`);
        header.insertButton(`<button id="webformdeletedraft" role="delete-draft" class="btn" title="Delete draft"><i class="icofont-bin"></i></i></button>`);
        header.insertButton(`<button id="webforminvalidmsgs" onclick='renderer.FRC.toggleInvalidMSGs()' role="invalid-msgs" class="btn" title="Show all invalid inputs"><i class="icofont-exclamation-circle"></i></i></button>`);

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
            OpenSrc: "webformopensrc"
        }
        return headerBtns;
    };

    this.SetSubFormModal = function () {
        if ($("#subFormModal").length === 0)
            $("body").prepend(`
<div class="sf-msk" style='display: none;'></div>
<div id="subFormModal" class="sf-container" style='display: none;'>
    <div class="sf-cont-body">
        <div id="subFormHeader">
            <div class='sfh-title'> WebForm Popup </div>
            <div class='sfh-toolbar'> 
                <div class='sfh-tool-btns'>
                    <button id="subformedit" class='btn' title='Edit' style='display: none;'><i class="fa fa-pencil" aria-hidden="true"></i></button>
                    <button id="subformnew" class="btn" title="New" style='display: none;'><i class="fa fa-plus" aria-hidden="true"></i></button>
                    <button id="subformsave" class='btn' title='Save' style='display: none;'><i class="fa fa-save" aria-hidden="true"></i></button>
                    <button id="subformopen" class='btn' title='Open in new tab'><i class="fa fa-external-link" aria-hidden="true"></i></button>
                    <button id="subformclose" class='btn' title='Close' data-dismiss="modal"><i class="fa fa-times" aria-hidden="true"></i></button>
                </div> 
            </div>
            <div class="sf_loader" id="sf_loader" style="top: 35px;"></div>
        </div>
        <div id="subFormOverlay">
            <div style="position: relative; top: 50%;"><i class="fa fa-spinner fa-pulse" aria-hidden="true"></i> Loading...</div>
        </div>
        <div id="subForm-cont"><div>
    </div>
</div>
   
`);        
        $("#subformclose").off('click').on('click', this.hideSubForm.bind(this));
        

        //var $modal = $('#subFormModal');
        //$modal.find('.modal-content')
        //    .css({
        //        width: 625,
        //        height: 175,
        //    })
        //    .resizable({
        //        minWidth: 625,
        //        minHeight: 175,
        //        handles: 'n, e, s, w, ne, sw, se, nw',
        //    })
        //    .draggable({
        //        handle: '#subFormHeader'
        //    });

    };

    this.SetPopupFormTitle = function (title, mode, lock, cancel) {        
        title = title + `<span mode="${mode}" class="fmode">${mode}</span>`;
        if (lock)
            title = title + "<span class='fmode' style='background-color: blue;'><i class='fa fa-lock'></i> Locked</span>";
        if (cancel)
            title = title + "<span class='fmode' style='background-color: red;'><i class='fa fa-ban'></i> Cancelled</span>";
        $("#subFormHeader .sfh-title").html(title);
    };

    this.Init(Option);

    //#region EXTERNAL_Functions

    //#endregion
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
