var formBuilder = function (toolBoxid, formid, propGridId, builderType, Eb_objType, wc, cid, dsobj) {
    this.wc = wc;
    this.cid = cid;
    this.Name = formid;
    this.toolBoxid = toolBoxid;
    this.rootContainerObj = null;
    this.formid = formid;
    this.$propGrid = $("#" + propGridId);
    this.$form = $("#" + formid);
    this.EbObject = dsobj;
    commonO.Current_obj = this.EbObject;


   
    this.controlCounters = CtrlCounters;//Global
    this.currentProperty = null;
    this.CurRowCount = 2;
    this.CurColCount = 2;
    this.movingObj = {};
    
    this.controlOnFocus = function (e) {
        if (e.target.id ==="form-buider-form") {
            this.curControl = $(e.target);
            this.CreatePG(this.rootContainerObj);
            return;
        }
        else
            this.curControl = $(e.target).closest(".Eb-ctrlContainer");
        var id = this.curControl.attr("id");
        e.stopPropagation();
        this.curControl.children('.ctrlHead').show();
        this.CreatePG(this.rootContainerObj.Controls.GetByName(id));
        this.CurColCount = $(e.target).val();
        //  this.PGobj.ReadOnly();
    };

    this.InitEditModeCtrls = function (editModeObj) {
        this.rootContainerObj = editModeObj;
        $(".Eb-ctrlContainer").each(function (i, el) {
            this.initCtrl(el);
        }.bind(this));
        setTimeout(function () {
            Proc(editModeObj, this.rootContainerObj);
        }.bind(this), 1000);
    };

    this.initCtrl = function (el) {
        var $el = $(el);
        var type = $el.attr("ctype").trim();
        var id = type + (this.controlCounters[type + "Counter"])++;
        $el.attr("tabindex", "1").attr("onclick", "event.stopPropagation();$(this).focus()");
        $el.on("focus", this.controlOnFocus.bind(this));
        $el.attr("eb-type", type);
        $el.attr("eb-type", type).attr("id", id);
    };

    //Edit mode
    if (this.EbObject){
        this.InitEditModeCtrls(this.EbObject);
    }
    if (this.EbObject === null) {
        if (builderType === 0)
            this.rootContainerObj = new EbObjects.EbWebForm(formid);
        else if (builderType === 12)
            this.rootContainerObj = new EbObjects.EbFilterDialog(formid);
        commonO.Current_obj = this.rootContainerObj;
        this.EbObject = this.rootContainerObj;
    }
    //if (builderType === 1)
    //    this.rootContainerObj = new EbObjects.DisplayBlockObj(formid);
    if (builderType === 0)
        this.rootContainerObj = new EbObjects.EbWebForm(formid);
    //else if (builderType === 12)
    //    this.rootContainerObj = new EbObjects.EbFilterDialog(formid);
    //else if (builderType === 13)
    //    this.rootContainerObj = new EbObjects.MobileFormObj(formid);
    //else if (builderType === 14)
    //    this.rootContainerObj = new EbObjects.UserControlObj(formid);
    //else if (builderType === 3)
    //    this.rootContainerObj = new EbObjects.ReportObj(formid);

    this.PGobj = new Eb_PropertyGrid("pgWraper", this.wc, this.cid);
    this.curControl = null;
    this.drake = null;

    //this.$form.on("focus", function (e) { this.PGobj.setObject(this.rootContainerObj, AllMetas["Eb" + $(e.target).attr("eb-type")]); }.bind(this));


    //this.save = function () {
    //    if (this.rootContainerObj.Name.trim() === '') {
    //        alert("Enter a Name");
    //        return false;
    //    }
    //    if (this.PGobj)
    //        this.saveObj();
    //    $(".eb-loaderFixed").show();
    //    $.post("../Eb_Object/CommitEbObject", {
    //        "_refid": this._refid,
    //        "_json": JSON.stringify(this.rootContainerObj),
    //        "_rel_obj": "_rel_obj1",
    //        "_tags": "tag1"
    //    }, this.Save_Success.bind(this));
    //};
    //this.commit = function () {
    //    if (this.rootContainerObj.Name.trim() === '') {
    //        alert("Enter a Name");
    //        return false;
    //    }
    //    if (this.PGobj)
    //        this.saveObj();
    //    $(".eb-loaderFixed").show();
    //    $.post("../Eb_Object/SaveEbObject", {
    //        "_refid": this._refid,
    //        "_json": JSON.stringify(this.rootContainerObj),
    //        "_rel_obj": "aaa",
    //        "_tags": "aaaa"
    //    }, this.Save_Success.bind(this));
    //};
    //this.Save_Success = function (result) {
    //    alert("Saved");
    //    $(".eb-loaderFixed").hide();
    //    $('.alert').remove();
    //    $('.help').append("<div class='alert alert-success alert-dismissable'>" +
    //        "<a class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
    //        "<strong>Success!</strong>" +
    //        "</div>");
    //};

    this.CreatePG = function (control) {
        console.log("CreatePG called for:" + control.Name);
        this.$propGrid.css("visibility", "visible");
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
        this.makeTdsDropable();
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

    this.makeTdsDropable = function () {
        $.each($(".tdDropable"), this.tdIterFn.bind(this));
    };

    this.tdIterFn = function (i) {
        if (this.drake) {
            if (!this.drake.containers.contains(document.getElementsByClassName("tdDropable")[i])) {
                this.drake.containers.push(document.getElementsByClassName("tdDropable")[i]);
            }
        }
    };

    this.onDragFn = function (el, source) {
        //if drag start within the form
        if ($(source).attr("id") !== "form-buider-toolBox") {
            console.log("el poped");
            this.movingObj = this.rootContainerObj.Controls.PopByName($(el).attr("id"));
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
                this.rootContainerObj.Controls.Append(new EbObjects["Eb" + type](id));

                $ctrl.focus();
            }
            else
                console.log("ondrop else : removed");
            this.saveObj();
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

    

    this.Init = function () {
        this.drake = new dragula([document.getElementById(this.toolBoxid), document.getElementById(this.formid)], {
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
        this.PGobj.Close = function () {
            slideRight('.form-save-wraper', '#form-buider-propGrid');
        }
        this.PGobj.PropertyChanged = function (PropsObj, CurProp) {
            RefreshControl(PropsObj);
            console.log("PropsObj: " + JSON.stringify(PropsObj));
            console.log("CurProp: " + CurProp);
        }.bind(this);
    };
    this.Init();
};