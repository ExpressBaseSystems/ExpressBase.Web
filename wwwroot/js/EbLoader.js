(function ($) {
    /*register loader*/
    $.fn.EbLoader = function (action,options) {
        /*the target*/
        var el = $(this);
        var operation = action;
        var settings = $.extend({
            color:"#ec9351",
            bgColor: 'transparent', // Default background color
            fontAwesome: null, // Default null
            imagePath: null, // Default Path custom image
            elMask: false,
            maskItem:null
        }, options);

        //Apply styles
        el.css("background-color", settings.bgColor);

        if (!el.hasClass('eb-loader-prcbar')) {
            el.addClass('eb-loader-prcbar');
            if (typeof settings.maskItem ==="object")
                settings.maskItem.append(`<div class="loader_mask_EB" id="${el.attr("id")}loader_mask_item"></div>`);
            if (settings.elMask)
                el.parent().append(`<div class="loader_mask_EB" id="${el.attr("id")}loader_mask_EB"></div>`);
        }
            
        //show function for processbar
        function showPrc() {
            el.show();
            if (typeof settings.maskItem === "object")
                $(`#${el.attr("id")}loader_mask_item`).show();
            if (settings.elMask)
                $(`#${el.attr("id")}loader_mask_EB`).show();
        };
        
        //hide function for processbar
        function hidePrc() {
            el.hide();
            if (typeof settings.maskItem === "object")
                $(`#${el.attr("id")}loader_mask_item`).hide();
            if (settings.elMask)
                $(`#${el.attr("id")}loader_mask_EB`).hide();
        };

        if (operation === "show")
            showPrc();
        else if (operation === "hide")
            hidePrc();
        else return null;    
    };
}(jQuery));