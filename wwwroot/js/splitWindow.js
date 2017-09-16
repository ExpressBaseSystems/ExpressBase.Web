var splitWindow = function (parent_div, sidediv, cont_box, p_grid) {
    
    this.parent_div = parent_div;
    this.sidediv = sidediv;
    this.contBox = cont_box;
    this.pGrid = p_grid;
    this.wdId = 0;
    this.wScroll = 0;

    this.createWindows = function () {
        $("#" + this.parent_div).append("<div class='col-md-2 no-padd fd' id='" + this.sidediv + "'><div class='min-btn'>"
           +"<button class='btn-tb-com pull-right' onclick= fdBoxMin(); id = 'fd-min-btn' ><i class='fa fa-caret-left fa-lg'></i></button></div><div>");

        $("#" + this.parent_div).append("<div class='col-md-8 no-padd cont-wnd' id='" + this.contBox + "'>"
            + "<div class='sub-windows' id='sub0'><div class='sub-windows-head'>"
            + "<div class='pull-right' style= 'margin-top: 3px;' >"
            + "<button class='head-btn'><i class='fa fa-minus' aria-hidden='true'></i></button>"
            + "<button class='head-btn'><i class='fa fa-thumb-tack' aria-hidden='true'></i></button>"
            + "<button class='head-btn'><i class='fa fa-times' aria-hidden='true'></i></button>"
            + "</div ></div ></div > ");

        $("#" + this.parent_div).append("<div class='col-md-2 no-padd pg' id='" + this.pGrid + "'>"
            + "<div class='min-btn'>"
            + "<button class='btn-tb-com' onclick=pgBoxMin(); id='pg-min'><i class='fa fa-caret-right fa-lg'></i></button></div></div>");
    };
    fdBoxMin = function () {       
        $(this.sidediv).toggleClass("toggled");
          if ($(this.sidediv).hasClass("toggled")) {               
              $(this.contBox).removeClass('col-md-8').addClass('col-md-10');
              $('#fd-min-btn').css('margin-right', '-25px').addClass("rotated");
           }
            else {
              $(this.contBox).removeClass('col-md-10').addClass('col-md-8');
              $('#fd-min-btn').css('margin-right', '0').removeClass("rotated");
        }         
    };

    pgBoxMin = function () { 
        $(this.pGrid).toggleClass("pg-toggled");
        if ($(this.pGrid).hasClass("pg-toggled")) {
            $(this.contBox).removeClass('col-md-8').addClass('col-md-10');
            $('#pg-min').css('margin-left', '-19px').addClass("rotated");
            }
            else {
            $(this.contBox).removeClass('col-md-10').addClass('col-md-8');
                $('#pg-min').css('margin-left', '0').removeClass("rotated");
        }       
    };

    this.createContentWindow = function () {
       
        var id = "sub" + this.wdId++;
        $("#" + this.contBox).prepend("<div class='sub-windows' id='" + id + "'>"
            + "<div class='sub-windows-head'><div class='pull-right' style='margin-top: 3px;'>"
            + "<button class='head-btn'><i class='fa fa-minus' aria-hidden='true'></i></button>"
            + "<button class='head-btn'><i class='fa fa-thumb-tack' aria-hidden='true'></i></button>"
            + "<button class='head-btn'><i class='fa fa-times' aria-hidden='true'></i></button></div></div></div>");

        //this.wScroll = $("#" + id).css('width').replace('px', ' ');      
        //$("#"+this.contBox).scrollLeft(this.wScroll);
        //this.wScroll = this.wScroll + $("#" + id).prev().css('width').replace('px', ' ');
    };

    this.init = function () {
        this.createWindows();
        $('#new').on('click', this.createContentWindow.bind(this));
    };
    this.init();
};