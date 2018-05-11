var TenantDashBoard = function (collection, IsSSO,email,apptype) {
    this.EbSolutionColl = collection;
    this.IsSSO = IsSSO;
    this.EmailForSSO = email;
    this.apptype = apptype;

    this.drawSolutionTiles = function () {
        for (var item = 0; item < this.EbSolutionColl.length; item++) {
            $(".tdash-box-body").prepend(`<div class="solution_container">
                <div class="solution_container_pd">
                    <div class="col-md-10">
                        <h4>${this.EbSolutionColl[item].SolutionName}</h4>
                        <p>${this.EbSolutionColl[item].Description || 'no description'}</p>
                        <p class="small">${this.EbSolutionColl[item].DateCreated }</p>   
                    </div>
                    <div class="col-md-2 flex-center">
                        <a href="SolutionDashBoard?Sid=${this.EbSolutionColl[item].IsolutionId}" target="_blank" class="btn newsolution-btn">
                            <i class="material-icons">open_in_new</i>
                        </a>
                    </div>
                </div>
            </div>`);
        }
    };

    this.goToSolutionWindow = function (e) {
        var console = $(e.target).closest(".btn").attr("wc");
        var tk = getToken();
        var rtk = getrToken();
        var form = document.createElement("form");
        form.setAttribute("method", "post");
        form.setAttribute("action", "http://" + this.Sid + "-dev." + window.location.host + "/Ext/SwitchContext");
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
    
    this.init = function () {
        $(".apps_count").text("(" + this.EbSolutionColl.length + ")");
        if (this.IsSSO)           
            $("#confTo-solution").modal("toggle");

        this.drawSolutionTiles();
        $("#skip").on("click", function () {
            $("#confTo-solution").modal("toggle");
        });
        //$(".single__sso").on("click", this.goToSolutionWindow.bind(this));
    };
  
    this.init();
};
