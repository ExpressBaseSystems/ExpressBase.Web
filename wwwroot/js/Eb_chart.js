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
            dta += "'"+obj.name+",";
        });
        $.each(this.columnInfo.options.Yaxis, function (i, obj) {
            Yindx.push(obj.index);
            dta +=  obj.name + ",";
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
        return dta+"'";
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
        if (this.type === "bar" || this.type === "line" || this.type === "areafilled") {
            this.drawGeneralGraph();
        }
    };

    if (data)
        this.data = data;
    else {
        $.post(this.ssurl + '/ds/data/' + this.columnInfo.dsId, { draw: 1, Id: this.columnInfo.dsId, Start: 0, Length: 50, TFilters: [], Token: getToken(), rToken: getrToken(), Params: JSON.stringify(this.getFilterValues()) }, this.getDataSuccess.bind(this));
    }

    this.getBarData = function () {
        var Xindx = [];
        var Yindx = [];
        $.each(this.columnInfo.options.Xaxis, function (i, obj) {
            Xindx.push(obj.index);
        });
        $.each(this.columnInfo.options.Yaxis, function (i, obj) {
            Yindx.push(obj.index);
        });

        $.each(this.data, this.getBarDataLabel.bind(this, Xindx, Yindx));
        var fill = false;
        if (this.type == "areafilled") {
            this.type = "line";
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
        console.log(this.XLabel);
        console.log(this.dataset);
        var canvas = document.getElementById('myChart');
        var data = {
            labels: this.XLabel,
            datasets: this.dataset,
        };
        var option = {
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
            }
        };

        var myBarChart = new Chart(canvas, {
            type: 'line',
            data: data,
            options: option
        });

    };
};

var eb_chart = function (columnInfo, ssurl, data) {
    this.data = data;
    this.columnInfo = columnInfo;
    this.type = this.columnInfo.options.type.trim().toLowerCase();
    this.ssurl = ssurl;

    // functions

    this.init = function () {
        //if (this.type === "line" || this.type === "areafilled") {
        //    new Eb_dygraph(this.type, this.data, this.columnInfo, this.ssurl);
        //}
        //else {
            new Eb_chartJSgraph(this.type, this.data, this.columnInfo, this.ssurl);
        //}

    };

    this.init();
}