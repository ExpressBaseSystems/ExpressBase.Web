function indexScrollAction() {
    $(document).scroll(function () {
        var y = $(this).scrollTop();
        if (y > $('.slider').height()) {
            $('#trial-btn').fadeIn();
        } else {
            $('#trial-btn').fadeOut();
        }
    });
}

function ValidateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
        return true;
    else
        return false;
}

function validate(form) {
    var email = form.Email.value.trim();
    if (ValidateEmail(email))
        return true;
    else
        return false;
}

//function joinBeta() {
//    $(".joinbeta").submit(function (e) {
//        e.preventDefault();
//        if (validate(this)) {
//            $.ajax({
//                type: 'POST',
//                url: "../Ext/JoinBeta",
//                beforeSend: function () {
//                    $(e.target).children().find('i').show();
//                },
//                data: $(e.target).serializeArray()
//            }).done(function (data) {
//                var msg = data ? "Thank you for your interest in our private beta. We will get back to you shortly." : "You have already specified your interest to join our private beta. We will get back to you shortly.";

//                $(e.target).children().find('i').hide();
//                $(".message-box-indexpage").show().text(msg);
//                $(".ext-pageheader .navbar").css("top", "40px");
//                $("#close-msg").click(function (e) {
//                    $(".message-box-indexpage").hide();
//                    $(".ext-pageheader .navbar").css("top", "0");
//                });
//            });
//        }
//    });
//}