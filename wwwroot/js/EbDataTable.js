

const arrayColumn = (arr, n) => arr.map(x => x[n]);

//refid, ver_num, type, dsobj, cur_status, tabNum, ssurl
var EbDataTable = function (refid, ver_num, type, dsobj, cur_status, tabNum, ssurl, login, counter, data, rowData, filterValues, url, cellData, PGobj, datePattern) {
    this.propGrid = PGobj;
    this.Api = null;
    this.order_info = new Object();
    this.order_info.col = '';
    this.order_info.dir = 0;
    this.MainData = (data === undefined) ? null : data;
    this.isPipped = false;
    this.isContextual = false;
    this.chartJs = null;
    this.url = url;
    this.EbObject = dsobj;
    this.tabNum = tabNum;
    this.Refid = refid;
    this.tableId = null;
    this.ebSettings = null;
    this.ssurl = ssurl;
    this.login = login;
    this.relatedObjects = null;
    this.FD = false;
    //Controls & Buttons
    this.table_jQO = null;
    //this.btnGo = $('#btnGo');
    this.filterBox = null;
    this.filterbtn = null;
    this.clearfilterbtn = null;
    this.totalpagebtn = null;
    this.copybtn = null;
    this.printbtn = null;
    this.settingsbtn = null;
    this.OuterModalDiv = null;
    this.settings_tbl = null;

    //temp
    this.eb_filter_controls_4fc = [];
    this.eb_filter_controls_4sb = [];
    this.zindex = 0;
    this.rowId = -1;
    //this.isSettingsSaved = false;
    this.dropdown_colname = null;
    this.deleted_colname = null;
    this.tempcolext = [];
    this.linkDV = null;
    this.filterFlag = false;
    //if (index !== 1)
    this.rowData = (rowData !== undefined && rowData !== null && rowData !== "") ? JSON.parse(atob(rowData)) : null;
    this.filterValues = (filterValues !== "" && filterValues !== undefined && filterValues !== null) ? JSON.parse(atob(filterValues)) : [];
    this.FlagPresentId = false;
    this.flagAppendColumns = false;
    this.drake = null;
    this.draggedPos = null;
    this.droppedPos = null;
    this.dragNdrop = false;
    this.flagColumnVisible = false;
    this.pg = null;
    this.ppgridChildren = null;
    this.columnDefDuplicate = null;
    this.extraCol = [];
    this.PcFlag = false;
    this.modifyDVFlag = false;
    this.initCompleteflag = false;
    this.isTagged = false;
    //this.filterChanged = false;
    this.isRun = false;
    this.cellData = cellData;
    this.columnSearch = [];
    this.isSecondTime = false;
    this.tempColumns = [];
    this.filterHtml = "";
    this.orderColl = [];
    this.RGIndex = [];
    this.NumericIndex = [];
    this.inline = false;
    this.rowgroupCols = []
    this.rowgroupFilter = [];
    this.CurrentRowGroup = null;
    this.permission = [];
    this.isCustomColumnExist = false;

    var split = new splitWindow("parent-div0", "contBox");

    this.init = function () {
        this.tableId = "dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + counter;
        this.ContextId = "filterWindow_" + this.tableId;
        this.FDCont = $(`<div id='${this.ContextId}' class='filterCont fd'></div>`);
        $("#parent-div0").before(this.FDCont);
        this.FDCont.hide();

        if (this.login === "dc") {
            this.stickBtn = new EbStickButton({
                $wraper: this.FDCont,
                $extCont: this.FDCont,
                //$scope: $(subDivId),
                icon: "fa-filter",
                dir: "left",
                label: "Parameters",
                //btnTop: 42,
                style: { top: "112px" }
            });
        }
    };

    split.windowOnFocus = function (ev) {
        $("#Relateddiv").hide();
        if ($(ev.target).attr("class") !== undefined) {
            if ($(ev.target).attr("class").indexOf("sub-windows") !== -1) {
                var id = $(ev.target).attr("id");
                focusedId = id;
            }
        }
    }.bind(this);

    this.call2FD = function (value) {
        var isCustom = (typeof (value) !== "undefined") ? ((value === "Yes") ? true : false) : true;
        this.relatedObjects = this.EbObject.DataSourceRefId;
        $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#parent", Style: { "top": "39px", "margin-left": "unset", "margin-right": "unset" } }, maskLoader: false });
        $.ajax({
            type: "POST",
            url: "../DV/dvCommon",
            data: { dvobj: JSON.stringify(this.EbObject), dvRefId: this.Refid, _flag: this.PcFlag, login: this.login, contextId: this.ContextId, customcolumn: isCustom },
            success: this.ajaxSucc
        });
    };

    this.ajaxSucc = function (text) {
        var flag = false;
        if (this.MainData !== null) {
            this.isPipped = true;
            $("#Pipped").show();
            $("#Pipped").text("Pipped From: " + this.EbObject.Pippedfrom);
            this.filterValues = dvcontainerObj.dvcol[prevfocusedId].filterValues;
        }
        else if (this.filterValues !== null && this.filterValues.length > 0) {
            this.isContextual = true;
        }
        else
            this.isTagged = true;

        $("#obj_icons").empty();
        $("#obj_icons").append("<button id='btnGo" + this.tabNum + "' class='btn commonControl'><i class='fa fa-play' aria-hidden='true'></i></button>");
        $("#btnGo" + this.tabNum).click(this.getColumnsSuccess.bind(this));
        var subDivId = "#sub_window_dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + counter;
        $("#content_dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + counter).empty();
        this.filterHtml = text;
        if (this.login === "uc") {
            this.stickBtn = new EbStickButton({
                $wraper: $(".dv-body"),
                $extCont: this.FDCont,
                $scope: $("#" + focusedId),
                icon: "fa-filter",
                dir: "left",
                label: "Parameters",
                //btnTop: 42,
                style: { position: "absolute", top: "46px" }
            });
        }

        this.FDCont = $("#filterWindow_" + this.tableId);
        $("#filterWindow_" + this.tableId).empty();
        $("#filterWindow_" + this.tableId).append("<div class='pgHead'> Param window <div class='icon-cont  pull-right' id='close_paramdiv_" + this.tableId + "'><i class='fa fa-thumb-tack' style='transform: rotate(90deg);'></i></div></div>");//
        $("#filterWindow_" + this.tableId).children().find('#close_paramdiv').off('click').on('click', this.CloseParamDiv.bind(this));
        $("#filterWindow_" + this.tableId).children().find("#close_paramdiv_" + this.tableId).off('click').on('click', this.CloseParamDiv.bind(this));
        $("#filterWindow_" + this.tableId).append(text);
        $("#filterWindow_" + this.tableId).children().find("#btnGo").click(this.getColumnsSuccess.bind(this));

        this.FilterDialog = (typeof (FilterDialog) !== "undefined") ? FilterDialog : {};

        if (text !== "") {
            if (typeof commonO !== "undefined")
                this.EbObject = commonO.Current_obj;
            else
                this.EbObject = dvcontainerObj.currentObj;
        }
        //this.InitializeColumns();
        this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
        if (this.PcFlag === "True")
            this.compareAndModifyRowGroup();

        if ($("#" + this.ContextId).children("#filterBox").length === 0) {
            this.FD = false;
            this.FDCont.hide();
            if (this.login === "dc") {
                this.stickBtn.hide();
            }
            else {
                dvcontainerObj.dvcol[focusedId].stickBtn.hide();
            }
            $("#eb_common_loader").EbLoader("hide");
            $("#btnGo" + this.tabNum).trigger("click");
        }
        else {
            this.FD = true;
            if (this.isPipped || this.isContextual) {
                this.placefiltervalues();
                $("#btnGo" + this.tabNum).trigger("click");
            }
            else if (this.FilterDialog.filterObj.AutoRun) {
                $("#btnGo" + this.tabNum).trigger("click");
            }
            else {
                this.FDCont.show();
                this.FDCont.css("visibility", "visible");
            }
            $("#eb_common_loader").EbLoader("hide");
        }
        $(subDivId).focus();

        this.PcFlag = false;
    }.bind(this);

    this.CloseParamDiv = function () {
        //if (this.login === "dc") {
        //    this.stickBtn.minimise();
        //}
        //else {
        //    dvcontainerObj.dvcol[focusedId].stickBtn.minimise();
        //}
        this.stickBtn.minimise();
    };

    this.tmpPropertyChanged = function (obj, Pname) {
        //this.isSecondTime = true;
        if (Pname === "DataSourceRefId") {
            if (obj[Pname] !== null) {
                this.PcFlag = true;
                this.stickBtn.hide();
                this.filterValues = [];
                this.isContextual = false;
                this.isPipped = false;
                this.rowData = null;
                this.CurrentRowGroup = null;
                this.rowgroupCols = [];
                this.EbObject.RowGroupCollection.$values = [];
                this.orderColl = [];
                this.check4Customcolumn();
                this.EbObject.OrderBy.$values = [];
                this.MainData = null;
                if (this.isCustomColumnExist) {
                    EbDialog("show", {
                        Message: "Retain Custom Columns?",
                        Buttons: {
                            "Yes": {
                                Background: "green",
                                Align: "right",
                                FontColor: "white;"
                            },
                            "No": {
                                Background: "red",
                                Align: "left",
                                FontColor: "white;"
                            }
                        },
                        CallBack: this.dialogboxAction.bind(this)
                    });
                }
                else
                    this.call2FD();
            }
        }
        else if (Pname === "Name") {
            $("#objname").text(obj.DisplayName);
            console.log(obj);
        }
        else if (Pname === "Columns") {
            console.log(obj);
        }
        else if (Pname === "Formula") {
            this.ValidateCalcExpression(obj);
        }
        else if (Pname === "RowGroupCollection") {
            this.CurrentRowGroup = null;
            this.rowgroupCols = [];
        }
    }.bind(this);

    this.dialogboxAction = function (value) {
        this.call2FD(value);
    };

    this.compareAndModifyRowGroup = function () {
        $.each(this.EbObject.RowGroupCollection.$values, function (i, obj) {
            $.each(obj.RowGrouping.$values, function (j, col) {
                var tempcol = $.grep(this.EbObject.Columns.$values, function (column) { return column.name === col.name && column.Type === col.Type });
                if (tempcol.length === 1)
                    obj.RowGrouping.$values[j] = tempcol[0];
            }.bind(this));
        }.bind(this));
    }

    //Initialisation
    this.start = function () {
        if (this.EbObject === null) {
            this.EbObject = new EbObjects["EbTableVisualization"]("Container_" + Date.now());
            split.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum + "_" + counter, "EbTableVisualization");
            if (this.login === "dc") {
                //this.propGrid = new Eb_PropertyGrid("pp_inner", "dc");
                this.propGrid = new Eb_PropertyGrid({
                    id: "pp_inner",
                    wc: "dc",
                    cid: this.cid,
                    $extCont: $(".ppcont")
                }, this.PGobj);

                this.propGrid.PropertyChanged = this.tmpPropertyChanged;
            }
            this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
            $("#" + this.ContextId).css("visibility", "hidden");
            this.init();
        }
        else {
            if (this.MainData !== null)
                split.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum + "_" + counter, "EbTableVisualization", prevfocusedId);
            else
                split.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum + "_" + counter, "EbTableVisualization");
            if (this.login === "dc") {
                //this.propGrid = new Eb_PropertyGrid("pp_inner", "dc");

                this.propGrid = new Eb_PropertyGrid({
                    id: "pp_inner",
                    wc: "dc",
                    cid: this.cid,
                    $extCont: $(".ppcont")
                }, this.PGobj);

                this.propGrid.PropertyChanged = this.tmpPropertyChanged;
            }
            this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
            this.init();
            this.call2FD();
        }

        this.propGrid.CXVE.onAddToCE = function (prop, val, addedObj) {
            if (addedObj.ObjType === "NumericColumn")
                addedObj.className = "tdheight dt-body-right";
        };
    };

    this.getColumnsSuccess = function (e) {        
        if (this.isContextual) {
            if (this.isSecondTime) {
                if (!this.validateFD())
                    return;
                this.filterValues = this.getFilterValues("filter");
            }
        }
        else {
            if (!this.validateFD())
                return;
            this.filterValues = this.getFilterValues("filter");
        }
        this.isSecondTime = false;
        $(".dv-body1").show();
        $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#dv-body", Style: { "top": "39px", "margin-left": "-15px" } } });
        this.extraCol = [];
        this.ebSettings = this.EbObject;
        $.extend(this.tempColumns, this.EbObject.Columns.$values);
        //this.tempColumns.sort(this.ColumnsComparer);
        this.dsid = this.ebSettings.DataSourceRefId;//not sure..
        this.dvName = this.ebSettings.Name;
        this.initCompleteflag = false;

        this.propGrid.ClosePG();

        if (this.login === "dc") {
            if (this.FD)
                this.stickBtn.minimise();
            else
                this.stickBtn.hide();
        }
        else {
            if (this.FD) {
                this.stickBtn.minimise();
            }

            else
                this.stickBtn.hide();
        }
        this.addSerialAndCheckboxColumns();

        //hard coding
        this.orderColl = [];
        let rowG_coll = this.EbObject.RowGroupCollection.$values;
        let CurR_RowG = this.CurrentRowGroup;
        if (!this.EbObject.DisableRowGrouping) {
            if (CurR_RowG === null) {

                $.each(rowG_coll, function (i, obj) {
                    if (obj.RowGrouping.$values.length > 0) {
                        this.CurrentRowGroup = JSON.parse(JSON.stringify(obj));
                        this.visibilityCheck();
                        return false;
                    }
                }.bind(this));

            }
            else
                this.visibilityCheck();
        }
        else {
            if (this.CurrentRowGroup !== null) {
                $.each(this.EbObject.Columns.$values, function (i, colobj) {
                    $.each(CurR_RowG.RowGrouping.$values, function (i, rgobj) {
                        if (colobj.name === rgobj.name) {
                            colobj.bVisible = true;
                        }
                    }.bind(this));
                }.bind(this));
            }
            this.CurrentRowGroup = null;
            this.RGIndex = [];
            this.rowgroupCols = [];
        }

        //----------
        if (this.ebSettings.$type.indexOf("EbTableVisualization") !== -1) {
            $("#content_" + this.tableId).empty();
            $("#content_" + this.tableId).append("<div id='" + this.tableId + "divcont' class='wrapper-cont_inner'><table id='" + this.tableId + "' class='table display table-bordered compact'></table></div>");
            this.Init();
        }
    };

    this.check4Customcolumn = function () {
        var temp = $.grep(this.EbObject.Columns.$values, function (obj) {return obj.IsCustomColumn;});
        if (temp.length === 0)
            this.isCustomColumnExist = false;
        else
            this.isCustomColumnExist = true;
    };

    this.InitializeColumns = function () {
        $.each(this.EbObject.Columns.$values, function (i, col) {
            if (col.HideDataIfRowMoreThan === null)
                col.HideDataIfRowMoreThan = { "$type": "ExpressBase.Objects.Objects.DVRelated.HideColumnData, ExpressBase.Objects", "Enable": false, "UnRestrictedRowCount": 0, "ReplaceByCharacter": "", "ReplaceByText": "" };
        }.bind(this));
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
                $(ctrl).css("border-color", "rgba(34, 36, 38, .15)");
        });
        return isValid;
    }

    this.Init = function () {
        //this.MainData = null;
        $.event.props.push('dataTransfer');
        this.updateRenderFunc();
        this.table_jQO = $('#' + this.tableId);
        this.copybtn = $("#btnCopy" + this.tableId);
        this.printbtn = $("#btnPrint" + this.tableId);
        this.printSelectedbtn = $("#btnprintSelected" + this.tableId);
        this.excelbtn = $("#btnExcel" + this.tableId);
        this.csvbtn = $("#btnCsv" + this.tableId);
        this.pdfbtn = $("#btnPdf" + this.tableId);

        this.eb_agginfo = this.getAgginfo();

        this.table_jQO.append($(this.getFooterFromSettingsTbl()));

        this.table_jQO.children("tfoot").hide();
        this.table_jQO.children().find("tr").addClass("addedbyeb");

        this.table_jQO.on('processing.dt', function (e, settings, processing) {
            if (processing == true) {
                $("#obj_icons .btn").prop("disabled", true);
                $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#parent", Style: { "top": "39px", "margin-left": "-15px" } } });
            }
            else {
                $("#obj_icons .btn").prop("disabled", false);
                $("#eb_common_loader").EbLoader("hide");
                $("[data-coltyp=date]").datepicker("hide");
            }
        }.bind(this));

        jQuery.fn.dataTable.ext.errMode = 'alert';

        this.table_jQO.on('error.dt', function (settings, techNote, message) {
            console.log('An error has been reported by DataTables: ', message);
        });

        this.Api = this.table_jQO.DataTable(this.createTblObject());

        this.Api.off('select').on('select', this.selectCallbackFunc.bind(this));

        jQuery.fn.dataTable.Api.register('sum()', function () {
            return this.flatten().reduce(function (a, b) {
                if (typeof a === 'string') {
                    a = a.replace(/[^\d.-]/g, '') * 1;
                }
                if (typeof b === 'string') {
                    b = b.replace(/[^\d.-]/g, '') * 1;
                }

                return a + b;
            }, 0);
        });

        jQuery.fn.dataTable.Api.register('average()', function () {
            var data = this.flatten();
            var sum = data.reduce(function (a, b) {
                if (typeof a === 'string') {
                    a = a.replace(/[^\d.-]/g, '') * 1;
                }
                if (typeof b === 'string') {
                    b = b.replace(/[^\d.-]/g, '') * 1;
                }

                return (a * 1) + (b * 1); // cast values in-case they are strings
            }, 0);

            return sum / data.length;
        });

        jQuery.extend(jQuery.fn.dataTableExt.oSort, {
            "date-uk-pre": function (a) {
                if (a == null || a == "") {
                    return 0;
                }
                var ukDatea = a.split('/');
                return (ukDatea[2] + ukDatea[1] + ukDatea[0]) * 1;
            },

            "date-uk-asc": function (a, b) {
                return ((a < b) ? -1 : ((a > b) ? 1 : 0));
            },

            "date-uk-desc": function (a, b) {
                return ((a < b) ? 1 : ((a > b) ? -1 : 0));
            }
        });

        this.table_jQO.off('draw.dt').on('draw.dt', this.doSerial.bind(this));

        //this.table_jQO.on('length.dt', function (e, settings, len) {
        //    console.log('New page length: ' + len);
        //});

        $.fn.dataTable.ext.errMode = function (settings, helpPage, message) {
            alert("ajax erpttt......");
        };

    };

    this.addSerialAndCheckboxColumns = function () {
        this.CheckforColumnID();//, 
        var serialObj = (JSON.parse('{ "searchable": false, "orderable": false, "bVisible":true, "name":"serial", "title":"#", "Type":11}'));
        this.extraCol.push(serialObj);
        this.addcheckbox();
    }

    this.CheckforColumnID = function () {
        this.FlagPresentId = false;
        $.each(this.ebSettings.Columns.$values, function (i, col) {
            if (col.name === "id") {
                this.FlagPresentId = true;
                col.bVisible = false;
                return false;
            }
        }.bind(this));
    };

    this.addcheckbox = function () {
        var chkObj = new Object();
        chkObj.data = null;
        chkObj.title = "<input id='{0}_select-all' class='eb_selall" + this.tableId + "' type='checkbox' data-table='{0}'/>".replace("{0}", this.tableId);
        chkObj.sWidth = "10px";
        chkObj.orderable = false;
        chkObj.bVisible = false;
        chkObj.name = "checkbox";
        chkObj.Type = 3;
        chkObj.render = this.renderCheckBoxCol.bind(this);
        chkObj.pos = "-1";

        this.extraCol.push(chkObj);
    }

    this.createTblObject = function () {
        var o = new Object();
        //o.scrollY = "inherit";
        o.scrollX = "100%";
        //o.scrollXInner = "110%";
        o.scrollCollapse = true;
        if (this.ebSettings.PageLength !== 0) {
            o.lengthMenu = this.generateLengthMenu();
        }
        if (this.ebSettings.LeftFixedColumn > 0 || this.ebSettings.RightFixedColumn > 0)
            o.fixedColumns = { leftColumns: this.fixedColumnCount(), rightColumns: this.ebSettings.RightFixedColumn };
        o.pagingType = "full";
        o.buttons = ['copy', 'csv', 'excel', 'pdf', 'print', { extend: 'print', exportOptions: { modifier: { selected: true } } }];
        //}
        //else if (this.dtsettings.directLoad) {
        //    o.paging = false;
        //    //o.lengthMenu = [[-1], ["All"]];
        //    o.dom = "rti";
        //}
        //o.rowGroup = {
        //    dataSrc: 4
        //};
        //o.paging = false;
        //o.rowReorder = true;
        //o.order = [[8, "asc"]];
        o.bAutoWidth = false;
        o.autowidth = false;
        o.serverSide = true;
        o.processing = true;
        o.pageResize = true;
        //o.deferRender = true;
        //o.scroller = true;
        o.language = {
            //processing: "<div class='fa fa-spinner fa-pulse fa-3x fa-fw'></div>",
            info: "_START_ - _END_ / _TOTAL_",
            paginate: {
                "previous": "Prev"
            },
            lengthMenu: "_MENU_ / Page",
        };
        o.columns = this.rowgroupCols.concat(this.extraCol, this.ebSettings.Columns.$values);
        o.order = [];
        o.deferRender = true;
        //o.filter = true;
        //o.select = true;
        //o.retrieve = true;
        o.keys = true;
        //this.filterValues = this.getFilterValues();
        //filterChanged = false;
        //if (!this.isTagged)
        //    this.compareFilterValues();
        //else
        //    filterChanged = true;
        if (this.MainData !== null && this.login == "uc" && !filterChanged && this.isPipped) {
            //o.serverSide = false;
            o.dom = "<'col-md-10 noPadding'B><'col-md-2 noPadding'f>rt";
            dvcontainerObj.currentObj.data = this.MainData;
            o.ajax = function (data, callback, settings) {
                setTimeout(function () {
                    callback({
                        draw: dvcontainerObj.currentObj.data.draw,
                        data: dvcontainerObj.currentObj.data.data,
                        recordsTotal: dvcontainerObj.currentObj.data.recordsTotal,
                        recordsFiltered: dvcontainerObj.currentObj.data.recordsFiltered,
                    });
                }, 50);
            }
            o.data = this.receiveAjaxData(this.MainData);
        }
        else {
            o.dom = "<'pagination-wrapper'liBp>rt";
            o.paging = true;
            o.lengthChange = true;
            if (!this.ebSettings.IsPaging) {
                o.dom = "<'col-md-12 noPadding dispaly-none'B>rt";
                o.paging = false;
                o.lengthChange = false;
            }
            if (this.login === "uc") {
                dvcontainerObj.currentObj.Pippedfrom = "";
                $("#Pipped").text("");
                this.isPipped = false;
            }
            try {
                o.ajax = {
                    //url: this.ssurl + '/ds/data/' + this.dsid,
                    url: "../dv/getData",
                    type: 'POST',
                    timeout: 0,
                    data: this.ajaxData.bind(this),
                    dataSrc: this.receiveAjaxData.bind(this),
                    beforeSend: function () {
                    },
                    error: function (req, status, xhr) {
                    }
                };
            }
            catch (Error) {
                alert(Error);
            }
        }
        //o.fnRowCallback = this.rowCallBackFunc.bind(this);
        o.drawCallback = this.drawCallBackFunc.bind(this);
        o.initComplete = this.initCompleteFunc.bind(this);
        //o.fnDblclickCallbackFunc = this.dblclickCallbackFunc.bind(this);
        return o;
    };

    this.generateLengthMenu = function () {
        var ia = [];
        for (var i = 0; i < 5; i++)
            ia[i] = (this.ebSettings.PageLength * (i + 1));
        return JSON.parse("[ [{0},-1], [{0},\"All\"] ]".replace(/\{0\}/g, ia.join(',')));
    }

    this.ajaxData = function (dq) {
        this.matchColumnSearchAndVisible();
        delete dq.columns; delete dq.order; delete dq.search;
        dq.RefId = this.EbObject.DataSourceRefId;
        dq.TFilters = this.columnSearch;
        if (this.filterValues.length === 0)
            this.filterValues = this.getFilterValues();
        dq.Params = this.filterValues;

        dq.OrderBy = this.getOrderByInfo();
        if (this.columnSearch.length > 0) {
            this.filterFlag = true;
        }
        dq.Ispaging = this.EbObject.IsPaging;
        if (dq.length === -1)
            dq.length = this.RowCount;
        dq.DataVizObjString = JSON.stringify(this.EbObject);
        if (this.CurrentRowGroup !== null)
            dq.CurrentRowGroup = JSON.stringify(this.CurrentRowGroup);
        dq.dvRefId = this.Refid;
        return dq;
    };

    this.getOrderByInfo = function () {
        var tempArray = [];
        if (this.CurrentRowGroup !== null) {
            if (this.CurrentRowGroup.RowGrouping.$values.length > 0) {
                for (let i = 0; i < this.CurrentRowGroup.RowGrouping.$values.length; i++)
                    tempArray.push(new order_obj(this.CurrentRowGroup.RowGrouping.$values[i].name, 1));
            }
            if (this.orderColl.length > 0) {
                $.each(this.orderColl, function (i, obj) {
                    tempArray.push(obj);
                });
            }
            else {
                if (this.CurrentRowGroup.OrderBy.$values.length > 0) {
                    for (let i = 0; i < this.CurrentRowGroup.OrderBy.$values.length; i++)
                        tempArray.push(new order_obj(this.CurrentRowGroup.OrderBy.$values[i].name, 1));
                }
            }
        }

        if (tempArray.length === 0) {
            if (this.EbObject.OrderBy.$values.length > 0) {
                $.each(this.EbObject.OrderBy.$values, function (i, obj) {
                    if (tempArray.filter(e => e.Column === obj.name).length === 0)
                        tempArray.push(new order_obj(obj.name, 1));
                });
            }

            $.each(this.orderColl, function (i, obj) {
                var index = tempArray.findIndex(x => x.Column === obj.Column);
                if (index === -1)
                    tempArray.push(obj);
                else {
                    tempArray.splice(index, 1);
                    obj.Direction = (obj.Direction === 1) ? 2 : 1;
                    tempArray.push(obj);
                }

            });
        }

        return tempArray;
    };

    this.getFilterValues = function (from) {
        //this.filterChanged = false;
        var fltr_collection = [];

        if (this.FD)
            fltr_collection = getValsForViz(this.FilterDialog.filterObj);


        //if (this.isContextual && from !== "compare") {
        //    if (from === "filter" && prevfocusedId !== undefined) {
        //        $.each(dvcontainerObj.dvcol[prevfocusedId].filterValues, function (i, obj) {
        //            var f = false;
        //            $.each(fltr_collection, function (j, fObj) {
        //                if (fObj.Name === obj.Name)
        //                    f = true;
        //            });
        //            if (!f)
        //                fltr_collection.push(obj);
        //        });
        //    }
        //    else {
        //        if (this.rowData !== null && this.rowData !== "") {
        //            if (this.Api !== null) {
        //                if (prevfocusedId === undefined)
        //                    from = "link";
        //                $.each(this.rowData, this.rowObj2filter.bind(this, fltr_collection, from));
        //            }
        //        }
        //    }
        //}

        return fltr_collection;
    };

    this.rowObj2filter = function (fltr_collection, from, i, data) {
        if (i < this.EbObject.Columns.$values.length) {
            if (from === "link") {
                var type = this.EbObject.Columns.$values[i].Type;
                //if (type === 5 || type === 6)
                //    data = this.renderDateformat(data, "-");
                if (data !== "")
                    fltr_collection.push(new fltr_obj(type, this.EbObject.Columns.$values[i].name, data));
            }
            else {
                if (dvcontainerObj.dvcol[prevfocusedId].Api !== null) {
                    var type = dvcontainerObj.dvcol[prevfocusedId].EbObject.Columns.$values[i].Type;
                    fltr_collection.push(new fltr_obj(type, dvcontainerObj.dvcol[prevfocusedId].EbObject.Columns.$values[i].name, data));
                }
            }
        }
    };

    this.getfilterFromRowdata = function () {
        var filters = [];
        $.each(this.EbObject.Columns.$values, function (i, col) {
            if (this.rowData[col.data] !== "")
                filters.push(new fltr_obj(col.Type, col.name, this.rowData[col.data]));
        }.bind(this));
        return filters;
    };

    this.placefiltervalues = function () {
        //if (this.filterValues.length > 0) {
        //    $.each(this.filterValues, function (i, param) {
        //        $("#" + this.ContextId + ' #' + param.Name).val(param.Value);
        //    });
        //}
        $.each(getFlatControls(this.FilterDialog.filterObj), function (i, obj) {
            let val = getObjByval(this.filterValues, "Name", obj.Name).Value;
            obj.setValue(val);
        }.bind(this));
    }

    this.filterDisplay = function () {
        var $controls = $("#" + this.ContextId + " #filterBox").children().not("[type=hidden],button");
        var filter = "";
        var filterdialog = [], columnFilter = [];
        if ($controls.length > 0) {
            $.each($controls, function (i, ctrl) {
                var o = new displayFilter();
                var ctype = $(ctrl).attr("ctype");
                o.name = $($(ctrl).children()[0]).text();
                o.operator = "=";
                if (ctype === "ComboBox")
                    o.value = $(ctrl).find("input").attr("display-members");
                else if (ctype === "Date")
                    o.value = $(ctrl).find("input").val();
                else if (ctype === "RadioGroup")
                    o.value = $(ctrl).children().find("[type=radio]:checked").val();
                else if (ctype === "SimpleSelect")
                    o.value = $(ctrl).children().find("option:selected").text();
                else if (ctype === "UserLocation")
                    o.value = $(ctrl).next(".open").children().find(".active").text().trim().replace(" ", ",");
                else
                    o.value = $($(ctrl).children()[1]).val();

                if (typeof $controls[i + 1] !== "undefined")
                    o.logicOp = "AND";
                else
                    o.logicOp = "";
                if (o.value !== undefined && o.value !== null && o.value !== "")
                    filterdialog.push(o);
            });
        }

        if (this.columnSearch.length > 0) {
            for (i = 0; i < this.columnSearch.length; i++) {
                //$.each(this.columnSearch, function (i, search) {
                search = this.columnSearch[i];
                var o = new displayFilter();
                o.name = search.Column;
                o.operator = search.Operator;
                var searchobj = $.grep(this.columnSearch, function (ob) { return ob.Column === search.Column });
                if (searchobj.length === 1) {
                    if (search.Value.toString().includes("|")) {
                        $.each(search.Value.split("|"), function (j, val) {
                            if (val.trim() !== "") {
                                var o = new displayFilter();
                                o.name = search.Column;
                                o.operator = search.Operator;
                                o.value = val;
                                if (typeof search.Value.split("|")[j + 1] !== "undefined" && search.Value.split("|")[j + 1].trim() !== "")
                                    o.logicOp = "OR";
                                else if (typeof this.columnSearch[i + 1] !== "undefined")
                                    o.logicOp = "AND";
                                else
                                    o.logicOp = "";
                                columnFilter.push(o);
                            }
                        }.bind(this));
                    }
                    else {
                        o.value = search.Value;
                        if (typeof this.columnSearch[i + 1] !== "undefined")
                            o.logicOp = "AND";
                        else
                            o.logicOp = "";
                        columnFilter.push(o);
                    }
                }
                else {
                    i++;
                    o.value = searchobj[0].Value + " AND " + searchobj[1].Value;
                    o.operator = "BETWEEN";
                    if (typeof this.columnSearch[i + 1] !== "undefined")
                        o.logicOp = "AND";
                    else
                        o.logicOp = "";
                    columnFilter.push(o);
                }
            }
        }
        this.Tags = new EbTags({ "displayFilterDialogArr": filterdialog, "displayColumnSearchArr": columnFilter, "id": "#filterDisplay_" + this.tableId + "", "remove": this.closeTag });
        //this.Tags = new EbTags({ "displayFilterDialogArr": $controls, "displayColumnSearchArr": this.columnSearch, "id": "#filter_Display", "remove": this.closeTag });
    };

    this.closeTag = function (e, obj) {
        var searchObj = $.grep(this.columnSearch, function (ob) { return ob.Column === obj.name; });
        var index = this.columnSearch.findIndex(x => x.Column == obj.name);
        if (searchObj.length === 1) {
            if (searchObj[0].Value.includes("|")) {
                if (this.columnSearch[index].Value.includes(obj.value + "|"))
                    var val = this.columnSearch[index].Value.replace(obj.value + "|", "");
                else
                    var val = this.columnSearch[index].Value.replace("|" + obj.value, "");
                if (val.trim() != "")
                    this.columnSearch[index].Value = val;
                else
                    this.columnSearch.splice(index, 1);
            }
            else
                this.columnSearch.splice(index, 1);
        }
        else
            this.columnSearch.splice(index, 2);
        this.Api.ajax.reload();
    }.bind(this);

    this.matchColumnSearchAndVisible = function () {

    }

    this.getfilter = function (fltr_collection, i, data) {
        fltr_collection.push(new fltr_obj(data.Type, data.name, this.rowData[i]));
    };

    this.receiveAjaxData = function (dd) {
        this.isRun = true;
        if (this.login === "uc") {
            dvcontainerObj.currentObj.data = dd;
        }
        this.MainData = dd;
        this.RowCount = dd.recordsFiltered;
        //return dd.data;
        this.unformatedData = dd.data;
        this.Levels = dd.levels;
        this.permission = dd.permission;
        return dd.formattedData;

    };

    this.fixedColumnCount = function () {
        var count = this.ebSettings.LeftFixedColumn;
        var visCount = 0;
        if (count > 1) {
            $.each(this.Api.settings().init().aoColumns, function (i, col) {
                if (!col.bVisible) {
                    if (this.ebSettings.LeftFixedColumn > visCount)
                        count++;
                    else
                        return false;
                }
                else
                    visCount++;
            }.bind(this));
        }
        return count;
    }

    this.ColumnsComparer = function (a, b) {
        if (a.data < b.data) return -1;
        if (a.data > b.data) return 1;
        if (a.data === b.data) return 0;
    };

    this.getAgginfo = function () {
        var _ls = [];
        $.each(this.ebSettings.Columns.$values, this.getAgginfo_inner.bind(this, _ls));
        return _ls;
    };

    this.getAgginfo_inner = function (_ls, i, col) {
        if (col.bVisible && (col.Type == parseInt(gettypefromString("Int32")) || col.Type == parseInt(gettypefromString("Decimal")) || col.Type == parseInt(gettypefromString("Int64")) || col.Type == parseInt(gettypefromString("Double")) || parseInt(gettypefromString("Numeric"))) && col.name !== "serial") {
            _ls.push(new Agginfo(col.name, this.ebSettings.Columns.$values[i].DecimalPlaces));
            this.NumericIndex.push(col.data);
        }
    };

    this.getFooterFromSettingsTbl = function () {
        var ftr_part = "";
        $.each(this.rowgroupCols, function (i, col) {
            if (col.bVisible)
                ftr_part += "<th></th>";
            else
                ftr_part += "<th style=\"display:none;\"></th>";
        });
        $.each(this.extraCol, function (i, col) {
            if (col.bVisible)
                ftr_part += "<th></th>";
            else
                ftr_part += "<th style=\"display:none;\"></th>";
        });
        $.each(this.ebSettings.Columns.$values, function (i, col) {
            if (col.bVisible)
                ftr_part += "<th></th>";
            else
                ftr_part += "<th style=\"display:none;\"></th>";
        });
        return "<tfoot>" + ftr_part + "</tfoot>";
    };

    this.repopulate_filter_arr = function () {
        var table = this.tableId;
        var filter_obj_arr = [];
        var api = this.Api;
        if (api !== null) {
            this.Api.columns().every(function (i) {
                var colum = api.settings().init().aoColumns[i].name;
                if (colum !== 'checkbox' && colum !== 'serial') {
                    var oper;
                    var val1, val2;
                    var textid = '#' + table + '_' + colum + '_hdr_txt1';
                    var type = $(textid).attr('data-coltyp');
                    if (type === 'boolean') {
                        val1 = ($(textid).is(':checked')) ? "true" : "false";
                        if (!($(textid).is(':indeterminate')))
                            filter_obj_arr.push(new filter_obj(colum, "=", val1, "boolean"));
                    }
                    else {
                        oper = $('#' + table + '_' + colum + '_hdr_sel').text();
                        if (api.columns(i).visible()[0]) {
                            if (oper !== '' && $(textid).val() !== '') {
                                if (oper === 'B') {
                                    val1 = $(textid).val();
                                    val2 = $(textid).siblings('input').val();
                                    if (oper === 'B' && val1 !== '' && val2 !== '') {
                                        if (type === 'number') {
                                            filter_obj_arr.push(new filter_obj(colum, ">=", Math.min(val1, val2)));
                                            filter_obj_arr.push(new filter_obj(colum, "<=", Math.max(val1, val2), "number"));
                                        }
                                        else if (type === 'date') {
                                            //val1 = this.changeDateOrder(val1);
                                            //val2 = this.changeDateOrder(val2);
                                            if (val2 > val1) {
                                                filter_obj_arr.push(new filter_obj(colum, ">=", val1, "date"));
                                                filter_obj_arr.push(new filter_obj(colum, "<=", val2, "date"));
                                            }
                                            else {
                                                filter_obj_arr.push(new filter_obj(colum, ">=", val2, "date"));
                                                filter_obj_arr.push(new filter_obj(colum, "<=", val1, "date"));
                                            }
                                        }
                                    }
                                }
                                else {
                                    var data = $(textid).val();
                                    //if (type === "date")
                                    //    data = this.changeDateOrder(data);
                                    filter_obj_arr.push(new filter_obj(colum, oper, data, type));
                                }
                            }
                        }
                    }
                }
            }.bind(this));
        }
        return filter_obj_arr;
    };

    this.rowCallBackFunc = function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
        //this.colorRow(nRow, aData, iDisplayIndex, iDisplayIndexFull);
    };

    this.initCompleteFunc = function (settings, json) {
        this.Run = false;
        this.GenerateButtons();
        if (this.login == "uc") {
            this.initCompleteflag = true;
            //if (this.isSecondTime) { }
            //this.ModifyingDVs(dvcontainerObj.currentObj.Name, "initComplete");            
        }

        this.filterDisplay();
        this.arrangeWindowHeight();
        this.createFilterRowHeader();
        this.createFooter();
        $("#" + this.tableId + "_wrapper .dataTables_scrollFoot").children().find("tfoot").show();
        $("#" + this.tableId + "_wrapper .DTFC_LeftFootWrapper").children().find("tfoot").show();
        $("#" + this.tableId + "_wrapper .DTFC_RightFootWrapper").children().find("tfoot").show();

        this.addFilterEventListeners();
        this.arrangeFooterWidth();
        //this.arrangefixedHedaerWidth();
        this.placeFilterInText();
        //this.check4Scroll();
        this.Api.columns.adjust();

        $("#eb_common_loader").EbLoader("hide");
        //this.contextMenu4Cell();
        //this.contextMenu();
        if (this.login === "uc") {
            if (!this.EbObject.DisableCopy)
                $("#" + focusedId + " .wrapper-cont").removeClass("userselect").addClass("userselect");
            else
                $("#" + focusedId + " .wrapper-cont").removeClass("userselect");
        }
        else {
            if (!this.EbObject.DisableCopy)
                $(".wrapper-cont").removeClass("userselect").addClass("userselect");
            else
                $(" .wrapper-cont").removeClass("userselect");
        }
        this.isSecondTime = true;
    }

    this.contextMenu = function () {
        $.contextMenu({
            selector: ".tablelink",
            items: {
                "OpenNewTab": { name: "Open in New Tab", icon: "fa-external-link-square", callback: this.OpeninNewTab.bind(this) }
            }
        });
    }

    this.contextMenu4Label = function () {
        $.contextMenu({
            selector: ".labeldata",
            items: {
                "Copy": { name: "Copy", icon: "fa-external-link-square", callback: this.copyLabelData.bind(this) }
            }
        });
    }

    this.contextMenu4Cell = function () {
        var isDisable = this.EbObject.DisableCopy;
        $.contextMenu('destroy', ".tdheight");
        $.contextMenu({
            selector: ".tdheight",
            items: {
                "Copy": {
                    name: "Copy", icon: "fa-external-link-square", callback: this.copyCellData.bind(this),
                    disabled: function (key, opt) {
                        return isDisable;
                    }
                }
            }
        });

        $('.tdheight').on('contextmenu', function (e) {
            alert(1);
            e.preventDefault();
            return false;
        });
    };

    this.copyCellData = function (key, opt, event) {

    };

    this.OpeninNewTab = function (key, opt, event) {
        var cData = opt;
        this.isContextual = true;
        var idx;
        if (event !== undefined) {
            idx = this.Api.row(opt.$trigger.parent().parent()).index();
            cData = opt.$trigger.text();
        }
        else
            idx = key;

        var splitarray = this.linkDV.split("-");
        if (splitarray[2] === "3") {
            var url = "../ReportRender/BeforeRender?refid=" + this.linkDV;
            var copycelldata = cData.replace(/[^a-zA-Z ]/g, "").replace(/ /g, "_");
            if ($(`#RptModal${copycelldata}`).length !== 0)
                $(`#RptModal${copycelldata}`).remove();
            $("#parent-div0").append(`<div class="modal fade RptModal" id="RptModal${copycelldata}" role="dialog">
                <div class="modal-dialog modal-sm">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal">&times;</button>                              
                        </div>
                        <div class="modal-body"> <iframe id="reportIframe${copycelldata}" class="reportIframe" src='../ReportRender/Renderlink?refid=${this.linkDV}&_params=${btoa(JSON.stringify(this.filterValues))}'></iframe>
            </div>
                    </div>
                </div>
            </div>
            `);
            $(`#RptModal${copycelldata}`).modal();
            $(`#reportIframe${copycelldata}`).css("height", "80vh");
            //else {
            //    $(`#RptModal${copycelldata}`).modal();
            //    $.LoadingOverlay("hide");
            //}
        }
        else if (splitarray[2] === "0") {
            let url = "../WEBFORM/index?refid=" + this.linkDV;
            var _form = document.createElement("form");
            _form.setAttribute("method", "post");
            _form.setAttribute("action", url);
            _form.setAttribute("target", "_blank");

            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_params";
            input.value =btoa(JSON.stringify(this.filterValues));
            _form.appendChild(input);

            document.body.appendChild(_form);
            _form.submit();
            document.body.removeChild(_form);
        }
        else {
            this.tabNum++;
            let url = "../DV/dv?refid=" + this.linkDV;

            let _form = document.createElement("form");
            _form.setAttribute("method", "post");
            _form.setAttribute("action", url);
            _form.setAttribute("target", "_blank");

            let input = document.createElement('input');
            input.type = 'hidden';
            input.name = "rowData";
            input.value = btoa(JSON.stringify(this.rowData));
            _form.appendChild(input);

            let input1 = document.createElement('input');
            input1.type = 'hidden';
            input1.name = "filterValues";
            input1.value = btoa(JSON.stringify(this.filterValues));
            _form.appendChild(input1);

            let input2 = document.createElement('input');
            input2.type = 'hidden';
            input2.name = "tabNum";
            input2.value = this.tabNum;
            _form.appendChild(input2);

            document.body.appendChild(_form);

            //note I am using a post.htm page since I did not want to make double request to the page 
            //it might have some Page_Load call which might screw things up.
            //window.open("post.htm", name, windowoption);       
            _form.submit();
            document.body.removeChild(_form);
        }
    };

    this.arrangeFooterWidth = function () {
        var lfoot = $('#' + this.tableId + '_wrapper .DTFC_LeftFootWrapper table');
        var rfoot = $('#' + this.tableId + '_wrapper .DTFC_RightFootWrapper table');
        var scrollfoot = $('#' + this.tableId + '_wrapper .dataTables_scrollFootInner table');

        if (this.ebSettings.LeftFixedColumn > 0 || this.ebSettings.RightFixedColumn > 0) {
            if (this.ebSettings.LeftFixedColumn > 0) {
                for (var j = 0; j < this.ebSettings.LeftFixedColumn; j++) {
                    $(lfoot).children().find("tr").eq(0).children("th").eq(j).css("width", scrollfoot.find("tfoot").children("tr").eq(0).children("th").eq(j).css("width"));
                }
            }

            if (this.ebSettings.RightFixedColumn > 0) {
                var start = scrollfoot.find("tr").eq(0).children().length - this.ebSettings.RightFixedColumn;
                for (var j = 0; (j + start) < scrollfoot.find("tr").eq(0).children().length; j++) {
                    $(rfoot).children().find("tr").eq(0).children("th").eq(j).css("width", scrollfoot.find("tfoot").children("tr").eq(0).children("th").eq(j + start).css("width"));
                }
            }
        }

        $("#" + this.tableId + " thead tr:eq(1) .eb_finput").parent().remove();
    };

    this.arrangefixedHedaerWidth = function () {
        var lhead = $('#' + this.tableId + '_wrapper .DTFC_LeftHeadWrapper table');
        var rhead = $('#' + this.tableId + '_wrapper .DTFC_RightHeadWrapper table');
        var lbody = $('#' + this.tableId + '_wrapper .DTFC_LeftBodyLiner table');

        if (this.ebSettings.LeftFixedColumn > 0 || this.ebSettings.RightFixedColumn.length > 0) {
            if (this.ebSettings.LeftFixedColumn > 0) {
                for (var j = 0; j < this.ebSettings.LeftFixedColumn; j++) {
                    $(lhead).children().find("tr").eq(0).children("th").eq(j).css("width", lbody.find("tbody").children("tr").eq(0).children("td").eq(j).css("width"));
                }
            }

            if (this.ebSettings.RightFixedColumn > 0) {
                var start = lbody.find("tr").eq(0).children().length - this.ebSettings.RightFixedColumn;
                for (var j = 0; (j + start) < lbody.find("tr").eq(0).children().length; j++) {
                    $(rhead).children().find("tr").eq(0).children("th").eq(j).css("width", lbody.find("tbody").children("tr").eq(0).children("td").eq(j + start).css("width"));
                }
            }
        }


        $("#" + this.tableId + " thead tr:eq(1) .eb_finput").parent().remove();
    };

    this.placeFilterInText = function () {
        if (this.columnSearch.length > 0) {
            if ($('#clearfilterbtn_' + this.tableId).children("i").hasClass("fa-filter"))
                $('#clearfilterbtn_' + this.tableId).children("i").removeClass("fa-filter").addClass("fa-times");
        }
        else {
            if ($('#clearfilterbtn_' + this.tableId).children("i").hasClass("fa-times"))
                $('#clearfilterbtn_' + this.tableId).children("i").removeClass("fa-times").addClass("fa-filter");
        }

        this.Api.columns().every(function (i) {
            var colum = this.Api.settings().init().aoColumns[i].name;
            var colObj = $.grep(this.columnSearch, function (obj) { return obj.Column === colum; });

            var textid = '#' + this.tableId + '_' + colum + '_hdr_txt1';
            if (colum !== 'checkbox' && colum !== 'serial' && colObj.length > 0) {
                var oper;
                var val1, val2;
                var type = $(textid).attr('data-coltyp');
                if (type === 'boolean') {
                    if (colObj.Value === "true")
                        $(textid).attr("checked", true);
                    else if (colObj.Value === "false")
                        $(textid).attr("checked", false);
                    else
                        $(textid).attr("indeterminate", true);
                }
                else {
                    if (this.Api.columns(i).visible()[0]) {
                        if (colObj[0].Operator !== '' && colObj[0].Value !== '') {
                            if (colObj.length === 2) {
                                //$('#' + this.tableId + '_' + colum + '_hdr_sel').text("B");
                                //if (type === "date")
                                //    $(textid).val(this.retainDateOrder(colObj[0].Value));
                                //else
                                $(textid).val(colObj[0].Value);
                                $(".eb_fsel" + this.tableId + "[data-colum=" + colum + "]").trigger("click");
                                //if (type === "date")
                                //    $(textid).siblings('input').val(this.retainDateOrder(colObj[1].Value));
                                //else
                                $(textid).siblings('input').val(colObj[1].Value);
                            }
                            else {
                                //if (type === "date")
                                //    $(textid).val(this.retainDateOrder(colObj[0].Value));
                                //else
                                $(textid).val(colObj[0].Value);
                                $('#' + this.tableId + '_' + colum + '_hdr_sel').text(colObj[0].Operator);
                            }
                        }
                    }
                }
            }
            else {
                if ($(textid).attr("type") === "checkbox")
                    $(textid).prop('indeterminate', true);
                else {
                    $(textid).val("");
                    if ($(textid).next().length === 1)
                        $(textid).next().val("");
                }
            }
        }.bind(this));
        //}
    }

    this.check4Scroll = function () {
        var scrollBody = $('#' + this.tableId + '_wrapper .dataTables_scrollBody');
        if (scrollBody[0].scrollHeight > scrollBody.height()) {
            scrollBody.children().css("width", "110%");
            scrollBody.siblings(".dataTables_scrollFoot").style("width", "98.65%", "important");
        }
        else {
            scrollBody.children().css("width", "100%");
            scrollBody.siblings(".dataTables_scrollFoot").style("width", "100%", "important");
        }

    };

    this.arrangeWindowHeight = function () {
        var filterId = "#filterDisplay_" + this.tableId;
        if (this.login === "uc") {
            if ($(filterId).children().length === 0 && !this.ebSettings.IsPaging)
                $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 54px)", "important");
            else {
                if ($(filterId).children().length === 0)
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 82px)", "important");
                else if (!this.ebSettings.IsPaging)
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 79px)", "important");
                else
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 105px)", "important");
            }
            this.stickBtn.$stickBtn.css("top", "46px");
        }
        else {
            if (this.tabNum !== 0) {
                $("#sub_window_" + this.tableId).style("height", "calc(100vh - 40px)", "important");
                if ($(filterId).children().length === 0 && !this.ebSettings.IsPaging)
                    $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 40px)", "important");
                else {
                    if ($(filterId).children().length === 0)
                        $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 55px)", "important");
                    else if (!this.ebSettings.IsPaging)
                        $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 58px)", "important");
                    else
                        $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 90px)", "important");
                }
            }
            else {
                if ($(filterId).children().length === 0 && !this.ebSettings.IsPaging)
                    $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 75px)", "important");
                else {
                    if ($(filterId).children().length === 0)
                        $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 102px)", "important");
                    else if (!this.ebSettings.IsPaging)
                        $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 100px)", "important");
                    else
                        $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 125px)", "important");
                }
            }
        }
    }

    this.copyLabelData = function (key, opt, event) {

    }

    this.ModifyingDVs = function (parentName, source) {
        $.each(dvcontainerObj.dvcol, function (key, obj) {
            if (parentName === obj.EbObject.Pippedfrom) {
                if (obj.EbObject.$type.indexOf("EbChartVisualization") !== -1 || obj.EbObject.$type.indexOf("EbGoogleMap") !== -1) {
                    dvcontainerObj.dvcol[key].EbObject.data = dvcontainerObj.currentObj.data;
                    dvcontainerObj.dvcol[key].drawGraphHelper(this.Api.data());
                    this.ModifyingDVs(dvcontainerObj.dvcol[key].EbObject.Name, "draw");
                }
                else {
                    if (source === "draw") {
                        dvcontainerObj.dvcol[key].modifyDVFlag = true;
                        dvcontainerObj.dvcol[key].Api.clear().rows.add(this.Api.data());
                        dvcontainerObj.dvcol[key].EbObject.data = dvcontainerObj.currentObj.data;
                        dvcontainerObj.dvcol[key].Api.columns.adjust().draw();
                        this.ModifyingDVs(dvcontainerObj.dvcol[key].EbObject.Name, "draw");
                    }
                }
            }
        }.bind(this));
    }

    this.drawCallBackFunc = function (settings) {
        $('tbody [data-toggle=toggle]').bootstrapToggle();
        if (this.CurrentRowGroup !== null) {
            if (this.CurrentRowGroup.RowGrouping.$values.length > 0)
                this.doRowgrouping();
        }
        if (this.login === "uc" && !this.modifyDVFlag && this.initCompleteflag) {
            //this.ModifyingDVs(dvcontainerObj.currentObj.Name, "draw");
        }
        if (this.isSecondTime) {
            //if (this.columnSearch.length > 0)
            this.filterDisplay();
            this.addFilterEventListeners();
            this.placeFilterInText();
            //this.arrangefixedHedaerWidth();
            this.summarize2();
            this.arrangeWindowHeight();
        }
        this.Api.columns.adjust();
    };

    this.selectCallbackFunc = function (e, dt, type, indexes) {
    };

    this.clickCallbackFunc = function (e) {
    };

    this.dblclickCallbackFunc = function (e) {
    };

    this.rowGroupHandler = function (e) {
        this.orderColl = [];
        let name = $(e.target).val().trim();
        $.each(this.EbObject.RowGroupCollection.$values, function (i, obj) {
            if (obj.Name === name) {
                this.CurrentRowGroup = jQuery.extend({}, obj);
                this.getColumnsSuccess(e);
            }
        }.bind(this));
    };

    this.visibilityCheck = function () {
        this.RGIndex = [];
        this.ebSettings.LeftFixedColumn = 0;
        this.ebSettings.RightFixedColumn = 0;
        this.rowgroupCols = [];
        let visibleChanges = false;
        $.each(this.CurrentRowGroup.RowGrouping.$values, function (i, rgobj) {
            this.RGIndex.push(rgobj.data);
            this.rowgroupCols.unshift(JSON.parse('{ "searchable": false, "orderable": false, "bVisible":true, "data":null, "defaultContent": ""}'));
        }.bind(this));

        if (this.rowgroupCols.length > 0 && this.CurrentRowGroup.$type.indexOf("MultipleLevelRowGroup") !== -1)
            this.rowgroupCols.unshift(JSON.parse('{ "searchable": false, "orderable": false, "bVisible":true, "name":"AllGroup", "data":null, "defaultContent": ""}'));

        $.each(this.EbObject.Columns.$values, function (i, colobj) {
            visibleChanges = false;
            $.each(this.CurrentRowGroup.RowGrouping.$values, function (i, rgobj) {
                if (colobj.name === rgobj.name) {
                    colobj.bVisible = false;
                    visibleChanges = true;
                }
            }.bind(this));

            $.each(this.EbObject.NotVisibleColumns.$values, function (i, nonvis) {
                if (colobj.name === nonvis.name) {
                    colobj.bVisible = false;
                    visibleChanges = true;
                }
            }.bind(this));

            if (!visibleChanges)
                colobj.bVisible = true;
        }.bind(this));

    }

    this.doRowgrouping = function () {
        var rows = this.Api.rows().nodes();
        var count = this.Api.columns()[0].length;
        $(rows).eq(0).before(`<tr class='group-All' id='group-All_${this.tableId}'><td><i class='fa fa-minus-square-o' style='cursor:pointer;'></i></td></tr>`);
        $(`#group-All_${this.tableId}`).append(`<td  colspan="${count}"><select id="rowgroupDD_${this.tableId}" style="display:inline-block;"> </select></td>`);
        $.each(this.EbObject.RowGroupCollection.$values, function (i, obj) {
			if (obj.RowGrouping.$values.length > 0) {
				$(`#rowgroupDD_${this.tableId}`).append(`<option value="${obj.Name.trim()}">${obj.DisplayName}</option>`);
            }
        }.bind(this));

        $(`#rowgroupDD_${this.tableId}`).off("change").on("change", this.rowGroupHandler.bind(this));
        $(`#rowgroupDD_${this.tableId} [value=${this.CurrentRowGroup.Name.trim()}]`).attr("selected", "selected");

        //if (this.EbObject.CurrentRowGroup.$type.indexOf("MultipleLevelRowGroup") !== -1)
        //    this.multiplelevelRowgrouping();
        //else
        //    this.singlelevelRowgrouping();        


        var rows = this.Api.rows().nodes();
        $.each(this.Levels, function (i, obj) {
            if (obj.insertionType !== "After")
                $(rows).eq(obj.rowIndex).before(obj.html);
            else
                $(rows).eq(obj.rowIndex).after(obj.html);
        });
        var ct = $("#" + this.tableId + " .group[group=1]").length;
        $(`#group-All_${this.tableId} td[colspan=${count}]`).prepend(` All Groups (${ct}) - `);

        $("#" + this.tableId + " tbody").off("click", "tr.group").on("click", "tr.group", this.collapseGroup);
        $("#" + this.tableId + " tbody").off("click", "tr.group-All").on("click", "tr.group-All", this.collapseAllGroup);

    };

    this.singlelevelRowgrouping = function () {
        var rows = this.Api.rows().nodes();
        var rowsdata = this.Api.rows().data();
        var index = this.RGIndex;
        var count = this.Api.columns()[0].length;
        var lastrow = -1;
        var last = null;
        var colobj = {};
        var groupString = "";
        var groupArray = [];
        this.rowgroupFilter = [];
        $.each(this.NumericIndex, function (k, num) {
            if (!(num in colobj)) {
                colobj[num] = new Array();
            }
        });

        $.each(this.unformatedData, function (i, _dataArray) {
            groupString = "";
            groupArray = []
            $.each(index, function (j, dt) {
                groupArray.push((_dataArray[dt].trim() === "") ? "(Blank)" : _dataArray[dt].trim());
                groupString += (_dataArray[dt].trim() === "") ? "(Blank)" : _dataArray[dt].trim();
                if (typeof index[j + 1] !== "undefined")
                    groupString += ",";
            }.bind(this));

            if (last !== groupString) {
                if (last === null || Object.keys(colobj).length === 0)
                    $(rows).eq(i).before(this.getGroupRowSingle(count, groupArray));
                else {
                    var rowstring = this.getSubRow(colobj, groupString, count);
                    $(rows).eq(i).before(rowstring);
                    $(rows).eq(i).before(this.getGroupRowSingle(count, groupArray));
                }
                last = groupString;
                $.each(colobj, function (key, val) {
                    colobj[key] = [];
                    colobj[key].push(_dataArray[key]);
                });
            }
            else {
                $.each(colobj, function (key, val) {
                    colobj[key].push(_dataArray[key]);
                });
            }
            lastrow = i;
        }.bind(this));

        if (Object.keys(colobj).length !== 0 && ($(rows).eq(lastrow).hasClass("odd") || $(rows).eq(lastrow).hasClass("even"))) {
            var rowstring = this.getSubRow(colobj, groupString, count);
            $(rows).eq(lastrow).after(rowstring);
        }

        var ct = $(".group[group=0]").length;
        $(`#group-All_${this.tableId} td[colspan=${count}]`).prepend(` All Groups (${ct}) - `);
        this.getRowsCount(count, "single");
    }

    this.getGroupRowSingle = function (count, groupArray) {
        var str = "<tr class='group' group='0'><td> &nbsp;</td>";
        var tempstr = "";
        $.each(this.RGIndex, function (j, dt) {
            var tempobj = $.grep(this.EbObject.CurrentRowGroup.RowGrouping.$values, function (obj) { return dt === obj.data });
            var type = tempobj[0].Type;
            //if (type === 5 || type === 6) {
            //    groupArray[j] = this.renderDateformat(groupArray[j], "/");
            //}
            if (tempobj[0].LinkRefId !== null)
                tempstr += tempobj[0].sTitle + `: <b data-rowgroup="true" data-colname='${tempobj[0].name}' data-coltype='${tempobj[0].Type}' data-data='${groupArray[j]}'><a href="#" oncontextmenu="return false" class="tablelink" data-colindex="${tempobj[0].data}" data-link="${tempobj[0].LinkRefId}" tabindex="0">${groupArray[j]}</a></b>`;
            else
                tempstr += tempobj[0].sTitle + `: <b data-rowgroup="true" data-colname='${tempobj[0].name}' data-coltype='${tempobj[0].Type}' data-data='${groupArray[j]}'>${groupArray[j]}</b>`;

            if (typeof this.RGIndex[j + 1] !== "undefined")
                tempstr += ",";
        }.bind(this));

        //$.each(this.EbObject.CurrentRowGroup.RowGrouping.$values, function (k, obj) {
        str += "<td><i class='fa fa-minus-square-o' style='cursor:pointer;'></i></td><td colspan=" + count + ">" + tempstr + "</td></tr>";
        //});
        return str;
    }.bind(this);

    this.getGroupRow = function (count, groupString, rowgroup, dt) {
        var str = "<tr class='group' group='" + rowgroup + "'>";
        for (var i = 0; i <= rowgroup; i++)
            str += "<td> &nbsp;</td>";

        var tempobj = $.grep(this.EbObject.CurrentRowGroup.RowGrouping.$values, function (obj) { return dt === obj.data });
        var type = tempobj[0].Type;
        //if (type === 5 || type === 6) {
        //    groupArray[j] = this.renderDateformat(groupArray[j], "/");
        //}
        if (tempobj[0].LinkRefId !== null)
            var tempstr = tempobj[0].sTitle + `: <b data-rowgroup="true" data-colname='${tempobj[0].name}' data-coltype='${tempobj[0].Type}' data-data='${groupString}'><a href="#" oncontextmenu="return false" class="tablelink" data-colindex="${tempobj[0].data}" data-link="${tempobj[0].LinkRefId}" tabindex="0">${groupString}</a></b>`;
        else
            var tempstr = tempobj[0].sTitle + `: <b data-rowgroup="true" data-colname='${tempobj[0].name}' data-coltype='${tempobj[0].Type}' data-data='${groupString}'>${groupString}</b>`;
        str += "<td><i class='fa fa-minus-square-o' style='cursor:pointer;'></i></td><td colspan=" + count + ">" + tempstr + "</td></tr>";
        return str;
    }.bind(this);

    this.getSubRow = function (colobj, groupString, count, rowgroup) {
        var i = 0;
        rowgroup = (typeof rowgroup === "undefined") ? 0 : rowgroup;
        var str = "<tr class='group-sum' group='" + rowgroup + "'>";
        $.each(this.rowgroupCols, function (k, obj) {
            str += "<td>&nbsp;</td>";
        });
        $.each(this.extraCol, function (k, obj) {
            if (obj.bVisible)
                str += "<td>&nbsp;</td>";
        });
        $.each(this.EbObject.Columns.$values, function (k, obj) {
            if (obj.bVisible) {
                if (Object.keys(colobj).contains(k.toString()) && obj.Aggregate) {
                    var val = colobj[k];
                    if (val.length === 1)
                        val.push("0");
                    str += "<td class='dt-body-right'>" + getSum(val).toFixed(obj.DecimalPlaces) + "</td>";// + "," + getAverage(val).toFixed(2)+
                }
                else
                    str += "<td>&nbsp;</td>";
            }
        });
        return str + "</tr>";
    };

    this.collapseAllGroup = function (e) {
        if (!$(e.target).is("select")) {
            var $elems = $(e.target).parents().closest(".group-All").nextAll("[role=row]");
            var $Groups = $(e.target).parents().closest(".group-All").nextAll(".group")
            var $target = $(e.target);
            if ($target.is("td")) {
                if ($target.children().is("I"))
                    $target = $target.children("I");
                else if ($target.siblings().children().is("I"))
                    $target = $target.siblings().children("I");
            }
            if ($target.hasClass("fa-plus-square-o")) {
                $elems.show();
                $(".group").show();
                $(".group-sum").show();
                this.collapseRelated($target, "show");
                $Groups.children().find("I").removeAttr("class").attr("class", "fa fa-minus-square-o");
            }
            else {
                $elems.hide();
                this.collapseRelated($target, "hide");
                $Groups.children().find("I").removeAttr("class").attr("class", "fa fa-plus-square-o");
            }
            this.Api.columns.adjust();
        }

        $(".containerrow").hide();
        $(".containerrow").prev().children().find("I").removeClass("fa-caret-up").addClass("fa-caret-down");
    }.bind(this);

    this.collapseGroup = function (e) {
        var $group = $(e.target).parents().closest(".group");
        var groupnum = $group.attr("group");
        var $elems = $group.nextUntil("[group=" + groupnum + "]");
        
        if ($elems.css("display") === "none") {
            $elems.show();
            this.collapseRelated($(e.target), "show");
            $elems.filter(".group").children().find("I").removeAttr("class").attr("class", "fa fa-minus-square-o");
        }
        else {
            $elems.hide();
            this.collapseRelated($(e.target), "hide");
            $elems.filter(".group").children().find("I").removeAttr("class").attr("class", "fa fa-plus-square-o");
        }
        this.checkHeaderCollapse($group, groupnum );

        $(".containerrow").hide();
        $(".containerrow").prev().children().find("I").removeClass("fa-caret-up").addClass("fa-caret-down");
        this.Api.columns.adjust();
    }.bind(this);

    this.collapseRelated = function ($elem, type) {
        if ($elem.is("td")) {
            if ($elem.children().is("I"))
                $elem = $elem.children("I");
            else if ($elem.siblings().children().is("I"))
                $elem = $elem.siblings().children("I");
        }

        if (type === "show") {
            $elem.removeClass("fa-plus-square-o");
            $elem.addClass("fa-minus-square-o");
        }
        else {
            $elem.removeClass("fa-minus-square-o");
            $elem.addClass("fa-plus-square-o");
        }

    }

    this.checkHeaderCollapse = function ($group, groupnum) {
        var headergroup = parseInt(groupnum) - 1;
        var nextSiblings = $group.nextUntil("[group=" + headergroup + "]").filter(".group[group=" + groupnum+"]").next();
        var prevSiblings = $group.prevUntil("[group=" + headergroup + "]").filter(".group[group=" + groupnum+"]").next();
        var $ElemtoChange = $group.prevAll(".group[group=" + headergroup + "]").first().children().find("I");
        var nextproperty = nextSiblings.map(function () { return $(this).css("display"); }).get();
        var prevproperty = prevSiblings.map(function () { return $(this).css("display"); }).get();
        var property = nextproperty.concat(prevproperty);
        if (property.contains("none")) {
            var flag = property.every(function (value) {
                return value === property[0];
            });
            if (flag)
                $ElemtoChange.removeAttr("class").attr("class", "fa fa-plus-square-o");
            else
                $ElemtoChange.removeAttr("class").attr("class", "fa fa-minus-square-o");
        }
        else
            $ElemtoChange.removeAttr("class").attr("class", "fa fa-minus-square-o");
    };

    this.multiplelevelRowgrouping = function () {
        var rows = this.Api.rows().nodes();
        var rowsdata = this.Api.rows().data();
        var index = this.RGIndex;
        var count = this.Api.columns()[0].length;
        var lastrow = -1;
        var last = null;
        var colobj = {};
        var groupString = "";
        var groupcount = 0;
        this.rowgroupFilter = [];
        $.each(this.NumericIndex, function (k, num) {
            if (!(num in colobj)) {
                colobj[num] = new Array();
            }
        });

        $.each(index, function (j, dt) {
            var last = null;
            var $parent = null;
            var $count = 0;
            //var tempobj = $.grep(this.EbObject.CurrentRowGroup.RowGrouping.$values, function (obj) { return dt === obj.data });//tempobj[0].sTitle + " : " +
            $.each(this.unformatedData, function (i, _dataArray) {

                var te = (_dataArray[dt] === null || _dataArray[dt].trim() === "") ? "(Blank)" : _dataArray[dt].trim();
                groupString = te;

                if (last !== groupString) {
                    if (last === null || Object.keys(colobj).length === 0) {
                        var groupstr = this.getGroupRow(count, groupString, j, dt);
                        $(rows).eq(i).before(groupstr);
                        $count++;
                        $parent = $(groupstr);
                    }
                    else {
                        $parent
                        var rowstring = this.getSubRow(colobj, groupString, count, j);
                        $(rows).eq(i - 1).after(rowstring);
                        $(rows).eq(i).before(this.getGroupRow(count, groupString, j, dt));
                    }
                    last = groupString;
                    $.each(colobj, function (key, val) {
                        colobj[key] = [];
                        colobj[key].push(_dataArray[key]);
                    });
                }
                else {
                    $.each(colobj, function (key, val) {
                        colobj[key].push(_dataArray[key]);
                    });
                    $count++;
                }
                lastrow = i;
            }.bind(this));

            if (Object.keys(colobj).length !== 0 && ($(rows).eq(lastrow).hasClass("odd") || $(rows).eq(lastrow).hasClass("even"))) {
                var rowstring = this.getSubRow(colobj, groupString, count, j);
                $(rows).eq(lastrow).after(rowstring);
            }

        }.bind(this));

        var ct = $(".group[group=0]").length;
        $(`#group-All_${this.tableId} td[colspan=${count}]`).prepend(`All Groups (${ct}) - `);
        this.getRowsCount(count, "multiple");
    }

    this.getRowsCount = function (count, type) {
        let rows = $("#" + this.tableId + " tbody tr.group[group=0]");
        var j = 0;
        this.recursiveRowCount(rows, j, count, type);
    }

    this.recursiveRowCount = function (rows, j, count, type) {
        $.each(rows, function (i, elem) {
            if (typeof (this.RGIndex[j + 1]) === "undefined")
                $(elem).children("td[colspan=" + count + "]").children("b").last().append(" (" + $(elem).nextUntil("[group=" + j + "]").length + ")");
            else {
                if (type === "single")
                    $(elem).children("td[colspan=" + count + "]").children("b").last().append(" (" + $(elem).nextUntil("[group=" + j + "]").length + ")");
                else
                    $(elem).children("td[colspan=" + count + "]").children("b").last().append(" (" + $(elem).nextUntil(".group[group=" + (j) + "]").filter(".group").length + ")");

            }
        }.bind(this));
        if (typeof (this.RGIndex[j + 1]) !== "undefined" && type !== "single") {
            var rowsarray = $("#" + this.tableId + " tbody tr.group[group=" + (j + 1) + "]");
            this.recursiveRowCount(rowsarray, (j + 1), count, type);
        }
    }

    this.doSerial = function () {
        var tempobj = $.grep(this.extraCol, function (obj) { return obj.name === "serial" });
        var index = this.Api.columns(tempobj[0].name + ':name').indexes()[0]
        this.Api.column(index).nodes().each(function (cell, i) { cell.innerHTML = i + 1; });
        this.Api.columns.adjust();
    };

    this.createFooter = function () {
        var ps = 0;
        var tid = this.tableId;
        var aggFlag = false;
        var lfoot = $('#' + this.tableId + '_wrapper .DTFC_LeftFootWrapper table');
        var rfoot = $('#' + this.tableId + '_wrapper .DTFC_RightFootWrapper table');
        var scrollfoot = $('#' + this.tableId + '_wrapper .dataTables_scrollFootInner table');

        if (scrollfoot.length !== 0)
            var eb_footer_controls_scrollfoot = this.GetAggregateControls(ps, 1);

        if (this.ebSettings.LeftFixedColumn + this.ebSettings.RightFixedColumn > 0) {
            for (var j = 0; j < eb_footer_controls_scrollfoot.length; j++) {
                if (j < this.ebSettings.LeftFixedColumn) {
                    scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).html(eb_footer_controls_scrollfoot[j]);
                    scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).children().remove();
                }
                else {
                    if (j < eb_footer_controls_scrollfoot.length - this.ebSettings.RightFixedColumn)
                        scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).html(eb_footer_controls_scrollfoot[j]);
                    else {
                        scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).html(eb_footer_controls_scrollfoot[j]);
                        scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).children().remove();
                    }
                }
            }
        }
        else {
            for (var j = 0; j < eb_footer_controls_scrollfoot.length; j++)
                scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).append(eb_footer_controls_scrollfoot[j]);
        }


        if (lfoot.length !== 0 || rfoot.length !== 0) {
            var eb_footer_controls_lfoot = this.GetAggregateControls(ps, 50);
            if (lfoot.length !== 0) {
                for (var j = 0; j < this.ebSettings.LeftFixedColumn; j++) {
                    $(lfoot).children().find("tr").eq(ps).children("th").eq(j).html(eb_footer_controls_lfoot[j]);
                    if (j === 0)
                        $(lfoot).children().find("tr").eq(ps).children("th").eq(j).html("");
                    $(lfoot).children().find("tr").eq(ps).children("th").eq(j).css("width", scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).css("width"));
                }
            }

            if (rfoot.length !== 0) {
                var start = eb_footer_controls_lfoot.length - this.ebSettings.RightFixedColumn;
                for (var j = 0; (j + start) < eb_footer_controls_lfoot.length; j++) {
                    $(rfoot).children().find("tr").eq(ps).children("th").eq(j).html(eb_footer_controls_lfoot[j + start]);
                    $(rfoot).children().find("tr").eq(ps).children("th").eq(j).css("width", scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j + start).css("width"));
                }
            }
        }
        this.summarize2();
    };

    this.GetAggregateControls = function (footer_id, zidx) {
        var ScrollY = this.ebSettings.scrollY;
        var ResArray = [];
        var tableId = this.tableId;
        //$.each(this.ebSettings.Columns.$values, this.GetAggregateControls_inner.bind(this, ResArray, footer_id, zidx));
        $.each(this.Api.settings().init().aoColumns, this.GetAggregateControls_inner.bind(this, ResArray, footer_id, zidx));
        return ResArray;
    };

    this.GetAggregateControls_inner = function (ResArray, footer_id, zidx, i, col) {
        var _ls;
        if (col.bVisible) {
            var temp = $.grep(this.eb_agginfo, function (agg) { return agg.colname === col.name });
            //(col.Type ==parseInt( gettypefromString("Int32")) || col.Type ==parseInt( gettypefromString("Decimal")) || col.Type ==parseInt( gettypefromString("Int64")) || col.Type ==parseInt( gettypefromString("Double"))) && col.name !== "serial"
            if (col.Aggregate) {
                var footer_select_id = this.tableId + "_" + col.name + "_ftr_sel" + footer_id;
                var fselect_class = this.tableId + "_fselect";
                var data_colum = "data-column=" + col.name;
                var data_table = "data-table=" + this.tableId;
                var footer_txt = this.tableId + "_" + col.name + "_ftr_txt" + footer_id;
                var data_decip = "data-decip=" + this.Api.settings().init().aoColumns[i].DecimalPlaces;

                _ls = "<div class='input-group input-group-sm'>" +
                    "<div class='input-group-btn dropup'>" +
                    "<button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='" + footer_select_id + "'>&sum;</button>" +
                    " <ul class='dropdown-menu'>" +
                    "  <li><a href ='#' class='eb_ftsel" + this.tableId + "' data-sum='Sum' " + data_table + " " + data_colum + " " + data_decip + ">&sum;</a></li>" +
                    "  <li><a href ='#' class='eb_ftsel" + this.tableId + "' " + data_table + " " + data_colum + " " + data_decip + " {4}>x&#772;</a></li>" +
                    " </ul>" +
                    " </div>" +
                    " <input type='text' class='form-control' id='" + footer_txt + "' disabled style='z-index:" + zidx.toString() + "'>" +
                    " </div>";
            }
            else
                _ls = "&nbsp;";

            ResArray.push(_ls);
        }
    };

    this.summarize2 = function () {
        var api = this.Api;
        var tableId = this.tableId;
        var scrollY = this.ebSettings.scrollY;
        var opScroll;
        var ftrtxtScroll;
        $.each(this.eb_agginfo, function (index, agginfo) {
            if (agginfo.colname) {
                opScroll = $('.dataTables_scrollFootInner #' + tableId + '_' + agginfo.colname + '_ftr_sel0').text().trim();
                ftrtxtScroll = '.dataTables_scrollFootInner #' + tableId + '_' + agginfo.colname + '_ftr_txt0';

                opLF = $('.DTFC_LeftFootWrapper #' + tableId + '_' + agginfo.colname + '_ftr_sel0').text().trim();
                ftrtxtLF = '.DTFC_LeftFootWrapper #' + tableId + '_' + agginfo.colname + '_ftr_txt0';

                opRF = $('.DTFC_RightFootWrapper #' + tableId + '_' + agginfo.colname + '_ftr_sel0').text().trim();
                ftrtxtRF = '.DTFC_RightFootWrapper #' + tableId + '_' + agginfo.colname + '_ftr_txt0';

                var col = api.column(agginfo.colname + ':name');
                var summary_val = 0;

                if (opScroll === '∑' || opLF === '∑' || opRF === '∑')
                    summary_val = col.data().sum();
                if (opScroll === 'x̄' || opLF === 'x̄' || opRF === 'x̄') {
                    summary_val = col.data().average();
                }
                if (opScroll !== "")
                    $(ftrtxtScroll).val(summary_val.toFixed(agginfo.deci_val));
                if (opLF !== "")
                    $(ftrtxtLF).val(summary_val.toFixed(agginfo.deci_val));
                if (opRF !== "")
                    $(ftrtxtRF).val(summary_val.toFixed(agginfo.deci_val));
            }
        });
    };

    this.createFilterRowHeader = function () {
        var tableid = this.tableId;
        var order_info_ref = this.order_info;

        var fc_lh_tbl = $('#' + tableid + '_wrapper .DTFC_LeftHeadWrapper table');
        var fc_rh_tbl = $('#' + tableid + '_wrapper .DTFC_RightHeadWrapper table');

        if (fc_lh_tbl.length !== 0 || fc_rh_tbl.length !== 0) {
            this.GetFiltersFromSettingsTbl(50);
            if (fc_lh_tbl.length !== 0) {
                fc_lh_tbl.find("thead").append($("<tr role='row' class='addedbyeb'/>"));
                for (var j = 0; j < this.ebSettings.LeftFixedColumn; j++)
                    $(fc_lh_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4fc[j]));
            }
            if (fc_rh_tbl.length !== 0) {
                fc_rh_tbl.find("thead").append($("<tr role='row' class='addedbyeb'/>"));
                for (var j = this.eb_filter_controls_4fc.length - this.ebSettings.RightFixedColumn; j < this.eb_filter_controls_4fc.length; j++)
                    $(fc_rh_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4fc[j]));
            }
        }

        var sc_h_tbl = $('#' + tableid + '_wrapper .dataTables_scrollHeadInner table');
        if (sc_h_tbl !== null) {
            this.GetFiltersFromSettingsTbl(1);
            sc_h_tbl.find("thead").append($("<tr role='row' class='addedbyeb'/>"));
            if (this.ebSettings.LeftFixedColumn + this.ebSettings.RightFixedColumn > 0) {
                for (var j = 0; j < this.eb_filter_controls_4sb.length; j++) {
                    if (j < this.ebSettings.LeftFixedColumn) {
                        $(sc_h_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4sb[j]));
                        $(sc_h_tbl.find("tr[class=addedbyeb] th:eq(" + j + ")")).children().not("span").remove();
                    }
                    else {
                        if (j < this.eb_filter_controls_4sb.length - this.ebSettings.RightFixedColumn)
                            $(sc_h_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4sb[j]));
                        else {
                            $(sc_h_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4sb[j]));
                            $(sc_h_tbl.find("tr[class=addedbyeb] th:eq(" + j + ")")).children().not("span").remove();
                        }
                    }
                }
            }
            else {
                for (var j = 0; j < this.eb_filter_controls_4sb.length; j++)
                    $(sc_h_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4sb[j]));
            }
        }

        // $('#' + tableid + '_wrapper table thead tr[class=addedbyeb]').hide();

        //$('thead:eq(0) tr:eq(1) [type=checkbox]').prop('indeterminate', true);
        $(".addedbyeb [type=checkbox]").prop('indeterminate', true);
        $(".DTFC_Blocker").remove();
    };

    this.createColspanHeader = function () {

    };

    this.addFilterEventListeners = function () {
        $('#' + this.tableId + '_wrapper thead tr:eq(0)').off('click').on('click', 'th', this.orderingEvent.bind(this));
        $(".eb_fsel" + this.tableId).off("click").on("click", this.setLiValue.bind(this));
        $(".eb_ftsel" + this.tableId).off("click").on("click", this.fselect_func.bind(this));
        $.each($(this.Api.columns().header()).parent().siblings().children().toArray(), this.setFilterboxValue.bind(this));
        $("." + this.tableId + "_htext").off("keyup").on("keyup", this.call_filter);
        $(".eb_fbool" + this.tableId).off("change").on("change", this.toggleInFilter.bind(this));
        $(".eb_selall" + this.tableId).off("click").on("click", this.clickAlSlct.bind(this));
        $("." + this.tableId + "_select").off("change").on("change", this.updateAlSlct.bind(this));
        $(".eb_canvas" + this.tableId).off("click").on("click", this.renderMainGraph);
        $(".tablelink").off("click").on("click", this.link2NewTable.bind(this));
        //$(`tablelinkInline_${this.tableId}`).off("click").on("click", this.link2NewTableInline.bind(this));
        //$(".tablelink_" + this.tableId).off("mousedown").on("mousedown", this.link2NewTableInNewTab.bind(this));
        $(".closeTab").off("click").on("click", this.deleteTab.bind(this));


        this.Api.on('key-focus', function (e, datatable, cell) {
            datatable.rows().deselect();
            datatable.row(cell.index().row).select();
        });

        //this.filterbtn.off("click").on("click", this.showOrHideFilter.bind(this));
        $("#clearfilterbtn_" + this.tableId).off("click").on("click", this.clearFilter.bind(this));
        $("#" + this.tableId + "_btntotalpage").off("click").on("click", this.showOrHideAggrControl.bind(this));
        this.copybtn.off("click").on("click", this.CopyToClipboard.bind(this));
        this.printbtn.off("click").on("click", this.ExportToPrint.bind(this));
        //this.printAllbtn.off("click").on("click", this.printAll.bind(this));
        this.printSelectedbtn.off("click").on("click", this.printSelected.bind(this));
        $("#btnExcel" + this.tableId).off("click").on("click", this.ExportToExcel.bind(this));
        this.csvbtn.off("click").on("click", this.ExportToCsv.bind(this));
        this.pdfbtn.off("click").on("click", this.ExportToPdf.bind(this));
        $("#btnToggleFD" + this.tableId).off("click").on("click", this.toggleFilterdialog.bind(this));
        $(".columnMarker_" + this.tableId).off("click").on("click", this.link2NewTable.bind(this));
        $('[data-toggle="tooltip"]').tooltip({
            placement: 'bottom'
        });

        $("[data-coltyp=date]").datepicker({
            dateFormat: datePattern.replace(new RegExp("M", 'g'), "m").replace(new RegExp("yy", 'g'), "y"),
            beforeShow: function (elem, obj) {
                $(".ui-datepicker").addClass("datecolumn-picker");
            }
        });
        $("[data-coltyp=date]").on("click", function () {
            $(this).datepicker("show");
        });
        $("#switch" + this.tableId).off("click").on("click", this.SwitchToChart.bind(this));
        this.Api.columns.adjust();
    };

	this.GenerateButtons = function () {
		$("#objname").text(this.EbObject.DisplayName);
        $(".toolicons").show();
        $("#obj_icons").empty();
        $("#obj_icons").append("<button id='btnGo" + this.tableId + "' class='btn commonControl'><i class='fa fa-play' aria-hidden='true'></i></button>");

        if (window.location.href.indexOf("hairocraft") !== -1 && this.login === "uc" && this.dvName.indexOf("leaddetails") !== -1)
            $("#obj_icons").prepend(`<button class='btn' data-toggle='tooltip' title='New Customer' onclick='window.open("/leadmanagement","_blank");' ><i class="fa fa-user-plus"></i></button>`);

        $("#btnGo" + this.tableId).click(this.getColumnsSuccess.bind(this));
        if ($("#" + this.tableId).children().length > 0) {
            if (this.login === "dc") {
                $("#obj_icons").append("<button type='button' id='" + this.tableId + "_btntotalpage' class='btn' style='display:none;'>&sum;</button>" +
                    "<div id='" + this.tableId + "_fileBtns' style='display: inline-block;'>" +
                    "<div class='btn-group'>" +
                    "<div class='btn-group'>" +
                    " <button id='btnPrint" + this.tableId + "' class='btn'  name='filebtn' data-toggle='tooltip' title='Print' ><i class='fa fa-print' aria-hidden='true'></i></button>" +
                    " <div class='btn btn-default dropdown-toggle' data-toggle='dropdown' name='filebtn' style='display: none;'>" +
                    "   <span class='caret'></span>  <!-- caret --></div>" +
                    "   <ul class='dropdown-menu' role='menu'>" +
                    "      <li><a href = '#' id='btnprintAll" + this.tableId + "'> Print All</a></li>" +
                    "     <li><a href = '#' id='btnprintSelected" + this.tableId + "'> Print Selected</a></li>" +
                    "</ul>" +
                    "</div>" +
                    "<button id='btnExcel" + this.tableId + "' class='btn'  name='filebtn' data-toggle='tooltip' title='Excel' ><i class='fa fa-file-excel-o' aria-hidden='true'></i></button>" +
                    "<button id='btnPdf" + this.tableId + "' class='btn'    name='filebtn'  data-toggle='tooltip' title='Pdf' ><i class='fa fa-file-pdf-o' aria-hidden='true'></i></button>" +
                    "<button id='btnCsv" + this.tableId + "' class='btn'    name='filebtn' data-toggle='tooltip' title='Csv' ><i class='fa fa-file-text-o' aria-hidden='true'></i></button>  " +
                    "<button id='btnCopy" + this.tableId + "' class='btn'  name='filebtn' data-toggle='tooltip' title='Copy to Clipboard' ><i class='fa fa-clipboard' aria-hidden='true'></i></button>" +
                    "</div>" +
                    "</div>" +
                    "</div>");
            }
            $("#" + this.tableId + "_fileBtns").find("[name=filebtn]").not("#btnExcel" + this.tableId).hide();

            if (this.login === "uc") {
                $("#obj_icons").append(`<div id='${this.tableId}_fileBtns' style='display: inline-block;'><div class='btn-group'></div></div>`);
                $.each(this.permission, function (i, obj) {
                    if (obj === "Excel")
                        $("#" + this.tableId + "_fileBtns .btn-group").append("<button id = 'btnExcel" + this.tableId + "' class='btn'  name = 'filebtn' data - toggle='tooltip' title = 'Excel' > <i class='fa fa-file-excel-o' aria-hidden='true'></i></button >");
                }.bind(this));
            }

            if (this.login == "uc") {
                dvcontainerObj.modifyNavigation();
            }
        }
        if (this.isSecondTime) {
            this.addFilterEventListeners();
        }

        //$("#obj_icons").append("<button id='switch" + this.tableId + "' class='btn commonControl'>S</button>");

    };

    this.setFilterboxValue = function (i, obj) {
        $(obj).children('div').children('.eb_finput').on("keydown", function (event) {
            if (event.keyCode === $.ui.keyCode.TAB &&
                $(this).autocomplete("instance").menu.active) {
                event.preventDefault();
            }
        });
        var name = $(obj).children('span').text();
        var tempobj = $.grep(this.EbObject.Columns.$values, function (col) { return col.name === name; });
        if (tempobj.length > 0)
            var idx = tempobj[0].data;
        var data = arrayColumn(this.unformatedData, idx);
        if ($(obj).children('div').children('.eb_finput').attr("data-coltyp") === "string") {
            this.setFilterboxValueInner(obj, data);
        }
        else {
            if ($(obj).children('div').length === 0) {
                var $lctrl = $("#" + this.tableId + "_wrapper .DTFC_LeftHeadWrapper table tr[class=addedbyeb] th:eq(" + i + ")").find(".eb_finput");
                var $rctrl = $("#" + this.tableId + "_wrapper .DTFC_RightHeadWrapper table tr[class=addedbyeb] th:eq(" + i + ")").find(".eb_finput");
                if ($lctrl.length > 0) {
                    this.setfiletrvalueFixedcolumns($lctrl, data);
                }
                if ($rctrl.length > 0) {
                    this.setfiletrvalueFixedcolumns($rctrl, data);
                }
            }

        }
    };

    this.setFilterboxValueInner = function (obj, data) {
        $(obj).children('div').children('.eb_finput').autocomplete({
            source: function (request, response) {
                response($.ui.autocomplete.filter(
                    $.unique(data), extractLast(request.term)));
            }.bind(this),
            focus: function () {
                return false;
            },
            select: function (event, ui) {
                var terms = splitval(this.value);
                terms.pop();
                terms.push(ui.item.value);
                terms.push("");
                this.value = terms.join(" | ");
                return false;
            },
            search: function (event, ui) {
            }
        });
    }

    this.setfiletrvalueFixedcolumns = function ($ctrl, data) {
        if ($ctrl.attr("data-coltyp") === "string") {
            $ctrl.autocomplete({
                source: function (request, response) {
                    response($.ui.autocomplete.filter(
                        $.unique(data), extractLast(request.term)));
                }.bind(this),
                focus: function () {
                    return false;
                },
                select: function (event, ui) {
                    var terms = splitval(this.value);
                    terms.pop();
                    terms.push(ui.item.value);
                    terms.push("");
                    this.value = terms.join(" | ");
                    return false;
                },
                search: function (event, ui) {
                }
            });
        }
    };

    this.orderingEvent = function (e) {
        //var col = $(e.target).children('span').text();
        var col = $(e.target).text();
        var tempobj = $.grep(this.Api.settings().init().aoColumns, function (obj) { return obj.sTitle === col });
        var cls = $(e.target).attr('class');
        if (col !== '' && col !== "#") {
            this.order_info.col = tempobj[0].name;
            this.order_info.dir = (cls.indexOf('sorting_asc') > -1) ? 2 : 1;
            //this.orderColl = $.grep(this.orderColl, function (obj) { return obj.Column !== this.order_info.col }.bind(this));
            //if (this.EbObject.rowGrouping.$values.length === 0)
            //    this.orderColl = [];
            this.orderColl = [];
            this.orderColl.push(new order_obj(this.order_info.col, this.order_info.dir));
        }
    };

    this.GetFiltersFromSettingsTbl = function (zidx) {
        this.zindex = zidx;
        if (this.zindex === 50)
            this.eb_filter_controls_4fc = [];
        else if (this.zindex === 1)
            this.eb_filter_controls_4sb = [];

        //$.each(this.ebSettings.Columns.$values, this.GetFiltersFromSettingsTbl_inner.bind(this));
        $.each(this.Api.settings().init().aoColumns, this.GetFiltersFromSettingsTbl_inner.bind(this));
    };

    this.GetFiltersFromSettingsTbl_inner = function (i, col) {
        var _ls = "";
        if (col.bVisible === true) {
            var span = "<span hidden>" + col.name + "</span>";
            //var span = "";

            var htext_class = this.tableId + "_htext";

            var data_colum = "data-colum='" + col.name + "'";
            var data_table = "data-table='" + this.tableId + "'";

            var header_select = this.tableId + "_" + col.name + "_hdr_sel";
            var header_text1 = this.tableId + "_" + col.name + "_hdr_txt1";
            var header_text2 = this.tableId + "_" + col.name + "_hdr_txt2";

            _ls += "<th>";
            if (col.name === "serial") {
                _ls += (span + "<a class='btn btn-sm center-block'  id='clearfilterbtn_" + this.tableId + "' data-table='@tableId' data-toggle='tooltip' title='Clear Filter' style='height:100%'><i class='fa fa-filter' aria-hidden='true' style='color:black'></i></a>");
            }
            else {
                if (col.Type == parseInt(gettypefromString("Int32")) || col.Type == parseInt(gettypefromString("Decimal")) || col.Type == parseInt(gettypefromString("Int64")) || col.Type == parseInt(gettypefromString("Double")) || col.Type == parseInt(gettypefromString("Numeric"))) {
                    if (parseInt(EbEnums.ControlType.Text) === col.filterControl)
                        _ls += (span + this.getFilterForString(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                    else if (parseInt(EbEnums.ControlType.Date) === col.filterControl)
                        _ls += (span + this.getFilterForDateTime(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                    else
                        _ls += (span + this.getFilterForNumeric(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                }
                else if (col.Type == parseInt(gettypefromString("String"))) {
                    //if (this.dtsettings.filterParams === null || this.dtsettings.filterParams === undefined)
                    if (parseInt(EbEnums.ControlType.Numeric) === col.filterControl)
                        _ls += (span + this.getFilterForNumeric(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                    else if (parseInt(EbEnums.ControlType.Date) === col.filterControl)
                        _ls += (span + this.getFilterForDateTime(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                    else
                        _ls += (span + this.getFilterForString(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                    //else
                    //   _ls += (span + this.getFilterForString(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, this.dtsettings.filterParams));
                }
                else if (col.Type == parseInt(gettypefromString("DateTime")) || col.Type == parseInt(gettypefromString("Date"))) {
                    if (parseInt(EbEnums.ControlType.Numeric) === col.filterControl)
                        _ls += (span + this.getFilterForNumeric(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                    else if (parseInt(EbEnums.ControlType.Text) === col.filterControl)
                        _ls += (span + this.getFilterForString(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                    else
                        _ls += (span + this.getFilterForDateTime(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                }
                else if (col.Type == parseInt(gettypefromString("Boolean")) && col.name !== "checkbox")
                    _ls += (span + this.getFilterForBoolean(col.name, this.tableId, this.zindex));
                else
                    _ls += (span);
            }

            _ls += ("</th>");

            ((this.zindex === 50) ? this.eb_filter_controls_4fc : this.eb_filter_controls_4sb).push(_ls);
        }
    };

    this.getFilterForNumeric = function (header_text1, header_select, data_table, htext_class, data_colum, header_text2, zidx, DefOp) {
        var coltype = "data-coltyp='number'";
        var drptext = "";
        var op = String.empty;
        switch (DefOp.toString()) {
            case EbEnums.NumericOperators.Equals: op = '='; break;
            case EbEnums.NumericOperators.LessThan: op = '<'; break;
            case EbEnums.NumericOperators.GreaterThan: op = '>'; break;
            case EbEnums.NumericOperators.LessThanOrEqual: op = '<='; break;
            case EbEnums.NumericOperators.GreaterThanOrEqual: op = '>='; break;
            case EbEnums.NumericOperators.Between: op = 'B'; break;
            default: op = '=';
        }
        drptext = "<div class='input-group input-group-sm'>" +
            "<div class='input-group-btn'>" +
            " <button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='" + header_select + "'> " + op + " </button>" +
            " <ul class='dropdown-menu'>" +//  style='z-index:" + zidx.toString() + "'
            "   <li ><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">=</a></li>" +
            " <li><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "><</a></li>" +
            " <li><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">></a></li>" +
            " <li><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "><=</a></li>" +
            " <li><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">>=</a></li>" +
            "<li><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">B</a></li>" +
            " </ul>" +
            " </div>" +
            " <input type='number' data-toggle='tooltip' class='form-control eb_finput " + htext_class + "' id='" + header_text1 + "' " + data_table + data_colum + coltype + ">" +
            //" <span class='input-group-btn'></span>" +
            //" <input type='number' class='form-control eb_finput " + htext_class + "' id='" + header_text2 + "' style='visibility: hidden' " + data_table + data_colum + coltype + ">" +
            " </div> ";
        return drptext;
    };

    this.getFilterForDateTime = function (header_text1, header_select, data_table, htext_class, data_colum, header_text2, zidx, DefOp) {
        var op = String.empty;
        switch (DefOp.toString()) {
            case EbEnums.NumericOperators.Equals: op = '='; break;
            case EbEnums.NumericOperators.LessThan: op = '<'; break;
            case EbEnums.NumericOperators.GreaterThan: op = '>'; break;
            case EbEnums.NumericOperators.LessThanOrEqual: op = '<='; break;
            case EbEnums.NumericOperators.GreaterThanOrEqual: op = '>='; break;
            case EbEnums.NumericOperators.Between: op = 'B'; break;
            default: op = '=';
        }
        var coltype = "data-coltyp='date'";
        var filter = "<div class='input-group input-group-sm'>" +
            "<div class='input-group-btn'>" +
            " <button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='" + header_select + "'> " + op + " </button>" +
            "<ul class='dropdown-menu'>" +//  style='z-index:" + zidx.toString() + "'
            " <li ><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">=</a></li>" +
            " <li><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "><</a></li>" +
            " <li><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">></a></li>" +
            " <li><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "><=</a></li>" +
            " <li><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">>=</a></li>" +
            " <li ><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">B</a></li>" +
            " </ul>" +
            " </div>" +
            " <input type='text' placeholder='" + datePattern + "' data-toggle='tooltip' class='no-spin form-control eb_finput " + htext_class + "' id='" + header_text1 + "' " + data_table + data_colum + coltype + ">" +
            //" <span class='input-group-btn'></span>" +
            //" <input type='date' class='form-control eb_finput " + htext_class + "' id='" + header_text2 + "' style='visibility: hidden' " + data_table + data_colum + coltype + ">" +
            " </div> ";

        return filter;

    };

    this.getFilterForString = function (header_text1, header_select, data_table, htext_class, data_colum, header_text2, zidx, DefOp) {
        var op = String.empty;
        switch (DefOp.toString()) {
            case EbEnums.StringOperators.Equals: op = '='; break;
            case EbEnums.StringOperators.Startwith: op = 'x*'; break;
            case EbEnums.StringOperators.EndsWith: op = '*x'; break;
            case EbEnums.StringOperators.Between: op = '*x*'; break;
            default: op = '=';
        }
        var coltype = " data-coltyp='string'";
        var drptext = "";
        drptext = "<div class='input-group input-group-sm'>" +
            "<div class='input-group-btn'>" +// style='z-index:" + zidx.toString() + "'
            " <button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='" + header_select + "'>" + op + "</button>" +
            " <ul class='dropdown-menu'>" +

            "   <li ><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">x*</a></li>" +
            "  <li><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">*x</a></li>" +
            "  <li><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">*x*</a></li>" +
            " <li><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">=</a></li>" +
            " </ul>" +
            " </div>" +
            " <input type='text' data-toggle='tooltip'  class='form-control eb_finput " + htext_class + "' id='" + header_text1 + "' " + data_table + data_colum + coltype + ">" +
            " </div> ";
        return drptext;
    };

    this.getFilterForBoolean = function (colum, tableId, zidx) {
        var filter = "";
        var id = tableId + "_" + colum + "_hdr_txt1";
        var cls = tableId + "_hchk";
        filter = "<input type='checkbox' id='" + id + "' data-toggle='tooltip' title='' data-colum='" + colum + "' data-coltyp='boolean' data-table='" + tableId + "' class='" + cls + " " + tableId + "_htext eb_fbool" + this.tableId + "' style='margin-left: 50%;'></center>";
        return filter;
    };

    this.clearFilter = function () {
        var flag = false;
        var tableid = this.tableId;
        $('.' + this.tableId + '_htext').each(function (i) {

            if ($(this).hasClass(tableid + '_hchk')) {
                if (!($(this).is(':indeterminate'))) {
                    flag = true;
                    $(this).prop("indeterminate", true);
                }
            }
            else {
                if ($(this).val() !== '') {
                    flag = true;
                    $(this).val('');
                }
            }
        });
        if (flag || this.filterFlag) {
            this.columnSearch = [];
            this.Api.ajax.reload();
            this.filterFlag = false;
            $('#clearfilterbtn_' + this.tableId).children("i").removeClass("fa-times").addClass("fa-filter");
            $(".tooltip").remove();
        }
    };

    this.setLiValue = function (e) {
        var selText = $(e.target).text();
        var table = $(e.target).attr('data-table');
        var flag = false;
        var colum = $(e.target).attr('data-colum');
        var ctype = $(e.target).parents('.input-group').find("input").attr('data-coltyp');
        var dateclas = (ctype === "date") ? "no-spin" : "";
        $(e.target).parents('.input-group-btn').find('.dropdown-toggle').html(selText);
        if (selText.trim() === 'B') {
            if ($(e.target).parents('.input-group').find("input").length == 1) {
                if (ctype === "date") {
                    $(e.target).parents('.input-group').append("<input type='text' placeholder='" + datePattern + "' class='" + dateclas + " between-inp form-control eb_finput " + this.tableId + "_htext' id='" + this.tableId + "_" + colum + "_hdr_txt2' data-coltyp='" + ctype + "'>");
                    $("#" + this.tableId + "_" + colum + "_hdr_txt2").datepicker({
                        dateFormat: datePattern.replace(new RegExp("M", 'g'), "m").replace(new RegExp("yy", 'g'), "y"),
                        beforeShow: function (elem, obj) {
                            $(".ui-datepicker").addClass("datecolumn-picker");
                        }
                    });
                    $("#" + this.tableId + "_" + colum + "_hdr_txt2").on("click", function () {
                        $(this).datepicker("show");
                    });
                }
                else {
                    $(e.target).parents('.input-group').append("<input type='number' class='" + dateclas + " between-inp form-control eb_finput " + this.tableId + "_htext' id='" + this.tableId + "_" + colum + "_hdr_txt2' data-coltyp='" + ctype + "'>");
                }
                $("#" + this.tableId + "_" + colum + "_hdr_txt1").addClass("between-inp");
                $("#" + this.tableId + "_" + colum + "_hdr_txt2").on("keyup", this.call_filter);

            }
        }
        else if (selText.trim() !== 'B') {
            if ($(e.target).parents('.input-group').find("input").length == 2) {
                $(e.target).parents('.input-group').find("input").eq(1).remove();
                $("#" + this.tableId + "_" + colum + "_hdr_txt1").removeClass("between-inp");
            }
        }
        this.Api.columns.adjust();
        e.preventDefault();
    };

    this.call_filter = function (e) {
        if (e.keyCode === 13) {
            var flag = true;
            if ($(e.target).siblings(".eb_finput").length === 1) {
                if ($(e.target).val() === "") {
                    $(e.target).css("border-color", "red");
                    flag = false;
                }
                else
                    $(e.target).css("border-color", "#ccc");
                if ($(e.target).siblings(".eb_finput").val() === "") {
                    $(e.target).siblings(".eb_finput").css("border-color", "red");
                    flag = false;
                }
                else
                    $(e.target).siblings(".eb_finput").css("border-color", "#ccc");
            }
            else {
                if ($(e.target).val().trim() == "") {
                    flag = false;
                    $(e.target).css("border-color", "red");
                }
                else
                    $(e.target).css("border-color", "#ccc");
            }

            if (flag) {
                this.columnSearch = this.repopulate_filter_arr();
                $('#' + this.tableId).DataTable().ajax.reload();
                if ($('#clearfilterbtn_' + this.tableId).children("i").hasClass("fa-filter"))
                    $('#clearfilterbtn_' + this.tableId).children("i").removeClass("fa-filter").addClass("fa-times");
            }
        }
        else {
            $("[data-coltyp=date]").datepicker("hide");
            this.columnSearch = this.repopulate_filter_arr();
            if (typeof (e.key) === "undefined") {
                $('#' + this.tableId).DataTable().ajax.reload();
                if ($('#clearfilterbtn_' + this.tableId).children("i").hasClass("fa-filter"))
                    $('#clearfilterbtn_' + this.tableId).children("i").removeClass("fa-filter").addClass("fa-times");
            }
        }

    }.bind(this);

    this.dblclickDateColumn = function () {
        this.type = "text";
        this.select();
    };

    this.pasteDateColumn = function (e) {
        var data = e.originalEvent.clipboardData.getData('Text');
        var dt = data.split("/");
        this.value = [dt[2].trim(), dt[1].trim(), dt[0].trim()].join("-");
        e.preventDefault();
    };

    this.focusoutDateColumn = function () {
        var data = $(event.target)[0].value;
        var dt = data.split("/");
        if (dt.length === 1)
            dt = data.split("-");
        if (dt[0].length <= 2)
            data = [dt[2].trim(), dt[1].trim(), dt[0].trim()].join("-");
        else
            data = [dt[0].trim(), dt[1].trim(), dt[2].trim()].join("-");
        $(event.target)[0].value = formatDate(data);
        $(event.target)[0].type = "date";
        if (this.Api)
            this.Api.columns.adjust();
    };

    this.changeDateOrder = function (data) {
        var dt = data.split("/");
        var dtp = datePattern.split("/");
        if (dt.length === 1)
            dt = data.split("-");
        if (dtp.length === 1)
            dtp = datePattern.split("-");

        if (dt[0].length <= 2)
            return [dt[2].trim(), dt[1].trim(), dt[0].trim()].join("-");
        else
            return [dt[0].trim(), dt[1].trim(), dt[2].trim()].join("-");
    };

    this.retainDateOrder = function (data) {
        var dt = data.split("-");
        return [dt[2].trim(), dt[1].trim(), dt[0].trim()].join("/");
    };

    this.toggleInFilter = function (e) {
        var table = $(e.target).attr('data-table');
        this.call_filter({ keyCode: 10 });
        //this.Api.ajax.reload();
    };

    this.toggleFilterdialog = function () {
        $("#" + this.ContextId).toggle();
    };

    this.togglePPGrid = function () {
        $(".ppcont").toggle();
    };

    this.fselect_func = function (e) {
        var selValue = $(e.target).text().trim();
        $(e.target).parents('.input-group-btn').find('.dropdown-toggle').html(selValue);
        var table = $(e.target).attr('data-table');
        var colum = $(e.target).attr('data-column');
        var decip = $(e.target).attr('data-decip');
        var col = this.Api.column(colum + ':name');
        var ftrtxt;

        ftrtxt = '.dataTables_scrollFootInner #' + this.tableId + '_' + colum + '_ftr_txt0';
        if ($(ftrtxt).length === 0)
            ftrtxt = '.DTFC_LeftFootWrapper #' + this.tableId + '_' + colum + '_ftr_txt0';
        if ($(ftrtxt).length === 0)
            ftrtxt = '.DTFC_RightFootWrapper #' + this.tableId + '_' + colum + '_ftr_txt0';

        if (selValue === '∑')
            pageTotal = col.data().sum();
        else if (selValue === 'x̄')
            pageTotal = col.data().average();

        $(ftrtxt).val(pageTotal.toFixed(decip));
        e.preventDefault();
        //e.stopPropagation();
    };

    this.clickAlSlct = function (e) {
        //var tableid = $(e.target).attr('data-table');
        if (e.target.checked)
            $('#' + this.tableId + '_wrapper tbody [type=checkbox]:not(:checked)').trigger('click');
        else
            $('#' + this.tableId + '_wrapper tbody [type=checkbox]:checked').trigger('click');

        e.stopPropagation();
    };

    this.renderCheckBoxCol = function (data2, type, row, meta) {
        if (this.FlagPresentId) {
            var idpos = $.grep(this.ebSettings.Columns.$values, function (e) { return e.name === "id"; })[0].data;
            this.rowId = meta.row; //do not remove - for updateAlSlct
            return "<input type='checkbox' class='" + this.tableId + "_select' name='" + this.tableId + "_id' value='" + row[idpos].toString() + "'/>";
        }
        else
            return "<input type='checkbox' class='" + this.tableId + "_select'/>";
    };

    this.updateAlSlct = function (e) {
        var idx = this.Api.row($(e.target).parent().parent()).index();
        if (e.target.checked) {
            this.Api.rows(idx).select();
            $('#' + this.tableId + '_wrapper table:eq(0) thead tr:eq(0) [type=checkbox]').prop("indeterminate", true);
        }
        else {
            this.Api.rows(idx).deselect();
            $('#' + this.tableId + '_wrapper table:eq(0) thead tr:eq(0) [type=checkbox]').prop("indeterminate", true);
        }
        var CheckedCount = $('.' + this.tableId + '_select:checked').length;
        var UncheckedCount = this.Api.rows().count() - CheckedCount;
        if (CheckedCount === this.Api.rows().count()) {
            $('#' + this.tableId + '_wrapper table:eq(0) thead tr:eq(0) [type=checkbox]').prop("indeterminate", false);
            $('#' + this.tableId + '_wrapper table:eq(0) thead tr:eq(0) [type=checkbox]').prop('checked', true);
        }
        else if (UncheckedCount === this.Api.rows().count()) {
            $('#' + this.tableId + '_wrapper table:eq(0) thead tr:eq(0) [type=checkbox]').prop("indeterminate", false);
            $('#' + this.tableId + '_wrapper table:eq(0) thead tr:eq(0) [type=checkbox]').prop('checked', false);
        }
    };

    this.showOrHideAggrControl = function (e) {
        $('#' + this.tableId + '_wrapper .dataTables_scrollFootInner tfoot tr:eq(0)').toggle();
        $("#" + this.tableId + "_wrapper .DTFC_LeftFootWrapper tfoot tr:eq(0)").toggle();
        $("#" + this.tableId + "_wrapper .DTFC_RightFootWrapper tfoot tr:eq(0)").toggle();
        this.Api.columns.adjust();
    };

    this.link2NewTable = function (e) {
        this.rowgroupFilter = [];
        var rows = this.Api.rows(idx).nodes();
        var cData;
        this.isContextual = true;
        if ($(e.target).closest("a").attr("data-latlong") !== undefined)
            cData = $(e.target).closest("a").attr("data-latlong");
        else if ($(e.target).closest("a").attr("data-inline") !== undefined) {
            cData = $(e.target).closest("a").attr("data-data");
            this.inline = true;
            var colindex = parseInt($(e.target).closest("a").attr("data-colindex"));
        }
        else
            cData = $(e.target).text();
        this.linkDV = $(e.target).closest("a").attr("data-link");
        var idx = this.Api.row($(e.target).parent().parent()).index();
        if (typeof (idx) !== "undefined")
            //this.rowData = this.Api.row(idx).data();
            this.rowData = this.unformatedData[idx];
        else {//incomplete...
            this.rowData = [];
        }

        this.filterValues = this.getFilterValues().concat(this.getfilterFromRowdata());

        if ($(e.target).parent("b").attr("data-rowgroup") !== undefined) {

            this.getRowGroupFilter($(e.target).parent("b"));
            if (this.CurrentRowGroup.$type.indexOf("SingleLevelRowGroup") !== -1) {
                $.each($(e.target).parent("b").siblings("b"), function (i, elem) {
                    this.getRowGroupFilter($(elem));
                }.bind(this));
            }
            else {
                var $elem = $(e.target).parents().closest(".group");
                let count = $elem.attr("group");
                for (var i = count - 1; i >= 0; i--) {
                    $elem = $(e.target).parents().closest(".group").prevAll().closest(".group[group=" + i + "]").last();
                    this.getRowGroupFilter($elem.children().find("b"));
                }
            }

            this.filterValues = this.filterValues.concat(this.rowgroupFilter);
        }

        if (this.inline) {
            this.inline = false;
            if ($(rows).eq(idx).next().attr("id") !== "containerrow" + colindex) {
                this.drawInlinedv(rows, e, idx, colindex);
            }
            else {
                this.OpenInlineDv(rows, e, idx, colindex);
            }
        }
        else {
            if (this.login === "uc")
                dvcontainerObj.drawdvFromTable(btoa(JSON.stringify(this.rowData)), btoa(JSON.stringify(this.filterValues)), cData.toString());//, JSON.stringify(this.filterValues)
            else
                this.OpeninNewTab(idx, cData);
        }
    };

    this.drawInlinedv = function (rows, e, idx, colindex) {
        $("#eb_common_loader").EbLoader("show");
        $(e.target).parents().closest("td").siblings().children(".tablelink").children("i").removeClass("fa-caret-up").addClass("fa-caret-down");
        this.call2newDv(rows, idx, colindex);
        $(e.target).closest("I").removeClass("fa-caret-down").addClass("fa-caret-up");
    };
    this.OpenInlineDv = function (rows, e, idx, colindex) {
        if ($(e.target).closest("I").hasClass("fa-caret-up")) {
            $(e.target).closest("I").removeClass("fa-caret-up").addClass("fa-caret-down");
            $(rows).eq(idx).next().hide();
        }
        else {
            $(e.target).closest("I").removeClass("fa-caret-down").addClass("fa-caret-up");
            $(rows).eq(idx).next().show();
        }
        this.Api.columns.adjust();
    };

    this.getRowGroupFilter = function ($elem) {
        let name = $elem.attr("data-colname");
        let type = parseInt($elem.attr("data-coltype"));
        let val = $elem.attr("data-data");
        if (type === 5 || type === 6)
            val = val.split("/").join('-');
        this.rowgroupFilter.push(new fltr_obj(type, name, val));
    };

    this.call2newDv = function (rows, idx, colindex) {
        $.ajax({
            type: "POST",
            url: "../DV/getdv",
            data: { refid: this.linkDV },
            success: this.GetData4InlineDv.bind(this, rows, idx, colindex)
        });
    };

    this.GetData4InlineDv = function (rows, idx, colindex, result) {
        var Dvobj = JSON.parse(result).DsObj;
        var param = this.Params4InlineTable(Dvobj);
        $.ajax({
            type: "POST",
            url: "../DV/getData4Inline",
            data: param,
            success: this.LoadInlineDv.bind(this, rows, idx, Dvobj, colindex)
        });
    };

    this.LoadInlineDv = function (rows, idx, Dvobj, colindex, result) {
        let colspan = Dvobj.Columns.$values.length;
        let str = "";
        $.each(this.rowgroupCols, function (k, obj) {
            str += "<td>&nbsp;</td>";
        });
        $.each(this.extraCol, function (k, obj) {
            if (obj.bVisible)
                str += "<td>&nbsp;</td>";
        });

        $(rows).eq(idx).next(".containerrow").remove();
        if (Dvobj.$type.indexOf("EbTableVisualization") !== -1) {
            $(rows).eq(idx).after("<tr class='containerrow' id='containerrow" + colindex + "'>" + str + "<td colspan='" + colspan + "'><div class='inlinetable'><div class='close' type='button' title='Close'>x</div><div class='Obj_title' id='objName" + idx + "'>" + Dvobj.DisplayName + "</div><table id='tbl" + idx + "' class='table display table-bordered compact'></table></td></tr></div>");
            var o = new Object();
            o.tableId = "tbl" + idx;
            o.showFilterRow = false;
            o.showSerialColumn = false;
            o.showCheckboxColumn = false;
            o.scrollHeight = "200px";
            o.dvObject = Dvobj;
            o.data = result.formattedData;
            this.datatable = new EbBasicDataTable(o);
        }
        else {
            $(rows).eq(idx).after("<tr class='containerrow' id='containerrow" + colindex + "'>" + str + "<td colspan='" + colspan +"'><div class='inlinetable'><div class='close' type='button' title='Close'>x</div><div class='Obj_title' id='objName" + idx + "'>" + Dvobj.DisplayName + "</div><div id='canvasDivchart" + idx + "' ></div></td></tr></div>");
            var o = new Object();
            o.tableId = "chart" + idx;
            o.dvObject = Dvobj;
            o.data = result.data;
            this.chartApi = new EbBasicChart(o);
            $("#canvasDivchart" + idx).css("width", $(window).width() - 100);
        }
        $(".containerrow .close").off("click").on("click", function (e) {
            $(e.target).parents().closest(".containerrow").prev().children().find("I").removeClass("fa-caret-up").addClass("fa-caret-down");
            $(e.target).parents().closest(".containerrow").remove();
            this.Api.columns.adjust();
        }.bind(this));

        $("#eb_common_loader").EbLoader("hide");
        this.Api.columns.adjust();
    };

    this.Params4InlineTable = function (Dvobj) {
        var dq = new Object();
        dq.RefId = Dvobj.DataSourceRefId;
        dq.TFilters = [];
        dq.Params = this.filterValues;
        dq.Start = 0;
        dq.Length = 500;
        dq.DataVizObjString = JSON.stringify(Dvobj);
        return dq;
    };

    this.deleteTab = function (e) {
        var tabContentId = $(e.target).parent().attr("href");
        $(e.target).parent().parent().remove(); //remove li of tab
        $('#table_tabs a:last').tab('show'); // Select first tab
        $(tabContentId).remove();
    };

    this.CopyToClipboard = function (e) {
        $('#' + this.tableId + '_wrapper').find('.buttons-copy').click();
    };

    this.ExportToPrint = function (e) {
        $('#' + this.tableId + '_wrapper').find('.buttons-print')[0].click();
    };

    this.ExportToExcel = function (e) {
        $('#' + this.tableId + '_wrapper').find('.buttons-excel').click();
    };

    this.ExportToCsv = function (e) {
        $('#' + this.tableId + '_wrapper').find('.buttons-csv').click();
    };

    this.ExportToPdf = function (e) {
        $('#' + this.tableId + '_wrapper').find('.buttons-pdf').click();
    };

    this.printSelected = function (e) {
        $('#' + this.tableId + '_wrapper').find('.buttons-print')[1].click();
    };

    this.printAll = function (e) {
        $('#' + this.tableId + '_wrapper').find('.buttons-print')[0].click();
    };

    this.SwitchToChart = function () {
        $('#' + this.tableId).parents().find(".sub-windows").hide();
        this.stickBtn.hide();
        let chartobj = new EbObjects["EbChartVisualization"]("Container_" + Date.now());
        chartobj.Columns = JSON.parse(JSON.stringify(this.EbObject.Columns));
        chartobj.DSColumns = JSON.parse(JSON.stringify(this.EbObject.DSColumns));
        chartobj.DataSourceRefId = this.EbObject.DataSourceRefId;
        chartobj.Pippedfrom = this.EbObject.Name;
        let chartapi = eb_chart(chartobj.DataSourceRefId, null, null, chartobj, null, this.tabNum, this.ssurl, this.login, counter, this.MainData, btoa(JSON.stringify(this.rowData)), btoa(JSON.stringify(this.filterValues)), this.cellData, this.propGrid);
    };

    this.collapseFilter = function () {
        this.filterBox.toggle();
        if (this.filterBox.css("display") == "none") {
            $("#btnCollapse" + this.tableId).children().remove();
            $("#btnCollapse" + this.tableId).append("<i class='fa fa-chevron-down' aria-hidden='true'></i>");
        }
        else {
            $("#btnCollapse" + this.tableId).children().remove();
            $("#btnCollapse" + this.tableId).append("<i class='fa fa-chevron-up' aria-hidden='true'></i>")
        }
    };


    this.updateRenderFunc = function () {
        $.each(this.ebSettings.Columns.$values, this.updateRenderFunc_Inner.bind(this));
    };

    this.updateRenderFunc_Inner = function (i, col) {
        if (col.Type == parseInt(gettypefromString("Int32")) || col.Type == parseInt(gettypefromString("Decimal")) || col.Type == parseInt(gettypefromString("Int64")) || col.Type == parseInt(gettypefromString("Numeric"))) {
            if (this.ebSettings.Columns.$values[i].RenderAs.toString() === EbEnums.NumericRenderType.ProgressBar) {
                this.ebSettings.Columns.$values[i].render = this.renderProgressCol.bind(this, this.ebSettings.Columns.$values[i].DecimalPlaces);
                this.ebSettings.Columns.$values[i].mRender = this.renderProgressCol.bind(this, this.ebSettings.Columns.$values[i].DecimalPlaces);
            }
            else if (this.ebSettings.Columns.$values[i].RenderAs.toString() === EbEnums.NumericRenderType.Link) {
                this.linkDV = this.ebSettings.Columns.$values[i].LinkRefId;
                this.ebSettings.Columns.$values[i].render = this.renderlinkandDecimal.bind(this, this.ebSettings.Columns.$values[i].DecimalPlaces);
                this.ebSettings.Columns.$values[i].mRender = this.renderlinkandDecimal.bind(this, this.ebSettings.Columns.$values[i].DecimalPlaces);
                //alert(this.linkDV);
            }
            //else if (this.ebSettings.Columns.$values[i].DecimalPlaces > 0) {
            //    var deci = this.ebSettings.Columns.$values[i].DecimalPlaces;
            //    this.ebSettings.Columns.$values[i].render = function (data, type, row, meta) {
            //        return parseFloat(data).toFixed(deci);
            //    }
            //    this.ebSettings.Columns.$values[i].mRender = function (data, type, row, meta) {
            //        return parseFloat(data).toFixed(deci);
            //    }
            //}
            //else {
            //    this.ebSettings.Columns.$values[i].render = function (data, type, row, meta) { return data; };
            //    this.ebSettings.Columns.$values[i].mRender = function (data, type, row, meta) { return data; };
            //}
            this.ebSettings.Columns.$values[i].sClass = this.ebSettings.Columns.$values[i].className;
        }
        if (col.Type == parseInt(gettypefromString("Boolean"))) {
            if (this.ebSettings.Columns.$values[i].name === "sys_locked" || this.ebSettings.Columns.$values[i].name === "sys_cancelled") {
                this.ebSettings.Columns.$values[i].render = (this.ebSettings.Columns.$values[i].name === "sys_locked") ? this.renderLockCol.bind(this) : this.renderEbVoidCol.bind(this);
                this.ebSettings.Columns.$values[i].mRender = (this.ebSettings.Columns.$values[i].name === "sys_locked") ? this.renderLockCol.bind(this) : this.renderEbVoidCol.bind(this);
            }
            else {
                if (this.ebSettings.Columns.$values[i].RenderAs.toString() === EbEnums.BooleanRenderType.IsEditable) {
                    this.ebSettings.Columns.$values[i].render = this.renderEditableCol.bind(this);
                    this.ebSettings.Columns.$values[i].mRender = this.renderEditableCol.bind(this);
                }
                else if (this.ebSettings.Columns.$values[i].RenderAs.toString() === EbEnums.BooleanRenderType.Icon) {
                    this.ebSettings.Columns.$values[i].render = this.renderIconCol.bind(this);
                    this.ebSettings.Columns.$values[i].mRender = this.renderIconCol.bind(this);
                }
                else {
                    this.ebSettings.Columns.$values[i].render = function (data, type, row, meta) { return data; };
                    this.ebSettings.Columns.$values[i].mRender = function (data, type, row, meta) { return data; };
                }
            }
        }
        if (col.Type == parseInt(gettypefromString("String")) || col.Type == parseInt(gettypefromString("Double"))) {
            if (this.ebSettings.Columns.$values[i].RenderAs.toString() === EbEnums.StringRenderType.Link) {
                //this.ebSettings.Columns.$values[i].LinkRefId = "eb_roby_dev-eb_roby_dev-16-846-1551"; 
                this.linkDV = this.ebSettings.Columns.$values[i].LinkRefId;
                //this.ebSettings.Columns.$values[i].render = this.renderlink4NewTable.bind(this);
                //this.ebSettings.Columns.$values[i].mRender = this.renderlink4NewTable.bind(this);
                //alert(this.linkDV);
            }
            else if (this.ebSettings.Columns.$values[i].RenderAs.toString() === EbEnums.StringRenderType.Chart) {
                this.ebSettings.Columns.$values[i].render = this.lineGraphDiv.bind(this);
                this.ebSettings.Columns.$values[i].mRender = this.lineGraphDiv.bind(this);
            }
            else if (this.ebSettings.Columns.$values[i].RenderAs.toString() === EbEnums.StringRenderType.Marker) {
                this.ebSettings.Columns.$values[i].render = this.renderMarker.bind(this);
                this.ebSettings.Columns.$values[i].mRender = this.renderMarker.bind(this);
            }
            else if (this.ebSettings.Columns.$values[i].RenderAs.toString() === EbEnums.StringRenderType.Image) {
                this.ebSettings.Columns.$values[i].render = this.renderFBImage.bind(this);
                this.ebSettings.Columns.$values[i].mRender = this.renderFBImage.bind(this);
            }
            else if (this.ebSettings.Columns.$values[i].RenderAs.toString() === EbEnums.StringRenderType.Icon) {
                this.ebSettings.Columns.$values[i].render = this.renderIconCol.bind(this);
                this.ebSettings.Columns.$values[i].mRender = this.renderIconCol.bind(this);
            }
            //else {
            //    this.ebSettings.Columns.$values[i].render = function (data, type, row, meta) { return data; };
            //    this.ebSettings.Columns.$values[i].mRender = function (data, type, row, meta) { return data; };
            //}
        }
        if (col.Type == parseInt(gettypefromString("Date")) || col.Type == parseInt(gettypefromString("DateTime"))) {
            if (this.ebSettings.Columns.$values[i].RenderAs.toString() === EbEnums.StringRenderType.Link) {
                this.linkDV = this.ebSettings.Columns.$values[i].LinkRefId;
                //this.ebSettings.Columns.$values[i].render = this.renderlink4NewTable.bind(this);
                //this.ebSettings.Columns.$values[i].mRender = this.renderlink4NewTable.bind(this);
            }
            //else {
            //    this.ebSettings.Columns.$values[i].render = this.renderDateformat.bind(this);
            //    this.ebSettings.Columns.$values[i].mRender = this.renderDateformat.bind(this);
            //}
        }


        if (col.Font !== null) {
            var style = document.createElement('style');
            style.type = 'text/css';
            var array = [this.tableId, col.name, col.Font.Font, col.Font.Size, col.Font.color.replace("#", "")];
            if ($("." + array.join("_")).length === 0) {
                style.innerHTML = "." + array.join("_") + "{font-family: " + col.Font.Font + "!important; font-size: " + col.Font.Size + "px!important; color: " + col.Font.color + "!important; }";
                document.getElementsByTagName('body')[0].appendChild(style);
            }
            this.ebSettings.Columns.$values[i].className = array.join("_") + " tdheight";
            this.ebSettings.Columns.$values[i].sClass = array.join("_") + " tdheight";
        }
    };

    this.renderProgressCol = function (deci, data, type, row, meta) {
        return "<div class='progress'><div class='progress-bar' role='progressbar' aria-valuenow='" + parseFloat(data.toString()).toFixed(deci) + "' aria-valuemin='0' aria-valuemax='100' style='width:" + data.toString() + "%'>" + parseFloat(data.toString()).toFixed(deci) + "</div></div>";
    };

    this.renderToDecimalPlace = function (data, type, row, meta) {
        return parseFloat(data).toFixed();
    };

    this.renderEditableCol = function (data) {
        return (data === true) ? "<input type='checkbox' data-toggle='toggle' data-size='mini' checked>" : "<input type='checkbox' data-toggle='toggle' data-size='mini'>";
    };

    this.renderIconCol = function (data) {
        return (data === true || data === "Yes") ? "<i class='fa fa-check' aria-hidden='true'  style='color:green'></i>" : "<i class='fa fa-times' aria-hidden='true' style='color:red'></i>";
    };

    this.renderEbVoidCol = function (data) {
        return (data === true) ? "<i class='fa fa-ban' aria-hidden='true'></i>" : "";
    };

    this.renderLockCol = function (data) {
        return (data === true) ? "<i class='fa fa-lock' aria-hidden='true'></i>" : "";
    };

    this.renderlink4NewTable = function (data, type, row, meta) {
        if (meta.settings.aoColumns[meta.col].LinkType.toString() === EbEnums.LinkTypeEnum.Popout)
            return "<a href='#' oncontextmenu='return false' class ='tablelink' data-link='" + meta.settings.aoColumns[meta.col].LinkRefId + "'>" + data + "</a>";
        else if (meta.settings.aoColumns[meta.col].LinkType.toString() === EbEnums.LinkTypeEnum.Inline)
            return data + `<a href='#' oncontextmenu='return false' class ='tablelink' data-link='${meta.settings.aoColumns[meta.col].LinkRefId}' data-inline="true" data-data='${data}'> <i class="fa fa-plus"></i></a>`;
        else
            return "<a href='#' oncontextmenu='return false' class ='tablelink' data-link='" + meta.settings.aoColumns[meta.col].LinkRefId + "'>" + data + "</a>" + ` &nbsp; <a href='#' oncontextmenu='return false' class ='tablelink' data-link='${meta.settings.aoColumns[meta.col].LinkRefId}' data-inline="true" data-data='${data}'> <i class="fa fa-plus"></i></a>`;
    };

    this.renderlinkandDecimal = function (deci, data) {
        return "<a href='#' oncontextmenu='return false' class ='tablelink' data-link='" + this.linkDV + "'>" + parseFloat(data).toFixed(deci) + "</a>";
    };

    this.colorRow = function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
        $.each(this.ebSettings.Columns.$values, function (i, value) {
            var rgb = '';
            var fl = '';
            if (value.name === 'sys_row_color') {
                HEX = Number(aData[value.data]).toString(16);
                var t = (HEX.toString().length < 6) ? ("0" + HEX.toString()) : HEX;
                $(nRow).css('background-color', '#' + t);
            }

            if (value.name === 'sys_cancelled') {
                var tr = aData[value.data];
                if (tr === true)
                    $(nRow).css('color', '#f00');
            }
        });
    };

    this.lineGraphDiv = function (data, type, row, meta) {
        if (!data)
            return "";
        else
            return "<canvas id='eb_cvs" + meta.row + "' class='eb_canvas" + this.tableId + "' style='width:120px; height:40px; cursor:pointer;' data-graph='" + data + "' data-toggle='modal'></canvas><script>renderLineGraphs(" + meta.row + "); $('#eb_cvs" + meta.row + "').mousemove(function(e){ GPointPopup(e); });</script>";
    };

    this.RenderGraphModal = function () {
        $(document.body).append("<div class='modal fade' id='graphmodal' role='dialog'>"
            + "<div class='modal-dialog modal-lg'>"
            + " <div class='modal-content'>"
            + "<div class='modal-header'>"
            + "<button type = 'button' class='close' data-dismiss='modal'>&times;</button>"
            + "<h4 class='modal-title'><center>Graph</center></h4>"
            + "</div>"
            + "<div class='modal-body'>"
            + "<div class='dygraph-Wrapper'>"
            + "<div id='graphdiv' style='width:100%;height:500px;'></div>"
            + "</div>  "
            + "</div>"
            + "</div>"
            + "</div>"
            + "</div>");
        $(document).on('show.bs.modal', '.modal', function (event) {
            var zIndex = 1040 + (10 * $('.modal:visible').length);
            $(this).css('z-index', zIndex);
            setTimeout(function () {
                $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
            }, 0);
        });
    };

    this.renderMainGraph = function (e) {
        $("#graphmodal").modal('show');

        setTimeout(function () {
            var gcsv = csv($(e.target).attr("data-graph").toString());
            new Dygraph(
                document.getElementById('graphdiv'),
                gcsv,
                {
                    showRangeSelector: true,
                    interactionModel: Dygraph.defaultInteractionModel,
                    includeZero: true,
                    stackedGraph: true,
                    axes: {
                        y: {
                            valueFormatter: function (y) {
                                return y;
                            },
                            axisLabelFormatter: function (y) {
                                y = y.toString();
                                if (y.slice(-3) === '000')
                                    return y.slice(0, -3) + 'K';
                                else
                                    return y;
                            },
                        },
                        logscale: true
                    }
                }
            );
        }, 500);
    };

    this.ModifyDvname = function () {
        this.ebSettings.Name = $("#dvnametxt").val();
        $("label.dvname").text(this.ebSettings.Name);
    };

    this.ModifyTableHeight = function () {
        this.ebSettings.scrollY = $("#TableHeighttxt").val();
        this.ebSettings.scrollY = (this.ebSettings.scrollY < 100) ? "300" : this.ebSettings.scrollY;
    };

    this.renderMarker = function (data) {
        if (data !== ",")
            return `<a href='#' class ='columnMarker_${this.tableId}' data-latlong='${data}'><i class='fa fa-map-marker fa-2x' style='color:red;'></i></a>`;
        else
            return null;
    };

    this.renderFBImage = function (data) {
        if (typeof (data) === "string")
            return `<img class='img-thumbnail' src='http://graph.facebook.com/${data}/picture?type=square' style="height: 20px;width: 25px;"/>`;
        else
            return `<img class='img-thumbnail' src='http://graph.facebook.com/12345678/picture?type=square' style="height: 20px;width: 25px;"/>`;
    };

    this.renderDataAsLabel = function (data) {
        return `<label class='labeldata'>${data}</label>`;
    };

    this.renderDateformat = function (data, sym) {
        if (typeof data !== "object" && typeof data !== "undefined") {
            var date = new Date(parseInt(data.substr(6)));
            var month = date.getMonth() + 1;
            var dt = date.getDate();
            if (sym === "-")
                return (dt.toString().length > 1 ? dt : "0" + dt) + "-" + (month.toString().length > 1 ? month : "0" + month) + "-" + date.getFullYear();
            else
                return (dt.toString().length > 1 ? dt : "0" + dt) + "/" + (month.toString().length > 1 ? month : "0" + month) + "/" + date.getFullYear();
        }
        else
            return "";
    };

    this.CreateRelationString = function () { };

    this.ValidateCalcExpression = function (obj) {
        $.ajax({
            url: "../RB/ValidateCalcExpression",
            type: "POST",
            cache: false,
            data: {
                refid: this.EbObject.DataSourceRefId,
                expression: atob(obj.ValueExpression)
            },
            success: function (result) {

            }.bind(this)
        });
    }

    this.start();
};

function returnOperator(op) {
    if (op === "x*")
        return "startwith";
    else if (op === "*x")
        return "endswith";
    else if (op === "*x*")
        return "contains";
    else if (op === "=")
        return "=";
    else
        return op;
}

function csv(gdata) {
    //gdata = ["201607:58179.28","201608:66329.35","201609:67591.27","201610:61900.93","201611:38628.72","201612:48536.31","201701:25256.74","201702:0"];
    var pairs = gdata.split(',');

    var r = 'date, Value\n';
    var ft;
    for (var i = 0; i < pairs.length; i++) {
        ft = pairs[i].split(':')[0].replace("\"", "").replace("[", "");

        ft = ft.slice(0, 4) + '/' + ft.slice(4);

        r += ft.replace("\"", "");
        r += '-01,' + pairs[i].split(':')[1].replace("\"", "");
        r += '\n';
    }
    return r.replace("]", "");
};

function renderLineGraphs(id) {
    var canvas = document.getElementById('eb_cvs' + id);
    var gdata = $(canvas).attr("data-graph").toString();
    var context = canvas.getContext('2d');
    if (gdata) {
        //gdata = '["201607:4529218.75","201608:4643253.00","201609:4886894.55","201610:5272744.25","201611:5253090.25","201612:5541506.00","201701:2964522.00"]';
        context.fillStyle = "rgba(255, 255, 255, 1)";
        context.beginPath();
        context.fillRect(0, 0, 1000, 1000);
        context.fillStyle = "rgba(51, 122, 183, 0.7)";
        var Gpoints = [];
        var Ypoints = [];
        Gpoints = gdata.split(",");
        var xInterval = (parseInt(canvas.style.width) * 2.5) / (Gpoints.length);
        context.moveTo(xInterval, 1000);
        var xPoint = 0;
        var yPoint;
        for (var i = 0; i < Gpoints.length; i++) {
            yPoint = parseInt(Gpoints[i].split(":")[1]);
            Ypoints.push(yPoint);
        }
        var Ymax = Ypoints.max();
        for (i = 0; i < Gpoints.length; i++) {
            xPoint += xInterval;
            context.lineTo(xPoint, 3.76 * (40 - ((Ypoints[i] / Ymax) * 40)));//
        }
        context.lineTo(xPoint, 1000);
        canvas.strokeStyle = "black";
        context.fill();
        context.stroke();
    }
};

function GPointPopup(e) {
    //alert(e.pageX);
};

$.fn.setCursorPosition = function (pos) {
    this.each(function (index, elem) {
        if (elem.setSelectionRange) {
            elem.setSelectionRange(pos, pos);
        } else if (elem.createTextRange) {
            var range = elem.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    });
    return this;
};

function splitval(val) {
    return val.split(/\|\s*/);
}
function extractLast(term) {
    return splitval(term).pop();
}


if (!String.prototype.splice) {
    String.prototype.splice = function (start, delCount, newSubStr) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };
};

Array.prototype.max = function () {
    return Math.max.apply(null, this);
};

Array.prototype.min = function () {
    return Math.min.apply(null, this);
};

var Agginfo = function (col, deci) {
    this.colname = col;
    this.deci_val = deci;
};

var displayFilter = function (col, oper, val, Loper) {
    this.name = col;
    this.operator = oper;
    this.value = val;
    this.logicOp = Loper;
};

var EbTags = function (settings) {
    this.displayFilterDialogArr = (typeof settings.displayFilterDialogArr !== "undefined") ? settings.displayFilterDialogArr : [];
    this.displayColumnSearchArr = (typeof settings.displayColumnSearchArr !== "undefined") ? settings.displayColumnSearchArr : [];
    this.id = $(settings.id);

    this.show = function () {
        this.id.empty();
        var filter = "";
        $.each(this.displayFilterDialogArr, function (i, ctrl) {
            filter = ctrl.name + " " + ctrl.operator + " " + ctrl.value;
            this.id.append(`<div class="tagstyle priorfilter">${filter}</div>`);
            if (ctrl.logicOp !== "")
                this.id.append(`<div class="tagstyle priorfilter">${ctrl.logicOp}</div>`);
        }.bind(this));

        if (this.displayFilterDialogArr.length > 0 && this.displayColumnSearchArr.length > 0)
            this.id.append(`<div class="tagstyle op">AND</div>`);

        $.each(this.displayColumnSearchArr, function (i, search) {
            filter = search.name + " " + returnOperator(search.operator);
            filter += " " + search.value;
            this.id.append(`<div class="tagstyle" data-col="${search.name}" data-val="${search.value}">${filter} <i class="fa fa-close"></i></div>`);
            if (search.logicOp !== "")
                this.id.append(`<div class="tagstyle op">${search.logicOp}</div>`);
        }.bind(this));

        if (this.id.children().length === 0)
            this.id.hide();
        else {
            this.id.children().find(".fa-close").off("click").on("click", this.removeTag.bind(this));
            this.id.show();
        }
    };

    this.removeTag = function (e) {
        var tempcol = $(e.target).parent().attr("data-col");
        var tempval = $(e.target).parent().attr("data-val");
        var temp = $.grep(this.displayColumnSearchArr, function (obj) {
            if (typeof obj.value === "number")
                return obj.name === tempcol && obj.value === parseInt(tempval)
            else
                return obj.name === tempcol && obj.value === tempval
        });
        $(e.target).parent().prev().remove();
        $(e.target).parent().remove();
        settings.remove(e, temp[0]);
    };

    this.show();
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function getColdata(matrix, col) {
    var column = [];
    for (var i = 0; i < matrix.length; i++) {
        column.push(matrix[i][col]);
    }
    return column;
}

(function ($) {
    if ($.fn.style) {
        return;
    }

    // Escape regex chars with \
    var escape = function (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    // For those who need them (< IE 9), add support for CSS functions
    var isStyleFuncSupported = !!CSSStyleDeclaration.prototype.getPropertyValue;
    if (!isStyleFuncSupported) {
        CSSStyleDeclaration.prototype.getPropertyValue = function (a) {
            return this.getAttribute(a);
        };
        CSSStyleDeclaration.prototype.setProperty = function (styleName, value, priority) {
            this.setAttribute(styleName, value);
            var priority = typeof priority != 'undefined' ? priority : '';
            if (priority != '') {
                // Add priority manually
                var rule = new RegExp(escape(styleName) + '\\s*:\\s*' + escape(value) +
                    '(\\s*;)?', 'gmi');
                this.cssText =
                    this.cssText.replace(rule, styleName + ': ' + value + ' !' + priority + ';');
            }
        };
        CSSStyleDeclaration.prototype.removeProperty = function (a) {
            return this.removeAttribute(a);
        };
        CSSStyleDeclaration.prototype.getPropertyPriority = function (styleName) {
            var rule = new RegExp(escape(styleName) + '\\s*:\\s*[^\\s]*\\s*!important(\\s*;)?',
                'gmi');
            return rule.test(this.cssText) ? 'important' : '';
        }
    }

    // The style function
    $.fn.style = function (styleName, value, priority) {
        // DOM node
        var node = this.get(0);
        // Ensure we have a DOM node
        if (typeof node == 'undefined') {
            return this;
        }
        // CSSStyleDeclaration
        var style = this.get(0).style;
        // Getter/Setter
        if (typeof styleName != 'undefined') {
            if (typeof value != 'undefined') {
                // Set style property
                priority = typeof priority != 'undefined' ? priority : '';
                style.setProperty(styleName, value, priority);
                return this;
            } else {
                // Get style property
                return style.getPropertyValue(styleName);
            }
        } else {
            // Get CSSStyleDeclaration
            return style;
        }
    };
})(jQuery);