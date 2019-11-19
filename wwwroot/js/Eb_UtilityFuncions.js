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
        $leftDiv.animate({ width: (lW - rW) + "%", marginLeft: 0 }, delay);
        $rightDiv.animate({ opacity: 1, marginLeft: 0, marginLeft: 0 }, delay);
    }
}

function isAllValuesTrue(Obj) {
    var all_true = true;
    for (var key in Obj) {
        if (!Obj[key]) {
            all_true = false;
            break;
        }
    }
    return all_true;
}

function EbRunValueExpr(ctrl, formObject, userObject, formObj, updateSpan) {
    if (ctrl.ValueExpr && ctrl.ValueExpr.Lang === 0 && ctrl.ValueExpr.Code) {
        let fun = new Function("form", "user", `event`, atob(ctrl.ValueExpr.Code)).bind(ctrl, formObject, userObject);
        let val = fun();
        val = EbConvertValue(val, ctrl.ObjType);

        valueExpHelper(val, ctrl, updateSpan);
    }
    else if (ctrl.ValueExpr && ctrl.ValueExpr.Lang === 2 && ctrl.ValueExpr.Code) {
        let params = [];

        ctrl.ValExpQueryDepCtrls = { $values: ["form.rate"] }; // hard code

        $.each(ctrl.ValExpQueryDepCtrls.$values, function (i, depCtrl_s) {
            try {
                let depCtrl = formObject.__getCtrlByPath(depCtrl_s);
                let valExpFnStr = atob(depCtrl.ValueExpr.Code);
                let val = new Function("form", "user", `event`, valExpFnStr).bind(depCtrl_s, formObject, userObject)();
                let param = { Name: depCtrl.Name, Value: depCtrl.getValue(), Type: "11" }; // hard code
                params.push(param);
            }
            catch (e) {
                console.eb_log("eb error :");
                console.eb_log(e);
                alert("error in 'Value Expression' of : " + curCtrl.Name + " - " + e.message);
            }
        }.bind(this));

        ExecQuery(formObj.RefId, ctrl.Name, params, ctrl, updateSpan);
    }
}

function valueExpHelper(val, ctrl, updateSpan) {
    val = EbConvertValue(val, ctrl.ObjType);
    ctrl.__eb_ValueExpr_val = val;

    if (ctrl.__eb_EditMode_val && ctrl.__eb_EditMode_val !== ctrl.__eb_ValueExpr_val) {
        //ctrl.setValue(ctrl.__eb_EditMode_val);
        console.warn(`edit mode value and valueExpression value are different for '${ctrl.Name}' control`);
    }
    else {
        if (ctrl.__eb_ValueExpr_val)
            ctrl.setValue(ctrl.__eb_ValueExpr_val);
    }
    if (updateSpan)
        $(`#td_${ctrl.EbSid_CtxId} .tdtxt>span`).text(ctrl.__eb_ValueExpr_val);
}

function showLoader4webform() {
    $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#WebForm-cont" } });
}

function hideLoader4webform() {
    $("#eb_common_loader").EbLoader("hide");
}

function ExecQuery(refId, ctrlName, params, ctrl, updateSpan) {
    showLoader4webform();
    var _ctrl = ctrl;
    var _updateSpan = updateSpan;
    $.ajax({
        type: "POST",
        //url: this.ssurl + "/bots",
        url: "/WebForm/ExecuteSqlValueExpr",
        data: {
            _refid: refId,
            _triggerctrl: ctrlName,
            _params: params
            //_params: [{ Name: PScontrol.Name, Value: "29.00" }]
        },
        error: function (xhr, ajaxOptions, thrownError) {
            hideLoader4webform();
            EbMessage("show", { Message: `Couldn't Update ${this.ctrl.Label}, Something Unexpected Occurred`, AutoHide: true, Background: '#aa0000' });
        }.bind(this),
        //beforeSend: function (xhr) {
        //    xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
        //}.bind(this),
        success: function (_respObjStr) {
            valueExpHelper(_respObjStr, _ctrl, _updateSpan);
            hideLoader4webform();
        }
    });
}

function getObjByval(ObjArray, key, val) {
    if (ObjArray === undefined) {
        console.error("ObjArray undefined");
        return false;
    }
    if (ObjArray.length === 0)
        return false;
    if (key === "name" && !(Object.keys(ObjArray[0]).includes("name")))
        key = "ColumnName";
    return ObjArray.filter(function (obj) { return obj[key] == val; })[0];
}

function getChildByName(ObjArray, key, val) {
    if (getObjByval(ObjArray, key, val) === undefined)
        return getChildByNameRec(ObjArray, key, val);
    return getObjByval(ObjArray, key, val);
}

function getChildByNameRec(ObjArray, key, val) {
    let Value = undefined;
    $.each(ObjArray, function (i, obj) {
        if (obj.IsContainer) {
            if (getObjByval(ObjArray[i].Columns.$values, key, val)) {
                Value = getObjByval(ObjArray[i].Columns.$values, key, val);
                return false;
            }
            else
                Value = getChildByNameRec(ObjArray[i].Columns.$values, key, val);
        }
        return;
    });
    return Value;
}

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
}

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

function hide_inp_loader($ctrl, $item) {
    if ($ctrl.hasClass("inp-inner-loader")) {
        $item.prop('disabled', false).css('pointer-events', 'inherit').css('color', $item.data("_color"));
        $ctrl.removeClass("inp-inner-loader");
    }
};

function show_inp_loader($ctrl, $item) {
    if (!$ctrl.hasClass("inp-inner-loader")) {
        $item.data("_color", $item.css('color'));
        $ctrl.addClass("inp-inner-loader");
        $item.attr('disabled', 'disabled').css('pointer-events', 'none').css('color', '#777');
    }
}

function ItemCount(array, item) {
    var count = 0;
    for (var i = 0; i < array.length; ++i) {
        if (array[i] === item)
            count++;
    }
    return count;
}

function dateDisplayNone() {
    document.addEventListener('scroll', function (e)
    {
        $('.xdsoft_datetimepicker').css("display", "none");
    }, true);
}