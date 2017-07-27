
var pages = {
    A4: {
        width: '21cm',
        height: '29.7cm',
        reportheaderH: "2cm",
        reportfooterH: "2cm",
        pageHeaderH: "2cm",
        pageFooterH: "2cm",
        PagebodyH: "21.7cm",
    },
    
    A3: {
    width: '29.7cm',
    height: '42cm',
    reportheaderH: "3cm",
    reportfooterH: "3cm",
    pageHeaderH: "3cm",
    pageFooterH: "3cm",
    PagebodyH: "30cm",
    },

    Letter: {
        width: '21.59cm',
        height: '27.94cm',
        reportheaderH: "2cm",
        reportfooterH: "2cm",
        pageHeaderH: "2cm",
        pageFooterH: "2cm",
        PagebodyH: "19.94cm",
    },
    A5: {
        width: '14.8cm',
        height: '21cm',
        reportheaderH: "1.5cm",
        reportfooterH: "1.5cm",
        pageHeaderH: "1.5cm",
        pageFooterH: "1.5cm",
        PagebodyH: "15cm",
    },

};



var RptBuilder = function (type) {
    this.type = type;   

    this.createPage = function (type) {

        $('#PageContainer').append("<div class='page' style='width :" + pages[type].width + "; height:" + pages[type].height + ";margin-left:28px;'></div>");
        this.ruler(pages[type].width, pages[type].height);      

    };

    this.ruler = function (width, height) {

        var $ruler = $('.ruler').css({ "width": width, "height": "25px" });
        for (var i = 0, step = 0; i < $ruler.innerWidth() / 5; i++, step++) {
            var $tick = $('<div>');
            if (step == 0) {
                $tick.addClass('tickLabel').html(i * 5);
            } else if ([1, 3, 5, 7, 9].indexOf(step) > -1) {
                $tick.addClass('tickMinor');
                if (step == 9) {
                    step = -1;
                }
            } else {
                $tick.addClass('tickMajor');
            }
            $ruler.append($tick);
        }

        var $rulerleft = $('.rulerleft').css({ "width": "25px", "height": height });
        for (var i = 0, step = 0; i < $rulerleft.innerHeight() / 5; i++, step++) {
            var $tick = $('<div>');
            if (step == 0) {
                $tick.addClass('tickLabel').html(i * 5);
            } else if ([1, 3, 5, 7, 9].indexOf(step) > -1) {
                $tick.addClass('tickMinor');
                if (step == 9) {
                    step = -1;
                }
            } else {
                $tick.addClass('tickMajor');
            }
            $rulerleft.append($tick);
        }
    };

    this.ReportHeader = function (height) {
        $('.page').append("<div class='rpthead' style='width :100%; height:" + height + ";border:none;border-bottom:1px dashed'></div>");
    }

    this.PageHeader = function (height) {
        $('.page').append("<div class='pghead' style='width :100%; height:" + height + ";border:none;border-bottom:1px dashed'></div>");
    }

    this.pageBody = function (height) {
        $('.page').append("<div class='pgbody' style='width :100%; height:" + height + ";border:none;'></div>");
    }

    this.PageFooter = function (height) {
        $('.page').append("<div class='pgfooter' style='width :100%; height:" + height + ";border:none;border-top:1px dashed;'></div>");
    }

    this.Reportfooter = function (height) {
        $('.page').append("<div class='rptfootr' style='width :100%; height:" + height + ";border:none;border-top:1px dashed'></div>");
    };

    this.headerScaling = function (hight) {
        $('.rpthead').resizable({ containment: "parent", handles: "n , s " });
        $('.pghead').resizable({ containment: "parent", handles: "n , s " });
        $('.pgbody').resizable({ containment: "parent", handles: "n , s " });
        $('.pgfooter').resizable({ containment: "parent", handles: "n , s " });      
    };

   
    this.init = function () {
        //$('#pageCanvas').empty();
        $('#PageContainer').empty();
        this.createPage(type);
        this.ReportHeader(pages[type].reportheaderH);
        this.PageHeader(pages[type].pageHeaderH);
        this.pageBody(pages[type].PagebodyH);
        this.PageFooter(pages[type].pageFooterH);
        this.Reportfooter(pages[type].reportfooterH);
        this.headerScaling(pages[type].height);
        
    };
    this.init();
};
