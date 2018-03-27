var cropfy = function (option) {
    this.Toggle = option.Toggle;
    this.Container = option.Container;
    this.Upload = option.isUpload;
    this.enableSE = option.enableSE;
    this.Browse = option.Browse;
    this.result = option.Result||'base64';
    this.url = option.Url||'';
    this.fileurl = null;
    this.cropie = null;
    this.getFile = function (b65) { return b65; }

    this.appendModal = function () {
        $('body').append(`<div class="modal fade" id="${this.Container}_modal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document" style="margin-top: 10%;">
      <div class="modal-content cropfy_modal" style="border-radius:0;border:none;">
        <div class="modal-header cropfy_header" style="background: #3e8ef7;color: white;">
          <h5 class="modal-title" id="exampleModalLongTitle">Crop Image</h5>
          <button type="button" class="close cropfy_close" data-dismiss="modal" style="margin-top:-4%;" id="${this.Container}_close">
            <span><i class="fa fa-close"></i></span>
          </button>
        </div>
        <div class="modal-body">
            <div class="cropy_container" style="height:250px;width:100%;">
                <div id="${this.Container}_cropy_container">
                </div>
            </div>
        <div class="modal-footer cropfy_footer" id="${this.Container}_cropy_footer" style="padding-bottom: 0;padding-right:0;">
            <div class="btn-group" role="group">
               <button type="button" title="zoom_in" class="btn btn-secondary ${this.Container}_zoom"><i class="fa fa-search-plus"></i></button>
               <button type="button" title="zoom_ot" class="btn btn-secondary ${this.Container}_zoom"><i class="fa fa-search-minus"></i></button>
            </div>
            <div class="btn-group" role="group">
            <button type="button" title="rotate_l" class="btn btn-secondary ${this.Container}_rotate"><i class="fa fa-undo"></i></button>
            <button type="button" title="rotate_r" class="btn btn-secondary ${this.Container}_rotate"><i class="fa fa-repeat"></i></button>
            </div>
          <button type="button" class="btn btn-primary" id="${this.Container}_crop"><i class="fa fa-crop"></i></button>
          <button type="button" class="btn btn-primary" id="${this.Container}_save"><i class="fa fa-save"></i></button>
          
        </div>
      </div>
    </div>
  </div>`);
        this.__cropfy();
        $("." + this.Container + "_zoom").closest(".btn").on("click", this.zoom.bind(this));
        $("." + this.Container + "_rotate").closest(".btn").on("click", this.rotate.bind(this));
        $("#" + this.Container + "_crop").closest(".btn").on("click", this.crop.bind(this));
        $("#" + this.Container + "_save").on("click", this.saveCropfy.bind(this));
        this.appendBtn();
    };

    this.appendBtn = function () {
        var $f = $("#" + this.Container + "_cropy_footer");
        if (this.Upload) {
            $f.append(`<button type="button" class="btn btn-primary" id="${this.Container}_upload"><i class="fa fa-upload"></i></button>`);
            $("#" + this.Container + "_upload").on("click", this.upload.bind(this));
        }
        if (this.Browse) {
            $f.append(`<button type="button" class="btn btn-primary" id="${this.Container}_browse" onclick="$('#${this.Container}_browse_file').click();">
                        <i class="fa fa-folder-open-o"></i></button>
                        <input type="file" style="display:none;" id="${this.Container}_browse_file"/>`);

            $("#" + this.Container + "_browse_file").on("change", this.browse.bind(this));
        }
        
    };

    this.toggleModal = function (e) {
        $("#" + this.Container + "_modal").modal("toggle");
    };

    this.modalShown = function () {
        this.cropie.croppie('bind', {
            url: this.url,
        });
    };

    this.__cropfy = function () {
        this.cropie = $("#" + this.Container + "_cropy_container").croppie({
            viewport: {
                width: 150,
                height: 150
            },
            showZoomer: false,
            enableOrientation: true,
            enableExif: true,
        });
    };

    this.modalHide = function () {
    };

    this.saveCropfy = function () {
        this.toggleModal();
        this.getFile(this.fileurl);
    };

    this.zoom = function () {

    };

    this.upload = function () {

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
