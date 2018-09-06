﻿const formBuilder = function (options) {
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



    this.del = function (ce) {
        var $e = $(ce.trigger.context);
        var id = $e.attr("id");
        this.DelCtrl(id);
    }.bind(this);

    this.DelCtrl = function (id) {
        var ControlTile = $(`#${id}`).closest(".Eb-ctrlContainer");
        this.PGobj.removeFromDD(this.rootContainerObj.Controls.GetByName(id).EbSid);
        var ctrl = this.rootContainerObj.Controls.PopByName(id);
        ControlTile.parent().focus();
        ControlTile.remove();
        this.PGobj.removeFromDD(id);
        this.saveObj();
        return ctrl;
    };
    this.CtxMenu = [{
        name: 'copy',
        img: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAE5SURBVGhD7dqvSgRhFIbx0apRMOwdmEwWvQAtbhKDVQRvwD/NC/AKlC2iRTDaBYuIFovXoAajTX2+dsKBGb45Z3ThfeAXlhnm27fsht1GKdW7bdziKcEyBukMP4nWkN4Y3uGRBhlyCe/wSIMMuYM99BxbwRaQ3j3skH1MZRry3+o6ZBYbOMBhoB3Mo3ddhozwDHtfpDf0/mRrGzKDB9h7MnxiEdW1DVmFvZ7pGNW1DdmFvf6B6yAvsM++QHVtQ8pre73cH9UR7LOvUJ2GBKQhXhoSkIZ4aUhAGuKlIQFpiJeGBKQhXhoSUOiQTewZS7BNzZC2NKRDGlKThnToT4e8wvsxp0Z54/bZqUPKx7M9LNMp0prDO7yDI31jBamV30W+4L2BKCcYpPKNP8EjvD8F1LrBOpRSvWuaX5uuctVnE+66AAAAAElFTkSuQmCC`,
        title: 'Copy this control',
        fun: function () {
            alert('i am update button')
        }
    }, {
        name: 'Cut',
        img: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAPFSURBVGhD7dpXiFVHHMfxtfcGasCAJmJHfBFExBYDoj5FbNgFGxawgA19ULCHgARRoqBgoiEWFFGxKwo+iVjig2DDFiMhkii2YPn+dvd/mYxzz9kVxBnwBx9Yzpl79/zvPdPObkkE6Yo6ZT+ml+qYjKv4E1WQXPpABbwt9xuSSjWswGtYETINyURFbINbgOmIZLIFoSL+QDIZhVAR8iuSyJd4jFARMhVJZANCBZj2iD718RShAuQ+ksgwhAow25FE8m4rzexJxJ29Q9og+jTHG4QKkLtIInn942ckkfUIFWAmIIlcQagA8xWiT1Nk9Y9bSCJDESrAbMVHT0ssxmFcx194AN0qWoZrAVgLWfkRoQLMOHxItItshW+hPcwPOIDT0I6zNNovrMZ/CP1yl26NfiiWiwi9TvT+Gpqz8gV6YSJWYQ8u4TlC7zkThRTbLxTzEt/AT2P4O0DXUVjU4UdjGbScP49/EHpdMb+jBkrTH+5JVa8qu6MDumAAvse/sHY3UfhKyzMI7nv5RsJyCqE2FfUCurZCfoGdPIRChYFoW/oE1t6/xVbCzvluwwpvh6yRLY9eq2/zf3HvaX07edFtYO1n64CTs7BzvvGw/IRQm4pQEbPwXq7BGul2yssmWPu1OlCe2ijWIXUb2bOrr6E+FmqXR3fDYARzAtZwgQ5kRKObOpi118MD9R+lJ3TsBnT/Wpu/oWHTchB2rjL2I3NHuRDWWJ/oDOjT9aNRZjfcNxfrJ3qfeWU/lnSCFeN+gkPgvz6Lrke/Uw/1ctMMj+C+gS5CfecYzkCTo3veaF6oB0WfdOeyH0uj12hzZWmIewi9jybdc9gBDRhToIsPfaCZ6QE9gw39kiwa+5Wq0NOSvdC3MQdaFWhesUzCTqhfTYduSQ3vlb7YvGjGXYfKFKT2isZz/9xyfNJorNeFjYA6/xJo+bII6j9j0RvqMzbn6LhfSBJbWT/u3GLy1lRRRntwvxANIHrko76RxB9yNMH5RfhUaDdEHa15Qhfv08TYGtFGw6l7wbql5kKDxRo8g52L+uniEdiFvoLmETffwc5rjVUXUeYO7EK1QfOjxaI7o/dFlHEXiGN0IJDjsDbDdSC2NIJdoGjJEcpJWBs9wIguWku5hTRBKJdhbQbqQGypCbcQraT9aFHoPp2JdgjW5souMrRvcB/YPUS0/+WwC3ahenihXaSlAdwd5UZEG+0r7ELlArSEXwr3eYDmmOhXxPvgFhMyH9FHnX4zQk8ZNZuriKT+A6gttI3VXl39Qc+9WuBzKpaSknc0xTqzn9t8uAAAAABJRU5ErkJggg==`,
        title: 'Cut this control',
        fun: this.cut
    }, {
        name: 'Paste',
        img: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFgSURBVGhD7Zg9SkNBFEafCIKVrSAICiIIEsHCDWjlBlyBoOtwA/a27sBKySastUsX8AfFxt/vyr1wGZ7mzbwZX2K+A6eYmTfJnJAhkIoQ0hlrcA8uf48mkCXYh5/Oc7gAJ4Z5eA19hHkJZ2AnyMG2IzyBdvBXeAPf3dwxrNv3k7MwC5vQDhGjHH4HCgew7pkmZvs6poYMoCGfat0zTSwS8gHvnDK2tUedM+WeePya+ARt75vOifc6ZxYJeZAJh4xtTZ6LYR/aXh8tB7d5kSEhUxcS3pFR+jsyViFtZEgMv4Vswbpf41g3oNFJSAkYMoqpDlmEq4n2oA+Rsa3NwWRSQi6gP0wu5SzJMKSAnYYcyUQL5D3ttRgiMERliMKQEIaoDFEYEsIQlSEKQ0L+ZcgLPGyg/E9le8YyJEWGKNlCVuBVpENob34Kd1v4DLOEpOAve04ZksoZvC3gOiTkb6mqL4ZAWsBK7e3QAAAAAElFTkSuQmCC`,
        title: 'Paste control',
        fun: this.paste
    }, {
        name: 'Remove',
        img: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAF7SURBVGhD7dnBboJAEMZx7u2zeGmxB5uYAL7/a8iVpde2OzCfYsMCwiw7TeafbGIsZfsrK5o1syzLsqw9q8/nV34Yre/L4YUfxsmV71Vb5HVTfXzyU+LRudsyv7oqL/kp2QjhiuNXWx5//EQuBoYRDc1Bc4ljHhEYspghAqPD+Ln5kG3ReqVLPZzgPmQwY4jb8EtZ7DXTXN5OwYk2YiYRMZbwDKZZM+HuCCSJSYZAEpjkCLQFowaB1mDUIdAzGLUItASjHoGmMfTu/PdTAcaym8OuTf/Xx4ZCBFqOUYxAPSa0lPwHQf8z9QiK/sjwa6Ib+iH91fjnS2s5AsNj/N2Of11HUwheZuHbrxbM9JXol9DsMakxSxB86PyxqTDPIJA6zBoEUoPZgkDJMRIIlAwjiUC7Y2IgEJ/bBc8thZnZoNuEQDOYq9gGHe3BjmyZiiDQGEZ0yxQ9YmQRaIiJgkCEoUsdA4E6TJHX0RAo+pcwvj2+TLIsy7Kse1n2C9LWR7iAvc9TAAAAAElFTkSuQmCC`,
        title: 'Remove this control',
        fun: this.del
    }];

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

    this.MakeContDropable = function (type) {
        if (type === "TableLayout")
            this.makeTdsDropable();
        else if (type === "TabControl")
            this.makeTabsDropable();
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
        $(".Eb-ctrlContainer").contextMenu(this.CtxMenu, { triggerOn: 'contextmenu' });
    };

    this.initCtrl = function (el) {
        this.tempArr.push(el);
        let $el = $(el);
        let type = $el.attr("ctype").trim();
        let id = type + (this.controlCounters[type + "Counter"])++;// inc counter
        id = $el.attr("ebsid") || id;
        $el.attr("tabindex", "1").attr("onclick", "event.stopPropagation();$(this).focus()");
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
                $ctrl.attr("id", id);
                $ctrl.attr("eb-type", type);
                var ctrlObj = new EbObjects["Eb" + type](id);
                this.rootContainerObj.Controls.Append(ctrlObj);

                $ctrl.focus();
                $ctrl.contextMenu(this.CtxMenu, { triggerOn: 'contextmenu' });
                ctrlObj.Label = id;
                ctrlObj.HelpText = "";
                if (ctrlObj.IsContainer)
                    this.MakeContDropable(type);
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
            let $tabMenu = $(`<li li-of="${addedObj.Name}"><a data-toggle="tab" href="#${addedObj.Name}">${addedObj.Name}</a></li>`);
            let $tabPane = $(`<div id="${addedObj.Name}" class="tab-pane fade "></div>`);
            $ctrl.find(".nav-tabs").append($tabMenu);
            $ctrl.find(".tab-content").append($tabPane);
        };

        this.RemoveTabPane = function (SelectedCtrl, prop, val, delobj) {
            let id = SelectedCtrl.EbSid;
            let $ctrl = $("#" + id);
            let $tabMenu = $ctrl.find(`[li-of=${delobj.Name}]`).remove();
            let $tabPane = $(`#${delobj.Name}`).remove();
        };

        this.PGobj.CXVE.onAddToCE = function (prop, val, addedObj) {
            console.log(prop);
            console.log(val);
            if (this.SelectedCtrl.ObjType === "TableLayout" && prop === "Controls")
                alert();
            else if (this.SelectedCtrl.ObjType === "TabControl" && prop === "Controls")
                this.addTabPane(this.SelectedCtrl, prop, val, addedObj);
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
                $.LoadingOverlay('show');
                $.ajax({
                    type: "POST",
                    url: "../DS/GetColumns",
                    data: { DataSourceRefId: PropsObj.DataSourceId },
                    success: function (Columns) {
                        PropsObj.Columns = JSON.parse(Columns);
                        this.PGobj.refresh();
                        if (PropsObj.constructor.name === "EbDynamicCardSet")
                            this.setAllChildObjColumns(PropsObj);
                        $.LoadingOverlay('hide');
                    }.bind(this)
                });
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