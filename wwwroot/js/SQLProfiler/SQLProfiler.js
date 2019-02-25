const SQLProfiler = function (logsObj) {
    //this.profiler = profiler;
    this.logsObj = logsObj;

    this.onLabel1_click = function () {
        let $e = $(event.target).closest(".tiles");
        let idx = $e.attr("idx");
        this.removeSelected($e, idx);
        $(".rows").css({ background: "white" });
        $("#paramsalert").show();
        document.getElementById("paramsalert").innerHTML = "";
        $(".wraper1_drhome").css({ width: "50%", });
        this.getParams(idx);
    }

    this.onLabel2_click = function () {
        let $e = $(event.target).closest(".tiles");
        let idx = $e.attr("idx");
        this.removeSelected($e, idx);
        $(".rows").css({ background: "white" });
        $("#paramsalert").show();
        document.getElementById("paramsalert").innerHTML = "";
        $(".wraper1_drhome").css({ width: "50%", });
        this.getParams(idx);
    }.bind(this);

    this.onLabel3_click = function () {
        let $e = $(event.target).closest(".tiles");
        let idx = $e.attr("idx");
        this.removeSelected($e, idx);
        $(".rows").css({ background: "white" });
        $("#paramsalert").show();
        document.getElementById("paramsalert").innerHTML = "";
        $(".wraper1_drhome").css({ width: "50%", });
        this.getParams(idx);
    }.bind(this);

    this.onLabel4_click = function () {
        let $e = $(event.target).closest(".tiles");
        let idx = $e.attr("idx");
        this.removeSelected($e, idx);
        $(".rows").css({ background: "white" });
        $("#paramsalert").show();
        document.getElementById("paramsalert").innerHTML = "";
        $(".wraper1_drhome").css({ width: "50%", });
        this.getParams(idx);
    }.bind(this);

    this.onLabel5_click = function () {
        let $e = $(event.target).closest(".tiles");
        let idx = $e.attr("idx");
        this.removeSelected($e, idx);
        $(".rows").css({ background: "white" });
        $("#paramsalert").show();
        document.getElementById("paramsalert").innerHTML = "";
        $(".wraper1_drhome").css({ width: "50%", });
        this.getParams(idx);
    }.bind(this);

    this.onLabel6_click = function () {
        let $e = $(event.target).closest(".tiles");
        let idx = $e.attr("idx");
        this.removeSelected($e, idx);
        $(".rows").css({ background: "white" });
        $("#paramsalert").show();
        document.getElementById("paramsalert").innerHTML = "";
        $(".wraper1_drhome").css({ width: "50%", });
    }.bind(this);

    this.onRowClick = function () {
        let $e = $(event.target);
        let $tr = $e.closest("tr");
        let idx = $tr.attr("idx");
        this.removeSelected($tr, idx);
        $("#paramsalert").show();
        document.getElementById("paramsalert").innerHTML = "";
        $(".wraper1_drhome").css({ width: "50%", });
        this.getParams(idx);
        this.logsObj;
    }.bind(this);

    this.onShowChart1 = function () {

        this.removeSelClass();
        $("#paramsalert").show().empty().append(`<canvas id="myChart1"></canvas>`);
        var ctx = document.getElementById("myChart1");
        var lables = [];
        var numrow = [];
        for (let i = 0; i < this.logsObj.$values.length; i++) {
            lables.push(this.logsObj.$values[i]["Exec_time"]);
        }
        for (let i = 0; i < this.logsObj.$values.length; i++) {
            numrow.push(this.logsObj.$values[i]["Rows"]);
        }
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: lables,
                datasets: [{
                    label: 'Row number',
                    data: numrow,
                    fill: true,
                    borderColor: '#EE13B3',
                    backgroundColor: '#EE13B3',
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Rows Vs Time'
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }.bind(this);

    this.onShowChart2 = function () {

        this.removeSelClass();
        $("#paramsalert").show().empty().append(`<canvas id="myChart2"></canvas>`);
        var ctx = document.getElementById("myChart2");
        var numrow = [];
        var freq = [];
        freq.length = 24;
        freq.fill(0, 0);
        var today = new Date();
        let dd = today.getDate();
        let mm = today.getMonth() + 1; //January is 0!
        let yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }
        today = dd + '-' + mm + '-' + yyyy;
        for (let i = 0; i < this.logsObj.$values.length; i++) {
            let dd = new Date(this.logsObj.$values[i]["Created_at"]).getDate();
            let mm = new Date(this.logsObj.$values[i]["Created_at"]).getMonth() + 1;
            let yyyy = new Date(this.logsObj.$values[i]["Created_at"]).getFullYear();
            if (dd < 10) {
                dd = '0' + dd;
            }

            if (mm < 10) {
                mm = '0' + mm;
            }
            var ddate = dd + '-' + mm + '-' + yyyy;
            if (ddate === today) {
                var hr = new Date(this.logsObj.$values[i]["Created_at"]).getHours()
                freq[hr] += 1;
            }
        }
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
                datasets: [{
                    label: 'Execution count',
                    data: freq,
                    lineTension: 0,
                    fill: true,
                    borderColor: 'orange',
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    pointBorderColor: 'orange',
                    pointBackgroundColor: 'rgba(255,150,0,0.5)',
                    pointRadius: 5,
                    pointHoverRadius: 10,
                    pointHitRadius: 30,
                    pointBorderWidth: 2,
                    //pointStyle: 'rectRounded'
                }]
            },
            options: {
                title: {
                    display: true,
                    title: 'Rows Vs Time'
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }.bind(this);

    this.init = function () {

        $("#label1").on("click", this.onLabel1_click.bind(this));

        $("#label2").on("click", this.onLabel2_click);

        $("#label3").on("click", this.onLabel3_click);

        $("#label4").on("click", this.onLabel4_click);

        $("#label5").on("click", this.onLabel5_click);

        $("#label6").on("click", this.onLabel6_click);

        $(".rows").on("click", this.onRowClick);

        $(".maximize").on("click", this.onMaxClick);

        $(".restore").on("click", this.onResClick);

        $("#chart-tile1").on("click", this.onShowChart1);

        $("#chart-tile2").on("click", this.onShowChart2);

    }

    this.removeSelected = function ($e, idx) {
        $('.tile_wrapere .selected').each(function (i, o) {
            $(o).removeClass("selected");
        });
        $('.logtable .selected').each(function (i, o) {
            $(o).removeClass("selected");
        });
        $e.addClass("selected");
        $("#tablelog").find("tr[idx='" + idx + "']").addClass('selected').focus();
    }

    this.removeSelClass = function () {
        $('.tile_wrapere .selected').each(function (i, o) {
            $(o).removeClass("selected");
        });
        $('.logtable .selected').each(function (i, o) {
            $(o).removeClass("selected");
        });
    }

    this.getParams = function (idx) {
        $("#eb_common_loader").EbLoader("show");
        $.ajax({
            url: "../Eb_Object/GetLogdetails",
            type: "get",
            data: {
                "idx": idx
            },
            success: function (response) {
                logdetails = "Execution time: " + response.exec_time;
                logdetails = logdetails + " Rows: " + response.rows;
                logdetails = logdetails + " Executed by: " + response.created_by;
                logdetails = logdetails + " Executed at: " + response.created_at;
                logdetails = logdetails + new EbPrettyJson().build(JSON.parse(response.params));
                //document.getElementById("paramsalert").innerHTML = logdetails;
                $("#paramsalert").append(logdetails);
                $("#eb_common_loader").EbLoader("hide");
            }
        })
    }

    //this.showRow = functions(idx){

    //}
    this.init();
}