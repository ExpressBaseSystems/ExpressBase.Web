﻿var UserJs = function (mode, userinfo, cusroles, usergroup, uroles, ugroups, r2rList, userstatusList, culture, timeZone, env, locCons) {
    this.whichMode = mode;
    //CreateEdit = 1, View = 2, MyProfileView = 3
    this.Environment = env;
    this.menuBarObj = new EbHeader();
    this.userinfo = userinfo;
    this.customRoles = cusroles;
    this.culture = culture;
    this.timeZone = timeZone;
    this.userGroup = usergroup;
    this.U_Roles = uroles;
    this.U_Groups = ugroups;
    this.LocCntr = {
        curItems: locCons || {}, options: { added: [], deleted: [] }
    };
    this.LocId_Deleted = [];
    this.r2rList = r2rList;
    this.statusList = userstatusList;
    this.itemId = parseInt($("#userid").val());
    this.anonymousUserId = null;
    this.dependentList = [];
    this.dominantList = [];
    this.Preference = {};

    //this.divFormHeading = $("#divFormHeading");
    this.txtName = $("#txtFullName");
    this.txtNickName = $("#txtNickName");
    this.spanNickName = $("#spanNickName");
    this.txtEmail = $(".txtEmail");
    this.spanEmail = $("#spanEmail");
    this.pwdPassword = $("#pwdPassword");
    this.pwdPasswordCon = $("#pwdPasswordCon");
    this.lblMessage = $("#lblMessage");
    this.txtDateOfBirth = $("#txtDateOfBirth");
    this.txtAlternateEmail = $(".txtAlternateEmail");
    this.txtPhPrimary = $("#txtPhPrimary");
    this.spanPhone = $("#spanPhone");
    this.txtPhSecondary = $("#txtPhSecondary");
    this.txtLandPhone = $("#txtLandPhone");
    this.txtExtension = $("#txtExtension");
    this.selUserType = $("#selusertype");
    this.ForceResetPassword = $("#forceresetpw");

    this.chkboxHide = $("#chkboxHide");
    //CHANGE PWD
    this.divChangePassword = $("#divChangePassword");
    this.btnChangePassword = $("#btnChangePassword");
    this.ChangePwdModal = $("#MU_ChangePwdModal");
    this.pwdOld = $("#pwdOld");
    this.pwdNew = $("#pwdNew");
    this.pwdNewConfirm = $("#pwdNewConfirm");
    this.lblPwdChngMsg = $("#lblPwdChngMsg");
    this.btnUpdatePwd = $("#btnUpdatePwd");
    //RESET PWD
    this.divResetPassword = $("#divResetPassword");
    this.btnResetPassword = $("#btnResetPassword");
    this.ResetPwdModal = $("#MU_ResetPwdModal");
    this.pwdResetNew = $("#pwdResetNew");
    this.pwdResetNewConfirm = $("#pwdResetNewConfirm");
    this.lblPwdResetMsg = $("#lblPwdResetMsg");
    this.btnResetPwd = $("#btnResetPwd");

    this.divPassword = $("#divPassword");
    this.btnFbConnect = $("#btnFbConnect");
    this.FB = null;
    this.fbId = null;
    this.fbName = null;
    this.timer1 = null;
    this.timer2 = null;
    this.timer3 = null;
    this.isPhoneUnique = false;
    this.isEmailUnique = false;
    this.isNickNameUnique = false;
    this.emailRegex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    this.pwdRegex = /^([a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]){8,}$/;

    this.rolesTile = null;
    this.userGroupTile = null;

    //CONSTRAINTS
    this.divLocCnstr = $("#divLocConstraint");
    this.txtLocations = $("#txtLocations");

    this.selectLocale = $("#sellocale");
    this.divLocaleInfo = $("#divLocaleInfo");
    this.selectTimeZone = $("#seltimezone");

    this.btnApiKeyGenerate = $("#btnApiKeyGenerate");
    this.btnApiKeyView = $("#btnApiKeyView");
    this.btnApiKeyDelete = $("#btnApiKeyDelete");

    this.init = function () {
        if (this.itemId > 1) {
            this.menuBarObj.insertButton(`<button id="btnDeleteUser" class='btn' title='Delete'><i class="fa fa-trash-o" aria-hidden="true"></i></button>`);
            $("#btnDeleteUser").on('click', this.clickbtnDeleteUser.bind(this));
            $('.nav-tabs a[href="#settings"]').tab('show');
        }
        this.menuBarObj.insertButton(`<button id="btnCreateUser" class='btn' title='Save'><i class="fa fa-floppy-o" aria-hidden="true"></i></button>`);
        this.btnCreateUser = $("#btnCreateUser");

        this.txtEmail.on('keyup', this.validateEmail.bind(this));
        //this.txtEmail.on('change', this.validateEmail.bind(this));
        this.txtPhPrimary.on('keyup', this.validatePhone.bind(this));
        //this.txtPhPrimary.on('change', this.validatePhone.bind(this));
        this.txtNickName.on('keyup', this.validateNickName.bind(this));
        //this.txtNickName.on('change', this.validateNickName.bind(this));
        this.pwdPassword.on('keyup', function (e) { this.validateInfo(this.pwdPassword, this.pwdRegex); }.bind(this));
        this.pwdPasswordCon.on('keyup', function (e) { this.validateInfo(this.pwdPasswordCon, this.pwdRegex); }.bind(this));
        this.makeAsShowPwdField(this.pwdPasswordCon);
        this.txtAlternateEmail.on('change', function (e) { this.validateInfo(this.txtAlternateEmail, this.emailRegex); }.bind(this));
        this.btnCreateUser.on('click', this.clickbtnCreateUser.bind(this));
        this.selectLocale.on("change", this.selectLocaleChangeAction.bind(this));
        this.btnChangePassword.on("click", this.initChangePwdModal.bind(this));
        this.btnUpdatePwd.on('click', this.updatePassword.bind(this));

        this.btnApiKeyGenerate.on('click', this.apiKeyGenerate.bind(this));
        this.btnApiKeyView.on('click', this.apiKeyView.bind(this));
        this.btnApiKeyDelete.on('click', this.apiKeyDelete.bind(this));

        $('#btnlocWhiteLst').on('click', this.setLocConstrainFn.bind(this));


        //RESET PWD
        this.btnResetPassword.on("click", this.initResetPwdModal.bind(this));
        this.btnResetPwd.on('click', this.resetPassword.bind(this));

        this.pwdOld.on('keyup', this.onKeyUpPwdInModal.bind(this, this.pwdOld));
        this.pwdNew.on('keyup', this.onKeyUpPwdInModal.bind(this, this.pwdNew));
        this.pwdNewConfirm.on('keyup', this.onKeyUpPwdInModal.bind(this, this.pwdNewConfirm));
        this.makeAsShowPwdField(this.pwdNewConfirm);

        for (var i = 0; i < this.statusList.length; i++) {
            $("#divStatus input:radio[value='" + i + "']").parent().contents().last().replaceWith(this.statusList[i]);
        }
        $("#divStatus input:radio[name='status']").on("change", this.statusChangeAction.bind(this));
        this.statusChangeAction();
        this.initUserPreference();
        this.initForm();
        this.initTiles();
        if (this.whichMode === 2)
            this.setReadOnly();
        //this.DpImageUpload();

        //  this.setLocConstraintDiv();////taginput location constraint
        this.showConstrainFn();
    };

    //this.DpImageUpload = function () {
    //    var logoCrp = new cropfy({
    //        Container: 'Add_User_Dp',
    //        Toggle: '#profimage',
    //        isUpload: true,  //upload to cloud
    //        enableSE: true, //enable server event
    //        Browse: true,  //browse image
    //        Result: 'base64',
    //        Type: 'dp',
    //        //Tid: _tid, //if type is logo
    //        Preview: "#imgprofimage"
    //    });
    //    logoCrp.getFile = function (file) {

    //    }.bind(this);
    //};

    this.apiKeyGenerate = function () {
        if (this.apiKeyGenerateClicked)
            return;
        this.apiKeyGenerateClicked = true;

        this.showLoader();

        $.ajax({
            type: "POST",
            url: "/Security/IsApiKeyExists",
            data: { userId: this.itemId },
            error: function (xhr, ajaxOptions, thrownError) {
                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000', Delay: 4000 });
                this.hideLoader();
                this.apiKeyGenerateClicked = false;
            }.bind(this),
            success: function (result) {
                this.hideLoader();
                this.apiKeyGenerateClicked = false;
                let resp = JSON.parse(result);
                let msg;
                if (resp.KeyId > 0) {
                    msg = "Api key is already active! Do you want to regenerate Api key? It will overwrite the existing api key.";
                }
                else if (resp.KeyId == 0) {
                    msg = "Are you sure to generate new Api key?";
                }
                else {
                    EbMessage("show", { Message: resp.ResponseStatus.Message, AutoHide: true, Background: '#aa0000', Delay: 4000 });
                    return;
                }

                EbDialog("show",
                    {
                        Message: msg,
                        Buttons: {
                            "Yes": { Background: "green", Align: "left", FontColor: "white;" },
                            "No": { Background: "violet", Align: "right", FontColor: "white;" }
                        },
                        CallBack: function (name) {
                            if (name === "Yes") {
                                this.showLoader();
                                $.ajax({
                                    type: "POST",
                                    url: "/Security/GenerateApiKey",
                                    data: { userId: this.itemId },
                                    error: function (xhr, ajaxOptions, thrownError) {
                                        EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000', Delay: 4000 });
                                        this.hideLoader();
                                    }.bind(this),
                                    success: function (result) {
                                        this.hideLoader();
                                        let resp = JSON.parse(result);
                                        if (resp.ApiKey) {
                                            $("#txtApiKey").val(resp.ApiKey);
                                            EbMessage("show", { Message: 'New api key generated successfully', AutoHide: true, Background: '#00aa00', Delay: 4000 });
                                        }
                                        else {
                                            $("#txtApiKey").val('Failed to generate api key. Message: ' + resp.ResponseStatus.Message);
                                        }
                                    }.bind(this)
                                });
                            }
                        }.bind(this)
                    });
            }.bind(this)
        });
    };

    this.apiKeyView = function () {
        if (this.apiKeyViewClicked)
            return;
        this.apiKeyViewClicked = true;

        this.showLoader();

        $.ajax({
            type: "POST",
            url: "/Security/ViewApiKey",
            data: { userId: this.itemId },
            error: function (xhr, ajaxOptions, thrownError) {
                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000', Delay: 4000 });
                this.hideLoader();
                this.apiKeyViewClicked = false;
            }.bind(this),
            success: function (result) {
                this.hideLoader();
                this.apiKeyViewClicked = false;
                let resp = JSON.parse(result);
                if (resp.ApiKey) {
                    $("#txtApiKey").val(resp.ApiKey);
                }
                else {
                    $("#txtApiKey").val('Failed to load api key. Message: ' + resp.ResponseStatus.Message);
                }
            }.bind(this)
        });
    };

    this.apiKeyDelete = function () {
        EbDialog("show",
            {
                Message: "Are you sure to delete existing api key?",
                Buttons: {
                    "Yes": { Background: "green", Align: "left", FontColor: "white;" },
                    "No": { Background: "violet", Align: "right", FontColor: "white;" }
                },
                CallBack: function (name) {
                    if (name === "Yes") {
                        if (this.apiKeyDeleteClicked)
                            return;
                        this.apiKeyDeleteClicked = true;

                        this.showLoader();

                        $.ajax({
                            type: "POST",
                            url: "/Security/DeleteApiKey",
                            data: { userId: this.itemId },
                            error: function (xhr, ajaxOptions, thrownError) {
                                EbMessage("show", { Message: 'Something Unexpected Occurred', AutoHide: true, Background: '#aa0000', Delay: 4000 });
                                this.hideLoader();
                                this.apiKeyDeleteClicked = false;
                            }.bind(this),
                            success: function (result) {
                                this.hideLoader();
                                this.apiKeyDeleteClicked = false;
                                let resp = JSON.parse(result);
                                if (resp.status > 0) {
                                    $("#txtApiKey").val('Api key deleted successfully');
                                }
                                else {
                                    $("#txtApiKey").val('Failed to delete api key. Message: ' + resp.ResponseStatus.Message);
                                }
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
    };

    this.showLoader = function () {
        $("#eb_common_loader").EbLoader("show", { maskItem: { Id: ".s-dash-container" } });
    }.bind(this);

    this.hideLoader = function () {
        $("#eb_common_loader").EbLoader("hide");
    }.bind(this);

    this.showConstrainFn = function () {
        var locItems = $.map(this.LocCntr.curItems, function (value, index) {
            return [value];
        });
        var locLength = locItems.length;
        if (locLength > 0) {
            let o = getObjByval(ebcontext.locations.Locations, 'LocId', locItems[0]);
            var k = (o.LongName === o.ShortName) ? o.LongName : `${o.LongName}(${o.ShortName})`;
            if (locLength === 1) {
                $('#locWhiteLst').val(k);
            }
            else {
                $('#locWhiteLst').val(`${k} and ${locLength - 1} other locations `)
            }
        }
    }

    function treeViewGetItem() {
        var cItems = this.loc_treeView.Settings.checkedItmId;
        var delItems = [];
        var addItems = [];
        var temp = [];
        this.LocCntr.options.deleted = [];
        this.LocId_Deleted = [];

        var locCurnt = Object.values(this.LocCntr.curItems);
        for (var i = 0; i < cItems.length; i++) {
            var idx = $.inArray(cItems[i], locCurnt);
            if (idx == -1) {
                addItems.push(cItems[i]);
            }
        }
        let cArray = locCurnt.concat(addItems);
        temp = cArray.filter((item, index) => cArray.indexOf(item) === index);

        delItems = temp.filter((el) => !cItems.includes(el));
        this.LocCntr.options.added = addItems;
        var delCount = delItems.length;
        if (delCount > 0) {
            for (var j = 0; j < delCount; j++) {
                if (getKeyByVal(this.LocCntr.curItems, delItems[j])) {
                    this.LocCntr.options.deleted.push(getKeyByVal(this.LocCntr.curItems, delItems[j]));
                    this.LocId_Deleted.push(delItems[j]);
                }
            }
        }
    };

    this.treeViewCallBackFn = treeViewGetItem.bind(this);

    this.setLocConstrainFn = function () {
        let arr = Object.values(this.LocCntr.curItems);
        let cArray = arr.concat(this.LocCntr.options.added);
        var finalLst = cArray.filter((item, index) => cArray.indexOf(item) === index);
        for (var i = 0; i < this.LocId_Deleted.length; i++) {
            finalLst.splice(finalLst.indexOf(this.LocId_Deleted[i]), 1);
        }
        this.loc_treeView = new TreeView_plugin({
            current_item: "-1", elementAttrId: "locWhiteLst", checkItem: true, linkParent: false, checkedItmId: finalLst, callBackFn: this.treeViewCallBackFn
        });
        this.loc_treeView.toggleModal();
    }

    //this.setLocConstraintDiv = function () {
    //    var _locArr = new Bloodhound({
    //        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
    //        queryTokenizer: Bloodhound.tokenizers.whitespace,
    //        local: $.map(ebcontext.locations.Locations, function (loc) { return { id: loc.LocId, name: loc.ShortName + ' - ' + loc.LongName }; })
    //    });
    //    _locArr.initialize();

    //    this.txtLocations.tagsinput({
    //        typeaheadjs: [
    //            {
    //                highlight: false
    //            },
    //            {
    //                name: 'Locations',
    //                displayKey: 'name',
    //                valueKey: 'id',
    //                source: _locArr.ttAdapter()
    //            }
    //        ],
    //        itemValue: 'name',
    //        freeInput: false
    //    });

    //    this.txtLocations.on('itemAdded', function (event) {
    //        //console.log(event.item);
    //        if (getKeyByVal(this.LocCntr.curItems, event.item.id)) {
    //            this.LocCntr.options.deleted.splice(this.LocCntr.options.deleted.indexOf(this.LocCntr.curItems[event.item.id]), 1);
    //        }
    //        else {
    //            this.LocCntr.options.added.push(event.item.id);
    //        }
    //    }.bind(this));

    //    this.txtLocations.on('itemRemoved', function (event) {
    //        //console.log(event.item);
    //        if (getKeyByVal(this.LocCntr.curItems, event.item.id)) {
    //            this.LocCntr.options.deleted.push(getKeyByVal(this.LocCntr.curItems, event.item.id));
    //        }
    //        else {
    //            this.LocCntr.options.added.splice(this.LocCntr.options.added.indexOf(event.item.id), 1);
    //        }
    //    }.bind(this));

    //    $.each(this.LocCntr.curItems, function (i, ob) {
    //        let o = getObjByval(ebcontext.locations.Locations, 'LocId', ob);
    //        $('#txtLocations').tagsinput('add', { id: o.LocId, name: o.ShortName + ' - ' + o.LongName });
    //    }.bind(this));
    //    //$('#txtLocations').tagsinput('add', { id: 100, name: 'AERE - AL EID REAL ESTATE.DUBAI.' });
    //};

    this.onKeyUpPwdInModal = function (pwdThis) {
        if (this.validateInfo(pwdThis, this.pwdRegex)) {
            if (this.pwdNewConfirm.val() === this.pwdNew.val() || pwdThis === this.pwdOld)
                this.lblPwdChngMsg.text("");
            else
                this.lblPwdChngMsg.text("Password Mismatch");
        }
        else
            this.lblPwdChngMsg.text("Minimum Length Should be 8");
    };

    this.initForm = function () {
        this.chkboxHide.parent().hide();
        this.chkboxHide.parent().prev().hide();
        this.txtEmail.val("");
        this.pwdPassword.val("");
        this.pwdPasswordCon.val("");
        if (this.itemId > 1) {
            this.menuBarObj.setName("Edit User");
            document.title = "Manage User - " + this.userinfo["fullname"];
            //$(this.divFormHeading).text("Edit User");
            //this.btnCreateUser.text("Update");
            //this.txtEmail.attr("disabled", "true");
            this.divPassword.css("display", "none");
            this.selUserType.attr("disabled", "true");
            $("#imgprofimage").attr("src", "/images/dp/" + this.itemId + ".png");
            if (this.whichMode === 3) {
                this.menuBarObj.setName("My Profile");
                document.title = "My Profile - " + this.userinfo["fullname"];
                this.divChangePassword.css("display", "block");
            }
            if (this.whichMode === 1) {
                this.chkboxHide.parent().show();
                this.chkboxHide.parent().prev().show();
                $("#divStatus").show();
                this.divResetPassword.css("display", "block");
            }

            this.isPhoneUnique = true;
            this.isEmailUnique = true;
            this.isNickNameUnique = true;
            this.initUserInfo();
            this.initFbConnect();
        }
        else if (this.itemId === 1) {
            this.menuBarObj.setName("New User");
            document.title = "New User";
            //$(this.divFormHeading).text("Create User");
            //this.btnCreateUser.text("Create");
            this.btnFbConnect.css("display", "none");
            this.anonymousUserId = this.userinfo["AnonymousUserID"];
            this.txtName.val(this.userinfo["FullName"]);
            if (this.userinfo["EmailID"].trim() !== "") {
                this.txtEmail.val(this.userinfo["EmailID"]);
                this.validateEmail();
            }
            this.txtPhPrimary.val(this.userinfo["PhoneNumber"]);
            if (this.userinfo["SocialID"].trim() !== "") {
                $("#lblFbId").attr("data-id", this.userinfo["SocialID"]);
                $("#userFbLink").text(this.userinfo["FullName"].trim().length > 0 ? this.userinfo["FullName"].trim() : "facebook");
            }
            this.initFbConnect();
        }
        else {
            this.menuBarObj.setName("New User");
            document.title = "New User";
            //$(this.divFormHeading).text("Create User");
            //this.btnCreateUser.text("Create");
            this.btnFbConnect.css("display", "none");
            $("#btnFbInvite").show();
        }
    };

    this.initUserPreference = function () {
        this.selectLocale.children().remove();
        this.selectTimeZone.children().remove();

        $.each(this.culture, function (k, cultOb) {
            this.selectLocale.append(`<option>${cultOb.Name}</option>`);
        }.bind(this));

        $.each(this.timeZone, function (k, tzOb) {
            this.selectTimeZone.append(`<option>${tzOb.Name}</option>`);
        }.bind(this));

        if (this.itemId > 1 && this.userinfo["preference"].trim() !== "") {
            this.Preference = JSON.parse(this.userinfo["preference"]);
            this.selectLocale.val(this.Preference.Locale);
            this.selectLocaleChangeAction();
            this.selectTimeZone.val(this.Preference.TimeZone);
        }
        else {
            this.selectLocale.val(ebcontext.user?.Preference?.Locale || "en-IN");
            this.selectLocaleChangeAction();
            this.selectTimeZone.val(ebcontext.user?.Preference?.TimeZone || "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi");
        }
    };

    this.setReadOnly = function () {
        this.txtName.attr("disabled", "true");
        this.txtNickName.attr("disabled", "true");
        this.txtEmail.attr("disabled", "true");
        this.pwdPassword.attr("disabled", "true");
        this.pwdPasswordCon.attr("disabled", "true");
        this.txtDateOfBirth.attr("disabled", "true");
        this.txtAlternateEmail.attr("disabled", "true");
        this.txtPhPrimary.attr("disabled", "true");
        this.txtPhSecondary.attr("disabled", "true");
        this.txtLandPhone.attr("disabled", "true");
        this.txtExtension.attr("disabled", "true");
        this.selUserType.attr("disabled", "true");
        this.chkboxHide.bootstrapToggle('disable');
        $("#divStatus input:radio[name='status']").prop("disabled", "true");
        $("#divGender input:radio[name='gender']").prop("disabled", "true");
        this.btnFbConnect.attr("disabled", "true");
        this.btnCreateUser.attr("disabled", "true");
        this.selectLocale.attr("disabled", "true");
        this.selectTimeZone.attr("disabled", "true");
        if (this.rolesTile !== null)
            this.rolesTile.setReadOnly();
        if (this.userGroupTile !== null)
            this.userGroupTile.setReadOnly();
    };

    this.statusChangeAction = function () {

        if ($("#divStatus input:radio[value='2']").prop("checked")) {
            this.chkboxHide.bootstrapToggle('off');
            this.chkboxHide.bootstrapToggle('enable');
        }
        else {
            this.chkboxHide.bootstrapToggle('off');
            this.chkboxHide.bootstrapToggle('disable');
        }
    };

    this.selectLocaleChangeAction = function (e) {
        var indx = this.selectLocale.prop('selectedIndex');
        this.divLocaleInfo.children().remove();
        this.divLocaleInfo.append(`<label style="font-weight: 300;width:100%;"><b>Native Name: &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</b>${this.culture[indx].NativeName}</label>`);
        this.divLocaleInfo.append(`<label style="font-weight: 300;width:100%;"><b>English Name: &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</b>${this.culture[indx].EnglishName}</label>`);
        this.divLocaleInfo.append(`<label style="font-weight: 300;width:100%;"><b>Currency Format: </b>${this.culture[indx].NumberFormat}</label>`);
        this.divLocaleInfo.append(`<label style="font-weight: 300;width:100%;"><b>Date Format: &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</b>${this.culture[indx].DateFormat}</label>`);
    };

    this.initUserInfo = function () {
        this.txtName.val(this.userinfo["fullname"]);
        this.txtNickName.val(this.userinfo["nickname"]);
        this.txtEmail.val(this.userinfo["email"]);
        this.txtDateOfBirth.val(this.userinfo["dob"]);
        this.txtAlternateEmail.val(this.userinfo["alternateemail"]);
        this.txtPhPrimary.val(this.userinfo["phnoprimary"]);
        this.txtPhSecondary.val(this.userinfo["phnosecondary"]);
        this.txtLandPhone.val(this.userinfo["landline"]);
        this.txtExtension.val(this.userinfo["phextension"]);
        this.selUserType.val(this.userinfo["eb_user_types_id"]);
        if (this.userinfo["forcepwreset"] === "T")
            this.ForceResetPassword.prop('checked', true);
        else
            this.ForceResetPassword.prop('checked', false);
        var st = "#divGender input:radio[value='" + this.userinfo["sex"] + "']";
        $(st).attr("checked", "checked");
        $("#lblFbId").attr("data-id", this.userinfo["fbid"]);
        $("#userFbLink").text(this.userinfo["fbname"] == "" ? this.userinfo["fullname"] : this.userinfo["fbname"]);

        $("#divStatus input:radio[value='" + this.userinfo["statusid"] + "']").attr("checked", "checked");

        if (this.userinfo["hide"] === "yes" && $("#divStatus input:radio[value='2']").prop("checked"))
            this.chkboxHide.bootstrapToggle('on');

        //var stus = this.statusList[this.userinfo["statusid"]];
        //if (stus === "Active")
        //    this.chkboxActive.prop("checked", "true");
        //else if (stus === "Deactivated")
        //    this.chkboxActive.removeAttr("checked");
        //else if (stus === "Terminated") {
        //    this.chkboxTerminate.prop("checked", "true");
        //    this.chkboxActive.removeAttr("checked");
        //}
        //if (this.userinfo["hide"] === "yes")
        //    this.chkboxHide.prop("checked", "true");
    };

    this.initFbConnect = function () {
        $.ajaxSetup({ cache: true });
        $.getScript('https://connect.facebook.net/en_US/sdk.js', function () {
            FB.init({
                appId: this.Environment === 'Development' ? '141908109794829' : this.Environment === 'Staging' ? '1525758114176201' : '2202041803145524',//'141908109794829',//,'1525758114176201',//
                cookie: true,  // enable cookies to allow the server to access
                // the session
                xfbml: true,  // parse social plugins on this page
                version: this.Environment === 'Development' ? 'v2.11' : this.Environment === 'Staging' ? 'v2.8' : 'v3.0' // use graph api version 2.8
            });
            FB.getLoginStatus(updateStatusCallback.bind(this));
        }.bind(this));
        function updateStatusCallback(response) {
            if (response.authResponse !== null) {
                if ($("#lblFbId").attr("data-id") === "") {
                    if (this.whichMode === 3) {
                        $("#btnFbConnect").show();
                    }
                    else {
                        $("#btnFbInvite").show();
                    }
                }
                else {
                    $("#userFbLink").attr("href", "www.facebook.com/" + $("#lblFbId").attr("data-id"));
                    $("#userFbLink").show();
                    $("#imgUserFbProfPic").attr("src", "http://graph.facebook.com/" + $("#lblFbId").attr("data-id") + "/picture?type=square");
                    $("#imgUserFbProfPic").show();
                    //FBpicture();
                }
            }
            else {
                if ($("#lblFbId").attr("data-id") === "")
                    if (this.whichMode === 3) {
                        $("#btnFbConnect").show();
                    }
                    else {
                        $("#btnFbInvite").show();
                    }
                else {
                    $("#imgUserFbProfPic").attr("src", "http://graph.facebook.com/" + $("#lblFbId").attr("data-id") + "/picture?type=square");
                    $("#imgUserFbProfPic").show();
                    $("#userFbLink").attr("href", "http://www.facebook.com/" + $("#lblFbId").attr("data-id"));
                    $("#userFbLink").show();
                }
            }
        }
        $('#btnFbConnect').off("click").on("click",
            function () {
                FB.login(loginCallBack);
            }
        );
        function loginCallBack(response) {
            if (response.authResponse !== null) {
                this.fbId = response.authResponse.userID;
                $("#lblFbId").attr("data-id", this.fbId);
                $("#userFbLink").attr("href", "http://www.facebook.com/" + this.fbId);
                $("#userFbLink").show();
                $("#btnFbConnect").hide();
                FBpicture();
                FB.logout(logoutCallBack);
            }
            else
                console.log("fb login failed - Response: " + response);
        }

        function logoutCallBack(respose) {
            console.log("logout");
        }

        function FBpicture() {
            FB.api(
                '/me?fields=name,picture.type(large)',
                function (response) {
                    $("#userFbLink").text(response.name);
                    this.fbName = response.name;
                    $("#imgUserFbProfPic").attr("src", response.picture.data.url);
                    $("#imgUserFbProfPic").show();
                }
            );
        }
    };

    this.findDependentRoles = function (dominant) {
        for (var i = 0; i < this.r2rList.length; i++) {
            if (this.r2rList[i].Dominant == dominant) {
                this.dependentList.push(this.r2rList[i].Dependent);
                this.findDependentRoles(this.r2rList[i].Dependent);
            }
        }
    };

    this.chkItemCustomFunc = function (_this, $chkBox) {
        _this.dependentList = [];

        $.each($(this.divSearchResults).find('input'), function (i, ob) {
            if (_this.dominantList.indexOf(parseInt($(ob).attr('data-id'))) !== -1) {
                $(ob).removeAttr("checked");
                $(ob).attr("disabled", "true");
            }
        });

        if ($chkBox.is(':checked')) {
            _this.findDependentRoles($chkBox.attr("data-id"));
            var st = "";
            var itemid = [];
            $.each($(this.divSelectedDisplay).children(), function (i, ob) {
                for (let i = 0; i < _this.dependentList.length; i++) {
                    if (_this.dependentList[i] == $(ob).attr('data-id')) {
                        st += '\n' + $(ob).attr('data-name');
                        itemid.push($(ob).attr('data-id'));
                    }
                }
            });
            if (st !== '') {
                if (confirm("Continuing this Operation will Remove the following Item(s)" + st + "\n\nClick OK to Continue")) {
                    for (i = 0; i < itemid.length; i++) {
                        $(this.divSelectedDisplay).children("[data-id='" + itemid[i] + "']").remove();
                    }
                }
                else {
                    $chkBox.removeAttr("checked");
                }
            }
        }

        $.each($(this.divSearchResults).find('.SearchCheckbox:checked'), function (i, ob) {
            _this.findDependentRoles($(ob).attr('data-id'));
        });
        $.each($(this.divSelectedDisplay).children(), function (i, ob) {
            _this.dependentList.push(parseInt($(ob).attr('data-id')));
            _this.findDependentRoles($(ob).attr('data-id'));
        });
        $.each($(this.divSearchResults).find('input'), function (i, ob) {
            if (_this.dependentList.indexOf(parseInt($(ob).attr('data-id'))) !== -1 || _this.dominantList.indexOf(parseInt($(ob).attr('data-id'))) !== -1) {
                $(ob).removeAttr("checked");
                $(ob).attr("disabled", "true");
            }
            else
                $(ob).removeAttr("disabled");

            if ($(this.divSelectedDisplay).children("[data-id=" + $(ob).attr('data-id') + "]").length > 0) {
                $(ob).attr("disabled", "true");
                $(ob).prop("checked", "true");
            }
        }.bind(this));
    };

    this.initTiles = function () {
        //INIT ROLES
        var metadata1 = ['Id', 'Name', 'Description'];
        var initroles = [];
        if (this.U_Roles !== null)
            for (let i = 0; i < this.customRoles.length; i++)
                if (this.U_Roles.indexOf(this.customRoles[i].Id) !== -1)
                    initroles.push(this.customRoles[i]);
        this.rolesTile = new TileSetupJs({
            $container: $("#menu1"),
            title: "Add Roles",
            initObjList: initroles,
            searchObjList: this.customRoles,
            objMetadata: metadata1,
            searchAjax: null,
            chkUnChkItemCustomFunc: this.chkItemCustomFunc,
            parentThis: this
        });

        //INIT USER GROUPS
        var initgroups = [];
        if (this.U_Groups !== null)
            for (let i = 0; i < this.userGroup.length; i++)
                if (this.U_Groups.indexOf(this.userGroup[i].Id) !== -1)
                    initgroups.push(this.userGroup[i]);
        this.userGroupTile = new TileSetupJs({
            $container: $("#menu3"),
            title: "Add User Group",
            initObjList: initgroups,
            searchObjList: this.userGroup,
            objMetadata: metadata1,
            searchAjax: null,
            chkUnChkItemCustomFunc: null,
            parentThis: this
        });

        if (this.whichMode === 3) {
            this.rolesTile.setReadOnly();
            this.userGroupTile.setReadOnly();
        }
    };

    this.validateEmail = function () {
        clearTimeout(this.timer1);
        let val = this.txtEmail.val().trim();
        if ((this.userinfo && this.userinfo["email"] === val) || val === '') {
            this.txtEmail.css("border-color", "rgb(204, 204, 204)");
            this.txtEmail.prev().css("border-color", "rgb(204, 204, 204)");
            this.spanEmail.html(``);
            this.isEmailUnique = true;
            return;
        }
        if (this.emailRegex.test(val)) {
            this.timer1 = setTimeout(function () { this.uniqueCheckAjaxCall(this.txtEmail, this.spanEmail, 'email', 1); }.bind(this), 500);
        }
        else {
            this.txtEmail.css("border-color", "rgb(204, 0, 0)");
            this.txtEmail.prev().css("border-color", "rgb(204, 0, 0)");
            this.spanEmail.children().remove();
            this.spanEmail.append(`<i class="fa fa-exclamation-circle" aria-hidden="true" style="color:red;"></i>`);
            this.spanEmail.attr("title", "Invalid email");
        }
    };

    this.validatePhone = function () {
        clearTimeout(this.timer2);
        let val = this.txtPhPrimary.val().trim();
        if ((this.userinfo && this.userinfo["phnoprimary"] === val) || val === '') {
            this.txtPhPrimary.css("border-color", "rgb(204, 204, 204)");
            this.txtPhPrimary.prev().css("border-color", "rgb(204, 204, 204)");
            this.spanPhone.html(``);
            this.isPhoneUnique = true;
            return;
        }
        this.timer2 = setTimeout(function () { this.uniqueCheckAjaxCall(this.txtPhPrimary, this.spanPhone, 'phone number', 2); }.bind(this), 500);
    };

    this.validateNickName = function () {
        clearTimeout(this.timer3);
        let val = this.txtNickName.val().trim();
        if ((this.userinfo && this.userinfo["nickname"] === val) || val === '') {
            this.txtNickName.css("border-color", "rgb(204, 204, 204)");
            this.txtNickName.prev().css("border-color", "rgb(204, 204, 204)");
            this.spanNickName.html(``);
            this.isNickNameUnique = true;
            return;
        }
        this.timer3 = setTimeout(function () { this.uniqueCheckAjaxCall(this.txtNickName, this.spanNickName, 'nick name', 4); }.bind(this), 500);
    };

    this.uniqueCheckAjaxCall = function ($txtCtrl, $span, title, mode) {
        if ($txtCtrl.val() === '' || $txtCtrl.val().trim() === '')
            return;
        $txtCtrl.css("border-color", "rgb(204, 204, 204)");
        $txtCtrl.prev().css("border-color", "rgb(204, 204, 204)");
        $span.html(`<i class="fa fa-spinner fa-pulse" aria-hidden="true"></i>`);
        $span.attr("title", "Validating...");
        if (mode === 1)
            this.isEmailUnique = false;
        else if (mode === 2)
            this.isPhoneUnique = false;
        $.ajax({
            type: "POST",
            url: "../Security/IsUnique",
            data: { val: $txtCtrl.val(), id: this.itemId, mode: mode },
            error: function (xhr, ajaxOptions, thrownError) {
                $span.html(`<i class="fa fa-refresh" aria-hidden="true" style="color:red;"></i>`);
                $span.attr("title", "Unique check failed. Click here to retry.");
                $span.css("cursor", "pointer");
                $span.off('click').on('click', function () {
                    this.uniqueCheckAjaxCall($txtCtrl, $span, title, mode);
                }.bind(this));
            }.bind(this),
            success: function (isUnique) {
                if (isUnique) {
                    $span.html(`<i class="fa fa-check" aria-hidden="true" style="color:green;"></i>`);
                    $span.attr("title", "Unique " + title);
                    if (mode === 1)
                        this.isEmailUnique = true;
                    else if (mode === 2)
                        this.isPhoneUnique = true;
                    else if (mode === 4)
                        this.isNickNameUnique = true;
                }
                else {
                    $txtCtrl.css("border-color", "rgb(204, 0, 0)");
                    $txtCtrl.prev().css("border-color", "rgb(204, 0, 0)");
                    $span.html(`<i class="fa fa-exclamation-circle" aria-hidden="true" style="color:red;"></i>`);
                    $span.attr("title", `This ${title} already exists.`);
                }
            }.bind(this)
        });
    };

    this.validateInfo = function (target, regex) {
        //target.off('keyup').on('keyup', function (evt) { this.validateInfo(target, regex)}.bind(this));
        var val = target.val();
        if (regex.test(val)) {
            target.css("border-color", "rgb(204, 204, 204)");
            target.prev().css("border-color", "rgb(204, 204, 204)");
            return true;
        }
        else {
            target.css("border-color", "rgb(204, 0, 0)");
            target.prev().css("border-color", "rgb(204, 0, 0)");
            return false;
        }
    };

    this.initChangePwdModal = function () {
        this.pwdOld.val('');
        this.pwdNew.val('');
        this.pwdNewConfirm.val('');
        this.pwdOld.css("border-color", "rgb(204, 204, 204)");
        this.pwdNew.css("border-color", "rgb(204, 204, 204)");
        this.pwdNewConfirm.css("border-color", "rgb(204, 204, 204)");
        this.lblPwdChngMsg.text("");
        this.ChangePwdModal.modal('show');
    };
    this.initResetPwdModal = function () {
        this.pwdResetNew.val('');
        this.pwdResetNewConfirm.val('');
        this.makeAsShowPwdField(this.pwdResetNewConfirm);
        this.ResetPwdModal.modal('show');
    };

    this.updatePassword = function () {
        if (this.pwdNew.val() !== this.pwdNewConfirm.val()) {
            EbMessage("show", { Message: 'Password mismach found', AutoHide: true, Background: '#bf1e1e' });
            return;
        }
        if (this.pwdOld.val().length < 8 || this.pwdNew.val().length < 8) {
            EbMessage("show", { Message: 'Password length too short. Minimum length 8 required.', AutoHide: true, Background: '#bf1e1e' });
            return;
        }
        $(this.btnUpdatePwd.children()[0]).show();
        $.ajax({
            type: "POST",
            url: "../Security/ChangeUserPassword",
            data: { OldPwd: this.pwdOld.val(), NewPwd: this.pwdNew.val() },
            error: function () {
                EbMessage("show", { Message: 'Something unexpected occurred', AutoHide: true, Background: '#bf1e1e' });
                $(this.btnUpdatePwd.children()[0]).hide();
            }.bind(this),
            success: function (status) {
                if (status) {
                    EbMessage("show", { Message: 'Password Updated Successfully', AutoHide: true, Background: '#1ebf1e' });
                    this.pwdOld.val("");
                    this.pwdNew.val("");
                    this.pwdNewConfirm.val("");
                    this.ChangePwdModal.modal('hide');
                }
                else
                    EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Background: '#bf1e1e' });
                $(this.btnUpdatePwd.children()[0]).hide();
            }.bind(this)
        });
    };

    this.resetPassword = function () {
        if (this.pwdResetNew.val() !== this.pwdResetNewConfirm.val()) {
            EbMessage("show", { Message: 'Password mismach found', AutoHide: true, Background: '#bf1e1e' });
            return;
        }
        if (this.pwdResetNew.val().length < 8) {
            EbMessage("show", { Message: 'Password length too short. Minimum length 8 required.', AutoHide: true, Background: '#bf1e1e' });
            return;
        }
        $(this.btnResetPwd.children()[0]).show();
        $.ajax({
            type: "POST",
            url: "../Security/ResetUserPassword",
            data: { userid: this.itemId, username: this.userinfo["email"], NewPwd: this.pwdResetNew.val() },
            error: function () {
                EbMessage("show", { Message: 'Something unexpected occurred', AutoHide: true, Background: '#bf1e1e' });
                $(this.btnResetPwd.children()[0]).hide();
            }.bind(this),
            success: function (status) {
                if (status) {
                    EbMessage("show", { Message: 'Password Changed Successfully', AutoHide: true, Background: '#1ebf1e' });
                    this.pwdResetNew.val("");
                    this.pwdResetNewConfirm.val("");
                    this.ResetPwdModal.modal('hide');
                }
                else
                    EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Background: '#bf1e1e' });
                $(this.btnResetPwd.children()[0]).hide();
            }.bind(this)
        });
    };

    this.clickbtnCreateUser = function () {
        if (this.txtName.val().trim() === "") {
            EbMessage("show", { Message: 'Please enter a valid full name.', AutoHide: true, Background: '#bf1e1e' });
            return;
        }
        let _email = this.txtEmail.val().trim();
        let _phone = this.txtPhPrimary.val().trim();
        if (_email === '' && _phone === '') {
            EbMessage("show", { Message: 'Please enter a valid email or phone number.', AutoHide: true, Background: '#bf1e1e' });
            return;
        }
        if (_email !== '' && !this.validateInfo(this.txtEmail, this.emailRegex)) {
            EbMessage("show", { Message: 'Email is not valid.', AutoHide: true, Background: '#bf1e1e' });
            return;
        }
        if (_email !== '' && !this.isEmailUnique) {
            EbMessage("show", { Message: 'Email is already exists.', AutoHide: true, Background: '#bf1e1e' });
            return;
        }
        if (_phone !== '' && !this.isPhoneUnique) {
            EbMessage("show", { Message: 'Phone is already exists.', AutoHide: true, Background: '#bf1e1e' });
            return;
        }
        if (this.txtNickName.val().trim() !== '' && !this.isNickNameUnique) {
            EbMessage("show", { Message: 'Nick Name is already exists.', AutoHide: true, Background: '#bf1e1e' });
            return;
        }
        if (this.txtAlternateEmail.val().trim() !== '' && !this.validateInfo(this.txtAlternateEmail, this.emailRegex)) {
            EbMessage("show", { Message: 'Alternate email is not valid.', AutoHide: true, Background: '#bf1e1e' });
            return;
        }
        if (this.pwdPassword.val() !== this.pwdPasswordCon.val() && this.whichMode === 1 && this.itemId < 2) {
            EbMessage("show", { Message: 'Password mismatch found', AutoHide: true, Background: '#bf1e1e' });
            return;
        }
        if (this.pwdPassword.val().length < 8 && this.whichMode === 1 && this.itemId < 2) {
            EbMessage("show", { Message: 'Password length too short. Minimum length 8 required.', AutoHide: true, Background: '#bf1e1e' });
            return;
        }
        if (!this.validateInfo(this.pwdPassword, this.pwdRegex) && this.whichMode === 1 && this.itemId < 2) {
            EbMessage("show", { Message: 'Invalid password. Please try another password.', AutoHide: true, Background: '#bf1e1e' });
            return;
        }

        var dateRegex = /^\d{4}[\/\-]\d{2}[\/\-]\d{2}$/;
        if (!dateRegex.test(this.txtDateOfBirth.val().trim())) {
            this.txtDateOfBirth.val('2000-01-01');
        }

        this.btnCreateUser.attr("disabled", "true");
        $("#eb_common_loader").EbLoader("show", { maskItem: { Id: ".s-dash-container" } });

        var oldstus = this.itemId > 1 ? parseInt(this.userinfo["statusid"]) : -1;
        var newstus = $("#divStatus input:radio[name='status']:checked").val();
        if (oldstus === newstus)
            newstus = oldstus + 100;//Status not changed, so adding 100 to oldstus just to infirm that no change in stus

        var dict = new Object();
        dict["anonymoususerid"] = this.itemId == 1 ? this.anonymousUserId : 0;
        dict["fullname"] = this.txtName.val();
        dict["nickname"] = this.txtNickName.val();
        dict["email"] = this.txtEmail.val();
        dict["pwd"] = this.pwdPassword.val();
        dict["dob"] = this.txtDateOfBirth.val();
        dict["sex"] = $("#divGender input:radio:checked").attr("value");
        dict["alternateemail"] = this.txtAlternateEmail.val();
        dict["phoneprimary"] = this.txtPhPrimary.val();
        dict["phonesecondary"] = this.txtPhSecondary.val();
        dict["landline"] = this.txtLandPhone.val();
        dict["extension"] = this.txtExtension.val();
        dict["eb_user_types_id"] = this.selUserType.val();
        dict["fbid"] = $("#lblFbId").attr("data-id");
        dict["fbname"] = $("#userFbLink").text();
        dict["roles"] = this.rolesTile.getItemIds();
        dict["usergroups"] = this.userGroupTile.getItemIds();
        dict["statusid"] = newstus;
        dict["hide"] = this.chkboxHide.prop("checked") ? "yes" : "no";
        dict["preference"] = JSON.stringify($.extend(this.Preference, { Locale: this.selectLocale.val(), TimeZone: this.selectTimeZone.val() }));
        dict["loc_add"] = this.LocCntr.options.added.join();
        dict["loc_delete"] = this.LocCntr.options.deleted.join();
        dict["forceresetpw"] = this.ForceResetPassword.prop("checked");


        $.ajax({
            type: "POST",
            url: "../Security/SaveUser",
            data: {
                userid: this.itemId,
                usrinfo: JSON.stringify(dict)
            },
            error: function (xhr, ajaxOptions, thrownError) {
                EbMessage("show", { Message: 'Something unexpected occurred', AutoHide: true, Background: '#bf1e1e' });
                $("#btnCreateUser").removeAttr("disabled");
                $("#eb_common_loader").EbLoader("hide");
            }.bind(this),
            success: function (result) {
                if (result > 0) {
                    EbDialog("show",
                        {
                            Message: "Saved Successfully",
                            Buttons: {
                                "Ok": {
                                    Background: "green",
                                    Align: "right",
                                    FontColor: "white;"
                                }
                            },
                            CallBack: function (name) {
                                window.top.close();
                            }
                        });
                }
                else if (result === -1)
                    EbMessage("show", { Message: 'Unable to create new user. Reached maximum user limit.', AutoHide: true, Background: '#1e1ebf' });
                else if (result === -2)
                    EbMessage("show", { Message: 'Unable to save user. Email already exists.', AutoHide: true, Background: '#1e1ebf' });
                else if (result === -3)
                    EbMessage("show", { Message: 'Unable to save user. Phone already exists.', AutoHide: true, Background: '#1e1ebf' });
                else if (result === -4)
                    EbMessage("show", { Message: 'Unable to save user. Nick Name already exists.', AutoHide: true, Background: '#1e1ebf' });
                else
                    EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Background: '#bf1e1e' });
                $("#btnCreateUser").removeAttr("disabled");
                $("#eb_common_loader").EbLoader("hide");
            }
        });
    };

    this.clickbtnDeleteUser = function () {
        EbDialog("show",
            {
                Message: "Are you sure you want to permanently delete this user?",
                Buttons: {
                    "Yes": {
                        Background: "green",
                        Align: "left",
                        FontColor: "white;"
                    },
                    "No": {
                        Background: "violet",
                        Align: "right",
                        FontColor: "white;"
                    }
                },
                CallBack: function (name) {
                    if (name === "Yes") {
                        $("#btnDeleteUser").attr("disabled", true);
                        $("#eb_common_loader").EbLoader("show", { maskItem: { Id: ".s-dash-container" } });
                        $.ajax({
                            type: "POST",
                            url: "../Security/DeleteUser",
                            data: { userid: this.itemId },
                            error: function (xhr, ajaxOptions, thrownError) {
                                EbMessage("show", { Message: 'Something unexpected occurred', AutoHide: true, Background: '#bf1e1e' });
                                $("#btnDeleteUser").removeAttr("disabled");
                                $("#eb_common_loader").EbLoader("hide");
                            }.bind(this),
                            success: function (result) {
                                if (result > 0) {
                                    EbDialog("show",
                                        {
                                            Message: "Deleted Successfully",
                                            Buttons: {
                                                "Ok": {
                                                    Background: "green",
                                                    Align: "right",
                                                    FontColor: "white;"
                                                }
                                            },
                                            CallBack: function (name) {
                                                window.top.close();
                                            }
                                        });
                                }
                                else
                                    EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Background: '#bf1e1e' });
                                $("#btnDeleteUser").removeAttr("disabled");
                                $("#eb_common_loader").EbLoader("hide");
                            }
                        });
                    }
                }.bind(this)
            });
    };

    this.makeAsShowPwdField = function ($pwdField) {
        let id = $pwdField.attr("id");
        $pwdField.after(`<span id="${id}_eop" class="form-control-feedback" style="pointer-events: all; z-index: 3; top: 5px; cursor: pointer; color: #555;" title="Click to show password"><i class="fa fa-eye" aria-hidden="true"></i></span>`);
        $pwdField.after(`<span id="${id}_ecl" class="form-control-feedback" style="pointer-events: all; z-index: 3; top: 5px; cursor: pointer; color: #555; display: none;"  title="Click to hide password"><i class="fa fa-eye-slash" aria-hidden="true"></i></span>`);
        let $eop = $("#" + id + "_eop");
        let $ecl = $("#" + id + "_ecl");
        $eop.on("click", function (e) {
            $pwdField[0].type = "text";
            $(e.target).closest('span').hide();
            $(e.target).closest('span').prev().show();
        });
        $ecl.on("click", function (e) {
            $pwdField[0].type = "password";
            $(e.target).closest('span').hide();
            $(e.target).closest('span').next().show();
        });
    };

    this.init();
};

//---------------------------------------------------------------USERGROUP-----------------------------------------------------------------------------
var UserGroupJs = function (infoDict, usersList, ipconsList, dtconsList, userListAll) {
    this.menuBarObj = new EbHeader();
    this.menuBarObj.insertButton(`<button id="btnSaveAll" class='btn' title='Save'><i class="fa fa-floppy-o" aria-hidden="true"></i></button>`);
    this.infoDict = infoDict;
    this.usersList = usersList;
    this.usersListAll = userListAll;
    this.ipconsList = ipconsList;//Constraint
    this.dtconsList = dtconsList;//Constraint
    this.txtUserGroupName = $("#txtUserGroupName");
    this.txtUserGroupDescription = $("#txtUserGroupDescription");
    this.btnSaveAll = $("#btnSaveAll");

    this.usersTile = null;
    this.ipAddTile = null;
    this.timeAddTile = null;

    this.init = function () {

        this.btnSaveAll.on('click', this.clickbtnSaveAll.bind(this));

        this.txtUserGroupName.val(this.infoDict['name']);
        this.txtUserGroupDescription.val(this.infoDict['description']);

        //------------------INIT USERS TILE------------------
        var initUserList = null;
        var metadata2 = ['id', 'name', 'email', 'ProfilePicture'];
        var userListAll = [];
        for (let i = 0; i < this.usersListAll.length; i++) {
            let _name = this.usersListAll[i].Name || this.usersListAll[i].Email || this.usersListAll[i].Phone;
            userListAll.push({ id: this.usersListAll[i].Id, name: _name, email: this.usersListAll[i].Email });
        }
        if (parseInt(this.infoDict['id']) > 0) {
            //this.btnSaveAll.text("Update");
            this.menuBarObj.setName(this.infoDict['name']);
            document.title = "Edit User Group - " + this.infoDict['name'];
            initUserList = [];
            for (i = 0; i < this.usersList.length; i++) {
                let _name = this.usersList[i].Name || this.usersList[i].Email || this.usersList[i].Phone;
                initUserList.push({ id: this.usersList[i].Id, name: _name, email: this.usersList[i].Email });
            }
        }
        else {
            //this.btnSaveAll.text("Create");
            this.menuBarObj.setName("New User Group");
            document.title = "New User Group";
        }
        if (this.usersTile === null) {
            this.usersTile = new TileSetupJs({
                $container: $("#divusers"),
                title: "Add Users",
                initObjList: initUserList,
                searchObjList: userListAll,
                objMetadata: metadata2,
                searchAjax: null,
                chkUnChkItemCustomFunc: null,
                parentThis: this
            });
        }
        //-----------------------------------------------

        //------------------INIT CONSTRAINTS TILE------------------

        var metadata3 = ['Id', 'Title', 'Description', '_simpleClose'];
        if (this.ipAddTile === null) {
            this.ipAddTile = new TileSetupJs({
                $container: $("#divIp"),
                title: "New IP",
                initObjList: this.ipconsList,
                searchObjList: null,
                objMetadata: metadata3,
                searchAjax: null,
                chkUnChkItemCustomFunc: null,
                parentThis: null,
                longTitle: "IP Address Whitelist",
                tileDivHeight: "auto"
            });
        }
        if (this.timeAddTile === null) {
            this.timeAddTile = new TileSetupJs({
                $container: $("#divTime"),
                title: "New DateTime",
                initObjList: this.dtconsList,
                searchObjList: null,
                objMetadata: metadata3,
                searchAjax: null,
                chkUnChkItemCustomFunc: null,
                parentThis: null,
                longTitle: "DateTime Whitelist",
                tileDivHeight: "auto"
            });
        }

        //--------------------------------------------------------
    };
    this.clickbtnSaveAll = function () {
        var dict = new Object();
        if (this.txtUserGroupName.val() === '' || this.txtUserGroupDescription.val() === '') {
            EbMessage("show", { Message: 'Please Enter UserGroup Name/Description', AutoHide: true, Background: '#bf1e1e' });
            return;
        }
        dict["name"] = this.txtUserGroupName.val();
        dict["description"] = this.txtUserGroupDescription.val();
        dict["users"] = this.usersTile.getItemIds();
        dict["new_constraint_ip"] = this.ipAddTile.getExtendedJson();
        dict["deleted_ipconst_id"] = this.ipAddTile.getDeletedObjIds();
        dict["new_constraint_dt"] = this.timeAddTile.getExtendedJson();
        dict["deleted_ipconst_dt"] = this.timeAddTile.getDeletedObjIds();

        this.btnSaveAll.attr("disabled", "true");
        $("#eb_common_loader").EbLoader("show");
        $.ajax({
            type: "POST",
            url: "../Security/SaveUserGroup",
            data: { _id: this.infoDict['id'], _userGroupInfo: JSON.stringify(dict) },
            error: function (xhr, ajaxOptions, thrownError) {
                EbMessage("show", { Message: 'Something unexpected occurred', AutoHide: true, Background: '#bf1e1e' });
                this.btnSaveAll.removeAttr("disabled");
                $("#eb_common_loader").EbLoader("hide");
            }.bind(this),
            success: this.saveUserGroupSuccess.bind(this)
        });
    };
    this.saveUserGroupSuccess = function (result) {
        if (result > 0) {
            EbDialog("show",
                {
                    Message: "Saved Successfully",
                    Buttons: {
                        "Ok": {
                            Background: "green",
                            Align: "right",
                            FontColor: "white;"
                        }
                    },
                    CallBack: function (name) {
                        window.top.close();
                    }
                });
        }
        else if (result === -1)
            EbMessage("show", { Message: 'UserGroup name already exists. Enter a unique name.', AutoHide: true, Background: '#bf1e1e' });
        else
            EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Background: '#bf1e1e' });
        this.btnSaveAll.removeAttr("disabled");
        $("#eb_common_loader").EbLoader("hide");
    };

    this.init();
};