var AppDashBoard = function (appid, apptype, appsettings, appinfo, font_lst) {
    this.objectTab = $("#Objects");
    this.ExportCollection = [];
    this.AppId = appid;
    this.AppType = apptype;
    this.AppSettings = appsettings;
    this.AppInfo = appinfo;
    this.EbFontLst = font_lst;

    this.init = function () {
        if (this.AppType === 3) {
            this.botConfigFn();
            this.BgImageUpload();
        }

        $('#updateBotSettings, #updateBotAppearance').on('click', this.UpdateBotSettingsFn.bind(this));
        $('.resetcss').on('click', this.ResetCssFn.bind(this));
        $('input[name=authtype]').on('click', this.authMethodCheckFn.bind(this));
        $('input[name=userAuthType]').on('change', this.userAuthTypeFn.bind(this));
        $('#grdntmodalbtn').on('click', this.gradientValueChangeFn.bind(this));
    };

    this.searchObjects = function (e) {
        var srchBody = $(".raw-objectTypeWrprBlk:visible");
        var srch = $(e.target).val().toLowerCase();
        var count = 0;
        $.each(srchBody.find(".objitems"), function (i, obj) {
            var cmpstr = $(obj).find(".head4").text().toLowerCase();
            if (cmpstr.indexOf(srch) !== -1) {
                $(obj).show();
                count++;
            }
            else
                $(obj).hide();
        });
    };

    this.expand = function (e) {
        let trigger = $(e.target).closest(".sidebar-objtypes-listitem").children("a").attr("link-id");
        $(".raw-objectTypeWrprBlk").hide();
        $(".active_type").removeClass("active_type");
        $(e.target).closest(".sidebar-objtypes-listitem").addClass("active_type");
        $(`#${trigger}`).fadeIn();
    };

    this.export = function (e) {
        this.ExportCollection.length = 0;
        this.objectTab.find(`input[name="ExportMark"]`).each(function (i, o) {
            if ($(o).is(":checked")) {
                this.ExportCollection.push($(o).attr("objid"));
            }
        }.bind(this));
        if (this.ExportCollection.length > 0)
            this.startExp();
    };

    this.startExp = function () {
        var form = document.createElement("form");
        form.style.display = "none";
        form.setAttribute("method", "post");
        form.setAttribute("action", "../ImportExport/ExportOSE");
        var ids = document.createElement("input");
        ids.setAttribute("name", "ids");
        ids.setAttribute("value", this.ExportCollection.join());
        form.appendChild(ids);
        var appid = document.createElement("input");
        appid.setAttribute("name", "AppId");
        appid.setAttribute("value", this.AppId);
        form.appendChild(appid);
        document.body.appendChild(form);
        form.submit();
    };

    //mobile app
    this.setUpImport4Mob = function () {
        $(".import_obj_link").off("click").on("click", this.objTypeClick.bind(this));
        $("#import_refsave").off("click").on("click", this.getSelRef.bind(this));
        $("#import_reftable_body").on("click", ".rm_refbtn", this.removeImportRef.bind(this));
        this.setRef();
    };

    this.getNew = function () {
        return {
            RefId: null,
            Name: null,
            DisplayName: null,
            Version: null
        };
    };

    //mobile app
    this.menuApiOnSelect = function (evt) {

        var o = this.getNew();

        o.RefId = $(evt.target).attr("refid");
        o.Name = $(evt.target).attr("name");
        o.DisplayName = $(evt.target).attr("display-name");
        o.Version = $(evt.target).attr("version");

        this.AppSettings.MenuApi = o;

        var text = `${o.DisplayName} (../${o.Name}/${o.Version}/json)`;
        $("#menuload-api-meta").text(text);
        $("#mobile-preloadmenu_mdl").modal("hide");
    };

    //mobile app
    this.resetMenuApi = function () {
        this.AppSettings.MenuApi = null;
        $("#menuload-api-meta").text("");
        $("#mobile-preloadmenu_mdl").modal("hide");
        $("#mobile-preloadmenu_mdl .import_obj_expand_objlinks").removeClass("selected");
    };

    //mobile app
    this.objTypeClick = function (evt) {
        let div = $(evt.target).closest(".import_obj_link");
        let target = div.attr("exp-target");
        $(".import_obj_expand").hide();
        $(target).show();
    };

    //mobile app
    this.refExist = function (ref) {
        let coll = this.AppSettings.DataImport.find(e => e.RefId === ref);
        if (coll === undefined || coll === null)
            return false;
        else return true;
    };

    //mobile app
    this.getSelRef = function () {
        $(`.import_data_objects`).find(`input[name="importcheckbox"]`).each(function (i, o) {
            if ($(o).is(":checked")) {
                let ref = $(o).attr("refid");
                let name = $(o).attr("display-name");
                if (!this.refExist(ref)) {
                    let di = { TableName: "", RefId: ref, DisplayName: name };
                    this.AppSettings.DataImport.push(di);
                    this.addRef(di);
                }
            }
        }.bind(this));
        $("#import_data_mdl").modal("toggle");
    };

    //mobile app
    this.addRef = function (o) {
        $("#import_reftable_body .empty_tr").hide();
        $("#import_reftable_body").append(`<tr>
                                    <td><input type="text" class="import_reftable_input" value="${o.TableName}" name="${o.RefId}_input"/></td>
                                    <td>${o.DisplayName}</td>
                                    <td class="text-center"><button class="rm_refbtn" ref="${o.RefId}"><i class="fa fa-close"></i></button></td>
                                </tr>`);
    };

    //mobile app
    this.removeImportRef = function (evt) {
        let div = $(evt.target).closest("button");
        let refid = div.attr("ref");
        for (let i = 0; i < this.AppSettings.DataImport.length; i++) {
            if (this.AppSettings.DataImport[i].RefId === refid) {
                this.AppSettings.DataImport.splice(i, 1);
            }
        }
        div.closest("tr").remove();
        $(`input[refid="${refid}"]`).prop("checked", false);
    };

    //common
    this.updateAppsettings = function () {
        $.ajax({
            url: "../Dev/UpdateAppSettingsMob",
            type: 'POST',
            beforeSend: function () { $("#eb_common_loader").EbLoader("show"); },
            data: {
                "settings": JSON.stringify(this.AppSettings),
                "appid": this.AppId,
                "type": this.AppType
            },
            success: function (result) {
                $("#eb_common_loader").EbLoader("hide");
                EbMessage("show", { Message: result.message });
            }.bind(this),
            error: function () {
                $("#eb_common_loader").EbLoader("hide");
            }
        });
    };

    //mobile app
    this.setRef = function () {
        for (let i = 0; i < this.AppSettings.DataImport.length; i++) {
            $(`input[refid="${this.AppSettings.DataImport[i].RefId}"]`).prop("checked", true);
        }
    };

    ////mobile app
    this.saveAppSettings = function () {
        for (let i = 0; i < this.AppSettings.DataImport.length; i++) {
            this.AppSettings.DataImport[i].TableName = $(`input[name="${this.AppSettings.DataImport[i].RefId}_input"]`).val();
        }
        this.updateAppsettings();
    };

    this.start_exe = function () {
        $(".appdash_obj_container").off("keyup").on("keyup", "#obj_search_input", this.searchObjects.bind(this));
        $("#ExportBtn").off("click").on("click", this.export.bind(this));
        $(".sidebar-objtypes-listitem").off("click").on("click", this.expand.bind(this));

        if (this.AppType === 2) {
            this.setUpImport4Mob();
            $("#mobile-preloadmenu_mdl .import_obj_expand_objlinks").on("click", this.menuApiOnSelect.bind(this));
            $("#save-appsettings-btn").on("click", this.saveAppSettings.bind(this));
            $("#mobile-preloadmenu_mdl #menu-api-reset").on("click", this.resetMenuApi.bind(this));
        }
    };

    //for bot
    this.botConfigFn = function (grdnttest) {
        let grdValue = 'linear-gradient(10deg,rgba(27,192,27,0.54),rgba(2,13,8,0.23))';
        let fnthtml = "";
        let cssobj = this.AppSettings.CssContent;
        $('#useEbtag').attr('checked', this.AppSettings.BotProp.EbTag);
        $('#headerIcon').attr('checked', this.AppSettings.BotProp.HeaderIcon);
        $('#headerSubtxt').attr('checked', this.AppSettings.BotProp.HeaderSubtxt);
        $('#email_anony').attr('checked', this.AppSettings.Authoptions.EmailAuth);
        $('#name_anony').attr('checked', this.AppSettings.Authoptions.UserName);
        $('#phone_anony').attr('checked', this.AppSettings.Authoptions.PhoneAuth);
        $('#fb_anony').attr('checked', this.AppSettings.Authoptions.Fblogin);
        $('#fbAppidtxt').val(this.AppSettings.Authoptions.FbAppID);
        $('#fbAppversn').val(this.AppSettings.Authoptions.FbAppVer);
        $('#ebfont_size').val(this.AppSettings.BotProp.AppFontSize);

        if (this.AppSettings.BotProp.Bg_value) {
            if (this.AppSettings.BotProp.Bg_type === 'bg_grdnt') {
                $("#rdo_bg_grdnt").prop("checked", true);
                var patt = new RegExp("#");
                if (patt.test(this.AppSettings.BotProp.Bg_value)) {
                    GradientColorPicker({ Id: "grdnt_txt", Value: grdValue });
                }
                else {
                    GradientColorPicker({ Id: "grdnt_txt", Value: this.AppSettings.BotProp.Bg_value });
                }
                $('#bot_bg_grdnt').val(`${this.AppSettings.BotProp.Bg_value}`);
                $('#bg_grdnt').show();
            }
            else {
                GradientColorPicker({ Id: "grdnt_txt", Value: grdValue });
                if (this.AppSettings.BotProp.Bg_type === 'bg_clr') {
                    $("#rdo_bg_clr").prop("checked", true);
                    $('#bot_bg_clr').val(`${this.AppSettings.BotProp.Bg_value}`);
                    $('#bg_clr').show();
                }
                else if (this.AppSettings.BotProp.Bg_type === 'bg_img') {
                    $("#rdo_bg_img").prop("checked", true);
                    $('#bgImgPreview').attr('src', `/images/${this.AppSettings.BotProp.Bg_value}.jpg`);
                    $('#bgImgPreview').attr('imgrefid', `${this.AppSettings.BotProp.Bg_value}`);
                    $("#imgPrvwCont").show();
                    $('#bg_img').show();
                }
            }
        }
        else {
            $("#rdo_bg_clr").prop("checked", true);
            $('#bg_clr').show();
        }
        if (this.EbFontLst.length > 0) {
            for (let i = 0; i < this.EbFontLst.length; i++) {
                if (this.AppSettings.BotProp.AppFont === this.EbFontLst[i].CSSFontName) {
                    $('#ebfont_lst :selected').removeAttr('selected');
                    fnthtml += `<option selected="selected" value="${this.EbFontLst[i].CSSFontName}">${this.EbFontLst[i].SystemFontName}</option>`;
                }
                else {
                    fnthtml += `<option value="${this.EbFontLst[i].CSSFontName}">${this.EbFontLst[i].SystemFontName}</option>`;
                }

            }
            $('#ebfont_lst').append(fnthtml);
        }

        if (this.AppSettings.UserType_Internal === false) {
            $('#internalLoginCont').hide();
            $('#anonymousLoginCont').show();
            $('#internalUsers').prop('checked', false);
            $('#publicUsers').prop('checked', true);           
        }
        else if (this.AppSettings.UserType_Internal === true) {
            $('#anonymousLoginCont').hide();
            $('#internalLoginCont').show();
            $('#publicUsers').prop('checked', false);
            $('#internalUsers').prop('checked', true);
        }
        if (this.AppSettings.Authoptions.Password_based) {
            $('#otp_based').prop('checked', false);
            $('#pswrd_based').prop('checked', true);
        }
        else
            if (this.AppSettings.Authoptions.OTP_based) {
            $('#pswrd_based').prop('checked', false);
            $('#otp_based').prop('checked', true);           
        }
        for (let property in cssobj) {

            let html = "";
            //for (let key in cssobj[property]) {
            //    html += `<label obname='${key}'>${key}</label>
            //       <input type='text' obname=${key} value='${cssobj[property][key]}' ><br><br>`;
            //}
            //$(`#configcssTabContent #${property}`).append(html);

            html = `<div>
                    <textarea id="${property}_txt" class="form-control csstxtarea " obname="${property}" >${cssobj[property]}</textarea> 
                    <button id='${property}_btn' type="button" obname="${property}" class="ebbtn eb_btn-xs eb_btnblue   resetcss">Reset</button>
                    </div>`;
            $(`#configcssTabContent #${property}`).append(html);
        }
    };

    this.UpdateBotSettingsFn = function () {
        var appSettings = {};
        let cssConstObj = {};
        let authOptions = {};
        let botProperties = {};
        let loginCnt = 0;
        let bgtyp = '';
        let authcheck = $("input[name=authtype]:checked").length;
        if (!authcheck) {
            EbMessage("show", { Background: "red", Message: "Atleast one authentication method must be selected" });
            return;
        }
        if ($('#fb_anony').is(":checked")) {
            if ($('#fbAppidtxt').val().trim() === "") {
                EbMessage("show", { Background: "red", Message: "Please provide facebook app ID" });
                $('#fbAppidtxt').focus();
                return;
            }
            if ($('#fbAppversn').val().trim() === "") {
                EbMessage("show", { Background: "red", Message: "Please provide facebook app ID" });
                $('#fbAppversn').focus();
                return;
            }
        }
        authOptions.UserName = $('#name_anony').is(":checked");
        authOptions.EmailAuth = $('#email_anony').is(":checked");
        authOptions.PhoneAuth = $('#phone_anony').is(":checked");
        authOptions.Fblogin = $('#fb_anony').is(":checked");
        if (authOptions.PhoneAuth || authOptions.EmailAuth) loginCnt += 1;
        if (authOptions.Fblogin) loginCnt += 1;
        authOptions.FbAppID = $('#fbAppidtxt').val().trim();
        authOptions.FbAppVer = $('#fbAppversn').val().trim();
        authOptions.LoginOpnCount = loginCnt;
       
        authOptions.OTP_based = $('#otp_based').is(":checked");
        authOptions.Password_based = $('#pswrd_based').is(":checked");

        botProperties.EbTag = $('#useEbtag').is(":checked");
        botProperties.HeaderIcon = $('#headerIcon').is(":checked");
        botProperties.HeaderSubtxt = $('#headerSubtxt').is(":checked");
        botProperties.AppFontSize = $('#ebfont_size').val();
        botProperties.AppFont = $('#ebfont_lst :selected').val();
        bgtyp = $('input[name="bgradio"]:checked').val();
        botProperties.Bg_type = bgtyp;
        if (bgtyp === 'bg_clr') {
            botProperties.Bg_value = $('#bot_bg_clr').val();
        }
        else if (bgtyp === 'bg_grdnt') {
            botProperties.Bg_value = $('#bot_bg_grdnt').val();
        } else if (bgtyp === 'bg_img') {
            botProperties.Bg_value = $('#bgImgPreview').attr('imgrefid');
        }

        let cssobj = this.AppSettings.CssContent;
        for (let property in cssobj) {
            //let tempobj = {};
            //for (let key in cssobj[property]) {
            //    let cssobjVal = $(`#configcssTabContent #${property} input[obname=${key}]`).val();
            //    tempobj[key] = cssobjVal;
            //}
            //cssConstObj[property] = tempobj;

            let cssobjVal = $(`#configcssTabContent #${property} textarea[obname=${property}]`).val();
            cssConstObj[property] = cssobjVal;
        }
        appSettings["Name"] = this.AppInfo.Name;
        appSettings["Description"] = this.AppInfo.Description;
        appSettings["WelcomeMessage"] = $("#bot_wc_msg").val();
        appSettings["ThemeColor"] = $("#bot_tm_color").val();
        appSettings["DpUrl"] = $("#bot_dp_url").val();
        appSettings["CssContent"] = cssConstObj;
        appSettings["Authoptions"] = authOptions;
        appSettings["BotProp"] = botProperties;
        let radio_id = $("input[type='radio'][name='userAuthType']:checked").attr('id');
        if (radio_id === 'publicUsers') {
            appSettings["UserType_Internal"] = false;
        }
        else if (radio_id === 'internalUsers') {
             appSettings["UserType_Internal"] = true;
        }
       
        $("#eb_common_loader").EbLoader("show");
        $.ajax({
            type: "POST",
            url: "../Dev/UpdateAppSettings",
            data: { id: this.AppId, type: this.AppType, settings: JSON.stringify(appSettings) },
            success: function (data) {
                $("#eb_common_loader").EbLoader("hide");
                if (data > 0)
                    EbMessage("show", { Message: "Settings Updated Successfully" });
                else
                    EbMessage("show", { Background: "red", Message: "Something went wrong" });
            }
        });
    };

    this.authMethodCheckFn = function () {
        let authcheck = $("input[name=authtype]:checked").length;
        if (!authcheck) {
            EbMessage("show", { Background: "red", Message: "Atleast one authentication method must be selected" });
        }
        if ($('#fb_anony').is(":checked")) {
            if ($('#fbAppidtxt').val().trim() === "") {

                // $('#fbAppidtxt').addClass('txthighlightred');
                $('#fbAppidtxt').focus();
                return;
            }
            if ($('#fbAppversn').val().trim() === "") {
                $('#fbAppversn').focus();
                return;
            }
        }
    };

    this.userAuthTypeFn = function () {
        var radio_id = $("input[type='radio'][name='userAuthType']:checked").attr('id');
        if (radio_id === 'publicUsers') {
            $('#internalLoginCont').hide();
            $('#anonymousLoginCont').show();
        }
        else if (radio_id === 'internalUsers') {
            $('#anonymousLoginCont').hide();
            $('#internalLoginCont').show();
        }
    }

    this.ResetCssFn = function (e) {
        let cssConst = $(e.target).attr('obname');
        $.ajax({
            type: "POST",
            url: "../Dev/ResetCssContent",
            data: { cssConst: cssConst },
            success: function (data) {
                $('#' + cssConst + '_txt').val('');
                $('#' + cssConst + '_txt').val(data);
            }
        });
    };

    this.BgImageUpload = function () {

        var bgimg = new EbFileUpload({
            Type: "image",
            Toggle: "#bgimg_btn",
            TenantId: "ViewBagcid",
            SolutionId: this.Sid,
            Container: "onboarding_logo",
            MaxSize: 1,
            Multiple: false,
            ServerEventUrl: 'https://se.eb-test.xyz',
            EnableTag: false,
            //EnableCrop: true,
            ResizeViewPort: false //if single and crop
        });

        bgimg.uploadSuccess = function (fileid) {
            $('#bot_bg_url').val(`${this.Files[0].name}`);
            if (this.Files[0] && this.Files[0]) {
                var reader = new FileReader();

                reader.onload = function (e) {
                    $('#bgImgPreview').attr('src', e.target.result);
                    $('#bgImgPreview').attr('imgrefid', fileid);
                };
                reader.readAsDataURL(this.Files[0]); // convert to base64 string
            }
            $("#imgPrvwCont").show();
            //  $('#bgImgPreview').attr('src', URL.createObjectURL(`${this.Files[0]}`));
            //const img = document.createElement("img");
            //img.src = URL.createObjectURL(this.files[i]);
            //img.height = 60;
        };
    };

    $("input[name='bgradio']").click(function () {
        var bg = $(this).val();

        $("div.bg_cont").hide();
        $("#" + bg).show();
    });

    this.gradientValueChangeFn = function () {
        $('#bot_bg_grdnt').val($('#grdnt_txt_val').val());
        $('#grdntgenerator').modal('hide');
    };

    this.start_exe();
    this.init();
};