var counter = 0;
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
        $("#first").off("click").on("click", this.gotoFirst.bind(this));
        $("#last").off("click").on("click", this.gotoLast.bind(this));
        $("#Save_btn").off("click").on("click", this.saveSettings.bind(this));
        //$("#Related" + this.tableId + " .dropdown-menu li a").off("click").on("click", this.drawDv.bind(this));
    };


    this.btnGoClick = function () {
        this.UniqueId = "dv" + this.currentObj.EbSid + "_" + counter;
        console.log(this.dvcol["sub_window_dv" + this.currentObj.EbSid + "_" + counter]);
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
            //this.UniqueId = "dv" + this.currentObj.EbSid + "_" + counter;
            this.chartJs[this.UniqueId] = new eb_chart(this.currentObj, this.ssurl, this.MainData, this.UniqueId);
        }
        console.log("xxxxx", this.dvcol["sub_window_dv" + this.currentObj.EbSid + "_" + counter]);
    };

    this.gotoNext = function () {
        focusedId = $("#" + focusedId).next().attr("id");
        $("#" + focusedId).focus();
        var dvobj = this.dvcol[focusedId];
        if (dvobj.$type.indexOf("EbTableVisualization") !== -1) {
            $("#Toolbar").children(":not(.commonControls)").remove();
            if ($("#" + focusedId).find(".dataTables_scroll").length > 0) {
                this.ebdtable["dv" + dvobj.EbSid + "_" + counter].GenerateButtons();
            }
        }
        else if (dvobj.$type.indexOf("EbChartVisualization") !== -1) {
            $("#Toolbar").children(":not(.commonControls)").remove();
            if ($("#" + focusedId).find("canvas").length > 0) {
                this.chartJs["dv" + dvobj.EbSid + "_" + counter].createButtons();
            }
        }
        if ($("#" + focusedId).next().attr("id") == undefined) {
            $("#next").attr("disabled", true).css("color", "darkgray");
            $("#last").attr("disabled", true).css("color", "darkgray");
        }
        if ($("#" + focusedId).prev().attr("id") !== undefined) {
            $("#prev").attr("disabled", false).css("color", "black");
            $("#first").attr("disabled", false).css("color", "black");
        }
    };

    this.gotoPrevious = function () {
        focusedId = $("#" + focusedId).prev().attr("id");
        $("#" + focusedId).focus();
        var dvobj = this.dvcol[focusedId];
        if (dvobj.$type.indexOf("EbTableVisualization") !== -1) {
            if ($("#" + focusedId).find(".dataTables_scroll").length > 0) {
                $("#Toolbar").children(":not(.commonControls)").remove();
                this.ebdtable["dv" + dvobj.EbSid + "_" + counter].GenerateButtons();
            }
        }
        else {
            if ($("#" + focusedId).find("canvas").length > 0) {
                $("#Toolbar").children(":not(.commonControls)").remove();
                this.chartJs["dv" + dvobj.EbSid + "_" + counter].createButtons();
            }
        }
        if ($("#" + focusedId).prev().attr("id") == undefined) {
            $("#prev").attr("disabled", true).css("color","darkgray");
            $("#first").attr("disabled", true).css("color", "darkgray");
        }
        if ($("#" + focusedId).next().attr("id") !== undefined) {
            $("#next").attr("disabled", false).css("color", "black");
            $("#last").attr("disabled", false).css("color", "black");
        }
    };

    this.gotoFirst = function () {
        focusedId = $("#" + focusedId).siblings().first().attr("id");
        $("#" + focusedId).focus();
        var dvobj = this.dvcol[focusedId];
        if (dvobj.$type.indexOf("EbTableVisualization") !== -1) {
            $("#Toolbar").children(":not(.commonControls)").remove();
            if ($("#" + focusedId).find(".dataTables_scroll").length > 0) {
                this.ebdtable["dv" + dvobj.EbSid + "_" + counter].GenerateButtons();
            }
        }
        else if (dvobj.$type.indexOf("EbChartVisualization") !== -1) {
            $("#Toolbar").children(":not(.commonControls)").remove();
            if ($("#" + focusedId).find("canvas").length > 0) {
                this.chartJs["dv" + dvobj.EbSid + "_" + counter].createButtons();
            }
        }
        if ($("#" + focusedId).prev().attr("id") == undefined) {
            $("#prev").attr("disabled", true).css("color", "darkgray");
            $("#first").attr("disabled", true).css("color", "darkgray");
        }
        if ($("#" + focusedId).next().attr("id") !== undefined) {
            $("#next").attr("disabled", false).css("color", "black");
            $("#last").attr("disabled", false).css("color", "black");
        }
    };

    this.gotoLast = function () {
        focusedId = $("#" + focusedId).siblings().last().attr("id");
        $("#" + focusedId).focus();
        var dvobj = this.dvcol[focusedId];
        if (dvobj.$type.indexOf("EbTableVisualization") !== -1) {
            $("#Toolbar").children(":not(.commonControls)").remove();
            if ($("#" + focusedId).find(".dataTables_scroll").length > 0) {
                this.ebdtable["dv" + dvobj.EbSid + "_" + counter].GenerateButtons();
            }
        }
        else if (dvobj.$type.indexOf("EbChartVisualization") !== -1) {
            $("#Toolbar").children(":not(.commonControls)").remove();
            if ($("#" + focusedId).find("canvas").length > 0) {
                this.chartJs["dv" + dvobj.EbSid + "_" + counter].createButtons();
            }
        }
        if ($("#" + focusedId).next().attr("id") == undefined) {
            $("#next").attr("disabled", true).css("color", "darkgray");
            $("#last").attr("disabled", true).css("color", "darkgray");
        }
        if ($("#" + focusedId).prev().attr("id") !== undefined) {
            $("#prev").attr("disabled", false).css("color", "black");
            $("#first").attr("disabled", false).css("color", "black");
        }
    };

    //this.drawDv = function (e) {
    //    $.LoadingOverlay("show");
    //    $.ajax({
    //        type: "POST",
    //        url: "../DV/getdv",
    //        data: { dvRefId: $(e.target).attr("data-refid") },
    //        success: function (text) {
    //                $.LoadingOverlay("hide");
    //        }
    //    });
    //};

    this.saveSettings = function () {
        if (dvcontainerObj.currentObj.$type.indexOf("EbTableVisualization") !== -1)
            $.post('../DV/SaveSettings', { json: JSON.stringify(dvcontainerObj.currentObj), RefId: this.dvid, type: "TableVisualization" }, this.saveSuccess.bind(this));
        else
            $.post('../DV/SaveSettings', { json: JSON.stringify(dvcontainerObj.currentObj), RefId: this.dvid, type: "ChartVisualization" }, this.saveSuccess.bind(this));
    };

    this.saveSuccess = function () {
        alert("Success!!!!!!!");
    }

    this.init();
}