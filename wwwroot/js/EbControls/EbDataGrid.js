const EbDataGrid = function (ctrl, options) {
    this.ctrl = ctrl;
    this.initControls = new InitControls(this);
    this.rowCtrls = {};
    this.newRowCounter = 0;

    this.getNewTrHTML = function (rowid) {
        let tr = `<tr added='true' rowid='${rowid}'>`;
        this.rowCtrls[rowid] = [];
        let editBtn = "";
        $.each(this.ctrl.Controls.$values, function (i, col) {
            let inpCtrlType = col.InputControlType;
            editBtn = "";
            if (col.IsEditable)
                editBtn = `<div class="fa fa-pencil ctrl-edit" aria-hidden="true"></div>`;
            let inpCtrl = new EbObjects[inpCtrlType]("ctrl_" + Date.now());
            inpCtrl = new ControlOps[inpCtrl.ObjType](inpCtrl);
            this.rowCtrls[rowid].push(inpCtrl);
            tr += `<td ctrltdidx='${i}'>
                        <div id='@ebsid@Wraper' class='ctrl-cover'>${inpCtrl.BareControlHtml}</div>
                        <div class='tdtxt'><span></span>${editBtn}</div>                        
                    </td>`.replace(/@ebsid@/g, inpCtrl.EbSid_CtxId);

        }.bind(this));
        tr += "<td><div class='check-row'><span class='fa fa-check'></span></div><div class='del-row'><span class='fa fa-minus'></span></div></td>";
        tr += "</tr>";
        return tr;
    };

    this.addRow = function (e) {
        let rowid = --this.newRowCounter;
        let tr = this.getNewTrHTML(rowid);
        let $tr = $(tr);
        $(`#tbl_${this.ctrl.EbSid_CtxId} tbody`).append($tr);
        this.initRowCtrls(rowid);
    }.bind(this);

    this.initRowCtrls = function (rowid) {
        $.each(this.rowCtrls[rowid], function (i, inpCtrl) {
            this.initControls.init(inpCtrl, name);
        }.bind(this));
    }

    //this.addBtn_click = function (e) {
    //    $btn = $(e.target).closest(".btn");
    //    if ($btn.attr("state") === "add") {
    //        this.addRow(e);
    //        this.initRowCtrls();
    //        $btn.attr("state", "cancel");
    //        $btn.find(".add-div").hide();
    //        $btn.find(".cancel-div").show();
    //    }
    //    else {
    //        $(`#tbl_${this.ctrl.EbSid_CtxId} tbody [added=true]`).remove();
    //        $btn.attr("state", "add");
    //        $btn.find(".add-div").show();
    //        $btn.find(".cancel-div").hide();
    //    }
    //}.bind(this);

    this.ctrlToSpan_row = function (rowid) {
        let $tr = $(`#tbl_${this.ctrl.EbSid_CtxId}`).find(`[rowid=${rowid}]`);
        $.each($tr.find("td[ctrltdidx]"), function (i, td) {
            this.ctrlToSpan_td($(td));
        }.bind(this));
    }.bind(this);

    this.getCtrlByTd = function ($td) {
        let rowid = $td.closest("tr").attr("rowid");
        let ctrlTdIdx = $td.attr("ctrltdidx");
        return this.rowCtrls[rowid][ctrlTdIdx];
    }

    this.ctrlToSpan_td = function ($td) {
        let ctrl = this.getCtrlByTd($td);
        $td.find(".ctrl-cover").hide();
        let val = ctrl.getValue();
        $td.find(".tdtxt span").text(val)
        $td.find(".tdtxt").show();
    }.bind(this);

    this.checkRow_click = function (e) {
        $td = $(e.target).closest("td");
        $td.find(".check-row").hide();
        $td.find(".del-row").show();
        let $tr = $td.closest("tr");
        let rowid = $tr.attr("rowid");
        this.ctrlToSpan_row(rowid);
        this.addRow($tr);
    }.bind(this);

    this.delRow_click = function (e) {
        $td = $(e.target).closest("td");
        $td.closest("tr").remove();
    }.bind(this);

    this.spanToCtrl_td = function ($td) {
        let ctrl = this.getCtrlByTd($td);
        let oldVal = ctrl.getValue();
        $td.attr("edited", "true");
        $td.find(".tdtxt").hide();
        $td.find(".ctrl-cover").show();
    }.bind(this);

    this.ctrlEdit_click = function (e) {
        $td = $(e.target).closest("td");
        this.spanToCtrl_td($td);
    }.bind(this);

    this.init = function () {
        //$(`#add_${this.ctrl.EbSid_CtxId}`).off("click").on("click", this.addBtn_click);
        if (this.ctrl.IsAddable) {
            this.addRow();
        }
        $(`#tbl_${this.ctrl.EbSid_CtxId}`).on("click", ".check-row", this.checkRow_click);
        $(`#tbl_${this.ctrl.EbSid_CtxId}`).on("click", ".del-row", this.delRow_click);
        $(`#tbl_${this.ctrl.EbSid_CtxId}`).on("click", ".ctrl-edit", this.ctrlEdit_click);
    };

    this.init();
};