var Eb_FilterDialogRender = function (fObj, wc, curloc, userObj, submitId, onSubmitFn) {
    console.log("kitty--------------------------------------------");
    this.FormObj = fObj;
    this.submitId = submitId;
    this.formObject = {};
    this.onChangeExeFuncs = {};
    this.initControls = new InitControls();
    this.$submitBtn = $("#" + this.submitId);
    JsonToEbControls(this.FormObj);// here re-assign objectcoll with functions
    this.flatControls = getFlatCtrlObjs(this.FormObj);// objectcoll with functions
    this.onSubmitFn = onSubmitFn;
    this.FRC = new FormRenderCommon({
        FO: this
    });

    this.submit = function () {
        console.log("111111111111111111111111111111");
        if (!this.FRC.AllRequired_valid_Check())
            return;
        if (this.onSubmitFn)
            this.onSubmitFn();
    }.bind(this);

    this.init = function () {
        this.initFilterDialogCtrls();
        this.initFormObject2();
        this.bindFuncsToDom();
    }

    this.initFilterDialogCtrls = function () {
        $('.selectpicker').selectpicker();
        JsonToEbControls(this.FormObj);// here re-assign objectcoll with functions
        $.each(this.FormObj.Controls.$values, function (k, cObj) {
            let opt = {};
            if (cObj.ObjType === "PowerSelect")
                opt.getAllCtrlValuesFn = this.getFormVals;
            else if (cObj.ObjType === "Date") {
                opt.formObject = this.formObject;
                opt.userObject = userObj;
            }

            this.initControls.init(cObj, opt);
        }.bind(this));
    };

    this.getFormVals = function () {
        return getValsFromForm(this.FormObj);
    }.bind(this);

    this.initFormObject2 = function () {
        $.each(this.FormObj.Controls.$values, function (k, cObj) {
            this.formObject[cObj.Name] = cObj;

            Object.defineProperty(this.formObject, cObj.Name, {
                get: function () {
                    return cObj;
                }.bind(this),
            });
        }.bind(this));
    };

    this.initFormObject = function () {
        $.each(this.FormObj.Controls.$values, function (k, cObj) {
            this.formObject[cObj.Name] = cObj;

            Object.defineProperty(this.formObject, cObj.Name, {
                get: function () {
                    return this.getValue(this.FormObj.Controls.$values[k]);
                }.bind(this),
                set: function (val) {
                    this.setValue(this.FormObj.Controls.$values[k], val);
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
        this.$submitBtn.on("click", this.submit);
        $.each(this.FormObj.Controls.$values, function (k, cObj) {
            //creating onChangeExeFuncs and binding to dom elements
            if (cObj.OnChange && cObj.OnChange !== '') {
                this.onChangeExeFuncs[cObj.Name] = new Function("form","User", atob(cObj.OnChange));
                if (cObj.ObjType === 'TextBox' || cObj.ObjType === 'Date') {
                    this.onChangeExeFlag = true;
                    $("body #" + cObj.EbSid_CtxId).on("change", this.ctrlValueChanged.bind(this, cObj.Name));
                }
                else if (cObj.ObjType === 'RadioGroup') {
                    this.onChangeExeFlag = true;
                    $("body").on("change", "input[name='" + cObj.EbSid_CtxId + "']", this.ctrlValueChanged.bind(this, cObj.Name));
                }
                else if (cObj.ObjType === 'UserLocation') {
                    this.onChangeExeFlag = true;
                    $("body").on("change", "#" + cObj.EbSid_CtxId, this.ctrlValueChanged.bind(this, cObj.Name));
                    $("body").on("click", "#" + cObj.EbSid_CtxId + "_checkbox", this.UserLocationCheckboxChanged.bind(this, cObj));
                }
            }
            else {
                if (cObj.ObjType === 'UserLocation') {
                    $("body").on("click", "#" + cObj.EbSid_CtxId + "_checkbox", this.UserLocationCheckboxChanged.bind(this, cObj));
                }
            }
        }.bind(this));

        //if (this.onChangeExeFlag)
        this.initialLoad();

    }

    this.ctrlValueChanged = function (name) {
        this.onChangeExeFuncs[name](this.formObject, userObj);
    }

    this.initialLoad = function () {
        $.each(this.FormObj.Controls.$values, function (k, cObj) {
            if (cObj.ObjType === 'RadioGroup' && cObj.OnChange && cObj.OnChange !== '') {
                if (cObj.DefaultValue !== "")
                    $("body input[name='" + cObj.EbSid_CtxId + "'][value='" + cObj.DefaultValue + "']").prop("checked", true).trigger("change");
                else
                    $("body input[name='" + cObj.EbSid_CtxId + "']:eq(0)").prop("checked", true).trigger("change");
            }
            else if (cObj.ObjType === 'UserLocation') {
                if (userObj.Roles.$values.findIndex(x => (x === "SolutionOwner" || x === "SolutionDeveloper" || x === "SolutionAdmin")) > -1) {
                    $('#' + cObj.EbSid_CtxId + "_checkbox").trigger('click');
                }
                else {
                    $('#' + cObj.EbSid_CtxId + "_checkbox_div").hide();
                    if (wc === "dc")
                        $('#' + cObj.EbSid_CtxId).next('div').children().find('li:eq(1)').children().find("input").trigger('click');
                    else if (wc === "uc") {
                        if (cObj.LoadCurrentLocation)
                            $('#' + this.EbSid_CtxId).next('div').children().find('[value=' + curloc + ']').trigger('click');
                        else
                            $('#' + cObj.EbSid_CtxId).next('div').children().find('li:eq(1)').children().find("input").trigger('click');
                    }
                }
            }
        });
        //if (this.FormObj.Width > 150)
        //    this.$filterBox.parent().css("width", this.FormObj.Width + "px");
    };

    this.UserLocationCheckboxChanged = function (cObj) {
        if ($(event.target).prop("checked")) {
            $('#' + cObj.EbSid_CtxId).next('div').children().find('li:eq(0)').children().find("input").trigger('click');
            $('#' + cObj.EbSid_CtxId).next('div').find("*").attr("disabled", "disabled").off('click');
        }
        else {
            $('#' + cObj.EbSid_CtxId).next('div').find("*").removeAttr('disabled').on('click');
            if ($('#' + cObj.EbSid_CtxId).next('div').children().find('li:eq(0)').children().find("input").prop("checked"))
                $('#' + cObj.EbSid_CtxId).next('div').children().find('li:eq(0)').children().find("input").trigger('click');

        }
    };

    this.init();
}


