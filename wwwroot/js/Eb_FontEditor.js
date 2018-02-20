var FontEditor = function (params) {
    this.ContainerId = params.ContainerId;
    this.ToggleId = params.ToggleId
    this.fonts = EbFonts;
    this.fontObject = {
        Font: "",
        Fontsize: 14,
        Fontstyle: "normal",
        FontWeight: 'normal',
        Fontcolor: "black",
        Caps: 'none',
        Strikethrough: 'none',
        Underline: 'none'
    };

    this.createModal = function () {
        var modalHTML = '<div class="fup" id="' + this.ContainerId + 'fontEditor" style="display:none;"><div class="fontW">'
            + '<div class="FECont" style="z-index: 1000;">'
            + '<div class="modal-header">'
            + '<button type="button" class="close" onclick="$(\'#' + this.ContainerId + 'fontEditor\').hide(500);" >&times;</button>'
            + '<h4 class="modal-title" style="display:inline;">Font Editor </h4>'
            + '</div>'
            + '<div class="modal-body">'
            + '<div class="FE-section" id="' + this.ContainerId + 'FE-section">'
            + '</div>'
            + '<div class="FE-sectionMprop" id="' + this.ContainerId + 'FE-sectionMprop">'
            + '</div>'
            + '<div class="FE-preview form-group" style="margin-left: 20px">'
            + '<label>Preview Text:</label>'
            + '<div id="font-preview" class="form-control text-center" style="font-size: 18px; font-weight: normal;min-height: 50px;">Font preview</div>'
            + '</div>'
            + '</div > '
            + '<div class="modal-footer">'
            + '<div class="modal-footer-body">'
            + '<button type="button" name="CXE_OK" id="' + this.ContainerId + '_close" class="btn"  onclick="$(\'#' + this.ContainerId + 'fontEditor\').hide(500);">OK</button>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>'
            + '</div>';

        $("#" + this.ContainerId).append(modalHTML);
        this.appendFontPropsSec();
    };

    this.appendFontPropsSec = function () {
        var Prophtml = (
            '<div class="col-md-7 pd-0 FEcol FEfont-family">'
            + '<div class="FEhead-font" style="text-align:left">'
            + '<div class="font-text">Font</div><input type="text" id="fontSearch" class="fontSearch" placeholder="search font">'
            + '</div > '
            + '<div class="FEcol-bdy" id="' + this.ContainerId + 'FEfamily-bdy">'
            + '<select name="googleFont" id="googleFont" class="form-control" size="5"></select>'
            + '</div > '
            + '</div>'
            + '<div class="col-md-2 pd-0 FEcol FEcol FEfont-style"><div class="FEhead">Font Style</div>'
            + '<div class="FEcol-bdy" id="' + this.ContainerId + 'FEStyle-bdy">'
            + '<select name="fontStyle" size="5" id="fontStyle" class="form-control">'
            + '</select>'
            + '</div>'
            + '</div>'
            + '<div class="col-md-2 pd-0 FEcol FEfont-size"><div class="FEhead">Size</div>'
            + '<div class="FEcol-bdy" id="' + this.ContainerId + 'FEsize-bdy">'
            + '<select name="fontSize" size="5" id="fontSize" class="form-control"></select>'
            + '</div>'
            + '</div>');
        $("#" + this.ContainerId + "FE-section").append(Prophtml);
        this.appendMpropSec();
    };

    this.appendMpropSec = function () {
        var MpropHtml = ('<div class="col-md-4 pd-0"><label>Font Color:</label>'
            + '<input type="color" class="form-control" id="fontColor" style="height:30px;display:inline;">'
            + '</div>'
            + '<div class="col-md-2 pd-0"><label>Caps:</label>'
            + '<input type="checkbox" name="caps" id="FE-caps" class="btn btn-info" style="display:inline;height: 17px; width: 17px;">'
            + '</div>'
            + '<div class="col-md-3 pd-0"><label>Strikethrough:</label>'
            + '<input type="checkbox" name="strikethrough" id="FE-strikethrough" class="btn btn-info" style="display:inline;height: 17px; width: 17px;">'
            + '</div>'
            + '<div class="col-md-3 pd-0"><label>Underline:</label>'
            + '<input type="checkbox" name="underline" id="FE-Underline" class="btn btn-info" style="display:inline;height: 17px; width: 17px;">'
            + '</div>');
        $("#" + this.ContainerId + "FE-sectionMprop").append(MpropHtml);
    }

    this.loadFontStyle = function () {
        $('#fontStyle').append($("<option value='regular'>Regular</option>"
            + "<option value= 'italic' > Italic</option >"
            + "<option value= 'bold' > Bold</option >"
            + "<option value= 'bold italic' > Bold Italic</option >"));
    };

    this.loadFontFamily = function () {
        var pos = 0;
        $.each(this.fonts.items, function (idx, font) {
            $('#googleFont')
                .append(
                $("<option value='" + font.family + "'>" + font.family + "</option>"));
        });
    }

    this.loadFontSize = function () {
        for (var i = 0; i <= 50; i++) {
            $('#fontSize')
                .append(
                $("<option value='" + i + "'>" + i + "px</option>"));
        }
    };

    this.loadFont = function (e) {
        fontName = $(e.target).val();
        this.loadCSS('http://fonts.googleapis.com/css?family=' + fontName);
        $('#font-preview').css('font-family', fontName);
        this.fontObject.Font = fontName;
    }

    this.loadCSS = function (href) {
        var cssLink = $("<link rel='stylesheet' type='text/css' href='" + href + "'>");
        $("head").append(cssLink);
    }

    this.LoadFontStyle = function (e) {
        if ($(e.target).val() === "regular") {
            $('#font-preview').css({ 'font-style': 'normal', 'font-weight': 'normal' });
            this.fontObject.Fontstyle = 'normal';
            this.fontObject.FontWeight = 'normal';
        }
        else if ($(e.target).val() === "italic") {
            $('#font-preview').css({ 'font-style': 'italic', 'font-weight': 'normal' });
            this.fontObject.Fontstyle = 'italic';
            this.fontObject.FontWeight = 'normal';
        }
        else if ($(e.target).val() === "bold") {
            $('#font-preview').css({ 'font-weight': 'bold', 'font-style': 'normal' });
            this.fontObject.Fontstyle = 'normal';
            this.fontObject.FontWeight = 'bold';
        }
        else if ($(e.target).val() === "bold italic") {
            $('#font-preview').css({ 'font-style': 'italic', 'font-weight': 'bold' });
            this.fontObject.Fontstyle = 'italic';
            this.fontObject.FontWeight = 'bold';
        }
    };

    this.getFontSize = function (e) {
        $('#font-preview').css('font-size', $(e.target).val() + 'px');
        this.fontObject.Fontsize = $(e.target).val();
    };

    this.searchFont = function (e) {
        var srchWord = $(e.target).val().toLowerCase();

        $('#googleFont').children('option').each(function () {            
            if ($(this).val().toLowerCase().match(srchWord)) {
                $(this).show();
            }
        });
    };

    this.getFontColor = function (e) {
        $('#font-preview').css('color', $(e.target).val());
        this.fontObject.Fontcolor = $(e.target).val();
    }

    this.toggleModal = function () {
        $("#" + this.ContainerId + "fontEditor").toggle(350);
    };

    this.changeCaps = function (e) {
        if ($(e.target).prop('checked') === true) {
            $('#font-preview').css('text-transform', 'uppercase');
            this.fontObject.Caps = 'uppercase';
        }
        else {
            $('#font-preview').css('text-transform', 'lowercase');
            this.fontObject.Caps = 'lowercase';
        }
    };

    this.strikeThrough = function (e) {
        if ($(e.target).prop('checked') === true) {
            $('#font-preview').css('text-decoration', 'line-through');
            this.fontObject.Strikethrough = 'line-through';
            $('#FE-Underline').prop('checked', false);
            this.fontObject.Underline = 'none';
        }
        else {
            $('#font-preview').css('text-decoration', 'none');
            this.fontObject.Strikethrough = 'none';
        }
    };

    this.Underline = function (e) {        
        if ($(e.target).prop('checked') === true) {
            $('#font-preview').css('text-decoration', 'underline');
            this.fontObject.Underline = 'underline';
            $('#FE-strikethrough').prop('checked', false);
            this.fontObject.Strikethrough = 'none';
        }
        else {
            $('#font-preview').css('text-decoration', 'none');
            this.fontObject.Underline = 'none';
        }
    };

    this.fontEdSubmit = function () {
        return this.fontObject;
    };

    this.init = function () {
        this.createModal();
        this.loadFontStyle();
        this.loadFontFamily();
        this.loadFontSize();
        $("body").on("click", "#" + this.ToggleId, this.toggleModal.bind(this));
        $('#googleFont').on('change', this.loadFont.bind(this));
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