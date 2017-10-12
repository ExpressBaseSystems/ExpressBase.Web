var imageUploader = function (params) {
    this.params = params;
    this.multiple = " ";         
    this.controller = this.params.Controller;
    this.TenantId = this.params.TenantId;
    if (this.params.IsMultiple === true) {
        this.multiple = "multiple";
    }
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
        var modalW = $("<div class='modal fade modalstyle' id='up-modal' role='dialog'>"
            + "<div class='modal-dialog modal-lg'>"
            + "<div class='modal-content wstyle' style='border-radius:0;'>"
            + "<div class='modal-header'>"
            + "<h4 class='modal-title' style='display: inline-block;'>Upload File</h4>"
            + "<button type='button' class='close' data-dismiss='modal'>&times;</button>"
            + "</div>"
            + "<div class='modal-body' id='imgUBody' style=''>"
            + "<div class='input-group'><span class='input-group-addon'>Image URL</span>"
            + "<input type='text' id='obj-id' class='form-control'>"
            + "</div>"
            + "<div id-'img-upload-body' style='margin-top:15px;'><input id='input-id' type='file' class='file' data-preview-file-type='text' " + this.multiple + "></div>"
            + "</div>"
            + "<div class='modal-footer' id='mdfooter' style='height:auto;border:none;padding-top:0;'>"
            + "<div class='col-md-11' id='tag-section' style='padding:0;'></div>"
            + "<div class='col-md-1' id='sub-section'><button class='btn btn-default' id='sub-upload' style='display:none;margin-top:34px;'>OK</button></div>"
            + "</div></div></div></div>");

        $("#" + this.params.Container).append(modalW);
      
    }; //modal creation and fileinput initialized

    this.loadFileInput = function () {
        $("#input-id").fileinput({
            uploadUrl: "../StaticFile/UploadFileAsync",
            maxFileCount: 5,
            initialPreview: this.initialPrev,
            initialPreviewConfig: this.initialPrevConfig,
            initialPreviewAsData: true,
            uploadAsync: true,
            uploadExtraData: this.uploadtag.bind(this)
        }).on('fileuploaded', this.fileUploadSuccess.bind(this))
          .on('fileloaded', this.addtagButton.bind(this))
          .on('fileclear', function (event) {
                $("#tag-section").empty();
                $('#obj-id').attr('value', " ");
            });
        $(".file-drop-zone").css({ "height":'280px',"overflow-y":"auto"});
        $(".file-preview-initial").attr("tabindex", "1");
        $(".file-preview-initial").on("focus", this.imageOnSelect.bind(this));        
    };

    this.fileUploadSuccess = function (event, data, previewId, index) {
        $("#sub-upload").show();
        var objId = data.response.objId;      
        $('#obj-id').attr('value', "http://"+ this.TenantId +".localhost:5000/static/images/" + objid + ".jpg");        
        $(".file-preview-initial").attr("tabindex", "1");
        $(".file-preview-initial").on("focus", this.imageOnSelect.bind(this));
        $("#sub-upload").on('click', this.getId.bind(this, objId));
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
        $('#obj-id').attr('value', $(e.target).children().find("img").attr("src"));
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
        $("#tag-section").empty();        
        $("#tag-section").append("<div class='form-group'><div style='text-align:left;'>Tags(" + this.filename + ")</div></div><div class='form-group'>"
            + "<input type= 'text' data-role='tagsinput' id= 'tagval' value='' class='form-control'></div>");
        $("#tagval").tagsinput('refresh');
    };//tag btn onclick

    this.getUplodedImgOnload = function () {
        var _this = this;        
        $.post("../StaticFile/FindFilesByTags", {
            "tags": this.currtag            
        }, function (result) {
            for (var objid = 0; objid < result.length; objid++) {
                var url = "http://" + _this.TenantId +".localhost:5000/static/images/" + result[objid].objectId + ".jpg";
                var config = { caption: result[objid].fileName, size: result[objid].length };
                _this.initialPrev.push(url);
                _this.initialPrevConfig.push(config);
            }
            _this.loadFileInput();
            });      
    };

    this.getId = function (fileId) {
        this.getFileId(fileId);
        $('#up-modal').modal('toggle');
    };
    
    this.init = function () {
        this.getUplodedImgOnload();
        this.CreateMOdalW();
        //this.loadFileInput();       
    };
    this.init();
}