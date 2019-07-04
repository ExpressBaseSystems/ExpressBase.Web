
var SolutionDashBoard = function (connections, sid) {
    this.Connections = connections;
    this.whichModal = "";
    this.Sid = sid;
    var postData;
    var Deleteid;
    var conf_NN;
    var preferancetype = [];
    var Imageurl = {
        "PGSQL": "<img class='img-responsive' src='../images/POSTGRES.png' align='middle' style='height:45px' />",
        "MSSQL": "<img class='img-responsive' src='../images/sqlserver.png' align='middle' style='height: 50px;' />",
        "MYSQL": "<img class='img-responsive' src='../images/mysql.png' align='middle' style='height:35px' />",
        "ORACLE": "<img class='img-responsive' src='../images/oracle.png' align='middle' style='height: 50px;' />",
        "MongoDB": "<img class='img-responsive' src='../images/MongodB.png' align='middle' style='height:40px' />",
        "Cloudinary": "<img class='img-responsive' src='../images/cloudnary.png' align='middle' style='height: 17px;' />",
        "ExpertTexting": "<img class='img-responsive' src='../images/expert texting.png' align='middle' style='height:26px' />",
        "Twilio": "<img class='img-responsive' src='../images/twilio.png' align='middle' style='height: 38px;' />",
        "SMTP": "<img class='img-responsive' src='../images/svg/email.svg' align='middle' style='height: 36px;' />",
        "MAP": "<img class='img- responsive image-vender' src='~/images/maps - google.png' style='width: 100 %' />"
    }
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

    this.IntegrationSubmit = function () {
        //e.preventDefault();
        //var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/Integrate",
            data: postData,
            beforeSend: function () {
                $("#Integration_loder").EbLoader("show", { maskItem: { Id: "#dbConnection_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            $("#Integration_loder").EbLoader("hide");
            if (data) {
                this.Conf_obj_update(JSON.parse(data));
                EbMessage("show", { Message: "Integreation Changed Successfully" });
            }
            else
                EbMessage("show", { Message: "Integreation Change Failed", Background: "red" });
        }.bind(this));
    };

    this.PreferencesChange = function () {
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/IntegrationSwitch",
            data: { preferancetype: JSON.stringify(preferancetype), sid },
            beforeSend: function () {
                $("#Integration_loder").EbLoader("show", { maskItem: { Id: "#dbConnection_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            $("#Integration_loder").EbLoader("hide");
            if (data) {
                this.Conf_obj_update(JSON.parse(data));
                EbMessage("show", { Message: "Integreation Changed Successfully" });
            }
            else
                EbMessage("show", { Message: "Integreation Change Failed", Background: "red" });
        }.bind(this));
    };

    this.PrimaryChange = function () {
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/PrimaryDelete",
            data: { preferancetype: JSON.stringify(postData), sid, Deleteid },
            beforeSend: function () {
                $("#Integration_loder").EbLoader("show", { maskItem: { Id: "#dbConnection_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            $("#Integration_loder").EbLoader("hide");
            if (data) {
                this.Conf_obj_update(JSON.parse(data));
                EbMessage("show", { Message: "Integreation Changed Successfully" });
            }
            else
                EbMessage("show", { Message: "Integreation Change Failed", Background: "red" });
        }.bind(this));
    };

    this.IntergrationConfigDelete = function (Id) {
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/IntegrateConfDelete",
            data: { Id, sid },
            beforeSend: function () {
                $("#Integration_loder").EbLoader("show", { maskItem: { Id: "#dbConnection_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            $("#Integration_loder").EbLoader("hide");
            if (data) {
                this.Conf_obj_update(JSON.parse(data));
                EbMessage("show", { Message: "Data Deleted Successfully" });
            }
            else
                EbMessage("show", { Message: "Data Deletion  Failed", Background: "red" });
        }.bind(this));
    };

    this.IntergrationDelete = function (Id) {
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/IntegrateDelete",
            data: { Id, sid },
            beforeSend: function () {
                $("#Integration_loder").EbLoader("show", { maskItem: { Id: "#dbConnection_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            $("#Integration_loder").EbLoader("hide");
            if (data) {
                this.Conf_obj_update(JSON.parse(data));
                EbMessage("show", { Message: "Data Removed Successfully" });
            }
            else
                EbMessage("show", { Message: "Data Removing Failed", Background: "red" });
        }.bind(this));
    };

    this.dbconnectionsubmit = function (e) {
        e.preventDefault();
        postData = $(e.target).serializeArray();
        var oconfid = $(e.target).find("#IntConfId").val();
        var type = $(e.target).find(".Vendor").val();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/AddDB",
            data: postData,
            beforeSend: function () {
                $("#dbConnection_loder").EbLoader("show", { maskItem: { Id: "#dbConnection_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            this.Conf_obj_update(JSON.parse(data));
            $("#dbConnection_loder").EbLoader("hide");
            EbMessage("show", { Message: "Connection Changed Successfully" });
            $("#dbConnectionEdit").modal("toggle");
            $("#IntegrationsCall").trigger("click");
            $("#MyIntegration").trigger("click");
        }.bind(this));
    };

    this.FilesDbSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/AddMongo",
            data: postData,
            beforeSend: function () {
                $("#dbConnection_loder").EbLoader("show", { maskItem: { Id: "#dbConnection_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            this.Conf_obj_update(JSON.parse(data));
            $("#dbConnection_loder").EbLoader("hide");
            $("#filesDbConnectEdit").modal("toggle");
            EbMessage("show", { Message: "Connection Changed Successfully" });
            $("#IntegrationsCall").trigger("click");
            $("#MyIntegration").trigger("click");
        }.bind(this));
    };

    this.emailConnectionSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/AddSMTP",
            data: postData,
            beforeSend: function () {
                $("#email_loader").EbLoader("show", { maskItem: { Id: "#email_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            this.Conf_obj_update(JSON.parse(data));
            $("#email_loader").EbLoader("hide");
            EbMessage("show", { Message: "Connection Changed Successfully" });
            $("#EmailconnectionEdit").modal("toggle");
            $("#IntegrationsCall").trigger("click");
            $("#MyIntegration").trigger("click");
        }.bind(this));
    };

    this.expertAccountSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/AddExpertTexting",
            data: postData,
            beforeSend: function () {
                $("#expertConnection_loder").EbLoader("show", { maskItem: { Id: "#expert_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            this.Conf_obj_update(JSON.parse(data));
            $("#expertConnection_loder").EbLoader("hide");
            EbMessage("show", { Message: "Connection Changed Successfully" });
            $("#ExpertTextingConnectionEdit").modal("toggle");
        }.bind(this));
    };

    this.twilioAccountSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/AddTwilio",
            data: postData,
            beforeSend: function () {
                $("#twilioConnection_loder").EbLoader("show", { maskItem: { Id: "#twilio_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            this.Conf_obj_update(JSON.parse(data));
            $("#twilioConnection_loder").EbLoader("hide");
            EbMessage("show", { Message: "Connection Changed Successfully" });
            $("#TwilioConnectionEdit").modal("toggle");
            $("#IntegrationsCall").trigger("click");
            $("#MyIntegration").trigger("click");
        }.bind(this));
    };

    this.CloudnaryConSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/AddCloudinary",
            data: postData,
            beforeSend: function () {
                $("#cloudnary_loader").EbLoader("show", { maskItem: { Id: "#cloudnary_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            this.Conf_obj_update(JSON.parse(data));
            $("#cloudnary_loader").EbLoader("hide");
            EbMessage("show", { Message: "Connection Changed Successfully" });
            $("#cldnry_conEdit").modal("toggle");
            $("#IntegrationsCall").trigger("click");
            $("#MyIntegration").trigger("click");
        }.bind(this));
    };

    this.mapOnSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/AddGoogleMap",
            data: postData,
            beforeSend: function () {
                $("#Map_loader").EbLoader("show", { maskItem: { Id: "#Map_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            this.Conf_obj_update(JSON.parse(data));
            $("#cloudnary_loader").EbLoader("hide");
            EbMessage("show", { Message: "Connection Changed Successfully" });
            $("#cldnry_conEdit").modal("toggle");
            $("#IntegrationsCall").trigger("click");
            $("#MyIntegration").trigger("click");
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
                //$("#dbConnection_loder").EbLoader("show", { maskItem: { Id: "#dbConnection_mask", Style: { "left": "0" } } });
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

    this.ShowPassword = function () {
        if ($(".Password").attr("type") == "password") {
            $(".Password").attr('type', 'text');
        } else {
            $(".Password").attr('type', 'password');
        }
    };

    this.ONReset = function () {
        //$("#dbConnectionSubmit").reset();
        $(".dbConnectionInput").value = '';
        //$('.MongoConnection').removeAttr("disabled");
    };

    this.DBinteConfEditr = function (INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#dbConnectionEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                $('#dbvendorInput').val(temp[obj].Type);
                $('#dbNickNameInput').val(temp[obj].NickName);
                $('#IntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(temp[obj].ConObject);
                $('#dbDatabaseNameInput').val(temp1["DatabaseName"]);
                $('#dbServerInput').val(temp1["Server"]);
                $('#dbPortInput').val(temp1["Port"]);
                $('#dbUserNameInput').val(temp1["UserName"]);
                $('#dbPasswordInput').val(temp1["Password"]);
                $('#IsSSL').val(temp1["IsSSL"]);
                $('#dbTimeoutInput').val(temp1["Timeout"]);
                break;
            }
        }
    };
    this.MongoDBinteConfEditr = function (INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#filesDbConnectEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                //$('#dbvendorInput').val(temp[obj].DatabaseVendor);
                $('#FilesInputNickname').val(temp[obj].NickName);
                $('#FilesInputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(temp[obj].ConObject);
                // $('#dbDatabaseNameInput').val(temp1["DatabaseName"]);
                $('#FilesInputServer').val(temp1["Host"]);
                $('#FilesInputPort').val(temp1["Port"]);
                $('#FilesInputUsername').val(temp1["UserName"]);
                $('#FilesInputPassword').val(temp1["Password"]);
                $('#FilesInputIsSSL').val(temp1["IsSSL"]);
                //  $('#dbTimeoutInput').val(temp1["Timeout"]);
            }
        }
    };
    this.CloudinaryinteConfEditr = function (INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#cldnry_conEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                $('#CloudnaryInputNickname').val(temp[obj].NickName);
                $('#CloudnaryInputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(temp[obj].ConObject);
                $('#CloudnaryInputCloud').val(temp1["Cloud"]);
                $('#CloudnaryInputApikey').val(temp1["ApiKey"]);
                $('#CloudnaryInputApisecret').val(temp1["ApiSecret"]);
                $('#IsSSL').val(temp1["IsSSL"]);
                break;
            }
        }
    };
    this.SMTPinteConfEditr = function (INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#EmailconnectionEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                $('#EmailInputNickname').val(temp[obj].NickName);
                $('#SMTPInputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(temp[obj].ConObject);
                $('#EmailInputEmailvendor').val(temp1["ProviderName"]);
                $('#EmailInputEmail').val(temp1["EmailAddress"]);
                $('#EmailInputPassword').val(temp1["Password"]);
                $('#EmailInputSMTP').val(temp1["Host"]);
                $('#EmailInputPort').val(temp1["Port"]);
                //$('#SMTPInputIntConfId').val(temp1["Id"]);
                $('#IsSSL').val(temp1["IsSSL"]);
            }
        }
    };
    this.TwiliointeConfEditr = function (INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#TwilioConnectionEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                $('#TwilioInputNickname').val(temp[obj].NickName);
                $('#TwilioInputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(temp[obj].ConObject);
                $('#TwilioInputUsername').val(temp1["UserName"]);
                $('#TwilioInputPassword').val(temp1["Password"]);
                $('#TwilioInputFrom').val(temp1["From"]);
                $('#IsSSL').val(temp1["IsSSL"]);
            }
        }
    };
    this.ExpertTextinginteConfEditr = function (INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#ExpertTextingConnectionEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                $('#ExpertInputNickname').val(temp[obj].NickName);
                $('#ExpertInputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(temp[obj].ConObject);
                $('#ExpertInputUsername').val(temp1["UserName"]);
                $('#ExpertInputPassword').val(temp1["Password"]);
                $('#ExpertInputApi').val(temp1["ApiKey"]);
                $('#ExpertInputFrom').val(temp1["From"]);
                $('#IsSSL').val(temp1["IsSSL"]);
            }
        }
    };
    this.MapinteConfEditr = function (INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#MapConnectionEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                $('#MapInputNickname').val(temp[obj].NickName);
                $('#MapInputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(temp[obj].ConObject);
                $('#MapInputApiKey').val(temp1["UserName"]);
            }
        }
    };

    this.VerticalTab = function (evt, cityName) {
        var button = $(evt.currentTarget)
        var datatype = button.text()
        var i, tabcontent, tablinks;
        tabcontent = $(".tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = $(".tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        $("#" + datatype + "_Call").css("display", "block");
        evt.currentTarget.className += " active";
    };

    this.AllInputClear = function (e) {
        $(".Inputclear").val("")
        $(".IntConfId").val("0")
    };

    this.ModalDataEntry = function (e) {
        $('#vendor').val(IntergrationConfigCollection.type);
    };

    this.ShowIntreationModalList = function (e) {
        var html = [];
        $('#All_IntreationList').modal('toggle');
        let which = $(e.target).closest(".Inter_modal_list").attr("data-type");
        let pref = $(e.target).closest(".Inter_modal_list").attr("pref");
        let Id = $(e.target).closest(".Inter_modal_list").attr("IntConfId");
        var temp = this.Connections.IntegrationsConfig;
        $(`#All_Intreation_header h3`).empty().append(which);
        $(`#All_Intreation_bodyflex`).empty();
        html.push(`<input name="Preference" type="text" style="display:none" value="${pref}" />
                        <input name="Id" type="text" style="display:none" value="${Id}" />
                            <input name="Type" type="text" style="display:none" value="${which}" />`);
        switch (which) {
            case "EbOBJECTS":
                var EbOBJECTS = [
                    "PGSQL",
                    "MSSQL",
                    "MYSQL",
                    "ORACLE"
                ];
                for (let j = 0; j < EbOBJECTS.length; j++)
                    if (temp[EbOBJECTS[j]] !== undefined) {
                        for (let i = 0, n = temp[EbOBJECTS[j]].length; i < n; i++) {
                            html.push(`<input type="radio" name="ConfId" value="${temp[EbOBJECTS[j]][i].Id}" class="modalintegre-list-a">${temp[EbOBJECTS[j]][i].NickName}<br>`);
                        }
                    }
                break;
            case "EbDATA":
                var EbDATA = [
                    "PGSQL",
                    "MSSQL",
                    "MYSQL",
                    "ORACLE"
                ];
                for (let j = 0; j < EbDATA.length; j++)
                    if (temp[EbDATA[j]] !== undefined) {
                        for (let i = 0, n = temp[EbDATA[j]].length; i < n; i++) {
                            html.push(`<input type="radio" name="ConfId" value="${temp[EbDATA[j]][i].Id}" class="modalintegre-list-a">${temp[EbDATA[j]][i].NickName}<br>`);
                        }
                    }
                break;
            case "EbFILES":
                var EbFILES = [
                    "PGSQL",
                    "MSSQL",
                    "MYSQL",
                    "ORACLE",
                    "MongoDB"
                ];
                for (let j = 0; j < EbFILES.length; j++)
                    if (temp[EbFILES[j]] !== undefined) {
                        for (let i = 0, n = temp[EbFILES[j]].length; i < n; i++) {
                            html.push(`<input type="radio" name="ConfId" value="${temp[EbFILES[j]][i].Id}" class="modalintegre-list-a">${temp[EbFILES[j]][i].NickName}<br>`);
                        }
                    }
                break;
            case "EbLOGS":
                var EbLOGS = [
                    "PGSQL",
                    "MSSQL",
                    "MYSQL",
                    "ORACLE",
                    "MongoDB"
                ];
                for (let j = 0; j < EbLOGS.length; j++)
                    if (temp[EbLOGS[j]] !== undefined) {
                        for (let i = 0, n = temp[EbLOGS[j]].length; i < n; i++) {
                            html.push(`<input type="radio" name="ConfId" value="${temp[EbLOGS[j]][i].Id}" class="modalintegre-list-a">${temp[EbLOGS[j]][i].NickName}<br>`);
                        }
                    }
                break;
            case "SMTP":
                var SMTP = [
                    "SMTP"
                ];
                for (let j = 0; j < SMTP.length; j++)
                    if (temp[SMTP[j]] !== undefined) {
                        for (let i = 0, n = temp[SMTP[j]].length; i < n; i++) {
                            html.push(`<input type="radio" name="ConfId" value="${temp[SMTP[j]][i].Id}" class="modalintegre-list-a">${temp[SMTP[j]][i].NickName}<br>`);
                        }
                    }
                break;
            case "SMS":
                var SMS = [
                    "ExpertTexting",
                    "Twilio"
                ];
                for (let j = 0; j < SMS.length; j++)
                    if (temp[SMS[j]] !== undefined) {
                        for (let i = 0, n = temp[SMS[j]].length; i < n; i++) {
                            html.push(`<input type="radio" name="ConfId" value="${temp[SMS[j]][i].Id}" class="modalintegre-list-a">${temp[SMS[j]][i].NickName}<br>`);
                        }
                    }
                break;
            case "Cloudinary":
                var Cloudinary = [
                    "Cloudinary"
                ];
                for (let j = 0; j < Cloudinary.length; j++)
                    if (temp[Cloudinary[j]] !== undefined) {
                        for (let i = 0, n = temp[Cloudinary[j]].length; i < n; i++) {
                            html.push(`<input type="radio" name="ConfId" value="${temp[Cloudinary[j]][i].Id}" class="modalintegre-list-a">${temp[Cloudinary[j]][i].NickName}<br>`);
                        }
                    }
                break;
            default:
                text = "I have never heard of that fruit...";
        }

        $('#All_Intreation_bodyflex').append(html.join(""));
    }.bind(this);

    this.AllInterationConfigDisp = function (e) {

        let which = $(e.target).closest(".DisplayAllModal").attr("data-whatever");
        var temp = this.Connections.IntegrationsConfig[which] || [];
        $(`#All_IntreationConfig_header h3`).empty().append(which);
        $(`#All_IntreationConfig_bodyflex`).empty();
        for (let i = 0, n = temp.length; i < n; i++) {
            let $html = $(`<div class="inteConfContainer">
                                <div class="inteConfContainer_pd w-100">
                                     <div class="integrationbody edit-pencil-holder">
                                          <div class="${which}edit" data-whatever="${which}" datawhater="${temp[i].Id}">
                                                <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
                                          </div>
                                     </div>
                                     <div id="nm" class="type integrationbody ">
                                           <div class="vend_img">
                                                ${this.getType(temp[i].Type)}
                                           </div>
                                     </div>
                                     <div id="nm" class="integrationbody">
                                           <h4>${temp[i].NickName}</h4>
                                     </div>
                                     <div id="nm" class="integrationbody">
                                          <h6>${temp[i].CreatedOn}</h6>
                                     </div>
                                 </div>
                             </div >`)
            $(`#All_IntreationConfig_bodyflex`).append($html)
        }
        $(`#All_IntreationConfig_footer`).empty();
        let $html1 = $(`<button data-name="${which}" class="ebbtn eb_btngreen eb_btn-sm pull-right EditorModalcaller">
                                <i class="fa fa-plus-circle" aria-hidden="true"></i> Add
                        </button>`);
        $(`#All_IntreationConfig_header h3`).append($html1);
        $('#All_IntreationConfig').modal('toggle');
    }.bind(this);

    this.getType = function (type) {
        let html = [];
        if (type == "PGSQL") {
            html.push('<img class="img-responsive" src="../images/POSTGRES.png" align="middle" style="height:50px" />');
        } else if (type == "MYSQL") {
            html.push('<img class="img-responsive" src="../images/mysql.png" align="middle" style="height: 50px;" />');
        } else if (type == "ORACLE") {
            html.push('<img class="img-responsive" src="../images/oracle.png" style="height: 50px;" />');
        } else if (type == "MSSQL") {
            html.push('<img class="img-responsive" src="../images/sqlserver.png" style="height: 50px;" />');
        } else if (type == "MongoDB") {
            html.push('<img class="img-responsive" src="../images/MongodB.png" style="height: 50px;" />');
        } else if (type == "Cloudinary") {
            html.push('<img class="img-responsive" src="../images/cloudnary.png" style="height: 25px;" />');
        } else if (type == "SMTP") {
            html.push('<img class="img-responsive" src="../images/svg/email.svg" style="height:50px" />');
        } else if (type == "SMTP") {
            html.push('<img class="img-responsive" src="../images/twilio.png" style="height: 50px;" />');
        } else {
            html.push('<img class="img-responsive" src="../images/expert texting.png" style="height: 35px;" />');
        }
        return html.join("");
    };

    this.AllEditorOpen = function (e) {
        let temp = e;
        let which = $(temp.currentTarget).attr("data-name");
        if (which == "PGSQL" || which == "MYSQL" || which == "MSSQL" || which == "ORACLE") {
            $('#dbConnectionEdit').modal('toggle');
        } else if (which == "MongoDb") {
            $('#filesDbConnectEdit').modal('toggle');
        } else if (which == "Cloudinary") {
            $('#cldnry_conEdit').modal('toggle');
        } else if (which == "SMTP") {
            $('#EmailconnectionEdit').modal('toggle');
        } else if (which == "Twilio") {
            $('#TwilioConnectionEdit').modal('toggle');
        } else if (which == "ExpertTexting") {
            $('#ExpertTextingConnectionEdit').modal('toggle');
        }
    };

    this.ContextMenu = function (e) {
        $.contextMenu({
            selector: '.inteConfContainer',
            trigger: 'left',
            build: function ($trigger) {
                var options =
                {
                    callback: function (key, options) {
                        var temp = this.Connections.Integrations[key];
                        var id = $(options.$trigger).attr("id");
                        var dt = $(options.$trigger).attr("data-whatever");
                        conf_NN = $(options.$trigger).attr("conf_NN");
                        if (key == "Edit") {
                            if (dt == "PGSQL" || dt == "MYSQL" || dt == "MSSQL" || dt == "ORACLE")
                                this.DBinteConfEditr(id, dt);
                            else {
                                var name = dt.concat("inteConfEditr");
                                this[name](id, dt)
                            }
                        }
                        else if (key == "Delete") {
                            EbDialog("show",
                                {
                                    Message: "The " + conf_NN +" info will be permanently removed ",
                                    Buttons: {
                                        "Confirm": {
                                            Background: "green",
                                            Align: "right",
                                            FontColor: "white;"
                                        },
                                        "Cancel": {
                                            Background: "red",
                                            Align: "left",
                                            FontColor: "white;"
                                        }
                                    },
                                    CallBack: function (name) {
                                        if (name == "Confirm")
                                            this.IntergrationConfigDelete(posData = { "Id": id });
                                    }.bind(this)
                                });
                        }
                        else {
                            var flag = 0;
                            $.each(temp, function (i) {
                                if (temp[i].ConfId == id) {
                                    flag = 1;
                                }
                            }.bind(this));
                            if (flag == 0) {
                                postData = { "SolutionId": this.Sid, "Preference": "PRIMARY", "Id": 0, "Type": key, "ConfId": id }
                                if (temp == undefined) {
                                    this.IntegrationSubmit();
                                }
                                else if (key == "SMS" || key == "SMTP") {
                                    if (temp.length == 1) {
                                        $.each(temp, function (i) {
                                            if (temp[i].Preference == 1) {
                                                postData.Preference = "FALLBACK";
                                            }
                                        }.bind(this));
                                        this.IntegrationSubmit();
                                    }
                                    else if (temp.length == 0) {
                                        this.IntegrationSubmit();
                                    }
                                    else {
                                        EbMessage("show", { Message: "Please delete existing account then try again", Background: "red" });
                                    }
                                }
                                else if (key == "EbFILES") {
                                    $.each(temp, function (i) {
                                        if (temp[i].Preference == 1) {
                                            postData.Preference = "OTHER";
                                        }
                                    }.bind(this));
                                    this.IntegrationSubmit();
                                }
                                else {
                                    EbMessage("show", { Message: "Please delete existing account then try again", Background: "red" });
                                }

                            } else {
                                EbMessage("show", { Message: "This " + conf_NN +" have been already used.", Background: "red" });
                            }
                        }

                    }.bind(this),
                    items: {}
                };

                if ($trigger.hasClass('PGSQLedit')) {
                    options.items.EbDATA = { name: "Configure as Data Store" },
                        options.items.EbFILES = { name: "Configure as File Store" },
                        options.items.Delete = { name: "Remove" },
                        //options.items.EbLOGS = { name: "Set as EbLogs" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('MYSQLedit')) {
                    options.items.EbDATA = { name: "Configure as Data Store" },
                        options.items.EbFILES = { name: "Configure as File Store" },
                        options.items.Delete = { name: "Remove" },
                        //options.items.EbLOGS = { name: "Set as EbLogs" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('MSSQLedit')) {
                    options.items.EbDATA = { name: "Configure as Data Store" },
                        options.items.EbFILES = { name: "Configure as File Store" },
                        options.items.Delete = { name: "Remove" },
                        //options.items.EbLOGS = { name: "Set as EbLogs" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('ORACLEedit')) {
                    options.items.EbDATA = { name: "Configure as Data Store" },
                        options.items.EbFILES = { name: "Configure as File Store" },
                        options.items.Delete = { name: "Remove" },
                        //options.items.EbLOGS = { name: "Set as EbLogs" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('MongoDBedit')) {
                    options.items.EbDATA = { name: "Configure as Data Store" },
                        options.items.EbFILES = { name: "Configure as File Store" },
                        options.items.Delete = { name: "Remove" },
                        //options.items.EbLOGS = { name: "Set as EbLogs" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('Twilioedit')) {
                    options.items.SMS = { name: "Set as SMS" },
                        options.items.Delete = { name: "Remove" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('ExpertTextingedit')) {
                    options.items.SMS = { name: "Set as SMS" },
                        options.items.Delete = { name: "Remove" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('SMTPedit')) {
                    options.items.SMTP = { name: "Set as SMTP" },
                        options.items.Delete = { name: "Remove" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('Cloudinaryedit')) {
                    options.items.Cloudinary = { name: "Set as Cloudinary" },
                        options.items.Delete = { name: "Remove" },
                        options.items.Edit = { name: "Edit" };
                }
                return options;
            }.bind(this)
        });
        $('.context-menu-one').on('click', function (e) {
            console.log('clicked', this);
        })

        $.contextMenu({
            selector: '.integrationContainer',
            trigger: 'left',
            build: function ($trigger) {
                var options = {
                    callback: function (key, options) {

                        var dt = $(options.$trigger).attr("data-whatever");
                        var temp = this.Connections.Integrations[dt];
                        var id = $(options.$trigger).attr("id");
                        var confid = $(options.$trigger).attr("dataConffId");
                        conf_NN = $(options.$trigger).attr("conf_NN");
                        if (key == "Remove") {
                            EbDialog("show", {
                                Message: "The " + conf_NN + " will be removed !!!",
                                Buttons: {
                                    "Confirm": {
                                        Background: "green",
                                        Align: "right",
                                        FontColor: "white;"
                                    },
                                    "Cancel": {
                                        Background: "red",
                                        Align: "left",
                                        FontColor: "white;"
                                    }
                                },
                                CallBack: function (name) {
                                    if (name == "Confirm") {
                                        this.IntergrationDelete(posData = { "Id": id });
                                    }

                                }.bind(this)
                            });
                        } else if (key == "PRIMARY") {
                            preferancetype = [];
                            for (var i = 0, n = temp.length; i < n; i++) {
                                if (temp[i].Preference == "2") {
                                    postData = { SolutionId: this.Sid, Preference: "PRIMARY", Id: id, Type: dt, ConfigId: confid };
                                }
                                else {
                                    postData = { SolutionId: this.Sid, Preference: "FALLBACK", Id: temp[i].Id, Type: dt, ConfigId: temp[i].ConfId };
                                }
                                preferancetype.push(postData)
                            }
                            this.PreferencesChange();
                        } else if (key == "FALLBACK") {
                            preferancetype = [];
                            for (var i = 0, n = temp.length; i < n; i++) {
                                if (temp[i].Preference == "1") {
                                    postData = { SolutionId: this.Sid, Preference: "FALLBACK", Id: id, Type: dt, ConfigId: confid };
                                }
                                else {
                                    postData = { SolutionId: this.Sid, Preference: "PRIMARY", Id: temp[i].Id, Type: dt, ConfigId: temp[i].ConfId };
                                }
                                preferancetype.push(postData)
                            }
                            this.PreferencesChange();
                        } else if (key == "RemoveFilesD") {
                            preferancetype = [];
                            for (var i = 0, n = temp.length; i < n; i++) {
                                if (temp[i].Id == id) {
                                    postData = { SolutionId: this.Sid, Preference: "PRIMARY", Id: id, Type: dt, ConfigId: temp[i].ConfId };
                                }
                                else if (temp[i].Preference == "1") {
                                    postData = { SolutionId: this.Sid, Preference: "OTHER", Id: temp[i].Id, Type: dt, ConfigId: temp[i].ConfId };
                                }
                                preferancetype.push(postData)
                            }
                            this.PreferencesChange();
                        } else if (key == "RemoveP") {
                            EbDialog("show", {
                                Message: "The " + conf_NN + " will be removed. Fallback will be set as PRIMARY !!! ",
                                Buttons: {
                                    "Confirm": {
                                        Background: "green",
                                        Align: "right",
                                        FontColor: "white;"
                                    },
                                    "Cancel": {
                                        Background: "red",
                                        Align: "left",
                                        FontColor: "white;"
                                    }
                                },
                                CallBack: function (name) {
                                    if (name == "Confirm") {
                                        for (var i = 0, n = temp.length; i < n; i++) {
                                            if (temp[i].Preference == "2") {
                                                postData = { SolutionId: this.Sid, Preference: "PRIMARY", Id: temp[i].Id, Type: dt, ConfigId: temp[i].ConfId };
                                            }
                                            else {
                                                Deleteid = id;
                                            }
                                        }
                                    }
                                    this.PrimaryChange();
                                }.bind(this)
                            });
                        }
                    }.bind(this),
                    items: {}
                };

                if ($trigger.hasClass('EbDATAedit')) {
                    options.items.Remove = { name: "Unset" }

                } else if ($trigger.hasClass('EbFILESedit 3')) {
                    options.items.Remove = { name: "Unset" },
                        options.items.RemoveFilesD = { name: "Set as Default" }

                } else if ($trigger.hasClass('EbFILESedit 1')) {
                    options.items.Remove = { name: "Unset" },
                        options.items.FALLBACK = {
                            name: "Set as FALLBACK", disabled: function (key, opt) {
                                // this references the trigger element
                                return !this.data('cutDisabled');
                            }
                        }

                } else if ($trigger.hasClass('SMTPedit 1')) {
                    options.items.RemoveP = { name: "Unset" },
                        options.items.FALLBACK = { name: "Set as FALLBACK" }

                } else if ($trigger.hasClass('SMTPedit 2')) {
                    options.items.Remove = { name: "Unset" },
                        options.items.PRIMARY = { name: "Set as PRIMARY" }

                } else if ($trigger.hasClass('Cloudinaryedit')) {
                    options.items.Remove = { name: "Unset" }

                } else if ($trigger.hasClass('SMSedit 1')) {
                    options.items.RemoveP = { name: "Unset" },
                        options.items.FALLBACK = { name: "Set as FALLBACK" }

                } else if ($trigger.hasClass('SMSedit 2')) {
                    options.items.Remove = { name: "Unset" },
                        options.items.PRIMARY = { name: "Set as PRIMARY" }
                }

                return options;
            }.bind(this)
        });
        $('.context-menu-one').on('click', function (e) {
            console.log('clicked', this);
        })
    };

    this.integration_EbData_all = function () {
        let html = [];
        var count = 0;
        Integrations = this.Connections.Integrations["EbDATA"];
        $("#EbDATA-All").empty();
        $.each(Integrations, function (i, rows) {
            //$.each(rows, function (j, rowss) {
            html.push(`<div class="integrationContainer ${rows.Type.concat("edit")}" conf_NN="${rows.NickName}" data-whatever="${rows.Type}" id="${rows.Id}">
                                <div class="integrationContainer_Image">
                                    ${Imageurl[rows.Ctype]}
                                </div>
                                <div id="nm" class="integrationContainer_NN">
                                    <span>${rows.NickName}</span>
                                    <span class="PF_span">PRIMARY</span>
                                </div>
                                <div id="nm" class="integrationContainer_caret-down">
                                    <i class="fa fa-caret-down" aria-hidden="true"></i>
                                </div>
                            </div>`)
            html.join("");
            count += 1;
        }.bind(this));
        $('#EbDATA-All').append(html);
        $('#Integration_data').empty().append("Data Store (" + count + ")");
    }.bind(this);

    this.integration_EbFiles_all = function () {
        let html = [];
        var count = 0;
        Integrations = this.Connections.Integrations["EbFILES"];
        $.each(Integrations, function (i, rows) {
            //$.each(rows, function (j, rowss) {
            html.push(`<div class="integrationContainer hover-mover ${rows.Type.concat("edit")} ${rows.Preference}" conf_NN="${rows.NickName}" data-whatever="${rows.Type}" id="${rows.Id}" dataConffId="${rows.ConfId}">
                            <div class="integrationContainer_Image">
                                 ${Imageurl[rows.Ctype]}
                            </div>
                            <div id="nm" class="integrationContainer_NN">
                                <span>${rows.NickName}</span>
                            `);
            if (rows.Preference == "1") {
                html.push(`<span  class="PF_span">PRIMARY</span>`);
            }
            html.push(`</div>
                                    <div id="nm" class="inteConfContainer_caret-down ">
                                        <i class="fa fa-caret-down" aria-hidden="true"></i>
                                    </div>
                          </div>`)
            count += 1;
        }.bind(this));
        $('#EbFILES-All').empty().append(html.join(''));
        $('#Integration_files').empty().append("File Store (" + count + ")");
    }.bind(this);

    this.integration_SMTP_all = function () {
        let html = [];
        var count = 0;
        Integrations = this.Connections.Integrations["SMTP"];
        $.each(Integrations, function (i, rows) {
            //$.each(rows, function (j, rowss) {
            html.push(`<div class="integrationContainer hover-mover ${rows.Type.concat("edit")} ${rows.Preference}" data-whatever="${rows.Type}" conf_NN="${rows.NickName}" id="${rows.Id}" dataConffId="${rows.ConfId}">
                            <div class="integrationContainer_Image">
                                 ${Imageurl[rows.Ctype]}
                            </div>
                            <div id="nm" class="integrationContainer_NN">
                                <span>${rows.NickName}</span>
                            `);
            if (rows.Preference == "1") {
                html.push(`<span  class="PF_span">PRIMARY</span>`);
            }
            else {
                html.push(`<span  class="PF_span">Fallback</span>`);
            }
            html.push(`</div>
                                    <div id="nm" class="inteConfContainer_caret-down ">
                                        <i class="fa fa-caret-down" aria-hidden="true"></i>
                                    </div>
                          </div>`)
            count += 1;
        }.bind(this));
        $('#SMTP-All').empty().append(html.join(''));
        $('#Integration_SMTP').empty().append("Email (" + count + ")");
    }.bind(this);

    this.integration_Cloudinary_all = function () {
        let html = [];
        var count = 0;
        Integrations = this.Connections.Integrations["Cloudinary"];
        $.each(Integrations, function (i, rows) {
            //$.each(rows, function (j, rowss) {
            html.push(`<div class="integrationContainer hover-mover ${rows.Type.concat("edit")} ${rows.Preference}" conf_NN="${rows.NickName}" data-whatever="${rows.Type}" id="${rows.Id}" dataConffId="${rows.ConfId}">
                            <div class="integrationContainer_Image">
                                 ${Imageurl[rows.Ctype]}
                            </div>
                            <div id="nm" class="integrationContainer_NN">
                                <span>${rows.NickName}</span>
                                <span  class="PF_span">PRIMARY</span>
                            </div>
                            <div id="nm" class="inteConfContainer_caret-down ">
                                <i class="fa fa-caret-down" aria-hidden="true"></i>
                            </div>
                        </div>`)
            count += 1;
        }.bind(this));
        $('#Cloudinary-all').empty().append(html.join(''));
        $('#Integration_cloudinary').empty().append("Cloudinary (" + count + ")");
    }.bind(this);

    this.integration_SMS_all = function () {
        let html = [];
        var count = 0;
        Integrations = this.Connections.Integrations["SMS"];
        $.each(Integrations, function (i, rows) {
            //$.each(rows, function (j, rowss) {
            html.push(`<div class="integrationContainer hover-mover ${rows.Type.concat("edit")} ${rows.Preference}" conf_NN="${rows.NickName}" data-whatever="${rows.Type}" id="${rows.Id}" dataConffId="${rows.ConfId}">
                            <div class="integrationContainer_Image">
                                 ${Imageurl[rows.Ctype]}
                            </div>
                            <div id="nm" class="integrationContainer_NN">
                                <span>${rows.NickName}</span>
                                `);
            if (rows.Preference == "1") {
                html.push(`<span  class="PF_span">PRIMARY</span>`);
            }
            else {
                html.push(`<span  class="PF_span">Fallback</span>`);
            }
            html.push(`
                            </div>
                            <div id="nm" class="inteConfContainer_caret-down ">
                                <i class="fa fa-caret-down" aria-hidden="true"></i>
                            </div>
                        </div>`)
            count += 1;
        }.bind(this));
        $('#SMS-all').empty().append(html.join(''));
        $('#Integration_sms').empty().append("Message (" + count + ")");
    }.bind(this);

    this.integration_Map_all = function () {
        let html = [];
        var count = 0;
        Integrations = this.Connections.Integrations["MAP"];
        $.each(Integrations, function (i, rows) {
            //$.each(rows, function (j, rowss) {
            html.push(`<div class="integrationContainer hover-mover ${rows.Type.concat("edit")} ${rows.Preference}" conf_NN="${rows.NickName}" data-whatever="${rows.Type}" id="${rows.Id}" dataConffId="${rows.ConfId}">
                            <div class="integrationContainer_Image">
                                 ${Imageurl[rows.Ctype]}
                            </div>
                            <div id="nm" class="integrationContainer_NN">
                                <span>${rows.NickName}</span>
                                `);
            if (rows.Preference == "1") {
                html.push(`<span  class="PF_span">PRIMARY</span>`);
            }
            else {
                html.push(`<span  class="PF_span">Fallback</span>`);
            }
            html.push(`
                            </div>
                            <div id="nm" class="inteConfContainer_caret-down ">
                                <i class="fa fa-caret-down" aria-hidden="true"></i>
                            </div>
                        </div>`)
            count += 1;
        }.bind(this));
        $('#MAP-all').empty().append(html.join(''));
        $('#Integration_map').empty().append("Google Maps (" + count + ")");
    }.bind(this);

    this.integration_config_all = function () {
        let html = [];
        var count = 0;
        InteConfig = this.Connections.IntegrationsConfig;
        $.each(InteConfig, function (i, rows) {
            $.each(rows, function (j, rowss) {
                html.push(`<div class="inteConfContainer ${rowss.Type.concat("edit")} " conf_NN="${rowss.NickName}" data-whatever="${rowss.Type}" id="${rowss.Id}">
                                <div id = "nm" class="inteConfContainer_Image ">
                                    ${Imageurl[rowss.Type]}
                                </div >
                                <div id="nm" class="inteConfContainer_NN" data-toggle="tooltip" data-placement="top" title="Updated on : ${rowss.CreatedOn}">
                                    <span>${rowss.NickName}</span>
                                </div>
                                <div id="nm" class="inteConfContainer_caret-down ">
                                    <i class="fa fa-caret-down" aria-hidden="true"></i>
                                </div>
                             </div > `)
                html.join("");
                count += 1;
            }.bind(this));
        }.bind(this));
        $('#integration_config_all').empty().append(html);
        $('#Integration_conf_all').empty().append("ALL (" + count + ")");
    }.bind(this);

    this.Conf_obj_update = function (connections) {
        //var temp = postData;
        //var x = this.Connections.IntegrationsConfig[type];
        //$.each(x, function (i, val) {
        //    if (val.Id == oconfid) {
        //        this.Connections.IntegrationsConfig[type][i].Id = temp[12].value();
        //    }
        //}.bind(this));
        this.Connections = connections;
        this.integration_config_all();
        this.integration_EbData_all();
        this.integration_EbFiles_all();
        this.integration_SMTP_all();
        this.integration_Cloudinary_all();
        this.integration_SMS_all();
        this.integration_Map_all();
    }.bind(this);

    this.init = function () {

        $("#IntegrationSubmit").on("submit", this.IntegrationSubmit.bind(this));
        $("#dbConnectionSubmit").on("submit", this.dbconnectionsubmit.bind(this));
        $("#filesDbConnectionSubmit").on("submit", this.FilesDbSubmit.bind(this));
        $("#emailConnectionSubmit").on("submit", this.emailConnectionSubmit.bind(this));
        $("#TwilioConnectionSubmit").on("submit", this.twilioAccountSubmit.bind(this));
        $("#ExpertConnectionSubmit").on("submit", this.expertAccountSubmit.bind(this));
        $("#CloudnaryConnectionSubmit").on("submit", this.CloudnaryConSubmit.bind(this));
        $("#FtpConnectionSubmit").on("submit", this.ftpOnSubmit.bind(this));
        $("#MapsConnectionSubmit").on("submit", this.mapOnSubmit.bind(this));
        $(".testConnection").on("click", this.testConnection.bind(this));
        $("#UserNamesAdvanced").on("click", this.showAdvanced.bind(this));
        this.LogoImageUpload();
        this.ContextMenu();
        $("div #ShowPasswordd").on("click", this.ShowPassword.bind(this));
        $(`#EmailconnectionEdit input[name="IsSSL"]`).on("change", function (e) {
            if ($(e.target).is(":checked"))
                $(e.target).val(true);
            else
                $(e.target).val(false);
        });
        $('.db-type-set').on("click", function (event) {
            var DatabaseName = $(event.currentTarget).attr("data-whatever")
            this.AllInputClear();
            $(".IntConfId").val("0")
            $("#dbvendorInput").val(DatabaseName)
        }.bind(this));

        $('.input-clear ').on('show.bs.modal', function (event) {
            this.AllInputClear();
            $(".IntConfId").val("0")
        }.bind(this));

        //  $('.DisplayAllModal').on('click', this.AllInterationConfigDisp.bind(this));
        $('#All_IntreationConfig').on('click', ".EditorModalcaller", this.AllEditorOpen.bind(this));
        $('.dbConnection').on("click", this.ONReset.bind(this));
        $(".VerticalTabContent").on("click", this.VerticalTab.bind(this));
        $("#MyIntegration").on("click", function (e) {
            $('#defaultOpen').trigger('click');
        }.bind(this));

        this.integration_config_all();
        this.integration_EbData_all();
        this.integration_EbFiles_all();
        this.integration_SMTP_all();
        this.integration_Cloudinary_all();
        this.integration_SMS_all();
        this.integration_Map_all();

        
        $(".Inter_modal_list").on("click", this.ShowIntreationModalList.bind(this));
        //$("#IntegrationsCall").trigger("click");
        //$("#MyIntegration").trigger("click");
        //$(".inteConfContainer").on("click", this.AllInputClear.bind(this));
    };

    this.init();

};