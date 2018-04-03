var imageUploader = function (option) {

    var _container = option.Container;
    var _controller = option.Controller;
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
            + '<button type="button" class="close" id="' + _container+'_close_btn" onclick="$(\'#' + _container + ' .imgup-bg\').hide(500);" >&times;</button>'
            + '<h4 class="modal-title" style="display:inline;">Image Selector </h4>'
            + '<p style="display:inline;float:right;margin-right: 20px;" id="' + _container + 'obj-id"></p>'
            + '</div>'

            + '<div class="modal-body">'
            + "<div id-'img-upload-body' style='margin-top:15px;'><input id='" + _container + "input-id' type='file' data-preview-file-type='text' " + _multiple + "></div>"
            + "<h6>Tags</h6>"
            + "<input type= 'text' data-role='tagsinput' id= '" + _container + "tagval' value='' class='form-control' style='display:none;width:100%;'>"
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
        }).on('fileloaded', this.addtagButton.bind(this))
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
        _tag[f.name.toLowerCase()] = $("#" + _container + "tagval").tagsinput('items');
    };

    this.addtagButton = function (event, file, previewId, index, reader) {
        if (option.IsTag) {
            $("#" + previewId).children().find(".file-footer-buttons").append(`<button type='button' id='${_container}tagbtn${previewId}'
                class='kv-file-upload btn btn-kv btn-default btn-outline-secondary' index='${index}'  title= 'Tag'> Tag</button> `);

            $("#" + _container + "tagbtn" + previewId).on("click", this.tagimageOnClick.bind(this));
        }       
        $("#" + _container + "_close").prop('disabled', true);
    };//tadd tag btn

    this.imageOnSelect = function (e) {
        $("#" + _container + 'obj-id').text('value', $(e.target).children().find("img").attr("src"));
        this.FileId = $(e.target).children().find("img").attr("src");
    }

    this.uploadtag = function (previewId, index) {
        return { "tags": JSON.stringify(_tag) };  
    };

    this.tagimageOnClick = function () {
        $("#" + _container + "tagval").show().tagsinput('refresh');
    };//tag btn onclick

    this.getUplodedImgOnload = function () {
        var _this = this;
        $.post("../StaticFile/FindFilesByTags", {
            "tags": this.currtag
        }, function (result) {
            for (var objid = 0; objid < result.length; objid++) {
                var url = "http://" + __Tid + ".localhost:41500/static/" + result[objid].objectId + "." + result[objid].fileType;
                var config = { caption: result[objid].fileName, size: result[objid].length };
                __initialPrev.push(url);
                __initialPrevConfig.push(config);
            }
            _this.loadFileInput();
        });
    };

    this.getId = function () {
        this.ss.stopListening();
        return this.FileId;
    };

    this.startSE = function () {
        this.ss = new EbServerEvents({ ServerEventUrl: "https://se.eb-test.info", Channels: ["file-upload"] });
        this.ss.onUploadSuccess = function (m, e) {
            $("#" + _container + "sub-upload").show();
            this.FileId = m.objectId;
            $('#' + _container + 'obj-id').text(this.FileId);
            $(".file-preview-initial").attr("tabindex", "1");
            $(".file-preview-initial").on("focus", this.imageOnSelect.bind(this));
            $("#" + _container + "_close").prop('disabled', false).on('click', this.getId.bind(this));            
        }.bind(this);
    };

    this.init = function () {
        //this.getUplodedImgOnload();
        $("#" + _container).empty();
        this.CreateMOdalW();
        this.loadFileInput();
        $('body').off("click", "#" + _ToggleId).on("click", "#" + _ToggleId, this.toggleModal.bind(this));
        $('#' + _container + '_close_btn').on("click", this.stopListening.bind(this));
    };
    this.init();
}