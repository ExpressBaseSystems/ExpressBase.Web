var EbImageCropper = function (params) {
    this.cropperContainer = params.cropperContainer;
    this.fileurl = null;
    this.crop = {};
    this.preview = params.preview;
    this.toggleId = params.toggleId;
    this.croppedImage = null;

    this.appendModal = function () {

        $("#" + this.cropperContainer).append(`<div class="modal fade" id="${this.cropperContainer}_modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Crop Image</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body eb-cropie" id="${this.cropperContainer}_md_body">
                    
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="${this.cropperContainer}_ok">Ok</button>
                </div>
            </div>
        </div>
    </div>`)
    };

    this.getFileSourse = function (input) {
        if (input.target.files && input.target.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                this.fileurl = e.target.result;
                $('#' + this.cropperContainer + "_md_body").croppie('bind', {
                    url: this.fileurl,
                });
            }.bind(this);
            reader.readAsDataURL(input.target.files[0]);
        }
    };

    this.cropper = function () {
        this.crop = $('#' + this.cropperContainer +"_md_body").croppie({
            viewport: { width: 100, height: 100, type: 'square' },
            enableOrientation: true,
            enableExif: true,
            enforceBoundary: false,
        });
        $('#' + this.cropperContainer + ' .cr-slider-wrap').prepend(`<button class="btn btn-sm cropie-browsbtn" onclick="$('#browse-fileId').click();" id="browse-imge">Browse</button>`)
        $('#' + this.cropperContainer + ' .cr-slider-wrap').append(`<button class="btn btn-sm" id= "crop-rotate-left" ><i class="fa fa-undo fa-lg" aria-hidden="true"></i></button>
            <button class="btn btn-sm" id="crop-rotate-right"><i class="fa fa-repeat fa-lg" aria-hidden="true"></i></button>'
            <button class="btn btn-sm" id="crop"><i class="fa fa-crop" aria-hidden="true"></i></button>
            <input type="file" id="browse-fileId" style="display:none;">
            <div class="cropie-loader"><i class="fa fa-circle-o-notch fa-spin fa-lg" aria-hidden="true"></i></div>
            <button class="btn btn-sm pull-right" id="cropie-upload"><i class="fa fa-upload fa-lg" aria-hidden="true"></i></button>  
            `);

        $('#' + this.cropperContainer + ' #crop').on('click', this.getCropedImg.bind(this));
        $('#' + this.cropperContainer + ' #crop-rotate-left').on('click', this.rotateLeft.bind(this));
        $('#' + this.cropperContainer + ' #crop-rotate-right').on('click', this.rotateRight.bind(this));
        $('#' + this.cropperContainer + ' #browse-fileId').on('change', this.getFileSourse.bind(this));
        $('#' + this.cropperContainer + ' #cropie-upload').on('click', this.uploadImgToserver.bind(this));
    };

    this.getCropedImg = function (e) {
        this.crop.croppie('result', 'base64').then(this.cropedImage.bind(this));
    };

    this.cropedImage = function (result) {
        this.croppedImage = result;
        $('#' + this.preview).attr("src", result);
    };

    this.uploadImgToserver = function () {
        this.startSE();
        this.getCropedImg();
        //$('#' + this.cropperContainer).hide();
        if (this.croppedImage !== null) {
            $('#' + this.cropperContainer + ' .cropie-loader').css({ "display": "inline", });
            $('#' + this.cropperContainer + ' .cr-slider-wrap .btn').attr('disabled', 'disabled');
            $.post("../StaticFile/UploadDPAsync", {
                'base64': this.croppedImage
            }, function (url) {
                if (url !== null) {

                }
            }.bind(this));
        }
    };

    this.rotateLeft = function () {
        this.crop.croppie('rotate', -90);
    };

    this.rotateRight = function () {
        this.crop.croppie('rotate', 90);
    };

    this.startSE = function () {
        this.ss = new EbServerEvents({ ServerEventUrl: "https://se.eb-test.info", Channels: ["file-upload"] });
        this.ss.onUploadSuccess = function (m, e) {
            //$('#' + this.cropperContainer + ' .img-box-prof-picDiv ,.cropie-loader').hide();
            $.LoadingOverlay("hide");
            //$('#' + this.cropperContainer + ' .cr-slider-wrap .btn').removeAttr('disabled'); 
        }.bind(this);
    };

    this.toggleModal = function () {
        $("#"+this.cropperContainer+"_modal").modal("toggle");
    };

    this.init = function () {
        this.appendModal();
        this.cropper();
        $("#" + this.toggleId).on("click", this.toggleModal.bind(this));
        $("#" + this.cropperContainer + "_ok").on("click", function () {
            $("#" + this.cropperContainer + "_modal").modal("toggle");
        }.bind(this));
        $("#" + this.cropperContainer + "_modal").on('shown.bs.modal', function () {
           
        }.bind(this));
        $("#" + this.cropperContainer + "_modal").on("dialogclose", function (event, ui) {
            this.ss.stopListening();
        }.bind(this));

    };
    this.init();
}