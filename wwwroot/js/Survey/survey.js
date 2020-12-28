const SurveyQuestionBank = function (ques, context, options) {

    this.rootContainerObj = null;
    this.formId = options.formId;
    this.$QCtrlsCont = $('.ansctrl-inner');
    this.$propGrid = $("#" + options.PGId);


    this.EbObject = options.objInEditMode;
    this.controlCounters = CtrlCounters;//Global
    this.isEditMode = false;

    //Edit mode
    if (this.EbObject) {
        this.isEditMode = true;
        this.InitEditModeCtrls(this.EbObject);
    }
    if (this.EbObject === null) {
        this.rootContainerObj = new EbObjects["EbQuestionnaire"](this.formId);
        this.$QCtrlsCont.attr('ebsid', this.rootContainerObj.EbSid);
        this.EbObject = this.rootContainerObj;
    }


    this.Survey = {
        QuesId: 0,
        Question: "",
        QuesType: null,
        Choices: [],
    };
    this.RatingC = 1;
    this.UIType = "Text";

    this.Queries = JSON.parse(ques) || null;

    this.init = function () {
        $("#questionModal").on('show.bs.modal', function () {
            $(`textarea[name="Question"]`).val("");
            $(".qst-opt-cont").empty();
        });
        $(".qst-type").off("click").on("click", this.changeQuestionType.bind(this));
        $('body').off("click").on("click", ".query_tile", this.quesEdit.bind(this));

        $("#scoreCheck").off("change").on("change", this.scoreCheckboxChanged.bind(this));

        this.scoreCheckbox = $("#scoreCheck").prop("checked");

        $(`textarea[name="Question"]`).on("change", function (e) { this.Survey.Question = e.target.value; }.bind(this));
        $("#submit_question").off("click").on("click", this.newQuesSubmit.bind(this));
        $(`body`).off("change").on("change", ".qst-choice-number", this.ScoreChanged.bind(this));
        $("#userInputType").off("change").on("change", this.changeUIType.bind(this));
        $(".qst-types-cont div[qtype='1']").click();

        this.addAnsPopMenu();

        $('#questionModal').off("click", '.qm-add-ans').on('click', '.qm-add-ans', this.addPMAns);
        $('#questionModal').off("hover", '.qm-add-ans').on('hover', '.qm-add-ans', this.addPMAns);
        $('#questionModal').off("blur", '.qm-add-ans').on('blur', '.qm-add-ans', this.pmHide);
        $('#questionModal').off("click", '.pmenu-icon-cont').on('click', '.pmenu-icon-cont', this.AddAnsCtrl);
    };

    this.AddAnsCtrl = function () {
        let $el = $(event.target).closest('.pmenu-icon-cont');

        let type = $el.attr("eb-type").trim();
        let ebsid = type + ++(this.controlCounters[type + "Counter"]);
        let ctrlObj = new EbObjects["Eb" + type](ebsid);
        let $ctrl = ctrlObj.$Control;
        $('.ansctrl-inner').append($ctrl);
        this.dropedCtrlInit($ctrl, type, ebsid);
        ctrlObj.Label = ebsid + " Label";
        ctrlObj.HelpText = "";
        this.rootContainerObj.Controls.$values.push(ctrlObj);
        $ctrl.focus();
    }.bind(this);

    this.dropedCtrlInit = function ($ctrl, type, id) {
        $ctrl.attr("tabindex", "1");
        this.ctrlOnClickBinder($ctrl, type);
        $ctrl.on("focus", this.controlOnFocus.bind(this));
        $ctrl.attr("id", "cont_" + id).attr("ebsid", id);
        $ctrl.attr("eb-type", type);
    };

    this.controlOnFocus = function (e) {
        e.stopPropagation();
        let $e = $(e.target);
        if (this.curControl && this.curControl.attr("ebsid") === $(e.target).attr("ebsid"))
            return;
        if ($e.attr("id") === this.formId) {
            this.curControl = $e;
            this.CreatePG(this.rootContainerObj);
            return;
        }
        else
            this.curControl = $e.closest(".Eb-ctrlContainer");
        let ebsid = this.curControl.attr("ebsid");
        this.CreatePG(this.rootContainerObj.Controls.GetByName(ebsid));
        //  this.PGobj.ReadOnly();
    }.bind(this);

    this.CreatePG = function (control) {
        console.log("CreatePG called for:" + control.Name);
        //this.$propGrid.css("visibility", "visible");
        this.PGobj.setObject(control, AllMetas["Eb" + this.curControl.attr("eb-type")]);////
    };


    this.onDragFn = function (el, source) {
        let $source = $(source);
        //if drag start within the form
        if ($source.attr("ebclass") !== this.toolContClass) {
            let id = $(el).closest(".Eb-ctrlContainer").attr("ebsid");
            this.movingObj = this.rootContainerObj.Controls.PopByName(id);
            if ($source.closest(".ebcont-ctrl").attr("ctype") === "TabPane")
                this.adjustPanesHeight($source);
        }
        else
            this.movingObj = null;
    };// start

    this.onDragendFn = function (el) {
        let $sibling = $(el).next();
        let $target = $(el).parent();
        if (this.movingObj) {
            //Drag end with in the form
            if ($target.attr("ebclass") !== this.toolContClass) {
                if ($sibling.attr("id")) {
                    //let idx = $sibling.index() - 1;
                    let idx = $(el).parent().children('.Eb-ctrlContainer').index(el);
                    this.rootContainerObj.Controls.InsertAt(idx, this.movingObj);
                }
                else {
                    this.rootContainerObj.Controls.Append(this.movingObj);
                }
                this.saveObj();
                $(el).off("focus").on("focus", this.controlOnFocus.bind(this));
            }
        }
    };

    this.onDropFn = function (el, target, source, sibling) {
        if (el.contains(target))
            return;
        let $target = $(target);
        if (target) {
            //drop from toolbox to form
            if ($(source).attr("ebclass") === this.toolContClass) {
                let $el = $(el);
                let type = $el.attr("eb-type").trim();
                let ebsid = type + ++(this.controlCounters[type + "Counter"]);
                let $sibling = $(sibling);
                $el.remove();
                let ctrlObj = new EbObjects["Eb" + type](ebsid);
                let $ctrl = ctrlObj.$Control;

                if (type === "UserControl") {///user control refid set on ctrlobj
                    ctrlObj["RefId"] = $(el).find("option:selected").attr('refid');
                    this.AsyncLoadHtml(ctrlObj["RefId"], "cont_" + ctrlObj["EbSid"]);
                }
                else if (type === "Approval") {
                    ctrlObj.TableName = this.rootContainerObj.TableName + "_approval";
                    this.ApprovalCtrl = ctrlObj;
                }
                else if (type === "Review") {
                    ctrlObj.TableName = this.rootContainerObj.TableName + "_reviews";
                    this.ReviewCtrl = ctrlObj;
                }
                else if (type === "ProvisionLocation") {
                    this.ProvisionLocationCtrl = ctrlObj;
                }
                else if (type === "SimpleSelect" || type === "BooleanSelect") {
                    $ctrl.find(".selectpicker").selectpicker();
                }


                this.dropedCtrlInit($ctrl, type, ebsid);
                if (sibling) {
                    $ctrl.insertBefore($sibling);
                    this.rootContainerObj.Controls.InsertBefore(this.rootContainerObj.Controls.GetByName($sibling.attr('ebsid')), ctrlObj);
                }
                else {
                    $target.append($ctrl);
                    this.rootContainerObj.Controls.Append(ctrlObj);
                }

                if (type === "DataObject" && this.builderType === "UserControl") {
                    //this.DraggableConts.push(document.querySelectorAll(".Dt-Rdr-col-cont")[1]);

                    this.DraggableConts.push($(`#cont_${ctrlObj.EbSid_CtxId} .Dt-Rdr-col-cont`)[0]);

                }
                else if (type === "BluePrint") {
                    var blueprintModal = new blueprintModalfn(ctrlObj);

                }
                else if (type == "WizardControl") {
                    this.initWizard(ctrlObj);
                }

                $ctrl.focus();
                ctrlObj.Label = ebsid + " Label";
                ctrlObj.HelpText = "";
                if (ctrlObj.IsContainer)
                    this.InitContCtrl(ctrlObj, $ctrl);
                $ctrl.focus();
                this.updateControlUI(ebsid);
            }
            //drop from blk-cont to form(Eb Data object control)
            if ($(source).attr("ebclass") === "blk-cont") {
                let $el = $(el);
                let type = $el.attr("eb-type").trim();
                let CntrlName = $el.attr("data-ctrl").trim();
                let ColumnlName = $el.attr("data-column").trim();
                let ebsid = type + ++(this.controlCounters[type + "Counter"]);
                let $sibling = $(sibling);
                $el.remove();
                let ctrlObj = new EbObjects["Eb" + type](ebsid);
                ctrlObj.DataObjCtrlName = CntrlName;
                ctrlObj.DataObjColName = ColumnlName;
                ctrlObj.Label = ColumnlName;
                let $ctrl = ctrlObj.$Control;

                if (type === "UserControl") {///user control refid set on ctrlobj
                    ctrlObj["RefId"] = $(el).find("option:selected").attr('refid');
                    this.AsyncLoadHtml(ctrlObj["RefId"], "cont_" + ctrlObj["EbSid"]);
                }
                else if (type === "Approval") {
                    ctrlObj.TableName = this.rootContainerObj.TableName + "_reviews";
                    this.ApprovalCtrl = ctrlObj;
                }
                else if (type === "Review") {
                    ctrlObj.TableName = this.rootContainerObj.TableName + "_reviews";
                    this.ReviewCtrl = ctrlObj;
                }
                else if (type === "ProvisionLocation") {
                    this.ProvisionLocationCtrl = ctrlObj;
                }
                else if (type === "SimpleSelect" || type === "BooleanSelect") {
                    $ctrl.find(".selectpicker").selectpicker();
                }

                this.dropedCtrlInit($ctrl, type, ebsid);
                if (sibling) {
                    $ctrl.insertBefore($sibling);
                    this.rootContainerObj.Controls.InsertBefore(this.rootContainerObj.Controls.GetByName($sibling.attr('ebsid')), ctrlObj);
                }
                else {
                    $target.append($ctrl);
                    this.rootContainerObj.Controls.Append(ctrlObj);
                }

                if (type === "DataObject" && this.builderType === "UserControl") {
                    this.DraggableConts.push(document.querySelectorAll(".Dt-Rdr-col-cont")[0]);
                }

                $ctrl.focus();

                ctrlObj.HelpText = "";
                if (ctrlObj.IsContainer)
                    this.InitContCtrl(ctrlObj, $ctrl);
                this.updateControlUI(ebsid);
            }


            let $parent = $target.closest(".ebcont-ctrl");
            if ($parent.attr("ctype") === "TabPane")
                this.adjustPanesHeight($parent);
        }
    };

    this.movesfn = function (el, source, handle, sibling) {
        if ($(handle).hasClass("ui-resizable-handle"))//if handle is resizable's handle of table layout
            return false;
        return true;
    };

    this.acceptFn = function (el, target, source, sibling) {
        if (el.contains(target))
            return;

        if ($(source).hasClass(this.toolContClass) && (
            el.getAttribute("eb-type") === "Approval" && this.ApprovalCtrl ||
            el.getAttribute("eb-type") === "Review" && this.ReviewCtrl
        )
        ) {
            this.EbAlert.clearAlert("reviewCtrl");
            this.EbAlert.alert({
                id: "reviewCtrl",
                head: "Form already contains a Review control.",
                body: "You cannot add more than one approval control into the form",
                type: "warning",
                delay: 3000
            });
            return false;
        }

        if ($(source).hasClass(this.toolContClass) && el.getAttribute("eb-type") === "ProvisionLocation" && this.ProvisionLocationCtrl) {
            this.EbAlert.clearAlert("mngLocCtrl");
            this.EbAlert.alert({
                id: "mngLocCtrl",
                head: "Form already contains a provision location control.",
                body: "You cannot add more than one provision location control into the form",
                type: "warning",
                delay: 3000
            });
            return false;
        }

        let _class = $(target).attr("ebclass");
        if (_class !== this.toolContClass && _class !== "blk-cont")
            return true;
        else
            return false;

        //if ($(source).attr("id") === this.primitiveToolsId && $(target).attr("id") === this.primitiveToolsId) {
        //    return false;
        //}
        //// allow copy except toolbox
        //if ($(source).attr("id") === this.primitiveToolsId && $(target).attr("id") !== this.primitiveToolsId) {
        //    return true;
        //}
        //// sortable with in the container
        //if ($(source).attr("id") !== this.primitiveToolsId && source === target) {
        //    return true;
        //}
        //else {
        //    return true;
        //}

    };

    this.drake = new dragula(this.DraggableConts, {
        revertOnSpill: true,
        copy: function (el, source) { return (source.className.includes('tool-sec-cont') || source.className.includes('Dt-Rdr-col-cont')); },
        copySortSource: true,
        moves: this.movesfn.bind(this),
        accepts: this.acceptFn.bind(this)
    });

    this.ctrlOnClickBinder = function ($ctrl, type) {
        if (type === "TabControl")
            $ctrl.on("click", function myfunction() {
                let $e = $(event.target);
                if ($e.closest(".cont-prop-btn").length === 1 || $e.closest(".ebtab-add-btn").length === 1)// to skip event.stopPropagation()
                    return;

                if ($e.closest("a").attr("data-toggle") !== "tab")
                    event.stopPropagation();
                $(event.target).closest(".Eb-ctrlContainer").focus();
            });
        else
            $ctrl.on("click", function myfunction() {
                let $e = $(event.target);
                if ($e.closest(".cont-prop-btn").length === 1)// to skip event.stopPropagation()
                    return;

                event.stopPropagation();
                if ($e.attr("class") !== "eb-lbltxtb")
                    $(this).focus();
            });
    };

    this.updateControlUI = function (ebsid, type) {
        let obj = this.rootContainerObj.Controls.GetByName(ebsid);
        let _type = obj.ObjType;
        $.each(obj, function (propName, propVal) {
            let meta = getObjByval(AllMetas["Eb" + _type], "name", propName);
            if (meta && meta.IsUIproperty)
                this.updateUIProp(propName, ebsid, _type);
        }.bind(this));
    };

    this.updateUIProp = function (propName, id, type) {
        let obj = this.rootContainerObj.Controls.GetByName(id);
        let NSS = getObjByval(AllMetas["Eb" + type], "name", propName).UIChangefn;
        if (NSS) {
            let NS1 = NSS.split(".")[0];
            let NS2 = NSS.split(".")[1];
            EbOnChangeUIfns[NS1][NS2](id, obj);
        }
    };

    this.PGobj = new Eb_PropertyGrid({
        id: "Qpgdiv",
        wc: this.wc,
        cid: this.cid,
        $extCont: $(".QpgWrap"),
        noStickButton: true,
        isDraggable: true
    });


    this.pmHide = function (e) {
        setTimeout(function () {
                $('.popmenu').hide(100);
        }, 100);
    }

    this.addPMAns = function () {
        let $e = $(event.target).closest('.qm-add-ans');
        $('.popmenu').show(100);
        let TOP = $e.offset().top;
        let LEFT = $e.offset().left + $e.width() + 15;
        $('.popmenu').css('right', 'unset');
        $('.popmenu').offset({ top: TOP, left: LEFT });
    }

    this.addAnsPopMenu = function () {
        let menuHTML = '';
        let ansCtrls = eb_ACtrlsNames;
        for (let i = 0; i < ansCtrls.length; i++) {
            let obj = new EbObjects[ansCtrls[i]](i);
            menuHTML += `<div class="pmenu-icon-cont" eb-type="${obj.ObjType}" title="${obj.ToolNameAlias}">${obj.ToolIconHtml}</div>`;
        };
        $('.popmenu').append(`<div class='pm-arrow'></div>`);
        $('.popmenu').append(menuHTML);
    }.bind(this);

    this.ScoreChanged = function (e) {
        $(e.target).siblings(`input[name='Choices']`).attr("Score", e.target.value);
    };

    this.quesEdit = function (e) {
        let quesid = $(e.target).closest(".query_tile").attr("queryid");
        $.extend(this.Survey, this.Queries[quesid]);
        this.qstType = this.Survey.QuesType;

        if (this.Survey.Choices[0].Score > 0)
            this.scoreCheckbox = true;
        $("#questionModal").modal("show");
        $(`textarea[name="Question"]`).val(this.Survey.Question);
        $(".qst-opt-cont").empty();
        if (this.qstType === 1 || this.qstType === 2) {
            for (let i = 0; i < this.Survey.Choices.length; i++) {
                this.appendChoice("", this.Survey.Choices[i].Choice, this.Survey.Choices[i].ChoiceId, this.Survey.Choices[i].Score, false);
            }
            $("#userInputType").closest(".q-set-item").hide();
            $("#scoreCheck").closest(".q-set-item").show();
        }
        else if (this.qstType === 3) {
            this.appendRatingCtrl({ value: eval(this.Survey.Choices[0].Choice), isEdit: true, choiceId: this.Survey.Choices[0].ChoiceId });
        }
        else if (this.qstType === 4) {
            this.UIType = this.Survey.Choices[0].Choice;
            this.appendUserInput(this.Survey.Choices[0].ChoiceId);
        }
    };

    this.changeQuestionType = function (e) {
        this.qstType = parseInt($(e.target).closest('.qst-type').attr("qtype"));
        this.Survey.QuesType = this.qstType;

        $(".qst-opt-cont").empty();
        if (this.qstType === 1 || this.qstType === 2) {
            $(".q-opt-control-cont").empty();
            this.appendChoice();
            $("#userInputType").closest(".q-set-item").hide();
            $("#scoreCheck").closest(".q-set-item").show();
        }
        else if (this.qstType === 3) {
            this.appendRatingCtrl({ value: 1, isEdit: false, choiceId: 0 });
            $("#userInputType").closest(".q-set-item").hide();
            $("#scoreCheck").closest(".q-set-item").hide();
        }
        else if (this.qstType === 4) {
            this.appendUserInput();
            $("#scoreCheck").closest(".q-set-item").hide();
            $("#userInputType").closest(".q-set-item").show();
        }
    };

    this.appendChoice = function (temp, val, choice, score, isn) {
        let v = val || "";
        let c = choice || 0;
        let s = score || 0;
        let isnew = (isn === false) ? false : true;

        $(".qst-opt-cont").append(`<div class="col-md-6 q-opt-cont-inner"><div class="q-opt-control-cont float-left"></div>
            <div class='input-group choice'>
                <input type="text" isnew="${isnew}" name="Choices" Score="${s}" placeholder="New choice" ebdel="false" choiceid="${c}" value="${v}" class="qst-choice-text form-control"/>
                <input type="number" class="qst-choice-number form-control" name="Score" min="0" value="${s}" placeholder="Score"/>
                <span class="choice-action input-group-addon btn delete"><i class="fa fa-close" style="color:#c73434;"></i></span>
            </div>
        </div>`);

        this.appendRadioOrCheckbox();

        $(".choice-action").off("click").on("click", this.deleteChoiceClick.bind(this));
        $(".qst-choice-text").last().focus();
        this.addNewChoiceButton();

        if (this.scoreCheckbox) {
            $(".qst-choice-number").show();
            $(".qst-choice-text").css("width", "80%");
            $(".qst-choice-number").css("width", "20%");
        }
        else {
            $(".qst-choice-number").hide();
            $(".qst-choice-text").css("width", "100%");
            $(".qst-choice-number").css("width", "0%");
        }
    };

    this.appendRatingCtrl = function (o) {
        let val = o.value;
        let cid = o.choiceId;
        let isnew = (o.isEdit) ? false : true;
        $(".qst-opt-cont").html(`<div class="rating_input">
                                        <div class="col-md-6 pd-l-0 display-flex">
                                            <label class="col-md-3 pd-l-0 flex-center">Rating</label>
                                            <div class="col-md-9 pd-l-0">
                                                <input type="number" name="RatingCount" isnew="${isnew}" min="1" value="${val}" choiceid="${cid}" class="Rating_control form-control" /> 
                                            </div>
                                        </div>
                                        <div class="col-md-6 pd-l-0">
                                            <div class="rating_star_control">
                                                <span class="fa fa-star"></span>
                                            </div>
                                        </div>
                                    </div>`);
        if (o.isEdit) {
            this.ratingCountOnchange({ target: document.getElementsByClassName("Rating_control")[0] });
        }
        $(`.rating_input input[name="RatingCount"]`).off("click").on("click", this.ratingCountOnchange.bind(this));
        $(`.rating_star_control span`).off("click").on("click", function (e) { $(e.target).toggleClass("R_checked") });
    };

    this.getChoiceType = function (t) {
        let type = new String();
        if (t === 1)
            type = "SingleSelect";
        else if (t === 2)
            type = "MultiSelect";
        else if (t === 3)
            type = "Rating";
        else if (t === 4)
            type = "UserInput";
        return type;
    };

    this.ratingCountOnchange = function (e) {
        let c = e.target.value - this.RatingC;
        for (i = 0; i < Math.abs(c); i++) {
            if (c > 0)
                $(e.target).closest(".rating_input").find(".rating_star_control").append(`<span class="fa fa-star"></span>`);
            else
                $(e.target).closest(".rating_input").find(".rating_star_control span:last-child").remove();
        }
        this.RatingC = e.target.value;
    };

    this.appendUserInput = function (chid) {
        var html = new String();
        var name = new String();
        var cid = chid || 0;

        if (this.UIType === "Text" || this.UIType === "Time") {
            html = `<input type="text" class="form-control" />`;
            name = "Single Line Text";
        }
        else if (this.UIType === "MultiText") {
            html = `<textarea class="form-control"></textarea>`;
            name = "MultiLine Text";
        }
        else if (this.UIType === "Date") {
            html = `<input type="date" class="form-control"/>`;
            name = "Date";
        }
        else {
            return null;
        }

        $(".qst-opt-cont").html(`<div class="user-input-cont" choiceid="${cid}">
                                        <label>${name}</label>
                                        <div class="form-group">
                                            ${html}
                                        </div>
                                    </div>`);
    };

    this.changeUIType = function (e) {
        this.UIType = e.target.value;
        this.appendUserInput();
    };

    this.deleteChoiceClick = function (e) {
        $(e.target).closest(".delete").siblings(`input[name="Choices"]`).attr("ebdel", true);
        $(e.target).closest(".q-opt-cont-inner").hide();
    };

    this.addNewChoiceButton = function () {
        $(".q-opt-new-choice-btn").remove();
        $(".qst-opt-cont").append(`<div class="col-md-12 pd-0 q-opt-new-choice-btn">
            <div class="btn eb_btn-sm eb_btngreen"> <i class="fa fa-plus"></i> Add Choice</div>
        </div>`);
        $(".q-opt-new-choice-btn").off("click").on("click", this.appendChoice.bind(this));
    };

    this.scoreCheckboxChanged = function (e) {
        if ($(e.target).prop("checked") === true) {
            this.scoreCheckbox = true;
            $(".qst-choice-number").show();
            $(".qst-choice-text").css("width", "80%");
            $(".qst-choice-number").css("width", "20%");
        }
        else {
            this.scoreCheckbox = false;
            $(".qst-choice-number").hide();
            $(".qst-choice-text").css("width", "100%");
            $(".qst-choice-number").css("width", "0%");
        }
    };

    this.appendRadioOrCheckbox = function () {
        if (this.qstType === 1) {
            $.each($(".q-opt-control-cont"), function (i, obj) {
                if ($(obj).children().length === 0)
                    $(obj).append(`<div class="col-md-1 pd-0 q-opt-input-cont"><input type="radio" class="q-opt-radio"/></div><div class="col-md-1"></div>`);
            });
        }
        else if (this.qstType === 2) {
            $.each($(".q-opt-control-cont"), function (i, obj) {
                if ($(obj).children().length === 0)
                    $(obj).append(`<div class="col-md-1 pd-0 q-opt-input-cont"><input type="checkbox" class="q-opt-radio"/></div><div class="col-md-1"></div>`);
            });
        }
    }

    this.newQuesSubmit = function (e) {
        this.Survey.Choices.length = 0;
        if (this.qstType === 1 || this.qstType === 2) {
            $(".qst-opt-cont").find(`input[name='Choices']`).each(function (i, ob) {
                var o = new Object();
                o.EbDel = eval($(ob).attr("ebdel"));
                o.ChoiceId = $(ob).attr("choiceid");
                o.Choice = ob.value;
                o.Score = $(ob).attr("Score");
                o.IsNew = eval($(ob).attr("isnew"));
                this.Survey.Choices.push(o);
            }.bind(this));
        }
        else if (this.qstType === 3) {
            let rating = $(".qst-opt-cont .rating_input").find(`input[name='RatingCount']`);
            var o = new Object();
            o.ChoiceId = eval(rating.attr("choiceid"));
            o.Choice = rating.val();
            o.Score = 0;
            o.IsNew = eval(rating.attr("isnew"));
            this.Survey.Choices.push(o);
        }
        else if (this.qstType === 4) {
            let Ui = $(".qst-opt-cont .user-input-cont");
            var o = new Object();
            o.ChoiceId = eval(Ui.attr("choiceid"));
            o.Choice = this.UIType;
            o.Score = 0;
            o.IsNew = true;
            this.Survey.Choices.push(o);
        }

        this.send();
    };

    this.ValidateQues = function () {
        let f = true;
        if (this.Survey.Choices.length > 0) {
            for (let k = 0; k < this.Survey.Choices.length; k++) {
                if (this.Survey.Choices[k].Choice.length <= 0 || this.Survey.Choices[k].Choice === "") {
                    f = false;
                    break;
                }
            }
        }
        else
            f = false;

        return f;
    };

    this.send = function () {
        if (this.ValidateQues()) {
            $.ajax({
                url: "../Survey/SaveQues",
                type: "POST",
                data: { survey: JSON.stringify(this.Survey) },
                beforeSend: function () {
                    $("#survey_menu_load").EbLoader("show");
                }
            }).done(function (result) {
                if (result.status) {
                    $("#survey_menu_load").EbLoader("hide");
                    if (context === "QuestionBank")
                        location.reload();
                    else
                        this.appendQues(result.quesid);

                    $("#questionModal").modal("toggle");
                }
            }.bind(this));
        }
    };

    this.appendQues = function (qid) {
        $("#divQuesSelected").append(`<div class="col-md-4 col-lg-4 col-sm-4 appcontainer" data-id="${qid}" qname="${this.Survey.Question}}">
                                        <a class="appcontainer_inner" queryid="${qid}">
                                            <div class="col-md-12 pd-0">
                                                <h5 class="txtdecor_none">${this.Survey.Question}</h5>
                                                <p class="small txtdecor_none">${this.getChoiceType(this.Survey.QuesType)}</p>
                                            </div>
                                        <span onclick="$(this).closest('.appcontainer').remove();" class="fa fa-close cls_ques"></span>
                                        </a>
                                    </div>`);

        $("#divQuesAll").append(`<div class="col-md-4 col-lg-4 col-sm-4 appcontainer" data-id="${qid}" qname="${this.Survey.Question}">
                            <a class="appcontainer_inner" queryid="${qid}">
                                <div class="col-md-12 pd-0">
                                    <h5 class="txtdecor_none ellipsis-text">${this.Survey.Question}</h5>
                                    <p class="small txtdecor_none">${this.getChoiceType(this.Survey.QuesType)}</p>
                                </div>
                                <input type="checkbox" quesid="${qid}" name="MarkQues" class="MarkQues" />
                            </a>
                        </div>`);
        $(".selection_pane").addClass("hide_pseudo");
        $("#divQuesAll").find(`input[quesid='${qid}']`).prop("checked", true);
    };

    this.init();

};