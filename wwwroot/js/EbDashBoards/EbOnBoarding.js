
//js file for EbOnBoarding.cshtml ,Resetpassword.cshtml
//has 2 main function EbOnboarding for...................   and PasswordValidation
var EbOnBoarding = function () {
    this.solinfo = {};
    this.seldeploy;

    this.submitProfile = function (e) {
        e.preventDefault();
        let info = this.validate();

        if (info) {
            $.ajax({
                type: 'POST',
                url: "../Ext/Board",
                beforeSend: function () {
                    $("#loaderdiv").EbLoader("show");
                    //$(".iconspin").addClass("fa fa-spinner fa-pulse")
                    $('#save-profile').prop('disabled', true).css('opacity', 0.5);
                },
                data: {
                    email: $("#email").val().trim(),
                    name: $("#name").val().trim(),
                    country: $("#country option:selected").text().trim(),
                    password: $("#inputPassword").val().trim()
                }
            }).done(function (data) {
                $("#loaderdiv").EbLoader("hide");
                if (data.id > 0) {
                    location.href = "/MySolutions";
                }
                else {
                    if (data.isEmailUniq == false) {
                        EbMessage("show", { Message: "Mail id already exists", Background: 'red' });
                        //$(".iconspin").removeClass("fa fa-spinner fa-pulse");
                        $('#save-profile').prop('disabled', false).css('opacity', 1);
                    }
                    else {
                        if (data.AccountCreated == false) {
                            EbMessage("show", { Message: "Cannot Create Account ", Background: 'red' });
                           // $(".iconspin").removeClass("fa fa-spinner fa-pulse");
                            $('#save-profile').prop('disabled', false).css('opacity', 1);
                        }
                    }
                }

            }.bind(this));
        }

    };

    this.validate = function () {
        let sts = true
        let pass = $('#inputPassword').val();


        //let confpass = $('#inputPasswordConfirm').val();
        //if (pass != confpass) {
        //    $("#repeat_passwordlbl").css("visibility", "visible");
        //    $("#inputPasswordConfirm").focus();
        //    $('#inputPasswordConfirm').removeClass('txthighlight').addClass('txthighlightred');
        //    sts = false;
        //}
        //else {
        //    $("#repeat_passwordlbl").css("visibility", "hidden");
        //}

        if ($("#country option:selected").val() == 0) {
            //  $("#countrylbl").css("visibility", "visible");
            $("#country").focus();
            $('#country').removeClass('txthighlight').addClass('txthighlightred');
            sts = false;
        }
        else {
            $('#country').removeClass('txthighlightred').addClass('txthighlight');
            //   $("#countrylbl").css("visibility", "hidden");

        }


        let com = $("#email").val();
        // var re = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if ((com.length == 0) || (re.test(com) == false)) {
            $("#emaillbl").css("visibility", "visible");
            $("#email").focus();
            $('#email').removeClass('txthighlight').addClass('txthighlightred');
            sts = false;
        }
        else {
            $("#emaillbl").css("visibility", "hidden");
            $('#email').removeClass('txthighlightred').addClass('txthighlight');
        }
    

        let name = $("#name").val();
        let u = new RegExp("^(?![ .'_-])[a-zA-Z .'_-]*$");
        if ((name.length == 0) || (u.test(name) == false)) {
            $("#namelbl").css("visibility", "visible");
            $("#namelbl").show();
            $("#name").focus();
            $('#name').removeClass('txthighlight').addClass('txthighlightred');
            sts = false;
        }
        else {
            $('#name').removeClass('txthighlightred').addClass('txthighlight');
            $("#namelbl").css("visibility", "hidden");
        }

        let strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
        if (pass.length >= 8 && strongRegex.test(pass)) {
            $('#passlbl').text("Strong password");
            $("#passlbl").css({ 'color': 'green' });
            $("#passlbl").focusout();
        } else {
            $('#passlbl').text("Enter strong password");
            $("#passlbl").css({ 'color': '#a94442' });
            $("#inputPassword").focus();
            $('#inputPassword').removeClass('txthighlight').addClass('txthighlightred');
            sts = false;
        }

        return sts;
    }



    //this.selradiosecfn = function (e) {
    //    //let k = $('input[name=selector]:checked').attr("id");
    //    //let k = e.target.children[0].id;

    //    $("#rcorners1").css("display", "block");
    //    $("#s-option").removeAttr("checked");
    //    $("#t-option").prop('checked', true);
    //}
    //this.selradiofirstfn = function () {

    //    $("#t-option").removeAttr("checked");
    //    $("#s-option").prop('checked', true);

    //}

    this.Emailvalidate = function () {
        let com = $('#email').val();
        if (com.length == 0) {
            $("#emaillbl").css("visibility", "visible");
            sts = false;
            $('#email').focus();
        }
        else {
            $("#emaillbl").css("visibility", "hidden");
            $('#email').removeClass('txthighlightred').addClass('txthighlight');
        }
    }
 this.Emailvalidate1 = function () {
let com = $("#email").val();
      
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if ((com.length == 0) || (re.test(com) == false)) {
            $("#emaillbl").css("visibility", "visible");
            $("#email").focus();
            $('#email').removeClass('txthighlight').addClass('txthighlightred');
            sts = false;
        }
        else {
            $("#emaillbl").css("visibility", "hidden");
            $('#country').removeClass('txthighlightred').addClass('txthighlight');


            $.ajax({
                url: "../Ext/EmailCheck",
                data: { email: $("#email").val().trim(), },
                cache: false,
                type: "POST",
                success: function (status) {
                    if (status == 0) {
                        EbMessage("show", { Message: "You have already registered. Please login ", Background: 'red' });
                        

                    }
                    
                }
            });

}
}
    this.Namevalidate = function () {
    let name = $("#name").val();
    let u = new RegExp("^(?![ .'_-])[a-zA-Z .'_-]*$");
    if ((name.length == 0) || (u.test(name) == false)) {
        $("#namelbl").css("visibility", "visible");
        $("#namelbl").show();
        $("#name").focus();
        $('#name').removeClass('txthighlight').addClass('txthighlightred');
        sts = false;
       
    }
    else {
        $("#namelbl").css("visibility", "hidden");
        $('#name').removeClass('txthighlightred').addClass('txthighlight');
    }
    }


    //do not delete the commented code
    this.Countryselect = function () {
       if ($("#country option:selected").val() == 0) {
         // $("#countrylbl").css("visibility", "visible");
         $("#country").focus();
         $('#country').removeClass('txthighlight').addClass('txthighlightred');
         sts = false;
     }
     else {
           $('#country').removeClass('txthighlightred').addClass('txthighlight');
       //   $("#countrylbl").css("visibility", "hidden");

        }
    }

    this.init = function () {
        $("#save-profile").on("click", this.submitProfile.bind(this));
        //$("#radio1").on("click", this.selradiofirstfn.bind(this));
        //$("#radio2").on("click", this.selradiosecfn.bind(this));
        $("#email").on("keyup", this.Emailvalidate.bind(this));
        $("#name").on("keyup", this.Namevalidate.bind(this));
        $("#country").on("click", this.Countryselect.bind(this));
 $("#email").on('focusout', this.Emailvalidate1.bind(this))
    };
    this.init();
};


//*************************************************** 

//password filed validation for forgot password and signup page

//**************************************************


var PasswordValidation = function () {
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
        
        let sts = this.password_auto_validation();
        psdcode = $("#elink").val();
        if (sts == true) {
            $.ajax({
                url: "../Ext/ResetPassword",
                beforeSend: function () {
                    $("#loaderdiv").EbLoader("show");
                    $('"#btnpswreset').prop('disabled', true).css('opacity', 0.5);
                },
                data: { emcde: psdcode, psw: $("#inputPassword").val() },
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
                        $('"#btnpswreset').prop('disabled', true).css('opacity',1);
                        location.href = "../StatusCode/401";
                    }
                }
            });
        }
    }

    this.initial();
};