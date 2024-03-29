﻿var ManageRolesJs = function (appCollection, roleId, roleInfo, permission, _dict, roleList, r2rList, usersList, locationList, usersListAll) {
    this.menuBarObj = new EbHeader();
    this.menuBarObj.insertButton(`<button id="btnSaveAll" class='btn' title='Save'><i class="fa fa-floppy-o" aria-hidden="true"></i></button>`);
    this.appCollection = appCollection._acol.$values;
    this.roleId = roleId;
    this.roleInfo = roleInfo;
    this.permission = permission.$values;
    this.opDict = _dict.$values;
    this.roleList = roleList.$values;
    this.r2rList = r2rList.$values;
    this.usersList = usersList.$values;
    this.locationList = locationList.$values;
    this.usersListAll = usersListAll.$values;
    this.dependentList = [];
    this.dominantList = [];
    this.selectApp = $("#selectApp");
    this.divObjList = $("#divObjList");
    this.txtRoleName = $("#txtRoleName");
    this.txtRoleDescription = $("#txtRoleDescription");
    this.btnSaveAll = $("#btnSaveAll");
    this.loader = $("#loader1");
    this.chkboxAnonymous = $("#chkboxAnonymous");
    this.chkboxPrimary = $("#chkboxPrimary");
    this.selectedLocations = ['-1'];//init as global loaction access
    this.chkboxLocations = $("#chkboxLocations");
    this.divLocationOverlay = $("#divLocationOverlay");
    this.divLocationList = $("#divLocationList");

    this.subRolesTile = null;
    this.usersTile = null;


    this.init = function () {
        //this.loadObjectsAndOperations.bind(this)();
        this.btnSaveAll.on('click', this.onclickbtnSaveAll.bind(this));
        this.divObjList.on('click', '.objactiveclass', this.onClickObjActiveClass);
        this.divObjList.on('change', ".checkboxclass", this.onClickPermissionCheckBox.bind(this));
        this.txtRoleName.on('keyup', this.validateRoleName.bind(this));
        this.chkboxAnonymous.on('change', this.onChangeChkBoxAnonymous.bind(this));
        this.chkboxLocations.on('change', this.onChangechkboxLocations.bind(this));
        this.divLocationList.on('change', 'input:checkbox[name=cboxGrpLoc]', this.onClickLocationChkbxGrp.bind(this));

        this.loadLocationsToDom();
        //INIT FORM
        if (this.roleId > 0) {
            $(this.txtRoleName).val(roleInfo["RoleName"]);
            this.menuBarObj.setName(roleInfo["RoleName"]);
            document.title = "Edit Role - " + roleInfo["RoleName"];
            //this.btnSaveAll.text("Update");
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

            //Anonymous Role Management
            if (roleInfo["IsAnonymous"] === "true") {
                this.chkboxAnonymous.bootstrapToggle('on');
                $($("#ulTabOnMngRole").children()[2]).hide();
                $($("#ulTabOnMngRole").children()[3]).hide();
                $('.nav-tabs a[href="#divObjList"]').tab('show');
            }

            this.chkboxAnonymous.bootstrapToggle('disable');
            this.findDominantRoles(this.roleId);

            if (roleInfo["IsPrimary"] === "true") {
                this.chkboxPrimary.bootstrapToggle('on');
            }

            if (this.roleInfo["LocationIds"] !== "")
                this.selectedLocations = this.roleInfo["LocationIds"].split(",");
            if (this.selectedLocations.indexOf('-1') === -1) {
                this.chkboxLocations.bootstrapToggle('on');
                $.each(this.selectedLocations, function (i, id) {
                    $('#divLocationList input:checkbox[name=cboxGrpLoc][value=' + id + ']').prop('checked', true);
                }.bind(this));
            }
            this.isInfoValid = true;
        }
        else {
            this.menuBarObj.setName("New Role");
            document.title = "New Role";
            //this.btnSaveAll.text("Create");
            this.selectApp.on("change", this.selectAppChangeAction.bind(this));
            this.loadAppToSelect.bind(this)();
            this.isInfoValid = false;
        }

        this.selectAppChangeAction();
    };

    this.onChangeChkBoxAnonymous = function (evt) {
        var flag = false;
        var sroles = this.subRolesTile === null ? "" : this.subRolesTile.getItemIds();
        var usrs = this.usersTile === null ? "" : this.usersTile.getItemIds();
        //if (this.subRolesTile !== null ) {
        if ($(evt.target).is(":checked")) {
            if (sroles !== "" || usrs !== "") {
                EbDialog("show",
                    {
                        Message: "Continuing will remove the Selected SubRoles/Users",
                        Buttons: {
                            "OK": {
                                Background: "green",
                                Align: "left",
                                FontColor: "white;"
                            },
                            "Cancel": {
                                Background: "violet",
                                Align: "right",
                                FontColor: "white;"
                            }
                        },
                        CallBack: function (name) {
                            if (name === "OK")
                                flag = true;
                            if (flag || (sroles === "" && usrs === "")) {
                                $($("#ulTabOnMngRole").children()[2]).hide();
                                $($("#ulTabOnMngRole").children()[3]).hide();
                                $('.nav-tabs a[href="#settings"]').tab('show');
                            }
                            else
                                this.chkboxAnonymous.bootstrapToggle('off');
                        }.bind(this)
                    });
            }
            else {
                $($("#ulTabOnMngRole").children()[2]).hide();
                $($("#ulTabOnMngRole").children()[3]).hide();
                $('.nav-tabs a[href="#settings"]').tab('show');
            }
        }
        else {
            $($("#ulTabOnMngRole").children()[2]).show();
            $($("#ulTabOnMngRole").children()[3]).show();
        }

        //}
    };

    this.onChangechkboxLocations = function (evt) {
        if ($(evt.target).is(":checked")) {
            this.divLocationOverlay.hide();
            if (this.selectedLocations.indexOf('-1') !== -1)
                this.selectedLocations.splice(this.selectedLocations.indexOf('-1'), 1);
        }
        else {
            this.divLocationOverlay.show();
            if (this.selectedLocations.indexOf('-1') === -1)
                this.selectedLocations.push('-1');
        }
    };

    this.loadLocationsToDom = function () {
        this.divLocationList.children().remove();
        $.each(this.locationList, function (i, obj) {
            this.divLocationList.append(`<label style="padding-left:10px;font-weight: 300; cursor: pointer;"><input type="checkbox" name="cboxGrpLoc" value="${obj.Id}">${obj.ShortName} - ${obj.LongName}</label><br>`);
        }.bind(this));
    };

    this.onClickLocationChkbxGrp = function (evt) {
        let tempid = $(evt.target).val();
        let indx = this.selectedLocations.indexOf(tempid);
        let chkFlag = $(evt.target).is(":checked");
        if (chkFlag && indx)
            this.selectedLocations.push(tempid);
        else if (!chkFlag && indx !== -1)
            this.selectedLocations.splice(indx, 1);
    };

    this.validateRoleName = function (e) {
        clearTimeout(this.timer1);
        this.isInfoValid = false;
        var val = $(e.target).val().trim();
        $(e.target).css("border-color", "rgb(204, 204, 204)");
        $("#spanRoleName").children().remove();
        if (val === '')
            return;
        $("#spanRoleName").append(`<i class="fa fa-spinner fa-pulse" aria-hidden="true" style=" padding: 9px;"></i>`);
        $("#spanRoleName").attr("title", "Validating...");
        this.timer1 = setTimeout(function () { this.validateRoleNameAjaxCall(val, e); }.bind(this), 1000);
    };
    this.validateRoleNameAjaxCall = function (val, e) {
        $.ajax({
            type: "POST",
            url: "../Security/isValidRoleName",
            data: { reqRoleName: val },
            success: function (result) {
                if (result) {
                    $(e.target).css("border-color", "rgb(204, 0, 0)");
                    $("#spanRoleName").children().remove();
                    $("#spanRoleName").append(`<i class="fa fa-exclamation-triangle" aria-hidden="true" style="color:red; padding: 9px;"></i>`);
                    $("#spanRoleName").attr("title", "Role Name Already Exists");
                }
                else {
                    $("#spanRoleName").children().remove();
                    $("#spanRoleName").append(`<i class="fa fa-check" aria-hidden="true" style="color:green; padding: 9px;"></i>`);
                    $("#spanRoleName").attr("title", "Valid Role Name");
                    this.isInfoValid = true;
                }
            }.bind(this)
        });
    };

    //SUBROLES-----START------------------------------------------------------------------------------------

    this.findDependentRoles = function (dominant) {
        for (var i = 0; i < this.r2rList.length; i++) {
            if (this.r2rList[i].Dominant == dominant && this.dependentList.indexOf(this.r2rList[i].Dependent) === -1) {
                this.dependentList.push(this.r2rList[i].Dependent);
                this.findDependentRoles(this.r2rList[i].Dependent);
            }
        }
    };

    this.findSubRoles = function (r) {
        for (var i = 0; i < this.r2rList.length; i++)
            if (this.r2rList[i].Dominant == r && this.dependentList.indexOf(this.r2rList[i].Dependent) === -1)
                this.dependentList.push(this.r2rList[i].Dependent);
    };

    this.findDominantRoles = function (dependent) {
        for (var i = 0; i < this.r2rList.length; i++) {
            if (this.r2rList[i].Dependent == dependent && this.dominantList.indexOf(this.r2rList[i].Dominant) === -1) {
                this.dominantList.push(this.r2rList[i].Dominant);
                this.findDominantRoles(this.r2rList[i].Dominant);
            }
        }
    };

    this.chkItemCustomFunc = function (_this, $srchRsltItem) {
        _this.dependentList = [];
        let $chkbox = $srchRsltItem.find('input');
        //$.each($(this.divSearchResults).find('input'), function (i, ob) {
        //    if (_this.dominantList.indexOf(parseInt($(ob).attr('data-id'))) !== -1) {
        //        $(ob).removeAttr("checked");
        //        $(ob).attr("disabled", "true");
        //    }
        //});

        if ($chkbox.is(':checked')) {
            _this.findDependentRoles($chkbox.attr("data-id"));
            var st = "";
            var itemid = [];
            $.each(this.divSelectedDisplay.children(), function (i, ob) {
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
                        this.divSelectedDisplay.children("[data-id='" + itemid[i] + "']").remove();
                    }
                }
                else {
                    $srchRsltItem.removeAttr('disabled').css('pointer-events', 'all').css('opacity', '1.0');
                    $chkbox.prop("checked", false);
                }
            }
        }

        $.each(this.divSearchResults.find('.SearchCheckbox:checked'), function (i, ob) {
            _this.findDependentRoles($(ob).attr('data-id'));
        });
        $.each(this.divSelectedDisplay.children(), function (i, ob) {
            _this.dependentList.push(parseInt($(ob).attr('data-id')));
            _this.findDependentRoles($(ob).attr('data-id'));
        });
        $.each(this.divSearchResults.children(), function (i, ob) {
            let $srIt = $(ob);
            let $ckBx = $(ob).find('input');
            if (_this.dependentList.indexOf(parseInt($srIt.attr('data-id'))) !== -1 || _this.dominantList.indexOf(parseInt($srIt.attr('data-id'))) !== -1) {
                $srIt.attr('disabled', 'disabled').css('pointer-events', 'none').css('opacity', '0.5');
                $ckBx.prop('checked', false);
                //$(ob).removeAttr("checked");
                //$(ob).attr("disabled", "true");
            }
            else {
                $srchRsltItem.removeAttr('disabled').css('pointer-events', 'all').css('opacity', '1.0');
                //$(ob).removeAttr("disabled");
            }

            if ($(this.divSelectedDisplay).children("[data-id=" + $(ob).attr('data-id') + "]").length > 0) {
                $srIt.attr('disabled', 'disabled').css('pointer-events', 'none').css('opacity', '0.5');
                $ckBx.prop('checked', true);
                //$(ob).attr("disabled", "true");
                //$(ob).prop("checked", "true");
            }
        }.bind(this));
    };

    //SUBROLES-------------END------------------------------------------------------------------


    //TABLE --------------BEGIN---------------------------------------------------------

    this.setTable = function (t, cols, dt) {
        var tbl = "#tbl" + t;
        var table = $(tbl).DataTable({
            //scrollY: true,
            //scrollX: true,
            //scrollCollapse: true,
            paging: false,
            dom: 't',
            //ordering: false,
            //fixedHeader: true,
            //autoWidth: true,
            columns: cols,
            data: dt,
            //fixedColumns: {
            //    leftColumns: 1,
            //    //rightColumns: 1
            //},
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
        $('#txtSrch' + t).on('keyup', function (e) {
            if ($(e.target).val() === "") {
                $("#spanRemv" + t).hide();
                $("#spanSrch" + t).show();
            }
            else {
                $("#spanSrch" + t).hide();
                $("#spanRemv" + t).show();
            }
            table.search($(e.target).val()).draw();
        });
        $("#spanRemv" + t).on('click', function () {
            $('#txtSrch' + t).val("");
            $("#spanRemv" + t).hide();
            $("#spanSrch" + t).show();
            table.search("").draw();
        });
    };

    //---------------------END------------------------------------------------------------

    this.loadAppToSelect = function () {
        $("#selectApp").children().remove();
        $.each(this.appCollection, function (k, appOb) {
            $("#selectApp").append(`<option data-id="${appOb.Id}" data-index="${k}">${appOb.Name}</option>`);
        });
    };

    //this.isAnonymousRoleExists = function (appid) {
    //    for (var i = 0; i < this.roleList.length; i++) {
    //        if (this.roleList[i].App_Id == appid && this.roleList[i].Is_Anonymous) {
    //            return true;
    //        }
    //    }
    //    return false;
    //}

    this.onClickObjActiveClass = function () {
        if ($(this).hasClass("active123") || !$(this).hasClass("collapsed")) {
            $(this).css("width", "100%");
            $(this).next('div').hide();
            $(this).removeClass('active123');
        }
        else {
            $(this).css("width", "84%");
            $(this).next('div').css('display', 'inline-block');
            $(this).addClass('active123');
        }
    };

    this.onClickPermissionCheckBox = function () {
        let crntPermission = $(event.target).attr("data-id");
        let permIndx = this.permission.indexOf(crntPermission);
        let chkFlag = $(event.target).prop("checked");
        if (chkFlag && permIndx === -1)
            this.permission.push(crntPermission);
        else if (!chkFlag && permIndx !== -1)
            this.permission.splice(permIndx, 1);
    };

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
        var perstr = data.substring(0, 15);
        var title = data.substring(15);
        var checked = '';
        if (this.permission.indexOf(perstr) !== -1)
            checked = 'checked';
        return `<input type='checkbox' ${checked} class="checkboxclass" data-id=${perstr} title='${title}'>`;
    }.bind(this);


    this.selectAppChangeAction = function (e) {

        //var appCollection = this.appCollection;

        //if (this.isAnonymousRoleExists(appCollection[appindex].Id)) {
        //    this.chkboxAnonymous.bootstrapToggle('off');
        //    this.chkboxAnonymous.bootstrapToggle('disable'); 
        //}
        //else {
        //    this.chkboxAnonymous.bootstrapToggle('enable'); 
        //    this.chkboxAnonymous.bootstrapToggle('off');
        //}

        //var _this = this;
        $('#divObjList').children().remove();
        $.each(this.opDict, function (i, value) {
            var tblColumn = [];
            var tblData = [];

            var shtml = `<div class="eb-perm-wrapper">   
                            <a class="objactiveclass list-group-item list-group-item-action collapse in collapsed" data-toggle="collapse" data-target="#div${value.Op_Name}" style="padding:5px; font-weight:500; display:inline-block; width:100%; cursor: pointer; background-color: #eee;" id='a${value.Op_Name}'>${value.Op_Name}</a>
                            <div class="form-group has-feedback" style="width:15%; display:none;margin-bottom:0">
                                <input type="text" class="form-control" id="txtSrch${value.Op_Name}" placeholder="Search" style="height: 32px; background-color: #EEE;" title="Search"/>
                                <span id="spanSrch${value.Op_Name}" class="glyphicon glyphicon-search form-control-feedback" style="top:0px;"></span>
                                <span id="spanRemv${value.Op_Name}" class="glyphicon glyphicon-remove form-control-feedback" style="top:0px; display:none;pointer-events: inherit;"></span>
                            </div>
                            <div id='div${value.Op_Name}' class='collapsed collapse' style='width:inherit;'>
                                <table style='width:100%;margin-bottom:0;' class="objtype table table-responsive sub-menu table-striped" data-id= "${value.Op_Id}" id='tbl${value.Op_Name}'></table>
                            </div>
                        </div>`;
            $("#divObjList").append(shtml);

            tblColumn.push({ data: 'x0', title: "Objects     ", width: '200px', className: "dataTableColumnStyle" });
            $.each(value.Operations.$values, function (a, b) {
                tblColumn.push({ data: 'x' + (a + 1), title: b, render: this.tblColumnRender, width: '80px', orderable: false, className: "text-center" });
            }.bind(this));
            var appindex = $("#selectApp").find(":selected").attr("data-index");
            $.each(this.appCollection[appindex].ObjectTypes._otypecol, function (j, a) {
                if (j == value.Op_Id) {
                    $.each(a._obcol.$values, function (k, b) {
                        var obt = new Object();
                        obt.x0 = b.Obj_Name;
                        var appindex = $("#selectApp").find(":selected").attr("data-index");
                        for (y = 0; y < value.Operations.$values.length; y++) {
                            var permissionString = this.appCollection[appindex].Id.toString().padStart(3, "0") + "-" + value.Op_Id.toString().padStart(2, "0") + "-" + b.Obj_Id.toString().padStart(5, "0") + "-" + y.toString().padStart(2, "0");
                            obt["x" + (y + 1)] = permissionString + b.Obj_Name.replace(/[^\w\s]/gi, '') + " -> " + value.Operations.$values[y];
                        }
                        tblData.push(obt);
                    }.bind(this));
                }
            }.bind(this));
            var rowCount = tblData.length;
            var headtag = $("#a" + value.Op_Name);
            if (rowCount !== 0) {
                $(headtag).text(value.Op_Name + " (" + rowCount + ")");
                this.setTable(value.Op_Name, tblColumn, tblData);
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
        }.bind(this));
        if ($('#divObjList').children().length === 0)
            $('#divObjList').append(`<div class="nothing-text" style="padding-top: 150px;"> Nothing to Display </div>`);




        //**************INIT SUBROLES TILE**************
        var app_id = $("#selectApp").find(":selected").attr("data-id");
        var objAll = [];
        var subRoles = null;
        var metadata1 = ['Id', 'Name', 'Description'];
        for (var i = 0; i < this.roleList.length; i++) {
            if (this.roleList[i].App_Id == app_id || this.roleList[i].Is_System === true) {
                objAll.push({ Id: this.roleList[i].Id, Name: this.roleList[i].Name, Description: this.roleList[i].Description });
            }
        }
        if (this.roleId > 0 && this.roleInfo["IsAnonymous"] === "false") {
            this.findSubRoles(this.roleId);
            subRoles = [];
            for (var j = 0; j < this.roleList.length; j++)
                if (this.dependentList.indexOf(this.roleList[j].Id) !== -1)
                    subRoles.push({ Id: this.roleList[j].Id, Name: this.roleList[j].Name, Description: this.roleList[j].Description });
        }

        if (this.subRolesTile === null)
            this.subRolesTile = new TileSetupJs({
                $container: $("#divroles"),
                title: "Add Roles",
                initObjList: subRoles,
                searchObjList: objAll,
                objMetadata: metadata1,
                chkUnChkItemCustomFunc: this.chkItemCustomFunc,
                parentThis: this
            });
        else
            this.subRolesTile.setObjectList(objAll);

        //if (this.roleInfo["IsAnonymous"] === "true") {
        //    this.subRolesTile.setReadOnly();
        //}
        //***********************************************

        //------------------INIT USERS TILE------------------
        var initUserList = null;
        var userListAll = [];
        var metadata2 = ['id', 'name', 'email', 'ProfilePicture'];
        for (let i = 0; i < this.usersListAll.length; i++) {
            let _name = this.usersListAll[i].Name || this.usersListAll[i].Email || this.usersListAll[i].Phone;
            userListAll.push({ id: this.usersListAll[i].Id, name: _name, email: this.usersListAll[i].Email });
        }
        if (this.roleId > 0) {
            initUserList = [];
            for (let i = 0; i < this.usersList.length; i++) {
                let _name = this.usersList[i].Name || this.usersList[i].Email || this.usersList[i].Phone;
                initUserList.push({ id: this.usersList[i].Id, name: _name, email: this.usersList[i].Email });
            }
        }
        if (this.usersTile === null) {
            this.usersTile = new TileSetupJs({
                $container: $("#divusers"),
                title: "Add Users",
                initObjList: initUserList,
                searchObjList: userListAll,
                objMetadata: metadata2,
                parentThis: this
            });
        }
        //-----------------------------------------------
    };

    this.onclickbtnSaveAll = function () {
        var rid = this.roleId;
        var permissionlist = "";
        var isAnonymous = this.chkboxAnonymous.prop("checked");
        var isPrimary = this.chkboxPrimary.prop("checked");
        var role2rolelist = isAnonymous ? "" : this.subRolesTile.getItemIds();
        var userslist = isAnonymous ? "" : this.usersTile.getItemIds();
        var appId = $("#selectApp").find(":selected").attr("data-id");
        var roleDescription = $(this.txtRoleDescription).val().trim();
        var roleName = $(this.txtRoleName).val().trim();
        var strSelectedLocs = "";

        if (!this.isInfoValid) {
            EbMessage("show", { Message: 'Role name already exists. Enter a unique name.', AutoHide: true, Background: '#bf1e1e' });
            return false;
        }
        if (roleName === "") {
            EbMessage("show", { Message: 'Role name cannot be empty.', AutoHide: true, Background: '#bf1e1e' });
            return false;
        }
        if (roleDescription === "") {
            EbMessage("show", { Message: 'Role description cannot be empty.', AutoHide: true, Background: '#bf1e1e' });
            return false;
        }


        //$.each(this.opDict, function (i, value) {
        //    $("#spanRemv" + value.Op_Name).trigger("click");
        //});
        //$('.checkboxclass:checked').each(function () {
        //    permissionlist += $(this).attr('data-id') + ",";
        //});

        for (let i = 0; i < this.permission.length; i++)
            permissionlist += this.permission[i] + ",";
        permissionlist = permissionlist.substring(0, permissionlist.length - 1);

        for (let i = 0; i < this.selectedLocations.length; i++)
            strSelectedLocs += this.selectedLocations[i] + ",";
        strSelectedLocs = strSelectedLocs.substring(0, strSelectedLocs.length - 1);
        strSelectedLocs = this.selectedLocations.indexOf('-1') === -1 ? strSelectedLocs : "-1";

        $(this.btnSaveAll).attr("disabled", "true");
        $("#eb_common_loader").EbLoader("show");
        $.ajax({
            type: "POST",
            url: "../Security/SaveRole",
            data: {
                _roleId: rid,
                _roleName: roleName,
                _roleDesc: roleDescription,
                _isAnonymous: isAnonymous,
                _isPrimary: isPrimary,
                _appId: appId,
                _permission: permissionlist,
                _role2role: role2rolelist,
                _users: userslist,
                _locations: strSelectedLocs
            },
            error: function () {
                EbMessage("show", { Message: 'Something unexpected occurred', AutoHide: true, Background: '#bf1e1e' });
                $(this.btnSaveAll).removeAttr("disabled");
                $("#eb_common_loader").EbLoader("hide");
            }.bind(this),
            success: this.saveRoleSuccess.bind(this)
        });
    };

    this.saveRoleSuccess = function (msg) {
        if (msg === "Success") {
            EbDialog("show",
                {
                    Message: "Role Saved Successfully",
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
        else if (msg === "Duplicate")
            EbMessage("show", { Message: 'Role name already exists. Enter a unique name.', AutoHide: true, Background: '#bf1e1e' });
        else
            EbMessage("show", { Message: 'Something went wrong', AutoHide: true, Background: '#bf1e1e' });
        $(this.btnSaveAll).removeAttr("disabled");
        $("#eb_common_loader").EbLoader("hide");
    };

    //this.alertFunc = function tempAlert(msg, duration) {
    //    var el = document.createElement("div");
    //    el.setAttribute("style", "position:absolute;top:10%;left:60%;background-color:white;");
    //    el.innerHTML = msg;
    //    setTimeout(function () {
    //        el.parentNode.removeChild(el);
    //    }, duration);
    //    document.body.appendChild(el);
    //}



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

};


