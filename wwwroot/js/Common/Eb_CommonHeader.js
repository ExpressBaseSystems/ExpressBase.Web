try {
    var EbHeader = function () {
        var _objName = $(".EbHeadTitle #objname");
        var _btnContainer = $(".comon_header_dy #obj_icons");
        var _layout = $("#layout_div");
        var _nCounter = $(".comon_header_dy #notification-count,.objectDashB-toolbar #notification-count");

        this.insertGlobalSearch = function () {
            $(document).mouseup(this.hideDDclickOutside.bind(this));//hide DD when click outside select or DD

            $('body').prepend(`
<div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <div class='srch-hdr-cont'>
            <div class='srch-hdr-wrpr'>
                <input type='text' tabindex="1" class='srch-bx'/>
                <div tabindex='1' class="srch-btn"><i class="fa fa-search"></i></div>
            </div>
        </div>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <div class='srch-body-cont'>
            The Kerala excise department has ordered to immediately freeze the sale of three batches of 'Jawan XXX Rum', manufactured on July 20, after a chemical test found the alcohol content to be high. In the sample test, the alcohol by volume was found to be 39.09% v/v, 38.31% v/v, and 39.14% v/v. Hence, the order was issued to freeze the sale of liquor batches 245, 246, and 247. The Excise Commissioner has issued notices to Deputy Excise Commissioners in all divisions in this regard. Some people, who had consumed alcohol from a bar hotel at Mukkam in Kozhikode last week, had complained of uneasiness. A complaint was also filed with the excise
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>`);
            $(window).off("keydown.ebsearch").on("keydown.ebsearch", function () {
                if (event.ctrlKey || event.metaKey) {// ctrl + s - save form
                    if (event.which === 81) {
                        $('#exampleModalCenter').modal('show');
                    }
                }
            });

            $('#notificaionandprofile').prepend(`
<div class='toolb-srchbx-wrpr'>
    <input type='text' class='toolb-srchbx'/>
    <button id="platformsearch" class="btn" data-toggle="modal" data-target="#exampleModalCenter__" title="search"><i class="fa fa-search" aria-hidden="true"></i></button>
    <div class="search-dd">

<div class="srch-body-cont"></div>


    </div>
<div class="eb_common_loader" id="srch_loader"></div>
</div>`);

            this.$toolbSrchBx = $('.toolb-srchbx');
            this.$srchWrap = $('.toolb-srchbx-wrpr');

            $('#exampleModalCenter').on('shown.bs.modal', function (e) {
                $('#exampleModalCenter .srch-bx').focus();
            });

            //$('#exampleModalCenter .srch-btn').on('click', this.platformSearch);
            $('#platformsearch').on('click', this.platformSearch);

            this.$toolbSrchBx.on('focus', function () {
                $('.search-dd').slideDown(100);
            }.bind(this));

            this.$toolbSrchBx.on('keyup', function () {
                this.isSimpleSearch = true;
                if (event.keyCode === 13)
                    this.platformSearch();
                else if (event.keyCode === 27)
                    $('.search-dd').slideUp(50);
            }.bind(this));

            $('.srch-li').on('keyup', function () {
                if (event.keyCode === 13)
                    this.platformSearch();
            }.bind(this));

            //$('#exampleModalCenter .srch-bx').on('keyup', function () {
            //this.isSimpleSearch = false;
            //    if (event.keyCode === 13)
            //        this.platformSearch();
            //}.bind(this));
        }.bind(this);

        this.scrollList = function () {
            var list = document.querySelector('.srch-ul-outer'); // targets the <ul>
            var first = list.querySelector('.srch-li'); // targets the first <li>
            var maininput = this.$toolbSrchBx[0];  // targets the input, which triggers the functions populating the list
            document.onkeydown = function (e) { // listen to keyboard events
                switch (e.keyCode) {
                    case 38: // if the UP key is pressed
                        if (document.activeElement == maininput) {
                            break;
                        } // stop the script if the focus is on the input or first element
                        else if (document.activeElement == first.querySelector('.ctrldtlsWrap')) {
                            maininput.focus();
                        } // stop the script if the focus is on the input or first element
                        else {
                            let prevSibling = $(document.activeElement).closest('.srch-li').prev()[0] || $(document.activeElement).closest('.collapse').prev().prev().find('.srch-li:last')[0];
                            if (prevSibling)
                                prevSibling.querySelector('.ctrldtlsWrap').focus();
                        } // select the element before the current, and focus it
                        break;
                    case 40: // if the DOWN key is pressed
                        if (document.activeElement == maininput) {
                            first.querySelector('.ctrldtlsWrap').focus();
                        } // if the currently focused element is the main input --> focus the first <li>
                        else {
                            let nextSibling = $(document.activeElement).closest('.srch-li').next()[0] || $(document.activeElement).closest('.collapse').next().next().find('.srch-li:first')[0];
                            if (nextSibling)
                                nextSibling.querySelector('.ctrldtlsWrap').focus();
                        } // target the currently focused element -> <a>, go up a node -> <li>, select the next node, go down a node and focus it
                        break;
                }
            }
        }

        this.platformSearch = function () {
            let $srch = this.isSimpleSearch ? this.$toolbSrchBx : $('#exampleModalCenter .srch-bx');
            let searchkey = $srch.val().replace('\\n', '');
            if (searchkey.trim() !== '' && $srch.data('lastKey') !== searchkey) {
                //do ajax call
                $('.search-dd').slideUp(100);
                this.getSearchResult(searchkey);
                //this.drawResultList.bind(this, searchkey)();
                $srch.data('lastKey', searchkey);
            }
        }.bind(this);

        this.getSearchResult = function (searchkey) {
            $("#srch_loader").EbLoader("show", { maskItem: { Id: ".search-dd" } });
            $.ajax({
                type: "POST",
                url: "/WebForm/SearchInPlatform4FormData",
                data: {
                    key: searchkey
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    $("#srch_loader").EbLoader("hide", { maskItem: { Id: ".search-dd" } });
                    EbMessage("show", { Message: `Something Unexpected Occurred while searching`, AutoHide: true, Background: '#aa0000' });
                }.bind(this),
                success: this.drawResultList.bind(this, searchkey)
            });
        }.bind(this);

        this.drawResultList = function (searchkey, data = `{ "RowCount": 12, "Data": [{"DisplayName":"Common test 2020-10-27","Data":{"textbox1":"hass ","textbox2":"gggffded"},"Link":"../WebForm/Index?refid=hairocraft_stagging-hairocraft_stagging-0-1914-2119-1914-2119&_params=W3siTmFtZSI6ImlkIiwiVHlwZSI6IjciLCJWYWx1ZSI6IjkiLCJWYWx1ZVRvIjo5LjAsIlJlcXVpcmVkIjp0cnVlfV0=&_mode=1","CreatedBy":"Febin","CreatedAt":"23-11-2020 11:31 PM","ModifiedBy":"Febin","ModifiedAt":"23-11-2020 11:31 PM"},{"DisplayName":"Common test 2020-10-27 d","Data":{"textbox1":"hass ","textbox2":"gggffded"},"Link":"../WebForm/Index?refid=hairocraft_stagging-hairocraft_stagging-0-1914-2119-1914-2119&_params=W3siTmFtZSI6ImlkIiwiVHlwZSI6IjciLCJWYWx1ZSI6IjkiLCJWYWx1ZVRvIjo5LjAsIlJlcXVpcmVkIjp0cnVlfV0=&_mode=1","CreatedBy":"Febin","CreatedAt":"23-11-2020 11:31 PM","ModifiedBy":"Febin","ModifiedAt":"23-11-2020 11:31 PM"},{"DisplayName":"Common test 2020-10-27 d","Data":{"textbox1":"hass ","textbox2":"gggffded"},"Link":"../WebForm/Index?refid=hairocraft_stagging-hairocraft_stagging-0-1914-2119-1914-2119&_params=W3siTmFtZSI6ImlkIiwiVHlwZSI6IjciLCJWYWx1ZSI6IjkiLCJWYWx1ZVRvIjo5LjAsIlJlcXVpcmVkIjp0cnVlfV0=&_mode=1","CreatedBy":"Febin","CreatedAt":"23-11-2020 11:31 PM","ModifiedBy":"Febin","ModifiedAt":"23-11-2020 11:31 PM"},{"DisplayName":"Common test 2020-10-27 d","Data":{"textbox1":"hass ","textbox2":"gggffded"},"Link":"../WebForm/Index?refid=hairocraft_stagging-hairocraft_stagging-0-1914-2119-1914-2119&_params=W3siTmFtZSI6ImlkIiwiVHlwZSI6IjciLCJWYWx1ZSI6IjkiLCJWYWx1ZVRvIjo5LjAsIlJlcXVpcmVkIjp0cnVlfV0=&_mode=1","CreatedBy":"Febin","CreatedAt":"23-11-2020 11:31 PM","ModifiedBy":"Febin","ModifiedAt":"23-11-2020 11:31 PM"},{"DisplayName":"Common test 2020-10-27","Data":{"textbox1":"hass ","textbox2":"gggffded"},"Link":"../WebForm/Index?refid=hairocraft_stagging-hairocraft_stagging-0-1914-2119-1914-2119&_params=W3siTmFtZSI6ImlkIiwiVHlwZSI6IjciLCJWYWx1ZSI6IjkiLCJWYWx1ZVRvIjo5LjAsIlJlcXVpcmVkIjp0cnVlfV0=&_mode=1","CreatedBy":"Febin","CreatedAt":"23-11-2020 11:31 PM","ModifiedBy":"Febin","ModifiedAt":"23-11-2020 11:31 PM"},{"DisplayName":"karikku m","Data":{"numeric2":"0","textbox1":"","textbox3":"hair"},"Link":"../WebForm/Index?refid=hairocraft_stagging-hairocraft_stagging-0-1114-1265-1114-1265&_params=W3siTmFtZSI6ImlkIiwiVHlwZSI6IjciLCJWYWx1ZSI6IjI3MSIsIlZhbHVlVG8iOjI3MS4wLCJSZXF1aXJlZCI6dHJ1ZX1d&_mode=1","CreatedBy":"jith","CreatedAt":"24-11-2020 12:13 PM","ModifiedBy":"jith","ModifiedAt":"24-11-2020 12:13 PM"},{"DisplayName":"wiz test","Data":{"numeric1":"555","textbox1":"hair creame"},"Link":"../WebForm/Index?refid=hairocraft_stagging-hairocraft_stagging-0-1928-2133-1928-2133&_params=W3siTmFtZSI6ImlkIiwiVHlwZSI6IjciLCJWYWx1ZSI6IjEiLCJWYWx1ZVRvIjoxLjAsIlJlcXVpcmVkIjp0cnVlfV0=&_mode=1","CreatedBy":"jith","CreatedAt":"24-11-2020 12:18 PM","ModifiedBy":"jith","ModifiedAt":"24-11-2020 12:18 PM"}]}`) {
            data = JSON.parse(data);
            let dataItems = data.Data;
            let DataItemsG = groupBy(data.Data.sort((a, b) => (a.DisplayName > b.DisplayName) ? 1 : ((b.DisplayName > a.DisplayName) ? -1 : 0)), 'DisplayName');
            let $cont = this.isSimpleSearch ? $('.search-dd > .srch-body-cont') : $('.srch-body-cont > .srch-body-cont');
            $('.srch-body-cont').empty();


            let html = `
                        <div class="srch-header">
                            <div class='srch-header-title'><h5>Global Search</h5></div>
                            <div class='srch-grpby-wraper'><div class='srch-header-grpby'>Group by</div></div>
                        </div>
                        <ul class="srch-ul-outer">`;

            if (dataItems.length > 0) {
                $.each(DataItemsG, function (formName, items) {
                    html += this.getUlHtml(items, true);
                }.bind(this));
            }
            else {

                html += `<li class="srch-li">
                        <div class='srch-li-block'>
                            <h4><a class='srch-res-a' tabindex="1"> No match found :(</a></h4>
                            <div class="ctrldtlsWrap">Try some other keyword</div>
                        </div>
                    </li>`;
            }

            html += `   </ul>
                        <div class="srch-header srch-footer">
                            <div class='srch-footer-summary'>${dataItems.length} / ${data.RowCount} matches</div>
                        </div>`;

            //$('.srch-body-cont').append(html);
            $cont.append(html);
            $('.search-dd').slideDown(100);
            modifyTextStyle('.srch-body-cont .value', RegExp(searchkey, 'gi'), 'background-color:yellow;border-radius: 4px;padding: 0 1px;');
            $("#srch_loader").EbLoader("hide", { maskItem: { Id: ".search-dd" } });
            this.scrollList();
            $('.srch-li').on('click', function () { event.target.closest('.srch-li').querySelector('.ctrldtlsWrap').focus() });
        };

        this.getUlHtml = function (dataItems, hideHead) {
            let idfromDN = dataItems[0].DisplayName.replace(/ /g, '_') + '_li';
            let html =
                `<li data-toggle="collapse" href="#${idfromDN}" role="button" aria-expanded="true" aria-controls="${idfromDN}">
                <h5 class='srch-res-a'  tabindex="1"><i class="fa fa-caret-right" aria-hidden="true"></i> &nbsp; ${dataItems[0].DisplayName} (${dataItems.length})</h5>
            </li>
            <li id='${idfromDN}' class='collapse in'>
                <ul class="srch-ul">`;
            $.each(dataItems, function (i, obj) {
                let j = 0;
                let modifiedAtarr = obj.ModifiedAt.split(' ');
                let createdAtArr = obj.CreatedAt.split(' ');
                html += `
                    <li class="srch-li"  ondblclick="window.open('${obj.Link}', '_blank')">
                        <div class='srch-li-block'>
                            <div class="ctrldtlsWrap" tabindex='0' onkeyup='if(event.keyCode === 13) event.target.click();' onclick="window.open('${obj.Link}', '_blank')">
                                <div class='row'>`;
                $.each(obj.Data, function (name, val) {
                    html += `
                                    <div class='keyval-cont col-xs-6 col-sm-4 col-md-4 col-lg-3 col-xl-2'>
                                        <div class='keyval-wrap'>
                                            <div class='key'>${name}</div>
                                            <div class='value'>${(val === "" ? "&nbsp;" : val)}</div>
                                        </div>
                                    </div>`;
                    if (j === 12)
                        return false;
                });
                html += `
                                </div>
                            </div>

                            <div class="metadtlsWrap">
                                <div class='metadtls'>
                                    <div> <span class='metaval'>Created by ${obj.CreatedBy} on ${createdAtArr[0]}</span></div>
                                    <div> <span class='metaval'>Last updated by ${obj.ModifiedBy} on ${modifiedAtarr[0]}</span></div>
                                </div>
                            </div>
                        </div>`;
                html += '   </li>'
            });
            return `${html}
                </ul>
            </li>`;
        };

        this.hideDDclickOutside = function (e) {
            if ((!this.$srchWrap.is(e.target) && this.$srchWrap.has(e.target).length === 0)) {
                $('.search-dd').slideUp(100);
            }
        };

        this.addRootObjectHelp = function (obj) {
            let AvailableDocs = { isPdf: (obj.Info && (!!obj.Info.trim())), isVideo: (obj.InfoVideoURLs && obj.InfoVideoURLs.$values.length > 0) };

            if (AvailableDocs.isPdf || AvailableDocs.isVideo) {
                let html = `<button id="${obj.EbSid_CtxId}HelperBtn" class="btn" title="Info"><i class="fa ${obj.InfoIcon}" aria-hidden="true"></i></button>`;
                this.insertButton(html);

                let HelpHtml = `
            <div id='${obj.EbSid_CtxId}infoCont' class='eb-popup-cont'>
                <div class='eb-popup-head'>
                    <span>Help</span>
                    <div class="icon-cont  pull-right hclose">
                        <i class="fa fa-times"></i>
                    </div>
                    <div class="icon-cont  pull-right hnewt">
                        <i class="fa fa-share-square-o"></i>
                    </div>
                </div>
                <div class='eb-popup-body'>
                    <ul class="nav nav-tabs" id="myTab" role="tablist">
                      @pdfBtn@
                      @vidbtn@
                    </ul>
                    <div class="tab-content" id="myTabContent">
                        @pdfContent@
                        @vidContent@
                    </div>
                </div>
                <div class='hhandpad-r'></div>
                <div class='hhandpad-l'></div>
            </div>
            `;

                if (AvailableDocs.isPdf) {
                    let docbtn = `
              <li class="nav-item @active@">
                <a class="nav-link" id="${obj.EbSid_CtxId}-doctab" data-toggle="tab" href="#${obj.EbSid_CtxId}doc" role="tab" aria-controls="home" aria-selected="true">
                <i class="fa fa-file-text-o" aria-hidden="true"></i> Document
                </a>
              </li>`;

                    let docContent = `
              <div class="tab-pane fade @activein@"  id="${obj.EbSid_CtxId}doc" role="tabpanel" aria-labelledby="${obj.EbSid_CtxId}-doctab">
                <iframe id='${obj.EbSid_CtxId}info' class='obj-hlp-iframe' src="/files/${obj.Info}.pdf" title="Iframe Example"></iframe>
              </div>`;
                    HelpHtml = HelpHtml.replace('@pdfBtn@', docbtn).replace('@pdfContent@', docContent)
                }
                else {
                    HelpHtml = HelpHtml.replace('@pdfBtn@', '').replace('@pdfContent@', '')
                }

                if (AvailableDocs.isVideo) {
                    let vidbtn = `
              <li class="nav-item @active@">
                <a class="nav-link" id="${obj.EbSid_CtxId}-vidtab" vid-tab data-toggle="tab" href="#${obj.EbSid_CtxId}video" role="tab" aria-controls="profile" aria-selected="false">
                    <i class="icofont-ui-video-play"></i> Video
                </a>
              </li>`;
                    let vidContent = `
              <div class="tab-pane fade @activein@" id="${obj.EbSid_CtxId}video" is-video="true" role="tabpanel" aria-labelledby="${obj.EbSid_CtxId}-tab">
                ${this.getVidTabsHtml(obj)}
              </div>`;
                    HelpHtml = HelpHtml.replace('@vidbtn@', vidbtn).replace('@vidContent@', vidContent)
                }
                else {
                    HelpHtml = HelpHtml.replace('@vidbtn@', '').replace('@vidContent@', '')
                }

                HelpHtml = HelpHtml.replace('@activein@', 'active in').replace('@activein@', '')
                    .replace('@active@', 'active').replace('@active@', '');

                $("body").append(HelpHtml);

                this.$infoModal = $(`#${obj.EbSid_CtxId}infoCont`);

                this.$infoModal.draggable({
                    handle: ".eb-popup-head",
                    stop: this.infoModalStop
                });

                this.$infoModal.resizable({
                    //aspectRatio: true,
                    handles: "sw, se, nw, ne"
                });


                $(`#${obj.EbSid}HelperBtn`).on("click", function () {
                    this.$infoModal.toggle();
                }.bind(this));

                $('a[data-toggle="tab"][vid-tab]').on('shown.bs.tab', function (e) {
                    let $e = $(e.target); // newly activated tab
                    $activetab = $('.info-tab-body li.active > a');
                    $($activetab.attr("href")).addClass('active').addClass('in');
                });


                $(`#${obj.EbSid}infoCont .hclose`).on("click", this.objhelpHide);
                $(`#${obj.EbSid}infoCont .eb-popup-head`).on("dblclick", this.objhelpHide);


                $(`#${obj.EbSid}infoCont .hnewt`).on("click", function () {
                    let extURL;
                    if ($(`#${obj.EbSid}infoCont .tab-pane.active`).attr('is-video') === "true") {
                        extURL = getObjByval(obj.InfoVideoURLs.$values, "EbSid", $('.info-tab-body .nav-item.active a').attr('id').replace(/\-vidtab$/, '')).URL
                    }
                    else {
                        extURL = `/files/${obj.Info}.pdf`;
                    }
                    window.open(extURL, '_blank');
                }.bind(this));
            }
        };

        this.objhelpHide = function () {
            this.$infoModal.hide();
        }.bind(this)

        this.getVidTabsHtml = function (obj) {
            let vidbtn = "";
            let vidContents = "";
            for (let i = 0; i < obj.InfoVideoURLs.$values.length; i++) {
                let URL = obj.InfoVideoURLs.$values[i];

                if (URL.Hide)
                    continue;
                let vidId = URL.URL.substring(URL.URL.lastIndexOf("/embed/") + 7, URL.URL.length);

                if (vidId.includes('?'))
                    vidId = vidId.substring(0, vidId.indexOf('?'));
                vidbtn += `
              <li class="nav-item @active@">
                <a class="nav-link" id="${URL.EbSid}-vidtab" data-toggle="tab" href="#${URL.EbSid}video" role="tab" aria-controls="profile" aria-selected="false">
                    <img src='https://img.youtube.com/vi/` + vidId + `/hqdefault.jpg' alt=" ${URL.Title}" height="80"></br>
                    <div class='btn-title'>${URL.Title}</div>
                </a>
              </li>`;

                vidContents += `
              <div class="tab-pane fade @activein@" id="${URL.EbSid}video" is-video="true" role="tabpanel" aria-labelledby="${URL.EbSid}-tab">
                <iframe src="${URL.URL}" class='obj-hlp-iframe' frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              </div>`;
            }


            let tabBody = `
                <div class='info-tab-body v-tab'>
                    <ul class="nav nav-tabs" id="myTab" role="tablist">
                      ${vidbtn}
                    </ul>
                    <div class="tab-content" id="myTabContent">
                        ${vidContents}
                    </div>
                </div>
            `.replace('@activein@', 'active in').replace(/@activein@/g, '')
                .replace('@active@', 'active').replace('@active@', '');

            return tabBody;
        }

        this.infoModalStop = function () {
            this.$infoModal.attr("dragging", "true");
            if (parseInt(this.$infoModal.css("top").trim("px")) <= 0)
                this.$infoModal.css("top", "5px");
            if (parseInt(this.$infoModal.css("top").trim("px")) >= window.innerHeight)
                this.$infoModal.css("top", "0px");
            if (parseInt(this.$infoModal.css("left").trim("px")) >= window.innerWidth || parseInt(this.$infoModal.css("left").trim("px")) < 20 - this.$infoModal.width()) {
                this.$infoModal.css("left", "auto");
                this.$infoModal.css("right", "0px");
            }

            this.$infoModal.find(`.eb-popup-head .pgcorner`).show(100);
        }.bind(this);

        this.insertButton = function ($html) {
            _btnContainer.prepend(`${$html}`);
        };

        this.setName = function (name) {
            _objName.text(`${name}`);
        };

        this.setNameAsHtml = function (html) {
            _objName.html(`${html}`);
        };

        this.setMode = function (html) {
            _objName.append(`${html}`);
        };

        this.setFormMode = function (html) {
            _objName.find("span").remove();
            _objName.append(`${html}`);
        };

        this.hideElement = function (collectionofIds) {
            collectionofIds.forEach(function (item, i) {
                _btnContainer.find("#" + item).hide();
            }.bind(this));
        };

        this.showElement = function (collectionofIds) {
            collectionofIds.forEach(function (item, i) {
                _btnContainer.find("#" + item).show();
            }.bind(this));
        };

        this.clearHeader = function () {
            _btnContainer.empty();
        };

        this.setLocation = function (t) {
            $("#LocInfoCr_name").text(t);
        };

        this.setLocation_type = function (t) {
            $("#LocInfoCr_type").text(t);
        };

        this.updateNCount = function (count) {
            _nCounter.text(count);
            if (count > 0)
                _nCounter.show();
            else
                _nCounter.hide();
        };

        _layout.data("EbHeader", this);


        //window.onerror = function (msg, url, lineNo, columnNo, error) {
        //    var string = msg.toLowerCase();//script error--When an error occurs in a script, loaded from a different origin, 
        //    var message = {
        //        'Error_Message': msg,
        //        'URL': url,
        //        'Line': lineNo,
        //        'Column': columnNo,
        //        'Error_object': error
        //    }

        //    if (window.location.pathname != ("/SupportTicket/bugsupport") && window.location.pathname != ("/SupportTicket/EditTicket")) {

        //        $.ajax({
        //            url: "../Security/BrowserExceptions",
        //            data: { errorMsg: JSON.stringify(message) },
        //            cache: false,
        //            type: "POST"
        //        });

        //    }
        //    return false;
        //};


    };
}
catch (er) {
    if (window.location.pathname != ("/SupportTicket/bugsupport") && window.location.pathname != ("/SupportTicket/EditTicket")) {

        var message = {
            'Error_Message': er.stack,
            'URL': "",
            'Line': "",
            'Column': "",
            'Error_object': ""
        }
        $.ajax({
            url: "../Security/BrowserExceptions",
            data: { errorMsg: JSON.stringify(message) },
            cache: false,
            type: "POST"
        });

        if (confirm("An error occured while setting headers, do you want to report it?")) {
            window.location = '/SupportTicket/bugsupport';
        } else {
            window.location = "/Tenantuser/Logout"
        }

    }
}