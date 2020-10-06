var TileSetupJs = function (parentDiv, title, initObjList, searchObjList, objMetadata, searchAjax, chkUnChkItemCustomFunc, parentThis, options) {

    //PARAMETERS COMMON
    this.parentDiv = parentDiv;
    this.title = title;
    this.options = options || {};
    this.resultObject = [];
    this.initObjectList = initObjList === null ? [] : initObjList;
    this.objectList = searchObjList === null ? [] : searchObjList;//all
    this.objectMetadata = objMetadata;
    this.searchAjaxUrl = searchAjax;
    this.doChkUnChkItemCustomFunc = chkUnChkItemCustomFunc;
    this.parentthis = parentThis;

    //DOM ELEMENTS COMMON
    this.txtDemoSearch = null;
    this.spanSrch = null;
    this.spanRemv = null;
    this.btnAddModal = null;
    this.addModal = null;
    this.btnModalOk = null;
    this.divSelectedDisplay = null;

    //DOM ELEMENTS ROLE USERS
    this.txtSearch = null;
    this.btnSearch = null;
    this.loader = null;
    this.divMessage = null;
    this.divSearchResults = null;
    this.divSelected = null;
    this.pageInfo = null;

    //DOM ELEMENTS IP
    this.txtIpAddress = null;
    this.txtIpDescription = null;

    //DOM ELEMENTS DATE TIME
    this.txtDtTitle = null;
    this.txtDtDescription = null;
    this.radType = null;
    this.divOneTimeOverlay = null;
    this.divRecurringOverlay = null;
    this.txtStartDate = null;
    this.txtEndDate = null;
    this.divChkDay = null;
    this.txtStartTime = null;
    this.txtEndTime = null;

    //this.constraintIpObj = [];
    //this.constraintDateTimeObj = [];
    this.profilePicStatus = null;
    this.readOnly = false;
    this.isSrchRsltInitialized = false;

    this.init = function () {
        this.createBody.bind(this)(this.parentDiv, this.title);
    };

    this.getPresetModalBody = function () {
        let t = this.title.replace(/\s/g, "_");

        if (this.title === 'New IP') {
            return `   
            <div class="modal fade" id="addModal${t}" role="dialog">
                <div class="modal-dialog" style="display:flex; height:100%; justify-content:center; align-items:center; margin: 0 auto;">
                    <div class="modal-content" style="min-width:500px; padding: 15px;">
                        <div class="modal-header" style="border-style:none;">
                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                            <h4 class="modal-title" style="font-weight:400;">${this.title} Constraint</h4>
                        </div>
                        <div class="modal-body" style="height:180px">
                            <div class="form-group">
                                <label class="label-custom-style w-100">IP Address</label>
                                <input id="txtIpAddress${t}" class="form-control input-custom-style" title="IP Address. eg: 192.168.123.123">
                            </div>
                            <div class="form-group">
                                <label class="label-custom-style w-100">Description</label>
                                <input id="txtIpDescription${t}" class="form-control input-custom-style" title="Description">
                            </div>
                        </div>
                        <div class="modal-footer" style="border-style:none;">
                            <div style="display:flex;">
                                <button id="btnModalOk${t}" type="button" style="margin-left:auto;margin-right:10px;" class="ebbtn eb_btn-sm eb_btnblue">Ok</button>
                                <button type="button" class="ebbtn eb_btn-sm eb_btnplain" data-dismiss="modal">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        }
        else if (this.title === 'New DateTime') {
            return `   
            <div class="modal fade" id="addModal${t}" role="dialog">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                            <h4 class="modal-title">${this.title} Constraint</h4>
                        </div>   
                        <div class="modal-body" style="height:315px">
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label style="font-weight: 300;">Title</label>
                                        <input id="txtDtTitle${t}" type="text" class="form-control" placeholder="Type Title Here" title="Title for the Constraint">
                                    </div>
                                </div>
                                <div class="col-md-8">
                                    <div class="form-group">
                                        <label style="font-weight: 300;">Description</label>
                                        <input id="txtDtDescription${t}" class="form-control" placeholder="Type Description Here" title="Description for the Constraint">
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div style="padding-left: 15px;"><label style="font-weight: 300;">Select the Type of the Constraint</label></div>
                                <div class="col-md-4">
                                    <div class="radio">
                                        <label><input type="radio" name="radType${t}" value="OneTime" checked onchange="if($(event.target).prop('checked')) { $('#divRecurringOverlay${t}').show();  $('#divOneTimeOverlay${t}').hide();}">One Time</label>
                                    </div>                                    
                                </div>
                                <div class="col-md-8">
                                    <div class="radio">
                                        <label><input type="radio" name="radType${t}" value="Recurring" onchange="if($(event.target).prop('checked')) { $('#divRecurringOverlay${t}').hide();  $('#divOneTimeOverlay${t}').show();}">Recurring</label>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-4">
                                    <div id="divOneTimeOverlay${t}" style="position: absolute; z-index: 10; height: 100%; width: 100%; opacity: 0.7; background-color: #fff; display: none; margin-left: -15px;"></div>
                                    <div class="form-group">
                                        <label style="font-weight: 300;">Start DateTime</label>
                                        <input id="txtStartDate${t}" type="text" class="form-control" title="Start Date Time">
                                    </div>
                                    <div class="form-group">
                                        <label style="font-weight: 300;">End DateTime</label>
                                        <input id="txtEndDate${t}" type="text" class="form-control" title="End Date Time">
                                    </div>
                                </div>
                                <div class="col-md-8" style="position: relative;">
                                    <div id="divRecurringOverlay${t}" style="position: absolute; z-index: 10; height: 100%; width: 100%; opacity: 0.7; background-color: #fff; display: block; margin-left: -15px;"></div>
                                    <div id="divChkDay${t}" class="checkbox" style="padding-left: 25px; margin-top: 0px;">
                                        <label class="checkbox-inline" style="min-width: 28%; margin-left: 10px;"><input type="checkbox" data-label="Sun" data-code="0" checked>Sunday</label>
                                        <label class="checkbox-inline" style="min-width: 28%;"><input type="checkbox" data-label="Mon" data-code="1" checked>Monday</label>
                                        <label class="checkbox-inline" style="min-width: 28%;"><input type="checkbox" data-label="Tue" data-code="2" checked>Tuesday</label>
                                        <label class="checkbox-inline" style="min-width: 28%;"><input type="checkbox" data-label="Wed" data-code="3" checked>Wednesday</label>
                                        <label class="checkbox-inline" style="min-width: 28%;"><input type="checkbox" data-label="Thu" data-code="4" checked>Thursday</label>
                                        <label class="checkbox-inline" style="min-width: 28%;"><input type="checkbox" data-label="Fri" data-code="5" checked>Friday</label>
                                        <label class="checkbox-inline" style="min-width: 28%;"><input type="checkbox" data-label="Sat" data-code="6" checked>Saturday</label>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-4">
                                            <div class="form-group">
                                                <label style="font-weight: 300;">Start Time</label>
                                                <input id="txtStartTime${t}" type="text" class="form-control" title="Start Time">
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="form-group">
                                                <label style="font-weight: 300;">End Time</label>
                                                <input id="txtEndTime${t}" type="text" class="form-control" title="End Time">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button id="btnModalOk${t}" type="button" class="btn btn-default">OK</button>
                            <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>`;
        }
        else {
            return `   
            <div class="modal fade" id="addModal${t}" role="dialog">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                            <h4 class="modal-title" style="font-weight:400; line-height:1.0;">${this.title}</h4>
                        </div>   
                        <div class="modal-body">
                            <div class="input-group md-search-box">
                                <span class="input-group-btn">
                                    <button id="btnSearch${t}" title="Click to Search" class="btn btn-secondary" type="button"><i class="fa fa-search" aria-hidden="true"></i></button>
                                </span>
                                <input id="txtSearch${t}" title="Type to Search" type="text" class="form-control" placeholder="Search">                                
                            </div>
                            <div id="divSelected${t}"></div>
                            <div id="pageInfo${t}" class="ts-body-md-pageinfo">Showing 0 of 0</div>
                            <div id="message${t}" class="ts-body-md-msg">Type few characters</div>
                            <div id="loader${t}" class="ts-body-md-loader"> <i class="fa fa-spinner fa-pulse fa-4x" aria-hidden="true"></i></div>
                            <div id="divSearchResults${t}" class="ts-body-md-rslt"></div>
                        </div>
                        <div class="modal-footer">
                            <button id="btnModalOk${t}" class="ebbtn eb_btn-sm eb_btnblue">OK</button>
                            <button class="ebbtn eb_btn-sm eb_btnplain" data-dismiss="modal">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>`;
        }
    };

    this.createBody = function (parent, title) {
        var t = title.replace(/\s/g, "_");
        $(parent).append(`
        <div class="ts-head-div">
            <div class="col-md-7"><div class="ts-head-text">${this.options.longTitle || ""}</div></div>
            <div class="col-md-3" style="margin-left:auto;">
                <input id="txtDemoSearch${t}" type="search" class="form-control" placeholder="Search" title="Type to search" />
                <span id="spanSrch${t}" class="form-control-feedback ts-head-span"><i class="fa fa-search" aria-hidden="true"></i></span>
                <span id="spanRemv${t}" class="form-control-feedback ts-head-span" style="display:none;"><i class="fa fa-times" aria-hidden="true"></i></span>
            </div>
            <button class="ts-head-add-btn" id="btnAddModal${t}">
                <i class="fa fa-plus" aria-hidden="true"></i>&nbsp${title}
            </button>
        </div>
        <div class="container ts-body-div">${this.getPresetModalBody()}</div>
        <div id="divSelectedDisplay${t}" class="ts-body-disp" style="Height: ${this.options.tileDivHeight || 'auto'}"> </div>`);

        this.txtDemoSearch = $('#txtDemoSearch' + t);
        this.spanSrch = $('#spanSrch' + t);
        this.spanRemv = $('#spanRemv' + t);
        this.btnAddModal = $('#btnAddModal' + t);
        this.addModal = $('#addModal' + t);
        this.btnModalOk = $('#btnModalOk' + t);
        this.divSelectedDisplay = $('#divSelectedDisplay' + t);

        if (this.title === 'New IP') {
            this.txtIpAddress = $('#txtIpAddress' + t);
            this.txtIpDescription = $('#txtIpDescription' + t);
        }
        else if (this.title === 'New DateTime') {
            this.txtDtTitle = $('#txtDtTitle' + t);
            this.txtDtDescription = $('#txtDtDescription' + t);
            this.radType = 'radType' + t;
            this.divOneTimeOverlay = $('#divOneTimeOverlay' + t);
            this.divRecurringOverlay = $('#divRecurringOverlay' + t);
            this.txtStartDate = $('#txtStartDate' + t);
            this.txtEndDate = $('#txtEndDate' + t);
            this.divChkDay = $('#divChkDay' + t);
            this.txtStartTime = $('#txtStartTime' + t);
            this.txtEndTime = $('#txtEndTime' + t);

            this.txtStartDate.datetimepicker({ datepicker: true, timepicker: true, format: "d-m-Y H:i" });
            this.txtEndDate.datetimepicker({ datepicker: true, timepicker: true, format: "d-m-Y H:i" });
            this.txtStartTime.datetimepicker({ datepicker: false, timepicker: true, format: "H:i" });
            this.txtEndTime.datetimepicker({ datepicker: false, timepicker: true, format: "H:i" });
        }
        else {
            this.txtSearch = $('#txtSearch' + t);
            this.btnSearch = $('#btnSearch' + t);
            this.loader = $('#loader' + t);
            this.divMessage = $('#message' + t);
            this.divSearchResults = $('#divSearchResults' + t);
            this.divSelected = $('#divSelected' + t);
            this.pageInfo = $('#pageInfo' + t);

            $(this.parentDiv).on('keyup', '#txtSearch' + t, this.keyUptxtSearch.bind(this));
            $(this.parentDiv).on('click', '#btnSearch' + t, this.keyUptxtSearch.bind(this));
            //$(this.divSearchResults).on('change', ".SearchCheckbox", this.OnChangeSearchCheckbox.bind(this));
            $(this.divSelectedDisplay).on('click', ".dropDownViewClass", this.onClickViewFromSelected.bind(this));

            $(this.divSearchResults).on('click', ".ts-body-md-srch-rslt",
                function (e) {
                    let $chkbox = $(e.target);
                    let $srchRsltItem = $(e.currentTarget);
                    if (!$chkbox.hasClass('SearchCheckbox')) {
                        $chkbox = $srchRsltItem.find('input');//[type='checkbox']
                        $chkbox.prop('checked', !$chkbox.prop('checked'));
                    }
                    //if (this.doChkUnChkItemCustomFunc !== null) {
                    //    this.doChkUnChkItemCustomFunc(this.parentthis, $srchRsltItem);
                    //}
                    if (this.title === 'Add Roles') {
                        this.chkItemCustomFunc(this.parentthis, $srchRsltItem);
                    }
                }.bind(this));
        }


        $(this.parentDiv).on('keyup', '#txtDemoSearch' + t, this.keyUpTxtDemoSearch.bind(this));
        $(this.parentDiv).on('click', '#spanRemv' + t, this.onClickbtnClearDemoSearch.bind(this));
        $(this.parentDiv).on('click', '#btnModalOk' + t, this.clickbtnModalOkAction.bind(this));
        $(this.parentDiv).on('shown.bs.modal', '#addModal' + t, this.initModal.bind(this));
        $(this.parentDiv).on('hidden.bs.modal', '#addModal' + t, function () {
            if (this.title !== 'New IP' && this.title !== 'New DateTime') {
                $(this.txtSearch).val("");

                this.divSearchResults.hide();
            }
        }.bind(this));
        $(this.parentDiv).on('click', '#btnAddModal' + t, this.onClickBtnAddModal.bind(this));
        $(this.divSelectedDisplay).on('click', ".dropDownRemoveClass", this.onClickRemoveFromSelected.bind(this));

        if (this.objectMetadata.indexOf('ProfilePicture') > -1)
            this.profilePicStatus = true;

        if (this.initObjectList.length !== 0) {
            for (var i = 0; i < this.initObjectList.length; i++) {
                this.appendToSelected(this.divSelectedDisplay, { Id: this.initObjectList[i][this.objectMetadata[0]], Name: this.initObjectList[i][this.objectMetadata[1]], Data1: this.initObjectList[i][this.objectMetadata[2]] });
            }
        }
        else {
            this.divSelectedDisplay.append(`<div class="ts-body-nothing-text"> Nothing to display </div>`);
        }
    };

    //testing
    this.chkItemCustomFunc = function (_this, $srchRsltItem) {
        //_this.dependentList = [];
        //let $chkbox = $srchRsltItem.find('input');
        //$.each($(this.divSearchResults).children(), function (i, ob) {
        //    if (_this.dominantList.indexOf(parseInt($(ob).attr('data-id'))) !== -1) {
        //        $(ob).attr('disabled', 'disabled').css('pointer-events', 'none').css('opacity', '0.5');
        //        $(ob).find('input').prop('checked', false);
        //        //$(ob).removeAttr("checked");
        //        //$(ob).attr("disabled", "true");
        //    }
        //});

        //if ($chkbox.is(':checked')) {
        //    _this.findDependentRoles($chkbox.attr("data-id"));
        //    var st = "";
        //    var itemid = [];
        //    $.each(this.divSelectedDisplay.children(), function (i, ob) {
        //        for (var i = 0; i < _this.dependentList.length; i++) {
        //            if (_this.dependentList[i] == $(ob).attr('data-id')) {
        //                st += '\n' + $(ob).attr('data-name');
        //                itemid.push($(ob).attr('data-id'));
        //            }
        //        }
        //    });
        //    if (st !== '') {
        //        if (confirm("Continuing this Operation will Remove the following Item(s)" + st + "\n\nClick OK to Continue")) {
        //            for (i = 0; i < itemid.length; i++) {
        //                this.divSelectedDisplay.children("[data-id='" + itemid[i] + "']").remove();
        //            }
        //        }
        //        else {
        //            $srchRsltItem.removeAttr('disabled').css('pointer-events', 'all').css('opacity', '1.0');
        //            $chkbox.prop("checked", false);
        //        }
        //    }
        //}

        //$.each(this.divSearchResults.find('.SearchCheckbox:checked'), function (i, ob) {
        //    _this.findDependentRoles($(ob).attr('data-id'));
        //});
        //$.each(this.divSelectedDisplay.children(), function (i, ob) {
        //    _this.dependentList.push(parseInt($(ob).attr('data-id')));
        //    _this.findDependentRoles($(ob).attr('data-id'));
        //});
        //$.each(this.divSearchResults.children(), function (i, ob) {
        //    let $srIt = $(ob);
        //    let $ckBx = $(ob).find('input');
        //    if (_this.dependentList.indexOf(parseInt($srIt.attr('data-id'))) !== -1 || _this.dominantList.indexOf(parseInt($srIt.attr('data-id'))) !== -1) {
        //        $srIt.attr('disabled', 'disabled').css('pointer-events', 'none').css('opacity', '0.5');
        //        $ckBx.prop('checked', false);
        //        //$(ob).removeAttr("checked");
        //        //$(ob).attr("disabled", "true");
        //    }
        //    else {
        //        $srchRsltItem.removeAttr('disabled').css('pointer-events', 'all').css('opacity', '1.0');
        //        //$(ob).removeAttr("disabled");
        //    }

        //    if ($(this.divSelectedDisplay).children("[data-id=" + $(ob).attr('data-id') + "]").length > 0) {
        //        $srIt.attr('disabled', 'disabled').css('pointer-events', 'none').css('opacity', '0.5');
        //        $ckBx.prop('checked', true);
        //        //$(ob).attr("disabled", "true");
        //        //$(ob).prop("checked", "true");
        //    }
        //}.bind(this));
    };

    this.getBaseRoles = function (in_roleid, out_roleids = []) {
        for (let i = 0; i < this.parentthis.r2rList.length; i++) {
            if (this.parentthis.r2rList[i].Dependent == in_roleid && !out_roleids.includes(this.parentthis.r2rList[i].Dominant)) {
                out_roleids.push(this.parentthis.r2rList[i].Dominant);
                this.getBaseRoles(this.parentthis.r2rList[i].Dominant, out_roleids);
            }
        }
        return out_roleids;
    };
    this.getSubRoles = function (in_roleid, out_roleids = []) {
        for (let i = 0; i < this.parentthis.r2rList.length; i++) {
            if (this.parentthis.r2rList[i].Dominant == in_roleid && !out_roleids.includes(this.parentthis.r2rList[i].Dependent)) {
                out_roleids.push(this.parentthis.r2rList[i].Dependent);
                this.getSubRoles(this.parentthis.r2rList[i].Dependent, out_roleids);
            }
        }
        return out_roleids;
    };

    //FUNCTIONS FOR EXTERNAL USE--------------------------------------
    this.setObjectList = function (obj) {
        this.objectList = obj;
        this.isSrchRsltInitialized = false;
    };

    this.setReadOnly = function () {
        this.btnAddModal.hide();
        this.readOnly = true;
    };

    this.resetReadOnly = function () {
        this.btnAddModal.show();
        this.readOnly = false;
    };

    this.clearItems = function () {
        this.divSelectedDisplay.children().remove();
    };

    this.getItemIds = function () {
        var itemid = '';
        for (i = 0; i < this.resultObject.length; i++)
            itemid += this.resultObject[i].Id + ',';
        itemid = itemid.substring(0, itemid.length - 1);
        return itemid;
    };
    this.getExtendedJson = function () {
        if (this.title === 'New IP' || this.title === 'New DateTime') {
            let _ObjArr = [];
            for (let i = 0; i < this.resultObject.length; i++) {
                if (typeof this.resultObject[i].Id === 'string') {
                    _ObjArr.push(this.resultObject[i]._ExtObj);
                }
            }
            return JSON.stringify(_ObjArr);
        }
        return '';
    };
    this.getDeletedObjIds = function () {
        let ids = '';
        for (let i = 0; i < this.initObjectList.length; i++) {
            let _present_item = $.grep(this.resultObject, function (a, b) {
                if (b.Id === this.initObjectList[i].Id)
                    return true;
            }.bind(this,i));
            if (_present_item.length === 0) {
                ids += this.initObjectList[i].Id + ',';
            }
        }
        if(ids.length > 1)
            return ids.substring(0, ids.length - 1);
        return ids;
    };
    //-------------------------------------------------------------------


    this.onClickBtnAddModal = function () {
        if (this.title === 'New DateTime')
            EbMessage("show", { Message: 'Temporarily Suspended', AutoHide: true, Background: '#1e1ebf' });
        else
            $(this.addModal).modal('show');
    };

    this.keyUpTxtDemoSearch = function () {
        var f = 1;
        var divSelectedDisplay = this.divSelectedDisplay;
        var txt = $(this.txtDemoSearch).val().trim();
        if (txt === '') {
            $(this.spanRemv).hide();
            $(this.spanSrch).show();
        }
        else {
            $(this.spanSrch).hide();
            $(this.spanRemv).show();
        }

        $($(divSelectedDisplay).children("div.col-md-4")).each(function () {
            $(this).children().css('box-shadow', '1px 1px 2px 1px #fff');
            if ($(this).attr('data-name').toLowerCase().substring(0, txt.length) === txt.toLowerCase() && txt !== "") {
                $(this).children().css('box-shadow', '1px 1px 2px 1px #5bc0de');
                //scroll to search result
                if (f) {
                    var elem = $(this);
                    if (elem) {
                        var main = $(divSelectedDisplay);
                        var t = main.offset().top;
                        main.scrollTop(elem.offset().top - t);
                    }
                    f = 0;
                }
            }
        });
    };

    this.onClickbtnClearDemoSearch = function () {
        $(this.txtDemoSearch).val("");
        this.keyUpTxtDemoSearch();
    };

    this.initModal = function () {
        if (this.title === 'New IP') {
            this.txtIpAddress.val("");
            this.txtIpDescription.val("");
        }
        else if (this.title === 'New DateTime') {
            this.txtDtTitle.val("");
            this.txtDtDescription.val("");
            this.addModal.find("input[value='OneTime']").prop("checked", true);
            this.divOneTimeOverlay.hide();
            this.divRecurringOverlay.show();
            this.txtStartDate.val("");
            this.txtEndDate.val("");
            this.divChkDay.find("input[type=checkbox]").prop("checked", true);
            this.txtStartTime.val("");
            this.txtEndTime.val("");
        }
        else {
            this.divMessage.show();
            this.divSearchResults.hide();
            this.txtSearch.focus();
            this.initSearchResultDiv();
            this.getSearchResult(false);
        }
    };

    this.initSearchResultDiv = function () {
        if (!this.isSrchRsltInitialized)
            this.divSearchResults.empty();
        if (this.objectList.length === 0) {
            this.divMessage.text("... Nothing Found ...");
            this.divMessage.show();
            this.divSearchResults.hide();
        }
        else {
            if (!this.isSrchRsltInitialized) {
                for (let i = 0; i < this.objectList.length; i++) {
                    this.appendToSearchResult(this.divSearchResults,
                        {
                            Id: this.objectList[i][this.objectMetadata[0]],
                            Name: this.objectList[i][this.objectMetadata[1]],
                            Data1: this.objectList[i][this.objectMetadata[2]]
                        });
                }
                this.divSearchResults.find('img').Lazy();
            }
            $.each(this.divSearchResults.children(), function (i, obj) {
                $(obj).removeAttr('disabled').css('pointer-events', 'all').css('opacity', '1.0');
                $(obj).find('input').prop('checked', false);
            }.bind(this));

            if (this.parentthis.roleId > 0 && this.title === 'Add Roles') {
                let role_ids = this.getBaseRoles(this.parentthis.roleId);
                for (let j = 0; j < role_ids.length; j++) {
                    let $srchRsltTemp = this.divSearchResults.children(`[data-id='${role_ids[j]}']`);
                    if ($srchRsltTemp > 0)
                        $srchRsltTemp.attr('disabled', 'disabled').css('pointer-events', 'none').css('opacity', '0.5');
                }
            }

            $.each(this.divSelectedDisplay.children(), function (i, obj) {
                let $srchRslt = this.divSearchResults.children(`[data-id='${$(obj).attr('data-id')}']`);
                if ($srchRslt.length > 0) {
                    $srchRslt.attr('disabled', 'disabled').css('pointer-events', 'none').css('opacity', '0.5');
                    $srchRslt.find('input').prop('checked', true);

                    if (this.title === 'Add Roles') {
                        let role_ids = this.getBaseRoles(parseInt($(obj).attr('data-id')));
                        for (let j = 0; j < role_ids.length; j++) {
                            let $srchRsltTemp = this.divSearchResults.children(`[data-id='${role_ids[j]}']`);
                            if ($srchRsltTemp > 0)
                                $srchRsltTemp.attr('disabled', 'disabled').css('pointer-events', 'none').css('opacity', '0.5');
                        }
                    }
                }
            }.bind(this));
        }

        this.isSrchRsltInitialized = true;
    };

    this.keyUptxtSearch = function (e) {
        //$(this.divSearchResults).children().remove();
        this.divMessage.hide();
        this.divSearchResults.hide();
        this.loader.show();
        clearTimeout($.data(this, 'timer'));
        if (e.keyCode === 13 || this.searchAjaxUrl === null)
            this.getSearchResult(true);
        else
            $(this).data('timer', setTimeout(this.getSearchResult.bind(this, false), 500));
    };

    this.getSearchResult = function (force) {
        var searchtext = $(this.txtSearch).val().trim();
        var Url = this.searchAjaxUrl;
        if (Url === null) {
            this.loader.hide();
            this.divMessage.hide();
            this.divSearchResults.show();
            this.showSearchResults(searchtext);
        }
        else if (!force && searchtext.length < 2) {
            this.loader.hide();
            this.divMessage.text("Type few characters");
            this.divMessage.show();
            this.divSearchResults.hide();
            return;
        }
        else {
            $.ajax({
                type: "POST",
                url: Url,
                data: { srchTxt: searchtext },
                success: this.getItemdetailsSuccess.bind(this)
            });
        }
    };

    this.showSearchResults = function (srchTxt) {
        this.divSearchResults.children().hide();
        let limit = /*this.profilePicStatus ? 10 :*/ this.objectList.length;
        if (srchTxt === '') {
            for (let i = 0; i < limit; i++) {
                let $srchRslt = this.divSearchResults.children(`[data-id='${this.objectList[i][this.objectMetadata[0]]}']`);
                $srchRslt.show();
            }
            this.pageInfo.text(`Showing ${limit} of ${this.objectList.length}`);
        }
        else {
            let counter = 0;
            let matched = 0;
            for (let i = 0; i < this.objectList.length; i++) {
                if (this.objectList[i][this.objectMetadata[1]].toLowerCase().includes(srchTxt.toLowerCase())) {
                    if (counter < limit) {
                        let $srchRslt = this.divSearchResults.children(`[data-id='${this.objectList[i][this.objectMetadata[0]]}']`);
                        $srchRslt.show();
                        counter++;
                    }
                    matched++;
                }
            }
            this.pageInfo.text(`Showing ${counter} of ${matched}`);
            if (matched === 0) {
                this.divMessage.text("... Nothing found ...");
                this.divMessage.show();
                this.divSearchResults.hide();
            }
        }
    };

    this.getItemdetailsSuccess = function (data) {
        this.loader.hide();
        if (data.length === 0) {
            this.divMessage.text("... Nothing Found ...");
            this.divMessage.show();
            this.divSearchResults.hide();
            return;
        }
        this.drawSearchResults(data, "");
    };

    this.drawSearchResults = function (objList, srchTxt) {
        if (this.divSearchResults.children().length === 0 && objList.length === 0) {
            this.divMessage.text("... Nothing found ...");
            this.divMessage.show();
            this.divSearchResults.hide();
            return;
        }
        if (this.divSearchResults.children().length === 0) {
            for (let i = 0; i < objList.length; i++) {
                this.appendToSearchResult(this.divSearchResults, { Id: objList[i][this.objectMetadata[0]], Name: objList[i][this.objectMetadata[1]], Data1: objList[i][this.objectMetadata[2]] });
            }
            this.divSearchResults.find('img').Lazy();
        }

        this.divSearchResults.children().hide();
        let limit = this.profilePicStatus ? 10 : objList.length;
        if (srchTxt === '') {
            this.divSearchResults.children().hide();
            for (let i = 0; i < limit; i++) {
                this.setSrchRsltItem(objList, i);
            }
            this.pageInfo.text(`Showing ${limit} of ${objList.length}`);
        }
        else {
            let counter = 0;
            let matched = 0;
            for (let i = 0; i < objList.length; i++) {
                if (objList[i][this.objectMetadata[1]].toLowerCase().includes(srchTxt.toLowerCase())) {
                    if (counter < limit) {
                        this.setSrchRsltItem(objList, i);
                        counter++;
                    }
                    matched++;
                }
            }
            this.pageInfo.text(`Showing ${counter} of ${matched}`);
            if (matched === 0) {
                this.divMessage.text("... Nothing found ...");
                this.divMessage.show();
                this.divSearchResults.hide();
            }
        }
    };

    this.setSrchRsltItem = function (objList, i) {
        let data_id = objList[i][this.objectMetadata[0]];
        let $srchRslt = this.divSearchResults.children(`[data-id='${data_id}']`);
        //if (isFresh) {
        //    let $selDisp = this.divSelectedDisplay.find(`[data-id='${data_id}']`);
        //    if ($selDisp.length > 0) {
        //        $srchRslt.attr('disabled', 'disabled').css('pointer-events', 'none').css('opacity', '0.5');
        //        $srchRslt.find('input').prop('checked', true);
        //        if (this.title === 'Add Roles') {
        //            let base_roles = this.getBaseRoles(data_id); 
        //            for (let i = 0; i < base_roles; i++) {
        //                let $srchRsltTemp = this.divSearchResults.children(`[data-id='${base_roles[i]}']`);
        //                $srchRsltTemp.attr('disabled', 'disabled').css('pointer-events', 'none').css('opacity', '0.5');
        //                $srchRsltTemp.find('input').prop('checked', false);
        //            }
        //        }
        //    }
        //    else if (is not Dependent){
        //        $srchRslt.removeAttr('disabled').css('pointer-events', 'all').css('opacity', '1.0');
        //        $srchRslt.find('input').prop('checked', false);
        //    }
        //}
        $srchRslt.show();
    };

    this.appendToSearchResult = function (divSearchResults, obj) {
        var temp = `<div class='row ts-body-md-srch-rslt' disabled='disabled' data-id='${obj.Id}'>
                        <div class='col-md-1' style="padding:10px">
                            <input type ='checkbox' class='SearchCheckbox' data-name = '${obj.Name}' data-id = '${obj.Id}' data-d1 = '${obj.Data1}' aria-label='...'>
                        </div>`;

        if (false)//this.profilePicStatus === true
            temp += `   <div class='col-md-2'>
                            <img class='img-thumbnail pull-right' src='/images/dp/${obj.Id}.png' onerror="this.src = '/images/imagenotfound.svg';" />
                        </div>`;
        temp += `         <div class='col-md-8'>
                            <h5 name = 'head5' style='color:black;'>${obj.Name}</h5>
                            ${obj.Data1}
                        </div>
                    </div>`;
        $(divSearchResults).append(temp);
    };

    this.clickbtnModalOkAction = function () {
        if (this.title === 'New IP') {
            let descri = this.txtIpDescription.val().replace(/[^a-zA-Z0-9 ]/g, "");
            this.txtIpDescription.val(descri);
            if (this.txtIpAddress.val().trim() === "" || this.txtIpDescription.val().trim() === "") {
                EbMessage("show", { Message: 'Please Enter IP address/Description', AutoHide: true, Background: '#bf1e1e' });
                return;
            }
            var regex = /((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}/;
            if (!regex.test(this.txtIpAddress.val().trim())) {
                EbMessage("show", { Message: 'Please Enter a valid IP address', AutoHide: true, Background: '#bf1e1e' });
                return;
            }
        }
        else if (this.title === 'New DateTime') {
            if (this.txtDtTitle.val() === "" || this.txtDtDescription.val() === "") {
                EbMessage("show", { Message: 'Please Enter Title/Description', AutoHide: true, Background: '#bf1e1e' });
                return;
            }
            if ($("input:radio:checked[name='" + this.radType + "']").attr("value") === 'OneTime') {
                if (this.txtStartDate.val() === "" || this.txtEndDate.val() === "") {
                    EbMessage("show", { Message: 'Please Enter Start/End DateTime', AutoHide: true, Background: '#bf1e1e' });
                    return;
                }
            }
            else {
                if (this.txtStartTime.val() === "" || this.txtEndTime.val() === "") {
                    EbMessage("show", { Message: 'Please Enter Start/End Time', AutoHide: true, Background: '#bf1e1e' });
                    return;
                }
                if (this.divChkDay.find("input:checked[type=checkbox]").length === 0) {
                    EbMessage("show", { Message: 'Please check atleast one day', AutoHide: true, Background: '#bf1e1e' });
                    return;
                }
            }
        }
        this.drawSelected();
        $(this.addModal).modal('toggle');
        this.SortDiv(this.divSelectedDisplay);
    };
    this.SortDiv = function (mylist) {
        var listitems = mylist.children('div').get();
        listitems.sort(function (a, b) {
            return $(a).attr("data-name").toUpperCase().localeCompare($(b).attr("data-name").toUpperCase());
        });
        $.each(listitems, function (index, item) {
            mylist.append(item);
        });
    };
    this.drawSelected = function () {
        var t = title.replace(/\s/g, "_");
        let _extendedObj = {};
        if (this.title === 'New IP') {
            _extendedObj = { Ip: this.txtIpAddress.val().trim(), Description: this.txtIpDescription.val() };
            this.appendToSelected(this.divSelectedDisplay, { Id: "_" + this.txtIpAddress.val().trim(), Name: this.txtIpAddress.val(), Data1: this.txtIpDescription.val(), _ExtObj: _extendedObj });
            return;
        }
        else if (this.title === 'New DateTime') {
            let dscr = '';
            if ($("input:radio:checked[name='" + this.radType + "']").attr("value") === 'OneTime') {
                dscr = "One Time - " + this.txtStartDate.val() + " to " + this.txtEndDate.val();
                _extendedObj = {
                    Title: this.txtDtTitle.val().trim(),
                    Description: this.txtDtDescription.val().trim(),
                    Type: 1,
                    Start: this.txtStartDate.val(),
                    End: this.txtEndDate.val(),
                    DaysCoded: 0
                };
            }
            else {
                let _daysCode = 0;
                dscr = "Recurring - " + this.txtStartTime.val() + " to " + this.txtEndTime.val() + "<br/>";
                let $chkd = $(this.divChkDay.selector + " input:checkbox:checked");
                for (let i = 0; i < $chkd.length; i++) {
                    dscr += $($chkd[i]).attr('data-label') + " ";
                    _daysCode += Math.pow(2, $($chkd[i]).attr('data-code'));
                }
                _extendedObj = {
                    Title: this.txtDtTitle.val(),
                    Description: this.txtDtDescription.val(),
                    Type: 2,
                    Start: this.txtStartTime.val(),
                    End: this.txtEndTime.val(),
                    DaysCoded: _daysCode
                };
            }
            this.appendToSelected(this.divSelectedDisplay, { Id: "_" + this.txtDtTitle.val().trim(), Name: this.txtDtTitle.val(), Data1: dscr, _ExtObj: _extendedObj });
            return;
        }

        var checkedBoxList = this.divSearchResults.find('.SearchCheckbox:checked');
        var _this = this;
        $(checkedBoxList).each(function () {
            _this.appendToSelected(_this.divSelectedDisplay, { Id: $(this).attr('data-id'), Name: $(this).attr('data-name'), Data1: $(this).attr('data-d1') });
        });
    };
    this.appendToSelected = function (divSelected, obj) {
        if (this.resultObject.length === 0)
            this.divSelectedDisplay.children().remove();

        if ($(divSelected).find(`[data-id='${obj.Id}']`).length > 0) {
            return;
        }
        var itempresent = $.grep(this.resultObject, function (a, b) {
            if (b.Id === obj.Id)
                return true;
        });
        if (itempresent.length === 0)
            this.resultObject.push(obj);

        var temp = `<div class="col-md-4 container-md-4" data-id='${obj.Id}' data-name='${obj.Name}'>
                        <div class="mydiv1" style="overflow:visible;">
                            <div class="icondiv1">`;
        if (this.profilePicStatus === true)
            temp += `<img style = "width:52px" class='img-thumbnail pull-right' src='../images/dp/${obj.Id}.png' onerror="this.src = '/images/imagenotfound.svg';" />`;
        else
            temp += `<b>${obj.Name.substring(0, 1).toUpperCase()}</b>`;
        temp += `     </div>
                    <div class="textdiv1">
                        <b>${obj.Name}</b>
                        <div style="font-size: smaller;">&nbsp${obj.Data1}</div>
                    </div>
                    <div class="closediv1">`;
        if (this.objectMetadata.indexOf('_simpleClose') > -1)
            temp += `   <i class="fa fa-times dropDownRemoveClass" aria-hidden="true"></i>`;
        else if (this.objectMetadata.indexOf('_hideClose') > -1)
            temp += ``;
        else {
            temp += `     <div class="dropdown">
                            <i class="fa fa-ellipsis-v dropdown-toggle" aria-hidden="true" data-toggle="dropdown" style="padding:0px 6px"></i>
                            <ul class="dropdown-menu" style="left:-140px; width:160px;">`;
            if (!this.readOnly)
                temp += `<li><a href="#" class='dropDownViewClass'>View</a></li><li><a href="#" class='dropDownRemoveClass'>Remove</a></li>`;
            temp += `           </ul>
                        </div>`;
        }
        temp += `   </div>
                </div>
            </div>`;
        $(divSelected).append(temp);

    };

    this.onClickRemoveFromSelected = function (e) {
        if (this.readOnly) {
            EbMessage("show", { Message: 'Not Available in ReadOnly Mode', AutoHide: true, Background: '#bf1e1e' });
            return;
        }

        EbDialog("show",
            {
                Message: "Click OK to Remove",
                Buttons: {
                    "OK": {
                        Background: "green",
                        Align: "left",
                        FontColor: "white;"
                    },
                    "Cancel": {
                        Background: "violet",
                        Align: "right",
                        FontColor: "white;"
                    }
                },
                CallBack: function (name) {
                    if (name === "OK") {
                        var parent = $(e.target).parents("div.col-md-4");
                        for (var i = 0; i < this.resultObject.length; i++) {
                            if (this.resultObject[i].Id == parent.attr('data-id')) {
                                this.resultObject.splice(i, 1);
                                parent.remove();
                                break;
                            }
                        }
                        if (this.resultObject.length === 0)
                            this.divSelectedDisplay.append(`<div class="ts-body-nothing-text"> Nothing to display </div>`);
                    }
                }.bind(this)
            });
    };

    this.onClickViewFromSelected = function (e) {
        if (this.readOnly) {
            EbMessage("show", { Message: 'Not Available in ReadOnly Mode', AutoHide: true, Background: '#bf1e1e' });
            return;
        }
        var id = $(e.target).parents("div.col-md-4").attr('data-id');
        if (this.title === 'Add Users') {
            var _form = document.createElement("form");
            _form.setAttribute("method", "post");
            _form.setAttribute("action", "../Security/ManageUser");
            _form.setAttribute("target", "_blank");
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = "itemid";
            input.value = id;
            _form.appendChild(input);
            var mode = document.createElement('input');
            mode.type = 'hidden';
            mode.name = "Mode";
            mode.value = '1';
            _form.appendChild(mode);
            document.body.appendChild(_form);
            _form.submit();
            document.body.removeChild(_form);
        }
        else if (this.title === 'Add Roles') {
            if (id > 100)
                window.open("../Security/ManageRoles?itemid=" + id, "_blank");
            else
                EbMessage("show", { Message: 'SYSTEM ROLE', AutoHide: true, Background: '#1e1ebf' });
        }
        else if (this.title === 'Add User Group') {
            window.open("../Security/ManageUserGroups?itemid=" + id, "_blank");
        }
    };

    this.init();
};
