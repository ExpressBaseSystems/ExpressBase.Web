class EbFileUploader {
    constructor(options) {
        //super();
        this.Options = $.extend({}, options);
        this.MaxSize = this.Options.MaxSize || 5;
        this.Files = [];
        this.RefIds = [];
        this.SingleRefid = null;
        this.FileList = [];
        this.CurrentFimg = null;
        this.Multiple = (this.Options.Multiple) ? "multiple" : "";
        if (this.validateOpt())
            this.init();
    };

    uploadSuccess(refId) { this.SingleRefid = refId };
    windowClose() { };
    getFileRef() { return this.SingleRefid };
    customTrigger(name, filerefs) { }

    validateOpt() {
        if (!this.Options.Container) {
            console.log("error:::Property 'Container' should be declared!");
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
        this.multiThumbFlow();
        $(`#${this.Options.Container}_Upl_btn`).off("click").on("click", this.toggleM.bind(this));
        $(`#${this.Options.Container}-upl-ok`).off("click").on("click", this.ok.bind(this));
        $(`#${this.Options.Container}-file-input`).off("change").on("change", this.browse.bind(this));
        $(`#${this.Options.Container}-upload-lin`).off("click").on("click", this.upload.bind(this));
        this.Modal.on("show.bs.modal", this.onToggleM.bind(this));
    };

    multiThumbFlow() {
        this.FullScreen = this.fullScreen();
        if (this.Options.ShowGallery) {
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
        let action = $(ev.target).closest("button").attr("action");
        if (action === "next" && this.CurrentFimg.next('.trggrFprev').length > 0) {
            this.galleryFullScreen({ target: this.CurrentFimg.next('.trggrFprev') });
        }
        else if (action === "prev" && this.CurrentFimg.prev('.trggrFprev').length > 0) {
            this.galleryFullScreen({ target: this.CurrentFimg.prev('.trggrFprev') });
        }
    };

    appendGallery() {
        $(`#${this.Options.Container}_FUP_GW .FUP_Bdy_W`).append(`<div id="${this.Options.Container}_GalleryUnq" class="ebFupGalleryOt">
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
        this.FileList = this.Options.File;
        if ('Files' in this.Options && this.Options.Files.length>0)
            this.renderFiles();
    }

    renderFiles() {
        for (let i = 0; i < this.FileList.length; i++) {
            let $portdef = $(`#${this.Options.Container}_GalleryUnq div[Catogory="DEFAULT"] .Col_apndBody_apndPort`);
            let $countdef = $(`#${this.Options.Container}_GalleryUnq div[Catogory="DEFAULT"] .Col_head .FcnT`);

            if (this.FileList[i].Meta.Category.length <= 0 || this.FileList[i].Meta.Category[0] === "Category") {
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
                    return function (e) {
                        (this.validate(file)) ? this.drawThumbNail(e, file) : null;
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
            this.comUpload();
    };

    comUpload() {
        for (let k = 0; k < this.Files.length; k++) {
            let thumb = null;
            let formData = new FormData(this.Files[k]);
            formData.append("File", this.Files[k]);
            formData.append("Tags", this.getTag(this.Files[k]));
            formData.append("Category", this.readCategory(this.Files[k]));

            $.ajax({
                url: "../StaticFile/UploadImageAsync",
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

    getTag(file) {
        let f = this.replceSpl(file.name);
        return $(`#${f}-tags_input`).tagsinput("items");
    }

    readCategory(file) {
        let f = this.replceSpl(file.name);
        return $(`#${f}-category`).val().split();
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
        $(`#${this.Options.Container}`).append(`<div class="FileUploadGallery" id="${this.Options.Container}_FUP_GW">
                                                     <div class="FUP_Head_W">
                                                        <button id="${this.Options.Container}_Upl_btn" class="ebbtn eb_btn-sm eb_btngreen pull-right"><i class="fa fa-upload"></i> Upload</button>
                                                     </div>
                                                     <div class="FUP_Bdy_W">
                                                     </div>
                                                </div>`);

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
                                           <div class="eb-upl-bdy" id="${this.Options.Container}-eb-upl-bdy">
                                                <div class="placeholder" id="${this.Options.Container}-placeholder">Drop Files Here</div>
                                            </div>
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
                    items: $.extend({}, this.DefaultLinks, this.getCustomMenu())
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