var CommonListJs = function (itemList, metadata) {
    this.itemList = itemList;
    this.metadata = metadata;

    this.init = function () {
        this.setTable();
    }

    this.setTable = function () {
        //metadata = ["0 7", "1 Id", "2 Name", "3 Nick Name", "4 Sex", "5 Email", "6 Phone Number", "7 Status" ] for USER
        var tblcols = [];
        var tbldata = [];
        tblcols.push({ data: null, title: "Serial No", className: "dataTableColumnStyle", width: '50px', searchable: false, orderable: false });
        tblcols.push({ data: 1, title: this.metadata[1], visible: false });
        for (var i = 2; i <= parseInt(this.metadata[0]); i++)
            tblcols.push({ data: i, title: this.metadata[i], className: "dataTableColumnStyle", width: '200px' });
        tblcols.push({ data: null, title: "Edit/View", className: "dataTableColumnStyle", width: '50px', className: "text-center", render: this.tblEditColumnRender, searchable: false, orderable: false });
        for (i = 0; i < this.itemList.length; i++)
            tbldata.push({ 1: this.itemList[i][this.metadata[1]], 2: this.itemList[i][this.metadata[2]], 3: "ewerrg", 4: "errg", 5: this.itemList[i][this.metadata[5]], 6: "123332435", 7: "Active" });
        
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
            //columnDefs: [{
            //    searchable: false,
            //    orderable: false,
            //    targets: [0, 7]
            //}],
            order: [[2, 'asc']]

        });
        table.on('order.dt search.dt', function () {
            table.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
        }).draw();
    }
    this.tblEditColumnRender = function (data, type, row, meta) {
        //var checked = '';
        //if (this.permission.indexOf(data) !== -1)
        //    checked = 'checked';
        return `<i class="fa fa-pencil fa-2x" aria-hidden="true"></i>`;
    }


    this.init();
}