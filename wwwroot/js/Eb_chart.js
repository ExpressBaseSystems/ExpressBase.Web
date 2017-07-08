var datasetObj = function (label, data, backgroundColor, fill) {
    this.label = label;
    this.data = data;
    this.backgroundColor = backgroundColor;
    this.fill = fill;
};

var Eb_dygraph = function (type, data, columnInfo, ssurl) {
    this.type = type;
    this.columnInfo = columnInfo;
    this.data = data;
    this.ssurl = ssurl;

    this.getFilterValues = function () {
        var fltr_collection = [];
        var paramstxt = $('#hiddenparams').val().trim();
        if (paramstxt.length > 0) {
            var params = paramstxt.split(',');
            $.each(params, function (i, id) {
                var v = null;
                var dtype = $('#' + id).attr('data-ebtype');
                if (dtype === '6')
                    v = $('#' + id).val().substring(0, 10);
                else
                    v = $('#' + id).val();
                fltr_collection.push(new fltr_obj(dtype, id, v));
            });
        }

        return fltr_collection;
    };


    this.getDataSuccess = function (result) {
        this.data = result.data;
        console.log(this.data);
        if (this.type === "line") {
            this.drawLineGraph();
        }

    };

    if (data)
        this.data = data;
    else {
        $.post(this.ssurl + '/ds/data/' + this.columnInfo.dsId, { draw: 1, Id: this.columnInfo.dsId, Start: 0, Length: 100, TFilters: [], Token: getToken(), rToken: getrToken(), Params: JSON.stringify(this.getFilterValues()) }, this.getDataSuccess.bind(this));
    }


    this.getCSV = function () {
        var Xindx = [];
        var Yindx = [];
        var dta = "";
        $.each(this.columnInfo.options.Xaxis, function (i, obj) {
            Xindx.push(obj.index);
            dta += "'" + obj.name + ",";
        });
        $.each(this.columnInfo.options.Yaxis, function (i, obj) {
            Yindx.push(obj.index);
            dta += obj.name + ",";
        });
        dta = dta.substring(0, dta.length - 1) + "\n";
        //var dta = 'netamt,grossamt,forms_id\n';
        $.each(this.data, function (i, value) {
            for (k = 0; k < Xindx.length; k++)
                dta += value[Xindx[k]];
            for (k = 0; k < Yindx.length; k++)
                dta += ',' + value[Yindx[k]];
            dta += '\n';
        });
        console.log(dta);
        return dta + "'";
    };

    //this.getCSV = function () {
    //    var Xindx = [];
    //    var Yindx = [];
    //    var dta = "";
    //    if (this.columnInfo.options.Xaxis.Length > 1) {
    //        $.each(this.columnInfo.options.Xaxis, function (i, obj) {
    //            Xindx.push(obj.index);
    //            dta += "'x" + i+1 + ",";
    //        });
    //    }
    //    else
    //    {
    //        Xindx.push(this.columnInfo.options.Xaxis[0].index);
    //        dta += "'x,";
    //    }
    //    if (this.columnInfo.options.Yaxis.Length > 1) {
    //        $.each(this.columnInfo.options.Yaxis, function (i, obj) {
    //            Xindx.push(obj.index);
    //            dta += "Y" + i + 1 + ",";
    //        });
    //    }
    //    else {
    //        Xindx.push(this.columnInfo.options.Xaxis[0].index);
    //        dta += "Y,";
    //    }
    //    dta = dta.substring(0, dta.length - 1) + "\n";
    //    //var dta = 'netamt,grossamt,forms_id\n';
    //    $.each(this.data, function (i, value) {
    //        for (k = 0; k < Xindx.length; k++)
    //            dta += value[Xindx[k]];
    //        for (k = 0; k < Yindx.length; k++)
    //            dta += ',' + value[Yindx[k]];
    //        dta += '\n';
    //    });
    //    console.log(dta);
    //    return dta + "'";
    //};

    //if (this.type === "bar") {
    //    this.drawBarGraph();
    //}

    //else if (this.type === "line") {
    //    this.drawLineGraph();
    //}

    //else if (this.type === "areafilled") {
    //    this.drawBarGraph();
    //}

    //this.drawLineGraph = function () {
    //    ;
    //};

    //this.drawBarGraph = function () {
    //    ;
    //};

    //this.drawAreaFilledGraph = function () {
    //};

    this.drawLineGraph = function () {
        var dt = this.getCSV();
        new Dygraph(
                document.getElementById('divgraph'),
                dt,
            {
                ylabel: 'Y Label',
                xlabel: 'X Label',
                legend: 'follow',
            }
            );
        //var dt = this.getCSV();
        //var data = this.data;
        //new Dygraph(
        //        document.getElementById('divgraph'),
        //        dt,
        //    {
        //        ylabel: 'Y Label',
        //        xlabel: 'X Label',
        //        legend: 'always',
        //        animatedZooms: true,
        //        'Y1': {
        //            plotter: dy_plotters.barChartPlotter
        //        },
        //        'Y2': {
        //            plotter: dy_plotters.barChartPlotter
        //        },
        //        'Y3': {
        //            plotter: dy_plotters.barChartPlotter
        //        },
        //        'Y4': {
        //            plotter: dy_plotters.barChartPlotter
        //        },
        //        'Y5': {
        //            plotter: dy_plotters.barChartPlotter
        //        },
        //        axes: {
        //            x: {
        //                valueFormatter: function (x) {
        //                    return (x < data.length) ? data[x][1].toString() : '';
        //                },
        //                axisLabelFormatter: function (x) {
        //                    return (x < data.length) ? data[x][1].toString() : '';
        //                },
        //            },
        //            y: {
        //                valueFormatter: function (y) {
        //                    return y;
        //                },
        //                axisLabelFormatter: function (y) {
        //                    y = y.toString();

        //                    if (y.slice(-6) === '000000')
        //                        return y.slice(0, -6) + 'M';

        //                    else if (y.slice(-3) === '000')
        //                        return y.slice(0, -3) + 'K';
        //                    else
        //                        return y;
        //                },
        //            },
        //        },
        //        logscale: true
        //    }
        //    );
    };
};

var Eb_chartJSgraph = function (type, data, columnInfo, ssurl) {
    this.type = type;
    this.columnInfo = columnInfo;
    this.data = data;
    this.ssurl = ssurl;
    this.XLabel = [];
    this.YLabel = [];
    this.dataset = [];
    this.chartApi = null;
    this.gdata = null;
    this.goptions = null;

    this.init = function () {
        $("#reset_zoom").off("click").on("click", this.ResetZoom.bind(this));
        $("#graphDropdown .dropdown-menu li a").off("click").on("click", this.setGraphType.bind(this));
        if (data)
            this.data = data;
        else {
            $.post(this.ssurl + '/ds/data/' + this.columnInfo.dsId, { draw: 1, Id: this.columnInfo.dsId, Start: 0, Length: 50, TFilters: [], Token: getToken(), rToken: getrToken(), Params: JSON.stringify(this.getFilterValues()) }, this.getDataSuccess.bind(this));
        }
    };

    this.getFilterValues = function () {
        var fltr_collection = [];
        var paramstxt = $('#hiddenparams').val().trim();
        if (paramstxt.length > 0) {
            var params = paramstxt.split(',');
            $.each(params, function (i, id) {
                var v = null;
                var dtype = $('#' + id).attr('data-ebtype');
                if (dtype === '6')
                    v = $('#' + id).val().substring(0, 10);
                else
                    v = $('#' + id).val();
                fltr_collection.push(new fltr_obj(dtype, id, v));
            });
        }

        return fltr_collection;
    };

    this.getDataSuccess = function (result) {
        this.drawGraphHelper(result.data);
    };

    this.drawGraphHelper = function (datain) {
        this.data = datain;
        console.log(this.data);
        if (this.type === "bar" || this.type === "line" || this.type === "areafilled") {
            this.drawGeneralGraph();
        }
    };

    this.getBarData = function () {
        var Xindx = [];
        var Yindx = [];
        this.dataset = [];
        this.XLabel = [];
        this.YLabel = [];
        $.each(this.columnInfo.options.Xaxis, function (i, obj) {
            Xindx.push(obj.index);
        });
        $.each(this.columnInfo.options.Yaxis, function (i, obj) {
            Yindx.push(obj.index);
        });

        $.each(this.data, this.getBarDataLabel.bind(this, Xindx, Yindx));
        var fill = false;
        if (this.type == "areafilled") {
            this.columnInfo.options.type = "line";
            fill = true;
        }
        var Ycolor = ["rgba(255,99,132,0.2)", "rgba(10,10,10,0.2)"];
        for (k = 0; k < Yindx.length; k++) {
            this.YLabel = [];
            for (j = 0; j < this.data.length; j++)
                this.YLabel.push(this.data[j][Yindx[k]]);
            this.dataset.push(new datasetObj(this.columnInfo.options.Yaxis[k].name, this.YLabel, Ycolor[k], fill));
        }
    };

    this.getBarDataLabel = function (Xindx, Yindx, i, value) {
        for (k = 0; k < Xindx.length; k++)
            this.XLabel.push(value[Xindx[k]]);
    };

    this.drawGeneralGraph = function () {
        this.getBarData();
        this.gdata = {
            labels: this.XLabel,
            datasets: this.dataset,
        };
        this.goptions = {
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Ylabel'
                    },
                    stacked: false,
                    gridLines: {
                        display: true,
                        color: "rgba(255,99,132,0.2)"
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Xlabel'
                    },
                    gridLines: {
                        display: true
                    }
                }]
            },
            zoom: {
                // Boolean to enable zooming
                enabled: true,

                // Zooming directions. Remove the appropriate direction to disable 
                // Eg. 'y' would only allow zooming in the y direction
                mode: 'x',
            },
        };

        this.RemoveCanvasandCheckButton();
    };

    this.RemoveCanvasandCheckButton = function () {
        console.log("RemoveCanvasandCheckButton");
        var ty = $("#graphcontainer button:eq(0)").text().trim().toLowerCase();
        if (ty == "areafilled" || ty == "line") {
            console.log(" || ty ==");
            if (this.chartApi !== null) {
                console.log("his.chart");

                $.each(this.chartApi.config.data.datasets, this.ApiDSiterFn.bind(this));
            }
            else {
                $.each(this.gdata.datasets, this.GdataDSiterFn.bind(this));
            }
            this.type = "line";
        }
        else
            this.type = "bar";

        this.columnInfo.options.type = this.type;
        $("#myChart").remove();
        $("#graphcontainer").append("<canvas id='myChart' width='auto' height='auto'></canvas>");

        this.drawGraph();
    };

    this.ApiDSiterFn = function (i, obj) {

        var ty = $("#graphcontainer button:eq(0)").text().trim().toLowerCase();
        console.log("each" + i);
        if (ty == "areafilled") {
            this.gdata.datasets[i].fill = true;
        }
        else {
            this.gdata.datasets[i].fill = false;
            console.log("obj.fill = f");
        }

    };

    this.GdataDSiterFn = function (j, obj) {

        var ty = $("#graphcontainer button:eq(0)").text().trim().toLowerCase();
        if (ty == "areafilled") {
            this.gdata.datasets[j].fill = true;
        }
        else {
            this.gdata.datasets[j].fill = false;
        }
    }

    this.drawGraph = function () {
        var canvas = document.getElementById('myChart');
        this.chartApi = new Chart(canvas, {
            type: this.columnInfo.options.type.trim().toLowerCase(),
            data: this.gdata,
            options: this.goptions
        });
    };

    this.ResetZoom = function () {
        alert("hahahh");
        this.chartApi.resetZoom();
    };

    this.setGraphType = function (e) {
        $("#graphDropdown .btn:first-child").html($(e.target).text() + "&nbsp;<span class = 'caret'></span>");
        this.type = $(e.target).text().trim().toLowerCase();
        this.RemoveCanvasandCheckButton();
        e.preventDefault();
    };

    this.init();
};

var eb_chart = function (columnInfo, ssurl, data) {
    this.data = data;
    this.columnInfo = columnInfo;
    this.type = this.columnInfo.options.type.trim().toLowerCase();
    this.ssurl = ssurl;
    this.chartJs = null;

    // functions

    this.init = function () {
        //if (this.type === "line" || this.type === "areafilled") {
        //    new Eb_dygraph(this.type, this.data, this.columnInfo, this.ssurl);
        //}
        //else {
        this.chartJs = new Eb_chartJSgraph(this.type, this.data, this.columnInfo, this.ssurl);
        //}

    };

    this.drawGraphHelper = function (datain) {
        this.chartJs.drawGraphHelper(datain);
    }

    this.init();
}