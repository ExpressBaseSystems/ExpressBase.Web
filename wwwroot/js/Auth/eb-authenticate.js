(function () {

    $(".validator-error").css({
        "padding-top": "5px",
        "color": "#f5222d",
        "font-weight": 400,
        "transition": " color .3s cubic-bezier(.215,.61,.355,1);",
        "font-size": "13px"
    });

    $("[validator='email'] input").on("keyup", function (e) {
        if (ve(e.target.value)) {
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
            $("[validator='email']").find(".validator-error").text("Email address is required.");
            $(e.target).addClass("validator_error");
        }
        else {
            if (ve(e.target.value)) {
                $("[validator='email']").find(".validator-error").text("");
                $(e.target).removeClass("validator_error");
            }
            else {
                $("[validator='email']").find(".validator-error").text("Email address is invalid.");
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

    function validate() {
        var stat = true;
        var e = $("[validator='email']");
        var p = $("[validator='password']");
        var emval = $("[validator='email'] input")[0].value.trim();
        var pval = $("[validator='password'] input")[0].value.trim();
        if (emval === "") {
            $("[validator='email']").find(".validator-error").text("Email address is required.");
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

        if (emval !== "" && !ve(emval)) {
            $("[validator='email']").find(".validator-error").text("Email address is invalid.");
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
                    "uname": $("input[name='uname']").val().trim(),
                    "pass": $("input[name='pass']").val().trim(),
                    "g-recaptcha-response": token || "nhjsnbnby-edrjewrh",
                    "continue_with": $("input[name='continue_with']").val() || ""
                },
                success: function (auth) {
                    if (auth.authStatus) {
                        if (auth.is2fa) {
                            $("#log_form").hide();
                            $("#2fauth_form").show();
                            $("#lastDigit").text(auth.otpTo);
                            $("#loader_profile").EbLoader("hide");
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
        $("#loader_profile").EbLoader("show");
        $.post("../Ext/ValidateOtp",
            {
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
    });

    //otp timer
    var resend = false;
    function StartOtpTimer() {
        resend = false;
        document.getElementById('timer').innerHTML = 005 + ":" + 00;
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
        $.post("Ext/ResendOtp", function (auth) {
            if (auth.authStatus) {
                StartOtpTimer();
                $("#loader_profile").EbLoader("hide");
                $(".otp_warnings").empty();
                $(".otp_warnings").text("OTP has been sent again");
            }
            else {
                $("#loader_profile").EbLoader("hide");
                EbMessage("show", { Background: "red", Message: auth.errorMessage });
            }
        });
    });
})(window);