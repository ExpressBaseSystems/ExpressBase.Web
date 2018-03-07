var UserJs = function (userinfo, cusroles, sysroles, usergroup, uroles, ugroups, r2rList, userstatusList) {
    this.userinfo = userinfo;
    this.customRoles = cusroles;
    this.systemRoles = sysroles;
    this.userGroup = usergroup;
    this.U_Roles = uroles;
    this.U_Groups = ugroups;
    this.r2rList = r2rList;
    this.statusList = userstatusList;
    this.itemId = parseInt($("#userid").val());
    this.anonymousUserId = null;
    this.dependentList = [];
    this.dominantList = [];

    this.divFormHeading = $("#divFormHeading");
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
    this.chkboxActive = $("#chkboxActive");
    this.chkboxTerminate = $("#chkboxTerminate");
    this.chkboxHide = $("#chkboxHide");
    
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

   
    this.init = function () {

        this.txtEmail.on('keyup', this.validateEmail.bind(this));
        this.txtEmail.on('change', this.validateEmail.bind(this));
        this.txtAlternateEmail.on('change', function (e) { this.validateInfo(this.txtAlternateEmail, /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/)}.bind(this))
        
        this.btnCreateUser.on('click', this.clickbtnCreateUser.bind(this));
        
        //$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        //    //$($(e.target).attr("href")).focus();
        //    $("#btnCreateUser").focus();
        //});

        this.initForm();
        this.initTiles();
    }

    this.initForm = function () {
        if (this.itemId > 1) {
            $(divFormHeading).text("Edit User");
            this.btnCreateUser.text("Update");
            //this.txtName.attr("disabled", "true");
            //this.txtNickName.attr("disabled", "true");
            this.txtEmail.attr("disabled", "true");
            this.divPassword.css("display", "none");
            this.isInfoValidEmail = true;
            this.initUserInfo();
            this.initFbConnect();
        }
        else if (this.itemId === 1){
            $(divFormHeading).text("Create User");
            this.btnFbConnect.css("display", "none");
            this.anonymousUserId = this.userinfo["AnonymousUserID"];
            this.txtName.val(this.userinfo["FullName"]);
            this.txtEmail.val(this.userinfo["EmailID"]);
            this.txtPhPrimary.val(this.userinfo["PhoneNumber"]);
            if (this.userinfo["SocialID"].trim() === "") {
                $("#lblFbId").attr("data-id", this.userinfo["SocialID"]);
                $("#userFbLink").text((this.userinfo["FullName"].trim().length > 0) ? this.userinfo["FullName"].trim() : "facebook");
            }
            this.validateEmail();
            this.initFbConnect();
        }
        else {
            $(divFormHeading).text("Create User");
            this.btnFbConnect.css("display", "none");
            $("#btnFbInvite").show();
        }
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
        var stus = this.statusList[this.userinfo["statusid"]];
        if (stus === "Active")
            this.chkboxActive.prop("checked", "true");
        else if (stus === "Deactivated")
            this.chkboxActive.removeAttr("checked");
        else if (stus === "Terminated") {
            this.chkboxTerminate.prop("checked", "true");
            this.chkboxActive.removeAttr("checked");
        }
        if (this.userinfo["hide"] === "yes")
            this.chkboxHide.prop("checked", "true");
    }

    this.initFbConnect = function () {
        $.ajaxSetup({ cache: true });
        $.getScript('https://connect.facebook.net/en_US/sdk.js', function () {
            FB.init({
                appId: '149537802493867',
                version: 'v2.11'
            });
            FB.getLoginStatus(updateStatusCallback);
        });
        function updateStatusCallback(response) {
            if (response.authResponse !== null) {
                if ($("#lblFbId").attr("data-id") === "") {
                    $("#btnFbConnect").show();
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
                    $("#btnFbConnect").show();
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
    }


    this.validateEmail = function () {
        clearTimeout(this.timer1);
        this.isInfoValidEmail = false;
        var val = this.txtEmail.val();
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (regex.test(val)) {
            this.txtEmail.css("border-color", "rgb(204, 204, 204)");
            this.spanEmail.children().remove();
            this.spanEmail.append(`<i class="fa fa-spinner fa-pulse" aria-hidden="true"></i>`);
            this.spanEmail.attr("title", "Validating...");
            this.timer1 = setTimeout(function () { this.validateEmailAjaxCall() }.bind(this), 3000);
        }
        else {
            this.txtEmail.css("border-color", "rgb(204, 0, 0)");
            this.spanEmail.children().remove();
            this.spanEmail.append(`<i class="fa fa-times" aria-hidden="true" style="color:red;"></i>`);
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
                    this.spanEmail.append(`<i class="fa fa-exclamation-triangle" aria-hidden="true" style="color:red;"></i>`);
                    this.spanEmail.attr("title", "Email ID Already Exists");
                }
                else {
                    this.spanEmail.children().remove();
                    this.spanEmail.append(`<i class="fa fa-check" aria-hidden="true" style="color:green;"></i>`);
                    this.spanEmail.attr("title", "Valid Email ID");
                    this.isInfoValidEmail = true;
                }
            }.bind(this)
        });
    }

    this.validateInfo = function (target, regex) {
        target.off('keyup').on('keyup', function (evt) { this.validateInfo(target, regex)}.bind(this));
        var val = target.val();
        if (regex.test(val)) {
            target.css("border-color", "rgb(204, 204, 204)");
            this.isInfoValidEmail2 = true;
        }
        else {
            target.css("border-color", "rgb(204, 0, 0)");
            this.isInfoValidEmail2 = false;
        }
    }

    this.clickbtnCreateUser = function () {
        if (this.txtName.val() === "" || this.txtEmail.val() === "")
            this.isInfoValidEmail = false;
        if (!this.isInfoValidEmail || !this.isInfoValidEmail2) {
            alert("Validation Failed. Check all Fields");
            return;
        }
            

        this.btnCreateUser.attr("disabled", "true");

        var oldstus = (this.itemId > 1) ? parseInt(this.userinfo["statusid"]) : -1;
        var newstus = 0;
        if (!this.chkboxActive.prop("checked"))
            newstus = 1;
        if (this.chkboxTerminate.prop("checked"))
            newstus = 2;
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

        $.post("../Security/SaveUser",
            {
                "userid": this.itemId ,
                "usrinfo": JSON.stringify(dict)
            }, function (result) {
                if (result > -1) {
                    alert("Saved Successfully");
                    window.top.close();
                }
                $("#btnCreateUser").removeAttr("disabled");
            });
    }

    //this.initModal1 = function () {
    //    this.txtSearchRole.focus();
    //    this.KeyUptxtSearchRole();
    //}
    //this.initModal2 = function () {
    //    this.txtSearchUserGroup.focus();
    //    this.KeyUptxtSearchUserGroup();
    //}

    //this.KeyUptxtSearchRole = function () {
    //    this.drawSearchResults(1);
    //}
    //this.clickbtnModalOkAction = function () {
    //    this.drawSelectedDisplay(1);
    //    $('#addRolesModal').modal('toggle');
    //    this.SortDiv(1);
    //}

    //this.KeyUptxtSearchUserGroup = function () {
    //    this.drawSearchResults(2);
    //}
    //this.clickbtnUserGroupModalOkAction = function () {
    //    this.drawSelectedDisplay(2);
    //    $('#addUserGroupModal').modal('toggle');
    //    this.SortDiv(2);
    //}

    //this.drawSearchResults = function (flag) {
    //    var st = null;
    //    var txt = null;
    //    var divSelectedDisplay;
    //    var divSearchResults;
    //    if (flag === 1) {
    //        obj = this.customRoles;
    //        $("#divRoleSearchResults").children().remove();
    //        txt = $("#txtSearchRole").val().trim();
    //        divSelectedDisplay = $("#divSelectedRoleDisplay");
    //        divSearchResults = $("#divRoleSearchResults");
    //    }
    //    else if (flag === 2) {
    //        obj = this.userGroup;
    //        $("#divUserGroupSearchResults").children().remove();
    //        txt = $("#txtSearchUserGroup").val().trim();
    //        divSelectedDisplay = $("#divSelectedUserGroupDisplay");
    //        divSearchResults = $("#divUserGroupSearchResults");
    //    }
    //    else
    //        return;

    //    for (var i = 0; i < obj.length; i++) {
    //        if (obj[i].Name.substr(0, txt.length).toLowerCase() === txt.toLowerCase()) {
    //            if ($(divSelectedDisplay).find(`[data-id='${obj[i].Id}']`).length > 0)
    //                st = "checked disabled";
    //            else
    //                st = null;
    //            this.appendToSearchResult(divSearchResults, st, obj[i]);
    //        }
    //    }
    //}

    //this.appendToSearchResult = function (divSearchResults, st, obj) {
    //    $(divSearchResults).append(`<div class='row searchRsulsItemsDiv' style='margin-left:5px; margin-right:5px' data-id=${obj.Id}>
    //                                    <div class='col-md-1' style="padding:10px">
    //                                        <input type ='checkbox' ${st} data-name = '${obj.Name}' data-id = '${obj.Id}' data-d = '${obj.Description}' aria-label='...'>
    //                                    </div>
    //                                    <div class='col-md-10'>
    //                                        <h5 name = 'head5' style='color:black;'>${obj.Name}</h5>
    //                                        ${obj.Description}
    //                                    </div>
    //                                </div>`);
    //}

    //this.drawSelectedDisplay = function (flag) {
    //    var addModal;
    //    var divSearchResultsChecked;
    //    var divSelectedDisplay;
    //    if (flag === 1) {
    //        divSearchResultsChecked = $('#divRoleSearchResults input:checked');
    //        divSelectedDisplay = $('#divSelectedRoleDisplay');
    //        addModal = $('#addRolesModal');
    //    }
    //    else if (flag === 2) {
    //        divSearchResultsChecked = $('#divUserGroupSearchResults input:checked');
    //        divSelectedDisplay = $('#divSelectedUserGroupDisplay');
    //        addModal = $('#addUserGroupModal');
    //    }
    //    else
    //        return;
    //    $(divSearchResultsChecked).each(function () {
    //        if (($(divSelectedDisplay).find(`[data-id='${$(this).attr('data-id')}']`).length) === 0) {
    //            $(divSelectedDisplay).append(`<div class="col-md-4 container-md-4" data-id=${$(this).attr('data-id')} data-name=${$(this).attr('data-name')}>
    //                                                <div class="mydiv1" style="overflow:visible;">
    //                                                    <div class="icondiv1">
    //                                                         <b>${$(this).attr('data-name').substring(0, 1).toUpperCase()}</b>
    //                                                    </div>
    //                                                    <div class="textdiv1">
    //                                                        <b>${$(this).attr('data-name')}</b>
    //                                                        <div style="font-size: smaller;">&nbsp${$(this).attr('data-d')}</div>
    //                                                    </div>
    //                                                    <div class="closediv1">
    //                                                        <div class="dropdown">
    //                                                            <i class="fa fa-ellipsis-v dropdown-toggle" aria-hidden="true" data-toggle="dropdown" style="padding:0px 5px"></i>
    //                                                            <ul class="dropdown-menu" style="left:-140px;">
    //                                                                <li><a href="#" onclick="OnClickRemove(this);">Remove</a></li>
    //                                                            </ul>
    //                                                        </div>
    //                                                    </div>
    //                                                </div>
    //                                                </div>`);
    //        }
    //    });

    //}

    //this.SortDiv = function (flag) {
    //    var mylist;
    //    if (flag === 1) 
    //        mylist = $('#divSelectedRoleDisplay');
    //    else if (flag === 2)
    //        mylist = $('#divSelectedUserGroupDisplay');
    //    else
    //        return;
    //    var listitems = mylist.children('div').get();
    //    listitems.sort(function (a, b) {
    //        return $(a).attr("data-name").toUpperCase().localeCompare($(b).attr("data-name").toUpperCase());
    //    });
    //    $.each(listitems, function (index, item) {
    //        mylist.append(item);
    //    });
    //}

    //this.KeyUptxtDemoRoleSearch = function () {
    //    this.keyUpTxtDemoSearch(1);
    //}
    //this.KeyUptxtDemoUserGroupSearch = function () {
    //    this.keyUpTxtDemoSearch(2);
    //}

    //this.keyUpTxtDemoSearch = function (flag) {
    //    var f = 1;
    //    var txt;
    //    var divSelectedDisplay;
    //    if (flag === 1) {
    //        txt = $("#txtDemoRoleSearch").val().trim();
    //        divSelectedDisplay = $("#divSelectedRoleDisplay");
    //    }
    //    else if (flag === 2) {
    //        txt = $("#txtDemoUserGroupSearch").val().trim();
    //        divSelectedDisplay = $("#divSelectedUserGroupDisplay");
    //    }
    //    else
    //        return;
    //    $($(divSelectedDisplay).children("div.col-md-4")).each(function () {
    //        $(this).children().css('box-shadow', '1px 1px 2px 1px #fff');
    //        if ($(this).attr('data-name').toLowerCase().substring(0, txt.length) === txt.toLowerCase() && txt !== "") {
    //            $(this).children().css('box-shadow', '1px 1px 2px 1px red');
    //            //scroll to search result
    //            if (f) {
    //                var elem = $(this);
    //                if (elem) {
    //                    var main = $(divSelectedDisplay);
    //                    var t = main.offset().top;
    //                    main.scrollTop(elem.offset().top - t);
    //                }
    //                f = 0;
    //            }
    //        }
    //    });
    //}

    //this.OnClickbtnClearDemoRoleSearch = function () {
    //    $("#txtDemoRoleSearch").val("");
    //    this.KeyUptxtDemoRoleSearch();
    //}
    //this.OnClickbtnClearDemoUserGroupSearch = function () {
    //    $("#txtDemoUserGroupSearch").val("");
    //    this.KeyUptxtDemoUserGroupSearch();
    //}



    //this.loadUserRoles = function () {
    //    obj = this.customRoles;
    //    obj2 = this.userGroup;
    //    uroles = this.U_Roles;
    //    ugroups = this.U_Groups;
    //    $("#divRoleSearchResults").children().remove();
    //    $("#divUserGroupSearchResults").children().remove();
    //    var i, st;
    //    for (i = 0; i < obj.length; i++) {
    //        st = null;
    //        if ($.grep(uroles, function (e) { return e === obj[i].Id; }).length > 0)
    //            st = "checked disabled";
    //        this.appendToSearchResult($("#divRoleSearchResults"), st, obj[i]);
    //    }
    //    this.drawSelectedDisplay(1);
    //    for (i = 0; i < obj2.length; i++) {
    //        st = null;
    //        if ($.grep(ugroups, function (e) { return e === obj2[i].Id; }).length > 0)
    //            st = "checked disabled";
    //        this.appendToSearchResult($("#divUserGroupSearchResults"), st, obj2[i]);
    //    }
    //    this.drawSelectedDisplay(2);
    //}

     //this.txtSearchRole = $("#txtSearchRole");
    //this.btnModalOk = $("#btnModalOk");
    //this.divRoleSearchResults = $("#divRoleSearchResults");
    //this.divSelectedRoleDisplay = $("#divSelectedRoleDisplay");
    //this.txtDemoRoleSearch = $("#txtDemoRoleSearch");
    //this.btnClearDemoRoleSearch = $("#btnClearDemoRoleSearch");

    //this.txtSearchUserGroup = $("#txtSearchUserGroup");
    //this.btnUserGroupModalOk = $("#btnUserGroupModalOk");
    //this.divUserGroupSearchResults = $("#divUserGroupSearchResults");
    //this.divSelectedUserGroupDisplay = $("#divSelectedUserGroupDisplay");
    //this.txtDemoUserGroupSearch = $("#txtDemoUserGroupSearch");
    //this.btnClearDemoUserGroupSearch = $("#btnClearDemoUserGroupSearch");

    //this.txtSearchRole.on('keyup', this.KeyUptxtSearchRole.bind(this));
        //this.btnModalOk.on('click', this.clickbtnModalOkAction.bind(this));
        //$('#addRolesModal').on('shown.bs.modal', this.initModal1.bind(this));
        //this.txtDemoRoleSearch.on('keyup', this.KeyUptxtDemoRoleSearch.bind(this));
        //this.btnClearDemoRoleSearch.on('click', this.OnClickbtnClearDemoRoleSearch.bind(this));

        //this.txtSearchUserGroup.on('keyup', this.KeyUptxtSearchUserGroup.bind(this));
        //this.btnUserGroupModalOk.on('click', this.clickbtnUserGroupModalOkAction.bind(this));
        //$('#addUserGroupModal').on('shown.bs.modal', this.initModal2.bind(this));
        //this.txtDemoUserGroupSearch.on('keyup', this.KeyUptxtDemoUserGroupSearch.bind(this));
        //this.btnClearDemoUserGroupSearch.on('click', this.OnClickbtnClearDemoUserGroupSearch.bind(this));

    this.init();
}

var UserGroupJs = function (infoDict, usersList) {
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
            initUserList = [];
            for (i = 0; i < this.usersList.length; i++) {
                initUserList.push({ id: this.usersList[i].Id, name: this.usersList[i].Name, email: this.usersList[i].Email });
            }
        }
        if (this.usersTile === null) {
            this.usersTile = new TileSetupJs($("#divusers"), "Add Users", initUserList, null, metadata2, "../Security/GetUserDetails", null, this);
        }
        //-----------------------------------------------
    }
    this.clickbtnSaveAll = function () {
        var dict = new Object();
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
        if (result > 0)
            alert("Submitted Successfully");
        else
            alert("Error");
        this.btnSaveAll.removeAttr("disabled");
    }

    this.init();
}