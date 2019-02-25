let Eb_DBExplorer = function (options) {

    this.TCobj = options.TCobj;
    var tab = 0;
    var res = 1;

    this.create_tree = function (e) {
        let $e = $(e.target);
        $e.children('div').toggle();
        $e.filter('.parent').toggleClass('expanded');
        return false;
    };

    this.ajax_call = function (e) {
        e.preventDefault();

        var exe_window = $()
        var data = editor.getValue();

        $.ajax({
            type: "POST",
            url: "../DbClient/SqlQuery",
            content: "application/json; charset=utf-8",
            dataType: "json",
            data: { Query: data },
            traditional: true,
            success: function (result) {
                this.query_result(result);
            }.bind(this),
            error: function (result) {
                alert('Oh no :(  : ' + result);
            }
        });
    }.bind(this);

    this.query_result = function (result) {
        $.each(result.columnCollection, function (i, columns) {
            $(`#Result_Tab${tab}`).append(' <li ><a data-toggle="tab" href="#tab'+tab+'R'+res+'" style="margin: 25px 5px 0px 5px;">Result ' + res + '</a></li>')
            $("#resulttab"+tab).append("<div id='tab"+tab+"R" + res + "' class='Result_Cont tab-pane fade' ><table id='tableid" + res +"'></table></div>")
            var o = new Object();
            o.tableId = "tableid"+res++;
            //o.showFilterRow = false;
            o.showSerialColumn = false
            o.showCheckboxColumn = false;
            //o.source = "inline";
            //o.scrollHeight = "200px";
            o.columns = columns;
            o.data = result.rowCollection[i];
            this.datatable = new EbBasicDataTable(o);
        });
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
        let $source = $(ui.draggable);
        let tableName = $source.parent().attr("table-name");
        if (tableName) {
            let posLeft = event.pageX;
            let posTop = event.pageY;
            let $tableBoxHtml = $(`<div is-draggable="false" class="table-box"><i class="fa fa-window-close-o" class="draggeer" aria-hidden="true" onClick="parentNode.remove()"></i></div>`);
            $('.cont').append($tableBoxHtml);
            $tableBoxHtml.css("left", posLeft + "px");
            $tableBoxHtml.css("top", posTop + "px");
            $($tableBoxHtml).append(tableName, "<br />");
            let cname = this.TCobj.TableCollection[tableName].Columns[0]['ColumnName'];
            $.each(this.TCobj.TableCollection[tableName].Columns, function (key, column) {
                $($tableBoxHtml).append(column['ColumnName']);
                $($tableBoxHtml).append(" : ", column['ColumnType'], "<br />");
            })
            if ($tableBoxHtml.attr("is-draggable") == "false") {// if called first time
                $tableBoxHtml.draggable(options);
                $tableBoxHtml.attr("is-draggable", "true");
            }
        }  
    }.bind(this);

    window.onload = function () {
        
    };
    

    this.codemirrorloader = function () {
        let $TabHtml = $(`<li><a data-toggle="tab" href="#result_set${++tab}">QUERY ${tab}<i class="far fa-window-close fa-2x" onClick="parentNode.remove()></i></a></li>`);
        $('#pannel #TabAdderMain').append($TabHtml);
        let $TabHtml_cont = $('<div id="result_set' + tab + '"class="tab-pane fade" ><div id="code' + tab + '" ><textarea id="coder' + tab + '" name="coder" style="visibility:hidden"></textarea></div ><ul class="nav nav-tabs" id="Result_Tab' + tab + '"></ul><div class="tab-content resulttab" id="resulttab' + tab + '"><div id = "Tab' + tab + 'R" >');
        $('#maintab').append($TabHtml_cont);
        //let $ResultHtml = $(' <li class="active"><a data-toggle="tab" href="#queryresult' + res + '" style="margin: 25px 5px 0px 5px;">Result ' + res + '</a></li>');
        //$('#Result_Tab').append($ResultHtml);
        //let $ResultHtml_cont = $(' <div id="queryresult' + res + '" class="tab-pane fade in active">< div id = "container' + res++ + '" style = "width:100%" ></div ></div >');
        //$('#coder'+res).append($ResultHtml_cont);

        var mime = 'text/x-pgsql';
        // get mime type
        if (window.location.href.indexOf('mime=') > -1) {
            mime = window.location.href.substr(window.location.href.indexOf('mime=') + 3);
        }

        var editor = 'editor' + tab;
        window.editor = CodeMirror.fromTextArea(document.getElementById('coder' + tab), {
            mode: mime,
            lineNumbers: false,
            lineWrapping: false,
            extraKeys: { "Ctrl-Space": "autocomplete" },
            autoRefresh: true,
            readOnly: false,
            foldGutter: { rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.brace, CodeMirror.fold.comment) },
            //gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });
    };
    this.makeDrop = function () {
        $("#droppable").droppable({ drop: this.onDrop });
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
            if(lable == "DRAG") {
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
    

    this.init = function () {
        $('.mytree div:has(div)').addClass('parent');
        $('div.mytree div').click(this.create_tree);
        $('#sqlquery').click(this.ajax_call);
        this.makeDraggable();
        this.makeDrop();
        this.pannelhide();
        this.codemirrorloader();
        $('#TabAdder').click(this.codemirrorloader);
    };
    this.init();
}

