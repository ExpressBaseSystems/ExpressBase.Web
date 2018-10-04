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


//function getFilterValues() {
//    var fltr_collection = [];
//    var paramstxt = $('#hiddenparams').val().trim();
//    if (paramstxt.length > 0) {
//        var params = paramstxt.split(',');
//        $.each(params, function (i, id) {
//            var v = null;
//            var dtype = $('#' + id).attr('data-ebtype');
//            if (dtype === '6')
//                v = $('#' + id).val().substring(0, 10);
//            else if (dtype === '11')
//                v = $('#' + id + 'Tmp').val();
//            else
//                v = $('#' + id ).val();
//            fltr_collection.push(new fltr_obj(dtype, id, v));
//        });
//    }

//    return fltr_collection;
//}

Array.prototype.contains = function (element) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === element) {
            return true;
        }
    }

    return false;
};

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


function EbMakeInvalid(contSel, _ctrlCont, msg = "This field is required") {
    //var contSel = `[for=${name}]`;//
    if ($(`${contSel} .req-cont`).length !== 0)
        return;
    //var $ctrlCont = (this.curForm.renderAsForm) ? $(`${contSel}  .ctrl-wraper`) : $(`${contSel} .chat-ctrl-cont`);
    var $ctrlCont = $(`${contSel}  ${_ctrlCont}`);
    $ctrlCont.after(`<div class="req-cont"><label id='@name@errormsg' class='text-danger'></label></div>`);
    $(`${contSel}  ${_ctrlCont}`).css("box-shadow", "0 0 3px 1px rgb(174, 0, 0)").siblings("[name=ctrlsend]").css('disabled', true);
    $(`${contSel}  .text-danger`).text(msg).show().animate({ opacity: "1" }, 300);
}



function EbMakeValid(contSel, _ctrlCont) {
    //var contSel = `[for=${name}]`;
    $(`${contSel}  ${_ctrlCont}`).css("box-shadow", "inherit").siblings("[name=ctrlsend]").css('disabled', false);
    $(`${contSel} .req-cont`).animate({ opacity: "0" }, 300).remove();
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
    else if (num == 6)
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
    RecurFlatContControls(formObj, coll);
    return coll;
};

function RecurFlatContControls(src_obj, dest_coll) {
    $.each(src_obj.Controls.$values, function (i, obj) {
        if (obj.IsContainer) {
            dest_coll.push(obj);
            RecurFlatContControls(obj, dest_coll);
        }
    });
};


function getFlatControls(formObj) {
    let coll = [];
    RecurFlatControls(formObj, coll);
    return coll;
};

function RecurFlatControls(src_obj, dest_coll) {
    $.each(src_obj.Controls.$values, function (i, obj) {
        dest_coll.push(obj);
        if (obj.IsContainer) {
            getFlatControls(obj, dest_coll);
        }
    });
};

function getValsFromForm(formObj) {
    let fltr_collection = [];
    $.each(getFlatControls(formObj), function (i, obj) {
        fltr_collection.push(new fltr_obj(obj.EbDbType, obj.Name, obj.getValue()));
    });
    return fltr_collection;
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