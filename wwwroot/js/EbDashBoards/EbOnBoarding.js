
//js file for EbOnBoarding.cshtml ,Resetpassword.cshtml
//has 2 main function EbOnboarding for...................   and PasswordValidation
var EbOnBoarding = function () {
    this.solinfo = {};
    this.seldeploy;


 this.submitProfile = function (e)
{
 grecaptcha.execute();
}
    this.SaveUser = function (tkn) {
        let info = this.validate();
        if (info) {
            $.ajax({
                type: 'POST',
                url: "../Ext/BoardAsync",
                beforeSend: function () {
                    $("#loaderdiv").EbLoader("show");
                    //$(".iconspin").addClass("fa fa-spinner fa-pulse")
                    $('#save-profile').prop('disabled', true);
                },
                data: {
                    email: $("#email").val().trim(),
                    name: $("#name").val().trim(),
                    country: $("#country option:selected").text().trim(),
                    password: $("#inputPassword").val().trim(),
                    token: tkn
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
            $("#countrylbl").css("visibility", "visible");
            $("#country").focus();
            $('#country').removeClass('txthighlight').addClass('txthighlightred');
            sts = false;
        }
        else {
            $('#country').removeClass('txthighlightred').addClass('txthighlight');
            $("#countrylbl").css("visibility", "hidden");

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
        $("#emaillbl2").css("visibility", "hidden");
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


            $.ajax({
                url: "../Ext/EmailCheck",
                data: { email: $("#email").val().trim(), },
                cache: false,
                type: "POST",
                success: function (status) {
                    if (status == 0) {
                        $("#emaillbl2").css("visibility", "visible");
                    }
                    else {
                        $("#emaillbl2").css("visibility", "hidden");
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
