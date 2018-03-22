var ImageUploader_Doc = function (opt) {
    this.initialPrev = [];
    this.initialPrevConfig = [];
    this.TenantId = opt.Tenantid;
    this.currtag = " ";
    this.makeFup = function () {       
        $("#image_up_input").fileinput({
            uploadUrl: "../StaticFile/UploadImageAsync",
            maxFileCount: 5,
            initialPreview: this.initialPrev,
            initialPreviewConfig: this.initialPrevConfig,
            initialPreviewAsData: true,
            uploadAsync: true,
            uploadExtraData: this.uploadtag.bind(this)
        })/*.on('fileuploaded', this.fileUploadSuccess.bind(this))*/
            .on('fileloaded', this.addCustbtn.bind(this));
            //.on('fileclear', function (event) {
            //    $("#" + this.ContainerId + "tag-section").empty();
            //    $('#' + this.ContainerId + 'obj-id').text(" ");
            //});
        $(".file-drop-zone").css({ "height": '95%', "overflow-y": "auto" });
        $(".file-preview-initial").attr("tabindex", "1");
        //$(".file-preview-initial").on("focus", this.imageOnSelect.bind(this));
    };

    this.addCustbtn = function (event, file, previewId, index, reader) {
        $("#" + previewId).children().find(".file-footer-buttons").append(`<button type='button' id='Docs_crop_btn${previewId }'
              class='kv-file-upload btn btn-kv btn-default btn-outline-secondary' title= 'Crop'> Crop</button><button type='button' id='Docs_Tag_btn${previewId }'
              class='kv-file-upload btn btn-kv btn-default btn-outline-secondary' title= 'Tag'> Tag</button>`);
        //$("#Docs_crop_btn" + previewId).on("click", this.cropImg.bind(this));
        $("#Docs_Tag_btn" + previewId).on("click", this.tagImg.bind(this));

        this.cropfy = new cropfy({
            Container: 'container' + previewId,
            Toggle: '#Docs_crop_btn' + previewId,
            isUpload: true,
            enableSE: true,
            Browse: false,
            Url: reader.result
        });
        this.cropfy.getFile = function (file) {
            $('#' + previewId).children().find("img").attr("src", file);
        };
    };

    this.cropImg = function (e) {
        var id = $(e.target).attr("id");
        
        this.cropfy.getFile = function (file) {
            $("#" + $(e.target).attr("prid")).children().find("img").attr("src", file);
        };
    };

    this.tagImg = function (e) {
        $("#TagModal").modal("toggle");
    };

    this.drawThumbNails = function (collection) {
        for (var i = 0; i < collection.length; i++) {
            var im = collection[i];
            $("#image_down_cont_body").append(` <div class="img_wrapper">
                    <div class="img_wrapper_img">
                        <img src="http://${ this.TenantId }-dev.localhost:41500/static/${ im.objectId }.jpg" class="img-responsive" />
                    </div>
                    <div class="img_wrapper_text">
                        <h5 class="f">amal.jpg(${im.length/1000}Kb)</h5>
                        <p class="f_s text-center">Uploaded on ${im.uploadDateTime}</p>
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

    this.uploadtag = function (previewId, index) {
        return { "tags": this.currtag };
    };

    this.toggleDiv = function (e) {
        var d = $(e.target).closest(".btn").attr("whichCont");
        $("#"+d).show();
        $.each($("#" + d).siblings(), function (i,obj) { $(obj).hide()}.bind(this));
    };

    this._start = function () {
        this.loadImages();
        this.makeFup();        
        $("#tagsinput_input").tagsinput();       
        $(".toggle_btn_docs").on("click", this.toggleDiv.bind(this));
        $(".upload_btn_docs").on("click", function () { $(".upload_sec").toggle(300, "swing"); });
        $("#save_tag").on('click', function () { this.currtag = $("#tagsinput_input").tagsinput('items'); this.tagImg(); }.bind(this));
    };
    this._start();
};