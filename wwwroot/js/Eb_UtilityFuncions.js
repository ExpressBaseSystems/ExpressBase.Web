function slideRight(leftDiv, rightDiv) {
    var $leftDiv = $(leftDiv);
    var $rightDiv = $(rightDiv);

    $stickBtn = $("<div id='stickBtnR' class='stickBtn' style='right: 0px;' onclick=\"slideRight('" + leftDiv + "', '" + rightDiv + "')\">PropertyBox</div>");

    lW = $leftDiv.width();
    rW = $rightDiv.width();
    if ($rightDiv.css("display") === "inline-block") {
        $rightDiv.animate({ width: 0 }, 300);
        $leftDiv.animate({ width: lW + rW + "px" }, 300);

        setTimeout(function () {
            $(".form-buider-cont").append($stickBtn);
            $stickBtn.css({ "right": (0 - ($stickBtn.width() / 2)) + "px", "top": (198 + ($stickBtn.width() / 2)) });
            $rightDiv.data("width", rW);
            $rightDiv.hide();
        }, 301);
    }
    else {
        rW = $rightDiv.data("width");
        $("#stickBtnR").remove();
        $rightDiv.show();
        $rightDiv.animate({ width: rW + "px" }, 300);
        $leftDiv.animate({ width: (lW - rW) + "px" }, 300);
    }
};

function slideLeft(leftDiv, rightDiv) {
    var $leftDiv = $(leftDiv);
    var $rightDiv = $(rightDiv);

    $stickBtn = $("<div id='stickBtnL' class='stickBtn' onclick=\"slideLeft('" + leftDiv + "', '" + rightDiv + "')\">ToolBox</div>");

    lW = $leftDiv.width();
    rW = $rightDiv.width();
    if ($rightDiv.css("display") === "inline-block") {
        $rightDiv.animate({ width: 0 }, 300);
        $leftDiv.animate({ width: lW + rW + "px" }, 300);

        setTimeout(function () {
            $(document.body).append($stickBtn);
            $stickBtn.css({ "left": (0 - ($stickBtn.width() / 2)) + "px", "top": (198 + ($stickBtn.width() / 2)) });
            $rightDiv.data("width", rW);
            $rightDiv.hide();
        }, 301);
    }
    else {
        rW = $rightDiv.data("width");
        $("#stickBtnL").remove();
        $rightDiv.show();
        $rightDiv.animate({ width: rW + "px" }, 300);
        $leftDiv.animate({ width: (lW - rW) + "px" }, 300);
    }
};

jQuery.fn.outerHTML = function (s) {
    return s
        ? this.before(s).remove()
        : jQuery("<p>").append(this.eq(0).clone()).html();
};