function gettypefromNumber(num) {
    if (num == 16)
        return "String";
    else if(num == 6)
        return "DateTime";
    else if (num == 3)
        return "Boolean";
    else if (num == 8 || num == 7 || num == 11)
        return "Numeric";
}

function gettypefromString(str) {
    if (str == "String")
        return "16";
    else if (str == "DateTime")
        return "6";
    else if (str == "Boolean")
        return "3";
    else if (str == "Int32")
        return "11";
    else if (str == "Decimal")
        return "7";
    else if (str == "Double")
        return "8";
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

var filter_obj = function (colu, oper, valu) {
    this.c = colu;
    this.o = oper;
    this.v = valu;
};

var coldef = function (d, t, v, w, n, ty, cls) {
    this.data = d;
    this.title = t;
    this.visible = v;
    this.width = w;
    this.name = n;
    this.type = ty;
    this.className = cls;
};

var coldef4Setting = function (d, t, cls, rnd, wid) {
    this.data = d;
    this.title = t;
    this.className = cls;
    this.render = rnd;
    this.width = wid;
};


var index = 1;
var isSettingsSaved = false;
//ds_id, dv_id, ss_url, tid, setting
var EbDataTable = function (settings) {
    this.dtsettings = settings;
    this.meta = this.dtsettings.meta;
    this.dsid = this.dtsettings.ds_id;
    this.dvid = this.dtsettings.dvRefId;
    this.dvName = null;
    this.ssurl = this.dtsettings.ss_url;
    this.ebSettings = this.dtsettings.settings;
    //this.ebSettingsCopy = $.extend(true, {}, this.ebSettings);
    this.tableId = this.dtsettings.tid;
    this.eb_agginfo = null;
    this.isSecondTime = false;
    this.Api = null;
    this.order_info = new Object();
    this.order_info.col = '';
    this.order_info.dir = 0;
    this.columnsdel = [];
    this.columnsextdel = [];
    this.MainData = null;
    this.chartJs = null;

    //Controls & Buttons
    this.table_jQO = null;
    this.btnGo = $('#btnGo');
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
    this.cellData = this.dtsettings.cellData;
    this.rowData = this.dtsettings.rowData;
    this.filterValues = this.dtsettings.filterValues;
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


    this.getColumns = function () {
        if (this.dtsettings.directLoad === undefined || this.dtsettings.directLoad === false)
            $.post('GetTVPref4User', { dvid: this.dvid, parameters: JSON.stringify((this.filterValues !== null) ? this.filterValues : this.getFilterValues()) }, this.getColumnsSuccess.bind(this));
        else
            $.post('../Dev/GetColumns', { dsid: this.dsid, parameters: JSON.stringify((this.filterValues !== null) ? this.filterValues : this.getFilterValues()) }, this.getColumnsSuccess.bind(this));
    };

    this.getColumnsSuccess = function (data) {
        //$(".tablecontainer").toggle();
        console.log(data);
        this.ebSettings = data;
        this.dsid = this.ebSettings.DataSourceRefId;//not sure..
        this.dvName = this.ebSettings.Name;
        if (this.ebSettings.scrollY == null || this.ebSettings.scrollY == undefined)
            this.ebSettings.scrollY = "300";
        if (index !== 1)
            $("#table_tabs li a[href='#dv" + this.dvid + "_tab_" + index + "']").text(this.cellData).append($("<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;' >×</button>"));
        $("#dvName_lbl" + this.tableId).text(this.dvName);
        if (this.dvName != "<Untitled>")
            $("#dvnametxt").val(this.dvName);
        //if (this.ebSettings.renderAs == "graph") {
        //    $("#graphcontainer_tab" + this.tableId).show();
        //    new eb_chart(this.ebSettings, this.ssurl, false, this.tableId);
        //    $("#graphDropdown_tab" + this.tableId + " .btn:first-child").html(this.ebSettings.options.type.trim() + "&nbsp;<span class = 'caret'></span>");
        //    return false;
        //}
        //this.addSerialAndCheckboxColumns();
        this.Init();

    };

    //this.modifyColumns = function (i, obj) {
    //    if (obj.visible == true && obj.name !== "serial" && obj.name !== "checkbox") {
    //        this.flagColumnVisible = true;
    //    }
    //};

    this.Init = function () {
        //$.each(this.ebSettings.columns, this.modifyColumns.bind(this));
        //if (this.flagColumnVisible) {
        //    this.ebSettings.columns[0].visible = true;
        //    this.ebSettings.columns[1].visible = true;
        //}
        $.event.props.push('dataTransfer');
        this.updateRenderFunc();
        this.table_jQO = $('#' + this.tableId);
        this.filterBox = $('#filterBox');
        //this.collapseFilter();
        this.totalpagebtn = $("#" + this.tableId + "_btntotalpage");
        this.copybtn = $("#btnCopy" + this.tableId);
        this.printbtn = $("#btnPrint" + this.tableId);
        this.printAllbtn = $("#btnprintAll" + this.tableId);
        this.printSelectedbtn = $("#btnprintSelected" + this.tableId);
        this.excelbtn = $("#btnExcel" + this.tableId);
        this.csvbtn = $("#btnCsv" + this.tableId);
        this.pdfbtn = $("#btnPdf" + this.tableId);
        //this.settingsbtn = $("#" + this.tableId + "_btnSettings");
        //if(index == 1)
        //    $("#table_tabs li a[href='#dv" + this.dvid + "_tab_" + index + "']").text(this.dvName);
        //else

        $.each(this.ebSettings.Columns.$values, this.CheckforColumnID.bind(this));

        this.eb_agginfo = this.getAgginfo();
        if (this.dtsettings.directLoad !== true)
            this.table_jQO.append($(this.getFooterFromSettingsTbl()));

        //if (this.ebSettings.hideSerial) {
        //    this.ebSettings.columns[0].visible = false;
        //}
        //if (!this.ebSettings.hideCheckbox) {
        //$.each(this.ebSettings.columns, this.CheckforColumnID.bind(this))
        //if (!this.FlagPresentId)
        //    this.ebSettings.columns[1].visible = false;
        //}
        //else

        this.Api = this.table_jQO.DataTable(this.createTblObject());

        this.Api.off('select').on('select', this.selectCallbackFunc.bind(this));
        //$('#' + this.tableId + ' tbody').off('click').on('click', 'tr', this.clickCallbackFunc.bind(this));
        //$('#' + this.tableId + ' tbody').off('dblclick').on('dblclick', 'tr', this.dblclickCallbackFunc.bind(this));

        //$.fn.dataTable.ext.errMode = 'throw';

        $.fn.dataTable.ext.errMode = function (settings, helpPage, message) {
            alert("ajax erpttt......");
        };

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
                return (a * 1) + (b * 1); // cast values in-case they are strings
            }, 0);

            return sum / data.length;
        });

        this.table_jQO.off('draw.dt').on('draw.dt', this.doSerial.bind(this));

        //new ResizeSensor(jQuery('#@tableId_container'), function() {
        //    if ( $.fn.dataTable.isDataTable( '#@tableId' ) )
        //        @tableId.columns.adjust();
        //});
    };

    this.addSerialAndCheckboxColumns = function () {
        var chkObj = new Object();
        chkObj.data = null;
        chkObj.title = "<input id='{0}_select-all' class='eb_selall" + this.tableId + "' type='checkbox' data-table='{0}'/>".replace("{0}", this.tableId);
        chkObj.width = 10;
        chkObj.orderable = false;
        chkObj.visible = false;
        chkObj.name = "checkbox";
        chkObj.type = "System.Boolean";
        chkObj.render = this.renderCheckBoxCol.bind(this);
        chkObj.pos = "-1";
        this.ebSettings.columns.unshift(chkObj);
        this.ebSettings.columnsext.unshift(JSON.parse('{"name":"checkbox"}'));

        this.ebSettings.columns.unshift(JSON.parse('{"width":10, "searchable": false, "orderable": false, "visible":true, "name":"serial", "title":"#", "type":"System.Int32"}'));


        this.ebSettings.columnsext.unshift(JSON.parse('{"name":"serial"}'));
    }

    this.CheckforColumnID = function (i, col) {
        if (col.name === "id") {
            //this.FlagPresentId = true;
            this.ebSettings.Columns.$values[i].bVisible = false;
            this.ebSettings.Columns.$values[1].bVisible = true;
            this.ebSettings.Columns.$values[1].sTitle = "<input id='{0}_select-all' class='eb_selall" + this.tableId + "' type='checkbox' data-table='{0}'/>".replace("{0}", this.tableId);
            this.ebSettings.Columns.$values[1].render = this.renderCheckBoxCol.bind(this);
            return false;
        }
    };

    this.createTblObject = function () {
        var o = new Object();
        o.scrollY = this.ebSettings.scrollY+"px";
        //o.scrollY = "300px";
        o.scrollX = "100%";
        if (this.dtsettings.directLoad === undefined || this.dtsettings.directLoad === false) {
            if (this.ebSettings.leftFixedColumns > 0 || this.ebSettings.rightFixedColumns > 0)
                o.fixedColumns = { leftColumns: this.ebSettings.leftFixedColumns, rightColumns: this.ebSettings.rightFixedColumns };
            //o.lengthMenu = this.ebSettings.lengthMenu;
            o.dom = "<'col-md-2 noPadding'l><'col-md-3 noPadding form-control Btninfo'i><'col-md-1 noPadding'B><'col-md-6 noPadding Btnpaginate'p>rt";
            if (!this.ebSettings.IsPaged) {

                o.dom = "<'col-md-12 noPadding'B>rt";
            }
            o.buttons = ['copy', 'csv', 'excel', 'pdf', 'print', { extend: 'print', exportOptions: { modifier: { selected: true } } }];
        }
        else if (this.dtsettings.directLoad) {
            o.paging = false;
            //o.lengthMenu = [[-1], ["All"]];
            o.dom = "rti";
        }

        //o.paging = false;
        //o.rowReorder = true;
        o.order = [[8, "asc"]];
        //o.bAutoWidth = false;
        //o.autowidth = false;
        o.serverSide = true;
        o.processing = true;
        o.language = {
            processing: "<div class='fa fa-spinner fa-pulse fa-3x fa-fw'></div>", info: "_START_ - _END_ / _TOTAL_",
            paginate: {
                "previous": "Prev"
            },
            lengthMenu: "_MENU_ / Page",
        };
        o.aoColumns = this.ebSettings.Columns.$values;
        o.order = [];
        o.deferRender = true;
        o.filter = true;
        //o.select = true;
        o.retrieve = true;
        o.keys = true;
        o.ajax = {
            url: this.ssurl + '/ds/data/' + this.dsid,
            type: 'POST',
            timeout: 180000,
            data: this.ajaxData.bind(this),
            dataSrc: this.receiveAjaxData.bind(this),
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + getToken());
            },

            crossDomain: true
        };
        o.fnRowCallback = this.rowCallBackFunc.bind(this);
        o.drawCallback = this.drawCallBackFunc.bind(this);
        o.initComplete = this.initCompleteFunc.bind(this);
        o.fnDblclickCallbackFunc = this.dblclickCallbackFunc.bind(this);
        //alert(JSON.stringify(o));
        return o;
    };

    this.ajaxData = function (dq) {
        //alert("xxxxxx");
        delete dq.columns; delete dq.order; delete dq.search;
        dq.RefId = this.dsid;
        //dq.Token = getToken();
        //dq.rToken = getrToken();
        //if (this.dtsettings.filterParams === null || this.dtsettings.filterParams === undefined)
        var serachItems = this.repopulate_filter_arr();
        dq.TFilters = JSON.stringify(serachItems);
        //else {
        //    var arr = [];
        //    arr.push(new filter_obj(this.dtsettings.filterParams.column, "x*", this.dtsettings.filterParams.key));
        //    dq.TFilters = JSON.stringify(arr);
        //}
        dq.Params = JSON.stringify((this.filterValues !== null && this.filterValues !== undefined) ? this.filterValues : this.getFilterValues());
        dq.OrderByCol = this.order_info.col;
        dq.OrderByDir = this.order_info.dir;
        if (serachItems.length > 0) {
            this.filterFlag = true;
        }

        return dq;
    };

    this.getFilterValues = function () {
        var fltr_collection = [];
        var paramstxt = "datefrom,dateto";//$('#hiddenparams').val().trim();datefrom,dateto
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

        if (this.rowData !== null) {
            $.each(this.rowData, this.rowObj2filter.bind(this, fltr_collection));
        }

        return fltr_collection;
    };

    this.rowObj2filter = function (fltr_collection, i, data) {
        var type = this.Api.settings().init().columns[i + 2].type;
        if (type === "System.Int32" || type === "System.Int16")
            type = 12;
        else if (type === "System.Decimal" || type === "System.Double" || type === "System.Int64")
            type = 7;
        else if (type === "System.String")
            type = 16;
        fltr_collection.push(new fltr_obj(type, this.Api.settings().init().columns[i + 2].name, data));
    };

    this.receiveAjaxData = function (dd) {
        this.MainData = dd.data;
        //if (!dd.IsPaged) {
        //    this.Api.paging = dd.IsPaged;
        //    this.Api.lengthChange = false;
        //}
        return dd.data;
    };

    //$("form").submit(function (e) {
    //    if (isValid()) {
    //        if (!this.isSecondTime) {
    //            this.isSecondTime = true;
    //            this.RenderGraphModal();
    //            this.getColumns();
    //        }
    //        else {
    //            this.filterBox.collapse("hide");
    //            this.Api.ajax.reload();
    //        }
    //    }
    //    e.preventDefault();
    //});

    this.btnGoClick = function (e) {
        var controlIds = ["datefrom", "dateto"];// temp

        //if (isValid(controlIds)) {
        this.btnGo.attr("disabled", true);
        if (this.columnDefDuplicate !== JSON.stringify(this.ebSettings.Columns.$values)) {
            this.dragNdrop = true;
            this.columnDefDuplicate = JSON.stringify(this.ebSettings.Columns.$values);
        }
        if (!this.isSecondTime) {
            this.isSecondTime = true;
            this.RenderGraphModal();
            if (this.ebSettings !== null)
                this.getColumnsSuccess(this.ebSettings);
            else
                this.getColumns();
        }
        else if (this.dragNdrop) {
            this.ebSettings.Columns.$values.sort(this.ColumnsComparer);
            $.each(this.ebSettings.Columns.$values, function (i, obj) {
                if (obj.fontfamily != 0){
                    var style = document.createElement('style');
                    style.type = 'text/css';
                    var fontName = obj.fontfamily.replace(/_/g, " ");
                    var replacedName = obj.fontfamily;
                    style.innerHTML = '.font_' + replacedName + '{font-family: ' + fontName + ';}';
                    document.getElementsByTagName('body')[0].appendChild(style);
                    obj.className = "font_" + replacedName+" tdheight";
                    obj.sClass = "font_" + replacedName + " tdheight";
                }
                });
            //this.ebSettings.columnsext.sort(this.ColumnsComparer);
            $('#' + this.tableId + 'divcont').children("#" + this.tableId + "_wrapper").remove();
            var table = $(document.createElement('table')).addClass('table table-striped table-bordered').attr('id', this.tableId);
            $('#' + this.tableId + 'divcont').append(table);
            this.Init();
            this.dragNdrop = false
        }
        else {
            this.Api.ajax.reload();
        }
        e.preventDefault();
    };

    this.ColumnsComparer = function (a, b) {
        //var a1 = parseInt(a.pos);
        //var b1 = parseInt(b.pos);
        if (a.Pos < b.Pos) return -1;
        if (a.Pos > b.Pos) return 1;
        if (a.Pos === b.Pos) return 0;
    };

    this.getAgginfo = function () {
        var _ls = [];
        $.each(this.ebSettings.Columns.$values, this.getAgginfo_inner.bind(this, _ls));
        return _ls;
    };

    this.getAgginfo_inner = function (_ls, i, col) {
        if (col.bVisible && (col.Type ==parseInt( gettypefromString("Int32")) || col.Type ==parseInt( gettypefromString("Decimal")) || col.Type ==parseInt( gettypefromString("Int64")) || col.Type ==parseInt( gettypefromString("Double"))) && col.name !== "serial")
            _ls.push(new Agginfo(col.name, this.ebSettings.Columns.$values[i].DecimalPlaces));
    };

    this.getFooterFromSettingsTbl = function () {
        var ftr_part = "";
        $.each(this.ebSettings.Columns.$values, function (i, col) {
            if (col.bVisible)
                ftr_part += "<th style=\"padding: 0px; margin: 0px\"></th>";
            else
                ftr_part += "<th style=\"display:none;\"></th>";
        });
        return "<tfoot>" + ftr_part + "<tr>" + ftr_part + "</tr></tfoot>";
    };

    this.repopulate_filter_arr = function () {
        var table = this.tableId;
        var filter_obj_arr = [];
        var api = this.Api;
        if (api !== null) {
            $.each(this.Api.columns().header().toArray(), function (i, obj) {
                //var colum = $(obj).children('span').text();
                var colum = $(obj).text();
                if (colum !== '') {
                    var oper;
                    var val1, val2;
                    var textid = '#' + table + '_' + colum + '_hdr_txt1';
                    var type = $(textid).attr('data-coltyp');
                    if (type === 'boolean') {
                        val1 = ($(textid).is(':checked')) ? "true" : "false";
                        if (!($(textid).is(':indeterminate')))
                            filter_obj_arr.push(new filter_obj(((table === "dv13") ? "INV." : "") + colum, "=", val1));
                    }
                    else {
                        oper = $('#' + table + '_' + colum + '_hdr_sel').text();
                        if (api.columns(i).visible()[0]) {
                            if (oper !== '' && $(textid).val() !== '') {
                                //alert(colum + "," + oper + "," + $(textid).val());
                                if (oper === 'B') {
                                    val1 = $(textid).val();
                                    val2 = $(textid).siblings('input').val();
                                    if (oper === 'B' && val1 !== '' && val2 !== '') {
                                        if (type === 'number') {
                                            filter_obj_arr.push(new filter_obj(colum, ">=", Math.min(val1, val2)));
                                            filter_obj_arr.push(new filter_obj(colum, "<=", Math.max(val1, val2)));
                                        }
                                        else if (type === 'date') {
                                            if (val2 > val1) {
                                                filter_obj_arr.push(new filter_obj(colum, ">=", val1));
                                                filter_obj_arr.push(new filter_obj(colum, "<=", val2));
                                            }
                                            else {
                                                filter_obj_arr.push(new filter_obj(colum, ">=", val2));
                                                filter_obj_arr.push(new filter_obj(colum, "<=", val1));
                                            }
                                        }
                                    }
                                }
                                else {
                                    filter_obj_arr.push(new filter_obj(colum, oper, $(textid).val()));
                                }
                            }
                        }
                    }
                }
            });
        }
        return filter_obj_arr;
    };

    this.rowCallBackFunc = function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
        this.colorRow(nRow, aData, iDisplayIndex, iDisplayIndexFull);
    };

    this.initCompleteFunc = function (settings, json) {
        if (this.dtsettings.directLoad === undefined || this.dtsettings.directLoad === false) {
            if (!this.flagAppendColumns)
                this.GenerateButtons();
        }
        this.createFilterRowHeader();
        if (this.eb_agginfo.length > 0) {
            this.createFooter(0);
            this.createFooter(1);
        }
        this.addFilterEventListeners();

        if (this.dtsettings.initComplete)
            this.dtsettings.initComplete();
        //setTimeout(function () {
        //    var wid = parseInt($(".dataTables_scrollHead table:eq(0)").css("width"));
        //    alert(wid);
        //    $(".dataTables_scrollFoot table:eq(0)").css("width",wid);
        //},500);
        //if (this.ebSettings.renderAs == "both") {
        $("#graphcontainer_tab" + this.tableId).show();
        if (this.chartJs == null)
            this.chartJs = new eb_chart(this.ebSettings, this.ssurl, this.MainData, this.tableId);
        else
            this.chartJs.drawGraphHelper(this.Api.data());
        //$("#graphDropdown_tab" + this.tableId + " .btn:first-child").html(this.ebSettings.options.type.trim() + "&nbsp;<span class = 'caret'></span>");
        //}
        //else{
        //    $("#showgraphbtn" + this.tableId).hide();
        //}
        if (!this.flagAppendColumns) {
            this.appendColumns();
            //this.appendDisplayColumns();
        }
        //$("#dvnametxt").show();
        //$("#dvnametxt").css("display", "inline-block"); 
        //$("#TableHeighttxt").show();
        //$("#TableHeighttxt").css("display", "inline-block");
        //$("#Save_btn").show();
        //$("#renderOption").show();
        //$("#renderOption").css("display", "inline-flex");
        if (this.filterBox.css("display") !== "none") 
            this.collapseFilter();
        this.Api.columns.adjust();
    }

    this.drawCallBackFunc = function (settings) {
        $('tbody [data-toggle=toggle]').bootstrapToggle();
        //if (this.ebSettings.rowGrouping !== '') { this.doRowgrouping(); }
        this.summarize2();
        this.addFilterEventListeners();
        this.Api.columns.adjust();
        //if (this.ebSettings.renderAs == "both") {
        if (this.chartJs !== null)
            this.chartJs.drawGraphHelper(this.Api.data());
        //}
        this.btnGo.attr("disabled", false);
    };

    this.selectCallbackFunc = function (e, dt, type, indexes) {
        //alert("selectCallbackFunc");
        //if (this.dtsettings.fnKeyUpCallback)
        //    this.dtsettings.fnKeyUpCallback(e, datatable, cell, originalEvent);
    };

    this.clickCallbackFunc = function (e) {
        //alert($($(e.target).parent()).html());
        //this.Api.row(e.currentTarget).select();
        if (this.dtsettings.fnClickCallbackFunc)
            this.dtsettings.fnClickCallbackFunc(e, this.Api);
    };

    this.dblclickCallbackFunc = function (e) {
        //alert("fnDblclickCallbackFunc");
        //this.Api.rows(e.target).select();
        if (this.dtsettings.fnDblclickCallbackFunc)
            this.dtsettings.fnDblclickCallbackFunc(e);
    };

    this.doRowgrouping = function () {
        var rows = this.Api.rows({ page: 'current' }).nodes();
        var last = null;

        this.Api.column(this.Api.columns(this.ebSettings.rowGrouping + ':name').indexes()[0], { page: 'current' }).data().each(function (group, i) {
            if (last !== group) {
                $(rows).eq(i).before('<tr class=\'group\'><td colspan=\'15\'>' + group + '</td></tr>');
                last = group;
            }
        });
    };

    this.doSerial = function () {
        this.Api.column(0).nodes().each(function (cell, i) { cell.innerHTML = i + 1; });
    };

    this.createFooter = function (pos) {
        var tx = this.ebSettings;
        var lfoot = $('#' + this.tableId + '_wrapper .DTFC_LeftFootWrapper table');
        var rfoot = $('#' + this.tableId + '_wrapper .DTFC_RightFootWrapper table');
        var scrollfoot = $('#' + this.tableId + '_wrapper .dataTables_scrollFootInner table');

        if (lfoot !== null || rfoot !== null)
            var eb_footer_controls_lfoot = this.GetAggregateControls(pos, 50);
        if (scrollfoot !== null)
            var eb_footer_controls_scrollfoot = this.GetAggregateControls(pos, 1);
        $('#' + this.tableId + '_btntotalpage').show();
        if (pos === 1)
            $('#' + this.tableId + '_wrapper .dataTables_scrollFootInner tfoot tr:eq(' + pos + ')').hide();
        var j = 0;
        $('#' + this.tableId + '_wrapper .dataTables_scrollFootInner tfoot tr:eq(' + pos + ') th').each(function (idx) {
            if (lfoot !== null) {
                if (j < tx.leftFixedColumns)
                    $(this).html(eb_footer_controls_lfoot[idx]);
            }

            if (rfoot !== null) {
                if (j === eb_footer_controls_lfoot.length - tx.rightFixedColumns) {
                    if (j < eb_footer_controls_lfoot.length)
                        $(this).html(eb_footer_controls_lfoot[idx]);
                }
            }

            if (scrollfoot !== null) {
                if (tx.leftFixedColumns + tx.rightFixedColumns > 0) {
                    if (j < eb_footer_controls_scrollfoot.length - tx.rightFixedColumns)
                        $(this).html(eb_footer_controls_scrollfoot[idx]);
                }

                else {
                    if (j < eb_footer_controls_scrollfoot.length)
                        $(this).html(eb_footer_controls_scrollfoot[idx]);
                }
            }

            j++;
        });

        this.summarize2();
    };

    this.GetAggregateControls = function (footer_id, zidx) {
        var ScrollY = this.ebSettings.scrollY;
        var ResArray = [];
        var tableId = this.tableId;
        $.each(this.ebSettings.Columns.$values, this.GetAggregateControls_inner.bind(this, ResArray, footer_id, zidx));
        return ResArray;
    };

    this.GetAggregateControls_inner = function (ResArray, footer_id, zidx, i, col) {
        var _ls;
        if (col.bVisible) {
            if ((col.Type ==parseInt( gettypefromString("Int32")) || col.Type ==parseInt( gettypefromString("Decimal")) || col.type ==parseInt( gettypefromString("Int64")) || col.Type ==parseInt( gettypefromString("Double"))) && col.name !== "serial") {
                var footer_select_id = this.tableId + "_" + col.name + "_ftr_sel" + footer_id;
                var fselect_class = this.tableId + "_fselect";
                var data_colum = "data-column=" + col.name;
                var data_table = "data-table=" + this.tableId;
                var footer_txt = this.tableId + "_" + col.name + "_ftr_txt" + footer_id;
                var data_decip = "data-decip=" + this.ebSettings.Columns.$values[i].DecimalPlaces;

                _ls = "<div class='input-group input-group-sm'>" +
                "<div class='input-group-btn'>" +
                "<button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='" + footer_select_id + "'>&sum;</button>" +
               " <ul class='dropdown-menu'>" +
                "  <li><a href ='#' class='eb_ftsel" + this.tableId + "' data-sum='Sum' " + data_table + " " + data_colum + " " + data_decip + ">&sum;</a></li>" +
                "  <li><a href ='#' class='eb_ftsel" + this.tableId + "' " + data_table + " " + data_colum + " " + data_decip + " {4}>x&#772;</a></li>" +
               " </ul>" +
               " </div>" +
               " <input type='text' class='form-control' id='" + footer_txt + "' disabled style='text-align: right;' style='z-index:" + zidx.toString() + "'>" +
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
        var p;
        var ftrtxt;
        $.each(this.eb_agginfo, function (index, agginfo) {
            if (scrollY > 0) {
                p = $('.dataTables_scrollFootInner #' + tableId + '_' + agginfo.colname + '_ftr_sel0').text().trim();
                ftrtxt = '.dataTables_scrollFootInner #' + tableId + '_' + agginfo.colname + '_ftr_txt0';
                //alert(p); alert(ftrtxt);
            }
            else {
                p = $('#' + tableId + '_' + agginfo.colname + '_ftr_sel0').text().trim();
                ftrtxt = '#' + tableId + '_' + agginfo.colname + '_ftr_txt0';
            }
            var col = api.column(agginfo.colname + ':name');

            var summary_val = 0;
            if (p === '∑')
                summary_val = col.data().sum();
            if (p === 'x̄') {
                summary_val = col.data().average();
            }
            // IF decimal places SET, round using toFixed
            //  alert(summary_val + "," + summary_val);
            //$(ftrtxt).val((agginfo.deci_val > 0) ? summary_val.toFixed(agginfo.deci_val) : summary_val.toFixed(2));
            $(ftrtxt).val(summary_val.toFixed(agginfo.deci_val));
        });
    };

    this.createFilterRowHeader = function () {
        var tableid = this.tableId;
        var order_info_ref = this.order_info;

        var fc_lh_tbl = $('#' + tableid + '_wrapper .DTFC_LeftHeadWrapper table');
        var fc_rh_tbl = $('#' + tableid + '_wrapper .DTFC_RightHeadWrapper table');

        if (fc_lh_tbl !== null || fc_rh_tbl !== null) {
            this.GetFiltersFromSettingsTbl(50);
            if (fc_lh_tbl !== null) {
                fc_lh_tbl.find("thead").append($("<tr role='row' class='addedbyeb'/>"));
                for (var j = 0; j < this.ebSettings.leftFixedColumns; j++)
                    $(fc_lh_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4fc[j]));
            }
            if (fc_rh_tbl !== null) {
                fc_rh_tbl.find("thead").append($("<tr role='row' class='addedbyeb'/>"));
                for (var j = this.eb_filter_controls_4fc.length - this.ebSettings.rightFixedColumns; j < this.eb_filter_controls_4fc.length; j++)
                    $(fc_rh_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4fc[j]));
            }
        }

        var sc_h_tbl = $('#' + tableid + '_wrapper .dataTables_scrollHeadInner table');
        if (sc_h_tbl !== null) {
            this.GetFiltersFromSettingsTbl(1);
            sc_h_tbl.find("thead").append($("<tr role='row' class='addedbyeb'/>"));
            if (this.ebSettings.leftFixedColumns + this.ebSettings.rightFixedColumns > 0) {
                for (var j = 0; j < this.eb_filter_controls_4sb.length; j++) {
                    if (j < this.ebSettings.leftFixedColumns)
                        $(sc_h_tbl.find("tr[class=addedbyeb]")).append("<th>&nbsp;</th>");
                    else {
                        if (j < this.eb_filter_controls_4sb.length - this.ebSettings.rightFixedColumns)
                            $(sc_h_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4sb[j]));
                        else
                            $(sc_h_tbl.find("tr[class=addedbyeb]")).append("<th>&nbsp;</th>");
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
    };

    this.addFilterEventListeners = function () {
        $('#' + this.tableId + '_wrapper thead tr:eq(0)').off('click').on('click', 'th', this.orderingEvent.bind(this));
        $(".eb_fsel" + this.tableId).off("click").on("click", this.setLiValue.bind(this));
        $(".eb_ftsel" + this.tableId).off("click").on("click", this.fselect_func.bind(this));
        $.each($(this.Api.columns().header()).parent().siblings().children().toArray(), this.setFilterboxValue.bind(this));
        $(".eb_fbool" + this.tableId).off("change").on("change", this.toggleInFilter.bind(this));
        $(".eb_selall" + this.tableId).off("click").on("click", this.clickAlSlct.bind(this));
        $("." + this.tableId + "_select").off("change").on("change", this.updateAlSlct.bind(this));
        $(".eb_canvas" + this.tableId).off("click").on("click", this.renderMainGraph);
        $(".tablelink_" + this.tableId).off("click").on("click", this.link2NewTable.bind(this));
        $(".closeTab").off("click").on("click", this.deleteTab.bind(this));


        this.Api.on('key-focus', function (e, datatable, cell) {
            datatable.rows().deselect();
            datatable.row(cell.index().row).select();
        });

        //this.filterbtn.off("click").on("click", this.showOrHideFilter.bind(this));
        $("#clearfilterbtn_" + this.tableId).off("click").on("click", this.clearFilter.bind(this));
        this.totalpagebtn.off("click").on("click", this.showOrHideAggrControl.bind(this));
        this.copybtn.off("click").on("click", this.CopyToClipboard.bind(this));
        this.printbtn.off("click").on("click", this.ExportToPrint.bind(this));
        this.printAllbtn.off("click").on("click", this.printAll.bind(this));
        this.printSelectedbtn.off("click").on("click", this.printSelected.bind(this));
        this.excelbtn.off("click").on("click", this.ExportToExcel.bind(this));
        this.csvbtn.off("click").on("click", this.ExportToCsv.bind(this));
        this.pdfbtn.off("click").on("click", this.ExportToPdf.bind(this));
        $("#" + this.tableId + "_btnSettings").off("click").on("click", this.GetSettingsWindow.bind(this));
        $("#btnCollapse" + this.tableId).off("click").on("click", this.collapseFilter.bind(this));
        //$("#showgraphbtn" + this.tableId).off("click").on("click", this.showGraph.bind(this));
        $("#Save_btn").off("click").on("click", this.saveSettings.bind(this));
        $("#dvnametxt").off("keyup").on("keyup", this.ModifyDvname.bind(this));
        $("#TableHeighttxt").off("keyup").on("keyup", this.ModifyTableHeight.bind(this));
        //$("input[name=renderAs]").off("click").on("click", this.graphSettings.bind(this));
        //$("#settingsbtn").off("click").on("click", this.getdvWindow.bind(this));
    };


    this.GenerateButtons = function () {
        $("#TableControls_" + this.tableId).prepend("<div style='display: inline;float: right;'>" +
            "<a id='showgraphbtn" + this.tableId + "' class='btn btn-default' href='#graphcontainer_tab" + this.tableId + "'><i class='fa fa-line-chart'></i></a>" +
            "<button type='button' id='" + this.tableId + "_btntotalpage' class='btn btn-default' style='display: none;' data-table='@tableId'>&sum;</button>" +
            "<div id='" + this.tableId + "_fileBtns' style='display: inline-block;'>" +
             "<div class='btn-group'>" +
                "<div class='btn-group'>" +
                   " <div id='btnPrint" + this.tableId + "' class='btn btn-default'  name='filebtn' data-toggle='tooltip' title='Print' ><i class='fa fa-print' aria-hidden='true'></i></div>" +
                       " <div class='btn btn-default dropdown-toggle' data-toggle='dropdown' name='filebtn' style='display: none;'>" +
                         "   <span class='caret'></span>  <!-- caret --></div>" +
                         "   <ul class='dropdown-menu' role='menu'>" +
                          "      <li><a href = '#' id='btnprintAll" + this.tableId + "'> Print All</a></li>" +
                           "     <li><a href = '#' id='btnprintSelected" + this.tableId + "'> Print Selected</a></li>" +
                            "</ul>" +
                "</div>" +
                "<div id='btnExcel" + this.tableId + "' class='btn btn-default'  name='filebtn' data-toggle='tooltip' title='Excel' ><i class='fa fa-file-excel-o' aria-hidden='true'></i></div>" +
                "<div id='btnPdf" + this.tableId + "' class='btn btn-default'    name='filebtn'  data-toggle='tooltip' title='Pdf' ><i class='fa fa-file-pdf-o' aria-hidden='true'></i></div>" +
                "<div id='btnCsv" + this.tableId + "' class='btn btn-default'    name='filebtn' data-toggle='tooltip' title='Csv' ><i class='fa fa-file-text-o' aria-hidden='true'></i></div>  " +
                "<div id='btnCopy" + this.tableId + "' class='btn btn-default'  name='filebtn' data-toggle='tooltip' title='Copy to Clipboard' ><i class='fa fa-clipboard' aria-hidden='true'></i></div>" +
            "</div>" +
            "</div>" +
            "<a id='" + this.tableId + "_btnSettings' class='btn btn-default'><i class='fa fa-cog' aria-hidden='true'></i></a>" +
            "<div id ='btnCollapse" + this.tableId + "' class='btn btn-default'>" +
                   " <i class='fa fa-chevron-down' aria-hidden='true'></i>" +
               " </div>" +
            "</div>");
    };


    this.setFilterboxValue = function (i, obj) {
        if (this.dtsettings.filterParams !== null && this.dtsettings.filterParams !== undefined) {
            var colum = $(obj).children('span').text();
            if (colum === this.dtsettings.filterParams.column) {
                $(obj).children('div').children('.eb_finput').val(this.dtsettings.filterParams.key);
            }
        }
        //else
        $(obj).children('div').children('.eb_finput').off("keypress").on("keypress", this.call_filter);

    };

    this.orderingEvent = function (e) {
        //var col = $(e.target).children('span').text();
        var col = $(e.target).text();
        var cls = $(e.target).attr('class');
        if (col !== '') {
            this.order_info.col = col;
            this.order_info.dir = (cls.indexOf('sorting_asc') > -1) ? 2 : 1;
        }
    };

    this.GetFiltersFromSettingsTbl = function (zidx) {
        this.zindex = zidx;
        if (this.zindex === 50)
            this.eb_filter_controls_4fc = [];
        else if (this.zindex === 1)
            this.eb_filter_controls_4sb = [];

        $.each(this.ebSettings.Columns.$values, this.GetFiltersFromSettingsTbl_inner.bind(this));
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

            _ls += "<th style='vertical-align:top; padding: 0px; margin: 0px; height: 28px!important;'>";
            if (col.name === "serial") {
                _ls += (span + "<a class='btn btn-sm center-block'  id='clearfilterbtn_" + this.tableId + "' data-table='@tableId' data-toggle='tooltip' title='Clear Filter' style='height:100%'><i class='fa fa-times' aria-hidden='true' style='color:red'></i></a>");
            }
            else {
                if (col.Type ==parseInt( gettypefromString("Int32")) || col.Type ==parseInt( gettypefromString("Decimal")) || col.Type ==parseInt( gettypefromString("Int64")) || col.Type ==parseInt( gettypefromString("Double")))
                    _ls += (span + this.getFilterForNumeric(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex));
                else if (col.Type == parseInt( gettypefromString("String"))) {
                    //if (this.dtsettings.filterParams === null || this.dtsettings.filterParams === undefined)
                    _ls += (span + this.getFilterForString(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex));
                    //else
                    //   _ls += (span + this.getFilterForString(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, this.dtsettings.filterParams));
                }
                else if (col.Type ==parseInt( gettypefromString("DateTime")))
                    _ls += (span + this.getFilterForDateTime(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex));
                else if (col.Type == parseInt(gettypefromString("Boolean")) && col.name !== "checkbox")
                    _ls += (span + this.getFilterForBoolean(col.name, this.tableId, this.zindex));
                else
                    _ls += (span);
            }

            _ls += ("</th>");
        }
        ((this.zindex === 50) ? this.eb_filter_controls_4fc : this.eb_filter_controls_4sb).push(_ls);
    };

    this.getFilterForNumeric = function (header_text1, header_select, data_table, htext_class, data_colum, header_text2, zidx) {
        var coltype = "data-coltyp='number'";
        var drptext = "";

        drptext = "<div class='input-group input-group-sm' style='width:100%!important'>" +
        "<div class='input-group-btn' style='height:100%!important'>" +
            " <button type='button' style='width:100% !important;height:100%!important;' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='" + header_select + "'> = </button>" +
            " <ul class='dropdown-menu'  style='z-index:" + zidx.toString() + "'>" +
            "   <li ><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">=</a></li>" +
              " <li><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "><</a></li>" +
              " <li><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">></a></li>" +
              " <li><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "><=</a></li>" +
              " <li><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">>=</a></li>" +
              "<li><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">B</a></li>" +
            " </ul>" +
        " </div>" +
        " <input type='number' style='width:100%!important' class='form-control eb_finput " + htext_class + "' id='" + header_text1 + "' " + data_table + data_colum + coltype + ">" +
        //" <span class='input-group-btn'></span>" +
        //" <input type='number' class='form-control eb_finput " + htext_class + "' id='" + header_text2 + "' style='visibility: hidden' " + data_table + data_colum + coltype + ">" +
        " </div> ";
        return drptext;
    };

    this.getFilterForDateTime = function (header_text1, header_select, data_table, htext_class, data_colum, header_text2, zidx) {
        var coltype = "data-coltyp='date'";
        var filter = "<div class='input-group input-group-sm' style='width:100%!important'>" +
        "<div class='input-group-btn' style='height:100%!important'>" +
           " <button type='button' style='width:100% !important;height:100% !important;' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='" + header_select + "'> = </button>" +
            "<ul class='dropdown-menu'  style='z-index:" + zidx.toString() + "'>" +
             " <li ><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">=</a></li>" +
             " <li><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "><</a></li>" +
             " <li><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">></a></li>" +
             " <li><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + "><=</a></li>" +
             " <li><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">>=</a></li>" +
             " <li ><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">B</a></li>" +
           " </ul>" +
        " </div>" +
        " <input type='date' style='width:100%!important' class='form-control eb_finput " + htext_class + "' id='" + header_text1 + "' " + data_table + data_colum + coltype + ">" +
        //" <span class='input-group-btn'></span>" +
        //" <input type='date' class='form-control eb_finput " + htext_class + "' id='" + header_text2 + "' style='visibility: hidden' " + data_table + data_colum + coltype + ">" +
        " </div> ";
        return filter;
    };

    this.getFilterForString = function (header_text1, header_select, data_table, htext_class, data_colum, header_text2, zidx) {
        var coltype = " data-coltyp='string'";
        var drptext = "";
        drptext = "<div class='input-group input-group-sm' style='width:100%!important'>" +
        "<div class='input-group-btn' style='z-index:" + zidx.toString() + "'>" +
           " <button type='button' style='width:100% !important' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='" + header_select + "'>x*</button>" +
           " <ul class='dropdown-menu'>" +
           "   <li ><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">x*</a></li>" +
            "  <li><a href ='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">*x</a></li>" +
            "  <li><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">*x*</a></li>" +
             " <li><a href='#' class='eb_fsel" + this.tableId + "' " + data_table + data_colum + ">=</a></li>" +
           " </ul>" +
        " </div>" +
        " <input type='text' style='width:100%!important'  class='form-control eb_finput " + htext_class + "' id='" + header_text1 + "' " + data_table + data_colum + coltype + ">" +
        " </div> ";
        return drptext;
    };

    this.getFilterForBoolean = function (colum, tableId, zidx) {
        var filter = "";
        var id = tableId + "_" + colum + "_hdr_txt1";
        var cls = tableId + "_hchk";
        filter = "<center><input type='checkbox' id='" + id + "' data-colum='" + colum + "' data-coltyp='boolean' data-table='" + tableId + "' class='" + cls + " " + tableId + "_htext eb_fbool" + this.tableId + "' style='vertical-align: middle;'></center>";
        return filter;
    };

    //this.showOrHideFilter = function (e) {
    //    if ($('#' + this.tableId + '_wrapper table thead tr[class=addedbyeb]').is(':visible'))
    //        $('#' + this.tableId + '_wrapper table thead tr[class=addedbyeb]').hide();
    //    else {
    //        $('#' + this.tableId + '_wrapper table thead tr[class=addedbyeb]').show();
    //    }

    //    this.clearFilter(e);
    //};

    this.clearFilter = function () {
        var flag = false;
        var tableid = this.tableId;
        $('#' + tableid + '_wrapper table:eq(0) .' + tableid + '_htext').each(function (i) {
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
            this.Api.ajax.reload();
            this.filterFlag = false;

        }
    };

    this.setLiValue = function (e) {
        var selText = $(e.target).text();
        var table = $(e.target).attr('data-table');
        var flag = false;
        var colum = $(e.target).attr('data-colum');
        var ctype = $(e.target).parents('.input-group').find("input").attr('data-coltyp');
        $(e.target).parents('.input-group-btn').find('.dropdown-toggle').html(selText);
        //" <input type='number' class='form-control eb_finput " + htext_class + "' id='" + header_text2 + "' style='visibility: hidden' " + data_table + data_colum + coltype + ">"dv173_1_discount_hdr_txt1
        //$(e.target).parents('.input-group').find('#' + table + '_' + colum + '_hdr_txt2').eq(0).css('visibility', ((selText.trim() === 'B') ? 'visible' : 'hidden'));
        if (selText.trim() === 'B') {
            if ($(e.target).parents('.input-group').find("input").length == 1) {
                $(e.target).parents('.input-group').append("<input type='" + ctype + "' style='width:100%!important' class='form-control eb_finput " + this.tableId + "_htext' id='" + this.tableId + "_" + colum + "_hdr_txt2'>");
                //$($(e.target).parents('.input-group-btn')).attr("style='height:100% !important'");
                //$($(e.target).parents('ul').siblings("button")).css("height", "100%!important");
            }
            //flag = true;
        }
        else if (selText.trim() !== 'B') {
            if ($(e.target).parents('.input-group').find("input").length == 2) {
                $(e.target).parents('.input-group').find("input").eq(1).remove();
                //$(e.target).parents('.input-group-btn').css("height", " ");
                //$(e.target).parents('ul').siblings("button").css("height", " ");
            }
            //flag = false;
        }
        this.Api.columns.adjust();
        e.preventDefault();
    };

    this.call_filter = function (e) {
        if (e.keyCode === 13)
            $('#' + $(e.target).attr('data-table')).DataTable().ajax.reload();
    };

    this.toggleInFilter = function (e) {
        var table = $(e.target).attr('data-table');
        this.Api.ajax.reload();
    };

    this.fselect_func = function (e) {
        var selValue = $(e.target).text().trim();
        $(e.target).parents('.input-group-btn').find('.dropdown-toggle').html(selValue);
        var table = $(e.target).attr('data-table');
        var colum = $(e.target).attr('data-column');
        var decip = $(e.target).attr('data-decip');
        var col = this.Api.column(colum + ':name');
        var ftrtxt;

        if (this.ebSettings.scrollY > 0)
            ftrtxt = '.dataTables_scrollFootInner #' + this.tableId + '_' + colum + '_ftr_txt0';
        else
            ftrtxt = '#' + this.tableId + '_' + colum + '_ftr_txt0';

        if (selValue === '∑')
            pageTotal = col.data().sum();
        else if (selValue === 'x̄')
            pageTotal = col.data().average();
        // IF decimal places SET, round using toFixed  
        //$(ftrtxt).val((decip > 0) ? pageTotal.toFixed(decip) : pageTotal.toFixed(2));
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
        //if (this.FlagPresentId) {
        var idpos = $.grep(this.ebSettings.Columns.$values, function (e) { return e.name === "id"; })[0].data;
        this.rowId = meta.row; //do not remove - for updateAlSlct
        return "<input type='checkbox' class='" + this.tableId + "_select' name='" + this.tableId + "_id' value='" + row[idpos].toString() + "'/>";
        //}
        //else
        //    return "<input type='checkbox'";
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
        if (this.ebSettings.scrollY !== 0)
            $('#' + this.tableId + '_wrapper .dataTables_scrollFootInner tfoot tr:eq(1)').toggle();
        else
            $('#' + this.tableId + '_wrapper .dataTables_scrollFootInner tfoot tr:eq(1)').toggle();
    };

    this.link2NewTable = function (e) {
        this.cellData = $(e.target).text();
        var idx = this.Api.row($(e.target).parent().parent()).index();
        this.rowData = this.Api.row(idx).data();
        this.filterValues = this.getFilterValues();
        this.NewTableModal();
    };

    this.NewTableModal = function () {
        index++;
        $("#table_tabs").append("<li class='nav-item'>" +
                   " <a class='nav-link' href='#dv" + this.linkDV + "_tab_" + index + "' data-toggle='tab'>" +

                    "</a>" +
               " </li>");
        $("#table_tabcontent").append("<div id='dv" + this.linkDV + "_tab_" + index + "' class='tab-pane active'>" +
                "<div id='TableControls_dv" + this.linkDV + "_" + index + "' class = 'well well-sm' style='margin-bottom:5px!important;'>" +
                   " <div style='display: inline;'>" +
                    "    <label id='dvName_lbldv" + this.linkDV + "_" + index + "'></label>" +
                   " </div>" +
                "</div>" +
                "<div style='width:auto;' id='dv" + this.linkDV + "_" + index + "divcont'>" +
                " <table id='dv" + this.linkDV + "_" + index + "' class='table table-striped table-bordered'></table>" +
              "  </div>" +
             " <div id='graphcontainer_tabdv" + this.linkDV + "_" + index + "' style='display: none;'>" +
              "  <div style='height: 50px;margin-bottom: 5px!important;>" +
              "    <label id='dvName_lbldv" + this.linkDV + "_" + index + "'></label>" +
               "      <div class='dropdown' id='graphDropdown_tabdv" + this.linkDV + "_" + index + "' style='display: inline-block;padding-top: 1px;float:right'>" +
                "             <button class='btn btn-primary dropdown-toggle' type='button' data-toggle='dropdown'>" +
                 "          <span class='caret'></span></button>" +
                  "        <ul class='dropdown-menu'>" +
                      "          <li><a href =  '#'><i class='fa fa-line-chart custom'></i> Line</a></li>" +
                      "          <li><a href = '#'><i class='fa fa-bar-chart custom'></i> Bar </a></li>" +
                       "         <li><a href = '#'><i class='fa fa-area-chart custom'></i> AreaFilled </a></li>" +
                        "        <li><a href = '#'><i class='fa fa-pie-chart custom'></i> pie </a></li>" +
                         "       <li><a href = '#'> doughnut </a></li>" +
                        "        </ul>" +
                      "</div>" +
                      "<button id='reset_zoomdv" + this.linkDV + "_" + index + "' class='btn btn-default' style='float: right;'>Reset zoom</button>" +
                      "<div id = 'btnColumnCollapsedv" + this.linkDV + "_" + index + "' class='btn btn-default' style='float: right;'>" +
                       "     <i class='fa fa-cog' aria-hidden='true'></i>" +
                      "</div>" +
                "</div>" +
                "<div id ='columns4Dragdv" + this.linkDV + "_" + index + "' style='display:none;'>" +
                 "   <div style='display: inline-block;'>" +
                         " <label class='nav-header disabled'><center><strong>Columns</strong></center><center><font size='1'>Darg n Drop to X or Y Axis</font></center></label>" +
                      "  <input id='searchColumndv" + this.linkDV + "_" + index + "' type='text' class ='form-control' placeholder='search for column'/>" +
                  "      <ul class='list-group'  style='height: 470px; overflow-y: auto;'>" +
                   "     </ul>  " +
                   " </div>" +
                    "<div style='display: inline-block;vertical-align: top;width: 806px;'>" +
                    " <div class='input-group'>" +
                      "    <span class='input-group-addon' id='basic-addon3'>X-Axis</span>" +
                      "    <div class='form-control' style='padding: 4px;height:33px' id ='X_col_namedv" + this.linkDV + "_" + index + "'></div>" +
                      "  </div>" +
                       " <div class='input-group' style='padding-top: 1px;'>" +
                       "   <span class='input-group-addon' id='basic-addon3'>Y-Axis</span>" +
                        "  <div class='form-control' style='padding: 4px;height:33px' id ='Y_col_namedv" + this.linkDV + "_" + index + "'></div>" +
                       " </div>" +
                    "</div>" +
                "</div>" +
                "<canvas id='myChartdv" + this.linkDV + "_" + index + "' width='auto' height='auto'></canvas>" +
            "</div>" +
             "</div>");
        //$("#newmodal").on('shown.bs.modal', this.call2newTable.bind(this));
        //$("#newmodal").on('hidden.bs.modal', function (e) {
        //    $('#Newtable').DataTable().destroy();
        //    setTimeout(function () {
        //        $("#newmodal").remove();
        //    }, 500);
        //});
        //$("#newmodal").modal('show');

        this.call2newTable();
        $(".nav-tabs a[href='#dv" + this.linkDV + "_tab_" + index + "']").tab('show');
    };

    this.call2newTable = function () {

        var EbDataTable_Newtable = new EbDataTable({
            dv_id: this.linkDV,
            ss_url: "https://expressbaseservicestack.azurewebsites.net",
            tid: 'dv' + this.linkDV + '_' + index,
            linktable: true,
            cellData: this.cellData,
            rowData: this.rowData,
            filterValues: this.filterValues
            //directLoad: true
        });
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

    {

        //    this.GetSettingsModal = function (e) {
        //        this.OuterModalDiv = $(document.createElement("div")).attr("id", "settingsmodal").attr("class", "modal fade");
        //        var ModalSizeDiv = $(document.createElement("div")).attr("class", "modal-dialog modal-lg").css("width", "1100px");
        //        var ModalContentDiv = $(document.createElement("div")).attr("class", "modal-content").css("width", "1100px");
        //        var ModalHeaderDiv = $(document.createElement("div")).attr("class", "modal-header");
        //        var headerButton = $(document.createElement("button")).attr("class", "close").attr("data-dismiss", 'modal').text("x");
        //        var title = $(document.createElement('h4')).attr("class", "modal-title").text(this.ebSettings.dvName + ": SettingsTable");
        //        var ModalBodyDiv = $(document.createElement("div")).attr("class", "modal-body");
        //        var ModalBodyUl = $(document.createElement("ul")).attr("class", "nav nav-tabs");
        //        var ModalBodyDropDown = $(document.createElement("select")).attr("id", "columnDropdown");
        //        var ModalBodyliCol = $(document.createElement("li")).attr("class", "nav-item");
        //        var ModalBodyAnchorCol = $(document.createElement("a")).attr("class", "nav-link").attr("data-toggle", "tab").attr("href", "#2a").text("Columns");
        //        var ModalBodyliGen = $(document.createElement("li")).attr("class", "nav-item");
        //        var ModalBodyAnchorGen = $(document.createElement("a")).attr("class", "nav-link").attr("data-toggle", "tab").attr("href", "#1a").text("General");
        //        var ModalBodyTabDiv = $(document.createElement("div")).attr("class", "tab-content");
        //        var ModalBodyTabPaneColDiv = $(document.createElement("div")).attr("class", "tab-pane").attr("id", "2a");
        //        var ModalBodyColSettingsTable = $(document.createElement("table")).attr("class", "table table-striped table-bordered").attr("id", "Table_Settings");
        //        var ModalBodyTabPaneGenDiv = $(document.createElement("div")).attr("class", "tab-pane active").attr("id", "1a");
        //        var ModalFooterDiv = $(document.createElement("div")).attr("class", "modal-footer");
        //        var FooterButton = $(document.createElement("button")).attr("class", "btn btn-primary").attr("id", 'Save_btn').text("Save Changes");

        //        ModalFooterDiv.append(FooterButton);
        //        ModalBodyTabPaneGenDiv.append("<div class='table-responsive'>" +
        //    "<table class='table table-bordered table-hover'>" +
        //        "<tbody>" +
        //	        "<tr> <td>Hide Serial</td>           <td><input type='checkbox' id='serial_check'></td> </tr>" +
        //	        "<tr> <td>Hide Chechbox</td>         <td><input type='checkbox' id='select_check'></td> </tr>" +
        //	        "<tr> <td>Page Length</td>           <td><input type='numeric' id='pageLength_text' value='100'></td> </tr>" +
        //	        "<tr> <td>Table Height</td>          <td><input type='numeric' id='scrollY_text' value='300'></td> </tr>" +
        //	        "<tr> <td>Row Grouping</td>          <td><input type='numeric' id='rowGrouping_text'></td> </tr>" +
        //	        "<tr> <td>Left Fixed Columns         </td><td><input type='numeric' id='leftFixedColumns_text' value='0'></td> </tr>" +
        //	        "<tr> <td>Right Fixed Columns</td>   <td><input type='numeric' id='rightFixedColumns_text' value='0'></td> </tr>" +
        //            "<tr> <td>Data Visualization Name</td>   <td><input type='text' id='dvName_txt'></td> </tr>" +
        //        "</tbody>" +
        //    "</table>" +
        //"</div>");
        //        ModalBodyTabPaneColDiv.append(ModalBodyColSettingsTable);
        //        ModalBodyTabPaneColDiv.append("<div id='propCont' class='prop-grid-cont'>" +
        //     "                                        <div id='propHead'></div><div id='propGrid'></div>" +
        //                                             "<div>" +
        //                                                 "<textarea id='txtValues' hidden rows='4' cols='30'></textarea>" +
        //                                                 "<br><input hidden id='btnGetValues' type='button' value='Get values'/>" +
        //                                             "</div>" +
        //     "</div>");

        //        ModalBodyTabDiv.append(ModalBodyTabPaneGenDiv);
        //        ModalBodyTabDiv.append(ModalBodyTabPaneColDiv);
        //        ModalBodyliGen.append(ModalBodyAnchorGen);
        //        ModalBodyliCol.append(ModalBodyAnchorCol);
        //        ModalBodyUl.append(ModalBodyliGen);
        //        ModalBodyUl.append(ModalBodyliCol);
        //        ModalBodyDiv.append(ModalBodyUl);
        //        ModalBodyDiv.append(ModalBodyDropDown);
        //        ModalBodyDiv.append(ModalBodyTabDiv);
        //        ModalHeaderDiv.append(headerButton);
        //        ModalHeaderDiv.append(title);
        //        ModalContentDiv.append(ModalHeaderDiv);
        //        ModalContentDiv.append(ModalBodyDiv);
        //        ModalContentDiv.append(ModalFooterDiv);
        //        ModalSizeDiv.append(ModalContentDiv);
        //        this.OuterModalDiv.append(ModalSizeDiv);

        //        $(FooterButton).click(this.saveSettings.bind(this));
        //        $(this.OuterModalDiv).on('shown.bs.modal', this.callPost4SettingsTable.bind(this));
        //        $(this.OuterModalDiv).on('hidden.bs.modal', this.hideModalFunc.bind(this));
        //        $("#graphmodal").on('hidden.bs.modal', function (e) { $("#graphdiv").empty(); });

        //        $(this.OuterModalDiv).modal('show');
        //    };

    }

    this.GetSettingsWindow = function (e) {
        $("#" + this.tableId + "TableColumns4Drag").toggle();
        if ($("#" + this.tableId + "TableColumns4Drag").css("display") === "none") {
            $("#" + this.tableId + "divcont").css("width", "100%");
            //$("#" + this.tableId + "ColumnsDispalyCont").css("display", "none");
            this.Api.columns.adjust();
            $("#" + this.tableId + "ColumnsDispaly").css("display", "none");
            //$("#" + this.tableId + "ColumnsDispaly").parent().removeClass("form-save-wraper");
            $("#" + this.tableId + "TableColumnsPPGrid").css("display", "none");
            $("#" + this.tableId + "ColumnsOrder").css("display", "none");
        }
        else {
            $("#" + this.tableId + "divcont").css("width", "55%");
            $("#" + this.tableId + "divcont").css("display", "inline-block");
            $("#" + this.tableId + "divcont").css("vertical-align", "top");
            this.Api.columns.adjust();
            $("#" + this.tableId + "TableColumns4Drag").css("display", "inline-block");
            $("#" + this.tableId + "TableColumns4Drag").css("width", "20%");
            $("#" + this.tableId + "TableColumns4Drag").css("height", "500px");
            $("#" + this.tableId + "TableColumns4Drag").css("vertical-align", "top");
            //$("#" + this.tableId + "ColumnsDispalyCont").css("display", "inline-block");
            $("#" + this.tableId + "ColumnsDispaly").show();
            $("#" + this.tableId + "ColumnsOrder").show();
            //$("#" + this.tableId + "ColumnsDispaly").css("height", "auto");
            //$("#" + this.tableId + "ColumnsDispaly").css("width", "99%");
            $("#" + this.tableId + "TableColumnsPPGrid").css("display", "inline-block");
            $("#" + this.tableId + "TableColumnsPPGrid").css("border", "1px solid");
            $("#" + this.tableId + "TableColumnsPPGrid").css("height", "500px");
            $("#" + this.tableId + "TableColumnsPPGrid").css("width", "24%");
            $("#" + this.tableId + "TableColumns4Drag").css("height", $("#" + this.tableId + "divcont").css("height"))
            $("#" + this.tableId + "TableColumnsPPGrid").css("height", $("#" + this.tableId + "divcont").css("height"))
        }
    };

    this.getdvWindow = function () {
        $(document.body).append("<div id='settingsmodal' class='modal fade'>" +
           " <div class='modal-dialog modal-sm'>" +
                "<div class='modal-content'>" +
                    "<div class='modal-header'>" +
                      "  <button class='close' data-dismiss='modal'>&times;</button>" +
                     "   <h4 class='modal-title'>xxxxxxxx</h4>" +
                    "</div>" +
                    "<div class='modal-body' style='padding-bottom: 40px;'>" +
                        "<div class='dropdown' id='dvdropdown'>" +
                             "<button class='btn btn-secondary dropdown-toggle' type='button' id='dropdownMenuButton' data-toggle='dropdown'>"+
                                " Dropdown button" +
                              "</button>" +
                                "<ul class='dropdown-menu'>" +
                                "   <li><a href='#'>DataVisualization</a></li>" +
                                "  <li><a href='#'>Report</a></li>" +
                                "</ul>" +
                        " </div > " +
                "    </div>" +

             "   </div>" +
           " </div>" +
            "</div>");
        $('#dvdropdown a').on('click', function () {
            alert($(this).text());
            //$.ajax({
            //    url: "../DV/DVEditor",
            //    type: "POST",
            //    data: { objid: this.dvid },
            //    success: function (data) {
            //        $("#settingsmodal .modal-body").html(data);
            //        $("#loader").hide();
            //    }
            //});
        });
        
        $("#settingsmodal").on('hidden.bs.modal', this.hideModalFunc.bind(this));
        //$("#graphmodal").on('hidden.bs.modal', function (e) { $("#graphdiv").empty(); });
    };

    this.hideModalFunc = function (e) {
        if (isSettingsSaved) {
            $('#Table_Settings').DataTable().destroy();
            setTimeout(function () {
                $("#settingsmodal").remove();
            }, 500);
            this.Api.destroy();
            $('#' + this.tableId + 'divcont').children()[0].remove();
            $("#TableControls_" + this.tableId + " div:eq(0)").remove();
            var table = $(document.createElement('table')).addClass('table table-striped table-bordered').attr('id', this.tableId);
            $('#' + this.tableId + 'divcont').append(table);
            $.post('GetTVPref4User', { dvid: this.dvid, parameters: JSON.stringify(this.getFilterValues()) }, this.getSavedColumnsSuccess.bind(this));
            //this.ebSettings = redis.Get < string > (string.Format("{0}_TVPref_{1}_uid_{2}", ViewBag.cid, dvid, ViewBag.UId));
            //this.Init();
            isSettingsSaved = false;
        }
        else {
            $('#Table_Settings').DataTable().destroy();
            setTimeout(function () {
                $("#settingsmodal").remove();
            }, 500);
        }

    };

    this.getSavedColumnsSuccess = function (data) {
        this.ebSettings = JSON.parse(data);
        //this.ebSettingsCopy = this.ebSettings;
        //console.log(JSON.stringify(this.ebSettings));
        this.Init();
    };

    this.saveSettings = function () {
        $.post('../DV/SaveSettings', { json: JSON.stringify(this.ebSettings), RefId: this.dvid }, this.saveSuccess.bind(this));
    };

    this.saveSuccess = function () {
        alert("Success!!!!!!!");
    }

    {
        //this.getColobj = function (col_name) {
        //    var selcol = null;
        //    $.each(this.ebSettings.columns, function (i, col) {
        //        if (col.name.trim() === col_name.trim()) {
        //            selcol = col;
        //            return false;
        //        }
        //    });
        //    return selcol;
        //};

       


        //this.callPost4SettingsTable = function () {
        //    //alert(JSON.stringify(this.ebSettings.columns));
        //    var data2Obj = this.ebSettings; //JSON.parse(data2);
        //    //__tvPrefUser = data2Obj;
        //    $("#serial_check").prop("checked", data2Obj.hideSerial);
        //    $("#select_check").prop("checked", data2Obj.hideCheckbox);
        //    $("#pageLength_text").val(data2Obj.lengthMenu[0][0]);
        //    $("#scrollY_text").val(data2Obj.scrollY);
        //    $("#rowGrouping_text").val(data2Obj.rowGrouping);
        //    $("#leftFixedColumns_text").val(data2Obj.leftFixedColumns);
        //    $("#rightFixedColumns_text").val(data2Obj.rightFixedColumns);
        //    $("#dvName_txt").val(data2Obj.dvName);
        //    this.getcolumn4dropdown();
        //    this.settings_tbl = $('#Table_Settings').DataTable(
        //    {
        //        columns: this.column4SettingsTbl(),
        //        data: this.getData4SettingsTbl(),
        //        paging: false,
        //        ordering: false,
        //        searching: false,
        //        info: false,
        //        scrollY: '300',
        //        select: true,
        //        //rowReorder: { selector: 'tr' },
        //        initComplete: this.initComplete4Settingstbl.bind(this),
        //    });
        //   // CreatePropGrid(this.settings_tbl.row(0).data(), data2Obj.columnsext);
        //   // $('#Table_Settings tbody').on('click', 'tr', this.showPropertyGrid.bind(this));
        //    $(".modal-content").on("click", function (e) {
        //        if ($(e.target).closest(".font-select").length === 0) {
        //            $(".font-select").removeClass('font-select-active');
        //            $(".fs-drop").hide();
        //        }
        //    });
        //};

        //this.getcolumn4dropdown = function () {
        //    if (this.ebSettings.columnsdel !== undefined && this.ebSettings.columnsdel !== null) {
        //        this.ebSettings.columnsdel = this.ebSettings.columnsdel.sort(function (a, b) {
        //            return a.name.localeCompare(b.name);
        //        });
        //        this.ebSettings.columnsextdel = this.ebSettings.columnsextdel.sort(function (a, b) {
        //            return a.name.localeCompare(b.name);
        //        });
        //        $.each(this.ebSettings.columnsdel, this.adddelColsandColsext2dropdown.bind(this));
        //    }

        //};

        //this.adddelColsandColsext2dropdown = function (i, obj) {
        //    var liId = "li_" + obj.name;
        //    $("#columnDropdown ul").append("<li id=" + liId + "><a data-data=\"" + JSON.stringify(obj).replace(/\"/g, "'") + "\" data-colext=\"" + JSON.stringify(this.ebSettings.columnsextdel[i]).replace(/\"/g, "'") + "\" href='#'>" + obj.name + "</a></li>");
        //};

        //this.showPropertyGrid = function (e) {
        //    var idx = this.settings_tbl.row(e.target).index();
        //    CreatePropGrid(this.settings_tbl.row(idx).data(), this.ebSettings.columnsext);
        //    this.settings_tbl.columns.adjust();
        //};

        //this.column4SettingsTbl = function () {
        //    var colArr = [];
        //    colArr.push(new coldef4Setting('', '#', "", function (data, type, row, meta) { return (meta.row) + 1 }));
        //    colArr.push(new coldef4Setting('data', 'Column Index', 'hideme', function (data, type, row, meta) { return (data !== "") ? "<input type='text' value=" + data + " name='index'>" : data; }));
        //    colArr.push(new coldef4Setting('name', 'Name', 'hideme', function (data, type, row, meta) { return (data !== "") ? "<input type='text' value=" + data + " name='name' style='border: 0;width: 100px;' readonly>" : data; }, ""));
        //    colArr.push(new coldef4Setting('type', ' Column Type', 'hideme', function (data, type, row, meta) { return (data !== "") ? "<input type='text' value=" + data + " name='type'>" : data; }));
        //    colArr.push(new coldef4Setting('title', 'Title', "", function (data, type, row, meta) { return (data !== "") ? "<input type='hidden' value=" + data + " name='title' style='width: 100px;'>" + data : data; }, ""));
        //    colArr.push(new coldef4Setting('visible', 'Visible?', "", function (data, type, row, meta) { return (data === 'true') ? "<input type='checkbox'  name='visibile' checked>" : "<input type='checkbox'  name='visibile'>"; }, ""));
        //    colArr.push(new coldef4Setting('width', 'Width', "", function (data, type, row, meta) { return (data !== "") ? "<input type='text' value=" + data + " name='width' style='width: 40px;'>" : data; }, ""));
        //    colArr.push(new coldef4Setting('className', 'Font', "", this.renderFontSelect, "30"));
        //    colArr.push(new coldef4Setting('', '', "", function (data, type, row, meta) { return "<a href='#' class ='eb_delete_btn'><i class='fa fa-times' aria-hidden='true' style='color:red' ></i></a>" }, "30"));
        //    return colArr;
        //};



        //this.getData4SettingsTbl = function () {
        //    var colarr = [];
        //    var n, d, t, v, w, ty, cls;
        //    $.each(this.ebSettings.columns, function (i, col) {
        //        if (col.name !== "serial" && col.name !== "id" && col.name !== "checkbox") {
        //            n = col.name;
        //            d = col.data;
        //            t = col.title.substr(0, col.title.indexOf('<'));
        //            v = (col.visible).toString().toLowerCase();
        //            w = col.width.toString();
        //            if (col.type) ty = col.type.toString();
        //            cls = col.className;
        //            if (cls === undefined)
        //                cls = "";
        //            colarr.push(new coldef(d, t, v, w, n, ty, cls));
        //        }
        //    });
        //    return colarr;
        //};

        //this.initComplete4Settingstbl = function (settings, json) {
        //    $('.font').fontselect();
        //    $('#Table_Settings').DataTable().columns.adjust();
        //    this.addEventListner4Settingstbl();

        //    //$('#Table_Settings').on('draw.dt', function () {
        //    //    $('#Table_Settings').DataTable().column(0).nodes().each(function (cell, i) { cell.innerHTML = i + 1; });
        //    //});
        //};

        //this.addEventListner4Settingstbl = function () {
        //    $(".eb_delete_btn").off("click").on("click", this.deleteRow.bind(this));
        //    $('#columnDropdown .dropdown-menu a').off("click").on("click", this.clickDropdownfunc.bind(this));
        //};

        //this.renderFontSelect = function (data, type, row, meta) {
        //    if (data.length > 0 && data !== undefined) {
        //        var fontName = data.replace("tdheight", " ");
        //        fontName = fontName.substring(5).replace(/_/g, " ");
        //        index = fontName.lastIndexOf(" ");
        //        fontName = fontName.substring(0, index);
        //        return "<input type='text' value='" + fontName + "' class='font' style='width: 100px;' name='font'>";
        //    }
        //    else
        //        return "<input type='text' class='font' style='width: 100px;' name='font'>";
        //};

        //this.GetLengthOption = function (len) {
        //    var ia = [];
        //    for (var i = 0; i < 10; i++)
        //        ia[i] = (len * (i + 1));
        //    return JSON.parse("[ [{0},-1], [{0},\"All\"] ]".replace(/\{0\}/g, ia.join(',')));
        //};

        //this.AddSerialAndOrCheckBoxColumns = function (tx) {
        //    if (!tx.hideCheckbox) {
        //        var chkObj = new Object();
        //        chkObj.data = null;
        //        chkObj.title = "<input id='{0}_select-all' type='checkbox' class='eb_selall"+this.tableId+"' data-table='{0}'/>".replace("{0}", this.tableId);
        //        chkObj.width = 10;
        //        chkObj.orderable = false;
        //        chkObj.visible = true;
        //        chkObj.name = "checkbox";
        //        var idpos = $.grep(tx, function (e) { return e.name === "id"; })[0].data;
        //        // chkObj.render = function (data2, type, row, meta) { return renderCheckBoxCol($('#' + tableId).DataTable(), idpos, tableId, row, meta); };
        //        chkObj.render = this.renderCheckBoxCol.bind(this);
        //        tx.unshift(chkObj);
        //    }

        //    if (!tx.hideSerial)
        //        tx.unshift(JSON.parse('{"width":10, "searchable": false, "orderable": false, "visible":true, "name":"serial", "title":"#"}'));
        //};
    }

    this.collapseFilter = function () {
        this.filterBox.toggle();
        if (this.filterBox.css("display") == "none") {
            $("#btnCollapse" + this.tableId).children().remove();
            $("#btnCollapse" + this.tableId).append("<i class='fa fa-chevron-down' aria-hidden='true'></i>")
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
        if (col.Type ==parseInt( gettypefromString("Int32")) || col.Type ==parseInt( gettypefromString("Decimal")) || col.Type ==parseInt( gettypefromString("Int64"))) {
            if (this.ebSettings.Columns.$values[i].RenderAs === "Progressbar") {
                this.ebSettings.Columns.$values[i].render = this.renderProgressCol;
            }
            if (this.ebSettings.Columns.$values[i].DecimalPlaces > 0) {
                var deci = this.ebSettings.Columns.$values[i].DecimalPlaces;
                this.ebSettings.Columns.$values[i].render = function (data, type, row, meta) {
                    return parseFloat(data).toFixed(deci);
                }
            }
        }
        if (col.Type ==parseInt( gettypefromString("Boolean"))) {
            if (this.ebSettings.Columns.$values[i].name === "sys_locked" || this.ebSettings.Columns.$values[i].name === "sys_cancelled") {
                this.ebSettings.Columns.$values[i].render = (this.ebSettings.Columns.$values[i].name === "sys_locked") ? this.renderLockCol : this.renderEbVoidCol;
            }
            else {
                if (this.ebSettings.Columns.$values[i].IsEditable) {
                    this.ebSettings.Columns.$values[i].render = this.renderEditableCol;
                }
                if (this.ebSettings.Columns.$values[i].RenderAs === "Icon") {
                    this.ebSettings.Columns.$values[i].render = this.renderIconCol;
                }
            }
        }
        if (col.Type ==parseInt( gettypefromString("String")) || col.Type ==parseInt( gettypefromString("Double"))) {
            if (this.ebSettings.Columns.$values[i].RenderAs === "Link") {
                this.linkDV = this.ebSettings.Columns.$values[i].linkDv;
                this.ebSettings.Columns.$values[i].render = this.renderlink4NewTable.bind(this);
                alert(this.linkDV);
            }
            if (this.ebSettings.Columns.$values[i].RenderAs === "Graph") {
                this.ebSettings.Columns.$values[i].render = this.lineGraphDiv.bind(this);
            }
        }
    };

    this.renderProgressCol = function (data, type, row, meta) {
        return "<div class='progress'><div class='progress-bar' role='progressbar' aria-valuenow='" + data.toString() + "' aria-valuemin='0' aria-valuemax='100' style='width:" + data.toString() + "%'>" + data.toString() + "</div></div>";
    };

    this.renderToDecimalPlace = function (data, type, row, meta) {
        return parseFloat(data).toFixed();
    };

    this.renderEditableCol = function (data) {
        return (data === true) ? "<input type='checkbox' data-toggle='toggle' data-size='mini' checked>" : "<input type='checkbox' data-toggle='toggle' data-size='mini'>";
    };

    this.renderIconCol = function (data) {
        return (data === true) ? "<i class='fa fa-check' aria-hidden='true'  style='color:green'></i>" : "<i class='fa fa-times' aria-hidden='true' style='color:red'></i>";
    };

    this.renderEbVoidCol = function (data) {
        return (data === true) ? "<i class='fa fa-ban' aria-hidden='true'></i>" : "";
    };

    this.renderLockCol = function (data) {
        return (data === true) ? "<i class='fa fa-lock' aria-hidden='true'></i>" : "";
    };

    this.renderlink4NewTable = function (data) {
        return "<a href='#' class ='tablelink_" + this.tableId + "'>" + data + "</a>";
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

    this.appendColumns = function () {
        this.pg = new Eb_PropertyGrid(this.tableId + "TableColumnsPPGrid")
        var id = this.tableId;
        var pid = id + "TableColumnsPPGrid";
        $("#" + id + "TableColumns4Drag").append("<div style='background-color: #ccc;padding: 5px;font-weight: bold;'>Columns</div>")
        //$("#" + id + "TableColumns4Drag")
        $.each(this.ebSettings.Columns.$values, function (i, obj) {
            if (obj.name !== "serial" && obj.name !== "checkbox" && obj.bVisible === false && obj.name !== "id")
                $("#" + id + "TableColumns4Drag").append("<div class ='alert alert-success Delcols' id='div_" + obj.name + "' name = '" + obj.name + "' data-type="+obj.Type+">" + obj.name + "</div>")
            else if (obj.name !== "serial" && obj.name !== "checkbox" && obj.bVisible === true && obj.name !== "id")
                $("#" + id + "ColumnsDispaly").append('<div class =" alert alert-success Displaycols" onclick="$(this).focus();" tabIndex="0" name ="' + obj.name + '" id="div_' + obj.name + '" data-type=' + obj.Type + '>' + obj.name + "<button class='close' type='button' style='font-size: 15px;margin: 0px 0 0 4px;color: black !important;' >x</button></div>")
        });
        $("#" + this.tableId + "ColumnsDispaly button[class=close]").off("click").on("click", this.RemoveAndAddToColumns.bind(this));
        $("#" + this.tableId + "ColumnsDispaly").on("focus", "div", this.createPG.bind(this));
        this.drake = new dragula([document.getElementById(id + "TableColumns4Drag"), document.getElementById(id + "ColumnsDispaly"), document.getElementById(id + "ColumnsOrder")], {
            accepts: this.acceptDrop.bind(this),
            copy:this.allowCopy.bind(this)
        });

        this.drake.on("drop", this.colDrop.bind(this));
        this.drake.on("drag", this.colDrag.bind(this));
        this.flagAppendColumns = true;
        //$("#" + this.tableId + "TableColumns4Drag").resizable();
        $("#" + this.tableId + "TableColumns4Drag").resizable({
            handles: "e"
        });
    };

    //this.appendDisplayColumns = function () {
    //    var id = this.tableId;
    //    var pid = id + "TableColumnsPPGrid";
    //    $.each(this.ebSettings.columns, function (i, obj) {
    //        if (obj.name !== "serial" && obj.name !== "checkbox" && obj.visible === true)
    //            $("#" + id + "ColumnsDispaly").append("<div class ='Displaycols' onclick='tagFocused(event, \"" + pid + "\" )' tabIndex='0' id='div_" + obj.name + "' data-obj='" + JSON.stringify(obj) + "'>" + obj.name + "<button class='close' type='button' style='font-size: 15px;margin: 2px 0 0 4px;' >x</button></div>")
    //    });
    //    $("#" + this.tableId + "ColumnsDispaly button[class=close]").off("click").on("click", this.RemoveAndAddToColumns.bind(this));
    //};

    this.colDrag = function (e) {
        //this.draggedPos = $(e.target).index();
        //e.dataTransfer.setData("text", e.target.id);
        //this.sourceElement = e.target.parentNode.tagName;
        //this.sourceElementId = e.target.parentElement.id;
    };

    this.colAllowDrop = function (e) {
        e.preventDefault();
    };

    this.colDrop = function (el, target, source, sibling) {
        if (target) {
            //    if (sibling)
            //        this.droppedPos = $(sibling).index() - 1;
            //    else
            //        this.droppedPos = $(target).children().length - 1;
            if ($(source).attr("id") === this.tableId + "TableColumns4Drag") {
                $(el).removeClass("alert alert-success Delcols");
                $(el).addClass("alert alert-success Displaycols");
                //var colobj = JSON.parse($(el).attr("data-obj"));
                //colobj["visible"] = true;
                //colobj["bVisible"] = true;
                //$(el).attr("data-obj", JSON.stringify(colobj));
                $(el).attr("tabIndex", "0");
                $(el).attr("onclick", "$(this).focus();");
                $(el).append("<button class='close' type='button' style='font-size: 15px;margin: 0px 0 0 4px;color: black !important;' >x</button>");
                $("#" + this.tableId + "ColumnsDispaly button[class=close]").off("click").on("click", this.RemoveAndAddToColumns.bind(this));
                //$.each(this.ebSettings.columns, this.visibleChange2True.bind(this, colobj));
                //$("#" + this.tableId + "ColumnsDispaly").children("div").each(this.visibleChange2True.bind(this));
                $(el).focus();
            }
            $("#" + this.tableId + "ColumnsDispaly").on("focus", "div", this.createPG.bind(this));
            $("#" + this.tableId + "TableColumns4Drag").css("height", $("#" + this.tableId + "divcont").css("height"))
            $("#" + this.tableId + "TableColumnsPPGrid").css("height", $("#" + this.tableId + "divcont").css("height"))

            $("#" + this.tableId + "ColumnsDispaly").children("div").each(this.visibleChange2True.bind(this));

            //$('#' + this.tableId + 'divcont').children("#" + this.tableId + "_wrapper").remove();
            //var table = $(document.createElement('table')).addClass('table table-striped table-bordered').attr('id', this.tableId);
            //$('#' + this.tableId + 'divcont').append(table);
            //this.Init();

        }
    };

    this.RemoveAndAddToColumns = function (e) {

        var str = $(e.target).parent().text();
        var curName = $(e.target).parent().attr("name");
        var curType = $(e.target).parent().attr("data-type");
        //var colobj = JSON.parse($(e.target).parent().attr("data-obj")); 
        //colobj["visible"] = false;
        //colobj["bVisible"] = false;
        $("#" + this.tableId + "TableColumns4Drag").append("<div class ='alert alert-success Delcols' name ='" + curName + "' id='" + $(e.target).parent().attr("id") + "' data-type=" + curType + ">" + str.substring(0, str.length - 1).trim() + "</div>")

        $(e.target).parent().remove();
        $("#" + this.tableId + "TableColumns4Drag").css("height", $("#" + this.tableId + "divcont").css("height"))
        $("#" + this.tableId + "TableColumnsPPGrid").css("height", $("#" + this.tableId + "divcont").css("height"))
        $("#" + this.tableId + "ColumnsDispaly").children("div").each(this.visibleChange2True.bind(this));
        $.each(this.ebSettings.Columns.$values, this.visibleChange2False.bind(this, curName));
        $("#" + this.tableId + "ColumnsDispaly").children("div:eq(0)").focus();
        //$('#' + this.tableId + 'divcont').children("#" + this.tableId + "_wrapper").remove();
        //var table = $(document.createElement('table')).addClass('table table-striped table-bordered').attr('id', this.tableId);
        //$('#' + this.tableId + 'divcont').append(table);
        //console.log(JSON.stringify(this.ebSettings.columns));
        //this.Init();
    };

    this.createPG = function (e) {
        curName = $(e.target).attr("name");
        curType = $(e.target).attr("data-type");
        curObjcet = gettypefromNumber(curType);
        $.each(this.ebSettings.Columns.$values, this.createPG_inner.bind(this, curName, curObjcet));
    };

    this.createPG_inner = function (curName, curObjcet, i, obj) {
        if (curName === obj.name) {
            console.log(JSON.stringify(this.ebSettings.Columns.$values[i]));
            this.pg.setObject(this.ebSettings.Columns.$values[i], this.meta["DV" + curObjcet + "Column"]);
        }

    };

    this.visibleChange2True = function (i, obj) {
        this.dragNdrop = true;
        $.each(this.ebSettings.Columns.$values, this.changeObjectPositionToCurrent.bind(this, i, obj));
    };

    this.visibleChange2False = function (curName, i, obj) {
        if (curName == obj.name) {
            //this.ebSettings.Columns[i].visible = false;
            this.ebSettings.Columns.$values[i].bVisible = false;
            this.ebSettings.Columns.$values[i].Pos = this.ebSettings.Columns.$values.length + 100;
            //$(colobj).attr("data-obj", JSON.stringify(this.ebSettings.Columns[i]));
            //this.ebSettings.columnsext[i].pos = this.ebSettings.columns.length +100;
        }
    };

    this.changeObjectPositionToCurrent = function (indx, colobj, i, obj) {
        var curName = $(colobj).attr("name");
        if (curName == obj.name) {
            //this.ebSettings.Columns[i].visible = true;
            this.ebSettings.Columns.$values[i].bVisible = true;
            this.ebSettings.Columns.$values[i].Pos = indx;
            //$(colobj).attr("data-obj", JSON.stringify(this.ebSettings.Columns[i]));
            //this.ebSettings.columnsext[i].pos = indx
        }
    };

    //this.changeObjectPositionToMax = function (colobj, i, obj) {
    //    var o = JSON.parse($(colobj).attr("data-obj"));
    //    if (o.name == obj.name) {
    //        this.ebSettings.columns[i].visible = true;
    //        this.ebSettings.columns[i].bVisible = true;
    //        this.ebSettings.columns[i].pos = this.ebSettings.columns.length + 100;
    //    };
    //};

    this.acceptDrop = function (el, target, source, sibling) {
        if ($(target).attr("id") === this.tableId + "TableColumns4Drag") {
            return false;
        }
        else {
            return true;
        }

    };

    this.allowCopy = function (el, source) {
        if ($(source).attr("id") === this.tableId + "ColumnsDisplay")
            return true;
        else
            return false;
    };

    
    {
        //this.deleteRow = function (e) {
        //    var idx = this.settings_tbl.row($(e.target).parent().parent()).index();
        //    var deletedRow = $.extend(true, {}, this.settings_tbl.row(idx).data());
        //    this.deleted_colname = deletedRow.name;
        //    this.columnsdel.push(deletedRow);
        //    this.settings_tbl.rows(idx).remove().draw();
        //    this.ebSettingsCopy.columnsdel = this.columnsdel;
        //    var del_obj = $.grep(this.ebSettings.columnsext, function (obj) { return obj.name === this.deleted_colname; }.bind(this));
        //    this.columnsextdel.push(del_obj[0]);
        //    //alert(JSON.stringify(this.columnsextdel));
        //    this.ebSettingsCopy.columnsextdel = this.columnsextdel;
        //    this.ebSettings.columnsdel = this.columnsdel;
        //    this.ebSettings.columnsextdel = this.columnsextdel;
        //    this.ebSettings.columnsext = $.grep(this.ebSettings.columnsext, function (obj) { return obj.name !== this.deleted_colname; }.bind(this));
        //    var liId = "li_" + deletedRow.name;
        //    $("#columnDropdown ul").append($("<li id=" + liId + "><a data-data=\"" + JSON.stringify(deletedRow).replace(/\"/g, "'") + "\" data-colext=\"" + JSON.stringify(this.columnsextdel[this.columnsextdel.length - 1]).replace(/\"/g, "'") + "\" href='#'>" + deletedRow.name + "</a></li>"));
        //    this.ebSettings.columns = $.grep(this.ebSettings.columns, function (obj) { return obj.name !== this.deleted_colname; }.bind(this));
        //    //alert(JSON.stringify(this.columnsextdel));
        //};

        //this.add2columnsextdel = function (e,obj) {
        //    if (obj.name === this.deleted_colname)
        //        this.columnsextdel.push(obj);
        //    else
        //        this.tempcolext.push(obj);
        //    //this.ebSettingsCopy.columnsextdel = this.columnsextdel;
        //    //return e.name !== this.deleted_colname;
        //};

        //this.clickDropdownfunc = function (e) {
        //    this.dropdown_colname = $(e.target).text();
        //    var col = JSON.parse($(e.target).attr("data-data").replace(/\'/g, "\""));
        //    this.settings_tbl.row.add(col).draw();
        //    var colext = JSON.parse($(e.target).attr("data-colext").replace(/\'/g, "\""));
        //    this.ebSettings.columnsext.push(colext);
        //    this.columnsdel = $.grep(this.columnsdel, function (obj) { return obj.name !== this.dropdown_colname; }.bind(this));
        //    this.columnsextdel = $.grep(this.columnsextdel, function (obj) { return obj.name !== this.dropdown_colname; }.bind(this));
        //    $.each(this.settings_tbl.$('input[name=font]'), function (i, obj) {
        //        if ($(obj).siblings().size() === 0) {
        //            $(obj).fontselect();
        //        }
        //    });
        //    $("#columnDropdown ul #" + $(e.target).parent().attr("id")).remove();
        //};
    }

    this.btnGo.click(this.btnGoClick.bind(this));

    if (this.dtsettings.directLoad)
        this.getColumns();
    if (this.dtsettings.linktable)
        this.getColumns();

    
    this.ModifyDvname = function () {
        this.ebSettings.Name = $("#dvnametxt").val();
        $("label.dvname").text(this.ebSettings.Name);
    };

    this.ModifyTableHeight = function () {
        this.ebSettings.scrollY = $("#TableHeighttxt").val();
        this.ebSettings.scrollY = (this.ebSettings.scrollY < 100) ? "300" : this.ebSettings.scrollY;
    };


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

function getFilterValues() {
    var fltr_collection = [];
    var paramstxt = "";//$('#hiddenparams').val().trim();datefrom,dateto
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