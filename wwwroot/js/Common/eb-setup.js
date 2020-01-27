class Setup {
    constructor() {
        this.userNotification();
    }

    RMW() {
        $("#eb-expndLinkswrprWdgt").remove();
    }

    userNotification() {
        this.ss = new EbServerEvents({ ServerEventUrl: ebcontext.se_url, Channels: ["file-upload"] });
        this.ss.onLogOut = function (msg) {

        }.bind(this);
    }
}