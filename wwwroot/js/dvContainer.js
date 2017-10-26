var counter = 0;
var focusedId;
var DvContainerObj = function (settings) {
    this.ssurl = settings.ss_url;
    this.wc = settings.wc;
    this.dvRefid = settings.dvRefId;
    this.currentObj = null;
    this.dvcol = {};
    this.MainData = null;
    this.UniqueId = null;
    this.ebdtable = {};
    this.chartJs = {};
    this.previousObj = null;

    this.init = function () {
        $("#btnGo").off("click").on("click", this.btnGoClick.bind(this));
        $("#next").off("click").on("click", this.gotoNext.bind(this));
        $("#prev").off("click").on("click", this.gotoPrevious.bind(this));
        $("#first").off("click").on("click", this.gotoFirst.bind(this));
        $("#last").off("click").on("click", this.gotoLast.bind(this));
        $("#Save_btn").off("click").on("click", this.saveSettings.bind(this));
        //$("#Related" + this.tableId + " .dropdown-menu li a").off("click").on("click", this.drawDv.bind(this));
        $("#fd_toggle").off("click").on("click", this.ToggleParamDiv.bind(this));
        $("#Settings").off("click").on("click", this.TogglePPGrid.bind(this));
    };


    this.btnGoClick = function () {
        if ($("#" + focusedId).children(".fd").children("#filterBox").length > 0) {
            $("#fd_toggle").css("display", "inline");
            $("#" + focusedId).children(".fd").css("display", "none");
            $("#" + focusedId).children("div:not(.fd)").removeClass("col-md-8").addClass("col-md-10");
        }
        $("#Settings").css("display", "inline");
        $("#Save_btn").css("display", "inline");
        this.UniqueId = "dv" + this.currentObj.EbSid + "_" + counter;
        console.log(this.dvcol[focusedId]);
        if (this.currentObj.$type.indexOf("EbTableVisualization") !== -1) {
            //this.MainData = (dvcontainerObj.currentObj.Pippedfrom !== null) ? dvcontainerObj.previousObj.data : null;
            this.ebdtable[focusedId] = new EbDataTable({
                ds_id: this.currentObj.DataSourceRefId,
                ss_url: this.ssurl,
                tid: this.UniqueId,
                login: this.wc,
                settings: this.currentObj,
                data: this.MainData,
            });

            this.ebdtable[focusedId].getColumnsSuccess(this.currentObj);
        }
        else if (this.currentObj.$type.indexOf("EbChartVisualization") !== -1) {
            //this.UniqueId = "dv" + this.currentObj.EbSid + "_" + counter;
            this.MainData = (dvcontainerObj.currentObj.Pippedfrom !== null && dvcontainerObj.currentObj.Pippedfrom !== "") ? dvcontainerObj.previousObj.data : null;
            this.chartJs[focusedId] = new eb_chart(this.currentObj, this.ssurl, this.MainData, this.UniqueId);
        }
        console.log("xxxxx", this.dvcol[focusedId]);
        console.log("ccccc", dvcontainerObj.currentObj);
    };

    this.gotoNext = function () {
        if ($("#" + focusedId).next().attr("id") == undefined) {
            $("#next").attr("disabled", true).css("color", "darkgray");
            $("#last").attr("disabled", true).css("color", "darkgray");
        }
        else {
            focusedId = $("#" + focusedId).next().attr("id");
            $("#" + focusedId).focus();
            var dvobj = this.dvcol[focusedId];
            dvcontainerObj.previousObj = dvcontainerObj.currentObj;
            dvcontainerObj.currentObj = dvobj;
            if (dvobj.$type.indexOf("EbTableVisualization") !== -1) {
                $("#Toolbar").children(":not(.commonControls)").remove();
                if ($("#" + focusedId).find(".dataTables_scroll").length > 0) {
                    this.ebdtable[focusedId].GenerateButtons();
                }
            }
            else if (dvobj.$type.indexOf("EbChartVisualization") !== -1) {
                $("#Toolbar").children(":not(.commonControls)").remove();
                if ($("#" + focusedId).find("canvas").length > 0) {
                    this.chartJs[focusedId].createButtons();
                }
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
        dvcontainerObj.previousObj = dvcontainerObj.currentObj;
        dvcontainerObj.currentObj = dvobj;
        if (dvobj.$type.indexOf("EbTableVisualization") !== -1) {
            if ($("#" + focusedId).find(".dataTables_scroll").length > 0) {
                $("#Toolbar").children(":not(.commonControls)").remove();
                this.ebdtable[focusedId].GenerateButtons();
            }
        }
        else {
            if ($("#" + focusedId).find("canvas").length > 0) {
                $("#Toolbar").children(":not(.commonControls)").remove();
                this.chartJs[focusedId].createButtons();
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
        dvcontainerObj.previousObj = dvcontainerObj.currentObj;
        dvcontainerObj.currentObj = dvobj;
        if (dvobj.$type.indexOf("EbTableVisualization") !== -1) {
            $("#Toolbar").children(":not(.commonControls)").remove();
            if ($("#" + focusedId).find(".dataTables_scroll").length > 0) {
                this.ebdtable[focusedId].GenerateButtons();
            }
        }
        else if (dvobj.$type.indexOf("EbChartVisualization") !== -1) {
            $("#Toolbar").children(":not(.commonControls)").remove();
            if ($("#" + focusedId).find("canvas").length > 0) {
                this.chartJs[focusedId].createButtons();
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
        dvcontainerObj.previousObj = dvcontainerObj.currentObj;
        dvcontainerObj.currentObj = dvobj;
        if (dvobj.$type.indexOf("EbTableVisualization") !== -1) {
            $("#Toolbar").children(":not(.commonControls)").remove();
            if ($("#" + focusedId).find(".dataTables_scroll").length > 0) {
                this.ebdtable[focusedId].GenerateButtons();
            }
        }
        else if (dvobj.$type.indexOf("EbChartVisualization") !== -1) {
            $("#Toolbar").children(":not(.commonControls)").remove();
            if ($("#" + focusedId).find("canvas").length > 0) {
                this.chartJs[focusedId].createButtons();
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

    this.drawDv = function (e) {
        $.LoadingOverlay("show");
        $.ajax({
            type: "POST",
            url: "../DV/getdv",
            data: { id: $(e.target).attr("data-id"), objtype: $(e.target).attr("objtype") },
            success: function (dvObj) {
                dvObj = JSON.parse(dvObj);
                dvcontainerObj.currentObj = dvObj;
                $.LoadingOverlay("hide");
                if (dvObj.$type.indexOf("EbTableVisualization") !== -1) {
                    pg.setObject(dvObj, AllMetas["EbTableVisualization"]);
                    split.createContentWindow(dvObj.EbSid + "_" + ++counter, "EbTableVisualization");
                    call2dvView(dvObj);
                }
                else if (dvObj.$type.indexOf("EbChartVisualization") !== -1) {
                    pg.setObject(dvObj, AllMetas["EbChartVisualization"]);
                    split.createContentWindow(dvObj.EbSid + "_" + ++counter, "EbChartVisualization");
                    call2dvView(dvObj);
                }
            }
        });
    };

    this.saveSettings = function () {
        $.LoadingOverlay("show");
        if (dvcontainerObj.currentObj.$type.indexOf("EbTableVisualization") !== -1)
            $.post('../Eb_Object/SaveEbObject', { _refid: this.dvRefid, _json: JSON.stringify(dvcontainerObj.currentObj), _rel_obj: "aaa", _tags: "aa"  }, this.saveSuccess.bind(this));
        else
            $.post('../Eb_Object/SaveEbObject', { _refid: this.dvRefid, _json: JSON.stringify(dvcontainerObj.currentObj), _rel_obj: "aaa", _tags: "aaa"  }, this.saveSuccess.bind(this));
    };

    this.saveSuccess = function () {
        alert("Success!!!!!!!");
        $.LoadingOverlay("hide");
    }

    this.ToggleParamDiv = function () {
        $("#" + focusedId).children(".fd").toggle();
        if ($("#" + focusedId).children(".fd").css("display") === "none")
            $("#" + focusedId).children("div:not(.fd)").removeClass("col-md-8").addClass("col-md-10");
        else
            $("#" + focusedId).children("div:not(.fd)").removeClass("col-md-10").addClass("col-md-8");

    };

    this.TogglePPGrid = function () {
        $("#ppgrid").toggle();
        if ($("#ppgrid").css("display") === "none")
            $($("#" + focusedId).children()[2]).removeClass("col-md-10").addClass("col-md-12");
        else
            $($("#" + focusedId).children()[2]).removeClass("col-md-12").addClass("col-md-10");

    };

    this.init();
}