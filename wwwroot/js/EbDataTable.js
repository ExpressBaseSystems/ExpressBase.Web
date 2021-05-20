﻿


//refid, ver_num, type, dsobj, cur_status, tabNum, ssurl
var EbDataTable = function (Option) {
    this.propGrid = Option.PGobj;
    this.Api = null;
    this.order_info = new Object();
    this.order_info.col = '';
    this.order_info.dir = 0;
    this.MainData = (Option.data === undefined) ? null : Option.data;
    this.isPipped = false;
    this.isContextual = false;
    this.chartJs = null;
    this.url = Option.url;
    this.EbObject = Option.dsobj;
    this.tabNum = Option.tabNum;
    this.Refid = Option.refid;
    this.tableId = null;
    this.ebSettings = null;
    this.ssurl = Option.ssurl;
    this.login = Option.login;
    this.counter = Option.counter;
    this.datePattern = Option.datePattern;
    this.TenantId = Option.TenantId;
    this.UserId = Option.UserId;
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
    this.rowData = (Option.rowData !== undefined && Option.rowData !== null && Option.rowData !== "") ? JSON.parse(decodeURIComponent(escape(window.atob(Option.rowData)))) : null;
    this.filterValues = (Option.filterValues !== "" && Option.filterValues !== undefined && Option.filterValues !== null) ? JSON.parse(decodeURIComponent(escape(window.atob(Option.filterValues)))) : [];
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
    this.cellData = Option.cellData;
    this.columnSearch = [];
    this.isSecondTime = false;
    this.tempColumns = [];
    this.filterHtml = "";
    this.orderColl = [];
    this.RGIndex = [];
    this.NumericIndex = [];
    this.inline = false;
    this.rowgroupCols = [];
    this.treeCols = [];
    this.rowgroupFilter = [];
    this.CurrentRowGroup = null;
    this.permission = [];
    this.isCustomColumnExist = false;
    this.dvformMode = -1;
    this.IsTree = false;
    this.GroupFormLink = null;
    this.ItemFormLink = null;
    this.treeColumn = null;
    this.treeData = [];
    this.tableName = null;
    this.moveToPid = null;
    this.movefromId = null;
    this.columnCount = null;

    var split = new splitWindow("parent-div0", "contBox");

    this.init = function () {
        this.tableId = "dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter;
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
                style: { top: "78px" }
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
        this.submitId = "btnGo" + this.tableId;
        var isCustom = (typeof (value) !== "undefined") ? ((value === "Yes") ? true : false) : true;
        this.relatedObjects = this.EbObject.DataSourceRefId;
        $("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#parent", Style: { "top": "39px", "margin-left": "unset", "margin-right": "unset" } }, maskLoader: false });
        $.ajax({
            type: "POST",
            url: "../DV/dvCommon",
            data: { dvobj: JSON.stringify(this.EbObject), dvRefId: this.Refid, _flag: this.PcFlag, login: this.login, contextId: this.ContextId, customcolumn: isCustom, _curloc: store.get("Eb_Loc-" + this.TenantId + this.UserId), submitId: this.submitId },
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
        var subDivId = "#sub_window_dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter;
        $("#content_dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter).empty();
        this.filterHtml = text;
        if (this.login === "uc") {
            this.stickBtn = new EbStickButton({
                $wraper: this.FDCont,
                $extCont: this.FDCont,
                $scope: $("#" + focusedId),
                icon: "fa-filter",
                dir: "left",
                label: "Parameters",
                //btnTop: 42,
                style: { top: "42px" }
            });
        }
        $("#obj_icons").empty();
        this.$submit = $("<button id='" + this.submitId + "' class='btn commonControl'><i class='fa fa-play' aria-hidden='true'></i></button>");
        $("#obj_icons").append(this.$submit);
        this.$submit.click(this.getColumnsSuccess.bind(this));

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
        this.SetColumnRef();
        this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
        if (this.PcFlag === true)
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
            this.$submit.trigger("click");
        }
        else {
            this.FD = true;
            if (this.isPipped || this.isContextual) {
                this.placefiltervalues();
                this.$submit.trigger("click");
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

    this.SetColumnRef = function () {
        $.each(this.EbObject.Columns.$values, function (i, obj) {
            obj.ColumnsRef = this.EbObject.Columns;
        }.bind(this));
    };

    this.RemoveColumnRef = function () {
        $.each(this.EbObject.Columns.$values, function (i, obj) {
            obj.ColumnsRef = null;
        }.bind(this));
    };

    this.CloseParamDiv = function () {
        this.stickBtn.minimise();
    };

    this.tmpPropertyChanged = function (obj, Pname, newval, oldval) {
        //this.isSecondTime = true;
        if (Pname === "DataSourceRefId") {
            if (obj[Pname] !== null) {
                this.PcFlag = true;
                this.stickBtn.hide();
                this.filterValues = [];
                this.isContextual = false;
                this.isPipped = false;
                this.rowData = null;

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
        var temparr = [];
        $.each(this.EbObject.RowGroupCollection.$values, function (i, obj) {
            $.each(obj.RowGrouping.$values, function (j, col) {
                var tempcol = $.grep(this.EbObject.Columns.$values, function (column) { return column.name === col.name && column.Type === col.Type });
                if (tempcol.length !== 1) {
                    temparr.push(i);
                    return false;
                }
            }.bind(this));
        }.bind(this));
        $.each(temparr, function (i, index) {
            this.EbObject.RowGroupCollection.$values.splice(index, 1);
        }.bind(this));
        this.CurrentRowGroup = null;
    };

    //Initialisation
    this.start = function () {
        if (this.EbObject === null) {
            this.EbObject = new EbObjects["EbTableVisualization"]("Container_" + Date.now());
            split.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter, "EbTableVisualization");
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
                split.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter, "EbTableVisualization", prevfocusedId);
            else
                split.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter, "EbTableVisualization");
            if (this.login === "dc") {
                //this.propGrid = new Eb_PropertyGrid("pp_inner", "dc");

                this.propGrid = new Eb_PropertyGrid({
                    id: "pp_inner",
                    wc: "dc",
                    cid: this.cid,
                    $extCont: $(".ppcont"),
                    style: { top: "76px" }
                }, this.PGobj);

                this.propGrid.PropertyChanged = this.tmpPropertyChanged;
            }
            else
                this.propGrid.ClosePG();
            $("#objname").text(this.EbObject.DisplayName);
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
        this.propGrid.ClosePG();
        if (this.FD)
            this.stickBtn.minimise();
        else
            this.stickBtn.hide();
        $("#objname").text(this.EbObject.DisplayName);
        this.validateFD = this.FilterDialog.IsFDValidationOK;
        if (this.isContextual) {
            if (this.isSecondTime) {
                if (this.validateFD && !this.validateFD())
                    return;
                this.filterValues = this.getFilterValues("filter");
            }
        }
        else {
            if (this.validateFD && !this.validateFD())
                return;
            this.filterValues = this.getFilterValues("filter");
        }
        this.isSecondTime = false;
        if(this.login === "uc")
            $(".dv-body1").show();
        $("#eb_common_loader").EbLoader("show");
        this.extraCol = [];
        this.ebSettings = this.EbObject;
        $.extend(this.tempColumns, this.EbObject.Columns.$values);
        //this.tempColumns.sort(this.ColumnsComparer);
        this.dsid = this.ebSettings.DataSourceRefId;//not sure..
        this.dvName = this.ebSettings.Name;
        this.initCompleteflag = false;

        this.check4Customcolumn();
        this.CheckforTree();
        this.addSerialAndCheckboxColumns();
        this.ModifyColumnObject();
        this.treeCols = [];
        this.getColumnCount();
        //hard coding
        this.orderColl = [];
        let rowG_coll = this.EbObject.RowGroupCollection.$values;
        let CurR_RowG = this.CurrentRowGroup;
        if (rowG_coll.length>0 &&  !this.EbObject.DisableRowGrouping) {
            if (CurR_RowG === null) {
                CurR_RowG = rowG_coll.find(obj => obj.RowGrouping.$values.length > 0);
                this.CurrentRowGroup = CurR_RowG;
            }
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
        var temp = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.IsCustomColumn; });
        if (temp.length === 0)
            this.isCustomColumnExist = false;
        else {
            this.isCustomColumnExist = true;
            temp.map(function (x) {
                x.orderable = false;
                return x;
            });
        }
    };

    this.CheckforTree = function () {
        var temp = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.IsTree; });
        if (temp.length === 0) {
            //this.EbObject.DisableRowGrouping = false;
            this.IsTree = false;
        }
        else {
            this.EbObject.DisableRowGrouping = true;
            this.IsTree = true;
            this.GroupFormLink = temp[0].GroupFormLink;
            this.ItemFormLink = temp[0].ItemFormLink;
            this.treeColumn = temp[0];
            this.treeColumnIndex = this.EbObject.Columns.$values.findIndex(x => x.data === this.treeColumn.data);
        }
        if (this.IsTree)
            this.EbObject.IsPaging = false;
    };

    this.ModifyColumnObject = function () {
        if (this.IsTree) {
            this.EbObject.Columns.$values.map(function (x) {
                x.orderable = false;
                return x;
            });
        }
    };

    this.getColumnCount = function () {
        this.columnCount = this.rowgroupCols.length + this.extraCol.length;
        var temp = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.bVisible; });
        this.columnCount += temp.length;
    };

    this.InitializeColumns = function () {
        $.each(this.EbObject.Columns.$values, function (i, col) {
            if (col.HideDataIfRowMoreThan === null)
                col.HideDataIfRowMoreThan = { "$type": "ExpressBase.Objects.Objects.DVRelated.HideColumnData, ExpressBase.Objects", "Enable": false, "UnRestrictedRowCount": 0, "ReplaceByCharacter": "", "ReplaceByText": "" };
        }.bind(this));
    };

    this.validateFD = function () { }

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

        //this.table_jQO.children("tfoot").hide();
        this.table_jQO.children().find("tr").addClass("addedbyeb");

        //this.table_jQO.on('pre-row-reorder.dt', function (e, node, index) {
        //    console.log('Row reorder started: ', node, index);
        //});

        this.table_jQO.on('processing.dt', function (e, settings, processing) {
            if (processing == true) {
                $("#obj_icons .btn").prop("disabled", true);
                $("#eb_common_loader").EbLoader("show");
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

        //this.table_jQO.off('draw.dt').on('draw.dt', this.doSerial.bind(this));

        //this.table_jQO.on('length.dt', function (e, settings, len) {
        //    console.log('New page length: ' + len);
        //});

        $.fn.dataTable.ext.errMode = function (settings, helpPage, message) {
            alert("ajax erpttt......");
        };


        //this.Api.on('row-reorder', function (e, diff, edit) {
        //});
    };

    this.addSerialAndCheckboxColumns = function () {
        this.CheckforColumnID();//, 
        var serialObj = (JSON.parse('{ "data":' + this.EbObject.Columns.$values.length + ', "searchable": false, "orderable": false, "bVisible":true, "name":"serial", "title":"#", "Type":11}'));
        if (this.IsTree) {
            serialObj.bVisible = false;
        }
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
        //o.rowReorder = this.IsTree;
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
                if (this.IsTree) {
                    o.dom = "<'col-md-12 noPadding display-none'B><'col-md-12'i>rt";
                    o.language.info = "_START_ - _END_ / _TOTAL_ Entries";
                }
                else {
                    o.dom = "<'col-md-12 noPadding display-none'B>rt";
                }
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
        o.fnRowCallback = this.rowCallBackFunc.bind(this);
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
        if (!this.isSecondTime) {
            $("#" + this.tableId + "_wrapper .dataTables_scrollFoot").hide();
            $("#" + this.tableId + "_wrapper .DTFC_LeftFootWrapper").hide();
            $("#" + this.tableId + "_wrapper .DTFC_RightFootWrapper").hide();
        }

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
        this.RemoveColumnRef();
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
                    tempArray.push(new order_obj(this.CurrentRowGroup.RowGrouping.$values[i].name, this.CurrentRowGroup.RowGrouping.$values[i].Direction));
            }
            if (this.orderColl.length > 0) {
                $.each(this.orderColl, function (i, obj) {
                    tempArray.push(obj);
                });
            }
            else {
                if (this.CurrentRowGroup.OrderBy.$values.length > 0) {
                    for (let i = 0; i < this.CurrentRowGroup.OrderBy.$values.length; i++)
                        tempArray.push(new order_obj(this.CurrentRowGroup.OrderBy.$values[i].name, this.CurrentRowGroup.OrderBy.$values[i].Direction));
                }
            }
        }

        if (tempArray.length === 0) {
            $.each(this.orderColl, function (i, obj) {
                tempArray.push(obj);
            });
            if (tempArray.length === 0) {
                $.each(this.EbObject.OrderBy.$values, function (i, obj) {
                    if (tempArray.filter(e => e.Column === obj.name).length === 0)
                        tempArray.push(new order_obj(obj.name, obj.Direction));
                });
            }
        }

        return tempArray;
    };

    this.getFilterValues = function (from) {
        //this.filterChanged = false;
        var fltr_collection = [];

        if (this.FD)
            fltr_collection = getValsForViz(this.FilterDialog.FormObj);


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
        if (parseInt(this.linkDV.split("-")[2]) !== EbObjectTypes.WebForm) {
            $.each(this.EbObject.Columns.$values, function (i, col) {
                if (this.rowData[col.data] !== "")
                    filters.push(new fltr_obj(col.Type, col.name, this.rowData[col.data]));
            }.bind(this));
        }
        else {
            var temp = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.LinkRefId === this.linkDV; }.bind(this));
            this.dvformMode = temp[0].FormMode;
            if (temp[0].FormMode === 1) {
                var col = temp[0].FormId.$values;
                $.each(col, function (i, col) {
                    filters.push(new fltr_obj(col.Type, col.name, this.rowData[col.data]));
                }.bind(this));
            }
            else if (temp[0].FormMode === 2) {
                var cols = temp[0].FormParameters.$values;
                $.each(cols, function (i, col) {
                    if (this.rowData[col.data] !== "")
                        filters.push(new fltr_obj(col.Type, col.name, this.rowData[col.data]));
                }.bind(this));
            }
        }
        return filters;
    };

    this.placefiltervalues = function () {
        //if (this.filterValues.length > 0) {
        //    $.each(this.filterValues, function (i, param) {
        //        $("#" + this.ContextId + ' #' + param.Name).val(param.Value);
        //    });
        //}
        $.each(getFlatControls(this.FilterDialog.FormObj), function (i, obj) {
            var mapobj = getObjByval(this.filterValues, "Name", obj.Name);
            if (typeof mapobj !== "undefined") {
                let val = mapobj.Value;
                obj.setValue(val);
            }
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
                if (ctype === "PowerSelect")
                    o.value = $(ctrl).find("input").attr("display-members");
                else if (ctype === "Date")
                    o.value = $(ctrl).find("input").val();
                else if (ctype === "RadioGroup")
                    o.value = $(ctrl).children().find("[type=radio]:checked").val();
                else if (ctype === "SimpleSelect")
                    o.value = $(ctrl).children().find("option:selected").text();
                else if (ctype === "UserLocation") {
                    if ($(ctrl).children().find("[type=checkbox][class=userloc-checkbox]").prop("checked"))
                        o.value = "Global";
                    else
                        o.value = $(ctrl).children().find(".active").text().trim().split(" ").join(",");
                }
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
        this.Tags = new EbTags({ "displayFilterDialogArr": filterdialog, "displayColumnSearchArr": columnFilter, "id": "#filterdisplayrowtd_" + this.tableId + "", "remove": this.closeTag });
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
        if (dd.responseStatus.message !== null) {
            EbPopBox("show", { Message: dd.responseStatus.message, Title:"Error" });
        }
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
        this.summary = dd.summary;
        this.tableName = dd.tableName;
        this.treeData = dd.tree;
        this.SetColumnRef();
        this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
        return dd.formattedData;
    };

    this.fixedColumnCount = function () {
        var count = this.ebSettings.LeftFixedColumn;
        var visCount = 0;
        if (count > 1) {
            $.each(this.EbObject.Columns.$values, function (i, col) {
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
        if (col.bVisible && (col.RenderType == parseInt(gettypefromString("Int32")) || col.RenderType == parseInt(gettypefromString("Decimal")) || col.RenderType == parseInt(gettypefromString("Int64")) || col.RenderType == parseInt(gettypefromString("Double")) || col.RenderType == parseInt(gettypefromString("Numeric"))) && col.name !== "serial") {
            _ls.push(new Agginfo(col.name, this.ebSettings.Columns.$values[i].DecimalPlaces, col.data));
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
                    //var type = $(textid).attr('data-coltyp');
                    var type = api.settings().init().aoColumns[i].Type;
                    var Rtype = api.settings().init().aoColumns[i].RenderType;
                    if (Rtype === 3) {
                        var obj = this.EbObject.Columns.$values.find(x => x.name === colum);
                        val1 = ($(textid).is(':checked')) ? obj.TrueValue : obj.FalseValue;
                        if (!($(textid).is(':indeterminate')))
                            filter_obj_arr.push(new filter_obj(colum, "=", val1, type));
                    }
                    else {
                        oper = $('#' + table + '_' + colum + '_hdr_sel').text().trim();
                        if (api.columns(i).visible()[0]) {
                            if (oper !== '' && $(textid).val() !== '') {
                                if (oper === 'B') {
                                    val1 = $(textid).val();
                                    val2 = $(textid).siblings('input').val();
                                    if (oper === 'B' && val1 !== '' && val2 !== '') {
                                        if (Rtype === 8 || Rtype === 7 || Rtype === 11 || Rtype === 12) {
                                            filter_obj_arr.push(new filter_obj(colum, ">=", Math.min(val1, val2)));
                                            filter_obj_arr.push(new filter_obj(colum, "<=", Math.max(val1, val2), type));
                                        }
                                        else if (Rtype === 5 || Rtype === 6) {
                                            //val1 = this.changeDateOrder(val1);
                                            //val2 = this.changeDateOrder(val2);
                                            if (val2 > val1) {
                                                filter_obj_arr.push(new filter_obj(colum, ">=", val1, type));
                                                filter_obj_arr.push(new filter_obj(colum, "<=", val2, type));
                                            }
                                            else {
                                                filter_obj_arr.push(new filter_obj(colum, ">=", val2, type));
                                                filter_obj_arr.push(new filter_obj(colum, "<=", val1, type));
                                            }
                                        }
                                    }
                                }
                                else {
                                    var data = $(textid).val();
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
        if (this.treeColumn) {
            let elem = aData[this.treeColumn.data].split("&nbsp;").join("").split("&emsp;").join("");
            let treeElem = $(elem);
            $(nRow).attr("data-lvl", treeElem.attr("data-level"));
            if (treeElem.hasClass("groupform")) {
                $(nRow).children(`td:eq(${this.treeColumnIndex})`).addClass("groupform");
                $(nRow).children(`td:eq(${this.treeColumnIndex})`).children().removeClass("groupform");
            }
            else {
                $(nRow).children(`td:eq(${this.treeColumnIndex})`).addClass("itemform");
                $(nRow).children(`td:eq(${this.treeColumnIndex})`).children().removeClass("itemform");
            }
        }
    };

    this.initCompleteFunc = function (settings, json) {
        this.Run = false;
        this.GenerateButtons();
        if (this.login == "uc") {
            this.initCompleteflag = true;
            //if (this.isSecondTime) { }
            //this.ModifyingDVs(dvcontainerObj.currentObj.Name, "initComplete");            
        }

        if (!this.IsTree)
            this.createFilterRowHeader();
        else
            this.createFilterforTree();
        this.filterDisplay();
        this.createFooter();
        this.arrangeWindowHeight();
        $("#" + this.tableId + "_wrapper .dataTables_scrollFoot").show();
        $("#" + this.tableId + "_wrapper .DTFC_LeftFootWrapper").show();
        $("#" + this.tableId + "_wrapper .DTFC_RightFootWrapper").show();
        $("#" + this.tableId + "_wrapper .dataTables_scrollFoot").style("padding-top", "100px", "important");
        $("#" + this.tableId + "_wrapper .dataTables_scrollFoot").style("margin-top", "-100px", "important");

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
                        <div class="modal-body"> <iframe id="reportIframe${copycelldata}" class="reportIframe" src='../ReportRender/Renderlink?refid=${this.linkDV}&_params=${btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValues))))}'></iframe>
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
            let _filter = btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValuesforForm))));
            let url = `../WebForm/Index?_r=${this.linkDV}&_p=${_filter}&_m=${this.dvformMode}&_l=${ebcontext.locations.getCurrent()}`;
            window.open(url, '_blank');
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

            input.value = btoa(unescape(encodeURIComponent(JSON.stringify(this.rowData))));
            _form.appendChild(input);

            let input1 = document.createElement('input');
            input1.type = 'hidden';
            input1.name = "filterValues";
            input1.value = btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValues))));
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
        var filterId = "#filterdisplayrowtd_" + this.tableId;
        if (this.login === "uc") {
            if (this.IsTree) {
                $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 52px)", "important");
            }
            else if ($(filterId).children().length === 0 && !this.ebSettings.IsPaging && !this.EbObject.AllowMultilineHeader)
                $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 62px)", "important");
            else {
                if ($(filterId).children().length === 0 && !this.ebSettings.IsPaging && this.EbObject.AllowMultilineHeader) {//multilineonly
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 79px)", "important");
                }
                else if ($(filterId).children().length === 0 && this.ebSettings.IsPaging && !this.EbObject.AllowMultilineHeader) {//pagingonly
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 88px)", "important");
                }
                else if ($(filterId).children().length !== 0 && !this.ebSettings.IsPaging && !this.EbObject.AllowMultilineHeader) {//filteronly
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 86px)", "important");
                }
                else if ($(filterId).children().length === 0 && this.ebSettings.IsPaging && this.EbObject.AllowMultilineHeader) {//paging & multiline
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 104px)", "important");
                }
                else if ($(filterId).children().length !== 0 && !this.ebSettings.IsPaging && this.EbObject.AllowMultilineHeader) {//filter & multiline
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 102px)", "important");
                }
                else if ($(filterId).children().length !== 0 && this.ebSettings.IsPaging && !this.EbObject.AllowMultilineHeader) {//filetr & paging
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 112px)", "important");
                }
                else {
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 127px)", "important");//filter && paging & multiline
                }
            }
            //this.stickBtn.$stickBtn.css("top", "46px");
        }
        else {
            $(".dv-body2").style("height", "calc( 100vh - 38px )", "important");
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
                if (this.IsTree)
                    $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 32px)", "important");
                else if ($(filterId).children().length === 0 && !this.ebSettings.IsPaging)
                    $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 42px)", "important");
                else {
                    if ($(filterId).children().length === 0)
                        $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 68px)", "important");
                    else if (!this.ebSettings.IsPaging)
                        $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 65px)", "important");
                    else
                        $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 93px)", "important");
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
        if (this.EbObject.RowGroupCollection.$values.length > 0)
            this.doRowgrouping();
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
        if (!(name === "None")) {
            this.EbObject.DisableRowGrouping = false;
            $.each(this.EbObject.RowGroupCollection.$values, function (i, obj) {
                if (obj.Name === name) {
                    this.CurrentRowGroup = jQuery.extend({}, obj);
                    this.getColumnsSuccess(e);
                }
            }.bind(this));
        }
        else {
            this.EbObject.DisableRowGrouping = true;
            this.getColumnsSuccess();
        }
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
            if (colobj.name === "id")
                colobj.bVisible = false;
        }.bind(this));

    }

    this.doRowgrouping = function () {
        var rows = this.Api.rows().nodes();
        var count = this.Api.columns()[0].length;
        $(rows).eq(0).before(`<tr class='group-All' id='group-All_${this.tableId}'></tr>`);
        $(`#group-All_${this.tableId}`).append(`<td  colspan="${count}"><select id="rowgroupDD_${this.tableId}" class="rowgroupselect"></select></td>`);
        $.each(this.EbObject.RowGroupCollection.$values, function (i, obj) {
            if (obj.RowGrouping.$values.length > 0) {
                $(`#rowgroupDD_${this.tableId}`).append(`<option value="${obj.Name.trim()}">${obj.DisplayName}</option>`);
            }
        }.bind(this));
        $(`#rowgroupDD_${this.tableId}`).append(`<option value="None">None</option>`);
        $(`#rowgroupDD_${this.tableId}`).off("change").on("change", this.rowGroupHandler.bind(this));
        if (this.CurrentRowGroup !== null) {
            $(`#group-All_${this.tableId}`).prepend(`<td><i class='fa fa-minus-square-o' style='cursor:pointer;'></i></td>`);
            $(`#rowgroupDD_${this.tableId} [value=${this.CurrentRowGroup.Name.trim()}]`).attr("selected", "selected");

            rows = this.Api.rows().nodes();
            $.each(this.Levels, function (i, obj) {
                if (obj.insertionType !== "After")
                    $(rows).eq(obj.rowIndex).before(obj.html);
                else
                    $(rows).eq(obj.rowIndex).after(obj.html);
            });
            var ct = $("#" + this.tableId + " .group[group=1]").length;
            $(`#group-All_${this.tableId} td[colspan=${count}]`).prepend(` Groups (${ct}) - `);

            $("#" + this.tableId + " tbody").off("click", "tr.group").on("click", "tr.group", this.collapseGroup);
            $("#" + this.tableId + " tbody").off("click", "tr.group-All").on("click", "tr.group-All", this.collapseAllGroup);
        }
        else {
            $(`#rowgroupDD_${this.tableId} [value=None`).attr("selected", "selected");
            $(`#group-All_${this.tableId} td[colspan=${count}]`).prepend(` Groups `);
        }
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
        this.checkHeaderCollapse($group, groupnum);

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
        else if ($elem.is("b")) {
            $elem = $elem.closest("td").prev().children("I");
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
        var nextSiblings = $group.nextUntil("[group=" + headergroup + "]").filter(".group[group=" + groupnum + "]").next();
        var prevSiblings = $group.prevUntil("[group=" + headergroup + "]").filter(".group[group=" + groupnum + "]").next();
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
        else if (property.length === 0) {
            if ($group.nextUntil("[group=" + headergroup + "]").css("display") === "none")
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
                var style = "";
                if (col.Align.toString() === EbEnums.Align.Left)
                    style = "text-align: left;";
                else if (col.Align.toString() === EbEnums.Align.Right || col.Align.toString() === EbEnums.Align.Auto)
                    style = "text-align: right;";
                else
                    style = "text-align: center;";

                _ls = "<div class='input-group input-group-sm'>" +
                    "<div class='input-group-btn dropup'>" +
                    "<button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='" + footer_select_id + "'>&sum;</button>" +
                    " <ul class='dropdown-menu'>" +
                    "  <li class='footerli'><a href ='#' class='eb_ftsel" + this.tableId + "' data-sum='Sum' " + data_table + " " + data_colum + " " + data_decip + "> &sum; </a><span class='footertext eb_ftsel" + this.tableId + "'>Sum</span></li>" +
                    "  <li class='footerli'><a href ='#' class='eb_ftsel" + this.tableId + "' " + data_table + " " + data_colum + " " + data_decip + " {4}> x&#772; </a><span class='footertext eb_ftsel" + this.tableId + "'>Average</span></li>" +
                    " </ul>" +
                    " </div>" +
                    " <input type='text' class='form-control' id='" + footer_txt + "' disabled style='z-index:" + zidx.toString() + ";" + style + "'>" +
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
                    summary_val = (typeof this.summary[agginfo.data] !== "undefined") ? this.summary[agginfo.data][0] : 0;
                if (opScroll === 'x̄' || opLF === 'x̄' || opRF === 'x̄') {
                    summary_val = (typeof this.summary[agginfo.data] !== "undefined") ? this.summary[agginfo.data][1] : 0;
                }
                if (opScroll !== "")
                    $(ftrtxtScroll).val(summary_val);
                if (opLF !== "")
                    $(ftrtxtLF).val(summary_val);
                if (opRF !== "")
                    $(ftrtxtRF).val(summary_val);
            }
        }.bind(this));
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
            sc_h_tbl.find("thead .addedbyeb").before($("<tr role='row' id='filterdisplayrow_" + this.tableId + "' class='filterdisplayrow'><td id='filterdisplayrowtd_" + this.tableId + "' colspan=" + this.columnCount + " style='padding: 2px!important;'></td></tr>"));
        }

        // $('#' + tableid + '_wrapper table thead tr[class=addedbyeb]').hide();

        //$('thead:eq(0) tr:eq(1) [type=checkbox]').prop('indeterminate', true);
        $(".addedbyeb [type=checkbox]").prop('indeterminate', true);
        $(".DTFC_Blocker").remove();
    };

    this.createColspanHeader = function () {

    };

    this.createFilterforTree = function () {
        $(".dataTables_info").after(`<div id="${this.tableId}_filter" class="dataTables_filters">
        <label>Search:<input type="search" class="form-control input-sm" placeholder="" aria-controls="${this.tableId}"></label></div>`);
        $(`#${this.tableId}_filter input`).off("keyup").on("keyup", this.LocalSearch.bind(this));
    };

    this.LocalSearch = function (e) {
        var text = $(e.target).val();
        if (e.keyCode === 13 && text.length >3) {
            //window.find(text, false, false, true);
            if (window.find && window.getSelection) {
                document.designMode = "on";
                var sel = window.getSelection();
                sel.collapse(document.body, 0);

                while (window.find(text)) {
                    document.execCommand("HiliteColor", false, "yellow");
                    sel.collapseToEnd();
                }
                document.designMode = "off";
            }
        }
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
        //$("#" + this.tableId + "_btntotalpage").off("click").on("click", this.showOrHideAggrControl.bind(this));
        this.copybtn.off("click").on("click", this.CopyToClipboard.bind(this));
        this.printbtn.off("click").on("click", this.ExportToPrint.bind(this));
        //this.printAllbtn.off("click").on("click", this.printAll.bind(this));
        this.printSelectedbtn.off("click").on("click", this.printSelected.bind(this));
        $("#btnExcel" + this.tableId).off("click").on("click", this.ExportToExcel.bind(this));
        this.csvbtn.off("click").on("click", this.ExportToCsv.bind(this));
        this.pdfbtn.off("click").on("click", this.ExportToPdf.bind(this));
        $("#btnToggleFD" + this.tableId).off("click").on("click", this.toggleFilterdialog.bind(this));
        $(".columnMarker_" + this.tableId).off("click").on("click", this.link2NewTable.bind(this));
        $(".columnimage").off("click").on("click", this.ViewImage.bind(this));
        $('[data-toggle="tooltip"],[data-toggle-second="tooltip"]').tooltip({
            placement: 'bottom'
        });
        $('.columntooltip').popover({
            container: 'body',
            trigger: 'hover',
            placement: this.PopoverPlacement,
            html:true,
            content: function (e,i) {
                return atob($(this).attr("data-contents"));                
            },
        });
        //$('.columntooltip').on('shown.bs.popover', this.openColumnTooltip.bind(this));

        $("[data-coltyp=date]").datepicker({
            dateFormat: this.datePattern.replace(new RegExp("M", 'g'), "m").replace(new RegExp("yy", 'g'), "y"),
            beforeShow: function (elem, obj) {
                $(".ui-datepicker").addClass("datecolumn-picker");
            }
        });
        $("[data-coltyp=date]").on("click", function () {
            $(this).datepicker("show");
        });
        //$("#switch" + this.tableId).off("click").on("click", this.SwitchToChart.bind(this));
        this.Api.columns.adjust();
    };

    this.ViewImage = function (e) {
        let data = $(e.target).attr("src");
        let loader = "data:image/gif;base64,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";
        $("#Imagemodal").remove();

        let modal1 = `<div class="modal" id='Imagemodal' tabindex="-1" role="dialog">
  <div class="modal-dialog modal-sm" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5>Image</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <img src="${loader}" data-src=${data}/>
      </div>
    </div>
  </div>
</div>`;
        $("body").prepend(modal1);
        $("#Imagemodal img").Lazy();
        $("#Imagemodal").modal("show");
        //$img.attr('src', $img.attr('data-src')).removeAttr('data-src');
    };

    this.PopoverPlacement = function (context, source) {
        var position = $(source).position();

        if (position.left > 1150)
            return "left";
        else {
            return "right";
        }
    };

    this.GenerateButtons = function () {
        $("#objname").text(this.EbObject.DisplayName);
        $(".toolicons").show();
        $("#obj_icons").empty();
        this.submitId = "btnGo" + this.tableId;
        this.$submit = $("<button id='" + this.submitId + "' class='btn commonControl'><i class='fa fa-play' aria-hidden='true'></i></button>");
        $("#obj_icons").append(this.$submit);
        this.$submit.click(this.getColumnsSuccess.bind(this));

        if (this.EbObject.FormLinks.$values.length > 0) {
            this.CreateNewFormLinks();
        }

        if (window.location.href.indexOf("hairocraft") !== -1 && this.login === "uc" && this.dvName.indexOf("leaddetails") !== -1)
            $("#obj_icons").prepend(`<button class='btn' data-toggle='tooltip' title='New Customer' onclick='window.open("/leadmanagement","_blank");' ><i class="fa fa-user-plus"></i></button>`);

        if ($("#" + this.tableId).children().length > 0) {
            if (this.login === "dc") {
                $("#obj_icons").append(
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
                        $("#" + this.tableId + "_fileBtns .btn-group").append("<button id = 'btnExcel" + this.tableId + "' class='btn'  name = 'filebtn' data-toggle='tooltip' title = 'Excel' > <i class='fa fa-file-excel-o' aria-hidden='true'></i></button >");
                }.bind(this));
            }

            if (this.login === "uc") {
                dvcontainerObj.modifyNavigation();
            }
        }
        if (this.isSecondTime) {
            this.addFilterEventListeners();
        }

        if (this.IsTree) {
            $.contextMenu({
                selector: ".groupform",
                build: function ($trigger, e) {
                    $("body").find("td").removeClass("focus");
                    $("body").find("[role=row]").removeClass("selected");
                    $trigger.closest("[role=row]").addClass("selected");
                    if (this.GroupFormLink !== null) {
                        if ($(e.currentTarget).children().hasClass("levelzero")) {
                            return {
                                items: {
                                    "NewGroup": { name: "New Group", icon: "fa-external-link-square", callback: this.FormNewGroup.bind(this) },
                                    "NewItem": { name: "New Item", icon: "fa-external-link-square", callback: this.FormNewItem.bind(this) },
                                    "EditGroup": { name: "View Group", icon: "fa-external-link-square", callback: this.FormEditGroup.bind(this) }
                                }
                            };
                        }
                        else {
                            return {
                                items: {
                                    "NewGroup": { name: "New Group", icon: "fa-external-link-square", callback: this.FormNewGroup.bind(this) },
                                    "NewItem": { name: "New Item", icon: "fa-external-link-square", callback: this.FormNewItem.bind(this) },
                                    "EditGroup": { name: "View Group", icon: "fa-external-link-square", callback: this.FormEditGroup.bind(this) },
                                    "Move": { name: "Move Group", icon: "fa-external-link-square", callback: this.MoveGroupOrItem.bind(this) }
                                }
                            };
                        }
                    }
                    else {
                        if ($(e.currentTarget).hasClass("levelzero")) {
                            return {};
                        }
                        else {
                            return {
                                items: {
                                    "Move": { name: "Move Group", icon: "fa-external-link-square", callback: this.MoveGroupOrItem.bind(this) }
                                }
                            };
                        }
                    }
                }.bind(this)

            });

            $.contextMenu({
                selector: ".itemform",
                build: function ($trigger, e) {
                    $("body").find("td").removeClass("focus");
                    $("body").find("[role=row]").removeClass("selected");
                    $trigger.closest("[role=row]").addClass("selected");
                    if (this.ItemFormLink !== null) {
                        return {
                            items: {
                                "EditItem": { name: "View Item", icon: "fa-external-link-square", callback: this.FormEditItem.bind(this) },
                                "Move": { name: "Move Item", icon: "fa-external-link-square", callback: this.MoveGroupOrItem.bind(this) }
                            }
                        };
                    }
                    else {
                        return {
                            items: {
                                "Move": { name: "Move Item", icon: "fa-external-link-square", callback: this.MoveGroupOrItem.bind(this) }
                            }
                        };
                    }
                }.bind(this)

            });
        }
        $("#" + this.tableId + " tbody").off("click", ".groupform").on("click", ".groupform", this.collapseTreeGroup);
    };

    this.CreateNewFormLinks = function () {
        $("#obj_icons").append(`<div class="dropdown" style="display:inline-block;" id="NewFormdd${this.tableId}">
                    <button class="btn" type="button" id="NewFormButton${this.tableId}" data-toggle="dropdown" title='Newform'>
                        <i class="fa fa-plus" aria-hidden="true"></i>
                    </button>
                    <div class="dropdown-menu newform-menu">
                        <ul class="drp_ul"></ul>
                    </div>
                    </div>`);
        $.each(this.EbObject.FormLinks.$values, function (i, obj) {
            let url = `../webform/index?_r=${obj.Refid}&_p=""&_m=2&_l=${store.get("Eb_Loc-" + this.TenantId + this.UserId)}`;
            $(`#NewFormdd${this.tableId} .drp_ul`).append(`<li class="drp_item"><a class="dropdown-item" href="${url}" target="_blank">${obj.DisplayName}</a></li>`);
        }.bind(this));
    };

    this.FormNewGroup = function (key, opt, event) {
        this.rowData = this.unformatedData[opt.$trigger.parent().parent().index()];
        let filterparams = btoa(JSON.stringify(this.formatToMutipleParameters(this.treeColumn.GroupFormParameters.$values)));

        if (parseInt(EbEnums.LinkTypeEnum.Popup) === this.treeColumn.LinkType) {
            CallWebFormCollectionRender({ _source: 'tv', _refId: this.GroupFormLink, _params: filterparams, _mode: 2, _locId: ebcontext.locations.getCurrent() });
            //$("#iFrameFormPopupModal").modal("show");
            //let url = `../webform/index?_r=${this.GroupFormLink}&_params=${filterparams}&_mode=12&_locId=${store.get("Eb_Loc-" + this.TenantId + this.UserId)}`;
            //$("#iFrameFormPopup").attr("src", url);
        }
        else {
            var _form = document.createElement("form");
            let url = "../webform/index?_r=" + this.GroupFormLink;
            _form.setAttribute("method", "post");
            _form.setAttribute("action", url);
            _form.setAttribute("target", "_blank");

            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_params";
            input.value = filterparams;
            _form.appendChild(input);

            input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_mode";
            input.value = "2";
            _form.appendChild(input);

            input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_locId";
            input.value = store.get("Eb_Loc-" + this.TenantId + this.UserId);
            _form.appendChild(input);

            document.body.appendChild(_form);
            _form.submit();
            document.body.removeChild(_form);
        }
    };

    this.FormNewItem = function (key, opt, event) {
        this.rowData = this.unformatedData[opt.$trigger.parent().parent().index()];
        let filterparams = btoa(JSON.stringify(this.formatToMutipleParameters(this.treeColumn.ItemFormParameters.$values)));
        if (parseInt(EbEnums.LinkTypeEnum.Popup) === this.treeColumn.LinkType) {
            CallWebFormCollectionRender({ _source: 'tv', _refId: this.ItemFormLink, _params: filterparams, _mode: 2, _locId: ebcontext.locations.getCurrent() });
            //$("#iFrameFormPopupModal").modal("show");
            //let url = `../webform/index?_r=${this.ItemFormLink}&_p=${filterparams}&_m=12&_l=${store.get("Eb_Loc-" + this.TenantId + this.UserId)}`;
            //$("#iFrameFormPopup").attr("src", url);
        }
        else {
            let url = `../WebForm/Index?_r=${this.ItemFormLink}&_p=${filterparams}&_m=2&_l=${ebcontext.locations.getCurrent()}`;
            window.open(url, '_blank');
        }
    };

    this.FormEditGroup = function (key, opt, event) {
        this.rowData = this.unformatedData[opt.$trigger.parent().parent().index()];
        let filterparams = btoa(JSON.stringify(this.formatToParameters(this.treeColumn.GroupFormId.$values)));
        if (parseInt(EbEnums.LinkTypeEnum.Popup) === this.treeColumn.LinkType) {
            CallWebFormCollectionRender({ _source: 'tv', _refId: this.GroupFormLink, _params: filterparams, _mode: 1, _locId: ebcontext.locations.getCurrent() });
            //$("#iFrameFormPopupModal").modal("show");
            //let url = `../webform/index?_r=${this.GroupFormLink}&_p=${filterparams}&_m=11&_l=${store.get("Eb_Loc-" + this.TenantId + this.UserId)}`;
            //$("#iFrameFormPopup").attr("src", url);
        }
        else {
            let url = `../WebForm/Index?_r=${this.GroupFormLink}&_p=${filterparams}&_m=1&_l=${ebcontext.locations.getCurrent()}`;
            window.open(url, '_blank');
        }
    };

    this.FormEditItem = function (key, opt, event) {
        this.rowData = this.unformatedData[opt.$trigger.parent().parent().index()];
        let filterparams = btoa(JSON.stringify(this.formatToParameters(this.treeColumn.ItemFormId.$values)));
        if (parseInt(EbEnums.LinkTypeEnum.Popup) === this.treeColumn.LinkType) {
            CallWebFormCollectionRender({ _source: 'tv', _refId: this.ItemFormLink, _params: filterparams, _mode: 1, _locId: ebcontext.locations.getCurrent() });
            //$("#iFrameFormPopupModal").modal("show");
            //let url = `../webform/index?_r=${this.ItemFormLink}&_p=${filterparams}&_m=11&_l=${store.get("Eb_Loc-" + this.TenantId + this.UserId)}`;
            //$("#iFrameFormPopup").attr("src", url);
        }
        else {
            let url = `../WebForm/Index?_r=${this.ItemFormLink}&_p=${filterparams}&_m=1&_l=${ebcontext.locations.getCurrent()}`;
            window.open(url, '_blank');
        }
    };

    this.formatToParameters = function (cols) {
        var filters = [];
        $.each(cols, function (i, col) {
            if (this.rowData[col.data] !== "")
                filters.push(new fltr_obj(col.Type, col.name, this.rowData[col.data]));
        }.bind(this));
        return filters;
    };

    this.formatToMutipleParameters = function (cols) {
        var filters = [];
        $.each(cols, function (i, col) {
            if (this.rowData[col.data] !== "")
                filters.push(new fltr_obj(col.Type, col.FormControl.Name, this.rowData[col.data]));
        }.bind(this));
        return filters;
    };

    this.collapseTreeGroup = function (e) {
        let el = (e.target).closest("td");
        let curRow = $(el).parents().closest("[role=row]");
        var level = parseInt($(curRow).attr("data-lvl"));
        var isShow = ($(el).children("i").hasClass("fa-minus-square-o")) ? false : true;
        let count = this.RowCount;
        let rows = {};
        for (var i = level; i >= 0; i--) {
            let temp = curRow.nextUntil("[data-lvl=" + i + "]");
            if (temp.length < count) {
                count = temp.length;
                rows = temp;
            }
        }
        if (isShow) {
            rows.show();
            $(el).children("i").removeClass("fa-plus-square-o").addClass("fa-minus-square-o");
            rows.children().find("i.fa-plus-square-o").removeClass("fa-plus-square-o").addClass("fa-minus-square-o");
        }
        else {
            rows.hide();
            $(el).children("i").removeClass("fa-minus-square-o").addClass("fa-plus-square-o");
        }
    }.bind(this);

    this.AppendTreeModal = function () {
        $("#treemodal").remove();
        let modal1 = `<div class="modal fade" id="treemodal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="display: none;">
    <div class="modal-dialog">
        <div class="treemodal-container">
            <h4 class="treemodal-header">Move <span id="itemorgroup"></span></h4>
            <div class="tree_item_cont">
                <label>From </label>
                <span id="movefrom"></span>
            </div>
            <div class="tree_item_cont">
                <label>To</label>
                <button class="btn treemodalul">Select Group
                <span class="caret"></span></button>
            </div>
            <div class="pull-right">
                <button class="btn" id="treemodal_submit">Move</button>
                <button class="btn" id="treemodal_cancel">Cancel</button>
            </div>
        </div>
    </div>
</div>`;

        $("body").prepend(modal1);
    };

    this.MoveGroupOrItem = function (key, opt, event) {
        this.AppendTreeModal();
        let rowindex = this.Api.row(opt.$trigger.parent().closest("[role=row]")).index();
        this.movefromtext = this.unformatedData[rowindex][this.treeColumn.data];
        if (opt.selector === ".itemform")
            $("#itemorgroup").text("Item : " + this.movefromtext);
        else
            $("#itemorgroup").text("Group : " + this.movefromtext);
        this.IdColumnIndex = this.EbObject.Columns.$values.filter(function (obj) { return obj.name === "id"; })[0].data;
        this.movefromId = this.unformatedData[rowindex][this.IdColumnIndex];
        this.Items = {};
        this.createTreeItems___(this.treeData, this.Items);
        this.Items = this.Items.items;
        this.InitTreemodalContextmenu();
        $("#treemodal").modal("show");
        $("#treemodal_submit").off("click").on("click", this.MoveOKClick.bind(this));
        $("#treemodal_cancel").off("click").on("click", this.MoveCancelClick.bind(this));
    };

    this.createTreeItems___ = function (initems, outitems) {
        $.each(initems, function (_in, _out, i, item) {
            let Exist = item.item.filter(function (obj) { return obj === this.movefromtext; }.bind(this));
            if (Exist.length === 0) {
                if (item.isGroup) {
                    this.ulid = item.item[this.treeColumn.data];
                    if (!_out.hasOwnProperty("items"))
                        _out.items = {};
                    _out.items[this.ulid] = { "name": this.ulid, "data-pid": item.item[this.IdColumnIndex] };
                    this.createTreeItems___(item.children, _out.items[this.ulid]);
                }
            }
            else {
                $("#movefrom").text(outitems.name);
            }
        }.bind(this, initems, outitems));
    };

    this.InitTreemodalContextmenu = function () {
        $.contextMenu('destroy', '.treemodalul');
        $.contextMenu({
            selector: '.treemodalul',
            callback: this.MoveDDClick.bind(this),
            className: 'contextmenu-custom__highlight',
            items: this.Items,
            trigger: "left",
            autoHide: true,
            events: {
                show: function (options) {
                    this.clickCounter = 0;
                    return true;
                }.bind(this)
            }
        });
        this.clickCounter = 0;
        $(".contextmenu-custom__highlight .context-menu-submenu").off("click").on("click", this.MoveDDClick.bind(this));
    };

    this.getClickedItem = function (key) {
        $.each(this.Items, function (i, objOuter) {
            if (objOuter.name === key) {
                this.moveToPid = objOuter["data-pid"];
                return false;
            }
            else {
                if (objOuter.hasOwnProperty("items"))
                    this.getRecursivelyGetClickedItem(key, objOuter);
            }
        }.bind(this));
    };

    this.getRecursivelyGetClickedItem = function (key, objOuter) {
        $.each(objOuter.items, function (i, objInner) {
            if (objInner.name === key) {
                this.moveToPid = objInner["data-pid"];
                return false;
            }
            else {
                if (objInner.hasOwnProperty("items"))
                    this.getRecursivelyGetClickedItem(key, objInner);
            }
        }.bind(this));
    };

    this.MoveDDClick = function (key, options) {
        if (this.clickCounter === 0) {
            if (options === undefined)
                key = $(key.currentTarget).children("span").text();
            $("#treemodal .treemodalul").text(key).append('<span class="caret"></span></button>');
            this.getClickedItem(key);
            $(".contextmenu-custom__highlight").hide();
            $(".treemodalul").removeClass("context-menu-active");
            $("#context-menu-layer").remove();
            this.clickCounter++;
        }
    };

    this.MoveOKClick = function () {
        if (this.tableName !== null && this.moveToPid !== null && this.movefromId !== null) {
            let sql = `UPDATE ${this.tableName} SET ${this.treeColumn.ParentColumn.$values[0].name}= ${this.moveToPid}
                        WHERE id=${this.movefromId} `;
            $.ajax({
                type: "POST",
                url: "../DV/ExecuteTreeUpdate",
                data: { sql: sql },
                success: this.UpdateSuccess.bind(this)
            });
        }
        else {
            alert("Select One Group.....");
        }
    };

    this.MoveCancelClick = function () {
        this.clickCounter = 0;
        $("#treemodal").modal("hide");
    };

    this.UpdateSuccess = function () {
        this.$submit.trigger("click");
        $("#treemodal").modal("hide");
        this.clickCounter = 0;
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
        data = data.filter(function (elem, pos) {
            return data.indexOf(elem) === pos;
        });
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
            this.order_info.dir = (cls.indexOf('sorting_asc') > -1) ? 1 : 0;
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
            else if (col.IsCustomColumn) {
                _ls += span;
            }
            else {
                if (col.RenderType === parseInt(gettypefromString("Int32")) || col.RenderType === parseInt(gettypefromString("Decimal")) || col.RenderType === parseInt(gettypefromString("Int64")) || col.RenderType == parseInt(gettypefromString("Double")) || col.RenderType == parseInt(gettypefromString("Numeric"))) {
                    if (parseInt(EbEnums.ControlType.Text) === col.filterControl)
                        _ls += (span + this.getFilterForString(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                    else if (parseInt(EbEnums.ControlType.Date) === col.filterControl)
                        _ls += (span + this.getFilterForDateTime(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                    else
                        _ls += (span + this.getFilterForNumeric(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                }
                else if (col.RenderType === parseInt(gettypefromString("String"))) {
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
                else if (col.RenderType === parseInt(gettypefromString("DateTime")) || col.RenderType === parseInt(gettypefromString("Date"))) {
                    if (parseInt(EbEnums.ControlType.Numeric) === col.filterControl)
                        _ls += (span + this.getFilterForNumeric(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                    else if (parseInt(EbEnums.ControlType.Text) === col.filterControl)
                        _ls += (span + this.getFilterForString(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                    else
                        _ls += (span + this.getFilterForDateTime(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
                }
                else if (col.RenderType === parseInt(gettypefromString("Boolean")) && col.name !== "checkbox")
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
            " <li class='filterli'><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> = </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 6px;'> Equal to</span></li>" +
            " <li class='filterli'><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> < </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 6px;'> Less than</span></li>" +
            " <li class='filterli'><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> > </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 6px;'> Greater than</span></li>" +
            " <li class='filterli'><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> <= </a><span class='filtertext eb_fsel" + this.tableId + "'> Less than or Equal</span></li>" +
            " <li class='filterli'><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> >= </a><span class='filtertext eb_fsel" + this.tableId + "'> Greater than or Equal</span></li>" +
            "<li class='filterli'><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> B </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 6px;'> Between</span></li>" +
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
            " <li class='filterli'><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> = </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 6px;'> Equal to</span></li>" +
            " <li class='filterli'><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> < </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 6px;'> Less than</span></li>" +
            " <li class='filterli'><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> > </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 6px;'> Greater than</span></li>" +
            " <li class='filterli'><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> <= </a><span class='filtertext eb_fsel" + this.tableId + "'> Less than or Equal</span></li>" +
            " <li class='filterli'><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> >= </a><span class='filtertext eb_fsel" + this.tableId + "'> Greater than or Equal</span></li>" +
            " <li class='filterli'><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> B </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 6px;'> Between</span></li>" +
            " </ul>" +
            " </div>" +
            " <input type='text' placeholder='" + this.datePattern + "' data-toggle='tooltip' class='no-spin form-control eb_finput " + htext_class + "' id='" + header_text1 + "' " + data_table + data_colum + coltype + ">" +
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

            "   <li class='filterli'><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> x* </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 5px;'> Starts with</span></li>" +
            "  <li class='filterli'><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> *x </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 5px;'> Ends with</span></li>" +
            "  <li class='filterli'><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> *x* </a><span class='filtertext eb_fsel" + this.tableId + "' > Contains</span></li>" +
            " <li class='filterli'><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "> = </a><span class='filtertext eb_fsel" + this.tableId + "' style='margin-left: 9px;'> Exact match</span></li>" +
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
        let elemnt = ($(e.target).is("a")) ? $(e.target) : $(e.target).siblings("a");
        var selText = $(elemnt).text();
        var table = $(elemnt).attr('data-table');
        var flag = false;
        var colum = $(elemnt).attr('data-colum');
        var ctype = $(elemnt).parents('.input-group').find("input").attr('data-coltyp');
        var dateclas = (ctype === "date") ? "no-spin" : "";
        $(elemnt).parents('.input-group-btn').find('.dropdown-toggle').html(selText);
        if (selText.trim() === 'B') {
            if ($(elemnt).parents('.input-group').find("input").length == 1) {
                if (ctype === "date") {
                    $(elemnt).parents('.input-group').append("<input type='text' placeholder='" + this.datePattern + "' class='" + dateclas + " between-inp form-control eb_finput " + this.tableId + "_htext' id='" + this.tableId + "_" + colum + "_hdr_txt2' data-coltyp='" + ctype + "'>");
                    $("#" + this.tableId + "_" + colum + "_hdr_txt2").datepicker({
                        dateFormat: this.datePattern.replace(new RegExp("M", 'g'), "m").replace(new RegExp("yy", 'g'), "y"),
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
            if ($(elemnt).parents('.input-group').find("input").length == 2) {
                $(elemnt).parents('.input-group').find("input").eq(1).remove();
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
        var dtp = this.datePattern.split("/");
        if (dt.length === 1)
            dt = data.split("-");
        if (dtp.length === 1)
            dtp = this.datePattern.split("-");

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
        let element = ($(e.target).is("a")) ? $(e.target) : $(e.target).siblings("a");
        var selValue = $(element).text().trim();
        $(element).parents('.input-group-btn').find('.dropdown-toggle').html(selValue);
        var table = $(element).attr('data-table');
        var colum = $(element).attr('data-column');
        var decip = $(element).attr('data-decip');
        var col = this.Api.column(colum + ':name');
        var ftrtxt;
        var agginfo = $.grep(this.eb_agginfo, function (obj) { return obj.colname === colum; });
        ftrtxt = '.dataTables_scrollFootInner #' + this.tableId + '_' + colum + '_ftr_txt0';
        if ($(ftrtxt).length === 0)
            ftrtxt = '.DTFC_LeftFootWrapper #' + this.tableId + '_' + colum + '_ftr_txt0';
        if ($(ftrtxt).length === 0)
            ftrtxt = '.DTFC_RightFootWrapper #' + this.tableId + '_' + colum + '_ftr_txt0';

        if (selValue === '∑')
            pageTotal = (typeof this.summary[agginfo[0].data] !== "undefined") ? this.summary[agginfo[0].data][0] : 0;
        else if (selValue === 'x̄')
            pageTotal = (typeof this.summary[agginfo[0].data] !== "undefined") ? this.summary[agginfo[0].data][1] : 0;

        $(ftrtxt).val(pageTotal);
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
            if (row[idpos])
                return "<input type='checkbox' class='" + this.tableId + "_select' name='" + this.tableId + "_id' value='" + row[idpos].toString() + "'/>";
            else
                return "<input type='checkbox' class='" + this.tableId + "_select'/>";
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
        var colindex = -1;
        this.isContextual = true;
        if ($(e.target).closest("a").attr("data-latlong") !== undefined)
            cData = $(e.target).closest("a").attr("data-latlong");
        else if ($(e.target).closest("a").attr("data-inline") !== undefined) {
            cData = $(e.target).closest("a").attr("data-data");
            this.inline = true;
            colindex = parseInt($(e.target).closest("a").attr("data-colindex"));
        }
        else if ($(e.target).closest("a").attr("data-popup") !== undefined) {
            cData = $(e.target).closest("a").attr("data-data");
            this.popup = true;
            colindex = parseInt($(e.target).closest("a").attr("data-colindex"));
        }
        else {
            cData = $(e.target).text();
            colindex = parseInt($(e.target).closest("a").attr("data-colindex"));
        }
        this.linkDV = $(e.target).closest("a").attr("data-link");
        var idx = this.Api.row($(e.target).parents().closest("td")).index();
        if (typeof (idx) !== "undefined")
            this.rowData = this.unformatedData[idx];
        else {//incomplete...
            this.rowData = [];
        }
        var x = this.getStaticParameter(colindex);
        this.filterValuesforForm = [];
        if (parseInt(this.linkDV.split("-")[2]) !== EbObjectTypes.WebForm)
            this.filterValues = this.getFilterValues().concat(this.getfilterFromRowdata()).concat(x);
        else
            this.filterValuesforForm = this.getfilterFromRowdata();

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
        else if (this.popup) {
            this.popup = false;
            CallWebFormCollectionRender({
                _source: 'tv', _refId: this.linkDV,
                _params: btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValuesforForm)))),
                _mode: 1, _locId: ebcontext.locations.getCurrent()
            });
            //$("#iFrameFormPopupModal").modal("show");
            //let url = `../webform/index?_r=${this.linkDV}&_p=${btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValuesforForm))))}&_m=1${this.dvformMode}&_l=${store.get("Eb_Loc-" + this.TenantId + this.UserId)}`;
            //$("#iFrameFormPopup").attr("src", url);
        }
        else {
            if (this.login === "uc")
                dvcontainerObj.drawdvFromTable(btoa(unescape(encodeURIComponent(JSON.stringify(this.rowData)))), btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValues)))), btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValuesforForm)))), cData.toString(), this.dvformMode);//, JSON.stringify(this.filterValues)
            else
                this.OpeninNewTab(idx, cData);
        }
        //this.filterValues = [];
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
            $(rows).eq(idx).after("<tr class='containerrow' id='containerrow" + colindex + "'>" + str + "<td colspan='" + colspan + "'><div class='inlinetable '><div class='close' type='button' title='Close'>x</div><div class='Obj_title' id='objName" + idx + "'>" + Dvobj.DisplayName + "</div><table id='tbl" + idx + "' class='table display table-bordered compact'></table></td></tr></div>");

            var o = new Object();
            o.tableId = "tbl" + idx;
            o.showFilterRow = false;
            o.showSerialColumn = true;
            o.showCheckboxColumn = false;
            o.source = "inline";
            o.scrollHeight = "200px";
            o.dvObject = Dvobj;
            o.data = result;
            o.keys = false;
            this.datatable = new EbBasicDataTable(o);
            if (this.EbObject.DisableRowGrouping || this.EbObject.RowGroupCollection.$values.length === 0)
                $(".inlinetable").css("width", $(window).width() - 115);
            else
                $(".inlinetable").css("width", $(window).width() - 175);
            this.datatable.Api.columns.adjust();
        }
        else {
            $(rows).eq(idx).after("<tr class='containerrow' id='containerrow" + colindex + "'>" + str + "<td colspan='" + colspan + "'><div class='inlinetable'><div class='close' type='button' title='Close'>x</div><div class='Obj_title' id='objName" + idx + "'>" + Dvobj.DisplayName + "</div><div id='canvasDivchart" + idx + "' ></div></td></tr></div>");
            var o = new Object();
            o.tableId = "chart" + idx;
            o.dvObject = Dvobj;
            o.data = result.data;
            this.chartApi = new EbBasicChart(o);
            $(".inlinetable").css("height", "380px");
            $("#canvasDivchart" + idx).css("width", $(window).width() - 100);
            $("#canvasDivchart" + idx).css("height", "inherit");
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

    this.getStaticParameter = function (index) {
        var temp = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.data == index });
        var array = [];
        if (temp[0].StaticParameters.$values.length > 0) {
            $.each(temp[0].StaticParameters.$values, function (i, obj) {
                array.push(new fltr_obj(obj.Type, obj.Name, obj.Value));
            });
        }
        return array;
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
        //var ob = new Object();
        //ob.DataVizObjString = JSON.stringify(this.EbObject);
        //ob.Params = this.filterValues;
        //ob.TFilters = this.columnSearch;
        //this.ss = new EbServerEvents({ ServerEventUrl: 'https://se.eb-test.site', Channels: ["ExportToExcel"] });
        //this.ss.onExcelExportSuccess = function (url) {
        //    window.location.href = url;
        //};
        //$.ajax({
        //    type: "POST",
        //    url: "../DV/exportToexcel",
        //    data: { req: ob }
        //});

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
        let chartapi = eb_chart(chartobj.DataSourceRefId, null, null, chartobj, null, this.tabNum, this.ssurl, this.login, this.counter, this.MainData, btoa(JSON.stringify(this.rowData)), btoa(JSON.stringify(this.filterValues)), this.cellData, this.propGrid);
    };

    this.openColumnTooltip = function (e, i) {
        //$(e.currentTarget).siblings(".popover").find(".popover-content").empty().append(atob($(e.currentTarget).attr("data-contents")));
        //$(e.currentTarget).siblings(".popover").find(".arrow").remove();
    };

    this.collapseFilter = function () {
        this.filterBox.toggle();
        if (this.filterBox.css("display") == "none") {
            $("#btnCollapse" + this.tableId).children().remove();
            $("#btnCollapse" + this.tableId).append("<i class='fa fa-chevron-down' aria-hidden='true'></i>");
        }
        else {
            $("#btnCollapse" + this.tableId).children().remove();
            $("#btnCollapse" + this.tableId).append("<i class='fa fa-chevron-up' aria-hidden='true'></i>");
        }
    };


    this.updateRenderFunc = function () {
        $.each(this.ebSettings.Columns.$values, this.updateRenderFunc_Inner.bind(this));
    };

    this.updateRenderFunc_Inner = function (i, col) {
        this.ebSettings.Columns.$values[i].sClass = "";
        this.ebSettings.Columns.$values[i].className = "";

        if (col.RenderType === parseInt(gettypefromString("Int32")) || col.RenderType == parseInt(gettypefromString("Decimal")) || col.RenderType == parseInt(gettypefromString("Int64")) || col.RenderType == parseInt(gettypefromString("Numeric"))) {

            if (this.ebSettings.Columns.$values[i].Align.toString() === EbEnums.Align.Auto)
                this.ebSettings.Columns.$values[i].className += " tdheight dt-right";
        }
        if (col.RenderType === parseInt(gettypefromString("Boolean"))) {
            if (this.ebSettings.Columns.$values[i].name === "eb_void" || this.ebSettings.Columns.$values[i].name === "sys_cancelled") {
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
            if (this.ebSettings.Columns.$values[i].Align.toString() === EbEnums.Align.Auto)
                this.ebSettings.Columns.$values[i].className += " tdheight text-center";
        }
        if (col.RenderType === parseInt(gettypefromString("String")) || col.RenderType == parseInt(gettypefromString("Double"))) {
            if (this.ebSettings.Columns.$values[i].RenderAs.toString() === EbEnums.StringRenderType.Chart) {
                this.ebSettings.Columns.$values[i].render = this.lineGraphDiv.bind(this);
                this.ebSettings.Columns.$values[i].mRender = this.lineGraphDiv.bind(this);
            }
            else if (this.ebSettings.Columns.$values[i].RenderAs.toString() === EbEnums.StringRenderType.Image) {
                this.ebSettings.Columns.$values[i].render = this.renderFBImage.bind(this);
                this.ebSettings.Columns.$values[i].mRender = this.renderFBImage.bind(this);
            }
            else if (this.ebSettings.Columns.$values[i].RenderAs.toString() === EbEnums.StringRenderType.Icon) {
                this.ebSettings.Columns.$values[i].render = this.renderIconCol.bind(this);
                this.ebSettings.Columns.$values[i].mRender = this.renderIconCol.bind(this);
            }

            if (this.ebSettings.Columns.$values[i].Align.toString() === EbEnums.Align.Auto)
                this.ebSettings.Columns.$values[i].className += " tdheight dt-left";
        }
        if (col.RenderType === parseInt(gettypefromString("Date")) || col.RenderType == parseInt(gettypefromString("DateTime"))) {
            if (this.ebSettings.Columns.$values[i].Align.toString() === EbEnums.Align.Auto)
                this.ebSettings.Columns.$values[i].className += " tdheight dt-left";
        }
        if (col.name === "eb_created_by" || col.name === "eb_lastmodified_by")
            col.className += " dt-left";
        if (col.Font !== null) {
            var style = document.createElement('style');
            style.type = 'text/css';
            var array = [this.tableId, col.name, col.Font.FontName, col.Font.Size, col.Font.color.replace("#", "")];
            if ($("." + array.join("_")).length === 0) {
                style.innerHTML = "." + array.join("_") + "{font-family: " + col.Font.FontName + "!important; font-size: " + col.Font.Size + "px!important; color: " + col.Font.color + "!important; }";
                document.getElementsByTagName('body')[0].appendChild(style);
            }
            this.ebSettings.Columns.$values[i].className = array.join("_");
            this.ebSettings.Columns.$values[i].sClass = array.join("_");
        }

        if (this.ebSettings.Columns.$values[i].Align.toString() === EbEnums.Align.Left)
            this.ebSettings.Columns.$values[i].className += " tdheight dt-left";
        else if (this.ebSettings.Columns.$values[i].Align.toString() === EbEnums.Align.Right)
            this.ebSettings.Columns.$values[i].className += " tdheight dt-right";
        else if (this.ebSettings.Columns.$values[i].Align.toString() === EbEnums.Align.Center)
            this.ebSettings.Columns.$values[i].className += " tdheight text-center";

        this.ebSettings.Columns.$values[i].sClass = this.ebSettings.Columns.$values[i].className;
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

    this.renderIconCol = function (data, type, row, meta) {
        if (meta.settings.aoColumns[meta.col].TrueValue.toLowerCase() === data.toLowerCase())
            return "<i class='fa fa-check' aria-hidden='true'  style='color:green'></i>";
        else if (meta.settings.aoColumns[meta.col].FalseValue.toLowerCase() === data.toLowerCase())
            return "<i class='fa fa-times' aria-hidden='true' style='color:red'></i>";
        else
            return data;
    };

    this.renderEbVoidCol = function (data) {
        return (data === "T" ) ? "<i class='fa fa-ban' aria-hidden='true'></i>" : "";
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
        //if (typeof (data) === "string")
        //    return `<img class='img-thumbnail' src='http://graph.facebook.com/${data}/picture?type=square' style="height: 20px;width: 25px;"/>`;
        //else
        //    return `<img class='img-thumbnail' src='http://graph.facebook.com/12345678/picture?type=square' style="height: 20px;width: 25px;"/>`;
        
        return `<img class='img-thumbnail columnimage' src='/images/small/${data}.jpg'/>`;
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

var ConditionalFormat = function () {
    this.getModal = function () {
        let modal1 = `
            <div class="modal fade" id="treemodal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="display: none;">
                <div class="modal-dialog">
                    <div class="treemodal-container">
                        <h4 class="treemodal-header">Conditional Rendering</span></h4>
                        <div class="tree_item_cont">
                            <label>From </label>
                            <span id="movefrom"></span>
                        </div>
                        <div class="tree_item_cont">
                            <label>To</label>
                            <button class="btn treemodalul">Select Group
                            <span class="caret"></span></button>
                        </div>
                        <div class="pull-right">
                            <button class="btn" id="treemodal_submit">Move</button>
                            <button class="btn" id="treemodal_cancel">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>`;
        $("body").append(modal1);
    };

    this.getModal();
};


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

