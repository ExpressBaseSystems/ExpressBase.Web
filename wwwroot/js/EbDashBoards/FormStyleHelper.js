var FormStyleHelper = function (css){
    this.objectTab = $("#Objects");
    //this.ExportCollection = [];
    //this.AppId = appid;
    //this.AppType = apptype;
    //this.AppSettings = {};
    //this.AppInfo = appinfo;
    //this.EbFontLst = font_lst;

    this.init = function (css) {
        this.css = css.CssContent != null ? css.CssContent : [];
        let abc = "";
        for (let i = 0; i < this.css.length; i++) {
            abc += `<div><div class='webform_css_parent' data-toggle='collapse' data-target='#tg${i}' > 
            <i class='fa fa-chevron-circle-down' aria-hidden='true'></i> ${this.css[i].Heading} 
                </div >
                <div id='tg${i}' class='collapse' class='webform_css_child'>`;
            for (let j = 0; j < this.css[i].CssObj.length; j++) {
                abc += `<div class='css_selector' data-id='${i}~${j}'> <label data-id='${i}~${j}'>${this.css[i].CssObj[j].Heading}</label></div>`;
            }
            abc += `</div></div>`;
        }
        $("#css_cont").empty().append(abc);
        $(".css_selector").off("click").on("click", this.CurrentStyle.bind(this));
        $("#web_css_edit").on("change keyup paste", this.UpdateStyle2Obj.bind(this));
    }
  
    this.CurrentStyle = function (e) {
        let _id = $(e.target).attr("data-id").split("~");
        $("#web_css_edit").val(this.css[_id[0]].CssObj[_id[1]].Css);
        $("#web_css_edit").attr("data-id", $(e.target).attr("data-id"));
    };

    this.UpdateStyle2Obj = function (e) {
        let _id = $(e.target).attr("data-id").split("~");
        var currentVal = $(e.target).val();
        this.css[_id[0]].CssObj[_id[1]].Css = currentVal;
    };
    this.getStyleObj = function () {
        let obj = { CssContent: this.css}
        return obj;
    };
    //this.UpdateWebformSettings = function (e) {
    //    this.AppSettings["CssContent"] = this.css;
    //    $.ajax({
    //        type: "POST",
    //        url: "../Dev/UpdateAppSettingsWebform",
    //        data: { Settings: JSON.stringify(this.AppSettings), appid: this.AppId, type: this.AppType, },
    //        success: function (data) {
    //            $("#eb_common_loader").EbLoader("hide");
    //            if (data.status)
    //                EbMessage("show", { Message: data.message });
    //            else
    //                EbMessage("show", { Background: "red", Message: "Something went wrong" });
    //        }
    //    });
    //};
    this.ResetStyle = function () {
        $.ajax({
            type: "POST",
            url: "../Dev/ResetWebSettings",
            success: function (data) {
                $("#eb_common_loader").EbLoader("hide");
                FormStyleHelper(JSON.parse(data));
            }
        });
    }
    this.init(css);

    $("#webform-style-reset").off("click").on("click", this.ResetStyle.bind(this));
    //$("#update_webform_settings").on("click", this.UpdateWebformSettings.bind(this));
}