﻿var TenantDashBoard = function (scount, primarySolutionCount, MasterPackages) {
    this.goToSolutionWindow = function (e) {
        var console = $(e.target).closest(".sso-btn").attr("wc");
        var esid = $(e.target).closest(".sso-btn").attr("sid");
        var isid = $(e.target).closest(".sso-btn").attr("isid");
        var tk = getTok();
        var rtk = getrToken();
        var form = document.createElement("form");
        form.style.display = "none";
        form.setAttribute("method", "post");

        debugger;
        if (esid.includes(".")) {
            if (console === "dc")
                form.setAttribute("action", window.location.protocol + "//" + isid + "-dev." + window.location.host.replace("myaccount.", "") + "/Ext/SwitchContext");
            else if (console === "uc")
                form.setAttribute("action", window.location.protocol + "//" + esid + "/Ext/SwitchContext");
        }
        else {
            if (console === "dc")
                form.setAttribute("action", window.location.protocol + "//" + esid + "-dev." + window.location.host.replace("myaccount.", "") + "/Ext/SwitchContext");
            else if (console === "uc")
                form.setAttribute("action", window.location.protocol + "//" + esid + "." + window.location.host.replace("myaccount.", "") + "/Ext/SwitchContext");
        }

        form.setAttribute("target", "_blank");
        var token = document.createElement("input");
        token.setAttribute("name", "Btoken");
        token.setAttribute("value", tk);
        form.appendChild(token);
        var rtoken = document.createElement("input");
        rtoken.setAttribute("name", "Rtoken");
        rtoken.setAttribute("value", rtk);
        form.appendChild(rtoken);
        var AppType = document.createElement("input");
        AppType.setAttribute("name", "WhichConsole");
        AppType.setAttribute("value", console);
        form.appendChild(AppType);
        document.body.appendChild(form);
        form.submit();
    };

    this.searchSolution = function (e) {
        var srch = $(e.target).val().toLowerCase();
        $.each($(".tdash-box-body .solution_container"), function (i, obj) {
            var cmpstr = $(obj).find('[name="SolutionTitle"]').text().toLowerCase();
            if (cmpstr.indexOf(srch) !== -1) {
                $(obj).show();
            }
            else
                $(obj).hide();
        });
    }

    this.rs = function () {
        if (primarySolutionCount > 0) {
            $('#replicationModal').modal('show');
        }
    };

    this.ns = function (e) {
        if (scount < 3) {
            EbDialog("show",
                {
                    Message: "Are you sure to create new solution?",
                    Buttons: {
                        "Yes": { Background: "green", Align: "left", FontColor: "white;" },
                        "No": { Background: "violet", Align: "right", FontColor: "white;" }
                    },
                    CallBack: function (name) {
                        if (name === "Yes") {
                            this.ncs();
                            this.cs(function (res) {
                                if (res.status)
                                    self.EbPopBox("show", { Message: "Solution created :)" });
                                else {
                                    let msg = res.responseStatus ? res.responseStatus.message : '';
                                    self.EbPopBox("show", { Title: "Oops!", Message: "Unable to create solution! " + msg });
                                }
                            });
                        }
                    }.bind(this)
                });
        }
        else {
            self.EbPopBox("show", {
                Message: "You can't create more than 3 FREE solution "
            });
        }
    };

    this.ncs = function () {
        let po = {
            Message: "Creating solution...",
            Html: function ($selector) {
                $selector.html(`<span>Creating solution...</span><span class="fa fa-spinner fa-spin" style="margin-left:30px;"></span>`);
            },
            ButtonStyle: {
                Text: "Continue",
                Color: "white",
                Background: "#508bf9",
                Callback: function () {
                    location.reload();
                }
            }
        };
        self.EbPopBox("show", po);


    };

    this.cs = function (fn, sid, pid) {
        $.ajax({
            url: "/Tenant/CreateSolution",
            type: "POST",
            data: { sid: sid, pid: pid },
            success: function (data) {
                fn(data);
            },
            error: function () {
                fn({ status: false });
            }
        })
    };

    this.replicate = function () {

        let sid = $('#replicateSoln').val();
        let pid = $('#replicatePkg').val();
        $('#replicationModal').modal('hide');
        this.ncs();
        this.cs(function (res) {
            if (res.status)
                self.EbPopBox("show", { Message: "Solution created :)" });
            else
                self.EbPopBox("show", { Title: "Oops!", Message: "Unable to create solution!" });
        }, sid, pid);
    };

    this.UpdatePackage = function () {
        let sid = $('#replicateSoln').val();
        $('#replicatePkg').empty();
        for (i of MasterPackages[sid]) {
            $('#replicatePkg').append('<option value="' + i.Id + '">' + i.Name + '</option>');
        }
    };;

    this.init = function () {
        $("body").off("click").on("click", ".single__sso", this.goToSolutionWindow.bind(this));
        $("#solSearch").off("keyup").on("keyup", this.searchSolution.bind(this));
        $("#eb-new-solution").off("click").on("click", this.ns.bind(this));
        $("#eb-replicate-solution").off("click").on("click", this.rs.bind(this));
        $("#replicateBtn").off("click").on("click", this.replicate.bind(this));
        $("#replicateSoln").on('change', this.UpdatePackage.bind(this));

    };

    this.init();
};
