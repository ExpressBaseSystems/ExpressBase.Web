var imageUploader = function (option) {
    var _Console = option.Console;
    var _container = option.Container;
    var _Tid = option.TenantId;
    var _ToggleId = option.toggleId;
    var _multiple = option.IsMultiple ? _multiple = "multiple" : "";
    var _initialPrev = [];
    var _initialPrevConfig = [];
    var _tag = {};
    this.FileId = null;

    this.CreateMOdalW = function () {
        var modalHTML = '<div class="fup" id="bg_' + _container + '"><div class="imgup-bg">'
            + '<div class="imgup-Cont">'
            + '<div class="modal-header">'
            + '<button type="button" class="close" id="' + _container + '_close_btn" onclick="$(\'#' + _container + ' .imgup-bg\').hide(500);" >&times;</button>'
            + '<h4 class="modal-title" style="display:inline;">Image Selector </h4>'
            + '<p style="display:inline;float:right;margin-right: 20px;" id="' + _container + 'obj-id"></p>'
            + '</div>'

            + '<div class="modal-body">'
            + "<div id-'img-upload-body' style='margin-top:15px;'><input id='" + _container + "input-id' type='file' data-preview-file-type='text' " + _multiple + "></div>"
            + "<h6>Tags</h6>"
            + "<input type= 'text' data-role='tagsinput' id= '" + _container + "tagval' value='' class='form-control' style='width:100%;'>"
            + '</div>'

            + '<div class="modal-footer">'
            + '<div class="modal-footer-body">'
            + '<button type="button" name="CXE_OK" id="' + _container + '_close" class="btn"  onclick="$(\'#' + _container + ' .imgup-bg\').hide(500);">OK</button>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>';

        $("#" + _container).append(modalHTML);
    }; //modal creation and fileinput initialized

    this.toggleModal = function () {
        var $c = $("#bg_" + _container + " .imgup-bg");
        $c.toggle(350, function () {
            if ($c.is(":visible"))
                this.startSE();
            $("#" + _container + "tagval").tagsinput('refresh');
        }.bind(this));
    };

    this.stopListening = function () {
        this.ss.stopListening();
    };

    this.loadFileInput = function () {
        $("#" + _container + "input-id").fileinput({
            uploadUrl: "../StaticFile/UploadImageAsync",
            maxFileCount: 5,
            initialPreview: _initialPrev,
            initialPreviewConfig: _initialPrevConfig,
            initialPreviewAsData: true,
            uploadAsync: true,
            uploadExtraData: this.uploadtag.bind(this)
        }).on('fileloaded', this.fileloaded.bind(this))
            .on('filepreajax', this.filepreajax.bind(this))
            .on('fileclear', function (event) {
                $("#" + _container + "tag-section").empty();
                $('#' + _container + 'obj-id').text(" ");
            });

        $(".file-drop-zone").css({ "height": '280px', "overflow-y": "auto" });
        $(".file-preview-initial").attr("tabindex", "1");
        $(".file-preview-initial").on("focus", this.imageOnSelect.bind(this));
    };

    this.filepreajax = function (event, previewId, index) {
        var f = $("#" + _container + "input-id").fileinput('getFileStack')[0];
        if ($("#" + _container + "tagval").tagsinput('items').length > 0)
            _tag[f.name.toLowerCase()] = $("#" + _container + "tagval").tagsinput('items');
        var t = _Console === "dc" ? "devresource" : "userresource";
        $.isEmptyObject(_tag) ? _tag[f.name.toLowerCase()] = [t] : _tag[f.name.toLowerCase()].push(t);
    };

    this.fileloaded = function (event, file, previewId, index, reader) {
        $("#" + _container + "_close").prop('disabled', true);
    };//tadd tag btn

    this.imageOnSelect = function (e) {
        var id = $(e.target).children().find("img").attr("src").split("/").pop().replace(".jpg", "");
        $("#" + _container + 'obj-id').text(id);
        this.FileId = id;
    }

    this.uploadtag = function (previewId, index) {
        return { "tags": JSON.stringify(_tag) };
    };

    this.tagimageOnClick = function () {
        $("#" + _container + "tagval").show().tagsinput('refresh');
    };//tag btn onclick

    this.getUplodedImgOnload = function () {
        $.ajax({
            url: "../StaticFile/FindFilesByTags",
            data: {
                "tags": "devresource"
            },
            type: "POST",
            success: function (result) {
                for (var objid = 0; objid < result.length; objid++) {
                    var url = window.location.protocol + "//" + window.location.host + "/static/" + result[objid].objectId + "." + result[objid].fileType;
                    var config = { caption: result[objid].fileName, size: result[objid].length };
                    _initialPrev.push(url);
                    _initialPrevConfig.push(config);
                }
                this.loadFileInput();
            }.bind(this)
        });
    };

    this.getId = function () {
        this.ss.stopListening();
        return this.FileId;
    };

    //this.getUrl = function (id) {
    //    var protocol = window.location.protocol;
    //    var host = window.location.host.indexOf("-dev") > -1 ? window.location.host.replace("-dev", "") : window.location.host;
    //    return protocol + "//" + host + "/static/" + id + ".JPG";
    //};

    this.startSE = function () {
        let url = "";
        if (window.host.indexOf("localhost") >= 0)
            url = "https://sedev.eb-test.info";
        else if (window.host.indexOf("eb-test") >= 0)
            url = "https://se.eb-test.info";
        else
            url = "https://se.expressbase.com";

        this.ss = new EbServerEvents({ ServerEventUrl: url, Channels: ["file-upload"] });
        this.ss.onUploadSuccess = function (m, e) {
            $("#" + _container + "sub-upload").show();
            //this.FileId = this.getUrl(m.objectId);
            this.FileId = m.objectId;
            $('#' + _container + 'obj-id').text(this.FileId);
            $(".file-preview-initial").attr("tabindex", "1");
            $(".file-preview-initial").on("focus", this.imageOnSelect.bind(this));
            $("#" + _container + "_close").prop('disabled', false).on('click', this.getId.bind(this));
        }.bind(this);
    };

    this.init = function () {
        $("#" + _container).empty();
        this.CreateMOdalW();
        //this.getUplodedImgOnload();
        this.loadFileInput();
        $('body').off("click", "#" + _ToggleId).on("click", "#" + _ToggleId, this.toggleModal.bind(this));
        $('#' + _container + '_close_btn').on("click", this.stopListening.bind(this));
    };
    this.init();
}