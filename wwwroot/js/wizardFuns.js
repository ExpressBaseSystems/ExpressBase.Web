var EditObj;// "{'db':'','sip':'11','pnum':'1','tout':'1','ssl':'on','dbname':'1','duname':'1','pwd':'1','sip':'1','pnum':'1','tout':'1','ssl':'on','dbname':'1','duname':'1','pwd':'1','db':'','sip':'1','pnum':'1','tout':'1','ssl':'on','dbname':'1','duname':'1','pwd':'1','sip':'11','pnum':'1','tout':'1','ssl':'on','dbname':'1','duname':'1','pwd':'1','db':'','sip':'1','pnum':'1','tout':'1','ssl':'on','dbname':'1','duname':'1','datarw':'1','sip':'1','pnum':'1','tout':'1','ssl':'on','dbname':'1','duname':'1','datarw':'1','}";
var EbWizard = function (srcUrl, destUrl, w, h, heading, headingIcon, EditObj) {
    this.width = w;
    this.height = h;
    this.Steps;
    this.Navs;
    this.currentStepNo = 0;
    this.NextBtn;
    this.PrevBtn;
    this.FinishBtn;
    this.SrcUrl = srcUrl;
    this.destUrl = destUrl;
    this.Heading = heading;
    this.HeadingIcon = headingIcon;
    this.EditObj = EditObj;

};

EbWizard.prototype.Init = function () {
    this.RenderModal();
    this.NextBtn = $("#ebWizNextB");
    this.PrevBtn = $("#ebWizPrevB");
    this.FinishBtn = $("#ebWizFinishB");

    this.NextBtn.hide();
    this.PrevBtn.hide();
    this.FinishBtn.hide();
    $(".eb-loader").css("top", (parseInt(this.height) / 2) + "px");
    $(".modal-content").css("width", this.width + "px");
    $(".modal-dialog").css("width", this.width + "px");
    // $("#wiz").empty().append("<i class='fa fa-spinner fa-pulse fa-3x fa-fw center-block'></i>");
    $("#wiz").children().css("margin-top", this.height / 2 - 110 + "px");
    $(".modal-body").css("height", this.height - 163 + "px");
    $('#dbModal').modal({ backdrop: 'static' });
    $('#dbModal').on('hidden.bs.modal', function (e) {
        $('#dbModal').remove();
    });
    $.get(this.SrcUrl, this.Drawsteps.bind(this));
    var self = this;

    $('#dbModal').on('shown.bs.modal', function (e) {

        if (self.EditObj)
            self.EditWiz();
    });
};

EbWizard.prototype.Drawsteps = function (data) {
    this.DbCheck();
    $("#wiz").empty().append($.parseHTML(data));
    $(".eb-loader").hide();
    this.Steps = $(".ebWizStep");
    this.ShowStep();
    $("#wizprogress").empty().append(this.CreateProgress());
    this.Navs = $("#wizprogress").children();
    $(this.NextBtn).off("click").on("click", this.NextB.bind(this));
    $(this.PrevBtn).off("click").on("click", this.PrevB.bind(this));
    $(this.Navs).off("click").on("click", this.NavsClick.bind(this));
    $(this.FinishBtn).on("click", this.SaveWizard.bind(this));


    if (this.Steps.length === 1) {
        $(".controls-group").css("height", (parseInt(this.height) - 245) + "px");
        $("#wizprogress").hide();
        this.NextBtn.hide();
        this.PrevBtn.hide();
        this.FinishBtn.show();
    }
    else {
        this.NextBtn.show();
        this.PrevBtn.hide();
        this.FinishBtn.hide();
        $(".controls-group").css("height", (parseInt(this.height) - 315) + "px");
    }
    $(".modal-body").css("height", this.height - 163 + "px");
    this.SyncProgress();
    this.DbCheck();
    setTimeout(this.TimeOutFunc.bind(this), 10);
}

EbWizard.prototype.TimeOutFunc = function () {
    $(this.Steps[0]).find('input:eq(0)').focus();
}

EbWizard.prototype.SaveWizard = function () {
    if (this.IsStepValid()) {
        $(".eb-loader").show();
        var html = "";
        ObjString = "{";
        for (i = 0; i < this.Steps.length; i++)
            html += $(this.Steps[i]).html();

        var AllInputs = $(html).find("input");
        $.each(AllInputs, function (i, inp) {
            ObjString += '"' + $(inp).attr("id") + '"' + ':"' + $("#" + $(inp).attr("id")).val() + '",';

        })
        ObjString = ObjString.slice(0, -1) + '}';
        EditObj = ObjString;
        console.log("JSON data : " + ObjString);

        $.post(this.destUrl, { "Colvalues": ObjString, "Token": getToken() },
        function (result) {
            if (result) {
                $(".eb-loader").hide();
                alert(result);
            }
            else
                alert(result);
        });
    }
};

EbWizard.prototype.NavsClick = function () {
    var clickedStepNo = $($(this).children()[0]).text().trim();
    var clickedStep = $("#step-" + clickedStepNo);
    //alert("NavsClick =" + this.currentStepNo);
    if (clickedStepNo > this.currentStepNo) {
        for (var i = this.currentStepNo; i < (clickedStepNo - 1) ; i++)
            this.NextB.bind(this)();
    }
    else {
        for (var i = this.currentStepNo; i > (clickedStepNo - 1) ; i--)
            this.PrevB.bind(this)();
    }
};

EbWizard.prototype.NextB = function () {
    if (this.IsStepValid()) {
        ++this.currentStepNo;
        this.ShowStep();
        if (this.currentStepNo > 0) {
            this.NextBtn.show();
            this.PrevBtn.show();
            this.FinishBtn.hide();
        }
        if (this.currentStepNo === this.Steps.length - 1) {
            this.NextBtn.hide();
            this.PrevBtn.show();
            this.FinishBtn.show();
        }
    }
    this.SyncProgress();
};

EbWizard.prototype.PrevB = function () {
    if (this.IsStepValid()) {
        --this.currentStepNo;
        this.ShowStep();
        if (this.currentStepNo > 0) {
            this.NextBtn.show();
            this.PrevBtn.show();
            this.FinishBtn.hide();

        }
        if (this.currentStepNo === 0) {
            this.NextBtn.show();
            this.PrevBtn.hide();
            this.FinishBtn.hide();
        }
        $($(this.Navs[this.currentStepNo]).children()[0]).removeClass("btn-success");
    }
    this.SyncProgress();
};

EbWizard.prototype.SyncProgress = function () {
    for (i = 0; i < this.Steps.length; i++)
        $($(this.Navs[i]).children()[0]).removeClass("btn-primary");

    $($(this.Navs[this.currentStepNo]).children()[0]).removeClass("btn-default").removeClass("btn-success").addClass("btn-primary");
};

EbWizard.prototype.CreateProgress = function () {
    var html = "";
    var repl = "<div class='stepwizard-step'><div id='navB1' purpose='nav' class='btn btn-default btn-circle'>@idx</div><p>@stepName</p><a id='aHi' href='#step-1' style='visibility:hidden;'></a></div>";

    for (i = 0; i < this.Steps.length; i++)
        html += repl.replace("@stepName", $(this.Steps[i]).children(0).html()).replace("@idx", (i + 1).toString());

    return html;
};

EbWizard.prototype.IsStepValid = function () {
    var currentInputs = $(this.Steps[this.currentStepNo]).find("input");
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
    $(this.Steps[this.currentStepNo]).find(".has-error input:eq(0)").focus();
    $($(this.Navs[this.currentStepNo]).children()[0]).removeClass("btn-default").addClass("btn-success");
    return res;
};

EbWizard.prototype.ShowStep = function () {
    $(this.Steps).hide();
    $(this.Steps[this.currentStepNo]).show().find('input:eq(0)').focus();
};

EbWizard.prototype.RenderModal = function () {
    $(document.body).append(("<div id='dbModal' class='modal fade'>" +
        "<div class='modal-dialog'>" +
         "   <div class='modal-content'>" +
        "<div class='eb-loader'><i class='fa fa-spinner fa-pulse fa-3x fa-fw center-block'></i></div>" +
          "      <div class='modal-header'>" +
           "         <button type='button' class='close' data-dismiss='modal' aria-hidden='true'>×</button>" +
            "        <h4 class='modal-title'><i class='fa @HeadingIcon' aria-hidden='true'></i> @wizHead</h4>" +
             "   </div>" +
              "  <div class='modal-body'>" +
               "     <div class='stepwizard'>" +
                "        <div class='stepwizard-row setup-panel' id='wizprogress'></div>" +
                 "   </div>" +
                  "  <div id='wiz' class='wiz-inputs'></div>" +
              "  </div>" +
             "   <div class='modal-footer'>" +
            "        <div id='wizfoot'>" +
           "             <button name='previousB' id='ebWizPrevB'  class='btn btn-md btn-primary  pull-left' type='button'><i class='fa fa-backward' aria-hidden='true'> Previous</i></button>" +
          "              <button name='nextB' id='ebWizNextB'  class='btn btn-md btn-primary nextBtn pull-right' type='button'>Next <i class='fa fa-forward' aria-hidden='true'></i></button>" +
         "               <button name='submitB' id='ebWizFinishB'  class='btn btn-md btn-success  pull-right' type='submit'><i class='fa fa-floppy-o' aria-hidden='true'> Submit</i></button>" +
        "            </div>" +
       "         </div>" +
      "      </div>" +
     "   </div>" +
    "</div>").replace("@wizHead", this.Heading).replace("@HeadingIcon", this.HeadingIcon));
};

EbWizard.prototype.EditWiz = function () {
    $.each(this.EditObj, function (key, val) {
        $("#" + key).val(val);
        //console.log("key= " + key + "val=" + val);
    });
};

EbWizard.prototype.DbCheck = function () {
    function UseSame() {
        $('[name=sip_rw]').keyup(function () {
            if (($(this).parent().siblings('.usesameval').children('.useSame')).is(':checked')) {
                $(this).parent().siblings('.form-group').children('[name=sip_ro]').val($(this).val());
            }
        });
        $('[name=pnum_rw]').keyup(function () {
            if (($(this).parent().siblings('.usesameval').children('.useSame')).is(':checked')) {
                $(this).parent().siblings('.form-group').children('[name=pnum_ro]').val($(this).val());
            }
        });
        $('[name=tout_rw]').on('keyup mouseup',function () {
            if (($(this).parent().siblings('.usesameval').children('.useSame')).is(':checked')) {
                $(this).parent().siblings('.form-group').children('[name=tout_ro]').val($(this).val());
            }
        });
        $('[name=ssl_rw]').keyup(function () {
            if (($(this).parent().siblings('.usesameval').children('.useSame')).is(':checked')) {
                alert($(this).parent().siblings('.form-group').children().children('[name=ssl_ro]').val() + $(this).val());
                $(this).parent().siblings('.form-group').children().children('[name=ssl_ro]').val($(this).val());
            }
        });
        $('[name=dbname_rw]').keyup(function () {
            if (($(this).parent().siblings('.usesameval').children('.useSame')).is(':checked')) {
                $(this).parent().siblings('.form-group').children('[name=dbname_ro]').val($(this).val());
            }
        });
        $('[name=duname_rw]').keyup(function () {
            if (($(this).parent().siblings('.usesameval').children('.useSame')).is(':checked')) {
                $(this).parent().siblings('.form-group').children('[name=duname_ro]').val($(this).val());
            }
        });
        $('[name=pwd_rw]').keyup(function () {
            if (($(this).parent().siblings('.usesameval').children('.useSame')).is(':checked')) {
                $(this).parent().siblings('.form-group').children('[name=pwd_ro]').val($(this).val());
            }
        });
    }
    $('#dbModal').on('shown.bs.modal', function (e) {
        if ($('.useSame').is(':checked')) {
         $('.useSame').parent().siblings('.ro').hide();
        }
        if ($('.useSame').is(':not(:checked)')) {
            $(this).parent().siblings('.ro').show();
        }
        UseSame();
    });

    $('.dropdown ul li').on("click", function () {
        var v = $(this).attr("value");
        var port_num;
        if (v === '0') {
            port_num = 5432;
        }
        else if (v === '1') {
            port_num = 3306;
        }
        else if (v === '2') {
            port_num = 1433;
        }
        else if (v === '3') {
            port_num = 1521;
        }
        else if (v === '4') {
            port_num = 27017;
        }

        $(this).parent().parent().siblings('.pnum').children('input').val(port_num);
    });



    $('.useSame').on('change', function () {
        if ($(this).is(':checked')) {
            $(this).parent().siblings('.form-group').children('[name=sip_ro]').val($(this).parent().siblings('.form-group').children('[name=sip_rw]').val());
            $(this).parent().siblings('.form-group').children('[name=tout_ro]').val($(this).parent().siblings('.form-group').children('[name=tout_rw]').val());
            $(this).parent().siblings('.form-group').children('[name=ssl_ro]').val($(this).parent().siblings('.form-group').children().children('[name=ssl_rw]').val());
            $(this).parent().siblings('.form-group').children('[name=dbname_ro]').val($(this).parent().siblings('.form-group').children('[name=dbname_rw]').val());
            $(this).parent().siblings('.form-group').children('[name=duname_ro]').val($(this).parent().siblings('.form-group').children('[name=duname_rw]').val());
            $(this).parent().siblings('.form-group').children('[name=pwd_ro]').val($(this).parent().siblings('.form-group').children('[name=pwd_rw]').val());
            $(this).parent().siblings('.ro').hide();
        }
        if ($(this).is(':not(:checked)')) {
            $(this).parent().siblings('.ro').show();
            $(this).parent().siblings('.form-group').children('[name=sip_ro]').val("");
            $(this).parent().siblings('.form-group').children('[name=tout_ro]').val(500);
            $(this).parent().siblings('.form-group').children('[name=ssl_ro]').val("");
            $(this).parent().siblings('.form-group').children('[name=dbname_ro]').val("");
            $(this).parent().siblings('.form-group').children('[name=duname_ro]').val("");
            $(this).parent().siblings('.form-group').children('[name=pwd_ro]').val("");
        }
    });
    $('.dropdown ul li').click(function () {
        $(this).parent().siblings('input').val($(this).attr("value"));
        $(this).parent().siblings('[data-toggle=dropdown]').html("<span>" + $(this).html() + "</span>");
    });
    $('[data-toggle=toggle]').bootstrapToggle('on');//toggle init
    $('[data-toggle=toggle]').val("true");//set initial value of control
    $('[data-toggle=toggle]').prop("checked", true);// set initial value of  toggle 

    $('[data-toggle=toggle]').on("click", function () {
        $(this).prop("checked", !$(this).prop("checked"));// toggles toggle value
        $(this).children().val($(this).prop("checked"));// set toggle value to control value
        var IsChkd = ($(this).parent().siblings().children('.useSame').is(':checked'));
        var isUpperToggle = ($(this).children('input').attr('name') === 'ssl_rw');
        if (IsChkd && isUpperToggle) {
            $(this).parent().siblings().children().children('[name=ssl_ro]').prop("checked", $(this).prop("checked"));
            $(this).parent().siblings().children().children('[name=ssl_ro]').val($(this).prop("checked"));
            $(this).val($(this).prop("checked"));
        }

    });

    $('.db_selector input[type=radio]').on("click", function () {
        var dbconf = $('.db_selector input[type=radio]:checked').val();
        $('#dbModal').modal('hide');
        setTimeout(function () {
            if (dbconf === 'simple') {
                var DBwizard_sim = new EbWizard("http://localhost:53431/Tenant/SimpleDbConf", "https://localhost:44377/infra/", 800, 600, "Configure Database - Simple", "fa-database");
                DBwizard_sim.Init();
                var accid = $(this).attr("data-accid")
            }
            if (dbconf === 'advanced') {
                var DBwizard_adv = new EbWizard("http://localhost:53431/Tenant/dbConfig", "https://localhost:44377/infra/", 800, 600, "Configure Database - Advanced", "fa-database");
                DBwizard_adv.Init();
                var accid = $(this).attr("data-accid")
            }
        }, 401);

    });

};