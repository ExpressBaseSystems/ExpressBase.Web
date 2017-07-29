
var pages = {
    A4: {
        width: '21cm',
        height: '29.7cm',        
    },

    A3: {
        width: '29.7cm',
        height: '42cm',      
    },

    Letter: {
        width: '21.59cm',
        height: '27.94cm',
    },

    A5: {
        width: '14.8cm',
        height: '21cm',
    },
};

var RptBuilder = function (type) {
    this.type = type;

    this.createPage = function (type) {

        var $pageCanvas = $('#pageCanvas');
        $pageCanvas.empty();
        $('#pageCanvas').css({ "transform": "", "transform-origin": "" });
        $pageCanvas.append("<div class='ruler'></div> <div class='rulerleft'></div><div id='PageContainer' style='margin-top:4px;'></div>");
        $pageCanvas.append("<div class='headersections style='height:" + pages[type].height + ";'></div>");

        if (pages[type].width > "21cm") {

            $('#pageCanvas').css({ "transform": "scale(0.6)", "transform-origin": "0 0" });

        }

        $('#PageContainer').append("<div class='page' id='page' style='width :" + pages[type].width + "; height:" + pages[type].height + ";margin-left:28px;'></div>");
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
        $('.page').append("<div class='rpthead' id='1' style='width :100%'></div>");       
    }

    this.PageHeader = function (height) {
        $('.page').append("<div class='pghead'  id='2'  style='width :100%'></div>");
    }

    this.pageBody = function (height) {
        $('.page').append("<div class='pgbody' id='3'  style='width :100%'></div>");
    }

    this.PageFooter = function (height) {
        $('.page').append("<div class='pgfooter' id='4'  style='width :100%'></div>");
    }

    this.Reportfooter = function (height) {
        $('.page').append("<div class='rptfootr' id='5'  style='width :100%'></div>");
    };

    
    this.headerScaling = function (hight) {

        Split(['.rpthead', '.pghead', '.pgbody', '.pgfooter', '.rptfootr'], {
            direction: 'vertical',
            cursor: 'row-resize',
            sizes:[10,10,60,10,10],
            minSize: 0,
            gutterSize: 5,
            
        });
    };

    

    this.init = function () {

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

var setBackgroud = function (input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#page').css({ 'background-image': 'url(' + e.target.result + ')', 'width': $('#page').width(), 'background-repeat': 'no-repeat' });
        }
        reader.readAsDataURL(input.files[0]);
    }
};