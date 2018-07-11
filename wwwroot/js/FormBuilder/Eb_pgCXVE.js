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
        var _CurProp = this.PGobj.CurProp;
        this.PGobj.CurMeta = getObjByval(this.PGobj.Metas, "name", _CurProp);
        var value = "";
        var PropsObj = this.getPropsObj();
        var $curRowInp = $("#" + this.PGobj.wraperId + " [name=" + _CurProp + "Tr] input");
        if (this.editor === 11 || this.editor === 16 || this.editor === 18) {// script editors
            if (this.editor === 16) {
                value = $(`#StrE_txtEdtr${this.PGobj.wraperId}`).val();
                PropsObj[_CurProp] = value;
            }
            else if (this.editor === 11 || this.editor === 18) {
                value = window.editor.getValue();
                PropsObj[_CurProp] = btoa(value);
            }
            $("#" + this.PGobj.wraperId + " [name=" + _CurProp + "Tr] .pgTdval").attr("title", value);
        }
        else if (this.editor === 17) {
            value = this.PGobj.ImgSlctrs[_CurProp].getId();
            PropsObj[_CurProp] = value;
            $curRowInp.val(value);
        }
        else if (this.editor === 14) {
            value = this.FontSelObj.fontEdSubmit();
            PropsObj[_CurProp] = value;
            $curRowInp.val(JSON.stringify(value));
        }
        else if (this.editor === 21)
            PropsObj[_CurProp] = this.MLEObj.get();

        this.OnCXE_OK(PropsObj[_CurProp]);

        this.reDrawRelatedPGrows();
        this.PGobj.OnInputchangedFn.bind(this.PGobj)();
        if ((this.editor > 6 && this.editor < 15) || (this.editor > 15 && this.editor < 15)) {
            let func = this.PGobj.OnChangeExec[_CurProp].bind(PropsObj, this.PGobj);
            func();// call Onchange exec for non inp field CXVEs
        }
    };

    this.CXVE_close = function (e) {
        this.reDrawRelatedPGrows();
    };

    this.reDrawRelatedPGrows = function () {
        var _PropsObj = this.PGobj.PropsObj;
        var curprop = this.PGobj.CurProp;
        var relatedPropNames = this.getRltdNames(curprop);
        relatedPropNames.forEach(function (name, i) {
            var _meta = getObjByval(this.PGobj.Metas, "name", name);
            var trHtml = this.PGobj.getPropertyRowHtml(name, this.PGobj.PropsObj[name], _meta, _meta.options, false, true);
            var $tr = $(trHtml);
            $("#" + this.PGobj.wraperId + " [name=" + name + "Tr]").replaceWith($tr);
            if (_PropsObj[name]) {
                _enumoptions = ["--none--", ..._PropsObj[curprop].$values.map(a => (a.name || a.ColumnName || a.Name))];
                var idx = _enumoptions.indexOf((_PropsObj[name].name || _PropsObj[name].ColumnName || _PropsObj[name].Name));
                if (idx < 0) {
                    idx = 0;
                    $tr.animate({ "opacity": "0" });
                    $tr.animate({ "opacity": "1" });
                }
            }
            $("#" + this.PGobj.wraperId + name).val(idx);
            this.PGobj.postCreateInitFuncs[name]();
            $tr.find('.selectpicker').on('changed.bs.select', this.PGobj.OnInputchangedFn.bind(this.PGobj));
        }.bind(this));
    };

    this.getRltdNames = function (source) {
        var names = [];
        this.PGobj.Metas.forEach(function (meta, i) {
            if (meta.editor === 25 && meta.source === source)
                names.push(meta.name);
        });
        return names;
    };

    this.pgCXEshowCallback = function () {
        var PropsObj = this.getPropsObj();
        $(this.pgCXE_Cont_Slctr + " .CE-add").off("click").click(this.CE_AddFn.bind(this));
        if (this.editor === 11 || this.editor === 18) {
            window.editor.setValue(atob(PropsObj[this.PGobj.CurProp]));
            window.editor.focus();
        }
        else if (this.editor === 7 || this.editor === 22)
            $("#" + this.CEctrlsContId + " .colTile:eq(0)").click();
        else if (this.editor === 16)
            $(".strE-texarea").focus();
    };

    this.pgCXE_BtnClicked = function (e) {
        this.curCXEbtn = $(e.target);
        var visibleModalLength = $('.pgCXEditor-bg').filter(function () { return $(this).css('display') !== 'none'; }).length;
        var right = ((window.screen.availWidth / 4) + -visibleModalLength * 10) + "px";
        if ($(e.target).closest("tr").attr("tr-for") === "23")
            var _meta = this.PGobj.getDictMeta(this.PGobj.PropsObj[this.PGobj.CurProp]);
        else
            var _meta = this.PGobj.Metas;

        $(this.pgCXE_Cont_Slctr).css("right", right);
        $(this.pgCXE_Cont_Slctr).css("top", (14 + visibleModalLength + "vh"));
        this.editor = parseInt(e.target.getAttribute("editor"));
        this.PGobj.CurProp = e.target.getAttribute("for");
        this.CurProplabel = getObjByval(_meta, "name", this.PGobj.CurProp).alias || this.PGobj.CurProp;
        //this.CurProplabel = getObjByval(this.PGobj.Metas, "name", this.PGobj.CurProp).alias || this.PGobj.CurProp;
        if (!(this.editor === 17 || this.editor === 14 || this.editor === 21))
            $("#" + this.PGobj.wraperId + " .pgCXEditor-bg").show(450, this.pgCXEshowCallback.bind(this));
        $(this.pgCXE_Cont_Slctr + " .modal-footer .modal-footer-body").empty();
        //this.CurEditor = getObjByval(this.PGobj.Metas, "name", this.PGobj.CurProp).editor;
        if (this.editor > 6 && this.editor < 11 || this.editor === 22 || this.editor === 24)
            this.initCE();
        else if (this.editor === 11)// JS
            this.initJE();
        else if (this.editor === 13)
            this.initOSE();
        else if (this.editor === 14)
            this.initFE(e);
        else if (this.editor === 16)// string
            this.initStrE();
        else if (this.editor === 18)// CS
            this.initCSE();
        else if (this.editor === 21)
            this.initMLE(e);

        $(this.pgCXE_Cont_Slctr + " .modal-title").text(this.CurProplabel + ": " + this.curEditorLabel);
        if (this.editor !== 8)
            $("#" + this.CEctrlsContId).off("click", ".colTile").on("click", ".colTile", this.colTileFocusFn.bind(this));
        $("#" + this.PGobj.wraperId + ' .modal-footer').off("click", "[name=CXE_OK]").on("click", "[name=CXE_OK]", this.CXE_OKclicked.bind(this));
        $("#" + this.PGobj.wraperId + ' .modal-header').off("click", ".close").on("click", ".close", this.CXVE_close.bind(this));


        if (this.PGobj.IsReadonly)
            this.PGobj.ReadOnly();
        else
            this.PGobj.ReadWrite();
    };

    this.initFE = function (e) {
        var contId = "fs_" + this.PGobj.wraperId;
        $(`#${contId}fontEditor`).remove();
        this.FontSelObj = new FontEditor({
            ContainerId: contId,
            ToggleId: e.target.getAttribute("name")
        }, this.PGobj.PropsObj[this.PGobj.CurProp]);
    };

    this.initMLE = function (e) {
        var contId = "mls_" + this.PGobj.wraperId;
        $(`#ML_Modal_${contId}`).remove();

        this.MLEObj = new MultiLanguageKeySelector({
            ContainerId: contId,
            ToggleBtnId: e.target.getAttribute("name"),
            KeyTxtId: $(e.target).prev().attr("id")
        }, this.PGobj.PropsObj[this.PGobj.CurProp]);

    };

    this.initStrE = function () {
        this.curEditorLabel = "String Editor";
        var PropsObj = this.getPropsObj();
        var StrEbody = '<textarea id="StrE_txtEdtr' + this.PGobj.wraperId + '" class="strE-texarea" rows="15" cols="85">' + (PropsObj[this.PGobj.CurProp] || "") + '</textarea>';
        $(this.pgCXE_Cont_Slctr + " .modal-body").html(StrEbody);
    };

    this.initCE = function () {
        this.curEditorLabel = "Collection Editor";
        var CEbody = `<div class="CE-body">
            <table class="table table-bordered editTbl">
            <tbody>
            <tr>

            <td style="padding: 0px;">
            <div class="CE-controls-head">${this.CurProplabel}</div>
            <div id="${this.CE_all_ctrlsContId}" class="CE-all-ctrlsCont"></div>
            </td>

            <td style="padding: 0px;">
            <div class="CE-controls-head" > Selected </div>
            <div id="${this.CEctrlsContId}" class="CEctrlsCont"></div>
            </td>

            <td style="padding: 0px;"><div id="${this.PGobj.wraperId}_InnerPG" class="inner-PG-Cont"><div></td>
            </tr>
            </tbody>
            </table>
            </div>`;
        $(this.pgCXE_Cont_Slctr + " .modal-body").html(CEbody);

        if (this.editor === 7 || this.editor === 22) {
            this.initHelper7_22();
        }
        else if ((this.editor > 7 && this.editor < 11) || this.editor === 24) {
            var sourceProp = getObjByval(this.PGobj.Metas, "name", this.PGobj.CurProp).source;
            this.CEHelper(sourceProp);
        }
        this.drake = new dragula([document.getElementById(this.CEctrlsContId), document.getElementById(this.CE_all_ctrlsContId)], { accepts: this.acceptFn.bind(this), moves: function (el, container, handle) { return !this.PGobj.IsReadonly }.bind(this) });
        this.drake.on("drag", this.onDragFn.bind(this));
        this.drake.on("dragend", this.onDragendFn.bind(this));
    };

    this.initHelper7_22 = function () {
        var DD_html = `<div class="sub-controls-DD-cont pull-left"> <select class="selectpicker"> </select> <button type="button" class="CE-add" ><i class="fa fa-plus" aria-hidden="true"></i></button> </div>`;
        var sourceProp = getObjByval(this.PGobj.Metas, "name", this.PGobj.CurProp).source;
        if (sourceProp)
            getObjByval(this.PGobj.Metas, "name", sourceProp).source = this.PGobj.CurProp;
        $(this.pgCXE_Cont_Slctr + " .modal-body td:eq(0)").hide();
        $(this.pgCXE_Cont_Slctr + " .modal-footer .modal-footer-body").append(DD_html);
        $(this.pgCXE_Cont_Slctr + " .modal-body td:eq(1) .CE-controls-head").text((getObjByval(this.PGobj.Metas, "name", this.PGobj.CurProp).alias || this.PGobj.CurProp));

        if (this.PGobj.CurProp === "Controls") {/////////////////////////need CE test and correction
            this.CElist = this.PGobj.PropsObj.Controls.$values;
        }
        else {
            this.CElist = this.PGobj.PropsObj[this.PGobj.CurProp].$values;
        }
        //this.CE_PGObj = new Eb_PropertyGrid(this.PGobj.wraperId + "_InnerPG", null, null, this.PGobj);

        this.CE_PGObj = new Eb_PropertyGrid({
            id: this.PGobj.wraperId + "_InnerPG",
            wc: this.PGobj.wc,
            cid: this.PGobj.cid,
            $extCont: $(".property-grid-cont"),
            IsInnerCall: true
        }, this.PGobj);

        this.CE_PGObj.IsReadonly = this.PGobj.IsReadonly;
        this.CE_PGObj.parentId = this.PGobj.wraperId;
        this.setColTiles();
        this.setObjTypeDD();
    };

    this.CEHelper = function (sourceProp) {
        this.Dprop = getObjByval(this.PGobj.Metas, "name", this.PGobj.CurProp).Dprop;
        this.allCols = this.PGobj.PropsObj[sourceProp].$values;
        if (this.editor === 8) {
            this.selectedCols = this.PGobj.PropsObj[this.PGobj.CurProp].$values;
            this.changeCopyToRef();
            $(this.pgCXE_Cont_Slctr + " .modal-body td:eq(2)").hide();
        }
        else if (this.editor === 10) {
            $(this.pgCXE_Cont_Slctr + " .modal-body td:eq(1)").hide();
            $("#" + this.CE_all_ctrlsContId).off("click", ".colTile").on("click", ".colTile", this.colTileFocusFn.bind(this));
        }
        else if (this.editor === 24)
            this.selectedCols = this.getSelectedColsByProp(this.allCols);
        else
            this.selectedCols = this.PGobj.PropsObj[this.PGobj.CurProp].$values;
        this.set9ColTiles(this.CE_all_ctrlsContId, this.allCols);
        this.setSelColtiles();
        //this.CE_PGObj = new Eb_PropertyGrid(this.PGobj.wraperId + "_InnerPG");
        if (this.editor !== 8) {
            this.CE_PGObj = new Eb_PropertyGrid({
                id: this.PGobj.wraperId + "_InnerPG",
                IsInnerCall: true
            });
        }
    };

    this.getSelectedColsByProp = function (allCols) {
        var res = [];
        $.each(allCols, function (i, obj) {
            if (obj[this.Dprop] === true)// hard code
                res.push(obj);
        }.bind(this));
        return res;
    };

    this.acceptFn = function (el, target, source, sibling) { return !(source.id === this.CE_all_ctrlsContId && target.id === this.CE_all_ctrlsContId && this.editor !== 10) && !this.PGobj.IsReadonly; };

    this.onDragFn = function (el, source) {
        $(':focus').blur();
        if (source.id !== this.CE_all_ctrlsContId) {// target 2nd source
            if (this.editor === 7)
                this.movingObj = this.CElist.splice(this.CElist.indexOf(getObjByval(this.CElist, "EbSid", el.id)), 1)[0];
            else if (this.editor === 9 || this.editor === 8)
                this.movingObj = this.selectedCols.splice(this.selectedCols.indexOf(getObjByval(this.selectedCols, "name", el.id)), 1)[0];
            else if (this.editor === 24)
                this.movingObj = getObjByval(this.allCols, "name", el.id);
        }
        else {
            if (this.editor === 9 || this.editor === 8 || this.editor === 24)
                this.movingObj = getObjByval(this.allCols, "name", el.id);
            else if (this.editor === 10)
                this.movingObj = this.allCols.splice(this.allCols.indexOf(getObjByval(this.allCols, "name", el.id)), 1)[0];
            else
                this.movingObj = null;
        }
    };

    this.onDragendFn = function (el) {
        var sibling = $(el).next();
        var target = $(el).parent()[0];
        var idx = sibling.index() - 1;
        if (target.id !== this.CE_all_ctrlsContId) {// target 2nd column
            if (this.editor === 7) {
                if (sibling.length > 0)
                    this.CElist.splice(idx, 0, this.movingObj);
                else
                    this.CElist.push(this.movingObj);
            } else if (this.editor === 9 || this.editor === 8) {
                if (sibling.length > 0)
                    this.selectedCols.splice(idx, 0, this.movingObj);
                else
                    this.selectedCols.push(this.movingObj);
            } else if (this.editor === 24) {
                this.movingObj[this.Dprop] = true;//////// hard code
                this.movingObj = this.allCols.splice(this.allCols.indexOf(getObjByval(this.allCols, "name", el.id)), 1)[0];
                if (sibling.length > 0)
                    this.allCols.splice(idx, 0, this.movingObj);
                else
                    this.allCols.push(this.movingObj);
            }
        }
        else if (this.editor === 10) {
            if (sibling.length > 0)
                this.allCols.splice(idx, 0, this.movingObj);
            else
                this.allCols.push(this.movingObj);
        }
        else if (this.editor === 24) {
            this.movingObj[this.Dprop] = false;//////// hard code
        }
        $(el).off("click", ".close").on("click", ".close", this.colTileCloseFn);
    };

    this.initCSE = function () {
        this.curEditorLabel = "C# Script Editor";
        var JEbody = '<textarea id="CSE_txtEdtr' + this.PGobj.wraperId + '" rows="12" cols="40" ></textarea>'
        $(this.pgCXE_Cont_Slctr + " .modal-body").html(JEbody);
        CodeMirror.commands.autocomplete = function (cm) { CodeMirror.showHint(cm, CodeMirror.hint.anyword); };
        window.editor = CodeMirror.fromTextArea(document.getElementById('CSE_txtEdtr' + this.PGobj.wraperId), {
            mode: "text/x-csharp",
            lineNumbers: true,
            lineWrapping: true,
            matchBrackets: true,
            extraKeys: { "Ctrl-Space": "autocomplete" },
            foldGutter: { rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.brace, CodeMirror.fold.comment) },
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });
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
        var OSEbody = `<div class="OSE-body">
            <table class="table table-bordered editTbl">
            <tbody>
            <tr>
            <td style="padding: 0px;">
            <div class="OSE-DD-cont" > 
            <select class="selectpicker">
            </select>
            </div>
            <div class="OSEctrlsCont"> </div>
            </td>
            <td style="padding: 0px;">
            <div class="CE-controls-head"> Versions </div>
            <div class="OSE-verTile-Cont"> </div>
            </td>
            </tr>
            </tbody>
            </table>
            </div>`;
        $(this.pgCXE_Cont_Slctr + " .modal-body").html(OSEbody);
        var options = "";
        var ObjTypes = getObjByval(this.PGobj.Metas, "name", this.PGobj.CurProp).options;
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
                data: { type: $selectedOpt.attr("obj-type") },
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
        if ($(this.pgCXE_Cont_Slctr + " .modal-footer .searchinp").length === 0) {
            $(this.pgCXE_Cont_Slctr + " .modal-footer .modal-footer-body").append('<input class="searchinp" placeholder="🔎 Search object..." type="text"/>');
            $(this.pgCXE_Cont_Slctr + " .modal-footer .searchinp").off("keyup").on("keyup", this.searchObj);
        }
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
        $(this.pgCXE_Cont_Slctr + " .modal-footer .searchinp").focus();
    }.bind(this);

    this.searchObj = function (event) {
        var $e = $(event.target);
        $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .colTile").each(function (i, o) {
            if (0 > $(o).text().toLocaleLowerCase().search($e.val().toLocaleLowerCase()))
                $(this).hide();
            else
                $(this).show();
        });
        $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .Otile-active").focus();
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
        $("#" + this.PGobj.wraperId + " .OSE-body .colTile").removeClass("Otile-active");
        $e.addClass("Otile-active");
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
        if (this.Dprop && this.allCols.length === 0) {
            $(this.pgCXE_Cont_Slctr + " .modal-body").html("<h4> Set datasource</h4>");
            return;
        }

        var idField = "name";//////////////////////
        if (!(Object.keys(this.allCols[0]).includes("name")))//////////////////
            idField = "ColumnName";////////////////////////
        $.each(values, function (i, control) {
            var name = (control.Name || control.name || control.ColumnName);
            var type = control.$type.split(",")[0].split(".").pop();
            if (!(control.Name || control.name))
                var label = control.EbSid;
            var $tile = $('<div class="colTile" id="' + name + '" eb-type="' + type + '" setSelColtiles><i class="fa fa-arrows" aria-hidden="true" style="padding-right: 5px; font-size:10px;"></i>' + name + '<button type="button" class="close">&times;</button></div>');
            if (!getObjByval(this.selectedCols, idField, control[idField])) {
                $("#" + containerId).append($tile);// 1st column
            } else {
                if (containerId === this.CEctrlsContId)
                    $("#" + this.CEctrlsContId).append($tile);// 2nd column
            }
        }.bind(this));
        $("#" + this.CEctrlsContId + " .colTile").off("click", ".close").on("click", ".close", this.colTileCloseFn);
    };

    this.setSelColtiles = function () {
        var idField = "name";//////////////////////
        var selObjs = [];
        if (this.selectedCols.length !== 0) {
            if (!(Object.keys(this.allCols[0]).includes("name")))//////////////////
                idField = "ColumnName";////////////////////////
            $.each(this.selectedCols, function (i, ctrl) {
                selObjs.push(getObjByval(this.allCols, idField, ctrl[idField]));
            }.bind(this));
            this.set9ColTiles(this.CEctrlsContId, selObjs);
        }
    };

    this.setColTiles = function () {
        $("#" + this.CEctrlsContId).empty();
        var SubTypes = getObjByval(this.PGobj.Metas, "name", this.PGobj.CurProp).options;
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
        }
        $("#" + this.CEctrlsContId).off("click", ".close").on("click", ".close", this.colTileCloseFn);
    };

    this.setObjTypeDD = function () {
        var options = "";
        var SubTypes = getObjByval(this.PGobj.Metas, "name", this.PGobj.CurProp).options;
        if (SubTypes) {
            for (var i = 0; i < SubTypes.length; i++) {
                var ObjName = SubTypes[i].split("-/-")[0]; var DispName = SubTypes[i].split("-/-")[1];
                options += '<option value=' + ObjName + '>' + DispName + '</option>'
            }
            $(this.pgCXE_Cont_Slctr + " .modal-footer .selectpicker").empty().append(options).selectpicker('refresh');
        }
    };

    this.colTileCloseFn = function (e) {
        e.stopPropagation();
        var $tile = $(e.target).parent().remove();
        if (this.editor === 7) {
            this.PGobj.removeFromDD.bind(this.PGobj)($tile.attr("id"));
            var DelObj = this.CElist.splice(this.CElist.indexOf(getObjByval(this.CElist, "EbSid", $tile.attr("id"))), 1)[0];
            var sourceProp = getObjByval(this.PGobj.Metas, "name", this.PGobj.CurProp).source;
            if (sourceProp) {
                $.each(this.PGobj.PropsObj[sourceProp].$values, function (i, obj) {
                    $.each(obj, function (prop, val) {
                        if (prop === DelObj.Name)
                            delete obj[prop];
                    });
                });
            }
        }
        else if (this.editor === 9 || this.editor === 8) {
            this.selectedCols.splice(this.selectedCols.indexOf(getObjByval(this.selectedCols, "name", $tile.attr("id"))), 1)[0]
            $("#" + this.CE_all_ctrlsContId).prepend($tile);
        }
        else if (this.editor === 24) {
            getObjByval(this.selectedCols, "name", $tile.attr("id"))[this.Dprop] = false;// hard code
            $("#" + this.CE_all_ctrlsContId).prepend($tile);
        }
    }.bind(this);

    this.colTileFocusFn = function (e) {
        var $e = $(e.target);
        var id = $e.attr("id");
        $(':focus').blur();
        if (!$e.hasClass("colTile")) {
            this.colTileFocusFn.bind(this)({ target: $e.parent() });
            return 0;
        }
        var obj = null;
        var type = $e.attr("eb-type");
        $("#" + this.PGobj.wraperId + " .CE-body .colTile").removeAttr("style");
        $e.css("background-color", "#b1bfc1").css("color", "#222").css("border", "solid 1px #b1bfc1");
        if (this.editor === 7) {
            if (this.PGobj.CurProp === "Controls")///////////////////////need CE test and correction
                obj = this.PropsObj.Controls.GetByName(id);
            else
                obj = this.PGobj.PropsObj[this.PGobj.CurProp].$values.filter(function (obj) { return obj.EbSid === $e.attr("id"); })[0];/////////// optimize
        }
        else if (this.editor === 9 || this.editor === 10 || this.editor === 24) {
            obj = getObjByval(this.PGobj.PropsObj[this.PGobj.CurProp].$values, "name", id);
        }
        else if (this.editor === 22) {
            obj = getObjByval(this.PGobj.PropsObj[this.PGobj.CurProp].$values, "EbSid", id);
        }

        this.CE_PGObj.setObject(obj, AllMetas[type]);
    };

    this.getPropsObj = function () {
        var isDictSubProp = this.curCXEbtn.closest("tr").attr("tr-for") === "23";
        return isDictSubProp ? this.PGobj.PropsObj["CustomFields"].$values : this.PGobj.PropsObj;
    };

    this.CE_AddFn = function () {
        var $DD = $(this.pgCXE_Cont_Slctr + " .modal-footer .sub-controls-DD-cont").find("option:selected");
        var SelType = $DD.val();
        var lastItemCount = (this.CElist.length === 0) ? -1 : parseInt(this.CElist[this.CElist.length - 1].EbSid.slice(-3).replace(/[^0-9]/g, ''));
        var ShortName = $DD.text() + (lastItemCount + 1);
        var EbSid = this.PGobj.PropsObj.EbSid + "_" + ShortName;
        if (this.PGobj.CurProp === "Controls") {////////////// need CE test and correction
            this.PGobj.PropsObj.Controls.$values.push(new EbObjects[SelType](EbSid));
        }
        else {
            var obj = new EbObjects[SelType](EbSid);
            obj.Name = ShortName;
            this.PGobj.PropsObj[this.PGobj.CurProp].$values.push(obj);
        }
        this.setColTiles();
        $("#" + EbSid).click();
    };

    this.changeCopyToRef = function () {
        $.each(this.allCols, function (i, colObj) {
            var RObj;
            if (RObj = getObjByval(this.selectedCols, "name", colObj.name)) {
                if (RObj === colObj)/// if already reference exit
                    return false;
                var idx = this.selectedCols.indexOf(RObj);
                this.selectedCols[idx] = colObj;
            };
        }.bind(this));
    };

    this.Init = function () {
        var CXVE_html = '<div class="pgCXEditor-bg">'
            + `<div class="pgCXEditor-Cont" style="width:${window.screen.availWidth / 2}px;right:${window.screen.availWidth / 4}px;">`

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

        $(this.PGobj.$wraper).append('<div id="mb_' + this.PGobj.wraperId + '"> </div><div id="fs_' + this.PGobj.wraperId + '"> </div>');
        $(this.PGobj.$wraper).append('<div id="mb_' + this.PGobj.wraperId + '"> </div><div id="mls_' + this.PGobj.wraperId + '"> </div>');
    }
    this.Init();
};