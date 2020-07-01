function smslogconsole(options) {
    this.AllObj = options.AllObj;

    this.DrawJobSelectBox = function () {
        let $Opt = $("<select class='form-control' id='select-sms-template'> </select>");
        $.each(this.AllObj, function (key, value) {
            if (ebcontext.user.Roles.includes("SolutionOwner")) {
                $Opt.append(`<option value=${value[0].RefId}> ${value[0].DisplayName} </option>`);
            }
            else {
                if (ebcontext.user.EbObjectIds.includes(value[0].Id)) {
                    $Opt.append(`<option value=${value[0].RefId}> ${value[0].DisplayName} </option>`);
                }
            }

        });
        $("#sms-objs").append($Opt);
    };

    this.getSmsList = function () {
        $("#layout_div").append(`<div class="loader-fb"><div class="lds-facebook center-tag-fb"><div></div><div></div><div></div></div></div>`);
        let Refid = $("#select-sms-template").children("option:selected").val();
        let date = $("#date").val();
        if (date !== "" && Refid !== null) {
            $.ajax(
                {
                    type: 'POST',
                    url: "/SMS/Get_SMS_List",
                    data: {
                        Refid: Refid,
                        Date: date
                    },
                    success: function (result) {
                        $("#list-of-sms").empty();
                        $("#list-of-sms").append(`<div id="content_tb1" class="wrapper-cont"><table id="tbl" class="table display table-bordered compact"></table></div>`);
                        var o = new Object();
                        o.tableId = "tbl";
                        o.showCheckboxColumn = false;
                        o.showFilterRow = true;
                        o.IsPaging = true;
                        o.dvObject = JSON.parse(result.visualization);
                        o.Source = "sms";
                        var data = new EbCommonDataTable(o);
                        $("#layout_div .loader-fb").empty().removeClass("loader-fb");
                    }
                });
        }
    };

    function renderButtonCol(data, type, row, meta) {
        if (row[row.length - 7] === "success")
            return "";
        else
            return `<button class="retryBtn" id="${row[row.length - 4]}">Retry</button>`
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
       // $("#list-of-sms").on("click", ".retryBtn", this.SqljobRetry.bind(this));
        $("#show-sms-logs").on("click", this.getSmsList.bind(this));
      //  $("#run-sql-job").on("click", this.RunsqlJobTrigger.bind(this));
        //$("#schedule-sql-job").on("click", this.ScheduleSqlJobFunction.bind(this));
       // $("#schedule-job").on("click", this.ScheduleJob.bind(this));
       // $("#btnGo").off("click").on("click", this.GetFilterValues.bind(this));
    };
    this.init();
}