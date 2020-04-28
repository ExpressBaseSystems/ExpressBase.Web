class Setup {
    constructor(option) {
        this.option = {};

        $.extend(this.option, option);

        this.userNotification();
        this.GetNotificationFromDBForPageLoad();
    }

    RMW() {
        $("#eb-expndLinkswrprWdgt").remove();
    }

    userNotification() {
        this.ss = new EbServerEvents({ ServerEventUrl: this.option.se_url, Channels: ["file-upload"] });
        this.ss.onLogOut = function (msg) {

        }.bind(this);
        this.ss.onNotification = function (msg) {
            var len = parseInt($('#notification-count').attr("count"));
            var html = "";
            var x = JSON.parse(msg);
            if (len == 0) {
                len = x.Notification.length;
            }
            else {
                len = len + x.Notification.length;
            }

            if (len == 0) {
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
                if (x.Notification[i].Title != null && x.Notification[i].Link != null) {
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
        if (x == 0) {
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

    NotificationSuccessFun = function (link_url, data) {
        //window.location = link_url;
        window.open(link_url, '_blank');
    }

    GetNotificationFromDBForPageLoad() {
        $.ajax({
            type: "POST",
            url: "../NotificationTest/GetCompleteNotificationDetailsFromDB",
            data: {},
            success:
                this.CompleteNotificationDisplayFunc.bind(this)
        });
    }

    CompleteNotificationDisplayFunc = function (data) {
        this.AppendTabs(data);
        this.AppendNotification(data);
        this.AppendPendingAction(data);
        let count = data.notifications.length + data.pendingActions.length;

        if (count === 0)
            $('#notification-count').attr("style", "background-color: transparent;border: 2px solid transparent;");
        else {
            $('#notification-count').attr("style", "");
            $('#notification-count').html(count);
        }
        $('#notification-count').attr("count", count);
        $('.notification-update').off("click").on('click', this.UpdateNotification.bind(this));
        $('.notification-close').off("click").on('click', this.CloseNotification.bind(this));
        $('#notificationTabs').on('click', '.nav-tabs a', function () {
            $(this).closest('.dropdown').addClass('dontClose');
        });
        $('#notificationDropDown').on('hide.bs.dropdown', function (e) {
            if ($(this).hasClass('dontClose')) {
                e.preventDefault();
            }
            $(this).removeClass('dontClose');
        });
    }

    AppendTabs = function (data) {
        let html = ``;
        html = html + `
                    <ul class="nav nav-tabs eb-styledTab" >
                          <li class="nav-item devdshtab active"> <a class="nav-link devdshtab" data-toggle="tab" role="tab" href="#notification" style="background: #f2f2f2;border: none;height: 35px;padding: 10px 15px;border-bottom: 1px solid #ddd;margin-top: 0px;color: #555;font-size: 12px;">Notifications</a></li>
                          <li class="nav-item devdshtab"><a class="nav-link devdshtab" data-toggle="tab" role="tab" href="#pendingAction" style="background: #f2f2f2;border: none;height: 35px;padding: 10px 15px;border-bottom: 1px solid #ddd;margin-top: 0px;color: #555;font-size: 12px;">Review Pending</a></li>
                    </ul>
                    
                    <div class="tab-content">
                        <div id="notification" class="tab-pane active" role="tabpanel" style='height:calc(100vh - 74px)'>
                            <div class='action_cont'>
                                <ul class="drp_ul new_notifications Action_ul"></ul>
                            </div>
                            <div class='see_all_action see_all_notification'><a href="/NotificationTest/GetAllNotifications" target="_blank">See All Notifications</a></div>
                        </div>
                        <div id="pendingAction" class="tab-pane" role="tabpanel" style='height:calc(100vh - 74px)'>
                            <div class='action_cont'>
                                <ul class="drp_ul pendingactions Action_ul"></ul>
                             </div>
                            <div class='see_all_action see_all_pendingaction'><a href="/NotificationTest/GetAllActions" target="_blank">See All Actions</a></div>
                        </div>
                   </div>
                    `;
        $('.notifications').empty();
        $('.notifications').append(html);
    }

    AppendNotification = function (data) {
        let html = ``;
        for (let i = 0; i < data.notifications.length; i++) {
            if (data.notifications[i].title !== null && data.notifications[i].link !== null) {
                html = html + `
                            <li class="drp_item"> 
                                <i class="fa fa-times notification-close"></i>
                                <div notification-id = "${data.notifications[i].notificationId}" link-url="${data.notifications[i].link}" class="notification-update" >
                                    <p>${data.notifications[i].title}</p>
                                    <h6 class="notification-duration" style="margin-top: 0px;">${data.notifications[i].duration}</h6>
                                </div>
                            </li>`;
            }
        }
        $("#notification .new_notifications").append(html);
        html = ``;
        html = `<div id="old" class="tab-pane" role="tabpanel">
                            <ul class="drp_ul old_notifications" style="overflow: scroll;height: 100vh;">
                            </ul>
                        </div>
                    `;
        $("#notification").after(html);

        if (data.notifications.length === 0) {
            let html1 = `<p class="no_notification no_action">No Notifications</p>`;
            $('.new_notifications').append(html1);
            $("#notification .see_all_notification").hide();
        }
        else {
            $('.no_notification').detach();
            $("[href='#notification']").append(`(${data.notifications.length})`);
        }
    }

    AppendPendingAction = function (data) {
        let html = ``;
        for (let i = 0; i < data.pendingActions.length; i++) {
            let filters = [];
            filters.push(new fltr_obj(11, "id", data.pendingActions[i].dataId));
            let url = `../webform/index?refid=${data.pendingActions[i].link}&_params=${btoa(unescape(encodeURIComponent(JSON.stringify(filters))))}&_mode=1&_locId=${store.get("Eb_Loc-" + this.TenantId + this.UserId)}`;
            html += `<li class="drp_item" style="border-bottom: 1px solid rgba(0,0,0,.15);"> 
                                <div class='pendingaction'>
                                    <a href="${url}" target="_blank">
                                        <div class='pending_action_inner'>
                                            <span>${data.pendingActions[i].description}</span>
                                            <span class='pending_date'>${data.pendingActions[i].createdDate}</span>
                                        </div>
                                    </a>
                                </div>
                            </li>`;
        }

        $("#pendingAction .Action_ul").append(html);

        if (data.pendingActions.length === 0) {
            let html1 = `<p class="no_pendingaction no_action">No Pending Action</p>`;
            $('.pendingactions').append(html1);
            $("#pendingAction .see_all_pendingaction").hide();
        }
        else {
            $('.no_pendingaction').detach();
            $("[href='#pendingAction']").append(`(${data.pendingActions.length})`);
        }
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
        if (x == 0) {
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
}