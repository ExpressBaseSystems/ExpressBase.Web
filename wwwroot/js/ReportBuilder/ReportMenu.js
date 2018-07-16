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
        "delete": { name: "Delete", icon: "delete", callback: this.contextMenudelete.bind(this), disabled: this.disableMenuItem.bind(this)},
        "lock": {
            name: "Lock", icon: "fa-lock", callback: this.lockControl.bind(this),
            disabled: this.disableMenuItem.bind(this) },
        "unlock": {
            name: "unlock", icon: "fa-unlock", callback: this.unLockControl.bind(this),
            disabled: this.disableMenuItem.bind(this) },
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
                this.L = e.offsetX; this.T = e.offsetY;
                return {
                    items: {
                        "delete": {
                            name: "Delete",icon: "delete",callback: this.contextMenudelete.bind(this),
                            disabled: function (key, opt) {
                                if (opt.$trigger.parent().children().length <= 1 || opt.$trigger.hasClass("locked"))
                                    return !opt.$trigger.data('cutDisabled');
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
                        "AddSubSection":{
                            "name": "Add SubSection",
                            icon: "fa-text",
                            icon: "fa-plus",
                            callback: function (eType, selector, action, originalEvent) {
                                let _sec = selector.$trigger.attr("data-sec");
                                this.Rep.appendNewSubDiv(_sec);
                            }.bind(this)
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
            $.extend(m,this.dyOpt["TA"]);
        }
        return m;
    };

    this.initContextMenu();
};