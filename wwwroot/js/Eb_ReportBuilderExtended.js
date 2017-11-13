var ReportExtended = function () {

    this.headerSecSplitter = function (array) {
        Split(array, {
            direction: 'vertical',
            cursor: 'row-resize',
            sizes: [20, 20, 20, 20, 20],
            minSize: 33,
            gutterSize: 5,
            onDrag: function (e) {
                $('#box0,#rptheadHbox').css("height", $('#rpthead').height());
                $('#box1,#pgheadHbox').css("height", $('#pghead').height());
                $('#box2,#detailHbox').css("height", $('#detail').height());
                $('#box3,#pgfooterHbox').css("height", $('#pgfooter').height());
                $('#box4,#rptfooterHbox').css("height", $('#rptfooter').height());
                this.splitterOndragFn();
            }.bind(this)
        });
    };

    this.multisplit = function () {
        Split(['#rptheadHbox', '#pgheadHbox', '#detailHbox', '#pgfooterHbox', '#rptfooterHbox'], {
            direction: 'vertical',
            cursor: 'row-resize',
            sizes: [20, 20, 20, 20, 20],
            minSize: 33,
            gutterSize: 5,
            onDrag: function (e) {
                $('#box0,#rpthead').css("height", $('#rptheadHbox').height());
                $('#box1,#pghead').css("height", $('#pgheadHbox').height());
                $('#box2,#detail').css("height", $('#detailHbox').height());
                $('#box3,#pgfooter').css("height", $('#pgfooterHbox').height());
                $('#box4,#rptfooter').css("height", $('#rptfooterHbox').height());
                this.splitterOndragFn();
            }.bind(this)
        });
    }

    this.box = function () {
        Split(['#box0', '#box1', '#box2', '#box3', '#box4'], {
            direction: 'vertical',
            cursor: 'row-resize',
            sizes: [20, 20, 20, 20, 20],
            minSize: 33,
            gutterSize: 5,
            onDrag: function (e) {
                $('#rptheadHbox,#rpthead').css("height", $('#box0').height());
                $('#pgheadHbox,#pghead').css("height", $('#box1').height());
                $('#detailHbox,#detail').css("height", $('#box2').height());
                $('#pgfooterHbox,#pgfooter').css("height", $('#box3').height());
                $('#rptfooterHbox,#rptfooter').css("height", $('#box4').height());
                this.splitterOndragFn();
            }.bind(this)
        });
    }
    this.splitterOndragFn = function () {
        $('.multiSplit').children().not(".gutter").children().not(".gutter").each(function (i, obj1) {
            $('.page').children().not(".gutter").children().not(".gutter").each(function (j, obj2) {
                if ($(obj1).parent().attr("data_val") === $(obj2).parent().attr("data_val")) {
                    if ($(obj1).index() === $(obj2).index()) {
                        $(obj1).css("height", $(obj2).height());
                    }
                }
            });
        });
    };//spliter ondrag func

    this.splitGeneric = function (array) {
        Split(array, {
            direction: 'vertical',
            cursor: 'row-resize',
            minSize: 30,
            gutterSize: 5,
            onDrag: this.splitterOndragFn.bind(this)
        });
    }
}