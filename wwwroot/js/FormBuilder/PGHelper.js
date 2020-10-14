const PGHelper = function (pgObj) {
    this.PGobj = pgObj;

    this.dataSourceInit = function () {
        if (getObjByval(this.PGobj.Metas, "name", "Columns") === undefined)
            return;

        $.LoadingOverlay('show');
        this.PGobj.isBussy = true;
        $.ajax({
            type: "POST",
            url: "../DS/GetColumns4Control",
            data: { DataSourceRefId: this.PGobj.PropsObj.DataSourceId },
            success: function (Columns) {
                this.clearDependantProps("Columns");// destination name hard coding
                this.PGobj.PropsObj["Columns"] = JSON.parse(Columns);
                this.PGobj.isBussy = false;
                this.PGobj.refresh();
                $.LoadingOverlay('hide');
            }.bind(this)
        });
    }.bind(this);

    this.dataSourceReInit = function (callbackFn) {
        if (getObjByval(this.PGobj.Metas, "name", "Columns") === undefined)
            return;

        $.LoadingOverlay('show');
        this.PGobj.isBussy = true;
        $.ajax({
            type: "POST",
            url: "../DS/GetColumns4Control",
            data: { DataSourceRefId: this.PGobj.PropsObj.DataSourceId },
            success: function (Columns) {
                this.PGobj.isBussy = false;
                let allCols = JSON.parse(Columns);
                if (callbackFn) {
                    callbackFn(allCols.$values);
                }
                this.PGobj.PropsObj[this.PGobj.CXVE.CurMeta.source] = allCols;
                this.PGobj.CXVE.CurMeta.__isReloadedAfterInit = true;
                this.PGobj.CXVE.CEHelper();
                this.PGobj.refresh();
                $.LoadingOverlay('hide');
            }.bind(this)
        });
    }.bind(this);

    this.UrlInit = function (opt) {
        if (getObjByval(this.PGobj.Metas, "name", "Columns") === undefined)
            return;

        $.LoadingOverlay('show');
        this.PGobj.isBussy = true;
        $.ajax({
            type: "POST",
            url: opt.url,
            data: { url: opt.apiUrl, headers: opt.headers, parameters: opt.parameters, method: opt.method },
            success: function (Columns) {
                if (Columns === "null") {
                    this.PGobj.EbAlert.alert({
                        head: "Something went Wrong .",
                        body: "Couldn't fetch columns.",
                        type: "danger",
                        delay: 5000
                    });
                }
                else {
                    this.clearDependantProps("Columns");// destination name hard coding
                    this.PGobj.PropsObj["Columns"] = JSON.parse(Columns);
                    this.PGobj.isBussy = false;
                    this.PGobj.refresh();
                }
                this.PGobj.isBussy = false;
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
        if (meta.editor === 24 || meta.editor === 27 || (meta.editor === 8 && meta.Limit !== 1))
            this.PGobj.PropsObj[meta.name].$values = [];
        else if (meta.editor === 8 && meta.Limit === 1)
            this.PGobj.PropsObj[meta.name] = null;
    };
};