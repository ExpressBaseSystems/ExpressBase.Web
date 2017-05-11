//$.fn.dataTable.Api.register('column().data().sum()', function () {
//    return this.reduce(function (a, b) { return a + b; });
//});

//$.fn.dataTable.Api.register('column().data().average()', function () {
//    var sum = this.reduce(function (a, b) { return a + b; });
//    return sum / this.length;
//});

if (!String.prototype.splice) {
    String.prototype.splice = function (start, delCount, newSubStr) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };
}

Array.prototype.max = function () {
    return Math.max.apply(null, this);
};

Array.prototype.min = function () {
    return Math.min.apply(null, this);
};

var gi = 0;

function filter_obj(colu, oper, valu) {
    this.c = colu;
    this.o = oper;
    this.v = valu;
}

function call_filter(e, objin) {
    if (e.keyCode === 13)
        $('#' + $(objin).attr('data-table') ).DataTable().ajax.reload();
}

function repopulate_filter_arr(table) {
    var tableObj = $("#" + table).DataTable();
    var filter_obj_arr = [];
    $.each(tableObj.columns().header().toArray(), function (i, obj) {
        var colum = $(obj).children(0).text();
        if (colum !== '') {
            var oper;
            var val1, val2;
            var textid = '#' + table + '_' + colum + '_hdr_txt1';
            var type = $(textid).attr('data-coltyp');
            if (type == 'boolean') {
                val1 = ($(textid).is(':checked')) ? "true" : "false";
                if (!($(textid).is(':indeterminate')))
                    filter_obj_arr.push(new filter_obj("INV." + colum, "=", val1));
            }
            else {
                oper = $('#' + table + '_' + colum + '_hdr_sel').text();
                if (tableObj.columns(i).visible()[0]) {
                    if (oper !== '' && $(textid).val() !== '') {
                        if (oper === 'B') {
                            val1 = $(textid).val();
                            val2 = $(textid).siblings('input').val();
                        }

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
                        else
                            filter_obj_arr.push(new filter_obj(colum, oper, $(textid).val()));
                    }
                }
            }
        }
    });

    return filter_obj_arr;
}

function createFilterRowHeader(tableid, eb_filter_controls, scrolly, order_info_ref) {
    setTimeout(function () {
        $('#' + tableid + '_container table thead').append($("<tr role='row' class='addedbyeb'/>"));
        var trs = $('#' + tableid + '_container table thead tr[class=addedbyeb]');
        for(var i=0; i < trs.length; i++)
        {
            for (var j = 0; j < eb_filter_controls.length; j++) {
                $(trs[i]).append($(eb_filter_controls[j]));
            }
        }

        $('#' + tableid + '_container table thead tr[class=addedbyeb]').hide();
        
        $('thead:eq(0) tr:eq(1) [type=checkbox]').prop('indeterminate', true);

        $('#' + tableid + '_container thead').off('click').on('click', 'th', function () {
            var col = $(this).children('span').text();
            var dir = $(this).attr('class');
            alert("Got "+col + ", " + dir);
            if(col !== '') {
                order_info_ref.col = col;
                order_info_ref.dir = (dir === 'sorting') ? 1 : ((dir === 'sorting_asc') ? 2 : 1);
            }
        });
        $('#' + tableid).DataTable().columns.adjust();

    }, 1000);





        //var __tr = $("<tr role='row'>");

        //for (var i = 0; i < eb_filter_controls.length; i++)
        //    __tr.append($(eb_filter_controls[i]));
        //__tr.append("</tr>");
        //var __thead = $('#' + tableid + '_container table:eq(0) thead');
        //__thead.append(__tr);

        //$('#' + tableid + '_container table:eq(0) thead tr:eq(1)').hide();
}

function createFooter(tableid, eb_footer_controls, scrolly, pos) {
    $('#' + tableid + '_btntotalpage').show();
    if (pos === 1)
        $('#' + tableid + '_container tfoot tr:eq(' + pos + ')').hide();
    $('#' + tableid + '_container tfoot tr:eq(' + pos + ') th').each(function (idx) {
        $(this).html(eb_footer_controls[idx]);
    });
}

function showOrHideAggrControl(objbtn, scrolly) {
    var tableid = $(objbtn).attr('data-table');
    if (scrolly !== 0) {
        $('#' + tableid + '_container table:eq(2) tfoot tr:eq(1)').toggle();
    }
    else {
        $('#' + tableid + '_container table:eq(0) tfoot tr:eq(1)').toggle();
    }
}

function showOrHideFilter(objbtn, scrolly) {
    var tableid = $(objbtn).attr('data-table');
    //if ($('#' + tableid + '_container table:eq(0) thead tr:eq(1)').is(':visible'))
    if ($('#' + tableid + '_container table thead tr[class=addedbyeb]').is(':visible'))
        $('#' + tableid + '_container table thead tr[class=addedbyeb]').hide();
        //$('#' + tableid + '_container table:eq(0) thead tr:eq(1)').hide();:not(.Class)
    else {
        $.each($('#' + tableid + '_container table thead tr[class=addedbyeb]'), function (i, obj) {
            if (!$(obj).parent().parent().parent().hasClass("DTFC_LeftBodyLiner"))
                $(obj).show();
        });
        //$('#' + tableid + '_container table:eq(0) thead tr:eq(1)').show();
    }

    clearFilter(tableid);
    $('#' + tableid).DataTable().columns.adjust();
}

function clearFilter(tableid) {
    var flag = false;
    var tableObj = $("#" + tableid).DataTable();
    $('#' + tableid + '_container table:eq(0) .' + tableid + '_htext').each(function (i) 
    {
        if ($(this).hasClass(tableid + '_hchk')) {
            if (!($(this).is(':indeterminate'))) {
                flag = true;
                $(this).prop("indeterminate", true);
            }
        }
        else 
        {
            if ($(this).val() !== '') {
                flag = true;
                $(this).val('');
            }
        }
    });
    if (flag)
        tableObj.ajax.reload();
}

function updateAlSlct( objchk, rowId) {    
    var tableid = $(objchk).attr('data-table');
    var tableObj = $("#" + tableid).DataTable();
    if (objchk.checked) {
        tableObj.rows(rowId).select();
        $('#' + tableid + '_container table:eq(0) thead tr:eq(0) [type=checkbox]').prop("indeterminate", true);
    }
    else {
        tableObj.rows(rowId).deselect();
        $('#' + tableid + '_container table:eq(0) thead tr:eq(0) [type=checkbox]').prop("indeterminate", true);
    }
    var CheckedCount = $('.' + tableid + '_select:checked').length;
    var UncheckedCount = tableObj.rows().count() - CheckedCount;
    if (CheckedCount === tableObj.rows().count()) {
        $('#' + tableid + '_container table:eq(0) thead tr:eq(0) [type=checkbox]').prop("indeterminate", false);
        $('#' + tableid + '_container table:eq(0) thead tr:eq(0) [type=checkbox]').prop('checked', true);
    }
    else if (UncheckedCount === tableObj.rows().count()) {
        $('#' + tableid + '_container table:eq(0) thead tr:eq(0) [type=checkbox]').prop("indeterminate", false);
        $('#' + tableid + '_container table:eq(0) thead tr:eq(0) [type=checkbox]').prop('checked', false);
    }
}

function clickAlSlct(e, objchk) {
    var tableid = $(objchk).attr('data-table'); 
    if (objchk.checked)
        $('#' + tableid + '_container tbody [type=checkbox]:not(:checked)').trigger('click');
    else
        $('#' + tableid + '_container tbody [type=checkbox]:checked').trigger('click');

    e.stopPropagation();
}

function summarize2(api, tableId, eb_agginfo, scrollY) {
    var p;
    var ftrtxt;
    $.each(eb_agginfo, function (index, agginfo) {
        if (scrollY > 0) {
            p = $('table:eq(2) tfoot #' + tableId + '_' + agginfo.colname + '_ftr_sel1').text().trim();
            ftrtxt = '.dataTables_scrollFoot #' + tableId + '_' + agginfo.colname + '_ftr_txt1';
        }
        else {
            p = $('#' + tableId + '_' + agginfo.colname + '_ftr_sel1').text().trim();
            ftrtxt = '#' + tableId + '_' + agginfo.colname + '_ftr_txt1';
        }
        var col = api.column(agginfo.colname + ':name');

        var summary_val = 0;
        if (p === '∑')
            summary_val = col.data().sum();
        if (p === '∓') {
            summary_val = col.data().average();
        }
        // IF decimal places SET, round using toFixed
        $(ftrtxt).val((agginfo.deci_val > 0) ? summary_val.toFixed(agginfo.deci_val) : summary_val.toFixed(2));
    });
}

function fselect_func(tableid, objsel, scrollY) {
    var api = $("#" + tableid).DataTable();
    var selValue = $(objsel).text().trim(); 
    $(objsel).parents('.input-group-btn').find('.dropdown-toggle').html(selValue);
    var table = $(objsel).attr('data-table');
    var colum = $(objsel).attr('data-column');
    var decip = $(objsel).attr('data-decip');
    var col = api.column(colum + ':name');
    var ftrtxt;
    if (scrollY > 0)
        ftrtxt = '.dataTables_scrollFoot #' + table + '_' + colum + '_ftr_txt1';
    else
        ftrtxt = '#' + table + '_' + colum + '_ftr_txt1';
    if (selValue === '∑')
        pageTotal = col.data().sum();
    else if (selValue === '∓')
        pageTotal = col.data().average();
    // IF decimal places SET, round using toFixed
    $(ftrtxt).val((decip > 0) ? pageTotal.toFixed(decip) : pageTotal.toFixed(2));
}

function colorRow(nRow, aData, iDisplayIndex, iDisplayIndexFull, columns) {
    $.each(columns, function (i, value) {
        var rgb = '';
        var fl = '';

        if (value.columnName === 'sys_row_color') {
            rgb = (aData[value.columnIndex]).toString();
            var r = rgb.slice(0, -6);
            r = parseInt(r);
            if (r <= 9)
                fl = '0';
            r = r.toString(16);
            if (fl === '0')
                r = '0' + r;

            var g = rgb.slice(3, -3);
            g = parseInt(g);
            if (g <= 9)
                fl = '0';
            g = g.toString(16);
            if (fl === '0')
                g = '0' + g;
            var b = rgb.slice(6, 9);
            b = parseInt(b);
            if (b <= 9)
                fl = '0';
            b = b.toString(16);
            if (fl === '0')
                b = '0' + b;
            rgb = r + g + b;
            $(nRow).css('background-color', '#' + rgb);
        }

        if (value.columnName === 'sys_cancelled') {
            var tr = aData[value.columnIndex];
            if (tr === true)
                $(nRow).css('color', '#f00');
        }
    });
}

function setLiValue(objli) {
    var selText = $(objli).text();
    var table = $(objli).attr('data-table');
    var colum = $(objli).attr('data-colum');
    $(objli).parents('.input-group-btn').find('.dropdown-toggle').html(selText);
    $(objli).parents('.input-group').find('#' + table + '_' + colum + '_hdr_txt2').eq(0).css('visibility', ((selText.trim() === 'B') ? 'visible' : 'hidden'));
}


function toggleInFilter(objChk)
{
    var table = $(objChk).attr('data-table');
    $("#"+ table).DataTable().ajax.reload();
}

function renderProgressCol(data) {
    return "<div class='progress'><div class='progress-bar' role='progressbar' aria-valuenow='" + data.toString() + "' aria-valuemin='0' aria-valuemax='100' style='width:" + data.toString() + "%'>" + data.toString() + "</div></div>";
}

function renderCheckBoxCol(tableObj, columnIndex, tableid, row, meta) {
    return "<input type='checkbox' class='" + tableid + "_select' name='" + tableid + "_id' value='" + row[columnIndex].toString() + "' data-table='" + tableid + "' onchange='updateAlSlct( this," + meta.row + ");' />";
}

function renderEbVoidCol(data) {
    return (data === true) ? "<i class='fa fa-ban' aria-hidden='true'></i>" : "";
}
//datacolumns, data, meta, colname
function lineGraphDiv(data) {
    if (!data)
        return "";
    else
        //var idpos = (_.find(datacolumns, { 'columnName': colname })).columnIndex;
        //return "<canvas id='can" + meta.row + "' width='120' height='40' data-graph='" + data[idpos] + "'></canvas><script>renderLineGraphs(" + meta.row + ");</script>";
        return "<canvas id='can" + ++gi + "' style='width:120px; height:40px; cursor:pointer;' onclick=' renderMainGraph(this)'  data-graph='" + data + "' data-toggle='modal'   data-target='#graphmodal' ></canvas><script>renderLineGraphs(" + gi + "); $('#can" + gi + "').mousemove(function(e){ GPointPopup(e); });</script>";
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
}

function renderMainGraph(objCan) {
    console.log('0sec');
    setTimeout(function () {
        console.log('2sec');
        var gdata = null;
        gdata = $(objCan).attr("data-graph").toString();
        var gcsv = csv(gdata);
        g = new Dygraph(
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

}

function renderLineGraphs(id) {
    var canvas = document.getElementById('can' + id);
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

}

function renderLockCol(data) {
    return (data === true) ? "<i class='fa fa-lock' aria-hidden='true'></i>" : "";
}

function renderToggleCol(data, isEditable) {
    if (isEditable)
        return (data === true) ? "<input type='checkbox' data-toggle='toggle' data-size='mini'  checked>" : "<input type='checkbox' data-toggle='toggle' data-size='mini'>";
    else
        return (data === true) ? "<i class='fa fa-check' aria-hidden='true'  style='color:green'></i>" : "<i class='fa fa-times' aria-hidden='true' style='color:red'></i>";
}

function GPointPopup(e) {
    //alert(e.pageX);

}

function printSelected(tableid){
    $('#' + tableid + '_container').find('.buttons-print')[1].click();
}

function printAll(tableid) {
    $('#' + tableid + '_container').find('.buttons-print')[0].click();
}

function ExportToPrint(tableid) {
    $('#' + tableid + '_container').find('.buttons-print')[0].click();
}

function CopyToClipboard(tableid) {
    $('#' + tableid + '_container').find('.buttons-copy').click();
}

function ExportToPdf(tableid) {
    $('#' + tableid + '_container').find('.buttons-pdf').click();
}

function ExportToCsv(tableid) {
    $('#' + tableid + '_container').find('.buttons-csv').click();
}

function ExportToExcel(tableid) {
    $('#' + tableid + '_container').find('.buttons-excel').click();
}


function GetFiltersFromSettingsTbl(tvPref4User,tableId) {
    var ResArray = [];
    $.each(tvPref4User, function (i, col) {
        var _ls = "";
        if (col.visible == true)
        {
            var span = "<span hidden>" + col.name + "</span>";

            var htext_class =  tableId + "_htext";

            var data_colum = "data-colum='" + col.name + "'";
            var data_table = "data-table='" + tableId + "'";

            var header_select = tableId+"_"+col.name+"_hdr_sel";
            var header_text1 = tableId+"_"+col.name+"_hdr_txt1";
            var header_text2 = tableId+"_"+col.name+"_hdr_txt2";

            _ls += "<th style='padding: 0px; margin: 0px'>";

            if (col.type === "System.Int32" || col.type === "System.Decimal")
                _ls +=  (span + getFilterForNumeric(header_text1, header_select, data_table, htext_class, data_colum, header_text2));
            else if (col.type === "System.String")
                _ls += (span + getFilterForString(header_text1, header_select, data_table, htext_class, data_colum, header_text2));
            else if (col.type === "System.DateTime")
                _ls += (span + getFilterForDateTime(header_text1, header_select, data_table, htext_class, data_colum, header_text2));
            else if (col.type === "System.Boolean")
                    _ls += (span + getFilterForBoolean(col.name,tableId));
            else
                _ls += (span);

            _ls += ("</th>");
        }
        ResArray.push(_ls);
    });
    return ResArray;
}

function getFilterForNumeric(header_text1, header_select,  data_table, htext_class, data_colum, header_text2)
{
   var coltype = "data-coltyp='numeric'";
   var drptext = "";

drptext = "<div class='input-group'>" +
"<div class='input-group-btn'>" +
    " <button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='"+ header_select +"'> = </button>" +
    " <ul class='dropdown-menu'>" +
    "   <li ><a href ='#' onclick='setLiValue(this);' " + data_table + data_colum + ">=</a></li>" +
      " <li><a href ='#' onclick='setLiValue(this);' " + data_table +   data_colum + "><</a></li>" +
      " <li><a href='#' onclick='setLiValue(this);' " + data_table +  data_colum + ">></a></li>" +
      " <li><a href='#' onclick='setLiValue(this);' " + data_table +  data_colum + "><=</a></li>" +
      " <li><a href='#' onclick='setLiValue(this);' " + data_table +  data_colum + ">>=</a></li>" +
      "<li ><a href='#' onclick='setLiValue(this);' " + data_table +  data_colum + ">B</a></li>" +
    " </ul>" +
" </div>" +
" <input type='number' class='form-control "+ htext_class +"' id='" +header_text1+ "' onkeypress='call_filter(event, this); '" +data_table + data_colum +coltype +  ">" +
" <span class='input-group-btn'></span>" +
" <input type='number' class='form-control " +htext_class+ "' id='"+ header_text2 +"' style='visibility: hidden' onkeypress='call_filter(event, this);' " +data_table+  data_colum + coltype + ">" +
" </div> ";
        return drptext;
}

function getFilterForDateTime( header_text1,  header_select, data_table, htext_class, data_colum, header_text2)
{
var coltype = "data-coltyp='date'";
var filter = "<div class='input-group'>" +
"<div class='input-group-btn'>" +
   " <button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='" + header_select + "'> = </button>" +
    "<ul class='dropdown-menu'>" +
     " <li ><a href ='#' onclick='setLiValue(this);' " + data_table + data_colum + ">=</a></li>" +
     " <li><a href ='#' onclick='setLiValue(this);' " + data_table + data_colum + "><</a></li>" +
     " <li><a href='#' onclick='setLiValue(this);' " + data_table + data_colum + ">></a></li>" +
     " <li><a href='#' onclick='setLiValue(this);' " + data_table + data_colum + "><=</a></li>" +
     " <li><a href='#' onclick='setLiValue(this);' " + data_table + data_colum + ">>=</a></li>" +
     " <li ><a href='#' onclick='setLiValue(this);' " + data_table + data_colum + ">B</a></li>" +
   " </ul>" +
" </div>" +
" <input type='date' class='form-control " + htext_class + "' id='" + header_text1 + "' onkeypress='call_filter(event, this);' " + data_table + data_colum + coltype + ">" +
" <span class='input-group-btn'></span>" +
" <input type='date' class='form-control " + htext_class + "' id='" + header_text2 + "' style='visibility: hidden' onkeypress='call_filter(event, this);' " + data_table + data_colum + coltype + ">" +
" </div> ";
        return filter;
}

function getFilterForString(header_text1, header_select, data_table, htext_class, data_colum, header_text2)
{
var drptext = "";
drptext = "<div class='input-group'>"+
"<div class='input-group-btn'>"+
   " <button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' id='"+ header_select +"'>x*</button>"+
   " <ul class='dropdown-menu'>"+
   "   <li ><a href ='#' onclick='setLiValue(this);' "+ data_table + data_colum +">x*</a></li>"+
    "  <li><a href ='#' onclick='setLiValue(this);' "+ data_table + data_colum +">*x</a></li>"+
    "  <li><a href='#' onclick='setLiValue(this);' "+ data_table + data_colum +">*x*</a></li>"+
     " <li><a href='#' onclick='setLiValue(this);' "+ data_table + data_colum +">=</a></li>"+
   " </ul>"+
" </div>"+
" <input type='text' class='form-control "+ htext_class +"' id='"+ header_text1 +"' onkeypress='call_filter(event, this);' "+ data_table + data_colum +">"+
" </div> " ;
        return drptext;
}

function getFilterForBoolean(colum, tableId)
{
var filter = "";
var id = tableId+"_"+ colum + "_hdr_txt1";
var cls = tableId + "_hchk";
filter = "<input type='checkbox' id='"+ id +"' data-colum='"+ colum +"' onchange='toggleInFilter(this);' data-coltyp='boolean' data-table='"+ tableId +"' class='"+ cls + tableId +"_htext'>";
return filter;
}

function getFooterFromSettingsTbl(tvPref4User)
{
    var ftr_part = "";
    $.each(tvPref4User, function (i, col) {
        if (col.visible)
            ftr_part += "<th style=\"padding: 0px; margin: 0px\"></th>";
        else
            ftr_part += "<th style=\"display:none;\"></th>";
    });
    return "<tfoot>" + ftr_part + "<tr>" + ftr_part + "</tr></tfoot>";
}

function Agginfo(col) {
    this.colname = col;
}

function getAgginfo(tvPref4User)
{
    var _ls = [];
    $.each(tvPref4User, function (i, col) {
        if (col.visible && (col.type === "System.Int32" || col.type === "System.Decimal"))
            _ls.push(new Agginfo(col.name));
    });

    return _ls;
}

function GetAggregateControls(tvPref4User, tableId, footer_id, ScrollY, api)
{
    var ResArray = [];
    var _ls;
    $.each(tvPref4User, function (i, col) {
        if (col.visible) {
            if (col.type === "System.Int32" || col.type === "System.Decimal") {
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
                "  <li><a href ='#' onclick=\"fselect_func( '" + tableId + "', this, " + ScrollY + ");\" data-sum='Sum' " + data_table + " " + data_colum + " " + data_decip + ">&sum;</a></li>" +
                "  <li><a href ='#' onclick=\"fselect_func('" + tableId + "', this, " + ScrollY + ");\"" + data_table + " " + data_colum + " " + data_decip + " {4}>&mnplus;</a></li>" +
               " </ul>" +
               " </div>" +
               " <input type='text' class='form-control' id='" + footer_txt + "' disabled style='text-align: right;'>" +
               " </div>";
            }
            else
                _ls = "&nbsp;";

            ResArray.push(_ls);
        }
    });
    return ResArray;
}

var coldef = function ( d, t, v, w, n, ty, cls) {
    this.data = d;
    this.title = t;
    this.visible = v;
    this.width = w;
    this.name = n;
    this.type = ty;
    this.className = cls;
};

function getData4SettingsTbl(tvPref4User)
{
    var colarr = [];
    var n, d, t, v, w, ty,cls;
    $.each(tvPref4User, function (i, col) {
        if (col.name !== "serial" && col.name !== "id") {
            n = col.name;
            d = col.data;
            t = col.title.substr(0, col.title.indexOf('<'));
            v = (col.visible).toString().toLowerCase();
            w = col.width.toString();
            if (col.type) ty = col.type.toString();
            cls = col.className;
            if (cls == undefined)
                cls = "";
            colarr.push(new coldef(d, t, v, w, n, ty, cls));
        }
    });
    return colarr;
}

function getIndex(ds_columns, col_name)
{
    var colindex = -1;
    $.each(ds_columns, function (i, col) {
        if (col.ColumnName.trim() === col_name.trim()) {
            colindex = col.ColumnIndex;
            return false;
        }
    });

    return colindex;
}

function GetSettingsModal(tableid, tvId, tvName) {
    var OuterModalDiv = $(document.createElement("div")).attr("id", "settingsmodal").attr("class", "modal fade");
    var ModalSizeDiv = $(document.createElement("div")).attr("class", "modal-dialog modal-lg");
    var ModalContentDiv = $(document.createElement("div")).attr("class", "modal-content");
    var ModalHeaderDiv = $(document.createElement("div")).attr("class", "modal-header");
    var headerButton = $(document.createElement("button")).attr("class", "close").attr("data-dismiss", 'modal').text("x");
    var title = $(document.createElement('h4')).attr("class", "modal-title").text(tvName+": SettingsTable");
    var ModalBodyDiv = $(document.createElement("div")).attr("class", "modal-body");
    var ModalBodyUl = $(document.createElement("ul")).attr("class", "nav nav-tabs");
    var ModalBodyliCol = $(document.createElement("li")).attr("class", "nav-item");
    var ModalBodyAnchorCol = $(document.createElement("a")).attr("class", "nav-link").attr("data-toggle", "tab").attr("href", "#2a").text("Columns");
    var ModalBodyliGen = $(document.createElement("li")).attr("class", "nav-item");
    var ModalBodyAnchorGen = $(document.createElement("a")).attr("class", "nav-link").attr("data-toggle", "tab").attr("href", "#1a").text("General");
    var ModalBodyTabDiv = $(document.createElement("div")).attr("class", "tab-content");
    var ModalBodyTabPaneColDiv = $(document.createElement("div")).attr("class", "tab-pane").attr("id", "2a");
    var ModalBodyColSettingsTable = $(document.createElement("table")).attr("class", "table table-striped table-bordered").attr("id", "Table_Settings");
    var ModalBodyTabPaneGenDiv = $(document.createElement("div")).attr("class", "tab-pane").attr("id", "1a");
    var ModalFooterDiv = $(document.createElement("div")).attr("class", "modal-footer");
    var FooterButton = $(document.createElement("button")).attr("class", "btn btn-primary").attr("id", 'Save_btn').text("Save Changes");

    ModalFooterDiv.append(FooterButton);
    ModalBodyTabPaneGenDiv.append("<input type='checkbox' id='serial_check'>Hide Serial<br><input type='checkbox' id='select_check'>Hide Checkbox");
    ModalBodyTabPaneGenDiv.append("<br>Page Length:<input type='numeric' id='pageLength_text' value='100'><br>Table Height:<input type='numeric' id='scrollY_text' value='300'>");
    ModalBodyTabPaneGenDiv.append("<br>Row Grouping<input type='numeric' id='rowGrouping_text'>");
    ModalBodyTabPaneGenDiv.append("<br>Left Fixed Columns<input type='numeric' id='leftFixedColumns_text' value='0'>");
    ModalBodyTabPaneGenDiv.append("<br>Right Fixed Columns<input type='numeric' id='rightFixedColumns_text' value='0'>");
    ModalBodyTabPaneColDiv.append(ModalBodyColSettingsTable);
    ModalBodyTabDiv.append(ModalBodyTabPaneGenDiv);
    ModalBodyTabDiv.append(ModalBodyTabPaneColDiv);
    ModalBodyliGen.append(ModalBodyAnchorGen);
    ModalBodyliCol.append(ModalBodyAnchorCol);
    ModalBodyUl.append(ModalBodyliGen);
    ModalBodyUl.append(ModalBodyliCol);
    ModalBodyDiv.append(ModalBodyUl);
    ModalBodyDiv.append(ModalBodyTabDiv);
    ModalHeaderDiv.append(headerButton);
    ModalHeaderDiv.append(title);
    ModalContentDiv.append(ModalHeaderDiv);
    ModalContentDiv.append(ModalBodyDiv);
    ModalContentDiv.append(ModalFooterDiv);
    ModalSizeDiv.append(ModalContentDiv);
    OuterModalDiv.append(ModalSizeDiv);

    $(OuterModalDiv).on('shown.bs.modal', callPost4SettingsTable);
    $(OuterModalDiv).modal('show');

    $(OuterModalDiv).on('hidden.bs.modal', function () {
        $('#Table_Settings').DataTable().destroy();
        $(OuterModalDiv).remove();
    });

    $(FooterButton).click(function () {
        var ct = 0; var objcols = [];
        var api = $('#Table_Settings').DataTable();
        var n, d, t, v, w, ty, cls;
        $.each(api.$('input[name!=font],div[class=font-select]'), function (i, obj) {
            ct++;
            if (obj.type == 'text' && obj.name == 'name')
                n = obj.value;
            else if (obj.type == 'text' && obj.name == 'index')
                d = obj.value;
            else if (obj.type == 'text' && obj.name == 'title')
                t = obj.value + '<span hidden>' + n + '</span>';
            else if (obj.type == 'checkbox')
                v = obj.checked;
            else if (obj.type == 'text' && obj.name == 'width')
                w = obj.value;
            else if (obj.type == 'text' && obj.name == 'type')
                ty = obj.value;
            else if (obj.className == 'font-select') {
                if (!($(this).children('a').children('span').attr('style') == undefined)) {
                    var style = document.createElement('style');
                    style.type = 'text/css';
                    var fontName = $(this).children('a').children('span').css('font-family');
                    var replacedName = fontName.replace(/ /g, "_");
                    style.innerHTML = '.font_' + replacedName + ' {font-family: ' + fontName + '; }';
                    document.getElementsByTagName('head')[0].appendChild(style);
                    cls = 'font_' + replacedName;
                }
                else
                    cls = '';
            }
            if (ct === api.columns().count()) { ct = 0; objcols.push(new coldef(d, t, v, w, n, ty, cls)); n = ''; d = ''; t = ''; v = ''; w = ''; ty = ''; cls = ''; }
        });
        var objconf = new Object();
        objconf.hideSerial = $("#serial_check").prop("checked");
        objconf.hideCheckbox = $("#select_check").prop("checked");
        objconf.lengthMenu = GetLengthOption($("#pageLength_text").val());
        objconf.scrollY = $("#scrollY_text").val();
        objconf.rowGrouping = $("#rowGrouping_text").val();
        objconf.leftFixedColumns = $("#leftFixedColumns_text").val();
        objconf.rightFixedColumns = $("#rightFixedColumns_text").val();
        objconf.columns = objcols;
        if (objconf.rowGrouping.length > 0)
        {
            var groupcols = $.grep(objconf.columns, function (e) { return e.name === objconf.rowGrouping });
            groupcols[0].visible = false;
        }
        $.post('TVPref4User', { tvid: '0', json: JSON.stringify(objconf) });
        $(OuterModalDiv).modal('hide');
        $('#' + tableid).DataTable().destroy();
        $('#'+tableid+'_divcont').children()[1].remove();
        var table = $(document.createElement('table')).addClass('table table-striped table-bordered').attr('id', tableid);
        $('#' + tableid + '_divcont').append(table);
        eval("initTable_@tableId(@objarr);".replace("@tableId", tableid).replace("@objarr", JSON.stringify(objconf)));
    });
}

function callPost4SettingsTable() {
    $.post('GetTVPref4User', { tvid: '0' },
        function (data2) {
            var data2Obj = JSON.parse(data2);
            $("#serial_check").prop("checked", data2Obj.hideSerial);
            $("#select_check").prop("checked", data2Obj.hideCheckbox);
            $("#pageLength_text").val(data2Obj.lengthMenu[0][0]);
            $("#scrollY_text").val(data2Obj.scrollY);
            $("#rowGrouping_text").val(data2Obj.rowGrouping);
            $("#leftFixedColumns_text").val(data2Obj.leftFixedColumns);
            $("#rightFixedColumns_text").val(data2Obj.rightFixedColumns);
            var settings_tbl = $('#Table_Settings').DataTable(
            {
                columns: column4SettingsTbl(),
                data: getData4SettingsTbl(data2Obj.columns),
                paging: false,
                ordering: false,
                searching: false,
                info: false,
                scrollY: '300',
                //select:true,
                initComplete: function (settings, json) {
                    $('.font').fontselect();
                    this.api().columns.adjust();
                },
            });
            $('#Table_Settings tbody').on('click', 'tr', function () {
                var idx = settings_tbl.row(this).index();
                alert(settings_tbl.row(idx).data().name.toString());
                alert('data2Obj.columnsext:' + JSON.stringify(data2Obj.columnsext));
            });
        });
}

function GetLengthOption(len)
{
    var ia=[];
    for (var i = 0; i < 10; i++)
        ia[i] = (len * (i + 1));
    return JSON.parse("[ [{0},-1], [{0},\"All\"] ]".replace(/\{0\}/g, ia.join(',')));
}

var coldef4Setting = function (d, t, cls, rnd, wid) {
    this.data = d;
    this.title = t;
    this.className = cls;
    this.render = rnd;
    this.width = wid;
};
function column4SettingsTbl()
{
    var colArr = [];
    colArr.push(new coldef4Setting('data', 'Column Index', 'hideme', function (data, type, row, meta) { return (data !== "") ? "<input type='text' value=" + data + " name='index'>" : data; }));
    colArr.push(new coldef4Setting('name', 'Name', '', function (data, type, row, meta) { return (data !== "") ? "<input type='text' value=" + data + " name='name' style='border: 0;width: 100px;' readonly>" : data; }, ""));
    colArr.push(new coldef4Setting('type', ' Column Type', 'hideme', function (data, type, row, meta) { return (data !== "") ? "<input type='text' value=" + data + " name='type'>" : data; }));
    colArr.push(new coldef4Setting('title', 'Title', "", function (data, type, row, meta) { return (data !== "") ? "<input type='text' value=" + data + " name='title' style='width: 100px;'>" : data; }, ""));
    colArr.push(new coldef4Setting('visible', 'Visible?', "", function (data, type, row, meta) { return (data == 'true') ? "<input type='checkbox'  name='visibile' checked>" : "<input type='checkbox'  name='visibile'>"; }, ""));
    colArr.push(new coldef4Setting('width', 'Width', "", function (data, type, row, meta) { return (data !== "") ? "<input type='text' value=" + data + " name='width' style='width: 40px;'>" : data; }, ""));
    colArr.push(new coldef4Setting('className', 'Font', "", function (data, type, row, meta)
    {
        if (data.length > 0 && data !== undefined) {
            var fontName = data.substring(5).replace(/_/g, " ");
            return "<input type='text' value='" + fontName + "' class='font' style='width: 100px;' name='font'>";
    }
    else 
        return "<input type='text' class='font' style='width: 100px;' name='font'>";
    }
        , "30"));
    return colArr;
}

function AddSerialAndOrCheckBoxColumns(tx, tableId, data_cols)
{
    if (!tx.hideCheckbox) {
        var chkObj = new Object();
        chkObj.data = null;
        chkObj.title = "<input id='{0}_select-all' type='checkbox' onclick='clickAlSlct(event, this);' data-table='{0}'/>".replace("{0}", tableid);
        chkObj.width = 10;
        chkObj.orderable = false;
        chkObj.visible = true;
        var idpos = $.grep(data_cols, function (e) { return e.ColumnName === "id"; })[0].ColumnIndex; 
        chkObj.render = function( data2, type, row, meta ) { return renderCheckBoxCol($('#' + tableId).DataTable(), idpos, tableId, row, meta); };
        tx.columns.unshift(chkObj);
    }

    if (!tx.hideSerial)
        tx.columns.unshift(JSON.parse('{"width":10, "searchable": false, "orderable": false, "visible":true, "name":"serial", "title":"Serial"}'));
}

function doRowgrouping(api,tx) {
    var rows = api.rows({ page: 'current' }).nodes();
    var last = null;
    
    api.column(api.columns(tx.rowGrouping + ':name').indexes()[0], { page: 'current' }).data().each(function (group, i) {
        if (last !== group) {
            $(rows).eq(i).before(
                '<tr class=\'group\'><td colspan=\'15\'>' + group + '</td></tr>'
            );

            last = group;
        }
    });
}
