var RbCommon = function (RbMainObj) {
    this.RbObj = RbMainObj;
    var _hasSummary = ["EbDataFieldNumeric", "EbCalcField", "EbDataFieldBoolean", "EbDataFieldText", "EbDataFieldDateTime"];
    var $funcselect = $("#summarry-editor-modal-container #summary-func").empty();
    var $sectionselect = $("#summarry-editor-modal-container #summary-sections").empty();
    var fields = $("#summarry-editor-modal-container #summary-fieldname").empty();
    var $summModal = $("#summarry-editor-modal-container");

    this.subSecCounter = {
        Countrpthead: 1,
        Countpghead: 1,
        Countdetail: 1,
        Countpgfooter: 1,
        Countrptfooter: 1
    };

    this.EbObjectSections = {
        ReportHeader: 'rpthead',
        PageHeader: 'pghead',
        ReportDetail: 'detail',
        PageFooter: 'pgfooter',
        ReportFooter: 'rptfooter'
    };
    this.msBoxSubNotation = {
        rpthead: 'Rh',
        pghead: 'Ph',
        detail: 'Dt',
        pgfooter: 'Pf',
        rptfooter: 'Rf'
    };

    this.pages = {
        0: {
            width: 612,
            height: 792
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
    }
    this.TextAlign = {
        0: "left",
        2: "right",
        1: "center",
        3: "justify"
    }

    this.setMarginOnedit = function (margin) {
        $(".track_line_vert1").css("left", this.RbObj.repExtern.convertPointToPixel(margin.Left));
        this.RbObj.margin.Left = $(".track_line_vert1").position().left;
        $(".track_line_vert2").css("left", parseFloat(this.RbObj.width) - this.RbObj.repExtern.convertPointToPixel(margin.Right));
        this.RbObj.margin.Right = $(".track_line_vert2").position().left;
    };

    this.onTrackerStop = function (e, ui) {
        var $t = $(ui.helper);
        if ($t.hasClass("track_line_vert1")) {
            this.RbObj.margin.Left = $t.position().left;
            this.RbObj.EbObject.Margin.Left = this.RbObj.repExtern.convertTopoints($t.position().left);
        }
        else {
            this.RbObj.margin.Right = $t.position().left;
            this.RbObj.EbObject.Margin.Right = this.RbObj.repExtern.convertTopoints(parseFloat(this.RbObj.width) - $t.position().left);
        }
    };

    this.windowscroll = function () {
        var $layer = null;
        if ($(".page-reportLayer").is(":visible"))
            $layer = ".page-reportLayer";
        else
            $layer = ".page";
        $(".tracker_drag").css({ "height": ($($layer).height() - $(window).scrollTop()) + 20, "top": $(window).scrollTop() });
    };

    this.ValidateCalcExpression = function (obj) {
        $.ajax({
            url: "../RB/ValidateCalcExpression",
            type: "POST",
            cache: false,
            data: {
                refid: this.RbObj.EbObject.DataSourceRefId,
                expression: atob(obj.ValueExpression)
            },
            success: function (result) {
                this.setCalcFieldType(obj, JSON.parse(result));
            }.bind(this)
        });
    }

    this.setCalcFieldType = function (obj, result) {
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
        $("#detail0").append(obj.$Control.outerHTML());
        obj.ValueExpression = btoa(vexp);
        obj.Name = name;
        obj.Title = Objid;
        this.RbObj.objCollection[Objid] = obj;
        this.RbObj.RefreshControl(obj);
        $("#eb_calcF_summarry").modal("toggle");
        this.ValidateCalcExpression(obj);//returns the type of expression
    };

    this.addSummarry = function () {
        $summModal.modal("toggle");
        var sections = this.RbObj.RM.getSectionToAddSum();

         $funcselect.empty();
         $sectionselect.empty();
         fields.empty();

        for (var ite in this.RbObj.objCollection) {
            var t = this.RbObj.objCollection[ite].$type.split(",")[0].split(".").pop();
            if (_hasSummary.indexOf(t) >= 0) {
                fields.append(`<option eb-type="${t}"
                value="${this.RbObj.objCollection[ite].EbSid}">${this.RbObj.objCollection[ite].Title}</option>`);
            }
        }
        for (var i = 0; i < sections.length; i++) {
            $sectionselect.append(`<option 
                value="#${sections[i].attr("id")}">${sections[i].attr("eb-type") + sections[i].attr("id").slice(-1)}</option>`);
        }
        fields.on("change", function (e) {
            var obj = this.RbObj.objCollection[e.target.value];
            var t = obj.$type.split(",")[0].split(".").pop() === "EbCalcField" ? obj.CalcFieldType : obj.$type.split(",")[0].split(".").pop();
            var summaryFunc = this.RbObj.RM.getsummaryfns(t);//object
            for (var func in summaryFunc) {
                $funcselect.append(`<option 
               value="${func}">${func}</option>`);
            }
        }.bind(this));
        $("#submit-summary").off("click").on("click", this.appendSummaryField.bind(this));
    };

    this.appendSummaryField = function (e) {
        $summModal.modal("toggle");
        var cft = $("#" + fields.val()).attr("cftype") || "";
        var type = $("#" + fields.val()).attr("eb-type") + cft;

        var Objid = type + "Summary" + this.RbObj.idCounter[type + "SummaryCounter"]++;
        var obj = new EbObjects["Eb" + type + "Summary"](Objid);
        $($sectionselect.val()).append(obj.$Control.outerHTML());

        if (type.indexOf("DataField") >= 0)
            obj.DataField = fields.val();
        else
            obj.CalcFieldName = fields.val();

        obj.Title = $funcselect.val() + "(" + fields.find('option:selected').text() + ")";
        obj.Function = $funcselect.val();
        this.RbObj.objCollection[Objid] = obj;
        this.RbObj.RefreshControl(obj);
        $("#running-summary ul[id='running-summary-childul']").append(`<li class='styl'><div tabindex='1' $(this).focus(); class='textval'>
            ${$funcselect.val()} (${fields.find('option:selected').text().trim()})</div></li>`);
    };

    this.start = function () {
        $('.tracker_drag').draggable({ axis: "x", containment: ".page-outer-container", stop: this.onTrackerStop.bind(this) });
        $(window).on("scroll", this.windowscroll.bind(this));
        $("#reportLayer").on("click", function (e) {
            $(e.target).closest("div").toggleClass("layeractive");
            $("#sectionLayer").removeClass("layeractive");
            $(".multiSplit,.headersections,#page,.rulerleft").hide();
            $(".headersections-report-layer,#page-reportLayer,.rulerleft_Lyr_rpt").show();
            $(".tracker_drag").css("height", "100%");
            containment = ".page-reportLayer";
        }.bind(this));
        $("#sectionLayer").on("click", function (e) {
            $(e.target).closest("div").toggleClass("layeractive");
            $("#reportLayer").removeClass("layeractive");
            $(".multiSplit,.headersections,#page,.rulerleft").show();
            $(".headersections-report-layer,#page-reportLayer,.rulerleft_Lyr_rpt").hide();
            $(".tracker_drag").css("height", "100%");
            containment = ".page";
        }.bind(this));
        $(".add_calcfield").on("click", this.newCalcFieldSum.bind(this));
        $(".add_summarry").on("click", this.addSummarry.bind(this));
    };

    this.start();
}