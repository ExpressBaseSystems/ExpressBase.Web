var RptBuilder = function (option) {
    var ver_num = option.Version || null;
    var type = option.ObjType || null;
    var dsobj = option.DsObj || null;
    var cur_status = option.Status || null;
    var tabNum = option.TabNum || null;
    var ssurl = option.ServiceUrl || null;
    this.LocConfig = option.LocationConfig || {};
    this.wc = option.Wc;
    this.containment = ".page";
    this.Tenantid = option.Cid;
    this.EbObject = dsobj;
    this.isNew = $.isEmptyObject(this.EbObject) ? true : false;
    this.objCollection = {};
    this.RefId = option.RefId || null;
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

    this.pg = new Eb_PropertyGrid({
        id: "propGrid",
        wc: this.wc,
        cid: this.Tenantid,
        $extCont: $("#PGgrid-report")
    });

    this.idCounter = CtrlCounters; //from c# //this.RbCommon.EbidCounter;
    this.subSecIdCounter = this.RbCommon.subSecCounter;
    this.EbObjectSections = this.RbCommon.EbObjectSections;
    this.msBoxSubNotation = this.RbCommon.msBoxSubNotation;
    this.pages = this.RbCommon.pages;
    this.TextAlign = EbEnums["EbTextAlign"];
    this.rulerTypesObj = this.RbCommon.EbRuler;
    this.GenerateButtons = function () { 
		$("#obj_icons").empty();
		$("#obj_icons").append(`
			<button class='btn run' id='scheduler_init' data-toggle='tooltip' data-placement='bottom' title= 'Schedule'> <i class='fa fa-clock-o' aria-hidden='true'></i></button >
			`);
		$("#scheduler_init").off("click").on("click", this.DrawScheduler.bind(this));
	};

	this.DrawScheduler = function(){
		$('#SchedulerModal').modal('show');
	};

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
                cursor: "crosshair", containment: this.containment, appendTo: "body", zIndex: 100,
                start: this.onDrag_Start.bind(this), stop: this.onDrag_stop.bind(this), drag: this.ondragControl.bind(this)
            });
            $("#" + obj.EbSid).off('focusout').on("focusout", this.destroyResizable.bind(this));
        }
        if ('SectionHeight' in obj) {
            $("#" + obj.EbSid).droppable({
                accept: ".draggable,.dropped,.coloums",
                hoverClass: "drop-hover",
                tolerance: "fit",
                drop: this.onDropFn.bind(this)
            });
        }
        $("#" + obj.EbSid).attr("tabindex", "1");
        $("#" + obj.EbSid).not(".locked").off("focus").on("focus", this.elementOnFocus.bind(this));
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

        var $rulerleft = $('.rulerleft').css({ "height": "calc(100% - 20px)" });
        for (i = 0, step = 0; i < 300; i++ , step++) {
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
        $(".page").css({ width: this.width });
        $(`.page-reportLayer`).css({ width: this.width, height: this.height });
        $(`.page-reportLayer`).droppable({
            accept: ".draggable-to-page,.dropped",
            hoverClass: "drop-hover",
            drop: this.onDropFn.bind(this)
        });
        this.AppendInnerSec();
        this.syncHeight();
    };

    this.syncHeight = function () {
        for (let i = 0; i < 5; i++) {
            $(".headersections .header_box").eq(i).css({ height: $(".page .Eb_ReportSections").eq(i).innerHeight() });
        }
    };

    this.syncInner = function (_target) {
        let sec = _target.attr("eb-type");
        $(".multiSplit ." + sec + " ." + sec + "_sub").eq(_target.index()).css({ height: _target.outerHeight() });
    };

    this.makeSecResizable = function ($_jq) {
        $(`.page ${$_jq}`).resizable({
            handles: "s",
            resize: function (e, ui) {
                this.syncInner($(e.target));
                this.syncHeight();
            }.bind(this)
        });
    };

    this.AppendInnerSec = function () {
        for (let l = 0; l < this.EbObjectSections.length; l++) {
            if (this.isNew)
                this.appendSubSection(this.EbObjectSections[l], [1]);
            else
                this.appendSubSection(this.EbObjectSections[l], this.EditObj[this.repExtern.mapCollectionToSection(this.EbObjectSections[l])].$values);
        }
    };

    this.appendSubSection = function (sections, subSecArray,_new = false) {
        for (let k = 0; k < subSecArray.length; k++) {
            let id = sections + this.idCounter[sections + "Counter"]++;
            let o = new EbObjects["Eb" + sections](id);
            o.DisplayName = id;
            $(".page ." + sections).append(o.$Control.outerHTML());
            if (!_new)
                this.isNew ? o.SectionHeight = parseFloat(this.designHeight) / 5 + "px" : o.SectionHeight = this.repExtern.convertPointToPixel(subSecArray[k].HeightPt) + "px";
            else if (_new)
                o.SectionHeight = "60px";
            this.objCollection[id] = o;
            this.RefreshControl(o);
            this.pg.setObject(o, AllMetas["Eb" + sections]);
            this.pg.addToDD(o);
            this.makeSecResizable(`#${id}`);
            this.appendMSplitSec(sections, o);
            this.pushSubsecToRptObj(sections, o);
        }
    };

    this.appendNewSubDiv = function (_sec) {
        this.appendSubSection(_sec, [1],true);
        this.syncHeight();
    };

    this.appendMSplitSec = function (sections, obj) {
        let h = $(`.page .${sections}`).height();
        $(".multiSplit ." + sections).append(`<div class='multiSplitHboxSub ${sections}_sub' eb-type='MultiSplitBox' style='height:${obj.SectionHeight}'>
                <p class="sub_sec_notation">${this.msBoxSubNotation[sections].Notation + this.msBoxSubNotation[sections].Counter++}</p></div>`);
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
        if (this.Objtype === "Table_Layout") {
            let o = new EbTableLayout(this);
            this.TableCollection[o.EbCtrl.EbSid] = o;
        }
        else {
            var Objid = this.Objtype + (this.idCounter[this.Objtype + "Counter"])++;
            var obj = new EbObjects["Eb" + this.Objtype](Objid);
            this.dropLoc.append(obj.$Control.outerHTML());
            this.objCollection[Objid] = obj;
            obj.DisplayName = Objid;
            obj.Top = this.getPositionTop();
            obj.Left = this.leftwithMargin();
            if (this.col.hasClass('coloums')) {
                obj.DbType = this.col.attr("DbType");
                obj.TableIndex = parseInt(this.col.parent().parent().siblings("a").text().slice(-1));
                obj.ColumnName = this.col.text().trim();
            }
            obj.Title = Title;
            obj.ParentName = this.dropLoc.attr("eb-type");
            this.pg.addToDD(obj);
            this.RefreshControl(obj);
        }
    };

    this.DropFurther = function () {
        var obj1 = this.objCollection[this.col.attr('id')];
        var l1 = this.leftwithMargin();
        var top = this.getPositionTop();
        this.dropLoc.append(this.col.css({ left: l1, top: top }));
        obj1.Top = this.col.position().top;
        obj1.Left = this.col.position().left;
        obj1.Width = this.col.innerWidth();
        obj1.Height = this.col.innerHeight();
        obj1.ParentName = this.dropLoc.attr("eb-type");
    };

    this.leftwithMargin = function () {
        var l = null;
        var r = $.isEmptyObject(this.objCollection[this.col.attr('id')]) ? new EbObjects["Eb" + this.col.attr('eb-type')]("sam").Width : parseFloat(this.objCollection[this.col.attr('id')].Width);
        if (!this.col.hasClass('dropped'))
            l = (this.posLeft - this.dropLoc.offset().left) - this.positionTandL['left'];
        else
            l = (this.posLeft - this.dropLoc.offset().left) - this.reDragLeft;
        //if (l < $(".track_line_vert1").position().left)
        //    l = this.margin.Left;
        //else if (l + r > $(".track_line_vert2").position().left)
        //    l = this.margin.Right - r;
        if (this.dropLoc.hasClass("T_layout_td"))
            l = 0;
        return l;
    };

    this.getPositionTop = function () {
        let top = null;
        if (!this.col.hasClass('dropped'))
            top = (this.posTop - this.dropLoc.offset().top) - this.positionTandL['top'];
        else
            top = (this.posTop - this.dropLoc.offset().top) - this.reDragTop;

        if (this.dropLoc.hasClass("T_layout_td"))
            top = 0;
        return top;
    };

    this.onReSizeFn = function (event, ui) {
        var resizeId = $(event.target).attr("id");
        var type = $(event.target).attr('eb-type');
        if (type === "Table_Layout") {
            this.RbCommon.resizeTdOnLayoutResize($(event.target).attr("id"));
        }
        else {
            this.objCollection[resizeId].Width = $(event.target).width();
            this.objCollection[resizeId].Height = $(event.target).height();
            this.RefreshControl(this.objCollection[resizeId]);
            this.pg.setObject(this.objCollection[resizeId], AllMetas["Eb" + type]);
        }
    };//on resize event

    this.elementOnFocus = function (event) {
        event.stopPropagation();
        var curControl = $(event.target);
        var curObject = this.objCollection[event.target.id];
        var type = curControl.attr('eb-type');
        this.pg.setObject(curObject, AllMetas["Eb" + type]);
        if ((!curControl.hasClass("pageHeaders")) && (!curControl.parent().hasClass("T_layout_td")) && (!curControl.hasClass("locked"))) {
            this.Resizable(curControl);
        }
        //this.RM.Menu(curControl);
        if (curControl.parent().hasClass("T_layout_td"))//change
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
                stop: this.onReSizeFn.bind(this),
            });
        }
    };

    this.destroyResizable = function (event) {
        $(event.target).css({ "text-overflow": "ellipsis", "overflow": "hidden" });
        if ($(event.target).hasClass("ui-resizable"))
            $(event.target).resizable("destroy");
    }

    this.addImageFn = function (obj) {
        if (obj.ImageRefId)
            obj.Source = 'url(' + window.location.protocol + "//" + window.location.host + "/images/" + obj.ImageRefId + ".jpg" + ') center no-repeat';
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
        $('#guid-v').css({ 'left': (event.pageX - $(this.containment).offset().left) - (this.reDragLeft + 3) });
        $('#guid-h').css({ 'top': (event.pageY - $(this.containment).offset().top) - (this.reDragTop + 3) });
        $('#guid-vr').css({ 'left': ((event.pageX - $(this.containment).offset().left) - (this.reDragLeft + 3)) + ($(event.target).width() + 5) });
        $('#guid-hb').css({ 'top': ((event.pageY - $(this.containment).offset().top) - (this.reDragTop + 3)) + ($(event.target).height() + 5) });
    };

    this.onDrag_Start = function (event, ui) {
        this.reDragLeft = event.pageX - $(event.target).offset().left;
        this.reDragTop = event.pageY - $(event.target).offset().top;
        $(this.containment).prepend(`<div class='guid-v' id='guid-v'></div>
                                <div class='guid-h' id='guid-h'></div>
                                <div class='guid-vr' id='guid-vr'></div>
                                <div class='guid-hb' id='guid-hb'></div>`);
    };//drag stop fn of control

	this.CreateRelationString = function () { };

    this.BeforeSave = function () {
        this.repExtern.emptyControlCollection(this.EbObject);
        this.EbObject.DesignPageHeight = this.repExtern.convertTopoints($("#page").outerHeight());
        this.EbObject.HeightPt = this.repExtern.convertTopoints(parseFloat(this.height));
        this.EbObject.WidthPt = this.repExtern.convertTopoints(parseFloat(this.width));
        this.EbObject.Height = parseFloat(this.height);
        this.EbObject.Width = parseFloat(this.width);
        this.EbObject.PaperSize = this.type;
        $.each($('.page-reportLayer').children(), this.findReportLayObjects.bind(this));
        $.each($('.page').children(), this.findPageSections.bind(this));

        this.EbObject.Margin.Left = this.repExtern.convertTopoints(this.margin.Left);
        this.EbObject.Margin.Right = this.repExtern.convertTopoints(parseFloat(this.width) - this.margin.Right);
        commonO.Current_obj = this.EbObject;
        return true;
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
        $.each($("#" + this.sections).children(), this.findPageSectionsSub.bind(this));
    };//........save/commit

    this.findPageSectionsSub = function (j, subsec) {
        this.subsec = $(subsec).attr("id");
        var eb_type = $(subsec).attr("eb-type");
        this.j = j;
        this.objCollection[this.subsec].Width = $("#" + this.subsec).outerWidth();
        this.objCollection[this.subsec].Height = $("#" + this.subsec).outerHeight();
        this.objCollection[this.subsec].WidthPt = this.repExtern.convertTopoints($("#" + this.subsec).outerWidth());
        this.objCollection[this.subsec].HeightPt = this.repExtern.convertTopoints($("#" + this.subsec).outerHeight());
        $.each($("#" + this.subsec).children().not(".ui-resizable-handle"), this.findPageElements.bind(this));
    };//.........save/commit

    this.findPageElements = function (k, elements) {
        var elemId = $(elements).attr('id');
        var eb_typeCntl = $("#" + this.subsec).attr("eb-type");
        if ($(elements).attr("eb-type") === "Table_Layout") {
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
            $(".page").css("width", this.width);
            $(".page-reportLayer").css({ "height": this.height, "width": this.width });
            $(".headersections-report-layer").css({ "height": this.height });
        }
        else if (obj.PaperSize === 5) {
            if (obj.CustomPaperHeight !== 0 && obj.CustomPaperWidth !== 0) {
                this.height = obj.CustomPaperHeight;
                this.width = obj.CustomPaperWidth;
                $(".page").css({ "width": this.width });
                $(".headersections-report-layer").css({ "height": this.height });
                $(".page-reportLayer").css({ "height": this.height, "width": this.width });
            }
        }
    };//page size change fn

    this.setpageMode = function (obj) {
        [this.height, this.width] = [this.width, this.height];
        $("#page").css({ "width": this.width});
        $("#page-reportLayer").css({ "width": this.width,height:this.height});
        $(".headersections-report-layer").css({ "height": this.height });
    };//page layout lands/port

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
        let p = this.RbCommon.RbObjProps;

        for (let k = 0; k <p.length; k++) {
            this.getContainerId(this.EditObj[p[k]].$values);
        }
        this.appendHTMLonEdit(this.EditObj["ReportObjects"].$values, "ReportObjects");

        $.extend(this.EbObject.Margin, this.EditObj.Margin);//copy margin

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
            if (editControl.$type.split(",")[0].split(".").pop() === "EbTable_Layout")
                this.RbCommon.drawTableOnEdit(editControl);
            else if (editControl.ParentName !== "Table_Layout")
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
		$control.EbSid = Objid; $control.Name = editControl.Name;
        this.objCollection[Objid] = $control;
        this.RefreshControl($control);
        this.pg.addToDD(this.objCollection[Objid]);
        return $control;
    }

    this.pg.PropertyChanged = function (obj, pname) {
        if (pname === 'RowCount' || pname === 'ColoumCount') {
            this.TableCollection[obj.EbSid].pgChange(obj, pname);
        }
        else if (pname === "DataSourceRefId") {
            this.getDataSourceColoums(obj.DataSourceRefId);
        }
        else if (pname === "PaperSize" || pname === "CustomPaperHeight" || pname === "CustomPaperWidth") {
            this.setpageSize(obj);
        }
        else if (pname === "IsLandscape") {
            this.setpageMode(obj);
        }
        else if (pname === "ImageRefId" || pname === "WaterMark") {
            this.addImageFn(obj);
        }
        else if (pname === "ValueExpression") {
            this.RbCommon.ValidateCalcExpression(obj);
        }
        else if (pname === "WaterMarkText") {
            obj.Source = "";
            this.RefreshControl(obj);
        }
        else if (pname === "Font") {
            this.repExtern.setFontProp(obj);
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

    this.pg.DD_onChange = function (e) {
        if ($(e.target).find('option:selected').attr("data-name") === "Report")
            this.pg.setObject(this.EbObject, AllMetas["EbReport"]);
    }.bind(this);
    
    this.newReport = function () {
        this.EbObject = new EbObjects["EbReport"]("Report");
        this.height = this.repExtern.convertPointToPixel(this.pages[this.type].height) + "px";
        this.width = this.repExtern.convertPointToPixel(this.pages[this.type].width) + "px";
        this.designHeight = "300px";
        this.EbObject.PaperSize = this.type;
        this.pg.setObject(this.EbObject, AllMetas["EbReport"]);
        $('.ruler,.rulerleft').empty();
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
        $('.ruler,.rulerleft').empty();
        this.ruler();
        this.createPage();
        this.DragDrop_Items();
        this.renderOnedit();
    };

    this.init = function () {
		this.GenerateButtons();
        if (this.EbObject === null || this.EbObject === "undefined")
            this.newReport();
        else
            this.editReport();
        this.RbCommon.drawLocConfig();
        this.RM = new ReportMenu(this);
        $("#rulerUnit").on('change', this.rulerChangeFn.bind(this));
        this.margin.Left = $(".track_line_vert1").position().left;
        this.margin.Right = $(".track_line_vert2").position().left;
    };//report execution start func
    this.init();
};


