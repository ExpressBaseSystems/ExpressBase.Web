var EbHeader = function () {
    var _objName = $(".EbHeadTitle #objname");
    var _btnContainer = $(".comon_header_dy #obj_icons");
    var _layout = $("#layout_div");
    var _nCounter = $(".comon_header_dy #notification-count,.objectDashB-toolbar #notification-count");

    this.addRootObjectHelp = function (obj) {
        let AvailableDocs = { isPdf: (obj.Info && (!!obj.Info.trim())), isVideo: (obj.InfoVideoURL && (!!obj.InfoVideoURL.trim())) };

        if (AvailableDocs.isPdf || AvailableDocs.isVideo) {
            let html = `<button id="${obj.EbSid_CtxId}HelperBtn" class="btn" title="Info"><i class="fa ${obj.InfoIcon}" aria-hidden="true"></i></button>`;
            this.insertButton(html);

            let docbtn = `
              <li class="nav-item">
                <a class="nav-link @active@" id="${obj.EbSid_CtxId}-doctab" data-toggle="tab" href="#${obj.EbSid_CtxId}doc" role="tab" aria-controls="home" aria-selected="true">
                <i class="fa fa-file-text-o" aria-hidden="true"></i> Document
                </a>
              </li>`;

            let vidbtn = `
              <li class="nav-item">
                <a class="nav-link @active@" id="${obj.EbSid_CtxId}-vidtab" data-toggle="tab" href="#${obj.EbSid_CtxId}video" role="tab" aria-controls="profile" aria-selected="false">
                    <i class="icofont-ui-video-play"></i> Video
                </a>
              </li>`;

            let docContent = `
              <div class="tab-pane fade @activein@"  id="${obj.EbSid_CtxId}doc" role="tabpanel" aria-labelledby="${obj.EbSid_CtxId}-doctab">
                <iframe id='${obj.EbSid_CtxId}info' class='obj-hlp-iframe' src="/files/${obj.Info}.pdf" title="Iframe Example"></iframe>
              </div>`;

            let vidContent = `
              <div class="tab-pane fade @activein@" id="${obj.EbSid_CtxId}video" is-video="true" role="tabpanel" aria-labelledby="${obj.EbSid_CtxId}-tab">
                <iframe src="${obj.InfoVideoURL}" class='obj-hlp-iframe' frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              </div>`;

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
                HelpHtml = HelpHtml.replace('@pdfBtn@', docbtn).replace('@pdfContent@', docContent)
            }
            else {
                HelpHtml = HelpHtml.replace('@pdfBtn@', '').replace('@pdfContent@', '')
            }
            if (AvailableDocs.isVideo) {
                HelpHtml = HelpHtml.replace('@vidbtn@', vidbtn).replace('@vidContent@', vidContent)
            }
            else {
                HelpHtml = HelpHtml.replace('@vidbtn@', '').replace('@vidContent@', '')
            }

            HelpHtml = HelpHtml.replace('@activein@', 'active in').replace('@activein@', '').replace('@active@', '').replace('@active@', '');

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


            $(`#${obj.EbSid}infoCont .hclose`).on("click", this.objhelpHide);
            $(`#${obj.EbSid}infoCont .eb-popup-head`).on("dblclick", this.objhelpHide);


            $(`#${obj.EbSid}infoCont .hnewt`).on("click", function () {
                let extURL = ($(`#${obj.EbSid}infoCont .tab-pane.active`).attr('is-video') === "true") ? obj.InfoVideoURL : `/files/${obj.Info}.pdf`
                window.open(extURL, '_blank');
            }.bind(this));
        }
    };

    this.objhelpHide = function () {
        this.$infoModal.hide();
    }.bind(this)

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