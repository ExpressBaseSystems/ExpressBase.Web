var Eb_FilterDialogRender = function (fObj) {
    console.log("kitty--------------------------------------------");
    this.filterObj = fObj;
    this.formObject = {};
    this.onChangeExeFuncs = {};

    this.init = function () {
        this.initFilterDialogCtrls();
        this.initFormObject2();
        this.bindFuncsToDom();
    }

    this.initFilterDialogCtrls = function () {
        console.log("===========================");
        uobj = {};

        $.each(this.filterObj.Controls.$values, function (k, cObj) {
            if (cObj.ObjType === 'Date') {
                var $input = $("[name=" + cObj.Name + "]");
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
            //else if (cObj.ObjType === 'Numeric') {
            //    var $input = $("[name=" + cObj.Name + "]");
            //}
            else if (cObj.ObjType === 'ComboBox') {
                var $input = $("[name=" + cObj.Name + "]");

                Vue.component('v-select', VueSelect.VueSelect);
                Vue.config.devtools = true;

                $(`#${cObj.Name}_loading-image`).hide();
                //MakeCaps(cObj);
                var EbCombo = new EbSelect(cObj, {
                    getFilterValuesFn: this.getFilterVals
                });
            }
        }.bind(this));

        JsonToEbControls(this.filterObj);
        $.each(this.filterObj.Controls.$values, function (k, cObj) {//////////////////////
        }.bind(this));
    };

    this.getFilterVals = function () {
        return getValsFromForm(this.filterObj);
    }.bind(this);

    this.initFormObject2 = function () {
        $.each(this.filterObj.Controls.$values, function (k, cObj) {
            this.formObject[cObj.Name] = cObj;

            Object.defineProperty(this.formObject, cObj.Name, {
                get: function () {
                    return $('#' + cObj.Name);
                }.bind(this),
            });
        }.bind(this));
    };

    this.initFormObject = function () {
        $.each(this.filterObj.Controls.$values, function (k, cObj) {
            this.formObject[cObj.Name] = cObj;

            Object.defineProperty(this.formObject, cObj.Name, {
                get: function () {
                    return this.getValue(this.filterObj.Controls.$values[k]);
                }.bind(this),
                set: function (val) {
                    this.setValue(this.filterObj.Controls.$values[k], val);
                }.bind(this)
            });
        }.bind(this));
    }

    this.getValue = function (ctrlObj) {
        if (ctrlObj.ObjType === 'TextBox' || ctrlObj.ObjType === 'Date') {
            return ($('#' + ctrlObj.Name).val());
        }
        else if (ctrlObj.ObjType === 'RadioGroup') {
            return ($("input[name='" + ctrlObj.Name + "']:checked").val());
        }
    }

    this.setValue = function (ctrlObj, val) {
        if (ctrlObj.ObjType === 'TextBox' || ctrlObj.ObjType === 'Date') {
            $('#' + ctrlObj.Name).val(val);
        }
        else if (ctrlObj.ObjType === 'RadioGroup') {
            $("input[name='" + ctrlObj.Name + "'][value='" + val + "']").prop('checked', true);
        }
    }

    this.bindFuncsToDom = function () {
        this.onChangeExeFlag = false;
        $.each(this.filterObj.Controls.$values, function (k, cObj) {
            //creating onChangeExeFuncs and binding to dom elements
            if (cObj.OnChange && cObj.OnChange !== '') {
                this.onChangeExeFuncs[cObj.Name] = new Function("form", atob(cObj.OnChange));
                if (cObj.ObjType === 'TextBox') {
                    $("body").on("change", ('#' + cObj.Name), this.ctrlValueChanged.bind(this, cObj.Name));
                }
                else if (cObj.ObjType === 'RadioGroup') {
                    this.onChangeExeFlag = true;
                    $("body").on("change", "input[name='" + cObj.Name + "']", this.ctrlValueChanged.bind(this, cObj.Name));
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
        $.each(this.filterObj.Controls.$values, function (k, cObj) {
            if (cObj.ObjType === 'RadioGroup' && cObj.onChange && cObj.onChange !== '') {
                if (cObj.DefaultValue !== "")
                    $("body input[name='" + cObj.Name + "'][value='" + cObj.DefaultValue + "']").prop("checked", true).trigger("change");
                else
                    $("body input[name='" + cObj.Name + "']:eq(0)").prop("checked", true).trigger("change");
                return false;
            }
        });
        //if (this.filterObj.Width > 150)
        //    this.$filterBox.parent().css("width", this.filterObj.Width + "px");
    }

    this.init();
}


