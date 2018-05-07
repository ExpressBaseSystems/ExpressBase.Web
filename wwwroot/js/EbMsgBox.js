function EbMessage(action, options) {

        var operation = action;
        var settings = $.extend({
            Backgorund: "#31d031",
            Message: "nothing to display",
            FontColor: "#fff",
            AutoHide:true
        }, options);       

        function div() {
            if ($('#eb_messageBox_container').length === 0)
                $('body').append(`<div class="eb_messageBox_container" id="eb_messageBox_container" style="background-color:${settings.Backgorund};color:${settings.FontColor}">
                                  <span class="msg">${settings.Message}</span>
                                  <i class="fa fa-close pull-right" onclick="$(this).parent().hide();" id="close-msg"></i>
                                </div>`);
            else
                $(`#eb_messageBox_container .msg`).text(settings.Message);
        }

        function showMsg() {
            div();
            $(`#eb_messageBox_container`).fadeIn();
            settings.AutoHide ? setTimeout(function () { hideMsg(); }, 4000):null;
        };

        function hideMsg() {
            $(`#eb_messageBox_container`).fadeOut();
        };
    
        if (operation === "show")
            showMsg();
        else if (operation === "hide")
            hideMsg();
        else return null;
        
    };