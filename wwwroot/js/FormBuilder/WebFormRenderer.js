const WebFormRender = function (option) {
    this.FormObj = option.formObj;
    this.$saveBtn = option.$saveBtn;
    this.flatControls = option.flatControls;
    this.initControls = new InitControls(this);
    this.editModeObj = option.editModeObj;
    this.formRefId = option.formRefId || "";
    this.isEditMode = !!this.editModeObj;
    this.rowId = 0;

    this.updateCtrlUI = function (cObj) {
        $.each(cObj, function (prop, val) {
            //prop = prop.charAt(0).toUpperCase() + prop.slice(1);
            let meta = getObjByval(AllMetas["Eb" + cObj.ObjType], "name", prop);
            if (meta) {
                let NSS = meta.UIChangefn;
                if (NSS) {
                    let NS1 = NSS.split(".")[0];
                    let NS2 = NSS.split(".")[1];
                    if (cObj.ObjType === "TableLayout" || cObj.ObjType === "GroupBox")
                        EbOnChangeUIfns[NS1][NS2](cObj.Name, cObj);
                    else
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

    this.getFlatContControls = function () {
        let coll = [];
        this.ProcRecur(this.FormObj, coll);
        return coll;
    };

    this.ProcRecur = function (src_obj, dest_coll) {
        $.each(src_obj.Controls.$values, function (i, obj) {
            if (obj.IsContainer) {
                dest_coll.push(obj);
                this.ProcRecur(obj, dest_coll);
            }
        }.bind(this));
    };

    this.init = function () {
        this.$saveBtn.on("click", this.saveForm.bind(this));
        let allFlatControls = this.getFlatContControls().concat(this.flatControls);

        $.each(allFlatControls, function (k, cObj) {
            this.updateCtrlUI(cObj);
            this.initFormCtrl(cObj);
        }.bind(this));
        if (this.isEditMode)
            this.populateControls();
    };

    this.populateControls = function () {
        this.rowId = getObjByval(this.editModeObj, "Name", "id").Value;
        this.setEditModevalues(this.rowId);
    }

    this.setEditModevalues = function (rowId) {
        this.formRefId
        // show loader
        $.ajax({
            type: "POST",
            url: "../WebForm/getRowdata",
            data: {
                refid: this.formRefId, rowid: parseInt(rowId)
            },
            success: function (data) {
                this.EditModevalues = data.rowValues;
                $.each(this.flatControls, function (i, cObj) {
                    $("#" + cObj.Name).val(this.EditModevalues[i]);
                }.bind(this));
                console.log(data);
                //hide loader
            }.bind(this),
        });
    };

    this.ProcRecurForVal = function (src_obj, FVWTObjColl) {
        let _val = null;
        $.each(src_obj.Controls.$values, function (i, obj) {
            if (obj.IsContainer) {
                if (obj.TableName === "" || obj.TableName === null)
                    obj.TableName = src_obj.TableName;
                if (FVWTObjColl[obj.TableName] === undefined)
                    FVWTObjColl[obj.TableName] = [];
                this.ProcRecurForVal(obj, FVWTObjColl);
            }
            else {
                let colObj = {};
                colObj.Name = obj.Name;
                _type = obj.EbDbType;
                colObj.Value = (_type === 7) ? parseInt($("#" + obj.Name).val()) : $("#" + obj.Name).val();
                colObj.Type = _type;
                colObj.AutoIncrement = obj.AutoIncrement || false;
                FVWTObjColl[src_obj.TableName].push(colObj);
            }
        }.bind(this));

    };

    this.getFormValuesObjWithTypeColl = function () {
        var FVWTObjColl = {};
        //FVWTObjColl[this.FormObj.TableName] = [];
        this.ProcRecurForVal(this.FormObj, FVWTObjColl);
        return FVWTObjColl;
    };

    this.getFormValuesWithTypeColl = function () {
        var FVWTcoll = [];
        let _val = null;
        $.each(this.flatControls, function (idx, obj) {
            var _name = obj.Name;
            var _type = obj.EbDbType;
            var _val = (_type === 7) ? parseInt($("#" + obj.Name).val()) : $("#" + obj.Name).val();
            var _autoic = obj.AutoIncrement || false;
            FVWTcoll.push({ Name: _name, Value: _val, Type: _type, AutoIncrement: _autoic });
        }.bind(this));
        return FVWTcoll;
    };

    this.ajaxsuccess = function (rowAffected) {
        // hide loader
        if (rowAffected > 0) {
            EbMessage("show", { Message: "DataCollection success", AutoHide: true, Background: '#1ebf1e' });
            var msg = `Your ${this.FormObj.Name} form submitted successfully`;
        }
        else {
            EbMessage("show", { Message: "Something went wrong", AutoHide: true, Background: '#bf1e1e' });
            var msg = `Your ${this.FormObj.Name} form submission failed`;
        }
        //EbMessage("show", { Message: 'DataCollection Success', AutoHide: false, Backgorund: '#bf1e1e' });
    };

    this.saveForm = function () {
        if (!this.submitReqCheck())
            return;
        // show loader
        $.ajax({
            type: "POST",
            //url: this.ssurl + "/bots",
            url: "../WebForm/InsertWebformData",
            data: {
                TableName: this.FormObj.TableName, ValObj: this.getFormValuesObjWithTypeColl(), RefId: this.formRefId, RowId: this.rowId
            },
            //beforeSend: function (xhr) {
            //    xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
            //}.bind(this),
            success: this.ajaxsuccess.bind(this),
        });

    };

    this.submitReqCheck = function () {
        var $firstCtrl = null;
        $.each(this.flatControls, function (i, control) {
            var $ctrl = $("#" + control.Name);
            if ($ctrl.length !== 0 && control.Required && $ctrl.val().trim() === "") {
                if (!$firstCtrl)
                    $firstCtrl = $ctrl;
                this.makeReqFm(control);
            }
        }.bind(this));

        if ($firstCtrl) {
            $firstCtrl.select();
            return false
        }
        else
            return true;
    };

    this.init();
}