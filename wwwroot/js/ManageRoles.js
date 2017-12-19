var ManageRolesJs = function (appCollection, roleId, roleInfo, permission, _dict) {
    this.appCollection = appCollection;
    this.roleId = roleId;
    this.roleInfo = roleInfo;
    this.permission = permission;
    this.opDict = _dict;
    this.selectApp = $("#selectApp");
    this.divObjList = $("#divObjList");
    this.txtRoleName = $("#txtRoleName");
    this.txtRoleDescription = $("#txtRoleDescription");

    this.init = function () {
        this.loadObjectsAndOperations.bind(this)();

        //INIT FORM
        if (this.roleId > 0) {
            $(this.txtRoleName).val(roleInfo["RoleName"]);
            $(this.txtRoleName).attr("disabled", "true");
            $(this.selectApp).append(`<option data-id="${roleInfo["AppId"]}">${roleInfo["AppName"]}</option>`);
            $(this.selectApp).attr("disabled", "true");
            $(this.txtRoleDescription).text(roleInfo["RoleDescription"]);
            
        }
        else {
            this.selectApp.on("change", this.selectAppChangeAction.bind(this));
            this.loadAppToSelect.bind(this)();

        }
    }

    this.loadAppToSelect = function () {
        $("#selectApp").children().remove();
        $.each(this.appCollection, function (k, appOb) {
            $("#selectApp").append(`<option data-id="${appOb.Id}" data-index="${k}">${appOb.Name}</option>`);
        });
    }

    this.loadObjectsAndOperations = function () {
        $.each(this.opDict.$values, function (key, value) {
            $("#divObjList").append(`<a class="list-group-item list-group-item-action collapse" data-toggle="collapse" data-target="#tbl${value.Op_Name}" style="padding:5px">${value.Op_Name}</a>
                            <table class="objtype table table-responsive sub-menu collapse" data-id= "${value.Op_Id}" id='tbl${value.Op_Name}'></table> <thead><tr>`);
            var shtml = `<thead><tr><th></th>`;
        $.each(value.Operations.$values, function (a, b) {
                shtml += `<th style='font-weight:300'>${b}</th>`;
            });
            shtml += `</tr></thead><tbody></tbody>`;
            $("#tbl" + value.Op_Name).append(shtml);
        });
    }

    this.selectAppChangeAction = function (e) {        
        var applicationId = $(e.target).find(":selected").attr("data-index");
        appCollection = this.appCollection;
        $.each(this.opDict.$values, function (i, value) {
            $("#tbl" + value.Op_Name).find("tbody").children().remove();
            $.each(appCollection[applicationId].ObjectTypes, function (j, a) {
                if (j == value.Op_Id) {
                    $.each(a, function (k, b) {
                        var st = `<tr data-id=${b.Obj_Id}><td>${b.Obj_Name}</td>`;
                        for (x = 0; x < value.Operations.$values.length; x++)
                            st += `<td><input type='checkbox'></td>`;
                        st += `</tr>`;
                        $("#tbl" + value.Op_Name).append(st);
                    });
                }
            });
        });

        //$.ajax({
        //    type: "POST",
        //    url: "../Security/GetObjectAndPermission",
        //    data: {roleId: this.role_Id, appId: applicationId},
        //    success: this.getObjectAndPermissionSuccess
        //});
    }

    this.getObjectAndPermissionSuccess = function (data) {
        alert("dwd");
    }
    
    this.init();
}