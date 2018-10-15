class EbManageParam {
    constructor(options) {
        this.InitVar(options);
        this.startExe();
    };

    InitVar(options) {
        this.Option = $.extend({}, options);
        this.SqlTemp = null;
        this.Sql = null;
        this.InputParams = null;
        this.EbObject = this.Option.EbObject;
    }

    setProp(sql, o) {
        this.Sql = sql;
        this.EbObject = o;
    }

    setParams() {

    }

    startExe() {
        this.constructHtml();
        $(`${this.Option.Toggle}`).off("click").on("click", this.showEditor.bind(this));
        $(`#parmSetupSave${this.Option.Container}`).off("click").on("click", this.SaveParamsetup.bind(this));
    }

    constructHtml() {
        $("body").append(`<div id="${this.Option.Container}-IpEdw" class="modal fade" role="dialog">
                            <div class="modal-dialog">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                                        <h4 class="modal-title">Input Parameters</h4>
                                    </div>
                                    <div class="modal-body" id="paraWinTab_${this.Option.Container}">
                                        <table class="table" style="margin-bottom:0;">
                                            <thead>
                                                <tr>
                                                    <th>Parameter</th>
                                                    <th>Type</th>
                                                    <th>Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                        
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-default" id="parmSetupSave${this.Option.Container}" data-dismiss="modal">Save</button>
                                    </div>
                                </div>
                            </div>
                        </div>`);
    };

    showEditor(ev) {
        var $c = $(`#${this.Option.Container}-IpEdw`);
        $c.toggle(350, function () {
            if ($c.is(":visible"))
                this.getInputParams();
        }.bind(this));
    }

    getInputParams = function () {
        if (this.SqlTemp !== this.Sql.trim()) {
            this.Sql = this.SqlTemp.trim();
            $.ajax({
                type: 'GET',
                url: "../CE/DataWriterSqlEval",
                data: { "sql": this.Sql },
                beforeSend: function () {
                }
            }).done(function (data) {
                this.InputParams = JSON.parse(data);
                this.AppendInpuParams();
                this.setValues();
            }.bind(this));
        }
    };

    AppendInpuParams = function () {
        $(`#${this.Option.Container}-IpEdw #paraWinTab_${this.Option.Container} tbody`).empty();
        for (let i = 0; i < this.InputParams.length; i++) {
            $(`#${this.Option.Container}-IpEdw #paraWinTab_${this.Option.Container} tbody`).append(`<tr>
                            <td>${this.InputParams[i].Column}</td>
                            <td>
                                <select name="${this.InputParams[i].Column}-DBTYPE" class="form-control">
                                    ${this.setDbType()}
                                </select>
                            </td>
                            <td><input type="text" name="${this.InputParams[i].Column}-VLU" class="form-control"/></td>
                        </tr>`);
        }
    };

    setDbType = function () {
        let d = [];
        for (let k in EbDbType) {
            d.push(`<option value="${EbDbType[k]}">${k}</option>`);
        }
        return d.join(",");
    };

    setValues = function () {
        for (let i = 0; i < this.EbObject.InputParams.$values.length; i++) {
            $(`#${this.Option.Container}-IpEdw select[name="${this.EbObject.InputParams.$values[i].Column}-DBTYPE"]`).val(this.EbObject.InputParams.$values[i].Type);
            $(`#${this.Option.Container}-IpEdw input[name="${this.EbObject.InputParams.$values[i].Column}-VLU"]`).val(this.EbObject.InputParams.$values[i].Value);
        }
    }

    SaveParamsetup = function (ev) {
        for (let i = 0; i < this.InputParams.length; i++) {
            this.InputParams[i].Type = eval($(`select[name="${this.InputParams[i].Column}-DBTYPE"]`).val());
            this.InputParams[i].Value = $(`input[name="${this.InputParams[i].Column}-VLU"]`).val();
        }
        this.EbObject.InputParams.$values = this.InputParams;
    };
};