let EbTableLayout = function (report) {
    this.Report = report || null;
    this.EbCtrl = null;
    this.Table = null;
    const _resizer = "eb_resize_e";
    const _resizerV = "eb_resize_row";
    let _dragpos = null;

    this.createTable = function () {
        let id = this.Report.Objtype + (this.Report.idCounter[this.Report.Objtype + "Counter"])++;
        this.EbCtrl = new EbObjects["EbTableLayout"](id);
        this.Report.dropLoc.append(this.getHtml(id));
        this.Report.objCollection[id] = this.EbCtrl;
        this.Table = $(`#${id}`);
        this.setPosition(id);
        this.draggableT(id);
        this.makeResizable(id);
        this.makeTLayoutDroppable(id);
        this.InitColResize(id);
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
        let html = `<div class="eb_TableLayout dropped" id=${id} eb-type="TableLayout" tabindex="1">
                         <table class="table table-bordered">
                            <tbody>
                              <tr class="T_layout_tr">
                                <td class="T_layout_td"></td>
                                <td class="T_layout_td"></td>
                                <td class="T_layout_td"></td>
                              </tr>
                            </tbody>
                          </table>
                    <div class='eb_draggbale_table_handle' onclick='$(this).parent().focus();'><i class='fa fa-arrows'></i></div>
                    </div>`;
        return html;
    }


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
        $(`#${id} table tr`).eq(0).find("td").each(function (i, o) {
            if (!$(o).is(":last-child"))
                $(o).css({ width: this.calcPercent($(o).outerWidth()) + "%" });
        }.bind(this));

        for (let i = 0; i < 2 ; i++) {
            $(`#${id}`).append(`<div class="eb_resize_e" wt="${id}" id="${id + i}" index="${i}" style="left:${this.getPos(i)}%"></div>`);
        }
        this.dragHandle();
    };

    this.getPos = function (i) {
        let it = this.Table.find("tr").eq(0).find("td").eq(i);
        let tdleft = it.position().left + it.outerWidth();
        return this.calcPercent(tdleft);
    };

    this.calcPercent = function (val) {
        let per = val / this.Table.outerWidth() * 100;
        return per;
    };

    this.addRowHandles = function () {

    };

    this.addCells = function (obj, pname) {
        if (pname === "ColoumCount") {

        }
        else if (pname ==="RowCount") {

        }
    };

    this.dragHandle = function () {
        let d = $(`.${_resizer}`).draggable({
            axis: "x",
            containment: "parent",
            stop: this.dragStop.bind(this),
            drag: this.ondrag.bind(this),
            start: this.startDrag.bind(this)
        });

        //let f = $(`.${_resizerV}`).draggable({
        //    axis: "y",
        //    containment: "parent",
        //    stop: this.dragStopV.bind(this),
        //    start: this.startDragV.bind(this)
        //});
    };

    this.dragStop = function (e, ui) {
        let tdi = parseInt($(e.target).attr("index"));
        let l = $(e.target).position().left;
        let ltd = this.Table.find("tr").eq(0).find("td").eq(tdi).position().left;
        this.Table.find("tr").eq(0).find("td").eq(tdi).css({ "width": this.calcPercent(l - ltd) + "%" });
        this.setNextCol(tdi);
        //this.refreshCols();
    };

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

    this.refreshCols = function () {
        this.Table.find(".eb_resize_e").each(function (k, ob) {
            let index = parseInt($(ob).attr("index"));
            $(ob).css("left", this.getPos(index) + "%");
        }.bind(this));
    };

    this.ondrag = function (e, ui) {

    };

    this.startDrag = function (e, ui) {
        _dragpos = $(e.target).position().left;
    };

    this.dragStopV = function (e, ui) {

    };

    this.startDragV = function (e, ui) {

    };

    this.start = function () {
        this.createTable();

        return this.EbCtrl;
    };

    return this.start();
};