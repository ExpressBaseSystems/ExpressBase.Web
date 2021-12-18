function EbMessage(action, options) {
    var operation = action;
    var settings = $.extend({
        Background: "#31d031",
        Message: "nothing to display",
        FontColor: "#fff",
        AutoHide: true,
        Delay: 8000,
        Details: null,
        ShowCopyBtn: false
    }, options);

    function onHide() {
        return options.onHide();
    }

    function onShow() {
        return options.onShow();
    }

    function div() {
        if ($('#eb_messageBox_container').length === 0)
            $('body').append(`<div class="eb_messageBox_container" id="eb_messageBox_container" style="background-color:${settings.Background};color:${settings.FontColor}">
                                  <span class="msg">${settings.Message}</span>
                                  <i class="fa fa-close pull-right" onclick="$(this).parent().hide();" id="close-msg" style="margin-left: 20px;"></i>
                                  <span class="more" title="See more"><i class="fa fa-chevron-down"></i> See more</span>
                                  <span class="copy" title="Copy to clipboard"><i class="fa fa-files-o"></i> Copy</span>
                                  </div>`);
        else {
            $(`#eb_messageBox_container .msg`).text(settings.Message);
            $(`#eb_messageBox_container`).css({ "background-color": settings.Background, "color": settings.FontColor });
        }
        if (settings.ShowCopyBtn)
            $('#eb_messageBox_container .copy').show();
        else
            $('#eb_messageBox_container .copy').hide();
        if (settings.Details)
            $('#eb_messageBox_container .more').show();
        else
            $('#eb_messageBox_container .more').hide();

        $(`#eb_messageBox_container .copy`).off('click').on('click', function (e) {
            navigator.clipboard.writeText($(`#eb_messageBox_container .msg`).text());
            $(this).html('<i class="fa fa-check"></i> Copied');
            setTimeout(function () { $(this).html('<i class="fa fa-files-o"></i> Copy'); }.bind(this), 1500);
        });
        $(`#eb_messageBox_container .more`).off('click').on('click', function (e) {
            if ($(this).attr('title') === 'See more' && settings.Details) {
                $(`#eb_messageBox_container .msg`).text(settings.Message + ' ' + settings.Details);
                $(this).attr('title', 'See less');
                $(this).html('<i class="fa fa-chevron-up"></i> See less');
            }
            else if ($(this).attr('title') === 'See less') {
                $(`#eb_messageBox_container .msg`).text(settings.Message);
                $(this).attr('title', 'See more');
                $(this).html('<i class="fa fa-chevron-down"></i> See more');
            }
        });
    }

    function showMsg() {
        div();
        let $cont = $(`#eb_messageBox_container`);
        $cont.fadeIn();
        if (settings.AutoHide) {
            let tmr = $cont.data('data-tmr');
            if (tmr) clearTimeout(tmr);
            tmr = setTimeout(hideMsg, settings.Delay);
            $cont.data('data-tmr', tmr);
        }
        if (options.onShow)
            onShow();
    };

    function hideMsg() {
        $(`#eb_messageBox_container`).fadeOut();
        if (options.onHide)
            onHide();
    };

    if (operation === "show")
        showMsg();
    else if (operation === "hide")
        hideMsg();
    else return null;

};