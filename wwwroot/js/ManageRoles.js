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
    this.usersTile = null;
    
   
    this.init = function () {
        this.loadObjectsAndOperations.bind(this)();
        $(this.btnSaveAll).on('click', this.onclickbtnSaveAll.bind(this));
        
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
            if (_this.dependentList.indexOf(parseInt($(ob).attr('data-id'))) !== -1) {
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
      
    //SUBROLES-------------END------------------------------------------------------------------


    //USERS --------------BEGIN---------------------------------------------------------

    
   
   
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
        var objAll = [];
        var subRoles = null;
        var metadata1 = ['Id', 'Name', 'Description'];
        for (var i = 0; i < this.roleList.length; i++) {
            if (this.roleList[i].App_Id == app_id) {
                objAll.push({ Id: this.roleList[i].Id, Name: this.roleList[i].Name, Data1: this.roleList[i].Description });
            }
        }
        if (this.roleId > 0) {
            this.findDependentRoles(this.roleId);
            subRoles = [];
            for (var j = 0; j < this.roleList.length; j++) 
                if (this.dependentList.indexOf(this.roleList[j].Id) !== -1) 
                     subRoles.push({ Id: this.roleList[j].Id, Name: this.roleList[j].Name, Data1: this.roleList[j].Description });
        }

        if (this.subRolesTile === null)
            this.subRolesTile = new TileSetupJs($("#divroles"), "Add Roles", subRoles, objAll, metadata1, null, this.chkItemCustomFunc, this);
        else
            this.subRolesTile.setObjectList(objAll);
        //***********************************************

        //------------------INIT USERS TILE------------------
        var initUserList = null;
        var metadata2 = ['Id', 'Name', 'Email', 'ProfilePicture'];
        if (this.roleId > 0) {
            initUserList = [];
            for (i = 0; i < this.usersList.length; i++) {
                initUserList.push({ Id: this.usersList[i].Id, Name: this.usersList[i].Name, Data1: this.usersList[i].Email});
            }
        }
        if (this.usersTile === null) {
            this.usersTile = new TileSetupJs($("#divusers"), "Add Users", initUserList, null, metadata2, "../Security/GetUserDetails", null, this);
        }
        //-----------------------------------------------
    }

    this.onclickbtnSaveAll = function () {
        var rid = this.roleId;
        var permissionlist = "";
        var role2rolelist = this.subRolesTile.getItemIds();
        var userslist = this.usersTile.getItemIds();
        var appId = $("#selectApp").find(":selected").attr("data-id");
        var roleDescription = $(this.txtRoleDescription).val().trim();
        var roleName = $(this.txtRoleName).val().trim();
        $('.checkboxclass:checked').each(function () {
            permissionlist += $(this).attr('data-id') + ",";
        });
        permissionlist = permissionlist.substring(0, permissionlist.length - 1);
        
        //$.each($('#divSelectedRoleDisplay').children(), function (i, ob) {
        //    role2rolelist += $(ob).attr('data-id') + ",";
        //});
        //role2rolelist = role2rolelist.substring(0, role2rolelist.length - 1);

        //$.each($('#divSelectedUserDisplay').children(), function (i, ob) {
        //    userslist += $(ob).attr('data-id') + ",";
        //});
        //userslist = userslist.substring(0, userslist.length - 1);

        if (roleName === "" || roleDescription==="") {
            return false;
        }
        $(this.btnSaveAll).attr("disabled", "true");
        $.ajax({
            type: "POST",
            url: "../Security/SaveRole",
            data: { _roleId: rid, _roleName: roleName, _roleDesc: roleDescription, _appId: appId, _permission: permissionlist, _role2role: role2rolelist, _users: userslist},
            success: this.saveRoleSuccess.bind(this)
        });
    }

    this.saveRoleSuccess = function (msg) {
        alert(msg);
        $(this.btnSaveAll).removeAttr("disabled");
    }

    

    this.init();
}