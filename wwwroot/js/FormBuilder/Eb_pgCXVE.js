const Eb_pgCXVE = function (pgObj) {

    //let AllMetas = AllMetasRoot["EbObject"];// newly added line to declare a local variable named "AllMetas"  which contains contextaul metas

    this.PGobj = pgObj;
    this.CE_PGObj = {};
    this.pgCXE_Cont_Slctr = "#" + this.PGobj.wraperId + " .pgCXEditor-Cont";
    this.CEctrlsContId = this.PGobj.wraperId + "_CEctrlsCont";
    this.CE_all_ctrlsContId = this.PGobj.wraperId + "_CE_all_ctrlsCont";
    this.CE_mapper_ctrlsContId = this.PGobj.wraperId + "_CE_mapper_ctrlsCont";
    this.modalBg_Slctr = "#" + this.PGobj.wraperId + " .pgCXEditor-bg";
    this.OnCXE_OK = function (obj) { };
    this.OSE_curTypeObj = null;
    this.onAddToCE = function () { };
    this.onRemoveFromCE = function () { };
    this.CElist = [];
    this.editor = null;

    this.CXE_OKclicked = function () {
        let _CurProp = this.PGobj.CurProp;
        this.PGobj.CurMeta = getObjByval(this.PGobj.Metas, "name", _CurProp);
        let value = "";
        let PropsObj = this.getPropsObj();
        let $curRowInp = $("#" + this.PGobj.wraperId + " [name=" + _CurProp + "Tr] input");
        if (this.editor === 11 || this.editor === 16 || this.editor === 18 || this.editor > 63) {// script editors
            if (this.editor === 16) {
                value = $(`#StrE_txtEdtr${this.PGobj.wraperId}`).val();
                PropsObj[_CurProp] = value;
            }
            else if (this.editor === 11 || this.editor === 18 || this.editor > 63) {
                value = window.editor.getValue();
                PropsObj[_CurProp].Code = btoa(value);
                if (!(this.editor === 64 || this.editor === 128 || this.editor === 256))
                    PropsObj[_CurProp].Lang = parseInt($("#editorsel").find("option:selected").attr('type'));
                else
                    PropsObj[_CurProp].Lang = this.singleScrType;
            }
            $("#" + this.PGobj.wraperId + " [name=" + _CurProp + "Tr] .pgTdval").attr("title", value);
        }
        else if (this.editor === 17) {
            value = this.PGobj.ImgSlctrs[_CurProp].getFileRef();
            PropsObj[_CurProp] = value;
            $curRowInp.val(value);
        }
        else if (this.editor === 14) {
            value = this.FontSelObj.fontEdSubmit();
            PropsObj[_CurProp] = value;
            $curRowInp.val(JSON.stringify(value));
        }
        else if (this.editor === 37) {
            let icon = $("#icon_picker .form-control.search-control").val();
            PropsObj[_CurProp] = icon;
            $(`#${this.PGobj.wraperId}${_CurProp}`).val(icon);
        }
        else if (this.editor === 38) {
            let shadowVal = $("#shadow_editor_val").val();
            PropsObj[_CurProp] = shadowVal;
            $(`#${this.PGobj.wraperId}${_CurProp}`).val(shadowVal);
        }
        else if (this.editor === 40) {
            let GcpVal = $("#gradient_editor_val").val();
            PropsObj[_CurProp] = GcpVal;
            $(`#${this.PGobj.wraperId}${_CurProp}`).val(GcpVal);
        }
        else if (this.editor === 21)
            PropsObj[_CurProp] = this.MLEObj.get();

        this.OnCXE_OK(PropsObj[_CurProp]);
        this.PGobj.OnInputchangedFn.bind(this.PGobj)();
        if ((this.editor > 6 && this.editor < 15) || (this.editor > 15 && this.editor < 15) || this.editor < 36) {
            let func = this.PGobj.OnChangeExec[_CurProp];
            if (func) {
                func.bind(PropsObj, this.PGobj)();// call Onchange exec for non inp field CXVEs
            }
        }
        this.CXVE_close();
    };

    this.CXVE_close = function (e) {
        $(this.modalBg_Slctr).hide(500);
        this.PGobj.isModalOpen = false;
        this.reDrawRelatedPGrows();
    };

    this.reDrawRelatedPGrows = function () {
        let _PropsObj = this.PGobj.PropsObj;
        let curprop = this.PGobj.CurProp;
        let relatedPropNames = this.getRltdNames(curprop);
        relatedPropNames.forEach(function (name, i) {
            let _meta = getObjByval(this.PGobj.Metas, "name", name);
            let trHtml = this.PGobj.getPropertyRowHtml(name, this.PGobj.PropsObj[name], _meta, _meta.options, false, true);
            let $tr = $(trHtml);
            $("#" + this.PGobj.wraperId + " [name=" + name + "Tr]").replaceWith($tr);
            if (_PropsObj[name]) {
                _enumoptions = ["--none--", ..._PropsObj[curprop].$values.map(a => (a.name || a.ColumnName || a.Name))];
                let idx = _enumoptions.indexOf((_PropsObj[name].name || _PropsObj[name].ColumnName || _PropsObj[name].Name));
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
        let names = [];
        this.PGobj.Metas.forEach(function (meta, i) {
            if (meta.editor === 25 && meta.source === source)
                names.push(meta.name);
        });
        return names;
    };

    this.pgCXEshowCallback = function () {
        let PropsObj = this.getPropsObj();
        $(this.pgCXE_Cont_Slctr + " .CE-add").off("click").click(this.CE_AddFn.bind(this));
        if (this.editor === 11 || this.editor === 18 || this.editor > 63) {
            if (!(this.editor === 64 || this.editor === 128 || this.editor === 256)) {// if multi language
                $("#editorsel").selectpicker('val', $("#editorsel").find("[type=" + PropsObj[this.PGobj.CurProp].Lang + "]").text());// set select
                this.editorSelChange({ target: $("#editorsel")[0] });// force invoke select change event
            }
            let value = PropsObj[this.PGobj.CurProp].Code === null ? "" : PropsObj[this.PGobj.CurProp].Code;
            window.editor.setValue(atob(value));
            window.editor.focus();
        }
        else if (this.editor === 7 || this.editor === 22 || this.editor === 26) {
            this.$colTile2Focus = $("#" + this.CEctrlsContId + " .colTile:eq(0)");
            if (this.colTile2FocusSelec) {
                this.$colTile2Focus = $(this.colTile2FocusSelec);
            }
            this.$colTile2Focus.click();
            this.colTile2FocusSelec = null;
            this.$colTile2Focus = null;
        }
        else if (this.editor === 16)
            $(".strE-texarea").focus();
    };

    this.pgCXE_BtnClicked = function (e) {
        this.PGobj.isModalOpen = true;
        //this.PGobj.CurProp = $(e.target).closest(".pgCX-Editor-Btn").attr("for");
        this.PGobj.CurProp = e.target.getAttribute("for");
        this.CurMeta = getObjByval(this.PGobj.Metas, "name", this.PGobj.CurProp);
        this.curCXEbtn = $(e.target);
        let _meta = null;
        let visibleModalLength = $('.pgCXEditor-bg').filter(function () { return $(this).css('display') !== 'none'; }).length;
        let right = (this.modalRight + -visibleModalLength * 10) + "px";
        if ($(e.target).closest("tr").attr("tr-for") === "23")
            _meta = this.PGobj.getDictMeta(this.PGobj.PropsObj[this.PGobj.CurProp]);
        else
            _meta = this.PGobj.Metas;

        $(this.pgCXE_Cont_Slctr).css("right", right);
        $(this.pgCXE_Cont_Slctr).css("top", (this.modalTop + visibleModalLength * 7 + "px"));
        this.editor = parseInt(e.target.getAttribute("editor"));
        this.CurProplabel = getObjByval(_meta, "name", this.PGobj.CurProp).alias || this.PGobj.CurProp;
        //this.CurProplabel = this.CurMeta.alias || this.PGobj.CurProp;
        if (!(this.editor === 17 || this.editor === 14 || this.editor === 21))
            $(this.modalBg_Slctr).show(450, this.pgCXEshowCallback.bind(this));
        if (this.editor === 17)
            this.PGobj.ImgSlctrs[this.PGobj.CurProp].toggleM();

        $(this.pgCXE_Cont_Slctr + " .modal-footer .modal-footer-body").empty();
        //this.CurEditor = this.CurMeta.editor;
        if (this.editor > 6 && this.editor < 11 || this.editor === 22 || this.editor === 24 || this.editor === 26 || this.editor === 27 || this.editor === 35)
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
        else if (this.editor === 36)
            this.initOSCE();
        else if (this.editor === 37)
            this.initIconSelector();
        else if (this.editor === 38)
            this.initShadowEditor();
        else if (this.editor === 40)
            this.initGradientColorPicker();
        else if (this.editor > 63) {
            this.initScrE(e);
        }

        if (this.editor < 64 || this.editor === 64 || this.editor === 128 || this.editor === 156)
            $(this.pgCXE_Cont_Slctr + " .modal-title").text(this.CurProplabel + ": " + this.curEditorLabel);

        if (this.editor !== 8)
            $("#" + this.CEctrlsContId).off("click", ".colTile").on("click", ".colTile", this.colTileClickFn.bind(this));
        if (this.editor === 35)
            $("#" + this.CE_mapper_ctrlsContId).off("click", ".mapper-ColTile").on("click", ".mapper-ColTile", this.mapperColTileClickFn.bind(this));
        $("#" + this.PGobj.wraperId + ' .modal-footer').off("click", "[name=CXE_OK]").on("click", "[name=CXE_OK]", this.CXE_OKclicked.bind(this));
        $("#" + this.PGobj.wraperId + ' .modal-header').off("click", ".close").on("click", ".close", this.CXVE_close.bind(this));


        if (this.PGobj.IsReadonly)
            this.PGobj.ReadOnly();
        else
            this.PGobj.ReadWrite();
    };

    this.initFE = function (e) {
        let contId = "fs_" + this.PGobj.wraperId;
        $(`#${contId}fontEditor`).remove();
        this.FontSelObj = new FontEditor({
            ContainerId: contId,
            ToggleId: e.target.getAttribute("name")
        }, this.PGobj.PropsObj[this.PGobj.CurProp]);
    };

    this.initMLE = function (e) {
        let contId = "mls_" + this.PGobj.wraperId;
        $(`#ML_Modal_${contId}`).remove();

        this.MLEObj = new MultiLanguageKeySelector({
            ContainerId: contId,
            ToggleBtnId: e.target.getAttribute("name"),
            KeyTxtId: $(e.target).prev().attr("id")
        }, this.PGobj.PropsObj[this.PGobj.CurProp]);

    };

    this.initStrE = function () {
        this.curEditorLabel = "String Editor";
        let PropsObj = this.getPropsObj();
        let StrEbody = '<textarea id="StrE_txtEdtr' + this.PGobj.wraperId + '" class="strE-texarea" rows="15" cols="85">' + (PropsObj[this.PGobj.CurProp] || "") + '</textarea>';
        $(this.pgCXE_Cont_Slctr + " .modal-body").html(StrEbody);
    };

    this.initCE = function () {
        this.curEditorLabel = "Collection Editor";
        let $CEbody = $(`<div pg-editor-type="${this.editor}" class="CE-body">
            <table class="table table-bordered editTbl">
            <tbody>
            <tr>

            <td style="padding: 0px;">
            <div class="CE-controls-head"> All </div>
            <div id="${this.CE_all_ctrlsContId}" class="CE-all-ctrlsCont"></div>
            </td>

            <td style="padding: 0px;">
            <div class="CE-controls-head" > ${this.CurProplabel} </div>
            <div id="${this.CEctrlsContId}" class="CEctrlsCont"></div>
            </td>

            <td style="padding: 0px;"><div id="${this.PGobj.wraperId}_InnerPG" class="inner-PG-Cont"><div></td>
            </tr>
            </tbody>
            </table>
            </div>`);
        $(this.pgCXE_Cont_Slctr + " .modal-body").html($CEbody);
        if ($(".editTbl>tbody>tr>td:visible").length === 3)
            $CEbody.find(".editTbl>tbody>tr>td:last").css("width", "44%");

        if (this.editor === 7 || this.editor === 22) {
            this.initHelper7_22();
        }
        else if ((this.editor > 7 && this.editor < 11) || this.editor === 24 || this.editor === 26 || this.editor === 27 || this.editor === 35) {
            let sourceProp = this.CurMeta.source;

            this.CEHelper(sourceProp);
        }
        this.drake = new dragula([document.getElementById(this.CEctrlsContId), document.getElementById(this.CE_all_ctrlsContId)], { accepts: this.acceptFn.bind(this), moves: function (el, container, handle) { return !this.PGobj.IsReadonly }.bind(this) });
        this.drake.on("drag", this.onDragFn.bind(this));
        this.drake.on("dragend", this.onDragendFn.bind(this));
    };

    this.initHelper7_22 = function () {
        let sourceProp = this.CurMeta.source;
        if (sourceProp)
            getObjByval(this.PGobj.Metas, "name", sourceProp).source = this.PGobj.CurProp;
        $(this.pgCXE_Cont_Slctr + " .modal-body td:eq(0)").hide();
        $(this.pgCXE_Cont_Slctr + " .modal-body td:eq(1) .CE-controls-head").text((this.CurMeta.alias || this.PGobj.CurProp));
        this.CElist = this.PGobj.PropsObj[this.PGobj.CurProp].$values;
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

    this.getCElistFromFn = function (sourceProp) {
        let _CElistFromFn = new Function("form", "user", `event`, sourceProp).bind(this)();
        return _CElistFromFn;
    };

    this.getCElistFromSrc = function (sourceProp) {
        let CurlevelObj = this.PGobj;
        let hierarchyLevel = (sourceProp.match(/Parent./g) || []).length;
        if (hierarchyLevel > 0) {
            for (var i = 0; i < hierarchyLevel; i++) {
                CurlevelObj = CurlevelObj.ParentPG;
            }
        }
        let _CElistFromSrc = CurlevelObj.PropsObj[sourceProp.replace(/Parent./g, "")].$values;
        return _CElistFromSrc;
    };

    this.buildMapObjList = function (data) {
        this.CE_mapList = data ? JSON.parse(data).$values : this.CE_mapList;
        $.each(this.CE_mapList, function (i, control) {
            let NS1 = control.$type.split(",")[0].split(".");
            let type = NS1[NS1.length - 1];
            let _name = control.Name;
            if (!_name)
                _name = control.EbSid;
            let $tile = $('<div class="colTile mapper-ColTile" id="' + _name + '" ebsid="' + control.EbSid + '" tabindex="1" eb-type="' + type + '">'
                + '<span>' + _name + '</span>'
                + `<i class="fa fa-check-circle mapper-check" aria-hidden="true"></i>`
                + '</div>');
            $("#" + this.CE_mapper_ctrlsContId).append($tile);
            //this.colTileClickFn({ "target": $("#" + control.EbSid).click()[0] });//hack
        }.bind(this));
        $("#" + this.CE_mapper_ctrlsContId).hide();
        $.LoadingOverlay("hide");

    }.bind(this);

    this.setCEMaplistFromSrc = function (mapListSrc) {/////////////
        if (!this.CE_mapList) {
            $.LoadingOverlay("show");
            $.ajax({
                url: "../WebForm/GetFormControlsFlat",
                type: "POST",
                data: { refId: this.PGobj.PropsObj[this.CurMeta.Dprop] },
                success: this.buildMapObjList
            });
        }
        else
            this.buildMapObjList();
    };

    this.CEHelper = function (sourceProp) {
        this.Dprop = this.CurMeta.Dprop;
        this.CurCEOnSelectFn = this.CurMeta.CEOnSelectFn || function () { };
        this.CurCEOndeselectFn = this.CurMeta.CEOnDeselectFn || function () { };

        if (this.CurMeta.source.trimStart().startsWith("return "))
            this.CElistFromSrc = this.getCElistFromFn(sourceProp);
        else
            this.CElistFromSrc = this.getCElistFromSrc(sourceProp);

        if (this.editor === 8 || this.editor === 27 || this.editor === 35) {
            this.selectedCols = this.PGobj.PropsObj[this.PGobj.CurProp].$values;
            this.changeCopyToRef();
            if (this.editor === 8)
                $(this.pgCXE_Cont_Slctr + " .modal-body td:eq(2)").hide();// hide PG
            if (this.editor === 35) {
                let mapListSrc = this.CurMeta.Dprop; // Dprop meta as head
                $(this.pgCXE_Cont_Slctr + " .modal-body td:eq(2)").empty().prepend(`<div class='CE-controls-head'>${this.CurMeta.Dprop2}</div><div id="${this.CE_mapper_ctrlsContId}" class="CE-mapper-ctrlsCont"></div>`);

                this.setCEMaplistFromSrc(mapListSrc);
            }
        }
        else if (this.editor === 10) {
            $(this.pgCXE_Cont_Slctr + " .modal-body td:eq(1)").hide();
            $("#" + this.CE_all_ctrlsContId).off("click", ".colTile").on("click", ".colTile", this.colTileClickFn.bind(this));
        }
        else if (this.editor === 24 || this.editor === 26 || this.editor === 27 || this.editor === 35) {
            if (this.editor === 26) {
                this.setObjTypeDD();
                this.CElist = this.PGobj.PropsObj[this.PGobj.CurProp].$values;
            }
            this.selectedCols = this.getSelectedColsByProp(this.CElistFromSrc);
            //this.selectedCols = [...this.PGobj.PropsObj[this.PGobj.CurProp].$values];
        }
        else
            this.selectedCols = this.PGobj.PropsObj[this.PGobj.CurProp].$values;
        this.set9ColTiles(this.CE_all_ctrlsContId, this.CElistFromSrc);
        this.setSelColtiles();
        //this.CE_PGObj = new Eb_PropertyGrid(this.PGobj.wraperId + "_InnerPG");
        if (this.editor !== 8) {
            this.CE_PGObj = new Eb_PropertyGrid({
                id: this.PGobj.wraperId + "_InnerPG",
                IsInnerCall: true,
                dependedProp: this.CurMeta.Dprop2
            }, this.PGobj);
        }
    };

    this.getSelectedColsByProp = function (allCols) {
        let res = [];
        $.each(allCols, function (i, obj) {
            if (obj[this.Dprop] === true)// hard code
                res.push(obj);
        }.bind(this));
        return res;
    };

    this.checkLimit = function ($e, delay) {
        if (this.CurMeta.Limit !== 0 && this.CurMeta.Limit === this.selectedCols.length) {
            delay = delay || 300;
            $e.css("animation", "vibrate 0.07s infinite 0s linear");
            setTimeout(function () {
                $e.css("animation", "inherit");
            }, delay);
            return true;
        }
        return false;
    };

    this.acceptFn = function (el, target, source, sibling) {
        if (this.checkLimit($(el), 1000))
            return false;
        return !(source.id === this.CE_all_ctrlsContId && target.id === this.CE_all_ctrlsContId && this.editor !== 10) && !this.PGobj.IsReadonly;
    };

    this.onDragFn = function (el, source) {
        $(':focus').blur();
        $(el).find('.close').css("opacity", "0");
        if (source.id !== this.CE_all_ctrlsContId) {// source 2nd
            if (this.editor === 7)
                this.movingObj = this.CElist.splice(this.CElist.indexOf(getObjByval(this.CElist, "EbSid", el.getAttribute("ebsid"))), 1)[0];
            else if (this.editor === 9 || this.editor === 8 || this.editor === 27 || this.editor === 35)
                this.movingObj = this.selectedCols.splice(this.selectedCols.indexOf(getObjByval(this.selectedCols, "name", el.id)), 1)[0];
            else if (this.editor === 24 || this.editor === 26)
                this.movingObj = getObjByval(this.CElistFromSrc, "name", el.id);
        }
        else {// source 1st
            if (this.editor === 9 || this.editor === 8 || this.editor === 24 || this.editor === 26 || this.editor === 27 || this.editor === 35)
                this.movingObj = getObjByval(this.CElistFromSrc, "name", el.id);
            else if (this.editor === 10)
                this.movingObj = this.CElistFromSrc.splice(this.CElistFromSrc.indexOf(getObjByval(this.CElistFromSrc, "name", el.id)), 1)[0];
            else
                this.movingObj = null;
        }
    };

    this.CEOnSelectFn = function (obj) {
        if (this.CurCEOnSelectFn)
            this.CurCEOnSelectFn.bind(obj, this.PGobj.PropsObj)();
    };

    this.CEOnDeselectFn = function (obj) {
        if (this.CurCEOndeselectFn)
            this.CurCEOndeselectFn.bind(obj, this.PGobj.PropsObj)();
    };

    this.onDragendFn = function (el) {
        $e = $(el);
        $e.find('.close').css("opacity", "0.2");
        let $sibling = $e.next();
        let target = $e.parent()[0];
        let idx = $sibling.index() - 1;
        if (target.id !== this.CE_all_ctrlsContId) {// target 2nd column
            if (this.editor === 7) {
                if ($sibling.length > 0)
                    this.CElist.splice(idx, 0, this.movingObj);
                else
                    this.CElist.push(this.movingObj);
            } else if (this.editor === 9 || this.editor === 8 || this.editor === 27 || this.editor === 35) {
                if ($sibling.length > 0)
                    this.selectedCols.splice(idx, 0, this.movingObj);
                else
                    this.selectedCols.push(this.movingObj);
            } else if (this.editor === 24 || this.editor === 26) {
                this.movingObj[this.Dprop] = true;
                idx = this.CElistFromSrc.indexOf(getObjByval(this.CElistFromSrc, "name", $sibling.attr("id")));
                this.movingObj = this.CElistFromSrc.splice(this.CElistFromSrc.indexOf(getObjByval(this.CElistFromSrc, "name", el.id)), 1)[0];
                if ($sibling.length > 0)
                    this.CElistFromSrc.splice(idx, 0, this.movingObj);
                else
                    this.CElistFromSrc.push(this.movingObj);
            }
            this.CEOnSelectFn(this.movingObj);
        }// target 1st column
        else {
            if (this.editor === 10) {
                if ($sibling.length > 0)
                    this.CElistFromSrc.splice(idx, 0, this.movingObj);
                else
                    this.CElistFromSrc.push(this.movingObj);
            }
            else if (this.editor === 24 || this.editor === 26) {
                this.movingObj[this.Dprop] = false;
                this.selectedCols.splice(this.selectedCols.indexOf(getObjByval(this.selectedCols, "name", el.id)), 1);
            }
            this.CEOnDeselectFn(this.movingObj, el);
        }
        $(el).off("click", ".coltile-delete").off("click", ".coltile-delete").on("click", ".coltile-delete", this.colTileDel);
        $(el).off("click", ".coltile-left-arrow").on("click", ".coltile-left-arrow", this.colTileLeftArrow);
        $(el).off("click", ".coltile-right-arrow").on("click", ".coltile-right-arrow", this.colTileRightArrow);
    };

    this.ScrEHelper = function (label, idPrefix, mode, hint) {
        this.curEditorLabel = label;
        let JEbody = '<textarea id="' + idPrefix + this.PGobj.wraperId + '" rows="12" cols="40" ></textarea>';
        $(this.pgCXE_Cont_Slctr + " .modal-body").html(JEbody);
        CodeMirror.commands.autocomplete = function (cm) { CodeMirror.showHint(cm, CodeMirror.hint[hint]); };
        window.editor = CodeMirror.fromTextArea(document.getElementById(idPrefix + this.PGobj.wraperId), {
            mode: mode,
            lineNumbers: true,
            lineWrapping: true,
            matchBrackets: true,
            extraKeys: { "Ctrl-Space": "autocomplete" },
            foldGutter: { rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.brace, CodeMirror.fold.comment) },
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });
    };

    this.initScrE = function (e) {
        this.singleScrType = 0;
        if (this.editor === 64) {
            this.singleScrType = 0;
            this.initJE();
            return;
        }
        else if (this.editor === 128) {
            this.singleScrType = 1;
            this.initCSE();
            return;
        }
        else if (this.editor === 256) {
            this.singleScrType = 2;
            ;
            return;
        }
        let options = "";
        if (this.editor & 64)
            options += "<option mode='javascript' type='0' hint='javascript' >Javascript</option>";
        if (this.editor & 128)
            options += "<option mode='text/x-csharp' type='1' hint='anyword'>C# Script</option>";
        if (this.editor & 256)
            options += "<option mode='text/x-plsql'  type='2' hint='sql'>SQL</option>";
        this.ScrEHelper("Javascript Editor", 'JE_txtEdtr', "javascript", "javascript");
        $("#editorsel").empty();
        $(this.pgCXE_Cont_Slctr + " .modal-title").html(this.CurProplabel + ": " + "<select id='editorsel' class='selectpicker'>" + options + "</select>");
        $("#editorsel").selectpicker('refresh');
        $("#editorsel").selectpicker().on('changed.bs.select', this.editorSelChange.bind(this));
    };

    this.editorSelChange = function (e, clickedIndex, isSelected, previousValue) {
        let hint = $(e.target).find("option:selected").attr('hint');
        let mode = $(e.target).find("option:selected").attr('mode');

        CodeMirror.commands.autocomplete = function (cm) { CodeMirror.showHint(cm, CodeMirror.hint[hint]); };
        window.editor.setOption("mode", mode);
    };

    this.initJE = function () {


        this.ScrEHelper("Javascript Editor", 'JE_txtEdtr', "javascript", "javascript");

        //this.curEditorLabel = "Javascript Editor";
        //let JEbody = '<textarea id="JE_txtEdtr' + this.PGobj.wraperId + '" rows="12" cols="40" ></textarea>'
        //$(this.pgCXE_Cont_Slctr + " .modal-body").html(JEbody);
        //CodeMirror.commands.autocomplete = function (cm) { CodeMirror.showHint(cm, CodeMirror.hint.javascript); };
        //window.editor = CodeMirror.fromTextArea(document.getElementById('JE_txtEdtr' + this.PGobj.wraperId), {
        //    mode: "javascript",
        //    lineNumbers: true,
        //    lineWrapping: true,
        //    extraKeys: { "Ctrl-Space": "autocomplete" },
        //    foldGutter: { rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.brace, CodeMirror.fold.comment) },
        //    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        //});
    };

    this.initCSE = function () {

        this.ScrEHelper("C# Script Editor", 'CSE_txtEdtr', "text/x-csharp", "anyword");

        //this.curEditorLabel = "C# Script Editor";
        //let JEbody = '<textarea id="CSE_txtEdtr' + this.PGobj.wraperId + '" rows="12" cols="40" ></textarea>'
        //$(this.pgCXE_Cont_Slctr + " .modal-body").html(JEbody);
        //CodeMirror.commands.autocomplete = function (cm) { CodeMirror.showHint(cm, CodeMirror.hint.anyword); };
        //window.editor = CodeMirror.fromTextArea(document.getElementById('CSE_txtEdtr' + this.PGobj.wraperId), {
        //    mode: "text/x-csharp",
        //    lineNumbers: true,
        //    lineWrapping: true,
        //    matchBrackets: true,
        //    extraKeys: { "Ctrl-Space": "autocomplete" },
        //    foldGutter: { rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.brace, CodeMirror.fold.comment) },
        //    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        //});
    };

    this.initOSE = function () {
        this.curEditorLabel = "Object Selector";
        if (!this.PGobj.PropsObj.__OSElist[this.PGobj.CurProp])
            this.PGobj.PropsObj.__OSElist[this.PGobj.CurProp] = {};

        let OSEbody = `<div pg-editor-type="${this.editor}" class="OSE-body">
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
        let options = "";
        let ObjTypes = this.CurMeta.options;
        if (ObjTypes !== null)
            for (let i = 0; i < ObjTypes.length; i++) { options += '<option obj-type="' + EbObjectTypes[ObjTypes[i]] + '">' + ObjTypes[i] + '</option>' }
        else
            console.error("meta.options null for " + this.PGobj.CurProp + " Check C# Decoration");
        $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker").empty().append(options).selectpicker('refresh');
        $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker").selectpicker().on('change', this.getOSElist.bind(this));
        let CurRefId = this.PGobj.PropsObj[this.PGobj.CurProp];//--
        if (CurRefId) {
            let ObjType = CurRefId.split("-")[2];
            let ObjName = $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker [obj-type=" + ObjType + "]").text();
            let $selectedOpt = $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker").find("option:selected");
            if (ObjName === $selectedOpt.text())
                this.getOSElist();
            else
                $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont a:contains(" + ObjName + ")").click();
        }
        else
            this.getOSElist();
    };

    this.getOSElist = function (isRefresh) {
        let $selectedOpt = $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker").find("option:selected");
        let ObjType = $selectedOpt.attr("obj-type");
        if (!this.PGobj.PropsObj.__OSElist[this.PGobj.CurProp][ObjType] || isRefresh) {
            $.LoadingOverlay("show");
            $.ajax({
                url: "../DV/FetchAllDataVisualizations",
                type: "POST",
                data: { type: $selectedOpt.attr("obj-type") },
                success: this.biuldObjList
            });
        }
        else
            this.biuldObjList(this.OSEList);
    }.bind(this);

    this.biuldObjList = function (data) {
        this.OSE_curTypeObj = data;
        $.LoadingOverlay("hide");
        let ObjType = null;
        $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont").empty();
        $.each(data, function (name, val) {
            if (name)
                $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont").append('<div class="colTile" is-selected="false" tabindex="1" name ="' + name + '">' + val[0].displayName
                    + '<i class="fa fa-chevron-circle-right pull-right ColT-right-arrow" aria-hidden="true"></i></div>');
            ObjType = val[0].refId.split("-")[2];
        }.bind(this));
        //this.PGobj.OSElist[ObjType] = data;
        this.PGobj.PropsObj.__OSElist[this.PGobj.CurProp][ObjType] = data;
        this.OSEList = this.PGobj.PropsObj.__OSElist[this.PGobj.CurProp][ObjType];
        if ($(this.pgCXE_Cont_Slctr + " .modal-footer .searchinp").length === 0) {
            $(this.pgCXE_Cont_Slctr + " .modal-footer .modal-footer-body").append(`
                <div  class='input-group' style='width: 50%;'>
                        <span class='input-group-addon'><i class='fa fa-search aria-hidden='true' class='input-group-addon'></i></span>
                        <input class="searchinp" placeholder="Search object..." type="text"/>
                </div>`);



            $(this.pgCXE_Cont_Slctr + " .modal-footer .searchinp").off("keyup").on("keyup", this.searchObj);
        }
        $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .colTile").off("focus").on("focus", this.OTileClick.bind(this, data));
        $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .colTile").off("keydown").on("keydown", this.OTileKeydown.bind(this));
        $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").off("click").on("click", ".colTile", this.VTileClick.bind(this));
        $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").off("keydown").on("keydown", ".colTile", this.VTileKeydown.bind(this));
        $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").off("dblclick").on("dblclick", ".colTile", this.VTileDblClick.bind(this));
        if ($(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .filter-option .fa-refresh").length === 0) {
            let $refresh = $('<i class="fa fa-refresh DD-refresh" aria-hidden="true"></i>').on("click", this.refreshDD.bind(this));
            $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .filter-option").append($refresh);
        }
        let CurRefId = this.PGobj.PropsObj[this.PGobj.CurProp];//--
        let objName = this.getOBjNameByval(data, CurRefId);
        if (objName !== null)
            objName = objName.replace(/ /g, "_");
        if (CurRefId) {
            let $objTile = $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .colTile[name=" + objName + "]");
            if ($objTile.length > 0) {
                //setTimeout(function () {
                $objTile.focus()[0].click();
                //}, 1);
            }
            else
                $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").empty();
        }
        $(this.pgCXE_Cont_Slctr + " .modal-footer .searchinp").focus();
    }.bind(this);

    this.searchObj = function (event) {
        let $e = $(event.target);
        if (event.which === 40) {
            $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .colTile:visible:first").focus();
        }
        else if (event.which === 38) {
            $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .colTile:visible:last").focus();
        } else {

            $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .colTile").each(function (i, o) {
                if (0 > $(o).text().toLocaleLowerCase().search($e.val().toLocaleLowerCase()))
                    $(this).hide();
                else
                    $(this).show();
            });
            //$(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .Otile-active").focus();
        }
    }.bind(this);

    this.getOBjNameByval = function (data, refId) {
        let ObjName = null;
        for (objName in data) {
            if (getObjByval(data[objName], "refId", refId)) {
                this.OSECurVobj = getObjByval(data[objName], "refId", refId);
                ObjName = this.OSECurVobj.name;
                break;
            }
        }
        return ObjName;
    };

    this.OTileKeydown = function () {
        let $e = $(event.target).closest(".colTile");
        if (event.which === 13 || event.which === 39) {
            $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont .colTile:visible:first").focus();
        }
        else if (event.which === 40) {
            $e.nextAll(".colTile:visible:first").focus();
        }
        else if (event.which === 38) {
            $e.prevAll(".colTile:visible:first").focus();
        }
    };

    this.VTileDblClick = function () {
        let $e = $(event.target).closest(".colTile");
        $e.attr("is-selected", "false");
        $e.click();
        $("#" + this.PGobj.wraperId + " .modal-footer [name=CXE_OK]").click();
    };

    this.VTileKeydown = function () {
        let $e = $(event.target).closest(".colTile");
        if (event.which === 32) {
            $e.click();
        }
        else if (event.which === 13) {
            $e.attr("is-selected", "false");
            $e.click();
            $("#" + this.PGobj.wraperId + " .modal-footer [name=CXE_OK]").click();
        }
        else if (event.which === 40) {
            $e.removeClass("Otile-active");
            $e.next().focus().addClass("Otile-active");
        }
        else if (event.which === 38) {
            $e.removeClass("Otile-active");
            $e.prev().focus().addClass("Otile-active");
        }
        else if (event.which === 37) {
            $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .colTile[is-selected=true]").focus();
        }
    };

    this.OTileClick = function (data) {
        let $e = $(event.target).closest(".colTile");
        if ($e.attr("is-selected") === "false") {
            $("#" + this.PGobj.wraperId + " .OSE-body .colTile").removeClass("Otile-active");
            $e.addClass("Otile-active");
            let ObjName = $e.attr("name");
            $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .colTile").attr("is-selected", false).find(".ColT-right-arrow").removeAttr("style");
            $e.attr("is-selected", true).find(".ColT-right-arrow").css("visibility", "visible");
            $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").empty();
            $.each(data[ObjName], function (i, obj) {
                if (obj.versionNumber) {
                    let $verTile = $('<div class="colTile" style="display:none" is-selected="false" tabindex="1" ver-no="' + obj.versionNumber + '" data-refid="' + obj.refId + '">' + obj.versionNumber
                        + '<i class="fa fa-check-circle pull-right vercheck" aria-hidden="true"></i></div>');
                    $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").append($verTile.show(100));
                }
            }.bind(this));
            if (this.PGobj.PropsObj[this.PGobj.CurProp] && this.OSECurVobj && $e.attr("name") === this.OSECurVobj.name)
                $(this.pgCXE_Cont_Slctr + ' .OSE-verTile-Cont [ver-no="' + this.OSECurVobj.versionNumber + '"]')[0].click();
        }
    };

    this.VTileClick = function () {
        let $e = $(event.target).closest(".colTile");

        if ($e.attr("is-selected") === "false") {
            $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont .colTile").attr("is-selected", false).find(".fa-check-circle").hide();
            let refId = $e.attr("data-refid");
            this.PGobj.PropsObj[this.PGobj.CurProp] = refId;
            $e.attr("is-selected", true).find(".fa-check-circle").show();
            let ObjName = $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont [is-selected=true]").attr("name");
            $("#" + this.PGobj.wraperId + ".pgCX-Editor-Btn,[for=" + this.PGobj.CurProp + "]").attr("obj-name", ObjName);/////
            $("#" + this.PGobj.wraperId + " [name=" + this.PGobj.CurProp + "Tr]").find("input").val(ObjName + ", " + $e.attr("ver-no"));
            $("#" + this.PGobj.wraperId + " [name=" + this.PGobj.CurProp + "Tr]").find("input").attr("refid", refId);
            this.OSECurVobj = getObjByval(this.OSE_curTypeObj[ObjName], "versionNumber", $e.attr("ver-no"));
        }
        else {
            $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont .colTile").attr("is-selected", false).find(".fa-check-circle").hide();
            this.PGobj.PropsObj[this.PGobj.CurProp] = "";
        }
    };

    this.refreshDD = function (e) {
        e.stopPropagation();
        let $selectedOpt = $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .selectpicker").find("option:selected");
        let ObjType = $selectedOpt.attr("obj-type");
        this.OSEList = null;
        this.getOSElist("refresh");
    };

    this.initIconSelector = function () {
        this.curEditorLabel = "Icon Selector";
        //if (!this.PGobj.PropsObj.__OSElist[this.PGobj.CurProp])
        //    this.PGobj.PropsObj.__OSElist[this.PGobj.CurProp] = {};

        let value = this.PGobj.PropsObj[this.PGobj.CurProp];

        let IPbody = `<div role="iconpicker" id="icon_picker" data-rows="10" data-cols="19"  data-icon ="${value}"> </div>`;
        $(this.pgCXE_Cont_Slctr + " .modal-body").html(IPbody);
        $("#icon_picker").iconpicker({
            placement: 'bottom',
            iconset: 'fontawesome',
            icon: ''
        }).on('change', function (e) {
            let str = e.icon;
        });
        if (value) { $(`#icon_picker [value=${value}]`).addClass("btn-warning btn-icon-selected");}
            
    };

    this.initShadowEditor = function () {
        this.curEditorLabel = "Shadow Editor";
        //if (!this.PGobj.PropsObj.__OSElist[this.PGobj.CurProp])
        //    this.PGobj.PropsObj.__OSElist[this.PGobj.CurProp] = {};

        let value = this.PGobj.PropsObj[this.PGobj.CurProp];

        let ShadowPickerbody = `<div id="shadow_editor"> </div>`;
        $(this.pgCXE_Cont_Slctr + " .modal-body").html(ShadowPickerbody);
        ShadowPickerJs({ Id: "shadow_editor", Value: value});           
    };

      this.initGradientColorPicker = function () {
        this.curEditorLabel = "Gradient Color Picker";
        //if (!this.PGobj.PropsObj.__OSElist[this.PGobj.CurProp])
        //    this.PGobj.PropsObj.__OSElist[this.PGobj.CurProp] = {};

        let value = this.PGobj.PropsObj[this.PGobj.CurProp];

        let gcpBody = `<div id="gradient_editor"> </div>`;
          $(this.pgCXE_Cont_Slctr + " .modal-body").html(gcpBody);
          GradientColorPicker({ Id: "gradient_editor", Value: value});           
    };

    this.initOSCE = function () {
        this.curEditorLabel = "Object Selector Collection";
        if (!this.PGobj.PropsObj.__OSElist[this.PGobj.CurProp])
            this.PGobj.PropsObj.__OSElist[this.PGobj.CurProp] = {};

        let OSEbody = `<div pg-editor-type="${this.editor}" class="OSE-body">
            <table class="table table-bordered editTbl">
            <tbody>
            <tr>
            <td style="padding: 0px;">
            <div class="CE-controls-head"> Objects </div>
            <div class="OSEctrlsCont"> </div>
            </td>
            <td style="padding: 0px;">
            <div class="CE-controls-head"> Versions </div>
            <div class="OSE-verTile-Cont"> </div>
            </td>
            <td style="padding: 0px;"><div id="${this.PGobj.wraperId}_InnerPG" class="inner-PG-Cont"><div></td>
            </tr>
            </tbody>
            </table>
            </div>`;
        $(this.pgCXE_Cont_Slctr + " .modal-body").html(OSEbody);
        let options = [];
        let ObjTypes = this.CurMeta.options;
        if (ObjTypes !== null)
            for (let i = 0; i < ObjTypes.length; i++) { options.push(EbObjectTypes[ObjTypes[i]]); }
        else
            console.error("meta.options null for " + this.PGobj.CurProp + " Check C# Decoration");
        this.selectedCols = this.PGobj.PropsObj[this.PGobj.CurProp].$values;

        this.CE_PGObj = new Eb_PropertyGrid({
            id: this.PGobj.wraperId + "_InnerPG",
            IsInnerCall: true
        }, this.PGobj);

        this.getOSClist(options);
    };

    this.getOSClist = function (options) {
        $.LoadingOverlay("show");
        $.ajax({
            url: "../DV/FetchAllObjects",
            type: "POST",
            data: { typelist: options },
            success: this.buildObjCollectionTree
        });
    };

    this.buildObjCollectionTree = function (data) {
        this.OSE_curTypeObj = data;
        $.LoadingOverlay("hide");
        let ObjType = null;
        let ObjArray = [];
        $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont").empty();

        let CurRefId = this.PGobj.PropsObj[this.PGobj.CurProp].$values;//--
        $.each(data, function (key, Val) {
            let ExistObj = CurRefId.filter(refobj => refobj.ObjName === Val[0].name);
            let isselected = "false";
            if (ExistObj.length > 0)
                isselected = "true";

            if (ObjArray.indexOf(Val[0].ebObjectType) === -1) {
                $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont").append(`<div> 
                    <div class="ppgrid-tree-head" hs-id="${Val[0].ebObjectType}" style="display:flex;"> <div class="fa ${ebcontext.EbObjectMeta[Val[0].ebObjectType].Icon} ppgrid-tree-icon"></div>
                    ${ebcontext.EbObjectMeta[Val[0].ebObjectType].Name}</div>
                    <div id="${Val[0].ebObjectType}" class="sidebar-content">
                    <div class="colTile" is-selected="${isselected}" tabindex="1" name ="${Val[0].name}">${Val[0].displayName.trim()}
                        <i class="fa fa-chevron-circle-right pull-right ColT-right-arrow" aria-hidden="true"></i></div></div> 
                    </div>`);
                ObjArray.push(Val[0].ebObjectType);
            }
            else {
                $(`#${Val[0].ebObjectType}`).append(`<div class="colTile" is-selected="${isselected}" tabindex="1" name ="${Val[0].name}"> ${Val[0].displayName.trim()}
                        <i class="fa fa-chevron-circle-right pull-right ColT-right-arrow" aria-hidden="true"></i></div>`);
            }
        }.bind(this));

        this.PGobj.PropsObj.__OSElist[this.PGobj.CurProp][ObjType] = data;
        this.OSEList = this.PGobj.PropsObj.__OSElist[this.PGobj.CurProp][ObjType];
        if ($(this.pgCXE_Cont_Slctr + " .modal-footer .searchinp").length === 0) {
            $(this.pgCXE_Cont_Slctr + " .modal-footer .modal-footer-body").append(`
                <div  class='input-group' style='width: 50%;'>
                        <span class='input-group-addon'><i class='fa fa-search aria-hidden='true' class='input-group-addon'></i></span>
                        <input class="searchinp" placeholder="Search object..." type="text"/>
                </div>`);



            $(this.pgCXE_Cont_Slctr + " .modal-footer .searchinp").off("keyup").on("keyup", this.searchObj);
        }

        $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .ppgrid-tree-head").off("click").on("click", this.TreeHeadClick.bind(this));
        $(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .colTile").off("click").on("click", this.OTileClick1.bind(this, data));
        //$(this.pgCXE_Cont_Slctr + " .OSEctrlsCont .colTile").off("keydown").on("keydown", this.OTileKeydown.bind(this));
        //$(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").off("keydown").on("keydown", ".colTile", this.VTileKeydown.bind(this));
        //$(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").off("dblclick").on("dblclick", ".colTile", this.VTileDblClick.bind(this));
        if ($(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .filter-option .fa-refresh").length === 0) {
            let $refresh = $('<i class="fa fa-refresh DD-refresh" aria-hidden="true"></i>').on("click", this.refreshDD.bind(this));
            $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-DD-cont .filter-option").append($refresh);
        }
        if (CurRefId.length > 0)
            this.OTileClick1(data);
        $(this.pgCXE_Cont_Slctr + " .modal-footer .searchinp").focus();
    }.bind(this);

    this.TreeHeadClick = function (e) {
        let divId = e.target.getAttribute("hs-id");
        $(`#${divId}`).toggle(100);
    };

    this.OTileClick1 = function (data) {
        let $e = $(event.target).closest(".colTile");
        let ObjArray = [];
        let Curobj = "";
        $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").empty();
        let options = "";
        $.each(this.PGobj.PropsObj[this.PGobj.CurProp].$values, function (i, obj) {
            options = "";
            $.each(data[obj.ObjName], function (i, innerobj) {
                if (innerobj.versionNumber) {
                    Curobj = innerobj;
                    options += `<option ver-no='${innerobj.versionNumber}' value='${innerobj.versionNumber}' data-refid='${innerobj.refId}'>${innerobj.versionNumber}</option>`;
                }
            }.bind(this));

            if (options) {
                if (ObjArray.indexOf(Curobj.ebObjectType) === -1) {
                    let $verheadertile = $(`<div> 
                        <div class="ppgrid-tree-head"  style="display:flex;"> <div class="fa ${ebcontext.EbObjectMeta[Curobj.ebObjectType].Icon} ppgrid-tree-icon"></div>
                        ${ebcontext.EbObjectMeta[Curobj.ebObjectType].Name}</div>
                        <div id="${Curobj.ebObjectType}_version" class="sidebar-content">`);
                    $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").append($verheadertile);
                    ObjArray.push(Curobj.ebObjectType);
                }

                let $verTile = $(`<div class="colTile colTile-osce" eb-type="${Curobj.ebObjectType}" name='${obj.ObjName}' is-selected="false" tabindex="1" ><div class="versionTiletext">${obj.ObjDisplayName}</div>
                    <select  class='selectpicker'>${options}</select>
                    <i class=" pull-right fa fa-chevron-circle-left ColT-left-arrow" aria-hidden="true"></i></div>`);
                $(this.pgCXE_Cont_Slctr + ` .OSE-verTile-Cont #${Curobj.ebObjectType}_version`).append($verTile);
                $(this.pgCXE_Cont_Slctr + ` .OSE-verTile-Cont .colTile[name='${obj.ObjName}'] .selectpicker`).selectpicker("refresh");
                $(this.pgCXE_Cont_Slctr + ` .OSE-verTile-Cont .colTile[name='${obj.ObjName}'] .bootstrap-select .filter-option`).text(obj.Version);
                $(this.pgCXE_Cont_Slctr + ` .OSE-verTile-Cont .colTile[name='${obj.ObjName}'] .selectpicker`).val(obj.Version);
            }
        }.bind(this));

        $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-verTile-Cont .selectpicker").selectpicker().on('change', this.VTileClick1.bind(this, data));
        $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-verTile-Cont i").off("click").on("click", this.VTileRemoveClick1.bind(this, data));
        $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-verTile-Cont .colTile").off("click").on("click", this.VTileFocus.bind(this));
        if (this.PGobj.PropsObj[this.PGobj.CurProp].$values.length > 0)
            $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-verTile-Cont .colTile").eq(0).trigger("click");
        if (this.checkLimit($e, 1000))
            return false;
        if ($e.attr("is-selected") === "false") {
            $("#" + this.PGobj.wraperId + " .OSE-body .colTile").removeClass("Otile-active");
            $e.addClass("Otile-active");
            let ObjName = $e.attr("name");
            options = "<option>-select-</option>";
            $.each(data[ObjName], function (i, obj) {
                if (obj.versionNumber) {
                    Curobj = obj;
                    options += `<option ver-no='${obj.versionNumber}' value='${obj.versionNumber}' data-refid='${obj.refId}'>${obj.versionNumber}</option>`;
                }
            }.bind(this));

            if (options) {
                if (ObjArray.indexOf(Curobj.ebObjectType) === -1) {
                    let $verheadertile = $(`<div> 
                        <div class="ppgrid-tree-head"  style="display:flex;"> <div class="fa ${ebcontext.EbObjectMeta[Curobj.ebObjectType].Icon} ppgrid-tree-icon"></div>
                        ${ebcontext.EbObjectMeta[Curobj.ebObjectType].Name}</div>
                        <div id="${Curobj.ebObjectType}_version" class="sidebar-content">`);
                    $(this.pgCXE_Cont_Slctr + " .OSE-verTile-Cont").append($verheadertile);
                    ObjArray.push(Curobj.ebObjectType);
                }

                let $verTile = $(`<div class="colTile colTile-osce" eb-type="${Curobj.ebObjectType}" name='${ObjName}' is-selected="false" eb-type= tabindex="1" ><div class="versionTiletext">${data[ObjName][0].displayName}</div>
                        <select  class='selectpicker'>${options}</select>
                        <i class=" pull-right" aria-hidden="true"></i></div>`);
                $(this.pgCXE_Cont_Slctr + ` .OSE-verTile-Cont #${Curobj.ebObjectType}_version`).append($verTile);
                $(this.pgCXE_Cont_Slctr + ` .OSE-verTile-Cont .colTile[name='${ObjName}'] .selectpicker .selectpicker`).selectpicker("refresh");
                $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-verTile-Cont .selectpicker").selectpicker().on('change', this.VTileClick1.bind(this, data));
                $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-verTile-Cont i").off("click").on("click", this.VTileRemoveClick1.bind(this, data));
                $(this.pgCXE_Cont_Slctr + " .modal-body .OSE-verTile-Cont .colTile").off("click").on("click", this.VTileFocus.bind(this));
            }

        }
    };

    this.VTileClick1 = function (data) {
        let $e = $(event.target).closest(".colTile");
        let ObjName = $e.attr("name");
        $(this.pgCXE_Cont_Slctr + ` .OSE-verTile-Cont .colTile[name='${ObjName}']`).find("i").addClass("fa fa-chevron-circle-left ColT-left-arrow");
        let refId = $e.find(".selectpicker option:selected").attr("data-refid");
        let obj = "";
        let type = "ObjectBasicVis";
        if (parseInt(refId.split("-")[2]) === EbObjectTypes.WebForm) {
            obj = new EbObjects.ObjectBasicForm(ObjName + "ppty");
            type = "ObjectBasicForm";
        }
        else if (parseInt(refId.split("-")[2]) === EbObjectTypes.Report) {
            obj = new EbObjects.ObjectBasicReport(ObjName + "ppty");
            type = "ObjectBasicReport";
        }
        else
            obj = new EbObjects.ObjectBasicVis(ObjName + "ppty");
        let versionNumber = $e.find(".selectpicker option:selected").attr("ver-no");
        obj.ObjRefId = refId;
        obj.ObjDisplayName = data[ObjName][0].displayName;
        obj.ObjName = data[ObjName][0].name;
        obj.Version = versionNumber;
        let CurRefId = this.PGobj.PropsObj[this.PGobj.CurProp].$values;//--
        let ExistObj = CurRefId.filter(refobj => refobj.ObjName === ObjName);
        if (ExistObj.length === 0)
            this.PGobj.PropsObj[this.PGobj.CurProp].$values.push(obj);
        else
            ExistObj[0].Version = versionNumber;
        $("#" + this.PGobj.wraperId + ".pgCX-Editor-Btn,[for=" + this.PGobj.CurProp + "]").attr("obj-name", ObjName);/////
        $("#" + this.PGobj.wraperId + " [name=" + this.PGobj.CurProp + "Tr]").find("input").val(ObjName + ", " + $e.attr("ver-no"));
        $("#" + this.PGobj.wraperId + " [name=" + this.PGobj.CurProp + "Tr]").find("input").attr("refid", refId);
        this.OSECurVobj = getObjByval(this.OSE_curTypeObj[ObjName], "versionNumber", $e.attr("ver-no"));
        $(this.pgCXE_Cont_Slctr + ` .OSEctrlsCont .colTile[name='${ObjName}']`).attr("is-selected", "true");
        $(this.pgCXE_Cont_Slctr + ` .OSE-verTile-Cont .colTile[name='${ObjName}']`).trigger("click");
    };

    this.VTileFocus = function () {
        let $e = $(event.target).closest(".colTile");
        let name = $e.attr("name");
        let type = $e.attr("eb-type");
        if (parseInt(type) === EbObjectTypes.WebForm)
            type = "ObjectBasicForm";
        else if (parseInt(type) === EbObjectTypes.Report)
            type = "ObjectBasicReport";
        else
            type = "ObjectBasicVis";
        //this.loadPG($e, name);
        let CurRefId = this.PGobj.PropsObj[this.PGobj.CurProp].$values;//--
        let ExistObj = CurRefId.filter(refobj => refobj.ObjName === name);
        if (ExistObj.length > 0 && type)
            this.CE_PGObj.setObject(ExistObj[0], AllMetas[type]);
    };

    this.VTileRemoveClick1 = function () {
        let $e = $(event.target).closest(".colTile");
        let ObjName = $e.attr("name");
        let CurRefId = this.PGobj.PropsObj[this.PGobj.CurProp].$values;//--
        CurRefId = CurRefId.filter(refobj => refobj.ObjName !== ObjName);
        $e.remove();
        this.PGobj.PropsObj[this.PGobj.CurProp].$values = CurRefId;
        this.selectedCols = CurRefId;
        $(this.pgCXE_Cont_Slctr + ` .OSEctrlsCont .colTile[name='${ObjName}']`).attr("is-selected", "false");
    };

    this.set9ColTiles = function (containerId, values) {
        if (this.Dprop && this.CElistFromSrc.length === 0) {
            $(this.pgCXE_Cont_Slctr + " .modal-body").html("<h4> Set datasource for this property</h4>");
            return;
        }
        $("#" + containerId).empty();
        $("#" + this.CEctrlsContId).empty();
        let idField = "name";//////////////////////
        if (!(Object.keys(this.CElistFromSrc[0]).includes("name")))//////////////////
            idField = "ColumnName";////////////////////////
        $.each(values, function (i, control) {
            let name = (control.name || control.Name || control.ColumnName);
            let type = control.$type.split(",")[0].split(".").pop();
            let tileHTML = `<div class="colTile" onclick="$(this).focus()"  ebsid="${control.EbSid}" is-customobj="${control["IsCustomColumn"] || false}" tabindex="1" id="` + name + '" eb-type="' + type + '" setSelColtiles>'
                + '<button type="button" tabindex="-1" title="Deselect" class="coltile-left-arrow close"><i class="fa fa-arrow-circle-left"></i></button>'
                + name
                + '<button type="button" tabindex="-1" title="Remove" class="coltile-delete close"><i class="fa ' + (control["IsCustomColumn"] ? 'fa fa-minus-circle' : '') + '"></i></button>'
                + '<button type="button" tabindex="-1" title="Select" class="coltile-right-arrow close"><i class="fa fa-arrow-circle-right"></i></button>'
                + '</div>';
            let $tile = $(tileHTML);
            if (!getObjByval(this.selectedCols, idField, control[idField])) {
                $("#" + containerId).append($tile);// 1st column
            } else {
                if (containerId === this.CEctrlsContId)
                    $("#" + this.CEctrlsContId).append($tile);// 2nd column
            }
        }.bind(this));
        $(this.pgCXE_Cont_Slctr + " .editTbl").off("click", ".coltile-delete").on("click", ".coltile-delete", this.colTileDel);
        $("#" + this.CEctrlsContId).off("click", ".coltile-left-arrow").on("click", ".coltile-left-arrow", this.colTileLeftArrow);
        $("#" + this.CE_all_ctrlsContId).off("click", ".coltile-right-arrow").on("click", ".coltile-right-arrow", this.colTileRightArrow);

        if (containerId === this.CEctrlsContId && this.editor === 35)
            this.colTileClickFn({ target: $("#" + containerId + " .colTile:first")[0] });
    };

    this.setSelColtiles = function () {
        let idField = "name";//////////////////////
        let selObjs = [];
        if (this.selectedCols.length !== 0) {
            if (!(Object.keys(this.CElistFromSrc[0]).includes("name")))//////////////////
                idField = "ColumnName";////////////////////////
            $.each(this.selectedCols, function (i, ctrl) {
                let obj = getObjByval(this.CElistFromSrc, idField, ctrl[idField]);
                if (obj)
                    selObjs.push(obj);
            }.bind(this));
            this.set9ColTiles(this.CEctrlsContId, selObjs);
        }
    };

    this.setColTiles = function () {
        $("#" + this.CEctrlsContId).empty();
        let SubTypes = this.CurMeta.options;
        if (SubTypes) {
            $.each(this.CElist, function (i, control) {
                let NS1 = control.$type.split(",")[0].split(".");
                let type = NS1[NS1.length - 1];
                let _name = control.Name;
                if (!_name)
                    _name = control.EbSid;
                let $tile = $('<div class="colTile" id="' + _name + '" ebsid="' + control.EbSid + '" tabindex="1" eb-type="' + type + '" onclick="$(this).focus()"><i class="fa fa-arrows" aria-hidden="true" style="padding-right: 5px; font-size:10px;"></i>'
                    + '<span>' + _name + '</span>'
                    + '<button type="button" title="Remove" class="close"><i class="fa fa-minus-circle"></i></button>'
                    + '</div>');
                $("#" + this.CEctrlsContId).append($tile);
                //this.colTileClickFn({ "target": $("#" + control.EbSid).click()[0] });//hack
            }.bind(this));
        }
        $("#" + this.CEctrlsContId).off("click", ".close").on("click", ".close", this.colTileLeftArrow);
    };

    this.setObjTypeDD = function () {
        let DD_html = `<div class="sub-controls-DD-cont pull-left"> <select class="selectpicker"> </select> <button type="button" class="CE-add" ><i class="fa fa-plus" aria-hidden="true"></i></button> </div>`;
        $(this.pgCXE_Cont_Slctr + " .modal-footer .modal-footer-body").append(DD_html);

        let options = "";
        let SubTypes = this.CurMeta.options;
        if (SubTypes) {
            for (let i = 0; i < SubTypes.length; i++) {
                let ObjName = SubTypes[i].split("-/-")[0]; let DispName = SubTypes[i].split("-/-")[1];
                options += '<option value=' + ObjName + '>' + DispName + '</option>';
            }
            $(this.pgCXE_Cont_Slctr + " .modal-footer .selectpicker").empty().append(options).selectpicker('refresh');
        }
    };

    this.colTileDel = function (e) {
        e.stopPropagation();
        let $tile = $(e.target).closest(".colTile").remove();
        if (this.editor === 26) {
            if ($tile.attr("is-customobj") === "true") {// if delete
                let delobj = this.CElistFromSrc.splice(this.CElistFromSrc.indexOf(getObjByval(this.CElistFromSrc, "name", $tile.attr("id"))), 1)[0];
                this.updateColumnIndex(delobj);
            }
        }
    }.bind(this);

    this.colTileRightArrow = function (e) {// not tested for editors other than 26
        let $tile = $(e.target).closest(".colTile")
        if (this.checkLimit($tile))
            return false;
        e.stopPropagation();
        $tile.remove();
        if (this.editor === 9 || this.editor === 8 || this.editor === 24 || this.editor === 26 || this.editor === 27 || this.editor === 35) {
            let tileObj = getObjByval(this.CElistFromSrc, "name", $tile.attr("id"));
            if (this.editor === 26 || this.editor === 24)
                tileObj[this.Dprop] = true;
            this.selectedCols.push(tileObj);
            $("#" + this.CEctrlsContId).append($tile);
            $tile.focus();
        }
        this.CEOnSelectFn(getObjByval(this.selectedCols, "name", $tile.attr("id")));
    }.bind(this);

    this.colTileLeftArrow = function (e) {
        e.stopPropagation();
        let $tile = $(e.target).closest(".colTile").remove();
        if (this.selectedCols)// temp condition
            var tileObj = getObjByval(this.selectedCols, "name", $tile.attr("id"));
        if (this.editor === 7) {
            this.PGobj.removeFromDD.bind(this.PGobj)($tile.attr("id"));
            let DelObj = this.CElist.splice(this.CElist.indexOf(getObjByval(this.CElist, "EbSid", $tile.attr("ebsid"))), 1)[0];
            this.onRemoveFromCE(this.PGobj.CurProp, this.PGobj.PropsObj[this.PGobj.CurProp].$values, DelObj);
            let sourceProp = this.CurMeta.source;
            if (sourceProp) {
                $.each(this.PGobj.PropsObj[sourceProp].$values, function (i, obj) {
                    $.each(obj, function (prop, val) {
                        if (prop === DelObj.Name)
                            delete obj[prop];
                    });
                });
            }
        }
        else if (this.editor === 9 || this.editor === 8 || this.editor === 24 || this.editor === 26 || this.editor === 27 || this.editor === 35) {
            if (this.editor === 26 || this.editor === 24)
                tileObj[this.Dprop] = false;
            this.selectedCols.splice(this.selectedCols.indexOf(tileObj), 1);
            $("#" + this.CE_all_ctrlsContId).prepend($tile);
        }

        else if (this.editor === 26) {
            this.selectedCols.splice(this.selectedCols.indexOf(tileObj), 1);
            $("#" + this.CE_all_ctrlsContId).prepend($tile);
        }
        this.CEOnDeselectFn(tileObj);
    }.bind(this);

    this.loadPG = function ($e, id) {
        let selectedCols = this.PGobj.PropsObj[this.PGobj.CurProp].$values;
        if (!$e.hasClass("colTile")) {
            this.colTileClickFn.bind(this)({ target: $e.parent() });
            return 0;
        }
        let obj = null;
        let type = $e.attr("eb-type");
        //$("#" + this.PGobj.wraperId + " .CE-body .colTile").removeAttr("style");
        //$e.css("background-color", "#b1bfc1").css("color", "#222");

        $("#" + this.PGobj.wraperId + " .CE-body .colTile").attr("is-selected", "false");
        $e.attr("is-selected", "true");
        if (this.editor === 7) {
            obj = getObjByval(selectedCols, "EbSid", $e.attr("ebsid"));
            if (!obj)
                obj = getObjByval(selectedCols, "Name", id);
        }
        else if (this.editor === 9 || this.editor === 10 || this.editor === 24 || this.editor === 26 || this.editor === 27 || this.editor === 35) {
            obj = getObjByval(selectedCols, "name", id);
        }
        else if (this.editor === 22) {
            obj = getObjByval(selectedCols, "EbSid", $e.attr("ebsid"));
        }
        if (!obj)
            console.error("Object " + obj);
        this.CE_PGObj.setObject(obj, AllMetas[type]);
    };

    this.mapperColTileClickFn = function (e) {
        let selectedCols = this.PGobj.PropsObj[this.PGobj.CurProp].$values;
        let $e = $(e.target).closest(".mapper-ColTile");
        if (selectedCols.length > 0)
            $("#" + this.CE_mapper_ctrlsContId).show(100);
        let colEbsid = $(`#${this.CEctrlsContId} .colTile[is-selected=true]`).attr("ebsid");
        let CtrlEbsid = $e.attr("ebsid");
        let colObj = getObjByval(selectedCols, "EbSid", colEbsid);
        if ($e.attr("is-selected") === "false") {
            $(`#${this.CE_mapper_ctrlsContId} .mapper-ColTile`).attr("is-selected", "false");
            $e.attr("is-selected", "true");
            colObj[this.CurMeta.Dprop2] = getObjByval(this.CE_mapList, "EbSid", CtrlEbsid);
        }
        else {
            $e.attr("is-selected", "false");
            colObj[this.CurMeta.Dprop2] = undefined;
        }
    }.bind(this);

    this.mapperShowCallback = function ($e) {
        let selectedCols = this.PGobj.PropsObj[this.PGobj.CurProp].$values;
        $(`#${this.CE_mapper_ctrlsContId} .mapper-ColTile`).attr("is-selected", "false");
        let colEbsid = $e.attr("ebsid");
        let colObj = getObjByval(selectedCols, "EbSid", colEbsid);
        if (!colObj)
            console.log(11);
        if (colObj[this.CurMeta.Dprop2])
            $(`#${this.CE_mapper_ctrlsContId} .mapper-ColTile[ebsid=${colObj[this.CurMeta.Dprop2].EbSid}]`).attr("is-selected", "true");
    }.bind(this);

    this.loadMapperObjs = function ($e, id) {
        $(`#${this.CEctrlsContId} .colTile`).removeAttr("style").attr("is-selected", "false");
        $e.css("background-color", "#b1bfc1").css("color", "#222").attr("is-selected", "true");
        $(`#${this.CE_mapper_ctrlsContId}`).hide().show(100, this.mapperShowCallback.bind(this, $e));
    };

    this.colTileClickFn = function (e) {
        let $e = $(e.target).closest(".colTile");
        let id = $e.attr("id");
        if (this.editor === 35)
            this.loadMapperObjs($e, id);
        else
            this.loadPG($e, id);
    };

    this.getPropsObj = function () {
        let isDictSubProp = this.curCXEbtn.closest("tr").attr("tr-for") === "23";
        return isDictSubProp ? this.PGobj.PropsObj["CustomFields"].$values : this.PGobj.PropsObj;
    };

    this.getMaxNumberFromItemName = function ($items) {
        let tempArr = [];
        if ($items.length === 0)
            tempArr.push(0);
        $.each($items, function (i, el) {
            let ebsid = el.getAttribute("ebsid");
            if (!ebsid)
                console.warn(">> no EbSid found");
            let numStr = ebsid.substr(ebsid.length - 3).replace(/[^0-9]/g, '');
            let lastNum = parseInt(numStr) || 0;
            tempArr.push(lastNum);
        });
        return Math.max.apply(null, tempArr);
    };

    this.updateColumnIndex = function (delobj) {
        let deletedColumnIdx = delobj.data;
        for (let i = deletedColumnIdx; i < this.CElistFromSrc.length; i++) {
            objectToBeUpdated = getObjByval(this.CElistFromSrc, "data", (i + 1));
            objectToBeUpdated.data = i;
        }
    };

    this.CE_AddFn = function (e) {
        let $DD = $(e.target).closest(".sub-controls-DD-cont").find("option:selected");
        let SelType = $DD.val();
        let obj = {};
        //let lastItemCount = (this.CElist.length === 0) ? -1 : parseInt(this.CElist[this.CElist.length - 1].EbSid.slice(-3).replace(/[^0-9]/g, ''));
        //let lastItemCount = $(this.pgCXE_Cont_Slctr + " .CE-body .colTile").length;
        let lastItemCount = this.getMaxNumberFromItemName($(this.pgCXE_Cont_Slctr + " .CE-body .colTile"));
        let ShortName = ($DD.text() + (lastItemCount + 1)).replace(/ /g, "").toLowerCase();// toLowerCase tmp fix
        let EbSid = this.PGobj.PropsObj.EbSid + "_" + ShortName;
        obj = new EbObjects[SelType](EbSid);
        obj.Name = ShortName;
        if (obj.hasOwnProperty('Title'))
            obj.Title = ShortName;
        if (obj.hasOwnProperty('DisplayName'))
            obj.DisplayName = ShortName;
        this.PGobj.PropsObj[this.PGobj.CurProp].$values.push(obj);
        if (this.editor === 26) {
            //if (!obj.name)
            obj.name = ShortName;
            obj.data = $(this.pgCXE_Cont_Slctr + " .CE-body .colTile").length;
            //obj[this.Dprop] = true;
            this.CEOnSelectFn(obj);
            obj["IsCustomColumn"] = true;
            this.selectedCols = this.getSelectedColsByProp(this.CElistFromSrc);
            this.set9ColTiles(this.CE_all_ctrlsContId, this.CElistFromSrc);
            this.setSelColtiles();
            $("#" + obj.name).attr("is-customobj", "true");
        }
        else
            this.setColTiles();
        this.onAddToCE(this.PGobj.CurProp, this.PGobj.PropsObj[this.PGobj.CurProp].$values, obj);
        $("#" + obj.Name).focus();
    };

    this.changeCopyToRef = function () {
        $.each(this.CElistFromSrc, function (i, colObj) {
            let RObj = getObjByval(this.selectedCols, "name", colObj.name);
            if (RObj) {
                if (RObj === colObj)/// if already reference exit
                    return false;
                let idx = this.selectedCols.indexOf(RObj);
                this.selectedCols[idx] = colObj;
            }
        }.bind(this));
    };

    this.Init = function () {
        let modalSizePercent = 65;
        let modalWidth = window.screen.availWidth * (modalSizePercent / 100);
        let modalHeight = modalWidth / 1.574;
        this.modalRight = window.screen.availWidth * ((1 - (modalSizePercent / 100)) / 2);
        this.modalTop = ((window.screen.availHeight - modalHeight) / 2) - 15;
        let CXVE_html = '<div class="pgCXEditor-bg">'
            + `<div class="pgCXEditor-Cont" style="width:${modalWidth}px; height:${modalHeight}px;right:${this.modalRight}px;top:${this.modalTop}px;">`

            + '<div class="modal-header">'
            + '<button type="button" class="close">&times;</button>'
            + '<h4 class="modal-title"> </h4>'
            + '</div>'

            + '<div class="modal-body"> </div>'
            + '<div class="modal-footer">'
            + '<div class="modal-footer-body">'
            + '</div>'
            + '<button type="button" name="CXE_OK" class="btn">OK</button>'
            + '</div>'

            + '</div>'
            + '</div>';
        $(this.PGobj.$wraper).append(CXVE_html);

        $(this.PGobj.$wraper).append('<div id="mb_' + this.PGobj.wraperId + '"> </div><div id="fs_' + this.PGobj.wraperId + '"> </div>');
        $(this.PGobj.$wraper).append('<div id="mb_' + this.PGobj.wraperId + '"> </div><div id="mls_' + this.PGobj.wraperId + '"> </div>');
    };
    this.Init();
};