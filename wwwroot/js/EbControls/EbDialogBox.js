function EbDialog(action, options) {
    var operation = action;
    var settings = $.extend({
        Message: "Nothing specified",
        DefaultText: '',
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
        PromptLines: 1,
        hideClose: false,
        IncludeSelectInput: false,
        SelectInputOptions: [],
        SelectInputLabel: '',
        Title: '',
        CallBack: function (name, prompt) { console.log(name + ":" + prompt); }
    }, options);

    function div() {
        if ($("#eb_dlogBox_container").length === 0)
            $('body').append(`<div class="eb_dlgMsk"></div>
                                <div class="eb_dlogBox_container" id="eb_dlogBox_container">
                                    <div class="cw">
                                        @title@
                                        @close@
                                        <div class="msgbdy">${setMessage()}</div>
                                        <div class="cnfrmBox-btnc">
                                            ${generateBtn()}
                                        </div>
                                    </div>
                                </div>`.replace("@title@", settings.Title ? `<div class="_title">${settings.Title}</div>` : '')
                .replace("@close@", settings.hideClose ? '' : '<div class="_cls"><i class="fa fa-close"></i></div>'));
        else {
            $(`#eb_dlogBox_container .msgbdy`).html(setMessage());
            $(`#eb_dlogBox_container .cnfrmBox-btnc`).html(generateBtn());
        }

        $(".dlgBoxBtn-cust").off("click").on("click", function (ev) {

            let n = $(ev.target).attr("name");
            let prompt = settings.IsPrompt ? $("#eb_dlogBox_prompt_input").val() : undefined;
            let selected = {};
            if (settings.IncludeSelectInput) {
                let _v = $("#eb_dlogBox_select_input").val();
                selected = settings.SelectInputOptions.find(function (e) { return e.value == _v; });
            }

            if (!settings.CallBack(n, prompt, selected))
                hideMsg();
        });

        $("#eb_dlogBox_container ._cls").on("click", function () {
            settings.CallBack("close");
            hideMsg();
        });
    }

    function setMessage() {
        let _htm = '<div>';
        if (settings.IncludeSelectInput) {
            _htm += `<div> <label class="eb_dlogBox_select_label">${settings.SelectInputLabel} <sup style="color: red">*</sup></label> <select id='eb_dlogBox_select_input' class='eb_dlogBox_select_input'><option value='0' disabled selected>-- Select --</option>`;
            $.each(settings.SelectInputOptions, function (indx, obj) {
                _htm += `<option value='${obj.value}'>${obj.text}</option>`;
            });
            _htm += `</select></div>`;
        }

        if (settings.IsPrompt) {
            _htm += `<div class="eb_dlogBox_prompt_inputContainer"> <label class="eb_dlogBox_prompt_label">${settings.Message}<sup style="color: red">*</sup></label>`;
            if (settings.PromptLines && settings.PromptLines > 1)
                _htm += `<textarea type="text" id="eb_dlogBox_prompt_input" class="eb_dlogBox_prompt_input" rows="${settings.PromptLines}">${settings.DefaultText}</textarea>`;
            else
                _htm += `<input type="text" id="eb_dlogBox_prompt_input" class="eb_dlogBox_prompt_input" value='${settings.DefaultText}'/>`;
            _htm += `</div>`;
        }
        else
            _htm += settings.Message;
        _htm += '</div>';
        return _htm;
    }

    function showMsg() {
        div();
        $(`#eb_dlogBox_container,.eb_dlgMsk`).fadeIn();
        if (settings.$for)
            settings.$for.css('filter', 'blur(3px)');
        if (settings.IsPrompt)
            $("#eb_dlogBox_prompt_input").focus();
        else if ($('.dlgBoxBtn-cust').length > 0) {
            $($('.dlgBoxBtn-cust')[0]).focus();
        }
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