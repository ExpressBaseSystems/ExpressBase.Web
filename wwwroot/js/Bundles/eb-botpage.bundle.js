//! moment.js
//! version : 2.17.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
!function (a, b) { "object" == typeof exports && "undefined" != typeof module ? module.exports = b() : "function" == typeof define && define.amd ? define(b) : a.moment = b() }(this, function () {
    "use strict"; function a() { return od.apply(null, arguments) }
    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function b(a) { od = a } function c(a) { return a instanceof Array || "[object Array]" === Object.prototype.toString.call(a) } function d(a) {
        // IE8 will treat undefined and null as object if it wasn't for
        // input != null
        return null != a && "[object Object]" === Object.prototype.toString.call(a)
    } function e(a) {
        var b; for (b in a)
            // even if its not own property I'd still call it non-empty
            return !1; return !0
    } function f(a) { return "number" == typeof a || "[object Number]" === Object.prototype.toString.call(a) } function g(a) { return a instanceof Date || "[object Date]" === Object.prototype.toString.call(a) } function h(a, b) { var c, d = []; for (c = 0; c < a.length; ++c)d.push(b(a[c], c)); return d } function i(a, b) { return Object.prototype.hasOwnProperty.call(a, b) } function j(a, b) { for (var c in b) i(b, c) && (a[c] = b[c]); return i(b, "toString") && (a.toString = b.toString), i(b, "valueOf") && (a.valueOf = b.valueOf), a } function k(a, b, c, d) { return rb(a, b, c, d, !0).utc() } function l() {
        // We need to deep clone this object.
        return { empty: !1, unusedTokens: [], unusedInput: [], overflow: -2, charsLeftOver: 0, nullInput: !1, invalidMonth: null, invalidFormat: !1, userInvalidated: !1, iso: !1, parsedDateParts: [], meridiem: null }
    } function m(a) { return null == a._pf && (a._pf = l()), a._pf } function n(a) { if (null == a._isValid) { var b = m(a), c = qd.call(b.parsedDateParts, function (a) { return null != a }), d = !isNaN(a._d.getTime()) && b.overflow < 0 && !b.empty && !b.invalidMonth && !b.invalidWeekday && !b.nullInput && !b.invalidFormat && !b.userInvalidated && (!b.meridiem || b.meridiem && c); if (a._strict && (d = d && 0 === b.charsLeftOver && 0 === b.unusedTokens.length && void 0 === b.bigHour), null != Object.isFrozen && Object.isFrozen(a)) return d; a._isValid = d } return a._isValid } function o(a) { var b = k(NaN); return null != a ? j(m(b), a) : m(b).userInvalidated = !0, b } function p(a) { return void 0 === a } function q(a, b) { var c, d, e; if (p(b._isAMomentObject) || (a._isAMomentObject = b._isAMomentObject), p(b._i) || (a._i = b._i), p(b._f) || (a._f = b._f), p(b._l) || (a._l = b._l), p(b._strict) || (a._strict = b._strict), p(b._tzm) || (a._tzm = b._tzm), p(b._isUTC) || (a._isUTC = b._isUTC), p(b._offset) || (a._offset = b._offset), p(b._pf) || (a._pf = m(b)), p(b._locale) || (a._locale = b._locale), rd.length > 0) for (c in rd) d = rd[c], e = b[d], p(e) || (a[d] = e); return a }
    // Moment prototype object
    function r(b) {
    q(this, b), this._d = new Date(null != b._d ? b._d.getTime() : NaN), this.isValid() || (this._d = new Date(NaN)),
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        sd === !1 && (sd = !0, a.updateOffset(this), sd = !1)
    } function s(a) { return a instanceof r || null != a && null != a._isAMomentObject } function t(a) { return a < 0 ? Math.ceil(a) || 0 : Math.floor(a) } function u(a) { var b = +a, c = 0; return 0 !== b && isFinite(b) && (c = t(b)), c }
    // compare two arrays, return the number of differences
    function v(a, b, c) { var d, e = Math.min(a.length, b.length), f = Math.abs(a.length - b.length), g = 0; for (d = 0; d < e; d++)(c && a[d] !== b[d] || !c && u(a[d]) !== u(b[d])) && g++; return g + f } function w(b) { a.suppressDeprecationWarnings === !1 && "undefined" != typeof console && console.warn && console.warn("Deprecation warning: " + b) } function x(b, c) { var d = !0; return j(function () { if (null != a.deprecationHandler && a.deprecationHandler(null, b), d) { for (var e, f = [], g = 0; g < arguments.length; g++) { if (e = "", "object" == typeof arguments[g]) { e += "\n[" + g + "] "; for (var h in arguments[0]) e += h + ": " + arguments[0][h] + ", "; e = e.slice(0, -2) } else e = arguments[g]; f.push(e) } w(b + "\nArguments: " + Array.prototype.slice.call(f).join("") + "\n" + (new Error).stack), d = !1 } return c.apply(this, arguments) }, c) } function y(b, c) { null != a.deprecationHandler && a.deprecationHandler(b, c), td[b] || (w(c), td[b] = !0) } function z(a) { return a instanceof Function || "[object Function]" === Object.prototype.toString.call(a) } function A(a) {
        var b, c; for (c in a) b = a[c], z(b) ? this[c] = b : this["_" + c] = b; this._config = a,
            // Lenient ordinal parsing accepts just a number in addition to
            // number + (possibly) stuff coming from _ordinalParseLenient.
            this._ordinalParseLenient = new RegExp(this._ordinalParse.source + "|" + /\d{1,2}/.source)
    } function B(a, b) {
        var c, e = j({}, a); for (c in b) i(b, c) && (d(a[c]) && d(b[c]) ? (e[c] = {}, j(e[c], a[c]), j(e[c], b[c])) : null != b[c] ? e[c] = b[c] : delete e[c]); for (c in a) i(a, c) && !i(b, c) && d(a[c]) && (
            // make sure changes to properties don't modify parent config
            e[c] = j({}, e[c])); return e
    } function C(a) { null != a && this.set(a) } function D(a, b, c) { var d = this._calendar[a] || this._calendar.sameElse; return z(d) ? d.call(b, c) : d } function E(a) { var b = this._longDateFormat[a], c = this._longDateFormat[a.toUpperCase()]; return b || !c ? b : (this._longDateFormat[a] = c.replace(/MMMM|MM|DD|dddd/g, function (a) { return a.slice(1) }), this._longDateFormat[a]) } function F() { return this._invalidDate } function G(a) { return this._ordinal.replace("%d", a) } function H(a, b, c, d) { var e = this._relativeTime[c]; return z(e) ? e(a, b, c, d) : e.replace(/%d/i, a) } function I(a, b) { var c = this._relativeTime[a > 0 ? "future" : "past"]; return z(c) ? c(b) : c.replace(/%s/i, b) } function J(a, b) { var c = a.toLowerCase(); Dd[c] = Dd[c + "s"] = Dd[b] = a } function K(a) { return "string" == typeof a ? Dd[a] || Dd[a.toLowerCase()] : void 0 } function L(a) { var b, c, d = {}; for (c in a) i(a, c) && (b = K(c), b && (d[b] = a[c])); return d } function M(a, b) { Ed[a] = b } function N(a) { var b = []; for (var c in a) b.push({ unit: c, priority: Ed[c] }); return b.sort(function (a, b) { return a.priority - b.priority }), b } function O(b, c) { return function (d) { return null != d ? (Q(this, b, d), a.updateOffset(this, c), this) : P(this, b) } } function P(a, b) { return a.isValid() ? a._d["get" + (a._isUTC ? "UTC" : "") + b]() : NaN } function Q(a, b, c) { a.isValid() && a._d["set" + (a._isUTC ? "UTC" : "") + b](c) }
    // MOMENTS
    function R(a) { return a = K(a), z(this[a]) ? this[a]() : this } function S(a, b) { if ("object" == typeof a) { a = L(a); for (var c = N(a), d = 0; d < c.length; d++)this[c[d].unit](a[c[d].unit]) } else if (a = K(a), z(this[a])) return this[a](b); return this } function T(a, b, c) { var d = "" + Math.abs(a), e = b - d.length, f = a >= 0; return (f ? c ? "+" : "" : "-") + Math.pow(10, Math.max(0, e)).toString().substr(1) + d }
    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function U(a, b, c, d) { var e = d; "string" == typeof d && (e = function () { return this[d]() }), a && (Id[a] = e), b && (Id[b[0]] = function () { return T(e.apply(this, arguments), b[1], b[2]) }), c && (Id[c] = function () { return this.localeData().ordinal(e.apply(this, arguments), a) }) } function V(a) { return a.match(/\[[\s\S]/) ? a.replace(/^\[|\]$/g, "") : a.replace(/\\/g, "") } function W(a) { var b, c, d = a.match(Fd); for (b = 0, c = d.length; b < c; b++)Id[d[b]] ? d[b] = Id[d[b]] : d[b] = V(d[b]); return function (b) { var e, f = ""; for (e = 0; e < c; e++)f += d[e] instanceof Function ? d[e].call(b, a) : d[e]; return f } }
    // format date using native date object
    function X(a, b) { return a.isValid() ? (b = Y(b, a.localeData()), Hd[b] = Hd[b] || W(b), Hd[b](a)) : a.localeData().invalidDate() } function Y(a, b) { function c(a) { return b.longDateFormat(a) || a } var d = 5; for (Gd.lastIndex = 0; d >= 0 && Gd.test(a);)a = a.replace(Gd, c), Gd.lastIndex = 0, d -= 1; return a } function Z(a, b, c) { $d[a] = z(b) ? b : function (a, d) { return a && c ? c : b } } function $(a, b) { return i($d, a) ? $d[a](b._strict, b._locale) : new RegExp(_(a)) }
    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function _(a) { return aa(a.replace("\\", "").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (a, b, c, d, e) { return b || c || d || e })) } function aa(a) { return a.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") } function ba(a, b) { var c, d = b; for ("string" == typeof a && (a = [a]), f(b) && (d = function (a, c) { c[b] = u(a) }), c = 0; c < a.length; c++)_d[a[c]] = d } function ca(a, b) { ba(a, function (a, c, d, e) { d._w = d._w || {}, b(a, d._w, d, e) }) } function da(a, b, c) { null != b && i(_d, a) && _d[a](b, c._a, c, a) } function ea(a, b) { return new Date(Date.UTC(a, b + 1, 0)).getUTCDate() } function fa(a, b) { return a ? c(this._months) ? this._months[a.month()] : this._months[(this._months.isFormat || ke).test(b) ? "format" : "standalone"][a.month()] : this._months } function ga(a, b) { return a ? c(this._monthsShort) ? this._monthsShort[a.month()] : this._monthsShort[ke.test(b) ? "format" : "standalone"][a.month()] : this._monthsShort } function ha(a, b, c) {
        var d, e, f, g = a.toLocaleLowerCase(); if (!this._monthsParse) for (
            // this is not used
            this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = [], d = 0; d < 12; ++d)f = k([2e3, d]), this._shortMonthsParse[d] = this.monthsShort(f, "").toLocaleLowerCase(), this._longMonthsParse[d] = this.months(f, "").toLocaleLowerCase(); return c ? "MMM" === b ? (e = je.call(this._shortMonthsParse, g), e !== -1 ? e : null) : (e = je.call(this._longMonthsParse, g), e !== -1 ? e : null) : "MMM" === b ? (e = je.call(this._shortMonthsParse, g), e !== -1 ? e : (e = je.call(this._longMonthsParse, g), e !== -1 ? e : null)) : (e = je.call(this._longMonthsParse, g), e !== -1 ? e : (e = je.call(this._shortMonthsParse, g), e !== -1 ? e : null))
    } function ia(a, b, c) {
        var d, e, f; if (this._monthsParseExact) return ha.call(this, a, b, c);
        // TODO: add sorting
        // Sorting makes sure if one month (or abbr) is a prefix of another
        // see sorting in computeMonthsParse
        for (this._monthsParse || (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = []), d = 0; d < 12; d++) {
            // test the regex
            if (
                // make the regex if we don't have it already
                e = k([2e3, d]), c && !this._longMonthsParse[d] && (this._longMonthsParse[d] = new RegExp("^" + this.months(e, "").replace(".", "") + "$", "i"), this._shortMonthsParse[d] = new RegExp("^" + this.monthsShort(e, "").replace(".", "") + "$", "i")), c || this._monthsParse[d] || (f = "^" + this.months(e, "") + "|^" + this.monthsShort(e, ""), this._monthsParse[d] = new RegExp(f.replace(".", ""), "i")), c && "MMMM" === b && this._longMonthsParse[d].test(a)) return d; if (c && "MMM" === b && this._shortMonthsParse[d].test(a)) return d; if (!c && this._monthsParse[d].test(a)) return d
        }
    }
    // MOMENTS
    function ja(a, b) {
        var c; if (!a.isValid())
            // No op
            return a; if ("string" == typeof b) if (/^\d+$/.test(b)) b = u(b); else
                // TODO: Another silent failure?
                if (b = a.localeData().monthsParse(b), !f(b)) return a; return c = Math.min(a.date(), ea(a.year(), b)), a._d["set" + (a._isUTC ? "UTC" : "") + "Month"](b, c), a
    } function ka(b) { return null != b ? (ja(this, b), a.updateOffset(this, !0), this) : P(this, "Month") } function la() { return ea(this.year(), this.month()) } function ma(a) { return this._monthsParseExact ? (i(this, "_monthsRegex") || oa.call(this), a ? this._monthsShortStrictRegex : this._monthsShortRegex) : (i(this, "_monthsShortRegex") || (this._monthsShortRegex = ne), this._monthsShortStrictRegex && a ? this._monthsShortStrictRegex : this._monthsShortRegex) } function na(a) { return this._monthsParseExact ? (i(this, "_monthsRegex") || oa.call(this), a ? this._monthsStrictRegex : this._monthsRegex) : (i(this, "_monthsRegex") || (this._monthsRegex = oe), this._monthsStrictRegex && a ? this._monthsStrictRegex : this._monthsRegex) } function oa() {
        function a(a, b) { return b.length - a.length } var b, c, d = [], e = [], f = []; for (b = 0; b < 12; b++)
            // make the regex if we don't have it already
            c = k([2e3, b]), d.push(this.monthsShort(c, "")), e.push(this.months(c, "")), f.push(this.months(c, "")), f.push(this.monthsShort(c, "")); for (
            // Sorting makes sure if one month (or abbr) is a prefix of another it
            // will match the longer piece.
            d.sort(a), e.sort(a), f.sort(a), b = 0; b < 12; b++)d[b] = aa(d[b]), e[b] = aa(e[b]); for (b = 0; b < 24; b++)f[b] = aa(f[b]); this._monthsRegex = new RegExp("^(" + f.join("|") + ")", "i"), this._monthsShortRegex = this._monthsRegex, this._monthsStrictRegex = new RegExp("^(" + e.join("|") + ")", "i"), this._monthsShortStrictRegex = new RegExp("^(" + d.join("|") + ")", "i")
    }
    // HELPERS
    function pa(a) { return qa(a) ? 366 : 365 } function qa(a) { return a % 4 === 0 && a % 100 !== 0 || a % 400 === 0 } function ra() { return qa(this.year()) } function sa(a, b, c, d, e, f, g) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var h = new Date(a, b, c, d, e, f, g);
        //the date constructor remaps years 0-99 to 1900-1999
        return a < 100 && a >= 0 && isFinite(h.getFullYear()) && h.setFullYear(a), h
    } function ta(a) {
        var b = new Date(Date.UTC.apply(null, arguments));
        //the Date.UTC function remaps years 0-99 to 1900-1999
        return a < 100 && a >= 0 && isFinite(b.getUTCFullYear()) && b.setUTCFullYear(a), b
    }
    // start-of-first-week - start-of-year
    function ua(a, b, c) {
        var// first-week day -- which january is always in the first week (4 for iso, 1 for other)
        d = 7 + b - c,
        // first-week day local weekday -- which local weekday is fwd
        e = (7 + ta(a, 0, d).getUTCDay() - b) % 7; return -e + d - 1
    }
    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function va(a, b, c, d, e) { var f, g, h = (7 + c - d) % 7, i = ua(a, d, e), j = 1 + 7 * (b - 1) + h + i; return j <= 0 ? (f = a - 1, g = pa(f) + j) : j > pa(a) ? (f = a + 1, g = j - pa(a)) : (f = a, g = j), { year: f, dayOfYear: g } } function wa(a, b, c) { var d, e, f = ua(a.year(), b, c), g = Math.floor((a.dayOfYear() - f - 1) / 7) + 1; return g < 1 ? (e = a.year() - 1, d = g + xa(e, b, c)) : g > xa(a.year(), b, c) ? (d = g - xa(a.year(), b, c), e = a.year() + 1) : (e = a.year(), d = g), { week: d, year: e } } function xa(a, b, c) { var d = ua(a, b, c), e = ua(a + 1, b, c); return (pa(a) - d + e) / 7 }
    // HELPERS
    // LOCALES
    function ya(a) { return wa(a, this._week.dow, this._week.doy).week } function za() { return this._week.dow } function Aa() { return this._week.doy }
    // MOMENTS
    function Ba(a) { var b = this.localeData().week(this); return null == a ? b : this.add(7 * (a - b), "d") } function Ca(a) { var b = wa(this, 1, 4).week; return null == a ? b : this.add(7 * (a - b), "d") }
    // HELPERS
    function Da(a, b) { return "string" != typeof a ? a : isNaN(a) ? (a = b.weekdaysParse(a), "number" == typeof a ? a : null) : parseInt(a, 10) } function Ea(a, b) { return "string" == typeof a ? b.weekdaysParse(a) % 7 || 7 : isNaN(a) ? null : a } function Fa(a, b) { return a ? c(this._weekdays) ? this._weekdays[a.day()] : this._weekdays[this._weekdays.isFormat.test(b) ? "format" : "standalone"][a.day()] : this._weekdays } function Ga(a) { return a ? this._weekdaysShort[a.day()] : this._weekdaysShort } function Ha(a) { return a ? this._weekdaysMin[a.day()] : this._weekdaysMin } function Ia(a, b, c) { var d, e, f, g = a.toLocaleLowerCase(); if (!this._weekdaysParse) for (this._weekdaysParse = [], this._shortWeekdaysParse = [], this._minWeekdaysParse = [], d = 0; d < 7; ++d)f = k([2e3, 1]).day(d), this._minWeekdaysParse[d] = this.weekdaysMin(f, "").toLocaleLowerCase(), this._shortWeekdaysParse[d] = this.weekdaysShort(f, "").toLocaleLowerCase(), this._weekdaysParse[d] = this.weekdays(f, "").toLocaleLowerCase(); return c ? "dddd" === b ? (e = je.call(this._weekdaysParse, g), e !== -1 ? e : null) : "ddd" === b ? (e = je.call(this._shortWeekdaysParse, g), e !== -1 ? e : null) : (e = je.call(this._minWeekdaysParse, g), e !== -1 ? e : null) : "dddd" === b ? (e = je.call(this._weekdaysParse, g), e !== -1 ? e : (e = je.call(this._shortWeekdaysParse, g), e !== -1 ? e : (e = je.call(this._minWeekdaysParse, g), e !== -1 ? e : null))) : "ddd" === b ? (e = je.call(this._shortWeekdaysParse, g), e !== -1 ? e : (e = je.call(this._weekdaysParse, g), e !== -1 ? e : (e = je.call(this._minWeekdaysParse, g), e !== -1 ? e : null))) : (e = je.call(this._minWeekdaysParse, g), e !== -1 ? e : (e = je.call(this._weekdaysParse, g), e !== -1 ? e : (e = je.call(this._shortWeekdaysParse, g), e !== -1 ? e : null))) } function Ja(a, b, c) {
        var d, e, f; if (this._weekdaysParseExact) return Ia.call(this, a, b, c); for (this._weekdaysParse || (this._weekdaysParse = [], this._minWeekdaysParse = [], this._shortWeekdaysParse = [], this._fullWeekdaysParse = []), d = 0; d < 7; d++) {
            // test the regex
            if (
                // make the regex if we don't have it already
                e = k([2e3, 1]).day(d), c && !this._fullWeekdaysParse[d] && (this._fullWeekdaysParse[d] = new RegExp("^" + this.weekdays(e, "").replace(".", ".?") + "$", "i"), this._shortWeekdaysParse[d] = new RegExp("^" + this.weekdaysShort(e, "").replace(".", ".?") + "$", "i"), this._minWeekdaysParse[d] = new RegExp("^" + this.weekdaysMin(e, "").replace(".", ".?") + "$", "i")), this._weekdaysParse[d] || (f = "^" + this.weekdays(e, "") + "|^" + this.weekdaysShort(e, "") + "|^" + this.weekdaysMin(e, ""), this._weekdaysParse[d] = new RegExp(f.replace(".", ""), "i")), c && "dddd" === b && this._fullWeekdaysParse[d].test(a)) return d; if (c && "ddd" === b && this._shortWeekdaysParse[d].test(a)) return d; if (c && "dd" === b && this._minWeekdaysParse[d].test(a)) return d; if (!c && this._weekdaysParse[d].test(a)) return d
        }
    }
    // MOMENTS
    function Ka(a) { if (!this.isValid()) return null != a ? this : NaN; var b = this._isUTC ? this._d.getUTCDay() : this._d.getDay(); return null != a ? (a = Da(a, this.localeData()), this.add(a - b, "d")) : b } function La(a) { if (!this.isValid()) return null != a ? this : NaN; var b = (this.day() + 7 - this.localeData()._week.dow) % 7; return null == a ? b : this.add(a - b, "d") } function Ma(a) {
        if (!this.isValid()) return null != a ? this : NaN;
        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.
        if (null != a) { var b = Ea(a, this.localeData()); return this.day(this.day() % 7 ? b : b - 7) } return this.day() || 7
    } function Na(a) { return this._weekdaysParseExact ? (i(this, "_weekdaysRegex") || Qa.call(this), a ? this._weekdaysStrictRegex : this._weekdaysRegex) : (i(this, "_weekdaysRegex") || (this._weekdaysRegex = ue), this._weekdaysStrictRegex && a ? this._weekdaysStrictRegex : this._weekdaysRegex) } function Oa(a) { return this._weekdaysParseExact ? (i(this, "_weekdaysRegex") || Qa.call(this), a ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex) : (i(this, "_weekdaysShortRegex") || (this._weekdaysShortRegex = ve), this._weekdaysShortStrictRegex && a ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex) } function Pa(a) { return this._weekdaysParseExact ? (i(this, "_weekdaysRegex") || Qa.call(this), a ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex) : (i(this, "_weekdaysMinRegex") || (this._weekdaysMinRegex = we), this._weekdaysMinStrictRegex && a ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex) } function Qa() {
        function a(a, b) { return b.length - a.length } var b, c, d, e, f, g = [], h = [], i = [], j = []; for (b = 0; b < 7; b++)
            // make the regex if we don't have it already
            c = k([2e3, 1]).day(b), d = this.weekdaysMin(c, ""), e = this.weekdaysShort(c, ""), f = this.weekdays(c, ""), g.push(d), h.push(e), i.push(f), j.push(d), j.push(e), j.push(f); for (
            // Sorting makes sure if one weekday (or abbr) is a prefix of another it
            // will match the longer piece.
            g.sort(a), h.sort(a), i.sort(a), j.sort(a), b = 0; b < 7; b++)h[b] = aa(h[b]), i[b] = aa(i[b]), j[b] = aa(j[b]); this._weekdaysRegex = new RegExp("^(" + j.join("|") + ")", "i"), this._weekdaysShortRegex = this._weekdaysRegex, this._weekdaysMinRegex = this._weekdaysRegex, this._weekdaysStrictRegex = new RegExp("^(" + i.join("|") + ")", "i"), this._weekdaysShortStrictRegex = new RegExp("^(" + h.join("|") + ")", "i"), this._weekdaysMinStrictRegex = new RegExp("^(" + g.join("|") + ")", "i")
    }
    // FORMATTING
    function Ra() { return this.hours() % 12 || 12 } function Sa() { return this.hours() || 24 } function Ta(a, b) { U(a, 0, 0, function () { return this.localeData().meridiem(this.hours(), this.minutes(), b) }) }
    // PARSING
    function Ua(a, b) { return b._meridiemParse }
    // LOCALES
    function Va(a) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return "p" === (a + "").toLowerCase().charAt(0)
    } function Wa(a, b, c) { return a > 11 ? c ? "pm" : "PM" : c ? "am" : "AM" } function Xa(a) { return a ? a.toLowerCase().replace("_", "-") : a }
    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function Ya(a) {
        for (var b, c, d, e, f = 0; f < a.length;) {
            for (e = Xa(a[f]).split("-"), b = e.length, c = Xa(a[f + 1]), c = c ? c.split("-") : null; b > 0;) {
                if (d = Za(e.slice(0, b).join("-"))) return d; if (c && c.length >= b && v(e, c, !0) >= b - 1)
                    //the next array item is better than a shallower substring of this one
                    break; b--
            } f++
        } return null
    } function Za(a) {
        var b = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!Be[a] && "undefined" != typeof module && module && module.exports) try {
        b = xe._abbr, require("./locale/" + a),
            // because defineLocale currently also sets the global locale, we
            // want to undo that for lazy loaded locales
            $a(b)
        } catch (a) { } return Be[a]
    }
    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function $a(a, b) {
        var c;
        // moment.duration._locale = moment._locale = data;
        return a && (c = p(b) ? bb(a) : _a(a, b), c && (xe = c)), xe._abbr
    } function _a(a, b) {
        if (null !== b) {
            var c = Ae; if (b.abbr = a, null != Be[a]) y("defineLocaleOverride", "use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."), c = Be[a]._config; else if (null != b.parentLocale) { if (null == Be[b.parentLocale]) return Ce[b.parentLocale] || (Ce[b.parentLocale] = []), Ce[b.parentLocale].push({ name: a, config: b }), null; c = Be[b.parentLocale]._config }
            // backwards compat for now: also set the locale
            // make sure we set the locale AFTER all child locales have been
            // created, so we won't end up with the child locale set.
            return Be[a] = new C(B(c, b)), Ce[a] && Ce[a].forEach(function (a) { _a(a.name, a.config) }), $a(a), Be[a]
        }
        // useful for testing
        return delete Be[a], null
    } function ab(a, b) {
        if (null != b) {
            var c, d = Ae;
            // MERGE
            null != Be[a] && (d = Be[a]._config), b = B(d, b), c = new C(b), c.parentLocale = Be[a], Be[a] = c,
                // backwards compat for now: also set the locale
                $a(a)
        } else
            // pass null for config to unupdate, useful for tests
            null != Be[a] && (null != Be[a].parentLocale ? Be[a] = Be[a].parentLocale : null != Be[a] && delete Be[a]); return Be[a]
    }
    // returns locale data
    function bb(a) {
        var b; if (a && a._locale && a._locale._abbr && (a = a._locale._abbr), !a) return xe; if (!c(a)) {
            if (
                //short-circuit everything else
                b = Za(a)) return b; a = [a]
        } return Ya(a)
    } function cb() { return wd(Be) } function db(a) { var b, c = a._a; return c && m(a).overflow === -2 && (b = c[be] < 0 || c[be] > 11 ? be : c[ce] < 1 || c[ce] > ea(c[ae], c[be]) ? ce : c[de] < 0 || c[de] > 24 || 24 === c[de] && (0 !== c[ee] || 0 !== c[fe] || 0 !== c[ge]) ? de : c[ee] < 0 || c[ee] > 59 ? ee : c[fe] < 0 || c[fe] > 59 ? fe : c[ge] < 0 || c[ge] > 999 ? ge : -1, m(a)._overflowDayOfYear && (b < ae || b > ce) && (b = ce), m(a)._overflowWeeks && b === -1 && (b = he), m(a)._overflowWeekday && b === -1 && (b = ie), m(a).overflow = b), a }
    // date from iso format
    function eb(a) {
        var b, c, d, e, f, g, h = a._i, i = De.exec(h) || Ee.exec(h); if (i) {
            for (m(a).iso = !0, b = 0, c = Ge.length; b < c; b++)if (Ge[b][1].exec(i[1])) { e = Ge[b][0], d = Ge[b][2] !== !1; break } if (null == e) return void (a._isValid = !1); if (i[3]) {
                for (b = 0, c = He.length; b < c; b++)if (He[b][1].exec(i[3])) {
                    // match[2] should be 'T' or space
                    f = (i[2] || " ") + He[b][0]; break
                } if (null == f) return void (a._isValid = !1)
            } if (!d && null != f) return void (a._isValid = !1); if (i[4]) { if (!Fe.exec(i[4])) return void (a._isValid = !1); g = "Z" } a._f = e + (f || "") + (g || ""), kb(a)
        } else a._isValid = !1
    }
    // date from iso format or fallback
    function fb(b) { var c = Ie.exec(b._i); return null !== c ? void (b._d = new Date(+c[1])) : (eb(b), void (b._isValid === !1 && (delete b._isValid, a.createFromInputFallback(b)))) }
    // Pick the first defined of two or three arguments.
    function gb(a, b, c) { return null != a ? a : null != b ? b : c } function hb(b) {
        // hooks is actually the exported moment object
        var c = new Date(a.now()); return b._useUTC ? [c.getUTCFullYear(), c.getUTCMonth(), c.getUTCDate()] : [c.getFullYear(), c.getMonth(), c.getDate()]
    }
    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function ib(a) {
        var b, c, d, e, f = []; if (!a._d) {
            // Default to current date.
            // * if no year, month, day of month are given, default to today
            // * if day of month is given, default month and year
            // * if month is given, default only year
            // * if year is given, don't default anything
            for (d = hb(a),
                //compute day of the year from weeks and weekdays
                a._w && null == a._a[ce] && null == a._a[be] && jb(a),
                //if the day of the year is set, figure out what it is
                a._dayOfYear && (e = gb(a._a[ae], d[ae]), a._dayOfYear > pa(e) && (m(a)._overflowDayOfYear = !0), c = ta(e, 0, a._dayOfYear), a._a[be] = c.getUTCMonth(), a._a[ce] = c.getUTCDate()), b = 0; b < 3 && null == a._a[b]; ++b)a._a[b] = f[b] = d[b];
            // Zero out whatever was not defaulted, including time
            for (; b < 7; b++)a._a[b] = f[b] = null == a._a[b] ? 2 === b ? 1 : 0 : a._a[b];
            // Check for 24:00:00.000
            24 === a._a[de] && 0 === a._a[ee] && 0 === a._a[fe] && 0 === a._a[ge] && (a._nextDay = !0, a._a[de] = 0), a._d = (a._useUTC ? ta : sa).apply(null, f),
                // Apply timezone offset from input. The actual utcOffset can be changed
                // with parseZone.
                null != a._tzm && a._d.setUTCMinutes(a._d.getUTCMinutes() - a._tzm), a._nextDay && (a._a[de] = 24)
        }
    } function jb(a) {
        var b, c, d, e, f, g, h, i; if (b = a._w, null != b.GG || null != b.W || null != b.E) f = 1, g = 4,
            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            c = gb(b.GG, a._a[ae], wa(sb(), 1, 4).year), d = gb(b.W, 1), e = gb(b.E, 1), (e < 1 || e > 7) && (i = !0); else {
            f = a._locale._week.dow, g = a._locale._week.doy; var j = wa(sb(), f, g); c = gb(b.gg, a._a[ae], j.year),
                // Default to current week.
                d = gb(b.w, j.week), null != b.d ? (
                    // weekday -- low day numbers are considered next week
                    e = b.d, (e < 0 || e > 6) && (i = !0)) : null != b.e ? (
                        // local weekday -- counting starts from begining of week
                        e = b.e + f, (b.e < 0 || b.e > 6) && (i = !0)) :
                        // default to begining of week
                        e = f
        } d < 1 || d > xa(c, f, g) ? m(a)._overflowWeeks = !0 : null != i ? m(a)._overflowWeekday = !0 : (h = va(c, d, e, f, g), a._a[ae] = h.year, a._dayOfYear = h.dayOfYear)
    }
    // date from string and format string
    function kb(b) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (b._f === a.ISO_8601) return void eb(b); b._a = [], m(b).empty = !0;
        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var c, d, e, f, g, h = "" + b._i, i = h.length, j = 0; for (e = Y(b._f, b._locale).match(Fd) || [], c = 0; c < e.length; c++)f = e[c], d = (h.match($(f, b)) || [])[0],
            // console.log('token', token, 'parsedInput', parsedInput,
            //         'regex', getParseRegexForToken(token, config));
            d && (g = h.substr(0, h.indexOf(d)), g.length > 0 && m(b).unusedInput.push(g), h = h.slice(h.indexOf(d) + d.length), j += d.length),
            // don't parse if it's not a known token
            Id[f] ? (d ? m(b).empty = !1 : m(b).unusedTokens.push(f), da(f, d, b)) : b._strict && !d && m(b).unusedTokens.push(f);
        // add remaining unparsed input length to the string
        m(b).charsLeftOver = i - j, h.length > 0 && m(b).unusedInput.push(h),
            // clear _12h flag if hour is <= 12
            b._a[de] <= 12 && m(b).bigHour === !0 && b._a[de] > 0 && (m(b).bigHour = void 0), m(b).parsedDateParts = b._a.slice(0), m(b).meridiem = b._meridiem,
            // handle meridiem
            b._a[de] = lb(b._locale, b._a[de], b._meridiem), ib(b), db(b)
    } function lb(a, b, c) {
        var d;
        // Fallback
        return null == c ? b : null != a.meridiemHour ? a.meridiemHour(b, c) : null != a.isPM ? (d = a.isPM(c), d && b < 12 && (b += 12), d || 12 !== b || (b = 0), b) : b
    }
    // date from string and array of format strings
    function mb(a) {
        var b, c, d, e, f; if (0 === a._f.length) return m(a).invalidFormat = !0, void (a._d = new Date(NaN)); for (e = 0; e < a._f.length; e++)f = 0, b = q({}, a), null != a._useUTC && (b._useUTC = a._useUTC), b._f = a._f[e], kb(b), n(b) && (
            // if there is any input that was not parsed add a penalty for that format
            f += m(b).charsLeftOver,
            //or tokens
            f += 10 * m(b).unusedTokens.length, m(b).score = f, (null == d || f < d) && (d = f, c = b)); j(a, c || b)
    } function nb(a) { if (!a._d) { var b = L(a._i); a._a = h([b.year, b.month, b.day || b.date, b.hour, b.minute, b.second, b.millisecond], function (a) { return a && parseInt(a, 10) }), ib(a) } } function ob(a) {
        var b = new r(db(pb(a)));
        // Adding is smart enough around DST
        return b._nextDay && (b.add(1, "d"), b._nextDay = void 0), b
    } function pb(a) { var b = a._i, d = a._f; return a._locale = a._locale || bb(a._l), null === b || void 0 === d && "" === b ? o({ nullInput: !0 }) : ("string" == typeof b && (a._i = b = a._locale.preparse(b)), s(b) ? new r(db(b)) : (g(b) ? a._d = b : c(d) ? mb(a) : d ? kb(a) : qb(a), n(a) || (a._d = null), a)) } function qb(b) {
        var d = b._i; void 0 === d ? b._d = new Date(a.now()) : g(d) ? b._d = new Date(d.valueOf()) : "string" == typeof d ? fb(b) : c(d) ? (b._a = h(d.slice(0), function (a) { return parseInt(a, 10) }), ib(b)) : "object" == typeof d ? nb(b) : f(d) ?
            // from milliseconds
            b._d = new Date(d) : a.createFromInputFallback(b)
    } function rb(a, b, f, g, h) {
        var i = {};
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        return f !== !0 && f !== !1 || (g = f, f = void 0), (d(a) && e(a) || c(a) && 0 === a.length) && (a = void 0), i._isAMomentObject = !0, i._useUTC = i._isUTC = h, i._l = f, i._i = a, i._f = b, i._strict = g, ob(i)
    } function sb(a, b, c, d) { return rb(a, b, c, d, !1) }
    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function tb(a, b) { var d, e; if (1 === b.length && c(b[0]) && (b = b[0]), !b.length) return sb(); for (d = b[0], e = 1; e < b.length; ++e)b[e].isValid() && !b[e][a](d) || (d = b[e]); return d }
    // TODO: Use [].sort instead?
    function ub() { var a = [].slice.call(arguments, 0); return tb("isBefore", a) } function vb() { var a = [].slice.call(arguments, 0); return tb("isAfter", a) } function wb(a) {
        var b = L(a), c = b.year || 0, d = b.quarter || 0, e = b.month || 0, f = b.week || 0, g = b.day || 0, h = b.hour || 0, i = b.minute || 0, j = b.second || 0, k = b.millisecond || 0;
        // representation for dateAddRemove
        this._milliseconds = +k + 1e3 * j +// 1000
            6e4 * i +// 1000 * 60
            1e3 * h * 60 * 60,//using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
            // Because of dateAddRemove treats 24 hours as different from a
            // day when working around DST, we need to store them separately
            this._days = +g + 7 * f,
            // It is impossible translate months into days without knowing
            // which months you are are talking about, so we have to store
            // it separately.
            this._months = +e + 3 * d + 12 * c, this._data = {}, this._locale = bb(), this._bubble()
    } function xb(a) { return a instanceof wb } function yb(a) { return a < 0 ? Math.round(-1 * a) * -1 : Math.round(a) }
    // FORMATTING
    function zb(a, b) { U(a, 0, 0, function () { var a = this.utcOffset(), c = "+"; return a < 0 && (a = -a, c = "-"), c + T(~~(a / 60), 2) + b + T(~~a % 60, 2) }) } function Ab(a, b) { var c = (b || "").match(a); if (null === c) return null; var d = c[c.length - 1] || [], e = (d + "").match(Me) || ["-", 0, 0], f = +(60 * e[1]) + u(e[2]); return 0 === f ? 0 : "+" === e[0] ? f : -f }
    // Return a moment from input, that is local/utc/zone equivalent to model.
    function Bb(b, c) {
        var d, e;
        // Use low-level api, because this fn is low-level api.
        return c._isUTC ? (d = c.clone(), e = (s(b) || g(b) ? b.valueOf() : sb(b).valueOf()) - d.valueOf(), d._d.setTime(d._d.valueOf() + e), a.updateOffset(d, !1), d) : sb(b).local()
    } function Cb(a) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return 15 * -Math.round(a._d.getTimezoneOffset() / 15)
    }
    // MOMENTS
    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function Db(b, c) { var d, e = this._offset || 0; if (!this.isValid()) return null != b ? this : NaN; if (null != b) { if ("string" == typeof b) { if (b = Ab(Xd, b), null === b) return this } else Math.abs(b) < 16 && (b = 60 * b); return !this._isUTC && c && (d = Cb(this)), this._offset = b, this._isUTC = !0, null != d && this.add(d, "m"), e !== b && (!c || this._changeInProgress ? Tb(this, Ob(b - e, "m"), 1, !1) : this._changeInProgress || (this._changeInProgress = !0, a.updateOffset(this, !0), this._changeInProgress = null)), this } return this._isUTC ? e : Cb(this) } function Eb(a, b) { return null != a ? ("string" != typeof a && (a = -a), this.utcOffset(a, b), this) : -this.utcOffset() } function Fb(a) { return this.utcOffset(0, a) } function Gb(a) { return this._isUTC && (this.utcOffset(0, a), this._isUTC = !1, a && this.subtract(Cb(this), "m")), this } function Hb() { if (null != this._tzm) this.utcOffset(this._tzm); else if ("string" == typeof this._i) { var a = Ab(Wd, this._i); null != a ? this.utcOffset(a) : this.utcOffset(0, !0) } return this } function Ib(a) { return !!this.isValid() && (a = a ? sb(a).utcOffset() : 0, (this.utcOffset() - a) % 60 === 0) } function Jb() { return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset() } function Kb() { if (!p(this._isDSTShifted)) return this._isDSTShifted; var a = {}; if (q(a, this), a = pb(a), a._a) { var b = a._isUTC ? k(a._a) : sb(a._a); this._isDSTShifted = this.isValid() && v(a._a, b.toArray()) > 0 } else this._isDSTShifted = !1; return this._isDSTShifted } function Lb() { return !!this.isValid() && !this._isUTC } function Mb() { return !!this.isValid() && this._isUTC } function Nb() { return !!this.isValid() && (this._isUTC && 0 === this._offset) } function Ob(a, b) {
        var c, d, e, g = a,
        // matching against regexp is expensive, do it on demand
        h = null;// checks for null or undefined
        return xb(a) ? g = { ms: a._milliseconds, d: a._days, M: a._months } : f(a) ? (g = {}, b ? g[b] = a : g.milliseconds = a) : (h = Ne.exec(a)) ? (c = "-" === h[1] ? -1 : 1, g = { y: 0, d: u(h[ce]) * c, h: u(h[de]) * c, m: u(h[ee]) * c, s: u(h[fe]) * c, ms: u(yb(1e3 * h[ge])) * c }) : (h = Oe.exec(a)) ? (c = "-" === h[1] ? -1 : 1, g = { y: Pb(h[2], c), M: Pb(h[3], c), w: Pb(h[4], c), d: Pb(h[5], c), h: Pb(h[6], c), m: Pb(h[7], c), s: Pb(h[8], c) }) : null == g ? g = {} : "object" == typeof g && ("from" in g || "to" in g) && (e = Rb(sb(g.from), sb(g.to)), g = {}, g.ms = e.milliseconds, g.M = e.months), d = new wb(g), xb(a) && i(a, "_locale") && (d._locale = a._locale), d
    } function Pb(a, b) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var c = a && parseFloat(a.replace(",", "."));
        // apply sign while we're at it
        return (isNaN(c) ? 0 : c) * b
    } function Qb(a, b) { var c = { milliseconds: 0, months: 0 }; return c.months = b.month() - a.month() + 12 * (b.year() - a.year()), a.clone().add(c.months, "M").isAfter(b) && --c.months, c.milliseconds = +b - +a.clone().add(c.months, "M"), c } function Rb(a, b) { var c; return a.isValid() && b.isValid() ? (b = Bb(b, a), a.isBefore(b) ? c = Qb(a, b) : (c = Qb(b, a), c.milliseconds = -c.milliseconds, c.months = -c.months), c) : { milliseconds: 0, months: 0 } }
    // TODO: remove 'name' arg after deprecation is removed
    function Sb(a, b) {
        return function (c, d) {
            var e, f;
            //invert the arguments, but complain about it
            return null === d || isNaN(+d) || (y(b, "moment()." + b + "(period, number) is deprecated. Please use moment()." + b + "(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."), f = c, c = d, d = f), c = "string" == typeof c ? +c : c, e = Ob(c, d), Tb(this, e, a), this
        }
    } function Tb(b, c, d, e) { var f = c._milliseconds, g = yb(c._days), h = yb(c._months); b.isValid() && (e = null == e || e, f && b._d.setTime(b._d.valueOf() + f * d), g && Q(b, "Date", P(b, "Date") + g * d), h && ja(b, P(b, "Month") + h * d), e && a.updateOffset(b, g || h)) } function Ub(a, b) { var c = a.diff(b, "days", !0); return c < -6 ? "sameElse" : c < -1 ? "lastWeek" : c < 0 ? "lastDay" : c < 1 ? "sameDay" : c < 2 ? "nextDay" : c < 7 ? "nextWeek" : "sameElse" } function Vb(b, c) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var d = b || sb(), e = Bb(d, this).startOf("day"), f = a.calendarFormat(this, e) || "sameElse", g = c && (z(c[f]) ? c[f].call(this, d) : c[f]); return this.format(g || this.localeData().calendar(f, this, sb(d)))
    } function Wb() { return new r(this) } function Xb(a, b) { var c = s(a) ? a : sb(a); return !(!this.isValid() || !c.isValid()) && (b = K(p(b) ? "millisecond" : b), "millisecond" === b ? this.valueOf() > c.valueOf() : c.valueOf() < this.clone().startOf(b).valueOf()) } function Yb(a, b) { var c = s(a) ? a : sb(a); return !(!this.isValid() || !c.isValid()) && (b = K(p(b) ? "millisecond" : b), "millisecond" === b ? this.valueOf() < c.valueOf() : this.clone().endOf(b).valueOf() < c.valueOf()) } function Zb(a, b, c, d) { return d = d || "()", ("(" === d[0] ? this.isAfter(a, c) : !this.isBefore(a, c)) && (")" === d[1] ? this.isBefore(b, c) : !this.isAfter(b, c)) } function $b(a, b) { var c, d = s(a) ? a : sb(a); return !(!this.isValid() || !d.isValid()) && (b = K(b || "millisecond"), "millisecond" === b ? this.valueOf() === d.valueOf() : (c = d.valueOf(), this.clone().startOf(b).valueOf() <= c && c <= this.clone().endOf(b).valueOf())) } function _b(a, b) { return this.isSame(a, b) || this.isAfter(a, b) } function ac(a, b) { return this.isSame(a, b) || this.isBefore(a, b) } function bc(a, b, c) {
        var d, e, f, g;// 1000
        // 1000 * 60
        // 1000 * 60 * 60
        // 1000 * 60 * 60 * 24, negate dst
        // 1000 * 60 * 60 * 24 * 7, negate dst
        return this.isValid() ? (d = Bb(a, this), d.isValid() ? (e = 6e4 * (d.utcOffset() - this.utcOffset()), b = K(b), "year" === b || "month" === b || "quarter" === b ? (g = cc(this, d), "quarter" === b ? g /= 3 : "year" === b && (g /= 12)) : (f = this - d, g = "second" === b ? f / 1e3 : "minute" === b ? f / 6e4 : "hour" === b ? f / 36e5 : "day" === b ? (f - e) / 864e5 : "week" === b ? (f - e) / 6048e5 : f), c ? g : t(g)) : NaN) : NaN
    } function cc(a, b) {
        // difference in months
        var c, d, e = 12 * (b.year() - a.year()) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            f = a.clone().add(e, "months");
        //check for negative zero, return zero if negative zero
        // linear across the month
        // linear across the month
        return b - f < 0 ? (c = a.clone().add(e - 1, "months"), d = (b - f) / (f - c)) : (c = a.clone().add(e + 1, "months"), d = (b - f) / (c - f)), -(e + d) || 0
    } function dc() { return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ") } function ec() { var a = this.clone().utc(); return 0 < a.year() && a.year() <= 9999 ? z(Date.prototype.toISOString) ? this.toDate().toISOString() : X(a, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]") : X(a, "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]") }/**
 * Return a human readable representation of a moment that can
 * also be evaluated to get a new moment which is the same
 *
 * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
 */
    function fc() { if (!this.isValid()) return "moment.invalid(/* " + this._i + " */)"; var a = "moment", b = ""; this.isLocal() || (a = 0 === this.utcOffset() ? "moment.utc" : "moment.parseZone", b = "Z"); var c = "[" + a + '("]', d = 0 < this.year() && this.year() <= 9999 ? "YYYY" : "YYYYYY", e = "-MM-DD[T]HH:mm:ss.SSS", f = b + '[")]'; return this.format(c + d + e + f) } function gc(b) { b || (b = this.isUtc() ? a.defaultFormatUtc : a.defaultFormat); var c = X(this, b); return this.localeData().postformat(c) } function hc(a, b) { return this.isValid() && (s(a) && a.isValid() || sb(a).isValid()) ? Ob({ to: this, from: a }).locale(this.locale()).humanize(!b) : this.localeData().invalidDate() } function ic(a) { return this.from(sb(), a) } function jc(a, b) { return this.isValid() && (s(a) && a.isValid() || sb(a).isValid()) ? Ob({ from: this, to: a }).locale(this.locale()).humanize(!b) : this.localeData().invalidDate() } function kc(a) { return this.to(sb(), a) }
    // If passed a locale key, it will set the locale for this
    // instance.  Otherwise, it will return the locale configuration
    // variables for this instance.
    function lc(a) { var b; return void 0 === a ? this._locale._abbr : (b = bb(a), null != b && (this._locale = b), this) } function mc() { return this._locale } function nc(a) {
        // the following switch intentionally omits break keywords
        // to utilize falling through the cases.
        switch (a = K(a)) {
            case "year": this.month(0);/* falls through */
            case "quarter": case "month": this.date(1);/* falls through */
            case "week": case "isoWeek": case "day": case "date": this.hours(0);/* falls through */
            case "hour": this.minutes(0);/* falls through */
            case "minute": this.seconds(0);/* falls through */
            case "second": this.milliseconds(0)
        }
        // weeks are a special case
        // quarters are also special
        return "week" === a && this.weekday(0), "isoWeek" === a && this.isoWeekday(1), "quarter" === a && this.month(3 * Math.floor(this.month() / 3)), this
    } function oc(a) {
        // 'date' is an alias for 'day', so it should be considered as such.
        return a = K(a), void 0 === a || "millisecond" === a ? this : ("date" === a && (a = "day"), this.startOf(a).add(1, "isoWeek" === a ? "week" : a).subtract(1, "ms"))
    } function pc() { return this._d.valueOf() - 6e4 * (this._offset || 0) } function qc() { return Math.floor(this.valueOf() / 1e3) } function rc() { return new Date(this.valueOf()) } function sc() { var a = this; return [a.year(), a.month(), a.date(), a.hour(), a.minute(), a.second(), a.millisecond()] } function tc() { var a = this; return { years: a.year(), months: a.month(), date: a.date(), hours: a.hours(), minutes: a.minutes(), seconds: a.seconds(), milliseconds: a.milliseconds() } } function uc() {
        // new Date(NaN).toJSON() === null
        return this.isValid() ? this.toISOString() : null
    } function vc() { return n(this) } function wc() { return j({}, m(this)) } function xc() { return m(this).overflow } function yc() { return { input: this._i, format: this._f, locale: this._locale, isUTC: this._isUTC, strict: this._strict } } function zc(a, b) { U(0, [a, a.length], 0, b) }
    // MOMENTS
    function Ac(a) { return Ec.call(this, a, this.week(), this.weekday(), this.localeData()._week.dow, this.localeData()._week.doy) } function Bc(a) { return Ec.call(this, a, this.isoWeek(), this.isoWeekday(), 1, 4) } function Cc() { return xa(this.year(), 1, 4) } function Dc() { var a = this.localeData()._week; return xa(this.year(), a.dow, a.doy) } function Ec(a, b, c, d, e) { var f; return null == a ? wa(this, d, e).year : (f = xa(a, d, e), b > f && (b = f), Fc.call(this, a, b, c, d, e)) } function Fc(a, b, c, d, e) { var f = va(a, b, c, d, e), g = ta(f.year, 0, f.dayOfYear); return this.year(g.getUTCFullYear()), this.month(g.getUTCMonth()), this.date(g.getUTCDate()), this }
    // MOMENTS
    function Gc(a) { return null == a ? Math.ceil((this.month() + 1) / 3) : this.month(3 * (a - 1) + this.month() % 3) }
    // HELPERS
    // MOMENTS
    function Hc(a) { var b = Math.round((this.clone().startOf("day") - this.clone().startOf("year")) / 864e5) + 1; return null == a ? b : this.add(a - b, "d") } function Ic(a, b) { b[ge] = u(1e3 * ("0." + a)) }
    // MOMENTS
    function Jc() { return this._isUTC ? "UTC" : "" } function Kc() { return this._isUTC ? "Coordinated Universal Time" : "" } function Lc(a) { return sb(1e3 * a) } function Mc() { return sb.apply(null, arguments).parseZone() } function Nc(a) { return a } function Oc(a, b, c, d) { var e = bb(), f = k().set(d, b); return e[c](f, a) } function Pc(a, b, c) { if (f(a) && (b = a, a = void 0), a = a || "", null != b) return Oc(a, b, c, "month"); var d, e = []; for (d = 0; d < 12; d++)e[d] = Oc(a, d, c, "month"); return e }
    // ()
    // (5)
    // (fmt, 5)
    // (fmt)
    // (true)
    // (true, 5)
    // (true, fmt, 5)
    // (true, fmt)
    function Qc(a, b, c, d) { "boolean" == typeof a ? (f(b) && (c = b, b = void 0), b = b || "") : (b = a, c = b, a = !1, f(b) && (c = b, b = void 0), b = b || ""); var e = bb(), g = a ? e._week.dow : 0; if (null != c) return Oc(b, (c + g) % 7, d, "day"); var h, i = []; for (h = 0; h < 7; h++)i[h] = Oc(b, (h + g) % 7, d, "day"); return i } function Rc(a, b) { return Pc(a, b, "months") } function Sc(a, b) { return Pc(a, b, "monthsShort") } function Tc(a, b, c) { return Qc(a, b, c, "weekdays") } function Uc(a, b, c) { return Qc(a, b, c, "weekdaysShort") } function Vc(a, b, c) { return Qc(a, b, c, "weekdaysMin") } function Wc() { var a = this._data; return this._milliseconds = Ze(this._milliseconds), this._days = Ze(this._days), this._months = Ze(this._months), a.milliseconds = Ze(a.milliseconds), a.seconds = Ze(a.seconds), a.minutes = Ze(a.minutes), a.hours = Ze(a.hours), a.months = Ze(a.months), a.years = Ze(a.years), this } function Xc(a, b, c, d) { var e = Ob(b, c); return a._milliseconds += d * e._milliseconds, a._days += d * e._days, a._months += d * e._months, a._bubble() }
    // supports only 2.0-style add(1, 's') or add(duration)
    function Yc(a, b) { return Xc(this, a, b, 1) }
    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function Zc(a, b) { return Xc(this, a, b, -1) } function $c(a) { return a < 0 ? Math.floor(a) : Math.ceil(a) } function _c() {
        var a, b, c, d, e, f = this._milliseconds, g = this._days, h = this._months, i = this._data;
        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        // The following code bubbles up values, see the tests for
        // examples of what that means.
        // convert days to months
        // 12 months -> 1 year
        return f >= 0 && g >= 0 && h >= 0 || f <= 0 && g <= 0 && h <= 0 || (f += 864e5 * $c(bd(h) + g), g = 0, h = 0), i.milliseconds = f % 1e3, a = t(f / 1e3), i.seconds = a % 60, b = t(a / 60), i.minutes = b % 60, c = t(b / 60), i.hours = c % 24, g += t(c / 24), e = t(ad(g)), h += e, g -= $c(bd(e)), d = t(h / 12), h %= 12, i.days = g, i.months = h, i.years = d, this
    } function ad(a) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return 4800 * a / 146097
    } function bd(a) {
        // the reverse of daysToMonths
        return 146097 * a / 4800
    } function cd(a) {
        var b, c, d = this._milliseconds; if (a = K(a), "month" === a || "year" === a) return b = this._days + d / 864e5, c = this._months + ad(b), "month" === a ? c : c / 12; switch (
            // handle milliseconds separately because of floating point math errors (issue #1867)
            b = this._days + Math.round(bd(this._months)), a) {
                case "week": return b / 7 + d / 6048e5; case "day": return b + d / 864e5; case "hour": return 24 * b + d / 36e5; case "minute": return 1440 * b + d / 6e4; case "second": return 86400 * b + d / 1e3;
                // Math.floor prevents floating point math errors here
                case "millisecond": return Math.floor(864e5 * b) + d; default: throw new Error("Unknown unit " + a)
            }
    }
    // TODO: Use this.as('ms')?
    function dd() { return this._milliseconds + 864e5 * this._days + this._months % 12 * 2592e6 + 31536e6 * u(this._months / 12) } function ed(a) { return function () { return this.as(a) } } function fd(a) { return a = K(a), this[a + "s"]() } function gd(a) { return function () { return this._data[a] } } function hd() { return t(this.days() / 7) }
    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function id(a, b, c, d, e) { return e.relativeTime(b || 1, !!c, a, d) } function jd(a, b, c) { var d = Ob(a).abs(), e = of(d.as("s")), f = of(d.as("m")), g = of(d.as("h")), h = of(d.as("d")), i = of(d.as("M")), j = of(d.as("y")), k = e < pf.s && ["s", e] || f <= 1 && ["m"] || f < pf.m && ["mm", f] || g <= 1 && ["h"] || g < pf.h && ["hh", g] || h <= 1 && ["d"] || h < pf.d && ["dd", h] || i <= 1 && ["M"] || i < pf.M && ["MM", i] || j <= 1 && ["y"] || ["yy", j]; return k[2] = b, k[3] = +a > 0, k[4] = c, id.apply(null, k) }
    // This function allows you to set the rounding function for relative time strings
    function kd(a) { return void 0 === a ? of : "function" == typeof a && (of = a, !0) }
    // This function allows you to set a threshold for relative time strings
    function ld(a, b) { return void 0 !== pf[a] && (void 0 === b ? pf[a] : (pf[a] = b, !0)) } function md(a) { var b = this.localeData(), c = jd(this, !a, b); return a && (c = b.pastFuture(+this, c)), b.postformat(c) } function nd() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        var a, b, c, d = qf(this._milliseconds) / 1e3, e = qf(this._days), f = qf(this._months);
        // 3600 seconds -> 60 minutes -> 1 hour
        a = t(d / 60), b = t(a / 60), d %= 60, a %= 60,
            // 12 months -> 1 year
            c = t(f / 12), f %= 12;
        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var g = c, h = f, i = e, j = b, k = a, l = d, m = this.asSeconds(); return m ? (m < 0 ? "-" : "") + "P" + (g ? g + "Y" : "") + (h ? h + "M" : "") + (i ? i + "D" : "") + (j || k || l ? "T" : "") + (j ? j + "H" : "") + (k ? k + "M" : "") + (l ? l + "S" : "") : "P0D"
    } var od, pd; pd = Array.prototype.some ? Array.prototype.some : function (a) { for (var b = Object(this), c = b.length >>> 0, d = 0; d < c; d++)if (d in b && a.call(this, b[d], d, b)) return !0; return !1 }; var qd = pd, rd = a.momentProperties = [], sd = !1, td = {}; a.suppressDeprecationWarnings = !1, a.deprecationHandler = null; var ud; ud = Object.keys ? Object.keys : function (a) { var b, c = []; for (b in a) i(a, b) && c.push(b); return c }; var vd, wd = ud, xd = { sameDay: "[Today at] LT", nextDay: "[Tomorrow at] LT", nextWeek: "dddd [at] LT", lastDay: "[Yesterday at] LT", lastWeek: "[Last] dddd [at] LT", sameElse: "L" }, yd = { LTS: "h:mm:ss A", LT: "h:mm A", L: "MM/DD/YYYY", LL: "MMMM D, YYYY", LLL: "MMMM D, YYYY h:mm A", LLLL: "dddd, MMMM D, YYYY h:mm A" }, zd = "Invalid date", Ad = "%d", Bd = /\d{1,2}/, Cd = { future: "in %s", past: "%s ago", s: "a few seconds", m: "a minute", mm: "%d minutes", h: "an hour", hh: "%d hours", d: "a day", dd: "%d days", M: "a month", MM: "%d months", y: "a year", yy: "%d years" }, Dd = {}, Ed = {}, Fd = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g, Gd = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, Hd = {}, Id = {}, Jd = /\d/, Kd = /\d\d/, Ld = /\d{3}/, Md = /\d{4}/, Nd = /[+-]?\d{6}/, Od = /\d\d?/, Pd = /\d\d\d\d?/, Qd = /\d\d\d\d\d\d?/, Rd = /\d{1,3}/, Sd = /\d{1,4}/, Td = /[+-]?\d{1,6}/, Ud = /\d+/, Vd = /[+-]?\d+/, Wd = /Z|[+-]\d\d:?\d\d/gi, Xd = /Z|[+-]\d\d(?::?\d\d)?/gi, Yd = /[+-]?\d+(\.\d{1,3})?/, Zd = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, $d = {}, _d = {}, ae = 0, be = 1, ce = 2, de = 3, ee = 4, fe = 5, ge = 6, he = 7, ie = 8; vd = Array.prototype.indexOf ? Array.prototype.indexOf : function (a) {
        // I know
        var b; for (b = 0; b < this.length; ++b)if (this[b] === a) return b; return -1
    }; var je = vd;
    // FORMATTING
    U("M", ["MM", 2], "Mo", function () { return this.month() + 1 }), U("MMM", 0, 0, function (a) { return this.localeData().monthsShort(this, a) }), U("MMMM", 0, 0, function (a) { return this.localeData().months(this, a) }),
        // ALIASES
        J("month", "M"),
        // PRIORITY
        M("month", 8),
        // PARSING
        Z("M", Od), Z("MM", Od, Kd), Z("MMM", function (a, b) { return b.monthsShortRegex(a) }), Z("MMMM", function (a, b) { return b.monthsRegex(a) }), ba(["M", "MM"], function (a, b) { b[be] = u(a) - 1 }), ba(["MMM", "MMMM"], function (a, b, c, d) {
            var e = c._locale.monthsParse(a, d, c._strict);
            // if we didn't find a month name, mark the date as invalid.
            null != e ? b[be] = e : m(c).invalidMonth = a
        });
    // LOCALES
    var ke = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/, le = "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), me = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"), ne = Zd, oe = Zd;
    // FORMATTING
    U("Y", 0, 0, function () { var a = this.year(); return a <= 9999 ? "" + a : "+" + a }), U(0, ["YY", 2], 0, function () { return this.year() % 100 }), U(0, ["YYYY", 4], 0, "year"), U(0, ["YYYYY", 5], 0, "year"), U(0, ["YYYYYY", 6, !0], 0, "year"),
        // ALIASES
        J("year", "y"),
        // PRIORITIES
        M("year", 1),
        // PARSING
        Z("Y", Vd), Z("YY", Od, Kd), Z("YYYY", Sd, Md), Z("YYYYY", Td, Nd), Z("YYYYYY", Td, Nd), ba(["YYYYY", "YYYYYY"], ae), ba("YYYY", function (b, c) { c[ae] = 2 === b.length ? a.parseTwoDigitYear(b) : u(b) }), ba("YY", function (b, c) { c[ae] = a.parseTwoDigitYear(b) }), ba("Y", function (a, b) { b[ae] = parseInt(a, 10) }),
        // HOOKS
        a.parseTwoDigitYear = function (a) { return u(a) + (u(a) > 68 ? 1900 : 2e3) };
    // MOMENTS
    var pe = O("FullYear", !0);
    // FORMATTING
    U("w", ["ww", 2], "wo", "week"), U("W", ["WW", 2], "Wo", "isoWeek"),
        // ALIASES
        J("week", "w"), J("isoWeek", "W"),
        // PRIORITIES
        M("week", 5), M("isoWeek", 5),
        // PARSING
        Z("w", Od), Z("ww", Od, Kd), Z("W", Od), Z("WW", Od, Kd), ca(["w", "ww", "W", "WW"], function (a, b, c, d) { b[d.substr(0, 1)] = u(a) }); var qe = {
            dow: 0,// Sunday is the first day of the week.
            doy: 6
        };
    // FORMATTING
    U("d", 0, "do", "day"), U("dd", 0, 0, function (a) { return this.localeData().weekdaysMin(this, a) }), U("ddd", 0, 0, function (a) { return this.localeData().weekdaysShort(this, a) }), U("dddd", 0, 0, function (a) { return this.localeData().weekdays(this, a) }), U("e", 0, 0, "weekday"), U("E", 0, 0, "isoWeekday"),
        // ALIASES
        J("day", "d"), J("weekday", "e"), J("isoWeekday", "E"),
        // PRIORITY
        M("day", 11), M("weekday", 11), M("isoWeekday", 11),
        // PARSING
        Z("d", Od), Z("e", Od), Z("E", Od), Z("dd", function (a, b) { return b.weekdaysMinRegex(a) }), Z("ddd", function (a, b) { return b.weekdaysShortRegex(a) }), Z("dddd", function (a, b) { return b.weekdaysRegex(a) }), ca(["dd", "ddd", "dddd"], function (a, b, c, d) {
            var e = c._locale.weekdaysParse(a, d, c._strict);
            // if we didn't get a weekday name, mark the date as invalid
            null != e ? b.d = e : m(c).invalidWeekday = a
        }), ca(["d", "e", "E"], function (a, b, c, d) { b[d] = u(a) });
    // LOCALES
    var re = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), se = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"), te = "Su_Mo_Tu_We_Th_Fr_Sa".split("_"), ue = Zd, ve = Zd, we = Zd; U("H", ["HH", 2], 0, "hour"), U("h", ["hh", 2], 0, Ra), U("k", ["kk", 2], 0, Sa), U("hmm", 0, 0, function () { return "" + Ra.apply(this) + T(this.minutes(), 2) }), U("hmmss", 0, 0, function () { return "" + Ra.apply(this) + T(this.minutes(), 2) + T(this.seconds(), 2) }), U("Hmm", 0, 0, function () { return "" + this.hours() + T(this.minutes(), 2) }), U("Hmmss", 0, 0, function () { return "" + this.hours() + T(this.minutes(), 2) + T(this.seconds(), 2) }), Ta("a", !0), Ta("A", !1),
        // ALIASES
        J("hour", "h"),
        // PRIORITY
        M("hour", 13), Z("a", Ua), Z("A", Ua), Z("H", Od), Z("h", Od), Z("HH", Od, Kd), Z("hh", Od, Kd), Z("hmm", Pd), Z("hmmss", Qd), Z("Hmm", Pd), Z("Hmmss", Qd), ba(["H", "HH"], de), ba(["a", "A"], function (a, b, c) { c._isPm = c._locale.isPM(a), c._meridiem = a }), ba(["h", "hh"], function (a, b, c) { b[de] = u(a), m(c).bigHour = !0 }), ba("hmm", function (a, b, c) { var d = a.length - 2; b[de] = u(a.substr(0, d)), b[ee] = u(a.substr(d)), m(c).bigHour = !0 }), ba("hmmss", function (a, b, c) { var d = a.length - 4, e = a.length - 2; b[de] = u(a.substr(0, d)), b[ee] = u(a.substr(d, 2)), b[fe] = u(a.substr(e)), m(c).bigHour = !0 }), ba("Hmm", function (a, b, c) { var d = a.length - 2; b[de] = u(a.substr(0, d)), b[ee] = u(a.substr(d)) }), ba("Hmmss", function (a, b, c) { var d = a.length - 4, e = a.length - 2; b[de] = u(a.substr(0, d)), b[ee] = u(a.substr(d, 2)), b[fe] = u(a.substr(e)) }); var xe, ye = /[ap]\.?m?\.?/i, ze = O("Hours", !0), Ae = { calendar: xd, longDateFormat: yd, invalidDate: zd, ordinal: Ad, ordinalParse: Bd, relativeTime: Cd, months: le, monthsShort: me, week: qe, weekdays: re, weekdaysMin: te, weekdaysShort: se, meridiemParse: ye }, Be = {}, Ce = {}, De = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/, Ee = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/, Fe = /Z|[+-]\d\d(?::?\d\d)?/, Ge = [["YYYYYY-MM-DD", /[+-]\d{6}-\d\d-\d\d/], ["YYYY-MM-DD", /\d{4}-\d\d-\d\d/], ["GGGG-[W]WW-E", /\d{4}-W\d\d-\d/], ["GGGG-[W]WW", /\d{4}-W\d\d/, !1], ["YYYY-DDD", /\d{4}-\d{3}/], ["YYYY-MM", /\d{4}-\d\d/, !1], ["YYYYYYMMDD", /[+-]\d{10}/], ["YYYYMMDD", /\d{8}/],
        // YYYYMM is NOT allowed by the standard
        ["GGGG[W]WWE", /\d{4}W\d{3}/], ["GGGG[W]WW", /\d{4}W\d{2}/, !1], ["YYYYDDD", /\d{7}/]], He = [["HH:mm:ss.SSSS", /\d\d:\d\d:\d\d\.\d+/], ["HH:mm:ss,SSSS", /\d\d:\d\d:\d\d,\d+/], ["HH:mm:ss", /\d\d:\d\d:\d\d/], ["HH:mm", /\d\d:\d\d/], ["HHmmss.SSSS", /\d\d\d\d\d\d\.\d+/], ["HHmmss,SSSS", /\d\d\d\d\d\d,\d+/], ["HHmmss", /\d\d\d\d\d\d/], ["HHmm", /\d\d\d\d/], ["HH", /\d\d/]], Ie = /^\/?Date\((\-?\d+)/i; a.createFromInputFallback = x("value provided is not in a recognized ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non ISO date formats are discouraged and will be removed in an upcoming major release. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.", function (a) { a._d = new Date(a._i + (a._useUTC ? " UTC" : "")) }),
            // constant that refers to the ISO standard
            a.ISO_8601 = function () { }; var Je = x("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/", function () { var a = sb.apply(null, arguments); return this.isValid() && a.isValid() ? a < this ? this : a : o() }), Ke = x("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/", function () { var a = sb.apply(null, arguments); return this.isValid() && a.isValid() ? a > this ? this : a : o() }), Le = function () { return Date.now ? Date.now() : +new Date }; zb("Z", ":"), zb("ZZ", ""),
                // PARSING
                Z("Z", Xd), Z("ZZ", Xd), ba(["Z", "ZZ"], function (a, b, c) { c._useUTC = !0, c._tzm = Ab(Xd, a) });
    // HELPERS
    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var Me = /([\+\-]|\d\d)/gi;
    // HOOKS
    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    a.updateOffset = function () { };
    // ASP.NET json date format regex
    var Ne = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/, Oe = /^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/; Ob.fn = wb.prototype; var Pe = Sb(1, "add"), Qe = Sb(-1, "subtract"); a.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ", a.defaultFormatUtc = "YYYY-MM-DDTHH:mm:ss[Z]"; var Re = x("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.", function (a) { return void 0 === a ? this.localeData() : this.locale(a) });
    // FORMATTING
    U(0, ["gg", 2], 0, function () { return this.weekYear() % 100 }), U(0, ["GG", 2], 0, function () { return this.isoWeekYear() % 100 }), zc("gggg", "weekYear"), zc("ggggg", "weekYear"), zc("GGGG", "isoWeekYear"), zc("GGGGG", "isoWeekYear"),
        // ALIASES
        J("weekYear", "gg"), J("isoWeekYear", "GG"),
        // PRIORITY
        M("weekYear", 1), M("isoWeekYear", 1),
        // PARSING
        Z("G", Vd), Z("g", Vd), Z("GG", Od, Kd), Z("gg", Od, Kd), Z("GGGG", Sd, Md), Z("gggg", Sd, Md), Z("GGGGG", Td, Nd), Z("ggggg", Td, Nd), ca(["gggg", "ggggg", "GGGG", "GGGGG"], function (a, b, c, d) { b[d.substr(0, 2)] = u(a) }), ca(["gg", "GG"], function (b, c, d, e) { c[e] = a.parseTwoDigitYear(b) }),
        // FORMATTING
        U("Q", 0, "Qo", "quarter"),
        // ALIASES
        J("quarter", "Q"),
        // PRIORITY
        M("quarter", 7),
        // PARSING
        Z("Q", Jd), ba("Q", function (a, b) { b[be] = 3 * (u(a) - 1) }),
        // FORMATTING
        U("D", ["DD", 2], "Do", "date"),
        // ALIASES
        J("date", "D"),
        // PRIOROITY
        M("date", 9),
        // PARSING
        Z("D", Od), Z("DD", Od, Kd), Z("Do", function (a, b) { return a ? b._ordinalParse : b._ordinalParseLenient }), ba(["D", "DD"], ce), ba("Do", function (a, b) { b[ce] = u(a.match(Od)[0], 10) });
    // MOMENTS
    var Se = O("Date", !0);
    // FORMATTING
    U("DDD", ["DDDD", 3], "DDDo", "dayOfYear"),
        // ALIASES
        J("dayOfYear", "DDD"),
        // PRIORITY
        M("dayOfYear", 4),
        // PARSING
        Z("DDD", Rd), Z("DDDD", Ld), ba(["DDD", "DDDD"], function (a, b, c) { c._dayOfYear = u(a) }),
        // FORMATTING
        U("m", ["mm", 2], 0, "minute"),
        // ALIASES
        J("minute", "m"),
        // PRIORITY
        M("minute", 14),
        // PARSING
        Z("m", Od), Z("mm", Od, Kd), ba(["m", "mm"], ee);
    // MOMENTS
    var Te = O("Minutes", !1);
    // FORMATTING
    U("s", ["ss", 2], 0, "second"),
        // ALIASES
        J("second", "s"),
        // PRIORITY
        M("second", 15),
        // PARSING
        Z("s", Od), Z("ss", Od, Kd), ba(["s", "ss"], fe);
    // MOMENTS
    var Ue = O("Seconds", !1);
    // FORMATTING
    U("S", 0, 0, function () { return ~~(this.millisecond() / 100) }), U(0, ["SS", 2], 0, function () { return ~~(this.millisecond() / 10) }), U(0, ["SSS", 3], 0, "millisecond"), U(0, ["SSSS", 4], 0, function () { return 10 * this.millisecond() }), U(0, ["SSSSS", 5], 0, function () { return 100 * this.millisecond() }), U(0, ["SSSSSS", 6], 0, function () { return 1e3 * this.millisecond() }), U(0, ["SSSSSSS", 7], 0, function () { return 1e4 * this.millisecond() }), U(0, ["SSSSSSSS", 8], 0, function () { return 1e5 * this.millisecond() }), U(0, ["SSSSSSSSS", 9], 0, function () { return 1e6 * this.millisecond() }),
        // ALIASES
        J("millisecond", "ms"),
        // PRIORITY
        M("millisecond", 16),
        // PARSING
        Z("S", Rd, Jd), Z("SS", Rd, Kd), Z("SSS", Rd, Ld); var Ve; for (Ve = "SSSS"; Ve.length <= 9; Ve += "S")Z(Ve, Ud); for (Ve = "S"; Ve.length <= 9; Ve += "S")ba(Ve, Ic);
    // MOMENTS
    var We = O("Milliseconds", !1);
    // FORMATTING
    U("z", 0, 0, "zoneAbbr"), U("zz", 0, 0, "zoneName"); var Xe = r.prototype; Xe.add = Pe, Xe.calendar = Vb, Xe.clone = Wb, Xe.diff = bc, Xe.endOf = oc, Xe.format = gc, Xe.from = hc, Xe.fromNow = ic, Xe.to = jc, Xe.toNow = kc, Xe.get = R, Xe.invalidAt = xc, Xe.isAfter = Xb, Xe.isBefore = Yb, Xe.isBetween = Zb, Xe.isSame = $b, Xe.isSameOrAfter = _b, Xe.isSameOrBefore = ac, Xe.isValid = vc, Xe.lang = Re, Xe.locale = lc, Xe.localeData = mc, Xe.max = Ke, Xe.min = Je, Xe.parsingFlags = wc, Xe.set = S, Xe.startOf = nc, Xe.subtract = Qe, Xe.toArray = sc, Xe.toObject = tc, Xe.toDate = rc, Xe.toISOString = ec, Xe.inspect = fc, Xe.toJSON = uc, Xe.toString = dc, Xe.unix = qc, Xe.valueOf = pc, Xe.creationData = yc,
        // Year
        Xe.year = pe, Xe.isLeapYear = ra,
        // Week Year
        Xe.weekYear = Ac, Xe.isoWeekYear = Bc,
        // Quarter
        Xe.quarter = Xe.quarters = Gc,
        // Month
        Xe.month = ka, Xe.daysInMonth = la,
        // Week
        Xe.week = Xe.weeks = Ba, Xe.isoWeek = Xe.isoWeeks = Ca, Xe.weeksInYear = Dc, Xe.isoWeeksInYear = Cc,
        // Day
        Xe.date = Se, Xe.day = Xe.days = Ka, Xe.weekday = La, Xe.isoWeekday = Ma, Xe.dayOfYear = Hc,
        // Hour
        Xe.hour = Xe.hours = ze,
        // Minute
        Xe.minute = Xe.minutes = Te,
        // Second
        Xe.second = Xe.seconds = Ue,
        // Millisecond
        Xe.millisecond = Xe.milliseconds = We,
        // Offset
        Xe.utcOffset = Db, Xe.utc = Fb, Xe.local = Gb, Xe.parseZone = Hb, Xe.hasAlignedHourOffset = Ib, Xe.isDST = Jb, Xe.isLocal = Lb, Xe.isUtcOffset = Mb, Xe.isUtc = Nb, Xe.isUTC = Nb,
        // Timezone
        Xe.zoneAbbr = Jc, Xe.zoneName = Kc,
        // Deprecations
        Xe.dates = x("dates accessor is deprecated. Use date instead.", Se), Xe.months = x("months accessor is deprecated. Use month instead", ka), Xe.years = x("years accessor is deprecated. Use year instead", pe), Xe.zone = x("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/", Eb), Xe.isDSTShifted = x("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information", Kb); var Ye = C.prototype; Ye.calendar = D, Ye.longDateFormat = E, Ye.invalidDate = F, Ye.ordinal = G, Ye.preparse = Nc, Ye.postformat = Nc, Ye.relativeTime = H, Ye.pastFuture = I, Ye.set = A,
            // Month
            Ye.months = fa, Ye.monthsShort = ga, Ye.monthsParse = ia, Ye.monthsRegex = na, Ye.monthsShortRegex = ma,
            // Week
            Ye.week = ya, Ye.firstDayOfYear = Aa, Ye.firstDayOfWeek = za,
            // Day of Week
            Ye.weekdays = Fa, Ye.weekdaysMin = Ha, Ye.weekdaysShort = Ga, Ye.weekdaysParse = Ja, Ye.weekdaysRegex = Na, Ye.weekdaysShortRegex = Oa, Ye.weekdaysMinRegex = Pa,
            // Hours
            Ye.isPM = Va, Ye.meridiem = Wa, $a("en", { ordinalParse: /\d{1,2}(th|st|nd|rd)/, ordinal: function (a) { var b = a % 10, c = 1 === u(a % 100 / 10) ? "th" : 1 === b ? "st" : 2 === b ? "nd" : 3 === b ? "rd" : "th"; return a + c } }),
            // Side effect imports
            a.lang = x("moment.lang is deprecated. Use moment.locale instead.", $a), a.langData = x("moment.langData is deprecated. Use moment.localeData instead.", bb); var Ze = Math.abs, $e = ed("ms"), _e = ed("s"), af = ed("m"), bf = ed("h"), cf = ed("d"), df = ed("w"), ef = ed("M"), ff = ed("y"), gf = gd("milliseconds"), hf = gd("seconds"), jf = gd("minutes"), kf = gd("hours"), lf = gd("days"), mf = gd("months"), nf = gd("years"), of = Math.round, pf = {
                s: 45,// seconds to minute
                m: 45,// minutes to hour
                h: 22,// hours to day
                d: 26,// days to month
                M: 11
            }, qf = Math.abs, rf = wb.prototype;
    // Deprecations
    // Side effect imports
    // FORMATTING
    // PARSING
    // Side effect imports
    return rf.abs = Wc, rf.add = Yc, rf.subtract = Zc, rf.as = cd, rf.asMilliseconds = $e, rf.asSeconds = _e, rf.asMinutes = af, rf.asHours = bf, rf.asDays = cf, rf.asWeeks = df, rf.asMonths = ef, rf.asYears = ff, rf.valueOf = dd, rf._bubble = _c, rf.get = fd, rf.milliseconds = gf, rf.seconds = hf, rf.minutes = jf, rf.hours = kf, rf.days = lf, rf.weeks = hd, rf.months = mf, rf.years = nf, rf.humanize = md, rf.toISOString = nd, rf.toString = nd, rf.toJSON = nd, rf.locale = lc, rf.localeData = mc, rf.toIsoString = x("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)", nd), rf.lang = Re, U("X", 0, 0, "unix"), U("x", 0, 0, "valueOf"), Z("x", Vd), Z("X", Yd), ba("X", function (a, b, c) { c._d = new Date(1e3 * parseFloat(a, 10)) }), ba("x", function (a, b, c) { c._d = new Date(u(a)) }), a.version = "2.17.1", b(sb), a.fn = Xe, a.min = ub, a.max = vb, a.now = Le, a.utc = k, a.unix = Lc, a.months = Rc, a.isDate = g, a.locale = $a, a.invalid = o, a.duration = Ob, a.isMoment = s, a.weekdays = Tc, a.parseZone = Mc, a.localeData = bb, a.isDuration = xb, a.monthsShort = Sc, a.weekdaysMin = Vc, a.defineLocale = _a, a.updateLocale = ab, a.locales = cb, a.weekdaysShort = Uc, a.normalizeUnits = K, a.relativeTimeRounding = kd, a.relativeTimeThreshold = ld, a.calendarFormat = Ub, a.prototype = Xe, a
});
var DateFormatter; !function () { "use strict"; var e, t, a, r, n, o; n = 864e5, o = 3600, e = function (e, t) { return "string" == typeof e && "string" == typeof t && e.toLowerCase() === t.toLowerCase() }, t = function (e, a, r) { var n = r || "0", o = e.toString(); return o.length < a ? t(n + o, a) : o }, a = function (e) { var t, r; for (e = e || {}, t = 1; t < arguments.length; t++) if (r = arguments[t]) for (var n in r) r.hasOwnProperty(n) && ("object" == typeof r[n] ? a(e[n], r[n]) : e[n] = r[n]); return e }, r = { dateSettings: { days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], meridiem: ["AM", "PM"], ordinal: function (e) { var t = e % 10, a = { 1: "st", 2: "nd", 3: "rd" }; return 1 !== Math.floor(e % 100 / 10) && a[t] ? a[t] : "th" } }, separators: /[ \-+\/\.T:@]/g, validParts: /[dDjlNSwzWFmMntLoYyaABgGhHisueTIOPZcrU]/g, intParts: /[djwNzmnyYhHgGis]/g, tzParts: /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g, tzClip: /[^-+\dA-Z]/g }, DateFormatter = function (e) { var t = this, n = a(r, e); t.dateSettings = n.dateSettings, t.separators = n.separators, t.validParts = n.validParts, t.intParts = n.intParts, t.tzParts = n.tzParts, t.tzClip = n.tzClip }, DateFormatter.prototype = { constructor: DateFormatter, parseDate: function (t, a) { var r, n, o, i, s, d, u, l, f, c, m = this, h = !1, g = !1, p = m.dateSettings, y = { date: null, year: null, month: null, day: null, hour: 0, min: 0, sec: 0 }; if (!t) return void 0; if (t instanceof Date) return t; if ("number" == typeof t) return new Date(t); if ("U" === a) return o = parseInt(t), o ? new Date(1e3 * o) : t; if ("string" != typeof t) return ""; if (r = a.match(m.validParts), !r || 0 === r.length) throw new Error("Invalid date format definition."); for (n = t.replace(m.separators, "\x00").split("\x00"), o = 0; o < n.length; o++) switch (i = n[o], s = parseInt(i), r[o]) { case "y": case "Y": f = i.length, 2 === f ? y.year = parseInt((70 > s ? "20" : "19") + i) : 4 === f && (y.year = s), h = !0; break; case "m": case "n": case "M": case "F": isNaN(i) ? (d = p.monthsShort.indexOf(i), d > -1 && (y.month = d + 1), d = p.months.indexOf(i), d > -1 && (y.month = d + 1)) : s >= 1 && 12 >= s && (y.month = s), h = !0; break; case "d": case "j": s >= 1 && 31 >= s && (y.day = s), h = !0; break; case "g": case "h": u = r.indexOf("a") > -1 ? r.indexOf("a") : r.indexOf("A") > -1 ? r.indexOf("A") : -1, c = n[u], u > -1 ? (l = e(c, p.meridiem[0]) ? 0 : e(c, p.meridiem[1]) ? 12 : -1, s >= 1 && 12 >= s && l > -1 ? y.hour = s + l : s >= 0 && 23 >= s && (y.hour = s)) : s >= 0 && 23 >= s && (y.hour = s), g = !0; break; case "G": case "H": s >= 0 && 23 >= s && (y.hour = s), g = !0; break; case "i": s >= 0 && 59 >= s && (y.min = s), g = !0; break; case "s": s >= 0 && 59 >= s && (y.sec = s), g = !0 } if (h === !0 && y.year && y.month && y.day) y.date = new Date(y.year, y.month - 1, y.day, y.hour, y.min, y.sec, 0); else { if (g !== !0) return !1; y.date = new Date(0, 0, 0, y.hour, y.min, y.sec, 0) } return y.date }, guessDate: function (e, t) { if ("string" != typeof e) return e; var a, r, n, o, i = this, s = e.replace(i.separators, "\x00").split("\x00"), d = /^[djmn]/g, u = t.match(i.validParts), l = new Date, f = 0; if (!d.test(u[0])) return e; for (r = 0; r < s.length; r++) { switch (f = 2, n = s[r], o = parseInt(n.substr(0, 2)), r) { case 0: "m" === u[0] || "n" === u[0] ? l.setMonth(o - 1) : l.setDate(o); break; case 1: "m" === u[0] || "n" === u[0] ? l.setDate(o) : l.setMonth(o - 1); break; case 2: a = l.getFullYear(), n.length < 4 ? (l.setFullYear(parseInt(a.toString().substr(0, 4 - n.length) + n)), f = n.length) : (l.setFullYear = parseInt(n.substr(0, 4)), f = 4); break; case 3: l.setHours(o); break; case 4: l.setMinutes(o); break; case 5: l.setSeconds(o) } n.substr(f).length > 0 && s.splice(r + 1, 0, n.substr(f)) } return l }, parseFormat: function (e, a) { var r, i = this, s = i.dateSettings, d = /\\?(.?)/gi, u = function (e, t) { return r[e] ? r[e]() : t }; return r = { d: function () { return t(r.j(), 2) }, D: function () { return s.daysShort[r.w()] }, j: function () { return a.getDate() }, l: function () { return s.days[r.w()] }, N: function () { return r.w() || 7 }, w: function () { return a.getDay() }, z: function () { var e = new Date(r.Y(), r.n() - 1, r.j()), t = new Date(r.Y(), 0, 1); return Math.round((e - t) / n) }, W: function () { var e = new Date(r.Y(), r.n() - 1, r.j() - r.N() + 3), a = new Date(e.getFullYear(), 0, 4); return t(1 + Math.round((e - a) / n / 7), 2) }, F: function () { return s.months[a.getMonth()] }, m: function () { return t(r.n(), 2) }, M: function () { return s.monthsShort[a.getMonth()] }, n: function () { return a.getMonth() + 1 }, t: function () { return new Date(r.Y(), r.n(), 0).getDate() }, L: function () { var e = r.Y(); return e % 4 === 0 && e % 100 !== 0 || e % 400 === 0 ? 1 : 0 }, o: function () { var e = r.n(), t = r.W(), a = r.Y(); return a + (12 === e && 9 > t ? 1 : 1 === e && t > 9 ? -1 : 0) }, Y: function () { return a.getFullYear() }, y: function () { return r.Y().toString().slice(-2) }, a: function () { return r.A().toLowerCase() }, A: function () { var e = r.G() < 12 ? 0 : 1; return s.meridiem[e] }, B: function () { var e = a.getUTCHours() * o, r = 60 * a.getUTCMinutes(), n = a.getUTCSeconds(); return t(Math.floor((e + r + n + o) / 86.4) % 1e3, 3) }, g: function () { return r.G() % 12 || 12 }, G: function () { return a.getHours() }, h: function () { return t(r.g(), 2) }, H: function () { return t(r.G(), 2) }, i: function () { return t(a.getMinutes(), 2) }, s: function () { return t(a.getSeconds(), 2) }, u: function () { return t(1e3 * a.getMilliseconds(), 6) }, e: function () { var e = /\((.*)\)/.exec(String(a))[1]; return e || "Coordinated Universal Time" }, T: function () { var e = (String(a).match(i.tzParts) || [""]).pop().replace(i.tzClip, ""); return e || "UTC" }, I: function () { var e = new Date(r.Y(), 0), t = Date.UTC(r.Y(), 0), a = new Date(r.Y(), 6), n = Date.UTC(r.Y(), 6); return e - t !== a - n ? 1 : 0 }, O: function () { var e = a.getTimezoneOffset(), r = Math.abs(e); return (e > 0 ? "-" : "+") + t(100 * Math.floor(r / 60) + r % 60, 4) }, P: function () { var e = r.O(); return e.substr(0, 3) + ":" + e.substr(3, 2) }, Z: function () { return 60 * -a.getTimezoneOffset() }, c: function () { return "Y-m-d\\TH:i:sP".replace(d, u) }, r: function () { return "D, d M Y H:i:s O".replace(d, u) }, U: function () { return a.getTime() / 1e3 || 0 } }, u(e, e) }, formatDate: function (e, t) { var a, r, n, o, i, s = this, d = ""; if ("string" == typeof e && (e = s.parseDate(e, t), e === !1)) return !1; if (e instanceof Date) { for (n = t.length, a = 0; n > a; a++) i = t.charAt(a), "S" !== i && (o = s.parseFormat(i, e), a !== n - 1 && s.intParts.test(i) && "S" === t.charAt(a + 1) && (r = parseInt(o), o += s.dateSettings.ordinal(r)), d += o); return d } return "" } } }(), function (e) { "function" == typeof define && define.amd ? define(["jquery", "jquery-mousewheel"], e) : "object" == typeof exports ? module.exports = e : e(jQuery) }(function (e) {
    "use strict"; function t(e, t, a) { this.date = e, this.desc = t, this.style = a } var a = { i18n: { ar: { months: ["كانون الثاني", "شباط", "آذار", "نيسان", "مايو", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"], dayOfWeekShort: ["ن", "ث", "ع", "خ", "ج", "س", "ح"], dayOfWeek: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"] }, ro: { months: ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"], dayOfWeekShort: ["Du", "Lu", "Ma", "Mi", "Jo", "Vi", "Sâ"], dayOfWeek: ["Duminică", "Luni", "Marţi", "Miercuri", "Joi", "Vineri", "Sâmbătă"] }, id: { months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"], dayOfWeekShort: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"], dayOfWeek: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] }, is: { months: ["Janúar", "Febrúar", "Mars", "Apríl", "Maí", "Júní", "Júlí", "Ágúst", "September", "Október", "Nóvember", "Desember"], dayOfWeekShort: ["Sun", "Mán", "Þrið", "Mið", "Fim", "Fös", "Lau"], dayOfWeek: ["Sunnudagur", "Mánudagur", "Þriðjudagur", "Miðvikudagur", "Fimmtudagur", "Föstudagur", "Laugardagur"] }, bg: { months: ["Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"], dayOfWeekShort: ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"], dayOfWeek: ["Неделя", "Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота"] }, fa: { months: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"], dayOfWeekShort: ["یکشنبه", "دوشنبه", "سه شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"], dayOfWeek: ["یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه", "یک‌شنبه"] }, ru: { months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"], dayOfWeekShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"], dayOfWeek: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"] }, uk: { months: ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"], dayOfWeekShort: ["Ндл", "Пнд", "Втр", "Срд", "Чтв", "Птн", "Сбт"], dayOfWeek: ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"] }, en: { months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], dayOfWeekShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] }, el: { months: ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"], dayOfWeekShort: ["Κυρ", "Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ"], dayOfWeek: ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"] }, de: { months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"], dayOfWeekShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], dayOfWeek: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"] }, nl: { months: ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"], dayOfWeekShort: ["zo", "ma", "di", "wo", "do", "vr", "za"], dayOfWeek: ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"] }, tr: { months: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"], dayOfWeekShort: ["Paz", "Pts", "Sal", "Çar", "Per", "Cum", "Cts"], dayOfWeek: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"] }, fr: { months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"], dayOfWeekShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"], dayOfWeek: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"] }, es: { months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"], dayOfWeekShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"], dayOfWeek: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"] }, th: { months: ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"], dayOfWeekShort: ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."], dayOfWeek: ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"] }, pl: { months: ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"], dayOfWeekShort: ["nd", "pn", "wt", "śr", "cz", "pt", "sb"], dayOfWeek: ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"] }, pt: { months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"], dayOfWeekShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"], dayOfWeek: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] }, ch: { months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"], dayOfWeekShort: ["日", "一", "二", "三", "四", "五", "六"] }, se: { months: ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"], dayOfWeekShort: ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"] }, kr: { months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"], dayOfWeekShort: ["일", "월", "화", "수", "목", "금", "토"], dayOfWeek: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"] }, it: { months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"], dayOfWeekShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"], dayOfWeek: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"] }, da: { months: ["January", "Februar", "Marts", "April", "Maj", "Juni", "July", "August", "September", "Oktober", "November", "December"], dayOfWeekShort: ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"], dayOfWeek: ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"] }, no: { months: ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"], dayOfWeekShort: ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"], dayOfWeek: ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"] }, ja: { months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"], dayOfWeekShort: ["日", "月", "火", "水", "木", "金", "土"], dayOfWeek: ["日曜", "月曜", "火曜", "水曜", "木曜", "金曜", "土曜"] }, vi: { months: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"], dayOfWeekShort: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"], dayOfWeek: ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"] }, sl: { months: ["Januar", "Februar", "Marec", "April", "Maj", "Junij", "Julij", "Avgust", "September", "Oktober", "November", "December"], dayOfWeekShort: ["Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"], dayOfWeek: ["Nedelja", "Ponedeljek", "Torek", "Sreda", "Četrtek", "Petek", "Sobota"] }, cs: { months: ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"], dayOfWeekShort: ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"] }, hu: { months: ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"], dayOfWeekShort: ["Va", "Hé", "Ke", "Sze", "Cs", "Pé", "Szo"], dayOfWeek: ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"] }, az: { months: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"], dayOfWeekShort: ["B", "Be", "Ça", "Ç", "Ca", "C", "Ş"], dayOfWeek: ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"] }, bs: { months: ["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"], dayOfWeekShort: ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"], dayOfWeek: ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"] }, ca: { months: ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"], dayOfWeekShort: ["Dg", "Dl", "Dt", "Dc", "Dj", "Dv", "Ds"], dayOfWeek: ["Diumenge", "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte"] }, "en-GB": { months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], dayOfWeekShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] }, et: { months: ["Jaanuar", "Veebruar", "Märts", "Aprill", "Mai", "Juuni", "Juuli", "August", "September", "Oktoober", "November", "Detsember"], dayOfWeekShort: ["P", "E", "T", "K", "N", "R", "L"], dayOfWeek: ["Pühapäev", "Esmaspäev", "Teisipäev", "Kolmapäev", "Neljapäev", "Reede", "Laupäev"] }, eu: { months: ["Urtarrila", "Otsaila", "Martxoa", "Apirila", "Maiatza", "Ekaina", "Uztaila", "Abuztua", "Iraila", "Urria", "Azaroa", "Abendua"], dayOfWeekShort: ["Ig.", "Al.", "Ar.", "Az.", "Og.", "Or.", "La."], dayOfWeek: ["Igandea", "Astelehena", "Asteartea", "Asteazkena", "Osteguna", "Ostirala", "Larunbata"] }, fi: { months: ["Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu", "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"], dayOfWeekShort: ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"], dayOfWeek: ["sunnuntai", "maanantai", "tiistai", "keskiviikko", "torstai", "perjantai", "lauantai"] }, gl: { months: ["Xan", "Feb", "Maz", "Abr", "Mai", "Xun", "Xul", "Ago", "Set", "Out", "Nov", "Dec"], dayOfWeekShort: ["Dom", "Lun", "Mar", "Mer", "Xov", "Ven", "Sab"], dayOfWeek: ["Domingo", "Luns", "Martes", "Mércores", "Xoves", "Venres", "Sábado"] }, hr: { months: ["Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"], dayOfWeekShort: ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"], dayOfWeek: ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"] }, ko: { months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"], dayOfWeekShort: ["일", "월", "화", "수", "목", "금", "토"], dayOfWeek: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"] }, lt: { months: ["Sausio", "Vasario", "Kovo", "Balandžio", "Gegužės", "Birželio", "Liepos", "Rugpjūčio", "Rugsėjo", "Spalio", "Lapkričio", "Gruodžio"], dayOfWeekShort: ["Sek", "Pir", "Ant", "Tre", "Ket", "Pen", "Šeš"], dayOfWeek: ["Sekmadienis", "Pirmadienis", "Antradienis", "Trečiadienis", "Ketvirtadienis", "Penktadienis", "Šeštadienis"] }, lv: { months: ["Janvāris", "Februāris", "Marts", "Aprīlis ", "Maijs", "Jūnijs", "Jūlijs", "Augusts", "Septembris", "Oktobris", "Novembris", "Decembris"], dayOfWeekShort: ["Sv", "Pr", "Ot", "Tr", "Ct", "Pk", "St"], dayOfWeek: ["Svētdiena", "Pirmdiena", "Otrdiena", "Trešdiena", "Ceturtdiena", "Piektdiena", "Sestdiena"] }, mk: { months: ["јануари", "февруари", "март", "април", "мај", "јуни", "јули", "август", "септември", "октомври", "ноември", "декември"], dayOfWeekShort: ["нед", "пон", "вто", "сре", "чет", "пет", "саб"], dayOfWeek: ["Недела", "Понеделник", "Вторник", "Среда", "Четврток", "Петок", "Сабота"] }, mn: { months: ["1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар", "7-р сар", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар"], dayOfWeekShort: ["Дав", "Мяг", "Лха", "Пүр", "Бсн", "Бям", "Ням"], dayOfWeek: ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба", "Ням"] }, "pt-BR": { months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"], dayOfWeekShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"], dayOfWeek: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] }, sk: { months: ["Január", "Február", "Marec", "Apríl", "Máj", "Jún", "Júl", "August", "September", "Október", "November", "December"], dayOfWeekShort: ["Ne", "Po", "Ut", "St", "Št", "Pi", "So"], dayOfWeek: ["Nedeľa", "Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota"] }, sq: { months: ["Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor", "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"], dayOfWeekShort: ["Die", "Hën", "Mar", "Mër", "Enj", "Pre", "Shtu"], dayOfWeek: ["E Diel", "E Hënë", "E Martē", "E Mërkurë", "E Enjte", "E Premte", "E Shtunë"] }, "sr-YU": { months: ["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"], dayOfWeekShort: ["Ned", "Pon", "Uto", "Sre", "čet", "Pet", "Sub"], dayOfWeek: ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"] }, sr: { months: ["јануар", "фебруар", "март", "април", "мај", "јун", "јул", "август", "септембар", "октобар", "новембар", "децембар"], dayOfWeekShort: ["нед", "пон", "уто", "сре", "чет", "пет", "суб"], dayOfWeek: ["Недеља", "Понедељак", "Уторак", "Среда", "Четвртак", "Петак", "Субота"] }, sv: { months: ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"], dayOfWeekShort: ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"], dayOfWeek: ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"] }, "zh-TW": { months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"], dayOfWeekShort: ["日", "一", "二", "三", "四", "五", "六"], dayOfWeek: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"] }, zh: { months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"], dayOfWeekShort: ["日", "一", "二", "三", "四", "五", "六"], dayOfWeek: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"] }, he: { months: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"], dayOfWeekShort: ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "שבת"], dayOfWeek: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת", "ראשון"] }, hy: { months: ["Հունվար", "Փետրվար", "Մարտ", "Ապրիլ", "Մայիս", "Հունիս", "Հուլիս", "Օգոստոս", "Սեպտեմբեր", "Հոկտեմբեր", "Նոյեմբեր", "Դեկտեմբեր"], dayOfWeekShort: ["Կի", "Երկ", "Երք", "Չոր", "Հնգ", "Ուրբ", "Շբթ"], dayOfWeek: ["Կիրակի", "Երկուշաբթի", "Երեքշաբթի", "Չորեքշաբթի", "Հինգշաբթի", "Ուրբաթ", "Շաբաթ"] }, kg: { months: ["Үчтүн айы", "Бирдин айы", "Жалган Куран", "Чын Куран", "Бугу", "Кулжа", "Теке", "Баш Оона", "Аяк Оона", "Тогуздун айы", "Жетинин айы", "Бештин айы"], dayOfWeekShort: ["Жек", "Дүй", "Шей", "Шар", "Бей", "Жум", "Ише"], dayOfWeek: ["Жекшемб", "Дүйшөмб", "Шейшемб", "Шаршемб", "Бейшемби", "Жума", "Ишенб"] }, rm: { months: ["Schaner", "Favrer", "Mars", "Avrigl", "Matg", "Zercladur", "Fanadur", "Avust", "Settember", "October", "November", "December"], dayOfWeekShort: ["Du", "Gli", "Ma", "Me", "Gie", "Ve", "So"], dayOfWeek: ["Dumengia", "Glindesdi", "Mardi", "Mesemna", "Gievgia", "Venderdi", "Sonda"] }, ka: { months: ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"], dayOfWeekShort: ["კვ", "ორშ", "სამშ", "ოთხ", "ხუთ", "პარ", "შაბ"], dayOfWeek: ["კვირა", "ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი", "შაბათი"] } }, value: "", rtl: !1, format: "Y/m/d H:i", formatTime: "H:i", formatDate: "Y/m/d", startDate: !1, step: 60, monthChangeSpinner: !0, closeOnDateSelect: !1, closeOnTimeSelect: !0, closeOnWithoutClick: !0, closeOnInputClick: !0, timepicker: !0, datepicker: !0, weeks: !1, defaultTime: !1, defaultDate: !1, minDate: !1, maxDate: !1, minTime: !1, maxTime: !1, disabledMinTime: !1, disabledMaxTime: !1, allowTimes: [], opened: !1, initTime: !0, inline: !1, theme: "", onSelectDate: function () { }, onSelectTime: function () { }, onChangeMonth: function () { }, onGetWeekOfYear: function () { }, onChangeYear: function () { }, onChangeDateTime: function () { }, onShow: function () { }, onClose: function () { }, onGenerate: function () { }, withoutCopyright: !0, inverseButton: !1, hours12: !1, next: "xdsoft_next", prev: "xdsoft_prev", dayOfWeekStart: 0, parentID: "body", timeHeightInTimePicker: 25, timepickerScrollbar: !0, todayButton: !0, prevButton: !0, nextButton: !0, defaultSelect: !0, scrollMonth: !0, scrollTime: !0, scrollInput: !0, lazyInit: !1, mask: !1, validateOnBlur: !0, allowBlank: !0, yearStart: 1950, yearEnd: 2050, monthStart: 0, monthEnd: 11, style: "", id: "", fixed: !1, roundTime: "round", className: "", weekends: [], highlightedDates: [], highlightedPeriods: [], allowDates: [], allowDateRe: null, disabledDates: [], disabledWeekDays: [], yearOffset: 0, beforeShowDay: null, enterLikeTab: !0, showApplyButton: !1 }, r = null, n = "en", o = "en", i = { meridiem: ["AM", "PM"] }, s = function () { var t = a.i18n[o], n = { days: t.dayOfWeek, daysShort: t.dayOfWeekShort, months: t.months, monthsShort: e.map(t.months, function (e) { return e.substring(0, 3) }) }; r = new DateFormatter({ dateSettings: e.extend({}, i, n) }) }; e.datetimepicker = { setLocale: function (e) { var t = a.i18n[e] ? e : n; o != t && (o = t, s()) }, setDateFormatter: function (e) { r = e }, RFC_2822: "D, d M Y H:i:s O", ATOM: "Y-m-dTH:i:sP", ISO_8601: "Y-m-dTH:i:sO", RFC_822: "D, d M y H:i:s O", RFC_850: "l, d-M-y H:i:s T", RFC_1036: "D, d M y H:i:s O", RFC_1123: "D, d M Y H:i:s O", RSS: "D, d M Y H:i:s O", W3C: "Y-m-dTH:i:sP" }, s(), window.getComputedStyle || (window.getComputedStyle = function (e) { return this.el = e, this.getPropertyValue = function (t) { var a = /(\-([a-z]){1})/g; return "float" === t && (t = "styleFloat"), a.test(t) && (t = t.replace(a, function (e, t, a) { return a.toUpperCase() })), e.currentStyle[t] || null }, this }), Array.prototype.indexOf || (Array.prototype.indexOf = function (e, t) { var a, r; for (a = t || 0, r = this.length; r > a; a += 1) if (this[a] === e) return a; return -1 }), Date.prototype.countDaysInMonth = function () { return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate() }, e.fn.xdsoftScroller = function (t) { return this.each(function () { var a, r, n, o, i, s = e(this), d = function (e) { var t, a = { x: 0, y: 0 }; return "touchstart" === e.type || "touchmove" === e.type || "touchend" === e.type || "touchcancel" === e.type ? (t = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0], a.x = t.clientX, a.y = t.clientY) : ("mousedown" === e.type || "mouseup" === e.type || "mousemove" === e.type || "mouseover" === e.type || "mouseout" === e.type || "mouseenter" === e.type || "mouseleave" === e.type) && (a.x = e.clientX, a.y = e.clientY), a }, u = 100, l = !1, f = 0, c = 0, m = 0, h = !1, g = 0, p = function () { }; return "hide" === t ? void s.find(".xdsoft_scrollbar").hide() : (e(this).hasClass("xdsoft_scroller_box") || (a = s.children().eq(0), r = s[0].clientHeight, n = a[0].offsetHeight, o = e('<div class="xdsoft_scrollbar"></div>'), i = e('<div class="xdsoft_scroller"></div>'), o.append(i), s.addClass("xdsoft_scroller_box").append(o), p = function (e) { var t = d(e).y - f + g; 0 > t && (t = 0), t + i[0].offsetHeight > m && (t = m - i[0].offsetHeight), s.trigger("scroll_element.xdsoft_scroller", [u ? t / u : 0]) }, i.on("touchstart.xdsoft_scroller mousedown.xdsoft_scroller", function (a) { r || s.trigger("resize_scroll.xdsoft_scroller", [t]), f = d(a).y, g = parseInt(i.css("margin-top"), 10), m = o[0].offsetHeight, "mousedown" === a.type || "touchstart" === a.type ? (document && e(document.body).addClass("xdsoft_noselect"), e([document.body, window]).on("touchend mouseup.xdsoft_scroller", function n() { e([document.body, window]).off("touchend mouseup.xdsoft_scroller", n).off("mousemove.xdsoft_scroller", p).removeClass("xdsoft_noselect") }), e(document.body).on("mousemove.xdsoft_scroller", p)) : (h = !0, a.stopPropagation(), a.preventDefault()) }).on("touchmove", function (e) { h && (e.preventDefault(), p(e)) }).on("touchend touchcancel", function () { h = !1, g = 0 }), s.on("scroll_element.xdsoft_scroller", function (e, t) { r || s.trigger("resize_scroll.xdsoft_scroller", [t, !0]), t = t > 1 ? 1 : 0 > t || isNaN(t) ? 0 : t, i.css("margin-top", u * t), setTimeout(function () { a.css("marginTop", -parseInt((a[0].offsetHeight - r) * t, 10)) }, 10) }).on("resize_scroll.xdsoft_scroller", function (e, t, d) { var l, f; r = s[0].clientHeight, n = a[0].offsetHeight, l = r / n, f = l * o[0].offsetHeight, l > 1 ? i.hide() : (i.show(), i.css("height", parseInt(f > 10 ? f : 10, 10)), u = o[0].offsetHeight - i[0].offsetHeight, d !== !0 && s.trigger("scroll_element.xdsoft_scroller", [t || Math.abs(parseInt(a.css("marginTop"), 10)) / (n - r)])) }), s.on("mousewheel", function (e) { var t = Math.abs(parseInt(a.css("marginTop"), 10)); return t -= 20 * e.deltaY, 0 > t && (t = 0), s.trigger("scroll_element.xdsoft_scroller", [t / (n - r)]), e.stopPropagation(), !1 }), s.on("touchstart", function (e) { l = d(e), c = Math.abs(parseInt(a.css("marginTop"), 10)) }), s.on("touchmove", function (e) { if (l) { e.preventDefault(); var t = d(e); s.trigger("scroll_element.xdsoft_scroller", [(c - (t.y - l.y)) / (n - r)]) } }), s.on("touchend touchcancel", function () { l = !1, c = 0 })), void s.trigger("resize_scroll.xdsoft_scroller", [t])) }) }, e.fn.datetimepicker = function (n, i) {
        var s, d, u = this, l = 48, f = 57, c = 96, m = 105, h = 17, g = 46, p = 13, y = 27, v = 8, b = 37, D = 38, k = 39, x = 40, T = 9, S = 116, w = 65, O = 67, M = 86, _ = 90, W = 89, F = !1, C = e.isPlainObject(n) || !n ? e.extend(!0, {}, a, n) : e.extend(!0, {}, a), P = 0, A = function (e) { e.on("open.xdsoft focusin.xdsoft mousedown.xdsoft touchstart", function t() { e.is(":disabled") || e.data("xdsoft_datetimepicker") || (clearTimeout(P), P = setTimeout(function () { e.data("xdsoft_datetimepicker") || s(e), e.off("open.xdsoft focusin.xdsoft mousedown.xdsoft touchstart", t).trigger("open.xdsoft") }, 100)) }) }; return s = function (a) {
            function i() { var e, t = !1; return C.startDate ? t = j.strToDate(C.startDate) : (t = C.value || (a && a.val && a.val() ? a.val() : ""), t ? t = j.strToDateTime(t) : C.defaultDate && (t = j.strToDateTime(C.defaultDate), C.defaultTime && (e = j.strtotime(C.defaultTime), t.setHours(e.getHours()), t.setMinutes(e.getMinutes())))), t && j.isValidDate(t) ? J.data("changed", !0) : t = "", t || 0 } function s(t) { var r = function (e, t) { var a = e.replace(/([\[\]\/\{\}\(\)\-\.\+]{1})/g, "\\$1").replace(/_/g, "{digit+}").replace(/([0-9]{1})/g, "{digit$1}").replace(/\{digit([0-9]{1})\}/g, "[0-$1_]{1}").replace(/\{digit[\+]\}/g, "[0-9_]{1}"); return new RegExp(a).test(t) }, n = function (e) { try { if (document.selection && document.selection.createRange) { var t = document.selection.createRange(); return t.getBookmark().charCodeAt(2) - 2 } if (e.setSelectionRange) return e.selectionStart } catch (a) { return 0 } }, o = function (e, t) { if (e = "string" == typeof e || e instanceof String ? document.getElementById(e) : e, !e) return !1; if (e.createTextRange) { var a = e.createTextRange(); return a.collapse(!0), a.moveEnd("character", t), a.moveStart("character", t), a.select(), !0 } return e.setSelectionRange ? (e.setSelectionRange(t, t), !0) : !1 }; t.mask && a.off("keydown.xdsoft"), t.mask === !0 && (t.mask = "undefined" != typeof moment ? t.format.replace(/Y{4}/g, "9999").replace(/Y{2}/g, "99").replace(/M{2}/g, "19").replace(/D{2}/g, "39").replace(/H{2}/g, "29").replace(/m{2}/g, "59").replace(/s{2}/g, "59") : t.format.replace(/Y/g, "9999").replace(/F/g, "9999").replace(/m/g, "19").replace(/d/g, "39").replace(/H/g, "29").replace(/i/g, "59").replace(/s/g, "59")), "string" === e.type(t.mask) && (r(t.mask, a.val()) || (a.val(t.mask.replace(/[0-9]/g, "_")), o(a[0], 0)), a.on("keydown.xdsoft", function (i) { var s, d, u = this.value, C = i.which; if (C >= l && f >= C || C >= c && m >= C || C === v || C === g) { for (s = n(this), d = C !== v && C !== g ? String.fromCharCode(C >= c && m >= C ? C - l : C) : "_", C !== v && C !== g || !s || (s -= 1, d = "_") ; /[^0-9_]/.test(t.mask.substr(s, 1)) && s < t.mask.length && s > 0;) s += C === v || C === g ? -1 : 1; if (u = u.substr(0, s) + d + u.substr(s + 1), "" === e.trim(u)) u = t.mask.replace(/[0-9]/g, "_"); else if (s === t.mask.length) return i.preventDefault(), !1; for (s += C === v || C === g ? 0 : 1; /[^0-9_]/.test(t.mask.substr(s, 1)) && s < t.mask.length && s > 0;) s += C === v || C === g ? -1 : 1; r(t.mask, u) ? (this.value = u, o(this, s)) : "" === e.trim(u) ? this.value = t.mask.replace(/[0-9]/g, "_") : a.trigger("error_input.xdsoft") } else if (-1 !== [w, O, M, _, W].indexOf(C) && F || -1 !== [y, D, x, b, k, S, h, T, p].indexOf(C)) return !0; return i.preventDefault(), !1 })) } var d, u, P, A, Y, j, H, J = e('<div class="xdsoft_datetimepicker xdsoft_noselect"></div>'), z = e('<div class="xdsoft_copyright"><a target="_blank" href="http://xdsoft.net/jqplugins/datetimepicker/">xdsoft.net</a></div>'), I = e('<div class="xdsoft_datepicker active"></div>'), N = e('<div class="xdsoft_monthpicker"><button type="button" class="xdsoft_prev"></button><button type="button" class="xdsoft_today_button"></button><div class="xdsoft_label xdsoft_month"><span></span><i></i></div><div class="xdsoft_label xdsoft_year"><span></span><i></i></div><button type="button" class="xdsoft_next"></button></div>'), L = e('<div class="xdsoft_calendar"></div>'), E = e('<div class="xdsoft_timepicker active"><button type="button" class="xdsoft_prev"></button><div class="xdsoft_time_box"></div><button type="button" class="xdsoft_next"></button></div>'), R = E.find(".xdsoft_time_box").eq(0), B = e('<div class="xdsoft_time_variant"></div>'), V = e('<button type="button" class="xdsoft_save_selected blue-gradient-button">Save Selected</button>'), G = e('<div class="xdsoft_select xdsoft_monthselect"><div></div></div>'), U = e('<div class="xdsoft_select xdsoft_yearselect"><div></div></div>'), q = !1, X = 0; C.id && J.attr("id", C.id), C.style && J.attr("style", C.style), C.weeks && J.addClass("xdsoft_showweeks"), C.rtl && J.addClass("xdsoft_rtl"), J.addClass("xdsoft_" + C.theme), J.addClass(C.className), N.find(".xdsoft_month span").after(G), N.find(".xdsoft_year span").after(U), N.find(".xdsoft_month,.xdsoft_year").on("touchstart mousedown.xdsoft", function (t) { var a, r, n = e(this).find(".xdsoft_select").eq(0), o = 0, i = 0, s = n.is(":visible"); for (N.find(".xdsoft_select").hide(), j.currentTime && (o = j.currentTime[e(this).hasClass("xdsoft_month") ? "getMonth" : "getFullYear"]()), n[s ? "hide" : "show"](), a = n.find("div.xdsoft_option"), r = 0; r < a.length && a.eq(r).data("value") !== o; r += 1) i += a[0].offsetHeight; return n.xdsoftScroller(i / (n.children()[0].offsetHeight - n[0].clientHeight)), t.stopPropagation(), !1 }), N.find(".xdsoft_select").xdsoftScroller().on("touchstart mousedown.xdsoft", function (e) { e.stopPropagation(), e.preventDefault() }).on("touchstart mousedown.xdsoft", ".xdsoft_option", function () { (void 0 === j.currentTime || null === j.currentTime) && (j.currentTime = j.now()); var t = j.currentTime.getFullYear(); j && j.currentTime && j.currentTime[e(this).parent().parent().hasClass("xdsoft_monthselect") ? "setMonth" : "setFullYear"](e(this).data("value")), e(this).parent().parent().hide(), J.trigger("xchange.xdsoft"), C.onChangeMonth && e.isFunction(C.onChangeMonth) && C.onChangeMonth.call(J, j.currentTime, J.data("input")), t !== j.currentTime.getFullYear() && e.isFunction(C.onChangeYear) && C.onChangeYear.call(J, j.currentTime, J.data("input")) }), J.getValue = function () { return j.getCurrentTime() }, J.setOptions = function (n) {
                var o = {}; C = e.extend(!0, {}, C, n), n.allowTimes && e.isArray(n.allowTimes) && n.allowTimes.length && (C.allowTimes = e.extend(!0, [], n.allowTimes)), n.weekends && e.isArray(n.weekends) && n.weekends.length && (C.weekends = e.extend(!0, [], n.weekends)), n.allowDates && e.isArray(n.allowDates) && n.allowDates.length && (C.allowDates = e.extend(!0, [], n.allowDates)), n.allowDateRe && "[object String]" === Object.prototype.toString.call(n.allowDateRe) && (C.allowDateRe = new RegExp(n.allowDateRe)), n.highlightedDates && e.isArray(n.highlightedDates) && n.highlightedDates.length && (e.each(n.highlightedDates, function (a, n) { var i, s = e.map(n.split(","), e.trim), d = new t(r.parseDate(s[0], C.formatDate), s[1], s[2]), u = r.formatDate(d.date, C.formatDate); void 0 !== o[u] ? (i = o[u].desc, i && i.length && d.desc && d.desc.length && (o[u].desc = i + "\n" + d.desc)) : o[u] = d }), C.highlightedDates = e.extend(!0, [], o)), n.highlightedPeriods && e.isArray(n.highlightedPeriods) && n.highlightedPeriods.length && (o = e.extend(!0, [], C.highlightedDates),
                e.each(n.highlightedPeriods, function (a, n) { var i, s, d, u, l, f, c; if (e.isArray(n)) i = n[0], s = n[1], d = n[2], c = n[3]; else { var m = e.map(n.split(","), e.trim); i = r.parseDate(m[0], C.formatDate), s = r.parseDate(m[1], C.formatDate), d = m[2], c = m[3] } for (; s >= i;) u = new t(i, d, c), l = r.formatDate(i, C.formatDate), i.setDate(i.getDate() + 1), void 0 !== o[l] ? (f = o[l].desc, f && f.length && u.desc && u.desc.length && (o[l].desc = f + "\n" + u.desc)) : o[l] = u }), C.highlightedDates = e.extend(!0, [], o)), n.disabledDates && e.isArray(n.disabledDates) && n.disabledDates.length && (C.disabledDates = e.extend(!0, [], n.disabledDates)), n.disabledWeekDays && e.isArray(n.disabledWeekDays) && n.disabledWeekDays.length && (C.disabledWeekDays = e.extend(!0, [], n.disabledWeekDays)), !C.open && !C.opened || C.inline || a.trigger("open.xdsoft"), C.inline && (q = !0, J.addClass("xdsoft_inline"), a.after(J).hide()), C.inverseButton && (C.next = "xdsoft_prev", C.prev = "xdsoft_next"), C.datepicker ? I.addClass("active") : I.removeClass("active"), C.timepicker ? E.addClass("active") : E.removeClass("active"), C.value && (j.setCurrentTime(C.value), a && a.val && a.val(j.str)), C.dayOfWeekStart = isNaN(C.dayOfWeekStart) ? 0 : parseInt(C.dayOfWeekStart, 10) % 7, C.timepickerScrollbar || R.xdsoftScroller("hide"), C.minDate && /^[\+\-](.*)$/.test(C.minDate) && (C.minDate = r.formatDate(j.strToDateTime(C.minDate), C.formatDate)), C.maxDate && /^[\+\-](.*)$/.test(C.maxDate) && (C.maxDate = r.formatDate(j.strToDateTime(C.maxDate), C.formatDate)), V.toggle(C.showApplyButton), N.find(".xdsoft_today_button").css("visibility", C.todayButton ? "visible" : "hidden"), N.find("." + C.prev).css("visibility", C.prevButton ? "visible" : "hidden"), N.find("." + C.next).css("visibility", C.nextButton ? "visible" : "hidden"), s(C), C.validateOnBlur && a.off("blur.xdsoft").on("blur.xdsoft", function () { if (C.allowBlank && (!e.trim(e(this).val()).length || "string" == typeof C.mask && e.trim(e(this).val()) === C.mask.replace(/[0-9]/g, "_"))) e(this).val(null), J.data("xdsoft_datetime").empty(); else { var t = r.parseDate(e(this).val(), C.format); if (t) e(this).val(r.formatDate(t, C.format)); else { var a = +[e(this).val()[0], e(this).val()[1]].join(""), n = +[e(this).val()[2], e(this).val()[3]].join(""); e(this).val(!C.datepicker && C.timepicker && a >= 0 && 24 > a && n >= 0 && 60 > n ? [a, n].map(function (e) { return e > 9 ? e : "0" + e }).join(":") : r.formatDate(j.now(), C.format)) } J.data("xdsoft_datetime").setCurrentTime(e(this).val()) } J.trigger("changedatetime.xdsoft"), J.trigger("close.xdsoft") }), C.dayOfWeekStartPrev = 0 === C.dayOfWeekStart ? 6 : C.dayOfWeekStart - 1, J.trigger("xchange.xdsoft").trigger("afterOpen.xdsoft")
            }, J.data("options", C).on("touchstart mousedown.xdsoft", function (e) { return e.stopPropagation(), e.preventDefault(), U.hide(), G.hide(), !1 }), R.append(B), R.xdsoftScroller(), J.on("afterOpen.xdsoft", function () { R.xdsoftScroller() }), J.append(I).append(E), C.withoutCopyright !== !0 && J.append(z), I.append(N).append(L).append(V), e(C.parentID).append(J), d = function () { var t = this; t.now = function (e) { var a, r, n = new Date; return !e && C.defaultDate && (a = t.strToDateTime(C.defaultDate), n.setFullYear(a.getFullYear()), n.setMonth(a.getMonth()), n.setDate(a.getDate())), C.yearOffset && n.setFullYear(n.getFullYear() + C.yearOffset), !e && C.defaultTime && (r = t.strtotime(C.defaultTime), n.setHours(r.getHours()), n.setMinutes(r.getMinutes())), n }, t.isValidDate = function (e) { return "[object Date]" !== Object.prototype.toString.call(e) ? !1 : !isNaN(e.getTime()) }, t.setCurrentTime = function (e, a) { t.currentTime = "string" == typeof e ? t.strToDateTime(e) : t.isValidDate(e) ? e : e || a || !C.allowBlank ? t.now() : null, J.trigger("xchange.xdsoft") }, t.empty = function () { t.currentTime = null }, t.getCurrentTime = function () { return t.currentTime }, t.nextMonth = function () { (void 0 === t.currentTime || null === t.currentTime) && (t.currentTime = t.now()); var a, r = t.currentTime.getMonth() + 1; return 12 === r && (t.currentTime.setFullYear(t.currentTime.getFullYear() + 1), r = 0), a = t.currentTime.getFullYear(), t.currentTime.setDate(Math.min(new Date(t.currentTime.getFullYear(), r + 1, 0).getDate(), t.currentTime.getDate())), t.currentTime.setMonth(r), C.onChangeMonth && e.isFunction(C.onChangeMonth) && C.onChangeMonth.call(J, j.currentTime, J.data("input")), a !== t.currentTime.getFullYear() && e.isFunction(C.onChangeYear) && C.onChangeYear.call(J, j.currentTime, J.data("input")), J.trigger("xchange.xdsoft"), r }, t.prevMonth = function () { (void 0 === t.currentTime || null === t.currentTime) && (t.currentTime = t.now()); var a = t.currentTime.getMonth() - 1; return -1 === a && (t.currentTime.setFullYear(t.currentTime.getFullYear() - 1), a = 11), t.currentTime.setDate(Math.min(new Date(t.currentTime.getFullYear(), a + 1, 0).getDate(), t.currentTime.getDate())), t.currentTime.setMonth(a), C.onChangeMonth && e.isFunction(C.onChangeMonth) && C.onChangeMonth.call(J, j.currentTime, J.data("input")), J.trigger("xchange.xdsoft"), a }, t.getWeekOfYear = function (t) { if (C.onGetWeekOfYear && e.isFunction(C.onGetWeekOfYear)) { var a = C.onGetWeekOfYear.call(J, t); if ("undefined" != typeof a) return a } var r = new Date(t.getFullYear(), 0, 1); return 4 != r.getDay() && r.setMonth(0, 1 + (4 - r.getDay() + 7) % 7), Math.ceil(((t - r) / 864e5 + r.getDay() + 1) / 7) }, t.strToDateTime = function (e) { var a, n, o = []; return e && e instanceof Date && t.isValidDate(e) ? e : (o = /^(\+|\-)(.*)$/.exec(e), o && (o[2] = r.parseDate(o[2], C.formatDate)), o && o[2] ? (a = o[2].getTime() - 6e4 * o[2].getTimezoneOffset(), n = new Date(t.now(!0).getTime() + parseInt(o[1] + "1", 10) * a)) : n = e ? r.parseDate(e, C.format) : t.now(), t.isValidDate(n) || (n = t.now()), n) }, t.strToDate = function (e) { if (e && e instanceof Date && t.isValidDate(e)) return e; var a = e ? r.parseDate(e, C.formatDate) : t.now(!0); return t.isValidDate(a) || (a = t.now(!0)), a }, t.strtotime = function (e) { if (e && e instanceof Date && t.isValidDate(e)) return e; var a = e ? r.parseDate(e, C.formatTime) : t.now(!0); return t.isValidDate(a) || (a = t.now(!0)), a }, t.str = function () { return r.formatDate(t.currentTime, C.format) }, t.currentTime = this.now() }, j = new d, V.on("touchend click", function (e) { e.preventDefault(), J.data("changed", !0), j.setCurrentTime(i()), a.val(j.str()), J.trigger("close.xdsoft") }), N.find(".xdsoft_today_button").on("touchend mousedown.xdsoft", function () { J.data("changed", !0), j.setCurrentTime(0, !0), J.trigger("afterOpen.xdsoft") }).on("dblclick.xdsoft", function () { var e, t, r = j.getCurrentTime(); r = new Date(r.getFullYear(), r.getMonth(), r.getDate()), e = j.strToDate(C.minDate), e = new Date(e.getFullYear(), e.getMonth(), e.getDate()), e > r || (t = j.strToDate(C.maxDate), t = new Date(t.getFullYear(), t.getMonth(), t.getDate()), r > t || (a.val(j.str()), a.trigger("change"), J.trigger("close.xdsoft"))) }), N.find(".xdsoft_prev,.xdsoft_next").on("touchend mousedown.xdsoft", function () { var t = e(this), a = 0, r = !1; !function n(e) { t.hasClass(C.next) ? j.nextMonth() : t.hasClass(C.prev) && j.prevMonth(), C.monthChangeSpinner && (r || (a = setTimeout(n, e || 100))) }(500), e([document.body, window]).on("touchend mouseup.xdsoft", function o() { clearTimeout(a), r = !0, e([document.body, window]).off("touchend mouseup.xdsoft", o) }) }), E.find(".xdsoft_prev,.xdsoft_next").on("touchend mousedown.xdsoft", function () { var t = e(this), a = 0, r = !1, n = 110; !function o(e) { var i = R[0].clientHeight, s = B[0].offsetHeight, d = Math.abs(parseInt(B.css("marginTop"), 10)); t.hasClass(C.next) && s - i - C.timeHeightInTimePicker >= d ? B.css("marginTop", "-" + (d + C.timeHeightInTimePicker) + "px") : t.hasClass(C.prev) && d - C.timeHeightInTimePicker >= 0 && B.css("marginTop", "-" + (d - C.timeHeightInTimePicker) + "px"), R.trigger("scroll_element.xdsoft_scroller", [Math.abs(parseInt(B[0].style.marginTop, 10) / (s - i))]), n = n > 10 ? 10 : n - 10, r || (a = setTimeout(o, e || n)) }(500), e([document.body, window]).on("touchend mouseup.xdsoft", function i() { clearTimeout(a), r = !0, e([document.body, window]).off("touchend mouseup.xdsoft", i) }) }), u = 0, J.on("xchange.xdsoft", function (t) { clearTimeout(u), u = setTimeout(function () { if (void 0 === j.currentTime || null === j.currentTime) { if (C.allowBlank) return; j.currentTime = j.now() } for (var t, i, s, d, u, l, f, c, m, h, g = "", p = new Date(j.currentTime.getFullYear(), j.currentTime.getMonth(), 1, 12, 0, 0), y = 0, v = j.now(), b = !1, D = !1, k = [], x = !0, T = "", S = ""; p.getDay() !== C.dayOfWeekStart;) p.setDate(p.getDate() - 1); for (g += "<table><thead><tr>", C.weeks && (g += "<th></th>"), t = 0; 7 > t; t += 1) g += "<th>" + C.i18n[o].dayOfWeekShort[(t + C.dayOfWeekStart) % 7] + "</th>"; for (g += "</tr></thead>", g += "<tbody>", C.maxDate !== !1 && (b = j.strToDate(C.maxDate), b = new Date(b.getFullYear(), b.getMonth(), b.getDate(), 23, 59, 59, 999)), C.minDate !== !1 && (D = j.strToDate(C.minDate), D = new Date(D.getFullYear(), D.getMonth(), D.getDate())) ; y < j.currentTime.countDaysInMonth() || p.getDay() !== C.dayOfWeekStart || j.currentTime.getMonth() === p.getMonth() ;) k = [], y += 1, s = p.getDay(), d = p.getDate(), u = p.getFullYear(), l = p.getMonth(), f = j.getWeekOfYear(p), h = "", k.push("xdsoft_date"), c = C.beforeShowDay && e.isFunction(C.beforeShowDay.call) ? C.beforeShowDay.call(J, p) : null, C.allowDateRe && "[object RegExp]" === Object.prototype.toString.call(C.allowDateRe) ? C.allowDateRe.test(r.formatDate(p, C.formatDate)) || k.push("xdsoft_disabled") : C.allowDates && C.allowDates.length > 0 ? -1 === C.allowDates.indexOf(r.formatDate(p, C.formatDate)) && k.push("xdsoft_disabled") : b !== !1 && p > b || D !== !1 && D > p || c && c[0] === !1 ? k.push("xdsoft_disabled") : -1 !== C.disabledDates.indexOf(r.formatDate(p, C.formatDate)) ? k.push("xdsoft_disabled") : -1 !== C.disabledWeekDays.indexOf(s) ? k.push("xdsoft_disabled") : a.is("[readonly]") && k.push("xdsoft_disabled"), c && "" !== c[1] && k.push(c[1]), j.currentTime.getMonth() !== l && k.push("xdsoft_other_month"), (C.defaultSelect || J.data("changed")) && r.formatDate(j.currentTime, C.formatDate) === r.formatDate(p, C.formatDate) && k.push("xdsoft_current"), r.formatDate(v, C.formatDate) === r.formatDate(p, C.formatDate) && k.push("xdsoft_today"), (0 === p.getDay() || 6 === p.getDay() || -1 !== C.weekends.indexOf(r.formatDate(p, C.formatDate))) && k.push("xdsoft_weekend"), void 0 !== C.highlightedDates[r.formatDate(p, C.formatDate)] && (i = C.highlightedDates[r.formatDate(p, C.formatDate)], k.push(void 0 === i.style ? "xdsoft_highlighted_default" : i.style), h = void 0 === i.desc ? "" : i.desc), C.beforeShowDay && e.isFunction(C.beforeShowDay) && k.push(C.beforeShowDay(p)), x && (g += "<tr>", x = !1, C.weeks && (g += "<th>" + f + "</th>")), g += '<td data-date="' + d + '" data-month="' + l + '" data-year="' + u + '" class="xdsoft_date xdsoft_day_of_week' + p.getDay() + " " + k.join(" ") + '" title="' + h + '"><div>' + d + "</div></td>", p.getDay() === C.dayOfWeekStartPrev && (g += "</tr>", x = !0), p.setDate(d + 1); if (g += "</tbody></table>", L.html(g), N.find(".xdsoft_label span").eq(0).text(C.i18n[o].months[j.currentTime.getMonth()]), N.find(".xdsoft_label span").eq(1).text(j.currentTime.getFullYear()), T = "", S = "", l = "", m = function (t, n) { var o, i, s = j.now(), d = C.allowTimes && e.isArray(C.allowTimes) && C.allowTimes.length; s.setHours(t), t = parseInt(s.getHours(), 10), s.setMinutes(n), n = parseInt(s.getMinutes(), 10), o = new Date(j.currentTime), o.setHours(t), o.setMinutes(n), k = [], C.minDateTime !== !1 && C.minDateTime > o || C.maxTime !== !1 && j.strtotime(C.maxTime).getTime() < s.getTime() || C.minTime !== !1 && j.strtotime(C.minTime).getTime() > s.getTime() ? k.push("xdsoft_disabled") : C.minDateTime !== !1 && C.minDateTime > o || C.disabledMinTime !== !1 && s.getTime() > j.strtotime(C.disabledMinTime).getTime() && C.disabledMaxTime !== !1 && s.getTime() < j.strtotime(C.disabledMaxTime).getTime() ? k.push("xdsoft_disabled") : a.is("[readonly]") && k.push("xdsoft_disabled"), i = new Date(j.currentTime), i.setHours(parseInt(j.currentTime.getHours(), 10)), d || i.setMinutes(Math[C.roundTime](j.currentTime.getMinutes() / C.step) * C.step), (C.initTime || C.defaultSelect || J.data("changed")) && i.getHours() === parseInt(t, 10) && (!d && C.step > 59 || i.getMinutes() === parseInt(n, 10)) && (C.defaultSelect || J.data("changed") ? k.push("xdsoft_current") : C.initTime && k.push("xdsoft_init_time")), parseInt(v.getHours(), 10) === parseInt(t, 10) && parseInt(v.getMinutes(), 10) === parseInt(n, 10) && k.push("xdsoft_today"), T += '<div class="xdsoft_time ' + k.join(" ") + '" data-hour="' + t + '" data-minute="' + n + '">' + r.formatDate(s, C.formatTime) + "</div>" }, C.allowTimes && e.isArray(C.allowTimes) && C.allowTimes.length) for (y = 0; y < C.allowTimes.length; y += 1) S = j.strtotime(C.allowTimes[y]).getHours(), l = j.strtotime(C.allowTimes[y]).getMinutes(), m(S, l); else for (y = 0, t = 0; y < (C.hours12 ? 12 : 24) ; y += 1) for (t = 0; 60 > t; t += C.step) S = (10 > y ? "0" : "") + y, l = (10 > t ? "0" : "") + t, m(S, l); for (B.html(T), n = "", y = 0, y = parseInt(C.yearStart, 10) + C.yearOffset; y <= parseInt(C.yearEnd, 10) + C.yearOffset; y += 1) n += '<div class="xdsoft_option ' + (j.currentTime.getFullYear() === y ? "xdsoft_current" : "") + '" data-value="' + y + '">' + y + "</div>"; for (U.children().eq(0).html(n), y = parseInt(C.monthStart, 10), n = ""; y <= parseInt(C.monthEnd, 10) ; y += 1) n += '<div class="xdsoft_option ' + (j.currentTime.getMonth() === y ? "xdsoft_current" : "") + '" data-value="' + y + '">' + C.i18n[o].months[y] + "</div>"; G.children().eq(0).html(n), e(J).trigger("generate.xdsoft") }, 10), t.stopPropagation() }).on("afterOpen.xdsoft", function () { if (C.timepicker) { var e, t, a, r; B.find(".xdsoft_current").length ? e = ".xdsoft_current" : B.find(".xdsoft_init_time").length && (e = ".xdsoft_init_time"), e ? (t = R[0].clientHeight, a = B[0].offsetHeight, r = B.find(e).index() * C.timeHeightInTimePicker + 1, r > a - t && (r = a - t), R.trigger("scroll_element.xdsoft_scroller", [parseInt(r, 10) / (a - t)])) : R.trigger("scroll_element.xdsoft_scroller", [0]) } }), P = 0, L.on("touchend click.xdsoft", "td", function (t) { t.stopPropagation(), P += 1; var r = e(this), n = j.currentTime; return (void 0 === n || null === n) && (j.currentTime = j.now(), n = j.currentTime), r.hasClass("xdsoft_disabled") ? !1 : (n.setDate(1), n.setFullYear(r.data("year")), n.setMonth(r.data("month")), n.setDate(r.data("date")), J.trigger("select.xdsoft", [n]), a.val(j.str()), C.onSelectDate && e.isFunction(C.onSelectDate) && C.onSelectDate.call(J, j.currentTime, J.data("input"), t), J.data("changed", !0), J.trigger("xchange.xdsoft"), J.trigger("changedatetime.xdsoft"), (P > 1 || C.closeOnDateSelect === !0 || C.closeOnDateSelect === !1 && !C.timepicker) && !C.inline && J.trigger("close.xdsoft"), void setTimeout(function () { P = 0 }, 200)) }), B.on("touchend click.xdsoft", "div", function (t) { t.stopPropagation(); var a = e(this), r = j.currentTime; return (void 0 === r || null === r) && (j.currentTime = j.now(), r = j.currentTime), a.hasClass("xdsoft_disabled") ? !1 : (r.setHours(a.data("hour")), r.setMinutes(a.data("minute")), J.trigger("select.xdsoft", [r]), J.data("input").val(j.str()), C.onSelectTime && e.isFunction(C.onSelectTime) && C.onSelectTime.call(J, j.currentTime, J.data("input"), t), J.data("changed", !0), J.trigger("xchange.xdsoft"), J.trigger("changedatetime.xdsoft"), void (C.inline !== !0 && C.closeOnTimeSelect === !0 && J.trigger("close.xdsoft"))) }), I.on("mousewheel.xdsoft", function (e) { return C.scrollMonth ? (e.deltaY < 0 ? j.nextMonth() : j.prevMonth(), !1) : !0 }), a.on("mousewheel.xdsoft", function (e) { return C.scrollInput ? !C.datepicker && C.timepicker ? (A = B.find(".xdsoft_current").length ? B.find(".xdsoft_current").eq(0).index() : 0, A + e.deltaY >= 0 && A + e.deltaY < B.children().length && (A += e.deltaY), B.children().eq(A).length && B.children().eq(A).trigger("mousedown"), !1) : C.datepicker && !C.timepicker ? (I.trigger(e, [e.deltaY, e.deltaX, e.deltaY]), a.val && a.val(j.str()), J.trigger("changedatetime.xdsoft"), !1) : void 0 : !0 }), J.on("changedatetime.xdsoft", function (t) { if (C.onChangeDateTime && e.isFunction(C.onChangeDateTime)) { var a = J.data("input"); C.onChangeDateTime.call(J, j.currentTime, a, t), delete C.value, a.trigger("change") } }).on("generate.xdsoft", function () { C.onGenerate && e.isFunction(C.onGenerate) && C.onGenerate.call(J, j.currentTime, J.data("input")), q && (J.trigger("afterOpen.xdsoft"), q = !1) }).on("click.xdsoft", function (e) { e.stopPropagation() }), A = 0, H = function (e, t) { do if (e = e.parentNode, t(e) === !1) break; while ("HTML" !== e.nodeName) }, Y = function () { var t, a, r, n, o, i, s, d, u, l, f, c, m; if (d = J.data("input"), t = d.offset(), a = d[0], l = "top", r = t.top + a.offsetHeight - 1, n = t.left, o = "absolute", u = e(window).width(), c = e(window).height(), m = e(window).scrollTop(), document.documentElement.clientWidth - t.left < I.parent().outerWidth(!0)) { var h = I.parent().outerWidth(!0) - a.offsetWidth; n -= h } "rtl" === d.parent().css("direction") && (n -= J.outerWidth() - d.outerWidth()), C.fixed ? (r -= m, n -= e(window).scrollLeft(), o = "fixed") : (s = !1, H(a, function (e) { return "fixed" === window.getComputedStyle(e).getPropertyValue("position") ? (s = !0, !1) : void 0 }), s ? (o = "fixed", r + J.outerHeight() > c + m ? (l = "bottom", r = c + m - t.top) : r -= m) : r + a.offsetHeight > c + m && (r = t.top - a.offsetHeight + 1), 0 > r && (r = 0), n + a.offsetWidth > u && (n = u - a.offsetWidth)), i = J[0], H(i, function (e) { var t; return t = window.getComputedStyle(e).getPropertyValue("position"), "relative" === t && u >= e.offsetWidth ? (n -= (u - e.offsetWidth) / 2, !1) : void 0 }), f = { position: o, left: n, top: "", bottom: "" }, f[l] = r, J.css(f) }, J.on("open.xdsoft", function (t) { var a = !0; C.onShow && e.isFunction(C.onShow) && (a = C.onShow.call(J, j.currentTime, J.data("input"), t)), a !== !1 && (J.show(), Y(), e(window).off("resize.xdsoft", Y).on("resize.xdsoft", Y), C.closeOnWithoutClick && e([document.body, window]).on("touchstart mousedown.xdsoft", function r() { J.trigger("close.xdsoft"), e([document.body, window]).off("touchstart mousedown.xdsoft", r) })) }).on("close.xdsoft", function (t) { var a = !0; N.find(".xdsoft_month,.xdsoft_year").find(".xdsoft_select").hide(), C.onClose && e.isFunction(C.onClose) && (a = C.onClose.call(J, j.currentTime, J.data("input"), t)), a === !1 || C.opened || C.inline || J.hide(), t.stopPropagation() }).on("toggle.xdsoft", function () { J.trigger(J.is(":visible") ? "close.xdsoft" : "open.xdsoft") }).data("input", a), X = 0, J.data("xdsoft_datetime", j), J.setOptions(C), j.setCurrentTime(i()), a.data("xdsoft_datetimepicker", J).on("open.xdsoft focusin.xdsoft mousedown.xdsoft touchstart", function () { a.is(":disabled") || a.data("xdsoft_datetimepicker").is(":visible") && C.closeOnInputClick || (clearTimeout(X), X = setTimeout(function () { a.is(":disabled") || (q = !0, j.setCurrentTime(i(), !0), C.mask && s(C), J.trigger("open.xdsoft")) }, 100)) }).on("keydown.xdsoft", function (t) { var a, r = t.which; return -1 !== [p].indexOf(r) && C.enterLikeTab ? (a = e("input:visible,textarea:visible,button:visible,a:visible"), J.trigger("close.xdsoft"), a.eq(a.index(this) + 1).focus(), !1) : -1 !== [T].indexOf(r) ? (J.trigger("close.xdsoft"), !0) : void 0 }).on("blur.xdsoft", function () { J.trigger("close.xdsoft") })
        }, d = function (t) { var a = t.data("xdsoft_datetimepicker"); a && (a.data("xdsoft_datetime", null), a.remove(), t.data("xdsoft_datetimepicker", null).off(".xdsoft"), e(window).off("resize.xdsoft"), e([window, document.body]).off("mousedown.xdsoft touchstart"), t.unmousewheel && t.unmousewheel()) }, e(document).off("keydown.xdsoftctrl keyup.xdsoftctrl").on("keydown.xdsoftctrl", function (e) { e.keyCode === h && (F = !0) }).on("keyup.xdsoftctrl", function (e) { e.keyCode === h && (F = !1) }), this.each(function () { var t, a = e(this).data("xdsoft_datetimepicker"); if (a) { if ("string" === e.type(n)) switch (n) { case "show": e(this).select().focus(), a.trigger("open.xdsoft"); break; case "hide": a.trigger("close.xdsoft"); break; case "toggle": a.trigger("toggle.xdsoft"); break; case "destroy": d(e(this)); break; case "reset": this.value = this.defaultValue, this.value && a.data("xdsoft_datetime").isValidDate(r.parseDate(this.value, C.format)) || a.data("changed", !1), a.data("xdsoft_datetime").setCurrentTime(this.value); break; case "validate": t = a.data("input"), t.trigger("blur.xdsoft"); break; default: a[n] && e.isFunction(a[n]) && (u = a[n](i)) } else a.setOptions(n); return 0 } "string" !== e.type(n) && (!C.lazyInit || C.open || C.inline ? s(e(this)) : A(e(this))) }), u
    }, e.fn.datetimepicker.defaults = a
}), function (e) { "function" == typeof define && define.amd ? define(["jquery"], e) : "object" == typeof exports ? module.exports = e : e(jQuery) }(function (e) { function t(t) { var i = t || window.event, s = d.call(arguments, 1), u = 0, f = 0, c = 0, m = 0, h = 0, g = 0; if (t = e.event.fix(i), t.type = "mousewheel", "detail" in i && (c = -1 * i.detail), "wheelDelta" in i && (c = i.wheelDelta), "wheelDeltaY" in i && (c = i.wheelDeltaY), "wheelDeltaX" in i && (f = -1 * i.wheelDeltaX), "axis" in i && i.axis === i.HORIZONTAL_AXIS && (f = -1 * c, c = 0), u = 0 === c ? f : c, "deltaY" in i && (c = -1 * i.deltaY, u = c), "deltaX" in i && (f = i.deltaX, 0 === c && (u = -1 * f)), 0 !== c || 0 !== f) { if (1 === i.deltaMode) { var p = e.data(this, "mousewheel-line-height"); u *= p, c *= p, f *= p } else if (2 === i.deltaMode) { var y = e.data(this, "mousewheel-page-height"); u *= y, c *= y, f *= y } if (m = Math.max(Math.abs(c), Math.abs(f)), (!o || o > m) && (o = m, r(i, m) && (o /= 40)), r(i, m) && (u /= 40, f /= 40, c /= 40), u = Math[u >= 1 ? "floor" : "ceil"](u / o), f = Math[f >= 1 ? "floor" : "ceil"](f / o), c = Math[c >= 1 ? "floor" : "ceil"](c / o), l.settings.normalizeOffset && this.getBoundingClientRect) { var v = this.getBoundingClientRect(); h = t.clientX - v.left, g = t.clientY - v.top } return t.deltaX = f, t.deltaY = c, t.deltaFactor = o, t.offsetX = h, t.offsetY = g, t.deltaMode = 0, s.unshift(t, u, f, c), n && clearTimeout(n), n = setTimeout(a, 200), (e.event.dispatch || e.event.handle).apply(this, s) } } function a() { o = null } function r(e, t) { return l.settings.adjustOldDeltas && "mousewheel" === e.type && t % 120 === 0 } var n, o, i = ["wheel", "mousewheel", "DOMMouseScroll", "MozMousePixelScroll"], s = "onwheel" in document || document.documentMode >= 9 ? ["wheel"] : ["mousewheel", "DomMouseScroll", "MozMousePixelScroll"], d = Array.prototype.slice; if (e.event.fixHooks) for (var u = i.length; u;) e.event.fixHooks[i[--u]] = e.event.mouseHooks; var l = e.event.special.mousewheel = { version: "3.1.12", setup: function () { if (this.addEventListener) for (var a = s.length; a;) this.addEventListener(s[--a], t, !1); else this.onmousewheel = t; e.data(this, "mousewheel-line-height", l.getLineHeight(this)), e.data(this, "mousewheel-page-height", l.getPageHeight(this)) }, teardown: function () { if (this.removeEventListener) for (var a = s.length; a;) this.removeEventListener(s[--a], t, !1); else this.onmousewheel = null; e.removeData(this, "mousewheel-line-height"), e.removeData(this, "mousewheel-page-height") }, getLineHeight: function (t) { var a = e(t), r = a["offsetParent" in e.fn ? "offsetParent" : "parent"](); return r.length || (r = e("body")), parseInt(r.css("fontSize"), 10) || parseInt(a.css("fontSize"), 10) || 16 }, getPageHeight: function (t) { return e(t).height() }, settings: { adjustOldDeltas: !0, normalizeOffset: !0 } }; e.fn.extend({ mousewheel: function (e) { return e ? this.bind("mousewheel", e) : this.trigger("mousewheel") }, unmousewheel: function (e) { return this.unbind("mousewheel", e) } }) });

//added code
document.addEventListener('scroll', function (e) {
    $('.xdsoft_datetimepicker').css("display", "none");
    $('.month-picker').css("display", "none");
}, true);
var vmi =null;


function delid() {
    return vmi;
}

!function (t, e) {
    "object" == typeof exports && "object" == typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define([],
        e) : "object" == typeof exports ? exports.VueSelect = e() : t.VueSelect = e()
}

(this, function () {
    return function (t) {
        function e(r) {
            if (n[r]) return n[r].exports; var o = n[r] = { exports: {}, id: r, loaded: !1 };
            return t[r].call(o.exports, o, o.exports, e), o.loaded = !0, o.exports
        }
        var n = {}; return e.m = t, e.c = n, e.p = "/", e(0)
    }
    ([function (t, e, n) {
        "use strict";
        function r(t) { return t && t.__esModule ? t : { default: t } } Object.defineProperty(e, "__esModule", { value: !0 }),
        e.mixins = e.VueSelect = void 0; var o = n(84), i = r(o), u = n(42), s = r(u); e.default = i.default,
        e.VueSelect = i.default, e.mixins = s.default
    },
    function (t, e) {
        var n = t.exports = "undefined" != typeof window && window.Math == Math ? window : "undefined" != typeof self && self.Math == Math ? self : Function("return this")(); "number" == typeof __g && (__g = n)
    },
    function (t, e, n) {
        t.exports = !n(9)(function () {
            return 7 != Object.defineProperty({},
                "a", { get: function () { return 7 } }).a
        })
    },
    function (t, e) { var n = {}.hasOwnProperty; t.exports = function (t, e) { return n.call(t, e) } },
    function (t, e, n) {
        var r = n(11), o = n(33), i = n(25), u = Object.defineProperty;
        e.f = n(2) ? Object.defineProperty : function (t, e, n) {
            if (r(t), e = i(e, !0), r(n), o)
                try {
                    return u(t, e, n)
                } catch (t) { } if ("get" in n || "set" in n) throw TypeError("Accessors not supported!");
            return "value" in n && (t[e] = n.value), t
        }
    },
    function (t, e, n) {
        var r = n(59), o = n(16); t.exports = function (t) { return r(o(t)) }
    },
    function (t, e) { var n = t.exports = { version: "2.4.0" }; "number" == typeof __e && (__e = n) },
    function (t, e, n) {
        var r = n(4),
            o = n(14); t.exports = n(2) ? function (t, e, n) { return r.f(t, e, o(1, n)) } : function (t, e, n) { return t[e] = n, t }
    },
    function (t, e, n) {
        var r = n(23)("wks"), o = n(15), i = n(1).Symbol, u = "function" == typeof i, s = t.exports = function (t) { return r[t] || (r[t] = u && i[t] || (u ? i : o)("Symbol." + t)) }; s.store = r
    },
    function (t, e) {
        t.exports = function (t) { try { return !!t() } catch (t) { return !0 } }
    },
    function (t, e, n) {
        var r = n(38), o = n(17); t.exports = Object.keys || function (t) { return r(t, o) }
    },
    function (t, e, n) {
        var r = n(13); t.exports = function (t) { if (!r(t)) throw TypeError(t + " is not an object!"); return t }
    },
    function (t, e, n) {
        var r = n(1), o = n(6), i = n(56), u = n(7), s = "prototype", a = function (t, e, n) { var c, l, f, p = t & a.F, d = t & a.G, h = t & a.S, v = t & a.P, b = t & a.B, y = t & a.W, m = d ? o : o[e] || (o[e] = {}), g = m[s], x = d ? r : h ? r[e] : (r[e] || {})[s]; d && (n = e); for (c in n) l = !p && x && void 0 !== x[c], l && c in m || (f = l ? x[c] : n[c], m[c] = d && "function" != typeof x[c] ? n[c] : b && l ? i(f, r) : y && x[c] == f ? function (t) { var e = function (e, n, r) { if (this instanceof t) { switch (arguments.length) { case 0: return new t; case 1: return new t(e); case 2: return new t(e, n) } return new t(e, n, r) } return t.apply(this, arguments) }; return e[s] = t[s], e }(f) : v && "function" == typeof f ? i(Function.call, f) : f, v && ((m.virtual || (m.virtual = {}))[c] = f, t & a.R && g && !g[c] && u(g, c, f))) }; a.F = 1, a.G = 2, a.S = 4, a.P = 8, a.B = 16, a.W = 32, a.U = 64, a.R = 128, t.exports = a
    },
    function (t, e) { t.exports = function (t) { return "object" == typeof t ? null !== t : "function" == typeof t } }, function (t, e) { t.exports = function (t, e) { return { enumerable: !(1 & t), configurable: !(2 & t), writable: !(4 & t), value: e } } }, function (t, e) { var n = 0, r = Math.random(); t.exports = function (t) { return "Symbol(".concat(void 0 === t ? "" : t, ")_", (++n + r).toString(36)) } }, function (t, e) { t.exports = function (t) { if (void 0 == t) throw TypeError("Can't call method on  " + t); return t } }, function (t, e) { t.exports = "constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",") }, function (t, e) { t.exports = {} }, function (t, e) { t.exports = !0 }, function (t, e) { e.f = {}.propertyIsEnumerable }, function (t, e, n) { var r = n(4).f, o = n(3), i = n(8)("toStringTag"); t.exports = function (t, e, n) { t && !o(t = n ? t : t.prototype, i) && r(t, i, { configurable: !0, value: e }) } }, function (t, e, n) { var r = n(23)("keys"), o = n(15); t.exports = function (t) { return r[t] || (r[t] = o(t)) } }, function (t, e, n) { var r = n(1), o = "__core-js_shared__", i = r[o] || (r[o] = {}); t.exports = function (t) { return i[t] || (i[t] = {}) } }, function (t, e) { var n = Math.ceil, r = Math.floor; t.exports = function (t) { return isNaN(t = +t) ? 0 : (t > 0 ? r : n)(t) } }, function (t, e, n) { var r = n(13); t.exports = function (t, e) { if (!r(t)) return t; var n, o; if (e && "function" == typeof (n = t.toString) && !r(o = n.call(t))) return o; if ("function" == typeof (n = t.valueOf) && !r(o = n.call(t))) return o; if (!e && "function" == typeof (n = t.toString) && !r(o = n.call(t))) return o; throw TypeError("Can't convert object to primitive value") } }, function (t, e, n) { var r = n(1), o = n(6), i = n(19), u = n(27), s = n(4).f; t.exports = function (t) { var e = o.Symbol || (o.Symbol = i ? {} : r.Symbol || {}); "_" == t.charAt(0) || t in e || s(e, t, { value: u.f(t) }) } }, function (t, e, n) { e.f = n(8) }, function (t, e) {
        "use strict"; t.exports = {
            props: { loading: { type: Boolean, default: !1 }, onSearch: { type: Function, default: function (t, e) { } }, debounce: { type: Number, default: 0 } }, watch: { search: function () { this.search.length > 0 && this.onSearch && this.onSearch(this.search, this.toggleLoading) } }, methods: {
                toggleLoading: function () {
                    var t = arguments.length <= 0 || void 0 === arguments[0] ? null : arguments[0];
                    return null == t ? this.showLoading = !this.showLoading : this.showLoading = t
                }
            }
        }
    }, function (t, e) { "use strict"; t.exports = { watch: { typeAheadPointer: function () { this.maybeAdjustScroll() } }, methods: { maybeAdjustScroll: function () { var t = this.pixelsToPointerTop(), e = this.pixelsToPointerBottom(); return t <= this.viewport().top ? this.scrollTo(t) : e >= this.viewport().bottom ? this.scrollTo(this.viewport().top + this.pointerHeight()) : void 0 }, pixelsToPointerTop: function t() { var t = 0; if (this.$refs.dropdownMenu) for (var e = 0; e < this.typeAheadPointer; e++) t += this.$refs.dropdownMenu.children[e].offsetHeight; return t }, pixelsToPointerBottom: function () { return this.pixelsToPointerTop() + this.pointerHeight() }, pointerHeight: function () { var t = !!this.$refs.dropdownMenu && this.$refs.dropdownMenu.children[this.typeAheadPointer]; return t ? t.offsetHeight : 0 }, viewport: function () { return { top: this.$refs.dropdownMenu ? this.$refs.dropdownMenu.scrollTop : 0, bottom: this.$refs.dropdownMenu ? this.$refs.dropdownMenu.offsetHeight + this.$refs.dropdownMenu.scrollTop : 0 } }, scrollTo: function (t) { return this.$refs.dropdownMenu ? this.$refs.dropdownMenu.scrollTop = t : null } } } }, function (t, e) { "use strict"; t.exports = { data: function () { return { typeAheadPointer: -1 } }, watch: { filteredOptions: function () { this.typeAheadPointer = 0 } }, methods: { typeAheadUp: function () { this.typeAheadPointer > 0 && (this.typeAheadPointer--, this.maybeAdjustScroll && this.maybeAdjustScroll()) }, typeAheadDown: function () { this.typeAheadPointer < this.filteredOptions.length - 1 && (this.typeAheadPointer++, this.maybeAdjustScroll && this.maybeAdjustScroll()) }, typeAheadSelect: function () { this.filteredOptions[this.typeAheadPointer] ? this.select(this.filteredOptions[this.typeAheadPointer]) : this.taggable && this.search.length && this.select(this.search), this.clearSearchOnSelect && (this.search = "") } } } }, function (t, e) { var n = {}.toString; t.exports = function (t) { return n.call(t).slice(8, -1) } }, function (t, e, n) {
        var r = n(13), o = n(1).document, i = r(o) && r(o.createElement);
        t.exports = function (t) { return i ? o.createElement(t) : {} }
    }, function (t, e, n) { t.exports = !n(2) && !n(9)(function () { return 7 != Object.defineProperty(n(32)("div"), "a", { get: function () { return 7 } }).a }) }, function (t, e, n) {
        "use strict"; var r = n(19), o = n(12), i = n(39), u = n(7), s = n(3), a = n(18), c = n(61), l = n(21), f = n(68), p = n(8)("iterator"), d = !([].keys && "next" in [].keys()), h = "@@iterator", v = "keys", b = "values", y = function () { return this }; t.exports = function (t, e, n, m, g, x, w) {
            c(n, e, m); var O, S, _, j = function (t) { if (!d && t in M) return M[t]; switch (t) { case v: return function () { return new n(this, t) }; case b: return function () { return new n(this, t) } } return function () { return new n(this, t) } }, P = e + " Iterator", A = g == b, C = !1, M = t.prototype, k = M[p] || M[h] || g && M[g], E = k || j(g), T = g ? A ? j("entries") : E : void 0, V = "Array" == e ? M.entries || k : k; if (V && (_ = f(V.call(new t)), _ !== Object.prototype && (l(_, P, !0), r || s(_, p) || u(_, p, y))), A && k && k.name !== b && (C = !0, E = function () { return k.call(this) }), r && !w || !d && !C && M[p] || u(M, p, E), a[e] = E, a[P] = y, g)
                if (O = { values: A ? E : j(b), keys: x ? E : j(v), entries: T }, w) for (S in O) S in M || i(M, S, O[S]); else o(o.P + o.F * (d || C), e, O); return O
        }
    }, function (t, e, n) { var r = n(11), o = n(65), i = n(17), u = n(22)("IE_PROTO"), s = function () { }, a = "prototype", c = function () { var t, e = n(32)("iframe"), r = i.length, o = ">"; for (e.style.display = "none", n(58).appendChild(e), e.src = "javascript:", t = e.contentWindow.document, t.open(), t.write("<script>document.F=Object</script" + o), t.close(), c = t.F; r--;) delete c[a][i[r]]; return c() }; t.exports = Object.create || function (t, e) { var n; return null !== t ? (s[a] = r(t), n = new s, s[a] = null, n[u] = t) : n = c(), void 0 === e ? n : o(n, e) } }, function (t, e, n) { var r = n(38), o = n(17).concat("length", "prototype"); e.f = Object.getOwnPropertyNames || function (t) { return r(t, o) } }, function (t, e) { e.f = Object.getOwnPropertySymbols }, function (t, e, n) { var r = n(3), o = n(5), i = n(55)(!1), u = n(22)("IE_PROTO"); t.exports = function (t, e) { var n, s = o(t), a = 0, c = []; for (n in s) n != u && r(s, n) && c.push(n); for (; e.length > a;) r(s, n = e[a++]) && (~i(c, n) || c.push(n)); return c } }, function (t, e, n) { t.exports = n(7) }, function (t, e, n) { var r = n(16); t.exports = function (t) { return Object(r(t)) } }, function (t, e, n) {
        "use strict"; function r(t) { return t && t.__esModule ? t : { default: t } } Object.defineProperty(e, "__esModule", { value: !0 }); var o = n(44), i = r(o), u = n(47), s = r(u), a = n(48), c = r(a), l = n(29), f = r(l), p = n(30), d = r(p), h = n(28), v = r(h); e.default = {
            mixins: [f.default, d.default, v.default], props: {
                value: { default: null },
                options: { type: Array, default: function () { return [] } },
                maxHeight: { type: String, default: "400px" },
                searchable: { type: Boolean, default: !0 },
                multiple: { type: Boolean, default: !1 },
                placeholder: { type: String, default: "" },
                transition: { type: String, default: "expand" },
                clearSearchOnSelect: { type: Boolean, default: !0 },
                label: { type: String, default: "label" },
                getOptionLabel: {
                    type: Function, default: function (t) {
                        return "object" === ("undefined" == typeof t ? "undefined" : (0,
                            c.default)(t)) && this.label && t[this.label] ? t[this.label] : t
                    }
                },
                onChange: {
                    type: Function,
                    default: function (t) { this.$emit("input", t) }
                },
                taggable: { type: Boolean, default: !1 }, pushTags: { type: Boolean, default: !1 }, createOption: { type: Function, default: function (t) { return "object" === (0, c.default)(this.mutableOptions[0]) && (t = (0, s.default)({}, this.label, t)), this.$emit("option:created", t), t } }, resetOnOptionsChange: { type: Boolean, default: !1 }, noDrop: { type: Boolean, default: !1 }
            }, data: function () { return { search: "", open: !1, mutableValue: null, mutableOptions: [], mutableLoading: !1 } }, watch: { value: function (t) { this.mutableValue = t }, mutableValue: function (t, e) { this.multiple ? this.onChange ? this.onChange(t) : null : this.onChange && t !== e ? this.onChange(t) : null }, options: function (t) { this.mutableOptions = t }, mutableOptions: function () { !this.taggable && this.resetOnOptionsChange && (this.mutableValue = this.multiple ? [] : null) }, multiple: function (t) { this.mutableValue = t ? [] : null } }, created: function () { this.mutableValue = this.value, this.mutableOptions = this.options.slice(0), this.mutableLoading = this.loading, this.$on("option:created", this.maybePushTag) }, methods: {
                select: function (t) {
                    this.isOptionSelected(t) ? this.deselect(t) : (this.taggable && !this.optionExists(t) && (t = this.createOption(t)),
                    this.multiple && !this.mutableValue ? this.mutableValue = [t] : this.multiple ? this.mutableValue.push(t) : this.mutableValue = t),
                    this.onAfterSelect(t)
                }, deselect: function (t) {
                    var e = this; if (this.multiple) {
                        var n = -1; this.mutableValue.forEach(function (r) { (r === t || "object" === ("undefined" == typeof r ? "undefined" : (0, c.default)(r)) && r[e.label] === t[e.label]) && (n = r) }); var r = this.mutableValue.indexOf(n);

                        console.log(this.mutableValue[r]);//editss
                        vmi = r;
                        //this.mutableValue.splice(r, 1)
                    } else this.mutableValue = null
                }, onAfterSelect: function (t) {
                    this.multiple
                        || (this.open = !this.open, this.$refs.search.blur()), this.clearSearchOnSelect && (this.search = "")
                },
                toggleDropdown: function (t) {
                    t.target !== this.$refs.openIndicator
                    && t.target !== this.$refs.search
                    && t.target !== this.$refs.toggle
                    && t.target !== this.$el
                    || (this.open ? this.$refs.search.blur() : (this.open = !0, this.$refs.search.focus()))
                },
                isOptionSelected: function (t) { var e = this; if (this.multiple && this.mutableValue) { var n = !1; return this.mutableValue.forEach(function (r) { "object" === ("undefined" == typeof r ? "undefined" : (0, c.default)(r)) && r[e.label] === t[e.label] ? n = !0 : "object" === ("undefined" == typeof r ? "undefined" : (0, c.default)(r)) && r[e.label] === t ? n = !0 : r === t && (n = !0) }), n } return this.mutableValue === t }, onEscape: function () { this.search.length ? this.search = "" : this.$refs.search.blur() }, onSearchBlur: function () { this.open = !1, this.$emit("search:blur") }, onSearchFocus: function () { this.open = !0, this.$emit("search:focus") }, maybeDeleteValue:
                    function () {
                        if (!this.$refs.search.value.length && this.mutableValue)
                            return this.multiple ? this.mutableValue : this.mutableValue = null//edit this.mutableValue.pop()
                    }, optionExists: function (t) { var e = this, n = !1; return this.mutableOptions.forEach(function (r) { "object" === ("undefined" == typeof r ? "undefined" : (0, c.default)(r)) && r[e.label] === t ? n = !0 : r === t && (n = !0) }), n }, maybePushTag: function (t) { this.pushTags && this.mutableOptions.push(t) }
            },
            computed: {
                dropdownClasses: function () {
                    return {
                        open: this.dropdownOpen,
                        searchable: this.searchable,
                        loading: this.mutableLoading
                    }
                },
                dropdownOpen: function () {
                    return !this.noDrop && false//edited this.open
                },
                searchPlaceholder: function () {
                    if (this.isValueEmpty && this.placeholder)
                        return this.placeholder
                },
                filteredOptions: function () {
                    var t = this, e = this.mutableOptions.filter(function (e) {
                        return "object" === ("undefined" == typeof e ? "undefined" : (0, c.default)(e)) ? e[t.label].toLowerCase().indexOf(t.search.toLowerCase()) > -1 : e.toLowerCase().indexOf(t.search.toLowerCase()) > -1
                    });
                    return this.taggable && this.search.length && !this.optionExists(this.search) && e.unshift(this.search), e
                },
                isValueEmpty: function () { return !this.mutableValue || ("object" === (0, c.default)(this.mutableValue) ? !(0, i.default)(this.mutableValue).length : !this.mutableValue.length) }, valueAsArray: function () { return this.multiple ? this.mutableValue : this.mutableValue ? [this.mutableValue] : [] }
            }
        }
    }, function (t, e, n) { "use strict"; function r(t) { return t && t.__esModule ? t : { default: t } } Object.defineProperty(e, "__esModule", { value: !0 }); var o = n(28), i = r(o), u = n(30), s = r(u), a = n(29), c = r(a); e.default = { ajax: i.default, pointer: s.default, pointerScroll: c.default } }, function (t, e, n) { t.exports = { default: n(49), __esModule: !0 } }, function (t, e, n) { t.exports = { default: n(50), __esModule: !0 } }, function (t, e, n) { t.exports = { default: n(51), __esModule: !0 } }, function (t, e, n) { t.exports = { default: n(52), __esModule: !0 } }, function (t, e, n) { "use strict"; function r(t) { return t && t.__esModule ? t : { default: t } } e.__esModule = !0; var o = n(43), i = r(o); e.default = function (t, e, n) { return e in t ? (0, i.default)(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t } }, function (t, e, n) {
        "use strict"; function r(t) { return t && t.__esModule ? t : { default: t } } e.__esModule = !0; var o = n(46), i = r(o), u = n(45), s = r(u), a = "function" == typeof s.default && "symbol" == typeof i.default ? function (t) { return typeof t } : function (t) { return t && "function" == typeof s.default && t.constructor === s.default ? "symbol" : typeof t };
        e.default = "function" == typeof s.default && "symbol" === a(i.default) ? function (t) { return "undefined" == typeof t ? "undefined" : a(t) } : function (t) { return t && "function" == typeof s.default && t.constructor === s.default ? "symbol" : "undefined" == typeof t ? "undefined" : a(t) }
    }, function (t, e, n) { n(74); var r = n(6).Object; t.exports = function (t, e, n) { return r.defineProperty(t, e, n) } },
    function (t, e, n) { n(75), t.exports = n(6).Object.keys }, function (t, e, n) { n(78), n(76), n(79), n(80), t.exports = n(6).Symbol }, function (t, e, n) { n(77), n(81), t.exports = n(27).f("iterator") }, function (t, e) { t.exports = function (t) { if ("function" != typeof t) throw TypeError(t + " is not a function!"); return t } }, function (t, e) { t.exports = function () { } },
    function (t, e, n) { var r = n(5), o = n(72), i = n(71); t.exports = function (t) { return function (e, n, u) { var s, a = r(e), c = o(a.length), l = i(u, c); if (t && n != n) { for (; c > l;) if (s = a[l++], s != s) return !0 } else for (; c > l; l++) if ((t || l in a) && a[l] === n) return t || l || 0; return !t && -1 } } },
    function (t, e, n) { var r = n(53); t.exports = function (t, e, n) { if (r(t), void 0 === e) return t; switch (n) { case 1: return function (n) { return t.call(e, n) }; case 2: return function (n, r) { return t.call(e, n, r) }; case 3: return function (n, r, o) { return t.call(e, n, r, o) } } return function () { return t.apply(e, arguments) } } }, function (t, e, n) { var r = n(10), o = n(37), i = n(20); t.exports = function (t) { var e = r(t), n = o.f; if (n) for (var u, s = n(t), a = i.f, c = 0; s.length > c;) a.call(t, u = s[c++]) && e.push(u); return e } }, function (t, e, n) { t.exports = n(1).document && document.documentElement },
    function (t, e, n) { var r = n(31); t.exports = Object("z").propertyIsEnumerable(0) ? Object : function (t) { return "String" == r(t) ? t.split("") : Object(t) } }, function (t, e, n) { var r = n(31); t.exports = Array.isArray || function (t) { return "Array" == r(t) } }, function (t, e, n) { "use strict"; var r = n(35), o = n(14), i = n(21), u = {}; n(7)(u, n(8)("iterator"), function () { return this }), t.exports = function (t, e, n) { t.prototype = r(u, { next: o(1, n) }), i(t, e + " Iterator") } }, function (t, e) { t.exports = function (t, e) { return { value: e, done: !!t } } }, function (t, e, n) { var r = n(10), o = n(5); t.exports = function (t, e) { for (var n, i = o(t), u = r(i), s = u.length, a = 0; s > a;) if (i[n = u[a++]] === e) return n } }, function (t, e, n) { var r = n(15)("meta"), o = n(13), i = n(3), u = n(4).f, s = 0, a = Object.isExtensible || function () { return !0 }, c = !n(9)(function () { return a(Object.preventExtensions({})) }), l = function (t) { u(t, r, { value: { i: "O" + ++s, w: {} } }) }, f = function (t, e) { if (!o(t)) return "symbol" == typeof t ? t : ("string" == typeof t ? "S" : "P") + t; if (!i(t, r)) { if (!a(t)) return "F"; if (!e) return "E"; l(t) } return t[r].i }, p = function (t, e) { if (!i(t, r)) { if (!a(t)) return !0; if (!e) return !1; l(t) } return t[r].w }, d = function (t) { return c && h.NEED && a(t) && !i(t, r) && l(t), t }, h = t.exports = { KEY: r, NEED: !1, fastKey: f, getWeak: p, onFreeze: d } }, function (t, e, n) { var r = n(4), o = n(11), i = n(10); t.exports = n(2) ? Object.defineProperties : function (t, e) { o(t); for (var n, u = i(e), s = u.length, a = 0; s > a;) r.f(t, n = u[a++], e[n]); return t } }, function (t, e, n) {
        var r = n(20), o = n(14), i = n(5), u = n(25), s = n(3), a = n(33), c = Object.getOwnPropertyDescriptor; e.f = n(2) ? c : function (t, e) {
            if (t = i(t), e = u(e, !0), a)
                try {
                    return c(t, e)
                }
                catch (t) { } if (s(t, e)) return o(!r.f.call(t, e), t[e])
        }
    }, function (t, e, n) { var r = n(5), o = n(36).f, i = {}.toString, u = "object" == typeof window && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [], s = function (t) { try { return o(t) } catch (t) { return u.slice() } }; t.exports.f = function (t) { return u && "[object Window]" == i.call(t) ? s(t) : o(r(t)) } }, function (t, e, n) { var r = n(3), o = n(40), i = n(22)("IE_PROTO"), u = Object.prototype; t.exports = Object.getPrototypeOf || function (t) { return t = o(t), r(t, i) ? t[i] : "function" == typeof t.constructor && t instanceof t.constructor ? t.constructor.prototype : t instanceof Object ? u : null } }, function (t, e, n) { var r = n(12), o = n(6), i = n(9); t.exports = function (t, e) { var n = (o.Object || {})[t] || Object[t], u = {}; u[t] = e(n), r(r.S + r.F * i(function () { n(1) }), "Object", u) } }, function (t, e, n) { var r = n(24), o = n(16); t.exports = function (t) { return function (e, n) { var i, u, s = String(o(e)), a = r(n), c = s.length; return a < 0 || a >= c ? t ? "" : void 0 : (i = s.charCodeAt(a), i < 55296 || i > 56319 || a + 1 === c || (u = s.charCodeAt(a + 1)) < 56320 || u > 57343 ? t ? s.charAt(a) : i : t ? s.slice(a, a + 2) : (i - 55296 << 10) + (u - 56320) + 65536) } } }, function (t, e, n) { var r = n(24), o = Math.max, i = Math.min; t.exports = function (t, e) { return t = r(t), t < 0 ? o(t + e, 0) : i(t, e) } },
    function (t, e, n) { var r = n(24), o = Math.min; t.exports = function (t) { return t > 0 ? o(r(t), 9007199254740991) : 0 } }, function (t, e, n) {
        "use strict"; var r = n(54), o = n(62), i = n(18), u = n(5); t.exports = n(34)(Array, "Array", function (t, e) { this._t = u(t), this._i = 0, this._k = e },
            function () { var t = this._t, e = this._k, n = this._i++; return !t || n >= t.length ? (this._t = void 0, o(1)) : "keys" == e ? o(0, n) : "values" == e ? o(0, t[n]) : o(0, [n, t[n]]) }, "values"), i.Arguments = i.Array, r("keys"), r("values"), r("entries")
    }, function (t, e, n) { var r = n(12); r(r.S + r.F * !n(2), "Object", { defineProperty: n(4).f }) }, function (t, e, n) { var r = n(40), o = n(10); n(69)("keys", function () { return function (t) { return o(r(t)) } }) }, function (t, e) { }, function (t, e, n) { "use strict"; var r = n(70)(!0); n(34)(String, "String", function (t) { this._t = String(t), this._i = 0 }, function () { var t, e = this._t, n = this._i; return n >= e.length ? { value: void 0, done: !0 } : (t = r(e, n), this._i += t.length, { value: t, done: !1 }) }) }, function (t, e, n) {
        "use strict"; var r = n(1), o = n(3), i = n(2), u = n(12), s = n(39), a = n(64).KEY, c = n(9), l = n(23), f = n(21), p = n(15), d = n(8), h = n(27), v = n(26), b = n(63), y = n(57), m = n(60), g = n(11), x = n(5), w = n(25), O = n(14), S = n(35), _ = n(67), j = n(66), P = n(4), A = n(10), C = j.f, M = P.f, k = _.f, E = r.Symbol, T = r.JSON, V = T && T.stringify, L = "prototype", $ = d("_hidden"), F = d("toPrimitive"), N = {}.propertyIsEnumerable, B = l("symbol-registry"), D = l("symbols"), I = l("op-symbols"), R = Object[L], z = "function" == typeof E, H = r.QObject, U = !H || !H[L] || !H[L].findChild, W = i && c(function () { return 7 != S(M({}, "a", { get: function () { return M(this, "a", { value: 7 }).a } })).a }) ? function (t, e, n) { var r = C(R, e); r && delete R[e], M(t, e, n), r && t !== R && M(R, e, r) } : M, J = function (t) { var e = D[t] = S(E[L]); return e._k = t, e }, G = z && "symbol" == typeof E.iterator ? function (t) { return "symbol" == typeof t } : function (t) { return t instanceof E }, K = function (t, e, n) { return t === R && K(I, e, n), g(t), e = w(e, !0), g(n), o(D, e) ? (n.enumerable ? (o(t, $) && t[$][e] && (t[$][e] = !1), n = S(n, { enumerable: O(0, !1) })) : (o(t, $) || M(t, $, O(1, {})), t[$][e] = !0), W(t, e, n)) : M(t, e, n) }, Y = function (t, e) { g(t); for (var n, r = y(e = x(e)), o = 0, i = r.length; i > o;) K(t, n = r[o++], e[n]); return t }, Q = function (t, e) { return void 0 === e ? S(t) : Y(S(t), e) }, Z = function (t) { var e = N.call(this, t = w(t, !0)); return !(this === R && o(D, t) && !o(I, t)) && (!(e || !o(this, t) || !o(D, t) || o(this, $) && this[$][t]) || e) }, q = function (t, e) { if (t = x(t), e = w(e, !0), t !== R || !o(D, e) || o(I, e)) { var n = C(t, e); return !n || !o(D, e) || o(t, $) && t[$][e] || (n.enumerable = !0), n } }, X = function (t) { for (var e, n = k(x(t)), r = [], i = 0; n.length > i;) o(D, e = n[i++]) || e == $ || e == a || r.push(e); return r }, tt = function (t) { for (var e, n = t === R, r = k(n ? I : x(t)), i = [], u = 0; r.length > u;) !o(D, e = r[u++]) || n && !o(R, e) || i.push(D[e]); return i }; z || (E = function () { if (this instanceof E) throw TypeError("Symbol is not a constructor!"); var t = p(arguments.length > 0 ? arguments[0] : void 0), e = function (n) { this === R && e.call(I, n), o(this, $) && o(this[$], t) && (this[$][t] = !1), W(this, t, O(1, n)) }; return i && U && W(R, t, { configurable: !0, set: e }), J(t) }, s(E[L], "toString", function () { return this._k }), j.f = q, P.f = K, n(36).f = _.f = X, n(20).f = Z, n(37).f = tt, i && !n(19) && s(R, "propertyIsEnumerable", Z, !0),
            h.f = function (t) { return J(d(t)) }), u(u.G + u.W + u.F * !z, { Symbol: E }); for (var et = "hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","), nt = 0; et.length > nt;) d(et[nt++]); for (var et = A(d.store), nt = 0; et.length > nt;) v(et[nt++]); u(u.S + u.F * !z, "Symbol", { for: function (t) { return o(B, t += "") ? B[t] : B[t] = E(t) }, keyFor: function (t) { if (G(t)) return b(B, t); throw TypeError(t + " is not a symbol!") }, useSetter: function () { U = !0 }, useSimple: function () { U = !1 } }), u(u.S + u.F * !z, "Object", { create: Q, defineProperty: K, defineProperties: Y, getOwnPropertyDescriptor: q, getOwnPropertyNames: X, getOwnPropertySymbols: tt }), T && u(u.S + u.F * (!z || c(function () { var t = E(); return "[null]" != V([t]) || "{}" != V({ a: t }) || "{}" != V(Object(t)) })), "JSON", { stringify: function (t) { if (void 0 !== t && !G(t)) { for (var e, n, r = [t], o = 1; arguments.length > o;) r.push(arguments[o++]); return e = r[1], "function" == typeof e && (n = e), !n && m(e) || (e = function (t, e) { if (n && (e = n.call(this, t, e)), !G(e)) return e }), r[1] = e, V.apply(T, r) } } }), E[L][F] || n(7)(E[L], F, E[L].valueOf), f(E, "Symbol"), f(Math, "Math", !0), f(r.JSON, "JSON", !0)
    }, function (t, e, n) { n(26)("asyncIterator") }, function (t, e, n) { n(26)("observable") }, function (t, e, n) { n(73); for (var r = n(1), o = n(7), i = n(18), u = n(8)("toStringTag"), s = ["NodeList", "DOMTokenList", "MediaList", "StyleSheetList", "CSSRuleList"], a = 0; a < 5; a++) { var c = s[a], l = r[c], f = l && l.prototype; f && !f[u] && o(f, u, c), i[c] = i.Array } }, function (t, e, n) {
        e = t.exports = n(83)(), e.push([t.id,
            '.v-select{position:relative}.v-select .open-indicator{position:absolute;bottom:6px;right:10px;display:inline-block;cursor:pointer;pointer-events:all;transition:all .15s cubic-bezier(1,-.115,.975,.855);transition-timing-function:cubic-bezier(1,-.115,.975,.855);opacity:1;transition:opacity .1s}.v-select.loading .open-indicator{opacity:0}.v-select .open-indicator:before{border-color:rgba(60,60,60,.5);border-style:solid;border-width:.25em .25em 0 0;content:"";display:inline-block;height:10px;width:10px;vertical-align:top;transform:rotate(133deg);transition:all .15s cubic-bezier(1,-.115,.975,.855);transition-timing-function:cubic-bezier(1,-.115,.975,.855)}.v-select.open .open-indicator{bottom:1px}.v-select.open .open-indicator:before{transform:rotate(315deg)}.v-select .dropdown-toggle{display:block;padding:0;background:none;border:1px solid rgba(60,60,60,.26);border-radius:0px;white-space:normal}.v-select.searchable .dropdown-toggle{cursor:text}.v-select.open .dropdown-toggle{border-bottom:none;border-bottom-left-radius:0;border-bottom-right-radius:0}.v-select>.dropdown-menu{margin:0;width:100%;overflow-y:scroll;border-top:none;border-top-left-radius:0;border-top-right-radius:0}.v-select .selected-tag{color:#333;background-color:#f0f0f0;border:1px solid #ccc;border-radius:4px;height:26px;margin:4px 1px 0 3px;padding:0 .25em;float:left;line-height:1.7em}.v-select .selected-tag .close{float:none;margin-right:0;font-size:20px}.v-select input[type=search],.v-select input[type=search]:focus{display:inline-block;border:none;outline:none;margin:0;padding:0 .5em;width:10em;max-width:100%;background:none;position:relative;box-shadow:none;float:left;clear:none}.v-select input[type=search]:disabled,.v-select li a{cursor:pointer}.v-select .active a{background:rgba(50,50,50,.1);color:#333}.v-select .active>a:hover,.v-select .highlight a,.v-select li:hover>a{background:#5897fb;color:#fff}.v-select .spinner{opacity:0;position:absolute;top:5px;right:10px;font-size:5px;text-indent:-9999em;overflow:hidden;border-top:.9em solid hsla(0,0%,39%,.1);border-right:.9em solid hsla(0,0%,39%,.1);border-bottom:.9em solid hsla(0,0%,39%,.1);border-left:.9em solid rgba(60,60,60,.45);transform:translateZ(0);animation:vSelectSpinner 1.1s infinite linear;transition:opacity .1s}.v-select.loading .spinner{opacity:1}.v-select .spinner,.v-select .spinner:after{border-radius:50%;width:5em;height:5em}@-webkit-keyframes vSelectSpinner{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}@keyframes vSelectSpinner{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}', ""])

    }, function (t, e) { t.exports = function () { var t = []; return t.toString = function () { for (var t = [], e = 0; e < this.length; e++) { var n = this[e]; n[2] ? t.push("@media " + n[2] + "{" + n[1] + "}") : t.push(n[1]) } return t.join("") }, t.i = function (e, n) { "string" == typeof e && (e = [[null, e, ""]]); for (var r = {}, o = 0; o < this.length; o++) { var i = this[o][0]; "number" == typeof i && (r[i] = !0) } for (o = 0; o < e.length; o++) { var u = e[o]; "number" == typeof u[0] && r[u[0]] || (n && !u[2] ? u[2] = n : n && (u[2] = "(" + u[2] + ") and (" + n + ")"), t.push(u)) } }, t } }, function (t, e, n) { n(88); var r = n(85)(n(41), n(86), null, null); t.exports = r.exports }, function (t, e) {
        t.exports = function (t, e, n, r) {
            var o, i = t = t || {}, u = typeof t.default; "object" !== u && "function" !== u || (o = t, i = t.default); var s = "function" == typeof i ? i.options : i; if (e && (s.render = e.render, s.staticRenderFns = e.staticRenderFns), n && (s._scopeId = n), r) {
                var a = s.computed || (s.computed = {});
                Object.keys(r).forEach(function (t) { var e = r[t]; a[t] = function () { return e } })
            } return { esModule: o, exports: i, options: s }
        }
    }, function (t, e) {
        t.exports = {
            render: function () {
                var t = this, e = t.$createElement, n = t._self._c || e;
                return n("div", {
                    staticClass: "dropdown v-select",
                    class: t.dropdownClasses
                },
                    [n("div", {
                        ref: "toggle", staticClass: "dropdown-toggle clearfix", attrs: { type: "button" },
                        on: { mousedown: function (e) { e.preventDefault(), t.toggleDropdown(e) } }
                    },
                        [t._l(t.valueAsArray, function (e) {
                            return n("span", { key: e.index, staticClass: "selected-tag" }, [t._v("\n          " + (t._s(t.getOptionLabel(e)) || "--")+ "\n          "),// costome code added to show"--" if empty
                            t.multiple ? n("button", {
                                staticClass: "close", attrs: { type: "button" },
                                on: { click: function (n) { t.deselect(e) } }
                            },
                                [n("span", { attrs: { "aria-hidden": "true" } }, [t._v("×")])]) : t._e()])
                    }),
                    t._v(" "), n("input", {
                        directives: [{ name: "model", rawName: "v-model", value: t.search, expression: "search" }], ref: "search", staticClass: "form-control", style: { width: t.isValueEmpty ? "100%" : "10px", padding: t.isValueEmpty ? "" : "1px" }, attrs: { debounce: t.debounce, type: "search", placeholder: t.searchPlaceholder, readonly: !t.searchable }, domProps: { value: t._s(t.search) }, on: {//edited
                            keydown: [function (e) { t._k(e.keyCode, "delete", [8, 46]) || t.maybeDeleteValue(e) },
                                function (e) { t._k(e.keyCode, "up", 38) || (e.preventDefault(), t.typeAheadUp(e)) }, function (e) { t._k(e.keyCode, "down", 40) || (e.preventDefault(), t.typeAheadDown(e)) }], keyup: [function (e) { t._k(e.keyCode, "esc", 27) || t.onEscape(e) }, function (e) { t._k(e.keyCode, "enter", 13) || (e.preventDefault(), t.typeAheadSelect(e)) }], blur: t.onSearchBlur, focus: t.onSearchFocus, input: function (e) { e.target.composing || (t.search = e.target.value) }
                        }
                    }), t._v(" "),
                    t.noDrop ? t._e() : n("i", { ref: "openIndicator", staticClass: "open-indicator", attrs: { role: "presentation" } }),
                    t._v(" "), t._t("spinner", [n("div", {
                        directives: [{ name: "show", rawName: "v-show", value: t.mutableLoading, expression: "mutableLoading" }],
                        staticClass: "spinner"
                    }, [t._v("Loading...")])])], 2), t._v(" "),
                    t.dropdownOpen ? n("ul", {
                        ref: "dropdownMenu",
                        staticClass: "dropdown-menu",
                        style: { "max-height": t.maxHeight },
                        attrs: { transition: t.transition }
                    },
                    [t._l(t.filteredOptions, function (e, r) {
                        return n("li", {
                            key: r, class: {
                                active: t.isOptionSelected(e),
                                highlight: r === t.typeAheadPointer
                            }, on: { mouseover: function (e) { t.typeAheadPointer = r } }
                        },
                        [n("a", { on: { mousedown: function (n) { n.preventDefault(), t.select(e) } } }, [t._v("\n          " + t._s(t.getOptionLabel(e)) + "\n        ")])])
                    }),
                    t._v(" "), n("transition", { attrs: { name: "fade" } }, [t.filteredOptions.length ? t._e() : n("li", { staticClass: "divider" })]), t._v(" "), n("transition", { attrs: { name: "fade" } }, [t.filteredOptions.length ? t._e() : n("li", { staticClass: "text-center" },
                        [t._t("no-options", [t._v("Sorry, no matching options.")])], 2)])], 2) : t._e()])
            }, staticRenderFns: []
        }
    },
    function (t, e, n) {
        function r(t, e) {
            for (var n = 0; n < t.length; n++) { var r = t[n], o = f[r.id]; if (o) { o.refs++; for (var i = 0; i < o.parts.length; i++) o.parts[i](r.parts[i]); for (; i < r.parts.length; i++) o.parts.push(a(r.parts[i], e)) } else { for (var u = [], i = 0; i < r.parts.length; i++) u.push(a(r.parts[i], e)); f[r.id] = { id: r.id, refs: 1, parts: u } } }
        }
        function o(t) {
            for (var e = [], n = {}, r = 0; r < t.length; r++) { var o = t[r], i = o[0], u = o[1], s = o[2], a = o[3], c = { css: u, media: s, sourceMap: a }; n[i] ? n[i].parts.push(c) : e.push(n[i] = { id: i, parts: [c] }) } return e
        }
        function i(t, e) {
            var n = h(), r = y[y.length - 1]; if ("top" === t.insertAt) r ? r.nextSibling ? n.insertBefore(e, r.nextSibling) : n.appendChild(e) : n.insertBefore(e, n.firstChild), y.push(e); else { if ("bottom" !== t.insertAt) throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'."); n.appendChild(e) }
        }
        function u(t) {
            t.parentNode.removeChild(t);
            var e = y.indexOf(t);
            e >= 0 && y.splice(e, 1)
        }
        function s(t) {
            var e = document.createElement("style"); return e.type = "text/css", i(t, e), e
        }
        function a(t, e) {
            var n, r, o;
            if (e.singleton) {
                var i = b++; n = v || (v = s(e)), r = c.bind(null, n, i, !1), o = c.bind(null, n, i, !0)
        }
        else n = s(e), r = l.bind(null, n), o = function () { u(n) };
            return r(t),
                function (e) {
                    if (e) {
                        if (e.css === t.css && e.media === t.media && e.sourceMap === t.sourceMap)
                            return;
                        r(t = e)
                    } else o()
                }
        }
        function c(t, e, n, r) {
            var o = n ? "" : r.css;
            if (t.styleSheet) t.styleSheet.cssText = m(e, o);
            else {
                var i = document.createTextNode(o), u = t.childNodes; u[e] && t.removeChild(u[e]), u.length ? t.insertBefore(i, u[e]) : t.appendChild(i)
            }
        }
        function l(t, e) {
            var n = e.css, r = e.media, o = e.sourceMap;
            if (r && t.setAttribute("media", r), o
                && (n += "\n/*# sourceURL=" + o.sources[0] + " */", n += "\n/*# sourceMappingURL=data:application/json;base64,"
                + btoa(unescape(encodeURIComponent(JSON.stringify(o)))) + " */"), t.styleSheet) t.styleSheet.cssText = n;
            else {
                for (; t.firstChild;) t.removeChild(t.firstChild);
                t.appendChild(document.createTextNode(n))
            }
        }
        var f = {},
            p = function (t) {
                var e; return function () { return "undefined" == typeof e && (e = t.apply(this, arguments)), e }
            },
            d = p(function () { return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase()) }),
            h = p(function () { return document.head || document.getElementsByTagName("head")[0] }),
            v = null, b = 0, y = []; t.exports = function (t, e) {
                e = e || {},
                    "undefined" == typeof e.singleton && (e.singleton = d()),
                "undefined" == typeof e.insertAt && (e.insertAt = "bottom");
                var n = o(t); return r(n, e),
                    function (t) {
                        for (var i = [], u = 0; u < n.length; u++) {
                            var s = n[u], a = f[s.id]; a.refs--, i.push(a)
                        }
                        if (t) {
                            var c = o(t); r(c, e)
                        }
                        for (var u = 0; u < i.length; u++) {
                            var a = i[u]; if (0 === a.refs) {
                                for (var l = 0; l < a.parts.length; l++) a.parts[l](); delete f[a.id]
                            }
                        }
                    }
            };
            var m = function () { var t = []; return function (e, n) { return t[e] = n, t.filter(Boolean).join("\n") } }()
    },
    function (t, e, n) { var r = n(82); "string" == typeof r && (r = [[t.id, r, ""]]); n(87)(r, {}); r.locals && (t.exports = r.locals) }])
});
//# sourceMappingURL=vue-select.js.map
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

function getValueExprValue(ctrl, formObject, userObject) {
    if (ctrl.ValueExpr && ctrl.ValueExpr.Lang === 0 && ctrl.ValueExpr.Code) {
        let fun = new Function("form", "user", `event`, atob(ctrl.ValueExpr.Code)).bind(ctrl, formObject, userObject);
        let val = fun();
        val = EbConvertValue(val, ctrl.ObjType);
        return val;
    }
}

function EbRunValueExpr_n(ctrl, formObject, userObject, formObj) {
    if (ctrl.ValueExpr && ctrl.ValueExpr.Lang === 0 && ctrl.ValueExpr.Code)
        return valueExpHelper_n(getValueExprValue(ctrl, formObject, userObject), ctrl);
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

        ExecQuery(formObj.RefId, ctrl.Name, params, ctrl);
    }
}

function valueExpHelper_n(val, ctrl) {
    ctrl.DataVals.ValueExpr_val = val;
    let isdifferentValue = (ctrl.DataVals.Value && ctrl.DataVals.Value !== ctrl.DataVals.ValueExpr_val);
    if (isdifferentValue)
        console.warn(`edit mode value and valueExpression value are different for '${ctrl.Name}' control`);
    else {
        if (ctrl.DataVals.ValueExpr_val)
            ctrl.justSetValue(ctrl.DataVals.ValueExpr_val);
    }
    return ctrl.DataVals.ValueExpr_val;
}

function EbRunValueExpr(ctrl, formObject, userObject, formObj) {
    if (ctrl.ValueExpr && ctrl.ValueExpr.Lang === 0 && ctrl.ValueExpr.Code)
        return valueExpHelper(getValueExprValue(ctrl, formObject, userObject), ctrl);
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

        ExecQuery(formObj.RefId, ctrl.Name, params, ctrl);
    }
}

function valueExpHelper(val, ctrl) {
    ctrl.DataVals.ValueExpr_val = val;
    let isdifferentValue = (ctrl.DataVals.Value && ctrl.DataVals.Value !== ctrl.DataVals.ValueExpr_val);
    if (isdifferentValue)
        console.warn(`edit mode value and valueExpression value are different for '${ctrl.Name}' control`);
    else {
        if (ctrl.DataVals.ValueExpr_val)
            ctrl.setValue(ctrl.DataVals.ValueExpr_val);
    }
    return ctrl.DataVals.ValueExpr_val;
}

function showLoader4webform() {
    $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#WebForm-cont" } });
}

function hideLoader4webform() {
    $("#eb_common_loader").EbLoader("hide");
}

function ExecQuery(refId, ctrlName, params, ctrl) {
    showLoader4webform();
    var _ctrl = ctrl;
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
        success: function (val) {
            valueExpHelper(val, _ctrl);
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
//need to move to form
function dateDisplayNone() {
    document.addEventListener('scroll', function (e) {
        $('.xdsoft_datetimepicker').css("display", "none");
        $('.month-picker').css("display", "none");

    }, true);
}
function getObjCopy4PS(Obj) {
    let newObj = {};
    $.extend(true, newObj, Obj);
    let keys = Object.keys(newObj);
    for (var i = 0; i < keys.length; i++) {
        if (typeof Obj[keys[i]] === "function")
            delete newObj[keys[i]];
    }
    return newObj;
}

function getEbFontStyleObject(font) {
    //let GfontsList = {
    //    'Arapey': 'Arapey',
    //    'Arvo': 'Arvo',
    //    'Baskerville': 'Libre Baskerville',
    //    'Bentham': 'Bentham',
    //    'Cabin Condensed': 'Cabin Condensed',
    //    'Century Gothic': 'Didact Gothic',
    //    'Courier': 'Courier > Courier',
    //    'Crimson Text': 'Crimson Text',
    //    'EB Garamond': 'EB Garamond',
    //    'GFS Didot': 'GFS Didot',
    //    'Gotham': 'Montserrat',
    //    'Helvetica': 'Helvetica',
    //    'Libre Franklin': 'Libre Franklin',
    //    'Maven Pro': 'Maven Pro',
    //    'Merriweather': 'Merriweather',
    //    'News Cycle': 'News Cycle',
    //    'Puritan': 'Puritan',
    //    'Questrial': 'Questrial',
    //    'Times-Roman': 'Times',
    //    'Times': 'Tinos',
    //    'ZapfDingbats': 'Heebo'
    //}
    let fontObj = {};
    let Abc = { 0: "normal", 1: "bold", 2: "italic", 3: "bold-italic" };
    if (font !== null) {
        fontObj['font-family'] = font.FontName;
        fontObj['font-size'] = font.Size;
        fontObj['color'] = font.color;
        if (Abc[font.Style] === "bold") {
            fontObj['font-weight'] = Abc[font.Style];
        }
        else if (Abc[font.Style] === "italic") {
            fontObj['font-style'] = Abc[font.Style];
        }
        else if (Abc[font.Style] === "bold-italic") {
            fontObj['font-style'] = "italic";
            fontObj['font-weight'] = "bold";
        }
        if (font.Caps === true) {
            fontObj['text-transform'] = "uppercase";
        }
        if (font.Strikethrough === true) {
            fontObj['text-decoration'] = "line-through";
        }
        if (font.Underline === true) {
            fontObj['text-decoration'] = "underline";
        }

    }
    return fontObj;

}

if (!Array.prototype.clear) {
    Array.prototype.clear = function () {
        this.splice(0, this.length);
    };
}
function scrollDropDown(e) {
    //document.addEventListener('scroll', function (e) {
    //    var scrl_trg = $("#PowerSelect3DDdiv");
    //    if ($(e.target).hasClass('tab-content')) {
    //        ////$(e.target).scroll(function () {
    //        ////    let topval = 0;
    //        ////     topval = (scrl_trg.offset().top - $(this).scrollTop());
    //        ////    console.log(scrl_trg.offset().top,  $(this).scrollTop(), topval);
    //        ////    scrl_trg.css("top", topval );
    //        ////    //scrl_trg.offset({ top: topval });
    //        ////});

    //        let lstscrlTop = 0;
    //        let topval = scrl_trg.offset().top;
    //        let drpval = 0;
    //        $(e.target).scroll(function (event) {
    //            var st = $(this).scrollTop();
    //            if (st > lstscrlTop) {
    //                drpval = topval - $(this).scrollTop();
    //                scrl_trg.css("top", drpval ); 
    //            } else {
    //                scrl_trg.css("top", drpval + $(this).scrollTop());
    //            }
    //            lstscrlTop = st;
    //        });
    //    }

    //}, true);
}
const EbTableVisualization = function EbTableVisualization(id, jsonObj) {
    this.$type = 'ExpressBase.Objects.EbTableVisualization, ExpressBase.Objects';
    this.EbSid = id;
    this.RowGroupCollection = { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.RowGroupParent,  ExpressBase.Objects]], System.Private.CoreLib", "$values": [] };
    this.CurrentRowGroup = { "$type": "ExpressBase.Objects.RowGroupParent, ExpressBase.Objects", "Name": null, "DisplayName": null, "RowGrouping": { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.Objects.DVRelated.DVBaseColumn, ExpressBase.Objects]], System.Private.CoreLib", "$values": [] }, "OrderBy": { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.Objects.DVRelated.DVBaseColumn, ExpressBase.Objects]], System.Private.CoreLib", "$values": [] } };
    this.LeftFixedColumn = 0; this.RightFixedColumn = 0; this.PageLength = 100; this.DisableRowGrouping = false; this.SecondaryTableMapField = '';
    this.DisableCopy = false; this.AllowMultilineHeader = false;
    this.OrderBy = { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.Objects.DVRelated.DVBaseColumn,  ExpressBase.Objects]], System.Private.CoreLib", "$values": [] };
    this.FormLinks = { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.FormLink,  ExpressBase.Objects]], System.Private.CoreLib", "$values": [] };
    this.RowHeight = 15; this.AllowLocalSearch = false; this.BackColor = '#FFFFFF'; this.IsGradient = true; this.GradientColor1 = '#3d3d5a'; this.GradientColor2 = '#3b7273';
    this.Direction = 0; this.BorderColor = '#3d3d5a'; this.BorderRadius = 4; this.FontColor = '#FFFFFF'; this.LinkColor = '#26b3f7'; this.RefId = ''; this.DisplayName = '';
    this.Name = id; this.Description = ''; this.VersionNumber = ''; this.Status = ''; this.DataSourceRefId = ''; this.IsDataFromApi = false; this.Url = ''; this.Method = 0;
    this.Headers = { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.ApiRequestHeader,  ExpressBase.Objects]], System.Private.CoreLib", "$values": [] };
    this.Parameters = { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.ApiRequestParam,  ExpressBase.Objects]], System.Private.CoreLib", "$values": [] };
    this.FilterDialogRefId = ''; this.Sql = ''; this.EbSid = id; this.Columns = { "$type": "ExpressBase.Objects.Objects.DVRelated.DVColumnCollection, ExpressBase.Objects", "$values": [] };
    this.DSColumns = { "$type": "ExpressBase.Objects.Objects.DVRelated.DVColumnCollection, ExpressBase.Objects", "$values": [] };
    this.ColumnsCollection = { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.Objects.DVRelated.DVColumnCollection,  ExpressBase.Objects]], System.Private.CoreLib", "$values": [] };
    this.ParamsList = { "$type": "System.Collections.Generic.List`1[[ExpressBase.Common.Data.Param,  ExpressBase.Common]], System.Private.CoreLib", "$values": [] };
    this.NotVisibleColumns = { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.Objects.DVRelated.DVBaseColumn,  ExpressBase.Objects]], System.Private.CoreLib", "$values": [] };
    this.data = { "$type": "System.Object, System.Private.CoreLib" }; this.Pippedfrom = ''; this.AutoGen = false; this.IsPaging = true;
    this.EbSid_CtxId = id;


    this.$Control = $("<div class='btn btn-default'> GetDesignHtml() not implemented </div>".replace(/@id/g, this.EbSid));
    this.BareControlHtml = `<div class='btn btn-default'> GetBareHtml() not implemented </div>`.replace(/@id/g, this.EbSid);
    this.DesignHtml = "<div class='btn btn-default'> GetDesignHtml() not implemented </div>";
    var MyName = this.constructor.name;
    this.RenderMe = function () {
        var NewHtml = this.$BareControl.outerHTML(), me = this, metas = AllMetas[MyName];
        $.each(metas, function (i, meta) {
            var name = meta.name;
            if (meta.IsUIproperty) {
                NewHtml = NewHtml.replace('@' + name + ' ', me[name]);
            }
        });
        if (!this.IsContainer)
            $('#' + id).html($(NewHtml).html());
    };
    if (jsonObj) {
        jsonObj.RenderMe = this.RenderMe;
        jsonObj.Html = this.Html;
        jsonObj.Init = this.Init;
        $.extend(this, jsonObj);
        //_.mergeWith(
        // {}, this, jsonObj,
        //  (a, b) => b === null ? a : undefined
        //)
        if (jsonObj.IsContainer)
            this.Controls = new EbControlCollection({});
        //if(this.Init)
        //    jsonObj.Init(id);
    }
    else {
        if (this.Init)
            this.Init(id);
    }
};

const EbPowerSelect = function (ctrl, options) {
    //parameters   
    this.getFilterValuesFn = options.getFilterValuesFn;
    this.ComboObj = ctrl;
    this.ComboObj.initializer = this;
    this.name = ctrl.EbSid_CtxId;
    this.containerId = this.name + "DDdiv";
    this.dsid = ctrl.DataSourceId;
    this.idField = "name";
    if (!(Object.keys(ctrl.ValueMember).includes("name")))//////////////////
        this.idField = "columnName";////////////////////////
    this.vmName = ctrl.ValueMember[this.idField]; //ctrl.vmName;

    this.dmNames = ctrl.DisplayMembers.$values.map(function (obj) { return obj[this.idField]; }.bind(this));//['acmaster1_xid', 'acmaster1_name', 'tdebit']; //ctrl.dmNames;
    this.ColNames = ctrl.Columns.$values.map(function (obj) { return obj[this.idField]; }.bind(this));//['acmaster1_xid', 'acmaster1_name', 'tdebit']; //ctrl.dmNames;

    this.maxLimit = (ctrl.MaxLimit === 0) ? 9999999999999999999999 : ctrl.MaxLimit;
    this.minLimit = ctrl.MinLimit;//ctrl.minLimit;
    this.ComboObj.MultiSelect = (ctrl.MaxLimit !== 1);
    this.required = ctrl.Required;//ctrl.required;
    this.servicestack_url = "";//ctrl.servicestack_url;
    //this.vmValues = (ctrl.vmValues !== null) ? ctrl.vmValues : [];
    this.dropdownHeight = (ctrl.DropdownHeight === 0) ? "400" : ctrl.DropdownHeight;


    //local variables
    this.container = this.name + "Container";
    this.$wraper = $('#' + this.name + 'Wraper');
    this.DTSelector = '#' + this.name + 'tbl';
    this.DT_tbodySelector = "#" + this.ComboObj.EbSid_CtxId + 'DDdiv table:eq(1) tbody';
    this.NoOfFields = this.dmNames.length;
    this.Vobj = null;
    this.datatable = null;
    this.clmAdjst = 0;
    this.onDataLoadCallBackFns = [];


    ctrl._DisplayMembers = [];
    ctrl._ValueMembers = [];
    this.valueMembers = ctrl._ValueMembers;
    this.localDMS = ctrl._DisplayMembers;
    this.columnVals = {};
    $.each(this.ColNames, function (i, name) { this.columnVals[name] = []; }.bind(this));

    this.$curEventTarget = null;
    this.IsDatatableInit = false;
    this.IsSearchBoxFocused = false;

    $.each(this.dmNames, function (i, name) { this.localDMS[name] = []; }.bind(this));

    this.VMindex = null;
    this.DMindexes = [];
    this.cellTr = null;
    this.Msearch_colName = '';
    this.cols = [];
    this.filterArray = [];
    // functions

    //init() for event binding....
    this.init = function () {
        try {
            $('#' + this.name + 'Wraper [class=open-indicator]').hide();
            this.$searchBoxes = $('#' + this.name + 'Wraper [type=search]');
            this.$searchBoxes.on("click", function () { $(this).focus(); });
            this.$searchBoxes.keyup(this.searchboxKeyup);
            this.$inp = $("#" + this.ComboObj.EbSid_CtxId);
            this.$progressBar = $("#" + this.ComboObj.EbSid_CtxId + "_pb");
            this.$DDdiv = $('#' + this.name + 'DDdiv');

            $(document).mouseup(this.hideDDclickOutside.bind(this));//hide DD when click outside select or DD &  required ( if  not reach minLimit) 
            $('#' + this.name + 'Wraper .ps-srch').off("click").on("click", this.toggleIndicatorBtn.bind(this)); //search button toggle DD
            $('#' + this.name + 'tbl').keydown(function (e) { if (e.which === 27) this.Vobj.hideDD(); }.bind(this));//hide DD on esc when focused in DD
            $('#' + this.name + 'Wraper').on('click', '[class= close]', this.tagCloseBtnHand.bind(this));//remove ids when tagclose button clicked
            this.$searchBoxes.keydown(this.SearchBoxEveHandler.bind(this));//enter-DDenabling & if'' showall, esc arrow space key based DD enabling , backspace del-valueMember updating
            $('#' + this.name + 'Wraper' + " .dropdown.v-select.searchable").dblclick(this.V_showDD.bind(this));//search box double click -DDenabling
            this.$searchBoxes.keyup(debounce(this.delayedSearchFN.bind(this), 600)); //delayed search on combo searchbox
            this.$searchBoxes.on("focus", this.searchBoxFocus); // onfocus  searchbox
            this.$searchBoxes.on("blur", this.searchBoxBlur); // onblur  searchbox
            this.Values = [];

            {// temporary code
                if (!this.ComboObj.Padding)
                    this.ComboObj.Padding = { $type: "ExpressBase.Common.Objects.UISides, ExpressBase.Common", Top: 7, Right: 10, Bottom: 7, Left: 10 }
            }

            if (this.ComboObj.Padding)
                this.$searchBoxes.css("padding", `${this.ComboObj.Padding.Top}px ${this.ComboObj.Padding.Right}px ${this.ComboObj.Padding.Bottom}px ${this.ComboObj.Padding.Left}px`);

            if (this.ComboObj.IsInsertable) {
                this.ComboObj.__AddButtonInit(this.ComboObj.AddButton);
            }

            //set id for searchBox
            $('#' + this.name + 'Wraper  [type=search]').each(this.srchBoxIdSetter.bind(this));


            if (!this.ComboObj.MultiSelect)
                $('#' + this.name + 'Wraper').attr("singleselect", "true");


            //styles
            $('#' + this.name + 0).children().css("border-top-left-radius", "5px");
            $('#' + this.name + 0).children().css("border-bottom-left-radius", "5px");
            this.ComboObj.getColumn = this.getColumn;
        }
        catch (err) {
            console.error(err.message);
        }
    };

    this.searchboxKeyup = function (e) {
        let $e = $(event.target);
        if (this.valueMembers.length === 0)
            $e.css("width", "100%");
        else {
            let count = $e.val().length;
            $e.css("width", (count * 7.2 + 12) + "px");
        }
    }.bind(this);

    this.getColumn = function (colName) { return this.ComboObj.MultiSelect ? this.columnVals[colName] : this.columnVals[colName][0]; }.bind(this);

    //this.getColumn = function (colName) {
    //    let columnVals = getEbFormatedPSRows(this.ComboObj);
    //    return this.ComboObj.MultiSelect ? columnVals[colName] : columnVals[colName][0];
    //}.bind(this);

    this.searchBoxFocus = function () {
        this.IsSearchBoxFocused = true;
        this.RemoveRowFocusStyle();
    }.bind(this);

    this.searchBoxBlur = function () {
        this.IsSearchBoxFocused = false;
        let _name = this.ComboObj.EbSid_CtxId;
        EbHideCtrlMsg(`#${_name}Container`, `#${_name}Wraper`);
    }.bind(this);

    this.getSearchByExp = function (DefOp, mapedFieldType) {
        let op = String.empty;
        if (mapedFieldType === "string") {
            if (DefOp === 0)// Equals
                op = " = ";
            else if (DefOp === 1)// Startwith
                op = "x*";
            else if (DefOp === 2)//EndsWith
                op = "*x";
            else if (DefOp === 3)// Between
                op = "*x*";
            else if (DefOp === 3)// Contains
                op = "*x*";
        }
        else if (mapedField === "numeric") {
            switch (DefOp.toString()) {
                case EbEnums.NumericOperators.Equals: op = '='; break;
                case EbEnums.NumericOperators.LessThan: op = '<'; break;
                case EbEnums.NumericOperators.GreaterThan: op = '>'; break;
                case EbEnums.NumericOperators.LessThanOrEqual: op = '<='; break;
                case EbEnums.NumericOperators.GreaterThanOrEqual: op = '>='; break;
                case EbEnums.NumericOperators.Between: op = 'B'; break;
                default: op = '=';
            }
        }
        else if (mapedField === "date") {
            switch (DefOp.toString()) {
                case EbEnums.NumericOperators.Equals: op = '='; break;
                case EbEnums.NumericOperators.LessThan: op = '<'; break;
                case EbEnums.NumericOperators.GreaterThan: op = '>'; break;
                case EbEnums.NumericOperators.LessThanOrEqual: op = '<='; break;
                case EbEnums.NumericOperators.GreaterThanOrEqual: op = '>='; break;
                case EbEnums.NumericOperators.Between: op = 'B'; break;
                default: op = '=';
            }
        }
        return op;
    }

    this.showCtrlMsg = function () {
        EbShowCtrlMsg(`#${this.ComboObj.EbSid_CtxId}Container`, `#${this.ComboObj.EbSid_CtxId}Wraper`, `Enter minimum ${this.ComboObj.MinSeachLength} characters to search`, "info");
    }.bind(this);

    this.hideCtrlMsg = function () {
        EbHideCtrlMsg(`#${this.ComboObj.EbSid_CtxId}Container`, `#${this.ComboObj.EbSid_CtxId}Wraper`);
    }.bind(this);

    //delayed search on combo searchbox
    this.delayedSearchFN = function (e) {
        let $e = $(e.target);
        let searchVal = $e.val().trim();
        let MaxSearchVal = this.getMaxLenVal();

        if (!isPrintable(e) && e.which !== 8)
            return;

        if (this.ComboObj.MinSeachLength > MaxSearchVal.length) {
            this.showCtrlMsg();
            this.V_hideDD();
            return;
        }
        else {
            this.hideCtrlMsg();
        }

        let mapedField = $e.closest(".searchable").attr("maped-column");
        let mapedFieldType = this.getTypeForDT($e.closest(".searchable").attr("column-type"));
        let $filterInp = $(`#${this.name}tbl_${mapedField}_hdr_txt1`);
        let colObj = getObjByval(this.ComboObj.DisplayMembers.$values, "name", mapedField);
        let searchByExp = "x*";//this.getSearchByExp(colObj.DefaultOperator, mapedFieldType);// 4 roby
        if (mapedFieldType !== "string")
            searchByExp = " = ";
        if (!this.IsDatatableInit) {
            if (this.ComboObj.MinSeachLength > searchVal.length)
                return;
            let filterObj = new filter_obj(mapedField, searchByExp, searchVal, mapedFieldType);
            this.filterArray.push(filterObj);
            this.V_showDD();
        }
        else {
            if (this.ComboObj.IsPreload) {
                $filterInp.val($e.val());
                this.Vobj.DDstate = true;
                EbMakeValid(`#${this.ComboObj.EbSid_CtxId}Container`, `#${this.ComboObj.EbSid_CtxId}Wraper`);
                if (this.ComboObj.MinSeachLength > searchVal.length)
                    return;

                if (searchVal === "" && this.ComboObj.MinSeachLength === 0) {
                    if (this.datatable) {
                        this.datatable.Api.column(mapedField + ":name").search("").draw();
                    }
                    return;
                }

                if (this.datatable) {
                    this.datatable.Api.column(mapedField + ":name").search(searchVal).draw();
                }
            }
            else {
                if (this.lastSearchVal === searchVal)
                    return;
                this.UpdateFilter(mapedField, searchByExp, searchVal, mapedFieldType);
                //if (this.filterArray.length > 0)
                this.getData();
                this.lastSearchVal = searchVal;
            }
        }
    };

    this.UpdateFilter = function (mapedField, searchByExp, searchVal, mapedFieldType) {
        let index = this.filterArray.findIndex(ft => ft.Column === mapedField);
        if (index !== -1) {
            if (searchVal === "")
                this.filterArray.splice(index, 1);
            else
                this.filterArray[index].Value = searchVal;
        }
        else if (searchVal !== "") {
            let filterObj = new filter_obj(mapedField, searchByExp, searchVal, mapedFieldType);
            this.filterArray.push(filterObj);
        }
    };

    this.defaultDTcallBFn = function () {
        this.V_hideDD();
    };

    this.setValues = function (StrValues, callBFn = this.defaultDTcallBFn) {
        this.clearValues();
        if (StrValues === "" || StrValues === null)
            return;
        this.setvaluesColl = (StrValues + "").split(",");// cast

        if (this.ComboObj.IsPreload) { // if preLoad
            if (this.data === undefined) {// if preLoad No data
                this.IsFromSetValues = true;
                this.getData();
            }
            else
                this.setValues2PSFromData();
        }
        else {// get data with particular rows
            this.filterArray.clear();
            this.filterArray.push(new filter_obj(this.ComboObj.ValueMember.name, "=", this.setvaluesColl.join("|"), this.ComboObj.ValueMember.Type));
            this.IsFromSetValues = true;
            this.getData();
        }
    }.bind(this);

    this.getValues = function () {

    };

    this.clearValues = function () {
        $.each(this.Vobj.valueMembers, function (i, val) {
            if (val.trim() !== "")// prevent Jq selector error
                $(this.DTSelector + ` [type=checkbox][value=${val}]`).prop("checked", false);
        }.bind(this));
        this.Vobj.valueMembers.splice(0, this.Vobj.valueMembers.length);// clears array without modifying array Object (watch)
        $.each(this.dmNames, this.popAllDmValues.bind(this));
        $.each(this.ColNames, function (i, name) { this.columnVals[name] = []; }.bind(this));
    }.bind(this);

    this.initComplete4SetVal = function (callBFn, StrValues) {
        this.clearValues();
        if (this.setvaluesColl) {
            this.datatable.Api.column(this.ComboObj.ValueMember.name + ":name").search(this.setvaluesColl.join("|"), true, false).draw();
            if (this.ComboObj.MultiSelect) {
                $.each(this.setvaluesColl, function (i, val) {
                    let $checkBox = $(this.DTSelector + ` [type=checkbox][value=${parseInt(val)}]`);
                    if ($checkBox.length === 0) {
                        console.eb_warn(`>> eb message : none available value '${val}' set for  powerSelect '${this.ComboObj.Name}'`, "rgb(222, 112, 0)");
                        this.$inp.val(StrValues).trigger("change");
                    }
                    else
                        $checkBox.click();
                }.bind(this));
            }
            else {
                let $row = $(this.DTSelector + ` tbody tr[role="row"][data-uid=${StrValues}]`);
                if ($row.length === 0) {//
                    console.log(`>> eb message : none available value '${StrValues}' set for  powerSelect '${this.ComboObj.Name}'`);
                    this.$inp.val(StrValues).trigger("change");
                }
                else
                    $row.trigger("dblclick");
            }
            //this.afterInitComplete4SetVal = true;
        }
        if (callBFn)
            callBFn();
    };

    this.popAllDmValues = function (i) {
        this.Vobj.displayMembers[this.dmNames[i]].splice(0, this.Vobj.displayMembers[this.dmNames[i]].length); //// clears array without modifying array Object (watch)
    };

    this.getTypeForDT = function (type) {
        type = parseInt(type);
        let res = "";
        if (type === 16)
            res = "string";
        else if ([7, 8, 9, 10, 11, 12, 21].contains(type))
            res = "number";
        else if (type === 3)
            res = "boolean";
        else if ([5, 6, 17, 26].contains(type))
            res = "date";

        return res;
    };

    this.srchBoxIdSetter = function (i) {
        $('#' + this.name + 'Wraper  [type=search]:eq(' + i + ')').attr('id', this.dmNames[i]);
    };

    //enter-DDenabling & if'' showall, esc arrow space key based DD enabling , backspace del-valueMember updating
    this.SearchBoxEveHandler = function (e) {
        let $e = $(e.target);
        let search = $e.val().toString();
        if (e.which === 13)
            this.Vobj.showDD();
        if ((e.which === 8 || e.which === 46) && search === '' && this.Vobj.valueMembers.length > 0) {
            this.Vobj.valueMembers.pop();
            $.each(this.dmNames, this.popDmValues.bind(this));
        }
        if (e.which === 40)
            this.Vobj.showDD();
        if (e.which === 32) {
            if (this.Vobj.DDstate)
                return;
            this.Vobj.showDD();
        }
        if (e.which === 27)
            this.Vobj.hideDD();
    };

    this.popDmValues = function (i) {
        this.Vobj.displayMembers[this.dmNames[i]].pop(); //= this.Vobj.displayMembers[this.dmNames[i]].splice(0, this.maxLimit);
    };

    this.getData = function () {
        this.showLoader();
        //$("#PowerSelect1_pb").EbLoader("show", { maskItem: { Id: `#${this.container}` }, maskLoader: false });
        this.filterValues = [];
        let params = this.ajaxData();
        let url = "../dv/getData4PowerSelect";
        $.ajax({
            url: url,
            type: 'POST',
            data: params,
            success: this.getDataSuccess.bind(this),
        });
    };

    this.showLoader = function () {
        this.$progressBar.EbLoader("show", { maskItem: { Id: "#" + this.containerId }, maskLoader: false});
        //this.$DDdiv.append('<div class="loader_mask_EB"></div>');
        //this.$lastFocusedEl = $(":focus").blur();
    };

    this.hideLoader = function () {
        //if (this.$lastFocusedEl && this.$lastFocusedEl.length === 1)
        //    this.$lastFocusedEl.focus();
        this.$progressBar.EbLoader("hide");
        //this.$DDdiv.find(".loader_mask_EB").remove();
    };

    this.ajaxData = function () {
        this.EbObject = new EbObjects["EbTableVisualization"]("Container");
        this.EbObject.DataSourceRefId = this.dsid;
        this.EbObject.Columns.$values = this.ComboObj.Columns.$values;
        let dq = new Object();
        dq.RefId = this.dsid;
        this.filterValues = this.getFilterValuesFn();
        this.AddUserAndLcation();
        dq.Params = this.filterValues || [];
        dq.Start = 0;
        dq.Length = this.ComboObj.IsPreload ? 0 : this.ComboObj.SearchLimit;
        //dq.Length = this.ComboObj.DropDownItemLimit || 5000;
        dq.DataVizObjString = JSON.stringify(this.EbObject);
        dq.TableId = this.name + "tbl";

        if (this.ComboObj.IsPreload)
            dq.TFilters = [];
        else
            dq.TFilters = this.filterArray;

        dq.Ispaging = true;
        return dq;
    };

    this.AddUserAndLcation = function () {
        this.filterValues.push(new fltr_obj(11, "eb_loc_id", store.get("Eb_Loc-" + ebcontext.sid + ebcontext.user.UserId)));
        this.filterValues.push(new fltr_obj(11, "eb_currentuser_id", ebcontext.user.UserId));
    };

    this.getColumnIdx = function (arr, colName) {
        return arr.filter(o => o.name === colName)[0].data;
    };

    this.setValues2PSFromData = function () {
        let VMs = this.Vobj.valueMembers || [];
        let DMs = this.Vobj.displayMembers || [];
        let columnVals = this.columnVals || {};

        if (this.setvaluesColl.length > 0)// clear if already values there
            this.clearValues();

        let valMsArr = this.setvaluesColl;
        let VMidx = this.ComboObj.Columns.$values.filter(o => o.name === this.vmName)[0].data;

        for (let i = 0; i < valMsArr.length; i++) {
            let vm = valMsArr[i].trim();
            VMs.push(vm);
            this.addColVals(vm);

            let RowDataARR = this.formattedData.filter(obj => obj[VMidx] === vm);
            if (RowDataARR.length === 0) {
                console.log(`>> eb message : none available value '${vm}' set for  powerSelect '${this.ComboObj.Name}'`);
                return;
            }
            let RowData = RowDataARR[0];

            for (let j = 0; j < this.dmNames.length; j++) {
                let dmName = this.dmNames[j];
                if (!DMs[dmName])
                    DMs[dmName] = []; // dg edit mode call
                let DMidx = this.getColumnIdx(this.ComboObj.Columns.$values, dmName);
                DMvalue = RowData[DMidx];
                DMs[dmName].push(DMvalue);
            }
        }
    };

    this.addColVals = function (val = this.lastAddedOrDeletedVal) {
        let VMidx = this.ComboObj.Columns.$values.filter(o => o.name === this.vmName)[0].data;

        let RowDataARR = this.formattedData.filter(obj => obj[VMidx] === val);
        let RowUnformattedDataARR = this.unformattedData.filter(obj => obj[VMidx] === val);

        if (RowDataARR.length === 0) {
            console.log(`>> eb message : none available value '${val}' set for  powerSelect '${this.ComboObj.Name}'`);
            return;
        }
        let RowData = RowDataARR[0];
        let RowUnformattedData = RowUnformattedDataARR[0];


        for (let j = 0; j < this.ColNames.length; j++) {
            let colName = this.ColNames[j];
            let obj = getObjByval(this.ComboObj.Columns.$values, "name", colName);
            let type = obj.Type;
            if (!this.columnVals[colName])
                this.columnVals[colName] = []; // dg edit mode call
            let ColIdx = this.getColumnIdx(this.ComboObj.Columns.$values, colName);

            let cellData;
            if (type === 5 || type === 11)
                cellData = RowData[ColIdx];// unformatted data for date or integer
            else
                cellData = RowUnformattedData[ColIdx];//this.datatable.Api.row($rowEl).data()[idx];//   formatted data
            if (type === 11 && cellData === null)///////////
                cellData = "0";
            let fval = EbConvertValue(cellData, type);
            this.columnVals[colName].push(fval);
        }
    };



    //this.addColVals = function (val = this.lastAddedOrDeletedVal) {
    //    $.each(this.ColNames, function (i, name) {
    //        let obj = getObjByval(this.datatable.ebSettings.Columns.$values, "name", name);
    //        let type = obj.Type;
    //        let $rowEl = $(`${this.DT_tbodySelector} [data-uid=${val}]`);
    //        let idx = getObjByval(this.datatable.ebSettings.Columns.$values, "name", name).data;
    //        let vmindex = $.grep(this.datatable.ebSettings.Columns.$values, function (obj) { return obj.name === this.vmName; }.bind(this))[0].data;
    //        let cellData;
    //        if (type === 5 || type === 11)
    //            cellData = this.datatable.data.filter(ro => ro[vmindex] === val)[0][idx];// unformatted data for date or integer
    //        else
    //            cellData = this.datatable.Api.row($rowEl).data()[idx];//this.datatable.Api.row($rowEl).data()[idx];//   formatted data
    //        if (type === 11 && cellData === null)///////////
    //            cellData = "0";
    //        let fval = EbConvertValue(cellData, type);
    //        this.columnVals[name].push(fval);
    //    }.bind(this));
    //};

    this.getDataSuccess = function (result) {
        this.data = result;
        this.unformattedData = result.data;
        this.formattedData = result.formattedData;


        if (this.IsFromSetValues) {// from set value
            if (this.setvaluesColl && this.setvaluesColl.length > 0) {
                this.setValues2PSFromData();
            }
            this.IsFromSetValues = false;
        }
        else {// not from setValue (search,...)
            if (this.datatable === null) {
                this.initDataTable();
            }
            else {
                this.datatable.Api.clear();
                this.datatable.Api.rows.add(this.formattedData); // Add new data
                this.datatable.Api.columns.adjust().draw();
            }
        }
        this.hideLoader();
        this.V_showDD();
    };

    this.initDataTable = function () {
        let o = {};
        o.containerId = this.containerId;
        o.dsid = this.dsid;
        o.tableId = this.name + "tbl";
        o.showSerialColumn = false;
        o.showCheckboxColumn = this.ComboObj.MultiSelect;
        o.showFilterRow = true;
        o.scrollHeight = this.ComboObj.DropdownHeight === 0 ? "500px" : this.ComboObj.DropdownHeight + "px";
        o.fnDblclickCallback = this.dblClickOnOptDDEventHand.bind(this);
        //o.fnKeyUpCallback = this.xxx.bind(this);
        o.arrowFocusCallback = this.arrowSelectionStylingFcs;
        o.arrowBlurCallback = this.arrowSelectionStylingBlr;
        o.fninitComplete = this.initDTpost.bind(this);
        //o.columnSearch = this.filterArray;
        o.headerDisplay = (this.ComboObj.Columns.$values.filter((obj) => obj.bVisible === true && obj.name !== "id").length === 1) ? false : true;// (this.ComboObj.Columns.$values.length > 2) ? true : false;
        o.dom = "<p>rt";
        o.IsPaging = true;
        o.pageLength = this.ComboObj.DropDownItemLimit;
        o.source = "powerselect";
        o.hiddenFieldName = this.vmName || "id";
        o.keys = true;
        //o.hiddenFieldName = this.vmName;
        o.keyPressCallbackFn = this.DDKeyPress.bind(this);
        o.columns = this.ComboObj.Columns.$values;//////////////////////////////////////////////////////
        if (options)
            o.rendererName = options.rendererName;
        //o.getFilterValuesFn = this.getFilterValuesFn;
        o.fninitComplete4SetVal = this.fninitComplete4SetVal;
        o.fns4PSonLoad = this.onDataLoadCallBackFns;
        o.searchCallBack = this.searchCallBack;
        o.data = this.data;
        this.datatable = new EbBasicDataTable(o);
        if (this.ComboObj.IsPreload)
            this.Applyfilter();
        this.appendDD2Body(); // vrgs
    };

    this.Applyfilter = function () {
        if (this.filterArray.length > 0)
            this.datatable.Api.column(this.filterArray[0].Column + ":name").search(this.filterArray[0].Value).draw();
    };

    // init datatable
    this.DDopenInitDT = function () {
        let searchVal = this.getMaxLenVal();
        let _name = this.ComboObj.EbSid_CtxId;
        if (this.ComboObj.MinSeachLength > searchVal.length) {
            //alert(`enter minimum ${this.ComboObj.MinSeachLength} charecter in searchBox`);
            EbShowCtrlMsg(`#${_name}Container`, `#${_name}Wraper`, `Enter minimum ${this.ComboObj.MinSeachLength} characters to search`, "info");
            return;
        }

        this.IsDatatableInit = true;
        this.getData();
    };

    //this.xxx = function (e, dt, type, indexes) {
    //    console.log("keysssss");
    //};

    this.DDKeyPress = function (e, datatable, key, cell, originalEvent) {
        if ($(":focus").hasClass("eb_finput"))
            return;
        if (key === 13)
            this.DDEnterKeyPress(e, datatable, key, cell, originalEvent);
        else if (key === 32) {
            originalEvent.preventDefault();
            if (originalEvent.target.type !== "checkbox")
                this.DDSpaceKeyPress(e, datatable, key, cell, originalEvent);
        }
    };
    this.searchCallBack = function () {
        setTimeout(function () {
            this.V_updateCk();
        }.bind(this), 30);
    }.bind(this);

    this.DDSpaceKeyPress = function (e, datatable, key, cell, originalEvent) {
        let row = datatable.row(cell.index().row);
        let $tr = $(row.nodes());
        $tr.dblclick();
    };

    this.DDEnterKeyPress = function (e, datatable, key, cell, originalEvent) {
        let row = datatable.row(cell.index().row);
        let $tr = $(row.nodes());
        //let idx = this.datatable.ebSettings.Columns.$values.indexOf(getObjByval(this.datatable.ebSettings.Columns.$values, "name", this.vmName));
        let idx = $.grep(this.datatable.ebSettings.Columns.$values, function (obj) { return obj.name === this.vmName; }.bind(this))[0].data;
        //let rowindex = this.datatable.Api.page.info().start + $tr.index();
        let rowdata = this.datatable.Api.row($tr).data();
        let vmValue = rowdata[idx];
        this.$curEventTarget = $tr;
        this.SelectRow(idx, vmValue);
        this.Vobj.hideDD();
    };

    this.initDTpost = function (data) {
        $.each(this.datatable.Api.settings().init().columns, this.dataColumIterFn.bind(this));
        $(this.DTSelector + ' tbody').on('click', "input[type='checkbox']", this.checkBxClickEventHand.bind(this));//checkbox click event 
        this.datatable.Api.cell($(this.DTSelector + ' tbody tr:eq(0) td:eq(0)')).focus();
    };

    this.dataColumIterFn = function (i, value) {
        if (value.name === this.vmName)
            this.VMindex = value.data;
        $.each(this.dmNames, function (j, dmName) { if (value.name === dmName) { this.DMindexes.push(value.data); } }.bind(this));
    };

    this.SelectRow = function (idx, vmValue) {
        if (!this.Vobj.valueMembers.contains(vmValue)) {
            if (this.maxLimit === 1) {// single select
                this.Vobj.valueMembers = [vmValue];
                this.Vobj.hideDD();
                $.each(this.dmNames, this.setDmValues.bind(this));
            }
            else if (this.Vobj.valueMembers.length !== this.maxLimit) {
                this.Vobj.valueMembers.push(vmValue);
                $.each(this.dmNames, this.setDmValues.bind(this));
                $(this.DTSelector + " tr.selected").find('[type=checkbox]').prop('checked', true);
                this.clearSearchBox();
            }
        }
    };

    this.clearSearchBox = function () {
        setTimeout(function () {
            this.$searchBoxes.val('');
        }.bind(this), 10);
    };

    this.reSetColumnvals = function () {
        if (!event)
            return;
        let vmValue = this.lastAddedOrDeletedVal;
        if (event.target.nodeName === "SPAN")// if clicked tagclose
            vmValue = this.ClosedItem;
        //if (!this.ComboObj.MultiSelect)
        vmValue = parseInt(vmValue);

        if (this.curAction == "remove") {
            this.removeColVals(vmValue);
        }
        else {
            this.addColVals();
        }
    };

    this.reSetColumnvals_ = function () {
        $.each(this.ColNames, function (i, name) {
            this.columnVals[name].clear();
        }.bind(this));
        for (let i = 0; i < this.Vobj.valueMembers.length; i++) {
            this.addColVals(this.Vobj.valueMembers[i]);
        }
    };

    this.removeColVals = function (vmValue) {
        let idx = this.columnVals[this.vmName].indexOf(vmValue);
        if (idx < 0)// to handle special case of setting values which are not in DV
            return;
        $.each(this.ColNames, function (i, name) {
            this.columnVals[name].splice(idx, 1);
        }.bind(this));
    };

    this.setDmValues = function (i, name) {
        let cellData = this.datatable.Api.row(this.$curEventTarget.closest("tr")).data()[getObjByval(this.datatable.ebSettings.Columns.$values, "name", name).data];
        if (this.maxLimit === 1)
            this.localDMS[name].shift();
        this.localDMS[name].push(cellData);
    };

    //double click on option in DD
    this.dblClickOnOptDDEventHand = function (e) {
        this.$curEventTarget = $(e.target);
        //let idx = this.datatable.ebSettings.Columns.$values[getObjByval(this.datatable.ebSettings.Columns.$values, "name", this.vmName).data];
        let idx = $.grep(this.datatable.ebSettings.Columns.$values, function (obj) { return obj.name === this.vmName; }.bind(this))[0].data;
        let rowindex = this.datatable.Api.page.info().start + $(e.target).closest("tr").index();
        let rowdata = this.datatable.Api.row($(e.target).closest("tr")).data();
        let vmValue = rowdata[idx];
        if (!(this.Vobj.valueMembers.contains(vmValue))) {
            this.SelectRow(idx, vmValue);
        }
        else {
            this.delDMs($(e.target));
            $(e.target).closest("tr").find("." + this.name + "tbl_select").prop('checked', false);
        }
    };

    //this.ajaxDataSrcfn = function (dd) {
    //    $('#' + this.name + '_loadingdiv').hide();
    //    this.clmAdjst = this.clmAdjst + 1;
    //    if (this.clmAdjst < 3)
    //        setTimeout(function () {
    //            $('#' + this.name + 'tbl').DataTable().columns.adjust().draw();
    //            console.log('le().columns.adjust()');
    //        }, 520);
    //    setTimeout(function () { this.Vobj.updateCk(); }.bind(this), 1);
    //    return dd.data;
    //};

    this.toggleIndicatorBtn = function (e) {
        this.Vobj.toggleDD();
    };

    this.getSelectedRow = function () {
        if (!this.IsDatatableInit)
            return;
        let res = [];
        $.each(this.ComboObj.TempValue, function (idx, item) {
            let obj = {};
            let rowData = this.datatable.getRowDataByUid(item);
            let temp = this.datatable.sortedColumns;
            let colNames = temp.map((obj, i) => { return obj.name; });
            $.grep(temp, function (obj, i) {
                return obj.name;
            });
            $.each(rowData, function (i, cellData) {
                obj[colNames[i]] = cellData;
            });
            res.push(obj);
        }.bind(this));
        this.ComboObj.SelectedRow = res;
        return res;
    }.bind(this);

    this.Renderselect = function () {
        if ($('#' + this.name + 'Container').length === 0)
            console.eb_warn("no dom element with id " + this.name + 'Container');
        this.Vobj = new Vue({
            el: '#' + this.name + 'Container',
            data: {
                options: [],
                displayMembers: this.localDMS,
                valueMembers: this.valueMembers,
                DDstate: false
            },
            watch: {
                valueMembers: this.V_watchVMembers.bind(this)
            },
            methods: {
                toggleDD: this.V_toggleDD.bind(this),
                showDD: this.V_showDD.bind(this),
                hideDD: this.V_hideDD.bind(this),
                updateCk: this.V_updateCk.bind(this)
            }
        });
        this.init();
    };

    //init Vselect
    this.initVselect = function () {
        //hiding v-select native DD
        $('#' + this.container + ' [class=expand]').css('display', 'none');
        this.Vobj.valueMembers = this.values;
    };

    this.setLastmodfiedVal = function () {
        if (this.Vobj.valueMembers.length > this.Values.length) {
            this.lastAddedOrDeletedVal = this.Vobj.valueMembers.filter(x => !this.Values.includes(x))[0];
            this.curAction = "add";
        }
        else {
            this.lastAddedOrDeletedVal = this.Values.filter(x => !this.Vobj.valueMembers.includes(x))[0];
            this.curAction = "remove";
        }
    };

    //single select & max limit
    this.V_watchVMembers = function (VMs, a, b, c) {
        this.setLastmodfiedVal();
        this.Values = [...this.Vobj.valueMembers];

        this.ComboObj.TempValue = [...this.Vobj.valueMembers];
        //single select
        if (this.maxLimit === 1 && VMs.length > 1) {
            this.Vobj.valueMembers.shift();////
            $.each(this.dmNames, this.trimDmValues.bind(this));
        }
        //max limit
        else if (VMs.length > this.maxLimit) {
            this.Vobj.valueMembers = this.Vobj.valueMembers.splice(0, this.maxLimit);
            $.each(this.dmNames, this.trimDmValues.bind(this));
        }

        this.$inp.attr("display-members", this.Vobj.displayMembers[this.dmNames[0]]);
        this.getSelectedRow();

        if (VMs.length === 0)
            this.$searchBoxes.css("min-width", "100%");
        else
            this.$searchBoxes.css("min-width", "inherit");

        if (this.maxLimit === VMs.length)
            this.$searchBoxes.hide();
        else
            this.$searchBoxes.show();
        //setTimeout(function () {// to adjust search-block
        //    let maxHeight = Math.max.apply(null, $(".search-block .searchable").map(function () { return $(this).height(); }).get());
        //    $(".search-block .input-group").css("height", maxHeight + "px");
        //    $('#' + this.name + 'Wraper [type=search]').val("");
        //}.bind(this), 10);

        if (this.datatable === null) {
            if (this.Vobj.valueMembers.length < this.columnVals[this.dmNames[0]].length)// to manage tag close before dataTable initialization
                this.reSetColumnvals();
            this.$inp.val(this.Vobj.valueMembers).trigger("change");

        }
        else {
            this.reSetColumnvals_();
            this.$inp.val(this.Vobj.valueMembers).trigger("change");
        }


        this.required_min_Check();

        this.ComboObj.DataVals.R = JSON.parse(JSON.stringify(this.columnVals));

        //console.log("VALUE MEMBERS =" + this.Vobj.valueMembers);
        //console.log("DISPLAY MEMBER 0 =" + this.Vobj.displayMembers[this.dmNames[0]]);
        //console.log("DISPLAY MEMBER 1 =" + this.Vobj.displayMembers[this.dmNames[1]]);
        //console.log("DISPLAY MEMBER 3 =" + this.Vobj.displayMembers[this.dmNames[3]]);
        setTimeout(function () {
            this.adjustTag_closeHeight();
            this.$wraper.find(".selected-tag:contains(--)").css("color", "rgba(255, 255, 255, 0.71) !important");
        }.bind(this), 5);
    };

    this.adjustTag_closeHeight = function () {
        if (this.ComboObj.Padding && this.$wraper.find(".selected-tag").length > 0) {
            if (this.ComboObj.Padding.Top >= 7) {
                this.$wraper.find(".selected-tag").css("padding-top", `${(this.ComboObj.Padding.Top - 5)}px`);
                this.$wraper.find(".v-select input[type=search]").css("padding-top", `${(this.ComboObj.Padding.Top - 2)}px`);
                this.$wraper.find(".v-select .selected-tag .close").css("padding-top", `${(this.ComboObj.Padding.Top - 3.5)}px`);
            }
            if (this.ComboObj.Padding.Bottom >= 7) {
                this.$wraper.find(".selected-tag").css("padding-bottom", `${(this.ComboObj.Padding.Bottom - 5)}px`);
                this.$wraper.find(".v-select input[type=search]").css("padding-bottom", `${(this.ComboObj.Padding.Bottom - 2)}px`);
            }
        }
    };

    this.trimDmValues = function (i) {
        let DMs = this.Vobj.displayMembers[this.dmNames[i]];
        if (this.maxLimit === 1) {   //single select
            DMs.shift(); //= this.Vobj.displayMembers[this.dmNames[i]].splice(1, 1);
        }
        else {                        //max limit
            DMs.pop(); //= this.Vobj.displayMembers[this.dmNames[i]].splice(0, this.maxLimit);
        }
    };

    //this.clearColumnVals = function () {
    //    for (colName in this.columnVals)
    //        this.columnVals[colName].clear();
    //}.bind(this);

    this.V_toggleDD = function (e) {
        //if (!this.IsDatatableInit)
        //    this.DDopenInitDT();
        if (this.Vobj.DDstate)
            this.V_hideDD();
        else {
            searchVal = this.getMaxLenVal();
            //if (searchVal === "" || this.ComboObj.MinSeachLength > searchVal.length)
            //    return;
            //else
            this.V_showDD();
        }

        //setTimeout(function(){ $('#' + this.name + 'container table:eq(0)').css('width', $( '#' + this.name + 'container table:eq(1)').css('width') ); },500);
    };

    this.V_hideDD = function () {
        this.Vobj.DDstate = false;
        this.RemoveRowFocusStyle();
    };

    this.getMaxLenVal = function () {
        let val = "";
        $.each(this.$searchBoxes, function (i, el) {
            if ($(el).val().trim().length > val.length)
                val = $(el).val().trim();
        });
        return val;
    };

    this.V_showDD = function (e) {
        if (this.Vobj.DDstate)
            return;
        let searchVal = this.getMaxLenVal();
        if (this.ComboObj.MinSeachLength > searchVal.length) {
            this.showCtrlMsg();
            return;
        }
        else
            this.hideCtrlMsg();

        this.Vobj.DDstate = true;

        if (!this.IsDatatableInit)
            this.DDopenInitDT();
        else {
            EbMakeValid(`#${this.ComboObj.EbSid_CtxId}Container`, `#${this.ComboObj.EbSid_CtxId}Wraper`);
            setTimeout(function () {
                this.RemoveRowFocusStyle();
                let $cell = $(this.DTSelector + ' tbody tr:eq(0) td:eq(0)');
                if (this.datatable)
                    this.datatable.Api.cell($cell).focus();
                this.ApplyRowFocusStyle($cell.closest("tr"));
            }.bind(this), 1);
        }

        this.V_updateCk();
        //setTimeout(function(){ $('#' + this.name + 'container table:eq(0)').css('width', $( '#' + this.name + 'container table:eq(1)').css('width') ); },520);
        this.colAdjust();
    };

    this.colAdjust = function () {
        if (this.datatable)
            $('#' + this.name + 'tbl').DataTable().columns.adjust().draw();
    }.bind(this);

    this.V_updateCk = function () {// API..............
        $("#" + this.ComboObj.EbSid_CtxId + 'DDdiv table:eq(1) tbody [type=checkbox]').each(function (i, chkbx) {
            let $row = $(chkbx).closest('tr');
            let datas = $(this.DTSelector).DataTable().row($row).data();
            if (this.Vobj.valueMembers.contains(datas[this.VMindex]))
                $(chkbx).prop('checked', true);
            else
                $(chkbx).prop('checked', false);
        }.bind(this));
        // raise error msg
        setTimeout(this.RaiseErrIf.bind(this), 30);
    };

    this.RaiseErrIf = function () {
        if (this.Vobj.valueMembers.length !== this.Vobj.displayMembers[this.dmNames[0]].length) {
            //alert('valueMember and displayMembers length miss match found !!!!');
            //console.error('Ebselect error : valueMember and displayMembers length miss match found !!!!');
            console.eb_warn('valueMember and displayMembers length miss match found !!!!');
            if (this.Vobj.valueMember)
                console.log('valueMembers=' + this.Vobj.valueMember);
            if (this.Vobj.displayMembers && this.Vobj.displayMembers[this.dmNames[0]])
                console.log('displayMember[0] = ' + this.Vobj.displayMembers[this.dmNames[0]]);
        }
    };

    this.arrowSelectionStylingFcs = function (e, datatable, cell, originalEvent) {
        $(this.DTSelector + " ." + this.name + "tbl_select").blur();
        $(":focus").blur();
        let row = datatable.row(cell.index().row);
        let $tr = $(row.nodes());
        this.ApplyRowFocusStyle($tr);
    }.bind(this);

    this.arrowSelectionStylingBlr = function (e, datatable, cell) {
        let row = datatable.row(cell.index().row);
        let $tr = $(row.nodes());
        this.RemoveRowFocusStyle($tr);
    }.bind(this);

    this.ApplyRowFocusStyle = function ($tr) {
        $tr.find('.focus').removeClass('focus');
        setTimeout(function () {
            $tr.addClass('selected');
        }, 10);
    };

    this.RemoveRowFocusStyle = function ($tr) {
        $tr = $tr || $(this.DTSelector + " tr.selected");
        if ($tr.length === 0)
            return;
        $tr.removeClass('selected');
    };

    this.tagCloseBtnHand = function (e) {
        this.ClosedItem = this.Vobj.valueMembers.splice(delid(), 1)[0];
        if (this.ComboObj.MultiSelect)
            $(this.DTSelector + " [type=checkbox][value='" + this.ClosedItem + "']").prop("checked", false);
        //else
        //    var _v = this.Vobj.valueMembers.splice(delid(), 1);
        $.each(this.dmNames, function (i, name) {
            this.Vobj.displayMembers[name].splice(delid(), 1);
        }.bind(this));
        this.clearSearchBox();
        this.filterArray = [];
        if (this.datatable) {
            this.datatable.columnSearch = [];
            //this.datatable.Api.ajax.reload();
            this.reloadDT();
        }
    };

    this.reloadDT = function () {
        this.datatable.Api.draw(this.colAdjust);
    }.bind(this);

    this.checkBxClickEventHand = function (e) {
        this.$curEventTarget = $(e.target);
        let $row = $(e.target).closest('tr');
        //let datas = $(this.DTSelector).DataTable().row($row).data();
        let rowindex = this.datatable.Api.page.info().start + $row.index();
        //let datas = this.datatable.data[rowindex];
        let datas = this.datatable.Api.row($row).data();


        if (!(this.Vobj.valueMembers.contains(datas[this.VMindex]))) {
            if (this.maxLimit === 0 || this.Vobj.valueMembers.length !== this.maxLimit) {
                this.Vobj.valueMembers.push(datas[this.VMindex]);
                $.each(this.dmNames, this.setDmValues.bind(this));
                $(e.target).prop('checked', true);
                this.clearSearchBox();
            }
            else
                $(e.target).prop('checked', false);
        }
        else {
            this.delDMs($(e.target));
            $(e.target).prop('checked', false);
        }
    };

    this.delDMs = function ($e) {
        let $row = $e.closest('tr');
        let datas = $(this.DTSelector).DataTable().row($row).data();
        let vmIdx2del = this.Vobj.valueMembers.indexOf(datas[this.VMindex]);
        this.Vobj.valueMembers.splice(vmIdx2del, 1);
        $.each(this.dmNames, function (i) { this.Vobj.displayMembers[this.dmNames[i]].splice(vmIdx2del, 1); }.bind(this));
    };

    this.hideDDclickOutside = function (e) {
        let container = $('#' + this.name + 'DDdiv');
        let container1 = $('#' + this.name + 'Container');
        let _name = this.ComboObj.EbSid_CtxId;
        if (this.Vobj.DDstate === true && (!container.is(e.target) && container.has(e.target).length === 0) && (!container1.is(e.target) && container1.has(e.target).length === 0)) {
            this.Vobj.hideDD();/////
            this.required_min_Check();
        }
    };

    this.required_min_Check = function () {
        let reqNotOK = false;
        let minLimitNotOk = false;

        let contId = (this.ComboObj.constructor.name === "DGPowerSelectColumn") ? `#td_${this.ComboObj.EbSid_CtxId}` : `#${this.ComboObj.EbSid_CtxId}Container`;// to handle special case of DG powerselect 
        let wraperId = `#${this.ComboObj.EbSid_CtxId}Wraper`;
        let msg = "This field is required";

        if (this.required && this.Vobj.valueMembers.length === 0) {
            reqNotOK = true;
        }
        else if (this.Vobj.valueMembers.length < this.minLimit && this.minLimit !== 0) {
            minLimitNotOk = true;
            msg = 'This field  require minimum ' + this.minLimit + ' values';
        }

        if (reqNotOK || minLimitNotOk) {
            //if (this.IsSearchBoxFocused || this.IsDatatableInit)// if countrol is touched
            EbMakeInvalid(contId, wraperId, msg);
        }
        else {
            EbMakeValid(contId, wraperId);
        }
    }.bind(this);

    this.getDisplayMemberModel = function () {
        let newDMs = {};
        let DmClone = removePropsOfType($.extend(true, {}, this.Vobj.displayMembers), 'function');
        let ValueMembers = this.Vobj.valueMembers.toString().split(",");
        for (var i = 0; i < ValueMembers.length; i++) {
            let vm = ValueMembers[i];
            newDMs[vm] = {};
            for (let j = 0; j < this.dmNames.length; j++) {
                let dmName = this.dmNames[j];
                newDMs[vm][dmName] = DmClone[dmName][i];
            }

        }

        return newDMs;
    };

    this.reloadWithParams = function () {
        ;
    };

    this.appendDD2Body = function () {
        setTimeout(function () {
            let contWidth = $('#' + this.name + 'Container').width();
            contWidth = (this.ComboObj.DropdownWidth === 0) ? contWidth : (this.ComboObj.DropdownWidth / 100) * contWidth;
            let $DDdiv = $("#" + this.containerId);
            let $parentCont = $DDdiv.parentsUntil('form').last();
            if ($parentCont.attr('ctype') === "TabControl") {
                $DDdiv.attr('drp_parent', 'TabControl');
            }
            $DDdiv.show();
            let tbl_cod = $DDdiv.offset();
            let tbl_height = $DDdiv.height();
            let div_detach = $DDdiv.detach();
            div_detach.attr({ "detch_select": true, "par_ebsid": this.name, "MultiSelect": this.ComboObj.MultiSelect, "objtype": this.ComboObj.ObjType });
            let xtra_wdth = tbl_cod.left;
            let brow_wdth = $(window).width();
            if ((contWidth + tbl_cod.left) > brow_wdth)
                xtra_wdth = tbl_cod.left + (brow_wdth - (contWidth + tbl_cod.left));
            let $form_div = $('#' + this.name).closest("[eb-root-obj-container]");

            let top = tbl_cod.top;
            let scrollTop = $form_div.scrollTop();
            let scrollH = $form_div.prop("scrollHeight");
            if (scrollTop + tbl_cod.top + tbl_height > scrollH && scrollTop + tbl_cod.top - 60 > tbl_height) {
                top = tbl_cod.top - tbl_height - 60;
                $DDdiv.css("box-shadow", "0 -6px 12px rgba(0,0,0,.175), 0 0 0 1px rgba(204, 204, 204, 0.41)");
                if (ebcontext.renderContext !== "WebForm")
                    top += 38;
            }
            div_detach.appendTo($form_div).offset({ top: top, left: xtra_wdth }).width(contWidth);
            scrollDropDown();
        }.bind(this), 30);
    };

    this.Renderselect();
};
var InitControls = function (option) {

    if (option) {
        this.Renderer = option;
        this.Cid = option.Cid;
        this.Env = option.Env;
    }

    this.init = function (control, ctrlOpts) {
        if (this[control.ObjType] !== undefined) {
            return this[control.ObjType](control, ctrlOpts);
        }
    };

    this.FileUploader = function (ctrl, ctrlOpts) {
        let files = [];
        let catTitle = [];
        let customMenu = [{ name: "Delete", icon: "fa-trash" }];
        let fileType = this.getKeyByValue(EbEnums.FileClass, ctrl.FileType.toString());
        $.each(ctrl.Categories.$values, function (i, obj) {
            catTitle.push(obj.CategoryTitle);
        }.bind(catTitle));

        if (ctrlOpts.FormDataExtdObj.val !== null && ctrlOpts.FormDataExtdObj.val[ctrl.Name || ctrl.EbSid] !== undefined) {
            files = JSON.parse(ctrlOpts.FormDataExtdObj.val[ctrl.Name || ctrl.EbSid][0].Columns[0].Value);
        }

        if (fileType === 'image') {
            $.each(ctrlOpts.DpControlsList, function (i, obj) {
                customMenu.push({ name: "Set as " + obj.Label, icon: "fa-user" });
            });
        }

        let imgup = new FUPFormControl({
            Type: fileType,
            ShowGallery: true,
            Categories: catTitle,
            Files: files,
            TenantId: this.Cid,
            SolutionId: this.Cid,
            Container: ctrl.EbSid,
            Multiple: ctrl.IsMultipleUpload,
            ServerEventUrl: this.Env === "Production" ? 'https://se.expressbase.com' : 'https://se.eb-test.cloud',
            EnableTag: ctrl.EnableTag,
            EnableCrop: ctrl.EnableCrop,
            MaxSize: ctrl.MaxFileSize,
            CustomMenu: customMenu,
            DisableUpload: ctrl.DisableUpload,
            HideEmptyCategory: ctrl.HideEmptyCategory
        });

        uploadedFileRefList[ctrl.Name] = this.getInitFileIds(files);

        imgup.uploadSuccess = function (fileid) {
            if (uploadedFileRefList[ctrl.Name].indexOf(fileid) === -1)
                uploadedFileRefList[ctrl.Name].push(fileid);
        };

        imgup.windowClose = function () {
            if (uploadedFileRefList[ctrl.Name].length > 0)
                EbMessage("show", { Message: 'Changes Affect only if Form is Saved', AutoHide: true, Background: '#0000aa' });
        };

        imgup.customTrigger = function (DpControlsList, name, refids) {
            if (name === "Delete") {
                if (name === "Delete") {
                    EbDialog("show",
                        {
                            Message: "Are you sure? Changes Affect only if Form is Saved.",
                            Buttons: {
                                "Yes": {
                                    Background: "green",
                                    Align: "left",
                                    FontColor: "white;"
                                },
                                "No": {
                                    Background: "violet",
                                    Align: "right",
                                    FontColor: "white;"
                                }
                            },
                            CallBack: function (name) {
                                if (name === "Yes") {
                                    let initLen = uploadedFileRefList[ctrl.Name].length;
                                    for (let i = 0; i < refids.length; i++) {
                                        let index = uploadedFileRefList[ctrl.Name].indexOf(refids[i]);
                                        if (index !== -1) {
                                            uploadedFileRefList[ctrl.Name].splice(index, 1);
                                        }
                                    }
                                    if (initLen > uploadedFileRefList[ctrl.Name].length) {
                                        imgup.deleteFromGallery(refids);
                                        EbMessage("show", { Message: 'Changes Affect only if Form is Saved', AutoHide: true, Background: '#0000aa' });
                                    }
                                    imgup.customMenuCompleted("Delete", refids);
                                }
                            }
                        });
                }
            }
            else {
                $.each(DpControlsList, function (i, dpObj) {
                    if (name === 'Set as ' + dpObj.Label) {
                        EbDialog("show",
                            {
                                Message: "Are you sure? Changes Affect only if Form is Saved.",
                                Buttons: {
                                    "Yes": {
                                        Background: "green",
                                        Align: "left",
                                        FontColor: "white;"
                                    },
                                    "No": {
                                        Background: "violet",
                                        Align: "right",
                                        FontColor: "white;"
                                    }
                                },
                                CallBack: function (name) {
                                    if (name === "Yes") {
                                        if (refids.length > 0) {
                                            dpObj.setValue(refids[0].toString());/////////////need to handle when multiple images selected 
                                        }
                                    }
                                }.bind()
                            });
                    }
                });
            }

        }.bind(this, ctrlOpts.DpControlsList);

    };

    //edit by amal for signature pad
    this.SignaturePad = function (ctrl, ctrlOpts) {
        var sign_pad = new SignaturePad({
            Container: "#" + ctrl.EbSid + "Wraper"
        });

        sign_pad.getResult = function (b64, vendor) {
            //alert(b64);
        };
    };

    this.getInitFileIds = function (files) {
        let ids = [];
        for (let i = 0; i < files.length; i++)
            ids.push(files[i].FileRefId);
        return ids;
    };

    this.DGUserControlColumn = function (ctrl, ctrlOpts) {
        ctrl.__Col.__DGUCC.initForctrl(ctrl);
    };

    this.SetDateFormatter = function () {
        $.datetimepicker.setDateFormatter({
            parseDate: function (date, format) {
                var d = moment(date, format);
                return d.isValid() ? d.toDate() : false;
            },

            formatDate: function (date, format) {
                return moment(date).format(format);
            }
        });
    };

    this.SetDateFormatter();

    this.Date = function (ctrl, ctrlOpts) {
        //setTimeout(function () {
        let t0 = performance.now();
        let t1 = performance.now();
        let formObject = ctrlOpts.formObject;
        let userObject = ebcontext.user;
        let $input = $("#" + ctrl.EbSid_CtxId);
        if (ctrl.ShowDateAs_ === 1) {
            $input.MonthPicker({
                Button: $input.next().removeAttr("onclick"),
                OnAfterChooseMonth: function () { $input.trigger("change"); }
            });
            $input.MonthPicker('option', 'ShowOn', 'both');
            $input.MonthPicker('option', 'UseInputMask', true);

            //ctrl.setValue(moment(ebcontext.user.Preference.ShortDate, ebcontext.user.Preference.ShortDatePattern).format('MM/YYYY'));
        }
        else if (ctrl.ShowDateAs_ === 2) {
            $input.yearpicker({
                year: parseInt(ctrl.DataVals.Value),
                startYear: 1800,
                endYear: 2200
            });
        }
        else {
            let sdp = userObject.Preference.ShortDatePattern;//"DD-MM-YYYY";
            let stp = userObject.Preference.ShortTimePattern;//"HH mm"

            if (typeof ctrl === typeof "")
                ctrl = { name: ctrl, ebDateType: 5 };
            var settings = { timepicker: false };

            if (ctrl.EbDateType === 5) { //Date
                $input.datetimepicker({
                    format: sdp,
                    formatTime: stp,
                    formatDate: sdp,
                    timepicker: false,
                    datepicker: true,
                    mask: true
                });
                //$input.val(userObject.Preference.ShortDate);
            }
            else if (ctrl.EbDateType === 17) { //Time
                $input.datetimepicker({
                    format: stp,
                    formatTime: stp,
                    formatDate: sdp,
                    timepicker: true,
                    datepicker: false
                });
                //$input.val(userObject.Preference.ShortTime);
            }
            else {
                $input.datetimepicker({ //DateTime
                    format: sdp + " " + stp,
                    formatTime: stp,
                    formatDate: sdp,
                    timepicker: true,
                    datepicker: true
                });
                //$input.val(userObject.Preference.ShortDate + " " + userObject.Preference.ShortTime);
            }


            //settings.minDate = ctrl.Min;
            //settings.maxDate = ctrl.Max;

            //if (ctrlOpts.source === "webform") {
            //let maskPattern = "DD-MM-YYYY";
            //$input.attr("placeholder", maskPattern);
            //$input.inputmask(maskPattern);               

            //    if (!ctrl.IsNullable)
            //        $input.val(userObject.Preference.ShortDate);
            //}

            //$input.mask(ctrl.MaskPattern || '00/00/0000');
            $input.next(".input-group-addon").off('click').on('click', function () { $input.datetimepicker('show'); }.bind(this));
        }
        if (ctrl.IsNullable) {
            //if (!($('#' + ctrl.EbSid_CtxId).siblings('.nullable-check').find('input[type=checkbox]').prop('checked')))
            //    $input.val('');
            //else
            $('#' + ctrl.EbSid_CtxId).siblings('.nullable-check').find('input[type=checkbox]').attr('checked', false);
            $input.val("");
            $input.prev(".nullable-check").find("input[type='checkbox']").off('change').on('change', this.toggleNullableCheck.bind(this, ctrl));//created by amal
            $input.prop('disabled', true).next(".input-group-addon").css('pointer-events', 'none').css('color', '#999');
        }
        else if (ctrl.ShowDateAs_ !== 2)
            this.setCurrentDate(ctrl, $input);

        t1 = performance.now();
        //console.dev_log("date 2 init --- took " + (t1 - t0) + " milliseconds.");

        //}.bind(this), 0);
    };

    //created by amal
    this.toggleNullableCheck = function (ctrl) {
        let $ctrl = $(event.target).closest("input[type='checkbox']");
        if ($ctrl.is(":checked")) {
            if ($ctrl.closest(".input-group").find("input[type='text']").val() === "")
                //$ctrl.closest(".input-group").find("input[type='text']").val(ebcontext.user.Preference.ShortDate);
                this.setCurrentDate(ctrl, $ctrl.closest(".input-group").find("input[type='text']"));
            $ctrl.closest(".input-group").find("input[type='text']").prop('disabled', false).next(".input-group-addon").css('pointer-events', 'auto').css('color', 'inherit');
            //ctrl.DoNotPersist = false;
        }
        else {
            $ctrl.closest(".input-group").find("input[type='text']").val("").prop('disabled', true).next(".input-group-addon").css('pointer-events', 'none').css('color', '#999');;
            //ctrl.DoNotPersist = true;
        }
    };

    this.setCurrentDate = function (ctrl, $input) {
        let val;
        if (ctrl.ShowDateAs_ === 1) {
            val = moment(ebcontext.user.Preference.ShortDate, ebcontext.user.Preference.ShortDatePattern).format('MM/YYYY');
        }
        else if (ctrl.EbDateType === 5) { //Date
            val = moment(ebcontext.user.Preference.ShortDate, ebcontext.user.Preference.ShortDatePattern).format('YYYY-MM-DD');
        }
        else if (ctrl.EbDateType === 17) { //Time
            val = moment(ebcontext.user.Preference.ShortTime, ebcontext.user.Preference.ShortTimePattern).format('HH:mm:ss');
        }
        else {
            val = moment(ebcontext.user.Preference.ShortDate + " " + ebcontext.user.Preference.ShortTime, ebcontext.user.Preference.ShortDatePattern + " " + ebcontext.user.Preference.ShortTimePattern).format('YYYY-MM-DD HH:mm:ss');
        }
        if (ctrl.DataVals.Value !== null && ctrl.DataVals.Value !== "" && ctrl.DataVals.Value !== undefined)
            ctrl.setValue(ctrl.DataVals.Value);
        else
            ctrl.setValue(val);
    };

    this.SimpleSelect = function (ctrl) {
        let $input = $("#" + ctrl.EbSid_CtxId);

        $input.on('loaded.bs.select	', function (e, clickedIndex, isSelected, previousValue) {
            $(e.target).closest(".dropdown.bootstrap-select").attr("id", ctrl.EbSid_CtxId + "_dd"); // id added for test frame work
        });

        $input.selectpicker({
            dropupAuto: false
        });


        let $DD = $input.siblings(".dropdown-menu[role='combobox']");
        $DD.addClass("dd_of_" + ctrl.EbSid_CtxId);
        $DD.find(".inner[role='listbox']").css({ "height": ctrl.DropdownHeight, "overflow-y": "scroll" });

        //code review..... to set dropdown on body
        $("#" + ctrl.EbSid_CtxId).on("shown.bs.select", function (e) {
            if (this.Renderer.rendererName !== "Bot") {
                let $el = $(e.target);
                if ($el[0].isOutside !== true) {
                    let $drpdwn = $('.dd_of_' + ctrl.EbSid_CtxId);
                    let initDDwidth = $drpdwn.width();
                    let ofsetval = $drpdwn.offset();
                    let $divclone = ($("#" + ctrl.EbSid_CtxId).parent().clone().empty()).addClass("detch_select").attr({ "detch_select": true, "par_ebsid": ctrl.EbSid_CtxId, "MultiSelect": ctrl.MultiSelect, "objtype": ctrl.ObjType });
                    let $div_detached = $drpdwn.detach();
                    let $form_div = $(e.target).closest("[eb-root-obj-container]");
                    $div_detached.appendTo($form_div).wrap($divclone);
                    $div_detached.width(initDDwidth);
                    $el[0].isOutside = true;
                    $div_detached.offset({ top: (ofsetval.top), left: ofsetval.left });
                    $div_detached.css("min-width", "unset");// to override bootstarp min-width 100% only after -appendTo-

                }
                //to set position of dropdrown just below selectpicker btn
                else {
                    let $outdrpdwn = $('.dd_of_' + ctrl.EbSid_CtxId);
                    let ddOfset = ($(e.target)).offsetParent().offset();
                    let tgHght = ($(e.target)).offsetParent().height();
                    $outdrpdwn.parent().addClass('open');
                    $outdrpdwn.offset({ top: (ddOfset.top + tgHght), left: ddOfset.left });
                    $outdrpdwn.children("[role='listbox']").scrollTo($outdrpdwn.find("li.active"), { offset: ($outdrpdwn.children("[role='listbox']").height() / -2) + 11.5 });
                }
            }
        }.bind(this));
        if (ctrl.DataVals.Value !== null || ctrl.DataVals.Value !== undefined)
            ctrl.setValue(ctrl.DataVals.Value);
    };

    this.BooleanSelect = function (ctrl) {
        this.SimpleSelect(ctrl);
    };

    // http://davidstutz.de/bootstrap-multiselect
    this.UserLocation = function (ctrl) {
        let $input = $("#" + ctrl.EbSid_CtxId);
        $input.multiselect({
            includeSelectAllOption: true
        });

        $("body").on("click", "#" + ctrl.EbSid_CtxId + "_checkbox", this.UserLocationCheckboxChanged.bind(this, ctrl));

        if (ebcontext.user.Roles.findIndex(x => (x === "SolutionOwner" || x === "SolutionDeveloper" || x === "SolutionAdmin")) > -1) {
            $('#' + ctrl.EbSid_CtxId + "_checkbox").trigger('click');
        }
        else {
            $('#' + ctrl.EbSid_CtxId + "_checkbox_div").hide();
            if (ebcontext.user.wc === "dc")
                $('#' + ctrl.EbSid_CtxId).next('div').children().find('li:eq(1)').children().find("input").trigger('click');
            else if (ebcontext.user.wc === "uc") {
                if (ctrl.LoadCurrentLocation)
                    $('#' + ctrl.EbSid_CtxId).next('div').children().find('[value=' + ebcontext.locations.CurrentLocObj.LocId + ']').trigger('click');
                else
                    $('#' + ctrl.EbSid_CtxId).next('div').children().find('li:eq(1)').children().find("input").trigger('click');
            }
        }

        ctrl.DataVals.Value = ctrl.getValueFromDOM();
    };

    this.UserLocationCheckboxChanged = function (ctrl) {
        if ($(event.target).prop("checked")) {
            $('#' + ctrl.EbSid_CtxId).next('div').children().find('li:eq(0)').children().find("input").trigger('click');
            $('#' + ctrl.EbSid_CtxId).next('div').find("*").attr("disabled", "disabled").off('click');
        }
        else {
            $('#' + ctrl.EbSid_CtxId).next('div').find("*").removeAttr('disabled').on('click');
            if ($('#' + ctrl.EbSid_CtxId).next('div').children().find('li:eq(0)').children().find("input").prop("checked"))
                $('#' + ctrl.EbSid_CtxId).next('div').children().find('li:eq(0)').children().find("input").trigger('click');

        }
    };

    this.LocationSelector = function (ctrl) {
        let $input = "#" + ctrl.EbSid_CtxId;
        ctrl.LocData.$values.map(e => delete e.$type);

        this.DDTreeApi = simTree({
            el: $input,
            data: ctrl.LocData.$values,
            check: true,
            //linkParent: true,
            onClick: this.ClickLocationSelector.bind(this, ctrl),
            //onChange: this.ChangeLocationSelector.bind(this)
        });

        $("body").on("click", "#" + ctrl.EbSid_CtxId + "_checkbox", this.LocationSelectorCheckboxChanged.bind(this, ctrl));
        $('#' + ctrl.EbSid_CtxId + "_button").off("click").on("click", function () {
            $('#' + ctrl.EbSid_CtxId).toggle();
        });
        this.DDTreeApi.data.map(el => (el.children) ? $(`#${ctrl.EbSid_CtxId} [data-id='${el.id}']`).addClass("parentNode") : $(`[data-id='${el.id}']`).addClass("childNode"));
        $.contextMenu({
            selector: ".parentNode",
            events: {
                show: function (options) {
                    if ($(event.target).closest("li").hasClass("childNode"))
                        return false;
                }
            },
            items: {
                //    "SelectGroup": { name: "Select Group", icon: "fa-check-square-o", callback: this.SelectGroup.bind(this) },
                //    "SelectChildren": { name: "Select Children", icon: "fa-check-square-o", callback: this.SelectChildren.bind(this) },
                "SelectAll": { name: "Select All", icon: "fa-check-square-o", callback: this.SelectAll.bind(this) },
                "DeSelectAll": { name: "DeSelect All", icon: "fa-square-o", callback: this.DeSelectAll.bind(this) }
            }
        });
        if (ebcontext.user.Roles.findIndex(x => (x === "SolutionOwner" || x === "SolutionDeveloper" || x === "SolutionAdmin")) > -1) {
            $('#' + ctrl.EbSid_CtxId + "_checkbox").trigger('click');
        }
        else {
            $('#' + ctrl.EbSid_CtxId + "_checkbox_div").hide();
            if (ebcontext.user.wc === "uc") {
                if (ctrl.LoadCurrentLocation)
                    $('#' + ctrl.EbSid_CtxId).find('[data-id=' + ebcontext.locations.CurrentLocObj.LocId + '] .sim-tree-checkbox').eq(0).trigger('click');
            }
        }
        ctrl.DataVals.Value = ctrl.getValueFromDOM();
    };

    this.LocationSelectorCheckboxChanged = function (ctrl) {
        if ($(event.target).prop("checked")) {
            $('#' + ctrl.EbSid_CtxId).hide();
            //$("[data-level='1']").each(function (i, obj) {
            //    if (!$(obj).find(".sim-tree-checkbox").eq(0).hasClass("checked"))
            //        $(obj).find(".sim-tree-checkbox").eq(0).trigger("click");
            //});
            $("#" + ctrl.EbSid_CtxId + " .sim-tree-checkbox").toArray()
                .map(el => $(el).hasClass("checked") ? console.log("checked") : $(el).trigger("click"));
            $('#' + ctrl.EbSid_CtxId + "_button").attr("disabled", "disabled");
        }
        else {
            $('#' + ctrl.EbSid_CtxId + "_button").removeAttr('disabled');
            $('#' + ctrl.EbSid_CtxId).show();
            //$("[data-level='1']").each(function (i, obj) {
            //    if ($(obj).find(".sim-tree-checkbox").eq(0).hasClass("checked"))
            //        $(obj).find(".sim-tree-checkbox").eq(0).trigger("click");
            //});
            $("#" + ctrl.EbSid_CtxId + " .sim-tree-checkbox").toArray()
                .map(el => $(el).hasClass("checked") ? $(el).trigger("click") : console.log("Unchecked"));
        }
    };

    this.ClickLocationSelector = function (ctrl, item, x, y) {
        if (this.DDTreeApi) {
            if (item.length === this.DDTreeApi.data.length)
                $("#" + ctrl.EbSid_CtxId + "_text").text(`All Selected (${item.length})`);
            else if (item.length === 1)
                $("#" + ctrl.EbSid_CtxId + "_text").text(`${item[0].name}`);
            else if (item.length === 0)
                $("#" + ctrl.EbSid_CtxId + "_text").text(`None Selected`);
            else
                $("#" + ctrl.EbSid_CtxId + "_text").text(`${item.length} Selected`);
            let value = item.map(obj => obj.id).join(",");
            $("#" + ctrl.EbSid_CtxId).val(value).trigger("cssClassChanged");
        }
    };

    this.SelectAll = function (key, opt, event) {
        opt.$trigger.find(".sim-tree-checkbox").toArray()
            .map(el => $(el).hasClass("checked") ? console.log("checked") : $(el).trigger("click"));
    };

    this.DeSelectAll = function (key, opt, event) {
        opt.$trigger.find(".sim-tree-checkbox").toArray()
            .map(el => $(el).hasClass("checked") ? $(el).trigger("click") : console.log("Unchecked"));
    };

    this.SelectGroup = function (key, opt, event) {

    };

    this.ChartControl = function (ctrl, ctrlOpts) {
        let o = new Object();
        o.tableId = "chart" + ctrl.EbSid_CtxId;
        o.dvObject = JSON.parse(ctrl.ChartVisualizationJson);
        this.chartApi = new EbBasicChart(o);
    };

    this.TVcontrol = function (ctrl, ctrlOpts) {
        let o = new Object();
        o.tableId = ctrl.EbSid_CtxId;
        o.showCheckboxColumn = false;
        o.showFilterRow = false;
        o.IsPaging = false;
        o.Source = this.Renderer.rendererName;
        o.scrollHeight = ctrl.Height - 34.62;
        o.dvObject = JSON.parse(ctrl.TableVisualizationJson);

        if (!ctrl.__filterValues)
            ctrl.__filterValues = [];
        if (ctrl.ParamsList) {
            paramsList = ctrl.ParamsList.$values.map(function (obj) { return "form." + obj.Name; });
            for (let i = 0; i < paramsList.length; i++) {
                let depCtrl_s = paramsList[i];
                let depCtrl = this.Renderer.formObject.__getCtrlByPath(depCtrl_s);
                if (!getObjByval(ctrl.__filterValues, "Name", depCtrl_s.replace("form.", ""))) { // bot related check
                    let val = '';
                    let ebDbType = 11;
                    let name = "";
                    if (depCtrl_s === "form.eb_loc_id") {
                        val = (ebcontext.locations) ? ebcontext.locations.getCurrent() : 1;
                        name = "eb_loc_id";
                    }
                    else if (depCtrl_s === "form.eb_currentuser_id") {
                        val = ebcontext.user.UserId;
                        name = "eb_currentuser_id";
                    }
                    else {
                        val = depCtrl.getValue();
                        name = depCtrl.Name;
                        ebDbType = depCtrl.EbDbType;
                    }

                    ctrl.__filterValues.push(new fltr_obj(ebDbType, name, val));
                }
            }
            o.filterValues = btoa(unescape(encodeURIComponent(JSON.stringify(ctrl.__filterValues))));
        }
        ctrl.initializer = new EbCommonDataTable(o);
        ctrl.initializer.reloadTV = ctrl.initializer.Api.ajax.reload;

        ctrl.reloadWithParam = function (depCtrl) {
            if (depCtrl) {
                let val = depCtrl.getValue();
                let filterObj = getObjByval(ctrl.__filterValues, "Name", depCtrl.Name);
                filterObj.Value = val;
            }

            ctrl.initializer.filterValues = ctrl.__filterValues;
            ctrl.initializer.Api.ajax.reload();
        };
    };

    this.CalendarControl = function (ctrl) {
        console.log("eached");
        let userObject = ebcontext.user;
        let sdp = userObject.Preference.ShortDatePattern;//"DD-MM-YYYY";
        let stp = userObject.Preference.ShortTimePattern;//"HH mm"
        let $input = $("#" + ctrl.EbSid_CtxId);

        $input.find("#date").datetimepicker({
            format: sdp,
            formatTime: stp,
            formatDate: sdp,
            timepicker: false,
            datepicker: true,
            mask: true
        });
        $input.find("#month").MonthPicker({ Button: $input.children().find("#month").next().removeAttr("onclick") });
        $input.find("#month").MonthPicker('option', 'ShowOn', 'both');
        $input.find("#month").MonthPicker('option', 'UseInputMask', true);
        $input.find("#month").MonthPicker({
            OnAfterChooseMonth: this.SetDateFromDateTo.bind(this, $input)
        });
        $input.find("#year").datetimepickers({
            format: "YYYY",
            viewMode: "years",
        });

        $input.find("#date").next(".input-group-addon").off('click').on('click', function () {
            $input.find("#date").datetimepicker('show');
        });

        $input.find("select").on('change', function (e) {
            $(e.target).siblings("button").find(" .filter-option").text(this.value);
            $input.find("select option:not([value='" + this.value + "'])").removeAttr("selected");
            if (this.value === "Hourly") {
                $input.children("[name=date]").show();
                $input.children("[name=month]").hide();
                $input.children("[name=year]").hide();
            }
            else if (this.value === "DayWise" || this.value === "Weekely" || this.value === "Fortnightly") {
                $input.children("[name=month]").show();
                $input.children("[name=date]").hide();
                $input.children("[name=year]").hide();
            }
            else if (this.value === "Monthly" || this.value === "Quarterly" || this.value === "HalfYearly") {
                $input.children("[name=year]").show();
                $input.children("[name=date]").hide();
                $input.children("[name=month]").hide();
            }
        });

        $input.find("#date").change(this.SetDateFromDateTo.bind(this, $input));

        $input.find("#year").on('dp.change', this.SetDateFromDateTo.bind(this, $input));

        $input.find("select option[value='Hourly']").attr("selected", "selected");
        $input.find("select").trigger("change");
    };

    this.SetDateFromDateTo = function ($input, e) {
        if ($input.find("select").val() === "Hourly") {
            let _date = $input.find("#date").val();
            _date = moment(_date, 'DD-MM-YYYY').format('YYYY-MM-DD');
            $input.find("#datefrom").val(_date);
            $input.find("#dateto").val(_date).trigger("change");
        }
        else if ($input.find("select").val() === "Weekely" || $input.find("select").val() === "DayWise") {
            let _month_year = $input.find("#month").val();
            let month = _month_year.split("/")[0];
            let year = _month_year.split("/")[1];
            let startDate = moment([year, month - 1]);
            let endDate = moment(startDate).endOf('month');
            $input.find("#datefrom").val(startDate.format("YYYY-MM-DD"));
            $input.find("#dateto").val(endDate.format("YYYY-MM-DD")).trigger("change");
        }
        else if ($input.find("select").val() === "Monthly" || $input.find("select").val() === "Quarterly" || $input.find("select").val() === "HalfYearly") {
            let year = $input.find("#year").val();
            startDate = moment([year]);
            endDate = moment([year]).endOf('year');
            $input.find("#datefrom").val(startDate.format("YYYY-MM-DD"));
            $input.find("#dateto").val(endDate.format("YYYY-MM-DD")).trigger("change");
        }

    };

    this.InputGeoLocation = function (ctrl) {
        ebcontext.userLoc = { lat: 0, long: 0 };
        if (typeof _rowId === 'undefined' || _rowId === 0) {
            navigator.geolocation.getCurrentPosition(function (position) {
                $('#' + ctrl.EbSid_CtxId).locationpicker('location', {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            }.bind(this));
        }
        this.InitMap4inpG(ctrl);
        $("#" + ctrl.EbSid_CtxId + "_Cont").find(".loc-close").on("click", (e) => $(event.target).closest('.locinp-cont').find('.locinp').val(''));
        $("#" + ctrl.EbSid_CtxId + "_Cont").find(".locinp").on("focus", (e) => { $(e.target).select(); });
    };

    this.InitMap4inpG = function (ctrl) {
        let $input = $("#" + ctrl.EbSid_CtxId);
        var name = ctrl.EbSid;
        $input.locationpicker({
            location: {
                latitude: ebcontext.userLoc.lat,
                longitude: ebcontext.userLoc.long
            },
            radius: 5,
            zoom: 18,
            inputBinding: {
                latitudeInput: $('#' + name + 'lat'),
                longitudeInput: $('#' + name + 'long'),
                locationNameInput: $('#' + name + 'address')
            },
            enableAutocomplete: true,
            autocompleteOptions: {
                types: ['(cities)'],
                componentRestrictions: { country: 'fr' }
            },
            onchanged: function (currentLocation, radius, isMarkerDropped) {
                let ctrl = this;
                if (!ctrl.__isJustSetValue) {
                    if (ctrl.__ebonchangeFns) {
                        for (let i = 0; i < ctrl.__ebonchangeFns.length; i++) {
                            ctrl.__ebonchangeFns[i]();
                        }
                    }
                }
                else
                    ctrl.__isJustSetValue = false;////////////////////////////////////////////????????????????????????????
            }.bind(ctrl)
        });
        //$(`#${name}_Cont .choose-btn`).click(this.Renderer.chooseClick);

        if (this.Renderer.rendererName === "Bot")
            this.bindMapResize(ctrl);

    };

    this.Locations = function (ctrl) {
        let EbSid = ctrl.EbSid;
        if (ctrl.ShowTabed) {
            $(`#${EbSid} .loc-opt-btn`).off("click").on("click", function (e) {
                let $optBtn = $(e.target);
                let loc = $optBtn.attr("for");
                let ctrlArr = $.grep(ctrl.LocationCollection, function (ctrl, i) { return ctrl.name === loc; });
                let ctrl = ctrlArr[0];
                let $locDiv = $(`#${ctrl.Name}`);
                $(`#${EbSid} .loc-opt-btn`).css("border-bottom", "solid 2px transparent").css("font-weight", "normal").css("color", "#868585");
                $optBtn.css("border-bottom", "solid 2px #31d031").css("font-weight", "bold").css("color", "#333");
                if ($locDiv.closest(".location-box").css("display") === "none") {
                    $(`#${EbSid} .location-box`).hide(10);
                    $locDiv.closest(".location-box").show(10,
                        function () {
                            if ($locDiv.children().length === 0)
                                this.initMap(ctrl);
                        }.bind(this));
                }

            }.bind(this));
            $(`#${EbSid} .loc-opt-btn`)[0].click();
        }
        else {
            $(`#${EbSid} .loc-opt-DD`).off("change").on("change", function (e) {
                let loc = $(e.target).children().filter(":selected").val();
                let ctrlArr = $.grep(ctrl.LocationCollection.$values, function (ctrl, i) { return ctrl.Name === loc; });
                let LocCtrl = ctrlArr[0];
                let $locDiv = $(`#${LocCtrl.Name}`);
                if ($locDiv.closest(".location-box").css("display") === "none") {
                    $(`#${EbSid} .location-box`).hide(10);
                    $locDiv.closest(".location-box").show(10,
                        function () {
                            if ($locDiv.children().length === 0)
                                this.initMap(LocCtrl);
                        }.bind(this));
                }
            }.bind(this));

            $(`#${EbSid} .location-box:eq(0)`).show();
            this.initMap(ctrl.LocationCollection.$values[0]);
        }
    };

    this.initMap = function (ctrl) {
        let uluru = { lat: ctrl.Position.Latitude, lng: ctrl.Position.Longitude };
        let map = new google.maps.Map(document.getElementById(ctrl.Name), {
            zoom: 15,
            center: uluru
        });
        let marker = new google.maps.Marker({
            position: uluru,
            map: map
        });
        if (this.Renderer.rendererName === "Bot")
            this.bindMapResize(ctrl);
    };

    this.bindMapResize = function (ctrl) {
        $(window).resize(function () {
            $("#" + ctrl.EbSid).css("height", parseInt(($("#" + ctrl.EbSid).width() / 100 * 60)) + "px");
        });
    };

    this.DataGrid = function (ctrl, ctrlOpts) {
        return new EbDataGrid(ctrl, ctrlOpts);
    };

    this.ExportButton = function (ctrl, ctrlOpts) {
        let $ctrl = $("#" + ctrl.EbSid_CtxId);
        $ctrl[0].onclick = function () {
            //if (!this.Renderer.FRC.AllRequired_valid_Check())
            //    return;
            let params = [];
            params.push(new fltr_obj(16, "srcRefId", ctrlOpts.formObj.RefId));
            params.push(new fltr_obj(11, "srcRowId", ctrlOpts.dataRowId));
            let url = `../WebForm/Index?refid=${ctrl.FormRefId}&_params=${btoa(unescape(encodeURIComponent(JSON.stringify(params))))}&_mode=7`;
            window.open(url, '_blank');
        }.bind(this);
    };

    this.Review = function (ctrl, ctrlOpts) {
        return new EbReview(ctrl, ctrlOpts);
    };

    this.MeetingPicker = function (ctrl, ctrlOpts) {
        return new meetingPicker(ctrl, ctrlOpts, this.Renderer.rendererName);
    };

    this.MeetingScheduler = function (ctrl, ctrlOpts) {
        return new meetingScheduler(ctrl, ctrlOpts, this.Renderer.rendererName);
    };

    this.PowerSelect = function (ctrl, ctrlOpts) {
        let t0 = performance.now();

        if (ctrl.RenderAsSimpleSelect) {
            this.SimpleSelect(ctrl);
            return;
        }
        else if (ctrl.IsInsertable) {
            ctrl.__AddButtonInit = this.Button;
        }

        Vue.component('v-select', VueSelect.VueSelect);
        Vue.config.devtools = true;

        $(`#${ctrl.EbSid_CtxId}_loading-image`).hide();
        $(`#cont_${ctrl.EbSid_CtxId} .ctrl-cover`).css("min-height", ctrl.Padding.Top + ctrl.Padding.Bottom + 20 + "px");

        let EbCombo = new EbPowerSelect(ctrl, {
            getFilterValuesFn: ctrlOpts.getAllCtrlValuesFn,
            rendererName: this.Renderer.rendererName
        });

        if (this.Bot && this.Bot.curCtrl !== undefined)
            this.Bot.curCtrl.SelectedRows = EbCombo.getSelectedRow;
        let t1 = performance.now();
        // console.dev_log("PowerSelect init took " + (t1 - t0) + " milliseconds.");
    };

    this.Survey = function (ctrl) {
        new EbSurveyRender($('#' + ctrl.Name), this.Renderer);
    };

    this.StaticCardSet = function (ctrl) {
        new EbCardRender({
            $Ctrl: $('#' + ctrl.EbSid),
            Bot: this.Renderer,
            CtrlObj: ctrl
        });
    };

    this.DynamicCardSet = function (ctrl) {
        new EbCardRender({
            $Ctrl: $('#' + ctrl.EbSid),
            Bot: this.Renderer,
            CtrlObj: ctrl
        });
    };

    this.ImageUploader = function (ctrl) {
        $('#' + ctrl.Name).off("change").on("change", function (input) {
            $(input.target).closest(".ctrl-wraper").next("[name=ctrlsend]").click();
        }.bind(this));
    };

    this.RadioGroup = function (ctrl) {
        $('#' + ctrl.Name).find("input").on("change", function (e) {
            var val = $('#' + this.id + 'Lbl').text().trim();
            $('#' + ctrl.Name).val(val);
        });
        if (ctrl.OnChangeFn && ctrl.OnChangeFn.Code && ctrl.OnChangeFn.Code !== '') {
            if (ctrl.DefaultValue !== "")
                $("body input[name='" + ctrl.EbSid_CtxId + "'][value='" + ctrl.DefaultValue + "']").prop("checked", true).trigger("change");
            else
                $("body input[name='" + ctrl.EbSid_CtxId + "']:eq(0)").prop("checked", true).trigger("change");
        }
    };

    this.CheckBoxGroup = function (ctrl) {
        $('#' + ctrl.Name).find("input").on("change", function (e) {
            var $ctrlDiv = $('#' + ctrl.Name); var values = "";
            $ctrlDiv.find("input").each(function (i, el) {
                if (el.checked) {
                    val = $('#' + el.id + 'Lbl').text().trim();
                    values += "," + val;
                }
            });
            $ctrlDiv.val(values.substring(1));
        });
    };

    this.Button = function (ctrl) {//////////////////////////////////////
        $('#' + ctrl.EbSid_CtxId).removeAttr("disabled");
        $('#' + ctrl.EbSid_CtxId).on('click', this.iFrameOpen.bind(this, ctrl));
    }.bind(this);

    this.SubmitButton = function (ctrl, ctrlOpts) {
        //checksubmitbutton
        $('#webformsave-selbtn').hide();
        if (ctrlOpts.renderMode === 3 || ctrlOpts.renderMode === 5) {
            $('#webform_submit').parent().prepend(`<div class = "text-center" id = 'captcha'> </div>
                    <input type='text' class = "text-center" placeholder='Enter the captcha' id='cpatchaTextBox' />`);

            ctrlOpts.code = "";
            this.CreateCaptcha(ctrlOpts);
        }
        $('#webform_submit').off('click').on('click', function () {
            event.preventDefault();
            if (ctrlOpts.renderMode === 3 || ctrlOpts.renderMode === 5) {
                if (document.getElementById("cpatchaTextBox").value === ctrlOpts.code) {
                    $('#webformsave').trigger('click');
                } else {
                    EbMessage("show", { Message: "Invalid Captcha. try Again", AutoHide: true, Background: '#aa0000' });
                    this.CreateCaptcha(ctrlOpts);
                }
            } else {
                $('#webformsave').trigger('click');
            }
        }.bind(this));
    }.bind(this);

    this.CreateCaptcha = function (ctrlOpts) {
        //CAPTCHA
        //clear the contents of captcha div first 
        document.getElementById('captcha').innerHTML = "";
        var charsArray =
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@!#$%&*";
        var lengthOtp = 6;
        var captcha = [];
        for (var i = 0; i < lengthOtp; i++) {
            //below code will not allow Repetition of Characters
            var index = Math.floor(Math.random() * charsArray.length + 1); //get the next character from the array
            if (captcha.indexOf(charsArray[index]) === -1)
                captcha.push(charsArray[index]);
            else i--;
        }
        var canv = document.createElement("canvas");
        canv.id = "captcha";
        canv.width = 100;
        canv.height = 50;
        var ctx = canv.getContext("2d");
        ctx.font = "25px Verdana";
        ctx.strokeText(captcha.join(""), 0, 30);
        ctx.moveTo(0, 0);
        ctx.lineTo(300, 150);
        ctx.stroke();
        //storing captcha so that can validate you can save it somewhere else according to your specific requirements
        ctrlOpts.code = captcha.join("");
        document.getElementById("captcha").appendChild(canv); // adds the canvas to the body element
    };

    this.iFrameOpen = function (ctrl) {//////////////////
        let url = "../WebForm/Index?refid=" + ctrl.FormRefId + "&_mode=12";
        $("#iFrameForm").attr("src", url);
        $("#iFrameFormModal").modal("show");
    };

    this.SysLocation = function (ctrl) {
        if (!(ctrl.IsDisable)) {
            $.each(ebcontext.locations.Locations, function (intex, obj) {
                $("#" + ctrl.EbSid_CtxId).append(`<option value="${obj.LocId}"> ${obj.ShortName}</option>`);
            });
            $("#" + ctrl.EbSid_CtxId).val(ebcontext.locations.CurrentLocObj.LocId);
        }
    };

    this.SysCreatedBy = function (ctrl) {
        let $input = $("#" + ctrl.EbSid_CtxId);
        let usrId = ebcontext.user.UserId;
        $input.attr('data-id', usrId);
        $input.text(ebcontext.user.FullName);
        let usrImg = '/images/dp/' + usrId + '.png';
        $(`#${ctrl.EbSid_CtxId}_usrimg`).attr('src', usrImg);

        if (ctrl.constructor.name === "DGCreatedByColumn") {
            let width = $(`#td_${ctrl.EbSid_CtxId}`).width() - 34;
            $input.css("width", width + "px");
        }
    };

    this.SysModifiedBy = function (ctrl) {
        let usrId = ebcontext.user.UserId;
        $("#" + ctrl.EbSid_CtxId).attr('data-id', usrId);
        $("#" + ctrl.EbSid_CtxId).text(ebcontext.user.FullName);
        let usrImg = '/images/dp/' + usrId + '.png';
        $(`#${ctrl.EbSid_CtxId}_usrimg`).attr('src', usrImg);
    };

    this.SysCreatedAt = function (ctrl) {
        this.setCurrentDate(ctrl, $("#" + ctrl.EbSid_CtxId));
    };

    this.SysModifiedAt = function (ctrl) {
        this.setCurrentDate(ctrl, $("#" + ctrl.EbSid_CtxId));
    };

    this.ProvisionUser = function (ctrl, ctrlopts) {
        console.log('init ProvisionUser');

        $.each(ctrl.Fields.$values, function (i, obj) {
            if (obj.ControlName !== '') {
                let c = getObjByval(ctrlopts.flatControls, "Name", obj.ControlName);
                if (c)
                    obj.Control = c;
            }
        }.bind(this));
    };

    this.ProvisionLocation = function (ctrl, ctrlopts) {
        console.log('init ProvisionLocation');

        $.each(ctrl.Fields.$values, function (i, obj) {
            if (obj.ControlName !== '') {
                let c = getObjByval(ctrlopts.flatControls, "Name", obj.ControlName);
                if (c)
                    obj.Control = c;
            }
        }.bind(this));
    };

    this.DisplayPicture = function (ctrl, ctrlopts) {
        new DisplayPictureControl(ctrl, {});
    };

    this.ButtonSelect = function (ctrl, ctrlopts) {
        let $ctrl = $("#" + ctrl.EbSid_CtxId);
        let $buttons = $ctrl.find(".bs-btn");
        $buttons.on("click", this.bs_btn_onclick);
    };

    this.bs_btn_onclick = function (e) {
        let $btn = $(e.target).closest(".bs-btn");
        $btn.siblings(".bs-btn").attr("active", "false");
        $btn.attr("active", "true");
        $btn.closest(".chat-ctrl-cont").find("[name='ctrlsend']").trigger("click");
    }.bind(this);

    //this.bs_btn_onclick = function (e) {
    //    let $btn = $(e.target).closest(".bs-btn");
    //    let $checkBox = $btn.find("input");
    //    if ($btn.attr("active") === "false") {
    //        $btn.attr("active", "true");
    //        $checkBox.prop("checked", true);

    //    }
    //    else if ($btn.attr("active") === "true") {
    //        $btn.attr("active", "false");
    //        $checkBox.prop("checked", false);
    //    }
    //};

    this.UserSelect = function (ctrl, ctrlopts) {
        let itemList = new EbItemListControl({
            contSelector: `#${ctrl.EbSid_CtxId}Wraper`,
            itemList: ctrl.UserList.$values,
            EbSid_CtxId: ctrl.EbSid_CtxId
        });
        itemList.ctrl = ctrl;
        ctrl._JsCtrlMng = itemList;// to refer ControlOperation fns from code in cs file - moving ctrlOps is critical
    };

    this.TextBox = function (ctrl, ctrlopts) {
        let $ctrl = $("#" + ctrl.EbSid_CtxId);
        if (ctrl.TextMode === 0) {
            if (ctrl.AutoSuggestion === true) {
                $ctrl.autocomplete({ source: ctrl.Suggestions.$values });
            }
            //if (ctrl.TextTransform === 1)
            //    $("#" + ctrl.EbSid_CtxId).css("text-transform", "lowercase");
            //else if (ctrl.TextTransform === 2)
            //    $("#" + ctrl.EbSid_CtxId).css("text-transform", "uppercase");

            //$ctrl.keydown(function (event) {
            //    textTransform(this, ctrl.TextTransform);
            //});

            $ctrl.on('paste keydown', function (event) {
                textTransform(this, ctrl.TextTransform);
            });

            $ctrl.on('change', function (event) {
                textTransform(this, ctrl.TextTransform, true);
            });
        }
        else if (ctrl.TextMode === 2) {
            $ctrl.on('input', this.checkEmail.bind(this, ctrl));
        }
    };

    this.EmailControl = function (ctrl) {
        $("#" + ctrl.EbSid_CtxId).on('input', this.checkEmail.bind(this, ctrl));
    };

    this.checkEmail = function (ctrl) {
        if (EbvalidateEmail(event.target.value))
            ctrl.removeInvalidStyle();
        else
            ctrl.addInvalidStyle("Invalid email");
    }

    this.initNumeric = function (ctrl, $input) {
        let initValue = "0";
        if ($input.val() === "") {
            if (ctrl.DecimalPlaces > 0)
                initValue = initValue + "." + "0".repeat(ctrl.DecimalPlaces);
            $input.val(initValue);
        }
        if (ctrl.HideInputIcon)
            $input.siblings(".input-group-addon").hide();

        $input.inputmask("currency", {
            radixPoint: ".",
            allowMinus: ctrl.AllowNegative,
            groupSeparator: "",
            digits: ctrl.DecimalPlaces,
            prefix: '',
            autoGroup: true
        });

        $input.focus(function () { $(this).select(); });

        //$input.focusout(function () {
        //    var val = $(this).val().toString();
        //    var l = 'SZZZZZZZZZZZ'.length - 1;
        //    var ndp = ctrl.DecimalPlaces;
        //    if (val === "0" || val === '' || val === '.')
        //        $(this).val('');
        //    else {
        //        if (ndp !== 0) {
        //            if ((!val.includes('.')) && (l !== val.length))
        //                val = val + '.';
        //            if ((val.includes('.'))) {
        //                var pi = val.indexOf('.');
        //                var lmt = pi + ndp;
        //                for (pi; pi <= l; pi++) {
        //                    if (val[pi] === null)
        //                        val += '0';
        //                    if (pi === lmt)
        //                        break;
        //                }
        //            }
        //        }
        //        if (val[0] === '.')
        //            val = '0' + val;
        //        $(this).val(val);
        //    }
        //});

        {// temp for hairo craft
            $input.blur(function () {
                var val = $input.val();
                let decLen = 2;

                if (val.trim() === "") {
                    $input.val("0.00");
                }
                else if (!val.trim().includes(".")) {
                    let newVal = val + ".00";
                    $input.val(newVal);
                }
                else {
                    let p1 = val.split(".")[0];
                    let p2 = val.split(".")[1];
                    zerolen = decLen - p2.length;
                    let newVal = p1 + "." + p2 + "0".repeat(zerolen > 0 ? zerolen : 0);
                    $input.val(newVal);
                }
            });
        }
        //$input.keypress(function (e) {

        //    var val = $input.val();
        //    var cs = document.getElementById(id).selectionStart;
        //    var ce = document.getElementById(id).selectionEnd;

        //    if (e.which === 46 && val.includes('.')) {
        //        setTimeout(function () {
        //            $input.val(val);
        //        }, 1);
        //    }

        //    //// containes '.' and no selection
        //    //if (val.includes('.') && cs === ce) {
        //    //    setTimeout(function () {
        //    //        var pi = val.indexOf('.');
        //    //        //prevents exceeding decimal part length when containes '.'
        //    //        if ((val.length - pi) === (ctrl.DecimalPlaces + 1) && (e.which >= 48) && (e.which <= 57) && ce > pi)
        //    //            $input.val(val);
        //    //        //prevents exceeding integer part length when containes '.'
        //    //        if (pi === (ctrl.MaxLength - ctrl.DecimalPlaces) && (e.which >= 48) && (e.which <= 57) && ce <= pi)
        //    //            $input.val(val);
        //    //    }, 1);
        //    //}
        //    ////prevents exceeding integer-part length when no '.'
        //    //if (!(val.includes('.')) && val.length === (ctrl.MaxLength - ctrl.DecimalPlaces) && (e.which >= 48) && (e.which <= 57)) {
        //    //    setTimeout(function () {
        //    //        $input.val(val + '.' + String.fromCharCode(e.which));

        //    //    }, 1);
        //    //}
        //    ////prevents del before '.'if it leads to exceed integerpart limit
        //    //if (val.includes('.') && (val.length - 1) > (ctrl.MaxLength - ctrl.DecimalPlaces) && cs === val.indexOf('.') && e.which === 0) {
        //    //    setTimeout(function () {
        //    //        $input.val(val);
        //    //    }, 1);
        //    //}
        //    ////prevents <- after '.' if it leads to exceed integerpart limit
        //    //if (val.includes('.') && (val.length - 1) > (ctrl.MaxLength - ctrl.DecimalPlaces) && cs === (val.indexOf('.') + 1) && e.which === 8) {
        //    //    setTimeout(function () {
        //    //        $input.val(val);
        //    //    }, 1);
        //    //}
        //    ////prevents deletion of selection when containes '.' if it leads to exceed integerpart limit
        //    //if ((val.includes('.') && val.length - (ce - cs)) > (ctrl.MaxLength - ctrl.DecimalPlaces) && cs <= val.indexOf('.') && ce > val.indexOf('.')) {
        //    //    setTimeout(function () {
        //    //        $input.val(val);
        //    //    }, 1);
        //    //}
        //});

        //let sPattern = /[0-9.]/;
        //if (!ctrl.AllowNegative)
        //    sPattern = /[0-9]/;

        //$input.mask('SZZZZZZZZZZZ', {
        //    //reverse: true,
        //    translation: {
        //        'S': {
        //            pattern: sPattern,
        //            optional: true
        //        },
        //        'Z': {
        //            pattern: /[0-9.]/,
        //            optional: true
        //        }
        //    }
        //});
        //}.bind(this), 0);
        var elm = $input[0];
        if (ctrl.MaxLimit !== 0 || ctrl.MinLimit !== 0)
            elm.onchange = createValidator.bind(ctrl)(elm);
    };

    this.Numeric = function (ctrl) {
        var id = ctrl.EbSid_CtxId;
        let $input = $("#" + ctrl.EbSid_CtxId);
        if (ctrl.InputMode === 0) {
            this.initNumeric(ctrl, $input);
        }
        else if (ctrl.InputMode === 1)// currency
            this.initNumeric(ctrl, $input);
        else if (ctrl.InputMode === 2) {// phone
            $input.inputmask("999-999-9999");
        }
    };

    this.getKeyByValue = function (Obj, value) {
        for (var prop in Obj) {
            if (Obj.hasOwnProperty(prop)) {
                if (Obj[prop] === value)
                    return prop;
            }
        }
    };

    this.BluePrint = function (ctrl, ctrlopts) {
        console.log("view mode bp");
        var bphtml = `<div id='bpdiv_${ctrl.EbSid}' >
                        <div id='toolbar_divBP' class='col-md-1 col-lg-1 col-sm-1 toolbarBP_cls_dev'>
                           <div class='vertical-align_tlbr' >
                                
                                    <div  id='addPolygon_BP' class='bp_toolbarproperties ' title="Mark">
                                        <i class="fa fa-object-ungroup "></i>   
                                    </div>

                                    <div  id='bg_image_BP' class='bp_toolbarproperties 'title="Image upload">
                                        <label for="bg_image">
                                           <i class='fa fa-picture-o'></i>
                                        </label>
                                         <input type='file' id='bg_image' accept='image/jpeg,image/png,image/jpg,svg' style=' display: none;' />
                                    </div> 

                                    <div id='removecircle_BP' class='bp_toolbarproperties 'title="Remove circles">
                                        <i class='fa fa-minus-circle'></i>
                                    </div>

                                     <div id='resetsvg_BP' class='bp_toolbarproperties 'title="Reset position">
                                        <i class='fa fa-refresh'></i>
                                    </div>

                                    <div id='clearsvg_BP' class='bp_toolbarproperties 'title="Clear layers">
                                        <i class='fa fa-eraser '></i>
                                    </div>

                                    <div id='mark_position' class='bp_toolbarproperties ' tabindex='1' title="Mark Positions">
                                        <i class='fa fa-stop-circle-o '></i>
                                    </div>

                                    <div id='zoomToggle_BP' class='bp_toolbarproperties 'title="Zoom">
                                        <i class='fa fa-search  '></i>
                                    </div>
                            </div>
                        </div>
                        <div class="col-md-11 col-lg-11 col-sm-11 svgcntnrBP_usr">

                            <div id="svgContainer"></div>
                        </div>
                    </div>`;
        $('#' + ctrl.EbSid + 'Wraper').find('#' + ctrl.EbSid).addClass('bpdiv_retrive').html(bphtml);
        $('#cont_' + ctrl.EbSid).css('height', '100%');
        $('#bpdiv_' + ctrl.EbSid).css('height', '100%');
        $('#' + ctrl.EbSid + 'Wraper').css('height', '100%');


        var drawBP = new drawBluePrintfn(ctrl);

        drawBP.redrawSVGelements_usr();

        ctrl.getValueFromDOM = drawBP.getvalueSelected;
        ctrl.setValue = drawBP.setvalueSelected;
        ctrl._onChangeFunctions = [];
        ctrl.bindOnChange = function (p1) {
            if (!this._onChangeFunctions.includes(p1))
                this._onChangeFunctions.push(p1);
        };
        ctrl.clear = drawBP.clear_ctrlAftrsave;
        //display
        //ctrl.setValue = dgbf;
        ////store
        // ctrl.getValueFromDOM = drawBP.getvalueSelected();
        ////call fn onchange
        //ctrl.bindOnChange = asgd;

    }

    this.Rating = function (ctrl) {
        if ((ebcontext.user.wc == 'uc') || this.Renderer.rendererName === "Bot") {
            $("#" + ctrl.EbSid).empty();
            $("#" + ctrl.EbSid).rateYo({

                numStars: ctrl.MaxVal,
                maxValue: ctrl.MaxVal,
                fullStar: !(ctrl.HalfStar),
                halfStar: ctrl.HalfStar,
                spacing: `${ctrl.Spacing}px`,
                starWidth: `${ctrl.StarWidth}px`,
                ratedFill: ctrl.RatingColor
            });
            if (ctrl.RemoveBorder == true) {
                $(`[ebsid=${ctrl.EbSid}]`).find('#' + ctrl.EbSid + 'Wraper').css({ 'border': 'none' });
            }
        }

    }

    this.TagInput = function (ctrl) {
        //$('#' + ctrl.EbSid).find('.bootstrap-tagsinput').find('.tag');
        //$('input[name = ' + ctrl.EbSid_CtxId + '_tags]').css("font-size", ctrl.FontSizes + 'px')
        //ctrl.clear = function (p1) {
        //    return $('input[name = ' + ctrl.EbSid_CtxId + '_tags]').va("");
        //}
    };

    this.RichText = function (ctrl) {
        $(`#${ctrl.EbSid}`).summernote({
            height: ctrl.TextBoxHeight,
            toolbar: [
                ['font', ['bold', 'underline', 'italic', 'strikethrough', 'subscript', 'superscript', 'clear']],
                ['fontname', ['fontname']],
                ['fontsize', ['fontsize', 'height']],
                ['color', ['color']],
                ['style', ['style']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link']],
                ['view', ['undo', 'redo', 'help']],
            ],
            disableResizeEditor: true,
            disableDragAndDrop: true,
            dialogsInBody: true
        });


        ctrl.clear = function (p1) {
            return $(`#${ctrl.EbSid}`).summernote('reset');
        };


    };

    this.SimpleFileUploader = function (ctrl) {
        let filePlugin = $("#" + ctrl.EbSid).fileUploader({
            fileCtrl: ctrl,
            renderer: this.Renderer.rendererName,
            maxSize: ctrl.MaxSize,
            fileTypes: ctrl.FileTypes,
            maxFiles: ctrl.MaxFiles

        });


        ctrl.getValueFromDOM = function (p1) {
            return filePlugin.refidListfn();
        };
        ctrl.bindOnChange = function (p1) {
            $("#" + ctrl.EbSid + "_bindfn").on("change", p1);
        };
        ctrl.setValue = function (p1) {
            filePlugin.createPreloaded(p1);
        };
        ctrl.clear = function () {
            return filePlugin.clearFiles();
        };
    };

    this.Phone = function (ctrl, ctrlOpts) {
        $('.phnContextBtn').hide();
        if (this.Renderer.mode === 'View Mode') {
            if (this.Renderer.rendererName === "WebForm") {
                if (ctrl.SendMessage) {
                    this.ctrlopts = ctrlOpts;
                    this.phonectrl = ctrl;
                    this.Contexmenu4SmsColumn(ctrl);
                }
            }
        }

        var phninput = document.querySelector(`#${ctrl.EbSid}`);



        var iti = window.intlTelInput(phninput, {
            allowDropdown: true,
            // autoHideDialCode: false,
            // autoPlaceholder: "off",
            // dropdownContainer: "body",
            //defaultCountry: "auto",
            formatOnDisplay: true,
            geoIpLookup: function (callback) {
                $.get("https://ipinfo.io", function () { }, "jsonp").always(function (resp) {
                    var countryCode = (resp && resp.country) ? resp.country : "";
                    callback(countryCode);
                });
            },
            initialCountry: "auto",
            // nationalMode: false,
            //onlyCountries: ['us', 'gb', 'ch', 'ca', 'do'],
            //placeholderNumberType: "MOBILE",
            preferredCountries: [],
            separateDialCode: true,
            dropdown_maxheight: (ctrl.DropdownHeight || '100') + "px",
            utilsScript: "../js/EbControls/EbPhoneControl_Utils.js"
        });
        ctrl.getValueFromDOM = function (p1) {
            //to get numer only without country code===>$((`#${ctrl.EbSid}`),val();           
            return iti.getNumber();;
        };
        ctrl.bindOnChange = function (p1) {
            $(phninput).on("change", p1);
            $(phninput).on('countrychange ', p1);
        };
        ctrl.setValue = function (p1) {
            iti.setNumber(p1);
        };


    };

    this.Contexmenu4SmsColumn = function (ctrl) {
        $.contextMenu({
            selector: ".phnContextBtn",
            trigger: 'left',
            build: function ($trigger, e) {
                return {
                    items: {
                        "SENDSMS": {
                            name: "Send SMS",
                            icon: "fa-mobile",
                            callback: this.OpenSMSModal.bind(this)
                        }
                    }
                };
            }.bind(this)
        });
    };

    this.OpenSMSModal = function (ctrl, opt) {
        //let colname = $(opt.$trigger).attr("data-colname");
        //this.phonecolumn = this.EbObject.Columns.$values.filter(obj => obj.name === colname)[0];       
        this.AppendSMSModal($(opt.$trigger));
        this.AppendSMSTemplates($(opt.$trigger));
        $("#smsmodal").modal("show");
    };

    this.AppendSMSModal = function ($elem) {
        $("#smsmodal").remove();
        let modal1 = `<div class="modal fade" tabindex="-1" role="dialog" id='smsmodal'>
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">SMS Template</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" id='sms-modal-body'>
        <table class='table'>
            <tbody>
                <tr><td><div class='smslabel'>Template :</div></td><td class='smstemplate-select-cont'></td>
                    <td><div class='smslabel'>To :</div></td>
                    <td class='sms-number-cont'>
                        <input class="form-control" type='text' id='sms-number' placeholder='phone number here..'>
                    </td>
                </tr>
                <tr><td colspan='4' class='sms-textarea-cont'><textarea id='sms-textarea'  rows='5' style='resize:none' class="form-control" placeholder='SMS text here..'></textarea></td></tr>
            </tbody>
        </table>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" id='sendbtn'><i class="fa fa-paper-plane" aria-hidden="true"></i><span id='sendbtn-text'>Send</span></button>
      </div>
    </div>
  </div>
</div>`;

        $("body").prepend(modal1);
        $("#sendbtn").prop("disabled", true);
        $("#sendbtn").off("click").on("click", this.SendSMS.bind(this, $elem));
    }.bind(this);

    this.AppendSMSTemplates = function ($elem) {
        let template = `<select class="selectpicker smstemplate-select">`;
        //template += `<option value=''>--- Select SMS Template ---</option>`;
        $.each(this.phonectrl.Templates.$values, function (i, obj) {
            template += `<option value='${obj.ObjRefId}'>${obj.ObjDisplayName}</option>`;
        });
        template += `<option value=''>Custom Template</option>`;
        template += `</select>`;
        $(".smstemplate-select-cont").append(template);
        $(".smstemplate-select").selectpicker();
        $('#sms-modal-body .selectpicker').on('changed.bs.select', this.ClickOnTemplate.bind(this, $elem));
        $('#sms-modal-body .selectpicker').val(this.phonectrl.Templates.$values[0].ObjRefId).change();
    };

    this.ClickOnTemplate = function ($elem, e, clickedIndex, isSelected, previousValue) {
        let refid = $(".smstemplate-select option:selected").val();
        //var idx = this.Api.row($elem.parents().closest("td")).index();
        //this.rowData = this.unformatedData[idx];
        //let filters = this.getFilterValues().concat(this.FilterfromRow());
        let filters = getValsFromForm(this.ctrlopts.formObj);
        filters.push(new fltr_obj(11, "id", this.Renderer.rowId));
        $("#sendbtn").prop("disabled", false);
        if (refid) {
            $.ajax({
                type: "POST",
                url: "../DV/GetSMSPreview",
                data: { RefId: refid, Params: filters },
                success: this.AppendSMSPreview.bind(this)
            });
        }
        else
            this.AppendSMSPreview();
    };

    this.AppendSMSPreview = function (result) {
        if (result) {
            result = JSON.parse(result);
            $("#sms-number").val(result.FilledSmsTemplate.SmsTo).prop("disabled", true);
            $("#sms-textarea").val(atob(result.FilledSmsTemplate.SmsTemplate.Body)).prop("disabled", true);
        }
        else {
            $("#sms-textarea").val("").prop("disabled", false);
        }
    };

    this.SendSMS = function ($elem) {
        if (this.MakeSMSValidation()) {
            $("#smsmodal").modal("hide");
            $("#eb_common_loader").EbLoader("show");
            let refid = $(".smstemplate-select option:selected").val();
            if (refid) {
                //var idx = this.Api.row($elem.parents().closest("td")).index();
                //this.rowData = this.unformatedData[idx];
                //let filters = this.getFilterValues().concat(this.FilterfromRow());
                let filters = getValsFromForm(this.ctrlopts.formObj);
                filters.push(new fltr_obj(11, "id", this.Renderer.rowId));
                $.ajax({
                    type: "POST",
                    url: "../DV/SendSMS",
                    data: { RefId: refid, Params: filters },
                    success: this.SendSMSSuccess.bind(this)
                });
            }
            else {
                $.ajax({
                    type: "POST",
                    url: "../DV/SendCustomSMS",
                    data: { To: $("#sms-number").val(), Body: $("#sms-textarea").val() },
                    success: this.SendSMSSuccess.bind(this)
                });
            }
        }
    };

    this.MakeSMSValidation = function () {
        if ($("#sms-number").val() && $("#sms-textarea").val())
            return true;
        else {
            EbMessage("show", { Message: "Phone number or text is Empty", Background: "#e40707" });
            return false;
        }
    };

    this.SendSMSSuccess = function () {
        $("#eb_common_loader").EbLoader("hide");
        EbPopBox("show", { Message: "Message sent", Title: "Success" });
    };

    ////phonecontrol ends 

};



function createValidator(element) {
    return function () {
        //if (!isPrintable(event))
        //    return;

        if (element.__latestValue === parseFloat(element.value))// to prevent recursion from trigger("change");
            return;
        let min = parseFloat(element.getAttribute("min")) || 0;
        let max = parseFloat(element.getAttribute("max")) || 0;

        let value = parseFloat(element.value) || min;
        element.value = value; // make sure we got an int

        if (value < min && min !== 0) element.value = min;
        if (value > max && max !== 0) element.value = max;
        element.__latestValue = parseFloat(element.value);
        $(element).trigger("change");
    }.bind(this);
}
/** @license
 * eventsource.js
 * Available under MIT License (MIT)
 * https://github.com/Yaffle/EventSource/
 */
!function (a) { "use strict"; function b(a) { this.withCredentials = !1, this.responseType = "", this.readyState = 0, this.status = 0, this.statusText = "", this.responseText = "", this.onprogress = q, this.onreadystatechange = q, this._contentType = "", this._xhr = a, this._sendTimeout = 0, this._abort = q } function c(a) { this._xhr = new b(a) } function d() { this._listeners = Object.create(null) } function e(a) { k(function () { throw a }, 0) } function f(a) { this.type = a, this.target = void 0 } function g(a, b) { f.call(this, a), this.data = b.data, this.lastEventId = b.lastEventId } function h(a, b) { d.call(this), this.onopen = void 0, this.onmessage = void 0, this.onerror = void 0, this.url = void 0, this.readyState = void 0, this.withCredentials = void 0, this._close = void 0, j(this, a, b) } function i() { return m && "withCredentials" in m.prototype ? m : n } function j(a, b, d) { b = String(b); var h = void 0 != d && Boolean(d.withCredentials), j = E(1e3), m = void 0 != d && void 0 != d.heartbeatTimeout ? D(d.heartbeatTimeout, 45e3) : E(45e3), n = "", o = j, p = !1, q = void 0 != d && void 0 != d.headers ? JSON.parse(JSON.stringify(d.headers)) : void 0, B = void 0 != d && void 0 != d.Transport ? d.Transport : i(), C = new c(new B), G = 0, H = r, I = "", J = "", K = "", L = "", M = w, N = 0, O = 0, P = function (b, c, d) { if (H === s) if (200 === b && void 0 != d && A.test(d)) { H = t, p = !0, o = j, a.readyState = t; var g = new f("open"); a.dispatchEvent(g), F(a, a.onopen, g) } else { var h = ""; 200 !== b ? (c && (c = c.replace(/\s+/g, " ")), h = "EventSource's response has a status " + b + " " + c + " that is not 200. Aborting the connection.") : h = "EventSource's response has a Content-Type specifying an unsupported type: " + (void 0 == d ? "-" : d.replace(/\s+/g, " ")) + ". Aborting the connection.", e(new Error(h)), S(); var g = new f("error"); a.dispatchEvent(g), F(a, a.onerror, g) } }, Q = function (b) { if (H === t) { for (var c = -1, d = 0; d < b.length; d += 1) { var e = b.charCodeAt(d); (e === "\n".charCodeAt(0) || e === "\r".charCodeAt(0)) && (c = d) } var f = (-1 !== c ? L : "") + b.slice(0, c + 1); L = (-1 === c ? L : "") + b.slice(c + 1), "" !== f && (p = !0); for (var h = 0; h < f.length; h += 1) { var e = f.charCodeAt(h); if (M === v && e === "\n".charCodeAt(0)) M = w; else if (M === v && (M = w), e === "\r".charCodeAt(0) || e === "\n".charCodeAt(0)) { if (M !== w) { M === x && (O = h + 1); var i = f.slice(N, O - 1), q = f.slice(O + (h > O && f.charCodeAt(O) === " ".charCodeAt(0) ? 1 : 0), h); "data" === i ? (I += "\n", I += q) : "id" === i ? J = q : "event" === i ? K = q : "retry" === i ? (j = D(q, j), o = j) : "heartbeatTimeout" === i && (m = D(q, m), 0 !== G && (l(G), G = k(function () { T() }, m))) } if (M === w) { if ("" !== I) { n = J, "" === K && (K = "message"); var r = new g(K, { data: I.slice(1), lastEventId: J }); if (a.dispatchEvent(r), "message" === K && F(a, a.onmessage, r), H === u) return } I = "", K = "" } M = e === "\r".charCodeAt(0) ? v : w } else M === w && (N = h, M = x), M === x ? e === ":".charCodeAt(0) && (O = h + 1, M = y) : M === y && (M = z) } } }, R = function () { if (H === t || H === s) { H = r, 0 !== G && (l(G), G = 0), G = k(function () { T() }, o), o = E(Math.min(16 * j, 2 * o)), a.readyState = s; var b = new f("error"); a.dispatchEvent(b), F(a, a.onerror, b) } }, S = function () { H = u, C.cancel(), 0 !== G && (l(G), G = 0), a.readyState = u }, T = function () { if (G = 0, H !== r) return void (p ? (p = !1, G = k(function () { T() }, m)) : (e(new Error("No activity within " + m + " milliseconds. Reconnecting.")), C.cancel())); p = !1, G = k(function () { T() }, m), H = s, I = "", K = "", J = n, L = "", N = 0, O = 0, M = w; var a = b; "data:" !== b.slice(0, 5) && "blob:" !== b.slice(0, 5) && (a = b + (-1 === b.indexOf("?", 0) ? "?" : "&") + "lastEventId=" + encodeURIComponent(n)); var c = {}; if (c.Accept = "text/event-stream", void 0 != q) for (var d in q) Object.prototype.hasOwnProperty.call(q, d) && (c[d] = q[d]); try { C.open(P, Q, R, a, h, c) } catch (f) { throw S(), f } }; a.url = b, a.readyState = s, a.withCredentials = h, a._close = S, T() } var k = a.setTimeout, l = a.clearTimeout, m = a.XMLHttpRequest, n = a.XDomainRequest, o = a.EventSource, p = a.document; null == Object.create && (Object.create = function (a) { function b() { } return b.prototype = a, new b }); var q = function () { }; b.prototype.open = function (a, b) { this._abort(!0); var c = this, d = this._xhr, e = 1, f = 0; this._abort = function (a) { 0 !== c._sendTimeout && (l(c._sendTimeout), c._sendTimeout = 0), (1 === e || 2 === e || 3 === e) && (e = 4, d.onload = q, d.onerror = q, d.onabort = q, d.onprogress = q, d.onreadystatechange = q, d.abort(), 0 !== f && (l(f), f = 0), a || (c.readyState = 4, c.onreadystatechange())), e = 0 }; var g = function () { if (1 === e) { var a = 0, b = "", f = void 0; if ("contentType" in d) a = 200, b = "OK", f = d.contentType; else try { a = d.status, b = d.statusText, f = d.getResponseHeader("Content-Type") } catch (g) { a = 0, b = "", f = void 0 } 0 !== a && (e = 2, c.readyState = 2, c.status = a, c.statusText = b, c._contentType = f, c.onreadystatechange()) } }, h = function () { if (g(), 2 === e || 3 === e) { e = 3; var a = ""; try { a = d.responseText } catch (b) { } c.readyState = 3, c.responseText = a, c.onprogress() } }, i = function () { h(), (1 === e || 2 === e || 3 === e) && (e = 4, 0 !== f && (l(f), f = 0), c.readyState = 4, c.onreadystatechange()) }, j = function () { void 0 != d && (4 === d.readyState ? i() : 3 === d.readyState ? h() : 2 === d.readyState && g()) }, n = function () { f = k(function () { n() }, 500), 3 === d.readyState && h() }; d.onload = i, d.onerror = i, d.onabort = i, "sendAsBinary" in m.prototype || "mozAnon" in m.prototype || (d.onprogress = h), d.onreadystatechange = j, "contentType" in d && (b += (-1 === b.indexOf("?", 0) ? "?" : "&") + "padding=true"), d.open(a, b, !0), "readyState" in d && (f = k(function () { n() }, 0)) }, b.prototype.abort = function () { this._abort(!1) }, b.prototype.getResponseHeader = function (a) { return this._contentType }, b.prototype.setRequestHeader = function (a, b) { var c = this._xhr; "setRequestHeader" in c && c.setRequestHeader(a, b) }, b.prototype.send = function () { if (!("ontimeout" in m.prototype) && void 0 != p && void 0 != p.readyState && "complete" !== p.readyState) { var a = this; return void (a._sendTimeout = k(function () { a._sendTimeout = 0, a.send() }, 4)) } var b = this._xhr; b.withCredentials = this.withCredentials, b.responseType = this.responseType; try { b.send(void 0) } catch (c) { throw c } }, c.prototype.open = function (a, b, c, d, e, f) { var g = this._xhr; g.open("GET", d); var h = 0; g.onprogress = function () { var a = g.responseText, c = a.slice(h); h += c.length, b(c) }, g.onreadystatechange = function () { if (2 === g.readyState) { var b = g.status, d = g.statusText, e = g.getResponseHeader("Content-Type"); a(b, d, e) } else 4 === g.readyState && c() }, g.withCredentials = e, g.responseType = "text"; for (var i in f) Object.prototype.hasOwnProperty.call(f, i) && g.setRequestHeader(i, f[i]); g.send() }, c.prototype.cancel = function () { var a = this._xhr; a.abort() }, d.prototype.dispatchEvent = function (a) { a.target = this; var b = this._listeners[a.type]; if (void 0 != b) for (var c = b.length, d = 0; c > d; d += 1) { var f = b[d]; try { "function" == typeof f.handleEvent ? f.handleEvent(a) : f.call(this, a) } catch (g) { e(g) } } }, d.prototype.addEventListener = function (a, b) { a = String(a); var c = this._listeners, d = c[a]; void 0 == d && (d = [], c[a] = d); for (var e = !1, f = 0; f < d.length; f += 1)d[f] === b && (e = !0); e || d.push(b) }, d.prototype.removeEventListener = function (a, b) { a = String(a); var c = this._listeners, d = c[a]; if (void 0 != d) { for (var e = [], f = 0; f < d.length; f += 1)d[f] !== b && e.push(d[f]); 0 === e.length ? delete c[a] : c[a] = e } }, g.prototype = Object.create(f.prototype); var r = -1, s = 0, t = 1, u = 2, v = -1, w = 0, x = 1, y = 2, z = 3, A = /^text\/event\-stream;?(\s*charset\=utf\-8)?$/i, B = 1e3, C = 18e6, D = function (a, b) { var c = parseInt(a, 10); return c !== c && (c = b), E(c) }, E = function (a) { return Math.min(Math.max(a, B), C) }, F = function (a, b, c) { try { "function" == typeof b && b.call(a, c) } catch (d) { e(d) } }; h.prototype = Object.create(d.prototype), h.prototype.CONNECTING = s, h.prototype.OPEN = t, h.prototype.CLOSED = u, h.prototype.close = function () { this._close() }, h.CONNECTING = s, h.OPEN = t, h.CLOSED = u, h.prototype.withCredentials = void 0, a.EventSourcePolyfill = h, a.NativeEventSource = o, void 0 == m || void 0 != o && "withCredentials" in o.prototype || (a.EventSource = h) }("undefined" != typeof window ? window : this);
;(function (root, f) {
    if (typeof define === "function" && define.amd) {
        define(["jquery"], f);
    } else if (typeof exports === "object") {
        module.exports = f(require("jquery"));
    } else {
        f(root.jQuery);
    }
})(this, function ($) {

    if (!$.ss) $.ss = {};
    $.ss.handlers = {};
    $.ss.onSubmitDisable = "[type=submit]";
    $.ss.validation = {
        overrideMessages: false,
        messages: {
            NotEmpty: "Required",
            NotNull: "Required",
            Email: "Invalid email",
            AlreadyExists: "Already exists"
        },
        errorFilter: function (errorMsg, errorCode, type) {
            return this.overrideMessages
                ? this.messages[errorCode] || errorMsg || splitCase(errorCode)
                : errorMsg || splitCase(errorCode);
        }
    };
    $.ss.clearAdjacentError = function () {
        $(this).removeClass("error");
        $(this).prev(".help-inline,.help-block").removeClass("error").html("");
        $(this).next(".help-inline,.help-block").removeClass("error").html("");
    };
    $.ss.todate = function (s) { return new Date(parseFloat(/Date\(([^)]+)\)/.exec(s)[1])); };
    $.ss.todfmt = function (s) { return $.ss.dfmt($.ss.todate(s)); };
    function pad(d) { return d < 10 ? '0' + d : d; };
    $.ss.dfmt = function (d) { return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()); };
    $.ss.dfmthm = function (d) { return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ":" + pad(d.getMinutes()); };
    $.ss.tfmt12 = function (d) { return pad((d.getHours() + 24) % 12 || 12) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()) + " " + (d.getHours() > 12 ? "PM" : "AM"); };
    $.ss.splitOnFirst = function (s, c) { if (!s) return [s]; var pos = s.indexOf(c); return pos >= 0 ? [s.substring(0, pos), s.substring(pos + 1)] : [s]; };
    $.ss.splitOnLast = function (s, c) { if (!s) return [s]; var pos = s.lastIndexOf(c); return pos >= 0 ? [s.substring(0, pos), s.substring(pos + 1)] : [s]; };
    $.ss.getSelection = function () {
        return window.getSelection
            ? window.getSelection().toString()
            : document.selection && document.selection.type != "Control"
                ? document.selection.createRange().text : "";
    };
    $.ss.combinePaths = function() {
        var parts = [], i, l;
        for (i = 0, l = arguments.length; i < l; i++) {
            var arg = arguments[i];
            parts = arg.indexOf("://") === -1
                ? parts.concat(arg.split("/"))
                : parts.concat(arg.lastIndexOf("/") === arg.length-1 ? arg.substring(0, arg.length-1) : arg);
        }
        var paths = [];
        for (i = 0, l = parts.length; i < l; i++) {
            var part = parts[i];
            if (!part || part === ".") continue;
            if (part === "..") paths.pop();
            else paths.push(part);
        }
        if (parts[0] === "") paths.unshift("");
        return paths.join("/") || (paths.length ? "/" : ".");
    };
    $.ss.queryString = function (url) {
        if (!url || url.indexOf('?') === -1) return {};
        var pairs = $.ss.splitOnFirst(url, '?')[1].split('&');
        var map = {};
        for (var i = 0; i < pairs.length; ++i) {
            var p = pairs[i].split('=');
            map[p[0]] = p.length > 1
                ? decodeURIComponent(p[1].replace(/\+/g, ' '))
                : null;
        }
        return map;
    };
    $.ss.bindAll = function (o) {
        for (var k in o) {
            if (typeof o[k] == 'function')
                o[k] = o[k].bind(o);
        }
        return o;
    };
    $.ss.createPath = function (route, args) {
        var argKeys = {};
        for (var k in args) {
            argKeys[k.toLowerCase()] = k;
        }
        var parts = route.split('/');
        var url = '';
        for (var i = 0; i < parts.length; i++) {
            var p = parts[i];
            if (p == null) p = '';
            if (p[0] == '{' && p[p.length - 1] == '}') {
                var key = argKeys[p.substring(1, p.length - 1).toLowerCase()];
                if (key) {
                    p = args[key];
                    delete args[key];
                }
            }
            if (url.length > 0) url += '/';
            url += p;
        }
        return url;
    };
    $.ss.createUrl = function(route, args) {
        var url = $.ss.createPath(route, args);
        for (var k in args) {
            url += url.indexOf('?') >= 0 ? '&' : '?';
            url += k + "=" + encodeURIComponent(args[k]);
        }
        return url;
    };
    function splitCase(t) {
        return typeof t != 'string' ? t : t.replace(/([A-Z]|[0-9]+)/g, ' $1').replace(/_/g, ' ');
    };
    $.ss.humanize = function (s) { return !s || s.indexOf(' ') >= 0 ? s : splitCase(s); };

    function toCamelCase(key) {
        return !key ? key : key.charAt(0).toLowerCase() + key.substring(1);
    }
    $.ss.normalizeKey = function (key) {
        return typeof key == "string" ? key.toLowerCase().replace(/_/g, '') : key;
    };
    $.ss.normalize = function (dto, deep) {
        if ($.isArray(dto)) {
            if (!deep) return dto;
            var to = [];
            for (var i = 0; i < dto.length; i++) {
                to[i] = $.ss.normalize(dto[i], deep);
            }
            return to;
        }
        if (typeof dto != "object") return dto;
        var o = {};
        for (var k in dto) {
            o[$.ss.normalizeKey(k)] = deep ? $.ss.normalize(dto[k], deep) : dto[k];
        }
        return o;
    };
    function sanitize(status) {
        if (status["errors"])
            return status;
        var to = {};
        for (var k in status)
            to[toCamelCase(k)] = status[k];
        to.errors = [];
        $.each(status.Errors || [], function (i, o) {
            var err = {};
            for (var k in o)
                err[toCamelCase(k)] = o[k];
            to.errors.push(err);
        });
        return to;
    }
    $.ss.parseResponseStatus = function (json, defaultMsg) {
        try {
            var err = JSON.parse(json);
            return sanitize(err.ResponseStatus || err.responseStatus);
        } catch (e) {
            return {
                message: defaultMsg,
                __error: { error: e, json: json }
            };
        }
    };
    $.ss.postJSON = function (url, data, success, error) {
        return $.ajax({
            type: "POST", url: url, dataType: "json", contentType: "application/json",
            data: typeof data == "string" ? data : JSON.stringify(data),
            success: success, error: error
        });
    };

    $.fn.setFieldError = function (name, msg) {
        $(this).applyErrors({
            errors: [{
                fieldName: name,
                message: msg
            }]
        });
    };
    $.fn.serializeMap = function () {
        var o = {};
        $.each($(this).serializeArray(), function (i, e) {
            o[e.name] = e.value;
        });
        return o;
    };
    $.fn.applyErrors = function (status, opt) {
        this.clearErrors();
        if (!status) return this;
        status = sanitize(status);

        this.addClass("has-errors");

        var o = $.extend({}, $.ss.validation, opt);
        if (opt && opt.messages) {
            o.overrideMessages = true;
            $.extend(o.messages, $.ss.validation.messages);
        }

        var filter = $.proxy(o.errorFilter, o),
            errors = status.errors;

        if (errors && errors.length) {
            var fieldMap = {}, fieldLabelMap = {};
            this.find("input,textarea,select,button").each(function () {
                var $el = $(this);
                var $prev = $el.prev(), $next = $el.next();
                var fieldId = this.id || $el.attr("name");
                if (!fieldId) return;

                var key = (fieldId).toLowerCase();

                fieldMap[key] = $el;
                if ($prev.hasClass("help-inline") || $prev.hasClass("help-block")) {
                    fieldLabelMap[key] = $prev;
                } else if ($next.hasClass("help-inline") || $next.hasClass("help-block")) {
                    fieldLabelMap[key] = $next;
                }
            });
            this.find(".help-inline[data-for],.help-block[data-for]").each(function () {
                var $el = $(this);
                var key = $el.data("for").toLowerCase();
                fieldLabelMap[key] = $el;
            });
            $.each(errors, function (i, error) {
                var key = (error.fieldName || "").toLowerCase();
                var $field = fieldMap[key];
                if ($field) {
                    $field.addClass("error");
                    $field.parent().addClass("has-error");
                }
                var $lblErr = fieldLabelMap[key];
                if (!$lblErr) return;

                $lblErr.addClass("error");
                $lblErr.html(filter(error.message, error.errorCode, "field"));
                $lblErr.show();
            });
        } else {
            this.find(".error-summary")
                .html(filter(status.message || splitCase(status.errorCode), status.errorCode, "summary"))
                .show();
        }
        return this;
    };
    $.fn.clearErrors = function () {
        this.removeClass("has-errors");
        this.find(".error-summary").html("").hide();
        this.find(".help-inline.error, .help-block.error").each(function () {
            $(this).html("");
        });
        this.find(".error").each(function () {
            $(this).removeClass("error");
        });
        return this.find(".has-error").each(function () {
            $(this).removeClass("has-error");
        });
    };
    $.fn.bindForm = function (orig) {
        return this.each(function () {
            var f = $(this);
            f.submit(function (e) {
                e.preventDefault();
                return $(f).ajaxSubmit(orig);
            });
        });
    };
    $.fn.ajaxSubmit = function (orig) {
        orig = orig || {};
        if (orig.validation) {
            $.extend($.ss.validation, orig.validation);
        }

        return this.each(function () {
            var f = $(this);
            f.clearErrors();
            try {
                if (orig.validate && orig.validate.call(f) === false)
                    return false;
            } catch (e) {
                return false;
            }
            f.addClass("loading");
            var $disable = $(orig.onSubmitDisable || $.ss.onSubmitDisable, f);
            $disable.attr("disabled", "disabled");
            var opt = $.extend({}, orig, {
                type: f.attr('method') || "POST",
                url: f.attr('action'),
                data: f.serialize(),
                accept: "application/json",
                error: function (jq, jqStatus, statusText) {
                    var err, errMsg = "The request failed with " + statusText;
                    try {
                        err = JSON.parse(jq.responseText);
                    } catch (e) {
                    }
                    if (!err) {
                        f.addClass("has-errors");
                        f.find(".error-summary").html(errMsg);
                    } else {
                        f.applyErrors(err.ResponseStatus || err.responseStatus);
                    }
                    if (orig.error) {
                        orig.error.apply(this, arguments);
                    }
                },
                complete: function (jq) {
                    f.removeClass("loading");
                    $disable.removeAttr("disabled");
                    if (orig.complete) {
                        orig.complete.apply(this, arguments);
                    }
                    var loc = jq.getResponseHeader("X-Location");
                    if (loc) {
                        location.href = loc;
                    }
                    var evt = jq.getResponseHeader("X-Trigger");
                    if (evt) {
                        var pos = attr.indexOf(':');
                        var cmd = pos >= 0 ? evt.substring(0, pos) : evt;
                        var data = pos >= 0 ? evt.substring(pos + 1) : null;
                        f.trigger(cmd, data ? [data] : []);
                    }
                },
                dataType: "json",
            });
            $.ajax(opt);
            return false;
        });
    };
    $.fn.applyValues = function (map) {
        return this.each(function () {
            var $el = $(this);
            $.each(map, function (k, v) {
                $el.find("#" + k + ",[name=" + k + "]").val(v);
            });
            $el.find("[data-html]").each(function () {
                $(this).html(map[$(this).data("html")] || "");
            });
            $el.find("[data-val]").each(function () {
                $(this).val(map[$(this).data("val")] || "");
            });
            $el.find("[data-src]").each(function () {
                $(this).attr("src", map[$(this).data("src")] || "");
            });
            $el.find("[data-href]").each(function () {
                $(this).attr("href", map[$(this).data("href")] || "");
            });
        });
    };
    $.ss.__call = $.ss.__call || function (e) {
        var $el = $(e.target);
        var attr = $el.data(e.type) || $el.closest("[data-" + e.type + "]").data(e.type);
        if (!attr) return;

        var pos = attr.indexOf(':'), fn;
        if (pos >= 0) {
            var cmd = attr.substring(0, pos);
            var data = attr.substring(pos + 1);
            if (cmd == 'trigger') {
                $el.trigger(data, [e.target]);
            } else {
                fn = $.ss.handlers[cmd];
                if (fn) {
                    fn.apply(e.target, data.split(','));
                }
            }
        } else {
            fn = $.ss.handlers[attr];
            if (fn) {
                fn.apply(e.target, [].splice(arguments));
            }
        }
    };
    $.ss.listenOn = 'click dblclick change focus blur focusin focusout select keydown keypress keyup hover toggle';
    $.fn.bindHandlers = function (handlers) {
        $.extend($.ss.handlers, handlers || {});
        return this.each(function () {
            var $el = $(this);
            $el.off($.ss.listenOn, $.ss.__call);
            $el.on($.ss.listenOn, $.ss.__call);
        });
    };

    $.fn.setActiveLinks = function () {
        var url = window.location.href;
        return this.each(function () {
            $(this).filter(function () {
                return this.href == url;
            })
            .addClass('active')
            .closest("li").addClass('active');
        });
    };

    $.ss.eventSourceStop = false;
    $.ss.eventOptions = {};
    $.ss.eventReceivers = {};
    $.ss.eventChannels = [];
    $.ss.eventSourceUrl = null;
    $.ss.updateSubscriberUrl = null;
    $.ss.updateChannels = function(channels) {
        $.ss.eventChannels = channels;
        if (!$.ss.eventSource) return;
        var url = $.ss.eventSource.url;
        $.ss.eventSourceUrl = url.substring(0, Math.min(url.indexOf('?'), url.length)) + "?channels=" + channels.join(',');
    };
    $.ss.updateSubscriberInfo = function (subscribe, unsubscribe) {
        var sub = typeof subscribe == "string" ? subscribe.split(',') : subscribe;
        var unsub = typeof unsubscribe == "string" ? unsubscribe.split(',') : unsubscribe;
        var channels = [];
        for (var i in $.ss.eventChannels) {
            var c = $.ss.eventChannels[i];
            if (unsub == null || $.inArray(c, unsub) === -1) {
                channels.push(c);
            }
        }
        if (sub) {
            for (var i in sub) {
                var c = sub[i];
                if ($.inArray(c, channels) === -1) {
                    channels.push(c);
                }
            }
        }
        $.ss.updateChannels(channels);
    };
    $.ss.subscribeToChannels = function (channels, cb, cbError) {
        return $.ss.updateSubscriber({ SubscribeChannels: channels.join(',') }, cb, cbError);
    };
    $.ss.unsubscribeFromChannels = function (channels, cb, cbError) {
        return $.ss.updateSubscriber({ UnsubscribeChannels: channels.join(',') }, cb, cbError);
    };
    $.ss.updateSubscriber = function (data, cb, cbError) {
        if (!$.ss.updateSubscriberUrl)
            throw new Error("updateSubscriberUrl was not populated");
        return $.ajax({
            type: "POST",
            url: $.ss.updateSubscriberUrl,
            data: data,
            dataType: "json",
            success: function (r) {
                $.ss.updateSubscriberInfo(data.SubscribeChannels, data.UnsubscribeChannels);
                r.channels = $.ss.eventChannels;
                if (cb != null)
                    cb(r);
            },
            error: function (e) {
                $.ss.reconnectServerEventsAuth({ errorArgs: arguments });
                if (cbError != null)
                    cbError(e);
            }
        });
    };
    $.ss.reconnectServerEvents = function (opt) {
        if ($.ss.eventSourceStop) return;
        opt = opt || {};
        var hold = $.ss.eventSource;
        var es = new EventSource(opt.url || $.ss.eventSourceUrl || hold.url);
        es.onerror = opt.onerror || hold.onerror;
        es.onmessage = opt.onmessage || hold.onmessage;
        var fn = $.ss.handlers["onReconnect"];
        if (fn != null)
            fn.apply(es, opt.errorArgs);
        hold.close();
        return $.ss.eventSource = es;
    };

    $.ss.reconnectServerEventsAuth = function (opt) {
        if ($.ss.eventSourceStop) return;
        opt = opt || {};
        var hold = $.ss.eventSource;
        var es = new EventSourcePolyfill(opt.url || $.ss.eventSourceUrl || hold.url, {
            headers: {
                'Authorization': 'Bearer ' + getrToken(),
            }
        });
        es.onerror = opt.onerror || hold.onerror;
        es.onmessage = opt.onmessage || hold.onmessage;
        var fn = $.ss.handlers["onReconnect"];
        if (fn != null)
            fn.apply(es, opt.errorArgs);
        hold.close();
        return $.ss.eventSource = es;
    };

    $.ss.invokeReceiver = function (r, cmd, el, msg, e, name) {
        if (r) {
            if (typeof (r[cmd]) == "function") {
                r[cmd].call(el || r[cmd], msg, e);
            } else {
                r[cmd] = msg;
            }
        }
    };
    $.fn.handleServerEvents = function (opt) {
        $.ss.eventSource = this[0];
        $.ss.eventOptions = opt = opt || {};
        if (opt.handlers) {
            $.extend($.ss.handlers, opt.handlers || {});
        }
        function onMessage(e) {
            var parts = $.ss.splitOnFirst(e.data, ' ');
            var selector = parts[0];
            var selParts = $.ss.splitOnFirst(selector, '@');
            if (selParts.length > 1) {
                e.channel = selParts[0];
                selector = selParts[1];
            }
            var json = parts[1];
            var msg = json ? JSON.parse(json) : null;

            parts = $.ss.splitOnFirst(selector, '.');
            if (parts.length <= 1)
                throw "invalid selector format: " + selector;

            var op = parts[0],
                target = parts[1].replace(new RegExp("%20", 'g'), " ");

            if (opt.validate && opt.validate(op, target, msg, json) === false)
                return;

            var tokens = $.ss.splitOnFirst(target, '$'),
                cmd = tokens[0], cssSel = tokens[1],
                $els = cssSel && $(cssSel), el = $els && $els[0];

            $.extend(e, { cmd: cmd, op: op, selector: selector, target: target, cssSelector: cssSel, json: json });
            if (op === "cmd") {
                if (cmd === "onConnect") {
                    $.extend(opt, msg);
                    if (opt.heartbeatUrl) {
                        if (opt.heartbeat) {
                            window.clearInterval(opt.heartbeat);
                        }
                        opt.heartbeat = window.setInterval(function () {
                            if ($.ss.eventSource.readyState === 2) //CLOSED
                            {
                                window.clearInterval(opt.heartbeat);
                                var stopFn = $.ss.handlers["onStop"];
                                if (stopFn != null)
                                    stopFn.apply($.ss.eventSource);
                                $.ss.reconnectServerEventsAuth({ errorArgs: { error:'CLOSED' } });
                                return;
                            }
                            $.ajax({
                                type: "POST",
                                url: opt.heartbeatUrl,
                                data: null,
                                dataType: "text",
                                success: function (r) { },
                                error: function () {
                                    $.ss.reconnectServerEventsAuth({ errorArgs: arguments });
                                }
                            });
                        }, parseInt(opt.heartbeatIntervalMs) || 10000);
                    }
                    if (opt.unRegisterUrl) {
                        $(window).on("unload", function () {
                            $.post(opt.unRegisterUrl, null, function (r) { });
                        });
                    }
                    $.ss.updateSubscriberUrl = opt.updateSubscriberUrl;
                    $.ss.updateChannels((opt.channels || "").split(','));
                }
                var fn = $.ss.handlers[cmd];
                if (fn) {
                    fn.call(el || document.body, msg, e);
                }
            }
            else if (op === "trigger") {
                $(el || document).trigger(cmd, [msg, e]);
            }
            else if (op === "css") {
                $($els || document.body).css(cmd, msg, e);
            }
            else {
                var r = opt.receivers && opt.receivers[op] || $.ss.eventReceivers[op];
                $.ss.invokeReceiver(r, cmd, el, msg, e, op);
            }

            var fn = $.ss.handlers["onMessage"];
            if (fn) fn.cal(el || document.body, msg, e);

            if (opt.success) opt.success(selector, msg, e); //deprecated
        }

        $.ss.eventSource.onmessage = onMessage;

        var hold = $.ss.eventSource.onerror;
        $.ss.eventSource.onerror = function () {
            var args = arguments;
            if (!$.ss.eventSourceStop) {
                window.setTimeout(function () {
                    $.ss.reconnectServerEventsAuth({ errorArgs: args });
                    if (hold)
                        hold.apply(args);
                }, 10000);
            }
        };
    };
});
var EbServerEvents = function (options) {
    this.rTok = options.Rtoken || getrToken();
    this.ServerEventUrl = options.ServerEventUrl;
    this.Channels = options.Channels.join();
    this.Url = this.ServerEventUrl + "/event-stream?channels=" + this.Channels + "&t=" + new Date().getTime();
    this.sEvent = $.ss;

    this.onUploadSuccess = function (m, e) { };
    this.onShowMsg = function (m, e) { };
    this.onLogOut = function (m, e) { };
    this.onNotification = function (m, e) { };
    this.onExcelExportSuccess = function (m, e) { };

    this.onConnect = function (sub) {
        //console.log("You've connected! welcome " + sub.displayName);
        if (sub) {
            window.ebcontext.subscription_id = sub.id;
        }
    };

    this.onJoin = function (user) {
        //console.log("Welcome, " + user.displayName);
    };

    this.onLeave = function (user) {
        //console.log(user.displayName + " has left the building");
    };

    this.onHeartbeat = function (msg, e) {
        //if (console) console.log("onHeartbeat", msg, e);
    };

    this.onUploaded = function (m, e) {
        this.onUploadSuccess(m,e);
    };

    this.onMsgSuccess = function (m, e) {
        //console.log(m);
        this.onShowMsg(m, e);
    };

    this.onLogOutMsg = function (m, e) {
        //console.log(m);
        location.href = "../Tenantuser/Logout";
        this.onLogOut(m, e);
    };

    this.onNotifyMsg = function (m, e) {
        //console.log("Notification");
        this.onNotification(m, e);
    };

    this.stopListening = function () {
        this.ES.close();
        this.sEvent.eventSourceStop = true;
        //console.log("stopped listening");
    };

    this.onExportToExcel = function (m, e) {
        this.onExcelExportSuccess(m);
    };

    this.ES = new EventSourcePolyfill(this.Url, {
        headers: {
            'Authorization': 'Bearer ' + this.rTok,
        }
    });   

    this.ES.addEventListener('error', function (e) {
        console.log("ERROR!", e);
    }, false);

    this.sEvent.eventReceivers = { "document": document }; 

    $(document).bindHandlers({
        announce: function (msg) {
            console.log("announce");
        },
        toggle: function () {
            console.log("toggle");
        },
        removeReceiver: function (name) {
            delete $.ss.eventReceivers[name];
        },
        addReceiver: function (name) {
            this.sEvent.eventReceivers[name] = window[name];
        },
        startListening: function () {
            this.sEvent.reconnectServerEventsAuth();
        }
    }).on('customEvent', function (e, msg, msgEvent) {
        console.log("custom");
    });

    $(this.ES).handleServerEvents({
        handlers: {
            onConnect: this.onConnect.bind(this),
            onJoin: this.onJoin.bind(this),
            onLeave: this.onLeave.bind(this),
            onHeartbeat: this.onHeartbeat.bind(this),
            onUploadSuccess: this.onUploaded.bind(this),
            stopListening: this.stopListening.bind(this),
            onExportToExcel: this.onExportToExcel.bind(this),
            onMsgSuccess: this.onMsgSuccess.bind(this),
            onLogOut: this.onLogOutMsg.bind(this),
            onNotification: this.onNotifyMsg.bind(this)
        }
    });
};
/*! offline-js 0.7.13 */
(function () { var a, b, c, d, e, f, g; d = function (a, b) { var c, d, e, f; e = []; for (d in b.prototype) try { f = b.prototype[d], null == a[d] && "function" != typeof f ? e.push(a[d] = f) : e.push(void 0) } catch (g) { c = g } return e }, a = {}, null == a.options && (a.options = {}), c = { checks: { xhr: { url: function () { return "/favicon.ico?_=" + Math.floor(1e9 * Math.random()) }, timeout: 5e3 }, image: { url: function () { return "/favicon.ico?_=" + Math.floor(1e9 * Math.random()) } }, active: "xhr" }, checkOnLoad: !1, interceptRequests: !0, reconnect: !0 }, e = function (a, b) { var c, d, e, f, g, h; for (c = a, h = b.split("."), d = e = 0, f = h.length; f > e && (g = h[d], c = c[g], "object" == typeof c); d = ++e); return d === h.length - 1 ? c : void 0 }, a.getOption = function (b) { var d, f; return f = null != (d = e(a.options, b)) ? d : e(c, b), "function" == typeof f ? f() : f }, "function" == typeof window.addEventListener && window.addEventListener("online", function () { return setTimeout(a.confirmUp, 100) }, !1), "function" == typeof window.addEventListener && window.addEventListener("offline", function () { return a.confirmDown() }, !1), a.state = "up", a.markUp = function () { return a.trigger("confirmed-up"), "up" !== a.state ? (a.state = "up", a.trigger("up")) : void 0 }, a.markDown = function () { return a.trigger("confirmed-down"), "down" !== a.state ? (a.state = "down", a.trigger("down")) : void 0 }, f = {}, a.on = function (b, c, d) { var e, g, h, i, j; if (g = b.split(" "), g.length > 1) { for (j = [], h = 0, i = g.length; i > h; h++)e = g[h], j.push(a.on(e, c, d)); return j } return null == f[b] && (f[b] = []), f[b].push([d, c]) }, a.off = function (a, b) { var c, d, e, g, h; if (null != f[a]) { if (b) { for (e = 0, h = []; e < f[a].length;)g = f[a][e], d = g[0], c = g[1], c === b ? h.push(f[a].splice(e, 1)) : h.push(e++); return h } return f[a] = [] } }, a.trigger = function (a) { var b, c, d, e, g, h, i; if (null != f[a]) { for (g = f[a], i = [], d = 0, e = g.length; e > d; d++)h = g[d], b = h[0], c = h[1], i.push(c.call(b)); return i } }, b = function (a, b, c) { var d, e, f, g, h; return h = function () { return a.status && a.status < 12e3 ? b() : c() }, null === a.onprogress ? (d = a.onerror, a.onerror = function () { return c(), "function" == typeof d ? d.apply(null, arguments) : void 0 }, g = a.ontimeout, a.ontimeout = function () { return c(), "function" == typeof g ? g.apply(null, arguments) : void 0 }, e = a.onload, a.onload = function () { return h(), "function" == typeof e ? e.apply(null, arguments) : void 0 }) : (f = a.onreadystatechange, a.onreadystatechange = function () { return 4 === a.readyState ? h() : 0 === a.readyState && c(), "function" == typeof f ? f.apply(null, arguments) : void 0 }) }, a.checks = {}, a.checks.xhr = function () { var c, d; d = new XMLHttpRequest, d.offline = !1, d.open("HEAD", a.getOption("checks.xhr.url"), !0), null != d.timeout && (d.timeout = a.getOption("checks.xhr.timeout")), b(d, a.markUp, a.markDown); try { d.send() } catch (e) { c = e, a.markDown() } return d }, a.checks.image = function () { var b; return b = document.createElement("img"), b.onerror = a.markDown, b.onload = a.markUp, void (b.src = a.getOption("checks.image.url")) }, a.checks.down = a.markDown, a.checks.up = a.markUp, a.check = function () { return a.trigger("checking"), a.checks[a.getOption("checks.active")]() }, a.confirmUp = a.confirmDown = a.check, a.onXHR = function (a) { var b, c, e; return e = function (b, c) { var d; return d = b.open, b.open = function (e, f, g, h, i) { return a({ type: e, url: f, async: g, flags: c, user: h, password: i, xhr: b }), d.apply(b, arguments) } }, c = window.XMLHttpRequest, window.XMLHttpRequest = function (a) { var b, d, f; return f = new c(a), e(f, a), d = f.setRequestHeader, f.headers = {}, f.setRequestHeader = function (a, b) { return f.headers[a] = b, d.call(f, a, b) }, b = f.overrideMimeType, f.overrideMimeType = function (a) { return f.mimeType = a, b.call(f, a) }, f }, d(window.XMLHttpRequest, c), null != window.XDomainRequest ? (b = window.XDomainRequest, window.XDomainRequest = function () { var a; return a = new b, e(a), a }, d(window.XDomainRequest, b)) : void 0 }, g = function () { return a.getOption("interceptRequests") && a.onXHR(function (c) { var d; return d = c.xhr, d.offline !== !1 ? b(d, a.markUp, a.confirmDown) : void 0 }), a.getOption("checkOnLoad") ? a.check() : void 0 }, setTimeout(g, 0), window.Offline = a }).call(this), function () { var a, b, c, d, e, f, g, h, i; if (!window.Offline) throw new Error("Offline Reconnect brought in without offline.js"); d = Offline.reconnect = {}, f = null, e = function () { var a; return null != d.state && "inactive" !== d.state && Offline.trigger("reconnect:stopped"), d.state = "inactive", d.remaining = d.delay = null != (a = Offline.getOption("reconnect.initialDelay")) ? a : 3 }, b = function () { var a, b; return a = null != (b = Offline.getOption("reconnect.delay")) ? b : Math.min(Math.ceil(1.5 * d.delay), 3600), d.remaining = d.delay = a }, g = function () { return "connecting" !== d.state ? (d.remaining -= 1, Offline.trigger("reconnect:tick"), 0 === d.remaining ? h() : void 0) : void 0 }, h = function () { return "waiting" === d.state ? (Offline.trigger("reconnect:connecting"), d.state = "connecting", Offline.check()) : void 0 }, a = function () { return Offline.getOption("reconnect") ? (e(), d.state = "waiting", Offline.trigger("reconnect:started"), f = setInterval(g, 1e3)) : void 0 }, i = function () { return null != f && clearInterval(f), e() }, c = function () { return Offline.getOption("reconnect") && "connecting" === d.state ? (Offline.trigger("reconnect:failure"), d.state = "waiting", b()) : void 0 }, d.tryNow = h, e(), Offline.on("down", a), Offline.on("confirmed-down", c), Offline.on("up", i) }.call(this), function () { var a, b, c, d, e, f; if (!window.Offline) throw new Error("Requests module brought in without offline.js"); c = [], f = !1, d = function (a) { return Offline.trigger("requests:capture"), "down" !== Offline.state && (f = !0), c.push(a) }, e = function (a) { var b, c, d, e, f, g, h, i, j; j = a.xhr, g = a.url, f = a.type, h = a.user, d = a.password, b = a.body, j.abort(), j.open(f, g, !0, h, d), e = j.headers; for (c in e) i = e[c], j.setRequestHeader(c, i); return j.mimeType && j.overrideMimeType(j.mimeType), j.send(b) }, a = function () { return c = [] }, b = function () { var b, d, f, g, h, i; for (Offline.trigger("requests:flush"), h = {}, b = 0, f = c.length; f > b; b++)g = c[b], i = g.url.replace(/(\?|&)_=[0-9]+/, function (a, b) { return "?" === b ? b : "" }), h[g.type.toUpperCase() + " - " + i] = g; for (d in h) g = h[d], e(g); return a() }, setTimeout(function () { return Offline.getOption("requests") !== !1 ? (Offline.on("confirmed-up", function () { return f ? (f = !1, a()) : void 0 }), Offline.on("up", b), Offline.on("down", function () { return f = !1 }), Offline.onXHR(function (a) { var b, c, e, f, g; return g = a.xhr, e = a.async, g.offline !== !1 && (f = function () { return d(a) }, c = g.send, g.send = function (b) { return a.body = b, c.apply(g, arguments) }, e) ? null === g.onprogress ? (g.addEventListener("error", f, !1), g.addEventListener("timeout", f, !1)) : (b = g.onreadystatechange, g.onreadystatechange = function () { return 0 === g.readyState ? f() : 4 === g.readyState && (0 === g.status || g.status >= 12e3) && f(), "function" == typeof b ? b.apply(null, arguments) : void 0 }) : void 0 }), Offline.requests = { flush: b, clear: a }) : void 0 }, 0) }.call(this), function () { var a, b, c, d, e; if (!Offline) throw new Error("Offline simulate brought in without offline.js"); for (d = ["up", "down"], b = 0, c = d.length; c > b; b++)e = d[b], (document.querySelector("script[data-simulate='" + e + "']") || localStorage.OFFLINE_SIMULATE === e) && (null == Offline.options && (Offline.options = {}), null == (a = Offline.options).checks && (a.checks = {}), Offline.options.checks.active = e) }.call(this), function () { var a, b, c, d, e, f, g, h, i, j, k, l, m; if (!window.Offline) throw new Error("Offline UI brought in without offline.js"); b = '<div class="offline-ui"><div class="offline-ui-content"></div></div>', a = '<a href class="offline-ui-retry"></a>', f = function (a) { var b; return b = document.createElement("div"), b.innerHTML = a, b.children[0] }, g = e = null, d = function (a) { return k(a), g.className += " " + a }, k = function (a) { return g.className = g.className.replace(new RegExp("(^| )" + a.split(" ").join("|") + "( |$)", "gi"), " ") }, i = {}, h = function (a, b) { return d(a), null != i[a] && clearTimeout(i[a]), i[a] = setTimeout(function () { return k(a), delete i[a] }, 1e3 * b) }, m = function (a) { var b, c, d, e; d = { day: 86400, hour: 3600, minute: 60, second: 1 }; for (c in d) if (b = d[c], a >= b) return e = Math.floor(a / b), [e, c]; return ["now", ""] }, l = function () { var c, h; return g = f(b), document.body.appendChild(g), null != Offline.reconnect && Offline.getOption("reconnect") && (g.appendChild(f(a)), c = g.querySelector(".offline-ui-retry"), h = function (a) { return a.preventDefault(), Offline.reconnect.tryNow() }, null != c.addEventListener ? c.addEventListener("click", h, !1) : c.attachEvent("click", h)), d("offline-ui-" + Offline.state), e = g.querySelector(".offline-ui-content") }, j = function () { return l(), Offline.on("up", function () { return k("offline-ui-down"), d("offline-ui-up"), h("offline-ui-up-2s", 2), h("offline-ui-up-5s", 5) }), Offline.on("down", function () { return k("offline-ui-up"), d("offline-ui-down"), h("offline-ui-down-2s", 2), h("offline-ui-down-5s", 5) }), Offline.on("reconnect:connecting", function () { return d("offline-ui-connecting"), k("offline-ui-waiting") }), Offline.on("reconnect:tick", function () { var a, b, c; return d("offline-ui-waiting"), k("offline-ui-connecting"), a = m(Offline.reconnect.remaining), b = a[0], c = a[1], e.setAttribute("data-retry-in-value", b), e.setAttribute("data-retry-in-unit", c) }), Offline.on("reconnect:stopped", function () { return k("offline-ui-connecting offline-ui-waiting"), e.setAttribute("data-retry-in-value", null), e.setAttribute("data-retry-in-unit", null) }), Offline.on("reconnect:failure", function () { return h("offline-ui-reconnect-failed-2s", 2), h("offline-ui-reconnect-failed-5s", 5) }), Offline.on("reconnect:success", function () { return h("offline-ui-reconnect-succeeded-2s", 2), h("offline-ui-reconnect-succeeded-5s", 5) }) }, "complete" === document.readyState ? j() : null != document.addEventListener ? document.addEventListener("DOMContentLoaded", j, !1) : (c = document.onreadystatechange, document.onreadystatechange = function () { return "complete" === document.readyState && j(), "function" == typeof c ? c.apply(null, arguments) : void 0 }) }.call(this);
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
        EbMakeInvalid(`#${this.EbSid_CtxId}Container`, `#${this.EbSid_CtxId}Wraper`, msg, type);
    else
        EbMakeInvalid(`#cont_${this.EbSid_CtxId}`, `.ctrl-cover`, msg, type);
}

function EbRemoveInvalidStyle() {
    EbMakeValid(`#cont_${this.EbSid_CtxId}`, `.ctrl-cover`);
}

function DGaddInvalidStyle(msg, type) {
    EbMakeInvalid(`#td_${this.EbSid_CtxId}`, `.ctrl-cover`, msg, type);
}

function DGremoveInvalidStyle() {
    EbMakeValid(`#td_${this.EbSid_CtxId}`, `.ctrl-cover`);
}


function EbMakeInvalid(contSel, _ctrlCont, msg = "This field is required", type = "danger") {
    let shadowColor = "#ee0000b8";
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
    SingleColumn.Value = "";
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
        //        let FnString = `
        //let __this = form.__getCtrlByPath(this.__path);
        //if (__this.DataVals !== undefined) {
        //    let v = __this.getValueFromDOM();
        //    let d = __this.getDisplayMemberFromDOM();
        //    if (__this.ObjType === 'Numeric')
        //        v = parseFloat(v);
        //debugger;
        //    if (__this.__isEditing) {
        //        __this.curRowDataVals.Value = v;
        //        __this.curRowDataVals.D = d;
        //    }
        //    else {
        //        __this.DataVals.Value = v;
        //        __this.DataVals.D = d;
        //    }
        //}`;
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

function justSetDate_EB(p1, p2) {
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
        $('#' + this.EbSid_CtxId).trigger('change');
    }
    else
        $('#' + this.EbSid_CtxId).val('');
}

function setDate_EB(p1, p2) {
    justSetDate_EB.bind(this)(p1, p2);
    if (p1 !== null && p1 !== undefined) {
        $('#' + this.EbSid_CtxId).trigger('change');
    }
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
    if (($(e.target).closest("[ebsid]").attr("ctype") == "DataGrid") || ($(document.activeElement).closest('[ebsid]').attr("ctype") == "DataGrid")) {
        //initial click of select
        if (($(e.target).closest("[ebsid]").attr("ctype") == "DataGrid")) {
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
    let DMs = this.initializer.Vobj.displayMembers || [];
    let columnVals = this.initializer.columnVals || {};

    if (VMs.length > 0)// clear if already values there
        this.initializer.clearValues();

    let valMsArr = p1.split(',');

    for (let i = 0; i < valMsArr.length; i++) {
        let vm = valMsArr[i];
        VMs.push(vm);
        for (let j = 0; j < this.initializer.dmNames.length; j++) {
            let dmName = this.initializer.dmNames[j];
            if (!DMs[dmName])
                DMs[dmName] = []; // dg edit mode call
            DMs[dmName].push(this.DataVals.D[vm][dmName]);
        }
    }

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

    $("#" + this.EbSid_CtxId).val(p1);
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
        font.push(`font-family:${obj.FontName} ;`);
        if (font.Underline) { font.push(`text-decoration: underline ;`); }
        if (font.Strikethrough) { font.push(`text-decoration: line-through ;`); }
        if (font.Caps) { font.push(`text-transform: uppercase;`); }
        if (font.Style === 1) { font.push(`font: bold;`); }
        if (font.Style === 2) { font.push(`font: italic;`); }
        if (font.Style === 3) { font.push(`font: italic bold;`); }

        if (jqueryObj !== undefined) {
            jqueryObj.css(`font-size`, `${obj.Size}px`);
            jqueryObj.css(`color`, `${obj.color}`);
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
        let table = multipleTables[tableName];
        for (let j = 0; j < table.length; j++) {
            let row = table[j];
            let columns = row.Columns;
            for (let k = 0; k < columns.length; k++) {
                let singleColumn = columns[k];
                delete singleColumn["D"];
                delete singleColumn["F"];
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
+function ($) { "use strict"; var event_body = !1, Confirmation = function (t, n) { var o = this; this.init("confirmation", t, n), n.selector ? $(t).on("click.bs.confirmation", n.selector, function (t) { t.preventDefault() }) : $(t).on("show.bs.confirmation", function (t) { o.runCallback(o.options.onShow, t, o.$element), o.$element.addClass("open"), o.options.singleton && $(o.options.all_selector).not(o.$element).each(function () { $(this).hasClass("open") && $(this).confirmation("hide") }) }).on("hide.bs.confirmation", function (t) { o.runCallback(o.options.onHide, t, o.$element), o.$element.removeClass("open") }).on("shown.bs.confirmation", function (t) { (o.isPopout() || event_body) && (event_body = $("body").on("click", function (t) { o.$element.is(t.target) || o.$element.has(t.target).length || $(".popover").has(t.target).length || (o.hide(), o.inState.click = !1, $("body").unbind(t), event_body = !1) })) }).on("click.bs.confirmation", function (t) { t.preventDefault() }) }; if (!$.fn.popover || !$.fn.tooltip) throw new Error("Confirmation requires popover.js and tooltip.js"); Confirmation.VERSION = "1.0.7", Confirmation.DEFAULTS = $.extend({}, $.fn.popover.Constructor.DEFAULTS, { placement: "right", title: "Are you sure?", btnOkClass: "btn btn-sm btn-danger", btnOkLabel: "Delete", btnOkIcon: "glyphicon glyphicon-ok", btnCancelClass: "btn btn-sm btn-default", btnCancelLabel: "Cancel", btnCancelIcon: "glyphicon glyphicon-remove", href: "#", target: "_self", singleton: !0, popout: !0, onShow: function (t, n) { }, onHide: function (t, n) { }, onConfirm: function (t, n) { }, onCancel: function (t, n) { }, template: '<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"> <a data-apply="confirmation">Yes</a> <a data-dismiss="confirmation">No</a></div></div>' }), Confirmation.prototype = $.extend({}, $.fn.popover.Constructor.prototype), Confirmation.prototype.constructor = Confirmation, Confirmation.prototype.getDefaults = function () { return Confirmation.DEFAULTS }, Confirmation.prototype.setContent = function () { var t = this, n = this.tip(), o = this.getTitle(), e = n.find('[data-apply="confirmation"]'), i = n.find('[data-dismiss="confirmation"]'); this.options; e.addClass(this.getBtnOkClass()).html(this.getBtnOkLabel()).prepend($("<i></i>").addClass(this.getBtnOkIcon()), " ").attr("href", this.getHref()).attr("target", this.getTarget()).off("click").on("click", function (n) { if (t.runCallback(t.options.onConfirm, n, t.$element), "submit" == t.$element.attr("type")) { var o = t.$element.closest("form"); (void 0 !== o.attr("novalidate") || o[0].checkValidity()) && o.submit() } t.hide(), t.inState.click = !1, t.$element.trigger($.Event("confirm.bs.confirmation")) }), i.addClass(this.getBtnCancelClass()).html(this.getBtnCancelLabel()).prepend($("<i></i>").addClass(this.getBtnCancelIcon()), " ").off("click").on("click", function (n) { t.runCallback(t.options.onCancel, n, t.$element), t.hide(), t.inState.click = !1, t.$element.trigger($.Event("cancel.bs.confirmation")) }), n.find(".popover-title")[this.options.html ? "html" : "text"](o), n.removeClass("fade top bottom left right in"), n.find(".popover-title").html() || n.find(".popover-title").hide() }, Confirmation.prototype.getBtnOkClass = function () { return this.$element.data("btnOkClass") || ("function" == typeof this.options.btnOkClass ? this.options.btnOkClass.call(this, this.$element) : this.options.btnOkClass) }, Confirmation.prototype.getBtnOkLabel = function () { return this.$element.data("btnOkLabel") || ("function" == typeof this.options.btnOkLabel ? this.options.btnOkLabel.call(this, this.$element) : this.options.btnOkLabel) }, Confirmation.prototype.getBtnOkIcon = function () { return this.$element.data("btnOkIcon") || ("function" == typeof this.options.btnOkIcon ? this.options.btnOkIcon.call(this, this.$element) : this.options.btnOkIcon) }, Confirmation.prototype.getBtnCancelClass = function () { return this.$element.data("btnCancelClass") || ("function" == typeof this.options.btnCancelClass ? this.options.btnCancelClass.call(this, this.$element) : this.options.btnCancelClass) }, Confirmation.prototype.getBtnCancelLabel = function () { return this.$element.data("btnCancelLabel") || ("function" == typeof this.options.btnCancelLabel ? this.options.btnCancelLabel.call(this, this.$element) : this.options.btnCancelLabel) }, Confirmation.prototype.getBtnCancelIcon = function () { return this.$element.data("btnCancelIcon") || ("function" == typeof this.options.btnCancelIcon ? this.options.btnCancelIcon.call(this, this.$element) : this.options.btnCancelIcon) }, Confirmation.prototype.getTitle = function () { return this.$element.data("confirmation-title") || this.$element.data("title") || this.$element.attr("title") || ("function" == typeof this.options.title ? this.options.title.call(this, this.$element) : this.options.title) }, Confirmation.prototype.getHref = function () { return this.$element.data("href") || this.$element.attr("href") || ("function" == typeof this.options.href ? this.options.href.call(this, this.$element) : this.options.href) }, Confirmation.prototype.getTarget = function () { return this.$element.data("target") || this.$element.attr("target") || ("function" == typeof this.options.target ? this.options.target.call(this, this.$element) : this.options.target) }, Confirmation.prototype.isPopout = function () { var t = this.$element.data("popout") || ("function" == typeof this.options.popout ? this.options.popout.call(this, this.$element) : this.options.popout); return "false" == t && (t = !1), t }, Confirmation.prototype.runCallback = function (callback, event, element) { "function" == typeof callback ? callback.call(this, event, element) : "string" == typeof callback && eval(callback) }; var old = $.fn.confirmation; $.fn.confirmation = function (t) { var n = this; return this.each(function () { var o = $(this), e = o.data("bs.confirmation"), i = "object" == typeof t && t; (i = i || {}).all_selector = n.selector, (e || "destroy" != t) && (e || o.data("bs.confirmation", e = new Confirmation(this, i)), "string" == typeof t && e[t]()) }) }, $.fn.confirmation.Constructor = Confirmation, $.fn.confirmation.noConflict = function () { return $.fn.confirmation = old, this } }(jQuery);
//import { Array, Object } from "core-js/library/web/timers";

var Eb_chatBot = function (_solid, _appid, settings, cid, ssurl, _serverEventUrl) {
    this.EXPRESSbase_SOLUTION_ID = _solid;
    this.EXPRESSbase_APP_ID = _appid;
    this.EXPRESSbase_cid = cid;
    this.ebbotThemeColor = settings.ThemeColor || "#055c9b";
    this.welcomeMessage = settings.WelcomeMessage || "Hi, I am EBbot from EXPRESSbase!";
    this.ServerEventUrl = _serverEventUrl;
    this.botdpURL = 'url(' + (settings.DpUrl || ('../images/businessmantest.png')) + ')center center no-repeat';
    //this.botdpURL = 'url(' + window.atob(settings.DpUrl || window.btoa('../images/businessmantest.png')) + ')center center no-repeat';
    this.$chatCont = $(`<div class="eb-chat-cont" eb-form='true'  eb-root-obj-container isrendermode='true'></div>`);
    this.$chatBox = $('<div class="eb-chatBox"></div>');
    this.$frameHeader = $('<div class="eb-FrameHeader"></div>');
    this.$inputCont = $('<div class="eb-chat-inp-cont"><input type="text" class="msg-inp"/><button class="btn btn-info msg-send"><i class="fa fa-chevron-right" aria-hidden="true"></i></button></div>');
    this.$poweredby = $('<div class="poweredby-cont"><div class="poweredby"><i>powered by</i> <span>EXPRESSbase</span></div></div>');
    this.$msgCont = $('<div class="msg-cont"></div>');
    this.$renderAtBottom = $('<div class="renderAtBtm"></div>');
    this.$botMsgBox = this.$msgCont.clone().wrapInner($('<div class="msg-cont-bot"><div class="msg-wraper-bot"></div></div>'));
    this.$botMsgBox.prepend('<div class="bot-icon"></div>');
    this.$userMsgBox = this.$msgCont.clone().wrapInner($('<div class="msg-cont-user"><div class="msg-wraper-user"></div></div>'));
    this.$userMsgBox.append('<div class="bot-icon-user"></div>');
    this.ready = true;
    this.isAlreadylogined = true;
    //this.bearerToken = null;
    //this.refreshToken = null;
    this.initControls = new InitControls(this);
    this.rendererName = "Bot";
    this.typeDelay = 600;
    this.controlHideDelay = 300;
    this.breathingDelay = 200;
    this.ChartCounter = 0;
    this.formsList = {};
    this.formsDict = {};
    this.formNames = [];
    this.formIcons = [];
    this.curForm = {};
    this.formControls = [];
    this.formValues = {};
    this.formValuesWithType = {};
    this.formFunctions = {};
    this.formFunctions.visibleIfs = {};
    this.formFunctions.valueExpressions = {};
    this.nxtCtrlIdx = 0;
    this.IsDpndgCtrEdt = false;
    this.FB = null;
    this.FBResponse = {};
    this.userDtls = {};
    this.ssurl = ssurl;
    this.userLoc = {};
    this.botQueue = [];
    this.botflg = {};
    this.botflg.loadFormlist = false;
    this.botflg.otptype = "";
    this.botflg.uname_otp = "";
    this.formObject = {};// for passing to user defined functions
    this.CurFormflatControls = [];// for passing to user defined functions

    this.init = function () {
        $("body").append(this.$chatCont);
        this.$renderAtBottom.hide();
        this.$chatCont.append(this.$chatBox);
        this.$chatCont.append(this.$inputCont);
        this.$chatCont.append(this.$renderAtBottom);
        if (settings.BotProp.EbTag) {
            this.$chatCont.append(this.$poweredby);
        }
        this.$TypeAnim = $(`<div><svg class="lds-typing" width="30px" height="30px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                    <circle cx="27.5" cy="40.9532" r="5" fill="#999">
                        <animate attributeName="cy" calcMode="spline" keySplines="0 0.5 0.5 1;0.5 0 1 0.5;0.5 0.5 0.5 0.5" repeatCount="indefinite" values="62.5;37.5;62.5;62.5" keyTimes="0;0.25;0.5;1" dur="1s" begin="-0.5s"></animate>
                    </circle>
                    <circle cx="42.5" cy="56.4907" r="5" fill="#aaa">
                        <animate attributeName="cy" calcMode="spline" keySplines="0 0.5 0.5 1;0.5 0 1 0.5;0.5 0.5 0.5 0.5" repeatCount="indefinite" values="62.5;37.5;62.5;62.5" keyTimes="0;0.25;0.5;1" dur="1s" begin="-0.375s"></animate>
                    </circle>
                    <circle cx="57.5" cy="62.5" r="5" fill="#bbb">
                        <animate attributeName="cy" calcMode="spline" keySplines="0 0.5 0.5 1;0.5 0 1 0.5;0.5 0.5 0.5 0.5" repeatCount="indefinite" values="62.5;37.5;62.5;62.5" keyTimes="0;0.25;0.5;1" dur="1s" begin="-0.25s"></animate>
                    </circle>
                </svg><div>`);

        let html = document.getElementsByTagName('html')[0];
        html.style.setProperty("--botdpURL", this.botdpURL);
        //html.style.setProperty("--botThemeColor", this.ebbotThemeColor);

        let $botMsgBox = this.$botMsgBox.clone();
        $botMsgBox.find('.msg-wraper-bot').html(this.$TypeAnim.clone()).css("width", "82px");
        this.$TypeAnimMsg = $botMsgBox;

        $("body").on("click", ".eb-chat-inp-cont .msg-send", this.send_btn);
        $("body").on("click", ".msg-cont [name=ctrlsend]", this.ctrlSend);
        $("body").on("click", ".msg-cont [name=ctrledit]", this.ctrlEdit);
        $("body").on("click", ".eb-chatBox [name=formsubmit]", this.formSubmit);
        $("body").on("click", ".eb-chatBox [name=formcancel]", this.formCancel);
        $("body").on("click", ".eb-chatBox [name=formsubmit_fm]", this.formSubmit_fm);
        $("body").on("click", ".eb-chatBox [name=formcancel_fm]", this.formCancel_fm);
        $("body").on("click", "[for=loginOptions]", this.loginSelectedOpn);
        $("body").on("click", "[name=contactSubmit]", this.contactSubmit);
        $("body").on("click", "[name=contactSubmitMail]", this.contactSubmitMail);
        $("body").on("click", "[name=contactSubmitPhn]", this.contactSubmitPhn);
        $("body").on("click", "[name=contactSubmitName]", this.contactSubmitName);
        $("body").on("click", "[name=passwordSubmitBtn]", this.passwordLoginFn);
        $("body").on("click", "[name=otpUserSubmitBtn]", this.otpLoginFn);
        $("body").on("click", "[name=otpvalidateBtn]", this.otpvalidate);
        $("body").on("click", "#resendOTP", this.otpResendFn);
        $("body").on("click", ".btn-box_botformlist [for=form-opt]", this.startFormInteraction);
        $("body").on("click", ".btn-box [for=continueAsFBUser]", this.continueAsFBUser);
        $("body").on("click", ".btn-box [for=fblogin]", this.FBlogin);
        //$("body").on("click", ".btn-box [for=emaillogin]", this.emailLoginFn);
        $("body").on("click", ".cards-btn-cont .btn", this.ctrlSend);
        $("body").on("click", ".survey-final-btn .btn", this.ctrlSend);
        $("body").on("click", "[ctrl-type='InputGeoLocation'] .ctrl-submit-btn", this.ctrlSend);
        $("body").on("click", ".poweredby", this.poweredbyClick);
        $("body").on("click", ".ctrlproceedBtn", this.proceedReadonlyCtrl.bind(this));
        $("body").on("click", "#eb_botStartover", this.botStartoverfn);
        $('.msg-inp').on("keyup", this.txtboxKeyup);
        $("body").on("keyup", ".chat-ctrl-cont [ui-inp]", this.inpkeyUp);
        $("body").on("keyup", ".chat-ctrl-cont [chat-inp]", this.chatInpkeyUp);
        this.initConnectionCheck();
        this.showDate();
        this.showTypingAnim();
        //$('body').confirmation({
        //    selector: '.eb-chatBox'
        //});
        this.botUserLogin();
    };

    this.poweredbyClick = function () {
        window.open('https://expressbase.com/Products/Bots/', '_blank');
    }.bind(this);

    //if anonimous user /not loggegin using fb
    this.contactSubmit = function (e) {
        let emailReg = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        let phoneReg = /^([+]{0,1})([0-9]{10,})$/;
        let email = "";
        let phone = "";
        let username = "";
        if (settings.Authoptions.Fblogin) {
            email = $("#anon_mail").val().trim();
            phone = $("#anon_phno").val().trim();
            if (!((emailReg.test(email) || email === "") && (phoneReg.test(phone) || phone === "") && email !== phone)) {
                //EbMessage("show", { Message: "Please enter valid email/phone", AutoHide: true, Background: '#bf1e1e', Delay: 4000 });
                this.msgFromBot("Please enter valid email/phone");
                return;
            }
            this.msgFromBot("Thank you.");
            this.authenticateAnon(email, phone);
            $(e.target).closest('.msg-cont').remove();
        }


    }.bind(this);

    this.contactSubmitMail = function (e) {
        let emailReg = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        let email = "";
        email = $("#anon_mail").val().trim();
        if (!(emailReg.test(email)) || email === "") {
            this.msgFromBot("Please enter a valid email address");
            return;
        }
        this.userDtls.email = email;
        this.postmenuClick(e, email);
        if (this.botQueue.length > 0) {
            (this.botQueue.shift())();
        }
        else {
            this.submitAnonymous();
        }

    }.bind(this);

    this.contactSubmitPhn = function (e) {
        let phoneReg = /^([+]{0,1})([0-9]{10,})$/;
        let phone = "";
        phone = $("#anon_phno").val().trim();
        if (!(phoneReg.test(phone)) || phone === "") {
            this.msgFromBot("Please enter valid phone number");
            return;
        }
        this.userDtls.phone = phone;
        this.postmenuClick(e, phone);
        if (this.botQueue.length > 0) {
            (this.botQueue.shift())();
        }
        else {
            this.submitAnonymous();
        }

    }.bind(this);

    this.contactSubmitName = function (e) {
        let nameReg = /^[a-zA-Z ]{2,30}$/;
        let username = "";
        username = $("#anon_name").val().trim();
        if (!(nameReg.test(username)) || username === "") {
            this.msgFromBot("Please enter valid name");
            return;
        }
        this.userDtls.name = username;
        this.postmenuClick(e, username);
        this.msgFromBot(`Welcome ${username}`);
        if (settings.Authoptions.LoginOpnCount > 1) {
            this.loginList();
        }
        else {
            this.LoginOpnDirectly();
        }

    }.bind(this);

    this.submitAnonymous = function () {
        this.msgFromBot("Thank you.");
        //let mail = this.userDtls.email || "";
        //let phn = this.userDtls.phone || "";
        //let nme = this.userDtls.name || "";
        let mail = this.userDtls.email;
        let phn = this.userDtls.phone;
        let nme = this.userDtls.name;
        this.authenticateAnon(mail, phn, nme);
        //  $(e.target).closest('.msg-cont').remove();
    };

    //check user is valid / is user authenticated
    this.ajaxSetup4Future = function () {
        //$.ajaxSetup({
        //    //beforeSend: function (xhr) { xhr.setRequestHeader('bToken', this.bearerToken); xhr.setRequestHeader('rToken', this.refreshToken); }.bind(this),
        //    //complete: function (resp) { this.bearerToken = resp.getResponseHeader("btoken"); }.bind(this)

        //});
    };

    this.authenticateAnon = function (email, phno, name) {
        this.showTypingAnim();

        $.post("../bote/AuthAndGetformlist",
            {
                "cid": this.EXPRESSbase_SOLUTION_ID,
                "appid": this.EXPRESSbase_APP_ID,
                "socialId": null,
                "wc": "bc",
                "anon_email": email,
                "anon_phno": phno,
                "user_ip": this.userDtls.ip,
                "user_browser": this.userDtls.browser,
                "user_name": this.userDtls.name || null
            }, function (result) {
                this.hideTypingAnim();
                if (result.status === false) {
                    this.msgFromBot(result.errorMsg);
                }
                else {
                    //this.bearerToken = result.bearerToken;
                    //this.refreshToken = result.refreshToken;
                    this.formsDict = result.botFormDict;
                    window.ebcontext.user = JSON.parse(result.user);
                    //this.formNames = Object.values(this.formsDict);
                    this.formNames = Object.values(result.botFormNames);
                    this.formIcons = result.botFormIcons;
                    $('.eb-chatBox').empty();
                    this.showDate();
                    this.AskWhatU();
                    // this.ajaxSetup4Future();

                }
                /////////////////////////////////////////////////

                setTimeout(function () {
                    //$(".btn-box .btn:last").click();
                    //$(".btn-box_botformlist button:eq(2)").click();// test auto
                }.bind(this), this.typeDelay * 4 + 100);

            }.bind(this));

    }.bind(this);

    this.getBotformList = function () {
        if (this.botflg.loadFormlist === false) {
            setTimeout(function () {
                this.showTypingAnim();
            }.bind(this), this.typeDelay);
            this.botflg.loadFormlist = true;
            $.ajax({
                type: "POST",
                url: "../Boti/GetBotformlist",
                data: {
                    cid: this.EXPRESSbase_SOLUTION_ID, appid: this.EXPRESSbase_APP_ID
                },
                success: function (result) {
                    this.botflg.loadFormlist = false;
                    this.hideTypingAnim();
                    if (result === null) {
                        this.authFailed();
                    }
                    else {
                        if (!$.isEmptyObject(result[2])) {
                            this.formsDict = result[0];
                            window.ebcontext.user = JSON.parse(result[1]);
                            this.formNames = Object.values(result[2]);
                            this.formIcons = result[3];
                            this.AskWhatU();
                        }
                        else {
                            this.msgFromBot("Premission is not set for current user");
                        }
                    }
                }.bind(this)
            })
        }

    }.bind(this);






    this.postmenuClick = function (e, reply) {
        var $e = $(e.target);
        if (reply === undefined)
            reply = $e.text().trim();
        var idx = parseInt($e.attr("idx"));
        $e.closest('.msg-cont').remove();
        this.sendMsg(reply);
        $('.eb-chat-inp-cont').hide();
        this.CurFormIdx = idx;
    }.bind(this);




    this.startFormInteraction = function (e) {
        this.curRefid = $(e.target).closest(".btn").attr("refid");
        this.curObjType = $(e.target).attr("obj-type");
        this.postmenuClick(e);
        this.getForm(this.curRefid);///////////////////
    }.bind(this);

    //this.setDataModel = function (form) {
    //    for (let i = 0; i < form.Controls.$values.length; i++) {
    //        getSingleColumn(form.Controls.$values[i]);
    //    }
    //};

    this.getFormSuccess = function (RefId, res) {
        let result = JSON.parse(res);
        let form = JSON.parse(result.object);
        this.curFormObj = form;
        let DataRes = JSON.parse(result.data);
        if (DataRes.Status === 200) {

            this.CurDataMODEL = DataRes.FormData.MultipleTables;
            a___MT = DataRes.FormData.MultipleTables;
            this.CurRowId = this.CurDataMODEL[form.TableName][0].RowId;
            this.hideTypingAnim();
            //data = JSON.parse(data);

            attachModalCellRef_form(form, this.CurDataMODEL);

            //this.setDataModel(form);
            JsonToEbControls(form);
            this.formsList[RefId] = form;
            if (form.ObjType === "BotForm") {
                this.curForm = form;
                this.CurFormflatControls = this.curForm.Controls.$values;
                this.setFormObject();
                this.setFormControls();
            }
            else if (form.ObjType === "TableVisualization") {
                //form.BotCols = JSON.parse(form.BotCols);
                //form.BotData = JSON.parse(form.BotData);
                this.curTblViz = form;
                this.showTblViz();
            }
            else if (form.ObjType === "ChartVisualization") {
                this.curChartViz = form;
                this.showChartViz();
            }
        }
        else if (DataRes.Status === 403) {
            //EbMessage("show", { Message: "Access denied to update this data entry!", AutoHide: true, Background: '#aa0000' });
            this.msgFromBot("Access denied to update this data entry!");
            console.error(DataRes.MessageInt);
        }
        else {
            //EbMessage("show", { Message: DataRes.Message, AutoHide: true, Background: '#aa0000' });
            this.msgFromBot(DataRes.Message);
            console.error(DataRes.MessageInt);
        }
    }.bind(this);

    this.getForm = function (RefId) {
        this.showTypingAnim();
        if (!this.formsList[RefId]) {
            $.ajax({
                type: "POST",
                //url: "../Boti/GetCurForm",
                url: "../Boti/GetCurForm_New",
                data: { refid: RefId },

                success: this.getFormSuccess.bind(this, RefId)

            });
        }
        else {
            this.hideTypingAnim();
            this.curForm = this.formsList[RefId];
            this.setFormControls();
        }
    };

    this.txtboxKeyup = function (e) {
        if (e.which === 13)/////////////////////////////
            this.send_btn();
    }.bind(this);

    this.inpkeyUp = function (e) {
        if (e.which === 13)/////////////////////////////
            $(e.target).closest(".chat-ctrl-cont").find('[name="ctrlsend"]').trigger("click");
    }.bind(this);

    this.chatInpkeyUp = function (e) {
        if (e.which === 13)/////////////////////////////
            $(e.target).closest(".chat-ctrl-cont").find('.cntct_btn').trigger("click");
    }.bind(this);

    this.send_btn = function () {
        window.onmessage = function (e) {
            if (e.data === 'hello') {
                //alert('It works!8888888888888888888888');
            }
        };

        let $e = $('.msg-inp');
        let msg = $e.val().trim();
        if (!msg) {
            $e.val('');
            return;
        }
        this.sendMsg(msg);
        $e.val('');

    }.bind(this);

    this.greetings = function (name) {
        var time = new Date().getHours();
        var greeting = null;
        if (time < 12) {
            greeting = "Good morning!";
        }
        else if (time >= 12 && time < 16) {
            greeting = 'Good afternoon!';
        }
        else {
            greeting = 'Good evening!';
        }
        if (this.isAlreadylogined) {
            this.Query(`Hello ${this.FBResponse.name}, ${greeting}`, [`Continue as ${this.FBResponse.name} ?`, `Not ${this.FBResponse.name}?`], "continueAsFBUser");
            /////////////////////////////////////////////////
            setTimeout(function () {
                //$(".btn-box").find("[idx=0]").click();
            }.bind(this), this.typeDelay * 2 + 100);
        }
        else {
            this.msgFromBot(`Hello ${this.FBResponse.name}, ${greeting}`);
            setTimeout(function () {
                this.authenticate();
            }.bind(this), 901);
        }
    }.bind(this);

    this.Query = function (msg, OptArr, For, cls, ids) {
        this.msgFromBot(msg);
        var Options = this.getButtons(OptArr.map((item) => { return item.replace(/_/g, " ") }), For, ids, cls);
        this.msgFromBot($('<div class="btn-box" >' + Options + '</div>'));
    };

    this.getButtons = function (OptArr, For, ids, cls) {
        var Html = '';
        $.each(OptArr, function (i, opt) {
            Html += `<button for="${For}" class="btn formname-btn ${(cls !== undefined) ? cls[i] : ''}" idx="${i}" refid="${(ids !== undefined) ? ids[i] : i}">${opt} </button>`;
        });
        return Html;
    };

    this.Query_botformlist = function (msg, OptArr, For, ids, icns) {
        this.msgFromBot(msg);
        var Options = this.getButtons_botformlist(OptArr.map((item) => { return item.replace(/_/g, " ") }), For, ids, icns);
        this.msgFromBot($('<div class="btn-box_botformlist" >' + Options + '</div>'));
    };

    this.getButtons_botformlist = function (OptArr, For, ids, icns) {
        var Html = '';
        $.each(OptArr, function (i, opt) {
            Html += `<button for="${For}" class="btn formname-btn_botformlist" idx="${i}" refid="${(ids !== undefined) ? ids[i] : i}"><i style="display:block;font-size: 28px; margin-bottom: 5px;" class="fa ${icns[i]}"></i>${opt} </button>`;
        });
        return Html;
    };

    this.initFormCtrls_fm = function () {
        $.each(this.curForm.Controls.$values, function (i, control) {//////////////////////////////////////
            this.initControls.init(control);
            $("#" + control.Name).on("blur", this.makeReqFm.bind(this, control)).on("focus", this.removeReqFm.bind(this, control));
        }.bind(this));
    }.bind(this);

    this.makeReqFm = function (control) {
        var $ctrl = $("#" + control.Name);
        if ($ctrl.length !== 0 && control.required && $ctrl.val().trim() === "")
            EbMakeInvalid(`[for=${control.Name}]`, '.ctrl-wraper');
    };

    this.removeReqFm = function (control) {
        EbMakeValid(`[for=${control.Name}]`, '.ctrl-wraper');
    };

    this.RenderForm = function () {
        var Html = `<div class='form-wraper'>`;
        $.each(this.curForm.Controls.$values, function (i, control) {
            if (!control.hidden)
                Html += `<label>${control.Label}</label><div for='${control.Name}'><div class='ctrl-wraper'>${control.BareControlHtml4Bot}</div></div><br/>`;
        });
        this.msgFromBot($(Html + '<div class="btn-box"><button name="formsubmit_fm" class="btn formname-btn">Submit</button><button name="formcancel_fm" class="btn formname-btn">Cancel</button></div></div>'), this.initFormCtrls_fm);
    };

    this.setFormControls = function () {
        this.formControls = [];
        $.each(this.curForm.Controls.$values, function (i, control) {
            if (control.VisibleExpr && control.VisibleExpr.Code.trim())//if visibleIf is Not empty
                this.formFunctions.visibleIfs[control.Name] = new Function("form", atob(control.VisibleExpr.Code));
            if (control.ValueExpression && control.ValueExpression.trim())//if valueExpression is Not empty
                this.formFunctions.valueExpressions[control.Name] = new Function("form", "user", atob(control.ValueExpression));
            let $ctrl = $(`<div class='ctrl-wraper'  id='cont_${control.EbSid_CtxId}'>${control.BareControlHtml4Bot}</div>`);
            if (control.ObjType === "InputGeoLocation")
                $ctrl.find(".ctrl-submit-btn").attr("idx", i);
            this.formControls.push($ctrl);
        }.bind(this));

        if (this.curForm.RenderAsForm)
            this.RenderForm();
        else {

            this.getControl(0);
        }
    }.bind(this);

    this.chooseClick = function (e) {
        $(e.target).attr("idx", this.nxtCtrlIdx);
        this.ctrlSend(e);
    }.bind(this);

    this.getCardsetValue = function (cardCtrl) {
        var resObj = {};
        var isPersistAnyField = false;
        this.curDispValue = '';
        $.each(cardCtrl.CardFields.$values, function (h, fObj) {
            if (!fObj.DoNotPersist) {
                isPersistAnyField = true;
            }
        }.bind(this));

        if (!cardCtrl.MultiSelect && isPersistAnyField) {
            $(event.target).parents().find('.slick-current .card-btn-cont .btn').click();
        }
        if (isPersistAnyField) {
            $.each(cardCtrl.CardCollection.$values, function (k, cObj) {
                if (cardCtrl.SelectedCards.indexOf(cObj.CardId) !== -1) {
                    var tempArray = new Array();
                    $.each(cardCtrl.CardFields.$values, function (h, fObj) {
                        if (!fObj.DoNotPersist) {
                            tempArray.push(new Object({ Value: cObj.customFields[fObj.Name], Type: fObj.EbDbType, Name: fObj.Name }));
                        }
                        if (fObj.ObjType === 'CardTitleField') {//for display selected card names on submit
                            this.curDispValue += cObj.CustomFields[fObj.Name] + '<br/>';
                        }
                    }.bind(this));
                    resObj[cObj.CardId] = tempArray;
                }
            }.bind(this));
            if (cardCtrl.SelectedCards.length === 0 && cardCtrl.MultiSelect)
                this.curDispValue = 'Nothing Selected';
        }
        else {
            this.curDispValue = '';
        }
        //cardCtrl.selectedCards = [];
        return (JSON.stringify(resObj));
    };

    this.getValue = function ($input) {
        var inpVal;
        if ($input[0].tagName === "SELECT")
            inpVal = $input.find(":selected").text();
        else if ($input.attr("type") === "password")
            inpVal = $input.val().replace(/(^.)(.*)(.$)/, function (a, b, c, d) { return b + c.replace(/./g, '*') + d });
        else if ($input.attr("type") === "file") {
            inpVal = $input.val().split("\\");
            inpVal = inpVal[inpVal.length - 1];
        }
        else if ($input.attr("type") === "RadioGroup") {
            var $checkedCB = $(`input[name=${$input.attr("name")}]:checked`);
            inpVal = $checkedCB.val();
            this.curDispValue = $checkedCB.next().text();
        }
        else if (this.curCtrl.ObjType === "PowerSelect") {
            //inpVal = this.curCtrl.tempValue;
            //inpVal = this.curCtrl.selectedRow;
            inpVal = this.curCtrl.getValue();
            console.log("inp");
            console.log(inpVal);
            this.curDispValue = this.curCtrl._DisplayMembers[Object.keys(this.curCtrl._DisplayMembers)[0]].toString().replace(/,/g, ", ");
        }
        else if (this.curCtrl.ObjType === "InputGeoLocation") {
            inpVal = $("#" + $input[0].id + "lat").val() + ", " + $("#" + $input[0].id + "long").val();
        }
        else if (this.curCtrl.ObjType === "StaticCardSet" || this.curCtrl.ObjType === "DynamicCardSet") {
            inpVal = this.getCardsetValue(this.curCtrl);
        }
        else if (this.curCtrl.ObjType === "Survey") {
            inpVal = this.curCtrl.resultantJson;
        }
        else
            inpVal = $input.val();
        //return inpVal.trim();
        return inpVal;
    };

    this.checkRequired = function () {
        if (this.curCtrl.Required && !this.curVal) {
            EbMakeInvalid(`[for=${this.curCtrl.Name}]`, '.chat-ctrl-cont');
            return false;
        }
        else {
            EbMakeValid(`[for=${this.curCtrl.Name}]`, '.chat-ctrl-cont');
            return true;
        }
    };

    this.getDisplayHTML = function (ctrl) {
        let text = ctrl.getDisplayMemberFromDOM();
        if (ctrl.ObjType === "PowerSelect") {
            let res = "";
            let keys = Object.keys(text);
            for (let i = 0; i < keys.length; i++) {
                let itemVals = JSON.stringify(text[keys[i]]).slice(0, -2).slice(2).replace(/":"/g, " : ").replace(/","/g, ", ");
                res += itemVals + "</br>";
            }
            text = res.slice(0, -5);
        }
        if (ctrl.ObjType === "SimpleFileUploader") {
            let tempCtrl = $("#" + ctrl.EbSid).clone();
            tempCtrl.find('input[type="file"]').remove();
            tempCtrl.find('input[type="text"]').remove();
            tempCtrl.attr('id', "");
            if (ctrl.DataVals.Value) {
                tempCtrl.find('.SFUPcontainer').attr('id', "");

            }
            else {
                tempCtrl.find(`#${ctrl.EbSid}_SFUP`).addClass('emtySFUP');
                tempCtrl.find('.SFUPcontainer').empty().append('<span>No file uploaded</span>');
            }
            text = tempCtrl[0].outerHTML;
        }
        return text;
    };



    this.setFormObject = function () {
        this.formObject = {};
        $.each(this.CurFormflatControls, function (i, ctrl) {
            this.formObject[ctrl.Name] = ctrl;
        }.bind(this));
        this.formObject.__getCtrlByPath = this.getCtrlByPath;
    };

    this.getCtrlByPath = function (path) {
        try {
            let form = this.formObject;
            let ctrl = {};
            let pathArr = path.split(".");
            //if (pathArr.length === 3) {
            //    path = pathArr[0] + '.' + pathArr[1] + '.' + "currentRow" + '.' + pathArr[2];
            //    ctrl = eval(path);
            //    ctrl.IsDGCtrl = true;
            //} else
            {
                ctrl = eval(path);
            }
            return ctrl;
        }
        catch (e) {
            console.warn("could not find:" + path);
            return "not found";
        }
    }.bind(this);

    this.tryOnChangeDuties = function (curCtrl) {
        if (curCtrl.DependedValExp) {
            $.each(curCtrl.DependedValExp.$values, function (i, depCtrl_s) {
                let depCtrl = this.getCtrlByPath(depCtrl_s);
                if (depCtrl === "not found")
                    return;
                try {
                    if (depCtrl.ObjType === "TVcontrol") {
                        if (depCtrl.reloadWithParam) { // control comes after TVcontrol initialised - update cur control param and reload
                            depCtrl.reloadWithParam(curCtrl);
                        }
                        else {//  control comes before TVcontrol initialised - set cur control param
                            let val = curCtrl.getValue();

                            if (!depCtrl.__filterValues)
                                depCtrl.__filterValues = [];

                            let filterObj = getObjByval(depCtrl.__filterValues, "Name", curCtrl.Name);
                            if (filterObj)
                                filterObj.Value = val;
                            else
                                depCtrl.__filterValues.push(new fltr_obj(curCtrl.EbDbType, curCtrl.Name, val));
                        }
                    }
                    //else {
                    //    if (depCtrl.ValueExpr && depCtrl.ValueExpr.Lang === 0) {
                    //        let valExpFnStr = atob(depCtrl.ValueExpr.Code);
                    //        let ValueExpr_val = new Function("form", "user", `event`, valExpFnStr).bind(depCtrl_s, this.FO.formObject, this.FO.userObject)();
                    //        if (valExpFnStr) {
                    //            if (this.FO.formObject.__getCtrlByPath(curCtrl.__path).IsDGCtrl || !depCtrl.IsDGCtrl) {
                    //                if (!this.FO.Mode.isView || depCtrl.DoNotPersist)
                    //                    depCtrl.setValue(ValueExpr_val);
                    //            }
                    //            else {
                    //                $.each(depCtrl.__DG.AllRowCtrls, function (rowid, row) {
                    //                    row[depCtrl.Name].setValue(ValueExpr_val);
                    //                }.bind(this));
                    //            }
                    //        }
                    //    }
                    //    else if (depCtrl.ValueExpr && depCtrl.ValueExpr.Lang === 2) {
                    //        let params = [];

                    //        $.each(depCtrl.ValExpParams.$values, function (i, depCtrl_s) {// duplicate code in eb_utility.js
                    //            try {
                    //                let paramCtrl = this.FO.formObject.__getCtrlByPath(depCtrl_s);
                    //                let valExpFnStr = atob(paramCtrl.ValueExpr.Code);
                    //                let param = { Name: paramCtrl.Name, Value: paramCtrl.getValue(), Type: "11" };
                    //                params.push(param);
                    //            }
                    //            catch (e) {
                    //                console.eb_log("eb error :");
                    //                console.eb_log(e);
                    //                alert("error in 'Value Expression' of : " + curCtrl.Name + " - " + e.message);
                    //            }
                    //        }.bind(this));

                    //        ExecQuery(this.FO.FormObj.RefId, depCtrl.Name, params, depCtrl);
                    //    }
                    //}
                }
                catch (e) {
                    console.eb_log("eb error :");
                    console.eb_log(e);
                    alert("error in 'Value Expression' of : " + curCtrl.Name + " - " + e.message);
                }
            }.bind(this));
        }
    };

    this.ctrlSend = function (e) {
        this.curVal = null;
        //this.displayValue = null;
        var $btn = $(e.target).closest("button");
        var $msgDiv = $btn.closest('.msg-cont');
        this.sendBtnIdx = parseInt($btn.attr('idx'));
        this.curCtrl = this.curForm.Controls.$values[this.sendBtnIdx];
        var id = this.curCtrl.Name;
        var next_idx = this.sendBtnIdx + 1;
        this.nxtCtrlIdx = (next_idx > this.nxtCtrlIdx) ? next_idx : this.nxtCtrlIdx;
        var $input = $('#' + this.curCtrl.EbSid);
        //varghese
        //for cards  this.curDispValue  is used
        // this.sendCtrlAfter($msgDiv.hide(), this.curDispValue + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');

        //this.displayValue = this.getDisplayHTML(this.curCtrl);
        if (this.curCtrl.ObjType === 'StaticCardSet' || this.curCtrl.ObjType === 'DynamicCardSet') {
            if (!this.curCtrl.MultiSelect) {
                $('#' + this.curCtrl.EbSid_CtxId).find('.slick-current .card-btn-cont .btn').click();
            }
            var $msg = this.$userMsgBox.clone();
            $btn.parent().parent().remove();
            if ($btn.parent().prev().find('.table tbody').length === 1) {// if summary is present
                let $cartSummary = $btn.parent().prev();
                $cartSummary.find('table th').last().remove();
                $cartSummary.find('table td .remove-cart-item').parent().remove();
                let $sumTd = $cartSummary.find('table td[colspan]');
                if ($sumTd.length > 0) {// if sum is present
                    $sumTd.attr('colspan', parseInt($sumTd.attr('colspan')) - 1);
                }
                $msg.find('.msg-wraper-user').html($cartSummary.html()).append(this.getTime());
            }
            else {
                let disphtml = $btn.parent().prev().find('.slick-active').css('display', 'block');
                if ($(disphtml).find('.card-pls-mns').length > 0) {
                    $(disphtml).find('.card-pls-mns').remove();
                }
                $(disphtml).css('pointer-events', 'none');
                //var rmv = disphtml.find('.card-selbtn-cont').empty();
                $msg.find('.msg-wraper-user').html(disphtml.outerHTML()).append(this.getTime());
                //  $msg.find('.msg-wraper-user').html($btn.parent().prev().find('.slick-active').html()).append(this.getTime());
            }

            $msg.insertAfter($msgDiv);
            $msgDiv.remove();
            this.CurDataMODEL[this.curCtrl.TableName] = this.curCtrl.getDataModel();
        }
        else {
            if (this.curCtrl.IsNonDataInputControl === false) {
                this.curCtrl.DataVals.Value = this.curCtrl.getValueFromDOM();
                this.curCtrl.DataVals.F = this.getDisplayHTML(this.curCtrl);
                this.curVal = this.curCtrl.getValue();
                this.tryOnChangeDuties(this.curCtrl);
            }
            $msgDiv.fadeOut(200);
            let $prevMsg = $(".eb-chatBox").find('[lbl_for = "' + this.curCtrl.Name + '"]').last();
            this.sendCtrlAfter($prevMsg, this.curCtrl.DataVals.F + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');



            this.formValues[id] = this.curVal;
            this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.EbDbType];
        }
        this.callGetControl(this.controlHideDelay);

        if ($('[saveprompt]').length === 1) {
            this.showConfirm();
        }



        //old code


        ////$input.off("blur").on("blur", function () { $btn.click() });//when press Tab key send
        //this.curVal = this.getValue($input);
        //if (this.curCtrl.ObjType === "ImageUploader") {
        //    if (!this.checkRequired()) { return; }
        //    this.replyAsImage($msgDiv, $input[0], next_idx, id);
        //    //if()
        //    //this.formValues[id] = this.curVal;// last value set from outer fn
        //    //this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.ebDbType];
        //}
        //else if (this.curCtrl.ObjType === "RadioGroup" || $input.attr("type") === "RadioGroup" || this.curCtrl.ObjType === "PowerSelect") {
        //    if (!this.checkRequired()) { return; }
        //    this.sendCtrlAfter($msgDiv.hide(), this.curDispValue + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
        //    this.formValues[id] = this.curVal;
        //    if (this.curCtrl.ObjType === "PowerSelect")//////////////////////////-------////////////
        //        this.formValuesWithType[id] = [this.curCtrl.TempValue, this.curCtrl.EbDbType];
        //    else
        //        this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.EbDbType];
        //    this.callGetControl(this.nxtCtrlIdx);
        //}
        //else if (this.curCtrl.ObjType === "StaticCardSet" || this.curCtrl.ObjType === "DynamicCardSet") {
        //    if (!this.checkRequired()) { return; }
        //    if (this.curCtrl.IsDisable) {
        //        $btn.css('display', 'none');
        //        $('#' + this.curCtrl.Name).attr('id', '');
        //    }
        //    else {
        //        this.sendCtrlAfter($msgDiv.hide(), this.curDispValue + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
        //        this.formValues[id] = this.curVal;
        //        this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.EbDbType];
        //    }
        //    this.callGetControl(this.nxtCtrlIdx);
        //}
        //else if (this.curCtrl.ObjType === "Survey") {
        //    this.sendCtrlAfter($msgDiv.hide(), this.curDispValue + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
        //    this.formValues[id] = this.curVal;
        //    this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.EbDbType];
        //    this.callGetControl(this.nxtCtrlIdx);
        //}
        //else if (this.curCtrl.ObjType === "Date" || this.curCtrl.ObjType === "DateTime" || this.curCtrl.ObjType === "Time") {
        //    this.sendCtrlAfter($msgDiv.hide(), this.curVal + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
        //    if (this.curCtrl.ObjType === "Date")
        //        this.curVal = moment(this.curVal, ebcontext.user.Preference.ShortDatePattern).format('YYYY-MM-DD');
        //    else if (this.curCtrl.ObjType === "DateTime")
        //        this.curVal = moment(this.curVal, ebcontext.user.Preference.ShortDatePattern + ' ' + ebcontext.user.Preference.ShortTimePattern).format('YYYY-MM-DD HH:mm:ss');
        //    else if (this.curCtrl.ObjType === "Time")
        //        this.curVal = moment(this.curVal, ebcontext.user.Preference.ShortTimePattern).format('YYYY-MM-DD HH:mm:ss');
        //    this.formValues[id] = this.curVal;
        //    this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.EbDbType];
        //    this.callGetControl(this.nxtCtrlIdx);
        //}
        //else {
        //    this.curVal = this.curVal || $('#' + id).val();
        //    if (!this.checkRequired()) { return; }
        //    this.sendCtrlAfter($msgDiv.hide(), this.curVal + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
        //    this.formValues[id] = this.curVal;
        //    this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.EbDbType];
        //    this.callGetControl(this.nxtCtrlIdx);
        //}

        this.IsEdtMode = false;
        this.IsDpndgCtrEdt = false;
        this.curVal = null;
    }.bind(this);

    this.valueExpHandler = function (nxtCtrl) {
        //var nxtCtrl = this.curForm.Controls.$values[this.nxtCtrlIdx];
        var valExpFunc = this.formFunctions.valueExpressions[nxtCtrl.Name];
        if (valExpFunc !== undefined) {
            this.formValues[nxtCtrl.Name] = valExpFunc(this.formValues, this.userDtls);
            this.formValuesWithType[nxtCtrl.Name] = [this.formValues[nxtCtrl.Name], nxtCtrl.ebDbType];
        }
        else if (nxtCtrl.autoIncrement) {
            this.formValuesWithType[nxtCtrl.Name] = [0, nxtCtrl.ebDbType, true];
        }
        //console.log(this.curForm.Controls.$values[0].selectedRow);//  hardcoding
    };

    this.callGetControl = function (delay) {
        if (this.nxtCtrlIdx !== this.formControls.length) { // if not last control
            if (!this.IsEdtMode || this.IsDpndgCtrEdt) {   // (if not edit mode or IsDpndgCtr edit mode) if not skip calling getControl()
                var visibleIfFn = this.formFunctions.visibleIfs[this.curForm.Controls.$values[this.nxtCtrlIdx].Name];
                //if (this.curForm.Controls.$values[this.nxtCtrlIdx].hidden) {//////////////////////
                this.valueExpHandler(this.curForm.Controls.$values[this.nxtCtrlIdx]);
                //}
                if ((!visibleIfFn || visibleIfFn(this.formValues)) && !this.curForm.Controls.$values[this.nxtCtrlIdx].Hidden) {//checks isVisible or no isVisible defined                    
                    this.getControl(this.nxtCtrlIdx, delay);
                }
                else {
                    this.nxtCtrlIdx++;
                    this.callGetControl(delay);
                }
            }
        }
        else {  //if last control
            if (this.curForm.HaveInputControls && !this.curForm.IsReadOnly) {
                this.showSubmit();
            }
            else {
                //var $btn = $(event.target).closest(".btn");
                //this.sendMsg($btn.text());
                $('.msg-wraper-user [name=ctrledit]').remove();
                //$btn.closest(".msg-cont").remove();
                $('.eb-chatBox').empty();
                this.showDate();
                this.AskWhatU();
            }
        }
        this.enableCtrledit();
    };

    this.showSubmit = function () {
        if ($("[name=formsubmit]").length === 0) {
            setTimeout(function () {
                this.curCtrl = null;
                this.msgFromBot('Are you sure? Can I submit?');
                this.msgFromBot($('<div class="btn-box" saveprompt><button name="formsubmit" class="btn formname-btn">Sure</button><button name="formcancel" class="btn formname-btn">Cancel</button></div>'));
            }.bind(this), this.controlHideDelay);

        }
    };

    this.getControl = function (idx, delay = 0) {
        delay = delay !== 0 ? (delay + 200) : delay;
        setTimeout(function () {
            if (idx === this.formControls.length)
                return;
            var controlHTML = this.formControls[idx][0].outerHTML;
            var $ctrlCont = $(controlHTML);
            this.curCtrl = this.curForm.Controls.$values[idx];
            var name = this.curCtrl.Name;
            //if (!(this.curCtrl && (this.curCtrl.ObjType === "Cards" || this.curCtrl.ObjType === "Locations" || this.curCtrl.ObjType === "InputGeoLocation" || this.curCtrl.ObjType === "Image")))
            if (!(this.curCtrl && this.curCtrl.IsFullViewContol)) {
                if (this.curCtrl.IsReadOnly || this.curCtrl.IsDisable) {
                    $ctrlCont = $(this.wrapIn_chat_ctrl_readonly(controlHTML));
                }
                else {
                    $ctrlCont = $(this.wrapIn_chat_ctrl_cont(idx, controlHTML));
                }
            }
            else {
                if ((this.curCtrl.ObjType === "TVcontrol") || (this.curCtrl.ObjType === "Video") || (this.curCtrl.ObjType === "Image")) {
                    $ctrlCont = $(this.wrapIn_chat_ctrl_readonly(controlHTML));
                }
            }
            var label = this.curCtrl.Label;
            if (label) {
                if (this.curCtrl.HelpText)
                    label += ` (${this.curCtrl.HelpText})`;
                this.msgFromBot(label);
            }
            //if (this.curCtrl.ObjType === "Image") {
            //    let btnhtml = this.proceedBtnHtml('mrg_tp_10');
            //    let readonlywraperhtml = `<div class="chat-ctrl-readonly ctrl-cont-bot flxdirctn_col" ebreadonly="${this.curCtrl.IsDisable}">
            //                                  ${controlHTML}  ${btnhtml} 
            //                             </div>`;
            //    $ctrlCont = $(readonlywraperhtml);
            //    this.msgFromBot($ctrlCont, function () { $(`#${name}`).select(); }, name);
            //    //this.nxtCtrlIdx++;
            //    //this.callGetControl();
            //}
            //else
            if (this.curCtrl.ObjType === "Labels") {
                this.sendLabels(this.curCtrl);
            }
            else
                this.msgFromBot($ctrlCont, function () { $(`#${name}`).select(); }, name);

        }.bind(this), delay);
    }.bind(this);

    this.sendLabels = function (ctrl) {
        $.each(ctrl.LabelCollection.$values, function (idx, label) {
            var lbl = label.Label.trim();
            if (lbl === "")
                return true;
            this.msgFromBot(label.Label);
        }.bind(this));
    };

    this.wrapIn_chat_ctrl_cont = function (idx, controlHTML) {
        return `<div class="chat-ctrl-cont ctrl-cont-bot" ebreadonly="${this.curCtrl.IsDisable}">` + controlHTML + '<div class="ctrl-send-wraper"><button class="btn" idx=' + idx + ' name="ctrlsend"><i class="fa fa-chevron-right" aria-hidden="true"></i></button></div></div>';
    };
    this.wrapIn_chat_ctrl_readonly = function (controlHTML) {
        return `<div class="chat-ctrl-readonly ctrl-cont-bot" ebreadonly="${this.curCtrl.IsDisable}">` + controlHTML + '</div>';

    };

    this.replyAsImage = function ($prevMsg, input, idx, ctrlname) {
        console.log("replyAsImage()");
        var fname = input.files[0].Name;
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                this.sendImgAfter($prevMsg.hide(), e.target.result, ctrlname, fname);
                $(`[for=${ctrlname}] .img-loader:last`).show(100);
                this.uploadImage(e.target.result, ctrlname, idx);
            }.bind(this);
            reader.readAsDataURL(input.files[0]);
        }
    };

    this.sendImgAfter = function ($prevMsg, path, ctrlname, filename) {
        console.log("sendImgAfter()");
        var $msg = this.$userMsgBox.clone();
        $msg.find(".msg-wraper-user").css("padding", "5px");
        var $imgtag = $(`<div class="img-box" for="${ctrlname}"><div class="img-loader"></div><span class="img-edit"  idx="${this.curForm.Controls.$values.indexOf(this.curCtrl)}"  for="${ctrlname}" name="ctrledit"><i class="fa fa-pencil" aria-hidden="true"></i></span><img src="${path}" alt="amal face" width="100%"><div class="file-name">${filename}</div>${this.getTime()}</div>`);
        $msg.find('.msg-wraper-user').append($imgtag);
        $msg.insertAfter($prevMsg);
        //$('.eb-chatBox').scrollTop(99999999999);
    };

    this.uploadImage = function (url, id, idx) {
        console.log("uploadImage");
        var URL = url.substring(url.indexOf(",/") + 1);
        var EbSE = new EbServerEvents({
            ServerEventUrl: this.ServerEventUrl,
            Channels: ["file-upload"],
            Rtoken: this.refreshToken
        });
        EbSE.onUploadSuccess = function (obj, e) {
            $(`[for=${id}] .img-loader:last`).hide(100);
            this.callGetControl();

            this.formValues[id] = obj.objectId;
            this.formValuesWithType[id] = [this.formValues[id], 16];

        }.bind(this);

        $.post("../Boti/UploadFileAsync", {
            'base64': URL,
            "filename": id,
            "type": URL.trim(".")[URL.trim(".").length - 1]
        }).done(function (result) {
            //$(`[for=${id}] .img-loader:last`).hide(100);
            //this.callGetControl(this.nxtCtrlIdx);
            //this.curVal = result;
        }.bind(this));
    }.bind(this);

    this.ctrlEdit = function (e) {
        var $btn = $(e.target).closest("span");
        var idx = parseInt($btn.attr('idx'));
        this.curCtrl = this.curForm.Controls.$values[idx];
        if (this.curCtrl) {
            if (!(this.curCtrl.IsReadOnly || this.curCtrl.IsDisable)) {
                if (this.curCtrl.hasOwnProperty('IsBasicControl')) {
                    if (this.curCtrl.IsBasicControl) {
                        this.$renderAtBottom.show();
                    }
                }
            }

        }
        var NxtRDpndgCtrlName = this.getNxtRndrdDpndgCtrlName(this.curCtrl.Name);
        if (NxtRDpndgCtrlName) {
            this.__idx = idx; this.__NxtRDpndgCtrlName = NxtRDpndgCtrlName; this.__$btn = $btn;
            this.initEDCP();
        }
        else
            this.ctrlEHelper(idx, $btn);
        if ($('[saveprompt]').length === 1) {
            $('[saveprompt]').closest(".msg-cont").prev().remove();
            $('[saveprompt]').closest(".msg-cont").remove();
        }
    }.bind(this);

    this.initEDCP = function () {
        this.$DPEBtn = $(`[name=ctrledit]`).filter(`[idx=${this.__idx}]`).closest(".msg-wraper-user");
        this.$DPEBtn.confirmation({
            placement: 'bottom',
            title: "Edit this field and restart from related point !",
            btnOkLabel: " Edit ",
            btnOkClass: "btn btn-sm btn-warning",
            btnOkIcon: "glyphicon glyphicon-pencil",
            btnCancelIcon: "glyphicon glyphicon-remove-circle",
            onConfirm: this.editDpndCtrl
            //onCancel: function () {
            //    alert("cancel");
            //    //this.$DPEBtn.confirmation('destroy');
            //}.bind(this)
        }).confirmation('show');
    }.bind(this);

    this.ctrlEHelper = function (idx, $btn) {
        this.disableCtrledit();
        this.IsEdtMode = true;
        $('.msg-cont-bot [idx=' + idx + ']').closest('.msg-cont').show(200);
        $("#" + this.curCtrl.Name).click().select();
        ////
        if (this.curCtrl.hasOwnProperty('IsBasicControl')) {
            if (this.curCtrl.IsBasicControl) {
                $btn.closest('.msg-cont').addClass('editctrl_typing');
                $btn.closest('.msg-wraper-user').html(this.$TypeAnim.clone());
            }
        }
        else {
            $btn.closest('.msg-cont').remove();
        }


    };

    this.editDpndCtrl = function () {
        //this.$DPEBtn.confirmation('destroy');
        this.IsDpndgCtrEdt = true;
        this.nxtCtrlIdx = this.curForm.Controls.$values.indexOf(getObjByval(this.curForm.Controls.$values, "name", this.getNxtDpndgCtrlName(this.curCtrl.Name, this.formFunctions.visibleIfs)));
        this.curCtrl = this.curForm.Controls.$values[this.__idx];
        delKeyAndAfter(this.formValues, this.__NxtRDpndgCtrlName);
        delKeyAndAfter(this.formValuesWithType, this.__NxtRDpndgCtrlName);
        $('.eb-chatBox [for=' + this.__NxtRDpndgCtrlName + ']').prev().prev().nextAll().remove();
        this.ctrlEHelper(this.__idx, this.__$btn);
    }.bind(this);

    this.getNxtDpndgCtrlName = function (name, formFuncs) {
        var res = null;
        $.each(formFuncs, function (key, Fn) {
            Sfn = Fn.toString().replace(/ /g, '');
            if (RegExp("(form." + name + "\\b)|(form\\[" + name + "\\]\\b)").test(Sfn)) {
                res = key;
                return false;
            }
        }.bind(this));
        return res;
    }.bind(this);

    this.getNxtRndrdDpndgCtrlName = function (name) {
        var res = null;
        $.each(this.formFunctions.visibleIfs, function (key, Fn) {
            Sfn = Fn.toString().replace(/ /g, '');
            if (RegExp("(form." + name + "\\b)|(form\\[" + name + "\\]\\b)").test(Sfn) && $('.eb-chatBox [for=' + key + ']').length > 0) {
                res = key;
                return false;
            }
        }.bind(this));
        return res;
    }.bind(this);

    this.sendMsg = function (msg) {
        if (!msg)
            return;
        var $msg = this.$userMsgBox.clone();
        $msg.find('.msg-wraper-user').text(msg).append(this.getTime());
        this.$chatBox.append($msg);
        //$('.eb-chatBox').scrollTop(99999999999);
    };

    this.sendCtrl = function (msg) {
        var $msg = this.$userMsgBox.clone();
        $msg.find('.msg-wraper-user').append(msg).append(this.getTime());
        this.$chatBox.append($msg);
        //$('.eb-chatBox').scrollTop(99999999999);
    };

    this.sendCtrlAfter = function ($prevMsg, msg) {
        setTimeout(function () {
            var $msg = this.$userMsgBox.clone();
            $msg.find('.msg-wraper-user').html(msg).append(this.getTime());
            ////
            $('.editctrl_typing').remove();
            this.enableCtrledit();
            this.$renderAtBottom.hide();
            $msg.insertAfter($prevMsg);
            this.scrollToBottom();
        }.bind(this), this.controlHideDelay);
    };

    this.startTypingAnim = function ($msg) {
        $msg.find('.msg-wraper-bot').html(this.$TypeAnim.clone());
    }.bind(this);

    this.showTypingAnim = function () {
        this.$chatBox.append(this.$TypeAnimMsg);
    }.bind(this);

    this.hideTypingAnim = function () {
        this.$TypeAnimMsg.remove();
    }.bind(this);

    this.msgFromBot = function (msg, callbackFn, ctrlname) {
        this.hideTypingAnim();
        var $msg = this.$botMsgBox.clone();
        this.$chatBox.append($msg);
        this.startTypingAnim($msg);
        if (this.ready) {
            setTimeout(function () {
                if (msg instanceof jQuery) {
                    var flg = false;
                    if (ctrlname || typeof ctrlname === typeof "") {
                        $msg.attr("for", ctrlname);
                        $(".eb-chatBox").find('.msg-cont').last().prev().attr({ "lbl_for": ctrlname, "lbl_idx": this.formControls.length })
                    }

                    if (this.curCtrl) {
                        $msg.attr("ctrl-type", this.curCtrl.ObjType);
                        if (!(this.curCtrl.IsReadOnly || this.curCtrl.IsDisable)) {
                            if (this.curCtrl.hasOwnProperty('IsBasicControl')) {
                                //check isreadonly
                                if (this.curCtrl.IsBasicControl) {
                                    this.disableCtrledit();
                                    flg = true;
                                    $msg.remove();
                                    this.$renderAtBottom.append($msg);
                                    this.$renderAtBottom.show();
                                    $msg.find('.bot-icon').remove();
                                    $msg.find('.msg-cont-bot').addClass('msg-cont-w100');
                                    let $msgInner = $msg.find('.msg-wraper-bot').html(msg);
                                    $($msgInner.find('.ctrl-cont-bot')).removeClass('ctrl-cont-bot');
                                    //  $($msgInner.find('.ctrl-wraper')).css('width','100%');
                                    $($msgInner).removeClass('msg-wraper-bot');
                                    $($msgInner).addClass('msg-wraper-renderAtbottom');

                                }

                            }
                        }
                    }

                    if (flg === false) {
                        $msg.find('.bot-icon').remove();
                        $msg.find('.msg-wraper-bot').css("border", "none").css("background-color", "transparent").css("width", "99%").html(msg);
                        $msg.find(".msg-wraper-bot").css("padding-right", "3px");
                    }

                    if (this.curCtrl && this.curCtrl.IsFullViewContol) {
                        $msg.find(".ctrl-wraper").css("width", "100%").css("border", 'none');
                        $msg.find(".msg-wraper-bot").css("margin-left", "12px");
                    }

                    if (this.curCtrl && ($msg.find(".ctrl-wraper").length === 1)) {
                        if ($('#' + this.curCtrl.EbSid).length === 1)
                            this.loadcontrol();
                        else
                            console.error("loadcontrol() called before rendering 'id = " + this.curCtrl.Name + "' element");
                    }
                    if (this.curForm)
                        $msg.attr("form", this.curForm.Name);
                }
                else
                    $msg.find('.msg-wraper-bot').text(msg).append(this.getTime());
                this.ready = true;
                if (callbackFn && typeof callbackFn === typeof function () { })
                    callbackFn();
                this.scrollToBottom();
            }.bind(this), this.typeDelay);
            this.ready = false;
        }
        else {
            $msg.remove();
            setTimeout(function () {
                this.msgFromBot(msg, callbackFn, ctrlname);
            }.bind(this), this.typeDelay + 1);
        }
        //$('.eb-chatBox').scrollTop(99999999999);
        //$('.eb-chatBox').animate({ scrollTop: $('.eb-chatBox')[0].scrollHeight });

    }.bind(this);

    this.scrollToBottom = function () {
        setTimeout(function () {
            $(".eb-chatBox").scrollTo($(".eb-chatBox")[0].scrollHeight, 500, { easing: 'swing' });
        }.bind(this), this.controlHideDelay + this.breathingDelay);
    };

    //to initialise control
    this.loadcontrol = function () {
        if (!this.curCtrl)
            return;
        if (this.initControls[this.curCtrl.ObjType] !== undefined)
            this.initControls[this.curCtrl.ObjType](this.curCtrl, {});
        if (this.curCtrl.IsReadOnly || this.curCtrl.IsDisable) {
            // move code to getcontrol           
            if ($(".chat-ctrl-readonly").length === 0) {
                let btnhtml = this.proceedBtnHtml('mrg_10');
                $('#' + this.curCtrl.EbSid).append(btnhtml);
            }
            else {
                let btnhtml = this.proceedBtnHtml('mrg_tp_10');
                //remove from getcontrols itself
                $('#' + this.curCtrl.EbSid).closest('.chat-ctrl-readonly').find('.ctrl-wraper').addClass('w-100');
                $('#' + this.curCtrl.EbSid).closest('.chat-ctrl-readonly').addClass('flxdirctn_col');
                $('#' + this.curCtrl.EbSid).closest('.chat-ctrl-readonly').append(btnhtml);
            }
            if (!this.curCtrl.IsFullViewContol) {
                this.curCtrl.disable();
            }

            //this.nxtCtrlIdx++;
            //this.callGetControl();
        }
    };

    this.proceedReadonlyCtrl = function () {
        this.nxtCtrlIdx++;
        $('.ctrlproceedBtn-wrapper').remove();
        this.callGetControl();
    }

    this.proceedBtnHtml = function (margin) {
        let btntxt = this.curCtrl.ProceedBtnTxt || "ok";
        let btnhtml = `<div class="ctrlproceedBtn-wrapper ${margin}">
                                        <div class="ctrlproceedBtn">
                                            <div>${btntxt}</div>
                                        </div>
                                    </div>`;
        return btnhtml;
    }

    this.submitReqCheck = function () {
        var $firstCtrl = null;
        $.each(this.curForm.Controls.$values, function (i, control) {
            var $ctrl = $("#" + control.Name);
            if ($ctrl.length !== 0 && control.Required && $ctrl.val().trim() === "") {
                if (!$firstCtrl)
                    $firstCtrl = $ctrl;
                this.makeReqFm(control);
            }
        }.bind(this));

        if ($firstCtrl) {
            $firstCtrl.select();
            return false;
        }
        else
            return true;
    };

    this.formSubmit_fm = function (e) {
        if (!this.submitReqCheck())
            return;
        var $btn = $(e.target).closest(".btn");
        var html = "<div class='sum-box'><table style='font-size: inherit;'>";
        $.each(this.curForm.Controls.$values, function (i, control) {
            if (!control.Hidden) {
                this.curCtrl = control;
                var curval = this.getValue($('#' + control.Name));
                var name = control.Name;

                this.formValues[name] = curval;
                if (control.ObjType === "PowerSelect")
                    this.formValuesWithType[name] = [control.TempValue, control.EbDbType];
                else
                    this.formValuesWithType[name] = [curval, control.EbDbType];
                html += `<tr><td style='padding: 5px;'>${control.Label}</td> <td style='padding-left: 10px;'>${this.formValuesWithType[name][0]}</td></tr>`;
            }
            this.valueExpHandler(control);
        }.bind(this));
        this.sendCtrl($(html + "</table></div>"));
        this.sendMsg($btn.text());
        this.showConfirm();
    }.bind(this);

    this.formCancel_fm = function (e) {
        var $btn = $(e.target).closest(".btn");
        this.sendMsg($btn.text());
        $('.msg-wraper-user [name=ctrledit]').remove();
        $btn.closest(".msg-cont").remove();
        this.AskWhatU();
    }.bind(this);

    this.formSubmit = function (e) {
        var $btn = $(e.target).closest(".btn");
        this.sendMsg($btn.text());
        $('.msg-wraper-user [name=ctrledit]').remove();
        $btn.closest(".msg-cont").remove();
        this.showConfirm();
    }.bind(this);

    this.formCancel = function (e) {
        var $btn = $(e.target).closest(".btn");
        this.sendMsg($btn.text());
        $('.msg-wraper-user [name=ctrledit]').remove();
        $btn.closest(".msg-cont").remove();
        this.ClearFormVariables();
        $('.eb-chatBox').empty();
        this.showDate();
        this.AskWhatU();
    }.bind(this);

    this.showConfirm = function () {
        this.ClearFormVariables();
        this.DataCollection();
    }.bind(this);

    this.ClearFormVariables = function () {
        this.formFunctions.visibleIfs = {};
        this.formFunctions.valueExpressions = {};
        this.nxtCtrlIdx = 0;
        $(`[form=${this.curForm.Name}]`).remove();
    };

    this.getFormValuesObjWithTypeColl = function () {
        let WebformData = {};

        WebformData.MultipleTables = formatData4webform(this.CurDataMODEL);
        WebformData.ExtendedTables = {};
        console.log("form data --");


        //console.log("old data --");
        console.log(JSON.stringify(WebformData.MultipleTables));

        console.log("new data --");
        console.log(JSON.stringify(formatData4webform(this.DataMODEL)));
        return JSON.stringify(WebformData);
    };


    //this.getFormValuesWithTypeColl = function () {
    //    var FVWTcoll = [];
    //    this.CurDataMODEL;
    //    $.each(this.formValuesWithType, function (key, val) {
    //        FVWTcoll.push({ Name: key, Value: val[0], Type: val[1], AutoIncrement: val[2] });
    //    });
    //    this.formValuesWithType = {};
    //    this.formValues = {};
    //    return FVWTcoll;
    //};
    //save botform
    this.DataCollection = function () {
        this.showTypingAnim();
        $.ajax({
            type: "POST",
            //url: this.ssurl + "/bots",
            url: "../Boti/UpdateFormData",
            data: {
                RefId: this.curRefid, rowid: this.CurRowId, data: this.getFormValuesObjWithTypeColl()
            },
            //beforeSend: function (xhr) {
            //    xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
            //}.bind(this),
            success: this.ajaxsuccess.bind(this),
        });
        this.formValues = {};
    };

    this.ajaxsuccess = function (resp) {
        this.hideTypingAnim();
        let msg = '';
        let respObj = JSON.parse(resp);
        if (respObj.Status === 200) {
            //EbMessage("show", { Message: "DataCollection success", AutoHide: true, Background: '#1ebf1e', Delay: 4000 });
            msg = `Your ${this.curForm.DisplayName} form submitted successfully 😊`;
        }
        else {
            //EbMessage("show", { Message: "Something went wrong", AutoHide: true, Background: '#bf1e1e', Delay: 4000 });
            this.msgFromBot("Something went wrong ☹️");
            msg = `Your ${this.curForm.DisplayName} form submission failed`;
            console.log(respObj.MessageInt);
        }
        $('.eb-chatBox').empty();
        this.showDate();
        this.msgFromBot(msg);
        this.AskWhatU();
        //EbMessage("show", { Message: 'DataCollection Success', AutoHide: false, Backgorund: '#bf1e1e' });
    };

    this.AskWhatU = function () {
        //this.Query("Click to explore", this.formNames, "form-opt", Object.keys(this.formsDict));
        this.Query_botformlist("Click to explore", this.formNames, "form-opt", Object.keys(this.formsDict), this.formIcons);
    };

    this.showDate = function () {
        var today = new Date();
        var dd = today.getDate();
        var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
        var mmm = m_names[today.getMonth()]; //January is 0!
        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        today = dd + '-' + mmm + '-' + yyyy;
        this.$frameHeader.empty();
        this.$frameHeader.append(`<div class="chat-date"><span>${today}</span></div>`);
        this.setStartOver();
    };

    this.setStartOver = function () {
        this.$chatBox.append(this.$frameHeader.append(`<div class="startOvercont" title="Start Over"> <button type="button" id="eb_botStartover" class="btn btn-default btn-sm">
         <i class="fa fa-repeat"></i>
        </button></div>`));
    };

    this.getTime = function () {
        let hour = new Date().getHours();
        let am_pm = "am";
        let minuteStr = new Date().getMinutes();
        minuteStr = minuteStr < 10 ? ("0" + minuteStr) : minuteStr;
        if (hour > 12) {
            hourStr = hour % 12;
            am_pm = "pm";
        }
        else if (hour === 12) {
            hourStr = hour;
            am_pm = "pm";
        }

        let timeString = hour + ':' + minuteStr + am_pm;
        return `<div class='msg-time'>${timeString}</div>`;
    };

    this.loadCtrlScript = function () {
        $("head").append(this.CntrlHeads);
    };

    this.authFailed = function () {
        alert("auth failed");
    };

    this.enableCtrledit = function () {
        $('[name="ctrledit"]').show(200);
    };

    this.disableCtrledit = function () {
        $('[name="ctrledit"]').hide(200);
    };

    this.authenticate = function () {
        this.showTypingAnim();

        $.post("../bote/AuthAndGetformlist",
            {
                "cid": this.EXPRESSbase_SOLUTION_ID,
                "appid": this.EXPRESSbase_APP_ID,
                "socialId": this.FBResponse.id,
                "wc": "bc",
                "anon_email": this.userDtls.email,
                "anon_phno": null,
                "user_ip": this.userDtls.ip,
                "user_browser": this.userDtls.browser,
                "user_name": this.userDtls.name || null,
            }, function (result) {
                this.hideTypingAnim();
                if (result.status === false) {
                    this.msgFromBot(result.errorMsg);
                }
                else {
                    //this.bearerToken = result.bearerToken;
                    //this.refreshToken = result.refreshToken;
                    this.formsDict = result.botFormDict;
                    window.ebcontext.user = JSON.parse(result.user);
                    //this.formNames = Object.values(this.formsDict);
                    this.formNames = Object.values(result.botFormNames);
                    this.formIcons = result.botFormIcons;
                    $('.eb-chatBox').empty();
                    this.showDate();
                    this.AskWhatU();
                    // this.ajaxSetup4Future();
                }

            }.bind(this));
    }.bind(this);

    this.FBlogin = function (e) {
        this.postmenuClick(e);
        if (this.CurFormIdx === 0)
            this.login2FB();
        else {
            this.collectContacts();

        }
    }.bind(this);

    this.login2FB = function () {
        this.FB.login(function (response) {
            if (response.authResponse) {
                // statusChangeCallback(response);
                if (response.status === 'connected') {
                    this.FBLogined();
                } else {
                    this.FBNotLogined();
                }
            } else {
                //change needed
                this.collectContacts();
            }
        }.bind(this), { scope: 'email' });
    };

    this.FBLogined = function () {
        this.FB.api('/me?fields=id,name,picture,email', function (response) {
            if (response.hasOwnProperty('email')) {
                this.FBResponse = response;
                this.userDtls.name = this.FBResponse.name;
                this.userDtls.email = this.FBResponse.email;
                this.$userMsgBox.find(".bot-icon-user").css('background', `url(${this.FBResponse.picture.data.url})center center no-repeat`);
                this.hideTypingAnim();
                this.greetings();
            }
            else {
                console.log("null response from fb");
                this.login2FB();
            }
        }.bind(this));
    }.bind(this);

    this.collectContacts = function () {
        //this.msgFromBot("OK, No issues. Can you Please provide your contact Details ? so that I can understand you better.");
        //this.msgFromBot($('<div class="contct-cont"><div class="contact-inp-wrap"><input id="anon_mail" type="email" placeholder="Email" class="plain-inp"></div><div class="contact-inp-wrap"><input id="anon_phno" type="tel" placeholder="Phone Number" class="plain-inp"></div><button name="contactSubmit" class="contactSubmit">Submit <i class="fa fa-chevron-right" aria-hidden="true"></i></button>'));
    };

    this.continueAsFBUser = function (e) {
        this.postmenuClick(e, "");
        if (this.CurFormIdx === 0) {
            this.sendCtrl("Continue as " + this.userDtls.name);
            this.authenticate();
        }
        else {
            //this.FB.logout(function (response) {
            //    //this.msgFromBot("You are successfully logout from our App");///////////////////////
            //    this.sendCtrl("Not " + this.userDtls.name);
            //    //this.collectContacts();
            //    this.FBNotLogined();
            //}.bind(this));
            this.FB.logout();
            this.sendCtrl("Not " + this.userDtls.name);
            this.login2FB();
        }
    }.bind(this);

    this.FBNotLogined = function () {
        this.hideTypingAnim();
        this.isAlreadylogined = false;
        // this.msgFromBot(this.welcomeMessage);
        //  this.Query("Would you login with your facebook, So I can remember you !", ["Login with facebook", "I don't have facebook account"], "fblogin");
        this.Query("Would you login with your facebook, So I can remember you !", ["Login with facebook"], "fblogin", ["fbbtnstyl"]);
    }.bind(this);

    ////need to be bootstrap... icon in css
    this.sendWrapedCtrl = function (msg, ctrlHtml, id, name) {
        this.msgFromBot(msg);
        let controlHTML = `<div class="" style="width: calc(100% - 57px)">
                                <div class="form-group bot_Login_input" style="margin-bottom: 0px;">
                                  ${ctrlHtml}
                               </div>
                        </div> `;
        let $ctrlCont = $(`<div class="chat-ctrl-cont ctrl-cont-bot">${controlHTML}<div class="ctrl-send-wraper">
                <button class="btn cntct_btn" name="${name}"><i class="fa fa-chevron-right" aria-hidden="true"></i></button></div></div>`);
        this.msgFromBot($ctrlCont, function () { $(`#${id}`).focus(); }, id);
    };

    this.userNameFn = function () {
        let msg = "May I know your name?";
        let ctrlHtml = `<div class="username_wrp"><input chat-inp type="text" class="form-control" id="anon_name" placeholder="Enter Name"></div>`;
        this.sendWrapedCtrl(msg, ctrlHtml, "anon_name", "contactSubmitName");
    }.bind(this);

    this.emailauthFn = function (e) {
        let msg = "Please share your email address so that I can get in touch with you 😊";
        let ctrlHtml = `<div class="emailIcon_wrp"><input chat-inp type="email" class="form-control" id="anon_mail" placeholder="Enter Email"></div>`;
        this.sendWrapedCtrl(msg, ctrlHtml, "anon_mail", "contactSubmitMail");

    }.bind(this);

    this.phoneauthFn = function (e) {
        let msg = "Please provide your phone number";
        let ctrlHtml = `<div class="phoneIcon_wrp"><input chat-inp type="tel" class="form-control" id="anon_phno" placeholder="Phone Number"></div>`;
        this.sendWrapedCtrl(msg, ctrlHtml, "anon_phno", "contactSubmitPhn");
    }.bind(this);

    this.OTP_BasedLogin = function () {
        this.msgFromBot("Please Login");
        let controlHTML = `<div class="" style='width: calc(100% - 57px)'>
                            <div class="form-group otp_Login_input">
                              <label for="username_id">Email or Mobile</label>
                                <div class="username_wrp">
                                <input type="text" class="form-control" id="otp_login_id" placeholder="Enter email or mobile" name="otp_login">
                                </div>
                            </div>
                        </div>`;


        let $ctrlCont = $(`<div class="chat-ctrl-cont ctrl-cont-bot">${controlHTML}<div class="ctrl-send-wraper">
                <button class="btn cntct_btn" name="otpUserSubmitBtn"><i class="fa fa-chevron-right" aria-hidden="true"></i></button></div></div>`);
        this.msgFromBot($ctrlCont, function () { $(`#otpUserLogin`).focus(); }, "otpUserLogin");
    }

    this.Password_basedLogin = function (e) {
        this.msgFromBot("Please provide your username and password");
        let controlHTML = `<div class="" style='width: calc(100% - 57px)'>
                            <div class="form-group bot_Login_input">
                              <label for="username_id">Email:</label>
                                <div class="username_wrp">
                                <input type="email" class="form-control" id="username_id" placeholder="Enter email" name="email">
                                </div>
                            </div>
                            <div class="form-group bot_Login_input">
                              <label for="password_id">Password:</label>
                                <div class="pswrd_wrp">
                                <input type="password" class="form-control" id="password_id" placeholder="Enter password" name="pwd">
                                </div>
                            </div>
                        </div>`;


        let $ctrlCont = $(`<div class="chat-ctrl-cont ctrl-cont-bot">${controlHTML}<div class="ctrl-send-wraper">
                <button class="btn cntct_btn" name="passwordSubmitBtn"><i class="fa fa-chevron-right" aria-hidden="true"></i></button></div></div>`);
        this.msgFromBot($ctrlCont, function () { $(`#pswdbasedLogin`).focus(); }, "pswdbasedLogin");


    }.bind(this);

    this.twoFactorAuthLogin = function (auth) {
        if (!this.resendOTP) {
            this.msgFromBot("Please enter the OTP to verify your account");
        }
        let controlHTML = `<div class="otp_cont">
                <div class="login-sec-image text-center">
                    <img src="/images/logo/${this.EXPRESSbase_cid}.png" data-src= "/images/logo/${this.EXPRESSbase_cid}.png" class="T_logo Eb_Image" />
                </div>
                <div class="otp_warnings"></div>                    
                    <div class="otp_wrp" >
                        <h5>An OTP has been sent to <span id="lastDigit"> ${auth.otpTo}</span> </h5>
                          <input id="partitioned" maxlength='6' value=''/>
                    </div>
                    <div class="timer_resend_wrp" ">
                        <div class="pull-right">
                            <span id="OTPtimer" style="font-weight:bold"></span>
                        </div>
                        <div class="pull-left ">
                            <button class="btn-link" id="resendOTP">Resend</button>
                        </div>
                     </div> 
                </div>`;


        //<h5 class="text-center">Please enter the OTP to verify your account</h5> <br>
        //<button id="otpvalidate" class="btn signin-btn eb_blue w-100">Verify</button>

        let $ctrlCont = $(`<div class="chat-ctrl-cont ctrl-cont-bot">${controlHTML}<div class="ctrl-send-wraper">
                <button class="btn cntct_btn" name="otpvalidateBtn"><i class="fa fa-chevron-right" aria-hidden="true"></i></button></div></div>`);

        setTimeout(function () {
            this.msgFromBot($ctrlCont, function () { $(`#otpvalidate`).focus(); }, "otpvalidate");
            setTimeout(function () {
                this.StartOtpTimer();
            }.bind(this), this.typeDelay);

        }.bind(this), this.typeDelay);


    }.bind(this);

    //otp timer
    this.resendOTP = false;
    this.StartOtpTimer = function () {
        setTimeout(function () {
            this.resendOTP = false;
            document.getElementById('OTPtimer').innerHTML = 003 + ":" + 00;
            this.startTimer();
        }.bind(this), this.typeDelay);

    }.bind(this);

    this.startTimer = function () {
        if (this.resendOTP)
            return;
        var presentTime = document.getElementById('OTPtimer').innerHTML;
        var timeArray = presentTime.split(/[:]+/);
        var m = timeArray[0];
        var s = this.checkSecond((timeArray[1] - 1));
        if (s == 59) { m = m - 1 }
        if (m < 0) {
            this.OtpTimeOut();
            return;
        }

        document.getElementById('OTPtimer').innerHTML = m + ":" + s;
        console.log(m);
        /////////////////////////////////////////////////////////54646546546546565465
        setTimeout(this.startTimer, 1000);
    }.bind(this);

    this.OtpTimeOut = function () {
        this.msgFromBot("Time out");
        // EbMessage("show", { Background: "red", Message: "Time out" });
        setTimeout(function () {
            this.botStartoverfn()
        }.bind(this), this.typeDelay * 2);

    }.bind(this);

    this.checkSecond = function (sec) {
        if (sec < 10 && sec >= 0) { sec = "0" + sec; } // add zero in front of numbers < 10
        if (sec < 0) { sec = "59"; }
        return sec;
    }

    this.otpvalidate = function (e) {
        $(e.target).closest('button').attr('disabled', true);
        this.showTypingAnim();
        if (this.botflg.otptype == "signinotp") {
            $.ajax({
                url: "../bote/PasswordAuthAndGetformlist",
                type: "POST",
                data: {
                    "uname": this.botflg.uname_otp,
                    "cid": this.EXPRESSbase_SOLUTION_ID,
                    "appid": this.EXPRESSbase_APP_ID,
                    "wc": "bc",
                    "user_ip": this.userDtls.ip,
                    "user_browser": this.userDtls.browser,
                    "otptype": this.botflg.otptype,
                    "otp": $("#partitioned").val(),
                },
                success: function (result) {
                    this.hideTypingAnim();
                    if (result.status === false) {
                        this.msgFromBot(result.errorMsg);
                    }
                    else {

                        //  document.cookie = "bot_bToken=" + result.bearerToken + "; path=/"; 
                        // document.cookie = "bot_rToken=" + result.refreshToken + "; path=/"; 
                        this.formsDict = result.botFormDict;
                        window.ebcontext.user = JSON.parse(result.user);
                        //this.formNames = Object.values(this.formsDict);
                        this.formNames = Object.values(result.botFormNames);
                        this.formIcons = result.botFormIcons;
                        $('.eb-chatBox').empty();
                        this.showDate();
                        this.AskWhatU();
                    }

                }.bind(this)
            });
        }
        else {
            $.post("../bote/ValidateOtp",
                {
                    otp: $("#partitioned").val(),
                    appid: this.EXPRESSbase_APP_ID,
                    otptype: this.botflg.otptype
                },
                function (result) {
                    if (result.status) {
                        //this.bearerToken = result.bearerToken;
                        //this.refreshToken = result.refreshToken;
                        this.formsDict = result.botFormDict;
                        window.ebcontext.user = JSON.parse(result.user);
                        //this.formNames = Object.values(this.formsDict);
                        this.formNames = Object.values(result.botFormNames);
                        this.formIcons = result.botFormIcons;
                        $('.eb-chatBox').empty();
                        this.showDate();
                        this.AskWhatU();
                    }
                    else {
                        $("[for=otpvalidate]").remove();
                        $("[lbl_for=otpvalidate]").remove();
                        this.msgFromBot(result.errorMsg);

                    }

                }.bind(this)
            );
        }

    }.bind(this);


    this.otpResendFn = function () {
        this.resendOTP = true;
        $.post("../bote/ResendOtp",
            { otptype: this.botflg.otptype },
            function (auth) {
                if (auth.authStatus) {
                    $("[for=otpvalidate]").remove();
                    $("[lbl_for=otpvalidate]").remove();
                    this.msgFromBot("OTP has been sent again");
                    this.twoFactorAuthLogin(auth)
                }
                else {
                    this.msgFromBot(auth.errorMessage);
                }
            }.bind(this));
    }.bind(this);


    this.validateEmail = function (email) {
        //  var re = /\S+@\S+\.\S+/;
        let emailReg = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return emailReg.test(email);
    }

    this.validateMobile = function (mobile) {
        // var phoneReg = /^(\+91-|\+91|0)?\d{10}$/;
        let phoneReg = /^([+]{0,1})([0-9]{10,})$/;
        return phoneReg.test(mobile);
    }

    this.otpLoginFn = function (e) {
        $(e.target).closest('button').attr('disabled', true);
        this.showTypingAnim();
        let uname = $("#otp_login_id").val();
        //let emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        let is_email = this.validateEmail(uname);
        //let phoneRegex = /^(\+91-|\+91|0)?\d{10}$/;
        let is_mobile = this.validateMobile(uname);
        if (is_email || is_mobile) {
            $.ajax({
                url: "../bote/SendSignInOtp",
                type: "POST",
                data: {
                    "uname": uname,
                    "is_email": is_email,
                    "is_mobile": is_mobile
                },
                success: function (result) {
                    this.hideTypingAnim();

                    if (result.authStatus) {
                        $("[for=otpUserLogin]").remove();
                        $("[lbl_for=otpUserLogin]").remove();
                        this.botflg.otptype = "signinotp";
                        this.botflg.uname_otp = uname;
                        this.twoFactorAuthLogin(result)
                    }
                    else if (result.authStatus === false) {
                        this.msgFromBot(result.errorMessage);
                    }

                }.bind(this)
            });
        }

    }.bind(this);

    this.passwordLoginFn = function (e) {
        $(e.target).closest('button').attr('disabled', true);
        this.showTypingAnim();
        $.ajax({
            url: "../bote/PasswordAuthAndGetformlist",
            type: "POST",
            data: {
                "uname": $("#username_id").val().trim(),
                "pass": $("#password_id").val().trim(),
                "cid": this.EXPRESSbase_SOLUTION_ID,
                "appid": this.EXPRESSbase_APP_ID,
                "wc": "bc",
                "user_ip": this.userDtls.ip,
                "user_browser": this.userDtls.browser,
                "otptype": this.botflg.otptype
            },
            success: function (result) {
                this.hideTypingAnim();
                if (result.status === false) {
                    this.msgFromBot(result.errorMsg);
                }
                else {
                    if (result.is2Factor) {
                        $("[for=pswdbasedLogin]").remove();
                        $("[lbl_for=pswdbasedLogin]").remove();
                        this.botflg.otptype = "2faotp";
                        this.twoFactorAuthLogin(result);
                    }
                    else {

                        //  document.cookie = "bot_bToken=" + result.bearerToken + "; path=/"; 
                        // document.cookie = "bot_rToken=" + result.refreshToken + "; path=/"; 
                        this.formsDict = result.botFormDict;
                        window.ebcontext.user = JSON.parse(result.user);
                        //this.formNames = Object.values(this.formsDict);
                        this.formNames = Object.values(result.botFormNames);
                        this.formIcons = result.botFormIcons;
                        $('.eb-chatBox').empty();
                        this.showDate();
                        this.AskWhatU();
                    }

                }

            }.bind(this)
        });
    }.bind(this);


    this.AnonymousLoginOptions = function () {
        this.hideTypingAnim();

        //ASK FOR USER NAME
        if (settings.Authoptions.UserName) {
            this.userNameFn();
        }
        //use seperate function for else part to replace collectContacts
        else {
            if (settings.Authoptions.LoginOpnCount > 1) {
                this.loginList();
            }
            else {
                this.LoginOpnDirectly();
            }

        }
        // this.isAlreadylogined = false;

    }.bind(this);

    this.loginList = function () {
        this.Query(`Please select a login method`, [`Guest login`, `Login with facebook`], "loginOptions");

        //// this.isAlreadylogined = false;
        //let btnhtml = `<div class="loginOptnCont">
        //                <div class="lgnBtnCont" >
        //                    <button class="ebbtn loginOptnBtn" name="loginOptions" optn="guestlogin" ><i class="fa fa-user" style="padding-right:10px"></i>Guest login</button>
        //                </div>`;

        //if (settings.Authoptions.Fblogin) {
        //    this.FB.getLoginStatus(function (response) {
        //        if (response.status === 'connected') {
        //            btnhtml += '<div class="lgnBtnCont" ><button class="ebbtn loginOptnBtn" name="loginOptions" optn="btnFacebook" ><i class="fa fa-facebook" style="padding-right:10px"></i>Login with facebook</button> </div>'
        //        } else {
        //            btnhtml += '<div class="lgnBtnCont" ><button class="ebbtn loginOptnBtn" name="loginOptions" optn="btnFacebook" ><i class="fa fa-facebook" style="padding-right:10px"></i>Login with facebook</button> </div>'
        //        }
        //    });

        //}

        //btnhtml += "</div>";
        //this.msgFromBot($(btnhtml));
    }.bind(this);

    this.loginSelectedOpn = function (e) {
        this.postmenuClick(e)
        if (this.CurFormIdx === 0)
            this.AnonymousUserLogin();
        else {
            this.login2FB();

        }

        //let optnTxt = $(e.target).closest('button').text();
        //this.postmenuClick(e, optnTxt);
        //let optn = $(e.target).closest('button').attr('optn');
        //if (optn === 'guestlogin') {
        //    this.AnonymousUserLogin();
        //}
        //else if (optn === 'btnFacebook') {
        //    this.login2FB();
        //}
    }.bind(this);

    this.AnonymousUserLogin = function () {
        this.hideTypingAnim();
        this.isAlreadylogined = false;
        if (settings.Authoptions.EmailAuth) {
            this.botQueue.push(this.emailauthFn);
        }
        if (settings.Authoptions.PhoneAuth) {
            this.botQueue.push(this.phoneauthFn);
        }
        if (this.botQueue.length > 0)
            (this.botQueue.shift())();

    }.bind(this);

    this.LoginOpnDirectly = function () {
        this.hideTypingAnim();
        // this.isAlreadylogined = false;

        if (settings.Authoptions.EmailAuth || settings.Authoptions.PhoneAuth) {
            this.AnonymousUserLogin()
        }

        else if (settings.Authoptions.Fblogin) {
            if (this.FB != null) {
                this.FB.getLoginStatus(function (response) {
                    if (response.status === 'connected') {
                        this.FBLogined();
                    } else {
                        this.FBNotLogined();
                    }
                }.bind(this));
            }
            else {
                this.FBLogined();
            }

        }

    }.bind(this);


    this.botStartoverfn = function () {
        if (this.botflg.loadFormlist === false) {
            this.ClearFormVariables();
            this.botflg.otptype = "";//clear flags
            this.botflg.uname_otp = "";
            this.$renderAtBottom.empty();
            this.curCtrl = null;
            this.$renderAtBottom.hide();
            $('.eb-chatBox').empty();
            this.showDate();
            this.botUserLogin();
        }

    }.bind(this);

    this.botUserLogin = function () {
        this.msgFromBot(this.welcomeMessage);
        if (!settings.UserType_Internal) {
            if (settings.Authoptions.Fblogin) {
                // This is called with the results from from FB.getLoginStatus().

                window.fbAsyncInit = function () {
                    console.log("bot" + settings.Authoptions.FbAppVer);
                    FB.init({
                        appId: settings.Authoptions.FbAppID,
                        //appId: ('@ViewBag.Env' === 'Development' ? '141908109794829' : ('@ViewBag.Env' === 'Staging' ? '1525758114176201' : '2202041803145524')),//'141908109794829',//,'1525758114176201',//
                        cookie: true,  // enable cookies to allow the server to access
                        // the session
                        xfbml: true,  // parse social plugins on this page
                        version: settings.Authoptions.FbAppVer
                        //version: ('@ViewBag.Env' === 'Development' ? 'v2.11' : ('@ViewBag.Env' === 'Staging' ? 'v2.8' : 'v3.0')) // use graph api version 2.8
                    });

                    FB.getLoginStatus(function (response) {
                        statusChangeCallback(response);
                    });

                };

                // Load the SDK asynchronously
                (function (d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0];
                    if (d.getElementById(id)) return;
                    js = d.createElement(s); js.id = id;
                    js.src = "//connect.facebook.net/en_US/sdk.js";
                    fjs.parentNode.insertBefore(js, fjs);
                }(document, 'script', 'facebook-jssdk'));


                function statusChangeCallback(response) {
                    console.log('statusChangeCallback');
                    this.FB = FB;
                    //if (response.status === 'connected') {
                    //    this.FBLogined();
                    //} else {
                    //    this.FBNotLogined();
                    //}
                }

                // This function is called when someone finishes with the Login
                function checkLoginState() {
                    FB.getLoginStatus(function (response) {
                        statusChangeCallback(response);
                    });
                };
            }
        }
        if ((getTokenFromCookie("bot_bToken") != "") && (getTokenFromCookie("bot_rToken") != "")) {
            this.getBotformList();
        }
        else {
            if (settings.UserType_Internal) {
                if (settings.Authoptions.OTP_based) {
                    this.OTP_BasedLogin();
                } else if (settings.Authoptions.Password_based) {
                    this.Password_basedLogin();
                }
            } else {
                this.AnonymousLoginOptions();
            }
        }

    }.bind(this);



    this.initConnectionCheck = function () {
        Offline.options = { checkOnLoad: true, checks: { image: { url: 'https://expressbase.com/images/logos/EB_Logo.png?' + Date.now() }, active: 'image' } };
        setInterval(this.connectionPing, 500000);///////////////////////////////////////////////////////////////
    };

    this.connectionPing = function () {
        Offline.options.checks.image.url = 'https://expressbase.com/images/logos/EB_Logo.png?' + Date.now();
        if (Offline.state === 'up')
            Offline.check();
        console.log(Offline.state);
    };

    //==========================================



    this.showTblViz = function (e) {
        var $tableCont = $('<div class="table-cont">' + this.curTblViz.bareControlHtml + '</div>');
        this.$chatBox.append($tableCont);
        this.showTypingAnim();
        //$(`#${this.curTblViz.EbSid}`).DataTable({//change ebsid to name
        //    processing: true,
        //    serverSide: false,
        //    dom: 'rt',
        //    columns: this.curTblViz.BotCols,
        //    data: this.curTblViz.BotData,
        //    initComplete: function () {
        //        this.hideTypingAnim();
        //        this.AskWhatU();
        //        $tableCont.show(100);
        //    }.bind(this)
        //dom: "rt",
        //ajax: {
        //    url: 'http://localhost:8000/ds/data/' + this.curTblViz.DataSourceRefId,
        //    type: 'POST',
        //    timeout: 180000,
        //    data: function (dq) {
        //        delete dq.columns; delete dq.order; delete dq.search;
        //        dq.RefId = this.curTblViz.DataSourceRefId;
        //        return dq;
        //    }.bind(this),
        //    dataSrc: function (dd) {
        //        return dd.data;
        //    },
        //    beforeSend: function (xhr) {
        //        xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
        //    }.bind(this),
        //    crossDomain: true
        //}
        //});

        var o = new Object();
        o.containerId = this.curTblViz.name + "Container";
        o.dsid = this.curTblViz.dataSourceRefId;
        o.tableId = this.curTblViz.name + "tbl";
        o.showSerialColumn = true;
        o.showCheckboxColumn = false;
        o.showFilterRow = false;
        o.IsPaging = false;
        o.rendererName = 'Bot';
        //o.scrollHeight = this.scrollHeight + "px";
        //o.fnDblclickCallback = this.dblClickOnOptDDEventHand.bind(this);
        //o.fnKeyUpCallback = this.xxx.bind(this);
        //o.arrowFocusCallback = this.arrowSelectionStylingFcs;
        //o.arrowBlurCallback = this.arrowSelectionStylingBlr;
        //o.fninitComplete = this.initDTpost.bind(this);
        //o.hiddenFieldName = this.vmName;
        //o.showFilterRow = true;
        //o.keyPressCallbackFn = this.DDKeyPress.bind(this);
        o.columns = this.curTblViz.columns;//////////////////////////////////////////////////////
        this.datatable = new EbBasicDataTable(o);

        this.hideTypingAnim();
        this.AskWhatU();
    }.bind(this);

    this.showChartViz = function (e) {
        this.showTypingAnim();
        $.ajax({
            type: 'POST',
            url: '../boti/getData',
            data: { draw: 1, RefId: this.curChartViz.DataSourceRefId, Start: 0, Length: 50, TFilters: [] },
            //beforeSend: function (xhr) {
            //    xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
            //}.bind(this),
            success: this.getDataSuccess.bind(this),
            error: function () { }
        });
    }.bind(this);

    this.getDataSuccess = function (result) {
        this.Gdata = result.data;
        $canvasDiv = $('<div class="chart-cont">' + this.curChartViz.BareControlHtml + '</div>');
        $canvasDiv.find("canvas").attr("id", $canvasDiv.find("canvas").attr("id") + ++this.ChartCounter);
        this.$chatBox.append($canvasDiv);
        this.drawGeneralGraph();
        this.hideTypingAnim();
        this.AskWhatU();
    };

    this.drawGeneralGraph = function () {
        this.getBarData();
        this.gdata = {
            labels: this.XLabel,
            datasets: this.dataset
        };
        this.animateOPtions = this.curChartViz.ShowValue ? new animateObj(0) : false;
        this.goptions = {
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: (this.type !== "pie") ? true : false,
                        labelString: (this.curChartViz.YaxisTitle !== "") ? this.curChartViz.YaxisTitle : "YLabel",
                        fontColor: (this.curChartViz.YaxisTitleColor !== null && this.curChartViz.YaxisTitleColor !== "#ffffff") ? this.curChartViz.YaxisTitleColor : "#000000"
                    },
                    stacked: false,
                    gridLines: {
                        display: (this.curChartViz.Type !== "pie") ? true : false
                    },
                    ticks: {
                        fontSize: 10,
                        fontColor: (this.curChartViz.YaxisLabelColor !== null && this.curChartViz.YaxisTitleColor !== "#ffffff") ? this.curChartViz.YaxisLabelColor : "#000000"
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: (this.type !== "pie") ? true : false,
                        labelString: (this.curChartViz.XaxisTitle !== "") ? this.curChartViz.XaxisTitle : "XLabel",
                        fontColor: (this.curChartViz.XaxisTitleColor !== null && this.curChartViz.YaxisTitleColor !== "#ffffff") ? this.curChartViz.XaxisTitleColor : "#000000"
                    },
                    gridLines: {
                        display: this.type !== "pie" ? true : false
                    },
                    ticks: {
                        fontSize: 10,
                        fontColor: (this.curChartViz.XaxisLabelColor !== null && this.curChartViz.YaxisTitleColor !== "#ffffff") ? this.curChartViz.XaxisLabelColor : "#000000"
                    }
                }]
            },
            zoom: {
                // Boolean to enable zooming
                enabled: true,

                // Zooming directions. Remove the appropriate direction to disable 
                // Eg. 'y' would only allow zooming in the y direction
                mode: 'x'
            },
            pan: {
                enabled: true,
                mode: 'x'
            },
            legend: {
                //onClick: this.legendClick.bind(this)
            },

            tooltips: {
                enabled: this.curChartViz.ShowTooltip
            },
            animation: this.animateOPtions

        };
        if (this.curChartViz.Xaxis.$values.length > 0 && this.curChartViz.Xaxis.$values.length > 0)
            this.drawGraph();

    };

    this.getBarData = function () {
        this.Xindx = [];
        this.Yindx = [];
        this.dataset = [];
        this.XLabel = [];
        this.YLabel = [];
        var xdx = [], ydx = [];
        if (this.curChartViz.Xaxis.$values.length > 0 && this.curChartViz.Yaxis.$values.length > 0) {

            $.each(this.curChartViz.Xaxis.$values, function (i, obj) {
                xdx.push(obj.data);
            });

            $.each(this.curChartViz.Yaxis.$values, function (i, obj) {
                ydx.push(obj.data);
            });

            $.each(this.Gdata, this.getBarDataLabel.bind(this, xdx));

            for (k = 0; k < ydx.length; k++) {
                this.YLabel = [];
                for (j = 0; j < this.Gdata.length; j++)
                    this.YLabel.push(this.Gdata[j][ydx[k]]);
                if (this.curChartViz.Type !== "googlemap") {
                    if (this.curChartViz.Type !== "pie") {
                        this.piedataFlag = false;
                        this.dataset.push(new datasetObj(this.curChartViz.Yaxis.$values[k].name, this.YLabel, this.curChartViz.LegendColor.$values[k].color, this.curChartViz.LegendColor.$values[k].color, false));
                    }
                    else {
                        this.dataset.push(new datasetObj4Pie(this.curChartViz.Yaxis.$values[k].name, this.YLabel, this.curChartViz.LegendColor.$values[k].color, this.curChartViz.LegendColor.$values[k].color, false));
                        this.piedataFlag = true;
                    }
                }
            }
        }
    };

    this.getBarDataLabel = function (xdx, i, value) {
        for (k = 0; k < xdx.length; k++)
            this.XLabel.push(value[xdx[k]]);
    };

    this.drawGraph = function () {
        var canvas = document.getElementById(this.curChartViz.EbSid + this.ChartCounter);//change ebsid to name
        this.chartApi = new Chart(canvas, {
            type: this.curChartViz.Type,
            data: this.gdata,
            options: this.goptions,
        });
    };

    //==========================================
    this.init();
};

var datasetObj = function (label, data, backgroundColor, borderColor, fill) {
    this.label = label;
    this.data = data;
    this.backgroundColor = backgroundColor;
    this.borderColor = borderColor;
    this.fill = fill;
};

function getToken() {
    var b = document.cookie.match('(^|;)\\s*bToken\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}

function getTokenFromCookie(name) {
    // var b = document.cookie.match('(^|;)\\s*bToken\\s*=\\s*([^;]+)');
    var b = document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`);
    return b ? b.pop() : '';
}
var EbSurveyRender = function ($ctrl, bot) {
    this.$curCtrl = $ctrl;
    this.Bot = bot;

    this.$queryCont = $('<div class="survey-qry-cont"></div>');
    this.$optCont = $('<div class="survey-opt-cont"></div>');
    this.$btnCont = $('<div class="survey-btn-cont"></div>');

    this.curQryIndx = 0;

    this.init = function () {
        this.$curCtrl.append(`<div class="survey-final-btn" style="display:none;">
                                <button class='btn' idx='${this.Bot.curForm.controls.indexOf(this.Bot.curCtrl)}'>Hidden</button>
                              </div>`);
        $("body").off("click", ".survey-btn-cont .btn").on("click", ".survey-btn-cont .btn", this.onClickContinue.bind(this));

        this.renderQuery();
    };

    this.renderQuery = function () {
        if (this.Bot.curCtrl.queryList.length > this.curQryIndx) {
            let temp = this.Bot.curCtrl.queryList[this.curQryIndx];
            this.$curCtrl.append(this.$queryCont.clone().append((this.curQryIndx + 1) + ") " + temp.query));
            this.renderOptions();
            this.renderButton();
        }
    }

    this.renderOptions = function () {
        let curQry = this.Bot.curCtrl.queryList[this.curQryIndx];
        var optHtml = ``;
        for (let i = 0; i < curQry.optionsList.length; i++) {
            optHtml += `<label><input type="radio" name="${curQry.queryId}" value="${curQry.optionsList[i].option}"> ${curQry.optionsList[i].option}</label></br>`;
        }
        this.$curCtrl.append(this.$optCont.clone().append(optHtml));
    };

    this.renderButton = function () {
        this.$curCtrl.append(this.$btnCont.clone().append(`<button class='btn'>Continue</button>`));
    };

    this.onClickContinue = function (event) {
        if ((this.Bot.curCtrl.queryList.length - 1) !== this.curQryIndx) {
            $(event.target).parent('.survey-btn-cont').hide();
            this.curQryIndx++;
            this.renderQuery();
        }
        else {
            this.setFinalObject();
            $(".survey-final-btn .btn").click();
        }
    };

    this.setFinalObject = function () {
        var curCtrl = this.Bot.curCtrl;
        var resObj = {};
        var displayValue = `<table>`;
        for (let i = 0; i < curCtrl.queryList.length; i++) {
            let val = $(`.survey-opt-cont input[name=${curCtrl.queryList[i].queryId}]:checked`).val() || "";

            let tempArray = new Array();
            tempArray.push(new Object({ Name: 'surveyid', Value: curCtrl.surveyId, Type: 8 }));//EbDbTypes.Double = 8
            tempArray.push(new Object({ Name: 'option', Value: val }));
            resObj[curCtrl.queryList[i].queryId] = tempArray;

            displayValue += `<tr><td style='width:65%;'>${curCtrl.queryList[i].query}</td><td style='width:35%;'>${val}</td></tr>`;
        }
        displayValue += `</table>`;
        curCtrl.resultantJson = JSON.stringify(resObj);
        this.Bot.curDispValue = displayValue;
    }

    this.init();
}
// jQuery Mask Plugin v1.14.9
// github.com/igorescobar/jQuery-Mask-Plugin
var $jscomp = { scope: {}, findInternal: function (a, f, c) { a instanceof String && (a = String(a)); for (var l = a.length, g = 0; g < l; g++) { var b = a[g]; if (f.call(c, b, g, a)) return { i: g, v: b } } return { i: -1, v: void 0 } } }; $jscomp.defineProperty = "function" == typeof Object.defineProperties ? Object.defineProperty : function (a, f, c) { if (c.get || c.set) throw new TypeError("ES3 does not support getters and setters."); a != Array.prototype && a != Object.prototype && (a[f] = c.value) };
$jscomp.getGlobal = function (a) { return "undefined" != typeof window && window === a ? a : "undefined" != typeof global && null != global ? global : a }; $jscomp.global = $jscomp.getGlobal(this); $jscomp.polyfill = function (a, f, c, l) { if (f) { c = $jscomp.global; a = a.split("."); for (l = 0; l < a.length - 1; l++) { var g = a[l]; g in c || (c[g] = {}); c = c[g] } a = a[a.length - 1]; l = c[a]; f = f(l); f != l && null != f && $jscomp.defineProperty(c, a, { configurable: !0, writable: !0, value: f }) } };
$jscomp.polyfill("Array.prototype.find", function (a) { return a ? a : function (a, c) { return $jscomp.findInternal(this, a, c).v } }, "es6-impl", "es3");
(function (a, f, c) { "function" === typeof define && define.amd ? define(["jquery"], a) : "object" === typeof exports ? module.exports = a(require("jquery")) : a(f || c) })(function (a) {
    var f = function (b, h, e) {
        var d = {
            invalid: [], getCaret: function () { try { var a, n = 0, h = b.get(0), e = document.selection, k = h.selectionStart; if (e && -1 === navigator.appVersion.indexOf("MSIE 10")) a = e.createRange(), a.moveStart("character", -d.val().length), n = a.text.length; else if (k || "0" === k) n = k; return n } catch (A) { } }, setCaret: function (a) {
                try {
                    if (b.is(":focus")) {
                        var p,
                        d = b.get(0); d.setSelectionRange ? d.setSelectionRange(a, a) : (p = d.createTextRange(), p.collapse(!0), p.moveEnd("character", a), p.moveStart("character", a), p.select())
                    }
                } catch (z) { }
            }, events: function () {
                b.on("keydown.mask", function (a) { b.data("mask-keycode", a.keyCode || a.which); b.data("mask-previus-value", b.val()) }).on(a.jMaskGlobals.useInput ? "input.mask" : "keyup.mask", d.behaviour).on("paste.mask drop.mask", function () { setTimeout(function () { b.keydown().keyup() }, 100) }).on("change.mask", function () { b.data("changed", !0) }).on("blur.mask",
                function () { c === d.val() || b.data("changed") || b.trigger("change"); b.data("changed", !1) }).on("blur.mask", function () { c = d.val() }).on("focus.mask", function (b) { !0 === e.selectOnFocus && a(b.target).select() }).on("focusout.mask", function () { e.clearIfNotMatch && !g.test(d.val()) && d.val("") })
            }, getRegexMask: function () {
                for (var a = [], b, d, e, k, c = 0; c < h.length; c++) (b = m.translation[h.charAt(c)]) ? (d = b.pattern.toString().replace(/.{1}$|^.{1}/g, ""), e = b.optional, (b = b.recursive) ? (a.push(h.charAt(c)), k = { digit: h.charAt(c), pattern: d }) :
                a.push(e || b ? d + "?" : d)) : a.push(h.charAt(c).replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")); a = a.join(""); k && (a = a.replace(new RegExp("(" + k.digit + "(.*" + k.digit + ")?)"), "($1)?").replace(new RegExp(k.digit, "g"), k.pattern)); return new RegExp(a)
            }, destroyEvents: function () { b.off("input keydown keyup paste drop blur focusout ".split(" ").join(".mask ")) }, val: function (a) { var d = b.is("input") ? "val" : "text"; if (0 < arguments.length) { if (b[d]() !== a) b[d](a); d = b } else d = b[d](); return d }, calculateCaretPosition: function (a, d) {
                var h =
                d.length, e = b.data("mask-previus-value"), k = e.length; 8 === b.data("mask-keycode") && e !== d ? a -= d.slice(0, a).length - e.slice(0, a).length : e !== d && (a = a >= k ? h : a + (d.slice(0, a).length - e.slice(0, a).length)); return a
            }, behaviour: function (e) { e = e || window.event; d.invalid = []; var h = b.data("mask-keycode"); if (-1 === a.inArray(h, m.byPassKeys)) { var h = d.getMasked(), c = d.getCaret(); setTimeout(function (a, b) { d.setCaret(d.calculateCaretPosition(a, b)) }, 10, c, h); d.val(h); d.setCaret(c); return d.callbacks(e) } }, getMasked: function (a, b) {
                var c =
                [], p = void 0 === b ? d.val() : b + "", k = 0, g = h.length, f = 0, l = p.length, n = 1, v = "push", w = -1, r, u; e.reverse ? (v = "unshift", n = -1, r = 0, k = g - 1, f = l - 1, u = function () { return -1 < k && -1 < f }) : (r = g - 1, u = function () { return k < g && f < l }); for (var y; u() ;) {
                    var x = h.charAt(k), t = p.charAt(f), q = m.translation[x]; if (q) t.match(q.pattern) ? (c[v](t), q.recursive && (-1 === w ? w = k : k === r && (k = w - n), r === w && (k -= n)), k += n) : t === y ? y = void 0 : q.optional ? (k += n, f -= n) : q.fallback ? (c[v](q.fallback), k += n, f -= n) : d.invalid.push({ p: f, v: t, e: q.pattern }), f += n; else {
                        if (!a) c[v](x); t === x ?
                        f += n : y = x; k += n
                    }
                } p = h.charAt(r); g !== l + 1 || m.translation[p] || c.push(p); return c.join("")
            }, callbacks: function (a) { var f = d.val(), p = f !== c, g = [f, a, b, e], k = function (a, b, d) { "function" === typeof e[a] && b && e[a].apply(this, d) }; k("onChange", !0 === p, g); k("onKeyPress", !0 === p, g); k("onComplete", f.length === h.length, g); k("onInvalid", 0 < d.invalid.length, [f, a, b, d.invalid, e]) }
        }; b = a(b); var m = this, c = d.val(), g; h = "function" === typeof h ? h(d.val(), void 0, b, e) : h; m.mask = h; m.options = e; m.remove = function () {
            var a = d.getCaret(); d.destroyEvents();
            d.val(m.getCleanVal()); d.setCaret(a); return b
        }; m.getCleanVal = function () { return d.getMasked(!0) }; m.getMaskedVal = function (a) { return d.getMasked(!1, a) }; m.init = function (c) {
            c = c || !1; e = e || {}; m.clearIfNotMatch = a.jMaskGlobals.clearIfNotMatch; m.byPassKeys = a.jMaskGlobals.byPassKeys; m.translation = a.extend({}, a.jMaskGlobals.translation, e.translation); m = a.extend(!0, {}, m, e); g = d.getRegexMask(); if (c) d.events(), d.val(d.getMasked()); else {
                e.placeholder && b.attr("placeholder", e.placeholder); b.data("mask") && b.attr("autocomplete",
                "off"); c = 0; for (var f = !0; c < h.length; c++) { var l = m.translation[h.charAt(c)]; if (l && l.recursive) { f = !1; break } } f && b.attr("maxlength", h.length); d.destroyEvents(); d.events(); c = d.getCaret(); d.val(d.getMasked()); d.setCaret(c)
            }
        }; m.init(!b.is("input"))
    }; a.maskWatchers = {}; var c = function () {
        var b = a(this), c = {}, e = b.attr("data-mask"); b.attr("data-mask-reverse") && (c.reverse = !0); b.attr("data-mask-clearifnotmatch") && (c.clearIfNotMatch = !0); "true" === b.attr("data-mask-selectonfocus") && (c.selectOnFocus = !0); if (l(b, e, c)) return b.data("mask",
        new f(this, e, c))
    }, l = function (b, c, e) { e = e || {}; var d = a(b).data("mask"), h = JSON.stringify; b = a(b).val() || a(b).text(); try { return "function" === typeof c && (c = c(b)), "object" !== typeof d || h(d.options) !== h(e) || d.mask !== c } catch (u) { } }, g = function (a) { var b = document.createElement("div"), c; a = "on" + a; c = a in b; c || (b.setAttribute(a, "return;"), c = "function" === typeof b[a]); return c }; a.fn.mask = function (b, c) {
        c = c || {}; var e = this.selector, d = a.jMaskGlobals, h = d.watchInterval, d = c.watchInputs || d.watchInputs, g = function () {
            if (l(this, b,
            c)) return a(this).data("mask", new f(this, b, c))
        }; a(this).each(g); e && "" !== e && d && (clearInterval(a.maskWatchers[e]), a.maskWatchers[e] = setInterval(function () { a(document).find(e).each(g) }, h)); return this
    }; a.fn.masked = function (a) { return this.data("mask").getMaskedVal(a) }; a.fn.unmask = function () { clearInterval(a.maskWatchers[this.selector]); delete a.maskWatchers[this.selector]; return this.each(function () { var b = a(this).data("mask"); b && b.remove().removeData("mask") }) }; a.fn.cleanVal = function () { return this.data("mask").getCleanVal() };
    a.applyDataMask = function (b) { b = b || a.jMaskGlobals.maskElements; (b instanceof a ? b : a(b)).filter(a.jMaskGlobals.dataMaskAttr).each(c) }; g = {
        maskElements: "input,td,span,div", dataMaskAttr: "*[data-mask]", dataMask: !0, watchInterval: 300, watchInputs: !0, useInput: !/Chrome\/[2-4][0-9]|SamsungBrowser/.test(window.navigator.userAgent) && g("input"), watchDataMask: !1, byPassKeys: [9, 16, 17, 18, 36, 37, 38, 39, 40, 91], translation: {
            0: { pattern: /\d/ }, 9: { pattern: /\d/, optional: !0 }, "#": { pattern: /\d/, recursive: !0 }, A: { pattern: /[a-zA-Z0-9]/ },
            S: { pattern: /[a-zA-Z]/ }
        }
    }; a.jMaskGlobals = a.jMaskGlobals || {}; g = a.jMaskGlobals = a.extend(!0, {}, g, a.jMaskGlobals); g.dataMask && a.applyDataMask(); setInterval(function () { a.jMaskGlobals.watchDataMask && a.applyDataMask() }, g.watchInterval)
}, window.jQuery, window.Zepto);
/*!
 * Bootstrap-select v1.12.2 (http://silviomoreto.github.io/bootstrap-select)
 *
 * Copyright 2013-2017 bootstrap-select
 * Licensed under MIT (https://github.com/silviomoreto/bootstrap-select/blob/master/LICENSE)
 */
!function (a, b) { "function" == typeof define && define.amd ? define(["jquery"], function (a) { return b(a) }) : "object" == typeof module && module.exports ? module.exports = b(require("jquery")) : b(a.jQuery) }(this, function (a) {
    !function (a) {
        "use strict"; function b(b) { var c = [{ re: /[\xC0-\xC6]/g, ch: "A" }, { re: /[\xE0-\xE6]/g, ch: "a" }, { re: /[\xC8-\xCB]/g, ch: "E" }, { re: /[\xE8-\xEB]/g, ch: "e" }, { re: /[\xCC-\xCF]/g, ch: "I" }, { re: /[\xEC-\xEF]/g, ch: "i" }, { re: /[\xD2-\xD6]/g, ch: "O" }, { re: /[\xF2-\xF6]/g, ch: "o" }, { re: /[\xD9-\xDC]/g, ch: "U" }, { re: /[\xF9-\xFC]/g, ch: "u" }, { re: /[\xC7-\xE7]/g, ch: "c" }, { re: /[\xD1]/g, ch: "N" }, { re: /[\xF1]/g, ch: "n" }]; return a.each(c, function () { b = b ? b.replace(this.re, this.ch) : "" }), b } function c(b) { var c = arguments, d = b;[].shift.apply(c); var e, f = this.each(function () { var b = a(this); if (b.is("select")) { var f = b.data("selectpicker"), g = "object" == typeof d && d; if (f) { if (g) for (var h in g) g.hasOwnProperty(h) && (f.options[h] = g[h]) } else { var i = a.extend({}, k.DEFAULTS, a.fn.selectpicker.defaults || {}, b.data(), g); i.template = a.extend({}, k.DEFAULTS.template, a.fn.selectpicker.defaults ? a.fn.selectpicker.defaults.template : {}, b.data().template, g.template), b.data("selectpicker", f = new k(this, i)) } "string" == typeof d && (e = f[d] instanceof Function ? f[d].apply(f, c) : f.options[d]) } }); return "undefined" != typeof e ? e : f } String.prototype.includes || !function () { var a = {}.toString, b = function () { try { var a = {}, b = Object.defineProperty, c = b(a, a, a) && b } catch (a) { } return c }(), c = "".indexOf, d = function (b) { if (null == this) throw new TypeError; var d = String(this); if (b && "[object RegExp]" == a.call(b)) throw new TypeError; var e = d.length, f = String(b), g = f.length, h = arguments.length > 1 ? arguments[1] : void 0, i = h ? Number(h) : 0; i != i && (i = 0); var j = Math.min(Math.max(i, 0), e); return !(g + j > e) && c.call(d, f, i) != -1 }; b ? b(String.prototype, "includes", { value: d, configurable: !0, writable: !0 }) : String.prototype.includes = d }(), String.prototype.startsWith || !function () { var a = function () { try { var a = {}, b = Object.defineProperty, c = b(a, a, a) && b } catch (a) { } return c }(), b = {}.toString, c = function (a) { if (null == this) throw new TypeError; var c = String(this); if (a && "[object RegExp]" == b.call(a)) throw new TypeError; var d = c.length, e = String(a), f = e.length, g = arguments.length > 1 ? arguments[1] : void 0, h = g ? Number(g) : 0; h != h && (h = 0); var i = Math.min(Math.max(h, 0), d); if (f + i > d) return !1; for (var j = -1; ++j < f;)if (c.charCodeAt(i + j) != e.charCodeAt(j)) return !1; return !0 }; a ? a(String.prototype, "startsWith", { value: c, configurable: !0, writable: !0 }) : String.prototype.startsWith = c }(), Object.keys || (Object.keys = function (a, b, c) { c = []; for (b in a) c.hasOwnProperty.call(a, b) && c.push(b); return c }); var d = { useDefault: !1, _set: a.valHooks.select.set }; a.valHooks.select.set = function (b, c) { return c && !d.useDefault && a(b).data("selected", !0), d._set.apply(this, arguments) }; var e = null; a.fn.triggerNative = function (a) { var b, c = this[0]; c.dispatchEvent ? ("function" == typeof Event ? b = new Event(a, { bubbles: !0 }) : (b = document.createEvent("Event"), b.initEvent(a, !0, !1)), c.dispatchEvent(b)) : c.fireEvent ? (b = document.createEventObject(), b.eventType = a, c.fireEvent("on" + a, b)) : this.trigger(a) }, a.expr.pseudos.icontains = function (b, c, d) { var e = a(b), f = (e.data("tokens") || e.text()).toString().toUpperCase(); return f.includes(d[3].toUpperCase()) }, a.expr.pseudos.ibegins = function (b, c, d) { var e = a(b), f = (e.data("tokens") || e.text()).toString().toUpperCase(); return f.startsWith(d[3].toUpperCase()) }, a.expr.pseudos.aicontains = function (b, c, d) { var e = a(b), f = (e.data("tokens") || e.data("normalizedText") || e.text()).toString().toUpperCase(); return f.includes(d[3].toUpperCase()) }, a.expr.pseudos.aibegins = function (b, c, d) { var e = a(b), f = (e.data("tokens") || e.data("normalizedText") || e.text()).toString().toUpperCase(); return f.startsWith(d[3].toUpperCase()) }; var f = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "`": "&#x60;" }, g = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#x27;": "'", "&#x60;": "`" }, h = function (a) { var b = function (b) { return a[b] }, c = "(?:" + Object.keys(a).join("|") + ")", d = RegExp(c), e = RegExp(c, "g"); return function (a) { return a = null == a ? "" : "" + a, d.test(a) ? a.replace(e, b) : a } }, i = h(f), j = h(g), k = function (b, c) { d.useDefault || (a.valHooks.select.set = d._set, d.useDefault = !0), this.$element = a(b), this.$newElement = null, this.$button = null, this.$menu = null, this.$lis = null, this.options = c, null === this.options.title && (this.options.title = this.$element.attr("title")); var e = this.options.windowPadding; "number" == typeof e && (this.options.windowPadding = [e, e, e, e]), this.val = k.prototype.val, this.render = k.prototype.render, this.refresh = k.prototype.refresh, this.setStyle = k.prototype.setStyle, this.selectAll = k.prototype.selectAll, this.deselectAll = k.prototype.deselectAll, this.destroy = k.prototype.destroy, this.remove = k.prototype.remove, this.show = k.prototype.show, this.hide = k.prototype.hide, this.init() }; k.VERSION = "1.12.2", k.DEFAULTS = { noneSelectedText: "Nothing selected", noneResultsText: "No results matched {0}", countSelectedText: function (a, b) { return 1 == a ? "{0} item selected" : "{0} items selected" }, maxOptionsText: function (a, b) { return [1 == a ? "Limit reached ({n} item max)" : "Limit reached ({n} items max)", 1 == b ? "Group limit reached ({n} item max)" : "Group limit reached ({n} items max)"] }, selectAllText: "Select All", deselectAllText: "Deselect All", doneButton: !1, doneButtonText: "Close", multipleSeparator: ", ", styleBase: "btn", style: "btn-default", size: "auto", title: null, selectedTextFormat: "values", width: !1, container: !1, hideDisabled: !1, showSubtext: !1, showIcon: !0, showContent: !0, dropupAuto: !0, header: !1, liveSearch: !1, liveSearchPlaceholder: null, liveSearchNormalize: !1, liveSearchStyle: "contains", actionsBox: !1, iconBase: "glyphicon", tickIcon: "glyphicon-ok", showTick: !1, template: { caret: '<span class="caret"></span>' }, maxOptions: !1, mobile: !1, selectOnTab: !1, dropdownAlignRight: !1, windowPadding: 0 }, k.prototype = {
            constructor: k, init: function () { var b = this, c = this.$element.attr("id"); this.$element.addClass("bs-select-hidden"), this.liObj = {}, this.multiple = this.$element.prop("multiple"), this.autofocus = this.$element.prop("autofocus"), this.$newElement = this.createView(), this.$element.after(this.$newElement).appendTo(this.$newElement), this.$button = this.$newElement.children("button"), this.$menu = this.$newElement.children(".dropdown-menu"), this.$menuInner = this.$menu.children(".inner"), this.$searchbox = this.$menu.find("input"), this.$element.removeClass("bs-select-hidden"), this.options.dropdownAlignRight === !0 && this.$menu.addClass("dropdown-menu-right"), "undefined" != typeof c && (this.$button.attr("data-id", c), a('label[for="' + c + '"]').click(function (a) { a.preventDefault(), b.$button.focus() })), this.checkDisabled(), this.clickListener(), this.options.liveSearch && this.liveSearchListener(), this.render(), this.setStyle(), this.setWidth(), this.options.container && this.selectPosition(), this.$menu.data("this", this), this.$newElement.data("this", this), this.options.mobile && this.mobile(), this.$newElement.on({ "hide.bs.dropdown": function (a) { b.$menuInner.attr("aria-expanded", !1), b.$element.trigger("hide.bs.select", a) }, "hidden.bs.dropdown": function (a) { b.$element.trigger("hidden.bs.select", a) }, "show.bs.dropdown": function (a) { b.$menuInner.attr("aria-expanded", !0), b.$element.trigger("show.bs.select", a) }, "shown.bs.dropdown": function (a) { b.$element.trigger("shown.bs.select", a) } }), b.$element[0].hasAttribute("required") && this.$element.on("invalid", function () { b.$button.addClass("bs-invalid").focus(), b.$element.on({ "focus.bs.select": function () { b.$button.focus(), b.$element.off("focus.bs.select") }, "shown.bs.select": function () { b.$element.val(b.$element.val()).off("shown.bs.select") }, "rendered.bs.select": function () { this.validity.valid && b.$button.removeClass("bs-invalid"), b.$element.off("rendered.bs.select") } }) }), setTimeout(function () { b.$element.trigger("loaded.bs.select") }) }, createDropdown: function () { var b = this.multiple || this.options.showTick ? " show-tick" : "", c = this.$element.parent().hasClass("input-group") ? " input-group-btn" : "", d = this.autofocus ? " autofocus" : "", e = this.options.header ? '<div class="popover-title"><button type="button" class="close" aria-hidden="true">&times;</button>' + this.options.header + "</div>" : "", f = this.options.liveSearch ? '<div class="bs-searchbox"><input type="text" class="form-control" autocomplete="off"' + (null === this.options.liveSearchPlaceholder ? "" : ' placeholder="' + i(this.options.liveSearchPlaceholder) + '"') + ' role="textbox" aria-label="Search"></div>' : "", g = this.multiple && this.options.actionsBox ? '<div class="bs-actionsbox"><div class="btn-group btn-group-sm btn-block"><button type="button" class="actions-btn bs-select-all btn btn-default">' + this.options.selectAllText + '</button><button type="button" class="actions-btn bs-deselect-all btn btn-default">' + this.options.deselectAllText + "</button></div></div>" : "", h = this.multiple && this.options.doneButton ? '<div class="bs-donebutton"><div class="btn-group btn-block"><button type="button" class="btn btn-sm btn-default">' + this.options.doneButtonText + "</button></div></div>" : "", j = '<div class="btn-group bootstrap-select' + b + c + '"><button type="button" class="' + this.options.styleBase + ' dropdown-toggle" data-toggle="dropdown"' + d + ' role="button"><span class="filter-option pull-left"></span>&nbsp;<span class="bs-caret">' + this.options.template.caret + '</span></button><div class="dropdown-menu open" role="combobox">' + e + f + g + '<ul class="dropdown-menu inner" role="listbox" aria-expanded="false"></ul>' + h + "</div></div>"; return a(j) }, createView: function () { var a = this.createDropdown(), b = this.createLi(); return a.find("ul")[0].innerHTML = b, a }, reloadLi: function () { var a = this.createLi(); this.$menuInner[0].innerHTML = a }, createLi: function () { var c = this, d = [], e = 0, f = document.createElement("option"), g = -1, h = function (a, b, c, d) { return "<li" + ("undefined" != typeof c & "" !== c ? ' class="' + c + '"' : "") + ("undefined" != typeof b & null !== b ? ' data-original-index="' + b + '"' : "") + ("undefined" != typeof d & null !== d ? 'data-optgroup="' + d + '"' : "") + ">" + a + "</li>" }, j = function (d, e, f, g) { return '<a tabindex="0"' + ("undefined" != typeof e ? ' class="' + e + '"' : "") + (f ? ' style="' + f + '"' : "") + (c.options.liveSearchNormalize ? ' data-normalized-text="' + b(i(a(d).html())) + '"' : "") + ("undefined" != typeof g || null !== g ? ' data-tokens="' + g + '"' : "") + ' role="option">' + d + '<span class="' + c.options.iconBase + " " + c.options.tickIcon + ' check-mark"></span></a>' }; if (this.options.title && !this.multiple && (g-- , !this.$element.find(".bs-title-option").length)) { var k = this.$element[0]; f.className = "bs-title-option", f.innerHTML = this.options.title, f.value = "", k.insertBefore(f, k.firstChild); var l = a(k.options[k.selectedIndex]); void 0 === l.attr("selected") && void 0 === this.$element.data("selected") && (f.selected = !0) } return this.$element.find("option").each(function (b) { var f = a(this); if (g++ , !f.hasClass("bs-title-option")) { var k = this.className || "", l = this.style.cssText, m = f.data("content") ? f.data("content") : f.html(), n = f.data("tokens") ? f.data("tokens") : null, o = "undefined" != typeof f.data("subtext") ? '<small class="text-muted">' + f.data("subtext") + "</small>" : "", p = "undefined" != typeof f.data("icon") ? '<span class="' + c.options.iconBase + " " + f.data("icon") + '"></span> ' : "", q = f.parent(), r = "OPTGROUP" === q[0].tagName, s = r && q[0].disabled, t = this.disabled || s; if ("" !== p && t && (p = "<span>" + p + "</span>"), c.options.hideDisabled && (t && !r || s)) return void g--; if (f.data("content") || (m = p + '<span class="text">' + m + o + "</span>"), r && f.data("divider") !== !0) { if (c.options.hideDisabled && t) { if (void 0 === q.data("allOptionsDisabled")) { var u = q.children(); q.data("allOptionsDisabled", u.filter(":disabled").length === u.length) } if (q.data("allOptionsDisabled")) return void g-- } var v = " " + q[0].className || ""; if (0 === f.index()) { e += 1; var w = q[0].label, x = "undefined" != typeof q.data("subtext") ? '<small class="text-muted">' + q.data("subtext") + "</small>" : "", y = q.data("icon") ? '<span class="' + c.options.iconBase + " " + q.data("icon") + '"></span> ' : ""; w = y + '<span class="text">' + i(w) + x + "</span>", 0 !== b && d.length > 0 && (g++ , d.push(h("", null, "divider", e + "div"))), g++ , d.push(h(w, null, "dropdown-header" + v, e)) } if (c.options.hideDisabled && t) return void g--; d.push(h(j(m, "opt " + k + v, l, n), b, "", e)) } else if (f.data("divider") === !0) d.push(h("", b, "divider")); else if (f.data("hidden") === !0) d.push(h(j(m, k, l, n), b, "hidden is-hidden")); else { var z = this.previousElementSibling && "OPTGROUP" === this.previousElementSibling.tagName; if (!z && c.options.hideDisabled) for (var A = a(this).prevAll(), B = 0; B < A.length; B++)if ("OPTGROUP" === A[B].tagName) { for (var C = 0, D = 0; D < B; D++) { var E = A[D]; (E.disabled || a(E).data("hidden") === !0) && C++ } C === B && (z = !0); break } z && (g++ , d.push(h("", null, "divider", e + "div"))), d.push(h(j(m, k, l, n), b)) } c.liObj[b] = g } }), this.multiple || 0 !== this.$element.find("option:selected").length || this.options.title || this.$element.find("option").eq(0).prop("selected", !0).attr("selected", "selected"), d.join("") }, findLis: function () { return null == this.$lis && (this.$lis = this.$menu.find("li")), this.$lis }, render: function (b) { var c, d = this; b !== !1 && this.$element.find("option").each(function (a) { var b = d.findLis().eq(d.liObj[a]); d.setDisabled(a, this.disabled || "OPTGROUP" === this.parentNode.tagName && this.parentNode.disabled, b), d.setSelected(a, this.selected, b) }), this.togglePlaceholder(), this.tabIndex(); var e = this.$element.find("option").map(function () { if (this.selected) { if (d.options.hideDisabled && (this.disabled || "OPTGROUP" === this.parentNode.tagName && this.parentNode.disabled)) return; var b, c = a(this), e = c.data("icon") && d.options.showIcon ? '<i class="' + d.options.iconBase + " " + c.data("icon") + '"></i> ' : ""; return b = d.options.showSubtext && c.data("subtext") && !d.multiple ? ' <small class="text-muted">' + c.data("subtext") + "</small>" : "", "undefined" != typeof c.attr("title") ? c.attr("title") : c.data("content") && d.options.showContent ? c.data("content").toString() : e + c.html() + b } }).toArray(), f = this.multiple ? e.join(this.options.multipleSeparator) : e[0]; if (this.multiple && this.options.selectedTextFormat.indexOf("count") > -1) { var g = this.options.selectedTextFormat.split(">"); if (g.length > 1 && e.length > g[1] || 1 == g.length && e.length >= 2) { c = this.options.hideDisabled ? ", [disabled]" : ""; var h = this.$element.find("option").not('[data-divider="true"], [data-hidden="true"]' + c).length, i = "function" == typeof this.options.countSelectedText ? this.options.countSelectedText(e.length, h) : this.options.countSelectedText; f = i.replace("{0}", e.length.toString()).replace("{1}", h.toString()) } } void 0 == this.options.title && (this.options.title = this.$element.attr("title")), "static" == this.options.selectedTextFormat && (f = this.options.title), f || (f = "undefined" != typeof this.options.title ? this.options.title : this.options.noneSelectedText), this.$button.attr("title", j(a.trim(f.replace(/<[^>]*>?/g, "")))), this.$button.children(".filter-option").html(f), this.$element.trigger("rendered.bs.select") }, setStyle: function (a, b) { this.$element.attr("class") && this.$newElement.addClass(this.$element.attr("class").replace(/selectpicker|mobile-device|bs-select-hidden|validate\[.*\]/gi, "")); var c = a ? a : this.options.style; "add" == b ? this.$button.addClass(c) : "remove" == b ? this.$button.removeClass(c) : (this.$button.removeClass(this.options.style), this.$button.addClass(c)) }, liHeight: function (b) { if (b || this.options.size !== !1 && !this.sizeInfo) { var c = document.createElement("div"), d = document.createElement("div"), e = document.createElement("ul"), f = document.createElement("li"), g = document.createElement("li"), h = document.createElement("a"), i = document.createElement("span"), j = this.options.header && this.$menu.find(".popover-title").length > 0 ? this.$menu.find(".popover-title")[0].cloneNode(!0) : null, k = this.options.liveSearch ? document.createElement("div") : null, l = this.options.actionsBox && this.multiple && this.$menu.find(".bs-actionsbox").length > 0 ? this.$menu.find(".bs-actionsbox")[0].cloneNode(!0) : null, m = this.options.doneButton && this.multiple && this.$menu.find(".bs-donebutton").length > 0 ? this.$menu.find(".bs-donebutton")[0].cloneNode(!0) : null; if (i.className = "text", c.className = this.$menu[0].parentNode.className + " open", d.className = "dropdown-menu open", e.className = "dropdown-menu inner", f.className = "divider", i.appendChild(document.createTextNode("Inner text")), h.appendChild(i), g.appendChild(h), e.appendChild(g), e.appendChild(f), j && d.appendChild(j), k) { var n = document.createElement("input"); k.className = "bs-searchbox", n.className = "form-control", k.appendChild(n), d.appendChild(k) } l && d.appendChild(l), d.appendChild(e), m && d.appendChild(m), c.appendChild(d), document.body.appendChild(c); var o = h.offsetHeight, p = j ? j.offsetHeight : 0, q = k ? k.offsetHeight : 0, r = l ? l.offsetHeight : 0, s = m ? m.offsetHeight : 0, t = a(f).outerHeight(!0), u = "function" == typeof getComputedStyle && getComputedStyle(d), v = u ? null : a(d), w = { vert: parseInt(u ? u.paddingTop : v.css("paddingTop")) + parseInt(u ? u.paddingBottom : v.css("paddingBottom")) + parseInt(u ? u.borderTopWidth : v.css("borderTopWidth")) + parseInt(u ? u.borderBottomWidth : v.css("borderBottomWidth")), horiz: parseInt(u ? u.paddingLeft : v.css("paddingLeft")) + parseInt(u ? u.paddingRight : v.css("paddingRight")) + parseInt(u ? u.borderLeftWidth : v.css("borderLeftWidth")) + parseInt(u ? u.borderRightWidth : v.css("borderRightWidth")) }, x = { vert: w.vert + parseInt(u ? u.marginTop : v.css("marginTop")) + parseInt(u ? u.marginBottom : v.css("marginBottom")) + 2, horiz: w.horiz + parseInt(u ? u.marginLeft : v.css("marginLeft")) + parseInt(u ? u.marginRight : v.css("marginRight")) + 2 }; document.body.removeChild(c), this.sizeInfo = { liHeight: o, headerHeight: p, searchHeight: q, actionsHeight: r, doneButtonHeight: s, dividerHeight: t, menuPadding: w, menuExtras: x } } }, setSize: function () { if (this.findLis(), this.liHeight(), this.options.header && this.$menu.css("padding-top", 0), this.options.size !== !1) { var b, c, d, e, f, g, h, i, j = this, k = this.$menu, l = this.$menuInner, m = a(window), n = this.$newElement[0].offsetHeight, o = this.$newElement[0].offsetWidth, p = this.sizeInfo.liHeight, q = this.sizeInfo.headerHeight, r = this.sizeInfo.searchHeight, s = this.sizeInfo.actionsHeight, t = this.sizeInfo.doneButtonHeight, u = this.sizeInfo.dividerHeight, v = this.sizeInfo.menuPadding, w = this.sizeInfo.menuExtras, x = this.options.hideDisabled ? ".disabled" : "", y = function () { var b, c = j.$newElement.offset(), d = a(j.options.container); j.options.container && !d.is("body") ? (b = d.offset(), b.top += parseInt(d.css("borderTopWidth")), b.left += parseInt(d.css("borderLeftWidth"))) : b = { top: 0, left: 0 }; var e = j.options.windowPadding; f = c.top - b.top - m.scrollTop(), g = m.height() - f - n - b.top - e[2], h = c.left - b.left - m.scrollLeft(), i = m.width() - h - o - b.left - e[1], f -= e[0], h -= e[3] }; if (y(), "auto" === this.options.size) { var z = function () { var m, n = function (b, c) { return function (d) { return c ? d.classList ? d.classList.contains(b) : a(d).hasClass(b) : !(d.classList ? d.classList.contains(b) : a(d).hasClass(b)) } }, u = j.$menuInner[0].getElementsByTagName("li"), x = Array.prototype.filter ? Array.prototype.filter.call(u, n("hidden", !1)) : j.$lis.not(".hidden"), z = Array.prototype.filter ? Array.prototype.filter.call(x, n("dropdown-header", !0)) : x.filter(".dropdown-header"); y(), b = g - w.vert, c = i - w.horiz, j.options.container ? (k.data("height") || k.data("height", k.height()), d = k.data("height"), k.data("width") || k.data("width", k.width()), e = k.data("width")) : (d = k.height(), e = k.width()), j.options.dropupAuto && j.$newElement.toggleClass("dropup", f > g && b - w.vert < d), j.$newElement.hasClass("dropup") && (b = f - w.vert), "auto" === j.options.dropdownAlignRight && k.toggleClass("dropdown-menu-right", h > i && c - w.horiz < e - o), m = x.length + z.length > 3 ? 3 * p + w.vert - 2 : 0, k.css({ "max-height": b + "px", overflow: "hidden", "min-height": m + q + r + s + t + "px" }), l.css({ "max-height": b - q - r - s - t - v.vert + "px", "overflow-y": "auto", "min-height": Math.max(m - v.vert, 0) + "px" }) }; z(), this.$searchbox.off("input.getSize propertychange.getSize").on("input.getSize propertychange.getSize", z), m.off("resize.getSize scroll.getSize").on("resize.getSize scroll.getSize", z) } else if (this.options.size && "auto" != this.options.size && this.$lis.not(x).length > this.options.size) { var A = this.$lis.not(".divider").not(x).children().slice(0, this.options.size).last().parent().index(), B = this.$lis.slice(0, A + 1).filter(".divider").length; b = p * this.options.size + B * u + v.vert, j.options.container ? (k.data("height") || k.data("height", k.height()), d = k.data("height")) : d = k.height(), j.options.dropupAuto && this.$newElement.toggleClass("dropup", f > g && b - w.vert < d), k.css({ "max-height": b + q + r + s + t + "px", overflow: "hidden", "min-height": "" }), l.css({ "max-height": b - v.vert + "px", "overflow-y": "auto", "min-height": "" }) } } }, setWidth: function () { if ("auto" === this.options.width) { this.$menu.css("min-width", "0"); var a = this.$menu.parent().clone().appendTo("body"), b = this.options.container ? this.$newElement.clone().appendTo("body") : a, c = a.children(".dropdown-menu").outerWidth(), d = b.css("width", "auto").children("button").outerWidth(); a.remove(), b.remove(), this.$newElement.css("width", Math.max(c, d) + "px") } else "fit" === this.options.width ? (this.$menu.css("min-width", ""), this.$newElement.css("width", "").addClass("fit-width")) : this.options.width ? (this.$menu.css("min-width", ""), this.$newElement.css("width", this.options.width)) : (this.$menu.css("min-width", ""), this.$newElement.css("width", "")); this.$newElement.hasClass("fit-width") && "fit" !== this.options.width && this.$newElement.removeClass("fit-width") }, selectPosition: function () { this.$bsContainer = a('<div class="bs-container" />'); var b, c, d, e = this, f = a(this.options.container), g = function (a) { e.$bsContainer.addClass(a.attr("class").replace(/form-control|fit-width/gi, "")).toggleClass("dropup", a.hasClass("dropup")), b = a.offset(), f.is("body") ? c = { top: 0, left: 0 } : (c = f.offset(), c.top += parseInt(f.css("borderTopWidth")) - f.scrollTop(), c.left += parseInt(f.css("borderLeftWidth")) - f.scrollLeft()), d = a.hasClass("dropup") ? 0 : a[0].offsetHeight, e.$bsContainer.css({ top: b.top - c.top + d, left: b.left - c.left, width: a[0].offsetWidth }) }; this.$button.on("click", function () { var b = a(this); e.isDisabled() || (g(e.$newElement), e.$bsContainer.appendTo(e.options.container).toggleClass("open", !b.hasClass("open")).append(e.$menu)) }), a(window).on("resize scroll", function () { g(e.$newElement) }), this.$element.on("hide.bs.select", function () { e.$menu.data("height", e.$menu.height()), e.$bsContainer.detach() }) }, setSelected: function (a, b, c) { c || (this.togglePlaceholder(), c = this.findLis().eq(this.liObj[a])), c.toggleClass("selected", b).find("a").attr("aria-selected", b) }, setDisabled: function (a, b, c) { c || (c = this.findLis().eq(this.liObj[a])), b ? c.addClass("disabled").children("a").attr("href", "#").attr("tabindex", -1).attr("aria-disabled", !0) : c.removeClass("disabled").children("a").removeAttr("href").attr("tabindex", 0).attr("aria-disabled", !1) }, isDisabled: function () { return this.$element[0].disabled }, checkDisabled: function () { var a = this; this.isDisabled() ? (this.$newElement.addClass("disabled"), this.$button.addClass("disabled").attr("tabindex", -1).attr("aria-disabled", !0)) : (this.$button.hasClass("disabled") && (this.$newElement.removeClass("disabled"), this.$button.removeClass("disabled").attr("aria-disabled", !1)), this.$button.attr("tabindex") != -1 || this.$element.data("tabindex") || this.$button.removeAttr("tabindex")), this.$button.click(function () { return !a.isDisabled() }) }, togglePlaceholder: function () { var a = this.$element.val(); this.$button.toggleClass("bs-placeholder", null === a || "" === a || a.constructor === Array && 0 === a.length) }, tabIndex: function () { this.$element.data("tabindex") !== this.$element.attr("tabindex") && this.$element.attr("tabindex") !== -98 && "-98" !== this.$element.attr("tabindex") && (this.$element.data("tabindex", this.$element.attr("tabindex")), this.$button.attr("tabindex", this.$element.data("tabindex"))), this.$element.attr("tabindex", -98) }, clickListener: function () { var b = this, c = a(document); c.data("spaceSelect", !1), this.$button.on("keyup", function (a) { /(32)/.test(a.keyCode.toString(10)) && c.data("spaceSelect") && (a.preventDefault(), c.data("spaceSelect", !1)) }), this.$button.on("click", function () { b.setSize() }), this.$element.on("shown.bs.select", function () { if (b.options.liveSearch || b.multiple) { if (!b.multiple) { var a = b.liObj[b.$element[0].selectedIndex]; if ("number" != typeof a || b.options.size === !1) return; var c = b.$lis.eq(a)[0].offsetTop - b.$menuInner[0].offsetTop; c = c - b.$menuInner[0].offsetHeight / 2 + b.sizeInfo.liHeight / 2, b.$menuInner[0].scrollTop = c } } else b.$menuInner.find(".selected a").focus() }), this.$menuInner.on("click", "li a", function (c) { var d = a(this), f = d.parent().data("originalIndex"), g = b.$element.val(), h = b.$element.prop("selectedIndex"), i = !0; if (b.multiple && 1 !== b.options.maxOptions && c.stopPropagation(), c.preventDefault(), !b.isDisabled() && !d.parent().hasClass("disabled")) { var j = b.$element.find("option"), k = j.eq(f), l = k.prop("selected"), m = k.parent("optgroup"), n = b.options.maxOptions, o = m.data("maxOptions") || !1; if (b.multiple) { if (k.prop("selected", !l), b.setSelected(f, !l), d.blur(), n !== !1 || o !== !1) { var p = n < j.filter(":selected").length, q = o < m.find("option:selected").length; if (n && p || o && q) if (n && 1 == n) j.prop("selected", !1), k.prop("selected", !0), b.$menuInner.find(".selected").removeClass("selected"), b.setSelected(f, !0); else if (o && 1 == o) { m.find("option:selected").prop("selected", !1), k.prop("selected", !0); var r = d.parent().data("optgroup"); b.$menuInner.find('[data-optgroup="' + r + '"]').removeClass("selected"), b.setSelected(f, !0) } else { var s = "string" == typeof b.options.maxOptionsText ? [b.options.maxOptionsText, b.options.maxOptionsText] : b.options.maxOptionsText, t = "function" == typeof s ? s(n, o) : s, u = t[0].replace("{n}", n), v = t[1].replace("{n}", o), w = a('<div class="notify"></div>'); t[2] && (u = u.replace("{var}", t[2][n > 1 ? 0 : 1]), v = v.replace("{var}", t[2][o > 1 ? 0 : 1])), k.prop("selected", !1), b.$menu.append(w), n && p && (w.append(a("<div>" + u + "</div>")), i = !1, b.$element.trigger("maxReached.bs.select")), o && q && (w.append(a("<div>" + v + "</div>")), i = !1, b.$element.trigger("maxReachedGrp.bs.select")), setTimeout(function () { b.setSelected(f, !1) }, 10), w.delay(750).fadeOut(300, function () { a(this).remove() }) } } } else j.prop("selected", !1), k.prop("selected", !0), b.$menuInner.find(".selected").removeClass("selected").find("a").attr("aria-selected", !1), b.setSelected(f, !0); !b.multiple || b.multiple && 1 === b.options.maxOptions ? b.$button.focus() : b.options.liveSearch && b.$searchbox.focus(), i && (g != b.$element.val() && b.multiple || h != b.$element.prop("selectedIndex") && !b.multiple) && (e = [f, k.prop("selected"), l], b.$element.triggerNative("change")) } }), this.$menu.on("click", "li.disabled a, .popover-title, .popover-title :not(.close)", function (c) { c.currentTarget == this && (c.preventDefault(), c.stopPropagation(), b.options.liveSearch && !a(c.target).hasClass("close") ? b.$searchbox.focus() : b.$button.focus()) }), this.$menuInner.on("click", ".divider, .dropdown-header", function (a) { a.preventDefault(), a.stopPropagation(), b.options.liveSearch ? b.$searchbox.focus() : b.$button.focus() }), this.$menu.on("click", ".popover-title .close", function () { b.$button.click() }), this.$searchbox.on("click", function (a) { a.stopPropagation() }), this.$menu.on("click", ".actions-btn", function (c) { b.options.liveSearch ? b.$searchbox.focus() : b.$button.focus(), c.preventDefault(), c.stopPropagation(), a(this).hasClass("bs-select-all") ? b.selectAll() : b.deselectAll() }), this.$element.change(function () { b.render(!1), b.$element.trigger("changed.bs.select", e), e = null }) }, liveSearchListener: function () { var c = this, d = a('<li class="no-results"></li>'); this.$button.on("click.dropdown.data-api", function () { c.$menuInner.find(".active").removeClass("active"), c.$searchbox.val() && (c.$searchbox.val(""), c.$lis.not(".is-hidden").removeClass("hidden"), d.parent().length && d.remove()), c.multiple || c.$menuInner.find(".selected").addClass("active"), setTimeout(function () { c.$searchbox.focus() }, 10) }), this.$searchbox.on("click.dropdown.data-api focus.dropdown.data-api touchend.dropdown.data-api", function (a) { a.stopPropagation() }), this.$searchbox.on("input propertychange", function () { if (c.$lis.not(".is-hidden").removeClass("hidden"), c.$lis.filter(".active").removeClass("active"), d.remove(), c.$searchbox.val()) { var e, f = c.$lis.not(".is-hidden, .divider, .dropdown-header"); if (e = c.options.liveSearchNormalize ? f.find("a").not(":a" + c._searchStyle() + '("' + b(c.$searchbox.val()) + '")') : f.find("a").not(":" + c._searchStyle() + '("' + c.$searchbox.val() + '")'), e.length === f.length) d.html(c.options.noneResultsText.replace("{0}", '"' + i(c.$searchbox.val()) + '"')), c.$menuInner.append(d), c.$lis.addClass("hidden"); else { e.parent().addClass("hidden"); var g, h = c.$lis.not(".hidden"); h.each(function (b) { var c = a(this); c.hasClass("divider") ? void 0 === g ? c.addClass("hidden") : (g && g.addClass("hidden"), g = c) : c.hasClass("dropdown-header") && h.eq(b + 1).data("optgroup") !== c.data("optgroup") ? c.addClass("hidden") : g = null }), g && g.addClass("hidden"), f.not(".hidden").first().addClass("active") } } }) }, _searchStyle: function () { var a = { begins: "ibegins", startsWith: "ibegins" }; return a[this.options.liveSearchStyle] || "icontains" }, val: function (a) { return "undefined" != typeof a ? (this.$element.val(a), this.render(), this.$element) : this.$element.val() }, changeAll: function (b) { if (this.multiple) { "undefined" == typeof b && (b = !0), this.findLis(); var c = this.$element.find("option"), d = this.$lis.not(".divider, .dropdown-header, .disabled, .hidden"), e = d.length, f = []; if (b) { if (d.filter(".selected").length === d.length) return } else if (0 === d.filter(".selected").length) return; d.toggleClass("selected", b); for (var g = 0; g < e; g++) { var h = d[g].getAttribute("data-original-index"); f[f.length] = c.eq(h)[0] } a(f).prop("selected", b), this.render(!1), this.togglePlaceholder(), this.$element.triggerNative("change") } }, selectAll: function () { return this.changeAll(!0) }, deselectAll: function () { return this.changeAll(!1) }, toggle: function (a) { a = a || window.event, a && a.stopPropagation(), this.$button.trigger("click") }, keydown: function (c) {
                var d, e, f, g, h, i, j, k, l, m = a(this), n = m.is("input") ? m.parent().parent() : m.parent(), o = n.data("this"), p = ":not(.disabled, .hidden, .dropdown-header, .divider)", q = { 32: " ", 48: "0", 49: "1", 50: "2", 51: "3", 52: "4", 53: "5", 54: "6", 55: "7", 56: "8", 57: "9", 59: ";", 65: "a", 66: "b", 67: "c", 68: "d", 69: "e", 70: "f", 71: "g", 72: "h", 73: "i", 74: "j", 75: "k", 76: "l", 77: "m", 78: "n", 79: "o", 80: "p", 81: "q", 82: "r", 83: "s", 84: "t", 85: "u", 86: "v", 87: "w", 88: "x", 89: "y", 90: "z", 96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7", 104: "8", 105: "9" }; if (o.options.liveSearch && (n = m.parent().parent()), o.options.container && (n = o.$menu), d = a('[role="listbox"] li', n), l = o.$newElement.hasClass("open"), !l && (c.keyCode >= 48 && c.keyCode <= 57 || c.keyCode >= 96 && c.keyCode <= 105 || c.keyCode >= 65 && c.keyCode <= 90)) return o.options.container ? o.$button.trigger("click") : (o.setSize(), o.$menu.parent().addClass("open"), l = !0), void o.$searchbox.focus(); if (o.options.liveSearch && (/(^9$|27)/.test(c.keyCode.toString(10)) && l && (c.preventDefault(), c.stopPropagation(), o.$menuInner.click(), o.$button.focus()), d = a('[role="listbox"] li' + p, n), m.val() || /(38|40)/.test(c.keyCode.toString(10)) || 0 === d.filter(".active").length && (d = o.$menuInner.find("li"), d = o.options.liveSearchNormalize ? d.filter(":a" + o._searchStyle() + "(" + b(q[c.keyCode]) + ")") : d.filter(":" + o._searchStyle() + "(" + q[c.keyCode] + ")"))), d.length) {
                    if (/(38|40)/.test(c.keyCode.toString(10))) e = d.index(d.find("a").filter(":focus").parent()), g = d.filter(p).first().index(), h = d.filter(p).last().index(), f = d.eq(e).nextAll(p).eq(0).index(), i = d.eq(e).prevAll(p).eq(0).index(), j = d.eq(f).prevAll(p).eq(0).index(), o.options.liveSearch && (d.each(function (b) { a(this).hasClass("disabled") || a(this).data("index", b) }), e = d.index(d.filter(".active")), g = d.first().data("index"), h = d.last().data("index"), f = d.eq(e).nextAll().eq(0).data("index"), i = d.eq(e).prevAll().eq(0).data("index"), j = d.eq(f).prevAll().eq(0).data("index")), k = m.data("prevIndex"), 38 == c.keyCode ? (o.options.liveSearch && e-- , e != j && e > i && (e = i), e < g && (e = g), e == k && (e = h)) : 40 == c.keyCode && (o.options.liveSearch && e++ , e == -1 && (e = 0), e != j && e < f && (e = f), e > h && (e = h), e == k && (e = g)), m.data("prevIndex", e), o.options.liveSearch ? (c.preventDefault(), m.hasClass("dropdown-toggle") || (d.removeClass("active").eq(e).addClass("active").children("a").focus(), m.focus())) : d.eq(e).children("a").focus(); else if (!m.is("input")) { var r, s, t = []; d.each(function () { a(this).hasClass("disabled") || a.trim(a(this).children("a").text().toLowerCase()).substring(0, 1) == q[c.keyCode] && t.push(a(this).index()) }), r = a(document).data("keycount"), r++ , a(document).data("keycount", r), s = a.trim(a(":focus").text().toLowerCase()).substring(0, 1), s != q[c.keyCode] ? (r = 1, a(document).data("keycount", r)) : r >= t.length && (a(document).data("keycount", 0), r > t.length && (r = 1)), d.eq(t[r - 1]).children("a").focus() } if ((/(13|32)/.test(c.keyCode.toString(10)) || /(^9$)/.test(c.keyCode.toString(10)) && o.options.selectOnTab) && l) {
                        if (/(32)/.test(c.keyCode.toString(10)) || c.preventDefault(), o.options.liveSearch) /(32)/.test(c.keyCode.toString(10)) || (o.$menuInner.find(".active a").click(),
                            m.focus()); else { var u = a(":focus"); u.click(), u.focus(), c.preventDefault(), a(document).data("spaceSelect", !0) } a(document).data("keycount", 0)
                    } (/(^9$|27)/.test(c.keyCode.toString(10)) && l && (o.multiple || o.options.liveSearch) || /(27)/.test(c.keyCode.toString(10)) && !l) && (o.$menu.parent().removeClass("open"), o.options.container && o.$newElement.removeClass("open"), o.$button.focus())
                }
            }, mobile: function () { this.$element.addClass("mobile-device") }, refresh: function () { this.$lis = null, this.liObj = {}, this.reloadLi(), this.render(), this.checkDisabled(), this.liHeight(!0), this.setStyle(), this.setWidth(), this.$lis && this.$searchbox.trigger("propertychange"), this.$element.trigger("refreshed.bs.select") }, hide: function () { this.$newElement.hide() }, show: function () { this.$newElement.show() }, remove: function () { this.$newElement.remove(), this.$element.remove() }, destroy: function () { this.$newElement.before(this.$element).remove(), this.$bsContainer ? this.$bsContainer.remove() : this.$menu.remove(), this.$element.off(".bs.select").removeData("selectpicker").removeClass("bs-select-hidden selectpicker") }
        }; var l = a.fn.selectpicker; a.fn.selectpicker = c, a.fn.selectpicker.Constructor = k, a.fn.selectpicker.noConflict = function () { return a.fn.selectpicker = l, this }, a(document).data("keycount", 0).on("keydown.bs.select", '.bootstrap-select [data-toggle=dropdown], .bootstrap-select [role="listbox"], .bs-searchbox input', k.prototype.keydown).on("focusin.modal", '.bootstrap-select [data-toggle=dropdown], .bootstrap-select [role="listbox"], .bs-searchbox input', function (a) { a.stopPropagation() }), a(window).on("load.bs.select.data-api", function () { a(".selectpicker").each(function () { var b = a(this); c.call(b, b.data()) }) })
    }(a)
});
//# sourceMappingURL=bootstrap-select.js.map
!function (i) { "use strict"; "function" == typeof define && define.amd ? define(["jquery"], i) : "undefined" != typeof exports ? module.exports = i(require("jquery")) : i(jQuery) }(function (i) { "use strict"; var e = window.Slick || {}; (e = function () { var e = 0; return function (t, o) { var s, n = this; n.defaults = { accessibility: !0, adaptiveHeight: !1, appendArrows: i(t), appendDots: i(t), arrows: !0, asNavFor: null, prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">Previous</button>', nextArrow: '<button class="slick-next" aria-label="Next" type="button">Next</button>', autoplay: !1, autoplaySpeed: 3e3, centerMode: !1, centerPadding: "50px", cssEase: "ease", customPaging: function (e, t) { return i('<button type="button" />').text(t + 1) }, dots: !1, dotsClass: "slick-dots", draggable: !0, easing: "linear", edgeFriction: .35, fade: !1, focusOnSelect: !1, focusOnChange: !1, infinite: !0, initialSlide: 0, lazyLoad: "ondemand", mobileFirst: !1, pauseOnHover: !0, pauseOnFocus: !0, pauseOnDotsHover: !1, respondTo: "window", responsive: null, rows: 1, rtl: !1, slide: "", slidesPerRow: 1, slidesToShow: 1, slidesToScroll: 1, speed: 500, swipe: !0, swipeToSlide: !1, touchMove: !0, touchThreshold: 5, useCSS: !0, useTransform: !0, variableWidth: !1, vertical: !1, verticalSwiping: !1, waitForAnimate: !0, zIndex: 1e3 }, n.initials = { animating: !1, dragging: !1, autoPlayTimer: null, currentDirection: 0, currentLeft: null, currentSlide: 0, direction: 1, $dots: null, listWidth: null, listHeight: null, loadIndex: 0, $nextArrow: null, $prevArrow: null, scrolling: !1, slideCount: null, slideWidth: null, $slideTrack: null, $slides: null, sliding: !1, slideOffset: 0, swipeLeft: null, swiping: !1, $list: null, touchObject: {}, transformsEnabled: !1, unslicked: !1 }, i.extend(n, n.initials), n.activeBreakpoint = null, n.animType = null, n.animProp = null, n.breakpoints = [], n.breakpointSettings = [], n.cssTransitions = !1, n.focussed = !1, n.interrupted = !1, n.hidden = "hidden", n.paused = !0, n.positionProp = null, n.respondTo = null, n.rowCount = 1, n.shouldClick = !0, n.$slider = i(t), n.$slidesCache = null, n.transformType = null, n.transitionType = null, n.visibilityChange = "visibilitychange", n.windowWidth = 0, n.windowTimer = null, s = i(t).data("slick") || {}, n.options = i.extend({}, n.defaults, o, s), n.currentSlide = n.options.initialSlide, n.originalSettings = n.options, void 0 !== document.mozHidden ? (n.hidden = "mozHidden", n.visibilityChange = "mozvisibilitychange") : void 0 !== document.webkitHidden && (n.hidden = "webkitHidden", n.visibilityChange = "webkitvisibilitychange"), n.autoPlay = i.proxy(n.autoPlay, n), n.autoPlayClear = i.proxy(n.autoPlayClear, n), n.autoPlayIterator = i.proxy(n.autoPlayIterator, n), n.changeSlide = i.proxy(n.changeSlide, n), n.clickHandler = i.proxy(n.clickHandler, n), n.selectHandler = i.proxy(n.selectHandler, n), n.setPosition = i.proxy(n.setPosition, n), n.swipeHandler = i.proxy(n.swipeHandler, n), n.dragHandler = i.proxy(n.dragHandler, n), n.keyHandler = i.proxy(n.keyHandler, n), n.instanceUid = e++ , n.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/, n.registerBreakpoints(), n.init(!0) } }()).prototype.activateADA = function () { this.$slideTrack.find(".slick-active").attr({ "aria-hidden": "false" }).find("a, input, button, select").attr({ tabindex: "0" }) }, e.prototype.addSlide = e.prototype.slickAdd = function (e, t, o) { var s = this; if ("boolean" == typeof t) o = t, t = null; else if (t < 0 || t >= s.slideCount) return !1; s.unload(), "number" == typeof t ? 0 === t && 0 === s.$slides.length ? i(e).appendTo(s.$slideTrack) : o ? i(e).insertBefore(s.$slides.eq(t)) : i(e).insertAfter(s.$slides.eq(t)) : !0 === o ? i(e).prependTo(s.$slideTrack) : i(e).appendTo(s.$slideTrack), s.$slides = s.$slideTrack.children(this.options.slide), s.$slideTrack.children(this.options.slide).detach(), s.$slideTrack.append(s.$slides), s.$slides.each(function (e, t) { i(t).attr("data-slick-index", e) }), s.$slidesCache = s.$slides, s.reinit() }, e.prototype.animateHeight = function () { var i = this; if (1 === i.options.slidesToShow && !0 === i.options.adaptiveHeight && !1 === i.options.vertical) { var e = i.$slides.eq(i.currentSlide).outerHeight(!0); i.$list.animate({ height: e }, i.options.speed) } }, e.prototype.animateSlide = function (e, t) { var o = {}, s = this; s.animateHeight(), !0 === s.options.rtl && !1 === s.options.vertical && (e = -e), !1 === s.transformsEnabled ? !1 === s.options.vertical ? s.$slideTrack.animate({ left: e }, s.options.speed, s.options.easing, t) : s.$slideTrack.animate({ top: e }, s.options.speed, s.options.easing, t) : !1 === s.cssTransitions ? (!0 === s.options.rtl && (s.currentLeft = -s.currentLeft), i({ animStart: s.currentLeft }).animate({ animStart: e }, { duration: s.options.speed, easing: s.options.easing, step: function (i) { i = Math.ceil(i), !1 === s.options.vertical ? (o[s.animType] = "translate(" + i + "px, 0px)", s.$slideTrack.css(o)) : (o[s.animType] = "translate(0px," + i + "px)", s.$slideTrack.css(o)) }, complete: function () { t && t.call() } })) : (s.applyTransition(), e = Math.ceil(e), !1 === s.options.vertical ? o[s.animType] = "translate3d(" + e + "px, 0px, 0px)" : o[s.animType] = "translate3d(0px," + e + "px, 0px)", s.$slideTrack.css(o), t && setTimeout(function () { s.disableTransition(), t.call() }, s.options.speed)) }, e.prototype.getNavTarget = function () { var e = this, t = e.options.asNavFor; return t && null !== t && (t = i(t).not(e.$slider)), t }, e.prototype.asNavFor = function (e) { var t = this.getNavTarget(); null !== t && "object" == typeof t && t.each(function () { var t = i(this).slick("getSlick"); t.unslicked || t.slideHandler(e, !0) }) }, e.prototype.applyTransition = function (i) { var e = this, t = {}; !1 === e.options.fade ? t[e.transitionType] = e.transformType + " " + e.options.speed + "ms " + e.options.cssEase : t[e.transitionType] = "opacity " + e.options.speed + "ms " + e.options.cssEase, !1 === e.options.fade ? e.$slideTrack.css(t) : e.$slides.eq(i).css(t) }, e.prototype.autoPlay = function () { var i = this; i.autoPlayClear(), i.slideCount > i.options.slidesToShow && (i.autoPlayTimer = setInterval(i.autoPlayIterator, i.options.autoplaySpeed)) }, e.prototype.autoPlayClear = function () { var i = this; i.autoPlayTimer && clearInterval(i.autoPlayTimer) }, e.prototype.autoPlayIterator = function () { var i = this, e = i.currentSlide + i.options.slidesToScroll; i.paused || i.interrupted || i.focussed || (!1 === i.options.infinite && (1 === i.direction && i.currentSlide + 1 === i.slideCount - 1 ? i.direction = 0 : 0 === i.direction && (e = i.currentSlide - i.options.slidesToScroll, i.currentSlide - 1 == 0 && (i.direction = 1))), i.slideHandler(e)) }, e.prototype.buildArrows = function () { var e = this; !0 === e.options.arrows && (e.$prevArrow = i(e.options.prevArrow).addClass("slick-arrow"), e.$nextArrow = i(e.options.nextArrow).addClass("slick-arrow"), e.slideCount > e.options.slidesToShow ? (e.$prevArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"), e.$nextArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"), e.htmlExpr.test(e.options.prevArrow) && e.$prevArrow.prependTo(e.options.appendArrows), e.htmlExpr.test(e.options.nextArrow) && e.$nextArrow.appendTo(e.options.appendArrows), !0 !== e.options.infinite && e.$prevArrow.addClass("slick-disabled").attr("aria-disabled", "true")) : e.$prevArrow.add(e.$nextArrow).addClass("slick-hidden").attr({ "aria-disabled": "true", tabindex: "-1" })) }, e.prototype.buildDots = function () { var e, t, o = this; if (!0 === o.options.dots) { for (o.$slider.addClass("slick-dotted"), t = i("<ul />").addClass(o.options.dotsClass), e = 0; e <= o.getDotCount(); e += 1)t.append(i("<li />").append(o.options.customPaging.call(this, o, e))); o.$dots = t.appendTo(o.options.appendDots), o.$dots.find("li").first().addClass("slick-active") } }, e.prototype.buildOut = function () { var e = this; e.$slides = e.$slider.children(e.options.slide + ":not(.slick-cloned)").addClass("slick-slide"), e.slideCount = e.$slides.length, e.$slides.each(function (e, t) { i(t).attr("data-slick-index", e).data("originalStyling", i(t).attr("style") || "") }), e.$slider.addClass("slick-slider"), e.$slideTrack = 0 === e.slideCount ? i('<div class="slick-track"/>').appendTo(e.$slider) : e.$slides.wrapAll('<div class="slick-track"/>').parent(), e.$list = e.$slideTrack.wrap('<div class="slick-list"/>').parent(), e.$slideTrack.css("opacity", 0), !0 !== e.options.centerMode && !0 !== e.options.swipeToSlide || (e.options.slidesToScroll = 1), i("img[data-lazy]", e.$slider).not("[src]").addClass("slick-loading"), e.setupInfinite(), e.buildArrows(), e.buildDots(), e.updateDots(), e.setSlideClasses("number" == typeof e.currentSlide ? e.currentSlide : 0), !0 === e.options.draggable && e.$list.addClass("draggable") }, e.prototype.buildRows = function () { var i, e, t, o, s, n, r, l = this; if (o = document.createDocumentFragment(), n = l.$slider.children(), l.options.rows > 1) { for (r = l.options.slidesPerRow * l.options.rows, s = Math.ceil(n.length / r), i = 0; i < s; i++) { var d = document.createElement("div"); for (e = 0; e < l.options.rows; e++) { var a = document.createElement("div"); for (t = 0; t < l.options.slidesPerRow; t++) { var c = i * r + (e * l.options.slidesPerRow + t); n.get(c) && a.appendChild(n.get(c)) } d.appendChild(a) } o.appendChild(d) } l.$slider.empty().append(o), l.$slider.children().children().children().css({ width: 100 / l.options.slidesPerRow + "%", display: "inline-block" }) } }, e.prototype.checkResponsive = function (e, t) { var o, s, n, r = this, l = !1, d = r.$slider.width(), a = window.innerWidth || i(window).width(); if ("window" === r.respondTo ? n = a : "slider" === r.respondTo ? n = d : "min" === r.respondTo && (n = Math.min(a, d)), r.options.responsive && r.options.responsive.length && null !== r.options.responsive) { s = null; for (o in r.breakpoints) r.breakpoints.hasOwnProperty(o) && (!1 === r.originalSettings.mobileFirst ? n < r.breakpoints[o] && (s = r.breakpoints[o]) : n > r.breakpoints[o] && (s = r.breakpoints[o])); null !== s ? null !== r.activeBreakpoint ? (s !== r.activeBreakpoint || t) && (r.activeBreakpoint = s, "unslick" === r.breakpointSettings[s] ? r.unslick(s) : (r.options = i.extend({}, r.originalSettings, r.breakpointSettings[s]), !0 === e && (r.currentSlide = r.options.initialSlide), r.refresh(e)), l = s) : (r.activeBreakpoint = s, "unslick" === r.breakpointSettings[s] ? r.unslick(s) : (r.options = i.extend({}, r.originalSettings, r.breakpointSettings[s]), !0 === e && (r.currentSlide = r.options.initialSlide), r.refresh(e)), l = s) : null !== r.activeBreakpoint && (r.activeBreakpoint = null, r.options = r.originalSettings, !0 === e && (r.currentSlide = r.options.initialSlide), r.refresh(e), l = s), e || !1 === l || r.$slider.trigger("breakpoint", [r, l]) } }, e.prototype.changeSlide = function (e, t) { var o, s, n, r = this, l = i(e.currentTarget); switch (l.is("a") && e.preventDefault(), l.is("li") || (l = l.closest("li")), n = r.slideCount % r.options.slidesToScroll != 0, o = n ? 0 : (r.slideCount - r.currentSlide) % r.options.slidesToScroll, e.data.message) { case "previous": s = 0 === o ? r.options.slidesToScroll : r.options.slidesToShow - o, r.slideCount > r.options.slidesToShow && r.slideHandler(r.currentSlide - s, !1, t); break; case "next": s = 0 === o ? r.options.slidesToScroll : o, r.slideCount > r.options.slidesToShow && r.slideHandler(r.currentSlide + s, !1, t); break; case "index": var d = 0 === e.data.index ? 0 : e.data.index || l.index() * r.options.slidesToScroll; r.slideHandler(r.checkNavigable(d), !1, t), l.children().trigger("focus"); break; default: return } }, e.prototype.checkNavigable = function (i) { var e, t; if (e = this.getNavigableIndexes(), t = 0, i > e[e.length - 1]) i = e[e.length - 1]; else for (var o in e) { if (i < e[o]) { i = t; break } t = e[o] } return i }, e.prototype.cleanUpEvents = function () { var e = this; e.options.dots && null !== e.$dots && (i("li", e.$dots).off("click.slick", e.changeSlide).off("mouseenter.slick", i.proxy(e.interrupt, e, !0)).off("mouseleave.slick", i.proxy(e.interrupt, e, !1)), !0 === e.options.accessibility && e.$dots.off("keydown.slick", e.keyHandler)), e.$slider.off("focus.slick blur.slick"), !0 === e.options.arrows && e.slideCount > e.options.slidesToShow && (e.$prevArrow && e.$prevArrow.off("click.slick", e.changeSlide), e.$nextArrow && e.$nextArrow.off("click.slick", e.changeSlide), !0 === e.options.accessibility && (e.$prevArrow && e.$prevArrow.off("keydown.slick", e.keyHandler), e.$nextArrow && e.$nextArrow.off("keydown.slick", e.keyHandler))), e.$list.off("touchstart.slick mousedown.slick", e.swipeHandler), e.$list.off("touchmove.slick mousemove.slick", e.swipeHandler), e.$list.off("touchend.slick mouseup.slick", e.swipeHandler), e.$list.off("touchcancel.slick mouseleave.slick", e.swipeHandler), e.$list.off("click.slick", e.clickHandler), i(document).off(e.visibilityChange, e.visibility), e.cleanUpSlideEvents(), !0 === e.options.accessibility && e.$list.off("keydown.slick", e.keyHandler), !0 === e.options.focusOnSelect && i(e.$slideTrack).children().off("click.slick", e.selectHandler), i(window).off("orientationchange.slick.slick-" + e.instanceUid, e.orientationChange), i(window).off("resize.slick.slick-" + e.instanceUid, e.resize), i("[draggable!=true]", e.$slideTrack).off("dragstart", e.preventDefault), i(window).off("load.slick.slick-" + e.instanceUid, e.setPosition) }, e.prototype.cleanUpSlideEvents = function () { var e = this; e.$list.off("mouseenter.slick", i.proxy(e.interrupt, e, !0)), e.$list.off("mouseleave.slick", i.proxy(e.interrupt, e, !1)) }, e.prototype.cleanUpRows = function () { var i, e = this; e.options.rows > 1 && ((i = e.$slides.children().children()).removeAttr("style"), e.$slider.empty().append(i)) }, e.prototype.clickHandler = function (i) { !1 === this.shouldClick && (i.stopImmediatePropagation(), i.stopPropagation(), i.preventDefault()) }, e.prototype.destroy = function (e) { var t = this; t.autoPlayClear(), t.touchObject = {}, t.cleanUpEvents(), i(".slick-cloned", t.$slider).detach(), t.$dots && t.$dots.remove(), t.$prevArrow && t.$prevArrow.length && (t.$prevArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display", ""), t.htmlExpr.test(t.options.prevArrow) && t.$prevArrow.remove()), t.$nextArrow && t.$nextArrow.length && (t.$nextArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display", ""), t.htmlExpr.test(t.options.nextArrow) && t.$nextArrow.remove()), t.$slides && (t.$slides.removeClass("slick-slide slick-active slick-center slick-visible slick-current").removeAttr("aria-hidden").removeAttr("data-slick-index").each(function () { i(this).attr("style", i(this).data("originalStyling")) }), t.$slideTrack.children(this.options.slide).detach(), t.$slideTrack.detach(), t.$list.detach(), t.$slider.append(t.$slides)), t.cleanUpRows(), t.$slider.removeClass("slick-slider"), t.$slider.removeClass("slick-initialized"), t.$slider.removeClass("slick-dotted"), t.unslicked = !0, e || t.$slider.trigger("destroy", [t]) }, e.prototype.disableTransition = function (i) { var e = this, t = {}; t[e.transitionType] = "", !1 === e.options.fade ? e.$slideTrack.css(t) : e.$slides.eq(i).css(t) }, e.prototype.fadeSlide = function (i, e) { var t = this; !1 === t.cssTransitions ? (t.$slides.eq(i).css({ zIndex: t.options.zIndex }), t.$slides.eq(i).animate({ opacity: 1 }, t.options.speed, t.options.easing, e)) : (t.applyTransition(i), t.$slides.eq(i).css({ opacity: 1, zIndex: t.options.zIndex }), e && setTimeout(function () { t.disableTransition(i), e.call() }, t.options.speed)) }, e.prototype.fadeSlideOut = function (i) { var e = this; !1 === e.cssTransitions ? e.$slides.eq(i).animate({ opacity: 0, zIndex: e.options.zIndex - 2 }, e.options.speed, e.options.easing) : (e.applyTransition(i), e.$slides.eq(i).css({ opacity: 0, zIndex: e.options.zIndex - 2 })) }, e.prototype.filterSlides = e.prototype.slickFilter = function (i) { var e = this; null !== i && (e.$slidesCache = e.$slides, e.unload(), e.$slideTrack.children(this.options.slide).detach(), e.$slidesCache.filter(i).appendTo(e.$slideTrack), e.reinit()) }, e.prototype.focusHandler = function () { var e = this; e.$slider.off("focus.slick blur.slick").on("focus.slick blur.slick", "*", function (t) { t.stopImmediatePropagation(); var o = i(this); setTimeout(function () { e.options.pauseOnFocus && (e.focussed = o.is(":focus"), e.autoPlay()) }, 0) }) }, e.prototype.getCurrent = e.prototype.slickCurrentSlide = function () { return this.currentSlide }, e.prototype.getDotCount = function () { var i = this, e = 0, t = 0, o = 0; if (!0 === i.options.infinite) if (i.slideCount <= i.options.slidesToShow)++o; else for (; e < i.slideCount;)++o, e = t + i.options.slidesToScroll, t += i.options.slidesToScroll <= i.options.slidesToShow ? i.options.slidesToScroll : i.options.slidesToShow; else if (!0 === i.options.centerMode) o = i.slideCount; else if (i.options.asNavFor) for (; e < i.slideCount;)++o, e = t + i.options.slidesToScroll, t += i.options.slidesToScroll <= i.options.slidesToShow ? i.options.slidesToScroll : i.options.slidesToShow; else o = 1 + Math.ceil((i.slideCount - i.options.slidesToShow) / i.options.slidesToScroll); return o - 1 }, e.prototype.getLeft = function (i) { var e, t, o, s, n = this, r = 0; return n.slideOffset = 0, t = n.$slides.first().outerHeight(!0), !0 === n.options.infinite ? (n.slideCount > n.options.slidesToShow && (n.slideOffset = n.slideWidth * n.options.slidesToShow * -1, s = -1, !0 === n.options.vertical && !0 === n.options.centerMode && (2 === n.options.slidesToShow ? s = -1.5 : 1 === n.options.slidesToShow && (s = -2)), r = t * n.options.slidesToShow * s), n.slideCount % n.options.slidesToScroll != 0 && i + n.options.slidesToScroll > n.slideCount && n.slideCount > n.options.slidesToShow && (i > n.slideCount ? (n.slideOffset = (n.options.slidesToShow - (i - n.slideCount)) * n.slideWidth * -1, r = (n.options.slidesToShow - (i - n.slideCount)) * t * -1) : (n.slideOffset = n.slideCount % n.options.slidesToScroll * n.slideWidth * -1, r = n.slideCount % n.options.slidesToScroll * t * -1))) : i + n.options.slidesToShow > n.slideCount && (n.slideOffset = (i + n.options.slidesToShow - n.slideCount) * n.slideWidth, r = (i + n.options.slidesToShow - n.slideCount) * t), n.slideCount <= n.options.slidesToShow && (n.slideOffset = 0, r = 0), !0 === n.options.centerMode && n.slideCount <= n.options.slidesToShow ? n.slideOffset = n.slideWidth * Math.floor(n.options.slidesToShow) / 2 - n.slideWidth * n.slideCount / 2 : !0 === n.options.centerMode && !0 === n.options.infinite ? n.slideOffset += n.slideWidth * Math.floor(n.options.slidesToShow / 2) - n.slideWidth : !0 === n.options.centerMode && (n.slideOffset = 0, n.slideOffset += n.slideWidth * Math.floor(n.options.slidesToShow / 2)), e = !1 === n.options.vertical ? i * n.slideWidth * -1 + n.slideOffset : i * t * -1 + r, !0 === n.options.variableWidth && (o = n.slideCount <= n.options.slidesToShow || !1 === n.options.infinite ? n.$slideTrack.children(".slick-slide").eq(i) : n.$slideTrack.children(".slick-slide").eq(i + n.options.slidesToShow), e = !0 === n.options.rtl ? o[0] ? -1 * (n.$slideTrack.width() - o[0].offsetLeft - o.width()) : 0 : o[0] ? -1 * o[0].offsetLeft : 0, !0 === n.options.centerMode && (o = n.slideCount <= n.options.slidesToShow || !1 === n.options.infinite ? n.$slideTrack.children(".slick-slide").eq(i) : n.$slideTrack.children(".slick-slide").eq(i + n.options.slidesToShow + 1), e = !0 === n.options.rtl ? o[0] ? -1 * (n.$slideTrack.width() - o[0].offsetLeft - o.width()) : 0 : o[0] ? -1 * o[0].offsetLeft : 0, e += (n.$list.width() - o.outerWidth()) / 2)), e }, e.prototype.getOption = e.prototype.slickGetOption = function (i) { return this.options[i] }, e.prototype.getNavigableIndexes = function () { var i, e = this, t = 0, o = 0, s = []; for (!1 === e.options.infinite ? i = e.slideCount : (t = -1 * e.options.slidesToScroll, o = -1 * e.options.slidesToScroll, i = 2 * e.slideCount); t < i;)s.push(t), t = o + e.options.slidesToScroll, o += e.options.slidesToScroll <= e.options.slidesToShow ? e.options.slidesToScroll : e.options.slidesToShow; return s }, e.prototype.getSlick = function () { return this }, e.prototype.getSlideCount = function () { var e, t, o = this; return t = !0 === o.options.centerMode ? o.slideWidth * Math.floor(o.options.slidesToShow / 2) : 0, !0 === o.options.swipeToSlide ? (o.$slideTrack.find(".slick-slide").each(function (s, n) { if (n.offsetLeft - t + i(n).outerWidth() / 2 > -1 * o.swipeLeft) return e = n, !1 }), Math.abs(i(e).attr("data-slick-index") - o.currentSlide) || 1) : o.options.slidesToScroll }, e.prototype.goTo = e.prototype.slickGoTo = function (i, e) { this.changeSlide({ data: { message: "index", index: parseInt(i) } }, e) }, e.prototype.init = function (e) { var t = this; i(t.$slider).hasClass("slick-initialized") || (i(t.$slider).addClass("slick-initialized"), t.buildRows(), t.buildOut(), t.setProps(), t.startLoad(), t.loadSlider(), t.initializeEvents(), t.updateArrows(), t.updateDots(), t.checkResponsive(!0), t.focusHandler()), e && t.$slider.trigger("init", [t]), !0 === t.options.accessibility && t.initADA(), t.options.autoplay && (t.paused = !1, t.autoPlay()) }, e.prototype.initADA = function () { var e = this, t = Math.ceil(e.slideCount / e.options.slidesToShow), o = e.getNavigableIndexes().filter(function (i) { return i >= 0 && i < e.slideCount }); e.$slides.add(e.$slideTrack.find(".slick-cloned")).attr({ "aria-hidden": "true", tabindex: "-1" }).find("a, input, button, select").attr({ tabindex: "-1" }), null !== e.$dots && (e.$slides.not(e.$slideTrack.find(".slick-cloned")).each(function (t) { var s = o.indexOf(t); i(this).attr({ role: "tabpanel", id: "slick-slide" + e.instanceUid + t, tabindex: -1 }), -1 !== s && i(this).attr({ "aria-describedby": "slick-slide-control" + e.instanceUid + s }) }), e.$dots.attr("role", "tablist").find("li").each(function (s) { var n = o[s]; i(this).attr({ role: "presentation" }), i(this).find("button").first().attr({ role: "tab", id: "slick-slide-control" + e.instanceUid + s, "aria-controls": "slick-slide" + e.instanceUid + n, "aria-label": s + 1 + " of " + t, "aria-selected": null, tabindex: "-1" }) }).eq(e.currentSlide).find("button").attr({ "aria-selected": "true", tabindex: "0" }).end()); for (var s = e.currentSlide, n = s + e.options.slidesToShow; s < n; s++)e.$slides.eq(s).attr("tabindex", 0); e.activateADA() }, e.prototype.initArrowEvents = function () { var i = this; !0 === i.options.arrows && i.slideCount > i.options.slidesToShow && (i.$prevArrow.off("click.slick").on("click.slick", { message: "previous" }, i.changeSlide), i.$nextArrow.off("click.slick").on("click.slick", { message: "next" }, i.changeSlide), !0 === i.options.accessibility && (i.$prevArrow.on("keydown.slick", i.keyHandler), i.$nextArrow.on("keydown.slick", i.keyHandler))) }, e.prototype.initDotEvents = function () { var e = this; !0 === e.options.dots && (i("li", e.$dots).on("click.slick", { message: "index" }, e.changeSlide), !0 === e.options.accessibility && e.$dots.on("keydown.slick", e.keyHandler)), !0 === e.options.dots && !0 === e.options.pauseOnDotsHover && i("li", e.$dots).on("mouseenter.slick", i.proxy(e.interrupt, e, !0)).on("mouseleave.slick", i.proxy(e.interrupt, e, !1)) }, e.prototype.initSlideEvents = function () { var e = this; e.options.pauseOnHover && (e.$list.on("mouseenter.slick", i.proxy(e.interrupt, e, !0)), e.$list.on("mouseleave.slick", i.proxy(e.interrupt, e, !1))) }, e.prototype.initializeEvents = function () { var e = this; e.initArrowEvents(), e.initDotEvents(), e.initSlideEvents(), e.$list.on("touchstart.slick mousedown.slick", { action: "start" }, e.swipeHandler), e.$list.on("touchmove.slick mousemove.slick", { action: "move" }, e.swipeHandler), e.$list.on("touchend.slick mouseup.slick", { action: "end" }, e.swipeHandler), e.$list.on("touchcancel.slick mouseleave.slick", { action: "end" }, e.swipeHandler), e.$list.on("click.slick", e.clickHandler), i(document).on(e.visibilityChange, i.proxy(e.visibility, e)), !0 === e.options.accessibility && e.$list.on("keydown.slick", e.keyHandler), !0 === e.options.focusOnSelect && i(e.$slideTrack).children().on("click.slick", e.selectHandler), i(window).on("orientationchange.slick.slick-" + e.instanceUid, i.proxy(e.orientationChange, e)), i(window).on("resize.slick.slick-" + e.instanceUid, i.proxy(e.resize, e)), i("[draggable!=true]", e.$slideTrack).on("dragstart", e.preventDefault), i(window).on("load.slick.slick-" + e.instanceUid, e.setPosition), i(e.setPosition) }, e.prototype.initUI = function () { var i = this; !0 === i.options.arrows && i.slideCount > i.options.slidesToShow && (i.$prevArrow.show(), i.$nextArrow.show()), !0 === i.options.dots && i.slideCount > i.options.slidesToShow && i.$dots.show() }, e.prototype.keyHandler = function (i) { var e = this; i.target.tagName.match("TEXTAREA|INPUT|SELECT") || (37 === i.keyCode && !0 === e.options.accessibility ? e.changeSlide({ data: { message: !0 === e.options.rtl ? "next" : "previous" } }) : 39 === i.keyCode && !0 === e.options.accessibility && e.changeSlide({ data: { message: !0 === e.options.rtl ? "previous" : "next" } })) }, e.prototype.lazyLoad = function () { function e(e) { i("img[data-lazy]", e).each(function () { var e = i(this), t = i(this).attr("data-lazy"), o = i(this).attr("data-srcset"), s = i(this).attr("data-sizes") || n.$slider.attr("data-sizes"), r = document.createElement("img"); r.onload = function () { e.animate({ opacity: 0 }, 100, function () { o && (e.attr("srcset", o), s && e.attr("sizes", s)), e.attr("src", t).animate({ opacity: 1 }, 200, function () { e.removeAttr("data-lazy data-srcset data-sizes").removeClass("slick-loading") }), n.$slider.trigger("lazyLoaded", [n, e, t]) }) }, r.onerror = function () { e.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error"), n.$slider.trigger("lazyLoadError", [n, e, t]) }, r.src = t }) } var t, o, s, n = this; if (!0 === n.options.centerMode ? !0 === n.options.infinite ? s = (o = n.currentSlide + (n.options.slidesToShow / 2 + 1)) + n.options.slidesToShow + 2 : (o = Math.max(0, n.currentSlide - (n.options.slidesToShow / 2 + 1)), s = n.options.slidesToShow / 2 + 1 + 2 + n.currentSlide) : (o = n.options.infinite ? n.options.slidesToShow + n.currentSlide : n.currentSlide, s = Math.ceil(o + n.options.slidesToShow), !0 === n.options.fade && (o > 0 && o-- , s <= n.slideCount && s++)), t = n.$slider.find(".slick-slide").slice(o, s), "anticipated" === n.options.lazyLoad) for (var r = o - 1, l = s, d = n.$slider.find(".slick-slide"), a = 0; a < n.options.slidesToScroll; a++)r < 0 && (r = n.slideCount - 1), t = (t = t.add(d.eq(r))).add(d.eq(l)), r-- , l++; e(t), n.slideCount <= n.options.slidesToShow ? e(n.$slider.find(".slick-slide")) : n.currentSlide >= n.slideCount - n.options.slidesToShow ? e(n.$slider.find(".slick-cloned").slice(0, n.options.slidesToShow)) : 0 === n.currentSlide && e(n.$slider.find(".slick-cloned").slice(-1 * n.options.slidesToShow)) }, e.prototype.loadSlider = function () { var i = this; i.setPosition(), i.$slideTrack.css({ opacity: 1 }), i.$slider.removeClass("slick-loading"), i.initUI(), "progressive" === i.options.lazyLoad && i.progressiveLazyLoad() }, e.prototype.next = e.prototype.slickNext = function () { this.changeSlide({ data: { message: "next" } }) }, e.prototype.orientationChange = function () { var i = this; i.checkResponsive(), i.setPosition() }, e.prototype.pause = e.prototype.slickPause = function () { var i = this; i.autoPlayClear(), i.paused = !0 }, e.prototype.play = e.prototype.slickPlay = function () { var i = this; i.autoPlay(), i.options.autoplay = !0, i.paused = !1, i.focussed = !1, i.interrupted = !1 }, e.prototype.postSlide = function (e) { var t = this; t.unslicked || (t.$slider.trigger("afterChange", [t, e]), t.animating = !1, t.slideCount > t.options.slidesToShow && t.setPosition(), t.swipeLeft = null, t.options.autoplay && t.autoPlay(), !0 === t.options.accessibility && (t.initADA(), t.options.focusOnChange && i(t.$slides.get(t.currentSlide)).attr("tabindex", 0).focus())) }, e.prototype.prev = e.prototype.slickPrev = function () { this.changeSlide({ data: { message: "previous" } }) }, e.prototype.preventDefault = function (i) { i.preventDefault() }, e.prototype.progressiveLazyLoad = function (e) { e = e || 1; var t, o, s, n, r, l = this, d = i("img[data-lazy]", l.$slider); d.length ? (t = d.first(), o = t.attr("data-lazy"), s = t.attr("data-srcset"), n = t.attr("data-sizes") || l.$slider.attr("data-sizes"), (r = document.createElement("img")).onload = function () { s && (t.attr("srcset", s), n && t.attr("sizes", n)), t.attr("src", o).removeAttr("data-lazy data-srcset data-sizes").removeClass("slick-loading"), !0 === l.options.adaptiveHeight && l.setPosition(), l.$slider.trigger("lazyLoaded", [l, t, o]), l.progressiveLazyLoad() }, r.onerror = function () { e < 3 ? setTimeout(function () { l.progressiveLazyLoad(e + 1) }, 500) : (t.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error"), l.$slider.trigger("lazyLoadError", [l, t, o]), l.progressiveLazyLoad()) }, r.src = o) : l.$slider.trigger("allImagesLoaded", [l]) }, e.prototype.refresh = function (e) { var t, o, s = this; o = s.slideCount - s.options.slidesToShow, !s.options.infinite && s.currentSlide > o && (s.currentSlide = o), s.slideCount <= s.options.slidesToShow && (s.currentSlide = 0), t = s.currentSlide, s.destroy(!0), i.extend(s, s.initials, { currentSlide: t }), s.init(), e || s.changeSlide({ data: { message: "index", index: t } }, !1) }, e.prototype.registerBreakpoints = function () { var e, t, o, s = this, n = s.options.responsive || null; if ("array" === i.type(n) && n.length) { s.respondTo = s.options.respondTo || "window"; for (e in n) if (o = s.breakpoints.length - 1, n.hasOwnProperty(e)) { for (t = n[e].breakpoint; o >= 0;)s.breakpoints[o] && s.breakpoints[o] === t && s.breakpoints.splice(o, 1), o--; s.breakpoints.push(t), s.breakpointSettings[t] = n[e].settings } s.breakpoints.sort(function (i, e) { return s.options.mobileFirst ? i - e : e - i }) } }, e.prototype.reinit = function () { var e = this; e.$slides = e.$slideTrack.children(e.options.slide).addClass("slick-slide"), e.slideCount = e.$slides.length, e.currentSlide >= e.slideCount && 0 !== e.currentSlide && (e.currentSlide = e.currentSlide - e.options.slidesToScroll), e.slideCount <= e.options.slidesToShow && (e.currentSlide = 0), e.registerBreakpoints(), e.setProps(), e.setupInfinite(), e.buildArrows(), e.updateArrows(), e.initArrowEvents(), e.buildDots(), e.updateDots(), e.initDotEvents(), e.cleanUpSlideEvents(), e.initSlideEvents(), e.checkResponsive(!1, !0), !0 === e.options.focusOnSelect && i(e.$slideTrack).children().on("click.slick", e.selectHandler), e.setSlideClasses("number" == typeof e.currentSlide ? e.currentSlide : 0), e.setPosition(), e.focusHandler(), e.paused = !e.options.autoplay, e.autoPlay(), e.$slider.trigger("reInit", [e]) }, e.prototype.resize = function () { var e = this; i(window).width() !== e.windowWidth && (clearTimeout(e.windowDelay), e.windowDelay = window.setTimeout(function () { e.windowWidth = i(window).width(), e.checkResponsive(), e.unslicked || e.setPosition() }, 50)) }, e.prototype.removeSlide = e.prototype.slickRemove = function (i, e, t) { var o = this; if (i = "boolean" == typeof i ? !0 === (e = i) ? 0 : o.slideCount - 1 : !0 === e ? --i : i, o.slideCount < 1 || i < 0 || i > o.slideCount - 1) return !1; o.unload(), !0 === t ? o.$slideTrack.children().remove() : o.$slideTrack.children(this.options.slide).eq(i).remove(), o.$slides = o.$slideTrack.children(this.options.slide), o.$slideTrack.children(this.options.slide).detach(), o.$slideTrack.append(o.$slides), o.$slidesCache = o.$slides, o.reinit() }, e.prototype.setCSS = function (i) { var e, t, o = this, s = {}; !0 === o.options.rtl && (i = -i), e = "left" == o.positionProp ? Math.ceil(i) + "px" : "0px", t = "top" == o.positionProp ? Math.ceil(i) + "px" : "0px", s[o.positionProp] = i, !1 === o.transformsEnabled ? o.$slideTrack.css(s) : (s = {}, !1 === o.cssTransitions ? (s[o.animType] = "translate(" + e + ", " + t + ")", o.$slideTrack.css(s)) : (s[o.animType] = "translate3d(" + e + ", " + t + ", 0px)", o.$slideTrack.css(s))) }, e.prototype.setDimensions = function () { var i = this; !1 === i.options.vertical ? !0 === i.options.centerMode && i.$list.css({ padding: "0px " + i.options.centerPadding }) : (i.$list.height(i.$slides.first().outerHeight(!0) * i.options.slidesToShow), !0 === i.options.centerMode && i.$list.css({ padding: i.options.centerPadding + " 0px" })), i.listWidth = i.$list.width(), i.listHeight = i.$list.height(), !1 === i.options.vertical && !1 === i.options.variableWidth ? (i.slideWidth = Math.ceil(i.listWidth / i.options.slidesToShow), i.$slideTrack.width(Math.ceil(i.slideWidth * i.$slideTrack.children(".slick-slide").length))) : !0 === i.options.variableWidth ? i.$slideTrack.width(5e3 * i.slideCount) : (i.slideWidth = Math.ceil(i.listWidth), i.$slideTrack.height(Math.ceil(i.$slides.first().outerHeight(!0) * i.$slideTrack.children(".slick-slide").length))); var e = i.$slides.first().outerWidth(!0) - i.$slides.first().width(); !1 === i.options.variableWidth && i.$slideTrack.children(".slick-slide").width(i.slideWidth - e) }, e.prototype.setFade = function () { var e, t = this; t.$slides.each(function (o, s) { e = t.slideWidth * o * -1, !0 === t.options.rtl ? i(s).css({ position: "relative", right: e, top: 0, zIndex: t.options.zIndex - 2, opacity: 0 }) : i(s).css({ position: "relative", left: e, top: 0, zIndex: t.options.zIndex - 2, opacity: 0 }) }), t.$slides.eq(t.currentSlide).css({ zIndex: t.options.zIndex - 1, opacity: 1 }) }, e.prototype.setHeight = function () { var i = this; if (1 === i.options.slidesToShow && !0 === i.options.adaptiveHeight && !1 === i.options.vertical) { var e = i.$slides.eq(i.currentSlide).outerHeight(!0); i.$list.css("height", e) } }, e.prototype.setOption = e.prototype.slickSetOption = function () { var e, t, o, s, n, r = this, l = !1; if ("object" === i.type(arguments[0]) ? (o = arguments[0], l = arguments[1], n = "multiple") : "string" === i.type(arguments[0]) && (o = arguments[0], s = arguments[1], l = arguments[2], "responsive" === arguments[0] && "array" === i.type(arguments[1]) ? n = "responsive" : void 0 !== arguments[1] && (n = "single")), "single" === n) r.options[o] = s; else if ("multiple" === n) i.each(o, function (i, e) { r.options[i] = e }); else if ("responsive" === n) for (t in s) if ("array" !== i.type(r.options.responsive)) r.options.responsive = [s[t]]; else { for (e = r.options.responsive.length - 1; e >= 0;)r.options.responsive[e].breakpoint === s[t].breakpoint && r.options.responsive.splice(e, 1), e--; r.options.responsive.push(s[t]) } l && (r.unload(), r.reinit()) }, e.prototype.setPosition = function () { var i = this; i.setDimensions(), i.setHeight(), !1 === i.options.fade ? i.setCSS(i.getLeft(i.currentSlide)) : i.setFade(), i.$slider.trigger("setPosition", [i]) }, e.prototype.setProps = function () { var i = this, e = document.body.style; i.positionProp = !0 === i.options.vertical ? "top" : "left", "top" === i.positionProp ? i.$slider.addClass("slick-vertical") : i.$slider.removeClass("slick-vertical"), void 0 === e.WebkitTransition && void 0 === e.MozTransition && void 0 === e.msTransition || !0 === i.options.useCSS && (i.cssTransitions = !0), i.options.fade && ("number" == typeof i.options.zIndex ? i.options.zIndex < 3 && (i.options.zIndex = 3) : i.options.zIndex = i.defaults.zIndex), void 0 !== e.OTransform && (i.animType = "OTransform", i.transformType = "-o-transform", i.transitionType = "OTransition", void 0 === e.perspectiveProperty && void 0 === e.webkitPerspective && (i.animType = !1)), void 0 !== e.MozTransform && (i.animType = "MozTransform", i.transformType = "-moz-transform", i.transitionType = "MozTransition", void 0 === e.perspectiveProperty && void 0 === e.MozPerspective && (i.animType = !1)), void 0 !== e.webkitTransform && (i.animType = "webkitTransform", i.transformType = "-webkit-transform", i.transitionType = "webkitTransition", void 0 === e.perspectiveProperty && void 0 === e.webkitPerspective && (i.animType = !1)), void 0 !== e.msTransform && (i.animType = "msTransform", i.transformType = "-ms-transform", i.transitionType = "msTransition", void 0 === e.msTransform && (i.animType = !1)), void 0 !== e.transform && !1 !== i.animType && (i.animType = "transform", i.transformType = "transform", i.transitionType = "transition"), i.transformsEnabled = i.options.useTransform && null !== i.animType && !1 !== i.animType }, e.prototype.setSlideClasses = function (i) { var e, t, o, s, n = this; if (t = n.$slider.find(".slick-slide").removeClass("slick-active slick-center slick-current").attr("aria-hidden", "true"), n.$slides.eq(i).addClass("slick-current"), !0 === n.options.centerMode) { var r = n.options.slidesToShow % 2 == 0 ? 1 : 0; e = Math.floor(n.options.slidesToShow / 2), !0 === n.options.infinite && (i >= e && i <= n.slideCount - 1 - e ? n.$slides.slice(i - e + r, i + e + 1).addClass("slick-active").attr("aria-hidden", "false") : (o = n.options.slidesToShow + i, t.slice(o - e + 1 + r, o + e + 2).addClass("slick-active").attr("aria-hidden", "false")), 0 === i ? t.eq(t.length - 1 - n.options.slidesToShow).addClass("slick-center") : i === n.slideCount - 1 && t.eq(n.options.slidesToShow).addClass("slick-center")), n.$slides.eq(i).addClass("slick-center") } else i >= 0 && i <= n.slideCount - n.options.slidesToShow ? n.$slides.slice(i, i + n.options.slidesToShow).addClass("slick-active").attr("aria-hidden", "false") : t.length <= n.options.slidesToShow ? t.addClass("slick-active").attr("aria-hidden", "false") : (s = n.slideCount % n.options.slidesToShow, o = !0 === n.options.infinite ? n.options.slidesToShow + i : i, n.options.slidesToShow == n.options.slidesToScroll && n.slideCount - i < n.options.slidesToShow ? t.slice(o - (n.options.slidesToShow - s), o + s).addClass("slick-active").attr("aria-hidden", "false") : t.slice(o, o + n.options.slidesToShow).addClass("slick-active").attr("aria-hidden", "false")); "ondemand" !== n.options.lazyLoad && "anticipated" !== n.options.lazyLoad || n.lazyLoad() }, e.prototype.setupInfinite = function () { var e, t, o, s = this; if (!0 === s.options.fade && (s.options.centerMode = !1), !0 === s.options.infinite && !1 === s.options.fade && (t = null, s.slideCount > s.options.slidesToShow)) { for (o = !0 === s.options.centerMode ? s.options.slidesToShow + 1 : s.options.slidesToShow, e = s.slideCount; e > s.slideCount - o; e -= 1)t = e - 1, i(s.$slides[t]).clone(!0).attr("id", "").attr("data-slick-index", t - s.slideCount).prependTo(s.$slideTrack).addClass("slick-cloned"); for (e = 0; e < o + s.slideCount; e += 1)t = e, i(s.$slides[t]).clone(!0).attr("id", "").attr("data-slick-index", t + s.slideCount).appendTo(s.$slideTrack).addClass("slick-cloned"); s.$slideTrack.find(".slick-cloned").find("[id]").each(function () { i(this).attr("id", "") }) } }, e.prototype.interrupt = function (i) { var e = this; i || e.autoPlay(), e.interrupted = i }, e.prototype.selectHandler = function (e) { var t = this, o = i(e.target).is(".slick-slide") ? i(e.target) : i(e.target).parents(".slick-slide"), s = parseInt(o.attr("data-slick-index")); s || (s = 0), t.slideCount <= t.options.slidesToShow ? t.slideHandler(s, !1, !0) : t.slideHandler(s) }, e.prototype.slideHandler = function (i, e, t) { var o, s, n, r, l, d = null, a = this; if (e = e || !1, !(!0 === a.animating && !0 === a.options.waitForAnimate || !0 === a.options.fade && a.currentSlide === i)) if (!1 === e && a.asNavFor(i), o = i, d = a.getLeft(o), r = a.getLeft(a.currentSlide), a.currentLeft = null === a.swipeLeft ? r : a.swipeLeft, !1 === a.options.infinite && !1 === a.options.centerMode && (i < 0 || i > a.getDotCount() * a.options.slidesToScroll)) !1 === a.options.fade && (o = a.currentSlide, !0 !== t ? a.animateSlide(r, function () { a.postSlide(o) }) : a.postSlide(o)); else if (!1 === a.options.infinite && !0 === a.options.centerMode && (i < 0 || i > a.slideCount - a.options.slidesToScroll)) !1 === a.options.fade && (o = a.currentSlide, !0 !== t ? a.animateSlide(r, function () { a.postSlide(o) }) : a.postSlide(o)); else { if (a.options.autoplay && clearInterval(a.autoPlayTimer), s = o < 0 ? a.slideCount % a.options.slidesToScroll != 0 ? a.slideCount - a.slideCount % a.options.slidesToScroll : a.slideCount + o : o >= a.slideCount ? a.slideCount % a.options.slidesToScroll != 0 ? 0 : o - a.slideCount : o, a.animating = !0, a.$slider.trigger("beforeChange", [a, a.currentSlide, s]), n = a.currentSlide, a.currentSlide = s, a.setSlideClasses(a.currentSlide), a.options.asNavFor && (l = (l = a.getNavTarget()).slick("getSlick")).slideCount <= l.options.slidesToShow && l.setSlideClasses(a.currentSlide), a.updateDots(), a.updateArrows(), !0 === a.options.fade) return !0 !== t ? (a.fadeSlideOut(n), a.fadeSlide(s, function () { a.postSlide(s) })) : a.postSlide(s), void a.animateHeight(); !0 !== t ? a.animateSlide(d, function () { a.postSlide(s) }) : a.postSlide(s) } }, e.prototype.startLoad = function () { var i = this; !0 === i.options.arrows && i.slideCount > i.options.slidesToShow && (i.$prevArrow.hide(), i.$nextArrow.hide()), !0 === i.options.dots && i.slideCount > i.options.slidesToShow && i.$dots.hide(), i.$slider.addClass("slick-loading") }, e.prototype.swipeDirection = function () { var i, e, t, o, s = this; return i = s.touchObject.startX - s.touchObject.curX, e = s.touchObject.startY - s.touchObject.curY, t = Math.atan2(e, i), (o = Math.round(180 * t / Math.PI)) < 0 && (o = 360 - Math.abs(o)), o <= 45 && o >= 0 ? !1 === s.options.rtl ? "left" : "right" : o <= 360 && o >= 315 ? !1 === s.options.rtl ? "left" : "right" : o >= 135 && o <= 225 ? !1 === s.options.rtl ? "right" : "left" : !0 === s.options.verticalSwiping ? o >= 35 && o <= 135 ? "down" : "up" : "vertical" }, e.prototype.swipeEnd = function (i) { var e, t, o = this; if (o.dragging = !1, o.swiping = !1, o.scrolling) return o.scrolling = !1, !1; if (o.interrupted = !1, o.shouldClick = !(o.touchObject.swipeLength > 10), void 0 === o.touchObject.curX) return !1; if (!0 === o.touchObject.edgeHit && o.$slider.trigger("edge", [o, o.swipeDirection()]), o.touchObject.swipeLength >= o.touchObject.minSwipe) { switch (t = o.swipeDirection()) { case "left": case "down": e = o.options.swipeToSlide ? o.checkNavigable(o.currentSlide + o.getSlideCount()) : o.currentSlide + o.getSlideCount(), o.currentDirection = 0; break; case "right": case "up": e = o.options.swipeToSlide ? o.checkNavigable(o.currentSlide - o.getSlideCount()) : o.currentSlide - o.getSlideCount(), o.currentDirection = 1 }"vertical" != t && (o.slideHandler(e), o.touchObject = {}, o.$slider.trigger("swipe", [o, t])) } else o.touchObject.startX !== o.touchObject.curX && (o.slideHandler(o.currentSlide), o.touchObject = {}) }, e.prototype.swipeHandler = function (i) { var e = this; if (!(!1 === e.options.swipe || "ontouchend" in document && !1 === e.options.swipe || !1 === e.options.draggable && -1 !== i.type.indexOf("mouse"))) switch (e.touchObject.fingerCount = i.originalEvent && void 0 !== i.originalEvent.touches ? i.originalEvent.touches.length : 1, e.touchObject.minSwipe = e.listWidth / e.options.touchThreshold, !0 === e.options.verticalSwiping && (e.touchObject.minSwipe = e.listHeight / e.options.touchThreshold), i.data.action) { case "start": e.swipeStart(i); break; case "move": e.swipeMove(i); break; case "end": e.swipeEnd(i) } }, e.prototype.swipeMove = function (i) { var e, t, o, s, n, r, l = this; return n = void 0 !== i.originalEvent ? i.originalEvent.touches : null, !(!l.dragging || l.scrolling || n && 1 !== n.length) && (e = l.getLeft(l.currentSlide), l.touchObject.curX = void 0 !== n ? n[0].pageX : i.clientX, l.touchObject.curY = void 0 !== n ? n[0].pageY : i.clientY, l.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(l.touchObject.curX - l.touchObject.startX, 2))), r = Math.round(Math.sqrt(Math.pow(l.touchObject.curY - l.touchObject.startY, 2))), !l.options.verticalSwiping && !l.swiping && r > 4 ? (l.scrolling = !0, !1) : (!0 === l.options.verticalSwiping && (l.touchObject.swipeLength = r), t = l.swipeDirection(), void 0 !== i.originalEvent && l.touchObject.swipeLength > 4 && (l.swiping = !0, i.preventDefault()), s = (!1 === l.options.rtl ? 1 : -1) * (l.touchObject.curX > l.touchObject.startX ? 1 : -1), !0 === l.options.verticalSwiping && (s = l.touchObject.curY > l.touchObject.startY ? 1 : -1), o = l.touchObject.swipeLength, l.touchObject.edgeHit = !1, !1 === l.options.infinite && (0 === l.currentSlide && "right" === t || l.currentSlide >= l.getDotCount() && "left" === t) && (o = l.touchObject.swipeLength * l.options.edgeFriction, l.touchObject.edgeHit = !0), !1 === l.options.vertical ? l.swipeLeft = e + o * s : l.swipeLeft = e + o * (l.$list.height() / l.listWidth) * s, !0 === l.options.verticalSwiping && (l.swipeLeft = e + o * s), !0 !== l.options.fade && !1 !== l.options.touchMove && (!0 === l.animating ? (l.swipeLeft = null, !1) : void l.setCSS(l.swipeLeft)))) }, e.prototype.swipeStart = function (i) { var e, t = this; if (t.interrupted = !0, 1 !== t.touchObject.fingerCount || t.slideCount <= t.options.slidesToShow) return t.touchObject = {}, !1; void 0 !== i.originalEvent && void 0 !== i.originalEvent.touches && (e = i.originalEvent.touches[0]), t.touchObject.startX = t.touchObject.curX = void 0 !== e ? e.pageX : i.clientX, t.touchObject.startY = t.touchObject.curY = void 0 !== e ? e.pageY : i.clientY, t.dragging = !0 }, e.prototype.unfilterSlides = e.prototype.slickUnfilter = function () { var i = this; null !== i.$slidesCache && (i.unload(), i.$slideTrack.children(this.options.slide).detach(), i.$slidesCache.appendTo(i.$slideTrack), i.reinit()) }, e.prototype.unload = function () { var e = this; i(".slick-cloned", e.$slider).remove(), e.$dots && e.$dots.remove(), e.$prevArrow && e.htmlExpr.test(e.options.prevArrow) && e.$prevArrow.remove(), e.$nextArrow && e.htmlExpr.test(e.options.nextArrow) && e.$nextArrow.remove(), e.$slides.removeClass("slick-slide slick-active slick-visible slick-current").attr("aria-hidden", "true").css("width", "") }, e.prototype.unslick = function (i) { var e = this; e.$slider.trigger("unslick", [e, i]), e.destroy() }, e.prototype.updateArrows = function () { var i = this; Math.floor(i.options.slidesToShow / 2), !0 === i.options.arrows && i.slideCount > i.options.slidesToShow && !i.options.infinite && (i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false"), i.$nextArrow.removeClass("slick-disabled").attr("aria-disabled", "false"), 0 === i.currentSlide ? (i.$prevArrow.addClass("slick-disabled").attr("aria-disabled", "true"), i.$nextArrow.removeClass("slick-disabled").attr("aria-disabled", "false")) : i.currentSlide >= i.slideCount - i.options.slidesToShow && !1 === i.options.centerMode ? (i.$nextArrow.addClass("slick-disabled").attr("aria-disabled", "true"), i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false")) : i.currentSlide >= i.slideCount - 1 && !0 === i.options.centerMode && (i.$nextArrow.addClass("slick-disabled").attr("aria-disabled", "true"), i.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false"))) }, e.prototype.updateDots = function () { var i = this; null !== i.$dots && (i.$dots.find("li").removeClass("slick-active").end(), i.$dots.find("li").eq(Math.floor(i.currentSlide / i.options.slidesToScroll)).addClass("slick-active")) }, e.prototype.visibility = function () { var i = this; i.options.autoplay && (document[i.hidden] ? i.interrupted = !0 : i.interrupted = !1) }, i.fn.slick = function () { var i, t, o = this, s = arguments[0], n = Array.prototype.slice.call(arguments, 1), r = o.length; for (i = 0; i < r; i++)if ("object" == typeof s || void 0 === s ? o[i].slick = new e(o[i], s) : t = o[i].slick[s].apply(o[i].slick, n), void 0 !== t) return t; return o } });
/*! jquery-locationpicker - v0.1.12 - 2015-01-05 */

!function (a) { function b(a, b) { var c = new google.maps.Map(a, b), d = new google.maps.Marker({ position: new google.maps.LatLng(54.19335, -3.92695), map: c, title: "Drag Me", draggable: b.draggable }); return { map: c, marker: d, circle: null, location: d.position, radius: b.radius, locationName: b.locationName, addressComponents: { formatted_address: null, addressLine1: null, addressLine2: null, streetName: null, streetNumber: null, city: null, district: null, state: null, stateOrProvince: null }, settings: b.settings, domContainer: a, geodecoder: new google.maps.Geocoder } } function c(a) { return void 0 != d(a) } function d(b) { return a(b).data("locationpicker") } function e(a, b) { if (a) { var c = h.locationFromLatLng(b.location); a.latitudeInput && a.latitudeInput.val(c.latitude).change(), a.longitudeInput && a.longitudeInput.val(c.longitude).change(), a.radiusInput && a.radiusInput.val(b.radius).change(), a.locationNameInput && a.locationNameInput.val(b.locationName).change() } } function f(b, c) { b && (b.radiusInput && b.radiusInput.on("change", function (b) { b.originalEvent && (c.radius = a(this).val(), h.setPosition(c, c.location, function (a) { a.settings.onchanged.apply(c.domContainer, [h.locationFromLatLng(a.location), a.radius, !1]) })) }), b.locationNameInput && c.settings.enableAutocomplete && (c.autocomplete = new google.maps.places.Autocomplete(b.locationNameInput.get(0)), google.maps.event.addListener(c.autocomplete, "place_changed", function () { var a = c.autocomplete.getPlace(); return a.geometry ? void h.setPosition(c, a.geometry.location, function (a) { e(b, a), a.settings.onchanged.apply(c.domContainer, [h.locationFromLatLng(a.location), a.radius, !1]) }) : void c.settings.onlocationnotfound(a.name) })), b.latitudeInput && b.latitudeInput.on("change", function (b) { b.originalEvent && h.setPosition(c, new google.maps.LatLng(a(this).val(), c.location.lng()), function (a) { a.settings.onchanged.apply(c.domContainer, [h.locationFromLatLng(a.location), a.radius, !1]) }) }), b.longitudeInput && b.longitudeInput.on("change", function (b) { b.originalEvent && h.setPosition(c, new google.maps.LatLng(c.location.lat(), a(this).val()), function (a) { a.settings.onchanged.apply(c.domContainer, [h.locationFromLatLng(a.location), a.radius, !1]) }) })) } function g(a) { google.maps.event.trigger(a.map, "resize"), setTimeout(function () { a.map.setCenter(a.marker.position) }, 300) } var h = { drawCircle: function (b, c, d, e) { return null != b.circle && b.circle.setMap(null), d > 0 ? (d *= 1, e = a.extend({ strokeColor: "#0000FF", strokeOpacity: .35, strokeWeight: 2, fillColor: "#0000FF", fillOpacity: .2 }, e), e.map = b.map, e.radius = d, e.center = c, b.circle = new google.maps.Circle(e), b.circle) : null }, setPosition: function (a, b, c) { a.location = b, a.marker.setPosition(b), a.map.panTo(b), this.drawCircle(a, b, a.radius, {}), a.settings.enableReverseGeocode ? a.geodecoder.geocode({ latLng: a.location }, function (b, d) { d == google.maps.GeocoderStatus.OK && b.length > 0 && (a.locationName = b[0].formatted_address, a.addressComponents = h.address_component_from_google_geocode(b[0].address_components)), c && c.call(this, a) }) : c && c.call(this, a) }, locationFromLatLng: function (a) { return { latitude: a.lat(), longitude: a.lng() } }, address_component_from_google_geocode: function (a) { for (var b = {}, c = a.length - 1; c >= 0; c--) { var d = a[c]; d.types.indexOf("postal_code") >= 0 ? b.postalCode = d.short_name : d.types.indexOf("street_number") >= 0 ? b.streetNumber = d.short_name : d.types.indexOf("route") >= 0 ? b.streetName = d.short_name : d.types.indexOf("locality") >= 0 ? b.city = d.short_name : d.types.indexOf("sublocality") >= 0 ? b.district = d.short_name : d.types.indexOf("administrative_area_level_1") >= 0 ? b.stateOrProvince = d.short_name : d.types.indexOf("country") >= 0 && (b.country = d.short_name) } return b.addressLine1 = [b.streetNumber, b.streetName].join(" ").trim(), b.addressLine2 = "", b } }; a.fn.locationpicker = function (i, j) { if ("string" == typeof i) { var k = this.get(0); if (!c(k)) return; var l = d(k); switch (i) { case "location": if (void 0 == j) { var m = h.locationFromLatLng(l.location); return m.radius = l.radius, m.name = l.locationName, m } j.radius && (l.radius = j.radius), h.setPosition(l, new google.maps.LatLng(j.latitude, j.longitude), function (a) { e(a.settings.inputBinding, a) }); break; case "subscribe": if (void 0 == j) return null; var n = j.event, o = j.callback; if (!n || !o) return console.error('LocationPicker: Invalid arguments for method "subscribe"'), null; google.maps.event.addListener(l.map, n, o); break; case "map": if (void 0 == j) { var p = h.locationFromLatLng(l.location); return p.formattedAddress = l.locationName, p.addressComponents = l.addressComponents, { map: l.map, marker: l.marker, location: p } } return null; case "autosize": return g(l), this }return null } return this.each(function () { var d = a(this); if (!c(this)) { var g = a.extend({}, a.fn.locationpicker.defaults, i), j = new b(this, { zoom: g.zoom, center: new google.maps.LatLng(g.location.latitude, g.location.longitude), mapTypeId: google.maps.MapTypeId.ROADMAP, mapTypeControl: !1, disableDoubleClickZoom: !1, scrollwheel: g.scrollwheel, streetViewControl: !1, radius: g.radius, locationName: g.locationName, settings: g, draggable: g.draggable }); d.data("locationpicker", j), google.maps.event.addListener(j.marker, "dragend", function () { h.setPosition(j, j.marker.position, function (a) { var b = h.locationFromLatLng(j.location); a.settings.onchanged.apply(j.domContainer, [b, a.radius, !0]), e(j.settings.inputBinding, j) }) }), h.setPosition(j, new google.maps.LatLng(g.location.latitude, g.location.longitude), function (a) { e(g.inputBinding, j), f(g.inputBinding, j), a.settings.oninitialized(d) }) } }) }, a.fn.locationpicker.defaults = { location: { latitude: 40.7324319, longitude: -73.82480799999996 }, locationName: "", radius: 500, zoom: 15, scrollwheel: !0, inputBinding: { latitudeInput: null, longitudeInput: null, radiusInput: null, locationNameInput: null }, enableAutocomplete: !1, enableReverseGeocode: !0, draggable: !0, onchanged: function () { }, onlocationnotfound: function () { }, oninitialized: function () { } } }(jQuery);
//# sourceMappingURL=locationpicker.jquery.min.map
(function ($) {
    /*register loader*/
    $.fn.EbLoader = function (action,options) {
        /*the target*/
        var el = $(this);
        var operation = action;
        var settings = $.extend({
            color:"#ec9351",
            bgColor: 'transparent', // Default background color 
            maskItem: {},
            maskLoader:true
        }, options);

        //maskItem:{
        //Id: "",
        //Style:{}   //jquery css
        //}

        //Apply styles
        el.css("background-color", settings.bgColor);

        maskItem = $(settings.maskItem.Id);

        if (!el.hasClass('eb-loader-prcbar')) {
            el.addClass('eb-loader-prcbar');
        }
        else {
            showPrc();
        }

        if (action === "show") {
            if (!$.isEmptyObject(settings.maskItem)) {
                maskItem.append(`<div class="loader_mask_EB" id="${el.attr("id")}loader_mask_item"></div>`);
                appendMaskStyle();
            }
            if (settings.maskLoader) {
                $(`#${el.attr("id")}loader_mask_item`).append(`<div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div>
                                    <div></div><div></div><div></div><div></div><div>
                                    </div><div></div><div></div></div>`);
            }
        }

        function appendMaskStyle() {
            if (!$.isEmptyObject(settings.maskItem.Style)) {
                $(`#${el.attr("id")}loader_mask_item`).css(settings.maskItem.Style);
            }
        };
        
        //show function for processbar
        function showPrc() {
            el.show();
            if (!$.isEmptyObject(settings.maskItem))
                $(`#${el.attr("id")}loader_mask_item`).show();
        };
        
        //hide function for processbar
        function hidePrc() {
            el.hide();
            $(`#${el.attr("id")}loader_mask_item`).remove();
        };

        if (operation === "show")
            showPrc();
        else if (operation === "hide")
            hidePrc();
        else return null;    
    };
}(jQuery));
function EbMessage(action, options) {
        var operation = action;
        var settings = $.extend({
            Background: "#31d031",
            Message: "nothing to display",
            FontColor: "#fff",
            AutoHide: true,
            Delay: 8000
        }, options);       

        function onHide() {
            return options.onHide();
        }

        function onShow() {
            return options.onShow();
        }
    
        function div() {
            if ($('#eb_messageBox_container').length === 0)
                $('body').append(`<div class="eb_messageBox_container" id="eb_messageBox_container" style="background-color:${settings.Background};color:${settings.FontColor}">
                                  <span class="msg">${settings.Message}</span>
                                  <i class="fa fa-close pull-right" onclick="$(this).parent().hide();" id="close-msg"></i>
                                </div>`);
            else {
                $(`#eb_messageBox_container .msg`).text(settings.Message);
                $(`#eb_messageBox_container`).css({ "background-color": settings.Background, "color": settings.FontColor });
            }
        }

        function showMsg() {
            div();
            $(`#eb_messageBox_container`).fadeIn();
            settings.AutoHide ? setTimeout(function () { hideMsg(); }, settings.Delay) : null;
            if (options.onShow)
                onShow();
        };

        function hideMsg() {
            $(`#eb_messageBox_container`).fadeOut();
            if (options.onHide)
                onHide();
        };
    
        if (operation === "show")
            showMsg();
        else if (operation === "hide")
            hideMsg();
        else return null;
        
    };
function EbPopBox(op,o) {
    var event = op;
    var settings = $.extend({
        Message: "nothing to display",
        Callback: function () {

        },
        ButtonStyle: {
            Text:"Close",
            Color: "white",
            Background: "#508bf9",
            Callback: function () {}
        },
        Title: "Message",
        Html: function ($selector) {

        }
    }, o);

    function popBoxHtml() {
        if ($("#eb-popbox-fade").length <= 0) {
            $("body").append(`<div class="eb-popbox-fade" id="eb-popbox-fade" style="position:fixed;display:none;
                                    height:100%;left:0;top:0;width:100%;background:black;opacity:.5;z-index:500">
                            </div>`);
        }
        if ($("#eb-popbox-container").length <= 0) {
            $('body').append(`<div class="eb-popbox-container" id="eb-popbox-container" style="position: fixed;display:none;
                                width: 100%;height: 100%;z-index: 1000;top: 0;left: 0;">
                                    <div class="eb-popbox-container-flex" style="height:inherit;width:inherit;
                                    display:flex;justify-content:center;align-items:center;">
                                        <div class="eb-popbox-container-inner" style="background:white;min-height: 200px;
                                        max-width:60%;display: flex;flex-flow: column;border: none;border-radius: 8px;
                                        box-shadow: 0 1px 3px 0 rgba(60, 64, 67, 0.3), 0 4px 8px 3px rgba(60, 64, 67, 0.15);min-width: 320px;">
                                            <div class="eb-popbox-container-head" style="padding: 15px;font-size: 16px;">
                                                ${settings.Title}
                                            </div>
                                            <div class="eb-popbox-container-bdy" style="flex: 1;padding: 0 15px;display:flex;align-items:center">
                                                ${settings.Message}
                                            </div>
                                            <div class="eb-popbox-container-footer" style="padding: 15px;display: flex;flex-flow: row-reverse;">
                                                <button id="eb-popbox-close" style="background: ${settings.ButtonStyle.Background};
                                                    color: ${settings.ButtonStyle.Color};
                                                    border-style: none;
                                                    border-radius: 4px;
                                                    padding: 5px 10px;">${settings.ButtonStyle.Text}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>`);
            $("#eb-popbox-close").on("click", function () { settings.ButtonStyle.Callback(); hideBox(); })
        }
        else {
            $("#eb-popbox-container .eb-popbox-container-head").text(settings.Title);
            $("#eb-popbox-container .eb-popbox-container-bdy").text(settings.Message);
        }
        settings.Html($("#eb-popbox-container .eb-popbox-container-bdy"));
    }

    function showBox() {
        popBoxHtml();
        $(`#eb-popbox-fade`).show();
        $(`#eb-popbox-container`).fadeIn();
    };

    function hideBox() {
        $(`#eb-popbox-fade`).hide();
        $(`#eb-popbox-container`).hide();
    };

    if (event === "show") {
        showBox();
        return true;
    }
    else if (event === "hide") {
        hideBox();
        return false;
    }
    else return false;
}
var EbCardRender = function (options) {
    this.Bot = options.Bot;
    this.$Ctrl = options.$Ctrl;
    this.CtrlObj = options.CtrlObj;

    this.initCards = function ($Ctrl) {
        $Ctrl.find(".cards-btn-cont .btn").attr("idx", this.Bot.curForm.Controls.$values.indexOf(this.Bot.curCtrl));
        this.SelectedCards = [];
        this.sumFieldsName = [];
        this.sumFieldsLabel = [];
        this.slickObjOfCards = null;
        this.filterVal = null;
        this.searchTxt = null;
        this.slickFiltered = false;
        var noOfCard = $Ctrl.find('.cards-cont').children().length;
        $Ctrl.find(".card-head-cardno").text((noOfCard === 0 ? "0" : "1") + " of " + noOfCard);

        //getting the sum fields to display total
        $.each(this.Bot.curCtrl.CardFields.$values, function (k, obj) {
            if (obj.Summarize && obj.Sum) {
                this.sumFieldsName.push(obj.Name);
                this.sumFieldsLabel.push(obj.Label||obj.Name);
            }
        }.bind(this));

        //resetting cards. required for reopening same cardset
        this.resetSelectedCardDisplay($Ctrl);

        $Ctrl.find(".card-selbtn-cont .btn").off('click').on('click', function (evt) {
            var $e = $(evt.target).closest(".btn");
            var $card = $e.closest('.card-cont');

            if (!this.Bot.curCtrl.MultiSelect) {
                this.SelectedCards = [];
                this.resetSelectedCardDisplay($('#' + this.Bot.curCtrl.EbSid));
            }

            var itempresent = $.grep(this.SelectedCards, function (a) {
                if (a.cardid === $card.attr('card-id'))
                    return true;
            });

            if (itempresent.length === 0) {
                $e.html('Remove <i class="fa fa-times"  style="color: red; display: inline-block;" aria-hidden="true"></i>');
                $($e.parent().siblings('.card-title-cont').children()[0]).show();
                this.processSelectedCard($card, evt);
            }
            else {
                $e.html('Select <i class="fa fa-check" style="color: green; display: inline-block;" aria-hidden="true"></i>');
                $($e.parent().siblings('.card-title-cont').children()[0]).hide();
                this.spliceCardArray($card.attr('card-id'));
                this.drawSummaryTable($e.closest('.cards-cont').next().find(".table tbody"));
            }
        }.bind(this));


        $Ctrl.find(".card-head-filterdiv select").off('change').on('change', function () {
            this.filterVal = $(event.target).val();
            if ($($(event.target)[0]).find(":selected")["0"].index === 0) {
                this.filterVal = null;
            }
            this.filterCards($Ctrl);
        }.bind(this, $Ctrl));

        $Ctrl.find(".card-head-searchdiv input").off('keyup').on('keyup', function () {
            this.searchTxt = $(event.target).val().trim();
            if (this.searchTxt === "")
                this.searchTxt = null;
            this.filterCards($Ctrl);
        }.bind(this, $Ctrl));

        this.slickObjOfCards = $Ctrl.find('.cards-cont').not('.slick-initialized').slick({
            slidesToShow: 1,
            infinite: false,
            draggable: false,
            speed: 300,
            cssEase: 'ease-in-out',
            adaptiveHeight: true
            //arrows: false,
            //dots: true,
            //prevArrow: "<button type='button' class='slick-prev pull-left'><i class='fa fa-angle-left' aria-hidden='true'></i></button>",
            //nextArrow: "<button type='button' class='slick-next pull-right'><i class='fa fa-angle-right' aria-hidden='true'></i></button>"
            //prevArrow: $("#prevcard"),
            //nextArrow: $("#nextcard")
        });

        $Ctrl.find('.cards-cont').on('afterChange', function (event, slick, currentSlide, nextSlide) {
            $Ctrl.find(".card-head-cardno").text((slick.$slides.length === 0 ? "0" : (currentSlide + 1)) + " of " + slick.$slides.length);
        }.bind($Ctrl));

        $.each($Ctrl.find('.card-location-cont'), function (k, lobj) {
            var latitude = parseFloat($(lobj).attr('data-lat'));
            var longitude = parseFloat($(lobj).attr('data-lng'));
            var uluru = { lat: latitude, lng: longitude };
            var map = new google.maps.Map($(lobj).children()[0], {
                zoom: 15,
                center: uluru
            });
            var marker = new google.maps.Marker({
                position: uluru,
                map: map
            });
        });
        $Ctrl.find("select.select-picker").selectpicker();
        $Ctrl.on('click', '.card-pls-mns.mns', this.minusClick);
        $Ctrl.on('click', '.card-pls-mns.pls', this.plusClick);
    };

    this.filterCards = function ($Ctrl) {
        if (this.slickFiltered) {
            $Ctrl.find('.cards-cont').slick('slickUnfilter');
            $Ctrl.find('.cards-cont').slick('slickGoTo', 0);
        }
        var $cards = this.getJqryObjOfCards($Ctrl, this.searchTxt, this.filterVal);
        $Ctrl.find('.cards-cont').slick('slickFilter', $cards);
        this.slickFiltered = true;
        var cardLength = $Ctrl.find('.cards-cont')["0"].slick.$slides.length;
        $Ctrl.find(".card-head-cardno").text((cardLength === 0 ? "0" : "1") + " of " + cardLength);
    };

    //it will return card array(jqry object) of all condition satisfying cards
    this.getJqryObjOfCards = function ($Ctrl, searchTxt, filterVal) {
        var ftemp = "";
        var stemp = [];
        if (filterVal !== null) {
            ftemp = "[filter-value='" + filterVal + "']";
        }
        if (searchTxt !== null) {
            $.each($Ctrl.find('.card-cont'), function (k, cObj) {
                if ($(cObj).attr('search-value').trim().toLowerCase().search(searchTxt.toLowerCase()) !== -1)
                    stemp.push('[card-id=' + $(cObj).attr('card-id') + ']');
            }.bind(this));
        }
        var selQuery = '.card-cont';
        if (filterVal !== null && searchTxt !== null) {
            if (stemp.length === 0) {
                stemp[0] = -1;
            }
            selQuery = '.card-cont' + stemp[0] + ftemp;
            for (var i = 1; i < stemp.length; i++) {
                selQuery += ',' + stemp[i] + ftemp;
            }
        }
        else if (searchTxt === null && filterVal !== null) {
            selQuery = '.card-cont' + ftemp;
        }
        else if (filterVal === null && searchTxt !== null) {
            selQuery = '.card-cont' + stemp[0];
            for (let i = 1; i < stemp.length; i++) {
                selQuery += ',' + stemp[i];
            }
        }
        return $Ctrl.find(selQuery);
    };
    this.processSelectedCard = function ($card, evt) {
        var sObj = {};
        sObj["cardid"] = $card.attr('card-id');
        $.each(this.Bot.curCtrl.CardFields.$values, function (k, obj) {
            if (obj.Summarize) {
                var propval = "";
                if (obj.ValueExpr && obj.ValueExpr.Code) {
                    var strFunc = window.atob(obj.ValueExpr.Code);
                    $.each(this.Bot.curCtrl.CardFields.$values, function (l, obj1) {
                        var str2 = "parseFloat(" + this.getValueInDiv($card.find('.data-' + obj1.Name)) + ")";
                        if (!(obj1.ObjType === 'CardNumericField'))
                            str2.replace("parseFloat", "");
                        strFunc = strFunc.replace(new RegExp('card.' + obj1.Name, 'g'), str2);
                    }.bind(this));
                    var newFunc = Function("$card", strFunc);
                    propval = newFunc($card).toString();
                    this.setValueInDiv($card.find('.data-' + obj.Name), propval);
                }
                else {
                    propval = this.getValueInDiv($card.find('.data-' + obj.Name));
                }
                if (obj.ObjType === 'CardNumericField')
                    sObj[obj.Name] = parseFloat(propval);
                else
                    sObj[obj.Name] = propval;
            }
        }.bind(this));
        this.SelectedCards.push(sObj);
        this.Bot.curCtrl.SelectedCards.push(parseInt($card.attr('card-id')));
        this.drawSummaryTable($card.closest('.cards-cont').next().find('.table tbody'));
        this.setCardFieldValues($card);
    };
    this.drawSummaryTable = function ($tbody) {
        if ($tbody.length === 0)//if summary is not required(internal meaning)
            return;
        $tbody.children().remove();
        var tcols = $tbody.parent()["0"].firstElementChild.children["0"].cells.length;
        if (this.SelectedCards.length === 0) {
            $tbody.append("<tr><td style='text-align:center;' colspan=" + tcols + "><i> Nothing to Display </i></td></tr>");
            return;
        }

        $.each(this.SelectedCards, function (k, obj) {
            var trhtml = "<tr card-id='" + obj.cardid + "'>";
            var ind = 0;
            for (obprop in obj) {
                var isNum = (typeof (obj[obprop]) === "number");
                if (ind++) {
                    trhtml += "<td " + (isNum ? "style='text-align: right;'" : "") + ">" + (isNum ? obj[obprop].toFixed(2) : obj[obprop]) + "</td>";
                }
            }
            trhtml += "<td><i class='fa fa-trash-o remove-cart-item' aria-hidden='true' style='cursor: pointer;'></i></td></tr>";
            $tbody.append(trhtml);
        }.bind(this));

        var sumhtml = "<tr style='font-size: 14px;font-weight: 600;'><td style='padding-left:10%;font-size: 13.3px;' colspan=" + tcols + ">";
        let i = 0;
        $.each(this.sumFieldsName, function (fi, fn) {
            var sum = 0.0;
            $.each(this.SelectedCards, function (k, obj) {
                sum += parseFloat(obj[fn]);
            }.bind(this));
            sumhtml += "Total&nbsp" + this.sumFieldsLabel[i] + ":&nbsp&nbsp" + sum.toFixed(2) + "<br/>";
            i++;
        }.bind(this));
        if (this.sumFieldsName.length !== 0)
            $tbody.append(sumhtml + "</tr></td>");

        $('.remove-cart-item').off('click').on('click', function (evt) {
            var cardid = $(evt.target).closest('tr').attr('card-id');
            this.spliceCardArray(cardid);
            $('#' + this.Bot.curCtrl.EbSid).find(".card-cont[card-id='" + cardid + "']").find(".card-selbtn-cont .btn").html('Select <i class="fa fa-check" style="color: green; display: inline-block;" aria-hidden="true"></i>');
            $($('#' + this.Bot.curCtrl.EbSid).find(".card-cont[card-id='" + cardid + "']").find(".card-title-cont").children()[0]).hide();
            this.drawSummaryTable($(evt.target).closest('tbody'));
        }.bind(this));
    };
    this.spliceCardArray = function (cardid) {
        cardid = cardid.toString();
        for (let i = 0; i < this.SelectedCards.length; i++) {
            if (this.SelectedCards[i]['cardid'] === cardid) {
                this.SelectedCards.splice(i, 1);
                break;
            }
        }
        for (let i = 0; i < this.Bot.curCtrl.SelectedCards.length; i++) {
            if (this.Bot.curCtrl.SelectedCards[i] === cardid) {
                this.Bot.curCtrl.SelectedCards.splice(i, 1);
                break;
            }
        }
    };
    this.getValueInDiv = function ($itemdiv) {
        if ($itemdiv.children().length === 0 || $($itemdiv.children()[0]).hasClass('fa-check'))
            return $itemdiv.text().trim();
        else
            return $itemdiv.children().find('input').val();
    };
    this.setValueInDiv = function ($itemdiv, value) {
        if ($itemdiv.children().length === 0)
            $itemdiv.text(value);
        else
            $itemdiv.children().find('input').val(value);
    };

    this.setCardFieldValues = function ($card) {
        var cardId = parseInt($card.attr('card-id'));
        var card = this.getCardReference(cardId);
        if (card === null)
            return;
        $.each(this.Bot.curCtrl.CardFields.$values, function (k, fObj) {
            if (!fObj.DoNotPersist) {
                var fVal = this.getValueInDiv($card.find('.data-' + fObj.Name));
                //fObj.ebDbType always returns 16 <string>!!! if ebDbType return correct value then this checking can be avoided
                if (fObj.ObjType === 'CardNumericField')
                    card.CustomFields.$values[fObj.Name] = parseFloat(fVal);
                else
                    card.CustomFields.$values[fObj.Name] = fVal;
            }
        }.bind(this));
    };
    this.getCardReference = function (cardid) {
        var card = null;
        $.each(this.Bot.curCtrl.CardCollection.$values, function (k, cardObj) {
            if (cardObj.CardId === cardid) {
                card = cardObj;
                return;
            }
        }.bind(this));
        return card;
    };
    this.resetSelectedCardDisplay = function ($Ctrl) {
        //reset cardset for reopening
        this.Bot.curCtrl.SelectedCards = [];
        $.each($Ctrl.find(".card-selbtn-cont .btn"), function (h, elemt) {
            $(elemt).html('Select <i class="fa fa-check" style="color: green; display: inline-block;" aria-hidden="true"></i>');
            $($(elemt).parent().siblings('.card-title-cont').children()[0]).hide();
        });
        this.drawSummaryTable($Ctrl.find(".table tbody"));
    };

    this.CtrlObj.getValueFromDOM = function () {
        var resObj = {};
        var isPersistAnyField = false;
        $.each(this.CtrlObj.CardFields.$values, function (h, fObj) {
            if (!fObj.DoNotPersist) {
                isPersistAnyField = true;
            }
        }.bind(this));

        if (!this.CtrlObj.MultiSelect && isPersistAnyField) {
            this.$Ctrl.find('.slick-current .card-selbtn-cont .btn').click();
        }
        if (isPersistAnyField) {
            $.each(this.CtrlObj.CardCollection.$values, function (k, cObj) {
                if (this.CtrlObj.SelectedCards.indexOf(cObj.CardId) !== -1) {
                    var tempArray = new Array();
                    $.each(this.CtrlObj.CardFields.$values, function (h, fObj) {
                        if (!fObj.DoNotPersist) {
                            tempArray.push(new Object({ Value: cObj.CustomFields.$values[fObj.Name], Type: fObj.EbDbType, Name: fObj.Name }));
                        }
                    }.bind(this));
                    resObj[cObj.CardId] = tempArray;
                }
            }.bind(this));
        }
        return JSON.stringify(resObj);

    }.bind(this);

    this.CtrlObj.getDisplayMemberFromDOM = function () {
        //let Obj = this.Bot.getCardsetValue(this.CtrlObj);
        //return this.Bot.curDispValue;
        return '';
    }.bind(this);

    this.CtrlObj.getDataModel = function () {
        let dataModel = [];
        //if (!this.CtrlObj.MultiSelect) {
        //    this.$Ctrl.find('.slick-current .card-selbtn-cont .btn').click();
        //}
        $.each(this.CtrlObj.CardCollection.$values, function (k, cObj) {
            if (this.CtrlObj.SelectedCards.indexOf(cObj.CardId) !== -1) {
                let dataRow = { RowId: 0, Columns: [] };
                dataRow.Columns.push({ Name: 'card_id', Type: 7, Value: cObj.CardId });
                $.each(this.CtrlObj.CardFields.$values, function (h, fObj) {
                    if (!fObj.DoNotPersist) {
                        dataRow.Columns.push({ Name: fObj.Name, Type: fObj.EbDbType, Value: cObj.CustomFields.$values[fObj.Name] });
                    }
                }.bind(this));
                dataModel.push(dataRow);
            }
        }.bind(this));
        return dataModel;
    }.bind(this);

    this.minusClick = function () {
        let $e = $(event.target).closest(".mns");
        let $input = $e.closest(".inp-wrap").find(".cart-inp");
        let num = parseFloat($input.val());
        let limit = parseFloat($e.closest(".card-pls-mns").attr("limit"));
        if (num > limit) {
            $input.val(num - 1);
            $e.parents('.card-numeric-cont').attr('data-value', num - 1);
        }
    }.bind(this);

    this.plusClick = function () {
        let $e = $(event.target).closest(".pls");
        let $input = $e.closest(".inp-wrap").find(".cart-inp");
        let num = parseFloat($input.val());
        let limit = parseFloat($e.closest(".card-pls-mns").attr("limit"));

        if (num < limit) {
            $input.val(num + 1);
            $e.parents('.card-numeric-cont').attr('data-value', num + 1);
        }

    }.bind(this);

    this.initCards(this.$Ctrl);

};
/*!
* jquery.inputmask.bundle.js
* https://github.com/RobinHerbots/Inputmask
* Copyright (c) 2010 - 2017 Robin Herbots
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
* Version: 3.3.11
 * from https://rawgit.com/RobinHerbots/jquery.inputmask/3.x/dist/jquery.inputmask.bundle.js
*/

!function(modules) {
    function __webpack_require__(moduleId) {
        if (installedModules[moduleId]) return installedModules[moduleId].exports;
        var module = installedModules[moduleId] = {
            i: moduleId,
            l: !1,
            exports: {}
        };
        return modules[moduleId].call(module.exports, module, module.exports, __webpack_require__), 
        module.l = !0, module.exports;
    }
    var installedModules = {};
    __webpack_require__.m = modules, __webpack_require__.c = installedModules, __webpack_require__.d = function(exports, name, getter) {
        __webpack_require__.o(exports, name) || Object.defineProperty(exports, name, {
            configurable: !1,
            enumerable: !0,
            get: getter
        });
    }, __webpack_require__.n = function(module) {
        var getter = module && module.__esModule ? function() {
            return module.default;
        } : function() {
            return module;
        };
        return __webpack_require__.d(getter, "a", getter), getter;
    }, __webpack_require__.o = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    }, __webpack_require__.p = "", __webpack_require__(__webpack_require__.s = 3);
}([ function(module, exports, __webpack_require__) {
    "use strict";
    var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
    "function" == typeof Symbol && Symbol.iterator;
    !function(factory) {
        __WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(2) ], void 0 !== (__WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof (__WEBPACK_AMD_DEFINE_FACTORY__ = factory) ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__) && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__);
    }(function($) {
        return $;
    });
}, function(module, exports, __webpack_require__) {
    "use strict";
    var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__, _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
        return typeof obj;
    } : function(obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
    !function(factory) {
        __WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(0), __webpack_require__(10), __webpack_require__(11) ], 
        void 0 !== (__WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof (__WEBPACK_AMD_DEFINE_FACTORY__ = factory) ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__) && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__);
    }(function($, window, document, undefined) {
        function Inputmask(alias, options, internal) {
            if (!(this instanceof Inputmask)) return new Inputmask(alias, options, internal);
            this.el = undefined, this.events = {}, this.maskset = undefined, this.refreshValue = !1, 
            !0 !== internal && ($.isPlainObject(alias) ? options = alias : (options = options || {}).alias = alias, 
            this.opts = $.extend(!0, {}, this.defaults, options), this.noMasksCache = options && options.definitions !== undefined, 
            this.userOptions = options || {}, this.isRTL = this.opts.numericInput, resolveAlias(this.opts.alias, options, this.opts));
        }
        function resolveAlias(aliasStr, options, opts) {
            var aliasDefinition = Inputmask.prototype.aliases[aliasStr];
            return aliasDefinition ? (aliasDefinition.alias && resolveAlias(aliasDefinition.alias, undefined, opts), 
            $.extend(!0, opts, aliasDefinition), $.extend(!0, opts, options), !0) : (null === opts.mask && (opts.mask = aliasStr), 
            !1);
        }
        function generateMaskSet(opts, nocache) {
            function generateMask(mask, metadata, opts) {
                var regexMask = !1;
                if (null !== mask && "" !== mask || ((regexMask = null !== opts.regex) ? mask = (mask = opts.regex).replace(/^(\^)(.*)(\$)$/, "$2") : (regexMask = !0, 
                mask = ".*")), 1 === mask.length && !1 === opts.greedy && 0 !== opts.repeat && (opts.placeholder = ""), 
                opts.repeat > 0 || "*" === opts.repeat || "+" === opts.repeat) {
                    var repeatStart = "*" === opts.repeat ? 0 : "+" === opts.repeat ? 1 : opts.repeat;
                    mask = opts.groupmarker.start + mask + opts.groupmarker.end + opts.quantifiermarker.start + repeatStart + "," + opts.repeat + opts.quantifiermarker.end;
                }
                var masksetDefinition, maskdefKey = regexMask ? "regex_" + opts.regex : opts.numericInput ? mask.split("").reverse().join("") : mask;
                return Inputmask.prototype.masksCache[maskdefKey] === undefined || !0 === nocache ? (masksetDefinition = {
                    mask: mask,
                    maskToken: Inputmask.prototype.analyseMask(mask, regexMask, opts),
                    validPositions: {},
                    _buffer: undefined,
                    buffer: undefined,
                    tests: {},
                    metadata: metadata,
                    maskLength: undefined
                }, !0 !== nocache && (Inputmask.prototype.masksCache[maskdefKey] = masksetDefinition, 
                masksetDefinition = $.extend(!0, {}, Inputmask.prototype.masksCache[maskdefKey]))) : masksetDefinition = $.extend(!0, {}, Inputmask.prototype.masksCache[maskdefKey]), 
                masksetDefinition;
            }
            if ($.isFunction(opts.mask) && (opts.mask = opts.mask(opts)), $.isArray(opts.mask)) {
                if (opts.mask.length > 1) {
                    opts.keepStatic = null === opts.keepStatic || opts.keepStatic;
                    var altMask = opts.groupmarker.start;
                    return $.each(opts.numericInput ? opts.mask.reverse() : opts.mask, function(ndx, msk) {
                        altMask.length > 1 && (altMask += opts.groupmarker.end + opts.alternatormarker + opts.groupmarker.start), 
                        msk.mask === undefined || $.isFunction(msk.mask) ? altMask += msk : altMask += msk.mask;
                    }), altMask += opts.groupmarker.end, generateMask(altMask, opts.mask, opts);
                }
                opts.mask = opts.mask.pop();
            }
            return opts.mask && opts.mask.mask !== undefined && !$.isFunction(opts.mask.mask) ? generateMask(opts.mask.mask, opts.mask, opts) : generateMask(opts.mask, opts.mask, opts);
        }
        function maskScope(actionObj, maskset, opts) {
            function getMaskTemplate(baseOnInput, minimalPos, includeMode) {
                minimalPos = minimalPos || 0;
                var ndxIntlzr, test, testPos, maskTemplate = [], pos = 0, lvp = getLastValidPosition();
                do {
                    !0 === baseOnInput && getMaskSet().validPositions[pos] ? (test = (testPos = getMaskSet().validPositions[pos]).match, 
                    ndxIntlzr = testPos.locator.slice(), maskTemplate.push(!0 === includeMode ? testPos.input : !1 === includeMode ? test.nativeDef : getPlaceholder(pos, test))) : (test = (testPos = getTestTemplate(pos, ndxIntlzr, pos - 1)).match, 
                    ndxIntlzr = testPos.locator.slice(), (!1 === opts.jitMasking || pos < lvp || "number" == typeof opts.jitMasking && isFinite(opts.jitMasking) && opts.jitMasking > pos) && maskTemplate.push(!1 === includeMode ? test.nativeDef : getPlaceholder(pos, test))), 
                    pos++;
                } while ((maxLength === undefined || pos < maxLength) && (null !== test.fn || "" !== test.def) || minimalPos > pos);
                return "" === maskTemplate[maskTemplate.length - 1] && maskTemplate.pop(), getMaskSet().maskLength = pos + 1, 
                maskTemplate;
            }
            function getMaskSet() {
                return maskset;
            }
            function resetMaskSet(soft) {
                var maskset = getMaskSet();
                maskset.buffer = undefined, !0 !== soft && (maskset.validPositions = {}, maskset.p = 0);
            }
            function getLastValidPosition(closestTo, strict, validPositions) {
                var before = -1, after = -1, valids = validPositions || getMaskSet().validPositions;
                closestTo === undefined && (closestTo = -1);
                for (var posNdx in valids) {
                    var psNdx = parseInt(posNdx);
                    valids[psNdx] && (strict || !0 !== valids[psNdx].generatedInput) && (psNdx <= closestTo && (before = psNdx), 
                    psNdx >= closestTo && (after = psNdx));
                }
                return -1 !== before && closestTo - before > 1 || after < closestTo ? before : after;
            }
            function stripValidPositions(start, end, nocheck, strict) {
                var i, startPos = start, positionsClone = $.extend(!0, {}, getMaskSet().validPositions), needsValidation = !1;
                for (getMaskSet().p = start, i = end - 1; i >= startPos; i--) getMaskSet().validPositions[i] !== undefined && (!0 !== nocheck && (!getMaskSet().validPositions[i].match.optionality && function(pos) {
                    var posMatch = getMaskSet().validPositions[pos];
                    if (posMatch !== undefined && null === posMatch.match.fn) {
                        var prevMatch = getMaskSet().validPositions[pos - 1], nextMatch = getMaskSet().validPositions[pos + 1];
                        return prevMatch !== undefined && nextMatch !== undefined;
                    }
                    return !1;
                }(i) || !1 === opts.canClearPosition(getMaskSet(), i, getLastValidPosition(), strict, opts)) || delete getMaskSet().validPositions[i]);
                for (resetMaskSet(!0), i = startPos + 1; i <= getLastValidPosition(); ) {
                    for (;getMaskSet().validPositions[startPos] !== undefined; ) startPos++;
                    if (i < startPos && (i = startPos + 1), getMaskSet().validPositions[i] === undefined && isMask(i)) i++; else {
                        var t = getTestTemplate(i);
                        !1 === needsValidation && positionsClone[startPos] && positionsClone[startPos].match.def === t.match.def ? (getMaskSet().validPositions[startPos] = $.extend(!0, {}, positionsClone[startPos]), 
                        getMaskSet().validPositions[startPos].input = t.input, delete getMaskSet().validPositions[i], 
                        i++) : positionCanMatchDefinition(startPos, t.match.def) ? !1 !== isValid(startPos, t.input || getPlaceholder(i), !0) && (delete getMaskSet().validPositions[i], 
                        i++, needsValidation = !0) : isMask(i) || (i++, startPos--), startPos++;
                    }
                }
                resetMaskSet(!0);
            }
            function determineTestTemplate(tests, guessNextBest) {
                for (var testPos, testPositions = tests, lvp = getLastValidPosition(), lvTest = getMaskSet().validPositions[lvp] || getTests(0)[0], lvTestAltArr = lvTest.alternation !== undefined ? lvTest.locator[lvTest.alternation].toString().split(",") : [], ndx = 0; ndx < testPositions.length && (!((testPos = testPositions[ndx]).match && (opts.greedy && !0 !== testPos.match.optionalQuantifier || (!1 === testPos.match.optionality || !1 === testPos.match.newBlockMarker) && !0 !== testPos.match.optionalQuantifier) && (lvTest.alternation === undefined || lvTest.alternation !== testPos.alternation || testPos.locator[lvTest.alternation] !== undefined && checkAlternationMatch(testPos.locator[lvTest.alternation].toString().split(","), lvTestAltArr))) || !0 === guessNextBest && (null !== testPos.match.fn || /[0-9a-bA-Z]/.test(testPos.match.def))); ndx++) ;
                return testPos;
            }
            function getTestTemplate(pos, ndxIntlzr, tstPs) {
                return getMaskSet().validPositions[pos] || determineTestTemplate(getTests(pos, ndxIntlzr ? ndxIntlzr.slice() : ndxIntlzr, tstPs));
            }
            function getTest(pos) {
                return getMaskSet().validPositions[pos] ? getMaskSet().validPositions[pos] : getTests(pos)[0];
            }
            function positionCanMatchDefinition(pos, def) {
                for (var valid = !1, tests = getTests(pos), tndx = 0; tndx < tests.length; tndx++) if (tests[tndx].match && tests[tndx].match.def === def) {
                    valid = !0;
                    break;
                }
                return valid;
            }
            function getTests(pos, ndxIntlzr, tstPs) {
                function resolveTestFromToken(maskToken, ndxInitializer, loopNdx, quantifierRecurse) {
                    function handleMatch(match, loopNdx, quantifierRecurse) {
                        function isFirstMatch(latestMatch, tokenGroup) {
                            var firstMatch = 0 === $.inArray(latestMatch, tokenGroup.matches);
                            return firstMatch || $.each(tokenGroup.matches, function(ndx, match) {
                                if (!0 === match.isQuantifier && (firstMatch = isFirstMatch(latestMatch, tokenGroup.matches[ndx - 1]))) return !1;
                            }), firstMatch;
                        }
                        function resolveNdxInitializer(pos, alternateNdx, targetAlternation) {
                            var bestMatch, indexPos;
                            if (getMaskSet().validPositions[pos - 1] && targetAlternation && getMaskSet().tests[pos]) for (var vpAlternation = getMaskSet().validPositions[pos - 1].locator, tpAlternation = getMaskSet().tests[pos][0].locator, i = 0; i < targetAlternation; i++) if (vpAlternation[i] !== tpAlternation[i]) return vpAlternation.slice(targetAlternation + 1);
                            return (getMaskSet().tests[pos] || getMaskSet().validPositions[pos]) && $.each(getMaskSet().tests[pos] || [ getMaskSet().validPositions[pos] ], function(ndx, lmnt) {
                                var alternation = targetAlternation !== undefined ? targetAlternation : lmnt.alternation, ndxPos = lmnt.locator[alternation] !== undefined ? lmnt.locator[alternation].toString().indexOf(alternateNdx) : -1;
                                (indexPos === undefined || ndxPos < indexPos) && -1 !== ndxPos && (bestMatch = lmnt, 
                                indexPos = ndxPos);
                            }), bestMatch ? bestMatch.locator.slice((targetAlternation !== undefined ? targetAlternation : bestMatch.alternation) + 1) : targetAlternation !== undefined ? resolveNdxInitializer(pos, alternateNdx) : undefined;
                        }
                        if (testPos > 1e4) throw "Inputmask: There is probably an error in your mask definition or in the code. Create an issue on github with an example of the mask you are using. " + getMaskSet().mask;
                        if (testPos === pos && match.matches === undefined) return matches.push({
                            match: match,
                            locator: loopNdx.reverse(),
                            cd: cacheDependency
                        }), !0;
                        if (match.matches !== undefined) {
                            if (match.isGroup && quantifierRecurse !== match) {
                                if (match = handleMatch(maskToken.matches[$.inArray(match, maskToken.matches) + 1], loopNdx)) return !0;
                            } else if (match.isOptional) {
                                var optionalToken = match;
                                if (match = resolveTestFromToken(match, ndxInitializer, loopNdx, quantifierRecurse)) {
                                    if (latestMatch = matches[matches.length - 1].match, !isFirstMatch(latestMatch, optionalToken)) return !0;
                                    insertStop = !0, testPos = pos;
                                }
                            } else if (match.isAlternator) {
                                var maltMatches, alternateToken = match, malternateMatches = [], currentMatches = matches.slice(), loopNdxCnt = loopNdx.length, altIndex = ndxInitializer.length > 0 ? ndxInitializer.shift() : -1;
                                if (-1 === altIndex || "string" == typeof altIndex) {
                                    var amndx, currentPos = testPos, ndxInitializerClone = ndxInitializer.slice(), altIndexArr = [];
                                    if ("string" == typeof altIndex) altIndexArr = altIndex.split(","); else for (amndx = 0; amndx < alternateToken.matches.length; amndx++) altIndexArr.push(amndx);
                                    for (var ndx = 0; ndx < altIndexArr.length; ndx++) {
                                        if (amndx = parseInt(altIndexArr[ndx]), matches = [], ndxInitializer = resolveNdxInitializer(testPos, amndx, loopNdxCnt) || ndxInitializerClone.slice(), 
                                        !0 !== (match = handleMatch(alternateToken.matches[amndx] || maskToken.matches[amndx], [ amndx ].concat(loopNdx), quantifierRecurse) || match) && match !== undefined && altIndexArr[altIndexArr.length - 1] < alternateToken.matches.length) {
                                            var ntndx = $.inArray(match, maskToken.matches) + 1;
                                            maskToken.matches.length > ntndx && (match = handleMatch(maskToken.matches[ntndx], [ ntndx ].concat(loopNdx.slice(1, loopNdx.length)), quantifierRecurse)) && (altIndexArr.push(ntndx.toString()), 
                                            $.each(matches, function(ndx, lmnt) {
                                                lmnt.alternation = loopNdx.length - 1;
                                            }));
                                        }
                                        maltMatches = matches.slice(), testPos = currentPos, matches = [];
                                        for (var ndx1 = 0; ndx1 < maltMatches.length; ndx1++) {
                                            var altMatch = maltMatches[ndx1], dropMatch = !1;
                                            altMatch.alternation = altMatch.alternation || loopNdxCnt;
                                            for (var ndx2 = 0; ndx2 < malternateMatches.length; ndx2++) {
                                                var altMatch2 = malternateMatches[ndx2];
                                                if ("string" != typeof altIndex || -1 !== $.inArray(altMatch.locator[altMatch.alternation].toString(), altIndexArr)) {
                                                    if (function(source, target) {
                                                        return source.match.nativeDef === target.match.nativeDef || source.match.def === target.match.nativeDef || source.match.nativeDef === target.match.def;
                                                    }(altMatch, altMatch2)) {
                                                        dropMatch = !0, altMatch.alternation === altMatch2.alternation && -1 === altMatch2.locator[altMatch2.alternation].toString().indexOf(altMatch.locator[altMatch.alternation]) && (altMatch2.locator[altMatch2.alternation] = altMatch2.locator[altMatch2.alternation] + "," + altMatch.locator[altMatch.alternation], 
                                                        altMatch2.alternation = altMatch.alternation), altMatch.match.nativeDef === altMatch2.match.def && (altMatch.locator[altMatch.alternation] = altMatch2.locator[altMatch2.alternation], 
                                                        malternateMatches.splice(malternateMatches.indexOf(altMatch2), 1, altMatch));
                                                        break;
                                                    }
                                                    if (altMatch.match.def === altMatch2.match.def) {
                                                        dropMatch = !1;
                                                        break;
                                                    }
                                                    if (function(source, target) {
                                                        return null === source.match.fn && null !== target.match.fn && target.match.fn.test(source.match.def, getMaskSet(), pos, !1, opts, !1);
                                                    }(altMatch, altMatch2) || function(source, target) {
                                                        return null !== source.match.fn && null !== target.match.fn && target.match.fn.test(source.match.def.replace(/[\[\]]/g, ""), getMaskSet(), pos, !1, opts, !1);
                                                    }(altMatch, altMatch2)) {
                                                        altMatch.alternation === altMatch2.alternation && -1 === altMatch.locator[altMatch.alternation].toString().indexOf(altMatch2.locator[altMatch2.alternation].toString().split("")[0]) && (altMatch.na = altMatch.na || altMatch.locator[altMatch.alternation].toString(), 
                                                        -1 === altMatch.na.indexOf(altMatch.locator[altMatch.alternation].toString().split("")[0]) && (altMatch.na = altMatch.na + "," + altMatch.locator[altMatch2.alternation].toString().split("")[0]), 
                                                        dropMatch = !0, altMatch.locator[altMatch.alternation] = altMatch2.locator[altMatch2.alternation].toString().split("")[0] + "," + altMatch.locator[altMatch.alternation], 
                                                        malternateMatches.splice(malternateMatches.indexOf(altMatch2), 0, altMatch));
                                                        break;
                                                    }
                                                }
                                            }
                                            dropMatch || malternateMatches.push(altMatch);
                                        }
                                    }
                                    "string" == typeof altIndex && (malternateMatches = $.map(malternateMatches, function(lmnt, ndx) {
                                        if (isFinite(ndx)) {
                                            var alternation = lmnt.alternation, altLocArr = lmnt.locator[alternation].toString().split(",");
                                            lmnt.locator[alternation] = undefined, lmnt.alternation = undefined;
                                            for (var alndx = 0; alndx < altLocArr.length; alndx++) -1 !== $.inArray(altLocArr[alndx], altIndexArr) && (lmnt.locator[alternation] !== undefined ? (lmnt.locator[alternation] += ",", 
                                            lmnt.locator[alternation] += altLocArr[alndx]) : lmnt.locator[alternation] = parseInt(altLocArr[alndx]), 
                                            lmnt.alternation = alternation);
                                            if (lmnt.locator[alternation] !== undefined) return lmnt;
                                        }
                                    })), matches = currentMatches.concat(malternateMatches), testPos = pos, insertStop = matches.length > 0, 
                                    match = malternateMatches.length > 0, ndxInitializer = ndxInitializerClone.slice();
                                } else match = handleMatch(alternateToken.matches[altIndex] || maskToken.matches[altIndex], [ altIndex ].concat(loopNdx), quantifierRecurse);
                                if (match) return !0;
                            } else if (match.isQuantifier && quantifierRecurse !== maskToken.matches[$.inArray(match, maskToken.matches) - 1]) for (var qt = match, qndx = ndxInitializer.length > 0 ? ndxInitializer.shift() : 0; qndx < (isNaN(qt.quantifier.max) ? qndx + 1 : qt.quantifier.max) && testPos <= pos; qndx++) {
                                var tokenGroup = maskToken.matches[$.inArray(qt, maskToken.matches) - 1];
                                if (match = handleMatch(tokenGroup, [ qndx ].concat(loopNdx), tokenGroup)) {
                                    if (latestMatch = matches[matches.length - 1].match, latestMatch.optionalQuantifier = qndx > qt.quantifier.min - 1, 
                                    isFirstMatch(latestMatch, tokenGroup)) {
                                        if (qndx > qt.quantifier.min - 1) {
                                            insertStop = !0, testPos = pos;
                                            break;
                                        }
                                        return !0;
                                    }
                                    return !0;
                                }
                            } else if (match = resolveTestFromToken(match, ndxInitializer, loopNdx, quantifierRecurse)) return !0;
                        } else testPos++;
                    }
                    for (var tndx = ndxInitializer.length > 0 ? ndxInitializer.shift() : 0; tndx < maskToken.matches.length; tndx++) if (!0 !== maskToken.matches[tndx].isQuantifier) {
                        var match = handleMatch(maskToken.matches[tndx], [ tndx ].concat(loopNdx), quantifierRecurse);
                        if (match && testPos === pos) return match;
                        if (testPos > pos) break;
                    }
                }
                function filterTests(tests) {
                    if (opts.keepStatic && pos > 0 && tests.length > 1 + ("" === tests[tests.length - 1].match.def ? 1 : 0) && !0 !== tests[0].match.optionality && !0 !== tests[0].match.optionalQuantifier && null === tests[0].match.fn && !/[0-9a-bA-Z]/.test(tests[0].match.def)) {
                        if (getMaskSet().validPositions[pos - 1] === undefined) return [ determineTestTemplate(tests) ];
                        if (getMaskSet().validPositions[pos - 1].alternation === tests[0].alternation) return [ determineTestTemplate(tests) ];
                        if (getMaskSet().validPositions[pos - 1]) return [ determineTestTemplate(tests) ];
                    }
                    return tests;
                }
                var latestMatch, maskTokens = getMaskSet().maskToken, testPos = ndxIntlzr ? tstPs : 0, ndxInitializer = ndxIntlzr ? ndxIntlzr.slice() : [ 0 ], matches = [], insertStop = !1, cacheDependency = ndxIntlzr ? ndxIntlzr.join("") : "";
                if (pos > -1) {
                    if (ndxIntlzr === undefined) {
                        for (var test, previousPos = pos - 1; (test = getMaskSet().validPositions[previousPos] || getMaskSet().tests[previousPos]) === undefined && previousPos > -1; ) previousPos--;
                        test !== undefined && previousPos > -1 && (ndxInitializer = function(tests) {
                            var locator = [];
                            return $.isArray(tests) || (tests = [ tests ]), tests.length > 0 && (tests[0].alternation === undefined ? 0 === (locator = determineTestTemplate(tests.slice()).locator.slice()).length && (locator = tests[0].locator.slice()) : $.each(tests, function(ndx, tst) {
                                if ("" !== tst.def) if (0 === locator.length) locator = tst.locator.slice(); else for (var i = 0; i < locator.length; i++) tst.locator[i] && -1 === locator[i].toString().indexOf(tst.locator[i]) && (locator[i] += "," + tst.locator[i]);
                            })), locator;
                        }(test), cacheDependency = ndxInitializer.join(""), testPos = previousPos);
                    }
                    if (getMaskSet().tests[pos] && getMaskSet().tests[pos][0].cd === cacheDependency) return filterTests(getMaskSet().tests[pos]);
                    for (var mtndx = ndxInitializer.shift(); mtndx < maskTokens.length && !(resolveTestFromToken(maskTokens[mtndx], ndxInitializer, [ mtndx ]) && testPos === pos || testPos > pos); mtndx++) ;
                }
                return (0 === matches.length || insertStop) && matches.push({
                    match: {
                        fn: null,
                        cardinality: 0,
                        optionality: !0,
                        casing: null,
                        def: "",
                        placeholder: ""
                    },
                    locator: [],
                    cd: cacheDependency
                }), ndxIntlzr !== undefined && getMaskSet().tests[pos] ? filterTests($.extend(!0, [], matches)) : (getMaskSet().tests[pos] = $.extend(!0, [], matches), 
                filterTests(getMaskSet().tests[pos]));
            }
            function getBufferTemplate() {
                return getMaskSet()._buffer === undefined && (getMaskSet()._buffer = getMaskTemplate(!1, 1), 
                getMaskSet().buffer === undefined && (getMaskSet().buffer = getMaskSet()._buffer.slice())), 
                getMaskSet()._buffer;
            }
            function getBuffer(noCache) {
                return getMaskSet().buffer !== undefined && !0 !== noCache || (getMaskSet().buffer = getMaskTemplate(!0, getLastValidPosition(), !0)), 
                getMaskSet().buffer;
            }
            function refreshFromBuffer(start, end, buffer) {
                var i, p;
                if (!0 === start) resetMaskSet(), start = 0, end = buffer.length; else for (i = start; i < end; i++) delete getMaskSet().validPositions[i];
                for (p = start, i = start; i < end; i++) if (resetMaskSet(!0), buffer[i] !== opts.skipOptionalPartCharacter) {
                    var valResult = isValid(p, buffer[i], !0, !0);
                    !1 !== valResult && (resetMaskSet(!0), p = valResult.caret !== undefined ? valResult.caret : valResult.pos + 1);
                }
            }
            function casing(elem, test, pos) {
                switch (opts.casing || test.casing) {
                  case "upper":
                    elem = elem.toUpperCase();
                    break;

                  case "lower":
                    elem = elem.toLowerCase();
                    break;

                  case "title":
                    var posBefore = getMaskSet().validPositions[pos - 1];
                    elem = 0 === pos || posBefore && posBefore.input === String.fromCharCode(Inputmask.keyCode.SPACE) ? elem.toUpperCase() : elem.toLowerCase();
                    break;

                  default:
                    if ($.isFunction(opts.casing)) {
                        var args = Array.prototype.slice.call(arguments);
                        args.push(getMaskSet().validPositions), elem = opts.casing.apply(this, args);
                    }
                }
                return elem;
            }
            function checkAlternationMatch(altArr1, altArr2, na) {
                for (var naNdx, altArrC = opts.greedy ? altArr2 : altArr2.slice(0, 1), isMatch = !1, naArr = na !== undefined ? na.split(",") : [], i = 0; i < naArr.length; i++) -1 !== (naNdx = altArr1.indexOf(naArr[i])) && altArr1.splice(naNdx, 1);
                for (var alndx = 0; alndx < altArr1.length; alndx++) if (-1 !== $.inArray(altArr1[alndx], altArrC)) {
                    isMatch = !0;
                    break;
                }
                return isMatch;
            }
            function isValid(pos, c, strict, fromSetValid, fromAlternate, validateOnly) {
                function isSelection(posObj) {
                    var selection = isRTL ? posObj.begin - posObj.end > 1 || posObj.begin - posObj.end == 1 : posObj.end - posObj.begin > 1 || posObj.end - posObj.begin == 1;
                    return selection && 0 === posObj.begin && posObj.end === getMaskSet().maskLength ? "full" : selection;
                }
                function _isValid(position, c, strict) {
                    var rslt = !1;
                    return $.each(getTests(position), function(ndx, tst) {
                        for (var test = tst.match, loopend = c ? 1 : 0, chrs = "", i = test.cardinality; i > loopend; i--) chrs += getBufferElement(position - (i - 1));
                        if (c && (chrs += c), getBuffer(!0), !1 !== (rslt = null != test.fn ? test.fn.test(chrs, getMaskSet(), position, strict, opts, isSelection(pos)) : (c === test.def || c === opts.skipOptionalPartCharacter) && "" !== test.def && {
                            c: getPlaceholder(position, test, !0) || test.def,
                            pos: position
                        })) {
                            var elem = rslt.c !== undefined ? rslt.c : c;
                            elem = elem === opts.skipOptionalPartCharacter && null === test.fn ? getPlaceholder(position, test, !0) || test.def : elem;
                            var validatedPos = position, possibleModifiedBuffer = getBuffer();
                            if (rslt.remove !== undefined && ($.isArray(rslt.remove) || (rslt.remove = [ rslt.remove ]), 
                            $.each(rslt.remove.sort(function(a, b) {
                                return b - a;
                            }), function(ndx, lmnt) {
                                stripValidPositions(lmnt, lmnt + 1, !0);
                            })), rslt.insert !== undefined && ($.isArray(rslt.insert) || (rslt.insert = [ rslt.insert ]), 
                            $.each(rslt.insert.sort(function(a, b) {
                                return a - b;
                            }), function(ndx, lmnt) {
                                isValid(lmnt.pos, lmnt.c, !0, fromSetValid);
                            })), rslt.refreshFromBuffer) {
                                var refresh = rslt.refreshFromBuffer;
                                if (refreshFromBuffer(!0 === refresh ? refresh : refresh.start, refresh.end, possibleModifiedBuffer), 
                                rslt.pos === undefined && rslt.c === undefined) return rslt.pos = getLastValidPosition(), 
                                !1;
                                if ((validatedPos = rslt.pos !== undefined ? rslt.pos : position) !== position) return rslt = $.extend(rslt, isValid(validatedPos, elem, !0, fromSetValid)), 
                                !1;
                            } else if (!0 !== rslt && rslt.pos !== undefined && rslt.pos !== position && (validatedPos = rslt.pos, 
                            refreshFromBuffer(position, validatedPos, getBuffer().slice()), validatedPos !== position)) return rslt = $.extend(rslt, isValid(validatedPos, elem, !0)), 
                            !1;
                            return (!0 === rslt || rslt.pos !== undefined || rslt.c !== undefined) && (ndx > 0 && resetMaskSet(!0), 
                            setValidPosition(validatedPos, $.extend({}, tst, {
                                input: casing(elem, test, validatedPos)
                            }), fromSetValid, isSelection(pos)) || (rslt = !1), !1);
                        }
                    }), rslt;
                }
                function setValidPosition(pos, validTest, fromSetValid, isSelection) {
                    if (isSelection || opts.insertMode && getMaskSet().validPositions[pos] !== undefined && fromSetValid === undefined) {
                        var i, positionsClone = $.extend(!0, {}, getMaskSet().validPositions), lvp = getLastValidPosition(undefined, !0);
                        for (i = pos; i <= lvp; i++) delete getMaskSet().validPositions[i];
                        getMaskSet().validPositions[pos] = $.extend(!0, {}, validTest);
                        var j, valid = !0, vps = getMaskSet().validPositions, needsValidation = !1, initialLength = getMaskSet().maskLength;
                        for (i = j = pos; i <= lvp; i++) {
                            var t = positionsClone[i];
                            if (t !== undefined) for (var posMatch = j; posMatch < getMaskSet().maskLength && (null === t.match.fn && vps[i] && (!0 === vps[i].match.optionalQuantifier || !0 === vps[i].match.optionality) || null != t.match.fn); ) {
                                if (posMatch++, !1 === needsValidation && positionsClone[posMatch] && positionsClone[posMatch].match.def === t.match.def) getMaskSet().validPositions[posMatch] = $.extend(!0, {}, positionsClone[posMatch]), 
                                getMaskSet().validPositions[posMatch].input = t.input, fillMissingNonMask(posMatch), 
                                j = posMatch, valid = !0; else if (positionCanMatchDefinition(posMatch, t.match.def)) {
                                    var result = isValid(posMatch, t.input, !0, !0);
                                    valid = !1 !== result, j = result.caret || result.insert ? getLastValidPosition() : posMatch, 
                                    needsValidation = !0;
                                } else if (!(valid = !0 === t.generatedInput) && posMatch >= getMaskSet().maskLength - 1) break;
                                if (getMaskSet().maskLength < initialLength && (getMaskSet().maskLength = initialLength), 
                                valid) break;
                            }
                            if (!valid) break;
                        }
                        if (!valid) return getMaskSet().validPositions = $.extend(!0, {}, positionsClone), 
                        resetMaskSet(!0), !1;
                    } else getMaskSet().validPositions[pos] = $.extend(!0, {}, validTest);
                    return resetMaskSet(!0), !0;
                }
                function fillMissingNonMask(maskPos) {
                    for (var pndx = maskPos - 1; pndx > -1 && !getMaskSet().validPositions[pndx]; pndx--) ;
                    var testTemplate, testsFromPos;
                    for (pndx++; pndx < maskPos; pndx++) getMaskSet().validPositions[pndx] === undefined && (!1 === opts.jitMasking || opts.jitMasking > pndx) && ("" === (testsFromPos = getTests(pndx, getTestTemplate(pndx - 1).locator, pndx - 1).slice())[testsFromPos.length - 1].match.def && testsFromPos.pop(), 
                    (testTemplate = determineTestTemplate(testsFromPos)) && (testTemplate.match.def === opts.radixPointDefinitionSymbol || !isMask(pndx, !0) || $.inArray(opts.radixPoint, getBuffer()) < pndx && testTemplate.match.fn && testTemplate.match.fn.test(getPlaceholder(pndx), getMaskSet(), pndx, !1, opts)) && !1 !== (result = _isValid(pndx, getPlaceholder(pndx, testTemplate.match, !0) || (null == testTemplate.match.fn ? testTemplate.match.def : "" !== getPlaceholder(pndx) ? getPlaceholder(pndx) : getBuffer()[pndx]), !0)) && (getMaskSet().validPositions[result.pos || pndx].generatedInput = !0));
                }
                strict = !0 === strict;
                var maskPos = pos;
                pos.begin !== undefined && (maskPos = isRTL && !isSelection(pos) ? pos.end : pos.begin);
                var result = !0, positionsClone = $.extend(!0, {}, getMaskSet().validPositions);
                if ($.isFunction(opts.preValidation) && !strict && !0 !== fromSetValid && !0 !== validateOnly && (result = opts.preValidation(getBuffer(), maskPos, c, isSelection(pos), opts)), 
                !0 === result) {
                    if (fillMissingNonMask(maskPos), isSelection(pos) && (handleRemove(undefined, Inputmask.keyCode.DELETE, pos, !0, !0), 
                    maskPos = getMaskSet().p), maskPos < getMaskSet().maskLength && (maxLength === undefined || maskPos < maxLength) && (result = _isValid(maskPos, c, strict), 
                    (!strict || !0 === fromSetValid) && !1 === result && !0 !== validateOnly)) {
                        var currentPosValid = getMaskSet().validPositions[maskPos];
                        if (!currentPosValid || null !== currentPosValid.match.fn || currentPosValid.match.def !== c && c !== opts.skipOptionalPartCharacter) {
                            if ((opts.insertMode || getMaskSet().validPositions[seekNext(maskPos)] === undefined) && !isMask(maskPos, !0)) for (var nPos = maskPos + 1, snPos = seekNext(maskPos); nPos <= snPos; nPos++) if (!1 !== (result = _isValid(nPos, c, strict))) {
                                !function(originalPos, newPos) {
                                    var vp = getMaskSet().validPositions[newPos];
                                    if (vp) for (var targetLocator = vp.locator, tll = targetLocator.length, ps = originalPos; ps < newPos; ps++) if (getMaskSet().validPositions[ps] === undefined && !isMask(ps, !0)) {
                                        var tests = getTests(ps).slice(), bestMatch = determineTestTemplate(tests, !0), equality = -1;
                                        "" === tests[tests.length - 1].match.def && tests.pop(), $.each(tests, function(ndx, tst) {
                                            for (var i = 0; i < tll; i++) {
                                                if (tst.locator[i] === undefined || !checkAlternationMatch(tst.locator[i].toString().split(","), targetLocator[i].toString().split(","), tst.na)) {
                                                    var targetAI = targetLocator[i], bestMatchAI = bestMatch.locator[i], tstAI = tst.locator[i];
                                                    targetAI - bestMatchAI > Math.abs(targetAI - tstAI) && (bestMatch = tst);
                                                    break;
                                                }
                                                equality < i && (equality = i, bestMatch = tst);
                                            }
                                        }), (bestMatch = $.extend({}, bestMatch, {
                                            input: getPlaceholder(ps, bestMatch.match, !0) || bestMatch.match.def
                                        })).generatedInput = !0, setValidPosition(ps, bestMatch, !0), getMaskSet().validPositions[newPos] = undefined, 
                                        _isValid(newPos, vp.input, !0);
                                    }
                                }(maskPos, result.pos !== undefined ? result.pos : nPos), maskPos = nPos;
                                break;
                            }
                        } else result = {
                            caret: seekNext(maskPos)
                        };
                    }
                    !1 === result && opts.keepStatic && !strict && !0 !== fromAlternate && (result = function(pos, c, strict) {
                        var lastAlt, alternation, altPos, prevAltPos, i, validPos, altNdxs, decisionPos, validPsClone = $.extend(!0, {}, getMaskSet().validPositions), isValidRslt = !1, lAltPos = getLastValidPosition();
                        for (prevAltPos = getMaskSet().validPositions[lAltPos]; lAltPos >= 0; lAltPos--) if ((altPos = getMaskSet().validPositions[lAltPos]) && altPos.alternation !== undefined) {
                            if (lastAlt = lAltPos, alternation = getMaskSet().validPositions[lastAlt].alternation, 
                            prevAltPos.locator[altPos.alternation] !== altPos.locator[altPos.alternation]) break;
                            prevAltPos = altPos;
                        }
                        if (alternation !== undefined) {
                            decisionPos = parseInt(lastAlt);
                            var decisionTaker = prevAltPos.locator[prevAltPos.alternation || alternation] !== undefined ? prevAltPos.locator[prevAltPos.alternation || alternation] : altNdxs[0];
                            decisionTaker.length > 0 && (decisionTaker = decisionTaker.split(",")[0]);
                            var possibilityPos = getMaskSet().validPositions[decisionPos], prevPos = getMaskSet().validPositions[decisionPos - 1];
                            $.each(getTests(decisionPos, prevPos ? prevPos.locator : undefined, decisionPos - 1), function(ndx, test) {
                                altNdxs = test.locator[alternation] ? test.locator[alternation].toString().split(",") : [];
                                for (var mndx = 0; mndx < altNdxs.length; mndx++) {
                                    var validInputs = [], staticInputsBeforePos = 0, staticInputsBeforePosAlternate = 0, verifyValidInput = !1;
                                    if (decisionTaker < altNdxs[mndx] && (test.na === undefined || -1 === $.inArray(altNdxs[mndx], test.na.split(",")) || -1 === $.inArray(decisionTaker.toString(), altNdxs))) {
                                        getMaskSet().validPositions[decisionPos] = $.extend(!0, {}, test);
                                        var possibilities = getMaskSet().validPositions[decisionPos].locator;
                                        for (getMaskSet().validPositions[decisionPos].locator[alternation] = parseInt(altNdxs[mndx]), 
                                        null == test.match.fn ? (possibilityPos.input !== test.match.def && (verifyValidInput = !0, 
                                        !0 !== possibilityPos.generatedInput && validInputs.push(possibilityPos.input)), 
                                        staticInputsBeforePosAlternate++, getMaskSet().validPositions[decisionPos].generatedInput = !/[0-9a-bA-Z]/.test(test.match.def), 
                                        getMaskSet().validPositions[decisionPos].input = test.match.def) : getMaskSet().validPositions[decisionPos].input = possibilityPos.input, 
                                        i = decisionPos + 1; i < getLastValidPosition(undefined, !0) + 1; i++) (validPos = getMaskSet().validPositions[i]) && !0 !== validPos.generatedInput && /[0-9a-bA-Z]/.test(validPos.input) ? validInputs.push(validPos.input) : i < pos && staticInputsBeforePos++, 
                                        delete getMaskSet().validPositions[i];
                                        for (verifyValidInput && validInputs[0] === test.match.def && validInputs.shift(), 
                                        resetMaskSet(!0), isValidRslt = !0; validInputs.length > 0; ) {
                                            var input = validInputs.shift();
                                            if (input !== opts.skipOptionalPartCharacter && !(isValidRslt = isValid(getLastValidPosition(undefined, !0) + 1, input, !1, fromSetValid, !0))) break;
                                        }
                                        if (isValidRslt) {
                                            getMaskSet().validPositions[decisionPos].locator = possibilities;
                                            var targetLvp = getLastValidPosition(pos) + 1;
                                            for (i = decisionPos + 1; i < getLastValidPosition() + 1; i++) ((validPos = getMaskSet().validPositions[i]) === undefined || null == validPos.match.fn) && i < pos + (staticInputsBeforePosAlternate - staticInputsBeforePos) && staticInputsBeforePosAlternate++;
                                            isValidRslt = isValid((pos += staticInputsBeforePosAlternate - staticInputsBeforePos) > targetLvp ? targetLvp : pos, c, strict, fromSetValid, !0);
                                        }
                                        if (isValidRslt) return !1;
                                        resetMaskSet(), getMaskSet().validPositions = $.extend(!0, {}, validPsClone);
                                    }
                                }
                            });
                        }
                        return isValidRslt;
                    }(maskPos, c, strict)), !0 === result && (result = {
                        pos: maskPos
                    });
                }
                if ($.isFunction(opts.postValidation) && !1 !== result && !strict && !0 !== fromSetValid && !0 !== validateOnly) {
                    var postResult = opts.postValidation(getBuffer(!0), result, opts);
                    if (postResult.refreshFromBuffer && postResult.buffer) {
                        var refresh = postResult.refreshFromBuffer;
                        refreshFromBuffer(!0 === refresh ? refresh : refresh.start, refresh.end, postResult.buffer);
                    }
                    result = !0 === postResult ? result : postResult;
                }
                return result && result.pos === undefined && (result.pos = maskPos), !1 !== result && !0 !== validateOnly || (resetMaskSet(!0), 
                getMaskSet().validPositions = $.extend(!0, {}, positionsClone)), result;
            }
            function isMask(pos, strict) {
                var test = getTestTemplate(pos).match;
                if ("" === test.def && (test = getTest(pos).match), null != test.fn) return test.fn;
                if (!0 !== strict && pos > -1) {
                    var tests = getTests(pos);
                    return tests.length > 1 + ("" === tests[tests.length - 1].match.def ? 1 : 0);
                }
                return !1;
            }
            function seekNext(pos, newBlock) {
                var maskL = getMaskSet().maskLength;
                if (pos >= maskL) return maskL;
                var position = pos;
                for (getTests(maskL + 1).length > 1 && (getMaskTemplate(!0, maskL + 1, !0), maskL = getMaskSet().maskLength); ++position < maskL && (!0 === newBlock && (!0 !== getTest(position).match.newBlockMarker || !isMask(position)) || !0 !== newBlock && !isMask(position)); ) ;
                return position;
            }
            function seekPrevious(pos, newBlock) {
                var tests, position = pos;
                if (position <= 0) return 0;
                for (;--position > 0 && (!0 === newBlock && !0 !== getTest(position).match.newBlockMarker || !0 !== newBlock && !isMask(position) && ((tests = getTests(position)).length < 2 || 2 === tests.length && "" === tests[1].match.def)); ) ;
                return position;
            }
            function getBufferElement(position) {
                return getMaskSet().validPositions[position] === undefined ? getPlaceholder(position) : getMaskSet().validPositions[position].input;
            }
            function writeBuffer(input, buffer, caretPos, event, triggerInputEvent) {
                if (event && $.isFunction(opts.onBeforeWrite)) {
                    var result = opts.onBeforeWrite.call(inputmask, event, buffer, caretPos, opts);
                    if (result) {
                        if (result.refreshFromBuffer) {
                            var refresh = result.refreshFromBuffer;
                            refreshFromBuffer(!0 === refresh ? refresh : refresh.start, refresh.end, result.buffer || buffer), 
                            buffer = getBuffer(!0);
                        }
                        caretPos !== undefined && (caretPos = result.caret !== undefined ? result.caret : caretPos);
                    }
                }
                input !== undefined && (input.inputmask._valueSet(buffer.join("")), caretPos === undefined || event !== undefined && "blur" === event.type ? renderColorMask(input, caretPos, 0 === buffer.length) : android && event && "input" === event.type ? setTimeout(function() {
                    caret(input, caretPos);
                }, 0) : caret(input, caretPos), !0 === triggerInputEvent && (skipInputEvent = !0, 
                $(input).trigger("input")));
            }
            function getPlaceholder(pos, test, returnPL) {
                if ((test = test || getTest(pos).match).placeholder !== undefined || !0 === returnPL) return $.isFunction(test.placeholder) ? test.placeholder(opts) : test.placeholder;
                if (null === test.fn) {
                    if (pos > -1 && getMaskSet().validPositions[pos] === undefined) {
                        var prevTest, tests = getTests(pos), staticAlternations = [];
                        if (tests.length > 1 + ("" === tests[tests.length - 1].match.def ? 1 : 0)) for (var i = 0; i < tests.length; i++) if (!0 !== tests[i].match.optionality && !0 !== tests[i].match.optionalQuantifier && (null === tests[i].match.fn || prevTest === undefined || !1 !== tests[i].match.fn.test(prevTest.match.def, getMaskSet(), pos, !0, opts)) && (staticAlternations.push(tests[i]), 
                        null === tests[i].match.fn && (prevTest = tests[i]), staticAlternations.length > 1 && /[0-9a-bA-Z]/.test(staticAlternations[0].match.def))) return opts.placeholder.charAt(pos % opts.placeholder.length);
                    }
                    return test.def;
                }
                return opts.placeholder.charAt(pos % opts.placeholder.length);
            }
            function checkVal(input, writeOut, strict, nptvl, initiatingEvent) {
                function isTemplateMatch(ndx, charCodes) {
                    return -1 !== getBufferTemplate().slice(ndx, seekNext(ndx)).join("").indexOf(charCodes) && !isMask(ndx) && getTest(ndx).match.nativeDef === charCodes.charAt(charCodes.length - 1);
                }
                var inputValue = nptvl.slice(), charCodes = "", initialNdx = -1, result = undefined;
                if (resetMaskSet(), strict || !0 === opts.autoUnmask) initialNdx = seekNext(initialNdx); else {
                    var staticInput = getBufferTemplate().slice(0, seekNext(-1)).join(""), matches = inputValue.join("").match(new RegExp("^" + Inputmask.escapeRegex(staticInput), "g"));
                    matches && matches.length > 0 && (inputValue.splice(0, matches.length * staticInput.length), 
                    initialNdx = seekNext(initialNdx));
                }
                if (-1 === initialNdx ? (getMaskSet().p = seekNext(initialNdx), initialNdx = 0) : getMaskSet().p = initialNdx, 
                $.each(inputValue, function(ndx, charCode) {
                    if (charCode !== undefined) if (getMaskSet().validPositions[ndx] === undefined && inputValue[ndx] === getPlaceholder(ndx) && isMask(ndx, !0) && !1 === isValid(ndx, inputValue[ndx], !0, undefined, undefined, !0)) getMaskSet().p++; else {
                        var keypress = new $.Event("_checkval");
                        keypress.which = charCode.charCodeAt(0), charCodes += charCode;
                        var lvp = getLastValidPosition(undefined, !0), lvTest = getMaskSet().validPositions[lvp], nextTest = getTestTemplate(lvp + 1, lvTest ? lvTest.locator.slice() : undefined, lvp);
                        if (!isTemplateMatch(initialNdx, charCodes) || strict || opts.autoUnmask) {
                            var pos = strict ? ndx : null == nextTest.match.fn && nextTest.match.optionality && lvp + 1 < getMaskSet().p ? lvp + 1 : getMaskSet().p;
                            result = EventHandlers.keypressEvent.call(input, keypress, !0, !1, strict, pos), 
                            initialNdx = pos + 1, charCodes = "";
                        } else result = EventHandlers.keypressEvent.call(input, keypress, !0, !1, !0, lvp + 1);
                        if (!1 !== result && !strict && $.isFunction(opts.onBeforeWrite)) {
                            var origResult = result;
                            if (result = opts.onBeforeWrite.call(inputmask, keypress, getBuffer(), result.forwardPosition, opts), 
                            (result = $.extend(origResult, result)) && result.refreshFromBuffer) {
                                var refresh = result.refreshFromBuffer;
                                refreshFromBuffer(!0 === refresh ? refresh : refresh.start, refresh.end, result.buffer), 
                                resetMaskSet(!0), result.caret && (getMaskSet().p = result.caret, result.forwardPosition = result.caret);
                            }
                        }
                    }
                }), writeOut) {
                    var caretPos = undefined;
                    document.activeElement === input && result && (caretPos = opts.numericInput ? seekPrevious(result.forwardPosition) : result.forwardPosition), 
                    writeBuffer(input, getBuffer(), caretPos, initiatingEvent || new $.Event("checkval"), initiatingEvent && "input" === initiatingEvent.type);
                }
            }
            function unmaskedvalue(input) {
                if (input) {
                    if (input.inputmask === undefined) return input.value;
                    input.inputmask && input.inputmask.refreshValue && EventHandlers.setValueEvent.call(input);
                }
                var umValue = [], vps = getMaskSet().validPositions;
                for (var pndx in vps) vps[pndx].match && null != vps[pndx].match.fn && umValue.push(vps[pndx].input);
                var unmaskedValue = 0 === umValue.length ? "" : (isRTL ? umValue.reverse() : umValue).join("");
                if ($.isFunction(opts.onUnMask)) {
                    var bufferValue = (isRTL ? getBuffer().slice().reverse() : getBuffer()).join("");
                    unmaskedValue = opts.onUnMask.call(inputmask, bufferValue, unmaskedValue, opts);
                }
                return unmaskedValue;
            }
            function caret(input, begin, end, notranslate) {
                function translatePosition(pos) {
                    return !0 === notranslate || !isRTL || "number" != typeof pos || opts.greedy && "" === opts.placeholder || (pos = getBuffer().join("").length - pos), 
                    pos;
                }
                var range;
                if (begin === undefined) return input.setSelectionRange ? (begin = input.selectionStart, 
                end = input.selectionEnd) : window.getSelection ? (range = window.getSelection().getRangeAt(0)).commonAncestorContainer.parentNode !== input && range.commonAncestorContainer !== input || (begin = range.startOffset, 
                end = range.endOffset) : document.selection && document.selection.createRange && (end = (begin = 0 - (range = document.selection.createRange()).duplicate().moveStart("character", -input.inputmask._valueGet().length)) + range.text.length), 
                {
                    begin: translatePosition(begin),
                    end: translatePosition(end)
                };
                if (begin.begin !== undefined && (end = begin.end, begin = begin.begin), "number" == typeof begin) {
                    begin = translatePosition(begin), end = "number" == typeof (end = translatePosition(end)) ? end : begin;
                    var scrollCalc = parseInt(((input.ownerDocument.defaultView || window).getComputedStyle ? (input.ownerDocument.defaultView || window).getComputedStyle(input, null) : input.currentStyle).fontSize) * end;
                    if (input.scrollLeft = scrollCalc > input.scrollWidth ? scrollCalc : 0, mobile || !1 !== opts.insertMode || begin !== end || end++, 
                    input.setSelectionRange) input.selectionStart = begin, input.selectionEnd = end; else if (window.getSelection) {
                        if (range = document.createRange(), input.firstChild === undefined || null === input.firstChild) {
                            var textNode = document.createTextNode("");
                            input.appendChild(textNode);
                        }
                        range.setStart(input.firstChild, begin < input.inputmask._valueGet().length ? begin : input.inputmask._valueGet().length), 
                        range.setEnd(input.firstChild, end < input.inputmask._valueGet().length ? end : input.inputmask._valueGet().length), 
                        range.collapse(!0);
                        var sel = window.getSelection();
                        sel.removeAllRanges(), sel.addRange(range);
                    } else input.createTextRange && ((range = input.createTextRange()).collapse(!0), 
                    range.moveEnd("character", end), range.moveStart("character", begin), range.select());
                    renderColorMask(input, {
                        begin: begin,
                        end: end
                    });
                }
            }
            function determineLastRequiredPosition(returnDefinition) {
                var pos, testPos, buffer = getBuffer(), bl = buffer.length, lvp = getLastValidPosition(), positions = {}, lvTest = getMaskSet().validPositions[lvp], ndxIntlzr = lvTest !== undefined ? lvTest.locator.slice() : undefined;
                for (pos = lvp + 1; pos < buffer.length; pos++) ndxIntlzr = (testPos = getTestTemplate(pos, ndxIntlzr, pos - 1)).locator.slice(), 
                positions[pos] = $.extend(!0, {}, testPos);
                var lvTestAlt = lvTest && lvTest.alternation !== undefined ? lvTest.locator[lvTest.alternation] : undefined;
                for (pos = bl - 1; pos > lvp && (((testPos = positions[pos]).match.optionality || testPos.match.optionalQuantifier && testPos.match.newBlockMarker || lvTestAlt && (lvTestAlt !== positions[pos].locator[lvTest.alternation] && null != testPos.match.fn || null === testPos.match.fn && testPos.locator[lvTest.alternation] && checkAlternationMatch(testPos.locator[lvTest.alternation].toString().split(","), lvTestAlt.toString().split(",")) && "" !== getTests(pos)[0].def)) && buffer[pos] === getPlaceholder(pos, testPos.match)); pos--) bl--;
                return returnDefinition ? {
                    l: bl,
                    def: positions[bl] ? positions[bl].match : undefined
                } : bl;
            }
            function clearOptionalTail(buffer) {
                for (var validPos, rl = determineLastRequiredPosition(), bl = buffer.length, lv = getMaskSet().validPositions[getLastValidPosition()]; rl < bl && !isMask(rl, !0) && (validPos = lv !== undefined ? getTestTemplate(rl, lv.locator.slice(""), lv) : getTest(rl)) && !0 !== validPos.match.optionality && (!0 !== validPos.match.optionalQuantifier && !0 !== validPos.match.newBlockMarker || rl + 1 === bl && "" === (lv !== undefined ? getTestTemplate(rl + 1, lv.locator.slice(""), lv) : getTest(rl + 1)).match.def); ) rl++;
                for (;(validPos = getMaskSet().validPositions[rl - 1]) && validPos && validPos.match.optionality && validPos.input === opts.skipOptionalPartCharacter; ) rl--;
                return buffer.splice(rl), buffer;
            }
            function isComplete(buffer) {
                if ($.isFunction(opts.isComplete)) return opts.isComplete(buffer, opts);
                if ("*" === opts.repeat) return undefined;
                var complete = !1, lrp = determineLastRequiredPosition(!0), aml = seekPrevious(lrp.l);
                if (lrp.def === undefined || lrp.def.newBlockMarker || lrp.def.optionality || lrp.def.optionalQuantifier) {
                    complete = !0;
                    for (var i = 0; i <= aml; i++) {
                        var test = getTestTemplate(i).match;
                        if (null !== test.fn && getMaskSet().validPositions[i] === undefined && !0 !== test.optionality && !0 !== test.optionalQuantifier || null === test.fn && buffer[i] !== getPlaceholder(i, test)) {
                            complete = !1;
                            break;
                        }
                    }
                }
                return complete;
            }
            function handleRemove(input, k, pos, strict, fromIsValid) {
                if ((opts.numericInput || isRTL) && (k === Inputmask.keyCode.BACKSPACE ? k = Inputmask.keyCode.DELETE : k === Inputmask.keyCode.DELETE && (k = Inputmask.keyCode.BACKSPACE), 
                isRTL)) {
                    var pend = pos.end;
                    pos.end = pos.begin, pos.begin = pend;
                }
                k === Inputmask.keyCode.BACKSPACE && (pos.end - pos.begin < 1 || !1 === opts.insertMode) ? (pos.begin = seekPrevious(pos.begin), 
                getMaskSet().validPositions[pos.begin] !== undefined && getMaskSet().validPositions[pos.begin].input === opts.groupSeparator && pos.begin--) : k === Inputmask.keyCode.DELETE && pos.begin === pos.end && (pos.end = isMask(pos.end, !0) && getMaskSet().validPositions[pos.end] && getMaskSet().validPositions[pos.end].input !== opts.radixPoint ? pos.end + 1 : seekNext(pos.end) + 1, 
                getMaskSet().validPositions[pos.begin] !== undefined && getMaskSet().validPositions[pos.begin].input === opts.groupSeparator && pos.end++), 
                stripValidPositions(pos.begin, pos.end, !1, strict), !0 !== strict && function() {
                    if (opts.keepStatic) {
                        for (var validInputs = [], lastAlt = getLastValidPosition(-1, !0), positionsClone = $.extend(!0, {}, getMaskSet().validPositions), prevAltPos = getMaskSet().validPositions[lastAlt]; lastAlt >= 0; lastAlt--) {
                            var altPos = getMaskSet().validPositions[lastAlt];
                            if (altPos) {
                                if (!0 !== altPos.generatedInput && /[0-9a-bA-Z]/.test(altPos.input) && validInputs.push(altPos.input), 
                                delete getMaskSet().validPositions[lastAlt], altPos.alternation !== undefined && altPos.locator[altPos.alternation] !== prevAltPos.locator[altPos.alternation]) break;
                                prevAltPos = altPos;
                            }
                        }
                        if (lastAlt > -1) for (getMaskSet().p = seekNext(getLastValidPosition(-1, !0)); validInputs.length > 0; ) {
                            var keypress = new $.Event("keypress");
                            keypress.which = validInputs.pop().charCodeAt(0), EventHandlers.keypressEvent.call(input, keypress, !0, !1, !1, getMaskSet().p);
                        } else getMaskSet().validPositions = $.extend(!0, {}, positionsClone);
                    }
                }();
                var lvp = getLastValidPosition(pos.begin, !0);
                if (lvp < pos.begin) getMaskSet().p = seekNext(lvp); else if (!0 !== strict && (getMaskSet().p = pos.begin, 
                !0 !== fromIsValid)) for (;getMaskSet().p < lvp && getMaskSet().validPositions[getMaskSet().p] === undefined; ) getMaskSet().p++;
            }
            function initializeColorMask(input) {
                function findCaretPos(clientx) {
                    var caretPos, e = document.createElement("span");
                    for (var style in computedStyle) isNaN(style) && -1 !== style.indexOf("font") && (e.style[style] = computedStyle[style]);
                    e.style.textTransform = computedStyle.textTransform, e.style.letterSpacing = computedStyle.letterSpacing, 
                    e.style.position = "absolute", e.style.height = "auto", e.style.width = "auto", 
                    e.style.visibility = "hidden", e.style.whiteSpace = "nowrap", document.body.appendChild(e);
                    var itl, inputText = input.inputmask._valueGet(), previousWidth = 0;
                    for (caretPos = 0, itl = inputText.length; caretPos <= itl; caretPos++) {
                        if (e.innerHTML += inputText.charAt(caretPos) || "_", e.offsetWidth >= clientx) {
                            var offset1 = clientx - previousWidth, offset2 = e.offsetWidth - clientx;
                            e.innerHTML = inputText.charAt(caretPos), caretPos = (offset1 -= e.offsetWidth / 3) < offset2 ? caretPos - 1 : caretPos;
                            break;
                        }
                        previousWidth = e.offsetWidth;
                    }
                    return document.body.removeChild(e), caretPos;
                }
                var computedStyle = (input.ownerDocument.defaultView || window).getComputedStyle(input, null), template = document.createElement("div");
                template.style.width = computedStyle.width, template.style.textAlign = computedStyle.textAlign, 
                (colorMask = document.createElement("div")).className = "im-colormask", input.parentNode.insertBefore(colorMask, input), 
                input.parentNode.removeChild(input), colorMask.appendChild(template), colorMask.appendChild(input), 
                input.style.left = template.offsetLeft + "px", $(input).on("click", function(e) {
                    return caret(input, findCaretPos(e.clientX)), EventHandlers.clickEvent.call(input, [ e ]);
                }), $(input).on("keydown", function(e) {
                    e.shiftKey || !1 === opts.insertMode || setTimeout(function() {
                        renderColorMask(input);
                    }, 0);
                });
            }
            function renderColorMask(input, caretPos, clear) {
                function handleStatic() {
                    isStatic || null !== test.fn && testPos.input !== undefined ? isStatic && (null !== test.fn && testPos.input !== undefined || "" === test.def) && (isStatic = !1, 
                    maskTemplate += "</span>") : (isStatic = !0, maskTemplate += "<span class='im-static'>");
                }
                function handleCaret(force) {
                    !0 !== force && pos !== caretPos.begin || document.activeElement !== input || (maskTemplate += "<span class='im-caret' style='border-right-width: 1px;border-right-style: solid;'></span>");
                }
                var test, testPos, ndxIntlzr, maskTemplate = "", isStatic = !1, pos = 0;
                if (colorMask !== undefined) {
                    var buffer = getBuffer();
                    if (caretPos === undefined ? caretPos = caret(input) : caretPos.begin === undefined && (caretPos = {
                        begin: caretPos,
                        end: caretPos
                    }), !0 !== clear) {
                        var lvp = getLastValidPosition();
                        do {
                            handleCaret(), getMaskSet().validPositions[pos] ? (testPos = getMaskSet().validPositions[pos], 
                            test = testPos.match, ndxIntlzr = testPos.locator.slice(), handleStatic(), maskTemplate += buffer[pos]) : (testPos = getTestTemplate(pos, ndxIntlzr, pos - 1), 
                            test = testPos.match, ndxIntlzr = testPos.locator.slice(), (!1 === opts.jitMasking || pos < lvp || "number" == typeof opts.jitMasking && isFinite(opts.jitMasking) && opts.jitMasking > pos) && (handleStatic(), 
                            maskTemplate += getPlaceholder(pos, test))), pos++;
                        } while ((maxLength === undefined || pos < maxLength) && (null !== test.fn || "" !== test.def) || lvp > pos || isStatic);
                        -1 === maskTemplate.indexOf("im-caret") && handleCaret(!0), isStatic && handleStatic();
                    }
                    var template = colorMask.getElementsByTagName("div")[0];
                    template.innerHTML = maskTemplate, input.inputmask.positionColorMask(input, template);
                }
            }
            maskset = maskset || this.maskset, opts = opts || this.opts;
            var undoValue, $el, maxLength, colorMask, inputmask = this, el = this.el, isRTL = this.isRTL, skipKeyPressEvent = !1, skipInputEvent = !1, ignorable = !1, mouseEnter = !1, EventRuler = {
                on: function(input, eventName, eventHandler) {
                    var ev = function(e) {
                        if (this.inputmask === undefined && "FORM" !== this.nodeName) {
                            var imOpts = $.data(this, "_inputmask_opts");
                            imOpts ? new Inputmask(imOpts).mask(this) : EventRuler.off(this);
                        } else {
                            if ("setvalue" === e.type || "FORM" === this.nodeName || !(this.disabled || this.readOnly && !("keydown" === e.type && e.ctrlKey && 67 === e.keyCode || !1 === opts.tabThrough && e.keyCode === Inputmask.keyCode.TAB))) {
                                switch (e.type) {
                                  case "input":
                                    if (!0 === skipInputEvent) return skipInputEvent = !1, e.preventDefault();
                                    break;

                                  case "keydown":
                                    skipKeyPressEvent = !1, skipInputEvent = !1;
                                    break;

                                  case "keypress":
                                    if (!0 === skipKeyPressEvent) return e.preventDefault();
                                    skipKeyPressEvent = !0;
                                    break;

                                  case "click":
                                    if (iemobile || iphone) {
                                        var that = this, args = arguments;
                                        return setTimeout(function() {
                                            eventHandler.apply(that, args);
                                        }, 0), !1;
                                    }
                                }
                                var returnVal = eventHandler.apply(this, arguments);
                                return !1 === returnVal && (e.preventDefault(), e.stopPropagation()), returnVal;
                            }
                            e.preventDefault();
                        }
                    };
                    input.inputmask.events[eventName] = input.inputmask.events[eventName] || [], input.inputmask.events[eventName].push(ev), 
                    -1 !== $.inArray(eventName, [ "submit", "reset" ]) ? null !== input.form && $(input.form).on(eventName, ev) : $(input).on(eventName, ev);
                },
                off: function(input, event) {
                    if (input.inputmask && input.inputmask.events) {
                        var events;
                        event ? (events = [])[event] = input.inputmask.events[event] : events = input.inputmask.events, 
                        $.each(events, function(eventName, evArr) {
                            for (;evArr.length > 0; ) {
                                var ev = evArr.pop();
                                -1 !== $.inArray(eventName, [ "submit", "reset" ]) ? null !== input.form && $(input.form).off(eventName, ev) : $(input).off(eventName, ev);
                            }
                            delete input.inputmask.events[eventName];
                        });
                    }
                }
            }, EventHandlers = {
                keydownEvent: function(e) {
                    var input = this, $input = $(input), k = e.keyCode, pos = caret(input);
                    if (k === Inputmask.keyCode.BACKSPACE || k === Inputmask.keyCode.DELETE || iphone && k === Inputmask.keyCode.BACKSPACE_SAFARI || e.ctrlKey && k === Inputmask.keyCode.X && !function(eventName) {
                        var el = document.createElement("input"), evName = "on" + eventName, isSupported = evName in el;
                        return isSupported || (el.setAttribute(evName, "return;"), isSupported = "function" == typeof el[evName]), 
                        el = null, isSupported;
                    }("cut")) e.preventDefault(), handleRemove(input, k, pos), writeBuffer(input, getBuffer(!0), getMaskSet().p, e, input.inputmask._valueGet() !== getBuffer().join("")), 
                    input.inputmask._valueGet() === getBufferTemplate().join("") ? $input.trigger("cleared") : !0 === isComplete(getBuffer()) && $input.trigger("complete"); else if (k === Inputmask.keyCode.END || k === Inputmask.keyCode.PAGE_DOWN) {
                        e.preventDefault();
                        var caretPos = seekNext(getLastValidPosition());
                        opts.insertMode || caretPos !== getMaskSet().maskLength || e.shiftKey || caretPos--, 
                        caret(input, e.shiftKey ? pos.begin : caretPos, caretPos, !0);
                    } else k === Inputmask.keyCode.HOME && !e.shiftKey || k === Inputmask.keyCode.PAGE_UP ? (e.preventDefault(), 
                    caret(input, 0, e.shiftKey ? pos.begin : 0, !0)) : (opts.undoOnEscape && k === Inputmask.keyCode.ESCAPE || 90 === k && e.ctrlKey) && !0 !== e.altKey ? (checkVal(input, !0, !1, undoValue.split("")), 
                    $input.trigger("click")) : k !== Inputmask.keyCode.INSERT || e.shiftKey || e.ctrlKey ? !0 === opts.tabThrough && k === Inputmask.keyCode.TAB ? (!0 === e.shiftKey ? (null === getTest(pos.begin).match.fn && (pos.begin = seekNext(pos.begin)), 
                    pos.end = seekPrevious(pos.begin, !0), pos.begin = seekPrevious(pos.end, !0)) : (pos.begin = seekNext(pos.begin, !0), 
                    pos.end = seekNext(pos.begin, !0), pos.end < getMaskSet().maskLength && pos.end--), 
                    pos.begin < getMaskSet().maskLength && (e.preventDefault(), caret(input, pos.begin, pos.end))) : e.shiftKey || !1 === opts.insertMode && (k === Inputmask.keyCode.RIGHT ? setTimeout(function() {
                        var caretPos = caret(input);
                        caret(input, caretPos.begin);
                    }, 0) : k === Inputmask.keyCode.LEFT && setTimeout(function() {
                        var caretPos = caret(input);
                        caret(input, isRTL ? caretPos.begin + 1 : caretPos.begin - 1);
                    }, 0)) : (opts.insertMode = !opts.insertMode, caret(input, opts.insertMode || pos.begin !== getMaskSet().maskLength ? pos.begin : pos.begin - 1));
                    opts.onKeyDown.call(this, e, getBuffer(), caret(input).begin, opts), ignorable = -1 !== $.inArray(k, opts.ignorables);
                },
                keypressEvent: function(e, checkval, writeOut, strict, ndx) {
                    var input = this, $input = $(input), k = e.which || e.charCode || e.keyCode;
                    if (!(!0 === checkval || e.ctrlKey && e.altKey) && (e.ctrlKey || e.metaKey || ignorable)) return k === Inputmask.keyCode.ENTER && undoValue !== getBuffer().join("") && (undoValue = getBuffer().join(""), 
                    setTimeout(function() {
                        $input.trigger("change");
                    }, 0)), !0;
                    if (k) {
                        46 === k && !1 === e.shiftKey && "" !== opts.radixPoint && (k = opts.radixPoint.charCodeAt(0));
                        var forwardPosition, pos = checkval ? {
                            begin: ndx,
                            end: ndx
                        } : caret(input), c = String.fromCharCode(k);
                        getMaskSet().writeOutBuffer = !0;
                        var valResult = isValid(pos, c, strict);
                        if (!1 !== valResult && (resetMaskSet(!0), forwardPosition = valResult.caret !== undefined ? valResult.caret : checkval ? valResult.pos + 1 : seekNext(valResult.pos), 
                        getMaskSet().p = forwardPosition), !1 !== writeOut && (setTimeout(function() {
                            opts.onKeyValidation.call(input, k, valResult, opts);
                        }, 0), getMaskSet().writeOutBuffer && !1 !== valResult)) {
                            var buffer = getBuffer();
                            writeBuffer(input, buffer, opts.numericInput && valResult.caret === undefined ? seekPrevious(forwardPosition) : forwardPosition, e, !0 !== checkval), 
                            !0 !== checkval && setTimeout(function() {
                                !0 === isComplete(buffer) && $input.trigger("complete");
                            }, 0);
                        }
                        if (e.preventDefault(), checkval) return !1 !== valResult && (valResult.forwardPosition = forwardPosition), 
                        valResult;
                    }
                },
                pasteEvent: function(e) {
                    var tempValue, input = this, ev = e.originalEvent || e, $input = $(input), inputValue = input.inputmask._valueGet(!0), caretPos = caret(input);
                    isRTL && (tempValue = caretPos.end, caretPos.end = caretPos.begin, caretPos.begin = tempValue);
                    var valueBeforeCaret = inputValue.substr(0, caretPos.begin), valueAfterCaret = inputValue.substr(caretPos.end, inputValue.length);
                    if (valueBeforeCaret === (isRTL ? getBufferTemplate().reverse() : getBufferTemplate()).slice(0, caretPos.begin).join("") && (valueBeforeCaret = ""), 
                    valueAfterCaret === (isRTL ? getBufferTemplate().reverse() : getBufferTemplate()).slice(caretPos.end).join("") && (valueAfterCaret = ""), 
                    isRTL && (tempValue = valueBeforeCaret, valueBeforeCaret = valueAfterCaret, valueAfterCaret = tempValue), 
                    window.clipboardData && window.clipboardData.getData) inputValue = valueBeforeCaret + window.clipboardData.getData("Text") + valueAfterCaret; else {
                        if (!ev.clipboardData || !ev.clipboardData.getData) return !0;
                        inputValue = valueBeforeCaret + ev.clipboardData.getData("text/plain") + valueAfterCaret;
                    }
                    var pasteValue = inputValue;
                    if ($.isFunction(opts.onBeforePaste)) {
                        if (!1 === (pasteValue = opts.onBeforePaste.call(inputmask, inputValue, opts))) return e.preventDefault();
                        pasteValue || (pasteValue = inputValue);
                    }
                    return checkVal(input, !1, !1, isRTL ? pasteValue.split("").reverse() : pasteValue.toString().split("")), 
                    writeBuffer(input, getBuffer(), seekNext(getLastValidPosition()), e, undoValue !== getBuffer().join("")), 
                    !0 === isComplete(getBuffer()) && $input.trigger("complete"), e.preventDefault();
                },
                inputFallBackEvent: function(e) {
                    var input = this, inputValue = input.inputmask._valueGet();
                    if (getBuffer().join("") !== inputValue) {
                        var caretPos = caret(input);
                        if (!1 === function(input, inputValue, caretPos) {
                            if ("." === inputValue.charAt(caretPos.begin - 1) && "" !== opts.radixPoint && ((inputValue = inputValue.split(""))[caretPos.begin - 1] = opts.radixPoint.charAt(0), 
                            inputValue = inputValue.join("")), inputValue.charAt(caretPos.begin - 1) === opts.radixPoint && inputValue.length > getBuffer().length) {
                                var keypress = new $.Event("keypress");
                                return keypress.which = opts.radixPoint.charCodeAt(0), EventHandlers.keypressEvent.call(input, keypress, !0, !0, !1, caretPos.begin - 1), 
                                !1;
                            }
                        }(input, inputValue, caretPos)) return !1;
                        if (inputValue = inputValue.replace(new RegExp("(" + Inputmask.escapeRegex(getBufferTemplate().join("")) + ")*"), ""), 
                        !1 === function(input, inputValue, caretPos) {
                            if (iemobile) {
                                var inputChar = inputValue.replace(getBuffer().join(""), "");
                                if (1 === inputChar.length) {
                                    var keypress = new $.Event("keypress");
                                    return keypress.which = inputChar.charCodeAt(0), EventHandlers.keypressEvent.call(input, keypress, !0, !0, !1, getMaskSet().validPositions[caretPos.begin - 1] ? caretPos.begin : caretPos.begin - 1), 
                                    !1;
                                }
                            }
                        }(input, inputValue, caretPos)) return !1;
                        caretPos.begin > inputValue.length && (caret(input, inputValue.length), caretPos = caret(input));
                        var buffer = getBuffer().join(""), frontPart = inputValue.substr(0, caretPos.begin), backPart = inputValue.substr(caretPos.begin), frontBufferPart = buffer.substr(0, caretPos.begin), backBufferPart = buffer.substr(caretPos.begin), selection = caretPos, entries = "", isEntry = !1;
                        if (frontPart !== frontBufferPart) {
                            selection.begin = 0;
                            for (var fpl = (isEntry = frontPart.length >= frontBufferPart.length) ? frontPart.length : frontBufferPart.length, i = 0; frontPart.charAt(i) === frontBufferPart.charAt(i) && i < fpl; i++) selection.begin++;
                            isEntry && (entries += frontPart.slice(selection.begin, selection.end));
                        }
                        backPart !== backBufferPart && (backPart.length > backBufferPart.length ? isEntry && (selection.end = selection.begin) : backPart.length < backBufferPart.length ? selection.end += backBufferPart.length - backPart.length : backPart.charAt(0) !== backBufferPart.charAt(0) && selection.end++), 
                        writeBuffer(input, getBuffer(), selection), entries.length > 0 ? $.each(entries.split(""), function(ndx, entry) {
                            var keypress = new $.Event("keypress");
                            keypress.which = entry.charCodeAt(0), ignorable = !1, EventHandlers.keypressEvent.call(input, keypress);
                        }) : (selection.begin === selection.end - 1 && caret(input, seekPrevious(selection.begin + 1), selection.end), 
                        e.keyCode = Inputmask.keyCode.DELETE, EventHandlers.keydownEvent.call(input, e)), 
                        e.preventDefault();
                    }
                },
                setValueEvent: function(e) {
                    this.inputmask.refreshValue = !1;
                    var input = this, value = input.inputmask._valueGet(!0);
                    $.isFunction(opts.onBeforeMask) && (value = opts.onBeforeMask.call(inputmask, value, opts) || value), 
                    value = value.split(""), checkVal(input, !0, !1, isRTL ? value.reverse() : value), 
                    undoValue = getBuffer().join(""), (opts.clearMaskOnLostFocus || opts.clearIncomplete) && input.inputmask._valueGet() === getBufferTemplate().join("") && input.inputmask._valueSet("");
                },
                focusEvent: function(e) {
                    var input = this, nptValue = input.inputmask._valueGet();
                    opts.showMaskOnFocus && (!opts.showMaskOnHover || opts.showMaskOnHover && "" === nptValue) && (input.inputmask._valueGet() !== getBuffer().join("") ? writeBuffer(input, getBuffer(), seekNext(getLastValidPosition())) : !1 === mouseEnter && caret(input, seekNext(getLastValidPosition()))), 
                    !0 === opts.positionCaretOnTab && !1 === mouseEnter && "" !== nptValue && (writeBuffer(input, getBuffer(), caret(input)), 
                    EventHandlers.clickEvent.apply(input, [ e, !0 ])), undoValue = getBuffer().join("");
                },
                mouseleaveEvent: function(e) {
                    var input = this;
                    if (mouseEnter = !1, opts.clearMaskOnLostFocus && document.activeElement !== input) {
                        var buffer = getBuffer().slice(), nptValue = input.inputmask._valueGet();
                        nptValue !== input.getAttribute("placeholder") && "" !== nptValue && (-1 === getLastValidPosition() && nptValue === getBufferTemplate().join("") ? buffer = [] : clearOptionalTail(buffer), 
                        writeBuffer(input, buffer));
                    }
                },
                clickEvent: function(e, tabbed) {
                    function doRadixFocus(clickPos) {
                        if ("" !== opts.radixPoint) {
                            var vps = getMaskSet().validPositions;
                            if (vps[clickPos] === undefined || vps[clickPos].input === getPlaceholder(clickPos)) {
                                if (clickPos < seekNext(-1)) return !0;
                                var radixPos = $.inArray(opts.radixPoint, getBuffer());
                                if (-1 !== radixPos) {
                                    for (var vp in vps) if (radixPos < vp && vps[vp].input !== getPlaceholder(vp)) return !1;
                                    return !0;
                                }
                            }
                        }
                        return !1;
                    }
                    var input = this;
                    setTimeout(function() {
                        if (document.activeElement === input) {
                            var selectedCaret = caret(input);
                            if (tabbed && (isRTL ? selectedCaret.end = selectedCaret.begin : selectedCaret.begin = selectedCaret.end), 
                            selectedCaret.begin === selectedCaret.end) switch (opts.positionCaretOnClick) {
                              case "none":
                                break;

                              case "radixFocus":
                                if (doRadixFocus(selectedCaret.begin)) {
                                    var radixPos = getBuffer().join("").indexOf(opts.radixPoint);
                                    caret(input, opts.numericInput ? seekNext(radixPos) : radixPos);
                                    break;
                                }

                              default:
                                var clickPosition = selectedCaret.begin, lvclickPosition = getLastValidPosition(clickPosition, !0), lastPosition = seekNext(lvclickPosition);
                                if (clickPosition < lastPosition) caret(input, isMask(clickPosition, !0) || isMask(clickPosition - 1, !0) ? clickPosition : seekNext(clickPosition)); else {
                                    var lvp = getMaskSet().validPositions[lvclickPosition], tt = getTestTemplate(lastPosition, lvp ? lvp.match.locator : undefined, lvp), placeholder = getPlaceholder(lastPosition, tt.match);
                                    if ("" !== placeholder && getBuffer()[lastPosition] !== placeholder && !0 !== tt.match.optionalQuantifier && !0 !== tt.match.newBlockMarker || !isMask(lastPosition, !0) && tt.match.def === placeholder) {
                                        var newPos = seekNext(lastPosition);
                                        (clickPosition >= newPos || clickPosition === lastPosition) && (lastPosition = newPos);
                                    }
                                    caret(input, lastPosition);
                                }
                            }
                        }
                    }, 0);
                },
                dblclickEvent: function(e) {
                    var input = this;
                    setTimeout(function() {
                        caret(input, 0, seekNext(getLastValidPosition()));
                    }, 0);
                },
                cutEvent: function(e) {
                    var input = this, $input = $(input), pos = caret(input), ev = e.originalEvent || e, clipboardData = window.clipboardData || ev.clipboardData, clipData = isRTL ? getBuffer().slice(pos.end, pos.begin) : getBuffer().slice(pos.begin, pos.end);
                    clipboardData.setData("text", isRTL ? clipData.reverse().join("") : clipData.join("")), 
                    document.execCommand && document.execCommand("copy"), handleRemove(input, Inputmask.keyCode.DELETE, pos), 
                    writeBuffer(input, getBuffer(), getMaskSet().p, e, undoValue !== getBuffer().join("")), 
                    input.inputmask._valueGet() === getBufferTemplate().join("") && $input.trigger("cleared");
                },
                blurEvent: function(e) {
                    var $input = $(this), input = this;
                    if (input.inputmask) {
                        var nptValue = input.inputmask._valueGet(), buffer = getBuffer().slice();
                        "" !== nptValue && (opts.clearMaskOnLostFocus && (-1 === getLastValidPosition() && nptValue === getBufferTemplate().join("") ? buffer = [] : clearOptionalTail(buffer)), 
                        !1 === isComplete(buffer) && (setTimeout(function() {
                            $input.trigger("incomplete");
                        }, 0), opts.clearIncomplete && (resetMaskSet(), buffer = opts.clearMaskOnLostFocus ? [] : getBufferTemplate().slice())), 
                        writeBuffer(input, buffer, undefined, e)), undoValue !== getBuffer().join("") && (undoValue = buffer.join(""), 
                        $input.trigger("change"));
                    }
                },
                mouseenterEvent: function(e) {
                    var input = this;
                    mouseEnter = !0, document.activeElement !== input && opts.showMaskOnHover && input.inputmask._valueGet() !== getBuffer().join("") && writeBuffer(input, getBuffer());
                },
                submitEvent: function(e) {
                    undoValue !== getBuffer().join("") && $el.trigger("change"), opts.clearMaskOnLostFocus && -1 === getLastValidPosition() && el.inputmask._valueGet && el.inputmask._valueGet() === getBufferTemplate().join("") && el.inputmask._valueSet(""), 
                    opts.removeMaskOnSubmit && (el.inputmask._valueSet(el.inputmask.unmaskedvalue(), !0), 
                    setTimeout(function() {
                        writeBuffer(el, getBuffer());
                    }, 0));
                },
                resetEvent: function(e) {
                    el.inputmask.refreshValue = !0, setTimeout(function() {
                        $el.trigger("setvalue");
                    }, 0);
                }
            };
            Inputmask.prototype.positionColorMask = function(input, template) {
                input.style.left = template.offsetLeft + "px";
            };
            var valueBuffer;
            if (actionObj !== undefined) switch (actionObj.action) {
              case "isComplete":
                return el = actionObj.el, isComplete(getBuffer());

              case "unmaskedvalue":
                return el !== undefined && actionObj.value === undefined || (valueBuffer = actionObj.value, 
                valueBuffer = ($.isFunction(opts.onBeforeMask) ? opts.onBeforeMask.call(inputmask, valueBuffer, opts) || valueBuffer : valueBuffer).split(""), 
                checkVal(undefined, !1, !1, isRTL ? valueBuffer.reverse() : valueBuffer), $.isFunction(opts.onBeforeWrite) && opts.onBeforeWrite.call(inputmask, undefined, getBuffer(), 0, opts)), 
                unmaskedvalue(el);

              case "mask":
                !function(elem) {
                    EventRuler.off(elem);
                    var isSupported = function(input, opts) {
                        var elementType = input.getAttribute("type"), isSupported = "INPUT" === input.tagName && -1 !== $.inArray(elementType, opts.supportsInputType) || input.isContentEditable || "TEXTAREA" === input.tagName;
                        if (!isSupported) if ("INPUT" === input.tagName) {
                            var el = document.createElement("input");
                            el.setAttribute("type", elementType), isSupported = "text" === el.type, el = null;
                        } else isSupported = "partial";
                        return !1 !== isSupported ? function(npt) {
                            function getter() {
                                return this.inputmask ? this.inputmask.opts.autoUnmask ? this.inputmask.unmaskedvalue() : -1 !== getLastValidPosition() || !0 !== opts.nullable ? document.activeElement === this && opts.clearMaskOnLostFocus ? (isRTL ? clearOptionalTail(getBuffer().slice()).reverse() : clearOptionalTail(getBuffer().slice())).join("") : valueGet.call(this) : "" : valueGet.call(this);
                            }
                            function setter(value) {
                                valueSet.call(this, value), this.inputmask && $(this).trigger("setvalue");
                            }
                            var valueGet, valueSet;
                            if (!npt.inputmask.__valueGet) {
                                if (!0 !== opts.noValuePatching) {
                                    if (Object.getOwnPropertyDescriptor) {
                                        "function" != typeof Object.getPrototypeOf && (Object.getPrototypeOf = "object" === _typeof("test".__proto__) ? function(object) {
                                            return object.__proto__;
                                        } : function(object) {
                                            return object.constructor.prototype;
                                        });
                                        var valueProperty = Object.getPrototypeOf ? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(npt), "value") : undefined;
                                        valueProperty && valueProperty.get && valueProperty.set ? (valueGet = valueProperty.get, 
                                        valueSet = valueProperty.set, Object.defineProperty(npt, "value", {
                                            get: getter,
                                            set: setter,
                                            configurable: !0
                                        })) : "INPUT" !== npt.tagName && (valueGet = function() {
                                            return this.textContent;
                                        }, valueSet = function(value) {
                                            this.textContent = value;
                                        }, Object.defineProperty(npt, "value", {
                                            get: getter,
                                            set: setter,
                                            configurable: !0
                                        }));
                                    } else document.__lookupGetter__ && npt.__lookupGetter__("value") && (valueGet = npt.__lookupGetter__("value"), 
                                    valueSet = npt.__lookupSetter__("value"), npt.__defineGetter__("value", getter), 
                                    npt.__defineSetter__("value", setter));
                                    npt.inputmask.__valueGet = valueGet, npt.inputmask.__valueSet = valueSet;
                                }
                                npt.inputmask._valueGet = function(overruleRTL) {
                                    return isRTL && !0 !== overruleRTL ? valueGet.call(this.el).split("").reverse().join("") : valueGet.call(this.el);
                                }, npt.inputmask._valueSet = function(value, overruleRTL) {
                                    valueSet.call(this.el, null === value || value === undefined ? "" : !0 !== overruleRTL && isRTL ? value.split("").reverse().join("") : value);
                                }, valueGet === undefined && (valueGet = function() {
                                    return this.value;
                                }, valueSet = function(value) {
                                    this.value = value;
                                }, function(type) {
                                    if ($.valHooks && ($.valHooks[type] === undefined || !0 !== $.valHooks[type].inputmaskpatch)) {
                                        var valhookGet = $.valHooks[type] && $.valHooks[type].get ? $.valHooks[type].get : function(elem) {
                                            return elem.value;
                                        }, valhookSet = $.valHooks[type] && $.valHooks[type].set ? $.valHooks[type].set : function(elem, value) {
                                            return elem.value = value, elem;
                                        };
                                        $.valHooks[type] = {
                                            get: function(elem) {
                                                if (elem.inputmask) {
                                                    if (elem.inputmask.opts.autoUnmask) return elem.inputmask.unmaskedvalue();
                                                    var result = valhookGet(elem);
                                                    return -1 !== getLastValidPosition(undefined, undefined, elem.inputmask.maskset.validPositions) || !0 !== opts.nullable ? result : "";
                                                }
                                                return valhookGet(elem);
                                            },
                                            set: function(elem, value) {
                                                var result, $elem = $(elem);
                                                return result = valhookSet(elem, value), elem.inputmask && $elem.trigger("setvalue"), 
                                                result;
                                            },
                                            inputmaskpatch: !0
                                        };
                                    }
                                }(npt.type), function(npt) {
                                    EventRuler.on(npt, "mouseenter", function(event) {
                                        var $input = $(this);
                                        this.inputmask._valueGet() !== getBuffer().join("") && $input.trigger("setvalue");
                                    });
                                }(npt));
                            }
                        }(input) : input.inputmask = undefined, isSupported;
                    }(elem, opts);
                    if (!1 !== isSupported && (el = elem, $el = $(el), -1 === (maxLength = el !== undefined ? el.maxLength : undefined) && (maxLength = undefined), 
                    !0 === opts.colorMask && initializeColorMask(el), android && (el.hasOwnProperty("inputmode") && (el.inputmode = opts.inputmode, 
                    el.setAttribute("inputmode", opts.inputmode)), "rtfm" === opts.androidHack && (!0 !== opts.colorMask && initializeColorMask(el), 
                    el.type = "password")), !0 === isSupported && (EventRuler.on(el, "submit", EventHandlers.submitEvent), 
                    EventRuler.on(el, "reset", EventHandlers.resetEvent), EventRuler.on(el, "mouseenter", EventHandlers.mouseenterEvent), 
                    EventRuler.on(el, "blur", EventHandlers.blurEvent), EventRuler.on(el, "focus", EventHandlers.focusEvent), 
                    EventRuler.on(el, "mouseleave", EventHandlers.mouseleaveEvent), !0 !== opts.colorMask && EventRuler.on(el, "click", EventHandlers.clickEvent), 
                    EventRuler.on(el, "dblclick", EventHandlers.dblclickEvent), EventRuler.on(el, "paste", EventHandlers.pasteEvent), 
                    EventRuler.on(el, "dragdrop", EventHandlers.pasteEvent), EventRuler.on(el, "drop", EventHandlers.pasteEvent), 
                    EventRuler.on(el, "cut", EventHandlers.cutEvent), EventRuler.on(el, "complete", opts.oncomplete), 
                    EventRuler.on(el, "incomplete", opts.onincomplete), EventRuler.on(el, "cleared", opts.oncleared), 
                    android || !0 === opts.inputEventOnly ? el.removeAttribute("maxLength") : (EventRuler.on(el, "keydown", EventHandlers.keydownEvent), 
                    EventRuler.on(el, "keypress", EventHandlers.keypressEvent)), EventRuler.on(el, "compositionstart", $.noop), 
                    EventRuler.on(el, "compositionupdate", $.noop), EventRuler.on(el, "compositionend", $.noop), 
                    EventRuler.on(el, "keyup", $.noop), EventRuler.on(el, "input", EventHandlers.inputFallBackEvent), 
                    EventRuler.on(el, "beforeinput", $.noop)), EventRuler.on(el, "setvalue", EventHandlers.setValueEvent), 
                    undoValue = getBufferTemplate().join(""), "" !== el.inputmask._valueGet(!0) || !1 === opts.clearMaskOnLostFocus || document.activeElement === el)) {
                        var initialValue = $.isFunction(opts.onBeforeMask) ? opts.onBeforeMask.call(inputmask, el.inputmask._valueGet(!0), opts) || el.inputmask._valueGet(!0) : el.inputmask._valueGet(!0);
                        "" !== initialValue && checkVal(el, !0, !1, isRTL ? initialValue.split("").reverse() : initialValue.split(""));
                        var buffer = getBuffer().slice();
                        undoValue = buffer.join(""), !1 === isComplete(buffer) && opts.clearIncomplete && resetMaskSet(), 
                        opts.clearMaskOnLostFocus && document.activeElement !== el && (-1 === getLastValidPosition() ? buffer = [] : clearOptionalTail(buffer)), 
                        writeBuffer(el, buffer), document.activeElement === el && caret(el, seekNext(getLastValidPosition()));
                    }
                }(el);
                break;

              case "format":
                return valueBuffer = ($.isFunction(opts.onBeforeMask) ? opts.onBeforeMask.call(inputmask, actionObj.value, opts) || actionObj.value : actionObj.value).split(""), 
                checkVal(undefined, !0, !1, isRTL ? valueBuffer.reverse() : valueBuffer), actionObj.metadata ? {
                    value: isRTL ? getBuffer().slice().reverse().join("") : getBuffer().join(""),
                    metadata: maskScope.call(this, {
                        action: "getmetadata"
                    }, maskset, opts)
                } : isRTL ? getBuffer().slice().reverse().join("") : getBuffer().join("");

              case "isValid":
                actionObj.value ? (valueBuffer = actionObj.value.split(""), checkVal(undefined, !0, !0, isRTL ? valueBuffer.reverse() : valueBuffer)) : actionObj.value = getBuffer().join("");
                for (var buffer = getBuffer(), rl = determineLastRequiredPosition(), lmib = buffer.length - 1; lmib > rl && !isMask(lmib); lmib--) ;
                return buffer.splice(rl, lmib + 1 - rl), isComplete(buffer) && actionObj.value === getBuffer().join("");

              case "getemptymask":
                return getBufferTemplate().join("");

              case "remove":
                if (el && el.inputmask) {
                    $el = $(el), el.inputmask._valueSet(opts.autoUnmask ? unmaskedvalue(el) : el.inputmask._valueGet(!0)), 
                    EventRuler.off(el);
                    Object.getOwnPropertyDescriptor && Object.getPrototypeOf ? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value") && el.inputmask.__valueGet && Object.defineProperty(el, "value", {
                        get: el.inputmask.__valueGet,
                        set: el.inputmask.__valueSet,
                        configurable: !0
                    }) : document.__lookupGetter__ && el.__lookupGetter__("value") && el.inputmask.__valueGet && (el.__defineGetter__("value", el.inputmask.__valueGet), 
                    el.__defineSetter__("value", el.inputmask.__valueSet)), el.inputmask = undefined;
                }
                return el;

              case "getmetadata":
                if ($.isArray(maskset.metadata)) {
                    var maskTarget = getMaskTemplate(!0, 0, !1).join("");
                    return $.each(maskset.metadata, function(ndx, mtdt) {
                        if (mtdt.mask === maskTarget) return maskTarget = mtdt, !1;
                    }), maskTarget;
                }
                return maskset.metadata;
            }
        }
        var ua = navigator.userAgent, mobile = /mobile/i.test(ua), iemobile = /iemobile/i.test(ua), iphone = /iphone/i.test(ua) && !iemobile, android = /android/i.test(ua) && !iemobile;
        return Inputmask.prototype = {
            dataAttribute: "data-inputmask",
            defaults: {
                placeholder: "_",
                optionalmarker: {
                    start: "[",
                    end: "]"
                },
                quantifiermarker: {
                    start: "{",
                    end: "}"
                },
                groupmarker: {
                    start: "(",
                    end: ")"
                },
                alternatormarker: "|",
                escapeChar: "\\",
                mask: null,
                regex: null,
                oncomplete: $.noop,
                onincomplete: $.noop,
                oncleared: $.noop,
                repeat: 0,
                greedy: !0,
                autoUnmask: !1,
                removeMaskOnSubmit: !1,
                clearMaskOnLostFocus: !0,
                insertMode: !0,
                clearIncomplete: !1,
                alias: null,
                onKeyDown: $.noop,
                onBeforeMask: null,
                onBeforePaste: function(pastedValue, opts) {
                    return $.isFunction(opts.onBeforeMask) ? opts.onBeforeMask.call(this, pastedValue, opts) : pastedValue;
                },
                onBeforeWrite: null,
                onUnMask: null,
                showMaskOnFocus: !0,
                showMaskOnHover: !0,
                onKeyValidation: $.noop,
                skipOptionalPartCharacter: " ",
                numericInput: !1,
                rightAlign: !1,
                undoOnEscape: !0,
                radixPoint: "",
                radixPointDefinitionSymbol: undefined,
                groupSeparator: "",
                keepStatic: null,
                positionCaretOnTab: !0,
                tabThrough: !1,
                supportsInputType: [ "text", "tel", "password" ],
                ignorables: [ 8, 9, 13, 19, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 93, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 0, 229 ],
                isComplete: null,
                canClearPosition: $.noop,
                preValidation: null,
                postValidation: null,
                staticDefinitionSymbol: undefined,
                jitMasking: !1,
                nullable: !0,
                inputEventOnly: !1,
                noValuePatching: !1,
                positionCaretOnClick: "lvp",
                casing: null,
                inputmode: "verbatim",
                colorMask: !1,
                androidHack: !1,
                importDataAttributes: !0
            },
            definitions: {
                "9": {
                    validator: "[0-9１-９]",
                    cardinality: 1,
                    definitionSymbol: "*"
                },
                a: {
                    validator: "[A-Za-zА-яЁёÀ-ÿµ]",
                    cardinality: 1,
                    definitionSymbol: "*"
                },
                "*": {
                    validator: "[0-9１-９A-Za-zА-яЁёÀ-ÿµ]",
                    cardinality: 1
                }
            },
            aliases: {},
            masksCache: {},
            mask: function(elems) {
                function importAttributeOptions(npt, opts, userOptions, dataAttribute) {
                    if (!0 === opts.importDataAttributes) {
                        var option, dataoptions, optionData, p, importOption = function(option, optionData) {
                            null !== (optionData = optionData !== undefined ? optionData : npt.getAttribute(dataAttribute + "-" + option)) && ("string" == typeof optionData && (0 === option.indexOf("on") ? optionData = window[optionData] : "false" === optionData ? optionData = !1 : "true" === optionData && (optionData = !0)), 
                            userOptions[option] = optionData);
                        }, attrOptions = npt.getAttribute(dataAttribute);
                        if (attrOptions && "" !== attrOptions && (attrOptions = attrOptions.replace(new RegExp("'", "g"), '"'), 
                        dataoptions = JSON.parse("{" + attrOptions + "}")), dataoptions) {
                            optionData = undefined;
                            for (p in dataoptions) if ("alias" === p.toLowerCase()) {
                                optionData = dataoptions[p];
                                break;
                            }
                        }
                        importOption("alias", optionData), userOptions.alias && resolveAlias(userOptions.alias, userOptions, opts);
                        for (option in opts) {
                            if (dataoptions) {
                                optionData = undefined;
                                for (p in dataoptions) if (p.toLowerCase() === option.toLowerCase()) {
                                    optionData = dataoptions[p];
                                    break;
                                }
                            }
                            importOption(option, optionData);
                        }
                    }
                    return $.extend(!0, opts, userOptions), ("rtl" === npt.dir || opts.rightAlign) && (npt.style.textAlign = "right"), 
                    ("rtl" === npt.dir || opts.numericInput) && (npt.dir = "ltr", npt.removeAttribute("dir"), 
                    opts.isRTL = !0), opts;
                }
                var that = this;
                return "string" == typeof elems && (elems = document.getElementById(elems) || document.querySelectorAll(elems)), 
                elems = elems.nodeName ? [ elems ] : elems, $.each(elems, function(ndx, el) {
                    var scopedOpts = $.extend(!0, {}, that.opts);
                    importAttributeOptions(el, scopedOpts, $.extend(!0, {}, that.userOptions), that.dataAttribute);
                    var maskset = generateMaskSet(scopedOpts, that.noMasksCache);
                    maskset !== undefined && (el.inputmask !== undefined && (el.inputmask.opts.autoUnmask = !0, 
                    el.inputmask.remove()), el.inputmask = new Inputmask(undefined, undefined, !0), 
                    el.inputmask.opts = scopedOpts, el.inputmask.noMasksCache = that.noMasksCache, el.inputmask.userOptions = $.extend(!0, {}, that.userOptions), 
                    el.inputmask.isRTL = scopedOpts.isRTL || scopedOpts.numericInput, el.inputmask.el = el, 
                    el.inputmask.maskset = maskset, $.data(el, "_inputmask_opts", scopedOpts), maskScope.call(el.inputmask, {
                        action: "mask"
                    }));
                }), elems && elems[0] ? elems[0].inputmask || this : this;
            },
            option: function(options, noremask) {
                return "string" == typeof options ? this.opts[options] : "object" === (void 0 === options ? "undefined" : _typeof(options)) ? ($.extend(this.userOptions, options), 
                this.el && !0 !== noremask && this.mask(this.el), this) : void 0;
            },
            unmaskedvalue: function(value) {
                return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache), 
                maskScope.call(this, {
                    action: "unmaskedvalue",
                    value: value
                });
            },
            remove: function() {
                return maskScope.call(this, {
                    action: "remove"
                });
            },
            getemptymask: function() {
                return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache), 
                maskScope.call(this, {
                    action: "getemptymask"
                });
            },
            hasMaskedValue: function() {
                return !this.opts.autoUnmask;
            },
            isComplete: function() {
                return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache), 
                maskScope.call(this, {
                    action: "isComplete"
                });
            },
            getmetadata: function() {
                return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache), 
                maskScope.call(this, {
                    action: "getmetadata"
                });
            },
            isValid: function(value) {
                return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache), 
                maskScope.call(this, {
                    action: "isValid",
                    value: value
                });
            },
            format: function(value, metadata) {
                return this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache), 
                maskScope.call(this, {
                    action: "format",
                    value: value,
                    metadata: metadata
                });
            },
            analyseMask: function(mask, regexMask, opts) {
                function MaskToken(isGroup, isOptional, isQuantifier, isAlternator) {
                    this.matches = [], this.openGroup = isGroup || !1, this.alternatorGroup = !1, this.isGroup = isGroup || !1, 
                    this.isOptional = isOptional || !1, this.isQuantifier = isQuantifier || !1, this.isAlternator = isAlternator || !1, 
                    this.quantifier = {
                        min: 1,
                        max: 1
                    };
                }
                function insertTestDefinition(mtoken, element, position) {
                    position = position !== undefined ? position : mtoken.matches.length;
                    var prevMatch = mtoken.matches[position - 1];
                    if (regexMask) 0 === element.indexOf("[") || escaped && /\\d|\\s|\\w]/i.test(element) || "." === element ? mtoken.matches.splice(position++, 0, {
                        fn: new RegExp(element, opts.casing ? "i" : ""),
                        cardinality: 1,
                        optionality: mtoken.isOptional,
                        newBlockMarker: prevMatch === undefined || prevMatch.def !== element,
                        casing: null,
                        def: element,
                        placeholder: undefined,
                        nativeDef: element
                    }) : (escaped && (element = element[element.length - 1]), $.each(element.split(""), function(ndx, lmnt) {
                        prevMatch = mtoken.matches[position - 1], mtoken.matches.splice(position++, 0, {
                            fn: null,
                            cardinality: 0,
                            optionality: mtoken.isOptional,
                            newBlockMarker: prevMatch === undefined || prevMatch.def !== lmnt && null !== prevMatch.fn,
                            casing: null,
                            def: opts.staticDefinitionSymbol || lmnt,
                            placeholder: opts.staticDefinitionSymbol !== undefined ? lmnt : undefined,
                            nativeDef: lmnt
                        });
                    })), escaped = !1; else {
                        var maskdef = (opts.definitions ? opts.definitions[element] : undefined) || Inputmask.prototype.definitions[element];
                        if (maskdef && !escaped) {
                            for (var prevalidators = maskdef.prevalidator, prevalidatorsL = prevalidators ? prevalidators.length : 0, i = 1; i < maskdef.cardinality; i++) {
                                var prevalidator = prevalidatorsL >= i ? prevalidators[i - 1] : [], validator = prevalidator.validator, cardinality = prevalidator.cardinality;
                                mtoken.matches.splice(position++, 0, {
                                    fn: validator ? "string" == typeof validator ? new RegExp(validator, opts.casing ? "i" : "") : new function() {
                                        this.test = validator;
                                    }() : new RegExp("."),
                                    cardinality: cardinality || 1,
                                    optionality: mtoken.isOptional,
                                    newBlockMarker: prevMatch === undefined || prevMatch.def !== (maskdef.definitionSymbol || element),
                                    casing: maskdef.casing,
                                    def: maskdef.definitionSymbol || element,
                                    placeholder: maskdef.placeholder,
                                    nativeDef: element
                                }), prevMatch = mtoken.matches[position - 1];
                            }
                            mtoken.matches.splice(position++, 0, {
                                fn: maskdef.validator ? "string" == typeof maskdef.validator ? new RegExp(maskdef.validator, opts.casing ? "i" : "") : new function() {
                                    this.test = maskdef.validator;
                                }() : new RegExp("."),
                                cardinality: maskdef.cardinality,
                                optionality: mtoken.isOptional,
                                newBlockMarker: prevMatch === undefined || prevMatch.def !== (maskdef.definitionSymbol || element),
                                casing: maskdef.casing,
                                def: maskdef.definitionSymbol || element,
                                placeholder: maskdef.placeholder,
                                nativeDef: element
                            });
                        } else mtoken.matches.splice(position++, 0, {
                            fn: null,
                            cardinality: 0,
                            optionality: mtoken.isOptional,
                            newBlockMarker: prevMatch === undefined || prevMatch.def !== element && null !== prevMatch.fn,
                            casing: null,
                            def: opts.staticDefinitionSymbol || element,
                            placeholder: opts.staticDefinitionSymbol !== undefined ? element : undefined,
                            nativeDef: element
                        }), escaped = !1;
                    }
                }
                function verifyGroupMarker(maskToken) {
                    maskToken && maskToken.matches && $.each(maskToken.matches, function(ndx, token) {
                        var nextToken = maskToken.matches[ndx + 1];
                        (nextToken === undefined || nextToken.matches === undefined || !1 === nextToken.isQuantifier) && token && token.isGroup && (token.isGroup = !1, 
                        regexMask || (insertTestDefinition(token, opts.groupmarker.start, 0), !0 !== token.openGroup && insertTestDefinition(token, opts.groupmarker.end))), 
                        verifyGroupMarker(token);
                    });
                }
                function defaultCase() {
                    if (openenings.length > 0) {
                        if (currentOpeningToken = openenings[openenings.length - 1], insertTestDefinition(currentOpeningToken, m), 
                        currentOpeningToken.isAlternator) {
                            alternator = openenings.pop();
                            for (var mndx = 0; mndx < alternator.matches.length; mndx++) alternator.matches[mndx].isGroup = !1;
                            openenings.length > 0 ? (currentOpeningToken = openenings[openenings.length - 1]).matches.push(alternator) : currentToken.matches.push(alternator);
                        }
                    } else insertTestDefinition(currentToken, m);
                }
                function reverseTokens(maskToken) {
                    maskToken.matches = maskToken.matches.reverse();
                    for (var match in maskToken.matches) if (maskToken.matches.hasOwnProperty(match)) {
                        var intMatch = parseInt(match);
                        if (maskToken.matches[match].isQuantifier && maskToken.matches[intMatch + 1] && maskToken.matches[intMatch + 1].isGroup) {
                            var qt = maskToken.matches[match];
                            maskToken.matches.splice(match, 1), maskToken.matches.splice(intMatch + 1, 0, qt);
                        }
                        maskToken.matches[match].matches !== undefined ? maskToken.matches[match] = reverseTokens(maskToken.matches[match]) : maskToken.matches[match] = function(st) {
                            return st === opts.optionalmarker.start ? st = opts.optionalmarker.end : st === opts.optionalmarker.end ? st = opts.optionalmarker.start : st === opts.groupmarker.start ? st = opts.groupmarker.end : st === opts.groupmarker.end && (st = opts.groupmarker.start), 
                            st;
                        }(maskToken.matches[match]);
                    }
                    return maskToken;
                }
                var match, m, openingToken, currentOpeningToken, alternator, lastMatch, groupToken, tokenizer = /(?:[?*+]|\{[0-9\+\*]+(?:,[0-9\+\*]*)?\})|[^.?*+^${[]()|\\]+|./g, regexTokenizer = /\[\^?]?(?:[^\\\]]+|\\[\S\s]?)*]?|\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9][0-9]*|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)|\((?:\?[:=!]?)?|(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??|[^.?*+^${[()|\\]+|./g, escaped = !1, currentToken = new MaskToken(), openenings = [], maskTokens = [];
                for (regexMask && (opts.optionalmarker.start = undefined, opts.optionalmarker.end = undefined); match = regexMask ? regexTokenizer.exec(mask) : tokenizer.exec(mask); ) {
                    if (m = match[0], regexMask) switch (m.charAt(0)) {
                      case "?":
                        m = "{0,1}";
                        break;

                      case "+":
                      case "*":
                        m = "{" + m + "}";
                    }
                    if (escaped) defaultCase(); else switch (m.charAt(0)) {
                      case opts.escapeChar:
                        escaped = !0, regexMask && defaultCase();
                        break;

                      case opts.optionalmarker.end:
                      case opts.groupmarker.end:
                        if (openingToken = openenings.pop(), openingToken.openGroup = !1, openingToken !== undefined) if (openenings.length > 0) {
                            if ((currentOpeningToken = openenings[openenings.length - 1]).matches.push(openingToken), 
                            currentOpeningToken.isAlternator) {
                                alternator = openenings.pop();
                                for (var mndx = 0; mndx < alternator.matches.length; mndx++) alternator.matches[mndx].isGroup = !1, 
                                alternator.matches[mndx].alternatorGroup = !1;
                                openenings.length > 0 ? (currentOpeningToken = openenings[openenings.length - 1]).matches.push(alternator) : currentToken.matches.push(alternator);
                            }
                        } else currentToken.matches.push(openingToken); else defaultCase();
                        break;

                      case opts.optionalmarker.start:
                        openenings.push(new MaskToken(!1, !0));
                        break;

                      case opts.groupmarker.start:
                        openenings.push(new MaskToken(!0));
                        break;

                      case opts.quantifiermarker.start:
                        var quantifier = new MaskToken(!1, !1, !0), mq = (m = m.replace(/[{}]/g, "")).split(","), mq0 = isNaN(mq[0]) ? mq[0] : parseInt(mq[0]), mq1 = 1 === mq.length ? mq0 : isNaN(mq[1]) ? mq[1] : parseInt(mq[1]);
                        if ("*" !== mq1 && "+" !== mq1 || (mq0 = "*" === mq1 ? 0 : 1), quantifier.quantifier = {
                            min: mq0,
                            max: mq1
                        }, openenings.length > 0) {
                            var matches = openenings[openenings.length - 1].matches;
                            (match = matches.pop()).isGroup || ((groupToken = new MaskToken(!0)).matches.push(match), 
                            match = groupToken), matches.push(match), matches.push(quantifier);
                        } else (match = currentToken.matches.pop()).isGroup || (regexMask && null === match.fn && "." === match.def && (match.fn = new RegExp(match.def, opts.casing ? "i" : "")), 
                        (groupToken = new MaskToken(!0)).matches.push(match), match = groupToken), currentToken.matches.push(match), 
                        currentToken.matches.push(quantifier);
                        break;

                      case opts.alternatormarker:
                        if (openenings.length > 0) {
                            var subToken = (currentOpeningToken = openenings[openenings.length - 1]).matches[currentOpeningToken.matches.length - 1];
                            lastMatch = currentOpeningToken.openGroup && (subToken.matches === undefined || !1 === subToken.isGroup && !1 === subToken.isAlternator) ? openenings.pop() : currentOpeningToken.matches.pop();
                        } else lastMatch = currentToken.matches.pop();
                        if (lastMatch.isAlternator) openenings.push(lastMatch); else if (lastMatch.alternatorGroup ? (alternator = openenings.pop(), 
                        lastMatch.alternatorGroup = !1) : alternator = new MaskToken(!1, !1, !1, !0), alternator.matches.push(lastMatch), 
                        openenings.push(alternator), lastMatch.openGroup) {
                            lastMatch.openGroup = !1;
                            var alternatorGroup = new MaskToken(!0);
                            alternatorGroup.alternatorGroup = !0, openenings.push(alternatorGroup);
                        }
                        break;

                      default:
                        defaultCase();
                    }
                }
                for (;openenings.length > 0; ) openingToken = openenings.pop(), currentToken.matches.push(openingToken);
                return currentToken.matches.length > 0 && (verifyGroupMarker(currentToken), maskTokens.push(currentToken)), 
                (opts.numericInput || opts.isRTL) && reverseTokens(maskTokens[0]), maskTokens;
            }
        }, Inputmask.extendDefaults = function(options) {
            $.extend(!0, Inputmask.prototype.defaults, options);
        }, Inputmask.extendDefinitions = function(definition) {
            $.extend(!0, Inputmask.prototype.definitions, definition);
        }, Inputmask.extendAliases = function(alias) {
            $.extend(!0, Inputmask.prototype.aliases, alias);
        }, Inputmask.format = function(value, options, metadata) {
            return Inputmask(options).format(value, metadata);
        }, Inputmask.unmask = function(value, options) {
            return Inputmask(options).unmaskedvalue(value);
        }, Inputmask.isValid = function(value, options) {
            return Inputmask(options).isValid(value);
        }, Inputmask.remove = function(elems) {
            $.each(elems, function(ndx, el) {
                el.inputmask && el.inputmask.remove();
            });
        }, Inputmask.escapeRegex = function(str) {
            var specials = [ "/", ".", "*", "+", "?", "|", "(", ")", "[", "]", "{", "}", "\\", "$", "^" ];
            return str.replace(new RegExp("(\\" + specials.join("|\\") + ")", "gim"), "\\$1");
        }, Inputmask.keyCode = {
            ALT: 18,
            BACKSPACE: 8,
            BACKSPACE_SAFARI: 127,
            CAPS_LOCK: 20,
            COMMA: 188,
            COMMAND: 91,
            COMMAND_LEFT: 91,
            COMMAND_RIGHT: 93,
            CONTROL: 17,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            INSERT: 45,
            LEFT: 37,
            MENU: 93,
            NUMPAD_ADD: 107,
            NUMPAD_DECIMAL: 110,
            NUMPAD_DIVIDE: 111,
            NUMPAD_ENTER: 108,
            NUMPAD_MULTIPLY: 106,
            NUMPAD_SUBTRACT: 109,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SHIFT: 16,
            SPACE: 32,
            TAB: 9,
            UP: 38,
            WINDOWS: 91,
            X: 88
        }, Inputmask;
    });
}, function(module, exports) {
    module.exports = jQuery;
}, function(module, exports, __webpack_require__) {
    "use strict";
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    __webpack_require__(4), __webpack_require__(9), __webpack_require__(12), __webpack_require__(13), 
    __webpack_require__(14), __webpack_require__(15);
    var _inputmask2 = _interopRequireDefault(__webpack_require__(1)), _inputmask4 = _interopRequireDefault(__webpack_require__(0)), _jquery2 = _interopRequireDefault(__webpack_require__(2));
    _inputmask4.default === _jquery2.default && __webpack_require__(16), window.Inputmask = _inputmask2.default;
}, function(module, exports, __webpack_require__) {
    var content = __webpack_require__(5);
    "string" == typeof content && (content = [ [ module.i, content, "" ] ]);
    var options = {
        hmr: !0
    };
    options.transform = void 0;
    __webpack_require__(7)(content, options);
    content.locals && (module.exports = content.locals);
}, function(module, exports, __webpack_require__) {
    (module.exports = __webpack_require__(6)(void 0)).push([ module.i, "span.im-caret {\r\n    -webkit-animation: 1s blink step-end infinite;\r\n    animation: 1s blink step-end infinite;\r\n}\r\n\r\n@keyframes blink {\r\n    from, to {\r\n        border-right-color: black;\r\n    }\r\n    50% {\r\n        border-right-color: transparent;\r\n    }\r\n}\r\n\r\n@-webkit-keyframes blink {\r\n    from, to {\r\n        border-right-color: black;\r\n    }\r\n    50% {\r\n        border-right-color: transparent;\r\n    }\r\n}\r\n\r\nspan.im-static {\r\n    color: grey;\r\n}\r\n\r\ndiv.im-colormask {\r\n    display: inline-block;\r\n    border-style: inset;\r\n    border-width: 2px;\r\n    -webkit-appearance: textfield;\r\n    -moz-appearance: textfield;\r\n    appearance: textfield;\r\n}\r\n\r\ndiv.im-colormask > input {\r\n    position: absolute;\r\n    display: inline-block;\r\n    background-color: transparent;\r\n    color: transparent;\r\n    -webkit-appearance: caret;\r\n    -moz-appearance: caret;\r\n    appearance: caret;\r\n    border-style: none;\r\n    left: 0; /*calculated*/\r\n}\r\n\r\ndiv.im-colormask > input:focus {\r\n    outline: none;\r\n}\r\n\r\ndiv.im-colormask > input::-moz-selection{\r\n    background: none;\r\n}\r\n\r\ndiv.im-colormask > input::selection{\r\n    background: none;\r\n}\r\ndiv.im-colormask > input::-moz-selection{\r\n    background: none;\r\n}\r\n\r\ndiv.im-colormask > div {\r\n    color: black;\r\n    display: inline-block;\r\n    width: 100px; /*calculated*/\r\n}", "" ]);
}, function(module, exports) {
    function cssWithMappingToString(item, useSourceMap) {
        var content = item[1] || "", cssMapping = item[3];
        if (!cssMapping) return content;
        if (useSourceMap && "function" == typeof btoa) {
            var sourceMapping = toComment(cssMapping), sourceURLs = cssMapping.sources.map(function(source) {
                return "/*# sourceURL=" + cssMapping.sourceRoot + source + " */";
            });
            return [ content ].concat(sourceURLs).concat([ sourceMapping ]).join("\n");
        }
        return [ content ].join("\n");
    }
    function toComment(sourceMap) {
        return "/*# " + ("sourceMappingURL=data:application/json;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))))) + " */";
    }
    module.exports = function(useSourceMap) {
        var list = [];
        return list.toString = function() {
            return this.map(function(item) {
                var content = cssWithMappingToString(item, useSourceMap);
                return item[2] ? "@media " + item[2] + "{" + content + "}" : content;
            }).join("");
        }, list.i = function(modules, mediaQuery) {
            "string" == typeof modules && (modules = [ [ null, modules, "" ] ]);
            for (var alreadyImportedModules = {}, i = 0; i < this.length; i++) {
                var id = this[i][0];
                "number" == typeof id && (alreadyImportedModules[id] = !0);
            }
            for (i = 0; i < modules.length; i++) {
                var item = modules[i];
                "number" == typeof item[0] && alreadyImportedModules[item[0]] || (mediaQuery && !item[2] ? item[2] = mediaQuery : mediaQuery && (item[2] = "(" + item[2] + ") and (" + mediaQuery + ")"), 
                list.push(item));
            }
        }, list;
    };
}, function(module, exports, __webpack_require__) {
    function addStylesToDom(styles, options) {
        for (var i = 0; i < styles.length; i++) {
            var item = styles[i], domStyle = stylesInDom[item.id];
            if (domStyle) {
                domStyle.refs++;
                for (j = 0; j < domStyle.parts.length; j++) domStyle.parts[j](item.parts[j]);
                for (;j < item.parts.length; j++) domStyle.parts.push(addStyle(item.parts[j], options));
            } else {
                for (var parts = [], j = 0; j < item.parts.length; j++) parts.push(addStyle(item.parts[j], options));
                stylesInDom[item.id] = {
                    id: item.id,
                    refs: 1,
                    parts: parts
                };
            }
        }
    }
    function listToStyles(list, options) {
        for (var styles = [], newStyles = {}, i = 0; i < list.length; i++) {
            var item = list[i], id = options.base ? item[0] + options.base : item[0], part = {
                css: item[1],
                media: item[2],
                sourceMap: item[3]
            };
            newStyles[id] ? newStyles[id].parts.push(part) : styles.push(newStyles[id] = {
                id: id,
                parts: [ part ]
            });
        }
        return styles;
    }
    function insertStyleElement(options, style) {
        var target = getElement(options.insertInto);
        if (!target) throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
        var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];
        if ("top" === options.insertAt) lastStyleElementInsertedAtTop ? lastStyleElementInsertedAtTop.nextSibling ? target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling) : target.appendChild(style) : target.insertBefore(style, target.firstChild), 
        stylesInsertedAtTop.push(style); else if ("bottom" === options.insertAt) target.appendChild(style); else {
            if ("object" != typeof options.insertAt || !options.insertAt.before) throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
            var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
            target.insertBefore(style, nextSibling);
        }
    }
    function removeStyleElement(style) {
        if (null === style.parentNode) return !1;
        style.parentNode.removeChild(style);
        var idx = stylesInsertedAtTop.indexOf(style);
        idx >= 0 && stylesInsertedAtTop.splice(idx, 1);
    }
    function createStyleElement(options) {
        var style = document.createElement("style");
        return options.attrs.type = "text/css", addAttrs(style, options.attrs), insertStyleElement(options, style), 
        style;
    }
    function createLinkElement(options) {
        var link = document.createElement("link");
        return options.attrs.type = "text/css", options.attrs.rel = "stylesheet", addAttrs(link, options.attrs), 
        insertStyleElement(options, link), link;
    }
    function addAttrs(el, attrs) {
        Object.keys(attrs).forEach(function(key) {
            el.setAttribute(key, attrs[key]);
        });
    }
    function addStyle(obj, options) {
        var style, update, remove, result;
        if (options.transform && obj.css) {
            if (!(result = options.transform(obj.css))) return function() {};
            obj.css = result;
        }
        if (options.singleton) {
            var styleIndex = singletonCounter++;
            style = singleton || (singleton = createStyleElement(options)), update = applyToSingletonTag.bind(null, style, styleIndex, !1), 
            remove = applyToSingletonTag.bind(null, style, styleIndex, !0);
        } else obj.sourceMap && "function" == typeof URL && "function" == typeof URL.createObjectURL && "function" == typeof URL.revokeObjectURL && "function" == typeof Blob && "function" == typeof btoa ? (style = createLinkElement(options), 
        update = updateLink.bind(null, style, options), remove = function() {
            removeStyleElement(style), style.href && URL.revokeObjectURL(style.href);
        }) : (style = createStyleElement(options), update = applyToTag.bind(null, style), 
        remove = function() {
            removeStyleElement(style);
        });
        return update(obj), function(newObj) {
            if (newObj) {
                if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) return;
                update(obj = newObj);
            } else remove();
        };
    }
    function applyToSingletonTag(style, index, remove, obj) {
        var css = remove ? "" : obj.css;
        if (style.styleSheet) style.styleSheet.cssText = replaceText(index, css); else {
            var cssNode = document.createTextNode(css), childNodes = style.childNodes;
            childNodes[index] && style.removeChild(childNodes[index]), childNodes.length ? style.insertBefore(cssNode, childNodes[index]) : style.appendChild(cssNode);
        }
    }
    function applyToTag(style, obj) {
        var css = obj.css, media = obj.media;
        if (media && style.setAttribute("media", media), style.styleSheet) style.styleSheet.cssText = css; else {
            for (;style.firstChild; ) style.removeChild(style.firstChild);
            style.appendChild(document.createTextNode(css));
        }
    }
    function updateLink(link, options, obj) {
        var css = obj.css, sourceMap = obj.sourceMap, autoFixUrls = void 0 === options.convertToAbsoluteUrls && sourceMap;
        (options.convertToAbsoluteUrls || autoFixUrls) && (css = fixUrls(css)), sourceMap && (css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */");
        var blob = new Blob([ css ], {
            type: "text/css"
        }), oldSrc = link.href;
        link.href = URL.createObjectURL(blob), oldSrc && URL.revokeObjectURL(oldSrc);
    }
    var stylesInDom = {}, isOldIE = function(fn) {
        var memo;
        return function() {
            return void 0 === memo && (memo = fn.apply(this, arguments)), memo;
        };
    }(function() {
        return window && document && document.all && !window.atob;
    }), getElement = function(fn) {
        var memo = {};
        return function(selector) {
            if (void 0 === memo[selector]) {
                var styleTarget = fn.call(this, selector);
                if (styleTarget instanceof window.HTMLIFrameElement) try {
                    styleTarget = styleTarget.contentDocument.head;
                } catch (e) {
                    styleTarget = null;
                }
                memo[selector] = styleTarget;
            }
            return memo[selector];
        };
    }(function(target) {
        return document.querySelector(target);
    }), singleton = null, singletonCounter = 0, stylesInsertedAtTop = [], fixUrls = __webpack_require__(8);
    module.exports = function(list, options) {
        if ("undefined" != typeof DEBUG && DEBUG && "object" != typeof document) throw new Error("The style-loader cannot be used in a non-browser environment");
        (options = options || {}).attrs = "object" == typeof options.attrs ? options.attrs : {}, 
        options.singleton || (options.singleton = isOldIE()), options.insertInto || (options.insertInto = "head"), 
        options.insertAt || (options.insertAt = "bottom");
        var styles = listToStyles(list, options);
        return addStylesToDom(styles, options), function(newList) {
            for (var mayRemove = [], i = 0; i < styles.length; i++) {
                var item = styles[i];
                (domStyle = stylesInDom[item.id]).refs--, mayRemove.push(domStyle);
            }
            newList && addStylesToDom(listToStyles(newList, options), options);
            for (i = 0; i < mayRemove.length; i++) {
                var domStyle = mayRemove[i];
                if (0 === domStyle.refs) {
                    for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();
                    delete stylesInDom[domStyle.id];
                }
            }
        };
    };
    var replaceText = function() {
        var textStore = [];
        return function(index, replacement) {
            return textStore[index] = replacement, textStore.filter(Boolean).join("\n");
        };
    }();
}, function(module, exports) {
    module.exports = function(css) {
        var location = "undefined" != typeof window && window.location;
        if (!location) throw new Error("fixUrls requires window.location");
        if (!css || "string" != typeof css) return css;
        var baseUrl = location.protocol + "//" + location.host, currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");
        return css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
            var unquotedOrigUrl = origUrl.trim().replace(/^"(.*)"$/, function(o, $1) {
                return $1;
            }).replace(/^'(.*)'$/, function(o, $1) {
                return $1;
            });
            if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) return fullMatch;
            var newUrl;
            return newUrl = 0 === unquotedOrigUrl.indexOf("//") ? unquotedOrigUrl : 0 === unquotedOrigUrl.indexOf("/") ? baseUrl + unquotedOrigUrl : currentDir + unquotedOrigUrl.replace(/^\.\//, ""), 
            "url(" + JSON.stringify(newUrl) + ")";
        });
    };
}, function(module, exports, __webpack_require__) {
    "use strict";
    var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
    "function" == typeof Symbol && Symbol.iterator;
    !function(factory) {
        __WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(0), __webpack_require__(1) ], 
        void 0 !== (__WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof (__WEBPACK_AMD_DEFINE_FACTORY__ = factory) ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__) && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__);
    }(function($, Inputmask) {
        function isLeapYear(year) {
            return isNaN(year) || 29 === new Date(year, 2, 0).getDate();
        }
        return Inputmask.extendAliases({
            "dd/mm/yyyy": {
                mask: "1/2/y",
                placeholder: "dd/mm/yyyy",
                regex: {
                    val1pre: new RegExp("[0-3]"),
                    val1: new RegExp("0[1-9]|[12][0-9]|3[01]"),
                    val2pre: function(separator) {
                        var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                        return new RegExp("((0[1-9]|[12][0-9]|3[01])" + escapedSeparator + "[01])");
                    },
                    val2: function(separator) {
                        var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                        return new RegExp("((0[1-9]|[12][0-9])" + escapedSeparator + "(0[1-9]|1[012]))|(30" + escapedSeparator + "(0[13-9]|1[012]))|(31" + escapedSeparator + "(0[13578]|1[02]))");
                    }
                },
                leapday: "29/02/",
                separator: "/",
                yearrange: {
                    minyear: 1900,
                    maxyear: 2099
                },
                isInYearRange: function(chrs, minyear, maxyear) {
                    if (isNaN(chrs)) return !1;
                    var enteredyear = parseInt(chrs.concat(minyear.toString().slice(chrs.length))), enteredyear2 = parseInt(chrs.concat(maxyear.toString().slice(chrs.length)));
                    return !isNaN(enteredyear) && (minyear <= enteredyear && enteredyear <= maxyear) || !isNaN(enteredyear2) && (minyear <= enteredyear2 && enteredyear2 <= maxyear);
                },
                determinebaseyear: function(minyear, maxyear, hint) {
                    var currentyear = new Date().getFullYear();
                    if (minyear > currentyear) return minyear;
                    if (maxyear < currentyear) {
                        for (var maxYearPrefix = maxyear.toString().slice(0, 2), maxYearPostfix = maxyear.toString().slice(2, 4); maxyear < maxYearPrefix + hint; ) maxYearPrefix--;
                        var maxxYear = maxYearPrefix + maxYearPostfix;
                        return minyear > maxxYear ? minyear : maxxYear;
                    }
                    if (minyear <= currentyear && currentyear <= maxyear) {
                        for (var currentYearPrefix = currentyear.toString().slice(0, 2); maxyear < currentYearPrefix + hint; ) currentYearPrefix--;
                        var currentYearAndHint = currentYearPrefix + hint;
                        return currentYearAndHint < minyear ? minyear : currentYearAndHint;
                    }
                    return currentyear;
                },
                onKeyDown: function(e, buffer, caretPos, opts) {
                    var $input = $(this);
                    if (e.ctrlKey && e.keyCode === Inputmask.keyCode.RIGHT) {
                        var today = new Date();
                        $input.val(today.getDate().toString() + (today.getMonth() + 1).toString() + today.getFullYear().toString()), 
                        $input.trigger("setvalue");
                    }
                },
                getFrontValue: function(mask, buffer, opts) {
                    for (var start = 0, length = 0, i = 0; i < mask.length && "2" !== mask.charAt(i); i++) {
                        var definition = opts.definitions[mask.charAt(i)];
                        definition ? (start += length, length = definition.cardinality) : length++;
                    }
                    return buffer.join("").substr(start, length);
                },
                postValidation: function(buffer, currentResult, opts) {
                    var dayMonthValue, year, bufferStr = buffer.join("");
                    return 0 === opts.mask.indexOf("y") ? (year = bufferStr.substr(0, 4), dayMonthValue = bufferStr.substring(4, 10)) : (year = bufferStr.substring(6, 10), 
                    dayMonthValue = bufferStr.substr(0, 6)), currentResult && (dayMonthValue !== opts.leapday || isLeapYear(year));
                },
                definitions: {
                    "1": {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            var isValid = opts.regex.val1.test(chrs);
                            return strict || isValid || chrs.charAt(1) !== opts.separator && -1 === "-./".indexOf(chrs.charAt(1)) || !(isValid = opts.regex.val1.test("0" + chrs.charAt(0))) ? isValid : (maskset.buffer[pos - 1] = "0", 
                            {
                                refreshFromBuffer: {
                                    start: pos - 1,
                                    end: pos
                                },
                                pos: pos,
                                c: chrs.charAt(0)
                            });
                        },
                        cardinality: 2,
                        prevalidator: [ {
                            validator: function(chrs, maskset, pos, strict, opts) {
                                var pchrs = chrs;
                                isNaN(maskset.buffer[pos + 1]) || (pchrs += maskset.buffer[pos + 1]);
                                var isValid = 1 === pchrs.length ? opts.regex.val1pre.test(pchrs) : opts.regex.val1.test(pchrs);
                                if (isValid && maskset.validPositions[pos] && (opts.regex.val2(opts.separator).test(chrs + maskset.validPositions[pos].input) || (maskset.validPositions[pos].input = "0" === chrs ? "1" : "0")), 
                                !strict && !isValid) {
                                    if (isValid = opts.regex.val1.test(chrs + "0")) return maskset.buffer[pos] = chrs, 
                                    maskset.buffer[++pos] = "0", {
                                        pos: pos,
                                        c: "0"
                                    };
                                    if (isValid = opts.regex.val1.test("0" + chrs)) return maskset.buffer[pos] = "0", 
                                    pos++, {
                                        pos: pos
                                    };
                                }
                                return isValid;
                            },
                            cardinality: 1
                        } ]
                    },
                    "2": {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            var frontValue = opts.getFrontValue(maskset.mask, maskset.buffer, opts);
                            -1 !== frontValue.indexOf(opts.placeholder[0]) && (frontValue = "01" + opts.separator);
                            var isValid = opts.regex.val2(opts.separator).test(frontValue + chrs);
                            return strict || isValid || chrs.charAt(1) !== opts.separator && -1 === "-./".indexOf(chrs.charAt(1)) || !(isValid = opts.regex.val2(opts.separator).test(frontValue + "0" + chrs.charAt(0))) ? isValid : (maskset.buffer[pos - 1] = "0", 
                            {
                                refreshFromBuffer: {
                                    start: pos - 1,
                                    end: pos
                                },
                                pos: pos,
                                c: chrs.charAt(0)
                            });
                        },
                        cardinality: 2,
                        prevalidator: [ {
                            validator: function(chrs, maskset, pos, strict, opts) {
                                isNaN(maskset.buffer[pos + 1]) || (chrs += maskset.buffer[pos + 1]);
                                var frontValue = opts.getFrontValue(maskset.mask, maskset.buffer, opts);
                                -1 !== frontValue.indexOf(opts.placeholder[0]) && (frontValue = "01" + opts.separator);
                                var isValid = 1 === chrs.length ? opts.regex.val2pre(opts.separator).test(frontValue + chrs) : opts.regex.val2(opts.separator).test(frontValue + chrs);
                                return isValid && maskset.validPositions[pos] && (opts.regex.val2(opts.separator).test(chrs + maskset.validPositions[pos].input) || (maskset.validPositions[pos].input = "0" === chrs ? "1" : "0")), 
                                strict || isValid || !(isValid = opts.regex.val2(opts.separator).test(frontValue + "0" + chrs)) ? isValid : (maskset.buffer[pos] = "0", 
                                pos++, {
                                    pos: pos
                                });
                            },
                            cardinality: 1
                        } ]
                    },
                    y: {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            return opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                        },
                        cardinality: 4,
                        prevalidator: [ {
                            validator: function(chrs, maskset, pos, strict, opts) {
                                var isValid = opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                                if (!strict && !isValid) {
                                    var yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs + "0").toString().slice(0, 1);
                                    if (isValid = opts.isInYearRange(yearPrefix + chrs, opts.yearrange.minyear, opts.yearrange.maxyear)) return maskset.buffer[pos++] = yearPrefix.charAt(0), 
                                    {
                                        pos: pos
                                    };
                                    if (yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs + "0").toString().slice(0, 2), 
                                    isValid = opts.isInYearRange(yearPrefix + chrs, opts.yearrange.minyear, opts.yearrange.maxyear)) return maskset.buffer[pos++] = yearPrefix.charAt(0), 
                                    maskset.buffer[pos++] = yearPrefix.charAt(1), {
                                        pos: pos
                                    };
                                }
                                return isValid;
                            },
                            cardinality: 1
                        }, {
                            validator: function(chrs, maskset, pos, strict, opts) {
                                var isValid = opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                                if (!strict && !isValid) {
                                    var yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs).toString().slice(0, 2);
                                    if (isValid = opts.isInYearRange(chrs[0] + yearPrefix[1] + chrs[1], opts.yearrange.minyear, opts.yearrange.maxyear)) return maskset.buffer[pos++] = yearPrefix.charAt(1), 
                                    {
                                        pos: pos
                                    };
                                    if (yearPrefix = opts.determinebaseyear(opts.yearrange.minyear, opts.yearrange.maxyear, chrs).toString().slice(0, 2), 
                                    isValid = opts.isInYearRange(yearPrefix + chrs, opts.yearrange.minyear, opts.yearrange.maxyear)) return maskset.buffer[pos - 1] = yearPrefix.charAt(0), 
                                    maskset.buffer[pos++] = yearPrefix.charAt(1), maskset.buffer[pos++] = chrs.charAt(0), 
                                    {
                                        refreshFromBuffer: {
                                            start: pos - 3,
                                            end: pos
                                        },
                                        pos: pos
                                    };
                                }
                                return isValid;
                            },
                            cardinality: 2
                        }, {
                            validator: function(chrs, maskset, pos, strict, opts) {
                                return opts.isInYearRange(chrs, opts.yearrange.minyear, opts.yearrange.maxyear);
                            },
                            cardinality: 3
                        } ]
                    }
                },
                insertMode: !1,
                autoUnmask: !1
            },
            "mm/dd/yyyy": {
                placeholder: "mm/dd/yyyy",
                alias: "dd/mm/yyyy",
                regex: {
                    val2pre: function(separator) {
                        var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                        return new RegExp("((0[13-9]|1[012])" + escapedSeparator + "[0-3])|(02" + escapedSeparator + "[0-2])");
                    },
                    val2: function(separator) {
                        var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                        return new RegExp("((0[1-9]|1[012])" + escapedSeparator + "(0[1-9]|[12][0-9]))|((0[13-9]|1[012])" + escapedSeparator + "30)|((0[13578]|1[02])" + escapedSeparator + "31)");
                    },
                    val1pre: new RegExp("[01]"),
                    val1: new RegExp("0[1-9]|1[012]")
                },
                leapday: "02/29/",
                onKeyDown: function(e, buffer, caretPos, opts) {
                    var $input = $(this);
                    if (e.ctrlKey && e.keyCode === Inputmask.keyCode.RIGHT) {
                        var today = new Date();
                        $input.val((today.getMonth() + 1).toString() + today.getDate().toString() + today.getFullYear().toString()), 
                        $input.trigger("setvalue");
                    }
                }
            },
            "yyyy/mm/dd": {
                mask: "y/1/2",
                placeholder: "yyyy/mm/dd",
                alias: "mm/dd/yyyy",
                leapday: "/02/29",
                onKeyDown: function(e, buffer, caretPos, opts) {
                    var $input = $(this);
                    if (e.ctrlKey && e.keyCode === Inputmask.keyCode.RIGHT) {
                        var today = new Date();
                        $input.val(today.getFullYear().toString() + (today.getMonth() + 1).toString() + today.getDate().toString()), 
                        $input.trigger("setvalue");
                    }
                }
            },
            "dd.mm.yyyy": {
                mask: "1.2.y",
                placeholder: "dd.mm.yyyy",
                leapday: "29.02.",
                separator: ".",
                alias: "dd/mm/yyyy"
            },
            "dd-mm-yyyy": {
                mask: "1-2-y",
                placeholder: "dd-mm-yyyy",
                leapday: "29-02-",
                separator: "-",
                alias: "dd/mm/yyyy"
            },
            "mm.dd.yyyy": {
                mask: "1.2.y",
                placeholder: "mm.dd.yyyy",
                leapday: "02.29.",
                separator: ".",
                alias: "mm/dd/yyyy"
            },
            "mm-dd-yyyy": {
                mask: "1-2-y",
                placeholder: "mm-dd-yyyy",
                leapday: "02-29-",
                separator: "-",
                alias: "mm/dd/yyyy"
            },
            "yyyy.mm.dd": {
                mask: "y.1.2",
                placeholder: "yyyy.mm.dd",
                leapday: ".02.29",
                separator: ".",
                alias: "yyyy/mm/dd"
            },
            "yyyy-mm-dd": {
                mask: "y-1-2",
                placeholder: "yyyy-mm-dd",
                leapday: "-02-29",
                separator: "-",
                alias: "yyyy/mm/dd"
            },
            datetime: {
                mask: "1/2/y h:s",
                placeholder: "dd/mm/yyyy hh:mm",
                alias: "dd/mm/yyyy",
                regex: {
                    hrspre: new RegExp("[012]"),
                    hrs24: new RegExp("2[0-4]|1[3-9]"),
                    hrs: new RegExp("[01][0-9]|2[0-4]"),
                    ampm: new RegExp("^[a|p|A|P][m|M]"),
                    mspre: new RegExp("[0-5]"),
                    ms: new RegExp("[0-5][0-9]")
                },
                timeseparator: ":",
                hourFormat: "24",
                definitions: {
                    h: {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            if ("24" === opts.hourFormat && 24 === parseInt(chrs, 10)) return maskset.buffer[pos - 1] = "0", 
                            maskset.buffer[pos] = "0", {
                                refreshFromBuffer: {
                                    start: pos - 1,
                                    end: pos
                                },
                                c: "0"
                            };
                            var isValid = opts.regex.hrs.test(chrs);
                            if (!strict && !isValid && (chrs.charAt(1) === opts.timeseparator || -1 !== "-.:".indexOf(chrs.charAt(1))) && (isValid = opts.regex.hrs.test("0" + chrs.charAt(0)))) return maskset.buffer[pos - 1] = "0", 
                            maskset.buffer[pos] = chrs.charAt(0), pos++, {
                                refreshFromBuffer: {
                                    start: pos - 2,
                                    end: pos
                                },
                                pos: pos,
                                c: opts.timeseparator
                            };
                            if (isValid && "24" !== opts.hourFormat && opts.regex.hrs24.test(chrs)) {
                                var tmp = parseInt(chrs, 10);
                                return 24 === tmp ? (maskset.buffer[pos + 5] = "a", maskset.buffer[pos + 6] = "m") : (maskset.buffer[pos + 5] = "p", 
                                maskset.buffer[pos + 6] = "m"), (tmp -= 12) < 10 ? (maskset.buffer[pos] = tmp.toString(), 
                                maskset.buffer[pos - 1] = "0") : (maskset.buffer[pos] = tmp.toString().charAt(1), 
                                maskset.buffer[pos - 1] = tmp.toString().charAt(0)), {
                                    refreshFromBuffer: {
                                        start: pos - 1,
                                        end: pos + 6
                                    },
                                    c: maskset.buffer[pos]
                                };
                            }
                            return isValid;
                        },
                        cardinality: 2,
                        prevalidator: [ {
                            validator: function(chrs, maskset, pos, strict, opts) {
                                var isValid = opts.regex.hrspre.test(chrs);
                                return strict || isValid || !(isValid = opts.regex.hrs.test("0" + chrs)) ? isValid : (maskset.buffer[pos] = "0", 
                                pos++, {
                                    pos: pos
                                });
                            },
                            cardinality: 1
                        } ]
                    },
                    s: {
                        validator: "[0-5][0-9]",
                        cardinality: 2,
                        prevalidator: [ {
                            validator: function(chrs, maskset, pos, strict, opts) {
                                var isValid = opts.regex.mspre.test(chrs);
                                return strict || isValid || !(isValid = opts.regex.ms.test("0" + chrs)) ? isValid : (maskset.buffer[pos] = "0", 
                                pos++, {
                                    pos: pos
                                });
                            },
                            cardinality: 1
                        } ]
                    },
                    t: {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            return opts.regex.ampm.test(chrs + "m");
                        },
                        casing: "lower",
                        cardinality: 1
                    }
                },
                insertMode: !1,
                autoUnmask: !1
            },
            datetime12: {
                mask: "1/2/y h:s t\\m",
                placeholder: "dd/mm/yyyy hh:mm xm",
                alias: "datetime",
                hourFormat: "12"
            },
            "mm/dd/yyyy hh:mm xm": {
                mask: "1/2/y h:s t\\m",
                placeholder: "mm/dd/yyyy hh:mm xm",
                alias: "datetime12",
                regex: {
                    val2pre: function(separator) {
                        var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                        return new RegExp("((0[13-9]|1[012])" + escapedSeparator + "[0-3])|(02" + escapedSeparator + "[0-2])");
                    },
                    val2: function(separator) {
                        var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                        return new RegExp("((0[1-9]|1[012])" + escapedSeparator + "(0[1-9]|[12][0-9]))|((0[13-9]|1[012])" + escapedSeparator + "30)|((0[13578]|1[02])" + escapedSeparator + "31)");
                    },
                    val1pre: new RegExp("[01]"),
                    val1: new RegExp("0[1-9]|1[012]")
                },
                leapday: "02/29/",
                onKeyDown: function(e, buffer, caretPos, opts) {
                    var $input = $(this);
                    if (e.ctrlKey && e.keyCode === Inputmask.keyCode.RIGHT) {
                        var today = new Date();
                        $input.val((today.getMonth() + 1).toString() + today.getDate().toString() + today.getFullYear().toString()), 
                        $input.trigger("setvalue");
                    }
                }
            },
            "hh:mm t": {
                mask: "h:s t\\m",
                placeholder: "hh:mm xm",
                alias: "datetime",
                hourFormat: "12"
            },
            "h:s t": {
                mask: "h:s t\\m",
                placeholder: "hh:mm xm",
                alias: "datetime",
                hourFormat: "12"
            },
            "hh:mm:ss": {
                mask: "h:s:s",
                placeholder: "hh:mm:ss",
                alias: "datetime",
                autoUnmask: !1
            },
            "hh:mm": {
                mask: "h:s",
                placeholder: "hh:mm",
                alias: "datetime",
                autoUnmask: !1
            },
            date: {
                alias: "dd/mm/yyyy"
            },
            "mm/yyyy": {
                mask: "1/y",
                placeholder: "mm/yyyy",
                leapday: "donotuse",
                separator: "/",
                alias: "mm/dd/yyyy"
            },
            shamsi: {
                regex: {
                    val2pre: function(separator) {
                        var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                        return new RegExp("((0[1-9]|1[012])" + escapedSeparator + "[0-3])");
                    },
                    val2: function(separator) {
                        var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                        return new RegExp("((0[1-9]|1[012])" + escapedSeparator + "(0[1-9]|[12][0-9]))|((0[1-9]|1[012])" + escapedSeparator + "30)|((0[1-6])" + escapedSeparator + "31)");
                    },
                    val1pre: new RegExp("[01]"),
                    val1: new RegExp("0[1-9]|1[012]")
                },
                yearrange: {
                    minyear: 1300,
                    maxyear: 1499
                },
                mask: "y/1/2",
                leapday: "/12/30",
                placeholder: "yyyy/mm/dd",
                alias: "mm/dd/yyyy",
                clearIncomplete: !0
            },
            "yyyy-mm-dd hh:mm:ss": {
                mask: "y-1-2 h:s:s",
                placeholder: "yyyy-mm-dd hh:mm:ss",
                alias: "datetime",
                separator: "-",
                leapday: "-02-29",
                regex: {
                    val2pre: function(separator) {
                        var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                        return new RegExp("((0[13-9]|1[012])" + escapedSeparator + "[0-3])|(02" + escapedSeparator + "[0-2])");
                    },
                    val2: function(separator) {
                        var escapedSeparator = Inputmask.escapeRegex.call(this, separator);
                        return new RegExp("((0[1-9]|1[012])" + escapedSeparator + "(0[1-9]|[12][0-9]))|((0[13-9]|1[012])" + escapedSeparator + "30)|((0[13578]|1[02])" + escapedSeparator + "31)");
                    },
                    val1pre: new RegExp("[01]"),
                    val1: new RegExp("0[1-9]|1[012]")
                },
                onKeyDown: function(e, buffer, caretPos, opts) {}
            }
        }), Inputmask;
    });
}, function(module, exports, __webpack_require__) {
    "use strict";
    var __WEBPACK_AMD_DEFINE_RESULT__;
    "function" == typeof Symbol && Symbol.iterator;
    void 0 !== (__WEBPACK_AMD_DEFINE_RESULT__ = function() {
        return window;
    }.call(exports, __webpack_require__, exports, module)) && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__);
}, function(module, exports, __webpack_require__) {
    "use strict";
    var __WEBPACK_AMD_DEFINE_RESULT__;
    "function" == typeof Symbol && Symbol.iterator;
    void 0 !== (__WEBPACK_AMD_DEFINE_RESULT__ = function() {
        return document;
    }.call(exports, __webpack_require__, exports, module)) && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__);
}, function(module, exports, __webpack_require__) {
    "use strict";
    var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
    "function" == typeof Symbol && Symbol.iterator;
    !function(factory) {
        __WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(0), __webpack_require__(1) ], 
        void 0 !== (__WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof (__WEBPACK_AMD_DEFINE_FACTORY__ = factory) ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__) && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__);
    }(function($, Inputmask) {
        return Inputmask.extendDefinitions({
            A: {
                validator: "[A-Za-zА-яЁёÀ-ÿµ]",
                cardinality: 1,
                casing: "upper"
            },
            "&": {
                validator: "[0-9A-Za-zА-яЁёÀ-ÿµ]",
                cardinality: 1,
                casing: "upper"
            },
            "#": {
                validator: "[0-9A-Fa-f]",
                cardinality: 1,
                casing: "upper"
            }
        }), Inputmask.extendAliases({
            url: {
                definitions: {
                    i: {
                        validator: ".",
                        cardinality: 1
                    }
                },
                mask: "(\\http://)|(\\http\\s://)|(ftp://)|(ftp\\s://)i{+}",
                insertMode: !1,
                autoUnmask: !1,
                inputmode: "url"
            },
            ip: {
                mask: "i[i[i]].i[i[i]].i[i[i]].i[i[i]]",
                definitions: {
                    i: {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            return pos - 1 > -1 && "." !== maskset.buffer[pos - 1] ? (chrs = maskset.buffer[pos - 1] + chrs, 
                            chrs = pos - 2 > -1 && "." !== maskset.buffer[pos - 2] ? maskset.buffer[pos - 2] + chrs : "0" + chrs) : chrs = "00" + chrs, 
                            new RegExp("25[0-5]|2[0-4][0-9]|[01][0-9][0-9]").test(chrs);
                        },
                        cardinality: 1
                    }
                },
                onUnMask: function(maskedValue, unmaskedValue, opts) {
                    return maskedValue;
                },
                inputmode: "numeric"
            },
            email: {
                mask: "*{1,64}[.*{1,64}][.*{1,64}][.*{1,63}]@-{1,63}.-{1,63}[.-{1,63}][.-{1,63}]",
                greedy: !1,
                onBeforePaste: function(pastedValue, opts) {
                    return (pastedValue = pastedValue.toLowerCase()).replace("mailto:", "");
                },
                definitions: {
                    "*": {
                        validator: "[0-9A-Za-z!#$%&'*+/=?^_`{|}~-]",
                        cardinality: 1,
                        casing: "lower"
                    },
                    "-": {
                        validator: "[0-9A-Za-z-]",
                        cardinality: 1,
                        casing: "lower"
                    }
                },
                onUnMask: function(maskedValue, unmaskedValue, opts) {
                    return maskedValue;
                },
                inputmode: "email"
            },
            mac: {
                mask: "##:##:##:##:##:##"
            },
            vin: {
                mask: "V{13}9{4}",
                definitions: {
                    V: {
                        validator: "[A-HJ-NPR-Za-hj-npr-z\\d]",
                        cardinality: 1,
                        casing: "upper"
                    }
                },
                clearIncomplete: !0,
                autoUnmask: !0
            }
        }), Inputmask;
    });
}, function(module, exports, __webpack_require__) {
    "use strict";
    var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
    "function" == typeof Symbol && Symbol.iterator;
    !function(factory) {
        __WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(0), __webpack_require__(1) ], 
        void 0 !== (__WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof (__WEBPACK_AMD_DEFINE_FACTORY__ = factory) ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__) && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__);
    }(function($, Inputmask, undefined) {
        function autoEscape(txt, opts) {
            for (var escapedTxt = "", i = 0; i < txt.length; i++) Inputmask.prototype.definitions[txt.charAt(i)] || opts.definitions[txt.charAt(i)] || opts.optionalmarker.start === txt.charAt(i) || opts.optionalmarker.end === txt.charAt(i) || opts.quantifiermarker.start === txt.charAt(i) || opts.quantifiermarker.end === txt.charAt(i) || opts.groupmarker.start === txt.charAt(i) || opts.groupmarker.end === txt.charAt(i) || opts.alternatormarker === txt.charAt(i) ? escapedTxt += "\\" + txt.charAt(i) : escapedTxt += txt.charAt(i);
            return escapedTxt;
        }
        return Inputmask.extendAliases({
            numeric: {
                mask: function(opts) {
                    if (0 !== opts.repeat && isNaN(opts.integerDigits) && (opts.integerDigits = opts.repeat), 
                    opts.repeat = 0, opts.groupSeparator === opts.radixPoint && ("." === opts.radixPoint ? opts.groupSeparator = "," : "," === opts.radixPoint ? opts.groupSeparator = "." : opts.groupSeparator = ""), 
                    " " === opts.groupSeparator && (opts.skipOptionalPartCharacter = undefined), opts.autoGroup = opts.autoGroup && "" !== opts.groupSeparator, 
                    opts.autoGroup && ("string" == typeof opts.groupSize && isFinite(opts.groupSize) && (opts.groupSize = parseInt(opts.groupSize)), 
                    isFinite(opts.integerDigits))) {
                        var seps = Math.floor(opts.integerDigits / opts.groupSize), mod = opts.integerDigits % opts.groupSize;
                        opts.integerDigits = parseInt(opts.integerDigits) + (0 === mod ? seps - 1 : seps), 
                        opts.integerDigits < 1 && (opts.integerDigits = "*");
                    }
                    opts.placeholder.length > 1 && (opts.placeholder = opts.placeholder.charAt(0)), 
                    "radixFocus" === opts.positionCaretOnClick && "" === opts.placeholder && !1 === opts.integerOptional && (opts.positionCaretOnClick = "lvp"), 
                    opts.definitions[";"] = opts.definitions["~"], opts.definitions[";"].definitionSymbol = "~", 
                    !0 === opts.numericInput && (opts.positionCaretOnClick = "radixFocus" === opts.positionCaretOnClick ? "lvp" : opts.positionCaretOnClick, 
                    opts.digitsOptional = !1, isNaN(opts.digits) && (opts.digits = 2), opts.decimalProtect = !1);
                    var mask = "[+]";
                    if (mask += autoEscape(opts.prefix, opts), !0 === opts.integerOptional ? mask += "~{1," + opts.integerDigits + "}" : mask += "~{" + opts.integerDigits + "}", 
                    opts.digits !== undefined) {
                        opts.radixPointDefinitionSymbol = opts.decimalProtect ? ":" : opts.radixPoint;
                        var dq = opts.digits.toString().split(",");
                        isFinite(dq[0] && dq[1] && isFinite(dq[1])) ? mask += opts.radixPointDefinitionSymbol + ";{" + opts.digits + "}" : (isNaN(opts.digits) || parseInt(opts.digits) > 0) && (opts.digitsOptional ? mask += "[" + opts.radixPointDefinitionSymbol + ";{1," + opts.digits + "}]" : mask += opts.radixPointDefinitionSymbol + ";{" + opts.digits + "}");
                    }
                    return mask += autoEscape(opts.suffix, opts), mask += "[-]", opts.greedy = !1, mask;
                },
                placeholder: "",
                greedy: !1,
                digits: "*",
                digitsOptional: !0,
                enforceDigitsOnBlur: !1,
                radixPoint: ".",
                positionCaretOnClick: "radixFocus",
                groupSize: 3,
                groupSeparator: "",
                autoGroup: !1,
                allowMinus: !0,
                negationSymbol: {
                    front: "-",
                    back: ""
                },
                integerDigits: "+",
                integerOptional: !0,
                prefix: "",
                suffix: "",
                rightAlign: !0,
                decimalProtect: !0,
                min: null,
                max: null,
                step: 1,
                insertMode: !0,
                autoUnmask: !1,
                unmaskAsNumber: !1,
                inputmode: "numeric",
                preValidation: function(buffer, pos, c, isSelection, opts) {
                    if ("-" === c || c === opts.negationSymbol.front) return !0 === opts.allowMinus && (opts.isNegative = opts.isNegative === undefined || !opts.isNegative, 
                    "" === buffer.join("") || {
                        caret: pos,
                        dopost: !0
                    });
                    if (!1 === isSelection && c === opts.radixPoint && opts.digits !== undefined && (isNaN(opts.digits) || parseInt(opts.digits) > 0)) {
                        var radixPos = $.inArray(opts.radixPoint, buffer);
                        if (-1 !== radixPos) return !0 === opts.numericInput ? pos === radixPos : {
                            caret: radixPos + 1
                        };
                    }
                    return !0;
                },
                postValidation: function(buffer, currentResult, opts) {
                    var suffix = opts.suffix.split(""), prefix = opts.prefix.split("");
                    if (currentResult.pos === undefined && currentResult.caret !== undefined && !0 !== currentResult.dopost) return currentResult;
                    var caretPos = currentResult.caret !== undefined ? currentResult.caret : currentResult.pos, maskedValue = buffer.slice();
                    opts.numericInput && (caretPos = maskedValue.length - caretPos - 1, maskedValue = maskedValue.reverse());
                    var charAtPos = maskedValue[caretPos];
                    if (charAtPos === opts.groupSeparator && (charAtPos = maskedValue[caretPos += 1]), 
                    caretPos === maskedValue.length - opts.suffix.length - 1 && charAtPos === opts.radixPoint) return currentResult;
                    charAtPos !== undefined && charAtPos !== opts.radixPoint && charAtPos !== opts.negationSymbol.front && charAtPos !== opts.negationSymbol.back && (maskedValue[caretPos] = "?", 
                    opts.prefix.length > 0 && caretPos >= (!1 === opts.isNegative ? 1 : 0) && caretPos < opts.prefix.length - 1 + (!1 === opts.isNegative ? 1 : 0) ? prefix[caretPos - (!1 === opts.isNegative ? 1 : 0)] = "?" : opts.suffix.length > 0 && caretPos >= maskedValue.length - opts.suffix.length - (!1 === opts.isNegative ? 1 : 0) && (suffix[caretPos - (maskedValue.length - opts.suffix.length - (!1 === opts.isNegative ? 1 : 0))] = "?")), 
                    prefix = prefix.join(""), suffix = suffix.join("");
                    var processValue = maskedValue.join("").replace(prefix, "");
                    if (processValue = processValue.replace(suffix, ""), processValue = processValue.replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), ""), 
                    processValue = processValue.replace(new RegExp("[-" + Inputmask.escapeRegex(opts.negationSymbol.front) + "]", "g"), ""), 
                    processValue = processValue.replace(new RegExp(Inputmask.escapeRegex(opts.negationSymbol.back) + "$"), ""), 
                    isNaN(opts.placeholder) && (processValue = processValue.replace(new RegExp(Inputmask.escapeRegex(opts.placeholder), "g"), "")), 
                    processValue.length > 1 && 1 !== processValue.indexOf(opts.radixPoint) && ("0" === charAtPos && (processValue = processValue.replace(/^\?/g, "")), 
                    processValue = processValue.replace(/^0/g, "")), processValue.charAt(0) === opts.radixPoint && "" !== opts.radixPoint && !0 !== opts.numericInput && (processValue = "0" + processValue), 
                    "" !== processValue) {
                        if (processValue = processValue.split(""), (!opts.digitsOptional || opts.enforceDigitsOnBlur && "blur" === currentResult.event) && isFinite(opts.digits)) {
                            var radixPosition = $.inArray(opts.radixPoint, processValue), rpb = $.inArray(opts.radixPoint, maskedValue);
                            -1 === radixPosition && (processValue.push(opts.radixPoint), radixPosition = processValue.length - 1);
                            for (var i = 1; i <= opts.digits; i++) opts.digitsOptional && (!opts.enforceDigitsOnBlur || "blur" !== currentResult.event) || processValue[radixPosition + i] !== undefined && processValue[radixPosition + i] !== opts.placeholder.charAt(0) ? -1 !== rpb && maskedValue[rpb + i] !== undefined && (processValue[radixPosition + i] = processValue[radixPosition + i] || maskedValue[rpb + i]) : processValue[radixPosition + i] = currentResult.placeholder || opts.placeholder.charAt(0);
                        }
                        if (!0 !== opts.autoGroup || "" === opts.groupSeparator || charAtPos === opts.radixPoint && currentResult.pos === undefined && !currentResult.dopost) processValue = processValue.join(""); else {
                            var addRadix = processValue[processValue.length - 1] === opts.radixPoint && currentResult.c === opts.radixPoint;
                            processValue = Inputmask(function(buffer, opts) {
                                var postMask = "";
                                if (postMask += "(" + opts.groupSeparator + "*{" + opts.groupSize + "}){*}", "" !== opts.radixPoint) {
                                    var radixSplit = buffer.join("").split(opts.radixPoint);
                                    radixSplit[1] && (postMask += opts.radixPoint + "*{" + radixSplit[1].match(/^\d*\??\d*/)[0].length + "}");
                                }
                                return postMask;
                            }(processValue, opts), {
                                numericInput: !0,
                                jitMasking: !0,
                                definitions: {
                                    "*": {
                                        validator: "[0-9?]",
                                        cardinality: 1
                                    }
                                }
                            }).format(processValue.join("")), addRadix && (processValue += opts.radixPoint), 
                            processValue.charAt(0) === opts.groupSeparator && processValue.substr(1);
                        }
                    }
                    if (opts.isNegative && "blur" === currentResult.event && (opts.isNegative = "0" !== processValue), 
                    processValue = prefix + processValue, processValue += suffix, opts.isNegative && (processValue = opts.negationSymbol.front + processValue, 
                    processValue += opts.negationSymbol.back), processValue = processValue.split(""), 
                    charAtPos !== undefined) if (charAtPos !== opts.radixPoint && charAtPos !== opts.negationSymbol.front && charAtPos !== opts.negationSymbol.back) (caretPos = $.inArray("?", processValue)) > -1 ? processValue[caretPos] = charAtPos : caretPos = currentResult.caret || 0; else if (charAtPos === opts.radixPoint || charAtPos === opts.negationSymbol.front || charAtPos === opts.negationSymbol.back) {
                        var newCaretPos = $.inArray(charAtPos, processValue);
                        -1 !== newCaretPos && (caretPos = newCaretPos);
                    }
                    opts.numericInput && (caretPos = processValue.length - caretPos - 1, processValue = processValue.reverse());
                    var rslt = {
                        caret: charAtPos === undefined || currentResult.pos !== undefined ? caretPos + (opts.numericInput ? -1 : 1) : caretPos,
                        buffer: processValue,
                        refreshFromBuffer: currentResult.dopost || buffer.join("") !== processValue.join("")
                    };
                    return rslt.refreshFromBuffer ? rslt : currentResult;
                },
                onBeforeWrite: function(e, buffer, caretPos, opts) {
                    if (e) switch (e.type) {
                      case "keydown":
                        return opts.postValidation(buffer, {
                            caret: caretPos,
                            dopost: !0
                        }, opts);

                      case "blur":
                      case "checkval":
                        var unmasked;
                        if (function(opts) {
                            opts.parseMinMaxOptions === undefined && (null !== opts.min && (opts.min = opts.min.toString().replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), ""), 
                            "," === opts.radixPoint && (opts.min = opts.min.replace(opts.radixPoint, ".")), 
                            opts.min = isFinite(opts.min) ? parseFloat(opts.min) : NaN, isNaN(opts.min) && (opts.min = Number.MIN_VALUE)), 
                            null !== opts.max && (opts.max = opts.max.toString().replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), ""), 
                            "," === opts.radixPoint && (opts.max = opts.max.replace(opts.radixPoint, ".")), 
                            opts.max = isFinite(opts.max) ? parseFloat(opts.max) : NaN, isNaN(opts.max) && (opts.max = Number.MAX_VALUE)), 
                            opts.parseMinMaxOptions = "done");
                        }(opts), null !== opts.min || null !== opts.max) {
                            if (unmasked = opts.onUnMask(buffer.join(""), undefined, $.extend({}, opts, {
                                unmaskAsNumber: !0
                            })), null !== opts.min && unmasked < opts.min) return opts.isNegative = opts.min < 0, 
                            opts.postValidation(opts.min.toString().replace(".", opts.radixPoint).split(""), {
                                caret: caretPos,
                                dopost: !0,
                                placeholder: "0"
                            }, opts);
                            if (null !== opts.max && unmasked > opts.max) return opts.isNegative = opts.max < 0, 
                            opts.postValidation(opts.max.toString().replace(".", opts.radixPoint).split(""), {
                                caret: caretPos,
                                dopost: !0,
                                placeholder: "0"
                            }, opts);
                        }
                        return opts.postValidation(buffer, {
                            caret: caretPos,
                            placeholder: "0",
                            event: "blur"
                        }, opts);

                      case "_checkval":
                        return {
                            caret: caretPos
                        };
                    }
                },
                regex: {
                    integerPart: function(opts, emptyCheck) {
                        return emptyCheck ? new RegExp("[" + Inputmask.escapeRegex(opts.negationSymbol.front) + "+]?") : new RegExp("[" + Inputmask.escapeRegex(opts.negationSymbol.front) + "+]?\\d+");
                    },
                    integerNPart: function(opts) {
                        return new RegExp("[\\d" + Inputmask.escapeRegex(opts.groupSeparator) + Inputmask.escapeRegex(opts.placeholder.charAt(0)) + "]+");
                    }
                },
                definitions: {
                    "~": {
                        validator: function(chrs, maskset, pos, strict, opts, isSelection) {
                            var isValid = strict ? new RegExp("[0-9" + Inputmask.escapeRegex(opts.groupSeparator) + "]").test(chrs) : new RegExp("[0-9]").test(chrs);
                            if (!0 === isValid) {
                                if (!0 !== opts.numericInput && maskset.validPositions[pos] !== undefined && "~" === maskset.validPositions[pos].match.def && !isSelection) {
                                    var processValue = maskset.buffer.join(""), pvRadixSplit = (processValue = (processValue = processValue.replace(new RegExp("[-" + Inputmask.escapeRegex(opts.negationSymbol.front) + "]", "g"), "")).replace(new RegExp(Inputmask.escapeRegex(opts.negationSymbol.back) + "$"), "")).split(opts.radixPoint);
                                    pvRadixSplit.length > 1 && (pvRadixSplit[1] = pvRadixSplit[1].replace(/0/g, opts.placeholder.charAt(0))), 
                                    "0" === pvRadixSplit[0] && (pvRadixSplit[0] = pvRadixSplit[0].replace(/0/g, opts.placeholder.charAt(0))), 
                                    processValue = pvRadixSplit[0] + opts.radixPoint + pvRadixSplit[1] || "";
                                    var bufferTemplate = maskset._buffer.join("");
                                    for (processValue === opts.radixPoint && (processValue = bufferTemplate); null === processValue.match(Inputmask.escapeRegex(bufferTemplate) + "$"); ) bufferTemplate = bufferTemplate.slice(1);
                                    isValid = (processValue = (processValue = processValue.replace(bufferTemplate, "")).split(""))[pos] === undefined ? {
                                        pos: pos,
                                        remove: pos
                                    } : {
                                        pos: pos
                                    };
                                }
                            } else strict || chrs !== opts.radixPoint || maskset.validPositions[pos - 1] !== undefined || (maskset.buffer[pos] = "0", 
                            isValid = {
                                pos: pos + 1
                            });
                            return isValid;
                        },
                        cardinality: 1
                    },
                    "+": {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            return opts.allowMinus && ("-" === chrs || chrs === opts.negationSymbol.front);
                        },
                        cardinality: 1,
                        placeholder: ""
                    },
                    "-": {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            return opts.allowMinus && chrs === opts.negationSymbol.back;
                        },
                        cardinality: 1,
                        placeholder: ""
                    },
                    ":": {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            var radix = "[" + Inputmask.escapeRegex(opts.radixPoint) + "]", isValid = new RegExp(radix).test(chrs);
                            return isValid && maskset.validPositions[pos] && maskset.validPositions[pos].match.placeholder === opts.radixPoint && (isValid = {
                                caret: pos + 1
                            }), isValid;
                        },
                        cardinality: 1,
                        placeholder: function(opts) {
                            return opts.radixPoint;
                        }
                    }
                },
                onUnMask: function(maskedValue, unmaskedValue, opts) {
                    if ("" === unmaskedValue && !0 === opts.nullable) return unmaskedValue;
                    var processValue = maskedValue.replace(opts.prefix, "");
                    return processValue = processValue.replace(opts.suffix, ""), processValue = processValue.replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), ""), 
                    "" !== opts.placeholder.charAt(0) && (processValue = processValue.replace(new RegExp(opts.placeholder.charAt(0), "g"), "0")), 
                    opts.unmaskAsNumber ? ("" !== opts.radixPoint && -1 !== processValue.indexOf(opts.radixPoint) && (processValue = processValue.replace(Inputmask.escapeRegex.call(this, opts.radixPoint), ".")), 
                    processValue = processValue.replace(new RegExp("^" + Inputmask.escapeRegex(opts.negationSymbol.front)), "-"), 
                    processValue = processValue.replace(new RegExp(Inputmask.escapeRegex(opts.negationSymbol.back) + "$"), ""), 
                    Number(processValue)) : processValue;
                },
                isComplete: function(buffer, opts) {
                    var maskedValue = buffer.join("");
                    if (buffer.slice().join("") !== maskedValue) return !1;
                    var processValue = maskedValue.replace(opts.prefix, "");
                    return processValue = processValue.replace(opts.suffix, ""), processValue = processValue.replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), ""), 
                    "," === opts.radixPoint && (processValue = processValue.replace(Inputmask.escapeRegex(opts.radixPoint), ".")), 
                    isFinite(processValue);
                },
                onBeforeMask: function(initialValue, opts) {
                    if (opts.isNegative = undefined, initialValue = initialValue.toString().charAt(initialValue.length - 1) === opts.radixPoint ? initialValue.toString().substr(0, initialValue.length - 1) : initialValue.toString(), 
                    "" !== opts.radixPoint && isFinite(initialValue)) {
                        var vs = initialValue.split("."), groupSize = "" !== opts.groupSeparator ? parseInt(opts.groupSize) : 0;
                        2 === vs.length && (vs[0].length > groupSize || vs[1].length > groupSize || vs[0].length <= groupSize && vs[1].length < groupSize) && (initialValue = initialValue.replace(".", opts.radixPoint));
                    }
                    var kommaMatches = initialValue.match(/,/g), dotMatches = initialValue.match(/\./g);
                    if (initialValue = dotMatches && kommaMatches ? dotMatches.length > kommaMatches.length ? (initialValue = initialValue.replace(/\./g, "")).replace(",", opts.radixPoint) : kommaMatches.length > dotMatches.length ? (initialValue = initialValue.replace(/,/g, "")).replace(".", opts.radixPoint) : initialValue.indexOf(".") < initialValue.indexOf(",") ? initialValue.replace(/\./g, "") : initialValue.replace(/,/g, "") : initialValue.replace(new RegExp(Inputmask.escapeRegex(opts.groupSeparator), "g"), ""), 
                    0 === opts.digits && (-1 !== initialValue.indexOf(".") ? initialValue = initialValue.substring(0, initialValue.indexOf(".")) : -1 !== initialValue.indexOf(",") && (initialValue = initialValue.substring(0, initialValue.indexOf(",")))), 
                    "" !== opts.radixPoint && isFinite(opts.digits) && -1 !== initialValue.indexOf(opts.radixPoint)) {
                        var decPart = initialValue.split(opts.radixPoint)[1].match(new RegExp("\\d*"))[0];
                        if (parseInt(opts.digits) < decPart.toString().length) {
                            var digitsFactor = Math.pow(10, parseInt(opts.digits));
                            initialValue = initialValue.replace(Inputmask.escapeRegex(opts.radixPoint), "."), 
                            initialValue = (initialValue = Math.round(parseFloat(initialValue) * digitsFactor) / digitsFactor).toString().replace(".", opts.radixPoint);
                        }
                    }
                    return initialValue;
                },
                canClearPosition: function(maskset, position, lvp, strict, opts) {
                    var vp = maskset.validPositions[position], canClear = vp.input !== opts.radixPoint || null !== maskset.validPositions[position].match.fn && !1 === opts.decimalProtect || vp.input === opts.radixPoint && maskset.validPositions[position + 1] && null === maskset.validPositions[position + 1].match.fn || isFinite(vp.input) || position === lvp || vp.input === opts.groupSeparator || vp.input === opts.negationSymbol.front || vp.input === opts.negationSymbol.back;
                    return !canClear || "+" !== vp.match.nativeDef && "-" !== vp.match.nativeDef || (opts.isNegative = !1), 
                    canClear;
                },
                onKeyDown: function(e, buffer, caretPos, opts) {
                    var $input = $(this);
                    if (e.ctrlKey) switch (e.keyCode) {
                      case Inputmask.keyCode.UP:
                        $input.val(parseFloat(this.inputmask.unmaskedvalue()) + parseInt(opts.step)), $input.trigger("setvalue");
                        break;

                      case Inputmask.keyCode.DOWN:
                        $input.val(parseFloat(this.inputmask.unmaskedvalue()) - parseInt(opts.step)), $input.trigger("setvalue");
                    }
                }
            },
            currency: {
                prefix: "$ ",
                groupSeparator: ",",
                alias: "numeric",
                placeholder: "0",
                autoGroup: !0,
                digits: 2,
                digitsOptional: !1,
                clearMaskOnLostFocus: !1
            },
            decimal: {
                alias: "numeric"
            },
            integer: {
                alias: "numeric",
                digits: 0,
                radixPoint: ""
            },
            percentage: {
                alias: "numeric",
                digits: 2,
                digitsOptional: !0,
                radixPoint: ".",
                placeholder: "0",
                autoGroup: !1,
                min: 0,
                max: 100,
                suffix: " %",
                allowMinus: !1
            }
        }), Inputmask;
    });
}, function(module, exports, __webpack_require__) {
    "use strict";
    var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
    "function" == typeof Symbol && Symbol.iterator;
    !function(factory) {
        __WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(0), __webpack_require__(1) ], 
        void 0 !== (__WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof (__WEBPACK_AMD_DEFINE_FACTORY__ = factory) ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__) && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__);
    }(function($, Inputmask) {
        function maskSort(a, b) {
            var maska = (a.mask || a).replace(/#/g, "9").replace(/\)/, "9").replace(/[+()#-]/g, ""), maskb = (b.mask || b).replace(/#/g, "9").replace(/\)/, "9").replace(/[+()#-]/g, ""), maskas = (a.mask || a).split("#")[0], maskbs = (b.mask || b).split("#")[0];
            return 0 === maskbs.indexOf(maskas) ? -1 : 0 === maskas.indexOf(maskbs) ? 1 : maska.localeCompare(maskb);
        }
        var analyseMaskBase = Inputmask.prototype.analyseMask;
        return Inputmask.prototype.analyseMask = function(mask, regexMask, opts) {
            function reduceVariations(masks, previousVariation, previousmaskGroup) {
                previousVariation = previousVariation || "", previousmaskGroup = previousmaskGroup || maskGroups, 
                "" !== previousVariation && (previousmaskGroup[previousVariation] = {});
                for (var variation = "", maskGroup = previousmaskGroup[previousVariation] || previousmaskGroup, i = masks.length - 1; i >= 0; i--) maskGroup[variation = (mask = masks[i].mask || masks[i]).substr(0, 1)] = maskGroup[variation] || [], 
                maskGroup[variation].unshift(mask.substr(1)), masks.splice(i, 1);
                for (var ndx in maskGroup) maskGroup[ndx].length > 500 && reduceVariations(maskGroup[ndx].slice(), ndx, maskGroup);
            }
            function rebuild(maskGroup) {
                var mask = "", submasks = [];
                for (var ndx in maskGroup) $.isArray(maskGroup[ndx]) ? 1 === maskGroup[ndx].length ? submasks.push(ndx + maskGroup[ndx]) : submasks.push(ndx + opts.groupmarker.start + maskGroup[ndx].join(opts.groupmarker.end + opts.alternatormarker + opts.groupmarker.start) + opts.groupmarker.end) : submasks.push(ndx + rebuild(maskGroup[ndx]));
                return 1 === submasks.length ? mask += submasks[0] : mask += opts.groupmarker.start + submasks.join(opts.groupmarker.end + opts.alternatormarker + opts.groupmarker.start) + opts.groupmarker.end, 
                mask;
            }
            var maskGroups = {};
            return opts.phoneCodes && (opts.phoneCodes && opts.phoneCodes.length > 1e3 && (reduceVariations((mask = mask.substr(1, mask.length - 2)).split(opts.groupmarker.end + opts.alternatormarker + opts.groupmarker.start)), 
            mask = rebuild(maskGroups)), mask = mask.replace(/9/g, "\\9")), analyseMaskBase.call(this, mask, regexMask, opts);
        }, Inputmask.extendAliases({
            abstractphone: {
                groupmarker: {
                    start: "<",
                    end: ">"
                },
                countrycode: "",
                phoneCodes: [],
                mask: function(opts) {
                    return opts.definitions = {
                        "#": Inputmask.prototype.definitions[9]
                    }, opts.phoneCodes.sort(maskSort);
                },
                keepStatic: !0,
                onBeforeMask: function(value, opts) {
                    var processedValue = value.replace(/^0{1,2}/, "").replace(/[\s]/g, "");
                    return (processedValue.indexOf(opts.countrycode) > 1 || -1 === processedValue.indexOf(opts.countrycode)) && (processedValue = "+" + opts.countrycode + processedValue), 
                    processedValue;
                },
                onUnMask: function(maskedValue, unmaskedValue, opts) {
                    return maskedValue.replace(/[()#-]/g, "");
                },
                inputmode: "tel"
            }
        }), Inputmask;
    });
}, function(module, exports, __webpack_require__) {
    "use strict";
    var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
    "function" == typeof Symbol && Symbol.iterator;
    !function(factory) {
        __WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(0), __webpack_require__(1) ], 
        void 0 !== (__WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof (__WEBPACK_AMD_DEFINE_FACTORY__ = factory) ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__) && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__);
    }(function($, Inputmask) {
        return Inputmask.extendAliases({
            Regex: {
                mask: "r",
                greedy: !1,
                repeat: "*",
                regex: null,
                regexTokens: null,
                tokenizer: /\[\^?]?(?:[^\\\]]+|\\[\S\s]?)*]?|\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9][0-9]*|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)|\((?:\?[:=!]?)?|(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??|[^.?*+^${[()|\\]+|./g,
                quantifierFilter: /[0-9]+[^,]/,
                isComplete: function(buffer, opts) {
                    return new RegExp(opts.regex, opts.casing ? "i" : "").test(buffer.join(""));
                },
                definitions: {
                    r: {
                        validator: function(chrs, maskset, pos, strict, opts) {
                            function RegexToken(isGroup, isQuantifier) {
                                this.matches = [], this.isGroup = isGroup || !1, this.isQuantifier = isQuantifier || !1, 
                                this.quantifier = {
                                    min: 1,
                                    max: 1
                                }, this.repeaterPart = void 0;
                            }
                            function validateRegexToken(token, fromGroup) {
                                var isvalid = !1;
                                fromGroup && (regexPart += "(", openGroupCount++);
                                for (var mndx = 0; mndx < token.matches.length; mndx++) {
                                    var matchToken = token.matches[mndx];
                                    if (!0 === matchToken.isGroup) isvalid = validateRegexToken(matchToken, !0); else if (!0 === matchToken.isQuantifier) {
                                        var crrntndx = $.inArray(matchToken, token.matches), matchGroup = token.matches[crrntndx - 1], regexPartBak = regexPart;
                                        if (isNaN(matchToken.quantifier.max)) {
                                            for (;matchToken.repeaterPart && matchToken.repeaterPart !== regexPart && matchToken.repeaterPart.length > regexPart.length && !(isvalid = validateRegexToken(matchGroup, !0)); ) ;
                                            (isvalid = isvalid || validateRegexToken(matchGroup, !0)) && (matchToken.repeaterPart = regexPart), 
                                            regexPart = regexPartBak + matchToken.quantifier.max;
                                        } else {
                                            for (var i = 0, qm = matchToken.quantifier.max - 1; i < qm && !(isvalid = validateRegexToken(matchGroup, !0)); i++) ;
                                            regexPart = regexPartBak + "{" + matchToken.quantifier.min + "," + matchToken.quantifier.max + "}";
                                        }
                                    } else if (void 0 !== matchToken.matches) for (var k = 0; k < matchToken.length && !(isvalid = validateRegexToken(matchToken[k], fromGroup)); k++) ; else {
                                        var testExp;
                                        if ("[" == matchToken.charAt(0)) {
                                            testExp = regexPart, testExp += matchToken;
                                            for (j = 0; j < openGroupCount; j++) testExp += ")";
                                            isvalid = (exp = new RegExp("^(" + testExp + ")$", opts.casing ? "i" : "")).test(bufferStr);
                                        } else for (var l = 0, tl = matchToken.length; l < tl; l++) if ("\\" !== matchToken.charAt(l)) {
                                            testExp = regexPart, testExp = (testExp += matchToken.substr(0, l + 1)).replace(/\|$/, "");
                                            for (var j = 0; j < openGroupCount; j++) testExp += ")";
                                            var exp = new RegExp("^(" + testExp + ")$", opts.casing ? "i" : "");
                                            if (isvalid = exp.test(bufferStr)) break;
                                        }
                                        regexPart += matchToken;
                                    }
                                    if (isvalid) break;
                                }
                                return fromGroup && (regexPart += ")", openGroupCount--), isvalid;
                            }
                            var bufferStr, groupToken, cbuffer = maskset.buffer.slice(), regexPart = "", isValid = !1, openGroupCount = 0;
                            null === opts.regexTokens && function() {
                                var match, m, currentToken = new RegexToken(), opengroups = [];
                                for (opts.regexTokens = []; match = opts.tokenizer.exec(opts.regex); ) switch ((m = match[0]).charAt(0)) {
                                  case "(":
                                    opengroups.push(new RegexToken(!0));
                                    break;

                                  case ")":
                                    groupToken = opengroups.pop(), opengroups.length > 0 ? opengroups[opengroups.length - 1].matches.push(groupToken) : currentToken.matches.push(groupToken);
                                    break;

                                  case "{":
                                  case "+":
                                  case "*":
                                    var quantifierToken = new RegexToken(!1, !0), mq = (m = m.replace(/[{}]/g, "")).split(","), mq0 = isNaN(mq[0]) ? mq[0] : parseInt(mq[0]), mq1 = 1 === mq.length ? mq0 : isNaN(mq[1]) ? mq[1] : parseInt(mq[1]);
                                    if (quantifierToken.quantifier = {
                                        min: mq0,
                                        max: mq1
                                    }, opengroups.length > 0) {
                                        var matches = opengroups[opengroups.length - 1].matches;
                                        (match = matches.pop()).isGroup || ((groupToken = new RegexToken(!0)).matches.push(match), 
                                        match = groupToken), matches.push(match), matches.push(quantifierToken);
                                    } else (match = currentToken.matches.pop()).isGroup || ((groupToken = new RegexToken(!0)).matches.push(match), 
                                    match = groupToken), currentToken.matches.push(match), currentToken.matches.push(quantifierToken);
                                    break;

                                  default:
                                    opengroups.length > 0 ? opengroups[opengroups.length - 1].matches.push(m) : currentToken.matches.push(m);
                                }
                                currentToken.matches.length > 0 && opts.regexTokens.push(currentToken);
                            }(), cbuffer.splice(pos, 0, chrs), bufferStr = cbuffer.join("");
                            for (var i = 0; i < opts.regexTokens.length; i++) {
                                var regexToken = opts.regexTokens[i];
                                if (isValid = validateRegexToken(regexToken, regexToken.isGroup)) break;
                            }
                            return isValid;
                        },
                        cardinality: 1
                    }
                }
            }
        }), Inputmask;
    });
}, function(module, exports, __webpack_require__) {
    "use strict";
    var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__, _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
        return typeof obj;
    } : function(obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
    !function(factory) {
        __WEBPACK_AMD_DEFINE_ARRAY__ = [ __webpack_require__(2), __webpack_require__(1) ], 
        void 0 !== (__WEBPACK_AMD_DEFINE_RESULT__ = "function" == typeof (__WEBPACK_AMD_DEFINE_FACTORY__ = factory) ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__) && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__);
    }(function($, Inputmask) {
        return void 0 === $.fn.inputmask && ($.fn.inputmask = function(fn, options) {
            var nptmask, input = this[0];
            if (void 0 === options && (options = {}), "string" == typeof fn) switch (fn) {
              case "unmaskedvalue":
                return input && input.inputmask ? input.inputmask.unmaskedvalue() : $(input).val();

              case "remove":
                return this.each(function() {
                    this.inputmask && this.inputmask.remove();
                });

              case "getemptymask":
                return input && input.inputmask ? input.inputmask.getemptymask() : "";

              case "hasMaskedValue":
                return !(!input || !input.inputmask) && input.inputmask.hasMaskedValue();

              case "isComplete":
                return !input || !input.inputmask || input.inputmask.isComplete();

              case "getmetadata":
                return input && input.inputmask ? input.inputmask.getmetadata() : void 0;

              case "setvalue":
                $(input).val(options), input && void 0 === input.inputmask && $(input).triggerHandler("setvalue");
                break;

              case "option":
                if ("string" != typeof options) return this.each(function() {
                    if (void 0 !== this.inputmask) return this.inputmask.option(options);
                });
                if (input && void 0 !== input.inputmask) return input.inputmask.option(options);
                break;

              default:
                return options.alias = fn, nptmask = new Inputmask(options), this.each(function() {
                    nptmask.mask(this);
                });
            } else {
                if ("object" == (void 0 === fn ? "undefined" : _typeof(fn))) return nptmask = new Inputmask(fn), 
                void 0 === fn.mask && void 0 === fn.alias ? this.each(function() {
                    if (void 0 !== this.inputmask) return this.inputmask.option(fn);
                    nptmask.mask(this);
                }) : this.each(function() {
                    nptmask.mask(this);
                });
                if (void 0 === fn) return this.each(function() {
                    (nptmask = new Inputmask(options)).mask(this);
                });
            }
        }), $.fn.inputmask;
    });
} ]);
!function (a, b, c, d) { "use strict"; function e(a) { return a.getMonth() + 12 * a.getFullYear() } function f(a) { return Math.floor(a / 12) } function g() { a(this).addClass(z) } function h(a, b) { return a[b ? "on" : "off"]("mousenter mouseout", g).toggleClass(z, b) } function i(a, b, c) { return (!b || a >= b) && (!c || c >= a) } function j(b, c) { if (null === c) return c; if (c instanceof d) return e(c); if (a.isNumeric(c)) return e(new d) + parseInt(c, 10); var f = b._parseMonth(c); return f ? e(f) : l(c) } function k(a, b) { return L(b.options[a] || K, b.element[0]) } function l(b, c) { var f = a.trim(b); f = f.replace(/y/i, '":"y"'), f = f.replace(/m/i, '":"m"'); try { var g = JSON.parse('{"' + f.replace(/ /g, ',"') + "}"), h = {}; for (var i in g) h[g[i]] = i; var j = e(new d); return j += parseInt(h.m, 10) || 0, j + 12 * (parseInt(h.y, 10) || 0) } catch (k) { return !1 } } function m(b) { return a('<span id="MonthPicker_Button_' + this.id + '" class="month-picker-open-button">' + b.i18n.buttonText + "</span>").jqueryUIButton({ text: !1, icons: { primary: b.ButtonIcon } }) } function n(a, b) { a.jqueryUIButton("option", { icons: { primary: "ui-icon-circle-triangle-" + (b ? "w" : "e") } }) } function o(a) { return !a.is("input") } function p(b, c) { function d() { j = setTimeout(e, 175) } function e() { j = null, l = a("span", b).animate({ opacity: .45 }, k, f) } function f() { i = l.text(), l.animate({ opacity: 1 }, k).text(c) } function g() { j ? clearTimeout(j) : l = a("span", b).animate({ opacity: .45 }, k, h) } function h() { l.text(i).animate({ opacity: 1 }, k) } var i, j, k = 125, l = a(); b.on("mouseenter" + t + "h", d), b.on("mouseleave" + t + "h", g), b.data(v, function () { clearTimeout(j), l.stop().css({ opacity: 1 }), b.off(t + "h") }) } function q(a, b) { var c = a.data("ui-button"); c.option("disabled") !== b && c.option("disabled", b) } var r = "MonthPicker Error: "; if (!(a && a.ui && a.ui.button && a.ui.datepicker)) return void alert(r + "The jQuery UI button and datepicker plug-ins must be loaded."); a.widget.bridge("jqueryUIButton", a.ui.button); var s = a.fx.speeds, t = ".MonthPicker", u = "month-year-input", v = "month-picker-clear-hint", w = ".ui-button-icon-primary", x = "month-picker-disabled", y = "ui-state-highlight", z = "ui-state-active", A = "ui-state-default", B = { my: "left top+1", at: "left bottom" }, C = { my: "right top+1", at: "right bottom" }, D = r + "The jQuery UI position plug-in must be loaded.", E = r + "Unsupported % option value, supported values are: ", F = r + '"_" is not a valid %Month value.', G = null, H = !!a.ui.position, I = { Animation: ["slideToggle", "fadeToggle", "none"], ShowAnim: ["fadeIn", "slideDown", "none"], HideAnim: ["fadeOut", "slideUp", "none"] }, J = { ValidationErrorMessage: "_createValidationMessage", Disabled: "_setDisabledState", ShowIcon: "_updateButton", Button: "_updateButton", ShowOn: "_updateFieldEvents", IsRTL: "_setRTL", AltFormat: "_updateAlt", AltField: "_updateAlt", StartYear: "_setPickerYear", MinMonth: "_setMinMonth", MaxMonth: "_setMaxMonth", SelectedMonth: "_setSelectedMonth" }, K = a.noop, L = a.proxy, M = a.datepicker, N = "click" + t; a.MonthPicker = { VERSION: "3.0.0", i18n: { year: "Year", prevYear: "Previous Year", nextYear: "Next Year", next12Years: "Jump Forward 12 Years", prev12Years: "Jump Back 12 Years", nextLabel: "Next", prevLabel: "Prev", buttonText: "Open Month Chooser", jumpYears: "Jump Years", backTo: "Back to", months: ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."] } }; var O = '<div class="ui-widget-header month-picker-header ui-corner-all"><table class="month-picker-year-table"><tr><td class="month-picker-previous"><a /></td><td class="month-picker-title"><a /></td><td class="month-picker-next"><a /></td></tr></table></div><div><table class="month-picker-month-table" /></div>'; a.widget("KidSysco.MonthPicker", { options: { i18n: {}, IsRTL: !1, Position: null, StartYear: null, ShowIcon: !0, UseInputMask: !1, ValidationErrorMessage: null, Disabled: !1, MonthFormat: "mm/yy", Animation: "fadeToggle", ShowAnim: null, HideAnim: null, ShowOn: null, MinMonth: null, MaxMonth: null, Duration: "normal", Button: m, ButtonIcon: "ui-icon-calculator" }, _monthPickerButton: a(), _validationMessage: a(), _selectedBtn: a(), _destroy: function () { var b = this.element; a.mask && this.options.UseInputMask && (b.unmask(), this.GetSelectedDate() || b.val("")), b.removeClass(u).off(t), a(c).off(t + this.uuid), this._monthPickerMenu.remove(); var d = this._monthPickerButton.off(N); this._removeOldBtn && d.remove(), this._validationMessage.remove(), G === this && (G = null) }, _setOption: function (b, c) { switch (b) { case "i18n": c = a.extend({}, c); break; case "Position": if (!H) return void alert(D); break; case "MonthFormat": var d = this.GetSelectedDate(); d && this.element.val(this.FormatMonth(d, c)) }return b in I && -1 === a.inArray(c, I[b]) ? void alert(E.replace(/%/, b) + I[b]) : (this._super(b, c), void (J[b] ? this[J[b]](c) : 0)) }, _create: function () { var b = this.element, e = this.options, g = b.attr("type"); if (!b.is("input,div,span") || "text" !== g && "month" !== g && void 0 !== g) { var h = r + "MonthPicker can only be called on text or month inputs."; return alert(h + " \n\nSee (developer tools) for more details."), console.error(h + "\n Caused by:"), console.log(b[0]), !1 } if (!a.mask && e.UseInputMask) return alert(r + "The UseInputMask option requires the Input Mask Plugin. Get it from digitalbush.com"), !1; if (null !== e.Position && !H) return alert(D), !1; for (var i in I) if (null !== e[i] && -1 === a.inArray(e[i], I[i])) return alert(E.replace(/%/, i) + I[i]), !1; this._isMonthInputType = "month" === b.attr("type"), this._isMonthInputType && (this.options.MonthFormat = this.MonthInputFormat, b.css("width", "auto")); var k = this._monthPickerMenu = a('<div id="MonthPicker_' + b[0].id + '" class="month-picker ui-widget ui-widget-content ui-corner-all"></div>').hide(), l = o(b); a(O).appendTo(k), k.appendTo(l ? b : c.body), this._titleButton = a(".month-picker-title", k).click(L(this._showYearsClickHandler, this)).find("a").jqueryUIButton().removeClass(A), this._applyJumpYearsHint(), this._createValidationMessage(), this._prevButton = a(".month-picker-previous>a", k).jqueryUIButton({ text: !1 }).removeClass(A), this._nextButton = a(".month-picker-next>a", k).jqueryUIButton({ text: !1 }).removeClass(A), this._setRTL(e.IsRTL), a(w, this._nextButton).text(this._i18n("nextLabel")), a(w, this._prevButton).text(this._i18n("prevLabel")); for (var m = a(".month-picker-month-table", k), n = 0; 12 > n; n++) { var p = n % 3 ? p : a("<tr />").appendTo(m); p.append('<td><a class="button-' + (n + 1) + '" /></td>') } this._buttons = a("a", m).jqueryUIButton(), k.on(N, function (a) { return !1 }); var q = this, s = "Month"; a.each(["Min", "Max"], function (a, b) { q["_set" + b + s] = function (a) { (q["_" + b + s] = j(q, a)) === !1 && alert(F.replace(/%/, b).replace(/_/, a)) }, q._setOption(b + s, q.options[b + s]) }); var t = e.SelectedMonth; if (void 0 !== t) { var v = j(this, t); b.val(this._formatMonth(new d(f(v), v % 12, 1))) } this._updateAlt(), this._setUseInputMask(), this._setDisabledState(), this.Destroy = this.destroy, l ? this.Open() : (b.addClass(u), b.change(L(this._updateAlt, this))) }, GetSelectedDate: function () { return this._parseMonth() }, GetSelectedYear: function () { var a = this.GetSelectedDate(); return a ? a.getFullYear() : NaN }, GetSelectedMonth: function () { var a = this.GetSelectedDate(); return a ? a.getMonth() + 1 : NaN }, Validate: function () { var a = this.GetSelectedDate(); return null === this.options.ValidationErrorMessage || this.options.Disabled || this._validationMessage.toggle(!a), a }, GetSelectedMonthYear: function () { var a = this.Validate(); return a ? a.getMonth() + 1 + "/" + a.getFullYear() : null }, Disable: function () { this._setOption("Disabled", !0) }, Enable: function () { this._setOption("Disabled", !1) }, ClearAllCallbacks: function () { for (var a in this.options) 0 === a.indexOf("On") && (this.options[a] = K) }, Clear: function () { this.element.val(""), this._validationMessage.hide() }, Toggle: function (a) { return this._visible ? this.Close(a) : this.Open(a) }, Open: function (b) { var d = this.element, e = this.options; if (!e.Disabled && !this._visible) { if (b = b || a.Event(), k("OnBeforeMenuOpen", this)(b) === !1 || b.isDefaultPrevented()) return !1; this._visible = !0, this._ajustYear(e); var f = this._monthPickerMenu; if (this._showMonths(), o(d)) f.css("position", "static").show(), k("OnAfterMenuOpen", this)(); else { G && G.Close(b), G = this, a(c).on(N + this.uuid, L(this.Close, this)).on("keydown" + t + this.uuid, L(this._keyDown, this)), d.off("blur" + t).focus(); var g = e.ShowAnim || e.Animation, h = "none" === g; f[h ? "fadeIn" : g]({ duration: h ? 0 : this._duration(), start: L(this._position, this, f), complete: k("OnAfterMenuOpen", this) }) } } return !1 }, Close: function (b) { var d = this.element; if (!o(d) && this._visible) { var e = this._monthPickerMenu, f = this.options; if (b = b || a.Event(), k("OnBeforeMenuClose", this)(b) === !1 || b.isDefaultPrevented()) return; this._backToYear && (this._applyJumpYearsHint(), this._backToYear = 0), this._visible = !1, G = null, a(c).off("keydown" + t + this.uuid).off(N + this.uuid), this.Validate(), d.on("blur" + t, L(this.Validate, this)); var g = k("OnAfterMenuClose", this), h = f.HideAnim || f.Animation; "none" === h ? e.hide(0, g) : e[h](this._duration(), g) } }, MonthInputFormat: "yy-mm", ParseMonth: function (a, b) { try { return M.parseDate("dd" + b, "01" + a) } catch (c) { return null } }, FormatMonth: function (a, b) { try { return M.formatDate(b, a) || null } catch (c) { return null } }, _setSelectedMonth: function (a) { var b = j(this, a), c = this.element; b ? c.val(this._formatMonth(new d(f(b), b % 12, 1))) : c.val(""), this._ajustYear(this.options), this._showMonths() }, _applyJumpYearsHint: function () { p(this._titleButton, this._i18n("jumpYears")) }, _i18n: function (b) { return this.options.i18n[b] || a.MonthPicker.i18n[b] }, _parseMonth: function (a, b) { return this.ParseMonth(a || this.element.val(), b || this.options.MonthFormat) }, _formatMonth: function (a, b) { return this.FormatMonth(a || this._parseMonth(), b || this.options.MonthFormat) }, _updateButton: function () { var a = this.options.Disabled; this._createButton(); var b = this._monthPickerButton; try { b.jqueryUIButton("option", "disabled", a) } catch (c) { b.filter("button,input").prop("disabled", a) } this._updateFieldEvents() }, _createButton: function () { var b = this.element, d = this.options; if (!o(b)) { var e = this._monthPickerButton.off(t), f = d.ShowIcon ? d.Button : !1; if (a.isFunction(f)) { var g = a.extend(!0, { i18n: a.extend(!0, {}, a.MonthPicker.i18n) }, this.options); f = f.call(b[0], g) } var h = !1; this._monthPickerButton = (f instanceof a ? f : a(f)).each(function () { a.contains(c.body, this) || (h = !0, a(this).insertAfter(b)) }).on(N, L(this.Toggle, this)), this._removeOldBtn && e.remove(), this._removeOldBtn = h } }, _updateFieldEvents: function () { var a = N + " focus" + t; this.element.off(a), "both" !== this.options.ShowOn && this._monthPickerButton.length || this.element.on(a, L(this.Open, this)) }, _createValidationMessage: function () { var b = this.options.ValidationErrorMessage, c = this.element; if (-1 === a.inArray(b, [null, ""])) { var d = a('<span id="MonthPicker_Validation_' + c[0].id + '" class="month-picker-invalid-message">' + b + "</span>"), e = this._monthPickerButton; this._validationMessage = d.insertAfter(e.length ? e : c), c.on("blur" + t, L(this.Validate, this)) } else this._validationMessage.remove() }, _setRTL: function (a) { n(this._prevButton.css("float", a ? "right" : "left"), !a), n(this._nextButton.css("float", a ? "left" : "right"), a) }, _keyDown: function (a) { switch (a.keyCode) { case 13: this.element.val() || this._chooseMonth((new d).getMonth() + 1), this.Close(a); break; case 27: case 9: this.Close(a) } }, _duration: function () { var b = this.options.Duration; return a.isNumeric(b) ? b : b in s ? s[b] : s._default }, _position: H ? function (b) { var c = this.options.IsRTL ? C : B, d = a.extend(c, this.options.Position); return b.position(a.extend({ of: this.element }, d)) } : function (a) { var b = this.element, c = { top: b.offset().top + b.height() + 7 + "px" }; return this.options.IsRTL ? c.left = b.offset().left - a.width() + b.width() + 7 + "px" : c.left = b.offset().left + "px", a.css(c) }, _setUseInputMask: function () { if (!this._isMonthInputType) try { this.options.UseInputMask ? this.element.mask(this._formatMonth(new d).replace(/\d/g, 9)) : this.element.unmask() } catch (a) { } }, _setDisabledState: function () { var a = this.options.Disabled, b = this.element; b[0].disabled = a, b.toggleClass(x, a), a && this._validationMessage.hide(), this.Close(), this._updateButton(), k("OnAfterSetDisabled", this)(a) }, _getPickerYear: function () { return this._pickerYear }, _setPickerYear: function (a) { this._pickerYear = a || (new d).getFullYear(), this._titleButton.jqueryUIButton({ label: this._i18n("year") + " " + this._pickerYear }) }, _updateAlt: function (b, c) { var d = a(this.options.AltField); d.length && d.val(this._formatMonth(c, this.options.AltFormat)) }, _chooseMonth: function (b) { var c = this._getPickerYear(), e = new d(c, b - 1); this.element.val(this._formatMonth(e)).blur(), this._updateAlt(0, e), h(this._selectedBtn, !1), this._selectedBtn = h(a(this._buttons[b - 1]), !0), k("OnAfterChooseMonth", this)(e) }, _chooseYear: function (a) { this._backToYear = 0, this._setPickerYear(a), this._buttons.removeClass(y), this._showMonths(), this._applyJumpYearsHint(), k("OnAfterChooseYear", this)() }, _showMonths: function () { var b = this._i18n("months"); this._prevButton.attr("title", this._i18n("prevYear")).off(N).on(N, L(this._addToYear, this, -1)), this._nextButton.attr("title", this._i18n("nextYear")).off(N).on(N, L(this._addToYear, this, 1)), this._buttons.off(t); var c = this, d = L(c._onMonthClick, c); a.each(b, function (b, e) { a(c._buttons[b]).on(N, { month: b + 1 }, d).jqueryUIButton("option", "label", e) }), this._decorateButtons() }, _showYearsClickHandler: function () { if (this._buttons.removeClass(y), this._backToYear) this._setPickerYear(this._backToYear), this._applyJumpYearsHint(), this._showMonths(), this._backToYear = 0; else { this._backToYear = this._getPickerYear(), this._showYears(); var a = this._i18n("backTo") + " " + this._getPickerYear(); this._titleButton.jqueryUIButton({ label: a }).data(v)(), k("OnAfterChooseYears", this)() } }, _showYears: function () { var b = this._getPickerYear(), c = -4, e = b + c, g = 12, j = (new d).getFullYear(), k = this._MinMonth, l = this._MaxMonth, m = k ? f(k) : 0, n = l ? f(l) : 0; this._prevButton.attr("title", this._i18n("prev12Years")).off(N).on(N, L(this._addToYears, this, -g)), this._nextButton.attr("title", this._i18n("next12Years")).off(N).on(N, L(this._addToYears, this, g)), q(this._prevButton, m && m > e - 1), q(this._nextButton, n && e + 12 - 1 > n), this._buttons.off(t), h(this._selectedBtn, !1); for (var o = this.GetSelectedYear(), p = L(this._onYearClick, this), r = i(j, m, n), s = i(o, m, n), u = 0; 12 > u; u++) { var v = b + c, w = a(this._buttons[u]).jqueryUIButton({ disabled: !i(v, m, n), label: v }).toggleClass(y, v === j && r).on(N, { year: v }, p); s && o && o === v && (this._selectedBtn = h(w, !0)), c++ } }, _onMonthClick: function (a) { this._chooseMonth(a.data.month), this.Close(a) }, _onYearClick: function (a) { this._chooseYear(a.data.year) }, _addToYear: function (a) { this._setPickerYear(this._getPickerYear() + a), this.element.focus(), this._decorateButtons(), k("OnAfter" + (a > 0 ? "Next" : "Previous") + "Year", this)() }, _addToYears: function (a) { this._pickerYear = this._getPickerYear() + a, this._showYears(), this.element.focus(), k("OnAfter" + (a > 0 ? "Next" : "Previous") + "Years", this)() }, _ajustYear: function (a) { var b = a.StartYear || this.GetSelectedYear() || (new d).getFullYear(); null !== this._MinMonth && (b = Math.max(f(this._MinMonth), b)), null !== this._MaxMonth && (b = Math.min(f(this._MaxMonth), b)), this._setPickerYear(b) }, _decorateButtons: function () { var b = this._getPickerYear(), c = e(new d), g = this._MinMonth, j = this._MaxMonth; h(this._selectedBtn, !1); var k = this.GetSelectedDate(), l = i(k ? e(k) : null, g, j); k && k.getFullYear() === b && (this._selectedBtn = h(a(this._buttons[k.getMonth()]), l)), q(this._prevButton, g && b == f(g)), q(this._nextButton, j && b == f(j)); for (var m = 0; 12 > m; m++) { var n = 12 * b + m, o = i(n, g, j); a(this._buttons[m]).jqueryUIButton({ disabled: !o }).toggleClass(y, o && n == c) } } }) }(jQuery, window, document, Date);
/*rateYo V2.3.2, A simple and flexible star rating plugin
prashanth pamidi (https://github.com/prrashi)*/
!function (a) { "use strict"; function b() { var a = !1; return function (b) { (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(b) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(b.substr(0, 4))) && (a = !0) }(navigator.userAgent || navigator.vendor || window.opera), a } function c(a, b, c) { return a === b ? a = b : a === c && (a = c), a } function d(a, b, c) { if (!(a >= b && a <= c)) throw Error("Invalid Rating, expected value between " + b + " and " + c); return a } function e(a) { return void 0 !== a } function f(a, b, c) { var d = c / 100 * (b - a); return d = Math.round(a + d).toString(16), 1 === d.length && (d = "0" + d), d } function g(a, b, c) { if (!a || !b) return null; c = e(c) ? c : 0, a = q(a), b = q(b); var d = f(a.r, b.r, c), g = f(a.b, b.b, c); return "#" + d + f(a.g, b.g, c) + g } function h(f, i) { function k(a) { e(a) || (a = i.rating), Z = a; var b = a / P, c = b * R; b > 1 && (c += (Math.ceil(b) - 1) * T), r(i.ratedFill), c = i.rtl ? 100 - c : c, c < 0 ? c = 0 : c > 100 && (c = 100), X.css("width", c + "%") } function l() { U = Q * i.numStars + S * (i.numStars - 1), R = Q / U * 100, T = S / U * 100, f.width(U), k() } function n(a) { var b = i.starWidth = a; return Q = window.parseFloat(i.starWidth.replace("px", "")), W.find("svg").attr({ width: i.starWidth, height: b }), X.find("svg").attr({ width: i.starWidth, height: b }), l(), f } function p(a) { return i.spacing = a, S = parseFloat(i.spacing.replace("px", "")), W.find("svg:not(:first-child)").css({ "margin-left": a }), X.find("svg:not(:first-child)").css({ "margin-left": a }), l(), f } function q(a) { return i.normalFill = a, (i.rtl ? X : W).find("svg").attr({ fill: i.normalFill }), f } function r(a) { if (i.multiColor) { var b = Z - Y, c = b / i.maxValue * 100, d = i.multiColor || {}; a = g(d.startColor || o.startColor, d.endColor || o.endColor, c) } else _ = a; return i.ratedFill = a, (i.rtl ? W : X).find("svg").attr({ fill: i.ratedFill }), f } function s(a) { a = !!a, i.rtl = a, q(i.normalFill), k() } function t(a) { i.multiColor = a, r(a ? a : _) } function u(b) { i.numStars = b, P = i.maxValue / i.numStars, W.empty(), X.empty(); for (var c = 0; c < i.numStars; c++)W.append(a(i.starSvg || m)), X.append(a(i.starSvg || m)); return n(i.starWidth), q(i.normalFill), p(i.spacing), k(), f } function v(a) { return i.maxValue = a, P = i.maxValue / i.numStars, i.rating > a && C(a), k(), f } function w(a) { return i.precision = a, C(i.rating), f } function x(a) { return i.halfStar = a, f } function y(a) { return i.fullStar = a, f } function z(a) { var b = a % P, c = P / 2, d = i.halfStar, e = i.fullStar; return e || d ? (e || d && b > c ? a += P - b : (a -= b, b > 0 && (a += c)), a) : a } function A(a) { var b = W.offset(), c = b.left, d = c + W.width(), e = i.maxValue, f = a.pageX, g = 0; if (f < c) g = Y; else if (f > d) g = e; else { var h = (f - c) / (d - c); if (S > 0) { h *= 100; for (var j = h; j > 0;)j > R ? (g += P, j -= R + T) : (g += j / R * P, j = 0) } else g = h * i.maxValue; g = z(g) } return i.rtl && (g = e - g), parseFloat(g) } function B(a) { return i.readOnly = a, f.attr("readonly", !0), N(), a || (f.removeAttr("readonly"), M()), f } function C(a) { var b = a, e = i.maxValue; return "string" == typeof b && ("%" === b[b.length - 1] && (b = b.substr(0, b.length - 1), e = 100, v(e)), b = parseFloat(b)), d(b, Y, e), b = parseFloat(b.toFixed(i.precision)), c(parseFloat(b), Y, e), i.rating = b, k(), $ && f.trigger("rateyo.set", { rating: b }), f } function D(a) { return i.onInit = a, f } function E(a) { return i.onSet = a, f } function F(a) { return i.onChange = a, f } function G(a) { var b = A(a).toFixed(i.precision), d = i.maxValue; b = c(parseFloat(b), Y, d), k(b), f.trigger("rateyo.change", { rating: b }) } function H() { b() || (k(), f.trigger("rateyo.change", { rating: i.rating })) } function I(a) { var b = A(a).toFixed(i.precision); b = parseFloat(b), O.rating(b) } function J(a, b) { i.onInit && "function" == typeof i.onInit && i.onInit.apply(this, [b.rating, O]) } function K(a, b) { i.onChange && "function" == typeof i.onChange && i.onChange.apply(this, [b.rating, O]) } function L(a, b) { i.onSet && "function" == typeof i.onSet && i.onSet.apply(this, [b.rating, O]) } function M() { f.on("mousemove", G).on("mouseenter", G).on("mouseleave", H).on("click", I).on("rateyo.init", J).on("rateyo.change", K).on("rateyo.set", L) } function N() { f.off("mousemove", G).off("mouseenter", G).off("mouseleave", H).off("click", I).off("rateyo.init", J).off("rateyo.change", K).off("rateyo.set", L) } this.node = f.get(0); var O = this; f.empty().addClass("jq-ry-container"); var P, Q, R, S, T, U, V = a("<div/>").addClass("jq-ry-group-wrapper").appendTo(f), W = a("<div/>").addClass("jq-ry-normal-group").addClass("jq-ry-group").appendTo(V), X = a("<div/>").addClass("jq-ry-rated-group").addClass("jq-ry-group").appendTo(V), Y = 0, Z = i.rating, $ = !1, _ = i.ratedFill; this.rating = function (a) { return e(a) ? (C(a), f) : i.rating }, this.destroy = function () { return i.readOnly || N(), h.prototype.collection = j(f.get(0), this.collection), f.removeClass("jq-ry-container").children().remove(), f }, this.method = function (a) { if (!a) throw Error("Method name not specified!"); if (!e(this[a])) throw Error("Method " + a + " doesn't exist!"); var b = Array.prototype.slice.apply(arguments, []), c = b.slice(1); return this[a].apply(this, c) }, this.option = function (a, b) { if (!e(a)) return i; var c; switch (a) { case "starWidth": c = n; break; case "numStars": c = u; break; case "normalFill": c = q; break; case "ratedFill": c = r; break; case "multiColor": c = t; break; case "maxValue": c = v; break; case "precision": c = w; break; case "rating": c = C; break; case "halfStar": c = x; break; case "fullStar": c = y; break; case "readOnly": c = B; break; case "spacing": c = p; break; case "rtl": c = s; break; case "onInit": c = D; break; case "onSet": c = E; break; case "onChange": c = F; break; default: throw Error("No such option as " + a) }return e(b) ? c(b) : i[a] }, u(i.numStars), B(i.readOnly), i.rtl && s(i.rtl), this.collection.push(this), this.rating(i.rating, !0), $ = !0, f.trigger("rateyo.init", { rating: i.rating }) } function i(b, c) { var d; return a.each(c, function () { if (b === this.node) return d = this, !1 }), d } function j(b, c) { return a.each(c, function (a) { if (b === this.node) { var d = c.slice(0, a), e = c.slice(a + 1, c.length); return c = d.concat(e), !1 } }), c } function k(b) { var c = h.prototype.collection, d = a(this); if (0 === d.length) return d; var e = Array.prototype.slice.apply(arguments, []); if (0 === e.length) b = e[0] = {}; else { if (1 !== e.length || "object" != typeof e[0]) { if (e.length >= 1 && "string" == typeof e[0]) { var f = e[0], g = e.slice(1), j = []; return a.each(d, function (a, b) { var d = i(b, c); if (!d) throw Error("Trying to set options before even initialization"); var e = d[f]; if (!e) throw Error("Method " + f + " does not exist!"); var h = e.apply(d, g); j.push(h) }), j = 1 === j.length ? j[0] : j } throw Error("Invalid Arguments") } b = e[0] } return b = a.extend({}, n, b), a.each(d, function () { var d = i(this, c); if (d) return d; var e = a(this), f = {}, g = a.extend({}, b); return a.each(e.data(), function (a, b) { if (0 === a.indexOf("rateyo")) { var c = a.replace(/^rateyo/, ""); c = c[0].toLowerCase() + c.slice(1), f[c] = b, delete g[c] } }), new h(a(this), a.extend({}, f, g)) }) } function l() { return k.apply(this, Array.prototype.slice.apply(arguments, [])) } var m = '<?xml version="1.0" encoding="utf-8"?><svg version="1.1"xmlns="http://www.w3.org/2000/svg"viewBox="0 12.705 512 486.59"x="0px" y="0px"xml:space="preserve"><polygon points="256.814,12.705 317.205,198.566 512.631,198.566 354.529,313.435 414.918,499.295 256.814,384.427 98.713,499.295 159.102,313.435 1,198.566 196.426,198.566 "/></svg>', n = { starWidth: "32px", normalFill: "gray", ratedFill: "#f39c12", numStars: 5, maxValue: 5, precision: 1, rating: 0, fullStar: !1, halfStar: !1, readOnly: !1, spacing: "0px", rtl: !1, multiColor: null, onInit: null, onChange: null, onSet: null, starSvg: null }, o = { startColor: "#c0392b", endColor: "#f1c40f" }, p = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i, q = function (a) { if (!p.test(a)) return null; var b = p.exec(a); return { r: parseInt(b[1], 16), g: parseInt(b[2], 16), b: parseInt(b[3], 16) } }; h.prototype.collection = [], window.RateYo = h, a.fn.rateYo = l }(window.jQuery);
//# sourceMappingURL=jquery.rateyo.min.js.map

(function ($) {

    $.fn.fileUploader = function (options) {

        // Default settings
        let defaults = {
            preloaded: [],
            maxSize: 2,
            maxFiles: 1,
            fileTypes: 'image/jpeg,image/png,image/jpg'
        };

        // Get instance
        let plugin = this;
        let $inrContainer;
        let newfilearray = [];
        let filedel = [];
        let preloadedfile = 0;
        let refidArr = [];
        let filesView = [];

        // Set empty settings
        plugin.settings = {};

        // Plugin constructor
        plugin.init = function () {

            // Define settings
            plugin.settings = $.extend(plugin.settings, defaults, options);
            filesView = JSON.parse(plugin.settings.fileCtrl.DataVals.F);
            createFileviewer();
            // Run through the elements
            plugin.each(function (i, wrapper) {

                // Create the container
                let $container = createContainer();

                // Append the container to the wrapper
                $(wrapper).append($container);

                // Set some bindings
                $container.on("dragover", fileDragHover.bind($container));
                $container.on("dragleave", fileDragHover.bind($container));
                $container.on("drop", fileSelectHandler.bind($container));
            });

        };

        this.createPreloaded = function (p1) {
            this.clearFiles();
            if (p1 !== null && p1 !== "") {
                //let preloaded = [];
                let refidArr = p1.split(',');
                for (let j = 0; j < refidArr.length; j++) {
                    let indx = filesView.findIndex(x => x.FileRefId == refidArr[j]);
                    plugin.settings.preloaded.push({ id: refidArr[j], cntype: filesView[indx].FileCategory, name: filesView[indx].FileName, refid: refidArr[j] });
                }

            }
            // plugin.settings.preloaded = prelod;
            let $filecont = $(`#${plugin.settings.fileCtrl.EbSid}_SFUP`);
            $filecont.addClass('has-files');
            let $uploadedContainer = $filecont.find('.uploaded');


            for (let i = 0; i < plugin.settings.preloaded.length; i++) {
                $uploadedContainer.append(createImg(plugin.settings.preloaded[i], plugin.settings.preloaded[i].id, plugin.settings.preloaded[i].cntype, true, plugin.settings.preloaded[i].refid));
                setRefid(plugin.settings.preloaded[i].refid, $inrContainer);
                preloadedfile++;
                //$(".trggrpreview").on("click", viewFilesFn);
            }
        };

        this.clearFiles = function () {
            preloadedfile = 0;
            refidArr = [];
            plugin.settings.preloaded = [];
            $(`#${plugin.settings.fileCtrl.EbSid}_bindfn`).val("");
            let $contdiv = $(`#${plugin.settings.fileCtrl.EbSid}_SFUP`).find('.uploaded').empty();
            $contdiv.removeClass('has-files');
            return;

        };



        //   let dataTransfer = new DataTransfer();

        let createContainer = function () {

            // Create the image uploader container
            let $flcontainer = $("#" + plugin.settings.fileCtrl.EbSid + "_SFUP"),

                // Create the input type file and append it to the container
                $input = $('<input>', {
                    type: 'file',
                    id: `${plugin.settings.fileCtrl.EbSid}_inputID`,
                    accept: plugin.settings.fileTypes,
                    name: "fileInputnm",
                    multiple: plugin.settings.maxFiles
                }).appendTo($flcontainer),

                // Create the uploaded images container and append it to the container
                $uploadedContainer = $('<div>', { class: 'uploaded' }).appendTo($flcontainer);
            $flcontainer.append(`<input type="text" id='${plugin.settings.fileCtrl.EbSid}_bindfn' hidden >`)



            ////Listen to container click and trigger input file click
            $flcontainer.on('click', function (e) {
                // Prevent browser default event and stop propagation
                prevent(e);
                e.preventDefault();
                e.stopPropagation();

                //// Trigger input click
                $input.trigger('click');
            });

            // Stop propagation on input click
            $input.on("click", function (e) {
                e.stopPropagation();
            });

            // Listen to input files changed
            $input.on('change', fileSelectHandler.bind($flcontainer));
            return $flcontainer;
        };


        let prevent = function (e) {
            // Prevent browser default event and stop propagation
            e.preventDefault();
            e.stopPropagation();

        };


        let createImg = function (file, id, cntype, prelod, refid) {
            var filelurl;
            if (prelod) {

                if (cntype == 1) {
                    filelurl = `/images/small/${refid}.jpg`;
                } else {
                    let arr = file.name.split('.');
                    let exten = arr[arr.length - 1];
                    if (exten === 'pdf') {
                        filelurl = '/images/pdf-image.png';
                    } else {
                        filelurl = '/images/file-image.png';
                    }
                   
                }
                file.name = file.name;
            } else {
                if (cntype == 1) {
                    filelurl = URL.createObjectURL(file);
                } else  {
                    let arr = file.name.split('.');
                    let exten = arr[arr.length - 1];
                    if (exten === 'pdf') {
                        filelurl = '/images/pdf-image.png';
                    } else {
                        filelurl = '/images/file-image.png';
                    }

                }


            }
            let src = filelurl;
            if (plugin.settings.renderer === "Bot") {
                $filethumb = $('<div>', { class: 'botfilethumb' });
                $inrContainer = $('<div>', { class: 'botuploaded-file ', exact: file.name }).appendTo($filethumb);

                if (cntype == 0) {

                    src = '/images/pdf-image.png';

                    $img = $('<img>', { src: src, cntype: cntype, pd64: filelurl }).appendTo($inrContainer);
                }
                else {
                    $img = $('<img>', { src: src, cntype: cntype }).appendTo($inrContainer);
                }


                //create div for file name
                $filedtls = $('<div>', { class: 'botfiledtls' }).appendTo($inrContainer);
                //$filedtls.append(`<p class='botfilename'>${file.name}</p>`);
                $filedtls.append(`<span class="fa fa-check-circle-o success"></span><span class="fa fa-exclamation-circle error"></span>`);

                ///// Create the delete button
                $button = $('<span>', { class: 'delete-image' }).appendTo($inrContainer),
                    $i = $('<i>', { class: 'fa fa-times-circle  ' }).appendTo($button);
                $spinner = $('<div>', { class: 'load_spinner' }).appendTo($inrContainer),
                    $i = $('<i>', { class: 'fa fa-spinner fa-spin ' }).appendTo($spinner);
            }
            else {
                $filethumb = $('<div>', { class: 'filethumb trggrpreview' });

                // Create the upladed image container
                $inrContainer = $('<div>', { class: 'uploaded-file', exact: file.name }).appendTo($filethumb);
                // Create the img tag

                if (cntype == 'application/pdf') {

                    src = '/images/pdf-image.png';

                    $img = $('<img>', { src: src, cntype: cntype, pd64: filelurl }).appendTo($inrContainer);

                }
                else {
                    $img = $('<img>', { src: src, cntype: cntype }).appendTo($inrContainer);
                }

                //create div for file name
                $filedtls = $('<div>', { class: 'filedtls' }).appendTo($inrContainer);
                $filedtls.append(`<p class='filename'>${file.name}</p>`);
                $filedtls.append(`<span class="fa fa-check-circle-o success"></span><span class="fa fa-exclamation-circle error"></span>`);

                //// Create the delete button
                $button = $('<span>', { class: 'delete-image' }).appendTo($inrContainer),
                    $i = $('<i>', { class: 'fa fa-times-circle  ' }).appendTo($button);

                $spinner = $('<div>', { class: 'load_spinner' }).appendTo($inrContainer),
                    $i = $('<i>', { class: 'fa fa-spinner fa-spin ' }).appendTo($spinner);
            }


            // If the images are preloaded
            if (plugin.settings.preloaded.length) {

                // Set a identifier
                $inrContainer.attr('data-preloaded', true);
                $inrContainer.attr('data-index', id);
                $inrContainer.attr('data-cntype', cntype);

            } else {

                // Set the identifier
                $inrContainer.attr('data-index', id);

            }

            //// Stop propagation on click
            //$inrContainer.on("click", function (e) {

            //    // Prevent browser default event and stop propagation
            //    prevent(e);

            //});

            //// Set delete action
            $button.on("click", function (e) {
                // Prevent browser default event and stop propagation
                prevent(e);
                let f_refid = "";
                if (plugin.settings.renderer === "Bot") {
                    f_refid = $(e.target).closest('.botfilethumb').attr('filrefid');
                    $(e.target).closest('.botfilethumb').remove();
                } 
                else {
                    f_refid = $(e.target).closest('.filethumb').attr('filrefid');
                    $(e.target).closest('.filethumb').remove();

                }
               
                                
                filedel.push(f_refid);
                let del_indx = refidArr.indexOf(f_refid);
                refidArr.splice(del_indx, 1);
                filesView.splice(del_indx, 1);
                $(`#${plugin.settings.fileCtrl.EbSid}_bindfn`).change();

            });

            return $filethumb;
        };

        let fileDragHover = function (e) {

            // Prevent browser default event and stop propagation
            prevent(e);

            // Change the container style
            if (e.type === "dragover") {
                $(this).addClass('drag-over');
            } else {
                $(this).removeClass('drag-over');
            }
        };

        let fileSelectHandler = function (e) {

            // Prevent browser default event and stop propagation
            prevent(e);

            // Get the jQuery element instance
            let $container = $(this);

            // Change the container style
            $container.removeClass('drag-over');

            // Get the files
            let files = e.target.files || e.originalEvent.dataTransfer.files;
            let fileArr = []
            $.each(files, function (i, n) {
                fileArr.push(n);
            });
            let totfile = ((preloadedfile + newfilearray.length) - filedel.length);
            if (totfile + fileArr.length > plugin.settings.maxFiles) {

                fileArr = fileArr.slice(0, (plugin.settings.maxFiles - totfile));
            }
            if (totfile === plugin.settings.maxFiles) {
                EbMessage("show", { Message: "Maximum number of files reached ", Background: 'red' });
            }
            else {
                // Makes the upload
                setPreview($container, fileArr);
            }
           
        };

        let setPreview = function ($container, files) {

            // Add the 'has-files' class
            $container.addClass('has-files');

            // Get the upload images container
            let $uploadedContainer = $container.find('.uploaded'),

                // Get the files input
                $input = $container.find('input[type="file"]');

            // Run through the files
            $(files).each(function (i, file) {
                let url = "";
                // if ((files[i].type == "image/jpeg") || (files[i].type == "image/jpg") || (files[i].type == "application/pdf") || (files[i].type == "image/png")) {
                if ((files[i].size) < (plugin.settings.maxSize * 1024 * 1024)) {
                    //if (((preloadedfile - filedel.length) + newfilearray.length) < plugin.settings.maxFiles) {
                    if (((preloadedfile + newfilearray.length)  - filedel.length) < plugin.settings.maxFiles) {
                  //  if (newfilearray.length< plugin.settings.maxFiles) {



                        // Add it to data transfer
                        //   dataTransfer.items.add(file);

                        // Set preview

                        //if (files[i].type == "application/pdf") {

                        //    $uploadedContainer.append(createImg('/images/pdf-image.png', dataTransfer.items.length - 1));
                        //}
                        //else
                        let type = getFileType(file);
                        {
                            $uploadedContainer.append(createImg(file, newfilearray.length, type), false);
                           // $(".trggrpreview").on("click", viewFilesFn);
                            // let createImg = function (file, id, cntype, prelod, fileno, refid) {
                        }


                        if (plugin.settings.renderer === "Bot") {
                            if (type === 1)
                                url = "../Boti/UploadImageAsync";
                            else
                                url = "../Boti/UploadFileAsync";
                        }
                        else {

                            if (type === 1)
                                url = "../StaticFile/UploadImageAsync";
                            else
                                url = "../StaticFile/UploadFileAsync";
                        }


                        uploadItem(url, file);


                    }
                    else {
                        EbMessage("show", { Message: "Maximum number of files reached ", Background: 'red' });
                    }
                }
                else {
                    EbMessage("show", { Message: `Maximum file size is ${plugin.settings.MaxSize}MB`, Background: 'red' });
                }
                //}
                //else {
                //    EbMessage("show", { Message: "Only image and pdf are allowed", Background: 'red' });
                //}




            });


        };

        //get file type
        let getFileType = function (file) {
            if (file.type.match('image.*'))
                return 1;
            else
                return 0;
        };


        let uploadItem = function (_url, file) {
            let thumb = null;
            let formData = new FormData();
            formData.append("File", file);

            $.ajax({
                type: "POST",
                url: _url,
                data: formData,
                //cache: false,
                contentType: false,
                processData: false
            }).done(function (refid) {
                thumb = $inrContainer;
                successOper(thumb, refid, file);
            }.bind(this));
        };

        let successOper = function (thumb, refid, file) {
            // thumb.find(".eb-upl-loader").hide();
            if (refid > 0) {
                //add it to file array
                let fileobj = {};
                fileobj["FileName"] = file.name;
                fileobj["FileSize"] = file.size;
                fileobj["FileRefId"] = refid;
                fileobj["Meta"] = {};
                fileobj["UploadTime"] = "";
                fileobj["FileCategory"] = getFileType(file);
                filesView.push(fileobj);
                newfilearray.push(file);
                plugin.ebFilesview.addToImagelist(fileobj);
                setRefid(refid, thumb);
            }
            else {
                thumb.find(".error").show();
                thumb.find(".success").hide();
            }
        };

        let setRefid = function (refid, thumb) {
            refidArr.push(refid);
            thumb.find(".success").show();
            thumb.find(".load_spinner").remove();
            thumb.find(".error").hide();
            thumb.attr("filref", refid);
            thumb.parent().attr('filrefid', refid);
            let $hiddenInput = $(`#${plugin.settings.fileCtrl.EbSid}_bindfn`);
            $hiddenInput.val(refidArr.join(","));
            $hiddenInput.trigger('change');
            $(`#${plugin.settings.fileCtrl.EbSid}`).attr("fileCount", refidArr.length)
            $(`trggrpreview, [filrefid=${refid}]`).on("click", viewFilesFn);
        };

        this.refidListfn = function () {
            return refidArr.join(",");
        };

        let createFileviewer = function () {
            $("#ebfileviewdiv").remove();
            $("body").append("<div id='ebfileviewdiv'></div>");
            plugin.ebFilesview = $("#ebfileviewdiv").ebFileViewer(filesView);
        }.bind(this);

        let viewFilesFn = function (e) {
            prevent(e);
            let fileref = $(e.target).closest(".uploaded-file").attr("filref");

            //ebfileviewer 
            plugin.ebFilesview.showimage(fileref);
        }


        this.init();

        return this;
    };

}(jQuery));
const yearPickerVersion = "1.0.0";
const yearPickerAppName = "YearPicker";

var defaults = {
  // Auto Hide
  autoHide: true,
  // The Initial Date
  year: null,
  // Start Date
  startYear: null,
  // End Date
  endYear: null,
  // A element tag items
  itemTag: "li",
  //css class selected date item
  selectedClass: "selected",
  // css class disabled
  disabledClass: "disabled",
  hideClass: "hide",
  highlightedClass: "highlighted",
  template: `<div class="yearpicker-container">
                    <div class="yearpicker-header">
                        <div class="yearpicker-prev" data-view="yearpicker-prev">&lsaquo;</div>
                        <div class="yearpicker-current" data-view="yearpicker-current">SelectedYear</div>
                        <div class="yearpicker-next" data-view="yearpicker-next">&rsaquo;</div>
                    </div>
                    <div class="yearpicker-body">
                        <ul class="yearpicker-year" data-view="years">
                        </ul>
                    </div>
                </div>
`,

  // Event shortcuts
  show: null,
  hide: null,
  pick: null
};

var window = typeof window !== "undefained" ? window : {};

var event_click = "click.";
var event_focus = "focus.";
var event_keyup = "keyup.";
var event_selected = "selected.";
var event_show = "show.";
var event_hide = "hide.";

var methods = {
  // Show datepicker
  showView: function showView() {
    if (!this.build) {
      this.init();
    }

    if (this.show) {
      return;
    }

    if (this.trigger(event_show).isDefaultPrevented()) {
      return;
    }
    this.show = true;
    var $template = this.$template,
      options = this.options;

    $template
      .removeClass(options.hideClass)
      .on(event_click, $.proxy(this.click, this));
    $(document).on(
      event_click,
      (this.onGlobalClick = proxy(this.globalClick, this))
    );
    this.place();
  },

  // Hide the datepicker
  hideView: function hideView() {
    if (!this.show) {
      return;
    }

    if (this.trigger(event_hide).isDefaultPrevented()) {
      return;
    }

    var $template = this.$template,
      options = this.options;

    $template.addClass(options.hideClass).off(event_click, this.click);
    $(document).off(event_click, this.onGlobalClick);
    this.show = false;
  },
  // toggle show and hide
  toggle: function toggle() {
    if (this.show) {
      this.hideView();
    } else {
      this.show();
    }
  },
  setStartYear: function setStartYear(year) {
    this.startYear = year;

    if (this.build) {
      this.render();
    }
  },
  setEndYear: function setEndYear(year) {
    this.endYear = year;
    if (this.build) {
      this.render();
    }
  }
};

var handlers = {
  click: function click(e) {
    var $target = $(e.target);
    var options = this.options;
    var viewYear = this.viewYear;
    if ($target.hasClass("disabled")) {
      return;
    }
    var view = $target.data("view");
    switch (view) {
      case "yearpicker-prev":
        var year = viewYear - 12;
        this.viewYear = year;
        this.renderYear();
        break;
      case "yearpicker-next":
        var year = viewYear + 12;
        this.viewYear = year;
        this.renderYear();
        break;
      case "yearpicker-items":
        this.year = parseInt($target.html());
        this.renderYear();
        this.hideView();
        break;
      default:
        break;
    }
  },
  globalClick: function globalClick(_ref) {
    var target = _ref.target;
    var element = this.element;
    var hidden = true;

    if (target !== document) {
      while (
        target === element ||
        $(target).closest(".yearpicker-header").length === 1
      ) {
        hidden = false;
        break;
      }

      target = target.parentNode;
    }

    if (hidden) {
      this.hideView();
    }
  }
};

var render = {
  renderYear: function renderYear() {
    var options = this.options,
      startYear = options.startYear,
      endYear = options.endYear;
    var disabledClass = options.disabledClass;

    // viewed year in the calenter
    var viewYear = this.viewYear;
    // selected year
    var selectedYear = this.year;
    var now = new Date();
    // current year
    var thisYear = now.getFullYear();

    var start = -5;
    var end = 6;
    var items = [];
    var prevDisabled = false;
    var nextDisabled = false;
    var i = void 0;

    for (i = start; i <= end; i++) {
      var year = viewYear + i;
      var disabled = false;

      if (startYear) {
        disabled = year < startYear;
        if (i === start) {
          prevDisabled = disabled;
        }
      }

      if (!disabled && endYear) {
        disabled = year > endYear;
        if (i === end) {
          nextDisabled = disabled;
        }
      }

      // check for this is a selected year
      var isSelectedYear = year === selectedYear;
      var view = isSelectedYear ? "yearpicker-items" : "yearpicker-items";
      items.push(
        this.createItem({
          selected: isSelectedYear,
          disabled: disabled,
          text: viewYear + i,
          //view: disabled ? "yearpicker disabled" : view,
          view: disabled ? "yearpicker-items disabled" : view,
          highlighted: year === thisYear
        })
      );
    }

    this.yearsPrev.toggleClass(disabledClass, prevDisabled);
    this.yearsNext.toggleClass(disabledClass, nextDisabled);
    this.yearsCurrent.html(selectedYear);
    this.yearsBody.html(items.join(" "));
    this.setValue();
  }
};

function isString(value) {
  return typeof value === "string";
}

function isNumber(value) {
  return typeof value === "number" && value !== "NaN";
}

function isUndefained(value) {
  return typeof value === "undefined";
}

function proxy(fn, context) {
  for (
    var len = arguments.length, args = Array(len > 2 ? len - 2 : 0), key = 2;
    key < len;
    key++
  ) {
    args[key - 2] = arguments[key];
  }

  return function() {
    for (
      var len2 = arguments.length, args2 = Array(len2), key2 = 0;
      key2 < len2;
      key2++
    ) {
      args2[key2] = arguments[key2];
    }

    return fn.apply(context, args.concat(args2));
  };
}

("use strict");

var _setupError = "YearPicker Error";
if (isUndefained(jQuery)) {
  alert(`${yearPickerAppName} ${yearPickerVersion} requires jQuery`);
}

var classCheck = function(instance, constractor) {
  if (!(instance instanceof constractor)) {
    alert("cannot call a class as instance of function!!!");
  }
};

var class_top_left = yearPickerAppName + "-top-left";
var class_top_right = yearPickerAppName + "-top-right";
var class_bottom_left = yearPickerAppName + "-bottom-left";
var class_bottom_right = yearPickerAppName + "-bottom-right";
var class_placements = [
  class_top_left,
  class_top_right,
  class_bottom_left,
  class_bottom_right
].join(" ");

var Yearpicker = (function() {
  function Yearpicker(element) {
    var options =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    classCheck(this, Yearpicker);

    this.$element = $(element);
    this.element = element;
    this.options = $.extend({}, defaults, options);
    this.build = false;
    this.show = false;
    this.startYear = null;
    this.endYear = null;

    this.create();
  }

  // yearpicker
  Yearpicker.prototype = {
    create: function() {
      var $this = this.$element,
        options = this.options;
      var startYear = options.startYear,
        endYear = options.endYear,
        year = options.year;

      //this.trigger = $(options.trigger);
      this.isInput = $this.is("input") || $this.is("textarea");
      initialValue = this.getValue();
      this.initialValue = initialValue;
      this.oldValue = initialValue;
      year = year || initialValue || new Date().getFullYear();

      if (startYear) {
        if (year < startYear) {
          year = startYear;
        }
        this.startYear = startYear;
      }

      if (endYear) {
        if (year > endYear) {
          year = endYear;
        }
        this.endYear = endYear;
      }

      this.year = year;
      this.viewYear = year;
      this.initialYear = year;
      this.bind();
      this.init();
    },
    init: function() {
      if (this.build) {
        return;
      }
      this.build = true;

      var $this = this.$element,
        options = this.options;
      var $template = $(options.template);
      this.$template = $template;

      this.yearsPrev = $template.find(".yearpicker-prev");
      this.yearsCurrent = $template.find(".yearpicker-current");
      this.yearsNext = $template.find(".yearpicker-next");
      this.yearsBody = $template.find(".yearpicker-year");

      $template.addClass(options.hideClass);
      $(document.body).append(
        $template.addClass(yearPickerAppName + "-dropdown")
      );

        this.$element.on("keyup paste", function () { /*added code - jith*/
            this.value = this.value.replace(/[^0-9]/g, '');
            this.value = this.value.substring(0, 4);
        });

      this.renderYear();
    },
    unbuild: function() {
      if (!this.build) {
        return;
      }
      this.build = false;
      this.$template.remove();
    },
    // assign a events
    bind: function() {
      var $this = this.$element,
        options = this.options;

      if ($.isFunction(options.show)) {
        $this.on(event_show, options.show);
      }
      if ($.isFunction(options.hide)) {
        $this.on(event_hide, options.hide);
      }
      if ($.isFunction(options.click)) {
        $this.on(event_click, options.click);
      }
      if (this.isInput) {
        $this.on(event_focus, $.proxy(this.showView, this));
      } else {
        $this.on(event_click, $.proxy(this.showView, this));
      }
    },
    getValue: function() {
      var $this = this.$element;
      var value = this.isInput ? $this.val() : $this.text();
      value = parseInt(value);
      return this.isInput ? parseInt($this.val()) : $this.text();
    },
    setValue: function() {
      var $this = this.$element;
      var value = this.year;
      if (this.isInput) {
          $this.val(value);
          $this.trigger("change");// added by jith
      } else {
        $this.html(value);
      }
    },
    trigger: function(type, data) {
      var e = $.Event(type, data);
      this.$element.trigger(e);
      return e;
    },
    place: function() {
      var $this = this.$element,
        options = this.options,
        $template = this.$template;

      var containerWidth = $(document).outerWidth(),
        containerHeight = $(document).outerHeight(),
        elementWidth = $this.outerWidth(),
        elementHeight = $this.outerHeight(),
        width = $template.width(),
        height = $template.height();

      var elementOffset = $this.offset(),
        top = elementOffset.top,
        left = elementOffset.left;

      var offset = parseFloat(options.offset);
      var placements = class_top_left;

      offset = isNaN(offset) ? 10 : offset;

      // positioning the y axis
      if (top > height && top + elementHeight + height > containerHeight) {
        top -= height + offset;
        placements = class_bottom_left;
      } else {
        top += elementHeight + offset;
      }

      // positioning the x axis
      if (left + width > containerWidth) {
        left += elementWidth - width;
        placements = placements.replace("left", "right");
      }

      $template
        .removeClass(class_placements)
        .addClass(placements)
        .css({
          top: top,
          left: left,
          zIndex: parseInt(this.zIndex, 10)
        });
    },
    createItem: function(data) {
      var options = this.options;
      var itemTag = options.itemTag;

      var items = {
        text: "",
        view: "",
        selected: false,
        disabled: false,
        highlighted: false
      };

      var classes = [];
      $.extend(items, data);
      if (items.selected) {
        classes.push(options.selectedClass);
      }

      if (items.disabled) {
        classes.push(options.disabledClass);
      }

      if (items.highlighted) {
        classes.push(options.highlightedClass);
      }

      return `<${itemTag} class="${items.view} ${classes.join(
        " "
      )}" data-view="${items.view}">${items.text}</${itemTag}>`;
    }
  };

  return Yearpicker;
})();

if ($.extend) {
  $.extend(Yearpicker.prototype, methods, render, handlers);
}

if ($.fn) {
  $.fn.yearpicker = function jQueryYearpicker(option) {
    for (
      var len = arguments.length, args = Array(len > 1 ? len - 1 : 0), key = 1;
      key < len;
      key++
    ) {
      args[key - 1] = arguments[key];
    }
    var result = void 0;

    this.each(function(i, element) {
      var $element = $(element);
      var isDestory = option === "destroy";
      var yearpicker = $element.data(yearPickerAppName);

      if (!yearpicker) {
        if (isDestory) {
          return;
        }
        var options = $.extend(
          {},
          $element.data(),
          $.isPlainObject(option) && option
        );
        yearpicker = new Yearpicker(element, options);
        $element.data(yearPickerAppName, yearpicker);
      }
      if (isString(option)) {
        var fn = yearpicker[option];

        if ($.isFunction(fn)) {
          result = fn.apply(yearpicker, args);

          if (isDestory) {
            $element.removeData(yearPickerAppName);
          }
        }
      }
    });

    return !isUndefained(result) ? result : this;
  };
  $.fn.yearpicker.constractor = Yearpicker;
}

var splitWindow = function (parent_div, cont_box, sidediv, p_grid) {
    
    this.parent_div = parent_div;
    this.sidediv = sidediv;
    this.contBox = cont_box;
    this.pGrid = p_grid;
    this.wdId = 1;
    this.wScroll = 0;

    this.createWindows = function () {
        $("#" + this.parent_div).prepend("<div class='col-md-2 no-padd fd' id='" + this.sidediv + "'><div class='min-btn'>"
           +"<button class='btn-tb-com pull-right' onclick= fdBoxMin(); id = 'fd-min-btn' ><i class='fa fa-caret-left fa-lg'></i></button></div><div>");

        $("#" + this.parent_div).append("<div class='col-md-8 no-padd cont-wnd' id='" + this.contBox + "'>"
            + "<div class='sub-windows' id='sub0'><div class='sub-windows-head'>"
            + "<div class='pull-right' style= 'margin-top: 3px;' >"
            + "<button class='head-btn'><i class='fa fa-minus' aria-hidden='true'></i></button>"
            + "<button class='head-btn'><i class='fa fa-thumb-tack' aria-hidden='true'></i></button>"
            + "<button class='head-btn'><i class='fa fa-times' aria-hidden='true'></i></button>"
            + "</div ></div ></div > ");

        $("#" + this.parent_div).append("<div class='col-md-2 no-padd pg' id='" + this.pGrid + "'>"
            + "<div class='min-btn'>"
            + "<button class='btn-tb-com' onclick=pgBoxMin(); id='pg-min'><i class='fa fa-caret-right fa-lg'></i></button></div></div>");
    };

    fdBoxMin = function () {       
        $(this.sidediv).toggleClass("toggled");
          if ($(this.sidediv).hasClass("toggled")) {               
              //$(this.contBox).removeClass('col-md-8').addClass('col-md-10');
              $('#fd-min-btn').css('margin-right', '-25px').addClass("rotated");
           }
            else {
              //$(this.contBox).removeClass('col-md-10').addClass('col-md-8');
              $('#fd-min-btn').css('margin-right', '0').removeClass("rotated");
        }         
    };

    pgBoxMin = function () { 
        $(this.pGrid).toggleClass("pg-toggled");
        if ($(this.pGrid).hasClass("pg-toggled")) {
            $(this.contBox).removeClass('col-md-8').addClass('col-md-10');
            $('#pg-min').css('margin-left', '-19px').addClass("rotated");
            }
            else {
            $(this.contBox).removeClass('col-md-10').addClass('col-md-8');
                $('#pg-min').css('margin-left', '0').removeClass("rotated");
        }       
    };

    this.createContentWindow = function (id, type, prev) {// style='height:inherit;'
        if ($('.splitdiv_parent').hasClass("slick-slider")) {
            //$('.splitdiv_parent').slick('unslick');
            if (prev === undefined) {
                $('.splitdiv_parent').slick('slickAdd', `<div class='sub-windows' id='sub_window_dv${id}' tabindex= '1' eb-type="${type}">
                    <div class='split-inner'>
                    <div id="filterDisplay_dv${id}" class="filter-display"></div>
                    <div class='wrapper-cont' id='content_dv${id}' style='height:inherit;padding: 0;padding-right: 1px;'></div>
                    </div>
           </div>`);
            }
            else
                $("#" + prev).after(`<div class='sub-windows' id='sub_window_dv${id}' tabindex= '1' eb-type="${type}">
                    <div class='split-inner'>
                    <div id="filterDisplay_dv${id}" class="filter-display"></div>
                    <div class='wrapper-cont' id='content_dv${id}' style='height:inherit;padding: 0;padding-right: 1px;'></div>
                    </div>
           </div>`);
        }
        else {
            $('#'+this.parent_div).append( `<div class='sub-windows' id='sub_window_dv${id}' tabindex= '1' eb-type="${type}">
                    <div class='split-inner'>
                    <div id="filterDisplay_dv${id}" class="filter-display"></div>
                    <div class='wrapper-cont' id='content_dv${id}' style='height:inherit;padding: 0;padding-right: 1px;'></div>
                    </div>
           </div>`);
        }

        
        $('#sub_window_dv' + id).focusin(this.windowOnFocus.bind(this));
    };
    this.windowOnFocus = function () {
        
    };
    this.init = function () {
        $('#new').on('click', this.createContentWindow.bind(this));
    };
    this.init();
};
/*! ========================================================================
 * Bootstrap Toggle: bootstrap-toggle.js v2.2.0
 * http://www.bootstraptoggle.com
 * ========================================================================
 * Copyright 2014 Min Hur, The New York Times Company
 * Licensed under MIT
 * ======================================================================== */
+function (a) { "use strict"; function b(b) { return this.each(function () { var d = a(this), e = d.data("bs.toggle"), f = "object" == typeof b && b; e || d.data("bs.toggle", e = new c(this, f)), "string" == typeof b && e[b] && e[b]() }) } var c = function (b, c) { this.$element = a(b), this.options = a.extend({}, this.defaults(), c), this.render() }; c.VERSION = "2.2.0", c.DEFAULTS = { on: "On", off: "Off", onstyle: "primary", offstyle: "default", size: "normal", style: "", width: null, height: null }, c.prototype.defaults = function () { return { on: this.$element.attr("data-on") || c.DEFAULTS.on, off: this.$element.attr("data-off") || c.DEFAULTS.off, onstyle: this.$element.attr("data-onstyle") || c.DEFAULTS.onstyle, offstyle: this.$element.attr("data-offstyle") || c.DEFAULTS.offstyle, size: this.$element.attr("data-size") || c.DEFAULTS.size, style: this.$element.attr("data-style") || c.DEFAULTS.style, width: this.$element.attr("data-width") || c.DEFAULTS.width, height: this.$element.attr("data-height") || c.DEFAULTS.height } }, c.prototype.render = function () { this._onstyle = "btn-" + this.options.onstyle, this._offstyle = "btn-" + this.options.offstyle; var b = "large" === this.options.size ? "btn-lg" : "small" === this.options.size ? "btn-sm" : "mini" === this.options.size ? "btn-xs" : "", c = a('<label class="btn">').html(this.options.on).addClass(this._onstyle + " " + b), d = a('<label class="btn">').html(this.options.off).addClass(this._offstyle + " " + b + " active"), e = a('<span class="toggle-handle btn btn-default">').addClass(b), f = a('<div class="toggle-group">').append(c, d, e), g = a('<div class="toggle btn" data-toggle="toggle">').addClass(this.$element.prop("checked") ? this._onstyle : this._offstyle + " off").addClass(b).addClass(this.options.style); this.$element.wrap(g), a.extend(this, { $toggle: this.$element.parent(), $toggleOn: c, $toggleOff: d, $toggleGroup: f }), this.$toggle.append(f); var h = this.options.width || Math.max(c.outerWidth(), d.outerWidth()) + e.outerWidth() / 2, i = this.options.height || Math.max(c.outerHeight(), d.outerHeight()); c.addClass("toggle-on"), d.addClass("toggle-off"), this.$toggle.css({ width: h, height: i }), this.options.height && (c.css("line-height", c.height() + "px"), d.css("line-height", d.height() + "px")), this.update(!0), this.trigger(!0) }, c.prototype.toggle = function () { this.$element.prop("checked") ? this.off() : this.on() }, c.prototype.on = function (a) { return this.$element.prop("disabled") ? !1 : (this.$toggle.removeClass(this._offstyle + " off").addClass(this._onstyle), this.$element.prop("checked", !0), void (a || this.trigger())) }, c.prototype.off = function (a) { return this.$element.prop("disabled") ? !1 : (this.$toggle.removeClass(this._onstyle).addClass(this._offstyle + " off"), this.$element.prop("checked", !1), void (a || this.trigger())) }, c.prototype.enable = function () { this.$toggle.removeAttr("disabled"), this.$element.prop("disabled", !1) }, c.prototype.disable = function () { this.$toggle.attr("disabled", "disabled"), this.$element.prop("disabled", !0) }, c.prototype.update = function (a) { this.$element.prop("disabled") ? this.disable() : this.enable(), this.$element.prop("checked") ? this.on(a) : this.off(a) }, c.prototype.trigger = function (b) { this.$element.off("change.bs.toggle"), b || this.$element.change(), this.$element.on("change.bs.toggle", a.proxy(function () { this.update() }, this)) }, c.prototype.destroy = function () { this.$element.off("change.bs.toggle"), this.$toggleGroup.remove(), this.$element.removeData("bs.toggle"), this.$element.unwrap() }; var d = a.fn.bootstrapToggle; a.fn.bootstrapToggle = b, a.fn.bootstrapToggle.Constructor = c, a.fn.toggle.noConflict = function () { return a.fn.bootstrapToggle = d, this }, a(function () { a("input[type=checkbox][data-toggle^=toggle]").bootstrapToggle() }), a(document).on("click.bs.toggle", "div[data-toggle^=toggle]", function (b) { var c = a(this).find("input[type=checkbox]"); c.bootstrapToggle("toggle"), b.preventDefault() }) }(jQuery);
//# sourceMappingURL=bootstrap-toggle.min.js.map
/*!
 * jQuery.scrollTo
 * Copyright (c) 2007-2015 Ariel Flesler - aflesler<a>gmail<d>com | http://flesler.blogspot.com
 * Licensed under MIT
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 * @projectDescription Lightweight, cross-browser and highly customizable animated scrolling with jQuery
 * @author Ariel Flesler
 * @version 2.1.2
 */
;(function(factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof module !== 'undefined' && module.exports) {
		// CommonJS
		module.exports = factory(require('jquery'));
	} else {
		// Global
		factory(jQuery);
	}
})(function($) {
	'use strict';

	var $scrollTo = $.scrollTo = function(target, duration, settings) {
		return $(window).scrollTo(target, duration, settings);
	};

	$scrollTo.defaults = {
		axis:'xy',
		duration: 0,
		limit:true
	};

	function isWin(elem) {
		return !elem.nodeName ||
			$.inArray(elem.nodeName.toLowerCase(), ['iframe','#document','html','body']) !== -1;
	}		

	$.fn.scrollTo = function(target, duration, settings) {
		if (typeof duration === 'object') {
			settings = duration;
			duration = 0;
		}
		if (typeof settings === 'function') {
			settings = { onAfter:settings };
		}
		if (target === 'max') {
			target = 9e9;
		}

		settings = $.extend({}, $scrollTo.defaults, settings);
		// Speed is still recognized for backwards compatibility
		duration = duration || settings.duration;
		// Make sure the settings are given right
		var queue = settings.queue && settings.axis.length > 1;
		if (queue) {
			// Let's keep the overall duration
			duration /= 2;
		}
		settings.offset = both(settings.offset);
		settings.over = both(settings.over);

		return this.each(function() {
			// Null target yields nothing, just like jQuery does
			if (target === null) return;

			var win = isWin(this),
				elem = win ? this.contentWindow || window : this,
				$elem = $(elem),
				targ = target, 
				attr = {},
				toff;

			switch (typeof targ) {
				// A number will pass the regex
				case 'number':
				case 'string':
					if (/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)) {
						targ = both(targ);
						// We are done
						break;
					}
					// Relative/Absolute selector
					targ = win ? $(targ) : $(targ, elem);
					/* falls through */
				case 'object':
					if (targ.length === 0) return;
					// DOMElement / jQuery
					if (targ.is || targ.style) {
						// Get the real position of the target
						toff = (targ = $(targ)).offset();
					}
			}

			var offset = $.isFunction(settings.offset) && settings.offset(elem, targ) || settings.offset;

			$.each(settings.axis.split(''), function(i, axis) {
				var Pos	= axis === 'x' ? 'Left' : 'Top',
					pos = Pos.toLowerCase(),
					key = 'scroll' + Pos,
					prev = $elem[key](),
					max = $scrollTo.max(elem, axis);

				if (toff) {// jQuery / DOMElement
					attr[key] = toff[pos] + (win ? 0 : prev - $elem.offset()[pos]);

					// If it's a dom element, reduce the margin
					if (settings.margin) {
						attr[key] -= parseInt(targ.css('margin'+Pos), 10) || 0;
						attr[key] -= parseInt(targ.css('border'+Pos+'Width'), 10) || 0;
					}

					attr[key] += offset[pos] || 0;

					if (settings.over[pos]) {
						// Scroll to a fraction of its width/height
						attr[key] += targ[axis === 'x'?'width':'height']() * settings.over[pos];
					}
				} else {
					var val = targ[pos];
					// Handle percentage values
					attr[key] = val.slice && val.slice(-1) === '%' ?
						parseFloat(val) / 100 * max
						: val;
				}

				// Number or 'number'
				if (settings.limit && /^\d+$/.test(attr[key])) {
					// Check the limits
					attr[key] = attr[key] <= 0 ? 0 : Math.min(attr[key], max);
				}

				// Don't waste time animating, if there's no need.
				if (!i && settings.axis.length > 1) {
					if (prev === attr[key]) {
						// No animation needed
						attr = {};
					} else if (queue) {
						// Intermediate animation
						animate(settings.onAfterFirst);
						// Don't animate this axis again in the next iteration.
						attr = {};
					}
				}
			});

			animate(settings.onAfter);

			function animate(callback) {
				var opts = $.extend({}, settings, {
					// The queue setting conflicts with animate()
					// Force it to always be true
					queue: true,
					duration: duration,
					complete: callback && function() {
						callback.call(elem, targ, settings);
					}
				});
				$elem.animate(attr, opts);
			}
		});
	};

	// Max scrolling position, works on quirks mode
	// It only fails (not too badly) on IE, quirks mode.
	$scrollTo.max = function(elem, axis) {
		var Dim = axis === 'x' ? 'Width' : 'Height',
			scroll = 'scroll'+Dim;

		if (!isWin(elem))
			return elem[scroll] - $(elem)[Dim.toLowerCase()]();

		var size = 'client' + Dim,
			doc = elem.ownerDocument || elem.document,
			html = doc.documentElement,
			body = doc.body;

		return Math.max(html[scroll], body[scroll]) - Math.min(html[size], body[size]);
	};

	function both(val) {
		return $.isFunction(val) || $.isPlainObject(val) ? val : { top:val, left:val };
	}

	// Add special hooks so that window scroll properties can be animated
	$.Tween.propHooks.scrollLeft = 
	$.Tween.propHooks.scrollTop = {
		get: function(t) {
			return $(t.elem)[t.prop]();
		},
		set: function(t) {
			var curr = this.get(t);
			// If interrupt is true and user scrolled, stop animating
			if (t.options.interrupt && t._last && t._last !== curr) {
				return $(t.elem).stop();
			}
			var next = Math.round(t.now);
			// Don't waste CPU
			// Browsers don't render floating point scroll
			if (curr !== next) {
				$(t.elem)[t.prop](next);
				t._last = this.get(t);
			}
		}
	};

	// AMD requirement
	return $scrollTo;
});

var DatePick;
var meetingPicker = function (ctrl, ctrlOpts , type) {

    this.type = type;
    this.Url = "../EbMeeting/GetAllMeetingSlots";
    if (this.type === "Bot") {
        this.Url = "../Boti/GetAllMeetingSlots";
    }
    this.ctrl = ctrl;
    this.ctrlOpts = ctrlOpts;
    this.AllSlots = {};

    this.getTimeSlots = function () {
        let meet = 1;
        let date = $(`#${this.ctrl.EbSid}_date`).val();
        $.post(this.Url , { MeetingId: meet, date: date }, this.AppendSlots.bind(this));
    };

    this.TimeFormat = function (time) {
        let Timestr = "";
        if (parseInt(time.split(":")[0]) < 12) {
            Timestr += time.split(":")[0] + ":" + time.split(":")[1] + " AM";
        }
        else if (parseInt(time.split(":")[0]) > 12) {
            Timestr += "0";
            Timestr += time.split(":")[0] - 12 + ":" + time.split(":")[1] + " PM";
        }
        else {
            Timestr += time.split(":")[0]+ ":" + time.split(":")[1] + " PM";
        }
        return Timestr;
    };

    this.AppendSlots = function (data) {
        this.AllSlots = JSON.parse(data);
        let html = "";
        if (this.AllSlots.length === 1 & this.AllSlots[0].Slot_id == "") {
            html += `<div> empty slots </div></br>
                <button id="add_slot" class="add slot"> Add Slots</button>`;
        }
        else {
            $.each(this.AllSlots, function (index, obj) {
                if (obj.Time_from !== "" && obj.Time_to !== "") {
                    let timeFrom = this.TimeFormat(this.AllSlots[index].Time_from);
                    let timeTo = this.TimeFormat(this.AllSlots[index].Time_to);
                    if (this.type === "Bot") {
                        if (this.AllSlots[index].IsHide) {
                            html += `<div id="${this.AllSlots[index].Slot_id}" m-id="${this.AllSlots[index].Meeting_Id}" is-approved="${this.AllSlots[index].Is_approved}"
                    class="solts-div blocked-slot"> <i class="fa fa-dot-circle-o" aria-hidden="true"></i> ${timeFrom} </div>`;
                        }
                        else {
                            html += `<div id="${this.AllSlots[index].Slot_id}" m-id="${this.AllSlots[0].Meeting_Id}"  is-approved="${this.AllSlots[index].Is_approved}"
                    class="solts-div unblocked-slot"> <i class="fa fa-dot-circle-o" aria-hidden="true"></i> ${timeFrom} </div>`;
                        }
                    }
                    else {
                        if (this.AllSlots[index].IsHide) {
                            html += `<div id="${this.AllSlots[index].Slot_id}" m-id="${this.AllSlots[index].Meeting_Id}" is-approved="${this.AllSlots[index].Is_approved}"
                    class="solts-div blocked-slot"> <i class="fa fa-dot-circle-o" aria-hidden="true"></i> ${timeFrom} to ${timeTo} </div>`;
                        }
                        else {
                            html += `<div id="${this.AllSlots[index].Slot_id}" m-id="${this.AllSlots[0].Meeting_Id}"  is-approved="${this.AllSlots[index].Is_approved}"
                    class="solts-div unblocked-slot"> <i class="fa fa-dot-circle-o" aria-hidden="true"></i> ${timeFrom} to ${timeTo} </div>`;
                        }
                    }
                }
            }.bind(this));
        }
        if (this.type === "Bot") {
            $(`#${this.ctrl.EbSid} .picker-cont`).empty().append(html);
        } else {
            $(`#cont_${this.ctrl.EbSid} .picker-cont`).empty().append(html);
        }
        $(".unblocked-slot").off("click").on("click", this.PickMeeting.bind(this));
        $("#add_slot").off("click").on("click", this.addSlot.bind(this));
    };
    this.addSlot = function () {
        this.SlotDetails = {};
        this.SlotDetails.Date = $(`#${this.ctrl.EbSid}_date`).val();
        $.post("../EbMeeting/AddMeetingTemp", { obj: this.SlotDetails }, this.addSlotSuccess.bind(this));
    };

    this.addSlotSuccess = function (data) {

    };



    this.PickMeeting = function (e) {
        let id = e.target.id;
        let time = e.target.textContent.trim();
        $(`#${this.ctrl.EbSid_CtxId}_slot_val`).val(id).trigger("change");
        $(`#${this.ctrl.EbSid_CtxId}_slot_time`).val(time);
        $(`#${this.ctrl.EbSid}_slot_change`).trigger("click");

       // this.SlotDetails = {};
       // this.SlotDetails.UserId = 1;
       // this.SlotDetails.RoleId = 1;
       // this.SlotDetails.UserGroupId = 1;
       // this.SlotDetails.Confirmation = 1;
       // this.SlotDetails.MeetingScheduleId = e.target.getAttribute("m-id");
       // this.SlotDetails.ApprovedSlotId = e.target.getAttribute("id");
       // this.SlotDetails.Is_approved = e.target.getAttribute("is-approved");
       // this.SlotDetails.StartDate = "2020-04-07";
       // this.SlotDetails.Name = "Nithin"
       // this.SlotDetails.Email = "Nithinmosco@gmail.com"
       // this.SlotDetails.PhoneNum = "+917565758585657"
       // this.SlotDetails.TypeOfUser = 2;
       // this.SlotDetails.Participant_type = 2;
       //// $.post("../Webform/UpdateMeetingFromAttendee", { Obj: this.SlotDetails ,}, this.PickMeetingSuccess.bind(this));
    };

    this.InitDatePicker = function () {
        DatePick = $(`#${this.ctrl.EbSid}_datepicker`).datepicker({
            dateFormat: "yy-mm-dd",
            showOtherMonths: true,
            minDate: 0,
            onSelect: function (date) {
                $(`#${this.ctrl.EbSid}_date`).val(date);
                $(`#${this.ctrl.EbSid}_date_change`).trigger("click");
                this.getTimeSlots();
            }.bind(this),
            changeYear: false,
            selectOtherMonths: true,
            beforeShowDay: function (date) {
                var day = date.getDay();
                return [(day != 5), ''];
            }
        });
    }
    this.datechanged = function () {
        //alert(DatePick.getDate());
        var abc = $(`#${this.ctrl.EbSid}_datepicker`).datepicker("getDate");
        alert(abc); 
    };



    this.init = function () {
        $(`#${this.ctrl.EbSid}_date_change`).on("click", function () { $(`#${this.ctrl.EbSid}_datepicker`).slideToggle(400); }.bind(this));
        $(`#${this.ctrl.EbSid}_slot_change`).on("click", function () { $(`#${this.ctrl.EbSid}_picker-cont`).slideToggle(400); }.bind(this));
       
        this.InitDatePicker();
        this.getTimeSlots();

    };
    this.init();

}

//var jsDate = $('#your_datepicker_id').datepicker('getDate');
//if (jsDate !== null) { // if any date selected in datepicker
//    jsDate instanceof Date; // -> true
//    jsDate.getDate();
//    jsDate.getMonth();
//    jsDate.getFullYear();
//}