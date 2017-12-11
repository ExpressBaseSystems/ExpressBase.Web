var focusedId;
var DvContainerObj = function (settings) {
    this.ssurl = settings.ss_url;
    this.wc = settings.wc;
    this.dvRefid = settings.refid;
    this.currentObj = settings.dsobj;
    this.ver_num = settings.ver_num;
    this.cur_status = settings.cur_status;
    this.type = settings.type;
    this.tabnum = 0;
    this.dvcol = {};
    this.MainData = null;
    this.UniqueId = null;
    this.ebdtable = {};
    this.chartJs = {};
    this.previousObj = null;
    this.user = settings.user;
    this.previewBody = null;

    this.init = function () {
        $("#btnGo" + counter).off("click").on("click", this.btnGoClick.bind(this));
        $("#next").off("click").on("click", this.gotoNext.bind(this));
        $("#prev").off("click").on("click", this.gotoPrevious.bind(this));
        $("#first").off("click").on("click", this.gotoFirst.bind(this));
        $("#last").off("click").on("click", this.gotoLast.bind(this));
        //$("#Save_btn").off("click").on("click", this.saveSettings.bind(this));
        $("#btnGo" + counter).trigger("click");
        $("#mini").off("click").on("click", this.toggleminimap.bind(this));
    };


    this.btnGoClick = function () {
        $("#prev").css("display", "none");
        $("#next").css("display", "none");
        $("#Save_btn").css("display", "none");

        focusedId = "sub_window_dv" + this.currentObj.EbSid + "_" + this.tabnum + "_" + counter;

        this.MainData = (this.currentObj.Pippedfrom !== null && this.currentObj.Pippedfrom !== "") ? this.previousObj.data : null;

        if (this.currentObj.$type.indexOf("EbTableVisualization") !== -1) {
            this.dvcol[focusedId] = new EbDataTable(
                refid = this.dvRefid,
                ver_num = this.ver_num,
                type = this.type,
                dsobj = this.currentObj,
                cur_status = this.cur_status,
                tabNum = this.tabnum,
                ss_url = this.ssurl,
                //ds_id: this.currentObj.DataSourceRefId,
                //ss_url: this.ssurl,
                //tid: this.UniqueId,
                login = this.wc,
                counter = counter,
                data = this.MainData,
            );
            //refid, ver_num, type, dsobj, cur_status, tabNum, ssurl,
            //this.dvcol[focusedId].getColumnsSuccess(this.currentObj);
        }
        else if (this.currentObj.$type.indexOf("EbChartVisualization") !== -1) {
            this.dvcol[focusedId] = new eb_chart(
                refid = this.dvRefid,
                ver_num = this.ver_num,
                type = this.type,
                dsobj = this.currentObj,
                cur_status = this.cur_status,
                tabNum = this.tabnum,
                ss_url = this.ssurl,
                login = this.wc,
                counter = counter,
                data = this.MainData,
            );
        }
        console.log("xxxxx", this.dvcol[focusedId]);
        //console.log("ccccc", dvcontainerObj.currentObj);
    };

    this.gotoNext = function () {
        if ($("#" + focusedId).next().attr("id") == undefined) {
            $("#next").attr("disabled", true).css("color", "darkgray");
            $("#last").attr("disabled", true).css("color", "darkgray");
        }
        else {
            focusedId = $("#" + focusedId).next().attr("id");
            $("#" + focusedId).focus();
            var dvobj = this.dvcol[focusedId].EbObject;
            dvcontainerObj.previousObj = dvcontainerObj.currentObj;
            dvcontainerObj.currentObj = dvobj;
            if (dvcontainerObj.currentObj.Pippedfrom !== "")
                $("#Pipped").text("Pipped From : " + dvcontainerObj.currentObj.Pippedfrom);
            else
                $("#Pipped").text("");
            if (dvobj.$type.indexOf("EbTableVisualization") !== -1) {
                if ($("#" + focusedId).find(".dataTables_scroll").length > 0) {
                    this.dvcol[focusedId].GenerateButtons();
                }
            }
            else{
                if ($("#" + focusedId).find("canvas").length > 0) {
                    this.dvcol[focusedId].GenerateButtons();
                }
            }
        }
        if ($("#" + focusedId).next().attr("id") == undefined) {
            $("#next").attr("disabled", true).css("color", "darkgray");
            $("#last").attr("disabled", true).css("color", "darkgray");
        }
        if ($("#" + focusedId).prev().attr("id") !== undefined) {
            $("#prev").attr("disabled", false).css("color", "white");
            $("#first").attr("disabled", false).css("color", "white");
        }
    };

    this.gotoPrevious = function () {
        focusedId = $("#" + focusedId).prev().attr("id");
        $("#" + focusedId).focus();
        var dvobj = this.dvcol[focusedId].EbObject;
        dvcontainerObj.previousObj = dvcontainerObj.currentObj;
        dvcontainerObj.currentObj = dvobj;
        if (dvcontainerObj.currentObj.Pippedfrom !== "")
            $("#Pipped").text("Pipped From : " + dvcontainerObj.currentObj.Pippedfrom);
        else
            $("#Pipped").text("");
        if (dvobj.$type.indexOf("EbTableVisualization") !== -1) {
            if ($("#" + focusedId).find(".dataTables_scroll").length > 0) {
                this.dvcol[focusedId].GenerateButtons();
            }
        }
        else {
            if ($("#" + focusedId).find("canvas").length > 0) {
                this.dvcol[focusedId].GenerateButtons();
            }
        }
        if ($("#" + focusedId).prev().attr("id") == undefined) {
            $("#prev").attr("disabled", true).css("color", "darkgray");
            $("#first").attr("disabled", true).css("color", "darkgray");
        }
        if ($("#" + focusedId).next().attr("id") !== undefined) {
            $("#next").attr("disabled", false).css("color", "white");
            $("#last").attr("disabled", false).css("color", "white");
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

   
    this.saveSettings = function () {
        $.LoadingOverlay("show");
        if (dvcontainerObj.currentObj.$type.indexOf("EbTableVisualization") !== -1)
            $.post('../Eb_Object/SaveEbObject', { _refid: this.dvRefid, _json: JSON.stringify(dvcontainerObj.currentObj), _rel_obj: "aaa", _tags: "aa" }, this.saveSuccess.bind(this));
        else
            $.post('../Eb_Object/SaveEbObject', { _refid: this.dvRefid, _json: JSON.stringify(dvcontainerObj.currentObj), _rel_obj: "aaa", _tags: "aaa" }, this.saveSuccess.bind(this));
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

    this.drawDv = function (e) {
        this.dvRefid = $(e.target).attr("data-refid");
        dvcontainerObj.previousObj = dvcontainerObj.currentObj;
        $.LoadingOverlay("show");
        $.ajax({
            type: "POST",
            url: "../DV/getdv",
            data: { refid: this.dvRefid, objtype: $(e.target).attr("objtype") },
            success: function (dvObj) {
                counter++;
                dvObj = JSON.parse(dvObj);
                dvcontainerObj.currentObj = dvObj;
                dvcontainerObj.currentObj.Pippedfrom = dvcontainerObj.previousObj.Name;
                //dvcontainerObj.dvRefid = dvObj.Refid;
                $.LoadingOverlay("hide");
                dvcontainerObj.btnGoClick();
            }
        });
    }.bind(this);

    this.appendRelatedDv = function (tid) {
        $("#obj_icons").prepend("<div class='dropdown' id='Related" + tid +"' style='display: inline-block;padding-top: 1px;'>" +
            "<button class='btn dropdown-toggle' type='button' data-toggle='dropdown'>" +
            "<span class='caret'></span>" +
            "</button>" +
            "<ul class='dropdown-menu'>" +
            "</ul>" +
            "</div>");
        $.ajax({
            type: "POST",
            url: "../DV/getAllRelatedDV",
            data: { refid: this.currentObj.DataSourceRefId },
            success: this.RealtedajaxSuccess.bind(this,tid)
        });
        //$("#Related" + this.tableId + " .dropdown-menu ul")
    };

    this.RealtedajaxSuccess = function (tid, DvList) {
        //var tid = "dv" + this.currentObj.EbSid + "_" + counter;
        $("#Related" + tid + " .dropdown-menu").empty();
        $.each(DvList, function (i, obj) {
            $("#Related" + tid + " .dropdown-menu").append("<li><a href='#' data-refid='" + obj.refId + "' objtype='" + obj.ebObjectType + "'><i class='fa fa-line-chart custom'></i>" + obj.name + "</a></li>");

        });
        $("#Related" + tid + " .dropdown-menu li a").off("click").on("click", this.drawDv.bind(this));
    }.bind(this);

    this.createGoButton = function () {
        $("#obj_icons").empty();
        $("#obj_icons").append(`<button id='btnGo${counter}' class='btn commonControls'><i class="fa fa-play" aria-hidden="true"></i></button>`);
    };

    this.check4Navigation = function () {
        $("#Save_btn").css("display", "inline");
        if (counter >= 1) {
            $("#prev").css("display", "inline-block");
            $("#next").css("display", "inline-block");
            //if (counter > 2) {
            //    $("#first").css("display", "inline-block");
            //    $("#last").css("display", "inline-block");
            //}
        }
    };

    this.toggleminimap = function () {
        $("#MinimapDiv").toggle();
        //if ($("#MinimapDiv").css("display") === "block") {
        //    if (this.previewBody)
        //        this.previewBody = null;
        //    this.previewBody = $('.splitdiv_parent').minimap({
        //        heightRatio: 0.2,
        //        widthRatio: 0.2,
        //        offsetHeightRatio: 0.1,
        //        offsetWidthRatio: 0.02,
        //        position: "left",
        //        touch: true,
        //        smoothScroll: true,
        //        smoothScrollDelay: 200,
        //    });
        //    this.previewBody.show();
        //}
        //else {
        //    if (this.previewBody)
        //        this.previewBody.hide();
        //}
    };

    this.init();
}