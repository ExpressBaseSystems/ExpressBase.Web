let Eb_DBExplorer = function (options) {
    this.editor = {};
    this.TCobj = options.TCobj;
    var tab = 0;
    var res = 1;
    var drag = 0;
    var quer = 0;
    var t_ounter = 0;
    var drawP_count = 0;
    var drawF_count = 0;
    var drawP = new Object();
    var drawF = new Object();
    //$("#TabAdderMain li.active a").attr("href")

    this.create_tree = function (e) {
        let $e = $(e.target);
        $e.children('div').toggle();
        $e.filter('.parent').toggleClass('expanded');
        return false;
    };

    this.ajax_call = function (e) {
        e.preventDefault();
        $(".show_loader").EbLoader("show");
        var exe_window = $("#TabAdderMain li.active").attr("id");
        exe_window = exe_window[exe_window.length - 1];
        var data = this.editor[exe_window].getValue();        
        $.ajax({
            type: "POST",
            url: "../DbClient/ExecuteQuery",
            content: "application/json; charset=utf-8",
            dataType: "json",
            data: { Query: data },
            traditional: true,
            success: function (result) {
                if (result[0].columnCollection != null) {
                    this.query_result(result);
                    $('#t' + (res - 1) + ' a').trigger('click');
                } else if (result[0].message != "") {
                    alert(result[0].message);
                } else if (result[0].Result === 0) {
                    alert('Oh Yes success :(  : ' + result);
                }
                $(".show_loader").EbLoader("hide");
            }.bind(this),
            error: function (result) {
                alert('Oh no :(  : ' + "result");
                $(".show_loader").EbLoader("hide");
            }
        });

    }.bind(this);

    this.query_result = function (result) {

        var exe_window = $("#TabAdderMain li.active a").attr("href");
        exe_window = exe_window[exe_window.length - 1];
        for (var Result_ in result) {
            $.each(result[Result_].columnCollection, function (i, columns) {
                $(`#Result_Tab${exe_window}`).append(' <li id="t' + res + '"><a data-toggle="tab" class="cetab" href="#tab' + tab + 'R' + res + '" style="margin: 18px 0px 0px 0px; padding :0%">Result ' + res + ' <button class="btn" id="Result_' + res + '" data-toggle="modal" data-target="#myModal' + res + '"><i class="fa fa-expand"></i></button><i class="fa fa-window-close fa-1x Result_close" style="padding: 4px; " id="Resultclose"></i></a></li>')
                $("#resulttab" + exe_window).append("<div id='tab" + tab + "R" + res + "' class='Result_Cont tab-pane fade'><table id='tableid" + res + "'></table></div>")
                $("#resulttab" + exe_window).append(`<!-- Modal -->
                                                    <div class="modal fade" id="myModal${res}" role="dialog">
                                                        <div class="modal-dialog-lg">
    
                                                        <!-- Modal content-->
                                                            <div class="modal-content">
                                                                <div class="modal-header">
                                                                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                                                                    <h4 class="modal-title">Result ${res}</h4>
                                                                </div>
                                                                <div class="modal-body">
                                                                    <div id='tab${tab}"RM"${res}' class='Result_Cont_modal'><table id='tableidM${res}'></table></div>
                                                                </div>
                                                                <div class="modal-footer">
                                                                  <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                                                                </div>
                                                            </div>
                                                      </div>`)
                this.drawdatatable("tableid" + res, columns, result[Result_].rowCollection[i]);
                this.drawdatatable("tableidM" + res, columns, result[Result_].rowCollection[i]);
                res++;
            }.bind(this));
            $(`body`).off("click").on("click", ".Result_close", this.Result_Closer.bind(this));
            //$('#Result_1').click(this.Modal_append.bind(this));
        }

    }.bind(this);


    this.drawdatatable = function (tableid, columns, result) {
        var o = new Object();
        o.tableId = tableid;
        o.datetimeformat = true;
        //o.showFilterRow = false;
        o.showSerialColumn = false
        o.showCheckboxColumn = false;
        //o.source = "inline";
        //o.scrollHeight = "200px";
        o.columns = columns;
        o.data = result;
        this.datatable = new EbBasicDataTable(o);
    }.bind(this);

    this.Modal_append = function () {
        var exe_window = $("#TabAdderMain li.active a").attr("href");
        exe_window = exe_window[exe_window.length - 1];
        var res_window = $("#Result_Tab" + exe_window + " li.active a").attr("href");
        res_window = res_window[res_window.length - 1];
        $("body").prepend(`<button type="button" id ="tt1" class="btn" data-toggle="modal" data-target="#myModal"></button>
                                                    <!-- Modal -->
                                                    <div class="modal fade" id="myModal" role="dialog">
                                                        <div class="modal-dialog">
    
                                                        <!-- Modal content-->
                                                            <div class="modal-content">
                                                                <div class="modal-header">
                                                                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                                                                    <h4 class="modal-title">Modal Header</h4>
                                                                </div>
                                                                <div class="modal-body">
                                                                    <p>Some text in the modal.</p>
                                                                </div>
                                                                <div class="modal-footer">
                                                                  <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                                                                </div>
                                                            </div>
                                                      </div>`)
        $('#tt' + res_window).trigger('click');
    };

    this.ajax_reply = function (e) {
        var SqlEval = function () {
            this.refresh = function (e) {
                $.ajax({
                    url: '/Connect/SqlQuery',
                    type: 'GET',
                    success: function (response) {
                        this.CreateHtml(response);
                    }.bind(this)
                })
            }.bind(this);

            this.CreateHtml = function (resp) {
                var html = [];
                html.push(`<table id="records_table" style="width:100%" padding: 20px> <thead> <th>Query</th> <th>Explain</th> <th>Rowno</th> </thead> <tbody>`);

                html.push(`<tr>
                <td>${resp.qstring}</td>
                <td>${this.getFromArray(resp.explain)}</td>
                <td>${resp.rowno}</td>
                <tr>`);
                $('#item').append(html.join());
            };

            this.getFromArray = function (ar) {
                let h = new Array();
                for (i = 0; i < ar.length; i++) {
                    h.push(`<div class="expl_byline" style="width:100%;">${ar[i]}</div>`)
                }
                return h.join("");
            }

            this.start = function () {
                $("#explaine_btn").off("click").on("click", this.refresh.bind(this));
            };

            this.start();
        }.bind(this)

    }

    this.onDrop = function (evt, ui) {
        var exe_window = $("#maintab .active .ui-droppable").attr("id");
        exe_window = exe_window[exe_window.length - 1];
        let $source = $(ui.draggable);
        let tableName = $source.parent().attr("table-name");
        if (tableName) {
            let posLeft = event.pageX;//- $("#pannel").position().left;
            let posTop = event.pageY;// - $("#pannel").position().top;
            //let tid = `${tableName}_table${t_ounter++}`;
            let tid = `drop_table${t_ounter++}`;
            let $tableBoxHtml = $(`<div is-draggable="false" class="table-box ui-widget-content" id="${tid}" ">
                                        <div class="t_drophead"><div class="tname">${tableName}</div> <i class="fa fa-window-close-o draggeer pull-right" onClick="$(${tid}).remove();"></i></div>
                                        <div class="t_dropbdy">${this.getCols(this.TCobj.TableCollection[tableName].Columns, tid, tableName)}</div>
                                </div>`);
            $('#droppable' + exe_window).append($tableBoxHtml);
            $(`#${tid}`).css("left", posLeft + "px");
            $(`#${tid}`).css("top", posTop + "px");
            if ($(`#${tid}`).attr("is-draggable") == "false") {// if called first time
                options["handle"] = $('.t_drophead', $(`#${tid}`));
                $(`#${tid}`).draggable(options);
                $(`#${tid}`).attr("is-draggable", "true");

            }
            //this.draw();
            tid++;
        }
        $(".table-box").on("click", this.draw());
        $(".table-box").resizable();
    }.bind(this);

    this.draw = function () {
        $(".leader-line").remove();
        for (var key in drawF) {
            for (var PKey in drawP) {
                if (drawF[key].From === drawP[PKey].tableName) {
                    new LeaderLine(document.getElementById(drawP[PKey].From), document.getElementById(drawF[key].To), { size: 3, dash: { animation: true } }).setOptions({ startSocket: 'auto', endSocket: 'auto' });
                    //this.activemouse.bind(this);
                }

            }
        }
    }.bind(this);

    this.getCols = function (cols, tid, tableName) {
        let html = [];
        $.each(cols, function (key, column) {
            if (column['ColumnKey'] === "Primary key") {
                html.push(`<div class="t_colsitem">${column['ColumnName']}:${column['ColumnType']} <i class="fa fa-key gold" aria-hidden="true"></i></div>`);
                drawP[drawP_count++] = { "tableName": tableName, "key": "Primary key", "From": tid };
            }
            else if (column['ColumnKey'] === "Foreign key") {
                html.push(`<div class="t_colsitem">${column['ColumnName']}:${column['ColumnType']} <i class="fa fa-key fkey" aria-hidden="true"></i></div>`);
                var from = column['ColumnTable'].substring(0, column['ColumnTable'].lastIndexOf("("));
                drawF[drawF_count++] = { "tableName": tableName, "key": "Foreign key", "To": tid, "From": from };
            }
            else {
                html.push(`<div class="t_colsitem">${column['ColumnName']}:${column['ColumnType']} </div>`);
            }
        }.bind(this))
        return html.join("");
    };

    window.onload = function () {

    };

    this.Tab_Closer = function () {
        let $e = $(event.target).closest("li").children("a").attr("href");
        $($e).remove();
        $(event.target).closest("li").remove();
        //$(event.target).closest("resultset").remove();
        //$(event.target).closest("a").removeAttr($id);
    }.bind(this);

    this.Result_Closer = function () {
        let $e = $(event.target).closest("li").children("a").attr("href");
        $($e).remove();
        $(event.target).closest("li").remove();
        //$(event.target).closest("resultset").remove();
        //$(event.target).closest("a").removeAttr($id);
    }.bind(this);


    this.codemirrorloader = function () {
        let $TabHtml = $(`<li id="query_li${++quer}"><a data-toggle="tab" class="cetab" href="#result_set${++tab}">QUERY ${quer}<i class="fa fa-window-close fa-1x Tabclose" style="padding: 4px; "  onclick="this.Tab_Closer()" id="Tabclose"></i></a></li>`);
        $('#pannel #TabAdderMain').append($TabHtml);
        $(`body`).off("click").on("click", ".Tabclose", this.Tab_Closer.bind(this));
        let $TabHtml_cont = $('<div id="result_set' + tab + '"class="tab-pane fade" ><div class="show_loader"></div><div id="code' + quer + '" class="Resize_toolbox"><textarea id="coder' + quer + '" name="coder" style="visibility:hidden"></textarea></div ><div class="tttab-session"><ul class="nav nav-tabs tab-section" id="Result_Tab' + tab + '"></ul></div><div class="tab-content resulttab" id="resulttab' + tab + '"><div id = "Tab' + tab + 'R" >');
        $('#maintab').append($TabHtml_cont);
        //let $ResultHtml = $(' <li class="active"><a data-toggle="tab" href="#queryresult' + res + '" style="margin: 25px 5px 0px 5px;">Result ' + res + '</a></li>');
        //$('#Result_Tab').append($ResultHtml);
        //let $ResultHtml_cont = $(' <div id="queryresult' + res + '" class="tab-pane fade in active">< div id = "container' + res++ + '" style = "width:100%" ></div ></div >');
        //$('#coder'+res).append($ResultHtml_cont);
        $('#query_li' + tab + ' a').trigger('click');
        var mime = 'text/x-pgsql';
        // get mime type
        if (window.location.href.indexOf('mime=') > -1) {
            mime = window.location.href.substr(window.location.href.indexOf('mime=') + 3);
        }

        //var editor = {};
        //'editor' + tab;
        this.editor[quer] = CodeMirror.fromTextArea(document.getElementById('coder' + quer), {
            mode: mime,
            lineNumbers: true,
            lineWrapping: true,
            extraKeys: { "Ctrl-Space": "autocomplete" },
            autoRefresh: true,
            readOnly: false,
            foldGutter: { rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.brace, CodeMirror.fold.comment) },
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });
    };

    this.DaggAdder = function () {
        let $dragHtml = $(`<li id="Drag_li${++drag}"><a data-toggle="tab" class="cetab" href="#result_set${++tab}">Drag ${drag}<i class="fa fa-window-close fa-1x Tabclose" style="padding: 4px; " onclick="this.Tab_Closer()" id="Tabclose"></i></a></li>`);
        $('#pannel #TabAdderMain').append($dragHtml);
        $(`body`).off("click").on("click", ".Tabclose", this.Tab_Closer.bind(this));
        let $draghtml_cont = $('<div id="result_set' + tab + '"class="tab-pane fade" ><div id="droppable' + drag + '" class="drop-box page_grid Resize_toolbox" "></div></div>');
        $('#maintab').append($draghtml_cont);
        $(".drop-box").droppable({ drop: this.onDrop.bind(this) });
        $('#Drag_li' + tab + ' a').trigger('click');
    }.bind(this);

    this.makeDrop = function () {
        $("#droppable" + drag).droppable({ drop: this.onDrop });
    };

    this.makeDraggable = function () {
        let options = new Object();
        options = {
            appendTo: 'body', // Append to the body.
            helper: 'clone',
            containment: $('document'),
            revert: 'invalid'
        };
        $('.table-name').draggable(options);

    };

    this.pannelhide = function () {
        $('#QUERY').click(function () {
            var lable = $("#QUERY").text().trim();
            if (lable == "DRAG") {
                $("#QUERY").text("QUERY");
                $('#droppable').toggle();
                $('div.CodeMirror.cm-s-default').toggle();
                $('div.table-box.ui-draggable.ui-draggable-handle').toggle();
                $('.draggeer').toggle();
            }
            else {
                $("#QUERY").text("DRAG");
                $('#droppable').toggle();
                $('div.CodeMirror.cm-s-default').toggle();
                $('div.table-box.ui-draggable.ui-draggable-handle').toggle();
                $('.draggeer').toggle();
            }

        });
    }

    //this.tableHide = function () {
    //    $(".TablePannelHead").click(function () {
    //        $(".mytree").toggle();
    //    });
    //}

    this.SearchTool = function () {
        var input, filter, ul, li, a, i, txtValue;
        input = document.getElementById("myInput");
        filter = input.value.toUpperCase();
        //ul = document.getElementById("myUL");
        //li = ul.getElementsByTagName("span");
        li = $(".table-name")
        for (i = 0; i < li.length; i++) {
            //a = li[i].getElementsByTagName("a")[0];
            txtValue = li[i].innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "";
            } else {
                li[i].style.display = "none";
            }
        }
    }.bind(this);

    $.contextMenu({
        selector: '.table-name',
        build: function (key, opt) {
            $(".mytree .selected").removeClass("selected");
            key.parent().addClass("selected");
            return {
                items: {
                    View: {
                        name: "View",
                        items: {
                            F100: {
                                name: "View First 100",
                                callback: function (opt, key) {
                                    //$(".mytree .selected").removeClass("selected");
                                    //opt.$trigger.parent().addClass("selected");
                                    var exe_window = $("#TabAdderMain li.active").attr("id");
                                    exe_window = exe_window[exe_window.length - 1];
                                    var tb_name = key.$trigger.attr("data-name");
                                    this.editor[exe_window].setValue("select * from " + tb_name + " ORDER BY id ASC LIMIT 100;");
                                    $('#sqlquery').trigger('click');
                                }.bind(this)
                            },
                            L100: {
                                name: "View Last 100",
                                callback: function (opt, key) {
                                    //$(".mytree .selected").removeClass("selected");
                                    //opt.$trigger.parent().addClass("selected");
                                    var exe_window = $("#TabAdderMain li.active").attr("id");
                                    exe_window = exe_window[exe_window.length - 1];
                                    var tb_name = key.$trigger.attr("data-name");
                                    this.editor[exe_window].setValue("select * from " + tb_name + " ORDER BY id DESC LIMIT 100;");
                                    $('#sqlquery').trigger('click');
                                }.bind(this)
                            },
                            ALLROWS: {
                                name: "ALL ROWS",
                                callback: function (opt, key) {
                                    //$(".mytree .selected").removeClass("selected");
                                    //opt.$trigger.parent().addClass("selected");
                                    var exe_window = $("#TabAdderMain li.active").attr("id");
                                    exe_window = exe_window[exe_window.length - 1];
                                    var tb_name = key.$trigger.attr("data-name");
                                    this.editor[exe_window].setValue("select * from " + tb_name + ";");
                                    $('#sqlquery').trigger('click');
                                }.bind(this)
                            }
                        }
                    },  
                    script: {
                        name: "Script",
                        items: {
                            insert: {
                                name: "Insert",
                                callback: function (opt, key) {

                                    //$(".mytree .selected").removeClass("selected");
                                    //opt.$trigger.parent().addClass("selected");
                                    var exe_window = $("#TabAdderMain li.active").attr("id");
                                    exe_window = exe_window[exe_window.length - 1];
                                    var tb_name = key.$trigger.attr("data-name");
                                    var Col_name;
                                    $.each(this.TCobj.TableCollection[tb_name].Columns, function (key, column) {
                                        Col_name += column['ColumnName'] + ", ";
                                    }.bind(this))
                                    this.editor[exe_window].setValue("INSERT INTO \n" + tb_name + " \n( " + Col_name +" )\nvalues(); ");
                                }.bind(this)
                            },
                            selecter: {
                                name: "Select",
                                callback: function (opt, key) {
                                    //$(".mytree .selected").removeClass("selected");
                                    //opt.$trigger.parent().addClass("selected");
                                    var exe_window = $("#TabAdderMain li.active").attr("id");
                                    exe_window = exe_window[exe_window.length - 1];
                                    var tb_name = key.$trigger.attr("data-name");
                                    var Col_name;
                                    $.each(this.TCobj.TableCollection[tb_name].Columns, function (key, column) {
                                        Col_name += column['ColumnName'] + ", ";
                                    }.bind(this))
                                    this.editor[exe_window].setValue("SELECT \n" + Col_name + " \nFROM " + tb_name  +";");
                                }.bind(this)
                            },
                            update: {
                                name: "Update",
                                callback: function (opt, key) {
                                    //$(".mytree .selected").removeClass("selected");
                                    //opt.$trigger.parent().addClass("selected");
                                    var exe_window = $("#TabAdderMain li.active").attr("id");
                                    exe_window = exe_window[exe_window.length - 1];
                                    var tb_name = key.$trigger.attr("data-name");
                                    var Col_name;
                                    $.each(this.TCobj.TableCollection[tb_name].Columns, function (key, column) {
                                        Col_name += column['ColumnName'] + "= ?, ";
                                    }.bind(this))
                                    this.editor[exe_window].setValue("UPDATE \n" + tb_name + " FROM \n" + Col_name + "\nWHERE <condition>;");
                                }.bind(this)
                            }
                        }
                    }, 
                    Count: {
                        name: "Row Count",
                        callback: function (opt, key) {
                            //$(".mytree .selected").removeClass("selected");
                            //opt.$trigger.parent().addClass("selected");
                            var exe_window = $("#TabAdderMain li.active").attr("id");
                            exe_window = exe_window[exe_window.length - 1];
                            var tb_name = key.$trigger.attr("data-name");
                            this.editor[exe_window].setValue("select COUNT(*) from " + tb_name + ";");
                            $('#sqlquery').trigger('click');
                        }.bind(this)
                    },
                    select: {
                        name: "Select",
                        callback: function (key, opt) {
                            alert("Clicked on " + key);
                        }
                    }
                }

            };
        }.bind(this)
    });

    this.cursor = function () {
        var exe_window = $("#TabAdderMain li.active a").attr("href");
    }


    this.init = function () {
        $('.mytree div:has(div)').addClass('parent');
        $('div.mytree div').click(this.create_tree);
        $('#sqlquery').click(this.ajax_call);
        this.makeDraggable();
        this.makeDrop();
        this.pannelhide();
        this.codemirrorloader();
        //this.tableHide();
        $('#TabAdder').click(this.codemirrorloader.bind(this));
        $('#DragAdder').click(this.DaggAdder.bind(this));
        $('#myInput').keyup(this.SearchTool.bind(this));
        $(".DbClient_toolbox").resizable();
        $('[data-toggle="tooltip"]').tooltip(); 


    };
    this.init();
}

