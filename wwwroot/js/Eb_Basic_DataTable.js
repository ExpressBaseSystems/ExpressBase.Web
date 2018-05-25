
//refid, ver_num, type, dsobj, cur_status, tabNum, ssurl
var EbBasicDataTable = function (Option) {
    this.dsid = Option.dsid;
    this.tableId = Option.tableId;
    this.showSerialColumn = (typeof Option.showSerialColumn !== "undefined" && Option.showSerialColumn !== "" && Option.showSerialColumn !== null) ? Option.showSerialColumn : true;
    this.showCheckboxColumn = (typeof Option.showCheckboxColumn !== "undefined" && Option.showCheckboxColumn !== "" && Option.showCheckboxColumn !== null) ? Option.showCheckboxColumn : true;
    this.showFilterRow = (typeof Option.showFilterRow !== "undefined" && Option.showFilterRow !== "" && Option.showFilterRow !== null) ? Option.showFilterRow : true;
    this.scrollHeight = Option.scrollHeight || "inherit";
    this.hiddenFieldName = Option.hiddenFieldName || "id";
    this.isSecondTime = false;
    this.Api = null;
    this.order_info = new Object();
    this.order_info.col = '';
    this.order_info.dir = 0;
    this.EbObject = null;
    this.ebSettings = null;
    this.login = "dc";
    this.FD = false;
    //Controls & Buttons
    this.table_jQO = null;
    this.eb_filter_controls_4fc = [];
    this.eb_filter_controls_4sb = [];
    this.linkDV = null;
    this.filterFlag = false;
    this.filterValues = [];
    this.FlagPresentId = false;

    this.extraCol = [];
    this.modifyDVFlag = false;
    this.initCompleteflag = false;
    this.isTagged = false;
    this.isRun = false;

    this.init = function () {
        //this.tableId = "dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + counter;
    }

    this.call2FD = function () {
        this.EbObject.DataSourceRefId = this.dsid;
        //$("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#parent", Style: { "top": "39px", "margin-left": "-15px" } }, maskLoader: false });
        //console.log($.cookie());
        $.ajax({
            type: "POST",
            url: "../boti/dvView1",
            data: { dvobj: JSON.stringify(this.EbObject) },
            success: this.ajaxSucc.bind(this)
        });
    };

    this.ajaxSucc = function (text) {
        $("#ComboBox0Container").append(text);
        this.EbObject = dvGlobal.Current_obj;
        this.getColumnsSuccess();
    }.bind(this);

    if (this.EbObject === null) {
        this.EbObject = new EbTableVisualization("Container_" + Date.now());
        this.call2FD();
    }
    else {
        this.init();
        this.call2FD();
    };

    this.getColumnsSuccess = function () {
        //$("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#parent", Style: { "top": "39px", "margin-left": "-15px" } } });
        $(".icon-cont").hide();
        this.extraCol = [];
        this.ebSettings = this.EbObject;
        this.dvName = this.ebSettings.Name;
        this.initCompleteflag = false;

        this.addSerialAndCheckboxColumns();
        if (this.ebSettings.$type.indexOf("EbTableVisualization") !== -1) {
            //$("#content_" + this.tableId).empty();
            //$("#content_" + this.tableId).append("<div style='width:auto;height:inherit;' id='" + this.tableId + "divcont'><table id='" + this.tableId + "' class='table table-striped table-bordered pageResize'></table></div>");
            this.Init();
        }
    };

    this.Init = function () {
        $.event.props.push('dataTransfer');
        //this.updateRenderFunc();
        this.table_jQO = $('#' + this.tableId);

        this.eb_agginfo = this.getAgginfo();

        this.table_jQO.append($(this.getFooterFromSettingsTbl()));

        this.table_jQO.children("tfoot").hide();

        this.table_jQO.on('processing.dt', function (e, settings, processing) {
            if (processing == true) {
                $("#obj_icons .btn").prop("disabled", true);
                //$("#eb_common_loader").EbLoader("show", { maskItem: { Id: "#parent", Style: { "top": "39px", "margin-left": "-15px" } } });
            }
            else {
                $("#obj_icons .btn").prop("disabled", false);
                //$("#eb_common_loader").EbLoader("hide");
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
                return (a * 1) + (b * 1); // cast values in-case they are strings
            }, 0);

            return sum / data.length;
        });

        this.table_jQO.off('draw.dt').on('draw.dt', this.doSerial.bind(this));

        this.table_jQO.on('length.dt', function (e, settings, len) {
            console.log('New page length: ' + len);
        });

        $.fn.dataTable.ext.errMode = function (settings, helpPage, message) {
            alert("ajax erpttt......");
        };

        $('#' + this.tableId + ' tbody').off('dblclick').on('dblclick', 'tr', this.dblclickCallbackFunc.bind(this));

    };

    this.addSerialAndCheckboxColumns = function () {
        this.CheckforColumnID();//"sWidth":"10px", 
        var serialObj = (JSON.parse('{"sWidth":"10px", "searchable": false, "orderable": false, "bVisible":true, "name":"serial", "title":"#", "Type":11}'));
        if (this.showSerialColumn)
            this.extraCol.push(serialObj);
        this.addcheckbox();
    }

    this.CheckforColumnID = function () {
        $.each(this.ebSettings.Columns.$values, function (i, col) {
            if (col.name === this.hiddenFieldName) {
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
        chkObj.bVisible = (this.showCheckboxColumn) ? true : false;
        chkObj.name = "checkbox";
        chkObj.Type = 3;
        chkObj.render = this.renderCheckBoxCol.bind(this);
        chkObj.pos = "-1";

        this.extraCol.push(chkObj);
    }

    this.createTblObject = function () {
        var o = new Object();
        o.scrollY = this.scrollHeight;
        o.scrollX = "100%";
        o.bAutoWidth = false;
        o.autowidth = false;
        o.serverSide = true;
        o.processing = true;
        o.language = {
            processing: "<div class='fa fa-spinner fa-pulse fa-3x fa-fw'></div>",
        };
        o.columns = this.extraCol.concat(this.ebSettings.Columns.$values);
        o.order = [];
        o.dom = "<'col-md-12 noPadding display_none'>rt";
        o.paging = false;
        o.lengthChange = false;
        o.select = true;
        o.keys = true,
            o.ajax = {
                url: "../boti/getData",
                type: 'POST',
                data: this.ajaxData.bind(this),
                dataSrc: this.receiveAjaxData.bind(this),
            };
        o.fnRowCallback = this.rowCallBackFunc.bind(this);
        o.drawCallback = this.drawCallBackFunc.bind(this);
        o.initComplete = this.initCompleteFunc.bind(this);
        return o;
    };

    this.ajaxData = function (dq) {
        delete dq.columns; delete dq.order; delete dq.search;
        dq.RefId = this.EbObject.DataSourceRefId;
        this.columnSearch = this.repopulate_filter_arr();
        dq.TFilters = this.columnSearch;
        this.filterValues = this.getFilterValues("filter");
        dq.Params = this.filterValues;
        //dq.rowData = this.rowData;
        dq.OrderByCol = this.order_info.col;
        dq.OrderByDir = this.order_info.dir;
        if (this.columnSearch.length > 0) {
            this.filterFlag = true;
        }
        dq.Ispaging = this.EbObject.IsPaging;

        return dq;
    };

    this.getFilterValues = function (from) {
        this.filterChanged = false;
        var fltr_collection = [];
        var FdCont = "#sub_windows_sidediv_" + this.tableId;
        var paramstxt = $(FdCont + " #all_control_names").val();//$('#hiddenparams').val().trim();datefrom,dateto
        if (paramstxt != undefined) {
            var params = paramstxt.split(',');
            if (params.length > 0) {
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
        }
        return fltr_collection;
    };

    this.filterDisplay = function () {
        if ($("#sub_window_" + this.tableId).find(".dataTables_scroll").children().hasClass("filter_Display")) {
            $(".filter_Display").empty();
            var $controls = $("#sub_windows_sidediv_" + this.tableId + " #filterBox").children().not("[type=hidden],.commonControl");
            var filter = "";
            if ($controls.length > 0) {
                $.each($controls, function (i, ctrl) {
                    var ctype = $(ctrl).attr("ctype");
                    filter += $($(ctrl).children()[0]).text();
                    if (ctype !== "Date")
                        filter += " " + $($(ctrl).children()[1]).val();
                    else
                        filter += " " + $(ctrl).find("input").val();
                    filter += " AND ";
                });
            }

            if (this.columnSearch.length > 0) {
                $.each(this.columnSearch, function (i, search) {
                    filter += search.Column + " " + search.Operator;
                    if (search.Value.includes("|")) {
                        filter += "(";
                        $.each(search.Value.split("|"), function (i, val) {
                            if (val.trim() !== "")
                                filter += " " + val + " OR";
                        });
                        filter = filter.substring(0, filter.lastIndexOf("OR"));
                        filter += ")";
                    }
                    else
                        filter += " " + search.Value;
                    filter += "AND "
                });
            }

            filter = filter.substring(0, filter.lastIndexOf("AND"));
            $(".filter_Display").text(filter);
        }
    }

    this.getfilter = function (fltr_collection, i, data) {
        fltr_collection.push(new fltr_obj(data.Type, data.name, this.rowData[i]));
    };

    this.receiveAjaxData = function (dd) {
        this.isRun = true;
        if (this.login == "uc") {
            dvcontainerObj.currentObj.data = dd;
            this.MainData = dd;
        }

        return dd.data;
        //$("#eb_common_loader").EbLoader("hide");
    };

    this.compareFilterValues = function () {
        var filter = this.getFilterValues("compare");
        if (focusedId !== undefined) {
            $.each(filter, function (i, obj) {
                if (obj.Value !== dvcontainerObj.dvcol[focusedId].filterValues[i].Value) {
                    filterChanged = true;
                    return false;
                }

            }.bind(this));
        }
        else
            filterChanged = true;
    }

    this.fixedColumnCount = function () {
        var count = this.ebSettings.LeftFixedColumn;
        var visCount = 0;
        if (count > 1) {
            $.each(this.Api.settings().init().aoColumns, function (i, col) {
                if (!col.bVisible) {
                    if (this.ebSettings.LeftFixedColumn > visCount)
                        count++;
                    else
                        return count;
                }
                else
                    visCount++;
            }.bind(this));
        }
        return count;
    }

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
        if (col.bVisible && (col.Type == parseInt(gettypefromString("Int32")) || col.Type == parseInt(gettypefromString("Decimal")) || col.Type == parseInt(gettypefromString("Int64")) || col.Type == parseInt(gettypefromString("Double"))) && col.name !== "serial")
            _ls.push(new Agginfo(col.name, this.ebSettings.Columns.$values[i].DecimalPlaces));
    };

    this.getFooterFromSettingsTbl = function () {
        var ftr_part = "";
        $.each(this.extraCol, function (i, col) {
            if (col.bVisible)
                ftr_part += "<th style=\"padding: 0px; margin: 0px\"></th>";
            else
                ftr_part += "<th style=\"display:none;\"></th>";
        });
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
                            filter_obj_arr.push(new filter_obj(colum, "=", val1));
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
        if (this.eb_agginfo.length > 0) {
            this.createFooter(0);
            this.createFooter(1);
            $("#" + this.tableId + "_wrapper .dataTables_scrollFoot").children().find("tfoot").show();
        }
        if (this.login == "uc") {
            this.initCompleteflag = true;
            if (this.isSecondTime) { }
            this.ModifyingDVs(dvcontainerObj.currentObj.Name, "initComplete");
        }

        this.filterDisplay();
        this.Api.columns.adjust();

        //$("#eb_common_loader").EbLoader("hide");

        setTimeout(function () {
            if (this.showFilterRow)
                this.createFilterRowHeader();
            this.addFilterEventListeners();
            this.Api.columns.adjust();
            Option.fninitComplete();
        }.bind(this), 10);
    }

    this.contextMenu = function () {
        $.contextMenu({
            selector: ".tablelink_" + this.tableId,
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
        this.rowData = this.Api.row(idx).data();
        //this.filterValues = this.getFilterValues("link");
        var splitarray = this.linkDV.split("-");
        if (splitarray[2] === "3") {
            var url = "http://" + this.url + "/ReportRender/BeforeRender?refid=" + this.linkDV;
            var copycelldata = cData.replace(/[^a-zA-Z ]/g, "").replace(/ /g, "_");
            if ($(`#RptModal${copycelldata}`).length !== 0)
                $(`#RptModal${copycelldata}`).remove();
            $("#parent-div0").append(`<div class="modal fade RptModal" id="RptModal${copycelldata}" role="dialog">
                <div class="modal-dialog modal-sm">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal">&times;</button>                              
                        </div>
                        <div class="modal-body"> <iframe id="reportIframe${copycelldata}" class="reportIframe" src='../ReportRender/RenderReport2?refid=${this.linkDV}&Params=${JSON.stringify(this.filterValues)}'></iframe>
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
        else {
            this.tabNum++;
            var url = "http://" + this.url + "/DV/dv?refid=" + this.linkDV;

            var _form = document.createElement("form");
            _form.setAttribute("method", "post");
            _form.setAttribute("action", url);
            _form.setAttribute("target", "_blank");

            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = "rowData";
            input.value = this.rowData.toString();
            _form.appendChild(input);

            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = "filterValues";
            input.value = JSON.stringify(this.filterValues);
            _form.appendChild(input);

            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = "tabNum";
            input.value = this.tabNum;
            _form.appendChild(input);

            document.body.appendChild(_form);

            //note I am using a post.htm page since I did not want to make double request to the page 
            //it might have some Page_Load call which might screw things up.
            //window.open("post.htm", name, windowoption);       
            _form.submit();
            document.body.removeChild(_form);
        }

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
        if (this.ebSettings.rowGrouping.$values.length > 0)
            this.doRowgrouping();
        this.summarize2();
        this.Api.columns.adjust();
        if (this.login === "uc" && !this.modifyDVFlag && this.initCompleteflag) {
            //this.ModifyingDVs(dvcontainerObj.currentObj.Name, "draw");
        }
        this.filterDisplay();
    };

    this.selectCallbackFunc = function (e, dt, type, indexes) {
        //alert("selectCallbackFunc");
        //if (this.dtsettings.fnKeyUpCallback)
        Option.fnKeyUpCallback(e, dt, type, indexes);
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
        //if (this.dtsettings.fnDblclickCallbackFunc)
        Option.fnDblclickCallback(e);
    };

    this.doRowgrouping = function () {
        var rows = this.Api.rows({ page: 'current' }).nodes();
        var last = null;
        var count = this.ebSettings.Columns.$values.length;
        this.Api.column(this.Api.columns(this.ebSettings.rowGrouping.$values[0].name + ':name').indexes()[0], { page: 'current' }).data().each(function (group, i) {
            if (last !== group) {
                $(rows).eq(i).before("<tr class='group'><td colspan=" + count + ">" + group + "</td></tr>");
                last = group;
            }
        });
    };

    this.doRowgrouping_inner = function (last, rows, group, i) {
        if (last !== group) {
            $(rows).eq(i).before("<tr class='group'><td colspan=" + this.ebSettings.Columns.$values.length + ">" + group + "</td></tr>");
            last = group;
        }
    };

    this.doSerial = function () {
        if (this.showSerialColumn)
            this.Api.column(0).nodes().each(function (cell, i) { cell.innerHTML = i + 1; });
        this.Api.columns.adjust();
    };

    this.createFooter = function (pos) {
        var tx = this.ebSettings;
        var tid = this.tableId;
        var aggFlag = false;
        var lfoot = $('#' + this.tableId + '_wrapper .DTFC_LeftFootWrapper table');
        var rfoot = $('#' + this.tableId + '_wrapper .DTFC_RightFootWrapper table');
        var scrollfoot = $('#' + this.tableId + '_wrapper .dataTables_scrollFootInner table');

        if (lfoot !== null || rfoot !== null)
            var eb_footer_controls_lfoot = this.GetAggregateControls(pos, 50);
        if (scrollfoot !== null)
            var eb_footer_controls_scrollfoot = this.GetAggregateControls(pos, 1);
        if (pos == 0) {
            $.each(this.Api.settings().init().aoColumns, function (i, col) {
                if (col.Aggregate) {
                    $('#' + tid + '_btntotalpage').css("display", "inline");
                    aggFlag = true;
                    return false;
                }
            });

            if (!aggFlag)
                $('#' + this.tableId + '_wrapper .dataTables_scrollFootInner tfoot tr:eq(' + pos + ')').hide();
        }
        if (pos === 1)
            $('#' + this.tableId + '_wrapper .dataTables_scrollFootInner tfoot tr:eq(' + pos + ')').hide();
        var j = 0;
        $('#' + this.tableId + '_wrapper .dataTables_scrollFootInner tfoot tr:eq(' + pos + ') th').each(function (idx) {
            if (lfoot !== null) {
                if (j < tx.LeftFixedColumn)
                    $(this).html(eb_footer_controls_lfoot[idx]);
            }

            if (rfoot !== null) {
                if (j === eb_footer_controls_lfoot.length - tx.RightFixedColumn) {
                    if (j < eb_footer_controls_lfoot.length)
                        $(this).html(eb_footer_controls_lfoot[idx]);
                }
            }

            if (scrollfoot !== null) {
                if (tx.LeftFixedColumns + tx.RightFixedColumn > 0) {
                    if (j < eb_footer_controls_scrollfoot.length - tx.RightFixedColumn)
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
        //$.each(this.ebSettings.Columns.$values, this.GetAggregateControls_inner.bind(this, ResArray, footer_id, zidx));
        $.each(this.Api.settings().init().aoColumns, this.GetAggregateControls_inner.bind(this, ResArray, footer_id, zidx));
        return ResArray;
    };

    this.GetAggregateControls_inner = function (ResArray, footer_id, zidx, i, col) {
        var _ls;
        if (col.bVisible) {
            //(col.Type ==parseInt( gettypefromString("Int32")) || col.Type ==parseInt( gettypefromString("Decimal")) || col.type ==parseInt( gettypefromString("Int64")) || col.Type ==parseInt( gettypefromString("Double"))) && col.name !== "serial"
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
        $.each(this.Api.settings().init().aoColumns, function (index, agginfo) {
            if (agginfo.Aggregate) {
                p = $('.dataTables_scrollFootInner #' + tableId + '_' + agginfo.name + '_ftr_sel0').text().trim();
                ftrtxt = '.dataTables_scrollFootInner #' + tableId + '_' + agginfo.name + '_ftr_txt0';
                var col = api.column(agginfo.name + ':name');

                var summary_val = 0;
                if (p === '∑')
                    summary_val = col.data().sum();
                if (p === 'x̄') {
                    summary_val = col.data().average();
                }
                $(ftrtxt).val(summary_val.toFixed(agginfo.DecimalPlaces));
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


        this.Api.on('key-focus', function (e, datatable, cell) {
            datatable.rows().deselect();
            datatable.row(cell.index().row).select();
        });

        $("#clearfilterbtn_" + this.tableId).off("click").on("click", this.clearFilter.bind(this));
        $("#" + this.tableId + "_btntotalpage").off("click").on("click", this.showOrHideAggrControl.bind(this));
        $(".columnMarker_" + this.tableId).off("click").on("click", this.link2NewTable.bind(this));
        $('[data-toggle="tooltip"]').tooltip({
            placement: 'bottom'
        });
        this.filterDisplay();
    };

    this.GenerateButtons = function () {
        $(".toolicons").show();
        $("#objname").text(this.dvName);
        $("#obj_icons").empty();
        $("#obj_icons").append("<button id='btnGo" + this.tableId + "' class='btn commonControl'><i class='fa fa-play' aria-hidden='true'></i></button>");
        $("#btnGo" + this.tableId).click(this.getColumnsSuccess.bind(this));
        if ($("#" + this.tableId).children().length > 0) {
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
            if (this.FD) {
                $("#obj_icons").append("<button id= 'btnToggleFD" + this.tableId + "' class='btn'  data- toggle='ToogleFD'> <i class='fa fa-filter' aria-hidden='true'></i></button>");
            }
            $("#obj_icons").append("<button id= 'btnTogglePPGrid" + this.tableId + "' class='btn'  data- toggle='TooglePPGrid'><i class='material-icons'>settings</i></button>");
            //$("#" + this.tableId + "_btntotalpage").off("click").on("click", this.showOrHideAggrControl.bind(this));
            if (this.login == "uc") {
                //if (!this.isContextual)
                dvcontainerObj.appendRelatedDv(this.tableId);
                dvcontainerObj.modifyNavigation();
                $("#btnTogglePPGrid" + this.tableId).hide();
                //if (!$("#sub_window_" + this.tableId).find(".dataTables_scroll").children().hasClass("filter_Display"))
                //    $("#sub_window_" + this.tableId).find(".dataTables_scroll").append(`<div class='filter_Display'></div>`);
            }

            $("#" + this.tableId + "_fileBtns").find("[name=filebtn]").not("#btnExcel" + this.tableId).hide();
            this.addFilterEventListeners();

        }
    };

    this.setFilterboxValue = function (i, obj) {
        $(obj).children('div').children('.eb_finput').off("keypress").on("keypress", this.call_filter);
        //$(obj).children('div').children('.eb_finput').on("keydown", function (event) {
        //    if (event.keyCode === $.ui.keyCode.TAB &&
        //        $(this).autocomplete("instance").menu.active) {
        //        event.preventDefault();
        //    }
        //});
        //var name = $(obj).children('span').text();
        //var idx = this.Api.columns(name + ':name').indexes()[0];
        //var data = this.Api.columns(idx).data()[0];
        //if ($(obj).children('div').children('.eb_finput').attr("data-coltyp") === "string") {
        //    $(obj).children('div').children('.eb_finput').autocomplete({
        //        //source: $.unique(this.Api.columns(idx).data()[0]),
        //        source: function (request, response) {
        //            // delegate back to autocomplete, but extract the last term
        //            response($.ui.autocomplete.filter(
        //                $.unique(data), extractLast(request.term)));
        //        }.bind(this),
        //        focus: function () {
        //            // prevent value inserted on focus
        //            return false;
        //        },
        //        select: function (event, ui) {
        //            var terms = splitval(this.value);
        //            // remove the current input
        //            terms.pop();
        //            // add the selected item
        //            terms.push(ui.item.value);
        //            // add placeholder to get the comma-and-space at the end
        //            terms.push("");
        //            this.value = terms.join(" | ");
        //            //$(this).setCursorPosition(this.value.length-1);
        //            return false;
        //        },
        //        search: function (event, ui) {
        //        }
        //    });
        //}
        //else {
        //    if ($(obj).children('div').length === 0) {
        //        var $lctrl = $("#" + this.tableId + "_wrapper .DTFC_LeftHeadWrapper table tr[class=addedbyeb] th:eq(" + i + ")").find(".eb_finput");
        //        var $rctrl = $("#" + this.tableId + "_wrapper .DTFC_RightHeadWrapper table tr[class=addedbyeb] th:eq(" + i + ")").find(".eb_finput");
        //        if ($lctrl.length > 0) {
        //            if ($lctrl.attr("data-coltyp") === "string") {
        //                $lctrl.autocomplete({
        //                    //source: $.unique(this.Api.columns(idx).data()[0]),
        //                    source: function (request, response) {
        //                        // delegate back to autocomplete, but extract the last term
        //                        response($.ui.autocomplete.filter(
        //                            $.unique(data), extractLast(request.term)));
        //                    }.bind(this),
        //                    focus: function () {
        //                        // prevent value inserted on focus
        //                        return false;
        //                    },
        //                    select: function (event, ui) {
        //                        var terms = splitval(this.value);
        //                        // remove the current input
        //                        terms.pop();
        //                        // add the selected item
        //                        terms.push(ui.item.value);
        //                        // add placeholder to get the comma-and-space at the end
        //                        terms.push("");
        //                        this.value = terms.join(" | ");
        //                        //$(this).setCursorPosition(this.value.length-1);
        //                        return false;
        //                    },
        //                    search: function (event, ui) {
        //                    }
        //                });
        //            }
        //        }
        //        if ($rctrl.length > 0) {
        //            if ($rctrl.attr("data-coltyp") === "string") {
        //                $rctrl.autocomplete({
        //                    //source: $.unique(this.Api.columns(idx).data()[0]),
        //                    source: function (request, response) {
        //                        // delegate back to autocomplete, but extract the last term
        //                        response($.ui.autocomplete.filter(
        //                            $.unique(data), extractLast(request.term)));
        //                    }.bind(this),
        //                    focus: function () {
        //                        // prevent value inserted on focus
        //                        return false;
        //                    },
        //                    select: function (event, ui) {
        //                        var terms = splitval(this.value);
        //                        // remove the current input
        //                        terms.pop();
        //                        // add the selected item
        //                        terms.push(ui.item.value);
        //                        // add placeholder to get the comma-and-space at the end
        //                        terms.push("");
        //                        this.value = terms.join(" | ");
        //                        //$(this).setCursorPosition(this.value.length-1);
        //                        return false;
        //                    },
        //                    search: function (event, ui) {
        //                    }
        //                });
        //            }
        //        }
        //    }

        //}
    };

    this.orderingEvent = function (e) {
        //var col = $(e.target).children('span').text();
        var col = $(e.target).text();
        var tempobj = $.grep(this.Api.settings().init().aoColumns, function (obj) { return obj.sTitle === col });
        var cls = $(e.target).attr('class');
        if (col !== '' && col !== "#") {
            this.order_info.col = tempobj[0].name;
            this.order_info.dir = (cls.indexOf('sorting_asc') > -1) ? 2 : 1;
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

            _ls += "<th style='vertical-align:top; padding: 0px; margin: 0px; height: 28px!important;'>";
            if (col.name === "serial") {
                _ls += (span + "<a class='btn btn-sm center-block'  id='clearfilterbtn_" + this.tableId + "' data-table='@tableId' data-toggle='tooltip' title='Clear Filter' style='height:100%'><i class='fa fa-filter' aria-hidden='true' style='color:black'></i></a>");
            }
            else {
                if (col.Type == parseInt(gettypefromString("Int32")) || col.Type == parseInt(gettypefromString("Decimal")) || col.Type == parseInt(gettypefromString("Int64")) || col.Type == parseInt(gettypefromString("Double")) || col.Type == parseInt(gettypefromString("Numeric"))) {

                    _ls += (span + this.getFilterForNumeric(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex));
                }
                else if (col.Type == parseInt(gettypefromString("String"))) {
                    //if (this.dtsettings.filterParams === null || this.dtsettings.filterParams === undefined)

                    _ls += (span + this.getFilterForString(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex));
                    //else
                    //   _ls += (span + this.getFilterForString(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex, this.dtsettings.filterParams));
                }
                else if (col.Type == parseInt(gettypefromString("DateTime"))) {

                    _ls += (span + this.getFilterForDateTime(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex));
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
            " <input type='number' data-toggle='tooltip' title='' style='width:100%!important' class='form-control eb_finput " + htext_class + "' id='" + header_text1 + "' " + data_table + data_colum + coltype + ">" +
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
            " <input type='date' data-toggle='tooltip' title='' style='width:100%!important' class='form-control eb_finput " + htext_class + "' id='" + header_text1 + "' " + data_table + data_colum + coltype + ">" +
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
            " <input type='text' data-toggle='tooltip' title='' style='width:100%!important'  class='form-control eb_finput " + htext_class + "' id='" + header_text1 + "' " + data_table + data_colum + coltype + ">" +
            " </div> ";
        return drptext;
    };

    this.getFilterForBoolean = function (colum, tableId, zidx) {
        var filter = "";
        var id = tableId + "_" + colum + "_hdr_txt1";
        var cls = tableId + "_hchk";
        filter = "<center><input type='checkbox' id='" + id + "' data-toggle='tooltip' title='' data-colum='" + colum + "' data-coltyp='boolean' data-table='" + tableId + "' class='" + cls + " " + tableId + "_htext eb_fbool" + this.tableId + "' style='vertical-align: middle;'></center>";
        return filter;
    };

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
            $('#clearfilterbtn_' + this.tableId).children("i").removeClass("fa-times").addClass("fa-filter");
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
                $(e.target).parents('.input-group').append("<input type='" + ctype + "' class='between-inp form-control eb_finput " + this.tableId + "_htext' id='" + this.tableId + "_" + colum + "_hdr_txt2'>");
                $("#" + this.tableId + "_" + colum + "_hdr_txt1").addClass("between-inp");
                $("#" + this.tableId + "_" + colum + "_hdr_txt2").on("keypress", this.call_filter);
            }
            //flag = true;
        }
        else if (selText.trim() !== 'B') {
            if ($(e.target).parents('.input-group').find("input").length == 2) {
                $(e.target).parents('.input-group').find("input").eq(1).remove();
                $("#" + this.tableId + "_" + colum + "_hdr_txt1").removeClass("between-inp");
                //$("#" + this.tableId + "_" + colum + "_hdr_txt1").style("width", "100%", "important"); 
            }
            //flag = false;
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
                $('#' + this.tableId).DataTable().ajax.reload();
                if ($('#clearfilterbtn_' + this.tableId).children("i").hasClass("fa-filter"))
                    $('#clearfilterbtn_' + this.tableId).children("i").removeClass("fa-filter").addClass("fa-times");
            }
        }
    }.bind(this);

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

        ftrtxt = '.dataTables_scrollFootInner #' + this.tableId + '_' + colum + '_ftr_txt0';

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
        if (this.FlagPresentId) {
            var idpos = $.grep(this.ebSettings.Columns.$values, function (obj) { return obj.name === this.hiddenFieldName; }.bind(this))[0].data;
            //var idpos = getObjByval(this.ebSettings.Columns.$values, "name", this.hiddenFieldName).data;
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
        //if (this.ebSettings.scrollY !== 0)
        $('#' + this.tableId + '_wrapper .dataTables_scrollFootInner tfoot tr:eq(0)').toggle();
        //else
        //    $('#' + this.tableId + '_wrapper .dataTables_scrollFootInner tfoot tr:eq(1)').toggle();
        this.Api.columns.adjust();
    };

    this.link2NewTable = function (e) {
        var cData;
        this.isContextual = true;
        if ($(e.target).closest("a").attr("data-latlong") !== undefined)
            cData = $(e.target).closest("a").attr("data-latlong");
        else
            cData = $(e.target).text();
        this.linkDV = $(e.target).closest("a").attr("data-link");
        var idx = this.Api.row($(e.target).parent().parent()).index();
        this.rowData = this.Api.row(idx).data();
        this.filterValues = this.getFilterValues("link");
        if (this.login === "uc")
            dvcontainerObj.drawdvFromTable(this.rowData.toString(), JSON.stringify(this.filterValues), cData.toString());//, JSON.stringify(this.filterValues)
        else
            this.OpeninNewTab(idx, cData);
    };

    this.call2newTable = function () {

        //var EbDataTable_Newtable = new EbDataTable({
        //    dv_id: this.linkDV,
        //    ss_url: "https://expressbaseservicestack.azurewebsites.net",
        //    tid: 'dv' + this.linkDV + '_' + index,
        //    linktable: true,
        //    cellData: this.cellData,
        //    rowData: this.rowData,
        //    filterValues: this.filterValues
        //    //directLoad: true
        //});

        $.ajax({
            type: "POST",
            url: "../DV/dvTable",
            data: { objid: this.linkDV, objtype: 16 },
            success: function (text) {
                var myWindow = window.open("", "");
                myWindow.document.write(text);
            }
        });
    };

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
        if (col.Type == parseInt(gettypefromString("Int32")) || col.Type == parseInt(gettypefromString("Decimal")) || col.Type == parseInt(gettypefromString("Int64"))) {
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
            else if (this.ebSettings.Columns.$values[i].DecimalPlaces > 0) {
                var deci = this.ebSettings.Columns.$values[i].DecimalPlaces;
                this.ebSettings.Columns.$values[i].render = function (data, type, row, meta) {
                    return parseFloat(data).toFixed(deci);
                }
                this.ebSettings.Columns.$values[i].mRender = function (data, type, row, meta) {
                    return parseFloat(data).toFixed(deci);
                }
            }
            else {
                this.ebSettings.Columns.$values[i].render = function (data, type, row, meta) { return data; };
                this.ebSettings.Columns.$values[i].mRender = function (data, type, row, meta) { return data; };
            }
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
                this.ebSettings.Columns.$values[i].render = this.renderlink4NewTable.bind(this);
                this.ebSettings.Columns.$values[i].mRender = this.renderlink4NewTable.bind(this);
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
            else {
                this.ebSettings.Columns.$values[i].render = function (data, type, row, meta) { return data; };
                this.ebSettings.Columns.$values[i].mRender = function (data, type, row, meta) { return data; };
            }
        }
        //if (col.fontfamily !== 0) {
        //    var style = document.createElement('style');
        //    style.type = 'text/css';
        //    var fontName = col.fontfamily.replace(/_/g, " ");
        //    style.innerHTML = '.font_' + col.fontfamily + '{font-family: ' + fontName + ';}';
        //    document.getElementsByTagName('body')[0].appendChild(style);
        //    this.ebSettings.Columns.$values[i].className = "font_" + col.fontfamily + " tdheight";
        //    this.ebSettings.Columns.$values[i].sClass = "font_" + col.fontfamily + " tdheight";
        //}
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
        return (data === true) ? "<i class='fa fa-check' aria-hidden='true'  style='color:green'></i>" : "<i class='fa fa-times' aria-hidden='true' style='color:red'></i>";
    };

    this.renderEbVoidCol = function (data) {
        return (data === true) ? "<i class='fa fa-ban' aria-hidden='true'></i>" : "";
    };

    this.renderLockCol = function (data) {
        return (data === true) ? "<i class='fa fa-lock' aria-hidden='true'></i>" : "";
    };

    this.renderlink4NewTable = function (data, type, row, meta) {
        return "<a href='#' oncontextmenu='return false' class ='tablelink_" + this.tableId + "' data-link='" + this.ebSettings.Columns.$values[meta.col - 2].LinkRefId + "'>" + data + "</a>";
    };

    this.renderlinkandDecimal = function (deci, data) {
        return "<a href='#' oncontextmenu='return false' class ='tablelink_" + this.tableId + "' data-link='" + this.linkDV + "'>" + parseFloat(data).toFixed(deci) + "</a>";
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
            return `<img class='img-thumbnail' src='http://graph.facebook.com/${data}/picture?type=square' />`;
        else
            return `<img class='img-thumbnail' src='http://graph.facebook.com/12345678/picture?type=square' />`;
    };

    this.renderDataAsLabel = function (data) {
        return `<label class='labeldata'>${data}</label>`;
    };
};

