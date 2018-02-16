var CommonListJs = function (itemList, metadata) {
    this.itemList = itemList;
    this.metadata = metadata;

    this.init = function () {
        this.setTable();
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
            window.open("../Security/ManageAnonymousUser?itemid=" + id, "_blank");
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
        return `<img class='img-thumbnail pull-right' src='http://graph.facebook.com/${id}/picture?type=square' />`;
    }


    this.init();
}