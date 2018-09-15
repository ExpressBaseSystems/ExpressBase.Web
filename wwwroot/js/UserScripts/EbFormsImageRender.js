class ImageRender {

    constructor(options) {
        this.options = $.extend({}, options);
        this._input = $("#image_up_input");
        this.start();

        this.ImageRefIds = [];
        this.ImageBase64 = {};
    }

    start() {
        this.makeFup()
        $("#mdlAttach").on('shown.bs.modal', function (e) { this.startSE() }.bind(this));
    }

    makeFup() {
        this._input.fileinput({
            uploadUrl: "../StaticFile/UploadImageAsyncFromForm",
            maxFileCount: 5,
            uploadAsync: false
        }).on('filebatchuploadsuccess', this.fileUploadSuccess.bind(this))
            .on('filepreajax', this.filepreajax.bind(this));

        $(".file-drop-zone").css({ "height": '80%', "overflow-y": "auto" });
    }

    fileUploadSuccess(event, data) {
        for (let i = 0; i < data.response.refIds;i++) {
            if (this.ImageRefIds.indexOf(data.response.refIds[i]) === -1) {
                this.ImageRefIds.push(data.response.refIds[i]);
                this.ImageBase64[data.response] = data.reader.result;
            }
        }
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
       
    };
}