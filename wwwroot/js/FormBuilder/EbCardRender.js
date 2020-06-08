﻿var EbCardRender = function (options) {
    this.Bot = options.Bot;
    this.$Ctrl = options.$Ctrl;
    this.CtrlObj = options.CtrlObj;

    this.initCards = function ($Ctrl) {
        $Ctrl.find(".cards-btn-cont .btn").attr("idx", this.Bot.curForm.Controls.$values.indexOf(this.Bot.curCtrl));
        this.SelectedCards = [];
        this.sumFieldsName = [];
        this.sumFieldsLabel = [];
        this.slickObjOfCards = null;
        this.filterVal = null;
        this.searchTxt = null;
        this.slickFiltered = false;
        var noOfCard = $Ctrl.find('.cards-cont').children().length;
        $Ctrl.find(".card-head-cardno").text((noOfCard === 0 ? "0" : "1") + " of " + noOfCard);

        //getting the sum fields to display total
        $.each(this.Bot.curCtrl.CardFields.$values, function (k, obj) {
            if (obj.Summarize && obj.Sum) {
                this.sumFieldsName.push(obj.Name);
                this.sumFieldsLabel.push(obj.Label||obj.Name);
            }
        }.bind(this));

        //resetting cards. required for reopening same cardset
        this.resetSelectedCardDisplay($Ctrl);

        $Ctrl.find(".card-selbtn-cont .btn").off('click').on('click', function (evt) {
            var $e = $(evt.target).closest(".btn");
            var $card = $e.closest('.card-cont');

            if (!this.Bot.curCtrl.MultiSelect) {
                this.SelectedCards = [];
                this.resetSelectedCardDisplay($('#' + this.Bot.curCtrl.EbSid));
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
        $Ctrl.find("select.select-picker").selectpicker();
        $Ctrl.on('click', '.card-pls-mns.mns', this.minusClick);
        $Ctrl.on('click', '.card-pls-mns.pls', this.plusClick);
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
        $Ctrl.find(".card-head-cardno").text((cardLength === 0 ? "0" : "1") + " of " + cardLength);
    };

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
        else if (filterVal === null && searchTxt !== null) {
            selQuery = '.card-cont' + stemp[0];
            for (let i = 1; i < stemp.length; i++) {
                selQuery += ',' + stemp[i];
            }
        }
        return $Ctrl.find(selQuery);
    };
    this.processSelectedCard = function ($card, evt) {
        var sObj = {};
        sObj["cardid"] = $card.attr('card-id');
        $.each(this.Bot.curCtrl.CardFields.$values, function (k, obj) {
            if (obj.Summarize) {
                var propval = "";
                if (obj.ValueExpr && obj.ValueExpr.Code) {
                    var strFunc = window.atob(obj.ValueExpr.Code);
                    $.each(this.Bot.curCtrl.CardFields.$values, function (l, obj1) {
                        var str2 = "parseFloat(" + this.getValueInDiv($card.find('.data-' + obj1.Name)) + ")";
                        if (!(obj1.ObjType === 'CardNumericField'))
                            str2.replace("parseFloat", "");
                        strFunc = strFunc.replace(new RegExp('card.' + obj1.Name, 'g'), str2);
                    }.bind(this));
                    var newFunc = Function("$card", strFunc);
                    propval = newFunc($card).toString();
                    this.setValueInDiv($card.find('.data-' + obj.Name), propval);
                }
                else {
                    propval = this.getValueInDiv($card.find('.data-' + obj.Name));
                }
                if (obj.ObjType === 'CardNumericField')
                    sObj[obj.Name] = parseFloat(propval);
                else
                    sObj[obj.Name] = propval;
            }
        }.bind(this));
        this.SelectedCards.push(sObj);
        this.Bot.curCtrl.SelectedCards.push(parseInt($card.attr('card-id')));
        this.drawSummaryTable($card.closest('.cards-cont').next().find('.table tbody'));
        this.setCardFieldValues($card);
    };
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
                    trhtml += "<td " + (isNum ? "style='text-align: right;'" : "") + ">" + (isNum ? obj[obprop].toFixed(2) : obj[obprop]) + "</td>";
                }
            }
            trhtml += "<td><i class='fa fa-trash-o remove-cart-item' aria-hidden='true' style='cursor: pointer;'></i></td></tr>";
            $tbody.append(trhtml);
        }.bind(this));

        var sumhtml = "<tr style='font-size: 14px;font-weight: 600;'><td style='padding-left:10%;font-size: 13.3px;' colspan=" + tcols + ">";
        let i = 0;
        $.each(this.sumFieldsName, function (fi, fn) {
            var sum = 0.0;
            $.each(this.SelectedCards, function (k, obj) {
                sum += parseFloat(obj[fn]);
            }.bind(this));
            sumhtml += "Total&nbsp" + this.sumFieldsLabel[i] + ":&nbsp&nbsp" + sum.toFixed(2) + "<br/>";
            i++;
        }.bind(this));
        if (this.sumFieldsName.length !== 0)
            $tbody.append(sumhtml + "</tr></td>");

        $('.remove-cart-item').off('click').on('click', function (evt) {
            var cardid = $(evt.target).closest('tr').attr('card-id');
            this.spliceCardArray(cardid);
            $('#' + this.Bot.curCtrl.EbSid).find(".card-cont[card-id='" + cardid + "']").find(".card-selbtn-cont .btn").html('Select <i class="fa fa-check" style="color: green; display: inline-block;" aria-hidden="true"></i>');
            $($('#' + this.Bot.curCtrl.EbSid).find(".card-cont[card-id='" + cardid + "']").find(".card-title-cont").children()[0]).hide();
            this.drawSummaryTable($(evt.target).closest('tbody'));
        }.bind(this));
    };
    this.spliceCardArray = function (cardid) {
        cardid = cardid.toString();
        for (let i = 0; i < this.SelectedCards.length; i++) {
            if (this.SelectedCards[i]['cardid'] === cardid) {
                this.SelectedCards.splice(i, 1);
                break;
            }
        }
        for (let i = 0; i < this.Bot.curCtrl.SelectedCards.length; i++) {
            if (this.Bot.curCtrl.SelectedCards[i] === cardid) {
                this.Bot.curCtrl.SelectedCards.splice(i, 1);
                break;
            }
        }
    };
    this.getValueInDiv = function ($itemdiv) {
        if ($itemdiv.children().length === 0 || $($itemdiv.children()[0]).hasClass('fa-check'))
            return $itemdiv.text().trim();
        else
            return $itemdiv.children().find('input').val();
    };
    this.setValueInDiv = function ($itemdiv, value) {
        if ($itemdiv.children().length === 0)
            $itemdiv.text(value);
        else
            $itemdiv.children().find('input').val(value);
    };

    this.setCardFieldValues = function ($card) {
        var cardId = parseInt($card.attr('card-id'));
        var card = this.getCardReference(cardId);
        if (card === null)
            return;
        $.each(this.Bot.curCtrl.CardFields.$values, function (k, fObj) {
            if (!fObj.DoNotPersist) {
                var fVal = this.getValueInDiv($card.find('.data-' + fObj.Name));
                //fObj.ebDbType always returns 16 <string>!!! if ebDbType return correct value then this checking can be avoided
                if (fObj.ObjType === 'CardNumericField')
                    card.CustomFields.$values[fObj.Name] = parseFloat(fVal);
                else
                    card.CustomFields.$values[fObj.Name] = fVal;
            }
        }.bind(this));
    };
    this.getCardReference = function (cardid) {
        var card = null;
        $.each(this.Bot.curCtrl.CardCollection.$values, function (k, cardObj) {
            if (cardObj.CardId === cardid) {
                card = cardObj;
                return;
            }
        }.bind(this));
        return card;
    };
    this.resetSelectedCardDisplay = function ($Ctrl) {
        //reset cardset for reopening
        this.Bot.curCtrl.SelectedCards = [];
        $.each($Ctrl.find(".card-selbtn-cont .btn"), function (h, elemt) {
            $(elemt).html('Select <i class="fa fa-check" style="color: green; display: inline-block;" aria-hidden="true"></i>');
            $($(elemt).parent().siblings('.card-title-cont').children()[0]).hide();
        });
        this.drawSummaryTable($Ctrl.find(".table tbody"));
    };

    this.CtrlObj.getValueFromDOM = function () {
        var resObj = {};
        var isPersistAnyField = false;
        $.each(this.CtrlObj.CardFields.$values, function (h, fObj) {
            if (!fObj.DoNotPersist) {
                isPersistAnyField = true;
            }
        }.bind(this));

        if (!this.CtrlObj.MultiSelect && isPersistAnyField) {
            this.$Ctrl.find('.slick-current .card-selbtn-cont .btn').click();
        }
        if (isPersistAnyField) {
            $.each(this.CtrlObj.CardCollection.$values, function (k, cObj) {
                if (this.CtrlObj.SelectedCards.indexOf(cObj.CardId) !== -1) {
                    var tempArray = new Array();
                    $.each(this.CtrlObj.CardFields.$values, function (h, fObj) {
                        if (!fObj.DoNotPersist) {
                            tempArray.push(new Object({ Value: cObj.CustomFields.$values[fObj.Name], Type: fObj.EbDbType, Name: fObj.Name }));
                        }
                    }.bind(this));
                    resObj[cObj.CardId] = tempArray;
                }
            }.bind(this));
        }
        return JSON.stringify(resObj);

    }.bind(this);

    this.CtrlObj.getDisplayMemberFromDOM = function () {
        //let Obj = this.Bot.getCardsetValue(this.CtrlObj);
        //return this.Bot.curDispValue;
        return '';
    }.bind(this);

    this.CtrlObj.getDataModel = function () {
        let dataModel = [];
        //if (!this.CtrlObj.MultiSelect) {
        //    this.$Ctrl.find('.slick-current .card-selbtn-cont .btn').click();
        //}
        $.each(this.CtrlObj.CardCollection.$values, function (k, cObj) {
            if (this.CtrlObj.SelectedCards.indexOf(cObj.CardId) !== -1) {
                let dataRow = { RowId: 0, Columns: [] };
                dataRow.Columns.push({ Name: 'card_id', Type: 7, Value: cObj.CardId });
                $.each(this.CtrlObj.CardFields.$values, function (h, fObj) {
                    if (!fObj.DoNotPersist) {
                        dataRow.Columns.push({ Name: fObj.Name, Type: fObj.EbDbType, Value: cObj.CustomFields.$values[fObj.Name] });
                    }
                }.bind(this));
                dataModel.push(dataRow);
            }
        }.bind(this));
        return dataModel;
    }.bind(this);

    this.minusClick = function () {
        let $e = $(event.target).closest(".mns");
        let $input = $e.closest(".inp-wrap").find(".cart-inp");
        let num = parseFloat($input.val());
        let limit = parseFloat($e.closest(".card-pls-mns").attr("limit"));
        if (num > limit) {
            $input.val(num - 1);
            $e.parents('.card-numeric-cont').attr('data-value', num - 1);
        }
    }.bind(this);

    this.plusClick = function () {
        let $e = $(event.target).closest(".pls");
        let $input = $e.closest(".inp-wrap").find(".cart-inp");
        let num = parseFloat($input.val());
        let limit = parseFloat($e.closest(".card-pls-mns").attr("limit"));

        if (num < limit) {
            $input.val(num + 1);
            $e.parents('.card-numeric-cont').attr('data-value', num + 1);
        }

    }.bind(this);

    this.initCards(this.$Ctrl);

};