const PGHelper = function (pgObj) {
    this.PGobj = pgObj;

    this.dataSourceInit = function (fun) {
        $.LoadingOverlay('show');
        $.ajax({
            type: "POST",
            url: "../DS/GetColumns",
            data: { DataSourceRefId: this.PGobj.PropsObj.DataSourceId },
            success: function (Columns) {
                this.PGobj.PropsObj["Columns"] = JSON.parse(Columns);
                this.clearDependantProps("Columns");
                this.PGobj.refresh();
                fun(this.PGobj.PropsObj);
                $.LoadingOverlay('hide');
            }
        });
    };

    this.clearDependantProps = function (prop) {
        let names = [];
        AllMetas[this.PGobj.CurProp].forEach(function (meta, i) {
            if (meta.source === prop)
                this.clearProp(meta.name);
        });
    }

    this.clearProp = function () {

    };
};