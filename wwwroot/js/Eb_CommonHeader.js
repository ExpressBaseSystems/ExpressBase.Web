var EbHeader = function () {

    var _objName = $(".EbHeadTitle #objname");
    var _btnContainer = $(".comon_header_dy .toolicons");
    var _layout = $("#layout_div");

    this.insertButton = function () {
        _btnContainer.prepend(`${$html}`);
    }

    this.setName = function (name) {
        _objName.text(`${name}`);
    };

    this.hideElement = function (collectionofIds) {
        collectionofIds.forEach(function (item, i) {
            _btnContainer.children("#" + item).hide();
        }.bind(this));
    }

    _layout.data("EbHeader", this);

};