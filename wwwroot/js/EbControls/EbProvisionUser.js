let EbProvUserJs = function (ctrl, options) {
    this.ctrl = ctrl;
    this.Renderer = options.Renderer;
    this.ctrlopts = options.ctrlopts;
    this.userList = null;
    this.timer1 = null;
    this.extCtrls = {};
    this.lastReqstObj = { id: 0, fullname: null, email: null, phprimary: null };
    this.lastRespObj = {};
    this.isLastAjaxFailed = false;

    this.$ctrl;
    this.$refreshBtn;
    this.$selectBtn;
    this.$selectUserModal;
    this.$infoTxt;
    this.$infoUsr1;
    this.$infoUsr2;
    this.$infoUsrNew;
    this.$updateChkBx;

    this.$SelMdlSrch;
    this.$SelMdlPageInfo;
    this.$SelMdlLoader;
    this.$SelMdlUlist;
    this.$SelMdlBtn;

    this.init = function () {
        this.ctrlInit();

        //this.$refreshBtn.on('click', this.refreshBtnClicked.bind(this));
        this.$selectBtn.on('click', this.selectBtnClicked.bind(this));
        this.$SelMdlSrch.on('keyup', this.SearchUser.bind(this));
        this.$SelMdlUlist.on('click', '.pu-selmdl-uli .col-md-12', this.ClickedOnUserItem.bind(this));
        this.$SelMdlBtn.on('click', this.SelMdlOkClicked.bind(this));
        this.$updateChkBx.on('change', this.updateChkBxChanged.bind(this))
        this.$infoUsr1.on('click', this.ClickedOnUserTile.bind(this));
        this.$infoUsr2.on('click', this.ClickedOnUserTile.bind(this));
    };

    this.ctrlInit = function () {
        this.$ctrl = $('#' + this.ctrl.EbSid_CtxId);
        this.$ctrl.html(`
            <div class='pu-btn-cont'>
                <div class='pu-btn-select'><i class='fa fa-search'></i>&nbspSearch</div>
                <div class='pu-chkbox'><label><input type="checkbox"> Update existing user</label></div>
                <div class='pu-btn-refresh'><i class='fa fa-refresh'></i></div>
            </div>
            <div class='pu-txt-info'>- Not assigned yet -</div>
		    <div class='pu-users-info'>
                <span class='pu-user' style='display: none;'></span>
                <span class='pu-user' style='display: none;'></span>
                <span class='pu-user' style='display: none;'></span>
            </div>
		    <div class='pu-req-act'></div>`);

        this.$refreshBtn = this.$ctrl.find('.pu-btn-refresh');
        this.$selectBtn = this.$ctrl.find('.pu-btn-select');
        this.$infoTxt = this.$ctrl.find('.pu-txt-info');
        this.$infoUsr1 = this.$ctrl.find('.pu-users-info .pu-user:eq(0)');
        this.$infoUsr2 = this.$ctrl.find('.pu-users-info .pu-user:eq(1)');
        this.$infoUsrNew = this.$ctrl.find('.pu-users-info .pu-user:eq(2)');
        this.$updateChkBx = this.$ctrl.find(".pu-chkbox [type='checkbox']");
        this.disableCheckBox();

        this.$selectUserModal = $(`#${this.ctrl.EbSid_CtxId}_selMdl`);
        if (this.$selectUserModal.length === 0) {
            $('body').append(
                `<div class="modal fade pu-sel-usr" id="${this.ctrl.EbSid_CtxId}_selMdl" role="dialog">
                <div class="modal-dialog" style="width: 440px;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                            <h5 class="modal-title">Select a user</h5>
                        </div>
                        <div class="modal-body" style="height: calc(100vh - 180px);">
                            <div class="input-group">
                                <span class="input-group-addon" style="background: white;">
                                    <i class="fa fa-search" aria-hidden="true"></i>
                                </span>
                                <input style="border-left: none;" title="Type here..." type="text" class="pu-selmdl-srch form-control" placeholder="Type here...">                                
                            </div>
                            <div class="pu-selmdl-pi" style="color: #aaa; font-size: 12px; text-align: right; font-style: italic;">Showing 0 of 0</div>
                            <div class="pu-selmdl-ldr" style="text-align: center; padding-top: calc(50vh - 150px);"><i class="fa fa-spinner fa-pulse" aria-hidden="true"></i>&nbspLoading...</div>
                            <div class="pu-selmdl-usrlst" style="max-height: calc(100vh - 246px); overflow-y: auto;"></div>
                        </div>
                        <div class="modal-footer">
                            <button class="pu-selmdl-btn ebbtn eb_btn-sm eb_btnblue">Select</button>
                            <button class="ebbtn eb_btn-sm eb_btnplain" data-dismiss="modal">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>`);
            this.$selectUserModal = $(`#${this.ctrl.EbSid_CtxId}_selMdl`);
        }
        this.$SelMdlSrch = this.$selectUserModal.find('.pu-selmdl-srch');
        this.$SelMdlPageInfo = this.$selectUserModal.find('.pu-selmdl-pi');
        this.$SelMdlLoader = this.$selectUserModal.find('.pu-selmdl-ldr');
        this.$SelMdlUlist = this.$selectUserModal.find('.pu-selmdl-usrlst');
        this.$SelMdlBtn = this.$selectUserModal.find('.pu-selmdl-btn');

        this.ctrl._JsCtrlMng = this;

        this.ctrl.setValue = function () {
            if (!this.DataVals)
                return;

            let _d = JSON.parse(this.DataVals.F);
            let dataObj = { id: _d['map_id'], fullname: _d['map_fullname'], email: _d['map_email'], phprimary: _d['map_phprimary'] };
            if (!_d['map_id'])
                this._JsCtrlMng.appendPuInfo('- Not assigned yet -');
            else if (_d['id'] === _d['map_id'])
                this._JsCtrlMng.appendPuInfo('Created user details...', null, null, dataObj);
            else
                this._JsCtrlMng.appendPuInfo('Linked user details...', null, null, dataObj);

            this._JsCtrlMng.lastReqstObj = dataObj;

        }.bind(this.ctrl);

        this.ctrl.disable = function () {
            this.__IsDisable = true;
            let $c = $('#' + this.EbSid_CtxId);
            $c.find('.pu-btn-select').css({ 'pointer-events': 'none', 'background': '#555' });
            $c.find('.pu-user').css('pointer-events', 'none');
            this._JsCtrlMng.disableCheckBox();
        }.bind(this.ctrl);

        this.ctrl.enable = function () {
            this.__IsDisable = false;
            let $c = $('#' + this.EbSid_CtxId);
            $c.find('.pu-btn-select').css({ 'pointer-events': '', 'background': '' });
            $c.find('.pu-user').css('pointer-events', '');
        }.bind(this.ctrl);

        $.each(this.ctrl.Fields.$values, function (i, obj) {
            if (obj.ControlName !== '') {
                let c = getObjByval(this.ctrlopts.flatControls, "Name", obj.ControlName);
                if (c) {
                    obj.Control = c;
                    this.bindExtCtrlChange(obj, 'fullname');
                    this.bindExtCtrlChange(obj, 'email');
                    this.bindExtCtrlChange(obj, 'phprimary');
                }
            }
        }.bind(this));
    };

    this.bindExtCtrlChange = function (obj, key) {
        if (obj.Name === key) {
            this.extCtrls[key] = obj.Control;
            obj.Control.bindOnChange(this.CtrlValueChanged.bind(this, key));
        }
    };

    this.isCtrlValChanged = function (key) {
        if (this.extCtrls[key]) {
            let val = this.extCtrls[key].getValue();
            if (this.lastReqstObj[key] !== val) {
                this.lastReqstObj[key] = val;
                if (key !== 'fullname') {
                    this.show_inp_loader(key);
                }
                return true;
            }
        }
        return false;
    };

    this.CtrlValueChanged = function (key) {
        if (this.extCtrls[key] && this.extCtrls[key].___DoNotUpdateDataVals)
            return;
        clearTimeout(this.timer1);
        this.timer1 = setTimeout(this.refreshBtnClicked.bind(this), 500);
    };

    this.refreshBtnClicked = function (e) {
        let valChanged = false;
        this.isCtrlValChanged('fullname');
        valChanged = this.isCtrlValChanged('email');
        valChanged = this.isCtrlValChanged('phprimary') || valChanged;

        if (!valChanged && !this.isLastAjaxFailed)
            return;
        this.isLastAjaxFailed = false;

        this.removeInvalidStyle('email');
        this.removeInvalidStyle('phprimary');


        //if (this.$updateChkBx.prop('checked')) {
        //    this.$infoTxt.html(`Data save will link and update the following user...`);
        //    this.setpUserHtml(this.$infoUsrNew, {
        //        fullname: this.lastReqstObj['fullname'],
        //        email: this.lastReqstObj['email'],
        //        phprimary: this.lastReqstObj['phprimary']
        //    });
        //    return;
        //}

        this.lastReqstObj['id'] = this.ctrl.getValue();
        if (!this.lastReqstObj['email'] && !this.lastReqstObj['phprimary']) {
            this.appendPuInfo('Please enter email/phone to refresh!');
            this.$refreshBtn.html(`<i class='fa fa-refresh'></i>`);
            this.hide_inp_loader('email');
            this.hide_inp_loader('phprimary');
            return;
        }

        this.$refreshBtn.html(`<i class='fa fa-refresh fa-pulse'></i>`);
        let requestObj = {};
        requestObj[this.ctrl.Name] = this.lastReqstObj;
        $.ajax({
            type: "POST",
            url: "/WebForm/CheckEmailAndPhone",
            data: {
                RefId: this.Renderer.formRefId,
                RowId: this.Renderer.rowId,
                Data: JSON.stringify(requestObj)
            },
            error: function (xhr, ajaxOptions, thrownError) {
                this.appendPuInfo('Something went wrong');
                this.$refreshBtn.html(`<i class='fa fa-refresh'></i>`);
                this.isLastAjaxFailed = true;
                this.removeInvalidStyle('email');
                this.hide_inp_loader('email');
                this.removeInvalidStyle('phprimary');
                this.hide_inp_loader('phprimary');
            }.bind(this),
            success: this.checkEmailAndPhoneSuccess.bind(this, JSON.parse(JSON.stringify(this.lastReqstObj)))
        });
    };

    this.checkEmailAndPhoneSuccess = function (reqObj, res) {
        if (this.lastReqstObj['email'] !== reqObj['email'] || this.lastReqstObj['phprimary'] !== reqObj['phprimary'])
            return;

        let linkMsg = 'Data save will link to the user with following details...';
        let chooseMsg = 'Choose a user to continue.';
        let selectMsg = 'Select the user to continue.';
        let nothingMsg = 'Nothing to update to the following user.';

        this.hide_inp_loader('email');
        this.hide_inp_loader('phprimary');

        this.$refreshBtn.html(`<i class='fa fa-refresh'></i>`);
        let respObj = JSON.parse(res)[this.ctrl.Name];
        this.lastRespObj = respObj;

        if (!(this.Renderer.rowId > 0 && respObj.curData)) {//new 
            if (respObj.emailData === null && respObj.phoneData === null) {
                let msg = `Data save will create a user with following details...`;
                this.appendPuInfo(msg, null, null, reqObj);
            }
            else if (respObj.emailData !== null && respObj.phoneData !== null) {
                if (respObj.emailData.id !== respObj.phoneData.id) {
                    this.appendPuInfo(chooseMsg, respObj.emailData, respObj.phoneData);
                    this.addInvalidStyle('email', null, respObj.phoneData);
                    this.addInvalidStyle('phprimary', null, respObj.emailData);
                }
                else {
                    this.appendPuInfo(linkMsg, respObj.emailData);
                    this.makeUserTileActive(this.$infoUsr1, respObj.emailData);
                }
            }
            else if (respObj.emailData !== null && respObj.phoneData === null) {
                if (reqObj['phprimary']) {
                    this.appendPuInfo(selectMsg, respObj.emailData);
                    this.addInvalidStyle('phprimary', null, respObj.emailData);
                }
                else {
                    this.appendPuInfo(linkMsg, respObj.emailData);
                    this.makeUserTileActive(this.$infoUsr1, respObj.emailData);
                }
            }
            else if (respObj.emailData === null && respObj.phoneData !== null) {
                if (reqObj['email']) {
                    this.appendPuInfo(selectMsg, respObj.phoneData);
                    this.addInvalidStyle('email', null, respObj.phoneData);
                }
                else {
                    this.appendPuInfo(linkMsg, respObj.phoneData);
                    this.makeUserTileActive(this.$infoUsr1, respObj.phoneData);
                }
            }
        }
        else { //edit
            let _od = JSON.parse(this.ctrl.DataVals.F);//_od['id'] _od['map_id']

            if (respObj.emailData === null && respObj.phoneData === null) {
                let msg = `Data save will create a user with following details...`;
                this.appendPuInfo(msg, null, null, reqObj);
            }
            else if (respObj.emailData !== null && respObj.phoneData !== null) {
                if (respObj.emailData.id === respObj.phoneData.id && respObj.phoneData.id === _od['map_id']) {
                    this.appendPuInfo(nothingMsg, null, null, reqObj);
                }
                else if (respObj.phoneData.id === _od['map_id']) {
                    this.appendPuInfo(chooseMsg, respObj.phoneData, respObj.emailData);
                    this.addInvalidStyle('email', null, respObj.phoneData);
                }
                else if (respObj.emailData.id === _od['map_id']) {
                    this.appendPuInfo(chooseMsg, respObj.emailData, respObj.phoneData);
                    this.addInvalidStyle('phprimary', null, respObj.emailData);
                }
                else {
                    this.appendPuInfo(chooseMsg, respObj.emailData, respObj.phoneData);
                    this.addInvalidStyle('email', null, respObj.phoneData);
                    this.addInvalidStyle('phprimary', null, respObj.emailData);
                }
            }
            else if (respObj.emailData !== null && respObj.phoneData === null) {
                if (reqObj['phprimary']) {
                    if (respObj.emailData.id === _od['map_id']) {
                        this.appendPuInfo(selectMsg, respObj.emailData);
                        this.addInvalidStyle('phprimary', null, respObj.emailData);
                    }
                    else {
                        this.appendPuInfo(selectMsg, respObj.emailData);
                        this.addInvalidStyle('email', `Must be unique because '${reqObj['phprimary']}' is unique`);
                        this.addInvalidStyle('phprimary', null, respObj.emailData);
                    }
                }
                else {
                    if (respObj.emailData.id === _od['map_id']) {
                        this.appendPuInfo(nothingMsg, respObj.emailData);
                        this.makeUserTileActive(this.$infoUsr1, respObj.emailData);
                    }
                    else {
                        this.appendPuInfo(linkMsg, respObj.emailData);
                        this.makeUserTileActive(this.$infoUsr1, respObj.emailData);
                    }
                }
            }
            else if (respObj.emailData === null && respObj.phoneData !== null) {
                if (reqObj['email']) {
                    if (respObj.phoneData.id === _od['map_id']) {
                        this.appendPuInfo(selectMsg, respObj.phoneData);
                        this.addInvalidStyle('email', null, respObj.phoneData);
                    }
                    else {
                        this.appendPuInfo(selectMsg, respObj.phoneData);
                        this.addInvalidStyle('email', null, respObj.phoneData);
                        this.addInvalidStyle('phprimary', `Must be unique because '${reqObj['email']}' is unique`);
                    }
                }
                else {
                    if (respObj.phoneData.id === _od['map_id']) {
                        this.appendPuInfo(nothingMsg, respObj.phoneData);
                        this.makeUserTileActive(this.$infoUsr1, respObj.phoneData);
                    }
                    else {
                        this.appendPuInfo(linkMsg, respObj.phoneData);
                        this.makeUserTileActive(this.$infoUsr1, respObj.phoneData);
                    }
                }
            }
        }
    };

    this.appendPuInfo = function (msg, info1 = null, info2 = null, infoNew = null) {
        this.$infoTxt.html(msg);
        this.setpUserHtml(this.$infoUsr1, info1);
        this.setpUserHtml(this.$infoUsr2, info2);
        this.setpUserHtml(this.$infoUsrNew, infoNew);

        this.disableCheckBox();
        this.enableExtCtrls();
    };

    this.setpUserHtml = function ($uSpan, obj) {
        let html = '';
        if (obj) {
            html += (obj['fullname'] || '--') + '<br>';
            html += '<i class="fa fa-envelope"></i> ' + (obj['email'] || '--') + '<br>';
            html += '<i class="fa fa-phone"></i> ' + (obj['phprimary'] || '--') + '<br>';
            $uSpan.show();
            $uSpan.data('data-obj', obj);
        }
        else {
            $uSpan.hide();
            $uSpan.data('data-obj', null);
        }
        $uSpan.removeClass('active');
        $uSpan.html(html);
    };

    this.selectBtnClicked = function () {
        this.$SelMdlBtn.css('background-color', '#888').css('pointer-events', 'none');
        this.$SelMdlUlist.find('.pu-selmdl-uli .col-md-12.active').removeClass('active');
        this.$selectUserModal.modal('show');
        if (this.userList === null) {
            $.ajax({
                type: "POST",
                url: "/WebForm/GetUserDetails",
                data: {
                    RefId: this.Renderer.formRefId,
                    RowId: this.Renderer.rowId,
                    CtrlName: this.ctrl.Name,
                    CurId: 1
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    EbMessage("show", { Message: 'Something unexpected occurred. Please try again.', AutoHide: true, Background: '#aa0000' });
                    this.$selectUserModal.modal('hide');
                    console.error('GetUserDetails failed');
                }.bind(this),
                success: function (res) {
                    this.$SelMdlLoader.hide();
                    this.$SelMdlUlist.empty();
                    this.userList = JSON.parse(res);

                    $.each(this.userList, function (i, obj) {
                        this.$SelMdlUlist.append(`
                        <div class='pu-selmdl-uli' data-id='${obj.Id}'>                            
                            <div class='col-md-12'>
                                <div style="font-weight: 500;">${obj.Name}</div> 
                                <span style="font-size: 12px;"> ${obj.Email}</span> <span style="font-size: 12px; float: right;">${obj.Phone}</span>
                            </div>
                        </div>`);
                    }.bind(this));
                    this.$SelMdlPageInfo.text(`Showing ${this.userList.length} of ${this.userList.length}`);
                }.bind(this)
            });
        }
    };

    this.SearchUser = function () {
        this.$SelMdlUlist.find('.pu-selmdl-uli .col-md-12.active').removeClass('active');
        this.$SelMdlBtn.css({ 'background-color': '#888', 'pointer-events': 'none' });
        let srchTxt = this.$SelMdlSrch.val().toLocaleLowerCase();
        if (srchTxt === '') {
            this.$SelMdlUlist.children().show();
            this.$SelMdlPageInfo.text(`Showing ${this.userList.length} of ${this.userList.length}`);
            return;
        }
        let count = 0;
        $.each(this.$SelMdlUlist.children(), function (i, obj) {
            let userid = parseInt($(obj).attr('data-id'));
            let item = this.userList.find(e => e.Id === userid);
            if (item) {
                if (item.Name.toLocaleLowerCase().includes(srchTxt) || item.Email.toLocaleLowerCase().includes(srchTxt) || item.Phone.toLocaleLowerCase().includes(srchTxt)) {
                    $(obj).show();
                    count++;
                }
                else
                    $(obj).hide();
            }
        }.bind(this));
        this.$SelMdlPageInfo.text(`Showing ${count} of ${this.userList.length}`);
    };

    this.ClickedOnUserItem = function (e) {
        this.$SelMdlUlist.find('.pu-selmdl-uli .col-md-12.active').removeClass('active');
        $(e.currentTarget).addClass('active');
        this.$SelMdlBtn.css({ 'background-color': '', 'pointer-events': '' });
    };

    this.SelMdlOkClicked = function (e) {
        let item = this.$SelMdlUlist.find('.pu-selmdl-uli .col-md-12.active');
        if (item.length > 0) {
            let userid = parseInt(item.closest('.pu-selmdl-uli').attr('data-id'));
            let uinfo = this.userList.find(e => e.Id === userid);
            this.$selectUserModal.modal('hide');
            let dataObj = { id: uinfo.Id, fullname: uinfo.Name, email: uinfo.Email, phprimary: uinfo.Phone };
            this.appendPuInfo(`Data save will link to the user with following details...`, dataObj);
            this.makeUserTileActive(this.$infoUsr1, dataObj);
        }
    };

    this.ClickedOnUserTile = function (e) {
        this.$infoUsr1.removeClass('active');
        this.$infoUsr2.removeClass('active');

        let dataObj = $(e.currentTarget).data('data-obj');
        if (dataObj && dataObj.id) {
            this.$infoTxt.html(`Data save will link to the user with following details...`);
            this.makeUserTileActive($(e.currentTarget), dataObj);
        }
    };

    this.makeUserTileActive = function ($infoUsr, dataObj) {
        $infoUsr.addClass('active');
        this.enableCheckBox();
        this.disableExtCtrls();
        this.ctrl.DataVals.Value = dataObj.id;

        this.updateExtCtrls('fullname', dataObj.fullname);
        this.updateExtCtrls('email', dataObj.email);
        this.updateExtCtrls('phprimary', dataObj.phprimary);

        this.removeInvalidStyle('email');
        this.removeInvalidStyle('phprimary');
    };

    this.addInvalidStyle = function (key, msg = null, dataObj = null) {
        if (this.extCtrls[key]) {
            let t = key === 'email' ? 'phprimary' : 'email';
            this.extCtrls[key].addInvalidStyle((msg || (dataObj ? `Must be '${dataObj[key] || 'blank'}' based on '${dataObj[t]}'` : 'Not allowed')), 'warning');
        }
    };

    this.removeInvalidStyle = function (key) {
        if (this.extCtrls[key])
            this.extCtrls[key].removeInvalidStyle();
    };

    this.show_inp_loader = function (key) {
        if (this.extCtrls[key])
            show_inp_loader($('#' + this.extCtrls[key].EbSid_CtxId), $());
    };

    this.hide_inp_loader = function (key) {
        if (this.extCtrls[key])
            hide_inp_loader($('#' + this.extCtrls[key].EbSid_CtxId), $());
    };

    this.updateExtCtrls = function (key, val) {
        if (this.extCtrls[key]) {
            this.lastReqstObj[key] = val;
            if (this.extCtrls[key].getValue() !== val)
                this.extCtrls[key].setValue(val);

            //if (!this.$updateChkBx.prop('checked'))
            //    this.extCtrls[key].disable();
        }
    };

    this.disableCheckBox = function () {
        this.$updateChkBx.prop('checked', false);
        this.$updateChkBx.prop('disabled', true);
        this.$updateChkBx.parent().css({ 'pointer-events': 'none', 'color': '#aaa' });
    };

    this.enableCheckBox = function () {
        //this.$updateChkBx.prop('disabled', false);
        //this.$updateChkBx.parent().css({ 'pointer-events': '', 'color': '' });
    };

    this.disableExtCtrls = function () {
        //if (this.extCtrls['fullname'])
        //    this.extCtrls['fullname'].disable();
        //if (this.extCtrls['email'])
        //    this.extCtrls['email'].disable();
        //if (this.extCtrls['phprimary'])
        //    this.extCtrls['phprimary'].disable();
    };

    this.enableExtCtrls = function () {
        //if (this.extCtrls['fullname'])
        //    this.extCtrls['fullname'].enable();
        //if (this.extCtrls['email'])
        //    this.extCtrls['email'].enable();
        //if (this.extCtrls['phprimary'])
        //    this.extCtrls['phprimary'].enable();
    };

    this.updateChkBxChanged = function (e) {
        if (this.$updateChkBx.prop('checked')) {
            this.enableExtCtrls();
        }
        else {
            this.disableExtCtrls();
            //this.setpUserHtml(this.$infoUsrNew, null);
            this.$infoTxt.html(`Data save will link to the user with following details...`);
            let $infoUsr = null;
            if (this.$infoUsr1.hasClass('active'))
                $infoUsr = this.$infoUsr1;
            else if (this.$infoUsr2.hasClass('active'))
                $infoUsr = this.$infoUsr2;
            if ($infoUsr) {
                let dataObj = $infoUsr.data('data-obj');
                if (dataObj) {
                    this.updateExtCtrls('fullname', dataObj.fullname);
                    this.updateExtCtrls('email', dataObj.email);
                    this.updateExtCtrls('phprimary', dataObj.phprimary);
                }
            }
        }
    };

    this.init();
};


//--------------------------------------------------------------------------------------------------------------//

let EbProvUserUniqueChkJs = function (options) {
    this.FormObj = options.FormObj;
    this.CallBackFn = options.CallBackFn;
    this.showLoaderFn = options.showLoaderFn;
    this.hideLoaderFn = options.hideLoaderFn;
    this.provUserAll = getFlatObjOfType(this.FormObj, "ProvisionUser");

    this.$Modal;
    this.$ModalBody;
    this.$OkBtn;
    this.abortSave = false;

    this.init = function () {
        if (this.provUserAll.length === 0) {
            this.CallBackFn(true);
            return;
        }
        this.initiateAjaxCall();
        this.initModal();
        this.$OkBtn.off('click').on('click', this.modalOkClicked.bind(this));
    };

    this.initModal = function () {
        this.$Modal = $('#ProvUserConfModal');
        if ($Modal.length === 0) {
            $('body').append(`
            <div class="modal fade" id="ProvUserConfModal" role="dialog">
                <div class="modal-dialog" style="width: 440px;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                            <h5 class="modal-title">User provision summary</h5>
                        </div>
                        <div class="modal-body" style="height: calc(80vh - 180px); overflow: auto;">

                        </div>
                        <div class="modal-footer">
                            <button id="puConfMdlOk" class="ebbtn eb_btn-sm eb_btnblue" type="button">Ok</button>
                            <button type="button" class="ebbtn eb_btn-sm eb_btnplain" data-dismiss="modal">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>`);
        }
        this.$Modal = $('#ProvUserConfModal');
        this.$ModalBody = this.$Modal.find('.modal-body');
        this.$OkBtn = this.$Modal.find('#puConfMdlOk');

        //this.$Modal.modal('show');
    };

    this.initiateAjaxCall = function () {
        let reqObj = {};
        $.each(this.provUserAll, function (i, pucObj) {
            reqObj[pucObj.Name] = {};
            reqObj[pucObj.Name]['id'] = pucObj.getValue();
            $.each(pucObj.Fields.$values, function (j, obj) {
                if (obj.Control) {
                    reqObj[pucObj.Name][obj.Name] = obj.Control.getValue();
                }
            }.bind(this));
            if (!reqObj[pucObj.Name]['email'] && !reqObj[pucObj.Name]['phprimary']) {
                delete reqObj[pucObj.Name];
            }
        }.bind(this));

        if ($.isEmptyObject(reqObj)) {
            this.CallBackFn(true);
            return;
        }

        this.showLoaderFn();
        $.ajax({
            type: "POST",
            url: "/WebForm/CheckEmailAndPhone",
            data: {
                RefId: this.formRefId,
                RowId: this.rowId,
                Data: JSON.stringify(reqObj)
            },
            error: function (xhr, ajaxOptions, thrownError) {
                EbMessage("show", { Message: 'Provision user unique check failed', AutoHide: true, Background: '#aa0000' });
                this.hideLoaderFn();
                console.error('CheckEmailAndPhone failed...');
            }.bind(this),
            success: this.ajaxCallSuccess.bind(this, reqObj)
        });
    };

    this.Msg = {
        New: 'New user will be created with following details..',
        Link: 'User already exists. Data will be link to the user with following details.',
        Link2: 'Data is already linked to the existing user with following details.',
        AlreayExists1: 'Email and phone already exits for different users.'
    };

    this.ajaxCallSuccess = function (reqObjAll, resp) {
        let respObjAll = JSON.parse(resp);
        let fullHtml = '';
        $.each(this.provUserAll, function (i, pucObj) {
            let _od = {};
            if (pucObj.DataVals)
                _od = JSON.parse(pucObj.DataVals.F);

            let reqObj = reqObjAll[pucObj.Name];
            let respObj = respObjAll[pucObj.Name];

            if (!respObj)
                return;

            if (!_od['map_id']) {//New
                if (respObj.emailData === null && respObj.phoneData === null) {
                    fullHtml += this.getUserTileHtml(this.Msg.New, reqObj);
                }
                else if (respObj.emailData !== null && respObj.phoneData !== null) {
                    if (respObj.emailData.id !== respObj.phoneData.id) {
                        fullHtml += this.getUserTileHtml(this.Msg.AlreayExists1, respObj.emailData, respObj.phoneData);
                        this.abortSave = true;
                    }
                    else {
                        fullHtml += this.getUserTileHtml(this.Msg.Link, respObj.emailData);
                    }
                }
                else if (respObj.emailData !== null && respObj.phoneData === null) {
                    if (reqObj['phprimary']) {
                        reqObj['email'] = '';
                        fullHtml += this.getUserTileHtml(this.Msg.New, reqObj);
                    }
                    else
                        fullHtml += this.getUserTileHtml(this.Msg.Link, respObj.emailData);
                }
                else if (respObj.emailData === null && respObj.phoneData !== null) {
                    if (reqObj['email']) {
                        reqObj['phprimary'] = '';
                        fullHtml += this.getUserTileHtml(this.Msg.New, reqObj);
                    }
                    else
                        fullHtml += this.getUserTileHtml(this.Msg.Link, respObj.phoneData);
                }
            }
            else {//edit
                if (respObj.emailData === null && respObj.phoneData === null) {
                    fullHtml += this.getUserTileHtml(this.Msg.New, reqObj);
                }
                else if (respObj.emailData !== null && respObj.phoneData !== null) {
                    if (respObj.emailData.id === respObj.phoneData.id && respObj.phoneData.id === _od['map_id']) {
                        //nothing to display
                    }
                    else if (respObj.emailData.id === respObj.phoneData.id) {
                        fullHtml += this.getUserTileHtml(this.Msg.Link, respObj.emailData);
                    }
                    else if (respObj.emailData.id === _od['map_id']) {
                        fullHtml += this.getUserTileHtml(this.Msg.Link2, respObj.emailData);
                    }
                    else if (respObj.phoneData.id === _od['map_id']) {
                        fullHtml += this.getUserTileHtml(this.Msg.Link2, respObj.phoneData);
                    }
                    else {
                        fullHtml += this.getUserTileHtml(this.Msg.AlreayExists1, respObj.emailData, respObj.phoneData);
                        this.abortSave = true;
                    }
                }
                else if (respObj.emailData !== null && respObj.phoneData === null) {
                    if (reqObj['phprimary']) {
                        if (respObj.emailData.id === _od['map_id']) {
                            fullHtml += this.getUserTileHtml(this.Msg.Link2, respObj.emailData);
                        }
                        else {
                            reqObj['email'] = '';
                            fullHtml += this.getUserTileHtml(this.Msg.New, reqObj);
                        }
                    }
                    else {
                        if (respObj.emailData.id === _od['map_id']) {
                            //nothing to display
                        }
                        else {
                            fullHtml += this.getUserTileHtml(this.Msg.Link, respObj.emailData);
                        }
                    }
                }
                else if (respObj.emailData === null && respObj.phoneData !== null) {
                    if (reqObj['email']) {
                        if (respObj.phoneData.id === _od['map_id']) {
                            fullHtml += this.getUserTileHtml(this.Msg.Link2, respObj.phoneData);
                        }
                        else {
                            reqObj['phprimary'] = '';
                            fullHtml += this.getUserTileHtml(this.Msg.New, reqObj);
                        }
                    }
                    else {
                        if (respObj.phoneData.id === _od['map_id']) {
                            //nothing to display
                        }
                        else {
                            fullHtml += this.getUserTileHtml(this.Msg.Link, respObj.phoneData);
                        }
                    }
                }
            }

        }.bind(this));

        this.hideLoaderFn();
        if (fullHtml !== '') {
            this.$ModalBody.html(fullHtml);
            this.$Modal.modal('show');
        }
        else
            this.CallBackFn(true);
    };

    this.getUserTileHtml = function (msg, dataObj1 = null, dataObj2 = null) {
        let html = '';
        if (dataObj1) {
            html = `<div class='pu-confmdl-info'>
                        <div class='pu-confmdl-uinfo'>Name<br>Email<br>Phone</div>
                        <div>: ${dataObj1.fullname}<br>: ${dataObj1.email}<br>: ${dataObj1.phprimary}</div>
                    </div>`
        }
        if (dataObj2) {
            html += `<div class='pu-confmdl-info'>
                        <div class='pu-confmdl-uinfo'>Name<br>Email<br>Phone</div>
                        <div>: ${dataObj2.fullname}<br>: ${dataObj2.email}<br>: ${dataObj2.phprimary}</div>
                    </div>`
        }
        html = `
            <div class='pu-confmdl-tile'>
                <div class='pu-confmdl-title'>Provision user</div>
                <div class='pu-confmdl-sub'> ${msg} </div>
                ${html}
            </div>`

        return html;
    };

    this.modalOkClicked = function () {
        this.$Modal.modal('hide');
        if (this.abortSave)
            this.CallBackFn(false);
        else {
            this.CallBackFn(true);
        }
    };

    init();
};