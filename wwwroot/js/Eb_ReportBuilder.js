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
    this.sectionArray = [];

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
        EbTableCounter: 0,
        EbImgCounter: 0,
        EbDateTimeCounter: 0,
        EbPageXYCounter:0,
        EbPageNoCounter: 0       
    };
    this.subSecIdCounter = {
        Countrpthead :1,
        Countpghead: 1,
        Countpgbody: 1,
        Countpgfooter: 1,
        Countrptfooter: 1
    };
    this.ReportSections = {
        ReportHeader: 'rpthead',
        PageHeader: 'pghead',
        Detail: 'pgbody',
        PageFooter: 'pgfooter',
        ReportFooter: 'rptfooter'
    };

    this.msBoxSubNotation = {
        rpthead: 'Rh',
        pghead: 'Ph',
        pgbody: 'Dt',
        pgfooter: 'Pf',
        rptfooter: 'Rf'
    };

    this.pg = new Eb_PropertyGrid("propGrid");

    this.RefreshControl = function (obj) {         
        var NewHtml = obj.Html();
        var metas = AllMetas["Eb" + $("#" + obj.EbSid).attr("eb-type")];
        $.each(metas, function (i, meta) {
            var name = meta.name;
            if (meta.IsUIproperty) {
                NewHtml = NewHtml.replace('@' + name + ' ', obj[name]);                
            }
        });

        $("#" + obj.EbSid).replaceWith(NewHtml);
        $('.dropped').draggable({ cursor: "crosshair", containment: ".page", start: this.onDrag_Start.bind(this), stop: this.onDrag_stop.bind(this)});
        $(".droppable").droppable({ accept: ".draggable,.dropped,.shapes,.special-field", drop: this.onDropFn.bind(this) });
        $('.dropped').resizable({ containment: "parent", handles: "n, e, s, w", stop: this.onReSizeFn.bind(this)});
        $('.dropped').attr("tabindex", "1").attr("onclick", "$(this).focus()");
        $('.dropped').on("focus", this.elementOnFocus.bind(this)); 
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
        var PageContainer = $("<div id='PageContainer'></div>");
        $pageCanvas.append(PageContainer);
        this.createHeaderBox();
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
        }
    };

    this.pageSplitters = function () {
        for (var i in this.ReportSections) {
            var sec = "Eb" + i;
            var obj = new EbObjects[sec](this.ReportSections[i]);
            $("#" + this.page.Name).append(obj.Html());
            this.objCollection[this.ReportSections[i]] = obj; 
            this.sectionArray.push("#" + this.ReportSections[i]);
        }
        this.headerBox1_Split();
    };

    this.headerBox1_Split = function () {

        for (i = 0; i < 5; i++) {
            $(".headersections").append("<div class='head_Box1' id='" + this.sectionArray[i].slice(1) + "Hbox' data-index='" + i + "' style='width :100%'>"
                +"<p>" + this.msBoxSubNotation[this.sectionArray[i].slice(1)] + "</p></div>");
        }        
        this.headerScaling();
        this.splitButton();
    };

    this.headerScaling = function () {
        Split(this.sectionArray, {
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
            gutterSize: 3,
            onDrag: function (e) {
                $('#box0,#rpthead').css("height", $('#rptheadHbox').height());
                $('#box1,#pghead').css("height", $('#pgheadHbox').height());
                $('#box2,#pgbody').css("height", $('#pgbodyHbox').height());
                $('#box3,#pgfooter').css("height", $('#pgfooterHbox').height());
                $('#box4,#rptfooter').css("height", $('#rptfooterHbox').height());
            }         
        });
        Split(['#box0', '#box1', '#box2', '#box3', '#box4'], {
            direction: 'vertical',
            cursor: 'row-resize',
            sizes: [20, 20, 20, 20, 20],
            minSize: 0,
            gutterSize: 3,
            onDrag: function (e) {
                $('#rptheadHbox,#rpthead').css("height", $('#box0').height());
                $('#pgheadHbox,#pghead').css("height", $('#box1').height());
                $('#pgbodyHbox,#pgbody').css("height", $('#box2').height());
                $('#pgfooterHbox,#pgfooter').css("height", $('#box3').height());
                $('#rptfooterHbox,#rptfooter').css("height", $('#box4').height());
            }         
        });
        $(".multiSplit").children().not(".gutter").each(this.setFirstMsSubBoxDiv.bind(this));
        $("#" + this.page.Name).children().not(".gutter").each(this.setFirstSubDiv.bind(this));
    };

    this.setFirstMsSubBoxDiv = function (boxsub, obj) {
        var id = this.sectionArray[boxsub].slice(1) + "subBox" + 0;
        var MultiBoxSub = new EbObjects["EbMultiSplitBoxSub"](id);
        $(obj).append(MultiBoxSub.Html().replace("@SubDivName", this.msBoxSubNotation[this.sectionArray[boxsub].slice(1)] + "0"));                     
        $("#" + id).css("height", "100%")
    };

    this.setFirstSubDiv = function (i, obj) {
        var id = obj.id + "0";
        var SubSec_obj = new EbObjects["EbSubSection"](id);
        $(obj).append(SubSec_obj.Html());                       
        this.objCollection[id] = SubSec_obj;
        this.objCollection[id].SectionHeight = "100%";
        this.RefreshControl(SubSec_obj);        
        $("#" + id).on("focus", this.elementOnFocus.bind(this));
        $("#" + id).droppable({ accept: ".draggable,.dropped,.shapes,.special-field", drop: this.onDropFn.bind(this) });       
    };

    this.spliterDrag = function (e) {
        console.log($(e.target));
    };

    this.splitButton = function () {
        $('.headersections').children().not(".gutter").each(this.addButton.bind(this));
    };

    this.addButton = function (i, obj) {             
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
            var id = obj.id + (this.subSecIdCounter["Count" + obj.id])++;            
            if (this.$sec.children().length === 2) {
                $("#" + id).prev().removeAttr("height");
            } 
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
            
            this.objCollection[$("#" + id).siblings(":first").attr("id")].SectionHeight = this.getOuterHtml($("#" + id).siblings(":first"));           
            this.objCollection[id].SectionHeight = this.getOuterHtml($("#" + id));            
            this.multiSplitBoxinner();
        }
    };

    this.splitMore = function (i, obj) {
        this.splitarray.push("#" + obj.id);       
    };

    this.getOuterHtml = function (obj) {
        var html = obj.outerHTML();
        console.log(html);
        var calcHgt = html.substring(html.lastIndexOf("height:") + 8).split(";")[0];       
        return calcHgt;
    };

    this.multiSplitBoxinner = function () {
        var index = this.btn_indx;
        var temp1 = [];
        var msBoxSubNotationTemp = this.msBoxSubNotation;
        var SecArray = this.sectionArray;
        var flagsuccess = false;
        $('.multiSplit').children(".multiSplitHbox").eq(this.btn_indx).children().remove();
        $('.multiSplit').children(".multiSplitHbox").each(function (i, obj) {
            $('.page').children().not(".gutter").each(function (j, obj2) {
                var hLength = $(obj2).children().not(".gutter").length;
                if ($(obj).attr("data_val") === $(obj2).attr("data_val") && index === $(obj).attr("data_val")) {
                    for (var k = 0; k < hLength; k++) {
                        $(obj).removeAttr("tabindex").removeAttr("onclick");
                        var id = obj2.id + "subBox" + k;
                        var MultiBoxSub = new EbObjects["EbMultiSplitBoxSub"](id);
                        $(obj).append(MultiBoxSub.Html().replace("@SubDivName", msBoxSubNotationTemp[obj2.id] + k));
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
            cursor: "move"       
        });     
    };

    this.onDropFn = function (event, ui) {        
        this.posLeft = event.pageX;
        this.posTop = event.pageY;
        this.dropLoc = $(event.target);
        this.col = $(ui.draggable);              
        this.Objtype = this.col.attr('eb-type');
        var Objid = this.Objtype + (this.idCounter["Eb" + this.Objtype + "Counter"])++;
        var colVal = "T"+this.col.parent().parent().siblings("a").text().slice(-1) +"."+this.col.text().trim();
        var currTime = this.addCurrentDateTime();

        if (!this.col.hasClass('dropped')) {
            var obj = new EbObjects["Eb" + this.Objtype](Objid);            
            this.dropLoc.append(obj.Html());
            obj.Top = this.posTop - this.dropLoc.offset().top;          
            obj.Left = this.posLeft - this.dropLoc.offset().left;
            obj.ColVal = colVal;
            obj.CurrentTime = currTime;
            this.objCollection[Objid] = obj;           
            this.RefreshControl(obj);
            $('#' + Objid).attr("tabindex", "1").attr("onclick", "$(this).focus()");
            $('#' + Objid).on("focus", this.elementOnFocus.bind(this));
        }
        else if (this.col.hasClass('dropped')) {            
            this.dropLoc.append(this.col.css({ left: (this.posLeft - this.dropLoc.offset().left) - this.reDragLeft, top: (this.posTop - this.dropLoc.offset().top) - this.reDragTop}));
            var obj1 = this.objCollection[this.col.attr('id')];
            obj1.Top = this.col.position().top;
            obj1.Left = this.col.position().left;
            $('#'+this.col.attr('id')).resizable({ containment: "parent", handles: "n, e, s, w", stop: this.onReSizeFn.bind(this) });
        }
        $('.dropped').draggable({ cursor: "crosshair", containment: ".page",start: this.onDrag_Start.bind(this), stop: this.onDrag_stop.bind(this)});       
        $('.dropped').resizable({ containment: "parent", handles: "n, e, s, w", stop:this.onReSizeFn.bind(this)});
        //$('.dropped').attr("tabindex", "1").attr("onclick", "$(this).focus()");
        //$('.dropped').on("focus", this.elementOnFocus.bind(this));
    };

    this.onReSizeFn = function (event, ui) {        
        var resizeId = $(event.target).attr("id");
        this.objCollection[resizeId].Width = $(event.target).width();
        this.objCollection[resizeId].Height = $(event.target).height();
        this.RefreshControl(this.objCollection[resizeId]);
        var type = $(event.target).attr('eb-type');       
        this.pg.setObject(this.objCollection[resizeId], AllMetas["Eb" + type]);
    };

    this.elementOnFocus = function (event) {        
        event.stopPropagation();
        var curControl = $(event.target);       
        var id = curControl.attr("id");       
        var curObject = this.objCollection[id];       
        var type = curControl.attr('eb-type');
        $('#propGrid').show();
        this.pg.setObject(curObject, AllMetas["Eb" + type]);
        this.editElement(curControl);
    };

    this.editElement = function (control) {        
        this.control = control;      
        $("#delete").on('click',this.removeElementFn.bind(this));
        $("#alg-R").on('click', this.alignRightFn.bind(this));
        $("#alg-C").on('click', this.alignCenterFn.bind(this));
        $("#alg-L").on('click', this.alignLeftFn.bind(this));
        if (control.attr("eb-type") === "Img") {           
            $("#img-upload").click();
            this.addImageFn();                    
        }
    };

    this.removeElementFn = function () {
        this.control.remove();
    };
    this.alignRightFn = function () {
        this.control.css("text-align", "right");
    };
    this.alignCenterFn = function () {
        this.control.css("text-align", "center");
    };
    this.alignLeftFn = function () {
        this.control.css("text-align", "left");
    };

    this.addImageFn = function () {                       
        var imgDiv = this.control;
        $("#img-upload").change(function () {           
            var input = this;
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var img = $("<img id='demo' src='" + e.target.result + "' style='width:100px;height:inherit'/>");
                    imgDiv.append(img.addClass('image-reSize'));                    
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
        return time;
    };

    this.onDrag_stop = function (event, ui) {     
        //$(".vL").remove();
        //$(".hL").remove();
        var dragId = $(event.target).attr("id");
        var type = $(event.target).attr('eb-type');
        this.pg.setObject(this.objCollection[dragId], AllMetas["Eb" + type]);
    };

    this.onDrag_Start = function (event, ui) {           
        this.reDragLeft = event.pageX - $(event.target).offset().left;
        this.reDragTop = event.pageY - $(event.target).offset().top;       
        //$(event.target).append("<div class='vL' style='width :1px;border-left:1px dotted;height:" + pages[type].height + ";margin-left:0px;margin-top:-" + this.posTop + "px;'></div>");
        //$(event.target).prepend("<div class='hL' style='height :1px;border-top:1px dotted;width:" + $(window).width() + "px;margin-top:0px;margin-left:-" + this.posLeft + "px;'></div>");
    };

    this.savefile = function () {
        this.report = new Object();
        this.report = this.objCollection["page"];
        this.page.Height = $("#page").height();
        this.page.Width = $("#page").width();        
        $.each($('.page').children().not(".gutter"), this.findPageSections.bind(this));
        console.log(JSON.stringify(this.report));
        return this.report;
    };

    this.findPageSections = function (i, sections) {

        this.sections = $(sections).attr('id');
        this.i = i;
        this.objCollection[this.sections].Width = $("#" + this.sections).width();
        this.objCollection[this.sections].Height = $("#" + this.sections).height();
        this.report.SubSection.push(this.objCollection[this.sections]);
        $.each($("#" + this.sections).children().not(".gutter"), this.findPageSectionsSub.bind(this));

    };

    this.findPageSectionsSub = function (j, subsec) {

        this.subsec = $(subsec).attr("id");
        this.j = j;
        this.objCollection[this.subsec].Width = $("#" + this.subsec).width();
        this.objCollection[this.subsec].Height = $("#" + this.subsec).height();
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

        $('#PageContainer,.ruler,.rulerleft').empty();
        this.ruler();
        this.pgC = this.createPagecontainer();
        this.createPage(this.pgC);
        this.DragDrop_Items();       
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

