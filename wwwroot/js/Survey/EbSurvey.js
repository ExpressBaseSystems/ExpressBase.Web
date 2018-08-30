var SurveyObj = function (ques,context) {
    let _chiceCount = 0;
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
            //$(".qst-opt-cont").empty();
        });
        $(".qst-type").off("click").on("click", this.changeQuestionType.bind(this));
        $('body').off("click").on("click", ".query_tile", this.quesEdit.bind(this));

        $("#scoreCheck").off("change").on("change", this.scoreCheckboxChanged.bind(this));

        this.scoreCheckbox = $("#scoreCheck").prop("checked");

        $(`textarea[name="Question"]`).on("change", function (e) { this.Survey.Question = e.target.value; }.bind(this));
        $("#submit_question").off("click").on("click", this.newQuesSubmit.bind(this));
        $(`body`).off("change").on("change", ".qst-choice-number", this.ScoreChanged.bind(this));
        $("#userInputType").off("change").on("change", this.changeUIType.bind(this));
    };

    this.ScoreChanged = function (e) {
        $(e.target).siblings(`input[name='Choices']`).attr("Score", e.target.value);
    };

    this.quesEdit = function (e) {
        let quesid = $(e.target).closest(".query_tile").attr("queryid");
        $.extend(this.Survey, this.Queries[quesid]);
        this.qstType = this.Survey.QuesType;

        if (this.Survey.Choices[0].Score > 0)
            this.scoreCheckbox = true;

        $(".qst-opt-cont").empty();
        $("#questionModal").modal("show");
        $(`textarea[name="Question"]`).val(this.Survey.Question);
        if (this.qstType === 1 || this.qstType === 2) {
            for (let i = 0; i < this.Survey.Choices.length; i++) {
                this.appendChoice("", this.Survey.Choices[i].Choice, this.Survey.Choices[i].ChoiceId, this.Survey.Choices[i].Score, false);
            }
            $("#userInputType").closest(".q-set-item").hide();
            $("#scoreCheck").closest(".q-set-item").show();
        }
        else if (this.qstType === 3) {
            this.appendRatingCtrl({ value: eval(this.Survey.Choices[0].Choice), isEdit: true, choiceId: this.Survey.Choices[0].ChoiceId});
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
        $(".qst-opt-cont").html(`<div class="rating_input">
                                        <div class="col-md-6 pd-l-0 display-flex">
                                            <label class="col-md-3 pd-l-0 flex-center">Rating</label>
                                            <div class="col-md-9 pd-l-0">
                                                <input type="number" name="RatingCount" min="1" value="${val}" choiceid="${cid}" class="Rating_control form-control" /> 
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
            o.IsNew = true;
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

    this.send = function () {
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