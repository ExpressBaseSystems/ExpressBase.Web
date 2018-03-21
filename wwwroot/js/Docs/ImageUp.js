var ImageUploader_Doc = function (opt) {
    this.initialPrev = [];
    this.initialPrevConfig = [];

    this.makeFup = function () {
        $("#image_up_input").fileinput({
            uploadUrl: "../StaticFile/UploadImageAsync",
            maxFileCount: 5,
            initialPreview: this.initialPrev,
            initialPreviewConfig: this.initialPrevConfig,
            initialPreviewAsData: true,
            uploadAsync: true,
            uploadExtraData: this.uploadtag.bind(this)
        });/*.on('fileuploaded', this.fileUploadSuccess.bind(this))*/
            //.on('fileloaded', this.addtagButton.bind(this))
            //.on('fileclear', function (event) {
            //    $("#" + this.ContainerId + "tag-section").empty();
            //    $('#' + this.ContainerId + 'obj-id').text(" ");
            //});
        $(".file-drop-zone").css({ "height": '280px', "overflow-y": "auto" });
        $(".file-preview-initial").attr("tabindex", "1");
        //$(".file-preview-initial").on("focus", this.imageOnSelect.bind(this));
    };
    this.uploadtag = function () {

    };

    this._start = function () {
        this.makeFup();
        $("#tagsinput_input").tagsinput();
    };
    this._start();
};