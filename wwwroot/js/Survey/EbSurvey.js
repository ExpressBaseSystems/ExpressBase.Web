var SurveyObj = function (abc) {

    this.init = function () {
        $(".question-new").off("click").on("click", this.openNewQuestion.bind(this));
    };

    this.openNewQuestion = function () {
        $("#questionModal").modal("show");
    };

    this.init();

};