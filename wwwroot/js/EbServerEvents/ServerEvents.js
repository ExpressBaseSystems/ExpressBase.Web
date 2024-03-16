var EbServerEvents = function (options) {
    this.rTok = options.Rtoken || getrToken();
    this.ServerEventUrl = options.ServerEventUrl;
    this.Channels = options.Channels.join();
    this.Url = this.ServerEventUrl + "/event-stream?channels=" + this.Channels + "&t=" + new Date().getTime();
    this.sEvent = $.ss;

    this.onUploadSuccess = function (m, e) {
        $(`[sse_Refid=${m}]`).find(".success").hide();
        $(`[sse_Refid=${m}]`).find(".sse_success").show();
    };
    this.onShowMsg = function (m, e) { };
    this.onLogOut = function (m, e) { };
    this.onNotification = function (m, e) { };
    this.onExcelExportSuccess = function (m, e) { };
    this.onPdfDownloadSuccess = function (m, e) { };

    return;///////// 

    this.onConnect = function (sub) {
        console.log("sse connected! " + sub.displayName, sub.id);

        if (sub) {
            ebcontext.subscription_id = sub.id;
            //$.ajaxSetup({
            //    headers: { 'eb_sse_subid': sub.id }
            //});
        }

    };

    this.onJoin = function (user) {
        //   console.log("onJoin Welcome, " + user.displayName);
    };

    this.onLeave = function (user) {
        //  console.log(user.displayName + " has left the building");
    };

    this.onHeartbeat = function (msg, e) {
        //if (console)
        //  console.log("onHeartbeat", msg, e);
    };

    this.onUploaded = function (m, e) {
        this.onUploadSuccess(m, e);
    };


    this.mybroadcast = function (msg, e) {
        //  console.log("mybroadcast", msg, e);
        //  alert(213);
    }


    this.onMsgSuccess = function (m, e) {
        //console.log("onMsgSuccess, " + m);
        //this.onShowMsg(m, e);
    };

    this.onLogOutMsg = function (m, e) {
        //  console.log(m);
        location.href = "../Tenantuser/Logout";
        this.onLogOut(m, e);
    };

    this.onNotifyMsg = function (m, e) {
        //console.log("Notification");
        this.onNotification(m, e);
    };

    this.stopListening = function () {
        this.ES.close();
        this.sEvent.eventSourceStop = true;
        // console.log("stopped listening");
    };

    this.onExportToExcel = function (m, e) {
        this.onExcelExportSuccess(m);
    };

    this.onPdfDownload = function (m, e) {
        this.onPdfDownloadSuccess(m);
    };

    this.exportApplication = function (m, e) {
        self.EbPopBox("hide");
        let pop = {
            Message: "Exported Successfully. Go to App Store to view the package :"
        };
        self.EbPopBox("show", pop);
    }

    this.importApplication = function (m, e) {
        self.EbPopBox("hide");
        let pop = {
            Message: "Application imported Successfully."
        };
        self.EbPopBox("show", pop);
    }

    this.updateUserMenu = function (m, e) {
        localStorage.removeItem("EbMenuObjects_" + ebcontext.sid + ebcontext.user.UserId + ebcontext.wc + "mhtml");
        localStorage.removeItem("EbMenuObjects_" + ebcontext.sid + ebcontext.user.UserId + ebcontext.wc);
        // $('#menu_refresh').click();
    }
    this.userDisabled = function (m) {

        var html = `<div class="eb_dlogBox_container eb_dlogBox_blurBG" id="eb_dlogBox_logout">
                                    <div class="cw" style="align-items: center;">

                                        <i class="fa fa-warning" style="font-size: 35px;color:red;padding: 10px;"></i>
                                        <div class="msgbdy">${m}</div>
                                        <div id="cntTimer">You will be logged out in <span id="counterSpn"></span> seconds</div>
                                    </div>
                                </div>`;
        $('body').append(html);
        var count = 5;
        var countdown = setInterval(function () {
            $("#counterSpn").html(count);
            if (count == 0) {
                clearInterval(countdown);
                $("#cntTimer").hide();
                window.location = "/Tenantuser/Logout";
            }
            count--;
        }, 1000);
    }

    this.webFormEdit_EnableDisable = function (m, b) {
        EbMessage("show", { Message: m, AutoHide: true, Background: 'blue' });
        $(`.objectDashB-toolbar #webformedit`).attr("disabled", b);
    }

    this.ES = new EventSourcePolyfill(this.Url, {
        headers: {
            'Authorization': 'Bearer ' + this.rTok,
        }
    });

    this.ES.addEventListener('error', function (e) {
        console.log("ERROR!", e);
    }, false);

    this.sEvent.eventReceivers = { "document": document };

    $(document).bindHandlers({
        announce: function (msg) {
            console.log("announce");
        },
        toggle: function () {
            console.log("toggle");
        },
        removeReceiver: function (name) {
            delete $.ss.eventReceivers[name];
        },
        addReceiver: function (name) {
            this.sEvent.eventReceivers[name] = window[name];
        },
        startListening: function () {
            this.sEvent.reconnectServerEventsAuth();
        }
    }).on('customEvent', function (e, msg, msgEvent) {
        console.log("custom");
    });

    $(this.ES).handleServerEvents({
        handlers: {
            onConnect: this.onConnect.bind(this),
            onJoin: this.onJoin.bind(this),
            onLeave: this.onLeave.bind(this),
            onHeartbeat: this.onHeartbeat.bind(this),
            onUploadSuccess: this.onUploaded.bind(this),
            stopListening: this.stopListening.bind(this),
            onExportToExcel: this.onExportToExcel.bind(this),
            onPdfDownload: this.onPdfDownload.bind(this),
            onMsgSuccess: this.onMsgSuccess.bind(this),
            onLogOut: this.onLogOutMsg.bind(this),
            onNotification: this.onNotifyMsg.bind(this),
            exportApplication: this.exportApplication.bind(this),
            importApplication: this.importApplication.bind(this),
            UpdateUserMenu: this.updateUserMenu.bind(this),
            userDisabled: this.userDisabled.bind(this),
            //  WebFormEdit_Disable: function (m, e) { this.webFormEdit_EnableDisable(m, true) }.bind(this),
            //  WebFormEdit_Enable: function (m, e) { this.webFormEdit_EnableDisable(m, false) }.bind(this)

        }
    });

    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            if (this.sEvent && this.sEvent.eventSourceStop)
                this.sEvent.eventSourceStop = false;
        } else {
            if (this.sEvent && !this.sEvent.eventSourceStop)
                this.sEvent.eventSourceStop = true;
        }
    }.bind(this));
};