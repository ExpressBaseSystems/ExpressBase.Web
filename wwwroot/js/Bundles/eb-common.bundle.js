!function (e, t) { "function" == typeof define && define.amd ? define(["exports"], t) : "object" == typeof exports && "string" != typeof exports.nodeName ? t(exports) : t(e.commonJsStrict = {}) }(this, function (e) { "function" != typeof Promise && function (e) { function t(e, t) { return function () { e.apply(t, arguments) } } function i(e) { if ("object" != typeof this) throw new TypeError("Promises must be constructed via new"); if ("function" != typeof e) throw new TypeError("not a function"); this._state = null, this._value = null, this._deferreds = [], s(e, t(o, this), t(r, this)) } function n(e) { var t = this; return null === this._state ? void this._deferreds.push(e) : void h(function () { var i = t._state ? e.onFulfilled : e.onRejected; if (null !== i) { var n; try { n = i(t._value) } catch (t) { return void e.reject(t) } e.resolve(n) } else (t._state ? e.resolve : e.reject)(t._value) }) } function o(e) { try { if (e === this) throw new TypeError("A promise cannot be resolved with itself."); if (e && ("object" == typeof e || "function" == typeof e)) { var i = e.then; if ("function" == typeof i) return void s(t(i, e), t(o, this), t(r, this)) } this._state = !0, this._value = e, a.call(this) } catch (e) { r.call(this, e) } } function r(e) { this._state = !1, this._value = e, a.call(this) } function a() { for (var e = 0, t = this._deferreds.length; t > e; e++)n.call(this, this._deferreds[e]); this._deferreds = null } function s(e, t, i) { var n = !1; try { e(function (e) { n || (n = !0, t(e)) }, function (e) { n || (n = !0, i(e)) }) } catch (e) { if (n) return; n = !0, i(e) } } var l = setTimeout, h = "function" == typeof setImmediate && setImmediate || function (e) { l(e, 1) }, u = Array.isArray || function (e) { return "[object Array]" === Object.prototype.toString.call(e) }; i.prototype.catch = function (e) { return this.then(null, e) }, i.prototype.then = function (e, t) { var o = this; return new i(function (i, r) { n.call(o, new function (e, t, i, n) { this.onFulfilled = "function" == typeof e ? e : null, this.onRejected = "function" == typeof t ? t : null, this.resolve = i, this.reject = n }(e, t, i, r)) }) }, i.all = function () { var e = Array.prototype.slice.call(1 === arguments.length && u(arguments[0]) ? arguments[0] : arguments); return new i(function (t, i) { function n(r, a) { try { if (a && ("object" == typeof a || "function" == typeof a)) { var s = a.then; if ("function" == typeof s) return void s.call(a, function (e) { n(r, e) }, i) } e[r] = a, 0 == --o && t(e) } catch (e) { i(e) } } if (0 === e.length) return t([]); for (var o = e.length, r = 0; r < e.length; r++)n(r, e[r]) }) }, i.resolve = function (e) { return e && "object" == typeof e && e.constructor === i ? e : new i(function (t) { t(e) }) }, i.reject = function (e) { return new i(function (t, i) { i(e) }) }, i.race = function (e) { return new i(function (t, i) { for (var n = 0, o = e.length; o > n; n++)e[n].then(t, i) }) }, i._setImmediateFn = function (e) { h = e }, "undefined" != typeof module && module.exports ? module.exports = i : e.Promise || (e.Promise = i) }(this), "function" != typeof window.CustomEvent && function () { function e(e, t) { t = t || { bubbles: !1, cancelable: !1, detail: void 0 }; var i = document.createEvent("CustomEvent"); return i.initCustomEvent(e, t.bubbles, t.cancelable, t.detail), i } e.prototype = window.Event.prototype, window.CustomEvent = e }(), HTMLCanvasElement.prototype.toBlob || Object.defineProperty(HTMLCanvasElement.prototype, "toBlob", { value: function (e, t, i) { for (var n = atob(this.toDataURL(t, i).split(",")[1]), o = n.length, r = new Uint8Array(o), a = 0; a < o; a++)r[a] = n.charCodeAt(a); e(new Blob([r], { type: t || "image/png" })) } }); var t, i, n, o = ["Webkit", "Moz", "ms"], r = document.createElement("div").style, a = [1, 8, 3, 6], s = [2, 7, 4, 5]; function l(e) { if (e in r) return e; for (var t = e[0].toUpperCase() + e.slice(1), i = o.length; i--;)if ((e = o[i] + t) in r) return e } function h(e, t) { e = e || {}; for (var i in t) t[i] && t[i].constructor && t[i].constructor === Object ? (e[i] = e[i] || {}, h(e[i], t[i])) : e[i] = t[i]; return e } function u(e) { return h({}, e) } function c(e) { if ("createEvent" in document) { var t = document.createEvent("HTMLEvents"); t.initEvent("change", !1, !0), e.dispatchEvent(t) } else e.fireEvent("onchange") } function p(e, t, i) { if ("string" == typeof t) { var n = t; (t = {})[n] = i } for (var o in t) e.style[o] = t[o] } function d(e, t) { e.classList ? e.classList.add(t) : e.className += " " + t } function m(e, t) { for (var i in t) e.setAttribute(i, t[i]) } function f(e) { return parseInt(e, 10) } function v(e, t) { var i = e.naturalWidth, n = e.naturalHeight, o = t || b(e); if (o && o >= 5) { var r = i; i = n, n = r } return { width: i, height: n } } i = l("transform"), t = l("transformOrigin"), n = l("userSelect"); var g = { translate3d: { suffix: ", 0px" }, translate: { suffix: "" } }, w = function (e, t, i) { this.x = parseFloat(e), this.y = parseFloat(t), this.scale = parseFloat(i) }; w.parse = function (e) { return e.style ? w.parse(e.style[i]) : e.indexOf("matrix") > -1 || e.indexOf("none") > -1 ? w.fromMatrix(e) : w.fromString(e) }, w.fromMatrix = function (e) { var t = e.substring(7).split(","); return t.length && "none" !== e || (t = [1, 0, 0, 1, 0, 0]), new w(f(t[4]), f(t[5]), parseFloat(t[0])) }, w.fromString = function (e) { var t = e.split(") "), i = t[0].substring(q.globals.translate.length + 1).split(","), n = t.length > 1 ? t[1].substring(6) : 1, o = i.length > 1 ? i[0] : 0, r = i.length > 1 ? i[1] : 0; return new w(o, r, n) }, w.prototype.toString = function () { var e = g[q.globals.translate].suffix || ""; return q.globals.translate + "(" + this.x + "px, " + this.y + "px" + e + ") scale(" + this.scale + ")" }; var y = function (e) { if (!e || !e.style[t]) return this.x = 0, void (this.y = 0); var i = e.style[t].split(" "); this.x = parseFloat(i[0]), this.y = parseFloat(i[1]) }; function b(e) { return e.exifdata ? e.exifdata.Orientation : 1 } function x(e, t, i) { var n = t.width, o = t.height, r = e.getContext("2d"); switch (e.width = t.width, e.height = t.height, r.save(), i) { case 2: r.translate(n, 0), r.scale(-1, 1); break; case 3: r.translate(n, o), r.rotate(180 * Math.PI / 180); break; case 4: r.translate(0, o), r.scale(1, -1); break; case 5: e.width = o, e.height = n, r.rotate(90 * Math.PI / 180), r.scale(1, -1); break; case 6: e.width = o, e.height = n, r.rotate(90 * Math.PI / 180), r.translate(0, -o); break; case 7: e.width = o, e.height = n, r.rotate(-90 * Math.PI / 180), r.translate(-n, o), r.scale(1, -1); break; case 8: e.width = o, e.height = n, r.translate(0, n), r.rotate(-90 * Math.PI / 180) }r.drawImage(t, 0, 0, n, o), r.restore() } function C() { var e, t, o, r, a, s = this.options.viewport.type ? "cr-vp-" + this.options.viewport.type : null; this.options.useCanvas = this.options.enableOrientation || E.call(this), this.data = {}, this.elements = {}, e = this.elements.boundary = document.createElement("div"), t = this.elements.viewport = document.createElement("div"), this.elements.img = document.createElement("img"), o = this.elements.overlay = document.createElement("div"), this.options.useCanvas ? (this.elements.canvas = document.createElement("canvas"), this.elements.preview = this.elements.canvas) : this.elements.preview = this.elements.img, d(e, "cr-boundary"), e.setAttribute("aria-dropeffect", "none"), r = this.options.boundary.width, a = this.options.boundary.height, p(e, { width: r + (isNaN(r) ? "" : "px"), height: a + (isNaN(a) ? "" : "px") }), d(t, "cr-viewport"), s && d(t, s), p(t, { width: this.options.viewport.width + "px", height: this.options.viewport.height + "px" }), t.setAttribute("tabindex", 0), d(this.elements.preview, "cr-image"), m(this.elements.preview, { alt: "preview", "aria-grabbed": "false" }), d(o, "cr-overlay"), this.element.appendChild(e), e.appendChild(this.elements.preview), e.appendChild(t), e.appendChild(o), d(this.element, "croppie-container"), this.options.customClass && d(this.element, this.options.customClass), function () { var e, t, o, r, a, s = this, l = !1; function h(e, t) { var i = s.elements.preview.getBoundingClientRect(), n = a.y + t, o = a.x + e; s.options.enforceBoundary ? (r.top > i.top + t && r.bottom < i.bottom + t && (a.y = n), r.left > i.left + e && r.right < i.right + e && (a.x = o)) : (a.y = n, a.x = o) } function u(e) { s.elements.preview.setAttribute("aria-grabbed", e), s.elements.boundary.setAttribute("aria-dropeffect", e ? "move" : "none") } function d(i) { if ((void 0 === i.button || 0 === i.button) && (i.preventDefault(), !l)) { if (l = !0, e = i.pageX, t = i.pageY, i.touches) { var o = i.touches[0]; e = o.pageX, t = o.pageY } u(l), a = w.parse(s.elements.preview), window.addEventListener("mousemove", m), window.addEventListener("touchmove", m), window.addEventListener("mouseup", f), window.addEventListener("touchend", f), document.body.style[n] = "none", r = s.elements.viewport.getBoundingClientRect() } } function m(n) { n.preventDefault(); var r = n.pageX, l = n.pageY; if (n.touches) { var u = n.touches[0]; r = u.pageX, l = u.pageY } var d = r - e, m = l - t, f = {}; if ("touchmove" === n.type && n.touches.length > 1) { var v = n.touches[0], g = n.touches[1], w = Math.sqrt((v.pageX - g.pageX) * (v.pageX - g.pageX) + (v.pageY - g.pageY) * (v.pageY - g.pageY)); o || (o = w / s._currentZoom); var y = w / o; return L.call(s, y), void c(s.elements.zoomer) } h(d, m), f[i] = a.toString(), p(s.elements.preview, f), R.call(s), t = l, e = r } function f() { u(l = !1), window.removeEventListener("mousemove", m), window.removeEventListener("touchmove", m), window.removeEventListener("mouseup", f), window.removeEventListener("touchend", f), document.body.style[n] = "", B.call(s), Y.call(s), o = 0 } s.elements.overlay.addEventListener("mousedown", d), s.elements.viewport.addEventListener("keydown", function (e) { var t = 37, l = 38, u = 39, c = 40; if (!e.shiftKey || e.keyCode !== l && e.keyCode !== c) { if (s.options.enableKeyMovement && e.keyCode >= 37 && e.keyCode <= 40) { e.preventDefault(); var d = function (e) { switch (e) { case t: return [1, 0]; case l: return [0, 1]; case u: return [-1, 0]; case c: return [0, -1] } }(e.keyCode); a = w.parse(s.elements.preview), document.body.style[n] = "none", r = s.elements.viewport.getBoundingClientRect(), function (e) { var t = e[0], r = e[1], l = {}; h(t, r), l[i] = a.toString(), p(s.elements.preview, l), R.call(s), document.body.style[n] = "", B.call(s), Y.call(s), o = 0 }(d) } } else { var m = 0; m = e.keyCode === l ? parseFloat(s.elements.zoomer.value, 10) + parseFloat(s.elements.zoomer.step, 10) : parseFloat(s.elements.zoomer.value, 10) - parseFloat(s.elements.zoomer.step, 10), s.setZoom(m) } }), s.elements.overlay.addEventListener("touchstart", d) }.call(this), this.options.enableZoom && function () { var e = this, t = e.elements.zoomerWrap = document.createElement("div"), i = e.elements.zoomer = document.createElement("input"); function n() { _.call(e, { value: parseFloat(i.value), origin: new y(e.elements.preview), viewportRect: e.elements.viewport.getBoundingClientRect(), transform: w.parse(e.elements.preview) }) } function o(t) { var i, o; if ("ctrl" === e.options.mouseWheelZoom && !0 !== t.ctrlKey) return 0; i = t.wheelDelta ? t.wheelDelta / 1200 : t.deltaY ? t.deltaY / 1060 : t.detail ? t.detail / -60 : 0, o = e._currentZoom + i * e._currentZoom, t.preventDefault(), L.call(e, o), n.call(e) } d(t, "cr-slider-wrap"), d(i, "cr-slider"), i.type = "range", i.step = "0.0001", i.value = 1, i.style.display = e.options.showZoomer ? "" : "none", i.setAttribute("aria-label", "zoom"), e.element.appendChild(t), t.appendChild(i), e._currentZoom = 1, e.elements.zoomer.addEventListener("input", n), e.elements.zoomer.addEventListener("change", n), e.options.mouseWheelZoom && (e.elements.boundary.addEventListener("mousewheel", o), e.elements.boundary.addEventListener("DOMMouseScroll", o)) }.call(this), this.options.enableResize && function () { var e, t, i, o, r, a, s, l = this, h = document.createElement("div"), u = !1, c = 50; d(h, "cr-resizer"), p(h, { width: this.options.viewport.width + "px", height: this.options.viewport.height + "px" }), this.options.resizeControls.height && (d(a = document.createElement("div"), "cr-resizer-vertical"), h.appendChild(a)); this.options.resizeControls.width && (d(s = document.createElement("div"), "cr-resizer-horisontal"), h.appendChild(s)); function m(a) { if ((void 0 === a.button || 0 === a.button) && (a.preventDefault(), !u)) { var s = l.elements.overlay.getBoundingClientRect(); if (u = !0, t = a.pageX, i = a.pageY, e = -1 !== a.currentTarget.className.indexOf("vertical") ? "v" : "h", o = s.width, r = s.height, a.touches) { var h = a.touches[0]; t = h.pageX, i = h.pageY } window.addEventListener("mousemove", f), window.addEventListener("touchmove", f), window.addEventListener("mouseup", v), window.addEventListener("touchend", v), document.body.style[n] = "none" } } function f(n) { var a = n.pageX, s = n.pageY; if (n.preventDefault(), n.touches) { var u = n.touches[0]; a = u.pageX, s = u.pageY } var d = a - t, m = s - i, f = l.options.viewport.height + m, v = l.options.viewport.width + d; "v" === e && f >= c && f <= r ? (p(h, { height: f + "px" }), l.options.boundary.height += m, p(l.elements.boundary, { height: l.options.boundary.height + "px" }), l.options.viewport.height += m, p(l.elements.viewport, { height: l.options.viewport.height + "px" })) : "h" === e && v >= c && v <= o && (p(h, { width: v + "px" }), l.options.boundary.width += d, p(l.elements.boundary, { width: l.options.boundary.width + "px" }), l.options.viewport.width += d, p(l.elements.viewport, { width: l.options.viewport.width + "px" })), R.call(l), k.call(l), B.call(l), Y.call(l), i = s, t = a } function v() { u = !1, window.removeEventListener("mousemove", f), window.removeEventListener("touchmove", f), window.removeEventListener("mouseup", v), window.removeEventListener("touchend", v), document.body.style[n] = "" } a && (a.addEventListener("mousedown", m), a.addEventListener("touchstart", m)); s && (s.addEventListener("mousedown", m), s.addEventListener("touchstart", m)); this.elements.boundary.appendChild(h) }.call(this) } function E() { return this.options.enableExif && window.EXIF } function L(e) { if (this.options.enableZoom) { var t = this.elements.zoomer, i = j(e, 4); t.value = Math.max(t.min, Math.min(t.max, i)) } } function _(e) { var n = this, o = e ? e.transform : w.parse(n.elements.preview), r = e ? e.viewportRect : n.elements.viewport.getBoundingClientRect(), a = e ? e.origin : new y(n.elements.preview); function s() { var e = {}; e[i] = o.toString(), e[t] = a.toString(), p(n.elements.preview, e) } if (n._currentZoom = e ? e.value : n._currentZoom, o.scale = n._currentZoom, n.elements.zoomer.setAttribute("aria-valuenow", n._currentZoom), s(), n.options.enforceBoundary) { var l = function (e) { var t = this._currentZoom, i = e.width, n = e.height, o = this.elements.boundary.clientWidth / 2, r = this.elements.boundary.clientHeight / 2, a = this.elements.preview.getBoundingClientRect(), s = a.width, l = a.height, h = i / 2, u = n / 2, c = -1 * (h / t - o), p = -1 * (u / t - r), d = 1 / t * h, m = 1 / t * u; return { translate: { maxX: c, minX: c - (s * (1 / t) - i * (1 / t)), maxY: p, minY: p - (l * (1 / t) - n * (1 / t)) }, origin: { maxX: s * (1 / t) - d, minX: d, maxY: l * (1 / t) - m, minY: m } } }.call(n, r), h = l.translate, u = l.origin; o.x >= h.maxX && (a.x = u.minX, o.x = h.maxX), o.x <= h.minX && (a.x = u.maxX, o.x = h.minX), o.y >= h.maxY && (a.y = u.minY, o.y = h.maxY), o.y <= h.minY && (a.y = u.maxY, o.y = h.minY) } s(), X.call(n), Y.call(n) } function B() { var e = this._currentZoom, n = this.elements.preview.getBoundingClientRect(), o = this.elements.viewport.getBoundingClientRect(), r = w.parse(this.elements.preview.style[i]), a = new y(this.elements.preview), s = o.top - n.top + o.height / 2, l = o.left - n.left + o.width / 2, h = {}, u = {}; h.y = s / e, h.x = l / e, u.y = (h.y - a.y) * (1 - e), u.x = (h.x - a.x) * (1 - e), r.x -= u.x, r.y -= u.y; var c = {}; c[t] = h.x + "px " + h.y + "px", c[i] = r.toString(), p(this.elements.preview, c) } function R() { if (this.elements) { var e = this.elements.boundary.getBoundingClientRect(), t = this.elements.preview.getBoundingClientRect(); p(this.elements.overlay, { width: t.width + "px", height: t.height + "px", top: t.top - e.top + "px", left: t.left - e.left + "px" }) } } y.prototype.toString = function () { return this.x + "px " + this.y + "px" }; var Z, z, M, I, X = (Z = R, z = 500, function () { var e = this, t = arguments, i = M && !I; clearTimeout(I), I = setTimeout(function () { I = null, M || Z.apply(e, t) }, z), i && Z.apply(e, t) }); function Y() { var e, t = this.get(); F.call(this) && (this.options.update.call(this, t), this.$ && "undefined" == typeof Prototype ? this.$(this.element).trigger("update.croppie", t) : (window.CustomEvent ? e = new CustomEvent("update", { detail: t }) : (e = document.createEvent("CustomEvent")).initCustomEvent("update", !0, !0, t), this.element.dispatchEvent(e))) } function F() { return this.elements.preview.offsetHeight > 0 && this.elements.preview.offsetWidth > 0 } function W() { var e, n = {}, o = this.elements.preview, r = new w(0, 0, 1), a = new y; F.call(this) && !this.data.bound && (this.data.bound = !0, n[i] = r.toString(), n[t] = a.toString(), n.opacity = 1, p(o, n), e = this.elements.preview.getBoundingClientRect(), this._originalImageWidth = e.width, this._originalImageHeight = e.height, this.data.orientation = b(this.elements.img), this.options.enableZoom ? k.call(this, !0) : this._currentZoom = 1, r.scale = this._currentZoom, n[i] = r.toString(), p(o, n), this.data.points.length ? function (e) { if (4 !== e.length) throw "Croppie - Invalid number of points supplied: " + e; var n = e[2] - e[0], o = this.elements.viewport.getBoundingClientRect(), r = this.elements.boundary.getBoundingClientRect(), a = { left: o.left - r.left, top: o.top - r.top }, s = o.width / n, l = e[1], h = e[0], u = -1 * e[1] + a.top, c = -1 * e[0] + a.left, d = {}; d[t] = h + "px " + l + "px", d[i] = new w(c, u, s).toString(), p(this.elements.preview, d), L.call(this, s), this._currentZoom = s }.call(this, this.data.points) : function () { var e = this.elements.preview.getBoundingClientRect(), t = this.elements.viewport.getBoundingClientRect(), n = this.elements.boundary.getBoundingClientRect(), o = t.left - n.left, r = t.top - n.top, a = o - (e.width - t.width) / 2, s = r - (e.height - t.height) / 2, l = new w(a, s, this._currentZoom); p(this.elements.preview, i, l.toString()) }.call(this), B.call(this), R.call(this)) } function k(e) { var t, i, n, o, r = 0, a = this.options.maxZoom || 1.5, s = this.elements.zoomer, l = parseFloat(s.value), h = this.elements.boundary.getBoundingClientRect(), u = v(this.elements.img, this.data.orientation), p = this.elements.viewport.getBoundingClientRect(); this.options.enforceBoundary && (n = p.width / u.width, o = p.height / u.height, r = Math.max(n, o)), r >= a && (a = r + 1), s.min = j(r, 4), s.max = j(a, 4), !e && (l < s.min || l > s.max) ? L.call(this, l < s.min ? s.min : s.max) : e && (i = Math.max(h.width / u.width, h.height / u.height), t = null !== this.data.boundZoom ? this.data.boundZoom : i, L.call(this, t)), c(s) } function A(e) { var t = e.points, i = f(t[0]), n = f(t[1]), o = f(t[2]) - i, r = f(t[3]) - n, a = e.circle, s = document.createElement("canvas"), l = s.getContext("2d"), h = e.outputWidth || o, u = e.outputHeight || r; e.outputWidth && e.outputHeight; return s.width = h, s.height = u, e.backgroundColor && (l.fillStyle = e.backgroundColor, l.fillRect(0, 0, h, u)), !1 !== this.options.enforceBoundary && (o = Math.min(o, this._originalImageWidth), r = Math.min(r, this._originalImageHeight)), l.drawImage(this.elements.preview, i, n, o, r, 0, 0, h, u), a && (l.fillStyle = "#fff", l.globalCompositeOperation = "destination-in", l.beginPath(), l.arc(s.width / 2, s.height / 2, s.width / 2, 0, 2 * Math.PI, !0), l.closePath(), l.fill()), s } function O(e, t) { var i, n, o, r, a = this, s = [], l = null, h = E.call(a); if ("string" == typeof e) i = e, e = {}; else if (Array.isArray(e)) s = e.slice(); else { if (void 0 === e && a.data.url) return W.call(a), Y.call(a), null; i = e.url, s = e.points || [], l = void 0 === e.zoom ? null : e.zoom } return a.data.bound = !1, a.data.url = i || a.data.url, a.data.boundZoom = l, (n = i, o = h, r = new Image, r.style.opacity = 0, new Promise(function (e) { function t() { r.style.opacity = 1, setTimeout(function () { e(r) }, 1) } r.removeAttribute("crossOrigin"), n.match(/^https?:\/\/|^\/\//) && r.setAttribute("crossOrigin", "anonymous"), r.onload = function () { o ? EXIF.getData(r, function () { t() }) : t() }, r.src = n })).then(function (i) { if (function (e) { this.elements.img.parentNode && (Array.prototype.forEach.call(this.elements.img.classList, function (t) { e.classList.add(t) }), this.elements.img.parentNode.replaceChild(e, this.elements.img), this.elements.preview = e), this.elements.img = e }.call(a, i), s.length) a.options.relative && (s = [s[0] * i.naturalWidth / 100, s[1] * i.naturalHeight / 100, s[2] * i.naturalWidth / 100, s[3] * i.naturalHeight / 100]); else { var n, o, r = v(i), l = a.elements.viewport.getBoundingClientRect(), h = l.width / l.height; r.width / r.height > h ? n = (o = r.height) * h : (n = r.width, o = r.height / h); var u = (r.width - n) / 2, c = (r.height - o) / 2, p = u + n, d = c + o; a.data.points = [u, c, p, d] } a.data.points = s.map(function (e) { return parseFloat(e) }), a.options.useCanvas && function (e) { var t = this.elements.canvas, i = this.elements.img, n = t.getContext("2d"), o = E.call(this); e = this.options.enableOrientation && e, n.clearRect(0, 0, t.width, t.height), t.width = i.width, t.height = i.height, o && !e ? x(t, i, f(b(i) || 0)) : e && x(t, i, e) }.call(a, e.orientation || 1), W.call(a), Y.call(a), t && t() }).catch(function (e) { console.error("Croppie:" + e) }) } function j(e, t) { return parseFloat(e).toFixed(t || 0) } function H() { var e = this.elements.preview.getBoundingClientRect(), t = this.elements.viewport.getBoundingClientRect(), i = t.left - e.left, n = t.top - e.top, o = (t.width - this.elements.viewport.offsetWidth) / 2, r = (t.height - this.elements.viewport.offsetHeight) / 2, a = i + this.elements.viewport.offsetWidth + o, s = n + this.elements.viewport.offsetHeight + r, l = this._currentZoom; (l === 1 / 0 || isNaN(l)) && (l = 1); var h = this.options.enforceBoundary ? 0 : Number.NEGATIVE_INFINITY; return i = Math.max(h, i / l), n = Math.max(h, n / l), a = Math.max(h, a / l), s = Math.max(h, s / l), { points: [j(i), j(n), j(a), j(s)], zoom: l, orientation: this.data.orientation } } var N = { type: "canvas", format: "png", quality: 1 }, S = ["jpeg", "webp", "png"]; function P(e) { var t = this, i = H.call(t), n = h(u(N), u(e)), o = "string" == typeof e ? e : n.type || "base64", r = n.size || "viewport", a = n.format, s = n.quality, l = n.backgroundColor, c = "boolean" == typeof n.circle ? n.circle : "circle" === t.options.viewport.type, m = t.elements.viewport.getBoundingClientRect(), f = m.width / m.height; return "viewport" === r ? (i.outputWidth = m.width, i.outputHeight = m.height) : "object" == typeof r && (r.width && r.height ? (i.outputWidth = r.width, i.outputHeight = r.height) : r.width ? (i.outputWidth = r.width, i.outputHeight = r.width / f) : r.height && (i.outputWidth = r.height * f, i.outputHeight = r.height)), S.indexOf(a) > -1 && (i.format = "image/" + a, i.quality = s), i.circle = c, i.url = t.data.url, i.backgroundColor = l, new Promise(function (e, n) { switch (o.toLowerCase()) { case "rawcanvas": e(A.call(t, i)); break; case "canvas": case "base64": e(function (e) { return A.call(this, e).toDataURL(e.format, e.quality) }.call(t, i)); break; case "blob": (function (e) { var t = this; return new Promise(function (i, n) { A.call(t, e).toBlob(function (e) { i(e) }, e.format, e.quality) }) }).call(t, i).then(e); break; default: e(function (e) { var t = e.points, i = document.createElement("div"), n = document.createElement("img"), o = t[2] - t[0], r = t[3] - t[1]; return d(i, "croppie-result"), i.appendChild(n), p(n, { left: -1 * t[0] + "px", top: -1 * t[1] + "px" }), n.src = e.url, p(i, { width: o + "px", height: r + "px" }), i }.call(t, i)) } }) } function D(e) { if (!this.options.useCanvas || !this.options.enableOrientation) throw "Croppie: Cannot rotate without enableOrientation && EXIF.js included"; var t, i, n, o, r, l = this.elements.canvas; this.data.orientation = (t = this.data.orientation, i = e, n = a.indexOf(t) > -1 ? a : s, o = n.indexOf(t), r = i / 90 % n.length, n[(n.length + o + r % n.length) % n.length]), x(l, this.elements.img, this.data.orientation), k.call(this), _.call(this), copy = null } if (window.jQuery) { var T = window.jQuery; T.fn.croppie = function (e) { if ("string" === typeof e) { var t = Array.prototype.slice.call(arguments, 1), i = T(this).data("croppie"); return "get" === e ? i.get() : "result" === e ? i.result.apply(i, t) : "bind" === e ? i.bind.apply(i, t) : this.each(function () { var i = T(this).data("croppie"); if (i) { var n = i[e]; if (!T.isFunction(n)) throw "Croppie " + e + " method not found"; n.apply(i, t), "destroy" === e && T(this).removeData("croppie") } }) } return this.each(function () { var t = new q(this, e); t.$ = T, T(this).data("croppie", t) }) } } function q(e, t) { if (e.className.indexOf("croppie-container") > -1) throw new Error("Croppie: Can't initialize croppie more than once"); if (this.element = e, this.options = h(u(q.defaults), t), "img" === this.element.tagName.toLowerCase()) { var i = this.element; d(i, "cr-original-image"), m(i, { "aria-hidden": "true", alt: "" }); var n = document.createElement("div"); this.element.parentNode.appendChild(n), n.appendChild(i), this.element = n, this.options.url = this.options.url || i.src } if (C.call(this), this.options.url) { var o = { url: this.options.url, points: this.options.points }; delete this.options.url, delete this.options.points, O.call(this, o) } } q.defaults = { viewport: { width: 100, height: 100, type: "square" }, boundary: {}, orientationControls: { enabled: !0, leftClass: "", rightClass: "" }, resizeControls: { width: !0, height: !0 }, customClass: "", showZoomer: !0, enableZoom: !0, enableResize: !1, mouseWheelZoom: !0, enableExif: !1, enforceBoundary: !0, enableOrientation: !1, enableKeyMovement: !0, update: function () { } }, q.globals = { translate: "translate3d" }, h(q.prototype, { bind: function (e, t) { return O.call(this, e, t) }, get: function () { var e = H.call(this), t = e.points; return this.options.relative && (t[0] /= this.elements.img.naturalWidth / 100, t[1] /= this.elements.img.naturalHeight / 100, t[2] /= this.elements.img.naturalWidth / 100, t[3] /= this.elements.img.naturalHeight / 100), e }, result: function (e) { return P.call(this, e) }, refresh: function () { return function () { W.call(this) }.call(this) }, setZoom: function (e) { L.call(this, e), c(this.elements.zoomer) }, rotate: function (e) { D.call(this, e) }, destroy: function () { return function () { var e, t; this.element.removeChild(this.elements.boundary), e = this.element, t = "croppie-container", e.classList ? e.classList.remove(t) : e.className = e.className.replace(t, ""), this.options.enableZoom && this.element.removeChild(this.elements.zoomerWrap), delete this.elements }.call(this) } }), e.Croppie = window.Croppie = q });
/* store.js - Copyright (c) 2010-2017 Marcus Westin */
!function (e) { if ("object" == typeof exports && "undefined" != typeof module) module.exports = e(); else if ("function" == typeof define && define.amd) define([], e); else { var t; t = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, t.store = e() } }(function () { var define, module, exports; return function e(t, r, n) { function o(u, a) { if (!r[u]) { if (!t[u]) { var s = "function" == typeof require && require; if (!a && s) return s(u, !0); if (i) return i(u, !0); var c = new Error("Cannot find module '" + u + "'"); throw c.code = "MODULE_NOT_FOUND", c } var f = r[u] = { exports: {} }; t[u][0].call(f.exports, function (e) { var r = t[u][1][e]; return o(r ? r : e) }, f, f.exports, e, t, r, n) } return r[u].exports } for (var i = "function" == typeof require && require, u = 0; u < n.length; u++)o(n[u]); return o }({ 1: [function (e, t, r) { "use strict"; var n = e("../src/store-engine"), o = e("../storages/all"), i = [e("../plugins/json2")]; t.exports = n.createStore(o, i) }, { "../plugins/json2": 2, "../src/store-engine": 4, "../storages/all": 6 }], 2: [function (e, t, r) { "use strict"; function n() { return e("./lib/json2"), {} } t.exports = n }, { "./lib/json2": 3 }], 3: [function (require, module, exports) { "use strict"; var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) { return typeof e } : function (e) { return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e }; "object" !== ("undefined" == typeof JSON ? "undefined" : _typeof(JSON)) && (JSON = {}), function () { function f(e) { return e < 10 ? "0" + e : e } function this_value() { return this.valueOf() } function quote(e) { return rx_escapable.lastIndex = 0, rx_escapable.test(e) ? '"' + e.replace(rx_escapable, function (e) { var t = meta[e]; return "string" == typeof t ? t : "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice(-4) }) + '"' : '"' + e + '"' } function str(e, t) { var r, n, o, i, u, a = gap, s = t[e]; switch (s && "object" === ("undefined" == typeof s ? "undefined" : _typeof(s)) && "function" == typeof s.toJSON && (s = s.toJSON(e)), "function" == typeof rep && (s = rep.call(t, e, s)), "undefined" == typeof s ? "undefined" : _typeof(s)) { case "string": return quote(s); case "number": return isFinite(s) ? String(s) : "null"; case "boolean": case "null": return String(s); case "object": if (!s) return "null"; if (gap += indent, u = [], "[object Array]" === Object.prototype.toString.apply(s)) { for (i = s.length, r = 0; r < i; r += 1)u[r] = str(r, s) || "null"; return o = 0 === u.length ? "[]" : gap ? "[\n" + gap + u.join(",\n" + gap) + "\n" + a + "]" : "[" + u.join(",") + "]", gap = a, o } if (rep && "object" === ("undefined" == typeof rep ? "undefined" : _typeof(rep))) for (i = rep.length, r = 0; r < i; r += 1)"string" == typeof rep[r] && (n = rep[r], o = str(n, s), o && u.push(quote(n) + (gap ? ": " : ":") + o)); else for (n in s) Object.prototype.hasOwnProperty.call(s, n) && (o = str(n, s), o && u.push(quote(n) + (gap ? ": " : ":") + o)); return o = 0 === u.length ? "{}" : gap ? "{\n" + gap + u.join(",\n" + gap) + "\n" + a + "}" : "{" + u.join(",") + "}", gap = a, o } } var rx_one = /^[\],:{}\s]*$/, rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, rx_four = /(?:^|:|,)(?:\s*\[)+/g, rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g; "function" != typeof Date.prototype.toJSON && (Date.prototype.toJSON = function () { return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null }, Boolean.prototype.toJSON = this_value, Number.prototype.toJSON = this_value, String.prototype.toJSON = this_value); var gap, indent, meta, rep; "function" != typeof JSON.stringify && (meta = { "\b": "\\b", "\t": "\\t", "\n": "\\n", "\f": "\\f", "\r": "\\r", '"': '\\"', "\\": "\\\\" }, JSON.stringify = function (e, t, r) { var n; if (gap = "", indent = "", "number" == typeof r) for (n = 0; n < r; n += 1)indent += " "; else "string" == typeof r && (indent = r); if (rep = t, t && "function" != typeof t && ("object" !== ("undefined" == typeof t ? "undefined" : _typeof(t)) || "number" != typeof t.length)) throw new Error("JSON.stringify"); return str("", { "": e }) }), "function" != typeof JSON.parse && (JSON.parse = function (text, reviver) { function walk(e, t) { var r, n, o = e[t]; if (o && "object" === ("undefined" == typeof o ? "undefined" : _typeof(o))) for (r in o) Object.prototype.hasOwnProperty.call(o, r) && (n = walk(o, r), void 0 !== n ? o[r] = n : delete o[r]); return reviver.call(e, t, o) } var j; if (text = String(text), rx_dangerous.lastIndex = 0, rx_dangerous.test(text) && (text = text.replace(rx_dangerous, function (e) { return "\\u" + ("0000" + e.charCodeAt(0).toString(16)).slice(-4) })), rx_one.test(text.replace(rx_two, "@").replace(rx_three, "]").replace(rx_four, ""))) return j = eval("(" + text + ")"), "function" == typeof reviver ? walk({ "": j }, "") : j; throw new SyntaxError("JSON.parse") }) }() }, {}], 4: [function (e, t, r) { "use strict"; function n(e, t) { var r = { _seenPlugins: [], _namespacePrefix: "", _namespaceRegexp: null, _legalNamespace: /^[a-zA-Z0-9_\-]+$/, _storage: function () { if (!this.enabled) throw new Error("store.js: No supported storage has been added! Add one (e.g store.addStorage(require('store/storages/cookieStorage')) or use a build with more built-in storages (e.g https://github.com/marcuswestin/store.js/tree/master/dist/store.legacy.min.js)"); return this._storage.resolved }, _testStorage: function (e) { try { var t = "__storejs__test__"; e.write(t, t); var r = e.read(t) === t; return e.remove(t), r } catch (n) { return !1 } }, _assignPluginFnProp: function (e, t) { var r = this[t]; this[t] = function () { function t() { if (r) { var e = r.apply(o, t.args); return delete t.args, e } } var n = Array.prototype.slice.call(arguments, 0), o = this, i = [t].concat(n); return t.args = n, e.apply(o, i) } }, _serialize: function (e) { return JSON.stringify(e) }, _deserialize: function (e, t) { if (!e) return t; var r = ""; try { r = JSON.parse(e) } catch (n) { r = e } return void 0 !== r ? r : t } }, n = a(r, l); return u(e, function (e) { n.addStorage(e) }), u(t, function (e) { n.addPlugin(e) }), n } var o = e("./util"), i = o.pluck, u = o.each, a = o.create, s = o.isList, c = o.isFunction, f = o.isObject; t.exports = { createStore: n }; var l = { version: "2.0.3", enabled: !1, storage: null, addStorage: function (e) { this.enabled || this._testStorage(e) && (this._storage.resolved = e, this.enabled = !0, this.storage = e.name) }, addPlugin: function (e) { var t = this; if (s(e)) return void u(e, function (e) { t.addPlugin(e) }); var r = i(this._seenPlugins, function (t) { return e === t }); if (!r) { if (this._seenPlugins.push(e), !c(e)) throw new Error("Plugins must be function values that return objects"); var n = e.call(this); if (!f(n)) throw new Error("Plugins must return an object of function properties"); u(n, function (r, n) { if (!c(r)) throw new Error("Bad plugin property: " + n + " from plugin " + e.name + ". Plugins should only return functions."); t._assignPluginFnProp(r, n) }) } }, get: function (e, t) { var r = this._storage().read(this._namespacePrefix + e); return this._deserialize(r, t) }, set: function (e, t) { return void 0 === t ? this.remove(e) : (this._storage().write(this._namespacePrefix + e, this._serialize(t)), t) }, remove: function (e) { this._storage().remove(this._namespacePrefix + e) }, each: function (e) { var t = this; this._storage().each(function (r, n) { e(t._deserialize(r), n.replace(t._namespaceRegexp, "")) }) }, clearAll: function () { this._storage().clearAll() }, hasNamespace: function (e) { return this._namespacePrefix == "__storejs_" + e + "_" }, namespace: function (e) { if (!this._legalNamespace.test(e)) throw new Error("store.js namespaces can only have alhpanumerics + underscores and dashes"); var t = "__storejs_" + e + "_"; return a(this, { _namespacePrefix: t, _namespaceRegexp: t ? new RegExp("^" + t) : null }) }, createStore: function (e, t) { return n(e, t) } } }, { "./util": 5 }], 5: [function (e, t, r) { (function (e) { "use strict"; function r() { return Object.assign ? Object.assign : function (e, t, r, n) { for (var o = 1; o < arguments.length; o++)a(Object(arguments[o]), function (t, r) { e[r] = t }); return e } } function n() { if (Object.create) return function (e, t, r, n) { var o = u(arguments, 1); return g.apply(this, [Object.create(e)].concat(o)) }; var e = function () { }; return function (t, r, n, o) { var i = u(arguments, 1); return e.prototype = t, g.apply(this, [new e].concat(i)) } } function o() { return String.prototype.trim ? function (e) { return String.prototype.trim.call(e) } : function (e) { return e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "") } } function i(e, t) { return function () { return t.apply(e, Array.prototype.slice.call(arguments, 0)) } } function u(e, t) { return Array.prototype.slice.call(e, t || 0) } function a(e, t) { c(e, function (e, r) { return t(e, r), !1 }) } function s(e, t) { var r = f(e) ? [] : {}; return c(e, function (e, n) { return r[n] = t(e, n), !1 }), r } function c(e, t) { if (f(e)) { for (var r = 0; r < e.length; r++)if (t(e[r], r)) return e[r] } else for (var n in e) if (e.hasOwnProperty(n) && t(e[n], n)) return e[n] } function f(e) { return null != e && "function" != typeof e && "number" == typeof e.length } function l(e) { return e && "[object Function]" === {}.toString.call(e) } function p(e) { return e && "[object Object]" === {}.toString.call(e) } var g = r(), d = n(), v = o(), h = "undefined" != typeof window ? window : e; t.exports = { assign: g, create: d, trim: v, bind: i, slice: u, each: a, map: s, pluck: c, isList: f, isFunction: l, isObject: p, Global: h } }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {}) }, {}], 6: [function (e, t, r) { "use strict"; t.exports = { localStorage: e("./localStorage"), "oldFF-globalStorage": e("./oldFF-globalStorage"), "oldIE-userDataStorage": e("./oldIE-userDataStorage"), cookieStorage: e("./cookieStorage"), sessionStorage: e("./sessionStorage"), memoryStorage: e("./memoryStorage") } }, { "./cookieStorage": 7, "./localStorage": 8, "./memoryStorage": 9, "./oldFF-globalStorage": 10, "./oldIE-userDataStorage": 11, "./sessionStorage": 12 }], 7: [function (e, t, r) { "use strict"; function n(e) { if (!e || !s(e)) return null; var t = "(?:^|.*;\\s*)" + escape(e).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"; return unescape(p.cookie.replace(new RegExp(t), "$1")) } function o(e) { for (var t = p.cookie.split(/; ?/g), r = t.length - 1; r >= 0; r--)if (l(t[r])) { var n = t[r].split("="), o = unescape(n[0]), i = unescape(n[1]); e(i, o) } } function i(e, t) { e && (p.cookie = escape(e) + "=" + escape(t) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/") } function u(e) { e && s(e) && (p.cookie = escape(e) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/") } function a() { o(function (e, t) { u(t) }) } function s(e) { return new RegExp("(?:^|;\\s*)" + escape(e).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=").test(p.cookie) } var c = e("../src/util"), f = c.Global, l = c.trim; t.exports = { name: "cookieStorage", read: n, write: i, each: o, remove: u, clearAll: a }; var p = f.document }, { "../src/util": 5 }], 8: [function (e, t, r) { "use strict"; function n() { return f.localStorage } function o(e) { return n().getItem(e) } function i(e, t) { return n().setItem(e, t) } function u(e) { for (var t = n().length - 1; t >= 0; t--) { var r = n().key(t); e(o(r), r) } } function a(e) { return n().removeItem(e) } function s() { return n().clear() } var c = e("../src/util"), f = c.Global; t.exports = { name: "localStorage", read: o, write: i, each: u, remove: a, clearAll: s } }, { "../src/util": 5 }], 9: [function (e, t, r) { "use strict"; function n(e) { return s[e] } function o(e, t) { s[e] = t } function i(e) { for (var t in s) s.hasOwnProperty(t) && e(s[t], t) } function u(e) { delete s[e] } function a(e) { s = {} } t.exports = { name: "memoryStorage", read: n, write: o, each: i, remove: u, clearAll: a }; var s = {} }, {}], 10: [function (e, t, r) { "use strict"; function n(e) { return f[e] } function o(e, t) { f[e] = t } function i(e) { for (var t = f.length - 1; t >= 0; t--) { var r = f.key(t); e(f[r], r) } } function u(e) { return f.removeItem(e) } function a() { i(function (e, t) { delete f[e] }) } var s = e("../src/util"), c = s.Global; t.exports = { name: "oldFF-globalStorage", read: n, write: o, each: i, remove: u, clearAll: a }; var f = c.globalStorage }, { "../src/util": 5 }], 11: [function (e, t, r) { "use strict"; function n(e, t) { if (!v) { var r = s(e); d(function (e) { e.setAttribute(r, t), e.save(p) }) } } function o(e) { if (!v) { var t = s(e), r = null; return d(function (e) { r = e.getAttribute(t) }), r } } function i(e) { d(function (t) { for (var r = t.XMLDocument.documentElement.attributes, n = r.length - 1; n >= 0; n--) { var o = r[n]; e(t.getAttribute(o.name), o.name) } }) } function u(e) { var t = s(e); d(function (e) { e.removeAttribute(t), e.save(p) }) } function a() { d(function (e) { var t = e.XMLDocument.documentElement.attributes; e.load(p); for (var r = t.length - 1; r >= 0; r--)e.removeAttribute(t[r].name); e.save(p) }) } function s(e) { return e.replace(/^d/, "___$&").replace(h, "___") } function c() { if (!g || !g.documentElement || !g.documentElement.addBehavior) return null; var e, t, r, n = "script"; try { t = new ActiveXObject("htmlfile"), t.open(), t.write("<" + n + ">document.w=window</" + n + '><iframe src="/favicon.ico"></iframe>'), t.close(), e = t.w.frames[0].document, r = e.createElement("div") } catch (o) { r = g.createElement("div"), e = g.body } return function (t) { var n = [].slice.call(arguments, 0); n.unshift(r), e.appendChild(r), r.addBehavior("#default#userData"), r.load(p), t.apply(this, n), e.removeChild(r) } } var f = e("../src/util"), l = f.Global; t.exports = { name: "oldIE-userDataStorage", write: n, read: o, each: i, remove: u, clearAll: a }; var p = "storejs", g = l.document, d = c(), v = (l.navigator ? l.navigator.userAgent : "").match(/ (MSIE 8|MSIE 9|MSIE 10)\./), h = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g") }, { "../src/util": 5 }], 12: [function (e, t, r) { "use strict"; function n() { return f.sessionStorage } function o(e) { return n().getItem(e) } function i(e, t) { return n().setItem(e, t) } function u(e) { for (var t = n().length - 1; t >= 0; t--) { var r = n().key(t); e(o(r), r) } } function a(e) { return n().removeItem(e) } function s() { return n().clear() } var c = e("../src/util"), f = c.Global; t.exports = { name: "sessionStorage", read: o, write: i, each: u, remove: a, clearAll: s } }, { "../src/util": 5 }] }, {}, [1])(1) });
var EbHeader = function () {
    var _objName = $(".EbHeadTitle #objname");
    var _btnContainer = $(".comon_header_dy #obj_icons");
    var _layout = $("#layout_div");
    var _nCounter = $(".comon_header_dy #notification-count,.objectDashB-toolbar #notification-count");

    this.insertButton = function ($html) {
        _btnContainer.prepend(`${$html}`);
    };

    this.setName = function (name) {
        _objName.text(`${name}`);
    };

    this.setNameAsHtml = function (html) {
        _objName.html(`${html}`);
    };

    this.setMode = function (html) {
        _objName.append(`${html}`);
    };

    this.hideElement = function (collectionofIds) {
        collectionofIds.forEach(function (item, i) {
            _btnContainer.find("#" + item).hide();
        }.bind(this));
    };

    this.showElement = function (collectionofIds) {
        collectionofIds.forEach(function (item, i) {
            _btnContainer.find("#" + item).show();
        }.bind(this));
    };

    this.clearHeader = function () {
        _btnContainer.empty();
    };

    this.setLocation = function (t) {
        $("#LocInfoCr_name").text(t);
    };

    this.updateNCount = function (count) {
        _nCounter.text(count);
        if (count > 0)
            _nCounter.show();
        else
            _nCounter.hide();
    };

    _layout.data("EbHeader", this);
};
var EbMenu = function (option) {
    this.login = option.Console;
    this.Tid = option.Sid;
    this.Uid = option.Uid;
    this.resultObj = null;
    this.objTypes = null;
    this.isSolOwner = false;
    this.attempt = 0;

    this.start = function () {

        $(document).bind('keypress', function (event) {
            if (event.which === 10 && event.ctrlKey)
                this.showMenuOverlay();
        }.bind(this));
        $('#quik_menu').off("click").on("click", this.showMenuOverlay.bind(this));
        $("#ebm-close").off("click").on("click", this.closeMenuOverlay.bind(this));

        if (this.login === "dc") {
            $("#ebm-new").off("click").on("click", this.toggleNewW.bind(this));
        }

        if (this.login !== "tc") {
            $("#menu_refresh").off("click").on('click', this.refreshMenu.bind(this));
            $(".Eb_quick_menu #ebm-objsearch").off("keyup").on("keyup", this.searchFAllObjects.bind(this));
            $("body").on("click", ".EbQuickMoverlaySideWRpr .backbtn", this.closeSingle.bind(this));

            if (this.login === "uc") {
                $("#ebm-objectcontainer").on("click", ".btn-setfav", this.setAsFavourite.bind(this));
                $("#ebm-objectcontainer").on("click", ".favourited", this.removeFavorite.bind(this));
            }
        }
        //$(document).off("keyup").on("keyup", this.listKeyControl.bind(this));
        $("#ebm-overlayfade").on("click", function (e) { this.showMenuOverlay(); }.bind(this));
    };

    this.reset = function () {
        $("#ebm-overlayfade").hide();
        $("#ebquickmsideoverlay").hide();
        $("#ebquickmsideoverlay #appList").empty();
        $("#ebm-objtcontainer").hide();
        $("#ebm-objtcontainer .objtypes").empty();
        $("#ebm-objectcontainer").hide();
        $("#ebm-objectcontainer .ebm-objlist").empty();
        $("#ebm-security").hide();
    };

    this.toggleNewW = function (e) {
        $("#ebm-objtcontainer").hide();
        $("#ebm-objectcontainer").hide();
        if (!$("#ebm-newobject").is(":visible")) {
            $("#ebm-newobject").css("display", "flex");
        }
        else {
            $("#ebm-newobject").hide();
        }
    };

    this.showMenuOverlay = function (e) {
        if (!$("#ebquickmsideoverlay").is(":visible")) {
            $("#ebm-overlayfade").show();
            $("#ebquickmsideoverlay").show('slide', { direction: 'left' }, function () {
                if (this.attempt <= 0 && this.login === "dc") {
                    this.LoadApps();
                    this.attempt = 1;
                }
                else {
                    this.LoadApps();
                }
                this.setCaretOnSearch();
            }.bind(this));
        }
        else {
            $("#ebm-overlayfade").hide();
            $("#ebquickmsideoverlay").hide();
        }
    };

    this.setCaretOnSearch = function () {
        $("#ebm-objsearch").focus();
    };

    this.closeMenuOverlay = function () {
        $("#ebm-overlayfade").hide();
        $("#ebquickmsideoverlay").hide();
    };

    this.LoadApps = function () {
        let o = store.get("EbMenuObjects_" + this.Tid + this.Uid + this.login) || {};
        let locId = store.get("Eb_Loc-" + this.Tid + this.Uid) || null;

        if ($.isEmptyObject(o)) {
            $("#quick_menu_load").EbLoader("show");
            $.ajax({
                url: location.origin + "/TenantUser/getSidebarMenu",
                type: "GET",
                data: {
                    LocId: locId
                }
            }).done(function (result) {
                store.set("EbMenuObjects_" + this.Tid + this.Uid + this.login + "mhtml", result);
                $("#quick_menu_load").EbLoader("hide");
                $("#ebquickmsideoverlay #appList").html(result);
                $(`li[trigger='menu']`).off("click").on("click", this.appendObType.bind(this));
                if (this.login === "uc") {
                    $('li[trigger="security"]').off("click").on("click", this.showSecurity.bind(this));
                    $("li[trigger='favourites']").off("click").on("click", this.showfavourites.bind(this));
                    $("li[trigger='favourites'] .Obj_link ").click();
                }
            }.bind(this));
        }
        else {
            $("#quick_menu_load").EbLoader("hide");
            $("#ebquickmsideoverlay #appList").html(store.get("EbMenuObjects_" + this.Tid + this.Uid + this.login + "mhtml"));
            $(`li[trigger='menu']`).off("click").on("click", this.appendObType.bind(this));
            if (this.login === "uc") {
                $('li[trigger="security"]').off("click").on("click", this.showSecurity.bind(this));
                $("li[trigger='favourites']").off("click").on("click", this.showfavourites.bind(this));
                $("li[trigger='favourites'] .Obj_link").click();
            }
        }
    };

    this.appendObType = function (e) {
        {
            $("#ebm-newobject").hide();//close new object if it is open
            $("#ebm-objtcontainer").hide();
            $("#ebm-objectcontainer").hide();
            $("#ebm-security").hide();
        }
        this.active($(e.target));
        $("#ebm-objtcontainer .objtypes").empty();
        var appid = $(e.target).closest(`li[trigger='menu']`).attr("Appid");
        if (!$.isEmptyObject(this.resultObj.Data[appid])) {
            for (var otype in this.resultObj.Data[appid].Types) {
                if (eval(otype) !== -1) {
                    var _obj = this.resultObj.Data[appid].Types[otype].Objects;
                    $("#ebm-objtcontainer .objtypes").append(`<div class="ObjType-item" appid="${appid}" obType="${otype}" klink="true">
                                                        <span><i class="fa ${this.objTypes[otype].Icon} obtypeic"></i></span>
                                                        ${this.objTypes[otype].Name}s<span class="obj_count">(${_obj.length})</span>
                                                    </div>`);
                }
            }
            $("#ebm-objtcontainer").show('slide', { direction: 'left' });
        }
        $(".ObjType-item").off("click").on("click", this.appendObjectByType.bind(this));
    };

    this.appendObjectByType = function (e) {
        $("#ebm-newobject").hide();//close new object if it is open
        let el = $(e.target).closest(".ObjType-item");
        this.active(el);
        let appid = parseInt(el.attr("appid"));
        let objtype = parseInt(el.attr("obtype"));
        var _objArray = this.resultObj.Data[appid].Types[objtype].Objects;
        {
            $("#ebm-objectcontainer .ebm-objlist").empty();
            if (!$("#ebm-objectcontainer").is(":visible"))
                $("#ebm-objectcontainer").show('slide', { direction: 'left' });
        }
        for (let i = 0; i < _objArray.length; i++) {
            this.appendObjects(_objArray[i], false);
        }
    };

    this.appendObjects = function (_obj, isfav) {
        let set_fav = "";
        if (this.login === "uc" && !isfav) {
            let isfav = "";
            let tooltip = "";
            if (_obj.Favourite) {
                isfav = "favourited";
                tooltip = "Remove from Favourites.";
            }
            else {
                isfav = "btn-setfav";
                tooltip = "Add to Favourites.";
            }
            set_fav = `<button appid="${_obj.AppId}" otype="${_obj.EbObjectType}" title="${tooltip}" objid="${_obj.Id}" class="${isfav}"><i class="fa fa-heart"></i></button>`;
        }
        $("#ebm-objectcontainer .ebm-objlist").append(`<div class="obj-item" klink="true">
                                                        <a href='${this.decideUrl(_obj)}' objid='${_obj.Id}'>
                                                            <span class="obj-icon">
                                                                <i class="fa ${this.objTypes[_obj.EbObjectType].Icon}"></i>
                                                            </span>
                                                            ${_obj.DisplayName || 'Untitled'}
                                                        </a>
                                                        ${set_fav}
                                                  </div>`);
    };

    this.decideUrl = function (_obj) {
        var _url = `../Eb_Object/Index?objid=${_obj.Id}&objtype=${_obj.EbObjectType}`;
        if (this.login === "uc") {
            if (_obj.EbType === "TableVisualization" || _obj.EbType === "ChartVisualization" || _obj.EbType === "MapView" || _obj.EbType ==="OpenStreetMap") {
                _url = "../DV/dv?refid=" + _obj.Refid;
            }
            else if (_obj.EbType === "Report") {
                _url = "../ReportRender/Index?refid=" + _obj.Refid;
            }
            else if (_obj.EbType === "WebForm") {
                _url = "../WebForm/Index?refid=" + _obj.Refid;
            }
            else if (_obj.EbType === "DashBoard") {
                _url = "../DashBoard/DashBoardView?refid=" + _obj.Refid;
            }
            else if (_obj.EbType === "CalendarView") {
                _url = "../Calendar/CalendarView?refid=" + _obj.Refid;
            }
        }
        return _url;
    };

    this.refreshMenu = function () {
        store.remove("EbMenuObjects_" + this.Tid + this.Uid + this.login + "mhtml");
        store.remove("EbMenuObjects_" + this.Tid + this.Uid + this.login);
        $("#ebm-objectcontainer").hide();
        $("#ebm-objtcontainer").hide();
        $("#ebm-security").hide();
        $("#ebm-newobject").hide();
        this.LoadApps();
    };

    this.showSecurity = function (e) {
        this.active($(e.target));
        {
            $("#ebm-objtcontainer").hide();
            $("#ebm-newobject").hide();
            $("#ebm-objectcontainer").hide();
        }
        if (!$("#ebm-security").is(":visible")) {
            $("#ebm-security").show();
        }
        else {
            $("#ebm-security").hide();
        }
    };

    this.searchFAllObjects = function (e) {
        var _tempsearch = [];
        $(".active_link").removeClass("active_link");
        let min = (this.login === "uc") ? 1 : 3;
        {
            $("#ebm-objtcontainer").hide();
            $("#ebm-newobject").hide();
            $("#ebm-security").hide();
        }
        let f = false;
        if (!$("#ebm-objectcontainer").is(":visible"))
            $("#ebm-objectcontainer").show('slide', { direction: 'left' });
        $("#ebm-objectcontainer .ebm-objlist").empty();
        var srch = $(e.target).val().toLowerCase();
        if (srch !== "" && srch.length >= min) {
            $.each(this.resultObj.Data, function (i, Types) {
                $.each(Types.Types, function (i, _obj) {
                    _obj.Objects.forEach(function (obItem) {
                        if (obItem.DisplayName.toLowerCase().indexOf(srch) !== -1) {
                            if (_tempsearch.indexOf(obItem.Id) < 0) {
                                this.appendObjByCategory(obItem, false);
                                f = true;
                                _tempsearch.push(obItem.Id);
                            }
                        }
                    }.bind(this));
                }.bind(this));
            }.bind(this));

            if (!f)
                $("#ebm-objectcontainer .ebm-objlist").append("<div class='not_found text-center'>No match found.</div>");
        }
        else if (srch.length < min) {
            $("#ebm-objectcontainer .ebm-objlist").append(`<div class='not_found text-center'>Type ${min - srch.length} more letter(s). </div>`);
        }
        else {
            $("#ebm-objectcontainer").show();
        }
    };

    this.closeSingle = function (e) {
        $(e.target).closest("[slider='true']").next().hide();
        $(e.target).closest("[slider='true']").hide();
    };

    this.active = function ($el) {
        $el.closest(`[slider='true']`).find(".active_link").removeClass("active_link");
        $el.addClass("active_link");
    };

    this.setAsFavourite = function (e) {
        let objid = parseInt($(e.target).closest("button").attr("objid"));
        let appid = parseInt($(e.target).closest("button").attr("appid"));
        let otype = parseInt($(e.target).closest("button").attr("otype"));
        $.ajax({
            url: location.origin + "/TenantUser/AddFavourite",
            type: "POST",
            data: {
                objid: objid
            },
        }).done(function (result) {
            if (result) {
                var obj = this.resultObj.Data[appid].Types[otype].Objects.filter(ob => ob.Id === objid);
                this.resultObj.Favourites.push(obj[0]);
                $(e.target).closest("button").addClass("favourited");
                obj[0].Favourite = true;
            }
        }.bind(this));
    };

    this.removeFavorite = function (e) {
        let objid = parseInt($(e.target).closest("button").attr("objid"));
        let appid = parseInt($(e.target).closest("button").attr("appid"));
        let otype = parseInt($(e.target).closest("button").attr("otype"));
        $.ajax({
            url: location.origin + "/TenantUser/RemoveFavourite",
            type: "POST",
            data: {
                objid: objid
            },
        }).done(function (result) {
            if (result) {
                $.each(this.resultObj.Favourites, function (i, ob) {
                    if (ob.Id === objid) {
                        let obj = this.resultObj.Data[appid].Types[otype].Objects.filter(_ob => _ob.Id === objid);
                        this.resultObj.Favourites.splice(i, 1);
                        obj[0].Favourite = false;
                        if ($(e.target).closest(".obj-item").hasClass("fav")) {
                            let len = this.resultObj.Favourites.filter(item => item.EbObjectType === obj[0].EbObjectType).length;
                            $(e.target).closest(".obj-item-categorised").find(".category_objCount").text(`(${len})`)
                        }
                        $(e.target).closest(".obj-item").remove();
                        return false;
                    }
                }.bind(this));
            }
        }.bind(this));
    };

    this.showfavourites = function (e) {
        this.active($(e.target));
        {
            $("#ebm-objtcontainer").hide();
            $("#ebm-newobject").hide();
            $("#ebm-security").hide();
        }
        $("#ebm-objectcontainer .ebm-objlist").empty();
        if (!$("#ebm-objectcontainer").is(":visible"))
            $("#ebm-objectcontainer").show('slide', { direction: 'left' });
        if (this.resultObj.Favourites.length > 0) {
            for (let i = 0; i < this.resultObj.Favourites.length; i++) {
                this.appendObjByCategory(this.resultObj.Favourites[i], true);
            }
        }
        else {
            $("#ebm-objectcontainer .ebm-objlist").append(`<div class='not_found text-center'>
                                                                Favorites empty.
                                                            </div>`);
        }
    };

    this.appendObjByCategory = function (_obj, isfav) {
        let set_fav = "";
        let fav = "";
        if (this.login === "uc" && !isfav) {
            let isfav = "";
            let tooltip = "";
            if (_obj.Favourite) {
                isfav = "favourited";
                tooltip = "Remove from Favourites.";
            }
            else {
                isfav = "btn-setfav";
                tooltip = "Add to Favourites.";
            }
            set_fav = `<button appid="${_obj.AppId}" otype="${_obj.EbObjectType}" title="${tooltip}" objid="${_obj.Id}" class="${isfav}"><i class="fa fa-heart"></i></button>`;
        }
        else if (this.login === "uc" && isfav) {
            fav = "fav";
            isfav = "favourited";
            tooltip = "Remove from Favourites.";
            set_fav = `<button appid="${_obj.AppId}" otype="${_obj.EbObjectType}" title="${tooltip}" objid="${_obj.Id}" class="${isfav}"><i class="fa fa-heart"></i></button>`;
        }

        if ($(`#ebm-objectcontainer #categoryType${_obj.EbObjectType}`).length <= 0) {
            $("#ebm-objectcontainer .ebm-objlist").append(`<div class="obj-item-categorised" id="ctypeContaner${_obj.EbObjectType}">
                                                            <div class="head"><i class="fa ${this.objTypes[_obj.EbObjectType].Icon}"></i> ${this.objTypes[_obj.EbObjectType].Name}s<span class="category_objCount"></span></div>
                                                            <div class="body" id="categoryType${_obj.EbObjectType}"></div>
                                                        </div>`);
        }

        $(`#ebm-objectcontainer #categoryType${_obj.EbObjectType}`).append(`<div class="obj-item ${fav}" klink="true">
                                                        <a href='${this.decideUrl(_obj)}' objid='${_obj.Id}'>
                                                            ${_obj.DisplayName || 'Untitled'}
                                                        </a>
                                                        ${set_fav}
                                                  </div>`);

        let len = $(`#ebm-objectcontainer #ctypeContaner${_obj.EbObjectType}`).find(".obj-item").length;
        $(`#ebm-objectcontainer #ctypeContaner${_obj.EbObjectType} .category_objCount`).text("(" + len + ")");
    };

    this.listKeyControl = function (e) {
        e.preventDefault();
        //$(".active_link").removeClass("active_link");
        if ($(".EbQuickMoverlaySideWRpr").find(":focus").length <= 0) {
            $(".AppContainer").find(`[klink='true']`).eq(0).attr("tabindex", "1").focus();
        }
        else {
            let $current = $(".EbQuickMoverlaySideWRpr").find(":focus");
            if (e.which === 40) {
                if ($current.nextAll('[klink="true"]:visible').length > 0) {
                    $current.nextAll('[klink="true"]:visible').eq(0).attr("tabindex", "1").focus();
                }
                else {
                    let domArray = $current.closest(`[slider='true']`).find('[klink="true"]:visible').toArray();
                    let filter = $.map(domArray, function (val, i) { if ($(val).is($current)) return i; });
                    $(domArray[filter[0] + 1]).attr("tabindex", "1").focus();
                }
            }
            else if (e.which === 38) {
                if ($current.prev('[klink="true"]:visible').length > 0) {
                    $current.prevAll('[klink="true"]:visible').eq(0).attr("tabindex", "1").focus();
                }
                else {
                    let domArray = $current.closest(`[slider='true']`).find('[klink="true"]:visible').toArray();
                    let filter = $.map(domArray, function (val, i) { if ($(val).is($current)) return i; });
                    $(domArray[filter[0] - 1]).attr("tabindex", "1").focus();
                }
            }
            else if (e.which === 13) {
                if ($current.find("a").length > 0) {
                    $current.find("a")[0].click();
                }
                else {
                    $current[0].click();
                }
            }
            else if (e.which === 39) {
                $current.closest("[slider='true']").nextAll("[slider='true']:visible").eq(0).find('[klink="true"]').eq(0).attr("tabindex", "1").focus();
            }
            else if (e.which === 37) {
                $current.closest("[slider='true']").prevAll("[slider='true']:visible").eq(0).find('[klink="true"]').eq(0).attr("tabindex", "1").focus();
            }
        }
    };

    this.refresh = function () {
        store.remove("EbMenuObjects_" + this.Tid + this.Uid + this.login + "mhtml");
        store.remove("EbMenuObjects_" + this.Tid + this.Uid + this.login);
    };

    this.start();
}
var MeetingRequestView;
class Setup {

    constructor(option) {
        this.option = {};
        this.se = {};
        this.notification_count = 0;
        this.actions_count = 0;

        $.extend(this.option, option);
        this.initContainers_DomEvents();
        this.initServerEvents();
        this.getNotifications();
        //this.userNotification();

        this.modal = new EbCommonModal();

        MeetingRequestView = this.MeetingRequestView.bind(this);
    }

    getCurrentLocation() {
        if (!$.isEmptyObject(ebcontext.locations)) {
            return ebcontext.locations.getCurrent();
        }
        return 1;
    }

    initContainers_DomEvents() {
        this.nf_container = $(`#nf-window #nf-container`);
        this.actn_container = $(`#nf-window #actn_container`);
        this.nf_window = $("#nf-window.eb-notification-window");
        this.nf_fade = $("#nf-window-fade");

        $("#eb-expand-nfWindow").off("click").on("click", this.toggleNFWindow.bind(this));
        this.nf_fade.on("click", this.toggleNFWindow.bind(this));
    }

    RMW() {
        $("#eb-expndLinkswrprWdgt").remove();
    }

    toggleNFWindow() {
        if (!this.nf_window.is(":visible")) {
            this.nf_fade.show();
            this.nf_window.show("slide", { direction: 'right' });
        }
        else {
            this.nf_fade.hide();
            this.nf_window.hide();
        }
    }

    initServerEvents() {
        this.se = new EbServerEvents({
            ServerEventUrl: this.option.se_url,
            Channels: ["file-upload"]
        });

        this.se.onNotification = function (msg) {
            console.log("new notification");
            this.notified(msg);
        }.bind(this);
    }

    notified(msg) {
        var o = JSON.parse(msg);
        this.notification_count = this.notification_count + 1;
        ebcontext.header.updateNCount(this.notification_count + this.actions_count);
        //start again
    }

    getNotifications() {
        $.ajax({
            type: "GET",
            url: "../Notifications/GetNotifications",
            success: this.onGetNotificationsSuccess.bind(this)
        });
    }

    onGetNotificationsSuccess(data) {
        if (data === null || data === undefined) return;
        else {
            if ("notifications" in data && Array.isArray(data.notifications)) {
                this.drawNotifications(data.notifications);
            }
            if ("pendingActions" in data && Array.isArray(data.pendingActions)) {
                this.drawActions(data.pendingActions);
            }
        }
        ebcontext.header.updateNCount(this.notification_count + this.actions_count);
        $('.status-time').tooltip({
            placement: 'top'
        });
    }

    drawNotifications(nf) {
        let plc = "Untitled...";
        this.nf_container.empty();
        if (nf.length > 0) {
            for (let i = 0; i < nf.length; i++) {
                this.nf_container.append(`
                <li class="nf-tile" notification-id="${nf[i].notificationId}" link-url="${nf[i].link}">
                    <div class="notification-inner">
                        <h5>${nf[i].title || plc}</h5>
                        <span class='pending_date status-time' title='${nf[i].createdDate}'>${nf[i].duration}</span>
                    </div>
                </li>`);
            }
        }
        else {
            this.nf_container.append(`<p class="nf-window-eptylbl" style="margin:auto;">No Notifications</p>`);
        }
        $("#nf-window #nf-notification-count").text(`(${nf.length})`);
        this.notification_count = nf.length;
    }

    drawActions(pa) {
        this.actn_container.empty();
        if (pa.length > 0) {
            for (let i = 0; i < pa.length; i++) {
                let params = btoa(unescape(encodeURIComponent(JSON.stringify([new fltr_obj(11, "id", pa[i].dataId)]))));
                let locid = this.getCurrentLocation();
                let Id = pa[i].myActionId;
                let url = `href='../webform/index?refid=${pa[i].link}&_params=${params}&_mode=1&_locId=${locid}' target='_blank'`;
                let _label = "";
                if (pa[i].actionType === "Approval")
                    _label = "<span class='status-icon'><i class='fa fa-commenting color-warning' aria-hidden='true'></i></span><span class='status-label label label-warning'>Review Required</span>";
                else
                    url = 'href="#" onclick="MeetingRequestView(this); return false;"';
                this.actn_container.append(`
                <li class="nf-tile">
                        <a ${url} data-id='${Id}'>
                            <div class='pending_action_inner'>
                                <h5>${pa[i].description}</h5>
                                <div class='icon-status-cont'>${_label} <span class='pending_date status-time' title='${pa[i].createdDate}'>${pa[i].dateInString}</span></div>
                            </div>
                        </a>
                </li>`);
            }
        }
        else {
            this.actn_container.append(`<p class="nf-window-eptylbl" style="margin:auto;">No Notifications</p>`);
        }
        $("#nf-window #nf-pendingact-count").text(`(${pa.length})`);
        this.actions_count = pa.length;
    }

    userNotification() {
        this.ss = new EbServerEvents({ ServerEventUrl: this.option.se_url, Channels: ["file-upload"] });
        this.ss.onLogOut = function (msg) {

        }.bind(this);
        this.ss.onNotification = function (msg) {
            var len = parseInt($('#notification-count').attr("count"));
            var html = "";
            var x = JSON.parse(msg);
            if (len === 0) {
                len = x.Notification.length;
            }
            else {
                len = len + x.Notification.length;
            }

            if (len === 0) {
                $('#notification-count').attr("style", "background-color: transparent;border: 2px solid transparent;");
                var html1 = `<p class="no_notification">No Notifications</p>`;
                $('.new_notifications').append(html1);
            }
            else {
                $('#notification-count').attr("style", "display:block;");
                $('#notification-count').html(len);
                $('.no_notification').detach();
            }
            $('#notification-count').attr("count", len);
            for (var i = 0; i < x.Notification.length; i++) {
                if (x.Notification[i].Title !== null && x.Notification[i].Link !== null) {
                    html += `<li class="drp_item" style="border-bottom: 1px solid rgba(0,0,0,.15);"> 
                                <i class="fa fa-times notification-close" style="float: right;padding: 5px 10px 0px 0px;"></i>
                                <div notification-id = "${x.Notification[i].NotificationId}" link-url="${x.Notification[i].Link}" class="notification-update" >
                                    <p>${x.Notification[i].Title}</p>
                                    <h6 class="notification-duration" style="margin-top: 0px;">${x.Notification[i].Duration}</h6>
                                </div>
                            </li>`;
                }
            }
            html = html + $('.new_notifications').html();
            $('.new_notifications').html(html);
            $('.notification-update').off("click").on('click', this.UpdateNotification.bind(this));
            $('.notification-close').off("click").on('click', this.CloseNotification.bind(this));
        }.bind(this);
    }

    UpdateNotification = function (e) {
        let notification_id = $(e.target).closest("div").attr("notification-id");
        let link_url = $(e.target).closest("div").attr("link-url");
        $.ajax({
            type: "POST",
            url: "../NotificationTest/GetNotificationFromDB",
            data: { notification_id: notification_id },
            success:
                this.NotificationSuccessFun.bind(this, link_url)
        });
        $(e.target).closest("li").detach();
        var x = parseInt($('#notification-count').attr("count")) - 1;
        if (x === 0) {
            $('#notification-count').attr("style", "background-color: transparent;border: 2px solid transparent;");
            var html = `<p class="no_notification">No Notifications</p>`;
            $('.new_notifications').append(html);
        }
        else {
            $('#notification-count').attr("style", "");
            $('#notification-count').html(x);
            $('.no_notification').detach();
        }

        $('#notification-count').attr("count", x);
    }

    CloseNotification = function (e) {
        let notification_id = $(e.target).siblings('div').attr("notification-id");
        $.ajax({
            type: "POST",
            url: "../NotificationTest/GetNotificationFromDB",
            data: { notification_id: notification_id }
        });
        $(e.target).closest("li").detach();
        var x = parseInt($('#notification-count').attr("count")) - 1;
        if (x === 0) {
            $('#notification-count').attr("style", "background-color: transparent;border: 2px solid transparent;");
            $('#notification-count').empty();
            var html = `<p class="no_notification">No Notifications</p>`;
            $('.new_notifications').append(html);
        }
        else {
            $('#notification-count').attr("style", "");
            $('#notification-count').html(x);
            $('.no_notification').detach();
        }
        $('#notification-count').attr("count", x);
        $('#notificationDropDown').addClass("open");
        e.stopPropagation();
    }

    MeetingRequestView = function(e) {
        let id = $(e).closest("a").attr("data-id");
        alert(id);
    };
}


class EbCommonModal {

    constructor() {

        this.options = {
            Title: "Title",
            ButtonText: "OK",
            ButtonColor: "#ffffff",
            ButtonBackground: "#3876ea",
            ShowHeader: true,
            ShowFooter: true
        };

        this.callback = new Function();

        this.$container = $("#eb-common-popup");
        this.$close = this.$container.find("#eb-common-popup-close");
        this.$ok = this.$container.find("#eb-common-popup-ok");

        this.setStyle({});

        this.$container.on('show.bs.modal', this.beforeShown.bind(this));
        this.$container.on('shown.bs.modal', this.afterShown.bind(this));
        this.$container.on('hide.bs.modal', this.beforeHide.bind(this));
        this.$container.on('hidden.bs.modal', this.afterHide.bind(this));
        this.$close.on("click", this.onClose.bind(this));
        this.$ok.on("click", this.onComplete.bind(this));
    }

    setStyle(option) {

        $.extend(this.options, option);

        this.$ok.css({ background: this.options.ButtonBackground, color: this.options.ButtonColor });
        this.$ok.text(this.options.ButtonText);

        this.$container.find(".modal-title").text(this.options.Title);

        if (this.options.ShowHeader)
            this.$container.find(".modal-header").show();
        else
            this.$container.find(".modal-header").hide();

        if (this.options.ShowFooter)
            this.$container.find(".modal-footer").show();
        else
            this.$container.find(".modal-footer").hide();
    }

    setSize(width, height) {
        if (typeof width === "string") {
            this.$container.find(".modal-dialog").addClass(width);
        }
        else {
            this.$container.height(height);
            this.$container.width(width);
        }
    }

    reset() {
        this.$container.modal('handleUpdate');
        this.setHtml("");
    }

    setHtml(html) {
        this.$container.find(".modal-body").html(html);
    }

    show(callback) {
        if (callback)
            this.callback = callback;

        this.$container.modal("show");
    }

    hide() {
        this.$container.modal("hide");
    }

    beforeShown() {
        this.callback("beforeShown");
    }

    afterShown() {
        this.callback("afterShown");
    }

    beforeHide() {
        this.callback("beforeHide");
    }

    afterHide() {
        this.callback("afterHide");
    }

    onClose() {
        this.callback("onClose");
    }

    onComplete() {
        this.callback("onComplete");
        this.hide();
    }
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
    };

    this.onJoin = function (user) {
        //console.log("Welcome, " + user.displayName);
    }

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
    }

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