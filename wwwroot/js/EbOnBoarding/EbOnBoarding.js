var EbOnBoarding = function () {
    this.objSubscription = {};

    this.getSolutionName = function (e) {
        $('#Hidd-sname').val($(e.target).val());
    };
    this.getClientId = function (e) {
        $('#Hidd-esid').text($(e.target).val());
    };
    this.getDesc = function (e) {
        $('#description').text($(e.target).val());
    };

    this.subscribeProd = function (e) {
        var selector = $(e.target).closest("button");
        selector.toggleClass('subscribed');
        if (selector.hasClass('subscribed')) {
            //$('#is-edit-clientid').show();
            selector.text(' ').css({
                "background": "#69ea69",
                "border": "none"
            }).append('<i class="fa fa-check" aria-hidden="true" style="color:white;"></i>');
            this.objSubscription[selector.parent().attr("prod-id")] = 0;
        }
        else {
            selector.children('i').remove();
            selector.text('Add');
            selector.css({ "background": "white", "border": "1px solid #e1e0e0" });
            delete this.objSubscription[selector.parent().attr("prod-id")];
        }
    };

    this.ProfileImgUpload = function () {
        var upload = new EbImageCropper({
            preview: 'profimage',
            cropperContainer: 'cropsection'
        });
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
    this.submitProfile = function (e) {
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url: "../Tenant/ProfileSetup",
            data: {
                Name: $("[name='Name']").val().trim(),
                Company: $("[name='Company']").val().trim(),
                Employees: $("[name='Employees']").val().trim(),
                Designation: $("[name='Designation']").val().trim(),
                Country: $("[name='Country']").val().trim(),
                Email: $("[name='Email']").val().trim(),
                Password: $("[name='Password']").val().trim()
            }
        }).done(function (data) {
            $("#save-profile").hide();
            $("#prof-info-skip, #basic-info, #product-info").show();
            this.scrollProfToLeft();
        }.bind(this));
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
                url: "../Tenant/EbOnBoarding",
                data: {
                    Sname: $("[name='Sname']").val().trim(),
                    Esid: $("[name='Esid']").val().trim(),
                    Desc: $("[name='Desc']").val().trim(),
                    Isid: $("[name='Isid']").val().trim(),
                    Subscription: JSON.stringify(this.objSubscription)
                }
            }).done(function (data) {
                alert();
            })
        }
        else
            alert("select atleast one product");
    };

    this.scrollToProfSec = function () {
        $('.card').animate({
            scrollLeft: 0
        }, 500);
    };
    this.scrollToProd = function () {
        $('.card').animate({
            scrollLeft: 2000
        }, 500);
    };

    this.init = function () {
        this.upload = new EbImageCropper({
            preview: 's-logo-prev',
            cropperContainer: 'eb-cropie-inner'
        });
        $('#solutionname').on("change", this.getSolutionName.bind(this));
        $('#cid').on("change", this.getClientId.bind(this));
        $("#Desc").on("change", this.getDesc.bind(this));
        $('.btn-upload').on('click', this.subscribeProd.bind(this));
        $("#prof-submit").on("submit", this.submitProfile.bind(this));
        $("#sol-form-submit").on("submit", this.submitSolutionInfo.bind(this));
        this.ProfileImgUpload();
        $("#prof-info-skip").on('click', this.scrollProfToLeft.bind(this));
        $("#prof-to-prev").on('click', this.scrollToProfSec.bind(this));
        $("#s-info-skip").on('click', this.scrollToProd.bind(this));
    };

    this.init();
};