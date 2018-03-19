var BotFormBuilder = function (toolBoxid, formid, propGridId, builderType, Eb_objType, wc, cid, dsobj, url) {
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
    this.rootContainerObj = new EbObjects.EbBotForm(formid);
    this.PGobj = null;
    this.ssurl = url;
    
    this.controlCounters = CtrlCounters;//Global

    this.currentProperty = null;
    this.CurRowCount = 2;
    this.CurColCount = 2;
    this.movingObj = {};

    this.controlOnFocus = function (e) {
        if (e.target.id === "form-buider-form") {
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
    };

    this.InitEditModeCtrls = function (editModeObj) {
        this.rootContainerObj = editModeObj;
        setTimeout(function () {
            Proc(editModeObj, this.rootContainerObj);
            this.renderCtrls();
        }.bind(this), 1000);
    };

    this.initCtrl = function (ctrl) {
        var $el = ctrl.$Control;
        var type = $el.attr("ctype").trim();
        $el.attr("tabindex", "1").attr("onclick", "event.stopPropagation();$(this).focus()");
        $el.on("focus", this.controlOnFocus.bind(this));
        $el.attr("eb-type", type).attr("id", ctrl.EbSid);
        if (this.controlCounters[type + "Counter"] <= parseInt(ctrl.EbSid.match(/\d+$/)[0])) {
            this.controlCounters[type + "Counter"] = parseInt(ctrl.EbSid.match(/\d+$/)[0]);
            ++(this.controlCounters[type + "Counter"]);
        }
    };

    this.renderCtrls = function () {
        $.each(this.rootContainerObj.Controls.$values, function (i, ctrl) {
            $(".eb-chatBox-dev").append(ctrl.$Control);
            this.initCtrl(ctrl);
        }.bind(this));
    };

    {
        if (this.EbObject) {
            this.InitEditModeCtrls(this.EbObject);
        }
        if (this.EbObject === null) {
            this.rootContainerObj = new EbObjects.EbBotForm(formid);
            commonO.Current_obj = this.rootContainerObj;
            this.EbObject = this.rootContainerObj;
        }
    }

    this.PGobj = new Eb_PropertyGrid("pgWraper", this.wc, this.cid);
    this.curControl = null;
    this.drake = null;

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
        if (source.id === "form-buider-toolBox" && target.id === "form-buider-toolBox") {
            return false;
        }
        // allow copy except toolbox
        if (source.id === "form-buider-toolBox" && target.id !== "form-buider-toolBox") {
            return true;
        }
        // sortable with in the container
        if (source.id !== "form-buider-toolBox" && source === target) {
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
        if (source.id !== "form-buider-toolBox") {
            console.log("el poped");
            this.movingObj = this.rootContainerObj.Controls.PopByName(el.id);
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
            if (source.id === "form-buider-toolBox") {
                var $el = $(el);
                var type = $el.attr("eb-type").trim();
                var id = type + (this.controlCounters[type + "Counter"])++;
                var $ctrl = new EbObjects["Eb" + type](id).$Control;
                $el.remove();
                $ctrl.attr("tabindex", "1").attr("onclick", "event.stopPropagation();$(this).focus()");
                $ctrl.on("focus", this.controlOnFocus.bind(this));
                $ctrl.attr("id", id);
                $ctrl.attr("eb-type", type);
                var ctrlObj = new EbObjects["Eb" + type](id);
                if (sibling) {
                    $ctrl.insertBefore($(sibling));
                    this.rootContainerObj.Controls.InsertAt($(sibling).index() - 1, ctrlObj);
                }
                else {
                    $(target).append($ctrl);
                    this.rootContainerObj.Controls.Append(ctrlObj);
                }
                $ctrl.focus();

                ctrlObj.label = "";
                ctrlObj.HelpText = "";

                RefreshControl(ctrlObj);
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

    this.AfterSave = function () {

        var TblName = "r_rr"////
        if (this.validateTableName(TblName)) {
            $.ajax({
                type: "POST",
                url: this.ssurl+"/bots",
                data: {
                    TableName: this.rootContainerObj.TableName, Fields: this.getCtlName_Type()
                },
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + getToken());
                },
                success: this.ajaxsuccess.bind(this),
            });
        }
        else {
            this.Ebalert.alert({
                head: "Enter a name containing only lowercase letters or digits and starting with a lowercase letter.",
                body: "Enter a name containing only lowercase letters or digits and starting with a lowercase letter..",
                type: "danger",
                delay: 5000
            });
        }
    };

    this.getCtlName_Type = function () {
        var FieldsDTLS = new Object;
        $.each(this.rootContainerObj.Controls.$values, function (i, obj) {
            FieldsDTLS[obj.Name] = obj.Name + "_type";
        });
        return JSON.stringify(FieldsDTLS);
    };

    this.ajaxdata = function (dq) {
        dq.TableName = "table1";//////
        return dq;
    };

    this.validateTableName = function (name) {
        if (/^[a-z]/.test(name)) {// start with small letter
            if ((!/ |-/.test(name))) { //no Space or Hyphen 
                if ((/^[a-z0-9_]*$/.test(name))) { //only lowercase or number
                    return true
                }
                else
                    alert("Enter a name containing only lowercase letters or numerics as 'TableName'");
            }
            else
                alert("Should include no Space or Hyphen in the 'TableName'");
        }
        else
            alert("Make first letter lowercase letter");

        return false;
    };

    this.ajaxsuccess = function () {

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
        this.$form.on("focus", this.controlOnFocus.bind(this));
        //$('.controls-dd-cont .selectpicker').on('change', function (e) { $("#" + $(this).find("option:selected").val()).focus(); });
        this.PGobj.Close = function () {
            slideRight('.form-save-wraper', '#form-buider-propGrid');
        }
        this.PGobj.PropertyChanged = function (PropsObj, CurProp) {
            if (PropsObj && PropsObj.$type.split(",")[0].split(".")[2] !== "EbBotForm")
                RefreshControl(PropsObj);
        }.bind(this);


        this.Ebalert = new EbAlert({
            id: this.wraperId + "BFBalertCont",
            top: 24,
            right: 24,
        });
    };
    this.Init();
};