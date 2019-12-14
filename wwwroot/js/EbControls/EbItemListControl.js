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
    this.ctrl = null;

    this.init = function () {
        this.drawControl();
    };

    this.drawControl = function () {
        this.$cont = $(`<div class="user-list-ctrl">
                                <div id="${this.options.EbSid_CtxId}" class="ulstc-disp-c">
                                    <div class="ulstc-disp-img-c" style="background-image: url(${this.options.imageAlternate});"></div>
                                    <div class="ulstc-disp-txt" style='color: #aaa;'> - Select - </div>
                                    <i class="fa fa-sort-desc" aria-hidden="true" style="margin-left: auto;padding: 3px 10px;min-height: 26px;"></i>
                                </div>
                                <div class="ulstc-list-c">
                                    <div class="ulstc-list-srch">
                                        <span><i class="fa fa-search"></i></span>
                                        <input type="text" placeholder="Type to search..." style="padding-bottom: 0px !important;"/>
                                    </div>
                                    <div class="ulstc-note">Showing 0 of 0</div>
                                    <div class="ulstc-list-ul"></div>
                                </div>
                            </div>`);
        $(this.options.contSelector).empty();
        $(this.options.contSelector).append(this.$cont);
        this.$dispCont = this.$cont.find('.ulstc-disp-c');
        this.$popCont = this.$cont.find('.ulstc-list-c');
        this.$txtSrch = this.$cont.find('.ulstc-list-srch input');
        this.$ul = this.$cont.find('.ulstc-list-ul');
        this.$note = this.$cont.find('.ulstc-note');

        let i = 0, sc = 0;
        for (; i < this.options.itemList.length; i++) {
            //let $li = $(`<div class="ulstc-list-li">
            //                <div class="ulstc-disp-img-c" style="background-image:url(${this.options.imageUrl + this.options.itemList[i]['img']}.png), url(${this.options.imageAlternate});"></div>
            //                <div class="ulstc-disp-txt">${this.options.itemList[i]['dm1']}</div>
            //            </div>`);
            let $li = $(`<div class="ulstc-list-li">
                            <div class="ulstc-disp-img-c">
                                <img class='img-thumbnail' style='padding: 1px;' src='${this.options.imageAlternate}' onerror="this.src = '${this.options.imageAlternate}';" data-src="${this.options.imageUrl + this.options.itemList[i]['img']}.png" />
                            </div>
                            <div class="ulstc-disp-txt">${this.options.itemList[i]['dm1']}</div>
                        </div>`);
            if (i > 9)
                $li.hide();
            else
                sc++;
            $li.data('data-obj', this.options.itemList[i]);
            this.$ul.append($li);
        }
        this.$note.text("Showing " + sc + " of " + i);

        this.$txtSrch.on('focusout', function (e) {
            this.$popCont.hide();
        }.bind(this));

        this.$dispCont.on('click', function (e) {
            this.$popCont.toggle();
            this.$txtSrch.focus();
            this.$ul.children(':visible').find('img').Lazy();
        }.bind(this));

        this.$ul.children('.ulstc-list-li').on('mousedown', function (e) {
            this.onListItemSelect($(e.target).closest('.ulstc-list-li'));
        }.bind(this));

        this.$txtSrch.on('keyup', function (e) {
            this.onTxtSrchKeydown(e);
        }.bind(this));
    };

    this.onListItemSelect = function ($ele) {
        let oldItemO = this.$dispCont.data('data-obj');
        let itemO = $ele.data('data-obj');
        if (oldItemO && oldItemO['vm'] === itemO['vm'])
            return;
        let $disp = $(`<div style="display: inherit;">
                            <div class="ulstc-disp-img-c" style="background-image:url(${this.options.imageUrl + itemO['img']}.png), url(${this.options.imageAlternate});"></div>
                            <div class="ulstc-disp-txt">${itemO['dm1']}</div>
                        </div>`);
        this.$dispCont.data('data-obj', itemO);
        this.$dispCont.children('div').remove();
        this.$dispCont.prepend($disp);
        this.$dispCont.next().toggle();
        for (let j = 0; j < this.ctrl._onChangeFunction.length; j++)
            this.ctrl._onChangeFunction[j]();
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
                let i = 0, sc = 0, tc = 0;
                for (; i < $liAll.length; i++) {
                    let itemO = $($liAll[i]).data('data-obj');
                    if (itemO['dm1'].toLowerCase().search(srchVal) === -1 || sc > 9) {
                        $($liAll[i]).hide();
                        if (sc > 9)
                            tc++;
                    }
                    else {
                        $($liAll[i]).show();
                        sc++;
                        tc++;
                    }
                }
                $liAct.removeClass('active');
                this.$ul.children(':visible').first().addClass('active');
                this.$note.text("Showing " + sc + " of " + tc);
                this.$ul.children(':visible').find('img').Lazy();
            }
        }
    };

    this.setValue = function (p1, p2) {
        let $dispC = $(`#${this.EbSid_CtxId}`);
        let itemO = $dispC.data('data-obj');
        if (itemO && itemO['vm'].toString() === p1.toString())
            return;
        if (!p1 || p1.toString() === '') {
            if (itemO) {
                $dispC.children('div').remove();
                $dispC.prepend(`<div class="ulstc-disp-img-c" style="background-image: url(/images/nulldp.png);"></div>
                            <div id="${this.EbSid_CtxId}" class="ulstc-disp-txt" style='color: #aaa;'> - Select - </div>`);
                $dispC.removeData('data-obj');
                for (let j = 0; j < this._onChangeFunction.length; j++)
                    this._onChangeFunction[j]();
            }
            return;
        }

        for (let i = 0; i < this.UserList.$values.length; i++) {
            if (this.UserList.$values[i]['vm'].toString() === p1.toString()) {
                $dispC.data('data-obj', this.UserList.$values[i]);
                $dispC.children('div').remove();
                $dispC.prepend(`<div style="display: inherit;">
                                    <div class="ulstc-disp-img-c" style="background-image:url(/images/dp/${this.UserList.$values[i]['img']}.png), url(/images/nulldp.png);"></div>
                                    <div class="ulstc-disp-txt">${this.UserList.$values[i]['dm1']}</div>
                                </div>`);
                for (let j = 0; j < this._onChangeFunction.length; j++)
                    this._onChangeFunction[j]();
                break;
            }
        }
    };

    this.getValue = function (p1) {
        let itemO = $(`#${this.EbSid_CtxId}`).data('data-obj');
        if (itemO)
            return itemO['vm'];
        else
            return '';
    };
    this.getDisplayMember = function (p1, p2) {
        let itemO = $(`#${this.EbSid_CtxId}`).data('data-obj');
        if (itemO)
            return itemO;
        else
            return '';
    };
    
    this.init();
};