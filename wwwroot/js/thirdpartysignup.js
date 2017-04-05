
$(document).ready(function () {
    $('#email').focusout(function () {
       
        var dict = "{cname :" + $('#email').val() + "}";
    
        $.post('http://localhost:53125/unc', {"Colvalues": dict },
        function (result) {
            
            if (result) {
               
                $('#email').next().html("<img src='http://localhost:53125/images/CheckMark-24x32.png' width='22px'/>");
            }
            else {
                alert(result);
                $('#email').next().html("<img src='http://localhost:53125/images/Error-24x24.png' width='22px'/>");
            }
        });
    });
});

window.fbAsyncInit = function () {
    FB.init({
        appId: '605126636359062',
        xfbml: true,
        version: 'v2.8'
    });
    FB.AppEvents.logPageView();
};

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function loginByFacebook() {

    FB.login(function (response) {

        if (response.authResponse) {

            FacebookLoggedIn(response);
        } else {
            console.log('User cancelled login or did not fully authorize.');
        }
    }, { scope: 'user_birthday,user_about_me,user_hometown,user_location,email' });
}

function FacebookLoggedIn(response) {
    var loc = '/TenantExt/Facebook';
    if (loc.indexOf('?') > -1)
        window.location = loc + '&authprv=facebook&access_token=' + response.authResponse.accessToken;
    else
        window.location = loc + '?authprv=facebook&access_token=' + response.authResponse.accessToken;
}




function onSignInCallback(authResult) {
    //console.log(authResult['access_token']);
    
    if (authResult['access_token'] && authResult['status']['signed_in'] && authResult['status']['method'] == 'PROMPT') {
        // The user is signed in

        var loc = 'Tenant/Google?accessToken=' + authResult['access_token'];
        window.location.href = loc;
    } //else if (authResult['error']) {
    // There was an error, which means the user is not signed in.
    // As an example, you can troubleshoot by writing to the console:
    // alert('There was an error: ' + authResult['error']);
    //  }
    //console.log('authResult', authResult);
}

//function loginByGplus() {
//    $('#signinButton').trigger("click");
//    alert('dda');
//}

(function () {
   
    var po = document.createElement('script');
    po.type = 'text/javascript'; po.async = true;
    po.src = 'https://plus.google.com/js/client:plusone.js';
    var s = document.getElementsByTagName('script')[0];
  
    s.parentNode.insertBefore(po, s);
})();

//gapi.signin.render("mySignIn", {
//    'callback': signinCallback,
//    'clientid': '873705187391-crnqrfqklcdqn5qnc8fqmrjn33hsnkvi.apps.googleusercontent.com',
//    'cookiepolicy': 'single_host_origin',
//    'requestvisibleactions': 'http://schemas.google.com/AddActivity',
//    'scope': 'https://www.googleapis.com/auth/plus.login'
//});

