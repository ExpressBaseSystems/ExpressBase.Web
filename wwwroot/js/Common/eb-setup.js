class Setup {
    constructor() {
        this.userNotification();
    }

    RMW() {
        $("#eb-expndLinkswrprWdgt").remove();
    }

    userNotification() {
        this.ss = new EbServerEvents({ ServerEventUrl: "http://localhost:41900", Channels: ["file-upload"] });
        this.ss.onLogOut = function (msg) {

        }.bind(this);
    }
}