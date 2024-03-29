﻿$.fn.extend({
    treed: function (o) {
        var openedClass = 'fa-minus-square-o';
        var closedClass = 'fa-plus-square-o';
        var ic = o || 'fa-plus-square-o';

        if (typeof o !== 'undefined') {
            if (typeof o.openedClass !== 'undefined') {
                //openedClass = o.openedClass;
            }
            if (typeof o.closedClass !== 'undefined') {
                //closedClass = o.closedClass;
            }
        }
        var tree = $(this);
        tree.addClass("tree");
        tree.find('li').has("ul").each(function () {
            var branch = $(this);
            branch.prepend("<i class='indicator fa " + ic + "'></i>");
            branch.addClass('branch');
            branch.off("click").on('click', function (e) {
                if (this === e.target) {
                    var icon = $(this).children('i:first');
                    icon.toggleClass(openedClass + " " + closedClass);
                    $(this).children().children().toggle();
                }
            });
            branch.children().children().toggle();
        });
        tree.find('.branch .indicator').each(function () {
            $(this).off("click").on('click', function (e) {
                $(this).closest('li').click();
            });
        });
        tree.find('.branch>a').each(function () {
            $(this).off("click").on('click', function (e) {
                $(this).closest('li').click();
                e.preventDefault();
            });
        });
        tree.find('.branch>button').each(function () {
            $(this).off("off").on('click', function (e) {
                $(this).closest('li').click();
                e.preventDefault();
            });
        });
    }
});

$.fn.extend({
    killTree: function (o) {
        var tree = $(this);
        tree.removeClass("tree");
        tree.find('li').has("ul").each(function () {
            var branch = $(this);
            branch.children().children().show();
            branch.children("i").remove();
            branch.removeClass('branch');
            branch.off("click");
        });
    }
});

var eb_chart = function (googlekey, refid, ver_num, type, dsobj, cur_status, tabNum, ssurl, login, counter, data, rowData, filterValues, cellData, PGobj, TenantId, UserId) {
    this.propGrid = PGobj || null;
    this.EbObject = null;
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
    this.filterValues = (filterValues !== "" && filterValues !== undefined && filterValues !== null) ? JSON.parse(decodeURIComponent(escape(window.atob(filterValues)))) : [];
    this.rowData = (rowData !== undefined && rowData !== null && rowData !== "") ? JSON.parse(decodeURIComponent(escape(window.atob(rowData)))) : null;
    this.isTagged = false;
    //this.filterChanged = false;
    this.bot = false;
    this.cellData = cellData;
    this.filterHtml = "";
    this.isSecondTime = false;
    var _icons = {
        "bar": "fa fa-bar-chart",
        "line": "fa fa-line-chart",
        "pie": "fa fa-pie-chart",
        "area": "fa fa-area-chart",
        "horizontalBar": "fa fa-bar-chart"
    };

    var split = new splitWindow("parent-div0", "contBox");

    split.windowOnFocus = function (ev) {
        $("#Relateddiv").hide();
        if ($(ev.target).attr("class") !== undefined) {
            if ($(ev.target).attr("class").indexOf("sub-windows") !== -1) {
                var id = $(ev.target).attr("id");
                focusedId = id;
            }
        }
    }.bind(this);

    this.startRelated = function () {
        this.tableId = "dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + counter;
        this.ContextId = "filterWindow_" + this.tableId;
        this.FDCont = $(`<div id='${this.ContextId}' class='filterCont fd'></div>`);
        $("#parent-div0").before(this.FDCont);
        this.FDCont.hide();
    };

    this.call2FD = function () {
        this.relatedObjects = this.EbObject.DataSourceRefId;
        $("#eb_common_loader").EbLoader("show");
        $.ajax({
            type: "POST",
            url: "../DV/dvCommon",
            data: { dvobj: JSON.stringify(this.EbObject), dvRefId: this.Refid, _flag: this.PcFlag, login: this.login, contextId: this.ContextId, _curloc: store.get("Eb_Loc-" + TenantId + UserId) },
            success: this.ajaxSucc
        });

    };

    this.ajaxSucc = function (text) {
        var flag = false;
        if (this.login === "uc") {
            $("#ppcont").hide();
        }
        if (this.MainData !== null) {
            $("#Pipped").show();
            $("#Pipped").text("Pipped From: " + this.EbObject.Pippedfrom);
            this.isPipped = true;
            //this.filterValues = dvcontainerObj.dvcol[prevfocusedId].filterValues;
        }
        else if (this.rowData !== null && this.rowData !== "") {
            this.isContextual = true;
        }
        else if (this.filterValues.length > 0) {
            this.isContextual = true;
        }
        else
            this.isTagged = true;

        $("#obj_icons").empty();
        $("#obj_icons").append("<button id='btnGo" + this.tabNum + "' class='btn commonControl'><i class='fa fa-play' aria-hidden='true'></i></button>");
        $("#btnGo" + this.tabNum).click(this.init.bind(this));
        var subDivId = "#sub_window_dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + counter;
        $("#content_dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + counter).empty();
        this.filterHtml = text;

        this.FDCont = $("#filterWindow_" + this.tableId);
        $("#filterWindow_" + this.tableId).empty();
        $("#filterWindow_" + this.tableId).append("<div class='pgHead'> Param window <div class='icon-cont  pull-right' id='close_paramdiv_" + this.tableId + "'><i class='fa fa-thumb-tack' style='transform: rotate(90deg);'></i></div></div>");//
        $("#filterWindow_" + this.tableId).children().find('#close_paramdiv_' + this.tableId).off('click').on('click', this.CloseParamDiv.bind(this));
        $("#filterWindow_" + this.tableId).append(text);
        $("#filterWindow_" + this.tableId).children().find("#btnGo").click(this.init.bind(this));

        this.FilterDialog = (typeof (FilterDialog) !== "undefined") ? FilterDialog : {};

        if (typeof commonO !== "undefined")
            this.EbObject = commonO.Current_obj;
        else
            this.EbObject = dvcontainerObj.currentObj;

        if ($("#" + this.ContextId).children("#filterBox").length === 0) {
            this.FD = false;
            $(".filterCont").hide();
            $("#btnGo" + this.tabNum).trigger("click");
            $("#eb_common_loader").EbLoader("hide");
        }
        else {
            $(".ppcont").hide();
            this.filterid = "filter" + this.tableId;
            this.$filter = $("<button id='" + this.filterid + "' class='btn commonControl'><i class='fa fa-filter' aria-hidden='true'></i></button>");
            $("#obj_icons").append(this.$filter);
            this.$filter.click(this.CloseParamDiv.bind(this));
            this.FD = true;
            if (this.isPipped || this.isContextual) {
                this.placefiltervalues();
                $("#btnGo" + this.tabNum).trigger("click");
            }
            else {
                this.FDCont.show();
                if (this.login === "dc")
                    this.CreatePgButton();
            }
            $("#eb_common_loader").EbLoader("hide");
        }
        $(subDivId).focus();
        this.PcFlag = false;
        this.FDCont.css("right", "0");
    }.bind(this);

    this.start = function () {
        if (this.EbObject === null) {
            this.EbObject = new EbObjects["EbChartVisualization"]("Container_" + Date.now());
            split.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum + "_" + counter, "EbChartVisualization");
            this.propGrid = new Eb_PropertyGrid({
                id: "pp_inner",
                wc: "dc",
                cid: this.cid,
                $extCont: $(".ppcont"),
                style: { top: "80px" }
            });
            this.startRelated();
        }
        else {
            if (this.MainData !== null)
                split.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum + "_" + counter, "EbChartVisualization", prevfocusedId);
            else
                split.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum + "_" + counter, "EbChartVisualization");
            if (this.login === "dc") {
                this.propGrid = new Eb_PropertyGrid({
                    id: "pp_inner",
                    wc: "dc",
                    cid: this.cid,
                    $extCont: $(".ppcont"),
                    style: { top: "80px" }
                });
            }
            this.startRelated();
            this.call2FD();
        }
        $("#obj_icons").empty();
        if (this.login === "dc") {
            this.CreatePgButton();
            this.propGrid.PropertyChanged = this.tmpPropertyChanged;
            this.propGrid.setObject(this.EbObject, AllMetas["EbChartVisualization"]);
        }
    };

    this.CreatePgButton = function () {
        $("#obj_icons").append(`<button class="btn filter_menu" id="ppt-grid">
                                    <i class="fa fa-cog" aria-expanded="false"></i>
                                </button>`);
        $(".stickBtn").hide();
        this.PropertyDiv = $("#pp_inner");
        $("#ppt-grid").off("click").on("click", this.togglePG.bind(this));
        $("#pp_inner").find(".pgpin").remove();
        $("#pp_inner .pgHead").append(`<div class="icon-cont  pull-right pgpin" id="${this.tabNum}_pg-close">
                <i class="fa fa-thumb-tack" style="transform: rotate(90deg);"></i></div>`);
        $(`#${this.tabNum}_pg-close`).off("click").on("click", this.togglePG.bind(this));
    };

    this.togglePG = function (e) {
        $(".ppcont").toggle();
        if ($(".ppcont").is(":visible"))
            $(".filterCont").hide();
        e.stopPropagation();
    };

    this.tmpPropertyChanged = function (obj, Pname) {
        this.EbObject = obj;
        if (Pname === "DataSourceRefId") {
            if (obj[Pname] !== null) {
                this.PcFlag = true;
                this.EbObject.Columns.$values = [];
                this.EbObject.DSColumns.$values = [];
                this.EbObject.Xaxis.$values = [];
                this.EbObject.Yaxis.$values = [];
                this.call2FD();
            }
        }
        else if (Pname == "Name") {
            $("#objname").text(obj.DisplayName);
        }
    }.bind(this);

    this.init = function () {
        if (this.EbObject.Type !== "")
            this.type = this.EbObject.Type;
        //$.event.props.push('dataTransfer');
        this.createChartDivs();
        this.appendColumns();
        if (!this.bot) {
            this.appendXandYAxis();
            if (this.login === "uc") {
                this.collapseGraph();
            }
            $(".ppcont").hide();
            $(".filterCont").hide();

            filterChanged = false;
            if (this.MainData !== null) {
                this.drawGraphHelper(this.MainData.data);
            }
            else {
                if (this.login === "uc") {
                    dvcontainerObj.currentObj.Pippedfrom = "";
                    $("#Pipped").text("");
                    this.isPipped = false;
                }
                if (this.isContextual) {
                    if (this.isSecondTime) {
                        if (this.FilterDialog.IsFDValidationOK && !this.FilterDialog.IsFDValidationOK())
                            return;
                        this.filterValues = this.getFilterValues();
                    }
                }
                else {
                    if (this.FilterDialog.IsFDValidationOK && !this.FilterDialog.IsFDValidationOK())
                        return;
                    this.filterValues = this.getFilterValues();
                }
                this.isSecondTime = false;
                $("#eb_common_loader").EbLoader("show");
                $.ajax({
                    type: 'POST',
                    url: "../DV/getdata",
                    data: { DataVizObjString: JSON.stringify(this.EbObject), draw: 1, RefId: this.EbObject.DataSourceRefId, Start: 0, Length: 50, TFilters: [], Params: this.filterValues, dvRefId: this.Refid },

                    success: this.getDataSuccess.bind(this),
                    error: function () { }
                });
            }
        }

        this.GenerateButtons();

    };

    this.CloseParamDiv = function () {
        this.FDCont.toggle('drop', { direction: 'right' }, 150);
        if (this.FDCont.is(":visible"))
            $(".ppcont").hide();
    };

    this.validateFD = function () {
        var isValid = true;
        var FdCont = "#" + this.ContextId;
        var $ctrls = $(FdCont + "  #filterBox").find("[required]");
        $.each($ctrls, function (idx, ctrl) {
            if ($(ctrl).val().trim() === "") {
                EbMessage("show", { Message: ctrl.id + " is empty" });
                //alert(ctrl.id + " is empty");
                isValid = false;
                $(ctrl).focus();
                $(ctrl).css("border-color", "red");
            }
            else
                $(ctrl).css("border-color", "var(--eb-bluishgray)");
        });
        return isValid;
    };

    this.placefiltervalues = function () {

        $.each(getFlatCtrlObjs(this.FilterDialog.FormObj), function (i, obj) {
            let getobjval = getObjByval(this.filterValues, "Name", obj.Name)
            if (getobjval !== undefined) {
                let val = getobjval.Value;
                obj.setValue(val);
            }
        }.bind(this));
    }

    this.createChartDivs = function () {
        $("#content_" + this.tableId).empty();
        $("#content_" + this.tableId).append(
            `<div id='graphcontainer_tab${this.tableId}' style='height:inherit;' class='chartCont'>
                <div class='col-md-2 no-padd' id='columnsDisplay${this.tableId}' style='height:inherit;'>
                <div class='tag-cont'>
                  <div class='tag-wraper'><div class='pgHead'>Data</div><div class='tag-scroll'><div id='ColumnCont${this.tableId}'></div>
                    <ul id="data-table-list_${this.tableId}" class="tool-box-items">
                        <li>
                            <a>Columns</a>
                            <ul id="Columns${this.tableId}"></ul>
                        </li>
                    </ul>
                </div></div>
                </div>
                </div>
                <div class='col-md-10 canvasParentDiv' id='canvasParentDiv${this.tableId}'>
                <div id='xy${this.tableId}' style='vertical-align: top;'> 
                <div class='input-group' >
                <span class='input-group-addon' id='basic-addon3'> X - Axis</span> 
                <div class='form-control' style='padding: 4px;height:33px' id='X_col_name${this.tableId}' ></div> 
                </div>
                <div class='input-group' style='padding-top: 1px;'>
                <span class='input-group-addon' id='basic-addon3'> Y - Axis</span>
                <div class='form-control' style='padding: 4px;height:33px' id='Y_col_name${this.tableId}'></div> 
                </div>
                </div> 
                <input type='color' id='fontSel' style='display:none;'>
                <div id='canvasDiv${this.tableId}' class="canvasstyle" ><canvas id='myChart${this.tableId}'></canvas></div> 
                </div> 
                </div>`);
    };

    this.GenerateButtons = function () {
        if (this.login === "dc")
            this.propGrid.setObject(this.EbObject, AllMetas["EbChartVisualization"]);
        $("#objname").text(this.EbObject.DisplayName);
        $("#obj_icons").empty();
        $("#obj_icons").append("<button id='btnGo" + this.tableId + "' class='btn commonControl'><i class='fa fa-play' aria-hidden='true'></i></button>");
        $("#btnGo" + this.tableId).click(this.init.bind(this));
        if (this.FD) {
            this.filterid = "filter" + this.tableId;
            this.$filter = $("<button id='" + this.filterid + "' class='btn commonControl'><i class='fa fa-filter' aria-hidden='true'></i></button>");
            $("#obj_icons").append(this.$filter);
            this.$filter.click(this.CloseParamDiv.bind(this));
        }
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
                            <div class="ddchart"><a tabindex="-1" href="#"><img src="../images/svg/horizontal-bar-chart.svg"></a></div>
                            <div class="chartname">Horizontalbar</div>
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
                
            <div>
                
            </ul>
            </div>
           
            <button id='btnColumnCollapse${ this.tableId}' class='btn' style='display: inline-block;'>
            <i class="fa fa-cogs" aria-hidden="true"></i>
            </button>`);
        //}
        if (this.login === "dc")
            this.CreatePgButton();
        if (this.EbObject !== null && this.EbObject.Type !== "") {
            if (this.EbObject.Type !== "line")
                $("#graphDropdown_tab" + this.tableId + " button:first-child").html(`<i class='${_icons[this.EbObject.Type]}'></i>&nbsp;<span class = 'caret'></span>`);
        }
        else {
            $("#graphDropdown_tab" + this.tableId + " button:first-child").html(`<i class='${_icons["bar"]}'></i>&nbsp;<span class = 'caret'></span>`);
        }

        if (this.login === "uc") {
            dvcontainerObj.modifyNavigation();
        }
        //$("#obj_icons").append("<button id='switch" + this.tableId + "' class='btn commonControl'>S</button>");
        this.bindEvents();
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
        $("#switch" + this.tableId).off("click").on("click", this.SwitchToTable.bind(this));
    };

    this.appendColumns = function () {
        var colsAll_XY = [], Xcol = [], Ycol = [], colsAll_X = [];
        var tid = this.tableId;
        //$.each(this.EbObject.Columns.$values, function (i, obj) {
        //    if (obj.RenderAs.toString() === EbEnums.StringRenderType.Marker) {
        //        this.type = "googlemap";
        //        this.bot = true;
        //        var arr = this.cellData.split(",");
        //        if (arr.length == 2) {
        //            this.XLabel.push(this.cellData.split(",")[1]);
        //            this.YLabel.push(this.cellData.split(",")[0]);
        //            this.drawGeneralGraph();
        //        }
        //        return false;
        //    }
        //}.bind(this));
        if (!this.bot) {
            if (this.EbObject.Xaxis.$values.length > 0 && this.EbObject.Yaxis.$values.length > 0) {
                $.each(this.EbObject.Xaxis.$values, this.AddXcolumns.bind(this, Xcol));
                $.each(this.EbObject.Columns.$values, this.RemoveXcolumns.bind(this, colsAll_X, Xcol));
                $.each(this.EbObject.Yaxis.$values, this.AddYcolumns.bind(this, Ycol));
                $.each(colsAll_X, this.RemoveYcolumns.bind(this, colsAll_XY, Ycol));
                $("#Columns" + tid).empty();
            }
            else {
                colsAll_XY = this.EbObject.Columns.$values;
                $("#Columns" + tid).empty();
            }
            $.each(colsAll_XY, function (i, obj) {
                this.AppendColumnInsideFn(obj);
            }.bind(this));
        }
        $('#data-table-list_' + this.tableId).killTree();
        $('#data-table-list_' + this.tableId).treed();
        $('#data-table-list_' + this.tableId + ' .branch a').trigger("click");
        this.updateDragula();
    };

    this.AppendColumnInsideFn = function (obj) {
        if (obj.Type === 16)
            _classname = "fa-font";
        else if (obj.Type === 5 || obj.Type === 6)
            _classname = "fa-calendar";
        else if (obj.Type === 8 || obj.Type === 7 || obj.Type === 11 || obj.Type === 12)
            _classname = "fa-sort-numeric-asc";

        $("#Columns" + this.tableId).append(`<li class='colTiles' style='display: list-item;' id='li${obj.name}' data-id='${obj.data}' data-type=${obj.Type}><span><i class='fa ${_classname}'></i></span>${obj.name}</li>`);
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
        if (this.EbObject.Xaxis.$values.length > 0 && this.EbObject.Yaxis.$values.length > 0) {
            $("#X_col_name" + tid).empty();
            $("#Y_col_name" + tid).empty();
            $.each(this.EbObject.Xaxis.$values, function (i, obj) {
                $("#X_col_name" + tid).append("<li class='colTiles columnDrag' id='li" + obj.name + "' data-id='" + obj.data + "' data-type='" + obj.Type + "'>" + obj.name + "<button class='close' type='button'>x</button></li>");
                //this.Xindx.push(obj.data);
            });
            $.each(this.EbObject.Yaxis.$values, function (i, obj) {
                $("#Y_col_name" + tid).append("<li class='colTiles columnDrag' id='li" + obj.name + "' data-id='" + obj.data + "' data-type='" + obj.Type + "'>" + obj.name + "<button class='close' type='button'>x</button></li>");
                if (this.EbObject.LegendColor.$values[i].Name === null) {
                    this.EbObject.LegendColor.$values[i].Name = obj.name;
                    this.EbObject.LegendColor.$values[i].Color = default_colors[i];
                }

            }.bind(this));
        }
        $("#X_col_name" + this.tableId + " button[class=close]").off("click").on("click", this.RemoveAndAddToColumns.bind(this));
        $("#Y_col_name" + this.tableId + " button[class=close]").off("click").on("click", this.RemoveAndAddToColumns.bind(this));

        this.flagAppendColumns = true;
    };

    this.acceptDrop = function (el, target, source, sibling) {
        if ($(source).attr("id") === "Columns" + this.tableId && $(target).attr("id") === "X_col_name" + this.tableId) {
            return true;
        }
        else if ($(source).attr("id") === "Columns" + this.tableId && $(target).attr("id") === "Y_col_name" + this.tableId) {
            return true;
        }
        else {
            return false;
        }

    };

    this.getFilterValues = function () {
        var fltr_collection = [];

        if (this.FD)
            fltr_collection = getValsForViz(this.FilterDialog.FormObj);

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
        $("#eb_common_loader").EbLoader("hide");
        //this.MainData = result.data; 
        if (this.login == "uc")
            dvcontainerObj.currentObj.data = result;
        this.drawGraphHelper(result.data);
    };

    this.drawGraphHelper = function (datain) {
        this.data = datain;
        if (this.EbObject.Xaxis.$values.length >= 1 && this.EbObject.Yaxis.$values.length >= 1)
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
                if (this.type !== "pie") {
                    this.piedataFlag = false;
                    this.dataset.push(new datasetObj(this.EbObject.Yaxis.$values[k].name, this.YLabel, this.EbObject.LegendColor.$values[k].Color, this.EbObject.LegendColor.$values[k].Color, false));
                }
                else {
                    this.dataset.push(new datasetObj4Pie(this.EbObject.Yaxis.$values[k].name, this.YLabel, this.EbObject.LegendColor.$values[k].Color, this.EbObject.LegendColor.$values[k].Color, false));
                    this.piedataFlag = true;
                }
            }

        }
    };

    this.getBarDataLabel = function (xdx, i, value) {
        for (k = 0; k < xdx.length; k++)
            this.XLabel.push(value[xdx[k]]);
    };

    this.drawGeneralGraph = function () {
        if (!this.bot) {
            $("#eb_common_loader").EbLoader("show");
            this.getBarData();
        }
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

        $("#eb_common_loader").EbLoader("hide");

    };

    this.RemoveCanvasandCheckButton = function () {
        if (this.type === null) {
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
        this.isSecondTime = true;
        $("#eb_common_loader").EbLoader("hide");
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
                if (this.login === "dc")
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
            if (this.login === "dc")
                this.propGrid.setObject(this.EbObject, AllMetas["EbGoogleMap"]);
            this.EbObject = this.EbObject;

            this.updateDragula();
        }
        e.preventDefault();
    };

    this.colDrop = function (el, target, source, sibling) {
        $(el).addClass("columnDrag");
        $(el).children("span").remove();
        $(el).children(".close").remove();
        var temp;
        $(el).css("display", "inline-block");
        var name = $(el).text();
        $(el).append("<button class='close' type='button'>x</button>");

        if ($(target).attr("id") === "X_col_name" + this.tableId || $(target).attr("id") === "Y_col_name" + this.tableId) {
            if ($(target).attr("id") === "X_col_name" + this.tableId) {
                temp = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.name === name; });
                let index = this.EbObject.Xaxis.$values.findIndex(x => x.name === temp[0].name);
                if (index > -1)
                    this.EbObject.Xaxis.$values.splice(index, 1);
                this.EbObject.Xaxis.$values.push(temp[0]);
            }
            else if ($(target).attr("id") === "Y_col_name" + this.tableId) {
                temp = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.name === name; });
                let index = this.EbObject.Yaxis.$values.findIndex(x => x.name === temp[0].name);
                if (index > -1)
                    this.EbObject.Yaxis.$values.splice(index, 1);
                this.EbObject.Yaxis.$values.push(temp[0]);

                index = this.EbObject.LegendColor.$values.findIndex(x => x.Name === temp[0].name);
                if (index > -1)
                    this.EbObject.LegendColor.$values.splice(index, 1);
                this.EbObject.LegendColor.$values.push(new ChartColor(name, randomColor()));
            }

            if ($("#X_col_name" + this.tableId + " li").length === 1 && $("#Y_col_name" + this.tableId + " li").length >= 1) {
                this.drawGeneralGraph();
            }
            else {
                $("#myChart" + this.tableId).remove();
                $("#canvasDiv" + this.tableId).append("<canvas id='myChart" + this.tableId + "'></canvas>");
            }
            console.log(this.EbObject.Xaxis); console.log(this.EbObject.Yaxis);
        }


        $("#X_col_name" + this.tableId + " button[class=close]").off("click").on("click", this.RemoveAndAddToColumns.bind(this));
        $("#Y_col_name" + this.tableId + " button[class=close]").off("click").on("click", this.RemoveAndAddToColumns.bind(this));
    };

    this.colDropRef = function (el, target, source, sibling) {
        this.colDrop(el, target, source, sibling);
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
        }
        else {
            $("#canvasParentDiv" + this.tableId).removeClass("col-md-12").addClass("col-md-10");
            $("#canvasDiv" + this.tableId).css("height", "calc(100% - 67px)");
        }
    };

    this.toggleFilterdialog = function () {
        $("#" + this.ContextId).toggle();
    };

    this.RemoveAndAddToColumns = function (e) {
        var str = $(e.target).parent().text();
        let tempObj = new Object();
        tempObj.Type = parseInt($(e.target).parent().attr("data-type"));
        tempObj.name = str.substr(0, str.length - 1).trim();
        tempObj.data = $(e.target).parent().attr("data-id");

        this.AppendColumnInsideFn(tempObj);
        $(e.target).parent().remove();
        this.EbObject.Xaxis.$values = $.grep(this.EbObject.Xaxis.$values, function (vobj) { return vobj.name !== str.substring(0, str.length - 1).trim(); });
        this.EbObject.Yaxis.$values = $.grep(this.EbObject.Yaxis.$values, function (vobj) { return vobj.name !== str.substring(0, str.length - 1).trim(); });
        this.EbObject.LegendColor.$values = $.grep(this.EbObject.LegendColor.$values, function (vobj) { return vobj.Name !== str.substring(0, str.length - 1).trim(); });
        if ($("#X_col_name" + this.tableId + " li").length === 1 && $("#Y_col_name" + this.tableId + " li").length >= 1) {
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
            if (legendItem.text === obj.Name)
                this.EbObject.LegendColor.$values[i].Color = $("#fontSel").val();
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
    };

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
        if (this.drake)
            this.drake.destroy();
        this.drake = new dragula([document.getElementById("Columns" + this.tableId), document.getElementById("X_col_name" + this.tableId), document.getElementById("Y_col_name" + this.tableId)], {
            accepts: this.acceptDrop.bind(this),
            drop: function (el, source) {
            }
        });
        this.drake.off("drop").on("drop", this.colDropRef.bind(this));
        if (this.type === "")
            this.type = "bar";
        if (this.login === "dc")
            this.propGrid.setObject(this.EbObject, AllMetas["EbChartVisualization"]);
        $("#graphDropdown_tab" + this.tableId).show();

    };

    this.toolTipCallback = function (item, data) {
        if (this.type === "pie")
            return data.datasets[item.datasetIndex].label + ": " + data.labels[item.index] + ": " + data.datasets[item.datasetIndex].data[item.index];
    }.bind(this);

    this.CreateRelationString = function () { };

    this.SwitchToTable = function () {

    };

    this.start();
};


