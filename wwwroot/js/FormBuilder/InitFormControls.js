var InitControls = function (bot) {
    this.Bot = bot;

    this.Date = function (ctrl) {
        var settings = { timepicker: false };

        if (ctrl.ebDateType === 5) {
            settings.timepicker = false;
            settings.format = "Y/m/d";
        }
        else if (ctrl.ebDateType === 17) {
            settings.datepicker = false;
            settings.format = "H:i";
        }
        else {
            settings.timepicker = true;
            settings.datepicker = true;
            settings.format = "Y/m/d H:i";
        }

        //settings.minDate = ctrl.min;
        //settings.maxDate = ctrl.max;

        $('#' + ctrl.name).datetimepicker(settings);
        $('#' + ctrl.name).mask(ctrl.maskPattern || '00/00/0000');
    };

    this.SimpleSelect = function (ctrl) {
        //$('#' + ctrl.name).selectpicker();
    };

    this.Locations = function (ctrls) {
        $.each(ctrls.locationCollection, function (i, ctrl) {
            var uluru = { lat: ctrl.position.latitude, lng: ctrl.position.longitude };
            var map = new google.maps.Map(document.getElementById(ctrl.ebSid), {
                zoom: 15,
                center: uluru
            });
            var marker = new google.maps.Marker({
                position: uluru,
                map: map
            });
        });
    }

    this.Cards = function (ctrl) {
        this.initCards($('#' + ctrl.ebSid));
    }

    this.initCards = function ($Ctrl) {
        console.log("initCards");
        $Ctrl.find(".card-btn-cont .btn").attr("idx", this.Bot.curForm.controls.indexOf(this.Bot.curCtrl))
        $Ctrl.not('.slick-initialized').slick({
            slidesToShow: 1,
            infinite: false,
            draggable: false,
            speed: 300,
            cssEase: 'ease-in-out',
            //arrows: false,
            //dots: true,
            //prevArrow: "<button type='button' class='slick-prev pull-left'><i class='fa fa-angle-left' aria-hidden='true'></i></button>",
            //nextArrow: "<button type='button' class='slick-next pull-right'><i class='fa fa-angle-right' aria-hidden='true'></i></button>"
            //prevArrow: $("#prevcard"),
            //nextArrow: $("#nextcard")
        });
    };

    this.ImageUploader = function (ctrl) {
        $('#' + ctrl.name).off("change").on("change", function (input) {
            $(input.target).closest(".ctrl-wraper").next("[name=ctrlsend]").click();
        }.bind(this));
    };

    this.RadioGroup = function (ctrl) {
        $('#' + ctrl.name).find("input").on("change", function (e) {
            var val = $('#' + this.id + 'Lbl').text().trim();
            $('#' + ctrl.name).val(val);
        });
    };

    this.CheckBoxGroup = function (ctrl) {
        $('#' + ctrl.name).find("input").on("change", function (e) {
            var $ctrlDiv = $('#' + ctrl.name); var values = "";
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
        var id = ctrl.name;
        $('#' + id).focusout(function () {
            var val = $(this).val().toString();
            var l = 'SZZZZZZZZZZZ'.length - 1;
            var ndp = ctrl.decimalPlaces;
            if (val == 0 || val === '' || val === '.')
                $(this).val('');
            else {
                if (ndp !== 0) {
                    if ((!val.includes('.')) && (l !== val.length))
                        val = val + '.';
                    if ((val.includes('.'))) {
                        var pi = val.indexOf('.');
                        var lmt = pi + ndp;
                        for (pi; pi <= l; pi++) {
                            if (val[pi] == null)
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

        $('#' + id).focus(function () { $(this).select(); });
        $('#' + id).keypress(function (e) {

            var val = $('#' + id).val();
            var cs = document.getElementById(id).selectionStart;
            var ce = document.getElementById(id).selectionEnd;
            if (e.which == 46 && val.includes('.')) {
                setTimeout(function () {
                    $('#' + id).val(val);
                }, 1);
            }
            // containes '.' and no selection
            if (val.includes('.') && cs === ce) {
                setTimeout(function () {
                    var pi = val.indexOf('.');
                    //prevents exceeding decimal part length when containes '.'
                    if ((val.length - pi) === (ctrl.decimalPlaces + 1) && (e.which >= 48) && (e.which <= 57) && ce > pi)
                        $('#' + id).val(val);
                    //prevents exceeding integer part length when containes '.'
                    if (pi === (ctrl.maxLength - ctrl.decimalPlaces) && (e.which >= 48) && (e.which <= 57) && ce <= pi)
                        $('#' + id).val(val);
                }, 1);
            }
            //prevents exceeding integer-part length when no '.'
            if (!(val.includes('.')) && val.length === (ctrl.maxLength - ctrl.decimalPlaces) && (e.which >= 48) && (e.which <= 57)) {
                setTimeout(function () {
                    $('#' + id).val(val + '.' + String.fromCharCode(e.which));

                }, 1);
            }
            //prevents del before '.'if it leads to exceed integerpart limit
            if (val.includes('.') && (val.length - 1) > (ctrl.maxLength - ctrl.decimalPlaces) && cs === val.indexOf('.') && e.which === 0) {
                setTimeout(function () {
                    $('#' + id).val(val);
                }, 1);
            }
            //prevents <- after '.' if it leads to exceed integerpart limit
            if (val.includes('.') && (val.length - 1) > (ctrl.maxLength - ctrl.decimalPlaces) && cs === (val.indexOf('.') + 1) && e.which === 8) {
                setTimeout(function () {
                    $('#' + id).val(val);
                }, 1);
            }
            //prevents deletion of selection when containes '.' if it leads to exceed integerpart limit
            if ((val.includes('.') && val.length - (ce - cs)) > (ctrl.maxLength - ctrl.decimalPlaces) && cs <= val.indexOf('.') && ce > val.indexOf('.')) {
                setTimeout(function () {
                    $('#' + id).val(val);
                }, 1);
            }
        });

        $('#' + id).mask('SZZZZZZZZZZZ', {
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

}