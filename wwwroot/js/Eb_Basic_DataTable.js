﻿
//refid, ver_num, type, dsobj, cur_status, tabNum, ssurl
var EbBasicDataTable = function (Option) {
    console.log(100000000000000000000);
    this.contId = Option.containerId;
    this.dsid = Option.dsid || null;
    this.tableId = Option.tableId;
    this.showSerialColumn = typeof Option.showSerialColumn !== 'undefined' ? Option.showSerialColumn : true;
    this.showCheckboxColumn = typeof Option.showCheckboxColumn !== 'undefined' ? Option.showCheckboxColumn : true;
    this.showFilterRow = typeof Option.showFilterRow !== 'undefined' ? Option.showFilterRow : true;
    this.scrollHeight = Option.scrollHeight || "inherit";
    this.hiddenFieldName = Option.hiddenFieldName || "id";
    this.columns = Option.columns || null;
    this.dom = Option.dom;
    this.pageLength = Option.pageLength || 100;
    this.hiddenIndex = null;
    this.isSecondTime = false;
    this.Api = null;
    this.order_info = new Object();
    this.order_info.col = '';
    this.order_info.dir = 0;
    this.EbObject = Option.dvObject || null;
    this.ebSettings = null;
    this.login = "dc";
    this.FD = false;
    //Controls & Buttons
    this.table_jQO = null;
    this.eb_filter_controls_4fc = [];
    this.eb_filter_controls_4sb = [];
    this.linkDV = null;
    this.filterFlag = false;
    this.filterValues = Option.filterValues || [];
    this.FlagPresentId = false;
    this.columnSearch = Option.columnSearch || [];
    this.MainData = Option.data || null;
    this.showHeader = typeof Option.showHeader !== 'undefined' ? Option.showHeader : true;
    this.getFilterValues = Option.getFilterValuesFn || function () { };
    this.source = Option.source || "";
    this.IsQuery = Option.IsQuery;

    this.extraCol = [];
    this.modifyDVFlag = false;
    this.initCompleteflag = false;
    this.isTagged = false;
    this.isRun = false;

    this.orderColl = [];
    this.eb_agginfo = [];
    this.Aggregateflag = false;
    this.QueryIndex = Option.QueryIndex || 0;
    this.datetimeformat = Option.datetimeformat;

    this.action = Option.action || null;
    this.Levels = Option.levels || [];
    this.PreviousHTML = Option.previousHTML;
    this.NextHTML = Option.nextHTML;


    this.init = function () {
        if (this.EbObject === null)
            this.EbObject = new EbTableVisualization(this.tableId);
        this.EbObject.IsPaging = Option.IsPaging || false;
        this.$dtLoaderCont = $(`<div id='${this.tableId}dtloadercont' class='dt-loader-cont'></div>`);
        this.$dtLoaderCont.insertBefore($("#" + this.contId));
        if (this.MainData === null)
            this.call2FD();
        else {
            if (this.columns !== null)
                this.EbObject.Columns.$values = this.columns;
            this.getColumnsSuccess();
        }
    };

    this.showLoader = function () {
        this.$dtLoaderCont.EbLoader("hide");
        this.$dtLoaderCont.EbLoader("show", { maskItem: { Id: `#${this.contId}` }, maskLoader: false });
    };

    this.call2FD = function () {
        this.EbObject.DataSourceRefId = this.dsid;
        this.showLoader();
        if (this.columns === null) {
            $.ajax({
                type: "POST",
                url: "../boti/dvView1",
                data: { dvobj: JSON.stringify(this.EbObject) },
                success: this.ajaxSucc.bind(this)
            });
        }
        else {
            this.EbObject.Columns = this.columns;
            this.getColumnsSuccess();
        }
    };

    this.ajaxSucc = function (text) {
        $("#" + this.contId).append(text);////////////////        
        this.EbObject = dvGlobal.Current_obj;
        this.getColumnsSuccess();
    }.bind(this);


    this.getColumnsSuccess = function () {
        this.EbObject.IsPaging = Option.IsPaging || false;
        this.showLoader();
        this.extraCol = [];
        this.ebSettings = this.EbObject;

        this.dvName = this.ebSettings.Name;
        this.initCompleteflag = false;

        this.addSerialAndCheckboxColumns();
        if (this.ebSettings.$type.indexOf("EbTableVisualization") !== -1) {
            this.Init();
        }
        var temp = [];
        $.extend(temp, this.EbObject.Columns.$values);
        temp.sort(this.ColumnsComparer);
        this.sortedColumns = temp;
    };

    this.Init = function () {
        //$.event.props.push('dataTransfer');
        this.updateRenderFunc();
        this.table_jQO = $('#' + this.tableId);

        this.eb_agginfo = this.getAgginfo();

        this.table_jQO.append($(this.getFooterFromSettingsTbl()));

        //this.table_jQO.children("tfoot").hide();

        this.table_jQO.on('processing.dt', function (e, settings, processing) {
            if (processing === true) {
                $("#obj_icons .btn").prop("disabled", true);
                this.showLoader();
            }
            else {
                $("#obj_icons .btn").prop("disabled", false);
                this.$dtLoaderCont.EbLoader("hide");
            }
        }.bind(this));


        this.table_jQO.on('error.dt', function (settings, techNote, message) {
            console.log('An error has been reported by DataTables: ', message);
        });

        this.Api = this.table_jQO.DataTable(this.createTblObject());

        this.Api.off('select').on('select', this.selectCallbackFunc.bind(this));

        this.Api.off('key').on('key', this.DTKeyPressCallback.bind(this));

        this.Api.off('key-focus').on('key-focus', Option.arrowFocusCallback);

        this.Api.off('key-blur').on('key-blur', Option.arrowBlurCallback);

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

        jQuery.fn.dataTable.ext.errMode = 'alert';

        this.table_jQO.off('draw.dt').on('draw.dt', this.doSerial.bind(this));
        //this.table_jQO.off('order.dt').on('order.dt', this.doSerial.bind(this));
        ////this.table_jQO.off('init.dt').on('init.dt', this.doSerial.bind(this));

        //this.table_jQO.on('length.dt', function (e, settings, len) {
        //    console.log('New page length: ' + len);
        //});


        $('#' + this.tableId + ' tbody').off('dblclick').on('dblclick', 'tr', this.dblclickCallbackFunc.bind(this));
        $('#' + this.tableId + ' tbody').off('click').on('click', 'tr', this.rowclick.bind(this));

    };

    this.addSerialAndCheckboxColumns = function () {
        this.CheckforColumnID();//"sWidth":"10px", 
        var serialObj = (JSON.parse('{"sWidth":"10px", "searchable": false, "orderable": false, "bVisible":true, "name":"serial", "title":"#", "Type":11}'));
        if (this.showSerialColumn) {
            this.extraCol.push(serialObj);
            //if (this.source !== "")
            //    serialObj.data = this.ebSettings.Columns.$values.length;
        }
        this.addcheckbox();
    };

    this.CheckforColumnID = function () {
        $.each(this.ebSettings.Columns.$values, function (i, col) {
            if (col.name.toLocaleLowerCase() === this.hiddenFieldName.toLocaleLowerCase()) {
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
        var _array = $.grep(this.ebSettings.Columns.$values, function (obj) { return obj.name.toLocaleLowerCase() === this.hiddenFieldName.toLocaleLowerCase(); }.bind(this));
        if (_array.length > 0)
            this.hiddenIndex = _array[0].data;
    };

    this.createTblObject = function () {
        var url = "";
        if (Option.rendererName === 'Bot')
            url = "../boti/getData";
        else if (this.IsQuery)
            url = "../Eb_Object/getData";
        else if (this.source === "datareader")
            url = "../CE/getDataCollcetion";
        else if (this.source === "powerselect")
            url = "../dv/getData4PowerSelect";
        else
            url = "../dv/getData";
        var o = new Object();
        o.scrollY = this.scrollHeight;
        o.scrollX = "100%";
        o.bAutoWidth = false;
        o.autowidth = false;
        o.serverSide = (this.MainData === null) ? true : false;
        o.processing = true;
        o.language = {
            processing: "<div class='fa fa-spinner fa-pulse fa-3x fa-fw'></div>",
            info: "_START_ - _END_ / _TOTAL_",
            paginate: {
                "previous": this.PreviousHTML || "Prev",
                "next": this.NextHTML || "Next",
            },
            lengthMenu: "_MENU_ / Page",
            infoFiltered: (this.source === "powerselect") ? "(total _MAX_)" : "",
            infoEmpty: "_TOTAL_  / _TOTAL_"
        };
        o.columns = this.extraCol.concat(this.ebSettings.Columns.$values);
        o.order = [];
        o.dom = this.dom || ((this.EbObject.IsPaging ? "ip" : "") + "<'col-md-12 noPadding display_none'>rt");
        o.paging = this.EbObject.IsPaging;
        o.lengthChange = this.EbObject.IsPaging;
        o.pagingType = "simple";
        o.pageLength = this.pageLength;
        //o.fixedColumns = { leftColumns: 1, rightColumns: 1 };
        o.select = true;
        o.keys = true;
        if (this.MainData === null) {
            o.ajax = {
                url: url,
                type: 'POST',
                data: this.ajaxData.bind(this),
                dataSrc: this.receiveAjaxData.bind(this),
            };
        }
        else {
            o.data = this.MainData.formattedData || this.MainData.data || this.MainData;
            this.data = this.MainData.data || this.MainData;
            this.formatteddata = this.MainData.formattedData || this.MainData.data || this.MainData;
        }
        o.fnRowCallback = this.rowCallBackFunc.bind(this);
        o.drawCallback = this.drawCallBackFunc.bind(this);
        o.initComplete = this.initCompleteFunc.bind(this);
        return o;
    };

    this.ajaxData = function (dq) {
        delete dq.columns; delete dq.order; delete dq.search;
        dq.RefId = this.EbObject.DataSourceRefId;
        if (this.showFilterRow)
            this.columnSearch = this.repopulate_filter_arr();
        dq.TFilters = this.columnSearch;
        //if (this.filterValues.length === 0)
        this.filterValues = this.getFilterValues();
        this.AddUserAndLcation();
        dq.Params = this.filterValues || [];
        dq.rowData = this.rowData || "";
        //if (this.orderColl.length > 0)
        //    dq.OrderBy = this.orderColl;
        if (this.order_info.col !== "")
            dq.OrderBy = new order_obj(this.order_info.col, this.order_info.dir);
        if (this.columnSearch.length > 0) {
            this.filterFlag = true;
        }
        dq.Ispaging = this.EbObject.IsPaging;
        if (Option.rendererName === 'Bot') {
            dq.start = 0;
            dq.length = 25;/////////hard coding
        }
        dq.QueryIndex = this.QueryIndex;
        dq.DataVizObjString = JSON.stringify(this.EbObject);
        dq.TableId = this.tableId;
        if (this.source === "powerselect")
            dq = { req: JSON.stringify(dq) };
        return dq;
    };

    this.AddUserAndLcation = function () {
        let temp = $.grep(this.filterValues, function (obj) { return obj.Name === "eb_loc_id"; });
        if (temp.length === 0)
            this.filterValues.push(new fltr_obj(11, "eb_loc_id", store.get("Eb_Loc-" + ebcontext.sid + ebcontext.user.UserId)));

        temp = $.grep(this.filterValues, function (obj) { return obj.Name === "eb_currentuser_id"; });
        if (temp.length === 0)
            this.filterValues.push(new fltr_obj(11, "eb_currentuser_id", ebcontext.user.UserId));
        if (ebcontext.languages != undefined) {
            temp = $.grep(this.filterValues, function (obj) { return obj.Name === "eb_current_language_id"; });
            if (temp.length === 0)
                this.filterValues.push(new fltr_obj(11, "eb_current_language_id", ebcontext.languages.getCurrentLanguage()));

            temp = $.grep(this.filterValues, function (obj) { return obj.Name === "eb_current_locale"; });
            if (temp.length === 0)
                this.filterValues.push(new fltr_obj(16, "eb_current_locale", ebcontext.languages.getCurrentLocale()));
        }
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
        this.MainData = dd;
        this.data = dd.data;
        this.formatteddata = dd.formattedData || dd.data;
        return this.formatteddata;
    };

    this.compareFilterValues = function () {
        var filter = this.getFilterValues();
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
        var type = col.Type || col.type;
        if (col.bVisible && (type === parseInt(gettypefromString("Int32")) || type === parseInt(gettypefromString("Decimal")) || type === parseInt(gettypefromString("Int64")) || type === parseInt(gettypefromString("Double"))) && col.name !== "serial")
            _ls.push(new Agginfo(col.name, this.ebSettings.Columns.$values[i].DecimalPlaces, col.data));
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
                    var type = api.settings().init().aoColumns[i].Type;
                    var Rtype = api.settings().init().aoColumns[i].RenderType;
                    if (Rtype === 3) {
                        val1 = ($(textid).is(':checked')) ? "true" : "false";
                        if ($(textid)[0] && !($(textid).is(':indeterminate')))
                            filter_obj_arr.push(new filter_obj(colum, "=", val1, type));
                    }
                    else {
                        oper = $('#' + table + '_' + colum + '_hdr_sel').text();
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
                                    filter_obj_arr.push(new filter_obj(colum, oper, $(textid).val(), type));
                                }
                            }
                        }
                    }
                }
            });
        }

        if (filter_obj_arr.length === 0)
            return this.columnSearch;

        return filter_obj_arr;
    };

    this.rowCallBackFunc = function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
        this.colorRow(nRow, aData, iDisplayIndex, iDisplayIndexFull);
        $(nRow).attr("data-uid", aData[this.hiddenIndex]);
    };

    this.initCompleteFunc = function (settings, json) {
        this.doSerial();
        this.GenerateButtons();
        if (this.eb_agginfo.length > 0) {
            this.createFooter(0);
        }
        else
            $('#' + this.tableId + '_wrapper .dataTables_scrollFoot').hide();

        if (this.login === "uc") {
            this.initCompleteflag = true;
            //if (this.isSecondTime) { }
            this.ModifyingDVs(dvcontainerObj.currentObj.Name, "initComplete");
        }
        if (this.Api === null)
            this.Api = $("#" + this.tableId).DataTable();
        this.Api.columns.adjust();
        this.$dtLoaderCont.EbLoader("hide");

        if (this.showFilterRow) {
            this.createFilterRowHeader();
            if(this.source === "powerselect")
                $("#" + this.tableId + "_wrapper tr.addedbyeb .input-group-btn").hide();
        }
        this.addFilterEventListeners();
        setTimeout(function () {
            if (Option.fninitComplete)
                Option.fninitComplete();
            if (Option.fninitComplete4SetVal)
                Option.fninitComplete4SetVal();
            if (Option.fns4PSonLoad && Option.fns4PSonLoad.length > 0)
                Option.fns4PSonLoad[0]();
        }, 1);

        if (!this.showHeader) {
            $("#"+this.contId).find(".dataTables_scrollHead").addClass("headhide");
        }
        if (this.data.length > 7 && this.Aggregateflag) {
            $(".containerrow #" + this.tableId + "_wrapper .dataTables_scroll").style("height", "210px", "important");
            $(".containerrow #" + this.tableId + "_wrapper .dataTables_scrollBody").style("height", "140px", "important");
        }
    };

    this.contextMenu = function () {
        $.contextMenu({
            selector: ".tablelink_" + this.tableId,
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
        else {
            this.tabNum++;
            let url = "http://" + this.url + "/DV/dv?refid=" + this.linkDV;

            var _form = document.createElement("form");
            _form.setAttribute("method", "post");
            _form.setAttribute("action", url);
            _form.setAttribute("target", "_blank");

            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = "rowData";
            input.value = this.rowData.toString();
            _form.appendChild(input);

            input = document.createElement('input');
            input.type = 'hidden';
            input.name = "filterValues";
            input.value = JSON.stringify(this.filterValues);
            _form.appendChild(input);

            input = document.createElement('input');
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

    };

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
    };

    this.drawCallBackFunc = function (settings) {
        //if (this.ebSettings.rowGrouping.$values.length > 0)
        if (this.source === "sqljob")
            this.doRowgrouping();
        //this.summarize2();
        //if (this.login === "uc" && !this.modifyDVFlag && this.initCompleteflag) {
        //    //this.ModifyingDVs(dvcontainerObj.currentObj.Name, "draw");
        //}
        //this.filterDisplay();
        if (Option.searchCallBack)
            Option.searchCallBack();
        if (Option.drawCallback)
            Option.drawCallback();
        if (this.Api !== null)
            this.Api.columns.adjust();
    };

    this.selectCallbackFunc = function (e, dt, type, indexes) {
        if (Option.fnKeyUpCallback)
            Option.fnKeyUpCallback(e, dt, type, indexes);
    };

    this.dblclickCallbackFunc = function (e) {
        if (Option.fnDblclickCallback)
            Option.fnDblclickCallback(e);
    };

    this.DTKeyPressCallback = function (e, datatable, key, cell, originalEvent) {
        if (Option.keyPressCallbackFn)
            Option.keyPressCallbackFn(e, datatable, key, cell, originalEvent);
    };

    this.rowclick = function (e, dt, type, indexes) {
        if (Option.rowclick)
            Option.rowclick(e, dt, type, indexes);
    };

    this.doRowgrouping = function () {
        if (this.Api === null)
            this.Api = $("#" + this.tableId).DataTable();
        var rows = this.Api.rows().nodes();
        var count = this.Api.columns()[0].length;
        $.each(this.Levels, function (i, obj) {
            if (obj.insertionType !== "After")
                $(rows).eq(obj.rowIndex).before(obj.html);
            else
                $(rows).eq(obj.rowIndex).after(obj.html);
        });
        var ct = $("#" + this.tableId + " .group[group=1]").length;
        $(`#group-All_${this.tableId} td[colspan=${count}]`).prepend(` Groups (${ct}) - `);

        $("#" + this.tableId + " tbody").off("click", "tr.group").on("click", "tr.group", this.collapseGroup);

    };

    //this.doRowgrouping = function () {
    //    var rows = this.Api.rows({ page: 'current' }).nodes();
    //    var last = null;
    //    var count = this.ebSettings.Columns.$values.length;
    //    this.Api.column(this.Api.columns(this.ebSettings.rowGrouping.$values[0].name + ':name').indexes()[0], { page: 'current' }).data().each(function (group, i) {
    //        if (last !== group) {
    //            $(rows).eq(i).before("<tr class='group'><td colspan=" + count + ">" + group + "</td></tr>");
    //            last = group;
    //        }
    //    });
    //};

    this.doRowgrouping_inner = function (last, rows, group, i) {
        if (last !== group) {
            $(rows).eq(i).before("<tr class='group'><td colspan=" + this.ebSettings.Columns.$values.length + ">" + group + "</td></tr>");
            last = group;
        }
    };

    this.doSerial = function () {
        if (this.showSerialColumn)
            $('#' + this.tableId).DataTable().column(0).nodes().each(function (cell, i) { cell.innerHTML = i + 1; });
        $('#' + this.tableId).DataTable().columns.adjust();
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
        if (pos === 0) {
            if (this.Api !== null) {
                $.each(this.Api.settings().init().aoColumns, function (i, col) {
                    if (col.Aggregate) {
                        $('#' + tid + '_btntotalpage').css("display", "inline");
                        aggFlag = true;
                        return false;
                    }
                });
            }
            else {
                $.each(this.ebSettings.Columns.$values, function (i, col) {
                    if (col.Aggregate) {
                        $('#' + tid + '_btntotalpage').css("display", "inline");
                        aggFlag = true;
                        return false;
                    }
                });
            }
            if (!aggFlag || this.data.length === 0) {
                $('#' + this.tableId + '_wrapper .dataTables_scrollFoot').hide();
            }
        }
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
        var api = $("#" + this.tableId).DataTable();
        //$.each(this.ebSettings.Columns.$values, this.GetAggregateControls_inner.bind(this, ResArray, footer_id, zidx));
        if (this.Api !== null)
            $.each(this.Api.settings().init().aoColumns, this.GetAggregateControls_inner.bind(this, ResArray, footer_id, zidx));
        else
            $.each(api.settings().init().aoColumns, this.GetAggregateControls_inner.bind(this, ResArray, footer_id, zidx));
        return ResArray;
    };

    this.GetAggregateControls_inner = function (ResArray, footer_id, zidx, i, col) {
        var _ls;
        if (col.bVisible) {
            //(col.Type ==parseInt( gettypefromString("Int32")) || col.Type ==parseInt( gettypefromString("Decimal")) || col.type ==parseInt( gettypefromString("Int64")) || col.Type ==parseInt( gettypefromString("Double"))) && col.name !== "serial"
            if (col.Aggregate) {
                this.Aggregateflag = true;
                var footer_select_id = this.tableId + "_" + col.name + "_ftr_sel" + footer_id;
                var fselect_class = this.tableId + "_fselect";
                var data_colum = "data-column=" + col.name;
                var data_table = "data-table=" + this.tableId;
                var footer_txt = this.tableId + "_" + col.name + "_ftr_txt" + footer_id;
                var data_decip = "data-decip=" + col.DecimalPlaces;

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
        var api = null;
        if (this.Api === null)
            api = $("#" + this.tableId).DataTable();
        else
            api = this.Api;
        var tableId = this.tableId;
        var scrollY = this.ebSettings.scrollY;
        var p;
        var ftrtxt;
        $.each(this.eb_agginfo, function (index, agginfo) {
            if (agginfo.colname) {
                p = $('.dataTables_scrollFootInner #' + tableId + '_' + agginfo.colname + '_ftr_sel0').text().trim();
                ftrtxt = '.dataTables_scrollFootInner #' + tableId + '_' + agginfo.colname + '_ftr_txt0';
                var col = api.column(agginfo.colname + ':name');

                var summary_val = 0;
                if (p === '∑')
                    summary_val = col.data().sum();
                if (p === 'x̄') {
                    summary_val = col.data().average();
                }
                $(ftrtxt).val(summary_val.toFixed(agginfo.deci_val));
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
                for (let j = 0; j < this.ebSettings.LeftFixedColumn; j++)
                    $(fc_lh_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4fc[j]));
            }
            if (fc_rh_tbl.length !== 0) {
                fc_rh_tbl.find("thead").append($("<tr role='row' class='addedbyeb'/>"));
                for (let j = this.eb_filter_controls_4fc.length - this.ebSettings.RightFixedColumn; j < this.eb_filter_controls_4fc.length; j++)
                    $(fc_rh_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4fc[j]));
            }
        }

        var sc_h_tbl = $('#' + tableid + '_wrapper .dataTables_scrollHeadInner table');
        if (sc_h_tbl !== null) {
            this.GetFiltersFromSettingsTbl(1);
            sc_h_tbl.find("thead").append($("<tr role='row' class='addedbyeb'/>"));
            if (this.ebSettings.LeftFixedColumn + this.ebSettings.RightFixedColumn > 0) {
                for (let j = 0; j < this.eb_filter_controls_4sb.length; j++) {
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
                for (let j = 0; j < this.eb_filter_controls_4sb.length; j++)
                    $(sc_h_tbl.find("tr[class=addedbyeb]")).append($(this.eb_filter_controls_4sb[j]));
            }
        }

        // $('#' + tableid + '_wrapper table thead tr[class=addedbyeb]').hide();

        //$('thead:eq(0) tr:eq(1) [type=checkbox]').prop('indeterminate', true);
        $(".addedbyeb [type=checkbox]").prop('indeterminate', true);
    };

    this.addFilterEventListeners = function () {
        if (this.Api !== null) {
            $('#' + this.tableId + '_wrapper thead tr:eq(0)').off('click').on('click', 'th', this.orderingEvent.bind(this));
            $.each($(this.Api.columns().header()).parent().siblings().children().toArray(), this.setFilterboxValue.bind(this));
            this.Api.on('key-focus', function (e, datatable, cell) {
                datatable.rows().deselect();
                datatable.row(cell.index().row).select();
            });
        }
        $(".eb_fsel" + this.tableId).off("click").on("click", this.setLiValue.bind(this));
        $(".eb_ftsel" + this.tableId).off("click").on("click", this.fselect_func.bind(this));
        $(".eb_fbool" + this.tableId).off("change").on("change", this.toggleInFilter.bind(this));
        $(".eb_selall" + this.tableId).off("click").on("click", this.clickAlSlct.bind(this));
        $("." + this.tableId + "_select").off("change").on("change", this.updateAlSlct.bind(this));
        $(".eb_canvas" + this.tableId).off("click").on("click", this.renderMainGraph);
        $(".tablelink_" + this.tableId).off("click").on("click", this.link2NewTable.bind(this));
        $("#clearfilterbtn_" + this.tableId).off("click").on("click", this.clearFilter.bind(this));
        //$("#" + this.tableId + "_btntotalpage").off("click").on("click", this.showOrHideAggrControl.bind(this));
        $(".columnMarker_" + this.tableId).off("click").on("click", this.link2NewTable.bind(this));
        $('[data-toggle="tooltip"]').tooltip({
            placement: 'bottom'
        });
        $('.columntooltip').popover({
            container: 'body',
            trigger: 'hover',
            placement: this.PopoverPlacement,
            html: true,
            content: function (e, i) {
                return atob($(this).attr("data-contents"));
            },
        });
        //$('.columntooltip').on('shown.bs.popover', this.openColumnTooltip.bind(this));
        this.filterDisplay();
    };

    this.GenerateButtons = function () {
        this.addFilterEventListeners();
    };

    this.setFilterboxValue = function (i, obj) {
        $(obj).children('div').children('.eb_finput').off("keyup").on("keyup", this.call_filter);
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
        var tempobj = $.grep(this.Api.settings().init().aoColumns, function (obj) { return obj.sTitle === col; });
        var cls = $(e.target).attr('aria-sort') || "descending";
        if (col !== '' && col !== "#") {
            this.order_info.col = tempobj[0].name;
            this.order_info.dir = (cls.indexOf('ascending') > -1) ? 2 : 1;
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
        if (this.Api === null)
            this.Api = $("#" + this.tableId).DataTable();

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
                var type = col.type || col.Type;
                if (type === parseInt(gettypefromString("Int32")) || type === parseInt(gettypefromString("Decimal")) || type === parseInt(gettypefromString("Int64")) || type === parseInt(gettypefromString("Double")) || type === parseInt(gettypefromString("Numeric"))) {

                    _ls += span + this.getFilterForNumeric(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex);
                }
                else if (type === parseInt(gettypefromString("String"))) {

                    _ls += span + this.getFilterForString(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex);
                }
                else if (type === parseInt(gettypefromString("DateTime"))) {

                    _ls += span + this.getFilterForDateTime(header_text1, header_select, data_table, htext_class, data_colum, header_text2, this.zindex);
                }
                else if (type === parseInt(gettypefromString("Boolean")) && col.name !== "checkbox")
                    _ls += span + this.getFilterForBoolean(col.name, this.tableId, this.zindex);
                else
                    _ls += span;
            }

            _ls += "</th>";

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
                $("#" + this.tableId + "_" + colum + "_hdr_txt2").on("keyup", this.call_filter);
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
        if (this.Api.settings().init().serverSide) {
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
        }
        else {
            this.Implementlocalsearch();
        }
    }.bind(this);

    this.Implementlocalsearch = function () {
        if (this.Api !== null) {
            this.Api.columns().every(function (i) {
                var colum = this.Api.settings().init().aoColumns[i].name;
                var textid = '#' + this.tableId + '_' + colum + '_hdr_txt1';
                let val = $(textid).val();
                if (colum !== 'checkbox' && colum !== 'serial' && val !== undefined) {
                    this.Api.column(i).search(val).draw();
                }
            }.bind(this));
        }
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

    this.arrangeFooterWidth = function () {
        var lfoot = $('#' + this.tableId + '_wrapper .DTFC_LeftFootWrapper table');
        var rfoot = $('#' + this.tableId + '_wrapper .DTFC_RightFootWrapper table');
        var scrollfoot = $('#' + this.tableId + '_wrapper .dataTables_scrollFootInner table');

        if (this.ebSettings.LeftFixedColumn > 0 || this.ebSettings.RightFixedColumn > 0) {
            if (this.ebSettings.LeftFixedColumn > 0) {
                for (let j = 0; j < this.ebSettings.LeftFixedColumn; j++) {
                    $(lfoot).children().find("tr").eq(0).children("th").eq(j).css("width", scrollfoot.find("tfoot").children("tr").eq(0).children("th").eq(j).css("width"));
                }
            }

            if (this.ebSettings.RightFixedColumn > 0) {
                var start = scrollfoot.find("tr").eq(0).children().length - this.ebSettings.RightFixedColumn;
                for (let j = 0; (j + start) < scrollfoot.find("tr").eq(0).children().length; j++) {
                    $(rfoot).children().find("tr").eq(0).children("th").eq(j).css("width", scrollfoot.find("tfoot").children("tr").eq(0).children("th").eq(j + start).css("width"));
                }
            }
        }

        $("#" + this.tableId + " thead tr:eq(1) .eb_finput").parent().remove();
    };

    this.renderCheckBoxCol = function (data2, type, row, meta) {
        if (this.FlagPresentId) {
            this.hiddenIndex = $.grep(this.ebSettings.Columns.$values, function (obj) { return obj.name.toLocaleLowerCase() === this.hiddenFieldName.toLocaleLowerCase(); }.bind(this))[0].data;
            //var idpos = getObjByval(this.ebSettings.Columns.$values, "name", this.hiddenFieldName).data;
            this.rowId = meta.row; //do not remove - for updateAlSlct
            return "<input type='checkbox' class='" + this.tableId + "_select' name='" + this.tableId + "_id' value='" + ((row[this.hiddenIndex] !== null) ? row[this.hiddenIndex].toString() : null) + "'/>";
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
        var type = col.Type || col.type;
        if (type === parseInt(gettypefromString("Date")) || type === parseInt(gettypefromString("DateTime"))) {
            if (this.datetimeformat) {
                this.ebSettings.Columns.$values[i].render = this.renderDateformat.bind(this);
                this.ebSettings.Columns.$values[i].mRender = this.renderDateformat.bind(this);
            }
        }
    };

    this.openColumnTooltip = function (e, i) {
        $(e.currentTarget).siblings(".popover").find(".popover-content").empty().append(atob($(e.currentTarget).attr("data-content")));
        $(e.currentTarget).siblings(".popover").find(".arrow").remove();
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

    this.getRowDataByUid = function (Uid) {
        var $tr = $("#" + this.tableId + " tr[data-uid='" + Uid + "']");
        var rowData = this.Api.row($tr).data();
        return rowData;
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

    this.init();
};

