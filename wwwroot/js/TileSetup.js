var TileSetupJs = function (parentDiv, title, initObjList, searchObjList, objMetadata, searchAjax, chkUnChkItemCustomFunc, parentThis, options) {

    //PARAMETERS COMMON
    this.parentDiv = parentDiv;
    this.title = title;
    this.options = options || {};
    this.resultObject = [];
    this.initObjectList = initObjList === null ? [] : initObjList;
    this.objectList = searchObjList === null ? [] : searchObjList;
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

    this.init = function () {
        this.createBody.bind(this)(this.parentDiv, this.title);
    };

    this.getPresetModalBody = function () {
        let t = this.title.replace(/\s/g, "_");

        if (this.title === 'New IP') {
            return `   
            <div class="modal fade" id="addModal${t}" role="dialog">
                <div class="modal-dialog" style="width: 400px;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                            <h4 class="modal-title">${this.title}</h4>
                        </div>
                        <div class="modal-body" style="height:180px">
                            <div class="form-group">
                                <label style="font-family: open sans; font-weight: 300;">IP Address</label>
                                <input id="txtIpAddress${t}" class="form-control" placeholder="Type IP Address Here" title="IP Address">
                            </div>
                            <div class="form-group">
                                <label style="font-family: open sans; font-weight: 300;">Description</label>
                                <input id="txtIpDescription${t}" class="form-control" placeholder="Type Description Here" title="Description">
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
        else if (this.title === 'New DateTime') {
            return `   
            <div class="modal fade" id="addModal${t}" role="dialog">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                            <h4 class="modal-title">${this.title}</h4>
                        </div>   
                        <div class="modal-body" style="height:315px">
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label style="font-family: open sans; font-weight: 300;">Title</label>
                                        <input id="txtDtTitle${t}" type="text" class="form-control" placeholder="Type Title Here" title="Title for the Constraint">
                                    </div>
                                </div>
                                <div class="col-md-8">
                                    <div class="form-group">
                                        <label style="font-family: open sans; font-weight: 300;">Description</label>
                                        <input id="txtDtDescription${t}" class="form-control" placeholder="Type Description Here" title="Description for the Constraint">
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div style="padding-left: 15px;"><label style="font-family: open sans; font-weight: 300;">Select the Type of the Constraint</label></div>
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
                                        <label style="font-family: open sans; font-weight: 300;">Start DateTime</label>
                                        <input id="txtStartDate${t}" type="text" class="form-control" title="Start Date Time">
                                    </div>
                                    <div class="form-group">
                                        <label style="font-family: open sans; font-weight: 300;">End DateTime</label>
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
                                                <label style="font-family: open sans; font-weight: 300;">Start Time</label>
                                                <input id="txtStartTime${t}" type="text" class="form-control" title="Start Time">
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="form-group">
                                                <label style="font-family: open sans; font-weight: 300;">End Time</label>
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
                            <h4 class="modal-title">${this.title}</h4>
                        </div>   <div class="modal-body" style="height:400px">
                            <div class="input-group ">
                                <input id="txtSearch${t}" title="Type to Search" type="text" class="form-control" placeholder="Search">
                                <span class="input-group-btn">
                                    <button id="btnSearch${t}" title="Click to Search" class="btn btn-secondary" type="button"><i class="fa fa-search" aria-hidden="true"></i></button>
                                </span>
                            </div>
                            <div id="message${t}" style=" margin-left: 32%; margin-top: 25% ;font-size: 24px; color: #bbb; display:none;">Type Few Characters</div>
                            <div id="loader${t}" style=" margin-left:45%; margin-top:25% ; display:none;"> <i class="fa fa-spinner fa-pulse fa-4x" aria-hidden="true"></i></div>
                            <div id="divSearchResults${t}" style="height:338px; overflow-y:auto"></div>
                        </div>
                        <div class="modal-footer">
                            <button id="btnModalOk${t}" type="button" class="btn btn-default">OK</button>
                            <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>`;
        }
    };

    this.createBody = function (parent, title) {
        var t = title.replace(/\s/g, "_");
        $(parent).append(`
        <div class="row" style="padding:6px 0px">
            <div class="col-md-7"><div class="subHeading">${this.options.longTitle || ""}</div></div>
            <div class="col-md-3">
                <input id="txtDemoSearch${t}" type="search" class="form-control" placeholder="Search" title="Type to Search" style="padding-right:30px; display:inline-block; width:100%" />
                <span id="spanSrch${t}" class="glyphicon glyphicon-search form-control-feedback" style="top: 0px; right: 16px;"></span>
                <span id="spanRemv${t}" class="glyphicon glyphicon-remove form-control-feedback" style="top: 0px; right: 16px; display:none;"></span>                
            </div>
            <div class="col-md-2">
                <button type="button" class="btn" id="btnAddModal${t}" style="float:right"><i class="fa fa-plus" aria-hidden="true"></i>&nbsp${title}</button>
            </div>
        </div>
        <div class="container">`
            + this.getPresetModalBody() +
            `</div>
        <div id="divSelectedDisplay${t}" class="row tilediv1" style="Height: ${this.options.tileDivHeight || '500px'}"> </div>`);

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

            this.txtStartDate.datetimepicker({ datepicker: true, timepicker: true, format: "d/m/Y H:i" });
            this.txtEndDate.datetimepicker({ datepicker: true, timepicker: true, format: "d/m/Y H:i" });
            this.txtStartTime.datetimepicker({ datepicker: false, timepicker: true, format: "H:i" });
            this.txtEndTime.datetimepicker({ datepicker: false, timepicker: true, format: "H:i" });
        }
        else {
            this.txtSearch = $('#txtSearch' + t);
            this.btnSearch = $('#btnSearch' + t);
            this.loader = $('#loader' + t);
            this.divMessage = $('#message' + t);
            this.divSearchResults = $('#divSearchResults' + t);

            $(this.parentDiv).on('keyup', '#txtSearch' + t, this.keyUptxtSearch.bind(this));
            $(this.parentDiv).on('click', '#btnSearch' + t, this.keyUptxtSearch.bind(this));
            $(this.divSearchResults).on('change', ".SearchCheckbox", this.OnChangeSearchCheckbox.bind(this));
            $(this.divSelectedDisplay).on('click', ".dropDownViewClass", this.onClickViewFromSelected.bind(this));
        }


        $(this.parentDiv).on('keyup', '#txtDemoSearch' + t, this.keyUpTxtDemoSearch.bind(this));
        $(this.parentDiv).on('click', '#spanRemv' + t, this.onClickbtnClearDemoSearch.bind(this));
        $(this.parentDiv).on('click', '#btnModalOk' + t, this.clickbtnModalOkAction.bind(this));
        $(this.parentDiv).on('shown.bs.modal', '#addModal' + t, this.initModal.bind(this));
        $(this.parentDiv).on('hidden.bs.modal', '#addModal' + t, this.finalizeModal.bind(this));
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
            this.divSelectedDisplay.append(`<div style="text-align: center; height: 100%; display: flex; justify-content: center; align-items: center; font-size: 26px; color: #bbb; "> Nothing to Display </div>`);
        }
    };

    //FUNCTIONS FOR EXTERNAL USE--------------------------------------
    this.setObjectList = function (obj) {
        this.objectList = obj;
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
        for (let i = 0; i < this.initObjectList; i++) {
            let _present_item = $.grep(this.resultObject, function (a) {
                if (a.Id === this.initObjectList[i].Id)
                    return true;
            });
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
            this.txtSearch.focus();
            this.getSearchResult(false);
        }
    };

    this.finalizeModal = function () {
        if (this.title !== 'New IP' && this.title !== 'New DateTime') {
            $(this.txtSearch).val("");
            $(this.divSearchResults).children().remove();
        }

    };

    this.keyUptxtSearch = function (e) {
        $(this.divSearchResults).children().remove();
        this.divMessage.hide();
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
            if (this.objectList.length !== 0) {
                this.divMessage.hide();
                this.drawSearchResults(this.objectList, searchtext);
            }
            else {
                this.divMessage.text("... Nothing Found ...");
                this.divMessage.show();
            }
        }
        else if (!force && searchtext.length < 2) {
            this.loader.hide();
            this.divMessage.text("Type Few Characters");
            this.divMessage.show();
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

    this.getItemdetailsSuccess = function (data) {
        this.loader.hide();
        if (data.length === 0) {
            this.divMessage.text("... Nothing Found ...");
            this.divMessage.show();
            return;
        }
        this.drawSearchResults(data, "");
    };

    this.drawSearchResults = function (objList, srchTxt) {
        var txt = srchTxt;
        var divSelectedDisplay = this.divSelectedDisplay;
        var divSearchResults = this.divSearchResults;
        $(divSearchResults).children().remove();
        for (var i = 0; i < objList.length; i++) {
            var st = null;
            if (objList[i][this.objectMetadata[1]].substr(0, txt.length).toLowerCase() === txt.toLowerCase()) {
                if ($(divSelectedDisplay).find(`[data-id='${objList[i][this.objectMetadata[0]]}']`).length > 0) {
                    st = 'checked disabled';
                }
                this.appendToSearchResult(divSearchResults, st, { Id: objList[i][this.objectMetadata[0]], Name: objList[i][this.objectMetadata[1]], Data1: objList[i][this.objectMetadata[2]] });
            }
        }
        if ($(this.divSearchResults).children().length === 0) {
            this.divMessage.text("... Nothing Found ...");
            this.divMessage.show();
        }
    };

    this.OnChangeSearchCheckbox = function (e) {
        if (this.doChkUnChkItemCustomFunc !== null) {
            this.doChkUnChkItemCustomFunc(parentThis, e);
        }
    };

    this.appendToSearchResult = function (divSearchResults, st, obj) {
        var temp = `<div class='row searchRsulsItemsDiv' style='margin-left:5px; margin-right:5px' data-id='${obj.Id}'>
                        <div class='col-md-1' style="padding:10px">
                            <input type ='checkbox' class='SearchCheckbox' ${st} data-name = '${obj.Name}' data-id = '${obj.Id}' data-d1 = '${obj.Data1}' aria-label='...'>
                        </div>`;

        if (this.profilePicStatus === true)
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

        var checkedBoxList = $('.SearchCheckbox:checked');
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
        var itempresent = $.grep(this.resultObject, function (a) {
            if (a.Id === obj.Id)
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
                            <i class="fa fa-ellipsis-v dropdown-toggle" aria-hidden="true" data-toggle="dropdown" style="padding:0px 5px"></i>
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
            alert("Not Available in ReadOnly Mode");
            return;
        }
        if (confirm("Click OK to Remove")) {
            var parent = $(e.target).parents("div.col-md-4");
            for (var i = 0; i < this.resultObject.length; i++) {
                if (this.resultObject[i].Id == parent.attr('data-id')) {
                    this.resultObject.splice(i, 1);
                    parent.remove();
                    break;
                }
            }
            if (this.resultObject.length === 0)
                this.divSelectedDisplay.append(`<div style="text-align: center; height: 100%; display: flex; justify-content: center; align-items: center; font-size: 26px; color: #bbb; "> Nothing to Display </div>`);
        }
    };

    this.onClickViewFromSelected = function (e) {
        if (this.readOnly) {
            alert("Not Available in ReadOnly Mode");
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
                alert("SYSTEM ROLE");
        }
        else if (this.title === 'Add User Group') {
            window.open("../Security/ManageUserGroups?itemid=" + id, "_blank");
        }
    };

    this.init();
};
