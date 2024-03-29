﻿var RbCommon = function (RbMainObj) {
    this.RbObj = RbMainObj;
    var _hasSummary = ["EbDataFieldNumeric", "EbCalcField", "EbDataFieldBoolean", "EbDataFieldText", "EbDataFieldDateTime"];
    var $funcselect = $("#summarry-editor-modal-container #summary-func").empty();
    var $sectionselect = $("#summarry-editor-modal-container #summary-sections").empty();
    var fields = $("#summarry-editor-modal-container #summary-fieldname").empty();
    var $summModal = $("#summarry-editor-modal-container");
    var EbParams = {
        Icons: {
            "Numeric": "fa-sort-numeric-asc",
            "String": "fa-font",
            "DateTime": "fa-calendar",
            "Bool": ""
        },
        EbType: {
            "Numeric": "ParamNumeric",
            "String": "ParamText",
            "DateTime": "ParamDateTime",
            "Bool": "ParamBoolean"
        }
    };

    this.subSecCounter = {
        Countrpthead: 1,
        Countpghead: 1,
        Countdetail: 1,
        Countpgfooter: 1,
        Countrptfooter: 1
    };

    this.RbObjProps = ["ReportHeaders", "ReportFooters", "PageHeaders", "PageFooters", "Detail", "ReportGroups"];

    this.EbObjectSections = ["ReportHeader", "PageHeader", "ReportDetail", "PageFooter", "ReportFooter"];

    this.msBoxSubNotation = {
        ReportHeader: { Notation: 'Rh', Counter: 0 },
        PageHeader: { Notation: 'Ph', Counter: 0 },
        ReportDetail: { Notation: 'Dt', Counter: 0 },
        PageFooter: { Notation: 'Pf', Counter: 0 },
        ReportFooter: { Notation: 'Rf', Counter: 0 }
    };

    this.pages = {
        0: {
            width: 1191,
            height: 1684
        },//A2
        1: {
            width: 841.8898,
            height: 1190.55
        },//A3
        2: {
            width: 595.276,
            height: 841.8898
        },//A4      
        3: {
            width: 419.5276,
            height: 595.276
        },//A5 
        4: {
            width: 612,
            height: 792
        },//letter
    };
    this.EbRuler = {
        px: {
            minor: "tickMinor",
            major: "tickMajor",
            label: "tickLabel",
            len: 5
        },
        cm: {
            minor: "tickMinor-cm",
            major: "tickMajor-cm",
            label: "tickLabel-cm",
            len: 3.77
        },
        inch: {
            minor: "tickMinor-inch",
            major: "tickMajor-inch",
            label: "tickLabel-inch",
            len: 9.6
        }
    };

    this.TextAlign = {
        0: "left",
        2: "right",
        1: "center",
        3: "justify"
    };

    this.GenUniqName = function (ctrl_name) {
        return ctrl_name + "_" + Math.floor(Date.now() / 1000);
    };

    this.setMarginOnedit = function (margin) {
        $(".track_line_vert1").css("left", this.RbObj.repExtern.convertPointToPixel(margin.Left));
        this.RbObj.margin.Left = $(".track_line_vert1").position().left;
        $(".track_line_vert2").css("left", parseFloat(this.RbObj.width) - this.RbObj.repExtern.convertPointToPixel(margin.Right));
        this.RbObj.margin.Right = $(".track_line_vert2").position().left;
        $(".pageHeaders").css({ "padding-left": $(".track_line_vert1").position().left, "padding-right": parseFloat(this.RbObj.width) - $(".track_line_vert2").position().left });
    };

    this.onTrackerStop = function (e, ui) {
        var $t = $(ui.helper);
        if ($t.hasClass("track_line_vert1")) {
            $(".pageHeaders").css("padding-left", $t.position().left);
            this.RbObj.margin.Left = $t.position().left;
        }
        else {
            $(".pageHeaders").css("padding-right", parseFloat(this.RbObj.width) - $t.position().left);
            this.RbObj.margin.Right = $t.position().left;
        }
    };

    this.windowscroll = function () {
        var $layer = null;
        if ($(".page-reportLayer").is(":visible"))
            $layer = ".page-reportLayer";
        else
            $layer = ".page";
        $(".tracker_drag").css({ "height": ($($layer).height() - $(window).scrollTop()) + 20, "top": $(window).scrollTop() });
    };//need to remove

    this.getsummaryfns = function (eb_type) {//neeed to change
        var fn = null;
        if (eb_type === "EbDataFieldText" || eb_type === "Text")
            fn = "SummaryFunctionsText";
        else if (eb_type === "EbDataFieldDateTime" || eb_type === "DateTime")
            fn = "SummaryFunctionsDateTime";
        else if (eb_type === "EbDataFieldBoolean" || eb_type === "Boolean")
            fn = "SummaryFunctionsBoolean";
        else if (eb_type === "EbDataFieldNumeric" || eb_type === "Numeric")
            fn = "SummaryFunctionsNumeric";
        return EbEnums[fn];
    };

    this.getSectionToAddSum = function () {
        var objlist = [];
        $("#ReportDetail0").parent().nextAll().not("#ReportDetail").each(function (i, obj) {
            $(obj).children().each(function (j, sections) {
                objlist.push($(sections));
            });
        });
        return objlist;
    };

    this.ValidateCalcExpression = function (obj) {
        $.ajax({
            url: "../RB/ValidateCalcExpression",
            type: "POST",
            cache: false,
            data: {
                refid: this.RbObj.EbObject.DataSourceRefId,
                expression: atob(obj.ValExpression.Code)
            },
            success: function (result) {
                this.setCalcFieldType(obj, JSON.parse(result));
            }.bind(this)
        });
    };

    this.setCalcFieldType = function (obj, result) {
        obj.CalcFieldIntType = result.Type;
        if (result.Type === 16)
            obj.CalcFieldType = "Text";
        else if (result.Type === 7 || result.Type === 8 || result.Type === 10 || result.Type === 11 || result.Type === 12 || result.Type === 21)
            obj.CalcFieldType = "Numeric";
        else if (result.Type === 3)
            obj.CalcFieldType = "Boolean";
        else if (result.Typee === 5 || result.Type === 6 || result.Type === 17 || result.Type === 26)
            obj.CalcFieldType = "DateTime";

        this.RbObj.RefreshControl(obj);
    };

    this.newCalcFieldSum = function () {
        $("#eb_calcF_summarry").modal("toggle");
        $("#calcF_submit").off("click").on("click", this.addCalcField.bind(this));
    };

    this.addCalcField = function () {
        var name = $("#calcF_name").val().trim();
        var vexp = $("#calcF_valueExpr").val().trim();
        var Objid = "CalcField" + (this.RbObj.idCounter["CalcFieldCounter"])++;
        var obj = new EbObjects["EbCalcField"](Objid);
        $("#ReportDetail0").append(obj.$Control.outerHTML());
        obj.ValExpression.Code = btoa(vexp);
        obj.Name = name || Objid;
        obj.Title = name || Objid;
        this.RbObj.objCollection[Objid] = obj;
        this.RbObj.RefreshControl(obj);
        $("#eb_calcF_summarry").modal("toggle");
        if (obj.ValExpression.Code)
            this.ValidateCalcExpression(obj);//returns the type of expression
        $("#calcFields ul[id='calcfields-childul']").append(`<li class='styl'><div tabindex='1' $(this).focus(); class='textval' EbSid="${obj.EbSid}">
            ${obj.Name}</div></li>`);
    };

    this.addSummarry = function () {
        $summModal.modal("toggle");
        var sections = this.getSectionToAddSum();
        $sectionselect.empty(); fields.empty();
        for (var ite in this.RbObj.objCollection) {
            var t = this.RbObj.objCollection[ite].$type.split(",")[0].split(".").pop();
            if (_hasSummary.indexOf(t) >= 0) {
                fields.append(`<option eb-type="${t}"
                value="${this.RbObj.objCollection[ite].Name}" EbSid="${this.RbObj.objCollection[ite].EbSid}">${this.RbObj.objCollection[ite].Title}</option>`);
            }
        }
        for (var i = 0; i < sections.length; i++) {
            $sectionselect.append(`<option 
                value="#${sections[i].attr("id")}">${sections[i].attr("eb-type") + sections[i].attr("id").slice(-1)}</option>`);
        }
        fields.off("change").on("change", function (e) {
            $funcselect.empty();
            var obj = this.RbObj.objCollection[$(e.target).find('option:selected').attr("EbSid")];
            var t = obj.$type.split(",")[0].split(".").pop() === "EbCalcField" ? obj.CalcFieldType : obj.$type.split(",")[0].split(".").pop();
            var summaryFunc = this.getsummaryfns(t);//object
            for (var func in summaryFunc) {
                $funcselect.append(`<option 
               value="${func}">${func}</option>`);
            }
        }.bind(this));
        $("#submit-summary").off("click").on("click", this.appendSummaryField.bind(this));
        fields.trigger("change");
    };

    this.appendSummaryField = function (e) {
        $summModal.modal("toggle");
        var cft = $("#" + fields.find('option:selected').attr("EbSid")).attr("cftype") || "";
        var type = $("#" + fields.find('option:selected').attr("EbSid")).attr("eb-type") + cft;
        var Objid = type + "Summary" + this.RbObj.idCounter[type + "SummaryCounter"]++;
        var obj = new EbObjects["Eb" + type + "Summary"](Objid);
        $($sectionselect.val()).append(obj.$Control.outerHTML());
        obj.SummaryOf = fields.val();
        obj.Name = Objid;
        obj.Title = $funcselect.val() + "_" + fields.find('option:selected').text();
        obj.Function = $funcselect.val();
        obj.Left = this.RbObj.objCollection[fields.find('option:selected').attr("EbSid")].Left;
        this.RbObj.objCollection[Objid] = obj;
        this.RbObj.RefreshControl(obj);
        $("#running-summary ul[id='running-summary-childul']").append(`<li class='styl'><div tabindex='1' $(this).focus(); class='textval'>
            ${$funcselect.val()} (${fields.find('option:selected').text().trim()})</div></li>`);
    };

    this.resizeTdOnLayoutResize = function (id) {
        $(`#${id}`).find("td").each(function (i, obj) {
            if ($(obj).find(".dropped").length > 0) {
                let ctrl = $(obj).children(".dropped").eq(0);
                this.RbObj.objCollection[ctrl.attr("id")].Width = $(`#${ctrl.attr("id")}`).innerWidth();
                this.RbObj.objCollection[ctrl.attr("id")].Height = $(`#${ctrl.attr("id")}`).innerHeight();
            }
        }.bind(this));
        this.RbObj.objCollection[id].Height = $("#" + id).height();
        this.RbObj.objCollection[id].Width = $("#" + id).width();
    };

    this.makeReadOnlyonPg = function (curObject) {
        this.RbObj.pg.MakeReadOnly(["Width", "Height", "Left", "Top"]);
    };

    this.buildTableHierarcy = function ($elements, index, eb_typeCntl) {
        this._table = this.RbObj.objCollection[$elements.attr("id")];
        this._table.CellCollection.$values.length = 0;
        this.eb_typeCntl = eb_typeCntl;
        this.sectionIndex = index;

        $elements.find("td").each(function (i, js_objtd) {
            var td_obj = new EbObjects["EbTableLayoutCell"]("TableLayoutCell" + this.RbObj.idCounter["TableLayoutCellCounter"]++);
            td_obj.RowIndex = $(js_objtd).parent("tr").index();
            td_obj.CellIndex = $(js_objtd).index();
            td_obj.Height = $(js_objtd).closest("tr").height();
            td_obj.Width = $(js_objtd).width();
            this.getTdCtrls($(js_objtd), td_obj);
        }.bind(this));
    };

    this.getTdCtrls = function ($td, eb_obj) {

        $td.find(".dropped").each(function (k, ebctrl) {

            if ($(ebctrl).length >= 1) {

                var id = $(ebctrl).attr("id");

                var control = this.RbObj.objCollection[id];

                var eb_type = control.$type.split(",")[0].split(".").pop().substring(2);    
                
                if (eb_type === "Table_Layout")
                    this.innerTableOnEdit(control);
                else {
                    control.Left = $(ebctrl).position().left + $td.position().left + parseFloat(this._table.Left);
                    control.Top = $(ebctrl).position().top + $td.position().top + parseFloat(this._table.Top);
                    control.LeftPt = this.RbObj.repExtern.convertTopoints(control.Left);
                    control.TopPt = this.RbObj.repExtern.convertTopoints(control.Top);

                    control.Width = $(ebctrl).innerWidth();
                    control.Height = $(ebctrl).innerHeight();
                    control.WidthPt = this.RbObj.repExtern.convertTopoints(control.Width);
                    control.HeightPt = this.RbObj.repExtern.convertTopoints(control.Height);         

                    eb_obj.ControlCollection.$values.push(control);
                }
            }
        }.bind(this));

        this._table.CellCollection.$values.push(eb_obj);
    };

    this.drawTableOnEdit = function (editControl) {
        let o = new EbTableLayout(this.RbObj, editControl);
        this.RbObj.TableCollection[o.EbCtrl.EbSid] = o;
    };

    this.innerTableOnEdit = function (ebctrl) {

    };

    this.drawDsParmsTree = function (paramsList) {
        var icon = "";
        var t = "";
        paramsList.forEach(function (param) {
            if (param.type === "16") {
                t = EbParams.EbType["String"];
                icon = EbParams.Icons["String"];
            }
            else if (param.type === "7" || param.type === "8" || param.type === "10" || param.type === "11" || param.type === "12" || param.type === "21") {
                t = EbParams.EbType["Numeric"];
                icon = EbParams.Icons["Numeric"];
            }
            else if (param.type === "3") {
                t = EbParams.EbType["Bool"];
                icon = EbParams.Icons["Bool"];
            }
            else if (param.type === "5" || param.type === "6" || param.type === "17" || param.type === "26") {
                t = EbParams.EbType["DateTime"];
                icon = EbParams.Icons["DateTime"];
            }

            $("#ds_parameter_list ul[id='ds_parameters']").append(`<li class='styl'><span eb-type='${t}' class='fd_params draggable textval'><i class='fa ${icon}'></i> ${param.name}</span></li>`);
        });
        $('#ds_parameter_list').killTree();
        $('#ds_parameter_list').treed();
        this.RbObj.DragDrop_Items();
    };

    this.drawDsColTree = function (colList) {
        var type, icon = "";
        $.each(colList, function (i, columnCollection) {
            $("#data-table-list ul[id='dataSource']").append(" <li><a>Table " + i + "</a><ul id='t" + i + "'></ul></li>");
            $.each(columnCollection, function (j, obj) {
                if (obj.type === 16) {
                    type = "DataFieldText"; icon = EbParams.Icons["String"];
                }
                else if (obj.type === 7 || obj.type === 8 || obj.type === 10 || obj.type === 11 || obj.type === 12 || obj.type === 21) {
                    type = "DataFieldNumeric"; icon = EbParams.Icons["Numeric"];
                }
                else if (obj.type === 3) {
                    type = "DataFieldBoolean"; icon = EbParams.Icons["Bool"];
                }
                else if (obj.type === 5 || obj.type === 6 || obj.type === 17 || obj.type === 26) {
                    type = "DataFieldDateTime"; icon = EbParams.Icons["DateTime"];
                }
                $("#data-table-list ul[id='t" + i + "']").append(`<li class='styl'><span eb-type='${type}' DbType='${obj.type}' class='coloums draggable textval'><i class='fa ${icon}'></i> ${obj.columnName}</span></li>`);
            });
        });
        $('#data-table-list').killTree();
        $('#data-table-list').treed();
        this.RbObj.DragDrop_Items();
    };

    this.drawLocConfig = function () {
        let conf = this.RbObj.LocConfig;
        for (let i = 0; i < conf.length; i++) {
            let icon = (conf[i].Type === "Image") ? `fa-picture-o` : 'fa-text-width';
            $("#eb-Location-config ul[id='eb-Location-config_child']").append(`
                        <li class="styl"><span eb-type='LocField${conf[i].Type}' class='draggable textval'>
                        <i class="fa ${icon}"></i> ${conf[i].Name}</span>
                        </li>`);
        }
        $('#eb-Location-config').killTree();
        $('#eb-Location-config').treed();
        this.RbObj.DragDrop_Items();
    };

    this.switchlayer = function (e) {
        var target = $(e.target).closest(".Rb_layer");
        if (!target.hasClass("layeractive")) {
            target.addClass("layeractive");
            target.siblings().removeClass("layeractive");
        }
        else {
            target.siblings().removeClass("layeractive");
        }

        if (target.attr("Layer") === "Section") {
            $(".multiSplit,.headersections,#page").show();
            $(".headersections-report-layer,#page-reportLayer").hide();
            $(".tracker_drag").css("height", "100%");
            this.RbObj.containment = ".page";
        }
        else {
            $(".multiSplit,.headersections,#page").hide();
            $(".headersections-report-layer,#page-reportLayer").show();
            $(".tracker_drag").css("height", "100%");
            this.RbObj.containment = ".page-reportLayer";
        }
    };

    commonO.PreviewObject = function () {
        $("#preview_wrapper").empty();
        commonO.Save();
    };

    commonO.saveOrCommitSuccess = function (res) {
        this.refid = res.refid || null;
        $.ajax({
            url: "../ReportRender/Index",
            type: "POST",
            cache: false,
            data: {
                refid: this.refid,
                renderLimit: true
            },
            beforeSend: function () {
                $("#eb_common_loader").EbLoader("show");
            },
            success: function (result) {
                $("#preview_wrapper").html(result);
                $("#btnGo").off("click").on("click", this.render.bind(this));
                if ($("#btnGo").length <= 0) {
                    $("#sub_windows_sidediv_dv").hide();
                    $("#content_dv").removeClass("col-md-9").addClass("col-md-12");
                    $("#reportIframe").attr("src", `../ReportRender/RenderReport2?refid=${this.refid}`);
                }
            }.bind(this)
        });
    }.bind(this);

    this.render = function () {
        //$("#sub_windows_sidediv_dv").css("display", "none");
        //$("#content_dv").removeClass("col-md-9").addClass("col-md-12");
        //$.LoadingOverlay("show");
        $("#eb_common_loader").EbLoader("show");
        var ParamsArray = FilterDialog.getFormVals();


        //if (!validateFD()) {
        //    //$.LoadingOverlay("hide");
        //    $("#eb_common_loader").EbLoader("hide");
        //    $("#filter").trigger("click");
        //    return;
        //}
        $("#reportIframe").attr("src", `../ReportRender/Renderlink?refid=${this.refid}&_params=${btoa(JSON.stringify(ParamsArray))}`);
        // $("#RptModal").modal('hide');
        //$.LoadingOverlay("hide");
        $("#eb_common_loader").EbLoader("hide");
    };

    this.start = function () {
        $('.tracker_drag').draggable({ axis: "x", containment: ".page-outer-container", stop: this.onTrackerStop.bind(this) });
        //$(window).on("scroll", this.windowscroll.bind(this));
        $(".Rb_layer").off("click").on("click", this.switchlayer.bind(this));
        $(".add_calcfield").on("click", this.newCalcFieldSum.bind(this));
        $(".add_summarry").on("click", this.addSummarry.bind(this));
    };

    this.start();
};