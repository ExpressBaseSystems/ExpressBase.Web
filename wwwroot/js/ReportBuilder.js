var pageA4 = function () {
    this.width = '595px'
    this.height = '842px'
};
var pageA3 = function () {
    this.width = '20cm'
    this.height = '29.7cm'
};
var createPage = function (type) {
    if (type === 'A4') {
        $('#PageContainer').append("<div class='page' style='width :" + new pageA4().width + "; height:" + new pageA4().height + ";margin-left:20px;'></div>");
    }
    if (type === 'A3') {
        $('#PageContainer').append("<div class='page' style='width :" + new pageA3(type).width + "; height:" + new pageA3().height + "'></div>");
    }
}
var ruler = function () {
        var $ruler = $('.ruler');
        for (var i = 0, step = 0; i < $ruler.innerWidth() / 5; i++, step++) {
            var $tick = $('<div>');
            if (step == 0) {
                $tick.addClass('tickLabel').html(i * 5) ;
            } else if ([1, 3, 5, 7, 9].indexOf(step) > -1) {
                $tick.addClass('tickMinor');
                if (step == 9) {
                    step = -1;
                }
            } else {
                $tick.addClass('tickMajor');
            }
            $ruler.clone();
            $ruler.append($tick);
        }
}
var RptBuilder = function (type) {
    this.type = type;
    $('#PageContainer').empty();
    createPage(type);
    ruler();
}
