var InitControls = function (bot) {
    this.Bot = bot;

    this.Date = function (ctrl) {
        if (typeof ctrl === typeof "")
            ctrl = { name: ctrl, ebDateType: 5 }
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

    this.InputGeoLocation = function (ctrl) {
        navigator.geolocation.getCurrentPosition(function (position) {
            this.Bot.userLoc.lat = position.coords.latitude;
            this.Bot.userLoc.long = position.coords.longitude;
            this.InitMap4inpG(ctrl);
        }.bind(this));
    };

    this.InitMap4inpG = function (ctrl) {

        var name = ctrl.name;
        $('#' + name).locationpicker({
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
                var $locDiv = $(`#${ctrl.name}`);
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
                var ctrlArr = $.grep(ctrls.locationCollection, function (ctrl, i) { return ctrl.name === loc; });
                var ctrl = ctrlArr[0];
                var $locDiv = $(`#${ctrl.name}`);
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
        var uluru = { lat: ctrl.position.latitude, lng: ctrl.position.longitude };
        var map = new google.maps.Map(document.getElementById(ctrl.name), {
            zoom: 15,
            center: uluru
        });
        var marker = new google.maps.Marker({
            position: uluru,
            map: map
        });
    }

    this.ComboBox = function (ctrl) {

        Vue.component('v-select', VueSelect.VueSelect);
        Vue.config.devtools = true;

        $(`#${ctrl.name}_loading-image`).hide();
        //var EbCombo = new EbSelect(ctrl.name, ctrl.DataSourceId, ctrl.DropdownHeight, ctrl.ValueMember, ['acmaster1_name', 'tdebit', 'tcredit'], (!ctrl.MultiSelect || ctrl.MaxLimit == 0) ? "1" : ctrl.MaxLimit, ctrl.MinLimit, ctrl.Required, ctrl.DefaultSearchFor, "https://expressbaseservicestack.azurewebsites.net", [1000], ctrl);
        var o = new Object();
        o.wc = 'bc';
        var EbCombo = new EbSelect(ctrl, o);
        if (this.Bot.curCtrl !== undefined)
            this.Bot.curCtrl.selectedRows = EbCombo.getSelectedRow;
    };
        
    this.StaticCardSet = function (ctrl) {
        this.initCards($('#' + ctrl.name));
    };
    
    this.DynamicCardSet = function (ctrl) {
        this.initCards($('#' + ctrl.name));
    };
    
    this.initCards = function ($Ctrl) {
        $Ctrl.find(".cards-btn-cont .btn").attr("idx", this.Bot.curForm.controls.indexOf(this.Bot.curCtrl));
        this.SelectedCards = [];
        this.sumFieldsName = [];
        this.slickObjOfCards = null;
        this.filterVal = null;
        this.searchTxt = null;
        this.slickFiltered = false;
        var noOfCard = $Ctrl.find('.cards-cont').children().length;
        $Ctrl.find(".card-head-cardno").text((noOfCard === 0 ? "0": "1") + " of " + noOfCard);
        
        //getting the sum fields to display total
        $.each(this.Bot.curCtrl.cardFields, function (k, obj) {
            if (obj.summarize && obj.hasOwnProperty('sum') && obj.sum) {
                this.sumFieldsName.push(obj.name);
            }
        }.bind(this));

        //resetting cards. required for reopening same cardset
        this.resetSelectedCardDisplay($Ctrl);

        $Ctrl.find(".card-btn-cont .btn").off('click').on('click', function (evt) {
            var $e = $(evt.target).closest(".btn");
            var $card = $e.closest('.card-cont');
            
            if (!this.Bot.curCtrl.multiSelect) {
                this.SelectedCards = [];
                this.resetSelectedCardDisplay($('#' + this.Bot.curCtrl.name));
            }

            var itempresent = $.grep(this.SelectedCards, function (a) {
                if (a.cardid === $card.attr('card-id'))
                    return true;
            });

            if (itempresent.length === 0) {
                $e.html('Remove <i class="fa fa-times"  style="color: red; display: inline-block;" aria-hidden="true"></i>');
                $($e.parent().siblings('.card-title-cont').children()[0]).show();
                this.processSelectedCard($card, evt);                
            }
            else {
                $e.html('Select <i class="fa fa-check" style="color: green; display: inline-block;" aria-hidden="true"></i>');
                $($e.parent().siblings('.card-title-cont').children()[0]).hide();
                this.spliceCardArray($card.attr('card-id'));
                this.drawSummaryTable($e.closest('.cards-cont').next().find(".table tbody"));
            } 
        }.bind(this));


        $Ctrl.find(".card-head-filterdiv select").off('change').on('change', function () {                
            this.filterVal = $(event.target).val();
            if ($($(event.target)[0]).find(":selected")["0"].index === 0) {
                this.filterVal = null;
            }
            this.filterCards($Ctrl);
        }.bind(this, $Ctrl));

        $Ctrl.find(".card-head-searchdiv input").off('keyup').on('keyup', function () {              
            this.searchTxt = $(event.target).val().trim();
            if (this.searchTxt === "")
                this.searchTxt = null;
            this.filterCards($Ctrl);
        }.bind(this, $Ctrl));

        this.slickObjOfCards = $Ctrl.find('.cards-cont').not('.slick-initialized').slick({
            slidesToShow: 1,
            infinite: false,
            draggable: false,
            speed: 300,
            cssEase: 'ease-in-out',
            adaptiveHeight: true
            //arrows: false,
            //dots: true,
            //prevArrow: "<button type='button' class='slick-prev pull-left'><i class='fa fa-angle-left' aria-hidden='true'></i></button>",
            //nextArrow: "<button type='button' class='slick-next pull-right'><i class='fa fa-angle-right' aria-hidden='true'></i></button>"
            //prevArrow: $("#prevcard"),
            //nextArrow: $("#nextcard")
        });

        $Ctrl.find('.cards-cont').on('afterChange', function (event, slick, currentSlide, nextSlide) {
            $Ctrl.find(".card-head-cardno").text((slick.$slides.length === 0 ? "0" : (currentSlide + 1)) + " of " + slick.$slides.length);
        }.bind($Ctrl));

        $.each($Ctrl.find('.card-location-cont'), function (k, lobj) {
            var latitude = parseFloat($(lobj).attr('data-lat'));
            var longitude = parseFloat($(lobj).attr('data-lng'));
            var uluru = { lat: latitude, lng: longitude };
            var map = new google.maps.Map($(lobj).children()[0], {
                zoom: 15,
                center: uluru
            });
            var marker = new google.maps.Marker({
                position: uluru,
                map: map
            });
        });
    };

    this.filterCards = function ($Ctrl) {
        if (this.slickFiltered) {
            $Ctrl.find('.cards-cont').slick('slickUnfilter');
            $Ctrl.find('.cards-cont').slick('slickGoTo', 0);
        }
        var $cards = this.getJqryObjOfCards($Ctrl, this.searchTxt, this.filterVal);
        $Ctrl.find('.cards-cont').slick('slickFilter', $cards);
        this.slickFiltered = true;
        var cardLength = $Ctrl.find('.cards-cont')["0"].slick.$slides.length;
        $Ctrl.find(".card-head-cardno").text((cardLength === 0 ? "0": "1") + " of " + cardLength);
    }

    //it will return card array(jqry object) of all condition satisfying cards
    this.getJqryObjOfCards = function ($Ctrl, searchTxt, filterVal) {
        var ftemp = "";
        var stemp = [];
        if (filterVal !== null) {
            ftemp = "[filter-value='" + filterVal + "']";
        }
        if (searchTxt !== null) {
            $.each($Ctrl.find('.card-cont'), function (k, cObj) {
                if ($(cObj).attr('search-value').trim().toLowerCase().search(searchTxt.toLowerCase()) !== -1)
                    stemp.push('[card-id=' + $(cObj).attr('card-id') + ']');
            }.bind(this));
        }
        var selQuery = '.card-cont';
        if (filterVal !== null && searchTxt !== null) {
            if (stemp.length === 0) {
                stemp[0] = -1;
            }
            selQuery = '.card-cont' + stemp[0] + ftemp;
            for (var i = 1; i < stemp.length; i++) {
                selQuery += ',' + stemp[i] + ftemp;
            }
        }
        else if (searchTxt === null && filterVal !== null) {
            selQuery = '.card-cont' + ftemp;
        }
        else if (filterVal === null && searchTxt !== null){
            selQuery = '.card-cont' + stemp[0] ;
            for (var i = 1; i < stemp.length; i++) {
                selQuery += ',' + stemp[i];
            }
        }
        return ($Ctrl.find(selQuery));
    }
    this.processSelectedCard = function ($card, evt) {
        var sObj = {};
        sObj["cardid"] = $card.attr('card-id');
        $.each(this.Bot.curCtrl.cardFields, function (k, obj) {
            if (obj.summarize) {
                var propval = "";
                if (obj.hasOwnProperty('valueExpression') && obj.valueExpression !== "") {
                    var strFunc = window.atob(obj.valueExpression);
                    $.each(this.Bot.curCtrl.cardFields, function (l, obj1) {
                        var str2 = "parseFloat(" + this.getValueInDiv($card.find('.data-' + obj1.name)) + ")";
                        if (!(obj1.objType === 'CardNumericField'))
                            str2.replace("parseFloat", "");
                        strFunc = strFunc.replace(new RegExp('card.' + obj1.name, 'g'), str2);
                    }.bind(this));
                    var newFunc = Function("$card", strFunc);
                    propval = newFunc($card).toString();
                    this.setValueInDiv($card.find('.data-' + obj.name), propval);
                }
                else {
                    propval = this.getValueInDiv($card.find('.data-' + obj.name));
                }
                if (obj.objType === 'CardNumericField')
                    sObj[obj.name] = parseFloat(propval);
                else
                    sObj[obj.name] = propval;
            }
        }.bind(this));
        this.SelectedCards.push(sObj);
        this.Bot.curCtrl.selectedCards.push(parseInt($card.attr('card-id')));
        this.drawSummaryTable($(evt.target).closest('.cards-cont').next().find('.table tbody'));
        this.setCardFieldValues($card);
    }
    this.drawSummaryTable = function ($tbody) {
        if ($tbody.length === 0)//if summary is not required(internal meaning)
            return;
        $tbody.children().remove();
        var tcols = $tbody.parent()["0"].firstElementChild.children["0"].cells.length;
        if (this.SelectedCards.length === 0) {
            $tbody.append("<tr><td style='text-align:center;' colspan=" + tcols + "><i> Nothing to Display </i></td></tr>");
            return;
        }
        
        $.each(this.SelectedCards, function (k, obj) {
            var trhtml = "<tr card-id='" + obj.cardid + "'>";
            var ind = 0;
            for (obprop in obj) {
                var isNum = (typeof (obj[obprop]) === "number");
                if (ind++) {
                    trhtml += "<td "+ (isNum? "style='text-align: right;'": "") +">" + (isNum? obj[obprop].toFixed(2): obj[obprop]) + "</td>";
                }
            }
            trhtml += "<td><i class='fa fa-trash-o remove-cart-item' aria-hidden='true' style='cursor: pointer;'></i></td></tr>";
            $tbody.append(trhtml);
        }.bind(this));

        var sumhtml = "<tr style='font-size: 14px;font-weight: 600;'><td style='padding-left:10%;' colspan=" + tcols + ">";
        $.each(this.sumFieldsName, function (fi, fn) {
            var sum = 0.0;
            $.each(this.SelectedCards, function (k, obj) {
                sum += parseFloat(obj[fn]);
            }.bind(this));
            sumhtml += "Total&nbsp" + fn + ":&nbsp&nbsp" + sum.toFixed(2) + "<br/>";
        }.bind(this));
        if (this.sumFieldsName.length !== 0)
            $tbody.append(sumhtml+"</tr></td>");

        $('.remove-cart-item').off('click').on('click', function (evt) {
            var cardid = $(evt.target).closest('tr').attr('card-id');
            this.spliceCardArray(cardid);
            $('#' + this.Bot.curCtrl.name).find(".card-cont[card-id='" + cardid + "']").find(".card-btn-cont .btn").html('Select <i class="fa fa-check" style="color: green; display: inline-block;" aria-hidden="true"></i>');
            $($('#' + this.Bot.curCtrl.name).find(".card-cont[card-id='" + cardid + "']").find(".card-title-cont").children()[0]).hide();
            this.drawSummaryTable($(evt.target).closest('tbody'));
        }.bind(this));
    };
    this.spliceCardArray = function (cardid) {
        for (var i = 0; i < this.SelectedCards.length; i++) {
            if (this.SelectedCards[i]['cardid'] == cardid) {
                this.SelectedCards.splice(i, 1);
                break;
            }
        }
        for (var i = 0; i < this.Bot.curCtrl.selectedCards.length; i++) {
            if (this.Bot.curCtrl.selectedCards[i] == cardid) {
                this.Bot.curCtrl.selectedCards.splice(i, 1);
                break;
            }
        }
    };
    this.getValueInDiv = function ($itemdiv) {
        if ($itemdiv.children().length === 0 || $($itemdiv.children()[0]).hasClass('fa-check'))
            return $itemdiv.text().trim();
        else
            return $itemdiv.children().find('input').val();
    }
    this.setValueInDiv = function ($itemdiv, value) {
        if ($itemdiv.children().length === 0)
            $itemdiv.text(value);
        else
            $itemdiv.children().find('input').val(value)
    }

    this.setCardFieldValues = function ($card) {
        var cardId = parseInt($card.attr('card-id'));
        var card = this.getCardReference(cardId);
        if (card === null)
            return;
        $.each(this.Bot.curCtrl.cardFields, function (k, fObj) {
            if (!fObj.doNotPersist) {
                var fVal = this.getValueInDiv($card.find('.data-' + fObj.name));
                //fObj.ebDbType always returns 16 <string>!!! if ebDbType return correct value then this checking can be avoided
                if (fObj.objType === 'CardNumericField')
                    card.customFields[fObj.name] = parseFloat(fVal);
                else
                    card.customFields[fObj.name] = fVal;
            }
        }.bind(this));
    }
    this.getCardReference = function(cardid){
        var card = null;
        $.each(this.Bot.curCtrl.cardCollection, function (k, cardObj) {
            if (cardObj.cardId === cardid) {
                card = cardObj;
                return;
            }               
        }.bind(this));
        return card;
    }
    this.resetSelectedCardDisplay = function ($Ctrl) {
        //reset cardset for reopening
        this.Bot.curCtrl.selectedCards = [];
        $.each($Ctrl.find(".card-btn-cont .btn"), function (h, elemt) {
            $(elemt).html('Select <i class="fa fa-check" style="color: green; display: inline-block;" aria-hidden="true"></i>');
            $($(elemt).parent().siblings('.card-title-cont').children()[0]).hide();
        });
        this.drawSummaryTable($Ctrl.find(".table tbody"));
    }


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