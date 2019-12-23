class DPFormControl {
    constructor(ctrl) {
        this.control = ctrl;
        this.$ctrlCont = $(`#cont_${ctrl.EbSid_CtxId}`);
        this.$btnChange = $(`#cont_${ctrl.EbSid_CtxId} .dpctrl-options-cont .dpctrl-change`);
        this.ctrlCont = `cont_${ctrl.EbSid_CtxId}`;
        this.Toggle = `#cont_${ctrl.EbSid_CtxId} .dpctrl-options-cont .dpctrl-change`;
        this.setupImgUploader();
        this.initImages($(`#cont_${ctrl.EbSid_CtxId} .ebimg-cont img`));
        
        $.extend(ctrl, { getValue: this.GetValue.bind(ctrl), setValue: this.SetValue.bind(ctrl) });
    }

    initImages($img) {
        $img.attr('onerror', "this.style.opacity='0.5'; this.src='/images/image.png';");
        $img.css('height', $img.css('height'));
        this.$ctrlCont.hover(function (e) { $img.parent().next().show(); }, function (e) { $img.parent().next().hide(); });
    }

    setupImgUploader() {
        let resizeViewPort = this.control.CropAspectRatio === 4 ? true : false;
        let cxt = 'logo';
        if (this.control.CropAspectRatio === 1)
            cxt = 'dp';
        else if (this.control.CropAspectRatio === 2)
            cxt = 'doc';
        else if (this.control.CropAspectRatio === 3)
            cxt = 'location';

        this.fileUpload = new EbFileUpload({
            Type: "image",
            Toggle: this.Toggle,
            TenantId: ebcontext.sid,
            UserId: ebcontext.user.UserId,
            SolutionId: ebcontext.sid,
            Container: this.ctrlCont,
            Multiple: false,
            ServerEventUrl: 'https://se.eb-test.xyz',
            EnableTag: false,
            EnableCrop: true,
            ExtraData: {},//extra data for location optional for other
            Context: cxt,//if single and crop
            ResizeViewPort: resizeViewPort //if single and crop
        });

        this.fileUpload.uploadSuccess = function (fileid) {
            EbMessage("show", { Message: "Uploaded Successfully" });
            setTimeout(function () {
                this.control.SetValue(fileid.toString());
            }.bind(this), 2000);
        };
        this.fileUpload.windowClose = function () {
            EbMessage("show", { Message: "window closed", Background: "red" });
        };
    }

    GetValue(p1) {
        if (this.hasOwnProperty('_fileRefids'))
            this._fileRefids.join(',');
        else
            return '';            
    }

    SetValue(p1) {
        this._fileRefids = p1.split(',');
        $(`#cont_${this.EbSid_CtxId} .ebimg-cont img`).attr('src', `../images/${this._fileRefids[0]}.jpg`);
        $(`#cont_${this.EbSid_CtxId} .ebimg-cont img`).css('opacity', `1`);
    }


}

//=======================================================================================================================================

class DisplayPictureControl {
    constructor(ctrl, options) {
        this.control = ctrl;
        this.Options = $.extend({
            EnableTag: false,
            Categories: [],
            //UserId: 0,
            //UploadToEb: false,
            Container: `cont_${ctrl.EbSid_CtxId}`,
            Toggle: `#cont_${ctrl.EbSid_CtxId} .dpctrl-options-cont .dpctrl-change`,
            ResizeViewPort: this.control.CropAspectRatio === 0 ? true : false,
            Context: 'location',
            Multiple: false,
            EnableCrop: true
        }, options);


        this.Files = [];
        //this.RefIds = [];
        this.SingleRefid = null;
        //this.FileList = [];
        this.Multiple = this.Options.Multiple ? "multiple" : "";
        this.init();

        $.extend(ctrl, {
            getValue: this.GetValue.bind(ctrl),
            setValue: this.SetValue.bind(ctrl),
            refresh: this.Refresh.bind(ctrl),
            clear: this.Clear.bind(ctrl)
        });
    }

    init() {
        this.initDpImages();
        this.Modal = this.outerHtml();
        this.cropfyFlow();
        $(this.Options.Toggle).off("click").on("click", this.toggleModal.bind(this))
        $(`#${this.Options.Container}-upl-ok`).off("click").on("click", this.ok.bind(this));
        $(`#${this.Options.Container}-file-input`).off("change").on("change", this.browse.bind(this));
        $(`#${this.Options.Container}-upload-lin`).off("click").on("click", this.upload.bind(this));
        this.Modal.on("show.bs.modal", function () { if (this.Options.ServerEventUrl) this.startSE();}.bind(this));
    }

    initDpImages() {
        let $img = $(`#cont_${this.control.EbSid_CtxId} .ebimg-cont img`);
        $img.attr('onerror', "this.style.opacity='0.5'; this.src='/images/image.png';");
        $img.css('height', $img.css('height'));
        $(`#cont_${this.control.EbSid_CtxId}`).hover(function (e) { $img.parent().next().css('visibility', 'visible'); }, function (e) { $img.parent().next().css('visibility', 'hidden'); });
        if (this.control.EnableFullScreen === true) {
            this.$FullScreen = this.appendFSHtml();
            $img.on('click', function (evt) {
                this.$FullScreen.find('.FupimgIcon').attr('src', $(evt.target).attr('src'));
                this.$FullScreen.show();
            }.bind(this));
        }
    }

    cropfyFlow() {      //cropy flow
        if (this.control.CropAspectRatio === 1)
            this.Options.Context = 'dp';
        this._typeRatio = {
            'dp': {
                width: 200,
                height: 200
            },
            'location': {
                width: 250,
                height: 100
            }
        };

        this.Cropy = $("#" + this.Options.Container + "_cropy_container").croppie({
            viewport: this._typeRatio[this.Options.Context],
            enableOrientation: true,
            enableResize: this.Options.ResizeViewPort,
            enforceBoundary: false,
            enableExif: true
        });

        $(`#${this.Options.Container}-upl-container .modal-footer`).append(`
                                        <button class="pull-right crop-btn eb_btngreen" id="${this.Options.Container}-crop-lin">
                                            <i class="fa fa-crop"></i>
                                        </button>
                                    `);
        $(`#${this.Options.Container}-crop-lin`).off("click").on("click", this.cropClick.bind(this));
    }

    cropClick(e) {//cropy flow
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        this.Cropy.croppie('result', this.result).then(this.cropafter.bind(this));
    }

    cropafter(b64) {//cropy flow
        this.Cropy.croppie('bind', {
            url: b64
        });

        let block = b64.split(";");
        let contentType = block[0].split(":")[1];
        let realData = block[1].split(",")[1];
        let blob = this.b64toBlob(realData, contentType);
        this.replaceFile(blob, this.FileName, contentType);
    }

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

    replaceFile(file, filename, contentType) {
        for (let k = 0; k < this.Files.length; k++) {
            if (filename === this.Files[k].name) {
                this.Files[k] = new File([file], filename, { type: contentType });
                break;
            }
        }
    }

    ok(e) {
        this.toggleModal(e);
        this.windowClose();
    }

    toggleModal(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        this.Modal.modal("toggle");
    }

    browse(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (window.File && window.FileReader && window.FileList && window.Blob) {
            this.handleFileSelect(e);
        } else {
            alert('The File APIs are not fully supported in this browser.');
        }
    }

    handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        let files = evt.target.files || evt.originalEvent.dataTransfer.files; // FileList object

        for (var i = 0; i < files.length; i++) {
            if (!files[i].type.match('image.*')) {
                continue;
            }
            let reader = new FileReader();
            reader.onload = (function (file) {
                return function (e) {//cropy flow
                    (this.validate(file)) ? this.setCropUrl(e, file) : null;
                }.bind(this);

            }.bind(this))(files[i]);

            reader.readAsDataURL(files[i]);
        }
    }

    validate(file) {
        let stat = true;
        for (let k in this.Files) {
            if (file.name === this.Files[k].name) {
                stat = false;
                break;
            }
        }
        return stat;
    }

    setCropUrl(e, file) {//cropy flow
        this.Files[0] = file;
        this.FileName = file.name;
        this.Cropy.croppie('bind', {
            url: e.target.result
        });
        $(`#${this.Options.Container}-upload-lin`).show();
    }

    upload(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        this.comUpload();
    }

     comUpload() {

        for (let k = 0; k < this.Files.length; k++) {
            let formData = new FormData();
            formData.append("File", this.Files[k]);
            formData.append("Tags", this.getTag(this.Files[k]));
            formData.append("Category", this.readCategory(this.Files[k]));
            if (this.Options.Context)
                formData.append("Context", this.Options.Context);
            $.ajax({
                url: location.origin + "/StaticFile/UploadImageAsync",
                type: "POST",
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                beforeSend: function (evt) {
                    $(`#${this.Options.Container}-loader`).EbLoader("show");
                }.bind(this)
            }).done(function (refid) {
                $(`#${this.Options.Container}-loader`).EbLoader("hide");
                this.toggleModal();
                this.uploadSuccess(refid);
            }.bind(this));
        }
    }

    getTag(file) {
        return '';
        //let f = this.replceSpl(file.name);
        //return $(`#${f}-tags_input`).tagsinput("items");
    }

    readCategory(file) {
        return '';
        //let f = this.replceSpl(file.name);
        //return $(`#${f}-category`).val().split();
    }

    replceSpl(s) {
        try {
            return s.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/g, "").replace(/\s/g, "");
        }
        catch{
            return s.replace(".", "").replace(/\s/g, "");
        }
    }

    uploadSuccess(refId) {
        this.SingleRefid = refId;
        EbMessage("show", { Message: 'Changes Affect only if Form is Saved', AutoHide: true, Background: '#0000aa' });
        setTimeout(function () {
            this.control.setValue(this.SingleRefid.toString());
        }.bind(this), 2500);
    }

    startSE() {
        this.ss = new EbServerEvents({ ServerEventUrl: this.Options.ServerEventUrl, Channels: ["file-upload"] });
        this.ss.onUploadSuccess = function (ImageRefid) {

        }.bind(this);
    }

    outerHtml() {
        $("body").append(`<div id="${this.Options.Container}-upl-container-outer" class="upl-container-outer">
                            <div id="${this.Options.Container}-upl-container" class="modal fade upl-container" role="dialog">
                              <div class="modal-dialog">
                                <div class="modal-content">
                                  <div class="modal-header">
                                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                                    <h4 class="modal-title">File Uploader</h4>
                                    <div id="${this.Options.Container}-loader" class="upl-loader"></div>
                                  </div>
                                  <div class="modal-body">
                                        <div class="eb-upl-dbywraper display-flex">
                                            ${this.decideCtrl()}
                                        </div>
                                  </div>
                                  <div class="modal-footer"> 
                                        <button class="modal-ok pull-right" id="${this.Options.Container}-upl-ok">Ok</button>
                                        <input type="file" id="${this.Options.Container}-file-input" style="display:none;" ${this.Multiple}/>
                                        <button class="browse-btn" onclick="$('#${this.Options.Container}-file-input').click();">
                                            <i class="fa fa-folder-open-o"></i> Browse
                                        </button>
                                        <button class="pull-right upload_btn eb_btngreen" id="${this.Options.Container}-upload-lin">
                                            <i class="fa fa-upload"></i> Upload
                                        </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>`);

        return $(`#${this.Options.Container}-upl-container`);
    }

    decideCtrl() {
        let html = null;
        if (!this.Options.Multiple && this.Options.EnableCrop) {
            html = `<div class="cropy_container">
                        <div id="${this.Options.Container}_cropy_container" class="cropy_container-inner">
                        </div>
                    </div>`;
        }
        else {
            html = `<div class="eb-upl-bdy" id="${this.Options.Container}-eb-upl-bdy">
                    <div class="placeholder" id="${this.Options.Container}-placeholder">Drop Files Here</div>
               </div>`;
        }
        return html;
    }

    appendFSHtml() {
        $("body").append(`<div class="ebDpFullscreen_wraper-fade"></div>
                        <div class="ebDpFullscreen_wraper" style='padding: 20px 60px 20px 60px;'>
                            <button class="FsClse" onclick="$('.ebDpFullscreen_wraper,.ebDpFullscreen_wraper-fade').hide();"><i class="fa fa-close"></i></button>
                            <div class="ebDpFullscreen_inner">
                                <img src="~/images/web.png" class="FupimgIcon" />                                
                            </div>
                        </div>`);
        return $(".ebDpFullscreen_wraper,.ebDpFullscreen_wraper-fade");
    }

    GetValue(p1) {
        if (this.hasOwnProperty('_fileRefids'))
            return this._fileRefids.join(',');
        else
            return '';
    }
    SetValue(p1) {
        this._fileRefids = p1.split(',');
        $(`#cont_${this.EbSid_CtxId} .ebimg-cont img`).attr('src', `/images/${this._fileRefids[0]}.jpg`);
        $(`#cont_${this.EbSid_CtxId} .ebimg-cont img`).css('opacity', `1`);
    }
    Refresh() {

    }
    Clear() {

    }
}