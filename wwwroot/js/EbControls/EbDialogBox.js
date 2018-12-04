function EbDialog(action, options) {
    var operation = action;
    var settings = $.extend({
        Message: "nothing specified",
        Buttons: {
            "Ok": {
                Background: "green",
                Align: "right",
                FontColor:"white;"
            },
            "Cancel": {
                Background: "red",
                Align: "left",
                FontColor: "white;"
            }
        },
        CallBack: function (name) { }
    }, options);

    function div() {
        if ($("#eb_dlogBox_container").length === 0)
            $('body').append(`<div class="eb_dlgMsk"></div>
                                <div class="eb_dlogBox_container" id="eb_dlogBox_container">
                                    <div class="cw">
                                        <div class="_cls"><i class="fa fa-close"></i></div>
                                        <div class="msgbdy">${settings.Message}</div>
                                        <div class="cnfrmBox-btnc">
                                            ${generateBtn()}
                                        </div>
                                    </div>
                                </div>`);
        else {
            $(`#eb_dlogBox_container .msgbdy`).text(settings.Message);
            $(`#eb_dlogBox_container .cnfrmBox-btnc`).html(generateBtn());
        }
        $(".dlgBoxBtn-cust").off("click").on("click", function (ev) {
            let n = $(ev.target).attr("name");
            settings.CallBack(n);
            hideMsg();
        });
        $("#eb_dlogBox_container ._cls").on("click", function () { hideMsg(); });
    }

    function showMsg() {
        div();
        $(`#eb_dlogBox_container,.eb_dlgMsk`).fadeIn();
    };

    function hideMsg() {
        $(`#eb_dlogBox_container,.eb_dlgMsk`).fadeOut();
    };

    function generateBtn() {
        let html = [];
        for (let key in settings.Buttons) {
            html.push(`<button name="${key}" class="btn dlgBoxBtn-cust pull-${settings.Buttons[key].Align}"
                style="background:${settings.Buttons[key].Background};color:${settings.Buttons[key].FontColor}">${key}</button>`);
        }
        return html.join(" ");
    }

    if (operation === "show")
        showMsg();
    else if (operation === "hide")
        hideMsg();
    else return null;
};