const WebFormRender = function (option) {
    this.FormObj = option.formObj;
    this.$saveBtn = option.$saveBtn;
    this.flatControls = option.flatControls;

    this.init = function () {
        this.$saveBtn.on("click", this.saveForm.bind(this));
        //this.flatControls = this.getFlatControls();

        $.each(this.flatControls, function (k, cObj) {
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

    this.getFlatControls = function () {
        let coll = [];
        this.ProcRecur(this.FormObj, coll);
        return coll;
    };

    this.ProcRecur = function (src_obj, dest_coll) {
        $.each(src_obj.controls.$values, function (i, obj) {
            if (obj.isContainer) {
                this.ProcRecur(obj, dest_coll);
            }
            else
                dest_coll.push(obj);
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
            FVWTcoll.push({ Name: _name, Value: _val, Type: _type, AutoIncrement: _autoic});
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