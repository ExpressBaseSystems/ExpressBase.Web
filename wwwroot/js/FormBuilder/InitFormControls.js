var InitControls = function (option) {
    if (option) {
        this.Bot = option.botBuilder;
        this.Wc = option.wc;
        this.Cid = option.Cid;
        this.Env = option.Env;
    }

    this.init = function (control, ctrlOpts) {
        if (this[control.ObjType] !== undefined) {
            this[control.ObjType](control, ctrlOpts);
        }
    };

    this.FileUploader = function (ctrl, ctrlOpts) {
        var imgup = new FUPFormControl({
            Type: this.getKeyByValue(EbEnums.FileClass, ctrl.FileType.toString()),
            ShowGallery: true,
            Categories: ["Pre consultation", "Consultation", "Hairline", "Post procedure", "Clot removal", "M2", "M4", "M6", "M8", "M10"],//ctrl.Categories.$values
            Files: [],
            TenantId: this.Cid,
            SolutionId: this.Cid,
            Container: ctrl.EbSid,
            Multiple: ctrl.IsMultipleUpload,
            ServerEventUrl: '',
            EnableTag: ctrl.EnableTag,
            EnableCrop: ctrl.EnableCrop,
            MaxSize: ctrl.MaxFileSize,
            CustomMenu: [{ name: "Delete", icon: "fa-trash" }]
        });
    };

    this.Date = function (ctrl, ctrlOpts) {
        let formObject = ctrlOpts.formObject;
        let userObject = ctrlOpts.userObject;
        let $input = $("#" + ctrl.EbSid_CtxId);
        if (ctrl.ShowDateAs_ === 1) {
            $input.MonthPicker({ Button: $input.next().removeAttr("onclick") });
            $input.MonthPicker('option', 'ShowOn', 'both');
            $input.MonthPicker('option', 'UseInputMask', true);
            let fun = new Function("form", "User", atob(ctrl.OnChange));
            $input.MonthPicker({
                OnAfterChooseMonth: fun.bind(this, formObject, userObject)
            });
        }
        else {

            if (typeof ctrl === typeof "")
                ctrl = { name: ctrl, ebDateType: 5 }
            var settings = { timepicker: false };

            if (ctrl.EbDateType === 5) {
                settings.timepicker = false;
                settings.format = "Y/m/d";
            }
            else if (ctrl.EbDateType === 17) {
                settings.datepicker = false;
                settings.format = "H:i";
            }
            else {
                settings.timepicker = true;
                settings.datepicker = true;
                settings.format = "Y/m/d H:i";
            }



            //if (ctrl.DateFormat === 0) {
            //    settings.formatDate = "d/m/Y";
            //}
            //else if (ctrl.DateFormat === 1) {
            //    settings.formatDate = "m/d/Y";
            //}
            //else if (ctrl.DateFormat === 2) {
            //    settings.formatDate = "Y/m/d";
            //}
            //else {
            //    settings.formatDate = "Y/d/m";
            //}


            //settings.minDate = ctrl.Min;
            //settings.maxDate = ctrl.Max;

            //$input.mask("0000-00-00");
            $input.datetimepicker({ timepicker: false, format: "Y-m-d" });
            //$input.datetimepicker(settings);
            //$input.mask(ctrl.MaskPattern || '00/00/0000');
            $input.next(".input-group-addon").off('click').on('click', function () { $input.datetimepicker('show'); }.bind(this));
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
    };

    this.InputGeoLocation = function (ctrl) {
        navigator.geolocation.getCurrentPosition(function (position) {
            this.Bot.userLoc.lat = position.coords.latitude;
            this.Bot.userLoc.long = position.coords.longitude;
            this.InitMap4inpG(ctrl);
        }.bind(this));
    };

    this.InitMap4inpG = function (ctrl) {
        let $input = $("#" + ctrl.EbSid_CtxId);
        var name = ctrl.Name;
        $input.locationpicker({
            location: {
                latitude: this.Bot.userLoc.lat,
                longitude: this.Bot.userLoc.long
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
        $(`#${name}_Cont .choose-btn`).click(this.Bot.chooseClick);

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

    this.Numeric = function (ctrl) {
        var id = ctrl.EbSid_CtxId;
        let $input = $("#" + ctrl.EbSid_CtxId);
        $input.focusout(function () {
            var val = $(this).val().toString();
            var l = 'SZZZZZZZZZZZ'.length - 1;
            var ndp = ctrl.DecimalPlaces;
            if (val === "0" || val === '' || val === '.')
                $(this).val('');
            else {
                if (ndp !== 0) {
                    if ((!val.includes('.')) && (l !== val.length))
                        val = val + '.';
                    if ((val.includes('.'))) {
                        var pi = val.indexOf('.');
                        var lmt = pi + ndp;
                        for (pi; pi <= l; pi++) {
                            if (val[pi] === null)
                                val += '0';
                            if (pi === lmt)
                                break;
                        }
                    }
                }
                if (val[0] === '.')
                    val = '0' + val;
                $(this).val(val);
            }
        });

        $input.focus(function () { $(this).select(); });
        $input.keypress(function (e) {

            var val = $input.val();
            var cs = document.getElementById(id).selectionStart;
            var ce = document.getElementById(id).selectionEnd;
            if (e.which === 46 && val.includes('.')) {
                setTimeout(function () {
                    $input.val(val);
                }, 1);
            }
            //// containes '.' and no selection
            //if (val.includes('.') && cs === ce) {
            //    setTimeout(function () {
            //        var pi = val.indexOf('.');
            //        //prevents exceeding decimal part length when containes '.'
            //        if ((val.length - pi) === (ctrl.DecimalPlaces + 1) && (e.which >= 48) && (e.which <= 57) && ce > pi)
            //            $input.val(val);
            //        //prevents exceeding integer part length when containes '.'
            //        if (pi === (ctrl.MaxLength - ctrl.DecimalPlaces) && (e.which >= 48) && (e.which <= 57) && ce <= pi)
            //            $input.val(val);
            //    }, 1);
            //}
            ////prevents exceeding integer-part length when no '.'
            //if (!(val.includes('.')) && val.length === (ctrl.MaxLength - ctrl.DecimalPlaces) && (e.which >= 48) && (e.which <= 57)) {
            //    setTimeout(function () {
            //        $input.val(val + '.' + String.fromCharCode(e.which));

            //    }, 1);
            //}
            ////prevents del before '.'if it leads to exceed integerpart limit
            //if (val.includes('.') && (val.length - 1) > (ctrl.MaxLength - ctrl.DecimalPlaces) && cs === val.indexOf('.') && e.which === 0) {
            //    setTimeout(function () {
            //        $input.val(val);
            //    }, 1);
            //}
            ////prevents <- after '.' if it leads to exceed integerpart limit
            //if (val.includes('.') && (val.length - 1) > (ctrl.MaxLength - ctrl.DecimalPlaces) && cs === (val.indexOf('.') + 1) && e.which === 8) {
            //    setTimeout(function () {
            //        $input.val(val);
            //    }, 1);
            //}
            ////prevents deletion of selection when containes '.' if it leads to exceed integerpart limit
            //if ((val.includes('.') && val.length - (ce - cs)) > (ctrl.MaxLength - ctrl.DecimalPlaces) && cs <= val.indexOf('.') && ce > val.indexOf('.')) {
            //    setTimeout(function () {
            //        $input.val(val);
            //    }, 1);
            //}
        });

        $input.mask('SZZZZZZZZZZZ', {
            //reverse: true,
            translation: {
                'S': {
                    pattern: /-/,
                    optional: true
                },
                'Z': {
                    pattern: /[0-9.]/,
                    optional: true
                }
            }
        });
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