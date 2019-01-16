const FormRenderCommon = function (options) {
    this.FO = options.FO;
    this.$submitButton = options.submitButtonHtml
    this.AllRequired_valid_Check = function () {
        let required_valid_flag = true;
        let $notOk1stCtrl = null;
        $.each(this.FO.flatControls, function (i, control) {
            let $ctrl = $("#" + control.EbSid_CtxId);
            if (!this.isRequiredOK(control) || !this.isValidationsOK(control)) {
                required_valid_flag = false;
                if (!$notOk1stCtrl)
                    $notOk1stCtrl = $ctrl;
            }
        }.bind(this));

        if ($notOk1stCtrl)
            $notOk1stCtrl.select();

        // isDGsValid
        let isDGsValid = true;
        if (this.FO.DGs) {
            $.each(this.FO.DGs, function (i, DG) {
                if (DG.isValid() === false)
                    isDGsValid = false;
            });
        }
        return required_valid_flag && isDGsValid;
    };

    // check all validations in a control
    this.isValidationsOK = function (ctrl) {
        let formValidationflag = true;
        ctrl.Validators.$values = sortByProp(ctrl.Validators.$values, "IsWarningOnly");// sort Validators like warnings comes last
        $.each(ctrl.Validators.$values, function (i, Validator) {
            this.removeInvalidStyle(ctrl);// reset EbMakeValid
            if (Validator.IsDisabled)
                return true;// continue; from loop if current validation IsDisabled
            let func = new Function("form", atob(Validator.JScode));
            this.updateFormValues();
            if (!func(this.FO.formValues)) {
                //EbMakeInvalid(`#cont_${ctrl.EbSid_CtxId}`, `#${ctrl.EbSid_CtxId}Wraper`, Validator.FailureMSG, Validator.IsWarningOnly ? "warning" : "danger");
                this.addInvalidStyle(ctrl, Validator.FailureMSG, (Validator.IsWarningOnly ? "warning" : "danger"));
                if (!Validator.IsWarningOnly) {
                    formValidationflag = false;
                    return false;// break; from loop if one validation failed
                }
            }
        }.bind(this));
        return formValidationflag;
    };

    this.updateFormValues = function () {
        $.each(this.FO.flatControls, function (i, ctrl) {
            this.FO.formValues[ctrl.Name] = ctrl.getValue();
        }.bind(this));
    };

    this.removeInvalidStyle = function (ctrl) {
        EbMakeValid(`#cont_${ctrl.EbSid_CtxId}`, `.ctrl-cover`);
    };

    // checks a control value is emptyString
    this.isRequiredOK = function (ctrl) {
        let $ctrl = $("#" + ctrl.EbSid_CtxId);
        if ($ctrl.length !== 0 && ctrl.Required && !ctrl.isRequiredOK()) {
            this.addInvalidStyle(ctrl);
        }
        else
            this.removeInvalidStyle(ctrl);
    };

    this.addInvalidStyle = function (ctrl, msg, type) {
        EbMakeInvalid(`#cont_${ctrl.EbSid_CtxId}`, `.ctrl-cover`, msg, type);
    };
};