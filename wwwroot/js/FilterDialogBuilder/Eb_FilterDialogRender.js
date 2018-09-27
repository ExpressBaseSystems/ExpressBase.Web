var Eb_FilterDialogRender = function (fObj) {
    console.log("kitty--------------------------------------------");
    this.filterObj = fObj;
    this.formObject = {};
    this.onChangeExeFuncs = {};
    this.initControls = new InitControls();

    this.init = function () {
        this.initFilterDialogCtrls();
        this.initFormObject2();
        this.bindFuncsToDom();
    }

    this.initFilterDialogCtrls = function () {
        JsonToEbControls(this.filterObj);
        $.each(this.filterObj.Controls.$values, function (k, cObj) {
            let opt = {};
            if (cObj.ObjType === "ComboBox")
                opt.getAllCtrlValuesFn = this.getFilterVals;
            this.initControls.init(cObj, opt);
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
                    return cObj;
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
        return ctrlObj.getValue();
    }

    this.setValue = function (ctrlObj, val) {
        ctrlObj.setValue(val);
    }

    this.bindFuncsToDom = function () {
        this.onChangeExeFlag = false;
        $.each(this.filterObj.Controls.$values, function (k, cObj) {
            //creating onChangeExeFuncs and binding to dom elements
            if (cObj.OnChange && cObj.OnChange !== '') {
                this.onChangeExeFuncs[cObj.Name] = new Function("form", atob(cObj.OnChange));
                if (cObj.ObjType === 'TextBox') {
                    $("body").on("change", ('#' + cObj.EbSid_CtxId), this.ctrlValueChanged.bind(this, cObj.Name));
                }
                else if (cObj.ObjType === 'RadioGroup') {
                    this.onChangeExeFlag = true;
                    $("body").on("change", "input[name='" + cObj.EbSid_CtxId + "']", this.ctrlValueChanged.bind(this, cObj.Name));
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
            if (cObj.ObjType === 'RadioGroup' && cObj.OnChange && cObj.OnChange !== '') {
                if (cObj.DefaultValue !== "")
                    $("body input[name='" + cObj.EbSid_CtxId + "'][value='" + cObj.DefaultValue + "']").prop("checked", true).trigger("change");
                else
                    $("body input[name='" + cObj.EbSid_CtxId + "']:eq(0)").prop("checked", true).trigger("change");
                return false;
            }
        });
        //if (this.filterObj.Width > 150)
        //    this.$filterBox.parent().css("width", this.filterObj.Width + "px");
    }

    this.init();
}


