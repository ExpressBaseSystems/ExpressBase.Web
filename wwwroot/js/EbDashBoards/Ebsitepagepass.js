

//*************************************************** 

//password field validation for forgot password and signup page

//**************************************************


var PasswordValidation = function (RecaptchaCallbackreset) {
    this.initial = function () {
        $("#psdinfo1").on("mouseover", this.Psdinfofn.bind(this));
        $("#psdinfo1").on("mouseout", this.hidePasswordInfo.bind(this));
        $("#inputPassword").on("keyup", this.password_auto_validation.bind(this));
        $("#inputPassword").on('bind', this.cutcopypaste.bind(this));
        $("#inputPassword").on('focusout', this.hidePasswordInfo1.bind(this))
        $("#inputPassword").on('focus', this.Psdinfofn.bind(this))
        $("#inputPasswordConfirm").on("keyup", this.repeatpasswordcheck.bind(this));
        $(".toggle-password").on("click", this.Showpsdfn.bind(this));
        $("#btnpswreset").on("click", this.Pswresetfn.bind(this));
        
    }



    this.Psdinfofn = function () {
        $("#rcorners1").css("display", "block");

    }

    this.hidePasswordInfo = function () {
        $("#rcorners1").css("display", "none");
    }

    this.hidePasswordInfo1 = function () {
        $("#rcorners1").css("display", "none");
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
            $("#passlbl").css({ 'color': '#a94442' });
            $("#psdinfo1").css({ 'color': '#a94442' });
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
                $("#passlbl").css({ 'color': '#a94442' });
                $("#psdinfo1").css({ 'color': '#a94442' });
                $('#psdinfo1').removeClass('fa fa-check').addClass('fa fa-info-circle');
                $("#inputPassword").focus();
                $('#inputPassword').removeClass('txthighlight').addClass('txthighlightred');
                st = false;
            }
        }
        $("#rcorners1").css("display", "block");
        if (st == true) {
            $("#rcorners1").css("display", "none");
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
        grecaptcha.execute();
        // grecaptcha.reset();

    }

    this.SavePasword = function (token) {

        let sts = this.password_auto_validation();
        psdcode = $("#elink").val();
        if (sts == true) {
            {
                grecaptcha.execute();
                $.ajax({
                    url: "../Ext/ResetPasswordAsync",
                    beforeSend: function () {
                        $("#loaderdiv").EbLoader("show");
                        $("#btnpswreset").prop('disabled', true);
                    },
                    data: {
                        emcde: psdcode,
                        token: token,
                        psw: $("#inputPassword").val(),
                    },
                    cache: false,
                    type: "POST",
                    success: function (status) {
                        $("#loaderdiv").EbLoader("hide");
                        if (status == 1) {
                            EbMessage("show", { Message: "Please Login using New password" });
                            setTimeout(function () {
                                location.href = "../Ext/TenantSignin";
                            }, 4000);

                        }
                        if (status == 0) {
                            $('#btnpswreset').prop('disabled', false);
                            location.href = "../StatusCode/401";
                        }
                    }
                });
            }
        }
    };


    this.initial();
};

