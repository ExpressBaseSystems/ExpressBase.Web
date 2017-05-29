var ObjListTbl = function (tbodyId, heading,btntext) {
  
    this.Heading = heading;
    this.BtnText=btntext;
    this.id = tbodyId;
    this.tbody = $('#' + tbodyId);

    //functions
    this.Init = function () {
        this.RenderBody();
        $("#myTable").empty().append(this.getAsTable());
    };
    this.getAsTable = function () {
        var html = "<div class ='row'>";
        $.each($("#"+this.id +" [class=tr]"), function (i) {
            html += "<div class ='row' style='margin-bottom:10px'>" +
                "<div class ='col-sm-1'>" +
                   "<div class='ckbox'><input type='checkbox' id='checkbox" + i + "'>" +
                   "</div>" +
                "</div>" +
                "<div class ='col-sm-1'>" +
                   "<a href='#' class='star'><i class='glyphicon glyphicon-star'></i></a> " +
                "</div>"+
                "<div class ='col-sm-8'>";
            $.each($(this).children(), function (i) {
                html +=  $(this).html();
            })
            html += "</div> </div>";
        })
        return (html + "</div>");
    };
    this.RenderBody = function () {
        $(document.body).append((
            "<div>"+
            "<section class='content'>"+
                "<div>"+
                    "<div class='panel panel-default' style='width: 100%;'>"+
                        "<div class='panel-body' style='margin-top: 50px;'>"+
                            "<h1>@Heading</h1>"+
                            "<div class='input-group input-group-lg col-md-3' style='width:600px;margin-left: 70px;'>"+
                                "<div class='icon-addon addon-lg input-group-btn'>"+
                                    "<input type='text' class='form-control' placeholder='Search' id='myInput' onkeyup='myFunction()' style='width:500px'>"+
                                    "<label for='myInput' class='glyphicon glyphicon-search' rel='tooltip' title='myInput'></label>"+
                                "</div>" +
                                "<div class='pull-right' style='margin-left: 55px;'>"+
                                    "<input type='button' class='new btn btn-success' value='@ButtonText' style='height: 45px; margin-left: 50px;'/>" +
                                "</div>"+
                            "</div>"+
                            
                                "<div id='myTable'></div>"+
                            
                           "</div>"+
                        "</div>"+
                        "<div class='content-footer'>"+
                        "</div>"+
                    "</div>"+
                  "</section>"+
                  "</div>"
        ).replace("@Heading", this.Heading).replace("@ButtonText", this.BtnText));
   
    };
    this.Init();
};