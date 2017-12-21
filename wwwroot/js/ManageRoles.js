var ManageRolesJs = function (appCollection, roleId, roleInfo, permission, _dict, roleList, r2rList) {
    this.appCollection = appCollection;
    this.roleId = roleId;
    this.roleInfo = roleInfo;
    this.permission = permission;
    this.opDict = _dict;
    this.roleList = roleList;
    this.r2rList = r2rList;
    this.dependentList = [];
    this.selectApp = $("#selectApp");
    this.divObjList = $("#divObjList");
    this.txtRoleName = $("#txtRoleName");
    this.txtRoleDescription = $("#txtRoleDescription");
    this.btnSaveAll = $("#btnSaveAll");

    this.txtSearchRole = $("#txtSearchRole");
    this.btnModalOk = $("#btnModalOk");
    this.divRoleSearchResults = $("#divRoleSearchResults");
    this.divSelectedRoleDisplay = $("#divSelectedRoleDisplay");
    this.txtDemoRoleSearch = $("#txtDemoRoleSearch");
    this.btnClearDemoRoleSearch = $("#btnClearDemoRoleSearch");

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

    //ROLE MANAGER-----------------------
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
        //else if (flag === 2) {
        //    obj = this.userGroup;
        //    $("#divUserGroupSearchResults").children().remove();
        //    txt = $("#txtSearchUserGroup").val().trim();
        //    divSelectedDisplay = $("#divSelectedUserGroupDisplay");
        //    divSearchResults = $("#divUserGroupSearchResults");
        //}
        else
            return;

        //$.each($(divSelectedDisplay).children(), function (i, ob) {
        //    //if ($(divSelectedDisplay).find(`[data-id='${obj[i].Id}']`).length > 0) {
        //        this.findDependentRoles($(ob).attr('data-id'));
        //    //}
        //}).bind(this);
        


        var app_id = $("#selectApp").find(":selected").attr("data-id");
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].App_Id == app_id) {
                if (obj[i].Name.substr(0, txt.length).toLowerCase() === txt.toLowerCase()) {
                    if ($(divSelectedDisplay).find(`[data-id='${obj[i].Id}']`).length > 0) {
                        st = "checked disabled";
                    }
                    else if (this.dependentList.indexOf(obj[i].Id) !== -1)
                        st = "checked";
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
        if($(e.target).is(':checked'))
            this.findDependentRoles($(e.target).attr("data-id"));
        console.log(this.dependentList);
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
        //else if (flag === 2) {
        //    divSearchResultsChecked = $('#divUserGroupSearchResults input:checked');
        //    divSelectedDisplay = $('#divSelectedUserGroupDisplay');
        //    addModal = $('#addUserGroupModal');
        //}
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
        //else if (flag === 2)
        //    mylist = $('#divSelectedUserGroupDisplay');
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
        //else if (flag === 2) {
        //    txt = $("#txtDemoUserGroupSearch").val().trim();
        //    divSelectedDisplay = $("#divSelectedUserGroupDisplay");
        //}
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
    //---------------------------

    this.loadAppToSelect = function () {
        $("#selectApp").children().remove();
        $.each(this.appCollection, function (k, appOb) {
            $("#selectApp").append(`<option data-id="${appOb.Id}" data-index="${k}">${appOb.Name}</option>`);
        });
        
    }

    this.loadObjectsAndOperations = function () {
        $.each(this.opDict.$values, function (key, value) {
            $("#divObjList").append(`<a class="objactiveclass list-group-item list-group-item-action collapse" data-toggle="collapse" data-target="#tbl${value.Op_Name}" style="padding:5px; font-weight:500;">${value.Op_Name}</a>
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
        //var appindex = $(e.target).find(":selected").attr("data-index");
        var appindex = $("#selectApp").find(":selected").attr("data-index");
        appCollection = this.appCollection;
        $.each(this.opDict.$values, function (i, value) {
            $("#tbl" + value.Op_Name).find("tbody").children().remove();
            $.each(appCollection[appindex].ObjectTypes, function (j, a) {
                if (j == value.Op_Id) {
                    $.each(a, function (k, b) {
                        var st = `<tr data-id=${b.Obj_Id}><td style='font-size:14px'>${b.Obj_Name}</td>`;
                        for (x = 0; x < value.Operations.$values.length; x++)
                            st += `<td align='center'><input type='checkbox' class="checkboxclass" data-id=${b.Obj_Id + '_' + x}></td>`;
                        st += `</tr>`;
                        $("#tbl" + value.Op_Name).append(st);
                    });
                }
            });
            var rowCount = $("#tbl" + value.Op_Name).find("tbody tr").length;
            $("#tbl" + value.Op_Name).prev("a").text(value.Op_Name + " (" + rowCount + ")" );
        });
    }

    this.onclickbtnSaveAll = function () {
        var selected = "";
        var appId = $("#selectApp").find(":selected").attr("data-id");
        var roleDescription = $(this.txtRoleDescription).val().trim();
        var roleName = $(this.txtRoleName).val().trim();
        $('.checkboxclass:checked').each(function () {
            selected += $(this).attr('data-id') + ",";
        });
        selected = selected.substring(0, selected.length - 1);
        if (roleName === "" || roleDescription==="") {
            return false;
        }
           
        $(this.btnSaveAll).attr("disabled", "true");

        $.ajax({
            type: "POST",
            url: "../Security/SaveRole",
            data: {_roleId: this.role_Id, _roleName: roleName, _roleDesc: roleDescription, _appId: appId, _permission: selected},
            success: this.saveRoleSuccess
        });
    }

    this.saveRoleSuccess = function (msg) {
        alert(msg);
        $(this.btnSaveAll).removeAttr("disabled");
    }
    
    
    this.init();
}