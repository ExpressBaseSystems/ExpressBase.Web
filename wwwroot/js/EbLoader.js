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
            imagePath: null // Default Path custom image
        }, options);

        //Apply styles
        el.css("background-color", settings.bgColor);

        if (!el.hasClass('eb-loader-prcbar')) {
            el.addClass('eb-loader-prcbar');
            el.parent().append(`<div class="loader_mask_EB" id="${el.attr("id")}loader_mask_EB"></div>`);
        }
            
        //show function for processbar
        function showPrc() {
            el.show();
            $(`#${el.attr("id")}loader_mask_EB`).show();
        };
        
        //hide function for processbar
        function hidePrc() {
            el.hide();
            $(`#${el.attr("id")}loader_mask_EB`).hide();
        };

        if (operation === "show")
            showPrc();
        else if (operation === "hide")
            hidePrc();
        else return null;    
    };
}(jQuery));