var CommonListJs = function (itemList, metadata) {
    this.itemList = itemList;
    this.metadata = metadata;

    //MODAL FIELDS-------------------
    this.AnonymUserModal = $("#ManageAnonymUserModal");
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
    this.lblTotalVisits = $("#lblTotalVisits");
    this.lblLastUpdatedBy = $("#lblLastUpdatedBy");
    this.lblLastUpdatedAt = $("#lblLastUpdatedAt");

    this.btnUpdate = $("#btnupdate");
    this.btnConvert = $("#btnconvert");


    this.init = function () {
        this.setTable();

        this.AnonymUserModal.on('shown.bs.modal', this.initModal.bind(this));
        this.btnUpdate.on('click', this.OnclickBtnUpdate.bind(this));
        this.btnConvert.on('click', this.OnclickBtnConvert.bind(this));
    }

    this.setTable = function () {
        //metadata => refer CommonList.cshtml
        var tblcols = [];
        var tbldata = [];
        tblcols.push({ data: null, title: "Serial No", className: "dataTableColumnStyle", width: '30px', searchable: false, orderable: false });
        if (this.metadata.indexOf("_profPic") !== -1)
            tblcols.push({ data: null, title: "", className: "dataTableColumnStyle text-center", width: '60px', render: this.tblProfPicRender, searchable: false, orderable: false });
        if (this.metadata.indexOf("_fbProfPic") !== -1) {
            tblcols.push({ data: null, title: "", className: "dataTableColumnStyle text-center", width: '60px', render: this.tblFbProfPicRender, searchable: false, orderable: false });
            tblcols.push({ data: parseInt(this.metadata[0]) + 1, title: this.metadata[parseInt(this.metadata[0]) + 1], visible: false });
        }
            

        tblcols.push({ data: 1, title: this.metadata[1], visible: false });

        tblcols.push({ data: 2, title: this.metadata[2].replace("_", " "), className: "dataTableColumnStyle", width: '220px', render: this.tblNameColumnRender });

        for (var i = 3; i <= parseInt(this.metadata[0]); i++)
            tblcols.push({ data: i, title: this.metadata[i].replace("_"," "), className: "dataTableColumnStyle", width: '150px' });
        tblcols.push({ data: null, title: "Edit/View", className: "dataTableColumnStyle", width: '80px', className: "text-center", render: this.tblEditColumnRender, searchable: false, orderable: false });

        if (this.metadata.indexOf("_user") !== -1)// to fill tbldata with appropriate data
            for (i = 0; i < this.itemList.length; i++)
                tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]], 3: "ewerrg", 4: "errg", 5: this.itemList[i][this.metadata[5]], 6: "123332435", 7: "Active" });
        else if (this.metadata.indexOf("_userGroup") !== -1)
            for (i = 0; i < this.itemList.length; i++)
                tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]], 3: this.itemList[i][this.metadata[3]] });
        else if (this.metadata.indexOf("_roles") !== -1)
            for (i = 0; i < this.itemList.length; i++)
                tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]], 3: this.itemList[i][this.metadata[3]], 4: this.itemList[i][this.metadata[4]], 5: this.itemList[i][this.metadata[5]], 6: this.itemList[i][this.metadata[6]], 7: this.itemList[i][this.metadata[7]] });

        else if (this.metadata.indexOf("_anonymousUser") !== -1)
            for (i = 0; i < this.itemList.length; i++)
                tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]], 3: this.itemList[i][this.metadata[3]], 4: this.itemList[i][this.metadata[4]], 5: this.itemList[i][this.metadata[5]], 6: this.itemList[i][this.metadata[6]], 7: this.itemList[i][this.metadata[7]], 8: this.itemList[i][this.metadata[8]], 9: this.itemList[i][this.metadata[9]] });
        
        var tbl = "#tblCommonList";
        var table = $(tbl).DataTable({
            scrollY: "400px",
            scrollX: true,
            paging: false,
            autoWidth: false,
            dom: 'frt',
            ordering: true,
            columns: tblcols,
            data: tbldata,
            order: [[2, 'asc']]
        });
        table.on('order.dt search.dt', function () {
            table.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
        }).draw();
        $("#tblCommonList").on('click', '.editviewclass', this.onClickEdit.bind(this));
    }

    this.onClickEdit = function (e) {
        var id = $(e.target).attr("data-id");
        if (this.metadata.indexOf("_user") !== -1) {
            window.open("../Security/ManageUser?itemid=" + id, "_blank");
        }
        else if (this.metadata.indexOf("_roles") !== -1) {
            window.open("../Security/ManageRoles?itemid=" + id, "_blank");
        }
        else if (this.metadata.indexOf("_userGroup") !== -1) {
            window.open("../Security/ManageUserGroups?itemid=" + id, "_blank");
        } 
        else if (this.metadata.indexOf("_anonymousUser") !== -1) {
            //window.open("../Security/ManageAnonymousUser?itemid=" + id, "_blank");
            this.itemid = id;
            this.AnonymUserModal.modal('show');
        } 

    }

    this.tblNameColumnRender = function (data, type, row, meta) {
        return `<div class="editviewclass" style="cursor:pointer;" data-id=${row[1]}>${data}</div>`;
    }

    this.tblEditColumnRender = function (data, type, row, meta) {
        return `<i class="fa fa-pencil fa-2x editviewclass" aria-hidden="true" style="cursor:pointer;" data-id=${data[1]}></i>`;
    }
    this.tblProfPicRender = function (data, type, row, meta) {
        return `<img class='img-thumbnail pull-right' src='../static/dp/dp_${data[1]}_micro.jpg' />`;
    }
    this.tblFbProfPicRender = function (data, type, row, meta) {
        var id = data[9];
        if (id == "")
            id = '12345678';
        return `<img class='img-thumbnail' src='http://graph.facebook.com/${id}/picture?type=square' />`;
    }

    this.initModal = function () {
        this.modalBodyDiv.hide();
        this.loader.show();

        $.ajax({
            type: "POST",
            url: "../Security/GetAnonymousUserInfo",
            data: { userid : this.itemid },
            success: this.getAnonymousUserInfoSuccess.bind(this)
        });

    }

    this.getAnonymousUserInfoSuccess = function (data) {
        this.loader.hide();
        this.modalBodyDiv.show();
        this.userData = JSON.parse(data)

        this.txtFullName.val(this.userData.FullName);
        this.txtEmailId.val(this.userData.Email);
        this.txtPhoneNumber.val(this.userData.Phone);
        this.txtRemark.val(this.userData.Remarks);

        this.lnkGotoFbPage.attr("href", "http://www.facebook.com/" + this.userData.SocialId);
        this.imgFbProfPic.attr("src", "http://graph.facebook.com/" + this.userData.SocialId + "/picture?type=square");
        this.lblApplication.text(this.userData.ApplicationName);
        this.lblFirstVisit.text(this.userData.FirstVisit);
        this.lblLastVisit.text(this.userData.LastVisit);
        this.lblTotalVisits.text(this.userData.TotalVisits);
        this.lblLastUpdatedBy.text(this.userData.ModifiedBy);
        this.lblLastUpdatedAt.text(this.userData.ModifiedAt);

    }

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
    }

    this.updateAnonymousUserInfoSuccess = function (r) {
        if (r > 0)
            alert("Updated Successfully");
        this.btnUpdate.attr("disabled", "false");
    }

    this.OnclickBtnConvert = function () {
        if (confirm("Click OK to Continue")) {
            this.btnConvert.attr("disabled", "true");
            $.ajax({
                type: "POST",
                url: "../Security/ConvertAnonymousUserToUser",
                data: {
                    itemid: this.itemid,
                    name: this.txtFullName.val(),
                    email: this.txtEmailId.val(),
                    phone: this.txtPhoneNumber.val(),
                    remarks: this.txtRemark.val()
                },
                success: this.convertAnonymousUserToUserSuccess.bind(this)
            });
        }
        
    }

    this.convertAnonymousUserToUserSuccess = function () {

    }

    this.init();
}