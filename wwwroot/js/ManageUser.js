var UserJs = function (mode, userinfo, cusroles, usergroup, uroles, ugroups, r2rList, userstatusList, culture, timeZone, env) {
    this.whichMode = mode;
    //CreateEdit = 1, View = 2, MyProfileView = 3
    this.Environment = env;
    this.menuBarObj = $("#layout_div").data("EbHeader");
    this.menuBarObj.insertButton(`<button id="btnCreateUser" class='btn' title='Save'><i class="fa fa-floppy-o" aria-hidden="true"></i></button>`);
    this.userinfo = userinfo;
    this.customRoles = cusroles;
    this.culture = culture;
    this.timeZone = timeZone;
    this.userGroup = usergroup;
    this.U_Roles = uroles;
    this.U_Groups = ugroups;
    this.r2rList = r2rList;
    this.statusList = userstatusList;
    this.itemId = parseInt($("#userid").val());
    this.anonymousUserId = null;
    this.dependentList = [];
    this.dominantList = [];

    //this.divFormHeading = $("#divFormHeading");
    this.txtName = $("#txtFullName");
    this.txtNickName = $("#txtNickName");
    this.txtEmail = $("#txtEmail");
    this.spanEmail = $("#spanEmail");
    this.pwdPassword = $("#pwdPassword");
    this.lblMessage = $("#lblMessage");
    this.txtDateOfBirth = $("#txtDateOfBirth");
    this.txtAlternateEmail = $("#txtAlternateEmail");
    this.txtPhPrimary = $("#txtPhPrimary");
    this.txtPhSecondary = $("#txtPhSecondary");
    this.txtLandPhone = $("#txtLandPhone");
    this.txtExtension = $("#txtExtension");

    this.chkboxHide = $("#chkboxHide");
    this.divChangePassword = $("#divChangePassword");
    this.btnChangePassword = $("#btnChangePassword");
    this.ChangePwdModal = $("#MU_ChangePwdModal");
    this.pwdOld = $("#pwdOld");
    this.pwdNew = $("#pwdNew");
    this.pwdNewConfirm = $("#pwdNewConfirm");
    this.lblPwdChngMsg = $("#lblPwdChngMsg");
    this.btnUpdatePwd = $("#btnUpdatePwd");

    this.divPassword = $("#divPassword");
    this.btnFbConnect = $("#btnFbConnect");
    this.btnCreateUser = $("#btnCreateUser");
    this.FB = null;
    this.fbId = null;
    this.fbName = null;
    this.timer1 = null;
    this.isInfoValidEmail = false;
    this.isInfoValidEmail2 = true;

    this.rolesTile = null;
    this.userGroupTile = null;

    this.selectLocale = $("#sellocale");
    this.divLocaleInfo = $("#divLocaleInfo");
    this.selectTimeZone = $("#seltimezone");
   
    this.init = function () {

        this.txtEmail.on('keyup', this.validateEmail.bind(this));
        this.txtEmail.on('change', this.validateEmail.bind(this));
        this.pwdPassword.on('keyup', function (e) { this.validateInfo(this.pwdPassword, /^([a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]){8,}$/) }.bind(this));
        this.txtAlternateEmail.on('change', function (e) { this.isInfoValidEmail2 = this.validateInfo(this.txtAlternateEmail, /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/) }.bind(this))
        this.btnCreateUser.on('click', this.clickbtnCreateUser.bind(this));
        this.selectLocale.on("change", this.selectLocaleChangeAction.bind(this));
        this.btnChangePassword.on("click", this.initChangePwdModal.bind(this));
        this.btnUpdatePwd.on('click', this.updatePassword.bind(this));
        
        this.pwdOld.on('keyup', this.onKeyUpPwdInModal.bind(this, this.pwdOld));
        this.pwdNew.on('keyup', this.onKeyUpPwdInModal.bind(this, this.pwdNew));
        this.pwdNewConfirm.on('keyup', this.onKeyUpPwdInModal.bind(this, this.pwdNewConfirm));

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
        this.DpImageUpload();
    }


    this.DpImageUpload = function () {
        var logoCrp = new cropfy({
            Container: 'Add_User_Dp',
            Toggle: '#profimage',
            isUpload: true,  //upload to cloud
            enableSE: true, //enable server event
            Browse: true,  //browse image
            Result: 'base64',
            Type: 'dp',
            //Tid: _tid, //if type is logo
            Preview: "#imgprofimage"
        });
        logoCrp.getFile = function (file) {

        }.bind(this);
    };


    this.onKeyUpPwdInModal = function (pwdThis) {
        if (this.validateInfo(pwdThis, /^([a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]){8,}$/)) {
            if (this.pwdNewConfirm.val() === this.pwdNew.val() || pwdThis === this.pwdOld) 
                this.lblPwdChngMsg.text("");
            else 
                this.lblPwdChngMsg.text("Password Mismatch");
        }
        else 
            this.lblPwdChngMsg.text("Minimum Length Should be 8");
    }

    this.initForm = function () {
        this.chkboxHide.parent().hide();
        this.chkboxHide.parent().prev().hide();
        if (this.itemId > 1) {
            this.menuBarObj.setName("Edit User");
            //$(this.divFormHeading).text("Edit User");
            //this.btnCreateUser.text("Update");
            this.txtEmail.attr("disabled", "true");
            this.divPassword.css("display", "none");
            if (this.whichMode === 3) {
                this.menuBarObj.setName("My Profile");
                this.divChangePassword.css("display", "block");
            }                
            if (this.whichMode === 1) {
                this.chkboxHide.parent().show();
                this.chkboxHide.parent().prev().show();
                $("#divStatus").show();
            }
                
            this.isInfoValidEmail = true;
            this.initUserInfo();
            this.initFbConnect();
        }
        else if (this.itemId === 1) {
            this.menuBarObj.setName("New User");
            //$(this.divFormHeading).text("Create User");
            //this.btnCreateUser.text("Create");
            this.btnFbConnect.css("display", "none");
            this.anonymousUserId = this.userinfo["AnonymousUserID"];
            this.txtName.val(this.userinfo["FullName"]);
            this.txtEmail.val(this.userinfo["EmailID"]);
            this.txtPhPrimary.val(this.userinfo["PhoneNumber"]);
            if (this.userinfo["SocialID"].trim() !== "") {
                $("#lblFbId").attr("data-id", this.userinfo["SocialID"]);
                $("#userFbLink").text((this.userinfo["FullName"].trim().length > 0) ? this.userinfo["FullName"].trim() : "facebook");
            }
            this.validateEmail();
            this.initFbConnect();
        }
        else {
            this.menuBarObj.setName("New User");
            //$(this.divFormHeading).text("Create User");
            //this.btnCreateUser.text("Create");
            this.btnFbConnect.css("display", "none");
            $("#btnFbInvite").show();
        }
    }

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
            var pobj = JSON.parse(this.userinfo["preference"]);
            this.selectLocale.val(pobj.Locale);
            this.selectLocaleChangeAction();
            this.selectTimeZone.val(pobj.TimeZone);
        }
        else {
            this.selectLocale.val("en-US");
            this.selectLocaleChangeAction();
            this.selectTimeZone.val("(UTC) Coordinated Universal Time");
        }
    }

    this.setReadOnly = function () {
        this.txtName.attr("disabled", "true");
        this.txtNickName.attr("disabled", "true");
        this.txtEmail.attr("disabled", "true");
        this.pwdPassword.attr("disabled", "true");
        this.txtDateOfBirth.attr("disabled", "true");
        this.txtAlternateEmail.attr("disabled", "true");
        this.txtPhPrimary.attr("disabled", "true");
        this.txtPhSecondary.attr("disabled", "true");
        this.txtLandPhone.attr("disabled", "true");
        this.txtExtension.attr("disabled", "true");
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
    }

    this.statusChangeAction = function () {
        
        if ($("#divStatus input:radio[value='2']").prop("checked")) {
            this.chkboxHide.bootstrapToggle('off');
            this.chkboxHide.bootstrapToggle('enable');
        }
        else {
            this.chkboxHide.bootstrapToggle('off');
            this.chkboxHide.bootstrapToggle('disable');
        }
    }

    this.selectLocaleChangeAction = function (e) {
        var indx = this.selectLocale.prop('selectedIndex');
        this.divLocaleInfo.children().remove();
        this.divLocaleInfo.append(`<label style="font-family: open sans; font-weight: 300;width:100%;"><b>Native Name: &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</b>${this.culture[indx].NativeName}</label>`);
        this.divLocaleInfo.append(`<label style="font-family: open sans; font-weight: 300;width:100%;"><b>English Name: &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</b>${this.culture[indx].EnglishName}</label>`);
        this.divLocaleInfo.append(`<label style="font-family: open sans; font-weight: 300;width:100%;"><b>Currency Format: </b>${this.culture[indx].NumberFormat}</label>`);
        this.divLocaleInfo.append(`<label style="font-family: open sans; font-weight: 300;width:100%;"><b>Date Format: &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</b>${this.culture[indx].DateFormat}</label>`);
    }

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
        var st = "#divGender input:radio[value='"+this.userinfo["sex"]+"']";
        $(st).attr("checked", "checked");
        $("#lblFbId").attr("data-id", this.userinfo["fbid"]);
        $("#userFbLink").text((this.userinfo["fbname"] == "") ? this.userinfo["fullname"] : this.userinfo["fbname"]);

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
    }

    this.initFbConnect = function () {
        $.ajaxSetup({ cache: true });
        $.getScript('https://connect.facebook.net/en_US/sdk.js', function () {
            FB.init({
                appId: (this.Environment === 'Development' ? '141908109794829' : '2202041803145524'),//'141908109794829',//,'1525758114176201',//
                cookie: true,  // enable cookies to allow the server to access
                // the session
                xfbml: true,  // parse social plugins on this page
                version: (this.Environment === 'Development' ? 'v2.11' : 'v3.0') // use graph api version 2.8
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
                    FBpicture();
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
        };
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
    }

    this.findDependentRoles = function (dominant) {
        for (var i = 0; i < this.r2rList.length; i++) {
            if (this.r2rList[i].Dominant == dominant) {
                this.dependentList.push(this.r2rList[i].Dependent);
                this.findDependentRoles(this.r2rList[i].Dependent);
            }
        }
    }

    this.chkItemCustomFunc = function (_this, e) {
        _this.dependentList = [];

        $.each($(this.divSearchResults).find('input'), function (i, ob) {
            if (_this.dominantList.indexOf(parseInt($(ob).attr('data-id'))) !== -1) {
                $(ob).removeAttr("checked");
                $(ob).attr("disabled", "true");
            }
        });

        if ($(e.target).is(':checked')) {
            _this.findDependentRoles($(e.target).attr("data-id"));
            var st = "";
            var itemid = [];
            $.each($(this.divSelectedDisplay).children(), function (i, ob) {
                for (var i = 0; i < _this.dependentList.length; i++) {
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
                    $(e.target).removeAttr("checked");
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
            if ((_this.dependentList.indexOf(parseInt($(ob).attr('data-id'))) !== -1) || (_this.dominantList.indexOf(parseInt($(ob).attr('data-id'))) !== -1)) {
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
    }

    this.initTiles = function () {
        //INIT ROLES
        var metadata1 = ['Id', 'Name', 'Description'];
        var initroles = [];
        if (this.U_Roles !== null)
            for (var i = 0; i < this.customRoles.length; i++)
                if (this.U_Roles.indexOf(this.customRoles[i].Id) !== -1)
                    initroles.push(this.customRoles[i]);
        this.rolesTile = new TileSetupJs($("#menu1"), "Add Roles", initroles, this.customRoles, metadata1, null, this.chkItemCustomFunc, this);

        //INIT USER GROUPS
        var initgroups = [];
        if (this.U_Groups !== null)
            for (var i = 0; i < this.userGroup.length; i++)
                if (this.U_Groups.indexOf(this.userGroup[i].Id) !== -1)
                    initgroups.push(this.userGroup[i]);
        this.userGroupTile = new TileSetupJs($("#menu3"), "Add User Group", initgroups, this.userGroup, metadata1, null, null, this);

        if (this.whichMode === 3) {
            this.rolesTile.setReadOnly();
            this.userGroupTile.setReadOnly();
        }
    }

    this.validateEmail = function () {
        clearTimeout(this.timer1);
        this.isInfoValidEmail = false;
        var val = this.txtEmail.val();
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (regex.test(val)) {
            this.txtEmail.css("border-color", "rgb(204, 204, 204)");
            this.spanEmail.children().remove();
            this.spanEmail.append(`<i class="fa fa-spinner fa-pulse" aria-hidden="true" style="padding: 9px;"></i>`);
            this.spanEmail.attr("title", "Validating...");
            this.timer1 = setTimeout(function () { this.validateEmailAjaxCall() }.bind(this), 3000);
        }
        else {
            this.txtEmail.css("border-color", "rgb(204, 0, 0)");
            this.spanEmail.children().remove();
            this.spanEmail.append(`<i class="fa fa-times" aria-hidden="true" style="color:red; padding: 9px;"></i>`);
            this.spanEmail.attr("title", "Invalid Email ID");
        }
    }

    this.validateEmailAjaxCall = function () {
        $.ajax({
            type: "POST",
            url: "../Security/isValidEmail",
            data: { reqEmail: this.txtEmail.val() },
            success: function (result) {
                if (result) {
                    this.txtEmail.css("border-color", "rgb(204, 0, 0)");
                    this.spanEmail.children().remove();
                    this.spanEmail.append(`<i class="fa fa-exclamation-triangle" aria-hidden="true" style="color:red; padding: 9px;"></i>`);
                    this.spanEmail.attr("title", "Email ID Already Exists");
                }
                else {
                    this.spanEmail.children().remove();
                    this.spanEmail.append(`<i class="fa fa-check" aria-hidden="true" style="color:green; padding: 9px;"></i>`);
                    this.spanEmail.attr("title", "Valid Email ID");
                    this.isInfoValidEmail = true;
                }
            }.bind(this)
        });
    }

    this.validateInfo = function (target, regex) {
        //target.off('keyup').on('keyup', function (evt) { this.validateInfo(target, regex)}.bind(this));
        var val = target.val();
        if (regex.test(val)) {
            target.css("border-color", "rgb(204, 204, 204)");
            return true;
        }
        else {
            target.css("border-color", "rgb(204, 0, 0)");
            return false;
        }
    }

    this.initChangePwdModal = function () {
        this.pwdOld.val('');
        this.pwdNew.val('');
        this.pwdNewConfirm.val('');
        this.pwdOld.css("border-color", "rgb(204, 204, 204)");
        this.pwdNew.css("border-color", "rgb(204, 204, 204)");
        this.pwdNewConfirm.css("border-color", "rgb(204, 204, 204)");
        this.lblPwdChngMsg.text("");
        this.ChangePwdModal.modal('show');
    }

    this.updatePassword = function () {
        if (this.pwdOld.val().length < 8 || this.pwdNew.val().length < 8 || this.pwdNewConfirm.val().length < 8 || this.pwdNew.val() !== this.pwdNewConfirm.val())
            return;
        $(this.btnUpdatePwd.children()[0]).show();
        $.ajax({
            type: "POST",
            url: "../Security/ChangeUserPassword",
            data: { OldPwd: this.pwdOld.val(), NewPwd: this.pwdNew.val() },
            success: function (status) {
                if (status) {
                    alert("Password Updated Successfully");
                    this.pwdOld.val("");
                    this.pwdNew.val("");
                    this.pwdNewConfirm.val("");
                    this.ChangePwdModal.modal('hide');
                }
                else
                    alert("Something went wrong");
                $(this.btnUpdatePwd.children()[0]).hide();
            }.bind(this)
        });
    }

    this.clickbtnCreateUser = function () {
        if (this.txtName.val() === "" || this.txtEmail.val() === "")
            this.isInfoValidEmail = false;
        if (!this.isInfoValidEmail || !this.isInfoValidEmail2) {
            EbMessage("show", { Message: 'Validation Failed. Check all Fields', AutoHide: true, Backgorund: '#bf1e1e'});
            return;
        }
        if (this.pwdPassword.val().length < 8 && this.whichMode === 1 && this.itemId < 2) {
            EbMessage("show", { Message: 'Password Too Short', AutoHide: true, Backgorund: '#bf1e1e' });
            return;
        }    
        if (this.txtDateOfBirth === "") {
            EbMessage("show", { Message: 'Please Enter Date of Birth', AutoHide: true, Backgorund: '#bf1e1e' });
            return;
        }

        this.btnCreateUser.attr("disabled", "true");

        var oldstus = (this.itemId > 1) ? parseInt(this.userinfo["statusid"]) : -1;
        var newstus = $("#divStatus input:radio[name='status']:checked").val();
        if (oldstus === newstus)
            newstus = oldstus + 100;//Status not changed, so adding 100 to oldstus just to infirm that no change in stus

        var dict = new Object();
        dict["anonymoususerid"] = (this.itemId == 1) ? this.anonymousUserId : 0;
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
        dict["fbid"] = $("#lblFbId").attr("data-id");
        dict["fbname"] = $("#userFbLink").text();
        dict["roles"] = this.rolesTile.getItemIds();
        dict["usergroups"] = this.userGroupTile.getItemIds();
        dict["statusid"] = newstus;
        dict["hide"] = this.chkboxHide.prop("checked") ? "yes" : "no";
        dict["preference"] = JSON.stringify({ Locale: this.selectLocale.val(), TimeZone: this.selectTimeZone.val() });

        $.ajax({
            type: "POST",
            url: "../Security/SaveUser",
            data: { userid: this.itemId, usrinfo: JSON.stringify(dict) },
            success: function (result) {
                if (result > -1) {
                    alert("Saved Successfully");
                    window.top.close();
                }
                else
                    alert("Something went wrong");
                $("#btnCreateUser").removeAttr("disabled");
            }
        });
    }

    this.init();
}

//---------------------------------------------------------------USERGROUP-----------------------------------------------------------------------------
var UserGroupJs = function (infoDict, usersList) {
    this.menuBarObj = $("#layout_div").data("EbHeader");
    this.menuBarObj.insertButton(`<button id="btnSaveAll" class='btn' title='Save'><i class="fa fa-floppy-o" aria-hidden="true"></i></button>`);
    this.infoDict = infoDict;
    this.usersList = usersList;
    this.txtUserGroupName = $("#txtUserGroupName");
    this.txtUserGroupDescription = $("#txtUserGroupDescription");
    this.btnSaveAll = $("#btnSaveAll");

    this.usersTile = null;

    this.init = function () {

        this.btnSaveAll.on('click', this.clickbtnSaveAll.bind(this));

        this.txtUserGroupName.val(this.infoDict['name']);
        this.txtUserGroupDescription.val(this.infoDict['description']);

        //------------------INIT USERS TILE------------------
        var initUserList = null;
        var metadata2 = ['id', 'name', 'email', 'ProfilePicture'];
        if (parseInt(this.infoDict['id']) > 0) {
            //this.btnSaveAll.text("Update");
            this.menuBarObj.setName(this.infoDict['name']);
            initUserList = [];
            for (i = 0; i < this.usersList.length; i++) {
                initUserList.push({ id: this.usersList[i].Id, name: this.usersList[i].Name, email: this.usersList[i].Email });
            }
        }
        else {
            //this.btnSaveAll.text("Create");
            this.menuBarObj.setName("New User Group");
        }
        if (this.usersTile === null) {
            this.usersTile = new TileSetupJs($("#divusers"), "Add Users", initUserList, null, metadata2, "../Security/GetUserDetails", null, this);
        }
        //-----------------------------------------------
    }
    this.clickbtnSaveAll = function () {
        var dict = new Object();
        if (this.txtUserGroupName.val() === '' || this.txtUserGroupDescription.val()) {
            EbMessage("show", { Message: 'Please Enter UserGroup Name/Description', AutoHide: true, Backgorund: '#bf1e1e' });
            return;
        }            
        dict["name"] = this.txtUserGroupName.val();
        dict["description"] = this.txtUserGroupDescription.val();
        dict["users"] = this.usersTile.getItemIds();
        this.btnSaveAll.attr("disabled","true");
        $.ajax({
            type: "POST",
            url: "../Security/SaveUserGroup",
            data: { _id: this.infoDict['id'], _userGroupInfo: JSON.stringify(dict) },
            success: this.saveUserGroupSuccess.bind(this)
        });
    }
    this.saveUserGroupSuccess = function (result) {
        if (result > 0) {
            alert("Saved Successfully");
            window.top.close();
        }            
        else
            EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Backgorund: '#bf1e1e'});
        this.btnSaveAll.removeAttr("disabled");
    }

    this.init();
}