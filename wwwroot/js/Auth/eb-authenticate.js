(function () {

    $(".validator-error").css({
        "padding-top": "5px",
        "color": "#f5222d",
        "font-weight": 400,
        "transition": " color .3s cubic-bezier(.215,.61,.355,1);",
        "font-size": "13px"
    });

    $("[validator='email'] input").on("keyup", function (e) {
        if (ve(e.target.value) || veMob(e.target.value)) {
            $("[validator='email']").find(".validator-error").text("");
            $(e.target).removeClass("validator_error");
        }
    });

    $("[validator='password'] input").on("keyup", function (e) {
        if (e.target.value.length >= 8) {
            $("[validator='password']").find(".validator-error").text("");
            $(e.target).removeClass("validator_error");
        }
    });

    $("[validator='email'] input").on("change focusout", function (e) {
        if (e.target.value === "") {
            $("[validator='email']").find(".validator-error").text("Email or Mobile is required.");
            $(e.target).addClass("validator_error");
        }
        else {
            if(ve(e.target.value) || veMob(e.target.value)) { 
                $("[validator='email']").find(".validator-error").text("");
                $(e.target).removeClass("validator_error");
            }
            else {
                $("[validator='email']").find(".validator-error").text("Email or Mobile is invalid.");
                $(e.target).addClass("validator_error");
            }
        }
    });

    $("[validator='password'] input").on("change focusout", function (e) {
        if (e.target.value === "") {
            $("[validator='password']").find(".validator-error").text("Password is required.");
            $(e.target).addClass("validator_error");
        }
        else if (e.target.value.length < 8) {
            $("[validator='password']").find(".validator-error").text("Password must be at least 8 characters");
            $(e.target).addClass("validator_error");
        }
        else {
            $("[validator='password']").find(".validator-error").text("");
            $(e.target).removeClass("validator_error");
        }
    });

    function ve(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

     function veMob(mobile) {
         var re = /^(\+91-|\+91|0)?\d{10}$/;;
         return re.test(mobile);
    }



    function validate() {
        var stat = true;
        //var e = $("[validator='email']");
        //var p = $("[validator='password']");
        var uNameval = /*$("[validator='email'] input")[0].value*/ $("[name='uname']")[0].value;
        var pval = $("[validator='password'] input")[0].value;
        if (uNameval === "") {
            $("[validator='email']").find(".validator-error").text("Email or Mobile required.");
            $("[validator='email'] input").addClass("validator_error");
            stat = false;
        }

        if (pval === "") {
            $("[validator='password']").find(".validator-error").text("Password is required.");
            $("[validator='password'] input").addClass("validator_error");
            stat = false;
        }
        else if (pval.length < 8) {
            $("[validator='password']").find(".validator-error").text("Password must be at least 8 characters");
            $("[validator='password'] input").addClass("validator_error");
            stat = false;
        }

        if (uNameval !== "" && (!ve(uNameval)) && !veMob(uNameval)) {
            $("[validator='email']").find(".validator-error").text("Email or Mobile is invalid.");
            $("[validator='email'] input").addClass("validator_error");
            stat = false;
        }
        return stat;
    }

    window.eb_env = null;

    window.validator_recaptcha = function (token) {
        if (token) {
            $.ajax({
                url: "/Ext/EbSignIn",
                type: "POST",
                beforeSend: function () {
                    $("#loader_profile").EbLoader("show");
                },
                data: {
                    "uname": $("input[name='uname']").val(),
                    "pass": $("input[name='pass']").val(),
                    "g-recaptcha-response": token || "nhjsnbnby-edrjewrh",
                    "continue_with": $("input[name='continue_with']").val() || "",
                    otptype: $("#otptype").text(),
                    otp: $("#partitioned").val(),
                    uname_otp: $("#uname_otp").val()
                },
                success: function (auth) {
                    if (auth.authStatus) {
                        if (auth.is2fa) {
                            $("#log_form").hide();
                            $("#2fauth_form").show();
                            $("#lastDigit").text(auth.otpTo);
                            $("#loader_profile").EbLoader("hide");
                            $("#otptype").text("2faotp");
                            StartOtpTimer();
                        }
                        else
                            location.replace(auth.redirectUrl);
                    }
                    else {
                        $(`[validator="submit"]`).prop("disabled", false);
                        $("#loader_profile").EbLoader("hide");

                        if (window.eb_env === "Production") {
                            grecaptcha.reset();
                        }
                        EbMessage("show", { Background: "red", Message: auth.errorMessage });
                    }
                }
            });
        }
    };

    $(`[validator="submit"]`).on("click", function (e) {
        if (!validate())
            return false;

        $(`[validator="submit"]`).prop("disabled", true);

        let env = $(e.target).closest(`[validator="submit"]`).attr("env");
        window.eb_env = env;

        if (env === "Production") {
            grecaptcha.execute();
        }
        else {
            validator_recaptcha("nhjsnbnby-edrjewrh");
        }
    });

    $(document).on("keypress", function (e) {
        if (e.which == 13) {
            $(`[validator="submit"]`)[0].click();
        }
    });

    $("#otpvalidate").on("click", function () {
        if ($("#partitioned").val().length > 0) {
            $("#loader_profile").EbLoader("show");
            if ($("#otptype").text() == "signinotp") {
                $(`[validator="submit"]`)[0].click();
            }
            else {
                $.post("../Ext/ValidateOtp",
                    {
                        otptype: $("#otptype").text(),
                        otp: $("#partitioned").val()
                    },
                    function (auth) {
                        if (auth.authStatus) {
                            location.replace(auth.redirectUrl);
                        }
                        else {
                            EbMessage("show", { Background: "red", Message: auth.errorMessage });
                            if (auth.errorMessage.includes("with token")) { window.location.reload(); }
                        }
                        $("#loader_profile").EbLoader("hide");
                    }
                );
            }
        }
        else {
            ShowWarning("Please enter the otp", "red");
        }
    });

    //otp timer
    var resend = false;
    function StartOtpTimer() {
        resend = false;
        document.getElementById('timer').innerHTML = 003 + ":" + 00;
        startTimer();
    };
    function startTimer() {
        if (resend)
            return;
        var presentTime = document.getElementById('timer').innerHTML;
        var timeArray = presentTime.split(/[:]+/);
        var m = timeArray[0];
        var s = checkSecond((timeArray[1] - 1));
        if (s == 59) { m = m - 1 }
        if (m < 0) {
            OtpTimeOut();
            return;
        }

        document.getElementById('timer').innerHTML =
            m + ":" + s;
        console.log(m);
        setTimeout(startTimer, 1000);
    };

    function OtpTimeOut() {
        EbMessage("show", { Background: "red", Message: "Time out" });
        window.location.reload();
    };

    function checkSecond(sec) {
        if (sec < 10 && sec >= 0) { sec = "0" + sec; } // add zero in front of numbers < 10
        if (sec < 0) { sec = "59"; }
        return sec;
    }

    $("#resend").on("click", function () {
        $("#loader_profile").EbLoader("show");
        resend = true;
        $.post("Ext/ResendOtp",
            { otptype: $("#otptype").text() },
            function (auth) {
                if (auth.authStatus) {
                    StartOtpTimer();
                    $("#loader_profile").EbLoader("hide");
                    ShowWarning("OTP has been sent again", "green");
                }
                else {
                    $("#loader_profile").EbLoader("hide");
                    EbMessage("show", { Background: "red", Message: auth.errorMessage });
                }
            });
    });

    function ShowWarning(message, color) {
        $(".otp_warnings").empty();
        $(".otp_warnings").text(message);
        $(".otp_warnings").css("color", color);
    }

    $("#otplogin").on("click", function () {
        let uname = $("#uname_otp").val();
        //let emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        let is_email = ve(uname);
        //let phoneRegex = /^(\+91-|\+91|0)?\d{10}$/;
        let is_mobile = veMob(uname);
        if (is_email || is_mobile) {
            $.ajax({
                url: "/Ext/SendSignInOtp",
                type: "POST",
                beforeSend: function () {
                    $("#loader_profile").EbLoader("show");
                },
                data: {
                    "uname": uname,
                    "is_email": is_email,
                    "is_mobile": is_mobile
                },
                success: function (auth) {
                    $("#loader_profile").EbLoader("hide");
                    if (auth.authStatus) {
                        $("#log_form").hide();
                        $("#2fauth_form").show();
                        $("#lastDigit").text(auth.otpTo);
                        $("#otptype").text("signinotp");
                        $("#loader_profile").EbLoader("hide");
                        StartOtpTimer();
                    } else {
                        $("#loader_profile").EbLoader("hide");
                        EbMessage("show", { Background: "red", Message: auth.errorMessage });
                    }
                }
            });
        }
        else {
            if (uname !== "" && (!ve(uname)) && !veMob(uname)) {
                $("#withotp_container").find(".validator-error").text("Email or Mobile is invalid.");
                $("#withotp_container input").addClass("validator_error");
                
            }
        }
    });

    $("#uname_otp").on("change focusout", function (e) {
        if (e.target.value === "") {
            $("#withotp_container").find(".validator-error").text("Email or Mobile is invalid.");
            $("#withotp_container input").addClass("validator_error");
        }
        else {
            if (ve(e.target.value) || veMob(e.target.value)) {
                $("#withotp_container").find(".validator-error").text("");
                $(e.target).removeClass("validator_error");
            }
            else {
                $("#withotp_container").find(".validator-error").text("Email or Mobile is invalid.");
                $(e.target).addClass("validator_error");
            }
        }
    });

})(window);