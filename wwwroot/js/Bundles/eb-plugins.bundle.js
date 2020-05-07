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
function EbDialog(action, options) {
    var operation = action;
    var settings = $.extend({
        Message: "Nothing specified",
        Buttons: {
            "Ok": {
                Background: "#508bf9",
                Align: "left",
                FontColor:"white;"
            },
            "Cancel": {
                Background: "#989898",
                Align: "right",
                FontColor: "white"
            }
        },
        CallBack: function (name) { }
    }, options);

    function div() {
        if ($("#eb_dlogBox_container").length === 0)
            $('body').append(`<div class="eb_dlgMsk"></div>
                                <div class="eb_dlogBox_container" id="eb_dlogBox_container">
                                    <div class="cw">
                                        <div class="_cls"><i class="fa fa-close"></i></div>
                                        <div class="msgbdy">${settings.Message}</div>
                                        <div class="cnfrmBox-btnc">
                                            ${generateBtn()}
                                        </div>
                                    </div>
                                </div>`);
        else {
            $(`#eb_dlogBox_container .msgbdy`).text(settings.Message);
            $(`#eb_dlogBox_container .cnfrmBox-btnc`).html(generateBtn());
        }
        $(".dlgBoxBtn-cust").off("click").on("click", function (ev) {
            let n = $(ev.target).attr("name");
            settings.CallBack(n);
            hideMsg();
        });
        $("#eb_dlogBox_container ._cls").on("click", function () { settings.CallBack("close"); hideMsg(); });
    }

    function showMsg() {
        div();
        $(`#eb_dlogBox_container,.eb_dlgMsk`).fadeIn();
    };

    function hideMsg() {
        $(`#eb_dlogBox_container,.eb_dlgMsk`).fadeOut();
    };

    function generateBtn() {
        let html = [];
        for (let key in settings.Buttons) {
            html.push(`<button name="${key}" class="btn dlgBoxBtn-cust pull-${settings.Buttons[key].Align}"
                style="background:${settings.Buttons[key].Background};color:${settings.Buttons[key].FontColor}">${key}</button>`);
        }
        return html.join(" ");
    }

    if (operation === "show") {
        showMsg();
        return true;
    }
    else if (operation === "hide") {
        hideMsg();
        return false;
    }
    else return null;
};
class string {
    static Format(literel, ...params) {
        let s = literel;
        for (let i = 0; i < params.length; i++) {
            s = s.replace(`{${i}}`, params[i]);
        }
        return s;
    }

    static Clone(literal) {
        return new String(literal).toString();
    }
};

Array.prototype.Contains = function (item) {
    let stat = false;
    for (let i = 0; i < this.length; i++) {
        if (this[i] === item) {
            stat = true;
            break;
        }
    }
    return stat;
};

function is_cached(src) {
    var image = new Image();
    image.src = src;
    return image.complete;
}

class EbFupStaticData {
    constructor() {
        this.SpinImage = `data:image/gif;base64,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`;
    }
}

class EbFileUpload extends EbFupStaticData {
    constructor(options) {
        super();
        this.Options = $.extend({
            EnableTag: false,
            Categories: [],
            UserId: 0,
            UploadToEb: false,
        }, options);
        this.MaxSize = this.Options.MaxSize || 5;
        this.Files = [];
        this.RefIds = [];
        this.SingleRefid = null;
        this.FileList = [];
        this.IsCropFlow = false;
        this.CurrentFimg = null;
        this.Multiple = (this.Options.Multiple) ? "multiple" : "";
        if (this.validateOpt())
            this.init();
    }

    uploadSuccess(refId) { this.SingleRefid = refId };
    windowClose() { };
    getFileRef() { return this.SingleRefid };
    customTrigger(name, filerefs) { }

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

        if ('PreviewWraper' in this.Options) {
            this.Gallery = this.appendGallery();
            this.GalleryFS = this.appendFSHtml();
            this.pullFile();
            $(".prevImgrout,.nextImgrout").off("click").on("click", this.fscreenN_P.bind(this));
        }

        if (this.Options.EnableCrop) {
            this.Cropy = this.initCropy();
            this.Cropy.getFile = function (b64, filename) {
                let block = b64.split(";");
                let contentType = block[0].split(":")[1];
                let realData = block[1].split(",")[1];
                let blob = this.b64toBlob(realData, contentType);
                this.replaceFile(blob, filename, contentType);
                $(`div[file='${this.replceSpl(filename)}']`).find("img").attr("src", b64);
            }.bind(this);
        }
        this.Modal.find('.eb-upl-bdy').on("dragover", this.handleDragOver.bind(this));
        this.Modal.find('.eb-upl-bdy').on("drop", this.handleFileSelect.bind(this));
    };

    fscreenN_P(ev) {
        if (ev) {
            ev.preventDefault();
            ev.stopPropagation();
        }
        let action = $(ev.target).closest("button").attr("action");
        if (action === "next" && this.CurrentFimg.next('.trggrFprev').length > 0) {
            this.galleryFullScreen({ target: this.CurrentFimg.next('.trggrFprev') });
        }
        else if (action === "prev" && this.CurrentFimg.prev('.trggrFprev').length > 0) {
            this.galleryFullScreen({ target: this.CurrentFimg.prev('.trggrFprev') });
        }
    };

    appendGallery() {
        let $div = null;
        if ($(this.Options.PreviewWraper).length <= 0)
            $div = $('body');
        else
            $div = $(this.Options.PreviewWraper);
        $div.append(`<div id="${this.Options.Container}_GalleryUnq" class="ebFupGalleryOt">
                        <div class="ClpsGalItem_Sgl" Catogory="DEFAULT" alt="Default">
                            <div class="Col_head" data-toggle="collapse" data-target="#DEFAULT_ColBdy">DEFAULT <span class="FcnT"></span></div>
                            <div class="Col_apndBody collapse" id="DEFAULT_ColBdy">
                            <div class="Col_apndBody_apndPort"></div>
                            </div>
                        </div>
                        ${this.getCatHtml()}
                    </div>`);
        return $(`#${this.Options.Container}_GalleryUnq`);
    }

    appendFSHtml() {
        $("body").append(`<div class="ebFupGFscreen_wraper-fade"></div>
                             <div class="ebFupGFscreen_wraper">
                                 <button class="FsClse" onclick="$('.ebFupGFscreen_wraper,.ebFupGFscreen_wraper-fade').hide();">
                                    <i class="fa fa-close"></i></button>
                                <button class="prevImgrout roundstyledbtn" action="prev"><i class="fa fa-chevron-left"></i></button>
                                <button class="nextImgrout roundstyledbtn" action="next"><i class="fa fa-chevron-right"></i></button>
                                <div class="ebFupGFscreen_inner">
                                <img src="~/images/web.png" class="FupimgIcon" />
                                <div class="ebFupGFscreen_footr">
                                    <h1 class="Fname"></h1>
                                    <h3 class="Tags"></h3>
                                </div>
                            </div>
                        </div>`);
        return $(".ebFupGFscreen_wraper,.ebFupGFscreen_wraper-fade");
    }

    getCatHtml() {
        let html = new Array();
        if ('Categories' in this.Options) {
            for (let i = 0; i < this.Options.Categories.length; i++) {
                html.push(`<div class="ClpsGalItem_Sgl" Catogory="${this.Options.Categories[i]}" alt="${this.Options.Categories[i]}">
                            <div class="Col_head" data-toggle="collapse" data-target="#${this.Options.Container}_G_${this.Options.Categories[i].replace(/\s/g, "")}">${this.Options.Categories[i].toUpperCase()}
                            <span class="FcnT">(0)</span></div>
                            <div class="Col_apndBody collapse" id="${this.Options.Container}_G_${this.Options.Categories[i].replace(/\s/g, "")}">
                            <div class="Col_apndBody_apndPort"></div></div>
            </div>`);
            }
        }
        return html.join("");
    }

    pullFile() {
        if ('FilesUrl' in this.Options && this.Options.FilesUrl) {
            if (typeof this.Options.FilesUrl === "string") {
                $.ajax({
                    url: location.origin + this.Options.FilesUrl,
                    type: "GET",
                    cache: false,
                    contentType: false,
                    processData: false,
                    beforeSend: function (evt) {
                        $(`#${this.Options.Container}-loader`).EbLoader("show");
                    }.bind(this)
                }).done(function (list) {
                    $(`#${this.Options.Container}-loader`).EbLoader("hide");
                    this.FileList = JSON.parse(list);
                    this.renderFiles();
                }.bind(this));
            }
            else if (Array.isArray(this.Options.FilesUrl)) {
                this.FileList = this.Options.FilesUrl;
                this.renderFiles();
            }
        }
    }

    renderFiles() {
        for (let i = 0; i < this.FileList.length; i++) {
            let $portdef = $(`#${this.Options.Container}_GalleryUnq div[Catogory="DEFAULT"] .Col_apndBody_apndPort`);
            let $countdef = $(`#${this.Options.Container}_GalleryUnq div[Catogory="DEFAULT"] .Col_head .FcnT`);

            if (!("Category" in this.FileList[i].Meta) || this.FileList[i].Meta.Category.length <= 0 || this.FileList[i].Meta.Category[0] === "Category") {
                $portdef.append(this.thumbNprevHtml(this.FileList[i]));
                $countdef.text("(" + $portdef.children().length + ")");
            }
            else {
                for (let k = 0; k < this.FileList[i].Meta.Category.length; k++) {
                    let $portcat = $(`#${this.Options.Container}_GalleryUnq div[Catogory="${this.FileList[i].Meta.Category[k]}"] .Col_apndBody_apndPort`);
                    let $countcat = $(`#${this.Options.Container}_GalleryUnq div[Catogory="${this.FileList[i].Meta.Category[k]}"] .Col_head .FcnT`);
                    $portcat.append(this.thumbNprevHtml(this.FileList[i]));
                    $countcat.text("(" + $portcat.children().length + ")");
                }
            }
            $(`#prev-thumb${this.FileList[i].FileRefId}`).data("meta", JSON.stringify(this.FileList[i]));
        }

        $('.EbFupThumbLzy').Lazy({ scrollDirection: 'vertical' });
        $(".trggrFprev").off("click").on("click", this.galleryFullScreen.bind(this));
        $(".mark-thumb").off("click").on("click", function (evt) { evt.stopPropagation(); });
        $("body").off("click").on("click", this.rmChecked.bind(this));
        this.contextMenu();
    }

    rmChecked(evt) {
        this.Gallery.find(`.mark-thumb:checkbox:checked`).prop("checked", false);
    }

    thumbNprevHtml(o) {
        return (`<div class="eb_uplGal_thumbO trggrFprev" id="prev-thumb${o.FileRefId}" filref="${o.FileRefId}">
                <div class="eb_uplGal_thumbO_img">
                    <img src="${this.SpinImage}" data-src="/images/small/${o.FileRefId}.jpg" class="EbFupThumbLzy" style="display: block;">
                <div class="widthfull"><p class="fnamethumb text-center">${o.FileName}</p>
                <input type="checkbox" refid="${o.FileRefId}" name="Mark" class="mark-thumb">
                </div>
            </div>`);
    }

    galleryFullScreen(ev) {
        let fileref = $(ev.target).closest(".trggrFprev").attr("filref");
        this.GalleryFS.show();
        let o = JSON.parse($(ev.target).closest(".trggrFprev").data("meta"));

        if (is_cached(location.origin + `/images/large/${fileref}.jpg`)) {
            this.GalleryFS.eq(1).find('img').attr("src", `/images/large/${fileref}.jpg`);
        }
        else {
            this.GalleryFS.eq(1).find('img').attr("src", `/images/small/${fileref}.jpg`);
            this.GalleryFS.eq(1).find('img').attr("data-src", `/images/large/${fileref}.jpg`);
            this.GalleryFS.eq(1).find('img').Lazy({
                onError: function (element) { }
            });
        }
        this.GalleryFS.eq(1).find(".ebFupGFscreen_footr .Fname").text(o.FileName);
        this.GalleryFS.eq(1).find(".ebFupGFscreen_footr .Tags").html(this.getTagsHtml(o));
        this.CurrentFimg = $(ev.target).closest(".trggrFprev");
    }

    getTagsHtml(o) {
        let html = new Array();
        if ("Tags" in o.Meta) {
            for (let i = 0; i < o.Meta.Tags.length; i++) {
                html.push(`<span class="tagno-t">${o.Meta.Tags[i]}</span>`);
            }
        }
        return html.join("");
    }

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

    toggleM(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        this.Modal.modal("toggle");
    };

    ok(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        this.toggleM();
        this.windowClose();
    };

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
        //if (!this.Options.Multiple) {
        //    if (this.Files.length === 1)
        //        stat = false;
        //}
        return stat;
    }

    drawThumbNail(e, file) {
        if ((file.size / (1024)) < (this.MaxSize * 1024)) {
            $(`#${this.Options.Container}-eb-upl-bdy`).append(`
                                                        <div class="file-thumb-wraper">
                                                            <div class="eb-upl_thumb" exact="${file.name}" file="${this.replceSpl(file.name)}">
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

            $(`#${this.replceSpl(file.name)}-del`).off("click").on("click", this.delThumb.bind(this));
            $(`#${this.replceSpl(file.name)}-fullscreen`).off("click").on("click", this.setFullscreen.bind(this));

            if (this.Options.EnableTag) {
                $(`#${this.replceSpl(file.name)}-tags_input`).tagsinput();
                $(`#${this.replceSpl(file.name)}-tag`).off("click").on("click", this.tagClick.bind(this));
            }

            if (this.Options.EnableCrop)
                $(`#${this.replceSpl(file.name)}-crop`).off("click").on("click", this.cropImg.bind(this));

            this.Files.push(file);
            this.isDropZoneEmpty();
        }
        else {
            EbMessage("show", { Background: "red", Message: "Image size should not exceed " + this.MaxSize + " Mb" });
        }
    };

    tagClick(e) {
        $(e.target).closest("button").siblings(".upl-thumbtag").toggle();
    }

    thumbButtons(file) {
        let html = new Array();
        html.push(`<button class="upl-thumb-btn" size="${parseFloat((file.size / (1024))).toFixed(3)}" fname="${file.name}" id="${this.replceSpl(file.name)}-fullscreen"><i class="fa fa-arrows-alt"></i></button>`);
        html.push(`<button class="upl-thumb-btn" fname="${file.name}" id="${this.replceSpl(file.name)}-del"><i class="fa fa-trash-o"></i></button>`);

        if (this.Options.EnableTag)
            html.push(`<button class="upl-thumb-btn" fname="${file.name}" id="${this.replceSpl(file.name)}-tag"><i class="fa fa-tags"></i></button>
                        <div class="upl-thumbtag" id="${this.replceSpl(file.name)}-tagpop">
                             <input data-role="tagsinput"  id="${this.replceSpl(file.name)}-tags_input" type="text"/>
                        </div>`);

        if (this.Options.EnableCrop)
            html.push(` <button class="upl-thumb-btn _crop" fname="${file.name}" id="${this.replceSpl(file.name)}-crop"><i class="fa fa-crop"></i></button>`);
        if (this.Options.Categories)
            html.push(`<select class="ebfup_catogories" id="${this.replceSpl(file.name)}-category">${this.getCategory()}</select>`);
        return html.join("");
    }

    getCategory() {
        let html = new Array(`<option val="Category">Category</option>`);
        for (let i = 0; i < this.Options.Categories.length; i++) {
            html.push(`<option val="${this.Options.Categories[i]}">${this.Options.Categories[i]}</option>`);
        }
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
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (this.IsCropFlow)
            this.contextUpload();
        else
            this.comUpload();
    };

    contextUpload() {
        this.cropClick();

        var url = "";
        if (this.Options.Context === "logo")
            url = "../StaticFile/UploadLogoAsync";
        else if (this.Options.Context === "dp")
            url = "../StaticFile/UploadDPAsync";
        else if (this.Options.Context === "location")
            url = "../StaticFile/UploadLocAsync";

        for (let k = 0; k < this.Files.length; k++) {
            let formData = new FormData();
            formData.append("File", this.Files[k]);
            formData.append("SolnId", this.Options.SolutionId || "");

            if (this.Options.Context === "dp") {
                formData.append("UserId", this.Options.UserId);
                if (this.Options.UserId === 0) {
                    $(`#${this.Options.Container}-loader`).EbLoader("hide");
                    this.toggleM();
                    console.error("Userid must be set");
                    return false;
                }
            }

            $.ajax({
                url: url,
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
                this.toggleM()
            }.bind(this));
        }
    }

    comUpload() {
        let url = "";
        if (this.Options.UploadToEb) {
            url = location.origin + "/StaticFile/UploadImageToInfra";
        }
        else {
            url = location.origin + "/StaticFile/UploadImageAsync";
        }

        for (let k = 0; k < this.Files.length; k++) {
            let thumb = null;
            let formData = new FormData();
            formData.append("File", this.Files[k]);
            formData.append("Tags", this.getTag(this.Files[k]));
            formData.append("Category", this.readCategory(this.Files[k]));
            if (this.Options.Context)
                formData.append("Context", this.Options.Context);
            $.ajax({
                url: url,
                type: "POST",
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                beforeSend: function (evt) {
                    thumb = $(`#${this.Options.Container}-eb-upl-bdy div[file='${this.replceSpl(this.Files[k].name)}']`);
                    thumb.find(".eb-upl-loader").show();
                }.bind(this)
            }).done(function (refid) {
                this.successOper(thumb, refid);
            }.bind(this));
        }
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
            url: b64,
        });

        let block = b64.split(";");
        let contentType = block[0].split(":")[1];
        let realData = block[1].split(",")[1];
        let blob = this.b64toBlob(realData, contentType);
        this.replaceFile(blob, this.FileName, contentType);
    };

    getTag(file) {
        if (this.Options.EnableTag) {
            let f = this.replceSpl(file.name);
            return $(`#${f}-tags_input`).tagsinput("items");
        }
        else {
            return "";
        }
    }

    readCategory(file) {
        if (this.Options.Categories.length > 0) {
            let f = this.replceSpl(file.name);
            return $(`#${f}-category`).val().split();
        }
        else
            return "";
    }

    successOper(thumb, refid) {
        thumb.find(".eb-upl-loader").hide();
        if (refid > 0) {
            thumb.find(".success").show();
            thumb.find(".error").hide();
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

    replceSpl(s) {
        try {
            return s.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/g, "").replace(/\s/g, "");
        }
        catch{
            return s.replace(".", "").replace(/\s/g, "");
        }
    };

    contextMenu() {
        this.DefaultLinks = {
            "fold2": {
                "name": "Move to Category", icon: "fa-list",
                "items": this.getCateryLinks()
            }
        }

        $.contextMenu({
            selector: ".eb_uplGal_thumbO",
            autoHide: true,
            build: function ($trigger, e) {
                return {
                    items: $.extend({},
                        (this.Options.Categories.length > 0) ? this.DefaultLinks : {},
                        this.getCustomMenu())
                };
            }.bind(this)
        });
    }

    getCustomMenu() {
        let o = {};
        if ("CustomMenu" in this.Options && this.Options.CustomMenu.length > 0) {
            for (let i = 0; i < this.Options.CustomMenu.length; i++) {
                o[this.Options.CustomMenu[i].name] = {
                    name: this.Options.CustomMenu[i].name,
                    icon: this.Options.CustomMenu[i].icon,
                    callback: this.customeMenuClick.bind(this)
                }
            }
        }
        return o;
    }

    customeMenuClick(eType, selector, action, originalEvent) {
        let refids = [eval($(selector.$trigger).attr("filref"))];
        this.Gallery.find(`.mark-thumb:checkbox:checked`).each(function (i, o) {
            if (!refids.Contains(eval($(o).attr("refid"))))
                refids.push(eval($(o).attr("refid")));
        }.bind(this));
        this.customTrigger(eType, refids);
    }

    getCateryLinks() {
        let o = {};
        for (let i = 0; i < this.Options.Categories.length; i++) {
            o[this.Options.Categories[i]] = {
                name: this.Options.Categories[i],
                icon: "",
                callback: this.contextMcallback.bind(this)
            };
        }
        return o;
    }

    contextMcallback(eType, selector, action, originalEvent) {
        let refids = [eval($(selector.$trigger).attr("filref"))];
        this.Gallery.find(`.mark-thumb:checkbox:checked`).each(function (i, o) {
            if (!refids.Contains(eval($(o).attr("refid"))))
                refids.push(eval($(o).attr("refid")));
        }.bind(this));
        this.changeCatAjax(eType, refids);
    }

    changeCatAjax(cat, fileref) {
        let formData = new FormData();
        formData.append("Category", cat);
        formData.append("FileRefs", fileref.join(","));

        $.ajax({
            url: "../StaticFile/ChangeCategory",
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function (evt) {

            }.bind(this)
        }).done(function (status) {
            if (status)
                this.redrawCategry(fileref, cat);
        }.bind(this));
    }
    redrawCategry(fileref, cat) {
        let $t;
        for (let i = 0; i < fileref.length; i++) {
            $(`#${this.Options.Container}_GalleryUnq div[Catogory="${cat}"] .Col_apndBody_apndPort`).append(this.Gallery.find(`div[filref="${fileref[i]}"]`));
            $t = $(`#${this.Options.Container}_GalleryUnq div[Catogory="${cat}"] .Col_head .FcnT`);
            $t.text("(" + $(`#${this.Options.Container}_GalleryUnq div[Catogory="${cat}"] .Col_apndBody_apndPort`).children().length + ")");
        }
        this.Gallery.find(`.mark-thumb:checkbox:checked`).prop("checked", false)
    }

    deleteFromGallery(filerefs) {
        for (let i = 0; i < filerefs.length; i++) {
            this.Gallery.find(`div[filref="${filerefs[i]}"]`).remove();
        }
    }
};
function EbMessage(action, options) {
        var operation = action;
        var settings = $.extend({
            Background: "#31d031",
            Message: "nothing to display",
            FontColor: "#fff",
            AutoHide: true,
            Delay: 8000
        }, options);       

        function onHide() {
            return options.onHide();
        }

        function onShow() {
            return options.onShow();
        }
    
        function div() {
            if ($('#eb_messageBox_container').length === 0)
                $('body').append(`<div class="eb_messageBox_container" id="eb_messageBox_container" style="background-color:${settings.Background};color:${settings.FontColor}">
                                  <span class="msg">${settings.Message}</span>
                                  <i class="fa fa-close pull-right" onclick="$(this).parent().hide();" id="close-msg"></i>
                                </div>`);
            else {
                $(`#eb_messageBox_container .msg`).text(settings.Message);
                $(`#eb_messageBox_container`).css({ "background-color": settings.Background, "color": settings.FontColor });
            }
        }

        function showMsg() {
            div();
            $(`#eb_messageBox_container`).fadeIn();
            settings.AutoHide ? setTimeout(function () { hideMsg(); }, settings.Delay) : null;
            if (options.onShow)
                onShow();
        };

        function hideMsg() {
            $(`#eb_messageBox_container`).fadeOut();
            if (options.onHide)
                onHide();
        };
    
        if (operation === "show")
            showMsg();
        else if (operation === "hide")
            hideMsg();
        else return null;
        
    };
function EbPopBox(op,o) {
    var event = op;
    var settings = $.extend({
        Message: "nothing to display",
        Callback: function () {

        },
        ButtonStyle: {
            Text:"Close",
            Color: "white",
            Background: "#508bf9",
            Callback: function () {}
        },
        Title: "Message",
        Html: function ($selector) {

        }
    }, o);

    function popBoxHtml() {
        if ($("#eb-popbox-fade").length <= 0) {
            $("body").append(`<div class="eb-popbox-fade" id="eb-popbox-fade" style="position:fixed;display:none;
                                    height:100%;left:0;top:0;width:100%;background:black;opacity:.5;z-index:500">
                            </div>`);
        }
        if ($("#eb-popbox-container").length <= 0) {
            $('body').append(`<div class="eb-popbox-container" id="eb-popbox-container" style="position: fixed;display:none;
                                width: 100%;height: 100%;z-index: 1000;top: 0;left: 0;">
                                    <div class="eb-popbox-container-flex" style="height:inherit;width:inherit;
                                    display:flex;justify-content:center;align-items:center;">
                                        <div class="eb-popbox-container-inner" style="background:white;min-height: 200px;
                                        max-width:60%;display: flex;flex-flow: column;border: none;border-radius: 8px;
                                        box-shadow: 0 1px 3px 0 rgba(60, 64, 67, 0.3), 0 4px 8px 3px rgba(60, 64, 67, 0.15);min-width: 320px;">
                                            <div class="eb-popbox-container-head" style="padding: 15px;font-size: 16px;">
                                                ${settings.Title}
                                            </div>
                                            <div class="eb-popbox-container-bdy" style="flex: 1;padding: 0 15px;display:flex;align-items:center">
                                                ${settings.Message}
                                            </div>
                                            <div class="eb-popbox-container-footer" style="padding: 15px;display: flex;flex-flow: row-reverse;">
                                                <button id="eb-popbox-close" style="background: ${settings.ButtonStyle.Background};
                                                    color: ${settings.ButtonStyle.Color};
                                                    border-style: none;
                                                    border-radius: 4px;
                                                    padding: 5px 10px;">${settings.ButtonStyle.Text}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>`);
            $("#eb-popbox-close").on("click", function () { settings.ButtonStyle.Callback(); hideBox(); })
        }
        else {
            $("#eb-popbox-container .eb-popbox-container-head").text(settings.Title);
            $("#eb-popbox-container .eb-popbox-container-bdy").text(settings.Message);
        }
        settings.Html($("#eb-popbox-container .eb-popbox-container-bdy"));
    }

    function showBox() {
        popBoxHtml();
        $(`#eb-popbox-fade`).show();
        $(`#eb-popbox-container`).fadeIn();
    };

    function hideBox() {
        $(`#eb-popbox-fade`).hide();
        $(`#eb-popbox-container`).hide();
    };

    if (event === "show") {
        showBox();
        return true;
    }
    else if (event === "hide") {
        hideBox();
        return false;
    }
    else return false;
}
(function ($) {
    /*register loader*/
    $.fn.EbLoader = function (action,options) {
        /*the target*/
        var el = $(this);
        var operation = action;
        var settings = $.extend({
            color:"#ec9351",
            bgColor: 'transparent', // Default background color 
            maskItem: {},
            maskLoader:true
        }, options);

        //maskItem:{
        //Id: "",
        //Style:{}   //jquery css
        //}

        //Apply styles
        el.css("background-color", settings.bgColor);

        maskItem = $(settings.maskItem.Id);

        if (!el.hasClass('eb-loader-prcbar')) {
            el.addClass('eb-loader-prcbar');
        }
        else {
            showPrc();
        }

        if (action === "show") {
            if (!$.isEmptyObject(settings.maskItem)) {
                maskItem.append(`<div class="loader_mask_EB" id="${el.attr("id")}loader_mask_item"></div>`);
                appendMaskStyle();
            }
            if (settings.maskLoader) {
                $(`#${el.attr("id")}loader_mask_item`).append(`<div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div>
                                    <div></div><div></div><div></div><div></div><div>
                                    </div><div></div><div></div></div>`);
            }
        }

        function appendMaskStyle() {
            if (!$.isEmptyObject(settings.maskItem.Style)) {
                $(`#${el.attr("id")}loader_mask_item`).css(settings.maskItem.Style);
            }
        };
        
        //show function for processbar
        function showPrc() {
            el.show();
            if (!$.isEmptyObject(settings.maskItem))
                $(`#${el.attr("id")}loader_mask_item`).show();
        };
        
        //hide function for processbar
        function hidePrc() {
            el.hide();
            $(`#${el.attr("id")}loader_mask_item`).remove();
        };

        if (operation === "show")
            showPrc();
        else if (operation === "hide")
            hidePrc();
        else return null;    
    };
}(jQuery));
//{
//    element: ".class/#id",
//    content: "string",
//    title: "string",
//    timeout: 1000,
//}

class Tour {
    constructor(o) {
        this.tour = null;
        this.tc = 0;
        this.s = $.extend({
            WelcomeMessage: "",
            Description: "",
            Stack: []
        }, o);

        this.i();
        if (this.getCookie("ebwlkthrougstatusofforon") === "off")
            return false;
        this.tour.fade.show();
        this.tour.container.show();
        if (this.s.WelcomeMessage !== "") {
            this.tour.msgbox.show();
        }
        else {
            this.s_tour(this.tc);
        }
    };

    start() {
        this.tour.fade.show();
        this.tour.container.show();
        this.tc = 0;
        if (this.s.WelcomeMessage !== "") {
            this.tour.msgbox.show();
        }
        else {
            this.s_tour(this.tc);
        }
        return "Tour started";
    }

    close() {
        this.skipTour();
        return "Tour closed";
    }

    setWraper() {
        $("body").append(`<div class="ebTour_bodyWrpr"></div>
                          <div class="ebTour_bodyWrprInner">
                            <a class="touFtr-skip">Skip <i class="fa fa-step-forward" aria-hidden="true"></i></a>
                            <a class="touFtr-showAgn">Dont show again <i class="fa fa-power-off" aria-hidden="true"></i></a>
                            ${this.getWelcomeBox()}
                           </div>`);
        return { fade: $(".ebTour_bodyWrpr"), container: $(".ebTour_bodyWrprInner"), msgbox: $(".ebTour_welcomebox") };
    }

    getWelcomeBox() {
            return `<div class="ebTour_welcomebox">
                                <img src="/images/walls/tour-welcomebox.png"/>
                                <div class="ebTour_welcomebox_inner">
                                    <div class="title">${this.s.WelcomeMessage}</div>
                                    <div class="subtitle">${this.s.Description}</div>
                                    <div class="ebTour-startBtn-container">
                                        <button class="ebTour-startBtn" id="tour-trigger">Take a tour</button>
                                    </div>
                                </div>
                            </div>`;
    }

    g_position(el) {
        let p = "left:0";
        let ww = window.innerWidth;
        let l = el.offset().left + (el.innerWidth() / 2);
        let offset = ww - l;
        if (l + 350 > ww) {
            l = (ww - 350) - offset;
            p = "right:0 !important;transform: scaleX(-1);";
        }
        let t = el.offset().top + el.innerHeight() + 30;
        if ((t + el.innerHeight() + 25) > window.innerHeight) {
            t = t - el.innerHeight() +20;
        }
        return { l: l, t: t, pointer: p };
    }

    getStyle(pointer) {
        if (pointer.indexOf("right") >= 0)
            return "border-top-left-radius:6px !important;border-top-right-radius:0 !important";
        else
            return "";
    }

    s_tour(tc) {
        let el = null;
        if (this.s.Stack[tc].element.indexOf(".") >= 0)
            el = $(this.s.Stack[tc].element).eq(0);
        else if (this.s.Stack[tc].element.indexOf("#") >= 0)
            el = $(this.s.Stack[tc].element);
        else
            el = $(this.s.Stack[tc].element).eq(0);

        try {
            if ($(`#TourTile_${tc}`).length <= 0) {
                let p = this.g_position(el);
                this.tour.container.append(`<div class="TourTile" id="TourTile_${tc}" style="position:absolute;left:${p.l}px;top:${p.t}px;${this.getStyle(p.pointer)}">
                                        <div class="TourTileInner">
                                            <div class="TilePointer" style="${p.pointer}"></div>
                                            <div class="TourTileHead">
                                                <span>${this.s.Stack[tc].title}</span>
                                            </div>
                                            <div class="TourTileContent">
                                                <p>
                                                    ${this.s.Stack[tc].content}
                                                </p>
                                            </div>
                                            <div class="TourTileFooter">
                                                ${this.getLinks(tc)}
                                            </div>
                                        </div>
                                    </div>`);
                el.addClass("el_current");
                $(`#stack_el_${tc}_next`).off("click").on("click", this.t_nextclick.bind(this, el, $(`#TourTile_${tc}`)));
                $(`#stack_el_${tc}_prev`).off("click").on("click", this.t_prevclick.bind(this, el, $(`#TourTile_${tc}`)));
                $(`#stack_el_${tc}_click`).off("click").on("click", this.t_click.bind(this, el, $(`#TourTile_${tc}`)));
            }
            else {
                $(`#TourTile_${tc}`).fadeIn()
                el.addClass("el_current");
            }
        }
        catch (err) {
            throw err;
        }
    }

    getLinks = function (tc) {
        let html = [];
        if (tc != 0)
            html.push(`<button id="stack_el_${tc}_prev" class="TourTileBtn TourTilePrevBtn">&#8592; Prev</button>`);
        else {
            //html.push('<div></div>');
        }

        if ("click" in this.s.Stack[tc] && this.s.Stack[tc].click) {
            html.push(`<button id="stack_el_${tc}_click" class="TourTileBtn TourTileClickBtn">Click</button>`);
        }

        html.push(`<button id="stack_el_${tc}_next" class="TourTileBtn TourTileNextBtn">Next &#8594;</button>`);
        return html.join("");
    }

    t_nextclick(el, tile) {
        el.removeClass("el_current");
        tile.hide();
        if (this.tc === this.s.Stack.length - 1) {
            this.tour.fade.hide();
            this.tour.container.hide();
        }
        else {
            this.tc = this.tc + 1;
            this.s_tour(this.tc);
        }
    }

    t_prevclick(el, tile) {
        el.removeClass("el_current");
        tile.hide();
        this.tc = this.tc - 1;
        this.s_tour(this.tc);
    }

    t_click(el, tile) {
        el[0].click();
        el.removeClass("el_current");
        tile.hide();
    }

    skipTour(e) {
        $(".TourTile").fadeOut();
        $(".el_current").removeClass("el_current");
        this.tour.fade.hide();
        this.tour.container.hide();
    }

    offTour() {
        this.setCookie('ebwlkthrougstatusofforon', "off", 20 * 365);
        this.skipTour();
    }

    setCookie(c_name, value, exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays == null) ? "" : ";expires = " + exdate.toUTCString());
        document.cookie = c_name + "=" + c_value;
    }

    getCookie(name) {
        var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
        return v ? v[2] : null;
    }

    deleteCokkie() {
        this.setCookie("ebwlkthrougstatusofforon", 'on', -1);
    }

    startTourByTrigger() {
        this.tour.msgbox.fadeOut();
        this.s_tour(this.tc);
    }

    i() {
        this.tour = this.setWraper();
        $(".touFtr-skip").off("click").on("click", this.skipTour.bind(this));
        $(".touFtr-showAgn").off("click").on("click", this.offTour.bind(this));
        $("#tour-trigger").on("click", this.startTourByTrigger.bind(this));
    };
}
var FontEditor = function (params, fontEditobj) {
    this.ContainerId = params.ContainerId;
    this.ToggleId = params.ToggleId;
    var _font = {
        FontName: "Times-Roman",
        CSSFontName:"Times",
        Size: 14,
        Style: 0,
        color: "#333333",
        Caps: false,
        Strikethrough: false,
        Underline: false
    };

    this.fontObject = $.isEmptyObject(fontEditobj) ? _font : fontEditobj;

    this.ItextFonts = window.ebcontext.font || [];

    this.fontStyle = {
        0: "normal",
        2: "italic",
        1: "bold",
        3: "bold italic"
    };

    this.createModal = function () {
        var modalHTML = `<div class="fup" id="${this.ContainerId}fontEditor"><div class="imgup-bg">
            <div class="imgup-Cont font-editor-contaner" style="height: 70VH;"><div class="modal-header">
            <button type="button" class="close" onclick="$('\#${this.ContainerId}fontEditor .imgup-bg\').hide(500);" >&times;</button>
            <h4 class="modal-title" style="display:inline;">Font Editor </h4></div>
           <div class="modal-body" style="height: auto;">
            <div class="FE-section" id="${this.ContainerId}FE-section"></div>
            <div class="FE-sectionMprop" id="${this.ContainerId}FE-sectionMprop"></div>
            <div class="FE-preview form-group" style="padding:0 5px;">
            <label>Preview Text</label>
            <div id="font-preview" class="font-preview-wrpr text-center">Font preview</div>
            </div> </div> <div class="modal-footer">
            <div class="modal-footer-body">
            <button type="button" name="CXE_OK" id="${this.ContainerId}_close" class="btn eb_btnblue"  onclick="$('\#${this.ContainerId}fontEditor .imgup-bg\').hide(500);">OK</button>
            </div></div></div></div></div>`;

        $("#" + this.ContainerId).append(modalHTML);
        this.appendFontPropsSec();
    };

    this.appendFontPropsSec = function () {
        var Prophtml = (`<div class="col-md-8 FEcol FEfont-family">
            <div class="FEhead-font" style="text-align:left">
            <div class="font-text">Font</div><input type="text" id="fontSearch" class="fontSearch" placeholder="search font"></div>
            <div class="FEcol-bdy" id="${this.ContainerId}FEfamily-bdy">
            <select name="googleFont" id="googleFont" class="form-control font_ed_focus" size="5"></select></div></div>
            <div class="col-md-2 FEcol FEcol FEfont-style"><div class="FEhead">Font Style</div>
            <div class="FEcol-bdy" id="${this.ContainerId}FEStyle-bdy">
            <select name="fontStyle" size="5" id="fontStyle" class="form-control font_ed_focus"></select></div></div>
            <div class="col-md-2 FEcol FEfont-size"><div class="FEhead">Size</div>
            <div class="FEcol-bdy" id="${this.ContainerId}FEsize-bdy">
            <select name="fontSize" size="5" id="fontSize" class="form-control font_ed_focus"></select>
            </div></div>`);

        $("#" + this.ContainerId + "FE-section").append(Prophtml);
        this.appendMpropSec();
    };

    this.appendMpropSec = function () {
        var MpropHtml = (`<div class="col-md-4 pd-0"><label style="width:40%">Font Color</label>
            <input type="color" class="pg-fontcolor-inp" id="fontColor">
            </div>
            <div class="col-md-2 pd-0"><label style="width:40%">Caps</label>
            <input type="checkbox" name="caps" id="FE-caps" class="btn btn-info" style="display:inline-block;margin:0;height: 17px; width: 17px;">
            </div>
            <div class="col-md-3 pd-0"><label style="width:60%">Strikethrough</label>
            <input type="checkbox" name="strikethrough" id="FE-strikethrough" class="btn btn-info" style="display:inline-block;margin:0;height: 17px; width: 17px;">
            </div>
            <div class="col-md-3 pd-0"><label style="width:44%">Underline</label>
            <input type="checkbox" name="underline" id="FE-Underline" class="btn btn-info" style="display:inline-block;margin:0;height: 17px; width: 17px;">
            </div>`);
        $("#" + this.ContainerId + "FE-sectionMprop").append(MpropHtml);
    }

    this.loadFontStyle = function () {
        $('#fontStyle').append($(`<option tabindex='1' value='normal'>Normal</option>
            <option tabindex='1' value= 'bold'> Bold</option >
            <option tabindex='1' value= 'italic'> Italic</option >
            <option tabindex='1' value= 'bold italic'> Bold Italic</option>`));

        $(`#fontStyle>option:eq(${this.fontObject.Style})`).attr('selected', true);
    };

    this.loadFontFamily = function () {
        var pos = 0;
        for (let i = 0; i < this.ItextFonts.length; i++) {
            $('#googleFont').append(`<option tabindex='1' sys-name='${this.ItextFonts[i].SystemFontName}' value='${this.ItextFonts[i].CSSFontName}'>${this.ItextFonts[i].SystemFontName}</option>`);
        }
        //$.each(this.fonts.items, function (idx, font) {
        //    $('#googleFont')
        //        .append(
        //        $("<option tabindex='1' value='" + font.family + "'>" + font.family + "</option>"));
        //}); 
        $(`#googleFont option[sys-name='${this.fontObject.FontName}']`).attr('selected', true);
    }

    this.loadFontSize = function () {
        for (var i = 0; i <= 50; i++) {
            $('#fontSize')
                .append(
                    $("<option tabindex='1' value='" + i + "'>" + i + "px</option>"));
        }
        $(`#fontSize option[value='${this.fontObject.Size}']`).attr('selected', true);
    };

    this.loadFont = function (e) {
        fontVal = $(e.target).val();
        fontName = $("#googleFont option:selected").text();
        this.loadCSS('https://fonts.googleapis.com/css?family=' + fontVal);
        $('#font-preview').css('font-family', fontVal);
        this.fontObject.FontName = fontName;
        this.fontObject.CSSFontName = fontVal;
    }

    this.loadCSS = function (href) {
        var cssLink = $("<link rel='stylesheet' type='text/css' href='" + href + "'>");
        $("head").append(cssLink);
    }

    this.LoadFontStyle = function (e) {
        if ($(e.target).val() === "normal") {
            $('#font-preview').css({ 'font-style': 'normal', 'font-weight': 'normal' });
            this.fontObject.Style = 0;
        }
        else if ($(e.target).val() === "italic") {
            $('#font-preview').css({ 'font-style': 'italic', 'font-weight': 'normal' });
            this.fontObject.Style = 2;
        }
        else if ($(e.target).val() === "bold") {
            $('#font-preview').css({ 'font-weight': 'bold', 'font-style': 'normal' });
            this.fontObject.Style = 1;
        }
        else if ($(e.target).val() === "bold italic") {
            $('#font-preview').css({ 'font-style': 'italic', 'font-weight': 'bold' });
            this.fontObject.Style = 3;
        }
    };

    this.getFontSize = function (e) {
        $('#font-preview').css('font-size', $(e.target).val() + 'px');
        this.fontObject.Size = parseInt($(e.target).val());
    };

    this.searchFont = function (e) {
        var $srchBody = $('#googleFont');
        var srch = $(e.target).val().toLowerCase();
        $.each($srchBody.find("options"), function (i, obj) {
            var cmpstr = $(obj).text().toLowerCase();
            if (cmpstr.indexOf(srch) !== -1) {
                $(obj).show();
            }
            else
                $(obj).hide();
        });
    };

    this.getFontColor = function (e) {
        $('#font-preview').css('color', $(e.target).val());
        this.fontObject.color = $(e.target).val();
    }

    this.toggleModal = function () {
        var $modal = $("#" + this.ContainerId + "fontEditor .imgup-bg");
        $modal.toggle(350);
        if ($modal.css("display") === "block") {
            this.setDefault();
        }
    };

    this.changeCaps = function (e) {
        if ($(e.target).prop('checked') === true) {
            $('#font-preview').css('text-transform', 'uppercase');
            this.fontObject.Caps = true;
        }
        else {
            $('#font-preview').css('text-transform', 'lowercase');
            this.fontObject.Caps = false;
        }
    };

    this.strikeThrough = function (e) {
        if ($(e.target).prop('checked') === true) {
            $('#font-preview').css('text-decoration', 'line-through');
            this.fontObject.Strikethrough = true;
            $('#FE-Underline').prop('checked', false);
            this.fontObject.Underline = false;
        }
        else {
            $('#font-preview').css('text-decoration', 'none');
            this.fontObject.Strikethrough = false;
        }
    };

    this.Underline = function (e) {
        if ($(e.target).prop('checked') === true) {
            $('#font-preview').css('text-decoration', 'underline');
            this.fontObject.Underline = true;
            $('#FE-strikethrough').prop('checked', false);
            this.fontObject.Strikethrough = false;
        }
        else {
            $('#font-preview').css('text-decoration', 'none');
            this.fontObject.Underline = false;
        }
    };

    this.fontEdSubmit = function () {
        return this.fontObject;
    };

    this.setDefault = function () {
        if (!$.isEmptyObject(this.fontObject)) {
            $('#googleFont').children("option[value='" + this.fontObject.FontName + "']").change().focus();
            $('#fontStyle').children("option[value='" + this.fontStyle[this.fontObject.Style] + "']").change().focus();
            $('#fontSize').children("option[value='" + this.fontObject.Size + "']").change().focus();
            $('#fontColor').val(this.fontObject.color).change();
            if (this.fontObject.Caps)
                $('#FE-caps').prop("checked", true).change();

            if (this.fontObject.Strikethrough)
                $('#FE-strikethrough').prop("checked", true).change();
            else if (this.fontObject.Underline)
                $('#FE-Underline').prop("checked", true).change();
            //else {
            //    $('#FE-caps, #FE-strikethrough, #FE-strikethrough').prop("checked", false).change();
            //}
        }
    };

    this.init = function () {
        this.createModal();
        this.loadFontStyle();
        this.loadFontFamily();
        this.loadFontSize();
        $("body").off("click").on("click", "#" + this.ToggleId, this.toggleModal.bind(this));
        $('#googleFont').on('change', this.loadFont.bind(this));////  id matt
        $('#fontStyle').on('change', this.LoadFontStyle.bind(this));
        $('#fontSize').on('change', this.getFontSize.bind(this));
        $('#fontSearch').on('keyup', this.searchFont.bind(this));
        $('#fontColor').on('change', this.getFontColor.bind(this));
        $('#FE-caps').on('change', this.changeCaps.bind(this));
        $('#FE-strikethrough').on('change', this.strikeThrough.bind(this));
        $('#FE-Underline').on('change', this.Underline.bind(this));
        $('#' + this.ContainerId + '_close').on('click', this.fontEdSubmit.bind(this));
    }

    this.init();
}
class EbManageParam {
    constructor(options) {
        this.InitVar(options);
        this.startExe();
    };

    InitVar(options) {
        this.Option = $.extend({}, options);
        this.SqlTemp = null;
        this.Sql = null;
        this.InputParams = null;
        this.EbObject = this.Option.EbObject;
    }

    setProp(sql, o) {
        this.Sql = sql;
        this.EbObject = o;
    }

    setParams() {

    }

    startExe() {
        this.constructHtml();
        $(`${this.Option.Toggle}`).off("click").on("click", this.showEditor.bind(this));
        $(`#parmSetupSave${this.Option.Container}`).off("click").on("click", this.SaveParamsetup.bind(this));
    }

    constructHtml() {/// append changed to prepend
        $("body").prepend(`<div id="${this.Option.Container}-IpEdw" class="modal fade" role="dialog">
                            <div class="modal-dialog">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                                        <h4 class="modal-title">Input Parameters</h4>
                                    </div>
                                    <div class="modal-body" id="paraWinTab_${this.Option.Container}">
                                        <table class="table" style="margin-bottom:0;">
                                            <thead>
                                                <tr>
                                                    <th>Parameter</th>
                                                    <th>Type</th>
                                                    <th>Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                        
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-default" id="parmSetupSave${this.Option.Container}" data-dismiss="modal">Save</button>
                                    </div>
                                </div>
                            </div>
                        </div>`);
    };

    showEditor(ev) {
        var $c = $(`#${this.Option.Container}-IpEdw`);
        $c.toggle(350, function () {
            if ($c.is(":visible"))
                this.getInputParams();
        }.bind(this));
    }

    getInputParams() {
        if (this.SqlTemp !== this.Sql.trim()) {
            this.Sql = this.SqlTemp.trim();
            $.ajax({
                type: 'GET',
                url: "../CE/DataWriterSqlEval",
                data: { "sql": this.Sql },
                beforeSend: function () {
                }
            }).done(function (data) {
                this.InputParams = JSON.parse(data);
                this.AppendInpuParams();
                this.setValues();
            }.bind(this));
        }
    };

    AppendInpuParams() {
        $(`#${this.Option.Container}-IpEdw #paraWinTab_${this.Option.Container} tbody`).empty();
        for (let i = 0; i < this.InputParams.length; i++) {
            $(`#${this.Option.Container}-IpEdw #paraWinTab_${this.Option.Container} tbody`).append(`<tr>
                            <td>${this.InputParams[i].Column}</td>
                            <td>
                                <select name="${this.InputParams[i].Column}-DBTYPE" class="form-control">
                                    ${this.setDbType()}
                                </select>
                            </td>
                            <td><input type="text" name="${this.InputParams[i].Column}-VLU" class="form-control"/></td>
                        </tr>`);
        }
    };

    setDbType() {
        let d = [];
        for (let k in EbDbType) {
            d.push(`<option value="${EbDbType[k]}">${k}</option>`);
        }
        return d.join(",");
    };

    setValues() {
        for (let i = 0; i < this.EbObject.InputParams.$values.length; i++) {
            $(`#${this.Option.Container}-IpEdw select[name="${this.EbObject.InputParams.$values[i].Column}-DBTYPE"]`).val(this.EbObject.InputParams.$values[i].Type);
            $(`#${this.Option.Container}-IpEdw input[name="${this.EbObject.InputParams.$values[i].Column}-VLU"]`).val(this.EbObject.InputParams.$values[i].Value);
        }
    }

    SaveParamsetup(ev) {
        for (let i = 0; i < this.InputParams.length; i++) {
            this.InputParams[i].Type = eval($(`select[name="${this.InputParams[i].Column}-DBTYPE"]`).val());
            this.InputParams[i].Value = $(`input[name="${this.InputParams[i].Column}-VLU"]`).val();
        }
        this.EbObject.InputParams.$values = this.InputParams;
    };
};