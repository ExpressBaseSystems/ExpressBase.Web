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
            tblcols.push({ data: null, title: "", className: "dataTableColumnStyle text-center", width: '60px',render: this.tblProfPicRender, searchable: false, orderable: false });
        tblcols.push({ data: 1, title: this.metadata[1], visible: false });
        for (var i = 2; i <= parseInt(this.metadata[0]); i++)
            tblcols.push({ data: i, title: this.metadata[i].replace("_"," "), className: "dataTableColumnStyle", width: '200px' });
        tblcols.push({ data: null, title: "Edit/View", className: "dataTableColumnStyle", width: '50px', className: "text-center", render: this.tblEditColumnRender, searchable: false, orderable: false });

        if (this.metadata.indexOf("_user") !== -1)// fill tbldata with appropriate data
            for (i = 0; i < this.itemList.length; i++)
                tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]], 3: "ewerrg", 4: "errg", 5: this.itemList[i][this.metadata[5]], 6: "123332435", 7: "Active" });
        else if (this.metadata.indexOf("_userGroup") !== -1)
            for (i = 0; i < this.itemList.length; i++)
                tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]], 3: this.itemList[i][this.metadata[3]] });
        else if (this.metadata.indexOf("_roles") !== -1)
            for (i = 0; i < this.itemList.length; i++)
                tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]], 3: this.itemList[i][this.metadata[3]], 4:this.itemList[i][this.metadata[4]] });
        
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
        $("#tblCommonList").on('click', '.fa-pencil', this.onClickEdit.bind(this));
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

    }

    this.tblEditColumnRender = function (data, type, row, meta) {
        return `<i class="fa fa-pencil fa-2x" aria-hidden="true" style="cursor:pointer;" data-id=${data[1]}></i>`;
    }
    this.tblProfPicRender = function (data, type, row, meta) {
        return `<img class='img-thumbnail pull-right' src='../static/dp/dp_${data[1]}_micro.jpg' />`;
    }


    this.init();
}