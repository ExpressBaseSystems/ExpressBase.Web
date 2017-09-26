var Eb_PropertyGrid = function (id) {
    this.$wraper = $("#" + id);
    this.wraperId = id;
    this.$controlsDD = $(".controls-dd-cont select");
    this.ctrlsDDCont_Slctr = "#" + this.wraperId + " .controls-dd-cont";
    this.objects = [];
    this.PropsObj = {};
    this.CXVE = {};
    this.$hiddenProps = {};
    this.IsSortByGroup = true;
    this.PropertyChanged = function (obj) { };
    this.DD_onChange = function (e) { };

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
        }
        else if (type === 1) {    // If options create drop-down list
            valueHTML = this.getBootstrapSelectHtml(elemId, value, meta.options);
            this.getValueFuncs[name] = function () { return $('#' + elemId).val(); };
            this.postCreateInitFuncs[name] = function () { $('#' + elemId).parent().find(".selectpicker").selectpicker('val', value); };
        }
        else if (type === 2) {    // If number 
            valueHTML = '<input type="number" id="' + elemId + '" value="' + value + '" style="width:100%" />';
            if (this.getValueFuncs)
                this.getValueFuncs[name] = function () { return ($('#' + elemId).val() === "") ? "" : parseInt($('#' + elemId).val()); };
        }
        else if (type === 3) {    // If color use color picker 
            valueHTML = '<input type="color" id="' + elemId + '" value="' + value + '" style="width:100%; height: 21px;" />';
            if (this.getValueFuncs)
                this.getValueFuncs[name] = function () { return $('#' + elemId).val(); };
        }
        else if (type === 4) {    // If label (for read-only) span
            valueHTML = '<span style="vertical-align: sub;" for="' + elemId + '" editor="' + type + '">' + value + '</span>';
        }
        else if (type === 5) {    //  If string editor textbox
            valueHTML = '<input type="text" id="' + elemId + '" value="' + value + '"style="width:100%"></div>';
            if (this.getValueFuncs)
                this.getValueFuncs[name] = function () { return $('#' + elemId).val(); };
        }
        else if (type === 6) {    //  If date&time date
            valueHTML = '<input type="date" id="' + elemId + '" value="' + value + '"style="width:100%"></div>';
            if (this.getValueFuncs)
                this.getValueFuncs[name] = function () { return $('#' + elemId).val(); };
        }
        else if (type === 7) {    //  If collection editor
            valueHTML = '<span style="vertical-align: sub;">(Collection)</span>'
                + '<button for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';
        }
        else if (type === 8) {    //  If collection editor
            valueHTML = '<span style="vertical-align: sub;">(Collection)</span>'
                + '<button for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';
        }
        else if (type === 9) {    //  If collection editor
            valueHTML = '<span style="vertical-align: sub;">(Collection)</span>'
                + '<button for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';
        }
        else if (type === 10) {    // If JS editor
            valueHTML = '<span style="vertical-align: sub;">(JavaScript)</span>'
                + '<button for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';
        }
        else if (type === 11) {    // SQL editor
            valueHTML = '<span style="vertical-align: sub;">(SQL)</span>'
                + '<button for="' + name + '" editor= "' + type + '" class= "pgCX-Editor-Btn" >... </button> ';
        }
        else if (type === 12) {  //  If Object Selector editor
            valueHTML = '<input type="text" id="' + elemId + '" for="' + name + '" value="' + value + '" readonly style=" width: calc(100% - 26px); direction: rtl;" />'
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
        var req_html = '';
        if (meta.IsRequired)
            req_html = '<sup style="color: red">*</sup>';
        return '<tr class="pgRow" name="' + name + 'Tr" group="' + this.currGroup + '"><td class="pgTdName" data-toggle="tooltip" data-placement="left" title="' + meta.helpText + '">' + (meta.alias || name) + req_html + '</td><td class="pgTdval">' + valueHTML + '</td></tr>';
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
            return '<tr class="pgGroupRow" group-h="' + displayName + '"><td colspan="2" class="pgGroupCell"> &nbsp ' + displayName + '</td></tr > ';
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

    this.MakeReadOnly = function (prop) { $("#" + this.wraperId + " [name=" + prop + "Tr]").find("input").prop("readonly", true); };

    this.MakeReadWrite = function (prop) { $("#" + this.wraperId + " [name=" + prop + "Tr]").find("input").prop("readonly", false); };

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

    this.addToDD = function (obj) {
        if (!obj)
            obj = this.PropsObj;
        var $MainCtrlsDDCont = $(("#" + this.wraperId).replace(/_InnerPG/g, "")).children(".controls-dd-cont");
        if ($(".pgCXEditor-Cont").find("select") > 0) {// need close look
            if ($(".pgCXEditor-Cont #SelOpt" + obj.EbSid + this.wraperId).length === 0) { // need rework
                $(this.ctrlsDDCont_Slctr + " select").append("<option data-name = '" + obj.Name + "'id='SelOpt" + obj.Name + this.wraperId + "'>" + obj.Name + "</option>");
                $(this.ctrlsDDCont_Slctr + " .selectpicker").selectpicker('refresh');
            }
        }
        if ($MainCtrlsDDCont.find("option:contains(" + obj.EbSid + ")").length === 0) {
            $MainCtrlsDDCont.find("select").append("<option data-name = '" + obj.Name + "'id='SelOpt" + obj.Name + this.wraperId + "'>" + obj.Name + "</option>");
            $MainCtrlsDDCont.find(".selectpicker").selectpicker('refresh');
        }
        $(this.ctrlsDDCont_Slctr + " .selectpicker").selectpicker('val', obj.Name);
    };

    this.removeFromDD = function (name) {
        if ($("#SelOpt" + name + this.wraperId)) {
            $("#SelOpt" + name + this.wraperId).remove();
            $(this.ctrlsDDCont_Slctr + " .selectpicker").selectpicker('refresh');
        }
    };

    this.init = function () {
        this.$wraper.empty().addClass("pg-wraper");
        this.$wraper.append($('<div class="pgHead"><div name="sort" class="icon-cont pull-left"> <i class="fa fa-sort-alpha-asc" aria-hidden="true"></i></div><div name="sort" class="icon-cont pull-left"> <i class="fa fa-list-ul" aria-hidden="true"></i></div>Properties <div class="icon-cont  pull-right"  onclick="slideRight(\'.form-save-wraper\', \'#form-buider-propGrid\')"><i class="fa fa-thumb-tack" aria-hidden="true"></i></div></div> <div class="controls-dd-cont"> <select class="selectpicker" data-live-search="true"> </select> </div>'));
        this.$wraper.append($("<div id='" + this.wraperId + "_propGrid' class='propgrid-table-cont'></div>"));
        this.$PGcontainer = $("#" + this.wraperId + "_propGrid");
        $(this.ctrlsDDCont_Slctr + " .selectpicker").on('change', this.ctrlsDD_onchange.bind(this));

        this.CXVE = new Eb_pgCXVE(this);

        $("#" + this.wraperId + " .pgHead").on("click", "[name=sort]", this.SortFn.bind(this));
        $("#" + this.wraperId + " [name=sort]:eq(1)").hide();
    };

    this.ctrlsDD_onchange = function (e) {
        $("#" + $(e.target).find("option:selected").attr("data-name")).focus();
        this.DD_onChange(e);
    };

    this.SortFn = function (e) {
        this.IsSortByGroup = !this.IsSortByGroup;
        this.InitPG();
        $("#" + this.wraperId + " [name=sort]").toggle();
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

        $("#" + this.wraperId + " .propgrid-table-cont .selectpicker").on('changed.bs.select', this.OnInputchangedFn.bind(this));
        $('#' + this.wraperId + "_propGrid" + ' table td').find("input").change(this.OnInputchangedFn.bind(this));
        this.addToDD();
        if (this.PropsObj.RenderMe)
            this.PropsObj.RenderMe();
        $("#" + this.wraperId + " .pgCX-Editor-Btn").on("click", this.CXVE.pgCXE_BtnClicked.bind(this.CXVE));
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