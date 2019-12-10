var scheduleO = function (taskType, userlist, usergroup) {
    this.currentO = null;
    this.userlist = userlist;
    this.usergroup = usergroup;
    this.schedules = window.Schedule;
    var delMechanism = null;
    var type;
    var Alluserlist = null;
    var Allgrouplist = null;

    this.Init = function () {
        $('.sch_r').off('click').on('click', this.OpenSchedulerWindow.bind(this));
        $('#new_sch').off('click').on('click', this.OpenNewSchedulerWindow.bind(this));
        $('#schedule').off('click').on('click', this.Schedule.bind(this));
        $('#SendNow').off('click').on('click', this.ScheduleNow.bind(this));
        $('#edit_sch').off('click').on('click', this.EditSchedule.bind(this));
        $('#del_sch').off('click').on('click', this.DeleteSchedule.bind(this));

        //this.drawList();

        //$('.DeliveryMechanismCheckbox').on('click', this.UserGroupMaker.bind(this));
        //$('.nav-stacked').on('change', this.UserGroupMaker.bind(this))
        $('.nav-stacked').click(function (e) {
            e.preventDefault()
            $(this).tab('show')
            type = e.target.name;
            this.UserGroupMaker();
        }.bind(this));
    };


    window.EbCron = {};
    $('.non-rec').hide();
    $('#cron').cronBuilder({
        onChange: function (expression) {
            $('#result').text(expression);
        }
    });

    $('#datetimepicker').datetimepicker({
        format: 'm/d/Y H:i ',
        onChangeDateTime: function (dp, $input) {
            var expression = "0 "; //Seconds
            expression = expression + dp.getMinutes() + " "; //Minutes
            expression = expression + dp.getHours() + " "; //Hours
            expression = expression + dp.getDate() + " "; //Day - of - Month
            expression = expression + parseInt(dp.getMonth() + 1) + " "; //Month
            expression = expression + " ? "; //Day - of - Week
            expression = expression + dp.getFullYear(); //Year(optional field)
            $('#result').text(expression);
            EbCron = {
                Type: 'nonreccur',
                DatTimeestring: dp
            };

        }
    });

    $('input[type=radio][name=sch-type]').change(function () {
        if (this.value === 'reccur') {
            $('.recur').show();
            $('.non-rec').hide();
        }
        else if (this.value === 'nonreccur') {
            $('.recur').hide();
            $('.non-rec').show();
        }
    });

    this.drawList = function () {
        let $dragHtml = $(`  <tr id="tr_${counter}" class="sch_r" slno="${counter}">
            <td class="">${(counter + 1)}</td>
            <td class="Name">${Schedule[sch].Name}</td>
            <td class="expression">${Schedule[sch].Task.Expression}</td>
            <td class="createdat">${Schedule[sch].CreatedAt}</td>
            <td class="createdby">${Schedule[sch].CreatedBy}</td>
            <td class="status">${Schedule[sch].Status}</td>
        </tr>`);
        $("#sch_list").append($dragHtml);
    };

    this.UserGroupMaker = function () {
        DM = type;
        if (DM == 'sms' || DM == 'email') {
            if (DM == 'sms') {
                delMechanism = 2;
            } else {
                delMechanism = 1;
            }
            //this.DrawUserWindow(userlist);
            //this.DrawUserGroupWindow(usergroup);
        }
        else if (DM == 'slack') {
            //$.ajax({
            //    type: 'POST',
            //    url: "../Scheduler/GetUser_Group",
            //    beforeSend: function () { }
            //}).done(function (data) { 
            //    var temp = JSON.parse(data)
            //    this.userlist = temp.Users;
            //    this.usergroup = temp.UserGroups;
            //    this.DrawSlackUserWindow(temp.Users);
            //    this.DrawSlackUserGroupWindow(temp.UserGroups);

            //}.bind(this));
            delMechanism = 3;
        }
    }.bind(this);


    this.DrawUserWindow = function (user_list) {
        $(".user-common-all").empty();
        for (var user in user_list) {
            let $dragHtml = $(`<div class="form-check form-check-inline user-line">
                                        <input class="form-check-input user" type="checkbox" id="${user}" value="${user}">
                                        <label class="form-check-label" for="inlineCheckbox1">${user_list[user]}</label>
                                    </div>`);
            $(".user-common-all").append($dragHtml);
        }
    };
    this.DrawUserGroupWindow = function (usergroup) {
        $(".usergroup-common-all").empty();
        for (var user in usergroup) {
            let $dragHtml = $(`<div class="form-check form-check-inline user-line">
                                        <input class="form-check-input usergrp" type="checkbox" id="${user}" value="${user}">
                                        <label class="form-check-label" for="inlineCheckbox1">${usergroup[user]}</label>
                                    </div>`);
            $(".usergroup-common-all").append($dragHtml);
        }
    };

    this.OpenSchedulerWindow = function (e) {
        var currentOId = $(e.target.parentElement).attr('slno');
        this.currentO = window.Schedule[currentOId];
        $('#SchedulerModal').modal('show');
        $('#sch-name').val(this.currentO.Task.Name);
        $('#result').text(this.currentO.Task.Expression);
        this.setUsers_Groups_Message();
        $('#edit_sch').show();
        $('#schedule').hide();
        $('#del_sch').show();
        this.MarkSchedulePeriod();
    };

    this.OpenNewSchedulerWindow = function (e) {
        //  alert(e.target.parentElement.children);
        $('#SchedulerModal').modal('show');
        this.clearWindow();
    };
    this.clearWindow = function () {
        $('#sch-name').val("");
        $('#result').text("");
        $('#schedule').show();
        $('#edit_sch').hide();
        $('#del_sch').hide();
        $('.user:checkbox').removeAttr('checked');
        $('.usergrp:checkbox').removeAttr('checked');
        $('#datetimepicker').val("");
        $('.Message').val("");
    };
    this.setUsers_Groups_Message = function () {
        $('.email_user').prop('checked', false);
        $('.SMS_user').prop('checked', false);
        $('.Slack_user').prop('checked', false);
        var users = JSON.parse(this.currentO.Task.JobArgs.ToUserIds);
        arr_u = (users.EmailUser === "") ? "" : users.EmailUser.split(',');
        if (arr_u !== "") {
            for (i = 0; i < arr_u.length; i++) {
                $(".email_user:checkbox[value=" + arr_u[i] + "]").prop("checked", "true");
            }
        }
        arr_u = (users.SMSUser === "") ? "" : users.SMSUser.split(',');
        if (arr_u !== "") {
            for (i = 0; i < arr_u.length; i++) {
                $(".SMS_user:checkbox[value=" + arr_u[i] + "]").prop("checked", "true");
            }
        }
        arr_u = (users.SlackUser === "") ? "" : users.SlackUser.split(',');
        if (arr_u !== "") {
            for (i = 0; i < arr_u.length; i++) {
                $(".Slack_user:checkbox[value=" + arr_u[i] + "]").prop("checked", "true");
            }
        }

        $('.Email_usergrp').prop('checked', false);
        $('.SMS_usergrp').prop('checked', false);
        $('.Slack_usergrp').prop('checked', false);
        var usergroups = JSON.parse(this.currentO.Task.JobArgs.ToUserGroupIds);
        arr_ug = (usergroups.EmailGroup === "") ? "" : usergroups.EmailGroup.split(',');
        if (arr_ug !== "") {
            for (i = 0; i < arr_ug.length; i++) {
                $(".Email_usergrp:checkbox[value=" + arr_ug[i] + "]").prop("checked", "true");
            }
        }
        arr_ug = (usergroups.SMSGroup === "") ? "" : usergroups.SMSGroup.split(',');
        if (arr_ug !== "") {
            for (i = 0; i < arr_ug.length; i++) {
                $(".SMS_usergrp:checkbox[value=" + arr_ug[i] + "]").prop("checked", "true");
            }
        }
        arr_ug = (usergroups.SlackGroup === "") ? "" : usergroups.SlackGroup.split(',');
        if (arr_ug !== "") {
            for (i = 0; i < arr_ug.length; i++) {
                $(".Slack_usergrp:checkbox[value=" + arr_ug[i] + "]").prop("checked", "true");
            }
        }

        var Messages = JSON.parse(this.currentO.Task.JobArgs.Message);
        $('#sch_email_Message').val(Messages.EmailMessage);
        $('#sch_sms_Message').val(Messages.SMSMessage);
        $('#sch_slack_Message').val(Messages.SlackMessage);
    };

    this.Schedule = function () {
        this.getUsers();
        this.getUserGroups();
        var AllDelMessage = { EmailMessage: $('#sch_email_Message').val(), SMSMessage: $('#sch_sms_Message').val(), SlackMessage: $('#sch_slack_Message').val() }
        $.post("../Scheduler/Schedule", {
            "name": $('#sch-name').val(),
            "expression": $('#result').text(),
            "objId": window.location.search.split("&")[0].split("=")[1],
            "type": taskType,
            "users": JSON.stringify(Alluserlist),
            "groups": JSON.stringify(Allgrouplist),
            "cronstring": JSON.stringify(EbCron),
            "message": JSON.stringify(AllDelMessage),
            "_delMechanism": delMechanism
        }, function () {
            $.post("../Scheduler/SchedulelistCall", { "obj": window.location.search.split("&")[0].split("=")[1] }, function () { });
        }
        );
    }

    this.ScheduleNow = function () {
        //dp = Mon Nov 25 2019 13:00:37 GMT+0530 (India Standard Time)
        var utc = new Date();
        //var utc = new Date(dNow.getTime() + dNow.getTimezoneOffset() * 60000)
        var utcdate = ('0 ' + parseInt(utc.getMinutes() + 1) + ' ' + utc.getHours() + ' ' + utc.getDate() + ' ' + parseInt(utc.getMonth() + 1) + ' ? ' + utc.getFullYear());
        //"0 0 13 25 11 ? 2019"
        $('#result').text(utcdate);
        this.getUsers();
        this.getUserGroups();
        var AllDelMessage = { EmailMessage: $('#sch_email_Message').val(), SMSMessage: $('#sch_sms_Message').val(), SlackMessage: $('#sch_slack_Message').val() }
        EbCron = {
            Type: 'nonreccur',
            DatTimeestring: utc
        };
        $.post("../Scheduler/Schedule", {
            "name": $('#sch-name').val(),
            "expression": $('#result').text(),
            "objId": window.location.search.split("&")[0].split("=")[1],
            "type": taskType,
            "users": JSON.stringify(Alluserlist),
            "groups": JSON.stringify(Allgrouplist),
            "cronstring": JSON.stringify(EbCron),
            "message": JSON.stringify(AllDelMessage),
            "_delMechanism": delMechanism
        }, function () {
            $.post("../Scheduler/SchedulelistCall", { "obj": window.location.search.split("&")[0].split("=")[1] }, function () { });
        }
        );

    };

    this.EditSchedule = function () {
        this.currentO.Task.Name = $('#sch-name').val();
        this.currentO.Task.Expression = $('#result').text();
        this.currentO.Task.JobArgs.ToUserIds = this.getUsers();
        this.currentO.Task.JobArgs.ToUserGroupIds = this.getUserGroups();
        this.currentO.Task.CronString = JSON.stringify(EbCron);
        $.post("../Scheduler/UpdateSchedule", {
            "triggerkey": this.currentO.TriggerKey,
            "jobkey": this.currentO.JobKey,
            "task": this.currentO.Task,
            "id": this.currentO.Id
        }, function () {
        }
        );
    };

    this.getUsers = function () {
        var EmailcheckedValue = [];
        var inputElements = $('.email_user:checked');
        for (var i = 0; i < inputElements.length; i++) {
            EmailcheckedValue.push(inputElements[i].value);
        }
        EmailcheckedValue = EmailcheckedValue.join(",");

        var SMScheckedValue = [];
        var inputElements = $('.SMS_user:checked');
        for (var i = 0; i < inputElements.length; ++i) {
            SMScheckedValue.push(inputElements[i].value);
        }
        SMScheckedValue = SMScheckedValue.join(",");

        var SlackcheckedValue = [];
        var inputElements = $('.Slack_user:checked');
        for (var i = 0; inputElements[i]; ++i) {
            SlackcheckedValue.push(inputElements[i].value);
        }
        SlackcheckedValue = SlackcheckedValue.join(",");

        Alluserlist = { EmailUser: EmailcheckedValue, SMSUser: SMScheckedValue, SlackUser: SlackcheckedValue }

        //return checkedValue.substring(1, checkedValue.length);
    };

    this.getUserGroups = function () {
        var Email_Group_checkedValue = [];
        var inputElements = $('.Email_usergrp:checked');
        for (var i = 0; inputElements[i]; ++i) {
            Email_Group_checkedValue.push(inputElements[i].value);
        }
        Email_Group_checkedValue = Email_Group_checkedValue.join(",");


        var SMS_Group_checkedValue = [];
        var inputElements = $('.SMS_usergrp:checked');
        for (var i = 0; inputElements[i]; ++i) {
            SMS_Group_checkedValue.push(inputElements[i].value);
        }
        SMS_Group_checkedValue = SMS_Group_checkedValue.join(",");

        var Slack_Group_checkedValue = [];
        var inputElements = $('.Slack_usergrp:checked');
        for (var i = 0; inputElements[i]; ++i) {
            Slack_Group_checkedValue.push(inputElements[i].value);
        }
        Slack_Group_checkedValue = Slack_Group_checkedValue.join(",");

        //return checkedValue.substring(1, checkedValue.length);
        Allgrouplist = { EmailGroup: Email_Group_checkedValue, SMSGroup: SMS_Group_checkedValue, SlackGroup: Slack_Group_checkedValue }
    };



    this.DeleteSchedule = function () {
        $.post("../Scheduler/DeleteJob", {
            "jobkey": window.Schedule[0].JobKey,
            "id": window.Schedule[0].Id
        }, function () {
        });
    };

    this.MarkSchedulePeriod = function () {
        let CronMap = JSON.parse(this.currentO.Task.CronString);
        let elm = $('#cron');
        if (CronMap.Type === "reccur") {
            $("input[name=sch-type][value='reccur']").prop("checked", true);
            $("input[name=sch-type][value='reccur']").trigger("change");
            elm.find("select.cron-period-select").val(CronMap.period);
            elm.find("select.cron-period-select").trigger("change");
            elm.find("select.cron-clock-minute").val(CronMap.min);
            elm.find("select.cron-clock-hour").val(CronMap.hour);

            switch (CronMap.period) {
                case 'Daily':
                    var $_sel = elm.find("div.cron-daily");
                    $_sel.find("input[name=dailyType][value=" + CronMap.periodObj.Type + "]").prop("checked", true);
                    $_sel.find("select.cron-daily-select").val(CronMap.periodObj.Days);
                    break;
                case 'Weekly':
                    $_sel = elm.find("div.cron-weekly");
                    for (i = 0; i < CronMap.periodObj.length; i++) {
                        if (CronMap.periodObj[i] === "MON")
                            $_sel.find("input[name=dayOfWeekMon]").prop('checked', true);
                        if (CronMap.periodObj[i] === "TUE")
                            $_sel.find("input[name=dayOfWeekTue]").prop('checked', true);
                        if (CronMap.periodObj[i] === "WED")
                            $_sel.find("input[name=dayOfWeekWed]").prop('checked', true);
                        if (CronMap.periodObj[i] === "THU")
                            $_sel.find("input[name=dayOfWeekThu]").prop('checked', true);
                        if (CronMap.periodObj[i] === "FRI")
                            $_sel.find("input[name=dayOfWeekFri]").prop('checked', true);
                        if (CronMap.periodObj[i] === "SAT")
                            $_sel.find("input[name=dayOfWeekSat]").prop('checked', true);
                        if (CronMap.periodObj[i] === "SUN")
                            $_sel.find("input[name=dayOfWeekSun]").prop('checked', true);
                    }
                    break;
                case 'Monthly':
                    $_sel = elm.find("div.cron-monthly");
                    $_sel.find("input[name=monthlyType][value=" + CronMap.periodObj.Type + "]").prop("checked", true);
                    if (CronMap.periodObj.Type === "byDay") {
                        $_sel.find("select.cron-monthly-month").val(CronMap.periodObj.nMonth);
                        $_sel.find("select.cron-monthly-day").val(CronMap.periodObj.DayOfMonth);
                    }
                    else {
                        $_sel.find("select.cron-monthly-day-of-week").val(CronMap.periodObj.DayOfWeek);
                        $_sel.find("select.cron-monthly-nth-day").val(CronMap.periodObj.DayOfMonth);
                        $_sel.find("select.cron-monthly-month-by-week").val(CronMap.periodObj.MonthByWeek);
                    }
                    break;
                case 'Yearly':
                    $_sel = elm.find("div.cron-yearly");
                    $_sel.find("input[name=yearlyType][value=" + CronMap.periodObj.Type + "]").prop("checked", true);
                    if (CronMap.periodObj.Type === "byDay") {
                        $_sel.find("select.cron-yearly-day").val(CronMap.periodObj.DayOfYear);
                        $_sel.find("select.cron-yearly-month").val(CronMap.periodObj.MonthOfYear);
                    }
                    else {
                        $_sel.find("select.cron-yearly-day-of-week").val(CronMap.periodObj.DayOfWeek),
                            $_sel.find("select.cron-yearly-nth-day").val(CronMap.periodObj.nDay),
                            $_sel.find("select.cron-yearly-month-by-week").val(CronMap.periodObj.Month)
                    }
                    break;
            }
        }
        else {
            $("input[name=sch-type][value='nonreccur']").prop("checked", true);
            $("input[name=sch-type][value='nonreccur']").trigger("change");
            $('#datetimepicker').val(new Date(CronMap.DatTimeestring).toLocaleString());
        }
    };
    this.Init();
};