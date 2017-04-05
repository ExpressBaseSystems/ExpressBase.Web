function getToken() {
    var b = document.cookie.match('(^|;)\\s*Token\\s*=\\s*([^;]+)');
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

function getFilterValues() {
    var fltr_collection = [];
    var params = [] ;
    params = $('#hiddenparams').val().split(',');
    $.each(params, function (i, id) {
        var v;
        var dtype = $('#' + id).attr('data-type');
        if(dtype === 'datetime') {
            v = $('#' + id).val().substring(0, 10);
        }
        else 
            v = $('#' + id).val();
        fltr_collection.push(new fltr_obj(dtype, id, v));
    });
    return fltr_collection;
}