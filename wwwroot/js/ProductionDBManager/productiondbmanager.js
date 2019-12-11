var productiondbmanager = function () {
    this.CodeMirrorObject;
    this.currentDiv;
    var dbdict = {};
    this.changesToggle = function (e) {
        let val = $(e.target).attr("val");
        $(`#${val}`).toggle();
        $(`#${val}change`).show();
    }

    this.function2update = function (e) {
        let key = $(e.target).siblings("input").val();
        var $this = $(`#${key}subchange`);
        $this.button('loading');

        //let val = dbdict[key];
        //let db = $('#dbname').val();
        $.ajax({
            type: "POST",
            url: "../ProductionDBManager/UpdateDBFilesByDB",
            data: { db_name: key, solution: key },
            success: function (data) {
                $this.button('reset').hide();
                if (jQuery.isEmptyObject(data.changes) || data.changes.length == 0) {
                    $(`#uptodate_${key}`).show();
                    $(`#i_chk_${key}`).hide();
                    $(`#${key}`).empty();
                    $(`#modified_date_${key}`).empty();
                    $(`#modified_date_${key}`).append(` <label class="sub-headings row-padding">${data.modifiedDate}</label>`);
                }
                else {
                    $(`#i_chk_${key}`).show();
                    $(`#${key}`).empty();
                    $(`#modified_date_${key}`).empty();
                    $(`#modified_date_${key}`).append(` <label class="sub-headings row-padding">${data.modifiedDate}</label>`);
                }
            }.bind(this)
        });
    };

    this.ViewChanges = function (e) {
        let val = $(e.target).siblings("input").val();
        var $this = $(`#i_chk_${val}`);
        $this.button('loading');
        $.ajax({
            type: "POST",
            url: "../ProductionDBManager/CheckChangesInFiles",
            data: { solution_id: val },
            success: this.changeajaxsuccess.bind(this, $this, val),
        });
    };

    this.changeajaxsuccess = function ($this, val, data) {
        var html = ``;
        $this.button('reset').hide();
        //if (jQuery.isEmptyObject(dbdict)) {
        //    dbdict = data;
        //}
        //else {
        //    if (!(val in dbdict)) {
        //        dbdict[val] = data[val];
        //    }
        //}
        if (data.length > 0) {
            html = html + `
                                <div class="row row-padding div-row-heading">
                                    <div class="col-md-4 ">
                                        <label class="sub-headings row-padding">
                                                <a data-toggle="collapse" class="file_content_toggle" role="button" val="${val}sub" count-val = "${data.length}" style="text-decoration:none;color: #4987fb">
                                                    ${data.length} Changes
                                                    <i class="fa fa-chevron-down"></i>
                                                </a>
                                        </label>
                                    </div>
                                    <div class="col-md-offset-6 col-md-2 align-center">
                                        <input type="hidden" value="${val}" id="data_${val}" name="data"/>
                                        <button type="button" class="btn btn-change btn-sm change_function" id="${val}subchange" data-loading-text="Changing <i class='fa fa-gear fa-spin' style='font-size:10px;margin-left:4px;'  ></i> " style="display: none;">Change</button>
                                    </div>
                                </div>
                                <div class="collapse" id="${val}sub" hidden>
                                <div class=" div-sub-headings-main">
                                    <div class="div-sub-headings">
                                        <div class="col-md-8">
                                            <label>File Name</label>
                                        </div>
                                        <div class="col-md-2">
                                            <label>File Type</label>
                                        </div>
                                        <div class="col-md-2">
                                            <label>Action</label>
                                        </div>
                                    </div>
                                </div>`;
            $.each(data, function (i, vals) {
                html = html + `<div class="row row-padding div-row-contents " id = "${val}${vals['fileHeader']}">
                                                        <div class="col-md-8">
                                                            <label class="table-content-font">${vals['fileHeader']}</label>`;
                if (vals['newItem'] == true) {
                    html = html + `<label class="table-content-font" style="color: #4987fb;">New</label>`;
                }
                html = html + `   </div>
                                                        <div class="col-md-2">
                                                            <label class="table-content-font align-center">${vals['fileType']}</label>
                                                        </div>
                                                        <div class="col-md-2">
                                                            <input type="hidden" value="${val}" id="data_${val}" name="data"/>
                                                            <button data-toggle="modal"  type="button" id="${val}showquery" obj-val="${btoa(unescape(encodeURIComponent(JSON.stringify(vals))))}" sol-id="${val}" 
                                                            class="btn btn-change btn-sm view_query" file-name = "${vals['fileHeader']}" id="${vals['fileHeader']}" data-loading-text="Getting Queries... <i class='fa fa-gear fa-spin' style='font-size:10px;margin-left:4px;'  ></i> " >Show Query</button>
                                                        </div>
                                                    </div>`;
            });
            html = html + `</div>`;
        }
        else if (data.length == 0) {
            $(`#uptodate_${val}`).show();
            $(`#i_chk_${val}`).hide();
        }
        $(`#${val}`).append(html);
    }

    this.viewquery = function (e) {
        let changes = JSON.parse(decodeURIComponent(escape(window.atob(e.target.getAttribute("obj-val")))));
        let solution = e.target.getAttribute("sol-id");
        let key = $(e.target).siblings("input").val();
        if (changes["type"] == "0") {
            $.ajax({
                type: "POST",
                url: "../ProductionDBManager/GetFunctionOrProcedureQueries",
                data: { change: changes, solution_id: solution },
                success:
                        this.AjaxSuccessFun.bind(this)
                   
            });
        }
        else if (changes["type"] == "1") {
            $.ajax({
                type: "POST",
                url: "../ProductionDBManager/GetTableQueries",
                data: { change: changes, solution_id: solution },
                success:
                        this.AjaxSuccessFun.bind(this)
            });
        }

    }
    this.AjaxSuccessFun = function (data) {
        $('#viewQuery').modal({
            show: true,
            backdrop: "static"
        });
        this.CodeMirrorObject.setValue(data.query);
        var that = this;
        setTimeout(function () {
            that.CodeMirrorObject.refresh();
        }, 500);
    };

    this.codemirroTrigger = function () {
        this.CodeMirrorObject = CodeMirror.fromTextArea(document.getElementById('editor'), {
            mode: "text/x-plsql",
            lineNumbers: true,
            extraKeys: { "Ctrl-Space": "autocomplete" },
            autoRefresh: true,
        });
        this.CodeMirrorObject.save();
    }

    this.getquery = function () {
        let query = this.CodeMirrorObject.getValue();
        let solution_id = $(`#solution_id`).val();
        let filename = $(`#file_header`).val();
        let msg = "Contains ";
        let f = 0;
        if (query.includes("DROP TABLE")) {
            f = 1;
            msg = msg + "\"DROP TABLE\"";
        }
        else if (query.includes("DROP COLUMN"))
        {
            f = 1;
            msg = msg + " \"DROP COLUMN\"";
        }
        else if (query.includes("INSERT INTO"))
        {
            f = 1;
            msg = msg + " \"INSERT\"";
        }
        else if (query.includes("UPDATE"))
        {
            f = 1;
            msg = msg + " \"UPDATE\"";
        }
        else if (query.includes("DELETE FROM"))
        {
            f = 1;
            msg = msg + " \"DELETE\"";
        }
        else {
            $.ajax({
                type: "POST",
                url: "../ProductionDBManager/ExecuteQuery",
                data: { query: query, solution_id: solution_id },
                success:
                    this.getqueryAjaxSuccess.bind(this)
            });
        }
        if (f == 1) {
            msg = msg + ". Please Confirm Query...";
            this.clickEventFunction(msg);
        }
       
    }
    this.clickEventFunction = function (msg) {
        EbDialog("show", {
            Message: msg,
            Buttons: {
                "Ok": {
                    Background: "green",
                    Align: "right",
                    FontColor: "white;"
                }
            },
            CallBack: this.dialogboxAction.bind(this)
        });
    }
    this.dialogboxAction = function(value){
                $('#viewQuery').modal({
            show: true,
            backdrop: "static"
        });
    }
    this.getqueryAjaxSuccess = function () {
        alert('Execution Completed !!!');
        let x = this.currentDiv.parentNode.parentNode.parentNode.parentNode.children[0].children[0].children[0].children[0].getAttribute("count-val");
        if (x == 1) {
            let key = this.currentDiv.parentNode.parentNode.parentNode.parentNode.getAttribute("id");
            this.currentDiv.parentNode.parentNode.parentNode.parentNode.remove();
            var today = new Date();
            var date = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date + ' ' + time;
            $(`#uptodate_${key}`).show();
            $(`#i_chk_${key}`).hide();
            $(`#${key}`).empty();
            $(`#modified_date_${key}`).empty();
            $(`#modified_date_${key}`).append(` <label class="sub-headings row-padding">${dateTime}</label>`);
        }
        else {
            x = x - 1;
            this.currentDiv.parentNode.parentNode.parentNode.parentNode.children[0].children[0].children[0].children[0].innerText = x + ` Changes`;
            this.currentDiv.parentNode.parentNode.parentNode.parentNode.children[0].children[0].children[0].children[0].setAttribute("count-val", x); 
            this.currentDiv.parentElement.parentElement.remove();
        }
    }

    this.updateInfraWithSqlScripts = function () {
        var $this = $(`#updateinfra`);
        $this.button('loading');
        $.ajax({
            type: "POST",
            url: "../ProductionDBManager/UpdateInfraWithSqlScripts",
            success: function () {
                $this.button('reset');
                alert('Success');
            },
        });
    }
    this.GetSolutionId = function (e) {
        let abc = e.target.getAttribute("sol-id");
        $("#solution_id").empty().val(abc);
        $("#file_header").empty().val(e.target.getAttribute("file-name"));
        this.currentDiv = e.target;
    };

    this.init = function () {
        this.codemirroTrigger();
        $(".div-body").on("click", '.file_content_toggle', this.changesToggle.bind(this));
        $(".div-body").on("click", '.change_function', this.function2update.bind(this));
        $('.change_integrity').on('click', this.ViewChanges.bind(this));
        $('#updateinfra').off('click').on('click', this.updateInfraWithSqlScripts.bind(this));
        $(".div-body").on("click", '.view_query', this.viewquery.bind(this));
        $("#queryExecute").on("click", this.getquery.bind(this));
        $(".div-table-contents").on("click", '.view_query', this.GetSolutionId.bind(this));
    };
    this.init();
}