var EbCommonDataTable = function (Option) {

    //let AllMetas = AllMetasRoot["EbDataVisualizationObject"];// newly added line to declare a local variable named "AllMetas"  which contains contextaul metas

    this.propGrid = Option.PGobj;
    this.Api = null;
    this.order_info = new Object();
    this.order_info.col = '';
    this.order_info.dir = 0;
    this.MainData = Option.data || null;
    this.isPipped = false;
    this.isContextual = false;
    this.chartJs = null;
    this.url = Option.url;
    this.EbObject = Option.dvObject;
    this.showFilterRow = typeof Option.showFilterRow !== 'undefined' ? Option.showFilterRow : true;
    this.showSerialColumn = typeof Option.showSerialColumn !== 'undefined' ? Option.showSerialColumn : true;
    this.showCheckboxColumn = typeof Option.showCheckboxColumn !== 'undefined' ? Option.showCheckboxColumn : true;
    this.hiddenFieldName = Option.hiddenFieldName || "id";
    this.tabNum = Option.tabNum;
    this.Refid = Option.refid;
    this.tableId = Option.tableId || null;
    this.ssurl = Option.ssurl;
    this.login = Option.login;
    this.counter = Option.counter;
    this.datePattern = Option.datePattern || "dd-MM-yyyy";
    this.TenantId = Option.TenantId;
    this.UserId = Option.UserId;
    this.relatedObjects = null;
    this.FD = false;
    this.table_jQO = null;
    this.filterBox = null;
    this.filterbtn = null;
    this.clearfilterbtn = null;
    this.totalpagebtn = null;
    this.copybtn = null;
    this.printbtn = null;
    this.settingsbtn = null;
    this.OuterModalDiv = null;
    this.settings_tbl = null;

    this.eb_filter_controls_4fc = [];
    this.eb_filter_controls_4sb = [];
    this.zindex = 0;
    this.rowId = -1;
    this.dropdown_colname = null;
    this.deleted_colname = null;
    this.tempcolext = [];
    this.linkDV = null;
    this.filterFlag = false;
    this.rowData = Option.rowData ? JSON.parse(decodeURIComponent(escape(window.atob(Option.rowData)))) : null;
    this.filterValues = Option.filterValues ? JSON.parse(decodeURIComponent(escape(window.atob(Option.filterValues)))) : [];
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
    this.Source = Option.Source || "EbDataTable";
    this.columns = Option.columns || ((this.EbObject) ? this.EbObject.Columns.$values : null);
    this.contId = Option.containerId;
    this.scrollHeight = Option.scrollHeight || "inherit";
    this.IsPaging = typeof Option.IsPaging !== 'undefined' ? Option.IsPaging : true;
    this.LeftFixedColumn = Option.LeftFixedColumn || 0;
    this.RightFixedColumn = Option.RightFixedColumn || 0;
    this.RowHeight = Option.RowHeight || "15";
    this.ObjectLinks = Option.ObjectLinks || [];
    this.AllowSelect = typeof Option.AllowSelect !== 'undefined' ? Option.AllowSelect : true;
    this.AllowSorting = typeof Option.AllowSorting !== 'undefined' ? Option.AllowSorting : true;


    if (this.Source === "EbDataTable") {
        this.split = new splitWindow("parent-div0", "contBox");

        this.split.windowOnFocus = function (ev) {
            $("#Relateddiv").hide();
            if ($(ev.target).attr("class") !== undefined) {
                if ($(ev.target).attr("class").indexOf("sub-windows") !== -1) {
                    var id = $(ev.target).attr("id");
                    focusedId = id;
                }
            }
        }.bind(this);

        this.init = function () {
            this.tableId = "dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter;
            this.ContextId = "filterWindow_" + this.tableId;
            this.FDCont = $(`<div id='${this.ContextId}' class='filterCont fd'></div>`);
            $("#parent-div0").before(this.FDCont);
            $(".filterCont").hide();
        };
    }


    this.call2FD = function (value) {
        if (this.Source === "EbDataTable") {
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
        }
        else {
            if (this.columns === null) {
                $.ajax({
                    type: "POST",
                    url: "../boti/dvView1",
                    data: { dvobj: JSON.stringify(this.EbObject) },
                    success: this.ajaxSucc.bind(this)
                });
            }
        }
    };

    this.ajaxSucc = function (text) {
        if (this.Source === "EbDataTable") {
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
            $("#obj_icons").empty();
            this.$submit = $("<button id='" + this.submitId + "' class='btn commonControl'><i class='fa fa-play' aria-hidden='true'></i></button>");
            $("#obj_icons").append(this.$submit);
            this.$submit.click(this.getColumnsSuccess.bind(this));

            this.FDCont = $("#filterWindow_" + this.tableId);
            $("#filterWindow_" + this.tableId).empty();
            $("#filterWindow_" + this.tableId).append("<div class='pgHead'> Param window <div class='icon-cont  pull-right' id='close_paramdiv_" + this.tableId + "'><i class='fa fa-thumb-tack' style='transform: rotate(90deg);'></i></div></div>");//

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
                $(".filterCont").hide();
                $("#eb_common_loader").EbLoader("hide");
                this.$submit.trigger("click");
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
                    if (!this.FilterDialog.FormObj.AutoRun)
                        this.$submit.trigger("click");
                }
                else {
                    this.FDCont.show();
                }
                $("#eb_common_loader").EbLoader("hide");
            }
            $(subDivId).focus();

            this.PcFlag = false;

            if (this.propGrid !== null) {
                this.propGrid.PropertyChanged = this.tmpPropertyChanged;
                this.CreatePgButton();
            }
        }
        else {
            if (this.MainData !== null)
                this.isPipped = true;
            $("#" + this.contId).append(text);////////////////        
            this.EbObject = dvGlobal.Current_obj;
            this.getColumnsSuccess();
        }
        this.FDCont.css("right", "0");
    }.bind(this);

    this.GetFD = function () {
        $("#eb_common_loader").EbLoader("show");
        this.RemoveColumnRef();
        this.FilterDialogRefId = this.EbObject.FilterDialogRefId;
        if (this.FilterDialogRefId !== "" && this.FilterDialogRefId)
            $.post("../dv/GetFilterBody", { dvobj: JSON.stringify(this.EbObject), contextId: "paramdiv" + this.tabNum }, this.ajaxSucc.bind(this));
    };

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
        this.FDCont.toggle('drop', { direction: 'right' }, 150);
        if (this.FDCont.is(":visible"))
            $(".ppcont").hide();
    };

    this.tmpPropertyChanged = function (obj, Pname, newval, oldval) {
        //this.isSecondTime = true;
        if (Pname === "Name") {
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
    this.start4EbDataTable = function () {
        if (this.EbObject === null) {
            this.EbObject = new EbObjects["EbTableVisualization"]("Container_" + Date.now());
            this.split.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter, "EbTableVisualization");
        }
        else {
            if (this.MainData !== null)
                this.split.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter, "EbTableVisualization", prevfocusedId);
            else
                this.split.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter, "EbTableVisualization");
        }

        $("#objname").text(this.EbObject.DisplayName);
        this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
        this.init();
        if (this.EbObject.DataSourceRefId) {
            this.call2FD();
            this.EbObject.IsPaging = this.IsPaging;
        }
        else {
            this.EbObject.IsPaging = this.IsPaging = false;
            if (this.EbObject.IsDataFromApi && this.EbObject.FilterDialogRefId)
                this.GetFD();
            else
                this.getColumnsSuccess();
        }
    };

    this.start4Other = function () {
        if (!this.EbObject)
            this.EbObject = new EbObjects["EbTableVisualization"]("Container_" + Date.now());
        if (this.columns === null)
            this.call2FD();
        else {
            this.EbObject.Columns.$values = this.columns;
        }
        if (this.MainData !== null)
            this.isPipped = true;
        this.EbObject.IsPaging = this.IsPaging;
        this.getColumnsSuccess();
    };

    this.getColumnsSuccess = function (e) {
        $("#eb_common_loader").EbLoader("show");
        if (this.Source === "EbDataTable")
            this.Do4EbdataTable();
        else if (this.Source === "Calendar") {
            $("#" + this.contId).empty();
            $("#" + this.contId).append(`<table id="${this.tableId}" class="table display table-bordered compact"></table>`);
            this.EbObject.LeftFixedColumn = this.LeftFixedColumn;
            this.EbObject.RightFixedColumn = 0;
            this.EbObject.RowHeight = this.RowHeight;
            this.MainData = null;
        }
        else if (this.Source === "datagrid") {
            this.EbObject.LeftFixedColumn = this.LeftFixedColumn;
            this.EbObject.RightFixedColumn = this.RightFixedColumn;
        }
        else if (this.Source === "WebForm") {
            this.MainData = null;
        }
        this.getNotvisibleColumns();
        this.initCompleteflag = false;
        this.extraCol = [];
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
        if (rowG_coll.length > 0 && !this.EbObject.DisableRowGrouping) {
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
        if (this.EbObject.$type.indexOf("EbTableVisualization") !== -1) {
            $("#content_" + this.tableId).empty();
            $("#content_" + this.tableId).append("<div id='" + this.tableId + "divcont' class='wrapper-cont_inner'><table id='" + this.tableId + "' class='table display table-bordered compact'></table></div>");

        }
        this.Init();
    };

    this.getNotvisibleColumns = function () {
        if (this.EbObject.NotVisibleColumns.$values.length === 0)
            this.EbObject.NotVisibleColumns.$values = this.EbObject.Columns.$values.filter((obj) => !obj.bVisible);
    };

    this.Do4EbdataTable = function () {
        $("#objname").text(this.EbObject.DisplayName);
        if (this.isSecondTime)
            this.MainData = null;
        $(".ppcont").hide();
        $(".filterCont").hide();
        if (this.FilterDialog) {
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
        }
        this.isSecondTime = false;
        if (this.login === "uc")
            $(".dv-body1").show();
        $.extend(this.tempColumns, this.EbObject.Columns.$values);
        //this.tempColumns.sort(this.ColumnsComparer);
        this.dsid = this.EbObject.DataSourceRefId;//not sure..
        this.dvName = this.EbObject.Name;
    };

    this.check4Customcolumn = function () {
        var temp = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.IsCustomColumn; });
        if (temp.length === 0)
            this.isCustomColumnExist = false;
        else {
            this.isCustomColumnExist = true;
            temp.forEach(function (x) {
                if (x.$type.indexOf("DVPhoneColumn") !== -1)
                    x.orderable = true;
                else
                    x.orderable = false;
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
            this.treeColumnIndex = (this.Source === "locationTree") ? 0 : this.EbObject.Columns.$values.findIndex(x => x.data === this.treeColumn.data);
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
        //$.event.props.push('dataTransfer');
        //this.Eb_DataTable_StyleFn();
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

        if (this.Source === "datagrid")
            this.table_jQO.off('draw.dt').on('draw.dt', this.doSerial.bind(this));

        this.Api = this.table_jQO.DataTable(this.createTblObject());

        this.Api.off('select').on('select', this.selectCallbackFunc.bind(this));

        this.Api.off('key-focus').on('key-focus', this.DTKeyFocusCallback.bind(this));

        $('#' + this.tableId + ' tbody').off('dblclick').on('dblclick', 'tr', this.dblclickCallbackFunc.bind(this));
        //$('#' + this.tableId + ' tbody').off('click').on('click', 'td', this.DTclickTDCallbackFunc.bind(this));

        jQuery.fn.dataTable.Api.register('sum()', function () {
            return this.flatten().reduce(function (a, b) {
                if (typeof a === 'string') {
                    a = a.replace(/[^\d.-]/g, '') * 1;
                    if (isNaN(a))
                        a = 0;
                }
                if (typeof b === 'string') {
                    b = b.replace(/[^\d.-]/g, '') * 1;
                    if (isNaN(b))
                        b = 0;
                }

                return a + b;
            }, 0);
        });

        jQuery.fn.dataTable.Api.register('average()', function () {
            var data = this.flatten();
            var sum = data.reduce(function (a, b) {
                if (typeof a === 'string') {
                    a = a.replace(/[^\d.-]/g, '') * 1;
                    if (isNaN(a))
                        a = 0;
                }
                if (typeof b === 'string') {
                    b = b.replace(/[^\d.-]/g, '') * 1;
                    if (isNaN(b))
                        b = 0;
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

        //this.table_jQO.on('length.dt', function (e, settings, len) {
        //    console.log('New page length: ' + len);
        //});

        $.fn.dataTable.ext.errMode = function (settings, helpPage, message) {
            console.log("ajax erpttt......" + message);
            EbPopBox("show", { Message: message, Title: "Error" });
        };

        //$('#' + this.tableId + ' tbody').off('click').on('click', 'tr', this.rowclick.bind(this));
        //$('#' + this.tableId + ' tbody').off('mouseenter').on('mouseenter mouseleave', 'tr', this.mouseenter.bind(this));

        //this.Api.on('row-reorder', function (e, diff, edit) {
        //});
    };

    this.addSerialAndCheckboxColumns = function () {
        this.CheckforColumnID();//, 
        var serialObj = new Object();
        serialObj.data = (this.Source === "datagrid") ? null : this.EbObject.Columns.$values.length;
        serialObj.searchable = false;
        serialObj.orderable = false;
        serialObj.bVisible = this.showSerialColumn;
        serialObj.name = "serial";
        serialObj.title = "#";
        serialObj.Type = 11;
        serialObj.sWidth = "10px";
        if (this.IsTree) {
            serialObj.bVisible = false;
        }
        this.extraCol.push(serialObj);
        this.addcheckbox();
    }

    this.CheckforColumnID = function () {
        this.FlagPresentId = false;
        $.each(this.EbObject.Columns.$values, function (i, col) {
            if (col.name === this.hiddenFieldName.toLocaleLowerCase()) {
                this.FlagPresentId = true;
                col.bVisible = false;
                return false;
            }
        }.bind(this));
    };

    this.addcheckbox = function () {
        var chkObj = new Object();
        //chkObj.data = this.EbObject.Columns.$values.length;
        chkObj.title = "<input id='{0}_select-all' class='eb_selall" + this.tableId + "' type='checkbox' data-table='{0}'/>".replace("{0}", this.tableId);
        chkObj.sWidth = "10px";
        chkObj.orderable = false;
        chkObj.bVisible = (this.showCheckboxColumn) ? true : false;
        chkObj.name = "checkbox";
        chkObj.Type = 3;
        chkObj.render = this.renderCheckBoxCol.bind(this);
        chkObj.pos = "-1";

        this.extraCol.push(chkObj);
        var _array = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.name.toLocaleLowerCase() === this.hiddenFieldName.toLocaleLowerCase(); }.bind(this));
        if (_array.length > 0)
            this.hiddenIndex = _array[0].data;
    }

    this.createTblObject = function () {
        var o = new Object();
        o.scrollY = this.scrollHeight;
        o.scrollX = true;
        //o.scrollXInner = "110%";
        o.scrollCollapse = true;
        if (this.Source === "EbDataTable") {
            if (this.EbObject.PageLength !== 0) {
                o.lengthMenu = this.generateLengthMenu();
            }
        }
        if (this.EbObject.LeftFixedColumn > 0 || this.EbObject.RightFixedColumn > 0)
            o.fixedColumns = { leftColumns: this.fixedColumnCount(), rightColumns: this.EbObject.RightFixedColumn };
        o.pagingType = "full";
        o.buttons = ['copy', 'csv', 'excel', 'pdf', 'print', { extend: 'print', exportOptions: { modifier: { selected: true } } }];
        o.bAutoWidth = false;
        o.autowidth = false;
        o.serverSide = (this.MainData === null) ? true : false;
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
        o.columns = this.rowgroupCols.concat(this.extraCol, this.EbObject.Columns.$values);
        if (this.AllowSorting)
            o.order = [];
        else
            o.ordering = false;
        o.deferRender = true;
        //o.filter = true;
        //o.select = this.AllowSelect;
        //o.retrieve = true;
        o.keys = true;
        //this.filterValues = this.getFilterValues();
        //filterChanged = false;
        //if (!this.isTagged)
        //    this.compareFilterValues();
        //else
        //    filterChanged = true;
        //o.rowReorder = this.IsTree;
        if (this.MainData !== null && this.isPipped) {
            if (this.Source === "EbDataTable") {
                o.dom = "<'col-md-10 noPadding'><'col-md-2 noPadding'f>rt";
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
                if (this.Source === "Calendar") {
                    o.dom = "<'col-md-12 noPadding display-none'><'col-md-12 info-search-cont'i>rt";
                    o.language.info = "_START_ - _END_ / _TOTAL_ Entries";
                }
                else {
                    o.dom = "<'col-md-12 noPadding display_none'>rt";
                }
                o.paging = false;
                o.data = this.receiveAjaxData(this.MainData);
            }
        }
        else {
            if (this.Source === "EbDataTable")
                o.dom = "<'pagination-wrapper'lip>rt";
            else
                o.dom = "<'pagination-wrapper'lip>rt";
            o.paging = this.EbObject.IsPaging;
            o.lengthChange = true;
            if (!this.EbObject.IsPaging) {
                if (this.IsTree || this.EbObject.IsDataFromApi) {
                    o.dom = "<'col-md-12 noPadding display-none'><'col-md-12 info-search-cont'i>rt";
                    o.language.info = "_START_ - _END_ / _TOTAL_ Entries";
                }
                else {
                    o.dom = "<'col-md-12 noPadding display-none'>rt";
                }
                o.paging = false;
                o.lengthChange = false;
            }
            if (this.login === "uc") {
                if (dvcontainerObj)
                    dvcontainerObj.currentObj.Pippedfrom = "";
                $("#Pipped").text("");
                this.isPipped = false;
            }

            try {
                let url = "../dv/getData";
                if (this.Source === "Bot") {
                    url = "../boti/getData";
                }
                o.ajax = {
                    //url: this.ssurl + '/ds/data/' + this.dsid,
                    url: url,
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
        o.headerCallback = this.headerCallback.bind(this);
        //o.fnDblclickCallbackFunc = this.dblclickCallbackFunc.bind(this);
        return o;
    };

    this.generateLengthMenu = function () {
        var ia = [];
        for (var i = 0; i < 5; i++)
            ia[i] = (this.EbObject.PageLength * (i + 1));
        return JSON.parse("[ [{0},-1], [{0},\"All\"] ]".replace(/\{0\}/g, ia.join(',')));
    };

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
        if (this.EbObject.IsDataFromApi)
            this.ModifyRequestParams();
        else
            dq.Params = this.filterValues;

        dq.OrderBy = this.getOrderByInfo();
        if (this.columnSearch.length > 0) {
            this.filterFlag = true;
        }
        dq.Ispaging = this.EbObject.IsPaging;
        //if (dq.length === -1)
        //    dq.length = this.RowCount;
        this.RemoveColumnRef();
        dq.DataVizObjString = JSON.stringify(this.EbObject);
        if (this.CurrentRowGroup !== null)
            dq.CurrentRowGroup = JSON.stringify(this.CurrentRowGroup);
        dq.dvRefId = this.Refid;
        dq.TableId = this.tableId;
        return dq;
    };

    this.ModifyRequestParams = function () {
        let xx = this.EbObject.Parameters.$values.map(function (row) {
            return { Name: row.Name, Value: row.Value, Type: row.Type };
        });

        this.EbObject.ParamsList.$values = this.filterValues.concat(xx);
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

        let temp = $.grep(fltr_collection, function (obj) { return obj.Name === "eb_loc_id"; });
        if (temp.length === 0) {
            if (this.Source === "Bot")
                fltr_collection.push(new fltr_obj(11, "eb_loc_id", 1)); // hard coding temp for bot
            else
                fltr_collection.push(new fltr_obj(11, "eb_loc_id", store.get("Eb_Loc-" + ebcontext.sid + ebcontext.user.UserId)));
        }
        temp = $.grep(fltr_collection, function (obj) { return obj.Name === "eb_currentuser_id"; });
        if (temp.length === 0)
            fltr_collection.push(new fltr_obj(11, "eb_currentuser_id", ebcontext.user.UserId));
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
                let type = this.EbObject.Columns.$values[i].Type;
                //if (type === 5 || type === 6)
                //    data = this.renderDateformat(data, "-");
                if (data !== "")
                    fltr_collection.push(new fltr_obj(type, this.EbObject.Columns.$values[i].name, data));
            }
            else {
                if (dvcontainerObj.dvcol[prevfocusedId].Api !== null) {
                    let type = dvcontainerObj.dvcol[prevfocusedId].EbObject.Columns.$values[i].Type;
                    fltr_collection.push(new fltr_obj(type, dvcontainerObj.dvcol[prevfocusedId].EbObject.Columns.$values[i].name, data));
                }
            }
        }
    };

    getFilterForLinkfromColumn = function () {
        this.linkfromcolumn = false;
        this.dvformMode = 1; let filters = [];
        var temp = $.grep(this.EbObject.Columns.$values, function (obj) { obj.name === this.linkDVColumn; }.bind(this))[0];
        filters.push(new fltr_obj(temp.IdColumn.Type, temp.IdColumn.name, this.rowData[temp.IdColumn.data]));
        return filters;
    };

    this.getfilterFromRowdata = function () {
        var filters = [];
        if (parseInt(this.linkDV.split("-")[2]) !== EbObjectTypes.WebForm) {
            filters = this.FilterfromRow();
        }
        else {
            var temp = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.LinkRefId === this.linkDV && obj.name === this.linkDVColumn; }.bind(this));
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
                        filters.push(new fltr_obj(col.Type, col.FormControl.Name, this.rowData[col.data]));
                }.bind(this));
            }
        }
        return filters;
    };

    this.FilterfromRow = function () {
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
                o.title = $($(ctrl).children()[0]).text();
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
                let colObj = getObjByval(this.EbObject.Columns.$values, "name", search.Column);
                o.title = colObj.sTitle;
                o.name = colObj.name;
                o.operator = search.Operator;
                var searchobj = $.grep(this.columnSearch, function (ob) { return ob.Column === search.Column; });
                if (searchobj.length === 1) {
                    if (search.Value.toString().includes("|")) {
                        $.each(search.Value.split("|"), function (j, val) {
                            if (val.trim() !== "") {
                                var o = new displayFilter();
                                o.title = colObj.sTitle;
                                o.name = colObj.name;
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
        var searchObj = $.grep(this.columnSearch, function (ob) { return ob.Column.toLowerCase() === obj.name.toLowerCase(); });
        var index = this.columnSearch.findIndex(x => x.Column.toLowerCase() === obj.name.toLowerCase());
        if (searchObj.length === 1) {
            if (searchObj[0].Value.includes("|")) {
                var val = "";
                if (this.columnSearch[index].Value.includes(obj.value + "|"))
                    val = this.columnSearch[index].Value.replace(obj.value + "|", "");
                else
                    val = this.columnSearch[index].Value.replace("|" + obj.value, "");
                if (val.trim() !== "")
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
        if (dd.responseStatus) {
            if (dd.responseStatus.message !== null) {
                EbPopBox("show", { Message: dd.responseStatus.message, Title: "Error" });
            }
        }
        this.isRun = true;
        if (this.login === "uc" && this.Source === "EbDataTable") {
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
        this.ImageArray = dd.imageList ? JSON.parse(dd.imageList) : [];
        return dd.formattedData || this.unformatedData;
    };

    this.fixedColumnCount = function () {
        var count = this.EbObject.LeftFixedColumn;
        var visCount = 0;
        if (count > 1) {
            $.each(this.EbObject.Columns.$values, function (i, col) {
                if (!col.bVisible) {
                    if (this.EbObject.LeftFixedColumn > visCount)
                        count++;
                    else
                        return false;
                }
                else
                    visCount++;
            }.bind(this));
        }
        if (this.extraCol.length === 2)
            return count + 1;
        else
            return count;
    };

    this.ColumnsComparer = function (a, b) {
        if (a.data < b.data) return -1;
        if (a.data > b.data) return 1;
        if (a.data === b.data) return 0;
    };

    this.getAgginfo = function () {
        var _ls = [];
        $.each(this.EbObject.Columns.$values, this.getAgginfo_inner.bind(this, _ls));
        return _ls;
    };

    this.getAgginfo_inner = function (_ls, i, col) {
        if (col.bVisible && (col.RenderType == parseInt(gettypefromString("Int32")) || col.RenderType == parseInt(gettypefromString("Decimal")) || col.RenderType == parseInt(gettypefromString("Int64")) || col.RenderType == parseInt(gettypefromString("Double")) || col.RenderType == parseInt(gettypefromString("Numeric"))) && col.name !== "serial") {
            _ls.push(new Agginfo(col.name, this.EbObject.Columns.$values[i].DecimalPlaces, col.data));
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
        $.each(this.EbObject.Columns.$values, function (i, col) {
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
                let colobj = api.settings().init().aoColumns[i];
                let paracolum = colobj.name;
                if (colobj.$type && colobj.$type.indexOf("DVPhoneColumn") !== -1)
                    paracolum = colobj.MappingColumn.name;

                if (paracolum !== 'checkbox' && paracolum !== 'serial' && colobj.bVisible) {
                    var oper;
                    var val1, val2;
                    var textid = '#' + table + '_' + colobj.name + '_hdr_txt1';
                    //var type = $(textid).attr('data-coltyp');
                    var type = colobj.Type;
                    var Rtype = colobj.RenderType;
                    if (Rtype === 3) {
                        var obj = this.EbObject.Columns.$values.find(x => x.name === paracolum);
                        val1 = ($(textid).is(':checked')) ? obj.TrueValue : obj.FalseValue;
                        if (!($(textid).is(':indeterminate')))
                            filter_obj_arr.push(new filter_obj(paracolum, "=", val1, type));
                    }
                    else {
                        oper = $('#' + table + '_' + colobj.name + '_hdr_sel').text().trim();
                        if (api.columns(i).visible()[0]) {
                            if (oper !== '' && $(textid).val() !== '') {
                                if (oper === 'B') {
                                    val1 = $(textid).val();
                                    val2 = $(textid).siblings('input').val();
                                    if (oper === 'B' && val1 !== '' && val2 !== '') {
                                        if (Rtype === 8 || Rtype === 7 || Rtype === 11 || Rtype === 12) {
                                            filter_obj_arr.push(new filter_obj(paracolum, ">=", Math.min(val1, val2)));
                                            filter_obj_arr.push(new filter_obj(paracolum, "<=", Math.max(val1, val2), type));
                                        }
                                        else if (Rtype === 5 || Rtype === 6) {
                                            let d1 = Date.parse(moment(val1, 'DD-MM-YYYY').format('YYYY-MM-DD'));
                                            let d2 = Date.parse(moment(val2, 'DD-MM-YYYY').format('YYYY-MM-DD'));
                                            if (d2 > d1) {
                                                filter_obj_arr.push(new filter_obj(paracolum, ">=", val1, type));
                                                filter_obj_arr.push(new filter_obj(paracolum, "<=", val2, type));
                                            }
                                            else {
                                                filter_obj_arr.push(new filter_obj(paracolum, ">=", val2, type));
                                                filter_obj_arr.push(new filter_obj(paracolum, "<=", val1, type));
                                            }
                                        }
                                    }
                                }
                                else {
                                    var data = $(textid).val();
                                    filter_obj_arr.push(new filter_obj(paracolum, oper, data, type));
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
        if (this.Source === "EbDataTable" || this.Source === "locationTree" || this.Source === "WebForm")
            this.GenerateButtons();

        else if (this.Source === "Calendar") {
            this.CreateContextmenu4ObjectSelector();
        }
        if (this.login === "uc") {
            this.initCompleteflag = true;
            //if (this.isSecondTime) { }
            //this.ModifyingDVs(dvcontainerObj.currentObj.Name, "initComplete");            
        }
        setTimeout(function () {
            $("#" + this.tableId + "_wrapper .dataTables_scrollFoot").show();
            $("#" + this.tableId + "_wrapper .DTFC_LeftFootWrapper").show();
            $("#" + this.tableId + "_wrapper .DTFC_RightFootWrapper").show();
            $("#" + this.tableId + "_wrapper .dataTables_scrollFoot").style("padding-top", "100px", "important");
            $("#" + this.tableId + "_wrapper .dataTables_scrollFoot").style("margin-top", "-100px", "important");
            if (!this.IsTree && this.showFilterRow && !this.EbObject.IsDataFromApi) {

                this.createFilterRowHeader();
            }
            else if (this.IsTree || this.Source === "Calendar" || this.EbObject.IsDataFromApi)
                this.createFilterforTree();
            //if (this.EbObject.AllowLocalSearch)
            //    this.createFilterforTree();
            this.filterDisplay();
            this.createFooter();
            if (this.Source === "EbDataTable")
                this.arrangeWindowHeight();

            this.CreateHeaderTooltip();
            this.addFilterEventListeners();
            this.arrangeFooterWidth();
            if (this.Source !== "Calendar" || this.EbObject.IsDataFromApi)
                this.placeFilterInText();

            $("#eb_common_loader").EbLoader("hide");
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

            if (this.Source !== "EbDataTable" && this.Source !== "datagrid" && this.Source !== "WebForm") {
                $('#' + this.tableId + '_wrapper .dataTables_scrollFoot').hide();
                $('#' + this.tableId + '_wrapper .DTFC_LeftFootWrapper').hide();
                $('#' + this.tableId + '_wrapper .DTFC_RightFootWrapper').hide();
                if ($("#" + this.tableId + " tr").length > 7) {
                    $(".containerrow #" + this.tableId + "_wrapper .dataTables_scroll").style("height", "210px", "important");
                    $(".containerrow #" + this.tableId + "_wrapper .dataTables_scrollBody").style("height", "155px", "important");
                }
                $("#" + this.tableId + "_wrapper .DTFC_ScrollWrapper .DTFC_RightBodyWrapper tr").css("height", this.EbObject.RowHeight + "px");
                $("#" + this.tableId + "_wrapper .DTFC_ScrollWrapper .DTFC_LeftBodyWrapper tr").css("height", this.EbObject.RowHeight + "px");
                $("#" + this.tableId + "_wrapper .dataTables_scroll .dataTables_scrollBody tr").css("height", this.EbObject.RowHeight + "px");
            }
            if (Option.initCompleteCallback)
                Option.initCompleteCallback();

            this.Api.columns.adjust();
        }.bind(this), 0);
    };

    this.contextMenu = function () {
        $.contextMenu({
            selector: ".tablelink",
            items: {
                "OpenNewTab": { name: "Open in New Tab", icon: "fa-external-link-square", callback: this.OpeninNewTab.bind(this) }
            }
        });
    };

    this.contextMenu4Label = function () {
        $.contextMenu({
            selector: ".labeldata",
            items: {
                "Copy": { name: "Copy", icon: "fa-external-link-square", callback: this.copyLabelData.bind(this) }
            }
        });
    };

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
            $("body").append(`<div class="modal fade RptModal" id="RptModal${copycelldata}" role="dialog">
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
            let url = "../webform/index?refid=" + this.linkDV;
            var _form = document.createElement("form");
            _form.setAttribute("method", "post");
            _form.setAttribute("action", url);
            _form.setAttribute("target", "_blank");

            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_params";
            input.value = btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValuesforForm))));
            _form.appendChild(input);

            input = document.createElement('input');
            input.type = 'hidden';
            input.name = "_mode";
            input.value = this.dvformMode;
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
        else if (splitarray[2] === "22") {
            this.tabNum++;
            let url = "../DashBoard/DashBoardView?refid=" + this.linkDV;

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

        if (this.EbObject.LeftFixedColumn > 0 || this.EbObject.RightFixedColumn > 0) {
            if (this.EbObject.LeftFixedColumn > 0) {
                for (let j = 0; j < this.EbObject.LeftFixedColumn; j++) {
                    $(lfoot).children().find("tr").eq(0).children("th").eq(j).css("width", scrollfoot.find("tfoot").children("tr").eq(0).children("th").eq(j).css("width"));
                }
            }

            if (this.EbObject.RightFixedColumn > 0) {
                var start = scrollfoot.find("tr").eq(0).children().length - this.EbObject.RightFixedColumn;
                for (let j = 0; (j + start) < scrollfoot.find("tr").eq(0).children().length; j++) {
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

        if (this.EbObject.LeftFixedColumn > 0 || this.EbObject.RightFixedColumn.length > 0) {
            if (this.EbObject.LeftFixedColumn > 0) {
                for (let j = 0; j < this.EbObject.LeftFixedColumn; j++) {
                    $(lhead).children().find("tr").eq(0).children("th").eq(j).css("width", lbody.find("tbody").children("tr").eq(0).children("td").eq(j).css("width"));
                }
            }

            if (this.EbObject.RightFixedColumn > 0) {
                var start = lbody.find("tr").eq(0).children().length - this.EbObject.RightFixedColumn;
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
        $('.' + this.tableId + '_htext').val("");
        for (let i = 0; i < this.columnSearch.length; i++) {
            let param1 = this.columnSearch[i];
            let param2 = this.columnSearch[i + 1];
            var colum = param1.Column;
            let phonecolumns = this.EbObject.Columns.$values.filter(obj => obj.$type.indexOf("DVPhoneColumn") !== -1);
            phonecolumns.forEach(function (obj) {
                if (obj.MappingColumn.name === colum) {
                    colum = obj.name;
                    return false;
                }
            });
            let textid = '#' + this.tableId + '_' + colum + '_hdr_txt1';
            let type = $(textid).attr('data-coltyp');
            if (type === 'boolean') {
                if (param1.Value === "true")
                    $(textid).attr("checked", true);
                else if (param1.Value === "false")
                    $(textid).attr("checked", false);
                else
                    $(textid).attr("indeterminate", true);
            }
            else {
                if (param1.Operator !== '' && param1.Value !== '') {
                    if (param2 && param2.Column === param1.Column) {
                        $(textid).val(param1.Value);
                        $(".eb_fsel" + this.tableId + "[data-colum=" + colum + "]").trigger("click");
                        $(textid).siblings('input').val(param2.Value);
                        i++;
                    }
                    else {
                        $(textid).val(param1.Value);
                        $('#' + this.tableId + '_' + colum + '_hdr_sel').text(param1.Operator);
                    }
                }
            }
        }
    };

    this.CreateHeaderTooltip = function () {
        this.visColumn = this.EbObject.Columns.$values.filter(col => col.bVisible);
        $.each($('#' + this.tableId + '_wrapper .dataTables_scrollHead th.tdheight'), this.AddHeaderTooltip.bind(this));
        this.DrawTooltipForHeader();
    };

    this.AddHeaderTooltip = function (i, _th) {
        let hCol = this.visColumn[i];
        $(_th).attr("title", hCol.HeaderTooltipText || "");
    };

    this.DrawTooltipForHeader = function () {
        $('th.tdheight').tooltip({
            placement: 'bottom',
            container: 'body',
            html: true
        });
    };


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
            if (this.IsTree || this.Source === "Calendar" || this.EbObject.IsDataFromApi) {
                $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 52px)", "important");
            }
            else if ($(filterId).children().length === 0 && !this.EbObject.IsPaging && !this.EbObject.AllowMultilineHeader)
                $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 62px)", "important");
            else {
                if ($(filterId).children().length === 0 && !this.EbObject.IsPaging && this.EbObject.AllowMultilineHeader) {//multilineonly
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 79px)", "important");
                }
                else if ($(filterId).children().length === 0 && this.EbObject.IsPaging && !this.EbObject.AllowMultilineHeader) {//pagingonly
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 88px)", "important");
                }
                else if ($(filterId).children().length !== 0 && !this.EbObject.IsPaging && !this.EbObject.AllowMultilineHeader) {//filteronly
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 86px)", "important");
                }
                else if ($(filterId).children().length === 0 && this.EbObject.IsPaging && this.EbObject.AllowMultilineHeader) {//paging & multiline
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 104px)", "important");
                }
                else if ($(filterId).children().length !== 0 && !this.EbObject.IsPaging && this.EbObject.AllowMultilineHeader) {//filter & multiline
                    $("#" + focusedId + " .dataTables_scroll").style("height", "calc(100vh - 102px)", "important");
                }
                else if ($(filterId).children().length !== 0 && this.EbObject.IsPaging && !this.EbObject.AllowMultilineHeader) {//filetr & paging
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
                if ($(filterId).children().length === 0 && !this.EbObject.IsPaging)
                    $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 40px)", "important");
                else {
                    if ($(filterId).children().length === 0)
                        $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 55px)", "important");
                    else if (!this.EbObject.IsPaging)
                        $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 58px)", "important");
                    else
                        $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 90px)", "important");
                }
            }
            else {
                if (this.IsTree || this.Source === "Calendar" || this.EbObject.IsDataFromApi)
                    $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 32px)", "important");
                else if ($(filterId).children().length === 0 && !this.EbObject.IsPaging)
                    $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 42px)", "important");
                else {
                    if ($(filterId).children().length === 0)
                        $("#sub_window_" + this.tableId + " .dataTables_scroll").style("height", "calc(100vh - 68px)", "important");
                    else if (!this.EbObject.IsPaging)
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
        if (this.Source === "EbDataTable") {
            this.propGrid.setObject(this.EbObject, AllMetas["EbTableVisualization"]);
            if (this.ImageArray.length > 0) {
                $("#test12").remove();
                $("body").append("<div id='test12'></div>");
                this.FileViewer = $("#test12").ebFileViewer(this.ImageArray);
            }
        }
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
            if (this.Source !== "Calendar" || this.EbObject.IsDataFromApi)
                this.placeFilterInText();
            //this.arrangefixedHedaerWidth();
            this.summarize2();
            if (this.Source === "EbDataTable")
                this.arrangeWindowHeight();
        }
        $("#" + this.tableId + " .tdheight").css("height", this.EbObject.RowHeight + "px");
        if (Option.drawCallBack)
            Option.drawCallBack();
        if (this.Api === null)
            this.Api = $("#" + this.tableId).DataTable();
        this.Api.columns.adjust();
    };

    this.headerCallback = function (thead, data, start, end, display) {
        //$(thead).find('th').eq(0).html('Displaying ' + (end - start) + ' records');
    };

    this.selectCallbackFunc = function (e, dt, type, indexes) {
    };

    this.DTKeyFocusCallback = function (e, datatable, cell, originalEvent) {
        datatable.rows().deselect();
        let trindex = cell.index().row;
        datatable.row(trindex).select();
        if (Option.keyFocusCallbackFn)
            Option.keyFocusCallbackFn(e, datatable, cell, originalEvent);
    };

    this.clickCallbackFunc = function (e) {
    };

    this.dblclickCallbackFunc = function (e) {
        if (Option.fnDblclickCallback)
            Option.fnDblclickCallback(e);
    };

    this.DTclickTDCallbackFunc = function (e) {
        if (Option.fnClickTdCallback)
            Option.fnClickTdCallback(e);
    };

    this.rowclick = function (e, dt, type, indexes) {
        if (Option.rowclick)
            Option.rowclick(e, dt, type, indexes);
    };

    this.mouseenter = function (e, dt, type, indexes) {
        let trindex = $(e.target).closest("tr").index();
        let bgcolor = $(e.target).closest("tr").css("background-color");
        $(".DTFC_LeftBodyLiner tbody tr").eq(trindex).style("background-color", bgcolor, "important");
        $(".DTFC_RightBodyLiner tbody tr").eq(trindex).style("background-color", bgcolor, "important");
    };

    this.rowGroupHandler = function (e) {
        this.MainData = null;
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
        this.EbObject.LeftFixedColumn = 0;
        this.EbObject.RightFixedColumn = 0;
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
        if (this.Api === null)
            this.Api = $("#" + this.tableId).DataTable();
        var rows = this.Api.rows().nodes();
        var count = this.Api.columns()[0].length;
        if (this.Source === "EbDataTable") {
            $(rows).eq(0).before(`<tr class='group-All' id='group-All_${this.tableId}'></tr>`);
            $(`#group-All_${this.tableId}`).append(`<td  colspan="${count}"><select id="rowgroupDD_${this.tableId}" class="rowgroupselect"></select></td>`);
            $.each(this.EbObject.RowGroupCollection.$values, function (i, obj) {
                if (obj.RowGrouping.$values.length > 0) {
                    $(`#rowgroupDD_${this.tableId}`).append(`<option value="${obj.Name.trim()}">${obj.DisplayName}</option>`);
                }
            }.bind(this));
            $(`#rowgroupDD_${this.tableId}`).append(`<option value="None">None</option>`);
            $(`#rowgroupDD_${this.tableId}`).off("change").on("change", this.rowGroupHandler.bind(this));
        }
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
        }
        else {
            $(`#rowgroupDD_${this.tableId} [value=None`).attr("selected", "selected");
            $(`#group-All_${this.tableId} td[colspan=${count}]`).prepend(` Groups `);
        }
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
        let tempstr = "";
        if (tempobj[0].LinkRefId !== null)
            tempstr = tempobj[0].sTitle + `: <b data-rowgroup="true" data-colname='${tempobj[0].name}' data-coltype='${tempobj[0].Type}' data-data='${groupString}'><a href="#" oncontextmenu="return false" class="tablelink" data-colindex="${tempobj[0].data}" data-link="${tempobj[0].LinkRefId}" tabindex="0">${groupString}</a></b>`;
        else
            tempstr = tempobj[0].sTitle + `: <b data-rowgroup="true" data-colname='${tempobj[0].name}' data-coltype='${tempobj[0].Type}' data-data='${groupString}'>${groupString}</b>`;
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
        if ($(e.target).parents(".containerrow").length === 0) {
            $(".containerrow").hide();
            $(".containerrow").prev().children().find("I").removeClass("fa-caret-up").addClass("fa-caret-down");
        }
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

        if ($(e.target).parents(".containerrow").length === 0) {
            $(".containerrow").hide();
            $(".containerrow").prev().children().find("I").removeClass("fa-caret-up").addClass("fa-caret-down");
        }
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

        if (this.EbObject.LeftFixedColumn + this.EbObject.RightFixedColumn > 0) {
            for (var j = 0; j < eb_footer_controls_scrollfoot.length; j++) {
                if (j < this.EbObject.LeftFixedColumn) {
                    scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).html(eb_footer_controls_scrollfoot[j]);
                    scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).children().remove();
                }
                else {
                    if (j < eb_footer_controls_scrollfoot.length - this.EbObject.RightFixedColumn)
                        scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).html(eb_footer_controls_scrollfoot[j]);
                    else {
                        scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).html(eb_footer_controls_scrollfoot[j]);
                        scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).children().remove();
                    }
                }
            }
        }
        else {
            for (let j = 0; j < eb_footer_controls_scrollfoot.length; j++)
                scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).append(eb_footer_controls_scrollfoot[j]);
        }


        if (lfoot.length !== 0 || rfoot.length !== 0) {
            var eb_footer_controls_lfoot = this.GetAggregateControls(ps, 50);
            if (lfoot.length !== 0) {
                for (let j = 0; j < this.EbObject.LeftFixedColumn; j++) {
                    $(lfoot).children().find("tr").eq(ps).children("th").eq(j).html(eb_footer_controls_lfoot[j]);
                    if (j === 0)
                        $(lfoot).children().find("tr").eq(ps).children("th").eq(j).html("");
                    $(lfoot).children().find("tr").eq(ps).children("th").eq(j).css("width", scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).css("width"));
                    $(lfoot).children().find("tr").eq(ps).children("th").eq(j).css("height", scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j).css("height"));
                }
            }

            if (rfoot.length !== 0) {
                var start = eb_footer_controls_lfoot.length - this.EbObject.RightFixedColumn;
                for (let j = 0; (j + start) < eb_footer_controls_lfoot.length; j++) {
                    $(rfoot).children().find("tr").eq(ps).children("th").eq(j).html(eb_footer_controls_lfoot[j + start]);
                    $(rfoot).children().find("tr").eq(ps).children("th").eq(j).css("width", scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j + start).css("width"));
                    $(rfoot).children().find("tr").eq(ps).children("th").eq(j).css("height", scrollfoot.find("tfoot").children("tr").eq(ps).children("th").eq(j + start).css("height"));
                }
            }

            $(lfoot).children().find("tr").css("height", scrollfoot.find("tfoot").children("tr").css("height"));
            $(rfoot).children().find("tr").css("height", scrollfoot.find("tfoot").children("tr").css("height"));
        }
        this.summarize2();
    };

    this.GetAggregateControls = function (footer_id, zidx) {
        var ScrollY = this.EbObject.scrollY;
        var ResArray = [];
        var tableId = this.tableId;
        //$.each(this.EbObject.Columns.$values, this.GetAggregateControls_inner.bind(this, ResArray, footer_id, zidx));
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
                    "<button type='button' class='btn btn-default dropdown-toggle footerDD' data-toggle='dropdown' id='" + footer_select_id + "'>&sum;</button>" +
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
        let isUpdatable = true;
        if (Option.fnCanUpdateFooter)
            isUpdatable = Option.fnCanUpdateFooter();
        if (isUpdatable) {
            var api = this.Api;
            var tableId = this.tableId;
            var scrollY = this.EbObject.scrollY;
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
                    if (opScroll === '∑' || opLF === '∑' || opRF === '∑') {
                        if (this.Source === "datagrid")
                            summary_val = col.data().sum().toFixed(agginfo.deci_val);
                        else
                            summary_val = (typeof this.summary[agginfo.data] !== "undefined") ? this.summary[agginfo.data][0] : 0;
                    }
                    if (opScroll === 'x̄' || opLF === 'x̄' || opRF === 'x̄') {
                        if (this.Source === "datagrid")
                            summary_val = col.data().average().toFixed(agginfo.deci_val);
                        else
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
        }
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
                for (let j = 0; j < this.EbObject.LeftFixedColumn; j++)
                    $(fc_lh_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4fc[j]));
            }
            if (fc_rh_tbl.length !== 0) {
                fc_rh_tbl.find("thead").append($("<tr role='row' class='addedbyeb'/>"));
                for (let j = this.eb_filter_controls_4fc.length - this.EbObject.RightFixedColumn; j < this.eb_filter_controls_4fc.length; j++)
                    $(fc_rh_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4fc[j]));
            }
        }

        var sc_h_tbl = $('#' + tableid + '_wrapper .dataTables_scrollHeadInner table');
        if (sc_h_tbl !== null) {
            this.GetFiltersFromSettingsTbl(1);
            sc_h_tbl.find("thead").append($("<tr role='row' class='addedbyeb'/>"));
            if (this.EbObject.LeftFixedColumn + this.EbObject.RightFixedColumn > 0) {
                for (let j = 0; j < this.eb_filter_controls_4sb.length; j++) {
                    if (j < this.EbObject.LeftFixedColumn) {
                        $(sc_h_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4sb[j]));
                        $(sc_h_tbl.find("tr[class=addedbyeb] th:eq(" + j + ")")).children().not("span").remove();
                    }
                    else {
                        if (j < this.eb_filter_controls_4sb.length - this.EbObject.RightFixedColumn)
                            $(sc_h_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4sb[j]));
                        else {
                            $(sc_h_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4sb[j]));
                            $(sc_h_tbl.find("tr[class=addedbyeb] th:eq(" + j + ")")).children().not("span").remove();
                        }
                    }
                }
            }
            else {
                for (let j = 0; j < this.eb_filter_controls_4sb.length; j++)
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
        var TRange = null;
        $(".dataTables_info").after(`<div id="${this.tableId}_filter" class="col-md-4 dataTables_filters">
        <div class="input-group">
            <input type="text" class="form-control" placeholder="Search">
            <div class="input-group-btn">
              <button class="btn btn-default" type="submit">
                <i class="glyphicon glyphicon-search"></i>
              </button>
            </div>
          </div>
       
        </div>`);
        $(`#${this.tableId}_filter input`).off("keyup").on("keyup", this.LocalSearch.bind(this));
        //<button class="btn previous_h"><i class="fa fa-angle-up" aria-hidden="true"></i></button>
        //<button class="btn next_h"><i class="fa fa-angle-down" aria-hidden="true"></i></button>
    };

    this.LocalSearch = function (e) {
        var text = $(e.target).val();
        //if (e.keyCode === 13 && text.length > 2) {
        //$(".match").each(function (i, span) {
        //    $(span).parent().text($(span).parent().text());
        //    $(span).remove();
        //});
        if (text !== "")
            this.searchAndHighlight(text, ".dataTables_scrollBody");
        else
            $(".dataTables_scrollBody").find("tr").show();
        this.Api.columns.adjust();

        //}
    };

    this.findString = function (str) {
        if (parseInt(navigator.appVersion) < 4) return;
        var strFound;
        if (window.find) {

            // CODE FOR BROWSERS THAT SUPPORT window.find

            strFound = self.find(str);
            if (!strFound) {
                strFound = self.find(str, 0, 1);
                while (self.find(str, 0, 1)) continue;
            }
        }
        else if (navigator.appName.indexOf("Microsoft") !== -1) {

            // EXPLORER-SPECIFIC CODE

            if (TRange !== null) {
                TRange.collapse(false);
                strFound = TRange.findText(str);
                if (strFound) TRange.select();
            }
            if (TRange === null || strFound === 0) {
                TRange = self.document.body.createTextRange();
                strFound = TRange.findText(str);
                if (strFound) TRange.select();
            }
        }
        else if (navigator.appName === "Opera") {
            alert("Opera browsers not supported, sorry...");
            return;
        }
        if (!strFound) alert("String '" + str + "' not found!");
        return;
    };

    this.searchAndHighlight = function (searchTerm, selector) {
        if (searchTerm) {
            var searchTermRegEx = new RegExp(searchTerm, "ig");
            var matches = $(selector).text().match(searchTermRegEx);
            if (matches !== null && matches.length > 0) {
                $('.highlighted').removeClass('highlighted'); //Remove old search highlights  

                //Remove the previous matches
                $span = $(selector).children('span');
                $span.replaceWith($span.html());

                if (searchTerm === "&") {
                    searchTerm = "&amp;";
                    searchTermRegEx = new RegExp(searchTerm, "ig");
                }
                var arr = $(selector).find("td").toArray().filter(obj => $(obj).text().toLowerCase().includes(searchTerm.toLowerCase()));
                //arr.forEach(function (obj, i) {
                //    let $target = $(obj);
                //    let $next = $target.children();
                //    while ($next.length) {
                //        $target = $next;
                //        $next = $next.children();
                //    }
                //    let x = $($target).text().match(searchTermRegEx);
                //    $($target).html($($target).html().replace(searchTermRegEx, "<span class='match'>" + x[0] + "</span>"));
                //}); 
                //$(selector).html($(selector).html().replace(searchTermRegEx, "<span class='match'>" + matches[0] + "</span>"));
                //$('.match:first').addClass('highlighted');

                //var i = 0;

                //$('.next_h').off('click').on('click', function () {

                //    i++;

                //    if (i >= $('.match').length) i = 0;

                //    $('.match').removeClass('highlighted');
                //    $('.match').eq(i).addClass('highlighted');
                //    if ($('.match').length) {
                //        $(selector).animate({
                //            scrollTop: $('.match').eq(i).position().top
                //        }, 300);
                //    }
                //});

                //$('.previous_h').off('click').on('click', function () {

                //    i--;

                //    if (i < 0) i = $('.match').length - 1;

                //    $('.match').removeClass('highlighted');
                //    $('.match').eq(i).addClass('highlighted');
                //    if ($('.match').length) {
                //        $(selector).animate({
                //            scrollTop: $('.match').eq(i).position().top
                //        }, 300);
                //    }
                //});

                //if ($('.highlighted:first').length) { //if match found, scroll to where the first one appears
                //    $(selector).scrollTop($('.highlighted:first').position().top);
                //}
                $(selector).find("tr").hide();
                arr.forEach(function (obj, i) {
                    $(obj).closest("tr").show();
                });
                return true;
            }
        }
        return false;
    };

    this.addFilterEventListeners = function () {
        $(".columnimage").lazy();
        $('#' + this.tableId + '_wrapper thead tr:eq(0)').off('click').on('click', 'th', this.orderingEvent.bind(this));
        $(".eb_fsel" + this.tableId).off("click").on("click", this.setLiValue.bind(this));
        $(".eb_ftsel" + this.tableId).off("click").on("click", this.fselect_func.bind(this));
        $.each($(this.Api.columns().header()).parent().siblings().children().toArray(), this.setFilterboxValue.bind(this));
        $("." + this.tableId + "_htext").off("keyup").on("keyup", this.call_filter);
        $(".eb_fbool" + this.tableId).off("change").on("change", this.toggleInFilter.bind(this));
        $(".eb_selall" + this.tableId).off("click").on("click", this.clickAlSlct.bind(this));
        $("." + this.tableId + "_select").off("change").on("change", this.updateAlSlct.bind(this));
        $(".eb_canvas" + this.tableId).off("click").on("click", this.renderMainGraph);
        $(".tablelink" + this.tableId).off("click").on("click", this.link2NewTable.bind(this));
        $(".tablelinkfromcolumn" + this.tableId).off("click").on("click", this.link2NewTable.bind(this));
        $(".tablelink4calendar").off("click").on("click", this.linkFromCalendar.bind(this));
        //$(`tablelinkInline_${this.tableId}`).off("click").on("click", this.link2NewTableInline.bind(this));
        //$(".tablelink_" + this.tableId).off("mousedown").on("mousedown", this.link2NewTableInNewTab.bind(this));
        $(".closeTab").off("click").on("click", this.deleteTab.bind(this));


        //this.Api.off('key-focus').on('key-focus', function (e, datatable, cell) {
        //    datatable.rows().deselect();
        //    let trindex = cell.index().row;
        //    datatable.row(trindex).select();
        //    //$(".DTFC_LeftBodyLiner tbody tr").eq(trindex).addClass("selected");
        //    //$(".DTFC_RightBodyLiner tbody tr").eq(trindex).addClass("selected");
        //});

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
        //$("#btnToggleFD" + this.tableId).off("click").on("click", this.toggleFilterdialog.bind(this));
        $(".columnMarker" + this.tableId).off("click").on("click", this.link2NewTable.bind(this));
        $(".columnimage").one("load", function () {
            $(".columnimage").off("click").on("click", this.ViewImage.bind(this));
            $(".columnimage").on("error", this.OnErrorImage);
        }.bind(this));
        $('[data-toggle="tooltip"],[data-toggle-second="tooltip"]').tooltip({
            placement: 'bottom'
        });
        $('.status-time').tooltip({
            placement: 'top'
        });

        $('.columntooltip').popover({
            container: 'body',
            trigger: 'hover',
            placement: this.PopoverPlacement,
            html: true,
            content: function (e, i) {
                $(".popover").remove();
                //return atob($(this).attr("data-contents"));
                return decodeURIComponent(atob($(this).attr("data-contents")).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
            },
        });

        $('.btn-approval_popover').popover({
            container: 'body',
            trigger: 'click',
            placement: this.PopoverPlacement,
            html: true,
            template: '<div class="popover approval-popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
            content: function (e, i) {
                return atob($(this).attr("data-contents"));
            },
        });

        $('.btn-approval_popover').on('click', function (e) {
            //$('.btn-approval_popover').not(this).popover("hide");
        });

        $('.btn-approval_popover').on('shown.bs.popover', function (e) {
            $(".stage_actions").selectpicker();
            let $td = $(e.target).parents().closest("td");
            $(".btn-action_execute").off("click").on("click", this.ExecuteApproval.bind(this, $td));
        }.bind(this));

        $('.btn-approval_popover').on('hidden.bs.popover', function (e) {
            $(e.target).data("bs.popover").inState.click = false;
        }.bind(this));

        $('body').on('click', function (e) {
            $('[data-toggle=popover]').each(function () {
                // hide any open popovers when the anywhere else in the body is clicked
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                    $(this).popover('hide');
                }
            });
        });
        $(".rating").rateYo({
            readOnly: true,
            starWidth: "24px"
        });

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
        //this.Api.columns.adjust();
    };

    this.ViewImage = function (e) {
        let data = $(e.target).attr("src").replace("/images/", "").replace("small/", "").replace("medium/", "").replace(".jpg", "");
        this.FileViewer.showimage(data);
    };

    this.OnErrorImage = function () {
        $(this).attr('src', '/images/image.png').off("click");
    };

    this.PopoverPlacement = function (context, source) {
        var position = $(source).offset();

        if (position.left > 1000)
            return "left";
        else {
            return "right";
        }
    };

    this.GenerateButtons = function () {
        this.submitId = "btnGo" + this.tableId;
        this.$submit = $("<button id='" + this.submitId + "' class='btn commonControl'><i class='fa fa-play' aria-hidden='true'></i></button>");
        if (this.Source === "WebForm") {
            $("#buttondiv_" + this.tableId).empty();
            this.$submit = $("<div id='" + this.submitId + "' class='btn commonControl'><i class='fa fa-refresh' aria-hidden='true'></i></div>");
            $("#buttondiv_" + this.tableId).append(this.$submit);
        }
        else {
            $(".toolicons").show();
            $("#obj_icons").empty();
            $("#obj_icons").append(this.$submit);
        }
        this.$submit.click(this.getColumnsSuccess.bind(this));

        if (window.location.href.indexOf("hairocraft") !== -1 && this.login === "uc" && this.dvName.indexOf("leaddetails") !== -1) 
            $("#obj_icons").prepend(`<button class='btn' data-toggle='tooltip' title='NewCustomer' onclick='window.open("/leadmanagement","_blank");' ><i class="fa fa-user-plus"></i></button>`);
        
        if (this.Source === "EbDataTable") {
            if (this.EbObject.FormLinks.$values.length > 0) {
                this.EbObject.FormLinks.$values = this.EbObject.FormLinks.$values.filter((thing, index, self) =>
                    index === self.findIndex((t) => (
                        t.DisplayName === thing.DisplayName && t.Refid === thing.Refid
                    ))
                );
                this.CreateNewFormLinks();
            }
            $("#objname").text(this.EbObject.DisplayName);
            if ($("#" + this.tableId).children().length > 0) {
                if (this.FD) {
                    this.filterid = "filter" + this.tableId;
                    this.$filter = $("<button id='" + this.filterid + "' class='btn commonControl'><i class='fa fa-filter' aria-hidden='true'></i></button>");
                    $("#obj_icons").append(this.$filter);
                    this.$filter.click(this.CloseParamDiv.bind(this));
                }
                if (this.login === "uc") {
                    $("#obj_icons").append(`<div id='${this.tableId}_fileBtns' style='display: inline-block;'><div class='btn-group'></div></div>`);
                    $.each(this.permission, function (i, obj) {
                        if (obj === "Excel")
                            $("#" + this.tableId + "_fileBtns .btn-group").append("<button id ='btnExcel" + this.tableId + "' class='btn'  name = 'filebtn' data-toggle='tooltip' title = 'Excel' > <i class='fa fa-file-excel-o' aria-hidden='true'></i></button >");
                    }.bind(this));
                    dvcontainerObj.modifyNavigation();
                }
            }
            this.CreatePgButton();
            this.excelbtn = $("#btnExcel" + this.tableId);
        }
        else {
            $(".display-none").remove();
        }

        if (this.IsTree) {
            this.CreateContexmenu4Tree();
        }
        if (this.isSecondTime) {
            this.addFilterEventListeners();
        }
        $("#" + this.tableId + " tbody").off("click", ".groupform").on("click", ".groupform", this.collapseTreeGroup);
        this.Contexmenu4SmsColumn();
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

    this.Contexmenu4SmsColumn = function () {
        $.contextMenu({
            selector: ".smsbutton",
            trigger: 'left',
            build: function ($trigger, e) {
                $("body").find("td").removeClass("focus");
                $("body").find("[role=row]").removeClass("selected");
                $trigger.closest("[role=row]").addClass("selected");
                return {
                    items: {
                        "SENDSMS": { name: "Send SMS", icon: "fa-mobile", callback: this.OpenSMSModal.bind(this) }
                    }
                };
            }.bind(this)
        });
    };

    this.OpenSMSModal = function (key, opt, event) {
        let colname = $(opt.$trigger).attr("data-colname");
        this.phonecolumn = this.EbObject.Columns.$values.filter(obj => obj.name === colname)[0];
        this.AppendSMSModal($(opt.$trigger));
        this.AppendSMSTemplates($(opt.$trigger));
        $("#smsmodal").modal("show");
    };

    this.AppendSMSModal = function ($elem) {
        $("#smsmodal").remove();
        let modal1 = `<div class="modal fade" tabindex="-1" role="dialog" id='smsmodal'>
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">SMS Template</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" id='sms-modal-body'>
        <table class='table'>
            <tbody>
                <tr><td><div class='smslabel'>Template :</div></td><td class='smstemplate-select-cont'></td>
                    <td><div class='smslabel'>To :</div></td>
                    <td class='sms-number-cont'>
                        <input class="form-control" type='text' id='sms-number' placeholder='phone number here..'>
                    </td>
                </tr>
                <tr><td colspan='4' class='sms-textarea-cont'><textarea id='sms-textarea' class="form-control" placeholder='SMS text here..'></textarea></td></tr>
            </tbody>
        </table>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" id='sendbtn'><i class="fa fa-paper-plane" aria-hidden="true"></i><span id='sendbtn-text'>Send</span></button>
      </div>
    </div>
  </div>
</div>`;

        $("body").prepend(modal1);
        $("#sendbtn").prop("disabled", true);
        $("#sendbtn").off("click").on("click", this.SendSMS.bind(this, $elem));
    };

    this.AppendSMSTemplates = function ($elem) {
        let template = `<select class="selectpicker smstemplate-select">`;
        //template += `<option value=''>--- Select SMS Template ---</option>`;
        $.each(this.phonecolumn.Templates.$values, function (i, obj) {
            template += `<option value='${obj.ObjRefId}'>${obj.ObjDisplayName}</option>`;
        });
        template += `<option value=''>Custom Template</option>`;
        template += `</select>`;
        $(".smstemplate-select-cont").append(template);
        $(".smstemplate-select").selectpicker();
        $('#sms-modal-body .selectpicker').on('changed.bs.select', this.ClickOnTemplate.bind(this, $elem));
        $('#sms-modal-body .selectpicker').val(this.phonecolumn.Templates.$values[0].ObjRefId).change();
    };

    this.ClickOnTemplate = function ($elem, e, clickedIndex, isSelected, previousValue) {
        let refid = $(".smstemplate-select option:selected").val();
        var idx = this.Api.row($elem.parents().closest("td")).index();
        this.rowData = this.unformatedData[idx];
        let filters = this.getFilterValues().concat(this.FilterfromRow());
        $("#sendbtn").prop("disabled", false);
        if (refid) {
            $.ajax({
                type: "POST",
                url: "../DV/GetSMSPreview",
                data: { RefId: refid, Params: filters },
                success: this.AppendSMSPreview.bind(this)
            });
        }
        else
            this.AppendSMSPreview();
    };
    this.AppendSMSPreview = function (result) {
        if (result) {
            result = JSON.parse(result);
            $("#sms-number").val(result.FilledSmsTemplate.SmsTo).prop("disabled", true);
            $("#sms-textarea").val(atob(result.FilledSmsTemplate.SmsTemplate.Body)).prop("disabled", true);
        }
        else {
            $("#sms-number").val("").prop("disabled", false);
            $("#sms-textarea").val("").prop("disabled", false);
        }
    };

    this.SendSMS = function ($elem) {
        if (this.MakeSMSValidation()) {
            $("#smsmodal").modal("hide");
            $("#eb_common_loader").EbLoader("show");
            $.ajax({
                type: "POST",
                url: "../DV/SendSMS",
                data: { To: $("#sms-number").val(), Body: $("#sms-textarea").val() },
                success: this.SendSMSSuccess.bind(this)
            });
        }
    };

    this.MakeSMSValidation = function () {
        if ($("#sms-number").val() && $("#sms-textarea").val())
            return true;
        else {
            EbMessage("show", { Message: "Phone number or text is Empty", Background: "#e40707" });
            return false;
        }
    };

    this.SendSMSSuccess = function () {
        $("#eb_common_loader").EbLoader("hide");
        EbPopBox("show", { Message: "Message sent", Title: "Success" });
    };

    this.CreateContexmenu4Tree = function () {
        $.contextMenu({
            selector: ".groupform", className: 'treeview',
            build: function ($trigger, e) {
                $("body").find("td").removeClass("focus");
                $("body").find("[role=row]").removeClass("selected");
                $trigger.closest("[role=row]").addClass("selected");
                if (this.GroupFormLink !== null) {
                    if ($(e.currentTarget).children().hasClass("levelzero")) {
                        return {
                            items: {
                                "NewGroup": { name: "New Group", icon: "fa-plus-square", callback: this.FormNewGroup.bind(this) },
                                "NewItem": { name: "New Item", icon: "fa-plus-square", callback: this.FormNewItem.bind(this) },
                                "EditGroup": { name: "View Group", icon: "fa-pencil-square-o", callback: this.FormEditGroup.bind(this) }
                            }
                        };
                    }
                    else {
                        return {
                            items: {
                                "NewGroup": { name: "New Group", icon: "fa-plus-square", callback: this.FormNewGroup.bind(this) },
                                "NewItem": { name: "New Item", icon: "fa-plus-square", callback: this.FormNewItem.bind(this) },
                                "EditGroup": { name: "View Group", icon: "fa-pencil-square-o", callback: this.FormEditGroup.bind(this) },
                                "Move": { name: "Move Group", icon: "fa-arrows", callback: this.MoveGroupOrItem.bind(this) }
                            }
                        };
                    }
                }
                else if (this.Source === "locationTree") {
                    return {
                        items: {
                            "NewGroup": { name: "New", icon: "fa-plus-square", callback: this.OpenLocationModal.bind(this) },
                            "EditGroup": { name: "Edit", icon: "fa-pencil-square-o", callback: this.OpenLocationModal.bind(this) },
                            "Move": { name: "Move", icon: "fa-arrows", callback: this.MoveGroupOrItem.bind(this) }
                        }
                    };
                }
                else {
                    if ($(e.currentTarget).hasClass("levelzero")) {
                        return {};
                    }
                    else {
                        return {
                            items: {
                                "Move": { name: "Move Group", icon: "fa-arrows", callback: this.MoveGroupOrItem.bind(this) }
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
                            "EditItem": { name: "View Item", icon: "fa-pencil-square-o", callback: this.FormEditItem.bind(this) },
                            "Move": { name: "Move Item", icon: "fa-arrows", callback: this.MoveGroupOrItem.bind(this) }
                        }
                    };
                }
                else if (this.Source === "locationTree") {
                    return {
                        items: {
                            "EditItem": { name: "Edit", icon: "fa-pencil-square-o", callback: this.OpenLocationModal.bind(this) },
                            "Move": { name: "Move", icon: "fa-arrows", callback: this.MoveGroupOrItem.bind(this) }
                        }
                    };
                }
                else {
                    return {
                        items: {
                            "Move": { name: "Move Item", icon: "fa-arrows", callback: this.MoveGroupOrItem.bind(this) }
                        }
                    };
                }
            }.bind(this)

        });
    };

    this.OpenLocationModal = function (key, opt, event) {
        let id_index = this.EbObject.Columns.$values.filter(obj => obj.name === "id")[0].data;

        let index = opt.$trigger.parent().closest("tr").index();
        let rowData = this.unformatedData[index];

        $('#add_location_modal').modal("show");
        if (key === "EditGroup" || key === "EditItem") {
            let longname_index = this.EbObject.Columns.$values.filter(obj => obj.name === "longname")[0].data;
            let shortname_index = this.EbObject.Columns.$values.filter(obj => obj.name === "shortname")[0].data;
            let parent_id_index = this.EbObject.Columns.$values.filter(obj => obj.name === "parent_id")[0].data;
            let image_index = this.EbObject.Columns.$values.filter(obj => obj.name === "image")[0].data;
            let types_index = this.EbObject.Columns.$values.filter(obj => obj.name === "eb_location_types_id")[0].data;
            let meta_index = this.EbObject.Columns.$values.filter(obj => obj.name === "meta_json")[0].data;

            $("#add_location_modal").find("input[type='text']").val("");
            $("#add_location").text("Update");
            $("input[name='_LocId']").val(rowData[id_index]);
            $("input[name='_longname']").val(rowData[longname_index]);
            $("input[name='_shortname']").val(rowData[shortname_index]);
            $("#_parentId").val(rowData[parent_id_index]);
            $(`input[name='_Logo']`).val(rowData[image_index]);
            $("#loc_type").val(rowData[types_index]);
            let meta = JSON.parse(rowData[meta_index]);
            for (var item in meta) {
                $(`#add_location_modal input[name=n${item}]`).val(meta[item]);
            }
        }
        else if (key === "NewGroup") {
            $("#add_location").text("Add");
            $("#_parentId").val(rowData[id_index]);
            $("input[name='_LocId']").val("");
            $(`input[name='_Logo']`).val("");
            $("#loc_type").val("");
            $("#add_location_modal").find("input[type='text']").val("");
        }
    };

    this.CreateContextmenu4ObjectSelector = function () {
        $.contextMenu('destroy', ".dataclass");
        if (this.ObjectLinks.length > 1) {
            let _items = {};
            $.each(this.ObjectLinks, function (i, obj) {
                _items[obj.ObjName] = { name: obj.ObjDisplayName, callback: this.CalendarLinkClick.bind(this) };
            }.bind(this));
            $.contextMenu({
                selector: ".dataclass",
                build: function ($trigger, e) {
                    $("body").find("td").removeClass("focus");
                    $("body").find("[role=row]").removeClass("selected");
                    $trigger.closest("[role=row]").addClass("selected");
                    return {
                        items: _items
                    };
                }.bind(this)
            });
        }
    };

    this.CalendarLinkClick = function (key, opt, event) {
        let MapObj = this.ObjectLinks.filter(obj => obj.ObjName === key)[0];
        var idx = this.Api.row(opt.$trigger.parent().parent()).index();
        let rowdata = window.atob(opt.$trigger.children("span").attr("hidden-row")).split(",");
        var filter = this.GetFilterforCalendarToForm(MapObj, rowdata);
        if (MapObj.FormMode === 1) {
            if (filter[0].Value === "") {
                MapObj.FormMode = 2;
                filter = [];
            }
        }
        if (MapObj.ObjRefId.split("-")[2] === "0") {
            if (parseInt(EbEnums.LinkTypeEnum.Popout) === MapObj.LinkType) {
                let url = "../webform/index?refid=" + MapObj.ObjRefId;
                var _form = document.createElement("form");
                _form.setAttribute("method", "post");
                _form.setAttribute("action", url);
                _form.setAttribute("target", "_blank");

                var input = document.createElement('input');
                input.type = 'hidden';
                input.name = "_params";
                input.value = btoa(unescape(encodeURIComponent(JSON.stringify(filter))));
                _form.appendChild(input);

                input = document.createElement('input');
                input.type = 'hidden';
                input.name = "_mode";
                input.value = MapObj.FormMode;
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
            else {

                $("#iFrameFormPopupModal").modal("show");
                let url = `../webform/index?refid=${MapObj.ObjRefId}&_params=${btoa(unescape(encodeURIComponent(JSON.stringify(filter))))}&_mode=1${MapObj.FormMode}&_locId=${store.get("Eb_Loc-" + this.TenantId + this.UserId)}`;
                $("#iFrameFormPopup").attr("src", url);
            }
        }
    };

    this.GetFilterforCalendarToForm = function (MapObj, rowdata) {
        let filters = [];
        if (MapObj.FormMode === 1) {
            var col = MapObj.FormId.$values;
            $.each(col, function (i, col) {
                filters.push(new fltr_obj(col.Type, col.name, rowdata[col.OIndex]));
            }.bind(this));
        }
        else if (MapObj.FormMode === 2) {
            var cols = MapObj.FormParameters.$values;
            $.each(cols, function (i, col) {
                if (rowdata[col.data] !== "")
                    filters.push(new fltr_obj(col.Type, col.FormControl.Name, rowdata[col.OIndex]));
            }.bind(this));
        }
        return filters;
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
            let url = `../webform/index?refid=${obj.Refid}&_mode=2&_locId=${store.get("Eb_Loc-" + this.TenantId + this.UserId)}`;
            $(`#NewFormdd${this.tableId} .drp_ul`).append(`<li class="drp_item"><a class="dropdown-item" href="${url}" target="_blank">${obj.DisplayName}</a></li>`);
        }.bind(this));
    };

    this.FormNewGroup = function (key, opt, event) {
        let index = opt.$trigger.parent().closest("tr").index();
        this.rowData = this.unformatedData[index];
        let filterparams = btoa(JSON.stringify(this.formatToMutipleParameters(this.treeColumn.GroupFormParameters.$values)));

        if (parseInt(EbEnums.LinkTypeEnum.Popup) === this.treeColumn.LinkType) {
            $("#iFrameFormPopupModal").modal("show");
            let url = `../webform/index?refid=${this.GroupFormLink}&_params=${filterparams}&_mode=12&_locId=${store.get("Eb_Loc-" + this.TenantId + this.UserId)}`;
            $("#iFrameFormPopup").attr("src", url);
        }
        else {
            var _form = document.createElement("form");
            let url = "../webform/index?refid=" + this.GroupFormLink;
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
        let index = opt.$trigger.parent().closest("tr").index();
        this.rowData = this.unformatedData[index];
        let filterparams = btoa(JSON.stringify(this.formatToMutipleParameters(this.treeColumn.ItemFormParameters.$values)));
        if (parseInt(EbEnums.LinkTypeEnum.Popup) === this.treeColumn.LinkType) {
            $("#iFrameFormPopupModal").modal("show");
            let url = `../webform/index?refid=${this.ItemFormLink}&_params=${filterparams}&_mode=12&_locId=${store.get("Eb_Loc-" + this.TenantId + this.UserId)}`;
            $("#iFrameFormPopup").attr("src", url);
        }
        else {
            let url = "../webform/index?refid=" + this.ItemFormLink;
            var _form = document.createElement("form");
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

    this.FormEditGroup = function (key, opt, event) {
        let index = opt.$trigger.parent().closest("tr").index();
        this.rowData = this.unformatedData[index];
        let filterparams = btoa(JSON.stringify(this.formatToParameters(this.treeColumn.GroupFormId.$values)));
        if (parseInt(EbEnums.LinkTypeEnum.Popup) === this.treeColumn.LinkType) {
            $("#iFrameFormPopupModal").modal("show");
            let url = `../webform/index?refid=${this.GroupFormLink}&_params=${filterparams}&_mode=11&_locId=${store.get("Eb_Loc-" + this.TenantId + this.UserId)}`;
            $("#iFrameFormPopup").attr("src", url);
        }
        else {
            let url = "../webform/index?refid=" + this.GroupFormLink;
            var _form = document.createElement("form");
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
            input.value = "1";
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

    this.FormEditItem = function (key, opt, event) {
        let index = opt.$trigger.parent().closest("tr").index();
        this.rowData = this.unformatedData[index];
        let filterparams = btoa(JSON.stringify(this.formatToParameters(this.treeColumn.ItemFormId.$values)));
        if (parseInt(EbEnums.LinkTypeEnum.Popup) === this.treeColumn.LinkType) {
            $("#iFrameFormPopupModal").modal("show");
            let url = `../webform/index?refid=${this.ItemFormLink}&_params=${filterparams}&_mode=11&_locId=${store.get("Eb_Loc-" + this.TenantId + this.UserId)}`;
            $("#iFrameFormPopup").attr("src", url);
        }
        else {
            let url = "../webform/index?refid=" + this.ItemFormLink;
            var _form = document.createElement("form");
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
            input.value = "1";
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
            let path = $(".contextmenu-custom__highlight .context-menu-visible").children().closest("span").map(function () {
                return $(this).text();
            }).get().join(' > ');
            $("#treemodal .treemodalul").text(path).append('<span class="caret"></span></button>');
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
        if (tempobj.length > 0) {
            var idx = tempobj[0].data;
            if (tempobj[0].$type && tempobj[0].$type.indexOf("DVPhoneColumn") !== -1)
                idx = tempobj[0].MappingColumn.data;
        }
        var data = arrayColumn(this.unformatedData, idx);
        data = data.filter(val => val !== null && val !== undefined);
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
        var tempobj = $.grep(this.Api.settings().init().aoColumns, function (obj) { return obj.sTitle === col; });
        var cls = $(e.target).attr('class');
        if (col !== '' && col !== "#") {
            if (tempobj[0].$type.indexOf("DVPhoneColumn") !== -1)
                this.order_info.col = tempobj[0].MappingColumn.name;
            else
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

        //$.each(this.EbObject.Columns.$values, this.GetFiltersFromSettingsTbl_inner.bind(this));
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
            else if (col.$type && col.$type.indexOf("DVPhoneColumn") !== -1) {
                data_colum = "data-colum='" + col.MappingColumn.name + "'";
                _ls += (span + this.getFilterForString(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, col.DefaultOperator));
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
            case EbEnums.StringOperators.Contains: op = '*x*'; break;
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

    this.togglePG = function (e) {
        $(".ppcont").toggle('drop', { direction: 'right' }, 150);
        if ($(".ppcont").is(":visible"))
            $(".filterCont").hide();
        e.stopPropagation();
    };

    this.fselect_func = function (e) {
        let element = ($(e.target).is("a")) ? $(e.target) : $(e.target).siblings("a");
        var selValue = $(element).text().trim();
        $(element).parents('.input-group-btn').find('.dropdown-toggle').html(selValue);
        var table = $(element).attr('data-table');
        var colum = $(element).attr('data-column');
        var decip = parseInt($(element).attr('data-decip'));
        var col = this.Api.column(colum + ':name');
        var ftrtxt;
        var agginfo = $.grep(this.eb_agginfo, function (obj) { return obj.colname === colum; })[0];
        ftrtxt = '.dataTables_scrollFootInner #' + this.tableId + '_' + colum + '_ftr_txt0';
        if ($(ftrtxt).length === 0)
            ftrtxt = '.DTFC_LeftFootWrapper #' + this.tableId + '_' + colum + '_ftr_txt0';
        if ($(ftrtxt).length === 0)
            ftrtxt = '.DTFC_RightFootWrapper #' + this.tableId + '_' + colum + '_ftr_txt0';

        if (selValue === '∑') {
            if (this.Source === "datagrid")
                pageTotal = col.data().sum().toFixed(agginfo.deci_val);
            else
                pageTotal = (typeof this.summary[agginfo[0].data] !== "undefined") ? this.summary[agginfo.data][0] : 0;
        }
        else if (selValue === 'x̄') {
            if (this.Source === "datagrid")
                pageTotal = col.data().average().toFixed(agginfo.deci_val);
            else
                pageTotal = (typeof this.summary[agginfo[0].data] !== "undefined") ? this.summary[agginfo.data][1] : 0;
        }

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
            this.hiddenIndex = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.name.toLocaleLowerCase() === this.hiddenFieldName.toLocaleLowerCase(); }.bind(this))[0].data;
            this.rowId = meta.row; //do not remove - for updateAlSlct
            if (row[this.hiddenIndex])
                return "<input type='checkbox' class='" + this.tableId + "_select' name='" + this.tableId + "_id' value='" + row[this.hiddenIndex].toString() + "'/>";
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

    this.linkFromCalendar = function () {

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
        else if ($(e.target).closest("a").attr("data-linkfromcolumn") !== undefined) {
            cData = $(e.target).text();
            this.linkfromcolumn = true;
            colindex = parseInt($(e.target).closest("a").attr("data-colindex"));
        }
        else {
            cData = $(e.target).text();
            colindex = parseInt($(e.target).closest("a").attr("data-colindex"));
        }
        this.linkDV = $(e.target).closest("a").attr("data-link");
        this.linkDVColumn = $(e.target).closest("a").attr("data-column");
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
        else if (this.linkfromcolumn)
            this.filterValuesforForm = getFilterForLinkfromColumn();
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
            $("#iFrameFormPopupModal").modal("show");
            let url = `../webform/index?refid=${this.linkDV}&_params=${btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValuesforForm))))}&_mode=1${this.dvformMode}&_locId=${store.get("Eb_Loc-" + this.TenantId + this.UserId)}`;
            $("#iFrameFormPopup").attr("src", url);
        }
        else {
            if (this.login === "uc")
                dvcontainerObj.drawdvFromTable(btoa(unescape(encodeURIComponent(JSON.stringify(this.rowData)))), btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValues)))), btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValuesforForm)))), cData.toString(), this.dvformMode);//, JSON.stringify(this.filterValues)
            else
                this.OpeninNewTab(idx, cData);
        }
        //this.filterValues = [];
    };

    this.link2NewTableFromColumn = function (e) {
        this.linkDV = $(e.target).closest("a").attr("data-link");
        let Paramvalue = $(e.target).closest("a").attr("data-id");
        this.filterValuesforForm = [];
        this.filterValuesforForm.push(new fltr_obj(11, "id", Paramvalue));
        this.dvformMode = 1;
        if (this.login === "uc")
            dvcontainerObj.drawdvFromTable(btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValuesforForm)))), cData.toString(), this.dvformMode);//, JSON.stringify(this.filterValues)
        else
            this.OpeninNewTab(this.Api.row($(e.target).parents().closest("td")).index(), $(e.target).text());
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

    this.ExecuteApproval = function ($td, e) {
        $("#eb_common_loader").EbLoader("show");
        $('.btn-approval_popover').popover('hide');
        let val = $(e.target).closest("#action").find(".selectpicker").val();
        val = JSON.parse(atob(val));
        let comments = $(e.target).closest("#action").find(".comment-text").val();
        let Columns = [];
        Columns.push(new fltr_obj(16, "stage_unique_id", val.Stage_unique_id.toString()));
        Columns.push(new fltr_obj(16, "action_unique_id", val.Action_unique_id.toString()));
        Columns.push(new fltr_obj(7, "eb_my_actions_id", val.My_action_id.toString()));
        Columns.push(new fltr_obj(16, "comments", comments));
        $.ajax({
            type: "POST",
            url: "../dv/PostWebformData",
            data: { Params: Columns, RefId: val.Form_ref_id, RowId: val.Form_data_id, CurrentLoc: store.get("Eb_Loc-" + ebcontext.sid + ebcontext.user.UserId) },
            success: this.cccccc.bind(this, $td),
            error: function (xhr, error) {
                console.log(xhr); console.log(error);
                console.debug(xhr); console.debug(error);

            },
        });
    };

    this.cccccc = function ($td, resp) {
        $td.html(resp._data);
        if ($td.find(".status-label").text() === "Review Completed")
            EbMessage("show", { Message: "Review Completed", Background: "#00AD6E" });
        var cell = this.Api.cell($td);
        cell.data($td.html()).draw();
        $("#eb_common_loader").EbLoader("hide");
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
            success: this.GetData4InlineDv.bind(this, rows, idx, colindex),
            error: function (req, status, xhr) {
            }
        });
    };

    this.GetData4InlineDv = function (rows, idx, colindex, result) {
        var Dvobj = JSON.parse(result).DsObj;
        var param = this.Params4InlineTable(Dvobj, idx);
        $.ajax({
            type: "POST",
            url: "../DV/getData",
            data: param,
            success: this.LoadInlineDv.bind(this, rows, idx, Dvobj, colindex),
            error: function (req, status, xhr) {
            }
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
            $(rows).eq(idx).after("<tr class='containerrow' id='containerrow" + colindex + "'>" + str + "<td colspan='" + colspan + "'><div class='inlinetable '><div class='close' type='button' title='Close'>x</div><div class='Obj_title' id='objName" + idx + "'>" + Dvobj.DisplayName + "</div><div id='content_tbl" + idx + "'><table id='tbl" + idx + "' class='table display table-bordered compact'></table></div></td></tr></div>");

            var o = new Object();
            o.tableId = "tbl" + idx;
            o.showFilterRow = false;
            o.showSerialColumn = true;
            o.showCheckboxColumn = false;
            o.Source = "inline";
            o.scrollHeight = "200px";
            o.dvObject = Dvobj;
            o.data = result;
            o.keys = false;
            o.IsPaging = false;
            o.filterValues = btoa(unescape(encodeURIComponent(JSON.stringify(this.filterValues))));
            this.datatable = new EbCommonDataTable(o);
            if (this.EbObject.DisableRowGrouping || this.EbObject.RowGroupCollection.$values.length === 0)
                $(".inlinetable").css("width", $(window).width() - 115);
            else
                $(".inlinetable").css("width", $(window).width() - 175);
            this.datatable.Api.columns.adjust();
        }
        else {
            $(rows).eq(idx).after("<tr class='containerrow' id='containerrow" + colindex + "'>" + str + "<td colspan='" + colspan + "'><div class='inlinetable'><div class='close' type='button' title='Close'>x</div><div class='Obj_title' id='objName" + idx + "'>" + Dvobj.DisplayName + "</div><div id='canvasDivchart" + idx + "' ></div></td></tr></div>");
            o = new Object();
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

    this.Params4InlineTable = function (Dvobj, idx) {
        var dq = new Object();
        dq.RefId = Dvobj.DataSourceRefId;
        dq.TFilters = [];
        dq.Params = this.filterValues;
        dq.Start = 0;
        dq.Length = 500;
        dq.DataVizObjString = JSON.stringify(Dvobj);
        dq.TableId = "tbl" + idx;
        if (Dvobj.RowGroupCollection.$values.length > 0) {
            dq.CurrentRowGroup = JSON.stringify(Dvobj.RowGroupCollection.$values[0]);
            this.CurrentRowGroup = Dvobj.RowGroupCollection.$values[0]
        }
        else
            this.CurrentRowGroup = null;
        dq.OrderBy = this.getOrderByInfo();
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
        //$('#' + this.tableId + '_wrapper').find('.buttons-excel').click();
        this.excelbtn.prop("disabled", true);
        this.RemoveColumnRef();

        var ob = new Object();
        ob.DataVizObjString = JSON.stringify(this.EbObject);
        ob.Params = this.filterValues;
        ob.TFilters = this.columnSearch;
        ob.SubscriptionId = window.ebcontext.subscription_id;

        this.ss = new EbServerEvents({ ServerEventUrl: window.ebcontext.se_url, Channels: ["ExportToExcel"] });
        this.ss.onExcelExportSuccess = function (url) {
            window.location.href = url;
            this.excelbtn.prop("disabled", false);
            event.stopPropagation();
        }.bind(this);
        $.ajax({
            type: "POST",
            url: "../DV/exportToexcel",
            data: { req: ob }
        });
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
        $.each(this.EbObject.Columns.$values, this.updateRenderFunc_Inner.bind(this));
    };

    this.updateRenderFunc_Inner = function (i, col) {
        //this.EbObject.Columns.$values[i].sClass = "";
        //this.EbObject.Columns.$values[i].className = "";
        if (col.$type.indexOf("DVButtonColumn") === -1 && col.$type.indexOf("DVApprovalColumn") === -1 && col.$type.indexOf("DVActionColumn") === -1) {
            if (col.RenderType === parseInt(gettypefromString("Int32")) || col.RenderType === parseInt(gettypefromString("Decimal")) || col.RenderType === parseInt(gettypefromString("Int64")) || col.RenderType === parseInt(gettypefromString("Numeric"))) {

                if (this.EbObject.Columns.$values[i].Align.toString() === EbEnums.Align.Auto)
                    this.EbObject.Columns.$values[i].className += " tdheight dt-right";
            }
            else if (col.RenderType === parseInt(gettypefromString("Boolean"))) {
                if (this.EbObject.Columns.$values[i].name === "eb_void" || this.EbObject.Columns.$values[i].name === "sys_cancelled") {
                    this.EbObject.Columns.$values[i].render = (this.EbObject.Columns.$values[i].name === "sys_locked") ? this.renderLockCol.bind(this) : this.renderEbVoidCol.bind(this);
                    this.EbObject.Columns.$values[i].mRender = (this.EbObject.Columns.$values[i].name === "sys_locked") ? this.renderLockCol.bind(this) : this.renderEbVoidCol.bind(this);
                }
                else {
                    if (this.EbObject.Columns.$values[i].RenderAs.toString() === EbEnums.BooleanRenderType.IsEditable) {
                        this.EbObject.Columns.$values[i].render = this.renderEditableCol.bind(this);
                        this.EbObject.Columns.$values[i].mRender = this.renderEditableCol.bind(this);
                    }
                    else if (this.EbObject.Columns.$values[i].RenderAs.toString() === EbEnums.BooleanRenderType.Icon) {
                        this.EbObject.Columns.$values[i].render = this.renderIconCol.bind(this);
                        this.EbObject.Columns.$values[i].mRender = this.renderIconCol.bind(this);
                    }
                    else {
                        this.EbObject.Columns.$values[i].render = function (data, type, row, meta) { return data; };
                        this.EbObject.Columns.$values[i].mRender = function (data, type, row, meta) { return data; };
                    }
                }
                if (this.EbObject.Columns.$values[i].Align.toString() === EbEnums.Align.Auto)
                    this.EbObject.Columns.$values[i].className += " tdheight text-center";
            }
            else if (col.RenderType === parseInt(gettypefromString("String")) || col.RenderType == parseInt(gettypefromString("Double"))) {
                if (this.EbObject.Columns.$values[i].RenderAs.toString() === EbEnums.StringRenderType.Chart) {
                    this.EbObject.Columns.$values[i].render = this.lineGraphDiv.bind(this);
                    this.EbObject.Columns.$values[i].mRender = this.lineGraphDiv.bind(this);
                }
                //else if (this.EbObject.Columns.$values[i].RenderAs.toString() === EbEnums.StringRenderType.Image) {
                //    this.EbObject.Columns.$values[i].render = this.renderFBImage.bind(this, this.EbObject.Columns.$values[i]);
                //    this.EbObject.Columns.$values[i].mRender = this.renderFBImage.bind(this, this.EbObject.Columns.$values[i]);
                //}
                else if (this.EbObject.Columns.$values[i].RenderAs.toString() === EbEnums.StringRenderType.Icon) {
                    this.EbObject.Columns.$values[i].render = this.renderIconCol.bind(this);
                    this.EbObject.Columns.$values[i].mRender = this.renderIconCol.bind(this);
                }

                if (this.EbObject.Columns.$values[i].Align.toString() === EbEnums.Align.Auto)
                    this.EbObject.Columns.$values[i].className += " tdheight dt-left";
            }
            else if (col.RenderType === parseInt(gettypefromString("Date")) || col.RenderType == parseInt(gettypefromString("DateTime"))) {
                if (this.EbObject.Columns.$values[i].Align.toString() === EbEnums.Align.Auto)
                    this.EbObject.Columns.$values[i].className += " tdheight dt-left";
            }
        }

        if (col.name === "eb_created_by" || col.name === "eb_lastmodified_by")
            col.className += " dt-left";
        if (col.Font !== null && col.Font !== undefined) {
            var style = document.createElement('style');
            style.type = 'text/css';
            var array = [this.tableId, col.name, col.Font.FontName, col.Font.Size, col.Font.color.replace("#", "")];
            if ($("." + array.join("_")).length === 0) {
                style.innerHTML = "." + array.join("_") + "{font-family: " + col.Font.FontName + "!important; font-size: " + col.Font.Size + "px!important; color: " + col.Font.color + "!important; }";
                document.getElementsByTagName('body')[0].appendChild(style);
            }
            this.EbObject.Columns.$values[i].className = array.join("_");
            this.EbObject.Columns.$values[i].sClass = array.join("_");
        }

        if (this.EbObject.Columns.$values[i].Align.toString() === EbEnums.Align.Left)
            this.EbObject.Columns.$values[i].className += " tdheight dt-left";
        else if (this.EbObject.Columns.$values[i].Align.toString() === EbEnums.Align.Right)
            this.EbObject.Columns.$values[i].className += " tdheight dt-right";
        else if (this.EbObject.Columns.$values[i].Align.toString() === EbEnums.Align.Center)
            this.EbObject.Columns.$values[i].className += " tdheight text-center";

        this.EbObject.Columns.$values[i].sClass = this.EbObject.Columns.$values[i].className;
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
        return (data === "T") ? "<i class='fa fa-ban' aria-hidden='true'></i>" : "";
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
        $.each(this.EbObject.Columns.$values, function (i, value) {
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
        this.EbObject.Name = $("#dvnametxt").val();
        $("label.dvname").text(this.EbObject.Name);
    };

    this.ModifyTableHeight = function () {
        this.EbObject.scrollY = $("#TableHeighttxt").val();
        this.EbObject.scrollY = (this.EbObject.scrollY < 100) ? "300" : this.EbObject.scrollY;
    };

    this.renderMarker = function (data) {
        if (data !== ",")
            return `<a href='#' class ='columnMarker_${this.tableId}' data-latlong='${data}'><i class='fa fa-map-marker fa-2x' style='color:red;'></i></a>`;
        else
            return null;
    };

    this.renderFBImage = function (col, data) {
        //if (typeof (data) === "string")
        //    return `<img class='img-thumbnail' src='http://graph.facebook.com/${data}/picture?type=square' style="height: 20px;width: 25px;"/>`;
        //else
        //    return `<img class='img-thumbnail' src='http://graph.facebook.com/12345678/picture?type=square' style="height: 20px;width: 25px;"/>`;
        let _height = col.ImageHeight === 0 ? "auto" : col.ImageHeight + "px";
        let _width = col.ImageWidth === 0 ? "auto" : col.ImageWidth + "px";
        let _quality = getKeyByVal(EbEnums.ImageQuality, col.ImageQuality.toString()).toLowerCase();
        if (data !== "")
            return `<img class='img-thumbnail columnimage' src='/images/${_quality}/${data}.jpg' style="height: ${_height};width: ${_width};"/>`;
        else
            return `<img class='img-thumbnail' src='/images/image.png' style="height: ${_height};width: ${_width};"/>`;
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
    };

    this.Eb_DataTable_StyleFn = function () {
        let Tile = this.EbObject;
        let TileId = "content_" + this.tableId;
        if (Tile.IsGradient) {
            let direction = this.GradientDirection(Tile.Direction);
            let bg = "linear-gradient(" + direction + "," + Tile.GradientColor1 + "," + Tile.GradientColor2 + ")";
            $(`#${TileId}`).css("background-image", bg);
        }
        else {
            $(`#${TileId}`).css("background", Tile.BackColor);
        }

        //Tile border
        $(`#${TileId}`).css("border-radius", Tile.BorderRadius == 0 ? 4 + "px" : Tile.BorderRadius + "px");
        $(`#${TileId}`).css("border", `solid 1px ${Tile.BorderColor}`);

        //Tile Text Font 
        $(`#${TileId} tr`).css("color", `${Tile.FontColor}`);
        $(`#${TileId} th`).css({ "color": `${Tile.FontColor} !important;` });
        $(`#${TileId} td`).css({ "color": `${Tile.FontColor} !important;` });
        $(`#${TileId} a`).css("color", `${Tile.LinkColor} !important;`).css("font-size: 14px;");

        $(`#${TileId} td`).css("border-bottom", "1px solid #2b2b2b;!important");
    };

    this.GradientDirection = function (val) {
        gradient = [];
        gradient[0] = "to right";
        gradient[1] = "to left";
        gradient[2] = "to bottom";
        gradient[3] = "to bottom right";
        gradient[4] = "to bottom left";
        gradient[5] = "to top right";
        gradient[6] = "to top left";

        return gradient[val];
    };
    if (this.Source === "EbDataTable")
        this.start4EbDataTable();
    else
        this.start4Other();
};

const arrayColumn = (arr, n) => arr.map(x => x[n]);

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

var displayFilter = function (col, title, oper, val, Loper) {
    this.name = col;
    this.title = title;
    this.operator = oper;
    this.value = val;
    this.logicOp = Loper;
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

function imgError(image) {
    image.onerror = "";
    image.src = "/images/proimg.jpg";
    return true;
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
        CSSStyleDeclaration.prototype.setProperty = function (styleName, value, _priority) {
            this.setAttribute(styleName, value);
            let priority = typeof _priority != 'undefined' ? _priority : '';
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
        if (typeof node === 'undefined') {
            return this;
        }
        // CSSStyleDeclaration
        var style = this.get(0).style;
        // Getter/Setter
        if (typeof styleName !== 'undefined') {
            if (typeof value !== 'undefined') {
                // Set style property
                priority = typeof priority !== 'undefined' ? priority : '';
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