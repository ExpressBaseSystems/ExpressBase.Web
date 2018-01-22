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

    this.smsAccountSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/SMSAccount",
            data: postData,
            beforeSend: function () {

            }
        }).done(function (data) {
            $(".SmsConnectionEdit tbody").empty();
            $(".SmsConnectionEdit .table-message").remove();
            var d = JSON.parse(data);
            d.FilesDB_url = atob(d.FilesDB_url);
            this.appendSmsConnection(d);
            $("#" + this.whichModal).modal("toggle");
        }.bind(this));
    };

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
                                        <td field="Email">${object.EmailAddress}</td>                                                                                
                                        <td field="SMTP">${object.Smtp}</td>
                                        <td field="Port">${object.Port}</td>
                                        <td field="NickName">${object.NickName}</td>
                                        <td class="edit-row"><button whichmodal="EmailConnectionEdit" class="btn btn-sm table-btn edit-btn"><i class="fa fa-pencil"></i></button></td>
                                    </tr>`);
    };
    this.appendSmsConnection = function (object) {
        if ($.isEmptyObject(object))
            $(".SmsConnectionEdit").parent().append(`<div class="table-message">No SMS Accounts added..</div>`);
        else
            $(".SmsConnectionEdit tbody").append(`<tr>
                                         <td field="ProviderName">${object.ProviderName}</td>
                                        <td field="UserName">${object.UserName}</td>
                                        <td field="From">${object.From}</td>
                                        <td field="NickName">${object.NickName}</td>
                                        <td class="edit-row"><button whichmodal="SmsConnectionEdit" class="btn btn-sm table-btn edit-btn"><i class="fa fa-pencil"></i></button></td>
                                    </tr>`);
    };

    this.testConnection = function (e) {
        var form = this.objectifyForm($("#" + $(e.target).attr("whichform")).serializeArray());
        if ($(e.target).attr("whichform") === "dbConnectionSubmit"){

        }
    };

    this.objectifyForm =  function(formArray) {//serialize data function
        var returnArray = {};
        for (var i = 0; i < formArray.length; i++) {
            returnArray[formArray[i]['name']] = formArray[i]['value'];
        }
        return returnArray;
    }

    this.init = function () {
        this.appendDataDb(this.Connections.DataDbConnection);
        this.appendFilesDb(this.Connections.FilesDbConnection);
        this.appendEmailConnection(this.Connections.SMTPConnection);
        this.appendSmsConnection(this.Connections.SMSConnection);
        $(".s-dash-bodyComm .edit-btn").on("click", this.editConnectionRow.bind(this));
        $(".addConnection").on("click", this.addConnectionRow.bind(this));
        $("#dbConnectionSubmit").on("submit", this.dbconnectionsubmit.bind(this));
        $("#filesDbConnectionSubmit").on("submit", this.FilesDbSubmit.bind(this));
        $("#EmailConnectionSubmit").on("submit", this.emailConnectionSubmit.bind(this));
        $("#smsConnectionSubmit").on("submit", this.smsAccountSubmit.bind(this));
        $(".testConnection").on("click", this.testConnection.bind(this));
    };

    this.init();
};