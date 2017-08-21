
var pages = {
    A4: {
        width: '21cm',
        height: '29.7cm'
    },

    A3: {
        width: '29.7cm',
        height: '42cm'
    },

    Letter: {
        width: '21.59cm',
        height: '27.94cm'
    },

    A5: {
        width: '14.8cm',
        height: '21cm'
    }
};

var sub = function (name, index, height, subsection) {
    this.id = name;
    this.index = index;
    this.height = height;
    this.subsection = subsection;
};

var PageElements = function (id, value, left, top, font) {
    this.id = id;
    this.value = value;
    this.left = left;
    this.top = top;
    this.fontsize = font;
};

var RptBuilder = function (type, saveBtnid) {

    this.savebtnid = saveBtnid;
    this.type = type;
    this.height = pages[type].height;
    this.width = pages[type].width;
    this.splitarray = [];
    this.btn_indx = null;

    this.ruler = function () {
        $('.ruler,.rulerleft').show();
        var $ruler = $('.ruler').css({ "width": this.width });
        for (var i = 0, step = 0; i < $ruler.innerWidth() / 5; i++, step++) {
            var $tick = $('<div>');
            if (step === 0) {
                $tick.addClass('tickLabel').html(i * 5);
            } else if ([1, 3, 5, 7, 9].indexOf(step) > -1) {
                $tick.addClass('tickMinor');
                if (step === 9) {
                    step = -1;
                }
            } else {
                $tick.addClass('tickMajor');
            }
            $ruler.append($tick);
        }

        var $rulerleft = $('.rulerleft').css({ "height": this.height });
        for (i = 0, step = 0; i < $rulerleft.innerHeight() / 5; i++, step++) {
            $tick = $('<div>');
            if (step === 0) {
                $tick.addClass('tickLabel').html(i * 5);
            } else if ([1, 3, 5, 7, 9].indexOf(step) > -1) {
                $tick.addClass('tickMinor');
                if (step === 9) {
                    step = -1;
                }
            } else {
                $tick.addClass('tickMajor');
            }
            $rulerleft.append($tick);
        }
    };

    this.createPage = function () {

        var $pageCanvas = $('#pageCanvas');
        $pageCanvas.empty();
        $('#pageCanvas').css({ "transform": "", "transform-origin": "" });
        $pageCanvas.append("<div id='PageContainer' style='margin-top:4px'></div>");

        this.createHeaderBox();

        if (pages[type].width > "21cm") {
            $('#pageCanvas').css({ "transform": "scale(0.8)", "transform-origin": "0 0" });
        }

        this.$div = $("<div class='page' id='page' style='width :" + pages[type].width + "; height:" + pages[type].height + ";'></div>");
        $('#PageContainer').append($div);

        this.pageSplitters(this.$div);
    };

    this.createHeaderBox = function () {

        $headersection = $("<div class='headersections' style='height:" + pages[type].height + ";'></div>");
        $("#PageContainer").append($headersection);
        $("#PageContainer").append("<div class='multiSplit' style='height:" + pages[type].height + ";'></div>");

        for (var i = 0; i < 5; i++) {

            $(".multiSplit").append("<div class='multiSplitHbox' id='box" + i + "' data_val='" + i + "' style='width:100%'></div>");

        }

    };

    this.pageSplitters = function () {

        this.$div.append("<div class='pageHeaders' id='rpthead' data_val='0' style='width :100%'></div>");

        this.$div.append("<div class='pageHeaders' id='pghead' data_val='1'style='width :100%'></div>");

        this.$div.append("<div class='pageHeaders' id='pgbody' data_val='2'style='width :100%'></div>");

        this.$div.append("<div class='pageHeaders' id='pgfooter' data_val='3'style='width :100%'></div>");

        this.$div.append("<div class='pageHeaders' id='rptfooter' data_val='4' style='width :100%'></div>");

        this.headerBox1_Split();
    };

    this.headerBox1_Split = function () {

        $(".headersections").append("<div class='head_Box1' id='rptheadHbox' data-index='0' style='width :100%'><p>Rh</p></div>");
        $(".headersections").append("<div class='head_Box1' id='pgheadHbox' data-index='1' style='width :100%'><p>Ph</p></div>");
        $(".headersections").append("<div class='head_Box1' id='pgbodyHbox' data-index='2' style='width :100%'><p>Dtls</p></div>");
        $(".headersections").append("<div class='head_Box1' id='pgfooterHbox' data-index='3' style='width :100%'><p>Pf</p></div>");
        $(".headersections").append("<div class='head_Box1' id='rptfooterHbox' data-index='4' style='width :100%'><p>Rf</p></div>");

        this.headerScaling();

        this.splitButton();
    };

    this.headerScaling = function () {

        Split(['#rpthead', '#pghead', '#pgbody', '#pgfooter', '#rptfooter'], {
            direction: 'vertical',
            cursor: 'row-resize',
            sizes: [10, 10, 60, 10, 10],
            minSize: 0,
            gutterSize: 3,
            onDrag: function (e) {
                $('#box0,#rptheadHbox').css("height", $('#rpthead').height());
                $('#box1,#pgheadHbox').css("height", $('#pghead').height());
                $('#box2,#pgbodyHbox').css("height", $('#pgbody').height());
                $('#box3,#pgfooterHbox').css("height", $('#pgfooter').height());
                $('#box4,#rptfooterHbox').css("height", $('#rptfooter').height());
            }
        });

        Split(['#rptheadHbox', '#pgheadHbox', '#pgbodyHbox', '#pgfooterHbox', '#rptfooterHbox'], {
            direction: 'vertical',
            cursor: 'row-resize',
            sizes: [10, 10, 60, 10, 10],
            minSize: 0,
            gutterSize: 3
        });

        Split(['#box0', '#box1', '#box2', '#box3', '#box4'], {
            direction: 'vertical',
            cursor: 'row-resize',
            sizes: [10, 10, 60, 10, 10],
            minSize: 0,
            gutterSize: 3
        });
        this.$div.children().not(".gutter").each(this.set_Dropable.bind(this));
    };

    this.set_Dropable = function (i, obj) {

        var $firstdiv = $("<div class='subdivs' id='s" + $(obj).attr('data_val') + "0'style='height:" + $(obj).height() + "px'></div>");
        $(obj).append($firstdiv);
        $firstdiv.droppable({ accept: ".draggable,.dropped,.shapes", drop: this.onDropFn.bind(this) });
    };

    this.splitButton = function () {

        $('.headersections').children().not(".gutter").each(this.addButton.bind(this));

    };

    this.addButton = function (i, obj) {

        this.j = 1;
        $(obj).append("<button class='btn btn-xs btn-primary'  id='btn" + i + "'><i class='fa fa-plus'></i></button>");
        $('#btn' + i).off("click").on("click", this.splitDiv.bind(this));

    };

    this.splitDiv = function (e) {

        this.splitarray = [];
        this.btn_indx = $(e.target).parent().parent().attr("data-index");
        $.each($('.page').children('.pageHeaders'), this.splitDiv_inner.bind(this));
    };

    this.splitDiv_inner = function (i, obj) {

        if ($(obj).attr('data_val') === this.btn_indx) {

            this.$sec = $("#" + obj.id);
            this.$spl = $("<div class='subdivs' id='s" + $(obj).attr('data_val') + this.j++ + "'></div>");
            this.$sec.append($spl);
            $.each($sec.children().not(".gutter"), this.splitMore.bind(this));
            $(this.$sec).children('.gutter').remove();
            this.$spl.droppable({ accept: ".draggable", drop: this.onDropFn.bind(this) });

            Split(this.splitarray, {
                direction: 'vertical',
                cursor: 'row-resize',
                minSize: 5,
                gutterSize: 3,
                onDrag: function (e) {

                    $('.multiSplit').children().not(".gutter").children().not(".gutter").each(function (i, obj1) {
                        $('.page').children().not(".gutter").children().not(".gutter").each(function (j, obj2) {
                            if ($(obj1).parent().attr("data_val") === $(obj2).parent().attr("data_val")) {
                                if ($(obj1).index() === $(obj2).index()) {
                                    $(obj1).css("height", $(obj2).height());
                                }
                            }
                        });
                    });
                }
            });
            this.multiSplitBoxinner();
        }
    };

    this.splitMore = function (i, obj) {
        this.splitarray.push("#" + obj.id);
    };

    this.multiSplitBoxinner = function () {

        var index = this.btn_indx;
        var temp1 = [];
        var flagsuccess = false;
        $('.multiSplit').children(".multiSplitHbox").eq(this.btn_indx).children().remove();

        $('.multiSplit').children(".multiSplitHbox").each(function (i, obj) {
            $('.page').children().not(".gutter").each(function (j, obj2) {
                var hLength = $(obj2).children().not(".gutter").length;
                if ($(obj).attr("data_val") === $(obj2).attr("data_val") && index === $(obj).attr("data_val")) {
                    for (var k = 0; k < hLength; k++) {
                        $(obj).append("<div class='multiSplitHboxSub' id='subBox" + k + $(obj).attr("data_val") + "' style='width:100%'><p>s" + k + "</p></div>");
                        temp1.push("#subBox" + k + $(obj).attr("data_val") + "");
                    }
                    flagsuccess = true;
                    return false;
                }
            });
            if (flagsuccess)
                return false;
        });
        if (temp1 !== null) {

            Split(temp1, {
                direction: 'vertical',
                cursor: 'row-resize',
                minSize: 10,
                gutterSize: 3
            });
        }
    };

    this.DragDrop_Items = function () {

        this.posLeft = null;
        this.posTop = null;
        this.font = null;

        $('.shapes').draggable({
            cancel: "a.ui-icon",
            revert: "invalid",
            helper: "clone",
            cursor: "move",
            drag: this.onDrag.bind(this)
        });

        $('.draggable').draggable({
            cancel: "a.ui-icon",
            revert: "invalid",
            helper: "clone",
            cursor: "move",
            drag: this.onDrag.bind(this)
        });
    };

    this.onDrag = function (event, ui) {

        this.posLeft = event.pageX;
        this.posTop = event.pageY;

    };

    this.onDropFn = function (event, ui) {

        this.dropLoc = $(event.target);
        this.itemToClone = $(ui.draggable);
        var minwidth = $(ui.draggable).width();
        var minheight = $(ui.draggable).height();

        if (this.itemToClone.hasClass('shapes')) {
            if (this.itemToClone.attr('id') === 'circle') {
                this.createCircle();
            }
            else if (this.itemToClone.attr('id') === 'rectangle') {
                this.createRectangle();
            }
            else if (this.itemToClone.attr('id') === 'v-line') {
                this.createVerticalLine();
            }
            else if (this.itemToClone.attr('id') === 'h-line') {
                this.createHorrizLine();
            }
        }

        else if (!this.itemToClone.hasClass('shapes')) {
            if (!this.itemToClone.hasClass("dropped")) {
                $(event.target).append(this.itemToClone.clone().addClass("dropped").removeClass("draggable").css({
                    width: this.itemToClone.width(),
                    height: this.itemToClone.height(),
                    position: 'absolute',
                    left: this.posLeft - 270,
                    top: this.posTop - 170
                }));
            }
            else if (this.itemToClone.hasClass("dropped")) {
                $(event.target).append(this.itemToClone.css({
                    width: this.itemToClone.width(),
                    height: this.itemToClone.height(),
                    position: 'absolute'
                }));
            }
        }
        $('.dropped').draggable({
            cursor: 'move',
            start: this.onDrag_Start.bind(this),
            stop: this.onDrag_stop.bind(this)

        });

        $('.dropped').resizable({
            containment: "parent",
            handles: "n, e, s, w",
            minHeight: minheight,
            minWidth: minwidth,
            resize: this.resizeElement.bind(this)
        });

        this.PropertyMenu();
    };

    this.createCircle = function () {

        var $cir = $("<div class='circle' style='border-radius:50%;border:1px solid'></div>");
        this.dropLoc.append($cir.addClass("dropped").css({
            width: '50px',
            height: '50px',
            position: 'absolute',
            left: this.posLeft - 270,
            top: this.posTop - 170
        }));
    };

    this.createRectangle = function () {

        var $rect = $("<div class='rectangle' style='border:1px solid'></div>");
        this.dropLoc.append($rect.addClass("dropped").css({
            width: '50px',
            height: '50px',
            position: 'absolute',
            left: this.posLeft - 270,
            top: this.posTop - 170
        }));
    };

    this.createVerticalLine = function () {

        var $vline = $("<div class='v-line' style='border:none;border:1px solid;cursor:move'></div>");
        this.dropLoc.append($vline.addClass("v-line-dropped").css({
            width: '1px',
            height: '50px',
            position: 'absolute',
            left: this.posLeft - 270,
            top: this.posTop - 170
        }));

        $('.v-line-dropped').draggable({
            cursor: 'move',
            start: this.onDrag_Start.bind(this),
            stop: this.onDrag_stop.bind(this)

        });

        $('.v-line-dropped').resizable({
            containment: "parent",
            handles: "n, s",
            resize: this.resizeElement.bind(this)
        });

    };

    this.createHorrizLine = function () {

        var $hline = $("<div class='h-line' style='border:none;border:1px solid;cursor:move'></div>");
        this.dropLoc.append($hline.addClass("h-line-dropped").css({
            width: '50px',
            height: '1px',
            position: 'absolute',
            left: this.posLeft - 270,
            top: this.posTop - 170
        }));

        $('.h-line-dropped').draggable({
            cursor: 'move',
            start: this.onDrag_Start.bind(this),
            stop: this.onDrag_stop.bind(this)

        });

        $('.h-line-dropped').resizable({
            containment: "parent",
            handles: "e,w",
            resize: this.resizeElement.bind(this)
        });
    };

    this.resizeElement = function (event, ui) {

        var font = parseInt($(event.target).css("height"));
        $(event.target).css("font-size", font - 5);

    };

    this.onDrag_stop = function (event, ui) {
        $(".vL").remove();
        $(".hL").remove();
    };

    this.onDrag_Start = function (event, ui) {

        $(event.target).append("<div class='vL' style='width :1px;border-left:1px dotted;height:" + pages[type].height + ";margin-left:0px;margin-top:-" + this.posTop + "px;'></div>");
        $(event.target).prepend("<div class='hL' style='height :1px;border-top:1px dotted;width:" + $(window).width() + "px;margin-top:0px;margin-left:-" + this.posLeft + "px;'></div>");

    };

    this.PropertyMenu = function () {

        this.font_color = null;
        $('#fontcolor').on("change", this.change_fontColor.bind(this));
        $(".dropped").on("click", this.element_click.bind(this));
        $(".dropped").off("click", this.element_off_Click.bind(this));

    };

    this.change_fontColor = function (e) {
        this.font_color = $(e.target).val();
    };

    this.element_click = function (e) {

        //$(e.target).css("background-color", "#eee");
        $(e.target).css("color", this.font_color);

    };

    this.element_off_Click = function () {
        $(this).css("background-color", "none");
    };

    this.propertyGrid = function () {
        $('#propGrid').show();
        var pg = new Eb_PropertyGrid("propGrid", { ForeColor: '#FFFFFF', FontSize: '20' }, [{ "name": "ForeColor", "group": "Appearance", "editor": 3, "options": null, "IsUIproperty": true, "helpText": "Choose color" }, { "name": "FontSize", "group": "Appearance", "editor": 2, "options": null, "IsUIproperty": true, "helpText": "" }]);
    };

    this.savefile = function () {

        this.report = new Object();
        this.report.Page = this.type;
        this.report.Height = this.height;
        this.report.Width = this.width;
        this.report.subsection = [];
        this.report.subsection.subsection = [];

        $.each($('.page').children().not(".gutter"), this.findPageSections.bind(this));

    };

    this.findPageSections = function (i, sections) {

        this.sections = $(sections);
        this.i = i;
        $.each(this.sections.children().not(".gutter"), this.findPageSectionsSub.bind(this));

    };

    this.findPageSectionsSub = function (j, subsec) {

        this.report.subsection.push(new sub(this.sections.attr('id'), this.sections.attr('data_val'), this.sections.css('height'), []));
        console.log(subsec);
        this.report.subsection[this.i].subsection.push(new sub($(subsec).attr('id'), $(subsec).index(), $(subsec).css('height'), []));

    };

    this.init = function () {

        $('#PageContainer').empty();
        this.ruler();
        this.createPage();
        this.DragDrop_Items();
        this.propertyGrid();

        $(this.savebtnid).on('click', this.savefile.bind(this));

    };

    this.init();
};
//baground image
var setBackgroud = function (input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#page').css({ 'background-image': 'url(' + e.target.result + ')', 'width': $('#page').width(), 'background-repeat': 'no-repeat' });
        };
        reader.readAsDataURL(input.files[0]);
    }
};

//tree 
$.fn.extend({
    treed: function (o) {

        var openedClass = 'glyphicon-minus-sign';
        var closedClass = 'glyphicon-plus-sign';

        if (typeof o !== 'undefined') {
            if (typeof o.openedClass !== 'undefined') {
                openedClass = o.openedClass;
            }
            if (typeof o.closedClass !== 'undefined') {
                closedClass = o.closedClass;
            }
        }
        var tree = $(this);
        tree.addClass("tree");
        tree.find('li').has("ul").each(function () {
            var branch = $(this);
            branch.prepend("<i class='indicator glyphicon " + closedClass + "'></i>");
            branch.addClass('branch');
            branch.on('click', function (e) {
                if (this === e.target) {
                    var icon = $(this).children('i:first');
                    icon.toggleClass(openedClass + " " + closedClass);
                    $(this).children().children().toggle();
                }
            });
            branch.children().children().toggle();
        });
        tree.find('.branch .indicator').each(function () {
            $(this).on('click', function () {
                $(this).closest('li').click();
            });
        });
        tree.find('.branch>a').each(function () {
            $(this).on('click', function (e) {
                $(this).closest('li').click();
                e.preventDefault();
            });
        });
        tree.find('.branch>button').each(function () {
            $(this).on('click', function (e) {
                $(this).closest('li').click();
                e.preventDefault();
            });
        });
    }
});

