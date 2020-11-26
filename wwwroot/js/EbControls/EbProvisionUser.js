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
    this.$infoUsrNew1;
    this.$infoUsrNew2;
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

        $('body').off('click', `#${this.ctrl.EbSid_CtxId}_PoBtn`).on('click', `#${this.ctrl.EbSid_CtxId}_PoBtn`, this.PopOverBtnClicked.bind(this));
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
                <span class='pu-user' style='display: none;'></span>
            </div>
		    <div class='pu-req-act'></div>`);

        this.$refreshBtn = this.$ctrl.find('.pu-btn-refresh');
        this.$selectBtn = this.$ctrl.find('.pu-btn-select');
        this.$infoTxt = this.$ctrl.find('.pu-txt-info');
        this.$infoUsr1 = this.$ctrl.find('.pu-users-info .pu-user:eq(0)');
        this.$infoUsr2 = this.$ctrl.find('.pu-users-info .pu-user:eq(1)');
        this.$infoUsrNew1 = this.$ctrl.find('.pu-users-info .pu-user:eq(2)');
        this.$infoUsrNew2 = this.$ctrl.find('.pu-users-info .pu-user:eq(3)');
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
                if (key !== 'fullname' && val) {
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
        //    this.setpUserHtml(this.$infoUsrNew1, {
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

    this.Msg = {
        New: 'Data save will create a user with following details.',
        Link: 'Data save will link to the user with following details.',
        Choose: 'Choose a user to continue.',
        Select: 'Select the user to continue.',
        Nothing: 'Nothing to update to the following user.',
        Update: 'Data save will also update email/phone of the following user.',
        UpdateEmail: 'Data save will also update email of the following user.',
        UpdatePhone: 'Data save will also update phone of the following user.',
        EmailAE: 'Given email is already exists for the following user.',
        PhoneAE: 'Given phone is already exists for the following user.',
        EmailPhoneAE: 'Given email/phone is already exists for the following user.'
    };

    //PopOver
    this.POhtml = {
        PhoneDiff: { id: 1, msg: 'There is already an user with the given Email but their Phone is different', btnTxt: 'Select this user' },//select this user
        EmailDiff: { id: 2, msg: 'There is already an user with the given Phone but their Email is different', btnTxt: 'Select this user' },
        PhoneUpdate: { id: 3, msg: 'This phone will be updated to the existing user' },
        EmailUpdate: { id: 4, msg: 'This email will be updated to the existing user' },
        PhoneUnique: { id: 5, msg: 'This phone is unique, but there is already an user with the given email', btnTxt: 'New user without email' },//new user without email
        EmailUnique: { id: 6, msg: 'This email is unique, but there is already an user with the given phone', btnTxt: 'New user without phone' },
        AlreadyExists: { id: 7, msg: 'Already exists. Please enter a unique value.' }
    };

    this.checkEmailAndPhoneSuccess = function (reqObj, res) {
        if (this.lastReqstObj['email'] !== reqObj['email'] || this.lastReqstObj['phprimary'] !== reqObj['phprimary'])
            return;

        this.hide_inp_loader('email');
        this.hide_inp_loader('phprimary');
        this.$updateChkBx.prop('checked', false);

        this.$refreshBtn.html(`<i class='fa fa-refresh'></i>`);
        let respObj = JSON.parse(res)[this.ctrl.Name];
        this.lastRespObj = respObj;

        let _od = {};
        if (this.ctrl.DataVals)
            _od = JSON.parse(this.ctrl.DataVals.F);

        if (!_od['map_id']) {//New
            if (respObj.emailData === null && respObj.phoneData === null) {
                this.appendPuInfo(this.Msg.New, null, null, reqObj);
            }
            else if (respObj.emailData !== null && respObj.phoneData !== null) {
                if (this.ctrl.AllowExistingUser) {
                    if (respObj.emailData.id !== respObj.phoneData.id) {
                        this.appendPuInfo(this.Msg.Choose, respObj.emailData, respObj.phoneData);
                        this.addInvalidStyle('email', this.POhtml.PhoneDiff);
                        this.addInvalidStyle('phprimary', this.POhtml.EmailDiff);
                    }
                    else {
                        this.appendPuInfo(this.Msg.Link, respObj.emailData);
                        this.makeUserTileActive(this.$infoUsr1, respObj.emailData);
                    }
                }
                else {
                    if (respObj.emailData.id !== respObj.phoneData.id)
                        this.appendPuInfo(this.Msg.EmailPhoneAE, null, null, respObj.emailData, respObj.phoneData);
                    else
                        this.appendPuInfo(this.Msg.EmailPhoneAE, null, null, respObj.emailData);
                    this.addInvalidStyle('email', this.POhtml.AlreadyExists);
                    this.addInvalidStyle('phprimary', this.POhtml.AlreadyExists);
                }
            }
            else if (respObj.emailData === null && respObj.phoneData !== null) {
                if (this.ctrl.AllowExistingUser) {
                    if (reqObj['email']) {
                        this.appendPuInfo(this.Msg.Select, respObj.phoneData);
                        this.addInvalidStyle('email', this.POhtml.EmailUnique);
                        this.addInvalidStyle('phprimary', this.POhtml.EmailDiff);
                    }
                    else {
                        this.appendPuInfo(this.Msg.Link, respObj.phoneData);
                        this.makeUserTileActive(this.$infoUsr1, respObj.phoneData);
                    }
                }
                else {
                    this.appendPuInfo(this.Msg.PhoneAE, null, null, respObj.phoneData);
                    this.addInvalidStyle('phprimary', this.POhtml.AlreadyExists);
                }
            }
            else if (respObj.emailData !== null && respObj.phoneData === null) {
                if (this.ctrl.AllowExistingUser) {
                    if (reqObj['phprimary']) {
                        this.appendPuInfo(this.Msg.Select, respObj.emailData);
                        this.addInvalidStyle('email', this.POhtml.PhoneDiff);
                        this.addInvalidStyle('phprimary', this.POhtml.PhoneUnique);
                    }
                    else {
                        this.appendPuInfo(this.Msg.Link, respObj.emailData);
                        this.makeUserTileActive(this.$infoUsr1, respObj.emailData);
                    }
                }
                else {
                    this.appendPuInfo(this.Msg.EmailAE, null, null, respObj.emailData);
                    this.addInvalidStyle('email', this.POhtml.AlreadyExists);
                }
            }
        }
        else {//edit
            let dataObj = { id: _od['id'], fullname: _od['fullname'], email: _od['email'], phprimary: _od['phprimary'] };
            let isUserCreated = _od['map_id'] === _od['id'];
            if (respObj.emailData === null && respObj.phoneData === null) {
                if (isUserCreated) {
                    this.appendPuInfo(this.Msg.Update, null, null, dataObj);
                    this.$updateChkBx.prop('checked', true);
                    if (reqObj['email'] !== _od['email']) {
                        this.addInvalidStyle('email', this.POhtml.EmailUpdate);
                    }
                    if (reqObj['phprimary'] !== _od['phprimary']) {
                        this.addInvalidStyle('phprimary', this.POhtml.PhoneUpdate);
                    }
                }
                else
                    this.appendPuInfo(this.Msg.New, null, null, reqObj);
            }
            else if (respObj.emailData !== null && respObj.phoneData !== null) {
                if (respObj.emailData.id === respObj.phoneData.id && respObj.phoneData.id === _od['map_id']) {
                    if (this.ctrl.AllowExistingUser) {
                        this.appendPuInfo(this.Msg.Nothing, null, null, respObj.emailData);
                    }
                    else if (!isUserCreated) {
                        this.appendPuInfo(this.Msg.EmailPhoneAE, null, null, respObj.emailData);
                        this.addInvalidStyle('email', this.POhtml.AlreadyExists);
                        this.addInvalidStyle('phprimary', this.POhtml.AlreadyExists);
                    }
                }
                else if (respObj.emailData.id === respObj.phoneData.id) {
                    if (this.ctrl.AllowExistingUser) {
                        this.appendPuInfo(this.Msg.Link, respObj.emailData);
                        this.makeUserTileActive(this.$infoUsr1, respObj.emailData);
                    }
                    else {
                        this.appendPuInfo(this.Msg.EmailPhoneAE, null, null, respObj.emailData);
                        this.addInvalidStyle('email', this.POhtml.AlreadyExists);
                        this.addInvalidStyle('phprimary', this.POhtml.AlreadyExists);
                    }
                }
                else if (respObj.emailData.id === _od['map_id'] && this.ctrl.AllowExistingUser) {
                    this.appendPuInfo(this.Msg.Choose, respObj.emailData, respObj.phoneData);
                    this.addInvalidStyle('email', this.POhtml.PhoneDiff);
                    this.addInvalidStyle('phprimary', this.POhtml.EmailDiff);
                }
                else if (respObj.phoneData.id === _od['map_id'] && this.ctrl.AllowExistingUser) {
                    this.appendPuInfo(this.Msg.Choose, respObj.emailData, respObj.phoneData);
                    this.addInvalidStyle('email', this.POhtml.PhoneDiff);
                    this.addInvalidStyle('phprimary', this.POhtml.EmailDiff);
                }
                else if (this.ctrl.AllowExistingUser) {
                    this.appendPuInfo(this.Msg.Choose, respObj.emailData, respObj.phoneData);
                    this.addInvalidStyle('email', this.POhtml.PhoneDiff);
                    this.addInvalidStyle('phprimary', this.POhtml.EmailDiff);
                }
                else if (!this.ctrl.AllowExistingUser) {
                    this.appendPuInfo(this.Msg.EmailPhoneAE, null, null, respObj.emailData, respObj.phoneData);
                    this.addInvalidStyle('email', this.POhtml.AlreadyExists);
                    this.addInvalidStyle('phprimary', this.POhtml.AlreadyExists);
                }
            }
            else if (respObj.emailData === null && respObj.phoneData !== null) {
                if (reqObj['email']) {
                    if (respObj.phoneData.id === _od['map_id']) {
                        if (isUserCreated) {
                            this.appendPuInfo(this.Msg.UpdateEmail, null, null, dataObj);
                            this.addInvalidStyle('email', this.POhtml.EmailUpdate);
                            this.$updateChkBx.prop('checked', true);
                        }
                        else if (this.ctrl.AllowExistingUser) {
                            this.appendPuInfo(this.Msg.Select, respObj.phoneData);
                            this.addInvalidStyle('email', this.POhtml.EmailUnique);
                            this.addInvalidStyle('phprimary', this.POhtml.EmailDiff);
                        }
                        else {
                            this.appendPuInfo(this.Msg.PhoneAE, null, null, respObj.phoneData);
                            this.addInvalidStyle('phprimary', this.POhtml.AlreadyExists);
                        }
                    }
                    else if (this.ctrl.AllowExistingUser) {
                        this.appendPuInfo(this.Msg.Select, respObj.phoneData);
                        this.addInvalidStyle('email', this.POhtml.EmailUnique);
                        this.addInvalidStyle('phprimary', this.POhtml.EmailDiff);
                    }
                    else {
                        this.appendPuInfo(this.Msg.PhoneAE, null, null, respObj.phoneData);
                        this.addInvalidStyle('phprimary', this.POhtml.AlreadyExists);
                    }
                }
                else {
                    if (respObj.phoneData.id === _od['map_id'] && (this.ctrl.AllowExistingUser || (isUserCreated && !this.ctrl.AllowExistingUser))) {
                        this.appendPuInfo(this.Msg.Nothing, respObj.phoneData);
                        this.makeUserTileActive(this.$infoUsr1, respObj.phoneData);
                    }
                    else if (this.ctrl.AllowExistingUser) {
                        this.appendPuInfo(this.Msg.Link, respObj.phoneData);
                        this.makeUserTileActive(this.$infoUsr1, respObj.phoneData);
                    }
                    else {
                        this.appendPuInfo(this.Msg.PhoneAE, null, null, respObj.phoneData);
                        this.addInvalidStyle('phprimary', this.POhtml.AlreadyExists);
                    }
                }
            }
            else if (respObj.emailData !== null && respObj.phoneData === null) {
                if (reqObj['phprimary']) {
                    if (respObj.emailData.id === _od['map_id']) {
                        if (isUserCreated) {
                            this.appendPuInfo(this.Msg.UpdatePhone, null, null, dataObj);
                            this.addInvalidStyle('phprimary', this.POhtml.PhoneUpdate);
                            this.$updateChkBx.prop('checked', true);
                        }
                        else if (this.ctrl.AllowExistingUser) {
                            this.appendPuInfo(this.Msg.Select, respObj.emailData);
                            this.addInvalidStyle('email', this.POhtml.PhoneDiff);
                            this.addInvalidStyle('phprimary', this.POhtml.PhoneUnique);
                        }
                        else {
                            this.appendPuInfo(this.Msg.EmailAE, null, null, respObj.emailData);
                            this.addInvalidStyle('email', this.POhtml.AlreadyExists);
                        }
                    }
                    else if (this.ctrl.AllowExistingUser) {
                        this.appendPuInfo(this.Msg.Select, respObj.emailData);
                        this.addInvalidStyle('email', this.POhtml.PhoneDiff);
                        this.addInvalidStyle('phprimary', this.POhtml.PhoneUnique);
                    }
                    else {
                        this.appendPuInfo(this.Msg.EmailAE, null, null, respObj.emailData);
                        this.addInvalidStyle('email', this.POhtml.AlreadyExists);
                    }
                }
                else {
                    if (respObj.emailData.id === _od['map_id'] && (this.ctrl.AllowExistingUser || (isUserCreated && !this.ctrl.AllowExistingUser))) {
                        this.appendPuInfo(this.Msg.Nothing, respObj.emailData);
                        this.makeUserTileActive(this.$infoUsr1, respObj.emailData);
                    }
                    else if (this.ctrl.AllowExistingUser) {
                        this.appendPuInfo(this.Msg.Link, respObj.emailData);
                        this.makeUserTileActive(this.$infoUsr1, respObj.emailData);
                    }
                    else {
                        this.appendPuInfo(this.Msg.EmailAE, null, null, respObj.emailData);
                        this.addInvalidStyle('email', this.POhtml.AlreadyExists);
                    }
                }
            }
        }
    };

    this.appendPuInfo = function (msg, info1 = null, info2 = null, infoNew1 = null, infoNew2 = null) {
        this.$infoTxt.html(msg);
        this.setpUserHtml(this.$infoUsr1, info1);
        this.setpUserHtml(this.$infoUsr2, info2);
        this.setpUserHtml(this.$infoUsrNew1, infoNew1);
        this.setpUserHtml(this.$infoUsrNew2, infoNew2);

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

    this.PopOverBtnClicked = function (e) {
        let opId = parseInt($(e.currentTarget).attr('data-id'));
        if (opId === 1) {
            this.makeUserTileActive(this.$infoUsr1, this.lastRespObj.emailData);
        }
        else if (opId === 2) {
            if (this.$infoUsr1.data('data-obj').phprimary === this.lastRespObj.phoneData.phprimary)
                this.makeUserTileActive(this.$infoUsr1, this.lastRespObj.phoneData);
            else
                this.makeUserTileActive(this.$infoUsr2, this.lastRespObj.phoneData);
        }
        else if (opId === 5) {
            this.updateExtCtrls('email', '', false);
        }
        else if (opId === 6) {
            this.updateExtCtrls('phprimary', '', false);
        }
    };

    this.addInvalidStyle = function (key, msgObj) {
        if (this.extCtrls[key]) {
            let t = key === 'email' ? 'phprimary' : 'email';
            //this.extCtrls[key].addInvalidStyle((msg || (dataObj ? `Must be '${dataObj[key] || 'blank'}' based on '${dataObj[t]}'` : 'Not allowed')), 'warning');

            let html = '';
            if (msgObj.btnTxt)
                html = `<div><div class='provUsrCtrlPoBtn' id='${this.ctrl.EbSid_CtxId}_PoBtn' data-id='${msgObj.id}'>${msgObj.btnTxt}</div></div>`;
            html = `<div style='font-size: 12px; color: rgb(51, 51, 51);'><div>${msgObj.msg}</div>${html}</div>`;

            EbMakeInvalid_Test(this.extCtrls[key], '#cont_' + this.extCtrls[key].EbSid_CtxId, '.ctrl-cover', html, 'warning');
        }
    };

    this.removeInvalidStyle = function (key) {
        if (this.extCtrls[key]) {
            //this.extCtrls[key].removeInvalidStyle();
            EbMakeValid_Test('#cont_' + this.extCtrls[key].EbSid_CtxId, '.ctrl-cover', this.extCtrls[key]);
        }
    };

    this.show_inp_loader = function (key) {
        if (this.extCtrls[key])
            show_inp_loader($('#' + this.extCtrls[key].EbSid_CtxId), $());
    };

    this.hide_inp_loader = function (key) {
        if (this.extCtrls[key])
            hide_inp_loader($('#' + this.extCtrls[key].EbSid_CtxId), $());
    };

    this.updateExtCtrls = function (key, val, updateLstRqObj = true) {
        if (this.extCtrls[key]) {
            if (updateLstRqObj)
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
            //this.setpUserHtml(this.$infoUsrNew1, null);
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
                            <h5 class="modal-title">User creation</h5>
                        </div>
                        <div class="modal-body" style="height: calc(80vh - 180px); overflow: auto;">

                        </div>
                        <div class="modal-footer">
                            <button id="puConfMdlOk" class="ebbtn eb_btn-sm eb_btnblue" type="button">Continue</button>
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
        AEdiff: 'Email and phone already exists for different users. Unable to continue.',//AE - Already Exists
        AEsame: 'Email and phone already exists. Unable to continue.',
        AEemail: 'Email already exists for the following user. Unable to continue.',
        AEphone: 'Phone already exists for the following user. Unable to continue.',
        Update: 'Data save will also update email/phone of the following user.',
        UpdateEmail: 'Data save will also update email of the following user.',
        UpdatePhone: 'Data save will also update phone of the following user.'
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
                    fullHtml += this.getUserTileHtml(pucObj, this.Msg.New, reqObj);
                }
                else if (respObj.emailData !== null && respObj.phoneData !== null) {
                    if (respObj.emailData.id !== respObj.phoneData.id) {
                        fullHtml += this.getUserTileHtml(pucObj, this.Msg.AEdiff, respObj.emailData, respObj.phoneData);
                        this.abortSave = true;
                    }
                    else if (pucObj.AllowExistingUser) {
                        fullHtml += this.getUserTileHtml(pucObj, this.Msg.Link, respObj.emailData);
                    }
                    else {
                        fullHtml += this.getUserTileHtml(pucObj, this.Msg.AEsame, respObj.emailData);
                        this.abortSave = true;
                    }
                }
                else if (respObj.emailData !== null && respObj.phoneData === null) {
                    if (reqObj['phprimary']) {
                        reqObj['email'] = '';
                        fullHtml += this.getUserTileHtml(pucObj, this.Msg.New, reqObj);
                    }
                    else if (pucObj.AllowExistingUser) {
                        fullHtml += this.getUserTileHtml(pucObj, this.Msg.Link, respObj.emailData);
                    }
                    else {
                        fullHtml += this.getUserTileHtml(pucObj, this.Msg.AEemail, respObj.emailData);
                        this.abortSave = true;
                    }
                }
                else if (respObj.emailData === null && respObj.phoneData !== null) {
                    if (reqObj['email']) {
                        reqObj['phprimary'] = '';
                        fullHtml += this.getUserTileHtml(pucObj, this.Msg.New, reqObj);
                    }
                    else if (pucObj.AllowExistingUser) {
                        fullHtml += this.getUserTileHtml(pucObj, this.Msg.Link, respObj.phoneData);
                    }
                    else {
                        fullHtml += this.getUserTileHtml(pucObj, this.Msg.AEphone, respObj.phoneData);
                        this.abortSave = true;
                    }
                }
            }
            else {//edit
                let dataObj = { id: _od['id'], fullname: _od['fullname'], email: _od['email'], phprimary: _od['phprimary'] };
                if (respObj.emailData === null && respObj.phoneData === null) {
                    if (_od['map_id'] === _od['id'])
                        fullHtml += this.getUserTileHtml(pucObj, this.Msg.Update, dataObj);
                    else
                        fullHtml += this.getUserTileHtml(pucObj, this.Msg.New, reqObj);
                }
                else if (respObj.emailData !== null && respObj.phoneData !== null) {
                    if (respObj.emailData.id === respObj.phoneData.id && respObj.phoneData.id === _od['map_id']) {
                        if (_od['map_id'] !== _od['id'] && !pucObj.AllowExistingUser) {
                            fullHtml += this.getUserTileHtml(pucObj, this.Msg.AEsame, respObj.emailData);
                            this.abortSave = true;
                        }
                    }
                    else if (respObj.emailData.id === respObj.phoneData.id) {
                        if (pucObj.AllowExistingUser) {
                            fullHtml += this.getUserTileHtml(pucObj, this.Msg.Link, respObj.emailData);
                        }
                        else {
                            fullHtml += this.getUserTileHtml(pucObj, this.Msg.AEsame, respObj.emailData);
                            this.abortSave = true;
                        }
                    }
                    else if (respObj.emailData.id === _od['map_id']) {
                        fullHtml += this.getUserTileHtml(pucObj, this.Msg.AEdiff, respObj.emailData, respObj.phoneData);
                        this.abortSave = true;
                    }
                    else if (respObj.phoneData.id === _od['map_id']) {
                        fullHtml += this.getUserTileHtml(pucObj, this.Msg.AEdiff, respObj.emailData, respObj.phoneData);
                        this.abortSave = true;
                    }
                    else {
                        fullHtml += this.getUserTileHtml(pucObj, this.Msg.AEdiff, respObj.emailData, respObj.phoneData);
                        this.abortSave = true;
                    }
                }
                else if (respObj.emailData !== null && respObj.phoneData === null) {
                    if (reqObj['phprimary']) {
                        if (respObj.emailData.id === _od['map_id']) {
                            if (_od['map_id'] === _od['id']) {
                                fullHtml += this.getUserTileHtml(pucObj, this.Msg.UpdatePhone, dataObj);
                            }
                            else if (pucObj.AllowExistingUser) {
                                fullHtml += this.getUserTileHtml(pucObj, this.Msg.Link2, respObj.emailData);
                            }
                            else {
                                fullHtml += this.getUserTileHtml(pucObj, this.Msg.AEemail, respObj.emailData);
                                this.abortSave = true;
                            }
                        }
                        else {
                            reqObj['email'] = '';
                            fullHtml += this.getUserTileHtml(pucObj, this.Msg.New, reqObj);
                        }
                    }
                    else {
                        if (respObj.emailData.id === _od['map_id']) {
                            if (_od['map_id'] !== _od['id'] && !pucObj.AllowExistingUser) {
                                fullHtml += this.getUserTileHtml(pucObj, this.Msg.AEemail, respObj.emailData);
                                this.abortSave = true;
                            }
                        }
                        else if (pucObj.AllowExistingUser) {
                            fullHtml += this.getUserTileHtml(pucObj, this.Msg.Link, respObj.emailData);
                        }
                        else {
                            fullHtml += this.getUserTileHtml(pucObj, this.Msg.AEemail, respObj.emailData);
                            this.abortSave = true;
                        }
                    }
                }
                else if (respObj.emailData === null && respObj.phoneData !== null) {
                    if (reqObj['email']) {
                        if (respObj.phoneData.id === _od['map_id']) {
                            if (_od['map_id'] === _od['id']) {
                                fullHtml += this.getUserTileHtml(pucObj, this.Msg.UpdateEmail, dataObj);
                            }
                            else if (pucObj.AllowExistingUser) {
                                fullHtml += this.getUserTileHtml(pucObj, this.Msg.Link2, respObj.phoneData);
                            }
                            else {
                                fullHtml += this.getUserTileHtml(pucObj, this.Msg.AEphone, respObj.phoneData);
                                this.abortSave = true;
                            }
                        }
                        else {
                            reqObj['phprimary'] = '';
                            fullHtml += this.getUserTileHtml(pucObj, this.Msg.New, reqObj);
                        }
                    }
                    else {
                        if (respObj.phoneData.id === _od['map_id']) {
                            if (_od['map_id'] !== _od['id'] && !pucObj.AllowExistingUser) {
                                fullHtml += this.getUserTileHtml(pucObj, this.Msg.AEphone, respObj.phoneData);
                                this.abortSave = true;
                            }
                        }
                        else if (pucObj.AllowExistingUser) {
                            fullHtml += this.getUserTileHtml(pucObj, this.Msg.Link, respObj.phoneData);
                        }
                        else {
                            fullHtml += this.getUserTileHtml(pucObj, this.Msg.AEphone, respObj.phoneData);
                            this.abortSave = true;
                        }
                    }
                }
            }

        }.bind(this));

        this.hideLoaderFn();
        if (fullHtml !== '') {
            if (this.abortSave)
                this.$OkBtn.hide();
            else
                this.$OkBtn.show();
            this.$ModalBody.html(fullHtml);
            this.$Modal.modal('show');
        }
        else
            this.CallBackFn(true);
    };

    this.getUserTileHtml = function (pucObj, msg, dataObj1 = null, dataObj2 = null) {
        let html = '';
        if (dataObj1) {
            html = `<div class='pu-confmdl-info'>
                        <div class='pu-confmdl-uinfo'><img src='/images/proimg.jpg' alt='Display picture'></div>
                        <div><b> ${(dataObj1.fullname ? (dataObj1.fullname + '<br>') : '')}</b> ${(dataObj1.email ? (dataObj1.email + '<br>') : '')} ${dataObj1.phprimary || ''}</div>
                    </div>`
        }
        if (dataObj2) {
            html += `<div class='pu-confmdl-info'>
                        <div class='pu-confmdl-uinfo'><img src='/images/proimg.jpg' alt='Display picture'></div>
                        <div><b> ${(dataObj2.fullname ? (dataObj2.fullname + '<br>') : '')}</b> ${(dataObj2.email ? (dataObj2.email + '<br>') : '')} ${dataObj2.phprimary || ''}</div>
                    </div>`
        }
        html = `
            <div class='pu-confmdl-tile'>
                <div class='pu-confmdl-title'>${pucObj.Label || 'Provision User'}</div>
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