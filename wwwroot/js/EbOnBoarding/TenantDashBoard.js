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
        var tk = getToken();
        var rtk = getrToken();
        var form = document.createElement("form");
        form.setAttribute("method", "post");
        form.setAttribute("action", "http://" + this.EbSolutionColl[0].IsolutionId + "-dev.localhost:5000/Ext/GoToApplication");
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
        AppType.setAttribute("name", "AppType");
        AppType.setAttribute("value", this.apptype);
        form.appendChild(AppType);
        document.body.appendChild(form);          
        form.submit();            
        $("#confTo-solution").modal("toggle");
    };
    
    this.init = function () {
        if (this.IsSSO)           
            $("#confTo-solution").modal("toggle");

        this.drawSolutionTiles();
        $("#skip").on("click", function () {
            $("#confTo-solution").modal("toggle");
        });
    };
  
    this.init();
};
