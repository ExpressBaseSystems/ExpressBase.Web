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
var ruler = {
    px: {
        minor :"tickMinor",
        major : "tickMajor",
        label : "tickLabel",
        len :5
    },
    cm: {
        minor :"tickMinor-cm",
        major : "tickMajor-cm",
        label : "tickLabel-cm",
        len : 3.77
    },
    inch: {
        minor : "tickMinor-inch",
        major :"tickMajor-inch",
        label : "tickLabel-inch",
        len: 9.6
    }
}

var RptBuilder = function (saveBtnid, commit, Isnew,edModObj) {
    this.edModObj = edModObj;
    this.savebtnid = saveBtnid; 
    this.Commitbtnid = commit;
    this.IsNew = Isnew;
    this.Rel_object;
    this.objCollection = {};
    this.splitarray = [];
    this.btn_indx = null;
    this.sectionArray = [];
    this.report = null;
    this.refId = null;
    this.height = null;
    this.width = null;
    this.type = "A4";
    this.rulertype = "cm";
    this.copyStack = null;
    this.copyORcut = null;
    this.idCounter = {
        EbCircleCounter: 0,
        EbReportColCounter: 0,
        EbRectCounter: 0,
        EbTableCounter: 0,
        EbImgCounter: 0,
        EbDateTimeCounter: 0,
        EbPageXYCounter:0,
        EbPageNoCounter: 0,
        EbTextCounter: 0,
        EbBarcodeCounter: 0,
        EbQRcodeCounter: 0
    };

    this.subSecIdCounter = {
        Countrpthead :1,
        Countpghead: 1,
        Countdetail: 1,
        Countpgfooter: 1,
        Countrptfooter: 1
    };

    this.ReportSections = {
        ReportHeader: 'rpthead',
        PageHeader: 'pghead',
        ReportDetail: 'detail',
        PageFooter: 'pgfooter',
        ReportFooter: 'rptfooter'
    };

    this.msBoxSubNotation = {
        rpthead: 'Rh',
        pghead: 'Ph',
        detail: 'Dt',
        pgfooter: 'Pf',
        rptfooter: 'Rf'
    };

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

        if (!('SectionHeight' in obj)) {
            $("#" + obj.EbSid).draggable({ cursor: "crosshair", containment: ".page", stack: ".dropped", start: this.onDrag_Start.bind(this), stop: this.onDrag_stop.bind(this) });                       
            $("#" + obj.EbSid).off('focusout').on("focusout", this.destroyResizable.bind(this));            
        }           
        if ('SectionHeight' in obj) {
            $("#" + obj.EbSid).droppable({ accept: ".draggable,.dropped", drop: this.onDropFn.bind(this) });
        }        
        $("#" + obj.EbSid).attr("tabindex", "1");
        $("#" + obj.EbSid).off("focus").on("focus", this.elementOnFocus.bind(this));        
    };//render after pgchange

    this.getDataSourceColoums = function (refid) {
        if (refid !== "") {
            $('#data-table-list').empty();
            $("#get-col-loader").show();
            $.ajax({
                url: "../RB/GetColumns",
                type: "POST",
                cache: false,
                data: { refID: refid },
                success: function (result) {
                    $("#get-col-loader").hide();
                    DrawColTree(result);
                }
            });
        }
    };//ajax for ds coloums

    this.ruler = function () {        
        var k = 0;
        var j = 0;
        var pxlabel = 1;
        if (this.rulertype == "px") { pxlabel = 5;}
        
        $('.ruler,.rulerleft').show();
        var $ruler = $('.ruler').css({ "width": this.width });
        for (var i = 0, step = 0; i < $ruler.innerWidth() /ruler[this.rulertype].len; i++ , step++) {            
            var $tick = $('<div>');
            if (step === 0) {
                if (this.rulertype === "px") {
                    $tick.addClass(ruler[this.rulertype].label).html(i*5);
                }
                else { $tick.addClass(ruler[this.rulertype].label).html(j++);}
                
            } else if ([1, 3, 5, 7, 9].indexOf(step) > -1) {
                $tick.addClass(ruler[this.rulertype].minor);
                if (step === 9) {
                    step = -1;
                }
            } else {
                $tick.addClass(ruler[this.rulertype].major);
            }
            $ruler.append($tick);
        }

        var $rulerleft = $('.rulerleft').css({ "height": this.height });
        for (i = 0, step = 0; i < $rulerleft.innerHeight() / ruler[this.rulertype].len; i++ , step++) {            
            $tick = $('<div>');
            if (step === 0) {
                if (this.rulertype === "px") {
                    $tick.addClass(ruler[this.rulertype].label).html(i*5);
                }
                else { $tick.addClass(ruler[this.rulertype].label).html(k++);}
               
            } else if ([1, 3, 5, 7, 9].indexOf(step) > -1) {
                $tick.addClass(ruler[this.rulertype].minor);
                if (step === 9) {
                    step = -1;
                }
            } else {
                $tick.addClass(ruler[this.rulertype].major);
            }
            $rulerleft.append($tick);
        }
    };

    this.createPagecontainer = function () {
        var $pageCanvas = $('#pageCanvas');
        $pageCanvas.empty();       
        var PageContainer = $("<div id='PageContainer' style='margin-top: 20px;'></div>");
        $pageCanvas.append(PageContainer);
        this.createHeaderBox();
        return PageContainer;
    };

    this.createPage = function (PageContainer) {        
        PageContainer.append("<div class='page' id='page' style='width:" + this.width + ";height:" + this.height +"'>")
        $('.title').show();
        this.pageSplitters();
    };

    this.createHeaderBox = function () {
        $headersection = $("<div class='headersections' style='height:" + this.height + ";'></div>");
        $("#PageContainer").append($headersection);
        $("#PageContainer").append("<div class='multiSplit' style='height:" + this.height + ";'></div>");
        for (var i = 0; i < 5; i++) {
            $(".multiSplit").append("<div class='multiSplitHbox' data_val='"+i+"' eb-type='MultiSplitBox' id='box"+i+"' style='width: 100%;'></div>");                   
        }
    };

    this.pageSplitters = function () {
        for (var i in this.ReportSections) {
            var sec = "Eb" + i;
            var obj = new EbObjects[sec](this.ReportSections[i]);
            $("#page").append(obj.Html());
            //obj.BackColor = "transparent";
            //this.RefreshControl(obj);
            this.sectionArray.push("#" + this.ReportSections[i]);           
        }
        this.headerBox1_Split();
    };//add page sections

    this.headerBox1_Split = function () {
        for (i = 0; i < 5; i++) {
            $(".headersections").append("<div class='head_Box1' id='" + this.sectionArray[i].slice(1) + "Hbox' data-index='" + i + "' style='width :100%'>"
                +"<p>" + this.msBoxSubNotation[this.sectionArray[i].slice(1)] + "</p></div>");
        }        
        this.headerScaling();
        this.splitButton();
    };
    
    this.headerScaling = function () {
        var _this = this;
        Split(this.sectionArray, {
            direction: 'vertical',
            cursor: 'row-resize',
            sizes: [20, 20, 20, 20, 20],
            minSize: 33,
            gutterSize: 5,
            onDrag: function (e) {
                $('#box0,#rptheadHbox').css("height", $('#rpthead').height());
                $('#box1,#pgheadHbox').css("height", $('#pghead').height());
                $('#box2,#detailHbox').css("height", $('#detail').height());
                $('#box3,#pgfooterHbox').css("height", $('#pgfooter').height());
                $('#box4,#rptfooterHbox').css("height", $('#rptfooter').height());
                _this.splitterOndragFn();
            }         
        });
        Split(['#rptheadHbox', '#pgheadHbox', '#detailHbox', '#pgfooterHbox', '#rptfooterHbox'], {
            direction: 'vertical',
            cursor: 'row-resize',
            sizes: [20, 20, 20, 20, 20],
            minSize: 33,
            gutterSize: 5,
            onDrag: function (e) {
                $('#box0,#rpthead').css("height", $('#rptheadHbox').height());
                $('#box1,#pghead').css("height", $('#pgheadHbox').height());
                $('#box2,#detail').css("height", $('#detailHbox').height());
                $('#box3,#pgfooter').css("height", $('#pgfooterHbox').height());
                $('#box4,#rptfooter').css("height", $('#rptfooterHbox').height());
                _this.splitterOndragFn();
            }         
        });
        Split(['#box0', '#box1', '#box2', '#box3', '#box4'], {
            direction: 'vertical',
            cursor: 'row-resize',
            sizes: [20, 20, 20, 20, 20],
            minSize: 33,
            gutterSize: 5,
            onDrag: function (e) {
                $('#rptheadHbox,#rpthead').css("height", $('#box0').height());
                $('#pgheadHbox,#pghead').css("height", $('#box1').height());
                $('#detailHbox,#detail').css("height", $('#box2').height());
                $('#pgfooterHbox,#pgfooter').css("height", $('#box3').height());
                $('#rptfooterHbox,#rptfooter').css("height", $('#box4').height());
                _this.splitterOndragFn();
            }         
        });        
        $("#page").children().not(".gutter").each(this.setFirstSubDiv.bind(this));
        $(".multiSplit").children().not(".gutter").each(this.setFirstMsSubBoxDiv.bind(this));
    };//page sections splited using split.js

    this.setFirstMsSubBoxDiv = function (boxsub, obj) {
        var id = this.sectionArray[boxsub].slice(1) + "subBox" + 0;
        $(obj).append("<div class='multiSplitHboxSub' eb-type='MultiSplitBox' id='" + id + "' style='width: 100%;height:100%'>"
            + "<p> " + this.msBoxSubNotation[this.sectionArray[boxsub].slice(1)] + "0" + " </p></div>"); 
        var focid = id.substring(0, id.indexOf('s')) + id.slice(-1);
        $("#" + id).attr("onclick", "$('#" + focid +"').focus();");       
    };

    this.setFirstSubDiv = function (i, obj) {
        var id = obj.id + "0";
        var objType = $(obj).attr("eb-type");
        var SubSec_obj = new EbObjects["Eb" + objType](id);        
        $(obj).append(SubSec_obj.Html());
        SubSec_obj.SectionHeight = "100%";
        SubSec_obj.BackColor = "transparent";        
        this.objCollection[id] = SubSec_obj;        
        this.RefreshControl(SubSec_obj);
        this.pg.addToDD(SubSec_obj);                       
    }; //first sub section auto

    this.splitButton = function () {
        $('.headersections').children().not(".gutter").each(this.addButton.bind(this));
    };

    this.addButton = function (i, obj) {             
        $(obj).append("<button class='btn btn-xs'  id='btn" + i + "'><i class='fa fa-plus'></i></button>");       
        $('#btn' + i).off("click").on("click", this.splitDiv.bind(this));
    };//split button

    this.splitDiv = function (e) {        
        this.splitarray = [];
        this.btn_indx = $(e.target).parent().parent().attr("data-index");
        $.each($('.page').children('.pageHeaders'), this.splitDiv_inner.bind(this));
    };

    this.splitDiv_inner = function (i, obj) {
        if ($(obj).attr('data_val') === this.btn_indx) {
            this.$sec = $("#" + obj.id);
            var id = obj.id + (this.subSecIdCounter["Count" + obj.id])++;            
            var objType = $(obj).attr("eb-type");            
            this.$sec.children('.gutter').remove();
            var SubSec_obj = new EbObjects["Eb" + objType](id);
            this.$sec.append(SubSec_obj.Html());
            SubSec_obj.BackColor = "transparent";
            this.objCollection[id] = SubSec_obj;                                 
            this.RefreshControl(SubSec_obj);
            this.pg.addToDD(SubSec_obj);
            $.each(this.$sec.children().not(".gutter"), this.splitMore.bind(this));                                  
            Split(this.splitarray, {
                direction: 'vertical',
                cursor: 'row-resize',
                minSize: 30,
                gutterSize: 5,
                onDrag: this.splitterOndragFn.bind(this)
            });
            $.each($("#" + id).siblings().not(".gutter"), this.setSectionHeight.bind(this,id));                       
            this.multiSplitBoxinner();           
        }
    };//split sections multipple

    this.setSectionHeight = function (id,i, subsections) {
        this.objCollection[subsections.id].SectionHeight = this.getOuterHtml($(subsections));        
        this.objCollection[id].SectionHeight = this.getOuterHtml($("#" + id)); 
    };//set section height

    this.splitMore = function (i, obj) {
        this.splitarray.push("#" + obj.id);       
    };//subsection pushed into split array 

    this.getOuterHtml = function (obj) {
        var html = obj.outerHTML();        
        var calcHgt = html.substring(html.lastIndexOf("height:") + 8).split(";")[0];       
        return calcHgt;
    };//cut height of subsec frm html string

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
                        var id = obj2.id + "subBox" + k;                        
                        $(obj).append("<div class='multiSplitHboxSub' eb-type='MultiSplitBox' id='" + id + "' style='width: 100%;'>"
                            + "<p> " + msBoxSubNotationTemp[obj2.id] + k + " </p></div>");                                         
                        temp1.push("#" + id);
                        var focid = id.substring(0, id.indexOf('s')) + id.slice(-1);
                        $("#" + id).attr("onclick", "$('#" + focid + "').focus();");
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
                minSize: 30,
                gutterSize: 5                
            });
        }        
    };

    this.splitterOndragFn = function () {
        $('.multiSplit').children().not(".gutter").children().not(".gutter").each(function (i, obj1) {
            $('.page').children().not(".gutter").children().not(".gutter").each(function (j, obj2) {
                if ($(obj1).parent().attr("data_val") === $(obj2).parent().attr("data_val")) {
                    if ($(obj1).index() === $(obj2).index()) {
                        $(obj1).css("height", $(obj2).height());
                    }
                }
            });
        });
    };//spliter ondrag func

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
            appendTo: "body",
            drag: function (event, ui) {
                $(ui.helper).css({ "background": "white", "border": "1px dotted black", "width":"auto"});
                $(ui.helper).children(".shape-text").remove();
                $(ui.helper).children().find('i').css({ "font-size": "50px", "background-color": "transparent" });
            },
            start:this.dragStartFirst.bind(this)
        });     
    };//drag drop starting func

    this.dragStartFirst = function (event,ui) {
        this.positionTandL = {};
        this.positionTandL['left'] = event.pageX - $(event.target).offset().left;
        this.positionTandL['top'] = event.pageY - $(event.target).offset().top;
    };

    this.onDropFn = function (event, ui) {        
        this.posLeft = event.pageX;
        this.posTop = event.pageY;
        this.dropLoc = $(event.target);
        this.col = $(ui.draggable);              
        this.Objtype = this.col.attr('eb-type');        
        var Title = "";
        if (this.Objtype === 'DateTime') {
            Title = this.addCurrentDateTime();
        }
        else if (this.Objtype === 'ReportCol'){          
            Title = "T" + this.col.parent().parent().siblings("a").text().slice(-1) + "." + this.col.text().trim();
        } 
        else {
            Title = this.col.text().trim();
        }
        if (!this.col.hasClass('dropped')) {
            var Objid = this.Objtype + (this.idCounter["Eb" + this.Objtype + "Counter"])++;
            var obj = new EbObjects["Eb" + this.Objtype](Objid);            
            this.dropLoc.append(obj.Html());
            if (this.col.hasClass('coloums')) {                 
                obj.Top = (this.posTop - this.dropLoc.offset().top) - PosOBjOFdrag['top'];
                obj.Left = (this.posLeft - this.dropLoc.offset().left) - PosOBjOFdrag['left'];
            }
            else {
                obj.Top = (this.posTop - this.dropLoc.offset().top) - this.positionTandL['top'];
                obj.Left = (this.posLeft - this.dropLoc.offset().left) - this.positionTandL['left'];
            }           
            obj.Title = Title;            
            this.objCollection[Objid] = obj;           
            this.RefreshControl(obj);           
        }
        else if (this.col.hasClass('dropped')) {            
            this.dropLoc.append(this.col.css({ left: (this.posLeft - this.dropLoc.offset().left) - this.reDragLeft, top: (this.posTop - this.dropLoc.offset().top) - this.reDragTop}));
            var obj1 = this.objCollection[this.col.attr('id')];
            obj1.Top = this.col.position().top;
            obj1.Left = this.col.position().left;            
        }                
    };//on drop func of dropable

    this.onReSizeFn = function (event, ui) {        
        var resizeId = $(event.target).attr("id");
        this.objCollection[resizeId].Width = $(event.target).width();
        this.objCollection[resizeId].Height = $(event.target).height();
        this.RefreshControl(this.objCollection[resizeId]);
        var type = $(event.target).attr('eb-type');       
        this.pg.setObject(this.objCollection[resizeId], AllMetas["Eb" + type]);
    };//on resize event

    this.elementOnFocus = function (event) {        
        event.stopPropagation();
        var curControl = $(event.target);       
        var id = curControl.attr("id");       
        var curObject = this.objCollection[id];       
        var type = curControl.attr('eb-type');        
        this.pg.setObject(curObject, AllMetas["Eb" + type]);
        if (!curControl.hasClass("pageHeaders")) {
            this.editElement(curControl);
            this.contextMenu(curControl);
            this.Resizable(curControl);
        }
    };//obj send to pg on focus

    this.Resizable = function (object) {
        if (object.hasClass('arrow')) {
            object.resizable({
                containment: "parent", handles: "e,w", stop: this.onReSizeFn.bind(this)
            });
        }
        else {
            object.resizable({
                containment: "parent", handles: "n, s,e,w, ne, se, sw, nw", stop: this.onReSizeFn.bind(this)
            });
        }
    }

    this.destroyResizable = function (event) {
        $(event.target).resizable("destroy");
    }

    this.contextMenu = function (curControl) {
        var selector = curControl.attr('id');
        $.contextMenu({
            selector: '#' + selector,
            autoHide: true,
            items: {                
                "copy": { name: "Copy", icon: "copy", callback:this.contextMenucopy.bind(this) },
                "cut": { name: "Cut", icon: "cut", callback: this.contextMenucut.bind(this)},               
                "paste": { name: "Paste", icon: "paste", callback: this.contextMenupaste.bind(this) },
                "delete": { name: "Delete", icon: "delete", callback: this.contextMenudelete.bind(this) }                
            }
        });
    };

    this.contextMenucopy = function (eType, selector, action, originalEvent) {        
        if (!$(selector.selector).hasClass("pageHeaders")) {
            this.copyStack = this.objCollection[$(selector.selector).attr('id')];
            this.copyORcut = 'copy';
        }
        else
            alert("section cannot copy!")
    };
    this.contextMenucut = function (eType, selector, action, originalEvent) {
        if (!$(selector.selector).hasClass("pageHeaders")) {
            this.copyStack = this.objCollection[$(selector.selector).attr('id')];
            this.copyORcut = 'cut';
            $(selector.selector).remove();
        }
        else
            alert("section cannot cut!")
    };
    this.contextMenupaste = function (eType, selector, action, originalEvent) {
        if (this.copyStack === null) { alert('no item copied'); }
        else {
            var copy = this.copyStack;            
            var Objtype = $("#" + copy.EbSid).attr('eb-type');
            var Objid = Objtype + (this.idCounter["Eb" + Objtype + "Counter"])++;
            if (this.copyORcut === 'copy') { copy.EbSid = Objid; }                       
            copy.Top = action.originalEvent.pageY - $(selector.selector).offset().top;
            copy.Left = action.originalEvent.pageX - $(selector.selector).offset().left;
            $(selector.selector).append(copy.Html());
            if (this.copyORcut === 'copy') { this.objCollection[Objid] = copy; }          
            this.RefreshControl(copy);
            this.copyStack = null;
            this.copyORcut = null;
        }        
    };
    this.contextMenudelete = function (eType, selector, action, originalEvent) {
        if (!$(selector.selector).hasClass("pageHeaders")) {
            $(selector.selector).remove();
        }
        else
            alert('no permission');
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
        control.on('keydown', this.keyBoardShortcuts.bind(this)); 

    };//control edit options

    this.keyBoardShortcuts = function (event) {
        if (event.key === "Delete") {
            this.control.remove();
        }
        else if (event.key === "Control"){
            this.control.toggleClass("marked");
        }       
    };   

    this.removeElementFn = function (e) {
        if (!$(e.target).hasClass("pageHeaders")){
            this.control.remove();
        }
        else {
            alert("no permission");
        }
    };

    this.alignRightFn = function (e) {
        this.control.css("text-align", "right");
    };

    this.alignCenterFn = function (e) {
        this.control.css("text-align", "center");
    };

    this.alignLeftFn = function (e) {
        this.control.css("text-align", "left");
    };

    this.addImageFn = function (e) {                       
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
    };//drag start fn of control

    this.onDrag_Start = function (event, ui) {           
        this.reDragLeft = event.pageX - $(event.target).offset().left;
        this.reDragTop = event.pageY - $(event.target).offset().top;       
        //$(event.target).append("<div class='vL' style='width :1px;border-left:1px dotted;height:500px;margin-left:0px;margin-top:-" + event.pageY + "px;'></div>");
        //$(event.target).prepend("<div class='hL' style='height :1px;border-top:1px dotted;width:500px;margin-top:0px;margin-left:-" + event.pageX + "px;'></div>");
    };//drag stop fn of control

    this.savefile = function () {       
        this.report.Height = $("#page").height();
        this.report.Width = $("#page").width();
        this.report.PaperSize = this.type;
        $.each($('.page').children().not(".gutter"), this.findPageSections.bind(this));
        if (this.IsNew === "true") {
            var Obj_Id = null;
        }
        var Name = this.report.ReportName;
        var Description = this.report.Description;
        this.Rel_object = "";
        $.post("../RB/SaveReport", {
            "id": Obj_Id,
            "name": Name,
            "description": Description,
            "json": JSON.stringify(this.report),
            "rel_obj": this.Rel_object
        });
    };//save
  
    this.findPageSections = function (i, sections) {
        this.sections = $(sections).attr('id');        
        $.each($("#" + this.sections).children().not(".gutter"), this.findPageSectionsSub.bind(this));
    };//........save/commit

    this.findPageSectionsSub = function (j, subsec) {
        this.subsec = $(subsec).attr("id");
        var eb_type = $(subsec).attr("eb-type");
        this.j = j;
        this.objCollection[this.subsec].Width = $("#" + this.subsec).width();
        this.objCollection[this.subsec].Height = $("#" + this.subsec).height();             
        if (eb_type === 'ReportHeader') {
            this.report.ReportHeaders.push(this.objCollection[this.subsec]);
        }
        else if (eb_type === 'PageHeader') {
            this.report.PageHeaders.push(this.objCollection[this.subsec]);
        }
        else if (eb_type === 'ReportFooter') {
            this.report.ReportFooters.push(this.objCollection[this.subsec]);
        }
        else if (eb_type === 'PageFooter') {
            this.report.PageFooters.push(this.objCollection[this.subsec]);
        }
        else if (eb_type === 'ReportDetail') {
            this.report.Detail = this.objCollection[this.subsec];
        }

        $.each($("#" + this.subsec).children(), this.findPageElements.bind(this));
    };//.........save/commit

    this.findPageElements = function (k, elements) {
        var elemId = $(elements).attr('id');
        var eb_typeCntl = $("#" + this.subsec).attr("eb-type");
        if (eb_typeCntl === 'ReportHeader') {
            this.report.ReportHeaders[this.j].Fields.push(this.objCollection[elemId]);
        }
        else if (eb_typeCntl === 'PageHeader') {
            this.report.PageHeaders[this.j].Fields.push(this.objCollection[elemId]);
        }
        else if (eb_typeCntl === 'ReportFooter') {
            this.report.ReportFooters[this.j].Fields.push(this.objCollection[elemId]);
        }
        else if (eb_typeCntl === 'PageFooter') {
            this.report.PageFooters[this.j].Fields.push(this.objCollection[elemId]);
        }
        else if (eb_typeCntl === 'ReportDetail') {
            this.report.Detail.Fields.push(this.objCollection[elemId]);
        }              
    };//........save/commit

    this.Commit = function () {
        this.report.Height = $("#page").height();
        this.report.Width = $("#page").width();
        this.report.PaperSize = this.type;
        $.each($('.page').children().not(".gutter"), this.findPageSections.bind(this));      
        if (this.IsNew === "true") {
            var Obj_Id = null;
        }
        var Name = this.report.ReportName;
        var Description = this.report.Description;
        this.Rel_object = "";
        $.post("../RB/CommitReport", {
            "id": Obj_Id,
            "name": Name,
            "description": Description,
            "changeLog": "changed",
            "json": JSON.stringify(this.report),
            "rel_obj": this.Rel_object
        });
    };//commit

    this.setpageSize = function (obj) {         
        if (obj.PaperSize !== "Custom") {
            this.height = pages[obj.PaperSize].height;
            this.width = pages[obj.PaperSize].width;
            $('.ruler,.rulerleft').empty();
            this.ruler();
            $(".headersections,.multiSplit").css({ "height": this.height });
            $("#page").css({ "height": this.height, "width": this.width });
            this.type = obj.PaperSize;
        }       
        else if (obj.PaperSize === "Custom") {
            if (obj.CustomPaperHeight !== 0 && obj.CustomPaperWidth !== 0) {
                this.height = obj.CustomPaperHeight;
                this.width = obj.CustomPaperWidth;
                $('.ruler,.rulerleft').empty();
                this.ruler();
                $(".headersections,.multiSplit").css({ "height": this.height });
                $("#page").css({ "height": this.height, "width": this.width });
                this.type = obj.PaperSize;
            }
        }       
    };//page size change fn

    this.setpageMode = function (obj) {
        if (obj.IsLandscape === true) {
            this.height = pages[obj.PaperSize].width;
            this.width = pages[obj.PaperSize].height;
        }
        else if (obj.IsLandscape === false) {
            this.height = pages[obj.PaperSize].height;
            this.width = pages[obj.PaperSize].width;
        }
        $('.ruler,.rulerleft').empty();
        this.ruler();
        $(".headersections,.multiSplit").css({ "height": this.height });
        $("#page").css({ "height": this.height, "width": this.width });
    };//page layout lands/port

    this.setSplitArrayFSec = function (i, obj) {
        this.idArray.push("#" + obj.id); 
        var size = (($(obj).height() / $(obj).parent().height()) * 100) + .5;        
        this.sizeArray.push(size);
        console.log(this.sizeArray);
        $(obj).siblings(".gutter").remove();        
        this.objCollection[obj.id].SectionHeight = size + "%";
    };//section split for pg change
    this.rulerChangeFn = function (e) {
        this.rulertype = $(e.target).val();
        $('.ruler,.rulerleft').empty();
        this.ruler();
    };

    this.minimap = function () {
        var previewPage = $('.page').minimap({            
            heightRatio: 0.25,
            widthRatio: 0.1,
            offsetHeightRatio: 0.7,
            offsetWidthRatio: 0.02,
            position: "left",
            touch: true,
            smoothScroll: true,
            smoothScrollDelay: 200,            
        });       
    };

    this.init = function () {
        this.pg = new Eb_PropertyGrid("propGrid");//propGrid initialized        
        this.pg.PropertyChanged = function (obj,pname) {
            if ('SectionHeight' in obj) {
                this.sizeArray = [];
                this.idArray = []
                $("#" + obj.EbSid).parent().children().not(".gutter").each(this.setSplitArrayFSec.bind(this));
                this.RefreshControl(obj);
                Split(this.idArray, {
                    direction: 'vertical',
                    cursor: 'row-resize',
                    sizes: this.sizeArray,
                    minSize: 30,
                    gutterSize: 5,
                    onDrag: this.splitterOndragFn.bind(this)
                });                
                //$("#" + obj.EbSid).on("focus", this.elementOnFocus.bind(this));
            }           
            if (pname === "DataSourceRefId") {             
                    this.getDataSourceColoums(obj.DataSourceRefId);                                                             
            }
            if (pname === "PaperSize") {
                this.setpageSize(obj);
            }
            if (pname === "IsLandscape") {
                this.setpageMode(obj);
            }
            this.RefreshControl(obj); 
        }.bind(this);        
            this.report = new EbObjects["EbReport"]("Report1");
            this.report.Height,this.height = pages["A4"].height;
            this.report.Width,this.width = pages["A4"].width;
            this.report.PaperSize = this.type;
            this.pg.setObject(this.report, AllMetas["EbReport"]);
            this.pg.addToDD(this.report);          
            $('#PageContainer,.ruler,.rulerleft').empty();
            this.ruler();
            this.pgC = this.createPagecontainer();
            this.createPage(this.pgC);
            this.DragDrop_Items();
            //this.minimap();
        $("#rulerUnit").on('change', this.rulerChangeFn.bind(this));                         
        $(this.savebtnid).on('click', this.savefile.bind(this));
        $(this.Commitbtnid).on('click', this.Commit.bind(this));        
    };//report executioin start func

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

