var Eb_PropertyGrid = function (id) {
    this.$wraper = $("#" + id);
    this.wraperId = id;
    this.$controlsDD = $(".controls-dd-cont select");
    this.CEctrlsContId = this.wraperId + "_CEctrlsCont";
    this.ctrlsDDCont_Slctr = "#" + this.wraperId + " .controls-dd-cont";
    this.pgCXE_Cont_Slctr = "#" + this.wraperId + " .pgCXEditor-Cont";
    this.objects = [];
    this.PropsObj = null;
    this.$hiddenProps = {};
    this.PropertyChanged = function (obj) { };
    this.OnCXE_OK = function (obj) { };
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

        if (type === 0 || typeof value === 'boolean') {    // If boolean create checkbox
            valueHTML = '<input type="checkbox" id="' + elemId + '" value="' + value + '"' + (value ? ' checked' : '') + ' />';
            if (this.getValueFuncs)
                this.getValueFuncs[name] = function () { return $('#' + elemId).prop('checked'); };

        } else if (type === 1) {    // If options create drop-down list
            valueHTML = this.getBootstrapSelectHtml(elemId, value, meta.options);
            this.getValueFuncs[name] = function () { return $('#' + elemId).val(); };
            this.postCreateInitFuncs[name] = function () { $('#' + elemId).parent().find(".selectpicker").selectpicker('val', value); };

        } else if (type === 2) {    // If number 
            valueHTML = '<input type="number" id="' + elemId + '" value="' + value + '" style="width:100%" />';

            if (this.getValueFuncs)
                this.getValueFuncs[name] = function () { return ($('#' + elemId).val() === "") ? "" : parseInt($('#' + elemId).val()); };

        } else if (type === 3) {    // If color use color picker 
            valueHTML = '<input type="color" id="' + elemId + '" value="' + value + '" style="width:100%; height: 21px;" />';

            if (this.getValueFuncs)
                this.getValueFuncs[name] = function () { return $('#' + elemId).val(); };
        } else if (type === 4) {    // If label (for read-only) span
            valueHTML = '<span style="vertical-align: sub;" for="' + elemId + '" editor="' + type + '">' + value + '</span>';

        } else if (type === 5) {    //  If string editor textbox
            valueHTML = '<input type="text" id="' + elemId + '" value="' + value + '"style="width:100%"></div>';
            if (this.getValueFuncs)
                this.getValueFuncs[name] = function () { return $('#' + elemId).val(); };

        } else if (type === 6) {    //  If date&time date
            valueHTML = '<input type="date" id="' + elemId + '" value="' + value + '"style="width:100%"></div>';
            if (this.getValueFuncs)
                this.getValueFuncs[name] = function () { return $('#' + elemId).val(); };

        } else if (type === 7) {    //  If collection editor
            valueHTML = '<span style="vertical-align: sub;">(Collection)</span>'
                + '<button for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';

        } else if (type === 8) {    // If JS editor
            valueHTML = '<span style="vertical-align: sub;">(JavaScript)</span>'
                + '<button for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';

        } else if (type === 9) {    // SQL editor
            valueHTML = '<span style="vertical-align: sub;">(SQL)</span>'
                + '<button for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';

        } else if (type === 10) {  //  If Object Selector editor
            valueHTML = '<input type="text" id="' + elemId + '" for="' + name + '" value="' + value + '" style=" width: calc(100% - 26px);" />'
                + '<button for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';

            // Default is textbox
        } else {
            valueHTML = 'editor Not implemented';
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

    this.OnInputchangedFn = function (e) {
        this.getvaluesFromPG();
        if (e)
            this.CurProp = $(e.target).closest("tr").attr("name").slice(0, -2);;
        var res = this.getvaluesFromPG();
        $('#txtValues').val(JSON.stringify(res) + '\n\n');
        this.PropertyChanged(this.PropsObj, this.CurProp);

        if (this.PropsObj.RenderMe)
            this.PropsObj.RenderMe();
    };

    this.addToDD = function () {
        if ($("#SelOpt" + this.PropsObj.EbSid + this.wraperId).length === 0) {
            $(this.ctrlsDDCont_Slctr + " select").append("<option data-name = '" + this.PropsObj.Name + "'id='SelOpt" + this.PropsObj.Name + this.wraperId + "'>" + this.PropsObj.Name + "</option>");
            $(this.ctrlsDDCont_Slctr + " .selectpicker").selectpicker('refresh');
        }
        $(this.ctrlsDDCont_Slctr + " .selectpicker").selectpicker('val', this.PropsObj.Name);

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
            $(this.ctrlsDDCont_Slctr + " .selectpicker").selectpicker('refresh');
        }
    };

    this.refreshDD = function (e) {
        e.stopPropagation();
        var $selectedOpt = $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker").find("option:selected");
        var ObjType = $selectedOpt.attr("obj-type");
        this.OSElist[ObjType] = null;
        this.getOSElist.bind(this)();
    };

    this.initCE = function () {

        var CEbody = '<div class="CE-body">'
            + '<table class="table table-bordered editTbl">'
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
            + '</div>'
        $(this.pgCXE_Cont_Slctr + " .modal-title").text("Collection Editor");
        $(this.pgCXE_Cont_Slctr + " .modal-body").html(CEbody);
        $(this.pgCXE_Cont_Slctr + " .sub-controls-DD-cont").show();

        this.CE_PGObj = new Eb_PropertyGrid(this.wraperId + "_InnerPG");
        this.setColTiles();
    };

    this.initJE = function () {

        var CEbody = '<textarea id="JE_txtEdtr' + this.wraperId + '" rows="12" cols="40" ></textarea>'
        $(this.pgCXE_Cont_Slctr + " .modal-title").text("Javascript Editor");
        $(this.pgCXE_Cont_Slctr + " .modal-body").html(CEbody);
        CodeMirror.commands.autocomplete = function (cm) { CodeMirror.showHint(cm, CodeMirror.hint.javascript); };
        window.editor = CodeMirror.fromTextArea(document.getElementById('JE_txtEdtr' + this.wraperId), {
            mode: "javascript",
            lineNumbers: true,
            lineWrapping: true,
            extraKeys: { "Ctrl-Space": "autocomplete" },
            foldGutter: {
                rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.brace, CodeMirror.fold.comment)
            },
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });

        this.setColTiles();
    };

    this.initOSE = function () {

        var OSEbody = '<div class="OSE-body">'
            + '<table class="table table-bordered editTbl">'
            + '<tbody>'
            + '<tr>'
            + '<td style="padding: 0px;">'
            + '<div class="OSE-DD-cont" > '
            + '<select class="selectpicker">'
            + '<option obj-type="11"> DataVisualization </option>'
            + '<option obj-type="3"> Report </option>'
            + '</select>'
            + '</div>'
            + '<div class="OSEctrlsCont"> </div>'
            + '</td>'
            + '<td style="padding: 0px;">'
            + '<div class="CE-controls-head"> Versions </div>'
            + '<div class="OSE-verTile-Cont"> </div>'
            + '</td> '
            + '</tr>'
            + '</tbody>'
            + '</table>'
            + '</div>';
        $(this.pgCXE_Cont_Slctr + " .modal-title").text("Object Selector");
        $(this.pgCXE_Cont_Slctr + " .modal-body").html(OSEbody);
        $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker").selectpicker().on('change', this.getOSElist.bind(this));

        var CurRefId = $("#" + this.wraperId + " [name=" + this.CurProp + "Tr]").find("input").val();
        var $CXbtn = $("#" + this.wraperId + " [name=" + this.CurProp + "Tr] .pgCX-Editor-Btn");
        if (CurRefId) {
            var ObjType = CurRefId.split("-")[2];
            var ObjName = $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker [obj-type=" + ObjType + "]").text();
            $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont a:contains(" + ObjName + ")").click();
        }
        else
            this.getOSElist.bind(this)();

    };
    ////////////////////////////////////////////////////
    this.getOSElist = function () {
        var $CXbtn = $("#" + this.wraperId + " [name=" + this.CurProp + "Tr] .pgCX-Editor-Btn");
        var $selectedOpt = $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker").find("option:selected");
        $CXbtn.attr("objtype-name", $selectedOpt.text());///
        var ObjType = $selectedOpt.attr("obj-type");

        if (!this.OSElist[ObjType]) {
            $.LoadingOverlay("show");
            $.ajax({
                url: "../DV/FetchAllDataVisualizations",
                type: "POST",
                data: { type: $selectedOpt.text() },
                success: this.biuldObjList
            });
        }
        else
            this.biuldObjList(this.OSElist[ObjType]);
    }

    this.biuldObjList = function (data) {
        $.LoadingOverlay("hide");
        var ObjType = null;
        $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont").empty();
        $.each(data, function (name, val) {
            $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont").append('<div class="colTile" tabindex="1" name ="' + name + '">' + name
                + '<i class="fa fa-chevron-right pull-right ColT-right-arrow"  aria-hidden="true"></i></div>');
            ObjType = val[0].refId.split("-")[2];
        }.bind(this));
        this.OSElist[ObjType] = data;
        $(this.pgCXE_Cont_Slctr + " .OSE-body .colTile").off("click").on("click", this.OTileClick.bind(this, data));
        $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").off("click").on("click", ".colTile", this.VTileClick.bind(this, data));
        if ($(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .filter-option .fa-refresh").length === 0) {
            var $refresh = $('<i class="fa fa-refresh DD-refresh" aria-hidden="true"></i>').on("click", this.refreshDD.bind(this));
            $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .filter-option").append($refresh);
        }
        var $CXbtn = $("#" + this.wraperId + " [name=" + this.CurProp + "Tr] .pgCX-Editor-Btn");
        var CurRefId = $("#" + this.wraperId + " [name=" + this.CurProp + "Tr]").find("input").val();

        var objName = $CXbtn.attr("obj-name") || this.getOBjNameByval(data, CurRefId);
        if (CurRefId) {
            if ($(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .colTile:contains(" + objName + ")").length > 0)// need to change
                $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .colTile:contains(" + objName + ")").focus()[0].click();
            else
                $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").empty();
        }

    }.bind(this);

    this.getOBjNameByval = function (data, refId) {
        var ObjName = null;
        var f = false;
        for (objName in data) {
            $.each(data[objName], function (i, obj) {
                if (obj.refId === refId) {
                    ObjName = obj.name;
                    f = true;
                    this.OSECurObj = obj;
                    return ObjName;
                }
            }.bind(this));
            if (f)
                break;
        }
        return ObjName;
    };

    this.OTileClick = function (data) {
        var ObjName = event.target.getAttribute("name");
        //$(event.target).focus();
        $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .colTile").attr("is-selected", false).find(".fa-chevron-right").css("visibility", "hidden");
        $(event.target).attr("is-selected", true).find(".fa-chevron-right").css("visibility", "visible");
        $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").empty();
        $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").attr("for", ObjName);
        $.each(data[ObjName], function (i, obj) {
            $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").append('<div class="colTile" tabindex="1" ver-no="' + obj.versionNumber + '" data-refid="' + obj.refId + '">' + obj.versionNumber
                + '<i class="fa fa-check pull-right" style="display:none; color:#5cb85c; font-size: 18px;" aria-hidden="true"></i></div>');
        }.bind(this));
        var $CXbtn = $("#" + this.wraperId + " [name=" + this.CurProp + "Tr] .pgCX-Editor-Btn");
        if ($CXbtn.attr("obj-name")) {
            if ($CXbtn.attr("obj-name") === $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").attr("for"))///////////////////////////////////
                $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont .colTile:contains(" + $CXbtn.attr("ver-name") + ")")[0].click();
        }
        else
            if (this.OSECurObj)
                $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont [ver-no=" + this.OSECurObj.versionNumber + "]")[0].click();
    };
    this.VTileClick = function () {
        //$(event.target).focus();
        $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont .colTile").attr("is-selected", false).find(".fa-check").hide();
        var refId = $(event.target).attr("data-refid");
        this.PropsObj[this.CurProp] = refId;
        $("#" + this.wraperId + " [name=" + this.CurProp + "Tr]").find("input").val(refId);
        $(event.target).attr("is-selected", true).find(".fa-check").show();


        var ObjName = $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").attr("for");
        $("#" + this.wraperId + ".pgCX-Editor-Btn,[for=" + this.CurProp + "]").attr("obj-name", ObjName);//
        $("#" + this.wraperId + ".pgCX-Editor-Btn,[for=" + this.CurProp + "]").attr("ver-name", $(event.target).text());//
    };

    /////////////////////////////////////////////////

    this.pgCXE_BtnClicked = function (e) {
        $("#" + this.wraperId + " .pgCollEditor-bg").show();
        this.CurProp = e.target.getAttribute("for");
        this.CurEditor = this.Metas[this.propNames.indexOf(this.CurProp.toLowerCase())].editor;
        var editor = e.target.getAttribute("editor");
        $(this.pgCXE_Cont_Slctr + " .sub-controls-DD-cont").hide();
        if (editor === "7") {
            this.initCE();
        }
        if (editor === "8") {
            this.initJE();
        }
        if (editor === "10")
            this.initOSE();



        $("#" + this.wraperId + " .CE-body").off("click", ".colTile").on("click", ".colTile", this.colTileFocusFn.bind(this));
        $(this.pgCXE_Cont_Slctr).off("click", "[name=CXE_OK]").on("click", "[name=CXE_OK]", this.CXE_OKclicked.bind(this));

        new dragula([document.getElementById(this.CEctrlsContId)]);
    };

    this.CXE_OKclicked = function () {
        this.OnInputchangedFn.bind(this)();
        this.OnCXE_OK(this.PropsObj[this.CurProp]);
    };

    this.init = function () {
        this.$wraper.empty().addClass("pg-wraper");
        this.$wraper.append($('<div class="pgHead"><div name="sort" class="icon-cont pull-left"> <i class="fa fa-sort-alpha-asc" aria-hidden="true"></i></div><div name="sort" class="icon-cont pull-left"> <i class="fa fa-list-ul" aria-hidden="true"></i></div>Properties <div class="icon-cont  pull-right"  onclick="slideRight(\'.form-save-wraper\', \'#form-buider-propGrid\')"><i class="fa fa-thumb-tack" aria-hidden="true"></i></div></div> <div class="controls-dd-cont"> <select class="selectpicker" data-live-search="true"> </select> </div>'));
        this.$wraper.append($("<div id='" + this.wraperId + "_propGrid' class='propgrid-table-cont'></div>"));
        this.$PGcontainer = $("#" + this.wraperId + "_propGrid");
        $(this.ctrlsDDCont_Slctr + " .selectpicker").on('change', function (e) { $("#" + $(this).find("option:selected").attr("data-name")).focus(); });

        var CE_HTML = '<div class="pgCollEditor-bg">'
            + '<div class="pgCXEditor-Cont">'

            + '<div class="modal-header">'
            + '<button type="button" class="close" onclick="$(\'#' + this.wraperId + ' .pgCollEditor-bg\').hide();" >&times;</button>'
            + '<h4 class="modal-title"> </h4>'
            + '</div>'

            + '<div class="modal-body"> </div>'

            + '<div class="modal-footer">'
            + '<div class="sub-controls-DD-cont pull-left">'
            + '<select class="selectpicker"> </select>'
            + '<button type="button" class="CE-add" ><i class="fa fa-plus" aria-hidden="true"></i></button>'
            + '</div>'
            + '<button type="button" name="CXE_OK" class="btn"  onclick="$(\'#' + this.wraperId + ' .pgCollEditor-bg\').hide();">OK</button>'
            + '</div>'

            + '</div>'
            + '</div>';
        $(this.$wraper).append(CE_HTML);

        $(this.pgCXE_Cont_Slctr).on("click", ".CE-add", this.pgCE_AddFn.bind(this));

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
        var SelType = $(this.pgCXE_Cont_Slctr + " .modal-footer .sub-controls-DD-cont").find("option:selected").val();
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
            _html += '<div class="colTile" id="' + control.EbSid + '" tabindex="1" eb-type="' + type + '" onclick="$(this).focus()"><i class="fa fa-arrows" aria-hidden="true" style="padding-right: 5px; font-size:10px;"></i>'
                + control.Name
                + '<button type="button" class="close">&times;</button>'
                + '</div>';
            if (!typesArr.includes(type))
                typesArr.push(type);
        })

        for (var i = 0; i < typesArr.length; i++) {
            options += '<option>' + typesArr[i] + '</option>'
        }

        $(this.pgCXE_Cont_Slctr + " .modal-footer .selectpicker").empty().append(options).selectpicker('refresh');

        $("#" + this.CEctrlsContId).empty().append(_html);
    };


    this.InitPG = function () {
        this.propNames = [];

        this.MISC_GROUP_NAME = 'Miscellaneous';
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
        this.CurEditor = null;
        this.OSElist = {};

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
            $(this.ctrlsDDCont_Slctr + " .selectpicker").selectpicker('refresh');
        }.bind(this));

    };

    this.clear = function () {
        this.$PGcontainer.empty();
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