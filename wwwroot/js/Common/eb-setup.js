var MeetingRequestView;
class Setup {

    constructor(option) {
        this.option = {};
        this.se = {};
        this.notification_count = 0;
        this.actions_count = 0;

        $.extend(this.option, option);
        this.initContainers_DomEvents();
        this.initServerEvents();
        this.getNotifications();
        //this.userNotification();

        this.modal = new EbCommonModal();

        MeetingRequestView = this.MeetingRequestView.bind(this);
    }

    getCurrentLocation() {
        if (!$.isEmptyObject(ebcontext.locations)) {
            return ebcontext.locations.getCurrent();
        }
        return 1;
    }

    initContainers_DomEvents() {
        this.nf_container = $(`#nf-window #nf-container`);
        this.actn_container = $(`#nf-window #actn_container`);
        this.nf_window = $("#nf-window.eb-notification-window");
        this.nf_fade = $("#nf-window-fade");

        $("#eb-expand-nfWindow").off("click").on("click", this.toggleNFWindow.bind(this));
        this.nf_fade.on("click", this.toggleNFWindow.bind(this));
    }

    RMW() {
        $("#eb-expndLinkswrprWdgt").remove();
    }

    toggleNFWindow() {
        if (!this.nf_window.is(":visible")) {
            this.nf_fade.show();
            this.nf_window.show("slide", { direction: 'right' });
        }
        else {
            this.nf_fade.hide();
            this.nf_window.hide();
        }
    }

    initServerEvents() {
        this.se = new EbServerEvents({
            ServerEventUrl: this.option.se_url,
            Channels: ["file-upload"]
        });

        this.se.onNotification = function (msg) {
            console.log("new notification");
            this.notified(msg);
        }.bind(this);
    }

    notified(msg) {
        var o = JSON.parse(msg);
        this.notification_count = this.notification_count + 1;
        ebcontext.header.updateNCount(this.notification_count + this.actions_count);
        //start again
    }

    getNotifications() {
        $.ajax({
            type: "GET",
            url: "../Notifications/GetNotifications",
            success: this.onGetNotificationsSuccess.bind(this)
        });
    }

    onGetNotificationsSuccess(data) {
        if (data === null || data === undefined) return;
        else {
            if ("notifications" in data && Array.isArray(data.notifications)) {
                this.drawNotifications(data.notifications);
            }
            if ("pendingActions" in data && Array.isArray(data.pendingActions)) {
                this.drawActions(data.pendingActions);
            }
        }
        ebcontext.header.updateNCount(this.notification_count + this.actions_count);
        $('.status-time').tooltip({
            placement: 'top'
        });
    }

    drawNotifications(nf) {
        let plc = "Untitled...";
        this.nf_container.empty();
        if (nf.length > 0) {
            for (let i = 0; i < nf.length; i++) {
                this.nf_container.append(`
                <li class="nf-tile" notification-id="${nf[i].notificationId}" link-url="${nf[i].link}">
                    <div class="notification-inner">
                        <h5>${nf[i].title || plc}</h5>
                        <span class='pending_date status-time' title='${nf[i].createdDate}'>${nf[i].duration}</span>
                    </div>
                </li>`);
            }
        }
        else {
            this.nf_container.append(`<p class="nf-window-eptylbl" style="margin:auto;">No Notifications</p>`);
        }
        $("#nf-window #nf-notification-count").text(`(${nf.length})`);
        this.notification_count = nf.length;
    }

    drawActions(pa) {
        this.actn_container.empty();
        if (pa.length > 0) {
            for (let i = 0; i < pa.length; i++) {
                let params = btoa(unescape(encodeURIComponent(JSON.stringify([new fltr_obj(11, "id", pa[i].dataId)]))));
                let locid = this.getCurrentLocation();
                let Id = pa[i].myActionId;
                let url = `href='../webform/index?refid=${pa[i].link}&_params=${params}&_mode=1&_locId=${locid}' target='_blank'`;
                let _label = "";
                if (pa[i].actionType === "Approval")
                    _label = "<span class='status-icon'><i class='fa fa-commenting color-warning' aria-hidden='true'></i></span><span class='status-label label label-warning'>Review Required</span>";
                else
                    url = 'href="#" onclick="MeetingRequestView(this); return false;"';
                this.actn_container.append(`
                <li class="nf-tile">
                        <a ${url} data-id='${Id}'>
                            <div class='pending_action_inner'>
                                <h5>${pa[i].description}</h5>
                                <div class='icon-status-cont'>${_label} <span class='pending_date status-time' title='${pa[i].createdDate}'>${pa[i].dateInString}</span></div>
                            </div>
                        </a>
                </li>`);
            }
        }
        else {
            this.actn_container.append(`<p class="nf-window-eptylbl" style="margin:auto;">No Notifications</p>`);
        }
        $("#nf-window #nf-pendingact-count").text(`(${pa.length})`);
        this.actions_count = pa.length;
    }

    userNotification() {
        this.ss = new EbServerEvents({ ServerEventUrl: this.option.se_url, Channels: ["file-upload"] });
        this.ss.onLogOut = function (msg) {

        }.bind(this);
        this.ss.onNotification = function (msg) {
            var len = parseInt($('#notification-count').attr("count"));
            var html = "";
            var x = JSON.parse(msg);
            if (len === 0) {
                len = x.Notification.length;
            }
            else {
                len = len + x.Notification.length;
            }

            if (len === 0) {
                $('#notification-count').attr("style", "background-color: transparent;border: 2px solid transparent;");
                var html1 = `<p class="no_notification">No Notifications</p>`;
                $('.new_notifications').append(html1);
            }
            else {
                $('#notification-count').attr("style", "display:block;");
                $('#notification-count').html(len);
                $('.no_notification').detach();
            }
            $('#notification-count').attr("count", len);
            for (var i = 0; i < x.Notification.length; i++) {
                if (x.Notification[i].Title !== null && x.Notification[i].Link !== null) {
                    html += `<li class="drp_item" style="border-bottom: 1px solid rgba(0,0,0,.15);"> 
                                <i class="fa fa-times notification-close" style="float: right;padding: 5px 10px 0px 0px;"></i>
                                <div notification-id = "${x.Notification[i].NotificationId}" link-url="${x.Notification[i].Link}" class="notification-update" >
                                    <p>${x.Notification[i].Title}</p>
                                    <h6 class="notification-duration" style="margin-top: 0px;">${x.Notification[i].Duration}</h6>
                                </div>
                            </li>`;
                }
            }
            html = html + $('.new_notifications').html();
            $('.new_notifications').html(html);
            $('.notification-update').off("click").on('click', this.UpdateNotification.bind(this));
            $('.notification-close').off("click").on('click', this.CloseNotification.bind(this));
        }.bind(this);
    }

    UpdateNotification = function (e) {
        let notification_id = $(e.target).closest("div").attr("notification-id");
        let link_url = $(e.target).closest("div").attr("link-url");
        $.ajax({
            type: "POST",
            url: "../NotificationTest/GetNotificationFromDB",
            data: { notification_id: notification_id },
            success:
                this.NotificationSuccessFun.bind(this, link_url)
        });
        $(e.target).closest("li").detach();
        var x = parseInt($('#notification-count').attr("count")) - 1;
        if (x === 0) {
            $('#notification-count').attr("style", "background-color: transparent;border: 2px solid transparent;");
            var html = `<p class="no_notification">No Notifications</p>`;
            $('.new_notifications').append(html);
        }
        else {
            $('#notification-count').attr("style", "");
            $('#notification-count').html(x);
            $('.no_notification').detach();
        }

        $('#notification-count').attr("count", x);
    }

    CloseNotification = function (e) {
        let notification_id = $(e.target).siblings('div').attr("notification-id");
        $.ajax({
            type: "POST",
            url: "../NotificationTest/GetNotificationFromDB",
            data: { notification_id: notification_id }
        });
        $(e.target).closest("li").detach();
        var x = parseInt($('#notification-count').attr("count")) - 1;
        if (x === 0) {
            $('#notification-count').attr("style", "background-color: transparent;border: 2px solid transparent;");
            $('#notification-count').empty();
            var html = `<p class="no_notification">No Notifications</p>`;
            $('.new_notifications').append(html);
        }
        else {
            $('#notification-count').attr("style", "");
            $('#notification-count').html(x);
            $('.no_notification').detach();
        }
        $('#notification-count').attr("count", x);
        $('#notificationDropDown').addClass("open");
        e.stopPropagation();
    }

    MeetingRequestView = function(e) {
        let id = $(e).closest("a").attr("data-id");
        alert(id);
    };
}


class EbCommonModal {

    constructor() {

        this.options = {
            Title: "Title",
            ButtonText: "OK",
            ButtonColor: "#ffffff",
            ButtonBackground: "#3876ea",
            ShowHeader: true,
            ShowFooter: true
        };

        this.callback = new Function();

        this.$container = $("#eb-common-popup");
        this.$close = this.$container.find("#eb-common-popup-close");
        this.$ok = this.$container.find("#eb-common-popup-ok");

        this.setStyle({});

        this.$container.on('show.bs.modal', this.beforeShown.bind(this));
        this.$container.on('shown.bs.modal', this.afterShown.bind(this));
        this.$container.on('hide.bs.modal', this.beforeHide.bind(this));
        this.$container.on('hidden.bs.modal', this.afterHide.bind(this));
        this.$close.on("click", this.onClose.bind(this));
        this.$ok.on("click", this.onComplete.bind(this));
    }

    setStyle(option) {

        $.extend(this.options, option);

        this.$ok.css({ background: this.options.ButtonBackground, color: this.options.ButtonColor });
        this.$ok.text(this.options.ButtonText);

        this.$container.find(".modal-title").text(this.options.Title);

        if (this.options.ShowHeader)
            this.$container.find(".modal-header").show();
        else
            this.$container.find(".modal-header").hide();

        if (this.options.ShowFooter)
            this.$container.find(".modal-footer").show();
        else
            this.$container.find(".modal-footer").hide();
    }

    setSize(width, height) {
        if (typeof width === "string") {
            this.$container.find(".modal-dialog").addClass(width);
        }
        else {
            this.$container.height(height);
            this.$container.width(width);
        }
    }

    reset() {
        this.$container.modal('handleUpdate');
        this.setHtml("");
    }

    setHtml(html) {
        this.$container.find(".modal-body").html(html);
    }

    show(callback) {
        if (callback)
            this.callback = callback;

        this.$container.modal("show");
    }

    hide() {
        this.$container.modal("hide");
    }

    beforeShown() {
        this.callback("beforeShown");
    }

    afterShown() {
        this.callback("afterShown");
    }

    beforeHide() {
        this.callback("beforeHide");
    }

    afterHide() {
        this.callback("afterHide");
    }

    onClose() {
        this.callback("onClose");
    }

    onComplete() {
        this.callback("onComplete");
        this.hide();
    }
}