
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
    this.className = name;
    this.index = index;
    this.height = height;
    this.subsection = subsection;
};

var RptBuilder = function (type, toolboxid) {
    this.type = type;
    this.height = pages[type].height;
    this.width = pages[type].width;
    this.toolboxId = toolboxid;

    this.report = new Object();
    this.report.pagetype = type;
    this.report.pageheight = height;
    this.report.pagewidth = width;
    this.report.sections = [];
    this.subsection1 = [];
    this.splitarray = [];
    this.btn_indx = null;

    this.createPage = function (type) {

        var $pageCanvas = $('#pageCanvas');
        $pageCanvas.empty();
        $('#pageCanvas').css({ "transform": "", "transform-origin": "" });
        $pageCanvas.append("<div class='ruler'></div> <div class='rulerleft'></div><div id='PageContainer' style='margin-top:4px'></div>");

        this.createHeaderBox();

        if (pages[type].width > "21cm") {

            $('#pageCanvas').css({ "transform": "scale(0.8)", "transform-origin": "0 0" });

        }
        var $div = $("<div class='page' id='page' style='width :" + pages[type].width + "; height:" + pages[type].height + ";'></div>");
        $('#PageContainer').append($div);
        this.ruler(pages[type].width, pages[type].height);

        return $div;
    };

    this.createHeaderBox = function () {

        $headersection = $("<div class='headersections' style='height:" + pages[type].height + ";'></div>");
        $("#PageContainer").append($headersection);
        $("#PageContainer").append("<div class='multiSplit' style='height:" + pages[type].height + ";'></div>");

        for (var i = 0; i < 5; i++) {

            $(".multiSplit").append("<div class='multiSplitHbox' id='box" + i + "' data_val='" + i + "' style='width:100%'></div>");

        }

    };

    this.headerBox1_Split = function () {

        $(".headersections").append("<div class='rptheadHbox' data-index='0' style='width :100%'><p>Rh</p></div>");
        $(".headersections").append("<div class='pgheadHbox' data-index='1' style='width :100%'><p>Ph</p></div>");
        $(".headersections").append("<div class='pgbodyHbox' data-index='2' style='width :100%'><p>Dtls</p></div>");
        $(".headersections").append("<div class='pgfooterHbox' data-index='3' style='width :100%'><p>Pf</p></div>");
        $(".headersections").append("<div class='rptfooterHbox' data-index='4' style='width :100%'><p>Rf</p></div>");

        this.splitButton();
    };

    this.ruler = function (width, height) {

        var $ruler = $('.ruler').css({ "width": width, "height": "25px", "margin-left": "108px" });
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

        var $rulerleft = $('.rulerleft').css({ "width": "25px", "height": height });
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

    this.pageSplitters = function ($pageref) {

        $pageref.append("<div class='rpthead' data_val='0' style='width :100%'></div>");

        $pageref.append("<div class='pghead' data_val='1'style='width :100%'></div>");

        $pageref.append("<div class='pgbody' data_val='2'style='width :100%'></div>");

        $pageref.append("<div class='pgfooter' data_val='3'style='width :100%'></div>");

        $pageref.append("<div class='rptfooter' data_val='4' style='width :100%'></div>");

        $pageref.children().not(".gutter").each(this.set_Dropable.bind(this));
    };

    this.set_Dropable = function (i, obj) {

        var classname = $(obj).attr("class");
        $("." + classname).droppable({ accept: ".draggable,.dropped", drop: this.onDropFn.bind(this) });
        report.sections.push(new sub(classname, $(obj).index(), $(obj).height(), null));

    };

    this.splitButton = function () {

        $('.headersections').children().not(".gutter").each(this.addButton.bind(this));

    };

    this.addButton = function (i, obj) {

        this.j = 2;
        $(obj).append("<button class='btn btn-xs btn-primary'  id='btn" + i + "'><i class='fa fa-plus'></i></button>");
        $('#btn' + i).off("click").on("click", this.splitDiv.bind(this));

    };

    this.splitDiv = function (e) {

        this.splitarray = [];
        this.btn_indx = $(e.target).parent().parent().attr("data-index");
        $.each(this.report.sections, this.splitDiv_inner.bind(this));

    };

    this.splitDiv_inner = function (i, obj) {

        if (obj.index == this.btn_indx) {
            var $sec = $("." + obj.className);

            if ($sec.children().length === 0) {

                var s0 = $("<div class='s" + obj.index + "0'></div>");
                var s1 = $("<div class='s" + obj.index + "1'></div>");
                $sec.append(s0, s1);
                this.splitarray.push("." + s0.attr("class") + "", "." + s1.attr("class") + "");
                s0.droppable({ accept: ".draggable", drop: this.onDropFn.bind(this) });
            }

            else if ($sec.children().length !== 0) {

                this.$spl = $("<div class='s" + obj.index + this.j++ + "'></div>");
                $sec.append($spl);
                $.each($sec.children().not(".gutter"), this.splitMore.bind(this));
                $($sec).children('.gutter').remove();
                $spl.droppable({ accept: ".draggable", drop: this.onDropFn.bind(this) });
            }

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
            this.saveToObject($sec);
        }
    };

    this.saveToObject = function ($sec) {
        var temp = [];
        $sec.children().not(".gutter").each(function (i, obj) {
            temp.push(new sub($(this).attr("class"), $(this).index(), $(this).height(), null));

            $.each(report.sections, function (i, obj) {

                var sec1 = $sec.attr("class");

                if (sec1 === this.className) {
                    report.sections[i].subsection = temp;
                }
            });
        });
        this.multiSplitBoxinner();
    };

    this.splitMore = function (i, obj) {
        this.splitarray.push("." + obj.className);
    };

    this.headerScaling = function () {

        Split(['.rpthead', '.pghead', '.pgbody', '.pgfooter', '.rptfooter'], {
            direction: 'vertical',
            cursor: 'row-resize',
            sizes: [10, 10, 60, 10, 10],
            minSize: 0,
            gutterSize: 3,
            onDrag: function (e) {
                $('#box0,.rptheadHbox').css("height", $('.rpthead').height());
                $('#box1,.pgheadHbox').css("height", $('.pghead').height());
                $('#box2,.pgbodyHbox').css("height", $('.pgbody').height());
                $('#box3,.pgfooterHbox').css("height", $('.pgfooter').height());
                $('#box4,.rptfooterHbox').css("height", $('.rptfooter').height());
            }
        });

        Split(['.rptheadHbox', '.pgheadHbox', '.pgbodyHbox', '.pgfooterHbox', '.rptfooterHbox'], {
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
                    for (var k = 0; k < hLength; k++){
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
        if (temp1 != null) {
            console.log(temp1);
            Split(temp1, {
                direction: 'vertical',
                cursor: 'row-resize',
                minSize: 10,
                gutterSize: 3
            });
        }
    };

    this.DragDrop_DataSource = function () {

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
    };

    this.onDrag = function (event, ui) {
        
        this.posLeft = event.pageX;
        this.posTop = event.pageY;
        
    };

    this.onDropFn = function (event, ui) {             
        var itemToClone = $(ui.draggable);
        console.log(itemToClone);
        if (!itemToClone.hasClass("dropped")) {           
            $(event.target).append(itemToClone.clone().addClass("dropped").removeClass("draggable").css({
                width: itemToClone.width(),
                height: itemToClone.height(),
                position: 'absolute',
                left: this.posLeft - 268,
                top: this.posTop - 168
            }));
        }
        else if (itemToClone.hasClass("dropped")) {
            $(event.target).append(itemToClone.css({
                width: itemToClone.width(),
                height: itemToClone.height(),
                position: 'absolute',               
            }));
        }

        $('.dropped').draggable({
            cursor: 'move',
            drag: this.DragOnPage.bind(this),
            start: this.onDrag_Dropped.bind(this),
            stop: this.onDrag_stop.bind(this)
        });

        $('.dropped').resizable({
            containment: "parent",
            resize: this.resizeElement.bind(this)
        });
    };

    this.resizeElement = function (event, ui) {
      
        var font = parseInt($(event.target).css("height"));
        $(event.target).css("font-size", font - 5);

    };

    this.onDrag_stop = function (event,ui) {
        $(".vL").remove();
        $(".hL").remove();
    };

    this.onDrag_Dropped = function (event, ui) {
        console.log($(event.target).width());
        $(event.target).append("<div class='vL' style='width :1px;border-left:1px dotted;height:" + pages[type].height + ";margin-left:0px;margin-top:-" + this.posTop + "px'></div>");
        $(event.target).prepend("<div class='hL' style='height :1px;border-top:1px dotted;width:" + $(window).width() + "px;margin-top:0px;margin-left:-" + this.posLeft + "px'></div>");
    };

    this.DragOnPage = function (event, ui) {


    };

    this.init = function () {

        $('#PageContainer').empty();
        var $pageref = this.createPage(type);
        this.pageSplitters($pageref);
        this.headerBox1_Split();
        this.headerScaling();
        this.DragDrop_DataSource();

    };

    this.init();
};

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

        if (typeof o != 'undefined') {
            if (typeof o.openedClass != 'undefined') {
                openedClass = o.openedClass;
            }
            if (typeof o.closedClass != 'undefined') {
                closedClass = o.closedClass;
            }
        };
        var tree = $(this);
        tree.addClass("tree");
        tree.find('li').has("ul").each(function () {
            var branch = $(this);
            branch.prepend("<i class='indicator glyphicon " + closedClass + "'></i>");
            branch.addClass('branch');
            branch.on('click', function (e) {
                if (this == e.target) {
                    var icon = $(this).children('i:first');
                    icon.toggleClass(openedClass + " " + closedClass);
                    $(this).children().children().toggle();
                }
            })
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