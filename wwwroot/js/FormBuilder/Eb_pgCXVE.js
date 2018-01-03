var Eb_pgCXVE = function (pgObj) {
    this.PGobj = pgObj;
    this.CE_PGObj = {};
    this.pgCXE_Cont_Slctr = "#" + this.PGobj.wraperId + " .pgCXEditor-Cont";
    this.CEctrlsContId = this.PGobj.wraperId + "_CEctrlsCont";
    this.CE_all_ctrlsContId = this.PGobj.wraperId + "_CE_all_ctrlsCont";
    this.OnCXE_OK = function (obj) { };
    this.OSE_curTypeObj = null;
    this.CElist = [];
    this.editor = null;

    this.CXE_OKclicked = function () {
        if (this.editor === 17) {
            var imgId = this.PGobj.imgSlctrs[this.PGobj.CurProp].getId();
            this.PGobj.PropsObj[this.PGobj.CurProp] = imgId;
            $("#" + this.PGobj.wraperId + " [name=" + this.PGobj.CurProp + "Tr]").find("input").val(imgId);
        }

        this.PGobj.OnInputchangedFn.bind(this.PGobj)();
        this.OnCXE_OK(this.PGobj.PropsObj[this.PGobj.CurProp]);
    };

    this.pgCXEshowCallback = function () {
        $(this.pgCXE_Cont_Slctr + " .CE-add").click(this.CE_AddFn.bind(this));

        console.log(this.pgCXE_Cont_Slctr + "  -bind no:" + $(this.pgCXE_Cont_Slctr + " .CE-add").length);
    };

    this.pgCXE_BtnClicked = function (e) {
        $(this.pgCXE_Cont_Slctr).css("left", (24 + $(".pgCXEditor-Cont").length) + "%");//
        $(this.pgCXE_Cont_Slctr).css("top", (14 + $(".pgCXEditor-Cont").length) + "vh");//
        this.editor = parseInt(e.target.getAttribute("editor"));
        this.PGobj.CurProp = e.target.getAttribute("for");
        this.CurProplabel = this.PGobj.Metas[this.PGobj.propNames.indexOf(this.PGobj.CurProp.toLowerCase())].alias || this.PGobj.CurProp;
        if (this.editor !== 17)
            $("#" + this.PGobj.wraperId + " .pgCXEditor-bg").show(450, this.pgCXEshowCallback.bind(this));
        $(this.pgCXE_Cont_Slctr + " .modal-footer .modal-footer-body").empty();
        this.CurEditor = this.PGobj.Metas[this.PGobj.propNames.indexOf(this.PGobj.CurProp.toLowerCase())].editor;
        if (this.editor > 6 && this.editor < 11)
            this.initCE();
        else if (this.editor === 11)
            this.initJE();
        else if (this.editor === 13)
            this.initOSE();
        else if (this.editor === 16)
            this.initStrE();

        $(this.pgCXE_Cont_Slctr + " .modal-title").text(this.CurProplabel + ": " + this.curEditorLabel);

        $("#" + this.CEctrlsContId).off("click", ".colTile").on("click", ".colTile", this.colTileFocusFn.bind(this));
        $("#" + this.PGobj.wraperId + ' .modal-footer').off("click", "[name=CXE_OK]").on("click", "[name=CXE_OK]", this.CXE_OKclicked.bind(this));


        if (this.PGobj.IsReadonly)
            this.PGobj.ReadOnly();
        else
            this.PGobj.ReadWrite();
    };

    this.initStrE = function () {
        this.curEditorLabel = "String Editor";
        var StrEbody = '<textarea id="StrE_txtEdtr' + this.PGobj.wraperId + '" class="strE-texarea" rows="15" cols="85" ></textarea>'
        $(this.pgCXE_Cont_Slctr + " .modal-body").html(StrEbody);
    };

    this.initCE = function () {
        this.curEditorLabel = "Collection Editor";
        var CEbody = '<div class="CE-body">'
            + '<table class="table table-bordered editTbl">'
            + '<tbody>'
            + '<tr>'

            + '<td style="padding: 0px;">'
            + '<div class="CE-controls-head" >' + this.CurProplabel + ' </div>'
            + '<div id="' + this.CE_all_ctrlsContId + '" class="CE-all-ctrlsCont"></div>'
            + '</td>'

            + '<td style="padding: 0px;">'
            + '<div class="CE-controls-head" > Selected </div>'
            + '<div id="' + this.CEctrlsContId + '" class="CEctrlsCont"></div>'
            + '</td>'

            + '<td style="padding: 0px;"><div id="' + this.PGobj.wraperId + '_InnerPG' + '" class="inner-PG-Cont"><div></td>'
            + '</tr>'
            + '</tbody>'
            + '</table>'
            + '</div>';
        var DD_html = '<div class="sub-controls-DD-cont pull-left">'
            + '<select class="selectpicker"> </select>'
            + '<button type="button" class="CE-add" ><i class="fa fa-plus" aria-hidden="true"></i></button>'
            + '</div>';
        $(this.pgCXE_Cont_Slctr + " .modal-body").html(CEbody);

        if (this.editor === 7) {
            $(this.pgCXE_Cont_Slctr + " .modal-body td:eq(0)").hide();
            $(this.pgCXE_Cont_Slctr + " .modal-footer .modal-footer-body").append(DD_html);
            $(this.pgCXE_Cont_Slctr + " .modal-body td:eq(1) .CE-controls-head").text((this.PGobj.Metas[this.PGobj.propNames.indexOf(this.PGobj.CurProp.toLowerCase())].alias || this.PGobj.CurProp));

            if (this.PGobj.CurProp === "Controls") {
                this.CElist = this.PGobj.PropsObj.Controls.$values;
            }
            else {
                this.CElist = this.PGobj.PropsObj[this.PGobj.CurProp];
            }

            this.CE_PGObj = new Eb_PropertyGrid(this.PGobj.wraperId + "_InnerPG");
            this.CE_PGObj.IsReadonly = this.PGobj.IsReadonly;
            this.CE_PGObj.parentId = this.PGobj.wraperId;
            this.setColTiles(true);
        }
        else if (this.editor > 7 && this.editor < 11) {
            if (this.editor === 8)
                $(this.pgCXE_Cont_Slctr + " .modal-body td:eq(2)").hide();
            else if (this.editor === 10) {
                $(this.pgCXE_Cont_Slctr + " .modal-body td:eq(1)").hide();
                $("#" + this.CE_all_ctrlsContId).off("click", ".colTile").on("click", ".colTile", this.colTileFocusFn.bind(this));
            }
            //this.PGobj.PropsObj[this.PGobj.CurProp] = Gcolumns;

            var sourceProp = getObjByval(this.PGobj.Metas, "name", this.PGobj.CurProp).source;
            this.allCols = this.PGobj.PropsObj[sourceProp].$values;
            this.rowGrouping = this.PGobj.PropsObj[this.PGobj.CurProp].$values;
            this.set9ColTiles(this.CE_all_ctrlsContId, this.allCols);
            this.setSelColtiles();
            this.CE_PGObj = new Eb_PropertyGrid(this.PGobj.wraperId + "_InnerPG");
        }
        this.drake = new dragula([document.getElementById(this.CEctrlsContId), document.getElementById(this.CE_all_ctrlsContId)], { accepts: this.acceptFn.bind(this), moves: function (el, container, handle) { return !this.PGobj.IsReadonly }.bind(this) });
        this.drake.on("drag", this.onDragFn.bind(this));
        this.drake.on("dragend", this.onDragendFn.bind(this));
    };

    this.acceptFn = function (el, target, source, sibling) { return !(source.id === this.CE_all_ctrlsContId && target.id === this.CE_all_ctrlsContId && this.editor !== 10) && !this.PGobj.IsReadonly; };

    this.onDragFn = function (el, source) {
        $(':focus').blur();
        if (source.id !== this.CE_all_ctrlsContId) {
            if (this.editor === 7)
                this.movingObj = this.CElist.splice(this.CElist.indexOf(getObjByval(this.CElist, "EbSid", el.id)), 1)[0];
            else if (this.editor === 9 || this.editor === 8)
                this.movingObj = this.rowGrouping.splice(this.rowGrouping.indexOf(getObjByval(this.rowGrouping, "name", el.id)), 1)[0];
        }
        else if (this.editor === 10)
            this.movingObj = this.allCols.splice(this.allCols.indexOf(getObjByval(this.allCols, "name", el.id)), 1)[0];
        else
            this.movingObj = null;
        if (this.editor === 9 || this.editor === 8)
            this.movingObj = getObjByval(this.allCols, "name", el.id);
    };

    this.onDragendFn = function (el) {
        var sibling = $(el).next();
        var target = $(el).parent()[0];
        var idx = sibling.index() - 1;
        if (target.id !== this.CE_all_ctrlsContId) {
            if (this.editor === 7) {
                if (sibling.length > 0)
                    this.CElist.splice(idx, 0, this.movingObj);
                else
                    this.CElist.push(this.movingObj);
            } else if (this.editor === 9 || this.editor === 8) {
                if (sibling.length > 0)
                    this.rowGrouping.splice(idx, 0, this.movingObj);
                else
                    this.rowGrouping.push(this.movingObj);
            }
        }
        else if (this.editor === 10) {
            if (sibling.length > 0)
                this.allCols.splice(idx, 0, this.movingObj);
            else
                this.allCols.push(this.movingObj);
        }
        $(el).off("click", ".close").on("click", ".close", this.colTileCloseFn);
    };

    this.initJE = function () {
        this.curEditorLabel = "Javascript Editor";
        var JEbody = '<textarea id="JE_txtEdtr' + this.PGobj.wraperId + '" rows="12" cols="40" ></textarea>'
        $(this.pgCXE_Cont_Slctr + " .modal-body").html(JEbody);
        CodeMirror.commands.autocomplete = function (cm) { CodeMirror.showHint(cm, CodeMirror.hint.javascript); };
        window.editor = CodeMirror.fromTextArea(document.getElementById('JE_txtEdtr' + this.PGobj.wraperId), {
            mode: "javascript",
            lineNumbers: true,
            lineWrapping: true,
            extraKeys: { "Ctrl-Space": "autocomplete" },
            foldGutter: { rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.brace, CodeMirror.fold.comment) },
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });
    };

    this.initOSE = function () {
        this.curEditorLabel = "Object Selector";
        var OSEbody = '<div class="OSE-body">'
            + '<table class="table table-bordered editTbl">'
            + '<tbody>'
            + '<tr>'
            + '<td style="padding: 0px;">'
            + '<div class="OSE-DD-cont" > '
            + '<select class="selectpicker">'
            + '</select>'
            + '</div>'
            + '<div class="OSEctrlsCont"> </div>'
            + '</td>'
            + '<td style="padding: 0px;">'
            + '<div class="CE-controls-head"> Versions </div>'
            + '<div class="OSE-verTile-Cont"> </div>'
            + '</td> '
            + '</tr>'
            + '</tbody>'
            + '</table>'
            + '</div>';
        $(this.pgCXE_Cont_Slctr + " .modal-body").html(OSEbody);
        var options = "";
        var ObjTypes = this.PGobj.Metas[this.PGobj.propNames.indexOf(this.PGobj.CurProp.toLowerCase())].options;
        if (ObjTypes !== null)
            for (var i = 0; i < ObjTypes.length; i++) { options += '<option obj-type="' + EbObjectTypes[ObjTypes[i]] + '">' + ObjTypes[i] + '</option>' }
        else
            console.error("meta.options null for " + this.PGobj.CurProp + " Check C# Decoration");
        $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker").empty().append(options).selectpicker('refresh');
        $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker").selectpicker().on('change', this.getOSElist.bind(this));
        var CurRefId = $("#" + this.PGobj.wraperId + " [name=" + this.PGobj.CurProp + "Tr]").find("input").attr("refid");
        if (CurRefId) {
            var ObjType = CurRefId.split("-")[2];
            var ObjName = $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker [obj-type=" + ObjType + "]").text();
            var $selectedOpt = $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker").find("option:selected");
            if (ObjName === $selectedOpt.text())
                this.getOSElist();
            else
                $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont a:contains(" + ObjName + ")").click();
        }
        else
            this.getOSElist();
    };

    this.getOSElist = function () {
        var $selectedOpt = $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker").find("option:selected");
        var ObjType = $selectedOpt.attr("obj-type");
        if (!this.PGobj.OSElist[ObjType]) {
            $.LoadingOverlay("show");
            $.ajax({
                url: "../DV/FetchAllDataVisualizations",
                type: "POST",
                data: { type: $selectedOpt.text() },
                success: this.biuldObjList
            });
        }
        else
            this.biuldObjList(this.PGobj.OSElist[ObjType]);
    }.bind(this);

    this.biuldObjList = function (data) {
        this.OSE_curTypeObj = data;
        $.LoadingOverlay("hide");
        var ObjType = null;
        $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont").empty();
        $.each(data, function (name, val) {
            if (name)
                $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont").append('<div class="colTile" tabindex="1" name ="' + name + '">' + name.replace("<", "&lt;").replace(">", "&gt;")
                    + '<i class="fa fa-chevron-circle-right pull-right ColT-right-arrow"  aria-hidden="true"></i></div>');
            ObjType = val[0].refId.split("-")[2];
        }.bind(this));
        this.PGobj.OSElist[ObjType] = data;
        $(this.pgCXE_Cont_Slctr + " .modal-footer .modal-footer-body").append('<input class="searchinp" placeholder="Search object...                                             &#x1F50D" type="text"/>');
        $(this.pgCXE_Cont_Slctr + " .modal-footer .searchinp").off("keyup").on("keyup", this.searchObj);
        $(this.pgCXE_Cont_Slctr + " .OSE-body .colTile").off("click").on("click", this.OTileClick.bind(this, data));
        $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").off("click").on("click", ".colTile", this.VTileClick.bind(this, data));
        if ($(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .filter-option .fa-refresh").length === 0) {
            var $refresh = $('<i class="fa fa-refresh DD-refresh" aria-hidden="true"></i>').on("click", this.refreshDD.bind(this));
            $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .filter-option").append($refresh);
        }
        var CurRefId = $("#" + this.PGobj.wraperId + " [name=" + this.PGobj.CurProp + "Tr]").find("input").attr("refid");
        var objName = this.getOBjNameByval(data, CurRefId);
        if (CurRefId) {
            if ($(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .colTile:contains(" + objName + ")").length > 0)
                $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .colTile:contains(" + objName + ")").focus()[0].click();
            else
                $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").empty();
        }
    }.bind(this);

    this.searchObj = function (event) {
        var $e = $(event.target);
        $(this.pgCXE_Cont_Slctr + " .OSE-body .colTile").each(function (i, o) {
            if (0 > $(o).text().toLocaleLowerCase().search($e.val().toLocaleLowerCase()))
                $(this).hide();
            else
                $(this).show();
        });
    }.bind(this);

    this.getOBjNameByval = function (data, refId) {
        var ObjName = null;
        for (objName in data) {
            if (getObjByval(data[objName], "refId", refId)) {
                this.OSECurVobj = getObjByval(data[objName], "refId", refId);
                ObjName = this.OSECurVobj.name;
                break;
            }
        }
        return ObjName;
    };

    this.OTileClick = function (data) {
        var $e = $(event.target);
        $("#" + this.PGobj.wraperId + " .OSE-body .colTile").removeAttr("style");
        $e.css("background-color", "#b1bfc1").css("color", "#222");
        var ObjName = $e.attr("name");
        $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .colTile").attr("is-selected", false).find(".ColT-right-arrow").removeAttr("style");
        $e.attr("is-selected", true).find(".ColT-right-arrow").css("visibility", "visible");
        $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").empty();
        $.each(data[ObjName], function (i, obj) {
            if (obj.versionNumber)
                $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").append('<div class="colTile" tabindex="1" ver-no="' + obj.versionNumber + '" data-refid="' + obj.refId + '">' + obj.versionNumber
                    + '<i class="fa fa-check pull-right" style="display:none; color:#5cb85c; font-size: 18px;" aria-hidden="true"></i></div>');
        }.bind(this));
        if (this.PGobj.PropsObj[this.PGobj.CurProp] && this.OSECurVobj && $e.attr("name") === this.OSECurVobj.name)
            $(this.pgCXE_Cont_Slctr + ' .OSE-verTile-Cont [ver-no="' + this.OSECurVobj.versionNumber + '"]')[0].click();
    };

    this.VTileClick = function () {
        var $e = $(event.target);
        $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont .colTile").attr("is-selected", false).find(".fa-check").hide();
        var refId = $e.attr("data-refid");
        this.PGobj.PropsObj[this.PGobj.CurProp] = refId;
        $(event.target).attr("is-selected", true).find(".fa-check").show();
        var ObjName = $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont [is-selected=true]").attr("name");
        $("#" + this.PGobj.wraperId + ".pgCX-Editor-Btn,[for=" + this.PGobj.CurProp + "]").attr("obj-name", ObjName);/////
        $("#" + this.PGobj.wraperId + " [name=" + this.PGobj.CurProp + "Tr]").find("input").val(ObjName + ", " + $e.attr("ver-no"));
        $("#" + this.PGobj.wraperId + " [name=" + this.PGobj.CurProp + "Tr]").find("input").attr("refid", refId);
        this.OSECurVobj = getObjByval(this.OSE_curTypeObj[ObjName], "versionNumber", $e.attr("ver-no"));
    };

    this.refreshDD = function (e) {
        e.stopPropagation();
        var $selectedOpt = $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker").find("option:selected");
        var ObjType = $selectedOpt.attr("obj-type");
        this.PGobj.OSElist[ObjType] = null;
        this.getOSElist();
    };

    this.set9ColTiles = function (containerId, values) {
        $.each(values, function (i, control) {
            var name = (control.Name || control.name);
            var type = control.$type.split(",")[0].split(".").pop();
            if (!(control.Name || control.name))
                var label = control.EbSid;
            var $tile = $('<div class="colTile" id="' + name + '" eb-type="' + type + '" setSelColtiles><i class="fa fa-arrows" aria-hidden="true" style="padding-right: 5px; font-size:10px;"></i>' + name + '<button type="button" class="close">&times;</button></div>');
            if (!getObjByval(this.rowGrouping, "name", control.name)) {
                $("#" + containerId).append($tile);
            } else {
                if (containerId === this.CEctrlsContId)
                    $("#" + this.CEctrlsContId).append($tile);
            }
        }.bind(this));
        $("#" + this.CEctrlsContId + " .colTile").off("click", ".close").on("click", ".close", this.colTileCloseFn);
    };

    this.setSelColtiles = function () {
        var selObjs = [];
        if (this.rowGrouping.length !== 0) {
            $.each(this.rowGrouping, function (i, name) {
                selObjs.push(getObjByval(this.allCols, "name", name.name));
            }.bind(this));
            this.set9ColTiles(this.CEctrlsContId, selObjs);
        }
    };

    this.setColTiles = function (f) {
        var options = "";
        var SubTypes = this.PGobj.Metas[this.PGobj.propNames.indexOf(this.PGobj.CurProp.toLowerCase())].options;
        $("#" + this.CEctrlsContId).empty();
        if (SubTypes) {
            $.each(this.CElist, function (i, control) {
                var type = control.$type.split(",")[0].split(".")[2];
                var label = control.Name;
                if (!control.Name)
                    label = control.EbSid;
                var $tile = $('<div class="colTile" id="' + control.EbSid + '" tabindex="1" eb-type="' + type + '" onclick="$(this).focus()"><i class="fa fa-arrows" aria-hidden="true" style="padding-right: 5px; font-size:10px;"></i>'
                    + '<span>' + label + '</span>'
                    + '<button type="button" class="close">&times;</button>'
                    + '</div>');
                $("#" + this.CEctrlsContId).append($tile);
                //this.colTileFocusFn({ "target": $("#" + control.EbSid).click()[0] });//hack
            }.bind(this));
            for (var i = 0; i < SubTypes.length; i++) { options += '<option>' + SubTypes[i] + '</option>' }
        }
        $(this.pgCXE_Cont_Slctr + " .modal-footer .selectpicker").empty().append(options).selectpicker('refresh');
        $("#" + this.CEctrlsContId).off("click", ".close").on("click", ".close", this.colTileCloseFn);
        if (f) setTimeout(function () { $("#" + this.CEctrlsContId + " .colTile:eq(0)").click(); }.bind(this), 451);
    };

    this.colTileCloseFn = function (e) {
        e.stopPropagation();
        var $tile = $(e.target).parent().remove();
        if (this.editor === 7) {
            this.PGobj.removeFromDD.bind(this.PGobj)($tile.attr("id"));
            this.CElist.splice(this.CElist.indexOf(getObjByval(this.CElist, "EbSid", $tile.attr("id"))), 1);
        }
        else if (this.editor === 9 || this.editor === 8) {
            this.rowGrouping.splice(this.rowGrouping.indexOf(getObjByval(this.rowGrouping, "name", $tile.attr("id"))), 1)[0]
            $("#" + this.CE_all_ctrlsContId).prepend($tile);
        }
    }.bind(this);

    this.colTileFocusFn = function (e) {
        var $e = $(e.target); var id = $e.attr("id");
        $(':focus').blur();
        if (!$e.hasClass("colTile")) {
            this.colTileFocusFn.bind(this)({ target: $e.parent() });
            return 0;
        }
        var obj = null;
        $("#" + this.PGobj.wraperId + " .CE-body .colTile").removeAttr("style");
        $e.css("background-color", "#b1bfc1").css("color", "#222").css("border", "solid 1px #b1bfc1");
        if (this.editor === 7) {
            if (this.PGobj.CurProp === "Controls")///////////////////////
                obj = this.PropsObj.Controls.GetByName(id);
            else
                obj = this.PGobj.PropsObj[this.PGobj.CurProp].filter(function (obj) { return obj.EbSid == $e.attr("id"); })[0];
        }
        else if (this.editor === 9 || this.editor === 10) {
            obj = getObjByval(this.PGobj.PropsObj[this.PGobj.CurProp].$values, "name", id);
        }
        this.CE_PGObj.setObject(obj, AllMetas[$(e.target).attr("eb-type")]);
    };

    this.CE_AddFn = function () {
        console.log(this.pgCXE_Cont_Slctr + "/n" + this.PGobj.wraperId);
        var SelType = $(this.pgCXE_Cont_Slctr + " .modal-footer .sub-controls-DD-cont").find("option:selected").val();
        var lastItemCount = (this.CElist.length === 0) ? -1 : parseInt(this.CElist[this.CElist.length - 1].EbSid.slice(-3).replace(/[^0-9]/g, ''));
        var EbSid = this.PGobj.PropsObj.EbSid + "_" + SelType + (lastItemCount + 1);
        if (this.PGobj.CurProp === "Controls")
            this.PGobj.PropsObj.Controls.$values.push(new EbObjects[SelType](EbSid));
        else
            this.PGobj.PropsObj[this.PGobj.CurProp].push(new EbObjects[SelType](EbSid));
        this.setColTiles();
        $("#" + EbSid).click();
    };

    this.Init = function () {
        var CXVE_html = '<div class="pgCXEditor-bg">'
            + '<div class="pgCXEditor-Cont">'

            + '<div class="modal-header">'
            + '<button type="button" class="close" onclick="$(\'#' + this.PGobj.wraperId + ' .pgCXEditor-bg\').hide(500);" >&times;</button>'
            + '<h4 class="modal-title"> </h4>'
            + '</div>'

            + '<div class="modal-body"> </div>'
            + '<div class="modal-footer">'
            + '<div class="modal-footer-body">'
            + '</div>'
            + '<button type="button" name="CXE_OK" class="btn"  onclick="$(\'#' + this.PGobj.wraperId + ' .pgCXEditor-bg\').hide(500);">OK</button>'
            + '</div>'

            + '</div>'
            + '</div>';
        $(this.PGobj.$wraper).append(CXVE_html);

        $(this.PGobj.$wraper).append('<div id="mb_' + this.PGobj.wraperId + '"> </div>');
    }
    this.Init();
};