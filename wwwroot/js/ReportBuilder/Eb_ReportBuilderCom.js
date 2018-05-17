var RbCommon = function (RbMainObj) {
    this.RbObj = RbMainObj;

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
        else{
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
    };
    
    this.start();
}