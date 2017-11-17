var EbImageCropper = function (params) {
    this.cropperContainer = params.cropperContainer;
    this.fileurl = null;
    this.crop = {};
    this.preview = params.preview;
    this.croppedImage = null;

    this.getFileSourse = function (input) {
        if (input.target.files && input.target.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                this.fileurl = e.target.result;
                $('#' + this.cropperContainer).croppie('bind',{
                    url: this.fileurl,
                });
            }.bind(this);
            reader.readAsDataURL(input.target.files[0]);
        }        
    };      

    this.cropper = function () {
        this.crop = $('#' + this.cropperContainer).croppie({
            url: 'http://localhost:5000/images/your-logo.png',
            viewport: { width: 150, height: 150 },
            enableOrientation: true
        });
        $('.cr-slider-wrap').prepend(`<button class="btn btn-sm cropie-browsbtn" onclick="$('#browse-fileId').click();" id="browse-imge">Browse</button>`)
        $('.cr-slider-wrap').append(`<button class="btn btn-sm" id= "crop-rotate-left" ><i class="fa fa-undo fa-lg" aria-hidden="true"></i></button>
            <button class="btn btn-sm" id="crop-rotate-right"><i class="fa fa-repeat fa-lg" aria-hidden="true"></i></button>'
            <button class="btn btn-sm" id="crop"><i class="fa fa-crop" aria-hidden="true"></i></button>
            <input type="file" id="browse-fileId" style="display:none;">
            <div class="cropie-loader"><i class="fa fa-circle-o-notch fa-spin fa-lg" aria-hidden="true"></i></div>
            <button class="btn btn-sm pull-right" id="cropie-upload"><i class="fa fa-upload fa-lg" aria-hidden="true"></i></button>  
            `);

        $('#crop').on('click', this.getCropedImg.bind(this));
        $('#crop-rotate-left').on('click', this.rotateLeft.bind(this));
        $('#crop-rotate-right').on('click', this.rotateRight.bind(this));
        $('#browse-fileId').on('change', this.getFileSourse.bind(this));
        $('#cropie-upload').on('click', this.uploadImgToserver.bind(this));
    };

    this.getCropedImg = function (e) {
        this.crop.croppie('result', 'base64').then(this.cropedImage.bind(this));         
    };                 

    this.cropedImage = function (result) {
        this.croppedImage = result;
        $('#' + this.preview).empty();   
        $('#' + this.preview).css('background', 'url(' + result + ') center center no-repeat');
    };

    this.uploadImgToserver = function () {
        this.getCropedImg();
        if (this.croppedImage !== null) {
            $('.cropie-loader').css({ "display": "inline", });           
            $('.cr-slider-wrap .btn').attr('disabled', 'disabled');
            $.post("../StaticFile/UploadDPAsync", {
                'base64': this.croppedImage
            }, function (url) {
                if (url !== null) {
                    $('.img-box-prof-picDiv ,.cropie-loader').hide();                   
                    $.LoadingOverlay("hide");
                    $('.cr-slider-wrap .btn').removeAttr('disabled');
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

    this.init = function () {        
        this.cropper();    
    };
    this.init();
}