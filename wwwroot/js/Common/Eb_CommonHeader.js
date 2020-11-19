var EbHeader = function () {
    var _objName = $(".EbHeadTitle #objname");
    var _btnContainer = $(".comon_header_dy #obj_icons");
    var _layout = $("#layout_div");
    var _nCounter = $(".comon_header_dy #notification-count,.objectDashB-toolbar #notification-count");

    this.insertGlobalSearch = function () {

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
        })
        window.ebcontext.header.insertButton(`<button id="platformsearch" class="btn" data-toggle="modal" data-target="#exampleModalCenter" title="search"><i class="fa fa-search" aria-hidden="true"></i></button>`)

        $('#exampleModalCenter').on('shown.bs.modal', function (e) {
            $('#exampleModalCenter .srch-bx').focus();
        })
        $('#exampleModalCenter .srch-btn').on('click', this.platformSearch);
        $('#exampleModalCenter .srch-bx').on('keyup', function () {
            if (event.keyCode === 13)
                this.platformSearch();
        }.bind(this));
    }.bind(this);

    this.platformSearch = function () {
        let $srch = $('#exampleModalCenter .srch-bx');
        let searchkey = $srch.val();
        if (searchkey.trim() !== '') {
            //do ajax call
            this.drawResultList();
        }
    };
    this.drawResultList = function (
        data = [
            { displayName: "customer form", controlName: 'phone number', matchedValue: "9969212934", modifiedAt: '31-12-2009, 10.30am', createdAt: '31-11-2009, 12.30am' },
            { displayName: "customer form", controlName: 'phone number', matchedValue: "9969212934", modifiedAt: '31-12-2009, 10.30am', createdAt: '31-11-2009, 12.30am' },
            { displayName: "customer form", controlName: 'phone number', matchedValue: "9969212345", modifiedAt: '31-12-2009, 10.30am', createdAt: '31-11-2009, 12.30am' },
            { displayName: "customer form", controlName: 'phone number', matchedValue: "9969987456", modifiedAt: '31-12-2009, 10.30am', createdAt: '31-11-2009, 12.30am' },
            { displayName: "customer form", controlName: 'phone number', matchedValue: "9969222222", modifiedAt: '31-12-2009, 10.30am', createdAt: '31-11-2009, 12.30am' },
        ]
    ) {
        $('.srch-body-cont').empty();
        let html = '<ul style="list-style-type:none;">';
        $.each(data, function (i, obj) {
            html += '<li class="srch-li">'
            html += `
<div>
    <h4><a class='srch-res-fn'>${obj.displayName}</a></h4>
    <p>${obj.controlName} : ${obj.matchedValue}</p>
    <span>Created at : </span><span>${obj.createdAt}</span>
</div>`;
            html += '</li>'
        });
        html += '</ul>'

        $('.srch-body-cont').append(html);
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
};