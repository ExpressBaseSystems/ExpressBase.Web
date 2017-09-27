var DvContainerObj = function (settings) {
    this.ssurl = settings.ss_url;
    this.wc = settings.wc;
    this.currentObj = null;
    this.dvcol = {};
    this.MainData = null;
    this.UniqueId = null;
    this.ebdtable = {};
    this.chartJs = {};

    this.init = function () {
        $("#btnGo").off("click").on("click", this.btnGoClick.bind(this));
        $("#next").off("click").on("click", this.gotoNext.bind(this));
        $("#prev").off("click").on("click", this.gotoPrevious.bind(this));
    };


    this.btnGoClick = function () {
        this.UniqueId = "dv" + this.currentObj.EbSid;
        console.log(this.dvcol["sub_window_dv" + this.currentObj.EbSid]);
        if (this.currentObj.$type.indexOf("EbTableVisualization") !== -1) {
            this.ebdtable[this.UniqueId] = new EbDataTable({
                ds_id: this.currentObj.DataSourceRefId,
                ss_url: this.ssurl,
                tid: this.UniqueId,
                login: this.wc,
                settings: this.currentObj,
            });

            this.ebdtable[this.UniqueId].getColumnsSuccess(this.currentObj);
        }
        else if (this.currentObj.$type.indexOf("EbChartVisualization") !== -1) {
            this.chartJs[this.UniqueId] = new eb_chart(this.currentObj, this.ssurl, this.MainData, this.UniqueId);
        }
        console.log("xxxxx", this.dvcol["sub_window_dv" + this.currentObj.EbSid]);
    };

    this.gotoNext = function () {
        focusedId = $("#" + focusedId).next().attr("id");
        $("#" + focusedId).focus();
        var dvobj = this.dvcol[focusedId];
        if (dvobj.$type.indexOf("EbTableVisualization") !== -1) {
            if ($("#" + focusedId).find(".dataTables_scroll").length > 0) {
                $("#Toolbar").children(":not(.commonControls)").remove();
                this.ebdtable["dv" + dvobj.EbSid].GenerateButtons();
            }
        }
        else {
            if ($("#" + focusedId).find("canvas").length > 0) {
                $("#Toolbar").children(":not(.commonControls)").remove();
                this.chartJs["dv" + dvobj.EbSid].createButtons();
            }
        }
    };

    this.gotoPrevious = function () {
        focusedId = $("#" + focusedId).prev().attr("id");
        $("#" + focusedId).focus();
        var dvobj = this.dvcol[focusedId];
        if (dvobj.$type.indexOf("EbTableVisualization") !== -1) {
            if ($("#" + focusedId).find(".dataTables_scroll").length > 0) {
                $("#Toolbar").children(":not(.commonControls)").remove();
                this.ebdtable["dv" + dvobj.EbSid].GenerateButtons();
            }
        }
        else {
            if ($("#" + focusedId).find("canvas").length > 0) {
                $("#Toolbar").children(":not(.commonControls)").remove();
                this.chartJs["dv" + dvobj.EbSid].createButtons();
            }
        }
    };

    this.init();
}