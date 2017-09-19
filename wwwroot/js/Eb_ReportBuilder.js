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

var RptBuilder = function (type, saveBtnid, commit, Isnew, custHeight, custWidth, custunit) {
    this.savebtnid = saveBtnid;
    this.type = type;
    this.Commitbtnid = commit;
    this.IsNew = Isnew;
    this.Rel_object;
    this.objCollection = {};
    this.splitarray = [];
    this.btn_indx = null;

    if (this.type === 'custom-size') {
        this.height = custHeight + custunit;
        this.width = custWidth + custunit;
    }
    else if (this.type !== 'custom-size') {
        this.height = pages[type].height;
        this.width = pages[type].width;
        $('#custom-size').hide();
    }

    this.idCounter = {
        EbCircleCounter: 0,
        EbReportColCounter: 0,
        EbRectCounter: 0,
        EbTableCounter: 0
    };

    this.ReportSections = {
        ReportHeader: 'rpthead',
        PageHeader: 'pghead',
        Detail: 'pgbody',
        PageFooter: 'pgfooter',
        ReportFooter: 'rptfooter'
    };

    this.pg = new Eb_PropertyGrid("propGrid");

    this.RefreshControl = function (obj) {        

        var NewHtml = obj.Html();
        var metas = AllMetas["Eb" + $("#" + obj.EbSid).attr("eb-type")];
        $.each(metas, function (i, meta) {
            var name = meta.name;
            if (meta.IsUIproperty) {
                NewHtml = NewHtml.replace('@' + name + ' ', obj[name]);
                //console.log('@' + name + ' ');
                //console.log(obj[name]);
            }
        });

        $("#" + obj.EbSid).replaceWith(NewHtml);
        $('.dropped').draggable({ cursor: "crosshair", containment: ".page", start: this.onDrag_Start.bind(this), stop: this.onDrag_stop.bind(this), drag: this.onDrag.bind(this) });
        $(".droppable").droppable({ accept: ".draggable,.dropped,.shapes,.special-field", drop: this.onDropFn.bind(this) });
        $('.dropped').resizable({containment: "parent",handles: "n, e, s, w"});
    };
    
    this.pg.PropertyChanged = function (obj) {
        this.RefreshControl(obj);
    }.bind(this);

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

        this.page = new EbObjects["EbReportPage"]("page");
        PageContainer.append(this.page.Html());
        this.page.PageSize = this.type;
        this.page.Height = this.height;
        this.page.Width = this.width;
        this.RefreshControl(this.page);
        this.objCollection["page"] = this.page;
        $('.title').show();

        this.pageSplitters();
    };

    this.createHeaderBox = function () {

        $headersection = $("<div class='headersections' style='height:" + this.height + ";'></div>");
        $("#PageContainer").append($headersection);
        $("#PageContainer").append("<div class='multiSplit' style='height:" + this.height + ";'></div>");

        for (var i = 0; i < 5; i++) {

            var obj = new EbObjects["EbMultiSplitBox"]("box" + i);
            $(".multiSplit").append(obj.Html().replace("@data", i));
            this.objCollection["box" + i] = obj;
            $("#box" + i).attr("tabindex", "1").attr("onclick", "$(this).focus()");
        }

    };

    this.pageSplitters = function () {

        for (var i in this.ReportSections) {
            var sec = "Eb" + i;
            var obj = new EbObjects[sec](this.ReportSections[i]);
            $("#" + this.page.Name).append(obj.Html());
            this.objCollection[this.ReportSections[i]] = obj;           
        }


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
        $("#" + this.page.Name).children().not(".gutter").each(this.set_Dropable.bind(this));
    };

    this.set_Dropable = function (i, obj) {

        var id = "s" + $(obj).attr('data_val') + "0";
        var SubSec_obj = new EbObjects["EbSubSection"](id);
        $(obj).append(SubSec_obj.Html());
        SubSec_obj.Height = "100";       
        this.objCollection[id] = SubSec_obj;
        this.RefreshControl(SubSec_obj);
        //$("#" + id).attr("tabindex", "1").attr("onclick", "$(this).focus()");
        $("#" + id).on("focus", this.elementOnFocus.bind(this));
        $("#" + id).droppable({ accept: ".draggable,.dropped,.shapes,.special-field", drop: this.onDropFn.bind(this) });
        
    };

    this.focusSection = function () {

        $("#box0").click(function () {
           $("#s00").attr("tabindex", "1").focus();           
        });
        $("#box1").click(function () {
            $("#s10").attr("tabindex", "1").focus();
        });
        $("#box2").click(function () {
            $("#s20").attr("tabindex", "1").focus();
        });
        $("#box3").click(function () {
            $("#s30").attr("tabindex", "1").focus();
        });
        $("#box4").click(function () {
            $("#s40").attr("tabindex", "1").focus();
        });

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
            var id = "s" + $(obj).attr('data_val') + this.j++;            
            this.$sec.children('.gutter').remove();
            var SubSec_obj = new EbObjects["EbSubSection"](id);
            this.$sec.append(SubSec_obj.Html());            
            this.objCollection[id] = SubSec_obj;

            $.each(this.$sec.children().not(".gutter"), this.splitMore.bind(this));           
            $("#" + id).droppable({ accept: ".draggable,.dropped,.shapes,.special-field", drop: this.onDropFn.bind(this) });

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
            this.objCollection[id].Height = $("#" + id).css("height");
            this.RefreshControl(this.objCollection[id]);
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

                        $(obj).removeAttr("tabindex").removeAttr("onclick");
                        var id = "subBox" + $(obj).attr("data_val") + k;
                        var MultiBoxSub = new EbObjects["EbMultiSplitBoxSub"](id);
                        $(obj).append(MultiBoxSub.Html().replace("@SubDivName", "s" + k));
                        $("#" + id).attr("tabindex", "1").attr("onclick", "$(this).focus()");
                        temp1.push("#" + id);                                               
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
        this.reDragLeft = null;
        this.reDragTop = null;

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
    };

    this.onDropFn = function (event, ui) {        
        this.posLeft = event.pageX;
        this.posTop = event.pageY;
        this.dropLoc = $(event.target);
        this.col = $(ui.draggable);
        this.col.attr("tabindex", "2").attr("onclick", "$(this).focus()");
        this.col.on("focus", this.elementOnFocus.bind(this));
        this.Objtype = this.col.attr('eb-type');
        var Objid = this.Objtype + (this.idCounter["Eb" + this.Objtype + "Counter"])++;
        var colVal = "T"+this.col.parent().parent().siblings("a").text().slice(-1) +"."+this.col.text().trim();
       
        if (!this.col.hasClass('dropped')) {
            var obj = new EbObjects["Eb" + this.Objtype](Objid);            
            this.dropLoc.append(obj.Html());
            obj.Top = this.posTop - this.dropLoc.offset().top;          
            obj.Left = this.posLeft - this.dropLoc.offset().left;
            obj.ColVal = colVal;           
            this.objCollection[Objid] = obj;
            this.RefreshControl(obj);
            $("#" + Objid).attr("tabindex", "2").attr("onclick", "$(this).focus()");
            $("#" + Objid).on("focus", this.elementOnFocus.bind(this));
        }
        else if (this.col.hasClass('dropped')) {            
            this.dropLoc.append(this.col.css({ left: (this.posLeft - this.dropLoc.offset().left) - this.reDragLeft, top: (this.posTop - this.dropLoc.offset().top) - this.reDragTop}));
            var obj1 = this.objCollection[this.col.attr('id')];
            obj1.Top = this.col.css("top");
            obj1.Left = this.col.css("left");           
        }
        $('.dropped').draggable({ cursor: "crosshair", containment: ".page",start: this.onDrag_Start.bind(this), stop: this.onDrag_stop.bind(this), drag: this.onDrag.bind(this)});       

        $('.dropped').resizable({
            containment: "parent",
            handles: "n, e, s, w"            
        });

        this.PropertyMenu();
    };

    this.elementOnFocus = function (event) {
       
        event.stopPropagation();
        var curControl = $(event.target);
        this.editElement(curControl);
        var id = curControl.attr("id");
        var curObject = this.objCollection[id];
        var type = curControl.attr('eb-type');
        $('#propGrid').show();
        this.pg.setObject(curObject, AllMetas["Eb" + type]);
    };

    this.editElement = function (control) {
        console.log(control);
        $("#delete").click(function() {control.remove();});
        $("#alg-R").click(function () {control.css("text-align","right");});
        $("#alg-c").click(function () {control.css("text-align", "center");});
        $("#alg-L").click(function () {control.css("text-align", "left");});
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

    this.onDrag_stop = function (event, ui) {     
        //$(".vL").remove();
        //$(".hL").remove();      
    };

    this.onDrag_Start = function (event, ui) {        
       
        this.reDragLeft = event.pageX - $(event.target).offset().left;
        this.reDragTop = event.pageY - $(event.target).offset().top;
        
        //$(event.target).append("<div class='vL' style='width :1px;border-left:1px dotted;height:" + pages[type].height + ";margin-left:0px;margin-top:-" + this.posTop + "px;'></div>");
        //$(event.target).prepend("<div class='hL' style='height :1px;border-top:1px dotted;width:" + $(window).width() + "px;margin-top:0px;margin-left:-" + this.posLeft + "px;'></div>");

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

        $(e.target).css("color", this.font_color);

    };

    this.element_off_Click = function () {
        $(this).css("background-color", "none");
    };

    this.savefile = function () {

        this.report = new Object();
        this.report = this.objCollection["page"];
        $.each($('.page').children().not(".gutter"), this.findPageSections.bind(this));
        console.log(JSON.stringify(this.report));
        return this.report;
    };

    this.findPageSections = function (i, sections) {

        this.sections = $(sections).attr('id');
        this.i = i;
        this.objCollection[this.sections].Height = $("#" + this.sections).css("height");
        this.report.SubSection.push(this.objCollection[this.sections]);
        $.each($("#" + this.sections).children().not(".gutter"), this.findPageSectionsSub.bind(this));

    };

    this.findPageSectionsSub = function (j, subsec) {

        this.subsec = $(subsec).attr("id");
        this.j = j;
        this.objCollection[this.subsec].Height = $("#" + this.subsec).css("height");
        this.report.SubSection[this.i].SubSection.push(this.objCollection[this.subsec]);
        $.each($("#" + this.subsec).children(), this.findPageElements.bind(this));

    };

    this.findPageElements = function (k, elements) {
        var elemId = $(elements).attr('id');
        this.report.SubSection[this.i].SubSection[this.j].SubSection.push(this.objCollection[elemId]);
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
        this.focusSection();
        $(this.savebtnid).on('click', this.savefile.bind(this));
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

