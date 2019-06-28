const SQLProfiler = function (Columns, rows, refid, month_count, curr_count) {
    //this.profiler = profiler;
    //this.logsObj = logsObj;
    this.columns = Columns;
    this.data4chart = rows;
    this.month_count = month_count;
    this.curr_count = curr_count;

    this.onLabel1_click = function () {
        let $e = $(event.target).closest(".tiles");
        let idx = $e.attr("idx");
        this.removeSelected($e, idx);
        $(".rows").css({ background: "white" });
        $("#paramsalert").show();
        document.getElementById("paramsalert").innerHTML = "";
        this.getParams(idx);
    }

    this.onLabel2_click = function () {
        let $e = $(event.target).closest(".tiles");
        let idx = $e.attr("idx");
        this.removeSelected($e, idx);
        $(".rows").css({ background: "white" });
        $("#paramsalert").show();
        document.getElementById("paramsalert").innerHTML = "";
        this.getParams(idx);
    }.bind(this);

    this.onLabel3_click = function () {
        let $e = $(event.target).closest(".tiles");
        let idx = $e.attr("idx");
        this.removeSelected($e, idx);
        $(".rows").css({ background: "white" });
        $("#paramsalert").show();
        document.getElementById("paramsalert").innerHTML = "";
        if (this.month_count > 0) {
            this.getParams(idx);
        }
    }.bind(this);

    this.onLabel4_click = function () {
        let $e = $(event.target).closest(".tiles");
        let idx = $e.attr("idx");
        this.removeSelected($e, idx);
        $(".rows").css({ background: "white" });
        $("#paramsalert").show();
        document.getElementById("paramsalert").innerHTML = "";
        if (this.month_count > 0) {
            this.getParams(idx);
        }
    }.bind(this);

    this.onLabel5_click = function () {
        let $e = $(event.target).closest(".tiles");
        let idx = $e.attr("idx");
        this.removeSelected($e, idx);
        $(".rows").css({ background: "white" });
        $("#paramsalert").show();
        document.getElementById("paramsalert").innerHTML = "";
        if (this.curr_count > 0) {
            this.getParams(idx);
        }
    }.bind(this);

    this.onLabel6_click = function () {
        let $e = $(event.target).closest(".tiles");
        let idx = $e.attr("idx");
        this.removeSelected($e, idx);
        $(".rows").css({ background: "white" });
        $("#paramsalert").show();
        document.getElementById("paramsalert").innerHTML = "";
        if (this.curr_count > 0) {
            this.getParams(idx);
        }
    }.bind(this);

    this.onRowClick = function (e) {
        let $e = $(event.target);
        let $tr = $e.closest("tr");
        let idx = $tr.attr("data-uid");
        this.removeSelected($tr, idx);
        $("#paramsalert").show();
        document.getElementById("paramsalert").innerHTML = "";
        this.getParams(idx);
        this.logsObj;
    }.bind(this);

    this.onShowChart1 = function () {

        this.removeSelClass();
        $("#paramsalert").show().empty().append(`<canvas id="myChart1"></canvas>`);
        var ctx = $("#myChart1");
        var lables = [];
        var chartrows = [];
        var _chartrows = [];
        var chartdataset = [];
        var count = 0;
        $.ajax({
            url: "../Eb_Object/GetChartDetails",
            type: "get",
            data: {
                "refid": refid
            },
            success: function (response) {
                for (let i = 0; i < response.length; i++) {

                    if (response[i][0] === null) continue;

                    if (response[i][0].split(',').length > count)                    
                        count = response[i][0].split(',').length;
                                            
                }
                for (let i = 0; i < response.length; i++) {

                    if (response[i][0] === null) continue;

                    lables.push(response[i][1]);
                    var rows = response[i][0].split(',', count);
                    for (let j = 0; j < count; j++) {
                        chartrows.push([]);
                    }
                    for (let j = 0; j < count; j++) {
                        chartrows[j].push(rows[j] > 0 ? rows[j] : 0);
                    }
                }
                var myChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: lables
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
                                },
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Row num'
                                }
                            }],

                            xAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Exec time'
                                }
                            }]
                        }
                    }
                })

                for (let i = 0; i < count - 1; i++) {
                    var r = Math.floor(Math.random() * 255);
                    var g = Math.floor(Math.random() * 255);
                    var b = Math.floor(Math.random() * 255);
                    var clr = "rgb(" + r + "," + g + "," + b + ")";
                    myChart.data.datasets.push({
                        label: 'DataTable ' + i,
                        data: chartrows[i],
                        fill: false,
                        backgroundColor: clr
                    })
                    myChart.update();
                }
                //var myChart = new Chart(ctx, {
                //    type: 'bar',
                //    data: {
                //        labels: lables,
                //        datasets: [{
                //            label: 'Row number',
                //            data: numrow,
                //            fill: false,
                //            borderColor: '#316396',
                //            backgroundColor: '#316396',
                //        }]
                //    },
                //    options: {
                //        title: {
                //            display: true,
                //            text: 'Rows Vs Time'
                //        },
                //        scales: {
                //            yAxes: [{
                //                ticks: {
                //                    beginAtZero: true
                //                },
                //                scaleLabel: {
                //                    display: true,
                //                    labelString: 'Row num'
                //                }
                //            }],

                //            xAxes: [{
                //                scaleLabel: {
                //                    display: true,
                //                    labelString: 'Exec time'
                //                }
                //            }]
                //        }
                //    }
                //});
            }
        })

    }.bind(this);

    this.onShowChart2 = function () {
        $("#eb_common_loader").EbLoader("show");
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
        today = yyyy + '-' + mm + '-' + dd;
        $.ajax({
            url: "../Eb_Object/GetChart2Details",
            type: "get",
            data: {
                "refid": refid
            },
            success: function (response) {
                for (let i = 0; i < response.length; i++) {
                    var date = new Date(parseInt(response[i][0].substr(6)));
                    var hr = date.getHours()
                    freq[hr - 1] += 1;
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
                                },
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Execution count'
                                }
                            }],
                            xAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Time in hours'
                                }
                            }]
                        }
                    }
                });
            }
        });
        $("#eb_common_loader").EbLoader("hide");
    }.bind(this);

    this.init = function () {

        $("#label1").on("click", this.onLabel1_click.bind(this));

        $("#label2").on("click", this.onLabel2_click);

        $("#label3").on("click", this.onLabel3_click);

        $("#label4").on("click", this.onLabel4_click);

        $("#label5").on("click", this.onLabel5_click);

        $("#label6").on("click", this.onLabel6_click);

        $("#chart-tile1").on("click", this.onShowChart1);

        $("#chart-tile2").on("click", this.onShowChart2);

        this.call2DataTable();

        $("#chart-tile1").click();
    };


    this.call2DataTable = function () {
        var o = new Object();
        o.tableId = "tablelog";
        o.showSerialColumn = true;
        o.showCheckboxColumn = false;
        o.showFilterRow = false;
        o.columns = this.columns;
        o.IsPaging = true;
        o.IsQuery = true;
        o.dsid = refid;
        o.scrollHeight = "350";
        o.rowclick = this.onRowClick;
        o.datetimeformat = true;
        this.datatable = new EbBasicDataTable(o);
    };

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
                logdetails = "<b style='color:indigo;  font-size:medium;'><u>Execution Info</u></b></br></br>"
                logdetails = logdetails + "<b style='color:indigo;'>Execution time</b>: " + response.exec_time;
                logdetails = logdetails + "&nbsp&nbsp<b style='color:indigo;'>Rows</b>: " + response.rows;
                logdetails = logdetails + "&nbsp&nbsp<b style='color:indigo;'>Executed by</b>: " + response.username;
                logdetails = logdetails + "&nbsp&nbsp<b style='color:indigo;'>Executed at</b>: " + response.created_at;
                var html = "<table class='table table-bordered paramtable' style='width:100%';><th>Name</th><th>Type</th><th>Value</th>";
                if (response.params !== null)
                    for (let i = 0; i < response.params.length; i++) {
                        html += "<tr><td>" + response.params[i].name + "</td><td>" + response.params[i].type + "</td><td>" + response.params[i].value + "</td></tr>";
                    }
                html += "</table>";
                logdetails += html;
                $("#paramsalert").append(logdetails);
                $("#eb_common_loader").EbLoader("hide");
            }
        })
    }

    this.init();
}