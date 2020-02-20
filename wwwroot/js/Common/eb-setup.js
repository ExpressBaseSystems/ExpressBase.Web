class Setup {
    constructor(option) {
        this.option = {};

        $.extend(this.option, option);

        this.userNotification();
        this.GetNotificationFromDBForPageLoad()
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
                $('#notification-count').attr("style", "");
                $('#notification-count').html(len);
                $('.no_notification').detach();
            }
            $('#notification-count').attr("count", len);
            for (var i = 0; i < x.Notification.length; i++) {
                var height = Math.ceil((x.Notification[i].Title.length / 53)) * 20;
                html += `<li class="drp_item" style="border-bottom: 1px solid rgba(0,0,0,.15);"> 
                                <i class="fa fa-times notification-close" style="float: right;padding: 5px 10px 0px 0px;"></i>
                                <div notification-id = "${x.Notification[i].NotificationId}" link-url="${x.Notification[i].Link}" class="notification-update" >
                                    <p style="height: ${height}px;">${x.Notification[i].Title}</p>
                                    <h6 class="notification-duration" style="margin-top: 0px;">${x.Notification[i].Duration}</h6>
                                </div>
                            </li>`;
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
        var x = parseInt($('#notification-count').attr("count"))-1;
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
            data: { },
            success:
                this.CompleteNotificationDisplayFunc.bind(this)
        });
    }

    CompleteNotificationDisplayFunc = function (data) {
        var html = ``;
        html = html + `
                    <ul class="nav nav-tabs eb-styledTab" >
                          <li class="nav-item devdshtab active"> <a class="nav-link devdshtab" data-toggle="tab" role="tab" href="#notification" style="background: #f2f2f2;border: none;height: 35px;padding: 10px 15px;border-bottom: 1px solid #ddd;">Notifications</a></li>
                    </ul>
                    
                    <div class="tab-content">
                        <div id="notification" class="tab-pane active" role="tabpanel">
                            <ul class="drp_ul new_notifications" style="overflow: scroll;height: 100vh;padding: 2px;width: 350px;">
                    `;
       
        $('#notification-count').attr("count", data.notifications.length);
        for (var i = 0; i < data.notifications.length; i++) {
            var height = Math.ceil((data.notifications[i].title.length / 53)) * 20;
            html = html + `
                        <li class="drp_item" style="border-bottom: 1px solid rgba(0,0,0,.15);"> 
                                <i class="fa fa-times notification-close" style="float: right;padding: 5px 10px 0px 0px;"></i>
                                <div notification-id = "${data.notifications[i].notificationId}" link-url="${data.notifications[i].link}" class="notification-update" >
                                    <p style="height: ${height}px;">${data.notifications[i].title}</p>
                                    <h6 class="notification-duration" style="margin-top: 0px;">${data.notifications[i].duration}</h6>
                                </div>
                            </li>`;
        }
        html = html + `
                            </ul>
                        </div>
                        <div id="old" class="tab-pane" role="tabpanel">
                            <ul class="drp_ul old_notifications" style="overflow: scroll;height: 100vh;">
                    `;
        html = html + `
                            </ul>
                        </div>
                   </div>`;
        $('.notifications').empty();
        $('.notifications').append(html);
        if (data.notifications.length == 0) {
            $('#notification-count').attr("style", "background-color: transparent;border: 2px solid transparent;");
            var html1 = `<p class="no_notification">No Notifications</p>`;
            $('.new_notifications').append(html1);
        }
        else {
            $('#notification-count').attr("style", "");
            $('#notification-count').html(data.notifications.length);
            $('.no_notification').detach();
        }
        $('.notification-update').off("click").on('click', this.UpdateNotification.bind(this));
        $('.notification-close').off("click").on('click', this.CloseNotification.bind(this));
        $('#myTabs').on('click', '.nav-tabs a', function () {
            $(this).closest('.dropdown').addClass('dontClose');
        })
        
        $('#myDropDown').on('hide.bs.dropdown', function (e) {
            if ($(this).hasClass('dontClose')) {
                e.preventDefault();
            }
            $(this).removeClass('dontClose');
        });

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
        $('#myDropDown').addClass("open");
        e.stopPropagation();
    }
}