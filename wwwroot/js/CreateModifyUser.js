var UserJs = function (usr, usergroup) {
    this.user = usr;
    this.userGroup = usergroup;
    this.selectedRolesId = [];
    this.txtSearchRole = $("#txtSearchRole");
    this.btnModalOk = $("#btnModalOk");
    this.txtSearchRole = $("#txtSearchRole");
    this.divRoleSearchResults = $("#divRoleSearchResults");
    this.divSelectedRoleDisplay = $("#divSelectedRoleDisplay");

    this.closeDiv = $(".closediv1");
    this.txtSearchUserGroup = $("#txtSearchUserGroup");
    this.btnUserGroupModalOk = $("#btnUserGroupModalOk");
    this.txtSearchUserGroup = $("#txtSearchUserGroup");

    this.init = function () {
        this.txtSearchRole.on('keyup', this.KeyUptxtSearchRole(this.user));
        this.btnModalOk.on('click', this.clickbtnModalOkAction.bind(this));
        $('#addRolesModal').on('shown.bs.modal', this.initModal1.bind(this));
    }

    this.initModal1 = function () {
        this.txtSearchRole.focus();
        this.KeyUptxtSearchRole(this.user,this.divRoleSearchResults, this.divSelectedRoleDisplay, this.txtSearchRole);
    }

    this.KeyUptxtSearchRole = function (obj, id1, id2, id3) {
        $("#divRoleSearchResults").children().remove();
        var txt = $("#txtSearchRole").val().trim();
        var st = null;
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].Name.substr(0, txt.length).toLowerCase() === txt.toLowerCase()) {
                if ($('#divSelectedRoleDisplay').find(`[data-id='${obj[i].Id}']`).length > 0)
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
                $('#divSelectedRoleDisplay').append(`<div class="col-md-4 container-md-4" data-id=${$(this).attr('data-id')}>
                                                    <div class="mydiv1" style="">
                                                        <div class="icondiv1">
                                                             <b>${$(this).attr('data-name').substring(0, 1).toUpperCase()}</b>
                                                        </div>
                                                        <div class="textdiv1">
                                                            <b>${$(this).attr('data-name')}</b>
                                                            <br />&nbsp; ${$(this).attr('data-d')}
                                                        </div>
                                                        <div class="closediv1">
                                                            <i class="fa fa-times" aria-hidden="true"></i>
                                                        </div>
                                                    </div>
                                                </div>`);
            }
        });
    $('#addRolesModal').modal('toggle');
    $(".closediv1").on('click', this.clickOnCloseDiv.bind(this));
}

this.clickOnCloseDiv = function (e) {
    $(e.target).parent().parent().parent().remove();
}

this.init();
}