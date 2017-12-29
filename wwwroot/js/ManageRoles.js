var ManageRolesJs = function (appCollection, roleId, roleInfo, permission, _dict, roleList, r2rList, usersList) {
    this.appCollection = appCollection;
    this.roleId = roleId;
    this.roleInfo = roleInfo;
    this.permission = permission;
    this.opDict = _dict;
    this.roleList = roleList;
    this.r2rList = r2rList;
    this.usersList = usersList;
    this.dependentList = [];
    this.selectApp = $("#selectApp");
    this.divObjList = $("#divObjList");
    this.txtRoleName = $("#txtRoleName");
    this.txtRoleDescription = $("#txtRoleDescription");
    this.btnSaveAll = $("#btnSaveAll");
    this.loader = $("#loader1");

    this.subRolesTile = null;


    this.txtSearchRole = $("#txtSearchRole");
    this.btnModalOk = $("#btnModalOk");
    this.divRoleSearchResults = $("#divRoleSearchResults");
    this.divSelectedRoleDisplay = $("#divSelectedRoleDisplay");
    this.txtDemoRoleSearch = $("#txtDemoRoleSearch");
    this.btnClearDemoRoleSearch = $("#btnClearDemoRoleSearch");

    this.txtSearchUser = $("#txtSearchUser");
    this.btnSearchUser = $("#btnSearchUser");
    this.btnModal2Ok = $("#btnModal2Ok");
    this.divUserSearchResults = $("#divUserSearchResults");
    this.divSelectedUserDisplay = $("#divSelectedUserDisplay");
    this.txtDemoUserSearch = $("#txtDemoUserSearch");
    this.btnClearDemoUserSearch = $("#btnClearDemoUserSearch");

    this.init = function () {
        this.loadObjectsAndOperations.bind(this)();
        $("#formManageRoles").on('submit', this.onclickbtnSaveAll.bind(this));

       

        //INIT ROLES TAB
        this.txtSearchRole.on('keyup', this.KeyUptxtSearchRole.bind(this));
        this.btnModalOk.on('click', this.clickbtnModalOkAction.bind(this));
        $('#addRolesModal').on('shown.bs.modal', this.initModal1.bind(this));
        this.txtDemoRoleSearch.on('keyup', this.KeyUptxtDemoRoleSearch.bind(this));
        this.btnClearDemoRoleSearch.on('click', this.OnClickbtnClearDemoRoleSearch.bind(this));
        //$(".SearchCheckbox").on('change', this.OnChangeSearchCheckbox.bind(this));

        //INIT USERS TAB
        //this.txtSearchUser.on('keyup', this.KeyUptxtSearchUser.bind(this));
        this.btnSearchUser.on('click', this.onClickBtnSearchUser.bind(this));
        this.btnModal2Ok.on('click', this.clickbtnModal2OkAction.bind(this));
        $('#addUserModal').on('shown.bs.modal', this.initModal2.bind(this));
        //this.txtDemoUserSearch.on('keyup', this.KeyUptxtDemoUserSearch.bind(this));
        //this.btnClearDemoUserSearch.on('click', this.OnClickbtnClearDemoUserSearch.bind(this));

        //INIT FORM
        if (this.roleId > 0) {
            $(this.txtRoleName).val(roleInfo["RoleName"]);
            $(this.txtRoleName).attr("disabled", "true");
            var apIndex = 0;
            $.each(this.appCollection, function (i, obj) {
                if (obj.Id == roleInfo["AppId"]) {
                    apIndex = i;
                    return false;
                }
            });
            $(this.selectApp).append(`<option data-id="${roleInfo["AppId"]}" data-index="${apIndex}">${roleInfo["AppName"]}</option>`);
            $(this.selectApp).attr("disabled", "true");
            $(this.txtRoleDescription).text(roleInfo["RoleDescription"]);
            
        }
        else {
            this.selectApp.on("change", this.selectAppChangeAction.bind(this));
            this.loadAppToSelect.bind(this)();

        }
        
        
        this.selectAppChangeAction();
    }

    //SUBROLES-----START------------------------------------------------------------------------------------
    this.initModal1 = function () {
        this.txtSearchRole.focus();
        this.KeyUptxtSearchRole();
    }
    this.KeyUptxtSearchRole = function () {
        this.dependentList = [];
        this.drawSearchResults(1);
    }
    this.clickbtnModalOkAction = function () {
        this.drawSelectedDisplay(1);
        $('#addRolesModal').modal('toggle');
        this.SortDiv(1);
    }
    this.drawSearchResults = function (flag) {
        var st = null;
        var txt = null;
        var divSelectedDisplay;
        var divSearchResults;
        if (flag === 1) {
            obj = this.roleList;
            $("#divRoleSearchResults").children().remove();
            txt = $("#txtSearchRole").val().trim();
            divSelectedDisplay = $("#divSelectedRoleDisplay");
            divSearchResults = $("#divRoleSearchResults");
        }
        else
            return;

        $.each($(divSelectedDisplay).children(), function (i, ob) {
            this.findDependentRoles($(ob).attr('data-id'));
        }.bind(this));

        var app_id = $("#selectApp").find(":selected").attr("data-id");
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].App_Id == app_id) {
                if (obj[i].Name.substr(0, txt.length).toLowerCase() === txt.toLowerCase()) {
                    if ($(divSelectedDisplay).find(`[data-id='${obj[i].Id}']`).length > 0) {
                        st = "checked disabled";
                    }
                    else if (this.dependentList.indexOf(obj[i].Id) !== -1)
                        st = "disabled";
                    else
                        st = null;
                    this.appendToSearchResult(divSearchResults, st, obj[i]);
                }
            }            
        }
        $(".SearchCheckbox").on('change', this.OnChangeSearchCheckbox.bind(this));
    }
    this.OnChangeSearchCheckbox = function (e) {
        this.dependentList = [];
        $.each($("#divSelectedRoleDisplay").children(), function (i, ob) {
            this.dependentList.push(parseInt($(ob).attr('data-id')));
            this.findDependentRoles($(ob).attr('data-id'));
        }.bind(this));
        if($(e.target).is(':checked'))
            this.findDependentRoles($(e.target).attr("data-id"));

        $.each($("#divRoleSearchResults").find('input'), function (i, ob) {
            if (this.dependentList.indexOf(parseInt($(ob).attr('data-id'))) !== -1) {
                $(ob).removeAttr("checked");
                $(ob).attr("disabled", "true");
            }
            else
                $(ob).removeAttr("disabled");
        }.bind(this));
    }
    this.findDependentRoles = function (dominant) {
        for (var i = 0; i < this.r2rList.length; i++) {
            if (this.r2rList[i].Dominant == dominant) {
                this.dependentList.push(this.r2rList[i].Dependent);
                this.findDependentRoles(this.r2rList[i].Dependent);
            }
        }
    }
    this.appendToSearchResult = function (divSearchResults, st, obj) {
        $(divSearchResults).append(`<div class='row searchRsulsItemsDiv' style='margin-left:5px; margin-right:5px' data-id=${obj.Id}>
                                        <div class='col-md-1' style="padding:10px">
                                            <input type ='checkbox' class='SearchCheckbox' ${st} data-name = '${obj.Name}' data-id = '${obj.Id}' data-d = '${obj.Description}' aria-label='...'>
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
        else
            return;
        //
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
                                                                <ul class="dropdown-menu" style="left:-140px; width:160px;">
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
            mylist = $('#divSelectedUserDisplay');
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
    this.keyUpTxtDemoSearch = function (flag) {
        var f = 1;
        var txt;
        var divSelectedDisplay;
        if (flag === 1) {
            txt = $("#txtDemoRoleSearch").val().trim();
            divSelectedDisplay = $("#divSelectedRoleDisplay");
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
    //SUBROLES-------------END------------------------------------------------------------------

    //USERS --------------BEGIN---------------------------------------------------------

    this.initModal2 = function () {
        this.txtSearchUser.focus();
        this.drawSelectedDisplay1(1, this.usersList);
    }
    this.onClickBtnSearchUser = function () {
        this.KeyUptxtSearchUser();
    }
    this.KeyUptxtSearchUser = function () {
        //this.drawSearchResults2(1);
        searchTxt = $(this.txtSearchUser).val().trim();
        if (searchTxt === "")
            return;
        $("#divUserSearchResults").children().remove();
        this.loader.show();
        $.ajax({
            type: "POST",
            url: "../Security/GetUserDetails",
            data: { srchTxt: searchTxt },
            success: this.getUserdetailsSuccess.bind(this)
        });
    }
    this.getUserdetailsSuccess = function (data) {
        this.loader.hide();
        console.log(data);
        this.drawSearchResults2(1, data);
    };

    this.clickbtnModal2OkAction = function () {
        var objlst = [];
        $.each($('#divUserSearchResults input:checked'), function(i, ob){
            objlst.push({ Id: $(ob).attr('data-id'), Name: $(ob).attr('data-name'), Email: $(ob).attr('data-email') });
        });
        this.drawSelectedDisplay1(1, objlst);
        $('#addUserModal').modal('toggle');
        this.SortDiv(2);
    }

    this.drawSearchResults2 = function (flag, data) {
        var st = null;
        var txt = null;
        var divSelectedDisplay;
        var divSearchResults;
        if (flag === 1) {
            obj = data;
            $("#divUserSearchResults").children().remove();
            //txt = $("#txtSearchRole").val().trim();
            divSelectedDisplay = $("#divSelectedUserDisplay");
            divSearchResults = $("#divUserSearchResults");
        }
        else
            return;
        
        for (var i = 0; i < obj.length; i++) {
            if ($(divSelectedDisplay).find(`[data-id='${obj[i].id}']`).length > 0) {
                st = "checked disabled";
            }
            else
                st = null;
            this.appendToSearchResult1(divSearchResults, st, obj[i]);
        }
    }

    this.appendToSearchResult1 = function (divSearchResults, st, obj) {
        $(divSearchResults).append(`<div class='row searchRsulsItemsDiv' style='margin-left:5px; margin-right:5px' data-id=${obj.id}>
                                        <div class='col-md-1' style="padding:10px">
                                            <input type ='checkbox' class='SearchCheckbox' ${st} data-name = '${obj.name}' data-id = '${obj.id}' data-email = '${obj.email}' aria-label='...'>
                                        </div>
                                        <div class='col-md-10'>
                                            <h5 name = 'head5' style='color:black;'>${obj.name}</h5>
                                            ${obj.email}
                                        </div>
                                    </div>`);
    }

    this.drawSelectedDisplay1 = function (flag, objArray) {
        var addModal;
        var divSelectedDisplay;
        if (flag === 1) {
            divSelectedDisplay = $('#divSelectedUserDisplay');
            addModal = $('#addUserModal');
        }
        else
            return;
       // <b>${this.Name.substring(0, 1).toUpperCase()}</b>
        $(objArray).each(function () {
            if (($(divSelectedDisplay).find(`[data-id='${this.Id}']`).length) === 0) {
                $(divSelectedDisplay).append(`<div class="col-md-4 container-md-4" data-id=${this.Id} data-name=${this.Name}>
                                                    <div class="mydiv1" style="overflow:visible;">
                                                        <div class="icondiv1">
                                                            <img class='img-thumbnail pull-right' src= '../static/dp/dp_${this.Id}_micro.jpg'/>
                                                            
                                                        </div>
                                                        <div class="textdiv1">
                                                            <b>${this.Name}</b>
                                                            <div style="font-size: smaller;">&nbsp${this.Email}</div>
                                                        </div>
                                                        <div class="closediv1">
                                                            <div class="dropdown">
                                                                <i class="fa fa-ellipsis-v dropdown-toggle" aria-hidden="true" data-toggle="dropdown" style="padding:0px 5px"></i>
                                                                <ul class="dropdown-menu" style="left:-140px; width:160px;">
                                                                    <li><a href="#" onclick="OnClickRemove(this);">Remove</a></li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    </div>`);
            }
        });
    }

    //---------------------END------------------------------------------------------------

    this.loadAppToSelect = function () {
        $("#selectApp").children().remove();
        $.each(this.appCollection, function (k, appOb) {
            $("#selectApp").append(`<option data-id="${appOb.Id}" data-index="${k}">${appOb.Name}</option>`);
        });
        
    }

    this.loadObjectsAndOperations = function () {
        $.each(this.opDict.$values, function (key, value) {
            $("#divObjList").append(`<a class="objactiveclass list-group-item list-group-item-action collapse" data-toggle="collapse" data-target="#tbl${value.Op_Name}" style="padding:5px; font-weight:500;">${value.Op_Name.substring(2)}</a>
                            <table class="objtype table table-responsive sub-menu collapse" data-id= "${value.Op_Id}" id='tbl${value.Op_Name}'></table> <thead><tr>`);
            var shtml = `<thead><tr><th style="width: 250px"></th>`;
        $.each(value.Operations.$values, function (a, b) {
                shtml += `<td align='center' style='font-size:14px; width: 100px'>${b}</td>`;
            });
            shtml += `</tr></thead><tbody></tbody>`;
            $("#tbl" + value.Op_Name).append(shtml);
        });
        $('.objactiveclass').click(function () {
            $(this).toggleClass('active');
        });
    }

    this.selectAppChangeAction = function (e) {  
        var appindex = $("#selectApp").find(":selected").attr("data-index");
        appCollection = this.appCollection;
        var _this = this;
        $('.collapse').collapse('hide');
        $.each(this.opDict.$values, function (i, value) {
            $("#tbl" + value.Op_Name).find("tbody").children().remove();
            $.each(appCollection[appindex].ObjectTypes, function (j, a) {
                if (j == value.Op_Id) {
                    $.each(a, function (k, b) {
                        var st = `<tr data-id=${b.Obj_Id}><td style='font-size:14px'>${b.Obj_Name}</td>`;
                        for (x = 0; x < value.Operations.$values.length; x++) {
                            var permissionString = b.Obj_Id + '_' + x;
                            var checked = '';
                            if (_this.permission.indexOf(permissionString) !== -1)
                                checked = 'checked';
                            st += `<td align='center'><input type='checkbox' ${checked} class="checkboxclass" data-id=${permissionString}></td>`;
                        }
                        st += `</tr>`;
                        $("#tbl" + value.Op_Name).append(st);
                    });
                }
            });
            var rowCount = $("#tbl" + value.Op_Name).find("tbody tr").length;
            var headtag = $("#tbl" + value.Op_Name).prev("a");
            $(headtag).text(value.Op_Name.substring(2) + " (" + rowCount + ")");
            $(headtag).removeClass('active');
            $(headtag).show();
            if (rowCount === 0) {
                $(headtag).hide();
            }
        });


        //**************INIT SUBROLES TILE**************
        var app_id = $("#selectApp").find(":selected").attr("data-id");
        var obj = [];
        for (var i = 0; i < this.roleList.length; i++) {
            if (this.roleList[i].App_Id == app_id) {
                obj.push({ Id: this.roleList[i].Id, Name: this.roleList[i].Name, Data1: this.roleList[i].Description });
            }
        }
        if (this.subRolesTile === null)
            this.subRolesTile = new TileSetupJs($("#divroles"), "Add Roles", null, obj, null, this.chkItemCustomFunc, this);
        else
            this.subRolesTile.setObjectList(obj);
        //***********************************************

    }

    this.onclickbtnSaveAll = function () {
        var permissionlist = "";
        var role2rolelist = "";
        var userslist = "";
        var appId = $("#selectApp").find(":selected").attr("data-id");
        var roleDescription = $(this.txtRoleDescription).val().trim();
        var roleName = $(this.txtRoleName).val().trim();
        $('.checkboxclass:checked').each(function () {
            permissionlist += $(this).attr('data-id') + ",";
        });
        permissionlist = permissionlist.substring(0, permissionlist.length - 1);
        
        $.each($('#divSelectedRoleDisplay').children(), function (i, ob) {
            role2rolelist += $(ob).attr('data-id') + ",";
        });
        role2rolelist = role2rolelist.substring(0, role2rolelist.length - 1);

        $.each($('#divSelectedUserDisplay').children(), function (i, ob) {
            userslist += $(ob).attr('data-id') + ",";
        });
        userslist = userslist.substring(0, userslist.length - 1);

        if (roleName === "" || roleDescription==="") {
            return false;
        }
        $(this.btnSaveAll).attr("disabled", "true");
        $.ajax({
            type: "POST",
            url: "../Security/SaveRole",
            data: { _roleId: this.role_Id, _roleName: roleName, _roleDesc: roleDescription, _appId: appId, _permission: permissionlist, _role2role: role2rolelist, _users: userslist},
            success: this.saveRoleSuccess
        });
    }

    this.saveRoleSuccess = function (msg) {
        alert(msg);
        $(this.btnSaveAll).removeAttr("disabled");
    }

    this.chkItemCustomFunc = function (_this, e)
    {
        _this.dependentList = [];
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
                if (confirm("Continuing this Operation will Remove the following Item(s)"+ st +"\n\nClick OK to Continue")) {
                    for (i = 0; i < itemid.length; i++){
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
            if (_this.dependentList.indexOf(parseInt($(ob).attr('data-id'))) !== -1) {
                $(ob).removeAttr("checked");
                $(ob).attr("disabled", "true");
            }
            else
                $(ob).removeAttr("disabled");
        });
    }

    this.init();
}