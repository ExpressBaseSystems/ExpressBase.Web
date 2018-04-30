var cropfy = function (option) {

    this.Toggle = option.Toggle;//modal toggle btn
    this.Container = option.Container;//any string 
    this.Upload = option.isUpload;//enable upload option
    this.enableSE = option.enableSE;//start server events if needs
    this.Browse = option.Browse;//enable browsing option
    this.result = option.Result||'base64';
    this.url = option.Url||'';//load image on initialize
    this.fileurl = null;
    this.cropie = null;
    this.getFile = function (b65) { return b65; }//return b65 croped image
    this.Type = option.Type;//type of image logo or dp
    //this.ResizeViewPort = option.ResizeViewPort ? true : false;//enable resizing of viewport
    this.Preview = option.Preview||null;//previw el should be uniq and it sould be an img tag

    var _typeRatio = {
        'logo': {
            width: 250,
            height: 100
        },
        'dp': {
            width: 50,
            height: 50
        },
        'doc': {
            width: 200,
            height: 200
        }
    };

    this.appendModal = function () {
        $('body').append(`<div class="modal fade" id="${this.Container}_modal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
      <div class="modal-content cropfy_modal" style="border-radius:0;border:none;">
        <div class="modal-header cropfy_header" style="background: #3e8ef7;color: white;">
          <h5 class="modal-title" id="exampleModalLongTitle">Crop Image</h5>
            <i class="material-icons cropfy_close pull-right" data-dismiss="modal" style="margin-top:-4%;cursor: context-menu" id="${this.Container}_close">close</i>
        </div>
        <div class="modal-body">
            <div class="cropy_container" style="height:450px;width:100%;padding-bottom:50px;">
                <div id="${this.Container}_cropy_container">
                </div>
            </div>
        <div class="modal-footer cropfy_footer" id="${this.Container}_cropy_footer" style="padding-bottom: 0;padding-right:0;padding-left: 0;">
            <div class="btn-group" role="group">
            <button type="button" title="rotate_l" class="btn btn-secondary ${this.Container}_rotate"><i class="fa fa-undo"></i></button>
            <button type="button" title="rotate_r" class="btn btn-secondary ${this.Container}_rotate"><i class="fa fa-repeat"></i></button>
            </div>
          <button type="button" class="btn btn-primary" id="${this.Container}_crop"><i class="fa fa-crop"></i></button>
        </div>
      </div>
    </div>
  </div>`);
        this.__cropfy();
        $("." + this.Container + "_rotate").closest(".btn").on("click", this.rotate.bind(this));
        $("#" + this.Container + "_crop").closest(".btn").on("click", this.crop.bind(this));
        this.appendBtn();
    };

    this.appendBtn = function () {
        var $f = $("#" + this.Container + "_cropy_footer");
        if (this.Upload) {
            $f.append(`<button type="button" class="btn btn-primary" id="${this.Container}_upload"><i class="fa fa-upload"></i></button>`);
            $("#" + this.Container + "_upload").on("click", this.upload.bind(this));
        }
        else {
            $f.append(`<button type="button" class="btn btn-primary" id="${this.Container}_save"><i class="fa fa-save"></i></button>`);
            $("#" + this.Container + "_save").on("click", this.saveCropfy.bind(this));
        }
        if (this.Browse) {
            $f.append(`<button type="button" class="btn btn-primary pull-left" id="${this.Container}_browse" onclick="$('#${this.Container}_browse_file').click();">
                        <i class="fa fa-folder-open-o"></i></button>
                        <input type="file" style="display:none;" id="${this.Container}_browse_file"/>`);

            $("#" + this.Container + "_browse_file").on("change", this.browse.bind(this));
        }
    };

    this.toggleModal = function (e) {
        $("#" + this.Container + "_modal").modal("toggle");
    };

    this.startSE = function () {
        this.ss = new EbServerEvents({ ServerEventUrl: "https://se.eb-test.info", Channels: ["file-upload"] });
        this.ss.onUploadSuccess = function (m, e) {
            
        }.bind(this);//server event return id after upload success
    };

    this.modalShown = function () {
        this.cropie.croppie('bind', {
            url: this.url,
        });
        if (this.enableSE)
            this.startSE();
    };

    this.__cropfy = function () {
        this.cropie = $("#" + this.Container + "_cropy_container").croppie({
            viewport: _typeRatio[this.Type],
            enableOrientation: true,
            enforceBoundary: false,
            enableExif: true
        });
    };

    this.modalHide = function () {
        this.ss.stopListening();
    };

    this.saveCropfy = function () {
        this.toggleModal();
        this.getFile(this.fileurl);
    };

    this.upload = function () {
        var url = this.Type === "logo" ? "../StaticFile/UploadLogoAsync" : "../StaticFile/UploadDPAsync";
        if (this.fileurl) {
            $.post(url, {
                'base64': this.fileurl
            });
            this.toggleModal();
        }
    };

    this.rotate = function (e) {
        var wdo = $(e.target).closest(".btn").attr("title");
        if (wdo === "rotate_r")
            this.cropie.croppie('rotate', 90);
        else
            this.cropie.croppie('rotate', -90);
    };

    this.crop = function () {
        this.cropie.croppie('result', this.result).then(this.cropafter.bind(this));
    };

    this.cropafter = function (b65) {
        this.fileurl = b65;
        this.cropie.croppie('bind', {
            url: this.fileurl,
        });
        if (this.Preview)
            $(this.Preview).attr("src", this.fileurl);
    };

    this.browse = function (input) {
        if (input.target.files && input.target.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                this.fileurl = e.target.result;
                this.cropie.croppie('bind', {
                    url: this.fileurl,
                });
            }.bind(this);
            reader.readAsDataURL(input.target.files[0]);
        }
    };

    this.start = function () {
        this.appendModal();
        $("#" + this.Container + "_modal").on('shown.bs.modal', this.modalShown.bind(this));
        $("#" + this.Container + "_modal").on('hide.bs.modal', this.modalHide.bind(this));
        $("body").off("click").on("click", this.Toggle, this.toggleModal.bind(this));
    };
    this.start();
};
