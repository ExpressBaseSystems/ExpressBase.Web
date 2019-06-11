var scheduleO = function (taskType) {
    this.currentO = null;

    this.Init = function () {
        $('.sch_r').off('click').on('click', this.OpenSchedulerWindow.bind(this));
        $('#new_sch').off('click').on('click', this.OpenNewSchedulerWindow.bind(this));
        $('#schedule').off('click').on('click', this.Schedule.bind(this));
        $('#edit_sch').off('click').on('click', this.EditSchedule.bind(this));
        $('#del_sch').off('click').on('click', this.DeleteSchedule.bind(this));
    };
    this.OpenSchedulerWindow = function (e) {
        var currentOId = $(e.target.parentElement).attr('slno');
        this.currentO = window.Schedule[currentOId];
        $('#SchedulerModal').modal('show');
        $('#sch-name').val(this.currentO.Task.Name);
        $('#result').text(this.currentO.Task.Expression);
        this.setUsersNGroups();
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
    };
    this.setUsersNGroups = function () {
        $('.user').prop('checked', false);
        arr_u = (this.currentO.Task.JobArgs.ToUserIds === null) ? "" : this.currentO.Task.JobArgs.ToUserIds.split(',');
        if (arr_u !== "") {
            for (i = 0; i < arr_u.length; i++) {
                $(".user:checkbox[value=" + arr_u[i] + "]").prop("checked", "true");
            }
        }

        $('.usergrp').prop('checked', false);
        arr_ug = (window.Schedule[0].Task.JobArgs.ToUserGroupIds === null) ? "" : window.Schedule[0].Task.JobArgs.ToUserGroupIds.split(',');
        if (arr_ug !== "") {
            for (i = 0; i < arr_ug.length; i++) {
                $(".usergrp:checkbox[value=" + arr_ug[i] + "]").prop("checked", "true");
            }
        }
    };

    this.Schedule = function () {
        $.post("../Scheduler/Schedule", {
            "name": $('#sch-name').val(),
            "expression": $('#result').text(),
            "objId": window.location.search.split("&")[0].split("=")[1],
            "type": taskType,
            "users": this.getUsers(),
            "groups": this.getUserGroups(),
            "cronstring": JSON.stringify(EbCron)
        }, function () {
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
        var checkedValue = "";
        var inputElements = $('.user:checked');
        for (var i = 0; inputElements[i]; ++i) {
            if (inputElements[i].checked) {
                checkedValue = checkedValue + "," + inputElements[i].value;
            }
        }
        return checkedValue.substring(1, checkedValue.length);
    };

    this.getUserGroups = function () {
        var checkedValue = "";
        var inputElements = $('.usergrp:checked');
        for (var i = 0; inputElements[i]; ++i) {
            if (inputElements[i].checked) {
                checkedValue = checkedValue + "," + inputElements[i].value;
            }
        }
        return checkedValue.substring(1, checkedValue.length);
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