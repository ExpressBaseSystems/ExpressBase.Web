var RptBuilder = function (option) {

    //let AllMetas = AllMetasRoot["EbReportObject"];// newly added line to declare a local variable named "AllMetas"  which contains contextaul metas

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
        $extCont: $("#PGgrid-report"),
        isDraggable: true
    });

    this.idCounter = CtrlCounters; //from c# //this.RbCommon.EbidCounter;
    this.subSecIdCounter = this.RbCommon.subSecCounter;
    this.EbObjectSections = this.RbCommon.EbObjectSections;
    this.msBoxSubNotation = this.RbCommon.msBoxSubNotation;
    this.pages = this.RbCommon.pages;
    this.TextAlign = EbEnums["EbTextAlign"];
    this.rulerTypesObj = this.RbCommon.EbRuler;
    this.TableCollection = {};

    this.GenerateButtons = function () {
        $("#obj_icons").empty();
        $("#obj_icons").append(`
			<button class='btn run' id='scheduler_init' data-toggle='tooltip' data-placement='bottom' title= 'Schedule'> <i class='fa fa-clock-o' aria-hidden='true'></i></button >
			`);
        $("#scheduler_init").off("click").on("click", this.DrawScheduler.bind(this));
    };

    this.DrawScheduler = function () {
        $('#schedulerlistmodal').modal('show');
    };

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
        var pxlabel = this.rulertype === "px" ? 5 : 1;
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

    this.createGroupSec = function () {
        for (let i = 0; i < this.EditObj.ReportGroups.$values.length; i++) {
            let o = this.AddGroupSection(null, null, null, this.EditObj.ReportGroups.$values[i]);
        }
    };

    this.syncHeight = function () {
        for (let i = 0; i < 5; i++) {
            $(".headersections .header_box").eq(i).css({ height: $(".page .Eb_ReportSections").eq(i).innerHeight() });
        }
    };

    this.syncInner = function (_target) {
        let sec = _target.attr("eb-type");
        if (sec !== "GroupHeader" && sec !== "GroupFooter")
            $(`.multiSplit .${sec} .multiSplitHboxSub`).eq(_target.index()).css({ height: _target.outerHeight() });
        else
            $(`.multiSplit .ReportDetail .multiSplitHboxSub`).eq(_target.index()).css({ height: _target.outerHeight() });
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

    this.appendSubSection = function (sections, subSecArray, _new = false) {
        for (let k = 0; k < subSecArray.length; k++) {
            let id = sections + this.idCounter[sections + "Counter"]++;
            let o = new EbObjects["Eb" + sections](id);
            o.DisplayName = id;
            if (_new)
                $(`.page [eb-type='${sections}']`).last().after(o.$Control.outerHTML());
            else
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
            this.appendMSplitSec(sections, o, _new);
            this.pushSubsecToRptObj(sections, o);
        }
    };

    this.appendNewSubDiv = function (_sec) {
        this.appendSubSection(_sec, [1], true);
        this.syncHeight();
    };

    this.AddGroupSection = function (eType, selector, action, groupo = null) {
        let c = this.idCounter["ReportGroupCounter"]++;
        let id = "ReportGroup" + c;
        let o = new EbObjects.EbReportGroup(id);
        this.EbObject.ReportGroups.$values.push(o);

        let hid = "Group" + c + "_header";
        let h = new EbObjects.EbGroupHeader(hid);
        h.Order = c;
        h.SectionHeight = (groupo === null) ? h.SectionHeight : this.repExtern.convertPointToPixel(groupo.GroupHeader.HeightPt) + "px";

        let fid = "Group" + c + "_footer";
        let f = new EbObjects.EbGroupFooter(fid);
        f.Order = c;
        f.SectionHeight = (groupo === null) ? h.SectionHeight : this.repExtern.convertPointToPixel(groupo.GroupFooter.HeightPt) + "px";

        this.objCollection[hid] = h;
        this.objCollection[fid] = f;

        o.GroupHeader = h;
        o.GroupFooter = f;

        $(".page #detail [eb-type='ReportDetail']:eq(0)").before(h.$Control.outerHTML());
        $(".page #detail [eb-type='ReportDetail']").last().after(f.$Control.outerHTML());

        this.RefreshControl(h);
        this.pg.setObject(h, AllMetas.EbGroupHeader);
        this.pg.addToDD(h);

        this.RefreshControl(f);
        this.pg.setObject(f, AllMetas.EbGroupFooter);
        this.pg.addToDD(f);

        this.makeSecResizable(`#${fid}`);
        this.makeSecResizable(`#${hid}`);

        this.appendMSplitGroup(h, f,c);

        return { header: h, footer: f };
    };

    this.appendMSplitGroup = function (h, f, c) {
        $(".multiSplit .ReportDetail").find(".ReportDetail_sub:eq(0)").before(`<div class='multiSplitHboxSub GroupHeader_sub' id="GroupHeader_ms${h.Order}" eb-type='MultiSplitBox' style='height:${h.SectionHeight}'>
                <p class="sub_sec_notation">G${c}H</p></div>`);
        $(".multiSplit .ReportDetail .ReportDetail_sub").last().after(`<div class='multiSplitHboxSub GroupFooter${h.Order}_sub' id="GroupFooter_ms${f.Order}" eb-type='MultiSplitBox' style='height:${f.SectionHeight}'>
                <p class="sub_sec_notation">G${c}F</p></div>`);
        this.syncHeight();
    };

    this.appendMSplitSec = function (sections, obj,_new) {
        let h = $(`.page .${sections}`).height();
        if (_new) {
            $(`.multiSplit .${sections}_sub`).last().after(`<div class='multiSplitHboxSub ${sections}_sub' eb-type='MultiSplitBox' style='height:${obj.SectionHeight}'>
                <p class="sub_sec_notation">${this.msBoxSubNotation[sections].Notation + this.msBoxSubNotation[sections].Counter++}</p></div>`);
        }
        else {
            $(".multiSplit ." + sections).append(`<div class='multiSplitHboxSub ${sections}_sub' eb-type='MultiSplitBox' style='height:${obj.SectionHeight}'>
                <p class="sub_sec_notation">${this.msBoxSubNotation[sections].Notation + this.msBoxSubNotation[sections].Counter++}</p></div>`);
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
            obj.Name = this.RbCommon.GenUniqName(obj.Name);
            obj.Top = this.getPositionTop();
            obj.Left = this.leftwithMargin();
            if (this.col.hasClass('coloums')) {
                obj.DbType = this.col.attr("DbType");
                obj.TableIndex = parseInt(this.col.parent().parent().siblings("a").text().slice(-1));
                obj.ColumnName = this.col.text().trim();
            }
            obj.Title = obj.Title || Title;
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
    };

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
        $('#guid-v').css({ 'left': (event.pageX - $(this.containment).offset().left) - (this.reDragLeft + 1) });
        $('#guid-h').css({ 'top': (event.pageY - $(this.containment).offset().top) - (this.reDragTop + 1) });
        $('#guid-vr').css({ 'left': ((event.pageX - $(this.containment).offset().left) - (this.reDragLeft + 1)) + ($(event.target).width() + 3) });
        $('#guid-hb').css({ 'top': ((event.pageY - $(this.containment).offset().top) - (this.reDragTop + 1)) + ($(event.target).height() + 3) });
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
        this.repExtern.emptyGroups(this.EbObject);// empty groupheaders and group footers

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
            this.pushToSections($(elements), this.j, eb_typeCntl, this.subsec);
        }
        else
            this.pushToSections($(elements), this.j, eb_typeCntl, this.subsec);
    };

    this.updateCntrolDimension = function (elemId) {
        this.objCollection[elemId].Width = $(`#${elemId}`).width();
        this.objCollection[elemId].Height = $(`#${elemId}`).height();
        this.objCollection[elemId].Left = $(`#${elemId}`).position().left;
        this.objCollection[elemId].Top = $(`#${elemId}`).position().top;
    };

    this.pushToSections = function ($elements, index, eb_typeCntl, section) {
        var elemId = $elements.attr('id');
        this.updateCntrolDimension(elemId);
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
            index = this.getArrayIndex(this.EbObject.Detail.$values, section);
            this.EbObject.Detail.$values[index].Fields.$values.push(this.objCollection[elemId]);
        }
        else if (eb_typeCntl === 'GroupHeader') {
            let i = this.objCollection[$("#" + section).attr("id")].Order;
            this.EbObject.ReportGroups.$values[i].GroupHeader.Fields.$values.push(this.objCollection[elemId]);
        }
        else if (eb_typeCntl === 'GroupFooter') {
            let i = this.objCollection[$("#" + section).attr("id")].Order;
            this.EbObject.ReportGroups.$values[i].GroupFooter.Fields.$values.push(this.objCollection[elemId]);
        }
    };

    this.getArrayIndex = function (array, id) {
        for (let i = 0; i < array.length; i++) {
            if (array[i].EbSid === id)
                return i;
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
        $("#page").css({ "width": this.width });
        $("#page-reportLayer").css({ "width": this.width, height: this.height });
        $(".headersections-report-layer").css({ "height": this.height });
    };//page layout lands/port

    this.rulerChangeFn = function (e) {
        this.rulertype = $(e.target).val();
        $('.ruler,.rulerleft').empty();
        this.ruler();
    };

    this.changeSummaryFunc = function (obj) {
        obj.Title = obj.Title.replace(obj.Title.substr(0, obj.Title.indexOf('_')), summaryFunc[obj.Function]);
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

        for (let k = 0; k < p.length; k++) {
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
            if ($secColl[i].$type.indexOf("EbReportGroup") <= 0) {
                this.containerId = $("#" + $secColl[i].EbSid);
                this.appendHTMLonEdit($secColl[i].Fields.$values);
            }
            else {
                this.containerId = $(`#${$secColl[i].GroupHeader.EbSid}`);
                this.appendHTMLonEdit($secColl[i].GroupHeader.Fields.$values);

                this.containerId = $(`#${$secColl[i].GroupFooter.EbSid}`);
                this.appendHTMLonEdit($secColl[i].GroupFooter.Fields.$values);
            }
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
        //this.repExtern.replaceProp($control, editControl);
        $.extend($control, editControl);
        $control.EbSid = Objid; $control.Name = editControl.Name;
        this.objCollection[Objid] = $control;
        this.RefreshControl($control);
        this.pg.setObject(this.objCollection[Objid], AllMetas["Eb" + eb_type]);
        return $control;
    };

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
        else if (pname === "ValExpression") {
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
        this.EbObject = new EbObjects["EbReport"]("Report_" + Date.now().toString(36));
        this.EbObject.DisplayName = this.EbObject.Name;
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
        this.createGroupSec();//appending group section
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



var ReportExtended = function (Rpt_obj) {
    this.Rpt = Rpt_obj;
    this.sideBar = $("#side-toolbar");
    this.pageContainer = $("#page-outer-cont");
    this.pGcontainer = $("#PGgrid-report");
    this.dpiX = $(".get_ScreenDpi_div").height();
    this.GroupSelect = [];

    this.appendFontLink = function (cssfont) {
        $("head").append("<link rel='stylesheet' type='text/css' href='https://fonts.googleapis.com/css?family='" + cssfont + "'/>");
    };

    this.keyInteractions = function (event) {
        var eb_cntrol = this.Rpt.objCollection[event.target.id];
        var js_cntrol = event;
        if ([37, 38, 39, 40].indexOf(event.which) >= 0)
            this.moveCtrl(js_cntrol, eb_cntrol);
        else
            this.keyCtrolFn(js_cntrol, eb_cntrol);
    };

    this.keyCtrolFn = function (js_cntrol, eb_cntrol) {
        var jq_cntrol = $(js_cntrol.target);

        if (js_cntrol.which === 46) {
            delete this.Rpt.objCollection[js_cntrol.id];
            jq_cntrol.remove(); this.Rpt.pg.removeFromDD(eb_cntrol.EbSid);
        }
        else if (event.ctrlKey)
            this.markEbCntrol(js_cntrol, eb_cntrol);
    };

    this.moveCtrl = function (js_cntrol, eb_cntrol) {
        var jq_cntrol = $(js_cntrol.target);
        if (jq_cntrol.css("left") !== 0 || jq_cntrol.css("top") !== 0) {
            if (js_cntrol.which === 37) {
                jq_cntrol.finish().animate({ left: "-=1" });
            }
            else if (js_cntrol.which === 38) {
                jq_cntrol.finish().animate({ top: "-=1" });
            }
            else if (js_cntrol.which === 39) {
                jq_cntrol.finish().animate({ left: "+=1" });
            }
            else if (js_cntrol.which === 40) {
                jq_cntrol.finish().animate({ top: "+=1" });
            }
            eb_cntrol.Left = jq_cntrol.position().left;
            eb_cntrol.Top = jq_cntrol.position().top;
        }
    };

    this.markEbCntrol = function (js_cntrol, eb_cntrol) {
        $(js_cntrol.target).toggleClass("marked");
    };

    this.alignGroup = function (eType, selector, action, originalEvent) {
        var top = $(selector.selector).css("top");
        var left = $(selector.selector).css("left");
        var parent = $(selector.selector).parent();
        switch (eType) {
            case "Top":
                this.applyToGroupSelect(parent, "top", top);
                break;
            case "Left":
                this.applyToGroupSelect(parent, "left", left);
                break;
            case "Bottom":

                break;
            case "Right":
                this.applyToGroupSelect(parent, "left", left);
                break;
        }
    }.bind(this);

    this.applyToGroupSelect = function (parent, item, val) {
        $.each(parent.children(".marked"), function (i, obj) {
            $(obj).css(item, val);
            $(obj).removeClass("marked");
        });
    };

    this.setBackgroud = function (url) {
        $(".page").css("background", "url('" + window.location.protocol + "//" + window.location.host + "/static/" + url + ".JPG" + "') center no-repeat");
    };

    this.mapCollectionToSection = function (sec) {
        var collection = "";
        if (sec === "ReportHeader")
            collection = "ReportHeaders";
        else if (sec === "PageHeader")
            collection = "PageHeaders";
        else if (sec === "ReportDetail")
            collection = "Detail";
        else if (sec === "PageFooter")
            collection = "PageFooters";
        else if (sec === "ReportFooter")
            collection = "ReportFooters";
        return collection;
    };

    this.replaceProp = function (source, destination) {
        for (var objPropIndex in source) {
            if (typeof source[objPropIndex] !== "object" || objPropIndex === "Font") {
                if (['Width', 'Height', 'Left', 'Top'].indexOf(objPropIndex) > -1)
                    source[objPropIndex] = this.convertPointToPixel(destination[objPropIndex + "Pt"]);
                else
                    source[objPropIndex] = destination[objPropIndex];
            }
        }
    };

    this.replaceWOPtConvProp = function (source, destination) {
        for (var objPropIndex in source) {
            if (typeof source[objPropIndex] !== "object") {
                source[objPropIndex] = destination[objPropIndex];
            }
        }
    };

    this.convertTopoints = function (val) {
        var pixel = val;
        var point = (pixel * 72) / this.dpiX;
        return point;
    };

    this.convertPointToPixel = function (val) {
        var points = val;
        var pixel = (points * this.dpiX) / 72;
        return pixel;
    };

    this.convertPixelToPercent = function (SubsecHArr) {
        var tot = SubsecHArr.reduce((x, y) => x + y);
        for (var i = 0; i < SubsecHArr.length; i++) {
            SubsecHArr[i] = (SubsecHArr[i] / tot) * 100;
        }
        return SubsecHArr;
    };

    this.ControlCollection = ["ReportHeaders", "ReportFooters", "PageHeaders", "PageFooters", "Detail"];
    this.emptyControlCollection = function (rptObj) {
        for (var objPropIndex in rptObj) {
            if (this.ControlCollection.indexOf(objPropIndex) >= 0)
                this.emptyCConESec(rptObj[objPropIndex]);
            else if (objPropIndex === "ReportObjects")
                rptObj[objPropIndex].$values.length = 0;
        }
    };

    this.emptyGroups = function (o) {
        for (let i = 0; i < o.ReportGroups.$values.length; i++) {
            o.ReportGroups.$values[i].GroupFooter.Fields.$values.length = 0;
            o.ReportGroups.$values[i].GroupHeader.Fields.$values.length = 0;
        }
    };

    this.emptyCConESec = function (rptObjsubsec) {
        for (var i = 0; i < rptObjsubsec.$values.length; i++) {
            rptObjsubsec.$values[i].Fields.$values.length = 0;
        }
    };

    this.setFontProp = function (fobj) {
        var _font = ("Font" in fobj) ? fobj.Font : null;

        if (_font !== null && _font !== undefined) {
            var caps = (_font.Caps) ? "uppercase" : "lowercase";
            var decor = "";
            var style = "";
            var weight = "";

            var font = _font.CSSFontName === null ? "Times" : _font.CSSFontName;
            if (!this.Rpt.isNew)
                this.appendFontLink(font);

            var size = _font.Size === 0 ? "14px" : _font.Size + "px";

            if (_font.Strikethrough)
                decor = "line-through";
            else if (_font.Underline)
                decor = "underline";
            else
                decor = "none";

            if (_font.Style === 0) {
                style = "normal";
                weight = "normal";
            }
            else if (_font.Style === 2) {
                style = "italic";
                weight = "normal";
            }
            else if (_font.Style === 1) {
                style = "normal";
                weight = "bold";
            }
            else {
                style = "italic";
                weight = "bold";
            }
            $("#" + fobj.EbSid).css({
                "font-family": font,
                "font-size": size,
                "text-decoration": decor,
                "font-style": style,
                "font-weight": weight,
                "text-transform": caps,
                "color": _font.color
            });
        }
    };

    $('body').off("keydown").on("keydown", ".dropped", this.keyInteractions.bind(this));
};

var RbCommon = function (RbMainObj) {
    this.RbObj = RbMainObj;
    var _hasSummary = ["EbDataFieldNumeric", "EbCalcField", "EbDataFieldBoolean", "EbDataFieldText", "EbDataFieldDateTime"];
    var $funcselect = $("#summarry-editor-modal-container #summary-func").empty();
    var $sectionselect = $("#summarry-editor-modal-container #summary-sections").empty();
    var fields = $("#summarry-editor-modal-container #summary-fieldname").empty();
    var $summModal = $("#summarry-editor-modal-container");
    var EbParams = {
        Icons: {
            "Numeric": "fa-sort-numeric-asc",
            "String": "fa-font",
            "DateTime": "fa-calendar",
            "Bool": ""
        },
        EbType: {
            "Numeric": "ParamNumeric",
            "String": "ParamText",
            "DateTime": "ParamDateTime",
            "Bool": "ParamBoolean"
        }
    };

    this.subSecCounter = {
        Countrpthead: 1,
        Countpghead: 1,
        Countdetail: 1,
        Countpgfooter: 1,
        Countrptfooter: 1
    };

    this.RbObjProps = ["ReportHeaders", "ReportFooters", "PageHeaders", "PageFooters", "Detail", "ReportGroups"];

    this.EbObjectSections = ["ReportHeader", "PageHeader", "ReportDetail", "PageFooter", "ReportFooter"];

    this.msBoxSubNotation = {
        ReportHeader: { Notation: 'Rh', Counter: 0 },
        PageHeader: { Notation: 'Ph', Counter: 0 },
        ReportDetail: { Notation: 'Dt', Counter: 0 },
        PageFooter: { Notation: 'Pf', Counter: 0 },
        ReportFooter: { Notation: 'Rf', Counter: 0 }
    };

    this.pages = {
        0: {
            width: 1191,
            height: 1684
        },//A2
        1: {
            width: 841.8898,
            height: 1190.55
        },//A3
        2: {
            width: 595.276,
            height: 841.8898
        },//A4      
        3: {
            width: 419.5276,
            height: 595.276
        },//A5 
        4: {
            width: 612,
            height: 792
        },//letter
    };
    this.EbRuler = {
        px: {
            minor: "tickMinor",
            major: "tickMajor",
            label: "tickLabel",
            len: 5
        },
        cm: {
            minor: "tickMinor-cm",
            major: "tickMajor-cm",
            label: "tickLabel-cm",
            len: 3.77
        },
        inch: {
            minor: "tickMinor-inch",
            major: "tickMajor-inch",
            label: "tickLabel-inch",
            len: 9.6
        }
    };

    this.TextAlign = {
        0: "left",
        2: "right",
        1: "center",
        3: "justify"
    };

    this.GenUniqName = function (ctrl_name) {
        return ctrl_name + "_" + Math.floor(Date.now() / 1000);
    };

    this.setMarginOnedit = function (margin) {
        $(".track_line_vert1").css("left", this.RbObj.repExtern.convertPointToPixel(margin.Left));
        this.RbObj.margin.Left = $(".track_line_vert1").position().left;
        $(".track_line_vert2").css("left", parseFloat(this.RbObj.width) - this.RbObj.repExtern.convertPointToPixel(margin.Right));
        this.RbObj.margin.Right = $(".track_line_vert2").position().left;
        $(".pageHeaders").css({ "padding-left": $(".track_line_vert1").position().left, "padding-right": parseFloat(this.RbObj.width) - $(".track_line_vert2").position().left });
    };

    this.onTrackerStop = function (e, ui) {
        var $t = $(ui.helper);
        if ($t.hasClass("track_line_vert1")) {
            $(".pageHeaders").css("padding-left", $t.position().left);
            this.RbObj.margin.Left = $t.position().left;
        }
        else {
            $(".pageHeaders").css("padding-right", parseFloat(this.RbObj.width) - $t.position().left);
            this.RbObj.margin.Right = $t.position().left;
        }
    };

    this.windowscroll = function () {
        var $layer = null;
        if ($(".page-reportLayer").is(":visible"))
            $layer = ".page-reportLayer";
        else
            $layer = ".page";
        $(".tracker_drag").css({ "height": ($($layer).height() - $(window).scrollTop()) + 20, "top": $(window).scrollTop() });
    };//need to remove

    this.getsummaryfns = function (eb_type) {//neeed to change
        var fn = null;
        if (eb_type === "EbDataFieldText" || eb_type === "Text")
            fn = "SummaryFunctionsText";
        else if (eb_type === "EbDataFieldDateTime" || eb_type === "DateTime")
            fn = "SummaryFunctionsDateTime";
        else if (eb_type === "EbDataFieldBoolean" || eb_type === "Boolean")
            fn = "SummaryFunctionsBoolean";
        else if (eb_type === "EbDataFieldNumeric" || eb_type === "Numeric")
            fn = "SummaryFunctionsNumeric";
        return EbEnums[fn];
    };

    this.getSectionToAddSum = function () {
        var objlist = [];
        $("#ReportDetail0").parent().nextAll().not("#ReportDetail").each(function (i, obj) {
            $(obj).children().each(function (j, sections) {
                objlist.push($(sections));
            });
        });
        return objlist;
    };

    this.ValidateCalcExpression = function (obj) {
        $.ajax({
            url: "../RB/ValidateCalcExpression",
            type: "POST",
            cache: false,
            data: {
                refid: this.RbObj.EbObject.DataSourceRefId,
                expression: atob(obj.ValExpression.Code)
            },
            success: function (result) {
                this.setCalcFieldType(obj, JSON.parse(result));
            }.bind(this)
        });
    };

    this.setCalcFieldType = function (obj, result) {
        obj.CalcFieldIntType = result.Type;
        if (result.Type === 16)
            obj.CalcFieldType = "Text";
        else if (result.Type === 7 || result.Type === 8 || result.Type === 10 || result.Type === 11 || result.Type === 12 || result.Type === 21)
            obj.CalcFieldType = "Numeric";
        else if (result.Type === 3)
            obj.CalcFieldType = "Boolean";
        else if (result.Typee === 5 || result.Type === 6 || result.Type === 17 || result.Type === 26)
            obj.CalcFieldType = "DateTime";

        this.RbObj.RefreshControl(obj);
    };

    this.newCalcFieldSum = function () {
        $("#eb_calcF_summarry").modal("toggle");
        $("#calcF_submit").off("click").on("click", this.addCalcField.bind(this));
    };

    this.addCalcField = function () {
        var name = $("#calcF_name").val().trim();
        var vexp = $("#calcF_valueExpr").val().trim();
        var Objid = "CalcField" + (this.RbObj.idCounter["CalcFieldCounter"])++;
        var obj = new EbObjects["EbCalcField"](Objid);
        $("#ReportDetail0").append(obj.$Control.outerHTML());
        obj.ValExpression.Code = btoa(vexp);
        obj.Name = name || Objid;
        obj.Title = name || Objid;
        this.RbObj.objCollection[Objid] = obj;
        this.RbObj.RefreshControl(obj);
        $("#eb_calcF_summarry").modal("toggle");
        if (obj.ValExpression.Code)
            this.ValidateCalcExpression(obj);//returns the type of expression
        $("#calcFields ul[id='calcfields-childul']").append(`<li class='styl'><div tabindex='1' $(this).focus(); class='textval' EbSid="${obj.EbSid}">
            ${obj.Name}</div></li>`);
    };

    this.addSummarry = function () {
        $summModal.modal("toggle");
        var sections = this.getSectionToAddSum();
        $sectionselect.empty(); fields.empty();
        for (var ite in this.RbObj.objCollection) {
            var t = this.RbObj.objCollection[ite].$type.split(",")[0].split(".").pop();
            if (_hasSummary.indexOf(t) >= 0) {
                fields.append(`<option eb-type="${t}"
                value="${this.RbObj.objCollection[ite].Name}" EbSid="${this.RbObj.objCollection[ite].EbSid}">${this.RbObj.objCollection[ite].Title}</option>`);
            }
        }
        for (var i = 0; i < sections.length; i++) {
            $sectionselect.append(`<option 
                value="#${sections[i].attr("id")}">${sections[i].attr("eb-type") + sections[i].attr("id").slice(-1)}</option>`);
        }
        fields.off("change").on("change", function (e) {
            $funcselect.empty();
            var obj = this.RbObj.objCollection[$(e.target).find('option:selected').attr("EbSid")];
            var t = obj.$type.split(",")[0].split(".").pop() === "EbCalcField" ? obj.CalcFieldType : obj.$type.split(",")[0].split(".").pop();
            var summaryFunc = this.getsummaryfns(t);//object
            for (var func in summaryFunc) {
                $funcselect.append(`<option 
               value="${func}">${func}</option>`);
            }
        }.bind(this));
        $("#submit-summary").off("click").on("click", this.appendSummaryField.bind(this));
        fields.trigger("change");
    };

    this.appendSummaryField = function (e) {
        $summModal.modal("toggle");
        var cft = $("#" + fields.find('option:selected').attr("EbSid")).attr("cftype") || "";
        var type = $("#" + fields.find('option:selected').attr("EbSid")).attr("eb-type") + cft;
        var Objid = type + "Summary" + this.RbObj.idCounter[type + "SummaryCounter"]++;
        var obj = new EbObjects["Eb" + type + "Summary"](Objid);
        $($sectionselect.val()).append(obj.$Control.outerHTML());
        obj.SummaryOf = fields.val();
        obj.Name = Objid;
        obj.Title = $funcselect.val() + "_" + fields.find('option:selected').text();
        obj.Function = $funcselect.val();
        obj.Left = this.RbObj.objCollection[fields.find('option:selected').attr("EbSid")].Left;
        this.RbObj.objCollection[Objid] = obj;
        this.RbObj.RefreshControl(obj);
        $("#running-summary ul[id='running-summary-childul']").append(`<li class='styl'><div tabindex='1' $(this).focus(); class='textval'>
            ${$funcselect.val()} (${fields.find('option:selected').text().trim()})</div></li>`);
    };

    this.resizeTdOnLayoutResize = function (id) {
        $(`#${id}`).find("td").each(function (i, obj) {
            if ($(obj).find(".dropped").length > 0) {
                let ctrl = $(obj).children(".dropped").eq(0);
                this.RbObj.objCollection[ctrl.attr("id")].Width = $(`#${ctrl.attr("id")}`).innerWidth();
                this.RbObj.objCollection[ctrl.attr("id")].Height = $(`#${ctrl.attr("id")}`).innerHeight();
            }
        }.bind(this));
        this.RbObj.objCollection[id].Height = $("#" + id).height();
        this.RbObj.objCollection[id].Width = $("#" + id).width();
    };

    this.makeReadOnlyonPg = function (curObject) {
        this.RbObj.pg.MakeReadOnly(["Width", "Height", "Left", "Top"]);
    };

    this.buildTableHierarcy = function ($elements, index, eb_typeCntl) {
        this._table = this.RbObj.objCollection[$elements.attr("id")];
        this._table.CellCollection.$values.length = 0;
        this.eb_typeCntl = eb_typeCntl;
        this.sectionIndex = index;

        $elements.find("td").each(function (i, js_objtd) {
            var td_obj = new EbObjects["EbTableLayoutCell"]("TableLayoutCell" + this.RbObj.idCounter["TableLayoutCellCounter"]++);
            td_obj.RowIndex = $(js_objtd).parent("tr").index();
            td_obj.CellIndex = $(js_objtd).index();
            td_obj.Height = $(js_objtd).closest("tr").height();
            td_obj.Width = $(js_objtd).width();
            this.getTdCtrls($(js_objtd), td_obj);
        }.bind(this));
    };

    this.getTdCtrls = function ($td, eb_obj) {
        $td.find(".dropped").each(function (k, ebctrl) {
            if ($(ebctrl).length >= 1) {
                var eb_type = this.RbObj.objCollection[$(ebctrl).attr("id")].$type.split(",")[0].split(".").pop().substring(2);
                if (eb_type === "Table_Layout")
                    this.innerTableOnEdit(this.RbObj.objCollection[$(ebctrl).attr("id")]);
                else {
                    this.RbObj.objCollection[$(ebctrl).attr("id")].Left = $(ebctrl).position().left + $td.position().left + parseFloat(this._table.Left);
                    this.RbObj.objCollection[$(ebctrl).attr("id")].Top = $(ebctrl).position().top + $td.position().top + parseFloat(this._table.Top);
                    this.RbObj.objCollection[$(ebctrl).attr("id")].Width = $(ebctrl).innerWidth();
                    this.RbObj.objCollection[$(ebctrl).attr("id")].Height = $(ebctrl).innerHeight();
                    eb_obj.ControlCollection.$values.push(this.RbObj.objCollection[$(ebctrl).attr("id")]);
                    this.RbObj.pushToSections($(ebctrl), this.sectionIndex, this.eb_typeCntl);
                }
            }
        }.bind(this));
        this._table.CellCollection.$values.push(eb_obj);
    };

    this.drawTableOnEdit = function (editControl) {
        let o = new EbTableLayout(this.RbObj, editControl);
        this.RbObj.TableCollection[o.EbCtrl.EbSid] = o;
    };

    this.innerTableOnEdit = function (ebctrl) {

    };

    this.drawDsParmsTree = function (paramsList) {
        var icon = "";
        var t = "";
        paramsList.forEach(function (param) {
            if (param.type === "16") {
                t = EbParams.EbType["String"];
                icon = EbParams.Icons["String"];
            }
            else if (param.type === "7" || param.type === "8" || param.type === "10" || param.type === "11" || param.type === "12" || param.type === "21") {
                t = EbParams.EbType["Numeric"];
                icon = EbParams.Icons["Numeric"];
            }
            else if (param.type === "3") {
                t = EbParams.EbType["Bool"];
                icon = EbParams.Icons["Bool"];
            }
            else if (param.type === "5" || param.type === "6" || param.type === "17" || param.type === "26") {
                t = EbParams.EbType["DateTime"];
                icon = EbParams.Icons["DateTime"];
            }

            $("#ds_parameter_list ul[id='ds_parameters']").append(`<li class='styl'><span eb-type='${t}' class='fd_params draggable textval'><i class='fa ${icon}'></i> ${param.name}</span></li>`);
        });
        $('#ds_parameter_list').killTree();
        $('#ds_parameter_list').treed();
        this.RbObj.DragDrop_Items();
    };

    this.drawDsColTree = function (colList) {
        var type, icon = "";
        $.each(colList, function (i, columnCollection) {
            $("#data-table-list ul[id='dataSource']").append(" <li><a>Table " + i + "</a><ul id='t" + i + "'></ul></li>");
            $.each(columnCollection, function (j, obj) {
                if (obj.type === 16) {
                    type = "DataFieldText"; icon = EbParams.Icons["String"];
                }
                else if (obj.type === 7 || obj.type === 8 || obj.type === 10 || obj.type === 11 || obj.type === 12 || obj.type === 21) {
                    type = "DataFieldNumeric"; icon = EbParams.Icons["Numeric"];
                }
                else if (obj.type === 3) {
                    type = "DataFieldBoolean"; icon = EbParams.Icons["Bool"];
                }
                else if (obj.type === 5 || obj.type === 6 || obj.type === 17 || obj.type === 26) {
                    type = "DataFieldDateTime"; icon = EbParams.Icons["DateTime"];
                }
                $("#data-table-list ul[id='t" + i + "']").append(`<li class='styl'><span eb-type='${type}' DbType='${obj.type}' class='coloums draggable textval'><i class='fa ${icon}'></i> ${obj.columnName}</span></li>`);
            });
        });
        $('#data-table-list').killTree();
        $('#data-table-list').treed();
        this.RbObj.DragDrop_Items();
    };

    this.drawLocConfig = function () {
        let conf = this.RbObj.LocConfig;
        for (let i = 0; i < conf.length; i++) {
            let icon = (conf[i].Type === "Image") ? `fa-picture-o` : 'fa-text-width';
            $("#eb-Location-config ul[id='eb-Location-config_child']").append(`
                        <li class="styl"><span eb-type='LocField${conf[i].Type}' class='draggable textval'>
                        <i class="fa ${icon}"></i> ${conf[i].Name}</span>
                        </li>`);
        }
        $('#eb-Location-config').killTree();
        $('#eb-Location-config').treed();
        this.RbObj.DragDrop_Items();
    };

    this.switchlayer = function (e) {
        var target = $(e.target).closest(".Rb_layer");
        if (!target.hasClass("layeractive")) {
            target.addClass("layeractive");
            target.siblings().removeClass("layeractive");
        }
        else {
            target.siblings().removeClass("layeractive");
        }

        if (target.attr("Layer") === "Section") {
            $(".multiSplit,.headersections,#page").show();
            $(".headersections-report-layer,#page-reportLayer").hide();
            $(".tracker_drag").css("height", "100%");
            this.RbObj.containment = ".page";
        }
        else {
            $(".multiSplit,.headersections,#page").hide();
            $(".headersections-report-layer,#page-reportLayer").show();
            $(".tracker_drag").css("height", "100%");
            this.RbObj.containment = ".page-reportLayer";
        }
    };

    commonO.PreviewObject = function () {
        $("#preview_wrapper").empty();
        commonO.Save();
    };

    commonO.saveOrCommitSuccess = function (res) {
        this.refid = res.refid || null;
        $.ajax({
            url: "../ReportRender/Index",
            type: "POST",
            cache: false,
            data: {
                refid: this.refid,
                renderLimit: true
            },
            beforeSend: function () {
                $("#eb_common_loader").EbLoader("show");
            },
            success: function (result) {
                $("#preview_wrapper").html(result);
                $("#btnGo").off("click").on("click", this.render.bind(this));
                if ($("#btnGo").length <= 0) {
                    $("#sub_windows_sidediv_dv").hide();
                    $("#content_dv").removeClass("col-md-9").addClass("col-md-12");
                    $("#reportIframe").attr("src", `../ReportRender/RenderReport2?refid=${this.refid}`);
                }
            }.bind(this)
        });
    }.bind(this);

    this.render = function () {
        //$("#sub_windows_sidediv_dv").css("display", "none");
        //$("#content_dv").removeClass("col-md-9").addClass("col-md-12");
        //$.LoadingOverlay("show");
        $("#eb_common_loader").EbLoader("show");
        var ParamsArray = FilterDialog.getFormVals();


        //if (!validateFD()) {
        //    //$.LoadingOverlay("hide");
        //    $("#eb_common_loader").EbLoader("hide");
        //    $("#filter").trigger("click");
        //    return;
        //}
        $("#reportIframe").attr("src", `../ReportRender/Renderlink?refid=${this.refid}&_params=${btoa(JSON.stringify(ParamsArray))}`);
        // $("#RptModal").modal('hide');
        //$.LoadingOverlay("hide");
        $("#eb_common_loader").EbLoader("hide");
    };

    this.start = function () {
        $('.tracker_drag').draggable({ axis: "x", containment: ".page-outer-container", stop: this.onTrackerStop.bind(this) });
        //$(window).on("scroll", this.windowscroll.bind(this));
        $(".Rb_layer").off("click").on("click", this.switchlayer.bind(this));
        $(".add_calcfield").on("click", this.newCalcFieldSum.bind(this));
        $(".add_summarry").on("click", this.addSummarry.bind(this));
    };

    this.start();
};
var ReportMenu = function (option) {
    this.Rep = option;
    this.copyStack = null;
    this.copyORcut = null;
    this.objCollection = this.Rep.objCollection;
    this.repExtern = this.Rep.repExtern;
    this.L = 0;
    this.T = 0;

    this.disableMenuItem = function (key, opt) {
        let flag = opt.$trigger.data('cutDisabled');
        if (key === "delete") {
            if (opt.$trigger.hasClass("locked"))
                flag = !opt.$trigger.data('cutDisabled');
        }
        else if (key === "lock") {
            if (opt.$trigger.hasClass("locked"))
                flag = !opt.$trigger.data('cutDisabled');
        }
        else if (key === "unlock") {
            if (!opt.$trigger.hasClass("locked"))
                flag = !opt.$trigger.data('cutDisabled');
        }
        return flag;
    };

    this.contextMenucopy = function (eType, selector, action, originalEvent) {
        this.copyStack = $.extend({}, this.objCollection[$(selector.$trigger).attr('id')]);
        this.copyORcut = 'copy';
    };

    this.contextMenucut = function (eType, selector, action, originalEvent) {
        this.copyStack = this.objCollection[$(selector.$trigger).attr('id')];
        this.copyORcut = 'cut';
        $(selector.$trigger).remove();
    };

    this.contextMenupaste = function (eType, selector, action, originalEvent) {
        if (this.copyStack === null) { alert('no item copied'); }
        else {
            var $obj = {};
            var Objid = null;
            var Objtype = $("#" + this.copyStack.EbSid).attr('eb-type');
            if (this.copyORcut === 'copy') {
                Objid = Objtype + (this.Rep.idCounter[Objtype + "Counter"]++);
                $obj = new EbObjects["Eb" + Objtype](Objid);
                this.Rep.repExtern.replaceWOPtConvProp($obj, this.copyStack);
                $obj.EbSid = Objid;
                $obj.Name = Objid;
            }
            else if (this.copyORcut === 'cut') {
                $obj = this.copyStack;
                Objid = this.copyStack.EbSid;
            }
            $obj.Top = this.T;
            $obj.Left = this.L;
            $(selector.$trigger).append($obj.$Control.outerHTML());
            this.objCollection[Objid] = $obj;
            this.Rep.RefreshControl($obj);
            this.copyStack = null;
            this.copyORcut = null;
        }
    };

    this.contextMenudelete = function (eType, selector, action, originalEvent) {
        if ($(selector.$trigger).hasClass("pageHeaders")) {
            if ($(selector.$trigger).index() !== 0) {
                let sec = $(selector.$trigger).attr("eb-type");
                delete this.Rep.objCollection[$(selector.$trigger).attr("id")];
                this.removeSecEbobject(sec, $(selector.$trigger).attr("id"));
                this.Rep.pg.removeFromDD($(selector.$trigger).attr("id"));
                $(".multiSplit ." + sec).find(".multiSplitHboxSub").eq($(selector.$trigger).index()).remove();
                $(selector.$trigger).remove();
            }
        }
        else if ($(selector.$trigger).hasClass("pageGroups_header") || $(selector.$trigger).hasClass("pageGroups_footer")) {
            let o = this.Rep.objCollection[$(selector.$trigger).attr("id")];
            delete this.Rep.objCollection[`Group${o.Order}_header`];
            delete this.Rep.objCollection[`Group${o.Order}_footer`];
            this.removeSecEbobject("ReportGroups", "ReportGroup" + o.Order);
            this.Rep.pg.removeFromDD(`Group${o.Order}_header`);
            this.Rep.pg.removeFromDD(`Group${o.Order}_footer`);
            $(`.multiSplit .ReportDetail #GroupHeader_ms${o.Order}`).remove();
            $(`.multiSplit .ReportDetail #GroupFooter_ms${o.Order}`).remove();
            $(`#Group${o.Order}_header`).remove();
            $(`#Group${o.Order}_footer`).remove();
        }
        else {
            delete this.Rep.objCollection[$(selector.$trigger).attr("id")];
            this.Rep.pg.removeFromDD($(selector.$trigger).attr("id"));
            $(selector.$trigger).remove();
        }
        this.Rep.syncHeight();
    };

    this.removeSecEbobject = function (sections, id) {
        let array = null;
        if (sections === 'ReportHeader')
            array = this.Rep.EbObject.ReportHeaders.$values;
        else if (sections === 'PageHeader')
            array = this.Rep.EbObject.PageHeaders.$values;
        else if (sections === 'ReportFooter')
            array = this.Rep.EbObject.ReportFooters.$values;
        else if (sections === 'PageFooter')
            array = this.Rep.EbObject.PageFooters.$values;
        else if (sections === 'ReportDetail')
            array = this.Rep.EbObject.Detail.$values;
        else if (sections === 'ReportGroups')
            array = this.Rep.EbObject.ReportGroups.$values;

        for (let j = 0; j < array.length; j++) {
            let o = array[j];
            if (o.EbSid === id)
                array.splice(j, 1);
        }
    };

    this.contextMenuRight = function (eType, selector, action, originalEvent) {
        this.objCollection[$(selector.$trigger).attr("id")].TextAlign = parseInt(this.Rep.TextAlign["Right"]);
        $(selector.$trigger).css({ "justify-content": "flex-end" });
    };

    this.contextMenuCenter = function (eType, selector, action, originalEvent) {
        this.objCollection[$(selector.$trigger).attr("id")].TextAlign = parseInt(this.Rep.TextAlign["Center"]);
        $(selector.$trigger).css({ "justify-content": "center" });
    };

    this.contextMenuLeft = function (eType, selector, action, originalEvent) {
        this.objCollection[$(selector.$trigger).attr("id")].TextAlign = parseInt(this.Rep.TextAlign["Left"]);
        $(selector.$trigger).css({ "justify-content": "left" });
    };

    this.lockControl = function (eType, selector, action, originalEvent) {
        if (!$(selector.$trigger).hasClass("pageHeaders")) {
            $(selector.$trigger).addClass('locked').draggable('disable');
        }
        else if ($(selector.$trigger).hasClass("pageHeaders")) {
            $(selector.$trigger).addClass('locked').droppable({
                disabled: true
            }).resizable("disable");
            $(selector.$trigger).find(".dropped").each(function (i, obj) { $("#" + obj.id).addClass('locked').draggable('disable'); });
            $(".headersections").find("[data-sec='" + $(selector.$trigger).attr("eb-type") + "']").find(".hbox_notation_div").addClass("locked");
        }
    };

    this.unLockControl = function (eType, selector, action, originalEvent) {
        if (!$(selector.$trigger).hasClass("pageHeaders")) {
            $(selector.$trigger).removeClass('locked').draggable('enable');
        }
        else if ($(selector.$trigger).hasClass("pageHeaders")) {
            $(selector.$trigger).removeClass('locked').droppable({
                disabled: false
            }).resizable("enable");
            $(selector.$trigger).children().each(function (i, obj) { $("#" + obj.id).removeClass('locked').draggable('enable'); });
            $(".headersections").find("[data-sec='" + $(selector.$trigger).attr("eb-type") + "']").find(".hbox_notation_div").removeClass("locked");
        }
    };

    this.alignGroup = function (eType, selector, action, originalEvent) {
        var top = $(selector.$trigger).position().top;
        var left = $(selector.$trigger).position().left;
        var parent = $(selector.$trigger).parent();
        switch (eType) {
            case "Top":
                this.applyToGroupSelect(parent, "top", top);
                break;
            case "Left":
                this.applyToGroupSelect(parent, "left", left);
                break;
            case "Bottom":

                break;
            case "Right":
                this.applyToGroupSelect(parent, "right", left);
                break;
        }
    };

    this.applyToGroupSelect = function (parent, item, val) {
        $.each(parent.children(".marked"), function (i, obj) {
            $(obj).css(item, val);
            $(obj).removeClass("marked");
            if (item === "left")
                this.objCollection[$(obj).attr("id")].Left = val;
            else if (item === "top")
                this.objCollection[$(obj).attr("id")].Top = val;
        }.bind(this));
    };

    this.options = {
        "copy": { name: "Copy", icon: "copy", callback: this.contextMenucopy.bind(this) },
        "cut": { name: "Cut", icon: "cut", callback: this.contextMenucut.bind(this) },
        "delete": { name: "Delete", icon: "delete", callback: this.contextMenudelete.bind(this), disabled: this.disableMenuItem.bind(this) },
        "lock": {
            name: "Lock", icon: "fa-lock", callback: this.lockControl.bind(this),
            disabled: this.disableMenuItem.bind(this)
        },
        "unlock": {
            name: "unlock", icon: "fa-unlock", callback: this.unLockControl.bind(this),
            disabled: this.disableMenuItem.bind(this)
        },
        "fold2": {
            "name": "Align", icon: "",
            "items": {
                "Top": { name: "Top", icon: "", callback: this.alignGroup.bind(this) },
                "Bottom": { name: "Bottom", icon: "", callback: this.alignGroup.bind(this) },
                "Left": { name: "Left", icon: "", callback: this.alignGroup.bind(this) },
                "Right": { name: "Right", icon: "", callback: this.alignGroup.bind(this) },
            }
        }
    };

    this.dyOpt = {
        "DF": {
            "summary": { name: "Summary", icon: "fa-cog", callback: this.Rep.RbCommon.addSummarry.bind(this.Rep.RbCommon) }
        },
        "TA": {
            "fold1": {
                "name": "Text Align", icon: "fa-text",
                "items": {
                    "Align Left": { name: "Align Left", icon: "fa-align-left", callback: this.contextMenuLeft.bind(this) },
                    "Align Right": { name: "Align Right", icon: "fa-align-right", callback: this.contextMenuRight.bind(this) },
                    "Align Center": { name: "Align Center", icon: "fa-align-center", callback: this.contextMenuCenter.bind(this) }
                }
            }
        }
    };

    this.initContextMenu = function () {
        $.contextMenu({
            selector: '.dropped',
            autoHide: true,
            build: function ($trigger, e) {
                return { items: this.getMenu($trigger, e) };
            }.bind(this)
        });

        $.contextMenu({
            selector: '.pageHeaders,.pageGroups_header,.pageGroups_footer',
            autoHide: true,
            build: function ($trigger, e) {
                this.L = e.offsetX; this.T = e.offsetY;
                return {
                    items: {
                        "delete": {
                            name: "Delete", icon: "delete", callback: this.contextMenudelete.bind(this),
                            disabled: function (key, opt) {
                                if (opt.$trigger.hasClass("locked"))
                                    return !opt.$trigger.data('cutDisabled');

                                if (opt.$trigger.hasClass("pageHeaders")) {
                                    if (opt.$trigger.parent().find(".pageHeaders").length <= 1)
                                        return !opt.$trigger.data('cutDisabled');
                                }
                            }
                        },
                        "paste": {
                            name: "Paste", icon: "paste", callback: this.contextMenupaste.bind(this), disabled: function (key, opt) {
                                if (this.copyStack === null)
                                    return !opt.$trigger.data('cutDisabled');
                            }.bind(this)
                        },
                        "lock": {
                            name: "Lock", icon: "fa-lock", callback: this.lockControl.bind(this),
                            disabled: function (key, opt) {
                                if (opt.$trigger.hasClass("locked"))
                                    return !opt.$trigger.data('cutDisabled');
                            }
                        },
                        "unlock": {
                            name: "unlock", icon: "fa-unlock", callback: this.unLockControl.bind(this),
                            disabled: function (key, opt) {
                                if (!opt.$trigger.hasClass("locked"))
                                    return !opt.$trigger.data('cutDisabled');
                            }
                        }
                    }
                };
            }.bind(this)
        });

        $.contextMenu({
            selector: '.T_layout_td',
            autoHide: true,
            build: function ($trigger, e) {
                return {
                    items: {
                        "fold1": {
                            "name": "Delete", icon: "delete",
                            "items": {
                                "row": { name: "Row", callback: this.deleteRow_col.bind(this) },
                                "col": { name: "Coloum", callback: this.deleteRow_col.bind(this) }
                            }
                        }
                    }
                };
            }.bind(this)
        });

        $.contextMenu({
            selector: ".header_box",
            autoHide: true,
            build: function ($trigger, e) {
                return {
                    items: {
                        "AddSubSection": {
                            "name": "Add SubSection",
                            icon: "fa-plus",
                            callback: function (eType, selector, action, originalEvent) {
                                let _sec = selector.$trigger.attr("data-sec");
                                this.Rep.appendNewSubDiv(_sec);
                            }.bind(this)
                        },
                        "AddGroup": {
                            name: "Add Group",
                            icon: "fa-object-group",
                            callback: this.Rep.AddGroupSection.bind(this.Rep),
                            disabled: function (key, opt) {
                                if (opt.$trigger.attr("data-sec") !== "ReportDetail")
                                    return !opt.$trigger.data('cutDisabled');
                            }
                        }
                    }
                };
            }.bind(this)
        });
    };

    this.deleteRow_col = function (eType, selector, action, originalEvent) {
        let tid = selector.$trigger.closest(".dropped").attr("id");
        let ind = selector.$trigger.index();
        this.Rep.TableCollection[tid].delFromMenu(selector.$trigger, eType);
    };

    this.getMenu = function ($trigger, e) {
        let m = $.extend({}, this.options);
        let eb_type = $trigger.attr("eb-type");
        if ($trigger.hasClass("EbCol") || $trigger.hasClass("CalcField"))
            $.extend(m, this.dyOpt["DF"], this.dyOpt["TA"]);
        else {
            $.extend(m, this.dyOpt["TA"]);
        }
        return m;
    };

    this.initContextMenu();
};
let EbTableLayout = function (report, EbControl) {
    this.Report = report || null;
    this.EbCtrl = {};
    this.EditCtrl = EbControl || {};
    this.isNew = $.isEmptyObject(this.EditCtrl) ? true : false;
    this.Table = null;
    const _resizer = "eb_resize_e";
    const _resizerV = "eb_resize_row";
    let _dragpos = null;
    this.ColCount = null;
    this.RowCount = null;

    this.createTable = function () {
        let id = this.Report.Objtype + (this.Report.idCounter[this.Report.Objtype + "Counter"])++;
        this.EbCtrl = new EbObjects["EbTable_Layout"](id);
        this.EbCtrl.Name = this.Report.RbCommon.GenUniqName(this.EbCtrl.Name);
        this.ColCount = this.EbCtrl.ColoumCount;
        this.RowCount = this.EbCtrl.RowCount;
        this.Report.dropLoc.append(this.getHtml(id));
        this.Report.objCollection[id] = this.EbCtrl;
        this.Report.pg.setObject(this.Report.objCollection[id], AllMetas["EbTable_Layout"]);
        this.Table = $(`#${id}`);
        this.setPosition(id);
        this.draggableT(id);
        this.makeResizable(id);
        this.makeTLayoutDroppable(id);
        this.InitColResize(id);
        //this.InitColResizable();
    };

    this.createTableOnEdit = function () {
        let id = "Table_Layout" + (this.Report.idCounter["Table_LayoutCounter"])++;
        this.EbCtrl = new EbObjects["EbTable_Layout"](id);
        this.Report.containerId.append(this.getHtml(id));
        this.Report.repExtern.replaceProp(this.EbCtrl, this.EditCtrl);
        this.EbCtrl.EbSid = id; this.EbCtrl.Name = this.EditCtrl.Name;
        this.Report.objCollection[id] = this.EbCtrl;
        this.Report.pg.setObject(this.Report.objCollection[id], AllMetas["EbTable_Layout"]);
        this.Table = $(`#${id}`);
        this.Table.css({
            "left": this.EbCtrl.Left + "px",
            "top": this.EbCtrl.Top + "px",
            "width": this.EbCtrl.Width,
            "height": this.EbCtrl.Height
        });
        this.ColCount = this.EbCtrl.ColoumCount;
        this.RowCount = this.EbCtrl.RowCount;
        this.draggableT(id);
        this.makeResizable(id);
        this.addCells(this.EbCtrl, "RowCount");
        this.addCells(this.EbCtrl, "ColoumCount");
        this.setCells();
        this.isNew = true;
    };

    //this.InitColResizable = function () {
    //    this.Table.find("tr").eq(0).find("td").each(function (i, o) {
    //        if (!$(o).is(':last-child'))
    //            $(o).resizable({ handles: "e", resize: this.onResizeTd.bind(this) });
    //    }.bind(this));
    //};

    //this.onResizeTd = function (event, ui) {

    //};

    this.setCells = function () {
        let coll = this.EditCtrl.CellCollection.$values;
        let $td = null;
        for (let k = 0; k < coll.length; k++) {
            $td = this.Table.find("tr").eq(coll[k].RowIndex).find("td").eq(coll[k].CellIndex);
            if (!($td.closest("tr").is(':last-child'))) {
                if (!$td.is(':last-child') && $td.closest("tr").is(':first-child'))
                    $td.css({ width: this.calcPercent(coll[k].Width) + "%" });
                $td.closest("tr").css({ height: this.calcPercentTop(coll[k].Height) + "%" });
            }
            else {
                if (!$td.is(':last-child'))
                    $td.css({ width: this.calcPercent(coll[k].Width) + "%" });
            }

            if (coll[k].ControlCollection.$values.length > 0)
                this.drawControls($td, coll[k].ControlCollection.$values[0]);
        }
        this.refreshCols();
    };

    this.drawControls = function ($td, ebCtrl) {
        var eb_type = ebCtrl.$type.split(",")[0].split(".").pop().substring(2);
        if (eb_type === "Table_Layout")
            this.Report.RbCommon.drawTableOnEdit(ebCtrl);
        else {
            var Objid = eb_type + this.Report.idCounter[eb_type + "Counter"]++;
            var $control = new EbObjects["Eb" + eb_type](Objid);
            $td.append($control.$Control.outerHTML());
            this.Report.repExtern.replaceProp($control, ebCtrl);
            $control.EbSid = Objid; $control.Name = ebCtrl.Name;
            this.Report.objCollection[Objid] = $control;
            this.Report.pg.addToDD(this.Report.objCollection[Objid]);
            this.Report.pg.setObject(this.Report.objCollection[Objid], AllMetas["Eb" + eb_type]);
            this.Report.RefreshControl(this.Report.objCollection[Objid]);
        }
    };

    this.setPosition = function (id) {
        let $jq = $(`#${id}`);
        $jq.css({
            left: this.Report.leftwithMargin() + "px",
            top: (this.Report.posTop - this.Report.dropLoc.offset().top) - this.Report.positionTandL['top'] + "px"
        });
        this.setUiProps(id);
    };

    this.draggableT = function (id) {
        $(`#${id}`).draggable({
            cursor: "crosshair", containment: ".page", appendTo: "body", zIndex: 100,
            start: this.Report.onDrag_Start.bind(this.Report), stop: this.Report.onDrag_stop.bind(this.Report), drag: this.Report.ondragControl.bind(this.Report)
        });
    };

    this.setUiProps = function (id) {
        let $jq = $(`#${id}`);

        this.EbCtrl.Width = $jq.width();
        this.EbCtrl.Height = $jq.height();
        this.EbCtrl.Left = $jq.position().left;
        this.EbCtrl.Top = $jq.position().top;
    };

    this.makeResizable = function (id) {
        $("#" + id).off("focus").on("focus", this.Report.elementOnFocus.bind(this.Report));
        $("#" + id).off('focusout').on("focusout", this.Report.destroyResizable.bind(this.Report));
    };

    this.getHtml = function (id) {
        let html = `<div class="eb_TableLayout dropped" id=${id} eb-type="Table_Layout" tabindex="1">
                         <table class="table table-bordered">
                            <tbody>
                              <tr class="T_layout_tr">
                                ${this.getTdHtml()}
                              </tr>
                            </tbody>
                          </table>
                    <div class='eb_draggbale_table_handle' onclick='$(this).parent().focus();'><i class='fa fa-arrows'></i></div>
                    </div>`;
        return html;
    };

    this.getTdHtml = function () {
        let ar = [];
        for (i = 0; i < this.ColCount; i++) {
            ar.push("<td class='T_layout_td' eb-type='Table_Layout'></td>");
        }
        return ar.join("");
    };


    this.makeTLayoutDroppable = function (id) {
        $(`#${id}`).find('td').droppable({
            accept: ".draggable,.dropped,.coloums",
            greedy: true,
            hoverClass: "drop-hover",
            drop: this.Report.onDropFn.bind(this.Report)
        });
    };

    this.InitColResize = function (id) {
        $(`#${id} table`).addClass("eb_colResizer");
        let tdlen = $(`#${id} table tr`).eq(0).find("td").length;
        let trlen = $(`#${id} table tr`).length;
        $(`#${id} table tr`).eq(0).find("td").each(function (i, o) {
            if (!$(o).is(":last-child"))
                $(o).css({ width: this.calcPercent($(o).outerWidth()) + "%" });
        }.bind(this));

        $(`#${id} table tr`).each(function (i, ob) {
            if (!$(ob).is(":last-child"))
                $(ob).css({ height: this.calcPercentTop($(ob).outerHeight()) + "%" });
        }.bind(this));

        for (let i = 0; i < tdlen - 1; i++) {
            $(`#${id}`).append(`<div class="eb_resize_e" wt="${id}" id="${id + i}" index="${i}" style="left:${this.getPos(i)}%"></div>`);
        }

        for (let j = 0; j < trlen - 1; j++) {
            if (trlen > 1) {
                $(`#${id}`).append(
                    `<div class="eb_resize_row"  wt="${id}" id="eb_resize_row${id + j}" index="${j}" style="top:${this.getTop(j)}%"></div>`);
            }
        }

        this.dragHandle();
    };

    this.getPos = function (i) {
        let it = this.Table.find("tr").eq(0).find("td").eq(i);
        let tdleft = it.position().left + it.outerWidth();
        return this.calcPercent(tdleft);
    };

    this.getTop = function (i) {
        let tr = this.Table.find("tr").eq(i);
        let tdtop = tr.position().top + tr.height();
        return this.calcPercentTop(tdtop);
    };

    this.calcPercent = function (val) {
        let per = val / this.Table.outerWidth() * 100;
        return per;
    };

    this.calcPercentTop = function (val) {
        let per = val / this.Table.innerHeight() * 100;
        return per;
    };

    this.addRowHandles = function () {

    };

    this.appendTd = function ($ctrl, count) {
        for (let t = 0; t < count; t++) {
            $ctrl.append("<td class='T_layout_td' eb-type='Table_Layout'></td>");
        }
    };

    this.setTrPixelH = function () {
        this.Table.find("tr").each(function (k, o) {
            $(o).css({ height: $(o).height() });
        }.bind(this));
    };

    this.setTdPixelW = function () {
        this.Table.find("tr").eq(0).find("td").each(function (k, o) {
            $(o).css({ width: $(o).width() });
        }.bind(this));
    };

    this.pgChange = function (obj, pname) {
        if (this.RowCount > obj.RowCount || this.ColCount > obj.ColoumCount)
            this.deleteCell(obj, pname);
        else if (this.RowCount < obj.RowCount || this.ColCount < obj.ColoumCount)
            this.addCells(obj, pname);
    };

    this.addCells = function (obj, pname) {
        if (pname === "ColoumCount") {
            let _tdCount = this.Table.find("tr").eq(0).children("td").length;
            this.Table.find("tr").each(function (i, tr) {
                this.appendTd($(tr), obj.ColoumCount - _tdCount);
            }.bind(this));
        }
        else if (pname === "RowCount") {
            this.setTrPixelH();
            var _row = this.Table.find("tr").length;
            let _tdCount = this.Table.find("tr").eq(0).children("td").length;
            if (this.isNew)
                this.Table.css("height", this.Table.height() + ((obj.RowCount - _row) * 26));
            for (let c = _row; c <= obj.RowCount - 1; c++) {
                this.Table.find("tbody").append(`<tr id="${obj.EbSid}_tr_${c}">`);
                this.appendTd($(`#${obj.EbSid}_tr_${c}`), _tdCount);
            }
            obj.Height = this.Table.height();
        }
        this.RowCount = obj.RowCount;
        this.ColCount = obj.ColoumCount;

        this.makeTLayoutDroppable(obj.EbSid);
        this.killResizableCols();
        this.InitColResize(obj.EbSid);
    };

    this.deleteCell = function (obj, pname) {
        let lastnode = null;
        if (pname === "ColoumCount") {
            this.setTdPixelW();
            for (let z = 0; z < this.ColCount - obj.ColoumCount; z++) {
                this.Table.find("tr").each(function (i, o) {
                    lastnode = $(o).find("td:last-child");
                    if (lastnode.closest("tr").index() === 0)
                        this.Table.width($(`#${obj.EbSid}`).width() - lastnode.width());
                    lastnode.remove();
                }.bind(this));
            }
            this.ColCount = obj.ColoumCount;
            this.Table.find("tr").eq(0).find("td:last-child").css("width", "auto");
        }
        else if (pname === "RowCount") {
            this.setTrPixelH();
            for (let y = 0; y < this.RowCount - obj.RowCount; y++) {
                lastnode = this.Table.find("tr:last-child");
                this.Table.height(this.Table.height() - lastnode.height() - 2);
                lastnode.remove();
            }
            this.RowCount = obj.RowCount;
            this.Table.find("tr:last-child").css("height", "auto");
        }
        this.killResizableCols();
        this.InitColResize(obj.EbSid);
    };

    this.delFromMenu = function ($td, type) {
        let index = $td.index();
        if (type === "row") {
            this.setTrPixelH();
            this.Table.height(this.Table.height() - $td.height() - 2);
            $td.closest("tr").remove();
            this.RowCount = this.RowCount - 1;
            this.EbCtrl.RowCount = this.EbCtrl.RowCount - 1;
            this.Table.find("tr:last-child").css("height", "auto");
        }
        else if (type === "col") {
            this.setTdPixelW();
            this.Table.find("tr").each(function (i, o) {
                let node = $(o).find("td").eq(index);
                this.Table.width(this.Table.width() - node.width());
                node.remove();
            }.bind(this));
            this.ColCount = this.ColCount - 1; this.EbCtrl.ColoumCount = this.EbCtrl.ColoumCount - 1;
            this.Table.find("tr").eq(0).find("td:last-child").css("width", "auto");
        }
        this.killResizableCols();
        this.InitColResize(this.Table.attr("id"));
    };

    this.killResizableCols = function () {
        this.Table.find(`.${_resizer}`).draggable("destroy");
        this.Table.find(`.${_resizerV}`).draggable("destroy");
        this.Table.find(".eb_resize_e").remove();
        this.Table.find(".eb_resize_row").remove();
    };

    this.dragHandle = function () {
        let d = this.Table.find(`.${_resizer}`).draggable({
            axis: "x",
            containment: "parent",
            stop: this.dragStop.bind(this),
            drag: this.ondrag.bind(this),
            start: this.startDrag.bind(this)
        });

        let f = this.Table.find(`.${_resizerV}`).draggable({
            axis: "y",
            containment: "parent",
            stop: this.dragStopV.bind(this),
            start: this.startDragV.bind(this)
        });
    };

    this.dragStop = function (e, ui) {
        let tdi = parseInt($(e.target).attr("index"));
        let l = $(e.target).position().left;
        let ltd = this.Table.find("tr").eq(0).find("td").eq(tdi).position().left;
        this.Table.find("tr").eq(0).find("td").eq(tdi).css({ "width": this.calcPercent(l - ltd) + "%" });
        this.setNextCol(tdi);
        this.refreshCols();
    };

    this.dragStopV = function (e, ui) {
        let tri = parseInt($(e.target).attr("index"));
        let l = $(e.target).position().top;
        let ltd = this.Table.find("tr").eq(tri).position().top;
        this.Table.find("tr").eq(tri).css({ "height": this.calcPercentTop(l - ltd) + "%" });
        this.setNextTr(tri);
        this.refreshCols();
    };

    this.setNextCol = function (tdi) {
        let index = tdi + 1;
        let resizer = this.Table.find(".eb_resize_e").eq(tdi);
        let _nextNode = this.Table.find(".eb_resize_e").eq(index);

        let nextnode = this.Table.find("tr").eq(0).find("td").eq(index);
        if (nextnode.length > 0 && _nextNode.length > 0) {
            let w = _nextNode.position().left - resizer.position().left;
            nextnode.css("width", this.calcPercent(w + 2) + "%");
        }
    };

    this.setNextTr = function (tri) {
        let index = tri + 1;
        let resizer = this.Table.find(`.eb_resize_row`).eq(tri);
        let _nextNode = this.Table.find(`.eb_resize_row`).eq(index);
        let nextnode = this.Table.find("tr").eq(index);
        if (_nextNode.length > 0 && _nextNode.length > 0) {
            let h = _nextNode.position().top - resizer.position().top;
            nextnode.css("height", this.calcPercentTop(h + 2) + "%");
        }
    };

    this.refreshCols = function () {
        this.Table.find(".eb_resize_e").each(function (k, ob) {
            let index = parseInt($(ob).attr("index"));
            $(ob).css("left", this.getPos(index) + "%");
        }.bind(this));
        this.Table.find(`.${_resizerV}`).each(function (k, ob) {
            let index = parseInt($(ob).attr("index"));
            $(ob).css("top", this.getTop(index) + "%");
        }.bind(this));
    };

    this.ondrag = function (e, ui) {

    };

    this.startDrag = function (e, ui) {
        _dragpos = $(e.target).position().left;
    };

    this.startDragV = function (e, ui) {
        _dragpos = $(e.target).position().top;
    };

    this.start = function () {
        if ($.isEmptyObject(this.EditCtrl)) {
            this.createTable();
            return this;
        }
        else {
            this.createTableOnEdit();
            return this;
        }
    };

    return this.start();
};