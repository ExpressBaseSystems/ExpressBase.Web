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


  this.SqljobRetry = function () {
            let id = e.target.getAttribute("id");
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
    };


    this.init = function () {
        this.DrawJobSelectBox();
        $("#list-of-jobs").on("click", this.SqljobRetry.bind(this));
        $("#show-sql-jobs").on("click", this.getJobsList.bind(this));
    };
    this.init();

}