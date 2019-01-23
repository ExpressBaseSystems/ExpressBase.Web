let EbTableLayout = function (report, EbControl) {
    this.Report = report || null;
    this.EbCtrl = {};
    this.EditCtrl = EbControl || {};
    this.isNew = $.isEmptyObject(this.EditCtrl) ? true : false;
    this.Table = null;
    const _resizer = "eb_resize_e";
    const _resizerV = "eb_resize_row";
    let _dragpos = null;
    this.ColCount = null;
    this.RowCount = null;

    this.createTable = function () {
        let id = this.Report.Objtype + (this.Report.idCounter[this.Report.Objtype + "Counter"])++;
        this.EbCtrl = new EbObjects["EbTable_Layout"](id);
        this.ColCount = this.EbCtrl.ColoumCount;
        this.RowCount = this.EbCtrl.RowCount;
        this.Report.dropLoc.append(this.getHtml(id));
        this.Report.objCollection[id] = this.EbCtrl;
        this.Table = $(`#${id}`);
        this.setPosition(id);
        this.draggableT(id);
        this.makeResizable(id);
        this.makeTLayoutDroppable(id);
        this.InitColResize(id);
        //this.InitColResizable();
    };

    this.createTableOnEdit = function () {
        let id = "Table_Layout" + (this.Report.idCounter["Table_LayoutCounter"])++;
        this.EbCtrl = new EbObjects["EbTable_Layout"](id);
        this.Report.containerId.append(this.getHtml(id));
        this.Report.repExtern.replaceProp(this.EbCtrl, this.EditCtrl);
        this.EbCtrl.EbSid = id; this.EbCtrl.Name = id;
        this.Report.objCollection[id] = this.EbCtrl;
        this.Report.pg.addToDD(this.Report.objCollection[id]);
        this.Table = $(`#${id}`);
        this.Table.css({
            left: this.EbCtrl.Left,
            top: this.EbCtrl.Top,
            width: this.EbCtrl.Width,
            height: this.EbCtrl.Height
        });
        this.ColCount = this.EbCtrl.ColoumCount;
        this.RowCount = this.EbCtrl.RowCount;
        this.draggableT(id);
        this.makeResizable(id);
        this.addCells(this.EbCtrl, "RowCount");
        this.addCells(this.EbCtrl, "ColoumCount");
        this.setCells();
        this.isNew = true;
    };

    //this.InitColResizable = function () {
    //    this.Table.find("tr").eq(0).find("td").each(function (i, o) {
    //        if (!$(o).is(':last-child'))
    //            $(o).resizable({ handles: "e", resize: this.onResizeTd.bind(this) });
    //    }.bind(this));
    //};

    //this.onResizeTd = function (event, ui) {

    //};

    this.setCells = function () {
        let coll = this.EditCtrl.CellCollection.$values;
        let $td = null;
        for (let k = 0; k < coll.length; k++) {
            $td = this.Table.find("tr").eq(coll[k].RowIndex).find("td").eq(coll[k].CellIndex);
            if (!($td.closest("tr").is(':last-child'))) {
                if (!$td.is(':last-child') && $td.closest("tr").is(':first-child'))
                    $td.css({ width: this.calcPercent(coll[k].Width) + "%" });
                $td.closest("tr").css({ height: this.calcPercentTop(coll[k].Height) + "%" });
            }
            else {
                if (!$td.is(':last-child'))
                    $td.css({ width: this.calcPercent(coll[k].Width) + "%" });
            }

            if (coll[k].ControlCollection.$values.length > 0)
                this.drawControls($td, coll[k].ControlCollection.$values[0]);
        }
        this.refreshCols();
    };

    this.drawControls = function ($td, ebCtrl) {
        var eb_type = ebCtrl.$type.split(",")[0].split(".").pop().substring(2);
        if (eb_type === "Table_Layout")
            this.Report.RbCommon.drawTableOnEdit(ebCtrl);
        else {
            var Objid = eb_type + this.Report.idCounter[eb_type + "Counter"]++;
            var $control = new EbObjects["Eb" + eb_type](Objid);
            $td.append($control.$Control.outerHTML());
            this.Report.repExtern.replaceProp($control, ebCtrl);
            $control.EbSid = Objid; $control.Name = Objid;
            this.Report.objCollection[Objid] = $control;
            this.Report.pg.addToDD(this.Report.objCollection[Objid]);
            this.Report.RefreshControl(this.Report.objCollection[Objid]);
        }
    };

    this.setPosition = function (id) {
        let $jq = $(`#${id}`);
        $jq.css({
            left: this.Report.leftwithMargin() + "px",
            top: (this.Report.posTop - this.Report.dropLoc.offset().top) - this.Report.positionTandL['top'] + "px"
        });
        this.setUiProps(id);
    };

    this.draggableT = function (id) {
        $(`#${id}`).draggable({
            cursor: "crosshair", containment: ".page", appendTo: "body", zIndex: 100,
            start: this.Report.onDrag_Start.bind(this.Report), stop: this.Report.onDrag_stop.bind(this.Report), drag: this.Report.ondragControl.bind(this.Report)
        });
    };

    this.setUiProps = function (id) {
        let $jq = $(`#${id}`);

        this.EbCtrl.Width = $jq.width();
        this.EbCtrl.Height = $jq.height();
        this.EbCtrl.Left = $jq.position().left;
        this.EbCtrl.Top = $jq.position().top;
    };

    this.makeResizable = function (id) {
        $("#" + id).off("focus").on("focus", this.Report.elementOnFocus.bind(this.Report));
        $("#" + id).off('focusout').on("focusout", this.Report.destroyResizable.bind(this.Report));
    };

    this.getHtml = function (id) {
        let html = `<div class="eb_TableLayout dropped" id=${id} eb-type="Table_Layout" tabindex="1">
                         <table class="table table-bordered">
                            <tbody>
                              <tr class="T_layout_tr">
                                ${this.getTdHtml()}
                              </tr>
                            </tbody>
                          </table>
                    <div class='eb_draggbale_table_handle' onclick='$(this).parent().focus();'><i class='fa fa-arrows'></i></div>
                    </div>`;
        return html;
    };

    this.getTdHtml = function () {
        let ar = [];
        for (i = 0; i < this.ColCount; i++) {
            ar.push("<td class='T_layout_td' eb-type='Table_Layout'></td>");
        }
        return ar.join("");
    };


    this.makeTLayoutDroppable = function (id) {
        $(`#${id}`).find('td').droppable({
            accept: ".draggable,.dropped,.coloums",
            greedy: true,
            hoverClass: "drop-hover",
            drop: this.Report.onDropFn.bind(this.Report)
        });
    };

    this.InitColResize = function (id) {
        $(`#${id} table`).addClass("eb_colResizer");
        let tdlen = $(`#${id} table tr`).eq(0).find("td").length;
        let trlen = $(`#${id} table tr`).length;
        $(`#${id} table tr`).eq(0).find("td").each(function (i, o) {
            if (!$(o).is(":last-child"))
                $(o).css({ width: this.calcPercent($(o).outerWidth()) + "%" });
        }.bind(this));

        $(`#${id} table tr`).each(function (i, ob) {
            if (!$(ob).is(":last-child"))
                $(ob).css({ height: this.calcPercentTop($(ob).outerHeight()) + "%" });
        }.bind(this));

        for (let i = 0; i < tdlen - 1; i++) {
            $(`#${id}`).append(`<div class="eb_resize_e" wt="${id}" id="${id + i}" index="${i}" style="left:${this.getPos(i)}%"></div>`);
        }

        for (let j = 0; j < trlen - 1; j++) {
            if (trlen > 1) {
                $(`#${id}`).append(
                    `<div class="eb_resize_row"  wt="${id}" id="eb_resize_row${id + j}" index="${j}" style="top:${this.getTop(j)}%"></div>`);
            }
        }

        this.dragHandle();
    };

    this.getPos = function (i) {
        let it = this.Table.find("tr").eq(0).find("td").eq(i);
        let tdleft = it.position().left + it.outerWidth();
        return this.calcPercent(tdleft);
    };

    this.getTop = function (i) {
        let tr = this.Table.find("tr").eq(i);
        let tdtop = tr.position().top + tr.height();
        return this.calcPercentTop(tdtop);
    };

    this.calcPercent = function (val) {
        let per = val / this.Table.outerWidth() * 100;
        return per;
    };

    this.calcPercentTop = function (val) {
        let per = val / this.Table.innerHeight() * 100;
        return per;
    };

    this.addRowHandles = function () {

    };

    this.appendTd = function ($ctrl, count) {
        for (let t = 0; t < count; t++) {
            $ctrl.append("<td class='T_layout_td' eb-type='Table_Layout'></td>");
        }
    };

    this.setTrPixelH = function () {
        this.Table.find("tr").each(function (k, o) {
            $(o).css({ height: $(o).height() });
        }.bind(this));
    };

    this.setTdPixelW = function () {
        this.Table.find("tr").eq(0).find("td").each(function (k, o) {
            $(o).css({ width: $(o).width() });
        }.bind(this));
    };

    this.pgChange = function (obj, pname) {
        if (this.RowCount > obj.RowCount || this.ColCount > obj.ColoumCount)
            this.deleteCell(obj, pname);
        else if (this.RowCount < obj.RowCount || this.ColCount < obj.ColoumCount)
            this.addCells(obj, pname);
    };

    this.addCells = function (obj, pname) {
        if (pname === "ColoumCount") {
            let _tdCount = this.Table.find("tr").eq(0).children("td").length;
            this.Table.find("tr").each(function (i, tr) {
                this.appendTd($(tr), obj.ColoumCount - _tdCount);
            }.bind(this));
        }
        else if (pname === "RowCount") {
            this.setTrPixelH();
            var _row = this.Table.find("tr").length;
            let _tdCount = this.Table.find("tr").eq(0).children("td").length;
            if (this.isNew)
                this.Table.css("height", this.Table.height() + ((obj.RowCount - _row) * 26));
            for (let c = _row; c <= obj.RowCount - 1; c++) {
                this.Table.find("tbody").append(`<tr id="${obj.EbSid}_tr_${c}">`);
                this.appendTd($(`#${obj.EbSid}_tr_${c}`), _tdCount);
            }
            obj.Height = this.Table.height();
        }
        this.RowCount = obj.RowCount;
        this.ColCount = obj.ColoumCount;

        this.makeTLayoutDroppable(obj.EbSid);
        this.killResizableCols();
        this.InitColResize(obj.EbSid);
    };

    this.deleteCell = function (obj, pname) {
        let lastnode = null;
        if (pname === "ColoumCount") {
            this.setTdPixelW();
            for (let z = 0; z < this.ColCount - obj.ColoumCount; z++) {
                this.Table.find("tr").each(function (i, o) {
                    lastnode = $(o).find("td:last-child");
                    if (lastnode.closest("tr").index() === 0)
                        this.Table.width($(`#${obj.EbSid}`).width() - lastnode.width());
                    lastnode.remove();
                }.bind(this));
            }
            this.ColCount = obj.ColoumCount;
            this.Table.find("tr").eq(0).find("td:last-child").css("width", "auto");
        }
        else if (pname === "RowCount") {
            this.setTrPixelH();
            for (let y = 0; y < this.RowCount - obj.RowCount; y++) {
                lastnode = this.Table.find("tr:last-child");
                this.Table.height(this.Table.height() - lastnode.height() - 2);
                lastnode.remove();
            }
            this.RowCount = obj.RowCount;
            this.Table.find("tr:last-child").css("height", "auto");
        }
        this.killResizableCols();
        this.InitColResize(obj.EbSid);
    };

    this.delFromMenu = function ($td, type) {
        let index = $td.index();
        if (type === "row") {
            this.setTrPixelH();
            this.Table.height(this.Table.height() - $td.height() - 2);
            $td.closest("tr").remove();
            this.RowCount = this.RowCount - 1;
            this.EbCtrl.RowCount = this.EbCtrl.RowCount - 1;
            this.Table.find("tr:last-child").css("height", "auto");
        }
        else if (type === "col") {
            this.setTdPixelW();
            this.Table.find("tr").each(function (i, o) {
                let node = $(o).find("td").eq(index);
                this.Table.width(this.Table.width() - node.width());
                node.remove();
            }.bind(this));
            this.ColCount = this.ColCount - 1; this.EbCtrl.ColoumCount = this.EbCtrl.ColoumCount - 1;
            this.Table.find("tr").eq(0).find("td:last-child").css("width", "auto");
        }
        this.killResizableCols();
        this.InitColResize(this.Table.attr("id"));
    };

    this.killResizableCols = function () {
        this.Table.find(`.${_resizer}`).draggable("destroy");
        this.Table.find(`.${_resizerV}`).draggable("destroy");
        this.Table.find(".eb_resize_e").remove();
        this.Table.find(".eb_resize_row").remove();
    };

    this.dragHandle = function () {
        let d = this.Table.find(`.${_resizer}`).draggable({
            axis: "x",
            containment: "parent",
            stop: this.dragStop.bind(this),
            drag: this.ondrag.bind(this),
            start: this.startDrag.bind(this)
        });

        let f = this.Table.find(`.${_resizerV}`).draggable({
            axis: "y",
            containment: "parent",
            stop: this.dragStopV.bind(this),
            start: this.startDragV.bind(this)
        });
    };

    this.dragStop = function (e, ui) {
        let tdi = parseInt($(e.target).attr("index"));
        let l = $(e.target).position().left;
        let ltd = this.Table.find("tr").eq(0).find("td").eq(tdi).position().left;
        this.Table.find("tr").eq(0).find("td").eq(tdi).css({ "width": this.calcPercent(l - ltd) + "%" });
        this.setNextCol(tdi);
        this.refreshCols();
    };

    this.dragStopV = function (e, ui) {
        let tri = parseInt($(e.target).attr("index"));
        let l = $(e.target).position().top;
        let ltd = this.Table.find("tr").eq(tri).position().top;
        this.Table.find("tr").eq(tri).css({ "height": this.calcPercentTop(l - ltd) + "%" });
        this.setNextTr(tri);
        this.refreshCols();
    }

    this.setNextCol = function (tdi) {
        let index = tdi + 1;
        let resizer = this.Table.find(".eb_resize_e").eq(tdi);
        let _nextNode = this.Table.find(".eb_resize_e").eq(index);

        let nextnode = this.Table.find("tr").eq(0).find("td").eq(index);
        if (nextnode.length > 0 && _nextNode.length > 0) {
            let w = _nextNode.position().left - resizer.position().left;
            nextnode.css("width", this.calcPercent(w + 2) + "%");
        }
    };

    this.setNextTr = function (tri) {
        let index = tri + 1;
        let resizer = this.Table.find(`.eb_resize_row`).eq(tri);
        let _nextNode = this.Table.find(`.eb_resize_row`).eq(index);
        let nextnode = this.Table.find("tr").eq(index);
        if (_nextNode.length > 0 && _nextNode.length > 0) {
            let h = _nextNode.position().top - resizer.position().top;
            nextnode.css("height", this.calcPercentTop(h + 2) + "%");
        }
    };

    this.refreshCols = function () {
        this.Table.find(".eb_resize_e").each(function (k, ob) {
            let index = parseInt($(ob).attr("index"));
            $(ob).css("left", this.getPos(index) + "%");
        }.bind(this));
        this.Table.find(`.${_resizerV}`).each(function (k, ob) {
            let index = parseInt($(ob).attr("index"));
            $(ob).css("top", this.getTop(index) + "%");
        }.bind(this));
    };

    this.ondrag = function (e, ui) {

    };

    this.startDrag = function (e, ui) {
        _dragpos = $(e.target).position().left;
    };

    this.startDragV = function (e, ui) {
        _dragpos = $(e.target).position().top;
    }

    this.start = function () {
        if ($.isEmptyObject(this.EditCtrl)) {
            this.createTable();
            return this;
        }
        else {
            this.createTableOnEdit();
            return this;
        }
    };

    return this.start();
};