var datasetObj = function (label, data, backgroundColor, borderColor, fill) {
    this.label = label;
    this.data = data;
    this.backgroundColor = backgroundColor;
    this.borderColor = borderColor;
    this.fill = fill;
};
var datasetObj4Pie = function (label, data, backgroundColor, borderColor, fill) {
    this.label = label;
    this.data = data;
    var color = [], width = [];
    $.each(this.data, function (i, obj) {
        color.push(getRandomColor());
        width.push(1);
    });
    this.backgroundColor = color;
    this.borderColor = color;
    this.borderWidth = width;
};

var ChartColor = function (name, color) {
    this.name = name;
    this.color = color;
};

var animateObj = function (duration) {
    this.duration = duration;
    this.onComplete = function () {
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
}

var Xlabel, Ylabel, showRoute, markLabel = [], Inform = [], TableId;
var informaion = function (nam, val) {
    this.name = nam;
    this.value = val;
}
var eb_chart = function (refid, ver_num, type, dsobj, cur_status, tabNum, ssurl, login, counter, data, rowData, filterValues, cellData) {
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
    this.Refid = refid;
    this.tabNum = tabNum;
    this.type = null;
    this.PcFlag = false;
    this.login = login;
    this.relatedObjects = null;
    this.FD = false;
    this.piedataFlag = false;
    this.MainData = (data === undefined) ? null : data;
    this.isPipped = false;
    this.isContextual = false;
    this.filterValues = (filterValues !== "" && filterValues !== undefined) ? JSON.parse(filterValues) : [];
    this.rowData = (rowData !== undefined) ? rowData : null;
    this.isTagged = false;
    //this.filterChanged = false;
    this.bot = false;
    this.cellData = cellData;

    var split = new splitWindow("parent-div" + this.tabNum, "contBox");

    this.start = function () {
        this.tableId = "dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + counter;
        if (this.login == "uc") {
            $("#ppgrid_" + this.tableId).hide();
            $("#ppgrid_" + this.tableId).parent().css("z-index", "-1");
        }
        else {
            //$("#sub_windows_sidediv_" + this.tableId).css("z-index", "-1");
            $("#sub_window_" + this.tableId).css("padding-top", "15px");
            $("#sub_windows_sidediv_" + this.tableId).css("display", "none");
        }
    }

    split.windowOnFocus = function (ev) {
        $("#Relateddiv").hide();
        if ($(ev.target).attr("class") !== undefined) {
            if ($(ev.target).attr("class").indexOf("sub-windows") !== -1) {
                var id = $(ev.target).attr("id");
                focusedId = id;
                if(this.type === "googlemap")
                    this.propGrid.setObject(this.EbObject, AllMetas["EbGoogleMap"]);
                else
                    this.propGrid.setObject(this.EbObject, AllMetas["EbChartVisualization"]);
                //if ($('#' + id).is(':last-child'))
                    //$(".splitdiv_parent").scrollTo($("#" + focusedId));
            }
        }
    }.bind(this);

    this.call2FD = function () {
        this.relatedObjects = this.EbObject.DataSourceRefId;
        $.LoadingOverlay("show");
        $.ajax({
            type: "POST",
            url: "../DV/dvCommon",
            data: { dvobj: JSON.stringify(this.EbObject), dvRefId: this.Refid, flag: this.PcFlag },
            success: this.ajaxSucc
        });

    };

    this.ajaxSucc = function (text) {
        $("#objname").text(this.EbObject.Name);
        if (this.MainData !== null) {
            $("#Pipped").show();
            $("#Pipped").text("Pipped From: " + this.EbObject.Pippedfrom);
            this.isPipped = true;
            this.filterValues = dvcontainerObj.dvcol[prevfocusedId].filterValues;
        }
        else if (this.rowData !== null && this.rowData !== "") {
            this.isContextual = true;
            //this.filterValues = dvcontainerObj.dvcol[prevfocusedId].filterValues;
        }
        else
            this.isTagged = true;
        this.PcFlag = "False";
        obj = this.EbObject;
        $("#obj_icons").empty();
        $("#obj_icons").append("<button id='btnGo" + this.tabNum + "' class='btn commonControl'><i class='fa fa-play' aria-hidden='true'></i></button>");
        $("#btnGo" + this.tabNum).click(this.init.bind(this));
        var sideDivId = "#sub_windows_sidediv_dv" + obj.EbSid + "_" + this.tabNum + "_" + counter;
        var subDivId = "#sub_window_dv" + obj.EbSid + "_" + this.tabNum + "_" + counter;
        $("#content_dv" + obj.EbSid + "_" + this.tabNum + "_" + counter).empty();
        $(sideDivId).empty();
        $(sideDivId).append("<div class='pgHead'> Param window <div class='icon-cont  pull-right'><i class='fa fa-times' aria-hidden='true'></i></div></div>");
        $(sideDivId).append(text);
        if (this.login === 'dc')
            this.EbObject = commonO.Current_obj;
        else
            this.EbObject = dvcontainerObj.currentObj;
        if ($(sideDivId+" #filterBox").children().length ==  0) {
            this.FD = false;
            $(sideDivId).css("display", "none");
            $.LoadingOverlay("hide");
            //$("#content_dv" + obj.EbSid + "_" + this.tabNum + "_" + counter).removeClass("col-md-8").addClass("col-md-10");
            $("#btnGo" + this.tabNum).trigger("click");
        }
        else {
            this.FD = true;
            if (this.isPipped || this.isContextual) {
                if (this.filterValues.length > 0) {
                    $.each(this.filterValues, function (i, param) {
                        $(sideDivId + ' #' + param.name).val(param.value);
                    });
                }
                $("#btnGo" + this.tabNum).trigger("click");
            }
            else {
                $(sideDivId).css("display", "inline");
                $.LoadingOverlay("hide");
                //$("#content_dv" + obj.EbSid + "_" + this.tabNum + "_" + counter).removeClass("col-md-10").addClass("col-md-8");
            }
        }
        $(subDivId).focus();
    }.bind(this);

    if (this.EbObject === null) {
        this.EbObject = new EbObjects["EbChartVisualization"]("Container_" + Date.now());
        split.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum + "_" + counter, "EbChartVisualization");
        this.propGrid = new Eb_PropertyGrid("ppgrid_dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + counter);
        this.propGrid.setObject(this.EbObject, AllMetas["EbChartVisualization"]);
        this.start();
    }
    else {
        if (this.MainData !== null)
            split.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum + "_" + counter, "EbTableVisualization", prevfocusedId);
        else
            split.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum + "_" + counter, "EbChartVisualization");
        this.propGrid = new Eb_PropertyGrid("ppgrid_dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + counter);
        if (this.EbObject.$type.indexOf("EbChartVisualization") !== -1)
            this.propGrid.setObject(this.EbObject, AllMetas["EbChartVisualization"]);
        else
            this.propGrid.setObject(this.EbObject, AllMetas["EbGoogleMap"]);
        this.start();
        this.call2FD();
    }



    this.propGrid.PropertyChanged = function (obj, Pname) {
        this.EbObject = obj;
        if (this.login == "dc")
            commonO.Current_obj = obj;
        else
            dvcontainerObj.currentObj = obj;
        if (Pname == "Charttype") {
            this.prevObj = this.EbObject;
            if (obj.Charttype == 1) {
                this.EbObject = new EbObjects["EbGoogleMap"](this.EbObject.EbSid);
                this.propGrid.setObject(this.EbObject, AllMetas["EbGoogleMap"]);
            }
            else {
                this.EbObject = new EbObjects["EbChartVisualization"](this.EbObject.EbSid);
                this.propGrid.setObject(this.EbObject, AllMetas["EbChartVisualization"]);
            }
            this.rearrangeObjects();
            //$("#diamension" + this.tableId).empty();
            //$("#measure" + this.tableId).empty();
            $("#canvasDiv" + this.tableId).children("iframe").remove();
            $("#myChart" + this.tableId).remove();
            $("#map").remove();

            //this.EbObject.Xaxis.$values = [];
            //this.EbObject.Yaxis.$values = [];
            this.columnInfo = this.EbObject;
            
            this.updateDragula("Changed");

        }
        if (Pname == "DataSourceRefId") {
            if (obj[Pname] !== null) {
                this.PcFlag = "True";
                this.EbObject.Xaxis.$values = [];
                this.EbObject.Yaxis.$values = [];
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
        if (this.EbObject.Type !== "")
            this.type = this.EbObject.Type;
        this.tableId = "dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + counter;
        $.event.props.push('dataTransfer');
        this.createChartDivs();
        this.appendColumns();
        if (!this.bot) {
            this.appendXandYAxis();
            if (this.login === "uc") {
                this.collapseGraph();
            }

            $("#ppgrid_" + this.tableId).css("display", "none");
            $("#ppgrid_" + this.tableId).parent().css("z-index", "-1");
            if (this.FD) {
                $("#sub_windows_sidediv_" + this.tableId).css("display", "none");
                //$("#content_" + this.tableId).removeClass("col-md-8").addClass("col-md-12");
            }
            else {
                //$("#content_" + this.tableId).removeClass("col-md-10").addClass("col-md-12");
            }

            //this.filterValues = this.getFilterValues();
            filterChanged = false;
            if (!this.isTagged)
                f = this.compareFilterValues();
            if (this.MainData !== null && this.login === "uc" && !filterChanged) {
                dvcontainerObj.currentObj.data = this.MainData;
                this.drawGraphHelper(this.MainData.data);
            }
            else {
                if (this.login === "uc") {
                    dvcontainerObj.currentObj.Pippedfrom = "";
                    $("#Pipped").text("");
                    this.isPipped = false;
                }
                this.filterValues = this.getFilterValues();
                $.LoadingOverlay("show");
                $.ajax({
                    type: 'POST',
                    url: "../DV/getdata",
                    data: { draw: 1, RefId: this.columnInfo.DataSourceRefId, Start: 0, Length: 50, TFilters: [], Params: this.getFilterValues() },
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", "Bearer " + getToken());
                    },
                    success: this.getDataSuccess.bind(this),
                    error: function () { }
                });
                //$.post(this.ssurl + '/ds/data/' + this.columnInfo.DataSourceRefId, { draw: 1, RefId: this.columnInfo.DataSourceRefId, Start: 0, Length: 50, TFilters: [], Token: getToken(), rToken: getrToken(), Params: JSON.stringify(getFilterValues()) }, this.getDataSuccess.bind(this));
            }
        }
        this.GenerateButtons();
        
    };

    this.createChartDivs = function () {
        //if (this.columnInfo.$type.indexOf("EbChartVisualization") !== -1) {
            $("#content_" + this.tableId).empty();
            $("#content_" + this.tableId).append(
                "<div id='graphcontainer_tab" + this.tableId + "' style='height:inherit;' class='chartCont'>" +
                "<div class='col-md-2 no-padd' id='columnsDisplay" + this.tableId + "' style='height:inherit;'>" +
                "<div class='tag-cont'>" +
                "  <div class='tag-wraper'><div class='pgHead'>Dimensions</div><div class='tag-scroll'><div id='diamension" + this.tableId + "'></div></div></div>" +
                "  <div class='tag-wraper'><div class='pgHead'>Measures</div><div class='tag-scroll'><div id='measure" + this.tableId + "'></div></div></div>" +
                "</div>" +
                "</div> " +
                "<div class='col-md-10' id='canvasParentDiv" + this.tableId + "' style='height:inherit;'>" +
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
                "<div id='canvasDiv" + this.tableId +"' style='height:100%;padding-bottom:10px;'><canvas id='myChart" + this.tableId + "'></canvas></div> " +
                "</div> " +
                "</div>");
            //this.GenerateButtons();
        //}
        //else {

        //}
    };

    this.GenerateButtons = function () {
        $("#objname").text(this.columnInfo.Name);
        $("#obj_icons").empty();
        //$("#obj_icons").children().not("#btnGo"+this.tabNum).remove();
        $("#obj_icons").append("<button id='btnGo" + this.tableId + "' class='btn commonControl'><i class='fa fa-play' aria-hidden='true'></i></button>");
        $("#btnGo" + this.tableId).click(this.init.bind(this));
        if (this.login === "dc") {
            $("#obj_icons").append(`<div style='display: inline;'>
            <div class='dropdown' id='graphDropdown_tab${ this.tableId}' style='display: inline-block;padding-top: 1px;'>
            <button class='btn dropdown-toggle' type='button' data-toggle='dropdown'>
            <span class='caret'></span>
            </button>
            <ul class='dropdown-menu' id="demodd">
            <div id="charttype">
                <div class="divHLType">
                    <div class="chartHeader">Comparison</div>
                    <div id="Comparison" class="chartBody">
                        <div class="divLLType">
                            <div class="ddchart"><a tabindex="-1" href="#"><img src="../images/svg/bar-chart.svg"></a></div>
                            <div class="chartname">Bar</div>
                        </div>
                        <div class="divLLType">
                            <div class="ddchart"><a tabindex="-1" href="#"><img src="../images/svg/Line-chart.svg"></a></div>
                            <div class="chartname">Line</div>
                        </div>
                        <div class="divLLType">
                            <div class="ddchart"><a tabindex="-1" href="#"><img src="../images/svg/column-chart.svg"></a></div>
                            <div class="chartname">Column</div>
                        </div>
                    </div>
                </div>
                <div class="divHLType">
                    <div class="chartHeader">Composition</div>
                    <div id="Composition" class="chartBody">
                        <div class="divLLType">
                            <div class="ddchart"><a tabindex="-1" href="#"><img src="../images/svg/pie-chart.svg"></a></div>
                            <div class="chartname">Pie</div>
                        </div>
                        <div class="divLLType">
                            <div class="ddchart"><a tabindex="-1" href="#"><img src="../images/svg/donut-chart.svg"></a></div>
                            <div class="chartname">Donut</div>
                        </div>
                        <div class="divLLType">
                            <div class="ddchart"><a tabindex="-1" href="#"><img src="../images/svg/area-chart.svg"></a></div>
                            <div class="chartname">Area</div>
                        </div>
                    </div>
                </div>
                <div class="divHLType">
                    <div class="chartHeader">Distribution</div>
                    <div id="Distribution" class="chartBody">
                        <div class="divLLType">
                            <div class="ddchart"><a tabindex="-1" href="#"><img src="../images/svg/Line-chart.svg"></a></div>
                            <div class="chartname">Line</div>
                        </div>
                        <div class="divLLType">
                            <div class="ddchart"><a tabindex="-1" href="#"><img src="../images/svg/bar-chart.svg"></a></div>
                            <div class="chartname">Bar</div>
                        </div>
                        <div class="divLLType">
                            <div class="ddchart"><a tabindex="-1" href="#"><img src="../images/svg/column-chart.svg"></a></div>
                            <div class="chartname">Column</div>
                        </div>
                    </div>
                </div>
                <div class="divHLType">
                    <div class="chartHeader">Relationship</div>
                    <div id="Relationship" class="chartBody">
                        <div class="divLLType">
                            <div class="ddchart"><a tabindex="-1" href="#"><img src="../images/svg/Line-chart.svg"></a></div>
                            <div class="chartname">Line</div>
                        </div>
                        <div class="divLLType">
                            <div class="ddchart"><a tabindex="-1" href="#"><img src="../images/svg/horizontal-bar-chart.svg"></a></div>
                            <div class="chartname">Horizontalbar</div>
                        </div>
                    </div>
                </div>
                
            <div>
                
            </ul>
            </div>
            <button id='reset_zoom${ this.tableId}' class='btn'>Reset zoom</button>
            <button id='btnColumnCollapse${ this.tableId}' class='btn' style='display: inline-block;'>
            <i class='fa fa-cog' aria-hidden='true'></i>
            </button>`);
        }
        //<div class="divHLType">
        //    <div class="chartHeader">Other</div>
        //    <div id="Other" class="chartBody">
        //        <div class="divLLType">
        //            <div class="ddchart"><a tabindex="-1" href="#"><img src="../images/svg/google.svg"></a></div>
        //                <div class="chartname">GoogleMap</div>
        //            </div>
        //        </div>
        //    </div>
        if (this.FD) {
            $("#obj_icons").append("<button id= 'btnToggleFD" + this.tableId + "' class='btn'  data- toggle='ToogleFD'> <i class='fa fa-filter' aria-hidden='true'></i></button>");
        }
        $("#obj_icons").append("<button id= 'btnTogglePPGrid" + this.tableId + "' class='btn'  data- toggle='TooglePPGrid'> <i class='material-icons' aria-hidden='true'></i></button>")

        if (this.EbObject !== null && this.EbObject.Type !== null)
            $("#graphDropdown_tab" + this.tableId + " button:first-child").html(this.EbObject.Type.trim() + "&nbsp;<span class = 'caret'></span>");
        if (this.login == "uc") {
            //if (!this.isContextual)
                dvcontainerObj.appendRelatedDv(this.tableId);
                dvcontainerObj.modifyNavigation();
                $("#btnTogglePPGrid" + this.tableId).hide();
        }
        this.bindEvents();

        if (this.type !== "googlemap")
            $("#graphDropdown_tab" + this.tableId).show();
        else
            $("#graphDropdown_tab" + this.tableId).hide();
        if (this.bot) {
            $("#columnsDisplay" + this.tableId).empty();
            $("#columnsDisplay" + this.tableId).append(`<div class="pgHead">User:<label></label></div>`);
            $("#xy" + this.tableId).hide();
            $(".toolicons").hide();
            $("#canvasParentDiv" + this.tableId).removeClass("col-md-10").addClass("col-md-9");            
            $("#columnsDisplay" + this.tableId).removeClass("col-md-2").addClass("col-md-3").addClass("botdata_cont").show();

        }
    };

    this.bindEvents = function () {
        $("#reset_zoom" + this.tableId).off("click").on("click", this.ResetZoom.bind(this));
        $("#graphDropdown_tab" + this.tableId + " .dropdown-menu a").off("click").on("click", this.setGraphType.bind(this));
        $("#btnColumnCollapse" + this.tableId).off("click").on("click", this.collapseGraph.bind(this));
        $("#btnToggleFD" + this.tableId).off("click").on("click", this.toggleFilterdialog.bind(this));
        $("#btnTogglePPGrid" + this.tableId).off("click").on("click", this.togglePPGrid.bind(this));
    }

    this.appendColumns = function () {
        var colsAll_XY = [], Xcol = [], Ycol = [], colsAll_X = [];
        var tid = this.tableId;
        $.each(this.columnInfo.Columns.$values, function (i, obj) {
            if (obj.RenderAs.toString() === EbEnums.StringRenderType.Marker) {
                this.type = "googlemap";
                this.bot = true;
                var arr = this.cellData.split(",");
                if (arr.length == 2) {
                    this.XLabel.push(this.cellData.split(",")[1]);
                    this.YLabel.push(this.cellData.split(",")[0]);
                    this.drawGeneralGraph();
                }
                return false;
            }
        }.bind(this));
        if (!this.bot) {
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

            this.updateDragula();
        }
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
                //this.Xindx.push(obj.data);
            });
            $.each(this.columnInfo.Yaxis.$values, function (i, obj) {
                $("#Y_col_name" + tid).append("<div class='colTile columnDrag' style='margin: 0px 2px;padding: 0px 4px;width: auto; display:inline-block' id='li" + obj.name + "' data-id='" + obj.data + "'>" + obj.name + "<button class='close' type='button' style='font-size: 15px;margin: 2px 0 0 4px;' >x</button></div>");
                //this.Yindx.push(obj.data);
            });
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

    this.getFilterValues = function () {
        var fltr_collection = [];
        var FdCont = "#sub_windows_sidediv_" + this.tableId;
        var paramstxt = $(FdCont+" #all_control_names").val();//$('#hiddenparams').val().trim();datefrom,dateto
        if (paramstxt != undefined) {
            var params = paramstxt.split(',');
            $.each(params, function (i, id) {
                var v = null;
                var dtype = $(FdCont + ' #' + id).attr('data-ebtype');
                //if (dtype === '6')
                //    v = $(FdCont + ' #' + id).val().substring(0, 10);
                //else
                //    v = $(FdCont + ' #' + id).val();
                if (dtype === "3")
                    v = $(FdCont).children().find("[name=" + id + "]:checked").val();
                else
                    v = $(FdCont + ' #' + id).val();
                if (dtype === '6')
                    v = $(FdCont + ' #' + id).val().substring(0, 10);

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
        if (this.columnInfo.Xaxis.$values.length >= 1 && this.columnInfo.Yaxis.$values.length >= 1)
            this.drawGeneralGraph();
    };

    this.getBarData = function () {
        this.Xindx = [];
        this.Yindx = [];
        this.dataset = [];
        this.XLabel = [];
        this.YLabel = [];
        var xdx = [], ydx = [], ml = [], info = [];
        if (this.columnInfo.Xaxis.$values.length > 0 && this.columnInfo.Yaxis.$values.length > 0) {

            $.each(this.columnInfo.Xaxis.$values, function (i, obj) {
                xdx.push(obj.data);
            });

            $.each(this.columnInfo.Yaxis.$values, function (i, obj) {
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
                        this.dataset.push(new datasetObj(this.columnInfo.Yaxis.$values[k].name, this.YLabel, this.columnInfo.LegendColor.$values[k].color, this.columnInfo.LegendColor.$values[k].color, false));
                    }
                    else {
                        this.dataset.push(new datasetObj4Pie(this.columnInfo.Yaxis.$values[k].name, this.YLabel, this.columnInfo.LegendColor.$values[k].color, this.columnInfo.LegendColor.$values[k].color, false));
                        this.piedataFlag = true;
                    }
                }
            }

            if (this.type === "googlemap") {
                $.each(this.columnInfo.MarkerLabel.$values, function (i, obj) {
                    if (i === 0)
                        ml.push(obj.data);
                });

                if (ml.length > 0) {
                    $.each(this.data, function (i, value) {
                        markLabel.push(value[ml[0]].charAt(0));
                    });
                }
                Inform = [];
                $.each(this.columnInfo.InfoWindow.$values, function (i, obj) {
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
        if (!this.bot) {
            $.LoadingOverlay("show");
            this.getBarData();
        }
        if (this.type === "googlemap") {
            //this.getData4GoogleMap();
            TableId = this.tableId;
            $("#canvasDiv" + this.tableId).children("iframe").remove();
            $("#myChart" + this.tableId).remove();
            if ($("#map" + this.tableId).children().length === 0)
                $("#canvasDiv" + this.tableId).append("<div id='map" + this.tableId+"' style='height:400px;width:100%;'></div>");
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
        else
        {
            this.gdata = {
                labels: this.XLabel,
                datasets: this.dataset,
            };
            this.animateOPtions = (this.columnInfo.ShowValue) ? new animateObj(0) : false;
            this.goptions = {
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: (this.type !== "pie") ? true : false,
                            labelString: (this.columnInfo.YaxisTitle !== "") ? this.columnInfo.YaxisTitle : "YLabel",
                            fontColor: (this.columnInfo.YaxisTitleColor !== null && this.columnInfo.YaxisTitleColor !== "#ffffff") ? this.columnInfo.YaxisTitleColor : "#000000"
                        },
                        stacked: false,
                        gridLines: {
                            display: (this.type !== "pie") ? true : false
                        },
                        ticks: {
                            fontSize: 10,
                            fontColor: (this.columnInfo.YaxisLabelColor !== null && this.columnInfo.YaxisTitleColor !== "#ffffff") ? this.columnInfo.YaxisLabelColor : "#000000"
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {
                            display: (this.type !== "pie") ? true : false,
                            labelString: (this.columnInfo.XaxisTitle !== "") ? this.columnInfo.XaxisTitle : "XLabel",
                            fontColor: (this.columnInfo.XaxisTitleColor !== null && this.columnInfo.YaxisTitleColor !== "#ffffff") ? this.columnInfo.XaxisTitleColor : "#000000"
                        },
                        gridLines: {
                            display: (this.type !== "pie") ? true : false
                        },
                        ticks: {
                            fontSize: 10,
                            fontColor: (this.columnInfo.XaxisLabelColor !== null && this.columnInfo.YaxisTitleColor !== "#ffffff") ? this.columnInfo.XaxisLabelColor : "#000000"
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
                },

                tooltips: {
                    enabled: this.columnInfo.ShowTooltip
                },
                animation: this.animateOPtions
                //{
                //    duration:  1 ,
                //    onComplete: function () {
                //            var chartInstance = this.chart,
                //                ctx = chartInstance.ctx;

                //            ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                //            ctx.textAlign = 'center';
                //            ctx.textBaseline = 'bottom';

                //            this.data.datasets.forEach(function (dataset, i) {
                //                var meta = chartInstance.controller.getDatasetMeta(i);
                //                meta.data.forEach(function (bar, index) {
                //                    var data = dataset.data[index];
                //                    ctx.fillText(data, bar._model.x, bar._model.y - 5);
                //                });
                //            });
                //    }
                //},
            };
            if (this.EbObject.Xaxis.$values.length > 0 && this.EbObject.Xaxis.$values.length > 0)
                this.RemoveCanvasandCheckButton();

            $.LoadingOverlay("hide");
        }
        
    };

    this.RemoveCanvasandCheckButton = function () {
        if (this.type == null) {
            this.type = "bar";
            $("#graphDropdown_tab" + this.tableId + " button:first-child").html("Bar" + "&nbsp;<span class = 'caret'></span>")
        }
        else {
            this.type = this.type.toLowerCase();
            $("#graphDropdown_tab" + this.tableId + " button:first-child").html(this.type + "&nbsp;<span class = 'caret'></span>")
        }
        
        if (this.type == "area" || this.type == "line") {
            if (this.gdata !== null) {
                $.each(this.gdata.datasets, this.GdataDSiterFn.bind(this));
                if (this.piedataFlag)
                    this.drawGeneralGraph();
                this.type = "line";
            }
            else
                this.drawGeneralGraph();
        }
        else if (this.type == "bar") {
            if (this.piedataFlag) {
                this.drawGeneralGraph();
            }
        }
        else if (this.type == "pie") {
            if (!this.piedataFlag)
                this.drawGeneralGraph();
        }
        else if (this.type == "horizontalbar") {
            if (this.piedataFlag) {
                this.drawGeneralGraph();
            }
            this.type = "horizontalBar"
        }

        //else if (ty == "bar")
        //    this.type = "bar";
        //else if (ty == "pie") {
        //    //this.goptions = null;
        //    this.type = "pie";
        //}
        //else if (ty == "doughnut") {
        //    this.goptions = null;
        //    this.type = "doughnut";
        //}
        //if (this.columnInfo.Xaxis.$values.length > 0 && this.columnInfo.Yaxis.$values.length > 0) {
        //    if (this.columnInfo.Type == null || this.columnInfo.Type == "") {
        //        $("#graphDropdown_tab" + this.tableId + " button:first-child").html("Bar" + "&nbsp;<span class = 'caret'></span>")
        //        this.columnInfo.Type = "bar";
        //    }
        //    else
        //        this.columnInfo.Type = this.type;
        //}

        $("#canvasDiv" + this.tableId).children("iframe").remove();
        $("#myChart" + this.tableId).remove();
        //$("#graphcontainer_tab" + this.tableId).append("<canvas id='myChart" + this.tableId + "'></canvas>");
        $("#canvasDiv" + this.tableId).append("<canvas id='myChart" + this.tableId + "'></canvas>");
        
        if (this.columnInfo.Xaxis.$values.length > 0 && this.columnInfo.Yaxis.$values.length > 0)
            this.drawGraph();

        
    };

   
    this.GdataDSiterFn = function (j, obj) {
        var ty = $("#graphDropdown_tab" + this.tableId + " button:eq(0)").text().trim();
        if (ty == "area") {
            this.gdata.datasets[j].fill = true;
        }
        else {
            this.gdata.datasets[j].fill = false;
        }
    }

    this.drawGraph = function () {
        this.columnInfo.Type = this.type;
        var canvas = document.getElementById("myChart" + this.tableId);

        this.chartApi = new Chart(canvas, {
            type: this.columnInfo.Type.trim(),
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
        $("#graphDropdown_tab" + this.tableId + " button:first-child").html(this.type.trim() + "&nbsp;<span class = 'caret'></span>");
        if (this.type.trim() !== "googlemap") {
            if (this.columnInfo.$type.indexOf("EbGoogleMap") !== -1) {
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
                this.columnInfo = this.EbObject;
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
            this.columnInfo = this.EbObject;

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
            var temp;
            $(el).css("display", "inline-block");
            var name = $(el).text();
            $(el).append("<button class='close' type='button' style='font-size: 15px;margin: 0px 0 0 4px;color: black !important;' >x</button>");
            if ($(target).attr("id") == "X_col_name" + this.tableId) {
                //this.columnInfo.Xaxis.$values.push(new axis($(el).attr("data-id"), name));
                temp = $.grep(this.columnInfo.Columns.$values, function (obj) { return obj.name === name });
                this.columnInfo.Xaxis.$values.push(temp[0]);
                //this.Xindx.push(temp[0].data);
            }
            if ($(target).attr("id") == "Y_col_name" + this.tableId) {
                //this.columnInfo.Yaxis.$values.push(new axis($(el).attr("data-id"), name));
                temp = $.grep(this.columnInfo.Columns.$values, function (obj) { return obj.name === name });
                this.columnInfo.Yaxis.$values.push(temp[0]);
                //this.Yindx.push(temp[0].data);
                if (this.type !== "googlemap")
                    this.columnInfo.LegendColor.$values.push(new ChartColor(name, getRandomColor()));
            }

            if ($("#X_col_name" + this.tableId + " div").length == 1 && $("#Y_col_name" + this.tableId + " div").length >= 1) {
                this.drawGeneralGraph();
            }
            else {
                $("#myChart" + this.tableId).remove();
                $("#canvasDiv" + this.tableId).append("<canvas id='myChart" + this.tableId + "'></canvas>");
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
            $("#canvasDiv" + this.tableId).css("height", "100%");
            //$("#myChart" + this.tableId).css("height", "inherit");
        }
        else {
            $("#canvasParentDiv" + this.tableId).removeClass("col-md-12").addClass("col-md-10");
            $("#canvasDiv" + this.tableId).css("height", "calc(100% - 67px)");
        }
    };
  
    this.toggleFilterdialog = function () {
        if ($("#sub_windows_sidediv_" + this.tableId).css("display") === "none") {
            $("#sub_windows_sidediv_" + this.tableId).css("display", "inline");
            //if ($("#content_" + this.tableId).hasClass("col-md-12"))
            //    $("#content_" + this.tableId).removeClass("col-md-12").addClass("col-md-10");
            //else
            //    $("#content_" + this.tableId).removeClass("col-md-10").addClass("col-md-8")
        }
        else {
            $("#sub_windows_sidediv_" + this.tableId).css("display", "none");
            //if ($("#content_" + this.tableId).hasClass("col-md-10"))
            //    $("#content_" + this.tableId).removeClass("col-md-10").addClass("col-md-12");
            //else
            //    $("#content_" + this.tableId).removeClass("col-md-8").addClass("col-md-10");
        }
    };

    this.togglePPGrid = function () {
        if ($("#ppgrid_" + this.tableId).css("display") === "none") {
            $("#ppgrid_" + this.tableId).css("display", "inline");
            $("#ppgrid_" + this.tableId).parent().css("z-index", "3");
            $("#Relateddiv").hide();
            //if ($("#content_" + this.tableId).hasClass("col-md-12"))
            //    $("#content_" + this.tableId).removeClass("col-md-12").addClass("col-md-10");
            //else
            //    $("#content_" + this.tableId).removeClass("col-md-10").addClass("col-md-8")
        }
        else {
            $("#ppgrid_" + this.tableId).css("display", "none");
            $("#ppgrid_" + this.tableId).parent().css("z-index", "-1");
            $("#Relateddiv").hide();
            //if ($("#content_" + this.tableId).hasClass("col-md-10"))
            //    $("#content_" + this.tableId).removeClass("col-md-10").addClass("col-md-12");
            //else
            //    $("#content_" + this.tableId).removeClass("col-md-8").addClass("col-md-10");
        }
    };

    this.RemoveAndAddToColumns = function (e) {
        var str = $(e.target).parent().text();
        var index = parseInt($(e.target).parent().attr("data-id"));
        if ($(e.target).parent().parent().attr("id") === "X_col_name" + this.tableId) {
            $("#diamension" + this.tableId).append("<div class='colTile columnDrag' id='li" + str.substr(0, str.length - 1) + "' data-id='" + $(e.target).parent().attr("data-id") + "'>" + str.substr(0, str.length - 1) + "</div>");
            //index = this.Xindx.indexOf($(e.target).parent().attr("data-id"));
            //this.Xindx.pop(index);
        }
        else if ($(e.target).parent().parent().attr("id") === "Y_col_name" + this.tableId) {
            $("#measure" + this.tableId).append("<div class='colTile columnDrag' id='li" + str.substr(0, str.length - 1) + "' data-id='" + $(e.target).parent().attr("data-id") + "'>" + str.substr(0, str.length - 1) + "</div>");
            //index = this.Yindx.indexOf($(e.target).parent().attr("data-id"));
            //this.Yindx.pop(index);
        }
        //$("#columns4Drag" + this.tableId + " .list-group").append("<li class='alert alert-success columnDrag' id='" + $(e.target).parent().attr("id") + "' draggable='true' data-id='" + $(e.target).parent().attr("data-id") + "'>" + str.substring(0, str.length - 1).trim() + "</li>");
        $(e.target).parent().remove();
        //$("#columns4Drag" + this.tableId + " .columnDrag").off("dragstart").on("dragstart", this.colDrag.bind(this));
        this.columnInfo.Xaxis.$values = $.grep(this.columnInfo.Xaxis.$values, function (vobj) { return vobj.name !== str.substring(0, str.length - 1).trim() });
        this.columnInfo.Yaxis.$values = $.grep(this.columnInfo.Yaxis.$values, function (vobj) { return vobj.name !== str.substring(0, str.length - 1).trim() });
        if (this.type !== "googlemap")
            this.columnInfo.LegendColor.$values = $.grep(this.columnInfo.LegendColor.$values, function (vobj) { return vobj.name !== str.substring(0, str.length - 1).trim() });
        //this.columnInfo.Xaxis = this.
        //this.Xindx = $.grep(this.Xindx, function (obj) { return obj.name !== str.substring(0, str.length - 1).trim() });
        //this.Yindx = $.grep(this.Yindx, function (obj) { return obj.name !== str.substring(0, str.length - 1).trim() });

        if ($("#X_col_name" + this.tableId + " div").length == 1 && $("#Y_col_name" + this.tableId + " div").length >= 1) {
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
        if (this.chartApi !== null) {
            $("#fontSel").click();
        }
        $("#fontSel").off("change").on("change", this.reloadChart.bind(this, legendItem));
    }

    this.reloadChart = function (legendItem) {
        $.each(this.columnInfo.LegendColor.$values, function (i, obj) {
            if (legendItem.text === obj.name)
                this.columnInfo.LegendColor.$values[i].color = $("#fontSel").val();
        }.bind(this));
        if (this.type !== "pie") 
            $.each(this.gdata.datasets, this.reloadChart_inner.bind(this, legendItem));
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
                        this.columnInfo.LegendColor.$values.push(new ChartColor(obj.name, getRandomColor()));
                    }.bind(this));
                }
                this.drawGeneralGraph();
            }
               
        }
        //$("#X_col_name" + this.tableId).empty();
        //$("#Y_col_name" + this.tableId).empty();        

        //this.appendColumns();
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
};

function initMap() {
    var infowindow = new google.maps.InfoWindow();
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var mid = Math.floor(Xlabel.length / 2);
    var map = new google.maps.Map(document.getElementById('map' + TableId), {
        zoom: 14,
        center: new google.maps.LatLng(Ylabel[mid], Xlabel[mid]),
        // mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    directionsDisplay.setMap(map);
    var request = {
        travelMode: google.maps.TravelMode.DRIVING
    };
    var marker, i;
    for (i = 0; i < Xlabel.length; i++) {
        var latlng = new google.maps.LatLng(Ylabel[i], Xlabel[i]);

        marker = new google.maps.Marker({
            position: latlng,
            map: map,
            label: markLabel[i],
        });

        if (i == 0) request.origin = marker.getPosition();
        else if (i == Xlabel.length - 1) request.destination = marker.getPosition();
        else {
            if (!request.waypoints) request.waypoints = [];
            request.waypoints.push({
                location: marker.getPosition(),
                stopover: true
            });
        }        
        
        google.maps.event.addListener(marker, 'click', (function (marker, i) {
            return function () {
                var content = "";
                $.each(Inform, function (k, obj) {
                    content += obj.name + ":" + obj.value[i]+"</br>";
                });
                if (content === "")
                    content = "no details";
                infowindow.setContent(content);
                infowindow.setOptions({ maxWidth: 200 });
                infowindow.open(map, marker);
            }
        })(marker, i));

    }
    if (showRoute) {
        directionsService.route(request, function (result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(result);
            }
        });
    }
    //}
}

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

            //var tid = this.tableId;
            //$.ajax({
            //    type: "GET",
            //    url: "../DV/dvgoogle",
            //    success: function (text) {
            //        $("#canvasDiv" + tid).children("iframe").remove();
            //        $("#myChart" + tid).remove();
            //        //$("#graphcontainer_tab" + current.tableId).children("table").css("display", "none");
            //        $("#canvasDiv" + tid).append(text);
            //    }
            //});