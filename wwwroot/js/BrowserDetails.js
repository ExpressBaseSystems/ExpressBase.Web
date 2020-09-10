var SolutionDashBoard = function () {
    this.browserName = "";
    this.getBrowserName = function () {
        let browserName = "";
        if (navigator.userAgent.indexOf("Edg") > -1 && navigator.appVersion.indexOf('Edg') > -1) {
            this.browserName = 'Microsoft Edge';
        }
        else if (navigator.userAgent.indexOf("Opera") != -1 || navigator.userAgent.indexOf('OPR') != -1) {
            this.browserName = 'Opera';
        }
        else if (navigator.userAgent.indexOf("Chrome") != -1) {
            this.browserName = 'Google Chrome';
        }
        else if (navigator.userAgent.indexOf("Safari") != -1) {
            this.browserName = 'Safari';
        }
        else if (navigator.userAgent.indexOf("Firefox") != -1) {
            return 'Firefox';
        }
        else if ((navigator.userAgent.indexOf("MSIE") != -1) || (!!document.documentMode == true)) //IF IE > 10
        {
            this.browserName = 'Internet Explorer';
        }
        else if ((navigator.userAgent.indexOf("rv:") != -1) || (!!document.documentMode == true)) //IF IE > 10
        {
            this.browserName = 'Internet Explorer';
        }
        else {
            this.browserName = 'Unknown';
        }
        return this.browserName;
    };
    this.Init = function () {
        this.getBrowserName();
        if (this.browserName == "Google Chrome" || this.browserName == "Microsoft Edge") {
            $("#lgn-usr").show().slideDown();
        }
        else {
            $("#logNow").attr("disabled", true);
            $("#otplogin").attr("disabled", true);
            $("#browser-compatibility").show();
            $("#txt-id").append(`<p>You are currently using <b style="font-weight: 500;">${this.browserName}</b></p> <p>Our platform is best viewed in the following Browsers:</p>`);

        }
    };
    this.Init();

}