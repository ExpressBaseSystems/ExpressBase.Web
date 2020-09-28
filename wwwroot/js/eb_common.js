(function ($) {
    if ($.fn.style) {
        return;
    }

    // Escape regex chars with \
    var escape = function (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    // For those who need them (< IE 9), add support for CSS functions
    var isStyleFuncSupported = !!CSSStyleDeclaration.prototype.getPropertyValue;
    if (!isStyleFuncSupported) {
        CSSStyleDeclaration.prototype.getPropertyValue = function (a) {
            return this.getAttribute(a);
        };
        CSSStyleDeclaration.prototype.setProperty = function (styleName, value, priority) {
            this.setAttribute(styleName, value);
            var priority = typeof priority != 'undefined' ? priority : '';
            if (priority != '') {
                // Add priority manually
                var rule = new RegExp(escape(styleName) + '\\s*:\\s*' + escape(value) +
                    '(\\s*;)?', 'gmi');
                this.cssText =
                    this.cssText.replace(rule, styleName + ': ' + value + ' !' + priority + ';');
            }
        };
        CSSStyleDeclaration.prototype.removeProperty = function (a) {
            return this.removeAttribute(a);
        };
        CSSStyleDeclaration.prototype.getPropertyPriority = function (styleName) {
            var rule = new RegExp(escape(styleName) + '\\s*:\\s*[^\\s]*\\s*!important(\\s*;)?',
                'gmi');
            return rule.test(this.cssText) ? 'important' : '';
        }
    }

    // The style function
    $.fn.style = function (styleName, value, priority) {
        // DOM node
        var node = this.get(0);
        // Ensure we have a DOM node
        if (typeof node == 'undefined') {
            return this;
        }
        // CSSStyleDeclaration
        var style = this.get(0).style;
        // Getter/Setter
        if (typeof styleName != 'undefined') {
            if (typeof value != 'undefined') {
                // Set style property
                priority = typeof priority != 'undefined' ? priority : '';
                style.setProperty(styleName, value, priority);
                return this;
            } else {
                // Get style property
                return style.getPropertyValue(styleName);
            }
        } else {
            // Get CSSStyleDeclaration
            return style;
        }
    };
})(jQuery);

console.eb_log = function (msg, color = "rgb(19, 0, 78)", bgcolor) {
    console.log(`%c${msg}`, `color:${color};
            padding:1px 2px;
            border-radius:2px;
            text-shadow: 1px 1px 1px #eef;`);

};

console.dev_log = function (msg) {
    if (ebcontext.env === "Development")
        console.log(msg);
};

console.eb_error = function (msg, color = "rgb(222, 0, 0)", bgcolor) {
    console.log(`%c${msg}`, `color:${color};
            padding:1px 2px;
            border-radius:2px;
            text-shadow: 1px 1px 1px #eef;`);
};

console.eb_info = function (msg, color = "#0060de", bgcolor) {
    console.log(`%c${msg}`, `color:${color};
            padding:1px 2px;
            border-radius:2px;
            text-shadow: 1px 1px 1px #eef;`);
};

console.eb_warn = function (msg, color = "rgb(222, 112, 0)", bgcolor) {
    console.log(`%c${msg}`, `color:${color};
            padding:1px 2px;
            border-radius:2px;
            text-shadow: 1px 1px 1px #eef;`);
};

function GetObjectById(id) {
    if (id === 18)
        return { Name: "BotForm", Image: "chat1" };
    if (id === 17)
        return { Name: "ChartVisualization", Image: "fa fa-bar-chart" };
    if (id === 2)
        return { Name: "DataSource", Image: "fa fa-database.svg" };
    if (id === 3)
        return { Name: "Report", Image: "fa fa-file-pdf-o" };
    if (id === 16)
        return { Name: "TableVisualization", Image: "fa fa-table" };
    if (id === 14)
        return { Name: "UserControl", Image: "form1" };
    if (id === 0)
        return { Name: "WebForm", Image: "fa fa-wpforms" };
};

function beforeSendXhr(xhr) {
    var b = document.cookie.match('(^|;)\\s*bToken\\s*=\\s*([^;]+)');
    var tok = b ? b.pop() : '';
    if (isJwtTokExpired(tok)) {
        var x = new XMLHttpRequest();
        x.open("POST", "http://localhost:8000/access-token", false);
        x.send({ refreshtoken: getrToken() });
        if (x.status === 200)
            tok = JSON.parse(x.responseText).accessToken;
    }
    xhr.setRequestHeader("Authorization", "Bearer " + tok);
}

function getToken() {
    var b = document.cookie.match('(^|;)\\s*bToken\\s*=\\s*([^;]+)');
    var tok = b ? b.pop() : '';
    if (isJwtTokExpired(tok)) {
        $.ajax({
            type: "POST",
            url: "http://localhost:8000/access-token",
            data: { refreshtoken: getrToken() },
            success: function (d) {
                document.cookie = "bToken=" + d.accessToken
            }
        });
    }
    else
        return tok;
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
}

function isJwtTokExpired(token) {
    return (parseJwt(token).exp < Date.now() / 1000);
}

function getrToken() {
    var b = document.cookie.match('(^|;)\\s*rToken\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}

function getTok() {
    return getCookieVal("bToken");
}

function getCookieVal(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}

var Agginfo = function (col, deci, index) {
    this.colname = col;
    this.deci_val = deci;
    this.data = index;
};

function fltr_obj(type, name, value) {
    this.Type = type;
    this.Name = name;
    this.Value = value;
};

var filter_obj = function (colu, oper, valu, typ) {
    this.Column = colu;
    this.Operator = oper;
    this.Value = valu;
    this.Type = typ;
};

var order_obj = function (colu, dir) {
    this.Column = colu;
    this.Direction = dir;
};


Array.prototype.contains = function (element) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === element) {
            return true;
        }
    }

    return false;
};

Array.prototype.moveToFirst = function (index) {
    var temp = this[index];
    this.splice(index, 1);
    this.unshift(temp);
};

Array.prototype.swap = function (x, y) {
    var b = this[x];
    this[x] = this[y];
    this[y] = b;
}
//Array.prototype.splice = function (startIdx, noOfEleRet) {
//    var arr = [];
//    for (var i = startIdx; i < (startIdx+noOfEleRet); i++) {
//        arr.push(this[i]);
//    }

//    return arr;
//};

function isPrintable(e) {
    var keycode = e.keyCode;

    var valid =
        (keycode > 47 && keycode < 58) || // number keys
        keycode === 32 || keycode === 13 || // spacebar & return key(s) (if you want to allow carriage returns)
        (keycode > 64 && keycode < 91) || // letter keys
        (keycode > 95 && keycode < 112) || // numpad keys
        (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
        (keycode > 218 && keycode < 223);   // [\]' (in order)

    return valid;
}

function getEbObjectTypes() {
    Eb_ObjectTypes = {
        WebForm: { Id: 0, ImgSrc: "fa fa-wpforms" },
        DisplayBlock: { Id: 1, ImgSrc: "form1.svg" },
        DataSource: { Id: 2, ImgSrc: "fa fa-database" },
        Report: { Id: 3, ImgSrc: "fa fa-file-pdf-o" },
        Table: { Id: 4, ImgSrc: "fa fa-table" },
        SqlFunction: { Id: 5, ImgSrc: "form1.svg" },
        SqlValidator: { Id: 6, ImgSrc: "form1.svg" },
        JavascriptFunction: { Id: 7, ImgSrc: "form1.svg" },
        JavascriptValidator: { Id: 8, ImgSrc: "form1.svg" },
        DataVisualization: { Id: 11, ImgSrc: "dv1.svg" },
        FilterDialog: { Id: 12, ImgSrc: "fa fa-filter" },
        MobileForm: { Id: 13, ImgSrc: "form1.svg" },
        UserControl: { Id: 14, ImgSrc: "form1.svg" },
        EmailBuilder: { Id: 15, ImgSrc: "fa fa-envelope-o" },
        TableVisualization: { Id: 16, ImgSrc: "fa fa-table" },
        ChartVisualization: { Id: 17, ImgSrc: "fa fa-bar-chart" },
        BotForm: { Id: 18, ImgSrc: "chat1.svg" },
    }
    return Eb_ObjectTypes;
}

function EbAddInvalidStyle(msg, type) {
    if (this.ObjType === "PowerSelect" && !this.RenderAsSimpleSelect)
        EbMakeInvalid(this, `#${this.EbSid_CtxId}Container`, `#${this.EbSid_CtxId}Wraper`, msg, type);
    else
        EbMakeInvalid(this, `#cont_${this.EbSid_CtxId}`, `.ctrl-cover`, msg, type);
}

function EbRemoveInvalidStyle() {
    EbMakeValid(`#cont_${this.EbSid_CtxId}`, `.ctrl-cover`, this);
}

function DGaddInvalidStyle(msg, type) {
    EbMakeInvalid(this, `#td_${this.EbSid_CtxId}`, `.ctrl-cover`, msg, type);
}

function DGremoveInvalidStyle() {
    EbMakeValid(`#td_${this.EbSid_CtxId}`, `.ctrl-cover`, this);
}


function EbMakeInvalid(ctrl, contSel, _ctrlCont, msg = "This field is required", type = "danger") {
    let shadowColor = "rgb(255 0 0)";
    if (type === "warning")
        shadowColor = "rgb(236, 151, 31)";
    if ($(`${contSel} .req-cont`).length !== 0)
        return;
    //var $ctrlCont = (this.curForm.renderAsForm) ? $(`${contSel}  .ctrl-wraper`) : $(`${contSel} .chat-ctrl-cont`);
    let $ctrlCont = $(`${contSel}  ${_ctrlCont}:first`);
    $ctrlCont.after(`<div class="req-cont"><label id='@name@errormsg' class='text-${type}'></label></div>`);
    $ctrlCont.css("border", `1px solid ${shadowColor}`).siblings("[name=ctrlsend]").css('disabled', true);
    $(`${contSel}  .text-${type}`).text(msg).hide().slideDown(100);

    if (ctrl)
        $(`[ebinval-ctrls*=' invalid-by-${'ctrl.EbSid_CtxId}'}']`).addClass(`invalid-by-${ctrl.EbSid_CtxId}`);
}

function EbMakeValid(contSel, _ctrlCont, ctrl) {
    //setTimeout(function () {
    $(`${contSel}  ${_ctrlCont}:first`).css("border", "1px solid rgba(34,36,38,.15)").siblings("[name=ctrlsend]").css('disabled', false);
    $(`${contSel} .req-cont:first`).animate({ opacity: "0" }, 300).remove();
    //},400);
    if (ctrl)
        $(`.invalid-by-${ctrl.EbSid_CtxId}`).removeClass(`invalid-by-${ctrl.EbSid_CtxId}`);
}

function EbBlink(ctrl) {
    $(`#${ctrl.EbSid_CtxId}Wraper`).addClass("ebblink");
    setTimeout(function () { $(`#${ctrl.EbSid_CtxId}Wraper`).removeClass("ebblink"); }, 700);
}


//function EbMakeInvalid(contSel, _ctrlCont, msg = "This field is required", type = "danger") {
//    let borderColor = "rgb(242 5 0)";
//    if (type === "warning")
//        borderColor = "rgb(236, 151, 31)";

//    if ($(`${contSel} .req-cont`).length !== 0)
//        return;

//    let $ctrlCont = $(`${contSel}  ${_ctrlCont}:first`);
//    if ($ctrlCont.children(".ebctrl-msg-cont").length !== 1)
//        $ctrlCont.append(`<div class="ebctrl-msg-cont"></div>`);

//    if ($ctrlCont.find(`.ebctrl-msg-cont .text-${type}`).length === 1)
//        $ctrlCont.find(`.ebctrl-msg-cont .text-${type}`).remove();

//    $ctrlCont.find('.ebctrl-msg-cont').append(`<span id='@name@errormsg' tabindex="0" class='text-${type} ebctrl-msg-span'><i class="fa fa-info-circle" aria-hidden="true"></i></span>`);


//    $ctrlCont.find(`.ebctrl-msg-cont .text-${type}`).popover({
//        trigger: 'hover',
//        html: true,
//        container: "body",
//        placement: function (context, source) {
//            if (($(source).offset().left + 700) > document.body.clientWidth)
//                return "left";
//            else {
//                return "right";
//            }
//        },
//        content: msg
//    });




//    $ctrlCont.css("border", `1px solid ${borderColor}`).siblings("[name=ctrlsend]").css('disabled', true);
//    $ctrlCont.find(`.ebctrl-msg-cont .text-${type}`).show(100);
//}

//function EbMakeValid(contSel, _ctrlCont) {
//    //setTimeout(function () {
//    $(`${contSel}  ${_ctrlCont}:first`).css("box-shadow", "inherit").siblings("[name=ctrlsend]").css('disabled', false);
//    $(`${contSel} .ebctrl-msg-cont:first`).empty();
//    //},400);
//}


function EbShowCtrlMsg(contSel, _ctrlCont, msg = "This field is required", type = "danger") {
    if ($(`${contSel} .ctrl-info-msg-cont`).length !== 0)
        return;
    //var $ctrlCont = (this.curForm.renderAsForm) ? $(`${contSel}  .ctrl-wraper`) : $(`${contSel} .chat-ctrl-cont`);
    let $ctrlCont = $(`${contSel}  ${_ctrlCont}:first`);
    $ctrlCont.after(`<div class="ctrl-info-msg-cont"><label id='@name@errormsg' class='text-${type}'></label></div>`);
    $(`${contSel}  .text-${type}`).text(msg).hide().slideDown(100);
}

function EbHideCtrlMsg(contSel, _ctrlCont) {
    //setTimeout(function () {
    $(`${contSel} .ctrl-info-msg-cont:first`).animate({ opacity: "0" }, 300).remove();
    //},400);
}

function sortByProp(arr, prop) {

    arr.sort(function (a, b) {
        if (a[prop] < b[prop])
            return -1;
        if (a[prop] > b[prop])
            return 1;
        return 0;
    });
    return arr;
};


var EbStickButton = function (option) {
    this.label = option.label;
    this.icon = option.icon || "fa-wrench";
    this.$stickBtn = $(`<div class='stickBtn'><i class='fa ${this.icon}' aria-hidden='true'></i> ${this.label} </div>`);
    this.$wraper = option.$wraper;
    this.$extCont = option.$extCont || this.$wraper.parent();
    this.delay = option.delay || 300;
    this.dir = option.dir || "right";
    this.$scope = option.$scope || $(document.body)
    this.pgtop = option.btnTop || (this.$wraper.offset().top - $(window).scrollTop());
    this.style = option.style;
    $(this.$scope).append(this.$stickBtn);

    this.toggleStickButton = function () {

        if (this.$stickBtn.css("display") === "none")
            this.maximise();
        else
            this.minimise();
    };

    this.maximise = function () {
        this.$stickBtn.hide(this.delay);
        this.$extCont.show(this.delay);
        //this.$extCont.show().animate({ width: this.extWidth, opacity: 1 }, this.delay);
    };

    this.minimise = function () {
        //this.extWidth = this.$extCont.width();
        this.$stickBtn.show(this.delay);
        this.$extCont.hide(this.delay);
        //this.$extCont.animate({ width: 0 , opacity:0}, this.delay, function () { $(this).hide() });


        setTimeout(function () {
            this.$stickBtn.css("top", (this.pgtop + (this.$stickBtn.width() / 2)) + "px");
            if (this.style)
                this.$stickBtn.css(this.style);
            this.$stickBtn.css(this.dir, (0 - (this.$stickBtn.width() / 2)) + "px");
        }.bind(this), this.delay + 1);
    }

    this.hide = function () {
        this.minimise();
        setTimeout(function () {
            this.$stickBtn.hide();
        }.bind(this), this.delay + 1);
    }
    this.$stickBtn.on("click", this.maximise.bind(this));
};

function getSum(_array) {
    return _array.reduce(function (a, b) {
        if (typeof a === 'string') {
            a = a.replace(/[^\d.-]/g, '') * 1;
        }
        if (typeof b === 'string') {
            b = b.replace(/[^\d.-]/g, '') * 1;
        }

        return parseInt(a) + parseInt(b);
    });
}

function getAverage(_array) {
    return getSum(_array) / _array.length;
}

function gettypefromNumber(num) {
    if (num == 16)
        return "String";
    else if (num == 6 || num == 5)
        return "DateTime";
    else if (num == 3)
        return "Boolean";
    else if (num == 8 || num == 7 || num == 11 || num == 12)
        return "Numeric";
}

function gettypefromString(str) {
    if (str == "String")
        return "16";
    else if (str == "DateTime")
        return "6";
    else if (str == "Boolean")
        return "3";
    else if (str == "Int32")
        return "11";
    else if (str == "Decimal")
        return "7";
    else if (str == "Double")
        return "8";
    else if (str == "Numeric")
        return "12";
    else if (str == "Date")
        return "5";
}

function JsonToEbControls(ctrlsContainer) {
    $.each(ctrlsContainer.Controls.$values, function (i, obj) {
        if (obj.IsContainer) {
            JsonToEbControls(obj);
        }
        else
            ctrlsContainer.Controls.$values[i] = new ControlOps[obj.ObjType](obj);
    });
};

function getControlsUnderTable(container, tableName) {
    let coll = [];
    RecurGetControlsUnderTable(container, coll, tableName);
    return coll;

}

function RecurGetControlsUnderTable(src_obj, dest_coll, tableName) {
    $.each(src_obj.Controls.$values, function (i, obj) {
        if (obj.IsContainer) {
            RecurGetControlsUnderTable(obj, dest_coll, tableName);

        }
        else if (src_obj.TableName === tableName && !src_obj.IsSpecialContainer)
            dest_coll.push(obj);
    });
}

function RecurSetParentsEbSid_CtxId(container, ctrl, flagObj) {
    if (flagObj.done)
        return;
    for (var i = 0; i < container.Controls.$values.length; i++) {
        let obj = container.Controls.$values[i];
        obj.parentEbSid = container.EbSid_CtxId;
        if (obj.IsContainer) {
            RecurSetParentsEbSid_CtxId(obj, ctrl, flagObj);
        }
        else {
            if (obj.EbSid_CtxId === ctrl.EbSid_CtxId) {
                flagObj.done = true;
                return false;
            }
        }

    }
}

function RecurGetParentsOfType(parents, ctrlType, ctrl, flatCtrls) {
    if (!ctrl.parentEbSid)
        return;
    let parentObj = getObjByval(flatCtrls, "EbSid_CtxId", ctrl.parentEbSid)
    if (parentObj.ObjType === ctrlType) {
        parents.push(parentObj);
    }
    RecurGetParentsOfType(parents, ctrlType, parentObj, flatCtrls);
}

function getParentsOfType(ctrlType, ctrl, container) {
    let parents = [];
    let flagObj = { done: false };
    RecurSetParentsEbSid_CtxId(container, ctrl, flagObj);
    let flatCtrls = getAllctrlsFrom(container);
    RecurGetParentsOfType(parents, ctrlType, ctrl, flatCtrls);
    return parents;
}

//function getTableNames(container, dest_coll) {
//    let tableNames = [];
//    if (container.TableName)
//    dest_coll.push(container.TableName);
//    recurGetTableNames(container, tableNames);
//    return tableNames;
//}

//function recurGetTableNames(container, dest_coll) {
//    for (let i = 0; i < container.Controls.$values.length; i++) {
//        let ctrl = container.Controls[i];
//        if (ctrl.IsContainer) {
//            if (ctrl.IsSpecialContainer)
//                continue;
//            else {
//                dest_coll.push(container.TableName);
//                recurGetTableNames(container, dest_coll);
//            }
//        }
//        else
//            return;
//    }
//}

function getFlatContControls(formObj) {
    let coll = [];
    if (formObj.IsContainer)
        coll.push(formObj);

    RecurFlatContControls(formObj, coll);
    return coll;
}


function getInnerFlatContControls(formObj) {
    let coll = [];

    RecurFlatContControls(formObj, coll);
    return coll;
}

function RecurFlatContControls(src_obj, dest_coll) {
    $.each(src_obj.Controls.$values, function (i, obj) {
        if (obj.IsContainer) {
            dest_coll.push(obj);
            RecurFlatContControls(obj, dest_coll);
        }
    });
}


function getAllctrlsFrom(formObj) {
    let coll = [];
    coll.push(formObj);
    RecurgetAllctrlsFrom(formObj, coll);
    return coll;
}

function RecurgetAllctrlsFrom(src_obj, dest_coll) {
    $.each(src_obj.Controls.$values, function (i, obj) {
        dest_coll.push(obj);
        if (obj.IsContainer) {
            RecurgetAllctrlsFrom(obj, dest_coll);
        }
    });
}

function getFlatCtrlObjs(formObj) {
    let coll = [];
    RecurFlatCtrlObjs(formObj, coll);
    return coll;
}

function RecurFlatCtrlObjs(src_obj, dest_coll) {
    $.each(src_obj.Controls.$values, function (i, obj) {
        if (obj.IsSpecialContainer)
            return true;
        if (obj.IsContainer)
            RecurFlatCtrlObjs(obj, dest_coll);
        else
            dest_coll.push(obj);
    });
}


function getFlatControls(formObj) {
    let coll = [];
    RecurFlatControls(formObj, coll);
    return coll;
}

function RecurFlatControls(src_obj, dest_coll) {
    $.each(src_obj.Controls.$values, function (i, obj) {
        dest_coll.push(obj);
        if (obj.IsContainer) {
            RecurFlatControls(obj, dest_coll);
        }
    });
}

function getValsFromForm(formObj) {
    let fltr_collection = [];
    let flag = 1;
    $.each(getFlatCtrlObjs(formObj), function (i, obj) {
        if (obj.ObjType === "FileUploader")
            return;
        fltr_collection.push(new fltr_obj(obj.EbDbType, obj.Name, obj.getValue()));
        //if (obj.ObjType === "PowerSelect")
        //    flag++;
    });
    if (flag > 0) {
        var temp = $.grep(fltr_collection, function (obj) { return obj.Name === "eb_loc_id"; });
        if (temp.length === 0)
            fltr_collection.push(new fltr_obj(11, "eb_loc_id", store.get("Eb_Loc-" + ebcontext.sid + ebcontext.user.UserId)));
        temp = $.grep(fltr_collection, function (obj) { return obj.Name === "eb_currentuser_id"; });
        if (temp.length === 0)
            fltr_collection.push(new fltr_obj(11, "eb_currentuser_id", ebcontext.user.UserId));
    }

    return fltr_collection;
}

function isNaNOrEmpty(val) {
    return (typeof val === "number" && isNaN(val)) || (typeof val === "string" && val.trim() === "");
};

function getFlatContObjsOfType(ContObj, type) {
    let ctrls = [];
    let flat = getFlatContControls(ContObj);
    $.each(flat, function (i, ctrl) {
        if (ctrl.ObjType === type)
            ctrls.push(ctrl);
    });
    return ctrls;
}

function getFlatObjOfTypes(ContObj, typesArr) {
    let ctrls = [];
    let flat = getFlatControls(ContObj);
    $.each(flat, function (i, ctrl) {
        if (typesArr.contains(ctrl.ObjType))
            ctrls.push(ctrl);
    });
    return ctrls;
}

function getFlatObjOfType(ContObj, type) {
    let ctrls = [];
    let flat = getFlatControls(ContObj);
    $.each(flat, function (i, ctrl) {
        if (ctrl.ObjType === type)
            ctrls.push(ctrl);
    });
    return ctrls;
}

function getValsForViz(formObj) {
    let fltr_collection = [];
    $.each(getFlatControls(formObj), function (i, obj) {
        var value = obj.getValue();
        if (value == "" || value == null) {
            if (obj.EbDbType === 7 || obj.EbDbType === 8)
                value = 0;
            else if (obj.EbDbType === 16)
                value = "0";
        }
        if (obj.ObjType === "CalendarControl") {
            fltr_collection.push(new fltr_obj(obj.EbDbType, "datefrom", value.split(",")[0]));
            fltr_collection.push(new fltr_obj(obj.EbDbType, "dateto", value.split(",")[1]));
        }
        else
            fltr_collection.push(new fltr_obj(obj.EbDbType, obj.Name, value));
    });
    return fltr_collection;
}


function getSingleColumn(obj) {
    let SingleColumn = {};
    SingleColumn.Name = obj.Name;
    SingleColumn.Type = obj.EbDbType;
    SingleColumn.Value = (obj.ObjType === "PowerSelect" && obj.__isFDcontrol) ? -1 : "";
    //SingleColumn.ObjType = obj.ObjType;
    SingleColumn.D = "";
    SingleColumn.C = undefined;
    SingleColumn.R = [];
    obj.DataVals = SingleColumn;
    obj.curRowDataVals = $.extend(true, {}, SingleColumn);

    //SingleColumn.AutoIncrement = obj.AutoIncrement || false;
    return SingleColumn;
}

//JQuery extends
(function ($) {
    $.fn.closestInner = function (filter) {
        var $found = $(),
            $currentSet = this; // Current place
        while ($currentSet.length) {
            $found = $currentSet.filter(filter);
            if ($found.length) break;  // At least one match: break loop
            // Get all children of the current set
            $currentSet = $currentSet.children();
        }
        return $found.first(); // Return first match of the collection
    }
})(jQuery);

//JQuery extends ends

//Object.defineProperty(window, "store", {
//    get: function () {
//        let t = fromConsole();
//        return true;
//    },
//    set: function (val) {
//        _z = val;
//    }
//});

function Test() {
    var b = `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImlwNCJ9.eyJpc3MiOiJzc2p3dCIsInN1YiI6ImViZGJsbHoyM25rcWQ2MjAxODAyMjAxMjAwMzA6YmluaXZhcmdoZXNlQGdtYWlsLmNvbTpkYyIsImlhdCI6MTU1OTEwNzQ5NCwiZXhwIjoxNTU5MTA3NTg0LCJlbWFpbCI6ImJpbml2YXJnaGVzZUBnbWFpbC5jb20iLCJjaWQiOiJlYmRibGx6MjNua3FkNjIwMTgwMjIwMTIwMDMwIiwidWlkIjo1LCJ3YyI6ImRjIn0.aD8kZxYN8ZGmoAA2EyxVzxfAPMyZXmg1NSiNzHaG6_I1frKVGqrFmJZHt0dPERabvx-mM-N5wtXuwRyJ1y8nZRLqvyyazaR4DLJlxRvievs14qLpAe7z6X_gAkR_-6KruEA6HP_-rAn53ImaIMs9fUnRb37K9djjU-caNCdYpDk`
    var r = `eyJ0eXAiOiJKV1RSIiwiYWxnIjoiUlMyNTYiLCJraWQiOiJpcDQifQ.eyJzdWIiOiJlYmRibGx6MjNua3FkNjIwMTgwMjIwMTIwMDMwOmJpbml2YXJnaGVzZUBnbWFpbC5jb206ZGMiLCJpYXQiOjE1NTkxMDcyNTIsImV4cCI6MTU1OTE5MzY1Mn0.C4yc6D_M4pnjh1xbroqmmgzZHE8r3kdTP_EBne2HiM7HCVkCDtcHpYEdJIicopHeEFORtcdmvnIKFKtuSgmTHIhlSRiTh3dIpyq4c4AnsR1BJnEPSAXhy8eOjrniogEdG6zjLNwDiS_rpC5248oizzgkUWGw9hd2E4RPwCS-oh8`;
    $.ajax({
        url: "/api/api_get_followup_by_lead/1.0.0/json",
        type: "POST",
        cache: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("bToken", b);
            xhr.setRequestHeader("rToken", r);
        },
        data: {
            "lead_id": 1,
        },
        success: function (result) {
            console.log(result);
        }.bind(this)
    });
}

function string2EBType(val, type) {
    if (typeof val !== "string")
        return val;
    let formatedVal = val;
    if (type === 7 || type === 8) {
        formatedVal = parseFloat(val);
    }
    else if (type === 10 || type === 11 || type === 12) {
        formatedVal = parseInt(val);
    }
    return formatedVal;
}

function EbConvertValue(val, type) {
    if (type === 11) {
        val = val.replace(/,/g, "");//  temporary fix
        return parseInt(val);
    }
    else if (type === 3) {
        return val === "true";
    }
    return val;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

var default_colors = ['#3366CC', '#DC3912', '#FF9900', '#109618', '#990099', '#3B3EAC', '#0099C6', '#DD4477', '#66AA00', '#B82E2E', '#316395', '#994499', '#22AA99', '#AAAA11', '#6633CC', '#E67300', '#8B0707', '#329262', '#5574A6', '#3B3EAC']

var datasetObj = function (label, data, backgroundColor, borderColor, fill) {
    this.label = label;
    this.data = data;
    this.backgroundColor = backgroundColor;
    this.borderColor = borderColor;
    this.fill = fill;
};

var datasetObj4Pie = function (label, data, backgroundColor, borderColor, fill) {
    this.label = label;
    this.data = data;
    var color = [], width = [];
    $.each(this.data, function (i, obj) {
        color.push(randomColor());
        width.push(1);
    });
    this.backgroundColor = color;
    this.borderColor = color;
    this.borderWidth = width;
};

var ChartColor = function (name, color) {
    this.Name = name;
    this.Color = color;
};

var animateObj = function (duration) {
    this.duration = duration;
    this.onComplete = function () {
        var chartInstance = this.chart,
            ctx = chartInstance.ctx;

        ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        this.data.datasets.forEach(function (dataset, i) {
            var meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
                var data = dataset.data[index];
                ctx.fillText(data, bar._model.x, bar._model.y - 5);
            });
        });
    };
}

var EbTags = function (settings) {
    this.displayFilterDialogArr = (typeof settings.displayFilterDialogArr !== "undefined") ? settings.displayFilterDialogArr : [];
    this.displayColumnSearchArr = (typeof settings.displayColumnSearchArr !== "undefined") ? settings.displayColumnSearchArr : [];
    this.id = $(settings.id);

    this.show = function () {
        this.id.empty();
        var filter = "";
        $.each(this.displayFilterDialogArr, function (i, ctrl) {
            filter = ctrl.title + " " + ctrl.operator + " " + ctrl.value;
            this.id.append(`<div class="tagstyle priorfilter">${filter}</div>`);
            if (ctrl.logicOp !== "")
                this.id.append(`<div class="tagstyle priorfilter">${ctrl.logicOp}</div>`);
        }.bind(this));

        if (this.displayFilterDialogArr.length > 0 && this.displayColumnSearchArr.length > 0)
            this.id.append(`<div class="tagstyle op">AND</div>`);

        $.each(this.displayColumnSearchArr, function (i, search) {
            filter = search.title + " " + returnOperator(search.operator.trim());
            filter += " " + search.value;
            this.id.append(`<div class="tagstyle" data-col="${search.name}" data-val="${search.value}">${filter} <i class="fa fa-close"></i></div>`);
            if (search.logicOp !== "")
                this.id.append(`<div class="tagstyle op">${search.logicOp}</div>`);
        }.bind(this));

        if (this.id.children().length === 0)
            this.id.hide();
        else {
            this.id.children().find(".fa-close").off("click").on("click", this.removeTag.bind(this));
            this.id.show();
        }
    };

    this.removeTag = function (e) {
        var tempcol = $(e.target).parent().attr("data-col");
        var tempval = $(e.target).parent().attr("data-val");
        var temp = $.grep(this.displayColumnSearchArr, function (obj) {
            if (typeof obj.value === "number")
                return obj.name === tempcol && obj.value === parseInt(tempval);
            else
                return obj.name === tempcol && obj.value === tempval;
        });
        $(e.target).parent().prev().remove();
        $(e.target).parent().remove();
        settings.remove(e, temp[0]);
    };

    this.show();
};

function dgOnChangeBind() {
    $.each(this.Controls.$values, function (i, col) {
        if ((col.OnChangeFn && col.OnChangeFn.Code && col.OnChangeFn.Code.trim() !== '') || col.DependedValExp.$values.length > 0) {
            let FnString = atob(col.OnChangeFn.Code) + (col.DependedValExp.$values.length !== 0 ? `;
                let curCtrl = form.__getCtrlByPath(this.__path);
                if(!curCtrl.___isNotUpdateValExpDepCtrls){
                    form.updateDependentControls(curCtrl)
                }
                curCtrl.___isNotUpdateValExpDepCtrls = false;

` : '');
            let OnChangeFn = new Function('form', 'user', `event`, FnString).bind(col, this.formObject, this.__userObject);

            col.bindOnChange({ form: this.formObject, col: col, DG: this, user: this.__userObject }, OnChangeFn);
        }
    }.bind(this));
}

function dgEBOnChangeBind() {
    $.each(this.Controls.$values, function (i, col) {// need change
        let OnChangeFn = function (form, user, event) {
            //let __this = form.__getCtrlByPath(this.__path);
            let __this = $(event.target).data('ctrl_ref');// when trigger change from setValue(if the setValue called from inactive row control)
            if (__this === undefined)
                __this = form.__getCtrlByPath(this.__path);

            if (__this.DataVals !== undefined) {
                let v = __this.getValueFromDOM();
                let d = __this.getDisplayMemberFromDOM();
                if (__this.ObjType === 'Numeric')
                    v = parseFloat(v);
                if (__this.__isEditing) {
                    __this.curRowDataVals.Value = v;
                    __this.curRowDataVals.D = d;
                }
                else {
                    __this.DataVals.Value = v;
                    __this.DataVals.D = d;

                    if ($(event.target).data('ctrl_ref'))// when trigger change from setValue(if the setValue called from inactive row control) update DG table td
                        ebUpdateDGTD($('#td_' + __this.EbSid_CtxId));
                }
            }
        }.bind(col, this.formObject, this.__userObject);

        //let OnChangeFn = new Function('form', 'user', `event`, FnString).bind(col, this.formObject, this.__userObject);

        col.bindOnChange({ form: this.formObject, col: col, DG: this, user: this.__userObject }, OnChangeFn);
    }.bind(this));


}

function SetDisplayMemberDate_EB(p1, p2) {
    if (this.IsNullable && p1 !== null)
        $('#' + this.EbSid_CtxId).siblings('.nullable-check').find('input[type=checkbox]').prop('checked', true);
    if (p1 !== null && p1 !== undefined) {
        if (this.ShowDateAs_ === 1 || this.ShowDateAs_ === 2) //month picker or year picker
            $('#' + this.EbSid_CtxId).val(p1);
        else if (this.EbDateType === 5) //Date
            $('#' + this.EbSid_CtxId).val(moment(p1, 'YYYY-MM-DD').format(ebcontext.user.Preference.ShortDatePattern));
        else if (this.EbDateType === 6) //DateTime
            $('#' + this.EbSid_CtxId).val(moment(p1, 'YYYY-MM-DD HH:mm:ss').format(ebcontext.user.Preference.ShortDatePattern + ' ' + ebcontext.user.Preference.ShortTimePattern));
        else if (this.EbDateType === 17) //Time
            $('#' + this.EbSid_CtxId).val(moment(p1, 'HH:mm:ss').format(ebcontext.user.Preference.ShortTimePattern));
    }
    else
        $('#' + this.EbSid_CtxId).val('');
}

function removePropsOfType(Obj, type = "function") {
    for (var Key in Obj) {
        if (typeof Obj[Key] === type) {
            delete Obj[Key];
        }
    }
    return Obj;
}

function REFF_attachModalCellRef(MultipleTables) {
    let keys = Object.keys(MultipleTables);
    for (var i = 0; i < keys.length; i++) {
        let tableName = keys[i];
        let table = MultipleTables[tableName];

        for (var j = 0; j < table.length; j++) {
            let row = table[j];
            for (var k = 0; k < row.Columns.length; k++) {
                let SingleColumn = row.Columns[k];
                obj.DataVals = SingleColumn;
            }
        }
    }
}


function attachModalCellRef_form(container, dataModel) {
    $.each(container.Controls.$values, function (i, obj) {
        if (obj.IsSpecialContainer)
            return true;
        if (obj.IsContainer) {
            obj.TableName = (typeof obj.TableName === "string") ? obj.TableName.trim() : false;
            obj.TableName = obj.TableName || container.TableName;
            attachModalCellRef_form(obj, dataModel);
        }
        else {
            setSingleColumnRef(container.TableName, obj.Name, dataModel, obj);
        }
    });
}

function setSingleColumnRef(TableName, ctrlName, MultipleTables, obj) {
    if (MultipleTables.hasOwnProperty(TableName)) {
        let table = MultipleTables[TableName];
        for (var i = 0; i < table.length; i++) {
            let row = table[i];
            let SingleColumn = getObjByval(row.Columns, "Name", ctrlName);
            if (SingleColumn) {
                obj.DataVals = SingleColumn;
                return;
            }
        }
    }
}



//code review ......to hide dropdown on click outside dropdown
document.addEventListener("click", function (e) {


    let par_ebSid = "";
    let ebSid_CtxId = "";
    let container = "";
    //to check select click is on datagrid
    if (($(e.target).closest("[ebsid]").attr("ctype") == "DataGrid") || ($(document.activeElement).closest('[ebsid]').attr("ctype") == "DataGrid") || ($(e.target).closest("[ebsid]").attr("ctype") == "DataGrid_New") || ($(document.activeElement).closest('[ebsid]').attr("ctype") == "DataGrid_New")) {
        //initial click of select
        if (($(e.target).closest("[ebsid]").attr("ctype") == "DataGrid") || ($(e.target).closest("[ebsid]").attr("ctype") == "DataGrid_New")) {
            par_ebSid = $(e.target).closest(".dropdown").find("select").attr("name");
            ebSid_CtxId = $(document.activeElement).closest('[ebsid]').attr("ebsid");
            container = $('.dd_of_' + par_ebSid);
        }
        //item selection click in select
        else {
            par_ebSid = $(e.target).closest(".dropdown").attr("par_ebsid");
            ebSid_CtxId = $(document.activeElement).closest('[ebsid]').attr("ebsid");
            container = $('.dd_of_' + par_ebSid);
        }
    }
    //if select is not in datagrid ...ie,outside datagrid
    else {
        par_ebSid = $(e.target).closest('[ebsid]').attr("ebsid");
        ebSid_CtxId = $(document.activeElement).closest('[ebsid]').attr("ebsid");
        container = $('.dd_of_' + ebSid_CtxId);
    }

    //to close opend select on click of another select
    if ((($(e.target).hasClass('filter-option-inner-inner')) || ($(e.target).closest('.filter-option').length == 1))) {
        //  container.closest('[detch_select=true]').removeClass("open");
        //if ($(".detch_select").hasClass("open")) {
        //    $(".detch_select").removeClass("open");
        //    $(`#${par_ebSid}`).selectpicker('toggle');
        //    $(`[par_ebsid=${par_ebSid}]`).addClass('open');
        //}
        //else {
        //    $(`#${par_ebSid}`).selectpicker('toggle');
        //    $(`[par_ebsid=${par_ebSid}]`).addClass('open');
        //}
        let $sss = $(`.detch_select:not([par_ebsid=${par_ebSid}])`);
        if ($sss.hasClass("open")) {
            $sss.removeClass("open");
        }
    }
    //to close dropdown on ouside click of dropdown
    if (!((($(e.target).closest('[detch_select=true]').attr('detch_select')) == "true") || ($(e.target).hasClass('filter-option-inner-inner')) || ($(e.target).closest('.filter-option').length == 1))) {
        $(".detch_select").removeClass("open");
    }

    if ((($(e.target).closest('[MultiSelect]').attr("MultiSelect")) == "false") || (($(e.target).closest('[objtype]').attr("objtype")) == 'SimpleSelect') || (($(e.target).closest('[objtype]').attr("objtype")) == 'BooleanSelect')) {
        if (!(($(e.target).hasClass('filter-option-inner-inner')) || ($(e.target).closest('.filter-option').length == 1))) {
            container.closest('[detch_select=true]').removeClass("open");

        }
    }
});


function textTransform(element, transform_type, IsNoDelay) {
    if (IsNoDelay) {
        textTransformHelper(element, transform_type);
    }
    else {
        setTimeout(function () {
            textTransformHelper(element, transform_type);
        }, 150);
    }
}

function textTransformHelper(element, transform_type) {
    let value = $(element).val().trim();
    if (transform_type === 1)
        $(element).val(value.toLowerCase());
    else if (transform_type === 2)
        $(element).val(value.toUpperCase());
}


function EBPSSetDisplayMember(p1, p2) {
    this.___isNotUpdateValExpDepCtrls = true;
    p1 = p1 + "";
    if (p1 === '')
        return;
    let VMs = this.initializer.Vobj.valueMembers || [];
    let tempVMs = [];
    let DMs = this.initializer.Vobj.displayMembers || [];
    let columnVals = this.initializer.columnVals || {};

    if (VMs.length > 0)// clear if already values there
        this.initializer.clearValues();

    let valMsArr = p1.split(',');

    for (let i = 0; i < valMsArr.length; i++) {
        let vm = valMsArr[i];
        tempVMs.push(vm);
        for (let j = 0; j < this.initializer.dmNames.length; j++) {
            let dmName = this.initializer.dmNames[j];
            if (!DMs[dmName])
                DMs[dmName] = []; // dg edit mode call
            DMs[dmName].push(this.DataVals.D[vm][dmName]);
        }
    }


    setTimeout(function () {//to catch by watcher one time (even if multiple value members are pushed)
        this.initializer.Vobj.valueMembers.push(...tempVMs);
    }.bind(this));


    if (this.initializer.datatable === null) {//for aftersave actions
        let colNames = Object.keys(this.DataVals.R);
        for (let i = 0; i < valMsArr.length; i++) {
            for (let j = 0; j < colNames.length; j++) {
                let colName = colNames[j];
                let val = this.DataVals.R[colName][i];
                if (columnVals[colName])
                    columnVals[colName].push(val);
                else
                    console.warn("Not found colName: " + colName);
            }
        }
    }

    //$("#" + this.EbSid_CtxId).val(p1);
    //this.initializer.V_watchVMembers(VMs);
}

function copyObj(destObj, srcObj) {
    Object.keys(destObj).forEach(function (key) { delete destObj[key]; });
    let key;
    for (key in destObj, srcObj) {
        srcObj[key] = srcObj[key]; // copies each property to the objCopy object
    }
    return srcObj;
}

function GetFontCss(obj, jqueryObj) {
    if (obj) {
        let font = [];
        let fontobj = {};
        font.push(`font-size:${obj.Size}px ;`);
        font.push(`color:${obj.color} ;`);
        if (obj.FontName = 'Arapey') font.push(`font-family: "" ;`);
        else font.push(`font-family:${obj.FontName} ;`);
        if (font.Underline) { font.push(`text-decoration: underline ;`); }
        if (font.Strikethrough) { font.push(`text-decoration: line-through ;`); }
        if (font.Caps) { font.push(`text-transform: uppercase;`); }
        if (font.Style === 1) { font.push(`font: bold;`); }
        if (font.Style === 2) { font.push(`font: italic;`); }
        if (font.Style === 3) { font.push(`font: italic bold;`); }

        if (jqueryObj !== undefined) {
            jqueryObj.css(`font-size`, `${obj.Size}px`);
            jqueryObj.css(`color`, `${obj.color}`);
            if (obj.FontName = 'Arapey') jqueryObj.css(`font-family`, ``);
            else
                jqueryObj.css(`font-family`, `${obj.FontName}`);
            if (font.Underline) { jqueryObj.css(`text-decoration`, `underline`); }
            if (font.Strikethrough) { jqueryObj.css(`text-decoration`, `line-through`); }
            if (font.Caps) { jqueryObj.css(`text-transform`, `uppercase`); }
            if (font.Style === 0) { jqueryObj.css(`font`, `normal`); }
            if (font.Style === 1) { jqueryObj.css(`font`, `bold`); }
            if (font.Style === 2) { jqueryObj.css(`font`, `italic`); }
            if (font.Style === 3) { jqueryObj.css(`font`, ` italic bold`); }
        }
        else {
            return (font.join().replace(/\,/g, ''));
        }
    }
}


function setFontCss(obj, jqueryObj) {
    if (obj) {
        if (jqueryObj !== undefined) {
            jqueryObj.css(`font-size`, `${obj.Size}px`);
            jqueryObj.css(`color`, `${obj.color}`);
            jqueryObj.css(`font-family`, `${obj.FontName}`);

            if (obj.Underline) { jqueryObj.css(`text-decoration`, `underline`); }
            if (obj.Strikethrough) { jqueryObj.css(`text-decoration`, `line-through`); }
            if (obj.Caps) { jqueryObj.css(`text-transform`, `uppercase`); }

            if (obj.Style === 0) { jqueryObj.css(`font-weight`, `normal`); jqueryObj.css(`font-style`, `normal`); }
            if (obj.Style === 1) { jqueryObj.css(`font-weight`, `bold`); jqueryObj.css(`font-style`, `normal`); }
            if (obj.Style === 2) { jqueryObj.css(`font-style`, `italic`); jqueryObj.css(`font-weight`, `normal`); }
            if (obj.Style === 3) { jqueryObj.css(`font-weight`, `bold`); jqueryObj.css(`font-style`, `italic`); }
        }
    }
}

function blink(el, delay = 1000) {
    if (el.jquery) {

        $e = $(el);
        $e.addClass("blink");
        setTimeout(function () {
            $e.removeClass("blink");
        }, delay);
    }
    else
        blink($(el), delay);
}

const getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

const formatData4webform = function (_multipleTables) {
    let multipleTables = $.extend(true, {}, _multipleTables);
    let tableNames = Object.keys(multipleTables);
    for (let i = 0; i < tableNames.length; i++) {
        let tableName = tableNames[i];


        if (tableName === "eb_approval_lines") {
            multipleTables[tableName] = [];
            continue;
        }

        let table = multipleTables[tableName];
        for (let j = 0; j < table.length; j++) {
            let row = table[j];
            let columns = row.Columns;
            for (let k = 0; k < columns.length; k++) {
                let singleColumn = columns[k];
                delete singleColumn["D"];
                delete singleColumn["F"];//provUser test
                delete singleColumn["R"];
                delete singleColumn["ValueExpr_val"];
                delete singleColumn["DisplayMember"];
            }
        }
    }
    return multipleTables;
};

function EbIsEmailOK(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function EbvalidateEmail(email) {
    if (email === "")
        return true;
    return EbIsEmailOK(email);
}

function EbIsValidURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

//function EbfixTrailingZeros(val, decLen) {
//    //val = val.toString();
//    //if (decLen <= 0)
//    //    return val;
//    //let res;
//    ////dec
//    ////val.padEnd(2)

//    //if (!val.trim().includes(".")) {
//    //    res = val + "." + "0".repeat(decLen);
//    //}
//    //else {
//    //    let p1 = val.split(".")[0];
//    //    let p2 = val.split(".")[1];
//    //    zerolen = decLen - p2.length;
//    //    res = p1 + "." + p2 + "0".repeat(zerolen > 0 ? zerolen : 0);
//    //}
//    res = val.toFixed(decLen);

//    return res;
//}
var waitForFinalEvent = (function () {
    var timers = {};
    return function (callback, ms, uniqueId) {
        if (!uniqueId) {
            uniqueId = "Don't call this twice without a uniqueId";
        }
        if (timers[uniqueId]) {
            clearTimeout(timers[uniqueId]);
        }
        timers[uniqueId] = setTimeout(callback, ms);
    };
})();

//function getScrollParent(node) {
//    if (node == null) {
//        return null;
//    }

//    if (node.scrollHeight > node.clientHeight) {
//        return node;
//    } else {
//        return getScrollParent(node.parentNode);
//    }
//}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        return Math.round(elapsed / 1000) + ' seconds ago';
    }

    else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    }

    else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + ' days ago';
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + ' months ago';
    }

    else {
        return Math.round(elapsed / msPerYear) + ' years ago';
    }
}