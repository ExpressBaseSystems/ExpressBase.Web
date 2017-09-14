var splitWindow = function (parent_div,sidediv,cont_box,p_grid) {
    this.parent_div = parent_div;
    this.sidediv = sidediv;
    this.cont_box = cont_box;
    this.p_grid = p_grid;
    console.log(this.sidediv, this.cont_box, this.p_grid);

    this.createWindows = function () {
        $("#" + parent_div).append("<div class='col-md-2 no-padd fd' id='" + this.sidediv + "'></div>");
        $("#" + parent_div).append("<div class='col-md-8 no-padd cont-wnd' id='" + this.cont_box + "'></div>");
        $("#" + parent_div).append("<div class='col-md-2 no-padd pg' id='" + this.p_grid + "'></div>");
    };


    this.init = function () {
        this.createWindows();
    };
    this.init();
};