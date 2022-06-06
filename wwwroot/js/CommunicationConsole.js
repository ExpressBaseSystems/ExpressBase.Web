function CommunicationConsoleObject(options) {
    this.SMSObjs = options.SMSObj;
    this.EmailObjs = options.EmailObj;

    this.DrawTemplateSelectBox = function () {
        if (this.SMSObjs !== null) {
            let $Opt = $("<select class='form-control' id='select-sms-template'><option value = ''> Select Template </option></select>");
            $.each(this.SMSObjs, function (key, value) {
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
        }
        if (this.EmailObjs !== null) {
            let $Opt2 = $("<select class='form-control' id='select-email-template'><option value = ''> Select Template </option></select>");
            $.each(this.EmailObjs, function (key, value) {
                if (ebcontext.user.Roles.includes("SolutionOwner")) {
                    $Opt2.append(`<option value=${value[0].RefId}> ${value[0].DisplayName} </option>`);
                }
                else {
                    if (ebcontext.user.EbObjectIds.includes(value[0].Id)) {
                        $Opt2.append(`<option value=${value[0].RefId}> ${value[0].DisplayName} </option>`);
                    }
                }

            });
            $("#email-objs").append($Opt2);
        }

    };

    this.initComplete = function () {
        $("#list-of-sms").on("click", ".retryBtn", this.SmsLogRetry.bind(this));
    };

    this.getSmsList = function () {
        $("#eb_common_loader").EbLoader("show");
        let Refid = $("#select-sms-template").children("option:selected").val();
        let fromDate = $("#sms-from-date").val();
        let toDate = $("#sms-to-date").val();
        if (fromDate !== "" && toDate !== "" && Refid !== null) {
            $.ajax(
                {
                    type: 'POST',
                    url: "/CommunicationConsole/GetCommunicationConsoleData",
                    data: {
                        Refid: Refid,
                        FromDate: fromDate,
                        ToDate: toDate,
                        TableName: "eb_sms_logs"
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
                        o.Source = "smslog";
                        o.initCompleteCallback = this.initComplete.bind(this);
                        this.dataTable = new EbCommonDataTable(o);
                        $("#eb_common_loader").EbLoader("hide");
                    }.bind(this)
                });
        }
    };

    this.getEmailList = function () {
        $("#eb_common_loader").EbLoader("show");
        let Refid = $("#select-email-template").children("option:selected").val();
        let fromDate = $("#email-from-date").val();
        let toDate = $("#email-to-date").val();
        if (fromDate !== "" && toDate !== "" && Refid !== null) {
            $.ajax(
                {
                    type: 'POST',
                    url: "/CommunicationConsole/GetCommunicationConsoleData",
                    data: {
                        Refid: Refid,
                        FromDate: fromDate,
                        ToDate: toDate,
                        TableName: "eb_email_logs"
                    },
                    success: function (result) {
                        $("#list-of-email").empty();
                        $("#list-of-email").append(`<div id="content_tb2" class="wrapper-cont"><table id="tbl2" class="table display table-bordered compact"></table></div>`);
                        var o = new Object();
                        o.tableId = "tbl2";
                        o.showCheckboxColumn = false;
                        o.showFilterRow = true;
                        o.IsPaging = true;
                        o.dvObject = JSON.parse(result.visualization);
                        o.Source = "smslog";
                        o.initCompleteCallback = this.initComplete.bind(this);
                        this.dataTable = new EbCommonDataTable(o);
                        $("#eb_common_loader").EbLoader("hide");
                    }.bind(this)
                });
        }
    };


    this.SmsLogRetry = function (e) {
        let colindex = this.dataTable.columns.filter(dd => dd.name === "id")[0].data;
        let rowindex = $(e.target).closest("tr").index();
        let id = this.dataTable.unformatedData[rowindex][colindex];
        let Refid = $("#select-sms-template").children("option:selected").val();
        if (id) {
            $.ajax(
                {
                    type: 'POST',
                    url: "/CommunicationConsole/SmsRetry",
                    data: {
                        id: id,
                        RefId: Refid
                    },
                    success: function (result) {
                        $("#show-sms-logs").click();
                        alert("Resending SMS...");
                    }
                });
        }
    };

    this.currentDate = function () {
        var d = new Date();
        var month = d.getMonth() + 1;
        var day = d.getDate();
        var output = (day < 10 ? '0' : '') + day + '-' + (month < 10 ? '0' : '') + month + '-' + d.getFullYear();
        $(".date-cntrl").val(output);
    };

    this.init = function () {
        this.currentDate();
        this.DrawTemplateSelectBox();
        $("#show-sms-logs").on("click", this.getSmsList.bind(this));
        $("#show-email-logs").on("click", this.getEmailList.bind(this));
    };
    this.init();
}