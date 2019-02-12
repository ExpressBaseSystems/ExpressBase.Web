const SQLProfiler = function (logsObj) {
    //this.profiler = profiler;
    this.logsObj = logsObj;

    this.onLabel1_click = function () {
        let $e = $(event.target);
        let idx = $e.attr("idx");
        let params;
        for (let i = 0; i < this.logsObj.$values.length; i++) {
            if (this.logsObj.$values[i].Id == idx) {
                params = this.logsObj.$values[i].Params;
            }
        }
        if (params == "" || params == "null") {
            params = "No Parameters";
        }
        $("#paramsalert").show();
        document.getElementById("paramsalert").innerHTML = "";
        document.getElementById("paramsalert").innerHTML = new EbPrettyJson().build(JSON.parse(params));
        //$(".wraper1_drhome").css({ width: "50%", });
    }.bind(this);

    this.onLabel2_click = function () {
        let $e = $(event.target);
        let idx = $e.attr("idx");
        let params;
        for (let i = 0; i < this.logsObj.$values.length; i++) {
            if (this.logsObj.$values[i].Id == idx) {
                params = this.logsObj.$values[i].Params;
            }
        }
        if (params == "" || params == "null") {
            params = "No Parameters";
        }
        $("#paramsalert").show();
        document.getElementById("paramsalert").innerHTML = "";
        document.getElementById("paramsalert").innerHTML = new EbPrettyJson().build(JSON.parse(params));
        $(".wraper1_drhome").css({ width: "50%", });
    }.bind(this);

    this.onLabel3_click = function () {
        let $e = $(event.target);
        let idx = $e.attr("idx");
        let params;
        for (let i = 0; i < this.logsObj.$values.length; i++) {
            if (this.logsObj.$values[i].Id == idx) {
                params = this.logsObj.$values[i].Params;
            }
        }
        if (params == "" || params == "null") {
            params = "No Parameters";
        }
        $("#paramsalert").show();
        document.getElementById("paramsalert").innerHTML = "";
        document.getElementById("paramsalert").innerHTML = new EbPrettyJson().build(JSON.parse(params));
        $(".wraper1_drhome").css({ width: "50%", });
    }.bind(this);

    this.onLabel4_click = function () {
        let $e = $(event.target);
        let idx = $e.attr("idx");
        let params;
        for (let i = 0; i < this.logsObj.$values.length; i++) {
            if (this.logsObj.$values[i].Id == idx) {
                params = this.logsObj.$values[i].Params;
            }
        }
        if (params == "" || params == "null") {
            params = "No Parameters";
        }
        $("#paramsalert").show();
        document.getElementById("paramsalert").innerHTML = "";
        document.getElementById("paramsalert").innerHTML = new EbPrettyJson().build(JSON.parse(params));
        $(".wraper1_drhome").css({ width: "50%", });
    }.bind(this);

    this.onRowClick = function () {
        let $e = $(event.target);
        let $tr = $e.closest("tr");
        let idx = $tr.attr("idx");
        let params;
        //let params = getObjByval(this.logsObj.$values, "ID", idx);
        for (let i = 0; i < this.logsObj.$values.length; i++) {
            if (this.logsObj.$values[i].Id == idx) {
                params = this.logsObj.$values[i].Params;
            }
        }
        if (params == "" || params == "null") {
            params = "No Parameters";
        }
        $(".rows").css({ background: "white" });
        $tr.css({ background: "lightblue" });
        //$("#paramsalert").css({ position: "absolute", top: event.pageY, left: 430 });
        $("#paramsalert").show();
        document.getElementById("paramsalert").innerHTML = "";
        document.getElementById("paramsalert").innerHTML = new EbPrettyJson().build(JSON.parse(params));
        $(".wraper1_drhome").css({ width: "50%", });
        this.logsObj;
    }.bind(this);

    this.onMaxClick = function () {
        $(".maximize").hide();
        $(".restore").show();
        $("#paramsalert").hide();
        $(".wraper1_drhome").css({ width: "100%" });
    }.bind(this);

    this.onResClick = function () {
        $(".restore").hide();
        $(".maximize").show();
        $("#paramsalert").show();
        $(".wraper1_drhome").css({ width: "50%" });
    }

    this.init = function () {

        $("#label1").on("click", this.onLabel1_click);

        $("#label2").on("click", this.onLabel2_click);

        $("#label3").on("click", this.onLabel3_click);

        $("#label4").on("click", this.onLabel4_click);

        $(".rows").on("click", this.onRowClick);

        $(".maximize").on("click", this.onMaxClick);

        $(".restore").on("click", this.onResClick);

    }


    this.init();
}