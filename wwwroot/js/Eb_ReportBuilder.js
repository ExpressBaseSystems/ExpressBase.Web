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

var PageElements = function (id, left, top, width, height) {
    this.id = id;
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
};

var RptBuilder = function (type, saveBtnid, newPage, commit, Isnew, custHeight, custWidth, custunit) {
    this.savebtnid = saveBtnid;
    this.newPage = newPage;
    this.incrId = 0;
    this.type = type;
    this.Commitbtnid = commit;
    this.IsNew = Isnew;
    this.Rel_object;

    if (this.type === 'custom-size') {
        this.height = custHeight + custunit;
        this.width = custWidth + custunit;
    }
    else if (this.type !== 'custom-size') {
        this.height = pages[type].height;
        this.width = pages[type].width;
        $('#custom-size').hide();
    }

    this.splitarray = [];
    this.btn_indx = null;

    $('#propGrid').show();
    var pg = new Eb_PropertyGrid("propGrid");
    pg.setObject({ ForeColor: '#FFFFFF', FontSize: '20' }, [{ "name": "ForeColor", "group": "Appearance", "editor": 3, "options": null, "IsUIproperty": true, "helpText": "Choose color" }, { "name": "FontSize", "group": "Appearance", "editor": 2, "options": null, "IsUIproperty": true, "helpText": "" }]);


    this.ruler = function () {
        $('.ruler,.rulerleft').show();
        var $ruler = $('.ruler').css({ "width": this.width });
        for (var i = 0, step = 0; i < $ruler.innerWidth() / 5; i++ , step++) {
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
        for (i = 0, step = 0; i < $rulerleft.innerHeight() / 5; i++ , step++) {
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

    this.createPagecontainer = function () {

        var $pageCanvas = $('#pageCanvas');
        $pageCanvas.empty();
        $('#pageCanvas').css({ "transform": "", "transform-origin": "" });
        var PageContainer = $("<div id='PageContainer'></div>");
        $pageCanvas.append(PageContainer);

        this.createHeaderBox();

        if (this.width > "21cm") {
            $('#pageCanvas').css({ "transform": "scale(0.8)", "transform-origin": "0 0" });
        }
        return PageContainer;
    };

    this.createPage = function (PageContainer) {

        this.$div = $("<div class='page' id='page' style='width :" + this.width + "; height:" + this.height + ";'></div>");
        PageContainer.append(this.$div);
        $('.title').show();
        this.pageSplitters(this.$div);
    };

    this.createHeaderBox = function () {

        $headersection = $("<div class='headersections' style='height:" + this.height + ";'></div>");
        $("#PageContainer").append($headersection);
        $("#PageContainer").append("<div class='multiSplit' style='height:" + this.height + ";'></div>");

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
            sizes: [20, 20, 20, 20, 20],
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
            sizes: [20, 20, 20, 20, 20],
            minSize: 0,
            gutterSize: 3
        });

        Split(['#box0', '#box1', '#box2', '#box3', '#box4'], {
            direction: 'vertical',
            cursor: 'row-resize',
            sizes: [20, 20, 20, 20, 20],
            minSize: 0,
            gutterSize: 3
        });
        this.$div.children().not(".gutter").each(this.set_Dropable.bind(this));
    };

    this.set_Dropable = function (i, obj) {

        var $firstdiv = $("<div class='subdivs' id='s" + $(obj).attr('data_val') + "0'style='height:" + $(obj).height() + "px'></div>");
        $(obj).append($firstdiv);
        $firstdiv.droppable({ accept: ".draggable,.dropped,.shapes,.special-field", drop: this.onDropFn.bind(this) });
    };

    this.splitButton = function () {

        $('.headersections').children().not(".gutter").each(this.addButton.bind(this));

    };

    this.addButton = function (i, obj) {

        this.j = 1;
        $(obj).append("<button class='btn btn-xs'  id='btn" + i + "'><i class='fa fa-plus'></i></button>");
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
            this.$sec.append(this.$spl);
            $.each(this.$sec.children().not(".gutter"), this.splitMore.bind(this));
            $(this.$sec).children('.gutter').remove();
            this.$spl.droppable({ accept: ".draggable,.dropped,.shapes,.special-field", drop: this.onDropFn.bind(this) });

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

        $('.draggable').draggable({
            cancel: "a.ui-icon",
            revert: "invalid",
            helper: "clone",
            cursor: "move",
            drag: this.onDrag.bind(this)
        });
        $('.shapes').draggable({
            cancel: "a.ui-icon",
            revert: "invalid",
            helper: "clone",
            cursor: "move",
            drag: this.onDrag.bind(this)
        });

        $('.special-field').draggable({
            cancel: "a.ui-icon",
            revert: "invalid",
            helper: "clone",
            cursor: "move",
            drag: this.onDrag.bind(this)
        });
    };

    this.onDrag = function (event, ui) {

        //this.posLeft = event.pageX;
        //this.posTop = event.pageY;
        //console.log('left' + this.posLeft, 'top' + this.posTop);
    };

    this.onDropFn = function (event, ui) {

        this.posLeft = event.pageX;
        this.posTop = event.pageY;
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
            else if (this.itemToClone.attr('id') === 'arrow-right') {
                this.createArrowRight();
            }
            else if (this.itemToClone.attr('id') === 'arrow-left') {
                this.createArrowLeft();
            }
            else if (this.itemToClone.attr('id') === 'arrow-up') {
                this.createArrowUp();
            }
            else if (this.itemToClone.attr('id') === 'arrow-down') {
                this.createArrowDown();
            }
            else if (this.itemToClone.attr('id') === 'by-dir-arrow-v') {
                this.createByDirArrowHori();
            }
            else if (this.itemToClone.attr('id') === 'by-dir-arrow-h') {
                this.createByDirArrowVertcal();
            }
        }

        else if (this.itemToClone.hasClass('special-field')) {

            if (this.itemToClone.attr('id') === "date-time") {
                this.addCurrentDateTime();
            }
        }
        else if (this.itemToClone.hasClass('qr-Br-img-btn')) {

            if (this.itemToClone.attr('id') === 'pg-img') {
                this.addImageOnPage();
            }

        }

        else if (this.itemToClone.hasClass('coloums')) {

            if (!this.itemToClone.hasClass("dropped")) {

                $(event.target).append(this.itemToClone.clone().addClass("dropped").removeClass("draggable").css({
                    width: this.itemToClone.width(),
                    height: this.itemToClone.height(),
                    position: 'absolute',
                    left: this.posLeft - 270,
                    top: this.posTop - 200
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

        $('.image-reSize').resizable({ containment: "parent" });

        $('.dropped').resizable({
            containment: "parent",
            handles: "n, e, s, w",
            minHeight: minheight,
            minWidth: minwidth,
            resize: this.resizeElement.bind(this)
        });

        this.PropertyMenu();
    };

    this.createArrowLeft = function () {

        var $arrowL = $("<div class='arrow' id='arrow-left" + this.incrId++ + "' style='border:1px solid'><div class='arrow-left'></div></div>");
        this.dropLoc.append($arrowL.addClass("arrow-l-draggable").css({
            width: '50px',
            height: '1px',
            position: 'absolute',
            left: this.posLeft - 270,
            top: this.posTop - 200
        }));
        $('.arrow-l-draggable').draggable({ cursor: 'move', start: this.onDrag_Start.bind(this), stop: this.onDrag_stop.bind(this) });
        $('.arrow-l-draggable').resizable({ containment: "parent", handles: "e,w", resize: this.resizeElement.bind(this) });

    };

    this.createArrowUp = function () {

        var $arrowU = $("<div class='arrow' id='arrow-up" + this.incrId++ + "' style='border:1px solid'><div class='arrow-up'></div></div>");
        this.dropLoc.append($arrowU.addClass("arrow-u-draggable").css({
            width: '1px',
            height: '50px',
            position: 'absolute',
            left: this.posLeft - 270,
            top: this.posTop - 200
        }));
        $('.arrow-u-draggable').draggable({ cursor: 'move', start: this.onDrag_Start.bind(this), stop: this.onDrag_stop.bind(this) });
        $('.arrow-u-draggable').resizable({ containment: "parent", handles: "s,n", resize: this.resizeElement.bind(this) });

    };

    this.createArrowDown = function () {

        var $arrowD = $("<div class='arrow' id='arrow-down" + this.incrId++ + "' style='display: flex;border:1px solid'><div class='arrow-down'></div></div>");
        this.dropLoc.append($arrowD.addClass("arrow-d-draggable").css({
            width: '1px',
            height: '50px',
            position: 'absolute',
            left: this.posLeft - 270,
            top: this.posTop - 200
        }));
        $('.arrow-d-draggable').draggable({ cursor: 'move', start: this.onDrag_Start.bind(this), stop: this.onDrag_stop.bind(this) });
        $('.arrow-d-draggable').resizable({ containment: "parent", handles: "s,n", resize: this.resizeElement.bind(this) });

    };

    this.createByDirArrowVertcal = function () {

        var $arrowByDirVert = $("<div class='arrow' id='arrow-by-dir-v" + this.incrId++ + "' style='display: flex;border:1px solid'><div class='arrow-By-dir-v-t'></div><div class='arrow-By-dir-v-b'></div></div>");
        this.dropLoc.append($arrowByDirVert.addClass("arrow-by-d-v-draggable").css({
            width: '1px',
            height: '50px',
            position: 'absolute',
            left: this.posLeft - 270,
            top: this.posTop - 200
        }));
        $('.arrow-by-d-v-draggable').draggable({ cursor: 'move', start: this.onDrag_Start.bind(this), stop: this.onDrag_stop.bind(this) });
        $('.arrow-by-d-v-draggable').resizable({ containment: "parent", handles: "s,n", resize: this.resizeElement.bind(this) });

    };

    this.createByDirArrowHori = function () {

        var $arrowByDirHori = $("<div class='arrow' id='arrow-by-dir-h" + this.incrId++ + "' style='border:1px solid'><div class='arrow-By-dir-h-l'></div><div class='arrow-By-dir-h-r'></div></div>");
        this.dropLoc.append($arrowByDirHori.addClass("arrow-by-d-h-draggable").css({
            width: '50px',
            height: '1px',
            position: 'absolute',
            left: this.posLeft - 270,
            top: this.posTop - 200
        }));
        $('.arrow-by-d-h-draggable').draggable({ cursor: 'move', start: this.onDrag_Start.bind(this), stop: this.onDrag_stop.bind(this) });
        $('.arrow-by-d-h-draggable').resizable({ containment: "parent", handles: "e,w", resize: this.resizeElement.bind(this) });

    };

    this.addImageOnPage = function () {
        this.$img = $("<div class='img-container'><input type='file' class='file' style='display:none'/><button class='btn btn-default upload-btn'><i class='fa fa-picture-o fa-2x' aria-hidden='true' disabled></i></button></div>");
        this.dropLoc.append(this.$img.addClass("dropped").css({
            width: '100px',
            height: '100px',
            position: 'absolute',
            left: this.posLeft - 270,
            top: this.posTop - 200
        }));
        $('.upload-btn ').on('click', this.uploadImage.bind(this));

    };

    this.uploadImage = function (e) {

        var $file = $(e.target).siblings().attr('class');
        $('.' + $file).click();
        var imgDiv = this.$img;

        $('.' + $file).change(function () {
            var input = this;

            if (input.files && input.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {

                    var img = $("<img id='demo' src='" + e.target.result + "' style='width:100px'/>");
                    imgDiv.append(img.addClass('image-reSize'));
                    imgDiv.children('.file,button,.ui-resizable-handle').remove();
                };
                reader.readAsDataURL(input.files[0]);
            }
        });
    };

    this.createArrowRight = function () {

        var $arrowR = $("<div class='arrow' id='arrow-right" + this.incrId++ + "' style='border:1px solid'><div class='arrow-right'></div></div>");
        this.dropLoc.append($arrowR.addClass("arrow-r-draggable").css({
            width: '50px',
            height: '1px',
            position: 'absolute',
            left: this.posLeft - 270,
            top: this.posTop - 200
        }));
        $('.arrow-r-draggable').draggable({ cursor: 'move', start: this.onDrag_Start.bind(this), stop: this.onDrag_stop.bind(this) });
        $('.arrow-r-draggable').resizable({ containment: "parent", handles: "e,w", resize: this.resizeElement.bind(this) });

    };

    this.addCurrentDateTime = function () {

        var currentdate = new Date();
        var time = currentdate.getDate() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getFullYear() + " @ "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();

        var $DateTime = $("<div class='date-time' style='border:1px solid'>" + time + "</div>");
        this.dropLoc.append($DateTime.addClass("dropped").css({
            width: '150px',
            height: '20px',
            position: 'absolute',
            left: this.posLeft - 270,
            top: this.posTop - 200
        }));
    };

    this.createCircle = function () {

        var $cir = $("<div class='circle' id='circle" + this.incrId++ + "' style='border-radius:50%;border:1px solid'></div>");
        this.dropLoc.append($cir.addClass("dropped").css({
            width: '50px',
            height: '50px',
            position: 'absolute',
            left: this.posLeft - 270,
            top: this.posTop - 200
        }));
    };

    this.createRectangle = function () {

        var $rect = $("<div class='rectangle' id='rect" + this.incrId++ + "' style='border:1px solid'></div>");
        this.dropLoc.append($rect.addClass("dropped").css({
            width: '50px',
            height: '50px',
            position: 'absolute',
            left: this.posLeft - 270,
            top: this.posTop - 200
        }));
    };

    this.createVerticalLine = function () {

        var $vline = $("<div class='v-line' id='v-line" + this.incrId++ + "' style='border:none;border:1px solid;cursor:move'></div>");
        this.dropLoc.append($vline.addClass("v-line-dropped").css({
            width: '1px',
            height: '50px',
            position: 'absolute',
            left: this.posLeft - 270,
            top: this.posTop - 200
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

        var $hline = $("<div class='h-line' id='h-line" + this.incrId++ + "' style='border:none;border:1px solid;cursor:move'></div>");
        this.dropLoc.append($hline.addClass("h-line-dropped").css({
            width: '50px',
            height: '1px',
            position: 'absolute',
            left: this.posLeft - 270,
            top: this.posTop - 200
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
        //$(event.target).css("font-size", font - 5);

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

    this.savefile = function () {

        this.report = new Object();
        this.report.Page = this.type;
        this.report.Height = this.height;
        this.report.Width = this.width;
        this.report.subsection = [];
        this.report.subsection.subsection = [];
        this.report.subsection.subsection.subesection = [];

        $.each($('.page').children().not(".gutter"), this.findPageSections.bind(this));
        console.log(JSON.stringify(this.report));
        return this.report;
    };

    this.findPageSections = function (i, sections) {

        this.sections = $(sections);
        this.i = i;
        this.report.subsection.push(new sub(this.sections.attr('id'), this.sections.attr('data_val'), this.sections.css('height'), []));
        $.each(this.sections.children().not(".gutter"), this.findPageSectionsSub.bind(this));

    };

    this.findPageSectionsSub = function (j, subsec) {

        this.subsec = $(subsec);
        this.j = j;
        this.report.subsection[this.i].subsection.push(new sub(this.subsec.attr('id'), this.subsec.index(), this.subsec.css('height'), []));
        $.each(this.subsec.children(), this.findPageElements.bind(this));

    };

    this.findPageElements = function (k, elements) {
        this.elements = $(elements);
        console.log(this.elements.offset());
        console.log(this.elements.position().left);
        this.report.subsection[this.i].subsection[this.j].subsection.push(new PageElements(this.elements.attr('id'), this.elements.position().left - 83 + 'px', this.elements.position().top + 'px', this.elements.css('width'), this.elements.css('height')));
    };

    this.createNewPage = function () {
        console.log(this.pgC);
        //this.createPage(this.pgC);
    };

    this.Commit = function () {
        var _json = this.savefile();
        alert(_json);
        if (this.IsNew === "true") {
            var Obj_Id = null;
        }
        var Name = $('#RptName').val();
        var Description = $('#RptDesc').val();
        this.Rel_object = "";

        $.post("../RB/CommitReport", {
            "id": Obj_Id,
            "name": Name,
            "description": Description,
            "changeLog": "changed",
            "json": JSON.stringify(_json),
            "rel_obj": this.Rel_object
        });
    };

    this.init = function () {

        $('#PageContainer').empty();
        this.ruler();
        this.pgC = this.createPagecontainer();
        this.createPage(this.pgC);
        this.DragDrop_Items();

        $(this.savebtnid).on('click', this.savefile.bind(this));
        $(this.newPage).on('click', this.createNewPage.bind(this));
        $(this.Commitbtnid).on('click', this.Commit.bind(this));

    };

    this.init();

};
//background image
var setBackgroud = function (input) {
    console.log(input);
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#page').css({ 'background-image': 'url(' + e.target.result + ')', 'width': $('#page').width(), 'background-repeat': 'no-repeat' });
        };
        reader.readAsDataURL(input.files[0]);
    }
};

