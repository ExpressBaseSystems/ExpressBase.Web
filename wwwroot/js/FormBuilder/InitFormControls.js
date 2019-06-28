var InitControls = function (option) {
    if (option) {
        this.Bot = option.botBuilder;
        this.Wc = option.wc;
        this.Cid = option.Cid;
        this.Env = option.Env;
    }

    this.init = function (control, ctrlOpts) {
        if (this[control.ObjType] !== undefined) {
            return this[control.ObjType](control, ctrlOpts);
        }
    };

    this.FileUploader = function (ctrl, ctrlOpts) {
        let files = [];
        let catTitle = [];
        $.each(ctrl.Categories.$values, function (i, obj) {
            catTitle.push(obj.CategoryTitle);
        }.bind(catTitle));

        if (ctrlOpts.FormDataExtdObj.val !== null) {
            files = JSON.parse(ctrlOpts.FormDataExtdObj.val[ctrl.EbSid][0].Columns[0].Value);
        }
        let imgup = new FUPFormControl({
            Type: this.getKeyByValue(EbEnums.FileClass, ctrl.FileType.toString()),
            ShowGallery: true,
            Categories: catTitle,
            Files: files,
            TenantId: this.Cid,
            SolutionId: this.Cid,
            Container: ctrl.EbSid,
            Multiple: ctrl.IsMultipleUpload,
            ServerEventUrl: this.Env === "Production" ? 'https://se.expressbase.com' : 'https://se.eb-test.xyz',
            EnableTag: ctrl.EnableTag,
            EnableCrop: ctrl.EnableCrop,
            MaxSize: ctrl.MaxFileSize,
            CustomMenu: [{ name: "Delete", icon: "fa-trash" }]
        });

        uploadedFileRefList[ctrl.Name] = this.getInitFileIds(files);

        imgup.uploadSuccess = function (fileid) {
            if (uploadedFileRefList[ctrl.Name].indexOf(fileid) === -1)
                uploadedFileRefList[ctrl.Name].push(fileid);
        };

        imgup.windowClose = function () {
            if (uploadedFileRefList[ctrl.Name].length > 0)
                EbMessage("show", { Message: 'Changes Affect only if Form is Saved', AutoHide: true, Background: '#0000aa' });
        };

        imgup.customTrigger = function (name, refids) {
            if (name === "Set as DP") {
                EbMessage("show", { Message: 'Not Implemented', AutoHide: true, Background: '#0000aa' });
            }
            else if (name === "Delete") {
                if (name === "Delete") {
                    EbDialog("show",
                        {
                            Message: "Are you sure? Changes Affect only if Form is Saved.",
                            Buttons: {
                                "Yes": {
                                    Background: "green",
                                    Align: "left",
                                    FontColor: "white;"
                                },
                                "No": {
                                    Background: "violet",
                                    Align: "right",
                                    FontColor: "white;"
                                }
                            },
                            CallBack: function (name) {
                                if (name === "Yes") {
                                    let initLen = uploadedFileRefList[ctrl.Name].length;
                                    for (let i = 0; i < refids.length; i++) {
                                        let index = uploadedFileRefList[ctrl.Name].indexOf(refids[i]);
                                        if (index !== -1) {
                                            uploadedFileRefList[ctrl.Name].splice(index, 1);
                                        }
                                    }
                                    if (initLen > uploadedFileRefList[ctrl.Name].length) {
                                        imgup.deleteFromGallery(refids);
                                        EbMessage("show", { Message: 'Changes Affect only if Form is Saved', AutoHide: true, Background: '#0000aa' });
                                    }
                                }
                            }
                        });
                }

            }
        };

    };

    this.getInitFileIds = function (files) {
        let ids = [];
        for (let i = 0; i < files.length; i++)
            ids.push(files[i].FileRefId);
        return ids;
    };

    this.DGUserControlColumn = function (ctrl, ctrlOpts) {
        ctrl.__Col.__DGUCC.initForctrl(ctrl);
    };

    this.SetDateFormatter = function () {
        $.datetimepicker.setDateFormatter({
            parseDate: function (date, format) {
                var d = moment(date, format);
                return d.isValid() ? d.toDate() : false;
            },

            formatDate: function (date, format) {
                return moment(date).format(format);
            }
        });
    };
    this.SetDateFormatter();

    this.Date = function (ctrl, ctrlOpts) {
        let formObject = ctrlOpts.formObject;
        let userObject = ebcontext.user;
        let $input = $("#" + ctrl.EbSid_CtxId);
        if (ctrl.ShowDateAs_ === 1) {
            $input.MonthPicker({ Button: $input.next().removeAttr("onclick") });
            $input.MonthPicker('option', 'ShowOn', 'both');
            $input.MonthPicker('option', 'UseInputMask', true);
            if (ctrl.OnChangeFn && ctrl.OnChangeFn.Code) {
                let fun = new Function("form", "User", atob(ctrl.OnChangeFn.Code));
                $input.MonthPicker({
                    OnAfterChooseMonth: fun.bind(this, formObject, userObject)
                });
            }
            ctrl.setValue(moment(ebcontext.user.Preference.ShortDate, ebcontext.user.Preference.ShortDatePattern).format('MM/YYYY'));
        }
        else {
            let sdp = userObject.Preference.ShortDatePattern;//"DD-MM-YYYY";
            let stp = userObject.Preference.ShortTimePattern;//"HH mm"

            if (typeof ctrl === typeof "")
                ctrl = { name: ctrl, ebDateType: 5 };
            var settings = { timepicker: false };

            if (ctrl.EbDateType === 5) { //Date
                $input.datetimepicker({
                    format: sdp,
                    formatTime: stp,
                    formatDate: sdp,
                    timepicker: false,
                    datepicker: true,
                    mask: true
                });
                //$input.val(userObject.Preference.ShortDate);
            }
            else if (ctrl.EbDateType === 17) { //Time
                $input.datetimepicker({
                    format: stp,
                    formatTime: stp,
                    formatDate: sdp,
                    timepicker: true,
                    datepicker: false
                });
                //$input.val(userObject.Preference.ShortTime);
            }
            else {
                $input.datetimepicker({ //DateTime
                    format: sdp + " " + stp,
                    formatTime: stp,
                    formatDate: sdp,
                    timepicker: true,
                    datepicker: true
                });
                //$input.val(userObject.Preference.ShortDate + " " + userObject.Preference.ShortTime);
            }
            this.setCurrentDate(ctrl, $input);

            //settings.minDate = ctrl.Min;
            //settings.maxDate = ctrl.Max;

            //if (ctrlOpts.source === "webform") {
                //let maskPattern = "DD-MM-YYYY";
                //$input.attr("placeholder", maskPattern);
                //$input.inputmask(maskPattern);               
                
            //    if (!ctrl.IsNullable)
            //        $input.val(userObject.Preference.ShortDate);
            //}

            //$input.mask(ctrl.MaskPattern || '00/00/0000');
            $input.next(".input-group-addon").off('click').on('click', function () { $input.datetimepicker('show'); }.bind(this));
            if (ctrl.IsNullable) {
                if (!($('#' + this.EbSid_CtxId).siblings('.nullable-check').find('input[type=checkbox]').prop('checked')))
                    $input.val('');
                $input.prev(".nullable-check").find("input[type='checkbox']").off('change').on('change', this.toggleNullableCheck.bind(this, ctrl));//created by amal
                $input.prop('disabled', true).next(".input-group-addon").css('pointer-events', 'none');
            }
        }
    };

    //created by amal
    this.toggleNullableCheck = function (ctrl) {
        let $ctrl = $(event.target).closest("input[type='checkbox']");
        if ($ctrl.is(":checked")) {
            if ($ctrl.closest(".input-group").find("input[type='text']").val() === "")
                //$ctrl.closest(".input-group").find("input[type='text']").val(ebcontext.user.Preference.ShortDate);
                this.setCurrentDate(ctrl, $ctrl.closest(".input-group").find("input[type='text']"));
            $ctrl.closest(".input-group").find("input[type='text']").prop('disabled', false).next(".input-group-addon").css('pointer-events', 'auto');
            //ctrl.DoNotPersist = false;
        }
        else {
            $ctrl.closest(".input-group").find("input[type='text']").prop('disabled', true).next(".input-group-addon").css('pointer-events', 'none');
            //ctrl.DoNotPersist = true;
        }
    };

    this.setCurrentDate = function (ctrl, $input) {
        if (ctrl.EbDateType === 5) { //Date
            $input.val(ebcontext.user.Preference.ShortDate);
        }
        else if (ctrl.EbDateType === 17) { //Time
            $input.val(ebcontext.user.Preference.ShortTime);
        }
        else {
            $input.val(ebcontext.user.Preference.ShortDate + " " + ebcontext.user.Preference.ShortTime);
        }
    };

    this.SimpleSelect = function (ctrl) {
        let $input = $("#" + ctrl.EbSid_CtxId);
        $input.selectpicker();
    };

    this.UserLocation = function (ctrl) {
        let $input = $("#" + ctrl.EbSid_CtxId);
        $input.multiselect({
            includeSelectAllOption: true
        });

        $("body").on("click", "#" + ctrl.EbSid_CtxId + "_checkbox", this.UserLocationCheckboxChanged.bind(this, ctrl));
    };

    this.UserLocationCheckboxChanged = function (ctrl) {
        if ($(event.target).prop("checked")) {
            $('#' + ctrl.EbSid_CtxId).next('div').children().find('li:eq(0)').children().find("input").trigger('click');
            $('#' + ctrl.EbSid_CtxId).next('div').find("*").attr("disabled", "disabled").off('click');
        }
        else {
            $('#' + ctrl.EbSid_CtxId).next('div').find("*").removeAttr('disabled').on('click');
            if ($('#' + ctrl.EbSid_CtxId).next('div').children().find('li:eq(0)').children().find("input").prop("checked"))
                $('#' + ctrl.EbSid_CtxId).next('div').children().find('li:eq(0)').children().find("input").trigger('click');

        }
    };

    this.InputGeoLocation = function (ctrl) {
        ebcontext.userLoc = { lat: 0 ,long: 0};
        if (_rowId === undefined || _rowId === 0) {
            navigator.geolocation.getCurrentPosition(function (position) {
                $('#' + ctrl.EbSid_CtxId).locationpicker('location', { latitude: position.coords.latitude, longitude: position.coords.longitude });
            }.bind(this));
        }
        this.InitMap4inpG(ctrl);
    };

    this.InitMap4inpG = function (ctrl) {
        let $input = $("#" + ctrl.EbSid_CtxId);
        var name = ctrl.EbSid;
        $input.locationpicker({
            location: {
                latitude: ebcontext.userLoc.lat,
                longitude: ebcontext.userLoc.long
            },
            radius: 5,
            zoom: 18,
            inputBinding: {
                latitudeInput: $('#' + name + 'lat'),
                longitudeInput: $('#' + name + 'long'),
                locationNameInput: $('#' + name + 'address')
            },
            enableAutocomplete: true,
            autocompleteOptions: {
                types: ['(cities)'],
                componentRestrictions: { country: 'fr' }
            }
        });
        //$(`#${name}_Cont .choose-btn`).click(this.Bot.chooseClick);

    };

    this.Locations = function (ctrls) {
        var name = ctrls.ebSid;
        if (ctrls.showTabed) {
            $(`#${name} .loc-opt-btn`).off("click").on("click", function (e) {
                var $optBtn = $(e.target);
                var loc = $optBtn.attr("for");
                var ctrlArr = $.grep(ctrls.locationCollection, function (ctrl, i) { return ctrl.name === loc; });
                var ctrl = ctrlArr[0];
                var $locDiv = $(`#${ctrl.Name}`);
                $(`#${name} .loc-opt-btn`).css("border-bottom", "solid 2px transparent").css("font-weight", "normal").css("color", "#868585");
                $optBtn.css("border-bottom", "solid 2px #31d031").css("font-weight", "bold").css("color", "#333");
                if ($locDiv.closest(".location-box").css("display") === "none") {
                    $(`#${name} .location-box`).hide(10);
                    $locDiv.closest(".location-box").show(10,
                        function () {
                            if ($locDiv.children().length === 0)
                                this.initMap(ctrl);
                        }.bind(this));
                }

            }.bind(this));
            $(`#${name} .loc-opt-btn`)[0].click();
        }
        else {
            $(`#${name} .loc-opt-DD`).off("change").on("change", function (e) {
                var loc = $(e.target).children().filter(":selected").val();
                var ctrlArr = $.grep(ctrls.locationCollection, function (ctrl, i) { return ctrl.Name === loc; });
                var ctrl = ctrlArr[0];
                var $locDiv = $(`#${ctrl.Name}`);
                if ($locDiv.closest(".location-box").css("display") === "none") {
                    $(`#${name} .location-box`).hide(10);
                    $locDiv.closest(".location-box").show(10,
                        function () {
                            if ($locDiv.children().length === 0)
                                this.initMap(ctrl);
                        }.bind(this));
                }
            }.bind(this));

            $(`#${name} .location-box:eq(0)`).show();
            this.initMap(ctrls.locationCollection[0]);
        }
        this.Bot.nxtCtrlIdx++;
        this.Bot.callGetControl();
    };

    this.initMap = function (ctrl) {
        var uluru = { lat: ctrl.Position.latitude, lng: ctrl.Position.longitude };
        var map = new google.maps.Map(document.getElementById(ctrl.Name), {
            zoom: 15,
            center: uluru
        });
        var marker = new google.maps.Marker({
            position: uluru,
            map: map
        });
    };

    this.DataGrid = function (ctrl, ctrlOpts) {
        let ebsid = ctrl.EbSid_CtxId;
        let DataGrid = new EbDataGrid(ctrl, ctrlOpts);
        return DataGrid;
    };

    this.PowerSelect = function (ctrl, ctrlOpts) {
        Vue.component('v-select', VueSelect.VueSelect);
        Vue.config.devtools = true;

        $(`#${ctrl.EbSid_CtxId}_loading-image`).hide();

        let EbCombo = new EbSelect(ctrl, {
            getFilterValuesFn: ctrlOpts.getAllCtrlValuesFn,
            wc: this.Wc
        });

        if (this.Bot && this.Bot.curCtrl !== undefined)
            this.Bot.curCtrl.SelectedRows = EbCombo.getSelectedRow;
    };

    this.Survey = function (ctrl) {
        new EbSurveyRender($('#' + ctrl.Name), this.Bot);
    };

    this.StaticCardSet = function (ctrl) {
        new EbCardRender({
            $Ctrl: $('#' + ctrl.Name),
            Bot: this.Bot
        });
        //this.initCards($('#' + ctrl.Name));
    };

    this.DynamicCardSet = function (ctrl) {
        new EbCardRender({
            $Ctrl: $('#' + ctrl.Name),
            Bot: this.Bot
        });
        //this.initCards($('#' + ctrl.Name));
    };

    this.ImageUploader = function (ctrl) {
        $('#' + ctrl.Name).off("change").on("change", function (input) {
            $(input.target).closest(".ctrl-wraper").next("[name=ctrlsend]").click();
        }.bind(this));
    };

    this.RadioGroup = function (ctrl) {
        $('#' + ctrl.Name).find("input").on("change", function (e) {
            var val = $('#' + this.id + 'Lbl').text().trim();
            $('#' + ctrl.Name).val(val);
        });
    };

    this.CheckBoxGroup = function (ctrl) {
        $('#' + ctrl.Name).find("input").on("change", function (e) {
            var $ctrlDiv = $('#' + ctrl.Name); var values = "";
            $ctrlDiv.find("input").each(function (i, el) {
                if (el.checked) {
                    val = $('#' + el.id + 'Lbl').text().trim();
                    values += "," + val;
                }
            });
            $ctrlDiv.val(values.substring(1));
        });
    };

    this.Button = function (ctrl) {
        $('#' + ctrl.EbSid_CtxId).removeAttr("disabled");
        $('#' + ctrl.EbSid_CtxId).on('click', this.iFrameOpen.bind(this, ctrl));
    };

    this.iFrameOpen = function (ctrl) {
        let url = "../WebForm/Index?refid=" + ctrl.FormRefId + "&_mode=12";
        $("#iFrameForm").attr("src", url);
        $("#iFrameFormModal").modal("show");
    };

    this.SysLocation = function (ctrl) {//all sys controls init commented to avoid confusion with the default value in new mode
        //if (_rowId === undefined || _rowId === 0) {
        //    setTimeout(function () {
        //        if (ctrl.DisplayMember === 1) {
        //            $("#" + ctrl.EbSid_CtxId).val(loc__.CurrentLocObj.LocId);
        //        }
        //        else if (ctrl.DisplayMember === 3) {
        //            $("#" + ctrl.EbSid_CtxId).val(loc__.CurrentLocObj.LongName);
        //        }
        //        else {
        //            $("#" + ctrl.EbSid_CtxId).val(loc__.CurrentLocObj.ShortName);
        //        }
        //    }, 500);
        //}        
    };
    this.SysCreatedBy = function (ctrl) {
        //if (ctrl.DisplayMember === 1) {
        //    $("#" + ctrl.EbSid_CtxId).val(ebcontext.user.UserId);
        //}
        //else {
        //    $("#" + ctrl.EbSid_CtxId).val(ebcontext.user.FullName);
        //}
    };
    this.SysModifiedBy = function (ctrl) {
        //if (_rowId > 0) {
        //    if (ctrl.DisplayMember === 1) {
        //        $("#" + ctrl.EbSid_CtxId).val(ebcontext.user.UserId);
        //    }
        //    else {
        //        $("#" + ctrl.EbSid_CtxId).val(ebcontext.user.FullName);
        //    }
        //}        
    };
    this.SysCreatedAt = function (ctrl) {
        //this.setCurrentDate(ctrl, $("#" + ctrl.EbSid_CtxId));
    };

    this.Numeric = function (ctrl) {
        var id = ctrl.EbSid_CtxId;
        let $input = $("#" + ctrl.EbSid_CtxId);
        let initValue = "0";
        if (ctrl.DecimalPlaces > 0)
            initValue = initValue + "." + "0".repeat(ctrl.DecimalPlaces);
        $input.val(initValue);

        $input.inputmask("currency", {
            radixPoint: ".",
            allowMinus: ctrl.AllowNegative,
            groupSeparator: "",
            digits: ctrl.DecimalPlaces,
            prefix: '',
            autoGroup: true
        });

        $input.focus(function () { $(this).select(); });

        //$input.focusout(function () {
        //    var val = $(this).val().toString();
        //    var l = 'SZZZZZZZZZZZ'.length - 1;
        //    var ndp = ctrl.DecimalPlaces;
        //    if (val === "0" || val === '' || val === '.')
        //        $(this).val('');
        //    else {
        //        if (ndp !== 0) {
        //            if ((!val.includes('.')) && (l !== val.length))
        //                val = val + '.';
        //            if ((val.includes('.'))) {
        //                var pi = val.indexOf('.');
        //                var lmt = pi + ndp;
        //                for (pi; pi <= l; pi++) {
        //                    if (val[pi] === null)
        //                        val += '0';
        //                    if (pi === lmt)
        //                        break;
        //                }
        //            }
        //        }
        //        if (val[0] === '.')
        //            val = '0' + val;
        //        $(this).val(val);
        //    }
        //});

        {// temp for hairo craft
            $input.blur(function () {
                var val = $input.val();
                let decLen = 2;

                if (val.trim() === "") {
                    $input.val("0.00");
                }
                else if (!val.trim().includes(".")) {
                    let newVal = val + ".00";
                    $input.val(newVal);
                }
                else {
                    let p1 = val.split(".")[0];
                    let p2 = val.split(".")[1];
                    zerolen = decLen - p2.length;
                    let newVal = p1 + "." + p2 + "0".repeat(zerolen > 0 ? zerolen : 0);
                    $input.val(newVal);
                }
            });
        }
        //$input.keypress(function (e) {

        //    var val = $input.val();
        //    var cs = document.getElementById(id).selectionStart;
        //    var ce = document.getElementById(id).selectionEnd;

        //    if (e.which === 46 && val.includes('.')) {
        //        setTimeout(function () {
        //            $input.val(val);
        //        }, 1);
        //    }

        //    //// containes '.' and no selection
        //    //if (val.includes('.') && cs === ce) {
        //    //    setTimeout(function () {
        //    //        var pi = val.indexOf('.');
        //    //        //prevents exceeding decimal part length when containes '.'
        //    //        if ((val.length - pi) === (ctrl.DecimalPlaces + 1) && (e.which >= 48) && (e.which <= 57) && ce > pi)
        //    //            $input.val(val);
        //    //        //prevents exceeding integer part length when containes '.'
        //    //        if (pi === (ctrl.MaxLength - ctrl.DecimalPlaces) && (e.which >= 48) && (e.which <= 57) && ce <= pi)
        //    //            $input.val(val);
        //    //    }, 1);
        //    //}
        //    ////prevents exceeding integer-part length when no '.'
        //    //if (!(val.includes('.')) && val.length === (ctrl.MaxLength - ctrl.DecimalPlaces) && (e.which >= 48) && (e.which <= 57)) {
        //    //    setTimeout(function () {
        //    //        $input.val(val + '.' + String.fromCharCode(e.which));

        //    //    }, 1);
        //    //}
        //    ////prevents del before '.'if it leads to exceed integerpart limit
        //    //if (val.includes('.') && (val.length - 1) > (ctrl.MaxLength - ctrl.DecimalPlaces) && cs === val.indexOf('.') && e.which === 0) {
        //    //    setTimeout(function () {
        //    //        $input.val(val);
        //    //    }, 1);
        //    //}
        //    ////prevents <- after '.' if it leads to exceed integerpart limit
        //    //if (val.includes('.') && (val.length - 1) > (ctrl.MaxLength - ctrl.DecimalPlaces) && cs === (val.indexOf('.') + 1) && e.which === 8) {
        //    //    setTimeout(function () {
        //    //        $input.val(val);
        //    //    }, 1);
        //    //}
        //    ////prevents deletion of selection when containes '.' if it leads to exceed integerpart limit
        //    //if ((val.includes('.') && val.length - (ce - cs)) > (ctrl.MaxLength - ctrl.DecimalPlaces) && cs <= val.indexOf('.') && ce > val.indexOf('.')) {
        //    //    setTimeout(function () {
        //    //        $input.val(val);
        //    //    }, 1);
        //    //}
        //});

        //let sPattern = /[0-9.]/;
        //if (!ctrl.AllowNegative)
        //    sPattern = /[0-9]/;

        //$input.mask('SZZZZZZZZZZZ', {
        //    //reverse: true,
        //    translation: {
        //        'S': {
        //            pattern: sPattern,
        //            optional: true
        //        },
        //        'Z': {
        //            pattern: /[0-9.]/,
        //            optional: true
        //        }
        //    }
        //});
    };

    this.getKeyByValue = function (Obj, value) {
        for (var prop in Obj) {
            if (Obj.hasOwnProperty(prop)) {
                if (Obj[prop] === value)
                    return prop;
            }
        }
    };

};