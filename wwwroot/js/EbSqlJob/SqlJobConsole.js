function sqljobconsole(options) {
    this.AllObj = options.AllObj;

    this.DrawJobSelectBox = function () {
        let $Opt = $("<select class='form-control' id='select-sql-job'> </select>");
        $.each(this.AllObj, function (key, value) {
            if (ebcontext.user.Roles.indexOf("SolutionOwner") === 0) {
                $Opt.append(`<option value=${value[0].RefId}> ${value[0].DisplayName} </option>`);
            }
            else {
                if (ebcontext.user.EbObjectIds.indexOf(value[0].Id) === 0) {
                    $Opt.append(`<option value=${value[0].RefId}> ${value[0].DisplayName} </option>`);
                }
            }

        });
        $("#sql-job-objs").append($Opt);
    };


    this.getJobsList = function () {
        $("#layout_div").append(`<div class="loader-fb"><div class="lds-facebook center-tag-fb"><div></div><div></div><div></div></div></div>`);
        let Refid = $("#select-sql-job").children("option:selected").val();
        let date = $("#date").val();
        if (date !== "" && Refid !== null) {
            $.ajax(
                {
                    type: 'POST',
                    url: "/SqlJob/Get_Jobs_List",
                    data: {
                        Refid: Refid,
                        Date: date
                    },
                    success: function (result) {
                            $("#list-of-jobs").empty();
                            $("#list-of-jobs").append(`<div id="content_tb1" class="wrapper-cont"><table id="tbl" class="table display table-bordered compact"></table></div>`);
                            var o = new Object();
                            o.tableId = "tbl";
                            o.showCheckboxColumn = false;
                            o.showFilterRow = true;
                            o.IsPaging = true;
                            o.dvObject = JSON.parse(result.visualization);
                            o.Source = "sqljob";
                            var data = new EbCommonDataTable(o);
                        $("#layout_div .loader-fb").empty().removeClass("loader-fb");
                    }
                });
        }
    };

    function renderButtonCol(data, type, row, meta) {
        if (row[row.length - 5] === "Success")
            return "";
        else
            return `<button class="retryBtn" id="${row[row.length - 4]}">Retry</button>`
    };


    this.SqljobRetry = function (e) {
        let Refid = $("#select-sql-job").children("option:selected").val();
        let id = e.target.getAttribute("id");
        if (id) {
            $.ajax(
                {
                    type: 'POST',
                    url: "/SqlJob/JobRetry",
                    data: {
                        id: id,
                        RefId: Refid
                    },
                    success: function (result) {
                        $("#show-sql-jobs").click();
                    }
                });
        }
    };

    this.RunsqlJobFunction = function () {
        let Refid = $("#select-sql-job").children("option:selected").val();
        if (Refid !== null) {
            $.ajax(
                {
                    type: 'POST',
                    url: "/SqlJob/ExecuteSqlJob",
                    data: {
                        Refid: Refid,
                        Param: this.filtervalues,
                    },
                    success: function (result) {
                        alert(result);
                    }
                });
        }
    };

    this.ScheduleSqlJobFunction = function () {
        $.post("/Scheduler/Schedule",
            {
                "name": $('#sch-name').val(),
                "expression": $('#result').text(),
                "objId": $("#select-sql-job").children("option:selected").val().split("-")[3],
                "type": 5, 
                "cronstring": JSON.stringify(EbCron)  
            },
            function () { });
    };

    this.RunsqlJobTrigger = function () {
        let Refid = $("#select-sql-job").children("option:selected").val();
        $("#sql-job-param").empty().append(`<div class="lds-facebook"><div></div><div></div><div></div></div>`);
        if (Refid !== null) {
            $.ajax(
                {
                    type: 'POST',
                    url: "/SqlJob/GetSqljobObject",
                    data: {
                        Refid: Refid,
                    },
                    success: this.RunsqlJobTriggerAjaxSuccess.bind(this)
                });
        }
    };
    this.RunsqlJobTriggerAjaxSuccess = function (data) {
        //$("#sql-job-param").empty();
        this.Obj = JSON.parse(data);
        if (this.Obj.Filter_Dialogue) {
            this.getColumns(this.Obj);
        }
        else {
            this.filtervalues = null;
            this.RunsqlJobFunction();
        }
    }

    this.getColumns = function (Obj) {
        $.post("../SqlJob/GetFilterBody", { dvobj: JSON.stringify(Obj), contextId: "paramdiv" }, this.filterDialogLoader.bind(this));
    };

    this.filterDialogLoader = function (result) {
        setTimeout(function () { this.AppendFD(result); }.bind(this), 1500);
    };

    this.AppendFD = function (result) {
        $("#sql-job-param").empty();
        $('.param-div-cont').remove();
        $("#sql-job-param").prepend(`
                <div id='paramdiv-Cont${this.TabNum}' class='param-div-cont'>
                <div id='paramdiv${this.TabNum}' class='param-div fd'>
                    <div class='pgHead'>
                        <h6 class='smallfont' style='font-size: 12px;display:inline'>Parameter Window</h6>
                    </div>
                    </div>
                    </div>
                `);

        $('#paramdiv' + this.TabNum).append(result);
        $("#btnGo").off("click").on("click", this.GetFilterValues.bind(this));
        if (typeof FilterDialog !== "undefined") {
            $(".param-div-cont").show();
            this.stickBtn = new EbStickButton({
                $wraper: $(".param-div-cont"),
                $extCont: $(".param-div-cont"),
                icon: "fa-filter",
                dir: "left",
                label: "Parameters",
                style: { top: "230px" }
            });
            this.filterDialog = FilterDialog;
        }
        else {
            $(".param-div-cont").hide();
            this.filterDialog = null;
        }
    };

    this.GetFilterValues = function () {
        this.filtervalues = [];

        if (this.filterDialog)
            this.filtervalues = getValsForViz(this.filterDialog.FormObj);

        let temp = $.grep(this.filtervalues, function (obj) { return obj.Name === "eb_loc_id"; });
        if (temp.length === 0)
            this.filtervalues.push(new fltr_obj(11, "eb_loc_id", store.get("Eb_Loc-" + ebcontext.sid + ebcontext.user.UserId)));
        temp = $.grep(this.filtervalues, function (obj) { return obj.Name === "eb_currentuser_id"; });

        if (temp.length === 0)
            this.filtervalues.push(new fltr_obj(11, "eb_currentuser_id", ebcontext.user.UserId));
        this.RunsqlJobFunction();
    };

    this.ScheduleJob = function () {
        let Refid = $("#select-sql-job").children("option:selected").val();
        this.objid = Refid.split("-");
        $.post("../SqlJob/GetScheduleVc", { ObjId: this.objid[3] }, this.AppendScheduler.bind(this));
    };

    this.AppendScheduler = function (result) {
        $("#show-scheduler").empty().append(result);
        $('#schedulerlistmodal').modal('show');
        $("#schedule").attr("id", "schedule-sql-job");
        $("#schedule-sql-job").off("click").on("click", this.ScheduleSqlJobFunction.bind(this));
        $("#SchedulerModal .modal-body .scheduler").removeClass("col-md-5");
    };
    this.currentDate = function () {
        var d = new Date();
        var month = d.getMonth() + 1;
        var day = d.getDate();
        var output = (day < 10 ? '0' : '') + day + '-' + (month < 10 ? '0' : '') + month + '-' + d.getFullYear();
        $("#date").val(output);
    };
    this.init = function () {
        this.currentDate();
        this.DrawJobSelectBox();
        $("#list-of-jobs").on("click", ".retryBtn", this.SqljobRetry.bind(this));
        $("#show-sql-jobs").on("click", this.getJobsList.bind(this));
        $("#run-sql-job").on("click", this.RunsqlJobTrigger.bind(this));
        $("#schedule-sql-job").on("click", this.ScheduleSqlJobFunction.bind(this));
        $("#schedule-job").on("click", this.ScheduleJob.bind(this));
        $("#btnGo").off("click").on("click", this.GetFilterValues.bind(this));
    };
    this.init();

}