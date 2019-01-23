var JsonWindow = function (option) {
    this.JsonHtml = [];

    this.Option = $.extend({
        ContetEditable: [],
        HideFields:[]
    }, option);

    this.getJsonWindow = function (_json_string) {
        this.JsonHtml = [`<div class="prety_jsonWrpr">`];
        let json = JSON.parse(_json_string);
        if (Array.isArray(json)) {
            this.drawArray(json)
        }
        else if (typeof json === "object")
            this.JsonHtml.push(`<div class="a_ob_o">{</div>`);
        this.JsonHtml.push(`</div>`)
        return this.JsonHtml.join("");
    }

    this.drawArray = function (json) {
        this.JsonHtml.push(`<div class="a_o">[</div>`);
        this.JsonHtml.push(`<ol class="a_o">`);
        for (let i = 0; i < json.length; i++) {
            if (Array.isArray(json[i])) {
                this.drawArray(json[i]);
            }
            else if (typeof json[i] === "object") {
                this.drawObj(json[i], (i === json.length - 1));
            }
        }
        this.JsonHtml.push(`</ol>`);
        this.JsonHtml.push(`<div class="a_c">]</div>`);
    }

    this.drawObj = function (json, isLast) {
        this.JsonHtml.push(`<li class="a_ob_o">{`);
        this.loopObj(json);
        this.JsonHtml.push(`}`);
        if (!isLast)
            this.JsonHtml.push(`<span class="comma">,</span>`);
        this.JsonHtml.push(`</li>`);
    };

    this.loopObj = function (json) {
        this.JsonHtml.push(`<ul class="item">`);
        let last = Object.keys(json)[Object.keys(json).length - 1];
        for (let kvp in json) {
            if (typeof json[kvp] === "string" || typeof json[kvp] === "number" || typeof json[kvp] === "boolean" || json[kvp] === null) {
                this.JsonHtml.push(this.genJsonFjsObj(kvp, json[kvp], (kvp === last)));
            }
            else if (typeof json[kvp] === "object") {
                this.loopObj(json[kvp]);
            }
        }
        this.JsonHtml.push(`</ul>`);
    };

    this.genJsonFjsObj = function (k, v, isComa) {
        let ce = (this.Option.ContetEditable.indexOf(k) >= 0) ? true : false;
        let cma = (isComa) ? "" : '<span class="comma">,</span>';
        let val = null;
        if (v === null)
            val = null;
        else if (typeof v === "string")
            val = `"${v}"`;
        else if (typeof v === "number")
            val = v;
        if (this.Option.HideFields.indexOf(k) <= -1) {
            return `<li class="wraper_line">
                    <span class="objkey">"${k}"</span>
                    <span class="colon">:</span>
                    <span class="objval" contenteditable="${ce}">${val}</span>
                    ${cma}
                </li>`;
        }
        else
            return null;
    }

    this.getJson = function (id) {
        return $(`#${id}`).text();
    };
};