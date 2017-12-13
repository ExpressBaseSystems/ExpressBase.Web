var UserJs = function (usr, sysroles, usergroup, uroles, ugroups) {
    this.user = usr;
    this.systemRoles = sysroles;
    this.userGroup = usergroup;
    this.U_Roles = uroles;
    this.U_Groups = ugroups;
    this.itemId = $("#userid").val();
    
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

    this.txtSearchUserGroup = $("#txtSearchUserGroup");
    this.btnUserGroupModalOk = $("#btnUserGroupModalOk");
    this.divUserGroupSearchResults = $("#divUserGroupSearchResults");
    this.divSelectedUserGroupDisplay = $("#divSelectedUserGroupDisplay");
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
            $(btnCreateUser).text("Update");
            this.txtName.attr("disabled", "true");
            this.txtNickName.attr("disabled", "true");
            this.txtEmail.attr("disabled", "true");
            this.divPassword.css("display", "none");
            this.loadUserRoles();
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
        this.drawSearchResults(1);
    }
    this.clickbtnModalOkAction = function () {
        this.drawSelectedDisplay(1);
        $('#addRolesModal').modal('toggle');
        this.SortDiv(1);
    }

    this.KeyUptxtSearchUserGroup = function () {
        this.drawSearchResults(2);
    }
    this.clickbtnUserGroupModalOkAction = function () {
        this.drawSelectedDisplay(2);
        $('#addUserGroupModal').modal('toggle');
        this.SortDiv(2);
    }

    this.drawSearchResults = function (flag) {
        var st = null;
        var txt = null;
        var divSelectedDisplay;
        var divSearchResults;
        if (flag === 1) {
            obj = this.user;
            $("#divRoleSearchResults").children().remove();
            txt = $("#txtSearchRole").val().trim();
            divSelectedDisplay = $("#divSelectedRoleDisplay");
            divSearchResults = $("#divRoleSearchResults");
        }
        else if (flag === 2) {
            obj = this.userGroup;
            $("#divUserGroupSearchResults").children().remove();
            txt = $("#txtSearchUserGroup").val().trim();
            divSelectedDisplay = $("#divSelectedUserGroupDisplay");
            divSearchResults = $("#divUserGroupSearchResults");
        }
        else
            return;

        for (var i = 0; i < obj.length; i++) {
            if (obj[i].Name.substr(0, txt.length).toLowerCase() === txt.toLowerCase()) {
                if ($(divSelectedDisplay).find(`[data-id='${obj[i].Id}']`).length > 0)
                    st = "checked";
                else
                    st = null;
                this.appendToSearchResult(divSearchResults, st, obj[i]);
            }
        }
    }

    this.appendToSearchResult = function (divSearchResults, st, obj) {
        $(divSearchResults).append(`<div class='row searchRsulsItemsDiv' style='margin-left:5px; margin-right:5px' data-id=${obj.Id}>
                                        <div class='col-md-1' style="padding:10px">
                                            <input type ='checkbox' ${st} data-name = '${obj.Name}' data-id = '${obj.Id}' data-d = '${obj.Description}' aria-label='...'>
                                        </div>
                                        <div class='col-md-10'>
                                            <h5 name = 'head5' style='color:black;'>${obj.Name}</h5>
                                            ${obj.Description}
                                        </div>
                                    </div>`);
    }
       
    this.drawSelectedDisplay = function (flag) {
        var addModal;
        var divSearchResultsChecked;
        var divSelectedDisplay;
        if (flag === 1) {
            divSearchResultsChecked = $('#divRoleSearchResults input:checked');
            divSelectedDisplay = $('#divSelectedRoleDisplay');
            addModal = $('#addRolesModal');
        }
        else if (flag === 2) {
            divSearchResultsChecked = $('#divUserGroupSearchResults input:checked');
            divSelectedDisplay = $('#divSelectedUserGroupDisplay');
            addModal = $('#addUserGroupModal');
        }
        else
            return;
        $(divSearchResultsChecked).each(function () {
            if (($(divSelectedDisplay).find(`[data-id='${$(this).attr('data-id')}']`).length) === 0) {
                $(divSelectedDisplay).append(`<div class="col-md-4 container-md-4" data-id=${$(this).attr('data-id')} data-name=${$(this).attr('data-name')}>
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
        
    }

    this.SortDiv = function (flag) {
        var mylist;
        if (flag === 1) 
            mylist = $('#divSelectedRoleDisplay');
        else if (flag === 2)
            mylist = $('#divSelectedUserGroupDisplay');
        else
            return;
        var listitems = mylist.children('div').get();
        listitems.sort(function (a, b) {
            return $(a).attr("data-name").toUpperCase().localeCompare($(b).attr("data-name").toUpperCase());
        });
        $.each(listitems, function (index, item) {
            mylist.append(item);
        });
    }
        
    this.KeyUptxtDemoRoleSearch = function () {
        this.keyUpTxtDemoSearch(1);
    }
    this.KeyUptxtDemoUserGroupSearch = function () {
        this.keyUpTxtDemoSearch(2);
    }

    this.keyUpTxtDemoSearch = function (flag) {
        var f = 1;
        var txt;
        var divSelectedDisplay;
        if (flag === 1) {
            txt = $("#txtDemoRoleSearch").val().trim();
            divSelectedDisplay = $("#divSelectedRoleDisplay");
        }
        else if (flag === 2) {
            txt = $("#txtDemoUserGroupSearch").val().trim();
            divSelectedDisplay = $("#divSelectedUserGroupDisplay");
        }
        else
            return;
        $($(divSelectedDisplay).children("div.col-md-4")).each(function () {
            $(this).children().css('box-shadow', '1px 1px 2px 1px #fff');
            if ($(this).attr('data-name').toLowerCase().substring(0, txt.length) === txt.toLowerCase() && txt !== "") {
                $(this).children().css('box-shadow', '1px 1px 2px 1px red');
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
    }

    this.OnClickbtnClearDemoRoleSearch = function () {
        $("#txtDemoRoleSearch").val("");
        this.KeyUptxtDemoRoleSearch();
    }
    this.OnClickbtnClearDemoUserGroupSearch = function () {
        $("#txtDemoUserGroupSearch").val("");
        this.KeyUptxtDemoUserGroupSearch();
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
        $("#btnCreateUser").attr("disabled","true");
        $.post("../TenantUser/SaveUser",
            {
                "userid": $('#userid').val(),
                "roles": selectedroles.substring(0, selectedroles.length - 1),
                "usergroups": selectedusergroups.substring(0, selectedusergroups.length - 1),
                "firstname": $('#txtName').val(),
                "email": $('#txtEmail').val(),
                "Pwd": $('#pwdPaasword').val()
            }, function (result) {
               
                    //document.getElementById("usergrouplist").innerHTML = result;
                    alert('Completed');
                    $("#btnCreateUser").removeAttr("disabled");
            });
    }

    this.loadUserRoles = function () {
        obj = this.user;
        obj2 = this.userGroup;
        uroles = this.U_Roles;
        ugroups = this.U_Groups;
        $("#divRoleSearchResults").children().remove();
        $("#divUserGroupSearchResults").children().remove();
        var i, st;
        for (i = 0; i < obj.length; i++) {
            st = null;
            if ($.grep(uroles, function (e) { return e === obj[i].Id; }).length > 0)
                st = "checked";
            this.appendToSearchResult($("#divRoleSearchResults"), st, obj[i]);
        }
        this.drawSelectedDisplay(1);
        for (i = 0; i < obj2.length; i++) {
            st = null;
            if ($.grep(ugroups, function (e) { return e === obj2[i].Id; }).length > 0)
                st = "checked";
            this.appendToSearchResult($("#divUserGroupSearchResults"), st, obj2[i]);
        }
        this.drawSelectedDisplay(2);
    }

    this.init();
}