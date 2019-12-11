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


function EbMakeInvalid(contSel, _ctrlCont, msg = "This field is required", type = "danger") {
    let shadowColor = "rgb(174, 0, 0)";
    if (type === "warning")
        shadowColor = "rgb(236, 151, 31)";
    if ($(`${contSel} .req-cont`).length !== 0)
        return;
    //var $ctrlCont = (this.curForm.renderAsForm) ? $(`${contSel}  .ctrl-wraper`) : $(`${contSel} .chat-ctrl-cont`);
    let $ctrlCont = $(`${contSel}  ${_ctrlCont}:first`);
    $ctrlCont.after(`<div class="req-cont"><label id='@name@errormsg' class='text-${type}'></label></div>`);
    $ctrlCont.css("box-shadow", `0 0 3px 1px ${shadowColor}`).siblings("[name=ctrlsend]").css('disabled', true);
    $(`${contSel}  .text-${type}`).text(msg).hide().slideDown(100);
}

function EbMakeValid(contSel, _ctrlCont) {
    //setTimeout(function () {
    $(`${contSel}  ${_ctrlCont}:first`).css("box-shadow", "inherit").siblings("[name=ctrlsend]").css('disabled', false);
    $(`${contSel} .req-cont:first`).animate({ opacity: "0" }, 300).remove();
    //},400);
}


function EbShowCtrlMsg(contSel, _ctrlCont, msg = "This field is required", type = "danger") {
    if ($(`${contSel} .msg-cont`).length !== 0)
        return;
    //var $ctrlCont = (this.curForm.renderAsForm) ? $(`${contSel}  .ctrl-wraper`) : $(`${contSel} .chat-ctrl-cont`);
    let $ctrlCont = $(`${contSel}  ${_ctrlCont}:first`);
    $ctrlCont.after(`<div class="msg-cont"><label id='@name@errormsg' class='text-${type}'></label></div>`);
    $(`${contSel}  .text-${type}`).text(msg).hide().slideDown(100);
}

function EbHideCtrlMsg(contSel, _ctrlCont) {
    //setTimeout(function () {
    $(`${contSel} .req-cont:first`).animate({ opacity: "0" }, 300).remove();
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
        fltr_collection.push(new fltr_obj(obj.EbDbType, obj.Name, obj.getValue()));
        //if (obj.ObjType === "PowerSelect")
        //    flag++;
    });
    if (flag > 0) {
        console.log(111);
        var temp = $.grep(fltr_collection, function (obj) { return obj.Name === "eb_loc_id"; });
        if (temp.length === 0)
            fltr_collection.push(new fltr_obj(11, "eb_loc_id", store.get("Eb_Loc-" + ebcontext.sid + ebcontext.user.UserId)));
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
        fltr_collection.push(new fltr_obj(obj.EbDbType, obj.Name, value));
    });
    return fltr_collection;
}


function getSingleColumn(obj) {
    let SingleColumn = {};
    SingleColumn.Name = obj.Name;
    SingleColumn.Value = obj.getValue();
    SingleColumn.Type = obj.EbDbType;
    //SingleColumn.ObjType = obj.ObjType;
    SingleColumn.D = undefined;
    SingleColumn.C = undefined;
    SingleColumn.R = undefined;
    obj.DataVals = SingleColumn;

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

function EbConvertValue(val, type) {
    if (type === 11)
        return parseInt(val);
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
            filter = ctrl.name + " " + ctrl.operator + " " + ctrl.value;
            this.id.append(`<div class="tagstyle priorfilter">${filter}</div>`);
            if (ctrl.logicOp !== "")
                this.id.append(`<div class="tagstyle priorfilter">${ctrl.logicOp}</div>`);
        }.bind(this));

        if (this.displayFilterDialogArr.length > 0 && this.displayColumnSearchArr.length > 0)
            this.id.append(`<div class="tagstyle op">AND</div>`);

        $.each(this.displayColumnSearchArr, function (i, search) {
            filter = search.name + " " + returnOperator(search.operator.trim());
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
                return obj.name === tempcol && obj.value === parseInt(tempval)
            else
                return obj.name === tempcol && obj.value === tempval
        });
        $(e.target).parent().prev().remove();
        $(e.target).parent().remove();
        settings.remove(e, temp[0]);
    };

    this.show();
};

function getRow__(__this) {
    console.log("getRow__");
    return $(`[ebsid='${__this.__DG.EbSid}'] tr[rowid='${__this.__rowid}']`)
}

function dgOnChangeBind() {
    $.each(this.Controls.$values, function (i, col) {
        console.log(999999999999);
        if ((col.OnChangeFn && col.OnChangeFn.Code && col.OnChangeFn.Code.trim() !== '') || col.DependedValExp.$values.length > 0) {
            let FnString = atob(col.OnChangeFn.Code) + (col.DependedValExp.$values.length !== 0 ? ` ; form.updateDependentControls(form.__getCtrlByPath(this.__path))` : '');
            let OnChangeFn = new Function('form', 'user', `event`, FnString).bind(col, this.formObject, this.__userObject);

            col.bindOnChange({ form: this.formObject, col: col, DG: this, user: this.__userObject }, OnChangeFn);
        }
    }.bind(this));


}

function dgEBOnChangeBind() {
    $.each(this.Controls.$values, function (i, col) {
        let FnString = `
                        let __this = form.__getCtrlByPath(this.__path);
                        console.log(__this);
                        let $curRow = getRow__(__this);
                        let isRowEditing = $curRow.attr('is-editing') === 'true' && $curRow.attr('is-checked') === 'true';
                        if(__this.DataVals !== undefined && isRowEditing === false){
                            __this.DataVals.Value = __this.getValue();
                            __this.DataVals.D = __this.getDisplayMember();
                        }`;
        let OnChangeFn = new Function('form', 'user', `event`, FnString).bind(col, this.formObject, this.__userObject);

        col.bindOnChange({ form: this.formObject, col: col, DG: this, user: this.__userObject }, OnChangeFn);
    }.bind(this));


}

function setDate_EB(p1, p2) {
    if (this.IsNullable && p1 !== null)
        $('#' + this.EbSid_CtxId).siblings('.nullable-check').find('input[type=checkbox]').prop('checked', true);
    if (p1 !== null && p1 !== undefined) {
        if (this.ShowDateAs_ === 1) //month picker
            $('#' + this.EbSid_CtxId).val(p1);
        else if (this.EbDateType === 5) //Date
            $('#' + this.EbSid_CtxId).val(moment(p1, 'YYYY-MM-DD').format(ebcontext.user.Preference.ShortDatePattern));
        else if (this.EbDateType === 6) //DateTime
            $('#' + this.EbSid_CtxId).val(moment(p1, 'YYYY-MM-DD HH:mm:ss').format(ebcontext.user.Preference.ShortDatePattern + ' ' + ebcontext.user.Preference.ShortTimePattern));
        else if (this.EbDateType === 17) //Time
            $('#' + this.EbSid_CtxId).val(moment(p1, 'HH:mm:ss').format(ebcontext.user.Preference.ShortTimePattern));
        $('#' + this.EbSid_CtxId).trigger('change');
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


function attachModalCellRef_form(container, multipleTable) {
    $.each(container.Controls.$values, function (i, obj) {
        if (obj.IsSpecialContainer)
            return true;
        if (obj.IsContainer) {
            obj.TableName = (typeof obj.TableName === "string") ? obj.TableName.trim() : false;
            obj.TableName = obj.TableName || container.TableName;
            attachModalCellRef_form(obj, multipleTable);
        }
        else {
            setSingleColumnRef(container.TableName, obj.Name, multipleTable, obj);
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
    let par_ebSid = $(e.target).closest('[ebsid]').attr("ebsid");
    let ebSid_CtxId = $(document.activeElement).closest('[ebsid]').attr("ebsid");
    var container = $('.dd_of_' + ebSid_CtxId);

    //to close opend select on click of another select
    if ((($(e.target).hasClass('filter-option-inner-inner')) || ($(e.target).closest('.filter-option').length == 1))) {
        //  container.closest('[detch_select=true]').removeClass("open");
        if ($(".detch_select").hasClass("open")) {
            $(".detch_select").removeClass("open");
            $(`#${par_ebSid}`).selectpicker('toggle');
            $(`[par_ebsid=${par_ebSid}]`).addClass('open');
        }
        else {
            $(`#${par_ebSid}`).selectpicker('toggle');
            $(`[par_ebsid=${par_ebSid}]`).addClass('open');
        }
    }
    //to close dropdown on ouside click of dropdown
    if (!((($(e.target).closest('[detch_select=true]').attr('detch_select')) == "true") || ($(e.target).hasClass('filter-option-inner-inner')) || ($(e.target).closest('.filter-option').length == 1))) {
        $(".detch_select").removeClass("open");
    }

    if ((($(e.target).closest('[MultiSelect]').attr("MultiSelect")) == "false") || (($(e.target).closest('[objtype]').attr("objtype")) == 'SimpleSelect')) {
        if (!(($(e.target).hasClass('filter-option-inner-inner')) || ($(e.target).closest('.filter-option').length == 1))) {
            container.closest('[detch_select=true]').removeClass("open");

        }
    }
});
