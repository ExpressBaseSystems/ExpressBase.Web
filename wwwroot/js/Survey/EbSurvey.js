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
    };

    this.openNewQuestion = function () {
        $("#questionModal").modal("show");
        $(".qst-type").off("click").on("click", this.changeQuestionType.bind(this));
        $("#userInputType").off("change").on("change", this.getUserInputOption.bind(this));
        $("#requiredCheck").off("change").on("change", this.requiredCheckboxChanged.bind(this));
        $("#scoreCheck").off("change").on("change", this.scoreCheckboxChanged.bind(this));
        this.scoreCheckbox = $("#scoreCheck").prop("checked");
    };

    this.changeQuestionType = function () {
        this.qstType = $(event.target).text().trim();
        $(".qst-opt-cont").empty();
        if (this.qstType === "Multiple choice(Single-Select)" || this.qstType === "Multiple choice(Multiple-Select)") {
            $(".q-opt-control-cont").empty();
            this.appendChoice();
            $("#userInputType").closest(".q-set-item").hide();
            $("#scoreCheck").closest(".q-set-item").show();
        }
        else if (this.qstType === "User Input") {
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

    this.appendChoice = function () {
        $(".qst-opt-cont").append(`<div class="col-md-6 q-opt-cont-inner"><div class="q-opt-control-cont"></div>
            <div class='input-group choice'>
                <input type="text" placeholder="New choice" class="qst-choice-text form-control"/>
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
        $(".qst-opt-cont").append(`<div class="col-md-6 q-opt-new-choice-btn">
            <div class="btn"> <i class="fa fa-plus"></i> ADD CHOICE</div>
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
        if (this.qstType === "Multiple choice(Single-Select)") {
            $.each($(".q-opt-control-cont"), function (i, obj) { 
                if ($(obj).children().length === 0)
                    $(obj).append(`<div class="col-md-1 q-opt-input-cont"><input type="radio" class="q-opt-radio"/></div><div class="col-md-1"></div>`);
            });
        }
        else if (this.qstType === "Multiple choice(Multiple-Select)") {
            $.each($(".q-opt-control-cont"), function (i, obj) {
                if ($(obj).children().length === 0)
                    $(obj).append(`<div class="col-md-1 q-opt-input-cont"><input type="checkbox" class="q-opt-radio"/></div><div class="col-md-1"></div>`);
            });
        }
    }
    
    this.init();

};