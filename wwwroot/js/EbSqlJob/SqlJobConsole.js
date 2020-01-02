function sqljobconsole(options) {
    this.AllObj = options.AllObj;
    let chkObj = new Object();
    chkObj.data = null;
    chkObj.title = "Action";
    chkObj.orderable = false;
    chkObj.bVisible = true;
    chkObj.name = "action";
    chkObj.Type = 1;
    chkObj.render = renderButtonCol;

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
                        let cols = JSON.parse(result.sqlJobsDvColumns).$values;
                        cols.push(chkObj);
                        $("#list-of-jobs").empty();
                        $("#list-of-jobs").append(`<div id="content_tb1" class="wrapper-cont"><table id="tbl" class="table display table-bordered compact"></table></div>`);

                        var o = new Object();
                        o.tableId = "tbl";
                        o.datetimeformat = true;
                        //o.showFilterRow = false;
                        o.showSerialColumn = false;
                        o.showCheckboxColumn = false;
                        o.showFilterRow = false;
                        o.IsPaging = true;
                        //o.source = "inline";
                        //o.scrollHeight = "200px";
                        o.columns = cols;
                        o.data = result.sqlJobsRows;
                        var data = new EbBasicDataTable(o);
                    }
                });
        }
    };

    function renderButtonCol(data, type, row, meta) {
        if (data[4] === "S")
            return "";
        else
            return `<button class="retryBtn" id="${data[5]}">Retry</button>`
    };


    this.SqljobRetry = function (e) {
        let id = e.target.getAttribute("id");
        if (id) {
            $.ajax(
                {
                    type: 'POST',
                    url: "/SqlJob/JobRetry",
                    data: {
                        id: id
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

    };

    this.RunsqlJobTrigger = function () {
        let Refid = $("#select-sql-job").children("option:selected").val();
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
        $.post("../SqlJob/GetFilterBody", { dvobj: JSON.stringify(Obj), contextId: "paramdiv" }, this.AppendFD.bind(this));
    };


    this.AppendFD = function (result) {
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
    };

    this.init = function () {
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