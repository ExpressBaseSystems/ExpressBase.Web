var ObjListTbl = function (tbodyId, heading, btntext, url, customTabFun) {

    this.Heading = heading;
    this.BtnText = btntext;
    this.CustomTabFun = customTabFun;
    this.id = tbodyId;
    this.tbody = $('#' + tbodyId);
    this.SrcUrl = url;

    //functions
    this.Init = function () {
        this.RenderBody();
        $("#myDiv").empty().append(this.getAsTable());
        $(".input-group-btn .dropdown-menu li a").click(function () {
            var selText = $(this).html();

            //working version - for single button //
            //$('.btn:first-child').html(selText+'<span class="caret"></span>');  

            //working version - for multiple buttons //
            $(this).parents('.input-group-btn').find('.btn-search').html(selText);
        });
        $('#MySearch').on('keyup', function (e) {
            
            var input, filter, MyDiv, Rowdiv, ColDiv, i;
            input = document.getElementById("MySearch");
            filter = input.value.toUpperCase();
            MyDiv = document.getElementById("myDiv");
            Rowdiv = MyDiv.getElementsByClassName("Rowdiv");
           
            for (i = 0; i < Rowdiv.length; i++) {
                ColDiv = Rowdiv[i].getElementsByClassName("ColDiv")[2];
                //alert(ColDiv);
                alert(Rowdiv[i]);
                if (ColDiv) {
                    if (ColDiv.innerHTML.toUpperCase().indexOf(filter) > -1) {
                        Rowdiv[i].style.display = "";
                    } else {
                        Rowdiv[i].style.display = "none";
                    }
                }
            }
        });
        this.CustomTabFun(this.SrcUrl);
    };
    this.getAsTable = function () {
        var html = "<div class ='row'>";
        $.each($("#" + this.id + " [class=tr]"), function (i) {
            html += "<div class ='Rowdiv row' style='margin-bottom:10px'>" +
                "<div class ='ColDiv col-sm-1'>" +
                   "<div class='ckbox'><input type='checkbox' id='checkbox" + i + "'>" +
                   "</div>" +
                "</div>" +
                "<div class ='ColDiv col-sm-1'>" +
                   "<a href='#' class='star'><i class='glyphicon glyphicon-star'></i></a> " +
                "</div>" +
                "<div class ='ColDiv col-sm-8'>";
            $.each($(this).children(), function (i) {
                html += $(this).html();
            })
            html += "</div> </div>";
        })

        return (html + "</div>");
    };
    this.RenderBody = function () {
        $(document.body).append((
            "<div>" +
             "<section class='content'>" +
                "<div>" +
                    "<div class='panel panel-default' style='width: 100%;'>" +
                        "<div class='panel-body' style='margin-top: 50px;'>" +
                            "<h1>@Heading</h1>" +
                            "<div class='input-group input-group-lg col-md-3' style='width:600px;margin-left: 70px;'>" +
                                 "<div class='input-group-btn'>" +
                                    "<button type='button' class='btn btn-search btn-info dropdown-toggle' data-toggle='dropdown'>" +
                                       "<span class='glyphicon glyphicon-search'></span>" +
                                       "<span class='label-icon'>Search</span>" +
                                       "<span class='caret'></span>" +
                                     "</button>" +
                                     "<ul class='dropdown-menu pull-left' role='menu'>" +
                                       "<li>" +
                                          "<a href='#'>" +
                                          "<span class='glyphicon glyphicon-search'></span>" +
                                          "<span class='label-icon'>Search</span>" +
                                          "</a>" +
                                         "</li>" +
                                        "<li>" +
                                          "<a href='#'>" +
                                          "<span class='fa fa-align-right fa-rotate-90'></span>" +
                                          "<span class='label-icon'>Search By Application</span>" +
                                          "</a>" +
                                         "</li>" +
                                          "<li>" +
                                           "<a href='#'>" +
                                           "<span class='fa fa-align-right'></span>" +
                                           "<span class='label-icon'>Search By Application modules</span>" +
                                           "</a>" +
                                          "</li>" +
                                     "</ul>" +
                                "</div>" +
                                "<input type='text' class='form-control' id='MySearch' style='width:535px;'>" +
                                "<div class='input-group-btn'>" +

                                "</div>" +

                            "</div>" +
                                 "<div style='margin-left: 800px;'>" +
                                    "<input type='button' id='newobj' class='new btn btn-success' value='@ButtonText' style='height: 45px; margin-left: 50px;'/>" +
                                "</div>" +
                                "<div id='myDiv'></div>" +

                           "</div>" +
                        "</div>" +
                        "<div class='content-footer'>" +
                        "</div>" +
                    "</div>" +
                  "</section>" +
                  "</div>"
        ).replace("@Heading", this.Heading).replace("@ButtonText", this.BtnText));

    };
    this.Init();
};
var CustomTabFuns = function () {
    this.dstable = function (SrcUrl) {
        $('#newobj').on("click", function () {
            window.open(SrcUrl);
        });
    };
};