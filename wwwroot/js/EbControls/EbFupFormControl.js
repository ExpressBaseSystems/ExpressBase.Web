class FUPFormControl {
    constructor(options) {
        //super();
        this.Options = $.extend({
            DisableUpload: false,
            HideEmptyCategory: false
        }, options);

        this.MaxSize = this.Options.MaxSize || 5;
        this.Files = [];
        this.RefIds = [];
        this.SingleRefid = null;
        this.FileList = [];
        this.FileFlag = {};
        this.FileFlag.tagflag = true;
        this.CurrentFimg = null;
        this.TagList = {};
        this.TempCount = 100;
        this.Multiple = this.Options.Multiple ? "multiple" : "";
        if (this.validateOpt())
            this.init();
    }

    uploadSuccess(refId) { this.SingleRefid = refId; }
    windowClose() { }
    getFileRef() { return this.SingleRefid; }
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
    }

    init() {
        this.Modal = this.outerHtml();
        this.multiThumbFlow();
        $(`#${this.Options.Container}_Upl_btn`).off("click").on("click", this.toggleM.bind(this));
        $(`#${this.Options.Container}-upl-ok`).off("click").on("click", this.ok.bind(this));
        $(`#${this.Options.Container}-file-input`).off("change").on("change", this.browse.bind(this));
        $(`#${this.Options.Container}-upload-lin`).off("click").on("click", this.upload.bind(this));
        this.Modal.on("show.bs.modal", this.onToggleM.bind(this));
        $(`#${this.Options.Container}_Upl_btn`).keypress(function (e) {
            if (e.which === 13 || e.keyCode === 13) {
                this.click();
            }
        });

        //$("body").on("click", ".FUP_Head_W>.ebbtn", function (e) {
        //    let $e = $(e.target).closest(".FUP_Head_W>.ebbtn");
        //    if (((e.which == 13) || (e.keyCode === 13)) && $e.length !== 1) {
        //        e.preventDefault();
        //    }
        //})

    }

    multiThumbFlow() {
        //lines commented for testing
        //this.FullScreen = this.fullScreen();
        if (this.Options.ShowGallery) {
            this.Gallery = this.appendGallery();
            // this.GalleryFS = this.appendFSHtml();//full screen preview init html
            //ebfileviewer start
            $(`#${this.Options.Container}_view`).remove();
            $("body").append(`<div id='${this.Options.Container}_view'></div>`);
            this[`${this.Options.Container}_cont`] = $(`#${this.Options.Container}_view`).ebFileViewer(this.Options.Files);
            //ebfileviewer end
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
                $(`div[file='${this.replceSpl(filename)}']`).find("img").attr({ "src": b64,"cropped":true });
            }.bind(this);
        }
        this.Modal.find('.eb-upl-bdy').on("dragover", this.handleDragOver.bind(this));
        this.Modal.find('.eb-upl-bdy').on("drop", this.handleFileSelect.bind(this));
    }

    fscreenN_P(ev) {
        let action = $(ev.target).closest("button").attr("action");
        if (action === "next" && this.CurrentFimg.next(`.${this.Options.Container}_preview`).length > 0) {
            this.galleryFullScreen({ target: this.CurrentFimg.next(`.${this.Options.Container}_preview`) });
        }
        else if (action === "prev" && this.CurrentFimg.prev(`.${this.Options.Container}_preview`).length > 0) {
            this.galleryFullScreen({ target: this.CurrentFimg.prev(`.${this.Options.Container}_preview`) });
        }
    }

    createUUID() {
        return 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    appendGallery() {

        let guid = this.createUUID();

        $(`#${this.Options.Container}_FUP_GW .FUP_Bdy_W`).append(`<div id="${this.Options.Container}_GalleryUnq" class="ebFupGalleryOt">
                        <div class="ClpsGalItem_Sgl" Catogory="DEFAULT" alt="Default">
                            <div class="Col_head collapsed" data-toggle="collapse" data-target="#DEFAULT_ColBdy${guid}">DEFAULT <span class="FcnT"></span></div>
                            <div class="Col_apndBody collapse" id="DEFAULT_ColBdy${guid}">
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
                                <img src="/images/web.png" class="FupimgIcon" />
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
                html.push(`<div class="ClpsGalItem_Sgl" Catogory="${this.Options.Categories[i].trim()}" alt="${this.Options.Categories[i].trim()}">
                            <div class="Col_head collapsed" data-toggle="collapse" data-target="#${this.Options.Container}_G_${this.Options.Categories[i].replace(/\s/g, "")}">${this.Options.Categories[i].toUpperCase()}
                            <span class="FcnT">(0)</span></div>
                            <div class="Col_apndBody collapse" id="${this.Options.Container}_G_${this.Options.Categories[i].replace(/\s/g, "")}">
                            <div class="Col_apndBody_apndPort"></div></div>
            </div>`);
            }
        }
        return html.join("");
    }

    pullFile() {
        this.FileList = this.Options.Files;
        if ('Files' in this.Options && this.Options.Files.length > 0) {

            this.renderFiles(this.FileList);
        }
        else {
            this.hideEmptyCategoryFn();
        }
    }

    renderFiles(renderFiles) {
        let recentUpload = false;
        for (let i = 0; i < renderFiles.length; i++) {
            let $portdef = $(`#${this.Options.Container}_GalleryUnq div[Catogory="DEFAULT"] .Col_apndBody_apndPort`);
            let $countdef = $(`#${this.Options.Container}_GalleryUnq div[Catogory="DEFAULT"] .Col_head .FcnT`);

            //for creating tag buttons
            if (this.FileFlag.tagflag === true) {
                let taghtml = "";
                if (renderFiles[i].Meta !== null) {
                    if (renderFiles[i].Meta.hasOwnProperty('Tags')) {
                        if (renderFiles[i].Meta.Tags.length > 0) {
                            let filetags = renderFiles[i].Meta.Tags[0].split(',');
                            $.each(filetags, function (j, tagval) {
                                if (!this.TagList[tagval]) {
                                    this.TagList[tagval] = [renderFiles[i]];
                                    $(`#${this.Options.Container} .FUP_TagUl`).append(`<li class='${this.Options.Container}_FUP_TagLi FUP_TagLi' >${tagval}</li>`)
                                }
                                else {
                                    this.TagList[tagval].push(renderFiles[i]);
                                }

                            }.bind(this));
                        }
                    }
                }

            }

            if ($.isEmptyObject(renderFiles[i].Meta)) {
                $portdef.append(this.thumbNprevHtml(renderFiles[i]));
                $countdef.text("(" + $portdef.children().length + ")");
            }
            else if (!renderFiles[i].Meta.hasOwnProperty("Category")) {
                $portdef.append(this.thumbNprevHtml(renderFiles[i]));
                $countdef.text("(" + $portdef.children().length + ")");
            }
            else {
                if ((renderFiles[i].Meta.Category[0] === "Category")||(!renderFiles[i].Meta.Category[0])) {
                    $portdef.append(this.thumbNprevHtml(renderFiles[i]));
                    $countdef.text("(" + $portdef.children().length + ")");
                }
                else {
                    for (let k = 0; k < renderFiles[i].Meta.Category.length; k++) {
                        let $portcat = $(`#${this.Options.Container}_GalleryUnq div[Catogory="${renderFiles[i].Meta.Category[k]}"] .Col_apndBody_apndPort`);
                        let $countcat = $(`#${this.Options.Container}_GalleryUnq div[Catogory="${renderFiles[i].Meta.Category[k]}"] .Col_head .FcnT`);
                        $portcat.append(this.thumbNprevHtml(renderFiles[i]));
                        $countcat.text("(" + $portcat.children().length + ")");
                    }
                }
            }
            if (!renderFiles[i].hasOwnProperty('Recent')) {
                $(`#prev-thumb${renderFiles[i].FileRefId}`).data("meta", JSON.stringify(renderFiles[i]));
            }
            else {
                recentUpload = true;
                this[`${this.Options.Container}_cont`].addToImagelist(renderFiles[i]);
            }

        }

        if (recentUpload) {
            this.contextmenu_recent();
        }
        else {

            $(".mark-thumb").off("click").on("click", function (evt) { evt.stopPropagation(); });
            $("body").off("click").on("click", ".Col_apndBody_apndPort", this.rmChecked.bind(this));
            $(".eb_uplGal_thumbO").on("change", ".mark-thumb", this.setBGOnSelect.bind(this));
            this.contextMenu();
        }
        $(`.${this.Options.Container}_FUP_TagLi`).off("click").on("click", this.sortByTagFn.bind(this));
        $('.EbFupThumbLzy').Lazy({ scrollDirection: 'vertical' });
        $(`.${this.Options.Container}_preview`).off("click").on("click", this.galleryFullScreen.bind(this));// full screen click event
        this.hideEmptyCategoryFn();
    }

    hideEmptyCategoryFn() {

        if (this.Options.HideEmptyCategory) {
            $(this.Gallery).find(".ClpsGalItem_Sgl").each(function (indx, value) {
                //if ($(value).attr('catogory') != "DEFAULT") {
                let childLength = $(value).find(".Col_apndBody").find(".Col_apndBody_apndPort").children().length
                if (childLength === 0) {
                    $(value).hide();
                }
                else {
                    $(value).show();
                }
                //}
            });
        }
    }

    sortByTagFn(e) {

        this.FileFlag.tagflag = false;
        let tagsArr = [];
        let flLst = $(`#${this.Options.Container}`).find(`.${this.Options.Container}_preview`);
        $(`#${this.Options.Container}`).find('.FUP_TagUl .current').removeClass('current');
        $.each(flLst, function (k, imgdiv) {
            $(imgdiv).remove();
        }.bind(this));

        if ($(e.target).closest('li').hasClass('showAllFile')) {
            this.renderFiles(this.FileList);
            $(e.target).addClass('current');
        }
        else {
            $(e.target).addClass('current');
            let tag = $(e.target).closest('li')[0].innerHTML;
            for (let i = 0; i < this.FileList.length; i++) {
                if (this.FileList[i].Meta.hasOwnProperty('Tags')) {
                    if (this.FileList[i].Meta.Tags.length > 0) {
                        let filetags = this.FileList[i].Meta.Tags[0].split(',');
                        if ($.inArray(tag, filetags) >= 0) {
                            tagsArr.push(this.FileList[i]);
                        }
                    }
                }
            }
            this.renderFiles(tagsArr);
        }
        this.setThumbnailCount();
    }

    rmChecked(evt) {
        if ($(evt.target).closest(".eb_uplGal_thumbO").length <= 0) {
            this.Gallery.find(`.mark-thumb:checkbox:checked`).prop("checked", false);
            $(".eb_uplGal_thumbO").find(".select-fade").hide();
        }
    }

    setBGOnSelect(ev) {
        let cb = $(ev.target).prop("checked");
        if (cb)
            $(ev.target).closest(".eb_uplGal_thumbO").find(".select-fade").show();
        else
            $(ev.target).closest(".eb_uplGal_thumbO").find(".select-fade").hide();
    }

    thumbNprevHtml(o) {
        let src = null;
        if (o.hasOwnProperty('Recent')) {
            if (o.FileCategory === 0) {
                src = `/files/${o.FileB64}`;
            }
            else if (o.FileCategory === 1) {
                src = o.FileB64;
            }
            let upTime = this.Options.ShowUploadDate ? ` <div class="upload-time">${o.UploadTime}</div>` : "<div></div>";
            return (`<div class="eb_uplGal_thumbO_RE ${this.Options.Container}_preview ${this.Options.Container}_eb_Gal_thumb_RE" filename_RE="${o.FileName}" id="prev-thumb${o.FileRefId}" filref="${o.FileRefId}" original_refid="${o.original_refid ? o.original_refid : o.FileRefId}" recent=true>
                        <div class="eb_uplGal_thumbO_img">
                            ${this.getThumbType(o, src)}
                                <div class="widthfull"><p class="fnamethumb text-center">${o.FileName}</p>
                                    ${upTime}
                                     <i class="fa fa-info-circle filesave_info" data-toggle="tooltip" data-placement="bottom" title="will be saved only if form is saved " ></i>
                                </div>
                                <div class="eb_uplGal_thumb_loader">
                                    <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div>
                                      <div></div><div></div><div></div><div></div><div>
                                      </div><div></div><div></div></div>
                                </div>
                         </div>
                    </div>`);
        }
        else {
            if (o.FileCategory === 0) {
                src = `/files/${o.FileRefId}`;
            }
            else if (o.FileCategory === 1) {
                src = `/images/small/${o.FileRefId}.jpg`;
            }
            let upTime = this.Options.ShowUploadDate ? ` <div class="upload-time">${o.UploadTime}</div>` : "<div></div>";
            return (`<div class="eb_uplGal_thumbO ${this.Options.Container}_preview ${this.Options.Container}_eb_Gal_thumb" id="prev-thumb${o.FileRefId}" filref="${o.FileRefId}">
                        <div class="eb_uplGal_thumbO_img">
                            ${this.getThumbType(o, src)}
                            <div class="widthfull"><p class="fnamethumb text-center">${o.FileName}</p>
                                ${upTime}
                                <input type="checkbox" refid="${o.FileRefId}" name="Mark" class="mark-thumb">
                            </div>
                            <div class="select-fade"></div>
                            <div class="eb_uplGal_thumb_loader">
                                <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div>
                                  <div></div><div></div><div></div><div></div><div>
                                  </div><div></div><div></div></div>
                            </div>
                          </div>
                      </div>`);
        }

    }

    getThumbType(o, src) {
        if (o.FileCategory === 0) {
            var arr = o.FileName.split('.');
            var exten = arr[arr.length - 1];
            if (exten !== 'pdf') {
                return `<img src="/images/file-image.png" data-src="${src}.jpg" class="EbFupThumbLzy" style="display: block;" alt='' onerror=this.onerror=null;this.src='/images/file-image.png'>`;
            }
            else {
                return `<img src="/images/pdf-image.png" data-src="${src}.jpg" class="EbFupThumbLzy" style="display: block;" alt='pdf' onerror=this.onerror=null;this.src='/images/file-image.png'>`;
            }

        }
        else {
            return `<img src="${src}" data-src="${src}" class="EbFupThumbLzy" style="display: block;"  alt='' onerror=this.onerror=null;this.src='/images/imageplaceholder.png' >`;
        }
    }

    galleryFullScreen(ev) {
        if (ev.ctrlKey)
            return this.thumbSelection(ev);

        let fileref = $(ev.target).closest(`.${this.Options.Container}_preview`).attr("filref");

        //ebfileviewer 
        this[`${this.Options.Container}_cont`].showimage(fileref);


        //this.GalleryFS.show();//show full screen 
        //let o = JSON.parse($(ev.target).closest(`.${this.Options.Container}_preview`).data("meta"));
        //let urls = "", urll = "";

        //if (o.FileCategory === 0) {
        //    urls = `/files/${fileref}.jpg`;
        //    urll = urls;
        //}
        //else {
        //    urls = `/images/small/${fileref}.jpg`;
        //    urll = `/images/large/${fileref}.jpg`;
        //}

        //if (is_cached(location.origin + urll)) {
        //    this.GalleryFS.eq(1).find('img').attr("src", urll);
        //}
        //else {
        //    this.GalleryFS.eq(1).find('img').attr("src", urls);
        //    this.GalleryFS.eq(1).find('img').attr("data-src", urll);
        //    this.GalleryFS.eq(1).find('img').Lazy({
        //        onError: function (element) { }
        //    });
        //}
        //this.GalleryFS.eq(1).find(".ebFupGFscreen_footr .Fname").text(o.FileName);
        //this.GalleryFS.eq(1).find(".ebFupGFscreen_footr .Tags").html(this.getTagsHtml(o));
        //this.CurrentFimg = $(ev.target).closest(`.${this.Options.Container}_preview`);
    }

    getTagsHtml(o) {
        let html = new Array();
        if (o.Meta !== null) {
            if ("Tags" in o.Meta) {
                for (let i = 0; i < o.Meta.Tags.length; i++) {
                    html.push(`<span class="tagno-t">${o.Meta.Tags[i]}</span>`);
                }
            }
        }
        return html.join("");
    }

    thumbSelection(ev) {
        let $div = $(ev.target).closest(".eb_uplGal_thumbO").find(".mark-thumb");
        if ($div.prop("checked"))
            $div.prop("checked", false);
        else
            $div.prop("checked", true);
        $div.trigger("change");
    }

    initCropy() {
        return new EbCropper({
            Container: `${this.Options.Container}_container_crp`,
            Toggle: '._crop',
            ResizeViewPort: this.Options.ResizeViewPort
        });
    }

    cropImg(e) {
        this.Cropy.Url = $(e.target).closest(".file-thumb-wraper").find("img").attr("src");
        this.Cropy.FileName = $(e.target).closest(".eb-upl_thumb").attr("exact");
        this.Cropy.toggleModal();
    }

    onToggleM() {
        if (this.Options.ServerEventUrl)
            this.startSE();
    }

    toggleM() {
        this.Modal.modal("toggle");
    }

    ok() {
        this.toggleM();
        this.windowClose();
    }

    browse(e) {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            this.handleFileSelect(e);
        } else {
            alert('The File APIs are not fully supported in this browser.');
        }
    }

    handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.originalEvent.dataTransfer.dropEffect = "copy"; // Explicitly show this is a copy.
    }

    getFileType(file) {
        if (file.type.match('image.*'))
            return "image";
        else
            return "file";
    }

    handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        this.FilesBase64 = [];
        let files = evt.target.files || evt.originalEvent.dataTransfer.files; // FileList object
        var t = (this.Options.Type == 'image') ? 1 : 0;
        for (var i = 0; i < files.length; i++) {
            let x = 0;
            if (files[i].type.match('image.*'))
                x = 1;
            else
                x = 0;

            let filetype = (t == 1) ? x : 1;
            if (filetype == 1) {
                let reader = new FileReader();
                reader.onload = (function (file) {
                    return function (e) {
                        (this.validate(file)) ? this.drawThumbNail(e, file) : null;
                    }.bind(this);

                }.bind(this))(files[i]);

                reader.readAsDataURL(files[i]);
            }
            else {
                EbMessage("show", { Message: "Only images are allowed", Background: 'red' });
            }
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
            let b64 = e.target.result;
            $(`#${this.Options.Container}-eb-upl-bdy`).append(`
                                                        <div class="file-thumb-wraper">
                                                            <div class="eb-upl_thumb" exact="${file.name}" file="${this.replceSpl(file.name)}">
                                                                <div class="eb-upl-thumb-bdy">
                                                                    ${this.getThumbNailHead(b64, file)}
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
            this.FilesBase64.push(b64)
            this.Files.push(file);
            this.isDropZoneEmpty();
        }
        else {
            EbMessage("show", { Background: "red", Message: "Image size should not exceed " + this.MaxSize + " Mb" });
        }
    }

    getThumbNailHead(b64, file) {
        let t = this.getFileType(file);
        if (t === "image") {
            return `<img src="${b64}"/>`;
        }
        else {
            if (file.type.match("pdf.*"))
                return `<iframe src="${b64}" scrolling="no"></iframe>`;
            else
                return `<i src="${b64}" class="glyphicon glyphicon-file thumb-icon"></i>`;
        }
    }

    tagClick(e) {
        $(e.target).closest("button").siblings(".upl-thumbtag").toggle();
    }

    thumbButtons(file) {
        let html = new Array();
        html.push(`<button class="upl-thumb-btn" size="${parseFloat((file.size / (1024))).toFixed(3)}" ftype="${this.getFileType(file)}" fname="${file.name}" id="${this.replceSpl(file.name)}-fullscreen"><i class="fa fa-arrows-alt"></i></button>`);
        html.push(`<button class="upl-thumb-btn" fname="${file.name}" id="${this.replceSpl(file.name)}-del"><i class="fa fa-trash-o"></i></button>`);

        if (this.Options.EnableTag)
            html.push(`<button class="upl-thumb-btn" fname="${file.name}" id="${this.replceSpl(file.name)}-tag"><i class="fa fa-tags"></i></button>
                        <div class="upl-thumbtag" id="${this.replceSpl(file.name)}-tagpop">
                             <input data-role="tagsinput"  id="${this.replceSpl(file.name)}-tags_input" type="text"/>
                        </div>`);

        if (this.Options.EnableCrop)
            html.push(` <button class="upl-thumb-btn _crop" fname="${file.name}" id="${this.replceSpl(file.name)}-crop"><i class="fa fa-crop"></i></button>`);
        if (this.Options.Categories && this.Options.Categories.length > 0)
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
        //document.getElementById("uploadtest-file-input").value = "";
        this.isDropZoneEmpty();
    }
    //lines commented for testing
    setFullscreen(e) {
        //let txt = $(e.target).closest("button").attr("fname") + " (" + $(e.target).closest("button").attr("size") + " Kb)";
        //let ft = $(e.target).closest("button").attr("ftype");
        //let ctrl = $(e.target).closest(".eb-upl_thumb");
        //if (ft === "image") {
        //    this.FullScreen.find(".upl-body-file").hide();
        //    let img = ctrl.find("img").attr("src");
        //    this.FullScreen.find("img").attr("src", img);
        //    this.FullScreen.find(".upl-body").show();
        //}
        //else {
        //    this.FullScreen.find(".upl-body").hide();
        //    let iframe = ctrl.find("iframe").attr("src");
        //    this.FullScreen.find(".upl-body-file iframe").attr("src", iframe);
        //    this.FullScreen.find(".upl-body-file").show();
        //}
        //this.FullScreen.find(".img-info").text(txt);
        //this.FullScreen.modal("show");
    }

    upload(e) {
        this.comUpload();
    }

    comUpload() {
        this.TempFilesList = [];
        let url = "";
        for (let k = 0; k < this.Files.length; k++) {
            let type = this.getFileType(this.Files[k]);
            this.showInGallery(this.Files[k], type, k);
            if (type === "image")
                url = "../StaticFile/UploadImageAsync";
            else
                url = "../StaticFile/UploadFileAsync";

            this.uploadItem(url, this.Files[k]);
        }
        this.renderFiles(this.TempFilesList)
    }

    showInGallery(file, type, k) {
        var obj = {};
        var metaObj = {};
        this.TempCount += 1;
        if (type === "image")
            obj.FileCategory = 1;
        else
            obj.FileCategory = 0;
        obj.FileName = file.name;
        obj.FileRefId = "ebfupRecent" + this.TempCount;
        obj.FileB64 = this.FilesBase64[k];
        obj.FileSize = file.size;
        obj.UploadTime = (new Date()).toISOString().split('T')[0];
        obj.Recent = true;
        let c = this.readCategory(file);
        if (c.length > 0)
            metaObj.Category = c;
        let t = this.getTag(file);
        if (t.length > 0) {
            metaObj.Tags = [];
            metaObj.Tags.push(t.join(','));
        }
            
        obj.Meta = metaObj;
        this.TempFilesList.push(obj);
        this.FileList.push(obj);

    }

    uploadItem(_url, file) {
        let thumb = null;
        let formData = new FormData();
        formData.append("File", file);
        formData.append("Tags", this.getTag(file));
        formData.append("Category", this.readCategory(file));

        $.ajax({
            url: _url,
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function (evt) {
                thumb = $(`#${this.Options.Container}-eb-upl-bdy div[file='${this.replceSpl(file.name)}']`);
                thumb.find(".eb-upl-loader").show();
            }.bind(this)
        }).done(function (refid) {
            this.successOper(thumb, refid);
        }.bind(this));
    }

    getTag(file) {
        let f = this.replceSpl(file.name);
        if ($(`#${f}-tags_input`).length > 0)
            return $(`#${f}-tags_input`).tagsinput("items");
        else
            return "";
    }

    readCategory(file) {
        let f = this.replceSpl(file.name);
        if ($(`#${f}-category`).length > 0) {
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
                    var k = this.Gallery.find(`[filename_RE='${this.Files[i].name}']`)
                    if (k.length > 0) {
                        k.attr("original_refid", refid);
                        k.attr("id", `prev-thumb${refid}`);
                        let indx = this.TempFilesList.findIndex(item => item.FileName == this.Files[i].name);
                        if (indx > -1) {
                            let j = this.FileList.findIndex(item => item.FileRefId == this.TempFilesList[indx].FileRefId);
                            this.FileList[j].original_refid = refid;
                        }                      
                    }
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
        let fileType = (this.Options.Type == "image") ? "image/*" : "";
        let isVisible = (this.Options.DisableUpload) ? "none" : "block";
        $(`#${this.Options.Container}`).append(`<div class="FileUploadGallery" id="${this.Options.Container}_FUP_GW">
                                                     <div class="FUP_Head_W" style="display:${isVisible}">
                                                         <div tabindex = "0" id = "${this.Options.Container}_Upl_btn" class="ebbtn eb_btn-sm eb_btnblue pull-right" > <i class="fa fa-upload"></i> Upload</div>
                                                            <div class='FUP_TagDiv' >
                                                                <ul class='FUP_TagUl' style=''>
                                                                    <li class='${this.Options.Container}_FUP_TagLi FUP_TagLi showAllFile current' >All</li>
                                                                </ul>
                                                            </div>
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
                                        <input type="file" accept="${fileType}" id="${this.Options.Container}-file-input" style="display:none;" ${this.Multiple}/>
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
    //lines commented for testing
    fullScreen() {
        //$("body").append(`<div id="${this.Options.Container}-upl-container-fullscreen" class="upl-container-fullscreen">
        //                    <div id="${this.Options.Container}-upl-fullscreen" class="modal fade upl-fullscreen" role="dialog">
        //                      <div class="modal-dialog">
        //                        <div class="modal-content">
        //                          <div class="modal-header">
        //                            <button type="button" class="close" data-dismiss="modal">&times;</button>
        //                            <h4 class="modal-title display-inline">Detailed Preview</h4>
        //                            <span class="img-info">amal.jpg 56.8 kb</span>
        //                          </div>
        //                          <div class="modal-body">
        //                                <div class="upl-body">
        //                                    <img src=""/>
        //                                </div>
        //                                <div class="upl-body-file">
        //                                    <iframe></iframe>
        //                                </div>
        //                          </div>
        //                        </div>
        //                      </div>
        //                    </div>
        //                  </div>`);

        //return $(`#${this.Options.Container}-upl-fullscreen`);
    }

    startSE() {
        this.ss = new EbServerEvents({ ServerEventUrl: ebcontext.se_url, Channels: ["file-upload"] });
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
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = function () {
                    this.FilesBase64[k] = reader.result;
                }.bind(this);
                
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
    }

    contextMenu() {
        this.DefaultLinks = {
            "fold2": {
                "name": "Move to Category", icon: "fa-list",
                "items": this.getCateryLinks()
            },
            "fold3": {
                "name": "Open in New Tab", icon: "fa-external-link", callback: function (eType, selector, action, originalEvent) {
                    let url = $(selector.$trigger).find("img").attr("src") || $(selector.$trigger).find("iframe").attr("src");
                    var win = window.open(url, '_blank');
                    win.focus();
                }
            }
        };

        $.contextMenu({
            selector: `.${this.Options.Container}_eb_Gal_thumb`,
            autoHide: true,
            className: "ebfup-context-menu",
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
                };
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
            o[this.Options.Categories[i].trim()] = {
                name: this.Options.Categories[i].trim(),
                icon: "",
                callback: this.contextMcallback.bind(this)
            };
        }
        return o;
    }

    contextMcallback(eType, selector, action, originalEvent) {
        let refids = [];
        if ($(selector.$trigger).attr("recent") == "true") {
            var attr = $(selector.$trigger).attr('original_refid');
            if (typeof attr !== typeof undefined && attr !== false) {
                refids = [eval($(selector.$trigger).attr("original_refid"))];
            }

        }
        else {

            refids = [eval($(selector.$trigger).attr("filref"))];
            this.Gallery.find(`.mark-thumb:checkbox:checked`).each(function (i, o) {
                if (!refids.Contains(eval($(o).attr("refid"))))
                    refids.push(eval($(o).attr("refid")));
            }.bind(this));
        }
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
                for (var i = 0; i < fileref.length; i++) {
                    var thumb = this.Gallery.find(`#prev-thumb${fileref[i]}`);
                    thumb.find(".eb_uplGal_thumb_loader").show();
                }

            }.bind(this)
        }).done(function (status) {
            for (var i = 0; i < fileref.length; i++) {
                var thumb = this.Gallery.find(`#prev-thumb${fileref[i]}`);
                thumb.find(".eb_uplGal_thumb_loader").hide();
            }
            if (status)
                this.redrawCategry(fileref, cat);
        }.bind(this));
    }
    redrawCategry(fileref, cat) {
        let $t;
        for (let i = 0; i < fileref.length; i++) {
            var thump = this.Gallery.find(`div[filref="${fileref[i]}"]`);
            if (thump.length === 0) {
                thump = this.Gallery.find(`div[original_refid="${fileref[i]}"]`);
            }
            var catDiv = $(`#${this.Options.Container}_GalleryUnq div[Catogory="${cat}"]`);
            catDiv.show();
            catDiv.find('.Col_apndBody_apndPort').append(thump);
            $t = $(`#${this.Options.Container}_GalleryUnq div[Catogory="${cat}"] .Col_head .FcnT`);
            $t.text("(" + $(`#${this.Options.Container}_GalleryUnq div[Catogory="${cat}"] .Col_apndBody_apndPort`).children().length + ")");
           
        }
        this.setThumbnailCount();
        this.Gallery.find(`.mark-thumb:checkbox:checked`).prop("checked", false);
        $(".eb_uplGal_thumbO").find(".select-fade").hide();
    }

    contextmenu_recent() {
        $.contextMenu({

            selector: `.${this.Options.Container}_eb_Gal_thumb_RE`,
            autoHide: true,
            className: "ebfup-context-menu_RE",
            items: {
                "delete": {
                    name: "Delete",
                    icon: "fa-trash",
                    callback: this.contextM_REcallback.bind(this)
                },
                "changeCategory": {
                    name: "Move to Category",
                    icon: "fa-list",
                    items: this.getCateryLinks()
                }
            }
        });

        // set a title
        $('.ebfup-context-menu_RE').attr('ebfup-context-menutitle_RE', "Yet to save Form");


    }

    deleteFromGallery(filerefs) {
        for (let i = 0; i < filerefs.length; i++) {
            this.Gallery.find(`div[filref="${filerefs[i]}"]`).remove();
            let indx = this.FileList.findIndex(item => item.FileRefId == filerefs[i]);
            this.FileList.splice(indx, 1);  
        }
    }

    customMenuCompleted(name, refids) {
        if (name === "Delete") {
            this[`${this.Options.Container}_cont`].deleteimage(refids);
            this.setThumbnailCount();
        }

    }

    setThumbnailCount() {
        var catHead = $(`#${this.Options.Container}`).find('.ClpsGalItem_Sgl');
        var l = catHead.length;
        if (l > 0) {
            for (var i = 0; i < l; i++) {
                var thumb_len = $(catHead[i]).find(`.${this.Options.Container}_preview`).length;
                $(catHead[i]).find('.FcnT').text(`(${thumb_len})`);
            }
        }
    }
}