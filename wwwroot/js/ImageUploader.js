var imageUploader = function (params) {
    this.params = params;
    this.previd = null;
    this.multiple = " ";
    this.controller = this.params.Controller;
    if (this.params.IsMultiple === true) {
        this.multiple = "multiple";
    }
    this.initialPrev = [];
    this.currtag = " ";
    if (this.controller === "dc") {
        this.currtag = "devresource";
    }
    else if (this.controller === "tc") {
        this.currtag = "tenantresource";
    }

    this.CreateMOdalW = function () {
        var modalW = $("<div class='modal fade modalstyle' id='up-modal' role='dialog'>"
            + "<div class='modal-dialog modal-lg'>"
            + "<div class='modal-content wstyle' style='border-radius:0;'>"
            + "<div class='modal-header'>"
            + "<h4 class='modal-title' id='exampleModalLabel' style='display: inline-block;'>Upload Upload</h4>"
            + "<button type='button' class='close' data-dismiss='modal'>&times;</button>"
            + "</div>"
            + "<div class='modal-body' id='imgUBody' style=''>"
            + "<div class='input-group'><span class='input-group-addon'>Image URL</span>"
            + "<input type='text' id='obj-id' class='form-control'>"
            + "</div>"
            + "<div id-'img-upload-body' style='margin-top:15px;'><input id='input-id' type='file' class='file' data-preview-file-type='text' " + this.multiple + "></div>"
            + "</div>"
            + "<div class='modal-footer' id='mdfooter' style='display:none;height:100px;border:none;padding-top:0;'></div>"
            + "</div></div></div>");

        $("#" + this.params.Container).append(modalW);
      
    }; //modal creation and fileinput initialized

    this.loadFileInput = function () {
        $("#input-id").fileinput({
            uploadUrl: "../StaticFile/UploadFileAsync",
            maxFileCount: 5,
            initialPreview: this.initialPrev,
            uploadExtraData: this.uploadtag.bind(this)
        }).on('fileuploaded', this.fileUploadSuccess.bind(this))
            .on('fileloaded', this.addtagButton.bind(this))
            .on('fileclear', function (event) {
                $("#mdfooter").empty().hide();
                $('#obj-id').attr('value', " ");
            });
    };

    this.fileUploadSuccess = function (event, data, previewId, index) {
        var objId = data.response.objId;
        $('#obj-id').attr('value', objId);
        this.previd = previewId;
        $(".file-preview-initial").attr("tabindex", "1").attr("onclick", "$(this).focus();");
        $(".file-preview-initial").on("focus", this.imageOnSelect.bind(this));
    };

    this.addtagButton = function (event, file, previewId, index, reader) {
        if (this.params.IsTag === true) {
            this.filename = file.name;
            $("#" + previewId).children().find(".file-footer-buttons").append("<button type='button' id='tagbtn" + previewId + "'"
                + "class='kv-file-upload btn btn-kv btn-default btn-outline-secondary' title= 'Tag' > Tag</button > ");
            $("#tagbtn" + previewId).on("click", this.tagimageOnClick.bind(this));
        }
    };//tadd tag btn

    this.imageOnSelect = function (e) {
        $('#obj-id').attr('value', $(e.target).children().find("img").attr("imgid"));
    }

    this.uploadtag = function (previewId, index) {
        var tagnames = [];
        if (this.controller === "dc") {
            tagnames.push(this.currtag);
            if ($("#tagval").val()){
                tagnames.push($("#tagval").val());
            }        
        }
        return { "tags": tagnames };
    };

    this.tagimageOnClick = function () {
        $("#mdfooter").show().empty();        
        $("#mdfooter").append("<div class='form-group'><div style='text-align:left;'>Tags(" + this.filename + ")</div></div><div class='form-group'>"
            + "<input type= 'text' data-role='tagsinput' id= 'tagval' value='' class='form-control'></div>");
        $("#tagval").tagsinput('refresh');
    };//tag btn onclick

    this.getUplodedImgOnload = function () {
        var _this = this;        
        $.post("../StaticFile/FindFilesByTags", {
            "tags": this.currtag            
        }, function (result) {
            for (var objid = 0; objid < result.length; objid++) {
                var url = "<img src=../static/eb_roby_dev/" + result[objid] + ".jpg style='width: auto; height:auto; max-width:100%;max-height:100%;'>";
                _this.initialPrev.push(url);               
            }
            _this.loadFileInput();
            });
       
    };

    this.init = function () {
        this.getUplodedImgOnload();
        this.CreateMOdalW();                    
    };
    this.init();
}