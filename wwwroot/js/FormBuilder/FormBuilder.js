const formBuilder = function (options) {
    this.wc = options.wc;
    this.cid = options.cid;
    this.formId = options.formId;
    this.Name = this.formId;
    this.toolBoxid = options.toolBoxId;
    this.primitiveToolsId = options.primitiveToolsId;
    this.rootContainerObj = null;
    this.builderType = options.builderType;
    this.toolContClass = "tool-sec-cont";
    this.$propGrid = $("#" + options.PGId);
    this.BeforeSave = function () { this.PGobj.getvaluesFromPG(); return true; }.bind(this);

    $(`[eb-form=true]`).attr("ebsid", this.formId).attr("id", this.formId);

    this.$form = $("#" + this.formId);
    this.EbObject = options.objInEditMode;
    this.isEditMode = false;
    commonO.Current_obj = this.EbObject;

    this.controlCounters = CtrlCounters;//Global
    this.currentProperty = null;
    this.CurRowCount = 2;
    this.CurColCount = 2;
    this.movingObj = {};

    this.DraggableConts = [...(document.querySelectorAll("[ebclass=tool-sec-cont]")), document.getElementById(this.formId)];


    this.GenerateButtons = function () {
        if (options.builderType === 'WebForm' && options.objInEditMode !== null) {
            $("#obj_icons").empty().append(`<button class='btn' id= 'form_preview' data-toggle='tooltip' data-placement='bottom' title= 'Preview'>
                                            <i class='fa fa-eye' aria-hidden='true'></i>
                                        </button>`);
            $("#form_preview").off("click").on("click", function () {
                if (this.EbObject.RefId === null || this.EbObject.RefId === "")
                    EbMessage("show", { Message: 'Refresh page then Try again', AutoHide: true, Background: '#1e1ebf' });
                else
                    window.open("../WebForm/Index?refid=" + this.EbObject.RefId, '_blank');
            }.bind(this));
        }
    }.bind(this);

    this.del = function (eType, selector, action, originalEvent) {
        let $e = selector.$trigger;
        let ebsid = $e.attr("ebsid");
        let ControlTile = $(`#cont_${ebsid}`).closest(".Eb-ctrlContainer");
        this.PGobj.removeFromDD(this.rootContainerObj.Controls.GetByName(ebsid).EbSid);
        let ctrl = this.rootContainerObj.Controls.PopByName(ebsid);
        if (ctrl.ObjType === "Approval")
            this.ApprovalCtrl = null;
        else if (ctrl.ObjType === "ProvisionLocation")
            this.ProvisionLocationCtrl = null;
        ControlTile.parent().focus();
        ControlTile.remove();
        this.PGobj.removeFromDD(ebsid);
        this.saveObj();
        return ctrl;
    }.bind(this);

    this.controlOnFocus = function (e) {
        e.stopPropagation();
        if (this.curControl && this.curControl.attr("ebsid") === $(e.target).attr("ebsid"))
            return;
        if (e.target.id === this.formId) {
            this.curControl = $(e.target);
            this.CreatePG(this.rootContainerObj);
            return;
        }
        else
            this.curControl = $(e.target).closest(".Eb-ctrlContainer");
        let ebsid = this.curControl.attr("ebsid");
        this.CreatePG(this.rootContainerObj.Controls.GetByName(ebsid));
        //  this.PGobj.ReadOnly();
    }.bind(this);

    this.InitContCtrl = function (ctrlObj, $ctrl) {///////////////////////////////////////////////////////////////////////////////////////////////////
        let parentObj = this.rootContainerObj.Controls.getParent(ctrlObj);
        ctrlObj.TableName = parentObj.TableName;
        ctrlObj.isTableNameFromParent = true;
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
                $(tapBtns[0]).attr("href", "#" + pane.EbSid).find("span").text(pane.Name).closest("li").attr("li-of", pane.EbSid).attr("ebsid", pane.EbSid);
            });
            this.makeTabsDropable();
        }
        else if (ctrlObj.ObjType === "GroupBox") {
            let el = $(`[ebsid=${ctrlObj.EbSid}] .group-box`)[0];
            this.makeElementDropable(el);
        }
    };

    this.makeGBsDropable = function () {
        $.each($("#" + this.formId + " .group-box"), function (i, el) {
            this.makeElementDropable(el);
        }.bind(this));
    };

    this.makeDataObjectDropable = function () {
        $.each($("#" + this.formId + " .Dt-Rdr-col-cont"), function (i, el) {
            this.makeElementDropable(el);
        }.bind(this));
    }

    this.makeElementDropable = function (el) {
        if (this.drake) {
            if (!this.drake.containers.contains(el)) {
                this.drake.containers.push(el);
            }
        }
    };

    this.makeTabsDropable = function () {
        $.each($("#" + this.formId + " .tab-pane"), function (i, el) {
            this.makeElementDropable(el);
        }.bind(this));
    };

    this.makeTdsDropable_Resizable = function () {
        $.each($(".ebResizable"), function (i, el) {
            let $e = $(el);
            this.pushToDragables($($e.children()[0]));
            if (($(".ebResizable").length - 1) !== i)
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
        cuTdobj.Width = parseInt(curTdWidthPerc);
        $(event.target).css("width", curTdWidthPerc.toString() + "%");
    };

    this.pushToDragables = function ($e) {
        let el = $e[0];
        if (this.drake) {
            if (!this.drake.containers.contains(el)) {
                this.drake.containers.push(el);
            }
        }
    };

    this.InitEditModeCtrls = function (editModeObj) {
        let ObjCopy = { ...editModeObj };
        let newObj = new EbObjects["Eb" + editModeObj.ObjType](editModeObj.EbSid, editModeObj);
        this.rootContainerObj = newObj;
        this.rootContainerObj.Name = ObjCopy.Name;
        this.rootContainerObj.EbSid_CtxId = ObjCopy.EbSid_CtxId;

        commonO.Current_obj = this.rootContainerObj;
        this.EbObject = this.rootContainerObj;

        // convert json to ebobjects
        Proc(editModeObj, this.rootContainerObj);
        $(".Eb-ctrlContainer").each(function (i, el) {
            if (el.getAttribute("childOf") === 'EbUserControl')
                return true;
            this.initCtrl(el);
        }.bind(this));
        $("#" + this.rootContainerObj.EbSid).focus();
    };

    this.initCtrl = function (el) {
        let $el = $(el);
        let type = $el.attr("ctype").trim();
        let attr_ebsid = $el.attr("ebsid");
        let attrEbsid_Dgt = parseInt(attr_ebsid.match(/\d+$/)[0]);
        let attrEbsid_Except_Dgt = attr_ebsid.substring(0, attr_ebsid.length - attrEbsid_Dgt.toString().length);

        let ctrlCount = this.controlCounters[type + "Counter"];
        this.controlCounters[type + "Counter"] = (attrEbsid_Dgt > ctrlCount) ? attrEbsid_Dgt : ctrlCount;
        let ebsid = attrEbsid_Except_Dgt + attrEbsid_Dgt;// inc counter
        $el.attr("tabindex", "1");
        this.ctrlOnClickBinder($el, type);
        $el.on("focus", this.controlOnFocus.bind(this));
        $el.attr("eb-type", type);
        $el.attr("ebsid", ebsid);
        if (type !== "UserControl")
            this.updateControlUI(ebsid);
        this.PGobj.addToDD(this.rootContainerObj.Controls.GetByName(ebsid));
    };

    this.ctrlOnClickBinder = function ($ctrl, type) {
        if (type === "TabControl")
            $ctrl.on("click", function myfunction() {
                let $e = $(event.target);
                if ($e.closest(".cont-prop-btn").length === 1 || $e.closest(".ebtab-add-btn").length === 1)// to skip event.stopPropagation()
                    return;

                if ($e.closest("a").attr("data-toggle") !== "tab")
                    event.stopPropagation();
                $(event.target).closest(".Eb-ctrlContainer").focus();
            });
        else
            $ctrl.on("click", function myfunction() {
                let $e = $(event.target);
                if ($e.closest(".cont-prop-btn").length === 1)// to skip event.stopPropagation()
                    return;

                event.stopPropagation();
                if ($e.attr("class") !== "eb-lbltxtb")
                    $(this).focus();
            });
    };

    this.updateControlUI = function (ebsid, type) {
        let obj = this.rootContainerObj.Controls.GetByName(ebsid);
        let _type = obj.ObjType;
        $.each(obj, function (propName, propVal) {
            let meta = getObjByval(AllMetas["Eb" + _type], "name", propName);
            if (meta && meta.IsUIproperty)
                this.updateUIProp(propName, ebsid, _type);
        }.bind(this));
    };

    this.updateUIProp = function (propName, id, type) {
        let obj = this.rootContainerObj.Controls.GetByName(id);
        let NSS = getObjByval(AllMetas["Eb" + type], "name", propName).UIChangefn;
        if (NSS) {
            let NS1 = NSS.split(".")[0];
            let NS2 = NSS.split(".")[1];
            EbOnChangeUIfns[NS1][NS2](id, obj);
        }
    };

    this.PGobj = new Eb_PropertyGrid({
        id: "pgWraper",
        wc: this.wc,
        cid: this.cid,
        $extCont: $(".property-grid-cont"),
        isDraggable: true
    });

    //Edit mode
    if (this.EbObject) {
        this.isEditMode = true;
        this.InitEditModeCtrls(this.EbObject);
    }
    if (this.EbObject === null) {
        this.rootContainerObj = new EbObjects["Eb" + this.builderType](this.formId);
        commonO.Current_obj = this.rootContainerObj;
        this.EbObject = this.rootContainerObj;
    }

    this.curControl = null;
    this.drake = null;

    this.CreatePG = function (control) {
        console.log("CreatePG called for:" + control.Name);
        this.$propGrid.css("visibility", "visible");
        this.PGobj.setObject(control, AllMetas["Eb" + this.curControl.attr("eb-type")]);////
    };

    this.saveObj = function () {
        this.PGobj.getvaluesFromPG();
    };

    this.onDragFn = function (el, source) {
        let $source = $(source);
        //if drag start within the form
        if ($source.attr("ebclass") !== this.toolContClass) {
            let id = $(el).closest(".Eb-ctrlContainer").attr("ebsid");
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
            if ($target.attr("ebclass") !== this.toolContClass) {
                if ($sibling.attr("id")) {
                    let idx = $sibling.index() - 1;
                    this.rootContainerObj.Controls.InsertAt(idx, this.movingObj);
                }
                else {
                    this.rootContainerObj.Controls.Append(this.movingObj);
                }
                this.saveObj();
                $(el).off("focus").on("focus", this.controlOnFocus.bind(this));
            }
        }
    };

    this.onDropFn = function (el, target, source, sibling) {
        if (el.contains(target))
            return;
        let $target = $(target);
        if (target) {
            //drop from toolbox to form
            if ($(source).attr("ebclass") === this.toolContClass) {
                let $el = $(el);
                let type = $el.attr("eb-type").trim();
                let ebsid = type + ++(this.controlCounters[type + "Counter"]);
                let $sibling = $(sibling);
                $el.remove();
                let ctrlObj = new EbObjects["Eb" + type](ebsid);
                let $ctrl = ctrlObj.$Control;

                if (type === "UserControl") {///user control refid set on ctrlobj
                    ctrlObj["RefId"] = $(el).find("option:selected").attr('refid');
                    this.AsyncLoadHtml(ctrlObj["RefId"], "cont_" + ctrlObj["EbSid"]);
                }
                else if (type === "Approval") {
                    ctrlObj.TableName = this.rootContainerObj.TableName + "_reviews";
                    this.ApprovalCtrl = ctrlObj;
                }
                else if (type === "ProvisionLocation") {
                    this.ProvisionLocationCtrl = ctrlObj;
                }
                else if (type === "SimpleSelect" || type === "BooleanSelect") {
                    $ctrl.find(".selectpicker").selectpicker();
                }

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

                if (type === "DataObject" && this.builderType === "UserControl") {
                    //this.DraggableConts.push(document.querySelectorAll(".Dt-Rdr-col-cont")[1]);

                    this.DraggableConts.push($(`#cont_${ctrlObj.EbSid_CtxId} .Dt-Rdr-col-cont`)[0]);

                }

                $ctrl.focus();
                ctrlObj.Label = ebsid;
                ctrlObj.HelpText = "";
                if (ctrlObj.IsContainer)
                    this.InitContCtrl(ctrlObj, $ctrl);
                $ctrl.focus();
                this.updateControlUI(ebsid);
            }
            //drop from blk-cont to form(Eb Data object control)
            if ($(source).attr("ebclass") === "blk-cont") {
                let $el = $(el);
                let type = $el.attr("eb-type").trim();
                let CntrlName = $el.attr("data-ctrl").trim();
                let ColumnlName = $el.attr("data-column").trim();
                let ebsid = type + ++(this.controlCounters[type + "Counter"]);
                let $sibling = $(sibling);
                $el.remove();
                let ctrlObj = new EbObjects["Eb" + type](ebsid);
                ctrlObj.DataObjCtrlName = CntrlName;
                ctrlObj.DataObjColName = ColumnlName;
                ctrlObj.Label = ColumnlName;
                let $ctrl = ctrlObj.$Control;

                if (type === "UserControl") {///user control refid set on ctrlobj
                    ctrlObj["RefId"] = $(el).find("option:selected").attr('refid');
                    this.AsyncLoadHtml(ctrlObj["RefId"], "cont_" + ctrlObj["EbSid"]);
                }
                else if (type === "Approval") {
                    ctrlObj.TableName = this.rootContainerObj.TableName + "_reviews";
                    this.ApprovalCtrl = ctrlObj;
                }
                else if (type === "ProvisionLocation") {
                    this.ProvisionLocationCtrl = ctrlObj;
                }
                else if (type === "SimpleSelect" || type === "BooleanSelect") {
                    $ctrl.find(".selectpicker").selectpicker();
                }

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

                if (type === "DataObject" && this.builderType === "UserControl") {
                    this.DraggableConts.push(document.querySelectorAll(".Dt-Rdr-col-cont")[0]);
                }

                $ctrl.focus();

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

    this.onClonedFn = function (clone, original, type) {
        if ($(original).attr("eb-type") === "UserControl" && type === "copy") {
            $(clone).find("select").val($(original).find("option:selected").val());
        }
    };

    this.AsyncLoadHtml = function (refId, divId) {
        setTimeout(function () {
            $("#" + divId).append(`<i class="fa fa-spinner fa-pulse" aria-hidden="true"></i>`);
        }, 1);

        $.ajax({
            type: "POST",
            url: "../WebForm/getDesignHtml",
            data: { refId: refId },
            success: function (html) {
                $("#" + divId).html(html);
            }
        });
    };

    this.GetLocationConfig = function (_ctrl) {
        if (_ctrl.hasOwnProperty('_locationConfig'))
            return;
        $.ajax({
            type: "POST",
            url: "../WebForm/GetLocationConfig",
            data: {},
            success: function (ctrl, configObj) {
                ctrl._locationConfig = JSON.parse(configObj);
                $.each(ctrl._locationConfig, function (i, config) {
                    let newo = new EbObjects.UsrLocField(config.Name.replace(/\s/g, '').toLowerCase());
                    newo.DisplayName = config.Name;
                    newo.IsRequired = config.IsRequired;
                    newo.Type = config.Type;
                    ctrl.Fields.$values.push(newo);
                });
                EbOnChangeUIfns.EbProvisionLocation.mapping(ctrl.EbSid, ctrl);
            }.bind(this, _ctrl)
        });
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
        if ($(handle).hasClass("ui-resizable-handle"))//if handle is resizable's handle of table layout
            return false;
        return true;
    };

    this.acceptFn = function (el, target, source, sibling) {
        if (el.contains(target))
            return;

        if ($(source).hasClass(this.toolContClass) && el.getAttribute("eb-type") === "Approval" && this.ApprovalCtrl) {
            this.EbAlert.clearAlert("reviewCtrl");
            this.EbAlert.alert({
                id: "reviewCtrl",
                head: "Form already contains a Review control.",
                body: "You cannot add more than one approval control into the form",
                type: "warning",
                delay: 3000
            });
            return false;
        }

        if ($(source).hasClass(this.toolContClass) && el.getAttribute("eb-type") === "ProvisionLocation" && this.ProvisionLocationCtrl) {
            this.EbAlert.clearAlert("mngLocCtrl");
            this.EbAlert.alert({
                id: "mngLocCtrl",
                head: "Form already contains a provision location control.",
                body: "You cannot add more than one provision location control into the form",
                type: "warning",
                delay: 3000
            });
            return false;
        }

        let _class = $(target).attr("ebclass");
        if (_class !== this.toolContClass && _class !== "blk-cont")
            return true;
        else
            return false;

        //if ($(source).attr("id") === this.primitiveToolsId && $(target).attr("id") === this.primitiveToolsId) {
        //    return false;
        //}
        //// allow copy except toolbox
        //if ($(source).attr("id") === this.primitiveToolsId && $(target).attr("id") !== this.primitiveToolsId) {
        //    return true;
        //}
        //// sortable with in the container
        //if ($(source).attr("id") !== this.primitiveToolsId && source === target) {
        //    return true;
        //}
        //else {
        //    return true;
        //}

    };

    this.drake = new dragula(this.DraggableConts, {
        revertOnSpill: true,
        copy: function (el, source) { return (source.className.includes('tool-sec-cont') || source.className.includes('Dt-Rdr-col-cont') ); },
        copySortSource: true,
        moves: this.movesfn.bind(this),
        accepts: this.acceptFn.bind(this)
    });

    this.addTabPane = function (SelectedCtrl, prop, val, addedObj) {
        let id = SelectedCtrl.EbSid;
        let $ctrl = $("#cont_" + id);
        let $tabMenu = $(`<li li-of="${addedObj.EbSid}" ebsid="${addedObj.EbSid}">
                            <a data-toggle="tab" class="ppbtn-cont" href="#${addedObj.EbSid}">
                                <span class='eb-label-editable'>${addedObj.Name}</span>
                                <input id='${addedObj.EbSid}lbltxtb' class='eb-lbltxtb' type='text'/>
                                <div class='ebtab-close-btn eb-fb-icon'><i class='fa fa-times' aria-hidden='true'></i></div>
                                <div ctrl-ebsid='${addedObj.EbSid}' class='cont-prop-btn'><i class='fa fa-ellipsis-v' aria-hidden='true'></i></div>
                            </a>
                            <div class='ebtab-add-btn eb-fb-icon'><i class='fa fa-plus' aria-hidden='true'></i></div>
                        </li>`);
        let $tabPane = $(`<div id="${addedObj.EbSid}" ctype="${addedObj.ObjType}" ebsid="${addedObj.EbSid}" class="tab-pane fade  ebcont-ctrl"></div>`);
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
        if (this.PGobj.PropsObj.ObjType === "TableLayout" && prop === "Controls") {
            let $tblTr = $(`#cont_${this.PGobj.CurObj.EbSid}>table>tbody>tr`);
            let $td = $(`<td id='@name@' ebsid='${addedObj.EbSid}' style='padding: 3px; width:auto;' class='form-render-table-Td ebResizable ebcont-ctrl ppbtn-cont'>
                            <div style='height: 100%; width: 100%; min-height: 30px;'><div ctrl-ebsid='${addedObj.EbSid}' class='cont-prop-btn'><i class='fa fa-ellipsis-v' aria-hidden='true'></i></div></div>
                       </td>`);
            $tblTr.append($td);
            this.pushToDragables($($td.children()[0]));
            this.makeTdResizable($td.prev("td"));
        }
        else if (this.PGobj.PropsObj.ObjType === "TabControl" && prop === "Controls") {
            //addedObj.EbSid = parent.EbSid + addedObj.EbSid;
            addedObj.Name = addedObj.Name.substr(-5);//furthure shorten name 
            this.addTabPane(this.PGobj.PropsObj, prop, val, addedObj);
        }
    }.bind(this);

    this.PGobj.PropertyChanged = function (PropsObj, CurProp) {
        if (CurProp === "TableName" && PropsObj.IsContainer) {
            let TblName = PropsObj.TableName;
            PropsObj.isTableNameFromParent = false;
            this.updateChildTablesName(PropsObj, TblName);
        }
        let Refid = PropsObj[CurProp];
        let ObjType = PropsObj.ObjType;
        if (ObjType === "DataObject" && CurProp === "DataSource") {
            $.LoadingOverlay('show');
            $.ajax({
                type: "POST",
                url: "../DS/GetColumns4Control",
                data: { DataSourceRefId: Refid },
                success: function (Columns) {
                    PropsObj["Columns"] = JSON.parse(Columns);
                    $.LoadingOverlay('hide');
                    this.updateControlUI(PropsObj.EbSid_CtxId);
                }.bind(this)
            });
        }


        if (ObjType === "WebForm" && CurProp === "DataPushers") {
            $.LoadingOverlay('show');
            $.ajax({
                type: "POST",
                url: "../WebForm/GetDataPusherJson",
                data: { RefId: PropsObj.DataPushers.$values[0].FormRefId },
                success: function (Json) {
                    console.log(Json);
                    $.LoadingOverlay('hide');
                }.bind(this)
            });
        }


    }.bind(this);

    this.updateChildTablesName = function (PropsObj, TblName) {
        for (var i = 0; i < PropsObj.Controls.$values.length; i++) {
            let ctrl = PropsObj.Controls.$values[i];
            if (ctrl.IsContainer && ctrl.isTableNameFromParent) {
                ctrl.TableName = TblName;
                if (ctrl.isTableNameFromParent)
                    this.updateChildTablesName(ctrl, TblName);
            }
        }
    };

    this.lbltxtbBlur = function (e) {
        $e = $(event.target);
        $e.hide();
        $e.prev(".eb-label-editable").show();
        $e.siblings(".ebtab-close-btn").show();
    };

    this.lbltxtbKeyUp = function (e) {

        let $e = $(event.target);
        let count = $e.val().length;
        let width = "10px";
        if (count !== 0)
            width = (count * 6.4 + 8) + "px";

        $e.css("width", width);

        let val = $e.val();
        let $colTile = $e.closest(".Eb-ctrlContainer");
        let ebsid = $colTile.attr("ebsid");
        let ctrlType = $colTile.attr("eb-type");
        let ctrlMeta = AllMetas["Eb" + ctrlType];
        if (ctrlType === "TabControl") {
            ebsid = $e.closest("li").attr("ebsid");
            let ctrl = this.rootContainerObj.Controls.GetByName(ebsid);
            let paneMeta = AllMetas["Eb" + ctrl.ObjType];
            ctrl["Title"] = val;
            this.PGobj.execUiChangeFn(getObjByval(paneMeta, "name", "Title").UIChangefn, ctrl);
        }
        if (ctrlType === "DataGrid") {
            if ($e.closest("th").length === 1)
                ebsid = $e.closest("th").attr("ebsid");// for TH label
            else
                ebsid = $e.closest(".Eb-ctrlContainer").attr("ebsid");// for DG label
            let ctrl = this.rootContainerObj.Controls.GetByName(ebsid);
            let ColMeta = AllMetas["Eb" + ctrl.ObjType];
            ctrl["Title"] = val;

            if ($e.closest("th").length === 1)
                this.PGobj.execUiChangeFn(getObjByval(ColMeta, "name", "Title").UIChangefn, ctrl);// for TH label
            else
                this.PGobj.changePropertyValue("Label", val);// for DG label
        }
        else {
            let ctrl = this.rootContainerObj.Controls.GetByName(ebsid);
            if (this.PGobj.CurObj !== ctrl)
                this.PGobj.setObject(ctrl, ctrlMeta);
            this.PGobj.changePropertyValue("Label", val);
        }

    };

    this.contPropBtnClick = function (e) {
        $(".stickBtn").hide(); // hard coding temp2 23-08 -19
        $("#form-buider-propGrid").show();

        let $ControlTile = $(e.target).closest(".Eb-ctrlContainer");
        let ebsid = $ControlTile.attr("ebsid");
        let ctrlType = $ControlTile.attr("eb-type");
        let ctrl = this.rootContainerObj.Controls.GetByName(ebsid);
        let ctrlMeta = AllMetas["Eb" + ctrlType];
        this.PGobj.setObject(ctrl, ctrlMeta);
        let colEbsid = $(e.target).closest(`[ctrl-ebsid]`).attr("ctrl-ebsid");
        this.PGobj.CXVE.colTile2FocusSelec = `[ebsid=${colEbsid}].colTile`;
        $(`#${this.PGobj.wraperId} [for='Controls']`).trigger("click");

    }.bind(this);

    this.contTabAddClick = function (e) {////////////////////////////////
        let $ControlTile = $(e.target).closest(".Eb-ctrlContainer");
        let TabEdsid = $ControlTile.attr("ebsid");
        let PrevObjEbsid = $ControlTile.find(".tab-btn-cont > ul > li:last-child").attr("ebsid");


        let numStr = this.PGobj.CXVE.getMaxNumberFromItemName($ControlTile.find(".tab-btn-cont > ul > li"));//PrevObjEbsid.substr(PrevObjEbsid.length - 3).replace(/[^0-9]/g, '');

        let lastNum = parseInt(numStr) || 0;
        let nextCount = lastNum + 1;
        let ShortName = "Pane" + nextCount;

        let ebsid = TabEdsid + "_" + ShortName;

        let newObj = new EbObjects["EbTabPane"](ebsid);

        newObj.Name = ShortName;
        newObj.Title = ShortName;

        let TabObj = this.rootContainerObj.Controls.GetByName(TabEdsid);


        let ctrlMeta = AllMetas["EbTabControl"];
        this.PGobj.setObject(TabObj, ctrlMeta);

        TabObj.Controls.$values.push(newObj);
        this.addTabPane(this.PGobj.PropsObj, "Controls", "val", newObj);

    }.bind(this);

    this.contTabDelClick = function (e) {/////////////////////////
        let $e = $(e.target).closest("li");
        let PaneEbsid = $e.attr("ebsid");

        let $ControlTile = $(e.target).closest(".Eb-ctrlContainer");
        let TabEdsid = $ControlTile.attr("ebsid");

        let TabObj = this.rootContainerObj.Controls.GetByName(TabEdsid);
        let PaneObj = this.rootContainerObj.Controls.GetByName(PaneEbsid);
        let ctrlMeta = AllMetas["EbTabControl"];
        this.PGobj.setObject(TabObj, ctrlMeta);

        let index = TabObj.Controls.$values.indexOf(PaneObj);
        let delobj = TabObj.Controls.$values.splice(index, 1)[0];
        this.RemoveTabPane(this.PGobj.PropsObj, "Controls", "val", delobj);
    }.bind(this);

    this.ctrlLblDblClick = function (e) {
        $e = $(event.target);
        $e.hide();
        $e.siblings(".ebtab-close-btn").hide();
        $e.siblings(".eb-lbltxtb").val($e.text()).show().select();
    };

    this.PGobj.CXVE.onRemoveFromCE = function (prop, val, delobj) {
        if (this.PGobj.PropsObj.ObjType === "TableLayout" && prop === "Controls")
            alert();
        else if (this.PGobj.PropsObj.ObjType === "TabControl" && prop === "Controls")
            this.RemoveTabPane(this.PGobj.PropsObj, prop, val, delobj);
    }.bind(this);

    this.keyUp = function (e) {
        if (e.keyCode === 46) {// if delete key
            let $e = $(e.target);
            if ($e.hasClass("Eb-ctrlContainer")); {
                let ebsid = $e.attr("ebsid");
                let ControlTile = $(`#cont_${ebsid}`).closest(".Eb-ctrlContainer");
                this.PGobj.removeFromDD(this.rootContainerObj.Controls.GetByName(ebsid).EbSid);
                let ctrl = this.rootContainerObj.Controls.PopByName(ebsid);
                if (ctrl.ObjType === "Approval")
                    this.ApprovalCtrl = null;
                else if (ctrl.ObjType === "ProvisionLocation")
                    this.ProvisionLocationCtrl = null;
                ControlTile.parent().focus();
                ControlTile.remove();
                this.PGobj.removeFromDD(ebsid);
                this.saveObj();
                return ctrl;
            }
        }
    };

    this.ctxBuildFn = function ($trigger, e) {
        return {
            items: {
                "Delete": {
                    name: "Remove",
                    icon: "fa-trash",
                    callback: this.del
                }
            }
        }
    }.bind(this)

    this.CtxSettingsObj = {
        selector: '.Eb-ctrlContainer',
        autoHide: true,
        build: this.ctxBuildFn.bind(this)
    }

    this.Init = function () {
        $.contextMenu(this.CtxSettingsObj);
        this.drake.on("drop", this.onDropFn.bind(this));
        this.drake.on("drag", this.onDragFn.bind(this));
        this.drake.on("dragend", this.onDragendFn.bind(this));
        this.drake.on("cloned", this.onClonedFn.bind(this));
        this.$form.on("focus", this.controlOnFocus.bind(this));
        this.$form.on("dblclick", ".eb-label-editable", this.ctrlLblDblClick.bind(this));
        this.$form.on("blur", ".eb-lbltxtb", this.lbltxtbBlur.bind(this));
        this.$form.on("keyup", ".eb-lbltxtb", this.lbltxtbKeyUp.bind(this));
        this.$form.on("click", ".cont-prop-btn", this.contPropBtnClick.bind(this));
        this.$form.on("click", ".ebtab-add-btn", this.contTabAddClick.bind(this));
        this.$form.on("click", ".ebtab-close-btn", this.contTabDelClick.bind(this));
        this.$form.on("keyup", this.keyUp.bind(this));
        if (options.builderType === 'WebForm' && this.rootContainerObj.TableName.trim() === "")
            this.rootContainerObj.TableName = this.rootContainerObj.Name + "_tbl";
        if (this.rootContainerObj.DisplayName.trim() === "")
            this.rootContainerObj.DisplayName = this.rootContainerObj.Name;
        this.$form.focus();
        if (this.isEditMode) {
            this.makeTdsDropable_Resizable();
            this.makeTabsDropable();
            this.makeGBsDropable();
            this.makeDataObjectDropable();
        }
        this.ApprovalCtrl = getFlatContObjsOfType(this.rootContainerObj, "Approval")[0];
        this.ProvisionLocationCtrl = getFlatObjOfType(this.rootContainerObj, "ProvisionLocation")[0];


        this.EbAlert = new EbAlert({
            id: this.toolBoxid + "ToolBoxAlertCont",
            top: 24,
            left: 24
        });

        this.GenerateButtons();

    };

    this.DSchangeCallBack = function () {

    };

    this.Init();
};