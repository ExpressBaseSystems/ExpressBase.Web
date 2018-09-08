const PGHelper = function (pgObj) {
    this.PGobj = pgObj;

    this.dataSourceInit = function (fun) {
        $.LoadingOverlay('show');
        $.ajax({
            type: "POST",
            url: "../DS/GetColumns",
            data: { DataSourceRefId: this.PGobj.PropsObj.DataSourceId },
            success: function (Columns) {
                this.clearDependantProps("Columns");
                this.PGobj.PropsObj["Columns"] = JSON.parse(Columns);
                this.PGobj.refresh();
                fun(this.PGobj.PropsObj);
                $.LoadingOverlay('hide');
            }.bind(this)
        });
    }.bind(this);

    this.clearDependantProps = function (prop) {
        let names = [];
        this.PGobj.Metas.forEach(function (meta, i) {
            if (meta.source === prop)
                this.clearProp(meta);
        }.bind(this));
    }

    this.clearProp = function (meta) {
        if (meta.editor === 24 || meta.editor === 8 && meta.Limit !== 1)
            this.PGobj.PropsObj[meta.name].$values = [];
        else if (meta.editor === 8 && meta.Limit === 1)
            this.PGobj.PropsObj[meta.name] = null;
    };
};