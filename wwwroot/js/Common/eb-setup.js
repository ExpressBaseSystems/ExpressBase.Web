class Setup {
    constructor(option) {
        this.option = {};

        $.extend(this.option, option);

        //this.userNotification();
    }

    RMW() {
        $("#eb-expndLinkswrprWdgt").remove();
    }

    userNotification() {
        this.ss = new EbServerEvents({ ServerEventUrl: this.option.se_url, Channels: ["file-upload"] });
        this.ss.onLogOut = function (msg) {

        }.bind(this);
        this.ss.onNotification = function (msg) {

        }.bind(this);
    }
}