function EbDialog(action, options) {
    var operation = action;
    var settings = $.extend({
        Message: "Nothing specified",
        Buttons: {
            "Ok": {
                ClassName: "eb_dlogBox_defaultbutton",
                Background: "#508bf9",
                Align: "left",
                FontColor: "#ffffff"
            },
            "Cancel": {
                ClassName: "eb_dlogBox_defaultbutton default-cancel",
                Background: "#ffffff",
                Align: "right",
                FontColor: "#222222"
            }
        },
        IsPrompt: false,
        hideClose: false,
        CallBack: function (name, prompt) { console.log(name + ":" +prompt); }
    }, options);

    function div() {
        if ($("#eb_dlogBox_container").length === 0)
            $('body').append(`<div class="eb_dlgMsk"></div>
                                <div class="eb_dlogBox_container" id="eb_dlogBox_container">
                                    <div class="cw">
                                        @close@
                                        <div class="msgbdy">${setMessage()}</div>
                                        <div class="cnfrmBox-btnc">
                                            ${generateBtn()}
                                        </div>
                                    </div>
                                </div>`.replace("@close@", settings.hideClose ? '' : '<div class="_cls"><i class="fa fa-close"></i></div>'));
        else {
            $(`#eb_dlogBox_container .msgbdy`).html(setMessage());
            $(`#eb_dlogBox_container .cnfrmBox-btnc`).html(generateBtn());
        }

        $(".dlgBoxBtn-cust").off("click").on("click", function (ev) {

            let n = $(ev.target).attr("name");
            let prompt = settings.IsPrompt ? $("#eb_dlogBox_prompt_input").val() : undefined;

            settings.CallBack(n, prompt);
            hideMsg();
        });

        $("#eb_dlogBox_container ._cls").on("click", function () {
            settings.CallBack("close");
            hideMsg();
        });
    }

    function setMessage() {
        if (settings.IsPrompt) {
            return `<div class="eb_dlogBox_prompt_inputContainer">
                        <label class="eb_dlogBox_prompt_label">${settings.Message}</label>
                        <input type="text" id="eb_dlogBox_prompt_input" class="eb_dlogBox_prompt_input"/>
                    </div>`;
        }
        else
            return settings.Message;
    }

    function showMsg() {
        div();
        $(`#eb_dlogBox_container,.eb_dlgMsk`).fadeIn();
        if (settings.$for)
            settings.$for.css('filter', 'blur(3px)');
    };

    function hideMsg() {
        $(`#eb_dlogBox_container,.eb_dlgMsk`).fadeOut();
        if (settings.$for)
            settings.$for.css('filter', 'none');
    };

    function generateBtn() {
        let html = [];
        for (let key in settings.Buttons) {

            let classname = settings.Buttons[key].ClassName || "";

            html.push(`<button name="${key}" class="btn dlgBoxBtn-cust ${classname} pull-${settings.Buttons[key].Align}"
                style="background:${settings.Buttons[key].Background};color:${settings.Buttons[key].FontColor}">${key}</button>`);
        }
        return html.join(" ");
    }

    if (operation === "show") {
        showMsg();
        return true;
    }
    else if (operation === "hide") {
        hideMsg();
        return false;
    }
    else return null;
};