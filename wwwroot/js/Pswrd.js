﻿$(document).ready(function () {
    $('#password').keyup(function () {
        $('#result').html(checkStrength($('#password').val()))
    })

    $("#password").focusout(function () {
       
        var password = $('#password').val();
        var result = checkStrength($('#password').val());
       
        if (result != "Strong")
        {
            $('#msgbox h5').text('The password must contain at least 6 characters long,contain at least one number, one uppercase and one lowercase letter and atleast one special character');
            $('#msgbox').show();
            $('#passloader').removeClass();
            $('#passloader').addClass('fa fa-times fa-lg');
            $('#passloader').show();
        }
        
        else {
            $('#msgbox').hide();
            $('#passloader').removeClass();
            $('#passloader').addClass('fa fa-check fa-lg');
            $('#passloader').show();
        }
       

    })
    function checkStrength(password) {
        var strength = 0
        if (password.length < 6) {
            $('#result').removeClass()
            $('#result').addClass('short')
            return 'Too short'
        }
        if (password.length > 7) strength += 1
        // If password contains both lower and uppercase characters, increase strength value.
        if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) strength += 1
        // If it has numbers and characters, increase strength value.
        if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) strength += 1
        // If it has one special character, increase strength value.
        if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1
        // If it has two special characters, increase strength value.
        if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1
        // Calculated strength value, we can return messages
        // If value is less than 2
        if (strength < 2) {
            $('#result').removeClass()
            $('#result').addClass('weak')
            return 'Weak'
        } else if (strength == 2) {
            $('#result').removeClass()
            $('#result').addClass('good')
            return 'Good'
        } else {
            $('#result').removeClass()
            $('#result').addClass('strong')
            return 'Strong'
        }
    }

    $('#rpwd').keyup(function () {
        var password = document.getElementById("password");
        var confirm_password = document.getElementById("rpwd");
       
            if (password.value != confirm_password.value) {
                $('#rresult').html("Passwords Don't Match");
            } else {
                $('#rresult').html("Passwords Match");
            }
        

    })
});