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
				$("#email_loader").EbLoader("show", { maskItem: { Id: "#email_mask", Style: { "left": "0" } } });
			}
		}).done(function (data) {
			$("#email_loader").EbLoader("hide");
			this.appendEmailConnection(JSON.parse(data));
			$("#EmailConnectionEdit").modal("toggle");
		}.bind(this));
	};

    this.expertAccountSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
			url: "../ConnectionManager/ExpertTextingAccount",
            data: postData,
            beforeSend: function () {
                $("#expertConnection_loder").EbLoader("show", { maskItem: { Id: "#expert_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
			$("#expertConnection_loder").EbLoader("hide");
            var d = JSON.parse(data);
			this.appendExpertConnection(d);
            $("#ExpertConnectionEdit").modal("toggle");
        }.bind(this));
	};

	this.twilioAccountSubmit = function (e) {
		e.preventDefault();
		var postData = $(e.target).serializeArray();
		$.ajax({
			type: 'POST',
			url: "../ConnectionManager/TwilioAccount",
			data: postData,
			beforeSend: function () {
				$("#twilioConnection_loder").EbLoader("show", { maskItem: { Id: "#twilio_mask", Style: { "left": "0" } } });
			}
		}).done(function (data) {
			$("#twilioConnection_loder").EbLoader("hide");
			var d = JSON.parse(data);
			this.appendTwilioConnection(d);
			$("#TwilioConnectionEdit").modal("toggle");
		}.bind(this));
	};

    this.CloudnaryConSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/Cloudinary",
            data: postData,
            beforeSend: function () {
                $("#cloudnary_loader").EbLoader("show", { maskItem: { Id: "#cloudnary_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            $("#cloudnary_loader").EbLoader("hide");
            var d = JSON.parse(data.CloudinaryConnection.Account);
            this.appendCloudnaryConnection(d);
            $("#cldnry_conEdit").modal("toggle");
        }.bind(this));
    };

    this.ftpOnSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/FTP",
            data: postData,
            beforeSend: function () {
                $("#ftp_loader").EbLoader("show", { maskItem: { Id: "#ftp_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            $("#ftp_loader").EbLoader("hide");
            var d = JSON.parse(data);
            this.appendFtpConnection(d);
            $("#ftp_connectionEdit").modal("toggle");
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
            o.Host = "xxxxxxxxxxx";
            o.Port = "00000000000";
            o.NickName = "Not Set";
            o.EmailAddress = "xxx xxx xxx xxx";
        }
        else
            o = object;

        $("#EmailConnection_config .Provider").text(o.ProviderName);
        $("#EmailConnection_config .EmailAddress").text(o.EmailAddress);
        $("#EmailConnection_config .NickName").text(o.NickName);

    };
    this.appendTwilioConnection = function (object) {
        let o = {};
        if ($.isEmptyObject(object)) {
            o.ProviderName = "Not Set";
            o.UserName = "xxxxxxxxxxx";
            o.From = "00000000000";
            o.NickName = "Not Set";
        }
        else
            o = object;
		$("#TwilioConnection_config .UserName").text(o.UserName);
        $("#TwilioConnection_config .SendNo").text(o.From);
        $("#TwilioConnection_config .NickName").text(o.NickName);
	};

	this.appendExpertConnection = function (object) {
		let o = {};
		if ($.isEmptyObject(object)) {
			o.ProviderName = "Not Set";
			o.UserName = "xxxxxxxxxxx";
			o.From = "00000000000";
			o.NickName = "Not Set";
		}
		else
			o = object;
		$("#ExpertTextingConnection_config .UserName").text(o.UserName);
		$("#ExpertTextingConnection_config .SendNo").text(o.From);
		$("#ExpertTextingConnection_config .NickName").text(o.NickName);
	};

    this.appendCloudnaryConnection = function (object) {
        let o = {};
        if (object === null || object === undefined || $.isEmptyObject(object)) {
            o.Cloud = "xxxxxxx";
            o.ApiKey = "xxxxxxx";
            o.ApiSecret = "xxxxxx";
        }
        else {
            o = object;
        }

        $("#Cloudnary_Connection_config .Cloud").text(o.Cloud);
        $("#Cloudnary_Connection_config .ApiKey").text(o.ApiKey);
        $("#Cloudnary_Connection_config .SecretKey").text(o.ApiSecret);
    };

    this.appendFtpConnection = function (object) {
        let o = {};
        if (object === null || object === undefined) {
            o.Username = "xxxxxxx";
            o.Password = "xxxxxxx";
            o.Host = "xxxxxx";
        }
        else {
            o = object;
        }
        $("#Ftp_Connection_config .UserName").text(o.Username);
        $("#Ftp_Connection_config .Password").text(o.Password);
        $("#Ftp_Connection_config .IpAddress").text(o.Host);
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
            if (["ReadOnlyPassword", "ReadOnlyUserName", "ReadWritePassword", "ReadWriteUserName", "__RequestVerificationToken", "IsNew"].indexOf(k) < 0) {
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

        var logoCrp = new EbFileUpload({
            Type: "image",
            Toggle: "#log-upload-btn",
            TenantId: "ViewBagcid",
            SolutionId: this.Sid,
            Container: "onboarding_logo",
            Multiple: false,
            ServerEventUrl: 'https://se.eb-test.xyz',
            EnableTag: false,
            EnableCrop: true,
            Context: "logo",//if single and crop
            ResizeViewPort: false //if single and crop
        });

        logoCrp.uploadSuccess = function (fileid) {
            EbMessage("show", { Message: "Profile Image Uploaded Successfully" });
        }
        logoCrp.windowClose = function () {
            //EbMessage("show", { Message: "window closed", Background: "red" });
        }
    };

    this.init = function () {
        this.appendDataDb(this.Connections.DataDbConnection);
        this.appendFilesDb(this.Connections.FilesDbConnection);
		this.appendEmailConnection(this.Connections.SMTPConnection);
		if (this.Connections.SMSConnections !== null) {
			for (let i = 0; i < this.Connections.SMSConnections.length; i++) {
				if (this.Connections.SMSConnections[i].ProviderName === 2)
					this.appendExpertConnection(this.Connections.SMSConnections[i]);
				else if (this.Connections.SMSConnections[i].ProviderName === 1)
					this.appendTwilioConnection(this.Connections.SMSConnections[i]);
			}
		} 

        if (this.Connections.CloudinaryConnection !== null)
            this.appendCloudnaryConnection(this.Connections.CloudinaryConnection.Account);
        else
            this.appendCloudnaryConnection(null);

        this.appendFtpConnection(this.Connections.FTPConnection);
        $("#dbConnectionSubmit").on("submit", this.dbconnectionsubmit.bind(this));
        $("#filesDbConnectionSubmit").on("submit", this.FilesDbSubmit.bind(this));
        $("#emailConnectionSubmit").on("submit", this.emailConnectionSubmit.bind(this));
		$("#TwilioConnectionSubmit").on("submit", this.twilioAccountSubmit.bind(this));
		$("#ExpertConnectionSubmit").on("submit", this.expertAccountSubmit.bind(this));
        $("#CloudnaryConnectionSubmit").on("submit", this.CloudnaryConSubmit.bind(this));
        $("#FtpConnectionSubmit").on("submit", this.ftpOnSubmit.bind(this));
        $(".testConnection").on("click", this.testConnection.bind(this));
        $("#UserNamesAdvanced").on("click", this.showAdvanced.bind(this));
        this.LogoImageUpload();
        $(`#EmailconnectionEdit input[name="IsSSL"]`).on("change", function (e) {
            if ($(e.target).is(":checked"))
                $(e.target).val(true);
            else
                $(e.target).val(false);
        });
    };

    this.init();
};