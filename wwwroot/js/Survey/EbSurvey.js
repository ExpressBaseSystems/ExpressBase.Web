var SurveyObj = function (abc) {

    this.init = function () {
        $(".question-new").off("click").on("click", this.openNewQuestion.bind(this));
    };

    this.openNewQuestion = function () {
        $("#questionModal").modal("show");
        $(".bootstrap-select a").off("click").on("click", this.changeQuestionType.bind(this));
        $(".bootstrap-select a:eq(0)").trigger("click");
    };

    this.changeQuestionType = function (e) {
        this.option = $(e.target).text();
        $("#question-type").empty();
        if (this.option === "Multiple Choice") {
            $("#question-type").append(`<div class="question-Choices"></div>`);
            $(".question-Choices").append(`<div class='choice'><input type="text" placeholder="New choice" class="question-choice"/></div>`);
            $(".question-choice").off("keyup").on("keyup", this.appendNext.bind(this));
        }
        else if (this.option === "Yes/No") {
            $("#question-type").append(`<div class="question-Choices"></div>`);
            $(".question-Choices").append(`<div class='choice'><textarea class="question-choice question-choice-yesno" placeholder="Yes"></textarea></div>`);
            $(".question-Choices").append(`<div class='choice'><textarea class="question-choice question-choice-yesno" placeholder="No"></textarea></div>`);
        }
        else if (this.option === "Text") {
            $("#question-type").append(`<div class="question-Choices"></div>`);
            $(".question-Choices").append(`<div class='choice' style="width:100%"><textarea class="question-choice question-choice-text" placeholder="Text Input" disabled></textarea></div>`);
        }
        
    };

    this.appendNext = function (e) {
        if ($(e.target).is($(".question-choice").last())) {
            $(".question-Choices").append(`<div class='choice'><input type="text" placeholder="New choice" class="question-choice"/></div>`);
            $(".question-choice").off("keyup").on("keyup", this.appendNext.bind(this));
        }
    };

    this.init();

};