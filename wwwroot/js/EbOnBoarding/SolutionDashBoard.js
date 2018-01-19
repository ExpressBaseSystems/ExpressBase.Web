var SolutionDashBoard = function (connections) {
    this.Connections = connections; 
    this.whichModal = "";
    this.editConnectionRow = function (event) {
        
        this.whichModal = $(event.target).closest(".btn").attr("whichmodal");        
        $("#" + this.whichModal).modal("toggle");
        $("#" + this.whichModal + " [name='IsNew']").val(false);
        //$(event.target).closest("td").siblings().each(this.editconnection.bind(this));
    };

    this.editconnection = function (i,obj) {
        var input = $(obj).attr("field");
        $("#" + this.whichModal + " [name='" + input + "']").val($(obj).text());
    }

    this.addConnectionRow = function (e) {
        this.whichModal = $(e.target).closest(".btn").attr("whichmodal"); 
        $("#" + this.whichModal).modal("toggle");       
        $.each($("#" + this.whichModal).children().find("input"), function (i, obj) {
            $(obj).val("");
        }).bind(this);
        $("#" + this.whichModal + " [name='IsNew']").val(true);
    };
    this.dbconnectionsubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/DataDb",           
            data: postData,
            beforeSend: function () {

            }
        }).done(function (data) {
            $(".dbConnectionEdit tbody").empty();
            this.appenddbConnection(data);
            $("#" + this.whichModal).modal("toggle");            
        }.bind(this));      
    };

    this.FilesDbSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/FilesDb",
            data: postData,
            beforeSend: function () {

            }
        }).done(function (data) {
            $(".filesDbConnectionEdit tbody").empty();
            this.appendFilesDb(JSON.parse(data));
            $("#" + this.whichModal).modal("toggle");                                       
        }.bind(this));      
    };

    this.emailConnectionSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/SMTP",
            data: postData,
            beforeSend: function () {

            }
        }).done(function (data) {
            $(".EmailConnectionEdit tbody").empty();
            $(".EmailConnectionEdit .table-message").remove();
            this.appendEmailConnection(JSON.parse(data));
            $("#" + this.whichModal).modal("toggle");
        }.bind(this));   
    }

    this.appendDataDb = function (object) { 
        var Server = "";
        var DatabaseName = "";
        if (object.IsDefault) {Server = "xxx.xxx.xxx.xxx"; DatabaseName = "xxxxxxxxxxxxx";}
        else { Server = object.Server; DatabaseName = object.DatabaseName;}
        
        $(".dbConnectionEdit tbody").append(`<tr class="connection-row">
                                                <td field="DatabaseType">Data</td>
                                                <td field="DatabaseVendor">${object.DatabaseVendor}</td>
                                                <td field="Server">${Server}:${object.Port}</td>                                               
                                                <td field="DatabaseName">${DatabaseName}</td>
                                                <td field="NickName">${object.NickName}</td>                                                                                              
                                                <td class="edit-row"><button class="btn btn-sm table-btn edit-btn" op="edit" whichmodal="dbConnectionEdit"><i class="fa fa-pencil"></i></button></td>
                                            </tr>`);     
    };

    this.appendFilesDb = function (object) {
        var FilesDB_url = "";
        if (object.IsDefault) { FilesDB_url = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; }
        else { FilesDB_url = object.FilesDB_url; }
        $(".filesDbConnectionEdit tbody").append(`<tr class="connection-row">
                                               <td field="">Files</td>
                                        <td field="DatabaseVendor">${object.FilesDbVendor}</td>
                                        <td field="FilesDB_url" style="max-width: 337px;text-overflow:ellipsis;overflow: hidden;">${FilesDB_url}</td>
                                        <td field="NickName">${object.NickName}</td>
                                        <td class="edit-row"><button class="btn btn-sm table-btn edit-btn" op="edit" whichmodal="filesDbConnectEdit"><i class="fa fa-pencil"></i></button></td>
                                            </tr>`);
    };
    this.appendEmailConnection = function (object) {  
        if ($.isEmptyObject(object))
            $(".EmailConnectionEdit").parent().append(`<div class="table-message">No email Accounts added..</div>`);
        else
        $(".EmailConnectionEdit tbody").append(`<tr>
                                        <td field="EmailVendor">${object.ProviderName}</td>
                                        <td field="Email">${EmailAddress}</td>                                        
                                        <td field="Password">${object.Password}</td>
                                        <td field="SMTP">${object.Smtp}</td>
                                        <td field="Port">${object.Port}</td>
                                        <td field="NickName">${object.NickName}</td>
                                        <td class="edit-row"><button whichmodal="EmailConnectionEdit" class="btn btn-sm table-btn edit-btn"><i class="fa fa-pencil"></i></button></td>
                                    </tr>`);
    };


    this.init = function () {
        this.appendDataDb(this.Connections.DataDbConnection);
        this.appendFilesDb(this.Connections.FilesDbConnection);
        this.appendEmailConnection(this.Connections.SMTPConnection);
        $(".s-dash-bodyComm .edit-btn").on("click", this.editConnectionRow.bind(this));
        $(".addConnection").on("click", this.addConnectionRow.bind(this));
        $("#dbConnectionSubmit").on("submit", this.dbconnectionsubmit.bind(this));
        $("#filesDbConnectionSubmit").on("submit", this.FilesDbSubmit.bind(this));
        $("#EmailConnectionSubmit").on("submit", this.emailConnectionSubmit.bind(this));
    };

    this.init();
};