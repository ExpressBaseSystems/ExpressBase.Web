var EbOnBoarding = function () {
    this.objSubscription = {};
    var _prevId = "#profimage";

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

    this.subscribeProd = function (e) {
        var selector = $(e.target).closest(".eb_prd_link");
        selector.toggleClass('subscribed');
        if (selector.hasClass('subscribed')) {
            //$('#is-edit-clientid').show();
            selector.children(".overlay_mark").show();
            this.objSubscription[selector.attr("prod-id")] = 0;
        }
        else {
            selector.children(".overlay_mark").hide();
            delete this.objSubscription[selector.attr("prod-id")];
        }
    };

    this.LogoImageUpload = function () {
        var logoCrp = new cropfy({
            Container: 'onboarding_logo',
            Toggle: '#log-upload-btn',
            isUpload: true,
            enableSE: true,
            Browse: true,
            Result: 'base64',
            Type: 'logo',
            ResizeViewPort: true,
            Preview:"#oB_logo-prev"
        });
        logoCrp.getFile = function (file) {

        }.bind(this);
    };

    this.ValidateForm = function () {
        var isvalid = false;
        if ($('#solutionname').val() !== '') {
            $('.Eb-product-container').each(function (i, obj) {
                if ($(obj).children().find('.btn-upload').hasClass('subscribed')) {
                    isvalid = true;
                    return false;
                }
            });
            if (!isvalid)
                alert('select atleast one prooduct');
        }
        else
            alert('solution canot be empty');
        return isvalid;
    }

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
                $('#eb-mesageBox').show().text("Profile Saved");
                $('#eb-mesageBox').fadeOut(5000);
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
        if (!$.isEmptyObject(this.objSubscription)) {
            $.ajax({
                type: 'POST',
                url: "../Tenant/EbCreateSolution",
                beforeSend: function () {
                    $("#loader_product-info").EbLoader("show");
                },
                data: {
                    Sname: $("[name='Sname']").val().trim(),
                    Esid: $("[name='Esid']").val().toLowerCase().trim(),
                    Desc: $("[name='Desc']").val().trim(),
                    Isid: $("[name='Isid']").val().toLowerCase().trim(),
                    Subscription: JSON.stringify(this.objSubscription),
                    ProfileInfo: $("[name='ProfileInfo']").val()
                }
            }).done(function (data) {
                $("#loader_product-info").EbLoader("hide");
                $('#eb-mesageBox').show().text("Solution Created");
                $('#eb-mesageBox').fadeOut(5000);
                $("#app-info").show();
                $("#save-subscrip").hide();
                $("#app-next").show();
                this.scrollToLast();
            }.bind(this));
        }
        else
            $('#eb-mesageBox-error').show().text("select atleast one Product.");
        $('#eb-mesageBox-error').fadeOut(5000);

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
    this.scrollToProd = function () {
        $('.card').animate({
            scrollLeft: 1900
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
        $('.eb_prd_link').on('click', this.subscribeProd.bind(this));
        $("#prof-submit").on("submit", this.submitProfile.bind(this));
        $("#sol-form-submit").on("submit", this.submitSolutionInfo.bind(this));       
        $("#prof-info-skip,#plan-prev").on('click', this.scrollProfToLeft.bind(this));
        $("#prof-to-prev").on('click', this.scrollToProfSec.bind(this));
        $("#s-info-skip").on('click', this.scrollToProd.bind(this));
        $("#app-next").on('click', this.scrollToLast.bind(this));
        $("#prod-prev").on('click', this.scrollToProd.bind(this));
        $(".apps-wrapper-fchiled").on("focus", this.whichAppType.bind(this));
        $("#app-form").on("submit", this.showLoaderOnAppSub.bind(this));
    };

    this.init();
};