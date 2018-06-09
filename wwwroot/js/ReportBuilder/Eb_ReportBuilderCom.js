var RbCommon = function (RbMainObj) {
    this.RbObj = RbMainObj;
    var _hasSummary = ["EbDataFieldNumeric", "EbCalcField", "EbDataFieldBoolean", "EbDataFieldText", "EbDataFieldDateTime"];
    var $funcselect = $("#summarry-editor-modal-container #summary-func").empty();
    var $sectionselect = $("#summarry-editor-modal-container #summary-sections").empty();
    var fields = $("#summarry-editor-modal-container #summary-fieldname").empty();
    var $summModal = $("#summarry-editor-modal-container");
    var _icons = {
        "Numeric": "fa-sort-numeric-asc",
        "String": "fa-font",
        "DateTime": "fa-calendar",
        "Bool": ""
    };

    this.subSecCounter = {
        Countrpthead: 1,
        Countpghead: 1,
        Countdetail: 1,
        Countpgfooter: 1,
        Countrptfooter: 1
    };

    this.EbObjectSections = {
        ReportHeader: 'rpthead',
        PageHeader: 'pghead',
        ReportDetail: 'detail',
        PageFooter: 'pgfooter',
        ReportFooter: 'rptfooter'
    };
    this.msBoxSubNotation = {
        rpthead: 'Rh',
        pghead: 'Ph',
        detail: 'Dt',
        pgfooter: 'Pf',
        rptfooter: 'Rf'
    };

    this.pages = {
        0: {
            width: 612,
            height: 792
        },//A2
        1: {
            width: 841.8898,
            height: 1190.55
        },//A3
        2: {
            width: 595.276,
            height: 841.8898
        },//A4      
        3: {
            width: 419.5276,
            height: 595.276
        },//A5 
        4: {
            width: 612,
            height: 792
        },//letter
    };
    this.EbRuler = {
        px: {
            minor: "tickMinor",
            major: "tickMajor",
            label: "tickLabel",
            len: 5
        },
        cm: {
            minor: "tickMinor-cm",
            major: "tickMajor-cm",
            label: "tickLabel-cm",
            len: 3.77
        },
        inch: {
            minor: "tickMinor-inch",
            major: "tickMajor-inch",
            label: "tickLabel-inch",
            len: 9.6
        }
    }
    this.TextAlign = {
        0: "left",
        2: "right",
        1: "center",
        3: "justify"
    }

    this.setMarginOnedit = function (margin) {
        $(".track_line_vert1").css("left", this.RbObj.repExtern.convertPointToPixel(margin.Left));
        this.RbObj.margin.Left = $(".track_line_vert1").position().left;
        $(".track_line_vert2").css("left", parseFloat(this.RbObj.width) - this.RbObj.repExtern.convertPointToPixel(margin.Right));
        this.RbObj.margin.Right = $(".track_line_vert2").position().left;
    };

    this.onTrackerStop = function (e, ui) {
        var $t = $(ui.helper);
        if ($t.hasClass("track_line_vert1"))
            this.RbObj.margin.Left = $t.position().left;
        else
            this.RbObj.margin.Right = $t.position().left;
    };

    this.windowscroll = function () {
        var $layer = null;
        if ($(".page-reportLayer").is(":visible"))
            $layer = ".page-reportLayer";
        else
            $layer = ".page";
        $(".tracker_drag").css({ "height": ($($layer).height() - $(window).scrollTop()) + 20, "top": $(window).scrollTop() });
    };

    this.getsummaryfns = function (eb_type) {//neeed to change
        var fn = null;
        if (eb_type == "EbDataFieldText" || eb_type == "Text")
            fn = "SummaryFunctionsText";
        else if (eb_type == "EbDataFieldDateTime" || eb_type == "DateTime")
            fn = "SummaryFunctionsDateTime";
        else if (eb_type == "EbDataFieldBoolean" || eb_type == "Boolean")
            fn = "SummaryFunctionsBoolean";
        else if (eb_type == "EbDataFieldNumeric" || eb_type == "Numeric")
            fn = "SummaryFunctionsNumeric";
        return EbEnums[fn];
    }

    this.getSectionToAddSum = function () {
        var objlist = [];
        $("#detail0").parent().nextAll().not(".gutter,#detail").each(function (i, obj) {
            $(obj).children().not(".gutter").each(function (j, sections) {
                objlist.push($(sections));
            })
        })
        return objlist;
    };

    this.ValidateCalcExpression = function (obj) {
        $.ajax({
            url: "../RB/ValidateCalcExpression",
            type: "POST",
            cache: false,
            data: {
                refid: this.RbObj.EbObject.DataSourceRefId,
                expression: atob(obj.ValueExpression)
            },
            success: function (result) {
                this.setCalcFieldType(obj, JSON.parse(result));
            }.bind(this)
        });
    }

    this.setCalcFieldType = function (obj, result) {
        if (result.Type === 16)
            obj.CalcFieldType = "Text";
        else if (result.Type === 7 || result.Type === 8 || result.Type === 10 || result.Type === 11 || result.Type === 12 || result.Type === 21)
            obj.CalcFieldType = "Numeric";
        else if (result.Type === 3)
            obj.CalcFieldType = "Boolean";
        else if (result.Typee === 5 || result.Type === 6 || result.Type === 17 || result.Type === 26)
            obj.CalcFieldType = "DateTime";

        this.RbObj.RefreshControl(obj);
    };

    this.newCalcFieldSum = function () {
        $("#eb_calcF_summarry").modal("toggle");
        $("#calcF_submit").off("click").on("click", this.addCalcField.bind(this));
    };

    this.addCalcField = function () {
        var name = $("#calcF_name").val().trim();
        var vexp = $("#calcF_valueExpr").val().trim();
        var Objid = "CalcField" + (this.RbObj.idCounter["CalcFieldCounter"])++;
        var obj = new EbObjects["EbCalcField"](Objid);
        $("#detail0").append(obj.$Control.outerHTML());
        obj.ValueExpression = btoa(vexp);
        obj.Name = name || Objid;
        obj.Title = name || Objid;
        this.RbObj.objCollection[Objid] = obj;
        this.RbObj.RefreshControl(obj);
        $("#eb_calcF_summarry").modal("toggle");
        if (obj.ValueExpression)
            this.ValidateCalcExpression(obj);//returns the type of expression
        $("#calcFields ul[id='calcfields-childul']").append(`<li class='styl'><div tabindex='1' $(this).focus(); class='textval' EbSid="${obj.EbSid}">
            ${obj.Name}</div></li>`);
    };

    this.addSummarry = function () {
        $summModal.modal("toggle");
        var sections = this.getSectionToAddSum();
        $sectionselect.empty(); fields.empty();
        for (var ite in this.RbObj.objCollection) {
            var t = this.RbObj.objCollection[ite].$type.split(",")[0].split(".").pop();
            if (_hasSummary.indexOf(t) >= 0) {
                fields.append(`<option eb-type="${t}"
                value="${this.RbObj.objCollection[ite].Name}" EbSid="${this.RbObj.objCollection[ite].EbSid}">${this.RbObj.objCollection[ite].Title}</option>`);
            }
        }
        for (var i = 0; i < sections.length; i++) {
            $sectionselect.append(`<option 
                value="#${sections[i].attr("id")}">${sections[i].attr("eb-type") + sections[i].attr("id").slice(-1)}</option>`);
        }
        fields.off("change").on("change", function (e) {
            $funcselect.empty();
            var obj = this.RbObj.objCollection[$(e.target).find('option:selected').attr("EbSid")];
            var t = obj.$type.split(",")[0].split(".").pop() === "EbCalcField" ? obj.CalcFieldType : obj.$type.split(",")[0].split(".").pop();
            var summaryFunc = this.getsummaryfns(t);//object
            for (var func in summaryFunc) {
                $funcselect.append(`<option 
               value="${func}">${func}</option>`);
            }
        }.bind(this));
        $("#submit-summary").off("click").on("click", this.appendSummaryField.bind(this));
        fields.trigger("change");
    };

    this.appendSummaryField = function (e) {
        $summModal.modal("toggle");
        var cft = $("#" + fields.find('option:selected').attr("EbSid")).attr("cftype") || "";
        var type = $("#" + fields.find('option:selected').attr("EbSid")).attr("eb-type") + cft;
        var Objid = type + "Summary" + this.RbObj.idCounter[type + "SummaryCounter"]++;
        var obj = new EbObjects["Eb" + type + "Summary"](Objid);
        $($sectionselect.val()).append(obj.$Control.outerHTML());
        obj.SummaryOf = fields.val();
        obj.Name = Objid;
        obj.Title = $funcselect.val() + "(" + fields.find('option:selected').text() + ")";
        obj.Function = $funcselect.val();
        this.RbObj.objCollection[Objid] = obj;
        this.RbObj.RefreshControl(obj);
        $("#running-summary ul[id='running-summary-childul']").append(`<li class='styl'><div tabindex='1' $(this).focus(); class='textval'>
            ${$funcselect.val()} (${fields.find('option:selected').text().trim()})</div></li>`);
    };

    this.modifyTable = function (obj, pname) {
        if (pname === "ColoumCount") {
            $(`#${obj.EbSid} table tbody tr`).each(function (i, tr) {
                this.appendTd($(tr), obj.ColoumCount);
            }.bind(this));
        }
        else {
            let _tdCount = $(`#${obj.EbSid} table tbody tr`).eq(0).children("td").length;
            for (let c = 0; c < obj.RowCount; c++) {
                $(`#${obj.EbSid} table tbody`).append(`<tr id="${obj.EbSid}_tr_${c}">`);
                this.appendTd($(`#${obj.EbSid}_tr_${c}`), _tdCount);
            }
            $(`#${obj.EbSid}`).css("height", "auto");
            obj.Height = $(`#${obj.EbSid}`).height();
        }
        this.RbObj.makeTLayoutDroppable(obj);
        this.resizeTdOnLayoutResize(obj.EbSid, "set");
    };

    this.appendTd = function ($ctrl, count) {
        for (let t = 0; t < count; t++) {
            $ctrl.append("<td eb-type='TableLayout'>");
        }
    };

    this.resizeTdOnLayoutResize = function (id, opertaion) {
        this.RbObj.TableCollection[id].forEach(function (obj) {
            if (opertaion === "start" || opertaion === "set")
                $(`#${obj.EbSid}`).css({ width: "100%", height: "100%" });
            else if (opertaion === "stop" || opertaion === "set") {
                this.RbObj.objCollection[obj.EbSid].Width = $(`#${obj.EbSid}`).width();
                this.RbObj.objCollection[obj.EbSid].Height = $(`#${obj.EbSid}`).height();
            }
        }.bind(this));
        this.RbObj.objCollection[id].Height = $("#" + id).height();
        this.RbObj.objCollection[id].Width = $("#" + id).width();
    };

    this.makeReadOnlyonPg = function (curObject) {
        this.RbObj.pg.MakeReadOnly(curObject.Width);
        this.RbObj.pg.MakeReadOnly(curObject.Height);
        this.RbObj.pg.MakeReadOnly(curObject.Left);
        this.RbObj.pg.MakeReadOnly(curObject.Top);
    };

    this.buildTableHierarcy = function ($elements, index, eb_typeCntl) {
        this._table = this.RbObj.objCollection[$elements.attr("id")];
        this._table.CellCollection.$values.length = 0;
        this.eb_typeCntl = eb_typeCntl;
        this.sectionIndex = index;

        $elements.find("td").each(function (i, js_objtd) {
            var td_obj = new EbObjects["EbTableLayoutCell"]("TableLayoutCell" + this.RbObj.idCounter["TableLayoutCellCounter"]++);
            td_obj.RowIndex = $(js_objtd).parent("tr").index();
            td_obj.CellIndex = $(js_objtd).index();
            td_obj.Height = $(js_objtd).closest("tr").height();
            td_obj.Width = $(js_objtd).closest("tr").width();
            this.getTdCtrls($(js_objtd), td_obj);
        }.bind(this));
    };

    this.getTdCtrls = function ($td, eb_obj) {
        $td.find(".dropped").each(function (k, ebctrl) {
            if ($(ebctrl).length >= 1) {
                this.RbObj.objCollection[$(ebctrl).attr("id")].Left = $(ebctrl).position().left + $td.position().left + this._table.Left;
                this.RbObj.objCollection[$(ebctrl).attr("id")].Top = $(ebctrl).position().top + $td.position().top + this._table.Top;
                eb_obj.ControlCollection.$values.push(this.RbObj.objCollection[$(ebctrl).attr("id")]);
                this.RbObj.pushToSections($(ebctrl), this.sectionIndex, this.eb_typeCntl);
            }
        }.bind(this));
        this._table.CellCollection.$values.push(eb_obj);
    };

    this.drawTableOnEdit = function (editControl) {
        var tobj = this.RbObj.drawEbControls(editControl);
        this.RbObj.TableCollection[tobj.EbSid] = new Array();
        this.modifyTable(tobj, "RowCount");
        this.modifyTable(tobj, "ColoumCount");
        this.renderTableControls(tobj, editControl);
    };

    this.renderTableControls = function (tobj, editControl) {
        this.tobj = tobj;
        editControl.CellCollection.$values.forEach(function (ctrls) {
            this.RbObj.containerId = $(`#${tobj.EbSid}`).find("tr").eq(ctrls.RowIndex).find("td").eq(ctrls.CellIndex);
            this.RbObj.containerId.css("height", ctrls.Height);
            ctrls.ControlCollection.$values.forEach(this.drawControls.bind(this));
        }.bind(this));
        this.resizeTdOnLayoutResize(this.tobj.EbSid, "set");
    };

    this.drawControls = function (ctrls) {
        ctrls.LeftPt = 0;
        ctrls.TopPt = 0;
        var newc = this.RbObj.drawEbControls(ctrls);
        this.RbObj.TableCollection[this.tobj.EbSid].push(newc);
    };

    this.drawDsParmsTree = function (paramsList) {
        var icon = "";
        paramsList.forEach(function (param) {
            if (param.type === "16")
                icon = _icons["String"];
            else if (param.type === "7" || param.type === "8" || param.type === "10" || param.type === "11" || param.type === "12" || param.type === "21") 
                icon = _icons["Numeric"];
            else if (param.type === "3")
                icon = _icons["Bool"];
            else if (param.type === "5" || param.type === "6" || param.type === "17" || param.type === "26") 
                icon = _icons["DateTime"];
            $("#ds_parameter_list ul[id='ds_parameters']").append(`<li class='styl'><span eb-type='Parameter' class='fd_params draggable textval'><i class='fa ${icon}'></i> ${param.name}</span></li>`);
        });
        $('#ds_parameter_list').killTree();
        $('#ds_parameter_list').treed();
        this.RbObj.DragDrop_Items();
    };

    this.drawDsColTree = function (colList) {
        var type,icon = "";
        $.each(colList, function (i, columnCollection) {
            $("#data-table-list ul[id='dataSource']").append(" <li><a>Table " + i + "</a><ul id='t" + i + "'></ul></li>");
            $.each(columnCollection, function (j, obj) {
                if (obj.type === 16) {
                    type = "DataFieldText"; icon = _icons["String"];
                }
                else if (obj.type === 7 || obj.type === 8 || obj.type === 10 || obj.type === 11 || obj.type === 12 || obj.type === 21) {
                    type = "DataFieldNumeric"; icon = _icons["Numeric"];
                }
                else if (obj.type === 3) {
                    type = "DataFieldBoolean"; icon = _icons["Bool"];
                }
                else if (obj.type === 5 || obj.type === 6 || obj.type === 17 || obj.type === 26) {
                    type = "DataFieldDateTime"; icon = _icons["DateTime"];
                }
                $("#data-table-list ul[id='t" + i + "']").append(`<li class='styl'><span eb-type='${type}' DbType='${obj.type}' class='coloums draggable textval'><i class='fa ${icon}'></i> ${obj.columnName}</span></li>`);
            });
        });
        $('#data-table-list').killTree();
        $('#data-table-list').treed();
        this.RbObj.DragDrop_Items();
    };

    this.switchlayer = function (e) {
        var target = $(e.target).closest(".Rb_layer");
        if (!target.hasClass("layeractive")) {
            target.addClass("layeractive");
            target.siblings().removeClass("layeractive");
        }
        else {
            target.siblings().removeClass("layeractive");
        }

        if (target.attr("Layer") === "Section") {
            $(".multiSplit,.headersections,#page,.rulerleft").show();
            $(".headersections-report-layer,#page-reportLayer,.rulerleft_Lyr_rpt").hide();
            $(".tracker_drag").css("height", "100%");
            containment = ".page";
        }
        else {
            $(".multiSplit,.headersections,#page,.rulerleft").hide();
            $(".headersections-report-layer,#page-reportLayer,.rulerleft_Lyr_rpt").show();
            $(".tracker_drag").css("height", "100%");
            containment = ".page-reportLayer";
        }
    };

    commonO.PreviewObject = function () {
        commonO.Save();
    };

    commonO.saveOrCommitSuccess = function (refid) {
        this.refid = refid || null;
        if (this.RbObj.EbObject.DataSourceRefId) {
            $.ajax({
                url: "../ReportRender/Index",
                type: "POST",
                cache: false,
                data: {
                    refid: this.refid,
                    renderLimit:true
                },
                success: function (result) {
                    $("#preview_wrapper").html(result);
                    $("#run").on("click", this.render.bind(this));
                }.bind(this)
            });
        }
    }.bind(this); 

     this.render = function() {
        //$("#sub_windows_sidediv_dv").css("display", "none");
        //$("#content_dv").removeClass("col-md-9").addClass("col-md-12");
        //$.LoadingOverlay("show");
        $("#eb_common_loader").EbLoader("show");
        var ParamsArray = [];
        var filter_control_list = $("#all_control_names").val();
        if (filter_control_list !== undefined) {
            var myarray = filter_control_list.split(',');
            for (var i = 0; i < myarray.length; i++) {
                console.log($("#" + myarray[i]).val());
                var type = $('#' + myarray[i]).attr('data-ebtype');
                var name = $('#' + myarray[i]).attr('name');
                if (type === "3")
                    value = $("[name=" + myarray[i] + "]:checked").val()
                else
                    value = $('#' + myarray[i]).val();
                if (type === '6')
                    value = value.substring(0, 10);
                ParamsArray.push(new fltr_obj(type, name, value));
            }
        }

        //if (!validateFD()) {
        //    //$.LoadingOverlay("hide");
        //    $("#eb_common_loader").EbLoader("hide");
        //    $("#filter").trigger("click");
        //    return;
        //}
         $("#reportIframe").attr("src", `../ReportRender/RenderReport2?refid=${this.refid}&Params=${JSON.stringify(ParamsArray)}`);
        // $("#RptModal").modal('hide');
        //$.LoadingOverlay("hide");
         $("#eb_common_loader").EbLoader("hide");
    }

    this.start = function () {
        $('.tracker_drag').draggable({ axis: "x", containment: ".page-outer-container", stop: this.onTrackerStop.bind(this) });
        $(window).on("scroll", this.windowscroll.bind(this));
        $(".Rb_layer").off("click").on("click", this.switchlayer.bind(this));
        $(".add_calcfield").on("click", this.newCalcFieldSum.bind(this));
        $(".add_summarry").on("click", this.addSummarry.bind(this));
    };

    this.start();
}