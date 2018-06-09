var ReportMenu = function (option) {
    this.Rep = option;
    this.copyStack = null;
    this.copyORcut = null;
    this.objCollection = this.Rep.objCollection;
    this.repExtern = this.Rep.repExtern;
    this.TextAlign = this.Rep.RbCommon.TextAlign;

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
            $obj.Top = action.originalEvent.pageY - $(selector.selector).offset().top;
            $obj.Left = action.originalEvent.pageX - $(selector.selector).offset().left;
            $(selector.selector).append($obj.$Control.outerHTML());
            this.objCollection[Objid] = $obj;
            this.Rep.RefreshControl($obj);
            this.copyStack = null;
            this.copyORcut = null;
        }
    };

    this.contextMenudelete = function (eType, selector, action, originalEvent) {
        if (!$(selector.selector).hasClass("pageHeaders")) {
            delete this.Rep.objCollection[$(selector.selector).attr("id")];
            this.Rep.pg.removeFromDD($(selector.selector).attr("id"));
            $(selector.selector).remove();
        }
        else
            alert('no permission');
    };

    this.contextMenuJustify = function (eType, selector, action, originalEvent) {
        this.objCollection[$(selector.selector).attr("id")].TextAlign = this.TextAlign[3];
        this.Rep.RefreshControl(this.objCollection[$(selector.selector).attr("id")]);
    };

    this.contextMenuRight = function (eType, selector, action, originalEvent) {
        this.objCollection[$(selector.selector).attr("id")].TextAlign = this.TextAlign[2];
        this.Rep.RefreshControl(this.objCollection[$(selector.selector).attr("id")]);
    };

    this.contextMenuCenter = function (eType, selector, action, originalEvent) {
        this.objCollection[$(selector.selector).attr("id")].TextAlign = this.TextAlign[1];
        this.Rep.RefreshControl(this.objCollection[$(selector.selector).attr("id")]);
    };

    this.contextMenuLeft = function (eType, selector, action, originalEvent) {
        this.objCollection[$(selector.selector).attr("id")].TextAlign = this.TextAlign[0];
        this.Rep.RefreshControl(this.objCollection[$(selector.selector).attr("id")]);
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
    };

    this.applyToGroupSelect = function (parent, item, val) {
        $.each(parent.children(".marked"), function (i, obj) {
            $(obj).css(item, val);
            $(obj).removeClass("marked");
        });
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
                    "Align Center": { name: "Align Center", icon: "fa-align-center", callback: this.contextMenuCenter.bind(this) },
                    "Align Justify": { name: "Align Justify", icon: "fa-align-justify", callback: this.contextMenuJustify.bind(this) },
                }
            }
        }
    };

    this.initCM = function (selector) {
        $.contextMenu({
            selector: '#' + selector,
            autoHide: true,
            items: this.options
        });
    };

    this.appendOptions = function (wkey) {
        for (var key in this.dyOpt[wkey]) {
            this.options[key] = this.dyOpt[wkey][key];
        }
    };

    this.Menu = function ($ctrl) {
        if ($ctrl.hasClass("EbCol") || $ctrl.hasClass("CalcField"))
            this.appendOptions("DF");
        else if (!$ctrl.hasClass("EbCol") === "Bar-code")
            this.appendOptions("TA");
        this.initCM($ctrl.attr("id"));
    };

    //this.startExe()
};