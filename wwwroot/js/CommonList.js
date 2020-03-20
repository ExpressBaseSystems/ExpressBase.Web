var CommonListJs = function (itemList, metadata, mnuBarObj) {
    this.itemList = itemList;
    this.metadata = metadata;
    this.menuBarObj = mnuBarObj;

    //MODAL FIELDS-------------------
    this.AnonymUserModal = $("#ManageAnonymUserModal");
    this.UserTypesModal = $("#ManageUserTypesModal");
    this.itemid = $("#itemid");
    this.loader = $("#loader");
    this.modalBodyDiv = $("#modalBodyDiv");
    this.userData = null;
    this.txtFullName = $("#txtFullName");
    this.txtEmailId = $("#txtEmailId");
    this.txtPhoneNumber = $("#txtPhoneNumber");
    this.txtRemark = $("#txtRemark");
    this.imgFbProfPic = $("#imgFbProfPic");
    this.lnkGotoFbPage = $("#lnkGotoFbPage");
    this.lblApplication = $("#lblApplication");
    this.lblFirstVisit = $("#lblFirstVisit");
    this.lblLastVisit = $("#lblLastVisit");
    this.lblBrowser = $("#lblBrowser");
    this.lblIpAddress = $("#lblIpAdress");
    this.lblTotalVisits = $("#lblTotalVisits");
    this.lblLastUpdatedBy = $("#lblLastUpdatedBy");
    this.lblLastUpdatedAt = $("#lblLastUpdatedAt");
    this.table = null;

    this.btnUpdate = $("#btnupdate");
    this.UpdateUserTypeBtn = $('#update-type');
    this.init = function () {
        this.setTable();

        this.AnonymUserModal.on('shown.bs.modal', this.initModal.bind(this));
        this.AnonymUserModal.on('hidden.bs.modal', this.finalizeModal.bind(this));
        this.btnUpdate.on('click', this.OnclickBtnUpdate.bind(this));
        this.UpdateUserTypeBtn.on('click', this.OnclickUpdateUserTypeBtn.bind(this));

        this.UserTypesModal.on('shown.bs.modal', this.initUserTypeModal.bind(this));
        this.UserTypesModal.on('hidden.bs.modal', this.finalizeUserTypeModal.bind(this));
    };

    this.setTable = function () {
        //metadata => refer CommonList.cshtml
        var tblcols = [];
        var tbldata = [];
        tblcols.push({ data: null, title: "Serial No", className: "dataTableColumnStyle text-center", width: '30px', searchable: false, orderable: false });
        if (this.metadata.indexOf("_profPic") !== -1)
            tblcols.push({ data: null, title: "", className: "dataTableColumnStyle text-center", width: '60px', render: this.tblProfPicRender, searchable: false, orderable: false });
        if (this.metadata.indexOf("_fbProfPic") !== -1) {
            tblcols.push({ data: null, title: "", className: "dataTableColumnStyle text-center", width: '60px', render: this.tblFbProfPicRender, searchable: false, orderable: false });
            tblcols.push({ data: parseInt(this.metadata[0]) + 1, title: this.metadata[parseInt(this.metadata[0]) + 1], visible: false });
        }


        tblcols.push({ data: 1, title: this.metadata[1], visible: false });

        tblcols.push({ data: 2, title: this.metadata[2].replace("_", " "), className: "dataTableColumnStyle", width: '220px', render: this.tblNameColumnRender });

        for (var i = 3; i <= parseInt(this.metadata[0]); i++)
            tblcols.push({ data: i, title: this.metadata[i].replace("_", " "), className: "dataTableColumnStyle", width: '150px' });
        tblcols.push({ data: null, title: "View/Edit", className: "dataTableColumnStyle text-center", width: '80px', render: this.tblEditColumnRender, searchable: false, orderable: false });

        if (this.metadata.indexOf("_user") !== -1) {// to fill tbldata with appropriate data
            for (i = 0; i < this.itemList.length; i++)
                tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]], 3: this.itemList[i][this.metadata[3]], 4: this.itemList[i][this.metadata[4]], 5: this.itemList[i][this.metadata[5]], 6: this.itemList[i][this.metadata[6]], 7: this.itemList[i][this.metadata[7]] });
        }
        else if (this.metadata.indexOf("_userGroup") !== -1) {
            for (i = 0; i < this.itemList.length; i++)
                tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]], 3: this.itemList[i][this.metadata[3]] });
        }
        else if (this.metadata.indexOf("_roles") !== -1) {
            for (i = 0; i < this.itemList.length; i++)
                tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]], 3: this.itemList[i][this.metadata[3]], 4: this.itemList[i][this.metadata[4]], 5: this.itemList[i][this.metadata[5]], 6: this.itemList[i][this.metadata[6]], 7: this.itemList[i][this.metadata[7]] });
        }

        else if (this.metadata.indexOf("_anonymousUser") !== -1) {
            tblcols.push({ data: null, title: "Add as User", className: "dataTableColumnStyle text-center", width: '100px', render: this.tblConvertColumnRender, searchable: false, orderable: false });
            for (i = 0; i < this.itemList.length; i++)
                tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]], 3: this.itemList[i][this.metadata[3]], 4: this.itemList[i][this.metadata[4]], 5: this.itemList[i][this.metadata[5]], 6: this.itemList[i][this.metadata[6]], 7: this.itemList[i][this.metadata[7]], 8: this.itemList[i][this.metadata[8]], 9: this.itemList[i][this.metadata[9]] });
        }
        else if (this.metadata.indexOf("_userTypes") !== -1) {
            for (i = 0; i < this.itemList.length; i++)
                tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]] });
        }

        var tbl = "#tblCommonList";
        this.table = $(tbl).DataTable({
            scrollY: "96%",
            scrollX: true,
            paging: false,
            autoWidth: false,
            //dom: 'frt',
            dom: 't',
            ordering: false,
            columns: tblcols,
            data: tbldata,
            order: [[2, 'asc']]
        });
        this.table.on('order.dt search.dt', function () {
            this.table.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
        }.bind(this)).draw();
        $("#tblCommonList").on('click', '.editviewclass', this.onClickEdit.bind(this));
        $("#tblCommonList").on('click', '.convertuserclass', this.onClickConvert.bind(this));

        $(".CL_Image").Lazy();
        this.setMenuBar();
    };

    this.setMenuBar = function () {
        if (this.metadata.indexOf("_user") !== -1) {
            this.menuBarObj.insertButton(`<button class='btn' title='List/Unlist Hidden Users' onclick = "
                                var plength = window.location.href.split('&').length;
                                if(plength === 1){
                                    window.open('../Security/CommonList?type=Users&show=all', '_self');
                                }
                                else{
                                    window.open('../Security/CommonList?type=Users', '_self');
                                }
                        "><i class="fa fa-eye-slash" aria-hidden="true"></i></button>`);

            $("#btnNewCmnList").text("Create User");
            if (this.metadata.indexOf("_disableNewUser") !== -1)
                $("#btnNewCmnList").on("click", function () { EbMessage("show", { Message: 'Unable to create new user. Reached maximum user limit.', AutoHide: true, Background: '#1e1ebf' }); });
            else
                $("#btnNewCmnList").on("click", function () { window.open('../Security/ManageUser', '_blank'); });
        }
        else if (this.metadata.indexOf("_userGroup") !== -1) {
            $("#btnNewCmnList").text("Create UserGroup");
            $("#btnNewCmnList").on("click", function () { window.open('../Security/ManageUserGroups', '_blank'); });
        }
        else if (this.metadata.indexOf("_roles") !== -1) {
            $("#btnNewCmnList").text("Create Role");
            $("#btnNewCmnList").on("click", function () { window.open('../Security/ManageRoles', '_blank'); });
        }
        else if (this.metadata.indexOf("_anonymousUser") !== -1) {
            $("#btnNewCmnList").hide();
        }
        else if (this.metadata.indexOf("_userTypes") !== -1) {
            $("#btnNewCmnList").text("Create User Type");
            $("#btnNewCmnList").on("click", function () {
                $("#ManageUserTypesModal").modal('show');
                this.itemid = 0; 
            });
        }

        $('#txtSrchCmnList').on('keyup', function (e) {
            this.table.search($(e.target).val()).draw();
        }.bind(this));
    }.bind(this);

    this.onClickEdit = function (e) {
        var id = $(e.target).attr("data-id");
        if (this.metadata.indexOf("_user") !== -1) {
            //window.open("../Security/ManageUser?itemid=" + id, "_blank");
            var _form = document.createElement("form");
            _form.setAttribute("method", "post");
            _form.setAttribute("action", "../Security/ManageUser");
            _form.setAttribute("target", "_blank");
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = "itemid";
            input.value = id;
            _form.appendChild(input);

            var mode = document.createElement('input');
            mode.type = 'hidden';
            mode.name = "Mode";
            mode.value = '1';
            _form.appendChild(mode);

            document.body.appendChild(_form);
            _form.submit();
            document.body.removeChild(_form);
        }
        else if (this.metadata.indexOf("_roles") !== -1) {
            window.open("../Security/ManageRoles?itemid=" + id, "_blank");
        }
        else if (this.metadata.indexOf("_userGroup") !== -1) {
            window.open("../Security/ManageUserGroups?itemid=" + id, "_blank");
        }
        else if (this.metadata.indexOf("_anonymousUser") !== -1) {
            this.itemid = id;
            this.AnonymUserModal.modal('show');
        }
        else if (this.metadata.indexOf("_userTypes") !== -1) {
            this.itemid = id;
            this.UserTypesModal.modal('show');
        }
    };

    this.onClickConvert = function (e) {
        var _form = document.createElement("form");
        _form.setAttribute("method", "post");
        _form.setAttribute("action", "../Security/ManageUser");
        _form.setAttribute("target", "_blank");
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = "itemid";
        input.value = "1";//itemid is 1 for anonymous user
        _form.appendChild(input);

        var rowdata = this.table.row(this.table.row($(e.target).parent().parent()).index()).data();
        var dict = new Object();

        dict["AnonymousUserID"] = rowdata[1];
        dict["FullName"] = rowdata[2];
        dict["EmailID"] = rowdata[3];
        dict["PhoneNumber"] = rowdata[4];
        dict["SocialID"] = rowdata[9];

        input = document.createElement('input');
        input.type = 'hidden';
        input.name = "AnonymousUserInfo";
        input.value = JSON.stringify(dict);
        _form.appendChild(input);

        document.body.appendChild(_form);
        _form.submit();
        document.body.removeChild(_form);
    };


    this.tblNameColumnRender = function (data, type, row, meta) {
        return `<div class="editviewclass" style="" data-id=${row[1]}>${data}</div>`;
    };

    this.tblConvertColumnRender = function (data, type, row, meta) {
        return `<i class="fa fa-user-plus convertuserclass" aria-hidden="true"></i>`;
    };

    this.tblEditColumnRender = function (data, type, row, meta) {
        return `<i class="fa fa-pencil editviewclass" aria-hidden="true" data-id=${data[1]}></i>`;
    };

    this.tblProfPicRender = function (data, type, row, meta) {
        //return `<img class='img-thumbnail pull-right' src='../static/dp/dp_${data[1]}_micro.jpg' style = 'max-width: 80% !important;'/>`;
        if (data[4] === 'Female')
            return `<img class='CL_Image img-thumbnail pull-right' src='../images/businesswoman.png' style = 'max-height: 40px; margin: 0 10%;' onerror="this.src = '/images/imagenotfound.svg';" data-src="/images/dp/${data[1]}.png" />`;
        return `<img class='CL_Image img-thumbnail pull-right' src='../images/businessman.png' style = 'max-height: 40px; margin: 0 10%;' onerror="this.src = '/images/imagenotfound.svg';" data-src="/images/dp/${data[1]}.png" />`;
    };
    this.tblFbProfPicRender = function (data, type, row, meta) {
        var id = data[9];
        if (id === "")//if fbid is not available then
            return `<img class='img-thumbnail' src='../images/businessman.png' />`//id = '12345678';//assinging a sample value to get a default user profpic from graph.fb
        return `<img class='img-thumbnail' src='http://graph.facebook.com/${id}/picture?type=square' />`;
    };

    this.initModal = function () {
        this.modalBodyDiv.hide();
        this.loader.show();

        $.ajax({
            type: "POST",
            url: "../Security/GetAnonymousUserInfo",
            data: { userid: this.itemid },
            success: this.getAnonymousUserInfoSuccess.bind(this)
        });

    };

    this.finalizeModal = function () {
        this.modalBodyDiv.hide();
    };

    this.getAnonymousUserInfoSuccess = function (data) {
        this.loader.hide();
        this.modalBodyDiv.show();
        this.userData = JSON.parse(data);

        this.txtFullName.val(this.userData.FullName);
        this.txtEmailId.val(this.userData.Email);
        this.txtPhoneNumber.val(this.userData.Phone);
        this.txtRemark.val(this.userData.Remarks);

        this.lnkGotoFbPage.attr("href", "http://www.facebook.com/" + this.userData.SocialId);
        this.imgFbProfPic.attr("src", "http://graph.facebook.com/" + this.userData.SocialId + "/picture?type=square");

        this.lblApplication.text(this.userData.ApplicationName);
        this.lblFirstVisit.text(this.userData.FirstVisit);
        this.lblLastVisit.text(this.userData.LastVisit);
        this.lblIpAddress.text(this.userData.IpAddress);
        this.lblBrowser.text(this.userData.Browser);
        this.lblTotalVisits.text(this.userData.TotalVisits);
        this.lblLastUpdatedBy.text(this.userData.ModifiedBy);
        this.lblLastUpdatedAt.text(this.userData.ModifiedAt);
    };

    this.OnclickBtnUpdate = function () {
        this.btnUpdate.attr("disabled", "true");
        $.ajax({
            type: "POST",
            url: "../Security/UpdateAnonymousUserInfo",
            data: {
                itemid: this.itemid,
                name: this.txtFullName.val(),
                email: this.txtEmailId.val(),
                phone: this.txtPhoneNumber.val(),
                remarks: this.txtRemark.val()
            },
            success: this.updateAnonymousUserInfoSuccess.bind(this)
        });
    };
       
    this.updateAnonymousUserInfoSuccess = function (r) {
        if (r > 0)
            alert("Updated Successfully");
        else
            alert("Somthing went wrong!");
        this.AnonymUserModal.modal("hide");
        this.btnUpdate.prop("disabled", "false");
    };

    this.initUserTypeModal = function () {
        $('#usertype_body').hide();
        $("#loader1").show();
        if (this.itemid > 0) {
            $.post("../Security/GetUserTypes",
                { typeid: this.itemid },
                this.getUserTypeSuccess.bind(this)
            );
        }
        else {
            $("#loader1").hide();
            $('#usertype_body').show();
            $('#type-name').val("");
            this.itemid = 0;
        }
    };

    this.finalizeUserTypeModal = function () {
        $('#usertype_body').hide();
    };

    this.getUserTypeSuccess = function (data) {
        $("#loader1").hide();
        $('#usertype_body').show();
        this.userData = JSON.parse(data);
        $('#type-name').val(this.userData[0].Name);
    }.bind(this);

    this.OnclickUpdateUserTypeBtn = function () {
        this.btnUpdate.attr("disabled", "true");
        $.ajax({
            type: "POST",
            url: "../Security/UpdateUserType",
            data: {
                itemid: this.itemid,
                name: $('#type-name').val()
            },
            success: function (data) {
                if (data)
                {
                    alert("Updated Successfully");
                    location.reload();
                }
                else
                    alert("Somthing went wrong!");
                this.UserTypesModal.modal("hide");
            }.bind(this)
        });
    }.bind(this);


    this.init();
};