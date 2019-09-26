var productiondbmanager = function () {
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
            url: "../ProductionDBManager/UpdateDBFunctionByDB",
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
            url: "../ProductionDBManager/CheckChangesInFunction",
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
                                            <a data-toggle="collapse" class="file_content_toggle" role="button" val="${val}sub"  style="text-decoration:none;color: #4987fb">
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
                                            <label>Function</label>
                                        </div>
                                        <div class="col-md-4">
                                            <label>File Location</label>
                                        </div>
                                    </div>
                                </div>`;
            $.each(data, function (i, vals) {
                html = html + `<div class="row row-padding div-row-contents">
                                                        <div class="col-md-8">
                                                            <label class="table-content-font">${vals['functionHeader']}</label>`;
                if (vals['newItem'] == true) {
                    html = html + `<label class="table-content-font" style="color: #4987fb;">New</label>`;
                }
                html = html + `   </div>
                                                        <div class="col-md-4">
                                                            <label class="table-content-font">${vals['filePath']}</label>
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

    this.init = function () {
        $(".div-body").on("click", '.file_content_toggle', this.changesToggle.bind(this));
        $(".div-body").on("click", '.change_function', this.function2update.bind(this));
        $('.change_integrity').on('click', this.ViewChanges.bind(this));
        $('#updateinfra').off('click').on('click', this.updateInfraWithSqlScripts.bind(this));
    };
    this.init();
}