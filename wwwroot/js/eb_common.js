﻿console.eb_log = function (msg, color = "rgb(19, 0, 78)", bgcolor) {
    console.log(`%c${msg}`, `color:${color};
            padding:1px 2px;
            border-radius:2px;
            text-shadow: 1px 1px 1px #eef;`);
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
    var $ctrlCont = $(`${contSel}  ${_ctrlCont}`);
    $ctrlCont.after(`<div class="req-cont"><label id='@name@errormsg' class='text-${type}'></label></div>`);
    $(`${contSel}  ${_ctrlCont}`).css("box-shadow", `0 0 3px 1px ${shadowColor}`).siblings("[name=ctrlsend]").css('disabled', true);
    $(`${contSel}  .text-${type}`).text(msg).hide().slideDown(100);
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



function EbMakeValid(contSel, _ctrlCont) {
    //setTimeout(function () {
    $(`${contSel}  ${_ctrlCont}`).css("box-shadow", "inherit").siblings("[name=ctrlsend]").css('disabled', false);
    $(`${contSel} .req-cont`).animate({ opacity: "0" }, 300).remove();
    //},400);
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
            getFlatControls(obj, dest_coll);
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

function getFlatObjOfType(ContObj, type) {
    let ctrls = [];
    let flat = getFlatContControls(ContObj);
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
    SingleColumn.AutoIncrement = obj.AutoIncrement || false;
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