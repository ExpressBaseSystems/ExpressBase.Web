//$.fn.dataTable.Api.register('column().data().sum()', function () {
//    return this.reduce(function (a, b) { return a + b; });
//});

//$.fn.dataTable.Api.register('column().data().average()', function () {
//    var sum = this.reduce(function (a, b) { return a + b; });
//    return sum / this.length;
//});

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
        $('#' + $(objin).attr('data-table') + '_tbl').DataTable().ajax.reload();
}

function repopulate_filter_arr(table) {
    var filter_obj_arr = [];
    $.each($('#' + table + '_tbl').DataTable().columns().header().toArray(), function (i, obj) {
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
                if ($('#' + table + '_tbl').DataTable().columns(i).visible()[0]) {
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

function createFilterRowHeader(tableid, eb_filter_controls, scrolly) {
    var __tr = $("<tr role='row'>");

    for (var i = 0; i < eb_filter_controls.length; i++)
        __tr.append($(eb_filter_controls[i]));
    __tr.append("</tr>");
    var __thead = $('#' + tableid + '_container table:eq(0) thead');
    __thead.append(__tr);

    $('#' + tableid + '_container table:eq(0) thead tr:eq(1)').hide();
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
    if ($('#' + tableid + '_container table:eq(0) thead tr:eq(1)').is(':visible'))
        $('#' + tableid + '_container table:eq(0) thead tr:eq(1)').hide();
    else
        $('#' + tableid + '_container table:eq(0) thead tr:eq(1)').show();

    clearFilter(tableid);
    $('#' + tableid + '_tbl').DataTable().columns.adjust();
}

function clearFilter(tableid) {
    flag = false;
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
        $('#' + tableid + '_tbl').DataTable().ajax.reload();
}

function updateAlSlct(objchk, rowId) {
    
    var tableid = $(objchk).attr('data-table'); 
    if (objchk.checked) {
        $('#' + tableid + '_tbl').DataTable().rows(rowId).select();
        $('#' + tableid + '_container table:eq(0) thead tr:eq(0) [type=checkbox]').prop("indeterminate", true);
    }
    else {
        $('#' + tableid + '_tbl').DataTable().rows(rowId).deselect();
        $('#' + tableid + '_container table:eq(0) thead tr:eq(0) [type=checkbox]').prop("indeterminate", true);
    }
    var CheckedCount = $('.' + tableid + '_select:checked').length;
    var UncheckedCount = $('#' + tableid + '_tbl').DataTable().rows().count() - CheckedCount;
    if (CheckedCount === $('#' + tableid + '_tbl').DataTable().rows().count()) {
        $('#' + tableid + '_container table:eq(0) thead tr:eq(0) [type=checkbox]').prop("indeterminate", false);
        $('#' + tableid + '_container table:eq(0) thead tr:eq(0) [type=checkbox]').prop('checked', true);
    }
    else if (UncheckedCount === $('#' + tableid + '_tbl').DataTable().rows().count()) {
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

function summarize2(tableId, eb_agginfo, scrollY) {
    var api = $('#' + tableId + '_tbl').DataTable();
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

function fselect_func(objsel, scrollY) {
    var selValue = $(objsel).text().trim();
    $(objsel).parents('.input-group-btn').find('.dropdown-toggle').html(selValue);
    var table = $(objsel).attr('data-table');
    var colum = $(objsel).attr('data-column');
    var decip = $(objsel).attr('data-decip');
    var api = $('#' + table + '_tbl').DataTable();
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


function toggleInFilter(objchk)
{
    $('#' + $(objchk).attr('data-table') + '_tbl').DataTable().ajax.reload();
}

function renderProgressCol(data) {
    return "<div class='progress'><div class='progress-bar' role='progressbar' aria-valuenow='" + data.toString() + "' aria-valuemin='0' aria-valuemax='100' style='width:" + data.toString() + "%'>" + data.toString() + "</div></div>";
}

function renderCheckBoxCol(datacolumns, tableid, row,meta) {
    var idpos = (_.find(datacolumns, { 'columnName': 'id' })).columnIndex;
    return "<input type='checkbox' class='" + tableid + "_select' name='" + tableid + "_id' value='" + row[idpos].toString() + "' data-table='" + tableid + "' onchange='updateAlSlct(this," + meta.row + ");' />";
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
        gdata = $(objCan).attr("data-graph").toString(); alert(gdata);
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




