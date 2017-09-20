var Eb_pgCXVE = function (pgObj) {
    this.PGobj = pgObj;
    this.CE_PGObj = {};
    this.pgCXE_Cont_Slctr = "#" + this.PGobj.wraperId + " .pgCXEditor-Cont";
    this.CEctrlsContId = this.PGobj.wraperId + "_CEctrlsCont";

    this.CXE_OKclicked = function () {
        this.OnInputchangedFn.bind(this)();
        this.OnCXE_OK(this.PGobj.PropsObj[this.CurProp]);
    };

    this.pgCXE_BtnClicked = function (e) {
        $("#" + this.PGobj.wraperId + " .pgCollEditor-bg").show();
        $(this.pgCXE_Cont_Slctr + " .modal-footer .modal-footer-body").empty();
        this.CurProp = e.target.getAttribute("for");
        this.CurEditor = this.PGobj.Metas[this.PGobj.propNames.indexOf(this.CurProp.toLowerCase())].editor;
        var editor = e.target.getAttribute("editor");
        if (editor === "7") {
            this.initCE();
        }
        if (editor === "8") {
            this.initJE();
        }
        if (editor === "10")
            this.initOSE();

        $("#" + this.PGobj.wraperId + " .CE-body").off("click", ".colTile").on("click", ".colTile", this.colTileFocusFn.bind(this));
        $(this.pgCXE_Cont_Slctr).off("click", "[name=CXE_OK]").on("click", "[name=CXE_OK]", this.CXE_OKclicked.bind(this));
    };

    this.initCE = function () {
        var CEbody = '<div class="CE-body">'
            + '<table class="table table-bordered editTbl">'
            + '<tbody>'
            + '<tr>'
            + '<td style="padding: 0px;">'
            + '<div class="CE-controls-head" >' + (this.PGobj.Metas[this.PGobj.propNames.indexOf(this.CurProp.toLowerCase())].alias || this.CurProp) + ' </div>'
            + '<div id="' + this.CEctrlsContId + '" class="CEctrlsCont"></div>'
            + '</td>'
            + '<td style="padding: 0px;"><div id="' + this.PGobj.wraperId + '_InnerPG' + '" class="inner-PG-Cont"><div></td>'
            + '</tr>'
            + '</tbody>'
            + '</table>'
            + '</div>';
        var DD_html = '<div class="sub-controls-DD-cont pull-left">'
            + '<select class="selectpicker"> </select>'
            + '<button type="button" class="CE-add" ><i class="fa fa-plus" aria-hidden="true"></i></button>'
            + '</div>';

        $(this.pgCXE_Cont_Slctr + " .modal-title").text("Collection Editor");
        $(this.pgCXE_Cont_Slctr + " .modal-body").html(CEbody);
        $(this.pgCXE_Cont_Slctr + " .modal-footer .modal-footer-body").append(DD_html);
        this.CE_PGObj = new Eb_PropertyGrid(this.PGobj.wraperId + "_InnerPG");
        this.setColTiles();///a
        new dragula([document.getElementById(this.CEctrlsContId)]);
    };

    this.setColTiles = function () {
        if (this.CurProp === "Controls")
            var values = this.PGobj.PropsObj.Controls.$values;
        else
            var values = this.PGobj.PropsObj[this.CurProp];
        var options = "";
        var SubTypes = this.PGobj.Metas[this.PGobj.propNames.indexOf(this.CurProp.toLowerCase())].options;
        $("#" + this.CEctrlsContId).empty();
        if (SubTypes) {
            $.each(values, function (i, control) {
                var type = control.$type.split(",")[0].split(".")[2];
                var $tile = $('<div class="colTile" id="' + control.EbSid + '" tabindex="1" eb-type="' + type + '" onclick="$(this).focus()"><i class="fa fa-arrows" aria-hidden="true" style="padding-right: 5px; font-size:10px;"></i>'
                    + control.Name
                    + '<button type="button" class="close">&times;</button>'
                    + '</div>');
                $("#" + this.CEctrlsContId).append($tile);
                this.colTileFocusFn({ "target": $("#" + control.EbSid).click()[0] });//hack

            }.bind(this));

            for (var i = 0; i < SubTypes.length; i++) { options += '<option>' + SubTypes[i] + '</option>' }
        }
        $(this.pgCXE_Cont_Slctr + " .modal-footer .selectpicker").empty().append(options).selectpicker('refresh');
    };

    this.colTileCloseFn = function (e) {
        alert();
        e.stopPropagation();
        $(e.target).parent().remove();
    };

    this.colTileFocusFn = function (e) {
        var $e = $(e.target);
        var id = $e.attr("id");
        var obj = null;
        if (this.CurProp === "Controls")
            obj = this.PropsObj.Controls.GetByName(id);
        else
            obj = this.PGobj.PropsObj[this.CurProp].filter(function (obj) { return obj.EbSid == $e.attr("id"); })[0];
        this.CE_PGObj.setObject(obj, AllMetas[$(e.target).attr("eb-type")]);
    };

    this.CE_AddFn = function () {
        var SelType = $(this.pgCXE_Cont_Slctr + " .modal-footer .sub-controls-DD-cont").find("option:selected").val();
        var EbSid = null;
        if (this.CurProp === "Controls") {
            EbSid = this.PGobj.PropsObj.EbSid + "_" + SelType + this.PGobj.PropsObj.Controls.$values.length;
            this.PGobj.PropsObj.Controls.$values.push(new EbObjects[SelType](EbSid));
        }
        else {
            EbSid = this.PGobj.PropsObj.EbSid + "_" + SelType + this.PGobj.PropsObj[this.CurProp].length;
            this.PGobj.PropsObj[this.CurProp].push(new EbObjects[SelType](EbSid));
        }
        this.setColTiles();
        $("#" + EbSid).click();
    };

    this.Init = function () {
        var CXVE_html = '<div class="pgCollEditor-bg">'
            + '<div class="pgCXEditor-Cont">'

            + '<div class="modal-header">'
            + '<button type="button" class="close" onclick="$(\'#' + this.PGobj.wraperId + ' .pgCollEditor-bg\').hide();" >&times;</button>'
            + '<h4 class="modal-title"> </h4>'
            + '</div>'

            + '<div class="modal-body"> </div>'

            + '<div class="modal-footer">'
            + '<div class="modal-footer-body">'
            + '</div>'
            + '<button type="button" name="CXE_OK" class="btn"  onclick="$(\'#' + this.PGobj.wraperId + ' .pgCollEditor-bg\').hide();">OK</button>'
            + '</div>'

            + '</div>'
            + '</div>';
        $(this.PGobj.$wraper).append(CXVE_html);

        $("#" + this.CEctrlsContId +" .colTile").on("click", ".close", this.colTileCloseFn);////////////////////
        $(this.pgCXE_Cont_Slctr).on("click", ".CE-add", this.CE_AddFn.bind(this));
    }
    this.Init();
};