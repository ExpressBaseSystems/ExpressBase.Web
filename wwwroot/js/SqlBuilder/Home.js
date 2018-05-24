
var join = function (l, r, act) {
    this.leftnode = l;
    this.rightnode = r;
    this.activity = act;
}

var QueryBuilder = function (object, editobject) {
    this.tbName = [];
    // this.drawTree = false;
    this.isNew = $.isEmptyObject(editobject) ? true : false;
    this.storeTableNames = [];
    this.dupTableNames = [];
    this.dragableArray = [];
    this.TableSchema = object;
    this.ObjectSchema = this.isNew ? {} : editobject;
    this.mySVG = $(".DesignPane").connectSVG();
    this.DesignPane = $(".DesignPane");
    this.SortPane = $(".SortPane");
    this.ConditionPane = $(".ConditionPane");
    this.QueryPane = $(".QueryPane");
    this.IdCounters = {
        TableCount: 0
    };
    this.count = 0;
    this.columnName = [];
    this.tbName = [];
    this.array = [];
    this.arraysort = [];
    this.drawTree = false;//...
    this.LeftNode;
    this.RightNode;
    this.joinArray = [];
    this.tableExist = false;
    this.lineId = 0;
    this.CompleteQuery = {};
    this.QueryDisply = {};
    this.lateststr = "";
    this.mergeString = "";
    this.saveFormatString = "";
    this.check_items = function (a, b) {
        this.r = a;
        this.table = b;
    };
    this.query = [];
    this.tb = [];
    this.firstvar = 0;

    var QueryObject = function () {
        this.TableCollection = [];
        this.QueryString = "";
        this.Conditions = {};
    };

    this.tables = function () {
        this.id = "";
        this.tableName = "";
        this.leftPos = "";
        this.topPos = "";
        this.columnsColl = [];
        this.aliasName = "";
    };

    this.columns = function () {
        this.colNameStore = "";
        this.checkIdStore = "";
    };

    this.ForGrp = {};

    var d = function () {
        this.jointype = "",
            this.fortnames = "",
            this.forcnames = "",
            this.tables = "",
            this.cnames = ""
    }

    this.appendDraggableTableNames = function () {
        for (var key in this.TableSchema) {
            $("#tables-cont").append(`<ul class="treeview"><li class="dragable t-draggable" tname="${key}">${key}   
            </li></ul>`);
        }

    };

    this.appendDragulaTableNames = function () {
        for (var key in this.TableSchema) {
            $("#dragula-tables-cont").append(`<ul class="treeviewDragula" style="display:none">
                                            <li id="tname_${key}" tname="${key}">${key}   
                                                <ul id="treeview_${key}" class="cols-cont" style="display:none">
                                                </ul>
                                            </li>
                                      </ul>`);
            this.appendTCol($("#tname_" + key), this.TableSchema[key]);
        }

    };

    this.appendTCol = function ($container, colArray) {
        for (i = 0; i < colArray.length; i++) {
            $container.children("ul").append(`<li class="col-draggable" colname="${colArray[i].cname}"  datatype="${colArray[i].type}">${colArray[i].cname}</li>`);
        }
    };

    this.makeDroppable = function () {
        $(".t-draggable").draggable({
            revert: "invalid",
            helper: "clone",
            appendTo: "body"
        });
        this.DesignPane.droppable({
            accept: ".t-draggable",
            drop: this.tableOnDrop.bind(this)
        });
    };

    this.tableOnDrop = function (event, ui) {
        this.droploc = $(event.target);
        this.dropObj = $(ui.draggable);
        this.left = event.pageX - this.droploc.offset().left;
        this.top = event.pageY - this.droploc.offset().top;
        this.tableName = $(ui.draggable).attr('tname');
        this.tableOnDropAppend();
    };

    this.tableOnDropAppend = function (objId) {
        this.IdCounters["TableCount"]++
        if (objId === undefined || objId === null)
            this.objId = this.tableName + this.IdCounters["TableCount"];
        else
            this.objId = objId;
        this.objId = this.tableName + this.IdCounters["TableCount"];
        this.droploc.append(`<div class="table-container table-${this.tableName}" tn="${this.tableName}" id="${this.objId}" style="position:absolute;top:${this.top};left:${this.left};">
                                <div class="Table">
                                <div class="headtb" id="tbhd_${this.tableName}">${this.tableName}
                                <button class="btn0" t="${this.tableName}">
                                <i class="fa fa-close" aria-hidden="true"></i></button></div>  
                                <div class="tablebody" id="col-container${this.objId}"></div></div>`);
        this.addColoums("col-container" + this.objId);
        $($("#" + this.objId).find("#tbhd_" + this.tableName).find(".btn0")).on("click", this.removTable.bind(this));
        $("#" + this.objId).draggable({ containment: ".DesignPane", handle: "#tbhd_" + this.tableName });

        this.tablesObj = new this.tables();
        this.tablesObj.tableName = this.tableName;
        this.tablesObj.id = this.objId;
        this.saveQueryObject.TableCollection.push(this.tablesObj);

        for (i = 0; i < this.saveQueryObject["TableCollection"].length; i++) {
            if (this.saveQueryObject["TableCollection"][i].id === this.objId) {
                this.saveQueryObject["TableCollection"][i].leftPos = this.left;
                this.saveQueryObject["TableCollection"][i].topPos = this.top;
            }
        }
        this.dupTableNames.push(this.tableName);
        for (var i = 0; i < this.dupTableNames.length; i++) {
            if (this.storeTableNames.indexOf(this.dupTableNames[i]) === -1)
                this.storeTableNames.push(this.dupTableNames[i]);
        }
        this.Qdisply();
    };

    this.removTable = function (event) {
        
        this.tableName = $(event.target).closest('button').attr("t");
        $($(event.target).closest('.Table').parent()).remove();

        // this.Qdisply();$($(event.target).closest('.Table').parent()).attr("id").slice(0, -1);$(event.target).closest("#tbhd_" + this.tableName).text().trim()
        this.mySVG.redrawLines();
        for (key in this.ForGrp) {
            if (this.tableName === this.ForGrp[key].fortnames || this.tableName === this.ForGrp[key].tables) {
                delete this.ForGrp[key];


                //if (key == this.firstvar) {
                //    $.each(this.ForGrp, function (ke, obj) {
                //        if (this.ForGrp.hasOwnProperty(ke)) {
                //            this.firstvar = ke;
                //            return false;
                //        }
                //        if (Object.keys(this.ForGrp).length - 1 === parseInt(ke))
                //            this.Qdisply();
                //    }.bind(this));
                //}
                //else
                //    if (Object.keys(this.ForGrp).length - 1 === parseInt(key))
                //this.Qdisply();


            }
        }
       
        //this.array.pop(this.tableName);
        for (var i = this.array.length - 1; i >= 0; i--) {
            if (this.array[i] === this.tableName) {
                this.array.splice(i, 1);
            }
        }

        this.Qdisply();
        
    };

    this.onDragStopFn = function (event, ui) {
        var left = event.pageX - this.droploc.offset().left;
        var top = event.pageY - this.droploc.offset().top;
        var tagetId = $(event.target).attr("id");
        for (var i = 0; i < this.saveQueryObject["TableCollection"].length; i++) {
            if (this.saveQueryObject["TableCollection"][i].id === tagetId) {
                this.saveQueryObject["TableCollection"][i].leftPos = left;
                this.saveQueryObject["TableCollection"][i].topPos = top;
            }
        }

    };

    this.addColoums = function ($container) {
        this.treepusharray();
        for (i = 0; i < this.TableSchema[this.tableName].length; i++) {
           this.item = this.TableSchema[this.tableName][i];
            this.checkId = this.objId + "-" + this.item.cname + "-" + "checkId";
            this.keyId = this.objId + "-" + this.item.cname + "-" + "keyid";
            $("#" + $container).append(`<div class="col form-inline" tabindex="1" id="${this.tableName}-col${i}" cnm="${this.item.cname}" datatp="${this.item.type}" con="${this.item.constraints}" fortnm="${this.item.foreign_tnm}" forcnm="${this.item.foreign_cnm}" >
                <span><input type="checkbox" id="${this.checkId}" class="checkBoxClass"></span>
                <span id="ann">${this.item.cname}</span>
                <span>${this.item.type}</span>
                <span><i class="fa fa-key" id="${this.keyId}" aria-hidden="true" style="display:none"></i></span></div>`);
            this.subtreeappend();
            if (this.item.constraints === "PRIMARY KEY")
                $("#" + this.keyId).show();
        }

        this.treeFunction();
        this.foreignConstruct();
        $('.checkBoxClass').off("click").on("click", this.get_parent.bind(this));
        $(".col").off("focus").on("focus", this.sortOrder.builderContextmenu);
        this.makeDroppableColumn();
    };

    this.treepusharray = function () {
        if (this.array.indexOf(this.tableName) === -1) {
            this.array.push(this.tableName);
        }
        $.each(this.dropObj.parent().parent().children(), function (i, obj) {
            $(obj).removeClass("tre");
        });
        this.dropObj.parent().addClass("tre");
        if (!this.dropObj.parent().hasClass("treeview-tree")) {
            this.dropObj.append("<ul></ul>");
        }

    };

    this.subtreeappend = function () {
        if (!this.dropObj.parent().hasClass("treeview-tree")) {
            this.dropObj.children("ul").append(`<li class="dragables" colname="${this.item.cname}"  datatype="${this.item.type}">${this.item.cname}</li>`);
            this.drawTree = true;

        }
    };

    this.treeFunction = function () {
        if (this.drawTree) {
            $('.tre').each(function () {
                var tree = $(this);
                tree.treeview();
            });
            this.drawTree = false;
            $("#Sort").append(`<div class="sortorder" id="sortorder_${this.tableName}"></div>`);
        }
    };

    this.foreignConstruct = function () {
        if ($('.DesignPane').children().length > 0) {
            for (k = 0; k < this.array.length; k++) {
                var colCollection = this.TableSchema[this.array[k]];
                for (i = 0; i < colCollection.length; i++) {
                    if (this.array.indexOf(colCollection[i].foreign_tnm) > -1 && (colCollection[i].foreign_tnm === this.tableName || this.array[k] === this.tableName)) {

                        var fortname = colCollection[i].foreign_tnm;
                        var forcname = colCollection[i].foreign_cnm;
                        var cname = colCollection[i].cname;
                        this.fcm = $("div[cnm='" + forcname + "']").attr("id");
                        this.cnme = $("div[cnm='" + cname + "']").attr("id");
                        this.a = fortname;
                        this.b = forcname;
                        this.d = cname;
                        this.e = this.cnme.split("-")[0];
                        this.foreign_key("#" + this.fcm, "#" + this.cnme);

                    }
                }
            }
        }
    };

    this.foreign_key = function (a, b) {
        this.c = this.lineId++;
        if (!this.tableExist) {

            this.mySVG.drawLine({
                left_node: a,
                right_node: b,
                horizantal_gap: 0,
                status: '',
                Counter: this.c
            });

            this.ForGrp[this.c] = new d();

            this.ForGrp[this.c].jointype = "inner join";
            this.ForGrp[this.c].fortnames = this.a;
            this.ForGrp[this.c].forcnames = this.b;
            this.ForGrp[this.c].cnames = this.d;
            this.ForGrp[this.c].tables = this.e;

        }
        this.tableExist = false;
        $(a).parent().parent().parent().draggable({
            drag: function (event, ui) {
                this.mySVG.redrawLines(this.LeftNode, this.RightNode);
                this.LeftNode = null; this.RightNode = null;
            }.bind(this)
        });
        $(b).parent().parent().parent().draggable({
            drag: function (event, ui) {
                this.mySVG.redrawLines(this.LeftNode, this.RightNode);
                this.LeftNode = null; this.RightNode = null;
            }.bind(this)
        });

        this.forignkeyline_Contextmenu();
        this.LeftNode = null;
        this.RightNode = null;
        this.Qdisply();
    };

    this.makeDroppableColumn = function () {
        $(".col").draggable({
            revert: "invalid",
            helper: "clone",
            appendTo: "body"
        });
        $(".col").droppable({
            accept: ".col",
            drop: this.ColumnOnDrop.bind(this)
        })
    };

    this.ColumnOnDrop = function (event, ui) {
        this.droploc = $(event.target);
        this.dropObj = $(ui.draggable);
        this.div1 = $(ui.draggable).attr("id");
        this.div2 = $(event.target).attr("id");
        this.foreign_key("#" + this.div1, "#" + this.div2);
        this.ForGrp[this.c].fortnames = this.div1.split("-")[0];
        this.ForGrp[this.c].forcnames = $("#" + this.div1).attr('cnm');
        this.ForGrp[this.c].cnames = $("#" + this.div2).attr('cnm');
        this.ForGrp[this.c].tables = this.div2.split("-")[0];
        this.Qdisply();
    };

    this.forignkeyline_Contextmenu = function (e) {
        $.contextMenu({
            selector: "g",
            items: {
                "left join": { name: "Left join", icon: "leftjoin", callback: this.Joinleft.bind(this), },
                "right join": { name: "Right join", icon: "rightjoin", callback: this.Joinright.bind(this), },
                "full join": { name: "Full join", icon: "fulljoin", callback: this.Fulljoin.bind(this), },
                "delete": { name: "Delete", icon: "delete", callback: this.removLine.bind(this), },
            }
        });
    };

    this.Joinleft = function (itemKey, opt, rootMenu, originalEvent) {
        var flag = false;
        var LeftNode = $(".context-menu-active").attr("left");
        var RightNode = $(".context-menu-active").attr("right");
        $.each(this.joinArray, function (i, obj) {
            if ((obj.leftnode === LeftNode) && (obj.rightnode === RightNode)) {
                obj.activity = "leftjoin";
                flag = true;
            }
        }.bind(this));
        if (!flag)
            this.joinArray.push(new join(LeftNode, RightNode, "leftjoin"));
        $(".context-menu-active").children().attr("stroke", 'blue');
        this.mySVG.ChangeLineColor($(".context-menu-active").attr("left"), $(".context-menu-active").attr("right"), "leftjoin");
        let key = $(".context-menu-active").attr('id');
        this.ForGrp.hasOwnProperty(key) ? this.ForGrp[key].jointype = "left join" : null;
        this.Qdisply();
    }

    this.Joinright = function (itemKey, opt, rootMenu, originalEvent) {
        var flag = false;
        var LeftNode = $(".context-menu-active").attr("left");
        var RightNode = $(".context-menu-active").attr("right");
        $.each(this.joinArray, function (i, obj) {
            if ((obj.leftnode === LeftNode) && (obj.rightnode === RightNode)) {
                obj.activity = "rightjoin";
                flag = true;
            }
        }.bind(this));
        if (!flag)
            this.joinArray.push(new join(LeftNode, RightNode, "rightjoin"));
        $(".context-menu-active").children().attr("stroke", 'green');
        this.mySVG.ChangeLineColor($(".context-menu-active").attr("left"), $(".context-menu-active").attr("right"), "rightjoin");
        let key = $(".context-menu-active").attr('id');
        this.ForGrp.hasOwnProperty(key) ? this.ForGrp[key].jointype = "right join" : null;
        this.Qdisply();
    }

    this.Fulljoin = function (itemKey, opt, rootMenu, originalEvent) {
        var flag = false;
        var LeftNode = $(".context-menu-active").attr("left");
        var RightNode = $(".context-menu-active").attr("right");
        $.each(this.joinArray, function (i, obj) {
            if ((obj.rightnode === RightNode)) {
                obj.activity = "fulljoin";
                flag = true;
            }
        }.bind(this));
        if (!flag)
            this.joinArray.push(new join(LeftNode, RightNode, "fulljoin"));
        $(".context-menu-active").children().attr("stroke", '#FF0000');
        this.mySVG.ChangeLineColor($(".context-menu-active").attr("left"), $(".context-menu-active").attr("right"), "fulljoin");
        let key = $(".context-menu-active").attr('id');
        this.ForGrp.hasOwnProperty(key) ? this.ForGrp[key].jointype = "full join" : null;
        this.Qdisply();
    }

    this.removLine = function (itemKey, opt, rootMenu, originalEvent) {
        this.LeftNode = $(".context-menu-active").attr("left");
        this.RightNode = $(".context-menu-active").attr("right");
        var iii = $(".context-menu-active").attr('id');
        if (this.ForGrp.hasOwnProperty(iii)) {
            delete this.ForGrp[iii];
            if (iii == this.firstvar) {
                $.each(this.ForGrp, function (key, obj) {
                    if (this.ForGrp.hasOwnProperty(key)) {
                        this.firstvar = key;
                        return false;
                    }
                }.bind(this));
            }
        }





        //var obj = {};
        //var k = 0;
        //$.each(this.ForGrp, function (a, ob) {
        //    obj[k] = ob;
        //    k++;
        //});
        //this.ForGrp = obj;

        $(".context-menu-active").remove();
        this.Qdisply();
    };

    this.JoinQuery = function (ForGrp) {
        var joinTnames = [];
        this.isRepeated = false;
        var QString = '';
        for (var j in ForGrp) {

            if (j === "0") {
                QString += ForGrp[j].jointype + " " + ForGrp[j].fortnames + " " + "On" + " " + ForGrp[j].fortnames + "." + ForGrp[j].forcnames + " " + "=" + " " + ForGrp[j].tables + "." + ForGrp[j].cnames + " \n";
            }
            else {
                joinTnames.push(ForGrp[j].fortnames);

                this.isRepeated = false;
                $.each(ForGrp, function (i, obj) {
                    if (i < parseInt(j)) {
                        if (ForGrp[j].fortnames === ForGrp[i].fortnames || ForGrp[j].fortnames === ForGrp[this.firstvar].tables) {
                            this.isRepeated = true;
                            return false;
                        }
                    }

                }.bind(this));

                if (this.isRepeated) {
                    if (!joinTnames.includes(ForGrp[j].tables)) {//
                        joinTnames[j] = ForGrp[j].tables;
                        QString += ForGrp[j].jointype + " " + ForGrp[j].tables + " " + "On" + " " + ForGrp[j].fortnames + "." + ForGrp[j].forcnames + " " + "=" + " " + ForGrp[j].tables + "." + ForGrp[j].cnames + " \n";
                    }
                    else
                        QString += "AND" + " " + ForGrp[j].fortnames + "." + ForGrp[j].forcnames + " " + "=" + " " + ForGrp[j].tables + "." + ForGrp[j].cnames + " \n";
                }
                else
                    QString += ForGrp[j].jointype + " " + ForGrp[j].fortnames + " " + "On" + " " + ForGrp[j].fortnames + "." + ForGrp[j].forcnames + " " + "=" + " " + ForGrp[j].tables + "." + ForGrp[j].cnames + " \n";

            }
        }
        return QString;
    };

    this.whereClauseFn = function () {

        $("#tables-cont").hide();
        $(".treeviewDragula").show();
        for (var key in this.storeTableNames) {
            var tblName = this.storeTableNames[key];
            $("#treeview_" + tblName).show();
            if ($("#treeview_" + tblName).parent().parent().hasClass("treeview-tree")) {
                $("#treeview_" + tblName).parent().parent().removeClass("Dtre");
            }
            else {
                $("#treeview_" + tblName).parent().parent().addClass("Dtre");
                this.drawDTree = true;
            }
        }
        if (this.drawDTree) {
            $(".Dtre").each(function () {
                var tree = $(this);
                tree.treeview();
            });
            this.drawDTree = false;
        }

        this.whereClauseObjects.makeDroppable(this.storeTableNames);

    };

    this.get_parent = function (event) {
        var obj = $(event.target).parent();
        var checkID = $(obj).children().attr("id");
        this.a = $(obj).parent().parent().siblings().text().trim();
        this.b = $(obj).parent().parent().parent().parent().attr("tn");
       
        var ida = $(obj).parent().parent().parent().parent().attr("tn");
        this.r = [];
        if ($(event.target).prop("checked")) {
            if ($(obj).next().attr("id") === "ann") {
                var str = $(obj).parent().parent().attr("id");
                var substr = str.replace("col-container", "");
                for (var i = 0; i < this.saveQueryObject.TableCollection.length; i++) {
                    if (this.saveQueryObject.TableCollection[i].id === substr) {
                        this.colObj = new this.columns();
                        this.colObj.colNameStore = $(obj).next().text();
                        this.colObj.checkIdStore = $(obj).children().attr("id");
                        this.saveQueryObject.TableCollection[i].columnsColl.push(this.colObj);
                    }
                }
                if (Object.keys(this.QueryDisply).indexOf(this.b) === -1) {
                    this.r.push($(obj).next().text());
                    this.QueryDisply[this.b] = new this.check_items(this.r, [ida]);
                }
                else {
                    $.each($(".table-" + this.b).children().children().next().children(), function (i, ob) {
                        if ($(ob).children().eq(0).children().prop("checked")) {
                            this.r.push($(ob).children("#ann").text());
                        }
                    }.bind(this));
                    this.QueryDisply[this.b] = new this.check_items(this.r, [ida]);
                }
            }

        }
        else {
            for (var i = 0; i < this.saveQueryObject.TableCollection.length; i++) {
                for (var j = 0; j < this.saveQueryObject.TableCollection[i].columnsColl.length; j++) {
                    if (this.saveQueryObject.TableCollection[i].columnsColl[j].checkIdStore === checkID) {
                        this.saveQueryObject.TableCollection[i].columnsColl.splice(j,1);
                    }
                }
            }
            

            $.each($(".table-" + this.b).children().children().next().children(), function (i, ob) {
                if ($(ob).children().eq(0).children().prop("checked")) {
                    this.r.push($(ob).children("#ann").text());
                }
            }.bind(this));

            this.QueryDisply[this.b] = new this.check_items(this.r, [ida]);
            if (this.r.length === 0) {
                delete this.QueryDisply[this.b];
            }

        }

        this.Qdisply();

    };

    this.Qdisply = function () {

        $.each(this.ForGrp, function (kk, obj) {
            if (this.ForGrp.hasOwnProperty(kk)) {
                this.firstvar = kk;
                return false;
            }
        }.bind(this));


        var str = this.JoinQuery(this.ForGrp);
        if ((str == "") && (Object.keys(this.QueryDisply).length === 0)){
            this.editor.setValue("SELECT * FROM" + " " + this.array);
        }
            if ((str == "") && (Object.keys(this.QueryDisply).length !== 0)) {
            var str = "SELECT \n";
            this.tb = [];
            $.each(this.QueryDisply, function (key, value) {
                var updateKey = key;
                this.tb.push(key);
                $.each(value.r, function (i, ob) {
                    str += ` ${updateKey}.${ob} , \n`;
                });
            }.bind(this));
            str = str.replace(/,\s*$/, "");
            str += "\n FROM";
            $.each(this.QueryDisply, function (key, value) {
                str += `  ${value.table}, \n`;
            });
            this.lateststr = str.replace(/,\s*$/, "");
            var sortstr = this.sortOrder.SortQuery(this.sortOrder.SorGrp);
            if ((this.saveFormatString !== "") && (sortstr !== ""))
                this.editor.setValue(this.lateststr + " " + "\n" + " " + "WHERE" + " " + this.saveFormatString + "\n" + "ORDER BY" + " " + sortstr);
            else if (this.saveFormatString !== "")
                this.editor.setValue(this.lateststr + " " + "\n" + " " + "WHERE" + " " + this.saveFormatString + "\n");
            else if (sortstr !== "")
                this.editor.setValue(this.lateststr + " " + "\n" + " " + "ORDER BY" + " " + sortstr);
            else
                this.editor.setValue(this.lateststr);
        }
        else if (Object.keys(this.QueryDisply).length !== 0) {
            var str = "SELECT \n";
            this.tb = [];
            $.each(this.QueryDisply, function (key, value) {
                var updateKey = key;
                this.tb.push(key);
                $.each(value.r, function (i, ob) {
                    str += ` ${updateKey}.${ob} , \n`;
                });
            }.bind(this));
            str = str.replace(/,\s*$/, "");
            str += "\n FROM" + " " + this.ForGrp[this.firstvar].tables+"\n" ;
            this.lateststr = str;
            str = this.JoinQuery(this.ForGrp);
            var sortstr = this.sortOrder.SortQuery(this.sortOrder.SorGrp);
            if ((str !== "") && (this.saveFormatString !== "") && (sortstr !== ""))
                this.editor.setValue(this.lateststr + " " + "\n" + str + " " + "WHERE" + " " + this.saveFormatString + "\n" + "ORDER BY" + " " + sortstr);
            else if ((this.saveFormatString !== "") && (str !== ""))
                this.editor.setValue(this.lateststr + " " + "\n" + str + " " + "WHERE" + " " + this.saveFormatString + "\n");
            else if ((sortstr !== "") && (str !== ""))
                this.editor.setValue(this.lateststr + " " + "\n" + str + " " + "ORDER BY" + " " + sortstr);
            //else if (this.array !== "")
            //    this.editor.setValue("SELECT * FROM" + " " + this.array[0]);
            else
                this.editor.setValue(this.lateststr + " " + "\n" + str);

        }
        //else if ((str == "") && (Object.keys(this.QueryDisply).length === 0)) {
        //    this.editor.setValue("SELECT * FROM" + " " + this.array);
        //}
        
        else {
            sortstr = this.sortOrder.SortQuery(this.sortOrder.SorGrp);
            str = this.JoinQuery(this.ForGrp);
            if ((str !== "") && (this.saveFormatString !== "") && (sortstr !== ""))
                this.editor.setValue("SELECT * \n FROM " + " " + this.ForGrp[this.firstvar].tables + "\n" + " " + str + " " + "WHERE" + " " + this.saveFormatString + "\n" + "ORDER BY" + " " + sortstr);
            else if ((this.saveFormatString !== "") && (str !== ""))
                this.editor.setValue("SELECT * \n FROM " + " " + this.ForGrp[this.firstvar].tables + "\n" + " " + str + " " + "WHERE" + " " + this.saveFormatString + "\n" /*+ "ORDER BY" + " " + sortstr*/);
            else if ((sortstr !== "") && (str !== ""))
                this.editor.setValue("SELECT * \n FROM " + " " + this.ForGrp[this.firstvar].tables + "\n" + " " + str + " " + "ORDER BY" + " " + sortstr);
            else if (str !== "")
                this.editor.setValue("SELECT * \n FROM " + " " + this.ForGrp[this.firstvar].tables + "\n" + " " + str  /*+ "ORDER BY"+" "+ sortstr*/);
           
        }

    }

    this.finalQueryFn = function (event) {
        var temp = true;
        $(".keypressEventText").each(function (i, ob) {
            if ($(ob).prev().val() === "BETWEEN") {
                if ($(ob).val().trim() === "" || $(ob).next().val().trim() === "") {
                    temp = false;
                }
                for (var key in this.whereClauseObjects.condFlatObj) {
                    if ($(ob).attr("flatObjId") === key) {
                        if (this.whereClauseObjects.condFlatObj[key].Operator === "BETWEEN") {
                            this.whereClauseObjects.condFlatObj[key].Value = $(ob).val().trim();
                            this.whereClauseObjects.condFlatObj[key].valueSec = $(ob).next().val().trim();
                        }
                    }
                }
                
            }
            else {
                if ($(ob).val().trim() === "") {
                    temp = false;
                }
                for (var key in this.whereClauseObjects.condFlatObj) {
                    if ($(ob).attr("flatObjId") === key) {
                        this.whereClauseObjects.condFlatObj[key].Value = $(ob).val();
                    }
                }
            }
        }.bind(this));

        $(".changeEventTextFn").each(function (i, ob) {
            if ($(ob).prev().val() === "BETWEEN") {
                if ($(ob).val().trim() === "" || $(ob).next().val().trim() === "") {
                    temp = false;
                }
            }
            else {
                if ($(ob).val().trim() === "") {

                    temp = false;
                }
            }
        });

        if (!temp) {
            alert("please fill out fields");
        }
        var finalString = this.whereClauseObjects.recFinalQueryFn(this.whereClauseObjects.WHEREclouseQ);
        this.saveFormatString = finalString.substr(1);
        this.Qdisply();
    };

    this.saveQBFn = function () {
        var str = JSON.stringify(this.saveQueryObject);
        $.ajax({
            type: 'POST',
            url: "../QB/selectClause",
            data: {
                Json: str,
                Name: $("#queryobj_name").val()
            },
            success: function (data) {
                $("#myModal").modal("toggle");
            }
        });
    };

    this.renderTableOnEdit = function () {
        for (var i = 0; i < this.ObjectSchema.TableCollection.length; i++) {
            this.droploc = $("#designpane");
            this.tableName = this.ObjectSchema.TableCollection[i]["tableName"];
            this.dropObj = $(".treeview").children('[tname= ' + this.tableName + ']')
            this.left = this.ObjectSchema.TableCollection[i]["leftPos"];
            this.top = this.ObjectSchema.TableCollection[i]["topPos"];
            var objId = this.ObjectSchema.TableCollection[i]["id"];
            var tableAliasName = this.ObjectSchema.TableCollection[i]["aliasName"];
            this.tableOnDropAppend(objId);
            for (var j = 0; j < this.ObjectSchema.TableCollection[i].columnsColl.length; j++) {
                var colName = this.ObjectSchema.TableCollection[i].columnsColl[j].colNameStore;
                var checkIdStore = this.ObjectSchema.TableCollection[i].columnsColl[j].checkIdStore;
                // $('input[type="checkbox"]').on("click", this.get_parent.bind(this, colName));
                $("body").on("click", "#" + checkIdStore, this.get_parent.bind(this));
                $("#" + checkIdStore).click();
            }
        }
    };

    this.init = function () {
        this.appendDraggableTableNames();
        this.appendDragulaTableNames();
        this.makeDroppable();
        this.saveQueryObject = new QueryObject();
        this.sortOrder = new SqLsortOrder();
        this.whereClauseObjects = new WhereBuilder(this);
        this.saveQueryObject.Conditions = this.whereClauseObjects.WHEREclouseQ;
        $("a[href='#Condition']").on("click", this.whereClauseFn.bind(this));

        $("body").on("click", ".saveQuery", this.finalQueryFn.bind(this));
        $("body").on("click", ".saveQB", this.saveQBFn.bind(this));
        this.editor = new CodeMirror.fromTextArea(document.getElementById("QueryPane"),
            {
                mode: "text/x-pgsql",
                lineNumbers: true,
                lineWrapping: false,
                autoRefresh: true,
                readOnly: false,
                foldGutter: { rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.brace, CodeMirror.fold.comment) },
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
            });
        if (this.isNew) {
        }
        else {
            this.renderTableOnEdit();
            $(".saveQuery").click();
        }

    };

    this.init();
}
$.fn.extend({
    treeview: function () {
        return this.each(function () {
            // Initialize the top levels;
            var tree = $(this);
            tree.addClass('treeview-tree');
            tree.find('li').each(function () {
                var stick = $(this);
            });
            tree.find('li').has("ul").each(function () {
                var branch = $(this); //li with children ul
                branch.prepend("<i class='tree-indicator glyphicon glyphicon-chevron-right'></i>");
                branch.addClass('tree-branch');
                branch.on('click', function (e) {
                    if (this === e.target) {
                        var icon = $(this).children('i:first');
                        icon.toggleClass("glyphicon-chevron-down glyphicon-chevron-right");
                        $(this).children().children().toggle();
                    }
                })
                branch.children().children().toggle();
                branch.children('.tree-indicator, button, a').click(function (e) {
                    branch.click();
                    e.preventDefault();
                });
            });
        });
    }
});













