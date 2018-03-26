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
    this.clipboard = {};

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
                $ctrl.contextMenu(this.CtxMenu, { triggerOn: 'contextmenu' });
                ctrlObj.label = "";
                ctrlObj.HelpText = "";

                RefreshControl(ctrlObj);
            }
            else
                console.log("ondrop else : removed");
            this.saveObj();
        }
    };

    this.del = function (ce) {
        var $e = $(ce.trigger.context);
        var id = $e.attr("id");
        this.DelCtrl(id);
    }.bind(this);

    this.cut = function (ce) {
        var $e = $(ce.trigger.context);
        var id = $e.attr("id");
        this.clipboard.$ctrl = $(`#${id}`)
        this.clipboard.ctrl = this.DelCtrl(id);
    }.bind(this);

    this.paste = function (ce) {
        var $e = $(ce.trigger.context);
        var id = $e.attr("id");
        var idx = $e.index() + 1;

        this.clipboard.$ctrl.insertAfter($e);
        $e.on("focus", this.controlOnFocus.bind(this));
        this.clipboard.$ctrl.contextMenu(this.CtxMenu, { triggerOn: 'contextmenu' });
        this.rootContainerObj.Controls.InsertAt(idx, this.clipboard.ctrl);
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

    this.AfterSave = function (TblName) {
        if (this.validateTableName(TblName)) {
            $.ajax({
                type: "POST",
                url: this.ssurl + "/bots",
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
            this.PGobj.Ebalert.alert({
                head: "Name Not in a valid format,",
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
                    this.nameAlert("Enter a name containing only lowercase letters or numerics as 'TableName'");
            }
            else
                this.nameAlert("Should include no Space or Hyphen in the 'TableName'");
        }
        else 
            this.nameAlert("Make first letter lowercase letter");

        return false;
    };

    this.nameAlert = function (body) {
        this.PGobj.Ebalert.alert({
            head: "Name Not in a valid format.",
            body: body,
            type: "danger",
        });
    }.bind(this);

    this.PGobj.nameChanged = function (propsObj) {
        if (propsObj.EbSid === "form-buider-form")
            this.validateTableName(this.rootContainerObj.Name);
    }.bind(this);

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

    this.GenerateButtons = function () { };

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
        };

        this.PGobj.PropertyChanged = function (PropsObj, CurProp) {
            if (CurProp === 'DataSourceId') {
                $.LoadingOverlay('show');
                $.ajax({
                    type: "POST",
                    url: "../DS/GetColumns",
                    data: { DataSourceRefId: PropsObj.DataSourceId },
                    success: function (Columns) {
                        PropsObj.Columns = JSON.parse(Columns);
                        $.LoadingOverlay('hide');
                    }.bind(this)
                });
            }
            if (PropsObj && PropsObj.$type.split(",")[0].split(".")[2] !== "EbBotForm") {
                RefreshControl(PropsObj);
            }
            if (PropsObj.Name.substr(0, PropsObj.Name.length - 1) === 'ComboBox') {
                this.refreshCombo(PropsObj.Name, PropsObj, CurProp);
            }
            //if (CurProp === 'CardCollection')
            //    this.RefreshCardColl(PropsObj);
        }.bind(this);


        this.PGobj.Ebalert = new EbAlert({
            id: this.wraperId + "BFBalertCont",
            top: 24,
            right: 24,
        });

    }.bind(this);


    //this.RefreshCardColl = function (PropsObj) {
    //    var crd = PropsObj.CardCollection.$values;
    //    for (i = 0; i < crd.length; i++) {
    //        RefreshControl(crd[i]);
    //    }
    //};

    this.refreshCombo = function (cmbid, PropsObj, CurProp) {
        //if (CurProp === 'DisplayMembers')
        {
            var count = (PropsObj.DisplayMembers.$values.length === 0) ? 1 : PropsObj.DisplayMembers.$values.length;
            var $combowrap = $("#" + cmbid).find(".combo-wrap");
            var perwidth = (100 / count);
            $($combowrap.children()[0]).css("width", (perwidth + "%"));
            var divhtml = $($combowrap.children()[0]).outerHTML();
            $combowrap.empty();
            for (var i = 0; i < count; i++) {
                $combowrap.append(divhtml);
            }
        }
    }
    jQuery.fn.outerHTML = function () {
        return jQuery('<div />').append(this.eq(0).clone()).html();
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
    this.Init();
};