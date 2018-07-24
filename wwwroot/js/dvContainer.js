var focusedId;
var prevfocusedId;
var filterChanged = false;
var dvcounter = 0;
var DvContainerObj = function (settings) {
    this.ssurl = settings.ss_url;
    this.wc = settings.wc;
    this.dvRefid = settings.refid;
    this.currentObj = settings.dsobj;
    this.ver_num = settings.ver_num;
    this.cur_status = settings.cur_status;
    this.type = settings.type;
    this.rowData = (settings.rowData !== "" && settings.rowData !== null) ? settings.rowData : null;
    this.filterValues = settings.filterValues;
    this.tabnum = settings.tabnum;
    this.RelatedDvlist = settings.DvList;
    this.TaggedDvlist = settings.DvTagList;
    this.url = settings.url;
    this.dvcol = {};
    this.MainData = null;
    this.UniqueId = null;
    this.ebdtable = {};
    this.chartJs = {};
    this.previousObj = null;
    this.user = settings.user;
    this.previewBody = null;
    this.scrollCounter = 0;
    this.firstWPos = null;
    this.slickApi = null;
    this.nextSlide = null;
    this.tableId = null;
    this.PippedColl = {};
    this.TaggedColl = {};
    this.clickDot = false;
    this.cellData = null;
    this.isExistReport = false;
    this.curTVobj = settings.dsobj;
    //this.PGobj = new Eb_PropertyGrid("pp_inner", "uc");


    this.PGobj = new Eb_PropertyGrid({
        id: "pp_inner",
        wc: "uc",
        cid: this.cid,
        $extCont: $(".ppcont")
    });

    this.stickBtn = new EbStickButton({
        $wraper: $(".filterCont"),
        $extCont: $(".filterCont"),
        icon: "fa-filter",
        dir: "left",
        label: "Parameters",
    });

    this.init = function () {
        $("#btnGo" + counter).off("click").on("click", this.btnGoClick.bind(this));
        $("#next").off("click").on("click", this.gotoNext.bind(this));
        $("#prev").off("click").on("click", this.gotoPrevious.bind(this));
        $("#first").off("click").on("click", this.gotoFirst.bind(this));
        $("#last").off("click").on("click", this.gotoLast.bind(this));
        //$("#Save_btn").off("click").on("click", this.saveSettings.bind(this));
        $("#btnGo" + counter).trigger("click");
        $("#Related_btn").off("click").on("click", this.showOrhideRelateddiv.bind(this));
        //$("#Relateddiv").focusout(function () { $(this).hide();});
    };


    this.btnGoClick = function () {
        $("#prev").hide();
        $("#next").hide();
        $("#Save_btn").hide();
        $("#Related_btn").hide();
        $("#Relateddiv").hide();

        prevfocusedId = focusedId;
        focusedId = "sub_window_dv" + this.currentObj.EbSid + "_" + this.tabnum + "_" + counter;
        if (counter === 0) {
            this.currentObj.Pippedfrom = "";
            prevfocusedId = focusedId;
        }

        this.PippedColl[focusedId] = this.RelatedDvlist;
        this.TaggedColl[focusedId] = this.TaggedDvlist;
        this.MainData = (this.currentObj.Pippedfrom !== null && this.currentObj.Pippedfrom !== "") ? this.previousObj.data : null;

        if (this.currentObj.$type.indexOf("EbTableVisualization") !== -1) {
            this.dvcol[focusedId] = new EbDataTable(
                refid = this.dvRefid,
                ver_num = this.ver_num,
                type = this.type,
                dsobj = this.curTVobj,
                cur_status = this.cur_status,
                tabNum = this.tabnum,
                ss_url = this.ssurl,
                login = this.wc,
                counter = counter,
                data = this.MainData,
                rowData = this.rowData,
                filterValues = this.filterValues,
                url = this.url,
                cellData = this.cellData,
                PGobj = this.PGobj
            );
        }
        else if (this.currentObj.$type.indexOf("EbChartVisualization") !== -1 || this.currentObj.$type.indexOf("EbGoogleMap") !== -1) {
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
                rowData = this.rowData,
                filterValues = this.filterValues,
                cellData = this.cellData,
                PGobj = this.PGobj
            );
        }
        console.log("xxxxx", this.dvcol[focusedId]);
    };

    this.gotoNext = function () {
        this.clickDot = true;
    };

    this.gotoPrevious = function () {
        this.clickDot = true;
    };

    this.gotoFirst = function () {
    };

    this.gotoLast = function () {
    };

    this.saveSettings = function () {
    };

    this.saveSuccess = function () {
    }    

    this.drawDv = function (e) {
        this.rowData = undefined;
        this.filterValues = "";
        $("#Relateddiv").hide();
        $("#ppgrid_" + this.tableId).hide();
        $("#sub_windows_sidediv_" + this.tableId).hide();
        $("#ppgrid_" + this.tableId).parent().css("z-index", "-1");
        this.dvRefid = $(e.target).closest("li").attr("data-refid");
        var dvtype = $(e.target).closest("li").attr("data-dvType");
        var alreadyOpen = false;
        var newmode = false;
        if ($(e.target).parent().attr("data-op") !== undefined)
            newmode = true;
        if (!newmode) {
            $.each(this.dvcol, function (key, value) {
                if (value.Refid === this.dvRefid) {
                    alreadyOpen = true;
                    $('.splitdiv_parent').slick('slickGoTo', $("#" + key).attr("data-slick-index"), false);
                    return false;
                }
            }.bind(this));
        }

        if (!alreadyOpen || newmode) {
            var count = 0;
            $.each(this.dvcol, function (key, value) {
                if (value.Refid === this.dvRefid) {
                    count++;
                }
            }.bind(this));
            dvcontainerObj.previousObj = dvcontainerObj.currentObj;
            $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#parent", Style: { "top": "39px", "margin-left": "-15px" } } });
            $.ajax({
                type: "POST",
                url: "../DV/getdv",
                data: { refid: this.dvRefid, objtype: $(e.target).attr("objtype"), dsrefid: dvcontainerObj.currentObj.DataSourceRefId },
                success: function (dvObj) {
                    counter++;
                    dvcounter++;
                    dvObj = JSON.parse(dvObj);
                    dvcontainerObj.currentObj = dvObj.DsObj;
                    dvcontainerObj.currentObj.Name = (count > 0) ? dvcontainerObj.currentObj.Name + "(" + (count + 1) + ")" : dvcontainerObj.currentObj.Name;
                    this.TaggedDvlist = dvObj.DvTaggedList.$values;
                    if (dvtype === "pipped") {
                        dvcontainerObj.currentObj.Pippedfrom = dvcontainerObj.previousObj.Name;
                        this.RelatedDvlist = this.PippedColl[focusedId];
                    }
                    else
                        this.RelatedDvlist = dvObj.DvList.$values;
                    //this.removeDupliateDV();
                    $("#eb_common_loader").EbLoader("hide");
                    dvcontainerObj.btnGoClick();
                }.bind(this),
            });
        }

    }.bind(this);

    this.drawdvFromTable = function (row, filter, celldata) {
        this.rowData = row;
        this.filterValues = filter;
        this.cellData = celldata;
        var copycelldata = this.cellData.replace(/[^a-zA-Z ]/g, "").replace(/ /g, "_");
        this.dvRefid = dvcontainerObj.dvcol[focusedId].linkDV;
        dvcontainerObj.previousObj = dvcontainerObj.currentObj;

        if (dvcounter === 24) {
            this.ReportExist();
            if (!this.isExistReport) {
                EbMessage("show", { Message: "Max Limit(25) reached. Please close some visualizations....", AutoHide: false, Backgorund: "#f94a41" });
                var __count = focusedId.split("_")[5];
                if (__count === "0")
                    $('.splitdiv_parent').slick('slickGoTo', "1");
            }
            return;
        }

        $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#parent", Style: { "top": "39px", "margin-left": "-15px" } } });
        $("#obj_icons .btn").prop("disabled", true);
        if (this.dvRefid !== null) {
            if (this.dvRefid.split("-")[2] === "3") { 
                if (!$(".dv-body2").hasClass("dv-pdf"))
                    $(".dv-body2").addClass("dv-pdf");
                if ($(`#reportIframe_${copycelldata}`).length === 0) {
                    var obj = new Object();
                    obj.$type = "EbReport";
                    dvcounter++;
                    obj.EbSid = "container_Report" + ++counter;
                    obj.Pippedfrom = "";
                    obj.cellData = this.cellData;
                    obj.Name = "Report";
                    this.currentObj = obj;
                    var id = `${obj.EbSid}_0_${counter}`;
                    focusedId = "sub_window_dv" + obj.EbSid + "_0_" + counter;
                    if ($('.splitdiv_parent').hasClass("slick-slider"))
                        $('.splitdiv_parent').slick('slickAdd', `<div class='sub-windows' id='sub_window_dv${id}' tabindex= '1' style='height: calc(100vh - 60px) !important;'>
                             <div class='split-inner'>
                             <div class='wrapper-cont' id='content_dv' style='width:100%;height:100%;'>
                             <iframe id="reportIframe_${copycelldata}" class="reportIframe" name="reportIframe_${copycelldata}" src='../ReportRender/RenderReport2?refid=${this.dvRefid}&Params=${this.filterValues}'>                              
                            </iframe>
                             </div>
                             </div>
                    </div>`);

                    this.dvcol[focusedId] = new ReportWrapper(obj = obj, refid = this.dvRefid, cellData = this.cellData);

                    $(`#reportIframe_${copycelldata}`).on('load', this.iframeLoad.bind(this));
                }
                else {
                    $.each(this.dvcol, function (key, value) {
                        if (value.EbObject.cellData !== undefined && value.EbObject.cellData === this.cellData)
                            focusedId = key;
                    }.bind(this));
                    $('.splitdiv_parent').slick('slickGoTo', $("#" + focusedId).attr("data-slick-index"));
                    
                    $("#eb_common_loader").EbLoader("hide");
                    $("#obj_icons .btn").prop("disabled", false);
                }
                //$("#" + focusedId).css("width", window.outerWidth);
            }
            else {
                $.ajax({
                    type: "POST",
                    url: "../DV/getdv",
                    data: { refid: this.dvRefid, objtype: this.dvRefid.split("-")[2], dsrefid: dvcontainerObj.currentObj.DataSourceRefId },
                    success: function (dvObj) {
                        counter++;
                        dvcounter++;
                        dvObj = JSON.parse(dvObj);
                        dvcontainerObj.currentObj = dvObj.DsObj;
                        this.curTVobj = dvObj.DsObj;
                        this.TaggedDvlist = dvObj.DvTaggedList.$values;
                        if (dvObj.DvList.$values.length > 0) {
                            this.RelatedDvlist = dvObj.DvList.$values;
                        }
                        //this.removeDupliateDV();
                        $("#eb_common_loader").EbLoader("hide");
                        $("#obj_icons .btn").prop("disabled", false);
                        dvcontainerObj.btnGoClick();
                    }.bind(this),
                });
            }
        }
        else {
            counter++;
            dvcounter++;
            dvcontainerObj.currentObj = new EbObjects["EbGoogleMap"]("Container_" + Date.now());
            dvcontainerObj.currentObj.Columns = dvcontainerObj.previousObj.Columns;
            dvcontainerObj.currentObj.DSColumns = dvcontainerObj.previousObj.DSColumns;
            dvcontainerObj.currentObj.DataSourceRefId = dvcontainerObj.previousObj.DataSourceRefId;
            dvcontainerObj.btnGoClick();
        }
    };

    this.iframeLoad = function () {
        $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#parent", Style: { "top": "39px", "margin-left": "-15px" } }, maskLoader: false });
        $("#obj_icons").hide();
        $("#Common_obj_icons").show();
        $("#Common_obj_icons").empty();
        $("#Common_obj_icons").append(` <button id='Close_btn${focusedId}' class='btn'><i class="fa fa-close" aria-hidden="true"></i></button>`);
        this.eventBind();
        this.modifyNavigation();
        $("#eb_common_loader").EbLoader("hide");
    };

    this.ReportExist = function () {
        var copycelldata = this.cellData.replace(/[^a-zA-Z ]/g, "").replace(/ /g, "_");
        if ($(`#reportIframe_${copycelldata}`).length === 1) {
            $.each(this.dvcol, function (key, value) {
                if (value.EbObject.cellData !== undefined && value.EbObject.cellData === this.cellData)
                    focusedId = key;
            }.bind(this));
            this.isExistReport = true;
            $('.splitdiv_parent').slick('slickGoTo', $("#" + focusedId).attr("data-slick-index"));
        }
        else
            this.isExistReport = false;
    }

    this.xx = function () {
        var Obj = {};
        Obj.refid = this.dvRefid;
        Obj.Params = JSON.parse(this.filterValues);
        return Obj;
    };

    this.removeDupliateDV = function () {
        //$.each(this.PippedColl[focusedId], function (i, obj) {
        //    this.PippedColl[focusedId] = $.grep(this.PippedColl[focusedId], function (TObj) { return TObj.Name !== obj.Name });
        //}.bind(this));

        //$.each(this.TaggedColl[focusedId], function (i, obj) {
        //    this.TaggedColl[focusedId] = $.grep(this.TaggedColl[focusedId], function (TObj) { return TObj.Name !== obj.Name });
        //}.bind(this));

        $.each(this.PippedColl[focusedId], function (i, obj) {
            this.TaggedColl[focusedId] = $.grep(this.TaggedColl[focusedId], function (TObj) { return TObj.RefId !== obj.RefId || TObj.Name !== obj.Name });
            //$.each(this.TaggedDvlist, function (j, Tobj) {
            //    if (Tobj.RefId === obj.RefId)
            //        this.TaggedDvlist.splice(j,1);
            //}.bind(this));
        }.bind(this));
    }.bind(this);

    this.appendRelatedDv = function (tid) {
        //$("#obj_icons").prepend("<div class='dropdown' id='Related" + tid +"' style='display: inline-block;padding-top: 1px;'>" +
        //    "<button class='btn dropdown-toggle' type='button' data-toggle='dropdown'>" +
        //    "<span class='caret'></span>" +
        //    "</button>" +
        //    "<ul class='dropdown-menu'>" +
        //    "</ul>" +
        //    "</div>");
        //$.ajax({
        //    type: "POST",
        //    url: "../DV/getAllRelatedDV",
        //    data: { refid: this.currentObj.DataSourceRefId },
        //    success: this.RealtedajaxSuccess.bind(this,tid)
        //});
        this.RealtedajaxSuccess(tid);
    };

    this.RealtedajaxSuccess = function (tid) {// + tid + " .dropdown-menu"
        //$("#Relateddiv").empty();
        this.removeDupliateDV();
        this.tableId = tid;
        $("#relatedPipableDiv .relatedBody").empty();
        //$("#relatedStartDiv .relatedBody").empty();
        $("#relatedTagedDiv .relatedBody").empty();
        $.each(this.PippedColl[focusedId], function (i, obj) {
            var $icon = "";
            if (obj.EbObjectType === EbObjectTypes.ChartVisualization)
                $icon = "<i class='fa fa-line-chart custom'></i>";
            else
                $icon = "<i class='fa fa-table custom'></i>";
            if (this.dvRefid === obj.RefId) {
                $("#relatedCurrentDiv .relatedBody").empty();
                $("#relatedCurrentDiv .relatedBody").append("<li class='relatedli'  data-refid='" + obj.RefId + "' objtype='" + obj.EbObjectType + "'><a href='#' style='color:black;'>" + $icon + "<label class='relatedlabel'>" + this.currentObj.Name + "</label></a></li>");
                //if (counter === 0) {
                //    $("#relatedStartDiv .relatedBody").append("<li style='display:inline-flex;' class='relatedli'  data-refid='" + obj.RefId + "' objtype='" + obj.EbObjectType + "'><a href='#' style='color:black;'>" + $icon + "<label class='relatedlabel'>" + obj.Name + "</label></a><label style='font-size:10px;margin-left:5px;margin-top:5px;'>(Default)</label></li>");
                //    //$("#relatedStartDiv").hide();
                //}
            }
            else {
                var $xx = "", count = 0;
                $.each(this.dvcol, function (key, value) {
                    if (value.Refid === obj.RefId) {
                        count++;
                        $xx = `<div class="relatedIcon"><i class="fa fa-pencil" aria-hidden="true"></i></div><div class="relatedIcon" data-op="new"><i class="fa fa-plus" aria-hidden="true"></i></div>`;
                    }
                });
                if (count > 1)
                    $xx = `<div class="relatedIcon"><i class="fa fa-pencil" aria-hidden="true"></i>(${count})</div><div class="relatedIcon" data-op="new"><i class="fa fa-plus" aria-hidden="true"></i></div>`;
                $("#relatedPipableDiv .relatedBody").append("<li class='relatedli'  data-dvType='pipped' data-refid='" + obj.RefId + "' objtype='" + obj.EbObjectType + "'><a href='#' style='color:black;'>" + $icon + "<label class='relatedlabel'>" + obj.Name + "</label></a>" + $xx + "</li>");
            }
            //$("#relatedStartDiv").show();
        }.bind(this));

        $.each(this.TaggedColl[focusedId], function (i, obj) {
            var $icon = "";
            if (obj.EbObjectType === EbObjectTypes.ChartVisualization)
                $icon = "<i class='fa fa-line-chart custom'></i>";
            else
                $icon = "<i class='fa fa-table custom'></i>";

            var $xx = "", count = 0;
            $.each(this.dvcol, function (key, value) {
                if (value.Refid === obj.RefId) {
                    count++;
                    $xx = `<div class="relatedIcon"><i class="fa fa-pencil" aria-hidden="true"></i></div><div class="relatedIcon" data-op="new"><i class="fa fa-plus" aria-hidden="true"></i></div>`;
                }
            });
            if (count > 1)
                $xx = `<div class="relatedIcon"><i class="fa fa-pencil" aria-hidden="true"></i>(${count})</div><div class="relatedIcon" data-op="new"><i class="fa fa-plus" aria-hidden="true"></i></div>`;
            $("#relatedTagedDiv .relatedBody").append("<li class='relatedli'  data-dvType='tagged' data-refid='" + obj.RefId + "' objtype='" + obj.EbObjectType + "'><a href='#' style='color:black;'>" + $icon + "<label class='relatedlabel'>" + obj.Name + "</label></a>" + $xx + "</li>");
            //$("#relatedStartDiv").show();
        }.bind(this));

        $("#Relateddiv li").off("click").on("click", this.drawDv.bind(this));
        $("#Relateddiv .relatedBody").each(function (i, obj) {
            if ($(this).children().length === 0)
                $(this).parent().hide();
            else
                $(this).parent().show();
        });
        //if (focusedId === Object.keys(this.dvcol)[0]) 
        //    $("#relatedStartDiv").hide();
    };

    this.createGoButton = function () {
        $("#obj_icons").empty();
        $("#obj_icons").append(`<button id='btnGo${counter}' class='btn commonControls'><i class="fa fa-play" aria-hidden="true"></i></button>`);
    };

    //this.check4Navigation = function () {
    //    $("#Save_btn").css("display", "inline");
    //    if (counter >= 1) {
    //        $("#prev").show();
    //        $("#next").show();
    //        $("#next").attr("disabled", true);
    //    }
    //};

    this.modifyNavigation = function () {
        this.modifydivDots();
        if (!this.clickDot) {
            $("#Save_btn").show();
            $("#Related_btn").show();
            //if (counter >= 1) {
            $("#prev").show();
            $("#next").show();
            $("#divDots").show();
            $(".miniregion").remove();
            $(".minimap").remove();
            //this.slickApi = null;
            //if (this.slickApi === null) {
            if (!$('.splitdiv_parent').hasClass("slick-slider")) {
                this.slickApi = $('.splitdiv_parent').slick({
                    slidesToShow: 1,
                    infinite: false,
                    draggable: false,
                    speed: 800,
                    cssEase: 'ease-in',
                    //arrows: false,
                    //dots: true,
                    prevArrow: "<i class='pull-left fa fa-angle-left ' aria-hidden='true'></i>",
                    nextArrow: "<i class='pull-right fa fa-angle-right' style='right: 15px;' aria-hidden='true'></i>"
                    //prevArrow: $("#prev"),
                    //nextArrow: $("#next")
                });
                //$('.splitdiv_parent').prepend(`<div id='divDots' class='dotsDiv'><div class='dotstable'></div></div>`);
                $('.splitdiv_parent').on('afterChange', this.focusChanged.bind(this));
                $('.splitdiv_parent').slick('slickGoTo', $("#" + focusedId).attr("data-slick-index"), true);
            }
            else {
                this.clickDot = true;
                $('.splitdiv_parent').slick('slickGoTo', $("#" + focusedId).attr("data-slick-index"), true);
            }
            //}
            //else {
            //    if ($('.splitdiv_parent').children().find("#" + focusedId).length === 0) {
            //        $('.splitdiv_parent').slick('slickAdd', $("#" + focusedId));
            //        $('.splitdiv_parent').slick('slickGoTo', counter, true);
            //    }
            //}
        }
        //this.modifydivDots();
        //}

        
    }

    this.focusChanged = function (event, slick, currentSlide, nextSlide) {
        $("#Relateddiv").hide();
        //$(".ppcont").hide();
        $(".filterCont").hide();
        if (focusedId !== $("[data-slick-index='" + currentSlide + "']").attr("id")) {
            focusedId = $("[data-slick-index='" + currentSlide + "']").attr("id");
            var __count = focusedId.split("_")[5];
            $("#" + focusedId).focus();
            var dvobj = this.dvcol[focusedId].EbObject;
            this.dvRefid = this.dvcol[focusedId].Refid;
            dvcontainerObj.previousObj = dvcontainerObj.currentObj;
            dvcontainerObj.currentObj = dvobj;
            this.curTVobj = dvobj;
            if (dvcontainerObj.currentObj.Pippedfrom !== "")
                $("#Pipped").text("Pipped From : " + dvcontainerObj.currentObj.Pippedfrom);
            else
                $("#Pipped").text("");
            if (dvobj.$type.indexOf("EbTableVisualization") !== -1) {
                if ($("#" + focusedId).find(".dataTables_scroll").length > 0) {
                    this.PGobj.setObject(this.curTVobj, AllMetas["EbTableVisualization"]);
                    this.dvcol[focusedId].GenerateButtons();
                    $("#Common_obj_icons").hide();
                    $("#obj_icons").show();
                    $(".stickBtn").show();
                    if (__count !== "0") {
                        $("#obj_icons").append(` <button id='Close_btn${focusedId}' class='btn'><i class="fa fa-close" aria-hidden="true"></i></button>`);
                        this.eventBind();
                    }
                }
                $(".dv-body2").removeClass("dv-pdf");
                //this.dvcol[focusedId].Api.draw();
            }
            else if (dvobj.$type.indexOf("EbChartVisualization") !== -1 || dvobj.$type.indexOf("EbGoogleMap") !== -1) {
                if ($("#" + focusedId).find("canvas").length > 0 || $("#" + focusedId).find(".gm-style").length > 0) {
                    this.dvcol[focusedId].GenerateButtons();
                }
                $(".dv-body2").removeClass("dv-pdf");
            }
            else {
                $(".stickBtn").hide();
                $("#obj_icons").hide();
                $("#Common_obj_icons").show();
                $("#Common_obj_icons").empty();
                $("#Common_obj_icons").append(` <button id='Close_btn${focusedId}' class='btn'><i class="fa fa-close" aria-hidden="true"></i></button>`);
                this.eventBind();
                if (!$(".dv-body2").hasClass("dv-pdf"))
                    $(".dv-body2").addClass("dv-pdf");
            }
        }
        else {
            var dvobj = this.dvcol[focusedId].EbObject;

            this.dvRefid = this.dvcol[focusedId].Refid;
            dvcontainerObj.previousObj = dvcontainerObj.currentObj;
            dvcontainerObj.currentObj = dvobj;
            this.curTVobj = dvobj;

            var __count = focusedId.split("_")[5];
            if (dvobj.$type.indexOf("EbTableVisualization") !== -1) {
                if ($("#" + focusedId).find(".dataTables_scroll").length > 0) {
                    this.PGobj.setObject(this.curTVobj, AllMetas["EbTableVisualization"]);
                    this.dvcol[focusedId].GenerateButtons();
                    $("#Common_obj_icons").hide();
                    $("#obj_icons").show();
                    $(".stickBtn").show();
                    if (__count !== "0") {
                        $("#obj_icons").append(` <button id='Close_btn${focusedId}' class='btn'><i class="fa fa-close" aria-hidden="true"></i></button>`);
                        this.eventBind();
                    }                    
                }
                $(".dv-body2").removeClass("dv-pdf");
            }
            else if (dvobj.$type.indexOf("EbChartVisualization") !== -1 || dvobj.$type.indexOf("EbGoogleMap") !== -1) {
                if ($("#" + focusedId).find("canvas").length > 0 || $("#" + focusedId).find(".gm-style").length > 0) {
                    this.dvcol[focusedId].GenerateButtons();
                }
            }
            else {
                $(".stickBtn").hide();
                $("#obj_icons").hide();
                $("#Common_obj_icons").show();
                $("#Common_obj_icons").empty();
                $("#Common_obj_icons").append(` <button id='Close_btn${focusedId}' class='btn'><i class="fa fa-close" aria-hidden="true"></i></button>`);
                this.eventBind();
            }
        }
        if (this.dvcol[focusedId].cellData !== null && this.dvcol[focusedId].cellData !== "")
            $("#objname").text(this.dvcol[focusedId].EbObject.Name + " - " + this.dvcol[focusedId].cellData);
        else
            $("#objname").text(this.dvcol[focusedId].EbObject.Name);
        this.focusDot();
    };
    this.pgChanged = function (obj, Pname, CurDTobj) {
        if (obj.$type.indexOf("EbTableVisualization") !== -1) {
            CurDTobj.isSecondTime = true;
            //CurDTobj.EbObject = obj;
            if (CurDTobj.login == "dc")
                commonO.Current_obj = obj;
            else
                dvcontainerObj.currentObj = obj;
            if (Pname == "DataSourceRefId") {
                if (obj[Pname] !== null) {
                    CurDTobj.PcFlag = "True";
                    CurDTobj.EbObject.Columns.$values = [];
                    CurDTobj.EbObject.DSColumns.$values = [];
                    CurDTobj.call2FD();
                }
            }
            else if (Pname == "Name") {
                $("#objname").text(obj.Name);
                console.log(obj);
            }
            else if (Pname == "Columns") {
                console.log(obj);
            }
        }
        else if (obj.$type.indexOf("EbChartVisualization") !== -1) {
            CurDTobj.tmpPropertyChanged(obj, Pname);
        }
    };

    this.PGobj.PropertyChanged = function (obj, Pname) {
        this.pgChanged(obj, Pname, this.dvcol[focusedId]);
    }.bind(this);

    this.modifydivDots = function () {
        $(".dotstable").empty();
        var firstKey = Object.keys(this.dvcol)[0];
        $.each(this.dvcol, function (key, obj) {
            //if (!this.clickDot) {
            if (obj.EbObject.Pippedfrom !== "") {
                var parent;
                $.each(this.dvcol, function (key1, obj1) {
                    if (obj.EbObject.Pippedfrom === obj1.EbObject.Name) {
                        parent = key1;
                        return false;
                    }
                });
                //parent = $.grep(this.dvcol, function (key1, obj1) { if (obj.EbObject.Pippedfrom === obj1.EbObject.Name) return key1 });
                if (obj.EbObject.$type.indexOf("EbChartVisualization") !== -1 || obj.EbObject.$type.indexOf("EbGoogleMap") !== -1) {
                    $("[data-mapid=" + parent + "]").after(`<div class='dottool'><img src="../images/svg/pipe.svg" style="height: 40px;"></div><div class='dot dottool' data-mapid='${key}'><a href="#"><i class="fa fa-bar-chart fa-lg" aria-hidden="true" style='color:black;'></i></a></div>`);
                }
                else {
                    $("[data-mapid=" + parent + "]").after(`<div class='dottool'><img src="../images/svg/pipe.svg" style="height: 40px;"></div><div class='dot dottool' data-mapid='${key}'><a href="#"><i class="fa fa-table fa-lg" aria-hidden="true" style='color:black;'></i></a></div>`);
                }
            }
            else {
                //if (counter === 0) {
                if (obj.EbObject.$type.indexOf("EbChartVisualization") !== -1 || obj.EbObject.$type.indexOf("EbGoogleMap") !== -1) {
                    $(".dotstable").append(`<div class='dot dottool' data-mapid='${key}'><a href="#"><i class="fa fa-bar-chart fa-lg" aria-hidden="true" style='color:black;'></i></a></div>`);
                }
                else if (obj.EbObject.$type.indexOf("EbTableVisualization") !== -1) {
                    $(".dotstable").append(`<div class='dot dottool' data-mapid='${key}'><a href="#"><i class="fa fa-table fa-lg" aria-hidden="true" style='color:black;'></i></a></div>`);
                }
                else {
                    $(".dotstable").append(`<div class='dot dottool' data-mapid='${key}'><a href="#"><i class="fa fa-file-pdf-o" aria-hidden="true" style='color:black;'></i></a></div>`);
                }
                //}
                //else {
                //    if (this.dvcol[focusedId].EbObject.$type.indexOf("EbChartVisualization") !== -1 || this.dvcol[focusedId].EbObject.$type.indexOf("EbGoogleMap") !== -1) {
                //        $("[data-mapid=" + prevfocusedId + "]").after(`<div class='dot dottool' data-mapid='${focusedId}'><a href="#"><i class="fa fa-bar-chart fa-lg" aria-hidden="true" style='color:black;'></i></a></div>`);
                //    }
                //    else {
                //        $("[data-mapid=" + prevfocusedId + "]").after(`<div class='dot dottool' data-mapid='${focusedId}'><a href="#"><i class="fa fa-table fa-lg" aria-hidden="true" style='color:black;'></i></a></div>`);
                //    }


                //}
                //if (obj.isContextual)
                if (firstKey !== key)
                    $(".dotstable .dot[data-mapid=" + key + "]").css("margin-left", "12px");
            }
            //}
        }.bind(this));

        this.clickDot = false;
        $(".dot").off("click").on("click", this.focus2ClickedDot);
        $(".dot").popover({
            title: 'Name',
            html: true,
            content: function () {
                return `<div id='dotsDetail'>
                        <div class="dotsnapshot"></div>                      
                    </div>`;
            },
            placement: 'bottom'
        });
        $(".dot").off("mouseenter").on("mouseenter", this.dotOnHover);
        $(".dot").off("mouseleave").on("mouseleave", this.dotOffHover);
        this.focusDot();
        //if (filterChanged)
        //    this.rearrangeSubwindow();
    }

    this.focusDot = function () {
        $(".dot").each(function (i, obj) {
            if ($(obj).attr("data-mapid") === focusedId) {
                $(this).find("i").css("color", "#1a00f3").css("text-decoration", "underline");
            }
            else {
                $(this).find("i").css("color", "#333").css("text-decoration", "inherit");
            }
        });

        if ($("#prev").hasClass("slick-disabled"))
            $("#prev").attr("disabled", true);
        else
            $("#prev").attr("disabled", false);

        if ($("#next").hasClass("slick-disabled"))
            $("#next").attr("disabled", true);
        else
            $("#next").attr("disabled", false);
    }

    this.focus2ClickedDot = function (e) {
        this.clickDot = true;
        var id = $(e.target).closest("div").attr("data-mapid");
        var lastChar = id.split("_");
        $('.splitdiv_parent').slick('slickGoTo', $("#" + id).attr("data-slick-index"), false);
    }.bind(this);

    this.dotOnHover = function (e) {
        var curdiv = $(e.target).closest("div");
        var id = curdiv.attr("data-mapid");
        var dvObj = this.dvcol[id];
        var lastChar = id.substr(id.length - 1);
        var temp = id.substring(11);
        $(".dot").popover('show');
        $('.dot').not(curdiv).popover('hide');
        curdiv.next().children(".popover-title").text(dvObj.EbObject.Name);
        $(".popover-title").css("text-align", "center");
        if (dvObj.EbObject.$type.indexOf("EbTableVisualization") !== -1) {
            curdiv.next().children().find(".dotsnapshot").empty();
            curdiv.next().children().find(".dotsnapshot").append(`<div id="copydiv_${temp}" style="width:200px;"></div>`);
            $("#copydiv_" + temp).append(`<img src="../images/table.png" style='width:inherit;'>`);
        }
        else {
            if (dvObj.EbObject.$type.indexOf("EbGoogleMap") !== -1) {
                curdiv.next().children().find(".dotsnapshot").empty();
                curdiv.next().children().find(".dotsnapshot").append(`<div id="copydiv_${temp}" style="width:200px;"></div>`);
                html2canvas($("#map" + temp), {
                    useCORS: true,
                    onrendered: function (canvas) {
                        theCanvas = canvas;
                        //document.body.appendChild(canvas);
                        //Canvas2Image.saveAsPNG(canvas);
                        $("#copydiv_" + temp).append(canvas);
                        $("#copydiv_" + temp).children().css("width", "inherit");
                        //document.body.removeChild(canvas);
                    }
                });
            }
            else if (dvObj.EbObject.$type.indexOf("EbChartVisualization") !== -1) {
                var canvas = document.getElementById('myChart' + temp);
                var image = new Image();
                image.id = "pic"
                image.src = canvas.toDataURL();
                image.style.width = "inherit";
                curdiv.next().children().find(".dotsnapshot").empty();
                curdiv.next().children().find(".dotsnapshot").append(`<div id="copydiv_${temp}" style="width:200px;"></div>`);
                $("#copydiv_" + temp).append(image);
            }
            else {
                curdiv.next().children(".popover-title").text("Report-"+dvObj.EbObject.cellData);
                curdiv.next().children().find(".dotsnapshot").empty();
                curdiv.next().children().find(".dotsnapshot").append(`<div id="copydiv_${temp}" style="width:200px;"></div>`);
                $("#copydiv_" + temp).append(`<img src="../images/pdf.png" style='width:inherit;'>`);
            }
        }
        curdiv.next().css("left", e.pageX - curdiv.next().width() / 2);
    }.bind(this);

    this.dotOffHover = function (e) {
        $(".dot").popover('hide');
    }.bind(this);

    this.showOrhideRelateddiv = function () {
        $("#Relateddiv").toggle();
    }

    this.rearrangeSubwindow = function () {
        if ($('.splitdiv_parent').hasClass("slick-slider"))
            $('.splitdiv_parent').slick('unslick');
        var removedElem = [];
        $.each($(".splitdiv_parent ").children(), function (i, sub) {
            removedElem.push(sub);
        });
        $(".splitdiv_parent ").empty();
        $.each($(".dotstable").children(), function (i, dot) {
            var id = $(dot).attr("data-mapid");
            var html = $.grep(removedElem, function (sub) { if ($(sub).attr("id") === id) return $(sub); });
            $(".splitdiv_parent ").append(html);
        });
        filterChanged = false;
    };

    this.eventBind = function () {
        $(`#Close_btn${focusedId}`).off("click").on("click", this.removeSlide.bind(this));
    };

    this.removeSlide = function () {
        dvcounter--;
        var index = $("#" + focusedId).attr("data-slick-index")
        $('.splitdiv_parent').slick('slickRemove', $("#" + focusedId).attr("data-slick-index"));
        delete this.dvcol[focusedId];
        //focusedId = $(`[data-slick-index=${index-1}]`).attr("id");
        $('.splitdiv_parent').slick('slickGoTo', (index - 1), true);
        this.modifyNavigation();
        $.each($(".slick-track").children(), function (i, sub) {
            $(sub).attr("data-slick-index",i);
        });
        
    }

    this.init();
}