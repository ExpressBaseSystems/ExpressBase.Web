var RptBuilder = function (option) {
    var ver_num = option.Version || null;
    var type = option.ObjType || null;
    var dsobj = option.DsObj || null;
    var cur_status = option.Status || null;
    var tabNum = option.TabNum || null;
    var ssurl = option.ServiceUrl || null;

    this.wc = option.Wc;
    var containment = ".page";
    this.Tenantid = option.Cid;
    this.EbObject = dsobj;
    this.isNew = $.isEmptyObject(this.EbObject) ? true : false;
    this.objCollection = {};
    this.splitarray = [];
    this.btn_indx = null;
    this.sectionArray = [];
    this.RefId = option.RefId || null;;
    this.height = null;
    this.width = null;
    this.designHeight = null;
    this.type = 2;
    this.rulertype = "cm";
    this.margin = {
        Left: 0,
        Right: 0
    };

    this.repExtern = new ReportExtended(this);
    this.RbCommon = new RbCommon(this);
    this.pg = new Eb_PropertyGrid("propGrid", this.wc, this.Tenantid);
    this.RM = new ReportMenu(this);

    this.idCounter = CtrlCounters; //from c# //this.RbCommon.EbidCounter;
    this.subSecIdCounter = this.RbCommon.subSecCounter;
    this.EbObjectSections = this.RbCommon.EbObjectSections;
    this.msBoxSubNotation = this.RbCommon.msBoxSubNotation;
    this.pages = this.RbCommon.pages;
    this.TextAlign = this.RbCommon.TextAlign;
    this.rulerTypesObj = this.RbCommon.EbRuler;
    this.GenerateButtons = function () { };
    this.TableCollection = {};

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
                cursor: "crosshair", containment: containment, appendTo: "body",
                start: this.onDrag_Start.bind(this), stop: this.onDrag_stop.bind(this), drag: this.ondragControl.bind(this)
            });
            $("#" + obj.EbSid).off('focusout').on("focusout", this.destroyResizable.bind(this));
        }
        if ('SectionHeight' in obj) {
            $("#" + obj.EbSid).droppable({
                accept: ".draggable,.dropped,.coloums",
                hoverClass: "drop-hover",
                drop: this.onDropFn.bind(this)
            });
        }
        this.makeTLayoutDroppable(obj);
        $("#" + obj.EbSid).attr("tabindex", "1");
        $("#" + obj.EbSid).off("focus").on("focus", this.elementOnFocus.bind(this));
    };//render after pgchange

    this.getDataSourceColoums = function (refid) {
        if (refid !== "") {
            $("#get-col-loader").show();
            $.ajax({
                url: "../RB/GetColumns",
                type: "POST",
                cache: false,
                data: { refID: refid },
                success: function (result) {
                    $("#get-col-loader").hide();
                    if (result.columns) {
                        $("#data-table-list ul[id='dataSource']").empty();
                        this.RbCommon.drawDsColTree(result.columns);
                    }
                    if (result.paramsList) {
                        $("#ds_parameter_list ul[id='ds_parameters']").empty();
                        this.RbCommon.drawDsParmsTree(result.paramsList);
                    }
                }.bind(this)
            });
        }
    };//ajax for ds coloums

    this.ruler = function () {
        var width = this.width.slice(0, -2) > 794 ? ($('#PageContainer').width() - 79) + 'px' : this.width;
        var k = 0, j = 0;
        var pxlabel = this.rulertype == "px" ? 5 : 1;
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

        var $rulerleft = $('.rulerleft').css({ "height": this.designHeight });
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

        var $rulerleft_lyr = $('.rulerleft_Lyr_rpt').css({ "height": this.height });
        for (i = 0, step = 0; i < $rulerleft_lyr.innerHeight() / this.rulerTypesObj[this.rulertype].len; i++ , step++) {
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
            $rulerleft_lyr.append($tick);
        }
    };

    this.createPage = function () {
        this.createHeaderBox();
        $("#PageContainer").append(`<div class='page' id='page' style='position:relative;width:${this.width};height:${this.designHeight}'></div>
                                    <div class='page-reportLayer' id='page-reportLayer' style='display:none;position:relative;width:${this.width};height:${this.height}'></div>`);
        $(".page").resizable({
            handles: "s",
            stop: this.onPageResizeStop.bind(this),
            resize: this.onPageResize.bind(this)
        });
        $(".page-reportLayer").droppable({ accept: ".draggable-to-page,.dropped", drop: this.onDropFn.bind(this) });
        $(".page .ui-resizable-s").addClass("pageReSizeHandle");
        this.pageSplitters();
    };

    this.onPageResize = function () {
        $('.headersections,.multiSplit').css("height", $('.page').height());
        $(".rulerleft").css("height", $('.page').height());
        $(".tracker_drag").css({ "height": $(".page").height() + 20 });
        this.repExtern.OndragOfSections();
    };

    this.onPageResizeStop = function (event, ui) {
        this.designHeight = $(".page").height() + "px";
        $('.ruler,.rulerleft').empty();
        this.ruler();
    };

    this.createHeaderBox = function () {
        $("#PageContainer").append(`<div class='headersections' style='height:${this.designHeight};'></div>
                                    <div class='multiSplit' id='multiSplit' style='height:${ this.designHeight};'></div>
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
        this.HA = [];
        for (var sections in this.EbObjectSections) {
            $("#page").append(`<div class='${sections}s' eb-type='${sections}' id='${this.EbObjectSections[sections]}' 
            data_val='${j++}' style='width :100%;position: relative'> </div>`);
            this.sectionArray.push("#" + this.EbObjectSections[sections]);
            if (this.isNew)
                this.appendSubSection(sections, [1]);
            else
                this.appendSubSection(sections, this.EditObj[this.repExtern.mapCollectionToSection(sections)].$values);
        }
        this.repExtern.headerSecSplitter(this.sectionArray, this.HA);
        this.headerBox1_Split();
    };//add page sections

    this.appendSubSection = function (sections, subSecArray) {
        var idArr = [], hArr = [], total = 0;
        for (len = 0; len < subSecArray.length; len++) {
            var SubSec_obj = new EbObjects["Eb" + sections](this.EbObjectSections[sections] + len);
            $("#" + this.EbObjectSections[sections]).append(SubSec_obj.$Control.outerHTML());
            SubSec_obj.SectionHeight = "100%";
            SubSec_obj.BackColor = "#ffffff";
            if (!this.isNew) {
                this.repExtern.replaceProp(SubSec_obj, subSecArray[len]);
                idArr.push("#" + SubSec_obj.EbSid);
                hArr.push(SubSec_obj.Height);
                total += parseInt(SubSec_obj.Height);
            }
            this.objCollection[this.EbObjectSections[sections] + len] = SubSec_obj;
            this.RefreshControl(SubSec_obj);
            this.pg.addToDD(SubSec_obj);
            this.pushSubsecToRptObj(sections, SubSec_obj);//push subsec to report object.            
        }
        if (!this.isNew) {
            this.HA.push(total);
            idArr.length > 1 ? this.repExtern.splitGeneric(idArr, this.repExtern.convertPixelToPercent(hArr)) : null;
        }
    };

    this.headerBox1_Split = function () {
        for (i = 0; i < 5; i++) {
            $(".headersections").append(`<div class='head_Box1' id='${this.sectionArray[i].slice(1)}Hbox' data-index='${i}' style='width:100%'>
        <div class='hbox_notation_div'>${this.msBoxSubNotation[this.sectionArray[i].slice(1)]}</div><div class='new_sec_btn'></div></div>`);
        }
        this.headerScaling();
        this.splitButton();
    };

    this.headerScaling = function () {
        this.repExtern.multisplit(this.HA);
        this.repExtern.box(this.HA);
        this.appendMultisplitBox();
    };

    this.appendMultisplitBox = function () {
        $("#page").children().not(".gutter,.pageReSizeHandle").each(this.appMultisplBoxEXE.bind(this));
        this.repExtern.splitterOndragFn();
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
            hArr.push($(obj).outerHeight());
        }
        if (!this.isNew)
            idArr.length > 1 ? this.repExtern.splitGeneric(idArr, this.repExtern.convertPixelToPercent(hArr)) : null;
    };

    this.splitButton = function () {
        $('.headersections').children().not(".gutter").each(this.addButton.bind(this));
    };

    this.addButton = function (i, obj) {
        $(obj).children(".new_sec_btn").append("<button class='btn btn-xs'  id='btn" + i + "'><i class='fa fa-plus'></i></button>");
        $('#btn' + i).off("click").on("click", this.splitDiv.bind(this));
    };//split button

    this.splitDiv = function (e) {
        this.splitarray = [];
        this.btn_indx = $(e.target).closest(".head_Box1").attr("data-index");
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
            SubSec_obj.BackColor = "#ffffff";
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

        if (!this.col.hasClass('dropped'))
            this.DropFirst(Title);
        else if (this.col.hasClass('dropped'))
            this.DropFurther(Title);
    };//on drop func of dropable

    this.DropFirst = function (Title) {
        var Objid = this.Objtype + (this.idCounter[this.Objtype + "Counter"])++;
        var obj = new EbObjects["Eb" + this.Objtype](Objid);
        this.dropLoc.append(obj.$Control.outerHTML());
        this.objCollection[Objid] = obj;
        if (this.Objtype === "TableLayout")
            this.TableCollection[Objid] = new Array();

        if (this.col.hasClass('coloums')) {
            obj.Top = this.dropLoc.hasClass("T_layout") ? 0 : (this.posTop - this.dropLoc.offset().top) - this.positionTandL['top'];;
            obj.DbType = this.col.attr("DbType");
            obj.TableIndex = parseInt(this.col.parent().parent().siblings("a").text().slice(-1));
            obj.ColumnName = this.col.text().trim();
        }
        else if (this.dropLoc.hasClass('T_layout')) {
            obj.Width = this.dropLoc.innerWidth();
            obj.Height = this.dropLoc.innerHeight();
            obj.Top = 0;
            this.TableCollection[this.dropLoc.closest(".eb_table_container").attr("id")].push(obj);
        }
        else
            obj.Top = (this.posTop - this.dropLoc.offset().top) - this.positionTandL['top'];
        obj.Title = Title;
        obj.Left = this.leftwithMargin();
        obj.ParentName = this.dropLoc.attr("eb-type");
        this.RefreshControl(obj);
    };

    this.DropFurther = function () {
		var l1 = this.leftwithMargin();
		var top = (this.posTop - this.dropLoc.offset().top) - this.reDragTop;
		if (this.dropLoc.hasClass('T_layout')) {
			top = 0;
			this.col.css({ width: this.dropLoc.innerWidth(), height: this.dropLoc.innerHeight() });
		}
		this.dropLoc.append(this.col.css({ left: l1, top: top  }));
        var obj1 = this.objCollection[this.col.attr('id')];
        obj1.Top = this.dropLoc.hasClass("T_layout") ? 0 : this.col.position().top;
        obj1.Left = this.dropLoc.hasClass("T_layout") ? 0 : this.col.position().left;
        obj1.ParentName = this.dropLoc.attr("eb-type");
    };

    this.makeTLayoutDroppable = function (obj) {
        if ('ColoumCount' in obj && 'RowCount' in obj) {
            $(`#${obj.EbSid}`).children('table').find('td').addClass("T_layout").droppable({
                accept: ".draggable,.dropped,.coloums",
                greedy: true,
                hoverClass: "drop-hover",
                drop: this.onDropFn.bind(this)
            });
        }
        this.makeTLayoutTdResize(obj);
    };

    this.makeTLayoutTdResize = function (obj) {
        if ('ColoumCount' in obj && 'RowCount' in obj) {
            //$(`#${obj.EbSid} table td`).resizable({
            //    handles:"e"
            //});
        }
    };

    this.leftwithMargin = function () {
        var l = null;
        var r = $.isEmptyObject(this.objCollection[this.col.attr('id')]) ? new EbObjects["Eb" + this.col.attr('eb-type')]("sam").Width : parseFloat(this.objCollection[this.col.attr('id')].Width);
        if (!this.col.hasClass('dropped'))
            l = (this.posLeft - this.dropLoc.offset().left) - this.positionTandL['left'];
        else
            l = (this.posLeft - this.dropLoc.offset().left) - this.reDragLeft;
        if (l < $(".track_line_vert1").position().left)
            l = this.margin.Left;
        else if (l + r > $(".track_line_vert2").position().left)
            l = this.margin.Right - r;
        if (this.dropLoc.hasClass("T_layout"))
            l = 0;
        return l;
    };

    this.onReSizeFn = function (event, ui) {
        var resizeId = $(event.target).attr("id");
        var type = $(event.target).attr('eb-type');
        if (type === "TableLayout") {
            this.RbCommon.resizeTdOnLayoutResize($(event.target).attr("id"), "stop");
        }
        else {
            this.objCollection[resizeId].Width = $(event.target).width();
            this.objCollection[resizeId].Height = $(event.target).height();
            this.RefreshControl(this.objCollection[resizeId]);
            this.pg.setObject(this.objCollection[resizeId], AllMetas["Eb" + type]);
        }
    };//on resize event

    this.startResize = function (event, ui) {
        if ($(event.target).attr('eb-type') === "TableLayout") {
            this.RbCommon.resizeTdOnLayoutResize($(event.target).attr("id"), "start");
        }
    };

    this.elementOnFocus = function (event) {
        event.stopPropagation();
        var curControl = $(event.target);
        var curObject = this.objCollection[event.target.id];
        var type = curControl.attr('eb-type');
        this.pg.setObject(curObject, AllMetas["Eb" + type]);
        if (!curControl.hasClass("pageHeaders"))
            this.Resizable(curControl);
        this.RM.Menu(curControl);
        if (curControl.parent().hasClass("T_layout"))//change
            this.RbCommon.makeReadOnlyonPg(curObject);//change
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
        if (!object.hasClass("ui-resizable")) {
            object.resizable({
                containment: "parent",
                handles: handles,
                start: this.startResize.bind(this),
                stop: this.onReSizeFn.bind(this),
            });
        }
    };

    this.destroyResizable = function (event) {
        $(event.target).css({ "text-overflow": "ellipsis", "overflow": "hidden" });
        if ($(event.target).hasClass("ui-resizable"))
            $(event.target).resizable("destroy");
    }

    this.keyBoardShortcuts = function (e) {
        e.preventDefault(); event.stopPropagation();
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
        if (obj.Image)
            obj.Source = 'url(' + window.location.protocol + "//" + window.location.host + "/static/" + obj.Image + ".JPG" + ') center no-repeat';
        this.RefreshControl(obj);
    };
    this.onDrag_stop = function (event, ui) {
        $('#guid-v , #guid-h, #guid-vr, #guid-hb').remove();
        var dragId = $(event.target).attr("id");
        var type = $(event.target).attr('eb-type');
        this.pg.setObject(this.objCollection[dragId], AllMetas["Eb" + type]);
    };//drag start fn of control

    this.ondragControl = function (event, ui) {
        $(ui.helper).css("z-index", 10);
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

        this.EbObject.Margin.Left = this.repExtern.convertTopoints(this.margin.Left);
        this.EbObject.Margin.Right = this.repExtern.convertTopoints(parseFloat(this.width) - this.margin.Right);
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
        if ($(elements).attr("eb-type") === "TableLayout") {
            this.RbCommon.buildTableHierarcy($(elements), this.j, eb_typeCntl);
            this.pushToSections($(elements), this.j, eb_typeCntl);
        }
        else 
            this.pushToSections($(elements), this.j, eb_typeCntl);
    };

    this.pushToSections = function ($elements, index, eb_typeCntl) {
        var elemId = $elements.attr('id');
        this.objCollection[elemId].WidthPt = this.repExtern.convertTopoints(this.objCollection[elemId].Width);
        this.objCollection[elemId].HeightPt = this.repExtern.convertTopoints(this.objCollection[elemId].Height);
        this.objCollection[elemId].LeftPt = this.repExtern.convertTopoints(this.objCollection[elemId].Left);
        this.objCollection[elemId].TopPt = this.repExtern.convertTopoints(this.objCollection[elemId].Top);

        if (eb_typeCntl === 'ReportHeader') {
            this.EbObject.ReportHeaders.$values[index].Fields.$values.push(this.objCollection[elemId]);
        }
        else if (eb_typeCntl === 'PageHeader') {
            this.EbObject.PageHeaders.$values[index].Fields.$values.push(this.objCollection[elemId]);
        }
        else if (eb_typeCntl === 'ReportFooter') {
            this.EbObject.ReportFooters.$values[index].Fields.$values.push(this.objCollection[elemId]);
        }
        else if (eb_typeCntl === 'PageFooter') {
            this.EbObject.PageFooters.$values[index].Fields.$values.push(this.objCollection[elemId]);
        }
        else if (eb_typeCntl === 'ReportDetail') {
            this.EbObject.Detail.$values[index].Fields.$values.push(this.objCollection[elemId]);
        }
    };

    this.setpageSize = function (obj) {
        this.type = obj.PaperSize;
        if (obj.PaperSize !== 5) {
            this.height = this.repExtern.convertPointToPixel(this.pages[this.type].height) + "px";
            this.width = this.repExtern.convertPointToPixel(this.pages[this.type].width) + "px";
            $('.ruler,.rulerleft').empty();
            this.ruler();
            $(".headersections,.multiSplit").css({ "height": this.height });
            $("#page,#page-reportLayer").css({ "height": this.height, "width": this.width });
            $(".headersections-report-layer").css({ "height": this.height });

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
        this.repExtern.OndragOfSections();
        this.repExtern.splitterOndragFn();
    };//page size change fn

    this.setpageMode = function (obj) {
        //if ($("#page").css("display") === "none")
        //    $(".headersections-report-layer,#page-reportLayer").hide();
        //else
        //    $(".page").show();
        [this.height, this.width] = [this.width, this.height];
        this.designHeight = this.height;
        $('.ruler,.rulerleft').empty();
        this.ruler();
        $(".headersections,.multiSplit").css({ "height": this.height });
        $("#page").css({ "height": this.height, "width": this.width });
        $("#page-reportLayer").css({ "height": this.designHeight, "width": this.width });
        $(".headersections-report-layer").css({ "height": this.designHeight });
        this.repExtern.OndragOfSections();
        this.repExtern.splitterOndragFn();
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
            if (typeof this.EditObj[objPropIndex] === "object" && objPropIndex !== "Margin") {
                if (objPropIndex === "ReportObjects")
                    this.appendHTMLonEdit(this.EditObj[objPropIndex].$values, "ReportObjects");
                else
                    this.getContainerId(this.EditObj[objPropIndex].$values);
            }
            else if (objPropIndex === "Margin")
                $.extend(this.EbObject.Margin, this.EditObj.Margin);

        }
        if (this.EditObj.DataSourceRefId) {
            this.getDataSourceColoums(this.EditObj.DataSourceRefId);
        }
        if (this.EbObject.Margin)
            this.RbCommon.setMarginOnedit(this.EbObject.Margin);
    };

    this.getContainerId = function ($secColl) {
        for (var i = 0; i < $secColl.length; i++) {
            this.containerId = $("#" + $secColl[i].EbSid);
            this.appendHTMLonEdit($secColl[i].Fields.$values);
        }
    };

    this.appendHTMLonEdit = function ($controlColl, container) {
        for (var i = 0; i < $controlColl.length; i++) {
            var editControl = $controlColl[i];
            if (editControl.$type.split(",")[0].split(".").pop() === "EbTableLayout")
                this.RbCommon.drawTableOnEdit(editControl);
            else if (editControl.ParentName !== "TableLayout")
                this.drawEbControls(editControl, container);
        }
    };

    this.drawEbControls = function (editControl, container) {
        var eb_type = editControl.$type.split(",")[0].split(".").pop().substring(2);
        var Objid = eb_type + this.idCounter[eb_type + "Counter"]++;
        var $control = new EbObjects["Eb" + eb_type](Objid);
        if (container)
            this.containerId = $("#page-reportLayer");
        this.containerId.append($control.$Control.outerHTML());
        this.repExtern.replaceProp($control, editControl);
        $control.EbSid = Objid; $control.Name = Objid;
        this.objCollection[Objid] = $control;
        this.RefreshControl($control);
        this.pg.addToDD(this.objCollection[Objid]);
        return $control;
    }

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
        else if (pname === "Image" || pname === "WaterMark") {
            this.addImageFn(obj);
        }
        else if (pname === "ValueExpression") {
            this.RbCommon.ValidateCalcExpression(obj);
        }
        else if (pname === "WaterMarkText") {
            obj.Source = "";
            this.RefreshControl(obj);
        }
        //else if (pname === "TextAlign") {
        //    obj.TextAlign = this.TextAlign[obj.TextAlign];
        //    this.RefreshControl(obj);
        //}
        else if (pname === "ColoumCount" || pname === "RowCount")
            this.RbCommon.modifyTable(obj, pname);
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
        this.designHeight = "450px";
        this.EbObject.PaperSize = this.type;
        this.pg.setObject(this.EbObject, AllMetas["EbReport"]);
        $('#PageContainer,.ruler,.rulerleft,.rulerleft_Lyr_rpt').empty();
        this.ruler();
        this.createPage();
        this.DragDrop_Items();
    };

    this.editReport = function () {
        this.EditObj = Object.assign({}, this.EbObject);
        this.EbObject = new EbObjects["EbReport"](this.EditObj.Name);
        this.type = this.EditObj.PaperSize;
        this.height = this.repExtern.convertPointToPixel(this.EditObj.HeightPt) + "px";
        this.width = this.repExtern.convertPointToPixel(this.EditObj.WidthPt) + "px";
        this.designHeight = this.repExtern.convertPointToPixel(this.EditObj.DesignPageHeight) + "px";
        this.repExtern.replaceProp(this.EbObject, this.EditObj);
        this.pg.setObject(this.EbObject, AllMetas["EbReport"]);
        $('#PageContainer,.ruler,.rulerleft,.rulerleft_Lyr_rpt').empty();
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
        this.margin.Left = $(".track_line_vert1").position().left;
        this.margin.Right = $(".track_line_vert2").position().left;
    };//report execution start func
    this.init();
};


