var SolutionDashBoard = function (connections, sid) {
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

    this.dbconnectionsubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/DataDb",
            data: postData,
            beforeSend: function () {
                $("#dbConnection_loder").EbLoader("show", { maskItem: { Id: "#dbConnection_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            $("#dbConnection_loder").EbLoader("hide");
            EbMessage("show", { Message: "Connection Changed Successfully" });
            this.appendDataDb(JSON.parse(data));
            $("#dbConnectionEdit").modal("toggle");
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
                $("#dbConnection_loder").EbLoader("show", { maskItem: { Id: "#dbConnection_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            $("#dbConnection_loder").EbLoader("hide");
            this.appendFilesDb(JSON.parse(data));
            $("#filesDbConnectEdit").modal("toggle");
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
                $("#dbConnection_loder").EbLoader("show", { maskItem: { Id: "#dbConnection_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            $("#dbConnection_loder").EbLoader("hide");
            this.appendEmailConnection(JSON.parse(data));
            $("#EmailConnectionEdit").modal("toggle");
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
                $("#dbConnection_loder").EbLoader("show", { maskItem: { Id: "#dbConnection_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            $("#dbConnection_loder").EbLoader("hide");
            var d = JSON.parse(data);
            d.FilesDB_url = atob(d.FilesDB_url);
            this.appendSmsConnection(d);
            $("#SmsConnectionEdit").modal("toggle");
        }.bind(this));
    };

    this.appendDataDb = function (object) {
        var Server = "";
        var DatabaseName = "";
        let vendersrc = "";
        if (object.IsDefault) { Server = "xxx.xxx.xxx.xxx"; DatabaseName = "Default DB"; }
        else { Server = object.Server; DatabaseName = object.DatabaseName; object.NickName = "not_set" }

        if (object.DatabaseVendor == 0) {
            vendersrc = `<img src="${location.protocol}//${location.host}/images/POSTGRES.png" />`;
        }
        else if (object.DatabaseVendor == 1) {
            vendersrc = `<img src="${location.protocol}//${location.host}/images/mysql.png" />`;
        }
        else if (object.DatabaseVendor == 2) {
            vendersrc = `<img src="${location.protocol}//${location.host}/images/sqlserver.png" />`;
        }
        else if (object.DatabaseVendor == 3) {
            vendersrc = `<img src="${location.protocol}//${location.host}/images/oracle.png" />`;
        }
        $("#DbConnection_config .VendorImage").empty().append(vendersrc);
        $("#DbConnection_config .DatabaseName").text(DatabaseName);
        $("#DbConnection_config .NickName").text(object.NickName);
        $("#DbConnection_config .Server").text(Server + ":" + object.Port);
    };

    this.appendFilesDb = function (object) {
        let o = {};
        let img = "";
        if (object === null || object.IsDefault) {
            o.FilesDB_url = "Default URL: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
            o.NickName = "Default";
            img = `<img src="${location.protocol}//${location.host}/images/MongodB.png" />`;
        }
        else {
            o = object;
            if (object.FilesDbVendor == 0)
                img = `<img src="${location.protocol}//${location.host}/images/MongodB.png" />`;
            else if (object.FilesDbVendor == 1)
                img = `<img src="${location.protocol}//${location.host}/images/mysql.png" />`;
            else if (object.FilesDbVendor == 2)
                img = `<img src="${location.protocol}//${location.host}/images/sqlserver.png" />`;
        }
        $("#FilesConnection_config .VendorImage").empty().append(img);
        $("#FilesConnection_config .NickName").text(o.NickName);
        $("#FilesConnection_config .FilesUrI").text(o.FilesDB_url);
    };

    this.appendEmailConnection = function (object) {
        let o = {};
        if ($.isEmptyObject(object)) {
            o.ProviderName = "Not Set";
            o.EmailAddress = "xxxxxxxxx@xxx.xxxx";
            o.Smtp = "xxx.xxx.xxx.xxx";
            o.Port = "0000";
            o.NickName = "Not Set";
        }
        else
            o = object;

        $("#EmailConnection_config").empty();
        $("#EmailConnection_config").append(`<div class="col-md-2 db_vendorimg text-center VendorImage">
                                        <img class="img-responsive" src="${location.protocol}//${location.host}/images/svg/email.svg" />
                                    </div>
                                    <div class="col-md-10">
                                        <p class="Server mr-0 pdt-5">${o.Smtp}:${o.Port}</p>
                                        <p class="EmailAddress mr-0 pdt-5">${o.EmailAddress}</p>
                                        <p class="NickName mr-0 pdt-5">${o.NickName}</p>
                                    </div>`);


    };
    this.appendSmsConnection = function (object) {
        let o = {};
        if ($.isEmptyObject(object)) {
            o.ProviderName = "Not Set";
            o.UserName = "xxxxxxxxxxx";
            o.From = "00000000000";
            o.NickName = "Not Set";
        }
        else
            o = object;

        $("#SMSConnection_config").empty();
        $("#SMSConnection_config").append(`<div class="col-md-2 db_vendorimg text-center VendorImage">
                                        <img class="img-responsive" src="${location.protocol}//${location.host}/images/svg/text.svg" />
                                    </div>
                                    <div class="col-md-10">
                                        <p class="UserName mr-0 pdt-5">${o.UserName}</p>
                                        <p class="SendNo mr-0 pdt-5">${o.From}</p>
                                        <p class="NickName mr-0 pdt-5">${o.NickName}</p>
                                    </div>`);
    };

    this.testConnection = function (e) {
        var form = this.objectifyForm($("#" + $(e.target).attr("whichform")).serializeArray());
        var url = $(e.target).attr("url");
        if (this.validateConnection(form))
            this.testAjaxCall(form, $(e.target).attr("whichform"), url);
        else
            EbMessage("show", { Message: "Connection info incomplete", Background: "red" });
    };

    this.validateConnection = function (form) {
        let f = true;
        for (let k in form) {
            if (["ReadOnlyPassword", "ReadOnlyUserName", "ReadWritePassword", "ReadWriteUserName", "__RequestVerificationToken","IsNew"].indexOf(k) < 0) {
                if (form[k].length <= 0)
                    f = false;
            }
            if (!f)
                return false;
        }
        return f;
    };

    this.testAjaxCall = function (form, formid, ControllerUrl) {
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/" + ControllerUrl,
            data: form,
            beforeSend: function () {
                $("#dbConnection_loder").EbLoader("show", { maskItem: { Id: "#dbConnection_mask", Style: { "left": "0" } } });
            }.bind(this)
        }).done(function (data) {
            $("#dbConnection_loder").EbLoader("hide");
            if (data) {
                EbMessage("show", { Message: "Test Connection Success" });
                $("#" + formid + " .saveConnection").show();
                $("#" + formid + " .testConnection").hide();
            }
            else
                EbMessage("show", { Message: "Test Connection Failed", Background: "red" });
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
        logoCrp.getObjId = function (file) {

        }.bind(this);
    };

    this.init = function () {
        this.appendDataDb(this.Connections.DataDbConnection);
        this.appendFilesDb(this.Connections.FilesDbConnection);
        this.appendEmailConnection(this.Connections.SMTPConnection);
        this.appendSmsConnection(this.Connections.SMSConnection);
        $("#dbConnectionSubmit").on("submit", this.dbconnectionsubmit.bind(this));
        $("#filesDbConnectionSubmit").on("submit", this.FilesDbSubmit.bind(this));
        $("#EmailConnectionSubmit").on("submit", this.emailConnectionSubmit.bind(this));
        $("#smsConnectionSubmit").on("submit", this.smsAccountSubmit.bind(this));
        $(".testConnection").on("click", this.testConnection.bind(this));
        $("#UserNamesAdvanced").on("click", this.showAdvanced.bind(this));
        this.LogoImageUpload();
    };

    this.init();
};