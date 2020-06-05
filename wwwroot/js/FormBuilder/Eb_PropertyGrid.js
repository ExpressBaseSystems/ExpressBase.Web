const Eb_PropertyGrid = function (options, parentPG) {
    this.ParentPG = parentPG;
    this.wc = options.wc;
    this.Isdraggable = options.isDraggable;
    this.cid = options.cid;
    this.bulderType = options.bulderType;
    this.IsInnerCall = options.IsInnerCall || false;
    this.wraperId = options.id;
    this.$scope = options.$scope || $(document.body);
    this.$wraper = $("#" + this.wraperId);
    this.$extCont = options.$extCont;
    this.parentId = null;
    this.$controlsDD = $(".controls-dd-cont select");
    this.$fitCornerBtn = $(`<div class="icon-cont  pull-right pgcorner"><i class="fa fa-angle-double-right"></i></div>`);
    this.dependedProp = options.dependedProp;
    this.ctrlsDDCont_Slctr = "#" + this.wraperId + " .controls-dd-cont";
    this.AllObjects = {};
    this.PropsObj = {};
    this.CXVE = {};
    this.$hiddenProps = {};
    this.ImgSlctrs = {};
    this.IsSortByGroup = true;
    this.PropertyChanged = function (obj) { };
    this.DD_onChange = function (e) { };
    this.nameChanged = function (e) { };
    this.Close = function (e) { };
    this.IsReadonly = false;
    this.style = options.style || {};

    // refresh and get object with new values from PG
    this.getvaluesFromPG = function () {
        // function that will update and return the values back from the property grid
        for (let prop in this.getValueFuncs) {
            if (typeof this.getValueFuncs[prop] !== 'function') continue;
            this.PropsObj[prop] = ($('#' + this.wraperId + prop).length === 0) ? this.PropsObj[prop] : this.getValueFuncs[prop]();
        }
        return this.PropsObj;
    };

    //Builds property Grid rows
    this.getPropertyRowHtml = function (name, value, meta, options, SubtypeOf, IsCElimitEditor) {
        let valueHTML;
        let alias = meta.alias || name
            // insert a space before all caps
            .replace(/([A-Z])/g, ' $1').trim()
            // uppercase the first character
            .replace(/^./, function (str) { return str.toUpperCase(); })
            // lowercase the first character after space
            .replace(/ ([A-Z])/g, function (str) { return str.toLowerCase(); })
            // replace underscores with space
            .replace(/_/g, " ").replace(/  +/g, ' ');

        let type = meta.editor;
        let elemId = this.wraperId + name;
        let subRow_html = '', subtypeOfAttr = '', req_html = '', arrow = '', isExpandedAttr = '';
        if (type === 0 || typeof value === 'boolean') {    // If boolean create checkbox
            valueHTML = '<input type="checkbox" class ="pg-inp-checkbox" id="' + elemId + '" value="' + (value || false) + '"' + (value ? ' checked' : '') + ' />';
            if (this.getValueFuncs)
                this.getValueFuncs[name] = function () { return $('#' + elemId).prop('checked'); };
        }
        else if (type === 1) {    // If options create drop-down list
            if (meta.PropDataSourceJsFn) {
                meta.enumoptions = meta.PropDataSourceJsFn();
                meta._isMultiSelect = meta.Dprop === "True";
            }
            if (typeof value === "string")
                value = parseInt(getKeyByVal(meta.enumoptions, value));
            else if (typeof value === "object")// for multi select
                value = value.$values.join();
            else
                value = (!meta.enumoptions[value]) ? Object.keys(meta.enumoptions)[0] : value;
            valueHTML = this.getBootstrapSelectHtml(elemId, value, meta.enumoptions, IsCElimitEditor, meta._isMultiSelect);

            if (IsCElimitEditor) {
                this.getValueFuncs[name] = function () {
                    let idx = parseInt($('#' + elemId).val());
                    return (idx !== 0) ? this.PropsObj[meta.source].$values[idx - 1] : null;
                }.bind(this);
            }
            else {
                if (meta._isMultiSelect) {// for multi select
                    this.getValueFuncs[name] = function () {
                        let csv = $('#' + elemId).val();
                        let ar = csv.split(",");
                        this.PropsObj[meta.name].$values = ar;
                        return this.PropsObj[meta.name];
                    }.bind(this);
                }
                else
                    this.getValueFuncs[name] = function () { return parseInt($('#' + elemId).val()); };
            }
            this.postCreateInitFuncs[name] = function () {
                let $select = $('#' + elemId).parent().find(".selectpicker");
                $select.on('change', function (e) {
                    let $e = $(event.target);
                    let valuesAr = [];
                    let $lis = $e.find("option:selected");
                    for (let i = 0; i < $lis.length; i++) {
                        let $li = $($lis[i]);
                        valuesAr.push($li.attr("data-token"));
                    }
                    $e.parent().siblings("input").val(valuesAr);
                    //this.PropsObj[meta.name].$values = [...valuesAr];/// ??
                }.bind(this));
                if (meta.Dprop === "True") {// for multi select
                    let vals = [];
                    let ar = this.PropsObj[meta.name].$values;
                    for (let i = 0; i < ar.length; i++) {
                        vals.push(meta.enumoptions[ar[i]]);
                    }
                    $select.selectpicker('val', vals);
                }
                else
                    $select.selectpicker('val', meta.enumoptions[value]);
            }.bind(this);

        }
        else if (type === 2) {    // If number 
            valueHTML = '<input type="number" class="pg-inp" id="' + elemId + '" value="' + (value || 0) + '" style="width:100%" />';
            if (this.getValueFuncs)
                this.getValueFuncs[name] = function () { return ($('#' + elemId).val() === "") ? "" : parseInt($('#' + elemId).val()); };
        }
        else if (type === 3) {    // If color use color picker 
            valueHTML = '<input class="pg-inp-color" type="color" id="' + elemId + '" value="' + (value || "#ffffff") + '"/>';
            this.getValueFuncs[name] = function () { return $('#' + elemId).val(); };
        }
        else if (type === 4) {    // If label (for read-only) span
            valueHTML = '<input type="text" readonly class="pg-inp" id="' + elemId + '" for = "' + name + '" value="' + (value || "") + '"style="width:100%"></div>';
            this.getValueFuncs[name] = function () { return $('#' + elemId).val(); };
        }
        else if (type === 5) {    //  If string editor textbox
            valueHTML = '<input type="text" class="pg-inp" id="' + elemId + '" for = "' + name + '" value="' + (value || "") + '"style="width:100%"></div>';
            this.getValueFuncs[name] = function () { return $('#' + elemId).val(); };
        }
        else if (type === 6) {    //  If date&time date
            valueHTML = '<input type="date" class="pg-inp" id="' + elemId + '" value="' + (value || "") + '"style="width:100%"></div>';
            this.getValueFuncs[name] = function () { return $('#' + elemId).val(); };
        }
        //else if (type === 25) {
        //    valueHTML = this.getBootstrapSelectHtml25(elemId, value, meta.enumoptions, IsCElimitEditor);
        //}
        else if (type > 6 && type < 11 || type === 22 || type === 24 || type === 25 || type === 26 || type === 27 || type === 35 || type === 36) {//  If collection editor
            if ((meta.Limit === 1 && type === 25) || (meta.Limit === 1 && type === 8)) {
                let _meta = jQuery.extend({}, meta);
                _meta.editor = 1;
                if (!this.PropsObj[meta.source])
                    _meta.enumoptions = ["--none--"];
                else
                    _meta.enumoptions = ["--none--", ...this.PropsObj[meta.source].$values.map(a => (a.name || a.ColumnName || a.Name))];
                //_meta.enumoptions = ["--none--","one"];
                value = value ? _meta.enumoptions.indexOf(value.name || value.ColumnName || value.Name) : 0;
                return this.getPropertyRowHtml(name, value, _meta, options, SubtypeOf, true);
            }
            else {
                valueHTML = '<span class="cxv-inp">(Collection)</span>'
                    + '<button for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';
            }
        }
        else if (type > 63) {    // If JS editor
            valueHTML = '<span class="cxv-inp">(Script)</span>'
                + '<button for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';
        }
        else if (type === 11) {    // If JS editor
            valueHTML = '<span class="cxv-inp">(JavaScript)</span>'
                + '<button for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';
        }
        else if (type === 12) {    // SQL editor
            valueHTML = '<span class="cxv-inp">(SQL)</span>'
                + '<button for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';
        }
        else if (type === 13) {  //  If Object Selector editor
            valueHTML = '<input class="cxv-inp" type="text" id="' + elemId + '" for="' + name + '" value="' + (value || "") + '" readonly style=" width: calc(100% - 26px); direction: rtl;" />'
                + '<button for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';
        }
        else if (type === 16) {  //  If string editor
            valueHTML = '<span class="cxv-inp" style="vertical-align: sub;">(String)</span>'
                + '<button for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';
        }
        else if (type === 41) {  //  If string base64 editor
            valueHTML = '<span class="cxv-inp" style="vertical-align: sub;">(String)</span>'
                + '<button for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';
        }
        else if (type === 14) {  //  If FontSlctrs
            let _val = (value === "") ? "" : JSON.stringify(value).replace(/"/g, "'");
            valueHTML = '<input class="cxv-inp" type="text" id="' + elemId + '" for="' + name + '" value="' + (_val || "") + '" title="' + _val.replace(/{|}|'/g, "") + '" readonly style=" width: calc(100% - 26px); direction: rtl;" />'
                + '<button id="pgCXbtn_' + elemId + '" name="pgCXbtn_' + elemId + '" for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';
        }
        else if (type === 18) {    // If CS editor
            valueHTML = '<span class="cxv-inp" style="vertical-align: sub;">(C# Script)</span>'
                + '<button for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';
        }
        else if (type === 21) {    // If MultiLanguageKeySelector Editor
            valueHTML = '<input class="cxv-inp" type="text" id="' + elemId + '" for="' + name + '" value="' + (value || "") + '" style=" width: calc(100% - 26px); direction: rtl;" />'
                + '<button id="pgCXbtn_' + elemId + '" name="pgCXbtn_' + elemId + '"  for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';
        }
        else if (type === 37) {    // If icon selector Editor
            valueHTML = '<input class="cxv-inp" type="text" id="' + elemId + '" for="' + name + '" value="' + (value || "") + '" style=" width: calc(100% - 26px); direction: rtl;" />'
                + '<button id="pgCXbtn_' + elemId + '" name="pgCXbtn_' + elemId + '" for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';

            this.getValueFuncs[name] = function () { return $('#' + elemId).val(); };
        }
        else if (type === 38) {    // If shadow Editor
            valueHTML = '<input class="cxv-inp" type="text" id="' + elemId + '" for="' + name + '" value="' + (value || "") + '" style=" width: calc(100% - 26px); direction: rtl;" />'
                + '<button id="pgCXbtn_' + elemId + '" name="pgCXbtn_' + elemId + '" for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';

            this.getValueFuncs[name] = function () { return $('#' + elemId).val(); };
        }
        else if (type === 40) {    // If gradient color picker
            valueHTML = '<input class="cxv-inp" type="text" id="' + elemId + '" for="' + name + '" value="' + (value || "") + '" style=" width: calc(100% - 26px); direction: rtl;" />'
                + '<button id="pgCXbtn_' + elemId + '" name="pgCXbtn_' + elemId + '" for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';

            this.getValueFuncs[name] = function () { return $('#' + elemId).val(); };
        }
        else if (type === 17) {  //  If imageUploader
            valueHTML = '<input class="cxv-inp" type="text" id="' + elemId + '" for="' + name + '" value="' + (value || "") + '" readonly style=" width: calc(100% - 26px); direction: rtl;" />'
                + '<button id="pgCXbtn_' + elemId + '" name="pgCXbtn_' + elemId + '" for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';

            //this.ImgSlctrs[name] = new imageUploader({
            //    Container: "mb_" + this.wraperId,
            //    Console: this.wc,
            //    TenantId: this.cid,
            //    toggleId: "pgCXbtn_" + elemId
            //});

            this.ImgSlctrs[name] = new EbFileUpload({
                Type: "image",
                //PreviewWraper: "#divAllImg1",
                //Categories: ["Pre consultation", "Consultation", "Hairline", "Post procedure", "Clot removal", "M2", "M4", "M6", "M8", "M10"],
                //FilesUrl: "/FilesOf/@ViewBag.AccId",
                Console: this.wc,
                Toggle: "#pgCXbtn_" + elemId,
                TenantId: this.cid,
                SolutionId: "@ViewBag.SolnId",
                Container: "mb_" + this.wraperId,
                Multiple: false,
                ServerEventUrl: 'https://se.eb-test.cloud',
                EnableTag: false,
                EnableCrop: false,
                MaxSize: 2,//in MegaBytes
                //Context: "dp",//if single and crop
                //ResizeViewPort: true //if single and crop
            });
            this.ImgSlctrs[name].windowClose = function () {
                this.CXVE.CXE_OKclicked();
            }.bind(this);
        }
        else if (type === 23 || type === 15) {
            let value23 = "";
            if (type === 23) {    // If Dictionary Editor
                let _obj = this.getDictObj(value);
                let _meta = this.getDictMeta(value);
                let $subRows = $("#" + this.wraperId + " [subtype-of=" + name + "]");
                $subRows.attr("tr-for", type);
                this.getValueFuncs[name] = function () {
                    let $subRows = $("#" + this.wraperId + " [subtype-of=" + name + "]");
                    $.each($subRows, function (i, row) {
                        let key = $(row).attr("name").slice(0, -2);
                        let val = ($(row).find(".pgCX-Editor-Btn").length > 0) ? value.$values[key] : $(row).find(".pgTdval input").val();
                        value.$values[key] = val;
                    });
                    return value;
                }.bind(this);
                $subRow_html = $(this.getExpandedRows(_meta, _obj, name));
                $subRow_html.find("tr").addBack("tr").attr("tr-for", type);
                if ($subRow_html.length > 0)
                    subRow_html = $subRow_html.wrapAll('<div>').parent().html();
                else
                    value23 = `(!No ${(alias || name)} found)`;
            }
            else {  //  If expandable
                let _meta = meta.submeta;
                let _obj = value;
                this.getValueFuncs[name] = function () {
                    let $subRows = $("#" + this.wraperId + " [subtype-of=" + name + "]");
                    $.each($subRows, function (i, row) {
                        let key = $(row).attr("name").slice(0, -2);
                        let val = $(row).find(".pgTdval input").val();
                        value[key] = val;
                    });
                    $('#' + elemId).val(JSON.stringify(value)).siblings().val(this.getExpandedValue(value));
                    return JSON.parse($('#' + elemId).val());
                }.bind(this);
                subRow_html = this.getExpandedRows(_meta, _obj, name);
            }
            arrow = '<i class="fa fa-caret-right" aria-hidden="true"></i>';
            isExpandedAttr = 'is-expanded="true"';
            valueHTML = '<input type="text" class="pg-inp" for="' + name + '" readonly value="' + ((type === 15) ? this.getExpandedValue(value) : value23) + '" style="width:100%; direction: rtl;" />' +
                "<input type='hidden' value='" + JSON.stringify(value) + "' id='" + elemId + "'>";
        }// If Dictionary Editor
        else {    // Default is textbox
            valueHTML = 'editor Not implemented';
        }
        if (meta.OnChangeExec)
            this.OnChangeExec[name] = meta.OnChangeExec;
        if (SubtypeOf) {
            subtypeOfAttr = 'subtype-of="' + SubtypeOf + '"';
        }
        if (meta.IsRequired)
            req_html = '<sup style="color: red">*</sup>';
        return '<tr class="pgRow" tabindex="1" ' + subtypeOfAttr + isExpandedAttr + ' name="' + name + 'Tr" group="' + this.currGroup + '"><td class="pgTdName" data-toggle="tooltip" data-placement="left" title="' + meta.helpText + '">' + arrow + (alias || name) + req_html + '</td><td class="pgTdval">' + valueHTML + '</td></tr>' + subRow_html;
    };

    // gives expandable prop values as array
    this.getExpandedRows = function (_meta, _obj, name) {
        let subRow_html = "";
        $.each(_obj, function (key, val) {
            let CurMeta = getObjByval(_meta, "name", key);
            if (CurMeta)
                subRow_html += this.getPropertyRowHtml(key, val, CurMeta, CurMeta.options, name);
        }.bind(this));
        return subRow_html;
    };

    // gives dict Editor SubObj
    this.getDictObj = function (value) {
        let Obj = {};
        let DictMetas = [];
        let sourceProp = getObjByval(this.ParentPG.Metas, "name", this.ParentPG.CurProp).source;
        let customFields = this.ParentPG.PropsObj[sourceProp].$values;
        $.each(customFields, function (i, field) {
            let objType = "Eb" + field.ObjType;
            let _propName = field.Name;
            Obj[_propName] = value.$values[_propName];
        }.bind(this));
        return Obj;
    };

    // gives dict Editor Sub metas
    this.getDictMeta = function (value) {
        let DictMetas = [];
        let sourceProp = getObjByval(this.ParentPG.Metas, "name", this.ParentPG.CurProp).source;
        let customFields = this.ParentPG.PropsObj[sourceProp].$values;
        $.each(customFields, function (i, field) {
            let fieldMeta = {};
            let objType = "Eb" + field.ObjType;
            let _propName = field.Name;
            Object.assign(fieldMeta, getObjByval(AllMetas[objType], "name", "FieldValue"));
            fieldMeta.name = _propName;
            fieldMeta.alias = null;
            DictMetas.push(fieldMeta);
            this.CurDictMeta = DictMetas;
        }.bind(this));
        return DictMetas;
    };

    // gives expandable prop values as array
    this.getExpandedValue = function (obj) {
        values = [];
        $.each(obj, function (key, val) {
            if (key !== "$type")
                values.push(val);
        });
        return values;
    };

    // BootstrapSelect Html builder
    this.getBootstrapSelectHtml = function (id, selectedValue, options, IsCElimitEditor, isMultiSelect) {
        selectedValue = selectedValue || 0; // default value....optimize
        let html = `<select class='selectpicker' ${isMultiSelect ? "multiple " : ""}>`;
        $.each(options, function (i, val) {
            html += `<option style='@color;' data-token='${i}'>${val}</option>`.replace("@color", (IsCElimitEditor && i === 0) ? "color:#777" : "");
        });
        html += "</select><input type='hidden' value='" + selectedValue + "' id='" + id + "'>";
        return html;
    };

    //GroupHeaderRow Html  builder
    this.getGroupHeaderRowHtml = function (displayName) {
        if (this.IsSortByGroup)
            return '<tr class="pgGroupRow" is-expanded="true" group-h="' + displayName + '"><td colspan="2" class="pgGroupCell">'
                + '<span class="bs-caret" style= "margin-right: 5px;" > <span class="caret"></span></span > ' + displayName
                + '</td></tr > ';
        else
            return '<tr class="pgGroupRow" group-h="' + displayName + '"><td colspan="2" class="pgGroupCell"> &nbsp ' + displayName + '</td></tr > ';
    };

    //checks an object is contained in array by name case insensitive
    this.isContains = function (obj, val) {
        for (let i = 0; i < obj.length; i++)
            if (obj[i].name.toLowerCase() === val.toLowerCase())
                return true;
        return false;
    };

    //Fn to call all property's postInitFn
    this.CallpostInitFns = function () {
        // Call the post init functions 
        for (let prop in this.postCreateInitFuncs) {
            if (typeof this.postCreateInitFuncs[prop] === 'function') {
                this.postCreateInitFuncs[prop]();
                this.postCreateInitFuncs[prop] = null;// just in case make sure we are not holding any reference to the functions
            }
        }
    };

    //Fn to call all property's OnchangeExecFn
    this.callOnchangeExecFns = function () {
        // call OnChangeExec functions
        for (let prop in this.OnChangeExec) {
            let func = this.OnChangeExec[prop].bind(this.PropsObj, this);
            $("#" + this.wraperId + " [name=" + prop + "Tr]").off("change", "input, select").on("change", "input, select", func);
            func();
        }
    };

    this.setSimpleProperty = function (prop, val) {
        if (Object.keys(this.PropsObj).includes(prop)) {
            this.PropsObj[prop] = val;
            $("#" + this.wraperId + prop).val(val);
        }
        else
            console.error("PG error : Property not found")
    }

    //makes a property editor readOnly
    this.MakeReadOnly = function (props) {
        if (!Array.isArray(props))
            props = [props];
        $.each(props, function (i, prop) {
            $("#" + this.wraperId + " [name=" + prop + "Tr]").find("input").prop("readonly", true);
            $("#" + this.wraperId + " [name=" + prop + "Tr]").css("cursor", "not-allowed").css("opacity", "0.4").find("button").css("cursor", "not-allowed").prop('disabled', true);
        }.bind(this));
    };

    //makes a property editor readWritable
    this.MakeReadWrite = function (props) {
        if (!Array.isArray(props))
            props = [props];
        $.each(props, function (i, prop) {
            $("#" + this.wraperId + " [name=" + prop + "Tr]").find("input").prop("readonly", false);
            $("#" + this.wraperId + " [name=" + prop + "Tr]").css("cursor", "inherit").css("opacity", "1").find("button").css("cursor", "inherit").prop('disabled', false);
        }.bind(this));
    };

    this.HideGroup = function (groupName) {
        $("#" + this.wraperId + " [group=" + groupName + "]").hide(300);
        $(`#${this.wraperId} .pgGroupRow[group-h=${groupName}]`).hide(300);
    };

    this.ShowGroup = function (groupName) {
        $("#" + this.wraperId + " [group=" + groupName + "]").show(300);
        $(`#${this.wraperId} .pgGroupRow[group-h=${groupName}]`).show(300);
    };

    //makes a property row hidden
    this.HideProperty = function (prop) {
        if (this.$hiddenProps[prop])
            return;
        let $Tr = $("#" + this.wraperId + " [name=" + prop + "Tr]");
        let isExpanded = $Tr.attr("is-showprop") === 'true';
        $Tr.hide();
        $Tr.attr("is-showprop", false);
        this.$hiddenProps[prop] = { "$Tr": $Tr };
        let groupName = $Tr.attr("group");
        let $groupRows = $("#" + this.wraperId + " [group='" + groupName + "']");
        if ($groupRows.length === 0)
            $("#" + this.wraperId + " [group-h=" + groupName + "]").hide(300);
    };

    //makes a property row visible which hidden by 'HideProperty()'
    this.ShowProperty = function (prop) {
        if (!this.$hiddenProps[prop])
            return;
        let $Tr = this.$hiddenProps[prop].$Tr;
        let isExpanded = $Tr.attr("is-showprop") === 'true';
        $Tr.show(300);
        $Tr.attr("is-showprop", true);
        this.$hiddenProps[prop] = null;
    };

    this.changePropertyValue = function (prop, val) {
        this.CurObj[prop] = val;
        let $pginp = $(`#${this.wraperId}${prop}`);
        if ($pginp.length !== 0)
            $pginp.val(val).trigger("change");
    };

    //build PG table by Assembling property GroupHeaders, property rows ...
    this.buildGrid = function () {
        // Now we have all the html we need, just assemble it
        for (let group in this.groupsHeaderRowHTML) {
            // Add the group row
            this.innerHTML += this.groupsHeaderRowHTML[group];
            // Add the group cells
            this.innerHTML += this.propertyRowsHTML[group];
        }
        // Finally we add the 'Other' group (if we have something there)
        if (this.propertyRowsHTML[this.MISC_GROUP_NAME]) {
            this.innerHTML += this.getGroupHeaderRowHtml(this.MISC_GROUP_NAME);
            this.innerHTML += this.propertyRowsHTML[this.MISC_GROUP_NAME];
        }
        // Close the table and apply it to the div
        let $innerHTML = $(this.innerHTML).hide();
        $innerHTML.css("transition-duration", "0.3s;");
        this.$PGcontainer.html($innerHTML);
        $innerHTML.fadeIn(300);
    };

    //Creates Table rows and group them by property Group name 
    this.buildRows = function () {
        if (this.PropsObj["IsCustomColumn"] !== true)
            delete this.PropsObj[this.dependedProp];
        let propArray = Object.keys(this.PropsObj);
        //for (let property in this.PropsObj) { propArray.push(property); }
        //propArray.sort();
        let _Metas = [...this.Metas];
        if (this.IsSortByGroup)
            propArray = _Metas.sort(function (a, b) { return b.Priority - a.Priority; }).map(a => a.name);
        else
            propArray = _Metas.sort(function (a, b) { if ((a.alias || a.name) < (b.alias || b.name)) return -1; if ((a.alias || a.name > b.alias || b.name)) return 1; return 0; }).map(a => a.name);

        let prop = null;
        for (let i in propArray) {
            prop = propArray[i];
            let _meta = getObjByval(this.Metas, "name", prop);
            // Skip if this is not a direct property, a function, or its meta says it's non browsable
            if (_meta === undefined || !this.PropsObj.hasOwnProperty(prop) || typeof this.PropsObj[prop] === 'function' || (this.wc === "uc" && _meta.HideForUser) ||
                !this.isContains(this.Metas, prop) || ((_meta.MetaOnly === undefined) ? false : _meta.MetaOnly))
                continue;
            if (this.IsSortByGroup) {
                // Check what is the group of the current property or use the default 'Other' group
                this.currGroup = (this.Metas[this.propNames.indexOf(prop.toLowerCase())]).group || this.MISC_GROUP_NAME;
            }
            else
                this.currGroup = "All";

            // If this is the first time we run into this group create the group row
            if (this.currGroup !== this.MISC_GROUP_NAME && !this.groupsHeaderRowHTML[this.currGroup])
                this.groupsHeaderRowHTML[this.currGroup] = this.getGroupHeaderRowHtml(this.currGroup);

            // Initialize the group cells html
            this.propertyRowsHTML[this.currGroup] = this.propertyRowsHTML[this.currGroup] || '';

            // Append the current cell html into the group html
            this.propertyRowsHTML[this.currGroup] += this.getPropertyRowHtml(prop, this.PropsObj[prop], this.Metas[this.propNames.indexOf(prop.toLowerCase())], (this.Metas[this.propNames.indexOf(prop.toLowerCase())]).options);

        }
    };

    this.check4ReservedVals = function () {
        if (this.CurMeta && this.CurMeta.Dprop) {
            let $e = $(event.target);
            let reservedValues = this.CurMeta.Dprop.split(", ");
            let curVal = $e.val();
            if (reservedValues.includes(curVal)) {
                this.EbAlert.alert({
                    //id: alerId,
                    head: "This property value should be diffrent .",
                    body: "'" + curVal + "' is a reserved name.",
                    type: "warning",
                    delay: 5000
                });
            }
        }
    };

    //fires when a property value changes through PG
    this.OnInputchangedFn = function (e) { ////////// need optimization
        let oldVal = "";
        try {
            oldVal = this.PropsObj.__oldValues[this.CurProp];
        }
        catch (e) {
            alert(e);
            console.log(e);
        }
        this.getvaluesFromPG();
        let objCopy = ($.extend({}, this.PropsObj));
        delete objCopy.__oldValues;
        this.PropsObj.__oldValues = objCopy;
        let subTypeOf = null;
        if (e) {
            let $e = $(e.target);
            this.CurProp = $e.closest("tr").attr("name").slice(0, -2);
            subTypeOf = $e.closest("tr").attr("subtype-of");
        }
        //let res = this.getvaluesFromPG();
        //$('#txtValues').val(JSON.stringify(res) + '\n\n');

        this.CurMeta = getObjByval(this.Metas, "name", this.CurProp);
        this.check4ReservedVals();

        if (subTypeOf) {
            this.CurMeta = getObjByval(this.Metas, "name", subTypeOf);
        }
        if (this.CurProp === "Name" || this.CurProp === "name") {
            this.updateDD(this.PropsObj);
            let $colTile = "";
            if (this.ParentPG && this.ParentPG.isModalOpen)
                $colTile = $(`#${e.target.defaultValue}.colTile`);
            if ($colTile.length)
                $colTile.attr("id", this.PropsObj[this.CurProp]).find("span").text(this.PropsObj[this.CurProp]);
        }
        if (this.CurMeta && typeof EbOnChangeUIfns !== "undefined" && this.CurMeta.UIChangefn) {
            this.execUiChangeFn(this.CurMeta.UIChangefn, this.PropsObj);
        }
        if (this.CurProp === 'DataSourceId') {
            this.PGHelper.dataSourceInit();
        }
        let newVal = this.PropsObj[this.CurProp];
        this.PropertyChanged(this.PropsObj, this.CurProp, newVal, oldVal);
    };

    this.execUiChangeFn = function (UIChangefn, PropsObj) {
        let NS1 = UIChangefn.split(".")[0];
        let NS2 = UIChangefn.split(".")[1];
        EbOnChangeUIfns[NS1][NS2](PropsObj.EbSid, PropsObj);
    };

    ////Add a control name to Control DD
    this.addToDD = function (obj) {
        //  this.AllObjects[obj.EbSid] = obj;
        let $MainCtrlsDDCont = $(("#" + this.wraperId).replace(/_InnerPG/g, "")).children(".controls-dd-cont");
        let ebsid = obj.EbSid;
        let _name = obj.Name || obj.name;
        if (this.ParentPG && this.ParentPG.isModalOpen) {
            if ($(".pgCXEditor-Cont #SelOpt_" + obj.EbSid + "_" + this.wraperId).length === 0) { // need rework
                $(this.ctrlsDDCont_Slctr + " select").append("<option data-name = '" + ebsid + "'id='SelOpt_" + ebsid + "_" + this.wraperId + "'>" + _name + "</option>");
                $(this.ctrlsDDCont_Slctr + " .selectpicker").selectpicker('refresh');
            }
        }
        else
            if ($MainCtrlsDDCont.find("[data-name=" + obj.EbSid + "]").length === 0) {
                $MainCtrlsDDCont.find("select").append("<option data-name = '" + ebsid + "'id='SelOpt_" + ebsid + "_" + this.wraperId + "'>" + _name + "</option>");
                $MainCtrlsDDCont.find(".selectpicker").selectpicker('refresh');
            }
        $(this.ctrlsDDCont_Slctr + " .selectpicker").selectpicker('val', _name);
    };

    //Add a control name to Control DD
    //this.addToDD = function (obj) {
    //    //  this.AllObjects[obj.EbSid] = obj;
    //    let $MainCtrlsDDCont = $(("#" + this.wraperId).replace(/_InnerPG/g, "")).children(".controls-dd-cont");
    //    let _name = (obj.Name || obj.name);
    //    if ($(".pgCXEditor-bg").css("display") !== "none") {
    //        if ($(".pgCXEditor-Cont #SelOpt" + obj.EbSid + this.wraperId).length === 0) { // need rework
    //            $(this.ctrlsDDCont_Slctr + " select").append("<option data-name = '" + obj.EbSid + "'id='SelOpt" + _name + this.wraperId + "'>" + _name + "</option>");
    //            $(this.ctrlsDDCont_Slctr + " .selectpicker").selectpicker('refresh');
    //        }
    //    }
    //    if ($MainCtrlsDDCont.find("[data-name=" + obj.EbSid + "]").length === 0) {
    //        $MainCtrlsDDCont.find("select").append("<option data-name = '" + obj.EbSid + "'id='M_SelOpt" + _name + this.wraperId + "'>" + _name + "</option>");
    //        $MainCtrlsDDCont.find(".selectpicker").selectpicker('refresh');
    //    }
    //    $(this.ctrlsDDCont_Slctr + " .selectpicker").selectpicker('val', _name);
    //};

    this.updateDD = function (obj) {
        this.removeFromDD(obj.EbSid);
        this.addToDD(obj);
    };

    //removes a control name to Control DD
    this.removeFromDD = function (EbSid) {
        let slctr = EbSid + "_" + this.wraperId;
        if ($(".pgCXEditor-bg").css("display") !== "none")
            slctr = slctr + "_InnerPG";
        if ($("#M_SelOpt_" + slctr).length)
            $("#M_SelOpt_" + slctr).remove();
        if ($("#SelOpt_" + slctr).length)
            $("#SelOpt_" + slctr).remove();
        $(".controls-dd-cont" + " .selectpicker").selectpicker('refresh');
    };
    // PGclose fn
    this.CloseFn = function (e) {
        this.ClosePG();
    };

    this.ClosePG = function (e) {
        this.stickBtn.minimise();
        this.Close();
    };

    //Set basic foundation for PG
    this.init = function () {
        this.$wraper.empty().addClass("pg-wraper");
        this.$wraper.append($(`<div class="pgHead">
                                    <div name="sort" class="icon-cont pull-left"> <i class="fa fa-sort-alpha-asc" aria-hidden="true"></i></div>
                                    <div name="sort" class="icon-cont pull-left"> <i class="fa fa-list-ul" aria-hidden="true"></i></div>
                                    <span>Properties </span>
                                    <div class="icon-cont  pull-right pgpin"><i class="fa fa-thumb-tack" style="transform: rotate(90deg);"></i></div>
                                    </div><div class="controls-dd-cont">
                                    <select class="selectpicker" data-live-search="true"> </select>
                                </div>`));
        this.$wraper.append($("<div id='" + this.wraperId + "_propGrid' class='propgrid-table-cont'></div><div id='" + this.wraperId + "_HelpBox' class='propgrid-helpbox'></div>"));
        this.$PGcontainer = $("#" + this.wraperId + "_propGrid");
        if (!this.IsInnerCall) {
            this.stickBtn = new EbStickButton({
                $wraper: this.$wraper,
                $extCont: this.$extCont,
                label: "Properties",
                $scope: this.$scope,
                style: this.style
            });
            this.$wraper.addClass("outer-pg");
            if (this.Isdraggable) {
                this.$extCont.draggable({
                    handle: ".outer-pg > .pgHead",
                    stop: this.pgDragStop
                });
                this.$fitCornerBtn.insertAfter(this.$wraper.find(".pgpin"));
                this.$fitCornerBtn.on("click", function () {
                    this.$extCont.attr("style", "");
                    this.$extCont.attr("dragging", "false");
                    this.$fitCornerBtn.hide();
                }.bind(this));
            }
        }
        else
            this.$wraper.addClass("inner-pg");


        $(this.ctrlsDDCont_Slctr + " .selectpicker").on('change', this.ctrlsDD_onchange.bind(this));
        $("#" + this.wraperId + " .pgHead").on("click", ".pgpin", this.CloseFn.bind(this));
        this.CXVE = new Eb_pgCXVE(this);
        this.PGHelper = new PGHelper(this);
        $("#" + this.wraperId + " .pgHead").on("click", "[name=sort]", this.SortFn.bind(this));

        $("#" + this.wraperId + " [name=sort]:eq(1)").hide();
        this.EbAlert = new EbAlert({
            id: this.wraperId + "PGalertCont",
            top: 24,
            right: 24
        });
    };

    this.pgDragStop = function () {
        this.$extCont.attr("dragging", "true");
        if (parseInt(this.$extCont.css("top").trim("px")) <= 37)
            this.$extCont.css("top", "37px");
        if (parseInt(this.$extCont.css("top").trim("px")) >= window.innerHeight)
            this.$extCont.css("top", "37px");
        if (parseInt(this.$extCont.css("left").trim("px")) >= window.innerWidth || parseInt(this.$extCont.css("left").trim("px")) < 20 - this.$extCont.width()) {
            this.$extCont.css("left", "auto");
            this.$extCont.css("right", "0px");
        }

        this.$fitCornerBtn.show(100);
    }.bind(this);

    //fires onChange of DDlisting all controls
    this.ctrlsDD_onchange = function (e) {
        let SelItem = $(e.target).find("option:selected").attr("data-name");
        $(`[ebsid=${SelItem}]`).focus();
        SelObj = this.AllObjects[SelItem];
        let type = SelObj.$type.split(",")[0].split(".")[2];
        this.setObject(SelObj, AllMetas[type]);
        this.DD_onChange(e);
    };

    //sort PG irrespective of Groups
    this.SortFn = function (e) {
        this.IsSortByGroup = !this.IsSortByGroup;
        this.InitPG();
        $("#" + this.wraperId + " [name=sort]").toggle();
    };

    //init PG variables, fn bindings
    this.InitPG = function () {
        this.propNames = [];
        this.MISC_GROUP_NAME = 'Miscellaneous';
        this.GET_VALS_FUNC_KEY = 'pg.getValues';
        this.propertyRowsHTML = { 'Misc': '' };
        this.groupsHeaderRowHTML = {};
        this.postCreateInitFuncs = {};
        this.OnChangeExec = {};
        this.getValueFuncs = {};
        this.currGroup = null;
        this.CurProp = null;
        //this.CurEditor = null;
        this.$hiddenProps = {};
        //this.OSElist = {};
        this.uniqueProps = [];
        this.requiredProps = [];
        this.innerHTML = '<table class="table-hover pg-table">';
        this.$PGcontainer.empty();
        $.each(this.Metas, function (i, meta) { this.propNames.push(meta.name.toLowerCase()); }.bind(this));
        this.buildRows();
        this.buildGrid();
        this.CallpostInitFns();
        this.setBasicBinding();
        this.callOnchangeExecFns();
        this.isModalOpen = false;
        this.getvaluesFromPG();//no need

        $("#" + this.wraperId + " .propgrid-table-cont .selectpicker").on('changed.bs.select', this.OnInputchangedFn.bind(this));
        $("#" + this.wraperId + " .propgrid-table-cont .font-selector-btn").on('change', this.OnInputchangedFn.bind(this));// icon selector
        $('#' + this.wraperId + "_propGrid" + ' table td').find("input").change(this.OnInputchangedFn.bind(this));
        $('#' + this.wraperId + "_propGrid" + ' table td').find("input").focus(this.OnInpfocus.bind(this));
        //$('#' + this.wraperId + "_propGrid" + ' table td').find("input").focus(this.OnInpBlur.bind(this));
        $('#' + this.wraperId + "_propGrid" + ' table tr').find(".fa-caret-right").click(this.toggleSubPropRows.bind(this));
        this.addToDD(this.PropsObj);
        //if (this.PropsObj.RenderMe)
        //    RefreshControl(this.PropsObj);///////////////////////////////////////////////////////////////////////
        $("#" + this.wraperId + " .pgCX-Editor-Btn").on("click", this.CXVE.pgCXE_BtnClicked.bind(this.CXVE));
        $("#" + this.wraperId + " .pgRow:contains(Name)").find("input").on("change", this.nameChangedFn);
        $("#" + this.wraperId + " .pgGroupCell").on("click", this.togglePropGroup);
        $("#" + this.wraperId + " .pgRow").on("focus", this.rowFocus);
        this.bindFns();

        if (this.IsReadonly)
            this.ReadOnly();
    };

    this.refresh = function () {
        this.setObject(this.PropsObj, this.Metas);
    }.bind(this);

    // performs some basic tasks after initialization of variables 
    this.setBasicBinding = function () {
        $.each(this.Metas, function (i, meta) {
            this.propNames.push(meta.name.toLowerCase());
            let Name = meta.name;
            let InpId = '#' + this.wraperId + Name;
            let $inp = $('#' + this.wraperId + " " + InpId);
            $('#' + this.wraperId).off("change", InpId);
            if (meta.IsUnique && meta.IsRequired) {
                this.uniqueProps.push(Name);
                //if ($(InpId).length === 0)
                $('#' + this.wraperId).off("blur", InpId).on("blur", InpId, this.check_Unique_Required);
            }
            else {
                if (meta.IsUnique) {
                    this.uniqueProps.push(Name);
                    //if ($(InpId).length === 0)
                    $('#' + this.wraperId).off("blur", InpId).on("blur", InpId, this.checkUnique);
                }
                if (meta.IsRequired) {
                    this.requiredProps.push(Name);
                    //if ($(InpId).length === 0)
                    $('#' + this.wraperId).on("blur", InpId, this.checkRequired);
                }
            }
            if (meta.MaskPattern && $inp.length) {
                $inp.val($inp.val().toLowerCase());
                $inp.inputmask({
                    alias: "Regex",
                    regex: meta.MaskPattern
                });
            }
        }.bind(this));
    };
    // to check in order
    this.check_Unique_Required = function (e) {
        this.checkRequired(e);
        this.checkUnique(e);
    }.bind(this);

    //Checks and alert if a property value is not unique in PG
    this.checkUnique = function (e) {
        console.log("checkUnique called");
        let $e = $(e.target);
        let curObj = this.PropsObj;
        let curVal = $e.val();
        this.CurProp = $e.attr("for");
        if ($e.attr("not-uniq") === "true" && $e.attr("not-req") !== "true") {
            $e.removeClass("Eb-invalid");// clear previuos invalid style if there
        }
        $.each(this.AllObjects, function (i, iterObj) {
            if (iterObj.EbSid === curObj.EbSid// skip iteration if same object
                || iterObj[this.CurProp] === undefined || iterObj[this.CurProp] === null)
                return true;

            if (iterObj[this.CurProp] !== undefined && iterObj[this.CurProp].trim() === curVal.trim()) {
                let alerId = iterObj.EbSid + this.CurProp + "uniq";
                this.EbAlert.clearAlert(alerId);
                this.EbAlert.alert({
                    id: alerId,
                    head: "This property is should be Unique.",
                    body: iterObj.Name + "'s " + this.CurProp + " property has the same value.",
                    type: "info",
                    delay: 5000
                });
                $e.focus().select().addClass("Eb-invalid");
                $e.attr("not-uniq", "true");
                return true;
            }
        }.bind(this));
    }.bind(this);

    //Checks and alert if a required property is left blank
    this.checkRequired = function (e) {
        let $e = $(e.target);
        this.CurProp = $e.attr("for");
        let alerId = this.PropsObj.EbSid + this.CurProp + "req";
        this.EbAlert.clearAlert(alerId);
        if ($e.val().trim() === "") {
            this.EbAlert.alert({
                id: alerId,
                head: "This property is Required!",
                body: "This field cannot left blank.",
                type: "danger",
                delay: 3000
            });
            $e.focus().select().addClass("Eb-invalid");
            $e.attr("not-req", "true");
        }
        else {
            if ($e.attr("not-req") === "true" && $e.attr("not-uniq") !== "true") {
                $e.removeClass("Eb-invalid");
                $e.attr("not-req", "false");
            }
        }
    }.bind(this);

    //??
    this.bindFns = function () {
        $.each(this.Metas, function (i, meta) {

        });
    };
    // fires when a prop row is focused To show help text
    this.rowFocus = function (e) {
        let $e = $(e.target);
        let prop = $e.attr("name").slice(0, -2);
        let helpText = getObjByval(this.Metas, "name", prop).helpText;
        let alias = getObjByval(this.Metas, "name", prop).alias;
        if (helpText) {
            let ht = (alias || prop) + " : &nbsp;&nbsp;" + (($e.closest("tr").attr("tr-for") === "23") ? "" : helpText);
            $("#" + this.wraperId + "_HelpBox").html(ht);
        } else
            $("#" + this.wraperId + "_HelpBox").html("");
    }.bind(this);

    //toggles a propGroup and set necessory flags as attribute
    this.togglePropGroup = function (e) {
        let $GroupHeadRow = $(e.target).closest("[group-h]");
        let isExpanded = $GroupHeadRow.attr("is-expanded") === 'true';
        let groupName = $GroupHeadRow.attr("group-h");
        let $groupRows = $("#" + this.wraperId + " [group=" + groupName + "]");
        if (groupName !== "All") {
            let delay = 100;
            if (isExpanded) {
                setTimeout(function () {
                    $groupRows.filter("[subtype-of]").addClass("hidden");
                    $groupRows.addClass("hidden");
                }.bind(this), 100);

                $groupRows.filter("[subtype-of]").find("td").css("padding", "0 0 0 1.9em").css("opacity", "0");
                $groupRows.find("td").css("padding", "0 0 0 1.9em").css("opacity", "0");
            }
            else {
                $groupRows.not("[is-showprop]").removeClass("hidden");
                $groupRows.filter("[is-showprop=true]").removeClass("hidden");

                $groupRows.filter("[subtype-of]").find("td").removeAttr("style").css("opacity", "1");
                $groupRows.find("td").removeAttr("style").css("opacity", "1");

                $groupRows.filter("[is-expanded]").find(".fa-caret-right").click().click();
            }
        }
        $GroupHeadRow.attr("is-expanded", !isExpanded);

    }.bind(this);
    //toggles subProperty rows
    this.toggleSubPropRows = function (e) {
        let t = 0;
        if (e.hasOwnProperty('originalEvent'))
            t = 200;
        let $parentPropRow = $(e.target).closest("tr");
        let isExpanded = $parentPropRow.attr("is-expanded") === 'true';
        let subtype = $parentPropRow.attr("name").slice(0, -2);
        if (isExpanded)
            $("#" + this.wraperId + " [subtype-of=" + subtype + "]").hide(t);
        else
            $("#" + this.wraperId + " [subtype-of=" + subtype + "]").show(t);
        $parentPropRow.attr("is-expanded", !isExpanded);
    };

    // fire when Name property changed
    this.nameChangedFn = function (e) {
        let name = e.target.value;
        $("#M_SelOpt" + this.PropsObj.EbSid + this.wraperId).text(name);
        $("#SelOpt" + this.PropsObj.EbSid + this.wraperId).text(name);
        // commented to prevent one error
        //if ($(e.target).closest("tr").attr("tr-for") !== "23")
        //    $("#" + this.PropsObj.EbSid + ' span').text(name);

        $(".controls-dd-cont" + " .selectpicker").selectpicker('refresh');
        this.nameChanged(this.PropsObj);
    }.bind(this);

    //removed PG tables from DOM
    this.clear = function () {
        this.$PGcontainer.empty();
    };

    // sets Object to property grid
    this.setObject = function (props, metas, setObjectCallBack = function () { }) {
        //params check
        {
            if (typeof props === 'string' || typeof metas === 'string') {
                console.error('Eb_PropertyGrid got "string" parameter instead of "object"');
                return null;
                //} else if (typeof id === 'object') {
                //    console.error('Eb_PropertyGrid got "object" parameter instead of "string"');
                //    return;
            } else if (typeof props !== 'object' || props === null || typeof metas !== 'object' || metas === null) {
                console.error('Eb_PropertyGrid must get an object in order to initialize the grid.');
                return;
            }
        }
        this.Metas = metas;
        this.PropsObj = props;
        this.setOldValues();
        if (!this.PropsObj.__OSElist)
            this.PropsObj.__OSElist = {};
        this.CurObj = this.PropsObj;
        this.AllObjects[this.PropsObj.EbSid] = this.PropsObj;
        this.ImgSlctrs = {};
        this.FontSlctrs = {};
        this.InitPG();
        $("#" + this.wraperId + " .propgrid-helpbox").show();
        //console.log("default test :" + JSON.stringify(props));
        setObjectCallBack();
    };

    this.setOldValues = function () {
        this.PropsObj.__oldValues = {};
        this.PropsObj.__oldValues = $.extend({}, this.PropsObj);
    };

    // makes PG readonly
    this.ReadOnly = function () {
        this.IsReadonly = true;
        $('<i class="fa fa-lock" aria-hidden="true"></i>').insertAfter($('#' + this.wraperId + " .pgHead span").html('Properties ').css("opacity", "0.72"));
        $('#' + this.wraperId + " input").attr('readonly', 'readonly').css("pointer-events", "none");
        $('#' + this.wraperId + " .propgrid-table-cont select").prop('disabled', true);
        $('#' + this.wraperId + " .propgrid-table-cont .btn").css("background-color", "#ddd").removeClass("disabled").css("cursor", "not-allowed");
        $('#' + this.wraperId + " .propgrid-table-cont").css("background-color", "#e8e8e8").css("cursor", "not-allowed");

        $('#' + this.wraperId + " .controls-dd-cont .btn").removeClass('disabled');
        $('#' + this.wraperId + " .pgCXEditor-Cont select").prop('disabled', true);// all select in cxve
        $('#' + this.wraperId + " .OSE-DD-cont button").prop('disabled', true).css("cursor", "not-allowed");
        $('#' + this.wraperId + " .OSE-DD-cont").css("cursor", "not-allowed");
        $('#' + this.parentId + " .modal-body .colTile").css("cursor", "not-allowed");
        $('#' + this.wraperId + " .modal-footer .btn").prop('disabled', true).css("cursor", "not-allowed");//ce TypeDD
        $('#' + this.wraperId + " .CE-add").prop('disabled', true).css("color", "#5a5a5a").css("cursor", "not-allowed");// CE +
        $('#' + this.wraperId + " .sub-controls-DD-cont").css("cursor", "not-allowed");// CE DD, + cont
        $('#' + this.wraperId + ' .CEctrlsCont button').css("cursor", "not-allowed").prop('disabled', true);//coltile X

    };
    // makes PG readwritable
    this.ReadWrite = function () {
        this.IsReadonly = false;

        $('#' + this.wraperId + " .pgHead span").text('Properties').css("opacity", "1");
        $('#' + this.wraperId + " input").removeAttr('readonly').css("pointer-events", "unset");
        $('#' + this.wraperId + " .propgrid-table-cont select").prop('disabled', false);
        $('#' + this.wraperId + " .propgrid-table-cont .btn").css("background-color", "#fff").css("cursor", "inherit");
        $('#' + this.wraperId + " .propgrid-table-cont").css("background-color", "#fff").css("cursor", "inherit");

        $('#' + this.wraperId + " .pgCXEditor-Cont select").prop('disabled', false);// all select in cxve
        $('#' + this.wraperId + " .OSE-DD-cont button").prop('disabled', false).css("cursor", "inherit");
        $('#' + this.wraperId + " .OSE-DD-cont").css("cursor", "inherit");
        $('#' + this.wraperId + " .modal-footer .btn").prop('disabled', false).css("cursor", "inherit");//ce TypeDD
        $('#' + this.wraperId + " .CE-add").prop('disabled', false).css("color", "#5a5a5a").css("cursor", "inherit");// CE +
        $('#' + this.wraperId + " .sub-controls-DD-cont").css("cursor", "inherit");// CE DD, + cont
        $('#' + this.wraperId + ' .CEctrlsCont button').css("cursor", "inherit").prop('disabled', false);//coltile X
    };

    this.OnInpfocus = function () {
        let $e = $(event.target);
        $e.select();
    };

    //this.OnInpBlur = function () {
    //    let $e = $(event.target);       
    //};

    this.init();
};

/**
 *---- REFERENCE-----
 * jqPropertyGrid
 * https://github.com/ValYouW/jqPropertyGrid
 * Author: YuvalW (ValYouW)
 * License: MIT
 */