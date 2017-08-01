
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
    this.height = pages[type].height;
    this.width = pages[type].width;

    this.report = new Object();
    this.report.pagetype = type;
    this.report.pageheight = height;
    this.report.pagewidth = width;

    this.createPage = function (type) {

        var $pageCanvas = $('#pageCanvas');
        $pageCanvas.empty();
        $('#pageCanvas').css({ "transform": "", "transform-origin": "" });
        $pageCanvas.append("<div class='ruler'></div> <div class='rulerleft'></div><div id='PageContainer' style='margin-top:4px;'></div>");
        this.splitheaderBox();

        if (pages[type].width > "21cm") {

            $('#pageCanvas').css({ "transform": "scale(0.6)", "transform-origin": "0 0" });

        }
        var $div = $("<div class='page' id='page' style='width :" + pages[type].width + "; height:" + pages[type].height + ";'></div>")
        $('#PageContainer').append($div);
        this.ruler(pages[type].width, pages[type].height);

        return $div;
    };

    this.splitheaderBox = function () {

        $headersection = $("<div class='headersections' style='height:" + pages[type].height + ";'></div>");
        $("#PageContainer").append($headersection);
        $("#PageContainer").append("<div class='multiSplit' style='height:" + pages[type].height + ";'></div>");
        
    };

    this.pageSplitHbox = function () {
        
        $(".headersections").append("<div class='rptheadHbox' style='width :100%'><p>Rh</p></div>");
        $(".headersections").append("<div class='pgheadHbox' style='width :100%'><p>Ph</p></div>");
        $(".headersections").append("<div class='pgbodyHbox' style='width :100%'><p>Dtls</p></div>");
        $(".headersections").append("<div class='pgfooterHbox' style='width :100%'><p>Pf</p></div>");
        $(".headersections").append("<div class='rptfooterHbox' style='width :100%'><p>Rf</p></div>");

        this.splitButton();
    };

    this.ruler = function (width, height) {

        var $ruler = $('.ruler').css({ "width": width, "height": "25px", "margin-left": "128px" });
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

    this.pageSplitters = function ($pageref) {

        $pageref.append("<div class='rpthead' style='width :100%'></div>");

        $pageref.append("<div class='pghead' style='width :100%'></div>");

        $pageref.append("<div class='pgbody' style='width :100%'></div>");

        $pageref.append("<div class='pgfooter' style='width :100%'></div>");

        $pageref.append("<div class='rptfooter' style='width :100%'></div>");

    };

    this.splitButton = function () {
        $('.headersections').children().not(".gutter").each(function (i, obj) {
            $(obj).append("<button class='btn btn-xs'><i class='fa fa-plus'></i></button>");
        });

        $('.headersections').children().children("button").off("click").on("click", function (e) {
            var btindex = $(this).index();
            console.log($(this).index());
            //this.multiSplit(btindex);
        });
    };
    
    this.multiSplit = function (btindex) {
        
    };

    this.headerScaling = function () {

        Split(['.rpthead', '.pghead', '.pgbody', '.pgfooter', '.rptfooter'], {
            direction: 'vertical',
            cursor: 'row-resize',
            sizes: [10, 10, 60, 10, 10],
            minSize: 0,
            gutterSize: 3,
            onDrag: function (e) {
                $('.rptheadHbox').css("height", $('.rpthead').height());
                $('.pgheadHbox').css("height", $('.pghead').height());
                $('.pgbodyHbox').css("height", $('.pgbody').height());
                $('.pgfooterHbox').css("height", $('.pgfooter').height());
                $('.rptfooterHbox').css("height", $('.rptfooter').height());
            }
        });

        Split(['.rptheadHbox', '.pgheadHbox', '.pgbodyHbox', '.pgfooterHbox', '.rptfooterHbox'], {
            direction: 'vertical',
            cursor: 'row-resize',
            sizes: [10, 10, 60, 10, 10],
            minSize: 0,
            gutterSize: 3,         
        });

    };

    this.init = function () {

        $('#PageContainer').empty();
        var $pageref = this.createPage(type);
        this.pageSplitters($pageref);
        this.pageSplitHbox();
        this.headerScaling();
        
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

