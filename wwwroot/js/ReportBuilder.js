var pageA4 = function () {
    this.width = '21cm'
    this.height = '29.7cm'
};
var pageA3 = function () {
    this.width = '20cm'
    this.height = '29.7cm'
};
var createPage = function (type) {
    if (type === 'A4') {
        $('#PageContainer').append("<div class='page' style='width :" + new pageA4().width + "; height:" + new pageA4().height + "'></div>");
    }
    if (type === 'A3') {
        $('#PageContainer').append("<div class='page' style='width :" + new pageA3(type).width + "; height:" + new pageA3().height + "'></div>");
    }
}
var RptBuilder = function (type) {
    this.type = type;
    $('#PageContainer').empty();
    new createPage(type);
}
