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

var eb_chart = function (refid, ver_num, type, dsobj, cur_status, tabNum, ssurl) {
    this.columnInfo = null;
    this.data = null;
    this.ssurl = ssurl;
    this.XLabel = [];
    this.YLabel = [];
    this.dataset = [];
    this.chartApi = null;
    this.gdata = null;
    this.goptions = null;
    this.Xindx = []; this.Yindx = [];
    this.tableId = null;
    this.sourceElement = null;
    this.flagAppendColumns = false;
    this.drake = null;
    this.EbObject = dsobj;
    this.Refid = null;
    this.tabNum = tabNum;
    this.type = null;
    this.PcFlag = false;

    var split = new splitWindow("parent-div" + this.tabNum, "contBox");

    split.windowOnFocus = function (ev) {
        if ($(ev.target).attr("class") !== undefined) {
            if ($(ev.target).attr("class").indexOf("sub-windows") !== -1) {
                var id = $(ev.target).attr("id");
                focusedId = id;
                this.propGrid.setObject(this.EbObject, AllMetas["EbChartVisualization"]);
            }
        }
    }.bind(this);

    this.call2FD = function () {
        $.LoadingOverlay("show");
        $.ajax({
            type: "POST",
            url: "../DV/dvCommon",
            data: { dvobj: JSON.stringify(this.EbObject), dvRefId: this.Refid, flag: this.PcFlag },
            success: this.ajaxSucc
        });

    };

    this.ajaxSucc = function (text) {
        this.PcFlag = "False";
        obj = this.EbObject;
        $("#obj_icons").empty();
        $("#obj_icons").append("<button id='btnGo" + this.tabNum + "' class='btn commonControl'><i class='fa fa-play' aria-hidden='true'></i></button>");
        $("#btnGo" + this.tabNum).click(this.init.bind(this));
        var sideDivId = "#sub_windows_sidediv_dv" + obj.EbSid + "_" + this.tabNum;
        var subDivId = "#sub_window_dv" + obj.EbSid + "_" + this.tabNum;
        $("#content_dv" + obj.EbSid + "_" + this.tabNum).empty();
        $(sideDivId).empty();
        $(sideDivId).append("<div class='pgHead'> Param window <div class='icon-cont  pull-right'><i class='fa fa-times' aria-hidden='true'></i></div></div>");
        $(sideDivId).append(text);
        this.EbObject = commonO.Current_obj;
        if (text.indexOf("filterBox") === -1) {
            $(sideDivId).css("display", "none");
            $.LoadingOverlay("hide");
            $("#content_dv" + obj.EbSid + "_" + this.tabNum).removeClass("col-md-8").addClass("col-md-10");
        }
        else {
            $(sideDivId).css("display", "inline");
            $.LoadingOverlay("hide");
            $("#content_dv" + obj.EbSid + "_" + this.tabNum).removeClass("col-md-10").addClass("col-md-8");
        }
        $(subDivId).focusin();
    }.bind(this);

    if (this.EbObject === null) {
        this.EbObject = new EbObjects["EbChartVisualization"]("chart_" + Date.now());
        split.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum, "EbChartVisualization");
        this.propGrid = new Eb_PropertyGrid("ppgrid_dv" + this.EbObject.EbSid + "_" + this.tabNum);
        this.propGrid.setObject(this.EbObject, AllMetas["EbChartVisualization"]);
    }
    else {
        split.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum, "EbChartVisualization");
        this.propGrid = new Eb_PropertyGrid("ppgrid_dv" + this.EbObject.EbSid + "_" + this.tabNum);
        this.propGrid.setObject(this.EbObject, AllMetas["EbChartVisualization"]);
        this.call2FD();
    }



    this.propGrid.PropertyChanged = function (obj, Pname) {
        this.EbObject = obj;
        if (Pname == "DataSourceRefId") {
            if (obj[Pname] !== null) {
                this.PcFlag = "True";
                this.call2FD();
            }
        }
        else if (Pname == "Name") {
            $("#objname").text(obj.Name);
            console.log(obj);
        }
        else if (Pname == "Columns") {
            console.log(obj);
        }
    }.bind(this);

    this.init = function () {
        this.columnInfo = this.EbObject;
        this.tableId = "dv" + this.EbObject.EbSid + "_" + this.tabNum;
        $.event.props.push('dataTransfer');
        this.createChartDivs();
        //if (!this.flagAppendColumns) {
        this.appendColumns();
        this.appendXandYAxis();
        //}
        if (this.data) {
            this.drawGraphHelper(this.data)
        }
        else {
            $.ajax({
                type: 'POST',
                url: this.ssurl + '/ds/data/' + this.columnInfo.DataSourceRefId,
                data: { draw: 1, RefId: this.columnInfo.DataSourceRefId, Start: 0, Length: 50, TFilters: [], Params: JSON.stringify(getFilterValues()) },
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + getToken());
                },
                success: this.getDataSuccess.bind(this),
                error: function () { }
            });
            //$.post(this.ssurl + '/ds/data/' + this.columnInfo.DataSourceRefId, { draw: 1, RefId: this.columnInfo.DataSourceRefId, Start: 0, Length: 50, TFilters: [], Token: getToken(), rToken: getrToken(), Params: JSON.stringify(getFilterValues()) }, this.getDataSuccess.bind(this));
        }
    };

    this.createChartDivs = function () {
        if (this.columnInfo.$type.indexOf("EbChartVisualization") !== -1) {
            $("#content_" + this.tableId).empty();
            $("#content_" + this.tableId).append(
                "<div id='graphcontainer_tab" + this.tableId + "'>" +
                "<div class='col-md-2 no-padd' id='columnsDisplay" + this.tableId + "'>" +
                "<div class='tag-cont'>" +
                "  <div class='tag-wraper'><div class='pgHead'>Dimensions</div><div class='tag-scroll'><div id='diamension" + this.tableId + "'></div></div></div>" +
                "  <div class='tag-wraper'><div class='pgHead'>Measures</div><div class='tag-scroll'><div id='measure" + this.tableId + "'></div></div></div>" +
                "</div>" +
                "</div> " +
                "<div class='col-md-10' id='canvasParentDiv" + this.tableId + "'>" +
                "<div id='xy" + this.tableId + "' style='vertical-align: top;'> " +
                "<div class='input-group' > " +
                "<span class='input-group-addon' id='basic-addon3'> X - Axis</span> " +
                "<div class='form-control' style='padding: 4px;height:33px' id='X_col_name" + this.tableId + "' ></div> " +
                "</div> " +
                "<div class='input-group' style='padding-top: 1px;'> " +
                "<span class='input-group-addon' id='basic-addon3'> Y - Axis</span> " +
                "<div class='form-control' style='padding: 4px;height:33px' id='Y_col_name" + this.tableId + "'></div> " +
                "</div> " +
                "</div> " +
                "<input type='color' id='fontSel' style='display:none;'>" +
                "<div id='canvasDiv'><canvas id='myChart" + this.tableId + "'></canvas></div> " +
                "</div> " +
                "</div>");
            this.GenerateButtons();
        }
    };

    this.GenerateButtons = function () {
        $("#obj_icons").empty();
        //$("#obj_icons").children().not("#btnGo"+this.tabNum).remove();
        $("#obj_icons").append("<button id='btnGo" + this.tableId + "' class='btn commonControl'><i class='fa fa-play' aria-hidden='true'></i></button>");
        $("#btnGo" + this.tableId).click(this.init.bind(this));
        $("#obj_icons").append("<div style='display: inline;'>" +
            "<div class='dropdown' id='graphDropdown_tab" + this.tableId + "' style='display: inline-block;padding-top: 1px;'>" +
            "<button class='btn dropdown-toggle' type='button' data-toggle='dropdown'>" +
            "<span class='caret'></span>" +
            "</button>" +
            "<ul class='dropdown-menu'>" +
            "<li><a href='#'><i class='fa fa-line-chart custom'></i> Line</a></li>" +
            "<li><a href='#'><i class='fa fa-bar-chart custom'></i> Bar </a></li>" +
            "<li><a href='#'><i class='fa fa-area-chart custom'></i> AreaFilled </a></li>" +
            "<li><a href='#'><i class='fa fa-pie-chart custom'></i> pie </a></li>" +
            "<li><a href='#'> doughnut </a></li>" +
            "<li><a href='#'> map </a></li>" +
            "</ul>" +
            "</div>" +
            "<button id='reset_zoom" + this.tableId + "' class='btn'>Reset zoom</button>" +
            "<button id='btnColumnCollapse" + this.tableId + "' class='btn' style='display: inline-block;'>" +
            "<i class='fa fa-cog' aria-hidden='true'></i>" +
            "</button>");
        if (this.EbObject !== null && this.EbObject.Type !== null)
            $("#graphDropdown_tab" + this.tableId + " button:first-child").html(this.EbObject.Type.trim() + "&nbsp;<span class = 'caret'></span>");
        this.bindEvents();

    };

    this.bindEvents = function () {
        $("#reset_zoom" + this.tableId).off("click").on("click", this.ResetZoom.bind(this));
        $("#graphDropdown_tab" + this.tableId + " .dropdown-menu li a").off("click").on("click", this.setGraphType.bind(this));
        $("#btnColumnCollapse" + this.tableId).off("click").on("click", this.collapseGraph.bind(this));
    }

    this.appendColumns = function () {
        var colsAll_XY = [], Xcol = [], Ycol = [], colsAll_X = [];
        var tid = this.tableId;
        if (this.columnInfo.Xaxis.$values.length > 0 && this.columnInfo.Yaxis.$values.length > 0) {
            $.each(this.columnInfo.Xaxis.$values, this.AddXcolumns.bind(this, Xcol));
            $.each(this.columnInfo.Columns.$values, this.RemoveXcolumns.bind(this, colsAll_X, Xcol));
            $.each(this.columnInfo.Yaxis.$values, this.AddYcolumns.bind(this, Ycol));
            $.each(colsAll_X, this.RemoveYcolumns.bind(this, colsAll_XY, Ycol));
            $("#diamension" + tid).empty();
            $("#measure" + tid).empty();
        }
        else {
            colsAll_XY = this.columnInfo.Columns.$values;
            $("#diamension" + tid).empty();
            $("#measure" + tid).empty();
        }
        $.each(colsAll_XY, function (i, obj) {
            if (obj.data != undefined) {
                if (gettypefromNumber(obj.Type) === "String" || gettypefromNumber(obj.Type) === "DateTime")
                    $("#diamension" + tid).append("<div class='colTile columnDrag' id='li" + obj.name + "' data-id='" + obj.data + "'>" + obj.name + "</div>");
                else if (gettypefromNumber(obj.Type) === "Numeric")
                    $("#measure" + tid).append("<div class='colTile columnDrag' id='li" + obj.name + "' data-id='" + obj.data + "'>" + obj.name + "</div>");
            }
        });

        this.drake = new dragula([document.getElementById("diamension" + tid), document.getElementById("measure" + tid), document.getElementById("X_col_name" + tid), document.getElementById("Y_col_name" + tid)], {
            accepts: this.acceptDrop.bind(this)
        });
        this.drake.on("drop", this.colDrop.bind(this));
        //this.drake.on("drag", this.colDrag.bind(this));
    };

    this.AddXcolumns = function (Xcol, i, obj) {
        Xcol.push(obj.name);
    };

    this.AddYcolumns = function (Ycol, i, obj) {
        Ycol.push(obj.name);
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
        if (this.columnInfo.Xaxis.$values.length > 0 && this.columnInfo.Yaxis.$values.length > 0) {
            $("#X_col_name" + tid).empty();
            $("#Y_col_name" + tid).empty();
            $.each(this.columnInfo.Xaxis.$values, function (i, obj) {
                $("#X_col_name" + tid).append("<div class='colTile columnDrag' style='margin: 0px 2px;padding: 0px 4px;width: auto; display:inline-block' id='li" + obj.name + "' data-id='" + obj.data + "'>" + obj.name + "<button class='close' type='button' style='font-size: 15px;margin: 2px 0 0 4px;' >x</button></div>");
                this.Xindx.push(obj.data);
            }.bind(this));
            $.each(this.columnInfo.Yaxis.$values, function (i, obj) {
                $("#Y_col_name" + tid).append("<div class='colTile columnDrag' style='margin: 0px 2px;padding: 0px 4px;width: auto; display:inline-block' id='li" + obj.name + "' data-id='" + obj.data + "'>" + obj.name + "<button class='close' type='button' style='font-size: 15px;margin: 2px 0 0 4px;' >x</button></div>");
                this.Yindx.push(obj.data);
            }.bind(this));
        }
        $("#X_col_name" + this.tableId + " button[class=close]").off("click").on("click", this.RemoveAndAddToColumns.bind(this));
        $("#Y_col_name" + this.tableId + " button[class=close]").off("click").on("click", this.RemoveAndAddToColumns.bind(this));

        this.flagAppendColumns = true;
    };

    this.acceptDrop = function (el, target, source, sibling) {
        if ($(source).attr("id") === "diamension" + this.tableId && $(target).attr("id") === "X_col_name" + this.tableId) {
            return true;
        }
        else if ($(source).attr("id") === "measure" + this.tableId && $(target).attr("id") === "Y_col_name" + this.tableId) {
            return true;
        }
        else if ($(source).attr("id") === "diamension" + this.tableId && $(target).attr("id") === "measure" + this.tableId) {
            return true;
        }
        else if ($(source).attr("id") === "measure" + this.tableId && $(target).attr("id") === "diamension" + this.tableId) {
            return true;
        }
        else if (source === target)
            return true;
        else {
            return false;
        }

    };

    this.getDataSuccess = function (result) {
        this.drawGraphHelper(result.data);
    };

    this.drawGraphHelper = function (datain) {
        this.data = datain;
        if (this.columnInfo.Xaxis.$values.length >= 1 && this.columnInfo.Yaxis.$values.length >= 1)
            this.drawGeneralGraph();
    };

    this.getBarData = function () {
        //this.Xindx = [];
        //this.Yindx = [];
        this.dataset = [];
        this.XLabel = [];
        this.YLabel = [];
        if (this.columnInfo.Xaxis.$values.length > 0 && this.columnInfo.Yaxis.$values.length > 0) {
            //$.each(this.columnInfo.Xaxis.$values, function (i, obj) {
            //    Xindx.push(obj.data);
            //});
            //$.each(this.columnInfo.Yaxis.$values, function (i, obj) {
            //    Yindx.push(obj.data);
            //});

            $.each(this.data, this.getBarDataLabel.bind(this));
            for (k = 0; k < this.Yindx.length; k++) {
                this.YLabel = [];
                for (j = 0; j < this.data.length; j++)
                    this.YLabel.push(this.data[j][this.Yindx[k]]);
                this.dataset.push(new datasetObj(this.columnInfo.Yaxis.$values[k].name, this.YLabel, getRandomColor(), false));
            }
        }
    };

    this.getBarDataLabel = function (i, value) {
        for (k = 0; k < this.Xindx.length; k++)
            this.XLabel.push(value[this.Xindx[k]]);
    };

    this.drawGeneralGraph = function () {
        $.LoadingOverlay("show");
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
                    },
                    ticks: {
                        fontSize: 10,
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
            pan: {
                enabled: true,
                mode: 'x',
            },
            legend: {
                onClick: this.legendClick.bind(this)
            }
        };

        this.RemoveCanvasandCheckButton();
    };

    this.RemoveCanvasandCheckButton = function () {
        var ty = $("#graphDropdown_tab" + this.tableId + " button:eq(0)").text().trim().toLowerCase();
        if (ty == "areafilled" || ty == "line") {
            if (this.gdata !== null) {
                $.each(this.gdata.datasets, this.GdataDSiterFn.bind(this));
                this.type = "line";
            }
            else
                this.drawGeneralGraph();
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
        if (this.columnInfo.Xaxis !== null && this.columnInfo.Yaxis !== null) {
            if (this.columnInfo.Type == null || this.columnInfo.Type == "") {
                $("#graphDropdown_tab" + this.tableId + " button:first-child").html("Bar" + "&nbsp;<span class = 'caret'></span>")
                this.columnInfo.Type = "bar";
            }
            else
                this.columnInfo.Type = this.type;
        }
        $("#graphcontainer_tab" + this.tableId).children("iframe").remove();
        $("#myChart" + this.tableId).remove();
        //$("#graphcontainer_tab" + this.tableId).append("<canvas id='myChart" + this.tableId + "'></canvas>");
        $("#canvasDiv").append("<canvas id='myChart" + this.tableId + "'></canvas>");

        if (this.columnInfo.Xaxis !== null && this.columnInfo.Yaxis !== null)
            this.drawGraph();
    };

    this.ApiDSiterFn = function (i, obj) {

        var ty = $("#graphDropdown_tab" + this.tableId + " button:eq(0)").text().trim().toLowerCase();
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

        var ty = $("#graphDropdown_tab" + this.tableId + " button:eq(0)").text().trim().toLowerCase();
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
            type: this.columnInfo.Type.trim().toLowerCase(),
            data: this.gdata,
            options: this.goptions
        });

        //this.modifyChart();
        $.LoadingOverlay("hide");
    };

    this.ResetZoom = function () {
        this.chartApi.resetZoom();
    };

    this.setGraphType = function (e) {
        var current = this;
        $("#graphDropdown_tab" + this.tableId + " button:first-child").html($(e.target).text().trim() + "&nbsp;<span class = 'caret'></span>");
        if ($(e.target).text().trim().toLowerCase() !== "map") {
            $("#graphcontainer_tab" + current.tableId).children("#map").remove();
            $("#graphcontainer_tab" + current.tableId).children("table").css("display", "block");
            this.type = $(e.target).text().trim().toLowerCase();
            this.RemoveCanvasandCheckButton();
        }
        else {
            $.ajax({
                type: "GET",
                url: "../DV/dvgoogle",
                success: function (text) {
                    $("#graphcontainer_tab" + current.tableId).children("iframe").remove();
                    $("#myChart" + current.tableId).remove();
                    $("#graphcontainer_tab" + current.tableId).children("table").css("display", "none");
                    $("#graphcontainer_tab" + current.tableId).append(text);
                }
            });
        }
        e.preventDefault();
    };

    this.colDrag = function (e) {
        //e.dataTransfer.setData("text", e.target.id);
        //this.sourceElement = e.target.parentNode.tagName;
        //this.sourceElementId = e.target.parentElement.id;
    };

    this.colDrop = function (el, target, source, sibling) {
        if ($(target).attr("id") === "X_col_name" + this.tableId || $(target).attr("id") === "Y_col_name" + this.tableId) {
            var temp;
            $(el).css("display", "inline-block");
            var name = $(el).text();
            $(el).append("<button class='close' type='button' style='font-size: 15px;margin: 0px 0 0 4px;color: black !important;' >x</button>");
            if ($(target).attr("id") == "X_col_name" + this.tableId) {
                //this.columnInfo.Xaxis.$values.push(new axis($(el).attr("data-id"), name));
                temp = $.grep(this.columnInfo.Columns.$values, function (obj) { return obj.name === name });
                this.columnInfo.Xaxis.$values.push(temp[0]);
                this.Xindx.push(temp[0].data);
            }
            if ($(target).attr("id") == "Y_col_name" + this.tableId) {
                //this.columnInfo.Yaxis.$values.push(new axis($(el).attr("data-id"), name));
                temp = $.grep(this.columnInfo.Columns.$values, function (obj) { return obj.name === name });
                this.columnInfo.Yaxis.$values.push(temp[0]);
                this.Yindx.push(temp[0].data);
            }

            if ($("#X_col_name" + this.tableId + " div").length == 1 && $("#Y_col_name" + this.tableId + " div").length >= 1) {
                this.drawGeneralGraph();
            }
            else {
                $("#myChart" + this.tableId).remove();
                $("#graphcontainer_tab" + this.tableId).append("<canvas id='myChart" + this.tableId + "'></canvas>");
            }
            console.log(this.columnInfo.Xaxis); console.log(this.columnInfo.Yaxis);
            $("#X_col_name" + this.tableId + " button[class=close]").off("click").on("click", this.RemoveAndAddToColumns.bind(this));
            $("#Y_col_name" + this.tableId + " button[class=close]").off("click").on("click", this.RemoveAndAddToColumns.bind(this));
        }

    };

    this.colAllowDrop = function (e) {
        e.preventDefault();
    };

    this.NocolAllowDrop = function (e) {
        e.stopPropagation();
    };

    this.collapseGraph = function () {
        $("#columnsDisplay" + this.tableId).toggle();
        $("#xy" + this.tableId).toggle();
        if ($("#columnsDisplay" + this.tableId).css("display") === "none") {
            $("#canvasParentDiv" + this.tableId).removeClass("col-md-10").addClass("col-md-12");
        }
        else
            $("#canvasParentDiv" + this.tableId).removeClass("col-md-12").addClass("col-md-10");
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
            $("#myChart" + this.tableId).css("margin-top", "-410px");
            //$("#btnColumnCollapse" + this.tableId).children().remove();
            //$("#btnColumnCollapse" + this.tableId).append("<i class='fa fa-chevron-up' aria-hidden='true'></i>")
        }
    };

    this.RemoveAndAddToColumns = function (e) {
        var str = $(e.target).parent().text();
        var index = parseInt($(e.target).parent().attr("data-id"));
        if ($(e.target).parent().parent().attr("id") === "X_col_name" + this.tableId) {
            $("#diamension" + this.tableId).append("<div class='colTile columnDrag' id='li" + str.substr(0, str.length - 1) + "' data-id='" + $(e.target).parent().attr("data-id") + "'>" + str.substr(0, str.length - 1) + "</div>");
            //index = this.Xindx.indexOf($(e.target).parent().attr("data-id"));
            this.Xindx.pop(index);
        }
        else if ($(e.target).parent().parent().attr("id") === "Y_col_name" + this.tableId) {
            $("#measure" + this.tableId).append("<div class='colTile columnDrag' id='li" + str.substr(0, str.length - 1) + "' data-id='" + $(e.target).parent().attr("data-id") + "'>" + str.substr(0, str.length - 1) + "</div>");
            //index = this.Yindx.indexOf($(e.target).parent().attr("data-id"));
            this.Yindx.pop(index);
        }
            //$("#columns4Drag" + this.tableId + " .list-group").append("<li class='alert alert-success columnDrag' id='" + $(e.target).parent().attr("id") + "' draggable='true' data-id='" + $(e.target).parent().attr("data-id") + "'>" + str.substring(0, str.length - 1).trim() + "</li>");
        $(e.target).parent().remove();
        //$("#columns4Drag" + this.tableId + " .columnDrag").off("dragstart").on("dragstart", this.colDrag.bind(this));
        this.columnInfo.Xaxis.$values = $.grep(this.columnInfo.Xaxis.$values, function (vobj) { return vobj.name !== str.substring(0, str.length - 1).trim() });
        this.columnInfo.Yaxis.$values = $.grep(this.columnInfo.Yaxis.$values, function (vobj) { return vobj.name !== str.substring(0, str.length - 1).trim() });
        //this.columnInfo.Xaxis = this.
        //this.Xindx = $.grep(this.Xindx, function (obj) { return obj.name !== str.substring(0, str.length - 1).trim() });
        //this.Yindx = $.grep(this.Yindx, function (obj) { return obj.name !== str.substring(0, str.length - 1).trim() });

        if ($("#X_col_name" + this.tableId + " div").length == 1 && $("#Y_col_name" + this.tableId + " div").length >= 1) {
            this.drawGeneralGraph();
        }
        else {
            $("#myChart" + this.tableId).remove();
            $("#graphcontainer_tab" + this.tableId).append("<canvas id='myChart" + this.tableId + "' width='auto' height='auto'></canvas>");
        }
    };

    this.searchDragNDropColumn = function (e) {
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

    this.legendClick = function (event, legendItem) {
        if (this.chartApi !== null) {
            $("#fontSel").click();
        }
        $("#fontSel").off("change").on("change", this.reloadChart.bind(this, legendItem));
    }

    this.reloadChart = function (legendItem) {
        $.each(this.gdata.datasets, this.reloadChart_inner.bind(this, legendItem));
        this.RemoveCanvasandCheckButton();
    };

    this.reloadChart_inner = function (legendItem, i, obj) {
        if (i === legendItem.datasetIndex)
            this.gdata.datasets[i].backgroundColor = $("#fontSel").val();
    };


};

{
    //var eb_chart111 = function (columnInfo, ssurl, data, tableId) {
    //    this.data = data;
    //    this.columnInfo = columnInfo;
    //    //this.type = (this.columnInfo.options === null || this.columnInfo.options === undefined) ? "bar" : this.columnInfo.options.type.trim().toLowerCase();
    //    this.ssurl = ssurl;
    //    this.chartJs = null;
    //    this.tableId = tableId;
    //    // functions

    //    this.init = function () {
    //        if (this.columnInfo.$type.indexOf("EbChartVisualization") !== -1) {
    //            $("#Toolbar").children(":not(.commonControls)").remove();
    //            $("#content_" + this.tableId).append("<div id='graphcontainer_tab" + this.tableId + "'>" +
    //                "<table>" +
    //                "<tr>" +
    //                "<td colspan=2>" +
    //                "<div id=id='xy" + this.tableId + "' style='vertical-align: top;width: 300%;'> " +
    //                "<div class='input-group' > " +
    //                "<span class='input-group-addon' id='basic-addon3'> X - Axis</span> " +
    //                "<div class='form-control' style='padding: 4px;height:33px' id='X_col_name" + this.tableId + "' ></div> " +
    //                "</div> " +
    //                "<div class='input-group' style='padding-top: 1px;'> " +
    //                "<span class='input-group-addon' id='basic-addon3'> Y - Axis</span> " +
    //                "<div class='form-control' style='padding: 4px;height:33px' id='Y_col_name" + this.tableId + "'></div> " +
    //                "</div> " +
    //                "</div> " +
    //                "</td>" +
    //                "</tr>" +
    //                "<tr>" +
    //                "<td>" +
    //                "<div id='columns4Drag" + this.tableId + "' style='width:200px'> " +
    //                "<div>" +
    //                "<label class='nav-header disabled' > <center><strong>Columns</strong></center> <center><font size='1'>Darg n Drop to X or Y Axis</font></center></label> " +
    //                "<input id='searchColumn" + this.tableId + "' type='text' class='form-control' placeholder='search for column'/>" +
    //                "<ul class='list-group' style='height: 450px; overflow-y: auto;' ></ul> " +
    //                "</div> " +
    //                "</div> " +
    //                "</td > " +
    //                "<td>" +
    //                //"<canvas id='myChart" + this.tableId + "' width='80%' height='auto' ></canvas> " +
    //                "</td > " +
    //                "</tr>" +
    //                "</table>" +
    //                "</div>");
    //            this.createButtons();
    //            this.chartJs = new Eb_chartJSgraph( this.data, this.columnInfo, this.ssurl, tableId);
    //        }
    //    };

    //    this.createButtons = function () {
    //        $("#Toolbar").append("<label class='dvname' style='color: #333;'>" + this.columnInfo.Name + "</label>" +
    //            "<div class='dropdown' id='graphDropdown_tab" + this.tableId + "' style='display: inline-block;padding-top: 1px;'>" +
    //            "<button class='tools dropdown-toggle' type='button' data-toggle='dropdown'>" +
    //            "<span class='caret'></span>" +
    //            "</button>" +
    //            "<ul class='dropdown-menu'>" +
    //            "<li><a href='#'><i class='fa fa-line-chart custom'></i> Line</a></li>" +
    //            "<li><a href='#'><i class='fa fa-bar-chart custom'></i> Bar </a></li>" +
    //            "<li><a href='#'><i class='fa fa-area-chart custom'></i> AreaFilled </a></li>" +
    //            "<li><a href='#'><i class='fa fa-pie-chart custom'></i> pie </a></li>" +
    //            "<li><a href='#'> doughnut </a></li>" +
    //            "<li><a href='#'> map </a></li>" +
    //            "</ul>" +
    //            "</div>" +
    //            "<button id='reset_zoom" + this.tableId + "' class='tools'>Reset zoom</button>" +
    //            "<button id='btnColumnCollapse" + this.tableId + "' class='tools' style='display: inline-block;'>" +
    //            "<i class='fa fa-cog' aria-hidden='true'></i>" +
    //            "</button>");

    //    };

    //    this.drawGraphHelper = function (datain) {
    //        this.chartJs.drawGraphHelper(datain);
    //    }

    //    this.init();
    //}
}