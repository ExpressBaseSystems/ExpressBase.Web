var EbItemListControl = function (options) {
    this.options = $.extend({
        contSelector: '#demodiv',
        multiSelect: false,
        imageUrl: '/images/dp/',
        imageAlternate: '/images/nulldp.png',
        itemList: [
            { vm: 1, dm1: 'Test', img: '2' },
            { vm: 2, dm1: 'Text', img: '2' },
            { vm: 3, dm1: 'Demo', img: '2' },
            { vm: 4, dm1: 'Word', img: '2' }
        ]
    }, options);


    this.init = function () {
        this.drawControl();
    };

    this.drawControl = function () {
        this.$cont = $(`<div class="user-list-ctrl">
                                <div class="ulstc-disp-c">
                                    <div class="ulstc-disp-img-c" style="background-image: url(${this.options.imageAlternate});"></div>
                                    <div class="ulstc-disp-txt" style='color: #aaa;'> - Select - </div>
                                    <i class="fa fa-sort-desc" aria-hidden="true" style="margin-left: auto;padding: 3px 10px;min-height: 26px;"></i>
                                </div>
                                <div class="ulstc-list-c">
                                    <div class="ulstc-list-srch">
                                        <span><i class="fa fa-search"></i></span>
                                        <input type="text" placeholder="Type to search..." />
                                    </div>
                                    <div class="ulstc-list-ul"></div>
                                </div>
                            </div>`);
        $(this.options.contSelector).empty();
        $(this.options.contSelector).append(this.$cont);
        this.$dispCont = this.$cont.find('.ulstc-disp-c');
        this.$popCont = this.$cont.find('.ulstc-list-c');
        this.$txtSrch = this.$cont.find('.ulstc-list-srch input');
        this.$ul = this.$cont.find('.ulstc-list-ul');

        for (let i = 0; i < this.options.itemList.length; i++) {
            let $li = $(`<div class="ulstc-list-li">
                            <div class="ulstc-disp-img-c" style="background-image:url(${this.options.imageUrl + this.options.itemList[i]['img']}.png), url(${this.options.imageAlternate});"></div>
                            <div class="ulstc-disp-txt">${this.options.itemList[i]['dm1']}</div>
                        </div>`);
            $li.data('data-obj', this.options.itemList[i]);
            this.$ul.append($li);
        }

        this.$txtSrch.on('focusout', function (e) {
            this.$popCont.hide();
        }.bind(this));

        this.$dispCont.on('click', function (e) {
            this.$popCont.toggle();
            this.$txtSrch.focus();
        }.bind(this));

        this.$ul.children('.ulstc-list-li').on('mousedown', function (e) {
            this.onListItemSelect($(e.target).closest('.ulstc-list-li'));
        }.bind(this));

        this.$txtSrch.on('keyup', function (e) {
            this.onTxtSrchKeydown(e);
        }.bind(this));
    };

    this.onListItemSelect = function ($ele) {
        let itemO = $ele.data('data-obj');

        let $disp = $(`<div style="display: inherit;">
                            <div class="ulstc-disp-img-c" style="background-image:url(${this.options.imageUrl + itemO['img']}.png), url(${this.options.imageAlternate});"></div>
                            <div class="ulstc-disp-txt">${itemO['dm1']}</div>
                        </div>`);
        this.$dispCont.data('data-obj', itemO);
        this.$dispCont.children('div').remove();
        this.$dispCont.prepend($disp);
        this.$dispCont.next().toggle();
    };

    this.onTxtSrchKeydown = function (e) {
        let $liAct = this.$ul.find('.active');
        if ($liAct.length === 0) {
            if (e.keyCode === 40) {
                this.$ul.children().first(':visible').addClass('active');
            }
            else if (e.keyCode === 38) {
                this.$ul.children().last(':visible').addClass('active');
                this.$ul.scrollTop(this.$ul[0].scrollHeight);
            }
        }
        else {
            if (e.keyCode === 40) {
                if ($liAct.nextAll(':visible').first().length > 0) {
                    let $newLiAct = $liAct.nextAll(':visible').first();
                    $newLiAct.addClass('active');
                    $liAct.removeClass('active');
                    this.$ul.scrollTop($newLiAct.offset().top - $(this.$ul.children(':visible')[0]).offset().top - 70);
                }
            } else if (e.keyCode === 38) {
                if ($liAct.prevAll(':visible').first().length > 0) {
                    let $newLiAct = $liAct.prevAll(':visible').first();
                    $newLiAct.addClass('active');
                    $liAct.removeClass('active');
                    this.$ul.scrollTop($newLiAct.offset().top - $(this.$ul.children(':visible')[0]).offset().top - 70);
                }
            }
            else if (e.keyCode === 13) {
                this.onListItemSelect($liAct);
            }
        }
       
        if (e.keyCode !== 13 && e.keyCode !== 38 && e.keyCode !== 40) {
            let $liAll = this.$ul.children();
            let srchVal = this.$txtSrch.val() || '';
            srchVal = srchVal.toLowerCase();
            if (this.srchValOld !== srchVal) {
                this.srchValOld = srchVal;
                for (let i = 0; i < $liAll.length; i++) {
                    let itemO = $($liAll[i]).data('data-obj');
                    if (itemO['dm1'].toLowerCase().search(srchVal) === -1)
                        $($liAll[i]).hide();
                    else
                        $($liAll[i]).show();
                }
                $liAct.removeClass('active');
                this.$ul.children(':visible').first().addClass('active');
            }
        }
    };

    this.setValue = function (p1, p2) {
        for (let i = 0; i < this.UserList.$values.length; i++) {
            if (this.UserList.$values[i]['vm'].toString() === p1.toString()) {
                let $dispC = $(`#cont_${this.EbSid_CtxId}`).find('.ulstc-disp-c');
                $dispC.data('data-obj', this.UserList.$values[i]);
                $dispC.children('div').remove();
                $dispC.prepend(`<div style="display: inherit;">
                                    <div class="ulstc-disp-img-c" style="background-image:url(/images/dp/${this.UserList.$values[i]['img']}.png), url(/images/nulldp.png);"></div>
                                    <div class="ulstc-disp-txt">${this.UserList.$values[i]['dm1']}</div>
                                </div>`);
                break;
            }
        }
    };

    this.getValue = function (p1) {
        let itemO = $(`#cont_${this.EbSid_CtxId}`).find('.ulstc-disp-c').data('data-obj');
        if (itemO)
            return itemO['vm'];
        else
            return '';
    };

    this.init();
};