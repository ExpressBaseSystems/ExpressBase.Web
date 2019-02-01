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
    };

    this.OpenNewSchedulerWindow = function (e) {
        //  alert(e.target.parentElement.children);
        $('#SchedulerModal').modal('show');
        $('#sch-name').val("");
        $('#result').text("");
        $('#schedule').show();
        $('#edit_sch').hide();
        $('#del_sch').hide();
    };

    this.setUsersNGroups = function () {
        arr_u = (this.currentO.Task.JobArgs.ToUserIds === null) ? "" : this.currentO.Task.JobArgs.ToUserIds.split(',');
        if (arr_u !== "") {
            for (i = 0; i < arr_u.length; i++) {
                $(".user:checkbox[value=" + arr_u[i] + "]").prop("checked", "true");
            }
        }

        arr_ug = (window.Schedule[0].Task.JobArgs.ToUserGroupIds === null) ? "" : window.Schedule[0].Task.JobArgs.ToUserGroupIds.split(',');
        if (arr_ug !== "") {
            for (i = 0; i < arr_ug.length; i++) {
                $(".user:checkbox[value=" + arr_ug[i] + "]").prop("checked", "true");
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
            "groups": this.getUserGroups()
        }, function () {
        }
        );
    };

    this.EditSchedule = function () {
        this.currentO.Task.Name = $('#sch-name').val();
        this.currentO.Task.Expression = $('#result').text();
        this.currentO.Task.JobArgs.ToUserIds = this.getUsers();
        this.currentO.Task.JobArgs.ToUserGroupIds = this.getUserGroups();
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
        },function () {
            });
    };

    this.Init();
};