var BugReport = function () {

    this.init = function () {
        this.AppendBugsfn();
        $("#savebugid").on("click", this.Savebug.bind(this));
        $(".edttkt").on("click", this.EditTicketfn.bind(this));



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
            <td>${obj.assignedto}</td> 
             <td> 
                    <button class="btn btn-default btn-xs edttkt" style="color:blue"  id="${obj.ticketid}">Edit <i class="fa fa-fw fa-edit  fa-lg fa-fw"></i></button>
                    <button class="btn btn-default btn-xs" style="color:red">Close issue  <i class="fa fa-fw fa-close fa-lg fa-fw"></i></button>

              </td>
         </tr>`;
        });
        $("#bugtblbody").empty().append(html1);
    }

    this.Savebug = function () {
        let bfr = null
        if ($("#check1").is(':checked')) {
            bfr = "featurerequest";
        }
        else {
            bfr = "bug";
        }



        $.ajax({
            url: "../SupportTicket/SaveBugDetails",
            data: {
                title: $("#bugtitle").val().trim(),
                descp: $("#descriptionid").val().trim(),
                priority: $("#bugpriority option:selected").text().trim(),
                solid: $("#soluid option:selected").attr('solu')
                type_f_b: bfr 
            },
            cache: false,
            type: "POST",
            success: function () {
                location.reload();
            }

        });
    }

    this.EditTicketfn = function (ev) {
        let idk = $(ev.target).attr("id");
        location.href = `/SupportTicket/EditTicket?tktno=${idk}`;

    }


    this.init();
};





//for editticket.cshtml






var EditTicket = function () {

    this.init1 = function () {
        this.AppendTicketfn();

    };

    this.AppendTicketfn = function () {
        
        $.each(tktdtl.supporttkt, function (i, obj) {
            $("#tktid").text(obj.ticketid);
            $("#stsid").text(obj.status);
            $("#asgnid").text(obj.assignedto);
            $("#bugtitle").val(obj.title);
            $("#soluid").val(obj.solutionid);
            $("#bugpriority").append(` <option selected="selected" hidden >${obj.priority}</option>`);
            $("#dtecrtd").val(obj.createdat);
            $("#dtemdfyd").val(obj.lstmodified);
            $("#descriptionid").val(obj.description);
            $("#remarkid").val(obj.remarks);

        });
    }




    this.init1();
}