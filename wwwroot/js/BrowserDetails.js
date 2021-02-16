var SolutionDashBoard = function () {
    this.browserName = "";
    this.browserVersion;
    this.fullBrowserVersion;
    this.getBrowserName = function () {
        let browserName = "";
        var userAgent = navigator.userAgent.toLowerCase();
        if (navigator.userAgent.indexOf("Edg") > -1 && navigator.appVersion.indexOf('Edg') > -1) {
            this.browserName = 'Microsoft Edge';
            var matches = userAgent.match(/edg\/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/);
            if (matches) {
                this.fullBrowserVersion = matches[1];
                this.browserVersion = parseInt(matches[1]);
            }
        }
        else if (navigator.userAgent.indexOf("Opera") != -1 || navigator.userAgent.indexOf('OPR') != -1) {
            this.browserName = 'Opera';
        }
        else if (navigator.userAgent.indexOf("Chrome") != -1) {
            this.browserName = 'Google Chrome';
            var matches = userAgent.match(/chrome\/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/);
            if (matches) {
                this.fullBrowserVersion = matches[1];
                this.browserVersion = parseInt(matches[1]);
            }
        }
        else if (navigator.userAgent.indexOf("Safari") != -1) {
            this.browserName = 'Safari';
        }
        else if (navigator.userAgent.indexOf("Firefox") != -1) {
            this.browserName = 'Firefox';
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

    this.checkBrowserVersion = function (supportVersion) {
        if (this.browserVersion >= supportVersion) {
            $("#lgn-usr").show().slideDown();
        }
        else {
            $("#logNow").attr("disabled", true);
            $("#otplogin").attr("disabled", true);
            $("#browser-compatibility").show();
            $("#browser-compatibility .br-ic").hide();
            $("#txt-id").append(`<p>Your current <strong>${this.browserName} </strong> browser version is <strong>${this.fullBrowserVersion}</strong></p>
            <p>We recommend ${this.browserName} browser version above <strong>80.0 </strong></p>`);
        }

    }

    this.Init = function () {
        debugger;
        this.getBrowserName();
        if (this.browserName == "Google Chrome") {
            this.checkBrowserVersion(80);
        }
        else if (this.browserName == "Microsoft Edge") {
            this.checkBrowserVersion(80);
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