var BugReport = function () {

    this.init = function () {
        this.AppendBugsfn();
        $("#savebugid").on("click", this.Savebug.bind(this));



    };

    this.AppendBugsfn = function () {
        let html1 = null;
        $.each(tktob.supporttkt, function (i, obj) {
            let p = "tkt" + i;
          html1 += `<tr id="${p}" tabindex="${i}" class="tbltkt"> 
            <td>${obj.ticketid}</td> 
            <td>${obj.title}</td> 
            <td>${obj.solutionid}</td> 
            <td>${obj.priority}</td> 
            <td>${obj.lstmodified}</td> 
            <td>${obj.status}</td> 
            <td>${obj.support}</td> 
             <td> 
                    <button class="btn btn-default btn-xs" style="color:blue" >Edit <i class="fa fa-edit"></i></button>
                    <button class="btn btn-default btn-xs" style="color:red">Delete <i class="fa fa-trash-o"></i></button>

              </td>
         </tr>`;
        });
        $("#bugtblbody").empty().append(html1);
    }

    this.Savebug = function () {




        $.ajax({
            url: "../SupportTicket/SaveBugDetails",
            data: {
                title: $("#bugtitle").val().trim(),
                descp: $("#descriptionid").val().trim(),
                priority: $("#bugpriority option:selected").text().trim(),
                solid: $("#soluid option:selected").text().trim(),
                type_f_b: "bug"
            },
            cache: false,
            type: "POST",
            //success:

        });
    }




    this.init();
};