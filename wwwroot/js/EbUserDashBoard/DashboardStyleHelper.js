
//DataLabel Style Function

//const { functions } = require("stylus");

function EbDataLabelFn(Label, tileId) {
    if (Label.LabelStyle < 3) {
        if (Label.Object_Selector != "" && tileId != null)
            $(`[data-id="${tileId}"] .label-cont`).attr("ref-id", Label.Object_Selector);
        if (Label.ChangeTextPositon) {
            if (Label.StaticLabelPosition.Left !== 0 && Label.StaticLabelPosition.Top !== 0) {
                $(`#${Label.EbSid}_static`).css({ "left": `${Label.StaticLabelPosition.Left}%`, "top": `${Label.StaticLabelPosition.Top}%`, "position": "absolute" });
            }

            if (Label.DescriptionPosition.Left !== 0 && Label.DescriptionPosition.Top !== 0) {
                $(`#${Label.EbSid}_description`).css({ "left": `${Label.DescriptionPosition.Left}%`, "top": `${Label.DescriptionPosition.Top}%`, "position": "absolute" });
            }

            if (Label.DynamicLabelPositon.Left !== 0 && Label.DynamicLabelPositon.Top !== 0) {
                $(`#${Label.EbSid}_dynamic`).css({ "left": `${Label.DynamicLabelPositon.Left}%`, "top": `${Label.DynamicLabelPositon.Top}%`, "position": "absolute" });
            }
        }
        else {
            $(`#${Label.EbSid}_static`).css("position", "").css("left", "").css("top", "");
            $(`#${Label.EbSid}_description`).css("position", "").css("left", "").css("top", "");
            $(`#${Label.EbSid}_dynamic`).css("position", "").css("left", "").css("top", "");
        }
        if (Label.TextPosition == 0) { this.TextPosition = "left" }
        if (Label.TextPosition == 1) { this.TextPosition = "center" }
        if (Label.TextPosition == 2) { this.TextPosition = "right" }
        $(`#${Label.EbSid}_Data_pane .lbl`).css("text-align", this.TextPosition);
        //Static label style
        $(`#${Label.EbSid}_static`).empty().append(Label.StaticLabel);
        if (Label.StaticLabelFont !== null) {
            GetFontCss(Label.StaticLabelFont, $(`#${Label.EbSid}_static`));
        }

        //description style
        $(`#${Label.EbSid}_description`).empty().append(Label.Description);
        if (Label.DescriptionFont !== null) {
            GetFontCss(Label.DescriptionFont, $(`#${Label.EbSid}_description`));
        }

        //Dynamic label style
        if (Label.DynamicLabelFont !== null) {
            GetFontCss(Label.DynamicLabelFont, $(`#${Label.EbSid}_dynamic`));
        }
        if (Label.LabelStyle == 0) {
            $(`#${Label.EbSid}_Data_pane`).css("border-radius", Label.LabelBorderRadius);
            $(`#${Label.EbSid}_Data_pane`).css("border-color", Label.LabelBorderColor);
            $(`#${Label.EbSid}_footer`).css("border-color", Label.LabelBorderColor);
        }
        else if (Label.LabelStyle == 1) {
            $(`#${Label.EbSid}_Data_pane`).css("border-radius", `${Label.LabelBorderRadius}px`);
            $(`#${Label.EbSid}_icon`).css("border-radius", `${Label.LabelBorderRadius}px 0px 0px ${Label.LabelBorderRadius}px`);
            $(`#${Label.EbSid}_Data_pane`).css("border-color", Label.LabelBorderColor);
            $(`#${Label.EbSid}_footer`).css("border-color", Label.LabelBorderColor);
        }
        else if (Label.LabelStyle == 2) {
            $(`#${Label.EbSid}_Data_pane`).css("border-radius", `${Label.LabelBorderRadius}px`);
            $(`#${Label.EbSid}_icon`).css("border-radius", `0px ${Label.LabelBorderRadius}px  ${Label.LabelBorderRadius}px  0px`);
            $(`#${Label.EbSid}_Data_pane`).css("border-color", Label.LabelBorderColor);
            $(`#${Label.EbSid}_footer`).css("border-color", Label.LabelBorderColor);
        }
        else if (Label.LabelStyle == 3) {
            //$(`#${Label.EbSid}_Data_pane`).css("border-radius", `${Label.LabelBorderRadius}px`);
            //$(`#${Label.EbSid}_icon`).css("border-radius", `0px ${Label.LabelBorderRadius}px  ${Label.LabelBorderRadius}px  0px`);
            $(`#${Label.EbSid}_Data_pane`).css("border-color", Label.LabelBorderColor);
            $(`#${Label.EbSid}_footer`).css("border-color", Label.LabelBorderColor);
        }
        if (!Label.IsGradient) {
            $(`#${Label.EbSid}_Data_pane`).css("background", Label.LabelBackColor);
        }
        if (Label.IsGradient) {
            $(`#${Label.EbSid}_Data_pane`).css("background", "");
            let direction = GradientDirection(Label.Direction);
            let bg = "linear-gradient(" + direction + "," + Label.GradientColor1 + "," + Label.GradientColor2 + ")";
            $(`#${Label.EbSid}_Data_pane`).css('background-image', bg);
        }
        $(`#${Label.EbSid}_Data_pane`).css("border", `solid 1px ${Label.LabelBorderColor}`);

        //Label Icon
        if (Label.RenderIcon) {
            if (Label.LabelStyle == 0) {
                $(`#${Label.EbSid}_Data_pane`).css("padding-left", "14vh");
                $(`#${Label.EbSid}`).css("padding-top", "2vh");
            }
            $(`#${Label.EbSid}_icon`).css('display', 'block');
        }
        else {
            $(`#${Label.EbSid}_Data_pane`).css("padding-left", "2vh")
            $(`#${Label.EbSid}`).css("padding-top", "0vh");
            $(`#${Label.EbSid}_icon`).css('display', 'none');
        }

        if (Label.HideFooter) { $(`#${Label.EbSid}_footer`).css("display", "none"); }
        else { $(`#${Label.EbSid}_footer`).css("display", "block"); }

        let Icondirection = GradientDirection(Label.IconDirection);
        let bg = "linear-gradient(" + Icondirection + "," + Label.IconGradientColor1 + "," + Label.IconGradientColor2 + ")";
        if (Label.LabelStyle != 4)
            $(`#${Label.EbSid}_icon`).css('background-image', bg);
        $(`#${Label.EbSid}_icon i`).css("color", Label.IconColor);
        if (Label.IconText == "" || Label.IconText == null || Label.IconText == undefined) {
            $(`#${Label.EbSid}_icon i`).empty().removeAttr("class").addClass(`fa ${Label.Icon}`);
            $(`#${Label.EbSid}_icon`).css({ "display": "flex", "align-items": "center", "justify-content": "center" });
        }
        else {
            $(`#${Label.EbSid}_icon i`).empty().append(Label.IconText).removeAttr("class").addClass(`lbl-icon-text`);
            $(`#${Label.EbSid}_icon`).css({ "display": "flex", "align-items": "center", "justify-content": "center" });
        }

        $(`#${Label.EbSid}_footer label`).css("color", Label.FooterTextColor);
        $(`#${Label.EbSid}_footer i`).removeAttr("class").addClass(`fa ${Label.FooterIcon}`);
        $(`#${Label.EbSid}_footer i`).css("color", Label.FooterIconColor);
        $(`#${Label.EbSid}_footer label`).text(Label.FooterText);

        //shadow Editor 
        if (Label.Shadow) {
            $(`#${Label.EbSid}_Data_pane`).css("box-shadow", Label.Shadow);
        }
    }
    else {

        if (Label.Object_Selector != "" && tileId != null)
            $(`[data-id="${tileId}"] .label-cont`).attr("ref-id", Label.Object_Selector);
        if (Label.ChangeTextPositon) {
            if (Label.StaticLabelPosition.Left !== 0 && Label.StaticLabelPosition.Top !== 0) {
                $(`#${Label.EbSid}_static`).css({ "left": `${Label.StaticLabelPosition.Left}%`, "top": `${Label.StaticLabelPosition.Top}%`, "position": "absolute" });
            }

            if (Label.DescriptionPosition.Left !== 0 && Label.DescriptionPosition.Top !== 0) {
                $(`#${Label.EbSid}_description`).css({ "left": `${Label.DescriptionPosition.Left}%`, "top": `${Label.DescriptionPosition.Top}%`, "position": "absolute" });
            }

            if (Label.DynamicLabelPositon.Left !== 0 && Label.DynamicLabelPositon.Top !== 0) {
                $(`#${Label.EbSid}_dynamic`).css({ "left": `${Label.DynamicLabelPositon.Left}%`, "top": `${Label.DynamicLabelPositon.Top}%`, "position": "absolute" });
            }
        }
        else {
            $(`#${Label.EbSid}_static`).css("position", "").css("left", "").css("top", "");
            $(`#${Label.EbSid}_description`).css("position", "").css("left", "").css("top", "");
            $(`#${Label.EbSid}_dynamic`).css("position", "").css("left", "").css("top", "");
        }
        if (Label.TextPosition == 0) { this.TextPosition = "left" }
        if (Label.TextPosition == 1) { this.TextPosition = "center" }
        if (Label.TextPosition == 2) { this.TextPosition = "right" }
        $(`#${Label.EbSid}_Data_pane .lbl`).css("text-align", this.TextPosition);
        //Static label style
        $(`#${Label.EbSid}_static`).empty().append(Label.StaticLabel);
        if (Label.StaticLabelFont !== null) {
            GetFontCss(Label.StaticLabelFont, $(`#${Label.EbSid}_static`));
        }

        //description style
        $(`#${Label.EbSid}_description`).empty().append(Label.Description);
        if (Label.DescriptionFont !== null) {
            GetFontCss(Label.DescriptionFont, $(`#${Label.EbSid}_description`));
        }

        //Dynamic label style
        if (Label.DynamicLabelFont !== null) {
            GetFontCss(Label.DynamicLabelFont, $(`#${Label.EbSid}_dynamic`));
        }

        if (Label.LabelStyle == 3) {
            $(`#${Label.EbSid}`).css("border", `solid 1px ${Label.LabelBorderColor}`);
            $(`#${Label.EbSid}_footer`).css("border-color", Label.LabelBorderColor);
        }
        if (!Label.IsGradient) {
            $(`#${Label.EbSid}_Data_pane`).css("background", Label.LabelBackColor);
        }
        if (Label.IsGradient) {
            $(`#${Label.EbSid}_Data_pane`).css("background", "");
            let direction = GradientDirection(Label.Direction);
            let bg = "linear-gradient(" + direction + "," + Label.GradientColor1 + "," + Label.GradientColor2 + ")";
            $(`#${Label.EbSid}_Data_pane`).css('background-image', bg);
        }
        //$(`#${Label.EbSid}_Data_pane`).css("border", `solid 1px ${Label.LabelBorderColor}`);

        //render icon  or icon text
        if (Label.IconText == "") {
            $(`#${Label.EbSid}_icon i`).removeClass().addClass(`fa ${Label.Icon}`);
            let _fontsize = $(`#${Label.EbSid}_icon`).height() < $(`#${Label.EbSid}_icon`).width() ? $(`#${Label.EbSid}_icon`).height() : $(`#${Label.EbSid}_icon`).width();
            $(`#${Label.EbSid}_icon`).css("font-size", _fontsize - 40 + "px");
        }
        else {
            $(`#${Label.EbSid}_icon i`).removeClass().text(Label.IconText);
        }
        //Label Icon
        if (Label.RenderIcon) {
            $(`#${Label.EbSid} .body-pane`).removeClass("col-lg-12 col-sm-12 col-md-12").addClass("col-lg-8 col-sm-8 col-md-8");
            $(`#${Label.EbSid} .icon-pane`).show();
        }
        else {
            $(`#${Label.EbSid} .body-pane`).removeClass("col-lg-8 col-sm-8 col-md-8").addClass("col-lg-12 col-sm-12 col-md-12");
            //$(`#${Label.EbSid}_Data_pane`).css("padding-left", "2vh")
            //$(`#${Label.EbSid}`).css("padding-top", "0vh");
            //$(`#${Label.EbSid}_icon`).css('display', 'none');
            $(`#${Label.EbSid} .icon-pane`).hide();
        }

        if (Label.HideFooter) { $(`#${Label.EbSid}_footer`).css("display", "none"); }
        else { $(`#${Label.EbSid}_footer`).css("display", "block"); }

        let Icondirection = GradientDirection(Label.IconDirection);
        let bg = "linear-gradient(" + Icondirection + "," + Label.IconGradientColor1 + "," + Label.IconGradientColor2 + ")";
        $(`#${Label.EbSid}_icon`).css('background-image', bg);
        $(`#${Label.EbSid}_icon i`).css("color", Label.IconColor);

        $(`#${Label.EbSid}_footer label`).css("color", Label.FooterTextColor);
        $(`#${Label.EbSid}_footer i`).removeAttr("class").addClass(`fa ${Label.FooterIcon}`);
        $(`#${Label.EbSid}_footer i`).css("color", Label.FooterIconColor);
        $(`#${Label.EbSid}_footer label`).text(Label.FooterText);

        //shadow Editor 
        if (Label.Shadow) {
            $(`#${Label.EbSid}`).css("box-shadow", Label.Shadow);
        }

        /*$(".icon-pane").off*/
        $(`#${Label.EbSid}`).css("border-radius", `${Label.LabelBorderRadius}px`);
        if (Label.LabelStyle == 3)
            $(`#${Label.EbSid}_icon`).css("border-radius", `${Label.LabelBorderRadius}px 0px 0px ${Label.LabelBorderRadius}px`);
        else if (Label.LabelStyle == 4)
            $(`#${Label.EbSid}_icon`).css("border-radius", `0px ${Label.LabelBorderRadius}px ${Label.LabelBorderRadius}px 0px`);

    }
}

//Tile style function

function Eb_Tiles_StyleFn(Tile, TileId, TabNum) {
    if (Tile.LabelColl.$values == 0) {
        //Tile Back Color
        if (Tile.IsGradient) {
            let direction = GradientDirection(Tile.Direction);
            let bg = "linear-gradient(" + direction + "," + Tile.GradientColor1 + "," + Tile.GradientColor2 + ")";
            $(`#${TileId}`).css("background-image", bg);
        }
        else {
            $(`#${TileId}`).css("background", Tile.TileBackColor);
        }

        //Tile border
        $(`#${TileId}`).css("border-radius", Tile.BorderRadius == 0 ? 4 + "px" : Tile.BorderRadius + "px");
        $(`#${TileId}`).css("border", `solid 1px ${Tile.BorderColor}`);

        //Tile Label
        $(`#${TabNum}_Label_${TileId}`).empty().append(Tile.Label);
        $(`#${TabNum}_Label_${TileId}`).css("left", Tile.Left + "%").css("top", Tile.Top + "%").css("position", "absolute");
        if (Tile.LabelFont !== null) {
            GetFontCss(Tile.LabelFont, $(`#${TabNum}_Label_${TileId}`));
        }
        //Tile Text Font 
        $(`#${TileId} tr`).css("color", `${Tile.FontColor}`);
        $(`#${TileId} th`).css({ "color": `${Tile.FontColor} !important;` });
        $(`#${TileId} td`).css({ "color": `${Tile.FontColor} !important;` });
        $(`#${TileId} a`).css("color", `${Tile.LinkColor} !important;`).css("font-size: 14px;");

        $(`#${TileId} td`).css("border-bottom", "1px solid #2b2b2b;!important")
    }
}

function Eb_Dashboard_Bg(EbObject) {
    if (EbObject.IsGradient) {
        let direction = GradientDirection(EbObject.Direction);
        let bg = "linear-gradient(" + direction + "," + EbObject.GradientColor1 + "," + EbObject.GradientColor2 + ")";
        $("#layout_div").css("background-color", "").css("background-image", bg);
        $(".component_cont .nav").css("background-color", "").css("background-image", bg);
    }
    else {
        $("#layout_div").css("background", EbObject.BackgroundColor);
        $(".component_cont .nav").css("background-image", "").css("background", EbObject.BackgroundColor);
        if (EbObject.BackgroundImage) {

            function responsiveDbBgImg(maxWidth) {
                if (maxWidth.matches) {
                    $("#layout_div").css("background-image", `unset`);
                }
                else {
                    $("#layout_div").css("background-image", `url("/images/${EbObject.BackgroundImage}.jpg")`);
                }
            }

            $("#layout_div")
                .css("background-image", `url("/images/${EbObject.BackgroundImage}.jpg")`)
                .css("background-size", "100% 100%").css("background-repeat", "no-repeat")
                .css("background-position-x", "center")
                .css("background-position-y", "top");

            var maxWidth = window.matchMedia("(max-width: 768px)");

            responsiveDbBgImg(maxWidth);
            maxWidth.addListener(responsiveDbBgImg);
        }
        else
            $("#layout_div").css("background-image", "");
    }
}

function GradientDirection(val) {
    gradient = [];
    gradient[0] = "to right";
    gradient[1] = "to left";
    gradient[2] = "to bottom";
    gradient[3] = "to bottom right";
    gradient[4] = "to bottom left";
    gradient[5] = "to top right";
    gradient[6] = "to top left";

    return gradient[val];
}

$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
});


function LinkStyle(Obj, tile, TabNum, filtervalues) {
    $(`[eb-id=${tile}]`).addClass("eb-links")
    this.link = Obj.Object_Selector ? GetUrl4Link(Obj.Object_Selector, filtervalues) : "#";
    $(`#${Obj.EbSid}_link`).text(Obj.LinkName);
    if (Obj.Object_Selector) {
        $(`#${Obj.EbSid}_link`).attr("href", this.link);
        $(`#${Obj.EbSid}_link`).attr("target", Obj.LinkName);
    }
    if (Obj.HoverText) {
        $(`#${Obj.EbSid}_link`).attr("data-toggle", `Link-hover_${Obj.EbSid}`);
        $(`#${Obj.EbSid}_link`).attr("title", Obj.HoverText);
        $(`#${Obj.EbSid}_link`).attr("data-placement", "bottom");
        $(`[data-toggle="Link-hover_${Obj.EbSid}"]`).tooltip();
    }
    if (Obj.BackgroundColor) {
        $(`#${Obj.EbSid}`).css("background-image", Obj.BackgroundColor);
    }
    if (Obj.BackgroundColor) {
        $(`#${Obj.EbSid}_icon`).css("background-image", Obj.IconBackgroundColor);
    }
    if (Obj.FontStyle) {
        GetFontCss(Obj.FontStyle, $(`#${Obj.EbSid}_link`));
    }
    $(`#${Obj.EbSid} i`).removeAttr("class").addClass(`fa ${Obj.Icon}`);
}


function GetUrl4Link(refid, filtervalues) {
    this.filterValues = filtervalues;
    var objtype = parseInt(refid.split("-")[2]);
    let objTypeName = GetEnumType(objtype);
    let objid = parseInt(refid.split("-")[3]);
    this.login = ebcontext.user.wc;
    var _url = `../Eb_Object/Index?objid=${objid}&objtype=${objtype}`;
    if (this.login === "uc") {
        if (objTypeName === "TableVisualization" || objTypeName === "ChartVisualization" || objTypeName === "GoogleMap") {
            _url = "../DV/dv?refid=" + refid + "&filterValues=" + btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValues))));
        }
        else if (objTypeName === "Report") {
            _url = "../ReportRender/Index?refid=" + refid;
        }
        else if (objTypeName === "WebForm") {
            let _l = (ebcontext.languages != undefined) ? ebcontext.languages.getCurrentLanguageCode() : 'en';
            _url = "../WebForm/Index?_r=" + refid + "&_p" + btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValues)))) + "&_lg=" + _l;
        }
        else if (objTypeName === "DashBoard") {
            _url = "../DashBoard/DashBoardView?refid=" + refid + "&filterValues=" + btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValues))));
        }
        else if (objTypeName === "CalendarView") {
            _url = "../Calendar/CalendarView?refid=" + refid;
        }
    }

    return _url;
};

function GetEnumType(id) {
    this.obj = {};
    this.obj[0] = "WebForm";
    this.obj[1] = "DisplayBlock";
    this.obj[2] = "DataReader";
    this.obj[3] = "Report";
    this.obj[4] = "DataWriter";
    this.obj[5] = "SqlFunctions";
    this.obj[11] = "DVBuilder";
    this.obj[12] = "FilterDialog";
    this.obj[13] = "MobilePage";
    this.obj[14] = "UserControl";
    this.obj[15] = "EmailBuilder";
    this.obj[16] = "TableVisualization";
    this.obj[17] = "ChartVisualization";
    this.obj[18] = "BotForm";
    this.obj[19] = "SmsBuilder";
    this.obj[20] = "ApiBuilder"
    this.obj[1] = "MapView";
    this.obj[22] = "DashBoard"
    this.obj[24] = "Calendar";
    this.obj[26] = "SqlJob";
    this.obj[100] = "All";
    return this.obj[id];
}
