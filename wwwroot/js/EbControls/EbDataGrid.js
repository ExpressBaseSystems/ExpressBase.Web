const EbDataGrid = function (ctrl, options) {
    this.ctrl = ctrl;
    this.initControls = new InitControls(this);
    this.rowCtrls = {};
    this.newRowCounter = 0;


    ctrl.ChangedRowObject = function () {
        return this.changedRowWT();
    }.bind(this);

    this.getRowWTs = function (rowId, inpCtrls) {
        let SingleRow = {};
        SingleRow.RowId = rowId;
        SingleRow.IsUpdate = (rowId !== 0);
        SingleRow.Columns = [];
        $.each(inpCtrls, function (i, obj) {
            SingleRow.Columns.push(getSinglColumn(obj));
        }.bind(this));
        return SingleRow;
    };

    this.changedRowWT = function () {
        let SingleTable = [];
        //            [
        //              { RowId: 1,
        //                IsUpdate: true,
        //                Columns:[{ name: 1, val: 100 }, { name: 10, val: 100 }, { name: 10, val: 100 }, { name: 10, val: 100 }, { name: 10, val: 100 },]
        //              },
        //              {
        //                RowId: 0,
        //                IsUpdate: false,
        //                Columns:[{ name: 1, val: 100 }, { name: 10, val: 100 }, { name: 10, val: 100 }, { name: 10, val: 100 }, { name: 10, val: 100 },]
        //              },
        //              {
        //                RowId: 0,
        //                IsUpdate: false,
        //                Columns:[{ name: 1, val: 100 }, { name: 10, val: 100 }, { name: 10, val: 100 }, { name: 10, val: 100 }, { name: 10, val: 100 },]
        //              },
        //            ]
        $.each(this.rowCtrls, function (rowId, inpCtrls) {
            SingleTable.push(this.getRowWTs(rowId, inpCtrls));
        }.bind(this));
        return SingleTable;
    };

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
        tr += `<td>
                    <span class='edit-row rowc' tabindex='1'><span class='fa fa-pencil'></span></span>
                    <span class='check-row rowc' tabindex='1'><span class='fa fa-check'></span></span>
                    <span class='del-row rowc' tabindex='1'><span class='fa fa-minus'></span></span>
                </td></tr>`;
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

    this.getValues = function () {
        this.FVWTObjColl = [];
        $.each(this.rowCtrls, function (rowid, ctrls) {
            let rowObjs = {};
            rowObjs[0] = [];
            $.each(ctrls, function (i, obj) {
                let colObj = {};
                colObj.Name = obj.Name;
                _type = obj.EbDbType;
                colObj.Value = (_type === 7) ? parseInt(obj.getValue()) : obj.getValue();
                colObj.Type = _type;
                colObj.AutoIncrement = obj.AutoIncrement || false;
                rowObjs[0].push(colObj);
            }.bind(this));
            this.FVWTObjColl.push(rowObjs);
        }.bind(this));
    }.bind(this);

    t = this.getValues;

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

    this.editRow_click = function (e) {
        $td = $(e.target).closest("td");
        $td.find(".del-row").hide();
        $td.find(".edit-row").hide();
        $td.find(".check-row").show();
        let $tr = $td.closest("tr");
        let rowid = $tr.attr("rowid");
        this.spanToCtrl_row($tr);
    }.bind(this);

    this.checkRow_click = function (e) {
        $td = $(e.target).closest("td");
        $td.find(".check-row").hide();
        $td.find(".del-row").show();
        $td.find(".edit-row").show();
        let $tr = $td.closest("tr");
        let rowid = $tr.attr("rowid");
        this.ctrlToSpan_row(rowid);
        if ($tr.attr("is-checked") !== "true")
            this.addRow($tr);
        $tr.attr("is-checked", "true");
    }.bind(this);

    this.delRow_click = function (e) {
        $td = $(e.target).closest("td");
        $td.closest("tr").remove();
    }.bind(this);

    this.spanToCtrl_row = function ($tr) {
        $tds = $tr.find("td[ctrltdidx]");
        $.each($tds, function (i, td) {
            let $td = $(td);
            let ctrlTdIdx = $td.attr("ctrltdidx");
            if (this.ctrl.Controls.$values[ctrlTdIdx].IsEditable)
                this.spanToCtrl_td($td);

        }.bind(this));
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
        if (this.ctrl.IsAddable) {
            this.addRow();
        }
        $(`#tbl_${this.ctrl.EbSid_CtxId}`).on("click", ".check-row", this.checkRow_click);
        $(`#tbl_${this.ctrl.EbSid_CtxId}`).on("click", ".del-row", this.delRow_click);
        $(`#tbl_${this.ctrl.EbSid_CtxId}`).on("click", ".edit-row", this.editRow_click);
        $(`#tbl_${this.ctrl.EbSid_CtxId}`).on("click", ".ctrl-edit", this.ctrlEdit_click);
    };

    this.init();
};