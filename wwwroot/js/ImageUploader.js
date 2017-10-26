var imageUploader = function (params) {
    this.params = params;
    this.multiple = " ";
    this.ContainerId = params.Container;
    this.controller = this.params.Controller;
    this.TenantId = this.params.TenantId;
    this.toggleId = this.params.toggleId;
    if (this.params.IsMultiple === true) { this.multiple = "multiple"; }
    this.initialPrev = [];
    this.initialPrevConfig = [];
    this.currtag = " ";
    if (this.controller === "dc") {
        this.currtag = "devresource";
    }
    else if (this.controller === "tc") {
        this.currtag = "tenantresource";
    }

    this.getFileId = function (res) { };

    this.CreateMOdalW = function () {
        var modalHTML = '<div class="fup" id="bg_' + this.ContainerId + '"><div class="pgCXEditor-bg">'
                            + '<div class="pgCXEditor-Cont">'

                                + '<div class="modal-header">'
                                    + '<button type="button" class="close" onclick="$(\'#' + this.ContainerId + ' .pgCXEditor-bg\').hide(500);" >&times;</button>'
                                    + '<h4 class="modal-title" style="display:inline;">Image Selector </h4>'
                                    + '<p style="display:inline;float:right;margin-right: 20px;" id="' + this.ContainerId +'obj-id"></p>'
                                + '</div>'

                                + '<div class="modal-body">'                                   
                                    + "<div id-'img-upload-body' style='margin-top:15px;'><input id='" + this.ContainerId + "input-id' type='file' class='file' data-preview-file-type='text' " + this.multiple + "></div>"
                                    + "<h6>Tags</h6>"
                                    + "<input type= 'text' data-role='tagsinput' id= '" + this.ContainerId + "tagval' value='' class='form-control' style='display:none;width:100%;'>"
                                + '</div>'

                                + '<div class="modal-footer">'
                                     + '<div class="modal-footer-body">'                                             
                                        + '<button type="button" name="CXE_OK" id="' + this.ContainerId +'_close" class="btn"  onclick="$(\'#' + this.ContainerId + ' .pgCXEditor-bg\').hide(500);">OK</button>'           
                                     + '</div>'
                                + '</div>'
                            + '</div>'
                        + '</div>'               
                    + '</div>';

        $("#" + this.ContainerId).append(modalHTML);

    }; //modal creation and fileinput initialized

    this.toggleModal = function () {
        $("#bg_" + this.ContainerId + " .pgCXEditor-bg").toggle(350);
    };

    this.loadFileInput = function () {
        $("#" + this.ContainerId + "input-id").fileinput({
            uploadUrl: "../StaticFile/UploadImageAsync",
            maxFileCount: 5,
            initialPreview: this.initialPrev,
            initialPreviewConfig: this.initialPrevConfig,
            initialPreviewAsData: true,
            uploadAsync: true,
            uploadExtraData: this.uploadtag.bind(this)
        }).on('fileuploaded', this.fileUploadSuccess.bind(this))
            .on('fileloaded', this.addtagButton.bind(this))
            .on('fileclear', function (event) {
                $("#" + this.ContainerId + "tag-section").empty();
                $('#' + this.ContainerId + 'obj-id').text(" ");
            });
        $(".file-drop-zone").css({ "height": '280px', "overflow-y": "auto" });
        $(".file-preview-initial").attr("tabindex", "1");
        $(".file-preview-initial").on("focus", this.imageOnSelect.bind(this));
    };

    this.fileUploadSuccess = function (event, data, previewId, index) {
        $("#" + this.ContainerId + "sub-upload").show();
        var objId = data.response.objId;
        $('#' + this.ContainerId + 'obj-id').text(objId);
        $(".file-preview-initial").attr("tabindex", "1");
        $(".file-preview-initial").on("focus", this.imageOnSelect.bind(this));
        $("#" + this.ContainerId + "_close").on('click', this.getId.bind(this, objId));
    };

    this.addtagButton = function (event, file, previewId, index, reader) {
        if (this.params.IsTag === true) {
            this.filename = file.name;
            $("#" + previewId).children().find(".file-footer-buttons").append("<button type='button' id='" + this.ContainerId + "tagbtn" + previewId + "'"
                + "class='kv-file-upload btn btn-kv btn-default btn-outline-secondary' title= 'Tag' > Tag</button > ");
            $("#" + this.ContainerId + "tagbtn" + previewId).on("click", this.tagimageOnClick.bind(this));
        }
    };//tadd tag btn

    this.imageOnSelect = function (e) {
        $("#" + this.ContainerId + 'obj-id').text('value', $(e.target).children().find("img").attr("src"));
    }

    this.uploadtag = function (previewId, index) {
        var tagnames = [];
        if (this.controller === "dc") {
            tagnames.push(this.currtag);
            if ($("#" + this.ContainerId + "tagval").val()) {
                tagnames.push($("#" + this.ContainerId + "tagval").val());
            }
        }
        return { "tags": tagnames };
    };

    this.tagimageOnClick = function () {      
        $("#" + this.ContainerId + "tagval").show().tagsinput('refresh');
    };//tag btn onclick

    this.getUplodedImgOnload = function () {
        var _this = this;
        $.post("../StaticFile/FindFilesByTags", {
            "tags": this.currtag
        }, function (result) {
            for (var objid = 0; objid < result.length; objid++) {
                var url = "http://" + _this.TenantId + ".localhost:5000/static/" + result[objid].objectId + "." + result[objid].fileType;
                var config = { caption: result[objid].fileName, size: result[objid].length };
                _this.initialPrev.push(url);
                _this.initialPrevConfig.push(config);
            }
            _this.loadFileInput();
        });
    };

    this.getId = function (fileId) {
        this.getFileId(fileId);
    };

    this.init = function () {
        //this.getUplodedImgOnload();
        this.CreateMOdalW();
        this.loadFileInput();
        $('body').off("click", "#" + this.toggleId).on("click", "#" + this.toggleId, this.toggleModal.bind(this));
    };
    this.init();
}