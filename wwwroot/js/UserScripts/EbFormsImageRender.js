class ImageRender {

    constructor(options) {
        this.options = $.extend({}, options);
        this._i = null;
        this._input = $("#image_up_input");
        this._tComm = $("#tagsinput_input_comm");
        this._tImg = $("#tagsinput_input_modal");
        this._tag = {};
        this._prev = null;
        this.start();
    }

    start() {
        this._tComm.tagsinput();
        this._tImg.tagsinput();
        this.makeFup()
        $("body").off("click").on("click", ".save_tag", this._saveTag.bind(this));
    }

    makeFup() {
        this._input.fileinput({
            uploadUrl: "../StaticFile/UploadImageAsync",
            maxFileCount: 5,
            uploadAsync: true,
            uploadExtraData: this.uploadtag.bind(this)
        }).on('fileuploaded', this.fileUploadSuccess.bind(this))
            .on('fileloaded', this.addCustbtn.bind(this))
            .on('filepreajax', this.filepreajax.bind(this));

        $(".file-drop-zone").css({ "height": '95%', "overflow-y": "auto" });

        //this.cropfy = new cropfy({
        //    Container: 'container',
        //    Toggle: '.crop_btn',
        //    isUpload: false,
        //    enableSE: false,
        //    Browse: false,
        //    Result: 'base64',
        //    Type: 'doc',
        //    Tid: this.options.TenantId,
        //    ResizeViewPort: true,
        //});

        //this.cropfy.getFile = function (file) {
        //    $('#' + this._prev).children().find("img").attr("src", file);
        //    var f = this.updateStack(file);
        //}.bind(this);
    }

    uploadtag() {
        return { "tags": JSON.stringify(this._tag) };
    };

    fileUploadSuccess(event, data, previewId, index) {
        //this.ss.stopListening();
    };

    addCustbtn(event, file, previewId, index, reader) {
        $("#" + previewId).children().find(".file-footer-buttons").append(`<button type='button' id='Docs_Tag_btn${previewId}'
              class='kv-file-upload btn btn-kv btn-default btn-outline-secondary' index="${index}" title= 'Tag'> Tag</button>`);

        //$("#Docs_crop_btn" + previewId).on("click", this.cropImg.bind(this));
        $("#Docs_Tag_btn" + previewId).on("click", this.tagImg.bind(this));
        this.startSE();
    };

    startSE() {

        let url = "";
        if (window.location.host.indexOf("localhost") >= 0)
            url = "https://sedev.eb-test.info";
        else if (window.location.host.indexOf("eb-test.info") >= 0)
            url = "https://se.eb-test.info";
        else
            url = "https://se.expressbase.com";

        this.ss = new EbServerEvents({ ServerEventUrl: url, Channels: ["file-upload"] });
        this.ss.onUploadSuccess = function (m, e) {
            $(".fileinput-remove-button").click();
        }.bind(this);//server event return id after upload success
    };

    filepreajax(event, previewId, index) {
        var r = this._tComm.tagsinput('items');
        if (!$.isEmptyObject(this._tag)) {
            for (var key in this._tag) {
                for (let i = 0; i < r.length; i++) {
                    this._tag[key].push(r[i]);
                }
            }
        }
    };

    cropImg(e) {
        this._i = parseInt($(e.target).attr("index"));
        this.cropfy.url = $(e.target).attr("b65");
        this._prev = $(e.target).attr("previd");
        this.cropfy.toggleModal();
    };

    tagImg(e) {
        if (e)
            this._i = parseInt($(e.target).attr("index"));
        $("#TagModal").modal("toggle");
    };

    _saveTag(e) {
        var f = this._input.fileinput('getFileStack')[this._i];
        this._tag[f.name.toLowerCase()] = this._tImg.tagsinput('items');
        this.tagImg();
    };

    b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        var byteCharacters = atob(b64Data);
        var byteArrays = [];
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        var blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    updateStack(b64) {
        let block = b64.split(";");
        let contentType = block[0].split(":")[1];
        let realData = block[1].split(",")[1];
        let blob = this.b64toBlob(realData, contentType);
        let sf = this._input.fileinput('getFileStack')[this._i];
        let file = new File([blob], sf.name, { type: contentType, lastModified: Date.now() });
        this._input.fileinput('updateStack', this._i, file);
    };
}