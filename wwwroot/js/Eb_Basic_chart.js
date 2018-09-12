
var EbBasicChart = function (Option) {
    this.data = Option.data || null;
    this.XLabel = [];
    this.YLabel = [];
    this.dataset = [];
    this.chartApi = null;
    this.gdata = null;
    this.goptions = null;
    this.Xindx = []; this.Yindx = [];
    this.tableId = Option.tableId;
    this.sourceElement = null;
    this.flagAppendColumns = false;
    this.drake = null;
    this.EbObject = Option.dvObject || null;
    this.Refid = null;
    this.tabNum = null;
    this.type = null;
    this.PcFlag = false;
    this.login = null;
    this.relatedObjects = null;
    this.FD = false;
    this.piedataFlag = false;
    this.MainData = (data === undefined) ? null : data;
    this.isPipped = false;
    this.isContextual = false;
    this.filterValues = [];
    this.rowData = null;
    this.isTagged = false;
    this.bot = false;
    this.cellData = null;
    this.filterHtml = "";
    var _icons = {
        "bar": "fa fa-bar-chart",
        "line": "fa fa-line-chart",
        "pie": "fa fa-pie-chart",
        "area": "fa fa-area-chart",
        "horizontalBar": "fa fa-bar-chart"
    };

    this.start = function () {
        if (this.EbObject === null)
            this.EbObject = new EbChartVisualization("Chart");
        this.type = this.EbObject.Type;
        if (this.data === null)
            this.call2FD();
        else
            this.drawGraphHelper(this.data);
    };

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
        $("#" + this.contId).append(text);////////////////        
        this.EbObject = dvGlobal.Current_obj;
        this.init();
    }.bind(this);

    this.init = function () {
        this.EbObject = this.EbObject;
        this.type = this.EbObject.Type;
        this.filterValues = this.getFilterValues();
        $.LoadingOverlay("show");
        $.ajax({
            type: 'POST',
            url: "../DV/getdata",
            data: { draw: 1, RefId: this.EbObject.DataSourceRefId, Start: 0, Length: 50, TFilters: [], Params: this.getFilterValues() },
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + getToken());
            },
            success: this.getDataSuccess.bind(this),
            error: function () { }
        });
    };

    this.getFilterValues = function () {
        var fltr_collection = [];
        var FdCont = ".filterCont";
        var paramstxt = $(FdCont + " #all_control_names").val();//$('#hiddenparams').val().trim();datefrom,dateto
        if (paramstxt != undefined) {
            var params = paramstxt.split(',');
            $.each(params, function (i, id) {
                var v = null;
                var dtype = $(FdCont + ' #' + id).attr('data-ebtype');
                if (dtype === '6')
                    v = $(FdCont + ' #' + id).val().substring(0, 10);
                else if (dtype === '3')
                    v = $(FdCont).children().find("[name=" + id + "]:checked").val();
                else {
                    v = $(FdCont + ' #' + id).val();
                    if (dtype === '16' && !(isNaN(v))) {
                        v = parseInt(v);
                        dtype = 8;
                    }
                }

                if (v !== "")
                    fltr_collection.push(new fltr_obj(dtype, id, v));
            });
        }

        //if (this.rowData !== null) {
        //    $.each(this.rowData, this.rowObj2filter.bind(this, fltr_collection));
        //}

        return fltr_collection;
    };

    this.compareFilterValues = function () {
        var filter = this.getFilterValues();
        if (focusedId !== undefined) {
            $.each(filter, function (i, obj) {
                if (obj.value !== dvcontainerObj.dvcol[focusedId].filterValues[i].value) {
                    filterChanged = true;
                    return false;
                }

            }.bind(this));
            //if (f == null)
            //    return true;
            //else
            //    return false;
        }
        else
            filterChanged = true;
        //return false;
    }

    this.getDataSuccess = function (result) {
        $.LoadingOverlay("hide");
        //this.MainData = result.data; 
        if (this.login == "uc")
            dvcontainerObj.currentObj.data = result;
        this.drawGraphHelper(result.data);
    };

    this.drawGraphHelper = function (datain) {
        this.data = datain;
        this.drawGeneralGraph();
    };

    this.getBarData = function () {
        this.Xindx = [];
        this.Yindx = [];
        this.dataset = [];
        this.XLabel = [];
        this.YLabel = [];
        var xdx = [], ydx = [], ml = [], info = [];
        if (this.EbObject.Xaxis.$values.length > 0 && this.EbObject.Yaxis.$values.length > 0) {

            $.each(this.EbObject.Xaxis.$values, function (i, obj) {
                xdx.push(obj.data);
            });

            $.each(this.EbObject.Yaxis.$values, function (i, obj) {
                ydx.push(obj.data);
            });

            $.each(this.data, this.getBarDataLabel.bind(this, xdx));

            for (k = 0; k < ydx.length; k++) {
                this.YLabel = [];
                for (j = 0; j < this.data.length; j++)
                    this.YLabel.push(this.data[j][ydx[k]]);
                if (this.type !== "googlemap") {
                    if (this.type !== "pie") {
                        this.piedataFlag = false;
                        this.dataset.push(new datasetObj(this.EbObject.Yaxis.$values[k].name, this.YLabel, this.EbObject.LegendColor.$values[k].color, this.EbObject.LegendColor.$values[k].color, false));
                    }
                    else {
                        this.dataset.push(new datasetObj4Pie(this.EbObject.Yaxis.$values[k].name, this.YLabel, this.EbObject.LegendColor.$values[k].color, this.EbObject.LegendColor.$values[k].color, false));
                        this.piedataFlag = true;
                    }
                }
            }

            if (this.type === "googlemap") {
                $.each(this.EbObject.MarkerLabel.$values, function (i, obj) {
                    if (i === 0)
                        ml.push(obj.data);
                });

                if (ml.length > 0) {
                    $.each(this.data, function (i, value) {
                        markLabel.push(value[ml[0]].charAt(0));
                    });
                }
                Inform = [];
                $.each(this.EbObject.InfoWindow.$values, function (i, obj) {
                    info = [];
                    $.each(this.data, function (k, value) {
                        info.push(value[obj.data]);
                    });
                    Inform.push(new informaion(obj.name, info));
                }.bind(this));
            }

        }
    };

    this.getBarDataLabel = function (xdx, i, value) {
        for (k = 0; k < xdx.length; k++)
            this.XLabel.push(value[xdx[k]]);
    };

    this.drawGeneralGraph = function () {
        this.getBarData();
        if (this.type === "googlemap") {
            //this.getData4GoogleMap();
            TableId = this.tableId;
            $("#canvasDiv" + this.tableId).children("iframe").remove();
            $("#myChart" + this.tableId).remove();
            if ($("#map" + this.tableId).children().length === 0)
                $("#canvasDiv" + this.tableId).append("<div id='map" + this.tableId + "' style='height:inherit;width:100%;'></div>");
            Xlabel = this.XLabel;
            Ylabel = this.YLabel;
            showRoute = this.EbObject.ShowRoute;
            if (!this.isMyScriptLoaded("https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js")) {
                $("#layout_div").prepend(`
                <script src= "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js" ></script>
                <script async defer
                    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAh12bqSKCYb6sJ9EVzNkEyXEDZ__UA-TE&callback=initMap">
                </script>`);
            }
            else {
                $("#map" + this.tableId).empty();
                initMap();
            }

            $.LoadingOverlay("hide");
            if (this.bot) {
                $("#map" + this.tableId).css("height", "inherit");
                $("#map" + this.tableId).css("margin-top", "10px");
            }
            return false;
        }
        else {
            this.gdata = {
                labels: this.XLabel,
                datasets: this.dataset,
            };
            //this.animateOPtions = (this.EbObject.ShowValue) ? new animateObj(0) : false;
            this.goptions = {
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: (this.type !== "pie") ? true : false,
                            labelString: (this.EbObject.YaxisTitle !== "") ? this.EbObject.YaxisTitle : "YLabel",
                            fontColor: (this.EbObject.YaxisTitleColor !== null && this.EbObject.YaxisTitleColor !== "#ffffff") ? this.EbObject.YaxisTitleColor : "#000000"
                        },
                        stacked: false,
                        gridLines: {
                            display: (this.type !== "pie") ? true : false
                        },
                        ticks: {
                            fontSize: 10,
                            fontColor: (this.EbObject.YaxisLabelColor !== null && this.EbObject.YaxisTitleColor !== "#ffffff") ? this.EbObject.YaxisLabelColor : "#000000"
                        },
                        display: (this.type !== "pie") ? true : false
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: (this.type !== "pie") ? true : false,
                            labelString: (this.EbObject.XaxisTitle !== "") ? this.EbObject.XaxisTitle : "XLabel",
                            fontColor: (this.EbObject.XaxisTitleColor !== null && this.EbObject.YaxisTitleColor !== "#ffffff") ? this.EbObject.XaxisTitleColor : "#000000"
                        },
                        gridLines: {
                            display: (this.type !== "pie") ? true : false
                        },
                        ticks: {
                            fontSize: 10,
                            fontColor: (this.EbObject.XaxisLabelColor !== null && this.EbObject.YaxisTitleColor !== "#ffffff") ? this.EbObject.XaxisLabelColor : "#000000"
                        },
                        display: (this.type !== "pie") ? true : false
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
                    onClick: this.legendClick.bind(this),
                    //position: "left"
                },
                //legend:false,
                //legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>",

                tooltips: {
                    enabled: this.EbObject.ShowTooltip,
                    callbacks: {
                        label: this.toolTipCallback
                    }
                },
                segmentShowStroke: this.EbObject.ShowValue && this.type === "pie",
                segmentStrokeWidth: 2,
                animation: {
                    animateRotate: true,
                    duration: 1,
                    //onProgress: (this.EbObject.ShowValue && this.type === "pie") ? this.animationOnProgress : null,
                    onComplete: (this.EbObject.ShowValue && this.type !== "pie") ? this.animationOnComplete : null
                },
            };
            if (this.EbObject.Xaxis.$values.length > 0 && this.EbObject.Xaxis.$values.length > 0)
                this.RemoveCanvasandCheckButton();

            $.LoadingOverlay("hide");
        }

    };

    this.RemoveCanvasandCheckButton = function () {
        if (this.type == null) {
            this.type = "bar";
            //$("#graphDropdown_tab" + this.tableId + " button:first-child").html("<i class='"+_icons["bar"]+"'></i>" + "&nbsp;<span class = 'caret'></span>")
        }
        else {
            this.type = this.type.toLowerCase();
            //$("#graphDropdown_tab" + this.tableId + " button:first-child").html("<i class='" + _icons["bar"] + "'></i>" + "&nbsp;<span class = 'caret'></span>")
        }

        if (this.type == "area" || this.type == "line") {
            if (this.gdata !== null) {
                $.each(this.gdata.datasets, this.GdataDSiterFn.bind(this));
                if (this.piedataFlag)
                    this.drawGeneralGraph();
                this.type = "line";
                if (this.gdata.datasets[0].fill === true)
                    $("#graphDropdown_tab" + this.tableId + " button:first-child").html(`<i class='${_icons["area"]}'></i>&nbsp;<span class = 'caret'></span>`);
                else
                    $("#graphDropdown_tab" + this.tableId + " button:first-child").html(`<i class='${_icons["line"]}'></i>&nbsp;<span class = 'caret'></span>`);
            }
            else
                this.drawGeneralGraph();
        }
        else if (this.type == "bar") {
            if (this.piedataFlag) {
                this.drawGeneralGraph();
            }
            $("#graphDropdown_tab" + this.tableId + " button:first-child").html(`<i class='${_icons["bar"]}'></i>&nbsp;<span class = 'caret'></span>`);
        }
        else if (this.type == "pie") {
            if (!this.piedataFlag)
                this.drawGeneralGraph();
            $("#graphDropdown_tab" + this.tableId + " button:first-child").html(`<i class='${_icons["pie"]}'></i>&nbsp;<span class = 'caret'></span>`);
            delete this.goptions.legend["onClick"];
        }
        else if (this.type == "horizontalbar") {
            if (this.piedataFlag) {
                this.drawGeneralGraph();
            }
            this.type = "horizontalBar"
            $("#graphDropdown_tab" + this.tableId + " button:first-child").html(`<i class='${_icons["horizontalBar"]}'></i>&nbsp;<span class = 'caret'></span>`);
        }


        $("#canvasDiv" + this.tableId).children("iframe").remove();
        $("#myChart" + this.tableId).remove();
        //$("#graphcontainer_tab" + this.tableId).append("<canvas id='myChart" + this.tableId + "'></canvas>");
        $("#canvasDiv" + this.tableId).append("<canvas id='myChart" + this.tableId + "'></canvas>");

        if (this.EbObject.Xaxis.$values.length > 0 && this.EbObject.Yaxis.$values.length > 0)
            this.drawGraph();


    };

    this.GdataDSiterFn = function (j, obj) {
        var cls = $("#graphDropdown_tab" + this.tableId + " button:eq(0) i").attr("class");

        if (cls !== undefined && cls.indexOf("area") !== -1) {
            this.gdata.datasets[j].fill = true;
            this.type = "area";
        }
        else {
            this.gdata.datasets[j].fill = false;
            this.type = "line";
        }
    }

    this.drawGraph = function () {
        this.EbObject.Type = this.type;
        var canvas = document.getElementById("myChart" + this.tableId);

        this.chartApi = new Chart(canvas, {
            type: this.EbObject.Type.trim(),
            data: this.gdata,
            options: this.goptions,
        });
        $.LoadingOverlay("hide");
    };

    this.ResetZoom = function () {
        this.chartApi.resetZoom();
    };

    this.setGraphType = function (e) {
        var current = this;
        this.type = $(e.target).parent().parent().next().text().toLowerCase();
        $("#graphDropdown_tab" + this.tableId + " button:first-child").html(`<i class='${_icons[this.type]}'></i>&nbsp;<span class = 'caret'></span>`);
        if (this.type.trim() !== "googlemap") {
            if (this.EbObject.$type.indexOf("EbGoogleMap") !== -1) {
                $("#canvasDiv" + this.tableId).children("#map").remove();
                var refid = this.EbObject.DataSourceRefId;
                var columns = JSON.parse(JSON.stringify(this.EbObject.Columns));
                var pipe = this.EbObject.Pippedfrom;
                this.EbObject = new EbObjects["EbChartVisualization"](this.EbObject.EbSid);
                this.EbObject.DataSourceRefId = refid;
                this.EbObject.DSColumns = columns;
                this.EbObject.Columns = columns;
                this.EbObject.Pippedfrom = pipe;

                this.propGrid.setObject(this.EbObject, AllMetas["EbChartVisualization"]);
                this.EbObject = this.EbObject;
                this.gdata = null;
                this.updateDragula();
            }
            if (this.EbObject.Xaxis.$values.length > 0 && this.EbObject.Xaxis.$values.length > 0)
                this.RemoveCanvasandCheckButton();
            else
                return false;
        }
        else {
            var refid = this.EbObject.DataSourceRefId;
            var columns = JSON.parse(JSON.stringify(this.EbObject.Columns));
            $("#canvasDiv" + this.tableId).children("iframe").remove();
            $("#myChart" + this.tableId).remove();
            var pipe = this.EbObject.Pippedfrom;
            this.EbObject = new EbObjects["EbGoogleMap"](this.EbObject.EbSid);
            this.EbObject.DataSourceRefId = refid;
            this.EbObject.DSColumns = columns;
            this.EbObject.Columns = columns;
            this.EbObject.Pippedfrom = pipe;
            this.propGrid.setObject(this.EbObject, AllMetas["EbGoogleMap"]);
            this.EbObject = this.EbObject;

            this.updateDragula();
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
            $(el).addClass("columnDrag");
            $(el).children("span").remove();
            var temp;
            $(el).css("display", "inline-block");
            var name = $(el).text();
            $(el).append("<button class='close' type='button'>x</button>");
            if ($(target).attr("id") == "X_col_name" + this.tableId) {
                //this.EbObject.Xaxis.$values.push(new axis($(el).attr("data-id"), name));
                temp = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.name === name });
                this.EbObject.Xaxis.$values.push(temp[0]);
                //this.Xindx.push(temp[0].data);
            }
            if ($(target).attr("id") == "Y_col_name" + this.tableId) {
                //this.EbObject.Yaxis.$values.push(new axis($(el).attr("data-id"), name));
                temp = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.name === name });
                this.EbObject.Yaxis.$values.push(temp[0]);
                //this.Yindx.push(temp[0].data);
                if (this.type !== "googlemap")
                    this.EbObject.LegendColor.$values.push(new ChartColor(name, randomColor()));
            }

            if ($("#X_col_name" + this.tableId + " li").length == 1 && $("#Y_col_name" + this.tableId + " li").length >= 1) {
                this.drawGeneralGraph();
            }
            else {
                $("#myChart" + this.tableId).remove();
                $("#canvasDiv" + this.tableId).append("<canvas id='myChart" + this.tableId + "'></canvas>");
            }
            console.log(this.EbObject.Xaxis); console.log(this.EbObject.Yaxis);
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
            $("#canvasDiv" + this.tableId).css("height", "100%");
            //$("#myChart" + this.tableId).css("height", "inherit");
        }
        else {
            $("#canvasParentDiv" + this.tableId).removeClass("col-md-12").addClass("col-md-10");
            $("#canvasDiv" + this.tableId).css("height", "calc(100% - 67px)");
        }
    };

    this.toggleFilterdialog = function () {
        $(".filterCont").toggle();
    };

    this.togglePPGrid = function () {
        $("#Relateddiv").hide();
        $(".ppcont").toggle();
    };

    this.RemoveAndAddToColumns = function (e) {
        var str = $(e.target).parent().text();
        var index = parseInt($(e.target).parent().attr("data-id"));
        if ($(e.target).parent().parent().attr("id") === "X_col_name" + this.tableId) {
            if (gettypefromNumber($(e.target).parent().attr("data-type")) === "String")
                $("#diamension" + this.tableId).append(`<li class='colTiles' style='display: list-item;' id='li${str.substr(0, str.length - 1)}' data-id='${$(e.target).parent().attr("data-id")}' data-type='${$(e.target).parent().attr("data-type")}'><span><i class='fa fa-font'></i></span>${str.substr(0, str.length - 1)}</li>`);
            else if (gettypefromNumber($(e.target).parent().attr("data-type")) === "DateTime")
                $("#diamension" + this.tableId).append(`<li class='colTiles' style='display: list-item;' id='li${str.substr(0, str.length - 1)}' data-id='${$(e.target).parent().attr("data-id")}' data-type='${$(e.target).parent().attr("data-type")}'><span><i class='fa fa-calendar'></i></span>${str.substr(0, str.length - 1)}</li>`);
            //index = this.Xindx.indexOf($(e.target).parent().attr("data-id"));
            //this.Xindx.pop(index);
        }
        else if ($(e.target).parent().parent().attr("id") === "Y_col_name" + this.tableId) {
            $("#measure" + this.tableId).append(`<li class='colTiles' style='display: list-item;' id='li${str.substr(0, str.length - 1)}' data-id='${$(e.target).parent().attr("data-id")}' data-type='${$(e.target).parent().attr("data-type")}'><span><i class='fa fa-sort-numeric-asc'></i></span>${str.substr(0, str.length - 1)}</li>`);
            //index = this.Yindx.indexOf($(e.target).parent().attr("data-id"));
            //this.Yindx.pop(index);
        }
        //$("#columns4Drag" + this.tableId + " .list-group").append("<li class='alert alert-success columnDrag' id='" + $(e.target).parent().attr("id") + "' draggable='true' data-id='" + $(e.target).parent().attr("data-id") + "'>" + str.substring(0, str.length - 1).trim() + "</li>");
        $(e.target).parent().remove();
        //$("#columns4Drag" + this.tableId + " .columnDrag").off("dragstart").on("dragstart", this.colDrag.bind(this));
        this.EbObject.Xaxis.$values = $.grep(this.EbObject.Xaxis.$values, function (vobj) { return vobj.name !== str.substring(0, str.length - 1).trim() });
        this.EbObject.Yaxis.$values = $.grep(this.EbObject.Yaxis.$values, function (vobj) { return vobj.name !== str.substring(0, str.length - 1).trim() });
        if (this.type !== "googlemap")
            this.EbObject.LegendColor.$values = $.grep(this.EbObject.LegendColor.$values, function (vobj) { return vobj.name !== str.substring(0, str.length - 1).trim() });
        //this.EbObject.Xaxis = this.
        //this.Xindx = $.grep(this.Xindx, function (obj) { return obj.name !== str.substring(0, str.length - 1).trim() });
        //this.Yindx = $.grep(this.Yindx, function (obj) { return obj.name !== str.substring(0, str.length - 1).trim() });

        if ($("#X_col_name" + this.tableId + " li").length == 1 && $("#Y_col_name" + this.tableId + " li").length >= 1) {
            this.drawGeneralGraph();
        }
        else {
            $("#myChart" + this.tableId).remove();
            $("#canvasDiv" + this.tableId).append("<canvas id='myChart" + this.tableId + "' width='auto' height='auto'></canvas>");
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
        if (this.chartApi !== null && this.type !== "pie") {
            $("#fontSel").click();
        }
        $("#fontSel").off("change").on("change", this.reloadChart.bind(this, legendItem));
    }

    this.reloadChart = function (legendItem) {
        $.each(this.EbObject.LegendColor.$values, function (i, obj) {
            if (legendItem.text === obj.name)
                this.EbObject.LegendColor.$values[i].color = $("#fontSel").val();
        }.bind(this));
        if (this.type !== "pie") {
            if (this.gdata.datasets[0].fill === true)
                this.type = "area";
            $.each(this.gdata.datasets, this.reloadChart_inner.bind(this, legendItem));
        }
        else
            $.each(this.gdata.datasets, this.reloadChart4pie.bind(this, legendItem));

        if (this.EbObject.Xaxis.$values.length > 0 && this.EbObject.Xaxis.$values.length > 0)
            this.RemoveCanvasandCheckButton();
    };

    this.reloadChart_inner = function (legendItem, i, obj) {
        if (i === legendItem.datasetIndex) {
            this.gdata.datasets[i].backgroundColor = $("#fontSel").val();
            this.gdata.datasets[i].borderColor = $("#fontSel").val();
        }
    };

    this.reloadChart4pie = function (legendItem, i, obj) {
        this.gdata.datasets[i].backgroundColor[legendItem.index] = $("#fontSel").val();
        this.gdata.datasets[i].borderColor[legendItem.index] = $("#fontSel").val();
    }

    this.animationOnComplete = function () {
        var chartInstance = this.chart,
            ctx = chartInstance.ctx;

        ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        this.data.datasets.forEach(function (dataset, i) {
            var meta = chartInstance.controller.getDatasetMeta(i);
            meta.data.forEach(function (bar, index) {
                var data = dataset.data[index];
                ctx.fillText(data, bar._model.x, bar._model.y - 5);
            });
        });
    };

    this.animationOnProgress = function (animation) {
        var canvas = document.getElementById("myChart" + this.tableId);
        var ctx = canvas.getContext("2d");
        var midX = canvas.width / 2;
        var midY = canvas.height / 2

        var radius = this.chartApi.outerRadius;
        for (var i = 0; i < this.chartApi.segments.length; i++) {
            ctx.fillStyle = "white";
            var textSize = canvas.width / 10;
            ctx.font = textSize + "px Verdana";
            // Get needed variables
            var value = this.chartApi.segments[i].value;
            var startAngle = this.chartApi.segments[i].startAngle;
            var endAngle = this.chartApi.segments[i].endAngle;
            var middleAngle = startAngle + ((endAngle - startAngle) / 2);

            // Compute text location
            var posX = (radius / 2) * Math.cos(middleAngle) + midX;
            var posY = (radius / 2) * Math.sin(middleAngle) + midY;

            // Text offside by middle
            var w_offset = ctx.measureText(value).width / 2;
            var h_offset = textSize / 4;

            ctx.fillText(value, posX - w_offset, posY + h_offset);
        }
    }.bind(this);

    this.updateDragula = function (status) {
        if (this.EbObject.$type.indexOf("EbChartVisualization") !== -1) {
            if (this.drake)
                this.drake.destroy();
            this.drake = new dragula([document.getElementById("diamension" + this.tableId), document.getElementById("measure" + this.tableId), document.getElementById("X_col_name" + this.tableId), document.getElementById("Y_col_name" + this.tableId)], {
                accepts: this.acceptDrop.bind(this)
            });
            this.drake.on("drop", this.colDrop.bind(this));
            if (this.type === "")
                this.type = "bar";
            this.propGrid.setObject(this.EbObject, AllMetas["EbChartVisualization"]);
        }
        else {
            this.type = "googlemap";
            if (this.drake)
                this.drake.destroy();
            this.drake = new dragula([document.getElementById("diamension" + this.tableId), document.getElementById("measure" + this.tableId), document.getElementById("X_col_name" + this.tableId), document.getElementById("Y_col_name" + this.tableId)], {
                accepts: this.acceptDrop1.bind(this)
            });
            this.drake.on("drop", this.colDrop.bind(this));
            this.propGrid.setObject(this.EbObject, AllMetas["EbGoogleMap"]);
        }

        if (this.type !== "googlemap") {
            $("#X_col_name" + this.tableId).siblings("span").text("X-Axis");
            $("#Y_col_name" + this.tableId).siblings("span").text("Y-Axis");
            $("#graphDropdown_tab" + this.tableId).show();
        }
        else {
            $("#X_col_name" + this.tableId).siblings("span").text("Longitude");
            $("#Y_col_name" + this.tableId).siblings("span").text("Lattitude");
            $("#graphDropdown_tab" + this.tableId).hide();
        }

        if (status !== undefined) {
            if (this.EbObject.Xaxis.$values.length > 0 && this.EbObject.Xaxis.$values.length > 0) {
                if (this.type !== "googlemap") {
                    $.each(this.EbObject.Yaxis.$values, function (i, obj) {
                        this.EbObject.LegendColor.$values.push(new ChartColor(obj.name, randomColor()));
                    }.bind(this));
                }
                this.drawGeneralGraph();
            }

        }
    };

    this.acceptDrop1 = function (el, target, source, sibling) {
        if ($(source).attr("id") === "X_col_name" + this.tableId && $(target).attr("id") === "Y_col_name" + this.tableId) {
            return false;
        }
        else if ($(source).attr("id") === "Y_col_name" + this.tableId && $(target).attr("id") === "X_col_name" + this.tableId) {
            return false;
        }
        else if ($(target).children().length == 1) {
            return false;
        }
        return true;
    };

    this.isMyScriptLoaded = function (url) {
        var scripts = document.getElementsByTagName('script');
        for (var i = scripts.length; i--;) {
            if (scripts[i].src == url) return true;
        }
        return false;
    };

    this.rearrangeObjects = function () {
        this.EbObject.DataSourceRefId = this.prevObj.DataSourceRefId;
        this.EbObject.DSColumns = this.prevObj.DSColumns;
        this.EbObject.Columns = this.prevObj.Columns;
        this.EbObject.Xaxis = this.prevObj.Xaxis;
        this.EbObject.Yaxis = this.prevObj.Yaxis;
        this.EbObject.Pippedfrom = this.prevObj.Pippedfrom;
    }

    this.toolTipCallback = function (item, data) {
        if (this.type === "pie")
            return data.datasets[item.datasetIndex].label + ": " + data.labels[item.index] + ": " + data.datasets[item.datasetIndex].data[item.index];
    }.bind(this);

    this.CreateRelationString = function () { };

    this.start();
};