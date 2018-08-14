var SurveyObj = function (abc,ques) {
    let _chiceCount = 0;
    this.Survey = {
        Question: "",
        QuesType: null,
        Choices: [],
    };
    this.Queries = JSON.parse(ques) || null;

    this.init = function () {
        $(".qst-type").off("click").on("click", this.changeQuestionType.bind(this));
        $('.query_tile').off("click").on("click", this.quesEdit.bind(this));

        $("#userInputType").off("change").on("change", this.getUserInputOption.bind(this));
        $("#requiredCheck").off("change").on("change", this.requiredCheckboxChanged.bind(this));
        $("#scoreCheck").off("change").on("change", this.scoreCheckboxChanged.bind(this));
        $('#survvey_form-modal').on("submit", this.newQuesSubmit.bind(this));
        this.scoreCheckbox = $("#scoreCheck").prop("checked");

        $(`textarea[name="Question"]`).on("change", function (e) { this.Survey.Question = e.target.value; }.bind(this));
        $("#submit_question").off("click").on("click", this.newQuesSubmit.bind(this));
    };

    this.quesEdit = function (e) {
        $(".qst-opt-cont").empty();
        let quesid = $(e.target).closest(".query_tile").attr("queryid");
        this.qstType = this.Queries[quesid].QuesType;
        $("#questionModal").modal("show");
        $(`textarea[name="Question"]`).val(this.Queries[quesid].Question);
        for (let i = 0; i < this.Queries[quesid].Choices.length; i++) {
            this.appendChoice(this.Queries[quesid].Choices[i]);
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
            $("#userInputType").closest(".q-set-item").show();
            this.userinputoption = $("#userInputType option:selected").text().trim();
            this.appendUserInputOption();
            $("#scoreCheck").closest(".q-set-item").hide();
        }
        else {
            $("#scoreCheck").closest(".q-set-item").hide();
            $("#userInputType").closest(".q-set-item").hide();
        }
    };

    this.appendChoice = function (val) {
        let v = val || "";
        $(".qst-opt-cont").append(`<div class="col-md-6 q-opt-cont-inner"><div class="q-opt-control-cont float-left"></div>
            <div class='input-group choice'>
                <input type="text" name="Choices" placeholder="New choice" value="${v}" class="qst-choice-text form-control"/>
                <input type="number" class="qst-choice-number form-control" min="0" placeholder="Score"/>
                <span class="choice-action input-group-addon btn delete"><i class="fa fa-close" style="color:#c73434;"></i></span>
            </div>
        </div>`);    

        this.appendRadioOrCheckbox();

        //<span class="choice-action input-group-addon btn edit"><i class="fa fa-pencil"></i></span>
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

    
    this.deleteChoiceClick = function () {
        $(event.target).closest(".q-opt-cont-inner").hide(350, function () { $(this).remove() });
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

    this.scoreCheckboxChanged = function () {
        if ($(event.target).prop("checked") === true) {
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
        $(".qst-opt-cont").find(`input[name='Choices']`).each(function (i, o) {
            this.Survey.Choices.push(o.value);
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
                $("#survey_menu_load").EbLoader("show");
                $("#questionModal").modal("toggle");
                $("#survey_menu_load").EbLoader("hide");
            }
        }.bind(this));
    };
    
    this.init();

};