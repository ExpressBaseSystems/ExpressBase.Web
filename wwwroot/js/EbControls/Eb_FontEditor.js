﻿var FontEditor = function (params, fontEditobj) {
    this.ContainerId = params.ContainerId;
    this.ToggleId = params.ToggleId;
    var _font = {
        FontName: "Roboto",
        CSSFontName: "Roboto",
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
        $('#googleFont').append(`<option tabindex='1' sys-name='Roboto' value='Roboto'>Roboto (Default)</option>`);
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
        if (fontVal !== 'Roboto') { this.loadCSS('https://fonts.googleapis.com/css?family=' + fontVal); }
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