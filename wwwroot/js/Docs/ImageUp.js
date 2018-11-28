var ImageUploader_Doc = function (opt) {

    this.TenantId = opt.Tenantid;
    var _i = null;
    var _prev = null;
    var _input = $("#image_up_input");
    var _tComm = $("#tagsinput_input_comm");
    var _tImg = $("#tagsinput_input_modal");
    var _tag = {};

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
        _input.fileinput({
            uploadUrl: "../StaticFile/UploadImageAsync",
            maxFileCount: 5,
            uploadAsync: false,
            uploadExtraData: this.uploadtag.bind(this)
        }).on('fileuploaded', this.fileUploadSuccess.bind(this))
          .on('fileloaded', this.addCustbtn.bind(this))
          .on('filepreajax', this.filepreajax.bind(this));

        $(".file-drop-zone").css({ "height": '95%', "overflow-y": "auto" });

        //this.cropfy = new cropfy({
        //    Container: 'container',
        //    Toggle: '.crop_btn',
        //    isUpload: false,
        //    enableSE: true,
        //    Browse: false,
        //    Result: 'base64'
        //});

        
        this.cropfy = new cropfy({
            Container: 'container',
            Toggle: '.crop_btn',
            isUpload: false,
            enableSE: true,
            Browse: true,
            Result: 'base64',
            Type: 'doc',
            Tid: this.TenantId,
            ResizeViewPort: true,
        });

        this.cropfy.getObjId = function (o) {
            
        };

        //this.cropfy.getFile = function (file) {
        //    $('#' + _prev).children().find("img").attr("src", file);
        //    var f = this.updateStack(file);
        //}.bind(this);
    };

    this.updateStack = function (b64) {
        let block = b64.split(";");
        let contentType = block[0].split(":")[1];
        let realData = block[1].split(",")[1];
        let blob = this.b64toBlob(realData, contentType);
        let sf = _input.fileinput('getFileStack')[_i];
        let file = new File([blob], sf.name, { type: contentType, lastModified: Date.now() });
        _input.fileinput('updateStack', _i, file);
    };

    this.uploadtag = function () {
        return { "tags": JSON.stringify(_tag) };
    };

    this.filepreajax = function (event, previewId, index) {
        var r = _tComm.tagsinput('items');
        if (!$.isEmptyObject(_tag)) {
            for (var key in _tag) {
                for (let i = 0; i < r.length; i++) {
                    _tag[key].push(r[i]);
                }
            }
        }
    };

    this.addCustbtn = function (event, file, previewId, index, reader) {
        $("#" + previewId).children().find(".file-footer-buttons").append(`<button type='button' id='Docs_crop_btn${previewId}'
              class='kv-file-upload btn btn-kv btn-default btn-outline-secondary crop_btn' index="${index}" previd=${previewId} b65='${reader.result}' title= 'Crop'>Crop</button>
              <button type='button' id='Docs_Tag_btn${previewId}'
              class='kv-file-upload btn btn-kv btn-default btn-outline-secondary' index="${index}" title= 'Tag'> Tag</button>`);

        $("#Docs_crop_btn" + previewId).on("click", this.cropImg.bind(this));
        $("#Docs_Tag_btn" + previewId).on("click", this.tagImg.bind(this));
        this.startSE();
    };

    this.startSE = function () {
        this.ss = new EbServerEvents({ ServerEventUrl: "https://se.eb-test.xyz", Channels: ["file-upload"] });
        this.ss.onUploadSuccess = function (obj, e) {
            $(".fileinput-remove-button").click();
            $(".upload_sec").toggle("slide", { direction: "down" }, 300);
            this.showRecentUpl(obj);
        }.bind(this);
    };

    this.showRecentUpl = function (obj) {
        $(".site-page").append(`<div class="Recent_up_prev" id="${obj.objectId}">
        <div class="Recent_up_prev_bdy">
            <img src="http://${ this.TenantId}-dev.localhost:41500/static/${obj.objectId}.jpg" class="img-responsive" />
        </div>
        <div class="img_info">
            <span class="fa fa-close _close_prev" onclick="$('#${obj.objectId}').remove();"></span>
            <h5>Upload success</h5>
        </div>
    </div>`);
        this.drawThumbNails([obj]);
    };

    this.fileUploadSuccess = function (event, data, previewId, index) {
        this.ss.stopListening();
    };

    this.cropImg = function (e) {
        _i = parseInt($(e.target).attr("index"));
        this.cropfy.url = $(e.target).attr("b65");
        _prev = $(e.target).attr("previd");
        this.cropfy.toggleModal();
    };

    this.tagImg = function (e) {
        if (e)
            _i = parseInt($(e.target).attr("index"));
        $("#TagModal").modal("toggle");
    };

    this._saveTag = function (e) {       
        var f = _input.fileinput('getFileStack')[_i];
        _tag[f.name.toLowerCase()] = _tImg.tagsinput('items');
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
        $.post("../StaticFile/FindFilesByTenant", {
            "type": 1
        }, function (result) {
            this.drawThumbNails(result);
        }.bind(this));
    };

    this._start = function () {
        //this.loadImages();
        this.makeFup();
        _tComm.tagsinput();
        _tImg.tagsinput();
        $(".upload_btn_docs").on("click", function () {
            $(".upload_sec").toggle("slide", { direction: "down" }, 300);
        });
        $("body").off("click").on("click", ".save_tag", this._saveTag.bind(this));
    };

    this._start();
};