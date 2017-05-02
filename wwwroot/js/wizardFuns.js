var valObj;// "{'db':'','sip':'11','pnum':'1','tout':'1','ssl':'on','dbname':'1','duname':'1','pwd':'1','sip':'1','pnum':'1','tout':'1','ssl':'on','dbname':'1','duname':'1','pwd':'1','db':'','sip':'1','pnum':'1','tout':'1','ssl':'on','dbname':'1','duname':'1','pwd':'1','sip':'11','pnum':'1','tout':'1','ssl':'on','dbname':'1','duname':'1','pwd':'1','db':'','sip':'1','pnum':'1','tout':'1','ssl':'on','dbname':'1','duname':'1','datarw':'1','sip':'1','pnum':'1','tout':'1','ssl':'on','dbname':'1','duname':'1','datarw':'1','}";
var EbWizard = function (data, accid) {
    this.d = data;
};

EbWizard.prototype = {
    width: null,
    height: null,
    Steps: null,
    Navs: null,
    currentStepNo: 0,
    NextBtn: null,
    PrevBtn: null,
    FinishBtn: null,
    destUrl: null,
    SrcUrl: null,
    Heading: null,
    HeadingIcon: null,
    ValSrcUrl: null,
    Accid: null,


    Init: function (srcUrl, destUrl, w, h, heading, headingIcon, valSrcUrl,accid) {
        EbWizard.prototype.Steps = null;
        EbWizard.prototype.Navs = null;
        EbWizard.prototype.currentStepNo = 0;
        EbWizard.prototype.width = w;
        EbWizard.prototype.height = h;
        EbWizard.prototype.SrcUrl = srcUrl;
        EbWizard.prototype.destUrl = destUrl;
        EbWizard.prototype.Heading = heading;
        EbWizard.prototype.HeadingIcon = headingIcon;
        EbWizard.prototype.ValSrcUrl = valSrcUrl;
        EbWizard.prototype.Accid = accid;
        EbWizard.prototype.RenderModal();
        $(".modal-content").css("width", EbWizard.prototype.width + "px");
        $(".modal-dialog").css("width", EbWizard.prototype.width + "px");
        $(".modal-body").css("height", EbWizard.prototype.height - 159 + "px");
        $("#wiz").empty().append("<div class='controls-group'><i class='fa fa-spinner fa-pulse fa-3x fa-fw eb-loader'></i></div>");

        //alert(((EbWizard.prototype.height - 159) / 2) + "px");
        //$(".modal-content").css("height", EbWizard.prototype.height+100 + "px");
        //$(".controls-group").css("height", 500 + "px");
        //$("[class=controls-group]").children().css("margin-top", ((EbWizard.prototype.height - 159) / 2) + "px");
        $('#dbModal').modal({ backdrop: 'static' });

        $.get(EbWizard.prototype.SrcUrl, function (data) {
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
            $(EbWizard.prototype.FinishBtn).on("click", EbWizard.prototype.SaveWizard);

            if (EbWizard.prototype.Steps.length === 1) {
                $(".controls-group").css("height", (parseInt(EbWizard.prototype.height) - 255) + "px");
                $("#wizprogress").hide();
                EbWizard.prototype.NextBtn.hide();
                EbWizard.prototype.PrevBtn.hide();
                EbWizard.prototype.FinishBtn.show();
            }
            else {
                EbWizard.prototype.NextBtn.show();
                EbWizard.prototype.PrevBtn.hide();
                EbWizard.prototype.FinishBtn.hide();
                $(".controls-group").css("height", (parseInt(EbWizard.prototype.height) - 325) + "px");
            }
            EbWizard.prototype.DbCheck();
            EbWizard.prototype.SyncProgress();
            setTimeout(function () {
                $(EbWizard.prototype.Steps[0]).find('input:eq(0)').focus();
            }, 10);
            if (valSrcUrl != null) {
                EbWizard.prototype.EditWiz();
            }
        });
    },

    SaveWizard: function (e) {
        if (EbWizard.prototype.IsStepValid()) {
            var html = "";
            ObjString = "{";
            for (i = 0; i < EbWizard.prototype.Steps.length; i++)
                html += $(EbWizard.prototype.Steps[i]).html();

            var AllInputs = $(html).find("input");
            $.each(AllInputs, function (i, inp) {
                ObjString += '"' + $(inp).attr("id") + '"' + ':"' + $("#" + $(inp).attr("id")).val() + '",';

            })
            ObjString = ObjString.slice(0, -1) + '}';
            valObj = ObjString;
            console.log("JSON data : " + ObjString);
            //EbWizard.prototype.EditWiz();

            $.post(EbWizard.prototype.destUrl, { "Colvalues": ObjString, "Token": getToken() },
            function (result) {
                if (result)
                    alert(result);
                else
                    alert(result);
            });
        }
    },

    NavsClick: function (e) {
        var clickedStepNo = $($(this).children()[0]).text().trim();
        var clickedStep = $("#step-" + clickedStepNo);

        if (clickedStepNo > EbWizard.prototype.currentStepNo)
            for (var i = EbWizard.prototype.currentStepNo; i < clickedStepNo - 1; i++)
                EbWizard.prototype.NextB(null);
        else
            for (var i = EbWizard.prototype.currentStepNo; i > (clickedStepNo - 1) ; i--)
                EbWizard.prototype.PrevB(null);
    },

    NextB: function (e) {
        if (EbWizard.prototype.IsStepValid()) {
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
        if (EbWizard.prototype.IsStepValid()) {
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
        for (i = 0; i < EbWizard.prototype.Steps.length; i++)
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

    ShowStep: function (stepno) {
        $(EbWizard.prototype.Steps).hide();
        $(EbWizard.prototype.Steps[EbWizard.prototype.currentStepNo]).show().find('input:eq(0)').focus();
    },

    RenderModal: function () {
        $(document.body).append(("<div id='dbModal' class='modal fade'>" +
            "<div class='modal-dialog'>" +
             "   <div class='modal-content'>" +
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
               "             <button name='previousB' id='ebWizPrevB' class='btn btn-md btn-primary  pull-left' type='button'><i class='fa fa-backward' aria-hidden='true'> Previous</i></button>" +
              "              <button name='nextB' id='ebWizNextB' class='btn btn-md btn-primary nextBtn pull-right' type='button'>Next <i class='fa fa-forward' aria-hidden='true'></i></button>" +
             "               <button name='submitB' id='ebWizFinishB' class='btn btn-md btn-success  pull-right' type='submit'><i class='fa fa-floppy-o' aria-hidden='true'> Submit</i></button>" +
            "            </div>" +
           "         </div>" +
          "      </div>" +
         "   </div>" +
        "</div>").replace("@wizHead", EbWizard.prototype.Heading).replace("@HeadingIcon", EbWizard.prototype.HeadingIcon));
    },

    EditWiz: function () {
        $.get(EbWizard.prototype.destUrl, { "Colvalues": JSON.stringify({ "edit": "edit", "op": " ", "id": EbWizard.prototype.Accid }), "Token": getToken() },
          function (result) {
              alert(JSON.stringify(result.data));
              if (result)
                  alert(result);
              else
                  alert(result);
          });
        $('#dbModal').on('shown.bs.modal', function (e) {
            $.each(JSON.parse(valObj), function (key, val) { $("#" + key).val(val); })
        })

    },
    DbCheck: function () {
        $('.dropdown ul li').on("click", function () {
            var v = $(this).attr("value");
            var port_num;
            if (v === '1') {
                port_num = 5432;
            }
            else if (v === '2') {
                port_num = 3306;
            }
            else if (v === '3') {
                port_num = 27017;
            }
            else if (v === '4') {
                port_num = 1433;
            }
            else if (v === '5') {
                port_num = 1521;
            }

            $(this).parent().parent().siblings('.pnum').children('input').val(port_num);
        });
        $('.useSame').on('change', function () {
            if ($(this).is(':checked')) {
                $(this).parent().siblings('.form-group').children('[name=sip_ro]').val($(this).parent().siblings('.form-group').children('[name=sip_rw]').val());
                $(this).parent().siblings('.form-group').children('[name=tout_ro]').val($(this).parent().siblings('.form-group').children('[name=tout_rw]').val());
                $(this).parent().siblings('.form-group').children('[name=ssl_ro]').val($(this).parent().siblings('.form-group').children('[name=ssl_rw]').val());
                $(this).parent().siblings('.form-group').children('[name=dbname_ro]').val($(this).parent().siblings('.form-group').children('[name=dbname_rw]').val());
                $(this).parent().siblings('.form-group').children('[name=duname_ro]').val($(this).parent().siblings('.form-group').children('[name=duname_rw]').val());
                $(this).parent().siblings('.form-group').children('[name=pwd_ro]').val($(this).parent().siblings('.form-group').children('[name=pwd_rw]').val());
            }
            if ($(this).is(':not(:checked)')){
                $(this).parent().siblings('.form-group').children('[name=sip_ro]').val("");
                $(this).parent().siblings('.form-group').children('[name=tout_ro]').val("");
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
        $('[data-toggle=toggle]').bootstrapToggle("on");//toggle init
        $('[data-toggle=toggle]').children().val("true");//set initial value of control
        $('[data-toggle=toggle]').prop("checked", true);// set initial value of  toggle 
        $('[data-toggle=toggle]').on("click", function () {
            $(this).prop("checked", !$(this).prop("checked"));// toggle toggle value
            $(this).children().val($(this).prop("checked"));// set toggle value to control value
        });
    }
};
