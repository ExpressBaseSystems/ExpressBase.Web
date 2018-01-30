﻿/*! pagemap v0.4.0 - https://larsjung.de/pagemap/ */
!function (t, e) { "object" == typeof exports && "object" == typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define([], e) : "object" == typeof exports ? exports.pagemap = e() : t.pagemap = e() }(this, function () { return function (t) { function e(n) { if (o[n]) return o[n].exports; var r = o[n] = { exports: {}, id: n, loaded: !1 }; return t[n].call(r.exports, r, r.exports, e), r.loaded = !0, r.exports } var o = {}; return e.m = t, e.c = o, e.p = "", e(0) }([function (t, e, o) { (function (e) { "use strict"; var n = o(1), r = e.window, i = r.document, c = i.querySelector("body"), u = function (t) { return "rgba(0,0,0," + t / 100 + ")" }, f = { viewport: null, styles: { "header,footer,section,article": u(8), "h1,a": u(10), "h2,h3,h4": u(8) }, back: u(2), view: u(5), drag: u(10), interval: null }, l = function (t, e, o, n) { return o.split(/\s+/).forEach(function (o) { return t[e](o, n) }) }, s = function (t, e, o) { return l(t, "addEventListener", e, o) }, a = function (t, e, o) { return l(t, "removeEventListener", e, o) }; t.exports = function (t, e) { var o = Object.assign({}, f, e), u = t.getContext("2d"), l = function () { var e = t.clientWidth, o = t.clientHeight; return function (t, n) { return Math.min(e / t, o / n) } }(), p = function (e, o) { t.width = e, t.height = o, t.style.width = e + "px", t.style.height = o + "px" }, h = o.viewport, d = function (t) { return Array.from((h || i).querySelectorAll(t)) }, v = !1, y = void 0, g = void 0, w = void 0, x = void 0, m = void 0, b = function (t, e) { e && (u.beginPath(), u.rect(t.x, t.y, t.w, t.h), u.fillStyle = e, u.fill()) }, T = function (t) { Object.keys(t).forEach(function (e) { var o = t[e]; d(e).forEach(function (t) { b(n.ofElement(t).relativeTo(y), o) }) }) }, E = function () { y = h ? n.ofContent(h) : n.ofDocument(), g = h ? n.ofViewport(h) : n.ofWindow(), w = l(y.w, y.h), p(y.w * w, y.h * w), u.setTransform(1, 0, 0, 1, 0, 0), u.clearRect(0, 0, t.width, t.height), u.scale(w, w), b(y.relativeTo(y), o.back), T(o.styles), b(g.relativeTo(y), v ? o.drag : o.view) }, O = function (e) { e.preventDefault(); var o = n.ofViewport(t), i = (e.pageX - o.x) / w - g.w * x, c = (e.pageY - o.y) / w - g.h * m; h ? (h.scrollLeft = i, h.scrollTop = c) : r.scrollTo(i, c), E() }, W = function e(o) { v = !1, t.style.cursor = "pointer", c.style.cursor = "auto", a(r, "mousemove", O), a(r, "mouseup", e), O(o) }, j = function (e) { v = !0; var o = n.ofViewport(t), i = g.relativeTo(y); x = ((e.pageX - o.x) / w - i.x) / i.w, m = ((e.pageY - o.y) / w - i.y) / i.h, (x < 0 || x > 1 || m < 0 || m > 1) && (x = .5, m = .5), t.style.cursor = "crosshair", c.style.cursor = "crosshair", s(r, "mousemove", O), s(r, "mouseup", W), O(e) }, H = function () { t.style.cursor = "pointer", s(t, "mousedown", j), s(h || r, "load resize scroll", E), o.interval > 0 && setInterval(function () { return E() }, o.interval), E() }; return H(), { redraw: E } } }).call(e, function () { return this }()) }, function (t, e) { (function (e) { "use strict"; var o = e.window, n = o.document.documentElement, r = t.exports = function (t, e, o, n) { return Object.assign(Object.create(r.prototype), { x: t, y: e, w: o, h: n }) }; r.prototype = { constructor: r, relativeTo: function () { var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : { x: 0, y: 0 }; return r(this.x - t.x, this.y - t.y, this.w, this.h) } }, r.ofDocument = function () { return r(0, 0, n.scrollWidth, n.scrollHeight) }, r.ofWindow = function () { return r(o.pageXOffset, o.pageYOffset, n.clientWidth, n.clientHeight) }; var i = function (t) { var e = t.getBoundingClientRect(); return { x: e.left + o.pageXOffset, y: e.top + o.pageYOffset } }; r.ofElement = function (t) { var e = i(t), o = e.x, n = e.y; return r(o, n, t.offsetWidth, t.offsetHeight) }, r.ofViewport = function (t) { var e = i(t), o = e.x, n = e.y; return r(o + t.clientLeft, n + t.clientTop, t.clientWidth, t.clientHeight) }, r.ofContent = function (t) { var e = i(t), o = e.x, n = e.y; return r(o + t.clientLeft - t.scrollLeft, n + t.clientTop - t.scrollTop, t.scrollWidth, t.scrollHeight) } }).call(e, function () { return this }()) }]) });