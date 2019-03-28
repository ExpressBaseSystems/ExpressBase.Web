var EbPrettyJson = function (option) {
    this.Option = $.extend({
        ContetEditable: [],
        HideFields: []
    }, option);

    this.build = function (_jsobj) {
        this.JsonHtml = [];

        this.JsonHtml.push(`<div class="prety_jsonWrpr">`);
        if (Array.isArray(_jsobj)) {
            this.Arrayflow(_jsobj);
        }
        else if (_jsobj === null) {

        }
        else if (typeof _jsobj === 'object') {
            this.objectFlow(_jsobj);
        }
        else {
            this.PropFlow(_jsobj);
        }

        this.JsonHtml.push(`</div>`);
        return this.JsonHtml.join("");
    }

    this.objectFlow = function (o) {
        let last = Object.keys(o)[Object.keys(o).length - 1];
        this.JsonHtml.push(`<div class="a_ob_o">{</div><ol class="a_o">`);
        for (let key in o) {
            o[key] = (this.isJson(o[key])) ? JSON.parse(o[key]) : o[key];
            if (Array.isArray(o[key])) {
                this.JsonHtml.push(`<li><a lass="propkey"><span class="property">"${key}"</span> : <span class="array">[</span> </a><ul>`);
                this.dArray(o[key]);
                this.JsonHtml.push(`</ul> <span class="array">]</span></li>`);
            }
            else if (o[key] === null) {

            }
            else if (typeof o[key] === "object") {
                this.JsonHtml.push(`<li><a class="propkey"><span class="property">"${key}"</span> : <span class="object">{</span> </a><ul>`);
                this.dObject(o[key]);;
                this.JsonHtml.push(`</ul><span class="object">}</span></li>`);
            }
            else {
                this.JsonHtml.push(this.dProp(key, o[key], (key === last)));
            }
        }
        this.JsonHtml.push(`</ol><div class="a_ob_o">}</div>`);
    };

    this.Arrayflow = function (a) {
        this.JsonHtml.push(`<div class="array">[</div><ol class="a_o">`);
        let cm = "";
        for (let i = 0, n = a.length; i < n; i++) {
            cm = (i === n - 1) ? "" : "<span class='comma'>,</span>";
            a[i] = (this.isJson(a[i])) ? JSON.parse(a[i]) : a[i];
            if (Array.isArray(a[i])) {
                this.JsonHtml.push(`<li>
                                    <a lass="propkey"><span class="array">[</span> </a>
                                        <ul>`);
                this.dArray(a[i]);
                this.JsonHtml.push(`</ul><span class="array">]${cm}</span></li>`);
            }
            else if (a[i] === null) {

            }
            else if (typeof a[i] === "object") {
                this.JsonHtml.push(`<li><a class="propkey"><span class="object">{</span></a><ul>`);
                this.dObject(a[i]);
                this.JsonHtml.push(`</ul><span class="object">}${cm}</span></li>`);
            }
            else {
                this.JsonHtml.push(this.Propitem(a[i], (i === a.length - 1), i));
            }
        }
        this.JsonHtml.push(`</ol><div class="array">]</div>`);
    }

    this.dArray = function (ai) {
        let cm = "";
        for (let i = 0, n = ai.length; i < n; i++) {
            cm = (i === n - 1) ? "" : "<span class='comma'>,</span>";
            ai[i] = (this.isJson(ai[i])) ? JSON.parse(ai[i]) : ai[i];
            if (Array.isArray(ai[i])) {
                this.JsonHtml.push(`<li data-toggle="tooltip" data-placement="bottom" title='Index:${i}'><a><span class="array">[</span></a><ul>`);
                this.dArray(ai[i]);
                this.JsonHtml.push(`</ul><span class="array">]${cm}</span></li>`);
            }
            else if (ai[i] === null) {

            }
            else if (typeof ai[i] === "object") {
                this.JsonHtml.push(`<li><a><span class="object">{</span></a><ul>`);
                this.dObject(ai[i]);
                this.JsonHtml.push(`</ul><span class="object">}${cm}</span></li>`);
            }
            else {
                this.JsonHtml.push(this.Propitem(ai[i], (i === ai.length - 1), i));
            }
        }
    };

    this.dObject = function (o) {
        let last = Object.keys(o)[Object.keys(o).length - 1];
        let cm = "";
        for (let key in o) {
            cm = (key === last) ? "" : "<span class='comma'>,</span>";
            o[key] = (this.isJson(o[key])) ? JSON.parse(o[key]) : o[key];
            if (Array.isArray(o[key])) {
                this.JsonHtml.push(`<li><a class="propkey"><span class="property">"${key}"</span> : <span class="array">[</span> </a><ul>`);
                this.dArray(o[key]);
                this.JsonHtml.push(`</ul><span class="array">]${cm}</span></li>`);
            }
            else if (o[key] === null) {
                this.JsonHtml.push(this.dProp(key, o[key], (key === last)));
            }
            else if (typeof o[key] === "object") {
                this.JsonHtml.push(`<li><a class="propkey"><span class="property">"${key}"</span> : <span class="object">{</span></a><ul>`);
                this.dObject(o[key]);
                this.JsonHtml.push(`</ul><span class="object">}${cm}</span></li>`);
            }
            else {
                this.JsonHtml.push(this.dProp(key, o[key], (key === last)));
            }
        }
    };

    this.Propitem = function (p, isLast, i) {
        let cm = isLast ? "" : "<span class='comma'>,</span>";
        if (p === null)
            p = null;
        else if (typeof p === "string")
            p = `"${p}"`;
        else if (typeof p === "number")
            p = p;
        return `<li class="ar_item" data-toggle="tooltip" data-placement="bottom" title='Index:${i} &#013;Value:${p}'>${p} ${cm}</li>`;
    }

    this.dProp = function (k, val, isLast) {
        let ce = (this.Option.ContetEditable.indexOf(k) >= 0) ? true : false;
        let hf = (this.Option.HideFields.indexOf(k) >= 0) ? "hide" : "show";
        let cm = isLast ? "" : "<span class='comma'>,</span>";
        if (val === null)
            val = null;
        else if (typeof val === "string")
            val = `"${val}"`;
        else if (typeof val === "number")
            val = val;

        return `<li class="wraper_line ${hf}">
                    <span class="objkey">"${k}"</span>
                    <span class="colon">:</span>
                    <span class="objval" contenteditable="${ce}">${val}</span>
                    ${cm}
                </li>`;
    }

    this.json2xml = function (o) {
        this.xmla = [`<div class="xml_viewer_pane">`];
        this.xmla.push(`<div class="xml_h">
                        <span>&#60;&#63;</span> xml version=<span class="val">"1.0"</span>
                        encoding=<span class="val">"UTF-8" </span></span><span>&#63;&#62;</span>
                    </div>`);

        if (o instanceof Array) {
            this.xmla.push(`<ol>`);
            this.xml_arary(o);
            this.xmla.push(`</ol>`);
        }
        else if (typeof o === 'object') {
            this.xmla.push(`<div class="xml_line"><span class="to"><</span>
                            <span class="to">root</span><span class="to">></span>
                            </div><ol>`);
            this.xml_object(o);
            this.xmla.push(`</ol><div><span class="to">&#60;&#47;</span>
                            <span class="to">root</span><span class="to">></span>
                            </div>`);
        }
        this.xmla.push(`</div>`);
        return this.xmla.join("");
    };

    this.xml_arary = function (a) {
        for (let i = 0, n = a.length; i < n; i++) {
            if (a[i] instanceof Array)
                this.xml_array_inner(a[i]);
            else if (typeof a[i] === 'object') {
                this.xml_object_inner(a[i]);
            }
            else
                this.xml_prop(p, a[i]);
        }
    };

    this.xml_object = function (o) {
        for (let p in o) {
            if (o[p] instanceof Array)
                this.xml_array_inner(p, o[p]);
            else if (typeof o[p] === 'object')
                this.xml_object_inner(p, o[p]);
            else
                this.xml_prop(p, o[p]);
        }
    };

    this.xml_array_inner = function (p, a) {
        for (let i = 0, n = a.length; i < n; i++) {
            if (a[i] instanceof Array) {
                this.xmla.push(`<li class="xml_line"><span class="to"><</span>
                                <span class="to">${p}</span><span class="to">></span><ul>`);
                this.xml_array_inner(p, a[i]);
                this.xmla.push(`</ul><span class="to">&#60;&#47;</span>
                                <span class="to">${p}</span><span class="to">></span>
                                </li>`);
            }
            else if (typeof a[i] === 'object') {
                this.xml_object_inner(p, a[i]);
            }
            else
                this.xml_prop(0, a[i]);
        }
    };

    this.xml_object_inner = function (pr, o) {
        this.xmla.push(`<li class="xml_line"><span class="to"><</span>
                        <span class="to">${pr}</span><span class="to">></span>
                        <ul>`);
        for (let p in o) {
            if (o[p] instanceof Array) {
                this.xml_array_inner(p, o[p]);
            }
            else if (typeof o[p] === 'object') {
                this.xmla.push(`<ul>`);
                this.xml_object_inner(p, o[p]);
                this.xmla.push(`</ul>`);
            }
            else
                this.xml_prop(p, o[p]);
        }
        this.xmla.push(`</ul><span class="to">&#60;&#47;</span>
                        <span class="to">${pr}</span><span class="to">></span>
                        </li>`);
    };

    this.xml_prop = function (p, v) {
        if (this.isNumber(p))
            p = "element";

        this.xmla.push(`<li class="xml_line val">
                            <span class="to"><</span>
                            <span class="to">${p}</span>
                            <span class="to">></span>
                                ${v}
                            <span class="to">&#60;&#47;</span>
                            <span class="to">${p}</span>
                            <span class="to">></span>
                        </li>`);
    };
    this.isNumber = function (n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); };

    this.isJson = function (s) {
        try {
            JSON.parse(s);
        } catch (e) {
            return false;
        }
        return true;
    }

    this.rawData = function (o) {
        var raw = [`<div class="raw_data_wrapper">`];
        raw.push(JSON.stringify(o));
        raw.push(`</div>`);
        return raw.join("").replace(/\n/g, '');
    };
};