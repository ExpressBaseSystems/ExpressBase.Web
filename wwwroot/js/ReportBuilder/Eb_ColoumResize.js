(function ($) {
    let init = function (tb, options) {
        let t = tb;
        t.opt = options;
        t.dd = "eb_resize_e";
        t.len = $(t).find("tr").eq(0).find("td").length;
        $(t).addClass("eb_colResizer");
        appendHandle(t);
    };

    let appendHandle = function (t) {
        let pid = $(t).closest(".dropped").attr("id");
        for (let i = 0; i < t.len - 1; i++) {
            $(t).closest(".dropped").append(`<div class="eb_resize_e" id="${pid + i}" index="${i}" style="left:${getPos(i,t)}px"></div>`);
        }
        drag_ble(t);
    };

    let getPos = function (i, t) {
        let it = $(t).find("tr").eq(0).find("td").eq(i);
        let tdleft = it.position().left + it.outerWidth();
        return tdleft;
    };

    let drag_ble = function (t) {
        this.t = t;
        let d = $(`.${t.dd}`).draggable({
            cursor: "default",
            axis: "x",
            containment: "parent",
            stop: function (e, ui) {
                let tdi = parseInt($(e.target).attr("index"));
                let l = $(e.target).position().left;
                let ltd = $(t).find("tr").eq(0).find("td").eq(tdi).position().left;
                $(t).find("tr").eq(0).find("td").eq(tdi).css({ "width": l - ltd });
                //refresh(t);
                setNext(tdi);
            }
        });
    };

    let refresh = function (t) {
        $(t).closest(".dropped").find(".eb_resize_e").each(function (k, ob) {
            let index = parseInt($(ob).attr("index"));
            $(ob).css("left", getPos(index, t));
        });
    };

    let setNext = function (tdi) {
        let index = tdi + 1;
        let resizer = $(t).closest(".dropped").find(".eb_resize_e").eq(index);
        if ($.isEmptyObject(resizer)) {
            let l = resizer.position().left;
            let ltd = $(t).find("tr").eq(0).find("td").eq(index).position().left;
            $(t).find("tr").eq(0).find("td").eq(index).css({ "width": l - ltd });
        }
        else
            refresh(this.t);
    };

    $.fn.extend({
        ColResize: function (options) {
            var defaults = {
                draging: null, 					
                stopDrag: null,
                stopDrag:null
            }
            var options = $.extend(defaults, options);

            return this.each(function () {
                init(this, options);
            });
        }
    });
})(jQuery);