(function () {

    $("[validator='email']").on("change", function (e) {
        if (e.target.value === "") {
            $("[validator='email']").find(".validator-error").text("Please fill in this field.");
        }
        else {
            if (ve(e.target.value)) {
                $("[validator='email']").find(".validator-error").text("");
            }
            else {
                $("[validator='email']").find(".validator-error").text("Email address is invalid.");
            }
        }
    });

    $("[validator='password']").on("change", function (e) {
        if (e.target.value === "") 
            $("[validator='password']").find(".validator-error").text("Please fill in this field.");
        else 
            $("[validator='password']").find(".validator-error").text("");
    });
     
    function ve(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    function validate() {
        var stat = true;
        var e = $("[validator='email']");
        var p = $("[validator='password']");
        var eval = $("[validator='email']").find("input").val().trim();
        var pval = $("[validator='password']").find("input").val().trim();
        if (eval === "") {
            $("[validator='email']").find(".validator-error").text("Please fill in this field.");
            stat = false;
        }

        if (pval === "") {
            $("[validator='password']").find(".validator-error").text("Please fill in this field.");
            stat = false;
        }

        if (!ve(eval)) {
            $("[validator='email']").find(".validator-error").text("Email address is invalid.");
            stat = false;
        }

        return stat;
    }

    function authCallByRecaptcha(token) {
        if (!validate())
            return false;
        $.ajax({
            url: "/Ext/EbSignIn",
            type: "POST",
            data: {
                "uname": $("input[name='uname']").val().trim(),
                "pass": $("input[name='pass']").val().trim(),
                "g-recaptcha-response": token
            },
            success: function (res) {

            }
        });

    }
})(window)