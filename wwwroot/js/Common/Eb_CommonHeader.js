var EbHeader = function () {
    var _objName = $(".EbHeadTitle #objname");
    var _btnContainer = $(".comon_header_dy #obj_icons");
    var _layout = $("#layout_div");
    var _nCounter = $(".comon_header_dy #notification-count,.objectDashB-toolbar #notification-count");

    this.addRootObjectHelp = function (obj) {
        if (obj.Info && obj.Info.trim() !== "") {
            let html = `<button id="${obj.EbSid}HelperBtn" class="btn" title="Info"><i class="fa ${obj.InfoIcon}" aria-hidden="true"></i></button>`;
            this.insertButton(html);

            $(`<div class="icon-cont  pull-right pgcorner"><i class="fa fa-angle-double-right"></i></div>`)

            $("body").append(`
            <div id='${obj.EbSid}infoCont' class='eb-popup-cont'>
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
                    <iframe id='${obj.EbSid}info' class='obj-hlp-iframe' src="/files/${obj.Info}.pdf" title="Iframe Example"></iframe>
                </div>
                <div class='hhandpad-r'></div>
                <div class='hhandpad-l'></div>
            </div>
            `);

            this.$infoModal = $(`#${obj.EbSid}infoCont`);

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


            $(`#${obj.EbSid}infoCont .hclose`).on("click",this.objhelpHide);
            $(`#${obj.EbSid}infoCont .eb-popup-head`).on("dblclick",this.objhelpHide);


            $(`#${obj.EbSid}infoCont .hnewt`).on("click", function () {
                window.open(`/files/${obj.Info}.pdf`, '_blank');
            }.bind(this));

            //new jBox('Modal', {
            //    attach: `#${obj.EbSid}HelperBtn`,
            //    width: 'auto',
            //    Height: 'auto',
            //    title: 'Help',
            //    overlay: false,
            //    content: `<iframe class='obj-hlp-iframe' src="/files/${obj.Info}.pdf" title="Iframe Example"></iframe>`,
            //    draggable: 'title',
            //    repositionOnOpen: false,
            //    repositionOnContent: false
            //});

            //$(".jBox-wrapper").resizable({
            //    aspectRatio: true,
            //    alsoResize: '.jBox-content'
            //});
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

    this.updateNCount = function (count) {
        _nCounter.text(count);
        if (count > 0)
            _nCounter.show();
        else
            _nCounter.hide();
    };

    _layout.data("EbHeader", this);
};