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
        //this.loadObjectsAndOperations.bind(this)();
        $(this.btnSaveAll).on('click', this.onclickbtnSaveAll.bind(this));
        $(this.divObjList).on('click', '.objactiveclass', this.onClickObjActiveClass);
        
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


    //TABLE --------------BEGIN---------------------------------------------------------

    this.setTable = function (t, cols, dt) {
        var tbl = "#tbl" + t;
        var table = $(tbl).DataTable({
            scrollY: "300px",
            scrollX: true,
            scrollCollapse: true,
            paging: false,
            dom: 't',
            //ordering: false,
            fixedHeader: true,
            autoWidth: true,
            columns: cols,
            data: dt,
            fixedColumns: {
                leftColumns: 1,
                //rightColumns: 1
            },
            //drawCallback: function () {
            //    $(".dataTables_scrollHeadInner").css({ "width": "100%" });
            //    $(".dataTables_scrollHeadInner .table ").css({ "width": "100%" });
            //    $(tbl).DataTable().columns.adjust();
            //    $(tbl).DataTable().fixedColumns().relayout();
            //    $(tbl).DataTable().rows().recalcHeight();
            //},
            initComplete: function () {
                //$(tbl+" .dataTables_scrollHeadInner").css({ "width": "inherit" });
                //$(tbl+" .dataTables_scrollHeadInner .table ").css({ "width": "inherit" });
                //$(tbl).DataTable().columns.adjust().draw();
                //$(tbl).DataTable().fixedColumns().relayout();
                //$(tbl).DataTable().rows().recalcHeight();
            }
        });
        $('#txtSrch' + t).on('keyup', function () {
            if (this.value === "") {
                $("#spanRemv" + t).hide();
                $("#spanSrch" + t).show();
            }
            else {
                $("#spanSrch" + t).hide();
                $("#spanRemv" + t).show();
            }
            table.search(this.value).draw();
        });
        $("#spanRemv" + t).on('click', function () {
            $('#txtSrch' + t).val("");
            $("#spanRemv" + t).hide();
            $("#spanSrch" + t).show();
            table.search("").draw();
        });
    }
   
    //---------------------END------------------------------------------------------------

    this.loadAppToSelect = function () {
        $("#selectApp").children().remove();
        $.each(this.appCollection, function (k, appOb) {
            $("#selectApp").append(`<option data-id="${appOb.Id}" data-index="${k}">${appOb.Name}</option>`);
        });
    }

    this.onClickObjActiveClass = function () {
        if ($(this).hasClass("active123") || ! $(this).hasClass("collapsed")) {
            $(this).css("width", "100%");
            $(this).next('div').hide();
            $(this).removeClass('active123');
        }
        else {
            $(this).css("width", "84%");
            $(this).next('div').show();
            $(this).addClass('active123');
        }
    }

    //this.loadObjectsAndOperations = function () {
        //$.each(this.opDict.$values, function (key, value) {
            //$("#divObjList").append(`<a class="objactiveclass list-group-item list-group-item-action collapse" data-toggle="collapse" data-target="#tbl${value.Op_Name}" style="padding:5px; font-weight:500;">${value.Op_Name.substring(2)}</a>
            //                <table class="objtype table table-responsive sub-menu collapse table-striped" data-id= "${value.Op_Id}" id='tbl${value.Op_Name}'></table>`);
            //var shtml = `<thead><tr><th style="width: 250px"></th>`;
            //$.each(value.Operations.$values, function (a, b) {
            //    shtml += `<td align='center' style='font-size:14px; width: 100px'>${b}</td>`;
            //});
            //shtml += `</tr></thead><tbody></tbody>`;
            //$("#tbl" + value.Op_Name).append(shtml);
            //this.setTable($("#tbl" + value.Op_Name));

        //});
    //    $('.objactiveclass').click(function () {
    //        $(this).toggleClass('active');
    //    });
    //}
    this.tblColumnRender = function (data, type, row, meta) {
        var checked = '';
        if (this.permission.indexOf(data) !== -1)
            checked = 'checked';
        return `<input type='checkbox' ${checked} class="checkboxclass" data-id=${data}>`;
    }.bind(this);


    this.selectAppChangeAction = function (e) {  
        var appindex = $("#selectApp").find(":selected").attr("data-index");
        appCollection = this.appCollection;
        var _this = this;
        $('#divObjList').children().remove();
        $.each(this.opDict.$values, function (i, value) {
            var tblColumn = [];
            var tblData = [];

            var shtml = `<div>   
                            <a class="objactiveclass list-group-item list-group-item-action collapse in active123" data-toggle="collapse" data-target="#div${value.Op_Name}" style="padding:5px; font-weight:500; display:inline-block; width:84%; margin-top:20px; cursor: pointer;" id='a${value.Op_Name}'>${value.Op_Name.substring(2)}</a>
                            <div class="form-group has-feedback" style="width:15%; display:inline-block;">
                                <input type="text" class="form-control" id="txtSrch${value.Op_Name}" placeholder="Search" style="height: 32px; background-color: #EEE;" title="Search"/>
                                <span id="spanSrch${value.Op_Name}" class="glyphicon glyphicon-search form-control-feedback" style="top:0px;"></span>
                                <span id="spanRemv${value.Op_Name}" class="glyphicon glyphicon-remove form-control-feedback" style="top:0px; display:none;"></span>
                            </div>
                            <div id='div${value.Op_Name}' class='collapsed collapse in' style='width:inherit;'>
                                <table style='width:inherit;' class="objtype table table-responsive sub-menu table-striped" data-id= "${value.Op_Id}" id='tbl${value.Op_Name}'></table>
                            </div>
                        </div>`;
            $("#divObjList").append(shtml);

            tblColumn.push({ data: 'x0', title: "Objects     ", width: '200px', className: "dataTableColumnStyle"});
            $.each(value.Operations.$values, function (a, b) {
                tblColumn.push({ data: 'x' + (a + 1), title: b, render: _this.tblColumnRender, width: '80px', orderable: false, className: "text-center"});
            });
            $.each(appCollection[appindex].ObjectTypes, function (j, a) {
                if (j == value.Op_Id) {
                    $.each(a, function (k, b) {
                        var obt= new Object();
                        obt.x0= b.Obj_Name;
                        for (y = 0; y < value.Operations.$values.length; y++) {
                            var permissionString = b.Obj_Id + '_' + y;
                            obt["x" + (y + 1)] = permissionString;
                        }
                        tblData.push(obt);
                    });
                }
            });
            var rowCount = tblData.length;
            var headtag = $("#a" + value.Op_Name);
            if (rowCount !== 0) {
                $(headtag).text(value.Op_Name.substring(2) + " (" + rowCount + ")");
                _this.setTable(value.Op_Name, tblColumn, tblData);
            }
            else {
                $(headtag).parent().remove();
            }
            //var rowCount = $("#tbl" + value.Op_Name).find("tbody tr").length;
            //var headtag = $("#tbl" + value.Op_Name).prev("a");
            //$(headtag).text(value.Op_Name.substring(2) + " (" + rowCount + ")");
            //$(headtag).removeClass('active');
            //$(headtag).show();
            //if (rowCount === 0) {
            //    $(headtag).hide();
            //    $("#tbl" + value.Op_Name).hide();
            //}
        });
        
        //**************INIT SUBROLES TILE**************
        var app_id = $("#selectApp").find(":selected").attr("data-id");
        var objAll = [];
        var subRoles = null;
        var metadata1 = ['Id', 'Name', 'Description'];
        for (var i = 0; i < this.roleList.length; i++) {
            if (this.roleList[i].App_Id == app_id) {
                objAll.push({ Id: this.roleList[i].Id, Name: this.roleList[i].Name, Description: this.roleList[i].Description });
            }
        }
        if (this.roleId > 0) {
            this.findDependentRoles(this.roleId);
            subRoles = [];
            for (var j = 0; j < this.roleList.length; j++) 
                if (this.dependentList.indexOf(this.roleList[j].Id) !== -1) 
                     subRoles.push({ Id: this.roleList[j].Id, Name: this.roleList[j].Name, Description: this.roleList[j].Description });
        }

        if (this.subRolesTile === null)
            this.subRolesTile = new TileSetupJs($("#divroles"), "Add Roles", subRoles, objAll, metadata1, null, this.chkItemCustomFunc, this);
        else
            this.subRolesTile.setObjectList(objAll);
        //***********************************************

        //------------------INIT USERS TILE------------------
        var initUserList = null;
        var metadata2 = ['id', 'name', 'email', 'ProfilePicture'];
        if (this.roleId > 0) {
            initUserList = [];
            for (i = 0; i < this.usersList.length; i++) {
                initUserList.push({ id: this.usersList[i].Id, name: this.usersList[i].Name, email: this.usersList[i].Email});
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

        $.each(this.opDict.$values, function (i, value) {
            $("#spanRemv" + value.Op_Name).trigger("click");
        });

        $('.checkboxclass:checked').each(function () {
            permissionlist += $(this).attr('data-id') + ",";
        });
        permissionlist = permissionlist.substring(0, permissionlist.length - 1);

        if (roleName === "" || roleDescription === "") {
            this.alertFunc("Fill Role Name/Description",4000);
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
        if (msg === "Success") {
            alert("Role Saved Successfully");
            window.top.close();
        }
        else
            alert("Submission Failed");
        $(this.btnSaveAll).removeAttr("disabled");
    }

    this.alertFunc = function tempAlert(msg, duration) {
        var el = document.createElement("div");
        el.setAttribute("style", "position:absolute;top:10%;left:30%;background-color:white;");
        el.innerHTML = msg;
        setTimeout(function () {
            el.parentNode.removeChild(el);
        }, duration);
        document.body.appendChild(el);
    }

    

    this.init();


    //$.each(this.opDict.$values, function (i, value) {
    //    var shtml = `<a class="objactiveclass list-group-item list-group-item-action collapse" data-toggle="collapse" data-target="#div${value.Op_Name}" style="padding:5px; font-weight:500;">${value.Op_Name.substring(2)}</a>
    //                        <div id='div${value.Op_Name}' class='collapse'><table class="objtype table table-responsive sub-menu table-striped" data-id= "${value.Op_Id}" id='tbl${value.Op_Name}'>
    //                        <thead><tr><th style="width: 250px"></th>`;
    //    $.each(value.Operations.$values, function (a, b) {
    //        shtml += `<td align='center' style='font-size:14px; width: 100px'><b>${b}</b></td>`;
    //    });
    //    shtml += `</tr></thead><tbody></tbody></table></div>`;
    //    $("#divObjList").append(shtml);

    //    //$("#tbl" + value.Op_Name).append(shtml);
    //    //$("#tbl" + value.Op_Name).find("tbody").children().remove();

    //    $.each(appCollection[appindex].ObjectTypes, function (j, a) {
    //        if (j == value.Op_Id) {
    //            $.each(a, function (k, b) {
    //                var st = `<tr data-id=${b.Obj_Id}><td style='font-size:14px'>${b.Obj_Name}</td>`;
    //                for (x = 0; x < value.Operations.$values.length; x++) {
    //                    var permissionString = b.Obj_Id + '_' + x;
    //                    var checked = '';
    //                    if (_this.permission.indexOf(permissionString) !== -1)
    //                        checked = 'checked';
    //                    st += `<td align='center'><input type='checkbox' ${checked} class="checkboxclass" data-id=${permissionString}></td>`;
    //                }
    //                st += `</tr>`;
    //                $("#tbl" + value.Op_Name).append(st);
    //            });

    //            _this.setTable($("#tbl" + value.Op_Name));
    //        }


    //    });
    //    var rowCount = $("#tbl" + value.Op_Name).find("tbody tr").length;
    //    var headtag = $("#tbl" + value.Op_Name).prev("a");
    //    $(headtag).text(value.Op_Name.substring(2) + " (" + rowCount + ")");
    //    $(headtag).removeClass('active');
    //    $(headtag).show();
    //    if (rowCount === 0) {
    //        $(headtag).hide();
    //        $("#tbl" + value.Op_Name).hide();
    //    }
    //});

     //$(tbl).dataTable({
        //    paging: false,
        //    dom: 't',
        //    fixedHeader: true,
        //    scrollY: "80px",
        //    scrollX: true,
        //    fixedColumns: { leftColumns: 1 }
        //});

        //$(tbl).table_scroll({
        //    rowsInHeader: 1,
        //    fixedColumnsLeft: 1,
        //    columnsInScrollableArea: 2,
        //    scrollX: 2,
        //    scrollY: 2
            //// Number of rows in table header.
            //rowsInHeader: null,

            //// Number of rows in table footer.
            //rowsInFooter: null,

            //// Number of columns at the left side of scrollable area that will not be scrolled
            //fixedColumnsLeft: 0,

            //// Number of columns at the right side of scrollable area that will not be scrolled
            //fixedColumnsRight: 0,

            //// Number of columns to scroll to
            //scrollX: 0,

            //// Number of rows to scroll to
            //scrollY: 0,

            //// Number of rows that remains visible in scrollable area
            //rowsInScrollableArea: 5,

            //// Number of columns that remains visible in scrollable area
            //columnsInScrollableArea: 2,

            //// scroll or auto
            //overflowY: 'auto',
            //overflowX: 'auto'
        //});

}
