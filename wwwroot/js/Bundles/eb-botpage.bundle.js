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



//refid, ver_num, type, dsobj, cur_status, tabNum, ssurl
var EbDataTable = function (Option) {
    this.propGrid = Option.PGobj;
    this.Api = null;
    this.order_info = new Object();
    this.order_info.col = '';
    this.order_info.dir = 0;
    this.MainData = (Option.data === undefined) ? null : Option.data;
    this.isPipped = false;
    this.isContextual = false;
    this.chartJs = null;
    this.url = Option.url;
    this.EbObject = Option.dsobj;
    this.tabNum = Option.tabNum;
    this.Refid = Option.refid;
    this.tableId = null;
    this.ebSettings = null;
    this.ssurl = Option.ssurl;
    this.login = Option.login;
    this.counter = Option.counter;
    this.datePattern = Option.datePattern;
    this.TenantId = Option.TenantId;
    this.UserId = Option.UserId;
    this.relatedObjects = null;
    this.FD = false;
    //Controls & Buttons
    this.table_jQO = null;
    //this.btnGo = $('#btnGo');
    this.filterBox = null;
    this.filterbtn = null;
    this.clearfilterbtn = null;
    this.totalpagebtn = null;
    this.copybtn = null;
    this.printbtn = null;
    this.settingsbtn = null;
    this.OuterModalDiv = null;
    this.settings_tbl = null;

    //temp
    this.eb_filter_controls_4fc = [];
    this.eb_filter_controls_4sb = [];
    this.zindex = 0;
    this.rowId = -1;
    //this.isSettingsSaved = false;
    this.dropdown_colname = null;
    this.deleted_colname = null;
    this.tempcolext = [];
    this.linkDV = null;
    this.filterFlag = false;
    //if (index !== 1)
    this.rowData = (Option.rowData !== undefined && Option.rowData !== null && Option.rowData !== "") ? JSON.parse(decodeURIComponent(escape(window.atob(Option.rowData)))) : null;
    this.filterValues = (Option.filterValues !== "" && Option.filterValues !== undefined && Option.filterValues !== null) ? JSON.parse(decodeURIComponent(escape(window.atob(Option.filterValues)))) : [];
    this.FlagPresentId = false;
    this.flagAppendColumns = false;
    this.drake = null;
    this.draggedPos = null;
    this.droppedPos = null;
    this.dragNdrop = false;
    this.flagColumnVisible = false;
    this.pg = null;
    this.ppgridChildren = null;
    this.columnDefDuplicate = null;
    this.extraCol = [];
    this.PcFlag = false;
    this.modifyDVFlag = false;
    this.initCompleteflag = false;
    this.isTagged = false;
    //this.filterChanged = false;
    this.isRun = false;
    this.cellData = Option.cellData;
    this.columnSearch = [];
    this.isSecondTime = false;
    this.tempColumns = [];
    this.filterHtml = "";
    this.orderColl = [];
    this.RGIndex = [];
    this.NumericIndex = [];
    this.inline = false;
    this.rowgroupCols = [];
    this.treeCols = [];
    this.rowgroupFilter = [];
    this.CurrentRowGroup = null;
    this.permission = [];
    this.isCustomColumnExist = false;
    this.dvformMode = -1;
    this.IsTree = false;
    this.GroupFormLink = null;
    this.ItemFormLink = null;
    this.treeColumn = null;
    this.treeData = [];
    this.tableName = null;
    this.moveToPid = null;
    this.movefromId = null;
    this.columnCount = null;

    var split = new splitWindow("parent-div0", "contBox");

    this.init = function () {
        this.tableId = "dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter;
        this.ContextId = "filterWindow_" + this.tableId;
        this.FDCont = $(`<div id='${this.ContextId}' class='filterCont fd'></div>`);
        $("#parent-div0").before(this.FDCont);
        this.FDCont.hide();

        if (this.login === "dc") {
            this.stickBtn = new EbStickButton({
                $wraper: this.FDCont,
                $extCont: this.FDCont,
                //$scope: $(subDivId),
                icon: "fa-filter",
                dir: "left",
                label: "Parameters",
                //btnTop: 42,
                style: { top: "78px" }
            });
        }
    };

    split.windowOnFocus = function (ev) {
        $("#Relateddiv").hide();
        if ($(ev.target).attr("class") !== undefined) {
            if ($(ev.target).attr("class").indexOf("sub-windows") !== -1) {
                var id = $(ev.target).attr("id");
                focusedId = id;
            }
        }
    }.bind(this);

    this.call2FD = function (value) {
        this.submitId = "btnGo" + this.tableId;
        var isCustom = (typeof (value) !== "undefined") ? ((value === "Yes") ? true : false) : true;
        this.relatedObjects = this.EbObject.DataSourceRefId;
        $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#parent", Style: { "top": "39px", "margin-left": "unset", "margin-right": "unset" } }, maskLoader: false });
        $.ajax({
            type: "POST",
            url: "../DV/dvCommon",
            data: { dvobj: JSON.stringify(this.EbObject), dvRefId: this.Refid, _flag: this.PcFlag, login: this.login, contextId: this.ContextId, customcolumn: isCustom, _curloc: store.get("Eb_Loc-" + this.TenantId + this.UserId), submitId: this.submitId },
            success: this.ajaxSucc
        });
    };

    this.ajaxSucc = function (text) {
        var flag = false;
        if (this.MainData !== null) {
            this.isPipped = true;
            $("#Pipped").show();
            $("#Pipped").text("Pipped From: " + this.EbObject.Pippedfrom);
            this.filterValues = dvcontainerObj.dvcol[prevfocusedId].filterValues;
        }
        else if (this.filterValues !== null && this.filterValues.length > 0) {
            this.isContextual = true;
        }
        else
            this.isTagged = true;
        var subDivId = "#sub_window_dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter;
        $("#content_dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter).empty();
        this.filterHtml = text;
        if (this.login === "uc") {
            this.stickBtn = new EbStickButton({
                $wraper: this.FDCont,
                $extCont: this.FDCont,
                $scope: $("#" + focusedId),
                icon: "fa-filter",
                dir: "left",
                label: "Parameters",
                //btnTop: 42,
                style: { top: "42px" }
            });
        }
        $("#obj_icons").empty();
        this.$submit = $("<button id='" + this.submitId + "' class='btn commonControl'><i class='fa fa-play' aria-hidden='true'></i></button>");
        $("#obj_icons").append(this.$submit);
        this.$submit.click(this.getColumnsSuccess.bind(this));

        this.FDCont = $("#filterWindow_" + this.tableId);
        $("#filterWindow_" + this.tableId).empty();
        $("#filterWindow_" + this.tableId).append("<div class='pgHead'> Param window <div class='icon-cont  pull-right' id='close_paramdiv_" + this.tableId + "'><i class='fa fa-thumb-tack' style='transform: rotate(90deg);'></i></div></div>");//
        $("#filterWindow_" + this.tableId).children().find('#close_paramdiv').off('click').on('click', this.CloseParamDiv.bind(this));
        $("#filterWindow_" + this.tableId).children().find("#close_paramdiv_" + this.tableId).off('click').on('click', this.CloseParamDiv.bind(this));

        $("#filterWindow_" + this.tableId).append(text);
        $("#filterWindow_" + this.tableId).children().find("#btnGo").click(this.getColumnsSuccess.bind(this));

        this.FilterDialog = (typeof (FilterDialog) !== "undefined") ? FilterDialog : {};

        if (text !== "") {
            if (typeof commonO !== "undefined")
                this.EbObject = commonO.Current_obj;
            else
                this.EbObject = dvcontainerObj.currentObj;
        }
        //this.InitializeColumns();
        this.SetColumnRef();
        this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
        if (this.PcFlag === true)
            this.compareAndModifyRowGroup();

        if ($("#" + this.ContextId).children("#filterBox").length === 0) {
            this.FD = false;
            this.FDCont.hide();
            if (this.login === "dc") {
                this.stickBtn.hide();
            }
            else {
                dvcontainerObj.dvcol[focusedId].stickBtn.hide();
            }
            $("#eb_common_loader").EbLoader("hide");
            this.$submit.trigger("click");
        }
        else {
            this.FD = true;
            if (this.isPipped || this.isContextual) {
                this.placefiltervalues();
                this.$submit.trigger("click");
            }
            else {
                this.FDCont.show();
                this.FDCont.css("visibility", "visible");
            }
            $("#eb_common_loader").EbLoader("hide");
        }
        $(subDivId).focus();

        this.PcFlag = false;
    }.bind(this);

    this.SetColumnRef = function () {
        $.each(this.EbObject.Columns.$values, function (i, obj) {
            obj.ColumnsRef = this.EbObject.Columns;
        }.bind(this));
    };

    this.RemoveColumnRef = function () {
        $.each(this.EbObject.Columns.$values, function (i, obj) {
            obj.ColumnsRef = null;
        }.bind(this));
    };

    this.CloseParamDiv = function () {
        this.stickBtn.minimise();
    };

    this.tmpPropertyChanged = function (obj, Pname, newval, oldval) {
        //this.isSecondTime = true;
        if (Pname === "DataSourceRefId") {
            if (obj[Pname] !== null) {
                this.PcFlag = true;
                this.stickBtn.hide();
                this.filterValues = [];
                this.isContextual = false;
                this.isPipped = false;
                this.rowData = null;

                this.orderColl = [];
                this.check4Customcolumn();
                this.EbObject.OrderBy.$values = [];
                this.MainData = null;
                if (this.isCustomColumnExist) {
                    EbDialog("show", {
                        Message: "Retain Custom Columns?",
                        Buttons: {
                            "Yes": {
                                Background: "green",
                                Align: "right",
                                FontColor: "white;"
                            },
                            "No": {
                                Background: "red",
                                Align: "left",
                                FontColor: "white;"
                            }
                        },
                        CallBack: this.dialogboxAction.bind(this)
                    });
                }
                else
                    this.call2FD();
            }
        }
        else if (Pname === "Name") {
            $("#objname").text(obj.DisplayName);
            console.log(obj);
        }
        else if (Pname === "Columns") {
            console.log(obj);
        }
        else if (Pname === "Formula") {
            this.ValidateCalcExpression(obj);
        }
        else if (Pname === "RowGroupCollection") {
            this.CurrentRowGroup = null;
            this.rowgroupCols = [];
        }
    }.bind(this);

    this.dialogboxAction = function (value) {
        this.call2FD(value);
    };

    this.compareAndModifyRowGroup = function () {
        var temparr = [];
        $.each(this.EbObject.RowGroupCollection.$values, function (i, obj) {
            $.each(obj.RowGrouping.$values, function (j, col) {
                var tempcol = $.grep(this.EbObject.Columns.$values, function (column) { return column.name === col.name && column.Type === col.Type });
                if (tempcol.length !== 1) {
                    temparr.push(i);
                    return false;
                }
            }.bind(this));
        }.bind(this));
        $.each(temparr, function (i, index) {
            this.EbObject.RowGroupCollection.$values.splice(index, 1);
        }.bind(this));
        this.CurrentRowGroup = null;
    };

    //Initialisation
    this.start = function () {
        if (this.EbObject === null) {
            this.EbObject = new EbObjects["EbTableVisualization"]("Container_" + Date.now());
            split.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter, "EbTableVisualization");
            if (this.login === "dc") {
                //this.propGrid = new Eb_PropertyGrid("pp_inner", "dc");
                this.propGrid = new Eb_PropertyGrid({
                    id: "pp_inner",
                    wc: "dc",
                    cid: this.cid,
                    $extCont: $(".ppcont")
                }, this.PGobj);

                this.propGrid.PropertyChanged = this.tmpPropertyChanged;
            }
            this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
            $("#" + this.ContextId).css("visibility", "hidden");
            this.init();
        }
        else {
            if (this.MainData !== null)
                split.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter, "EbTableVisualization", prevfocusedId);
            else
                split.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter, "EbTableVisualization");
            if (this.login === "dc") {
                //this.propGrid = new Eb_PropertyGrid("pp_inner", "dc");

                this.propGrid = new Eb_PropertyGrid({
                    id: "pp_inner",
                    wc: "dc",
                    cid: this.cid,
                    $extCont: $(".ppcont"),
                    style: { top: "76px" }
                }, this.PGobj);

                this.propGrid.PropertyChanged = this.tmpPropertyChanged;
            }
            else
                this.propGrid.ClosePG();
            $("#objname").text(this.EbObject.DisplayName);
            this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
            this.init();
            this.call2FD();
        }

        this.propGrid.CXVE.onAddToCE = function (prop, val, addedObj) {
            if (addedObj.ObjType === "NumericColumn")
                addedObj.className = "tdheight dt-body-right";
        };
    };

    this.getColumnsSuccess = function (e) {
        this.propGrid.ClosePG();
        if (this.FD)
            this.stickBtn.minimise();
        else
            this.stickBtn.hide();
        $("#objname").text(this.EbObject.DisplayName);
        this.validateFD = this.FilterDialog.IsFDValidationOK;
        if (this.isContextual) {
            if (this.isSecondTime) {
                if (this.validateFD && !this.validateFD())
                    return;
                this.filterValues = this.getFilterValues("filter");
            }
        }
        else {
            if (this.validateFD && !this.validateFD())
                return;
            this.filterValues = this.getFilterValues("filter");
        }
        this.isSecondTime = false;
        if(this.login === "uc")
            $(".dv-body1").show();
        $("#eb_common_loader").EbLoader("show");
        this.extraCol = [];
        this.ebSettings = this.EbObject;
        $.extend(this.tempColumns, this.EbObject.Columns.$values);
        //this.tempColumns.sort(this.ColumnsComparer);
        this.dsid = this.ebSettings.DataSourceRefId;//not sure..
        this.dvName = this.ebSettings.Name;
        this.initCompleteflag = false;

        this.check4Customcolumn();
        this.CheckforTree();
        this.addSerialAndCheckboxColumns();
        this.ModifyColumnObject();
        this.treeCols = [];
        this.getColumnCount();
        //hard coding
        this.orderColl = [];
        let rowG_coll = this.EbObject.RowGroupCollection.$values;
        let CurR_RowG = this.CurrentRowGroup;
        if (rowG_coll.length>0 &&  !this.EbObject.DisableRowGrouping) {
            if (CurR_RowG === null) {
                CurR_RowG = rowG_coll.find(obj => obj.RowGrouping.$values.length > 0);
                this.CurrentRowGroup = CurR_RowG;
            }
            this.visibilityCheck();
        }
        else {
            if (this.CurrentRowGroup !== null) {
                $.each(this.EbObject.Columns.$values, function (i, colobj) {
                    $.each(CurR_RowG.RowGrouping.$values, function (i, rgobj) {
                        if (colobj.name === rgobj.name) {
                            colobj.bVisible = true;
                        }
                    }.bind(this));
                }.bind(this));
            }
            this.CurrentRowGroup = null;
            this.RGIndex = [];
            this.rowgroupCols = [];

        }


        //----------
        if (this.ebSettings.$type.indexOf("EbTableVisualization") !== -1) {
            $("#content_" + this.tableId).empty();
            $("#content_" + this.tableId).append("<div id='" + this.tableId + "divcont' class='wrapper-cont_inner'><table id='" + this.tableId + "' class='table display table-bordered compact'></table></div>");
            this.Init();
        }
    };

    this.check4Customcolumn = function () {
        var temp = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.IsCustomColumn; });
        if (temp.length === 0)
            this.isCustomColumnExist = false;
        else {
            this.isCustomColumnExist = true;
            temp.map(function (x) {
                x.orderable = false;
                return x;
            });
        }
    };

    this.CheckforTree = function () {
        var temp = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.IsTree; });
        if (temp.length === 0) {
            //this.EbObject.DisableRowGrouping = false;
            this.IsTree = false;
        }
        else {
            this.EbObject.DisableRowGrouping = true;
            this.IsTree = true;
            this.GroupFormLink = temp[0].GroupFormLink;
            this.ItemFormLink = temp[0].ItemFormLink;
            this.treeColumn = temp[0];
            this.treeColumnIndex = this.EbObject.Columns.$values.findIndex(x => x.data === this.treeColumn.data);
        }
        if (this.IsTree)
            this.EbObject.IsPaging = false;
    };

    this.ModifyColumnObject = function () {
        if (this.IsTree) {
            this.EbObject.Columns.$values.map(function (x) {
                x.orderable = false;
                return x;
            });
        }
    };

    this.getColumnCount = function () {
        this.columnCount = this.rowgroupCols.length + this.extraCol.length;
        var temp = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.bVisible; });
        this.columnCount += temp.length;
    };

    this.InitializeColumns = function () {
        $.each(this.EbObject.Columns.$values, function (i, col) {
            if (col.HideDataIfRowMoreThan === null)
                col.HideDataIfRowMoreThan = { "$type": "ExpressBase.Objects.Objects.DVRelated.HideColumnData, ExpressBase.Objects", "Enable": false, "UnRestrictedRowCount": 0, "ReplaceByCharacter": "", "ReplaceByText": "" };
        }.bind(this));
    };

    this.validateFD = function () { }

    this.Init = function () {
        //this.MainData = null;
        $.event.props.push('dataTransfer');
        this.updateRenderFunc();
        this.table_jQO = $('#' + this.tableId);
        this.copybtn = $("#btnCopy" + this.tableId);
        this.printbtn = $("#btnPrint" + this.tableId);
        this.printSelectedbtn = $("#btnprintSelected" + this.tableId);
        this.excelbtn = $("#btnExcel" + this.tableId);
        this.csvbtn = $("#btnCsv" + this.tableId);
        this.pdfbtn = $("#btnPdf" + this.tableId);

        this.eb_agginfo = this.getAgginfo();

        this.table_jQO.append($(this.getFooterFromSettingsTbl()));

        //this.table_jQO.children("tfoot").hide();
        this.table_jQO.children().find("tr").addClass("addedbyeb");

        //this.table_jQO.on('pre-row-reorder.dt', function (e, node, index) {
        //    console.log('Row reorder started: ', node, index);
        //});

        this.table_jQO.on('processing.dt', function (e, settings, processing) {
            if (processing == true) {
                $("#obj_icons .btn").prop("disabled", true);
                $("#eb_common_loader").EbLoader("show");
            }
            else {
                $("#obj_icons .btn").prop("disabled", false);
                $("#eb_common_loader").EbLoader("hide");
                $("[data-coltyp=date]").datepicker("hide");
            }
        }.bind(this));

        jQuery.fn.dataTable.ext.errMode = 'alert';

        this.table_jQO.on('error.dt', function (settings, techNote, message) {
            console.log('An error has been reported by DataTables: ', message);
        });

        this.Api = this.table_jQO.DataTable(this.createTblObject());

        this.Api.off('select').on('select', this.selectCallbackFunc.bind(this));

        jQuery.fn.dataTable.Api.register('sum()', function () {
            return this.flatten().reduce(function (a, b) {
                if (typeof a === 'string') {
                    a = a.replace(/[^\d.-]/g, '') * 1;
                }
                if (typeof b === 'string') {
                    b = b.replace(/[^\d.-]/g, '') * 1;
                }

                return a + b;
            }, 0);
        });

        jQuery.fn.dataTable.Api.register('average()', function () {
            var data = this.flatten();
            var sum = data.reduce(function (a, b) {
                if (typeof a === 'string') {
                    a = a.replace(/[^\d.-]/g, '') * 1;
                }
                if (typeof b === 'string') {
                    b = b.replace(/[^\d.-]/g, '') * 1;
                }

                return (a * 1) + (b * 1); // cast values in-case they are strings
            }, 0);

            return sum / data.length;
        });

        jQuery.extend(jQuery.fn.dataTableExt.oSort, {
            "date-uk-pre": function (a) {
                if (a == null || a == "") {
                    return 0;
                }
                var ukDatea = a.split('/');
                return (ukDatea[2] + ukDatea[1] + ukDatea[0]) * 1;
            },

            "date-uk-asc": function (a, b) {
                return ((a < b) ? -1 : ((a > b) ? 1 : 0));
            },

            "date-uk-desc": function (a, b) {
                return ((a < b) ? 1 : ((a > b) ? -1 : 0));
            }
        });

        //this.table_jQO.off('draw.dt').on('draw.dt', this.doSerial.bind(this));

        //this.table_jQO.on('length.dt', function (e, settings, len) {
        //    console.log('New page length: ' + len);
        //});

        $.fn.dataTable.ext.errMode = function (settings, helpPage, message) {
            alert("ajax erpttt......");
        };


        //this.Api.on('row-reorder', function (e, diff, edit) {
        //});
    };

    this.addSerialAndCheckboxColumns = function () {
        this.CheckforColumnID();//, 
        var serialObj = (JSON.parse('{ "data":' + this.EbObject.Columns.$values.length + ', "searchable": false, "orderable": false, "bVisible":true, "name":"serial", "title":"#", "Type":11}'));
        if (this.IsTree) {
            serialObj.bVisible = false;
        }
        this.extraCol.push(serialObj);
        this.addcheckbox();
    }

    this.CheckforColumnID = function () {
        this.FlagPresentId = false;
        $.each(this.ebSettings.Columns.$values, function (i, col) {
            if (col.name === "id") {
                this.FlagPresentId = true;
                col.bVisible = false;
                return false;
            }
        }.bind(this));
    };

    this.addcheckbox = function () {
        var chkObj = new Object();
        chkObj.data = null;
        chkObj.title = "<input id='{0}_select-all' class='eb_selall" + this.tableId + "' type='checkbox' data-table='{0}'/>".replace("{0}", this.tableId);
        chkObj.sWidth = "10px";
        chkObj.orderable = false;
        chkObj.bVisible = false;
        chkObj.name = "checkbox";
        chkObj.Type = 3;
        chkObj.render = this.renderCheckBoxCol.bind(this);
        chkObj.pos = "-1";

        this.extraCol.push(chkObj);
    }

    this.createTblObject = function () {
        var o = new Object();
        //o.scrollY = "inherit";
        o.scrollX = "100%";
        //o.scrollXInner = "110%";
        o.scrollCollapse = true;
        if (this.ebSettings.PageLength !== 0) {
            o.lengthMenu = this.generateLengthMenu();
        }
        if (this.ebSettings.LeftFixedColumn > 0 || this.ebSettings.RightFixedColumn > 0)
            o.fixedColumns = { leftColumns: this.fixedColumnCount(), rightColumns: this.ebSettings.RightFixedColumn };
        o.pagingType = "full";
        o.buttons = ['copy', 'csv', 'excel', 'pdf', 'print', { extend: 'print', exportOptions: { modifier: { selected: true } } }];
        o.bAutoWidth = false;
        o.autowidth = false;
        o.serverSide = true;
        o.processing = true;
        o.pageResize = true;
        //o.deferRender = true;
        //o.scroller = true;
        o.language = {
            //processing: "<div class='fa fa-spinner fa-pulse fa-3x fa-fw'></div>",
            info: "_START_ - _END_ / _TOTAL_",
            paginate: {
                "previous": "Prev"
            },
            lengthMenu: "_MENU_ / Page",
        };
        o.columns = this.rowgroupCols.concat(this.extraCol, this.ebSettings.Columns.$values);
        o.order = [];
        o.deferRender = true;
        //o.filter = true;
        //o.select = true;
        //o.retrieve = true;
        o.keys = true;
        //this.filterValues = this.getFilterValues();
        //filterChanged = false;
        //if (!this.isTagged)
        //    this.compareFilterValues();
        //else
        //    filterChanged = true;
        //o.rowReorder = this.IsTree;
        if (this.MainData !== null && this.login == "uc" && !filterChanged && this.isPipped) {
            //o.serverSide = false;
            o.dom = "<'col-md-10 noPadding'B><'col-md-2 noPadding'f>rt";
            dvcontainerObj.currentObj.data = this.MainData;
            o.ajax = function (data, callback, settings) {
                setTimeout(function () {
                    callback({
                        draw: dvcontainerObj.currentObj.data.draw,
                        data: dvcontainerObj.currentObj.data.data,
                        recordsTotal: dvcontainerObj.currentObj.data.recordsTotal,
                        recordsFiltered: dvcontainerObj.currentObj.data.recordsFiltered,
                    });
                }, 50);
            }
            o.data = this.receiveAjaxData(this.MainData);
        }
        else {
            o.dom = "<'pagination-wrapper'liBp>rt";
            o.paging = true;
            o.lengthChange = true;
            if (!this.ebSettings.IsPaging) {
                if (this.IsTree) {
                    o.dom = "<'col-md-12 noPadding display-none'B><'col-md-12'i>rt";
                    o.language.info = "_START_ - _END_ / _TOTAL_ Entries";
                }
                else {
                    o.dom = "<'col-md-12 noPadding display-none'B>rt";
                }
                o.paging = false;
                o.lengthChange = false;
            }
            if (this.login === "uc") {
                dvcontainerObj.currentObj.Pippedfrom = "";
                $("#Pipped").text("");
                this.isPipped = false;
            }
            try {
                o.ajax = {
                    //url: this.ssurl + '/ds/data/' + this.dsid,
                    url: "../dv/getData",
                    type: 'POST',
                    timeout: 0,
                    data: this.ajaxData.bind(this),
                    dataSrc: this.receiveAjaxData.bind(this),
                    beforeSend: function () {
                    },
                    error: function (req, status, xhr) {
                    }
                };
            }
            catch (Error) {
                alert(Error);
            }
        }
        o.fnRowCallback = this.rowCallBackFunc.bind(this);
        o.drawCallback = this.drawCallBackFunc.bind(this);
        o.initComplete = this.initCompleteFunc.bind(this);
        //o.fnDblclickCallbackFunc = this.dblclickCallbackFunc.bind(this);
        return o;
    };

    this.generateLengthMenu = function () {
        var ia = [];
        for (var i = 0; i < 5; i++)
            ia[i] = (this.ebSettings.PageLength * (i + 1));
        return JSON.parse("[ [{0},-1], [{0},\"All\"] ]".replace(/\{0\}/g, ia.join(',')));
    }

    this.ajaxData = function (dq) {
        if (!this.isSecondTime) {
            $("#" + this.tableId + "_wrapper .dataTables_scrollFoot").hide();
            $("#" + this.tableId + "_wrapper .DTFC_LeftFootWrapper").hide();
            $("#" + this.tableId + "_wrapper .DTFC_RightFootWrapper").hide();
        }

        this.matchColumnSearchAndVisible();
        delete dq.columns; delete dq.order; delete dq.search;
        dq.RefId = this.EbObject.DataSourceRefId;
        dq.TFilters = this.columnSearch;
        if (this.filterValues.length === 0)
            this.filterValues = this.getFilterValues();
        dq.Params = this.filterValues;

        dq.OrderBy = this.getOrderByInfo();
        if (this.columnSearch.length > 0) {
            this.filterFlag = true;
        }
        dq.Ispaging = this.EbObject.IsPaging;
        if (dq.length === -1)
            dq.length = this.RowCount;
        this.RemoveColumnRef();
        dq.DataVizObjString = JSON.stringify(this.EbObject);
        if (this.CurrentRowGroup !== null)
            dq.CurrentRowGroup = JSON.stringify(this.CurrentRowGroup);
        dq.dvRefId = this.Refid;
        return dq;
    };

    this.getOrderByInfo = function () {
        var tempArray = [];
        if (this.CurrentRowGroup !== null) {
            if (this.CurrentRowGroup.RowGrouping.$values.length > 0) {
                for (let i = 0; i < this.CurrentRowGroup.RowGrouping.$values.length; i++)
                    tempArray.push(new order_obj(this.CurrentRowGroup.RowGrouping.$values[i].name, this.CurrentRowGroup.RowGrouping.$values[i].Direction));
            }
            if (this.orderColl.length > 0) {
                $.each(this.orderColl, function (i, obj) {
                    tempArray.push(obj);
                });
            }
            else {
                if (this.CurrentRowGroup.OrderBy.$values.length > 0) {
                    for (let i = 0; i < this.CurrentRowGroup.OrderBy.$values.length; i++)
                        tempArray.push(new order_obj(this.CurrentRowGroup.OrderBy.$values[i].name, this.CurrentRowGroup.OrderBy.$values[i].Direction));
                }
            }
        }

        if (tempArray.length === 0) {
            $.each(this.orderColl, function (i, obj) {
                tempArray.push(obj);
            });
            if (tempArray.length === 0) {
                $.each(this.EbObject.OrderBy.$values, function (i, obj) {
                    if (tempArray.filter(e => e.Column === obj.name).length === 0)
                        tempArray.push(new order_obj(obj.name, obj.Direction));
                });
            }
        }

        return tempArray;
    };

    this.getFilterValues = function (from) {
        //this.filterChanged = false;
        var fltr_collection = [];

        if (this.FD)
            fltr_collection = getValsForViz(this.FilterDialog.FormObj);


        //if (this.isContextual && from !== "compare") {
        //    if (from === "filter" && prevfocusedId !== undefined) {
        //        $.each(dvcontainerObj.dvcol[prevfocusedId].filterValues, function (i, obj) {
        //            var f = false;
        //            $.each(fltr_collection, function (j, fObj) {
        //                if (fObj.Name === obj.Name)
        //                    f = true;
        //            });
        //            if (!f)
        //                fltr_collection.push(obj);
        //        });
        //    }
        //    else {
        //        if (this.rowData !== null && this.rowData !== "") {
        //            if (this.Api !== null) {
        //                if (prevfocusedId === undefined)
        //                    from = "link";
        //                $.each(this.rowData, this.rowObj2filter.bind(this, fltr_collection, from));
        //            }
        //        }
        //    }
        //}

        return fltr_collection;
    };

    this.rowObj2filter = function (fltr_collection, from, i, data) {
        if (i < this.EbObject.Columns.$values.length) {
            if (from === "link") {
                var type = this.EbObject.Columns.$values[i].Type;
                //if (type === 5 || type === 6)
                //    data = this.renderDateformat(data, "-");
                if (data !== "")
                    fltr_collection.push(new fltr_obj(type, this.EbObject.Columns.$values[i].name, data));
            }
            else {
                if (dvcontainerObj.dvcol[prevfocusedId].Api !== null) {
                    var type = dvcontainerObj.dvcol[prevfocusedId].EbObject.Columns.$values[i].Type;
                    fltr_collection.push(new fltr_obj(type, dvcontainerObj.dvcol[prevfocusedId].EbObject.Columns.$values[i].name, data));
                }
            }
        }
    };

    this.getfilterFromRowdata = function () {
        var filters = [];
        if (parseInt(this.linkDV.split("-")[2]) !== EbObjectTypes.WebForm) {
            $.each(this.EbObject.Columns.$values, function (i, col) {
                if (this.rowData[col.data] !== "")
                    filters.push(new fltr_obj(col.Type, col.name, this.rowData[col.data]));
            }.bind(this));
        }
        else {
            var temp = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.LinkRefId === this.linkDV; }.bind(this));
            this.dvformMode = temp[0].FormMode;
            if (temp[0].FormMode === 1) {
                var col = temp[0].FormId.$values;
                $.each(col, function (i, col) {
                    filters.push(new fltr_obj(col.Type, col.name, this.rowData[col.data]));
                }.bind(this));
            }
            else if (temp[0].FormMode === 2) {
                var cols = temp[0].FormParameters.$values;
                $.each(cols, function (i, col) {
                    if (this.rowData[col.data] !== "")
                        filters.push(new fltr_obj(col.Type, col.name, this.rowData[col.data]));
                }.bind(this));
            }
        }
        return filters;
    };

    this.placefiltervalues = function () {
        //if (this.filterValues.length > 0) {
        //    $.each(this.filterValues, function (i, param) {
        //        $("#" + this.ContextId + ' #' + param.Name).val(param.Value);
        //    });
        //}
        $.each(getFlatControls(this.FilterDialog.FormObj), function (i, obj) {
            var mapobj = getObjByval(this.filterValues, "Name", obj.Name);
            if (typeof mapobj !== "undefined") {
                let val = mapobj.Value;
                obj.setValue(val);
            }
        }.bind(this));
    }

    this.filterDisplay = function () {
        var $controls = $("#" + this.ContextId + " #filterBox").children().not("[type=hidden],button");
        var filter = "";
        var filterdialog = [], columnFilter = [];
        if ($controls.length > 0) {
            $.each($controls, function (i, ctrl) {
                var o = new displayFilter();
                var ctype = $(ctrl).attr("ctype");
                o.name = $($(ctrl).children()[0]).text();
                o.operator = "=";
                if (ctype === "PowerSelect")
                    o.value = $(ctrl).find("input").attr("display-members");
                else if (ctype === "Date")
                    o.value = $(ctrl).find("input").val();
                else if (ctype === "RadioGroup")
                    o.value = $(ctrl).children().find("[type=radio]:checked").val();
                else if (ctype === "SimpleSelect")
                    o.value = $(ctrl).children().find("option:selected").text();
                else if (ctype === "UserLocation") {
                    if ($(ctrl).children().find("[type=checkbox][class=userloc-checkbox]").prop("checked"))
                        o.value = "Global";
                    else
                        o.value = $(ctrl).children().find(".active").text().trim().split(" ").join(",");
                }
                else
                    o.value = $($(ctrl).children()[1]).val();

                if (typeof $controls[i + 1] !== "undefined")
                    o.logicOp = "AND";
                else
                    o.logicOp = "";
                if (o.value !== undefined && o.value !== null && o.value !== "")
                    filterdialog.push(o);
            });
        }

        if (this.columnSearch.length > 0) {
            for (i = 0; i < this.columnSearch.length; i++) {
                //$.each(this.columnSearch, function (i, search) {
                search = this.columnSearch[i];
                var o = new displayFilter();
                o.name = search.Column;
                o.operator = search.Operator;
                var searchobj = $.grep(this.columnSearch, function (ob) { return ob.Column === search.Column });
                if (searchobj.length === 1) {
                    if (search.Value.toString().includes("|")) {
                        $.each(search.Value.split("|"), function (j, val) {
                            if (val.trim() !== "") {
                                var o = new displayFilter();
                                o.name = search.Column;
                                o.operator = search.Operator;
                                o.value = val;
                                if (typeof search.Value.split("|")[j + 1] !== "undefined" && search.Value.split("|")[j + 1].trim() !== "")
                                    o.logicOp = "OR";
                                else if (typeof this.columnSearch[i + 1] !== "undefined")
                                    o.logicOp = "AND";
                                else
                                    o.logicOp = "";
                                columnFilter.push(o);
                            }
                        }.bind(this));
                    }
                    else {
                        o.value = search.Value;
                        if (typeof this.columnSearch[i + 1] !== "undefined")
                            o.logicOp = "AND";
                        else
                            o.logicOp = "";
                        columnFilter.push(o);
                    }
                }
                else {
                    i++;
                    o.value = searchobj[0].Value + " AND " + searchobj[1].Value;
                    o.operator = "BETWEEN";
                    if (typeof this.columnSearch[i + 1] !== "undefined")
                        o.logicOp = "AND";
                    else
                        o.logicOp = "";
                    columnFilter.push(o);
                }
            }
        }
        this.Tags = new EbTags({ "displayFilterDialogArr": filterdialog, "displayColumnSearchArr": columnFilter, "id": "#filterdisplayrowtd_" + this.tableId + "", "remove": this.closeTag });
        //this.Tags = new EbTags({ "displayFilterDialogArr": $controls, "displayColumnSearchArr": this.columnSearch, "id": "#filter_Display", "remove": this.closeTag });
    };

    this.closeTag = function (e, obj) {
        var searchObj = $.grep(this.columnSearch, function (ob) { return ob.Column === obj.name; });
        var index = this.columnSearch.findIndex(x => x.Column == obj.name);
        if (searchObj.length === 1) {
            if (searchObj[0].Value.includes("|")) {
                if (this.columnSearch[index].Value.includes(obj.value + "|"))
                    var val = this.columnSearch[index].Value.replace(obj.value + "|", "");
                else
                    var val = this.columnSearch[index].Value.replace("|" + obj.value, "");
                if (val.trim() != "")
                    this.columnSearch[index].Value = val;
                else
                    this.columnSearch.splice(index, 1);
            }
            else
                this.columnSearch.splice(index, 1);
        }
        else
            this.columnSearch.splice(index, 2);
        this.Api.ajax.reload();
    }.bind(this);

    this.matchColumnSearchAndVisible = function () {

    }

    this.getfilter = function (fltr_collection, i, data) {
        fltr_collection.push(new fltr_obj(data.Type, data.name, this.rowData[i]));
    };

    this.receiveAjaxData = function (dd) {
        if (dd.responseStatus.message !== null) {
            EbPopBox("show", { Message: dd.responseStatus.message, Title:"Error" });
        }
        this.isRun = true;
        if (this.login === "uc") {
            dvcontainerObj.currentObj.data = dd;
        }
        this.MainData = dd;
        this.RowCount = dd.recordsFiltered;
        //return dd.data;
        this.unformatedData = dd.data;
        this.Levels = dd.levels;
        this.permission = dd.permission;
        this.summary = dd.summary;
        this.tableName = dd.tableName;
        this.treeData = dd.tree;
        this.SetColumnRef();
        this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
        return dd.formattedData;
    };

    this.fixedColumnCount = function () {
        var count = this.ebSettings.LeftFixedColumn;
        var visCount = 0;
        if (count > 1) {
            $.each(this.EbObject.Columns.$values, function (i, col) {
                if (!col.bVisible) {
                    if (this.ebSettings.LeftFixedColumn > visCount)
                        count++;
                    else
                        return false;
                }
                else
                    visCount++;
            }.bind(this));
        }
        return count;
    }

    this.ColumnsComparer = function (a, b) {
        if (a.data < b.data) return -1;
        if (a.data > b.data) return 1;
        if (a.data === b.data) return 0;
    };

    this.getAgginfo = function () {
        var _ls = [];
        $.each(this.ebSettings.Columns.$values, this.getAgginfo_inner.bind(this, _ls));
        return _ls;
    };

    this.getAgginfo_inner = function (_ls, i, col) {
        if (col.bVisible && (col.RenderType == parseInt(gettypefromString("Int32")) || col.RenderType == parseInt(gettypefromString("Decimal")) || col.RenderType == parseInt(gettypefromString("Int64")) || col.RenderType == parseInt(gettypefromString("Double")) || col.RenderType == parseInt(gettypefromString("Numeric"))) && col.name !== "serial") {
            _ls.push(new Agginfo(col.name, this.ebSettings.Columns.$values[i].DecimalPlaces, col.data));
            this.NumericIndex.push(col.data);
        }
    };

    this.getFooterFromSettingsTbl = function () {
        var ftr_part = "";
        $.each(this.rowgroupCols, function (i, col) {
            if (col.bVisible)
                ftr_part += "<th></th>";
            else
                ftr_part += "<th style=\"display:none;\"></th>";
        });
        $.each(this.extraCol, function (i, col) {
            if (col.bVisible)
                ftr_part += "<th></th>";
            else
                ftr_part += "<th style=\"display:none;\"></th>";
        });
        $.each(this.ebSettings.Columns.$values, function (i, col) {
            if (col.bVisible)
                ftr_part += "<th></th>";
            else
                ftr_part += "<th style=\"display:none;\"></th>";
        });
        return "<tfoot>" + ftr_part + "</tfoot>";
    };

    this.repopulate_filter_arr = function () {
        var table = this.tableId;
        var filter_obj_arr = [];
        var api = this.Api;
        if (api !== null) {
            this.Api.columns().every(function (i) {
                var colum = api.settings().init().aoColumns[i].name;
                if (colum !== 'checkbox' && colum !== 'serial') {
                    var oper;
                    var val1, val2;
                    var textid = '#' + table + '_' + colum + '_hdr_txt1';
                    //var type = $(textid).attr('data-coltyp');
                    var type = api.settings().init().aoColumns[i].Type;
                    var Rtype = api.settings().init().aoColumns[i].RenderType;
                    if (Rtype === 3) {
                        var obj = this.EbObject.Columns.$values.find(x => x.name === colum);
                        val1 = ($(textid).is(':checked')) ? obj.TrueValue : obj.FalseValue;
                        if (!($(textid).is(':indeterminate')))
                            filter_obj_arr.push(new filter_obj(colum, "=", val1, type));
                    }
                    else {
                        oper = $('#' + table + '_' + colum + '_hdr_sel').text().trim();
                        if (api.columns(i).visible()[0]) {
                            if (oper !== '' && $(textid).val() !== '') {
                                if (oper === 'B') {
                                    val1 = $(textid).val();
                                    val2 = $(textid).siblings('input').val();
                                    if (oper === 'B' && val1 !== '' && val2 !== '') {
                                        if (Rtype === 8 || Rtype === 7 || Rtype === 11 || Rtype === 12) {
                                            filter_obj_arr.push(new filter_obj(colum, ">=", Math.min(val1, val2)));
                                            filter_obj_arr.push(new filter_obj(colum, "<=", Math.max(val1, val2), type));
                                        }
                                        else if (Rtype === 5 || Rtype === 6) {
                                            //val1 = this.changeDateOrder(val1);
                                            //val2 = this.changeDateOrder(val2);
                                            if (val2 > val1) {
                                                filter_obj_arr.push(new filter_obj(colum, ">=", val1, type));
                                                filter_obj_arr.push(new filter_obj(colum, "<=", val2, type));
                                            }
                                            else {
                                                filter_obj_arr.push(new filter_obj(colum, ">=", val2, type));
                                                filter_obj_arr.push(new filter_obj(colum, "<=", val1, type));
                                            }
                                        }
                                    }
                                }
                                else {
                                    var data = $(textid).val();
                                    filter_obj_arr.push(new filter_obj(colum, oper, data, type));
                                }
                            }
                        }
                    }
                }
            }.bind(this));
        }
        return filter_obj_arr;
    };

    this.rowCallBackFunc = function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
        //this.colorRow(nRow, aData, iDisplayIndex, iDisplayIndexFull);
        if (this.treeColumn) {
            let elem = aData[this.treeColumn.data].split("&nbsp;").join("").split("&emsp;").join("");
            let treeElem = $(elem);
            $(nRow).attr("data-lvl", treeElem.attr("data-level"));
            if (treeElem.hasClass("groupform")) {
                $(nRow).children(`td:eq(${this.treeColumnIndex})`).addClass("groupform");
                $(nRow).children(`td:eq(${this.treeColumnIndex})`).children().removeClass("groupform");
            }
            else {
                $(nRow).children(`td:eq(${this.treeColumnIndex})`).addClass("itemform");
                $(nRow).children(`td:eq(${this.treeColumnIndex})`).children().removeClass("itemform");
            }
        }
    };

    this.initCompleteFunc = function (settings, json) {
        this.Run = false;
        this.GenerateButtons();
        if (this.login == "uc") {
            this.initCompleteflag = true;
            //if (this.isSecondTime) { }
            //this.ModifyingDVs(dvcontainerObj.currentObj.Name, "initComplete");            
        }

        if (!this.IsTree)
            this.createFilterRowHeader();
        else
            this.createFilterforTree();
        this.filterDisplay();
        this.createFooter();
        this.arrangeWindowHeight();
        $("#" + this.tableId + "_wrapper .dataTables_scrollFoot").show();
        $("#" + this.tableId + "_wrapper .DTFC_LeftFootWrapper").show();
        $("#" + this.tableId + "_wrapper .DTFC_RightFootWrapper").show();
        $("#" + this.tableId + "_wrapper .dataTables_scrollFoot").style("padding-top", "100px", "important");
        $("#" + this.tableId + "_wrapper .dataTables_scrollFoot").style("margin-top", "-100px", "important");

        this.addFilterEventListeners();
        this.arrangeFooterWidth();
        //this.arrangefixedHedaerWidth();
        this.placeFilterInText();
        //this.check4Scroll();
        this.Api.columns.adjust();

        $("#eb_common_loader").EbLoader("hide");
        //this.contextMenu4Cell();
        //this.contextMenu();
        if (this.login === "uc") {
            if (!this.EbObject.DisableCopy)
                $("#" + focusedId + " .wrapper-cont").removeClass("userselect").addClass("userselect");
            else
                $("#" + focusedId + " .wrapper-cont").removeClass("userselect");
        }
        else {
            if (!this.EbObject.DisableCopy)
                $(".wrapper-cont").removeClass("userselect").addClass("userselect");
            else
                $(" .wrapper-cont").removeClass("userselect");
        }
        this.isSecondTime = true;
    }

    this.contextMenu = function () {
        $.contextMenu({
            selector: ".tablelink",
            items: {
                "OpenNewTab": { name: "Open in New Tab", icon: "fa-external-link-square", callback: this.OpeninNewTab.bind(this) }
            }
        });
    }

    this.contextMenu4Label = function () {
        $.contextMenu({
            selector: ".labeldata",
            items: {
                "Copy": { name: "Copy", icon: "fa-external-link-square", callback: this.copyLabelData.bind(this) }
            }
        });
    }

    this.contextMenu4Cell = function () {
        var isDisable = this.EbObject.DisableCopy;
        $.contextMenu('destroy', ".tdheight");
        $.contextMenu({
            selector: ".tdheight",
            items: {
                "Copy": {
                    name: "Copy", icon: "fa-external-link-square", callback: this.copyCellData.bind(this),
                    disabled: function (key, opt) {
                        return isDisable;
                    }
                }
            }
        });

        $('.tdheight').on('contextmenu', function (e) {
            alert(1);
            e.preventDefault();
            return false;
        });
    };

    this.copyCellData = function (key, opt, event) {

    };

    this.OpeninNewTab = function (key, opt, event) {
        var cData = opt;
        this.isContextual = true;
        var idx;
        if (event !== undefined) {
            idx = this.Api.row(opt.$trigger.parent().parent()).index();
            cData = opt.$trigger.text();
        }
        else
            idx = key;

        var splitarray = this.linkDV.split("-");
        if (splitarray[2] === "3") {
            var url = "../ReportRender/BeforeRender?refid=" + this.linkDV;
            var copycelldata = cData.replace(/[^a-zA-Z ]/g, "").replace(/ /g, "_");
            if ($(`#RptModal${copycelldata}`).length !== 0)
                $(`#RptModal${copycelldata}`).remove();
            $("#parent-div0").append(`<div class="modal fade RptModal" id="RptModal${copycelldata}" role="dialog">
                <div class="modal-dialog modal-sm">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal">&times;</button>                              
                        </div>
                        <div class="modal-body"> <iframe id="reportIframe${copycelldata}" class="reportIframe" src='../ReportRender/Renderlink?refid=${this.linkDV}&_params=${btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValues))))}'></iframe>
            </div>
                    </div>
                </div>
            </div>
            `);
            $(`#RptModal${copycelldata}`).modal();
            $(`#reportIframe${copycelldata}`).css("height", "80vh");
            //else {
            //    $(`#RptModal${copycelldata}`).modal();
            //    $.LoadingOverlay("hide");
            //}
        }
        else if (splitarray[2] === "0") {
            let url = "../webform/index?refid=" + this.linkDV;
            var _form = document.createElement("form");
            _form.setAttribute("method", "post");
            _form.setAttribute("action", url);
            _form.setAttribute("target", "_blank");

            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_params";
            input.value = btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValuesforForm))));
            _form.appendChild(input);

            input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_mode";
            input.value = this.dvformMode;
            _form.appendChild(input);

            input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_locId";
            input.value = store.get("Eb_Loc-" + this.TenantId + this.UserId);
            _form.appendChild(input);

            document.body.appendChild(_form);
            _form.submit();
            document.body.removeChild(_form);
        }
        else {
            this.tabNum++;
            let url = "../DV/dv?refid=" + this.linkDV;

            let _form = document.createElement("form");
            _form.setAttribute("method", "post");
            _form.setAttribute("action", url);
            _form.setAttribute("target", "_blank");

            let input = document.createElement('input');
            input.type = 'hidden';
            input.name = "rowData";

            input.value = btoa(unescape(encodeURIComponent(JSON.stringify(this.rowData))));
            _form.appendChild(input);

            let input1 = document.createElement('input');
            input1.type = 'hidden';
            input1.name = "filterValues";
            input1.value = btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValues))));
            _form.appendChild(input1);

            let input2 = document.createElement('input');
            input2.type = 'hidden';
            input2.name = "tabNum";
            input2.value = this.tabNum;
            _form.appendChild(input2);

            document.body.appendChild(_form);

            //note I am using a post.htm page since I did not want to make double request to the page 
            //it might have some Page_Load call which might screw things up.
            //window.open("post.htm", name, windowoption);       
            _form.submit();
            document.body.removeChild(_form);
        }
    };

    this.arrangeFooterWidth = function () {
        var lfoot = $('#' + this.tableId + '_wrapper .DTFC_LeftFootWrapper table');
        var rfoot = $('#' + this.tableId + '_wrapper .DTFC_RightFootWrapper table');
        var scrollfoot = $('#' + this.tableId + '_wrapper .dataTables_scrollFootInner table');

        if (this.ebSettings.LeftFixedColumn > 0 || this.ebSettings.RightFixedColumn > 0) {
            if (this.ebSettings.LeftFixedColumn > 0) {
                for (var j = 0; j < this.ebSettings.LeftFixedColumn; j++) {
                    $(lfoot).children().find("tr").eq(0).children("th").eq(j).css("width", scrollfoot.find("tfoot").children("tr").eq(0).children("th").eq(j).css("width"));
                }
            }

            if (this.ebSettings.RightFixedColumn > 0) {
                var start = scrollfoot.find("tr").eq(0).children().length - this.ebSettings.RightFixedColumn;
                for (var j = 0; (j + start) < scrollfoot.find("tr").eq(0).children().length; j++) {
                    $(rfoot).children().find("tr").eq(0).children("th").eq(j).css("width", scrollfoot.find("tfoot").children("tr").eq(0).children("th").eq(j + start).css("width"));
                }
            }
        }

        $("#" + this.tableId + " thead tr:eq(1) .eb_finput").parent().remove();
    };

    this.arrangefixedHedaerWidth = function () {
        var lhead = $('#' + this.tableId + '_wrapper .DTFC_LeftHeadWrapper table');
        var rhead = $('#' + this.tableId + '_wrapper .DTFC_RightHeadWrapper table');
        var lbody = $('#' + this.tableId + '_wrapper .DTFC_LeftBodyLiner table');

        if (this.ebSettings.LeftFixedColumn > 0 || this.ebSettings.RightFixedColumn.length > 0) {
            if (this.ebSettings.LeftFixedColumn > 0) {
                for (var j = 0; j < this.ebSettings.LeftFixedColumn; j++) {
                    $(lhead).children().find("tr").eq(0).children("th").eq(j).css("width", lbody.find("tbody").children("tr").eq(0).children("td").eq(j).css("width"));
                }
            }

            if (this.ebSettings.RightFixedColumn > 0) {
                var start = lbody.find("tr").eq(0).children().length - this.ebSettings.RightFixedColumn;
                for (var j = 0; (j + start) < lbody.find("tr").eq(0).children().length; j++) {
                    $(rhead).children().find("tr").eq(0).children("th").eq(j).css("width", lbody.find("tbody").children("tr").eq(0).children("td").eq(j + start).css("width"));
                }
            }
        }


        $("#" + this.tableId + " thead tr:eq(1) .eb_finput").parent().remove();
    };

    this.placeFilterInText = function () {
        if (this.columnSearch.length > 0) {
            if ($('#clearfilterbtn_' + this.tableId).children("i").hasClass("fa-filter"))
                $('#clearfilterbtn_' + this.tableId).children("i").removeClass("fa-filter").addClass("fa-times");
        }
        else {
            if ($('#clearfilterbtn_' + this.tableId).children("i").hasClass("fa-times"))
                $('#clearfilterbtn_' + this.tableId).children("i").removeClass("fa-times").addClass("fa-filter");
        }

        this.Api.columns().every(function (i) {
            var colum = this.Api.settings().init().aoColumns[i].name;
            var colObj = $.grep(this.columnSearch, function (obj) { return obj.Column === colum; });

            var textid = '#' + this.tableId + '_' + colum + '_hdr_txt1';
            if (colum !== 'checkbox' && colum !== 'serial' && colObj.length > 0) {
                var oper;
                var val1, val2;
                var type = $(textid).attr('data-coltyp');
                if (type === 'boolean') {
                    if (colObj.Value === "true")
                        $(textid).attr("checked", true);
                    else if (colObj.Value === "false")
                        $(textid).attr("checked", false);
                    else
                        $(textid).attr("indeterminate", true);
                }
                else {
                    if (this.Api.columns(i).visible()[0]) {
                        if (colObj[0].Operator !== '' && colObj[0].Value !== '') {
                            if (colObj.length === 2) {
                                //$('#' + this.tableId + '_' + colum + '_hdr_sel').text("B");
                                //if (type === "date")
                                //    $(textid).val(this.retainDateOrder(colObj[0].Value));
                                //else
                                $(textid).val(colObj[0].Value);
                                $(".eb_fsel" + this.tableId + "[data-colum=" + colum + "]").trigger("click");
                                //if (type === "date")
                                //    $(textid).siblings('input').val(this.retainDateOrder(colObj[1].Value));
                                //else
                                $(textid).siblings('input').val(colObj[1].Value);
                            }
                            else {
                                //if (type === "date")
                                //    $(textid).val(this.retainDateOrder(colObj[0].Value));
                                //else
                                $(textid).val(colObj[0].Value);
                                $('#' + this.tableId + '_' + colum + '_hdr_sel').text(colObj[0].Operator);
                            }
                        }
                    }
                }
            }
            else {
                if ($(textid).attr("type") === "checkbox")
                    $(textid).prop('indeterminate', true);
                else {
                    $(textid).val("");
                    if ($(textid).next().length === 1)
                        $(textid).next().val("");
                }
            }
        }.bind(this));
        //}
    }

    this.check4Scroll = function () {
        var scrollBody = $('#' + this.tableId + '_wrapper .dataTables_scrollBody');
        if (scrollBody[0].scrollHeight > scrollBody.height()) {
            scrollBody.children().css("width", "110%");
            scrollBody.siblings(".dataTables_scrollFoot").style("width", "98.65%", "important");
        }
        else {
            scrollBody.children().css("width", "100%");
            scrollBody.siblings(".dataTables_scrollFoot").style("width", "100%", "important");
        }

    };

    this.arrangeWindowHeight = function () {
        var filterId = "#filterdisplayrowtd_" + this.tableId;
        if (this.login === "uc") {
            if (this.IsTree) {
                $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 52px)", "important");
            }
            else if ($(filterId).children().length === 0 && !this.ebSettings.IsPaging && !this.EbObject.AllowMultilineHeader)
                $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 62px)", "important");
            else {
                if ($(filterId).children().length === 0 && !this.ebSettings.IsPaging && this.EbObject.AllowMultilineHeader) {//multilineonly
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 79px)", "important");
                }
                else if ($(filterId).children().length === 0 && this.ebSettings.IsPaging && !this.EbObject.AllowMultilineHeader) {//pagingonly
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 88px)", "important");
                }
                else if ($(filterId).children().length !== 0 && !this.ebSettings.IsPaging && !this.EbObject.AllowMultilineHeader) {//filteronly
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 86px)", "important");
                }
                else if ($(filterId).children().length === 0 && this.ebSettings.IsPaging && this.EbObject.AllowMultilineHeader) {//paging & multiline
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 104px)", "important");
                }
                else if ($(filterId).children().length !== 0 && !this.ebSettings.IsPaging && this.EbObject.AllowMultilineHeader) {//filter & multiline
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 102px)", "important");
                }
                else if ($(filterId).children().length !== 0 && this.ebSettings.IsPaging && !this.EbObject.AllowMultilineHeader) {//filetr & paging
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 112px)", "important");
                }
                else {
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 127px)", "important");//filter && paging & multiline
                }
            }
            //this.stickBtn.$stickBtn.css("top", "46px");
        }
        else {
            $(".dv-body2").style("height", "calc( 100vh - 38px )", "important");
            if (this.tabNum !== 0) {
                $("#sub_window_" + this.tableId).style("height", "calc(100vh - 40px)", "important");
                if ($(filterId).children().length === 0 && !this.ebSettings.IsPaging)
                    $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 40px)", "important");
                else {
                    if ($(filterId).children().length === 0)
                        $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 55px)", "important");
                    else if (!this.ebSettings.IsPaging)
                        $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 58px)", "important");
                    else
                        $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 90px)", "important");
                }
            }
            else {
                if (this.IsTree)
                    $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 32px)", "important");
                else if ($(filterId).children().length === 0 && !this.ebSettings.IsPaging)
                    $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 42px)", "important");
                else {
                    if ($(filterId).children().length === 0)
                        $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 68px)", "important");
                    else if (!this.ebSettings.IsPaging)
                        $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 65px)", "important");
                    else
                        $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 93px)", "important");
                }
            }
        }
    }

    this.copyLabelData = function (key, opt, event) {

    }

    this.ModifyingDVs = function (parentName, source) {
        $.each(dvcontainerObj.dvcol, function (key, obj) {
            if (parentName === obj.EbObject.Pippedfrom) {
                if (obj.EbObject.$type.indexOf("EbChartVisualization") !== -1 || obj.EbObject.$type.indexOf("EbGoogleMap") !== -1) {
                    dvcontainerObj.dvcol[key].EbObject.data = dvcontainerObj.currentObj.data;
                    dvcontainerObj.dvcol[key].drawGraphHelper(this.Api.data());
                    this.ModifyingDVs(dvcontainerObj.dvcol[key].EbObject.Name, "draw");
                }
                else {
                    if (source === "draw") {
                        dvcontainerObj.dvcol[key].modifyDVFlag = true;
                        dvcontainerObj.dvcol[key].Api.clear().rows.add(this.Api.data());
                        dvcontainerObj.dvcol[key].EbObject.data = dvcontainerObj.currentObj.data;
                        dvcontainerObj.dvcol[key].Api.columns.adjust().draw();
                        this.ModifyingDVs(dvcontainerObj.dvcol[key].EbObject.Name, "draw");
                    }
                }
            }
        }.bind(this));
    }

    this.drawCallBackFunc = function (settings) {
        $('tbody [data-toggle=toggle]').bootstrapToggle();
        if (this.EbObject.RowGroupCollection.$values.length > 0)
            this.doRowgrouping();
        if (this.login === "uc" && !this.modifyDVFlag && this.initCompleteflag) {
            //this.ModifyingDVs(dvcontainerObj.currentObj.Name, "draw");
        }
        if (this.isSecondTime) {
            //if (this.columnSearch.length > 0)
            this.filterDisplay();
            this.addFilterEventListeners();
            this.placeFilterInText();
            //this.arrangefixedHedaerWidth();
            this.summarize2();
            this.arrangeWindowHeight();
        }
        this.Api.columns.adjust();
    };

    this.selectCallbackFunc = function (e, dt, type, indexes) {
    };

    this.clickCallbackFunc = function (e) {
    };

    this.dblclickCallbackFunc = function (e) {
    };

    this.rowGroupHandler = function (e) {
        this.orderColl = [];
        let name = $(e.target).val().trim();
        if (!(name === "None")) {
            this.EbObject.DisableRowGrouping = false;
            $.each(this.EbObject.RowGroupCollection.$values, function (i, obj) {
                if (obj.Name === name) {
                    this.CurrentRowGroup = jQuery.extend({}, obj);
                    this.getColumnsSuccess(e);
                }
            }.bind(this));
        }
        else {
            this.EbObject.DisableRowGrouping = true;
            this.getColumnsSuccess();
        }
    };

    this.visibilityCheck = function () {
        this.RGIndex = [];
        this.ebSettings.LeftFixedColumn = 0;
        this.ebSettings.RightFixedColumn = 0;
        this.rowgroupCols = [];
        let visibleChanges = false;
        $.each(this.CurrentRowGroup.RowGrouping.$values, function (i, rgobj) {
            this.RGIndex.push(rgobj.data);
            this.rowgroupCols.unshift(JSON.parse('{ "searchable": false, "orderable": false, "bVisible":true, "data":null, "defaultContent": ""}'));
        }.bind(this));

        if (this.rowgroupCols.length > 0 && this.CurrentRowGroup.$type.indexOf("MultipleLevelRowGroup") !== -1)
            this.rowgroupCols.unshift(JSON.parse('{ "searchable": false, "orderable": false, "bVisible":true, "name":"AllGroup", "data":null, "defaultContent": ""}'));

        $.each(this.EbObject.Columns.$values, function (i, colobj) {
            visibleChanges = false;
            $.each(this.CurrentRowGroup.RowGrouping.$values, function (i, rgobj) {
                if (colobj.name === rgobj.name) {
                    colobj.bVisible = false;
                    visibleChanges = true;
                }
            }.bind(this));

            $.each(this.EbObject.NotVisibleColumns.$values, function (i, nonvis) {
                if (colobj.name === nonvis.name) {
                    colobj.bVisible = false;
                    visibleChanges = true;
                }
            }.bind(this));

            if (!visibleChanges)
                colobj.bVisible = true;
            if (colobj.name === "id")
                colobj.bVisible = false;
        }.bind(this));

    }

    this.doRowgrouping = function () {
        var rows = this.Api.rows().nodes();
        var count = this.Api.columns()[0].length;
        $(rows).eq(0).before(`<tr class='group-All' id='group-All_${this.tableId}'></tr>`);
        $(`#group-All_${this.tableId}`).append(`<td  colspan="${count}"><select id="rowgroupDD_${this.tableId}" class="rowgroupselect"></select></td>`);
        $.each(this.EbObject.RowGroupCollection.$values, function (i, obj) {
            if (obj.RowGrouping.$values.length > 0) {
                $(`#rowgroupDD_${this.tableId}`).append(`<option value="${obj.Name.trim()}">${obj.DisplayName}</option>`);
            }
        }.bind(this));
        $(`#rowgroupDD_${this.tableId}`).append(`<option value="None">None</option>`);
        $(`#rowgroupDD_${this.tableId}`).off("change").on("change", this.rowGroupHandler.bind(this));
        if (this.CurrentRowGroup !== null) {
            $(`#group-All_${this.tableId}`).prepend(`<td><i class='fa fa-minus-square-o' style='cursor:pointer;'></i></td>`);
            $(`#rowgroupDD_${this.tableId} [value=${this.CurrentRowGroup.Name.trim()}]`).attr("selected", "selected");

            rows = this.Api.rows().nodes();
            $.each(this.Levels, function (i, obj) {
                if (obj.insertionType !== "After")
                    $(rows).eq(obj.rowIndex).before(obj.html);
                else
                    $(rows).eq(obj.rowIndex).after(obj.html);
            });
            var ct = $("#" + this.tableId + " .group[group=1]").length;
            $(`#group-All_${this.tableId} td[colspan=${count}]`).prepend(` Groups (${ct}) - `);

            $("#" + this.tableId + " tbody").off("click", "tr.group").on("click", "tr.group", this.collapseGroup);
            $("#" + this.tableId + " tbody").off("click", "tr.group-All").on("click", "tr.group-All", this.collapseAllGroup);
        }
        else {
            $(`#rowgroupDD_${this.tableId} [value=None`).attr("selected", "selected");
            $(`#group-All_${this.tableId} td[colspan=${count}]`).prepend(` Groups `);
        }
    };

    this.singlelevelRowgrouping = function () {
        var rows = this.Api.rows().nodes();
        var rowsdata = this.Api.rows().data();
        var index = this.RGIndex;
        var count = this.Api.columns()[0].length;
        var lastrow = -1;
        var last = null;
        var colobj = {};
        var groupString = "";
        var groupArray = [];
        this.rowgroupFilter = [];
        $.each(this.NumericIndex, function (k, num) {
            if (!(num in colobj)) {
                colobj[num] = new Array();
            }
        });

        $.each(this.unformatedData, function (i, _dataArray) {
            groupString = "";
            groupArray = []
            $.each(index, function (j, dt) {
                groupArray.push((_dataArray[dt].trim() === "") ? "(Blank)" : _dataArray[dt].trim());
                groupString += (_dataArray[dt].trim() === "") ? "(Blank)" : _dataArray[dt].trim();
                if (typeof index[j + 1] !== "undefined")
                    groupString += ",";
            }.bind(this));

            if (last !== groupString) {
                if (last === null || Object.keys(colobj).length === 0)
                    $(rows).eq(i).before(this.getGroupRowSingle(count, groupArray));
                else {
                    var rowstring = this.getSubRow(colobj, groupString, count);
                    $(rows).eq(i).before(rowstring);
                    $(rows).eq(i).before(this.getGroupRowSingle(count, groupArray));
                }
                last = groupString;
                $.each(colobj, function (key, val) {
                    colobj[key] = [];
                    colobj[key].push(_dataArray[key]);
                });
            }
            else {
                $.each(colobj, function (key, val) {
                    colobj[key].push(_dataArray[key]);
                });
            }
            lastrow = i;
        }.bind(this));

        if (Object.keys(colobj).length !== 0 && ($(rows).eq(lastrow).hasClass("odd") || $(rows).eq(lastrow).hasClass("even"))) {
            var rowstring = this.getSubRow(colobj, groupString, count);
            $(rows).eq(lastrow).after(rowstring);
        }

        var ct = $(".group[group=0]").length;
        $(`#group-All_${this.tableId} td[colspan=${count}]`).prepend(` All Groups (${ct}) - `);
        this.getRowsCount(count, "single");
    }

    this.getGroupRowSingle = function (count, groupArray) {
        var str = "<tr class='group' group='0'><td> &nbsp;</td>";
        var tempstr = "";
        $.each(this.RGIndex, function (j, dt) {
            var tempobj = $.grep(this.EbObject.CurrentRowGroup.RowGrouping.$values, function (obj) { return dt === obj.data });
            var type = tempobj[0].Type;
            //if (type === 5 || type === 6) {
            //    groupArray[j] = this.renderDateformat(groupArray[j], "/");
            //}
            if (tempobj[0].LinkRefId !== null)
                tempstr += tempobj[0].sTitle + `: <b data-rowgroup="true" data-colname='${tempobj[0].name}' data-coltype='${tempobj[0].Type}' data-data='${groupArray[j]}'><a href="#" oncontextmenu="return false" class="tablelink" data-colindex="${tempobj[0].data}" data-link="${tempobj[0].LinkRefId}" tabindex="0">${groupArray[j]}</a></b>`;
            else
                tempstr += tempobj[0].sTitle + `: <b data-rowgroup="true" data-colname='${tempobj[0].name}' data-coltype='${tempobj[0].Type}' data-data='${groupArray[j]}'>${groupArray[j]}</b>`;

            if (typeof this.RGIndex[j + 1] !== "undefined")
                tempstr += ",";
        }.bind(this));

        //$.each(this.EbObject.CurrentRowGroup.RowGrouping.$values, function (k, obj) {
        str += "<td><i class='fa fa-minus-square-o' style='cursor:pointer;'></i></td><td colspan=" + count + ">" + tempstr + "</td></tr>";
        //});
        return str;
    }.bind(this);

    this.getGroupRow = function (count, groupString, rowgroup, dt) {
        var str = "<tr class='group' group='" + rowgroup + "'>";
        for (var i = 0; i <= rowgroup; i++)
            str += "<td> &nbsp;</td>";

        var tempobj = $.grep(this.EbObject.CurrentRowGroup.RowGrouping.$values, function (obj) { return dt === obj.data });
        var type = tempobj[0].Type;
        //if (type === 5 || type === 6) {
        //    groupArray[j] = this.renderDateformat(groupArray[j], "/");
        //}
        if (tempobj[0].LinkRefId !== null)
            var tempstr = tempobj[0].sTitle + `: <b data-rowgroup="true" data-colname='${tempobj[0].name}' data-coltype='${tempobj[0].Type}' data-data='${groupString}'><a href="#" oncontextmenu="return false" class="tablelink" data-colindex="${tempobj[0].data}" data-link="${tempobj[0].LinkRefId}" tabindex="0">${groupString}</a></b>`;
        else
            var tempstr = tempobj[0].sTitle + `: <b data-rowgroup="true" data-colname='${tempobj[0].name}' data-coltype='${tempobj[0].Type}' data-data='${groupString}'>${groupString}</b>`;
        str += "<td><i class='fa fa-minus-square-o' style='cursor:pointer;'></i></td><td colspan=" + count + ">" + tempstr + "</td></tr>";
        return str;
    }.bind(this);

    this.getSubRow = function (colobj, groupString, count, rowgroup) {
        var i = 0;
        rowgroup = (typeof rowgroup === "undefined") ? 0 : rowgroup;
        var str = "<tr class='group-sum' group='" + rowgroup + "'>";
        $.each(this.rowgroupCols, function (k, obj) {
            str += "<td>&nbsp;</td>";
        });
        $.each(this.extraCol, function (k, obj) {
            if (obj.bVisible)
                str += "<td>&nbsp;</td>";
        });
        $.each(this.EbObject.Columns.$values, function (k, obj) {
            if (obj.bVisible) {
                if (Object.keys(colobj).contains(k.toString()) && obj.Aggregate) {
                    var val = colobj[k];
                    if (val.length === 1)
                        val.push("0");
                    str += "<td class='dt-body-right'>" + getSum(val).toFixed(obj.DecimalPlaces) + "</td>";// + "," + getAverage(val).toFixed(2)+
                }
                else
                    str += "<td>&nbsp;</td>";
            }
        });
        return str + "</tr>";
    };

    this.collapseAllGroup = function (e) {
        if (!$(e.target).is("select")) {
            var $elems = $(e.target).parents().closest(".group-All").nextAll("[role=row]");
            var $Groups = $(e.target).parents().closest(".group-All").nextAll(".group")
            var $target = $(e.target);
            if ($target.is("td")) {
                if ($target.children().is("I"))
                    $target = $target.children("I");
                else if ($target.siblings().children().is("I"))
                    $target = $target.siblings().children("I");
            }
            if ($target.hasClass("fa-plus-square-o")) {
                $elems.show();
                $(".group").show();
                $(".group-sum").show();
                this.collapseRelated($target, "show");
                $Groups.children().find("I").removeAttr("class").attr("class", "fa fa-minus-square-o");
            }
            else {
                $elems.hide();
                this.collapseRelated($target, "hide");
                $Groups.children().find("I").removeAttr("class").attr("class", "fa fa-plus-square-o");
            }
            this.Api.columns.adjust();
        }

        $(".containerrow").hide();
        $(".containerrow").prev().children().find("I").removeClass("fa-caret-up").addClass("fa-caret-down");
    }.bind(this);

    this.collapseGroup = function (e) {
        var $group = $(e.target).parents().closest(".group");
        var groupnum = $group.attr("group");
        var $elems = $group.nextUntil("[group=" + groupnum + "]");

        if ($elems.css("display") === "none") {
            $elems.show();
            this.collapseRelated($(e.target), "show");
            $elems.filter(".group").children().find("I").removeAttr("class").attr("class", "fa fa-minus-square-o");
        }
        else {
            $elems.hide();
            this.collapseRelated($(e.target), "hide");
            $elems.filter(".group").children().find("I").removeAttr("class").attr("class", "fa fa-plus-square-o");
        }
        this.checkHeaderCollapse($group, groupnum);

        $(".containerrow").hide();
        $(".containerrow").prev().children().find("I").removeClass("fa-caret-up").addClass("fa-caret-down");
        this.Api.columns.adjust();
    }.bind(this);

    this.collapseRelated = function ($elem, type) {
        if ($elem.is("td")) {
            if ($elem.children().is("I"))
                $elem = $elem.children("I");
            else if ($elem.siblings().children().is("I"))
                $elem = $elem.siblings().children("I");
        }
        else if ($elem.is("b")) {
            $elem = $elem.closest("td").prev().children("I");
        }

        if (type === "show") {
            $elem.removeClass("fa-plus-square-o");
            $elem.addClass("fa-minus-square-o");
        }
        else {
            $elem.removeClass("fa-minus-square-o");
            $elem.addClass("fa-plus-square-o");
        }

    }

    this.checkHeaderCollapse = function ($group, groupnum) {
        var headergroup = parseInt(groupnum) - 1;
        var nextSiblings = $group.nextUntil("[group=" + headergroup + "]").filter(".group[group=" + groupnum + "]").next();
        var prevSiblings = $group.prevUntil("[group=" + headergroup + "]").filter(".group[group=" + groupnum + "]").next();
        var $ElemtoChange = $group.prevAll(".group[group=" + headergroup + "]").first().children().find("I");
        var nextproperty = nextSiblings.map(function () { return $(this).css("display"); }).get();
        var prevproperty = prevSiblings.map(function () { return $(this).css("display"); }).get();
        var property = nextproperty.concat(prevproperty);
        if (property.contains("none")) {
            var flag = property.every(function (value) {
                return value === property[0];
            });
            if (flag)
                $ElemtoChange.removeAttr("class").attr("class", "fa fa-plus-square-o");
            else
                $ElemtoChange.removeAttr("class").attr("class", "fa fa-minus-square-o");
        }
        else if (property.length === 0) {
            if ($group.nextUntil("[group=" + headergroup + "]").css("display") === "none")
                $ElemtoChange.removeAttr("class").attr("class", "fa fa-plus-square-o");
            else
                $ElemtoChange.removeAttr("class").attr("class", "fa fa-minus-square-o");
        }
        else
            $ElemtoChange.removeAttr("class").attr("class", "fa fa-minus-square-o");
    };

    this.multiplelevelRowgrouping = function () {
        var rows = this.Api.rows().nodes();
        var rowsdata = this.Api.rows().data();
        var index = this.RGIndex;
        var count = this.Api.columns()[0].length;
        var lastrow = -1;
        var last = null;
        var colobj = {};
        var groupString = "";
        var groupcount = 0;
        this.rowgroupFilter = [];
        $.each(this.NumericIndex, function (k, num) {
            if (!(num in colobj)) {
                colobj[num] = new Array();
            }
        });

        $.each(index, function (j, dt) {
            var last = null;
            var $parent = null;
            var $count = 0;
            //var tempobj = $.grep(this.EbObject.CurrentRowGroup.RowGrouping.$values, function (obj) { return dt === obj.data });//tempobj[0].sTitle + " : " +
            $.each(this.unformatedData, function (i, _dataArray) {

                var te = (_dataArray[dt] === null || _dataArray[dt].trim() === "") ? "(Blank)" : _dataArray[dt].trim();
                groupString = te;

                if (last !== groupString) {
                    if (last === null || Object.keys(colobj).length === 0) {
                        var groupstr = this.getGroupRow(count, groupString, j, dt);
                        $(rows).eq(i).before(groupstr);
                        $count++;
                        $parent = $(groupstr);
                    }
                    else {
                        $parent
                        var rowstring = this.getSubRow(colobj, groupString, count, j);
                        $(rows).eq(i - 1).after(rowstring);
                        $(rows).eq(i).before(this.getGroupRow(count, groupString, j, dt));
                    }
                    last = groupString;
                    $.each(colobj, function (key, val) {
                        colobj[key] = [];
                        colobj[key].push(_dataArray[key]);
                    });
                }
                else {
                    $.each(colobj, function (key, val) {
                        colobj[key].push(_dataArray[key]);
                    });
                    $count++;
                }
                lastrow = i;
            }.bind(this));

            if (Object.keys(colobj).length !== 0 && ($(rows).eq(lastrow).hasClass("odd") || $(rows).eq(lastrow).hasClass("even"))) {
                var rowstring = this.getSubRow(colobj, groupString, count, j);
                $(rows).eq(lastrow).after(rowstring);
            }

        }.bind(this));

        var ct = $(".group[group=0]").length;
        $(`#group-All_${this.tableId} td[colspan=${count}]`).prepend(`All Groups (${ct}) - `);
        this.getRowsCount(count, "multiple");
    }

    this.getRowsCount = function (count, type) {
        let rows = $("#" + this.tableId + " tbody tr.group[group=0]");
        var j = 0;
        this.recursiveRowCount(rows, j, count, type);
    }

    this.recursiveRowCount = function (rows, j, count, type) {
        $.each(rows, function (i, elem) {
            if (typeof (this.RGIndex[j + 1]) === "undefined")
                $(elem).children("td[colspan=" + count + "]").children("b").last().append(" (" + $(elem).nextUntil("[group=" + j + "]").length + ")");
            else {
                if (type === "single")
                    $(elem).children("td[colspan=" + count + "]").children("b").last().append(" (" + $(elem).nextUntil("[group=" + j + "]").length + ")");
                else
                    $(elem).children("td[colspan=" + count + "]").children("b").last().append(" (" + $(elem).nextUntil(".group[group=" + (j) + "]").filter(".group").length + ")");

            }
        }.bind(this));
        if (typeof (this.RGIndex[j + 1]) !== "undefined" && type !== "single") {
            var rowsarray = $("#" + this.tableId + " tbody tr.group[group=" + (j + 1) + "]");
            this.recursiveRowCount(rowsarray, (j + 1), count, type);
        }
    }

    this.doSerial = function () {
        var tempobj = $.grep(this.extraCol, function (obj) { return obj.name === "serial" });
        var index = this.Api.columns(tempobj[0].name + ':name').indexes()[0]
        this.Api.column(index).nodes().each(function (cell, i) { cell.innerHTML = i + 1; });
        this.Api.columns.adjust();
    };

    this.createFooter = function () {
        var ps = 0;
        var tid = this.tableId;
        var aggFlag = false;
        var lfoot = $('#' + this.tableId + '_wrapper .DTFC_LeftFootWrapper table');
        var rfoot = $('#' + this.tableId + '_wrapper .DTFC_RightFootWrapper table');
        var scrollfoot = $('#' + this.tableId + '_wrapper .dataTables_scrollFootInner table');

        if (scrollfoot.length !== 0)
            var eb_footer_controls_scrollfoot = this.GetAggregateControls(ps, 1);

        if (this.ebSettings.LeftFixedColumn + this.ebSettings.RightFixedColumn > 0) {
            for (var j = 0; j < eb_footer_controls_scrollfoot.length; j++) {
                if (j < this.ebSettings.LeftFixedColumn) {
                    scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).html(eb_footer_controls_scrollfoot[j]);
                    scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).children().remove();
                }
                else {
                    if (j < eb_footer_controls_scrollfoot.length - this.ebSettings.RightFixedColumn)
                        scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).html(eb_footer_controls_scrollfoot[j]);
                    else {
                        scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).html(eb_footer_controls_scrollfoot[j]);
                        scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).children().remove();
                    }
                }
            }
        }
        else {
            for (var j = 0; j < eb_footer_controls_scrollfoot.length; j++)
                scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).append(eb_footer_controls_scrollfoot[j]);
        }


        if (lfoot.length !== 0 || rfoot.length !== 0) {
            var eb_footer_controls_lfoot = this.GetAggregateControls(ps, 50);
            if (lfoot.length !== 0) {
                for (var j = 0; j < this.ebSettings.LeftFixedColumn; j++) {
                    $(lfoot).children().find("tr").eq(ps).children("th").eq(j).html(eb_footer_controls_lfoot[j]);
                    if (j === 0)
                        $(lfoot).children().find("tr").eq(ps).children("th").eq(j).html("");
                    $(lfoot).children().find("tr").eq(ps).children("th").eq(j).css("width", scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).css("width"));
                }
            }

            if (rfoot.length !== 0) {
                var start = eb_footer_controls_lfoot.length - this.ebSettings.RightFixedColumn;
                for (var j = 0; (j + start) < eb_footer_controls_lfoot.length; j++) {
                    $(rfoot).children().find("tr").eq(ps).children("th").eq(j).html(eb_footer_controls_lfoot[j + start]);
                    $(rfoot).children().find("tr").eq(ps).children("th").eq(j).css("width", scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j + start).css("width"));
                }
            }
        }
        this.summarize2();
    };

    this.GetAggregateControls = function (footer_id, zidx) {
        var ScrollY = this.ebSettings.scrollY;
        var ResArray = [];
        var tableId = this.tableId;
        //$.each(this.ebSettings.Columns.$values, this.GetAggregateControls_inner.bind(this, ResArray, footer_id, zidx));
        $.each(this.Api.settings().init().aoColumns, this.GetAggregateControls_inner.bind(this, ResArray, footer_id, zidx));
        return ResArray;
    };

    this.GetAggregateControls_inner = function (ResArray, footer_id, zidx, i, col) {
        var _ls;
        if (col.bVisible) {
            var temp = $.grep(this.eb_agginfo, function (agg) { return agg.colname === col.name });
            //(col.Type ==parseInt( gettypefromString("Int32")) || col.Type ==parseInt( gettypefromString("Decimal")) || col.Type ==parseInt( gettypefromString("Int64")) || col.Type ==parseInt( gettypefromString("Double"))) && col.name !== "serial"
            if (col.Aggregate) {
                var footer_select_id = this.tableId + "_" + col.name + "_ftr_sel" + footer_id;
                var fselect_class = this.tableId + "_fselect";
                var data_colum = "data-column=" + col.name;
                var data_table = "data-table=" + this.tableId;
                var footer_txt = this.tableId + "_" + col.name + "_ftr_txt" + footer_id;
                var data_decip = "data-decip=" + this.Api.settings().init().aoColumns[i].DecimalPlaces;
                var style = "";
                if (col.Align.toString() === EbEnums.Align.Left)
                    style = "text-align: left;";
                else if (col.Align.toString() === EbEnums.Align.Right || col.Align.toString() === EbEnums.Align.Auto)
                    style = "text-align: right;";
                else
                    style = "text-align: center;";

                _ls = "<div class='input-group input-group-sm'>" +
                    "<div class='input-group-btn dropup'>" +
                    "<button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='" + footer_select_id + "'>&sum;</button>" +
                    " <ul class='dropdown-menu'>" +
                    "  <li class='footerli'><a href ='#' class='eb_ftsel" + this.tableId + "' data-sum='Sum' " + data_table + " " + data_colum + " " + data_decip + "> &sum; </a><span class='footertext eb_ftsel" + this.tableId + "'>Sum</span></li>" +
                    "  <li class='footerli'><a href ='#' class='eb_ftsel" + this.tableId + "' " + data_table + " " + data_colum + " " + data_decip + " {4}> x&#772; </a><span class='footertext eb_ftsel" + this.tableId + "'>Average</span></li>" +
                    " </ul>" +
                    " </div>" +
                    " <input type='text' class='form-control' id='" + footer_txt + "' disabled style='z-index:" + zidx.toString() + ";" + style + "'>" +
                    " </div>";
            }
            else
                _ls = "&nbsp;";

            ResArray.push(_ls);
        }
    };

    this.summarize2 = function () {
        var api = this.Api;
        var tableId = this.tableId;
        var scrollY = this.ebSettings.scrollY;
        var opScroll;
        var ftrtxtScroll;
        $.each(this.eb_agginfo, function (index, agginfo) {
            if (agginfo.colname) {
                opScroll = $('.dataTables_scrollFootInner #' + tableId + '_' + agginfo.colname + '_ftr_sel0').text().trim();
                ftrtxtScroll = '.dataTables_scrollFootInner #' + tableId + '_' + agginfo.colname + '_ftr_txt0';

                opLF = $('.DTFC_LeftFootWrapper #' + tableId + '_' + agginfo.colname + '_ftr_sel0').text().trim();
                ftrtxtLF = '.DTFC_LeftFootWrapper #' + tableId + '_' + agginfo.colname + '_ftr_txt0';

                opRF = $('.DTFC_RightFootWrapper #' + tableId + '_' + agginfo.colname + '_ftr_sel0').text().trim();
                ftrtxtRF = '.DTFC_RightFootWrapper #' + tableId + '_' + agginfo.colname + '_ftr_txt0';

                var col = api.column(agginfo.colname + ':name');
                var summary_val = 0;

                if (opScroll === '∑' || opLF === '∑' || opRF === '∑')
                    summary_val = (typeof this.summary[agginfo.data] !== "undefined") ? this.summary[agginfo.data][0] : 0;
                if (opScroll === 'x̄' || opLF === 'x̄' || opRF === 'x̄') {
                    summary_val = (typeof this.summary[agginfo.data] !== "undefined") ? this.summary[agginfo.data][1] : 0;
                }
                if (opScroll !== "")
                    $(ftrtxtScroll).val(summary_val);
                if (opLF !== "")
                    $(ftrtxtLF).val(summary_val);
                if (opRF !== "")
                    $(ftrtxtRF).val(summary_val);
            }
        }.bind(this));
    };

    this.createFilterRowHeader = function () {
        var tableid = this.tableId;
        var order_info_ref = this.order_info;

        var fc_lh_tbl = $('#' + tableid + '_wrapper .DTFC_LeftHeadWrapper table');
        var fc_rh_tbl = $('#' + tableid + '_wrapper .DTFC_RightHeadWrapper table');

        if (fc_lh_tbl.length !== 0 || fc_rh_tbl.length !== 0) {
            this.GetFiltersFromSettingsTbl(50);
            if (fc_lh_tbl.length !== 0) {
                fc_lh_tbl.find("thead").append($("<tr role='row' class='addedbyeb'/>"));
                for (var j = 0; j < this.ebSettings.LeftFixedColumn; j++)
                    $(fc_lh_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4fc[j]));
            }
            if (fc_rh_tbl.length !== 0) {
                fc_rh_tbl.find("thead").append($("<tr role='row' class='addedbyeb'/>"));
                for (var j = this.eb_filter_controls_4fc.length - this.ebSettings.RightFixedColumn; j < this.eb_filter_controls_4fc.length; j++)
                    $(fc_rh_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4fc[j]));
            }
        }

        var sc_h_tbl = $('#' + tableid + '_wrapper .dataTables_scrollHeadInner table');
        if (sc_h_tbl !== null) {
            this.GetFiltersFromSettingsTbl(1);
            sc_h_tbl.find("thead").append($("<tr role='row' class='addedbyeb'/>"));
            if (this.ebSettings.LeftFixedColumn + this.ebSettings.RightFixedColumn > 0) {
                for (var j = 0; j < this.eb_filter_controls_4sb.length; j++) {
                    if (j < this.ebSettings.LeftFixedColumn) {
                        $(sc_h_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4sb[j]));
                        $(sc_h_tbl.find("tr[class=addedbyeb] th:eq(" + j + ")")).children().not("span").remove();
                    }
                    else {
                        if (j < this.eb_filter_controls_4sb.length - this.ebSettings.RightFixedColumn)
                            $(sc_h_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4sb[j]));
                        else {
                            $(sc_h_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4sb[j]));
                            $(sc_h_tbl.find("tr[class=addedbyeb] th:eq(" + j + ")")).children().not("span").remove();
                        }
                    }
                }
            }
            else {
                for (var j = 0; j < this.eb_filter_controls_4sb.length; j++)
                    $(sc_h_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4sb[j]));
            }
            sc_h_tbl.find("thead .addedbyeb").before($("<tr role='row' id='filterdisplayrow_" + this.tableId + "' class='filterdisplayrow'><td id='filterdisplayrowtd_" + this.tableId + "' colspan=" + this.columnCount + " style='padding: 2px!important;'></td></tr>"));
        }

        // $('#' + tableid + '_wrapper table thead tr[class=addedbyeb]').hide();

        //$('thead:eq(0) tr:eq(1) [type=checkbox]').prop('indeterminate', true);
        $(".addedbyeb [type=checkbox]").prop('indeterminate', true);
        $(".DTFC_Blocker").remove();
    };

    this.createColspanHeader = function () {

    };

    this.createFilterforTree = function () {
        $(".dataTables_info").after(`<div id="${this.tableId}_filter" class="dataTables_filters">
        <label>Search:<input type="search" class="form-control input-sm" placeholder="" aria-controls="${this.tableId}"></label></div>`);
        $(`#${this.tableId}_filter input`).off("keyup").on("keyup", this.LocalSearch.bind(this));
    };

    this.LocalSearch = function (e) {
        var text = $(e.target).val();
        if (e.keyCode === 13 && text.length >3) {
            //window.find(text, false, false, true);
            if (window.find && window.getSelection) {
                document.designMode = "on";
                var sel = window.getSelection();
                sel.collapse(document.body, 0);

                while (window.find(text)) {
                    document.execCommand("HiliteColor", false, "yellow");
                    sel.collapseToEnd();
                }
                document.designMode = "off";
            }
        }
    };

    this.addFilterEventListeners = function () {
        $('#' + this.tableId + '_wrapper thead tr:eq(0)').off('click').on('click', 'th', this.orderingEvent.bind(this));
        $(".eb_fsel" + this.tableId).off("click").on("click", this.setLiValue.bind(this));
        $(".eb_ftsel" + this.tableId).off("click").on("click", this.fselect_func.bind(this));
        $.each($(this.Api.columns().header()).parent().siblings().children().toArray(), this.setFilterboxValue.bind(this));
        $("." + this.tableId + "_htext").off("keyup").on("keyup", this.call_filter);
        $(".eb_fbool" + this.tableId).off("change").on("change", this.toggleInFilter.bind(this));
        $(".eb_selall" + this.tableId).off("click").on("click", this.clickAlSlct.bind(this));
        $("." + this.tableId + "_select").off("change").on("change", this.updateAlSlct.bind(this));
        $(".eb_canvas" + this.tableId).off("click").on("click", this.renderMainGraph);
        $(".tablelink").off("click").on("click", this.link2NewTable.bind(this));
        //$(`tablelinkInline_${this.tableId}`).off("click").on("click", this.link2NewTableInline.bind(this));
        //$(".tablelink_" + this.tableId).off("mousedown").on("mousedown", this.link2NewTableInNewTab.bind(this));
        $(".closeTab").off("click").on("click", this.deleteTab.bind(this));


        this.Api.on('key-focus', function (e, datatable, cell) {
            datatable.rows().deselect();
            datatable.row(cell.index().row).select();
        });

        //this.filterbtn.off("click").on("click", this.showOrHideFilter.bind(this));
        $("#clearfilterbtn_" + this.tableId).off("click").on("click", this.clearFilter.bind(this));
        //$("#" + this.tableId + "_btntotalpage").off("click").on("click", this.showOrHideAggrControl.bind(this));
        this.copybtn.off("click").on("click", this.CopyToClipboard.bind(this));
        this.printbtn.off("click").on("click", this.ExportToPrint.bind(this));
        //this.printAllbtn.off("click").on("click", this.printAll.bind(this));
        this.printSelectedbtn.off("click").on("click", this.printSelected.bind(this));
        $("#btnExcel" + this.tableId).off("click").on("click", this.ExportToExcel.bind(this));
        this.csvbtn.off("click").on("click", this.ExportToCsv.bind(this));
        this.pdfbtn.off("click").on("click", this.ExportToPdf.bind(this));
        $("#btnToggleFD" + this.tableId).off("click").on("click", this.toggleFilterdialog.bind(this));
        $(".columnMarker_" + this.tableId).off("click").on("click", this.link2NewTable.bind(this));
        $(".columnimage").off("click").on("click", this.ViewImage.bind(this));
        $('[data-toggle="tooltip"],[data-toggle-second="tooltip"]').tooltip({
            placement: 'bottom'
        });
        $('.columntooltip').popover({
            container: 'body',
            trigger: 'hover',
            placement: this.PopoverPlacement,
            html:true,
            content: function (e,i) {
                return atob($(this).attr("data-contents"));                
            },
        });
        //$('.columntooltip').on('shown.bs.popover', this.openColumnTooltip.bind(this));

        $("[data-coltyp=date]").datepicker({
            dateFormat: this.datePattern.replace(new RegExp("M", 'g'), "m").replace(new RegExp("yy", 'g'), "y"),
            beforeShow: function (elem, obj) {
                $(".ui-datepicker").addClass("datecolumn-picker");
            }
        });
        $("[data-coltyp=date]").on("click", function () {
            $(this).datepicker("show");
        });
        //$("#switch" + this.tableId).off("click").on("click", this.SwitchToChart.bind(this));
        this.Api.columns.adjust();
    };

    this.ViewImage = function (e) {
        let data = $(e.target).attr("src");
        let loader = "data:image/gif;base64,R0lGODlhAAEAAfT/AP////f39+/v7+bm5t7e3tbW1s7OzsXFxb29vbW1ta2traWlpZycnJSUlIyMjISEhHt7e3Nzc2tra2NjY1paWlJSUkpKSkJCQjo6OjExMSkpKSEhIRkZGQgICAAAABAQECH/C05FVFNDQVBFMi4wAwEAAAAh/hFDcmVhdGVkIHdpdGggR0lNUAAh+QQFBwAgACwAAAAAAAEAAQAF/yAgjmRpnmiqrmzrvnAsz3Rt33iu73zv/8CgcEgsGo/IpHLJbDqf0Kh0Sq1ar9isdsvter/gsHhMLpvP6LR6zW673/C4fE6v2+/4vH7P7/v/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AXQQYMCBAQB0BDihQcMDgwRsFFjBgsKDAwxsIJk5EcFEFwQEpEmhkkCDFgZMBB/8UWEkAhUiNJU8ogADhwQGABQzoNCDgxMuJMUsUkEC0Js6dBiya+EnyBASiRB8AHIDUAMgSTIOOSEB0AlEFAANUNeBw60itAAREgCohQs+pVVuSyFpiQVeiaP3lRFoWAN0RA9hKgHBRQFWlIv6KcHBXAuKDBKq+9Xt2hAHBDvR97EtCbFWzMEc89Ur0qokCDhwsaKdyZ8ETkZFe/ctVAunVJgQ4uIDhggTc6mLvLGCaxFiDAq4O6KmWbQTOARZYyJABQ2/C64QjLTBZBFWdBDiXGMCANMcRARBQwECd+nV2AfaODU9iZXcVBR5IBSyBfXv3FjyWjgDyjWWaeCsMJIL/AA1c8F97GFBgADytjZXUfTAEoEAF/v2HgQULILjOQBYmZQMFD1J3gQMYwhOAdjqJ6MIADkIogVz4EOgaDgy4V8F5/HyXgwAXWMCAjPcE0OIMCRTX0ZMmKCnAlFRWOSUPC2Sp5ZZZJsCTORWWqJOAN2zQwZlopnmmBg8syU2YYpq4wwUe1GnnnR508EEGwIUDp5hk2kAnnnjqySc5OsY5Jg+DEmqnnhfk9Y0ABBRoYaA1bMDBppx2ysEGFkgK5aik1kCpDgQ4uU98MeLgGXf8vIgUjjVoRx8+30lmg2EG2pPoWAUguYKlw7mZjqwl3koDspcaW06uwJa1HAzJoQfj/6yslQgrejqpisJ3ff1albflXGuVCdqR6x2241lIKzowKsvtdt59RJAIlorHbFLvnkPpmCJa+patCx6GAqsFyDvglSjwuhOOBIsAo5sBVKzPcSNEDIBnSHUErQG0agxAvA9xvFMJIgOAcUATo8zuCA6DF5DJcpKQMgD5AgSjeDfT3K8+Bf5888j0/rPSTggOzfFKYa20Lbovl0DgSsLaU7GMQ4twdakkQKsu17nt9TTYLFBKgLNkp6322my37fbbcMct99x012333XjnrffefPft99+ABy744IQXbvjhiCeu+OKMN+7445BHLvnklFdu+eWYZ6755px37vnnoIcu+ijopJdu+umop6766qy37vrrsMcu++y012777bjnrvvuvPfu++/AixMCACH5BAUHACAALGIAYgA8ADwAAAb/QJBwSCwaj6BAAIBsOp9Q42AqiFqv0UFhSwhgv+DhwEAuVMPopECgRBLI5LNRMB1400cCiCAvvuF9QwIGCQkIenhEAYh7d35wBoFDCgwMCwWJiowgA3mQkgMJlZaYmUhmRn9xRQEGC6MLm5kCpUKye59FA5SjCY6me0SoRKqRigejlreZv8HEuUMEvJUIzcCdRNi20CACCMkK2sBDzbW4gEMFr6MGaQFrkoLmdtvonKK98VVl8ekFy0mKDCtWpdU6UkYWKXgA4UEsJFrS8WlGi5iQJRe97EqGQAoCBxEkSIjQwFw2k/+ciEOC76GgAw0giBRJ0qSgU+K8dLEyYMGB/zuDFsicSXPBSnJHowVEU1Dag5BER5a0pukUQCveQEYV+aAjVoBJrQRwsFUChHBgKgpjkqZA1AgM8AQQ1+8LTQcGqH5ZtAWYhK51wwT+4nWcYTR6DytCwLixYwQHDCDS2bfJ1TAWMmvenJkChATdeBrOQLq06QwYMFhwMGCwmNGnT6de3emy0nGpc+vWXaGBnYhPbGMRcKG48eMXLFSA8FOx8+cqEyOeAiwCWlPvCGBii2fBhwwRELh+QqdWWCwbPHT4gMFBAelNvNiE/+SBh/vqOVRgIFyRsyPcfWEABx10gF+BGkyQwHlEVGETCAUwCEUACVjwgYEHfhdBc0jI58DGGV7QV8QZAjCQwYX4qfeBBQyEpRZ5D3aoxyYERLBBgRlWcABEKC110RWLpJPTARQQiOEHFxSmS4wNmrNMQX4klMAFF65ngZJGcBFPkOlQ1U9SAjiQAQfgMcmJSvMgAaJAllGSF1NONiHHi404x+VNajYxzGF07pSnPBYdVg55uggjYVppOhHInf9dIwwUkvSxpymbHCrJL5Nmok1/+tQy3hUCzIgVREIcmtanmTb4KXTvQYeHdhGK6OoRd5iKRRAAIfkEBQcAIAAsYwBiADsAPAAABv9AkHBILBqPwgByyWw6iQIQgQACPK/YrHbLpQ6V3PAw6iyAjQGBWowGFbDmY4BQKBDI7OxbGDcOCgYGBXh5V3tuZ2OAgYOFQ15Mh31EBIGMiY5EA0aSmAKLgQRWmU+dRZWWk6RNpkMDloEDo6usQ6qgBgSYpIdJtrZgAa+whFkCA5tLr0WjrZ+wukh0drtgBm5braiMxUMIC+AIyURK10LmTrJVQwBWz5bqXyAHCgz2DAnj8uilArNyqFSBMFDvnr18heI5+aSwQIIFBu0tONCtDBsAZ75FlCjuH60m9DYyWJBAVJ6KWCBuVCCwS54BESei3LJrSwKOCvNAYgOzpMf/PDW5tPxIFEkUZEiTIls18widQEz0nYxAtapVqhAYHAhadIiEr2DDgoWQoGlXsWi/kjXrilSAtGgfIDhTp67dOqsIQNjLt+/eBwpMdh08+CdhLAMgIGB75Q8/NgwwUGhggKsTJTsTXsiA4cKEBZmvCAhdSEKG05wtRECIuBclMQgsYEB9GkOFBxSbCAP0UQkCCRdmo+482TUU0m4GWGYigOyQBRQwCK99YXVFqY8SYWeCYMOHCTsdyJ6OwQIE40H9hTmAwYOHDhoYnAFgAIJs6hHQFymwfdmYR0JEYwAGHbj3QQXGITBBcOWdd9kRn7zGBzAgBOAAB+51wMEDFTFApYEFn20nhABBzYFOIxPyAQYBFhT4HgYIIDEAAj5lMksrATCAoYERiLiKa62AMAAFLnaQgQLLbSFVTkGCkMAG7nnwHXJu7UfhFw98kOEG8pHi34icXGnLBUVaYFwYc0hopYpFBNDAjvAlkEkiKK6JiBEsdqBnBnI6op1hTT6nwQccXNAnLUkONYADwT1A5WFctWPYYQFSepGlWmwSgKScdurpp5IGAQAh+QQFBwAfACxiAGIAPAA8AAAF/+AnjmRpmsGprmzrjoQ4vHRdG4at73z/Cq7Cz9eKfQqzk7AFJDpdAULuSa3aklaj9Yk9dqtf3VKk3X7KvkLTLBr7wlv0q+x+r0uCum4AOAUGgHcqUycAcGcEBXowKSYDiQYFBI0vhzxqJgKQOAaTK4sflCSeLIZkjgWcnKQniSp3BIIsUWt/qao4SKIkALYufTrAmri5scArAAIDeoQ9UbeqkgK7s5p61DUA0Jy6xzV/ZZY0AtEDAd7Bvh/oPFLS7DzJBOLfsdhE51X5bPxX/SoHAgoceCBSEln/RgxgwLChQ4YLEoBKOOKhRYgG7lH8cNHigoxtNpJY2LFhRCHJlP8BWskykBUBBGNGiiWyZiibPDRZaXAA5w4JEBhQWdbMSQEJSCU8UOBMRFEnARwkRRrBwQ6drRDSGLAAwlSqDZ5085HsQIMIX4EuePF0LBmtJ2YgEGEogQO0U6vO9fOh6LsSOVi9YnDhAgQsURQ8+BqBgZwRzeZRm2iiQoYMGCowJRGgAAOvVB0HMQePxBgLhQsLIRABw2UMEkyUbQAhQtDHMgKVLsFHBIYOHjxsWJKggusMF8LKHnAgAQIDcAFI/zbid/DhMh5ceE2hZyHpu1186WJd+BIABygcv/CgpuDy2EUIaLAdc4UE/QhhIgHfzdHjGEDARh6jmNBfCQpY4BpvBhas9c8iB44CAYCx/dNbCRGSUNyCFXjHhmDVAWeeIw8oiEF3bCiyQoYkHAABBRRA8BQ+AtS4wgUd5KjBIp0hgMAB9OwA3goV5NgBBrj5VAIEG3DAwQRBKpmABBNMwIBGSo6QBw58gOfll2CGKV0IACH5BAUHACAALGIAYgA8ADwAAAb/QJBwSCwaj4LkcclsOp0DUKHwrFqvwoIBy+0eqd7wcRBlbp0BELks9p6dYHCbKJAXBMc3Uz7/FtNFemOCfUQET4RFfIVGeoeBTQR6eIxDj0IGbJhMAomVQ3yLngGXn0ueIJ4DqKZSRZSpS4uARwG0TI+3RI6AiatVeAQEmkWlBAK6IKVGZJeLe1tbsIrU0yC61kTJzFqvS5KBBcRDAwBPdUZp4FjdRoe0BdtLAJoCy3RO95bZXQPPQ/LcJRLXpt0uIeas0DPISN+cf2ICtnEYho3EVl0SVtKIsaPHPwIGCBtJcuS4iCVTDkOWhVUrAAZiypwpkyDFjzRzxiR48iMm/500CfpcEgDozALHEkZRSbKnF1JMTdoaSlVbpYtcAvi7iUVBpkIB7J3B+iQBgwUJ7rSxV2zOAAZwzyIQ4w9JmwVx4yo4cM1KL4wJ8OaFm8ClELFoIDIJe62AgsFw0T5RTOSAhgdXCjjge/iA4MFecTUyImBCBw8bFlSRIKEBEXoIPsdN0PNZNgUcPOj+AAHPLUCsWUdI4C5wXtpiCFw47aFDBuJCMki3sGXAg+ASMKczoGCBdwQ91fVN5+CDbg+8KVmQnoE6CAAIsEdQjcQAAgMEyObJwLzDBc4grDfdGQI4gN0DhoURQATm6cZBA7QI2N4bBkSAHQMdIbBBfxTwIaShe0IEsAB2EBzAUSECUNCfBgvc8qEeA0CAnWumLNAgehIQ8+JrCcinwCcDWNBfBnMVsSMR1mHnAFdYGLDhbr0ZceQQABxAYoJWGJDBBx18AKKR7H0JUAPCPUAZFwREkIEGFrR4xJREaAaBAwsweUUABzTAwFdvsleBJ4cccExVRGBgKAWEcmHBBRZAkOgVB1j4AHSPPoEnAkkBoOmmnHbqqadBAAAh+QQFBwAgACxiAGMAPAA7AAAG/0CQcEgsGo/EAHLJbDqJhGHhSa2CAkqqYInNWqmD7XEqNIiLgK9aSPASySDz0rBuukGD8VBujA7zdUZpUHplZ4FfgGWKUnuHiFUBcCAFj3B8f0WMkEOPV2+ORZOcS36doIakagKTbY2pQp6IXUgAm4qXsrF2TgSbQ5JIuWqmtUR0v3jHioBhgaNDAMVsn0vJQ8XXorUD0Ee6SAHTgQHdRgYFjNpInnR9TQAC40mqR+tJrPVO6Wrl3oibChAAB0/evzUADgaSV0/MvS/lVNnSR1HIoIoYM3JKWKCjR49snIGY904jk4cmm0QhmLLXlQEEPsr0SBLhzJnAQADowrMnlv96O3361NmyqJAABg6oYgmxgAMMGEhJGkhqwAILHDp4QMCJgAF0A+5YCZCAwgatHjxsYMpEwNe3/CAagKABbdoOHyAESvgWLtUn4hpc+JD27gcNEhKIpeKvr18nVitkLeyhwwYKCwC5U7Ozm+OvcY8EYJDBbuUPGBwUyGKgggSUeBYYyBIv5meBi0FU+IAWb4YIBw5BwJDhAoN1AxIwYKCgSAB5t3Vh7UBdw4QEmxJcyMD9wgM2WQRssbp8uVIinQv0rYTkwXYNFRiMGyCBeAYMFM5DkMAf+BUE5TGwwBHpdfRXHwkkuNoRDGzXXQND7NffeeSVxxWBz4n3DAX2YSDCARwSSuCfTgYEOGBunDzFHQYWDBghfyKeB4IACgSYQEYHWNAhBMWEOKJOBZhYjT4RdFjBhS9OmIRy5TVHkQIOFueAET7KyMYCASJJigD1rTiBlUJU6dwBATqpCgEVQMUiA0eIqUmNyy2g0BcETGDBBRZE4I2b6BmAJXP6CMAABBE8oCURfBIhwAEJHspJNwLp8gCMEIBpkQADZIpiRg7A+MCcRhWhwAMQQMBmqFUQgECCmKDqRIYBACDrrLTWauutQQAAIfkEBQcAHwAsYgBjADsAOwAABf/gJ45kaZrCSJxs677tUIwpbN9jEI/GgP/A0mrke9WCJoDP4BqKiqXAiglFkpQw56cqwoqY1lO1cFSRuB/B7IsOq19atJYcTrZJ8dL7W2cF1iJaH3k5gn0nXkR4ZyOJhy5SLYQff4uPJ3sfYIGMH459hiZjNYSZNwRlNCSAeqwEOqmcI6xBplQlny25biyoJJU3uyK0H3RhAEE6JcQ2ATImBgV3l8GDzKHB2EgChrE/3p5IzpZ12kjIz8p16tRp7e/w8fIvAwoQFRcY+vv8Fu3aBQAZmLChg8GDCA1eaMfMBAEDFDh08ECxokUPC6k1JMEEosSLIDNe2shjCwMKGDT/bFjJsqXIeX4GEAhIsyZNmDhzwiCpk4WSBBEqgPuBTAS7bQju6WNwCIovKwYaoMSQIcOFac0eEVggIV/VDBheIjF0C8bPCBaofsVQ4QGCY9w2HiUh4MCDCmqrYrAQQUGXV0TZYXuKy0AEr3ovUGBKg4EDnjQKaBkHzWcCvHrZOoiSVIIEGFIMRCtTFLKnBFP3QngrpIFnzw18CCgyQEdo0QZCxX0B4EAEChUkKEATAOhrCCMOMFjOgImSArh7SKJ3oLrPAg9eR1iQnHlzow9xF5h7ScCCCK8fkFDOfJOa6AOKtgNgILvnCAnWe9+kJLqxdgMw8JoEm+nX3i/Q4WaOeDideYZcCewtt4knA/g31FgODMiYgRJGEZ5oCxKFAHoOnhDhd1e8J9p/fQCgAInbmbifCbeJhhVRCUAQQQQFmnDihJGteCMO9DF3AAs/IiITAYS1yI05ES4AZA4BVNkTDwssx92VpySwwAL5cWmDiuOJaRYl5IURAgAh+QQFBwAgACxiAGIAPAA8AAAG/0CQcEgsGo0A0GAgCByf0KgU6hwKptis9jocaL9gIzdMPgYIBQLUO1Q/0e7ykWsojIlsYVweLggNBFV4RHt8W35ReSCFIIKGT2eEjkqERQCKj0+IIAaYioxFgZmhRJtCn1F2o0UCmwZFqE+dq1Kqp5W0QmcHs1iilG1ld0YFEhobFgvDIElPsZO/RwWmRggXHx0dHBMHk5FSXs1Ey0eYQwgYHx7rHRoRBpOb0VGvk85PBxbY6x4dHxkNUM2rNSZJgVdaBjCwwKEDv34fLCSoIoBcoiIIixQwRyTAAQgZ9vHTxs3eKousEhgT2a8dtUxqTK5ZUKHhwwd8JtUZIFNKgP8CDq453PCIIx8BByKEXPCoGQGUYQYkiDDqSk85UHNp3WoFgRALYMOKtdCIloGzaNOCSMNzgIMKGOLKnSuXFiiMeh5YiJuhr9+/GWgZFUNAL1/AgAVnqZgAAoUKYyPbxcLmysG0mM9e5cq585NLqzaHEYDggYRVGzP9bBBBwulHdPyIhkJgAQTXuF9+AWAKUFYkUk3jxu1g9j1iX5A6GI47AoMDv8Ps9FmAQWvmERwksHJUlmxn1plLeKCg44EFg4t8w2KL2PLhEBhkZFabAYPt4P6Y42gU6PUIDUDHCgL22ZeAVVWIo1F0RhHAwAMQaHcEbwsUuAA8SqTlxjB3lQKbhQBoAPKEAAkUeF8XGn7IWQAGmMgUimh1ONAqAyhg4gF4pChLenJ4ZGJ5OcZIyhC6GQJAffYtgGOQZxXSyhC9nFRigfgxKWIq0WmBJAMLvDSAjlBEmUkBFdrnlRFfCmlJLKOQaZ8CoKTZpBluzAcTAgkkYCeMc87RBS0BLDGYnFeOmCUtraDFo2eQoDHNoYwOEYAAgkZKhoKrBAEAIfkEBQcAIAAsYgBiADwAPAAABv9AkHBILBqPAcFxyWw6n6ABdEqtBgjVrHZZGGKXgPC2WXhYKAupUfkMqMdMBYbzwSiObCvcqNB0Oh8UX0R5TAJdQgQBe0V9HR4eHAyLhE+DIJeMIAYWjx4dFohDhVBvmiABDRueHw6UQqRFr6dLBBQfkB4ZCJVgprRGAQt+kB0Tb7GjopizwAMSuJAbC5TJiUQF1qUEBNYIGJ4dFV/Wh0MGv0QAzUUDDBQVEQl4Dxy5HA2L1plLbk8GES5gwHABggEjBSqEu4Doy6Bf6aoAFJghA4YKDS4FYLAKEoaDUDIBEMCPSQEIFCsOREOEwIQPG3iNcbNsSEQQAhIExFBR5QX/CQiUBFAAQVs/ITRrOSnQgEJKlRYedGFHxZoBLFSNHHhQYWDPlSCBGShws0kCCBZ49pQA7BSBBRMoXii7pVvWKQEMNL3AgNbBAXezCNhKt0rhtogTKw5GQIGDBxAiS54MoeSYAQUya95cJOcDCaBDiw4dOMthWAKIjl4NejEZnKpZj3ZtEtUBBg8i6N7NW7dR0waCCx9+sKaQA8iTKz/wu4qA59CjQ0dFuzqS09aPABiAII1bYCMPLGDAYB6j0lTWFVBAvj12JpazXEnQvv6CPc2fbO9ev72CsNkVMZIB4/XHgAIHUBcAAHCUhQWDeIhn4AIIDLJdNlNcqMkA9NmXkUBNARQQnCJNjGScF0cZwWF9//2y3XCIiCEEg9vNdAR3CyyAIHWdiSgcOXg9cRMlJyJFAIyjaPdeFHu8OBwyKWYX4nCX5Eebk8GR1UuASPg4YmdcanekcBhuGaYyTzZj5WKHkImHFuhV5aOWa2RBIi0kZXbTmpnxiOdzWZnzxJqIzRLfmUwsGSCD3CBKRZxaBAEAIfkEBQcAHwAsYgBiADwAOwAABf8gII5kaZoBYazD6b5w/AoNRUmJrO88QXGcjYRHLJoMmY4SY2ySBodEwhA4HTYeT0fz6Xq9gvB3TC6XDxJKBWKwYrUa16BQMNvvXkQFg7lAWiVXWVt4HwUCTid6GBkYFglkgnCFh4kmBROMjRIEgW9bJgIFKysEhadfCxaaFwxjkoRjKqSHqLYfEZoYFAUksFxjo6Smt6gJexmNDogivyQBwQLFtg8XyY4HI84jA6QsliN2FLoRgL92BVVNAlEKCATQZA3WyRcKXedlBYChA/52BBhAiBDBAQJEZCTomtDpQJ8L1kSI8tYJxZwv6koQaBBBgkcIDAwg9KJgVSMLCFD/VXo2x5sBAsw0cvRI84GCdF8g9GEQ00WKUmMEzHIJ0wwCBx1pSiiYYEA8BOV4iPICQKgwl7XuLICg1GOEBgcQ9dyhLkBLlwb22ZrZFWTFJmfRErt1NGnNeNPMvJSW94OCB0rr9CWTdsDgLwIlHCYjePGYBo67DIAJ7gS/ypgzZxZq4IDnz6A9j7UklIDp06j9IQpQIMECBrBjy4ZtOLJKeOxez97tyvatAbl57/b9m7Vr3cIZ1CZuJ23RL2hd4o3sr7r16nyZa78FIGNl7WbTYZ48OpHVl5hX7PO+Lq5IcN1oOW0SHm2vRAGiU+ZhdijR6XlFt095oRBwlTcrOfHFpoHysccSg+ot94FQDs4w14QA2cEZVk7J8k0MKdxigIb+7aWPb5MRVd55aZkBoGCs0UGHHQCYIUwBz5EhgGpmABAfKYCwRoteGmJn3oHidXdVY9vdUSI/QqrXJB4TDfPMklM6iWBPUbaYZRk/fjhCl0x+2cWLZJBZyIXMGXCZCGriUaZvaTkY5x1ZMbdfCWTKIWOOZn4w3ZyB3kJooXioxyaiqOxZWQgAIfkEBQcAIAAsYgBiADwAPAAABv9AkHBILBqNAAGBMAgcn9CoNKp4PBqIqXbLBUEslkqkSy4TKZh0xcwWKguFAdSSyWAsz8EBgSg420UFDA4ODE8IdHZ4RgINFhgXEQeARQYPERIRDgJGiHV3RwgXH6QahpRDBhASrBEIAEWeikYDER8dHh0cCqhDBA6srA9yRLKgRAEKGbi5GcS9AgqYwQuwQ8aLvhMfHrkfp71DwMEQBMWJx0IBDBvMHRac4derwQx/INhEBhbuHAnyRRgEy2TgGrpsAh5w6JZrwj2AIA7QExYvnxAEGNxpKMiGABwCAqwVWTCNVQJYFgdI4NbtA4SHQwJwEgBzyIAEC3ImIFATxIP/gRDk5AuwQIM7Z1DggDB35CaDpwwWIGhSJEFJCeqQgVDJUtcCRh6JFMiTACpUBQZC2mzASgu7XBXuWRsbCIoBBWbP+hHpgK6WBxuyqHtGSwrOvFF3/ukZxcA9pkZAajFwOO+CA/HMvHlCc4uTA3gtA8oslqoZBAvMEjYDOZyAAof/UXpMmtLdcGEZs9FdJgBviMCP+BYwoLjx48V/k0HOXEDnrR4NSJ9OXbpy4DQHFKjOXXpwLQG0d+f+XYo58eOpiyz/ROaAJfDjwwf4Xr78rc/Z6y+/3nVrVNeVsdp+U9QUIIFLRYagFJz4JY92T/CEimltKBGcZDb1F0UAfjnxoB94RxiAYSC1HQEAMa2Ft52CTzgIwlgHsuGii5VM8d9MTNQnxIBHWKiFHEyUGKEbHIHAUQAfCrefAEUWWRuNCDKZyoJR+DGElEIUKQSU+mkJApZGFjGAlkmi4uCNTUrhZS9lXpkmlVqAuSaS+ghZnpw9OshjG3TF0eObVBpnJ2lrElGcnXfCCYgBXCqKzDN7OlqEcyAEAMClmGaq6aabBgEAIfkEBQcAIAAsYwBiADsAPAAABv9AkHBILBqNAYHyyGw6n86DQoEgQK/YbAMCeSyy4LARIik/xGjiYC0AMCNlCYQpKBgMA3e6SEj4DwNvcXNICRAREQxWe0QFCwwMCwh6RXBlhEUGEhcXFhQJjI2PkAuLlYNGAg4XGK0WCKFECpCQCQFGlnJFAAgUGBkZGBSxRAi0kAa4qGoQv8AXX8RDs7QKAqeXRQkVzhgS0kQHo5AHlCC5mCAFEd2v4EQJxwuBQ+hDAQwW3engAQbjDCbVWwbCwIRuFdIkUdKGSTxaCwoMzAZC1QVgGS40MCfE3xQFpogIIFCgJIGGRgAquHVuGQJuwIQhKdDgwgYNFx5wrGjnjoH/AgMCcDxwjIHEJSACLGoW84KCIgMWUNjQoSoHDDvr+PQJlOW0WvSYBLroTWQCCRo+dPDgocOHCzuV9txq4CQlcWGfDJBg4UBHAxAyqGXLtkOGBk0GzN1agIDQNH6VNrDAYS3hDhwqWHtCku6drgqlUiXM9i2DvE5GLv68MwuEwZc1OCjgFYtiutf2CNhwecMEBLXBBLhdNxaCtpnnESMZPA0GjSFj5Y51gPa762DcLGTInWFr3d27Jy0i0cl3NNGNNA6aHjuj9u7RoI5vBD6RZBUH2B9yHvui/vS5B2CAV+QhzXyM0DNdLCddV8CAYNiFxoJDIMgIaFj0Vx52FhYxlxx9zRHRIDEUQhHSbeqNl8qGSNQXYmIcHoEfCI5lUVsS+5EnIhMsqiFEXjMywVKQTeQI4xAbstijGgTsF8CT8jVSIR/nQRkjkvdEVyKBIOTF4pZcQiVllmJeR2SZQvRYRyMvprEkmuoYMcCZB0LhJRTWETOnXmPCWVGdfGKJhJGxhLhnmnR0GIqVYV63ZqNuvgnpFWCmEQQAOw==";
        $("#Imagemodal").remove();

        let modal1 = `<div class="modal" id='Imagemodal' tabindex="-1" role="dialog">
  <div class="modal-dialog modal-sm" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5>Image</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <img src="${loader}" data-src=${data}/>
      </div>
    </div>
  </div>
</div>`;
        $("body").prepend(modal1);
        $("#Imagemodal img").Lazy();
        $("#Imagemodal").modal("show");
        //$img.attr('src', $img.attr('data-src')).removeAttr('data-src');
    };

    this.PopoverPlacement = function (context, source) {
        var position = $(source).position();

        if (position.left > 1150)
            return "left";
        else {
            return "right";
        }
    };

    this.GenerateButtons = function () {
        $("#objname").text(this.EbObject.DisplayName);
        $(".toolicons").show();
        $("#obj_icons").empty();
        this.submitId = "btnGo" + this.tableId;
        this.$submit = $("<button id='" + this.submitId + "' class='btn commonControl'><i class='fa fa-play' aria-hidden='true'></i></button>");
        $("#obj_icons").append(this.$submit);
        this.$submit.click(this.getColumnsSuccess.bind(this));

        if (this.EbObject.FormLinks.$values.length > 0) {
            this.CreateNewFormLinks();
        }

        if (window.location.href.indexOf("hairocraft") !== -1 && this.login === "uc" && this.dvName.indexOf("leaddetails") !== -1)
            $("#obj_icons").prepend(`<button class='btn' data-toggle='tooltip' title='New Customer' onclick='window.open("/leadmanagement","_blank");' ><i class="fa fa-user-plus"></i></button>`);

        if ($("#" + this.tableId).children().length > 0) {
            if (this.login === "dc") {
                $("#obj_icons").append(
                    "<div id='" + this.tableId + "_fileBtns' style='display: inline-block;'>" +
                    "<div class='btn-group'>" +
                    "<div class='btn-group'>" +
                    " <button id='btnPrint" + this.tableId + "' class='btn'  name='filebtn' data-toggle='tooltip' title='Print' ><i class='fa fa-print' aria-hidden='true'></i></button>" +
                    " <div class='btn btn-default dropdown-toggle' data-toggle='dropdown' name='filebtn' style='display: none;'>" +
                    "   <span class='caret'></span>  <!-- caret --></div>" +
                    "   <ul class='dropdown-menu' role='menu'>" +
                    "      <li><a href = '#' id='btnprintAll" + this.tableId + "'> Print All</a></li>" +
                    "     <li><a href = '#' id='btnprintSelected" + this.tableId + "'> Print Selected</a></li>" +
                    "</ul>" +
                    "</div>" +
                    "<button id='btnExcel" + this.tableId + "' class='btn'  name='filebtn' data-toggle='tooltip' title='Excel' ><i class='fa fa-file-excel-o' aria-hidden='true'></i></button>" +
                    "<button id='btnPdf" + this.tableId + "' class='btn'    name='filebtn'  data-toggle='tooltip' title='Pdf' ><i class='fa fa-file-pdf-o' aria-hidden='true'></i></button>" +
                    "<button id='btnCsv" + this.tableId + "' class='btn'    name='filebtn' data-toggle='tooltip' title='Csv' ><i class='fa fa-file-text-o' aria-hidden='true'></i></button>  " +
                    "<button id='btnCopy" + this.tableId + "' class='btn'  name='filebtn' data-toggle='tooltip' title='Copy to Clipboard' ><i class='fa fa-clipboard' aria-hidden='true'></i></button>" +
                    "</div>" +
                    "</div>" +
                    "</div>");
            }
            $("#" + this.tableId + "_fileBtns").find("[name=filebtn]").not("#btnExcel" + this.tableId).hide();

            if (this.login === "uc") {
                $("#obj_icons").append(`<div id='${this.tableId}_fileBtns' style='display: inline-block;'><div class='btn-group'></div></div>`);
                $.each(this.permission, function (i, obj) {
                    if (obj === "Excel")
                        $("#" + this.tableId + "_fileBtns .btn-group").append("<button id = 'btnExcel" + this.tableId + "' class='btn'  name = 'filebtn' data-toggle='tooltip' title = 'Excel' > <i class='fa fa-file-excel-o' aria-hidden='true'></i></button >");
                }.bind(this));
            }

            if (this.login === "uc") {
                dvcontainerObj.modifyNavigation();
            }
        }
        if (this.isSecondTime) {
            this.addFilterEventListeners();
        }

        if (this.IsTree) {
            $.contextMenu({
                selector: ".groupform",
                build: function ($trigger, e) {
                    $("body").find("td").removeClass("focus");
                    $("body").find("[role=row]").removeClass("selected");
                    $trigger.closest("[role=row]").addClass("selected");
                    if (this.GroupFormLink !== null) {
                        if ($(e.currentTarget).children().hasClass("levelzero")) {
                            return {
                                items: {
                                    "NewGroup": { name: "New Group", icon: "fa-external-link-square", callback: this.FormNewGroup.bind(this) },
                                    "NewItem": { name: "New Item", icon: "fa-external-link-square", callback: this.FormNewItem.bind(this) },
                                    "EditGroup": { name: "View Group", icon: "fa-external-link-square", callback: this.FormEditGroup.bind(this) }
                                }
                            };
                        }
                        else {
                            return {
                                items: {
                                    "NewGroup": { name: "New Group", icon: "fa-external-link-square", callback: this.FormNewGroup.bind(this) },
                                    "NewItem": { name: "New Item", icon: "fa-external-link-square", callback: this.FormNewItem.bind(this) },
                                    "EditGroup": { name: "View Group", icon: "fa-external-link-square", callback: this.FormEditGroup.bind(this) },
                                    "Move": { name: "Move Group", icon: "fa-external-link-square", callback: this.MoveGroupOrItem.bind(this) }
                                }
                            };
                        }
                    }
                    else {
                        if ($(e.currentTarget).hasClass("levelzero")) {
                            return {};
                        }
                        else {
                            return {
                                items: {
                                    "Move": { name: "Move Group", icon: "fa-external-link-square", callback: this.MoveGroupOrItem.bind(this) }
                                }
                            };
                        }
                    }
                }.bind(this)

            });

            $.contextMenu({
                selector: ".itemform",
                build: function ($trigger, e) {
                    $("body").find("td").removeClass("focus");
                    $("body").find("[role=row]").removeClass("selected");
                    $trigger.closest("[role=row]").addClass("selected");
                    if (this.ItemFormLink !== null) {
                        return {
                            items: {
                                "EditItem": { name: "View Item", icon: "fa-external-link-square", callback: this.FormEditItem.bind(this) },
                                "Move": { name: "Move Item", icon: "fa-external-link-square", callback: this.MoveGroupOrItem.bind(this) }
                            }
                        };
                    }
                    else {
                        return {
                            items: {
                                "Move": { name: "Move Item", icon: "fa-external-link-square", callback: this.MoveGroupOrItem.bind(this) }
                            }
                        };
                    }
                }.bind(this)

            });
        }
        $("#" + this.tableId + " tbody").off("click", ".groupform").on("click", ".groupform", this.collapseTreeGroup);
    };

    this.CreateNewFormLinks = function () {
        $("#obj_icons").append(`<div class="dropdown" style="display:inline-block;" id="NewFormdd${this.tableId}">
                    <button class="btn" type="button" id="NewFormButton${this.tableId}" data-toggle="dropdown" title='Newform'>
                        <i class="fa fa-plus" aria-hidden="true"></i>
                    </button>
                    <div class="dropdown-menu newform-menu">
                        <ul class="drp_ul"></ul>
                    </div>
                    </div>`);
        $.each(this.EbObject.FormLinks.$values, function (i, obj) {
            let url = `../webform/index?refid=${obj.Refid}&_params=""&_mode=2&_locId=${store.get("Eb_Loc-" + this.TenantId + this.UserId)}`;
            $(`#NewFormdd${this.tableId} .drp_ul`).append(`<li class="drp_item"><a class="dropdown-item" href="${url}" target="_blank">${obj.DisplayName}</a></li>`);
        }.bind(this));
    };

    this.FormNewGroup = function (key, opt, event) {
        this.rowData = this.unformatedData[opt.$trigger.parent().parent().index()];
        let filterparams = btoa(JSON.stringify(this.formatToMutipleParameters(this.treeColumn.GroupFormParameters.$values)));

        if (parseInt(EbEnums.LinkTypeEnum.Popup) === this.treeColumn.LinkType) {
            $("#iFrameFormPopupModal").modal("show");
            let url = `../webform/index?refid=${this.GroupFormLink}&_params=${filterparams}&_mode=12&_locId=${store.get("Eb_Loc-" + this.TenantId + this.UserId)}`;
            $("#iFrameFormPopup").attr("src", url);
        }
        else {
            var _form = document.createElement("form");
            let url = "../webform/index?refid=" + this.GroupFormLink;
            _form.setAttribute("method", "post");
            _form.setAttribute("action", url);
            _form.setAttribute("target", "_blank");

            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_params";
            input.value = filterparams;
            _form.appendChild(input);

            input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_mode";
            input.value = "2";
            _form.appendChild(input);

            input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_locId";
            input.value = store.get("Eb_Loc-" + this.TenantId + this.UserId);
            _form.appendChild(input);

            document.body.appendChild(_form);
            _form.submit();
            document.body.removeChild(_form);
        }
    };

    this.FormNewItem = function (key, opt, event) {
        this.rowData = this.unformatedData[opt.$trigger.parent().parent().index()];
        let filterparams = btoa(JSON.stringify(this.formatToMutipleParameters(this.treeColumn.ItemFormParameters.$values)));
        if (parseInt(EbEnums.LinkTypeEnum.Popup) === this.treeColumn.LinkType) {
            $("#iFrameFormPopupModal").modal("show");
            let url = `../webform/index?refid=${this.ItemFormLink}&_params=${filterparams}&_mode=12&_locId=${store.get("Eb_Loc-" + this.TenantId + this.UserId)}`;
            $("#iFrameFormPopup").attr("src", url);
        }
        else {
            let url = "../webform/index?refid=" + this.ItemFormLink;
            var _form = document.createElement("form");
            _form.setAttribute("method", "post");
            _form.setAttribute("action", url);
            _form.setAttribute("target", "_blank");

            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_params";
            input.value = filterparams;
            _form.appendChild(input);

            input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_mode";
            input.value = "2";
            _form.appendChild(input);

            input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_locId";
            input.value = store.get("Eb_Loc-" + this.TenantId + this.UserId);
            _form.appendChild(input);

            document.body.appendChild(_form);
            _form.submit();
            document.body.removeChild(_form);
        }
    };

    this.FormEditGroup = function (key, opt, event) {
        this.rowData = this.unformatedData[opt.$trigger.parent().parent().index()];
        let filterparams = btoa(JSON.stringify(this.formatToParameters(this.treeColumn.GroupFormId.$values)));
        if (parseInt(EbEnums.LinkTypeEnum.Popup) === this.treeColumn.LinkType) {
            $("#iFrameFormPopupModal").modal("show");
            let url = `../webform/index?refid=${this.GroupFormLink}&_params=${filterparams}&_mode=11&_locId=${store.get("Eb_Loc-" + this.TenantId + this.UserId)}`;
            $("#iFrameFormPopup").attr("src", url);
        }
        else {
            let url = "../webform/index?refid=" + this.GroupFormLink;
            var _form = document.createElement("form");
            _form.setAttribute("method", "post");
            _form.setAttribute("action", url);
            _form.setAttribute("target", "_blank");

            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_params";
            input.value = filterparams;
            _form.appendChild(input);

            input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_mode";
            input.value = "1";
            _form.appendChild(input);

            input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_locId";
            input.value = store.get("Eb_Loc-" + this.TenantId + this.UserId);
            _form.appendChild(input);

            document.body.appendChild(_form);
            _form.submit();
            document.body.removeChild(_form);
        }
    };

    this.FormEditItem = function (key, opt, event) {
        this.rowData = this.unformatedData[opt.$trigger.parent().parent().index()];
        let filterparams = btoa(JSON.stringify(this.formatToParameters(this.treeColumn.ItemFormId.$values)));
        if (parseInt(EbEnums.LinkTypeEnum.Popup) === this.treeColumn.LinkType) {
            $("#iFrameFormPopupModal").modal("show");
            let url = `../webform/index?refid=${this.ItemFormLink}&_params=${filterparams}&_mode=11&_locId=${store.get("Eb_Loc-" + this.TenantId + this.UserId)}`;
            $("#iFrameFormPopup").attr("src", url);
        }
        else {
            let url = "../webform/index?refid=" + this.ItemFormLink;
            var _form = document.createElement("form");
            _form.setAttribute("method", "post");
            _form.setAttribute("action", url);
            _form.setAttribute("target", "_blank");

            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_params";
            input.value = filterparams;
            _form.appendChild(input);

            input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_mode";
            input.value = "1";
            _form.appendChild(input);

            input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_locId";
            input.value = store.get("Eb_Loc-" + this.TenantId + this.UserId);
            _form.appendChild(input);

            document.body.appendChild(_form);
            _form.submit();
            document.body.removeChild(_form);
        }
    };

    this.formatToParameters = function (cols) {
        var filters = [];
        $.each(cols, function (i, col) {
            if (this.rowData[col.data] !== "")
                filters.push(new fltr_obj(col.Type, col.name, this.rowData[col.data]));
        }.bind(this));
        return filters;
    };

    this.formatToMutipleParameters = function (cols) {
        var filters = [];
        $.each(cols, function (i, col) {
            if (this.rowData[col.data] !== "")
                filters.push(new fltr_obj(col.Type, col.FormControl.Name, this.rowData[col.data]));
        }.bind(this));
        return filters;
    };

    this.collapseTreeGroup = function (e) {
        let el = (e.target).closest("td");
        let curRow = $(el).parents().closest("[role=row]");
        var level = parseInt($(curRow).attr("data-lvl"));
        var isShow = ($(el).children("i").hasClass("fa-minus-square-o")) ? false : true;
        let count = this.RowCount;
        let rows = {};
        for (var i = level; i >= 0; i--) {
            let temp = curRow.nextUntil("[data-lvl=" + i + "]");
            if (temp.length < count) {
                count = temp.length;
                rows = temp;
            }
        }
        if (isShow) {
            rows.show();
            $(el).children("i").removeClass("fa-plus-square-o").addClass("fa-minus-square-o");
            rows.children().find("i.fa-plus-square-o").removeClass("fa-plus-square-o").addClass("fa-minus-square-o");
        }
        else {
            rows.hide();
            $(el).children("i").removeClass("fa-minus-square-o").addClass("fa-plus-square-o");
        }
    }.bind(this);

    this.AppendTreeModal = function () {
        $("#treemodal").remove();
        let modal1 = `<div class="modal fade" id="treemodal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="display: none;">
    <div class="modal-dialog">
        <div class="treemodal-container">
            <h4 class="treemodal-header">Move <span id="itemorgroup"></span></h4>
            <div class="tree_item_cont">
                <label>From </label>
                <span id="movefrom"></span>
            </div>
            <div class="tree_item_cont">
                <label>To</label>
                <button class="btn treemodalul">Select Group
                <span class="caret"></span></button>
            </div>
            <div class="pull-right">
                <button class="btn" id="treemodal_submit">Move</button>
                <button class="btn" id="treemodal_cancel">Cancel</button>
            </div>
        </div>
    </div>
</div>`;

        $("body").prepend(modal1);
    };

    this.MoveGroupOrItem = function (key, opt, event) {
        this.AppendTreeModal();
        let rowindex = this.Api.row(opt.$trigger.parent().closest("[role=row]")).index();
        this.movefromtext = this.unformatedData[rowindex][this.treeColumn.data];
        if (opt.selector === ".itemform")
            $("#itemorgroup").text("Item : " + this.movefromtext);
        else
            $("#itemorgroup").text("Group : " + this.movefromtext);
        this.IdColumnIndex = this.EbObject.Columns.$values.filter(function (obj) { return obj.name === "id"; })[0].data;
        this.movefromId = this.unformatedData[rowindex][this.IdColumnIndex];
        this.Items = {};
        this.createTreeItems___(this.treeData, this.Items);
        this.Items = this.Items.items;
        this.InitTreemodalContextmenu();
        $("#treemodal").modal("show");
        $("#treemodal_submit").off("click").on("click", this.MoveOKClick.bind(this));
        $("#treemodal_cancel").off("click").on("click", this.MoveCancelClick.bind(this));
    };

    this.createTreeItems___ = function (initems, outitems) {
        $.each(initems, function (_in, _out, i, item) {
            let Exist = item.item.filter(function (obj) { return obj === this.movefromtext; }.bind(this));
            if (Exist.length === 0) {
                if (item.isGroup) {
                    this.ulid = item.item[this.treeColumn.data];
                    if (!_out.hasOwnProperty("items"))
                        _out.items = {};
                    _out.items[this.ulid] = { "name": this.ulid, "data-pid": item.item[this.IdColumnIndex] };
                    this.createTreeItems___(item.children, _out.items[this.ulid]);
                }
            }
            else {
                $("#movefrom").text(outitems.name);
            }
        }.bind(this, initems, outitems));
    };

    this.InitTreemodalContextmenu = function () {
        $.contextMenu('destroy', '.treemodalul');
        $.contextMenu({
            selector: '.treemodalul',
            callback: this.MoveDDClick.bind(this),
            className: 'contextmenu-custom__highlight',
            items: this.Items,
            trigger: "left",
            autoHide: true,
            events: {
                show: function (options) {
                    this.clickCounter = 0;
                    return true;
                }.bind(this)
            }
        });
        this.clickCounter = 0;
        $(".contextmenu-custom__highlight .context-menu-submenu").off("click").on("click", this.MoveDDClick.bind(this));
    };

    this.getClickedItem = function (key) {
        $.each(this.Items, function (i, objOuter) {
            if (objOuter.name === key) {
                this.moveToPid = objOuter["data-pid"];
                return false;
            }
            else {
                if (objOuter.hasOwnProperty("items"))
                    this.getRecursivelyGetClickedItem(key, objOuter);
            }
        }.bind(this));
    };

    this.getRecursivelyGetClickedItem = function (key, objOuter) {
        $.each(objOuter.items, function (i, objInner) {
            if (objInner.name === key) {
                this.moveToPid = objInner["data-pid"];
                return false;
            }
            else {
                if (objInner.hasOwnProperty("items"))
                    this.getRecursivelyGetClickedItem(key, objInner);
            }
        }.bind(this));
    };

    this.MoveDDClick = function (key, options) {
        if (this.clickCounter === 0) {
            if (options === undefined)
                key = $(key.currentTarget).children("span").text();
            $("#treemodal .treemodalul").text(key).append('<span class="caret"></span></button>');
            this.getClickedItem(key);
            $(".contextmenu-custom__highlight").hide();
            $(".treemodalul").removeClass("context-menu-active");
            $("#context-menu-layer").remove();
            this.clickCounter++;
        }
    };

    this.MoveOKClick = function () {
        if (this.tableName !== null && this.moveToPid !== null && this.movefromId !== null) {
            let sql = `UPDATE ${this.tableName} SET ${this.treeColumn.ParentColumn.$values[0].name}= ${this.moveToPid}
                        WHERE id=${this.movefromId} `;
            $.ajax({
                type: "POST",
                url: "../DV/ExecuteTreeUpdate",
                data: { sql: sql },
                success: this.UpdateSuccess.bind(this)
            });
        }
        else {
            alert("Select One Group.....");
        }
    };

    this.MoveCancelClick = function () {
        this.clickCounter = 0;
        $("#treemodal").modal("hide");
    };

    this.UpdateSuccess = function () {
        this.$submit.trigger("click");
        $("#treemodal").modal("hide");
        this.clickCounter = 0;
    };

    this.setFilterboxValue = function (i, obj) {
        $(obj).children('div').children('.eb_finput').on("keydown", function (event) {
            if (event.keyCode === $.ui.keyCode.TAB &&
                $(this).autocomplete("instance").menu.active) {
                event.preventDefault();
            }
        });
        var name = $(obj).children('span').text();
        var tempobj = $.grep(this.EbObject.Columns.$values, function (col) { return col.name === name; });
        if (tempobj.length > 0)
            var idx = tempobj[0].data;
        var data = arrayColumn(this.unformatedData, idx);
        data = data.filter(function (elem, pos) {
            return data.indexOf(elem) === pos;
        });
        if ($(obj).children('div').children('.eb_finput').attr("data-coltyp") === "string") {
            this.setFilterboxValueInner(obj, data);
        }
        else {
            if ($(obj).children('div').length === 0) {
                var $lctrl = $("#" + this.tableId + "_wrapper .DTFC_LeftHeadWrapper table tr[class=addedbyeb] th:eq(" + i + ")").find(".eb_finput");
                var $rctrl = $("#" + this.tableId + "_wrapper .DTFC_RightHeadWrapper table tr[class=addedbyeb] th:eq(" + i + ")").find(".eb_finput");
                if ($lctrl.length > 0) {
                    this.setfiletrvalueFixedcolumns($lctrl, data);
                }
                if ($rctrl.length > 0) {
                    this.setfiletrvalueFixedcolumns($rctrl, data);
                }
            }

        }
    };

    this.setFilterboxValueInner = function (obj, data) {
        $(obj).children('div').children('.eb_finput').autocomplete({
            source: function (request, response) {
                response($.ui.autocomplete.filter(
                    $.unique(data), extractLast(request.term)));
            }.bind(this),
            focus: function () {
                return false;
            },
            select: function (event, ui) {
                var terms = splitval(this.value);
                terms.pop();
                terms.push(ui.item.value);
                terms.push("");
                this.value = terms.join(" | ");
                return false;
            },
            search: function (event, ui) {
            }
        });
    }

    this.setfiletrvalueFixedcolumns = function ($ctrl, data) {
        if ($ctrl.attr("data-coltyp") === "string") {
            $ctrl.autocomplete({
                source: function (request, response) {
                    response($.ui.autocomplete.filter(
                        $.unique(data), extractLast(request.term)));
                }.bind(this),
                focus: function () {
                    return false;
                },
                select: function (event, ui) {
                    var terms = splitval(this.value);
                    terms.pop();
                    terms.push(ui.item.value);
                    terms.push("");
                    this.value = terms.join(" | ");
                    return false;
                },
                search: function (event, ui) {
                }
            });
        }
    };

    this.orderingEvent = function (e) {
        //var col = $(e.target).children('span').text();
        var col = $(e.target).text();
        var tempobj = $.grep(this.Api.settings().init().aoColumns, function (obj) { return obj.sTitle === col });
        var cls = $(e.target).attr('class');
        if (col !== '' && col !== "#") {
            this.order_info.col = tempobj[0].name;
            this.order_info.dir = (cls.indexOf('sorting_asc') > -1) ? 1 : 0;
            //this.orderColl = $.grep(this.orderColl, function (obj) { return obj.Column !== this.order_info.col }.bind(this));
            //if (this.EbObject.rowGrouping.$values.length === 0)
            //    this.orderColl = [];
            this.orderColl = [];
            this.orderColl.push(new order_obj(this.order_info.col, this.order_info.dir));
        }
    };

    this.GetFiltersFromSettingsTbl = function (zidx) {
        this.zindex = zidx;
        if (this.zindex === 50)
            this.eb_filter_controls_4fc = [];
        else if (this.zindex === 1)
            this.eb_filter_controls_4sb = [];

        //$.each(this.ebSettings.Columns.$values, this.GetFiltersFromSettingsTbl_inner.bind(this));
        $.each(this.Api.settings().init().aoColumns, this.GetFiltersFromSettingsTbl_inner.bind(this));
    };

    this.GetFiltersFromSettingsTbl_inner = function (i, col) {
        var _ls = "";

        if (col.bVisible === true) {
            var span = "<span hidden>" + col.name + "</span>";
            //var span = "";

            var htext_class = this.tableId + "_htext";

            var data_colum = "data-colum='" + col.name + "'";
            var data_table = "data-table='" + this.tableId + "'";

            var header_select = this.tableId + "_" + col.name + "_hdr_sel";
            var header_text1 = this.tableId + "_" + col.name + "_hdr_txt1";
            var header_text2 = this.tableId + "_" + col.name + "_hdr_txt2";

            _ls += "<th>";
            if (col.name === "serial") {
                _ls += (span + "<a class='btn btn-sm center-block'  id='clearfilterbtn_" + this.tableId + "' data-table='@tableId' data-toggle='tooltip' title='Clear Filter' style='height:100%'><i class='fa fa-filter' aria-hidden='true' style='color:black'></i></a>");
            }
            else if (col.IsCustomColumn) {
                _ls += span;
            }
            else {
                if (col.RenderType === parseInt(gettypefromString("Int32")) || col.RenderType === parseInt(gettypefromString("Decimal")) || col.RenderType === parseInt(gettypefromString("Int64")) || col.RenderType == parseInt(gettypefromString("Double")) || col.RenderType == parseInt(gettypefromString("Numeric"))) {
                    if (parseInt(EbEnums.ControlType.Text) === col.filterControl)
                        _ls += (span + this.getFilterForString(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                    else if (parseInt(EbEnums.ControlType.Date) === col.filterControl)
                        _ls += (span + this.getFilterForDateTime(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                    else
                        _ls += (span + this.getFilterForNumeric(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                }
                else if (col.RenderType === parseInt(gettypefromString("String"))) {
                    //if (this.dtsettings.filterParams === null || this.dtsettings.filterParams === undefined)
                    if (parseInt(EbEnums.ControlType.Numeric) === col.filterControl)
                        _ls += (span + this.getFilterForNumeric(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                    else if (parseInt(EbEnums.ControlType.Date) === col.filterControl)
                        _ls += (span + this.getFilterForDateTime(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                    else
                        _ls += (span + this.getFilterForString(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                    //else
                    //   _ls += (span + this.getFilterForString(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, this.dtsettings.filterParams));
                }
                else if (col.RenderType === parseInt(gettypefromString("DateTime")) || col.RenderType === parseInt(gettypefromString("Date"))) {
                    if (parseInt(EbEnums.ControlType.Numeric) === col.filterControl)
                        _ls += (span + this.getFilterForNumeric(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                    else if (parseInt(EbEnums.ControlType.Text) === col.filterControl)
                        _ls += (span + this.getFilterForString(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                    else
                        _ls += (span + this.getFilterForDateTime(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                }
                else if (col.RenderType === parseInt(gettypefromString("Boolean")) && col.name !== "checkbox")
                    _ls += (span + this.getFilterForBoolean(col.name, this.tableId, this.zindex));
                else
                    _ls += (span);
            }

            _ls += ("</th>");

            ((this.zindex === 50) ? this.eb_filter_controls_4fc : this.eb_filter_controls_4sb).push(_ls);
        }
    };

    this.getFilterForNumeric = function (header_text1, header_select, data_table, htext_class, data_colum, header_text2, zidx, DefOp) {
        var coltype = "data-coltyp='number'";
        var drptext = "";
        var op = String.empty;
        switch (DefOp.toString()) {
            case EbEnums.NumericOperators.Equals: op = '='; break;
            case EbEnums.NumericOperators.LessThan: op = '<'; break;
            case EbEnums.NumericOperators.GreaterThan: op = '>'; break;
            case EbEnums.NumericOperators.LessThanOrEqual: op = '<='; break;
            case EbEnums.NumericOperators.GreaterThanOrEqual: op = '>='; break;
            case EbEnums.NumericOperators.Between: op = 'B'; break;
            default: op = '=';
        }
        drptext = "<div class='input-group input-group-sm'>" +
            "<div class='input-group-btn'>" +
            " <button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='" + header_select + "'> " + op + " </button>" +
            " <ul class='dropdown-menu'>" +//  style='z-index:" + zidx.toString() + "'
            " <li class='filterli'><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> = </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 6px;'> Equal to</span></li>" +
            " <li class='filterli'><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> < </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 6px;'> Less than</span></li>" +
            " <li class='filterli'><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> > </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 6px;'> Greater than</span></li>" +
            " <li class='filterli'><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> <= </a><span class='filtertext eb_fsel" + this.tableId + "'> Less than or Equal</span></li>" +
            " <li class='filterli'><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> >= </a><span class='filtertext eb_fsel" + this.tableId + "'> Greater than or Equal</span></li>" +
            "<li class='filterli'><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> B </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 6px;'> Between</span></li>" +
            " </ul>" +
            " </div>" +
            " <input type='number' data-toggle='tooltip' class='form-control eb_finput " + htext_class + "' id='" + header_text1 + "' " + data_table + data_colum + coltype + ">" +
            //" <span class='input-group-btn'></span>" +
            //" <input type='number' class='form-control eb_finput " + htext_class + "' id='" + header_text2 + "' style='visibility: hidden' " + data_table + data_colum + coltype + ">" +
            " </div> ";
        return drptext;
    };

    this.getFilterForDateTime = function (header_text1, header_select, data_table, htext_class, data_colum, header_text2, zidx, DefOp) {
        var op = String.empty;
        switch (DefOp.toString()) {
            case EbEnums.NumericOperators.Equals: op = '='; break;
            case EbEnums.NumericOperators.LessThan: op = '<'; break;
            case EbEnums.NumericOperators.GreaterThan: op = '>'; break;
            case EbEnums.NumericOperators.LessThanOrEqual: op = '<='; break;
            case EbEnums.NumericOperators.GreaterThanOrEqual: op = '>='; break;
            case EbEnums.NumericOperators.Between: op = 'B'; break;
            default: op = '=';
        }
        var coltype = "data-coltyp='date'";
        var filter = "<div class='input-group input-group-sm'>" +
            "<div class='input-group-btn'>" +
            " <button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='" + header_select + "'> " + op + " </button>" +
            "<ul class='dropdown-menu'>" +//  style='z-index:" + zidx.toString() + "'
            " <li class='filterli'><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> = </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 6px;'> Equal to</span></li>" +
            " <li class='filterli'><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> < </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 6px;'> Less than</span></li>" +
            " <li class='filterli'><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> > </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 6px;'> Greater than</span></li>" +
            " <li class='filterli'><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> <= </a><span class='filtertext eb_fsel" + this.tableId + "'> Less than or Equal</span></li>" +
            " <li class='filterli'><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> >= </a><span class='filtertext eb_fsel" + this.tableId + "'> Greater than or Equal</span></li>" +
            " <li class='filterli'><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> B </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 6px;'> Between</span></li>" +
            " </ul>" +
            " </div>" +
            " <input type='text' placeholder='" + this.datePattern + "' data-toggle='tooltip' class='no-spin form-control eb_finput " + htext_class + "' id='" + header_text1 + "' " + data_table + data_colum + coltype + ">" +
            //" <span class='input-group-btn'></span>" +
            //" <input type='date' class='form-control eb_finput " + htext_class + "' id='" + header_text2 + "' style='visibility: hidden' " + data_table + data_colum + coltype + ">" +
            " </div> ";

        return filter;

    };

    this.getFilterForString = function (header_text1, header_select, data_table, htext_class, data_colum, header_text2, zidx, DefOp) {
        var op = String.empty;
        switch (DefOp.toString()) {
            case EbEnums.StringOperators.Equals: op = '='; break;
            case EbEnums.StringOperators.Startwith: op = 'x*'; break;
            case EbEnums.StringOperators.EndsWith: op = '*x'; break;
            case EbEnums.StringOperators.Between: op = '*x*'; break;
            default: op = '=';
        }
        var coltype = " data-coltyp='string'";
        var drptext = "";
        drptext = "<div class='input-group input-group-sm'>" +
            "<div class='input-group-btn'>" +// style='z-index:" + zidx.toString() + "'
            " <button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='" + header_select + "'>" + op + "</button>" +
            " <ul class='dropdown-menu'>" +

            "   <li class='filterli'><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> x* </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 5px;'> Starts with</span></li>" +
            "  <li class='filterli'><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> *x </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 5px;'> Ends with</span></li>" +
            "  <li class='filterli'><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> *x* </a><span class='filtertext eb_fsel" + this.tableId + "' > Contains</span></li>" +
            " <li class='filterli'><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> = </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 9px;'> Exact match</span></li>" +
            " </ul>" +
            " </div>" +
            " <input type='text' data-toggle='tooltip'  class='form-control eb_finput " + htext_class + "' id='" + header_text1 + "' " + data_table + data_colum + coltype + ">" +
            " </div> ";
        return drptext;
    };

    this.getFilterForBoolean = function (colum, tableId, zidx) {
        var filter = "";
        var id = tableId + "_" + colum + "_hdr_txt1";
        var cls = tableId + "_hchk";
        filter = "<input type='checkbox' id='" + id + "' data-toggle='tooltip' title='' data-colum='" + colum + "' data-coltyp='boolean' data-table='" + tableId + "' class='" + cls + " " + tableId + "_htext eb_fbool" + this.tableId + "' style='margin-left: 50%;'></center>";
        return filter;
    };

    this.clearFilter = function () {
        var flag = false;
        var tableid = this.tableId;
        $('.' + this.tableId + '_htext').each(function (i) {

            if ($(this).hasClass(tableid + '_hchk')) {
                if (!($(this).is(':indeterminate'))) {
                    flag = true;
                    $(this).prop("indeterminate", true);
                }
            }
            else {
                if ($(this).val() !== '') {
                    flag = true;
                    $(this).val('');
                }
            }
        });
        if (flag || this.filterFlag) {
            this.columnSearch = [];
            this.Api.ajax.reload();
            this.filterFlag = false;
            $('#clearfilterbtn_' + this.tableId).children("i").removeClass("fa-times").addClass("fa-filter");
            $(".tooltip").remove();
        }
    };

    this.setLiValue = function (e) {
        let elemnt = ($(e.target).is("a")) ? $(e.target) : $(e.target).siblings("a");
        var selText = $(elemnt).text();
        var table = $(elemnt).attr('data-table');
        var flag = false;
        var colum = $(elemnt).attr('data-colum');
        var ctype = $(elemnt).parents('.input-group').find("input").attr('data-coltyp');
        var dateclas = (ctype === "date") ? "no-spin" : "";
        $(elemnt).parents('.input-group-btn').find('.dropdown-toggle').html(selText);
        if (selText.trim() === 'B') {
            if ($(elemnt).parents('.input-group').find("input").length == 1) {
                if (ctype === "date") {
                    $(elemnt).parents('.input-group').append("<input type='text' placeholder='" + this.datePattern + "' class='" + dateclas + " between-inp form-control eb_finput " + this.tableId + "_htext' id='" + this.tableId + "_" + colum + "_hdr_txt2' data-coltyp='" + ctype + "'>");
                    $("#" + this.tableId + "_" + colum + "_hdr_txt2").datepicker({
                        dateFormat: this.datePattern.replace(new RegExp("M", 'g'), "m").replace(new RegExp("yy", 'g'), "y"),
                        beforeShow: function (elem, obj) {
                            $(".ui-datepicker").addClass("datecolumn-picker");
                        }
                    });
                    $("#" + this.tableId + "_" + colum + "_hdr_txt2").on("click", function () {
                        $(this).datepicker("show");
                    });
                }
                else {
                    $(e.target).parents('.input-group').append("<input type='number' class='" + dateclas + " between-inp form-control eb_finput " + this.tableId + "_htext' id='" + this.tableId + "_" + colum + "_hdr_txt2' data-coltyp='" + ctype + "'>");
                }
                $("#" + this.tableId + "_" + colum + "_hdr_txt1").addClass("between-inp");
                $("#" + this.tableId + "_" + colum + "_hdr_txt2").on("keyup", this.call_filter);

            }
        }
        else if (selText.trim() !== 'B') {
            if ($(elemnt).parents('.input-group').find("input").length == 2) {
                $(elemnt).parents('.input-group').find("input").eq(1).remove();
                $("#" + this.tableId + "_" + colum + "_hdr_txt1").removeClass("between-inp");
            }
        }
        this.Api.columns.adjust();
        e.preventDefault();
    };

    this.call_filter = function (e) {
        if (e.keyCode === 13) {
            var flag = true;
            if ($(e.target).siblings(".eb_finput").length === 1) {
                if ($(e.target).val() === "") {
                    $(e.target).css("border-color", "red");
                    flag = false;
                }
                else
                    $(e.target).css("border-color", "#ccc");
                if ($(e.target).siblings(".eb_finput").val() === "") {
                    $(e.target).siblings(".eb_finput").css("border-color", "red");
                    flag = false;
                }
                else
                    $(e.target).siblings(".eb_finput").css("border-color", "#ccc");
            }
            else {
                if ($(e.target).val().trim() == "") {
                    flag = false;
                    $(e.target).css("border-color", "red");
                }
                else
                    $(e.target).css("border-color", "#ccc");
            }

            if (flag) {
                this.columnSearch = this.repopulate_filter_arr();
                $('#' + this.tableId).DataTable().ajax.reload();
                if ($('#clearfilterbtn_' + this.tableId).children("i").hasClass("fa-filter"))
                    $('#clearfilterbtn_' + this.tableId).children("i").removeClass("fa-filter").addClass("fa-times");
            }
        }
        else {
            $("[data-coltyp=date]").datepicker("hide");
            this.columnSearch = this.repopulate_filter_arr();
            if (typeof (e.key) === "undefined") {
                $('#' + this.tableId).DataTable().ajax.reload();
                if ($('#clearfilterbtn_' + this.tableId).children("i").hasClass("fa-filter"))
                    $('#clearfilterbtn_' + this.tableId).children("i").removeClass("fa-filter").addClass("fa-times");
            }
        }

    }.bind(this);

    this.dblclickDateColumn = function () {
        this.type = "text";
        this.select();
    };

    this.pasteDateColumn = function (e) {
        var data = e.originalEvent.clipboardData.getData('Text');
        var dt = data.split("/");
        this.value = [dt[2].trim(), dt[1].trim(), dt[0].trim()].join("-");
        e.preventDefault();
    };

    this.focusoutDateColumn = function () {
        var data = $(event.target)[0].value;
        var dt = data.split("/");
        if (dt.length === 1)
            dt = data.split("-");
        if (dt[0].length <= 2)
            data = [dt[2].trim(), dt[1].trim(), dt[0].trim()].join("-");
        else
            data = [dt[0].trim(), dt[1].trim(), dt[2].trim()].join("-");
        $(event.target)[0].value = formatDate(data);
        $(event.target)[0].type = "date";
        if (this.Api)
            this.Api.columns.adjust();
    };

    this.changeDateOrder = function (data) {
        var dt = data.split("/");
        var dtp = this.datePattern.split("/");
        if (dt.length === 1)
            dt = data.split("-");
        if (dtp.length === 1)
            dtp = this.datePattern.split("-");

        if (dt[0].length <= 2)
            return [dt[2].trim(), dt[1].trim(), dt[0].trim()].join("-");
        else
            return [dt[0].trim(), dt[1].trim(), dt[2].trim()].join("-");
    };

    this.retainDateOrder = function (data) {
        var dt = data.split("-");
        return [dt[2].trim(), dt[1].trim(), dt[0].trim()].join("/");
    };

    this.toggleInFilter = function (e) {
        var table = $(e.target).attr('data-table');
        this.call_filter({ keyCode: 10 });
        //this.Api.ajax.reload();
    };

    this.toggleFilterdialog = function () {
        $("#" + this.ContextId).toggle();
    };

    this.togglePPGrid = function () {
        $(".ppcont").toggle();
    };

    this.fselect_func = function (e) {
        let element = ($(e.target).is("a")) ? $(e.target) : $(e.target).siblings("a");
        var selValue = $(element).text().trim();
        $(element).parents('.input-group-btn').find('.dropdown-toggle').html(selValue);
        var table = $(element).attr('data-table');
        var colum = $(element).attr('data-column');
        var decip = $(element).attr('data-decip');
        var col = this.Api.column(colum + ':name');
        var ftrtxt;
        var agginfo = $.grep(this.eb_agginfo, function (obj) { return obj.colname === colum; });
        ftrtxt = '.dataTables_scrollFootInner #' + this.tableId + '_' + colum + '_ftr_txt0';
        if ($(ftrtxt).length === 0)
            ftrtxt = '.DTFC_LeftFootWrapper #' + this.tableId + '_' + colum + '_ftr_txt0';
        if ($(ftrtxt).length === 0)
            ftrtxt = '.DTFC_RightFootWrapper #' + this.tableId + '_' + colum + '_ftr_txt0';

        if (selValue === '∑')
            pageTotal = (typeof this.summary[agginfo[0].data] !== "undefined") ? this.summary[agginfo[0].data][0] : 0;
        else if (selValue === 'x̄')
            pageTotal = (typeof this.summary[agginfo[0].data] !== "undefined") ? this.summary[agginfo[0].data][1] : 0;

        $(ftrtxt).val(pageTotal);
        e.preventDefault();
        //e.stopPropagation();
    };

    this.clickAlSlct = function (e) {
        //var tableid = $(e.target).attr('data-table');
        if (e.target.checked)
            $('#' + this.tableId + '_wrapper tbody [type=checkbox]:not(:checked)').trigger('click');
        else
            $('#' + this.tableId + '_wrapper tbody [type=checkbox]:checked').trigger('click');

        e.stopPropagation();
    };

    this.renderCheckBoxCol = function (data2, type, row, meta) {
        if (this.FlagPresentId) {
            var idpos = $.grep(this.ebSettings.Columns.$values, function (e) { return e.name === "id"; })[0].data;
            this.rowId = meta.row; //do not remove - for updateAlSlct
            if (row[idpos])
                return "<input type='checkbox' class='" + this.tableId + "_select' name='" + this.tableId + "_id' value='" + row[idpos].toString() + "'/>";
            else
                return "<input type='checkbox' class='" + this.tableId + "_select'/>";
        }
        else
            return "<input type='checkbox' class='" + this.tableId + "_select'/>";
    };

    this.updateAlSlct = function (e) {
        var idx = this.Api.row($(e.target).parent().parent()).index();
        if (e.target.checked) {
            this.Api.rows(idx).select();
            $('#' + this.tableId + '_wrapper table:eq(0) thead tr:eq(0) [type=checkbox]').prop("indeterminate", true);
        }
        else {
            this.Api.rows(idx).deselect();
            $('#' + this.tableId + '_wrapper table:eq(0) thead tr:eq(0) [type=checkbox]').prop("indeterminate", true);
        }
        var CheckedCount = $('.' + this.tableId + '_select:checked').length;
        var UncheckedCount = this.Api.rows().count() - CheckedCount;
        if (CheckedCount === this.Api.rows().count()) {
            $('#' + this.tableId + '_wrapper table:eq(0) thead tr:eq(0) [type=checkbox]').prop("indeterminate", false);
            $('#' + this.tableId + '_wrapper table:eq(0) thead tr:eq(0) [type=checkbox]').prop('checked', true);
        }
        else if (UncheckedCount === this.Api.rows().count()) {
            $('#' + this.tableId + '_wrapper table:eq(0) thead tr:eq(0) [type=checkbox]').prop("indeterminate", false);
            $('#' + this.tableId + '_wrapper table:eq(0) thead tr:eq(0) [type=checkbox]').prop('checked', false);
        }
    };

    this.showOrHideAggrControl = function (e) {
        $('#' + this.tableId + '_wrapper .dataTables_scrollFootInner tfoot tr:eq(0)').toggle();
        $("#" + this.tableId + "_wrapper .DTFC_LeftFootWrapper tfoot tr:eq(0)").toggle();
        $("#" + this.tableId + "_wrapper .DTFC_RightFootWrapper tfoot tr:eq(0)").toggle();
        this.Api.columns.adjust();
    };

    this.link2NewTable = function (e) {
        this.rowgroupFilter = [];
        var rows = this.Api.rows(idx).nodes();
        var cData;
        var colindex = -1;
        this.isContextual = true;
        if ($(e.target).closest("a").attr("data-latlong") !== undefined)
            cData = $(e.target).closest("a").attr("data-latlong");
        else if ($(e.target).closest("a").attr("data-inline") !== undefined) {
            cData = $(e.target).closest("a").attr("data-data");
            this.inline = true;
            colindex = parseInt($(e.target).closest("a").attr("data-colindex"));
        }
        else if ($(e.target).closest("a").attr("data-popup") !== undefined) {
            cData = $(e.target).closest("a").attr("data-data");
            this.popup = true;
            colindex = parseInt($(e.target).closest("a").attr("data-colindex"));
        }
        else {
            cData = $(e.target).text();
            colindex = parseInt($(e.target).closest("a").attr("data-colindex"));
        }
        this.linkDV = $(e.target).closest("a").attr("data-link");
        var idx = this.Api.row($(e.target).parents().closest("td")).index();
        if (typeof (idx) !== "undefined")
            this.rowData = this.unformatedData[idx];
        else {//incomplete...
            this.rowData = [];
        }
        var x = this.getStaticParameter(colindex);
        this.filterValuesforForm = [];
        if (parseInt(this.linkDV.split("-")[2]) !== EbObjectTypes.WebForm)
            this.filterValues = this.getFilterValues().concat(this.getfilterFromRowdata()).concat(x);
        else
            this.filterValuesforForm = this.getfilterFromRowdata();

        if ($(e.target).parent("b").attr("data-rowgroup") !== undefined) {

            this.getRowGroupFilter($(e.target).parent("b"));
            if (this.CurrentRowGroup.$type.indexOf("SingleLevelRowGroup") !== -1) {
                $.each($(e.target).parent("b").siblings("b"), function (i, elem) {
                    this.getRowGroupFilter($(elem));
                }.bind(this));
            }
            else {
                var $elem = $(e.target).parents().closest(".group");
                let count = $elem.attr("group");
                for (var i = count - 1; i >= 0; i--) {
                    $elem = $(e.target).parents().closest(".group").prevAll().closest(".group[group=" + i + "]").last();
                    this.getRowGroupFilter($elem.children().find("b"));
                }
            }

            this.filterValues = this.filterValues.concat(this.rowgroupFilter);
        }

        if (this.inline) {
            this.inline = false;
            if ($(rows).eq(idx).next().attr("id") !== "containerrow" + colindex) {
                this.drawInlinedv(rows, e, idx, colindex);
            }
            else {
                this.OpenInlineDv(rows, e, idx, colindex);
            }
        }
        else if (this.popup) {
            this.popup = false;
            $("#iFrameFormPopupModal").modal("show");
            let url = `../webform/index?refid=${this.linkDV}&_params=${btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValuesforForm))))}&_mode=1${this.dvformMode}&_locId=${store.get("Eb_Loc-" + this.TenantId + this.UserId)}`;
            $("#iFrameFormPopup").attr("src", url);
        }
        else {
            if (this.login === "uc")
                dvcontainerObj.drawdvFromTable(btoa(unescape(encodeURIComponent(JSON.stringify(this.rowData)))), btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValues)))), btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValuesforForm)))), cData.toString(), this.dvformMode);//, JSON.stringify(this.filterValues)
            else
                this.OpeninNewTab(idx, cData);
        }
        //this.filterValues = [];
    };

    this.drawInlinedv = function (rows, e, idx, colindex) {
        $("#eb_common_loader").EbLoader("show");
        $(e.target).parents().closest("td").siblings().children(".tablelink").children("i").removeClass("fa-caret-up").addClass("fa-caret-down");
        this.call2newDv(rows, idx, colindex);
        $(e.target).closest("I").removeClass("fa-caret-down").addClass("fa-caret-up");
    };
    this.OpenInlineDv = function (rows, e, idx, colindex) {
        if ($(e.target).closest("I").hasClass("fa-caret-up")) {
            $(e.target).closest("I").removeClass("fa-caret-up").addClass("fa-caret-down");
            $(rows).eq(idx).next().hide();
        }
        else {
            $(e.target).closest("I").removeClass("fa-caret-down").addClass("fa-caret-up");
            $(rows).eq(idx).next().show();
        }
        this.Api.columns.adjust();
    };

    this.getRowGroupFilter = function ($elem) {
        let name = $elem.attr("data-colname");
        let type = parseInt($elem.attr("data-coltype"));
        let val = $elem.attr("data-data");
        if (type === 5 || type === 6)
            val = val.split("/").join('-');
        this.rowgroupFilter.push(new fltr_obj(type, name, val));
    };

    this.call2newDv = function (rows, idx, colindex) {
        $.ajax({
            type: "POST",
            url: "../DV/getdv",
            data: { refid: this.linkDV },
            success: this.GetData4InlineDv.bind(this, rows, idx, colindex)
        });
    };

    this.GetData4InlineDv = function (rows, idx, colindex, result) {
        var Dvobj = JSON.parse(result).DsObj;
        var param = this.Params4InlineTable(Dvobj);
        $.ajax({
            type: "POST",
            url: "../DV/getData4Inline",
            data: param,
            success: this.LoadInlineDv.bind(this, rows, idx, Dvobj, colindex)
        });
    };

    this.LoadInlineDv = function (rows, idx, Dvobj, colindex, result) {
        let colspan = Dvobj.Columns.$values.length;
        let str = "";
        $.each(this.rowgroupCols, function (k, obj) {
            str += "<td>&nbsp;</td>";
        });
        $.each(this.extraCol, function (k, obj) {
            if (obj.bVisible)
                str += "<td>&nbsp;</td>";
        });

        $(rows).eq(idx).next(".containerrow").remove();
        if (Dvobj.$type.indexOf("EbTableVisualization") !== -1) {
            $(rows).eq(idx).after("<tr class='containerrow' id='containerrow" + colindex + "'>" + str + "<td colspan='" + colspan + "'><div class='inlinetable '><div class='close' type='button' title='Close'>x</div><div class='Obj_title' id='objName" + idx + "'>" + Dvobj.DisplayName + "</div><table id='tbl" + idx + "' class='table display table-bordered compact'></table></td></tr></div>");

            var o = new Object();
            o.tableId = "tbl" + idx;
            o.showFilterRow = false;
            o.showSerialColumn = true;
            o.showCheckboxColumn = false;
            o.source = "inline";
            o.scrollHeight = "200px";
            o.dvObject = Dvobj;
            o.data = result;
            o.keys = false;
            this.datatable = new EbBasicDataTable(o);
            if (this.EbObject.DisableRowGrouping || this.EbObject.RowGroupCollection.$values.length === 0)
                $(".inlinetable").css("width", $(window).width() - 115);
            else
                $(".inlinetable").css("width", $(window).width() - 175);
            this.datatable.Api.columns.adjust();
        }
        else {
            $(rows).eq(idx).after("<tr class='containerrow' id='containerrow" + colindex + "'>" + str + "<td colspan='" + colspan + "'><div class='inlinetable'><div class='close' type='button' title='Close'>x</div><div class='Obj_title' id='objName" + idx + "'>" + Dvobj.DisplayName + "</div><div id='canvasDivchart" + idx + "' ></div></td></tr></div>");
            var o = new Object();
            o.tableId = "chart" + idx;
            o.dvObject = Dvobj;
            o.data = result.data;
            this.chartApi = new EbBasicChart(o);
            $(".inlinetable").css("height", "380px");
            $("#canvasDivchart" + idx).css("width", $(window).width() - 100);
            $("#canvasDivchart" + idx).css("height", "inherit");
        }
        $(".containerrow .close").off("click").on("click", function (e) {
            $(e.target).parents().closest(".containerrow").prev().children().find("I").removeClass("fa-caret-up").addClass("fa-caret-down");
            $(e.target).parents().closest(".containerrow").remove();
            this.Api.columns.adjust();
        }.bind(this));

        $("#eb_common_loader").EbLoader("hide");
        this.Api.columns.adjust();
    };

    this.Params4InlineTable = function (Dvobj) {
        var dq = new Object();
        dq.RefId = Dvobj.DataSourceRefId;
        dq.TFilters = [];
        dq.Params = this.filterValues;
        dq.Start = 0;
        dq.Length = 500;
        dq.DataVizObjString = JSON.stringify(Dvobj);
        return dq;
    };

    this.getStaticParameter = function (index) {
        var temp = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.data == index });
        var array = [];
        if (temp[0].StaticParameters.$values.length > 0) {
            $.each(temp[0].StaticParameters.$values, function (i, obj) {
                array.push(new fltr_obj(obj.Type, obj.Name, obj.Value));
            });
        }
        return array;
    };

    this.deleteTab = function (e) {
        var tabContentId = $(e.target).parent().attr("href");
        $(e.target).parent().parent().remove(); //remove li of tab
        $('#table_tabs a:last').tab('show'); // Select first tab
        $(tabContentId).remove();
    };

    this.CopyToClipboard = function (e) {
        $('#' + this.tableId + '_wrapper').find('.buttons-copy').click();
    };

    this.ExportToPrint = function (e) {
        $('#' + this.tableId + '_wrapper').find('.buttons-print')[0].click();
    };


    this.ExportToExcel = function (e) {
        $('#' + this.tableId + '_wrapper').find('.buttons-excel').click();
        //var ob = new Object();
        //ob.DataVizObjString = JSON.stringify(this.EbObject);
        //ob.Params = this.filterValues;
        //ob.TFilters = this.columnSearch;
        //this.ss = new EbServerEvents({ ServerEventUrl: 'https://se.eb-test.cloud', Channels: ["ExportToExcel"] });
        //this.ss.onExcelExportSuccess = function (url) {
        //    window.location.href = url;
        //};
        //$.ajax({
        //    type: "POST",
        //    url: "../DV/exportToexcel",
        //    data: { req: ob }
        //});

    };

    this.ExportToCsv = function (e) {
        $('#' + this.tableId + '_wrapper').find('.buttons-csv').click();
    };

    this.ExportToPdf = function (e) {
        $('#' + this.tableId + '_wrapper').find('.buttons-pdf').click();
    };

    this.printSelected = function (e) {
        $('#' + this.tableId + '_wrapper').find('.buttons-print')[1].click();
    };

    this.printAll = function (e) {
        $('#' + this.tableId + '_wrapper').find('.buttons-print')[0].click();
    };

    this.SwitchToChart = function () {
        $('#' + this.tableId).parents().find(".sub-windows").hide();
        this.stickBtn.hide();
        let chartobj = new EbObjects["EbChartVisualization"]("Container_" + Date.now());
        chartobj.Columns = JSON.parse(JSON.stringify(this.EbObject.Columns));
        chartobj.DSColumns = JSON.parse(JSON.stringify(this.EbObject.DSColumns));
        chartobj.DataSourceRefId = this.EbObject.DataSourceRefId;
        chartobj.Pippedfrom = this.EbObject.Name;
        let chartapi = eb_chart(chartobj.DataSourceRefId, null, null, chartobj, null, this.tabNum, this.ssurl, this.login, this.counter, this.MainData, btoa(JSON.stringify(this.rowData)), btoa(JSON.stringify(this.filterValues)), this.cellData, this.propGrid);
    };

    this.openColumnTooltip = function (e, i) {
        //$(e.currentTarget).siblings(".popover").find(".popover-content").empty().append(atob($(e.currentTarget).attr("data-contents")));
        //$(e.currentTarget).siblings(".popover").find(".arrow").remove();
    };

    this.collapseFilter = function () {
        this.filterBox.toggle();
        if (this.filterBox.css("display") == "none") {
            $("#btnCollapse" + this.tableId).children().remove();
            $("#btnCollapse" + this.tableId).append("<i class='fa fa-chevron-down' aria-hidden='true'></i>");
        }
        else {
            $("#btnCollapse" + this.tableId).children().remove();
            $("#btnCollapse" + this.tableId).append("<i class='fa fa-chevron-up' aria-hidden='true'></i>");
        }
    };


    this.updateRenderFunc = function () {
        $.each(this.ebSettings.Columns.$values, this.updateRenderFunc_Inner.bind(this));
    };

    this.updateRenderFunc_Inner = function (i, col) {
        this.ebSettings.Columns.$values[i].sClass = "";
        this.ebSettings.Columns.$values[i].className = "";

        if (col.RenderType === parseInt(gettypefromString("Int32")) || col.RenderType == parseInt(gettypefromString("Decimal")) || col.RenderType == parseInt(gettypefromString("Int64")) || col.RenderType == parseInt(gettypefromString("Numeric"))) {

            if (this.ebSettings.Columns.$values[i].Align.toString() === EbEnums.Align.Auto)
                this.ebSettings.Columns.$values[i].className += " tdheight dt-right";
        }
        if (col.RenderType === parseInt(gettypefromString("Boolean"))) {
            if (this.ebSettings.Columns.$values[i].name === "eb_void" || this.ebSettings.Columns.$values[i].name === "sys_cancelled") {
                this.ebSettings.Columns.$values[i].render = (this.ebSettings.Columns.$values[i].name === "sys_locked") ? this.renderLockCol.bind(this) : this.renderEbVoidCol.bind(this);
                this.ebSettings.Columns.$values[i].mRender = (this.ebSettings.Columns.$values[i].name === "sys_locked") ? this.renderLockCol.bind(this) : this.renderEbVoidCol.bind(this);
            }
            else {
                if (this.ebSettings.Columns.$values[i].RenderAs.toString() === EbEnums.BooleanRenderType.IsEditable) {
                    this.ebSettings.Columns.$values[i].render = this.renderEditableCol.bind(this);
                    this.ebSettings.Columns.$values[i].mRender = this.renderEditableCol.bind(this);
                }
                else if (this.ebSettings.Columns.$values[i].RenderAs.toString() === EbEnums.BooleanRenderType.Icon) {
                    this.ebSettings.Columns.$values[i].render = this.renderIconCol.bind(this);
                    this.ebSettings.Columns.$values[i].mRender = this.renderIconCol.bind(this);
                }
                else {
                    this.ebSettings.Columns.$values[i].render = function (data, type, row, meta) { return data; };
                    this.ebSettings.Columns.$values[i].mRender = function (data, type, row, meta) { return data; };
                }
            }
            if (this.ebSettings.Columns.$values[i].Align.toString() === EbEnums.Align.Auto)
                this.ebSettings.Columns.$values[i].className += " tdheight text-center";
        }
        if (col.RenderType === parseInt(gettypefromString("String")) || col.RenderType == parseInt(gettypefromString("Double"))) {
            if (this.ebSettings.Columns.$values[i].RenderAs.toString() === EbEnums.StringRenderType.Chart) {
                this.ebSettings.Columns.$values[i].render = this.lineGraphDiv.bind(this);
                this.ebSettings.Columns.$values[i].mRender = this.lineGraphDiv.bind(this);
            }
            else if (this.ebSettings.Columns.$values[i].RenderAs.toString() === EbEnums.StringRenderType.Image) {
                this.ebSettings.Columns.$values[i].render = this.renderFBImage.bind(this);
                this.ebSettings.Columns.$values[i].mRender = this.renderFBImage.bind(this);
            }
            else if (this.ebSettings.Columns.$values[i].RenderAs.toString() === EbEnums.StringRenderType.Icon) {
                this.ebSettings.Columns.$values[i].render = this.renderIconCol.bind(this);
                this.ebSettings.Columns.$values[i].mRender = this.renderIconCol.bind(this);
            }

            if (this.ebSettings.Columns.$values[i].Align.toString() === EbEnums.Align.Auto)
                this.ebSettings.Columns.$values[i].className += " tdheight dt-left";
        }
        if (col.RenderType === parseInt(gettypefromString("Date")) || col.RenderType == parseInt(gettypefromString("DateTime"))) {
            if (this.ebSettings.Columns.$values[i].Align.toString() === EbEnums.Align.Auto)
                this.ebSettings.Columns.$values[i].className += " tdheight dt-left";
        }
        if (col.name === "eb_created_by" || col.name === "eb_lastmodified_by")
            col.className += " dt-left";
        if (col.Font !== null) {
            var style = document.createElement('style');
            style.type = 'text/css';
            var array = [this.tableId, col.name, col.Font.FontName, col.Font.Size, col.Font.color.replace("#", "")];
            if ($("." + array.join("_")).length === 0) {
                style.innerHTML = "." + array.join("_") + "{font-family: " + col.Font.FontName + "!important; font-size: " + col.Font.Size + "px!important; color: " + col.Font.color + "!important; }";
                document.getElementsByTagName('body')[0].appendChild(style);
            }
            this.ebSettings.Columns.$values[i].className = array.join("_");
            this.ebSettings.Columns.$values[i].sClass = array.join("_");
        }

        if (this.ebSettings.Columns.$values[i].Align.toString() === EbEnums.Align.Left)
            this.ebSettings.Columns.$values[i].className += " tdheight dt-left";
        else if (this.ebSettings.Columns.$values[i].Align.toString() === EbEnums.Align.Right)
            this.ebSettings.Columns.$values[i].className += " tdheight dt-right";
        else if (this.ebSettings.Columns.$values[i].Align.toString() === EbEnums.Align.Center)
            this.ebSettings.Columns.$values[i].className += " tdheight text-center";

        this.ebSettings.Columns.$values[i].sClass = this.ebSettings.Columns.$values[i].className;
    };

    this.renderProgressCol = function (deci, data, type, row, meta) {
        return "<div class='progress'><div class='progress-bar' role='progressbar' aria-valuenow='" + parseFloat(data.toString()).toFixed(deci) + "' aria-valuemin='0' aria-valuemax='100' style='width:" + data.toString() + "%'>" + parseFloat(data.toString()).toFixed(deci) + "</div></div>";
    };

    this.renderToDecimalPlace = function (data, type, row, meta) {
        return parseFloat(data).toFixed();
    };

    this.renderEditableCol = function (data) {
        return (data === true) ? "<input type='checkbox' data-toggle='toggle' data-size='mini' checked>" : "<input type='checkbox' data-toggle='toggle' data-size='mini'>";
    };

    this.renderIconCol = function (data, type, row, meta) {
        if (meta.settings.aoColumns[meta.col].TrueValue.toLowerCase() === data.toLowerCase())
            return "<i class='fa fa-check' aria-hidden='true'  style='color:green'></i>";
        else if (meta.settings.aoColumns[meta.col].FalseValue.toLowerCase() === data.toLowerCase())
            return "<i class='fa fa-times' aria-hidden='true' style='color:red'></i>";
        else
            return data;
    };

    this.renderEbVoidCol = function (data) {
        return (data === "T" ) ? "<i class='fa fa-ban' aria-hidden='true'></i>" : "";
    };

    this.renderLockCol = function (data) {
        return (data === true) ? "<i class='fa fa-lock' aria-hidden='true'></i>" : "";
    };

    this.renderlink4NewTable = function (data, type, row, meta) {
        if (meta.settings.aoColumns[meta.col].LinkType.toString() === EbEnums.LinkTypeEnum.Popout)
            return "<a href='#' oncontextmenu='return false' class ='tablelink' data-link='" + meta.settings.aoColumns[meta.col].LinkRefId + "'>" + data + "</a>";
        else if (meta.settings.aoColumns[meta.col].LinkType.toString() === EbEnums.LinkTypeEnum.Inline)
            return data + `<a href='#' oncontextmenu='return false' class ='tablelink' data-link='${meta.settings.aoColumns[meta.col].LinkRefId}' data-inline="true" data-data='${data}'> <i class="fa fa-plus"></i></a>`;
        else
            return "<a href='#' oncontextmenu='return false' class ='tablelink' data-link='" + meta.settings.aoColumns[meta.col].LinkRefId + "'>" + data + "</a>" + ` &nbsp; <a href='#' oncontextmenu='return false' class ='tablelink' data-link='${meta.settings.aoColumns[meta.col].LinkRefId}' data-inline="true" data-data='${data}'> <i class="fa fa-plus"></i></a>`;
    };

    this.renderlinkandDecimal = function (deci, data) {
        return "<a href='#' oncontextmenu='return false' class ='tablelink' data-link='" + this.linkDV + "'>" + parseFloat(data).toFixed(deci) + "</a>";
    };

    this.colorRow = function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
        $.each(this.ebSettings.Columns.$values, function (i, value) {
            if (value.name === 'sys_row_color') {
                HEX = Number(aData[value.data]).toString(16);
                var t = (HEX.toString().length < 6) ? ("0" + HEX.toString()) : HEX;
                $(nRow).css('background-color', '#' + t);
            }

            if (value.name === 'sys_cancelled') {
                var tr = aData[value.data];
                if (tr === true)
                    $(nRow).css('color', '#f00');
            }
        });
    };

    this.lineGraphDiv = function (data, type, row, meta) {
        if (!data)
            return "";
        else
            return "<canvas id='eb_cvs" + meta.row + "' class='eb_canvas" + this.tableId + "' style='width:120px; height:40px; cursor:pointer;' data-graph='" + data + "' data-toggle='modal'></canvas><script>renderLineGraphs(" + meta.row + "); $('#eb_cvs" + meta.row + "').mousemove(function(e){ GPointPopup(e); });</script>";
    };

    this.RenderGraphModal = function () {
        $(document.body).append("<div class='modal fade' id='graphmodal' role='dialog'>"
            + "<div class='modal-dialog modal-lg'>"
            + " <div class='modal-content'>"
            + "<div class='modal-header'>"
            + "<button type = 'button' class='close' data-dismiss='modal'>&times;</button>"
            + "<h4 class='modal-title'><center>Graph</center></h4>"
            + "</div>"
            + "<div class='modal-body'>"
            + "<div class='dygraph-Wrapper'>"
            + "<div id='graphdiv' style='width:100%;height:500px;'></div>"
            + "</div>  "
            + "</div>"
            + "</div>"
            + "</div>"
            + "</div>");
        $(document).on('show.bs.modal', '.modal', function (event) {
            var zIndex = 1040 + (10 * $('.modal:visible').length);
            $(this).css('z-index', zIndex);
            setTimeout(function () {
                $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
            }, 0);
        });
    };

    this.renderMainGraph = function (e) {
        $("#graphmodal").modal('show');

        setTimeout(function () {
            var gcsv = csv($(e.target).attr("data-graph").toString());
            new Dygraph(
                document.getElementById('graphdiv'),
                gcsv,
                {
                    showRangeSelector: true,
                    interactionModel: Dygraph.defaultInteractionModel,
                    includeZero: true,
                    stackedGraph: true,
                    axes: {
                        y: {
                            valueFormatter: function (y) {
                                return y;
                            },
                            axisLabelFormatter: function (y) {
                                y = y.toString();
                                if (y.slice(-3) === '000')
                                    return y.slice(0, -3) + 'K';
                                else
                                    return y;
                            },
                        },
                        logscale: true
                    }
                }
            );
        }, 500);
    };

    this.ModifyDvname = function () {
        this.ebSettings.Name = $("#dvnametxt").val();
        $("label.dvname").text(this.ebSettings.Name);
    };

    this.ModifyTableHeight = function () {
        this.ebSettings.scrollY = $("#TableHeighttxt").val();
        this.ebSettings.scrollY = (this.ebSettings.scrollY < 100) ? "300" : this.ebSettings.scrollY;
    };

    this.renderMarker = function (data) {
        if (data !== ",")
            return `<a href='#' class ='columnMarker_${this.tableId}' data-latlong='${data}'><i class='fa fa-map-marker fa-2x' style='color:red;'></i></a>`;
        else
            return null;
    };

    this.renderFBImage = function (data) {
        //if (typeof (data) === "string")
        //    return `<img class='img-thumbnail' src='http://graph.facebook.com/${data}/picture?type=square' style="height: 20px;width: 25px;"/>`;
        //else
        //    return `<img class='img-thumbnail' src='http://graph.facebook.com/12345678/picture?type=square' style="height: 20px;width: 25px;"/>`;
        
        return `<img class='img-thumbnail columnimage' src='/images/small/${data}.jpg'/>`;
    };

    this.renderDataAsLabel = function (data) {
        return `<label class='labeldata'>${data}</label>`;
    };

    this.renderDateformat = function (data, sym) {
        if (typeof data !== "object" && typeof data !== "undefined") {
            var date = new Date(parseInt(data.substr(6)));
            var month = date.getMonth() + 1;
            var dt = date.getDate();
            if (sym === "-")
                return (dt.toString().length > 1 ? dt : "0" + dt) + "-" + (month.toString().length > 1 ? month : "0" + month) + "-" + date.getFullYear();
            else
                return (dt.toString().length > 1 ? dt : "0" + dt) + "/" + (month.toString().length > 1 ? month : "0" + month) + "/" + date.getFullYear();
        }
        else
            return "";
    };

    this.CreateRelationString = function () { };

    this.ValidateCalcExpression = function (obj) {
        $.ajax({
            url: "../RB/ValidateCalcExpression",
            type: "POST",
            cache: false,
            data: {
                refid: this.EbObject.DataSourceRefId,
                expression: atob(obj.ValueExpression)
            },
            success: function (result) {

            }.bind(this)
        });
    }

    this.start();
};

var ConditionalFormat = function () {
    this.getModal = function () {
        let modal1 = `
            <div class="modal fade" id="treemodal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="display: none;">
                <div class="modal-dialog">
                    <div class="treemodal-container">
                        <h4 class="treemodal-header">Conditional Rendering</span></h4>
                        <div class="tree_item_cont">
                            <label>From </label>
                            <span id="movefrom"></span>
                        </div>
                        <div class="tree_item_cont">
                            <label>To</label>
                            <button class="btn treemodalul">Select Group
                            <span class="caret"></span></button>
                        </div>
                        <div class="pull-right">
                            <button class="btn" id="treemodal_submit">Move</button>
                            <button class="btn" id="treemodal_cancel">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>`;
        $("body").append(modal1);
    };

    this.getModal();
};


function csv(gdata) {
    //gdata = ["201607:58179.28","201608:66329.35","201609:67591.27","201610:61900.93","201611:38628.72","201612:48536.31","201701:25256.74","201702:0"];
    var pairs = gdata.split(',');

    var r = 'date, Value\n';
    var ft;
    for (var i = 0; i < pairs.length; i++) {
        ft = pairs[i].split(':')[0].replace("\"", "").replace("[", "");

        ft = ft.slice(0, 4) + '/' + ft.slice(4);

        r += ft.replace("\"", "");
        r += '-01,' + pairs[i].split(':')[1].replace("\"", "");
        r += '\n';
    }
    return r.replace("]", "");
};

function renderLineGraphs(id) {
    var canvas = document.getElementById('eb_cvs' + id);
    var gdata = $(canvas).attr("data-graph").toString();
    var context = canvas.getContext('2d');
    if (gdata) {
        //gdata = '["201607:4529218.75","201608:4643253.00","201609:4886894.55","201610:5272744.25","201611:5253090.25","201612:5541506.00","201701:2964522.00"]';
        context.fillStyle = "rgba(255, 255, 255, 1)";
        context.beginPath();
        context.fillRect(0, 0, 1000, 1000);
        context.fillStyle = "rgba(51, 122, 183, 0.7)";
        var Gpoints = [];
        var Ypoints = [];
        Gpoints = gdata.split(",");
        var xInterval = (parseInt(canvas.style.width) * 2.5) / (Gpoints.length);
        context.moveTo(xInterval, 1000);
        var xPoint = 0;
        var yPoint;
        for (var i = 0; i < Gpoints.length; i++) {
            yPoint = parseInt(Gpoints[i].split(":")[1]);
            Ypoints.push(yPoint);
        }
        var Ymax = Ypoints.max();
        for (i = 0; i < Gpoints.length; i++) {
            xPoint += xInterval;
            context.lineTo(xPoint, 3.76 * (40 - ((Ypoints[i] / Ymax) * 40)));//
        }
        context.lineTo(xPoint, 1000);
        canvas.strokeStyle = "black";
        context.fill();
        context.stroke();
    }
};

function GPointPopup(e) {
    //alert(e.pageX);
};

$.fn.setCursorPosition = function (pos) {
    this.each(function (index, elem) {
        if (elem.setSelectionRange) {
            elem.setSelectionRange(pos, pos);
        } else if (elem.createTextRange) {
            var range = elem.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    });
    return this;
};

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function getColdata(matrix, col) {
    var column = [];
    for (var i = 0; i < matrix.length; i++) {
        column.push(matrix[i][col]);
    }
    return column;
}


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
    let isdifferentValue = ctrl.DataVals.Value && ctrl.DataVals.Value !== ctrl.DataVals.ValueExpr_val;
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
        success: function (_respObjStr) {
            valueExpHelper(_respObjStr, _ctrl);
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
/*!
 * Vue.js v2.1.10
 * (c) 2014-2017 Evan You
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global.Vue = factory());
}(this, (function () {
    'use strict';

    /*  */

    /**
     * Convert a value to a string that is actually rendered.
     */
    function _toString(val) {
        return val == null
            ? ''
            : typeof val === 'object'
                ? JSON.stringify(val, null, 2)
                : String(val)
    }

    /**
     * Convert a input value to a number for persistence.
     * If the conversion fails, return original string.
     */
    function toNumber(val) {
        var n = parseFloat(val);
        return isNaN(n) ? val : n
    }

    /**
     * Make a map and return a function for checking if a key
     * is in that map.
     */
    function makeMap(
        str,
        expectsLowerCase
    ) {
        var map = Object.create(null);
        var list = str.split(',');
        for (var i = 0; i < list.length; i++) {
            map[list[i]] = true;
        }
        return expectsLowerCase
            ? function (val) { return map[val.toLowerCase()]; }
            : function (val) { return map[val]; }
    }

    /**
     * Check if a tag is a built-in tag.
     */
    var isBuiltInTag = makeMap('slot,component', true);

    /**
     * Remove an item from an array
     */
    function remove$1(arr, item) {
        if (arr.length) {
            var index = arr.indexOf(item);
            if (index > -1) {
                return arr.splice(index, 1)
            }
        }
    }

    /**
     * Check whether the object has the property.
     */
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function hasOwn(obj, key) {
        return hasOwnProperty.call(obj, key)
    }

    /**
     * Check if value is primitive
     */
    function isPrimitive(value) {
        return typeof value === 'string' || typeof value === 'number'
    }

    /**
     * Create a cached version of a pure function.
     */
    function cached(fn) {
        var cache = Object.create(null);
        return (function cachedFn(str) {
            var hit = cache[str];
            return hit || (cache[str] = fn(str))
        })
    }

    /**
     * Camelize a hyphen-delimited string.
     */
    var camelizeRE = /-(\w)/g;
    var camelize = cached(function (str) {
        return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
    });

    /**
     * Capitalize a string.
     */
    var capitalize = cached(function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
    });

    /**
     * Hyphenate a camelCase string.
     */
    var hyphenateRE = /([^-])([A-Z])/g;
    var hyphenate = cached(function (str) {
        return str
            .replace(hyphenateRE, '$1-$2')
            .replace(hyphenateRE, '$1-$2')
            .toLowerCase()
    });

    /**
     * Simple bind, faster than native
     */
    function bind$1(fn, ctx) {
        function boundFn(a) {
            var l = arguments.length;
            return l
                ? l > 1
                    ? fn.apply(ctx, arguments)
                    : fn.call(ctx, a)
                : fn.call(ctx)
        }
        // record original fn length
        boundFn._length = fn.length;
        return boundFn
    }

    /**
     * Convert an Array-like object to a real Array.
     */
    function toArray(list, start) {
        start = start || 0;
        var i = list.length - start;
        var ret = new Array(i);
        while (i--) {
            ret[i] = list[i + start];
        }
        return ret
    }

    /**
     * Mix properties into target object.
     */
    function extend(to, _from) {
        for (var key in _from) {
            to[key] = _from[key];
        }
        return to
    }

    /**
     * Quick object check - this is primarily used to tell
     * Objects from primitive values when we know the value
     * is a JSON-compliant type.
     */
    function isObject(obj) {
        return obj !== null && typeof obj === 'object'
    }

    /**
     * Strict object type check. Only returns true
     * for plain JavaScript objects.
     */
    var toString = Object.prototype.toString;
    var OBJECT_STRING = '[object Object]';
    function isPlainObject(obj) {
        return toString.call(obj) === OBJECT_STRING
    }

    /**
     * Merge an Array of Objects into a single Object.
     */
    function toObject(arr) {
        var res = {};
        for (var i = 0; i < arr.length; i++) {
            if (arr[i]) {
                extend(res, arr[i]);
            }
        }
        return res
    }

    /**
     * Perform no operation.
     */
    function noop() { }

    /**
     * Always return false.
     */
    var no = function () { return false; };

    /**
     * Return same value
     */
    var identity = function (_) { return _; };

    /**
     * Generate a static keys string from compiler modules.
     */
    function genStaticKeys(modules) {
        return modules.reduce(function (keys, m) {
            return keys.concat(m.staticKeys || [])
        }, []).join(',')
    }

    /**
     * Check if two values are loosely equal - that is,
     * if they are plain objects, do they have the same shape?
     */
    function looseEqual(a, b) {
        var isObjectA = isObject(a);
        var isObjectB = isObject(b);
        if (isObjectA && isObjectB) {
            return JSON.stringify(a) === JSON.stringify(b)
        } else if (!isObjectA && !isObjectB) {
            return String(a) === String(b)
        } else {
            return false
        }
    }

    function looseIndexOf(arr, val) {
        for (var i = 0; i < arr.length; i++) {
            if (looseEqual(arr[i], val)) { return i }
        }
        return -1
    }

    /*  */

    var config = {
        /**
         * Option merge strategies (used in core/util/options)
         */
        optionMergeStrategies: Object.create(null),

        /**
         * Whether to suppress warnings.
         */
        silent: false,

        /**
         * Whether to enable devtools
         */
        devtools: "development" !== 'production',

        /**
         * Error handler for watcher errors
         */
        errorHandler: null,

        /**
         * Ignore certain custom elements
         */
        ignoredElements: [],

        /**
         * Custom user key aliases for v-on
         */
        keyCodes: Object.create(null),

        /**
         * Check if a tag is reserved so that it cannot be registered as a
         * component. This is platform-dependent and may be overwritten.
         */
        isReservedTag: no,

        /**
         * Check if a tag is an unknown element.
         * Platform-dependent.
         */
        isUnknownElement: no,

        /**
         * Get the namespace of an element
         */
        getTagNamespace: noop,

        /**
         * Parse the real tag name for the specific platform.
         */
        parsePlatformTagName: identity,

        /**
         * Check if an attribute must be bound using property, e.g. value
         * Platform-dependent.
         */
        mustUseProp: no,

        /**
         * List of asset types that a component can own.
         */
        _assetTypes: [
            'component',
            'directive',
            'filter'
        ],

        /**
         * List of lifecycle hooks.
         */
        _lifecycleHooks: [
            'beforeCreate',
            'created',
            'beforeMount',
            'mounted',
            'beforeUpdate',
            'updated',
            'beforeDestroy',
            'destroyed',
            'activated',
            'deactivated'
        ],

        /**
         * Max circular updates allowed in a scheduler flush cycle.
         */
        _maxUpdateCount: 100
    };

    /*  */

    /**
     * Check if a string starts with $ or _
     */
    function isReserved(str) {
        var c = (str + '').charCodeAt(0);
        return c === 0x24 || c === 0x5F
    }

    /**
     * Define a property.
     */
    function def(obj, key, val, enumerable) {
        Object.defineProperty(obj, key, {
            value: val,
            enumerable: !!enumerable,
            writable: true,
            configurable: true
        });
    }

    /**
     * Parse simple path.
     */
    var bailRE = /[^\w.$]/;
    function parsePath(path) {
        if (bailRE.test(path)) {
            return
        } else {
            var segments = path.split('.');
            return function (obj) {
                for (var i = 0; i < segments.length; i++) {
                    if (!obj) { return }
                    obj = obj[segments[i]];
                }
                return obj
            }
        }
    }

    /*  */
    /* globals MutationObserver */

    // can we use __proto__?
    var hasProto = '__proto__' in {};

    // Browser environment sniffing
    var inBrowser = typeof window !== 'undefined';
    var UA = inBrowser && window.navigator.userAgent.toLowerCase();
    var isIE = UA && /msie|trident/.test(UA);
    var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
    var isEdge = UA && UA.indexOf('edge/') > 0;
    var isAndroid = UA && UA.indexOf('android') > 0;
    var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);

    // this needs to be lazy-evaled because vue may be required before
    // vue-server-renderer can set VUE_ENV
    var _isServer;
    var isServerRendering = function () {
        if (_isServer === undefined) {
            /* istanbul ignore if */
            if (!inBrowser && typeof global !== 'undefined') {
                // detect presence of vue-server-renderer and avoid
                // Webpack shimming the process
                _isServer = global['process'].env.VUE_ENV === 'server';
            } else {
                _isServer = false;
            }
        }
        return _isServer
    };

    // detect devtools
    var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

    /* istanbul ignore next */
    function isNative(Ctor) {
        return /native code/.test(Ctor.toString())
    }

    /**
     * Defer a task to execute it asynchronously.
     */
    var nextTick = (function () {
        var callbacks = [];
        var pending = false;
        var timerFunc;

        function nextTickHandler() {
            pending = false;
            var copies = callbacks.slice(0);
            callbacks.length = 0;
            for (var i = 0; i < copies.length; i++) {
                copies[i]();
            }
        }

        // the nextTick behavior leverages the microtask queue, which can be accessed
        // via either native Promise.then or MutationObserver.
        // MutationObserver has wider support, however it is seriously bugged in
        // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
        // completely stops working after triggering a few times... so, if native
        // Promise is available, we will use it:
        /* istanbul ignore if */
        if (typeof Promise !== 'undefined' && isNative(Promise)) {
            var p = Promise.resolve();
            var logError = function (err) { console.error(err); };
            timerFunc = function () {
                p.then(nextTickHandler).catch(logError);
                // in problematic UIWebViews, Promise.then doesn't completely break, but
                // it can get stuck in a weird state where callbacks are pushed into the
                // microtask queue but the queue isn't being flushed, until the browser
                // needs to do some other work, e.g. handle a timer. Therefore we can
                // "force" the microtask queue to be flushed by adding an empty timer.
                if (isIOS) { setTimeout(noop); }
            };
        } else if (typeof MutationObserver !== 'undefined' && (
            isNative(MutationObserver) ||
            // PhantomJS and iOS 7.x
            MutationObserver.toString() === '[object MutationObserverConstructor]'
        )) {
            // use MutationObserver where native Promise is not available,
            // e.g. PhantomJS IE11, iOS7, Android 4.4
            var counter = 1;
            var observer = new MutationObserver(nextTickHandler);
            var textNode = document.createTextNode(String(counter));
            observer.observe(textNode, {
                characterData: true
            });
            timerFunc = function () {
                counter = (counter + 1) % 2;
                textNode.data = String(counter);
            };
        } else {
            // fallback to setTimeout
            /* istanbul ignore next */
            timerFunc = function () {
                setTimeout(nextTickHandler, 0);
            };
        }

        return function queueNextTick(cb, ctx) {
            var _resolve;
            callbacks.push(function () {
                if (cb) { cb.call(ctx); }
                if (_resolve) { _resolve(ctx); }
            });
            if (!pending) {
                pending = true;
                timerFunc();
            }
            if (!cb && typeof Promise !== 'undefined') {
                return new Promise(function (resolve) {
                    _resolve = resolve;
                })
            }
        }
    })();

    var _Set;
    /* istanbul ignore if */
    if (typeof Set !== 'undefined' && isNative(Set)) {
        // use native Set when available.
        _Set = Set;
    } else {
        // a non-standard Set polyfill that only works with primitive keys.
        _Set = (function () {
            function Set() {
                this.set = Object.create(null);
            }
            Set.prototype.has = function has(key) {
                return this.set[key] === true
            };
            Set.prototype.add = function add(key) {
                this.set[key] = true;
            };
            Set.prototype.clear = function clear() {
                this.set = Object.create(null);
            };

            return Set;
        }());
    }

    var warn = noop;
    var formatComponentName;

    {
        var hasConsole = typeof console !== 'undefined';

        warn = function (msg, vm) {
            if (hasConsole && (!config.silent)) {
                console.error("[Vue warn]: " + msg + " " + (
                    vm ? formatLocation(formatComponentName(vm)) : ''
                ));
            }
        };

        formatComponentName = function (vm) {
            if (vm.$root === vm) {
                return 'root instance'
            }
            var name = vm._isVue
                ? vm.$options.name || vm.$options._componentTag
                : vm.name;
            return (
                (name ? ("component <" + name + ">") : "anonymous component") +
                (vm._isVue && vm.$options.__file ? (" at " + (vm.$options.__file)) : '')
            )
        };

        var formatLocation = function (str) {
            if (str === 'anonymous component') {
                str += " - use the \"name\" option for better debugging messages.";
            }
            return ("\n(found in " + str + ")")
        };
    }

    /*  */


    var uid$1 = 0;

    /**
     * A dep is an observable that can have multiple
     * directives subscribing to it.
     */
    var Dep = function Dep() {
        this.id = uid$1++;
        this.subs = [];
    };

    Dep.prototype.addSub = function addSub(sub) {
        this.subs.push(sub);
    };

    Dep.prototype.removeSub = function removeSub(sub) {
        remove$1(this.subs, sub);
    };

    Dep.prototype.depend = function depend() {
        if (Dep.target) {
            Dep.target.addDep(this);
        }
    };

    Dep.prototype.notify = function notify() {
        // stablize the subscriber list first
        var subs = this.subs.slice();
        for (var i = 0, l = subs.length; i < l; i++) {
            subs[i].update();
        }
    };

    // the current target watcher being evaluated.
    // this is globally unique because there could be only one
    // watcher being evaluated at any time.
    Dep.target = null;
    var targetStack = [];

    function pushTarget(_target) {
        if (Dep.target) { targetStack.push(Dep.target); }
        Dep.target = _target;
    }

    function popTarget() {
        Dep.target = targetStack.pop();
    }

    /*
     * not type checking this file because flow doesn't play well with
     * dynamically accessing methods on Array prototype
     */

    var arrayProto = Array.prototype;
    var arrayMethods = Object.create(arrayProto);[
        'push',
        'pop',
        'shift',
        'unshift',
        'splice',
        'sort',
        'reverse'
    ]
        .forEach(function (method) {
            // cache original method
            var original = arrayProto[method];
            def(arrayMethods, method, function mutator() {
                var arguments$1 = arguments;

                // avoid leaking arguments:
                // http://jsperf.com/closure-with-arguments
                var i = arguments.length;
                var args = new Array(i);
                while (i--) {
                    args[i] = arguments$1[i];
                }
                var result = original.apply(this, args);
                var ob = this.__ob__;
                var inserted;
                switch (method) {
                    case 'push':
                        inserted = args;
                        break
                    case 'unshift':
                        inserted = args;
                        break
                    case 'splice':
                        inserted = args.slice(2);
                        break
                }
                if (inserted) { ob.observeArray(inserted); }
                // notify change
                ob.dep.notify();
                return result
            });
        });

    /*  */

    var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

    /**
     * By default, when a reactive property is set, the new value is
     * also converted to become reactive. However when passing down props,
     * we don't want to force conversion because the value may be a nested value
     * under a frozen data structure. Converting it would defeat the optimization.
     */
    var observerState = {
        shouldConvert: true,
        isSettingProps: false
    };

    /**
     * Observer class that are attached to each observed
     * object. Once attached, the observer converts target
     * object's property keys into getter/setters that
     * collect dependencies and dispatches updates.
     */
    var Observer = function Observer(value) {
        this.value = value;
        this.dep = new Dep();
        this.vmCount = 0;
        def(value, '__ob__', this);
        if (Array.isArray(value)) {
            var augment = hasProto
                ? protoAugment
                : copyAugment;
            augment(value, arrayMethods, arrayKeys);
            this.observeArray(value);
        } else {
            this.walk(value);
        }
    };

    /**
     * Walk through each property and convert them into
     * getter/setters. This method should only be called when
     * value type is Object.
     */
    Observer.prototype.walk = function walk(obj) {
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            defineReactive$$1(obj, keys[i], obj[keys[i]]);
        }
    };

    /**
     * Observe a list of Array items.
     */
    Observer.prototype.observeArray = function observeArray(items) {
        for (var i = 0, l = items.length; i < l; i++) {
            observe(items[i]);
        }
    };

    // helpers

    /**
     * Augment an target Object or Array by intercepting
     * the prototype chain using __proto__
     */
    function protoAugment(target, src) {
        /* eslint-disable no-proto */
        target.__proto__ = src;
        /* eslint-enable no-proto */
    }

    /**
     * Augment an target Object or Array by defining
     * hidden properties.
     */
    /* istanbul ignore next */
    function copyAugment(target, src, keys) {
        for (var i = 0, l = keys.length; i < l; i++) {
            var key = keys[i];
            def(target, key, src[key]);
        }
    }

    /**
     * Attempt to create an observer instance for a value,
     * returns the new observer if successfully observed,
     * or the existing observer if the value already has one.
     */
    function observe(value, asRootData) {
        if (!isObject(value)) {
            return
        }
        var ob;
        if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
            ob = value.__ob__;
        } else if (
            observerState.shouldConvert &&
            !isServerRendering() &&
            (Array.isArray(value) || isPlainObject(value)) &&
            Object.isExtensible(value) &&
            !value._isVue
        ) {
            ob = new Observer(value);
        }
        if (asRootData && ob) {
            ob.vmCount++;
        }
        return ob
    }

    /**
     * Define a reactive property on an Object.
     */
    function defineReactive$$1(
        obj,
        key,
        val,
        customSetter
    ) {
        var dep = new Dep();

        var property = Object.getOwnPropertyDescriptor(obj, key);
        if (property && property.configurable === false) {
            return
        }

        // cater for pre-defined getter/setters
        var getter = property && property.get;
        var setter = property && property.set;

        var childOb = observe(val);
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: function reactiveGetter() {
                var value = getter ? getter.call(obj) : val;
                if (Dep.target) {
                    dep.depend();
                    if (childOb) {
                        childOb.dep.depend();
                    }
                    if (Array.isArray(value)) {
                        dependArray(value);
                    }
                }
                return value
            },
            set: function reactiveSetter(newVal) {
                var value = getter ? getter.call(obj) : val;
                /* eslint-disable no-self-compare */
                if (newVal === value || (newVal !== newVal && value !== value)) {
                    return
                }
                /* eslint-enable no-self-compare */
                if ("development" !== 'production' && customSetter) {
                    customSetter();
                }
                if (setter) {
                    setter.call(obj, newVal);
                } else {
                    val = newVal;
                }
                childOb = observe(newVal);
                dep.notify();
            }
        });
    }

    /**
     * Set a property on an object. Adds the new property and
     * triggers change notification if the property doesn't
     * already exist.
     */
    function set$1(obj, key, val) {
        if (Array.isArray(obj)) {
            obj.length = Math.max(obj.length, key);
            obj.splice(key, 1, val);
            return val
        }
        if (hasOwn(obj, key)) {
            obj[key] = val;
            return
        }
        var ob = obj.__ob__;
        if (obj._isVue || (ob && ob.vmCount)) {
            "development" !== 'production' && warn(
                'Avoid adding reactive properties to a Vue instance or its root $data ' +
                'at runtime - declare it upfront in the data option.'
            );
            return
        }
        if (!ob) {
            obj[key] = val;
            return
        }
        defineReactive$$1(ob.value, key, val);
        ob.dep.notify();
        return val
    }

    /**
     * Delete a property and trigger change if necessary.
     */
    function del(obj, key) {
        var ob = obj.__ob__;
        if (obj._isVue || (ob && ob.vmCount)) {
            "development" !== 'production' && warn(
                'Avoid deleting properties on a Vue instance or its root $data ' +
                '- just set it to null.'
            );
            return
        }
        if (!hasOwn(obj, key)) {
            return
        }
        delete obj[key];
        if (!ob) {
            return
        }
        ob.dep.notify();
    }

    /**
     * Collect dependencies on array elements when the array is touched, since
     * we cannot intercept array element access like property getters.
     */
    function dependArray(value) {
        for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
            e = value[i];
            e && e.__ob__ && e.__ob__.dep.depend();
            if (Array.isArray(e)) {
                dependArray(e);
            }
        }
    }

    /*  */

    /**
     * Option overwriting strategies are functions that handle
     * how to merge a parent option value and a child option
     * value into the final value.
     */
    var strats = config.optionMergeStrategies;

    /**
     * Options with restrictions
     */
    {
        strats.el = strats.propsData = function (parent, child, vm, key) {
            if (!vm) {
                warn(
                    "option \"" + key + "\" can only be used during instance " +
                    'creation with the `new` keyword.'
                );
            }
            return defaultStrat(parent, child)
        };
    }

    /**
     * Helper that recursively merges two data objects together.
     */
    function mergeData(to, from) {
        if (!from) { return to }
        var key, toVal, fromVal;
        var keys = Object.keys(from);
        for (var i = 0; i < keys.length; i++) {
            key = keys[i];
            toVal = to[key];
            fromVal = from[key];
            if (!hasOwn(to, key)) {
                set$1(to, key, fromVal);
            } else if (isPlainObject(toVal) && isPlainObject(fromVal)) {
                mergeData(toVal, fromVal);
            }
        }
        return to
    }

    /**
     * Data
     */
    strats.data = function (
        parentVal,
        childVal,
        vm
    ) {
        if (!vm) {
            // in a Vue.extend merge, both should be functions
            if (!childVal) {
                return parentVal
            }
            if (typeof childVal !== 'function') {
                "development" !== 'production' && warn(
                    'The "data" option should be a function ' +
                    'that returns a per-instance value in component ' +
                    'definitions.',
                    vm
                );
                return parentVal
            }
            if (!parentVal) {
                return childVal
            }
            // when parentVal & childVal are both present,
            // we need to return a function that returns the
            // merged result of both functions... no need to
            // check if parentVal is a function here because
            // it has to be a function to pass previous merges.
            return function mergedDataFn() {
                return mergeData(
                    childVal.call(this),
                    parentVal.call(this)
                )
            }
        } else if (parentVal || childVal) {
            return function mergedInstanceDataFn() {
                // instance merge
                var instanceData = typeof childVal === 'function'
                    ? childVal.call(vm)
                    : childVal;
                var defaultData = typeof parentVal === 'function'
                    ? parentVal.call(vm)
                    : undefined;
                if (instanceData) {
                    return mergeData(instanceData, defaultData)
                } else {
                    return defaultData
                }
            }
        }
    };

    /**
     * Hooks and param attributes are merged as arrays.
     */
    function mergeHook(
        parentVal,
        childVal
    ) {
        return childVal
            ? parentVal
                ? parentVal.concat(childVal)
                : Array.isArray(childVal)
                    ? childVal
                    : [childVal]
            : parentVal
    }

    config._lifecycleHooks.forEach(function (hook) {
        strats[hook] = mergeHook;
    });

    /**
     * Assets
     *
     * When a vm is present (instance creation), we need to do
     * a three-way merge between constructor options, instance
     * options and parent options.
     */
    function mergeAssets(parentVal, childVal) {
        var res = Object.create(parentVal || null);
        return childVal
            ? extend(res, childVal)
            : res
    }

    config._assetTypes.forEach(function (type) {
        strats[type + 's'] = mergeAssets;
    });

    /**
     * Watchers.
     *
     * Watchers hashes should not overwrite one
     * another, so we merge them as arrays.
     */
    strats.watch = function (parentVal, childVal) {
        /* istanbul ignore if */
        if (!childVal) { return parentVal }
        if (!parentVal) { return childVal }
        var ret = {};
        extend(ret, parentVal);
        for (var key in childVal) {
            var parent = ret[key];
            var child = childVal[key];
            if (parent && !Array.isArray(parent)) {
                parent = [parent];
            }
            ret[key] = parent
                ? parent.concat(child)
                : [child];
        }
        return ret
    };

    /**
     * Other object hashes.
     */
    strats.props =
        strats.methods =
        strats.computed = function (parentVal, childVal) {
            if (!childVal) { return parentVal }
            if (!parentVal) { return childVal }
            var ret = Object.create(null);
            extend(ret, parentVal);
            extend(ret, childVal);
            return ret
        };

    /**
     * Default strategy.
     */
    var defaultStrat = function (parentVal, childVal) {
        return childVal === undefined
            ? parentVal
            : childVal
    };

    /**
     * Validate component names
     */
    function checkComponents(options) {
        for (var key in options.components) {
            var lower = key.toLowerCase();
            if (isBuiltInTag(lower) || config.isReservedTag(lower)) {
                warn(
                    'Do not use built-in or reserved HTML elements as component ' +
                    'id: ' + key
                );
            }
        }
    }

    /**
     * Ensure all props option syntax are normalized into the
     * Object-based format.
     */
    function normalizeProps(options) {
        var props = options.props;
        if (!props) { return }
        var res = {};
        var i, val, name;
        if (Array.isArray(props)) {
            i = props.length;
            while (i--) {
                val = props[i];
                if (typeof val === 'string') {
                    name = camelize(val);
                    res[name] = { type: null };
                } else {
                    warn('props must be strings when using array syntax.');
                }
            }
        } else if (isPlainObject(props)) {
            for (var key in props) {
                val = props[key];
                name = camelize(key);
                res[name] = isPlainObject(val)
                    ? val
                    : { type: val };
            }
        }
        options.props = res;
    }

    /**
     * Normalize raw function directives into object format.
     */
    function normalizeDirectives(options) {
        var dirs = options.directives;
        if (dirs) {
            for (var key in dirs) {
                var def = dirs[key];
                if (typeof def === 'function') {
                    dirs[key] = { bind: def, update: def };
                }
            }
        }
    }

    /**
     * Merge two option objects into a new one.
     * Core utility used in both instantiation and inheritance.
     */
    function mergeOptions(
        parent,
        child,
        vm
    ) {
        {
            checkComponents(child);
        }
        normalizeProps(child);
        normalizeDirectives(child);
        var extendsFrom = child.extends;
        if (extendsFrom) {
            parent = typeof extendsFrom === 'function'
                ? mergeOptions(parent, extendsFrom.options, vm)
                : mergeOptions(parent, extendsFrom, vm);
        }
        if (child.mixins) {
            for (var i = 0, l = child.mixins.length; i < l; i++) {
                var mixin = child.mixins[i];
                if (mixin.prototype instanceof Vue$3) {
                    mixin = mixin.options;
                }
                parent = mergeOptions(parent, mixin, vm);
            }
        }
        var options = {};
        var key;
        for (key in parent) {
            mergeField(key);
        }
        for (key in child) {
            if (!hasOwn(parent, key)) {
                mergeField(key);
            }
        }
        function mergeField(key) {
            var strat = strats[key] || defaultStrat;
            options[key] = strat(parent[key], child[key], vm, key);
        }
        return options
    }

    /**
     * Resolve an asset.
     * This function is used because child instances need access
     * to assets defined in its ancestor chain.
     */
    function resolveAsset(
        options,
        type,
        id,
        warnMissing
    ) {
        /* istanbul ignore if */
        if (typeof id !== 'string') {
            return
        }
        var assets = options[type];
        // check local registration variations first
        if (hasOwn(assets, id)) { return assets[id] }
        var camelizedId = camelize(id);
        if (hasOwn(assets, camelizedId)) { return assets[camelizedId] }
        var PascalCaseId = capitalize(camelizedId);
        if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] }
        // fallback to prototype chain
        var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
        if ("development" !== 'production' && warnMissing && !res) {
            warn(
                'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
                options
            );
        }
        return res
    }

    /*  */

    function validateProp(
        key,
        propOptions,
        propsData,
        vm
    ) {
        var prop = propOptions[key];
        var absent = !hasOwn(propsData, key);
        var value = propsData[key];
        // handle boolean props
        if (isType(Boolean, prop.type)) {
            if (absent && !hasOwn(prop, 'default')) {
                value = false;
            } else if (!isType(String, prop.type) && (value === '' || value === hyphenate(key))) {
                value = true;
            }
        }
        // check default value
        if (value === undefined) {
            value = getPropDefaultValue(vm, prop, key);
            // since the default value is a fresh copy,
            // make sure to observe it.
            var prevShouldConvert = observerState.shouldConvert;
            observerState.shouldConvert = true;
            observe(value);
            observerState.shouldConvert = prevShouldConvert;
        }
        {
            assertProp(prop, key, value, vm, absent);
        }
        return value
    }

    /**
     * Get the default value of a prop.
     */
    function getPropDefaultValue(vm, prop, key) {
        // no default, return undefined
        if (!hasOwn(prop, 'default')) {
            return undefined
        }
        var def = prop.default;
        // warn against non-factory defaults for Object & Array
        if (isObject(def)) {
            "development" !== 'production' && warn(
                'Invalid default value for prop "' + key + '": ' +
                'Props with type Object/Array must use a factory function ' +
                'to return the default value.',
                vm
            );
        }
        // the raw prop value was also undefined from previous render,
        // return previous default value to avoid unnecessary watcher trigger
        if (vm && vm.$options.propsData &&
            vm.$options.propsData[key] === undefined &&
            vm[key] !== undefined) {
            return vm[key]
        }
        // call factory function for non-Function types
        return typeof def === 'function' && prop.type !== Function
            ? def.call(vm)
            : def
    }

    /**
     * Assert whether a prop is valid.
     */
    function assertProp(
        prop,
        name,
        value,
        vm,
        absent
    ) {
        if (prop.required && absent) {
            warn(
                'Missing required prop: "' + name + '"',
                vm
            );
            return
        }
        if (value == null && !prop.required) {
            return
        }
        var type = prop.type;
        var valid = !type || type === true;
        var expectedTypes = [];
        if (type) {
            if (!Array.isArray(type)) {
                type = [type];
            }
            for (var i = 0; i < type.length && !valid; i++) {
                var assertedType = assertType(value, type[i]);
                expectedTypes.push(assertedType.expectedType || '');
                valid = assertedType.valid;
            }
        }
        if (!valid) {
            warn(
                'Invalid prop: type check failed for prop "' + name + '".' +
                ' Expected ' + expectedTypes.map(capitalize).join(', ') +
                ', got ' + Object.prototype.toString.call(value).slice(8, -1) + '.',
                vm
            );
            return
        }
        var validator = prop.validator;
        if (validator) {
            if (!validator(value)) {
                warn(
                    'Invalid prop: custom validator check failed for prop "' + name + '".',
                    vm
                );
            }
        }
    }

    /**
     * Assert the type of a value
     */
    function assertType(value, type) {
        var valid;
        var expectedType = getType(type);
        if (expectedType === 'String') {
            valid = typeof value === (expectedType = 'string');
        } else if (expectedType === 'Number') {
            valid = typeof value === (expectedType = 'number');
        } else if (expectedType === 'Boolean') {
            valid = typeof value === (expectedType = 'boolean');
        } else if (expectedType === 'Function') {
            valid = typeof value === (expectedType = 'function');
        } else if (expectedType === 'Object') {
            valid = isPlainObject(value);
        } else if (expectedType === 'Array') {
            valid = Array.isArray(value);
        } else {
            valid = value instanceof type;
        }
        return {
            valid: valid,
            expectedType: expectedType
        }
    }

    /**
     * Use function string name to check built-in types,
     * because a simple equality check will fail when running
     * across different vms / iframes.
     */
    function getType(fn) {
        var match = fn && fn.toString().match(/^\s*function (\w+)/);
        return match && match[1]
    }

    function isType(type, fn) {
        if (!Array.isArray(fn)) {
            return getType(fn) === getType(type)
        }
        for (var i = 0, len = fn.length; i < len; i++) {
            if (getType(fn[i]) === getType(type)) {
                return true
            }
        }
        /* istanbul ignore next */
        return false
    }



    var util = Object.freeze({
        defineReactive: defineReactive$$1,
        _toString: _toString,
        toNumber: toNumber,
        makeMap: makeMap,
        isBuiltInTag: isBuiltInTag,
        remove: remove$1,
        hasOwn: hasOwn,
        isPrimitive: isPrimitive,
        cached: cached,
        camelize: camelize,
        capitalize: capitalize,
        hyphenate: hyphenate,
        bind: bind$1,
        toArray: toArray,
        extend: extend,
        isObject: isObject,
        isPlainObject: isPlainObject,
        toObject: toObject,
        noop: noop,
        no: no,
        identity: identity,
        genStaticKeys: genStaticKeys,
        looseEqual: looseEqual,
        looseIndexOf: looseIndexOf,
        isReserved: isReserved,
        def: def,
        parsePath: parsePath,
        hasProto: hasProto,
        inBrowser: inBrowser,
        UA: UA,
        isIE: isIE,
        isIE9: isIE9,
        isEdge: isEdge,
        isAndroid: isAndroid,
        isIOS: isIOS,
        isServerRendering: isServerRendering,
        devtools: devtools,
        nextTick: nextTick,
        get _Set() { return _Set; },
        mergeOptions: mergeOptions,
        resolveAsset: resolveAsset,
        get warn() { return warn; },
        get formatComponentName() { return formatComponentName; },
        validateProp: validateProp
    });

    /* not type checking this file because flow doesn't play well with Proxy */

    var initProxy;

    {
        var allowedGlobals = makeMap(
            'Infinity,undefined,NaN,isFinite,isNaN,' +
            'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
            'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
            'require' // for Webpack/Browserify
        );

        var warnNonPresent = function (target, key) {
            warn(
                "Property or method \"" + key + "\" is not defined on the instance but " +
                "referenced during render. Make sure to declare reactive data " +
                "properties in the data option.",
                target
            );
        };

        var hasProxy =
            typeof Proxy !== 'undefined' &&
            Proxy.toString().match(/native code/);

        if (hasProxy) {
            var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta');
            config.keyCodes = new Proxy(config.keyCodes, {
                set: function set(target, key, value) {
                    if (isBuiltInModifier(key)) {
                        warn(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
                        return false
                    } else {
                        target[key] = value;
                        return true
                    }
                }
            });
        }

        var hasHandler = {
            has: function has(target, key) {
                var has = key in target;
                var isAllowed = allowedGlobals(key) || key.charAt(0) === '_';
                if (!has && !isAllowed) {
                    warnNonPresent(target, key);
                }
                return has || !isAllowed
            }
        };

        var getHandler = {
            get: function get(target, key) {
                if (typeof key === 'string' && !(key in target)) {
                    warnNonPresent(target, key);
                }
                return target[key]
            }
        };

        initProxy = function initProxy(vm) {
            if (hasProxy) {
                // determine which proxy handler to use
                var options = vm.$options;
                var handlers = options.render && options.render._withStripped
                    ? getHandler
                    : hasHandler;
                vm._renderProxy = new Proxy(vm, handlers);
            } else {
                vm._renderProxy = vm;
            }
        };
    }

    /*  */

    var VNode = function VNode(
        tag,
        data,
        children,
        text,
        elm,
        context,
        componentOptions
    ) {
        this.tag = tag;
        this.data = data;
        this.children = children;
        this.text = text;
        this.elm = elm;
        this.ns = undefined;
        this.context = context;
        this.functionalContext = undefined;
        this.key = data && data.key;
        this.componentOptions = componentOptions;
        this.componentInstance = undefined;
        this.parent = undefined;
        this.raw = false;
        this.isStatic = false;
        this.isRootInsert = true;
        this.isComment = false;
        this.isCloned = false;
        this.isOnce = false;
    };

    var prototypeAccessors = { child: {} };

    // DEPRECATED: alias for componentInstance for backwards compat.
    /* istanbul ignore next */
    prototypeAccessors.child.get = function () {
        return this.componentInstance
    };

    Object.defineProperties(VNode.prototype, prototypeAccessors);

    var createEmptyVNode = function () {
        var node = new VNode();
        node.text = '';
        node.isComment = true;
        return node
    };

    function createTextVNode(val) {
        return new VNode(undefined, undefined, undefined, String(val))
    }

    // optimized shallow clone
    // used for static nodes and slot nodes because they may be reused across
    // multiple renders, cloning them avoids errors when DOM manipulations rely
    // on their elm reference.
    function cloneVNode(vnode) {
        var cloned = new VNode(
            vnode.tag,
            vnode.data,
            vnode.children,
            vnode.text,
            vnode.elm,
            vnode.context,
            vnode.componentOptions
        );
        cloned.ns = vnode.ns;
        cloned.isStatic = vnode.isStatic;
        cloned.key = vnode.key;
        cloned.isCloned = true;
        return cloned
    }

    function cloneVNodes(vnodes) {
        var res = new Array(vnodes.length);
        for (var i = 0; i < vnodes.length; i++) {
            res[i] = cloneVNode(vnodes[i]);
        }
        return res
    }

    /*  */

    var hooks = { init: init, prepatch: prepatch, insert: insert, destroy: destroy$1 };
    var hooksToMerge = Object.keys(hooks);

    function createComponent(
        Ctor,
        data,
        context,
        children,
        tag
    ) {
        if (!Ctor) {
            return
        }

        var baseCtor = context.$options._base;
        if (isObject(Ctor)) {
            Ctor = baseCtor.extend(Ctor);
        }

        if (typeof Ctor !== 'function') {
            {
                warn(("Invalid Component definition: " + (String(Ctor))), context);
            }
            return
        }

        // async component
        if (!Ctor.cid) {
            if (Ctor.resolved) {
                Ctor = Ctor.resolved;
            } else {
                Ctor = resolveAsyncComponent(Ctor, baseCtor, function () {
                    // it's ok to queue this on every render because
                    // $forceUpdate is buffered by the scheduler.
                    context.$forceUpdate();
                });
                if (!Ctor) {
                    // return nothing if this is indeed an async component
                    // wait for the callback to trigger parent update.
                    return
                }
            }
        }

        // resolve constructor options in case global mixins are applied after
        // component constructor creation
        resolveConstructorOptions(Ctor);

        data = data || {};

        // extract props
        var propsData = extractProps(data, Ctor);

        // functional component
        if (Ctor.options.functional) {
            return createFunctionalComponent(Ctor, propsData, data, context, children)
        }

        // extract listeners, since these needs to be treated as
        // child component listeners instead of DOM listeners
        var listeners = data.on;
        // replace with listeners with .native modifier
        data.on = data.nativeOn;

        if (Ctor.options.abstract) {
            // abstract components do not keep anything
            // other than props & listeners
            data = {};
        }

        // merge component management hooks onto the placeholder node
        mergeHooks(data);

        // return a placeholder vnode
        var name = Ctor.options.name || tag;
        var vnode = new VNode(
            ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
            data, undefined, undefined, undefined, context,
            { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children }
        );
        return vnode
    }

    function createFunctionalComponent(
        Ctor,
        propsData,
        data,
        context,
        children
    ) {
        var props = {};
        var propOptions = Ctor.options.props;
        if (propOptions) {
            for (var key in propOptions) {
                props[key] = validateProp(key, propOptions, propsData);
            }
        }
        // ensure the createElement function in functional components
        // gets a unique context - this is necessary for correct named slot check
        var _context = Object.create(context);
        var h = function (a, b, c, d) { return createElement(_context, a, b, c, d, true); };
        var vnode = Ctor.options.render.call(null, h, {
            props: props,
            data: data,
            parent: context,
            children: children,
            slots: function () { return resolveSlots(children, context); }
        });
        if (vnode instanceof VNode) {
            vnode.functionalContext = context;
            if (data.slot) {
                (vnode.data || (vnode.data = {})).slot = data.slot;
            }
        }
        return vnode
    }

    function createComponentInstanceForVnode(
        vnode, // we know it's MountedComponentVNode but flow doesn't
        parent, // activeInstance in lifecycle state
        parentElm,
        refElm
    ) {
        var vnodeComponentOptions = vnode.componentOptions;
        var options = {
            _isComponent: true,
            parent: parent,
            propsData: vnodeComponentOptions.propsData,
            _componentTag: vnodeComponentOptions.tag,
            _parentVnode: vnode,
            _parentListeners: vnodeComponentOptions.listeners,
            _renderChildren: vnodeComponentOptions.children,
            _parentElm: parentElm || null,
            _refElm: refElm || null
        };
        // check inline-template render functions
        var inlineTemplate = vnode.data.inlineTemplate;
        if (inlineTemplate) {
            options.render = inlineTemplate.render;
            options.staticRenderFns = inlineTemplate.staticRenderFns;
        }
        return new vnodeComponentOptions.Ctor(options)
    }

    function init(
        vnode,
        hydrating,
        parentElm,
        refElm
    ) {
        if (!vnode.componentInstance || vnode.componentInstance._isDestroyed) {
            var child = vnode.componentInstance = createComponentInstanceForVnode(
                vnode,
                activeInstance,
                parentElm,
                refElm
            );
            child.$mount(hydrating ? vnode.elm : undefined, hydrating);
        } else if (vnode.data.keepAlive) {
            // kept-alive components, treat as a patch
            var mountedNode = vnode; // work around flow
            prepatch(mountedNode, mountedNode);
        }
    }

    function prepatch(
        oldVnode,
        vnode
    ) {
        var options = vnode.componentOptions;
        var child = vnode.componentInstance = oldVnode.componentInstance;
        child._updateFromParent(
            options.propsData, // updated props
            options.listeners, // updated listeners
            vnode, // new parent vnode
            options.children // new children
        );
    }

    function insert(vnode) {
        if (!vnode.componentInstance._isMounted) {
            vnode.componentInstance._isMounted = true;
            callHook(vnode.componentInstance, 'mounted');
        }
        if (vnode.data.keepAlive) {
            vnode.componentInstance._inactive = false;
            callHook(vnode.componentInstance, 'activated');
        }
    }

    function destroy$1(vnode) {
        if (!vnode.componentInstance._isDestroyed) {
            if (!vnode.data.keepAlive) {
                vnode.componentInstance.$destroy();
            } else {
                vnode.componentInstance._inactive = true;
                callHook(vnode.componentInstance, 'deactivated');
            }
        }
    }

    function resolveAsyncComponent(
        factory,
        baseCtor,
        cb
    ) {
        if (factory.requested) {
            // pool callbacks
            factory.pendingCallbacks.push(cb);
        } else {
            factory.requested = true;
            var cbs = factory.pendingCallbacks = [cb];
            var sync = true;

            var resolve = function (res) {
                if (isObject(res)) {
                    res = baseCtor.extend(res);
                }
                // cache resolved
                factory.resolved = res;
                // invoke callbacks only if this is not a synchronous resolve
                // (async resolves are shimmed as synchronous during SSR)
                if (!sync) {
                    for (var i = 0, l = cbs.length; i < l; i++) {
                        cbs[i](res);
                    }
                }
            };

            var reject = function (reason) {
                "development" !== 'production' && warn(
                    "Failed to resolve async component: " + (String(factory)) +
                    (reason ? ("\nReason: " + reason) : '')
                );
            };

            var res = factory(resolve, reject);

            // handle promise
            if (res && typeof res.then === 'function' && !factory.resolved) {
                res.then(resolve, reject);
            }

            sync = false;
            // return in case resolved synchronously
            return factory.resolved
        }
    }

    function extractProps(data, Ctor) {
        // we are only extracting raw values here.
        // validation and default values are handled in the child
        // component itself.
        var propOptions = Ctor.options.props;
        if (!propOptions) {
            return
        }
        var res = {};
        var attrs = data.attrs;
        var props = data.props;
        var domProps = data.domProps;
        if (attrs || props || domProps) {
            for (var key in propOptions) {
                var altKey = hyphenate(key);
                checkProp(res, props, key, altKey, true) ||
                    checkProp(res, attrs, key, altKey) ||
                    checkProp(res, domProps, key, altKey);
            }
        }
        return res
    }

    function checkProp(
        res,
        hash,
        key,
        altKey,
        preserve
    ) {
        if (hash) {
            if (hasOwn(hash, key)) {
                res[key] = hash[key];
                if (!preserve) {
                    delete hash[key];
                }
                return true
            } else if (hasOwn(hash, altKey)) {
                res[key] = hash[altKey];
                if (!preserve) {
                    delete hash[altKey];
                }
                return true
            }
        }
        return false
    }

    function mergeHooks(data) {
        if (!data.hook) {
            data.hook = {};
        }
        for (var i = 0; i < hooksToMerge.length; i++) {
            var key = hooksToMerge[i];
            var fromParent = data.hook[key];
            var ours = hooks[key];
            data.hook[key] = fromParent ? mergeHook$1(ours, fromParent) : ours;
        }
    }

    function mergeHook$1(one, two) {
        return function (a, b, c, d) {
            one(a, b, c, d);
            two(a, b, c, d);
        }
    }

    /*  */

    function mergeVNodeHook(def, hookKey, hook, key) {
        key = key + hookKey;
        var injectedHash = def.__injected || (def.__injected = {});
        if (!injectedHash[key]) {
            injectedHash[key] = true;
            var oldHook = def[hookKey];
            if (oldHook) {
                def[hookKey] = function () {
                    oldHook.apply(this, arguments);
                    hook.apply(this, arguments);
                };
            } else {
                def[hookKey] = hook;
            }
        }
    }

    /*  */

    var normalizeEvent = cached(function (name) {
        var once = name.charAt(0) === '~'; // Prefixed last, checked first
        name = once ? name.slice(1) : name;
        var capture = name.charAt(0) === '!';
        name = capture ? name.slice(1) : name;
        return {
            name: name,
            once: once,
            capture: capture
        }
    });

    function createEventHandle(fn) {
        var handle = {
            fn: fn,
            invoker: function () {
                var arguments$1 = arguments;

                var fn = handle.fn;
                if (Array.isArray(fn)) {
                    for (var i = 0; i < fn.length; i++) {
                        fn[i].apply(null, arguments$1);
                    }
                } else {
                    fn.apply(null, arguments);
                }
            }
        };
        return handle
    }

    function updateListeners(
        on,
        oldOn,
        add,
        remove$$1,
        vm
    ) {
        var name, cur, old, event;
        for (name in on) {
            cur = on[name];
            old = oldOn[name];
            event = normalizeEvent(name);
            if (!cur) {
                "development" !== 'production' && warn(
                    "Invalid handler for event \"" + (event.name) + "\": got " + String(cur),
                    vm
                );
            } else if (!old) {
                if (!cur.invoker) {
                    cur = on[name] = createEventHandle(cur);
                }
                add(event.name, cur.invoker, event.once, event.capture);
            } else if (cur !== old) {
                old.fn = cur;
                on[name] = old;
            }
        }
        for (name in oldOn) {
            if (!on[name]) {
                event = normalizeEvent(name);
                remove$$1(event.name, oldOn[name].invoker, event.capture);
            }
        }
    }

    /*  */

    // The template compiler attempts to minimize the need for normalization by
    // statically analyzing the template at compile time.
    //
    // For plain HTML markup, normalization can be completely skipped because the
    // generated render function is guaranteed to return Array<VNode>. There are
    // two cases where extra normalization is needed:

    // 1. When the children contains components - because a functional component
    // may return an Array instead of a single root. In this case, just a simple
    // nomralization is needed - if any child is an Array, we flatten the whole
    // thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
    // because functional components already normalize their own children.
    function simpleNormalizeChildren(children) {
        for (var i = 0; i < children.length; i++) {
            if (Array.isArray(children[i])) {
                return Array.prototype.concat.apply([], children)
            }
        }
        return children
    }

    // 2. When the children contains constrcuts that always generated nested Arrays,
    // e.g. <template>, <slot>, v-for, or when the children is provided by user
    // with hand-written render functions / JSX. In such cases a full normalization
    // is needed to cater to all possible types of children values.
    function normalizeChildren(children) {
        return isPrimitive(children)
            ? [createTextVNode(children)]
            : Array.isArray(children)
                ? normalizeArrayChildren(children)
                : undefined
    }

    function normalizeArrayChildren(children, nestedIndex) {
        var res = [];
        var i, c, last;
        for (i = 0; i < children.length; i++) {
            c = children[i];
            if (c == null || typeof c === 'boolean') { continue }
            last = res[res.length - 1];
            //  nested
            if (Array.isArray(c)) {
                res.push.apply(res, normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i)));
            } else if (isPrimitive(c)) {
                if (last && last.text) {
                    last.text += String(c);
                } else if (c !== '') {
                    // convert primitive to vnode
                    res.push(createTextVNode(c));
                }
            } else {
                if (c.text && last && last.text) {
                    res[res.length - 1] = createTextVNode(last.text + c.text);
                } else {
                    // default key for nested array children (likely generated by v-for)
                    if (c.tag && c.key == null && nestedIndex != null) {
                        c.key = "__vlist" + nestedIndex + "_" + i + "__";
                    }
                    res.push(c);
                }
            }
        }
        return res
    }

    /*  */

    function getFirstComponentChild(children) {
        return children && children.filter(function (c) { return c && c.componentOptions; })[0]
    }

    /*  */

    var SIMPLE_NORMALIZE = 1;
    var ALWAYS_NORMALIZE = 2;

    // wrapper function for providing a more flexible interface
    // without getting yelled at by flow
    function createElement(
        context,
        tag,
        data,
        children,
        normalizationType,
        alwaysNormalize
    ) {
        if (Array.isArray(data) || isPrimitive(data)) {
            normalizationType = children;
            children = data;
            data = undefined;
        }
        if (alwaysNormalize) { normalizationType = ALWAYS_NORMALIZE; }
        return _createElement(context, tag, data, children, normalizationType)
    }

    function _createElement(
        context,
        tag,
        data,
        children,
        normalizationType
    ) {
        if (data && data.__ob__) {
            "development" !== 'production' && warn(
                "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
                'Always create fresh vnode data objects in each render!',
                context
            );
            return createEmptyVNode()
        }
        if (!tag) {
            // in case of component :is set to falsy value
            return createEmptyVNode()
        }
        // support single function children as default scoped slot
        if (Array.isArray(children) &&
            typeof children[0] === 'function') {
            data = data || {};
            data.scopedSlots = { default: children[0] };
            children.length = 0;
        }
        if (normalizationType === ALWAYS_NORMALIZE) {
            children = normalizeChildren(children);
        } else if (normalizationType === SIMPLE_NORMALIZE) {
            children = simpleNormalizeChildren(children);
        }
        var vnode, ns;
        if (typeof tag === 'string') {
            var Ctor;
            ns = config.getTagNamespace(tag);
            if (config.isReservedTag(tag)) {
                // platform built-in elements
                vnode = new VNode(
                    config.parsePlatformTagName(tag), data, children,
                    undefined, undefined, context
                );
            } else if ((Ctor = resolveAsset(context.$options, 'components', tag))) {
                // component
                vnode = createComponent(Ctor, data, context, children, tag);
            } else {
                // unknown or unlisted namespaced elements
                // check at runtime because it may get assigned a namespace when its
                // parent normalizes children
                vnode = new VNode(
                    tag, data, children,
                    undefined, undefined, context
                );
            }
        } else {
            // direct component options / constructor
            vnode = createComponent(tag, data, context, children);
        }
        if (vnode) {
            if (ns) { applyNS(vnode, ns); }
            return vnode
        } else {
            return createEmptyVNode()
        }
    }

    function applyNS(vnode, ns) {
        vnode.ns = ns;
        if (vnode.tag === 'foreignObject') {
            // use default namespace inside foreignObject
            return
        }
        if (vnode.children) {
            for (var i = 0, l = vnode.children.length; i < l; i++) {
                var child = vnode.children[i];
                if (child.tag && !child.ns) {
                    applyNS(child, ns);
                }
            }
        }
    }

    /*  */

    function initRender(vm) {
        vm.$vnode = null; // the placeholder node in parent tree
        vm._vnode = null; // the root of the child tree
        vm._staticTrees = null;
        var parentVnode = vm.$options._parentVnode;
        var renderContext = parentVnode && parentVnode.context;
        vm.$slots = resolveSlots(vm.$options._renderChildren, renderContext);
        vm.$scopedSlots = {};
        // bind the createElement fn to this instance
        // so that we get proper render context inside it.
        // args order: tag, data, children, normalizationType, alwaysNormalize
        // internal version is used by render functions compiled from templates
        vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
        // normalization is always applied for the public version, used in
        // user-written render functions.
        vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };
    }

    function renderMixin(Vue) {
        Vue.prototype.$nextTick = function (fn) {
            return nextTick(fn, this)
        };

        Vue.prototype._render = function () {
            var vm = this;
            var ref = vm.$options;
            var render = ref.render;
            var staticRenderFns = ref.staticRenderFns;
            var _parentVnode = ref._parentVnode;

            if (vm._isMounted) {
                // clone slot nodes on re-renders
                for (var key in vm.$slots) {
                    vm.$slots[key] = cloneVNodes(vm.$slots[key]);
                }
            }

            if (_parentVnode && _parentVnode.data.scopedSlots) {
                vm.$scopedSlots = _parentVnode.data.scopedSlots;
            }

            if (staticRenderFns && !vm._staticTrees) {
                vm._staticTrees = [];
            }
            // set parent vnode. this allows render functions to have access
            // to the data on the placeholder node.
            vm.$vnode = _parentVnode;
            // render self
            var vnode;
            try {
                vnode = render.call(vm._renderProxy, vm.$createElement);
            } catch (e) {
                /* istanbul ignore else */
                if (config.errorHandler) {
                    config.errorHandler.call(null, e, vm);
                } else {
                    {
                        warn(("Error when rendering " + (formatComponentName(vm)) + ":"));
                    }
                    throw e
                }
                // return previous vnode to prevent render error causing blank component
                vnode = vm._vnode;
            }
            // return empty vnode in case the render function errored out
            if (!(vnode instanceof VNode)) {
                if ("development" !== 'production' && Array.isArray(vnode)) {
                    warn(
                        'Multiple root nodes returned from render function. Render function ' +
                        'should return a single root node.',
                        vm
                    );
                }
                vnode = createEmptyVNode();
            }
            // set parent
            vnode.parent = _parentVnode;
            return vnode
        };

        // toString for mustaches
        Vue.prototype._s = _toString;
        // convert text to vnode
        Vue.prototype._v = createTextVNode;
        // number conversion
        Vue.prototype._n = toNumber;
        // empty vnode
        Vue.prototype._e = createEmptyVNode;
        // loose equal
        Vue.prototype._q = looseEqual;
        // loose indexOf
        Vue.prototype._i = looseIndexOf;

        // render static tree by index
        Vue.prototype._m = function renderStatic(
            index,
            isInFor
        ) {
            var tree = this._staticTrees[index];
            // if has already-rendered static tree and not inside v-for,
            // we can reuse the same tree by doing a shallow clone.
            if (tree && !isInFor) {
                return Array.isArray(tree)
                    ? cloneVNodes(tree)
                    : cloneVNode(tree)
            }
            // otherwise, render a fresh tree.
            tree = this._staticTrees[index] = this.$options.staticRenderFns[index].call(this._renderProxy);
            markStatic(tree, ("__static__" + index), false);
            return tree
        };

        // mark node as static (v-once)
        Vue.prototype._o = function markOnce(
            tree,
            index,
            key
        ) {
            markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
            return tree
        };

        function markStatic(tree, key, isOnce) {
            if (Array.isArray(tree)) {
                for (var i = 0; i < tree.length; i++) {
                    if (tree[i] && typeof tree[i] !== 'string') {
                        markStaticNode(tree[i], (key + "_" + i), isOnce);
                    }
                }
            } else {
                markStaticNode(tree, key, isOnce);
            }
        }

        function markStaticNode(node, key, isOnce) {
            node.isStatic = true;
            node.key = key;
            node.isOnce = isOnce;
        }

        // filter resolution helper
        Vue.prototype._f = function resolveFilter(id) {
            return resolveAsset(this.$options, 'filters', id, true) || identity
        };

        // render v-for
        Vue.prototype._l = function renderList(
            val,
            render
        ) {
            var ret, i, l, keys, key;
            if (Array.isArray(val) || typeof val === 'string') {
                ret = new Array(val.length);
                for (i = 0, l = val.length; i < l; i++) {
                    ret[i] = render(val[i], i);
                }
            } else if (typeof val === 'number') {
                ret = new Array(val);
                for (i = 0; i < val; i++) {
                    ret[i] = render(i + 1, i);
                }
            } else if (isObject(val)) {
                keys = Object.keys(val);
                ret = new Array(keys.length);
                for (i = 0, l = keys.length; i < l; i++) {
                    key = keys[i];
                    ret[i] = render(val[key], key, i);
                }
            }
            return ret
        };

        // renderSlot
        Vue.prototype._t = function (
            name,
            fallback,
            props,
            bindObject
        ) {
            var scopedSlotFn = this.$scopedSlots[name];
            if (scopedSlotFn) { // scoped slot
                props = props || {};
                if (bindObject) {
                    extend(props, bindObject);
                }
                return scopedSlotFn(props) || fallback
            } else {
                var slotNodes = this.$slots[name];
                // warn duplicate slot usage
                if (slotNodes && "development" !== 'production') {
                    slotNodes._rendered && warn(
                        "Duplicate presence of slot \"" + name + "\" found in the same render tree " +
                        "- this will likely cause render errors.",
                        this
                    );
                    slotNodes._rendered = true;
                }
                return slotNodes || fallback
            }
        };

        // apply v-bind object
        Vue.prototype._b = function bindProps(
            data,
            tag,
            value,
            asProp
        ) {
            if (value) {
                if (!isObject(value)) {
                    "development" !== 'production' && warn(
                        'v-bind without argument expects an Object or Array value',
                        this
                    );
                } else {
                    if (Array.isArray(value)) {
                        value = toObject(value);
                    }
                    for (var key in value) {
                        if (key === 'class' || key === 'style') {
                            data[key] = value[key];
                        } else {
                            var type = data.attrs && data.attrs.type;
                            var hash = asProp || config.mustUseProp(tag, type, key)
                                ? data.domProps || (data.domProps = {})
                                : data.attrs || (data.attrs = {});
                            hash[key] = value[key];
                        }
                    }
                }
            }
            return data
        };

        // check v-on keyCodes
        Vue.prototype._k = function checkKeyCodes(
            eventKeyCode,
            key,
            builtInAlias
        ) {
            var keyCodes = config.keyCodes[key] || builtInAlias;
            if (Array.isArray(keyCodes)) {
                return keyCodes.indexOf(eventKeyCode) === -1
            } else {
                return keyCodes !== eventKeyCode
            }
        };
    }

    function resolveSlots(
        children,
        context
    ) {
        var slots = {};
        if (!children) {
            return slots
        }
        var defaultSlot = [];
        var name, child;
        for (var i = 0, l = children.length; i < l; i++) {
            child = children[i];
            // named slots should only be respected if the vnode was rendered in the
            // same context.
            if ((child.context === context || child.functionalContext === context) &&
                child.data && (name = child.data.slot)) {
                var slot = (slots[name] || (slots[name] = []));
                if (child.tag === 'template') {
                    slot.push.apply(slot, child.children);
                } else {
                    slot.push(child);
                }
            } else {
                defaultSlot.push(child);
            }
        }
        // ignore single whitespace
        if (defaultSlot.length && !(
            defaultSlot.length === 1 &&
            (defaultSlot[0].text === ' ' || defaultSlot[0].isComment)
        )) {
            slots.default = defaultSlot;
        }
        return slots
    }

    /*  */

    function initEvents(vm) {
        vm._events = Object.create(null);
        vm._hasHookEvent = false;
        // init parent attached events
        var listeners = vm.$options._parentListeners;
        if (listeners) {
            updateComponentListeners(vm, listeners);
        }
    }

    var target;

    function add$1(event, fn, once) {
        if (once) {
            target.$once(event, fn);
        } else {
            target.$on(event, fn);
        }
    }

    function remove$2(event, fn) {
        target.$off(event, fn);
    }

    function updateComponentListeners(
        vm,
        listeners,
        oldListeners
    ) {
        target = vm;
        updateListeners(listeners, oldListeners || {}, add$1, remove$2, vm);
    }

    function eventsMixin(Vue) {
        var hookRE = /^hook:/;
        Vue.prototype.$on = function (event, fn) {
            var vm = this; (vm._events[event] || (vm._events[event] = [])).push(fn);
            // optimize hook:event cost by using a boolean flag marked at registration
            // instead of a hash lookup
            if (hookRE.test(event)) {
                vm._hasHookEvent = true;
            }
            return vm
        };

        Vue.prototype.$once = function (event, fn) {
            var vm = this;
            function on() {
                vm.$off(event, on);
                fn.apply(vm, arguments);
            }
            on.fn = fn;
            vm.$on(event, on);
            return vm
        };

        Vue.prototype.$off = function (event, fn) {
            var vm = this;
            // all
            if (!arguments.length) {
                vm._events = Object.create(null);
                return vm
            }
            // specific event
            var cbs = vm._events[event];
            if (!cbs) {
                return vm
            }
            if (arguments.length === 1) {
                vm._events[event] = null;
                return vm
            }
            // specific handler
            var cb;
            var i = cbs.length;
            while (i--) {
                cb = cbs[i];
                if (cb === fn || cb.fn === fn) {
                    cbs.splice(i, 1);
                    break
                }
            }
            return vm
        };

        Vue.prototype.$emit = function (event) {
            var vm = this;
            var cbs = vm._events[event];
            if (cbs) {
                cbs = cbs.length > 1 ? toArray(cbs) : cbs;
                var args = toArray(arguments, 1);
                for (var i = 0, l = cbs.length; i < l; i++) {
                    cbs[i].apply(vm, args);
                }
            }
            return vm
        };
    }

    /*  */

    var activeInstance = null;

    function initLifecycle(vm) {
        var options = vm.$options;

        // locate first non-abstract parent
        var parent = options.parent;
        if (parent && !options.abstract) {
            while (parent.$options.abstract && parent.$parent) {
                parent = parent.$parent;
            }
            parent.$children.push(vm);
        }

        vm.$parent = parent;
        vm.$root = parent ? parent.$root : vm;

        vm.$children = [];
        vm.$refs = {};

        vm._watcher = null;
        vm._inactive = false;
        vm._isMounted = false;
        vm._isDestroyed = false;
        vm._isBeingDestroyed = false;
    }

    function lifecycleMixin(Vue) {
        Vue.prototype._mount = function (
            el,
            hydrating
        ) {
            var vm = this;
            vm.$el = el;
            if (!vm.$options.render) {
                vm.$options.render = createEmptyVNode;
                {
                    /* istanbul ignore if */
                    if (vm.$options.template && vm.$options.template.charAt(0) !== '#') {
                        warn(
                            'You are using the runtime-only build of Vue where the template ' +
                            'option is not available. Either pre-compile the templates into ' +
                            'render functions, or use the compiler-included build.',
                            vm
                        );
                    } else {
                        warn(
                            'Failed to mount component: template or render function not defined.',
                            vm
                        );
                    }
                }
            }
            callHook(vm, 'beforeMount');
            vm._watcher = new Watcher(vm, function updateComponent() {
                vm._update(vm._render(), hydrating);
            }, noop);
            hydrating = false;
            // manually mounted instance, call mounted on self
            // mounted is called for render-created child components in its inserted hook
            if (vm.$vnode == null) {
                vm._isMounted = true;
                callHook(vm, 'mounted');
            }
            return vm
        };

        Vue.prototype._update = function (vnode, hydrating) {
            var vm = this;
            if (vm._isMounted) {
                callHook(vm, 'beforeUpdate');
            }
            var prevEl = vm.$el;
            var prevVnode = vm._vnode;
            var prevActiveInstance = activeInstance;
            activeInstance = vm;
            vm._vnode = vnode;
            // Vue.prototype.__patch__ is injected in entry points
            // based on the rendering backend used.
            if (!prevVnode) {
                // initial render
                vm.$el = vm.__patch__(
                    vm.$el, vnode, hydrating, false /* removeOnly */,
                    vm.$options._parentElm,
                    vm.$options._refElm
                );
            } else {
                // updates
                vm.$el = vm.__patch__(prevVnode, vnode);
            }
            activeInstance = prevActiveInstance;
            // update __vue__ reference
            if (prevEl) {
                prevEl.__vue__ = null;
            }
            if (vm.$el) {
                vm.$el.__vue__ = vm;
            }
            // if parent is an HOC, update its $el as well
            if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
                vm.$parent.$el = vm.$el;
            }
            // updated hook is called by the scheduler to ensure that children are
            // updated in a parent's updated hook.
        };

        Vue.prototype._updateFromParent = function (
            propsData,
            listeners,
            parentVnode,
            renderChildren
        ) {
            var vm = this;
            var hasChildren = !!(vm.$options._renderChildren || renderChildren);
            vm.$options._parentVnode = parentVnode;
            vm.$vnode = parentVnode; // update vm's placeholder node without re-render
            if (vm._vnode) { // update child tree's parent
                vm._vnode.parent = parentVnode;
            }
            vm.$options._renderChildren = renderChildren;
            // update props
            if (propsData && vm.$options.props) {
                observerState.shouldConvert = false;
                {
                    observerState.isSettingProps = true;
                }
                var propKeys = vm.$options._propKeys || [];
                for (var i = 0; i < propKeys.length; i++) {
                    var key = propKeys[i];
                    vm[key] = validateProp(key, vm.$options.props, propsData, vm);
                }
                observerState.shouldConvert = true;
                {
                    observerState.isSettingProps = false;
                }
                vm.$options.propsData = propsData;
            }
            // update listeners
            if (listeners) {
                var oldListeners = vm.$options._parentListeners;
                vm.$options._parentListeners = listeners;
                updateComponentListeners(vm, listeners, oldListeners);
            }
            // resolve slots + force update if has children
            if (hasChildren) {
                vm.$slots = resolveSlots(renderChildren, parentVnode.context);
                vm.$forceUpdate();
            }
        };

        Vue.prototype.$forceUpdate = function () {
            var vm = this;
            if (vm._watcher) {
                vm._watcher.update();
            }
        };

        Vue.prototype.$destroy = function () {
            var vm = this;
            if (vm._isBeingDestroyed) {
                return
            }
            callHook(vm, 'beforeDestroy');
            vm._isBeingDestroyed = true;
            // remove self from parent
            var parent = vm.$parent;
            if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
                remove$1(parent.$children, vm);
            }
            // teardown watchers
            if (vm._watcher) {
                vm._watcher.teardown();
            }
            var i = vm._watchers.length;
            while (i--) {
                vm._watchers[i].teardown();
            }
            // remove reference from data ob
            // frozen object may not have observer.
            if (vm._data.__ob__) {
                vm._data.__ob__.vmCount--;
            }
            // call the last hook...
            vm._isDestroyed = true;
            callHook(vm, 'destroyed');
            // turn off all instance listeners.
            vm.$off();
            // remove __vue__ reference
            if (vm.$el) {
                vm.$el.__vue__ = null;
            }
            // invoke destroy hooks on current rendered tree
            vm.__patch__(vm._vnode, null);
        };
    }

    function callHook(vm, hook) {
        var handlers = vm.$options[hook];
        if (handlers) {
            for (var i = 0, j = handlers.length; i < j; i++) {
                handlers[i].call(vm);
            }
        }
        if (vm._hasHookEvent) {
            vm.$emit('hook:' + hook);
        }
    }

    /*  */


    var queue = [];
    var has$1 = {};
    var circular = {};
    var waiting = false;
    var flushing = false;
    var index = 0;

    /**
     * Reset the scheduler's state.
     */
    function resetSchedulerState() {
        queue.length = 0;
        has$1 = {};
        {
            circular = {};
        }
        waiting = flushing = false;
    }

    /**
     * Flush both queues and run the watchers.
     */
    function flushSchedulerQueue() {
        flushing = true;
        var watcher, id, vm;

        // Sort queue before flush.
        // This ensures that:
        // 1. Components are updated from parent to child. (because parent is always
        //    created before the child)
        // 2. A component's user watchers are run before its render watcher (because
        //    user watchers are created before the render watcher)
        // 3. If a component is destroyed during a parent component's watcher run,
        //    its watchers can be skipped.
        queue.sort(function (a, b) { return a.id - b.id; });

        // do not cache length because more watchers might be pushed
        // as we run existing watchers
        for (index = 0; index < queue.length; index++) {
            watcher = queue[index];
            id = watcher.id;
            has$1[id] = null;
            watcher.run();
            // in dev build, check and stop circular updates.
            if ("development" !== 'production' && has$1[id] != null) {
                circular[id] = (circular[id] || 0) + 1;
                if (circular[id] > config._maxUpdateCount) {
                    warn(
                        'You may have an infinite update loop ' + (
                            watcher.user
                                ? ("in watcher with expression \"" + (watcher.expression) + "\"")
                                : "in a component render function."
                        ),
                        watcher.vm
                    );
                    break
                }
            }
        }

        // call updated hooks
        index = queue.length;
        while (index--) {
            watcher = queue[index];
            vm = watcher.vm;
            if (vm._watcher === watcher && vm._isMounted) {
                callHook(vm, 'updated');
            }
        }

        // devtool hook
        /* istanbul ignore if */
        if (devtools && config.devtools) {
            devtools.emit('flush');
        }

        resetSchedulerState();
    }

    /**
     * Push a watcher into the watcher queue.
     * Jobs with duplicate IDs will be skipped unless it's
     * pushed when the queue is being flushed.
     */
    function queueWatcher(watcher) {
        var id = watcher.id;
        if (has$1[id] == null) {
            has$1[id] = true;
            if (!flushing) {
                queue.push(watcher);
            } else {
                // if already flushing, splice the watcher based on its id
                // if already past its id, it will be run next immediately.
                var i = queue.length - 1;
                while (i >= 0 && queue[i].id > watcher.id) {
                    i--;
                }
                queue.splice(Math.max(i, index) + 1, 0, watcher);
            }
            // queue the flush
            if (!waiting) {
                waiting = true;
                nextTick(flushSchedulerQueue);
            }
        }
    }

    /*  */

    var uid$2 = 0;

    /**
     * A watcher parses an expression, collects dependencies,
     * and fires callback when the expression value changes.
     * This is used for both the $watch() api and directives.
     */
    var Watcher = function Watcher(
        vm,
        expOrFn,
        cb,
        options
    ) {
        this.vm = vm;
        vm._watchers.push(this);
        // options
        if (options) {
            this.deep = !!options.deep;
            this.user = !!options.user;
            this.lazy = !!options.lazy;
            this.sync = !!options.sync;
        } else {
            this.deep = this.user = this.lazy = this.sync = false;
        }
        this.cb = cb;
        this.id = ++uid$2; // uid for batching
        this.active = true;
        this.dirty = this.lazy; // for lazy watchers
        this.deps = [];
        this.newDeps = [];
        this.depIds = new _Set();
        this.newDepIds = new _Set();
        this.expression = expOrFn.toString();
        // parse expression for getter
        if (typeof expOrFn === 'function') {
            this.getter = expOrFn;
        } else {
            this.getter = parsePath(expOrFn);
            if (!this.getter) {
                this.getter = function () { };
                "development" !== 'production' && warn(
                    "Failed watching path: \"" + expOrFn + "\" " +
                    'Watcher only accepts simple dot-delimited paths. ' +
                    'For full control, use a function instead.',
                    vm
                );
            }
        }
        this.value = this.lazy
            ? undefined
            : this.get();
    };

    /**
     * Evaluate the getter, and re-collect dependencies.
     */
    Watcher.prototype.get = function get() {
        pushTarget(this);
        var value = this.getter.call(this.vm, this.vm);
        // "touch" every property so they are all tracked as
        // dependencies for deep watching
        if (this.deep) {
            traverse(value);
        }
        popTarget();
        this.cleanupDeps();
        return value
    };

    /**
     * Add a dependency to this directive.
     */
    Watcher.prototype.addDep = function addDep(dep) {
        var id = dep.id;
        if (!this.newDepIds.has(id)) {
            this.newDepIds.add(id);
            this.newDeps.push(dep);
            if (!this.depIds.has(id)) {
                dep.addSub(this);
            }
        }
    };

    /**
     * Clean up for dependency collection.
     */
    Watcher.prototype.cleanupDeps = function cleanupDeps() {
        var this$1 = this;

        var i = this.deps.length;
        while (i--) {
            var dep = this$1.deps[i];
            if (!this$1.newDepIds.has(dep.id)) {
                dep.removeSub(this$1);
            }
        }
        var tmp = this.depIds;
        this.depIds = this.newDepIds;
        this.newDepIds = tmp;
        this.newDepIds.clear();
        tmp = this.deps;
        this.deps = this.newDeps;
        this.newDeps = tmp;
        this.newDeps.length = 0;
    };

    /**
     * Subscriber interface.
     * Will be called when a dependency changes.
     */
    Watcher.prototype.update = function update() {
        /* istanbul ignore else */
        if (this.lazy) {
            this.dirty = true;
        } else if (this.sync) {
            this.run();
        } else {
            queueWatcher(this);
        }
    };

    /**
     * Scheduler job interface.
     * Will be called by the scheduler.
     */
    Watcher.prototype.run = function run() {
        if (this.active) {
            var value = this.get();
            if (
                value !== this.value ||
                // Deep watchers and watchers on Object/Arrays should fire even
                // when the value is the same, because the value may
                // have mutated.
                isObject(value) ||
                this.deep
            ) {
                // set new value
                var oldValue = this.value;
                this.value = value;
                if (this.user) {
                    try {
                        this.cb.call(this.vm, value, oldValue);
                    } catch (e) {
                        /* istanbul ignore else */
                        if (config.errorHandler) {
                            config.errorHandler.call(null, e, this.vm);
                        } else {
                            "development" !== 'production' && warn(
                                ("Error in watcher \"" + (this.expression) + "\""),
                                this.vm
                            );
                            throw e
                        }
                    }
                } else {
                    this.cb.call(this.vm, value, oldValue);
                }
            }
        }
    };

    /**
     * Evaluate the value of the watcher.
     * This only gets called for lazy watchers.
     */
    Watcher.prototype.evaluate = function evaluate() {
        this.value = this.get();
        this.dirty = false;
    };

    /**
     * Depend on all deps collected by this watcher.
     */
    Watcher.prototype.depend = function depend() {
        var this$1 = this;

        var i = this.deps.length;
        while (i--) {
            this$1.deps[i].depend();
        }
    };

    /**
     * Remove self from all dependencies' subscriber list.
     */
    Watcher.prototype.teardown = function teardown() {
        var this$1 = this;

        if (this.active) {
            // remove self from vm's watcher list
            // this is a somewhat expensive operation so we skip it
            // if the vm is being destroyed.
            if (!this.vm._isBeingDestroyed) {
                remove$1(this.vm._watchers, this);
            }
            var i = this.deps.length;
            while (i--) {
                this$1.deps[i].removeSub(this$1);
            }
            this.active = false;
        }
    };

    /**
     * Recursively traverse an object to evoke all converted
     * getters, so that every nested property inside the object
     * is collected as a "deep" dependency.
     */
    var seenObjects = new _Set();
    function traverse(val) {
        seenObjects.clear();
        _traverse(val, seenObjects);
    }

    function _traverse(val, seen) {
        var i, keys;
        var isA = Array.isArray(val);
        if ((!isA && !isObject(val)) || !Object.isExtensible(val)) {
            return
        }
        if (val.__ob__) {
            var depId = val.__ob__.dep.id;
            if (seen.has(depId)) {
                return
            }
            seen.add(depId);
        }
        if (isA) {
            i = val.length;
            while (i--) { _traverse(val[i], seen); }
        } else {
            keys = Object.keys(val);
            i = keys.length;
            while (i--) { _traverse(val[keys[i]], seen); }
        }
    }

    /*  */

    function initState(vm) {
        vm._watchers = [];
        var opts = vm.$options;
        if (opts.props) { initProps(vm, opts.props); }
        if (opts.methods) { initMethods(vm, opts.methods); }
        if (opts.data) {
            initData(vm);
        } else {
            observe(vm._data = {}, true /* asRootData */);
        }
        if (opts.computed) { initComputed(vm, opts.computed); }
        if (opts.watch) { initWatch(vm, opts.watch); }
    }

    var isReservedProp = { key: 1, ref: 1, slot: 1 };

    function initProps(vm, props) {
        var propsData = vm.$options.propsData || {};
        var keys = vm.$options._propKeys = Object.keys(props);
        var isRoot = !vm.$parent;
        // root instance props should be converted
        observerState.shouldConvert = isRoot;
        var loop = function (i) {
            var key = keys[i];
            /* istanbul ignore else */
            {
                if (isReservedProp[key]) {
                    warn(
                        ("\"" + key + "\" is a reserved attribute and cannot be used as component prop."),
                        vm
                    );
                }
                defineReactive$$1(vm, key, validateProp(key, props, propsData, vm), function () {
                    if (vm.$parent && !observerState.isSettingProps) {
                        warn(
                            "Avoid mutating a prop directly since the value will be " +
                            "overwritten whenever the parent component re-renders. " +
                            "Instead, use a data or computed property based on the prop's " +
                            "value. Prop being mutated: \"" + key + "\"",
                            vm
                        );
                    }
                });
            }
        };

        for (var i = 0; i < keys.length; i++) loop(i);
        observerState.shouldConvert = true;
    }

    function initData(vm) {
        var data = vm.$options.data;
        data = vm._data = typeof data === 'function'
            ? data.call(vm)
            : data || {};
        if (!isPlainObject(data)) {
            data = {};
            "development" !== 'production' && warn(
                'data functions should return an object:\n' +
                'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
                vm
            );
        }
        // proxy data on instance
        var keys = Object.keys(data);
        var props = vm.$options.props;
        var i = keys.length;
        while (i--) {
            if (props && hasOwn(props, keys[i])) {
                "development" !== 'production' && warn(
                    "The data property \"" + (keys[i]) + "\" is already declared as a prop. " +
                    "Use prop default value instead.",
                    vm
                );
            } else {
                proxy(vm, keys[i]);
            }
        }
        // observe data
        observe(data, true /* asRootData */);
    }

    var computedSharedDefinition = {
        enumerable: true,
        configurable: true,
        get: noop,
        set: noop
    };

    function initComputed(vm, computed) {
        for (var key in computed) {
            /* istanbul ignore if */
            if ("development" !== 'production' && key in vm) {
                warn(
                    "existing instance property \"" + key + "\" will be " +
                    "overwritten by a computed property with the same name.",
                    vm
                );
            }
            var userDef = computed[key];
            if (typeof userDef === 'function') {
                computedSharedDefinition.get = makeComputedGetter(userDef, vm);
                computedSharedDefinition.set = noop;
            } else {
                computedSharedDefinition.get = userDef.get
                    ? userDef.cache !== false
                        ? makeComputedGetter(userDef.get, vm)
                        : bind$1(userDef.get, vm)
                    : noop;
                computedSharedDefinition.set = userDef.set
                    ? bind$1(userDef.set, vm)
                    : noop;
            }
            Object.defineProperty(vm, key, computedSharedDefinition);
        }
    }

    function makeComputedGetter(getter, owner) {
        var watcher = new Watcher(owner, getter, noop, {
            lazy: true
        });
        return function computedGetter() {
            if (watcher.dirty) {
                watcher.evaluate();
            }
            if (Dep.target) {
                watcher.depend();
            }
            return watcher.value
        }
    }

    function initMethods(vm, methods) {
        for (var key in methods) {
            vm[key] = methods[key] == null ? noop : bind$1(methods[key], vm);
            if ("development" !== 'production' && methods[key] == null) {
                warn(
                    "method \"" + key + "\" has an undefined value in the component definition. " +
                    "Did you reference the function correctly?",
                    vm
                );
            }
        }
    }

    function initWatch(vm, watch) {
        for (var key in watch) {
            var handler = watch[key];
            if (Array.isArray(handler)) {
                for (var i = 0; i < handler.length; i++) {
                    createWatcher(vm, key, handler[i]);
                }
            } else {
                createWatcher(vm, key, handler);
            }
        }
    }

    function createWatcher(vm, key, handler) {
        var options;
        if (isPlainObject(handler)) {
            options = handler;
            handler = handler.handler;
        }
        if (typeof handler === 'string') {
            handler = vm[handler];
        }
        vm.$watch(key, handler, options);
    }

    function stateMixin(Vue) {
        // flow somehow has problems with directly declared definition object
        // when using Object.defineProperty, so we have to procedurally build up
        // the object here.
        var dataDef = {};
        dataDef.get = function () {
            return this._data
        };
        {
            dataDef.set = function (newData) {
                warn(
                    'Avoid replacing instance root $data. ' +
                    'Use nested data properties instead.',
                    this
                );
            };
        }
        Object.defineProperty(Vue.prototype, '$data', dataDef);

        Vue.prototype.$set = set$1;
        Vue.prototype.$delete = del;

        Vue.prototype.$watch = function (
            expOrFn,
            cb,
            options
        ) {
            var vm = this;
            options = options || {};
            options.user = true;
            var watcher = new Watcher(vm, expOrFn, cb, options);
            if (options.immediate) {
                cb.call(vm, watcher.value);
            }
            return function unwatchFn() {
                watcher.teardown();
            }
        };
    }

    function proxy(vm, key) {
        if (!isReserved(key)) {
            Object.defineProperty(vm, key, {
                configurable: true,
                enumerable: true,
                get: function proxyGetter() {
                    return vm._data[key]
                },
                set: function proxySetter(val) {
                    vm._data[key] = val;
                }
            });
        }
    }

    /*  */

    var uid = 0;

    function initMixin(Vue) {
        Vue.prototype._init = function (options) {
            var vm = this;
            // a uid
            vm._uid = uid++;
            // a flag to avoid this being observed
            vm._isVue = true;
            // merge options
            if (options && options._isComponent) {
                // optimize internal component instantiation
                // since dynamic options merging is pretty slow, and none of the
                // internal component options needs special treatment.
                initInternalComponent(vm, options);
            } else {
                vm.$options = mergeOptions(
                    resolveConstructorOptions(vm.constructor),
                    options || {},
                    vm
                );
            }
            /* istanbul ignore else */
            {
                initProxy(vm);
            }
            // expose real self
            vm._self = vm;
            initLifecycle(vm);
            initEvents(vm);
            initRender(vm);
            callHook(vm, 'beforeCreate');
            initState(vm);
            callHook(vm, 'created');
            if (vm.$options.el) {
                vm.$mount(vm.$options.el);
            }
        };
    }

    function initInternalComponent(vm, options) {
        var opts = vm.$options = Object.create(vm.constructor.options);
        // doing this because it's faster than dynamic enumeration.
        opts.parent = options.parent;
        opts.propsData = options.propsData;
        opts._parentVnode = options._parentVnode;
        opts._parentListeners = options._parentListeners;
        opts._renderChildren = options._renderChildren;
        opts._componentTag = options._componentTag;
        opts._parentElm = options._parentElm;
        opts._refElm = options._refElm;
        if (options.render) {
            opts.render = options.render;
            opts.staticRenderFns = options.staticRenderFns;
        }
    }

    function resolveConstructorOptions(Ctor) {
        var options = Ctor.options;
        if (Ctor.super) {
            var superOptions = Ctor.super.options;
            var cachedSuperOptions = Ctor.superOptions;
            var extendOptions = Ctor.extendOptions;
            if (superOptions !== cachedSuperOptions) {
                // super option changed
                Ctor.superOptions = superOptions;
                extendOptions.render = options.render;
                extendOptions.staticRenderFns = options.staticRenderFns;
                extendOptions._scopeId = options._scopeId;
                options = Ctor.options = mergeOptions(superOptions, extendOptions);
                if (options.name) {
                    options.components[options.name] = Ctor;
                }
            }
        }
        return options
    }

    function Vue$3(options) {
        if ("development" !== 'production' &&
            !(this instanceof Vue$3)) {
            warn('Vue is a constructor and should be called with the `new` keyword');
        }
        this._init(options);
    }

    initMixin(Vue$3);
    stateMixin(Vue$3);
    eventsMixin(Vue$3);
    lifecycleMixin(Vue$3);
    renderMixin(Vue$3);

    /*  */

    function initUse(Vue) {
        Vue.use = function (plugin) {
            /* istanbul ignore if */
            if (plugin.installed) {
                return
            }
            // additional parameters
            var args = toArray(arguments, 1);
            args.unshift(this);
            if (typeof plugin.install === 'function') {
                plugin.install.apply(plugin, args);
            } else {
                plugin.apply(null, args);
            }
            plugin.installed = true;
            return this
        };
    }

    /*  */

    function initMixin$1(Vue) {
        Vue.mixin = function (mixin) {
            this.options = mergeOptions(this.options, mixin);
        };
    }

    /*  */

    function initExtend(Vue) {
        /**
         * Each instance constructor, including Vue, has a unique
         * cid. This enables us to create wrapped "child
         * constructors" for prototypal inheritance and cache them.
         */
        Vue.cid = 0;
        var cid = 1;

        /**
         * Class inheritance
         */
        Vue.extend = function (extendOptions) {
            extendOptions = extendOptions || {};
            var Super = this;
            var SuperId = Super.cid;
            var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
            if (cachedCtors[SuperId]) {
                return cachedCtors[SuperId]
            }
            var name = extendOptions.name || Super.options.name;
            {
                if (!/^[a-zA-Z][\w-]*$/.test(name)) {
                    warn(
                        'Invalid component name: "' + name + '". Component names ' +
                        'can only contain alphanumeric characters and the hyphen, ' +
                        'and must start with a letter.'
                    );
                }
            }
            var Sub = function VueComponent(options) {
                this._init(options);
            };
            Sub.prototype = Object.create(Super.prototype);
            Sub.prototype.constructor = Sub;
            Sub.cid = cid++;
            Sub.options = mergeOptions(
                Super.options,
                extendOptions
            );
            Sub['super'] = Super;
            // allow further extension/mixin/plugin usage
            Sub.extend = Super.extend;
            Sub.mixin = Super.mixin;
            Sub.use = Super.use;
            // create asset registers, so extended classes
            // can have their private assets too.
            config._assetTypes.forEach(function (type) {
                Sub[type] = Super[type];
            });
            // enable recursive self-lookup
            if (name) {
                Sub.options.components[name] = Sub;
            }
            // keep a reference to the super options at extension time.
            // later at instantiation we can check if Super's options have
            // been updated.
            Sub.superOptions = Super.options;
            Sub.extendOptions = extendOptions;
            // cache constructor
            cachedCtors[SuperId] = Sub;
            return Sub
        };
    }

    /*  */

    function initAssetRegisters(Vue) {
        /**
         * Create asset registration methods.
         */
        config._assetTypes.forEach(function (type) {
            Vue[type] = function (
                id,
                definition
            ) {
                if (!definition) {
                    return this.options[type + 's'][id]
                } else {
                    /* istanbul ignore if */
                    {
                        if (type === 'component' && config.isReservedTag(id)) {
                            warn(
                                'Do not use built-in or reserved HTML elements as component ' +
                                'id: ' + id
                            );
                        }
                    }
                    if (type === 'component' && isPlainObject(definition)) {
                        definition.name = definition.name || id;
                        definition = this.options._base.extend(definition);
                    }
                    if (type === 'directive' && typeof definition === 'function') {
                        definition = { bind: definition, update: definition };
                    }
                    this.options[type + 's'][id] = definition;
                    return definition
                }
            };
        });
    }

    /*  */

    var patternTypes = [String, RegExp];

    function getComponentName(opts) {
        return opts && (opts.Ctor.options.name || opts.tag)
    }

    function matches(pattern, name) {
        if (typeof pattern === 'string') {
            return pattern.split(',').indexOf(name) > -1
        } else {
            return pattern.test(name)
        }
    }

    function pruneCache(cache, filter) {
        for (var key in cache) {
            var cachedNode = cache[key];
            if (cachedNode) {
                var name = getComponentName(cachedNode.componentOptions);
                if (name && !filter(name)) {
                    pruneCacheEntry(cachedNode);
                    cache[key] = null;
                }
            }
        }
    }

    function pruneCacheEntry(vnode) {
        if (vnode) {
            if (!vnode.componentInstance._inactive) {
                callHook(vnode.componentInstance, 'deactivated');
            }
            vnode.componentInstance.$destroy();
        }
    }

    var KeepAlive = {
        name: 'keep-alive',
        abstract: true,

        props: {
            include: patternTypes,
            exclude: patternTypes
        },

        created: function created() {
            this.cache = Object.create(null);
        },

        destroyed: function destroyed() {
            var this$1 = this;

            for (var key in this.cache) {
                pruneCacheEntry(this$1.cache[key]);
            }
        },

        watch: {
            include: function include(val) {
                pruneCache(this.cache, function (name) { return matches(val, name); });
            },
            exclude: function exclude(val) {
                pruneCache(this.cache, function (name) { return !matches(val, name); });
            }
        },

        render: function render() {
            var vnode = getFirstComponentChild(this.$slots.default);
            var componentOptions = vnode && vnode.componentOptions;
            if (componentOptions) {
                // check pattern
                var name = getComponentName(componentOptions);
                if (name && (
                    (this.include && !matches(this.include, name)) ||
                    (this.exclude && matches(this.exclude, name))
                )) {
                    return vnode
                }
                var key = vnode.key == null
                    // same constructor may get registered as different local components
                    // so cid alone is not enough (#3269)
                    ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
                    : vnode.key;
                if (this.cache[key]) {
                    vnode.componentInstance = this.cache[key].componentInstance;
                } else {
                    this.cache[key] = vnode;
                }
                vnode.data.keepAlive = true;
            }
            return vnode
        }
    };

    var builtInComponents = {
        KeepAlive: KeepAlive
    };

    /*  */

    function initGlobalAPI(Vue) {
        // config
        var configDef = {};
        configDef.get = function () { return config; };
        {
            configDef.set = function () {
                warn(
                    'Do not replace the Vue.config object, set individual fields instead.'
                );
            };
        }
        Object.defineProperty(Vue, 'config', configDef);
        Vue.util = util;
        Vue.set = set$1;
        Vue.delete = del;
        Vue.nextTick = nextTick;

        Vue.options = Object.create(null);
        config._assetTypes.forEach(function (type) {
            Vue.options[type + 's'] = Object.create(null);
        });

        // this is used to identify the "base" constructor to extend all plain-object
        // components with in Weex's multi-instance scenarios.
        Vue.options._base = Vue;

        extend(Vue.options.components, builtInComponents);

        initUse(Vue);
        initMixin$1(Vue);
        initExtend(Vue);
        initAssetRegisters(Vue);
    }

    initGlobalAPI(Vue$3);

    Object.defineProperty(Vue$3.prototype, '$isServer', {
        get: isServerRendering
    });

    Vue$3.version = '2.1.10';

    /*  */

    // attributes that should be using props for binding
    var acceptValue = makeMap('input,textarea,option,select');
    var mustUseProp = function (tag, type, attr) {
        return (
            (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
            (attr === 'selected' && tag === 'option') ||
            (attr === 'checked' && tag === 'input') ||
            (attr === 'muted' && tag === 'video')
        )
    };

    var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

    var isBooleanAttr = makeMap(
        'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
        'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
        'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
        'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
        'required,reversed,scoped,seamless,selected,sortable,translate,' +
        'truespeed,typemustmatch,visible'
    );

    var xlinkNS = 'http://www.w3.org/1999/xlink';

    var isXlink = function (name) {
        return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
    };

    var getXlinkProp = function (name) {
        return isXlink(name) ? name.slice(6, name.length) : ''
    };

    var isFalsyAttrValue = function (val) {
        return val == null || val === false
    };

    /*  */

    function genClassForVnode(vnode) {
        var data = vnode.data;
        var parentNode = vnode;
        var childNode = vnode;
        while (childNode.componentInstance) {
            childNode = childNode.componentInstance._vnode;
            if (childNode.data) {
                data = mergeClassData(childNode.data, data);
            }
        }
        while ((parentNode = parentNode.parent)) {
            if (parentNode.data) {
                data = mergeClassData(data, parentNode.data);
            }
        }
        return genClassFromData(data)
    }

    function mergeClassData(child, parent) {
        return {
            staticClass: concat(child.staticClass, parent.staticClass),
            class: child.class
                ? [child.class, parent.class]
                : parent.class
        }
    }

    function genClassFromData(data) {
        var dynamicClass = data.class;
        var staticClass = data.staticClass;
        if (staticClass || dynamicClass) {
            return concat(staticClass, stringifyClass(dynamicClass))
        }
        /* istanbul ignore next */
        return ''
    }

    function concat(a, b) {
        return a ? b ? (a + ' ' + b) : a : (b || '')
    }

    function stringifyClass(value) {
        var res = '';
        if (!value) {
            return res
        }
        if (typeof value === 'string') {
            return value
        }
        if (Array.isArray(value)) {
            var stringified;
            for (var i = 0, l = value.length; i < l; i++) {
                if (value[i]) {
                    if ((stringified = stringifyClass(value[i]))) {
                        res += stringified + ' ';
                    }
                }
            }
            return res.slice(0, -1)
        }
        if (isObject(value)) {
            for (var key in value) {
                if (value[key]) { res += key + ' '; }
            }
            return res.slice(0, -1)
        }
        /* istanbul ignore next */
        return res
    }

    /*  */

    var namespaceMap = {
        svg: 'http://www.w3.org/2000/svg',
        math: 'http://www.w3.org/1998/Math/MathML'
    };

    var isHTMLTag = makeMap(
        'html,body,base,head,link,meta,style,title,' +
        'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
        'div,dd,dl,dt,figcaption,figure,hr,img,li,main,ol,p,pre,ul,' +
        'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
        's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
        'embed,object,param,source,canvas,script,noscript,del,ins,' +
        'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
        'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
        'output,progress,select,textarea,' +
        'details,dialog,menu,menuitem,summary,' +
        'content,element,shadow,template'
    );

    // this map is intentionally selective, only covering SVG elements that may
    // contain child elements.
    var isSVG = makeMap(
        'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,' +
        'font-face,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
        'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
        true
    );

    var isPreTag = function (tag) { return tag === 'pre'; };

    var isReservedTag = function (tag) {
        return isHTMLTag(tag) || isSVG(tag)
    };

    function getTagNamespace(tag) {
        if (isSVG(tag)) {
            return 'svg'
        }
        // basic support for MathML
        // note it doesn't support other MathML elements being component roots
        if (tag === 'math') {
            return 'math'
        }
    }

    var unknownElementCache = Object.create(null);
    function isUnknownElement(tag) {
        /* istanbul ignore if */
        if (!inBrowser) {
            return true
        }
        if (isReservedTag(tag)) {
            return false
        }
        tag = tag.toLowerCase();
        /* istanbul ignore if */
        if (unknownElementCache[tag] != null) {
            return unknownElementCache[tag]
        }
        var el = document.createElement(tag);
        if (tag.indexOf('-') > -1) {
            // http://stackoverflow.com/a/28210364/1070244
            return (unknownElementCache[tag] = (
                el.constructor === window.HTMLUnknownElement ||
                el.constructor === window.HTMLElement
            ))
        } else {
            return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
        }
    }

    /*  */

    /**
     * Query an element selector if it's not an element already.
     */
    function query(el) {
        if (typeof el === 'string') {
            var selector = el;
            el = document.querySelector(el);
            if (!el) {
                "development" !== 'production' && warn(
                    'Cannot find element: ' + selector
                );
                return document.createElement('div')
            }
        }
        return el
    }

    /*  */

    function createElement$1(tagName, vnode) {
        var elm = document.createElement(tagName);
        if (tagName !== 'select') {
            return elm
        }
        if (vnode.data && vnode.data.attrs && 'multiple' in vnode.data.attrs) {
            elm.setAttribute('multiple', 'multiple');
        }
        return elm
    }

    function createElementNS(namespace, tagName) {
        return document.createElementNS(namespaceMap[namespace], tagName)
    }

    function createTextNode(text) {
        return document.createTextNode(text)
    }

    function createComment(text) {
        return document.createComment(text)
    }

    function insertBefore(parentNode, newNode, referenceNode) {
        parentNode.insertBefore(newNode, referenceNode);
    }

    function removeChild(node, child) {
        node.removeChild(child);
    }

    function appendChild(node, child) {
        node.appendChild(child);
    }

    function parentNode(node) {
        return node.parentNode
    }

    function nextSibling(node) {
        return node.nextSibling
    }

    function tagName(node) {
        return node.tagName
    }

    function setTextContent(node, text) {
        node.textContent = text;
    }

    function setAttribute(node, key, val) {
        node.setAttribute(key, val);
    }


    var nodeOps = Object.freeze({
        createElement: createElement$1,
        createElementNS: createElementNS,
        createTextNode: createTextNode,
        createComment: createComment,
        insertBefore: insertBefore,
        removeChild: removeChild,
        appendChild: appendChild,
        parentNode: parentNode,
        nextSibling: nextSibling,
        tagName: tagName,
        setTextContent: setTextContent,
        setAttribute: setAttribute
    });

    /*  */

    var ref = {
        create: function create(_, vnode) {
            registerRef(vnode);
        },
        update: function update(oldVnode, vnode) {
            if (oldVnode.data.ref !== vnode.data.ref) {
                registerRef(oldVnode, true);
                registerRef(vnode);
            }
        },
        destroy: function destroy(vnode) {
            registerRef(vnode, true);
        }
    };

    function registerRef(vnode, isRemoval) {
        var key = vnode.data.ref;
        if (!key) { return }

        var vm = vnode.context;
        var ref = vnode.componentInstance || vnode.elm;
        var refs = vm.$refs;
        if (isRemoval) {
            if (Array.isArray(refs[key])) {
                remove$1(refs[key], ref);
            } else if (refs[key] === ref) {
                refs[key] = undefined;
            }
        } else {
            if (vnode.data.refInFor) {
                if (Array.isArray(refs[key]) && refs[key].indexOf(ref) < 0) {
                    refs[key].push(ref);
                } else {
                    refs[key] = [ref];
                }
            } else {
                refs[key] = ref;
            }
        }
    }

    /**
     * Virtual DOM patching algorithm based on Snabbdom by
     * Simon Friis Vindum (@paldepind)
     * Licensed under the MIT License
     * https://github.com/paldepind/snabbdom/blob/master/LICENSE
     *
     * modified by Evan You (@yyx990803)
     *
    
    /*
     * Not type-checking this because this file is perf-critical and the cost
     * of making flow understand it is not worth it.
     */

    var emptyNode = new VNode('', {}, []);

    var hooks$1 = ['create', 'activate', 'update', 'remove', 'destroy'];

    function isUndef(s) {
        return s == null
    }

    function isDef(s) {
        return s != null
    }

    function sameVnode(vnode1, vnode2) {
        return (
            vnode1.key === vnode2.key &&
            vnode1.tag === vnode2.tag &&
            vnode1.isComment === vnode2.isComment &&
            !vnode1.data === !vnode2.data
        )
    }

    function createKeyToOldIdx(children, beginIdx, endIdx) {
        var i, key;
        var map = {};
        for (i = beginIdx; i <= endIdx; ++i) {
            key = children[i].key;
            if (isDef(key)) { map[key] = i; }
        }
        return map
    }

    function createPatchFunction(backend) {
        var i, j;
        var cbs = {};

        var modules = backend.modules;
        var nodeOps = backend.nodeOps;

        for (i = 0; i < hooks$1.length; ++i) {
            cbs[hooks$1[i]] = [];
            for (j = 0; j < modules.length; ++j) {
                if (modules[j][hooks$1[i]] !== undefined) { cbs[hooks$1[i]].push(modules[j][hooks$1[i]]); }
            }
        }

        function emptyNodeAt(elm) {
            return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
        }

        function createRmCb(childElm, listeners) {
            function remove$$1() {
                if (--remove$$1.listeners === 0) {
                    removeNode(childElm);
                }
            }
            remove$$1.listeners = listeners;
            return remove$$1
        }

        function removeNode(el) {
            var parent = nodeOps.parentNode(el);
            // element may have already been removed due to v-html / v-text
            if (parent) {
                nodeOps.removeChild(parent, el);
            }
        }

        var inPre = 0;
        function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested) {
            vnode.isRootInsert = !nested; // for transition enter check
            if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
                return
            }

            var data = vnode.data;
            var children = vnode.children;
            var tag = vnode.tag;
            if (isDef(tag)) {
                {
                    if (data && data.pre) {
                        inPre++;
                    }
                    if (
                        !inPre &&
                        !vnode.ns &&
                        !(config.ignoredElements.length && config.ignoredElements.indexOf(tag) > -1) &&
                        config.isUnknownElement(tag)
                    ) {
                        warn(
                            'Unknown custom element: <' + tag + '> - did you ' +
                            'register the component correctly? For recursive components, ' +
                            'make sure to provide the "name" option.',
                            vnode.context
                        );
                    }
                }
                vnode.elm = vnode.ns
                    ? nodeOps.createElementNS(vnode.ns, tag)
                    : nodeOps.createElement(tag, vnode);
                setScope(vnode);

                /* istanbul ignore if */
                {
                    createChildren(vnode, children, insertedVnodeQueue);
                    if (isDef(data)) {
                        invokeCreateHooks(vnode, insertedVnodeQueue);
                    }
                    insert(parentElm, vnode.elm, refElm);
                }

                if ("development" !== 'production' && data && data.pre) {
                    inPre--;
                }
            } else if (vnode.isComment) {
                vnode.elm = nodeOps.createComment(vnode.text);
                insert(parentElm, vnode.elm, refElm);
            } else {
                vnode.elm = nodeOps.createTextNode(vnode.text);
                insert(parentElm, vnode.elm, refElm);
            }
        }

        function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
            var i = vnode.data;
            if (isDef(i)) {
                var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
                if (isDef(i = i.hook) && isDef(i = i.init)) {
                    i(vnode, false /* hydrating */, parentElm, refElm);
                }
                // after calling the init hook, if the vnode is a child component
                // it should've created a child instance and mounted it. the child
                // component also has set the placeholder vnode's elm.
                // in that case we can just return the element and be done.
                if (isDef(vnode.componentInstance)) {
                    initComponent(vnode, insertedVnodeQueue);
                    if (isReactivated) {
                        reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
                    }
                    return true
                }
            }
        }

        function initComponent(vnode, insertedVnodeQueue) {
            if (vnode.data.pendingInsert) {
                insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
            }
            vnode.elm = vnode.componentInstance.$el;
            if (isPatchable(vnode)) {
                invokeCreateHooks(vnode, insertedVnodeQueue);
                setScope(vnode);
            } else {
                // empty component root.
                // skip all element-related modules except for ref (#3455)
                registerRef(vnode);
                // make sure to invoke the insert hook
                insertedVnodeQueue.push(vnode);
            }
        }

        function reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
            var i;
            // hack for #4339: a reactivated component with inner transition
            // does not trigger because the inner node's created hooks are not called
            // again. It's not ideal to involve module-specific logic in here but
            // there doesn't seem to be a better way to do it.
            var innerNode = vnode;
            while (innerNode.componentInstance) {
                innerNode = innerNode.componentInstance._vnode;
                if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
                    for (i = 0; i < cbs.activate.length; ++i) {
                        cbs.activate[i](emptyNode, innerNode);
                    }
                    insertedVnodeQueue.push(innerNode);
                    break
                }
            }
            // unlike a newly created component,
            // a reactivated keep-alive component doesn't insert itself
            insert(parentElm, vnode.elm, refElm);
        }

        function insert(parent, elm, ref) {
            if (parent) {
                if (ref) {
                    nodeOps.insertBefore(parent, elm, ref);
                } else {
                    nodeOps.appendChild(parent, elm);
                }
            }
        }

        function createChildren(vnode, children, insertedVnodeQueue) {
            if (Array.isArray(children)) {
                for (var i = 0; i < children.length; ++i) {
                    createElm(children[i], insertedVnodeQueue, vnode.elm, null, true);
                }
            } else if (isPrimitive(vnode.text)) {
                nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text));
            }
        }

        function isPatchable(vnode) {
            while (vnode.componentInstance) {
                vnode = vnode.componentInstance._vnode;
            }
            return isDef(vnode.tag)
        }

        function invokeCreateHooks(vnode, insertedVnodeQueue) {
            for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                cbs.create[i$1](emptyNode, vnode);
            }
            i = vnode.data.hook; // Reuse variable
            if (isDef(i)) {
                if (i.create) { i.create(emptyNode, vnode); }
                if (i.insert) { insertedVnodeQueue.push(vnode); }
            }
        }

        // set scope id attribute for scoped CSS.
        // this is implemented as a special case to avoid the overhead
        // of going through the normal attribute patching process.
        function setScope(vnode) {
            var i;
            if (isDef(i = vnode.context) && isDef(i = i.$options._scopeId)) {
                nodeOps.setAttribute(vnode.elm, i, '');
            }
            if (isDef(i = activeInstance) &&
                i !== vnode.context &&
                isDef(i = i.$options._scopeId)) {
                nodeOps.setAttribute(vnode.elm, i, '');
            }
        }

        function addVnodes(parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
            for (; startIdx <= endIdx; ++startIdx) {
                createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm);
            }
        }

        function invokeDestroyHook(vnode) {
            var i, j;
            var data = vnode.data;
            if (isDef(data)) {
                if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode); }
                for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode); }
            }
            if (isDef(i = vnode.children)) {
                for (j = 0; j < vnode.children.length; ++j) {
                    invokeDestroyHook(vnode.children[j]);
                }
            }
        }

        function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
            for (; startIdx <= endIdx; ++startIdx) {
                var ch = vnodes[startIdx];
                if (isDef(ch)) {
                    if (isDef(ch.tag)) {
                        removeAndInvokeRemoveHook(ch);
                        invokeDestroyHook(ch);
                    } else { // Text node
                        removeNode(ch.elm);
                    }
                }
            }
        }

        function removeAndInvokeRemoveHook(vnode, rm) {
            if (rm || isDef(vnode.data)) {
                var listeners = cbs.remove.length + 1;
                if (!rm) {
                    // directly removing
                    rm = createRmCb(vnode.elm, listeners);
                } else {
                    // we have a recursively passed down rm callback
                    // increase the listeners count
                    rm.listeners += listeners;
                }
                // recursively invoke hooks on child component root node
                if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
                    removeAndInvokeRemoveHook(i, rm);
                }
                for (i = 0; i < cbs.remove.length; ++i) {
                    cbs.remove[i](vnode, rm);
                }
                if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
                    i(vnode, rm);
                } else {
                    rm();
                }
            } else {
                removeNode(vnode.elm);
            }
        }

        function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
            var oldStartIdx = 0;
            var newStartIdx = 0;
            var oldEndIdx = oldCh.length - 1;
            var oldStartVnode = oldCh[0];
            var oldEndVnode = oldCh[oldEndIdx];
            var newEndIdx = newCh.length - 1;
            var newStartVnode = newCh[0];
            var newEndVnode = newCh[newEndIdx];
            var oldKeyToIdx, idxInOld, elmToMove, refElm;

            // removeOnly is a special flag used only by <transition-group>
            // to ensure removed elements stay in correct relative positions
            // during leaving transitions
            var canMove = !removeOnly;

            while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
                if (isUndef(oldStartVnode)) {
                    oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
                } else if (isUndef(oldEndVnode)) {
                    oldEndVnode = oldCh[--oldEndIdx];
                } else if (sameVnode(oldStartVnode, newStartVnode)) {
                    patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                    oldStartVnode = oldCh[++oldStartIdx];
                    newStartVnode = newCh[++newStartIdx];
                } else if (sameVnode(oldEndVnode, newEndVnode)) {
                    patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                    oldEndVnode = oldCh[--oldEndIdx];
                    newEndVnode = newCh[--newEndIdx];
                } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
                    patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                    canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
                    oldStartVnode = oldCh[++oldStartIdx];
                    newEndVnode = newCh[--newEndIdx];
                } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
                    patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
                    canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                    oldEndVnode = oldCh[--oldEndIdx];
                    newStartVnode = newCh[++newStartIdx];
                } else {
                    if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
                    idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : null;
                    if (isUndef(idxInOld)) { // New element
                        createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
                        newStartVnode = newCh[++newStartIdx];
                    } else {
                        elmToMove = oldCh[idxInOld];
                        /* istanbul ignore if */
                        if ("development" !== 'production' && !elmToMove) {
                            warn(
                                'It seems there are duplicate keys that is causing an update error. ' +
                                'Make sure each v-for item has a unique key.'
                            );
                        }
                        if (sameVnode(elmToMove, newStartVnode)) {
                            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                            oldCh[idxInOld] = undefined;
                            canMove && nodeOps.insertBefore(parentElm, newStartVnode.elm, oldStartVnode.elm);
                            newStartVnode = newCh[++newStartIdx];
                        } else {
                            // same key but different element. treat as new element
                            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
                            newStartVnode = newCh[++newStartIdx];
                        }
                    }
                }
            }
            if (oldStartIdx > oldEndIdx) {
                refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
                addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
            } else if (newStartIdx > newEndIdx) {
                removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
            }
        }

        function patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly) {
            if (oldVnode === vnode) {
                return
            }
            // reuse element for static trees.
            // note we only do this if the vnode is cloned -
            // if the new node is not cloned it means the render functions have been
            // reset by the hot-reload-api and we need to do a proper re-render.
            if (vnode.isStatic &&
                oldVnode.isStatic &&
                vnode.key === oldVnode.key &&
                (vnode.isCloned || vnode.isOnce)) {
                vnode.elm = oldVnode.elm;
                vnode.componentInstance = oldVnode.componentInstance;
                return
            }
            var i;
            var data = vnode.data;
            var hasData = isDef(data);
            if (hasData && isDef(i = data.hook) && isDef(i = i.prepatch)) {
                i(oldVnode, vnode);
            }
            var elm = vnode.elm = oldVnode.elm;
            var oldCh = oldVnode.children;
            var ch = vnode.children;
            if (hasData && isPatchable(vnode)) {
                for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
                if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); }
            }
            if (isUndef(vnode.text)) {
                if (isDef(oldCh) && isDef(ch)) {
                    if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
                } else if (isDef(ch)) {
                    if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
                    addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
                } else if (isDef(oldCh)) {
                    removeVnodes(elm, oldCh, 0, oldCh.length - 1);
                } else if (isDef(oldVnode.text)) {
                    nodeOps.setTextContent(elm, '');
                }
            } else if (oldVnode.text !== vnode.text) {
                nodeOps.setTextContent(elm, vnode.text);
            }
            if (hasData) {
                if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); }
            }
        }

        function invokeInsertHook(vnode, queue, initial) {
            // delay insert hooks for component root nodes, invoke them after the
            // element is really inserted
            if (initial && vnode.parent) {
                vnode.parent.data.pendingInsert = queue;
            } else {
                for (var i = 0; i < queue.length; ++i) {
                    queue[i].data.hook.insert(queue[i]);
                }
            }
        }

        var bailed = false;
        // list of modules that can skip create hook during hydration because they
        // are already rendered on the client or has no need for initialization
        var isRenderedModule = makeMap('attrs,style,class,staticClass,staticStyle,key');

        // Note: this is a browser-only function so we can assume elms are DOM nodes.
        function hydrate(elm, vnode, insertedVnodeQueue) {
            {
                if (!assertNodeMatch(elm, vnode)) {
                    return false
                }
            }
            vnode.elm = elm;
            var tag = vnode.tag;
            var data = vnode.data;
            var children = vnode.children;
            if (isDef(data)) {
                if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */); }
                if (isDef(i = vnode.componentInstance)) {
                    // child component. it should have hydrated its own tree.
                    initComponent(vnode, insertedVnodeQueue);
                    return true
                }
            }
            if (isDef(tag)) {
                if (isDef(children)) {
                    // empty element, allow client to pick up and populate children
                    if (!elm.hasChildNodes()) {
                        createChildren(vnode, children, insertedVnodeQueue);
                    } else {
                        var childrenMatch = true;
                        var childNode = elm.firstChild;
                        for (var i$1 = 0; i$1 < children.length; i$1++) {
                            if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue)) {
                                childrenMatch = false;
                                break
                            }
                            childNode = childNode.nextSibling;
                        }
                        // if childNode is not null, it means the actual childNodes list is
                        // longer than the virtual children list.
                        if (!childrenMatch || childNode) {
                            if ("development" !== 'production' &&
                                typeof console !== 'undefined' &&
                                !bailed) {
                                bailed = true;
                                console.warn('Parent: ', elm);
                                console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
                            }
                            return false
                        }
                    }
                }
                if (isDef(data)) {
                    for (var key in data) {
                        if (!isRenderedModule(key)) {
                            invokeCreateHooks(vnode, insertedVnodeQueue);
                            break
                        }
                    }
                }
            } else if (elm.data !== vnode.text) {
                elm.data = vnode.text;
            }
            return true
        }

        function assertNodeMatch(node, vnode) {
            if (vnode.tag) {
                return (
                    vnode.tag.indexOf('vue-component') === 0 ||
                    vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
                )
            } else {
                return node.nodeType === (vnode.isComment ? 8 : 3)
            }
        }

        return function patch(oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
            if (!vnode) {
                if (oldVnode) { invokeDestroyHook(oldVnode); }
                return
            }

            var isInitialPatch = false;
            var insertedVnodeQueue = [];

            if (!oldVnode) {
                // empty mount (likely as component), create new root element
                isInitialPatch = true;
                createElm(vnode, insertedVnodeQueue, parentElm, refElm);
            } else {
                var isRealElement = isDef(oldVnode.nodeType);
                if (!isRealElement && sameVnode(oldVnode, vnode)) {
                    // patch existing root node
                    patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly);
                } else {
                    if (isRealElement) {
                        // mounting to a real element
                        // check if this is server-rendered content and if we can perform
                        // a successful hydration.
                        if (oldVnode.nodeType === 1 && oldVnode.hasAttribute('server-rendered')) {
                            oldVnode.removeAttribute('server-rendered');
                            hydrating = true;
                        }
                        if (hydrating) {
                            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                                invokeInsertHook(vnode, insertedVnodeQueue, true);
                                return oldVnode
                            } else {
                                warn(
                                    'The client-side rendered virtual DOM tree is not matching ' +
                                    'server-rendered content. This is likely caused by incorrect ' +
                                    'HTML markup, for example nesting block-level elements inside ' +
                                    '<p>, or missing <tbody>. Bailing hydration and performing ' +
                                    'full client-side render.'
                                );
                            }
                        }
                        // either not server-rendered, or hydration failed.
                        // create an empty node and replace it
                        oldVnode = emptyNodeAt(oldVnode);
                    }
                    // replacing existing element
                    var oldElm = oldVnode.elm;
                    var parentElm$1 = nodeOps.parentNode(oldElm);
                    createElm(
                        vnode,
                        insertedVnodeQueue,
                        // extremely rare edge case: do not insert if old element is in a
                        // leaving transition. Only happens when combining transition +
                        // keep-alive + HOCs. (#4590)
                        oldElm._leaveCb ? null : parentElm$1,
                        nodeOps.nextSibling(oldElm)
                    );

                    if (vnode.parent) {
                        // component root element replaced.
                        // update parent placeholder node element, recursively
                        var ancestor = vnode.parent;
                        while (ancestor) {
                            ancestor.elm = vnode.elm;
                            ancestor = ancestor.parent;
                        }
                        if (isPatchable(vnode)) {
                            for (var i = 0; i < cbs.create.length; ++i) {
                                cbs.create[i](emptyNode, vnode.parent);
                            }
                        }
                    }

                    if (parentElm$1 !== null) {
                        removeVnodes(parentElm$1, [oldVnode], 0, 0);
                    } else if (isDef(oldVnode.tag)) {
                        invokeDestroyHook(oldVnode);
                    }
                }
            }

            invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
            return vnode.elm
        }
    }

    /*  */

    var directives = {
        create: updateDirectives,
        update: updateDirectives,
        destroy: function unbindDirectives(vnode) {
            updateDirectives(vnode, emptyNode);
        }
    };

    function updateDirectives(oldVnode, vnode) {
        if (oldVnode.data.directives || vnode.data.directives) {
            _update(oldVnode, vnode);
        }
    }

    function _update(oldVnode, vnode) {
        var isCreate = oldVnode === emptyNode;
        var isDestroy = vnode === emptyNode;
        var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
        var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

        var dirsWithInsert = [];
        var dirsWithPostpatch = [];

        var key, oldDir, dir;
        for (key in newDirs) {
            oldDir = oldDirs[key];
            dir = newDirs[key];
            if (!oldDir) {
                // new directive, bind
                callHook$1(dir, 'bind', vnode, oldVnode);
                if (dir.def && dir.def.inserted) {
                    dirsWithInsert.push(dir);
                }
            } else {
                // existing directive, update
                dir.oldValue = oldDir.value;
                callHook$1(dir, 'update', vnode, oldVnode);
                if (dir.def && dir.def.componentUpdated) {
                    dirsWithPostpatch.push(dir);
                }
            }
        }

        if (dirsWithInsert.length) {
            var callInsert = function () {
                for (var i = 0; i < dirsWithInsert.length; i++) {
                    callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
                }
            };
            if (isCreate) {
                mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', callInsert, 'dir-insert');
            } else {
                callInsert();
            }
        }

        if (dirsWithPostpatch.length) {
            mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'postpatch', function () {
                for (var i = 0; i < dirsWithPostpatch.length; i++) {
                    callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
                }
            }, 'dir-postpatch');
        }

        if (!isCreate) {
            for (key in oldDirs) {
                if (!newDirs[key]) {
                    // no longer present, unbind
                    callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
                }
            }
        }
    }

    var emptyModifiers = Object.create(null);

    function normalizeDirectives$1(
        dirs,
        vm
    ) {
        var res = Object.create(null);
        if (!dirs) {
            return res
        }
        var i, dir;
        for (i = 0; i < dirs.length; i++) {
            dir = dirs[i];
            if (!dir.modifiers) {
                dir.modifiers = emptyModifiers;
            }
            res[getRawDirName(dir)] = dir;
            dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
        }
        return res
    }

    function getRawDirName(dir) {
        return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
    }

    function callHook$1(dir, hook, vnode, oldVnode, isDestroy) {
        var fn = dir.def && dir.def[hook];
        if (fn) {
            fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
        }
    }

    var baseModules = [
        ref,
        directives
    ];

    /*  */

    function updateAttrs(oldVnode, vnode) {
        if (!oldVnode.data.attrs && !vnode.data.attrs) {
            return
        }
        var key, cur, old;
        var elm = vnode.elm;
        var oldAttrs = oldVnode.data.attrs || {};
        var attrs = vnode.data.attrs || {};
        // clone observed objects, as the user probably wants to mutate it
        if (attrs.__ob__) {
            attrs = vnode.data.attrs = extend({}, attrs);
        }

        for (key in attrs) {
            cur = attrs[key];
            old = oldAttrs[key];
            if (old !== cur) {
                setAttr(elm, key, cur);
            }
        }
        // #4391: in IE9, setting type can reset value for input[type=radio]
        /* istanbul ignore if */
        if (isIE9 && attrs.value !== oldAttrs.value) {
            setAttr(elm, 'value', attrs.value);
        }
        for (key in oldAttrs) {
            if (attrs[key] == null) {
                if (isXlink(key)) {
                    elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
                } else if (!isEnumeratedAttr(key)) {
                    elm.removeAttribute(key);
                }
            }
        }
    }

    function setAttr(el, key, value) {
        if (isBooleanAttr(key)) {
            // set attribute for blank value
            // e.g. <option disabled>Select one</option>
            if (isFalsyAttrValue(value)) {
                el.removeAttribute(key);
            } else {
                el.setAttribute(key, key);
            }
        } else if (isEnumeratedAttr(key)) {
            el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true');
        } else if (isXlink(key)) {
            if (isFalsyAttrValue(value)) {
                el.removeAttributeNS(xlinkNS, getXlinkProp(key));
            } else {
                el.setAttributeNS(xlinkNS, key, value);
            }
        } else {
            if (isFalsyAttrValue(value)) {
                el.removeAttribute(key);
            } else {
                el.setAttribute(key, value);
            }
        }
    }

    var attrs = {
        create: updateAttrs,
        update: updateAttrs
    };

    /*  */

    function updateClass(oldVnode, vnode) {
        var el = vnode.elm;
        var data = vnode.data;
        var oldData = oldVnode.data;
        if (!data.staticClass && !data.class &&
            (!oldData || (!oldData.staticClass && !oldData.class))) {
            return
        }

        var cls = genClassForVnode(vnode);

        // handle transition classes
        var transitionClass = el._transitionClasses;
        if (transitionClass) {
            cls = concat(cls, stringifyClass(transitionClass));
        }

        // set the class
        if (cls !== el._prevClass) {
            el.setAttribute('class', cls);
            el._prevClass = cls;
        }
    }

    var klass = {
        create: updateClass,
        update: updateClass
    };

    /*  */

    var target$1;

    function add$2(
        event,
        handler,
        once,
        capture
    ) {
        if (once) {
            var oldHandler = handler;
            var _target = target$1; // save current target element in closure
            handler = function (ev) {
                remove$3(event, handler, capture, _target);
                arguments.length === 1
                    ? oldHandler(ev)
                    : oldHandler.apply(null, arguments);
            };
        }
        target$1.addEventListener(event, handler, capture);
    }

    function remove$3(
        event,
        handler,
        capture,
        _target
    ) {
        (_target || target$1).removeEventListener(event, handler, capture);
    }

    function updateDOMListeners(oldVnode, vnode) {
        if (!oldVnode.data.on && !vnode.data.on) {
            return
        }
        var on = vnode.data.on || {};
        var oldOn = oldVnode.data.on || {};
        target$1 = vnode.elm;
        updateListeners(on, oldOn, add$2, remove$3, vnode.context);
    }

    var events = {
        create: updateDOMListeners,
        update: updateDOMListeners
    };

    /*  */

    function updateDOMProps(oldVnode, vnode) {
        if (!oldVnode.data.domProps && !vnode.data.domProps) {
            return
        }
        var key, cur;
        var elm = vnode.elm;
        var oldProps = oldVnode.data.domProps || {};
        var props = vnode.data.domProps || {};
        // clone observed objects, as the user probably wants to mutate it
        if (props.__ob__) {
            props = vnode.data.domProps = extend({}, props);
        }

        for (key in oldProps) {
            if (props[key] == null) {
                elm[key] = '';
            }
        }
        for (key in props) {
            cur = props[key];
            // ignore children if the node has textContent or innerHTML,
            // as these will throw away existing DOM nodes and cause removal errors
            // on subsequent patches (#3360)
            if (key === 'textContent' || key === 'innerHTML') {
                if (vnode.children) { vnode.children.length = 0; }
                if (cur === oldProps[key]) { continue }
            }

            if (key === 'value') {
                // store value as _value as well since
                // non-string values will be stringified
                elm._value = cur;
                // avoid resetting cursor position when value is the same
                var strCur = cur == null ? '' : String(cur);
                if (shouldUpdateValue(elm, vnode, strCur)) {
                    elm.value = strCur;
                }
            } else {
                elm[key] = cur;
            }
        }
    }

    // check platforms/web/util/attrs.js acceptValue


    function shouldUpdateValue(
        elm,
        vnode,
        checkVal
    ) {
        return (!elm.composing && (
            vnode.tag === 'option' ||
            isDirty(elm, checkVal) ||
            isInputChanged(vnode, checkVal)
        ))
    }

    function isDirty(elm, checkVal) {
        // return true when textbox (.number and .trim) loses focus and its value is not equal to the updated value
        return document.activeElement !== elm && elm.value !== checkVal
    }

    function isInputChanged(vnode, newVal) {
        var value = vnode.elm.value;
        var modifiers = vnode.elm._vModifiers; // injected by v-model runtime
        if ((modifiers && modifiers.number) || vnode.elm.type === 'number') {
            return toNumber(value) !== toNumber(newVal)
        }
        if (modifiers && modifiers.trim) {
            return value.trim() !== newVal.trim()
        }
        return value !== newVal
    }

    var domProps = {
        create: updateDOMProps,
        update: updateDOMProps
    };

    /*  */

    var parseStyleText = cached(function (cssText) {
        var res = {};
        var listDelimiter = /;(?![^(]*\))/g;
        var propertyDelimiter = /:(.+)/;
        cssText.split(listDelimiter).forEach(function (item) {
            if (item) {
                var tmp = item.split(propertyDelimiter);
                tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
            }
        });
        return res
    });

    // merge static and dynamic style data on the same vnode
    function normalizeStyleData(data) {
        var style = normalizeStyleBinding(data.style);
        // static style is pre-processed into an object during compilation
        // and is always a fresh object, so it's safe to merge into it
        return data.staticStyle
            ? extend(data.staticStyle, style)
            : style
    }

    // normalize possible array / string values into Object
    function normalizeStyleBinding(bindingStyle) {
        if (Array.isArray(bindingStyle)) {
            return toObject(bindingStyle)
        }
        if (typeof bindingStyle === 'string') {
            return parseStyleText(bindingStyle)
        }
        return bindingStyle
    }

    /**
     * parent component style should be after child's
     * so that parent component's style could override it
     */
    function getStyle(vnode, checkChild) {
        var res = {};
        var styleData;

        if (checkChild) {
            var childNode = vnode;
            while (childNode.componentInstance) {
                childNode = childNode.componentInstance._vnode;
                if (childNode.data && (styleData = normalizeStyleData(childNode.data))) {
                    extend(res, styleData);
                }
            }
        }

        if ((styleData = normalizeStyleData(vnode.data))) {
            extend(res, styleData);
        }

        var parentNode = vnode;
        while ((parentNode = parentNode.parent)) {
            if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
                extend(res, styleData);
            }
        }
        return res
    }

    /*  */

    var cssVarRE = /^--/;
    var importantRE = /\s*!important$/;
    var setProp = function (el, name, val) {
        /* istanbul ignore if */
        if (cssVarRE.test(name)) {
            el.style.setProperty(name, val);
        } else if (importantRE.test(val)) {
            el.style.setProperty(name, val.replace(importantRE, ''), 'important');
        } else {
            el.style[normalize(name)] = val;
        }
    };

    var prefixes = ['Webkit', 'Moz', 'ms'];

    var testEl;
    var normalize = cached(function (prop) {
        testEl = testEl || document.createElement('div');
        prop = camelize(prop);
        if (prop !== 'filter' && (prop in testEl.style)) {
            return prop
        }
        var upper = prop.charAt(0).toUpperCase() + prop.slice(1);
        for (var i = 0; i < prefixes.length; i++) {
            var prefixed = prefixes[i] + upper;
            if (prefixed in testEl.style) {
                return prefixed
            }
        }
    });

    function updateStyle(oldVnode, vnode) {
        var data = vnode.data;
        var oldData = oldVnode.data;

        if (!data.staticStyle && !data.style &&
            !oldData.staticStyle && !oldData.style) {
            return
        }

        var cur, name;
        var el = vnode.elm;
        var oldStaticStyle = oldVnode.data.staticStyle;
        var oldStyleBinding = oldVnode.data.style || {};

        // if static style exists, stylebinding already merged into it when doing normalizeStyleData
        var oldStyle = oldStaticStyle || oldStyleBinding;

        var style = normalizeStyleBinding(vnode.data.style) || {};

        vnode.data.style = style.__ob__ ? extend({}, style) : style;

        var newStyle = getStyle(vnode, true);

        for (name in oldStyle) {
            if (newStyle[name] == null) {
                setProp(el, name, '');
            }
        }
        for (name in newStyle) {
            cur = newStyle[name];
            if (cur !== oldStyle[name]) {
                // ie9 setting to null has no effect, must use empty string
                setProp(el, name, cur == null ? '' : cur);
            }
        }
    }

    var style = {
        create: updateStyle,
        update: updateStyle
    };

    /*  */

    /**
     * Add class with compatibility for SVG since classList is not supported on
     * SVG elements in IE
     */
    function addClass(el, cls) {
        /* istanbul ignore if */
        if (!cls || !cls.trim()) {
            return
        }

        /* istanbul ignore else */
        if (el.classList) {
            if (cls.indexOf(' ') > -1) {
                cls.split(/\s+/).forEach(function (c) { return el.classList.add(c); });
            } else {
                el.classList.add(cls);
            }
        } else {
            var cur = ' ' + el.getAttribute('class') + ' ';
            if (cur.indexOf(' ' + cls + ' ') < 0) {
                el.setAttribute('class', (cur + cls).trim());
            }
        }
    }

    /**
     * Remove class with compatibility for SVG since classList is not supported on
     * SVG elements in IE
     */
    function removeClass(el, cls) {
        /* istanbul ignore if */
        if (!cls || !cls.trim()) {
            return
        }

        /* istanbul ignore else */
        if (el.classList) {
            if (cls.indexOf(' ') > -1) {
                cls.split(/\s+/).forEach(function (c) { return el.classList.remove(c); });
            } else {
                el.classList.remove(cls);
            }
        } else {
            var cur = ' ' + el.getAttribute('class') + ' ';
            var tar = ' ' + cls + ' ';
            while (cur.indexOf(tar) >= 0) {
                cur = cur.replace(tar, ' ');
            }
            el.setAttribute('class', cur.trim());
        }
    }

    /*  */

    var hasTransition = inBrowser && !isIE9;
    var TRANSITION = 'transition';
    var ANIMATION = 'animation';

    // Transition property/event sniffing
    var transitionProp = 'transition';
    var transitionEndEvent = 'transitionend';
    var animationProp = 'animation';
    var animationEndEvent = 'animationend';
    if (hasTransition) {
        /* istanbul ignore if */
        if (window.ontransitionend === undefined &&
            window.onwebkittransitionend !== undefined) {
            transitionProp = 'WebkitTransition';
            transitionEndEvent = 'webkitTransitionEnd';
        }
        if (window.onanimationend === undefined &&
            window.onwebkitanimationend !== undefined) {
            animationProp = 'WebkitAnimation';
            animationEndEvent = 'webkitAnimationEnd';
        }
    }

    // binding to window is necessary to make hot reload work in IE in strict mode
    var raf = inBrowser && window.requestAnimationFrame
        ? window.requestAnimationFrame.bind(window)
        : setTimeout;

    function nextFrame(fn) {
        raf(function () {
            raf(fn);
        });
    }

    function addTransitionClass(el, cls) {
        (el._transitionClasses || (el._transitionClasses = [])).push(cls);
        addClass(el, cls);
    }

    function removeTransitionClass(el, cls) {
        if (el._transitionClasses) {
            remove$1(el._transitionClasses, cls);
        }
        removeClass(el, cls);
    }

    function whenTransitionEnds(
        el,
        expectedType,
        cb
    ) {
        var ref = getTransitionInfo(el, expectedType);
        var type = ref.type;
        var timeout = ref.timeout;
        var propCount = ref.propCount;
        if (!type) { return cb() }
        var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
        var ended = 0;
        var end = function () {
            el.removeEventListener(event, onEnd);
            cb();
        };
        var onEnd = function (e) {
            if (e.target === el) {
                if (++ended >= propCount) {
                    end();
                }
            }
        };
        setTimeout(function () {
            if (ended < propCount) {
                end();
            }
        }, timeout + 1);
        el.addEventListener(event, onEnd);
    }

    var transformRE = /\b(transform|all)(,|$)/;

    function getTransitionInfo(el, expectedType) {
        var styles = window.getComputedStyle(el);
        var transitioneDelays = styles[transitionProp + 'Delay'].split(', ');
        var transitionDurations = styles[transitionProp + 'Duration'].split(', ');
        var transitionTimeout = getTimeout(transitioneDelays, transitionDurations);
        var animationDelays = styles[animationProp + 'Delay'].split(', ');
        var animationDurations = styles[animationProp + 'Duration'].split(', ');
        var animationTimeout = getTimeout(animationDelays, animationDurations);

        var type;
        var timeout = 0;
        var propCount = 0;
        /* istanbul ignore if */
        if (expectedType === TRANSITION) {
            if (transitionTimeout > 0) {
                type = TRANSITION;
                timeout = transitionTimeout;
                propCount = transitionDurations.length;
            }
        } else if (expectedType === ANIMATION) {
            if (animationTimeout > 0) {
                type = ANIMATION;
                timeout = animationTimeout;
                propCount = animationDurations.length;
            }
        } else {
            timeout = Math.max(transitionTimeout, animationTimeout);
            type = timeout > 0
                ? transitionTimeout > animationTimeout
                    ? TRANSITION
                    : ANIMATION
                : null;
            propCount = type
                ? type === TRANSITION
                    ? transitionDurations.length
                    : animationDurations.length
                : 0;
        }
        var hasTransform =
            type === TRANSITION &&
            transformRE.test(styles[transitionProp + 'Property']);
        return {
            type: type,
            timeout: timeout,
            propCount: propCount,
            hasTransform: hasTransform
        }
    }

    function getTimeout(delays, durations) {
        /* istanbul ignore next */
        while (delays.length < durations.length) {
            delays = delays.concat(delays);
        }

        return Math.max.apply(null, durations.map(function (d, i) {
            return toMs(d) + toMs(delays[i])
        }))
    }

    function toMs(s) {
        return Number(s.slice(0, -1)) * 1000
    }

    /*  */

    function enter(vnode, toggleDisplay) {
        var el = vnode.elm;

        // call leave callback now
        if (el._leaveCb) {
            el._leaveCb.cancelled = true;
            el._leaveCb();
        }

        var data = resolveTransition(vnode.data.transition);
        if (!data) {
            return
        }

        /* istanbul ignore if */
        if (el._enterCb || el.nodeType !== 1) {
            return
        }

        var css = data.css;
        var type = data.type;
        var enterClass = data.enterClass;
        var enterToClass = data.enterToClass;
        var enterActiveClass = data.enterActiveClass;
        var appearClass = data.appearClass;
        var appearToClass = data.appearToClass;
        var appearActiveClass = data.appearActiveClass;
        var beforeEnter = data.beforeEnter;
        var enter = data.enter;
        var afterEnter = data.afterEnter;
        var enterCancelled = data.enterCancelled;
        var beforeAppear = data.beforeAppear;
        var appear = data.appear;
        var afterAppear = data.afterAppear;
        var appearCancelled = data.appearCancelled;

        // activeInstance will always be the <transition> component managing this
        // transition. One edge case to check is when the <transition> is placed
        // as the root node of a child component. In that case we need to check
        // <transition>'s parent for appear check.
        var context = activeInstance;
        var transitionNode = activeInstance.$vnode;
        while (transitionNode && transitionNode.parent) {
            transitionNode = transitionNode.parent;
            context = transitionNode.context;
        }

        var isAppear = !context._isMounted || !vnode.isRootInsert;

        if (isAppear && !appear && appear !== '') {
            return
        }

        var startClass = isAppear ? appearClass : enterClass;
        var activeClass = isAppear ? appearActiveClass : enterActiveClass;
        var toClass = isAppear ? appearToClass : enterToClass;
        var beforeEnterHook = isAppear ? (beforeAppear || beforeEnter) : beforeEnter;
        var enterHook = isAppear ? (typeof appear === 'function' ? appear : enter) : enter;
        var afterEnterHook = isAppear ? (afterAppear || afterEnter) : afterEnter;
        var enterCancelledHook = isAppear ? (appearCancelled || enterCancelled) : enterCancelled;

        var expectsCSS = css !== false && !isIE9;
        var userWantsControl =
            enterHook &&
            // enterHook may be a bound method which exposes
            // the length of original fn as _length
            (enterHook._length || enterHook.length) > 1;

        var cb = el._enterCb = once(function () {
            if (expectsCSS) {
                removeTransitionClass(el, toClass);
                removeTransitionClass(el, activeClass);
            }
            if (cb.cancelled) {
                if (expectsCSS) {
                    removeTransitionClass(el, startClass);
                }
                enterCancelledHook && enterCancelledHook(el);
            } else {
                afterEnterHook && afterEnterHook(el);
            }
            el._enterCb = null;
        });

        if (!vnode.data.show) {
            // remove pending leave element on enter by injecting an insert hook
            mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', function () {
                var parent = el.parentNode;
                var pendingNode = parent && parent._pending && parent._pending[vnode.key];
                if (pendingNode &&
                    pendingNode.tag === vnode.tag &&
                    pendingNode.elm._leaveCb) {
                    pendingNode.elm._leaveCb();
                }
                enterHook && enterHook(el, cb);
            }, 'transition-insert');
        }

        // start enter transition
        beforeEnterHook && beforeEnterHook(el);
        if (expectsCSS) {
            addTransitionClass(el, startClass);
            addTransitionClass(el, activeClass);
            nextFrame(function () {
                addTransitionClass(el, toClass);
                removeTransitionClass(el, startClass);
                if (!cb.cancelled && !userWantsControl) {
                    whenTransitionEnds(el, type, cb);
                }
            });
        }

        if (vnode.data.show) {
            toggleDisplay && toggleDisplay();
            enterHook && enterHook(el, cb);
        }

        if (!expectsCSS && !userWantsControl) {
            cb();
        }
    }

    function leave(vnode, rm) {
        var el = vnode.elm;

        // call enter callback now
        if (el._enterCb) {
            el._enterCb.cancelled = true;
            el._enterCb();
        }

        var data = resolveTransition(vnode.data.transition);
        if (!data) {
            return rm()
        }

        /* istanbul ignore if */
        if (el._leaveCb || el.nodeType !== 1) {
            return
        }

        var css = data.css;
        var type = data.type;
        var leaveClass = data.leaveClass;
        var leaveToClass = data.leaveToClass;
        var leaveActiveClass = data.leaveActiveClass;
        var beforeLeave = data.beforeLeave;
        var leave = data.leave;
        var afterLeave = data.afterLeave;
        var leaveCancelled = data.leaveCancelled;
        var delayLeave = data.delayLeave;

        var expectsCSS = css !== false && !isIE9;
        var userWantsControl =
            leave &&
            // leave hook may be a bound method which exposes
            // the length of original fn as _length
            (leave._length || leave.length) > 1;

        var cb = el._leaveCb = once(function () {
            if (el.parentNode && el.parentNode._pending) {
                el.parentNode._pending[vnode.key] = null;
            }
            if (expectsCSS) {
                removeTransitionClass(el, leaveToClass);
                removeTransitionClass(el, leaveActiveClass);
            }
            if (cb.cancelled) {
                if (expectsCSS) {
                    removeTransitionClass(el, leaveClass);
                }
                leaveCancelled && leaveCancelled(el);
            } else {
                rm();
                afterLeave && afterLeave(el);
            }
            el._leaveCb = null;
        });

        if (delayLeave) {
            delayLeave(performLeave);
        } else {
            performLeave();
        }

        function performLeave() {
            // the delayed leave may have already been cancelled
            if (cb.cancelled) {
                return
            }
            // record leaving element
            if (!vnode.data.show) {
                (el.parentNode._pending || (el.parentNode._pending = {}))[vnode.key] = vnode;
            }
            beforeLeave && beforeLeave(el);
            if (expectsCSS) {
                addTransitionClass(el, leaveClass);
                addTransitionClass(el, leaveActiveClass);
                nextFrame(function () {
                    addTransitionClass(el, leaveToClass);
                    removeTransitionClass(el, leaveClass);
                    if (!cb.cancelled && !userWantsControl) {
                        whenTransitionEnds(el, type, cb);
                    }
                });
            }
            leave && leave(el, cb);
            if (!expectsCSS && !userWantsControl) {
                cb();
            }
        }
    }

    function resolveTransition(def$$1) {
        if (!def$$1) {
            return
        }
        /* istanbul ignore else */
        if (typeof def$$1 === 'object') {
            var res = {};
            if (def$$1.css !== false) {
                extend(res, autoCssTransition(def$$1.name || 'v'));
            }
            extend(res, def$$1);
            return res
        } else if (typeof def$$1 === 'string') {
            return autoCssTransition(def$$1)
        }
    }

    var autoCssTransition = cached(function (name) {
        return {
            enterClass: (name + "-enter"),
            leaveClass: (name + "-leave"),
            appearClass: (name + "-enter"),
            enterToClass: (name + "-enter-to"),
            leaveToClass: (name + "-leave-to"),
            appearToClass: (name + "-enter-to"),
            enterActiveClass: (name + "-enter-active"),
            leaveActiveClass: (name + "-leave-active"),
            appearActiveClass: (name + "-enter-active")
        }
    });

    function once(fn) {
        var called = false;
        return function () {
            if (!called) {
                called = true;
                fn();
            }
        }
    }

    function _enter(_, vnode) {
        if (!vnode.data.show) {
            enter(vnode);
        }
    }

    var transition = inBrowser ? {
        create: _enter,
        activate: _enter,
        remove: function remove(vnode, rm) {
            /* istanbul ignore else */
            if (!vnode.data.show) {
                leave(vnode, rm);
            } else {
                rm();
            }
        }
    } : {};

    var platformModules = [
        attrs,
        klass,
        events,
        domProps,
        style,
        transition
    ];

    /*  */

    // the directive module should be applied last, after all
    // built-in modules have been applied.
    var modules = platformModules.concat(baseModules);

    var patch$1 = createPatchFunction({ nodeOps: nodeOps, modules: modules });

    /**
     * Not type checking this file because flow doesn't like attaching
     * properties to Elements.
     */

    var modelableTagRE = /^input|select|textarea|vue-component-[0-9]+(-[0-9a-zA-Z_-]*)?$/;

    /* istanbul ignore if */
    if (isIE9) {
        // http://www.matts411.com/post/internet-explorer-9-oninput/
        document.addEventListener('selectionchange', function () {
            var el = document.activeElement;
            if (el && el.vmodel) {
                trigger(el, 'input');
            }
        });
    }

    var model = {
        inserted: function inserted(el, binding, vnode) {
            {
                if (!modelableTagRE.test(vnode.tag)) {
                    warn(
                        "v-model is not supported on element type: <" + (vnode.tag) + ">. " +
                        'If you are working with contenteditable, it\'s recommended to ' +
                        'wrap a library dedicated for that purpose inside a custom component.',
                        vnode.context
                    );
                }
            }
            if (vnode.tag === 'select') {
                var cb = function () {
                    setSelected(el, binding, vnode.context);
                };
                cb();
                /* istanbul ignore if */
                if (isIE || isEdge) {
                    setTimeout(cb, 0);
                }
            } else if (vnode.tag === 'textarea' || el.type === 'text') {
                el._vModifiers = binding.modifiers;
                if (!binding.modifiers.lazy) {
                    if (!isAndroid) {
                        el.addEventListener('compositionstart', onCompositionStart);
                        el.addEventListener('compositionend', onCompositionEnd);
                    }
                    /* istanbul ignore if */
                    if (isIE9) {
                        el.vmodel = true;
                    }
                }
            }
        },
        componentUpdated: function componentUpdated(el, binding, vnode) {
            if (vnode.tag === 'select') {
                setSelected(el, binding, vnode.context);
                // in case the options rendered by v-for have changed,
                // it's possible that the value is out-of-sync with the rendered options.
                // detect such cases and filter out values that no longer has a matching
                // option in the DOM.
                var needReset = el.multiple
                    ? binding.value.some(function (v) { return hasNoMatchingOption(v, el.options); })
                    : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, el.options);
                if (needReset) {
                    trigger(el, 'change');
                }
            }
        }
    };

    function setSelected(el, binding, vm) {
        var value = binding.value;
        var isMultiple = el.multiple;
        if (isMultiple && !Array.isArray(value)) {
            "development" !== 'production' && warn(
                "<select multiple v-model=\"" + (binding.expression) + "\"> " +
                "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
                vm
            );
            return
        }
        var selected, option;
        for (var i = 0, l = el.options.length; i < l; i++) {
            option = el.options[i];
            if (isMultiple) {
                selected = looseIndexOf(value, getValue(option)) > -1;
                if (option.selected !== selected) {
                    option.selected = selected;
                }
            } else {
                if (looseEqual(getValue(option), value)) {
                    if (el.selectedIndex !== i) {
                        el.selectedIndex = i;
                    }
                    return
                }
            }
        }
        if (!isMultiple) {
            el.selectedIndex = -1;
        }
    }

    function hasNoMatchingOption(value, options) {
        for (var i = 0, l = options.length; i < l; i++) {
            if (looseEqual(getValue(options[i]), value)) {
                return false
            }
        }
        return true
    }

    function getValue(option) {
        return '_value' in option
            ? option._value
            : option.value
    }

    function onCompositionStart(e) {
        e.target.composing = true;
    }

    function onCompositionEnd(e) {
        e.target.composing = false;
        trigger(e.target, 'input');
    }

    function trigger(el, type) {
        var e = document.createEvent('HTMLEvents');
        e.initEvent(type, true, true);
        el.dispatchEvent(e);
    }

    /*  */

    // recursively search for possible transition defined inside the component root
    function locateNode(vnode) {
        return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
            ? locateNode(vnode.componentInstance._vnode)
            : vnode
    }

    var show = {
        bind: function bind(el, ref, vnode) {
            var value = ref.value;

            vnode = locateNode(vnode);
            var transition = vnode.data && vnode.data.transition;
            var originalDisplay = el.__vOriginalDisplay =
                el.style.display === 'none' ? '' : el.style.display;
            if (value && transition && !isIE9) {
                vnode.data.show = true;
                enter(vnode, function () {
                    el.style.display = originalDisplay;
                });
            } else {
                el.style.display = value ? originalDisplay : 'none';
            }
        },

        update: function update(el, ref, vnode) {
            var value = ref.value;
            var oldValue = ref.oldValue;

            /* istanbul ignore if */
            if (value === oldValue) { return }
            vnode = locateNode(vnode);
            var transition = vnode.data && vnode.data.transition;
            if (transition && !isIE9) {
                vnode.data.show = true;
                if (value) {
                    enter(vnode, function () {
                        el.style.display = el.__vOriginalDisplay;
                    });
                } else {
                    leave(vnode, function () {
                        el.style.display = 'none';
                    });
                }
            } else {
                el.style.display = value ? el.__vOriginalDisplay : 'none';
            }
        },

        unbind: function unbind(
            el,
            binding,
            vnode,
            oldVnode,
            isDestroy
        ) {
            if (!isDestroy) {
                el.style.display = el.__vOriginalDisplay;
            }
        }
    };

    var platformDirectives = {
        model: model,
        show: show
    };

    /*  */

    // Provides transition support for a single element/component.
    // supports transition mode (out-in / in-out)

    var transitionProps = {
        name: String,
        appear: Boolean,
        css: Boolean,
        mode: String,
        type: String,
        enterClass: String,
        leaveClass: String,
        enterToClass: String,
        leaveToClass: String,
        enterActiveClass: String,
        leaveActiveClass: String,
        appearClass: String,
        appearActiveClass: String,
        appearToClass: String
    };

    // in case the child is also an abstract component, e.g. <keep-alive>
    // we want to recursively retrieve the real component to be rendered
    function getRealChild(vnode) {
        var compOptions = vnode && vnode.componentOptions;
        if (compOptions && compOptions.Ctor.options.abstract) {
            return getRealChild(getFirstComponentChild(compOptions.children))
        } else {
            return vnode
        }
    }

    function extractTransitionData(comp) {
        var data = {};
        var options = comp.$options;
        // props
        for (var key in options.propsData) {
            data[key] = comp[key];
        }
        // events.
        // extract listeners and pass them directly to the transition methods
        var listeners = options._parentListeners;
        for (var key$1 in listeners) {
            data[camelize(key$1)] = listeners[key$1].fn;
        }
        return data
    }

    function placeholder(h, rawChild) {
        return /\d-keep-alive$/.test(rawChild.tag)
            ? h('keep-alive')
            : null
    }

    function hasParentTransition(vnode) {
        while ((vnode = vnode.parent)) {
            if (vnode.data.transition) {
                return true
            }
        }
    }

    function isSameChild(child, oldChild) {
        return oldChild.key === child.key && oldChild.tag === child.tag
    }

    var Transition = {
        name: 'transition',
        props: transitionProps,
        abstract: true,

        render: function render(h) {
            var this$1 = this;

            var children = this.$slots.default;
            if (!children) {
                return
            }

            // filter out text nodes (possible whitespaces)
            children = children.filter(function (c) { return c.tag; });
            /* istanbul ignore if */
            if (!children.length) {
                return
            }

            // warn multiple elements
            if ("development" !== 'production' && children.length > 1) {
                warn(
                    '<transition> can only be used on a single element. Use ' +
                    '<transition-group> for lists.',
                    this.$parent
                );
            }

            var mode = this.mode;

            // warn invalid mode
            if ("development" !== 'production' &&
                mode && mode !== 'in-out' && mode !== 'out-in') {
                warn(
                    'invalid <transition> mode: ' + mode,
                    this.$parent
                );
            }

            var rawChild = children[0];

            // if this is a component root node and the component's
            // parent container node also has transition, skip.
            if (hasParentTransition(this.$vnode)) {
                return rawChild
            }

            // apply transition data to child
            // use getRealChild() to ignore abstract components e.g. keep-alive
            var child = getRealChild(rawChild);
            /* istanbul ignore if */
            if (!child) {
                return rawChild
            }

            if (this._leaving) {
                return placeholder(h, rawChild)
            }

            // ensure a key that is unique to the vnode type and to this transition
            // component instance. This key will be used to remove pending leaving nodes
            // during entering.
            var id = "__transition-" + (this._uid) + "-";
            var key = child.key = child.key == null
                ? id + child.tag
                : isPrimitive(child.key)
                    ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
                    : child.key;
            var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
            var oldRawChild = this._vnode;
            var oldChild = getRealChild(oldRawChild);

            // mark v-show
            // so that the transition module can hand over the control to the directive
            if (child.data.directives && child.data.directives.some(function (d) { return d.name === 'show'; })) {
                child.data.show = true;
            }

            if (oldChild && oldChild.data && !isSameChild(child, oldChild)) {
                // replace old child transition data with fresh one
                // important for dynamic transitions!
                var oldData = oldChild && (oldChild.data.transition = extend({}, data));
                // handle transition mode
                if (mode === 'out-in') {
                    // return placeholder node and queue update when leave finishes
                    this._leaving = true;
                    mergeVNodeHook(oldData, 'afterLeave', function () {
                        this$1._leaving = false;
                        this$1.$forceUpdate();
                    }, key);
                    return placeholder(h, rawChild)
                } else if (mode === 'in-out') {
                    var delayedLeave;
                    var performLeave = function () { delayedLeave(); };
                    mergeVNodeHook(data, 'afterEnter', performLeave, key);
                    mergeVNodeHook(data, 'enterCancelled', performLeave, key);
                    mergeVNodeHook(oldData, 'delayLeave', function (leave) {
                        delayedLeave = leave;
                    }, key);
                }
            }

            return rawChild
        }
    };

    /*  */

    // Provides transition support for list items.
    // supports move transitions using the FLIP technique.

    // Because the vdom's children update algorithm is "unstable" - i.e.
    // it doesn't guarantee the relative positioning of removed elements,
    // we force transition-group to update its children into two passes:
    // in the first pass, we remove all nodes that need to be removed,
    // triggering their leaving transition; in the second pass, we insert/move
    // into the final disired state. This way in the second pass removed
    // nodes will remain where they should be.

    var props = extend({
        tag: String,
        moveClass: String
    }, transitionProps);

    delete props.mode;

    var TransitionGroup = {
        props: props,

        render: function render(h) {
            var tag = this.tag || this.$vnode.data.tag || 'span';
            var map = Object.create(null);
            var prevChildren = this.prevChildren = this.children;
            var rawChildren = this.$slots.default || [];
            var children = this.children = [];
            var transitionData = extractTransitionData(this);

            for (var i = 0; i < rawChildren.length; i++) {
                var c = rawChildren[i];
                if (c.tag) {
                    if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
                        children.push(c);
                        map[c.key] = c
                            ; (c.data || (c.data = {})).transition = transitionData;
                    } else {
                        var opts = c.componentOptions;
                        var name = opts
                            ? (opts.Ctor.options.name || opts.tag)
                            : c.tag;
                        warn(("<transition-group> children must be keyed: <" + name + ">"));
                    }
                }
            }

            if (prevChildren) {
                var kept = [];
                var removed = [];
                for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
                    var c$1 = prevChildren[i$1];
                    c$1.data.transition = transitionData;
                    c$1.data.pos = c$1.elm.getBoundingClientRect();
                    if (map[c$1.key]) {
                        kept.push(c$1);
                    } else {
                        removed.push(c$1);
                    }
                }
                this.kept = h(tag, null, kept);
                this.removed = removed;
            }

            return h(tag, null, children)
        },

        beforeUpdate: function beforeUpdate() {
            // force removing pass
            this.__patch__(
                this._vnode,
                this.kept,
                false, // hydrating
                true // removeOnly (!important, avoids unnecessary moves)
            );
            this._vnode = this.kept;
        },

        updated: function updated() {
            var children = this.prevChildren;
            var moveClass = this.moveClass || ((this.name || 'v') + '-move');
            if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
                return
            }

            // we divide the work into three loops to avoid mixing DOM reads and writes
            // in each iteration - which helps prevent layout thrashing.
            children.forEach(callPendingCbs);
            children.forEach(recordPosition);
            children.forEach(applyTranslation);

            // force reflow to put everything in position
            var f = document.body.offsetHeight; // eslint-disable-line

            children.forEach(function (c) {
                if (c.data.moved) {
                    var el = c.elm;
                    var s = el.style;
                    addTransitionClass(el, moveClass);
                    s.transform = s.WebkitTransform = s.transitionDuration = '';
                    el.addEventListener(transitionEndEvent, el._moveCb = function cb(e) {
                        if (!e || /transform$/.test(e.propertyName)) {
                            el.removeEventListener(transitionEndEvent, cb);
                            el._moveCb = null;
                            removeTransitionClass(el, moveClass);
                        }
                    });
                }
            });
        },

        methods: {
            hasMove: function hasMove(el, moveClass) {
                /* istanbul ignore if */
                if (!hasTransition) {
                    return false
                }
                if (this._hasMove != null) {
                    return this._hasMove
                }
                addTransitionClass(el, moveClass);
                var info = getTransitionInfo(el);
                removeTransitionClass(el, moveClass);
                return (this._hasMove = info.hasTransform)
            }
        }
    };

    function callPendingCbs(c) {
        /* istanbul ignore if */
        if (c.elm._moveCb) {
            c.elm._moveCb();
        }
        /* istanbul ignore if */
        if (c.elm._enterCb) {
            c.elm._enterCb();
        }
    }

    function recordPosition(c) {
        c.data.newPos = c.elm.getBoundingClientRect();
    }

    function applyTranslation(c) {
        var oldPos = c.data.pos;
        var newPos = c.data.newPos;
        var dx = oldPos.left - newPos.left;
        var dy = oldPos.top - newPos.top;
        if (dx || dy) {
            c.data.moved = true;
            var s = c.elm.style;
            s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
            s.transitionDuration = '0s';
        }
    }

    var platformComponents = {
        Transition: Transition,
        TransitionGroup: TransitionGroup
    };

    /*  */

    // install platform specific utils
    Vue$3.config.isUnknownElement = isUnknownElement;
    Vue$3.config.isReservedTag = isReservedTag;
    Vue$3.config.getTagNamespace = getTagNamespace;
    Vue$3.config.mustUseProp = mustUseProp;

    // install platform runtime directives & components
    extend(Vue$3.options.directives, platformDirectives);
    extend(Vue$3.options.components, platformComponents);

    // install platform patch function
    Vue$3.prototype.__patch__ = inBrowser ? patch$1 : noop;

    // wrap mount
    Vue$3.prototype.$mount = function (
        el,
        hydrating
    ) {
        el = el && inBrowser ? query(el) : undefined;
        return this._mount(el, hydrating)
    };

    if ("development" !== 'production' &&
        inBrowser && typeof console !== 'undefined') {
        console[console.info ? 'info' : 'log'](
            "You are running Vue in development mode.\n" +
            "Make sure to turn on production mode when deploying for production.\n" +
            "See more tips at https://vuejs.org/guide/deployment.html"
        );
    }

    // devtools global hook
    /* istanbul ignore next */
    setTimeout(function () {
        if (config.devtools) {
            if (devtools) {
                devtools.emit('init', Vue$3);
            } else if (
                "development" !== 'production' &&
                inBrowser && !isEdge && /Chrome\/\d+/.test(window.navigator.userAgent)
            ) {
                console[console.info ? 'info' : 'log'](
                    'Download the Vue Devtools extension for a better development experience:\n' +
                    'https://github.com/vuejs/vue-devtools'
                );
            }
        }
    }, 0);

    /*  */

    // check whether current browser encodes a char inside attribute values
    function shouldDecode(content, encoded) {
        var div = document.createElement('div');
        div.innerHTML = "<div a=\"" + content + "\">";
        return div.innerHTML.indexOf(encoded) > 0
    }

    // #3663
    // IE encodes newlines inside attribute values while other browsers don't
    var shouldDecodeNewlines = inBrowser ? shouldDecode('\n', '&#10;') : false;

    /*  */

    var decoder;

    function decode(html) {
        decoder = decoder || document.createElement('div');
        decoder.innerHTML = html;
        return decoder.textContent
    }

    /*  */

    var isUnaryTag = makeMap(
        'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
        'link,meta,param,source,track,wbr',
        true
    );

    // Elements that you can, intentionally, leave open
    // (and which close themselves)
    var canBeLeftOpenTag = makeMap(
        'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source',
        true
    );

    // HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
    // Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
    var isNonPhrasingTag = makeMap(
        'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
        'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
        'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
        'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
        'title,tr,track',
        true
    );

    /**
     * Not type-checking this file because it's mostly vendor code.
     */

    /*!
     * HTML Parser By John Resig (ejohn.org)
     * Modified by Juriy "kangax" Zaytsev
     * Original code by Erik Arvidsson, Mozilla Public License
     * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
     */

    // Regular Expressions for parsing tags and attributes
    var singleAttrIdentifier = /([^\s"'<>/=]+)/;
    var singleAttrAssign = /(?:=)/;
    var singleAttrValues = [
        // attr value double quotes
        /"([^"]*)"+/.source,
        // attr value, single quotes
        /'([^']*)'+/.source,
        // attr value, no quotes
        /([^\s"'=<>`]+)/.source
    ];
    var attribute = new RegExp(
        '^\\s*' + singleAttrIdentifier.source +
        '(?:\\s*(' + singleAttrAssign.source + ')' +
        '\\s*(?:' + singleAttrValues.join('|') + '))?'
    );

    // could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
    // but for Vue templates we can enforce a simple charset
    var ncname = '[a-zA-Z_][\\w\\-\\.]*';
    var qnameCapture = '((?:' + ncname + '\\:)?' + ncname + ')';
    var startTagOpen = new RegExp('^<' + qnameCapture);
    var startTagClose = /^\s*(\/?)>/;
    var endTag = new RegExp('^<\\/' + qnameCapture + '[^>]*>');
    var doctype = /^<!DOCTYPE [^>]+>/i;
    var comment = /^<!--/;
    var conditionalComment = /^<!\[/;

    var IS_REGEX_CAPTURING_BROKEN = false;
    'x'.replace(/x(.)?/g, function (m, g) {
        IS_REGEX_CAPTURING_BROKEN = g === '';
    });

    // Special Elements (can contain anything)
    var isScriptOrStyle = makeMap('script,style', true);
    var reCache = {};

    var ltRE = /&lt;/g;
    var gtRE = /&gt;/g;
    var nlRE = /&#10;/g;
    var ampRE = /&amp;/g;
    var quoteRE = /&quot;/g;

    function decodeAttr(value, shouldDecodeNewlines) {
        if (shouldDecodeNewlines) {
            value = value.replace(nlRE, '\n');
        }
        return value
            .replace(ltRE, '<')
            .replace(gtRE, '>')
            .replace(ampRE, '&')
            .replace(quoteRE, '"')
    }

    function parseHTML(html, options) {
        var stack = [];
        var expectHTML = options.expectHTML;
        var isUnaryTag$$1 = options.isUnaryTag || no;
        var index = 0;
        var last, lastTag;
        while (html) {
            last = html;
            // Make sure we're not in a script or style element
            if (!lastTag || !isScriptOrStyle(lastTag)) {
                var textEnd = html.indexOf('<');
                if (textEnd === 0) {
                    // Comment:
                    if (comment.test(html)) {
                        var commentEnd = html.indexOf('-->');

                        if (commentEnd >= 0) {
                            advance(commentEnd + 3);
                            continue
                        }
                    }

                    // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
                    if (conditionalComment.test(html)) {
                        var conditionalEnd = html.indexOf(']>');

                        if (conditionalEnd >= 0) {
                            advance(conditionalEnd + 2);
                            continue
                        }
                    }

                    // Doctype:
                    var doctypeMatch = html.match(doctype);
                    if (doctypeMatch) {
                        advance(doctypeMatch[0].length);
                        continue
                    }

                    // End tag:
                    var endTagMatch = html.match(endTag);
                    if (endTagMatch) {
                        var curIndex = index;
                        advance(endTagMatch[0].length);
                        parseEndTag(endTagMatch[1], curIndex, index);
                        continue
                    }

                    // Start tag:
                    var startTagMatch = parseStartTag();
                    if (startTagMatch) {
                        handleStartTag(startTagMatch);
                        continue
                    }
                }

                var text = (void 0), rest$1 = (void 0), next = (void 0);
                if (textEnd > 0) {
                    rest$1 = html.slice(textEnd);
                    while (
                        !endTag.test(rest$1) &&
                        !startTagOpen.test(rest$1) &&
                        !comment.test(rest$1) &&
                        !conditionalComment.test(rest$1)
                    ) {
                        // < in plain text, be forgiving and treat it as text
                        next = rest$1.indexOf('<', 1);
                        if (next < 0) { break }
                        textEnd += next;
                        rest$1 = html.slice(textEnd);
                    }
                    text = html.substring(0, textEnd);
                    advance(textEnd);
                }

                if (textEnd < 0) {
                    text = html;
                    html = '';
                }

                if (options.chars && text) {
                    options.chars(text);
                }
            } else {
                var stackedTag = lastTag.toLowerCase();
                var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
                var endTagLength = 0;
                var rest = html.replace(reStackedTag, function (all, text, endTag) {
                    endTagLength = endTag.length;
                    if (stackedTag !== 'script' && stackedTag !== 'style' && stackedTag !== 'noscript') {
                        text = text
                            .replace(/<!--([\s\S]*?)-->/g, '$1')
                            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
                    }
                    if (options.chars) {
                        options.chars(text);
                    }
                    return ''
                });
                index += html.length - rest.length;
                html = rest;
                parseEndTag(stackedTag, index - endTagLength, index);
            }

            if (html === last && options.chars) {
                options.chars(html);
                break
            }
        }

        // Clean up any remaining tags
        parseEndTag();

        function advance(n) {
            index += n;
            html = html.substring(n);
        }

        function parseStartTag() {
            var start = html.match(startTagOpen);
            if (start) {
                var match = {
                    tagName: start[1],
                    attrs: [],
                    start: index
                };
                advance(start[0].length);
                var end, attr;
                while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                    advance(attr[0].length);
                    match.attrs.push(attr);
                }
                if (end) {
                    match.unarySlash = end[1];
                    advance(end[0].length);
                    match.end = index;
                    return match
                }
            }
        }

        function handleStartTag(match) {
            var tagName = match.tagName;
            var unarySlash = match.unarySlash;

            if (expectHTML) {
                if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
                    parseEndTag(lastTag);
                }
                if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
                    parseEndTag(tagName);
                }
            }

            var unary = isUnaryTag$$1(tagName) || tagName === 'html' && lastTag === 'head' || !!unarySlash;

            var l = match.attrs.length;
            var attrs = new Array(l);
            for (var i = 0; i < l; i++) {
                var args = match.attrs[i];
                // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
                if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
                    if (args[3] === '') { delete args[3]; }
                    if (args[4] === '') { delete args[4]; }
                    if (args[5] === '') { delete args[5]; }
                }
                var value = args[3] || args[4] || args[5] || '';
                attrs[i] = {
                    name: args[1],
                    value: decodeAttr(
                        value,
                        options.shouldDecodeNewlines
                    )
                };
            }

            if (!unary) {
                stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs });
                lastTag = tagName;
                unarySlash = '';
            }

            if (options.start) {
                options.start(tagName, attrs, unary, match.start, match.end);
            }
        }

        function parseEndTag(tagName, start, end) {
            var pos, lowerCasedTagName;
            if (start == null) { start = index; }
            if (end == null) { end = index; }

            if (tagName) {
                lowerCasedTagName = tagName.toLowerCase();
            }

            // Find the closest opened tag of the same type
            if (tagName) {
                for (pos = stack.length - 1; pos >= 0; pos--) {
                    if (stack[pos].lowerCasedTag === lowerCasedTagName) {
                        break
                    }
                }
            } else {
                // If no tag name is provided, clean shop
                pos = 0;
            }

            if (pos >= 0) {
                // Close all the open elements, up the stack
                for (var i = stack.length - 1; i >= pos; i--) {
                    if (options.end) {
                        options.end(stack[i].tag, start, end);
                    }
                }

                // Remove the open elements from the stack
                stack.length = pos;
                lastTag = pos && stack[pos - 1].tag;
            } else if (lowerCasedTagName === 'br') {
                if (options.start) {
                    options.start(tagName, [], true, start, end);
                }
            } else if (lowerCasedTagName === 'p') {
                if (options.start) {
                    options.start(tagName, [], false, start, end);
                }
                if (options.end) {
                    options.end(tagName, start, end);
                }
            }
        }
    }

    /*  */

    function parseFilters(exp) {
        var inSingle = false;
        var inDouble = false;
        var inTemplateString = false;
        var inRegex = false;
        var curly = 0;
        var square = 0;
        var paren = 0;
        var lastFilterIndex = 0;
        var c, prev, i, expression, filters;

        for (i = 0; i < exp.length; i++) {
            prev = c;
            c = exp.charCodeAt(i);
            if (inSingle) {
                if (c === 0x27 && prev !== 0x5C) { inSingle = false; }
            } else if (inDouble) {
                if (c === 0x22 && prev !== 0x5C) { inDouble = false; }
            } else if (inTemplateString) {
                if (c === 0x60 && prev !== 0x5C) { inTemplateString = false; }
            } else if (inRegex) {
                if (c === 0x2f && prev !== 0x5C) { inRegex = false; }
            } else if (
                c === 0x7C && // pipe
                exp.charCodeAt(i + 1) !== 0x7C &&
                exp.charCodeAt(i - 1) !== 0x7C &&
                !curly && !square && !paren
            ) {
                if (expression === undefined) {
                    // first filter, end of expression
                    lastFilterIndex = i + 1;
                    expression = exp.slice(0, i).trim();
                } else {
                    pushFilter();
                }
            } else {
                switch (c) {
                    case 0x22: inDouble = true; break         // "
                    case 0x27: inSingle = true; break         // '
                    case 0x60: inTemplateString = true; break // `
                    case 0x28: paren++; break                 // (
                    case 0x29: paren--; break                 // )
                    case 0x5B: square++; break                // [
                    case 0x5D: square--; break                // ]
                    case 0x7B: curly++; break                 // {
                    case 0x7D: curly--; break                 // }
                }
                if (c === 0x2f) { // /
                    var j = i - 1;
                    var p = (void 0);
                    // find first non-whitespace prev char
                    for (; j >= 0; j--) {
                        p = exp.charAt(j);
                        if (p !== ' ') { break }
                    }
                    if (!p || !/[\w$]/.test(p)) {
                        inRegex = true;
                    }
                }
            }
        }

        if (expression === undefined) {
            expression = exp.slice(0, i).trim();
        } else if (lastFilterIndex !== 0) {
            pushFilter();
        }

        function pushFilter() {
            (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
            lastFilterIndex = i + 1;
        }

        if (filters) {
            for (i = 0; i < filters.length; i++) {
                expression = wrapFilter(expression, filters[i]);
            }
        }

        return expression
    }

    function wrapFilter(exp, filter) {
        var i = filter.indexOf('(');
        if (i < 0) {
            // _f: resolveFilter
            return ("_f(\"" + filter + "\")(" + exp + ")")
        } else {
            var name = filter.slice(0, i);
            var args = filter.slice(i + 1);
            return ("_f(\"" + name + "\")(" + exp + "," + args)
        }
    }

    /*  */

    var defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g;
    var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

    var buildRegex = cached(function (delimiters) {
        var open = delimiters[0].replace(regexEscapeRE, '\\$&');
        var close = delimiters[1].replace(regexEscapeRE, '\\$&');
        return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
    });

    function parseText(
        text,
        delimiters
    ) {
        var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
        if (!tagRE.test(text)) {
            return
        }
        var tokens = [];
        var lastIndex = tagRE.lastIndex = 0;
        var match, index;
        while ((match = tagRE.exec(text))) {
            index = match.index;
            // push text token
            if (index > lastIndex) {
                tokens.push(JSON.stringify(text.slice(lastIndex, index)));
            }
            // tag token
            var exp = parseFilters(match[1].trim());
            tokens.push(("_s(" + exp + ")"));
            lastIndex = index + match[0].length;
        }
        if (lastIndex < text.length) {
            tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return tokens.join('+')
    }

    /*  */

    function baseWarn(msg) {
        console.error(("[Vue parser]: " + msg));
    }

    function pluckModuleFunction(
        modules,
        key
    ) {
        return modules
            ? modules.map(function (m) { return m[key]; }).filter(function (_) { return _; })
            : []
    }

    function addProp(el, name, value) {
        (el.props || (el.props = [])).push({ name: name, value: value });
    }

    function addAttr(el, name, value) {
        (el.attrs || (el.attrs = [])).push({ name: name, value: value });
    }

    function addDirective(
        el,
        name,
        rawName,
        value,
        arg,
        modifiers
    ) {
        (el.directives || (el.directives = [])).push({ name: name, rawName: rawName, value: value, arg: arg, modifiers: modifiers });
    }

    function addHandler(
        el,
        name,
        value,
        modifiers,
        important
    ) {
        // check capture modifier
        if (modifiers && modifiers.capture) {
            delete modifiers.capture;
            name = '!' + name; // mark the event as captured
        }
        if (modifiers && modifiers.once) {
            delete modifiers.once;
            name = '~' + name; // mark the event as once
        }
        var events;
        if (modifiers && modifiers.native) {
            delete modifiers.native;
            events = el.nativeEvents || (el.nativeEvents = {});
        } else {
            events = el.events || (el.events = {});
        }
        var newHandler = { value: value, modifiers: modifiers };
        var handlers = events[name];
        /* istanbul ignore if */
        if (Array.isArray(handlers)) {
            important ? handlers.unshift(newHandler) : handlers.push(newHandler);
        } else if (handlers) {
            events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
        } else {
            events[name] = newHandler;
        }
    }

    function getBindingAttr(
        el,
        name,
        getStatic
    ) {
        var dynamicValue =
            getAndRemoveAttr(el, ':' + name) ||
            getAndRemoveAttr(el, 'v-bind:' + name);
        if (dynamicValue != null) {
            return parseFilters(dynamicValue)
        } else if (getStatic !== false) {
            var staticValue = getAndRemoveAttr(el, name);
            if (staticValue != null) {
                return JSON.stringify(staticValue)
            }
        }
    }

    function getAndRemoveAttr(el, name) {
        var val;
        if ((val = el.attrsMap[name]) != null) {
            var list = el.attrsList;
            for (var i = 0, l = list.length; i < l; i++) {
                if (list[i].name === name) {
                    list.splice(i, 1);
                    break
                }
            }
        }
        return val
    }

    var len;
    var str;
    var chr;
    var index$1;
    var expressionPos;
    var expressionEndPos;

    /**
     * parse directive model to do the array update transform. a[idx] = val => $$a.splice($$idx, 1, val)
     *
     * for loop possible cases:
     *
     * - test
     * - test[idx]
     * - test[test1[idx]]
     * - test["a"][idx]
     * - xxx.test[a[a].test1[idx]]
     * - test.xxx.a["asa"][test1[idx]]
     *
     */

    function parseModel(val) {
        str = val;
        len = str.length;
        index$1 = expressionPos = expressionEndPos = 0;

        if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
            return {
                exp: val,
                idx: null
            }
        }

        while (!eof()) {
            chr = next();
            /* istanbul ignore if */
            if (isStringStart(chr)) {
                parseString(chr);
            } else if (chr === 0x5B) {
                parseBracket(chr);
            }
        }

        return {
            exp: val.substring(0, expressionPos),
            idx: val.substring(expressionPos + 1, expressionEndPos)
        }
    }

    function next() {
        return str.charCodeAt(++index$1)
    }

    function eof() {
        return index$1 >= len
    }

    function isStringStart(chr) {
        return chr === 0x22 || chr === 0x27
    }

    function parseBracket(chr) {
        var inBracket = 1;
        expressionPos = index$1;
        while (!eof()) {
            chr = next();
            if (isStringStart(chr)) {
                parseString(chr);
                continue
            }
            if (chr === 0x5B) { inBracket++; }
            if (chr === 0x5D) { inBracket--; }
            if (inBracket === 0) {
                expressionEndPos = index$1;
                break
            }
        }
    }

    function parseString(chr) {
        var stringQuote = chr;
        while (!eof()) {
            chr = next();
            if (chr === stringQuote) {
                break
            }
        }
    }

    /*  */

    var dirRE = /^v-|^@|^:/;
    var forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/;
    var forIteratorRE = /\((\{[^}]*\}|[^,]*),([^,]*)(?:,([^,]*))?\)/;
    var bindRE = /^:|^v-bind:/;
    var onRE = /^@|^v-on:/;
    var argRE = /:(.*)$/;
    var modifierRE = /\.[^.]+/g;

    var decodeHTMLCached = cached(decode);

    // configurable state
    var warn$1;
    var platformGetTagNamespace;
    var platformMustUseProp;
    var platformIsPreTag;
    var preTransforms;
    var transforms;
    var postTransforms;
    var delimiters;

    /**
     * Convert HTML string to AST.
     */
    function parse(
        template,
        options
    ) {
        warn$1 = options.warn || baseWarn;
        platformGetTagNamespace = options.getTagNamespace || no;
        platformMustUseProp = options.mustUseProp || no;
        platformIsPreTag = options.isPreTag || no;
        preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
        transforms = pluckModuleFunction(options.modules, 'transformNode');
        postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');
        delimiters = options.delimiters;
        var stack = [];
        var preserveWhitespace = options.preserveWhitespace !== false;
        var root;
        var currentParent;
        var inVPre = false;
        var inPre = false;
        var warned = false;
        parseHTML(template, {
            expectHTML: options.expectHTML,
            isUnaryTag: options.isUnaryTag,
            shouldDecodeNewlines: options.shouldDecodeNewlines,
            start: function start(tag, attrs, unary) {
                // check namespace.
                // inherit parent ns if there is one
                var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);

                // handle IE svg bug
                /* istanbul ignore if */
                if (isIE && ns === 'svg') {
                    attrs = guardIESVGBug(attrs);
                }

                var element = {
                    type: 1,
                    tag: tag,
                    attrsList: attrs,
                    attrsMap: makeAttrsMap(attrs),
                    parent: currentParent,
                    children: []
                };
                if (ns) {
                    element.ns = ns;
                }

                if (isForbiddenTag(element) && !isServerRendering()) {
                    element.forbidden = true;
                    "development" !== 'production' && warn$1(
                        'Templates should only be responsible for mapping the state to the ' +
                        'UI. Avoid placing tags with side-effects in your templates, such as ' +
                        "<" + tag + ">" + ', as they will not be parsed.'
                    );
                }

                // apply pre-transforms
                for (var i = 0; i < preTransforms.length; i++) {
                    preTransforms[i](element, options);
                }

                if (!inVPre) {
                    processPre(element);
                    if (element.pre) {
                        inVPre = true;
                    }
                }
                if (platformIsPreTag(element.tag)) {
                    inPre = true;
                }
                if (inVPre) {
                    processRawAttrs(element);
                } else {
                    processFor(element);
                    processIf(element);
                    processOnce(element);
                    processKey(element);

                    // determine whether this is a plain element after
                    // removing structural attributes
                    element.plain = !element.key && !attrs.length;

                    processRef(element);
                    processSlot(element);
                    processComponent(element);
                    for (var i$1 = 0; i$1 < transforms.length; i$1++) {
                        transforms[i$1](element, options);
                    }
                    processAttrs(element);
                }

                function checkRootConstraints(el) {
                    if ("development" !== 'production' && !warned) {
                        if (el.tag === 'slot' || el.tag === 'template') {
                            warned = true;
                            warn$1(
                                "Cannot use <" + (el.tag) + "> as component root element because it may " +
                                'contain multiple nodes:\n' + template
                            );
                        }
                        if (el.attrsMap.hasOwnProperty('v-for')) {
                            warned = true;
                            warn$1(
                                'Cannot use v-for on stateful component root element because ' +
                                'it renders multiple elements:\n' + template
                            );
                        }
                    }
                }

                // tree management
                if (!root) {
                    root = element;
                    checkRootConstraints(root);
                } else if (!stack.length) {
                    // allow root elements with v-if, v-else-if and v-else
                    if (root.if && (element.elseif || element.else)) {
                        checkRootConstraints(element);
                        addIfCondition(root, {
                            exp: element.elseif,
                            block: element
                        });
                    } else if ("development" !== 'production' && !warned) {
                        warned = true;
                        warn$1(
                            "Component template should contain exactly one root element:" +
                            "\n\n" + template + "\n\n" +
                            "If you are using v-if on multiple elements, " +
                            "use v-else-if to chain them instead."
                        );
                    }
                }
                if (currentParent && !element.forbidden) {
                    if (element.elseif || element.else) {
                        processIfConditions(element, currentParent);
                    } else if (element.slotScope) { // scoped slot
                        currentParent.plain = false;
                        var name = element.slotTarget || 'default'; (currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
                    } else {
                        currentParent.children.push(element);
                        element.parent = currentParent;
                    }
                }
                if (!unary) {
                    currentParent = element;
                    stack.push(element);
                }
                // apply post-transforms
                for (var i$2 = 0; i$2 < postTransforms.length; i$2++) {
                    postTransforms[i$2](element, options);
                }
            },

            end: function end() {
                // remove trailing whitespace
                var element = stack[stack.length - 1];
                var lastNode = element.children[element.children.length - 1];
                if (lastNode && lastNode.type === 3 && lastNode.text === ' ') {
                    element.children.pop();
                }
                // pop stack
                stack.length -= 1;
                currentParent = stack[stack.length - 1];
                // check pre state
                if (element.pre) {
                    inVPre = false;
                }
                if (platformIsPreTag(element.tag)) {
                    inPre = false;
                }
            },

            chars: function chars(text) {
                if (!currentParent) {
                    if ("development" !== 'production' && !warned && text === template) {
                        warned = true;
                        warn$1(
                            'Component template requires a root element, rather than just text:\n\n' + template
                        );
                    }
                    return
                }
                // IE textarea placeholder bug
                /* istanbul ignore if */
                if (isIE &&
                    currentParent.tag === 'textarea' &&
                    currentParent.attrsMap.placeholder === text) {
                    return
                }
                var children = currentParent.children;
                text = inPre || text.trim()
                    ? decodeHTMLCached(text)
                    // only preserve whitespace if its not right after a starting tag
                    : preserveWhitespace && children.length ? ' ' : '';
                if (text) {
                    var expression;
                    if (!inVPre && text !== ' ' && (expression = parseText(text, delimiters))) {
                        children.push({
                            type: 2,
                            expression: expression,
                            text: text
                        });
                    } else if (text !== ' ' || children[children.length - 1].text !== ' ') {
                        currentParent.children.push({
                            type: 3,
                            text: text
                        });
                    }
                }
            }
        });
        return root
    }

    function processPre(el) {
        if (getAndRemoveAttr(el, 'v-pre') != null) {
            el.pre = true;
        }
    }

    function processRawAttrs(el) {
        var l = el.attrsList.length;
        if (l) {
            var attrs = el.attrs = new Array(l);
            for (var i = 0; i < l; i++) {
                attrs[i] = {
                    name: el.attrsList[i].name,
                    value: JSON.stringify(el.attrsList[i].value)
                };
            }
        } else if (!el.pre) {
            // non root node in pre blocks with no attributes
            el.plain = true;
        }
    }

    function processKey(el) {
        var exp = getBindingAttr(el, 'key');
        if (exp) {
            if ("development" !== 'production' && el.tag === 'template') {
                warn$1("<template> cannot be keyed. Place the key on real elements instead.");
            }
            el.key = exp;
        }
    }

    function processRef(el) {
        var ref = getBindingAttr(el, 'ref');
        if (ref) {
            el.ref = ref;
            el.refInFor = checkInFor(el);
        }
    }

    function processFor(el) {
        var exp;
        if ((exp = getAndRemoveAttr(el, 'v-for'))) {
            var inMatch = exp.match(forAliasRE);
            if (!inMatch) {
                "development" !== 'production' && warn$1(
                    ("Invalid v-for expression: " + exp)
                );
                return
            }
            el.for = inMatch[2].trim();
            var alias = inMatch[1].trim();
            var iteratorMatch = alias.match(forIteratorRE);
            if (iteratorMatch) {
                el.alias = iteratorMatch[1].trim();
                el.iterator1 = iteratorMatch[2].trim();
                if (iteratorMatch[3]) {
                    el.iterator2 = iteratorMatch[3].trim();
                }
            } else {
                el.alias = alias;
            }
        }
    }

    function processIf(el) {
        var exp = getAndRemoveAttr(el, 'v-if');
        if (exp) {
            el.if = exp;
            addIfCondition(el, {
                exp: exp,
                block: el
            });
        } else {
            if (getAndRemoveAttr(el, 'v-else') != null) {
                el.else = true;
            }
            var elseif = getAndRemoveAttr(el, 'v-else-if');
            if (elseif) {
                el.elseif = elseif;
            }
        }
    }

    function processIfConditions(el, parent) {
        var prev = findPrevElement(parent.children);
        if (prev && prev.if) {
            addIfCondition(prev, {
                exp: el.elseif,
                block: el
            });
        } else {
            warn$1(
                "v-" + (el.elseif ? ('else-if="' + el.elseif + '"') : 'else') + " " +
                "used on element <" + (el.tag) + "> without corresponding v-if."
            );
        }
    }

    function findPrevElement(children) {
        var i = children.length;
        while (i--) {
            if (children[i].type === 1) {
                return children[i]
            } else {
                if ("development" !== 'production' && children[i].text !== ' ') {
                    warn$1(
                        "text \"" + (children[i].text.trim()) + "\" between v-if and v-else(-if) " +
                        "will be ignored."
                    );
                }
                children.pop();
            }
        }
    }

    function addIfCondition(el, condition) {
        if (!el.ifConditions) {
            el.ifConditions = [];
        }
        el.ifConditions.push(condition);
    }

    function processOnce(el) {
        var once = getAndRemoveAttr(el, 'v-once');
        if (once != null) {
            el.once = true;
        }
    }

    function processSlot(el) {
        if (el.tag === 'slot') {
            el.slotName = getBindingAttr(el, 'name');
            if ("development" !== 'production' && el.key) {
                warn$1(
                    "`key` does not work on <slot> because slots are abstract outlets " +
                    "and can possibly expand into multiple elements. " +
                    "Use the key on a wrapping element instead."
                );
            }
        } else {
            var slotTarget = getBindingAttr(el, 'slot');
            if (slotTarget) {
                el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
            }
            if (el.tag === 'template') {
                el.slotScope = getAndRemoveAttr(el, 'scope');
            }
        }
    }

    function processComponent(el) {
        var binding;
        if ((binding = getBindingAttr(el, 'is'))) {
            el.component = binding;
        }
        if (getAndRemoveAttr(el, 'inline-template') != null) {
            el.inlineTemplate = true;
        }
    }

    function processAttrs(el) {
        var list = el.attrsList;
        var i, l, name, rawName, value, arg, modifiers, isProp;
        for (i = 0, l = list.length; i < l; i++) {
            name = rawName = list[i].name;
            value = list[i].value;
            if (dirRE.test(name)) {
                // mark element as dynamic
                el.hasBindings = true;
                // modifiers
                modifiers = parseModifiers(name);
                if (modifiers) {
                    name = name.replace(modifierRE, '');
                }
                if (bindRE.test(name)) { // v-bind
                    name = name.replace(bindRE, '');
                    value = parseFilters(value);
                    isProp = false;
                    if (modifiers) {
                        if (modifiers.prop) {
                            isProp = true;
                            name = camelize(name);
                            if (name === 'innerHtml') { name = 'innerHTML'; }
                        }
                        if (modifiers.camel) {
                            name = camelize(name);
                        }
                    }
                    if (isProp || platformMustUseProp(el.tag, el.attrsMap.type, name)) {
                        addProp(el, name, value);
                    } else {
                        addAttr(el, name, value);
                    }
                } else if (onRE.test(name)) { // v-on
                    name = name.replace(onRE, '');
                    addHandler(el, name, value, modifiers);
                } else { // normal directives
                    name = name.replace(dirRE, '');
                    // parse arg
                    var argMatch = name.match(argRE);
                    if (argMatch && (arg = argMatch[1])) {
                        name = name.slice(0, -(arg.length + 1));
                    }
                    addDirective(el, name, rawName, value, arg, modifiers);
                    if ("development" !== 'production' && name === 'model') {
                        checkForAliasModel(el, value);
                    }
                }
            } else {
                // literal attribute
                {
                    var expression = parseText(value, delimiters);
                    if (expression) {
                        warn$1(
                            name + "=\"" + value + "\": " +
                            'Interpolation inside attributes has been removed. ' +
                            'Use v-bind or the colon shorthand instead. For example, ' +
                            'instead of <div id="{{ val }}">, use <div :id="val">.'
                        );
                    }
                }
                addAttr(el, name, JSON.stringify(value));
            }
        }
    }

    function checkInFor(el) {
        var parent = el;
        while (parent) {
            if (parent.for !== undefined) {
                return true
            }
            parent = parent.parent;
        }
        return false
    }

    function parseModifiers(name) {
        var match = name.match(modifierRE);
        if (match) {
            var ret = {};
            match.forEach(function (m) { ret[m.slice(1)] = true; });
            return ret
        }
    }

    function makeAttrsMap(attrs) {
        var map = {};
        for (var i = 0, l = attrs.length; i < l; i++) {
            if ("development" !== 'production' && map[attrs[i].name] && !isIE) {
                warn$1('duplicate attribute: ' + attrs[i].name);
            }
            map[attrs[i].name] = attrs[i].value;
        }
        return map
    }

    function isForbiddenTag(el) {
        return (
            el.tag === 'style' ||
            (el.tag === 'script' && (
                !el.attrsMap.type ||
                el.attrsMap.type === 'text/javascript'
            ))
        )
    }

    var ieNSBug = /^xmlns:NS\d+/;
    var ieNSPrefix = /^NS\d+:/;

    /* istanbul ignore next */
    function guardIESVGBug(attrs) {
        var res = [];
        for (var i = 0; i < attrs.length; i++) {
            var attr = attrs[i];
            if (!ieNSBug.test(attr.name)) {
                attr.name = attr.name.replace(ieNSPrefix, '');
                res.push(attr);
            }
        }
        return res
    }

    function checkForAliasModel(el, value) {
        var _el = el;
        while (_el) {
            if (_el.for && _el.alias === value) {
                warn$1(
                    "<" + (el.tag) + " v-model=\"" + value + "\">: " +
                    "You are binding v-model directly to a v-for iteration alias. " +
                    "This will not be able to modify the v-for source array because " +
                    "writing to the alias is like modifying a function local variable. " +
                    "Consider using an array of objects and use v-model on an object property instead."
                );
            }
            _el = _el.parent;
        }
    }

    /*  */

    var isStaticKey;
    var isPlatformReservedTag;

    var genStaticKeysCached = cached(genStaticKeys$1);

    /**
     * Goal of the optimizer: walk the generated template AST tree
     * and detect sub-trees that are purely static, i.e. parts of
     * the DOM that never needs to change.
     *
     * Once we detect these sub-trees, we can:
     *
     * 1. Hoist them into constants, so that we no longer need to
     *    create fresh nodes for them on each re-render;
     * 2. Completely skip them in the patching process.
     */
    function optimize(root, options) {
        if (!root) { return }
        isStaticKey = genStaticKeysCached(options.staticKeys || '');
        isPlatformReservedTag = options.isReservedTag || no;
        // first pass: mark all non-static nodes.
        markStatic(root);
        // second pass: mark static roots.
        markStaticRoots(root, false);
    }

    function genStaticKeys$1(keys) {
        return makeMap(
            'type,tag,attrsList,attrsMap,plain,parent,children,attrs' +
            (keys ? ',' + keys : '')
        )
    }

    function markStatic(node) {
        node.static = isStatic(node);
        if (node.type === 1) {
            // do not make component slot content static. this avoids
            // 1. components not able to mutate slot nodes
            // 2. static slot content fails for hot-reloading
            if (
                !isPlatformReservedTag(node.tag) &&
                node.tag !== 'slot' &&
                node.attrsMap['inline-template'] == null
            ) {
                return
            }
            for (var i = 0, l = node.children.length; i < l; i++) {
                var child = node.children[i];
                markStatic(child);
                if (!child.static) {
                    node.static = false;
                }
            }
        }
    }

    function markStaticRoots(node, isInFor) {
        if (node.type === 1) {
            if (node.static || node.once) {
                node.staticInFor = isInFor;
            }
            // For a node to qualify as a static root, it should have children that
            // are not just static text. Otherwise the cost of hoisting out will
            // outweigh the benefits and it's better off to just always render it fresh.
            if (node.static && node.children.length && !(
                node.children.length === 1 &&
                node.children[0].type === 3
            )) {
                node.staticRoot = true;
                return
            } else {
                node.staticRoot = false;
            }
            if (node.children) {
                for (var i = 0, l = node.children.length; i < l; i++) {
                    markStaticRoots(node.children[i], isInFor || !!node.for);
                }
            }
            if (node.ifConditions) {
                walkThroughConditionsBlocks(node.ifConditions, isInFor);
            }
        }
    }

    function walkThroughConditionsBlocks(conditionBlocks, isInFor) {
        for (var i = 1, len = conditionBlocks.length; i < len; i++) {
            markStaticRoots(conditionBlocks[i].block, isInFor);
        }
    }

    function isStatic(node) {
        if (node.type === 2) { // expression
            return false
        }
        if (node.type === 3) { // text
            return true
        }
        return !!(node.pre || (
            !node.hasBindings && // no dynamic bindings
            !node.if && !node.for && // not v-if or v-for or v-else
            !isBuiltInTag(node.tag) && // not a built-in
            isPlatformReservedTag(node.tag) && // not a component
            !isDirectChildOfTemplateFor(node) &&
            Object.keys(node).every(isStaticKey)
        ))
    }

    function isDirectChildOfTemplateFor(node) {
        while (node.parent) {
            node = node.parent;
            if (node.tag !== 'template') {
                return false
            }
            if (node.for) {
                return true
            }
        }
        return false
    }

    /*  */

    var fnExpRE = /^\s*([\w$_]+|\([^)]*?\))\s*=>|^function\s*\(/;
    var simplePathRE = /^\s*[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?']|\[".*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*\s*$/;

    // keyCode aliases
    var keyCodes = {
        esc: 27,
        tab: 9,
        enter: 13,
        space: 32,
        up: 38,
        left: 37,
        right: 39,
        down: 40,
        'delete': [8, 46]
    };

    var modifierCode = {
        stop: '$event.stopPropagation();',
        prevent: '$event.preventDefault();',
        self: 'if($event.target !== $event.currentTarget)return;',
        ctrl: 'if(!$event.ctrlKey)return;',
        shift: 'if(!$event.shiftKey)return;',
        alt: 'if(!$event.altKey)return;',
        meta: 'if(!$event.metaKey)return;'
    };

    function genHandlers(events, native) {
        var res = native ? 'nativeOn:{' : 'on:{';
        for (var name in events) {
            res += "\"" + name + "\":" + (genHandler(name, events[name])) + ",";
        }
        return res.slice(0, -1) + '}'
    }

    function genHandler(
        name,
        handler
    ) {
        if (!handler) {
            return 'function(){}'
        } else if (Array.isArray(handler)) {
            return ("[" + (handler.map(function (handler) { return genHandler(name, handler); }).join(',')) + "]")
        } else if (!handler.modifiers) {
            return fnExpRE.test(handler.value) || simplePathRE.test(handler.value)
                ? handler.value
                : ("function($event){" + (handler.value) + "}")
        } else {
            var code = '';
            var keys = [];
            for (var key in handler.modifiers) {
                if (modifierCode[key]) {
                    code += modifierCode[key];
                } else {
                    keys.push(key);
                }
            }
            if (keys.length) {
                code = genKeyFilter(keys) + code;
            }
            var handlerCode = simplePathRE.test(handler.value)
                ? handler.value + '($event)'
                : handler.value;
            return 'function($event){' + code + handlerCode + '}'
        }
    }

    function genKeyFilter(keys) {
        return ("if(" + (keys.map(genFilterCode).join('&&')) + ")return;")
    }

    function genFilterCode(key) {
        var keyVal = parseInt(key, 10);
        if (keyVal) {
            return ("$event.keyCode!==" + keyVal)
        }
        var alias = keyCodes[key];
        return ("_k($event.keyCode," + (JSON.stringify(key)) + (alias ? ',' + JSON.stringify(alias) : '') + ")")
    }

    /*  */

    function bind$2(el, dir) {
        el.wrapData = function (code) {
            return ("_b(" + code + ",'" + (el.tag) + "'," + (dir.value) + (dir.modifiers && dir.modifiers.prop ? ',true' : '') + ")")
        };
    }

    /*  */

    var baseDirectives = {
        bind: bind$2,
        cloak: noop
    };

    /*  */

    // configurable state
    var warn$2;
    var transforms$1;
    var dataGenFns;
    var platformDirectives$1;
    var isPlatformReservedTag$1;
    var staticRenderFns;
    var onceCount;
    var currentOptions;

    function generate(
        ast,
        options
    ) {
        // save previous staticRenderFns so generate calls can be nested
        var prevStaticRenderFns = staticRenderFns;
        var currentStaticRenderFns = staticRenderFns = [];
        var prevOnceCount = onceCount;
        onceCount = 0;
        currentOptions = options;
        warn$2 = options.warn || baseWarn;
        transforms$1 = pluckModuleFunction(options.modules, 'transformCode');
        dataGenFns = pluckModuleFunction(options.modules, 'genData');
        platformDirectives$1 = options.directives || {};
        isPlatformReservedTag$1 = options.isReservedTag || no;
        var code = ast ? genElement(ast) : '_c("div")';
        staticRenderFns = prevStaticRenderFns;
        onceCount = prevOnceCount;
        return {
            render: ("with(this){return " + code + "}"),
            staticRenderFns: currentStaticRenderFns
        }
    }

    function genElement(el) {
        if (el.staticRoot && !el.staticProcessed) {
            return genStatic(el)
        } else if (el.once && !el.onceProcessed) {
            return genOnce(el)
        } else if (el.for && !el.forProcessed) {
            return genFor(el)
        } else if (el.if && !el.ifProcessed) {
            return genIf(el)
        } else if (el.tag === 'template' && !el.slotTarget) {
            return genChildren(el) || 'void 0'
        } else if (el.tag === 'slot') {
            return genSlot(el)
        } else {
            // component or element
            var code;
            if (el.component) {
                code = genComponent(el.component, el);
            } else {
                var data = el.plain ? undefined : genData(el);

                var children = el.inlineTemplate ? null : genChildren(el, true);
                code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
            }
            // module transforms
            for (var i = 0; i < transforms$1.length; i++) {
                code = transforms$1[i](el, code);
            }
            return code
        }
    }

    // hoist static sub-trees out
    function genStatic(el) {
        el.staticProcessed = true;
        staticRenderFns.push(("with(this){return " + (genElement(el)) + "}"));
        return ("_m(" + (staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ")")
    }

    // v-once
    function genOnce(el) {
        el.onceProcessed = true;
        if (el.if && !el.ifProcessed) {
            return genIf(el)
        } else if (el.staticInFor) {
            var key = '';
            var parent = el.parent;
            while (parent) {
                if (parent.for) {
                    key = parent.key;
                    break
                }
                parent = parent.parent;
            }
            if (!key) {
                "development" !== 'production' && warn$2(
                    "v-once can only be used inside v-for that is keyed. "
                );
                return genElement(el)
            }
            return ("_o(" + (genElement(el)) + "," + (onceCount++) + (key ? ("," + key) : "") + ")")
        } else {
            return genStatic(el)
        }
    }

    function genIf(el) {
        el.ifProcessed = true; // avoid recursion
        return genIfConditions(el.ifConditions.slice())
    }

    function genIfConditions(conditions) {
        if (!conditions.length) {
            return '_e()'
        }

        var condition = conditions.shift();
        if (condition.exp) {
            return ("(" + (condition.exp) + ")?" + (genTernaryExp(condition.block)) + ":" + (genIfConditions(conditions)))
        } else {
            return ("" + (genTernaryExp(condition.block)))
        }

        // v-if with v-once should generate code like (a)?_m(0):_m(1)
        function genTernaryExp(el) {
            return el.once ? genOnce(el) : genElement(el)
        }
    }

    function genFor(el) {
        var exp = el.for;
        var alias = el.alias;
        var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
        var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';
        el.forProcessed = true; // avoid recursion
        return "_l((" + exp + ")," +
            "function(" + alias + iterator1 + iterator2 + "){" +
            "return " + (genElement(el)) +
            '})'
    }

    function genData(el) {
        var data = '{';

        // directives first.
        // directives may mutate the el's other properties before they are generated.
        var dirs = genDirectives(el);
        if (dirs) { data += dirs + ','; }

        // key
        if (el.key) {
            data += "key:" + (el.key) + ",";
        }
        // ref
        if (el.ref) {
            data += "ref:" + (el.ref) + ",";
        }
        if (el.refInFor) {
            data += "refInFor:true,";
        }
        // pre
        if (el.pre) {
            data += "pre:true,";
        }
        // record original tag name for components using "is" attribute
        if (el.component) {
            data += "tag:\"" + (el.tag) + "\",";
        }
        // module data generation functions
        for (var i = 0; i < dataGenFns.length; i++) {
            data += dataGenFns[i](el);
        }
        // attributes
        if (el.attrs) {
            data += "attrs:{" + (genProps(el.attrs)) + "},";
        }
        // DOM props
        if (el.props) {
            data += "domProps:{" + (genProps(el.props)) + "},";
        }
        // event handlers
        if (el.events) {
            data += (genHandlers(el.events)) + ",";
        }
        if (el.nativeEvents) {
            data += (genHandlers(el.nativeEvents, true)) + ",";
        }
        // slot target
        if (el.slotTarget) {
            data += "slot:" + (el.slotTarget) + ",";
        }
        // scoped slots
        if (el.scopedSlots) {
            data += (genScopedSlots(el.scopedSlots)) + ",";
        }
        // inline-template
        if (el.inlineTemplate) {
            var inlineTemplate = genInlineTemplate(el);
            if (inlineTemplate) {
                data += inlineTemplate + ",";
            }
        }
        data = data.replace(/,$/, '') + '}';
        // v-bind data wrap
        if (el.wrapData) {
            data = el.wrapData(data);
        }
        return data
    }

    function genDirectives(el) {
        var dirs = el.directives;
        if (!dirs) { return }
        var res = 'directives:[';
        var hasRuntime = false;
        var i, l, dir, needRuntime;
        for (i = 0, l = dirs.length; i < l; i++) {
            dir = dirs[i];
            needRuntime = true;
            var gen = platformDirectives$1[dir.name] || baseDirectives[dir.name];
            if (gen) {
                // compile-time directive that manipulates AST.
                // returns true if it also needs a runtime counterpart.
                needRuntime = !!gen(el, dir, warn$2);
            }
            if (needRuntime) {
                hasRuntime = true;
                res += "{name:\"" + (dir.name) + "\",rawName:\"" + (dir.rawName) + "\"" + (dir.value ? (",value:(" + (dir.value) + "),expression:" + (JSON.stringify(dir.value))) : '') + (dir.arg ? (",arg:\"" + (dir.arg) + "\"") : '') + (dir.modifiers ? (",modifiers:" + (JSON.stringify(dir.modifiers))) : '') + "},";
            }
        }
        if (hasRuntime) {
            return res.slice(0, -1) + ']'
        }
    }

    function genInlineTemplate(el) {
        var ast = el.children[0];
        if ("development" !== 'production' && (
            el.children.length > 1 || ast.type !== 1
        )) {
            warn$2('Inline-template components must have exactly one child element.');
        }
        if (ast.type === 1) {
            var inlineRenderFns = generate(ast, currentOptions);
            return ("inlineTemplate:{render:function(){" + (inlineRenderFns.render) + "},staticRenderFns:[" + (inlineRenderFns.staticRenderFns.map(function (code) { return ("function(){" + code + "}"); }).join(',')) + "]}")
        }
    }

    function genScopedSlots(slots) {
        return ("scopedSlots:{" + (Object.keys(slots).map(function (key) { return genScopedSlot(key, slots[key]); }).join(',')) + "}")
    }

    function genScopedSlot(key, el) {
        return key + ":function(" + (String(el.attrsMap.scope)) + "){" +
            "return " + (el.tag === 'template'
                ? genChildren(el) || 'void 0'
                : genElement(el)) + "}"
    }

    function genChildren(el, checkSkip) {
        var children = el.children;
        if (children.length) {
            var el$1 = children[0];
            // optimize single v-for
            if (children.length === 1 &&
                el$1.for &&
                el$1.tag !== 'template' &&
                el$1.tag !== 'slot') {
                return genElement(el$1)
            }
            var normalizationType = getNormalizationType(children);
            return ("[" + (children.map(genNode).join(',')) + "]" + (checkSkip
                ? normalizationType ? ("," + normalizationType) : ''
                : ''))
        }
    }

    // determine the normalization needed for the children array.
    // 0: no normalization needed
    // 1: simple normalization needed (possible 1-level deep nested array)
    // 2: full normalization needed
    function getNormalizationType(children) {
        var res = 0;
        for (var i = 0; i < children.length; i++) {
            var el = children[i];
            if (el.type !== 1) {
                continue
            }
            if (needsNormalization(el) ||
                (el.ifConditions && el.ifConditions.some(function (c) { return needsNormalization(c.block); }))) {
                res = 2;
                break
            }
            if (maybeComponent(el) ||
                (el.ifConditions && el.ifConditions.some(function (c) { return maybeComponent(c.block); }))) {
                res = 1;
            }
        }
        return res
    }

    function needsNormalization(el) {
        return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
    }

    function maybeComponent(el) {
        return !isPlatformReservedTag$1(el.tag)
    }

    function genNode(node) {
        if (node.type === 1) {
            return genElement(node)
        } else {
            return genText(node)
        }
    }

    function genText(text) {
        return ("_v(" + (text.type === 2
            ? text.expression // no need for () because already wrapped in _s()
            : transformSpecialNewlines(JSON.stringify(text.text))) + ")")
    }

    function genSlot(el) {
        var slotName = el.slotName || '"default"';
        var children = genChildren(el);
        var res = "_t(" + slotName + (children ? ("," + children) : '');
        var attrs = el.attrs && ("{" + (el.attrs.map(function (a) { return ((camelize(a.name)) + ":" + (a.value)); }).join(',')) + "}");
        var bind$$1 = el.attrsMap['v-bind'];
        if ((attrs || bind$$1) && !children) {
            res += ",null";
        }
        if (attrs) {
            res += "," + attrs;
        }
        if (bind$$1) {
            res += (attrs ? '' : ',null') + "," + bind$$1;
        }
        return res + ')'
    }

    // componentName is el.component, take it as argument to shun flow's pessimistic refinement
    function genComponent(componentName, el) {
        var children = el.inlineTemplate ? null : genChildren(el, true);
        return ("_c(" + componentName + "," + (genData(el)) + (children ? ("," + children) : '') + ")")
    }

    function genProps(props) {
        var res = '';
        for (var i = 0; i < props.length; i++) {
            var prop = props[i];
            res += "\"" + (prop.name) + "\":" + (transformSpecialNewlines(prop.value)) + ",";
        }
        return res.slice(0, -1)
    }

    // #3895, #4268
    function transformSpecialNewlines(text) {
        return text
            .replace(/\u2028/g, '\\u2028')
            .replace(/\u2029/g, '\\u2029')
    }

    /*  */

    /**
     * Compile a template.
     */
    function compile$1(
        template,
        options
    ) {
        var ast = parse(template.trim(), options);
        optimize(ast, options);
        var code = generate(ast, options);
        return {
            ast: ast,
            render: code.render,
            staticRenderFns: code.staticRenderFns
        }
    }

    /*  */

    // operators like typeof, instanceof and in are allowed
    var prohibitedKeywordRE = new RegExp('\\b' + (
        'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
        'super,throw,while,yield,delete,export,import,return,switch,default,' +
        'extends,finally,continue,debugger,function,arguments'
    ).split(',').join('\\b|\\b') + '\\b');
    // check valid identifier for v-for
    var identRE = /[A-Za-z_$][\w$]*/;
    // strip strings in expressions
    var stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;

    // detect problematic expressions in a template
    function detectErrors(ast) {
        var errors = [];
        if (ast) {
            checkNode(ast, errors);
        }
        return errors
    }

    function checkNode(node, errors) {
        if (node.type === 1) {
            for (var name in node.attrsMap) {
                if (dirRE.test(name)) {
                    var value = node.attrsMap[name];
                    if (value) {
                        if (name === 'v-for') {
                            checkFor(node, ("v-for=\"" + value + "\""), errors);
                        } else {
                            checkExpression(value, (name + "=\"" + value + "\""), errors);
                        }
                    }
                }
            }
            if (node.children) {
                for (var i = 0; i < node.children.length; i++) {
                    checkNode(node.children[i], errors);
                }
            }
        } else if (node.type === 2) {
            checkExpression(node.expression, node.text, errors);
        }
    }

    function checkFor(node, text, errors) {
        checkExpression(node.for || '', text, errors);
        checkIdentifier(node.alias, 'v-for alias', text, errors);
        checkIdentifier(node.iterator1, 'v-for iterator', text, errors);
        checkIdentifier(node.iterator2, 'v-for iterator', text, errors);
    }

    function checkIdentifier(ident, type, text, errors) {
        if (typeof ident === 'string' && !identRE.test(ident)) {
            errors.push(("- invalid " + type + " \"" + ident + "\" in expression: " + text));
        }
    }

    function checkExpression(exp, text, errors) {
        try {
            new Function(("return " + exp));
        } catch (e) {
            var keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE);
            if (keywordMatch) {
                errors.push(
                    "- avoid using JavaScript keyword as property name: " +
                    "\"" + (keywordMatch[0]) + "\" in expression " + text
                );
            } else {
                errors.push(("- invalid expression: " + text));
            }
        }
    }

    /*  */

    function transformNode(el, options) {
        var warn = options.warn || baseWarn;
        var staticClass = getAndRemoveAttr(el, 'class');
        if ("development" !== 'production' && staticClass) {
            var expression = parseText(staticClass, options.delimiters);
            if (expression) {
                warn(
                    "class=\"" + staticClass + "\": " +
                    'Interpolation inside attributes has been removed. ' +
                    'Use v-bind or the colon shorthand instead. For example, ' +
                    'instead of <div class="{{ val }}">, use <div :class="val">.'
                );
            }
        }
        if (staticClass) {
            el.staticClass = JSON.stringify(staticClass);
        }
        var classBinding = getBindingAttr(el, 'class', false /* getStatic */);
        if (classBinding) {
            el.classBinding = classBinding;
        }
    }

    function genData$1(el) {
        var data = '';
        if (el.staticClass) {
            data += "staticClass:" + (el.staticClass) + ",";
        }
        if (el.classBinding) {
            data += "class:" + (el.classBinding) + ",";
        }
        return data
    }

    var klass$1 = {
        staticKeys: ['staticClass'],
        transformNode: transformNode,
        genData: genData$1
    };

    /*  */

    function transformNode$1(el, options) {
        var warn = options.warn || baseWarn;
        var staticStyle = getAndRemoveAttr(el, 'style');
        if (staticStyle) {
            /* istanbul ignore if */
            {
                var expression = parseText(staticStyle, options.delimiters);
                if (expression) {
                    warn(
                        "style=\"" + staticStyle + "\": " +
                        'Interpolation inside attributes has been removed. ' +
                        'Use v-bind or the colon shorthand instead. For example, ' +
                        'instead of <div style="{{ val }}">, use <div :style="val">.'
                    );
                }
            }
            el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
        }

        var styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
        if (styleBinding) {
            el.styleBinding = styleBinding;
        }
    }

    function genData$2(el) {
        var data = '';
        if (el.staticStyle) {
            data += "staticStyle:" + (el.staticStyle) + ",";
        }
        if (el.styleBinding) {
            data += "style:(" + (el.styleBinding) + "),";
        }
        return data
    }

    var style$1 = {
        staticKeys: ['staticStyle'],
        transformNode: transformNode$1,
        genData: genData$2
    };

    var modules$1 = [
        klass$1,
        style$1
    ];

    /*  */

    var warn$3;

    function model$1(
        el,
        dir,
        _warn
    ) {
        warn$3 = _warn;
        var value = dir.value;
        var modifiers = dir.modifiers;
        var tag = el.tag;
        var type = el.attrsMap.type;
        {
            var dynamicType = el.attrsMap['v-bind:type'] || el.attrsMap[':type'];
            if (tag === 'input' && dynamicType) {
                warn$3(
                    "<input :type=\"" + dynamicType + "\" v-model=\"" + value + "\">:\n" +
                    "v-model does not support dynamic input types. Use v-if branches instead."
                );
            }
        }
        if (tag === 'select') {
            genSelect(el, value, modifiers);
        } else if (tag === 'input' && type === 'checkbox') {
            genCheckboxModel(el, value, modifiers);
        } else if (tag === 'input' && type === 'radio') {
            genRadioModel(el, value, modifiers);
        } else {
            genDefaultModel(el, value, modifiers);
        }
        // ensure runtime directive metadata
        return true
    }

    function genCheckboxModel(
        el,
        value,
        modifiers
    ) {
        if ("development" !== 'production' &&
            el.attrsMap.checked != null) {
            warn$3(
                "<" + (el.tag) + " v-model=\"" + value + "\" checked>:\n" +
                "inline checked attributes will be ignored when using v-model. " +
                'Declare initial values in the component\'s data option instead.'
            );
        }
        var number = modifiers && modifiers.number;
        var valueBinding = getBindingAttr(el, 'value') || 'null';
        var trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
        var falseValueBinding = getBindingAttr(el, 'false-value') || 'false';
        addProp(el, 'checked',
            "Array.isArray(" + value + ")" +
            "?_i(" + value + "," + valueBinding + ")>-1" + (
                trueValueBinding === 'true'
                    ? (":(" + value + ")")
                    : (":_q(" + value + "," + trueValueBinding + ")")
            )
        );
        addHandler(el, 'click',
            "var $$a=" + value + "," +
            '$$el=$event.target,' +
            "$$c=$$el.checked?(" + trueValueBinding + "):(" + falseValueBinding + ");" +
            'if(Array.isArray($$a)){' +
            "var $$v=" + (number ? '_n(' + valueBinding + ')' : valueBinding) + "," +
            '$$i=_i($$a,$$v);' +
            "if($$c){$$i<0&&(" + value + "=$$a.concat($$v))}" +
            "else{$$i>-1&&(" + value + "=$$a.slice(0,$$i).concat($$a.slice($$i+1)))}" +
            "}else{" + value + "=$$c}",
            null, true
        );
    }

    function genRadioModel(
        el,
        value,
        modifiers
    ) {
        if ("development" !== 'production' &&
            el.attrsMap.checked != null) {
            warn$3(
                "<" + (el.tag) + " v-model=\"" + value + "\" checked>:\n" +
                "inline checked attributes will be ignored when using v-model. " +
                'Declare initial values in the component\'s data option instead.'
            );
        }
        var number = modifiers && modifiers.number;
        var valueBinding = getBindingAttr(el, 'value') || 'null';
        valueBinding = number ? ("_n(" + valueBinding + ")") : valueBinding;
        addProp(el, 'checked', ("_q(" + value + "," + valueBinding + ")"));
        addHandler(el, 'click', genAssignmentCode(value, valueBinding), null, true);
    }

    function genDefaultModel(
        el,
        value,
        modifiers
    ) {
        {
            if (el.tag === 'input' && el.attrsMap.value) {
                warn$3(
                    "<" + (el.tag) + " v-model=\"" + value + "\" value=\"" + (el.attrsMap.value) + "\">:\n" +
                    'inline value attributes will be ignored when using v-model. ' +
                    'Declare initial values in the component\'s data option instead.'
                );
            }
            if (el.tag === 'textarea' && el.children.length) {
                warn$3(
                    "<textarea v-model=\"" + value + "\">:\n" +
                    'inline content inside <textarea> will be ignored when using v-model. ' +
                    'Declare initial values in the component\'s data option instead.'
                );
            }
        }

        var type = el.attrsMap.type;
        var ref = modifiers || {};
        var lazy = ref.lazy;
        var number = ref.number;
        var trim = ref.trim;
        var event = lazy || (isIE && type === 'range') ? 'change' : 'input';
        var needCompositionGuard = !lazy && type !== 'range';
        var isNative = el.tag === 'input' || el.tag === 'textarea';

        var valueExpression = isNative
            ? ("$event.target.value" + (trim ? '.trim()' : ''))
            : trim ? "(typeof $event === 'string' ? $event.trim() : $event)" : "$event";
        valueExpression = number || type === 'number'
            ? ("_n(" + valueExpression + ")")
            : valueExpression;

        var code = genAssignmentCode(value, valueExpression);
        if (isNative && needCompositionGuard) {
            code = "if($event.target.composing)return;" + code;
        }

        // inputs with type="file" are read only and setting the input's
        // value will throw an error.
        if ("development" !== 'production' &&
            type === 'file') {
            warn$3(
                "<" + (el.tag) + " v-model=\"" + value + "\" type=\"file\">:\n" +
                "File inputs are read only. Use a v-on:change listener instead."
            );
        }

        addProp(el, 'value', isNative ? ("_s(" + value + ")") : ("(" + value + ")"));
        addHandler(el, event, code, null, true);
        if (trim || number || type === 'number') {
            addHandler(el, 'blur', '$forceUpdate()');
        }
    }

    function genSelect(
        el,
        value,
        modifiers
    ) {
        {
            el.children.some(checkOptionWarning);
        }

        var number = modifiers && modifiers.number;
        var assignment = "Array.prototype.filter" +
            ".call($event.target.options,function(o){return o.selected})" +
            ".map(function(o){var val = \"_value\" in o ? o._value : o.value;" +
            "return " + (number ? '_n(val)' : 'val') + "})" +
            (el.attrsMap.multiple == null ? '[0]' : '');

        var code = genAssignmentCode(value, assignment);
        addHandler(el, 'change', code, null, true);
    }

    function checkOptionWarning(option) {
        if (option.type === 1 &&
            option.tag === 'option' &&
            option.attrsMap.selected != null) {
            warn$3(
                "<select v-model=\"" + (option.parent.attrsMap['v-model']) + "\">:\n" +
                'inline selected attributes on <option> will be ignored when using v-model. ' +
                'Declare initial values in the component\'s data option instead.'
            );
            return true
        }
        return false
    }

    function genAssignmentCode(value, assignment) {
        var modelRs = parseModel(value);
        if (modelRs.idx === null) {
            return (value + "=" + assignment)
        } else {
            return "var $$exp = " + (modelRs.exp) + ", $$idx = " + (modelRs.idx) + ";" +
                "if (!Array.isArray($$exp)){" +
                value + "=" + assignment + "}" +
                "else{$$exp.splice($$idx, 1, " + assignment + ")}"
        }
    }

    /*  */

    function text(el, dir) {
        if (dir.value) {
            addProp(el, 'textContent', ("_s(" + (dir.value) + ")"));
        }
    }

    /*  */

    function html(el, dir) {
        if (dir.value) {
            addProp(el, 'innerHTML', ("_s(" + (dir.value) + ")"));
        }
    }

    var directives$1 = {
        model: model$1,
        text: text,
        html: html
    };

    /*  */

    var cache = Object.create(null);

    var baseOptions = {
        expectHTML: true,
        modules: modules$1,
        staticKeys: genStaticKeys(modules$1),
        directives: directives$1,
        isReservedTag: isReservedTag,
        isUnaryTag: isUnaryTag,
        mustUseProp: mustUseProp,
        getTagNamespace: getTagNamespace,
        isPreTag: isPreTag
    };

    function compile$$1(
        template,
        options
    ) {
        options = options
            ? extend(extend({}, baseOptions), options)
            : baseOptions;
        return compile$1(template, options)
    }

    function compileToFunctions(
        template,
        options,
        vm
    ) {
        var _warn = (options && options.warn) || warn;
        // detect possible CSP restriction
        /* istanbul ignore if */
        {
            try {
                new Function('return 1');
            } catch (e) {
                if (e.toString().match(/unsafe-eval|CSP/)) {
                    _warn(
                        'It seems you are using the standalone build of Vue.js in an ' +
                        'environment with Content Security Policy that prohibits unsafe-eval. ' +
                        'The template compiler cannot work in this environment. Consider ' +
                        'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
                        'templates into render functions.'
                    );
                }
            }
        }
        var key = options && options.delimiters
            ? String(options.delimiters) + template
            : template;
        if (cache[key]) {
            return cache[key]
        }
        var res = {};
        var compiled = compile$$1(template, options);
        res.render = makeFunction(compiled.render);
        var l = compiled.staticRenderFns.length;
        res.staticRenderFns = new Array(l);
        for (var i = 0; i < l; i++) {
            res.staticRenderFns[i] = makeFunction(compiled.staticRenderFns[i]);
        }
        {
            if (res.render === noop || res.staticRenderFns.some(function (fn) { return fn === noop; })) {
                _warn(
                    "failed to compile template:\n\n" + template + "\n\n" +
                    detectErrors(compiled.ast).join('\n') +
                    '\n\n',
                    vm
                );
            }
        }
        return (cache[key] = res)
    }

    function makeFunction(code) {
        try {
            return new Function(code)
        } catch (e) {
            return noop
        }
    }

    /*  */

    var idToTemplate = cached(function (id) {
        var el = query(id);
        return el && el.innerHTML
    });

    var mount = Vue$3.prototype.$mount;
    Vue$3.prototype.$mount = function (
        el,
        hydrating
    ) {
        el = el && query(el);

        /* istanbul ignore if */
        if (el === document.body || el === document.documentElement) {
            "development" !== 'production' && warn(
                "Do not mount Vue to <html> or <body> - mount to normal elements instead."
            );
            return this
        }

        var options = this.$options;
        // resolve template/el and convert to render function
        if (!options.render) {
            var template = options.template;
            if (template) {
                if (typeof template === 'string') {
                    if (template.charAt(0) === '#') {
                        template = idToTemplate(template);
                        /* istanbul ignore if */
                        if ("development" !== 'production' && !template) {
                            warn(
                                ("Template element not found or is empty: " + (options.template)),
                                this
                            );
                        }
                    }
                } else if (template.nodeType) {
                    template = template.innerHTML;
                } else {
                    {
                        warn('invalid template option:' + template, this);
                    }
                    return this
                }
            } else if (el) {
                template = getOuterHTML(el);
            }
            if (template) {
                var ref = compileToFunctions(template, {
                    warn: warn,
                    shouldDecodeNewlines: shouldDecodeNewlines,
                    delimiters: options.delimiters
                }, this);
                var render = ref.render;
                var staticRenderFns = ref.staticRenderFns;
                options.render = render;
                options.staticRenderFns = staticRenderFns;
            }
        }
        return mount.call(this, el, hydrating)
    };

    /**
     * Get outerHTML of elements, taking care
     * of SVG elements in IE as well.
     */
    function getOuterHTML(el) {
        if (el.outerHTML) {
            return el.outerHTML
        } else {
            var container = document.createElement('div');
            container.appendChild(el.cloneNode(true));
            return container.innerHTML
        }
    }

    Vue$3.compile = compileToFunctions;

    return Vue$3;

})));
const EbTableVisualization = function EbTableVisualization(id, jsonObj) {
    this.$type = 'ExpressBase.Objects.EbTableVisualization, ExpressBase.Objects';
    this.EbSid = id;
    this.ObjType = 'TableVisualization';
    this.rowGrouping = { "$type": "System.Collections.Generic.List`1[[ExpressBase.Objects.Objects.DVRelated.DVBaseColumn, ExpressBase.Objects]], System.Private.CoreLib", "$values": [] }; this.LeftFixedColumn = 0; this.RightFixedColumn = 0; this.PageLength = 0; this.DataSourceRefId = ''; this.Description = ''; this.Columns = { "$type": "ExpressBase.Objects.Objects.DVRelated.DVColumnCollection, ExpressBase.Objects", "$values": [] }; this.DSColumns = { "$type": "ExpressBase.Objects.Objects.DVRelated.DVColumnCollection, ExpressBase.Objects", "$values": [] }; this.data = { "$type": "System.Object, System.Private.CoreLib" }; this.Pippedfrom = ''; this.IsPaged = ''; this.IsPaging = false; this.Name = id;


    this.$Control = $("            <div id='cont_@name@' Ctype='TableVisualization' class='Eb-ctrlContainer'>                <table style='width:100%' class='table table-striped' eb-type='Table' id='@name@'></table>            </div>".replace(/@id/g, this.EbSid));
    this.BareControlHtml = `<table style='width:100%' class='table table-striped' eb-type='Table' id='@name@'></table>`.replace(/@id/g, this.EbSid);
    this.DesignHtml = "            <div id='cont_@name@' Ctype='TableVisualization' class='Eb-ctrlContainer'>                <table style='width:100%' class='table table-striped' eb-type='Table' id='@name@'></table>            </div>";
    let MyName = this.constructor.name;
    this.RenderMe = function () {
        let NewHtml = this.$BareControl.outerHTML(), me = this, metas = AllMetas[MyName];
        $.each(metas, function (i, meta) {
            let name = meta.name;
            if (meta.IsUIproperty) {
                NewHtml = NewHtml.replace('@' + name + ' ', me[name]);
            }
        });
        if (!this.IsContainer)
            $('#' + id).html($(NewHtml).html());
    };
    if (jsonObj) {
        if (jsonObj.IsContainer)
            jsonObj.Controls = new EbControlCollection({});
        jsonObj.RenderMe = this.RenderMe;
        jsonObj.Html = this.Html;
        jsonObj.Init = this.Init;
        $.extend(this, jsonObj);
        //if(this.Init)
        //    jsonObj.Init(id);
    }
    else {
        if (this.Init)
            this.Init(id);
    }
};

//let EbSelect = function (name, ds_id, dropdownHeight, vmName, dmNames, maxLimit, minLimit, required, servicestack_url, vmValues, ctrl) {
const EbSelect = function (ctrl, options) {
    //parameters   
    this.getFilterValuesFn = options.getFilterValuesFn;
    this.ComboObj = ctrl;
    this.ComboObj.initializer = this;
    this.name = ctrl.EbSid_CtxId;
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
            $(document).mouseup(this.hideDDclickOutside.bind(this));//hide DD when click outside select or DD &  required ( if  not reach minLimit) 
            $('#' + this.name + 'Wraper .ps-srch').off("click").on("click", this.toggleIndicatorBtn.bind(this)); //search button toggle DD
            $('#' + this.name + 'tbl').keydown(function (e) { if (e.which === 27) this.Vobj.hideDD(); }.bind(this));//hide DD on esc when focused in DD
            $('#' + this.name + 'Wraper').on('click', '[class= close]', this.tagCloseBtnHand.bind(this));//remove ids when tagclose button clicked
            this.$searchBoxes.keydown(this.SearchBoxEveHandler.bind(this));//enter-DDenabling & if'' showall, esc arrow space key based DD enabling , backspace del-valueMember updating
            $('#' + this.name + 'Wraper' + " .dropdown.v-select.searchable").dblclick(this.V_showDD.bind(this));//search box double click -DDenabling
            this.$searchBoxes.keyup(debounce(this.delayedSearchFN.bind(this), 300)); //delayed search on combo searchbox
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

    //delayed search on combo searchbox
    this.delayedSearchFN = function (e) {
        let $e = $(e.target);
        let searchVal = $e.val();
        let _name = this.ComboObj.EbSid_CtxId;
        let MaxSearchVal = this.getMaxLenVal();

        if (!isPrintable(e) && e.which !== 8)
            return;

        if (this.ComboObj.MinSeachLength > MaxSearchVal.length) {
            EbShowCtrlMsg(`#${_name}Container`, `#${_name}Wraper`, `Enter minimum ${this.ComboObj.MinSeachLength} characters to search`, "info");
            this.V_hideDD();
            return;
        }
        else {
            EbHideCtrlMsg(`#${_name}Container`, `#${_name}Wraper`);
        }

        let mapedField = $e.closest(".searchable").attr("maped-column");
        let mapedFieldType = this.getTypeForDT($e.closest(".searchable").attr("column-type"));
        let $filterInp = $(`#${this.name}tbl_${mapedField}_hdr_txt1`);
        let searchBy = " = ";
        if (mapedFieldType === "string")
            searchBy = "x*";
        if (!this.IsDatatableInit) {
            if (this.ComboObj.MinSeachLength > searchVal.length)
                return;
            let filterObj = new filter_obj(mapedField, searchBy, searchVal, mapedFieldType);
            this.filterArray.push(filterObj);
            this.InitDT();
            this.V_showDD();
        }
        else {
            $filterInp.val($e.val());
            this.Vobj.DDstate = true;
            EbMakeValid(`#${this.ComboObj.EbSid_CtxId}Container`, `#${this.ComboObj.EbSid_CtxId}Wraper`);
            if (this.ComboObj.MinSeachLength > searchVal.length)
                return;

            if (searchVal.trim() === "" && this.ComboObj.MinSeachLength === 0) {
                this.datatable.columnSearch = [];
                this.datatable.Api.ajax.reload();
                return;
            }


            this.datatable.columnSearch = [];
            this.datatable.columnSearch.push(new filter_obj(mapedField, searchBy, searchVal, mapedFieldType));
            this.datatable.Api.ajax.reload();
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

        if (this.datatable) {
            this.datatable.columnSearch = [];
            //$.each(this.setvaluesColl, function (i, val) {
            this.datatable.columnSearch.push(new filter_obj(this.ComboObj.ValueMember.name, "=", this.setvaluesColl.join("|"), this.ComboObj.ValueMember.Type));
            //}.bind(this));
            this.datatable.Api.ajax.reload(this.initComplete4SetVal.bind(this, callBFn.bind(this, this.ComboObj), StrValues));
        }
        else {
            this.filterArray = [];
            //$.each(this.setvaluesColl, function (i, val) {
            this.filterArray.push(new filter_obj(this.ComboObj.ValueMember.name, "=", this.setvaluesColl.join("|"), this.ComboObj.ValueMember.Type));
            //}.bind(this));
            if (this.setvaluesColl.length > 0) {
                this.fninitComplete4SetVal = this.initComplete4SetVal.bind(this, callBFn.bind(this, this.ComboObj), StrValues);
                this.InitDT();
                this.V_showDD();
            }
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
                let $row = $(this.DTSelector + ` tbody tr[role="row"]`);
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

    // init datatable
    this.InitDT = function () {
        let searchVal = this.getMaxLenVal();
        let _name = this.ComboObj.EbSid_CtxId;
        if (this.ComboObj.MinSeachLength > searchVal.length) {
            //alert(`enter minimum ${this.ComboObj.MinSeachLength} charecter in searchBox`);
            EbShowCtrlMsg(`#${_name}Container`, `#${_name}Wraper`, `Enter minimum ${this.ComboObj.MinSeachLength} characters to search`, "info");
            return;
        }

        this.IsDatatableInit = true;
        //this.EbObject = new EbObjects["EbTableVisualization"]("Container");
        //this.EbObject.DataSourceRefId = this.dsid;
        let o = {};
        o.containerId = this.name + "DDdiv";
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
        o.columnSearch = this.filterArray;
        o.headerDisplay = (this.ComboObj.Columns.$values.filter((obj) => obj.bVisible === true && obj.name !== "id").length === 1) ? false : true;// (this.ComboObj.Columns.$values.length > 2) ? true : false;
        o.dom = "rt";
        o.source = "powerselect";
        o.hiddenFieldName = this.vmName || "id";
        o.keys = true;
        //o.hiddenFieldName = this.vmName;
        o.keyPressCallbackFn = this.DDKeyPress.bind(this);
        o.columns = this.ComboObj.Columns;//////////////////////////////////////////////////////
        if (options)
            o.rendererName = options.rendererName;
        o.getFilterValuesFn = this.getFilterValuesFn;
        o.fninitComplete4SetVal = this.fninitComplete4SetVal;
        o.fns4PSonLoad = this.onDataLoadCallBackFns;
        o.searchCallBack = this.searchCallBack;
        this.datatable = new EbBasicDataTable(o);

        setTimeout(function () {
            let contWidth = $('#' + this.name + 'Container').width();
            contWidth = (this.ComboObj.DropdownWidth === 0) ? contWidth : (this.ComboObj.DropdownWidth / 100) * contWidth;
            let div_tble = $("#" + o.containerId);
            let tbl_cod = div_tble.offset();
            let tbl_height = div_tble.height();
            let div_detach = div_tble.detach();
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
                div_tble.css("box-shadow", "0 -6px 12px rgba(0,0,0,.175), 0 0 0 1px rgba(204, 204, 204, 0.41)");
                if (ebcontext.renderContext !== "WebForm")
                    top += 38;
            }
            div_detach.appendTo($form_div).offset({ top: top, left: xtra_wdth }).width(contWidth);

        }.bind(this), 30);

        //this.datatable.Api.on('key-focus', this.arrowSelectionStylingFcs);
        //this.datatable.Api.on('key-blur', this.arrowSelectionStylingBlr);
        //$.ajax({
        //    type: "POST",
        //    url: "../DS/GetColumns",
        //    data: { DataSourceRefId: this.dsid },
        //    success: function (Columns) {
        //        this.DTColumns = JSON.parse(Columns).$values;
        //        //$.LoadingOverlay('hide');
        //    }.bind(this)
        //});
        //this.datatable = $(this.DTSelector).DataTable({//change ebsid to name
        //    processing: true,
        //    serverSide: true,
        //    dom: 'rt',
        //    columns: this.DTColumns,
        //    ajax: {
        //        url: "../dv/getData",
        //        type: 'POST',
        //        data: function (dq) {
        //            delete dq.columns; delete dq.order; delete dq.search;
        //            dq.RefId = this.dsid;
        //            dq.Params = { Name: "id", Value: "ac", Type: "11" };
        //        }.bind(this),
        //        dataSrc: function (dd) {
        //            return dd.data;
        //        },
        //    },
        //    initComplete: function () {
        //        this.hideTypingAnim();
        //        this.AskWhatU();
        //        $tableCont.show(100);
        //    }.bind(this)

        //});
        //settings: {
        //    hideCheckbox: (this.ComboObj.MultiSelect === false) ? true : false,
        //    scrollY: "200px",//this.dropdownHeight,
        //},
        //filterParams: { colName: "id", FilterValue: "ac" }, //{ id : "ac", }
        //initComplete: this.initDTpost.bind(this),
        //fnDblclickCallbackFunc: this.dblClickOnOptDDEventHand.bind(this),
        //fnKeyUpCallback:
        //fnClickCallbackFunc:
        //});
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
        let vmValue = this.datatable.data[$tr.index()][idx];
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

        if (this.columnVals[this.vmName].contains(vmValue)) {
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

    this.addColVals = function (val = this.lastAddedOrDeletedVal) {
        $.each(this.ColNames, function (i, name) {
            let obj = getObjByval(this.datatable.ebSettings.Columns.$values, "name", name);
            let type = obj.Type;
            let $rowEl = $(`${this.DT_tbodySelector} [data-uid=${val}]`);
            let idx = getObjByval(this.datatable.ebSettings.Columns.$values, "name", name).data;
            let cellData = this.datatable.Api.row($rowEl).data()[idx];
            let fval = EbConvertValue(cellData, type);
            if (type === 5)
                fval = this.datatable.data[$rowEl.index()][idx];// unformatted data
            this.columnVals[name].push(fval);
        }.bind(this));
    };

    this.removeColVals = function (vmValue) {
        let idx = this.columnVals[this.vmName].indexOf(vmValue);
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
        let vmValue = this.datatable.data[$(e.target).closest("tr").index()][idx];
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
        if (this.Vobj.valueMembers.length > this.Values.length)
            this.lastAddedOrDeletedVal = this.Vobj.valueMembers.filter(x => !this.Values.includes(x))[0];
        else
            this.lastAddedOrDeletedVal = this.Values.filter(x => !this.Vobj.valueMembers.includes(x))[0];
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
            if (this.ComboObj.justInit) { // temp from DG.setRowValues_E
                this.$inp.val(this.Vobj.valueMembers);
                this.ComboObj.justInit = undefined;
            }
            else
                this.$inp.val(this.Vobj.valueMembers).trigger("change");

        }
        else {
            this.reSetColumnvals_();
            if (this.justInit) {
                this.$inp.val(this.Vobj.valueMembers);
                //if (this.afterInitComplete4SetVal)
                this.justInit = undefined;
            }
            else
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
        if (!this.IsDatatableInit)
            this.InitDT();
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
        let searchVal = this.getMaxLenVal();
        if (this.ComboObj.MinSeachLength > searchVal.length) {
            return;
        }

        this.Vobj.DDstate = true;
        if (!this.IsDatatableInit)
            this.InitDT();
        else {
            EbMakeValid(`#${this.ComboObj.EbSid_CtxId}Container`, `#${this.ComboObj.EbSid_CtxId}Wraper`);
            //if ($(e.target).val() !== "") {
            //    this.delayedSearchFN(e);
            //}
            //else {
            //    this.datatable.columnSearch = [];
            //    this.datatable.Api.ajax.reload();
            //}
            setTimeout(function () {
                this.RemoveRowFocusStyle();
                let $cell = $(this.DTSelector + ' tbody tr:eq(0) td:eq(0)');
                this.datatable.Api.cell($cell).focus();
                this.ApplyRowFocusStyle($cell.closest("tr"));
            }.bind(this), 1);
        }

        this.V_updateCk();
        //setTimeout(function(){ $('#' + this.name + 'container table:eq(0)').css('width', $( '#' + this.name + 'container table:eq(1)').css('width') ); },520);
        //setTimeout(this.colAdjust, 520);
    };

    //this.colAdjust = function () { $('#' + this.name + 'tbl').DataTable().columns.adjust().draw(); }

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
        //$tr.removeClass('selected');
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
            this.datatable.Api.ajax.reload();
        }
    };

    this.checkBxClickEventHand = function (e) {
        this.$curEventTarget = $(e.target);
        let $row = $(e.target).closest('tr');
        //let datas = $(this.DTSelector).DataTable().row($row).data();
        let datas = this.datatable.data[$row.index()];


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
            $input.prop('disabled', true).next(".input-group-addon").css('pointer-events', 'none');
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
            $ctrl.closest(".input-group").find("input[type='text']").prop('disabled', false).next(".input-group-addon").css('pointer-events', 'auto');
            //ctrl.DoNotPersist = false;
        }
        else {
            $ctrl.closest(".input-group").find("input[type='text']").val("").prop('disabled', true).next(".input-group-addon").css('pointer-events', 'none');
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
        o.Source = "form";
        o.scrollHeight = ctrl.Height - 34.62;
        o.dvObject = JSON.parse(ctrl.TableVisualizationJson);

        if (!ctrl.__filterValues)
            ctrl.__filterValues = [];
        if (ctrl.ParamsList) {
            paramsList = ctrl.ParamsList.$values.map(function (obj) { return "form." + obj.Name; });//["form.textbox1", "form.id_max", "form.eb_loc_id", "form.eb_currentuser_id"];//
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
        $("#" + ctrl.EbSid_CtxId + "_Cont").find(".loc-close").on("click", (e) =>  $(event.target).closest('.locinp-cont').find('.locinp').val(''));
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
                    ctrl.__isJustSetValue = false;
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

        //this.Renderer.nxtCtrlIdx++;
        //this.Renderer.callGetControl();
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
            let params = [];
            params.push(new fltr_obj(16, "srcRefId", ctrlOpts.formObj.RefId));
            params.push(new fltr_obj(11, "srcRowId", ctrlOpts.dataRowId));
            let url = `../WebForm/Index?refid=${ctrl.FormRefId}&_params=${btoa(unescape(encodeURIComponent(JSON.stringify(params))))}&_mode=7`;
            window.open(url, '_blank');
        }.bind(this);
    };

    this.Approval = function (ctrl, ctrlOpts) {
        return new EbApproval(ctrl, ctrlOpts);
    };

    this.Review = function (ctrl, ctrlOpts) {
        return new EbReview(ctrl, ctrlOpts);
    };

    this.MeetingPicker = function (ctrl, ctrlOpts) {
        return new meetingPicker(ctrl, ctrlOpts, this.Renderer.rendererName);
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

        let EbCombo = new EbSelect(ctrl, {
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
        //this.initCards($('#' + ctrl.Name));
    };

    this.DynamicCardSet = function (ctrl) {
        new EbCardRender({
            $Ctrl: $('#' + ctrl.EbSid),
            Bot: this.Renderer,
            CtrlObj: ctrl
        });
        //this.initCards($('#' + ctrl.Name));
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

    this.Button = function (ctrl) {
        $('#' + ctrl.EbSid_CtxId).removeAttr("disabled");
        $('#' + ctrl.EbSid_CtxId).on('click', this.iFrameOpen.bind(this, ctrl));
    }.bind(this);

    this.SubmitButton = function (ctrl, ctrlOpts) {
        $('#webform_submit').removeAttr("disabled");

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


    this.iFrameOpen = function (ctrl) {
        let url = "../WebForm/Index?refid=" + ctrl.FormRefId + "&_mode=12";
        $("#iFrameForm").attr("src", url);
        $("#iFrameFormModal").modal("show");
    };

    this.SysLocation = function (ctrl) {//all sys controls init commented to avoid confusion with the default value in new mode

        if (!(ctrl.IsDisable)) {
            $.each(ebcontext.locations.Locations, function (intex, obj) {
                $("#" + ctrl.EbSid_CtxId).append(`<option value="${obj.LocId}"> ${obj.ShortName}</option>`);
            });
            $("#" + ctrl.EbSid_CtxId).val(ebcontext.locations.CurrentLocObj.LocId);
        }



        //if (_rowId === undefined || _rowId === 0) {
        //    setTimeout(function () {
        //        if (ctrl.DisplayMember === 1) {
        //            $("#" + ctrl.EbSid_CtxId).val(ebcontext.locations.CurrentLocObj.LocId);
        //        }
        //        else if (ctrl.DisplayMember === 3) {
        //            $("#" + ctrl.EbSid_CtxId).val(ebcontext.locations.CurrentLocObj.LongName);
        //        }
        //        else {
        //            $("#" + ctrl.EbSid_CtxId).val(ebcontext.locations.CurrentLocObj.ShortName);
        //        }
        //    }, 500);
        //}        
    };
    this.SysCreatedBy = function (ctrl) {
        //if (ctrl.DisplayMember === 1) {
        //    $("#" + ctrl.EbSid_CtxId).val(ebcontext.user.UserId);
        //}
        //else {
        let usrId = ebcontext.user.UserId;
        $("#" + ctrl.EbSid_CtxId).attr('data-id', usrId);
        $("#" + ctrl.EbSid_CtxId).text(ebcontext.user.FullName);
        let usrImg = '/images/dp/' + usrId + '.png';
        $(`#${ctrl.EbSid_CtxId}_usrimg`).attr('src', usrImg);
        //}
    };
    this.SysModifiedBy = function (ctrl) {
        //if (_rowId > 0) {
        //    if (ctrl.DisplayMember === 1) {
        //        $("#" + ctrl.EbSid_CtxId).val(ebcontext.user.UserId);
        //    }
        //    else {
        let usrId = ebcontext.user.UserId;
        $("#" + ctrl.EbSid_CtxId).attr('data-id', usrId);
        $("#" + ctrl.EbSid_CtxId).text(ebcontext.user.FullName);
        let usrImg = '/images/dp/' + usrId + '.png';
        $(`#${ctrl.EbSid_CtxId}_usrimg`).attr('src', usrImg);
        //    }
        //}        
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
        //ctrl.DependedValExp.$values.push("form.tvcontrol1"); // hardCoding temporary
        let $ctrl = $("#" + ctrl.EbSid_CtxId);
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
    };

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
            elm.onblur = createValidator(elm);
    };

    this.Numeric = function (ctrl) {
        //ctrl.DependedValExp.$values.push("form.tvcontrol1"); // hardCoding temporary
        //setTimeout(function () {
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
    }

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
            let lk = filePlugin.refidListfn();
            console.log("getValueFromDOM " + " p1 " + p1 + "  refid:" + lk);
            return lk;
        };
        ctrl.bindOnChange = function (p1) {
            console.log("bindOnChange " + " p1 " + p1);
            $("#" + ctrl.EbSid + "_bindfn").on("change", p1);
        };


        ctrl.setValue = function (p1) {
            console.log("setvalue " + " p1 " + p1);
            //if (p1 !== null && p1 !== "") {
            //    let preloaded = [];
            //    let refidArr = p1.split(',');
            //    for (var j = 0; j < refidArr.length; j++) {

            //        var src = `/images/small/${refidArr[j]}.jpg`;
            //        var fileno = j;
            //        var fltype = "png";
            //        preloaded.push({ id: refidArr[j], src: src, fileno: fileno, cntype: fltype, refid: refidArr[j] });
            //    }

            //    filePlugin.createPreloaded(preloaded);
            //}
            filePlugin.createPreloaded(p1);
        };
        ctrl.clear = function () {

            console.log("clear ");
            return filePlugin.clearFiles();
        };
    };

    this.ScriptButton = function (ctrl) {

    };




};



function createValidator(element) {
    return function () {
        //if (!isPrintable(event))
        //    return;
        var min = parseInt(element.getAttribute("min")) || 0;
        var max = parseInt(element.getAttribute("max")) || 0;

        var value = parseInt(element.value) || min;
        element.value = value; // make sure we got an int

        if (value < min && min !== 0) element.value = min;
        if (value > max && max !== 0) element.value = max;
    };
}