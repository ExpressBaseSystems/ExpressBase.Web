var SurveyObj = function (abc) {

    this.init = function () {
        $(".question-new").off("click").on("click", this.openNewQuestion.bind(this));
        this.maxChoice = $("#maxchoice").val();
    };

    this.openNewQuestion = function () {
        $("#questionModal").modal("show");
        $(".qst-type").off("click").on("click", this.changeQuestionType.bind(this));
        $("#maxchoice").bind('keyup mouseup', function () {
            this.maxChoice = $("#maxchoice").val();
            if ($(".question-choice").length < this.maxChoice) {
                this.appendNext();
            }
            else if ($(".question-choice").length > this.maxChoice)
                alert("errorrr......manually delete choice");
        }.bind(this));
        //$(".bootstrap-select a:eq(0)").trigger("click");
    };

    this.changeQuestionType = function () {
        this.option = $(event.target).text().trim();
        $(".qst-opt-cont").empty();
        if (this.option === "Multiple choice(Single-Select)") {
            //$(".qst-opt-cont").append(`<div class="question-Choices"></div>`);
            $(".qst-opt-cont").append(`<div class='choice'><input type="text" placeholder="New choice" class="question-choice"/></div>`);
            $(".question-choice").off("keyup").on("keyup", this.appendNext.bind(this));
        }
        else if (this.option === "Yes/No") {
            $(".qst-opt-cont").append(`<div class="question-Choices"></div>`);
            $(".question-Choices").append(`<div class='choice'><textarea class="question-choice question-choice-yesno" placeholder="Yes"></textarea></div>`);
            $(".question-Choices").append(`<div class='choice'><textarea class="question-choice question-choice-yesno" placeholder="No"></textarea></div>`);
        }
        else if (this.option === "Text") {
            $(".qst-opt-cont").append(`<div class="question-Choices"></div>`);
            $(".question-Choices").append(`<div class='choice' style="width:100%"><textarea class="question-choice question-choice-text" placeholder="Text Input" disabled></textarea></div>`);
        }
        
    };

    this.appendNext = function (e) {
        if (e === undefined) {
            this.appendChoice();
        }
        else {
            if ($(e.target).is($(".question-choice").last())) {
                if ($(".question-choice").length < this.maxChoice) {
                    this.appendChoice();
                }
            }
        }
    };

    this.appendChoice = function () {
        $(".qst-opt-cont").append(`<div class='choice'><input type="text" placeholder="New choice" class="question-choice"/></div>`);
        $(".question-choice").off("keyup").on("keyup", this.appendNext.bind(this));
        $(".question-choice").last().focus();
    };

    this.init();

};