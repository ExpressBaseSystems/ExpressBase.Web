var formBuilder = function (toolBoxid, formid, propGridId, builderType, Eb_objType) {
    this.Name = formid;
    this.toolBoxid = toolBoxid;
    this.rootContainerObj = null;
    this.formid = formid;
    this.$propGrid = $("#" + propGridId);

    //if (builderType === 1)
    //    this.rootContainerObj = new EbObjects.DisplayBlockObj(formid);
    if (builderType === 0)
        this.rootContainerObj = new EbObjects.EbFormObj(formid);
    else if (builderType === 12)
        this.rootContainerObj = new EbObjects.EbFilterDialogObj(formid);
    //else if (builderType === 13)
    //    this.rootContainerObj = new EbObjects.MobileFormObj(formid);
    //else if (builderType === 14)
    //    this.rootContainerObj = new EbObjects.UserControlObj(formid);
    //else if (builderType === 3)
    //    this.rootContainerObj = new EbObjects.ReportObj(formid);

    this.curControl = null;
    this.drake = null;
    this.PGobj = null;

    // need to change
    this.controlCounters = {
        ComboBoxCounter: 0,
        NumericCounter: 0,
        DateCounter: 0,
        ButtonCounter: 0,
        TableLayoutCounter: 0,
        TextBoxCounter: 0,
        TableTdCounter: 0
    };
    this.currentProperty = null;
    this.CurRowCount = 2;
    this.CurColCount = 2;
    this.movingObj = {};

    this.save = function () {
        if ($('#save_txtBox').val().trim() === '')
            return false;
        if (this.PGobj)
            this.saveObj();
        $(".eb-loaderFixed").show();
        $.post("SaveFormBuilder", {
            "Id": null,
            "FilterDialogJson": JSON.stringify(this.rootContainerObj),
            "Name": $('#save_txtBox').val(),
            "Description": "",
            "isSave": "false",
            "VersionNumber": "1",
            "Obj_type": Eb_objType
        }, this.Save_Success.bind(this));
    };

    this.Save_Success = function (result) {
        alert("Saved");
        $(".eb-loaderFixed").hide();
        $('.alert').remove();
        $('.help').append("<div class='alert alert-success alert-dismissable'>" +
    "<a class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
    "<strong>Success!</strong>" +
    "</div>");
    };

    this.CreatePG = function (control) {
        console.log("CreatePG called for:" + control.Name);
        this.$propGrid.show().css("visibility", "visible");
        //$('#propGrid').empty();
        this.PGobj = new Eb_PropertyGrid("pgWraper", control, AllMetas["Eb" + this.curControl.attr("eb-type")]);
        this.PGobj.addControl(control.Name);
        $('.selectpicker').selectpicker('refresh');
        $('#pgWraper table td').find("input").change(this.PGinputChange.bind(this));
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

    this.controlOnFocus = function (e) {
        this.curControl = $(e.target).closest(".controlTile");
        var id = this.curControl.attr("id");
        e.stopPropagation();
        this.curControl.children('.ctrlHead').show();
        this.CreatePG(this.rootContainerObj.Controls.GetByName(id));
        this.CurColCount = $(e.target).val();
        $(".controls-dd-cont .selectpicker").selectpicker('val', id);
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

    this.onDropFn = function (el, target, source, sibling) {

        if (target) {
            //drop from toolbox to form
            if ($(source).attr("id") === "form-buider-toolBox") {
                el.className = 'controlTile';
                var ctrl = $(el);
                var type = ctrl.attr("eb-type").trim();
                var id = type + (this.controlCounters[type + "Counter"])++;
                ctrl.attr("tabindex", "1").attr("onclick", "event.stopPropagation();$(this).focus()");
                ctrl.attr("onfocusout", "$(this).children('.ctrlHead').hide()").on("focus", this.controlOnFocus.bind(this));
                ctrl.attr("id", id);
                this.rootContainerObj.Controls.Append(new EbObjects["Eb" + type + "Obj"](id));
                ctrl.html("<div class='ctrlHead'><i class='fa fa-arrows moveBtn' aria-hidden='true'></i><a href='#' class='close' style='cursor:default' data-dismiss='alert' aria-label='close' title='close'>×</a></div>"
                    + new EbObjects["Eb" + type + "Obj"](id).Html());

                ctrl.find(".close").on("click", this.controlCloseOnClick.bind(this));
                ctrl.focus();
            }
            else
                console.log("ondrop else : removed");
            this.saveObj();
        }
    };

    this.controlCloseOnClick = function (e) {
        var ControlTile = $(e.target).parent().parent();
        var id = ControlTile.attr("id");
        this.PGobj.removeControl(this.rootContainerObj.Controls.GetByName(id).Name);

        ControlTile.remove();
        this.rootContainerObj.Controls.DelByName(id);
        this.$propGrid.hide();
        e.preventDefault();
        this.saveObj();
    };

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

    this.initCtrl = function (el) {
        var $EbCtrl = $(el);
        var $ControlTile = $("<div class='controlTile' tabindex='1' onclick='event.stopPropagation();$(this).focus()'></div>");
        var type = $EbCtrl.attr("Ctype").trim();// get type from Eb-ctrlContainer html
        var id = type + (this.controlCounters[type + "Counter"])++;
        $ControlTile.attr("onfocusout", "$(this).children('.ctrlHead').hide()").on("focus", this.controlOnFocus.bind(this));
        $ControlTile.attr("eb-type", type).attr("id", id);
        $(".controls-dd-cont select").append("<option id='SelOpt" + id + "'>" + id + "</option>");//need to test
        $ControlTile.find(".close").on("click", this.controlCloseOnClick.bind(this));
        $EbCtrl.wrap($ControlTile);
        $("<div class='ctrlHead' style='display:none;'><i class='fa fa-arrows moveBtn' aria-hidden='true'></i><a href='#' class='close' style='cursor:default' data-dismiss='alert' aria-label='close' title='close'>×</a></div>").insertBefore($EbCtrl);
    };

    this.InitEditModeCtrls = function (editModeObj) {
        $(".Eb-ctrlContainer").each(function (i, el) { this.initCtrl(el); }.bind(this));
        $('.selectpicker').selectpicker('refresh');
        setTimeout(function () {
            Proc(JSON.parse(editModeObj), this.rootContainerObj);
        }.bind(this), 1000);
       
    };

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
        $("#saveformBtn").on("click", this.save.bind(this));
        $('.controls-dd-cont .selectpicker').on('change', function (e) { $("#" + $(this).find("option:selected").val()).focus(); });
    };
    this.Init();
};