var TenantDashBoard = function (collection, IsSSO,email) {
    this.EbSolutionColl = collection;
    this.IsSSO = IsSSO;
    this.EmailForSSO = email;  

    this.drawSolutionTiles = function () {
        for (var item = 0; item < this.EbSolutionColl.length; item++) {
            $(".tdash-box-body").prepend(`<div class="tdash-sol-box">
                        <div class="solutionhead">
                            <h4>${this.EbSolutionColl[item].SolutionName}</h4>
                            <p>${this.EbSolutionColl[item].Description}</p>
                            <p class="small">${this.EbSolutionColl[item].DateCreated}</p>
                        </div>
                        <div class="solutionbdy">
                            <a href=""  class="btn newsolution-btn">Open</a>
                        </div>
                    </div>`);
        }
    };
    this.goToSolutionWindow = function (e) { 

        var tk = getToken();
        var form = document.createElement("form");
        form.setAttribute("method", "post");
        form.setAttribute("action", "http://" + this.EbSolutionColl[0].IsolutionId + ".localhost:5000/Ext/TenantSingleSignOn");
        form.setAttribute("target", "_blank");
        var token = document.createElement("input");
        token.setAttribute("name", "Btoken");
        token.setAttribute("value", tk);
        form.appendChild(token);
        var Email = document.createElement("input");
        Email.setAttribute("name", "Email");
        Email.setAttribute("value", this.EmailForSSO);
        form.appendChild(Email);
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
       $("#goToSolution").on("click",this.goToSolutionWindow.bind(this));
    };
  
    this.init();
};
