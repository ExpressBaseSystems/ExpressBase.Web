var UserJs = function (usr, sysroles, usergroup, uroles, ugroups) {
    this.user = usr;
    this.systemRoles = sysroles;
    this.userGroup = usergroup;
    this.U_Roles = uroles;
    this.U_Groups = ugroups;
    this.itemId = $("#userid").val();
    this.selectedRolesId = [];
    this.divFormHeading = $("#divFormHeading");
    this.txtName = $("#txtName");
    this.txtNickName = $("#txtNickName");
    this.txtEmail = $("#txtEmail");
    this.divPassword = $("#divPassword");

    this.txtSearchRole = $("#txtSearchRole");
    this.btnModalOk = $("#btnModalOk");
    this.divRoleSearchResults = $("#divRoleSearchResults");
    this.divSelectedRoleDisplay = $("#divSelectedRoleDisplay");
    this.txtDemoRoleSearch = $("#txtDemoRoleSearch");
    this.btnClearDemoRoleSearch = $("#btnClearDemoRoleSearch");

    this.closeDiv = $(".closediv1");
    this.t = 0;

    this.btnUserGroupModalOk = $("#btnUserGroupModalOk");
    this.txtSearchUserGroup = $("#txtSearchUserGroup");
    this.txtDemoUserGroupSearch = $("#txtDemoUserGroupSearch");
    this.btnClearDemoUserGroupSearch = $("#btnClearDemoUserGroupSearch");

    this.init = function () {
        this.txtSearchRole.on('keyup', this.KeyUptxtSearchRole.bind(this));
        this.btnModalOk.on('click', this.clickbtnModalOkAction.bind(this));
        $('#addRolesModal').on('shown.bs.modal', this.initModal1.bind(this));
        this.txtDemoRoleSearch.on('keyup', this.KeyUptxtDemoRoleSearch.bind(this));
        this.btnClearDemoRoleSearch.on('click', this.OnClickbtnClearDemoRoleSearch.bind(this));

        this.txtSearchUserGroup.on('keyup', this.KeyUptxtSearchUserGroup.bind(this));
        this.btnUserGroupModalOk.on('click', this.clickbtnUserGroupModalOkAction.bind(this));
        $('#addUserGroupModal').on('shown.bs.modal', this.initModal2.bind(this));
        this.txtDemoUserGroupSearch.on('keyup', this.KeyUptxtDemoUserGroupSearch.bind(this));
        this.btnClearDemoUserGroupSearch.on('click', this.OnClickbtnClearDemoUserGroupSearch.bind(this));

        $('#btnCreateUser').on('click', this.clickbtnCreateUser.bind(this));

        this.initForm();

    }

    this.initForm = function () {
        if (this.itemId > 0) {
            $(divFormHeading).text("Edit User");
            this.txtName.attr("disabled", "true");
            this.txtNickName.attr("disabled", "true");
            this.txtEmail.attr("disabled", "true");
            this.divPassword.css("display","none")
        }
        else {
            $(divFormHeading).text("Create User");
        }
    }

    this.initModal1 = function () {
        this.txtSearchRole.focus();
        this.KeyUptxtSearchRole();
    }

    this.initModal2 = function () {
        this.txtSearchUserGroup.focus();
        this.KeyUptxtSearchUserGroup();
    }

    this.KeyUptxtSearchRole = function () {
        obj = this.user;
        $("#divRoleSearchResults").children().remove();
        var txt = $("#txtSearchRole").val().trim();
        var st = null;
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].Name.substr(0, txt.length).toLowerCase() === txt.toLowerCase()) {
                if ($("#divSelectedRoleDisplay").find(`[data-id='${obj[i].Id}']`).length > 0)
                    st = "checked";
                else
                    st = null;
                $("#divRoleSearchResults").append(`<div class='row searchRsulsItemsDiv' style='margin-left:5px; margin-right:5px' data-id=${obj[i].Id}>
                                                        <div class='col-md-1' style="padding:10px">
                                                            <input type ='checkbox' ${st} data-name = '${obj[i].Name}' data-id = '${obj[i].Id}' data-d = '${obj[i].Description}' aria-label='...'>
                                                        </div>
                                                        <div class='col-md-10'>
                                                            <h5 name = 'head5' style='color:black;'>${obj[i].Name}</h5>
                                                            ${obj[i].Description}
                                                        </div>
                                                    </div>`);
            }
        }
    }

    this.clickbtnModalOkAction = function () {
        $('#divRoleSearchResults input:checked').each(function () {
            if (($('#divSelectedRoleDisplay').find(`[data-id='${$(this).attr('data-id')}']`).length) === 0) {
                $('#divSelectedRoleDisplay').append(`<div class="col-md-4 container-md-4" data-id=${$(this).attr('data-id')} data-name=${$(this).attr('data-name')}>
                                                    <div class="mydiv1" style="overflow:visible;">
                                                        <div class="icondiv1">
                                                             <b>${$(this).attr('data-name').substring(0, 1).toUpperCase()}</b>
                                                        </div>
                                                        <div class="textdiv1">
                                                            <b>${$(this).attr('data-name')}</b>
                                                            <div style="font-size: smaller;">&nbsp${$(this).attr('data-d')}</div>
                                                        </div>
                                                        <div class="closediv1">
                                                            <div class="dropdown">
                                                                <i class="fa fa-ellipsis-v dropdown-toggle" aria-hidden="true" data-toggle="dropdown" style="padding:0px 5px"></i>
                                                                <ul class="dropdown-menu" style="left:-140px;">
                                                                    <li><a href="#" onclick="OnClickRemove(this);">Remove</a></li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    </div>`);
            }
        });
        $('#addRolesModal').modal('toggle');
        $(".closediv1").on('click', this.clickOnCloseDiv.bind(this));
        this.SortDiv();
    }

    this.SortDiv = function () {
        var mylist = $('#divSelectedRoleDisplay');
        var listitems = mylist.children('div').get();
        listitems.sort(function (a, b) {
            return $(a).attr("data-name").toUpperCase().localeCompare($(b).attr("data-name").toUpperCase());
        });
        $.each(listitems, function (index, item) {
            mylist.append(item);
        });
    }


    this.KeyUptxtSearchUserGroup = function () {
        obj = this.userGroup;
        $("#divUserGroupSearchResults").children().remove();
        var txt = $("#txtSearchUserGroup").val().trim();
        var st = null;
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].Name.substr(0, txt.length).toLowerCase() === txt.toLowerCase()) {
                if ($("#divSelectedUserGroupDisplay").find(`[data-id='${obj[i].Id}']`).length > 0)
                    st = "checked";
                else
                    st = null;
                $("#divUserGroupSearchResults").append(`<div class='row searchRsulsItemsDiv' style='margin-left:5px; margin-right:5px' data-id=${obj[i].Id}>
                                                        <div class='col-md-1' style="padding:10px">
                                                            <input type ='checkbox' ${st} data-name = '${obj[i].Name}' data-id = '${obj[i].Id}' data-d = '${obj[i].Description}' aria-label='...'>
                                                        </div>
                                                        <div class='col-md-10'>
                                                            <h5 name = 'head5' style='color:black;'>${obj[i].Name}</h5>
                                                            ${obj[i].Description}
                                                        </div>
                                                    </div>`);
            }
        }
    }

    this.clickbtnUserGroupModalOkAction = function () {
        $('#divUserGroupSearchResults input:checked').each(function () {
            if (($('#divSelectedUserGroupDisplay').find(`[data-id='${$(this).attr('data-id')}']`).length) === 0) {
                $('#divSelectedUserGroupDisplay').append(`<div class="col-md-4 container-md-4" data-id=${$(this).attr('data-id')} data-name=${$(this).attr('data-name')}>
                                                    <div class="mydiv1" style="">
                                                        <div class="icondiv1">
                                                             <b>${$(this).attr('data-name').substring(0, 1).toUpperCase()}</b>
                                                        </div>
                                                        <div class="textdiv1">
                                                            <b>${$(this).attr('data-name')}</b>
                                                            <div style="font-size: smaller;">&nbsp${$(this).attr('data-d')}</div>
                                                        </div>
                                                        <div class="closediv1">
                                                            <div class="dropdown">
                                                                <i class="fa fa-ellipsis-v dropdown-toggle" aria-hidden="true" data-toggle="dropdown" style="padding:0px 5px"></i>
                                                                <ul class="dropdown-menu" style="left:-140px;">
                                                                    <li><a href="#" onclick="OnClickRemove(this);">Remove</a></li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>`);
            }
        });
        $('#addUserGroupModal').modal('toggle');
        $(".closediv1").on('click', this.clickOnCloseDiv.bind(this));
        
    }


    this.clickbtnCreateUser = function () {
        var selectedroles = "";
        $($('#divSelectedRoleDisplay').children()).each(function () {
            selectedroles += $(this).attr('data-id') + ",";
        });
        var selectedusergroups = "";
        $($('#divSelectedUserGroupDisplay').children()).each(function () {
            selectedusergroups += $(this).attr('data-id') + ",";
        });


        //$.post("../TenantUser/SaveUser",
        //    {
        //        "userid": $('#userid').val(),
        //        "roles": selectedroles.substring(0, selectedroles.length - 1),
        //        "usergroups": selectedusergroups.substring(0, selectedusergroups.length - 1),
        //        "firstname": $('#txtName').val(),
        //        "email": $('#txtEmail').val(),
        //        "Pwd": $('#pwdPaasword').val()
        //    }, function (result) {
        //        if (result) {
        //            //document.getElementById("usergrouplist").innerHTML = result;
        //            alert('Completed');
        //        }
        //    });
    }

    this.KeyUptxtDemoRoleSearch = function () {
        var txt = $("#txtDemoRoleSearch").val().trim();
        var flag = 1;
        $($("#divSelectedRoleDisplay").children("div.col-md-4")).each(function () {
            $(this).children().css('box-shadow', '1px 1px 2px 1px #fff');
            if ($(this).attr('data-name').toLowerCase().substring(0, txt.length) === txt.toLowerCase() && txt!=="") {
                $(this).children().css('box-shadow', '1px 1px 2px 1px red');
                //scroll to search result
                if (flag) {
                    var elem = $(this);
                    if (elem) {
                        var main = $("#divSelectedRoleDisplay"),
                        t = main.offset().top;
                        main.scrollTop(elem.offset().top);
                    }
                    flag = 0;
                }
            }
        });
    }

    this.OnClickbtnClearDemoRoleSearch = function () {
        $("#txtDemoRoleSearch").val("");
        this.KeyUptxtDemoRoleSearch();
    }

    this.KeyUptxtDemoUserGroupSearch = function () {
        var txt = $("#txtDemoUserGroupSearch").val().trim();
        var flag = 1;
        $($("#divSelectedUserGroupDisplay").children("div.col-md-4")).each(function () {
            $(this).children().css('box-shadow', '1px 1px 2px 1px #fff');
            if ($(this).attr('data-name').toLowerCase().substring(0, txt.length) === txt.toLowerCase() && txt !== "") {
                $(this).children().css('box-shadow', '1px 1px 2px 1px red');
                //scroll to search result
                if (flag) {
                    var elem = $(this);
                    if (elem) {
                        var main = $("#divSelectedUserGroupDisplay"),
                            t = main.offset().top;
                        main.scrollTop(elem.offset().top);
                    }
                    flag = 0;
                }
            }
        });
    }

    this.OnClickbtnClearDemoUserGroupSearch = function () {
        $("#txtDemoUserGroupSearch").val("");
        this.KeyUptxtDemoUserGroupSearch();
    }

    this.clickOnCloseDiv = function (e) {
        //$(e.target).parent().parent().parent().remove();
    }
    this.init();
}