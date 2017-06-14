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
        $.post('GetTVPref4User', { dvid: this.dvid, parameters: JSON.stringify(this.getFilterValues()) }, this.getColumnsSuccess.bind(this));
    };

    this.getColumnsSuccess = function (data) {
        //if (this.dtsettings.directLoad !== true)
        //    this.ebSettings = JSON.parse(data);
        //else
        // this.ebSettings.columns = JSON.parse(data).columns;
        this.ebSettings = JSON.parse(data);
        this.ebSettingsCopy = this.ebSettings;
        //this.updateRenderFunc();
        this.Init();

        if (this.filterBox !== null && this.dtsettings.directLoad !== true)
            this.filterBox.collapse('hide');
    };

    this.Init = function () {
        this.table_jQO = $('#' + this.tableId);
        this.filterBox = $('#filterBox');
        //this.filterbtn = $('#4filterbtn');
        //this.clearfilterbtn = $("#clearfilterbtn_"+this.tableId);
        this.totalpagebtn = $("#" + this.tableId + "_btntotalpage");
        this.copybtn = $("#btnCopy");
        this.printbtn = $("#btnPrint");
        this.printAllbtn = $("#btnprintAll");
        this.printSelectedbtn = $("#btnprintSelected");
        this.excelbtn = $("#btnExcel");
        this.csvbtn = $("#btnCsv");
        this.pdfbtn = $("#btnPdf");
        //this.settingsbtn = $("#" + this.tableId + "_btnSettings");
        $("#dvName_lbl").text(this.ebSettings.dvName);

        this.eb_agginfo = this.getAgginfo();
        if (this.dtsettings.directLoad !== true)
            this.table_jQO.append($(this.getFooterFromSettingsTbl()));

        if (this.ebSettings.hideSerial) {
            this.ebSettings.columns[0].visible = false;
        }
        if (!this.ebSettings.hideCheckbox) {
            this.ebSettings.columns[1].title = "<input id='{0}_select-all' class='eb_selall' type='checkbox' data-table='{0}'/>".replace("{0}", this.tableId);
            this.ebSettings.columns[1].render = this.renderCheckBoxCol.bind(this);
        }
        else
            this.ebSettings.columns[1].visible = false;

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
        o.keys = true,
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
        $("#clearfilterbtn_"+this.tableId).off("click").on("click", this.clearFilter.bind(this));
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

    this.GenerateButtons = function () {
        $("#TableControls").prepend("<div style='display: inline;float: right;'>" +
            "<button type='button' id='"+this.tableId+"_btntotalpage' class='btn btn-default' style='display: none;' data-table='@tableId'>&sum;</button>" +
            "<div id='" + this.tableId + "_fileBtns' style='display: inline-block;'>" +
             "<div class='btn-group'>" +
                "<div class='btn-group'>" +
                   " <div id='btnPrint' class='btn btn-default'  name='filebtn' data-toggle='tooltip' title='Print' ><i class='fa fa-print' aria-hidden='true'></i></div>" +
                       " <div class='btn btn-default dropdown-toggle' data-toggle='dropdown' name='filebtn' style='display: none;'>" +
                         "   <span class='caret'></span>  <!-- caret --></div>" +
                         "   <ul class='dropdown-menu' role='menu'>" +
                          "      <li><a href = '#' id='btnprintAll'> Print All</a></li>" +
                           "     <li><a href = '#' id='btnprintSelected'> Print Selected</a></li>" +
                            "</ul>" +
                "</div>" +
                "<div id='btnExcel' class='btn btn-default'  name='filebtn' data-toggle='tooltip' title='Excel' ><i class='fa fa-file-excel-o' aria-hidden='true'></i></div>" +
                "<div id='btnPdf' class='btn btn-default'    name='filebtn'  data-toggle='tooltip' title='Pdf' ><i class='fa fa-file-pdf-o' aria-hidden='true'></i></div>" +
                "<div id='btnCsv' class='btn btn-default'    name='filebtn' data-toggle='tooltip' title='Csv' ><i class='fa fa-file-text-o' aria-hidden='true'></i></div>  " +
                "<div id='btnCopy' class='btn btn-default'  name='filebtn' data-toggle='tooltip' title='Copy to Clipboard' ><i class='fa fa-clipboard' aria-hidden='true'></i></div>" +
            "</div>" +
            "</div>" +
            "<div id='" + this.tableId + "_btnSettings' class='btn btn-default' data-toggle='modal' data-target='#settingsmodal'><i class='fa fa-cog' aria-hidden='true'></i></div>" +

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
                _ls += (span + "<a class='btn btn-default center-block'  id='clearfilterbtn_"+this.tableId+"' data-table='@tableId' data-toggle='tooltip' title='Clear Filter' style='width:35px'><i class='fa fa-times' aria-hidden='true' style='color:red'></i></a>");
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

    this.link2NewTable = function (e) {
        var idx = this.Api.row($(e.target).parent().parent()).index();
        var Rowobj = $.extend(true, {}, this.Api.row(idx).data());
        this.NewTableModal();
    };

    this.NewTableModal = function () {
        $(document.body).append("<div class='modal fade' id='newmodal' role='dialog'>"
    + "<div class='modal-dialog modal-lg' style='width: 100%;height: 100%;margin: 0;padding: 0;'>"
     + " <div class='modal-content' style=' height: auto;min-height: 100%;border-radius: 0;'>"
        + "<div class='modal-header'>"
          + "<button type = 'button' class='close' data-dismiss='modal'>&times;</button>"
          + "<h4 class='modal-title'></h4>"
        + "</div>"
        + "<div class='modal-body'>"
         + "<table class='table table-striped table-bordered' id='Newtable'></table>"
        + "</div>"
     + "</div>"
    + "</div>"
 + "</div>");
        $("#newmodal").on('shown.bs.modal', this.call2newTable.bind(this));
        $("#newmodal").on('hidden.bs.modal', function (e) {
            $('#Newtable').DataTable().destroy();
            setTimeout(function () {
                $("#newmodal").remove();
            }, 500);
        });
        $("#newmodal").modal('show');
    };

    this.call2newTable = function () {
        var EbDataTable_Newtable = new EbDataTable({
            ds_id: 32,
            //dv_id: @dvId, 
            ss_url: "https://expressbaseservicestack.azurewebsites.net",
            tid: 'Newtable',
            directLoad: true
            //settings: JSON.parse(data),
            //fnKeyUpCallback: 
        });
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
    this.GetSettingsModal = function (e) {
        $(document.body).append("<div id='settingsmodal' class='modal fade in' style='display: block;'>" +
           " <div class='modal-dialog modal-lg' style='width: 1100px;'>" +
                "<div class='modal-content' style='width: 1100px;'>" +
                    "<div class='modal-header'>" +
                      "  <button class='close' data-dismiss='modal'>x</button>" +
                     "   <h4 class='modal-title'>" + this.ebSettings.dvName + ": SettingsTable</h4>" +
                    "</div>" +
                    "<div class='modal-body'>" +
                        

                "    </div>" +
                  "  <div class='modal-footer'>" +
               //    "     <button id='Save_btn' class='btn btn-primary'>Save Changes</button>" +
                "    </div>" +
             "   </div>" +
           " </div>" +
        "</div>");
        $.get("http://localhost:53431/Tenant/DVEditor",  function (datah) { console.log(datah); $("#settingsmodal .modal-body").append($.parseHTML(datah)) });
        $("#Save_btn").click(this.saveSettings.bind(this));
        $("#settingsmodal").on('shown.bs.modal', this.callPost4SettingsTable.bind(this));
        $("#settingsmodal").on('hidden.bs.modal', this.hideModalFunc.bind(this));
        $("#graphmodal").on('hidden.bs.modal', function (e) { $("#graphdiv").empty(); });
        //$("#settingsmodal").modal('show');
    };

    this.hideModalFunc = function (e) {
        alert(this.isSettingsSaved);
        $('#Table_Settings').DataTable().destroy();
        //$(this).data('bs.modal', null);
        //$(this.OuterModalDiv).remove();
        setTimeout(function () {
            $("#settingsmodal").remove();
        }, 500);
        if (this.isSettingsSaved) {
            this.isSettingsSaved = false;
            this.Api.destroy();
            $('#' + this.tableId + '_divcont').children()[1].remove();
            var table = $(document.createElement('table')).addClass('table table-striped table-bordered').attr('id', this.tableId);
            $('#' + this.tableId + '_divcont').append(table);
            this.ebSettings = $.extend(true, {}, this.ebSettingsCopy);
            this.Init();
        }
    };

    this.getColobj = function (col_name) {
        var selcol = null;
        $.each(this.ebSettings.columns, function (i, col) {
            if (col.name.trim() === col_name.trim()) {
                selcol = col;
                return false;
            }
        });
        return selcol;
    };

    this.saveSettings = function () {
        this.isSettingsSaved = true;
        var ct = 0; var objcols = [];
        var api = $('#Table_Settings').DataTable();
        var n, d, t, v, w, ty, cls;
        objcols.push(this.getColobj("id"));
        $.each(api.$('input[name!=font],div[class=font-select]'), function (i, obj) {
            ct++;
            if (obj.type === 'text' && obj.name === 'name')
                n = obj.value;
            else if (obj.type === 'text' && obj.name === 'index')
                d = obj.value;
            else if (obj.type === 'hidden' && obj.name === 'title')
                t = obj.value + '<span hidden>' + n + '</span>';
            else if (obj.type === 'checkbox')
                v = obj.checked;
            else if (obj.type === 'text' && obj.name === 'width')
                w = obj.value;
            else if (obj.type === 'text' && obj.name === 'type')
                ty = obj.value;
            else if (obj.className === 'font-select') {
                if (!($(this).children('a').children('span').attr('style') === undefined)) {
                    var style = document.createElement('style');
                    style.type = 'text/css';
                    var fontName = $(this).children('a').children('span').css('font-family');
                    var replacedName = fontName.replace(/ /g, "_");
                    style.innerHTML = '.font_' + replacedName + ' {font-family: ' + fontName + '; }';
                    document.getElementsByTagName('head')[0].appendChild(style);
                    cls = 'font_' + replacedName + ' tdheight';
                }
                else
                    cls = 'tdheight';
            }

            if (ct === api.columns().count() - 2) { ct = 0; objcols.push(new coldef(d, t, v, w, n, ty, cls)); n = ''; d = ''; t = ''; v = ''; w = ''; ty = ''; cls = ''; }
        });
        //alert(console.log(objcols));
        this.ebSettingsCopy.hideSerial = $("#serial_check").prop("checked");
        this.ebSettingsCopy.hideCheckbox = $("#select_check").prop("checked");
        this.ebSettingsCopy.lengthMenu = this.GetLengthOption($("#pageLength_text").val());
        this.ebSettingsCopy.scrollY = $("#scrollY_text").val();
        this.ebSettingsCopy.rowGrouping = $("#rowGrouping_text").val();
        this.ebSettingsCopy.leftFixedColumns = $("#leftFixedColumns_text").val();
        this.ebSettingsCopy.rightFixedColumns = $("#rightFixedColumns_text").val();
        this.ebSettingsCopy.dvName = $("#dvName_txt").val();
        this.ebSettingsCopy.columns = objcols;
        //this.ebSettings.columnsext = (this.tempcolext !== null) ? this.tempcolext : this.ebSettings.columnsext;

        console.log(JSON.stringify(this.ebSettingsCopy.columnsext));
        this.ebSettingsCopy.columnsext = this.ebSettings.columnsext;
        this.ebSettingsCopy.columnsdel = this.columnsdel;
        this.ebSettingsCopy.columnsextdel = this.columnsextdel;
        this.AddSerialAndOrCheckBoxColumns(this.ebSettingsCopy.columns);
        this.updateRenderFunc();
        if (this.ebSettingsCopy.rowGrouping.length > 0) {
            var groupcols = $.grep(this.ebSettingsCopy.columns, function (e) { return e.name === this.ebSettingsCopy.rowGrouping });
            groupcols[0].visible = false;
        }
        console.log(JSON.stringify(this.ebSettingsCopy.columns));
        $.post('TVPref4User', { tvid: this.dsid, json: JSON.stringify(this.ebSettingsCopy) }, this.reinitDataTable.bind(this));
    };

    this.reinitDataTable = function () {
        $("#settingsmodal").modal('hide');
    };



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

    this.getcolumn4dropdown = function () {
        if (this.ebSettings.columnsdel !== undefined && this.ebSettings.columnsdel !== null) {
            this.ebSettings.columnsdel = this.ebSettings.columnsdel.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
            this.ebSettings.columnsextdel = this.ebSettings.columnsextdel.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
            $.each(this.ebSettings.columnsdel, this.adddelColsandColsext2dropdown.bind(this));
        }

    };

    this.adddelColsandColsext2dropdown = function (i, obj) {
        var liId = "li_" + obj.name;
        $("#columnDropdown ul").append("<li id=" + liId + "><a data-data=\"" + JSON.stringify(obj).replace(/\"/g, "'") + "\" data-colext=\"" + JSON.stringify(this.ebSettings.columnsextdel[i]).replace(/\"/g, "'") + "\" href='#'>" + obj.name + "</a></li>");
    };

    this.showPropertyGrid = function (e) {
        var idx = this.settings_tbl.row(e.target).index();
        CreatePropGrid(this.settings_tbl.row(idx).data(), this.ebSettings.columnsext);
        this.settings_tbl.columns.adjust();
    };

    this.column4SettingsTbl = function () {
        var colArr = [];
        colArr.push(new coldef4Setting('', '#', "", function (data, type, row, meta) { return (meta.row) + 1 }));
        colArr.push(new coldef4Setting('data', 'Column Index', 'hideme', function (data, type, row, meta) { return (data !== "") ? "<input type='text' value=" + data + " name='index'>" : data; }));
        colArr.push(new coldef4Setting('name', 'Name', 'hideme', function (data, type, row, meta) { return (data !== "") ? "<input type='text' value=" + data + " name='name' style='border: 0;width: 100px;' readonly>" : data; }, ""));
        colArr.push(new coldef4Setting('type', ' Column Type', 'hideme', function (data, type, row, meta) { return (data !== "") ? "<input type='text' value=" + data + " name='type'>" : data; }));
        colArr.push(new coldef4Setting('title', 'Title', "", function (data, type, row, meta) { return (data !== "") ? "<input type='hidden' value=" + data + " name='title' style='width: 100px;'>" + data : data; }, ""));
        colArr.push(new coldef4Setting('visible', 'Visible?', "", function (data, type, row, meta) { return (data === 'true') ? "<input type='checkbox'  name='visibile' checked>" : "<input type='checkbox'  name='visibile'>"; }, ""));
        colArr.push(new coldef4Setting('width', 'Width', "", function (data, type, row, meta) { return (data !== "") ? "<input type='text' value=" + data + " name='width' style='width: 40px;'>" : data; }, ""));
        colArr.push(new coldef4Setting('className', 'Font', "", this.renderFontSelect, "30"));
        colArr.push(new coldef4Setting('', '', "", function (data, type, row, meta) { return "<a href='#' class ='eb_delete_btn'><i class='fa fa-times' aria-hidden='true' style='color:red' ></i></a>" }, "30"));
        return colArr;
    };



    this.getData4SettingsTbl = function () {
        var colarr = [];
        var n, d, t, v, w, ty, cls;
        $.each(this.ebSettings.columns, function (i, col) {
            if (col.name !== "serial" && col.name !== "id" && col.name !== "checkbox") {
                n = col.name;
                d = col.data;
                t = col.title.substr(0, col.title.indexOf('<'));
                v = (col.visible).toString().toLowerCase();
                w = col.width.toString();
                if (col.type) ty = col.type.toString();
                cls = col.className;
                if (cls === undefined)
                    cls = "";
                colarr.push(new coldef(d, t, v, w, n, ty, cls));
            }
        });
        return colarr;
    };

    this.initComplete4Settingstbl = function (settings, json) {
        $('.font').fontselect();
        $('#Table_Settings').DataTable().columns.adjust();
        this.addEventListner4Settingstbl();

        //$('#Table_Settings').on('draw.dt', function () {
        //    $('#Table_Settings').DataTable().column(0).nodes().each(function (cell, i) { cell.innerHTML = i + 1; });
        //});
    };

    this.addEventListner4Settingstbl = function () {
        $(".eb_delete_btn").off("click").on("click", this.deleteRow.bind(this));
        $('#columnDropdown .dropdown-menu a').off("click").on("click", this.clickDropdownfunc.bind(this));
    };

    this.renderFontSelect = function (data, type, row, meta) {
        if (data.length > 0 && data !== undefined) {
            var fontName = data.replace("tdheight", " ");
            fontName = fontName.substring(5).replace(/_/g, " ");
            index = fontName.lastIndexOf(" ");
            fontName = fontName.substring(0, index);
            return "<input type='text' value='" + fontName + "' class='font' style='width: 100px;' name='font'>";
        }
        else
            return "<input type='text' class='font' style='width: 100px;' name='font'>";
    };

    this.GetLengthOption = function (len) {
        var ia = [];
        for (var i = 0; i < 10; i++)
            ia[i] = (len * (i + 1));
        return JSON.parse("[ [{0},-1], [{0},\"All\"] ]".replace(/\{0\}/g, ia.join(',')));
    };

    this.AddSerialAndOrCheckBoxColumns = function (tx) {
        if (!tx.hideCheckbox) {
            var chkObj = new Object();
            chkObj.data = null;
            chkObj.title = "<input id='{0}_select-all' type='checkbox' class='eb_selall' data-table='{0}'/>".replace("{0}", this.tableId);
            chkObj.width = 10;
            chkObj.orderable = false;
            chkObj.visible = true;
            chkObj.name = "checkbox";
            var idpos = $.grep(tx, function (e) { return e.name === "id"; })[0].data;
            // chkObj.render = function (data2, type, row, meta) { return renderCheckBoxCol($('#' + tableId).DataTable(), idpos, tableId, row, meta); };
            chkObj.render = this.renderCheckBoxCol.bind(this);
            tx.unshift(chkObj);
        }

        if (!tx.hideSerial)
            tx.unshift(JSON.parse('{"width":10, "searchable": false, "orderable": false, "visible":true, "name":"serial", "title":"#"}'));
    };

    this.updateRenderFunc = function () {
        $.each(this.ebSettingsCopy.columns, this.updateRenderFunc_Inner.bind(this));
    };

    this.updateRenderFunc_Inner = function (i, col) {
        if (col.type === "System.Int32" || col.type === "System.Decimal" || col.type === "System.Int16" || col.type === "System.Int64") {
            if (this.ebSettingsCopy.columnsext[i].RenderAs === "Progressbar") {
                this.ebSettingsCopy.columns[i].render = this.renderProgressCol;
            }
        }
        if (col.type === "System.Boolean") {
            if (this.ebSettingsCopy.columnsext[i].name === "sys_locked" || this.ebSettingsCopy.columnsext[i].name === "sys_cancelled") {
                this.ebSettingsCopy.columns[i].render = (this.ebSettingsCopy.columnsext[i].name === "sys_locked") ? this.renderLockCol : this.renderEbVoidCol;
            }
            else {
                if (this.ebSettingsCopy.columnsext[i].IsEditable) {
                    this.ebSettingsCopy.columns[i].render = this.renderEditableCol;
                }
                if (this.ebSettingsCopy.columnsext[i].RenderAs === "Icon") {
                    this.ebSettingsCopy.columns[i].render = this.renderIconCol;
                }
            }
        }
        if (col.type === "System.String") {
            if (this.ebSettingsCopy.columnsext[i].RenderAs === "Link")
                this.ebSettingsCopy.columns[i].render = this.renderlink4NewTable;
            if (this.ebSettingsCopy.columnsext[i].RenderAs === "Graph") {
                this.ebSettingsCopy.columns[i].render = this.lineGraphDiv;
            }
        }
    };

    this.renderProgressCol = function (data, type, row, meta) {
        return "<div class='progress'><div class='progress-bar' role='progressbar' aria-valuenow='" + data.toString() + "' aria-valuemin='0' aria-valuemax='100' style='width:" + data.toString() + "%'>" + data.toString() + "</div></div>";
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
        return "<a href='#' class ='tablelink'>" + data + "</a>";
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

    this.lineGraphDiv = function (data, type, row, meta) {
        if (!data)
            return "";
        else
            return "<canvas id='eb_cvs" + meta.row + "' class='eb_canvas' style='width:120px; height:40px; cursor:pointer;' data-graph='" + data + "' data-toggle='modal'></canvas><script>renderLineGraphs(" + meta.row + "); $('#eb_cvs" + meta.row + "').mousemove(function(e){ GPointPopup(e); });</script>";
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

    this.deleteRow = function (e) {
        var idx = this.settings_tbl.row($(e.target).parent().parent()).index();
        alert(idx);
        var deletedRow = $.extend(true, {}, this.settings_tbl.row(idx).data());
        this.deleted_colname = deletedRow.name;
        this.columnsdel.push(deletedRow);
        this.settings_tbl.rows(idx).remove().draw();
        this.ebSettingsCopy.columnsdel = this.columnsdel;
        var del_obj = $.grep(this.ebSettings.columnsext, function (obj) { return obj.name === this.deleted_colname; }.bind(this));
        this.columnsextdel.push(del_obj[0]);
        //alert(JSON.stringify(this.columnsextdel));
        this.ebSettingsCopy.columnsextdel = this.columnsextdel;
        this.ebSettings.columnsdel = this.columnsdel;
        this.ebSettings.columnsextdel = this.columnsextdel;
        this.ebSettings.columnsext = $.grep(this.ebSettings.columnsext, function (obj) { return obj.name !== this.deleted_colname; }.bind(this));
        var liId = "li_" + deletedRow.name;
        $("#columnDropdown ul").append($("<li id=" + liId + "><a data-data=\"" + JSON.stringify(deletedRow).replace(/\"/g, "'") + "\" data-colext=\"" + JSON.stringify(this.columnsextdel[this.columnsextdel.length - 1]).replace(/\"/g, "'") + "\" href='#'>" + deletedRow.name + "</a></li>"));
        this.ebSettings.columns = $.grep(this.ebSettings.columns, function (obj) { return obj.name !== this.deleted_colname; }.bind(this));
        //alert(JSON.stringify(this.columnsextdel));
    };

    //this.add2columnsextdel = function (e,obj) {
    //    if (obj.name === this.deleted_colname)
    //        this.columnsextdel.push(obj);
    //    else
    //        this.tempcolext.push(obj);
    //    //this.ebSettingsCopy.columnsextdel = this.columnsextdel;
    //    //return e.name !== this.deleted_colname;
    //};

    this.clickDropdownfunc = function (e) {
        this.dropdown_colname = $(e.target).text();
        var col = JSON.parse($(e.target).attr("data-data").replace(/\'/g, "\""));
        this.settings_tbl.row.add(col).draw();
        var colext = JSON.parse($(e.target).attr("data-colext").replace(/\'/g, "\""));
        this.ebSettings.columnsext.push(colext);
        this.columnsdel = $.grep(this.columnsdel, function (obj) { return obj.name !== this.dropdown_colname; }.bind(this));
        this.columnsextdel = $.grep(this.columnsextdel, function (obj) { return obj.name !== this.dropdown_colname; }.bind(this));
        $.each(this.settings_tbl.$('input[name=font]'), function (i, obj) {
            if ($(obj).siblings().size() === 0) {
                $(obj).fontselect();
            }
        });
        $("#columnDropdown ul #" + $(e.target).parent().attr("id")).remove();
    };


    this.btnGo.click(this.btnGoClick.bind(this));

    if (this.dtsettings.directLoad)
        this.getColumns();
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

