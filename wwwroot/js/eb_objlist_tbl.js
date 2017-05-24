var ObjListTbl = function (tbodyId, heading) {
    this.Heading = heading;
    this.tbody = $('#' + tbodyId);

    //functions
    this.Init = function () {
        this.RenderBody();
        $("#myTable").empty().append(this.getAsTable());
    };
    this.getAsTable = function () {
        var html = "<div class ='row'>";

        $.each($("#mytbody [class=tr]"), function (i) {
            html += "<div class ='row'>" +
                "<div class ='col-sm-2'>" +
                   "<div class='ckbox'><input type='checkbox' id='checkbox" + i + "'>" +
                   "</div>" +
                "</div>" +
                "<div class ='col-sm-2'>" +
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
        ).replace("@Heading", this.Heading));
   
    };
    this.Init();
};