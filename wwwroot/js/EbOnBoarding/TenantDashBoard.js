var TenantDashBoard = function (collection) {
    this.EbSolutionColl = collection;

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
        window.open("http://" + this.EbSolutionColl[0].IsolutionId + ".localhost:5000/dev");       
        $("#confTo-solution").modal("toggle");
    };

    this.init = function () {
        $("#confTo-solution").modal("toggle");
        this.drawSolutionTiles();
        $("#skip").on("click", function () {
            $("#confTo-solution").modal("toggle");
        });
        $("#goToSolution").on("click",this.goToSolutionWindow.bind(this));
    };
  
    this.init();
};
