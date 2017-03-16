function getToken() {
    var b = document.cookie.match('(^|;)\\s*Token\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}
function getCookieVal(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}