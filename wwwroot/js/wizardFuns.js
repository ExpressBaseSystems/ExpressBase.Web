var EbWizard = function (srcUrl, destUrl, w, h, heading, headingIcon, acid, editObj, customWizFunc, noFinishbtn) {
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
    this.EditObj = editObj;
    this.Acid = acid;
    this.CustomWizFunc = customWizFunc;
    this.NoFinishbtn = noFinishbtn;

    this.Init = function () {
        this.RenderModal();
        $(".wiz-error").hide();
        this.NextBtn = $("#ebWizNextB");
        this.PrevBtn = $("#ebWizPrevB");
        this.FinishBtn = $("#ebWizFinishB");
        this.NextBtn.hide();
        this.PrevBtn.hide();
        this.FinishBtn.hide();
        $(".eb-loader").css("top", (parseInt(this.height) / 2) + "px");
        $(".modal-content").css("width", this.width + "px");
        $(".modal-dialog").css("width", this.width + "px");
        $("#wiz").children().css("margin-top", this.height / 2 - 110 + "px");
        $(".modal-body").css("height", this.height - 163 + "px");
        $('#dbModal').off("hidden.bs.modal").on('hidden.bs.modal', function (e) { $('#dbModal').remove(); });

        $('#dbModal').on('shown.bs.modal', function (e) {
            if ($('.useSame').is(':checked')) {
                $('.useSame').parent().siblings('.ro').hide();
            }
            if ($('.useSame').is(':not(:checked)')) {
                $(this).parent().siblings('.ro').show();
            };

            var dbvendor = parseInt($('.db_dropdown ul li').parent().siblings('input').val());
            if (dbvendor >= 0) {
                var dropval = $($('.db_dropdown ul li')[dbvendor]).html();
                $('.db_dropdown ul li').parent().siblings('[data-toggle=dropdown]').html(dropval);
            }
            else
                $('.db_dropdown [data-toggle=dropdown]').html("Select Database Vendor<span class=" + '"caret"></span>');
        });
        $('#dbModal').modal({ backdrop: 'static' });     
        $.get(this.SrcUrl, this.Drawsteps.bind(this));
    };

    this.Drawsteps = function (data) {       
        $("#wiz").empty().append($.parseHTML(data));
        $(".eb-loader").hide();
        $('#acid').val(this.Acid);
        this.Steps = $(".ebWizStep");
        this.ShowStep();
        $("#wizprogress").empty().append(this.CreateProgress());
        this.Navs = $("#wizprogress").children();
        $(this.NextBtn).off("click").on("click", this.NextB.bind(this));
        $(this.PrevBtn).off("click").on("click", this.PrevB.bind(this));
        $(this.Navs).off("click").on("click", this.NavsClick.bind(this)); 
        $(this.FinishBtn).off("click").on("click", this.SaveWizard.bind(this));

        if (this.Steps.length === 1) {
            $(".controls-group").css("height", (parseInt(this.height) - 245) + "px");
            $("#wizprogress").hide();
            this.NextBtn.hide();
            if (this.NoFinishbtn)
                this.FinishBtn.css("visibility", "hidden");
            this.FinishBtn.show();
        }
        else {
            this.NextBtn.show();
            this.FinishBtn.hide();
            $(".controls-group").css("height", (parseInt(this.height) - 315) + "px");
        }
        this.PrevBtn.hide();
        $(".modal-body").css("height", this.height - 163 + "px");
        this.SyncProgress();
        if (this.CustomWizFunc) this.CustomWizFunc();
        setTimeout(this.TimeOutFunc.bind(this), 10);
        if (this.EditObj) this.EditWiz();
    };

    this.TimeOutFunc = function () {
        $(this.Steps[0]).find('input:eq(0)').focus();
    };

    this.ShowStep = function () {
        $(this.Steps).hide();
        $(this.Steps[this.currentStepNo]).show().find('input:eq(0)').focus();
    };

    this.SaveWizard = function () {
        if (this.IsStepValid()) {
            $(".eb-loader").show();
            var html = ""; ObjString = "{";
            for (i = 0; i < this.Steps.length; i++)
                html += $(this.Steps[i]).html();
            var AllInputs = $(html).find("input, textarea");
            $.each(AllInputs, function (i, inp) {
                if ($(inp).attr("id") === "code") {
                    ObjString += '"' + $(inp).attr("id") + '"' + ':"' + btoa(unescape(encodeURIComponent($("#" + $(inp).attr("id")).val()))) + '",';
                    alert("ObjString" + ObjString);
                }
                else {
                    ObjString += '"' + $(inp).attr("id") + '"' + ':"' + $("#" + $(inp).attr("id")).val() + '",';
                }
               })
            ObjString = ObjString.slice(0, -1) + '}';
            this.EditObj = ObjString;
            var jqxhr = $.post(this.destUrl, { "Colvalues": ObjString, "Token": getToken() },
            function (result) {
                $(".eb-loader").hide();
                $(".wiz-error").show();
                $(".wiz-error").children().removeClass("alert-danger").addClass("alert-success");
                $("#errmsg").empty().append("<strong> Success <i class='fa fa-check fa-2x' aria-hidden='true'></i></strong>");
                setTimeout(function () { $('#dbModal').modal('hide'); }, 800);
                //alert("Success status.message = " + status.message);
            }).fail(this.ajaxFailFn.bind(this));
        }
    };

    this.ajaxFailFn = function (jq, jqStatus, statusDesc) {
        $(".eb-loader").hide();
        $(".wiz-error").show();
        var status = $.ss.parseResponseStatus(jq.responseText, statusDesc);
        alert("Error status.message = " + status.message);
        if (status.message.trim() === "Error in data") {
            $("#errmsg").empty().append("<strong>Error!</strong> Error in Configuring database for Data");
            this.currentStepNo = 0;
        }
        else if (status.message.trim() === "Error in data read only") {
            $("#errmsg").empty().append("<strong>Error!</strong> Error in Configuring database for read only");
            this.currentStepNo = 0;
        }
        else if (status.message.trim() === "Error in objects ") {
            $("#errmsg").empty().append("<strong>Error!</strong> Error in Configuring database for Object.");
            this.currentStepNo = 1;
        }
        else if (status.message.trim() === "Error in objects read only") {
            $("#errmsg").empty().append("<strong>Error!</strong> Error in Configure database for Object read only.");
            this.currentStepNo = 1;
        }
        else if (status.message.trim() === "Error in logs") {
            $("#errmsg").empty().append("<strong>Error!</strong> Error in Configure database for logs.");
            this.currentStepNo = 2;
        } else if (status.message.trim() === "Error in log read only") {
            $("#errmsg").empty().append("<strong>Error!</strong> Error in Configure database for logs read only.");
            this.currentStepNo = 2;
        }
        else if (status.message.trim() === "Error in files") {
            $("#errmsg").empty().append("<strong>Error!</strong> Error in Configure database for files.");
            this.currentStepNo = 3;
        } else if (status.message.trim() === "Error in files read only") {
            $("#errmsg").empty().append("<strong>Error!</strong> Error in Configure database for files read only.");
            this.currentStepNo = 3;
        }
        else if (status.message.trim() === "Input string was not in a correct format.") {
            $("#errmsg").empty().append("<strong>Error!</strong>Input string was not in a correct format.");
        }
        else
            $("#errmsg").empty().append("<strong>Error!</strong>An Unhandles Error.");
        this.ShowStep();
        this.SyncProgress();
    }

    this.NavsClick = function (e) {
        var clickedStepNo = parseInt($(e.target).html().trim()) - 1;
        if (clickedStepNo > this.currentStepNo) {
            for (var i = this.currentStepNo; i < (clickedStepNo) ; i++)
                this.NextB.bind(this)();
        }
        else if (clickedStepNo < this.currentStepNo) {
            for (i = this.currentStepNo; i > (clickedStepNo) ; i--)
                this.PrevB.bind(this)();
        }
    };

    this.NextB = function () {
        if (this.IsStepValid()) {
            ++this.currentStepNo;
            this.ShowStep();
            if (this.currentStepNo > 0) {
                this.NextBtn.show();
                this.FinishBtn.hide();
            }
            if (this.currentStepNo === this.Steps.length - 1) {
                this.NextBtn.hide();
                this.FinishBtn.show();
            }
            this.PrevBtn.show();
        }
        this.SyncProgress();
    };

    this.PrevB = function () {
        if (this.IsStepValid()) {
            --this.currentStepNo;
            this.ShowStep();
            if (this.currentStepNo > 0)
                this.PrevBtn.show();
            if (this.currentStepNo === 0)
                this.PrevBtn.hide();
            this.NextBtn.show();
            this.FinishBtn.hide();
            $($(this.Navs[this.currentStepNo]).children()[0]).removeClass("btn-success");
        }
        this.SyncProgress();
    };

    this.SyncProgress = function () {
        for (i = 0; i < this.Steps.length; i++)
            $($(this.Navs[i]).children()[0]).removeClass("btn-primary");
        $($(this.Navs[this.currentStepNo]).children()[0]).removeClass("btn-default").removeClass("btn-success").addClass("btn-primary");
    };

    this.CreateProgress = function () {
        var html = "";
        var repl = "<div class='stepwizard-step'><div id='navB1' purpose='nav' class='btn btn-default btn-circle'>@idx</div><p>@stepName</p><a id='aHi' href='#step-1' style='visibility:hidden;'></a></div>";

        for (i = 0; i < this.Steps.length; i++)
            html += repl.replace("@stepName", $(this.Steps[i]).children(0).html()).replace("@idx", (i + 1).toString());
        return html;
    };

    this.IsStepValid = function () {
        var currentInputs = $(this.Steps[this.currentStepNo]).find("input, textarea");
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

    this.RenderModal = function () {
        $(document.body).append(("<div id='dbModal' class='modal fade'>" +
            "<div class='modal-dialog'>" +
             "   <div class='modal-content'>" +

            "<div class='wiz-error'><div class='alert alert-danger center-block' style='width:98%;'>" +
                "<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>" +
                "<div id='errmsg'><strong>Danger!</strong> Indicates a dangerous or potentially negative action.</div>" +
            "</div></div>" +

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

    this.EditWiz = function () {
        $.each(this.EditObj, function (key, val) { $("#" + key).val(val); });
    };

    this.Init();
};

var CustomWizFuncs = function (acid) {
    this.AcId = acid;

    this.DbCheck = function () {
        UseSame();
        drop_portnum();
        usesame_change();
        ssl_toggle();
        pwd_strength();
        dropdown();
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
            $('[name=tout_rw]').on('keyup mouseup', function () {
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

        function drop_portnum() {
            $('.db_dropdown ul li.enabled').on("click", function () {
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
            $('.pnum').children('input').keyup(function () {
                $(this).parent().removeClass("has-error");
                var port_num = parseInt($(this).val());
                if ((port_num > 65536)) {
                    $(this).parent().addClass("has-error");
                }
            });
        }

        function usesame_change() {
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
                    $(this).parent().siblings('.form-group').children('[name=sip_ro]').focus();
                    $(this).parent().siblings('.form-group').children('[name=sip_ro]').val("");
                    $(this).parent().siblings('.form-group').children('[name=tout_ro]').val(500);
                    $(this).parent().siblings('.form-group').children('[name=ssl_ro]').val("");
                    $(this).parent().siblings('.form-group').children('[name=dbname_ro]').val("");
                    $(this).parent().siblings('.form-group').children('[name=duname_ro]').val("");
                    $(this).parent().siblings('.form-group').children('[name=pwd_ro]').val("");
                }
            });
        }
        function ssl_toggle() {
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
        }

        function pwd_strength() {
            $('[type=password]').keyup(function () {
                var strength = 0
                var password = $(this).val().toString();
                if (password.length <= 6) {
                    $(this).prev('[name=result]').removeClass()
                    $(this).prev('[name=result]').addClass('short')
                    res = 'Too short'
                }
                if (password.length > 7) strength += 1
                // If password contains both lower and uppercase characters, increase strength value.
                if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) strength += 1
                // If it has numbers and characters, increase strength value.
                if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) strength += 1
                // If it has one special character, increase strength value.
                if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1
                // If it has two special characters, increase strength value.
                if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1
                // Calculated strength value, we can return messages
                // If value is less than 2
                if (strength < 2 && password.length > 6) {
                    alert('weak')
                    $(this).prev('[name=result]').removeClass()
                    $(this).prev('[name=result]').addClass('weak')
                    res = 'Weak'
                } else if (strength === 2) {
                    $(this).prev('[name=result]').removeClass()
                    $(this).prev('[name=result]').addClass('good')
                    res = 'Good'
                } else if (strength > 2) {
                    $(this).prev('[name=result]').removeClass()
                    $(this).prev('[name=result]').addClass('strong')
                    res = 'Strong'
                }
                $(this).prev('[name=result]').html(res);
            })
        }

        function dropdown() {
            $('.db_dropdown ul li.enabled').click(function () {
                $(this).parent().siblings('input').val($(this).attr("value"));
                $(this).parent().siblings('[data-toggle=dropdown]').html("<span>" + $(this).html() + "</span>");
            });
        }

        $('.small_inputBox').on('keydown', function (e) { -1 !== $.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) || /65|67|86|88/.test(e.keyCode) && (!0 === e.ctrlKey || !0 === e.metaKey) || 35 <= e.keyCode && 40 >= e.keyCode || (e.shiftKey || 48 > e.keyCode || 57 < e.keyCode) && (96 > e.keyCode || 105 < e.keyCode) && e.preventDefault() });
        $('#dtb td').on("click", function () {
            var simp_adv = $(this).children('button').attr("value");
            var AcntId = this.Acid;
           
            $('#dbModal').modal('hide');
            setTimeout(function () {
                if (simp_adv === 'simple') {
                    var DBwizard_sim = new EbWizard("http://localhost:53431/Tenant/SimpleDbConf", "https://localhost:44377/infra/", 800, 600, "Configure DB Connectivity - Simple", "fa-database", acid);
                    DBwizard_sim.CustomWizFunc = (new CustomWizFuncs(AcntId)).DbCheck;
                }
                if (simp_adv === 'advanced') {
                    var DBwizard_adv = new EbWizard("http://localhost:53431/Tenant/dbConfig", "https://localhost:44377/infra/", 800, 635, "Configure DB Connectivity - Advanced", "fa-database", acid);
                    DBwizard_adv.CustomWizFunc = (new CustomWizFuncs(AcntId)).DbCheck;
                }
            }, 401);
        });
    };
};

var CustomCodeEditorFuncs = function (acid, obj_id, obj_name, obj_desc, code, versionNumber, filterDialogId, objType, rel_obj, needRun) {
    this.AcId = acid;
    this.ObjectId = obj_id;
    this.ObjectName = obj_name;
    this.ObjectDesc = obj_desc;
    this.ObjectType = objType;
    this.Code = code;
    this.VersionNumber = versionNumber;
    this.FilterDialogId = filterDialogId;
    this.DataSource = function () {       
        $('#name').val(obj_name);
        $('#description').val(obj_desc);
        $('#tcid').val(acid);
        $('#code').val(code);
        $('#objtype').val(objType);
        $('#id').val(obj_id);       
        $('#versionNumber').val(versionNumber);
        $('#filterDialogId').val(filterDialogId);
        $('#rel_obj').val(rel_obj);
        $('#needRun').val(needRun);
    };
};

var CustomFilterDialogFuncs = function (acid, obj_id, obj_name, obj_desc, code, versionNumber) {
    this.FilterD = function () {
       
            $('#saveFilter').on("click", function () {
                $.post("http://expressbase.org/Tenant/SaveEbDataSource", { "Id": obj_id, "Code": code, "Name": obj_name, "Description": obj_desc, "Token": getToken(), "isSave": "true", "VersionNumber": versionNumber }, function (result) {
                });
            });
    };

};

