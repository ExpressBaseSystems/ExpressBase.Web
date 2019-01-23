var scheduleO = function () {
    this.currentO = null;

    this.Init = function () {
        $('.sch_r').off('click').on('click', this.OpenSchedulerWindow.bind(this));
        $('#new_sch').off('click').on('click', this.OpenNewSchedulerWindow.bind(this));
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
        $('#del_sc').show();
    };
    this.OpenNewSchedulerWindow =function (e) {
        //  alert(e.target.parentElement.children);
        $('#SchedulerModal').modal('show');
        $('#sch-name').val("");
        $('#result').text("");
        $('#schedule').show();
        $('#edit_sch').hide();
        $('#del_sc').hide();
    };
    this.setUsersNGroups= function () {
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
    this.Init();
};