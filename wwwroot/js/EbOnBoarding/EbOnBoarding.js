
//js file for EbOnBoarding.cshtml ,Resetpassword.cshtml
//has 2 main function EbOnboarding for...................   and PasswordValidation

var EbOnBoarding = function (context) {

    this.solinfo = {};
    this.seldeploy;
    this.ajaxTime;

    let _prevId = "#profimage";
    let _tid = "";
    let _context = context;
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
        let d = new EbFileUpload({
            Type: "image",
            Toggle: "#log-upload-btn",
            TenantId: "@ViewBag.cid",
            SolutionId: "@ViewBag.SolnId",
            Container: "onboarding_logo",
            Multiple: false,
            ServerEventUrl: 'https://se.eb-test.xyz',
            EnableTag: false,
            EnableCrop: true,
            Context: "logo",//if single and crop
            ResizeViewPort: false //if single and crop
        });

        d.uploadSuccess = function (fileid) {
            EbMessage("show", { Message: "Upload done" });
        }
        d.windowClose = function () {
            //EbMessage("show", { Message: "window closed", Background: "red" });
        }
    };

    //this.validateProfileInfo = function () {
    //    if ($("[name='Name']").val() !== "" && $("[name='Company']").val() !== "" && $("[name='Password']").val() !== "")
    //        return true;
    //    else
    //        return false;
    //};

    this.submitProfile = function (e) {
        e.preventDefault();
        let info = this.validate();

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
                $("#basic-info").show();
                $("#prof-info").hide();
                $("#product-info").hide();
                this.scrollProfToLeft();
            }.bind(this));
        }
    };

    this.scrollProfToLeft = function () {
        $('.card').animate({
            scrollLeft: $("#prof-info").width() + 150
        }, 500);
    };

    //this.submitSolutionInfo = function (e) {
    // e.preventDefault();
    //let tem = 1;
    //if ($("#ebsid").val() === "") {
    //    $("#slnid").css("visibility", "visible");
    //    tem = 0;
    //}
    //else {
    //    $("#slnid").css("visibility", "hidden");
    //}
    //if ($("#solutionname").val() === "") {
    //    $("#slnnam").css("visibility", "visible");
    //    tem = 0;
    //}
    //else {
    //    $("#slnnam").css("visibility", "hidden");
    //}
    ////if ($("#Desc").val() === "") {
    ////    $("#descrip").css("visibility", "visible");
    ////    tem = 0;
    ////}
    ////else {
    ////    $("#descrip").css("visibility", "hidden");
    ////    tem = 1;

    ////}
    //if (tem === 1) {
    //    $.ajax({
    //        type: 'POST',
    //        url: "../Tenant/EbCreateSolution",
    //        beforeSend: function () {
    //            $("#loader_product-info").EbLoader("show");
    //        },
    //        data: {
    //            Sname: $("[name='Sname']").val().trim(),
    //            SolnId: $("[name='SolnId']").val().toLowerCase().trim(),
    //            Desc: $("[name='Desc']").val().trim()
    //        }
    //    }).done(function (data) {
    //        $("#loader_product-info").EbLoader("hide");
    //        if (_context) {
    //            window.location.replace("/MySolutions");
    //        }
    //        else {
    //            EbMessage("show", { Message: "Solution Created" });
    //            //$("#app-info").show();
    //            $("#save-subscrip").hide();
    //            //$("#app-next").show();
    //            //this.scrollToLast();
    //        }
    //        }.bind(this));
    //    }

    //};

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
        let ob = $(e.target).closest(".apps-wrapper-fchiled");
        ob.addClass("appselected");
        $.each(ob.parent().siblings(), function (i, obj) {
            $(obj).children(".apps-wrapper-fchiled").removeClass("appselected");
        }.bind(this))
        $("[name='AppType']").val(parseInt(ob.attr("type")));
    };
    this.showLoaderOnAppSub = function (e) {
        $("#loader_app_info").EbLoader("show");
    };



    this.validate = function () {
        let sts = true
        let pass = $('#inputPassword').val();
        let confpass = $('#inputPasswordConfirm').val();
        if (pass != confpass) {
            $("#repeat_passwordlbl").css("visibility", "visible");
            $("#inputPasswordConfirm").focus();
            $('#inputPasswordConfirm').removeClass('txthighlight').addClass('txthighlightred');
            sts = false;
        }
        else {
            $("#repeat_passwordlbl").css("visibility", "hidden");
        }
        let strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
        if (pass.length >= 8 && strongRegex.test(pass)) {
            $('#passlbl').text("Strong password");
            $("#passlbl").css({ 'color': 'green' });
            $("#passlbl").focusout();
        } else {
            $('#passlbl').text("Enter strong password");
            $("#passlbl").css({ 'color': 'red' });
            $("#inputPassword").focus();
            $('#inputPassword').removeClass('txthighlight').addClass('txthighlightred');
            sts = false;
        }
        let com = $("#company").val();
        if (com.length == 0) {
            $("#companylbl").css("visibility", "visible");
            $("#company").focus();
            $('#company').removeClass('txthighlight').addClass('txthighlightred');
            sts = false;
        }
        else {
            $("#companylbl").css("visibility", "hidden");
        }
        let name = $("#name").val();
        if (name.length == 0) {
            $("#namelbl").css("visibility", "visible");
            $("#namelbl").show();
            $("#name").focus();
            $('#name').removeClass('txthighlight').addClass('txthighlightred');
            sts = false;
        }
        else {
            $("#namelbl").css("visibility", "hidden");
        }

        return sts;
    }

    this.Solutionobjfn = function (e) {
        e.preventDefault();
        let tem = 1;
        if ($("#solutionname").val() === "") {
            $("#slnnam").css("visibility", "visible");
            tem = 0;
            $("#solutionname").focus();
            $('#solutionname').removeClass('txthighlight').addClass('txthighlightred');
        }
        else {
            $("#slnnam").css("visibility", "hidden");
            $('#solutionname').removeClass('txthighlightred').addClass('txthighlight');
        }
        if ($("#ebsid").val() === "") {
            $("#slnid").css("visibility", "visible");
            $("#ebsid").focus();
            $('#ebsid').removeClass('txthighlight').addClass('txthighlightred');
            tem = 0;
        }
        else {
            $("#slnid").css("visibility", "hidden");
            $('#ebsid').removeClass('txthighlightred').addClass('txthighlight');
        }

        if (tem === 1) {
            this.solinfo.solurl = $("#ebsid").val().trim();
            this.solinfo.solname = $("#solutionname").val().trim();
            this.solinfo.soldesc = $("#Desc").val().trim();
            $("#basic-info").hide();
            $("#app-info").show();
            EbMessage("show", { Message: "Saved" });
            $("#save-subscrip").hide();

            this.scrollToLast();
        }

    }

    this.Savesolutionfn = function (e) {
        e.preventDefault();
        $("#txtsol").empty();
        $("#txtdb").empty();
        let st = 0;
        this.solinfo.isdeploy = $('input[name=selector]:checked').val();
        $("#txtsol").append("Creating Solution...");
        if (this.solinfo.isdeploy == "true") {
            st = 1;
        }
        //$("#txtsol").css("visibility", "visible");
        //$("#txtdb").css("visibility", "visible");

        $.ajax({
            type: 'POST',
            url: "../Tenant/EbCreateSolution",
            beforeSend: function () {
                $("#loader_product-info").EbLoader("show");
                this.ajaxTime = new Date().getTime();
            }.bind(this),
            data: {
                Sname: this.solinfo.solname,
                SolnId: this.solinfo.solurl.toLowerCase(),
                Desc: this.solinfo.soldesc,
                DeployDB: this.solinfo.isdeploy
            },
            success: function (res) {
                let totalTime = (new Date().getTime() - this.ajaxTime) / 1000;
                let tm = 4 - totalTime;

                if (res.errSolMessage != null) {
                    $("#txtsol").empty();
                    //$("#txtsol").fadeOut();
                    $("#txtsol").append(res.errSolMessage);
                    EbMessage("show", { Message: res.errSolMessage, Background: "red" });
                }
                if (st == 1) {
                    if (tm > 0) {
                        setTimeout(function () {
                            $("#txtdb").append("Deploying DataBase...")
                        }, 2000);
                    }
                    else {
                        $("#txtdb").append("Deploying DataBase...")
                    }
                }

                if (res.errDbMessage != null) {
                    $("#txtdb").empty();
                    $("#txtdb").append(res.errDbMessage);
                    EbMessage("show", { Message: res.errDbMessage, Background: "red" });
                }

                if (res.status != null) {
                    $("#loader_product-info").EbLoader("hide");
                    if (_context) {
                        setTimeout(function () {
                            window.location.replace("/MySolutions");
                            $("#btn1").click();
                        }, 4000);
                    }
                    else {
                        setTimeout(function () {
                            $("#btn1").click();
                            EbMessage("show", { Message: "Solution Created" });
                        }, 4000);


                    }
                }

            }.bind(this)
        })
    }


    this.selradiosecfn = function (e) {
        //let k = $('input[name=selector]:checked').attr("id");
        //let k = e.target.children[0].id;

        $("#rcorners1").css("visibility", "visible");
        $("#s-option").removeAttr("checked");
        $("#t-option").prop('checked', true);
    }
    this.selradiofirstfn = function () {

        $("#t-option").removeAttr("checked");
        $("#s-option").prop('checked', true);

    }



    this.namevalidate = function () {
        let name = $("#name").val();
        if (name.length == 0) {
            $("#namelbl").css("visibility", "visible");
            $("#name").focus();
        }
        else {
            $("#namelbl").css("visibility", "hidden");
            $('#name').removeClass('txthighlightred').addClass('txthighlight');
        }
    }

    this.companyvalidate = function () {
        let com = $('#company').val();
        if (com.length == 0) {
            $("#companylbl").css("visibility", "visible");
            sts = false;
            $('#company').focus();
        }
        else {
            $("#companylbl").css("visibility", "hidden");
            $('#company').removeClass('txthighlightred').addClass('txthighlight');
        }
    }

    this.solutionurlcheck = function () {
        let solutionurl = $("#ebsid").val;
        if (solutionurl.length == 0) {
            $("#slnid").css("visibility", "visible");
            $("#ebsid").focus();
        }
        else {
            $("#slnid").css("visibility", "hidden");
            $('#ebsid').removeClass('txthighlightred').addClass('txthighlight');

        }
    }

    this.solutioncheck = function () {
        let solution_name = $("#solutionname").val;
        if (solution_name.length == 0) {
            $("#slnnam").css("visibility", "visible");
            $("#solutionname").focus();
        }
        else {
            $("#slnnam").css("visibility", "hidden");
            $('#solutionname').removeClass('txthighlightred').addClass('txthighlight');
        }
    }






    this.init = function () {
        this.LogoImageUpload();
        $('#solutionname').on("change", this.getSolutionName.bind(this));
        $('#cid').on("change", this.getClientId.bind(this));
        $("#Desc").on("change", this.getDesc.bind(this));
        $("#prof-submit").on("submit", this.submitProfile.bind(this));
        //$("#sol-form-submit").on("submit", this.submitSolutionInfo.bind(this));
        $("#prof-info-skip,#prod-prev").on('click', this.scrollProfToLeft.bind(this));
        //$("#prof-to-prev").on('click', this.scrollToProfSec.bind(this));
        $("#app-next").on('click', this.scrollToLast.bind(this));
        $(".apps-wrapper-fchiled").on("focus", this.whichAppType.bind(this));
        $("#app-form").on("submit", this.showLoaderOnAppSub.bind(this));
        $("#ebsid").on("change", function (e) { $("#sid_on_appcreation").val($(e.target).val()); });
        $("#save-subscrip").on("click", this.Solutionobjfn.bind(this));
        //$("#dbdeployform").off("submit").on("submit", this.Savesolutionfn.bind(this));
        $("#save-application").off("click").on("click", this.Savesolutionfn.bind(this));
        $("#radio1").on("click", this.selradiofirstfn.bind(this));
        $("#radio2").on("click", this.selradiosecfn.bind(this));
        $("#name").on("keyup", this.namevalidate.bind(this));
        $("#company").on("keyup", this.companyvalidate.bind(this));
        $("#ebsid").on("keyup", this.solutionurlcheck.bind(this));
        $("#solutionname").on("keyup", this.solutioncheck.bind(this));

    };
    this.init();
};


var PasswordValidation = function () {
    this.initial = function () {
        $("#psdinfo1").on("mouseover", this.Psdinfofn.bind(this));
        $("#psdinfo1").on("mouseout", this.hidePasswordInfo.bind(this));
        $("#inputPassword").on("keyup", this.password_auto_validation.bind(this));
        $("#inputPassword").on('bind', this.cutcopypaste.bind(this));
        $("#inputPasswordConfirm").on("keyup", this.repeatpasswordcheck.bind(this));
        $(".toggle-password").on("click", this.Showpsdfn.bind(this));
        $("#btnpswreset").on("click", this.Pswresetfn.bind(this));
    }

    this.Psdinfofn = function () {
        $("#rcorners1").css("visibility", "visible");

    }
    this.hidePasswordInfo = function () {
        $("#rcorners1").css("visibility", "hidden");
    }
    this.repeatpasswordcheck = function () {
        let pass = $('#inputPassword').val();
        let confpass = $('#inputPasswordConfirm').val();
        if (pass != confpass) {
            $("#repeat_passwordlbl").css("visibility", "visible");
            $("#inputPasswordConfirm").focus();
            $('#inputPasswordConfirm').removeClass('txthighlight').addClass('txthighlightred');
            sts = false;
        }
        else {
            $("#repeat_passwordlbl").css("visibility", "hidden");
            $('#inputPasswordConfirm').removeClass('txthighlightred').addClass('txthighlight');
        }
    }

    this.password_auto_validation = function () {
        let st = true;
        let pass = $('#inputPassword').val();
        let number = /[0-9]/;
        let upperCase = /[A-Z]/;
        let lowerCase = /[a-z]/;
        let special_characters = /([~,!,@,#,$,%,^,&,*,-,_,+,=,?,>,<])/;

        if (pass.match(number)) {
            $('#passcheck_4').removeClass('fa fa-times').addClass('fa fa-check');
            $("#passcheck_4").css({ 'color': 'green' });
        }
        else {
            $('#passcheck_4').removeClass('fa fa-check').addClass('fa fa-times');
            $("#passcheck_4").css({ 'color': '#cf4f4f' });
            st = false;
        }

        if (pass.match(lowerCase)) {
            $('#passcheck_3').removeClass('fa fa-times').addClass('fa fa-check');
            $("#passcheck_3").css({ 'color': 'green' });
        }
        else {
            $('#passcheck_3').removeClass('fa fa-check').addClass('fa fa-times');
            $("#passcheck_3").css({ 'color': '#cf4f4f' });
            st = false;
        }
        if (pass.match(upperCase)) {
            $('#passcheck_2').removeClass('fa fa-times').addClass('fa fa-check');
            $("#passcheck_2").css({ 'color': 'green' });
        }
        else {
            $('#passcheck_2').removeClass('fa fa-check').addClass('fa fa-times');
            $("#passcheck_2").css({ 'color': '#cf4f4f' });
            st = false;
        }
        if (pass.match(special_characters)) {
            $('#passcheck_5').removeClass('fa fa-times').addClass('fa fa-check');
            $("#passcheck_5").css({ 'color': 'green' });
        }
        else {
            $('#passcheck_5').removeClass('fa fa-check').addClass('fa fa-times');
            $("#passcheck_5").css({ 'color': '#cf4f4f' });
            st = false;
        }


        if (pass.length > 7) {
            $('#passcheck_1').removeClass('fa fa-times').addClass('fa fa-check');
            $("#passcheck_1").css({ 'color': 'green' });
        }
        else {
            $('#passcheck_1').removeClass('fa fa-check').addClass('fa fa-times');
            $("#passcheck_1").css({ 'color': '#cf4f4f' });
            st = false;

        }

        if (pass.length < 8) {
            $('#passlbl').text("Enter Strong password");
            $("#passlbl").css({ 'color': 'red' });
            $("#psdinfo1").css({ 'color': '#cf4f4f' });
            $('#psdinfo1').removeClass('fa fa-check').addClass('fa fa-info-circle');
            $("#inputPassword").focus();
            $('#inputPassword').removeClass('txthighlight').addClass('txthighlightred');
            st = false;
        } else {
            if (pass.match(number) && pass.match(upperCase) && pass.match(lowerCase) && pass.match(special_characters)) {
                $("#passlbl").css({ 'color': 'green' });
                $("#psdinfo1").css({ 'color': 'green' });
                $('#psdinfo1').removeClass('fa fa-info-circle').addClass('fa fa-check');
                $('#passlbl').text("Strong password");
                $('#inputPassword').removeClass('txthighlightred').addClass('txthighlight');
            } else {
                $('#passlbl').text("Enter Strong password");
                $("#passlbl").css({ 'color': 'red' });
                $("#psdinfo1").css({ 'color': '#cf4f4f' });
                $('#psdinfo1').removeClass('fa fa-check').addClass('fa fa-info-circle');
                $("#inputPassword").focus();
                $('#inputPassword').removeClass('txthighlight').addClass('txthighlightred');
                st = false;
            }
        }

        return st;
    };

    this.cutcopypaste = function (e) {
       
        e.preventDefault();
    }
    this.Showpsdfn = function (e) {
        let x = $(e.target).siblings("input");
        if (x.attr("type") === "password") {
            x.prop("type", "text");
            $("#psvisible").hide();
            $("#pshide").show();
        } else {
            x.prop("type", "password");
            $("#psvisible").show();
            $("#pshide").hide();
        }

    }.bind(this);

    this.Pswresetfn = function () {

        let sts = this.password_auto_validation();
        psdcode = $("#elink").val();
        if (sts == true) {
            $.ajax({
                url: "../Ext/ResetPassword",
                data: { emcde: psdcode, psw: $("#inputPassword").val() },
                cache: false,
                type: "POST",
                success: function (status) {
                    if (status == 1) {
                        EbMessage("show", { Message: "Please Login using New password" });
                        setTimeout(function () {
                            location.href = "../Ext/TenantSignin";
                        }, 4000);
                       
                    }
                    if (status == 0) {
                        location.href = "../StatusCode/401";
                    }
                }
            });
        }
    }

    this.initial();
};