var TenantDashBoard = function (scount) {
    this.goToSolutionWindow = function (e) {
        var console = $(e.target).closest(".sso-btn").attr("wc");
        var sid = $(e.target).closest(".sso-btn").attr("sid");
        var tk = getTok();
        var rtk = getrToken();
        var form = document.createElement("form");
        form.style.display = "none";
        form.setAttribute("method", "post");
        if (console === "dc")
            form.setAttribute("action", window.location.protocol + "//" + sid + "-dev." + window.location.host.replace("myaccount.", "") + "/Ext/SwitchContext");
        else if (console === "uc")
            form.setAttribute("action", window.location.protocol + "//" + sid + "." + window.location.host.replace("myaccount.", "") + "/Ext/SwitchContext");
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

    this.ns = function (e) {
        if (scount <= 3) {
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
            this.cs(function (res) {
                if (res.status)
                    self.EbPopBox("show", { Message: "Solution created :)" });
                else
                    self.EbPopBox("show", { Title: "Oops!", Message: "Unable to create solution!" });
            });
        }
        else {
            self.EbPopBox("show", {
                Message:"You can't create more than 3 FREE solution "
            });
        }
    };

    this.cs = function (fn) {
        $.ajax({
            url: "/Tenant/CreateSolution",
            type: "POST",
            success: function (data) {
                fn(data);
            },
            error: function () {
                fn({ status: false });
            }
        })
    };

    this.init = function () {
        $("body").off("click").on("click", ".single__sso", this.goToSolutionWindow.bind(this));
        $("#solSearch").off("keyup").on("keyup", this.searchSolution.bind(this));
        $("#eb-new-solution").off("click").on("click", this.ns.bind(this))
    };

    this.init();
};
