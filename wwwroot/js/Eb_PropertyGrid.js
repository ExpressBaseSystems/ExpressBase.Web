var Eb_PropertyGrid = function (id) {
    this.$wraper = $("#" + id);
    this.wraperId = id;
    this.$controlsDD = $(".controls-dd-cont select");
    this.CEctrlsContId = this.wraperId + "_CEctrlsCont";
    this.controlsDDContSelec = "#" + this.wraperId + " .controls-dd-cont";
    this.objects = [];
    this.PropsObj = null;
    this.$hiddenProps = {};
    this.PropertyChanged = null;
    this.IsSortByGroup = true;

    this.getvaluesFromPG = function () {
        // function that will update and return the values back from the property grid
        for (var prop in this.getValueFuncs) {
            if (typeof this.getValueFuncs[prop] !== 'function') continue;
            this.PropsObj[prop] = this.getValueFuncs[prop]();
        }
        return this.PropsObj;
    };

    this.getPropertyRowHtml = function (name, value, meta, options) {
        var valueHTML;
        var type = meta.editor || '';
        var elemId = this.pgId + name;

        // If boolean create checkbox
        if (type === 0 || typeof value === 'boolean') {
            valueHTML = '<input type="checkbox" id="' + elemId + '" value="' + value + '"' + (value ? ' checked' : '') + ' />';
            if (this.getValueFuncs)
                this.getValueFuncs[name] = function () { return $('#' + elemId).prop('checked'); };

            // If options create drop-down list
        } else if (type === 1 && Array.isArray(meta.options)) {
            valueHTML = this.getBootstrapSelectHtml(elemId, value, meta.options);
            this.getValueFuncs[name] = function () { return $('#' + elemId).val(); };
            this.postCreateInitFuncs[name] = function () { $('#' + elemId).parent().find(".selectpicker").selectpicker('val', value); };

            // If number 
        } else if (type === 2) {
            valueHTML = '<input type="number" id="' + elemId + '" value="' + value + '" style="width:100%" />';

            if (this.getValueFuncs)
                this.getValueFuncs[name] = function () { return ($('#' + elemId).val() === "") ? "" : parseInt($('#' + elemId).val()); };

            // If color use color picker 
        } else if (type === 3) {
            valueHTML = '<input type="color" id="' + elemId + '" value="' + value + '" style="width:100%; height: 21px;" />';

            if (this.getValueFuncs)
                this.getValueFuncs[name] = function () { return $('#' + elemId).val(); };

            // If label (for read-only)
        } else if (type === 4) {
            valueHTML = '<label for="' + elemId + '" editor="' + type + '">' + value + '</label>';

            // If collection editor for object || If JS editor
        } else if (type > 6) {
            valueHTML = '<button for="' + name + '" editor="' + type + '" class= "pgCX-Editor-Btn" >... </button>';

            // Default is textbox
        } else {
            valueHTML = '<input type="text" id="' + elemId + '" value="' + value + '"style="width:100%"></div>';
            if (this.getValueFuncs)
                this.getValueFuncs[name] = function () { return $('#' + elemId).val(); };
        }

        if (meta.OnChangeExec)
            this.OnChangeExec[name] = meta.OnChangeExec;

        //     if (typeof meta.description === 'string' && meta.description &&
        //(typeof meta.showHelp === 'undefined' || meta.showHelp)) {
        //         this.displayName += '<span class="pgTooltip" title="' + meta.description + '">' + options.helpHtml + '</span>';
        //     }

        return '<tr class="pgRow" name="' + name + 'Tr" group="' + this.currGroup + '"><td class="pgTdName" data-toggle="tooltip" data-placement="left" title="' + meta.helpText + '">' + (meta.alias || name) + '</td><td class="pgTdval">' + valueHTML + '</td></tr>';
    };

    this.getBootstrapSelectHtml = function (id, selectedValue, options) {
        selectedValue = selectedValue || options[0];

        var html = "<select class='selectpicker' >";

        for (var i = 0; i < options.length; i++)
            html += "<option data-tokens='" + options[i] + "'>" + options[i] + "</option>";

        html += "</select><input type='hidden' value='" + selectedValue + "' id='" + id + "'>";

        return html;
    };

    this.getGroupHeaderRowHtml = function (displayName) {
        if (this.IsSortByGroup)
            return '<tr class="pgGroupRow" group-h="' + displayName + '"><td colspan="2" class="pgGroupCell" onclick="$(\'[group=' + displayName + ']\').slideToggle(0);">'
                + '<span class="bs-caret" style= "margin-right: 5px;" > <span class="caret"></span></span > ' + displayName
                + '</td></tr > ';
        else
            return '<tr class="pgGroupRow" group-h="' + displayName + '"><td colspan="2" class="pgGroupCell"> &nbsp ' + displayName
                + '</td></tr > ';
    };

    this.isContains = function (obj, val) {
        for (var i = 0; i < obj.length; i++)
            if (obj[i].name.toLowerCase() === val.toLowerCase())
                return true;
        return false;
    };

    this.CallpostInitFns = function () {
        // Call the post init functions 
        for (var prop in this.postCreateInitFuncs) {
            if (typeof this.postCreateInitFuncs[prop] === 'function') {
                this.postCreateInitFuncs[prop]();
                this.postCreateInitFuncs[prop] = null;// just in case make sure we are not holding any reference to the functions
            }
        }
        // call OnChangeExec functions
        for (var prop in this.OnChangeExec) {
            var func = this.OnChangeExec[prop].bind(this.PropsObj, this);
            $("#" + this.wraperId + " [name=" + prop + "Tr]").on("change", "input, select", func);
            func();
        }
    };

    this.MakeReadOnly = function (prop) {
        $("#" + this.wraperId + " [name=" + prop + "Tr]").find("input").prop("readonly", true);
    };

    this.MakeReadWrite = function (prop) {
        $("#" + this.wraperId + " [name=" + prop + "Tr]").find("input").prop("readonly", false);
    };

    this.HideProperty = function (prop) {
        if (this.$hiddenProps[prop])
            return;
        var $Tr = $("#" + this.wraperId + " [name=" + prop + "Tr]");
        this.$hiddenProps[prop] = { "$Tr": $Tr, "g": $Tr.attr("group") };
        $Tr.remove();
    };

    this.ShowProperty = function (prop) {
        if (!this.$hiddenProps[prop])
            return;
        var $Tr = this.$hiddenProps[prop].$Tr;
        var g = this.$hiddenProps[prop].g;
        $Tr.insertAfter($("#" + this.wraperId + " [group-h=" + g + "]"));
        this.$hiddenProps[prop] = null;
    };

    this.buildGrid = function () {
        // Now we have all the html we need, just assemble it
        for (var group in this.groupsHeaderRowHTML) {
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
        this.$PGcontainer.html(this.innerHTML);

        $("#" + id + ' .selectpicker').on('change', function (e) { $(this).parent().siblings("input").val($(this).find("option:selected").val()); });

        return true;
    };

    this.buildRows = function () {

        var propArray = [];
        for (var prop in this.PropsObj) { propArray.push(prop); }
        propArray.sort();
        var prop = null;

        for (var i in propArray) {

            prop = propArray[i];
            // Skip if this is not a direct property, a function, or its meta says it's non browsable
            if (!this.PropsObj.hasOwnProperty(prop) || typeof this.PropsObj[prop] === 'function' || !this.isContains(this.Metas, prop))
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
        return true;
    };

    this.OnInputchangedFn = function () {
        this.getvaluesFromPG();
        var res = this.getvaluesFromPG();
        $('#txtValues').val(JSON.stringify(res) + '\n\n');
        this.PropertyChanged(this.PropsObj, );

        if (this.PropsObj.RenderMe)
            this.PropsObj.RenderMe();
    };

    this.addToDD = function () {
        if ($("#SelOpt" + this.PropsObj.EbSid + this.wraperId).length === 0) {
            $(this.controlsDDContSelec + " select").append("<option data-name = '" + this.PropsObj.Name + "'id='SelOpt" + this.PropsObj.Name + this.wraperId + "'>" + this.PropsObj.Name + "</option>");
            $(this.controlsDDContSelec + " .selectpicker").selectpicker('refresh');
        }
        $(this.controlsDDContSelec + " .selectpicker").selectpicker('val', this.PropsObj.Name);

    };

    this.colTileFocusFn = function (e) {
        var $e = $(e.target);
        var id = $e.attr("id");
        var obj = null;
        if (this.CurProp === "Controls")
            obj = this.PropsObj.Controls.GetByName(id);
        else
            obj = this.PropsObj[this.CurProp].filter(function (obj) { return obj.EbSid == e.target.getAttribute("id"); })[0];
        this.CE_PGObj.setObject(obj, AllMetas[$(e.target).attr("eb-type")]);

    };

    this.removeFromDD = function (name) {
        if ($("#SelOpt" + name + this.wraperId)) {
            $("#SelOpt" + name + this.wraperId).remove();
            $(this.controlsDDContSelec + " .selectpicker").selectpicker('refresh');
        }
    };

    this.initCE = function () {

        var CEbody = '<table class="table table-bordered editTbl">'
            + '<tbody>'
            + '<tr>'
            + '<td style="padding: 0px;">'
            + '<div class="CE-controls-head" >' + (this.Metas[this.propNames.indexOf(this.CurProp.toLowerCase())].alias || this.CurProp) + ' </div>'
            + '<div id="' + this.CEctrlsContId + '" class="CEctrlsCont"></div>'
            + '</td>'
            + '<td style="padding: 0px;"><div id="' + this.wraperId + '_InnerPG' + '" class="inner-PG-Cont"><div></td>'
            + '</tr>'
            + '</tbody>'
            + '</table>'
        $("#" + this.wraperId + " .pgCollEditor-Cont .modal-title").text("Collection Editor");
        $("#" + this.wraperId + " .pgCollEditor-Cont .modal-body").html(CEbody);
        $("#" + this.wraperId + " .pgCollEditor-Cont .sub-controls-DD-cont").show();

        this.CE_PGObj = new Eb_PropertyGrid(this.wraperId + "_InnerPG");
    };

    this.initJE = function () {

        var CEbody = '<textarea id="code" name="code" rows="12" cols="40" ></textarea>'
        $("#" + this.wraperId + " .pgCollEditor-Cont .modal-title").text("Javascript Editor");
        $("#" + this.wraperId + " .pgCollEditor-Cont .modal-body").html(CEbody);
        CodeMirror.commands.autocomplete = function (cm) { CodeMirror.showHint(cm, CodeMirror.hint.javascript); };
        window.editor = CodeMirror.fromTextArea(code, {
            mode: "javascript",
            lineNumbers: true,
            lineWrapping: true,
            extraKeys: { "Ctrl-Space": "autocomplete" },
            foldGutter: {
                rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.brace, CodeMirror.fold.comment)
            },
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });
    };

    this.initOSE = function () {

        var OSEbody = '<div class="OSE-body">'
            + '<div class="OSE-DD-cont" > '
            + '<select class="selectpicker">'
            + '<option> DataVisualization </option>'
            + '<option> Report </option>'
            + '</select>'
            + '</div>'
            + '<div id="pgWraper_CEctrlsCont" class="CEctrlsCont">'
            + '</div>'
            + '</div>';
        $("#" + this.wraperId + " .pgCollEditor-Cont .modal-title").text("Object Selector");
        $("#" + this.wraperId + " .pgCollEditor-Cont .modal-body").html(OSEbody);
        $("#pgWraper .pgCollEditor-Cont .modal-body .OSE-DD-cont .selectpicker").selectpicker().on('change', this.showdvList.bind(this));
        this.CE_PGObj = new Eb_PropertyGrid(this.wraperId + "_InnerPG");

    };
    this.pgCXE_BtnClicked = function (e) {
        $("#" + this.wraperId + " .pgCollEditor-bg").show();
        this.CurProp = e.target.getAttribute("for");
        var editor = e.target.getAttribute("editor");
        $("#" + this.wraperId + " .pgCollEditor-Cont .sub-controls-DD-cont").hide();
        if (editor === "7")
            this.initCE();
        if (editor === "8")
            this.initJE();
        if (editor === "10")
            this.initOSE();


        this.setColTiles();

        $("#" + this.wraperId + " .pgCollEditor-Cont").on("click", ".colTile", this.colTileFocusFn.bind(this));
        new dragula([document.getElementById(this.CEctrlsContId)]);
    };


    ////////////////////////////////////////////////////
    this.showdvList = function (e) {
        $.ajax({
            url: "../DV/FetchAllDataVisualizations",
            type: "POST",
            data: { type: $(e.target).find("option:selected").text() },
            success: this.biuldObjList.bind(this)
        });
        $("#objList .list-group").addClass("objlist");
    }

    this.biuldObjList = function (data) {
        $("#" + this.wraperId + " .pgCollEditor-Cont .CEctrlsCont").empty();
        $.each(data, function (refid, name) {
            $("#" + this.wraperId + " .pgCollEditor-Cont .CEctrlsCont").append("<div class='colTile' data-refid='" + refid + "'>" + name + "</div>");
        }.bind(this));
        $("#" + this.wraperId + " .pgCollEditor-Cont .OSE-body .colTile").off("click").on("click", this.AddCsstoLi.bind(this));
    };

    this.AddCsstoLi = function (e) {
        //$(e.target).addClass("active");
        $('#settingsmodal').modal('toggle');
        alert($(e.target).attr("data-refid"));
    };
    ///////////////////////////////////////////////////

    this.init = function () {
        this.$wraper.empty().addClass("pg-wraper");
        this.$wraper.append($('<div class="pgHead"><div name="sort" class="icon-cont pull-left"> <i class="fa fa-sort-alpha-asc" aria-hidden="true"></i></div><div name="sort" class="icon-cont pull-left"> <i class="fa fa-list-ul" aria-hidden="true"></i></div>Properties <div class="icon-cont  pull-right"  onclick="slideRight(\'.form-save-wraper\', \'#form-buider-propGrid\')"><i class="fa fa-thumb-tack" aria-hidden="true"></i></div></div> <div class="controls-dd-cont"> <select class="selectpicker" data-live-search="true"> </select> </div>'));
        this.$wraper.append($("<div id='" + this.wraperId + "_propGrid' class='propgrid-table-cont'></div>"));
        this.$PGcontainer = $("#" + this.wraperId + "_propGrid");
        $(this.controlsDDContSelec + " .selectpicker").on('change', function (e) { $("#" + $(this).find("option:selected").attr("data-name")).focus(); });

        var CE_HTML = '<div class="pgCollEditor-bg">'
            + '<div class="pgCollEditor-Cont">'

            + '<div class="modal-header">'
            + '<button type="button" class="close" onclick="$(\'#' + this.wraperId + ' .pgCollEditor-bg\').hide();" >&times;</button>'
            + '<h4 class="modal-title"> </h4>'
            + '</div>'

            + '<div class="modal-body"> </div>'

            + '<div class="modal-footer">'
            + '<div class="sub-controls-DD-cont pull-left">'
            + '<select class="selectpicker"> </select>'
            + '<button type="button" id="CE_add" class="CE-add" ><i class="fa fa-plus" aria-hidden="true"></i></button>'
            + '</div>'
            + '<button type="button" class="btn"  onclick="$(\'#' + this.wraperId + ' .pgCollEditor-bg\').hide();">OK</button>'
            + '</div>'

            + '</div>'
            + '</div>';
        $(this.$wraper).append(CE_HTML);

        $("#" + this.wraperId + " .pgCollEditor-Cont").on("click", ".CE-add", this.pgCE_AddFn.bind(this));

        $("#" + this.CEctrlsContId).on("click", ".close", this.colTileCloseFn.bind(this));

        $("#" + this.wraperId + " .pgHead").on("click", "[name=sort]", this.SortFn.bind(this));

        $("#" + this.wraperId + " [name=sort]:eq(1)").hide();

    };

    this.SortFn = function (e) {
        this.IsSortByGroup = !this.IsSortByGroup;
        this.InitPG();
        $("#" + this.wraperId + " [name=sort]").toggle();
    };

    this.pgCE_AddFn = function () {
        var SelType = $("#" + this.wraperId + " .pgCollEditor-Cont .modal-footer .sub-controls-DD-cont").find("option:selected").val();
        if (this.CurProp === "Controls")
            this.PropsObj.Controls.$values.push(new EbObjects[SelType](this.PropsObj.EbSid + "_" + SelType + this.PropsObj.Controls.$values.length));
        else
            this.PropsObj[this.CurProp].push(new EbObjects[SelType](this.PropsObj.EbSid + "_" + SelType + this.PropsObj[this.CurProp].length));
        this.setColTiles();
    };

    this.colTileCloseFn = function (e) {
        $(e.target).parent().remove();
    };

    this.setColTiles = function () {
        if (this.CurProp === "Controls")
            var values = this.PropsObj.Controls.$values;
        else
            var values = this.PropsObj[this.CurProp];

        var _html = "";
        var options = "";
        var typesArr = [];
        $.each(values, function (i, control) {
            var type = control.$type.split(",")[0].split(".")[2];
            _html += '<div class="colTile" id="' + control.EbSid + '" tabindex="1" eb-type="' + type + '" onclick="$(this).focus()">'
                + control.Name
                + '<button type="button" class="close">&times;</button>'
                + '</div>';
            if (!typesArr.includes(type))
                typesArr.push(type);
        })

        for (var i = 0; i < typesArr.length; i++) {
            options += '<option>' + typesArr[i] + '</option>'
        }

        $("#" + this.wraperId + " .pgCollEditor-Cont .modal-footer .selectpicker").empty().append(options).selectpicker('refresh');

        $("#" + this.CEctrlsContId).empty().append(_html);
    };


    this.InitPG = function () {
        this.propNames = [];

        this.MISC_GROUP_NAME = 'Misc';
        this.GET_VALS_FUNC_KEY = 'pg.getValues';
        this.pgIdSequence = 0;

        this.propertyRowsHTML = { 'Misc': '' };
        this.groupsHeaderRowHTML = {};
        this.postCreateInitFuncs = {};
        this.OnChangeExec = {};
        this.getValueFuncs = {};

        this.pgId = this.wraperId + this.pgIdSequence++;
        this.currGroup = null;
        this.CurProp = null;

        this.innerHTML = '<table class="table-bordered table-hover pg-table">';

        this.$PGcontainer.empty();

        for (var i = 0; i < this.Metas.length; i++)
            this.propNames.push(this.Metas[i].name.toLowerCase());

        this.buildRows();

        this.buildGrid();

        this.CallpostInitFns();

        this.getvaluesFromPG();//no need

        $("#" + this.wraperId + " .selectpicker").on('changed.bs.select', this.OnInputchangedFn.bind(this));

        $('#' + this.wraperId + "_propGrid" + ' table td').find("input").change(this.OnInputchangedFn.bind(this));

        this.addToDD();

        if (this.PropsObj.RenderMe)
            this.PropsObj.RenderMe();

        $("#" + this.wraperId + " .pgCX-Editor-Btn").on("click", this.pgCXE_BtnClicked.bind(this));

        $("#" + this.wraperId + " .pgRow:contains(Name)").find("input").on("change", function (e) {
            $("#SelOpt" + this.PropsObj.EbSid + this.wraperId).text(e.target.value);
            $(this.controlsDDContSelec + " .selectpicker").selectpicker('refresh');
        }.bind(this));

    };

    this.setObject = function (props, metas) {
        //params check
        {
            if (typeof props === 'string' || typeof metas === 'string') {
                console.error('Eb_PropertyGrid got "string" parameter instead of "object"');
                return null;
            } else if (typeof id === 'object') {
                console.error('Eb_PropertyGrid got "object" parameter instead of "string"');
                return;
            } else if (typeof props !== 'object' || props === null || typeof metas !== 'object' || metas === null) {
                console.error('Eb_PropertyGrid must get an object in order to initialize the grid.');
                return;
            }
        }
        this.Metas = metas;
        this.PropsObj = props;
        console.log(JSON.stringify(props));
        console.log(JSON.stringify(metas));

        this.InitPG();
    };
    this.init();
};







/**
 * jqPropertyGrid
 * https://github.com/ValYouW/jqPropertyGrid
 * Author: YuvalW (ValYouW)
 * License: MIT
 */

/**
 * @typedef {object} JQPropertyGridOptions
 * @property {object} meta - A metadata object describing the obj properties
 */

/* jshint -W089 */
//(function ($) {// jscs:ignore requireNamedUnassignedFunctions
//    var OTHER_GROUP_NAME = 'Other';
//    var GET_VALS_FUNC_KEY = 'pg.getValues';
//    var pgIdSequence = 0;

//    /**
//	 * Generates the property grid
//	 * @param {object} obj - The object whose properties we want to display
//	 * @param {JQPropertyGridOptions} options - Options object for the component
//	 */
//    $.fn.jqPropertyGrid = function (obj, options) {
//        // Check if the user called the 'get' function (to get the values back from the grid).
//        if (typeof obj === 'string' && obj === 'get') {
//            if (typeof this.data(GET_VALS_FUNC_KEY) === 'function') {
//                obj = this.data(GET_VALS_FUNC_KEY)();
//                return obj;
//            }

//            return null;
//        } else if (typeof obj === 'string') {
//            console.error('jqPropertyGrid got invalid option:', obj);
//            return;
//        } else if (typeof obj !== 'object' || obj === null) {
//            console.error('jqPropertyGrid must get an object in order to initialize the grid.');
//            return;
//        }

//        // Normalize options
//        options = options && typeof options === 'object' ? options : {};
//        options.meta = options.meta && typeof options.meta === 'object' ? options.meta : {};
//        options.customTypes = options.customTypes || {};
//        options.helpHtml = options.helpHtml || '[?]';

//        // Seems like we are ok to create the grid
//        var extObject = obj;
//        var meta = options.meta;
//        var propertyRowsHTML = { OTHER_GROUP_NAME: '' };
//        var groupsHeaderRowHTML = {};
//        var postCreateInitFuncs = [];
//        var getValueFuncs = {};
//        var pgId = 'pg' + (pgIdSequence++);

//        var currGroup;
//        for (var prop in obj) {
//            // Skip if this is not a direct property, a function, or its meta says it's non browsable
//            if (!obj.hasOwnProperty(prop) || typeof obj[prop] === 'function' || (meta[prop] && meta[prop].browsable === false)) {
//                continue;
//            }

//            // Check what is the group of the current property or use the default 'Other' group
//            currGroup = (meta[prop] && meta[prop].group) || OTHER_GROUP_NAME;

//            // If this is the first time we run into this group create the group row
//            if (currGroup !== OTHER_GROUP_NAME && !groupsHeaderRowHTML[currGroup]) {
//                groupsHeaderRowHTML[currGroup] = getGroupHeaderRowHtml(currGroup);
//            }

//            // Initialize the group cells html
//            propertyRowsHTML[currGroup] = propertyRowsHTML[currGroup] || '';

//            // Append the current cell html into the group html
//            propertyRowsHTML[currGroup] += getPropertyRowHtml(pgId, prop, obj[prop], meta[prop], postCreateInitFuncs, getValueFuncs, options);


//        }

//        // Now we have all the html we need, just assemble it
//        var innerHTML = '<table class="pgTable">';
//        for (var group in groupsHeaderRowHTML) {
//            // Add the group row
//            innerHTML += groupsHeaderRowHTML[group];
//            // Add the group cells
//            innerHTML += propertyRowsHTML[group];
//        }

//        // Finally we add the 'Other' group (if we have something there)
//        if (propertyRowsHTML[OTHER_GROUP_NAME]) {
//            innerHTML += getGroupHeaderRowHtml(OTHER_GROUP_NAME);
//            innerHTML += propertyRowsHTML[OTHER_GROUP_NAME];
//        }

//        // Close the table and apply it to the div
//        innerHTML += '</table>';
//        this.html(innerHTML);

//        // Call the post init functions
//        for (var i = 0; i < postCreateInitFuncs.length; ++i) {
//            if (typeof postCreateInitFuncs[i] === 'function') {
//                postCreateInitFuncs[i]();
//                // just in case make sure we are not holding any reference to the functions
//                postCreateInitFuncs[i] = null;
//            }
//        }

//        // Create a function that will return tha values back from the property grid
//        var getValues = function () {
//            var result = {};
//            for (var prop in getValueFuncs) {
//                if (typeof getValueFuncs[prop] !== 'function') {
//                    continue;
//                }

//                result[prop] = getValueFuncs[prop]();
//                extObject[prop] = result[prop];
//            }

//            return result;
//        };
//        this.data(GET_VALS_FUNC_KEY, getValues);
//    };

//    /**
//	 * Gets the html of a group header row
//	 * @param {string} displayName - The group display name
//	 */
//    function getGroupHeaderRowHtml(displayName) {
//        return '<tr class="pgGroupRow"><td colspan="2" class="pgGroupCell">' + displayName + '</td></tr>';
//    }

//    /**
//	 * Gets the html of a specific property row
//	 * @param {string} pgId - The property-grid id being rendered
//	 * @param {string} name - The property name
//	 * @param {*} value - The current property value
//	 * @param {object} meta - A metadata object describing this property
//	 * @param {function[]} [postCreateInitFuncs] - An array to fill with functions to run after the grid was created
//	 * @param {object.<string, function>} [getValueFuncs] - A dictionary where the key is the property name and the value is a function to retrieve the propery selected value
//	 * @param {object} options - top level options object for propertyGrid containing all options
//	 */
//    function getPropertyRowHtml(pgId, name, value, meta, postCreateInitFuncs, getValueFuncs, options) {
//        if (!name) {
//            return '';
//        }

//        meta = meta || {};
//        // We use the name in the meta if available
//        var displayName = meta.name || name;
//        var type = meta.type || '';
//        var elemId = pgId + name;

//        var valueHTML;

//        // check if type is registered in customTypes
//        var customTypes = options.customTypes;
//        var isCustomType = false;
//        for (var customType in customTypes) {
//            if (type === customType) {
//                isCustomType = customTypes[customType];
//            }
//        }

//        // If value was handled by custom type
//        if (isCustomType !== false) {
//            valueHTML = isCustomType.html(elemId, name, value, meta);
//            if (getValueFuncs) {
//                if (isCustomType.hasOwnProperty('makeValueFn')) {
//                    getValueFuncs[name] = isCustomType.makeValueFn(elemId, name, value, meta);
//                } else if (isCustomType.hasOwnProperty('valueFn')) {
//                    getValueFuncs[name] = isCustomType.valueFn;
//                } else {
//                    getValueFuncs[name] = function () {
//                        return $('#' + elemId).val();
//                    };
//                }
//            }
//        }

//            // If boolean create checkbox
//        else if (type === 'boolean' || (type === '' && typeof value === 'boolean')) {
//            valueHTML = '<input type="checkbox" id="' + elemId + '" value="' + name + '"' + (value ? ' checked' : '') + ' />';
//            if (getValueFuncs) {
//                getValueFuncs[name] = function () {
//                    return $('#' + elemId).prop('checked');
//                };
//            }

//            // If options create drop-down list
//        } else if (type === 'options' && Array.isArray(meta.options)) {
//            valueHTML = getSelectOptionHtml(elemId, value, meta.options);
//            if (getValueFuncs) {
//                getValueFuncs[name] = function () {
//                    return $('#' + elemId).val();
//                };
//            }

//            // If number and a jqueryUI spinner is loaded use it
//        } else if (typeof $.fn.spinner === 'function' && (type === 'number' || (type === '' && typeof value === 'number'))) {
//            valueHTML = '<input type="number" id="' + elemId + '" value="' + value + '" style="width:100%" />';
//            //if (postCreateInitFuncs) {
//            //    postCreateInitFuncs.push(initSpinner(elemId, meta.options));
//            //}

//            if (getValueFuncs) {
//                getValueFuncs[name] = function () {
//                    return parseInt($('#' + elemId).val());
//                };
//            }

//            // If color and we have the spectrum color picker use it
//        } else if (type === 'color' && typeof $.fn.spectrum === 'function') {
//            valueHTML = '<input type="text" id="' + elemId + '" style="width:100%" />';
//            if (postCreateInitFuncs) {
//                postCreateInitFuncs.push(initColorPicker(elemId, value, meta.options));
//            }

//            if (getValueFuncs) {
//                getValueFuncs[name] = function () {
//                    return $('#' + elemId).spectrum('get').toHexString();
//                };
//            }

//            // If label (for read-only)
//        } else if (type === 'label') {
//            if (typeof meta.description === 'string' && meta.description) {
//                valueHTML = '<label for="' + elemId + '" title="' + meta.description + '">' + value + '</label>';
//            } else {
//                valueHTML = '<label for="' + elemId + '">' + value + '</label>';
//            }

//            // Default is textbox
//        } else {
//            valueHTML = '<input type="text" id="' + elemId + '" value="' + value + '"</input>';
//            if (getValueFuncs) {
//                getValueFuncs[name] = function () {
//                    return $('#' + elemId).val();
//                };
//            }
//        }

//        if (typeof meta.description === 'string' && meta.description &&
//			(typeof meta.showHelp === 'undefined' || meta.showHelp)) {
//            displayName += '<span class="pgTooltip" title="' + meta.description + '">' + options.helpHtml + '</span>';
//        }

//        if (meta.colspan2) {
//            return '<tr class="pgRow"><td colspan="2" class="pgCell">' + valueHTML + '</td></tr>';
//        } else {
//            return '<tr class="pgRow"><td class="pgCell">' + displayName + '</td><td class="pgCell">' + valueHTML + '</td></tr>';
//        }
//    }

//    /**
//	 * Gets a select-option (dropdown) html
//	 * @param {string} id - The select element id
//	 * @param {string} [selectedValue] - The current selected value
//	 * @param {*[]} options - An array of option. An element can be an object with value/text pairs, or just a string which is both the value and text
//	 * @returns {string} The select element html
//	 */
//    function getSelectOptionHtml(id, selectedValue, options) {
//        id = id || '';
//        selectedValue = selectedValue || '';
//        options = options || [];

//        var html = '<select';
//        if (id) {
//            html += ' id="' + id + '"';
//        }

//        html += '>';

//        var text;
//        var value;
//        for (var i = 0; i < options.length; i++) {
//            value = typeof options[i] === 'object' ? options[i].value : options[i];
//            text = typeof options[i] === 'object' ? options[i].text : options[i];

//            html += '<option value="' + value + '"' + (selectedValue === value ? ' selected>' : '>');
//            html += text + '</option>';
//        }

//        html += '</select>';
//        return html;
//    }

//    /**
//	 * Gets an init function to a number textbox
//	 * @param {string} id - The number textbox id
//	 * @param {object} [options] - The spinner options
//	 * @returns {function}
//	 */
//    function initSpinner(id, options) {
//        if (!id) {
//            return null;
//        }
//        // Copy the options so we won't change the user "copy"
//        var opts = {};
//        $.extend(opts, options);

//        // Add a handler to the change event to verify the min/max (only if not provided by the user)
//        opts.change = typeof opts.change === 'undefined' ? onSpinnerChange : opts.change;

//        return function onSpinnerInit() {
//            $('#' + id).spinner(opts);
//        };
//    }

//    /**
//	 * Gets an init function to a color textbox
//	 * @param {string} id - The color textbox id
//	 * @param {string} [color] - The current color (e.g #000000)
//	 * @param {object} [options] - The color picker options
//	 * @returns {function}
//	 */
//    function initColorPicker(id, color, options) {
//        if (!id) {
//            return null;
//        }

//        var opts = {};
//        $.extend(opts, options);
//        if (typeof color === 'string') {
//            opts.color = color;
//        }

//        return function onColorPickerInit() {
//            $('#' + id).spectrum(opts);
//        };
//    }


//})(window.$);
