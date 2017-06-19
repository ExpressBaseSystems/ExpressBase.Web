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

var Agginfo = function (col) {
    this.colname = col;
    //this.deci_val = 2;
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

//ds_id, dv_id, ss_url, tid, setting
var EbDataTable = function (settings) {
    this.dtsettings = settings;
    this.dsid = this.dtsettings.ds_id;
    this.dvid = this.dtsettings.dv_id;
    this.ssurl = this.dtsettings.ss_url;
    this.ebSettings = this.dtsettings.settings;
    this.ebSettingsCopy = $.extend(true, {}, this.ebSettings);
    this.tableId = this.dtsettings.tid;
    this.eb_agginfo = null;
    this.isSecondTime = false;
    this.Api = null;
    this.order_info = new Object();
    this.order_info.col = '';
    this.order_info.dir = 0;
    this.columnsdel = [];
    this.columnsextdel = [];

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
    this.isSettingsSaved = false;
    this.dropdown_colname = null;
    this.deleted_colname = null;
    this.tempcolext = [];

    this.getColumns = function () {
        $.post('../Tenenat/GetColumns', { dsid: this.dsid, parameters: JSON.stringify(this.getFilterValues()) }, this.getColumnsSuccess.bind(this));
    };

    this.getColumnsSuccess = function (data) {
        console.log(data);
        this.ebSettings = JSON.parse(data);
        this.Init();

        if (this.filterBox !== null && this.dtsettings.directLoad !== true)
            this.filterBox.collapse('hide');
    };

    this.Init = function () {
        this.table_jQO = $('#' + this.tableId);
        this.filterBox = $('#filterBox');
        this.totalpagebtn = $("#" + this.tableId + "_btntotalpage");
        this.eb_agginfo = this.getAgginfo();
        if (this.dtsettings.directLoad !== true)
            this.table_jQO.append($(this.getFooterFromSettingsTbl()));

        this.Api = this.table_jQO.DataTable(this.createTblObject());

        this.Api.off('select').on('select', this.selectCallbackFunc.bind(this));
        $('#' + this.tableId + ' tbody').off('click').on('click', 'tr', this.clickCallbackFunc.bind(this));
        $('#' + this.tableId + ' tbody').off('dblclick').on('dblclick', 'tr', this.dblclickCallbackFunc.bind(this));

        //$.fn.dataTable.ext.errMode = 'throw';

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

        //$('#' + this.tableId + '_fileBtns [name=filebtn]').css('display', 'inline-block');
        // $('#' + this.tableId + '_filterdiv [name=filterbtn]').css('display', 'inline-block');
        //$('#' + this.tableId + '_btnSettings').css('display', 'inline-block');

        if (!this.ebSettings.hideSerial)
            this.table_jQO.off('draw.dt').on('draw.dt', this.doSerial.bind(this));

        //new ResizeSensor(jQuery('#@tableId_container'), function() {
        //    if ( $.fn.dataTable.isDataTable( '#@tableId' ) )
        //        @tableId.columns.adjust();
        //});
    };

    this.createTblObject = function () {
        var o = new Object();
        o.scrollY = this.ebSettings.scrollY;
        o.scrollX = "100%";
        if (this.dtsettings.directLoad === undefined || this.dtsettings.directLoad === false) {
            if (this.ebSettings.leftFixedColumns > 0 || this.ebSettings.rightFixedColumns > 0)
                o.fixedColumns = { leftColumns: this.ebSettings.leftFixedColumns, rightColumns: this.ebSettings.rightFixedColumns };
            o.lengthMenu = this.ebSettings.lengthMenu;

            o.dom = "<'col-sm-2'l><'col-sm-1'i><'col-sm-4'B><'col-sm-5'p>tr";
            o.buttons = ['copy', 'csv', 'excel', 'pdf', 'print', { extend: 'print', exportOptions: { modifier: { selected: true } } }];
        }
        else if (this.dtsettings.directLoad) {
            o.paging = false;
            //o.lengthMenu = [[-1], ["All"]];
            o.dom = "rti";
        }
        //o.rowReorder = true;
        o.autowidth = true;
        o.serverSide = true;
        o.processing = true;
        o.language = { processing: "<div class='fa fa-spinner fa-pulse  fa-3x fa-fw'></div>", info: "_START_ - _END_ / _TOTAL_" };
        o.columns = this.ebSettings.columns;
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
            dataSrc: function (dd) { return dd.data; }
        };
        o.fnRowCallback = this.rowCallBackFunc.bind(this);
        o.drawCallback = this.drawCallBackFunc.bind(this);
        o.initComplete = this.initCompleteFunc.bind(this);
        o.fnDblclickCallbackFunc = this.dblclickCallbackFunc.bind(this);
        //alert(JSON.stringify(o));
        return o;
    };

    this.ajaxData = function (dq) {
        delete dq.columns; delete dq.order; delete dq.search;
        dq.Id = this.dsid;
        dq.Token = getToken();
        dq.rToken = getrToken();
        //if (this.dtsettings.filterParams === null || this.dtsettings.filterParams === undefined)
        dq.TFilters = JSON.stringify(this.repopulate_filter_arr());
        //else {
        //    var arr = [];
        //    arr.push(new filter_obj(this.dtsettings.filterParams.column, "x*", this.dtsettings.filterParams.key));
        //    dq.TFilters = JSON.stringify(arr);
        //}
        dq.Params = JSON.stringify(this.getFilterValues());
        dq.OrderByCol = this.order_info.col;
        dq.OrderByDir = this.order_info.dir;
        return dq;
    };

    this.btnGoClick = function (e) {
        if (!this.isSecondTime) {
            this.isSecondTime = true;
            this.RenderGraphModal();
            this.getColumns();
        }
        else
            this.Api.ajax.reload();
    };

    this.getAgginfo = function () {
        var _ls = [];
        $.each(this.ebSettings.columns, function (i, col) {
            if (col.visible && (col.type === "System.Int32" || col.type === "System.Decimal" || col.type === "System.Int64"))
                _ls.push(new Agginfo(col.name));
        });

        return _ls;
    };

    this.getFooterFromSettingsTbl = function () {
        var ftr_part = "";
        $.each(this.ebSettings.columns, function (i, col) {
            if (col.visible)
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
                var colum = $(obj).children(0).text();
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
                                        if (type === 'numeric') {
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

        this.GenerateButtons();
        this.createFilterRowHeader();
        if (this.eb_agginfo.length > 0) {
            this.createFooter(0);
            this.createFooter(1);
        }
        this.addFilterEventListeners();

        if (this.dtsettings.initComplete)
            this.dtsettings.initComplete();
        this.Api.columns.adjust();
    }

    this.drawCallBackFunc = function (settings) {
        $('tbody [data-toggle=toggle]').bootstrapToggle();
        //if (this.ebSettings.rowGrouping !== '') { this.doRowgrouping(); }
        this.summarize2();
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
        var _ls;
        var tableId = this.tableId;
        $.each(this.ebSettings.columns, function (i, col) {
            if (col.visible) {
                if (col.type === "System.Int32" || col.type === "System.Decimal" || col.type === "System.Int16" || col.type === "System.Int64") {
                    var footer_select_id = tableId + "_" + col.name + "_ftr_sel" + footer_id;
                    var fselect_class = tableId + "_fselect";
                    var data_colum = "data-column=" + col.name;
                    var data_table = "data-table=" + tableId;
                    var footer_txt = tableId + "_" + col.name + "_ftr_txt" + footer_id;
                    var data_decip = "data-decip=2";

                    _ls = "<div class='input-group'>" +
                    "<div class='input-group-btn'>" +
                    "<button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='" + footer_select_id + "'>&sum;</button>" +
                   " <ul class='dropdown-menu'>" +
                    "  <li><a href ='#' class='eb_ftsel' data-sum='Sum' " + data_table + " " + data_colum + " " + data_decip + ">&sum;</a></li>" +
                    "  <li><a href ='#' class='eb_ftsel' " + data_table + " " + data_colum + " " + data_decip + " {4}>x&#772;</a></li>" +
                   " </ul>" +
                   " </div>" +
                   " <input type='text' class='form-control' id='" + footer_txt + "' disabled style='text-align: right;' style='z-index:" + zidx.toString() + "'>" +
                   " </div>";
                }
                else
                    _ls = "&nbsp;";

                ResArray.push(_ls);
            }
        });
        return ResArray;
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
            $(ftrtxt).val((agginfo.deci_val > 0) ? summary_val.toFixed(agginfo.deci_val) : summary_val.toFixed(2));
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
        $(".eb_fsel").off("click").on("click", this.setLiValue);
        $(".eb_ftsel").off("click").on("click", this.fselect_func.bind(this));
        $.each($(this.Api.columns().header()).parent().siblings().children().toArray(), this.setFilterboxValue.bind(this));
        $(".eb_fbool").off("change").on("change", this.toggleInFilter.bind(this));
        $(".eb_selall").off("click").on("click", this.clickAlSlct.bind(this));
        $("." + this.tableId + "_select").off("change").on("change", this.updateAlSlct.bind(this));
        $(".eb_canvas").off("click").on("click", this.renderMainGraph);
        $(".tablelink").off("click").on("click", this.link2NewTable.bind(this));


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
        //this.settingsbtn.off("click").on("click", this.GetSettingsModal.bind(this));
        $("#" + this.tableId + "_btnSettings").off("click").on("click", this.GetSettingsModal.bind(this));
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
        var col = $(e.target).children('span').text();
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

        $.each(this.ebSettings.columns, this.GetFiltersFromSettingsTbl_inner.bind(this));
    };

    this.GetFiltersFromSettingsTbl_inner = function (i, col) {
        var _ls = "";
        if (col.visible === true) {
            var span = "<span hidden>" + col.name + "</span>";

            var htext_class = this.tableId + "_htext";

            var data_colum = "data-colum='" + col.name + "'";
            var data_table = "data-table='" + this.tableId + "'";

            var header_select = this.tableId + "_" + col.name + "_hdr_sel";
            var header_text1 = this.tableId + "_" + col.name + "_hdr_txt1";
            var header_text2 = this.tableId + "_" + col.name + "_hdr_txt2";

            _ls += "<th style='padding: 0px; margin: 0px; height: 40px;'>";

            if (col.type === "System.Int32" || col.type === "System.Decimal" || col.type === "System.Int16" || col.type === "System.Int64")
                _ls += (span + this.getFilterForNumeric(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex));
            else if (col.type === "System.String") {
                //if (this.dtsettings.filterParams === null || this.dtsettings.filterParams === undefined)
                _ls += (span + this.getFilterForString(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex));
                //else
                //   _ls += (span + this.getFilterForString(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, this.dtsettings.filterParams));
            }
            else if (col.type === "System.DateTime")
                _ls += (span + this.getFilterForDateTime(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex));
            else if (col.type === "System.Boolean")
                _ls += (span + this.getFilterForBoolean(col.name, this.tableId, this.zindex));
            else if (col.name === "serial")
                _ls += (span + "<a class='btn btn-default center-block'  id='clearfilterbtn_" + this.tableId + "' data-table='@tableId' data-toggle='tooltip' title='Clear Filter' style='width:35px'><i class='fa fa-times' aria-hidden='true' style='color:red'></i></a>");
            else
                _ls += (span);

            _ls += ("</th>");
        }
        ((this.zindex === 50) ? this.eb_filter_controls_4fc : this.eb_filter_controls_4sb).push(_ls);
    };

    this.getFilterForNumeric = function (header_text1, header_select, data_table, htext_class, data_colum, header_text2, zidx) {
        var coltype = "data-coltyp='numeric'";
        var drptext = "";

        drptext = "<div class='input-group'>" +
        "<div class='input-group-btn'>" +
            " <button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='" + header_select + "'> = </button>" +
            " <ul class='dropdown-menu'  style='z-index:" + zidx.toString() + "'>" +
            "   <li ><a href ='#' class='eb_fsel' " + data_table + data_colum + ">=</a></li>" +
              " <li><a href ='#' class='eb_fsel' " + data_table + data_colum + "><</a></li>" +
              " <li><a href='#' class='eb_fsel' " + data_table + data_colum + ">></a></li>" +
              " <li><a href='#' class='eb_fsel' " + data_table + data_colum + "><=</a></li>" +
              " <li><a href='#' class='eb_fsel' " + data_table + data_colum + ">>=</a></li>" +
              "<li ><a href='#' class='eb_fsel' " + data_table + data_colum + ">B</a></li>" +
            " </ul>" +
        " </div>" +
        " <input type='number' class='form-control eb_finput " + htext_class + "' id='" + header_text1 + "' " + data_table + data_colum + coltype + ">" +
        " <span class='input-group-btn'></span>" +
        " <input type='number' class='form-control eb_finput " + htext_class + "' id='" + header_text2 + "' style='visibility: hidden' " + data_table + data_colum + coltype + ">" +
        " </div> ";
        return drptext;
    };

    this.getFilterForDateTime = function (header_text1, header_select, data_table, htext_class, data_colum, header_text2, zidx) {
        var coltype = "data-coltyp='date'";
        var filter = "<div class='input-group'>" +
        "<div class='input-group-btn'>" +
           " <button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='" + header_select + "'> = </button>" +
            "<ul class='dropdown-menu'  style='z-index:" + zidx.toString() + "'>" +
             " <li ><a href ='#' class='eb_fsel' " + data_table + data_colum + ">=</a></li>" +
             " <li><a href ='#' class='eb_fsel' " + data_table + data_colum + "><</a></li>" +
             " <li><a href='#' class='eb_fsel' " + data_table + data_colum + ">></a></li>" +
             " <li><a href='#' class='eb_fsel' " + data_table + data_colum + "><=</a></li>" +
             " <li><a href='#' class='eb_fsel' " + data_table + data_colum + ">>=</a></li>" +
             " <li ><a href='#' class='eb_fsel' " + data_table + data_colum + ">B</a></li>" +
           " </ul>" +
        " </div>" +
        " <input type='date' class='form-control eb_finput " + htext_class + "' id='" + header_text1 + "' " + data_table + data_colum + coltype + ">" +
        " <span class='input-group-btn'></span>" +
        " <input type='date' class='form-control eb_finput " + htext_class + "' id='" + header_text2 + "' style='visibility: hidden' " + data_table + data_colum + coltype + ">" +
        " </div> ";
        return filter;
    };

    this.getFilterForString = function (header_text1, header_select, data_table, htext_class, data_colum, header_text2, zidx) {
        var coltype = " data-coltyp='string'";
        var drptext = "";
        drptext = "<div class='input-group'>" +
        "<div class='input-group-btn' style='z-index:" + zidx.toString() + "'>" +
           " <button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='" + header_select + "'>x*</button>" +
           " <ul class='dropdown-menu'>" +
           "   <li ><a href ='#' class='eb_fsel' " + data_table + data_colum + ">x*</a></li>" +
            "  <li><a href ='#' class='eb_fsel' " + data_table + data_colum + ">*x</a></li>" +
            "  <li><a href='#' class='eb_fsel' " + data_table + data_colum + ">*x*</a></li>" +
             " <li><a href='#' class='eb_fsel' " + data_table + data_colum + ">=</a></li>" +
           " </ul>" +
        " </div>" +
        " <input type='text' class='form-control eb_finput " + htext_class + "' id='" + header_text1 + "' " + data_table + data_colum + coltype + ">" +
        " </div> ";
        return drptext;
    };

    this.getFilterForBoolean = function (colum, tableId, zidx) {
        var filter = "";
        var id = tableId + "_" + colum + "_hdr_txt1";
        var cls = tableId + "_hchk";
        filter = "<center><input type='checkbox' id='" + id + "' data-colum='" + colum + "' data-coltyp='boolean' data-table='" + tableId + "' class='" + cls + " " + tableId + "_htext eb_fbool'></center>";
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
        if (flag)
            this.Api.ajax.reload();
    };

    this.setLiValue = function (e) {
        var selText = $(e.target).text();
        var table = $(e.target).attr('data-table');
        var colum = $(e.target).attr('data-colum');
        $(e.target).parents('.input-group-btn').find('.dropdown-toggle').html(selText);
        $(e.target).parents('.input-group').find('#' + table + '_' + colum + '_hdr_txt2').eq(0).css('visibility', ((selText.trim() === 'B') ? 'visible' : 'hidden'));
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
        $(ftrtxt).val((decip > 0) ? pageTotal.toFixed(decip) : pageTotal.toFixed(2));
    };

    this.clickAlSlct = function (e) {
        var tableid = $(e.target).attr('data-table');
        if (e.target.checked)
            $('#' + this.tableId + '_wrapper tbody [type=checkbox]:not(:checked)').trigger('click');
        else
            $('#' + this.tableId + '_wrapper tbody [type=checkbox]:checked').trigger('click');

        e.stopPropagation();
    };

    this.renderCheckBoxCol = function (data2, type, row, meta) {
        var idpos = $.grep(this.ebSettings.columns, function (e) { return e.name === "id"; })[0].data;
        this.rowId = meta.row; //do not remove - for updateAlSlct
        return "<input type='checkbox' class='" + this.tableId + "_select' name='" + this.tableId + "_id' value='" + row[idpos].toString() + "'/>";
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


    this.colorRow = function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
        $.each(this.ebSettings.columns, function (i, value) {
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


    this.btnGo.click(this.btnGoClick.bind(this));

    if (this.dtsettings.directLoad)
        this.getColumns();
};
