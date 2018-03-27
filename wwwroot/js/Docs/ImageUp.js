var ImageUploader_Doc = function (opt) {
    this.TenantId = opt.Tenantid;
    this.currtag = ["devresource"];
    this.prevId = "";
    this.index = null;

    this.b64toBlob = function (b64Data, contentType, sliceSize) {
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

    this.makeFup = function () {
        $("#image_up_input").fileinput({
            uploadUrl: "../StaticFile/UploadImageAsync",
            maxFileCount: 5,
            uploadAsync: true,
            uploadExtraData: this.uploadtag.bind(this)
        }).on('fileuploaded', this.fileUploadSuccess.bind(this))
            .on('fileloaded', this.addCustbtn.bind(this))
            .on('filepreajax', this.filepreajax.bind(this));

        $(".file-drop-zone").css({ "height": '95%', "overflow-y": "auto" });
        $(".file-preview-initial").attr("tabindex", "1");

        this.cropfy = new cropfy({
            Container: 'container',
            Toggle: '.crop_btn',
            isUpload: false,
            enableSE: true,
            Browse: false,
            Result: 'base64'
        });
        this.cropfy.getFile = function (file) {
            $('#' + this.prevId).children().find("img").attr("src", file);
            var f = this.updateStack(file);
        }.bind(this);
    };

    this.updateStack = function (f) {
        if (f) {
            var i = this.index;
            var block = f.split(";");
            var contentType = block[0].split(":")[1];
            var realData = block[1].split(",")[1];
            var blob = this.b64toBlob(realData, contentType);
            var sf = $("#image_up_input").fileinput('getFileStack')[i];
            var file = new File([blob], sf.name, { type: contentType, lastModified: Date.now() });
            $("#image_up_input").fileinput('updateStack', i, file);
        }
    };

    this.uploadtag = function () {
        return { "tags": this.currtag };
    };

    this.filepreajax = function (event, previewId, index) {
        this.currtag.push($("#tagsinput_input_comm").val());
    };

    this.addCustbtn = function (event, file, previewId, index, reader) {
        $("#" + previewId).children().find(".file-footer-buttons").append(`<button type='button' id='Docs_crop_btn${previewId}'
              class='kv-file-upload btn btn-kv btn-default btn-outline-secondary crop_btn' index="${index}" previd=${previewId} b65='${reader.result}' title= 'Crop'> Crop</button><button type='button' id='Docs_Tag_btn${previewId}'
              class='kv-file-upload btn btn-kv btn-default btn-outline-secondary' title= 'Tag'> Tag</button>`);
        $("#Docs_crop_btn" + previewId).on("click", this.cropImg.bind(this));
        $("#Docs_Tag_btn" + previewId).on("click", this.tagImg.bind(this));
        this.startSE();
    };

    this.startSE = function () {
        this.ss = new EbServerEvents({ ServerEventUrl: "https://se.eb-test.info", Channels: ["file-upload"] });
        this.ss.onUploadSuccess = function (m, e) {
            $(".fileinput-remove-button").click();
            $(".upload_sec").toggle("slide", { direction: "down" }, 300);
            this.showRecentUpl(m);
        }.bind(this);
    };

    this.showRecentUpl = function (id) {
        $(".site-page").append(`<div class="Recent_up_prev" id="${id}">
        <div class="Recent_up_prev_bdy">
            <img src="http://${ this.TenantId}-dev.localhost:41500/static/${id}.jpg" class="img-responsive" />
        </div>
        <div class="img_info">
            <span class="fa fa-close _close_prev" onclick="$('#${id}').remove();"></span>
            <h5>Upload success</h5>
        </div>
    </div>`);
        this.drawThumbNails([{ objectId: id, length: 12345, uploadDateTime: "12/3/18", }]);
    };

    this.fileUploadSuccess = function (event, data, previewId, index) {
        this.ss.stopListening();
    };

    this.cropImg = function (e) {
        this.index = parseInt($(e.target).attr("index"));
        this.cropfy.url = $(e.target).attr("b65");
        this.prevId = $(e.target).attr("previd");
        this.cropfy.toggleModal();
    };

    this.tagImg = function (e) {
        $("#TagModal").modal("toggle");
    };

    this._saveTag = function (e) {
        if (this.currtag.length > 1)
            this.currtag.length = 1;
        this.currtag.push($("#tagsinput_input_modal").val());
        this.tagImg();
    };

    this.drawThumbNails = function (collection) {
        for (var i = 0; i < collection.length; i++) {
            var im = collection[i];
            $("#image_down_cont_body").prepend(`
                <div class="img_wrapper">
                <div class="img_wrapper_img">
                    <img src="http://${ this.TenantId}-dev.localhost:41500/static/${im.objectId}.jpg" class="img-responsive" />
                </div>
                <div class="img_wrapper_text">
                    <h5 class="f text-center">amal.jpg (<span class="kb">${im.length / 1000}Kb</span>)</h5>
                    <p class="f_s text-center" data-toggle="tooltip" title="${im.uploadDateTime}"><i class="fa fa-upload"></i> ${im.uploadDateTime}</p>
                </div>
                <div class="btn_container form-inline">
                    <div class="dropdown" style="float:left;margin-right:5px">
                        <button type='button' data-toggle="dropdown" class='kv-file-upload btn btn-kv btn-default btn-outline-secondary dropdown-toggle' title='Download'><i class="fa fa-download"></i></button>
                        <ul class="dropdown-menu">
                            <li><a href="http://${ this.TenantId}-dev.localhost:41500/static/${im.objectId}.jpg" download="${this.TenantId}">Orgninal</a></li>
                            <li><a href="http://${ this.TenantId}-dev.localhost:41500/static/${im.objectId}.jpg" download="${this.TenantId}">Medium</a></li>
                            <li><a href="http://${ this.TenantId}-dev.localhost:41500/static/${im.objectId}.jpg" download="${this.TenantId}">small</a></li>
                        </ul>
                    </div>
                    <button type='button' class='kv-file-upload btn btn-kv btn-default btn-outline-secondary' title='Tag'>Tag</button>
                </div>
                    </div>`);
        }
    };

    this.loadImages = function () {
        $.post("../StaticFile/FindFilesByTags", {
            "tags": "devresource"
        }, function (result) {
            this.drawThumbNails(result);
        }.bind(this));
    };

    this._start = function () {
        this.loadImages();
        this.makeFup();
        $("#tagsinput_input_comm").tagsinput();
        $("#tagsinput_input_modal").tagsinput();
        $(".upload_btn_docs").on("click", function () { $(".upload_sec").toggle("slide", { direction: "down" }, 300); });
        $("body").off("click").on("click", ".save_tag", this._saveTag.bind(this));
    };
    this._start();
};