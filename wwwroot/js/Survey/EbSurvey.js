var SurveyObj = function (abc, ques) {
    let _chiceCount = 0;
    this.Survey = {
        QuesId: 0,
        Question: "",
        QuesType: null,
        Choices: [],
    };
    this.RatingC = 1;

    this.Queries = JSON.parse(ques) || null;

    this.init = function () {
        $("#questionModal").on('show.bs.modal', function () {
            //$(".qst-opt-cont").empty();
        });
        $(".qst-type").off("click").on("click", this.changeQuestionType.bind(this));
        $('body').off("click").on("click", ".query_tile", this.quesEdit.bind(this));

        $("#userInputType").off("change").on("change", this.getUserInputOption.bind(this));
        $("#requiredCheck").off("change").on("change", this.requiredCheckboxChanged.bind(this));
        $("#scoreCheck").off("change").on("change", this.scoreCheckboxChanged.bind(this));
        $('#survvey_form-modal').on("submit", this.newQuesSubmit.bind(this));
        this.scoreCheckbox = $("#scoreCheck").prop("checked");

        $(`textarea[name="Question"]`).on("change", function (e) { this.Survey.Question = e.target.value; }.bind(this));
        $("#submit_question").off("click").on("click", this.newQuesSubmit.bind(this));
        $(`body`).off("change").on("change", ".qst-choice-number", this.ScoreChanged.bind(this));
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
        for (let i = 0; i < this.Survey.Choices.length; i++) {
            this.appendChoice("", this.Survey.Choices[i].Choice, this.Survey.Choices[i].ChoiceId, this.Survey.Choices[i].Score, false);
        }
        $("#userInputType").closest(".q-set-item").hide();
        $("#scoreCheck").closest(".q-set-item").show();
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
            this.appendRatingCtrl();
        }
        //else if (this.qstType === 3) {
        //    $("#userInputType").closest(".q-set-item").show();
        //    this.userinputoption = $("#userInputType option:selected").text().trim();
        //    this.appendUserInputOption();
        //    $("#scoreCheck").closest(".q-set-item").hide();
        //}
        else {
            $("#scoreCheck").closest(".q-set-item").hide();
            $("#userInputType").closest(".q-set-item").hide();
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

    this.appendRatingCtrl = function () {
        $(".qst-opt-cont").html(`<div class="rating_input">
                                        <div class="col-md-6 pd-l-0 display-flex">
                                            <label class="col-md-3 pd-l-0 flex-center">Rating</label>
                                            <div class="col-md-9 pd-l-0">
                                                <input type="number" name="RatingCount" min="1" value="1" class="form-control" /> 
                                            </div>
                                        </div>
                                        <div class="col-md-6 pd-l-0">
                                            <div class="rating_star_control">
                                                <span class="fa fa-star"></span>
                                            </div>
                                        </div>
                                    </div>`);
        $(`.rating_input input[name="RatingCount"]`).off("click").on("click", this.ratingCountOnchange.bind(this));
        $(`.rating_star_control span`).off("click").on("click", function (e) { $(e.target).toggleClass("R_checked") });
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

    this.appendUserInputOption = function () {
        $(".qst-opt-cont").empty();
        if (this.userinputoption === "Text") {
            $(".qst-opt-cont").append(`<div class="choice"><input type="text" placeholder="Text Input" class="q-user-choice-text form-control"/></div>`);
        }
        else if (this.userinputoption === "Multi Text") {
            $(".qst-opt-cont").append(`<div class="choice"><textarea placeholder="Text Input" class="q-user-choice-textarea form-control"></textarea></div>`);
        }
    };

    this.getUserInputOption = function () {
        this.userinputoption = $("#userInputType option:selected").text().trim();
        this.appendUserInputOption();
    };

    this.deleteChoiceClick = function (e) {
        $(e.target).closest(".delete").siblings(`input[name="Choices"]`).attr("ebdel", true);
        $(e.target).closest(".q-opt-cont-inner").hide();
    };

    this.addNewChoiceButton = function () {
        $(".q-opt-new-choice-btn").remove();
        $(".qst-opt-cont").append(`<div class="col-md-12 pd-0 q-opt-new-choice-btn">
            <div class="btn"> <i class="fa fa-plus"></i> Add Choice</div>
        </div>`);
        $(".q-opt-new-choice-btn").off("click").on("click", this.appendChoice.bind(this));
    };

    this.requiredCheckboxChanged = function () {
        if ($(event.target).prop("checked") === true)
            $(".q-label-requird").show();
        else
            $(".q-label-requird").hide();

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
        $(".qst-opt-cont").find(`input[name='Choices']`).each(function (i, ob) {
            var o = new Object();
            o.EbDel = eval($(ob).attr("ebdel"));
            o.ChoiceId = $(ob).attr("choiceid");
            o.Choice = ob.value;
            o.Score = $(ob).attr("Score");
            o.IsNew = eval($(ob).attr("isnew"));
            this.Survey.Choices.push(o);
        }.bind(this));

        $.ajax({
            url: "../Survey/SaveQues",
            type: "POST",
            data: { survey: JSON.stringify(this.Survey) },
            beforeSend: function () {
                $("#survey_menu_load").EbLoader("show");
            }
        }).done(function (result) {
            if (result) {
                $("#survey_menu_load").EbLoader("hide");
                location.reload();
                $("#questionModal").modal("toggle");
            }
        }.bind(this));
    };

    this.init();

};