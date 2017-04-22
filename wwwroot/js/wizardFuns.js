var EbWizard = function (data, accid) {
    this.d = data;
    this.id = accid;
};

EbWizard.prototype = {
    width: "400px",
    height:"500px",
    Steps: null,
    Navs: null,
    currentStepNo: 0,
    NextBtn: null,
    PrevBtn: null,
    FinishBtn: null,

    Populate: function (url) {
        EbWizard.prototype.Steps = null;
        EbWizard.prototype.Navs = null;
        EbWizard.prototype.currentStepNo = 0;

        $.get(url, function (data) {
            $("#wiz").empty().append($.parseHTML(data));
            EbWizard.prototype.Steps = $(".ebWizStep");
            EbWizard.prototype.ShowStep();
            $("#wizprogress").empty().append(EbWizard.prototype.CreateProgress());
            EbWizard.prototype.Navs = $("#wizprogress").children();
            EbWizard.prototype.NextBtn = $("#ebWizNextB");
            EbWizard.prototype.PrevBtn = $("#ebWizPrevB");
            EbWizard.prototype.FinishBtn = $("#ebWizFinishB");
            $(EbWizard.prototype.NextBtn).off("click").on("click", EbWizard.prototype.NextB);
            $(EbWizard.prototype.PrevBtn).off("click").on("click", EbWizard.prototype.PrevB);
            $(EbWizard.prototype.Navs).off("click").on("click", EbWizard.prototype.NavsClick);

            EbWizard.prototype.NextBtn.show();
            EbWizard.prototype.PrevBtn.hide();
            EbWizard.prototype.FinishBtn.hide();

            EbWizard.prototype.SyncProgress();
            setTimeout(function () {
                $(EbWizard.prototype.Steps[0]).find('input:eq(0)').focus();
                $('[data-toggle=toggle]').bootstrapToggle();
            }, 10);

            $(".modal-content").css("width", EbWizard.prototype.width);
            $(".modal-body").css("height", (parseInt(EbWizard.prototype.height) - 159) + "px");
            $(".controls-group").css("height", (parseInt(EbWizard.prototype.height) - 325) + "px");
        });
    },

    SaveWizard: function (e) {
        var html = "";
        ObjString = "";
        for (i = 0; i < EbWizard.prototype.Steps.length; i++)
            html += $(EbWizard.prototype.Steps[i]).html();

        var AllInputs = $(html).find("input");
        $.each(AllInputs, function (i, inp) {
            ObjString += $(inp).attr("name") + ':"' + $("#" + $(inp).attr("id")).val() + '",';
        })
        console.log("JSON data : " + ObjString);
    },

    NavsClick: function (e) {
        var clickedStepNo = $($(this).children()[0]).text().trim();
        var clickedStep = $("#step-" + clickedStepNo);

        if (clickedStepNo > EbWizard.prototype.currentStepNo)
            for (var i = EbWizard.prototype.currentStepNo; i < clickedStepNo - 1; i++)
                EbWizard.prototype.NextB(null);
        else
            for (var i = EbWizard.prototype.currentStepNo; i > (clickedStepNo - 1); i--)
                EbWizard.prototype.PrevB(null);
    },

    NextB: function (e) {
        if(EbWizard.prototype.IsStepValid()) {
            ++EbWizard.prototype.currentStepNo;
            EbWizard.prototype.ShowStep();
            if (EbWizard.prototype.currentStepNo > 0) {
                EbWizard.prototype.NextBtn.show();
                EbWizard.prototype.PrevBtn.show();
                EbWizard.prototype.FinishBtn.hide();
            }
            if (EbWizard.prototype.currentStepNo === EbWizard.prototype.Steps.length - 1) {
                EbWizard.prototype.NextBtn.hide();
                EbWizard.prototype.PrevBtn.show();
                EbWizard.prototype.FinishBtn.show();
            }
        }
        EbWizard.prototype.SyncProgress();
    },

    PrevB: function (e) {
        if(EbWizard.prototype.IsStepValid()) {
            --EbWizard.prototype.currentStepNo;
            EbWizard.prototype.ShowStep();
            if (EbWizard.prototype.currentStepNo > 0) {
                EbWizard.prototype.NextBtn.show();
                EbWizard.prototype.PrevBtn.show();
                EbWizard.prototype.FinishBtn.hide();

            }
            if (EbWizard.prototype.currentStepNo === 0) {
                EbWizard.prototype.NextBtn.show();
                EbWizard.prototype.PrevBtn.hide();
                EbWizard.prototype.FinishBtn.hide();
            }
            $($(EbWizard.prototype.Navs[EbWizard.prototype.currentStepNo]).children()[0]).removeClass("btn-success");
        }
        EbWizard.prototype.SyncProgress();
    },

    SyncProgress: function () {
        for(i = 0; i < EbWizard.prototype.Steps.length; i++)
            $($(EbWizard.prototype.Navs[i]).children()[0]).removeClass("btn-primary");

        $($(EbWizard.prototype.Navs[EbWizard.prototype.currentStepNo]).children()[0]).removeClass("btn-default").removeClass("btn-success").addClass("btn-primary");
    },

    CreateProgress: function () {
        var html = "";
        var repl = "<div class='stepwizard-step'><div id='navB1' purpose='nav' class='btn btn-default btn-circle'>@idx</div><p>@stepName</p><a id='aHi' href='#step-1' style='visibility:hidden;'></a></div>";

        for (i = 0; i < EbWizard.prototype.Steps.length; i++)
            html += repl.replace("@stepName", $(EbWizard.prototype.Steps[i]).children(0).html()).replace("@idx", (i + 1).toString());

        return html;
    },

    IsStepValid: function () {
        var currentInputs = $(EbWizard.prototype.Steps[EbWizard.prototype.currentStepNo]).find("input");
        var res = true;
        for (var i = 0; i < currentInputs.length; i++) {
            if (!currentInputs[i].validity.valid) {
                $(currentInputs[i]).closest(".form-group").addClass("has-error");
                res = false;
            }
            else {
                $(currentInputs[i]).closest(".form-group").removeClass("has-error");
                $(currentInputs[i]).attr("id");
            }
        }
        $(EbWizard.prototype.Steps[EbWizard.prototype.currentStepNo]).find(".has-error input:eq(0)").focus();
        $($(EbWizard.prototype.Navs[EbWizard.prototype.currentStepNo]).children()[0]).removeClass("btn-default").addClass("btn-success");
        return res;

    },

    ShowStep: function(stepno) {
        $(EbWizard.prototype.Steps).hide();
        $(EbWizard.prototype.Steps[EbWizard.prototype.currentStepNo]).show().find('input:eq(0)').focus();
    }
};