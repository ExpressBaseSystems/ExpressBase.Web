
var WhereBuilder = function (Queryobj) {
    this.QueryObj = Queryobj;
    this.tbName = [];
    this.dragableArray = [];
    this.DesignPane = $(".DesignPane");
    this.SortPane = $(".SortPane");
    this.ConditionPane = $(".ConditionPane");
    this.QueryPane = $(".QueryPane");
    this.bodyid = {};
    this.IdCounters = {
        TableCount: 0
    };
    this.saveFormatString = "";
    this.count = 0;
    this.columnName = [];
    this.drawTree = false;
    this.drake = null;
    this.date = ["=", "!=", "BETWEEN"];
    this.integer = ["=", ">", "<=", ">=", "<", "!=", "BETWEEN"];
    this.text = ["=", "!=", "Like"];
    this.boolean = ["=", "=!"];
    this.time = ["=", "=!", "BETWEEN"];
    this.groupCounter = 0;
    this.arraycol = [];
    this.ConditionPane = $(".conditiong-gp-container");
    this.where_cond_grp = $(".where_cond_grp");
    this.movingItem = null;
    this.movingGrp = null;
    this.subtreeName = {};

    this.condFlatObj = {};

    this.ConditionGroup = function () {   //Constructor
        this.id = null;
        this.operator = "";
        this.locId = "";
        this.objids = "";
        this.grpBtnid = "";
        this.ConditionGroup_Coll = [];
        this.Condition_Coll = [];
    };

    this.Condition = function () {  //Constructor
        this.id = null;
        this.condTabName = "";
        this.CName = "";
        this.dropLocId = "";
        this.CNmType = "";
        this.Operator = "";
        this.Value = " ";
        this.valueSec = "";
        this.editNormalTextId = "";
        this.normalTextIdSec = "";
        this.editSelectId = "";
        this.boolTextId = "";
        this.boolTextIdSec = "";
    };

    this.WHEREclouseQ = new this.ConditionGroup();

    this.makeDroppable = function ($storeTableNames) {
        this.storedNames = $storeTableNames;
        if (this.drake === null) {
            this.drake = new dragula([document.getElementById("firstBody")], {
                copy: function (el, source) {
                    return (el.className === 'col-draggable');
                },
                accepts: this.acceptFn.bind(this)
            });

            this.drake.on("drop", this.tableOnDrop.bind(this));
            this.drake.on("drag", this.tableOnDrag.bind(this));
        }
        for (var key in this.storedNames) {
            var tblName = this.storedNames[key];
            this.drake.containers.push(document.getElementById("treeview_" + tblName));
        }
    };

    this.acceptFn = function (el, target, source, sibling) {

        if ($(target).attr("class") === "cols-cont")
            return false;
        else
            return true;
    };

    this.tableOnDrag = function (el, source) {
        this.subtreeName = $(source).parent().attr("tname")
    };

    this.tableOnDrop = function (el, target, source, sibling) {
        var targetId = $(target).attr("id");
        var sourceId = $(source).attr("id");
        if (sourceId === "treeview_" + this.subtreeName) {
            this.droploc = $(target);
            this.droploc_id = $(target).attr("id");
            this.columnName = $(el).attr("colname");
            this.onDropTabName = $(source).parent().attr("tname");
            this.datatype = $(el).attr("datatype");
            $(el).remove();
            this.oncond();

        }
        else if (false) {
            var dropobj_id = $(el).children(".conditiong-gp-container-body").attr("id");
            this.popCollGrpRec(this.WHEREclouseQ, sourceId, dropobj_id);
            this.pushCollGrpRec(this.WHEREclouseQ, targetId, dropobj_id)

        }

        else if (true) {
            var dropobj_id = $(el).attr("id");
            this.popCollCondRec(this.WHEREclouseQ, sourceId, dropobj_id);
            this.pushCollCondRec(this.WHEREclouseQ, targetId, dropobj_id)
        }
    };

    this.popCollGrpRec = function (condGrp, source, dropObjid) {
        if (condGrp.id === source) {
            for (i = 0; i < condGrp.ConditionGroup_Coll.length; i++) {
                if (condGrp.ConditionGroup_Coll[i]["id"] === dropObjid) {
                    this.movingGrp = condGrp.ConditionGroup_Coll[i];
                    condGrp.ConditionGroup_Coll.splice(i, 1);
                }
            }
        }
        else {
            if (condGrp.hasOwnProperty('ConditionGroup_Coll')) {
                for (var k = 0; k < condGrp.ConditionGroup_Coll.length; k++)
                    this.popCollGrpRec(condGrp.ConditionGroup_Coll[k], source, dropObjid)
            }
        }
    };

    this.pushCollGrpRec = function (condGrp, destinatn, dropObjid) {
        if (condGrp.id === destinatn)
            condGrp.ConditionGroup_Coll.push(this.movingGrp)
        else {
            if (condGrp.hasOwnProperty('ConditionGroup_Coll')) {
                for (var k = 0; k < condGrp.ConditionGroup_Coll.length; k++)
                    this.pushCollGrpRec(condGrp.ConditionGroup_Coll[k], destinatn, dropObjid)
            }
        }
    };

    this.pushCollCondRec = function (condGrp, destinatn, dropObjid) {
        if (condGrp.id === destinatn) {
            this.movingItem.dropLocId = condGrp.id;
            condGrp.Condition_Coll.push(this.movingItem)
        }
        else {
            if (condGrp.hasOwnProperty('ConditionGroup_Coll')) {
                for (var k = 0; k < condGrp.ConditionGroup_Coll.length; k++)
                    this.pushCollCondRec(condGrp.ConditionGroup_Coll[k], destinatn, dropObjid)
            }
        }
    };

    this.popCollCondRec = function (condGrp, source, dropObjid) {
        if (condGrp.id === source) {
            for (i = 0; i < condGrp.Condition_Coll.length; i++) {
                if (condGrp.Condition_Coll[i].id === dropObjid) {
                    this.movingItem = condGrp.Condition_Coll[i];
                    condGrp.Condition_Coll.splice(i, 1);
                }
            }
        }
        else {
            if (condGrp.hasOwnProperty('ConditionGroup_Coll')) {
                for (var k = 0; k < condGrp.ConditionGroup_Coll.length; k++)
                    this.popCollCondRec(condGrp.ConditionGroup_Coll[k], source, dropObjid)
            }
        }
    };

    this.addGroupCondition = function (e) {
        var appendloc = $(e.target).parents(1).siblings(".conditiong-gp-container-body");
        this.locid = $(e.target).parents(1).siblings(".conditiong-gp-container-body").attr("id");
        this.appendGroupCondition(appendloc);
    };

    this.appendGroupCondition = function (appendloc, objid, bodyid, grpBtnid) {
        this.groupCounter++;
        if (objid === undefined || objid === null) {
            objid = "groupCondition" + this.groupCounter;
            this.bodyid = "groupBody" + this.groupCounter;
            var grpBtnid = "grpBtnId" + this.groupCounter;
        }
        else
            this.bodyid = bodyid;
        appendloc.append(`<div class="groupBox"  id= "${objid}" >
                            <div class=" conditiong-gp-container-header form-inline">
                                <div class="btn-group btn-toggle where-toggle" id="${grpBtnid}">
                                    <button class="btn btn-sm btn-default grpAndOrBtn" value="AND">AND</button>
                                    <button class="btn btn-sm btn-default grpAndOrBtn active" value="OR">OR</button>
                                </div>
                            <div class="btn-group where-btns">
                                 <button type="button" class="btn btn-xs btn-success where-btn2 addGroup"><i class="glyphicon glyphicon-plus-sign"></i>Group</button>
                                 <button type="button" class="btn btn-xs btn-danger groupRemove" data-delete="group"><i class="glyphicon glyphicon-remove"></i> Delete</button>
                                </div>
                        </div>
                        <div class="m-l-35 conditiong-gp-container-body" id="${this.bodyid}">
                        </div>`);

        this.cg = new this.ConditionGroup();// new box object created
        this.cg.id = this.bodyid;         //add id into box
        this.cg.operator = "OR";
        this.cg.locId = this.locid;
        this.cg.grpBtnid = grpBtnid;
        this.cg.objids = objid;
        if (this.locid == "firstBody") {
            this.WHEREclouseQ.ConditionGroup_Coll.push(this.cg);
        }
        else {
            this.recCondGrp(this.WHEREclouseQ.ConditionGroup_Coll);
        }
        $("#" + objid + " .addGroup").on("click", this.addGroupCondition.bind(this));

        if (this.drake.containers.indexOf(this.bodyid === -1))
            this.drake.containers.push(document.getElementById(this.bodyid));
    };

    this.recCondGrp = function (Coll) {
        for (var i = 0; i < Coll.length; i++) {
            if (this.locid === Coll[i]['id']) {
                Coll[i].ConditionGroup_Coll.push(this.cg); // push condition into condition collection
                return false;
            }
            else
                this.recCondGrp(Coll[i].ConditionGroup_Coll);
        }
    };

    this.grpRemoveFn = function (event) {
        var $el = $(event.target).closest(".btn");
        var source = $el.parent().parent().siblings().attr("id");
        $("#" + $el.parent().parent().parent().attr("id")).remove();
        this.recGrpRemoveFn(this.WHEREclouseQ, source);
    };

    this.recGrpRemoveFn = function (condGrp, source) {
        if (condGrp.hasOwnProperty('ConditionGroup_Coll')) {
            for (var k = 0; k < condGrp.ConditionGroup_Coll.length; k++) {
                if (source === condGrp.ConditionGroup_Coll[k]["id"])
                    condGrp.ConditionGroup_Coll.splice(k, 1);
                else
                    this.recGrpRemoveFn(condGrp.ConditionGroup_Coll[k], source)
            }
        }
    };

    this.grpAndOrBtnFn = function (event) {
        var Opr = $(event.target).val();
        var parentBox = $(event.target).parent().parent().siblings().attr("id");
        $(event.target).addClass('active');
        $(event.target).siblings().removeClass('active');
        if (parentBox === "firstBody") {
            this.WHEREclouseQ.operator = Opr;
        }
        else {
            this.recgrpAndOrBtnFn(this.WHEREclouseQ.ConditionGroup_Coll, parentBox, Opr);

        }
    };

    this.recgrpAndOrBtnFn = function (coll, parentBox, Opr) {

        for (var i = 0; i < coll.length; i++) {
            if (parentBox === coll[i]['id']) {
                coll[i].operator = Opr;
                return false;

            }
            else
                this.recgrpAndOrBtnFn(coll[i].ConditionGroup_Coll, parentBox, Opr)
        }
    };

    this.oncond = function (condId, normalTextId, normalSelectId, boolTextId, boolTextIdSec, editOperator, values, valueSec, normalTextIdSec) {
        this.IdCounters["TableCount"]++
        if (normalSelectId === undefined || normalSelectId === null) {
            this.condId = this.columnName + this.IdCounters["TableCount"];
            var normalTextId = "normalTextId" + this.IdCounters["TableCount"];
            var normalSelectId = "normalSelectId" + this.IdCounters["TableCount"];
            var normalTextIdSec = "normalTextIdSec" + this.IdCounters["TableCount"];
            var boolTextId = "boolTextId" + this.IdCounters["TableCount"];
            var boolTextIdSec = "boolTextIdSec" + this.IdCounters["TableCount"];
        }
        else
            this.condId = condId;

        this.droploc.append(`<div class="droped form-inline" id="${this.condId}">
                                <div class="d-inline columnName" dataType = "${this.datatype}">${this.columnName}</div>
                                <select flatObjId="${this.condId}" class="form-control d-inline clr selectOptr" id=${normalSelectId} ></select>
                                <button class="btn btn-default pull-right conditionEdit clr"  style="display:none;"><i class="fa fa-edit fa-lg"></i></button>
                                <button flatObjId="${this.condId}" class="btn btn-default pull-right conditionCheck clr"><i class="fa fa-check fa-lg"></i></button>
                                <button class="btn btn-default pull-right conditionRemove clr"><i class="fa fa-close fa-lg"></i></button>
                              </div>`);
        this.cond = new this.Condition(); //new condition created
        this.datatype_check(this.condId, normalTextId, boolTextId, normalTextIdSec, boolTextIdSec);

        //if (!this.QueryObj.isNew) {
        //    $("#" + this.normalTextId).val(this.values);
        //    $("#" + this.normalSelectId+ "option:selected").val(this.editOperator);
        //    this.cond.Value = $("#" + this.normalTextId).val();
        //}
        this.cond.id = this.condId;
        this.cond.CNmType = this.datatype;
        this.cond.condTabName = this.onDropTabName;
        this.cond.CName = this.columnName;
        this.cond.dropLocId = this.droploc_id;
        this.cond.editNormalTextId = normalTextId;
        this.cond.normalTextIdSec = normalTextIdSec;
        this.cond.editSelectId = normalSelectId;
        this.cond.boolTextId = boolTextId;
        this.cond.boolTextIdSec = boolTextIdSec;

        $("#" + normalSelectId + " option[value= '" + editOperator + "']").attr("selected", true)
        $("#" + boolTextId + " option[value= '" + editOperator + "']").attr("selected", true)
        this.cond.Operator = $("#" + normalSelectId).find("option:selected").text()
        if (editOperator === "BETWEEN") {
            $("#" + normalTextIdSec).show();
            $("#" + normalTextIdSec).val(valueSec);
            $("#" + boolTextIdSec).val(valueSec);
            this.cond.valueSec = valueSec || "";
        }
        $("#" + normalTextId).val(values);
        $("#" + boolTextId).val(values);
        this.cond.Value = values || "";
        this.condFlatObj[this.condId] = this.cond;

        if (this.droploc_id === "firstBody")
            this.WHEREclouseQ.Condition_Coll.push(this.cond);
        else
            this.recCond(this.WHEREclouseQ.ConditionGroup_Coll);
    };

    this.datatype_check = function ($container, normalTextId, boolTextId, normalTextIdSec, boolTextIdSec) {
        if (this.datatype === "text") {
            $("#" + this.condId + " select").after(` <input type="text" flatObjId="${this.condId}" class="form-control clr d-inline keypressEventText"  id = "${normalTextId}">`);
            this.loopcheck(this.text, $container);
        }
        else if (this.datatype === "integer") {
            $("#" + this.condId + " select").after(`<input type="text" flatObjId="${this.condId}" data-identity = "firstTextBox" class="form-control clr d-inline keypressEventText"  id = "${normalTextId}"><input type="text" flatObjId="${this.condId}"  data-identity = "secTextBox" class="form-control clr betweenText betweenInt"  id = "${normalTextIdSec}" style ="display:none">`);
            this.loopcheck(this.integer, $container);

        }
        else if (this.datatype === "date") {
            $("#" + this.condId + " select").after(` <input type="date" flatObjId="${this.condId}" data-identity = "firstTextBox" class="form-control clr d-inline changeEventTextFn"  id = "${boolTextId}"/><input type="date" flatObjId="${this.condId}" class="form-control clr betweenText betweenDateTime"  id = "${boolTextIdSec}" style ="display:none"/>`)
            this.loopcheck(this.date, $container);
        }
        else if (this.datatype === "boolean") {
            $("#" + this.condId + " select").after(` <input type="text" flatObjId="${this.condId}" class="form-control clr d-inline changeEventTextFn"  id = "${boolTextId}">`)
            this.loopcheck(this.boolean, $container);
        }
        else if (this.datatype === "time") {
            $("#" + this.condId + " select").after(` <input type="time" flatObjId="${this.condId}"  data-identity = "firstTextBox" class="form-control clr d-inline changeEventTextFn"  id = "${boolTextId}"/> <input type="time" flatObjId="${this.condId}" class="form-control clr betweenText betweenDateTime"  id = "${boolTextIdSec}" style ="display:none"/>`)
            this.loopcheck(this.time, $container);
        }
    };

    this.loopcheck = function (arr, $container) {
        for (i = 0; i < arr.length; i++) {
            $("#" + $container + " select").append(`<option tabindex="1" value="${arr[i]}">${arr[i]}</option>`);
        }

    };

    this.recCond = function (coll) {
        for (var i = 0; i < coll.length; i++) {
            if (this.droploc_id === coll[i]['id']) {
                coll[i].Condition_Coll.push(this.cond); // push condition into condition collection
                return false;
            }
            else
                this.recCond(coll[i].ConditionGroup_Coll);
        }
    };

    this.condCheckFn = function (event) {
        var colName;
        var optr;
        var text;
        var textBw
        var $el = $(event.target).closest(".btn");
        droploc = $(event.target).closest(".btn").parent();

        var condObjId = $el.attr("flatobjid");
        for (let key in this.condFlatObj) {
            if (condObjId === key) {
                colName = this.condFlatObj[key].CName;
                optr = this.condFlatObj[key].Operator;
                if (optr === "BETWEEN") {
                    textBw = this.condFlatObj[key].valueSec;
                    text = this.condFlatObj[key].Value;
                }
                else
                    text = this.condFlatObj[key].Value;
            }
        }
        if (optr === "BETWEEN")
            var string = colName + " " + optr + " " + text + " " + "AND" + " " + textBw;
        else
            var string = colName + " " + optr + " " + text;
        $el.siblings(".d-inline").hide()
        $el.siblings(".betweenText").hide();
        $el.hide()
        $el.siblings(".conditionEdit").show()
        droploc.prepend(`<label class="checkText">${string}</label>`);
    };

    this.condEditFn = function (event) {
        var $el = $(event.target).closest(".btn");
        $el.hide();
        $el.siblings(".checkText").hide();
        $el.siblings(".conditionCheck").show();
        if ($el.siblings(".selectOptr").val() === "BETWEEN") {
            $el.siblings(".d-inline").show();
            $el.siblings(".betweenText").show();
        }
        else
            $el.siblings(".d-inline").show();
    };

    this.keypressEventTextFn = function (event) {
        var condDataType = $(event.target).siblings(".columnName").attr("dataType");
        var charCode = event.which;
        if (condDataType === "text") {
            if ((charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123) || (charCode === 37) || (charCode === 95)) {
                return true;
            }
            else {
                return false;
            }
        }
        else if (condDataType == "integer") {
            if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                return false;
            }
            else {
                return true;
            }
        }

    };

    this.changeEventTextFn = function (event) {
        var con = $(event.target).val().trim();
        var $el = $(event.target);
        var id = $el.attr("id");
        var condDataType = $el.siblings(".columnName").attr("dataType");
        var condObjId = $el.attr("flatObjId");
        if (condDataType == "boolean") {
            if (con == "y" || con == "Y" || con == "f" || con == "F" || con == "yes" || con == "no" || con == "YES" || con == "NO" || con == "true" || con == "false" || con == "TRUE" || con == "FALSE" || con == "T" || con == "F" || con == "False" || con == "True" || con == "Yes" || con == "No") {
                for (let key in this.condFlatObj) {
                    if (condObjId === key) {
                        this.condFlatObj[key].Value = con;
                    }
                }
            }
            else {
                $el.val("");
                for (let key in this.condFlatObj) {
                    if (condObjId === key) {
                        this.condFlatObj[key].Value = "";
                    }
                }
            }
        }
        else if (condDataType == "date") {
            for (let key in this.condFlatObj) {
                if (condObjId === key) {
                    if (this.condFlatObj[key].Operator === "BETWEEN") {
                        if ($el.attr("data-identity") === "firstTextBox")
                            this.condFlatObj[key].Value = con;
                        else
                            this.condFlatObj[key].valueSec = con;
                    }
                    else
                        this.condFlatObj[key].Value = con;
                }
            }
        }
        else if (condDataType === "time") {
            for (let key in this.condFlatObj) {
                if (condObjId === key) {
                    if (this.condFlatObj[key].Operator === "BETWEEN") {
                        if ($el.attr("data-identity") === "firstTextBox")
                            this.condFlatObj[key].Value = con;
                        else
                            this.condFlatObj[key].valueSec = con;
                    }
                    else
                        this.condFlatObj[key].Value = con;
                }
            }
        }
    };

    this.condSelectOptrFn = function (event) {
        var optionSelected = $(event.target).find("option:selected");
        var optionText = optionSelected.text();
        var $el = $(event.target);

        var condObjId = $el.attr("flatobjid");
        for (let key in this.condFlatObj) {
            if (condObjId === key) {
                this.condFlatObj[key].Operator = optionText;
                if (this.condFlatObj[key].Operator === "BETWEEN")
                    $el.next().next().show();
                else
                    $el.next().next().hide();
            }
        }
    };

    this.condRemoveFn = function (event) {
        var $el = $(event.target).closest(".btn");
        var dropObjid = $el.parent().attr("id");
        var source = $el.parent().parent().attr("id");
        $("#" + $el.parent().attr("id")).remove();
        this.popCollCondRec(this.WHEREclouseQ, source, dropObjid);
    };

    this.createQueryForCondGroup = function (condGrp) {
        if (condGrp.Condition_Coll.length > 0) {
            //((condGrp.Condition_Coll[0]["Operator"] === "BETWEEN") ? condGrp.Condition_Coll[0]["Value"] + "AND" + condGrp.Condition_Coll[0]["valueSec"] : condGrp.Condition_Coll[0]["Value"])
            var cname = condGrp.Condition_Coll[0]["CName"];
            var optr = condGrp.Condition_Coll[0]["Operator"];
            var dataType = condGrp.Condition_Coll[0]["CNmType"];
            var values = condGrp.Condition_Coll[0]["Value"];
            var valueSec = condGrp.Condition_Coll[0]["valueSec"];
            var queryString = "((" + cname + " " + optr + " " + ((dataType === "text" || dataType === "date" || dataType === "time") ? ((optr === "BETWEEN") ? "'" + values + "' AND '" + valueSec + "'" : "'" + values + "'") : ((optr === "BETWEEN") ? values + " AND " + valueSec : values)) + ") ";
            for (i = 1; i < condGrp.Condition_Coll.length; i++) {
                var cName = condGrp.Condition_Coll[i]["CName"];
                var Optr = condGrp.Condition_Coll[i]["Operator"];
                var DataType = condGrp.Condition_Coll[i]["CNmType"];
                var Values = condGrp.Condition_Coll[i]["Value"];
                var ValueSec = condGrp.Condition_Coll[i]["valueSec"];
                queryString += condGrp.operator + " (" + cName + " " + Optr + " " + ((DataType === "text" || DataType === "date" || DataType === "time") ? ((Optr === "BETWEEN") ? "'" + Values + "' AND '" + ValueSec + "'" : "'" + Values + "'") : ((Optr === "BETWEEN") ? Values + " AND " + ValueSec : Values)) + ") ";
                //queryString += ")";
            }
            return queryString;
        }
        return "";
    };

    this.recFinalQueryFn = function (condGrp) {
        var fString = this.createQueryForCondGroup(condGrp);

        if (condGrp.ConditionGroup_Coll.length > 0) {
            for (var k = 0; k < condGrp.ConditionGroup_Coll.length; k++) {
                fString += ((fString.length === 0) ? "" : condGrp.operator) + " " + this.recFinalQueryFn(condGrp.ConditionGroup_Coll[k]) + ") ";
            }
        }
        return fString;
    };

    this.designPaneFn = function () {
        $(".treeviewDragula").hide();
        $("#tables-cont").show();
    };

    this.renderWhereCondOnEdit = function (editCond) {
        var grpBtnidM = editCond.grpBtnid;
        var grpAndOrOptrM = editCond.operator;
        $("body").on("click", "#" + grpBtnidM, this.grpAndOrBtnFn.bind(this, grpAndOrOptrM));
        $("#" + grpBtnidM).children('[value=' + grpAndOrOptrM + ']').click();
        if (editCond.hasOwnProperty('Condition_Coll')) {
            for (var i = 0; i < editCond.Condition_Coll.length; i++) {
                this.droploc_id = editCond.Condition_Coll[i].dropLocId;
                this.droploc = $("#" + this.droploc_id);
                this.columnName = editCond.Condition_Coll[i].CName;
                this.onDropTabName = editCond.Condition_Coll[i].condTabName;
                this.datatype = editCond.Condition_Coll[i].CNmType;
                var editOperator = editCond.Condition_Coll[i].Operator;
                var values = editCond.Condition_Coll[i].Value;
                if (editOperator === "BETWEEN")
                    var valueSec = editCond.Condition_Coll[i].valueSec;
                var condId = editCond.Condition_Coll[i].id;
                var normalTextId = editCond.Condition_Coll[i].editNormalTextId;
                var normalTextIdSec = editCond.Condition_Coll[i].normalTextIdSec;
                var normalSelectId = editCond.Condition_Coll[i].editSelectId;
                var boolTextIdSec = editCond.Condition_Coll[i].boolTextIdSec;
                var boolTextId = editCond.Condition_Coll[i].boolTextId;
                this.oncond(condId, normalTextId, normalSelectId, boolTextId, boolTextIdSec, editOperator, values, valueSec, normalTextIdSec);
            }

        }
        if (editCond.hasOwnProperty('ConditionGroup_Coll')) {
            for (var k = 0; k < editCond.ConditionGroup_Coll.length; k++) {
                this.locid = editCond.ConditionGroup_Coll[k].locId;
                var objid = editCond.ConditionGroup_Coll[k].objids;
                var bodyid = editCond.ConditionGroup_Coll[k].id;
                var grpAndOrOptr = editCond.ConditionGroup_Coll[k].operator;
                var grpBtnid = editCond.ConditionGroup_Coll[k].grpBtnid;
                var appendDroploc = $("#" + this.locid);
                this.appendGroupCondition(appendDroploc, objid, bodyid, grpBtnid);
                $("body").on("click", "#" + grpBtnid, this.grpAndOrBtnFn.bind(this, grpAndOrOptr));
                $("#" + grpBtnid).children('[value=' + grpAndOrOptr + ']').click();
                if (editCond.ConditionGroup_Coll[k].hasOwnProperty('ConditionGroup_Coll'))
                    this.renderWhereCondOnEdit(editCond.ConditionGroup_Coll[k]);
            }
        }


    };

    this.init = function () {
        this.makeDroppable();
        $(".conditiong-gp-container .addGroup").off("click").on("click", this.addGroupCondition.bind(this));
        this.WHEREclouseQ.id = "firstBody";//add id into box
        this.WHEREclouseQ.operator = "OR";
        this.WHEREclouseQ.grpBtnid = "grpBtnId00";
        //this.queryDisplayObj = new QueryBuilder();
        $("body").on("click", ".conditionRemove", this.condRemoveFn.bind(this));
        $("body").on("click", ".groupRemove", this.grpRemoveFn.bind(this));
        $("body").on("click", ".conditionCheck", this.condCheckFn.bind(this));
        $("body").on("click", ".conditionEdit", this.condEditFn.bind(this));
        $("body").on("click", ".grpAndOrBtn", this.grpAndOrBtnFn.bind(this));
        $("body").on("keypress", ".keypressEventText,.betweenInt", this.keypressEventTextFn.bind(this));
        $("body").on("change", ".changeEventTextFn,.betweenDateTime", this.changeEventTextFn.bind(this));
        $("body").on("change", ".selectOptr", this.condSelectOptrFn.bind(this));
        $("a[href='#Design']").on("click", this.designPaneFn.bind(this));
        if (this.QueryObj.isNew) {
        }
        else {
            this.renderWhereCondOnEdit(this.QueryObj.ObjectSchema.Conditions);
            //$("body").on("click", ".saveQuery", this.QueryObj.finalQueryFn.bind(this));
            //$(".saveQuery").click();
        }
    };

    this.init();
};









