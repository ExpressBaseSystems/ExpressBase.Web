const formBuilder = function (options) {
    this.wc = options.wc;
    this.cid = options.cid;
    this.formId = options.formId;
    this.Name = this.formId;
    this.toolBoxid = options.toolBoxId;
    this.rootContainerObj = null;
    this.$propGrid = $("#" + options.PGId);

    $(`[eb-form=true]`).attr("ebsid", this.formId).attr("id", this.formId);

    this.$form = $("#" + this.formId);
    this.EbObject = options.objInEditMode;
    this.tempArr = [];
    this.isEditMode = false;
    commonO.Current_obj = this.EbObject;

    this.controlCounters = CtrlCounters;//Global
    this.currentProperty = null;
    this.CurRowCount = 2;
    this.CurColCount = 2;
    this.movingObj = {};

    this.del = function (eType, selector, action, originalEvent) {
        let $e = selector.$trigger;
        let id = $e.attr("ebsid");
        let ControlTile = $(`#cont_${id}`).closest(".Eb-ctrlContainer");
        this.PGobj.removeFromDD(this.rootContainerObj.Controls.GetByName(id).EbSid);
        let ctrl = this.rootContainerObj.Controls.PopByName(id);
        ControlTile.parent().focus();
        ControlTile.remove();
        this.PGobj.removeFromDD(id);
        this.saveObj();
        return ctrl;
    }.bind(this);

    this.controlOnFocus = function (e) {
        if (e.target.id === this.formId) {
            this.curControl = $(e.target);
            this.CreatePG(this.rootContainerObj);
            return;
        }
        else
            this.curControl = $(e.target).closest(".Eb-ctrlContainer");
        let ebsid = this.curControl.attr("ebsid");
        e.stopPropagation();
        this.CreatePG(this.rootContainerObj.Controls.GetByName(ebsid));
        //  this.PGobj.ReadOnly();
    }.bind(this);

    this.InitContCtrl = function (ctrlObj, $ctrl) {///////////////////////////////////////////////////////////////////////////////////////////////////
        if (ctrlObj.ObjType === "TableLayout") {
            this.makeTdsDropable_Resizable();
            let tds = $ctrl.find("td");
            $.each(ctrlObj.Controls.$values, function (i, td) {
                $(tds[i]).attr("ebsid", td.EbSid).attr("id", td.EbSid);
            });
        }
        else if (ctrlObj.ObjType === "TabControl") {
            let tapPanes = $ctrl.find(".tab-pane");
            let tapBtns = $ctrl.find("ul.nav-tabs a");
            $.each(ctrlObj.Controls.$values, function (i, pane) {
                $(tapPanes[0]).attr("ebsid", pane.EbSid).attr("id", pane.EbSid);
                $(tapBtns[0]).attr("href", "#" + pane.EbSid).text(pane.EbSid).closest("li").attr("li-of", pane.EbSid);
            });
            this.makeTabsDropable();
        }
        else if (ctrlObj.ObjType === "GroupBox") {
            let el = $("#" + this.formId + " .group-box")[0];
            this.makeGBDropable(el);
        }
    }

    this.makeGBDropable = function (el) {
        if (this.drake) {
            if (!this.drake.containers.contains(el)) {
                this.drake.containers.push(el);
            }
        }
    }

    this.makeTabsDropable = function () {
        $.each($("#" + this.formId + " .tab-pane"), function (i, el) {
            if (this.drake) {
                if (!this.drake.containers.contains(el)) {
                    this.drake.containers.push(el);
                }
            }
        }.bind(this));
    };

    this.makeTdsDropable_Resizable = function () {
        $.each($(".tdDropable"), function (i, el) {
            let $e = $(el);
            this.pushToDragables($e);
            if (($(".tdDropable").length - 1) !== i)
                this.makeTdResizable($e);
        }.bind(this));
    };

    this.makeTdResizable = function ($el) {
        $el.resizable({
            handles: 'e',
            stop: this.tdDragStop.bind(this)
        });
    }.bind(this);

    this.tdDragStop = function (event, ui) {
        let $curTd = ui.element;
        let $tbl = $curTd.closest("table");
        let $tableCont = $tbl.closest(".Eb-ctrlContainer");
        let tblWidth = $tbl.outerWidth();
        let curTdWidth = $curTd.outerWidth();
        let curTdWidthPerc = (curTdWidth / tblWidth) * 100;
        let cuTdobj = this.rootContainerObj.Controls.GetByName($curTd.attr("ebsid"));
        cuTdobj.WidthPercentage = curTdWidthPerc;
    }

    this.pushToDragables = function ($e) {
        let el = $e[0];
        if (this.drake) {
            if (!this.drake.containers.contains(el)) {
                this.drake.containers.push(el);
            }
        }
    }

    this.InitEditModeCtrls = function (editModeObj) {
        this.rootContainerObj = editModeObj;
        //setTimeout(function () {
        Proc(editModeObj, this.rootContainerObj);
        //}.bind(this), 1000);
        $(".Eb-ctrlContainer").each(function (i, el) {
            this.initCtrl(el);
        }.bind(this));
    };

    this.initCtrl = function (el) {
        this.tempArr.push(el);
        let $el = $(el);
        let type = $el.attr("ctype").trim();
        let attrEbsid = parseInt($el.attr("ebsid").match(/\d+$/)[0]);
        if (attrEbsid || attrEbsid === 0)
            this.controlCounters[type + "Counter"] = attrEbsid;
        else
            this.controlCounters[type + "Counter"] = (this.controlCounters[type + "Counter"]);

        //this.controlCounters[type + "Counter"] = parseInt($el.attr("ebsid").match(/\d+$/)[0]) || (this.controlCounters[type + "Counter"]);
        let ebsid = type + this.controlCounters[type + "Counter"]++;// inc counter
        $el.attr("tabindex", "1");
        this.ctrlOnClickBinder($el, type);
        $el.on("focus", this.controlOnFocus.bind(this));
        $el.attr("eb-type", type);
        $el.attr("eb-type", type).attr("ebsid", ebsid);
        this.updateControlUI(ebsid);
    };

    this.ctrlOnClickBinder = function ($ctrl, type) {
        if (type === "TabControl")
            $ctrl.on("click", function myfunction() {
                if (event.target.getAttribute("data-toggle") !== "tab")
                    event.stopPropagation();
                $(event.target).closest(".Eb-ctrlContainer").focus();
            });
        else
            $ctrl.attr("onclick", "event.stopPropagation();$(this).focus()");
    }

    this.updateControlUI = function (ebsid, type) {
        let obj = this.rootContainerObj.Controls.GetByName(ebsid);
        let _type = obj.ObjType
        $.each(obj, function (propName, propVal) {
            let meta = getObjByval(AllMetas["Eb" + _type], "name", propName);
            if (meta && meta.IsUIproperty)
                this.updateUIProp(propName, ebsid, _type);
        }.bind(this));
    }

    this.updateUIProp = function (propName, id, type) {
        let obj = this.rootContainerObj.Controls.GetByName(id);
        let NSS = getObjByval(AllMetas["Eb" + type], "name", propName).UIChangefn;
        if (NSS) {
            let NS1 = NSS.split(".")[0];
            let NS2 = NSS.split(".")[1];
            EbOnChangeUIfns[NS1][NS2](id, obj);
        }
    }

    //Edit mode
    if (this.EbObject) {
        this.isEditMode = true;
        this.InitEditModeCtrls(this.EbObject);
    }
    if (this.EbObject === null) {
        this.rootContainerObj = new EbObjects.EbWebForm(this.formId);
        commonO.Current_obj = this.rootContainerObj;
        this.EbObject = this.rootContainerObj;
    };

    this.PGobj = new Eb_PropertyGrid({
        id: "pgWraper",
        wc: this.wc,
        cid: this.cid,
        $extCont: $(".property-grid-cont")
    });

    this.curControl = null;
    this.drake = null;

    this.CreatePG = function (control) {
        console.log("CreatePG called for:" + control.Name);
        this.$propGrid.css("visibility", "visible");
        this.SelectedCtrl = control;
        this.PGobj.setObject(control, AllMetas["Eb" + this.curControl.attr("eb-type")]);////
    };

    this.saveObj = function () {
        this.PGobj.getvaluesFromPG();
    };

    this.onDragFn = function (el, source) {
        //if drag start within the form
        let id = $(el).closest(".Eb-ctrlContainer").attr("ebsid");
        let $source = $(source);
        if ($source.attr("id") !== "form-buider-toolBox") {
            this.movingObj = this.rootContainerObj.Controls.PopByName(id);
            if ($source.closest(".ebcont-ctrl").attr("ctype") === "TabPane")
                this.adjustPanesHeight($source);
        }
        else
            this.movingObj = null;
    };// start

    this.onDragendFn = function (el) {
        let $sibling = $(el).next();
        let $target = $(el).parent();
        if (this.movingObj) {
            //Drag end with in the form
            if ($target.attr("id") !== "form-buider-toolBox") {
                if ($sibling.attr("id")) {
                    let idx = $sibling.index() - 1;
                    this.rootContainerObj.Controls.InsertAt(idx, this.movingObj);
                }
                else {
                    this.rootContainerObj.Controls.Append(this.movingObj);
                }
                this.saveObj();
                $(el).on("focus", this.controlOnFocus.bind(this));
            }
        }
    };

    this.onDropFn = function (el, target, source, sibling) {
        let $target = $(target);
        if (target) {
            //drop from toolbox to form
            if ($(source).attr("id") === "form-buider-toolBox") {
                let $el = $(el);
                let type = $el.attr("eb-type").trim();
                let ebsid = type + (this.controlCounters[type + "Counter"])++;
                let $ctrl = new EbObjects["Eb" + type](ebsid).$Control;
                let $sibling = $(sibling);
                $el.remove();
                let ctrlObj = new EbObjects["Eb" + type](ebsid);
                this.dropedCtrlInit($ctrl, type, ebsid);
                if (sibling) {
                    $ctrl.insertBefore($sibling);
                    let idx = $sibling.index() - 1;
                    this.rootContainerObj.Controls.InsertAt(idx, ctrlObj);
                }
                else {
                    $target.append($ctrl);
                    this.rootContainerObj.Controls.Append(ctrlObj);
                }

                $ctrl.focus();
                ctrlObj.Label = ebsid;
                ctrlObj.HelpText = "";
                if (ctrlObj.IsContainer)
                    this.InitContCtrl(ctrlObj, $ctrl);
                this.updateControlUI(ebsid);
            }
            let $parent = $target.closest(".ebcont-ctrl");
            if ($parent.attr("ctype") === "TabPane")
                this.adjustPanesHeight($parent);
        }
    };

    this.adjustPanesHeight = function ($target) {
        let parent = $target.attr("eb-form") ? this.rootContainerObj : this.rootContainerObj.Controls.GetByName($target.attr("ebsid"));
        let tabControl = this.rootContainerObj.Controls.GetByName($target.closest(".Eb-ctrlContainer").attr("ebsid"));
        EbOnChangeUIfns.EbTabControl.adjustPanesHeightToHighest(tabControl.EbSid, tabControl);
    };

    this.dropedCtrlInit = function ($ctrl, type, id) {
        $ctrl.attr("tabindex", "1");
        this.ctrlOnClickBinder($ctrl, type);
        $ctrl.on("focus", this.controlOnFocus.bind(this));
        $ctrl.attr("id", "cont_" + id).attr("ebsid", id);
        $ctrl.attr("eb-type", type);
    };

    //this.controlCloseOnClick = function (e) {
    //    var ControlTile = $(e.target).parent().parent();
    //    var id = ControlTile.attr("id");
    //    this.PGobj.removeFromDD(this.rootContainerObj.Controls.GetByName(id).EbSid);
    //    this.PGobj.clear();
    //    this.rootContainerObj.Controls.DelByName(id);
    //    ControlTile.siblings().focus();
    //    ControlTile.remove();
    //    e.preventDefault();
    //    this.saveObj();
    //};

    //this.initCtrl = function (el) {
    //    var $EbCtrl = $(el);
    //    var $ControlTile = $("<div class='controlTile' tabindex='1' onclick='event.stopPropagation();$(this).focus()'></div>");
    //    var type = $EbCtrl.attr("Ctype").trim();// get type from Eb-ctrlContainer html
    //    var id = type + (this.controlCounters[type + "Counter"])++;
    //    $ControlTile.attr("onfocusout", "$(this).children('.ctrlHead').hide()").on("focus", this.controlOnFocus.bind(this));
    //    $ControlTile.attr("eb-type", type).attr("id", id);
    //    $(".controls-dd-cont select").append("<option id='SelOpt" + id + "'>" + id + "</option>");//need to test///////////////
    //    $ControlTile.find(".close").on("click", this.controlCloseOnClick.bind(this));
    //    $EbCtrl.wrap($ControlTile);
    //    $("<div class='ctrlHead' style='display:none;'><i class='fa fa-arrows moveBtn' aria-hidden='true'></i><a href='#' class='close' style='cursor:default' data-dismiss='alert' aria-label='close' title='close'>×</a></div>").insertBefore($EbCtrl);
    //};

    this.CreateRelationString = function () { };

    this.movesfn = function (el, source, handle, sibling) {
        return true;
    };

    this.acceptFn = function (el, target, source, sibling) {
        if ($(source).attr("id") === "form-buider-toolBox" && $(target).attr("id") === "form-buider-toolBox") {
            return false;
        }
        // allow copy except toolbox
        if ($(source).attr("id") === "form-buider-toolBox" && $(target).attr("id") !== "form-buider-toolBox") {
            return true;
        }
        // sortable with in the container
        if ($(source).attr("id") !== "form-buider-toolBox" && source === target) {
            return true;
        }
        else {
            return true;
        }

    };

    this.drake = new dragula([document.getElementById(this.toolBoxid), document.getElementById(this.formId)], {
        removeOnSpill: false,
        copy: function (el, source) { return (source.className === 'form-buider-toolBox'); },
        copySortSource: true,
        moves: this.movesfn.bind(this),
        accepts: this.acceptFn.bind(this)
    });

    this.addTabPane = function (SelectedCtrl, prop, val, addedObj) {
        let id = SelectedCtrl.EbSid;
        let $ctrl = $("#cont_" + id);
        let $tabMenu = $(`<li li-of="${addedObj.EbSid}"><a data-toggle="tab" href="#${addedObj.EbSid}">${addedObj.Name}</a></li>`);
        let $tabPane = $(`<div id="${addedObj.EbSid}" ebsid="${addedObj.EbSid}" class="tab-pane fade  ebcont-ctrl"></div>`);
        $ctrl.closestInner(".nav-tabs").append($tabMenu);
        $ctrl.closestInner(".tab-content").append($tabPane);
        this.drake.containers.push($tabPane[0]);
    };

    this.RemoveTabPane = function (SelectedCtrl, prop, val, delobj) {
        let id = SelectedCtrl.EbSid;
        let $ctrl = $("#cont_" + id);
        let $tabMenu = $ctrl.find(`[li-of=${delobj.EbSid}]`).remove();
        let $tabPane = $(`#${delobj.Name}`).remove();
    };

    this.PGobj.CXVE.onAddToCE = function (prop, val, addedObj) {
        if (this.SelectedCtrl.ObjType === "TableLayout" && prop === "Controls") {
            let $tblTr = $(`#cont_${this.PGobj.CurObj.EbSid}>table>tbody>tr`);
            let $td = $(`<td id='@name@' ebsid='${addedObj.EbSid}' style='width:auto'; class='form-render-table-Td tdDropable ebcont-ctrl'></td>`);
            $tblTr.append($td);
            this.pushToDragables($td);
            this.makeTdResizable($td.prev("td"));
        }
        else if (this.SelectedCtrl.ObjType === "TabControl" && prop === "Controls") {
            //addedObj.EbSid = parent.EbSid + addedObj.EbSid;
            this.addTabPane(this.SelectedCtrl, prop, val, addedObj);
        }
    }.bind(this);

    this.PGobj.PropertyChanged = function (PropsObj, CurProp) {
        if (CurProp === 'DataSourceId') {
            this.PGobj.PGHelper.dataSourceInit(this.DSchangeCallBack);
        }
    }.bind(this);

    this.PGobj.CXVE.onRemoveFromCE = function (prop, val, delobj) {
        if (this.SelectedCtrl.ObjType === "TableLayout" && prop === "Controls")
            alert();
        else if (this.SelectedCtrl.ObjType === "TabControl" && prop === "Controls")
            this.RemoveTabPane(this.SelectedCtrl, prop, val, delobj);
    }.bind(this);

    this.Init = function () {
        $.contextMenu({
            selector: '.Eb-ctrlContainer',
            autoHide: true,
            build: function ($trigger, e) {
                return {
                    items: {
                        "Delete": {
                            "name": "Remove",
                            icon: "fa-trash",
                            callback: this.del
                        },
                    }
                };
            }.bind(this)
        });

        this.drake.on("drop", this.onDropFn.bind(this));
        this.drake.on("drag", this.onDragFn.bind(this));
        this.drake.on("dragend", this.onDragendFn.bind(this));
        this.$form.on("focus", this.controlOnFocus.bind(this));
        this.$form.click();
        if (this.isEditMode) {
            this.makeTdsDropable_Resizable();
            this.makeTabsDropable();
        }
    };

    this.DSchangeCallBack = function () {

    };

    this.Init();
};