const WebFormRender = function (option) {
    this.FormObj = option.formObj;
    this.$saveBtn = option.$saveBtn;
    this.flatControls = option.flatControls;
    this.initControls = new InitControls(this);

    this.updateCtrlUI = function (cObj) {
        $.each(cObj, function (prop, val) {
            //prop = prop.charAt(0).toUpperCase() + prop.slice(1);
            let meta = getObjByval(AllMetas["Eb" + cObj.ObjType], "name", prop);
            if (meta) {
                let NSS = meta.UIChangefn;
                if (NSS) {
                    let NS1 = NSS.split(".")[0];
                    let NS2 = NSS.split(".")[1];
                    EbOnChangeUIfns[NS1][NS2]("cont_" + cObj.Name, cObj);
                }
            }
        });
    };

    this.makeReqFm = function (control) {
        var $ctrl = $("#" + control.Name);
        if ($ctrl.length !== 0 && control.Required && $ctrl.val().trim() === "")
            EbMakeInvalid(`#cont_${control.Name}`, `.${control.Name}Wraper`);
    };

    this.removeReqFm = function (control) {
        EbMakeValid(`#cont_${control.Name}`, `.${control.Name}Wraper`);
    };

    this.initFormCtrl = function (control) {
            if (this.initControls[control.ObjType] !== undefined)
                this.initControls[control.ObjType](control);
            $("#" + control.Name).on("blur", this.makeReqFm.bind(this, control)).on("focus", this.removeReqFm.bind(this, control));
    }.bind(this);

    this.init = function () {
        this.$saveBtn.on("click", this.saveForm.bind(this));
        //this.flatControls = this.getFlatControls();

        $.each(this.flatControls, function (k, cObj) {
            this.updateCtrlUI(cObj);
            this.initFormCtrl(cObj);
            //if (cObj.ObjType === 'Date') {
            //    var $input = $("[name=" + cObj.name + "]");
            //    if (cObj.showDateAs_ === 1) {
            //        $input.MonthPicker({ Button: $input.next().removeAttr("onclick") });
            //        $input.MonthPicker('option', 'ShowOn', 'both');
            //        $input.MonthPicker('option', 'UseInputMask', true);
            //    }
            //    else {
            //        //$input.mask("0000-00-00");
            //        $input.datetimepicker({ timepicker: false, format: "Y-m-d" });
            //        $input.next().children('i').off('click').on('click', function () { $input.datetimepicker('show'); });
            //    }
            //}
            ////else if (cObj.ObjType === 'Numeric') {
            ////    var $input = $("[name=" + cObj.name + "]");
            ////}
            //else if (cObj.ObjType === 'ComboBox') {
            //    var $input = $("[name=" + cObj.name + "]");

            //    Vue.component('v-select', VueSelect.VueSelect);
            //    Vue.config.devtools = true;

            //    $(`#${cObj.name}_loading-image`).hide();
            //    //MakeCaps(cObj);
            //    var EbCombo = new EbSelect(cObj);
            //}
        }.bind(this));
    };


    this.getFormValuesWithTypeColl = function () {
        var FVWTcoll = [];
        let _val = null;
        $.each(this.flatControls, function (idx, obj) {
            var _name = obj.name;
            var _type = obj.ebDbType;
            var _val = (_type === 7) ? parseInt($("#" + obj.name).val()) : $("#" + obj.name).val();
            var _autoic = obj.autoIncrement;
            FVWTcoll.push({ Name: _name, Value: _val, Type: _type, AutoIncrement: _autoic });
        }.bind(this));
        return FVWTcoll;
    };

    this.ajaxsuccess = function (rowAffected) {
        // hide loader
        if (rowAffected > 0) {
            EbMessage("show", { Message: "DataCollection success", AutoHide: true, Background: '#1ebf1e' });
            var msg = `Your ${this.FormObj.name} form submitted successfully`;
        }
        else {
            EbMessage("show", { Message: "Something went wrong", AutoHide: true, Background: '#bf1e1e' });
            var msg = `Your ${this.FormObj.name} form submission failed`;
        }
        //EbMessage("show", { Message: 'DataCollection Success', AutoHide: false, Backgorund: '#bf1e1e' });
    };

    this.saveForm = function () {
        alert();
        // show loader
        $.ajax({
            type: "POST",
            //url: this.ssurl + "/bots",
            url: "../WebForm/InsertBotDetails",
            data: {
                TableName: this.FormObj.tableName, Fields: this.getFormValuesWithTypeColl()
            },
            //beforeSend: function (xhr) {
            //    xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
            //}.bind(this),
            success: this.ajaxsuccess.bind(this),
        });

    };

    this.init();
}