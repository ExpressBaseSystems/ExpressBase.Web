
var Eb_PropertyGrid = function (id, obj) {
    //params check
    {
        if (typeof obj === 'string') {
            console.error('Eb_PropertyGrid got "string" parameter instead of "object"');
            return null;
        } else if (typeof id === 'object') {
            console.error('Eb_PropertyGrid got "object" parameter instead of "string"');
            return;
        } else if (typeof obj !== 'object' || obj === null) {
            console.error('Eb_PropertyGrid must get an object in order to initialize the grid.');
            return;
        }
    }
    this.Metas = obj.Metas;
    delete obj.Metas;
    this.PropsObj = obj;
    this.$container = $("#" + id);

    this.propNames = [];

    this.MISC_GROUP_NAME = 'Misc';
    this.GET_VALS_FUNC_KEY = 'pg.getValues';
    this.pgIdSequence = 0;

    this.propertyRowsHTML = { 'Misc': '' };
    this.groupsHeaderRowHTML = {};
    this.postCreateInitFuncs = [];
    this.getValueFuncs = {};
    this.pgId = 'pg' + (this.pgIdSequence++);
    this.currGroup = null;
    this.innerHTML = '<table class="pgTable">';

    //alert("Metas:" + JSON.stringify(this.Metas));
    //alert("PropsObj:" + JSON.stringify(this.PropsObj));

    this.isContains = function (obj, val) {
        for (var i = 0; i < obj.length; i++)
            if (obj[i].name === val)
                return true;
        return false;
    };

    this.buildRows = function () {

        for (var prop in this.PropsObj) {
            // Skip if this is not a direct property, a function, or its meta says it's non browsable
            if (!this.PropsObj.hasOwnProperty(prop) || typeof this.PropsObj[prop] === 'function' || !this.isContains(this.Metas, prop))
                continue;

            // Check what is the group of the current property or use the default 'Other' group
            this.currGroup = (this.Metas[this.propNames.indexOf(prop)]).group || this.MISC_GROUP_NAME;

            // If this is the first time we run into this group create the group row
            if (this.currGroup !== this.MISC_GROUP_NAME && !this.groupsHeaderRowHTML[this.currGroup])
                this.groupsHeaderRowHTML[this.currGroup] = this.getGroupHeaderRowHtml(this.currGroup);

            // Initialize the group cells html
            this.propertyRowsHTML[this.currGroup] = this.propertyRowsHTML[this.currGroup] || '';

            // Append the current cell html into the group html
            this.propertyRowsHTML[this.currGroup] += this.getPropertyRowHtml(prop, this.PropsObj[prop], this.Metas[this.propNames.indexOf(prop)], (this.Metas[this.propNames.indexOf(prop)]).options);

        }
    };

    this.getGroupHeaderRowHtml = function (displayName) {
        return '<tr class="pgGroupRow"><td colspan="2" class="pgGroupCell">' + displayName + '</td></tr>';
    }

    this.init = function () {
        for (var i = 0; i < this.Metas.length; i++)
            this.propNames.push(this.Metas[i].name);

        this.buildRows();

        this.buildGrid();

        //this.CallpostinitFns();

        this.getvaluesFromPG();
    };

    this.buildGrid = function () {
        // Now we have all the html we need, just assemble it
        var innerHTML = '<table class="pgTable">';
        for (var group in this.groupsHeaderRowHTML) {
            // Add the group row
            innerHTML += this.groupsHeaderRowHTML[group];
            // Add the group cells
            innerHTML += this.propertyRowsHTML[group];
        }

        // Finally we add the 'Other' group (if we have something there)
        if (this.propertyRowsHTML[this.MISC_GROUP_NAME]) {
            innerHTML += this.getGroupHeaderRowHtml(this.MISC_GROUP_NAME);
            innerHTML += this.propertyRowsHTML[this.MISC_GROUP_NAME];
        }

        // Close the table and apply it to the div
        innerHTML += '</table>';
        console.log("innerHTML: \n\n" + innerHTML);
        this.$container.html(innerHTML);
    };

    this.assembleHtml = function () {
        // Now we have all the html we need, just assemble it
        for (var group in this.groupsHeaderRowHTML) {
            // Add the group row
            this.innerHTML += this.groupsHeaderRowHTML[group];
            // Add the group cells
            innerHTML += this.propertyRowsHTML[group];
        }

        // Finally we add the 'Other' group (if we have something there)
        if (this.propertyRowsHTML[OTHER_GROUP_NAME]) {
            this.innerHTML += this.getGroupHeaderRowHtml(this.MISC_GROUP_NAME);
            this.innerHTML += this.propertyRowsHTML[this.MISC_GROUP_NAME];
        }

        // Close the table and apply it to the div
        innerHTML += '</table>';
        this.html(innerHTML);

    }

    this.getPropertyRowHtml = function (name, value, meta, options) {
        {
            //if (!name) {
            //    return '';
            //}

            //meta = meta || {};
            //// We use the name in the meta if available
            //var displayName = meta.name || name;

            //// check if type is registered in customTypes
            //var customTypes = options.customTypes;
            //var isCustomType = false;
            //for (var customType in customTypes) {
            //    if (type === customType) {
            //        isCustomType = customTypes[customType];
            //    }
            //}

            //// If value was handled by custom type
            //if (isCustomType !== false) {
            //    valueHTML = isCustomType.html(elemId, name, value, meta);
            //    if (getValueFuncs) {
            //        if (isCustomType.hasOwnProperty('makeValueFn')) {
            //            getValueFuncs[name] = isCustomType.makeValueFn(elemId, name, value, meta);
            //        } else if (isCustomType.hasOwnProperty('valueFn')) {
            //            getValueFuncs[name] = isCustomType.valueFn;
            //        } else {
            //            getValueFuncs[name] = function () {
            //                return $('#' + elemId).val();
            //            };
            //        }
            //    }
            //}
            //else
        }
        var valueHTML;
        var type = meta.editor || '';
        var elemId = this.pgId + name;

        // If boolean create checkbox
        if (type === 0 || typeof value === 'boolean') {
            alert("254534655645");
            valueHTML = '<input type="checkbox" id="' + elemId + '" value="' + value + '"' + (value ? ' checked' : '') + ' />';
            if (this.getValueFuncs) {
                this.getValueFuncs[name] = function () {
                    return $('#' + elemId).prop('checked');
                };
            }

            // If options create drop-down list
        } else if (type === 1 && Array.isArray(meta.options)) {
            valueHTML = this.getSelectOptionHtml(elemId, value, meta.options);
            if (this.getValueFuncs) {
                this.getValueFuncs[name] = function () {
                    return $('#' + elemId).val();
                };
            }

            // If number and a jqueryUI spinner is loaded use it
        } else if (type === 2) {
            valueHTML = '<input type="number" id="' + elemId + '" value="' + value + '" style="width:100%" />';
            //if (postCreateInitFuncs) {
            //    postCreateInitFuncs.push(initSpinner(elemId, meta.options));
            //}

            if (this.getValueFuncs) {
                this.getValueFuncs[name] = function () {
                    return parseInt($('#' + elemId).val());
                };
            }

            // If color and we have the spectrum color picker use it
        } else if (type === 3) {
            valueHTML = '<input type="color" id="' + elemId + '" style="width:100%; height: 21px;" />';

            if (this.getValueFuncs) {
                this.getValueFuncs[name] = function () {
                    return $('#' + elemId).val();
                };
            }

            // If label (for read-only)
        } else if (type === 4) {
            valueHTML = '<label for="' + elemId + '">' + value + '</label>';

            // Default is textbox
        } else {
            valueHTML = '<input type="text" id="' + elemId + '" value="' + value + '"style="width:100%"></input>';
            if (this.getValueFuncs) {
                this.getValueFuncs[name] = function () {
                    return $('#' + elemId).val();
                };
            }
        }

        if (typeof meta.description === 'string' && meta.description &&
			(typeof meta.showHelp === 'undefined' || meta.showHelp)) {
            this.displayName += '<span class="pgTooltip" title="' + meta.description + '">' + options.helpHtml + '</span>';
        }

        if (meta.colspan2) {
            return '<tr class="pgRow"><td colspan="2" class="pgCell">' + valueHTML + '</td></tr>';
        } else {
            return '<tr class="pgRow"><td class="pgCell">' + name + '</td><td class="pgCell">' + valueHTML + '</td></tr>';
        }
    };

    this.getSelectOptionHtml = function (id, selectedValue, options) {
        selectedValue = selectedValue || '';
        if (options === null)
            return;

        var html = "<select class='selectpicker' data-live-search='true'>";

        for (var i = 0; i < options.length; i++)
            html += "<option data-tokens='ketchup mustard'>" + options[i] + "</option>";

        html += "</select><input type='hidden' value='" + selectedValue + "' id='" + id + "'>";

        return html;
    }

    this.initColorPicker = function (id, color, options) {
        if (!id)
            return null;

        var opts = {};
        $.extend(opts, options);
        if (typeof color === 'string')
            opts.color = color;

        return function onColorPickerInit() {
            $('#' + id).spectrum(opts);
        };
    }

    //this.CallpostinitFns = function () {
    //    alert("this.postCreateInitFuncs: " + this.postCreateInitFuncs);
    //    // Call the post init functions
    //    for (var i = 0; i < this.postCreateInitFuncs.length; ++i) {
    //        if (typeof this.postCreateInitFuncs[i] === 'function') {
    //            this.postCreateInitFuncs[i]();
    //            // just in case make sure we are not holding any reference to the functions
    //            this.postCreateInitFuncs[i] = null;
    //        }
    //    }
    //};

    this.getvaluesFromPG = function () {
        // Create a function that will return tha values back from the property grid
        var result = {};

        console.log("getValueFuncs: " + JSON.stringify(this.getValueFuncs))

        for (var prop in this.getValueFuncs) {
            if (typeof this.getValueFuncs[prop] !== 'function') {
                continue;
            }

            result[prop] = this.getValueFuncs[prop]();
        }

        //$.each(this.propNames, function (i, prop) {
        //    var type = metas[names.indexOf(prop)].editor;
        //    result[prop] = $('#pg0' + prop).val();
        //})
        this.PropsObj = result;
        console.log("result: " + JSON.stringify( result));
        return result;
    };

    this.init();
};



var obj = new TextBoxObj("text0");
var id = "propGrid";
var q = new Eb_PropertyGrid(id, obj);






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
(function ($) {// jscs:ignore requireNamedUnassignedFunctions
    var OTHER_GROUP_NAME = 'Other';
    var GET_VALS_FUNC_KEY = 'pg.getValues';
    var pgIdSequence = 0;

    /**
	 * Generates the property grid
	 * @param {object} obj - The object whose properties we want to display
	 * @param {JQPropertyGridOptions} options - Options object for the component
	 */
    $.fn.jqPropertyGrid = function (obj, options) {
        // Check if the user called the 'get' function (to get the values back from the grid).
        if (typeof obj === 'string' && obj === 'get') {
            if (typeof this.data(GET_VALS_FUNC_KEY) === 'function') {
                obj = this.data(GET_VALS_FUNC_KEY)();
                return obj;
            }

            return null;
        } else if (typeof obj === 'string') {
            console.error('jqPropertyGrid got invalid option:', obj);
            return;
        } else if (typeof obj !== 'object' || obj === null) {
            console.error('jqPropertyGrid must get an object in order to initialize the grid.');
            return;
        }

        // Normalize options
        options = options && typeof options === 'object' ? options : {};
        options.meta = options.meta && typeof options.meta === 'object' ? options.meta : {};
        options.customTypes = options.customTypes || {};
        options.helpHtml = options.helpHtml || '[?]';

        // Seems like we are ok to create the grid
        var extObject = obj;
        var meta = options.meta;
        var propertyRowsHTML = { OTHER_GROUP_NAME: '' };
        var groupsHeaderRowHTML = {};
        var postCreateInitFuncs = [];
        var getValueFuncs = {};
        var pgId = 'pg' + (pgIdSequence++);

        var currGroup;
        for (var prop in obj) {
            // Skip if this is not a direct property, a function, or its meta says it's non browsable
            if (!obj.hasOwnProperty(prop) || typeof obj[prop] === 'function' || (meta[prop] && meta[prop].browsable === false)) {
                continue;
            }

            // Check what is the group of the current property or use the default 'Other' group
            currGroup = (meta[prop] && meta[prop].group) || OTHER_GROUP_NAME;

            // If this is the first time we run into this group create the group row
            if (currGroup !== OTHER_GROUP_NAME && !groupsHeaderRowHTML[currGroup]) {
                groupsHeaderRowHTML[currGroup] = getGroupHeaderRowHtml(currGroup);
            }

            // Initialize the group cells html
            propertyRowsHTML[currGroup] = propertyRowsHTML[currGroup] || '';

            // Append the current cell html into the group html
            propertyRowsHTML[currGroup] += getPropertyRowHtml(pgId, prop, obj[prop], meta[prop], postCreateInitFuncs, getValueFuncs, options);


        }

        // Now we have all the html we need, just assemble it
        var innerHTML = '<table class="pgTable">';
        for (var group in groupsHeaderRowHTML) {
            // Add the group row
            innerHTML += groupsHeaderRowHTML[group];
            // Add the group cells
            innerHTML += propertyRowsHTML[group];
        }

        // Finally we add the 'Other' group (if we have something there)
        if (propertyRowsHTML[OTHER_GROUP_NAME]) {
            innerHTML += getGroupHeaderRowHtml(OTHER_GROUP_NAME);
            innerHTML += propertyRowsHTML[OTHER_GROUP_NAME];
        }

        // Close the table and apply it to the div
        innerHTML += '</table>';
        this.html(innerHTML);

        // Call the post init functions
        for (var i = 0; i < postCreateInitFuncs.length; ++i) {
            if (typeof postCreateInitFuncs[i] === 'function') {
                postCreateInitFuncs[i]();
                // just in case make sure we are not holding any reference to the functions
                postCreateInitFuncs[i] = null;
            }
        }

        // Create a function that will return tha values back from the property grid
        var getValues = function () {
            var result = {};
            for (var prop in getValueFuncs) {
                if (typeof getValueFuncs[prop] !== 'function') {
                    continue;
                }

                result[prop] = getValueFuncs[prop]();
                extObject[prop] = result[prop];
            }

            return result;
        };
        this.data(GET_VALS_FUNC_KEY, getValues);
    };

    /**
	 * Gets the html of a group header row
	 * @param {string} displayName - The group display name
	 */
    function getGroupHeaderRowHtml(displayName) {
        return '<tr class="pgGroupRow"><td colspan="2" class="pgGroupCell">' + displayName + '</td></tr>';
    }

    /**
	 * Gets the html of a specific property row
	 * @param {string} pgId - The property-grid id being rendered
	 * @param {string} name - The property name
	 * @param {*} value - The current property value
	 * @param {object} meta - A metadata object describing this property
	 * @param {function[]} [postCreateInitFuncs] - An array to fill with functions to run after the grid was created
	 * @param {object.<string, function>} [getValueFuncs] - A dictionary where the key is the property name and the value is a function to retrieve the propery selected value
	 * @param {object} options - top level options object for propertyGrid containing all options
	 */
    function getPropertyRowHtml(pgId, name, value, meta, postCreateInitFuncs, getValueFuncs, options) {
        if (!name) {
            return '';
        }

        meta = meta || {};
        // We use the name in the meta if available
        var displayName = meta.name || name;
        var type = meta.type || '';
        var elemId = pgId + name;

        var valueHTML;

        // check if type is registered in customTypes
        var customTypes = options.customTypes;
        var isCustomType = false;
        for (var customType in customTypes) {
            if (type === customType) {
                isCustomType = customTypes[customType];
            }
        }

        // If value was handled by custom type
        if (isCustomType !== false) {
            valueHTML = isCustomType.html(elemId, name, value, meta);
            if (getValueFuncs) {
                if (isCustomType.hasOwnProperty('makeValueFn')) {
                    getValueFuncs[name] = isCustomType.makeValueFn(elemId, name, value, meta);
                } else if (isCustomType.hasOwnProperty('valueFn')) {
                    getValueFuncs[name] = isCustomType.valueFn;
                } else {
                    getValueFuncs[name] = function () {
                        return $('#' + elemId).val();
                    };
                }
            }
        }

            // If boolean create checkbox
        else if (type === 'boolean' || (type === '' && typeof value === 'boolean')) {
            valueHTML = '<input type="checkbox" id="' + elemId + '" value="' + name + '"' + (value ? ' checked' : '') + ' />';
            if (getValueFuncs) {
                getValueFuncs[name] = function () {
                    return $('#' + elemId).prop('checked');
                };
            }

            // If options create drop-down list
        } else if (type === 'options' && Array.isArray(meta.options)) {
            valueHTML = getSelectOptionHtml(elemId, value, meta.options);
            if (getValueFuncs) {
                getValueFuncs[name] = function () {
                    return $('#' + elemId).val();
                };
            }

            // If number and a jqueryUI spinner is loaded use it
        } else if (typeof $.fn.spinner === 'function' && (type === 'number' || (type === '' && typeof value === 'number'))) {
            valueHTML = '<input type="number" id="' + elemId + '" value="' + value + '" style="width:100%" />';
            //if (postCreateInitFuncs) {
            //    postCreateInitFuncs.push(initSpinner(elemId, meta.options));
            //}

            if (getValueFuncs) {
                getValueFuncs[name] = function () {
                    return parseInt($('#' + elemId).val());
                };
            }

            // If color and we have the spectrum color picker use it
        } else if (type === 'color' && typeof $.fn.spectrum === 'function') {
            valueHTML = '<input type="text" id="' + elemId + '" style="width:100%" />';
            if (postCreateInitFuncs) {
                postCreateInitFuncs.push(initColorPicker(elemId, value, meta.options));
            }

            if (getValueFuncs) {
                getValueFuncs[name] = function () {
                    return $('#' + elemId).spectrum('get').toHexString();
                };
            }

            // If label (for read-only)
        } else if (type === 'label') {
            if (typeof meta.description === 'string' && meta.description) {
                valueHTML = '<label for="' + elemId + '" title="' + meta.description + '">' + value + '</label>';
            } else {
                valueHTML = '<label for="' + elemId + '">' + value + '</label>';
            }

            // Default is textbox
        } else {
            valueHTML = '<input type="text" id="' + elemId + '" value="' + value + '"</input>';
            if (getValueFuncs) {
                getValueFuncs[name] = function () {
                    return $('#' + elemId).val();
                };
            }
        }

        if (typeof meta.description === 'string' && meta.description &&
			(typeof meta.showHelp === 'undefined' || meta.showHelp)) {
            displayName += '<span class="pgTooltip" title="' + meta.description + '">' + options.helpHtml + '</span>';
        }

        if (meta.colspan2) {
            return '<tr class="pgRow"><td colspan="2" class="pgCell">' + valueHTML + '</td></tr>';
        } else {
            return '<tr class="pgRow"><td class="pgCell">' + displayName + '</td><td class="pgCell">' + valueHTML + '</td></tr>';
        }
    }

    /**
	 * Gets a select-option (dropdown) html
	 * @param {string} id - The select element id
	 * @param {string} [selectedValue] - The current selected value
	 * @param {*[]} options - An array of option. An element can be an object with value/text pairs, or just a string which is both the value and text
	 * @returns {string} The select element html
	 */
    function getSelectOptionHtml(id, selectedValue, options) {
        id = id || '';
        selectedValue = selectedValue || '';
        options = options || [];

        var html = '<select';
        if (id) {
            html += ' id="' + id + '"';
        }

        html += '>';

        var text;
        var value;
        for (var i = 0; i < options.length; i++) {
            value = typeof options[i] === 'object' ? options[i].value : options[i];
            text = typeof options[i] === 'object' ? options[i].text : options[i];

            html += '<option value="' + value + '"' + (selectedValue === value ? ' selected>' : '>');
            html += text + '</option>';
        }

        html += '</select>';
        return html;
    }

    /**
	 * Gets an init function to a number textbox
	 * @param {string} id - The number textbox id
	 * @param {object} [options] - The spinner options
	 * @returns {function}
	 */
    function initSpinner(id, options) {
        if (!id) {
            return null;
        }
        // Copy the options so we won't change the user "copy"
        var opts = {};
        $.extend(opts, options);

        // Add a handler to the change event to verify the min/max (only if not provided by the user)
        opts.change = typeof opts.change === 'undefined' ? onSpinnerChange : opts.change;

        return function onSpinnerInit() {
            $('#' + id).spinner(opts);
        };
    }

    /**
	 * Gets an init function to a color textbox
	 * @param {string} id - The color textbox id
	 * @param {string} [color] - The current color (e.g #000000)
	 * @param {object} [options] - The color picker options
	 * @returns {function}
	 */
    function initColorPicker(id, color, options) {
        if (!id) {
            return null;
        }

        var opts = {};
        $.extend(opts, options);
        if (typeof color === 'string') {
            opts.color = color;
        }

        return function onColorPickerInit() {
            $('#' + id).spectrum(opts);
        };
    }


})(window.$);