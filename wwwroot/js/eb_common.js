function getToken() {
    var b = document.cookie.match('(^|;)\\s*Token\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}
function getrToken() {
    var b = document.cookie.match('(^|;)\\s*rToken\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}
function getCookieVal(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}

function fltr_obj(type, name, value) {
    this.type = type;
    this.name = name;
    this.value = value;
}

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
        if (this[i] == element) {
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
        (keycode > 47 && keycode < 58)   || // number keys
        keycode == 32 || keycode == 13   || // spacebar & return key(s) (if you want to allow carriage returns)
        (keycode > 64 && keycode < 91)   || // letter keys
        (keycode > 95 && keycode < 112)  || // numpad keys
        (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
        (keycode > 218 && keycode < 223);   // [\]' (in order)

    return valid;
}

//function RefreshControl(obj) {
//    var NewHtml = obj.Html();
//    var metas = AllMetas["Eb" + $("#" + obj.EbSid).attr("eb-type")];
//    $.each(metas, function (i, meta) {
//        var name = meta.name;
//        if (meta.IsUIproperty) {
//            NewHtml = NewHtml.replace('@' + name + ' ', obj[name]);
//        }
//    });
//    $("#" + obj.EbSid).html($(NewHtml).html());
//};