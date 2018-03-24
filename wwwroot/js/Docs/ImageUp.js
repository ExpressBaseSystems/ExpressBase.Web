var ImageUploader_Doc = function (opt) {
    this.initialPrev = [];
    this.initialPrevConfig = [];
    this.TenantId = opt.Tenantid;
    this.currtag = "devresource";
    this.prevId = "";

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

        this.cropfy = new cropfy({
            Container: 'container',
            Toggle: '.crop_btn',
            isUpload: false,
            enableSE: true,
            Browse: false
        });
        this.cropfy.getFile = function (file) {
            $('#' + this.prevId).children().find("img").attr("src", file);
        }.bind(this);
    };

    this.addCustbtn = function (event, file, previewId, index, reader) {
        $("#" + previewId).children().find(".file-footer-buttons").append(`<button type='button' id='Docs_crop_btn${previewId}'
              class='kv-file-upload btn btn-kv btn-default btn-outline-secondary crop_btn' previd=${previewId} b65='${reader.result}' title= 'Crop'> Crop</button><button type='button' id='Docs_Tag_btn${previewId }'
              class='kv-file-upload btn btn-kv btn-default btn-outline-secondary' title= 'Tag'> Tag</button>`);
        $("#Docs_crop_btn" + previewId).on("click", this.cropImg.bind(this));
        $("#Docs_Tag_btn" + previewId).on("click", this.tagImg.bind(this)); 
        
    };

    this.cropImg = function (e) {
        this.cropfy.url = $(e.target).attr("b65");
        this.prevId = $(e.target).attr("previd");
    };

    this.tagImg = function (e) {
        $("#TagModal").modal("toggle");
    };

    this.drawThumbNails = function (collection) {
        for (var i = 0; i < collection.length; i++) {
            var im = collection[i];
            $("#image_down_cont_body").append(`
                <div class="img_wrapper">
                <div class="img_wrapper_img">
                    <img src="http://${ this.TenantId}-dev.localhost:41500/static/${im.objectId }.jpg" class="img-responsive" />
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
        $("#tagsinput_input_modal").tagsinput();
        $(".toggle_btn_docs").on("click", this.toggleDiv.bind(this));
        $(".upload_btn_docs").on("click", function () { $(".upload_sec").toggle("slide", { direction: "down" }, 300); });
        $("#save_tag").on('click', function () { this.currtag = $("#tagsinput_input").tagsinput('items'); this.tagImg(); }.bind(this));
    };
    this._start();
};