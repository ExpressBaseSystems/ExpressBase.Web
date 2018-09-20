class EbCropper {
    constructor(options) {
        this.Options = $.extend({}, options);
        this.Result = "base64";
        this.FileUrl = null;
        this.Url = null;
        this.Cropy = null;
        this.FileName = null;
        this.CrpModal = this.appendModal();
        this.initCroper();
    };

    getFile(b65, filename) { }

    initCroper() {
        this.CrpModal.on('shown.bs.modal', this.modalShown.bind(this));
        $(this.Options.Toggle).off("click").on("click", this.toggleModal.bind(this));

        this.cropfy();
        $("." + this.Options.Container + "_rotate").closest(".btn").on("click", this.rotate.bind(this));
        $("#" + this.Options.Container + "_crop").closest(".btn").on("click", this.crop.bind(this));
        $("#" + this.Options.Container + "_save").off("click").on("click", this.saveCropfy.bind(this));
    }

    appendModal() {
        $('body').append(`<div class="modal fade" id="${this.Options.Container}crp_modal" tabindex="-1" role="dialog" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                              <div class="modal-content cropfy_modal" style="border-radius:0;border:none;">
                                <div class="modal-header cropfy_header" style="background: #3e8ef7;color: white;">
                                  <h5 class="modal-title" id="exampleModalLongTitle">Crop Image</h5>
                                    <i class="material-icons cropfy_close pull-right" data-dismiss="modal" style="margin-top:-2.5%;cursor: pointer" id="${this.Container}_close">close</i>
                                </div>
                                <div class="modal-body">
                                    <div class="cropy_container" style="height:450px;width:100%;padding-bottom:50px;">
                                        <div id="${this.Options.Container}_cropy_container">
                                        </div>
                                    </div>
                                <div class="modal-footer cropfy_footer" id="${this.Options.Container}_cropy_footer" style="padding-bottom: 0;padding-right:0;padding-left: 0;">
                                    <div class="btn-group" role="group">
                                    <button type="button" title="rotate_l" class="btn btn-secondary ${this.Options.Container}_rotate"><i class="fa fa-undo"></i></button>
                                    <button type="button" title="rotate_r" class="btn btn-secondary ${this.Options.Container}_rotate"><i class="fa fa-repeat"></i></button>
                                    </div>
                                  <button type="button" class="btn btn-primary" style="background-color:#528ff0;" id="${this.Options.Container}_crop"><i class="fa fa-crop"></i></button>
                                    <button type="button" class="btn btn-primary eb_btngreen" id="${this.Options.Container}_save"><i class="fa fa-save"></i></button>
                                </div>
                              </div>
                            </div>
                          </div>`);

        return $("#" + this.Options.Container + "crp_modal");
    };

    toggleModal(e) {
        this.CrpModal.modal("toggle");
    };

    cropfy() {
        this.Cropy = $("#" + this.Options.Container + "_cropy_container").croppie({
            viewport: {
                width: 200,
                height: 200
            },
            enableOrientation: true,
            enableResize: true,
            enforceBoundary: false,
            enableExif: true
        });
    };

    rotate(e) {
        var wdo = $(e.target).closest(".btn").attr("title");
        if (wdo === "rotate_r")
            this.cropie.croppie('rotate', 90);
        else
            this.cropie.croppie('rotate', -90);
    };

    crop() {
        this.Cropy.croppie('result', this.Result).then(this.cropafter.bind(this));
    };

    cropafter(b64) {
        this.FileUrl = b64;
        this.Cropy.croppie('bind', {
            url: this.FileUrl,
        });
    };

    modalShown() {
        this.Cropy.croppie('bind', {
            url: this.Url,
        });
    };

    saveCropfy(e) {
        this.toggleModal();
        this.getFile(this.FileUrl, this.FileName);
    };
};

class EbFileUpload {
    constructor(options) {
        this.Options = $.extend({}, options);
        this.Files = [];
        this.RefIds = [];
        this.IsCropFlow = false;
        this.Multiple = (this.Options.Multiple) ? "multiple" : "";
        if (this.validateOpt())
            this.init();
    };

    uploadSuccess(refId) { };
    windowClose() { };

    validateOpt() {
        if (!this.Options.Container) {
            console.log("error:::Property 'Container' should be declared!");
            return false;
        }
        else if (!this.Options.Toggle) {
            console.log("error:::Property 'Toggle' should be declared!");
            return false;
        }
        else if (!this.Options.Type) {
            console.log("error:::FileType should be specified");
            return false;
        }
        return true;
    };

    init() {
        this.Modal = this.outerHtml();
        if (!this.Options.Multiple && this.Options.EnableCrop)
            this.cropfyFlow();
        else if (this.Options.Multiple && this.Options.EnableCrop)
            this.multiThumbFlow();
        else
            this.multiThumbFlow();

        $(this.Options.Toggle).off("click").on("click", this.toggleM.bind(this));
        $(`#${this.Options.Container}-upl-ok`).off("click").on("click", this.ok.bind(this));
        $(`#${this.Options.Container}-file-input`).off("change").on("change", this.browse.bind(this));
        $(`#${this.Options.Container}-upload-lin`).off("click").on("click", this.upload.bind(this));
        this.Modal.on("show.bs.modal", this.onToggleM.bind(this));
    };

    cropfyFlow() {      //cropy flow
        this.IsCropFlow = true;
        this._typeRatio = {
            'logo': {
                width: 250,
                height: 100
            },
            'dp': {
                width: 100,
                height: 100
            },
            'doc': {
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
    };

    multiThumbFlow() {
        this.IsCropFlow = false;
        this.FullScreen = this.fullScreen();
        if (this.Options.EnableCrop) {
            this.Cropy = this.initCropy();
            this.Cropy.getFile = function (b64, filename) {
                let block = b64.split(";");
                let contentType = block[0].split(":")[1];
                let realData = block[1].split(",")[1];
                let blob = this.b64toBlob(realData, contentType);
                this.replaceFile(blob, filename, contentType);
                $(`div[file='${filename.replace(".", "")}']`).find("img").attr("src", b64);
            }.bind(this);
        }
        this.Modal.find('.eb-upl-bdy').on("dragover", this.handleDragOver.bind(this));
        this.Modal.find('.eb-upl-bdy').on("drop", this.handleFileSelect.bind(this));
    };


    initCropy() {
        return (new EbCropper({
            Container: 'container_crp',
            Toggle: '._crop',
            ResizeViewPort: this.Options.ResizeViewPort
        }));
    }

    cropImg(e) {
        this.Cropy.Url = $(e.target).closest(".file-thumb-wraper").find("img").attr("src");
        this.Cropy.FileName = $(e.target).closest(".eb-upl_thumb").attr("exact");
        this.Cropy.toggleModal();
    };

    onToggleM() {
        if (this.Options.ServerEventUrl)
            this.startSE();
    }

    toggleM() {
        this.Modal.modal("toggle");
    };

    ok() {
        this.toggleM();
        this.windowClose();
    };

    browse(e) {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            this.handleFileSelect(e);
        } else {
            alert('The File APIs are not fully supported in this browser.');
        }
    };

    handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.originalEvent.dataTransfer.dropEffect = "copy"; // Explicitly show this is a copy.
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

                if (!this.IsCropFlow)
                    return function (e) {
                        (this.validate(file)) ? this.drawThumbNail(e, file) : null;
                    }.bind(this);
                else
                    return function (e) {//cropy flow
                        (this.validate(file)) ? this.setCropUrl(e, file) : null;
                    }.bind(this);

            }.bind(this))(files[i]);

            reader.readAsDataURL(files[i]);
        }
    }

    setCropUrl(e, file) {//cropy flow
        this.Files[0] = file;
        this.FileName = file.name;
        this.Cropy.croppie('bind', {
            url: e.target.result,
        });
        $(`#${this.Options.Container}-upload-lin`).show();
    }

    validate(file) {
        let stat = true;
        for (let k in this.Files) {
            if (file.name === this.Files[k].name) {
                stat = false;
                break;
            }
        }
        if (!this.Options.Multiple) {
            if (this.Files.length === 1)
                stat = false;
        }
        return stat;
    }

    drawThumbNail(e, file) {
        $(`#${this.Options.Container}-eb-upl-bdy`).append(`
                                                        <div class="file-thumb-wraper">
                                                            <div class="eb-upl_thumb" exact="${file.name}" file="${file.name.replace('.', '')}">
                                                                <div class="eb-upl-thumb-bdy">
                                                                    <img src="${e.target.result}"/>
                                                                </div>
                                                                <div class="eb-upl-thumb-info">
                                                                    <h4 class="fname text-center">${file.name}</h4>
                                                                    <h4 class="size text-center">${parseFloat((file.size / (1024))).toFixed(3)} Kb</h4>
                                                                </div>
                                                                <div class="eb-upl-loader">
                                                                    <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div>
                                                                    <div></div><div></div><div></div><div></div><div>
                                                                    </div><div></div><div></div></div>
                                                                 </div>
                                                                <div class="eb-upl-thumb-footer display-flex">
                                                                    ${this.thumbButtons(file)}
                                                                    <span class="fa fa-check-circle-o success"></span><span class="fa fa-exclamation-circle error"></span>                                                                    
                                                                </div>
                                                            </div>
                                                        </div>
                                                        `);

        $(`#${file.name.replace('.', '')}-del`).off("click").on("click", this.delThumb.bind(this));
        $(`#${file.name.replace('.', '')}-fullscreen`).off("click").on("click", this.setFullscreen.bind(this));

        if (this.Options.EnableTag) {
            $(`#${file.name.replace('.', '')}-tags_input`).tagsinput();
            $(`#${file.name.replace('.', '')}-tag`).off("click").on("click", this.tagClick.bind(this));
        }

        if (this.Options.EnableCrop)
            $(`#${file.name.replace('.', '')}-crop`).off("click").on("click", this.cropImg.bind(this));

        this.Files.push(file);
        this.isDropZoneEmpty();
    };

    tagClick(e) {
        $(e.target).closest("button").siblings(".upl-thumbtag").toggle();
    }

    thumbButtons(file) {
        let html = new Array();
        html.push(`<button class="upl-thumb-btn" size="${parseFloat((file.size / (1024))).toFixed(3)}" fname="${file.name}" id="${file.name.replace('.', '')}-fullscreen"><i class="fa fa-arrows-alt"></i></button>`);
        html.push(`<button class="upl-thumb-btn" fname="${file.name}" id="${file.name.replace('.', '')}-del"><i class="fa fa-trash-o"></i></button>`);

        if (this.Options.EnableTag)
            html.push(`<button class="upl-thumb-btn" fname="${file.name}" id="${file.name.replace('.', '')}-tag"><i class="fa fa-tags"></i></button>
                        <div class="upl-thumbtag" id="${file.name.replace('.', '')}-tagpop">
                             <input data-role="tagsinput"  id="${file.name.replace('.', '')}-tags_input" type="text"/>
                        </div>`);

        if (this.Options.EnableCrop)
            html.push(` <button class="upl-thumb-btn _crop" fname="${file.name}" id="${file.name.replace('.', '')}-crop"><i class="fa fa-crop"></i></button>`);
        return html.join("");
    }

    isDropZoneEmpty() {
        if (this.Files.length <= 0) {
            $(`#${this.Options.Container}-placeholder`).show();
            $(`#${this.Options.Container}-upload-lin`).hide();
        }
        else {
            $(`#${this.Options.Container}-placeholder`).hide();
            $(`#${this.Options.Container}-upload-lin`).show();
        }
    }

    delThumb(e) {
        let ctrl = $(e.target).closest("button");
        for (let i = 0; i < this.Files.length; i++) {
            if (this.Files[i].name === ctrl.attr("fname")) {
                this.Files.splice(i, 1);
                break;
            }
        }
        $(e.target).closest(".file-thumb-wraper").remove();
        document.getElementById("uploadtest-file-input").value = "";
        this.isDropZoneEmpty();
    }

    setFullscreen(e) {
        let txt = $(e.target).closest("button").attr("fname") + " (" + $(e.target).closest("button").attr("size") + " Kb)";
        this.FullScreen.modal("show");
        let ctrl = $(e.target).closest(".eb-upl_thumb");
        let img = ctrl.find("img").attr("src");
        this.FullScreen.find("img").attr("src", img);
        this.FullScreen.find(".img-info").text(txt);
    }

    upload(e) {
        if (this.IsCropFlow)
            this.contextUpload();
        else
            this.comUpload();
    };

    contextUpload() {
        var url = "";
        if (this.Options.Context === "logo")
            url = "../StaticFile/UploadLogoAsync";
        else if (this.Options.Context === "dp")
            url = "../StaticFile/UploadDPAsync";
        else if (this.Options.Context === "location")
            url = "../StaticFile/UploadLocAsync";

        for (let k = 0; k < this.Files.length; k++) {
            let formData = new FormData(this.Files[k]);
            formData.append("File", this.Files[k]);

            $.ajax({
                url: url,
                type: "POST",
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                beforeSend: function (evt) {

                }.bind(this)
            }).done(function (refid) {
                alert(refid);
            }.bind(this));
        }
    }

    comUpload() {

        for (let k = 0; k < this.Files.length; k++) {
            let thumb = null;
            let formData = new FormData(this.Files[k]);
            formData.append("File", this.Files[k]);
            formData.append("Tags", this.getTag(this.Files[k]));

            $.ajax({
                url: "../StaticFile/UploadImageAsyncFromForm",
                type: "POST",
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                beforeSend: function (evt) {
                    thumb = $(`#${this.Options.Container}-eb-upl-bdy div[file='${this.Files[k].name.replace('.', '')}']`);
                    thumb.find(".eb-upl-loader").show();
                }.bind(this)
            }).done(function (refid) {
                this.successOper(thumb, refid);
            }.bind(this));
        }
    }

    cropClick(e) {//cropy flow
        this.Cropy.croppie('result', this.result).then(this.cropafter.bind(this));
    }

    cropafter(b64) {//cropy flow
        this.Cropy.croppie('bind', {
            url: b64,
        });

        let block = b64.split(";");
        let contentType = block[0].split(":")[1];
        let realData = block[1].split(",")[1];
        let blob = this.b64toBlob(realData, contentType);
        this.replaceFile(blob, this.FileName, contentType);
    };

    getTag(file) {
        let f = file.name.replace(".", "");
        return $(`#${f}-tags_input`).tagsinput("items");
    }

    successOper(thumb, refid) {
        thumb.find(".eb-upl-loader").hide();
        if (refid > 0) {
            thumb.find(".success").show();
            thumb.find(".error").hide()
            thumb.closest('file-thumb-wraper').remove();
            for (let i = 0; i < this.Files.length; i++) {
                if (this.Files[i].name === thumb.attr("exact")) {
                    this.uploadSuccess(refid);
                    this.Files.splice(i, 1);
                    break;
                }
            }
        }
        else {
            thumb.find(".error").show()
            thumb.find(".success").hide();
        }
    }

    outerHtml() {
        $("body").append(`<div id="${this.Options.Container}-upl-container-outer" class="upl-container-outer">
                            <div id="${this.Options.Container}-upl-container" class="modal fade upl-container" role="dialog">
                              <div class="modal-dialog">
                                <div class="modal-content">
                                  <div class="modal-header">
                                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                                    <h4 class="modal-title">File Uploader</h4>
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

    fullScreen() {
        $("body").append(`<div id="${this.Options.Container}-upl-container-fullscreen" class="upl-container-fullscreen">
                            <div id="${this.Options.Container}-upl-fullscreen" class="modal fade upl-fullscreen" role="dialog">
                              <div class="modal-dialog">
                                <div class="modal-content">
                                  <div class="modal-header">
                                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                                    <h4 class="modal-title display-inline">Detailed Preview</h4>
                                    <span class="img-info">amal.jpg 56.8 kb</span>
                                  </div>
                                  <div class="modal-body">
                                        <div class="upl-body">
                                            <img src=""/>
                                        </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>`);

        return $(`#${this.Options.Container}-upl-fullscreen`);
    };

    startSE() {
        this.ss = new EbServerEvents({ ServerEventUrl: this.Options.ServerEventUrl, Channels: ["file-upload"] });
        this.ss.onUploadSuccess = function (ImageRefid) {

        }.bind(this);
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
};