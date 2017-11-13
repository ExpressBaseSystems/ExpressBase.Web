var ProfImageUploader = function (params) {
    this.url = params.url;
    this.cropperContainer = params.cropperContainer;
    this.fileurl = null;
    this.crop = {};

    this.getFileSourse = function (input) {
        $('#previewsec-outer').show();        
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                this.fileurl = e.target.result;
                this.cropper();
            }.bind(this);
            reader.readAsDataURL(input.files[0]);
        }        
    };      

    this.cropper = function () {
        this.crop = $('#' + this.cropperContainer).croppie({
            url: this.fileurl,
            enableOrientation: true
        });
        $('.cr-slider-wrap').append(' <button class="btn btn-sm" id="crop"><i class="fa fa-crop" aria-hidden="true"></i></button>'
            + '<button class="btn btn-sm" id= "crop-rotate-left" ><i class="fa fa-undo fa-lg" aria-hidden="true"></i></button>'
            + '<button class="btn btn-sm" id="crop-rotate-right"><i class="fa fa-repeat fa-lg" aria-hidden="true"></i></button>');

        $('#crop').on('click', this.getCropedImg.bind(this));
        $('#crop-rotate-left').on('click', this.rotateLeft.bind(this));
        $('#crop-rotate-right').on('click', this.rotateRight.bind(this));
        
    };

    this.getCropedImg = function (e) {
        this.crop.croppie('result', 'base64').then(this.cropedImage.bind(this));         
    };                 

    this.cropedImage = function (result) {
        if (result !== null) {
            this.uploadImgToserver(result);
        }
        $('#profimage').css('background', 'url(' + result + ') center center no-repeat');       
    };

    this.uploadImgToserver = function (result) {
        $.post("../StaticFile/UploadDPAsync", {
            'base64': result
        }, function (url) {
            if (url !== null) {

            }
        });
    };

    this.rotateLeft = function () {
        this.crop.croppie('rotate', -90);
    };

    this.rotateRight = function () {
        this.crop.croppie('rotate', 90);
    };

    this.init = function () {        
        this.getFileSourse(this.url);
       
    };
    this.init();
}