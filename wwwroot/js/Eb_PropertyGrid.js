var Eb_PropertyGrid = function (id) {
    this.$wraper = $("#" + id);
    this.containerId = id;
    this.$controlsDD = $(".controls-dd-cont select");
    this.objects = [];
    this.PropsObj = null;

    this.getvaluesFromPG = function () {
        // function that will update and return tha values back from the property grid
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
            if (this.getValueFuncs)
                this.getValueFuncs[name] = function () { return $('#' + elemId).val(); };

            if (this.postCreateInitFuncs)
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
            valueHTML = '<label for="' + elemId + '">' + value + '</label>';

            // If collection editor for object
        } else if (type === 7) {
            valueHTML = '<button for="' + elemId + '" class= "pgObjEditBtn" > Settings... </button>';


            // Default is textbox
        } else {
            valueHTML = '<input type="text" id="' + elemId + '" value="' + value + '"style="width:100%"></div>';
            if (this.getValueFuncs)
                this.getValueFuncs[name] = function () { return $('#' + elemId).val(); };
        }

        if (typeof meta.description === 'string' && meta.description &&
			(typeof meta.showHelp === 'undefined' || meta.showHelp)) {
            this.displayName += '<span class="pgTooltip" title="' + meta.description + '">' + options.helpHtml + '</span>';
        }

        return '<tr class="pgRow" group="' + this.currGroup + '"><td data-toggle="tooltip" data-placement="left" title="' + meta.helpText + '" class="pgCell">' + name + '</td><td class="pgTdval">' + valueHTML + '</td></tr>';
    };

    this.getBootstrapSelectHtml = function (id, selectedValue, options) {
        selectedValue = selectedValue || options[0];

        var html = "<select class='selectpicker' data-live-search='true'>";

        for (var i = 0; i < options.length; i++)
            html += "<option data-tokens='" + options[i] + "'>" + options[i] + "</option>";

        html += "</select><input type='hidden' value='" + selectedValue + "' id='" + id + "'>";

        return html;
    };

    this.getGroupHeaderRowHtml = function (displayName) {
        return '<tr class="pgGroupRow"><td colspan="2" class="pgGroupCell" onclick="$(\'[group=' + displayName + ']\').slideToggle(0);">' + displayName
            + '<span class="bs-caret" style="float: right;margin-right: 10px;"><span class="caret"></span></span></td></tr>';
    };

    this.isContains = function (obj, val) {
        for (var i = 0; i < obj.length; i++)
            if (obj[i].name.toLowerCase() === val.toLowerCase())
                return true;
        return false;
    };

    this.CallpostinitFns = function () {
        // Call the post init functions 
        for (var prop in this.postCreateInitFuncs) {
            if (typeof this.postCreateInitFuncs[prop] === 'function') {
                this.postCreateInitFuncs[prop]();
                this.postCreateInitFuncs[prop] = null;// just in case make sure we are not holding any reference to the functions
            }
        }
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
        this.$container.html(this.innerHTML);

        $("#" + id + ' .selectpicker').on('change', function (e) { $(this).parent().siblings("input").val($(this).find("option:selected").val()); });

        return true;
    };

    this.buildRows = function () {

        for (var prop in this.PropsObj) {
            // Skip if this is not a direct property, a function, or its meta says it's non browsable
            if (!this.PropsObj.hasOwnProperty(prop) || typeof this.PropsObj[prop] === 'function' || !this.isContains(this.Metas, prop))
                continue;

            // Check what is the group of the current property or use the default 'Other' group
            this.currGroup = (this.Metas[this.propNames.indexOf(prop.toLowerCase())]).group || this.MISC_GROUP_NAME;

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

        if (this.PropsObj.RenderMe)
            this.PropsObj.RenderMe();
    };

    this.addToDD = function () {
        if ($("#SelOpt" + this.PropsObj.EbSid + this.containerId).length === 0) {
            $(".controls-dd-cont select").append("<option data-name = '" + this.PropsObj.Name + "'id='SelOpt" + this.PropsObj.Name + this.containerId + "'>" + this.PropsObj.Name + "</option>");
            $(".controls-dd-cont .selectpicker").selectpicker('refresh');
        }
        $(".controls-dd-cont .selectpicker").selectpicker('val', this.PropsObj.Name);

    };

    this.removeFromDD = function (name) {
        if ($("#SelOpt" + name + this.containerId)) {
            $("#SelOpt" + name + this.containerId).remove();
            $(".controls-dd-cont .selectpicker").selectpicker('refresh');
        }
    };


    this.refreshCtrlsDD = function () {
        $('.selectpicker').selectpicker('refresh');
        $(".controls-dd-cont .selectpicker").selectpicker('val', this.PropsObj.Name);
    };

    this.pgObjEditBtnClicked = function () {
        $(".pgObjSettings-bg").show();

        $("#OEctrlsCont").empty().append(this.getOEhtml());
    };

    this.init = function () {
        this.$wraper.empty();
        this.$wraper.append($('<div class="pgHead">Properties <i class="fa fa-thumb-tack pin" onclick="slideRight(\'.form-save-wraper\', \'#form-buider-propGrid\')" aria-hidden="true"></i></div> <div class="controls-dd-cont"> <select class="selectpicker" data-live-search="true"> </select> </div>'));
        this.$wraper.append($("<div id='" + this.containerId + "_propGrid' class='propgrid-table-cont'></div>"));
        this.$container = $("#" + this.containerId + "_propGrid");
        $('.controls-dd-cont .selectpicker').on('change', function (e) { $("#" + $(this).find("option:selected").attr("data-name")).focus(); });

        var OEHTML = '<div class="pgObjSettings-bg" onclick="$(this).hide();">'
                                            + '<div class="pgObjSettings-Cont formB-box" onclick="event.stopPropagation();">'
                                                + '<div class="modal-header">'
                                                    + '<button type="button" class="close" onclick="$(\'.pgObjSettings-bg\').hide();" >&times;</button>'
                                                    + '<h4 class="modal-title">Column Settings</h4>'
                                                + '</div>'
                                                + '<div class="modal-body">'
                                                    + '<table class="table table-bordered editTbl">'

                                                       + '<tbody>'
                                                            + '<tr>'
                                                                + '<td style="padding: 0px;">'

                                                                    + '<div style="background-color: #dddddd;"><div class="editObj-head" >Columns </div>'
                                                                        + '<button type="button" id="editObj_add" class="editObj-add pull-right" ><i class="fa fa-plus" aria-hidden="true"></i></button>'
                                                                    + '</div>'

                                                                    + '<div id="OEctrlsCont">'
                                                                    + '</div>'

                                                                + '</td>'
                                                                + '<td><div id="' + this.containerId + 'innerPG' + '"><div></td>'
                                                            + '</tr>'
                                                        + '</tbody>'
                                                    + '</table>'
                                                + '</div>'
                                                + '<div class="modal-footer">'
                                                    + '<button type="button" class="btn btn-default" >Save</button>'
                                                    + '<button type="button" class="btn"  onclick="$(\'.pgObjSettings-bg\').hide();">Cancel</button>'
                                                + '</div>'
                                            + '</div>'
                                        + '</div>';
        $(document.body).append(OEHTML);
    };

    this.pgObjEditAddFn = function () {
        var tile = '<div class="colTile" tabindex="1" onclick="$(this).focus()">'
                        + 'col 1 '
                        + '<button type="button" class="close">&times;</button>'
                    + '</div>';
        $("#OEctrlsCont").append(tile);

    };

    this.colTileCloseFn = function (e) {
        $(e.target).parent().remove();
    };

    this.getOEhtml = function () {
        var _html = "";
        $.each(this.PropsObj.Controls.$values, function (i , control) {
            _html += '<div class="colTile" tabindex="1" onclick="$(this).focus()">'
                        + control.Name
                        + '<button type="button" class="close">&times;</button>'
                    + '</div>';
        })
        var OEPGobj = new Eb_PropertyGrid(this.containerId + "innerPG");
        OEPGobj.setObject(this.PropsObj.Controls.$values[0], AllMetas["EbTableTd"]);
        return _html;
    };
    

    this.InitPG = function () {
        this.propNames = [];

        this.MISC_GROUP_NAME = 'Misc';
        this.GET_VALS_FUNC_KEY = 'pg.getValues';
        this.pgIdSequence = 0;

        this.propertyRowsHTML = { 'Misc': '' };
        this.groupsHeaderRowHTML = {};
        this.postCreateInitFuncs = {};
        this.getValueFuncs = {};

        this.pgId = this.containerId + this.pgIdSequence++;
        this.currGroup = null;
        
        this.innerHTML = '<table class="table-bordered table-hover pg-table">';

        this.$container.empty();

        for (var i = 0; i < this.Metas.length; i++)
            this.propNames.push(this.Metas[i].name.toLowerCase());

        this.buildRows();

        this.buildGrid();

        this.CallpostinitFns();

        this.getvaluesFromPG();//no need

        $("#" + this.containerId + " .selectpicker").on('changed.bs.select', this.OnInputchangedFn.bind(this));

        $('#' + this.containerId + "_propGrid" + ' table td').find("input").change(this.OnInputchangedFn.bind(this));

        this.addToDD();

        if (this.PropsObj.RenderMe)
            this.PropsObj.RenderMe();

        $(".pgObjEditBtn").on("click", this.pgObjEditBtnClicked.bind(this));

        $(".pgRow:contains(Name)").find("input").on("change", function (e) {
            $("#SelOpt" + this.PropsObj.EbSid + this.containerId).text(e.target.value);
            $(".controls-dd-cont .selectpicker").selectpicker('refresh');
        }.bind(this));

        $("#editObj_add").on("click", this.pgObjEditAddFn.bind(this));

        $("#OEctrlsCont").on("click", ".close", this.colTileCloseFn.bind(this));

        new dragula([document.getElementById("OEctrlsCont")]);
        
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
