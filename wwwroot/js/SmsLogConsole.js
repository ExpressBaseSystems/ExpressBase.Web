function smslogconsole(options) {
    this.AllObj = options.AllObj;

    this.DrawSmsTemplateSelectBox = function () {
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

    this.initComplete = function () {
        $("#list-of-sms").on("click", ".retryBtn", this.SmsLogRetry.bind(this));
    };
       
    this.getSmsList = function () {
        $("#layout_div").append(`<div class="loader-fb"><div class="lds-facebook center-tag-fb"><div></div><div></div><div></div></div></div>`);
        let Refid = $("#select-sms-template").children("option:selected").val();
        let fromDate = $("#from-date").val();
        let toDate = $("#to-date").val();
        if (fromDate !== "" && toDate !== "" && Refid !== null) {
            $.ajax(
                {
                    type: 'POST',
                    url: "/SMSLog/Get_SMS_List",
                    data: {
                        Refid: Refid,
                        FromDate: fromDate,
                        ToDate: toDate
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
                        $("#layout_div .loader-fb").empty().removeClass("loader-fb");
                    }.bind(this)
                });
        }
    };

    this.SmsLogRetry = function (e) {
        let colindex = this.dataTable.columns.filter(dd => dd.name === "id")[0].data;
        let rowindex = $(e.target).closest("tr").index();
        let hhhh = this.dataTable.unformatedData[rowindex][colindex];
        alert(hhhh);
        let Refid = $("#select-sms-template").children("option:selected").val();
        let id = e.target.getAttribute("id");
        if (id) {
            $.ajax(
                {
                    type: 'POST',
                    url: "/SMSLog/SmsRetry",
                    data: {
                        id: id,
                        RefId: Refid
                    },
                    success: function (result) {
                        $("#show-sms-logs").click();
                    }
                });
        }
    };

    this.currentDate = function () {
        var d = new Date();
        var month = d.getMonth() + 1;
        var day = d.getDate();
        var output = (day < 10 ? '0' : '') + day + '-' + (month < 10 ? '0' : '') + month + '-' + d.getFullYear();
        $("#from-date").val(output);
        $("#to-date").val(output);
    };   

    this.init = function () {
        this.currentDate();
        this.DrawSmsTemplateSelectBox();       
        $("#show-sms-logs").on("click", this.getSmsList.bind(this));       
    };
    this.init();
}