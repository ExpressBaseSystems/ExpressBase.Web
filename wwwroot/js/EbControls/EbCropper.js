class EbCropper {
    constructor(options) {
        this.Options = $.extend({}, options);
        this.Result = "base64";
        this.FileUrl = null;
        this.Url = null;
        this.Cropy = null;
        this.FileName = null;
        this.CrpModal = this.appendModal();
        this.initCroper();
    };

    getFile(b65, filename) { }

    initCroper() {
        this.CrpModal.on('shown.bs.modal', this.modalShown.bind(this));
        $(this.Options.Toggle).off("click").on("click", this.toggleModal.bind(this));

        this.cropfy();
        $("." + this.Options.Container + "_rotate").closest(".btn").on("click", this.rotate.bind(this));
        $("#" + this.Options.Container + "_crop").closest(".btn").on("click", this.crop.bind(this));
        $("#" + this.Options.Container + "_save").off("click").on("click", this.saveCropfy.bind(this));
    }

    appendModal() {
        $('body').append(`<div class="modal fade" id="${this.Options.Container}crp_modal" tabindex="-1" role="dialog" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                              <div class="modal-content cropfy_modal" style="border-radius:0;border:none;">
                                <div class="modal-header cropfy_header" style="background: #3e8ef7;color: white;">
                                  <h5 class="modal-title" id="exampleModalLongTitle">Crop Image</h5>
                                    <i class="material-icons cropfy_close pull-right" data-dismiss="modal" style="margin-top:-2.5%;cursor: pointer" id="${this.Container}_close">close</i>
                                </div>
                                <div class="modal-body">
                                    <div class="cropy_container" style="height:450px;width:100%;padding-bottom:50px;">
                                        <div id="${this.Options.Container}_cropy_container">
                                        </div>
                                    </div>
                                <div class="modal-footer cropfy_footer" id="${this.Options.Container}_cropy_footer" style="padding-bottom: 0;padding-right:0;padding-left: 0;">
                                    <div class="btn-group" role="group">
                                    <button type="button" title="rotate_l" class="btn btn-secondary ${this.Options.Container}_rotate"><i class="fa fa-undo"></i></button>
                                    <button type="button" title="rotate_r" class="btn btn-secondary ${this.Options.Container}_rotate"><i class="fa fa-repeat"></i></button>
                                    </div>
                                  <button type="button" class="btn btn-primary" style="background-color:#528ff0;" id="${this.Options.Container}_crop"><i class="fa fa-crop"></i></button>
                                    <button type="button" class="btn btn-primary eb_btngreen" id="${this.Options.Container}_save"><i class="fa fa-save"></i></button>
                                </div>
                              </div>
                            </div>
                          </div>`);

        return $("#" + this.Options.Container + "crp_modal");
    };

    toggleModal(e) {
        this.CrpModal.modal("toggle");
    };

    cropfy() {
        this.Cropy = $("#" + this.Options.Container + "_cropy_container").croppie({
            viewport: {
                width: 200,
                height: 200
            },
            enableOrientation: true,
            enableResize: true,
            enforceBoundary: false,
            enableExif: true
        });
    };

    rotate(e) {
        var wdo = $(e.target).closest(".btn").attr("title");
        if (wdo === "rotate_r")
            this.cropie.croppie('rotate', 90);
        else
            this.cropie.croppie('rotate', -90);
    };

    crop() {
        this.Cropy.croppie('result', this.Result).then(this.cropafter.bind(this));
    };

    cropafter(b64) {
        this.FileUrl = b64;
        this.Cropy.croppie('bind', {
            url: this.FileUrl,
        });
    };

    modalShown() {
        this.Cropy.croppie('bind', {
            url: this.Url,
        });
    };

    saveCropfy(e) {
        this.toggleModal();
        this.getFile(this.FileUrl, this.FileName);
    };
};