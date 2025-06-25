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
        $(".parent").focusin(function () {
            $(".parent").css("border-color", "red");
        });
        $(".parent").focusout(function () {
            $(".parent").css("border-color", "none");
        });
        return false;
    };
    this.ajax_call = function (e) {
        e.preventDefault();
        $(".show_loader").EbLoader("show");
        let data = "";
        let exe_window = $("#TabAdderMain li.active").attr("id");
        if (exe_window !== undefined) {
            exe_window = exe_window[exe_window.length - 1];
            data = this.editor[exe_window].getValue();
        }
        var dt = $('.dbTyper').attr("dt");
        var down = $('.dbTyper').attr("dOwn");
        if (down == 'dOwn')
            down = true;
        if (data !== "" && exe_window !== undefined) {
            $.ajax({
                type: "POST",
                url: "../DbClient/ExecuteQuery",
                content: "application/json; charset=utf-8",
                dataType: "json",
                data: { Query: data, solution: dt, Isadmin: down },
                traditional: true,
                success: function (result) {
                    if (result.length != 0) {
                        if (result[0].columnCollection != null) {
                            if (isFunctionContextMenuCall) {
                                let functionCode = result[0].rowCollection[0][0][1];
                                this.editor[exe_window].setValue(functionCode);
                                isFunctionContextMenuCall = false; // Reset the flag
                            } else {
                                this.query_result(result);
                            }
                            $('#t' + (res - 1) + ' a').trigger('click');
                        } else if (result[0].message != "") {
                            EbPopBox("show", {
                                Message: result[0].message,
                                ButtonStyle: {
                                    Text: "Ok",
                                    Color: "white",
                                    Background: "#508bf9",
                                    Callback: function () {
                                        //$(".dash-loader").hide();
                                    }
                                }
                            });
                        } else if (result[0].Result === 0) {
                            EbPopBox("show", {
                                Message: "Failed :" + result,
                                ButtonStyle: {
                                    Text: "Ok",
                                    Color: "white",
                                    Background: "#508bf9",
                                    Callback: function () {
                                        //$(".dash-loader").hide();
                                    }
                                }
                            });
                        }
                    }
                    $(".show_loader").EbLoader("hide");
                }.bind(this),
                error: function (result) {
                    EbPopBox("show", {
                        Message: "Failed : " + result.statusText,
                        ButtonStyle: {
                            Text: "Ok",
                            Color: "white",
                            Background: "#508bf9",
                            Callback: function () {
                                //$(".dash-loader").hide();
                            }
                        }
                    });
                    $(".show_loader").EbLoader("hide");
                }
            });
        } else {
            EbPopBox("show", {
                Message: "Empty Query !!!",
                ButtonStyle: {
                    Text: "Ok",
                    Color: "white",
                    Background: "#508bf9",
                    Callback: function () {
                        //$(".dash-loader").hide();
                    }
                }
            });
            $(".show_loader").EbLoader("hide");
        }
    }.bind(this);



    this.searchSolution = function (e) {
        $("#eb_common_loader").EbLoader("show");
        var searchValue = e.target.selectedOptions[0].text;
        $.ajax({
            type: 'POST',
            url: "../DbClient/SearchSolution",
            data: { clientSolnid: searchValue },
            success: function (data) {
                //cmeditor = document.getElementById(".coder");
                //cmeditor.toTextArea();
                // var temp = JSON.parse(data);
                //  if (temp.Message == "") {
                $('#viewdbclientappend').html(data);
                $('.selectpicker').selectpicker('destroy').selectpicker();
                $('#searchSolution').on('changed.bs.select', this.searchSolution);
                this.makeDraggable();
                $('.mytree div:has(div)').addClass('parent');
                $('div.mytree div').click(this.create_tree);
                $("#eb_common_loader").EbLoader("hide");
                //} else {
                //    $('#viewdbclientappend').html(data);
                //}


            }.bind(this)
        });
    }.bind(this);


    this.query_result = function (result) {
        var exe_window = $("#TabAdderMain li.active a").attr("href");
        exe_window = exe_window[exe_window.length - 1];

        // Clear previous results
        $(`#Result_Tab${exe_window}`).empty();
        $(`#resulttab${exe_window}`).empty();

        // Ensure only one result tab at a time
        for (var Result_ in result) {
            $.each(result[Result_].columnCollection, function (i, columns) {
                // Clear any existing result tabs and content
                $(`#Result_Tab${exe_window}`).empty();
                $(`#resulttab${exe_window}`).empty();

                $(`#Result_Tab${exe_window}`).append('<li id="t' + res + '"><a data-toggle="tab" class="cetab" href="#tab' + tab + 'R' + res + '" style=""> <p>Result </p> <i style="padding: 2px;" class="btn fa fa-expand" id="Result_' + res + '" data-res="' + res + '" data-tab="' + tab + '" data-columns=\'' + JSON.stringify(columns) + '\' data-rows=\'' + JSON.stringify(result[Result_].rowCollection[i]) + '\'></i><i class="fa fa-window-close fa-1x Result_close" style="" id="Resultclose"></i></a></li>');
                $("#resulttab" + exe_window).append("<div id='tab" + tab + "R" + res + "' class='Result_Cont tab-pane fade'><table id='tableid" + res + "'></table></div>");
                this.drawdatatable("tableid" + res, columns, result[Result_].rowCollection[i]);
                res++;
            }.bind(this));
            $(`body`).off("click").on("click", ".Result_close", this.Result_Closer.bind(this));
        }

        // Add click event listener for expanding results into a modal
        $("body").on("click", ".fa-expand", function () {
            var res = $(this).data("res");
            var tab = $(this).data("tab");

            // Get table data
            var originalTable = $('#tableid' + res).DataTable();
            var columns = originalTable.settings().init().columns;
            var rows = originalTable.rows({ order: 'applied', search: 'applied' }).data().toArray();

            // Create modal dynamically
            createModal();

            // Inject table into modal
            var modalContent = `
            <table id='modalTable' class='table table-striped table-bordered'></table>
        `;

            $('#modalTableContainer').html(modalContent);

            $('#modalTable').DataTable({
                columns: columns,
                data: rows,
                ordering: true,
                searching: true,
                scrollY: '60vh',
                scrollX: true,
                scrollCollapse: true,
                paging: true,
                autoWidth: false, // Important: let CSS control width
            });


            // Show modal
            $('#resultModal').modal('show');
        });
    }.bind(this);

    this.drawdatatable = function (tableid, columns, result) {
        $('#' + tableid).DataTable({
            columns: columns,
            data: result,
            ordering: true,
            searching: true,
            scrollY: '200px',
            scrollX: true, // Ensure horizontal scroll is on
            scrollCollapse: true,
            paging: true,
            autoWidth: false, // Prevent automatic miscalculation
            columnDefs: [
                {
                    targets: "_all",
                    className: "dt-left" // Optional: align text to center
                }
            ]
        });
    };


    // Function to create modal dynamically
    function createModal() {
        // Check if modal already exists
        if ($("#resultModal").length === 0) {
            var modalHtml = `
            <div class="modal fade" id="resultModal" tabindex="-1" role="dialog" aria-labelledby="resultModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-fullscreen" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="resultModalLabel">Full Screen Result</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div id="modalTableContainer">
                                <!-- Table will be injected here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
            $('body').append(modalHtml);
        }
    }



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
        this.codemirrorloader(true); // Load default tab
        this.makeDraggable();
        $('.mytree div:has(div)').addClass('parent');
        $('div.mytree div').click(this.create_tree);
        $('#sqlquery').click(this.ajax_call);


        this.pannelhide();
        //this.tableHide();
        $('#TabAdder').click(this.codemirrorloader.bind(this));
        $('#DragAdder').click(this.DaggAdder.bind(this));
    }.bind(this);

    this.Tab_Closer = function (event) {
        let $e = $(event.currentTarget).closest("li").children("a").attr("href");
        $($e).remove();
        $(event.currentTarget).closest("li").remove();
    };

    this.Result_Closer = function (event) {
        let $e = $(event.currentTarget).closest("li").children("a").attr("href");
        $($e).remove();
        $(event.currentTarget).closest("li").remove();
    };

    // Initialize the default tab index
    let defaultTabIndex = null;

    // Function to load a new CodeMirror editor into a tab
    this.codemirrorloader = function (isDefault = false) {
        quer++; // Increment quer to keep track of the tab index
        tab++;  // Increment tab to keep track of tab content

        let $TabHtml = $(`
        <li id="query_li${quer}">
            <a data-toggle="tab" class="cetab" href="#result_set${tab}">
                <p>QUERY ${quer}</p>
                <i class="fa fa-window-close fa-1x Tabclose" style="padding: 4px;" id="Tabclose${quer}"></i>
            </a>
        </li>
    `);
        $('#pannel #TabAdderMain').append($TabHtml);

        let $TabHtml_cont = $(`
        <div id="result_set${tab}" class="tab-pane fade ">
            <div class="show_loader"></div>
            <textarea id="coder${quer}" class="coder" name="coder"></textarea>
            <div class="tttab-session">
                <ul class="nav nav-tabs tab-section" id="Result_Tab${tab}"></ul>
            </div>
            <div class="tab-content resulttab" id="resulttab${tab}">
                <div id="Tab${tab}R"></div>
            </div>
        </div>
    `);
        $('#maintab').append($TabHtml_cont);

        $('#query_li' + tab + ' a').trigger('click');

        this.editor[quer] = CodeMirror.fromTextArea(document.getElementById('coder' + quer), {
            mode: "text/x-pgsql",
            lineNumbers: true,
            indentWithTabs: true,
            smartIndent: true,
            matchBrackets: true,
            autofocus: true,
            extraKeys: { "Ctrl-Space": "autocomplete" },
            hintOptions: {
                tables: {
                    users: { name: null, score: null, birthDate: null },
                    countries: { name: null, population: null, size: null }
                }
            }
        });

        if (isDefault) {
            defaultTabIndex = quer; // Set the default tab index
        }
    };

    // Use event delegation to handle clicks on dynamically added elements
    $(document).on("click", ".Tabclose", this.Tab_Closer);
    $(document).on("click", ".Resultclose", this.Result_Closer);

    this.DaggAdder = function () {
        let $dragHtml = $(`<li id="Drag_li${++drag}"><a data-toggle="tab" class="cetab" href="#result_set${++tab}">Drag ${drag}<i class="fa fa-window-close fa-1x Tabclose" style="padding: 4px; " onclick="this.Tab_Closer()" id="Tabclose"></i></a></li>`);
        $('#pannel #TabAdderMain').append($dragHtml);
        $(`body`).off("click").on("click", ".Tabclose", this.Tab_Closer.bind(this));
        let $draghtml_cont = $('<div id="result_set' + tab + '"class="tab-pane fade  " ><div id="droppable' + drag + '" class="drop-box page_grid Resize_toolbox" "></div></div>');
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
        selector: '.treecontextmenu',
        build: function (trigger, e) {
            $(".mytree .selected").removeClass("selected");
            trigger.parent().addClass("selected");

            return {
                items: {
                    View: {
                        name: "View",
                        items: {
                            F100: {
                                name: "View First 100",
                                callback: function (key, opt) {
                                    if (defaultTabIndex !== null) {
                                        this.editor[defaultTabIndex].setValue("");
                                        var new_tab_index = defaultTabIndex;
                                        defaultTabIndex = null;
                                    } else {
                                        this.codemirrorloader();
                                        var new_tab_index = quer;
                                    }
                                    var tb_name = opt.$trigger.attr('data-name');
                                    this.editor[new_tab_index].setValue("    SELECT * FROM " + tb_name + " ORDER BY id ASC LIMIT 100;");
                                    $('#sqlquery').trigger('click');
                                }.bind(this)
                            },
                            L100: {
                                name: "View Last 100",
                                callback: function (key, opt) {
                                    if (defaultTabIndex !== null) {
                                        this.editor[defaultTabIndex].setValue("");
                                        var new_tab_index = defaultTabIndex;
                                        defaultTabIndex = null;
                                    } else {
                                        this.codemirrorloader();
                                        var new_tab_index = quer;
                                    }
                                    var tb_name = opt.$trigger.attr('data-name');
                                    this.editor[new_tab_index].setValue("    SELECT * FROM " + tb_name + " ORDER BY id DESC LIMIT 100;");
                                    $('#sqlquery').trigger('click');
                                }.bind(this)
                            },
                            ALLROWS: {
                                name: "ALL ROWS",
                                callback: function (key, opt) {
                                    if (defaultTabIndex !== null) {
                                        this.editor[defaultTabIndex].setValue("");
                                        var new_tab_index = defaultTabIndex;
                                        defaultTabIndex = null;
                                    } else {
                                        this.codemirrorloader();
                                        var new_tab_index = quer;
                                    }
                                    var tb_name = opt.$trigger.attr('data-name');
                                    this.editor[new_tab_index].setValue("    SELECT * FROM " + tb_name + ";");
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
                                callback: function (key, opt) {
                                    if (defaultTabIndex !== null) {
                                        this.editor[defaultTabIndex].setValue("");
                                        var new_tab_index = defaultTabIndex;
                                        defaultTabIndex = null;
                                    } else {
                                        this.codemirrorloader();
                                        var new_tab_index = quer;
                                    }
                                    var tb_name = opt.$trigger.attr('data-name');
                                    var Col_name = "";
                                    $.each(this.TCobj.TableCollection[tb_name].Columns, function (idx, column) {
                                        Col_name += column['ColumnName'] + ", ";
                                    }.bind(this));
                                    this.editor[new_tab_index].setValue("    INSERT INTO " + tb_name + " ( " + Col_name + " ) VALUES (); ");
                                }.bind(this)
                            },
                            selecter: {
                                name: "Select",
                                callback: function (key, opt) {
                                    if (defaultTabIndex !== null) {
                                        this.editor[defaultTabIndex].setValue("");
                                        var new_tab_index = defaultTabIndex;
                                        defaultTabIndex = null;
                                    } else {
                                        this.codemirrorloader();
                                        var new_tab_index = quer;
                                    }
                                    var tb_name = opt.$trigger.attr('data-name');
                                    var Col_name = "";
                                    $.each(this.TCobj.TableCollection[tb_name].Columns, function (idx, column) {
                                        Col_name += column['ColumnName'] + ", ";
                                    }.bind(this));
                                    this.editor[new_tab_index].setValue("    SELECT " + Col_name + " FROM " + tb_name + ";");
                                }.bind(this)
                            },
                            update: {
                                name: "Update",
                                callback: function (key, opt) {
                                    if (defaultTabIndex !== null) {
                                        this.editor[defaultTabIndex].setValue("");
                                        var new_tab_index = defaultTabIndex;
                                        defaultTabIndex = null;
                                    } else {
                                        this.codemirrorloader();
                                        var new_tab_index = quer;
                                    }
                                    var tb_name = opt.$trigger.attr('data-name');
                                    var Col_name = "";
                                    $.each(this.TCobj.TableCollection[tb_name].Columns, function (idx, column) {
                                        Col_name += column['ColumnName'] + "= ?, ";
                                    }.bind(this));
                                    this.editor[new_tab_index].setValue("    UPDATE " + tb_name + " SET " + Col_name + " WHERE <condition>;");
                                }.bind(this)
                            }
                        }
                    },
                    Count: {
                        name: "Row Count",
                        callback: function (key, opt) {
                            if (defaultTabIndex !== null) {
                                this.editor[defaultTabIndex].setValue("");
                                var new_tab_index = defaultTabIndex;
                                defaultTabIndex = null;
                            } else {
                                this.codemirrorloader();
                                var new_tab_index = quer;
                            }
                            var tb_name = opt.$trigger.attr('data-name');
                            this.editor[new_tab_index].setValue("    SELECT COUNT(*) FROM " + tb_name + ";");
                            $('#sqlquery').trigger('click');
                        }.bind(this)
                    },
                    
                }
            };
        }.bind(this)

    });






    // Define a global flag
    let isFunctionContextMenuCall = false;


    // Function context menu initialization
    $.contextMenu({
        selector: '.functioncontextmenu',
        build: function ($trigger, e) {
            $(".mytree .selected").removeClass("selected");
            $trigger.addClass("selected");

            return {
                items: {
                    Count: {
                        name: "Create Script",

                        callback: function (key, opt) {
                            if (defaultTabIndex !== null) {
                                this.editor[defaultTabIndex].setValue("");
                                var new_tab_index = defaultTabIndex;
                                defaultTabIndex = null;
                            } else {
                                this.codemirrorloader();
                                var new_tab_index = quer;
                            }
                            // var tb_name = opt.$trigger.attr('data-name');

                            var functionName = opt.$trigger.attr('function-name');
                            this.editor[new_tab_index].setValue(
                                "SELECT p.proname AS function_name, pg_get_functiondef(p.oid) AS function_definition " +
                                "FROM pg_proc p LEFT JOIN pg_namespace n ON p.pronamespace = n.oid " +
                                "WHERE n.nspname NOT IN('pg_catalog', 'information_schema') " +
                                "AND p.proname = '" + functionName + "' ORDER BY function_name;"
                            );

                            // Set the flag to true
                            isFunctionContextMenuCall = true;

                            $('#sqlquery').trigger('click');
                        }.bind(this)
                    }
                }
            };
        }.bind(this)
    });


    $(document).ready(function () {
        // Initialize context menu
        $.contextMenu({
            selector: '.indexcontextmenu',
            build: function ($trigger, e) {
                // Highlight the selected index
                $(".indexcontextmenu.selected").removeClass("selected");
                $trigger.addClass("selected");

                return {
                    items: {
                        edit: {
                            name: "Edit Index",
                            callback: function (key, opt) {
                                // Show edit modal with current index name
                                var currentIndex = $trigger.data('index');
                                $('#currentIndexName').val(currentIndex);
                                $('#newIndexName').val(currentIndex);
                                $('#editIndexModal').modal('show');
                            }
                        }
                    }
                };
            }
        });

        $('#saveIndexChanges').click(function () {
            var currentIndex = $('#currentIndexName').val();
            var newIndexName = $('#newIndexName').val();

            if (newIndexName) {
                $.ajax({
                    type: 'POST',
                    url: '/DbClient/EditIndexName', // Ensure the endpoint matches your routing setup
                    data: {
                        currentIndexName: currentIndex,
                        newIndexName: newIndexName,
                        tableName: 'YourTableName' // Provide the correct table name here
                    },
                    success: function (data) {
                        if (data.success) {
                            console.log('Index name updated successfully:', data);

                            // Update the index name in the list
                            var $indexItem = $('.indexcontextmenu[data-index="' + currentIndex + '"]');
                            if ($indexItem.length) {
                                $indexItem.data('index', newIndexName).text(newIndexName);
                            } else {
                                console.error("Index item not found");
                            }



                            // Close the edit index modal
                            $('#editIndexModal').modal('hide');
                        } else {
                            // Close the edit index modal
                            $('#editIndexModal').modal('hide');
                            // Show success modal
                            $('#successModalBody').text('Index name updated successfully.');
                            $('#successModal').modal('show');
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error('Failed to update index name:', status, error);
                        // Show error modal
                        $('#errorModalBody').text('Failed to update index name: ' + error);
                        $('#errorModal').modal('show');
                    }
                });
            } else {
                // Show error modal
                $('#errorModalBody').text('New index name cannot be empty.');
                $('#errorModal').modal('show');
            }
        });
    });


    $(document).ready(function () {
        $.contextMenu({
            selector: '.column-context-menu',
            build: function ($trigger, e) {
                $(".column-context-menu.selected").removeClass("selected");
                $trigger.addClass("selected");

                var tableName = $trigger.data('table-name');
                var columnName = $trigger.data('column-name');

                return {
                    items: {
                        CreateConstraint: {
                            name: "Create Constraint",
                            callback: function () {
                                showCreateConstraintModal(tableName, columnName);
                            }
                        }, CreateIndex: {
                            name: "Create Index",
                            callback: function () {
                                window.DBExplorer.showCreateIndexModal(tableName, columnName);
                            }
                        }
                    }
                };
            }
        });

        $('#saveConstraintChanges').click(function () {
            createConstraint();
        });
    });






    this.cursor = function () {
        var exe_window = $("#TabAdderMain li.active a").attr("href");
    }


    this.init = function () {
        $('#myInput').keyup(this.SearchTool.bind(this));
        $(".DbClient_toolbox").resizable();
        $('[data-toggle="tooltip"]').tooltip();
        $('#searchSolution').on('changed.bs.select', this.searchSolution);

    };
    this.init();
}

