const formBuilder = function (options) {
    this.wc = options.wc;
    this.cid = options.cid;
    this.formId = options.formId;
    this.Name = this.formId;
    this.toolBoxid = options.toolBoxId;
    this.rootContainerObj = null;
    this.$propGrid = $("#" + options.PGId);
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
        var $e = selector.$trigger;
        var id = $e.attr("id");
        var ControlTile = $(`#${id}`).closest(".Eb-ctrlContainer");
        this.PGobj.removeFromDD(this.rootContainerObj.Controls.GetByName(id).EbSid);
        var ctrl = this.rootContainerObj.Controls.PopByName(id);
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
        var id = this.curControl.attr("id");
        e.stopPropagation();
        this.CreatePG(this.rootContainerObj.Controls.GetByName(id));
        this.CurColCount = $(e.target).val();
        //  this.PGobj.ReadOnly();
    };

    this.InitContCtrl = function (ctrlObj, $ctrl) {///////////////////////////////////////////////////////////////////////////////////////////////////
        if (ctrlObj.ObjType === "TableLayout")
            this.makeTdsDropable();
        else if (ctrlObj.ObjType === "TabControl") {
            let tapPanes = $ctrl.find(".tab-pane");
            let tapBtns = $ctrl.find("ul.nav-tabs a");
            $.each(ctrlObj.Controls.$values, function (i, pane) {
                $(tapPanes[0]).attr("ebsid", pane.EbSid).attr("id", pane.EbSid);
                $(tapBtns[0]).attr("href", "#" + pane.EbSid).text(pane.EbSid).closest("li").attr("li-of", pane.EbSid);
            });
            this.makeTabsDropable();
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

    this.makeTdsDropable = function () {
        $.each($(".tdDropable"), function (i) {
            if (this.drake) {
                if (!this.drake.containers.contains(document.getElementsByClassName("tdDropable")[i])) {
                    this.drake.containers.push(document.getElementsByClassName("tdDropable")[i]);
                }
            }
        }.bind(this));
    };

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
        let id = type + (this.controlCounters[type + "Counter"])++;// inc counter
        id = $el.attr("ebsid") || id;
        $el.attr("tabindex", "1");
        if (type === "TabControl")
            $el.attr("onclick", "$(this).focus()");
        else
            $el.attr("onclick", "event.stopPropagation();$(this).focus()");
        $el.on("focus", this.controlOnFocus.bind(this));
        $el.attr("eb-type", type);
        $el.attr("eb-type", type).attr("id", id);
        this.updateControlUI(id);
    };

    this.updateControlUI = function (id, type) {
        let obj = this.rootContainerObj.Controls.GetByName(id);
        let _type = obj.ObjType
        $.each(obj, function (propName, propVal) {
            let meta = getObjByval(AllMetas["Eb" + _type], "name", propName);
            if (meta && meta.IsUIproperty)
                this.updateUIProp(propName, id, _type);
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
        console.log(control);
        this.$propGrid.css("visibility", "visible");
        this.SelectedCtrl = control;
        this.PGobj.setObject(control, AllMetas["Eb" + this.curControl.attr("eb-type")]);
        $('#pgWraper table td').find("input").change(this.PGinputChange.bind(this));////////
    };

    this.saveObj = function () {
        this.PGobj.getvaluesFromPG();
    };

    this.PGinputChange = function (e) {
        this.currentProperty = $(e.target);
        this.updateHTML(e);
    };

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

    this.onDragFn = function (el, source) {
        //if drag start within the form
        id = $(el).closest(".Eb-ctrlContainer").attr("id");
        if ($(source).attr("id") !== "form-buider-toolBox") {
            console.log("el poped");
            this.movingObj = this.rootContainerObj.Controls.PopByName(id);
        }
        else
            this.movingObj = null;
    };// start

    this.onDragendFn = function (el) {
        var sibling = $(el).next();
        var target = $(el).parent();
        if (this.movingObj) {

            //Drag end with in the form
            if (target.attr("id") !== "form-buider-toolBox") {
                if (sibling.attr("id")) {
                    console.log("sibling : " + sibling.id);
                    var idx = sibling.index() - 1;
                    this.rootContainerObj.Controls.InsertAt(idx, this.movingObj);
                }
                else {
                    console.log("no sibling ");
                    this.rootContainerObj.Controls.Append(this.movingObj);
                }
                this.saveObj();
                $(el).on("focus", this.controlOnFocus.bind(this));
            }

        }

    };

    //this.onDropFn = function (el, target, source, sibling) {

    //    if (target) {
    //        //drop from toolbox to form
    //        if ($(source).attr("id") === "form-buider-toolBox") {
    //            el.className = 'controlTile';
    //            var ctrl = $(el);
    //            var type = ctrl.attr("eb-type").trim();
    //            var id = type + (this.controlCounters[type + "Counter"])++;
    //            ctrl.attr("tabindex", "1").attr("onclick", "event.stopPropagation();$(this).focus()");
    //            ctrl.attr("onfocusout", "$(this).children('.ctrlHead').hide()").on("focus", this.controlOnFocus.bind(this));
    //            ctrl.attr("id", id);
    //            this.rootContainerObj.Controls.Append(new EbObjects["Eb" + type](id));
    //            ctrl.html("<div class='ctrlHead'><i class='fa fa-arrows moveBtn' aria-hidden='true'></i><a href='#' class='close' style='cursor:default' data-dismiss='alert' aria-label='close' title='close'>×</a></div>"
    //                + new EbObjects["Eb" + type](id).Html());

    //            ctrl.find(".close").on("click", this.controlCloseOnClick.bind(this));
    //            ctrl.focus();
    //        }
    //        else
    //            console.log("ondrop else : removed");
    //        this.saveObj();
    //    }
    //};


    this.onDropFn = function (el, target, source, sibling) {

        if (target) {
            //drop from toolbox to form
            if ($(source).attr("id") === "form-buider-toolBox") {
                var $el = $(el);
                var type = $el.attr("eb-type").trim();
                var id = type + (this.controlCounters[type + "Counter"])++;
                var $ctrl = new EbObjects["Eb" + type](id).$Control;
                $el.remove();

                var t = $("<div class='controlTile'>" + $ctrl.outerHTML() + "</div>");

                if (sibling)
                    $ctrl.insertBefore($(sibling));
                else
                    $(target).append($ctrl);

                $ctrl.attr("tabindex", "1").attr("onclick", "event.stopPropagation();$(this).focus()");
                $ctrl.on("focus", this.controlOnFocus.bind(this));
                $ctrl.attr("id", id).attr("ebsid", id);
                $ctrl.attr("eb-type", type);
                var ctrlObj = new EbObjects["Eb" + type](id);
                this.rootContainerObj.Controls.Append(ctrlObj);

                $ctrl.focus();
                ctrlObj.Label = id;
                ctrlObj.HelpText = "";
                if (ctrlObj.IsContainer)
                    this.InitContCtrl(ctrlObj, $ctrl);
                this.updateControlUI(id);
            }
            else
                console.log("ondrop else : removed");
        }
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

    this.updateHTML = function (e) {
        if (this.curControl.attr("id").toString().substr(0, 8) === "GridView") {
            if (this.currentProperty.parent().prev().text() === "Columns") {
                this.ChangeGridColNo(e);
            }
        }

    };

    this.ChangeGridColNo = function (e) {
        var newVal = $("#propGrid td:contains(Columns)").next().children().val();
        console.log("this.CurColCount: " + this.CurColCount + ", newVal " + newVal);
        var noOfTds = this.curControl.children().children().children().children().length;

        if (this.CurColCount < newVal)
            for (var i = noOfTds; i < newVal; i++) {
                console.log("this.CurColCount < newVal  ");//
                console.log(">  " + i);
                this.addTd(e);
            }
        else if (this.CurColCount > newVal) {
            console.log("this.CurColCount > newVal  ");//
            for (var j = noOfTds; j > newVal; j--) {
                console.log(">  " + j);//
                this.removeTd(e);
            }
        }
    };

    this.addTd = function (e) {
        var id = this.curControl.attr("id");
        var curTr = this.curControl.children().children().children();
        var noOfTds = curTr.children().length;
        this.rootContainerObj.Controls.GetByName(id).Controls.Append(new GridViewTdObj(id + "_Td" + noOfTds));
        curTr.append("<td id='" + id + "_Td" + noOfTds + "' class='tdDropable'> </td>");
        this.makeTdsDropable.bind(this);
        this.CurColCount = $(e.target).val();//tmp
    };

    this.removeTd = function (e) {
        var id = this.curControl.attr("id");
        var noOfTds = this.curControl.children().children().children().children().length;
        this.rootContainerObj.Controls.GetByName(id).Controls.Pop();
        this.curControl.find("tr").find("td").last().remove();
        this.makeTdsDropable.bind(this);
        this.CurColCount = $(e.target).val();//tmp
    };

    this.onChangeGridRowNo = function () {

    };

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

    this.Init = function () {

        $.contextMenu({
            selector: '.Eb-ctrlContainer',
            autoHide: true,
            build: function ($trigger, e) {
                return {
                    items: {
                        "Delete": {
                            "name": "Remove",
                            icon: "fa-minus",
                            callback: this.del
                        },
                    }
                };
            }.bind(this)
        });


        this.drake = new dragula([document.getElementById(this.toolBoxid), document.getElementById(this.formId)], {
            removeOnSpill: false,
            copy: function (el, source) { return (source.className === 'form-buider-toolBox'); },
            copySortSource: true,
            //mirrorContainer: document.getElementById('form-buider-form'),
            moves: this.movesfn.bind(this),
            accepts: this.acceptFn.bind(this)
        });

        this.drake.on("drop", this.onDropFn.bind(this));
        this.drake.on("drag", this.onDragFn.bind(this));
        this.drake.on("dragend", this.onDragendFn.bind(this));
        //$("#save").on("click", this.save.bind(this));
        //$("#commit").on("click", this.commit.bind(this));
        this.$form.on("focus", this.controlOnFocus.bind(this));
        //$('.controls-dd-cont .selectpicker').on('change', function (e) { $("#" +r $(this).find("option:selected").val()).focus(); });

        this.addTabPane = function (SelectedCtrl, prop, val, addedObj) {
            let id = SelectedCtrl.EbSid;
            let $ctrl = $("#" + id);
            let $tabMenu = $(`<li li-of="${addedObj.EbSid}"><a data-toggle="tab" href="#${addedObj.EbSid}">${addedObj.Name}</a></li>`);
            let $tabPane = $(`<div id="${addedObj.EbSid}" ebsid="${addedObj.EbSid}" class="tab-pane fade "></div>`);
            $ctrl.closestInner(".nav-tabs").append($tabMenu);
            $ctrl.closestInner(".tab-content").append($tabPane);
        };

        this.RemoveTabPane = function (SelectedCtrl, prop, val, delobj) {
            let id = SelectedCtrl.EbSid;
            let $ctrl = $("#" + id);
            let $tabMenu = $ctrl.find(`[li-of=${delobj.EbSid}]`).remove();
            let $tabPane = $(`#${delobj.Name}`).remove();
        };

        this.PGobj.CXVE.onAddToCE = function (prop, val, addedObj) {
            console.log(prop);
            console.log(val);
            if (this.SelectedCtrl.ObjType === "TableLayout" && prop === "Controls")
                alert();
            else if (this.SelectedCtrl.ObjType === "TabControl" && prop === "Controls") {
                //addedObj.EbSid = parent.EbSid + addedObj.EbSid;
                this.addTabPane(this.SelectedCtrl, prop, val, addedObj);
            }
        }.bind(this);

        this.PGobj.CXVE.onRemoveFromCE = function (prop, val, delobj) {
            console.log(prop);
            console.log(val);
            console.log(delobj);
            if (this.SelectedCtrl.ObjType === "TableLayout" && prop === "Controls")
                alert();
            else if (this.SelectedCtrl.ObjType === "TabControl" && prop === "Controls")
                this.RemoveTabPane(this.SelectedCtrl, prop, val, delobj);
        }.bind(this);

        this.PGobj.PropertyChanged = function (PropsObj, CurProp) {
            console.log("PropsObj: " + JSON.stringify(PropsObj));
            console.log("CurProp: " + CurProp);


            if (CurProp === 'DataSourceId') {
                this.PGobj.PGHelper.dataSourceInit(this.DSchangeCallBack);
            }

        }.bind(this);
        this.$form.click();
        if (this.isEditMode) {
            this.makeTdsDropable();
            this.makeTabsDropable();
        }
    };
    this.Init();
};