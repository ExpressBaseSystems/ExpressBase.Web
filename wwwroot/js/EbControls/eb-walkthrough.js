//{
//    element: ".class/#id",
//    content: "string",
//    title: "string",
//    timeout: 1000,
//}

class Tour {
    constructor(o) {
        this.tour = null;
        this.tc = 0;
        this.s = $.extend({
            WelcomeMessage: "<small>Welcome To </small> <br/> <b>EXPRESSbase</b>",
            Description: "explore the platform",
            Stack: []
        }, o);

        this.i();
        if (this.getCookie("ebwlkthrougstatusofforon") === "off")
            return false;
        this.tour.fade.show();
        this.tour.container.show();
        this.tour.msgbox.show();
    };

    start() {
        this.tour.fade.show();
        this.tour.container.show();
        this.tour.msgbox.fadeIn();
        this.tc = 0;
        return "Tour started";
    }

    close() {
        this.skipTour();
        return "Tour closed";
    }

    setWraper() {
        $("body").append(`<div class="ebTour_bodyWrpr"></div>
                          <div class="ebTour_bodyWrprInner">
                            <a class="touFtr-skip">Skip <i class="fa fa-step-forward" aria-hidden="true"></i></a>
                            <a class="touFtr-showAgn">Dont show again <i class="fa fa-power-off" aria-hidden="true"></i></a>
                            ${this.getWelcomeBox()}
                           </div>`);
        return { fade: $(".ebTour_bodyWrpr"), container: $(".ebTour_bodyWrprInner"), msgbox: $(".ebTour_welcomebox") };
    }

    getWelcomeBox() {
            return `<div class="ebTour_welcomebox">
                                <img src="/images/walls/tour-welcomebox.png"/>
                                <div class="ebTour_welcomebox_inner">
                                    <div class="title">${this.s.WelcomeMessage}</div>
                                    <div class="subtitle">${this.s.Description}</div>
                                    <div class="ebTour-startBtn-container">
                                        <button class="ebTour-startBtn" id="tour-trigger">Take a tour</button>
                                    </div>
                                </div>
                            </div>`;
    }

    g_position(el) {
        let p = "left:0";
        let ww = window.innerWidth;
        let l = el.offset().left + (el.innerWidth() / 2);
        let offset = ww - l;
        if (l + 350 > ww) {
            l = (ww - 350) - offset;
            p = "right:0 !important;transform: scaleX(-1);";
        }
        let t = el.offset().top + el.innerHeight() + 30;
        return { l: l, t: t, pointer: p };
    }

    getStyle(pointer) {
        if (pointer.indexOf("right") >= 0)
            return "border-top-left-radius:6px !important;border-top-right-radius:0 !important";
        else
            return "";
    }

    s_tour(tc) {
        let el = null;
        if (this.s.Stack[tc].element.indexOf(".") >= 0)
            el = $(this.s.Stack[tc].element).eq(0);
        else if (this.s.Stack[tc].element.indexOf("#") >= 0)
            el = $(this.s.Stack[tc].element);
        else
            el = $(this.s.Stack[tc].element).eq(0);

        try {
            if ($(`#TourTile_${tc}`).length <= 0) {
                let p = this.g_position(el);
                this.tour.container.append(`<div class="TourTile" id="TourTile_${tc}" style="position:absolute;left:${p.l}px;top:${p.t}px;${this.getStyle(p.pointer)}">
                                        <div class="TourTileInner">
                                            <div class="TilePointer" style="${p.pointer}"></div>
                                            <div class="TourTileHead">
                                                <span>${this.s.Stack[tc].title}</span>
                                            </div>
                                            <div class="TourTileContent">
                                                <p>
                                                    ${this.s.Stack[tc].content}
                                                </p>
                                            </div>
                                            <div class="TourTileFooter">
                                                ${this.getLinks(tc)}
                                            </div>
                                        </div>
                                    </div>`);
                el.addClass("el_current");
                $(`#stack_el_${tc}_next`).off("click").on("click", this.t_nextclick.bind(this, el, $(`#TourTile_${tc}`)));
                $(`#stack_el_${tc}_prev`).off("click").on("click", this.t_prevclick.bind(this, el, $(`#TourTile_${tc}`)));
                $(`#stack_el_${tc}_click`).off("click").on("click", this.t_click.bind(this, el, $(`#TourTile_${tc}`)));
            }
            else {
                $(`#TourTile_${tc}`).fadeIn()
                el.addClass("el_current");
            }
        }
        catch (err) {
            throw err;
        }
    }

    getLinks = function (tc) {
        let html = [];
        if (tc != 0)
            html.push(`<button id="stack_el_${tc}_prev" class="TourTileBtn TourTilePrevBtn">&#8592; Prev</button>`);
        else {
            html.push('<div></div>');
        }

        if ("click" in this.s.Stack[tc] && this.s.Stack[tc].click) {
            html.push(`<button id="stack_el_${tc}_click" class="TourTileBtn TourTileClickBtn">Click</button>`);
        }

        html.push(`<button id="stack_el_${tc}_next" class="TourTileBtn TourTileNextBtn">Next &#8594;</button>`);
        return html.join("");
    }

    t_nextclick(el, tile) {
        el.removeClass("el_current");
        tile.hide();
        if (this.tc === this.s.Stack.length - 1) {
            this.tour.fade.hide();
            this.tour.container.hide();
        }
        else {
            this.tc = this.tc + 1;
            this.s_tour(this.tc);
        }
    }

    t_prevclick(el, tile) {
        el.removeClass("el_current");
        tile.hide();
        this.tc = this.tc - 1;
        this.s_tour(this.tc);
    }

    t_click(el, tile) {
        el[0].click();
        el.removeClass("el_current");
        tile.hide();
    }

    skipTour(e) {
        $(".TourTile").fadeOut();
        $(".el_current").removeClass("el_current");
        this.tour.fade.hide();
        this.tour.container.hide();
    }

    offTour() {
        this.setCookie('ebwlkthrougstatusofforon', "off", 20 * 365);
        this.skipTour();
    }

    setCookie(c_name, value, exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays == null) ? "" : ";expires = " + exdate.toUTCString());
        document.cookie = c_name + "=" + c_value;
    }

    getCookie(name) {
        var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
        return v ? v[2] : null;
    }

    deleteCokkie() {
        this.setCookie("ebwlkthrougstatusofforon", 'on', -1);
    }

    startTourByTrigger() {
        this.tour.msgbox.fadeOut();
        this.s_tour(this.tc);
    }

    i() {
        this.tour = this.setWraper();
        $(".touFtr-skip").off("click").on("click", this.skipTour.bind(this));
        $(".touFtr-showAgn").off("click").on("click", this.offTour.bind(this));
        $("#tour-trigger").on("click", this.startTourByTrigger.bind(this));
    };
}