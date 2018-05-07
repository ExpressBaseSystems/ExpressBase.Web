var RbCommon = function (RbMainObj) {
    this.RbObj = RbMainObj;
    this.EbidCounter = {
        EbDataFieldTextCounter: 0,
        EbDataFieldDateTimeCounter: 0,
        EbDataFieldBooleanCounter: 0,
        EbDataFieldNumericCounter: 0,
        EbDataFieldNumericSummaryCounter: 0,
        EbDataFieldTextSummaryCounter: 0,
        EbDataFieldBooleanSummaryCounter: 0,
        EbDataFieldDateTimeSummaryCounter: 0,
        EbTableCounter: 0,
        EbImgCounter: 0,
        EbDateTimeCounter: 0,
        EbPageXYCounter: 0,
        EbPageNoCounter: 0,
        EbTextCounter: 0,
        EbBarcodeCounter: 0,
        EbQRcodeCounter: 0,
        EbWaterMarkCounter: 0,
        EbCircleCounter: 0,
        EbRectCounter: 0,
        EbArrRCounter: 0,
        EbArrLCounter: 0,
        EbArrUCounter: 0,
        EbArrDCounter: 0,
        EbByArrHCounter: 0,
        EbByArrVCounter: 0,
        EbHlCounter: 0,
        EbVlCounter: 0,
        EbSerialNumberCounter: 0,
        EbCalcFieldCounter: 0
    };

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
            height:595.276
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
        3:"justify"
    }

    this.onTrackerStop = function (e, ui) {
        var $t = $(ui.helper);
        if ($t.hasClass("track_line_vert1")) {
            this.RbObj.margin.Left = $t.position().left;
            this.RbObj.EbObject.Margin.Left = this.RbObj.repExtern.convertTopoints($t.position().left);
        }
        else{
            this.RbObj.margin.Right = $t.position().left;
            this.RbObj.EbObject.Margin.Right = this.RbObj.repExtern.convertTopoints(parseFloat(this.RbObj.width) - $t.position().left);
        }
    };

    this.windowscroll = function () {
        //$(".tracker_drag").css({ "top": $(window).scrollTop()});
        $(".tracker_drag").css({ "height": ($(".page").height() - $(window).scrollTop()) + 20, "top": $(window).scrollTop() });
    };

    this.start = function () {
        this.RbObj.margin.Right = $(".track_line_vert2").position().left;
        $('.tracker_drag').draggable({ axis: "x", containment: ".page-outer-container", stop: this.onTrackerStop.bind(this) });
        $(window).on("scroll", this.windowscroll.bind(this));
    };
    
    this.start();
}