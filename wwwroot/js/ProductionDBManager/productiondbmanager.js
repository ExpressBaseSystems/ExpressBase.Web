var productiondbmanager = function () {
    var dbdict = {};
    this.changesToggle = function (e) {
        let val = $(e.target).attr("val");
        $(`#${val}`).toggle();
        $(`#${val}change`).show();
    }

    this.function2update = function (e) {
        var $this = $('.change_function');
        $this.button('loading');
        let key = $(e.target).siblings("input").val();
        let val = dbdict[key];
        let db = $('#dbname').val();
        $.ajax({
            type: "POST",
            url: "../ProductionDBManager/UpdateDBFunctionByDB",
            data: { data: val, db_name: db },
            success: function (data) {
                $this.button('reset').hide();
                $(`#uptodate`).show();
                $(`#i_chk`).hide();
                $(`#${key}`).empty();
                $('#modified_date').empty();
                $('#modified_date').append(` <label class="sub-headings row-padding">${data.modifiedDate}</label>`);
            }.bind(this)
        });
    };

    this.ViewChanges = function (e) {
        var $this = $('.change_integrity');
        $this.button('loading');
        let val = $(e.target).siblings("input").val();
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
        dbdict = data;
        for (key in data) {
            if (data[key].length > 0) {
                html = html + `
                                <div class="row row-padding div-row-heading">
                                    <div class="col-md-4 ">
                                        <label class="sub-headings row-padding">
                                            <a data-toggle="collapse" class="file_content_toggle" role="button" val="${key}sub"  style="text-decoration:none;color: #4987fb">
                                                ${data[key].length} Changes
                                                <i class="fa fa-chevron-down"></i>
                                            </a>
                                        </label>
                                    </div>
                                    <div class="col-md-offset-6 col-md-2 align-center">
                                        <input type="hidden" value="${key}" id="data_${key}" name="data"/>
                                        <button type="button" class="btn btn-change btn-sm change_function" id="${key}subchange" data-loading-text="Changing <i class='fa fa-gear fa-spin' style='font-size:10px;margin-left:4px;'  ></i> " style="display: none;">Change</button>
                                    </div>
                                </div>
                                <div class="collapse" id="${key}sub" hidden>
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
                $.each(data[key], function (i, vals) {
                    html = html + `<div class="row row-padding div-row-contents">
                                                        <div class="col-md-8">
                                                            <label class="table-content-font">${vals['functionHeader']}</label>
                                                        </div>
                                                        <div class="col-md-4">
                                                            <label class="table-content-font">${vals['filePath']}</label>
                                                        </div>
                                                    </div>`;
                });
                html = html + `</div>`;
            }
            else {
                $(`#uptodate`).show();
                $(`#i_chk`).hide();
            }
        }
        $(`#${val}`).append(html);
    }

    this.init = function () {
        $(".div-body").on("click", '.file_content_toggle', this.changesToggle.bind(this));
        $(".div-body").on("click", '.change_function', this.function2update.bind(this));
        $('.change_integrity').on('click', this.ViewChanges.bind(this));
    };
    this.init();
}