var ManageRolesJs = function (r_Id) {

    this.selectApp = $("#appselect");
    this.role_Id = r_Id;

    this.init = function () {
        this.selectApp.on("change", this.selectAppChangeAction.bind(this));        
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