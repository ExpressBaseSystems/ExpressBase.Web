var Eb_FilterDialogRender = function (fObj, $filterBox) {
    this.filterObj = fObj;
    this.$filterBox = $filterBox;
    this.formObject = {};
    this.onChangeExeFuncs = {};

    this.init = function () {
        this.initFilterDialogCtrls();
        this.initFormObject2();
        this.bindFuncsToDom();
    }

    this.initFilterDialogCtrls = function() {        
        $.each(this.filterObj.controls.$values, function (k, cObj) {
            if (cObj.objType === 'Date') {
                var $input = $("[name=" + cObj.name + "]");
                if (cObj.showDateAs_ === 1) {
                    $input.MonthPicker({ Button: $input.next().removeAttr("onclick") });
                    $input.MonthPicker('option', 'ShowOn', 'both');
                    $input.MonthPicker('option', 'UseInputMask', true);
                }
                else {
                    //$input.mask("0000-00-00");
                    $input.datetimepicker({ timepicker: false, format: "Y-m-d" });
                    $input.next().children('i').off('click').on('click', function () { $input.datetimepicker('show'); });
                }
            }
            //else if (cObj.objType === 'Numeric') {
            //    var $input = $("[name=" + cObj.name + "]");
            //}
            else if (cObj.objType === 'ComboBox') {
                var $input = $("[name=" + cObj.name + "]");

                Vue.component('v-select', VueSelect.VueSelect);
                Vue.config.devtools = true;

                $(`#${cObj.name}_loading-image`).hide();
                //MakeCaps(cObj);
                var EbCombo = new EbSelect(cObj);
            }            
        }.bind(this));
    };

    this.initFormObject2 = function () {
        $.each(this.filterObj.controls.$values, function (k, cObj) {
            this.formObject[cObj.name] = cObj;

            Object.defineProperty(this.formObject, cObj.name, {
                get: function () {
                    return $('#' + cObj.name);
                }.bind(this),
            });
        }.bind(this));
    };

    this.initFormObject = function () {
        $.each(this.filterObj.controls.$values, function (k, cObj) {
            this.formObject[cObj.name] = cObj;

            Object.defineProperty(this.formObject, cObj.name, {
                get: function () {
                    return this.getValue(this.filterObj.controls.$values[k]);
                }.bind(this),
                set: function (val) {
                    this.setValue(this.filterObj.controls.$values[k], val);
                }.bind(this)
            });
        }.bind(this));
    }

    this.getValue = function (ctrlObj) {
        if (ctrlObj.objType === 'TextBox' || ctrlObj.objType === 'Date') {
            return ($('#' + ctrlObj.name).val());
        }
        else if (ctrlObj.objType === 'RadioGroup') {
            return ($("input[name='" + ctrlObj.name + "']:checked").val());
        }
    }

    this.setValue = function (ctrlObj, val) {
        if (ctrlObj.objType === 'TextBox' || ctrlObj.objType === 'Date') {
            $('#' + ctrlObj.name).val(val);
        }
        else if (ctrlObj.objType === 'RadioGroup') {
            $("input[name='" + ctrlObj.name + "'][value='" + val + "']").prop('checked', true);
        }
    }

    this.bindFuncsToDom = function () {
        this.onChangeExeFlag = false;
        $.each(this.filterObj.controls.$values, function (k, cObj) {
            //creating onChangeExeFuncs and binding to dom elements
            if (cObj.onChange && cObj.onChange !== '') {
                this.onChangeExeFuncs[cObj.name] = new Function("form", atob(cObj.onChange));
                if (cObj.objType === 'TextBox') {
                    $("body").on("change", ('#' + cObj.name), this.ctrlValueChanged.bind(this, cObj.name));
                }
                else if (cObj.objType === 'RadioGroup') {
                    this.onChangeExeFlag = true;
                    $("body").on("change", "input[name='" + cObj.name + "']", this.ctrlValueChanged.bind(this, cObj.name));
                }
            }
        }.bind(this));

        //if (this.onChangeExeFlag)
            this.initialLoad();

    }

    this.ctrlValueChanged = function (name) {
        this.onChangeExeFuncs[name](this.formObject);
    }

    this.initialLoad = function () {
        $.each(this.filterObj.controls.$values, function (k, cObj) {
            if (cObj.objType === 'RadioGroup' && cObj.onChange && cObj.onChange !== '') {
                if(cObj.defaultValue !== "")
                    $("body input[name='" + cObj.name + "'][value='" + cObj.defaultValue+"']").prop("checked", true).trigger("change");
                else
                    $("body input[name='" + cObj.name + "']:eq(0)").prop("checked", true).trigger("change");
                return false;
            }
        });
        if (this.filterObj.width > 150)
            this.$filterBox.parent().css("width", this.filterObj.width + "px");
    }

    this.init();
}


