function EbPopBox(op,o) {
    var event = op;
    var settings = $.extend({
        Message: "nothing to display",
        Callback: function () {

        },
        ButtonStyle: {
            Text:"Close",
            Color: "white",
            Background: "#508bf9",
            Callback: function () {}
        },
        Title: "Message",
        Html: function ($selector) {

        }
    }, o);

    function popBoxHtml() {
        if ($("#eb-popbox-fade").length <= 0) {
            $("body").append(`<div class="eb-popbox-fade" id="eb-popbox-fade" style="position:fixed;display:none;
                                    height:100%;left:0;top:0;width:100%;background:black;opacity:.5;z-index:500">
                            </div>`);
        }
        if ($("#eb-popbox-container").length <= 0) {
            $('body').append(`<div class="eb-popbox-container" id="eb-popbox-container" style="position: fixed;display:none;
                                width: 100%;height: 100%;z-index: 1000;top: 0;left: 0;">
                                    <div class="eb-popbox-container-flex" style="height:inherit;width:inherit;
                                    display:flex;justify-content:center;align-items:center;">
                                        <div class="eb-popbox-container-inner" style="background:white;min-height: 200px;
                                        max-width:60%;display: flex;flex-flow: column;border: none;border-radius: 8px;
                                        box-shadow: 0 1px 3px 0 rgba(60, 64, 67, 0.3), 0 4px 8px 3px rgba(60, 64, 67, 0.15);min-width: 320px;">
                                            <div class="eb-popbox-container-head" style="padding: 15px;font-size: 16px;">
                                                ${settings.Title}
                                            </div>
                                            <div class="eb-popbox-container-bdy" style="flex: 1;padding: 0 15px;display:flex;align-items:center">
                                                ${settings.Message}
                                            </div>
                                            <div class="eb-popbox-container-footer" style="padding: 15px;display: flex;flex-flow: row-reverse;">
                                                <button id="eb-popbox-close" style="background: ${settings.ButtonStyle.Background};
                                                    color: ${settings.ButtonStyle.Color};
                                                    border-style: none;
                                                    border-radius: 4px;
                                                    padding: 5px 10px;">${settings.ButtonStyle.Text}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>`);
            $("#eb-popbox-close").on("click", function () { settings.ButtonStyle.Callback(); hideBox(); })
        }
        else {
            $("#eb-popbox-container .eb-popbox-container-head").text(settings.Title);
            $("#eb-popbox-container .eb-popbox-container-bdy").text(settings.Message);
        }
        settings.Html($("#eb-popbox-container .eb-popbox-container-bdy"));
    }

    function showBox() {
        popBoxHtml();
        $(`#eb-popbox-fade`).show();
        $(`#eb-popbox-container`).fadeIn();
    };

    function hideBox() {
        $(`#eb-popbox-fade`).hide();
        $(`#eb-popbox-container`).hide();
    };

    if (event === "show") {
        showBox();
        return true;
    }
    else if (event === "hide") {
        hideBox();
        return false;
    }
    else return false;
}