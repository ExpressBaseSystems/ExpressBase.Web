var ReportMenu = function (option) {
    this.Rep = option;
    this.copyStack = null;
    this.copyORcut = null;
    this.objCollection = this.Rep.objCollection;
    this.repExtern = this.Rep.repExtern;

    this.contextMenucopy = function (eType, selector, action, originalEvent) {
        this.copyStack = Object.assign({}, this.objCollection[$(selector.$trigger).attr('id')]);
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
                Objid = Objtype + (this.Rep.idCounter["Eb" + Objtype + "Counter"])++;
                $obj = new EbObjects["Eb" + Objtype](Objid);
                this.repExtern.replaceWOPtConvProp($obj, this.copyStack);
                $obj.EbSid = Objid;
                $obj.Name = Objid;
            }
            else if (this.copyORcut === 'cut') {
                $obj = this.copyStack;
                Objid = this.copyStack.EbSid;
            }
            $obj.Top = action.originalEvent.pageY - $(selector.$trigger).offset().top;
            $obj.Left = action.originalEvent.pageX - $(selector.$trigger).offset().left;
            $(selector.$trigger).append($obj.$Control.outerHTML());
            this.objCollection[Objid] = $obj;
            this.Rep.RefreshControl($obj);
            this.copyStack = null;
            this.copyORcut = null;
        }
    };

    this.contextMenudelete = function (eType, selector, action, originalEvent) {
        if (!$(selector.$trigger).hasClass("pageHeaders")) {
            delete this.Rep.objCollection[$(selector.$trigger).attr("id")];
            this.Rep.pg.removeFromDD($(selector.$trigger).attr("id"));
            $(selector.$trigger).remove();
        }
        else {
            if ($(selector.$trigger).index() !== 0) {
                let sec = $(selector.$trigger).attr("eb-type");
                delete this.Rep.objCollection[$(selector.$trigger).attr("id")];
                this.removeSecEbobject(sec, $(selector.$trigger).attr("id"));
                $(selector.$trigger).remove();
                this.Rep.pg.removeFromDD($(selector.$trigger).attr("id"));
                $(".multiSplit ." + sec).find(".multiSplitHboxSub").eq($(selector.$trigger).index()).remove();
                this.Rep.syncHeight();
            }
        }
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
            });
            $(selector.$trigger).children().each(function (i, obj) { $("#" + obj.id).addClass('locked').draggable('disable'); });
            var locksymbDiv = $(selector.$trigger).attr("id").slice(0, -1) + 'subBox' + $(selector.$trigger).attr('id').slice(-1);
            $('#' + locksymbDiv).append('<i class="fa fa-lock lock-icon" aria-hidden="true"></i>');
            if ($(selector.$trigger).siblings().length === 0) {
                $('#btn' + $(selector.$trigger).attr("data_val")).attr('disabled', 'disabled');
            }
            $(selector.$trigger).parent().next('.gutter').css({ "cursor": "not-allowed", "pointer-events": "none" });
            $(selector.$trigger).parent().prev('.gutter').css({ "cursor": "not-allowed", "pointer-events": "none" });
        }
    };

    this.unLockControl = function (eType, selector, action, originalEvent) {
        if (!$(selector.$trigger).hasClass("pageHeaders")) {
            $(selector.$trigger).removeClass('locked').draggable('enable');
        }
        else if ($(selector.$trigger).hasClass("pageHeaders")) {
            $(selector.$trigger).removeClass('locked').droppable({
                disabled: false
            });
            $(selector.$trigger).children().each(function (i, obj) { $("#" + obj.id).removeClass('locked').draggable('enable'); });
            var locksymbDiv = $(selector.$trigger).attr("id").slice(0, -1) + 'subBox' + $(selector.$trigger).attr('id').slice(-1);
            $('#' + locksymbDiv).children("i").remove();
            if ($(selector.$trigger).siblings().length === 0) {
                $('#btn' + $(selector.$trigger).attr("data_val")).removeAttr('disabled');
            }
            $(selector.$trigger).parent().next().css({ "cursor": "ns-resize", "pointer-events": "auto" });
            $(selector.$trigger).parent().prev('.gutter').css({ "cursor": "ns-resize", "pointer-events": "auto" });
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
        "paste": { name: "Paste", icon: "paste", callback: this.contextMenupaste.bind(this) },
        "delete": { name: "Delete", icon: "delete", callback: this.contextMenudelete.bind(this) },
        "lock": { name: "Lock", icon: "fa-lock", callback: this.lockControl.bind(this) },
        "unlock": { name: "unlock", icon: "fa-unlock", callback: this.unLockControl.bind(this) },
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
            selector: '.pageHeaders',
            autoHide: true,
            build: function ($trigger, e) {
                return {
                    items: {
                        "delete": { name: "Delete", icon: "delete", callback: this.contextMenudelete.bind(this) },
                        "lock": { name: "Lock", icon: "fa-lock", callback: this.lockControl.bind(this) },
                        "unlock": { name: "unlock", icon: "fa-unlock", callback: this.unLockControl.bind(this) }
                    }
                };
            }.bind(this)
        });
    };

    this.getMenu = function ($trigger, e) {
        let m = $.extend({}, this.options);
        let eb_type = $trigger.attr("eb-type");
        if ($trigger.hasClass("EbCol") || $trigger.hasClass("CalcField"))
            this.appendOptions(["DF", "TA"], m);
        else {
            this.appendOptions(["TA"], m);
        }
        return m;
    };

    this.appendOptions = function (arrOfkeys, ob) {
        arrOfkeys.forEach(function (item) {
            for (var key in this.dyOpt[item]) {
                ob[key] = this.dyOpt[item][key];
            }
        }.bind(this));
    };

    this.initContextMenu();
};