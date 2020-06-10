const PGHelper = function (pgObj) {
    this.PGobj = pgObj;

    this.dataSourceInit = function () {
        $.LoadingOverlay('show');
        $.ajax({
            type: "POST",
            url: "../DS/GetColumns4Control",
            data: { DataSourceRefId: this.PGobj.PropsObj.DataSourceId },
            success: function (Columns) {
                this.clearDependantProps("Columns");// destination name hard coding
                this.PGobj.PropsObj["Columns"] = JSON.parse(Columns);
                this.PGobj.refresh();
                $.LoadingOverlay('hide');
            }.bind(this)
        });
    }.bind(this);

    this.clearDependantProps = function (propName) {
        let CurMeta = getObjByval(this.PGobj.Metas, "name", propName)
        this.clearProp(CurMeta);
        if (CurMeta.dependentPropsList !== undefined) {
            // loop through CurMeta.dependentPropsList
            for (let i = 0; i < CurMeta.dependentPropsList.length; i++) {
                let depPropName = CurMeta.dependentPropsList[i];
                let depPropMeta = getObjByval(this.PGobj.Metas, "name", depPropName);
                if (propName !== depPropName)
                    this.clearDependantProps(depPropName);// and clear each props value if value changed
            }
        }
    };

    this.clearProp = function (meta) {
        if (meta.editor === 24 ||meta.editor === 27 || (meta.editor === 8 && meta.Limit !== 1))
            this.PGobj.PropsObj[meta.name].$values = [];
        else if (meta.editor === 8 && meta.Limit === 1)
            this.PGobj.PropsObj[meta.name] = null;
    };
};