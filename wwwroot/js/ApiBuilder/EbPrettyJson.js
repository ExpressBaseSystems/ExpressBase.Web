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
        this.JsonHtml.push(`<div class="a_ob_o">[</div><ol class="a_o">`);
        let cm = "";
        for (let i = 0; i < a.length; i++) {
            cm = (i === a.length - 1) ? "" : ",";
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
                this.JsonHtml.push(this.Propitem(a[i], (i === a.length - 1)));
            }
        }
        this.JsonHtml.push(`</ol><div class="a_ob_o">]</div>`);
    }

    this.dArray = function (ai) {
        let cm = "";
        for (let i = 0; i < ai.length; i++) {
            cm = (i === ai.length - 1) ? "" : ",";

            if (Array.isArray(ai[i])) {
                this.JsonHtml.push(`<li><a><span class="array">[</span></a><ul>`);
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
                this.JsonHtml.push(this.Propitem(ai[i], (i === ai.length - 1)));
            }
        }
    };

    this.dObject = function (o) {
        let last = Object.keys(o)[Object.keys(o).length - 1];
        let cm = "";
        for (let key in o) {
            cm = (key === last) ? "" : ",";
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

    this.Propitem = function (p, isLast) {
        let cm = isLast ? "" : ",";
        if (p === null)
            p = null;
        else if (typeof p === "string")
            p = `"${p}"`;
        else if (typeof p === "number")
            p = p;
        return `<li class="ar_item">${p} ${cm}</li>`;
    }

    this.dProp = function (k, val, isLast) {
        let ce = (this.Option.ContetEditable.indexOf(k) >= 0) ? true : false;
        let hf = (this.Option.HideFields.indexOf(k) >= 0) ? "hide" : "show";
        let cm = isLast ? "" : ",";
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
};