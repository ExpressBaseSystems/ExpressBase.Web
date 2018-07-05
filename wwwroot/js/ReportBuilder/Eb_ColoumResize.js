(function ($) {
    $.fn.ColResize = function (options) {

        var _table = $(this);
        var _tr0 = _table.find("tr").eq(0);
        var _opt = options || {};
        var _len = _table.find("tr").eq(0).find("td").length;
        var _rowCount = _table.find("tr").length;
        const _resizer = "eb_resize_e";
        const _resizerV = "eb_resize_row";

        var _dragpos = null;

        var init = function () {
            _table.addClass("eb_colResizer");
            setWidthAndH();
            appendHandle();
        };

        let setWidthAndH = function () {
            _tr0.find("td").each(function (j, o) {
                if (j < _len - 1)
                    $(o).css("width", calcPercent($(o).innerWidth(), _table) + "%");
            });
            //_table.find("tr").each(function (k, ob) {
            //    if (k < _rowCount)
            //        $(ob).css("height", calcPercentTop($(ob).innerHeight()) + "%");
            //});
        };

        let appendHandle = function () {
            let pid = _table.closest(".dropped").attr("id");
            for (let i = 0; i < _len - 1; i++) {
                _table.closest(".dropped").append(`<div class="eb_resize_e" wt="${pid}" id="${pid + i}" index="${i}" style="left:${getPos(i)}%"></div>`);
            }
            for (let j = 0; j < _rowCount; j++) {
                _table.closest(".dropped").append(
                    `<div class="eb_resize_row"  wt="${pid}" id="eb_resize_row${pid + j}" index="${j}" style="top:${getTop(j)}%"></div>`);
            }
            drag_ble();
        };

        let getPos = function (i) {
            let it = _tr0.find("td").eq(i);
            let tdleft = it.position().left + it.outerWidth();
            return calcPercent(tdleft,_table);
        };

        let getTop = function (i) {
            let tr = _table.find("tr").eq(i);
            let tdtop = tr.position().top + tr.height();
            return calcPercentTop(tdtop,_table);
        };

        let drag_ble = function () {
            let d = $(`.${_resizer}`).draggable({
                axis: "x",
                containment: "parent",
                stop: dragStop.bind(this),
                drag: ondrag.bind(this),
                start: startDrag.bind(this)
            });

            let f = $(`.${_resizerV}`).draggable({
                axis: "y",
                containment: "parent",
                stop: dragStopV.bind(this),
                start: startDragV.bind(this)
            });
        };

        let dragStopV = function (e, ui) {
            let t = $(e.target).attr("wt");
            let tri = parseInt($(e.target).attr("index"));
            let l = $(e.target).position().top;
            let ltd = $(`#${t}`).find("tr").eq(tri).position().top;
            $(`#${t}`).find("tr").eq(tri).css({ "height": calcPercentTop(l - ltd, $(`#${t}`)) + "%" });
            setNextTr(tri, $(`#${t}`));
        }

        let startDragV = function (e, ui) {
            _dragpos = $(e.target).position().top;
        }

        let startDrag = function (e, ui) {
            _dragpos = $(e.target).position().left;
        };

        let ondrag = function (e, ui) {
            //$('.dropped').hover(function () {
            //    $(this).css("cursor", "col-resize");
            //});
        };

        let dragStop = function (e, ui) {
            let t = $(e.target).attr("wt");
            let tdi = parseInt($(e.target).attr("index"));
            let l = $(e.target).position().left;
            let ltd = $(`#${t}`).find("tr").eq(0).find("td").eq(tdi).position().left;
            $(`#${t}`).find("tr").eq(0).find("td").eq(tdi).css({ "width": calcPercent(l - ltd, $(`#${t}`)) +"%" });
            setNext(tdi, $(`#${t}`));
        };

        let setNext = function (tdi,$t) {
            let index = tdi + 1;
            let resizer = $t.closest(".dropped").find(".eb_resize_e").eq(tdi);
            let _nextNode = $t.closest(".dropped").find(".eb_resize_e").eq(index)

            if (_nextNode.length > 0) {
                let l = resizer.position().left;
                let tdw = $t.find("tr").eq(0).find("td").eq(index).outerWidth();
                if (_dragpos > l)
                    $t.find("tr").eq(0).find("td").eq(index).css({ "width": calcPercent(tdw + (_dragpos - l), $t) + "%" });
                else
                    $t.find("tr").eq(0).find("td").eq(index).css({ "width": calcPercent(tdw - (l - _dragpos), $t) + "%" });
            }
            else
                refresh();
        };

        let setNextTr = function (tri,$t) {
            let index = tri + 1;
            let resizer = $t.closest(".dropped").find(`.eb_resize_row`).eq(tri);
            let _nextNode = $t.closest(".dropped").find(`.eb_resize_row`).eq(index)

            if (_nextNode.length > 0) {
                let l = resizer.position().top;
                let trh = $t.find("tr").eq(index).innerHeight();
                if (_dragpos > l)
                    $t.find("tr").eq(index).css({ "height": calcPercentTop(trh + (_dragpos - l), $t) + "%" });
                else
                    $t.find("tr").eq(index).css({ "height": calcPercentTop(trh - (l - _dragpos), $t) + "%" });
            }
            else
                refreshTr();
        };

        let refresh = function (t) {
            _table.closest(".dropped").find(".eb_resize_e").each(function (k, ob) {
                let index = parseInt($(ob).attr("index"));
                $(ob).css("left", getPos(index) + "%");
            });
        };

        let refreshTr = function () {
            _table.closest(".dropped").find(`.${_resizerV}`).each(function (k, ob) {
                let index = parseInt($(ob).attr("index"));
                $(ob).css("top", getTop(index) + "%");
            });
        }

        let calcPercent = function (val,table) {
            let per = val / table.innerWidth() * 100;
            return per;
        };

        let calcPercentTop = function (val,table) {
            let per = val / table.innerHeight() * 100;
            return per;
        };

        let removeResize = function (t) {
            $(`.${_resizer}`).draggable("destroy");
            $(`.${_resizerV}`).draggable("destroy");
            _table.closest(".dropped").find(".eb_resize_e").remove();
            _table.closest(".dropped").find(".eb_resize_row").remove();
        };

        if (_opt.status || _opt.status === "destroy") {
            removeResize();
        }
        else
            init();
    };
}(jQuery))

