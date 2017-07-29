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

var Eb_chartJSgraph = function (type, data, columnInfo, ssurl, tableId) {
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
    this.Xax = []; this.Yax = [];
    this.tableId = tableId;
    this.sourceElement = null;

    this.init = function () {
        $.event.props.push('dataTransfer');
        $("#reset_zoom" + this.tableId).off("click").on("click", this.ResetZoom.bind(this));
        $("#graphDropdown_tab" + this.tableId + " .dropdown-menu li a").off("click").on("click", this.setGraphType.bind(this));
        $("#btnColumnCollapse" + this.tableId).off("click").on("click", this.collapseGraph.bind(this));
        this.appendColumns();
        this.appendXandYAxis();
        $("#X_col_name" + this.tableId).off("drop").on("drop", this.colDrop.bind(this));
        $("#X_col_name" + this.tableId).off("dragover").on("dragover", this.colAllowDrop.bind(this));
        $("#Y_col_name" + this.tableId).off("drop").on("drop", this.colDrop.bind(this));
        $("#Y_col_name" + this.tableId).off("dragover").on("dragover", this.colAllowDrop.bind(this));
        $("#searchColumn"+this.tableId).off("keyup").on("keyup", this.searchDragNDropColumn.bind(this));
        if (data) {
            this.data = data;
            this.drawGraphHelper(this.data)
        }
        else {
            $.post(this.ssurl + '/ds/data/' + this.columnInfo.dsId, { draw: 1, Id: this.columnInfo.dsId, Start: 0, Length: 50, TFilters: [], Token: getToken(), rToken: getrToken(), Params: JSON.stringify(getFilterValues()) }, this.getDataSuccess.bind(this));
        }
    };

    this.appendColumns = function () {
        var colsAll_X = [], Xcol = [];
        $.each(this.columnInfo.options.Xaxis, this.AddXcolumns.bind(this, Xcol));
        $.each(this.columnInfo.columns, this.RemoveXcolumns.bind(this, colsAll_X, Xcol));
        var colsAll_XY = [], Ycol = [];
        $.each(this.columnInfo.options.Yaxis, this.AddYcolumns.bind(this, Ycol));
        $.each(colsAll_X, this.RemoveYcolumns.bind(this, colsAll_XY, Ycol));
        var tid = this.tableId;
        colsAll_XY = colsAll_XY.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
        $.each(colsAll_XY, function (i, obj) {
            if (obj.data != undefined) {
                $("#columns4Drag" + tid + " .list-group").append("<li class='alert alert-success columnDrag' id='li" + obj.name + "' draggable='true' data-id='" + obj.data + "'>" + obj.name + "</li>");
            }
        });
        $("#columns4Drag" + this.tableId + " .columnDrag").off("dragstart").on("dragstart", this.colDrag.bind(this));
    };

    this.AddXcolumns = function (Xcol, i, obj) {
        Xcol.push(obj.name);
        this.Xax.push(obj);
    };

    this.AddYcolumns = function (Ycol, i, obj) {
        Ycol.push(obj.name);
        this.Yax.push(obj);
    };

    this.RemoveXcolumns = function (colsAll_X, Xcol, i, obj) {
        if (!Xcol.contains(obj.name))
            colsAll_X.push(obj);
    };

    this.RemoveYcolumns = function (colsAll_XY, Ycol, i, obj) {
        if (!Ycol.contains(obj.name))
            colsAll_XY.push(obj);
    };

    this.appendXandYAxis = function () {
        var tid = this.tableId;
        $.each(this.columnInfo.options.Xaxis, function (i, obj) {
            $("#X_col_name" + tid).append("<div class='alert alert-success' draggable='true' style='margin: 0px 2px;padding: 0px 4px;width: auto; display:inline-block' id='li" + obj.name + "' data-id='" + obj.index + "'>" + obj.name + "<button class='close' type='button' style='font-size: 15px;margin: 2px 0 0 4px;' >x</button></div>");
        });
        $.each(this.columnInfo.options.Yaxis, function (i, obj) {
            $("#Y_col_name" + tid).append("<div class='alert alert-success' draggable='true' style='margin: 0px 2px;padding: 0px 4px;width: auto; display:inline-block' id='li" + obj.name + "' data-id='" + obj.index + "'>" + obj.name + "<button class='close' type='button' style='font-size: 15px;margin: 2px 0 0 4px;' >x</button></div>");
        });

        $("#X_col_name" + this.tableId + " button[class=close]").off("click").on("click", this.RemoveAndAddToColumns.bind(this));
        $("#Y_col_name" + this.tableId + " button[class=close]").off("click").on("click", this.RemoveAndAddToColumns.bind(this));

        $("#X_col_name" + this.tableId + " div[draggable=true]").off("dragstart").on("dragstart", this.colDrag.bind(this));
        $("#Y_col_name" + this.tableId + " div[draggable=true]").off("dragstart").on("dragstart", this.colDrag.bind(this));

        $("#X_col_name" + this.tableId + " div[draggable=true]").off("dragover").on("dragover", this.NocolAllowDrop.bind(this));
        $("#Y_col_name" + this.tableId + " div[draggable=true]").off("dragover").on("dragover", this.NocolAllowDrop.bind(this));
    };

    

    this.getDataSuccess = function (result) {
        this.drawGraphHelper(result.data);
    };

    this.drawGraphHelper = function (datain) {
        this.data = datain;
        //if (this.type === "bar" || this.type === "line" || this.type === "areafilled") {
            this.drawGeneralGraph();
        //}
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
        for (k = 0; k < Yindx.length; k++) {
            this.YLabel = [];
            for (j = 0; j < this.data.length; j++)
                this.YLabel.push(this.data[j][Yindx[k]]);
            this.dataset.push(new datasetObj(this.columnInfo.options.Yaxis[k].name, this.YLabel, getRandomColor(), false));
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
        var ty = $("#graphcontainer_tab" + this.tableId + " button:eq(0)").text().trim().toLowerCase();
        if (ty == "areafilled" || ty == "line") {
            $.each(this.gdata.datasets, this.GdataDSiterFn.bind(this));
            this.type = "line";
        }
        else if (ty == "bar")
            this.type = "bar";
        else if (ty == "pie") {
            this.goptions = null;
            this.type = "pie";
        }
        else if (ty == "doughnut") {
            this.goptions = null;
            this.type = "doughnut";
        }

        this.columnInfo.options.type = this.type;
        $("#myChart" + this.tableId).remove();
        $("#graphcontainer_tab" + this.tableId).append("<canvas id='myChart" + this.tableId + "' width='auto' height='auto'></canvas>");
        this.drawGraph();
    };

    this.ApiDSiterFn = function (i, obj) {

        var ty = $("#graphcontainer_tab" + this.tableId + " button:eq(0)").text().trim().toLowerCase();
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

        var ty = $("#graphcontainer_tab" + this.tableId + " button:eq(0)").text().trim().toLowerCase();
        if (ty == "areafilled") {
            this.gdata.datasets[j].fill = true;
        }
        else {
            this.gdata.datasets[j].fill = false;
        }
    }

    this.drawGraph = function () {
        var canvas = document.getElementById("myChart" + this.tableId);
        this.chartApi = new Chart(canvas, {
            type: this.columnInfo.options.type.trim().toLowerCase(),
            data: this.gdata,
            options: this.goptions
        });

        this.modifyChart();
    };

    this.ResetZoom = function () {
        this.chartApi.resetZoom();
    };

    this.setGraphType = function (e) {
        $("#graphcontainer_tab" + this.tableId + " #graphDropdown_tab" + this.tableId + " .btn:first-child").html($(e.target).text() + "&nbsp;<span class = 'caret'></span>");
        this.type = $(e.target).text().trim().toLowerCase();
        this.RemoveCanvasandCheckButton();
        e.preventDefault();
    };

    this.colDrag = function (e) {
        e.dataTransfer.setData("text", e.target.id);
        this.sourceElement = e.target.parentNode.tagName;
        this.sourceElementId = e.target.parentElement.id;
    };

    this.colDrop = function (e) {
        e.preventDefault();
        var data = e.dataTransfer.getData("text");
        if (this.sourceElement === "UL") {
            $(e.target).append("<div class='alert alert-success' draggable='true' style='margin: 0px 2px;padding: 0px 4px;width: auto; display:inline-block' id='" + data + "' data-id='" + $("#" + data).attr("data-id") + "'>" + $("#" + data).text() + "<button class='close' type='button' style='font-size: 15px;margin: 2px 0 0 4px;' >x</button></div>");
            if ($(e.target).attr("id") == "X_col_name" + this.tableId)
                this.Xax.push(new axis($("#" + data).attr("data-id"), $("#" + data).text()));
            if ($(e.target).attr("id") == "Y_col_name" + this.tableId)
                this.Yax.push(new axis($("#" + data).attr("data-id"), $("#" + data).text()));
            $("#" + data).remove();
        }
        else {
            var str = $("#" + data).text();
            this.Xax = []; this.Yax = [];
            $(e.target).append("<div class='alert alert-success' draggable='true' style='margin: 0px 2px;padding: 0px 4px;width: auto; display:inline-block' id='" + data + "' data-id='" + $("#" + data).attr("data-id") + "'>" + str.substring(0, str.length - 1).trim() + "<button class='close' type='button' style='font-size: 15px;margin: 2px 0 0 4px;' >x</button></div>");
            if ($(e.target).attr("id") == "X_col_name" + this.tableId) {
                if (this.sourceElementId == "Y_col_name" + this.tableId)
                    $("#Y_col_name" + this.tableId + " #" + data).remove();
                else
                    $("#" + data).remove();
                $("#X_col_name" + this.tableId + " div").each(this.changeIndexIOfXColumns.bind(this));
                $("#Y_col_name" + this.tableId + " div").each(this.changeIndexIOfYColumns.bind(this));
            }
            else if($(e.target).attr("id") == "Y_col_name" + this.tableId) {
                if (this.sourceElementId == "X_col_name" + this.tableId)
                    $("#X_col_name" + this.tableId + " #" + data).remove();
                else
                    $("#" + data).remove();
                $("#Y_col_name" + this.tableId + " div").each(this.changeIndexIOfYColumns.bind(this));
                $("#X_col_name" + this.tableId + " div").each(this.changeIndexIOfXColumns.bind(this));
            }
        }
        this.columnInfo.options.Xaxis = this.Xax;
        this.columnInfo.options.Yaxis = this.Yax;
        if ($("#X_col_name" + this.tableId + " div").length == 1 && $("#Y_col_name" + this.tableId + " div").length >= 1) {
            this.drawGeneralGraph();
        }
        else {
            $("#myChart" + this.tableId).remove();
            $("#graphcontainer_tab" + this.tableId).append("<canvas id='myChart" + this.tableId + "' width='auto' height='auto'></canvas>");
        }
        console.log(this.columnInfo.options.Xaxis); console.log(this.columnInfo.options.Yaxis);
        $("#X_col_name" + this.tableId + " button[class=close]").off("click").on("click", this.RemoveAndAddToColumns.bind(this));
        $("#Y_col_name" + this.tableId + " button[class=close]").off("click").on("click", this.RemoveAndAddToColumns.bind(this));

        $("#X_col_name" + this.tableId + " div[draggable=true]").off("dragstart").on("dragstart", this.colDrag.bind(this));
        $("#Y_col_name" + this.tableId + " div[draggable=true]").off("dragstart").on("dragstart", this.colDrag.bind(this));

        $("#X_col_name" + this.tableId + " div[draggable=true]").off("dragover").on("dragover", this.NocolAllowDrop.bind(this));
        $("#Y_col_name" + this.tableId + " div[draggable=true]").off("dragover").on("dragover", this.NocolAllowDrop.bind(this));
    };

    this.changeIndexIOfXColumns = function (i, obj) {
        var str = obj.innerText;
        this.Xax.push(new axis(obj.getAttribute("data-id"), str.substring(0,str.length-1).trim()));
    };

    this.changeIndexIOfYColumns = function (i, obj) {
        var str = obj.innerText;
        this.Yax.push(new axis(obj.getAttribute("data-id"), str.substring(0, str.length - 1).trim()));
    };

    this.colAllowDrop = function (e) {
        e.preventDefault();
    };

    this.NocolAllowDrop = function (e) {
        e.stopPropagation();
    };

    this.collapseGraph = function () {
        $("#columns4Drag" + this.tableId).toggle();
        this.modifyChart();
    };

    this.modifyChart = function () {
        if ($("#columns4Drag" + this.tableId).css("display") === "none") {
            $("#myChart" + this.tableId).css("width", "99%");
            $("#myChart" + this.tableId).css("margin-left", "0px");
            $("#myChart" + this.tableId).css("margin-top", "0px");
            $("#myChart" + this.tableId).css("height", "522px");
            //$("#btnColumnCollapse" + this.tableId).children().remove();
            //$("#btnColumnCollapse" + this.tableId).append("<i class='fa fa-chevron-down' aria-hidden='true'></i>")
        }
        else {
            $("#myChart" + this.tableId).css("width", "80%");
            $("#myChart" + this.tableId).css("height", "454px");
            $("#myChart" + this.tableId).css("margin-left", "200px");
            $("#myChart" + this.tableId).css("margin-top", "-420px");
            //$("#btnColumnCollapse" + this.tableId).children().remove();
            //$("#btnColumnCollapse" + this.tableId).append("<i class='fa fa-chevron-up' aria-hidden='true'></i>")
        }
    };

    this.RemoveAndAddToColumns = function (e) {
        var str = $(e.target).parent().text();
        $("#columns4Drag" + this.tableId + " .list-group").append("<li class='alert alert-success columnDrag' id='" + $(e.target).parent().attr("id") + "' draggable='true' data-id='" + $(e.target).parent().attr("data-id") + "'>" + str.substring(0, str.length - 1).trim() + "</li>");
        $(e.target).parent().remove();
        $("#columns4Drag" + this.tableId + " .columnDrag").off("dragstart").on("dragstart", this.colDrag.bind(this));
        this.columnInfo.options.Xaxis = $.grep(this.columnInfo.options.Xaxis, function (obj) { return obj.name !== str.substring(0, str.length - 1).trim() });
        this.columnInfo.options.Yaxis = $.grep(this.columnInfo.options.Yaxis, function (obj) { return obj.name !== str.substring(0, str.length - 1).trim() });
        this.Xax = $.grep(this.Xax, function (obj) { return obj.name !== str.substring(0, str.length - 1).trim() });
        this.Yax = $.grep(this.Yax, function (obj) { return obj.name !== str.substring(0, str.length - 1).trim() });
        if ($("#X_col_name" + this.tableId + " div").length == 1 && $("#Y_col_name" + this.tableId + " div").length >= 1) {
            this.drawGeneralGraph();
        }
        else {
            //$("#graphcontainer_tabdv336_1").children("iframe").remove()
            $("#myChart" + this.tableId).remove();
            $("#graphcontainer_tab" + this.tableId).append("<canvas id='myChart" + this.tableId + "' width='auto' height='auto'></canvas>");
        }
    };

    this.searchDragNDropColumn = function () {
        var search_word = $("#searchColumn" + this.tableId).val();
        if (search_word !== "") {
            $("#columns4Drag" + this.tableId + " ul li").hide();
            $("#columns4Drag" + this.tableId + " ul li").each(function () {
                var current_keyword = $(this).text();
                if (current_keyword.indexOf(search_word) >= 0) {
                    $(this).show();
                };
            });
        }
        else {
            $("#columns4Drag" + this.tableId + " ul li").show();
        };
    };

    this.init();
};

var eb_chart = function (columnInfo, ssurl, data, tableId) {
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
        this.chartJs = new Eb_chartJSgraph(this.type, this.data, this.columnInfo, this.ssurl, tableId);
        //}

    };

    this.drawGraphHelper = function (datain) {
        this.chartJs.drawGraphHelper(datain);
    }

    this.init();
}