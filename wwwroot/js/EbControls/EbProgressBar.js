﻿(function ($) {
    /*register loader*/
    $.fn.EbLoader = function (action,options) {
        /*the target*/
        var el = $(this);
        var operation = action;
        var settings = $.extend({
            color:"#ec9351",
            bgColor: 'transparent', // Default background color 
            maskItem: {},
            maskLoader:true
        }, options);

        //maskItem:{
        //Id: "",
        //Style:{}   //jquery css
        //}

        //Apply styles
        el.css("background-color", settings.bgColor);

        maskItem = $(settings.maskItem.Id);

        if (!el.hasClass('eb-loader-prcbar')) {
            el.addClass('eb-loader-prcbar');
        }
        else {
            showPrc();
        }

        if (action === "show") {
            if (!$.isEmptyObject(settings.maskItem)) {
                maskItem.append(`<div class="loader_mask_EB" id="${el.attr("id")}loader_mask_item"></div>`);
                appendMaskStyle();
            }
            if (settings.maskLoader) {
                $(`#${el.attr("id")}loader_mask_item`).append(`<div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div>
                                    <div></div><div></div><div></div><div></div><div>
                                    </div><div></div><div></div></div>`);
            }
        }

        function appendMaskStyle() {
            if (!$.isEmptyObject(settings.maskItem.Style)) {
                $(`#${el.attr("id")}loader_mask_item`).css(settings.maskItem.Style);
            }
        };
        
        //show function for processbar
        function showPrc() {
            el.show();
            if (!$.isEmptyObject(settings.maskItem))
                $(`#${el.attr("id")}loader_mask_item`).show();
        };
        
        //hide function for processbar
        function hidePrc() {
            el.hide();
            $(`#${el.attr("id")}loader_mask_item`).remove();
        };

        if (operation === "show")
            showPrc();
        else if (operation === "hide")
            hidePrc();
        else return null;    
    };
}(jQuery));