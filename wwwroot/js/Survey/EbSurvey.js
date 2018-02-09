(function ($) {
    if ($.fn.style) {
        return;
    }

    // Escape regex chars with \
    var escape = function (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    // For those who need them (< IE 9), add support for CSS functions
    var isStyleFuncSupported = !!CSSStyleDeclaration.prototype.getPropertyValue;
    if (!isStyleFuncSupported) {
        CSSStyleDeclaration.prototype.getPropertyValue = function (a) {
            return this.getAttribute(a);
        };
        CSSStyleDeclaration.prototype.setProperty = function (styleName, value, priority) {
            this.setAttribute(styleName, value);
            var priority = typeof priority != 'undefined' ? priority : '';
            if (priority != '') {
                // Add priority manually
                var rule = new RegExp(escape(styleName) + '\\s*:\\s*' + escape(value) +
                    '(\\s*;)?', 'gmi');
                this.cssText =
                    this.cssText.replace(rule, styleName + ': ' + value + ' !' + priority + ';');
            }
        };
        CSSStyleDeclaration.prototype.removeProperty = function (a) {
            return this.removeAttribute(a);
        };
        CSSStyleDeclaration.prototype.getPropertyPriority = function (styleName) {
            var rule = new RegExp(escape(styleName) + '\\s*:\\s*[^\\s]*\\s*!important(\\s*;)?',
                'gmi');
            return rule.test(this.cssText) ? 'important' : '';
        }
    }

    // The style function
    $.fn.style = function (styleName, value, priority) {
        // DOM node
        var node = this.get(0);
        // Ensure we have a DOM node
        if (typeof node == 'undefined') {
            return this;
        }
        // CSSStyleDeclaration
        var style = this.get(0).style;
        // Getter/Setter
        if (typeof styleName != 'undefined') {
            if (typeof value != 'undefined') {
                // Set style property
                priority = typeof priority != 'undefined' ? priority : '';
                style.setProperty(styleName, value, priority);
                return this;
            } else {
                // Get style property
                return style.getPropertyValue(styleName);
            }
        } else {
            // Get CSSStyleDeclaration
            return style;
        }
    };
})(jQuery);

var SurveyObj = function (abc) {

    this.init = function () {
        $(".question-new").off("click").on("click", this.openNewQuestion.bind(this));
        this.maxChoice = $("#maxchoice").val();
    };

    this.openNewQuestion = function () {
        $("#questionModal").modal("show");
        $(".qst-type").off("click").on("click", this.changeQuestionType.bind(this));
        $("#maxchoice").off("change").on('change', this.clickMaxChoice.bind(this));
        $("#userInputType").off("change").on("change", this.getUserInputOption.bind(this));
    };

    this.changeQuestionType = function () {
        this.qstType = $(event.target).text().trim();
        $(".qst-opt-cont").empty();
        if (this.qstType === "Multiple choice(Single-Select)" || this.qstType === "Multiple choice(Multiple-Select)") {
            $("#maxchoice").closest(".q-set-item").show();
            this.appendChoice();
            $("#userInputType").closest(".q-set-item").hide();
        }
        else if (this.qstType === "User Input") {
            $("#userInputType").closest(".q-set-item").show();
            $("#maxchoice").closest(".q-set-item").hide();
            this.userinputoption = $("#userInputType option:selected").text().trim();
            this.appendUserInputOption();
        }
        else {
            $("#maxchoice").closest(".q-set-item").hide();
            $("#userInputType").closest(".q-set-item").hide();
        }
        
    };

    this.clickMaxChoice = function () {
        this.maxChoice = $("#maxchoice").val();
        if ($(".qst-choice-text").length < this.maxChoice) {
            this.appendNext();
        }
        else if ($(".qst-choice-text").length > this.maxChoice)
            alert("errorrr......manually delete choice");
    };

    this.appendNext = function (e) {
        if (e === undefined) {
            this.appendChoice();
        }
        else {
            if ($(e.target).is($(".qst-choice-text").last())) {
                if ($(".qst-choice-text").length < this.maxChoice) {
                    this.appendChoice();
                }
                else
                    $("#maxchoice").attr("disabled", false);
            }
        }
    };

    this.appendChoice = function () {
        $(".qst-opt-cont").append(`<div class="col-md-6 q-opt-cont-inner">
            <div class='input-group choice'>
                <input type="text" placeholder="New choice" class="qst-choice-text form-control"/>
                <input type="number" class="qst-choice-number form-control" value="0"/>
                <span class="choice-action input-group-addon btn"><i class="fa fa-pencil"></i></span>
                <span class="choice-action input-group-addon btn"><i class="fa fa-close" style="color:#c73434;"></i></span>
            </div>
        </div>`);

        $(".qst-choice-text").off("keyup").on("keyup", this.appendNext.bind(this));
        $(".qst-choice-text").off("focusin").on("focusin", this.textOnfocus.bind(this));
        $(".qst-choice-text").off("focusout").on("focusout", this.textOnfocusout.bind(this));
        $(".choice").off("mouseover").on("mouseover", this.textOnhover.bind(this));

        $(".qst-choice-text").last().focus();
        $("#maxchoice").attr("disabled", true);
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

    this.textOnfocus = function () {
        $(event.target).siblings(".choice-action:eq(0)").hide();
        $(event.target).siblings(".choice-action:eq(1)").show();
    };

    this.textOnfocusout = function () {
        $(event.target).attr("disabled", true);
        $(event.target).siblings(".choice-action").show();
    }

    this.textOnhover = function () {
        //$(".choice-action").show();
    };

    this.init();

};