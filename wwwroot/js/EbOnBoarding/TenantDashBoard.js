var TenantDashBoard = function (collection, IsSSO,email,apptype) {
    this.EbSolutionColl = collection;
    this.IsSSO = IsSSO;
    this.EmailForSSO = email;
    this.apptype = apptype;

    this.drawSolutionTiles = function () {
        for (var item = 0; item < this.EbSolutionColl.length; item++) {
            $(".tdash-box-body").prepend(`<div class="solution_container">
                <div class="solution_container_pd">
                    <div class="col-md-8">
                        <h4>${this.EbSolutionColl[item].SolutionName}</h4>
                        <p>${this.EbSolutionColl[item].Description || 'no description'}</p>
                        <p class="small">${this.EbSolutionColl[item].DateCreated }</p>   
                    </div>
                    <div class="col-md-4 pd-0 flex-center_rowwise">
                        <a sid="${this.EbSolutionColl[item].IsolutionId}" wc="uc" target="_blank" class="btn tdash_btn c-blue single__sso">
                            <i class="fa fa-user-o" aria-hidden="true"></i>
                        </a>
                        <a sid="${this.EbSolutionColl[item].IsolutionId}" wc="dc" target="_blank" class="btn tdash_btn c-orange single__sso">
                            <i class="fa fa-wrench" aria-hidden="true"></i>
                        </a>
                        <a href="MySolutions/${this.EbSolutionColl[item].IsolutionId}" target="_blank" class="btn c-normal tdash_btn">
                           <i class="fa fa-cog" aria-hidden="true"></i>
                        </a>
                    </div>
                </div>
            </div>`);
        }
        $("body").off("click").on("click",".single__sso", this.goToSolutionWindow.bind(this));
    };

    this.goToSolutionWindow = function (e) {
        var console = $(e.target).closest(".btn").attr("wc");
        var sid = $(e.target).closest(".btn").attr("sid");
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
    
    this.init = function () {
        $(".apps_count").text("(" + this.EbSolutionColl.length + ")");
        this.drawSolutionTiles();
    };
  
    this.init();
};
