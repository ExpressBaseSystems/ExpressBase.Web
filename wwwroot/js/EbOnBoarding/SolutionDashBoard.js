var SolutionDashBoard = function (connections,sid) {
    this.Connections = connections;
    this.whichModal = "";
    this.Sid = sid;
    this.customElementLoader = $("<div>", {
        id: "connecting",
        css: {
            "font-size": "15px"
        },
        text: "Testing Your Connection..."
    });

    this.editConnectionRow = function (event) {
        this.whichModal = $(event.target).closest(".btn").attr("whichmodal");
        $("#" + this.whichModal).modal("toggle");
        $("#" + this.whichModal + " [name='IsNew']").val(false);
        //$(event.target).closest("td").siblings().each(this.editconnection.bind(this));
        this.preventSubOnEnter(this.whichModal);
    };

    this.preventSubOnEnter = function (modalid) {
        $("#" + modalid + " form").on('keyup keypress', function (e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 13) {
                e.preventDefault();
                return false;
            }
        });
    };

    this.editconnection = function (i, obj) {
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
            this.appendDataDb(data);
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
        if (object.IsDefault) { Server = "xxx.xxx.xxx.xxx"; DatabaseName = "xxxxxxxxxxxxx"; }
        else { Server = object.Server; DatabaseName = object.DatabaseName; }

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
        if (object === null || object.IsDefault) { 
            FilesDB_url = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; }
        else { FilesDB_url = object.FilesDB_url; }
        if (object) {
            $(".filesDbConnectionEdit tbody").append(`<tr class="connection-row">
                                               <td field="">Files</td>
                                        <td field="DatabaseVendor">${object.FilesDbVendor || "empty"}</td>
                                        <td field="FilesDB_url" style="max-width: 337px;text-overflow:ellipsis;overflow: hidden;">${FilesDB_url || "empty"}</td>
                                        <td field="NickName">${object.NickName || "empty"}</td>
                                        <td class="edit-row"><button class="btn btn-sm table-btn edit-btn" op="edit" whichmodal="filesDbConnectEdit"><i class="fa fa-pencil"></i></button></td>
                                            </tr>`);
        }
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
        var url = $(e.target).attr("url");
        this.testAjaxCall(form, $(e.target).attr("whichform"), url);
    };

    this.testAjaxCall = function (form, formid, ControllerUrl) {
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/" + ControllerUrl,
            data: form,
            beforeSend: function () {
                $("#" + formid).LoadingOverlay("show");
            }.bind(this)
        }).done(function (data) {
            if (data) {
                alert("Connection Ready");
                $("#" + formid + " .saveConnection").show();
                $("#" + formid + " .testConnection").hide();
            }
            else
                alert("Can't connect to this..");
            $("#" + formid).LoadingOverlay("hide");
        }.bind(this));
    };

    this.objectifyForm = function (formArray) {//serialize data function
        var returnArray = {};
        for (var i = 0; i < formArray.length; i++) {
            returnArray[formArray[i]['name']] = formArray[i]['value'];
        }
        return returnArray;
    }
    this.showAdvanced = function (e) {
        if ($(e.target).prop("checked"))
            $(".advanced-tr").show();
        else
            $(".advanced-tr").hide();
    };

    this.goToSolutionWindow = function (e) {
        var console = $(e.target).closest(".btn").attr("wc");
        var tk = getTok();
        var rtk = getrToken();
        var form = document.createElement("form");
        form.setAttribute("method", "post");
        if (console === "dc")
            form.setAttribute("action", "http://" + sid + "-dev." + window.location.host + "/Ext/SwitchContext");
        else if (console === "uc")
            form.setAttribute("action", "http://" + sid + "." + window.location.host + "/Ext/SwitchContext");
        form.setAttribute("target", "_blank");
        var token = document.createElement("input");
        token.setAttribute("name", "Btoken");
        token.setAttribute("value", tk);
        form.appendChild(token);
        var rtoken = document.createElement("input");
        rtoken.setAttribute("name", "Rtoken");
        rtoken.setAttribute("value", rtk);
        form.appendChild(rtoken);
        var AppType = document.createElement("input");
        AppType.setAttribute("name", "WhichConsole");
        AppType.setAttribute("value", console );
        form.appendChild(AppType);
        document.body.appendChild(form);
        form.submit();
    };

    this.LogoImageUpload = function () {
        var logoCrp = new cropfy({
            Container: 'onboarding_logo',
            Toggle: '#log-upload-btn',
            isUpload: true,  //upload to cloud
            enableSE: true, //enable server event
            Browse: true,  //browse image
            Result: 'base64',
            Type: 'logo',
            Tid: this.Sid, //if type is logo
            Preview: "#oB_logo-prev"
        });
        logoCrp.getFile = function (file) {

        }.bind(this);
    };

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
        $("#UserNamesAdvanced").on("click", this.showAdvanced.bind(this));
        $(".single__sso").on("click", this.goToSolutionWindow.bind(this));
        this.LogoImageUpload();
    };

    this.init();
};