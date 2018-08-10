function slideRight(leftDiv, rightDiv) {
    let delay = 300;
    let dur = delay / 1000;
    $stickBtn = $("<div id='stickBtnR' class='stickBtn' onclick=\"slideRight('" + leftDiv + "', '" + rightDiv + "')\">PropertyBox</div>");
    let $leftDiv = $(leftDiv).css("animation-duration", dur + "s");
    let $rightDiv = $(rightDiv).css("animation-duration", dur + "s");
    slide("right", $leftDiv, $rightDiv, $stickBtn, delay);
};

function slideLeft(leftDiv, rightDiv) {
    let delay = 300;
    let dur = delay / 1000;
    $stickBtn = $("<div id='stickBtnL' class='stickBtn' onclick=\"slideLeft('" + leftDiv + "', '" + rightDiv + "')\">ToolBox</div>");
    let $leftDiv = $(leftDiv).css("animation-duration", dur + "s");
    let $rightDiv = $(rightDiv).css("animation-duration", dur + "s");
    slide("left", $leftDiv, $rightDiv, $stickBtn, delay);
};

function slide(dir, $leftDiv, $rightDiv, $stickBtn, delay) {
    let lW = $leftDiv.width() / $leftDiv.parent().width() * 100;
    let rW = $rightDiv.width() / $rightDiv.parent().width() * 100;

    if ($rightDiv.css("display") !== "none") {
        $rightDiv.data("width", rW);
        $rightDiv.css("margin-left", "-20px");
        $rightDiv.animate({ opacity: 0, marginLeft: "-" + rW + "%" }, delay);

        $leftDiv.animate({ width: lW + rW + "%" }, delay);

        setTimeout(function () {
            $(document.body).append($stickBtn.show());
            $stickBtn.css("top", (198 + ($stickBtn.width() / 2)) + "px").css(dir, (0 - ($stickBtn.width() / 2)) + "px");
            $rightDiv.hide();
        }, delay + 1);
    }
    else {
        rW = $rightDiv.data("width");
        if (dir === "right")
            $("#stickBtnR").remove();
        else
            $("#stickBtnL").remove();

        $rightDiv.show();
        $leftDiv.css("margin-left", "-20px");
        $leftDiv.animate({ width: (lW - rW) + "%", marginLeft: 0}, delay);
        $rightDiv.animate({ opacity: 1, marginLeft: 0, marginLeft: 0 }, delay);
    }
};



function getObjByval(ObjArray, key, val) {
    if (ObjArray === undefined) {
        console.error("ObjArray undefined");
        return false;
    }
    if (!ObjArray[0])
        console.log(4);
    if (ObjArray.length === 0)
        return false;
    if (key === "name" && !(Object.keys(ObjArray[0]).includes("name")))
        key = "ColumnName";
    return ObjArray.filter(function (obj) { return obj[key] == val; })[0];
};

jQuery.fn.outerHTML = function (s) {
    return s
        ? this.before(s).remove()
        : jQuery("<p>").append(this.eq(0).clone()).html();
};

function getKeyByVal(Obj, val) {
    var Key = null;
    $.each(Obj, function (_key, _val) {
        if (_val === val) {
            Key = _key;
            return;
        }
    });
    return Key;
};

function delKeyAndAfter(Obj, key) {
    var isReachKey = false;
    $.each(Obj, function (_key, _val) {
        if (key === _key) {
            isReachKey = true;
        }
        if (isReachKey)
            delete Obj[_key];
    });
};

function getBrowserName() {
    var ua = navigator.userAgent, tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(' ');
};

function ArrayToObject(arr) {
    var rv = {};
    for (var i = 0; i < arr.length; ++i)
        rv[i] = arr[i];
    return rv;
}

//// object.unwatch
//if (!Object.prototype.unwatch) {
//    Object.defineProperty(Object.prototype, "unwatch", {
//        enumerable: false
//        , configurable: true
//        , writable: false
//        , value: function (prop) {
//            var val = this[prop];
//            delete this[prop]; // remove accessors
//            this[prop] = val;
//        }
//    });
//}

function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};