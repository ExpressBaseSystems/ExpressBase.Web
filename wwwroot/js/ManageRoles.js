var ManageRolesJs = function (appCollection, roleId, roleInfo, permission) {
    this.appCollection = appCollection;
    this.roleId = roleId;
    this.roleInfo = roleInfo;
    this.permission = permission;
    this.selectApp = $("#selectApp");


    this.init = function () {
        this.selectApp.on("change", this.selectAppChangeAction.bind(this));    
        this.loadAppToSelect.bind(this)();
    }

    this.loadAppToSelect = function () {
        $("#selectApp").children().remove();
        $.each(this.appCollection, function (k, appOb) {
            $("#selectApp").append(`<option data-id="${appOb.Id}">${appOb.Name}</option>`);
        });
    }

    this.selectAppChangeAction = function (e) {        
        var applicationId = $(e.target).find(":selected").val();
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