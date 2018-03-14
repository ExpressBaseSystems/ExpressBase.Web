
var summaryFunc = {
    0: "Average",
    1: "Count",
    2: "Max",
    3: "Min",
    4: "Sum"
}
var RptBuilder = function (refid, ver_num, type, dsobj, cur_status, tabNum, ssurl) {
    const containment = ".page";
    this.EbObject = dsobj;
    this.isNew = $.isEmptyObject(this.EbObject) ? true : false;
    this.objCollection = {};
    this.splitarray = [];
    this.btn_indx = null;
    this.sectionArray = [];
    this.RefId = refid;
    this.height = null;
    this.width = null;
    this.type = 2;
    this.rulertype = "cm";
    this.copyStack = null;
    this.copyORcut = null;

    this.repExtern = new ReportExtended(this);
    this.RbCommon = new RbCommon(this);
    this.pg = new Eb_PropertyGrid("propGrid");

    this.idCounter = this.RbCommon.EbidCounter;
    this.subSecIdCounter = this.RbCommon.subSecCounter;
    this.EbObjectSections = this.RbCommon.EbObjectSections;
    this.msBoxSubNotation = this.RbCommon.msBoxSubNotation;
    this.pages = this.RbCommon.pages;
    this.TextAlign = this.RbCommon.TextAlign;
    this.rulerTypesObj = this.RbCommon.EbRuler;
    
    this.RefreshControl = function (obj) {        
        var NewHtml = obj.$Control.outerHTML();
        var metas = AllMetas["Eb" + $("#" + obj.EbSid).attr("eb-type")];
        $.each(metas, function (i, meta) {
            var name = meta.name;
            if (meta.IsUIproperty) {
                NewHtml = NewHtml.replace('@' + name + ' ', obj[name]);
            }
        });
        $("#" + obj.EbSid).replaceWith(NewHtml);
        if ('Font' in obj)
            this.repExtern.setFontProp(obj);

        if (!('SectionHeight' in obj)) {
            $("#" + obj.EbSid).draggable({
                cursor: "crosshair", containment: containment,
                start: this.onDrag_Start.bind(this), stop: this.onDrag_stop.bind(this), drag: this.ondragControl.bind(this)
            });
            $("#" + obj.EbSid).off('focusout').on("focusout", this.destroyResizable.bind(this));
        }
        if ('SectionHeight' in obj) {
            $("#" + obj.EbSid).droppable({ accept: ".draggable,.dropped,.coloums", drop: this.onDropFn.bind(this) });
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
                    $('.nav-tabs a[href="#data"]').tab('show');
                }
            });
        }
    };//ajax for ds coloums

    this.ruler = function () {
        var width = this.width.slice(0, -2) > 794 ? ($('#PageContainer').width() - 79) + 'px' : this.width ;
        var k = 0,j = 0;
        var pxlabel = this.rulertype == "px" ? 5 : 1 ;
        $('.ruler,.rulerleft').show();
        var $ruler = $('.ruler').css({ "width": width });
        for (var i = 0, step = 0; i < $ruler.innerWidth() / this.rulerTypesObj[this.rulertype].len; i++ , step++) {
            var $tick = $('<div>');
            if (step === 0) {
                if (this.rulertype === "px")
                    $tick.addClass(this.rulerTypesObj[this.rulertype].label).html(i * 5);
                else
                    $tick.addClass(this.rulerTypesObj[this.rulertype].label).html(j++);
            }
            else if ([1, 3, 5, 7, 9].indexOf(step) > -1) {
                $tick.addClass(this.rulerTypesObj[this.rulertype].minor);
                if (step === 9) {
                    step = -1;
                }
            }
            else 
                $tick.addClass(this.rulerTypesObj[this.rulertype].major);
            $ruler.append($tick);
        }

        var $rulerleft = $('.rulerleft').css({ "height": this.height });
        for (i = 0, step = 0; i < $rulerleft.innerHeight() / this.rulerTypesObj[this.rulertype].len; i++ , step++) {
            $tick = $('<div>');
            if (step === 0) {
                if (this.rulertype === "px")
                    $tick.addClass(this.rulerTypesObj[this.rulertype].label).html(i * 5);
                else
                    $tick.addClass(this.rulerTypesObj[this.rulertype].label).html(k++);
            }
            else if ([1, 3, 5, 7, 9].indexOf(step) > -1) {
                $tick.addClass(this.rulerTypesObj[this.rulertype].minor);
                if (step === 9) {
                    step = -1;
                }
            }
            else
                $tick.addClass(this.rulerTypesObj[this.rulertype].major);
            $rulerleft.append($tick);
        }
    };

    this.createPage = function () {
        this.createHeaderBox();
        $("#PageContainer").append(`<div class='page' id='page' style='position:relative;width:${this.width};height:${this.height}'></div>
                                    <div class='page-reportLayer' id='page-reportLayer' style='display:none;position:relative;width:${this.width};height:${this.height}'></div>`);
        $(".page").resizable({
            handles: "s",
            resize: this.onPageResize.bind(this)
        });       
        $(".page-reportLayer").droppable({ accept: ".draggable-to-page,.dropped", drop: this.onDropFn.bind(this) }); 
        $(".page .ui-resizable-s").addClass("pageReSizeHandle");
        this.pageSplitters();
    };
    
    this.onPageResize = function () {
        $('.headersections,.multiSplit').css("height", $('.page').height());
        $(".rulerleft").css("height", $('.page').height());
        this.repExtern.OndragOfSections();
    }

    this.createHeaderBox = function () {
        
        $("#PageContainer").append(`<div class='headersections' style='height:${this.height};'></div>
                                    <div class='multiSplit' id='multiSplit' style='height:${ this.height};'></div>
                                    <div class='headersections-report-layer' style='display:none;height:${this.height};'></div>`);
        for (var i = 0; i < 5; i++) {
            $("#multiSplit").append(`<div class='multiSplitHbox' data_val='${i}' eb-type='MultiSplitBox' id='box${i}' style='width: 100%;'></div>`);
        }
    };

    this.pushSubsecToRptObj = function (sections, obj) {
        if (sections === 'ReportHeader')
            this.EbObject.ReportHeaders.$values.push(obj);
        else if (sections === 'PageHeader')
            this.EbObject.PageHeaders.$values.push(obj);
        else if (sections === 'ReportFooter')
            this.EbObject.ReportFooters.$values.push(obj);
        else if (sections === 'PageFooter')
            this.EbObject.PageFooters.$values.push(obj);
        else if (sections === 'ReportDetail')
            this.EbObject.Detail.$values.push(obj);
    };

    this.pageSplitters = function () {                
        var j = 0;
        this.HH = [];
        for (var sections in this.EbObjectSections) {
            $("#page").append(`<div class='${sections}s' eb-type='${sections}' id='${this.EbObjectSections[sections]}' 
            data_val='${j++}' style='width :100%;position: relative'> </div>`);
            this.sectionArray.push("#" + this.EbObjectSections[sections]);
            if (this.isNew)
                this.appendSubSection(sections, [1]);
            else
                this.appendSubSection(sections, this.EditObj[this.repExtern.mapCollectionToSection(sections)].$values); 
        }
        this.repExtern.headerSecSplitter(this.sectionArray, this.HH);
        this.headerBox1_Split();
    };//add page sections

    this.appendSubSection = function (sections, subSecArray) {
        var idArr = [], hArr = [];
        for (len = 0; len < subSecArray.length; len++) {
            var SubSec_obj = new EbObjects["Eb" + sections](this.EbObjectSections[sections] + len);
            $("#" + this.EbObjectSections[sections]).append(SubSec_obj.$Control.outerHTML());
            SubSec_obj.SectionHeight = "100%";
            SubSec_obj.BackColor = "transparent";
            if (!this.isNew) {                
                this.repExtern.replaceProp(SubSec_obj, subSecArray[len]); 
                idArr.push("#" + SubSec_obj.EbSid);
                hArr.push(SubSec_obj.Height);               
            }
            this.objCollection[this.EbObjectSections[sections] + len ] = SubSec_obj;
            this.RefreshControl(SubSec_obj);
            this.pg.addToDD(SubSec_obj);
            this.pushSubsecToRptObj(sections, SubSec_obj);//push subsec to report object.            
        }
        if (!this.isNew) 
            idArr.length > 1 ? this.repExtern.splitGeneric(idArr, this.repExtern.convertPixelToPercent(hArr)) : null ;
    };

    this.headerBox1_Split = function () {
        for (i = 0; i < 5; i++) {
            $(".headersections").append("<div class='head_Box1' id='" + this.sectionArray[i].slice(1) + "Hbox' data-index='" + i + "' style='width :100%'>"
                + "<p>" + this.msBoxSubNotation[this.sectionArray[i].slice(1)] + "</p></div>");
        }
        this.headerScaling();
        this.splitButton();
    };

    this.headerScaling = function () {
        this.repExtern.multisplit();
        this.repExtern.box();
        this.appendMultisplitBox();        
    };

    this.appendMultisplitBox = function () {
        $("#page").children().not(".gutter,.pageReSizeHandle").each(this.appMultisplBoxEXE.bind(this));
    };

    this.appMultisplBoxEXE = function (i, obj) {
        var idArr = [], hArr = [];
        var $cont = $("#multiSplit").children().not(".gutter").eq(i);
        for (len = 0; len < $(obj).children().not(".gutter").length; len++) {
            var id = this.sectionArray[i].slice(1) + "subBox" + len;
            $cont.append("<div class='multiSplitHboxSub' eb-type='MultiSplitBox' id='" + id + "' style='width: 100%;height:" + $(obj).height() + "px'>"
                + "<p> " + this.msBoxSubNotation[this.sectionArray[i].slice(1)] + len + " </p></div>");
            var focid = id.substring(0, id.indexOf('s')) + id.slice(-1);
            $("#" + id).attr("onclick", "$('#" + focid + "').focus();");
            idArr.push("#" + id);
            hArr.push($(obj).height());
        }
        if (!this.isNew)
            this.repExtern.splitGeneric(idArr, this.repExtern.convertPixelToPercent(hArr));
    };

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
        $.each($('.page').children().not(".gutter"), this.splitDiv_inner.bind(this));
    };

    this.splitDiv_inner = function (i, obj) {
        if ($(obj).attr('data_val') === this.btn_indx) {
            this.$sec = $("#" + obj.id);
            var id = obj.id + (this.subSecIdCounter["Count" + obj.id])++;
            var objType = $(obj).attr("eb-type");
            this.$sec.children('.gutter').remove();
            var SubSec_obj = new EbObjects["Eb" + objType](id);
            this.$sec.append(SubSec_obj.$Control.outerHTML());
            SubSec_obj.BackColor = "transparent";
            this.objCollection[id] = SubSec_obj;
            this.RefreshControl(SubSec_obj);
            this.pg.addToDD(SubSec_obj);
            this.pushSubsecToRptObj(objType, SubSec_obj);//push subsec to report object.
            $.each(this.$sec.children().not(".gutter"), this.splitMore.bind(this));
            this.repExtern.splitGeneric(this.splitarray);
            this.multiSplitBoxinner();
        }
    };//split sections multipple

    this.splitMore = function (i, obj) {
        this.splitarray.push("#" + obj.id);
    };//subsection pushed into split array 

    this.multiSplitBoxinner = function () {
        var index = this.btn_indx;
        var temp1 = [];
        var msBoxSubNotationTemp = this.msBoxSubNotation;
        var SecArray = this.sectionArray;
        var flagsuccess = false;
        $('.multiSplit').children(".multiSplitHbox").eq(this.btn_indx).children('.gutter').remove();
        $('.multiSplit').children(".multiSplitHbox").each(function (i, obj) {
            $('.page').children().not(".gutter").each(function (j, obj2) {
                var count = $(obj2).children().not(".gutter").length;
                if ($(obj).attr("data_val") === $(obj2).attr("data_val") && index === $(obj).attr("data_val")) {
                    var id = obj2.id + "subBox" + (count - 1);
                    $(obj).append("<div class='multiSplitHboxSub' eb-type='MultiSplitBox' id='" + id + "' style='width: 100%;'>"
                        + "<p> " + msBoxSubNotationTemp[obj2.id] + (count - 1) + " </p></div>");
                    var focid = id.substring(0, id.indexOf('s')) + id.slice(-1);
                    $("#" + id).attr("onclick", "$('#" + focid + "').focus();");
                    $.each($(obj).children().not(".gutter"), function (i, object) { temp1.push("#" + object.id); });
                    flagsuccess = true;
                    return false;
                }
            });
            if (flagsuccess)
                return false;
        });
        if (temp1 !== null) {
            this.repExtern.splitGeneric(temp1);
        }
    };

    this.DragDrop_Items = function () {
        this.posLeft = null;
        this.posTop = null;
        this.font = null;
        this.reDragLeft = null;
        this.reDragTop = null;
        $('.draggable,.draggable-to-page').draggable({
            cancel: "a.ui-icon",
            revert: "invalid",
            helper: "clone",
            cursor: "move",
            appendTo: "body",
            drag: function (event, ui) {
                $(ui.helper).css({ "background": "white", "border": "1px dotted black", "width": "auto" });
                $(ui.helper).children(".shape-text").remove();
                $(ui.helper).children().find('i').css({ "font-size": "50px", "background-color": "transparent" });
            },
            start: this.dragStartFirst.bind(this),
        });
    };//drag drop starting func

    this.dragStartFirst = function (event, ui) {
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
        if (this.Objtype === 'DataFieldText' || this.Objtype === 'DataFieldDateTime' || this.Objtype === 'DataFieldBoolean' || this.Objtype === 'DataFieldNumeric') 
            Title = "T" + this.col.parent().parent().siblings("a").text().slice(-1) + "." + this.col.text().trim();                
        else
            Title = this.col.text().trim();
        if (!this.col.hasClass('dropped')) {
            var Objid = this.Objtype + (this.idCounter["Eb" + this.Objtype + "Counter"])++;
            var obj = new EbObjects["Eb" + this.Objtype](Objid);
            this.dropLoc.append(obj.$Control.outerHTML());
            if (this.col.hasClass('coloums')) {
                obj.Top = (this.posTop - this.dropLoc.offset().top) - PosOBjOFdrag['top'];
                obj.Left = (this.posLeft - this.dropLoc.offset().left) - PosOBjOFdrag['left'];
                obj.DbType = this.col.attr("DbType");
                obj.TableIndex = parseInt(this.col.parent().parent().siblings("a").text().slice(-1));
                obj.ColumnName = this.col.text().trim();
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
            this.dropLoc.append(this.col.css({ left: (this.posLeft - this.dropLoc.offset().left) - this.reDragLeft, top: (this.posTop - this.dropLoc.offset().top) - this.reDragTop }));
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
            this.Resizable(curControl);
        }
        this.contextMenu(curControl, curObject);
    };//obj send to pg on focus

    this.Resizable = function (object) {
        $("#" + object.attr("id")).css({ "text-overflow": "unset", "overflow": "visible" });
        if (object.hasClass("Ebshapes")) {
            if (object.attr("eb-type") === "ArrR" || object.attr("eb-type") === "ArrL") {
                this.resizing(object, "e,w");
            }
            else if (object.attr("eb-type") === "ArrU" || object.attr("eb-type") === "ArrD") {
                this.resizing(object, "n, s");
            }
            else if (object.attr("eb-type") === "ByArrH" || object.attr("eb-type") === "Hl") {
                this.resizing(object, "e,w");
            }
            else if (object.attr("eb-type") === "ByArrV" || object.attr("eb-type") === "Vl") {
                this.resizing(object, "n, s");
            }
            else {
                this.resizing(object, "n, s,e,w, ne, se, sw, nw");
            }
        }
        else {
            this.resizing(object, "n, s,e,w, ne, se, sw, nw");
        }
    };

    this.resizing = function (object, handles) {
        object.resizable({
            containment: "parent", handles: handles, stop: this.onReSizeFn.bind(this)
        });
    };

    this.destroyResizable = function (event) {
        $(event.target).css({ "text-overflow": "ellipsis", "overflow": "hidden" });
        $(event.target).resizable("destroy");
    }

    this.contextMenu = function (curControl, curObject) {
        this.curObject = curObject;
        var selector = curControl.attr('id');
        this.itemsDisabled = {};
        $.contextMenu({
            selector: '#' + selector,
            autoHide: true,
            items: {
                "copy": { name: "Copy", icon: "copy", callback: this.contextMenucopy.bind(this) },
                "cut": { name: "Cut", icon: "cut", callback: this.contextMenucut.bind(this) },
                "paste": { name: "Paste", icon: "paste", callback: this.contextMenupaste.bind(this) },
                "delete": { name: "Delete", icon: "delete", callback: this.contextMenudelete.bind(this) },
                "lock": { name: "Lock", icon: "fa-lock", callback: this.lockControl.bind(this) },
                "unlock": { name: "unlock", icon: "fa-unlock", callback: this.unLockControl.bind(this) },
                "summary": { name: "Summary", icon: "fa-cog", callback: this.addSummeryField.bind(this) },
                "fold1": {
                    "name": "Text Align", icon: "fa-text",
                    "items": {
                        "Align Left": { name: "Align Left", icon: "fa-align-left", callback: this.contextMenuLeft.bind(this) },
                        "Align Right": { name: "Align Right", icon: "fa-align-right", callback: this.contextMenuRight.bind(this) },
                        "Align Center": { name: "Align Center", icon: "fa-align-center", callback: this.contextMenuCenter.bind(this) },
                        "Align Justify": { name: "Align Justify", icon: "fa-align-justify", callback: this.contextMenuJustify.bind(this) },
                    }
                },
                "fold2": {
                    "name": "Align", icon: "",
                    "items": {
                        "Top": { name: "Top", icon: "", callback: this.repExtern.alignGroup.bind(this) },
                        "Bottom": { name: "Bottom", icon: "", callback: this.repExtern.alignGroup.bind(this) },
                        "Left": { name: "Left", icon: "", callback: this.repExtern.alignGroup.bind(this) },
                        "Right": { name: "Right", icon: "", callback: this.repExtern.alignGroup.bind(this) },
                    }
                }
            }
        });
    };

    this.contextMenucopy = function (eType, selector, action, originalEvent) {
        if (!$(selector.selector).hasClass("pageHeaders")) {
            this.copyStack = Object.assign({}, this.objCollection[$(selector.selector).attr('id')]);
            this.copyORcut = 'copy';
        }
        else
            alert("section cannot copy!");
    };
    this.contextMenucut = function (eType, selector, action, originalEvent) {
        if (!$(selector.selector).hasClass("pageHeaders")) {
            this.copyStack = this.objCollection[$(selector.selector).attr('id')];
            this.copyORcut = 'cut';
            $(selector.selector).remove();
        }
        else
            alert("section cannot cut!");
    };
    this.contextMenupaste = function (eType, selector, action, originalEvent) {
        if (this.copyStack === null) { alert('no item copied'); }
        else {
            var $obj = {};
            var Objid = null;
            var Objtype = $("#" + this.copyStack.EbSid).attr('eb-type');
            if (this.copyORcut === 'copy') {
                Objid = Objtype + (this.idCounter["Eb" + Objtype + "Counter"])++;
                $obj = new EbObjects["Eb" + Objtype](Objid);                
                this.repExtern.replaceWOPtConvProp($obj, this.copyStack);
                $obj.EbSid = Objid;
                $obj.Name = Objid;
            }
            else if (this.copyORcut === 'cut') {
                $obj = this.copyStack;
                Objid = this.copyStack.EbSid;
            }
            $obj.Top = action.originalEvent.pageY - $(selector.selector).offset().top;
            $obj.Left = action.originalEvent.pageX - $(selector.selector).offset().left;
            $(selector.selector).append($obj.$Control.outerHTML());
            this.objCollection[Objid] = $obj;
            this.RefreshControl($obj);
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
    this.contextMenuJustify = function (eType, selector, action, originalEvent) {
        this.objCollection[$(selector.selector).attr("id")].TextAlign = this.TextAlign[3];
        this.RefreshControl(this.objCollection[$(selector.selector).attr("id")]);
    };
    this.contextMenuRight = function (eType, selector, action, originalEvent) {
        this.objCollection[$(selector.selector).attr("id")].TextAlign = this.TextAlign[2];
        this.RefreshControl(this.objCollection[$(selector.selector).attr("id")]);
    };
    this.contextMenuCenter = function (eType, selector, action, originalEvent) {
        this.objCollection[$(selector.selector).attr("id")].TextAlign = this.TextAlign[1];
        this.RefreshControl(this.objCollection[$(selector.selector).attr("id")]);
    };
    this.contextMenuLeft = function (eType, selector, action, originalEvent) {
        this.objCollection[$(selector.selector).attr("id")].TextAlign = this.TextAlign[0];
        this.RefreshControl(this.objCollection[$(selector.selector).attr("id")]);
    };
    this.lockControl = function (eType, selector, action, originalEvent) {
        if (!$(selector.selector).hasClass("pageHeaders")) {
            $(selector.selector).addClass('locked').draggable('disable');
        }
        else if ($(selector.selector).hasClass("pageHeaders")) {
            $(selector.selector).addClass('locked').droppable({
                disabled: true
            });
            $(selector.selector).children().each(function (i, obj) { $("#" + obj.id).addClass('locked').draggable('disable'); });
            var locksymbDiv = $(selector.selector).attr("id").slice(0, -1) + 'subBox' + $(selector.selector).attr('id').slice(-1);
            $('#' + locksymbDiv).append('<i class="fa fa-lock lock-icon" aria-hidden="true"></i>');
            if ($(selector.selector).siblings().length === 0) {
                $('#btn' + $(selector.selector).attr("data_val")).attr('disabled', 'disabled');
            }
            $(selector.selector).parent().next('.gutter').css({ "cursor": "not-allowed", "pointer-events": "none" });
            $(selector.selector).parent().prev('.gutter').css({ "cursor": "not-allowed", "pointer-events": "none" });
        }
    };
    this.unLockControl = function (eType, selector, action, originalEvent) {
        if (!$(selector.selector).hasClass("pageHeaders")) {
            $(selector.selector).removeClass('locked').draggable('enable');
        }
        else if ($(selector.selector).hasClass("pageHeaders")) {
            $(selector.selector).removeClass('locked').droppable({
                disabled: false
            });
            $(selector.selector).children().each(function (i, obj) { $("#" + obj.id).removeClass('locked').draggable('enable'); });
            var locksymbDiv = $(selector.selector).attr("id").slice(0, -1) + 'subBox' + $(selector.selector).attr('id').slice(-1);
            $('#' + locksymbDiv).children("i").remove();
            if ($(selector.selector).siblings().length === 0) {
                $('#btn' + $(selector.selector).attr("data_val")).removeAttr('disabled');
            }
            $(selector.selector).parent().next().css({ "cursor": "ns-resize", "pointer-events": "auto" });
            $(selector.selector).parent().prev('.gutter').css({ "cursor": "ns-resize", "pointer-events": "auto" });
        }
    };

    this.addSummeryField = function (eType, selector, action, originalEvent) {
        $("#summarry-editor-modal-container").modal("toggle");
        this.selector = selector;
        this.$funcselect = $("#summarry-editor-modal-container #summary-func").empty();
        this.$sectionselect = $("#summarry-editor-modal-container #summary-sections").empty();
        var sections = this.getSectionToAddSum($(selector.selector));
        if ($(selector.selector).hasClass("EbCol")) {
            $("#summarry-editor-modal-container #summary-fieldname").val($(selector.selector).text().trim());
            for (var func in summaryFunc) {
                this.$funcselect.append(`<option 
                value="${summaryFunc[func]}">${summaryFunc[func]}</option>`);
            }
            for (var i = 0; i < sections.length; i++) {
                this.$sectionselect.append(`<option 
                value="#${sections[i].attr("id")}">${sections[i].attr("eb-type") + sections[i].attr("id").slice(-1)}</option>`);
            }
            $("#submit-summary").off("click").on("click", this.appendSummaryField.bind(this));
        }
    };

    this.appendSummaryField = function (e) {
        $("#summarry-editor-modal-container").modal("toggle");
        var type = $(this.selector.selector).attr("eb-type");
        var Objid = type + "Summary" + this.idCounter["Eb" + type + "SummaryCounter"]++;
        var obj = new EbObjects["Eb" + type + "Summary"](Objid);
        $(this.$sectionselect.val()).append(obj.$Control.outerHTML());
        obj.DataField = $(this.selector.selector).text().trim();
        obj.Title = this.$funcselect.val() + "(" + $(this.selector.selector).text().trim() + ")";
        obj.Function = this.$funcselect.val();
        obj.Left = this.objCollection[$(this.selector.selector).attr("id")].Left;
        this.objCollection[Objid] = obj;
        this.RefreshControl(obj);
        $("#running-summary ul[id='running-summary-childul']").append("<li class='styl'><div tabindex='1' $(this).focus(); class='textval'> "
            + this.$funcselect.val() + "(" + $(this.selector.selector).text().trim() + ")" + "</div></li>");
    };

    this.getSectionToAddSum = function (selector) {
        var objlist = [];
        selector.parent().parent().nextAll().not(".gutter,#detail").each(function (i, obj) {
            $(obj).children().not(".gutter").each(function (j, sections) {
                objlist.push($(sections));
            })
        })
        return objlist;
    };

    this.editElement = function (control) {
        this.control = control;
        this.control.on('keydown', this.keyBoardShortcuts.bind(this));
    };//control edit options

    this.keyBoardShortcuts = function (e) {
        e.preventDefault();
        var obj = this.repExtern.keyboardevents(e, this.control, this.objCollection[this.control.attr('id')]);
        this.pg.setObject(this.objCollection[this.control.attr('id')], AllMetas["Eb" + this.control.attr('eb-type')]);
    }

    this.removeElementFn = function (e) {
        if (!$(e.target).hasClass("pageHeaders"))
            this.control.remove();
        else
            alert("no permission");
    };

    this.addImageFn = function (obj) {
        obj.Source = 'url(' + 'http://eb_roby_dev.localhost:5000/static/' + obj.Image + '.JPG) center no-repeat';
        this.RefreshControl(obj);
    };
    this.onDrag_stop = function (event, ui) {
        $('#guid-v , #guid-h, #guid-vr, #guid-hb').remove();
        var dragId = $(event.target).attr("id");
        var type = $(event.target).attr('eb-type');
        this.pg.setObject(this.objCollection[dragId], AllMetas["Eb" + type]);
    };//drag start fn of control

    this.ondragControl = function (event, ui) {
        $('#guid-v , #guid-h, #guid-vr, #guid-hb').show();
        $('#guid-v').css({ 'left': (event.pageX - $(containment).offset().left) - (this.reDragLeft + 3) });
        $('#guid-h').css({ 'top': (event.pageY - $(containment).offset().top) - (this.reDragTop + 3) });
        $('#guid-vr').css({ 'left': ((event.pageX - $(containment).offset().left) - (this.reDragLeft + 3)) + ($(event.target).width() + 5) });
        $('#guid-hb').css({ 'top': ((event.pageY - $(containment).offset().top) - (this.reDragTop + 3)) + ($(event.target).height() + 5) });
    };

    this.onDrag_Start = function (event, ui) {
        this.reDragLeft = event.pageX - $(event.target).offset().left;
        this.reDragTop = event.pageY - $(event.target).offset().top;
        $(containment).prepend(`<div class='guid-v' id='guid-v'></div>
                                <div class='guid-h' id='guid-h'></div>
                                <div class='guid-vr' id='guid-vr'></div>
                                <div class='guid-hb' id='guid-hb'></div>`);
    };//drag stop fn of control

    this.BeforeSave = function () {
        this.repExtern.emptyControlCollection(this.EbObject);
        this.EbObject.DesignPageHeight = this.repExtern.convertTopoints($("#page").outerHeight());
        this.EbObject.HeightPt = this.repExtern.convertTopoints(this.height.slice(0, -2));
        this.EbObject.WidthPt = this.repExtern.convertTopoints(this.width.slice(0, -2));
        this.EbObject.Height = this.height.slice(0, -2);
        this.EbObject.Width = this.width.slice(0, -2);
        this.EbObject.PaperSize = this.type;
        $.each($('.page-reportLayer').children(), this.findReportLayObjects.bind(this));
        $.each($('.page').children().not(".gutter"), this.findPageSections.bind(this));
        commonO.Current_obj = this.EbObject;
    };//save

    this.findReportLayObjects = function (k, object) {
        var ObjId = $(object).attr('id');
        this.objCollection[ObjId].WidthPt = this.repExtern.convertTopoints($(object).outerWidth());
        this.objCollection[ObjId].HeightPt = this.repExtern.convertTopoints($(object).outerHeight());
        this.objCollection[ObjId].LeftPt = this.repExtern.convertTopoints(this.objCollection[ObjId].Left);
        this.objCollection[ObjId].TopPt = this.repExtern.convertTopoints(this.objCollection[ObjId].Top);
        this.EbObject.ReportObjects.$values.push(this.objCollection[ObjId]);
    };

    this.findPageSections = function (i, sections) {
        this.sections = $(sections).attr('id');
        $.each($("#" + this.sections).children().not(".gutter"), this.findPageSectionsSub.bind(this));
    };//........save/commit

    this.findPageSectionsSub = function (j, subsec) {
        this.subsec = $(subsec).attr("id");
        var eb_type = $(subsec).attr("eb-type");
        this.j = j;
        this.objCollection[this.subsec].Width = $("#" + this.subsec).outerWidth();
        this.objCollection[this.subsec].Height = $("#" + this.subsec).outerHeight();
        this.objCollection[this.subsec].WidthPt = this.repExtern.convertTopoints($("#" + this.subsec).outerWidth());
        this.objCollection[this.subsec].HeightPt = this.repExtern.convertTopoints($("#" + this.subsec).outerHeight());
        $.each($("#" + this.subsec).children(), this.findPageElements.bind(this));
    };//.........save/commit

    this.findPageElements = function (k, elements) {
        var elemId = $(elements).attr('id');
        var eb_typeCntl = $("#" + this.subsec).attr("eb-type");

        this.objCollection[elemId].WidthPt = this.repExtern.convertTopoints($(elements).outerWidth());
        this.objCollection[elemId].HeightPt = this.repExtern.convertTopoints($(elements).outerHeight());
        this.objCollection[elemId].LeftPt = this.repExtern.convertTopoints($(elements).position().left);
        this.objCollection[elemId].TopPt = this.repExtern.convertTopoints($(elements).position().top);

        if (eb_typeCntl === 'ReportHeader') {
            this.EbObject.ReportHeaders.$values[this.j].Fields.$values.push(this.objCollection[elemId]);
        }
        else if (eb_typeCntl === 'PageHeader') {
            this.EbObject.PageHeaders.$values[this.j].Fields.$values.push(this.objCollection[elemId]);
        }
        else if (eb_typeCntl === 'ReportFooter') {
            this.EbObject.ReportFooters.$values[this.j].Fields.$values.push(this.objCollection[elemId]);
        }
        else if (eb_typeCntl === 'PageFooter') {
            this.EbObject.PageFooters.$values[this.j].Fields.$values.push(this.objCollection[elemId]);
        }
        else if (eb_typeCntl === 'ReportDetail') {
            this.EbObject.Detail.$values[this.j].Fields.$values.push(this.objCollection[elemId]);
        }
    };

    this.setpageSize = function (obj) {
        this.type = obj.PaperSize;
        if (obj.PaperSize !== 5) {
            this.height = this.pages[this.type].height;
            this.width = this.pages[this.type].width;
            $('.ruler,.rulerleft').empty();
            this.ruler();
            $(".headersections,.multiSplit").css({ "height": this.height });
            $("#page").css({ "height": this.height, "width": this.width });
        }
        else if (obj.PaperSize === 5) {
            if (obj.CustomPaperHeight !== 0 && obj.CustomPaperWidth !== 0) {
                this.height = obj.CustomPaperHeight;
                this.width = obj.CustomPaperWidth;
                $('.ruler,.rulerleft').empty();
                this.ruler();
                $(".headersections,.multiSplit").css({ "height": this.height });
                $("#page").css({ "height": this.height, "width": this.width });
            }
        }
    };//page size change fn

    this.setpageMode = function (obj) {
        [this.height, this.width] = [this.width, this.height];
        this.repExtern.splitterOndragFn();
        $('.ruler,.rulerleft').empty();
        this.ruler();
        $(".headersections,.multiSplit").css({ "height": this.height });
        $("#page").css({ "height": this.height, "width": this.width });
    };//page layout lands/port

    this.setSplitArrayFSec = function (i, obj) {
        this.idArray.push("#" + obj.id);
        var size = (($(obj).height() / $(obj).parent().height()) * 100) + 1.2;
        this.sizeArray.push(size);
        $(obj).siblings(".gutter").remove();
    };//section split for pg change

    this.rulerChangeFn = function (e) {
        this.rulertype = $(e.target).val();
        $('.ruler,.rulerleft').empty();
        this.ruler();
    };

    this.changeSummaryFunc = function (obj) {
        obj.Title = obj.Title.replace(obj.Title.substr(0, obj.Title.indexOf('(')), summaryFunc[obj.Function]);
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

    this.renderOnedit = function () {
        for (var objPropIndex in this.EditObj) {
            if (typeof this.EditObj[objPropIndex] === "object") {
                if (objPropIndex === "ReportObjects")
                    this.appendHTMLonEdit(this.EditObj[objPropIndex].$values,"ReportObjects");
                else
                    this.getContainerId(this.EditObj[objPropIndex].$values);
            }
        }
    };

    this.getContainerId = function ($secColl) {
        for (var i = 0; i < $secColl.length; i++) {
            this.containerId = $("#" + $secColl[i].EbSid) ;
            this.appendHTMLonEdit($secColl[i].Fields.$values);
        }
    };

    this.appendHTMLonEdit = function ($controlColl,container) {
        for (var i = 0; i < $controlColl.length; i++) {
            var editControl = $controlColl[i];
            var eb_type = editControl.$type.split(",")[0].split(".").pop().substring(2);
            var Objid = eb_type + (this.idCounter["Eb" + eb_type + "Counter"])++;
            var $control = new EbObjects["Eb" + eb_type](Objid);
            if (container)
                $("#page-reportLayer").append($control.$Control.outerHTML());
            else
                this.containerId.append($control.$Control.outerHTML());
            this.repExtern.replaceProp($control, editControl);
            this.objCollection[Objid] = $control;
            this.RefreshControl($control);
        }
    };
    
    this.pg.PropertyChanged = function (obj, pname) {
        if ('SectionHeight' in obj) {
            this.sizeArray = [];
            this.idArray = [];
            $("#" + obj.EbSid).parent().children().not(".gutter").each(this.setSplitArrayFSec.bind(this));
            this.RefreshControl(obj);
            this.repExtern.splitGeneric(this.idArray, this.sizeArray);
        }
        else if (pname === "DataSourceRefId") {
            this.getDataSourceColoums(obj.DataSourceRefId);
        }
        else if (pname === "PaperSize") {
            this.setpageSize(obj);
        }
        else if (pname === "IsLandscape") {
            this.setpageMode(obj);
        }
        else if (pname === "Image") {
            this.addImageFn(obj);
        }
        else if (pname === "WaterMark") {
            this.addImageFn(obj);
        }
        else if (pname === "WaterMarkText") {
            obj.Source = "";
            this.RefreshControl(obj);
        }
        else if (pname === "TextAlign") {
            obj.TextAlign = this.TextAlign[obj.TextAlign];
            this.RefreshControl(obj);
        }
        else if (pname === "Function") {
            this.changeSummaryFunc(obj);
            this.RefreshControl(obj);
        }
        else if (pname === "BackgroundImage")
            this.repExtern.setBackgroud(obj.BackgroundImage);
        else if (obj.constructor.name === "EbReport" && pname === "BackColor")
            $(".page-reportLayer").css("background-color", obj.BackColor);
        else {
            this.RefreshControl(obj);
        }
    }.bind(this);

    this.pg.Close = function () {
        this.repExtern.minPgrid();
    }.bind(this);

    this.newReport = function () {
        this.EbObject = new EbObjects["EbReport"]("Report1");
        this.height = this.repExtern.convertPointToPixel(this.pages[this.type].height) + "px";
        this.width = this.repExtern.convertPointToPixel(this.pages[this.type].width) + "px";
        this.EbObject.PaperSize = this.type;
        this.pg.setObject(this.EbObject, AllMetas["EbReport"]);
        $('#PageContainer,.ruler,.rulerleft').empty();
        this.ruler();
        this.createPage();
        this.DragDrop_Items();
    };

    this.editReport = function () {
        this.EditObj = Object.assign({}, this.EbObject);
        this.EbObject = new EbObjects["EbReport"](this.EditObj.Name);
        this.type = this.EditObj.PaperSize;
        this.height = this.repExtern.convertPointToPixel(this.EditObj.DesignPageHeight) + "px";
        this.width = this.repExtern.convertPointToPixel(this.EditObj.WidthPt) + "px";
        this.repExtern.replaceProp(this.EbObject, this.EditObj);
        this.pg.setObject(this.EbObject, AllMetas["EbReport"]);
        $('#PageContainer,.ruler,.rulerleft').empty();
        this.ruler();
        this.createPage();
        this.DragDrop_Items();
        this.renderOnedit();
    };

    this.init = function () {
        if (this.EbObject === null || this.EbObject === "undefined")
            this.newReport();
        else
            this.editReport();

        $("#rulerUnit").on('change', this.rulerChangeFn.bind(this));
        $("#reportLayer").on("click", function (e) {
            $(e.target).closest("div").toggleClass("layeractive");
            $("#sectionLayer").removeClass("layeractive");
            $(".multiSplit,.headersections,#page").hide();
            $(".headersections-report-layer,#page-reportLayer").show();
            containment = ".page-reportLayer";
        }.bind(this));
        $("#sectionLayer").on("click", function (e) {
            $(e.target).closest("div").toggleClass("layeractive");
            $("#reportLayer").removeClass("layeractive");
            $(".multiSplit,.headersections,#page").show();
            $(".headersections-report-layer,#page-reportLayer").hide();
            containment = ".page";
        }.bind(this));      
    };//report execution start func
    this.init();
};


