﻿var EbHeader = function () {
    var _objName = $(".EbHeadTitle #objname");
    var _btnContainer = $(".comon_header_dy #obj_icons");
    var _layout = $("#layout_div");

    this.insertButton = function ($html) {
        _btnContainer.prepend(`${$html}`);
    };

    this.setName = function (name) {
        _objName.text(`${name}`);
    };

    this.setMode = function (html) {
        _objName.append(`${html}`);
    };

    this.hideElement = function (collectionofIds) {
        collectionofIds.forEach(function (item, i) {
            _btnContainer.children("#" + item).hide();
        }.bind(this));
    };

    this.showElement = function (collectionofIds) {
        collectionofIds.forEach(function (item, i) {
            _btnContainer.children("#" + item).show();
        }.bind(this));
    };

    this.clearHeader = function () {
        _btnContainer.empty();
    };

    this.setLocation = function (t) {
        $("#LocInfoCr_name").text(t);
    };

    _layout.data("EbHeader", this);
};