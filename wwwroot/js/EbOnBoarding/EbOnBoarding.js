var EbOnBoarding = function (context) {
    var _prevId = "#profimage";
    var _tid = "";
    var _context = context;
    this.getSolutionName = function (e) {
        $('#Hidd-sname').val($(e.target).val());
        $("#solutionName-app").text($(e.target).val());
    };
    this.getClientId = function (e) {
        $('#Hidd-esid').text($(e.target).val());
    };
    this.getDesc = function (e) {
        $('#description').text($(e.target).val());
    };

    this.LogoImageUpload = function () {
        var logoCrp = new cropfy({
            Container: 'onboarding_logo',
            Toggle: '#log-upload-btn',
            isUpload: true,  //upload to cloud
            enableSE: true, //enable server event
            Browse: true,  //browse image
            Result: 'base64',
            Type: 'logo',
            Tid: _tid, //if type is logo
            Preview: "#oB_logo-prev"
        });
        logoCrp.getFile = function (file) {

        }.bind(this);
    };

    this.validateProfileInfo = function () {
        if ($("[name='Name']").val() !== "" && $("[name='Company']").val() !== "" && $("[name='Password']").val() !== "")
            return true;
        else
            return false;
    };

    this.submitProfile = function (e) {
        e.preventDefault();
        var info = this.validateProfileInfo();
        if (info) {
            $.ajax({
                type: 'POST',
                url: "../Ext/ProfileSetup",
                beforeSend: function () {
                    $("#loader_profile").EbLoader("show");
                },
                data: $(e.target).serializeArray()
            }).done(function (data) {
                $("#loader_profile").EbLoader("hide");
                EbMessage("show", { Message: "Profile Saved" });
                $("#save-profile").hide();
                $("#prof-info-skip, #basic-info, #product-info").show();
                this.scrollProfToLeft();
            }.bind(this));
        }
    };

    this.scrollProfToLeft = function () {
        $('.card').animate({
            scrollLeft: $("#prof-info").width() + 150
        }, 500);
    };

    this.submitSolutionInfo = function (e) {
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url: "../Tenant/EbCreateSolution",
            beforeSend: function () {
                $("#loader_product-info").EbLoader("show");
            },
            data: {
                Sname: $("[name='Sname']").val().trim(),
                SolnId: $("[name='SolnId']").val().toLowerCase().trim(),
                Desc: $("[name='Desc']").val().trim()
            }
        }).done(function (data) {
            $("#loader_product-info").EbLoader("hide");
            if (_context) {
                window.location.replace("/MySolutions");
            }
            else {
                EbMessage("show", { Message: "Solution Created" });
                $("#app-info").show();
                $("#save-subscrip").hide();
                $("#app-next").show();
                this.scrollToLast();
            }
        }.bind(this));
    };

    this.scrollToProfSec = function () {
        $('.card').animate({
            scrollLeft: 0
        }, 500);
    };
    this.scrollToLast = function () {
        $('.card').animate({
            scrollLeft: 3000
        }, 500);
    };

    this.whichAppType = function (e) {
        var ob = $(e.target).closest(".apps-wrapper-fchiled");
        ob.addClass("appselected");
        $.each(ob.parent().siblings(), function (i, obj) {
            $(obj).children(".apps-wrapper-fchiled").removeClass("appselected");
        }.bind(this))
        $("[name='AppType']").val(parseInt(ob.attr("type")));
    };
    this.showLoaderOnAppSub = function (e) {
        $("#loader_app_info").EbLoader("show");
    };

    this.init = function () {
        this.LogoImageUpload();
        $('#solutionname').on("change", this.getSolutionName.bind(this));
        $('#cid').on("change", this.getClientId.bind(this));
        $("#Desc").on("change", this.getDesc.bind(this));
        $("#prof-submit").on("submit", this.submitProfile.bind(this));
        $("#sol-form-submit").on("submit", this.submitSolutionInfo.bind(this));
        $("#prof-info-skip,#prod-prev").on('click', this.scrollProfToLeft.bind(this));
        $("#prof-to-prev").on('click', this.scrollToProfSec.bind(this));
        $("#app-next").on('click', this.scrollToLast.bind(this));
        $(".apps-wrapper-fchiled").on("focus", this.whichAppType.bind(this));
        $("#app-form").on("submit", this.showLoaderOnAppSub.bind(this));
        $("#ebsid").on("change", function (e) { $("#sid_on_appcreation").val($(e.target).val()); });
    };

    this.init();
};