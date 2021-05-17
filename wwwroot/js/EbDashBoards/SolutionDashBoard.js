﻿
var SolutionDashBoard = function (connections, sid, versioning, esid, sname) {
    this.Connections = connections;
    this.whichModal = "";
    this.Sid = sid;
    this.GoogleRedirecturi = GoogleRedirecturi;
    this.versioning = versioning;
    var postData;
    var Deleteid;
    var preferancetype = [];
    var preventContextMenu = 0;
    var postDataGoogleDrive = "";
    var Imageurl = {
        "PGSQL": "<img class='img-responsive' src='../images/postgre.png' align='middle' style='height:50px' />",
        "MSSQL": "<img class='img-responsive' src='../images/sqlserver.png' align='middle' style='height: 50px;' />",
        "MYSQL": "<img class='img-responsive' src='../images/mysql.png' align='middle' style='height:35px' />",
        "ORACLE": "<img class='img-responsive' src='../images/oracle.png' align='middle' style='height: 30px;margin-top: -15px;' />",
        "MongoDB": "<img class='img-responsive' src='../images/mongo_db.png' align='middle' style='height:40px' />",
        "Cloudinary": "<img class='img-responsive' src='../images/cloudnary.png' align='middle' style='height: 17px;' />",
        "ExpertTexting": "<img class='img-responsive' src='../images/expert_texting.png' align='middle' style='height:26px' />",
        "TextLocal": "<img class='img- responsive image-vender' src='../images/textlocal_logo.png' style='width:65%' />",
        "SmsBuddy": "<img class='img- responsive image-vender' src='../images/smsbuddy.png' style='width:75%' />",
        "Twilio": "<img class='img-responsive' src='../images/twilio_l.png' align='middle' style='height: 38px;' />",
        "SMTP": "<img class='img-responsive' src='../images/svg/email.svg' align='middle' style='height: 36px;' />",
        "GoogleMap": "<img class='img- responsive image-vender' src='../images/maps-google.png' style='width: 100 %' />",
        "SendGrid": "<img class='img- responsive image-vender' src='../images/send_grid.png' style='width: 100 %' />",
        "GoogleDrive": "<img class='img- responsive image-vender' src='../images/google_drive-logo.png' style='width:68%' />",
        "AWSS3": "<img class='img- responsive image-vender' src='../images/amazon-s3.png' style='width:100%' />",
        "DropBox": "<img class='img- responsive image-vender' src='../images/dropbox_logo.png' style='width:100%' />",
        "Slack": "<img class='img- responsive image-vender' src='../images/slack.png' style='width:100%' />",
        "Facebook": "<img class='img- responsive image-vender' src='../images/fb_logo.png' style='width:46%' />",
        "Unifonic": "<img class='img- responsive image-vender' src='../images/unifonic.png' style='width:65%' />",
        "OSM": "<img class='img- responsive image-vender' src='../images/open-street-map-medium-1.png' style='width:55%' />",
        "MobileConfig": "<img class='img- responsive image-vender' src='../images/mobile settings.png' style='width:30%' />",
    };
    var venderdec = {
        "PGSQL": `<img class='img-responsive' src='../images/postgre.png' align='middle' style='height: 100px;margin:auto;margin-top: 15px;margin-bottom: 15px;' />
                        <div class="connection-vender-desp">
                            <span>PostgreSQL, also known as Postgres, is a free and open-source relational database management system emphasizing extensibility and technical standards compliance. It is designed to handle a range of workloads, from single machines to data warehouses or Web services with many concurrent users.</span>
                        </div>`,
        "MYSQL": `<img class='img-responsive' src='../images/mysql.png' align='middle' style='height: 100px;margin:auto;margin-top: 15px;margin-bottom: 15px;' />
                        <div class="connection-vender-desp">
                            <span>MySQL is an open-source relational database management system. Its name is a combination of "My", the name of co-founder Michael Widenius's daughter, and "SQL", the abbreviation for Structured Query Language.</span>
                        </div>`,
        "MSSQL": `<img class='img-responsive' src='../images/sqlserver.png' align='middle' style='height: 100px;margin:auto;margin-top: 15px;margin-bottom: 15px;' />
                        <div class="connection-vender-desp">
                            <span>Microsoft SQL Server is a relational database management system developed by Microsoft. As a database server, it is a software product with the primary function of storing and retrieving data as requested by other software applications—which may run either on the same computer or on another computer across a network.</span>
                        </div>` ,
        "ORACLE": `<img class='img-responsive' src='../images/oracle.png' align='middle' style='height: 100px;margin:auto;margin-top: 15px;margin-bottom: 15px;' />
                        <div class="connection-vender-desp">
                            <span>
                            Oracle Database is a multi-model database management system produced and marketed by Oracle Corporation. It is a database commonly used for running online 
                            transaction processing, data warehousing and mixed database workloads.</span>
                        </div>`
    };

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
    };

    this.IntegrationSubmit = function (e) {
        $("#eb_common_loader").EbLoader("show");
        //e.preventDefault();
        //var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/Integrate",
            data: { preferancetype: JSON.stringify(postData), deploy: e, sid, drop: false },
            beforeSend: function () {
                preventContextMenu = 1;
                //$("#Integration_loder").EbLoader("show", { maskItem: { Id: "#dbConnection_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            $("#eb_common_loader").EbLoader("hide");
            var temp = JSON.parse(data);
            if (temp.ResponseStatus) {
                EbMessage("show", { Message: "Integreation Change Not Complete", Background: "red" });
                EbDialog("show",
                    {
                        Message: "DataBase Already Exist. Do you wanna complete the Connection ",
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
                            if (name === "Confirm") {
                                $.ajax({
                                    type: "POST",
                                    url: "../ConnectionManager/Integrate",
                                    data: { preferancetype: JSON.stringify(postData), deploy: e, sid, drop: true }
                                }).done(function (data) {
                                    preventContextMenu = 0;
                                    //$("#Integration_loder").EbLoader("hide");
                                    if (data) {
                                        this.Conf_obj_update(JSON.parse(data));
                                        EbMessage("show", { Message: "Integreation Changed Successfully" });
                                    }
                                }.bind(this));
                            } else if (name === "Cancel") {
                                preventContextMenu = 0;
                                EbMessage("show", { Message: "Integreation Failed", Background: "red" });
                            }

                        }.bind(this)
                    });
            }
            else {
                preventContextMenu = 0;
                this.Conf_obj_update(JSON.parse(data));
                EbMessage("show", { Message: "Integreation Changed Successfully" });
            }
        }.bind(this));
    };

    this.PreferencesChange = function () {
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/IntegrationSwitch",
            data: { preferancetype: JSON.stringify(preferancetype), sid },
            beforeSend: function () {
                preventContextMenu = 1;
                $("#Integration_loder").EbLoader("show", { maskItem: { Id: "#dbConnection_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            $("#Integration_loder").EbLoader("hide");
            preventContextMenu = 0;
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
                preventContextMenu = 1;
                $("#Integration_loder").EbLoader("show", { maskItem: { Id: "#dbConnection_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            preventContextMenu = 0;
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
        $("#eb_common_loader").EbLoader("show");
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/IntegrateConfDelete",
            data: { Id, sid },
            beforeSend: function () {
                preventContextMenu = 1;
                $("#Integration_loder").EbLoader("show", { maskItem: { Id: "#dbConnection_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            $("#eb_common_loader").EbLoader("hide");
            preventContextMenu = 0;
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
        $("#eb_common_loader").EbLoader("show");
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/IntegrateDelete",
            data: { Id, sid },
            beforeSend: function () {
                preventContextMenu = 1;
                $("#Integration_loder").EbLoader("show", { maskItem: { Id: "#dbConnection_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            $("#eb_common_loader").EbLoader("hide");
            preventContextMenu = 0;
            $("#Integration_loder").EbLoader("hide");
            if (data) {
                this.Conf_obj_update(JSON.parse(data));
                EbMessage("show", { Message: "Data Removed Successfully" });
            }
            else
                EbMessage("show", { Message: "Data Removing Failed", Background: "red" });
        }.bind(this));
    };

    this.credientialBot = function (CId, dt) {
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/credientialBot",
            data: { CId, sid },
            beforeSend: function () {
                preventContextMenu = 1;
            }
        }).done(function (data) {
            preventContextMenu = 0;
            if (data) {
                if (JSON.parse(data).ResponseStatus === null) {
                    if (dt === "PGSQL" || dt === "MYSQL" || dt === "MSSQL" || dt === "ORACLE")
                        this.DBinteConfEditr(data, CId, dt);
                    else {
                        var name = dt.concat("inteConfEditr");
                        this[name](data, CId, dt);
                    }
                }
                else {
                    EbMessage("show", { Message: "Cannot Edit Default Database", Background: "red" });
                }
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

    this.textLocalAccountSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/AddTextLocal",
            data: postData,
            beforeSend: function () {
                $("#textLocalConnection_loder").EbLoader("show", { maskItem: { Id: "#textlocal_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            this.Conf_obj_update(JSON.parse(data));
            $("#textLocalConnection_loder").EbLoader("hide");
            EbMessage("show", { Message: "Connection Changed Successfully" });
            $("#TextLocalConnectionEdit").modal("toggle");
        }.bind(this));
    };

    this.smsBuddyAccountSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/AddSmsBuddy",
            data: postData,
            beforeSend: function () {
                $("#smsBuddyConnection_loder").EbLoader("show", { maskItem: { Id: "#smsbuddy_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            this.Conf_obj_update(JSON.parse(data));
            $("#smsBuddyConnection_loder").EbLoader("hide");
            EbMessage("show", { Message: "Connection Changed Successfully" });
            $("#SmsBuddyConnectionEdit").modal("toggle");
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

    this.UnifonicAccountSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/AddUnifonic",
            data: postData,
            beforeSend: function () {
                $("#UnifonicConnection_loder").EbLoader("show", { maskItem: { Id: "#unifonic_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            this.Conf_obj_update(JSON.parse(data));
            $("#UnifonicConnection_loder").EbLoader("hide");
            EbMessage("show", { Message: "Connection Changed Successfully" });
            $("#UnifonicConnectionEdit").modal("toggle");
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

    this.SendGridOnSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/AddSendGrid",
            data: postData,
            beforeSend: function () {
                $("#SendGrid_loader").EbLoader("show", { maskItem: { Id: "#Map_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            this.Conf_obj_update(JSON.parse(data));
            $("#SendGrid_loader").EbLoader("hide");
            EbMessage("show", { Message: "Connection Added Successfully" });
            $("#SentGridConnectionEdit").modal("toggle");
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
            $("#Map_loader").EbLoader("hide");
            EbMessage("show", { Message: "Connection Added Successfully" });
            $("#MapConnectionEdit").modal("toggle");
            $("#IntegrationsCall").trigger("click");
            $("#MyIntegration").trigger("click");
        }.bind(this));
    };

    //this.OSMOnSubmit = function (e) {
    //    e.preventDefault();
    //    var postData = $(e.target).serializeArray();
    //    $.ajax({
    //        type: 'POST',
    //        url: "../ConnectionManager/AddOpenStreetMap",
    //        data: postData,
    //        beforeSend: function () {
    //            $("#Map_loader").EbLoader("show", { maskItem: { Id: "#Map_mask", Style: { "left": "0" } } });
    //        }
    //    }).done(function (data) {
    //        this.Conf_obj_update(JSON.parse(data));
    //        $("#Map_loader").EbLoader("hide");
    //        EbMessage("show", { Message: "Connection Added Successfully" });
    //        $("#MapConnectionEdit").modal("toggle");
    //        $("#IntegrationsCall").trigger("click");
    //        $("#MyIntegration").trigger("click");
    //    }.bind(this));
    //}; 
    this.MobileConfigConnectionSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/AddAzureNotificationHub",
            data: postData,
            beforeSend: function () {
                $("#MobileConfig_loader").EbLoader("show", { maskItem: { Id: "#Map_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            this.Conf_obj_update(JSON.parse(data));
            $("#MobileConfig_loader").EbLoader("hide");
            $("#MobileConfigEdit").modal("toggle");
            EbMessage("show", { Message: "Connection Added Successfully" });
        }.bind(this));
    };

    this.DropBoxOnSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/AddDropBox",
            data: postData,
            beforeSend: function () {
                $("#DropBox_loader").EbLoader("show", { maskItem: { Id: "#Map_mask", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            this.Conf_obj_update(JSON.parse(data));
            $("#DropBox_loader").EbLoader("hide");
            EbMessage("show", { Message: "Connection Added Successfully" });
            $("#DropBoxConnectionEdit").modal("toggle");
            $("#IntegrationsCall").trigger("click");
            $("#MyIntegration").trigger("click");
        }.bind(this));
    };

    this.GoogleDriveOnSubmit = function (e) {
        e.preventDefault();
        postDataGoogleDrive = $(e.target).serializeArray();
        var uri = "";
        if (GoogleRedirecturi === "Staging")
            uri = "https://myaccount.eb-test.site";
        else if (GoogleRedirecturi === "Production")
            uri = "https://myaccount.expressbase.com";
        auth2 = gapi.auth2.init({
            client_id: postDataGoogleDrive[3].value,
            access_type: 'offline',
            redirect_uri: uri,
            scope: 'https://www.googleapis.com/auth/drive'
            // Scopes to request in addition to 'profile' and 'email'
            //scope: 'additional_scope'
        });
        auth2.grantOfflineAccess().then(signInCallback.bind(this));
        function signInCallback(authresult) {
            if (authresult['code']) {
                postDataGoogleDrive[5].value = authresult['code'];
                $.ajax({
                    type: 'POST',
                    url: "../ConnectionManager/AddGoogleDriveAsync",
                    data: postDataGoogleDrive,
                    beforeSend: function () {
                        $("#GoogleDrive_loader").EbLoader("show", { maskItem: { Id: "#GoogleDrive_mask", Style: { "left": "0" } } });
                    }
                }).done(function (data) {
                    this.Conf_obj_update(JSON.parse(data));
                    $("#GoogleDrive_loader").EbLoader("hide");
                    EbMessage("show", { Message: "Connection Added Successfully" });
                    $("#GoogleDriveConnectionEdit").modal("toggle");
                    $("#IntegrationsCall").trigger("click");
                    $("#MyIntegration").trigger("click");
                }.bind(this));
            } else {
                EbDialog("show",
                    {
                        Message: "Authorisation Code not found. ",
                        Buttons: {
                            "Cancel": {
                                Background: "red",
                                Align: "left",
                                FontColor: "white;"
                            }
                        }
                    });
            }
        }
    }.bind(this);

    this.AWSS3OnSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/AddAWSS3",
            data: postData,
            beforeSend: function () {
                $("#AWSS3_loader").EbLoader("show", { maskItem: { Id: "#AWSS3", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            this.Conf_obj_update(JSON.parse(data));
            $("#AWSS3_loader").EbLoader("hide");
            EbMessage("show", { Message: "Connection Added Successfully" });
            $("#AWSS3ConnectionEdit").modal("toggle");
            $("#IntegrationsCall").trigger("click");
            $("#MyIntegration").trigger("click");
        }.bind(this));
    };

    this.SlackOnSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/AddSlack",
            data: postData,
            beforeSend: function () {
                $("#Slack_loader").EbLoader("show", { maskItem: { Id: "#Slack", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            this.Conf_obj_update(JSON.parse(data));
            $("#Slack_loader").EbLoader("hide");
            EbMessage("show", { Message: "Connection Added Successfully" });
            $("#SlackConnectionEdit").modal("toggle");
            $("#IntegrationsCall").trigger("click");
            $("#MyIntegration").trigger("click");
        }.bind(this));
    };

    this.facebookOnSubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/AddFacebook",
            data: postData,
            beforeSend: function () {
                $("#facebook_loader").EbLoader("show", { maskItem: { Id: "#facebook", Style: { "left": "0" } } });
            }
        }).done(function (data) {
            this.Conf_obj_update(JSON.parse(data));
            $("#facebook_loader").EbLoader("hide");
            EbMessage("show", { Message: "Connection Added Successfully" });
            $("#facebookConnectionEdit").modal("toggle");
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



    this.getgoogledrivefile = function (evt) {
        evt.preventDefault();
        let files = document.getElementById("GoogleDriveInputJSONUpload").files[0];
        let reader = new FileReader();
        reader.onload = function (resp) {
            $('#exampleTextarea').val(resp.target.result);
        };
        reader.readAsText(files);
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

            if (data) {
                //EbMessage("show", { Message: "Test Connection Success" });
                //$("#" + formid + " .saveConnection").show();
                //$("#" + formid + " .testConnection").hide();
                $("#" + formid + " .saveConnection").trigger("click");

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
    };
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
            ServerEventUrl: 'https://se.eb-test.site',
            EnableTag: false,
            EnableCrop: true,
            Context: "logo",//if single and crop
            ResizeViewPort: false //if single and crop
        });

        logoCrp.uploadSuccess = function (fileid) {
            EbMessage("show", { Message: "Profile Image Uploaded Successfully" });
        };
        logoCrp.windowClose = function () {
            //EbMessage("show", { Message: "window closed", Background: "red" });
        };
    };

    this.ShowPassword = function () {
        if ($(".Password").attr("type") === "password") {
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

    this.DBinteConfEditr = function (data, INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                var temp1 = JSON.parse(JSON.parse(data).ConnObj);
                $('#dbConnectionEdit').modal('toggle');
                $('#dbvendorInput').val(temp[obj].Type);
                this.db_modal_show_append(temp[obj].Type);
                $('#dbNickNameInput').val(temp[obj].NickName);
                $('#IntConfId').val(temp[obj].Id);
                $('#dbDatabaseNameInput').val(temp1["DatabaseName"]);
                $('#dbServerInput').val(temp1["Server"]);
                $('#dbPortInput').val(temp1["Port"]);
                $('#dbUserNameInput').val(temp1["UserName"]);
                $('#dbPasswordInput').val(temp1["Password"]);
                $('#dbReadWriteUserName').val(temp1["ReadWriteUserName"]);
                $('#dbReadWritePassword').val(temp1["ReadWritePassword"]);
                $('#dbReadOnlyUserName').val(temp1["ReadOnlyUserName"]);
                $('#dbReadOnlyPassword').val(temp1["ReadOnlyPassword"]);
                $('#dbIsSSLInput    ').prop('checked', temp1["IsSSL"]);
                $('#dbTimeoutInput').val(temp1["Timeout"]);
                break;
            }
        }
    };

    this.MongoDBinteConfEditr = function (data, INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#filesDbConnectEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                //$('#dbvendorInput').val(temp[obj].DatabaseVendor);
                $('#FilesInputNickname').val(temp[obj].NickName);
                $('#FilesInputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(JSON.parse(data).ConnObj);
                // $('#dbDatabaseNameInput').val(temp1["DatabaseName"]);
                $('#FilesInputServer').val(temp1["Host"]);
                $('#FilesInputPort').val(temp1["Port"]);
                $('#FilesInputUsername').val(temp1["UserName"]);
                $('#FilesInputPassword').val(temp1["Password"]);
                $('#FilesInputIsSSL').prop('checked', temp1["IsSSL"]);
                //  $('#dbTimeoutInput').val(temp1["Timeout"]);
            }
        }
    };
    this.CloudinaryinteConfEditr = function (data, INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#cldnry_conEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                $('#CloudnaryInputNickname').val(temp[obj].NickName);
                $('#CloudnaryInputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(JSON.parse(data).ConnObj);
                $('#CloudnaryInputCloud').val(temp1["Cloud"]);
                $('#CloudnaryInputApikey').val(temp1["ApiKey"]);
                $('#CloudnaryInputApisecret').val(temp1["ApiSecret"]);
                $('#IsSSL').prop('checked', temp1["IsSSL"]);
                break;
            }
        }
    };
    this.SMTPinteConfEditr = function (data, INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#EmailconnectionEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                $('#EmailInputNickname').val(temp[obj].NickName);
                $('#SMTPInputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(JSON.parse(data).ConnObj);
                $('#InputEmailvendor').val(temp1["ProviderName"]);
                $('#EmailInputEmail').val(temp1["EmailAddress"]);
                $('#EmailInputPassword').val(temp1["Password"]);
                $('#EmailInputSMTP').val(temp1["Host"]);
                $('#EmailInputPort').val(temp1["Port"]);
                //$('#SMTPInputIntConfId').val(temp1["Id"]);
                $('#EmailIsSSL').prop('checked', temp1["EnableSsl"]);
            }
        }
    };
    this.UnifonicinteConfEditr = function (data, INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#UnifonicConnectionEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                $('#UnifonicInputNickname').val(temp[obj].NickName);
                $('#UnifonicInputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(JSON.parse(data).ConnObj);
                $('#UnifonicInputUsername').val(temp1["UserName"]);
                $('#UnifonicInputPassword').val(temp1["Password"]);
                $('#UnifonicInputFrom').val(temp1["From"]);
                $('#IsSSL').prop('checked', temp1["IsSSL"]);
            }
        }
    };
    this.TwiliointeConfEditr = function (data, INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#TwilioConnectionEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                $('#TwilioInputNickname').val(temp[obj].NickName);
                $('#TwilioInputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(JSON.parse(data).ConnObj);
                $('#TwilioInputUsername').val(temp1["UserName"]);
                $('#TwilioInputPassword').val(temp1["Password"]);
                $('#TwilioInputFrom').val(temp1["From"]);
                $('#IsSSL').prop('checked', temp1["IsSSL"]);
            }
        }
    };
    this.ExpertTextinginteConfEditr = function (data, INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#ExpertTextingConnectionEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                $('#ExpertInputNickname').val(temp[obj].NickName);
                $('#ExpertInputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(JSON.parse(data).ConnObj);
                $('#ExpertInputUsername').val(temp1["UserName"]);
                $('#ExpertInputPassword').val(temp1["Password"]);
                $('#ExpertInputApi').val(temp1["ApiKey"]);
                $('#ExpertInputFrom').val(temp1["From"]);
                $('#IsSSL').prop('checked', temp1["IsSSL"]);
            }
        }
    };
    this.TextLocalinteConfEditr = function (data, INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#TextLocalConnectionEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                $('#TextLocalInputNickname').val(temp[obj].NickName);
                $('#TextLocalInputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(JSON.parse(data).ConnObj);
                $('#TextLocalInputApi').val(temp1["ApiKey"]);
                $('#TextLocalInputFrom').val(temp1["From"]);
                $('#TextLocalInputBrand').val(temp1["BrandName"]);
                $('#IsSSL').prop('checked', temp1["IsSSL"]);
            }
        }
    };
    this.SmsBuddyinteConfEditr = function (data, INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#SmsBuddyConnectionEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                $('#SmsBuddyInputNickname').val(temp[obj].NickName);
                $('#SmsBuddyInputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(JSON.parse(data).ConnObj);
                $('#SmsBuddyInputApi').val(temp1["ApiKey"]);
                $('#SmsBuddyInputFrom').val(temp1["From"]);
                $('#IsSSL').prop('checked', temp1["IsSSL"]);
            }
        }
    };
    this.GoogleMapinteConfEditr = function (data, INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#MapConnectionEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                $('#MapInputNickname').val(temp[obj].NickName);
                $('#MapInputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(JSON.parse(data).ConnObj);
                $('#MapInputApiKey').val(temp1["ApiKey"]);
            }
        }
    };
    this.DropBoxinteConfEditr = function (data, INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#DropBoxConnectionEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                $('#DropBoxInputNickname').val(temp[obj].NickName);
                $('#DropBoxInputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(JSON.parse(data).ConnObj);
                $('#DropBoxInputAccessToken').val(temp1["AccessToken"]);
            }
        }
    };
    this.AWSS3inteConfEditr = function (data, INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#AWSS3ConnectionEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                $('#AWSS3InputNickname').val(temp[obj].NickName);
                $('#AWSS3InputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(JSON.parse(data).ConnObj);
                $('#AWSS3InputBucketName').val(temp1["BucketName"]);
                $('#AWSS3InputbucketRegion').val(temp1["BucketRegion"]);
                $('#AWSS3InputAccessKeyID').val(temp1["AccessKeyID"]);
                $('#AWSS3InputSecretAccessKey').val(temp1["SecretAccessKey"]);
            }
        }
    };
    this.SendGridinteConfEditr = function (data, INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#SentGridConnectionEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                $('#SendGridInputNickname').val(temp[obj].NickName);
                $('#SendGridInputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(JSON.parse(data).ConnObj);
                $('#SendGridInputApiKey').val(temp1["ApiKey"]);
                $('#SendGridInputFrom').val(temp1["EmailAddress"]);
                $('#SendGridInputFromName').val(temp1["Name"]);
            }
        }
    };
    this.GoogleDriveinteConfEditr = function (data, INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#GoogleDriveConnectionEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                $('#GoogleDriveInputNickname').val(temp[obj].NickName);
                $('#GoogleDriveInputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(JSON.parse(data).ConnObj);
                $('#GoogleDriveInputApplicationName').val(temp1["ApplicationName"]);
                $('#GoogleDriveInputClientID').val(temp1["ClientID"]);
                $('#GoogleDriveInputClientsecret').val(temp1["Clientsecret"]);
            }
        }
    };
    this.SlackinteConfEditr = function (data, INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#SlackConnectionEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                $('#SlackInputNickname').val(temp[obj].NickName);
                $('#SlackInputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(JSON.parse(data).ConnObj);
                $('#SlackInputOAuthAccessToken').val(temp1["OAuthAccessToken"]);
                $('#SlackInputChannel').val(temp1["Channel"]);
            }
        }
    };
    this.FacebookinteConfEditr = function (data, INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#facebookConnectionEdit').modal('toggle');
        for (var obj in temp) {
            if (temp[obj].Id == INt_conf_id) {
                $('#facebookInputNickname').val(temp[obj].NickName);
                $('#facebookInputIntConfId').val(temp[obj].Id);
                var temp1 = JSON.parse(JSON.parse(data).ConnObj);
                $('#facebookInputAppId').val(temp1["AppId"]);
                $('#facebookInputAppVersion').val(temp1["AppVersion"]);
            }
        }
    };

    this.MobileConfiginteConfEditr = function (data, INt_conf_id, dt) {
        var temp = this.Connections.IntegrationsConfig[dt];
        $('#MobileConfigEdit').modal('toggle');
        var data = JSON.parse(JSON.parse(data).ConnObj);
        $.each(temp, function (i, obj) {
            $('#MobileConfigNickname').val(obj.NickName);
            $('#MobileConfigConfId').val(obj.Id);
            $('#AzureNotificationHubName').val(data.AzureNFHubName);
            $('#AzureNotificationConStr').val(data.AzureNFConnection);
            $('#signinkey').val(data.AndroidAppSignInKey);
            $('#AndroidAppURL').val(data.AndroidAppURL);
        }.bind(this));
    };

    this.VerticalTab = function (evt, cityName) {
        var button = $(evt.currentTarget);
        var datatype = button.text();
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
        $(".Inputclear").val("");
        $(".IntConfId").val("0");
        //$(".InputclearIsSSL").attr('checked', false);
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
                    "Twilio",
                    "TextLocal",
                    "SmsBuddy"
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
                             </div >`);
            $(`#All_IntreationConfig_bodyflex`).append($html);
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
        if (type === "PGSQL") {
            html.push('<img class="img-responsive" src="../images/postgres.png" align="middle" style="height:50px" />');
        } else if (type === "MYSQL") {
            html.push('<img class="img-responsive" src="../images/mysql.png" align="middle" style="height: 50px;" />');
        } else if (type === "ORACLE") {
            html.push('<img class="img-responsive" src="../images/oracle.png" style="height: 50px;" />');
        } else if (type === "MSSQL") {
            html.push('<img class="img-responsive" src="../images/sqlserver.png" style="height: 50px;" />');
        } else if (type === "MongoDB") {
            html.push('<img class="img-responsive" src="../images/mongodb.png" style="height: 50px;" />');
        } else if (type === "Cloudinary") {
            html.push('<img class="img-responsive" src="../images/cloudnary.png" style="height: 25px;" />');
        } else if (type === "SMTP") {
            html.push('<img class="img-responsive" src="../images/svg/email.svg" style="height:50px" />');
        } else if (type === "Twilio") {
            html.push('<img class="img-responsive" src="../images/twilio.png" style="height: 50px;" />');
        } else if (type === "ExpertTexting") {
            html.push('<img class="img-responsive" src="../images/expert_exting.png" style="height: 35px;" />');
        } else if (type === "TextLocal") {
            html.push('<img class="img-responsive" src="../images/textlocal_logo.png" style="height: 35px;" />');
        } else if (type === "SmsBuddy") {
            html.push('<img class="img-responsive" src="../images/smsbuddy.png" style="height: 35px;" />');
        }
        return html.join("");
    };

    this.AllEditorOpen = function (e) {
        let temp = e;
        let which = $(temp.currentTarget).attr("data-name");
        if (which === "PGSQL" || which === "MYSQL" || which === "MSSQL" || which === "ORACLE") {
            $('#dbConnectionEdit').modal('toggle');
        } else if (which === "MongoDb") {
            $('#filesDbConnectEdit').modal('toggle');
        } else if (which === "Cloudinary") {
            $('#cldnry_conEdit').modal('toggle');
        } else if (which === "SMTP") {
            $('#EmailconnectionEdit').modal('toggle');
        } else if (which === "Twilio") {
            $('#TwilioConnectionEdit').modal('toggle');
        } else if (which === "ExpertTexting") {
            $('#ExpertTextingConnectionEdit').modal('toggle');
        } else if (which === "TextLocal") {
            $('#TextLocalConnectionEdit').modal('toggle');
        } else if (which === "SmsBuddy") {
            $('#SmsBuddyConnectionEdit').modal('toggle');
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
                        if (key === "Edit") {
                            this.credientialBot(id, dt);
                        }
                        else if (key === "Delete") {
                            EbDialog("show",
                                {
                                    Message: "The " + conf_NN + " info will be permanently removed ",
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
                                        if (name === "Confirm")
                                            this.IntergrationConfigDelete(posData = { "Id": id });
                                    }.bind(this)
                                });
                        }
                        else {
                            var flag = 0;
                            $.each(temp, function (i) {
                                if (temp[i].ConfId === id) {
                                    flag = 1;
                                }
                            }.bind(this));
                            if (flag === 0) {
                                if (key === "MOBILECONFIG")
                                    postData = { "SolutionId": this.Sid, "Preference": "OTHER", "Id": 0, "Type": key, "ConfigId": id };
                                else postData = { "SolutionId": this.Sid, "Preference": "PRIMARY", "Id": 0, "Type": key, "ConfigId": id };
                                if (key === "EbDATA" && temp === undefined) {
                                    EbDialog("show",
                                        {
                                            Message: "Do you wanna deploy in " + conf_NN,
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
                                                if (name === "Confirm")
                                                    this.IntegrationSubmit(true);
                                                else {
                                                    this.IntegrationSubmit(false);
                                                }
                                            }.bind(this)
                                        });
                                }
                                else if (key === "SUPPORTINGDATA") {
                                    this.IntegrationSubmit(false);
                                }
                                else if (temp === undefined) {
                                    this.IntegrationSubmit(false);
                                }
                                else if (key === "SMS" || key === "SMTP") {
                                    if (temp.length === 1) {
                                        $.each(temp, function (i) {
                                            if (temp[i].Preference == 1) {
                                                postData.Preference = "FALLBACK";
                                            }
                                        }.bind(this));
                                        this.IntegrationSubmit();
                                    }
                                    else if (temp.length === 0) {
                                        this.IntegrationSubmit();
                                    }
                                    else {
                                        EbMessage("show", { Message: "Please delete existing account and try again", Background: "red" });
                                    }
                                }
                                else if (key === "EbFILES" || key === "MAPS" || key === "Chat") {
                                    $.each(temp, function (i) {
                                        if (temp[i].Preference == 1) {
                                            postData.Preference = "OTHER";
                                        }
                                    }.bind(this));
                                    this.IntegrationSubmit();
                                }
                                else if (key === "AUTHENTICATION") {
                                    postData.Preference = "MULTIPLE";
                                    this.IntegrationSubmit();
                                }
                                else if (key === "MobileConfig") {
                                    postData.Preference = "OTHER";
                                    this.IntegrationSubmit();
                                }
                                else if (key === "ERROR") {
                                    alert("reload the page")
                                }
                                else {
                                    EbMessage("show", { Message: "Please delete existing account then try again", Background: "red" });
                                }

                            } else {
                                EbMessage("show", { Message: "This " + conf_NN + " have been already used as " + key + ".", Background: "red" });
                            }
                        }

                    }.bind(this),
                    items: {}
                };

                if ($trigger.hasClass('PGSQLedit')) {
                    let id = $trigger[0].id;
                    let tem = this.Connections.Integrations["EbDATA"]
                    let flg = 0;
                    $.each(tem, function (i) {
                        if (tem[i].ConfId === id) {
                            flg = 1;
                        }
                    }.bind(this));
                    if (flg == 1) {
                        options.items.EbDATA = { name: "Configure as Data Store" },
                            options.items.EbFILES = { name: "Configure as File Store" },
                            options.items.Delete = { name: "Remove" },
                            options.items.Edit = { name: "Edit" };
                    }
                    else {
                        options.items.EbDATA = { name: "Configure as Data Store" },
                            options.items.EbFILES = { name: "Configure as File Store" },
                            options.items.SUPPORTINGDATA = { name: "Configure as supporting data Store" },
                            options.items.Delete = { name: "Remove" },
                            options.items.Edit = { name: "Edit" };
                    }

                }
                else if ($trigger.hasClass('MYSQLedit')) {
                    options.items.EbDATA = { name: "Configure as Data Store" },
                        options.items.EbFILES = { name: "Configure as File Store" },
                        options.items.SUPPORTINGDATA = { name: "Configure as supporting data Store" },
                        options.items.Delete = { name: "Remove" },
                        //options.items.EbLOGS = { name: "Set as EbLogs" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('MSSQLedit')) {
                    options.items.EbDATA = { name: "Configure as Data Store" },
                        options.items.EbFILES = { name: "Configure as File Store" },
                        options.items.SUPPORTINGDATA = { name: "Configure as supporting data Store" },
                        options.items.Delete = { name: "Remove" },
                        //options.items.EbLOGS = { name: "Set as EbLogs" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('ORACLEedit')) {
                    options.items.EbDATA = { name: "Configure as Data Store" },
                        options.items.EbFILES = { name: "Configure as File Store" },
                        options.items.SUPPORTINGDATA = { name: "Configure as supporting data Store" },
                        options.items.Delete = { name: "Remove" },
                        //options.items.EbLOGS = { name: "Set as EbLogs" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('MongoDBedit')) {
                    options.items.EbDATA = { name: "Configure as Data Store" },
                        options.items.EbFILES = { name: "Configure as File Store" },
                        options.items.SUPPORTINGDATA = { name: "Configure as supporting data Store" },
                        options.items.Delete = { name: "Remove" },
                        //options.items.EbLOGS = { name: "Set as EbLogs" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('Twilioedit')) {
                    options.items.SMS = { name: "Set as SMS" },
                        options.items.Delete = { name: "Remove" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('Unifonicedit')) {
                    options.items.SMS = { name: "Set as SMS" },
                        options.items.Delete = { name: "Remove" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('ExpertTextingedit')) {
                    options.items.SMS = { name: "Set as SMS" },
                        options.items.Delete = { name: "Remove" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('TextLocaledit')) {
                    options.items.SMS = { name: "Set as SMS" },
                        options.items.Delete = { name: "Remove" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('SmsBuddyedit')) {
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
                else if ($trigger.hasClass('GoogleMapedit')) {
                    options.items.MAPS = { name: "Set as Map" },
                        options.items.Delete = { name: "Remove" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('SendGridedit')) {
                    options.items.SMTP = { name: "Set as Email" },
                        options.items.Delete = { name: "Remove" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('GoogleDriveedit')) {
                    options.items.EbFILES = { name: "Configure as File Store" },
                        options.items.Delete = { name: "Remove" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('DropBoxedit')) {
                    options.items.EbFILES = { name: "Configure as File Store" },
                        options.items.Delete = { name: "Remove" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('AWSS3edit')) {
                    options.items.EbFILES = { name: "Configure as File Store" },
                        options.items.Delete = { name: "Remove" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('Slackedit')) {
                    options.items.Chat = { name: "Configure as Chat" },
                        options.items.Delete = { name: "Remove" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('Facebookedit')) {
                    options.items.AUTHENTICATION = { name: "Configure as AUTHENTICATION" },
                        options.items.Delete = { name: "Remove" },
                        options.items.Edit = { name: "Edit" };
                }
                else if ($trigger.hasClass('MobileConfigedit')) {
                    if (this.Connections.Integrations.MOBILECONFIG != undefined && this.Connections.Integrations.MOBILECONFIG.length >= 1) {
                        options.items.Delete = { name: "Remove" },
                            options.items.Edit = { name: "Edit" };
                    }
                    else {
                        options.items.MOBILECONFIG = { name: "Configure" },
                            options.items.Delete = { name: "Remove" },
                            options.items.Edit = { name: "Edit" };
                    }
                }
                else {
                    options.items.ERROR = { name: "Refresh Page" }
                }
                if (preventContextMenu == 0)
                    return options;
            }.bind(this)
        });
        $('.context-menu-one').on('click', function (e) {
            console.log('clicked', this);
        });

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
                        if (key === "Remove") {
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
                                    if (name === "Confirm") {
                                        this.IntergrationDelete(posData = { "Id": id });
                                    }

                                }.bind(this)
                            });
                        }
                        else if (key === "PRIMARY") {
                            preferancetype = [];
                            for (var i = 0, n = temp.length; i < n; i++) {
                                if (temp[i].Preference == "2") {
                                    postData = { SolutionId: this.Sid, Preference: "PRIMARY", Id: id, Type: dt, ConfigId: confid };
                                }
                                else {
                                    postData = { SolutionId: this.Sid, Preference: "FALLBACK", Id: temp[i].Id, Type: dt, ConfigId: temp[i].ConfId };
                                }
                                preferancetype.push(postData);
                            }
                            this.PreferencesChange();
                        }
                        else if (key === "FALLBACK") {
                            preferancetype = [];
                            for (let i = 0, n = temp.length; i < n; i++) {
                                if (temp[i].Preference == "1") {
                                    postData = { SolutionId: this.Sid, Preference: "FALLBACK", Id: id, Type: dt, ConfigId: confid };
                                }
                                else {
                                    postData = { SolutionId: this.Sid, Preference: "PRIMARY", Id: temp[i].Id, Type: dt, ConfigId: temp[i].ConfId };
                                }
                                preferancetype.push(postData);
                            }
                            this.PreferencesChange();
                        }
                        else if (key === "RemoveDefault") {
                            preferancetype = [];
                            for (let i = 0, n = temp.length; i < n; i++) {
                                if (temp[i].Id == id) {
                                    postData = { SolutionId: this.Sid, Preference: "PRIMARY", Id: id, Type: dt, ConfigId: temp[i].ConfId };
                                }
                                else if (temp[i].Preference == "1") {
                                    postData = { SolutionId: this.Sid, Preference: "OTHER", Id: temp[i].Id, Type: dt, ConfigId: temp[i].ConfId };
                                }
                                preferancetype.push(postData);
                            }
                            this.PreferencesChange();
                        }
                        else if (key === "RemoveP") {
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
                                    if (name === "Confirm") {
                                        for (var i = 0, n = temp.length; i < n; i++) {
                                            if (temp[i].Preference === "2" || temp[i].Preference === "3") {
                                                postData = { SolutionId: this.Sid, Preference: "PRIMARY", Id: temp[i].Id, Type: dt, ConfigId: temp[i].ConfId };
                                            }
                                            else {
                                                postData = {};
                                                Deleteid = id;
                                            }
                                        }
                                        this.PrimaryChange();
                                    }
                                }.bind(this)
                            });
                        }
                        else if (key == 'ERROR') {
                            location.reload();
                        }
                    }.bind(this),
                    items: {}
                };

                if ($trigger.hasClass('EbDATAedit')) {
                    options.items.Remove = { name: "Unset" };

                } else if ($trigger.hasClass('EbFILESedit 3')) {
                    options.items.Remove = { name: "Unset" },
                        options.items.RemoveDefault = { name: "Set as Default" };

                } else if ($trigger.hasClass('EbFILESedit 1')) {
                    options.items.RemoveP = { name: "Unset" },
                        options.items.FALLBACK = {
                            name: "Set as FALLBACK", disabled: function (key, opt) {
                                // this references the trigger element
                                return !this.data('cutDisabled');
                            }
                        };
                } else if ($trigger.hasClass('Chatedit 3')) {
                    options.items.Remove = { name: "Unset" },
                        options.items.RemoveDefault = { name: "Set as Default" };

                } else if ($trigger.hasClass('Chatedit 1')) {
                    options.items.RemoveP = { name: "Unset" },
                        options.items.FALLBACK = {
                            name: "Set as FALLBACK", disabled: function (key, opt) {
                                // this references the trigger element
                                return !this.data('cutDisabled');
                            }
                        };

                } else if ($trigger.hasClass('SMTPedit 1')) {
                    if (this.Connections.Integrations.SMTP.length > 1) {
                        options.items.RemoveP = { name: "Unset" },
                            options.items.FALLBACK = { name: "Set as FALLBACK" };
                    }
                    else {
                        options.items.RemoveP = { name: "Unset" }
                    }

                } else if ($trigger.hasClass('SMTPedit 2')) {
                    options.items.Remove = { name: "Unset" },
                        options.items.PRIMARY = { name: "Set as PRIMARY" };

                } else if ($trigger.hasClass('Cloudinaryedit')) {
                    options.items.Remove = { name: "Unset" };

                } else if ($trigger.hasClass('Cloudinaryedit')) {
                    options.items.Remove = { name: "Unset" };

                } else if ($trigger.hasClass('SMSedit 1')) {
                    options.items.RemoveP = { name: "Unset" },
                        options.items.FALLBACK = { name: "Set as FALLBACK" };

                } else if ($trigger.hasClass('SMSedit 2')) {
                    options.items.Remove = { name: "Unset" },
                        options.items.PRIMARY = { name: "Set as PRIMARY" };
                } else if ($trigger.hasClass('MAPSedit 3')) {
                    options.items.Remove = { name: "Unset" },
                        options.items.RemoveDefault = { name: "Set as Default" };

                } else if ($trigger.hasClass('MAPSedit 1')) {
                    options.items.RemoveP = { name: "Unset" },
                        options.items.FALLBACK = {
                            name: "Set as FALLBACK", disabled: function (key, opt) {
                                // this references the trigger element
                                return !this.data('cutDisabled');
                            }
                        };

                } else if ($trigger.hasClass('AUTHENTICATIONedit 1')) {
                    options.items.Remove = { name: "Unset" };
                }
                else if ($trigger.hasClass('MOBILECONFIGedit')) {
                    options.items.Remove = { name: "Unset" };
                }
                else if ($trigger.hasClass('SUPPORTINGDATAedit')) {
                    options.items.Remove = { name: "Unset" };
                }
                else {
                    options.items.ERROR = { name: "Refresh Page" };
                }
                if (preventContextMenu === 0)
                    return options;
            }.bind(this)
        });
        $('.context-menu-one').on('click', function (e) {
            console.log('clicked', this);
        });
    };

    this.integration_EbData_all = function () {
        let html = [];
        var count = 0;
        Integrations = this.Connections.Integrations["EbDATA"];
        $("#EbDATA-All").empty();
        $.each(Integrations, function (i, rows) {
            html.push(`<div class="integrationContainer ${rows.Type.concat("edit")}" conf_NN="${rows.NickName}" data-whatever="${rows.Type}" id="${rows.Id}">
                                <div class="integrationContainer_Image">
                                    ${Imageurl[rows.Ctype]}
                                </div>
                                <div id="nm" class="integrationContainer_NN data-toggle="tooltip" data-placement="top" title="NickName: ${rows.NickName} \nUpdated on: ${rows.CreatedOn}">
                                    <span>${rows.NickName}</span>
                                </div>
                                <div id="nm" class="integrationContainer_caret-down">
                                    <i class="fa fa-caret-down" aria-hidden="true"></i>
                                </div>
                            </div>`);
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
                            <div id="nm" class="integrationContainer_NN" data-toggle="tooltip" data-placement="top" title="NickName: ${rows.NickName} \nUpdated on: ${rows.CreatedOn}">
                                <span>${rows.NickName}</span>
                            `);
            if (rows.Preference == "1") {
                html.push(`<span  class="PF_span">PRIMARY</span>`);
            }
            html.push(`</div>
                                    <div id="nm" class="inteConfContainer_caret-down ">
                                        <i class="fa fa-caret-down" aria-hidden="true"></i>
                                    </div>
                          </div>`);
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
                            <div id="nm" class="integrationContainer_NN" data-toggle="tooltip" data-placement="top" title="NickName: ${rows.NickName} \nUpdated on: ${rows.CreatedOn}">
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
                          </div>`);
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
                            <div id="nm" class="integrationContainer_NN" data-toggle="tooltip" data-placement="top" title="NickName: ${rows.NickName} \nUpdated on: ${rows.CreatedOn}">
                                <span>${rows.NickName}</span>
                                <span  class="PF_span">PRIMARY</span>
                            </div>
                            <div id="nm" class="inteConfContainer_caret-down ">
                                <i class="fa fa-caret-down" aria-hidden="true"></i>
                            </div>
                        </div>`);
            count += 1;
        }.bind(this));
        $('#Cloudinary-all').empty().append(html.join(''));
        $('#Integration_cloudinary').empty().append("Image Processing (" + count + ")");
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
                            <div id="nm" class="integrationContainer_NN" data-toggle="tooltip" data-placement="top" title="NickName: ${rows.NickName} \nUpdated on: ${rows.CreatedOn}">
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
                        </div>`);
            count += 1;
        }.bind(this));
        $('#SMS-all').empty().append(html.join(''));
        $('#Integration_sms').empty().append("Message (" + count + ")");
    }.bind(this);

    this.integration_Map_all = function () {
        let html = [];
        var count = 0;
        Integrations = this.Connections.Integrations["MAPS"];
        $.each(Integrations, function (i, rows) {
            //$.each(rows, function (j, rowss) {
            html.push(`<div class="integrationContainer hover-mover ${rows.Type.concat("edit")} ${rows.Preference}" conf_NN="${rows.NickName}" data-whatever="${rows.Type}" id="${rows.Id}" dataConffId="${rows.ConfId}">
                            <div class="integrationContainer_Image">
                                 ${Imageurl[rows.Ctype]}
                            </div>
                            <div id="nm" class="integrationContainer_NN" data-toggle="tooltip" data-placement="top" title="NickName: ${rows.NickName} \nUpdated on: ${rows.CreatedOn}">
                                <span>${rows.NickName}</span>
                                `);
            if (rows.Preference == "1") {
                html.push(`<span  class="PF_span">PRIMARY</span>`);
            }

            html.push(`
                            </div>
                            <div id="nm" class="inteConfContainer_caret-down ">
                                <i class="fa fa-caret-down" aria-hidden="true"></i>
                            </div>
                        </div>`);
            count += 1;
        }.bind(this));
        $('#MAP-all').empty().append(html.join(''));
        $('#Integration_map').empty().append("Google Maps (" + count + ")");
    }.bind(this);

    this.integration_IChat_all = function () {
        let html = [];
        var count = 0;
        Integrations = this.Connections.Integrations["Chat"];
        $.each(Integrations, function (i, rows) {
            //$.each(rows, function (j, rowss) {
            html.push(`<div class="integrationContainer hover-mover ${rows.Type.concat("edit")} ${rows.Preference}" conf_NN="${rows.NickName}" data-whatever="${rows.Type}" id="${rows.Id}" dataConffId="${rows.ConfId}">
                            <div class="integrationContainer_Image">
                                 ${Imageurl[rows.Ctype]}
                            </div>
                            <div id="nm" class="integrationContainer_NN" data-toggle="tooltip" data-placement="top" title="NickName: ${rows.NickName} \nUpdated on: ${rows.CreatedOn}">
                                <span>${rows.NickName}</span>
                                `);
            if (rows.Preference == "1") {
                html.push(`<span  class="PF_span">PRIMARY</span>`);
            }

            html.push(`
                            </div>
                            <div id="nm" class="inteConfContainer_caret-down ">
                                <i class="fa fa-caret-down" aria-hidden="true"></i>
                            </div>
                        </div>`);
            count += 1;
        }.bind(this));
        $('#ICHAT-all').empty().append(html.join(''));
        $('#Integration_ICHAT').empty().append("Chat (" + count + ")");
    }.bind(this);

    this.integration_AUTHENTICATION_all = function () {
        let html = [];
        var count = 0;
        Integrations = this.Connections.Integrations["AUTHENTICATION"];
        $.each(Integrations, function (i, rows) {
            //$.each(rows, function (j, rowss) {
            html.push(`<div class="integrationContainer hover-mover ${rows.Type.concat("edit")} ${rows.Preference}" conf_NN="${rows.NickName}" data-whatever="${rows.Type}" id="${rows.Id}" dataConffId="${rows.ConfId}">
                            <div class="integrationContainer_Image">
                                 ${Imageurl[rows.Ctype]}
                            </div>
                            <div id="nm" class="integrationContainer_NN" data-toggle="tooltip" data-placement="top" title="NickName: ${rows.NickName} \nUpdated on: ${rows.CreatedOn}">
                                <span>${rows.NickName}</span>
                                `);
            if (rows.Preference == "1") {
                html.push(`<span  class="PF_span">PRIMARY</span>`);
            }

            html.push(`
                            </div>
                            <div id="nm" class="inteConfContainer_caret-down ">
                                <i class="fa fa-caret-down" aria-hidden="true"></i>
                            </div>
                        </div>`);
            count += 1;
        }.bind(this));
        $('#AUTHENTICATION-all').empty().append(html.join(''));
        $('#Integration_AUTHENTICATION').empty().append("AUTHENTICATION (" + count + ")");
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
                                <div id="nm" class="inteConfContainer_NN" data-toggle="tooltip" data-placement="top" title="NickName: ${rowss.NickName} \nUpdated on: ${rowss.CreatedOn}">
                                    <span>${rowss.NickName}</span>
                                </div>
                                <div id="nm" class="inteConfContainer_caret-down ">
                                    <i class="fa fa-caret-down" aria-hidden="true"></i>
                                </div>
                             </div > `);
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
        this.integration_IChat_all();
        this.integration_AUTHENTICATION_all();
        this.integration_MobileConf_all();
        this.integration_SUPPORTINGDATA_all();
    }.bind(this);

    this.db_modal_show_append = function (DatabaseName) {
        this.AllInputClear();
        $(".IntConfId").val("0");
        $("#dbvendorInput").val(DatabaseName);
        $("#dbConnectionheader").text(DatabaseName + " DataBase Connection");
        $("#vender-data-holder").empty().append(venderdec[DatabaseName]);
    };


    this.SMTPautoFill = function (e) {
        var target = e.target.options.selectedIndex;
        if (target === 0) {
            $('#EmailInputSMTP').val("smtp.gmail.com");
        } else if (target === 1) {
            $('#EmailInputSMTP').val("smtp.mail.yahoo.com");
        }
        $('#EmailInputPort').val("587");
    }.bind(this);

    this.integration_SUPPORTINGDATA_all = function () {
        let html = [];
        var count = 0;
        Integrations = this.Connections.Integrations["SUPPORTINGDATA"];
        $("#SUPPORTINGDATA-All").empty();
        $.each(Integrations, function (i, rows) {
            html.push(`<div class="integrationContainer ${rows.Type.concat("edit")}" conf_NN="${rows.NickName}" data-whatever="${rows.Type}" id="${rows.Id}">
                                <div class="integrationContainer_Image">
                                    ${Imageurl[rows.Ctype]}
                                </div>
                                <div id="nm" class="integrationContainer_NN data-toggle="tooltip" data-placement="top" title="NickName: ${rows.NickName} \nUpdated on: ${rows.CreatedOn}">
                                    <span>${rows.NickName}</span>
                                </div>
                                <div id="nm" class="integrationContainer_caret-down">
                                    <i class="fa fa-caret-down" aria-hidden="true"></i>
                                </div>
                            </div>`);
            html.join("");
            count += 1;
        }.bind(this));
        $('#SUPPORTINGDATA-All').append(html);
        $('#Supporting_Data_Head').empty().append(" Supporting Data Store (" + count + ")");
    }.bind(this);

    this.integration_MobileConf_all = function () {
        let html = [];
        var count = 0;
        Integrations = this.Connections.Integrations["MOBILECONFIG"];
        $("#MOBILECONFIG-all").empty();
        $.each(Integrations, function (i, rows) {
            html.push(`<div class="integrationContainer ${rows.Type.concat("edit")}" conf_NN="${rows.NickName}" data-whatever="${rows.Type}" id="${rows.Id}">
                                <div class="integrationContainer_Image">
                                    ${Imageurl[rows.Ctype]}
                                </div>
                                <div id="nm" class="integrationContainer_NN data-toggle="tooltip" data-placement="top" title="NickName: ${rows.NickName} \nUpdated on: ${rows.CreatedOn}">
                                    <span>${rows.NickName}</span>
                                </div>
                                <div id="nm" class="integrationContainer_caret-down">
                                    <i class="fa fa-caret-down" aria-hidden="true"></i>
                                </div>
                            </div>`);
            html.join("");
            count += 1;
        }.bind(this));
        $('#MOBILECONFIG-all').append(html);
        $('#MOBILECONFIG').empty().append(" Mobile Connections (" + count + ")");
    }.bind(this);

    this.VersioningSwitch = function (e) {
        postData = e.target.checked;
        SolutionId = this.Sid;
        if (this.Connections.SolutionInfo.IsVersioningEnabled) {
            if (!$('#VersioningSwitch').is(':checked')) {
                $("#VersioningSwitch").bootstrapToggle('on');
                EbDialog("show",
                    {
                        Message: "The Versioning cannot be turend off once its on !!!!",
                        Buttons: {
                            "Cancel": {
                                Background: "red",
                                Align: "left",
                                FontColor: "white;"
                            }
                        }
                    });
            }
        }
        else {
            EbDialog("show",
                {
                    Message: "The Versioning will be turend on permently !!!! ",
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
                        if (name === "Confirm") {
                            $.ajax({
                                type: 'POST',
                                url: "../Tenant/VersioningSwitch",
                                data: { data: postData, SolnId: SolutionId }
                                //beforeSend: function () {
                                //    $("#dbConnection_loder").EbLoader("show", { maskItem: { Id: "#dbConnection_mask", Style: { "left": "0" } } });
                                //}
                            }).done(function (data) {
                                //$("#Integration_loder").EbLoader("hide");
                                if (data) {
                                    this.Connections.SolutionInfo.IsVersioningEnabled = 'True';
                                    EbMessage("show", { Message: "Versioning : On" });
                                }

                            }.bind(this));

                        }
                        else if (name === "Cancel" || name === "close") {
                            $("#VersioningSwitch").bootstrapToggle('off');
                        }
                    }
                });
        }
    };

    this.TwoFASwitch = function (e) {
        var postData = e.target.checked;
        let msg = "Are you sure you want to turn ON Two Factor Authentication?";
        SolutionId = this.Sid;


        if (this.Connections.SolutionInfo.Is2faEnabled) {
            msg = "Are you sure you want to turn OFF Two Factor Authentication?";
        }
        else if ($('div.checkbox-group :checkbox:checked').length < 1) {
            if (postData)
                $("#2faSwitch").bootstrapToggle('off');
            EbMessage("show", {
                Message: "Please select OTP delivery method", Background: "red"
            });
            return;
        }
        EbDialog("show",
            {
                Message: msg,
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
                    if (name === "Confirm") {
                        let _2fadeliveryMethod = [];
                        if ($("input[id='emailcheckbox']:checked").length === 1)
                            _2fadeliveryMethod.push("email");
                        if ($("input[id='smscheckbox']:checked").length === 1)
                            _2fadeliveryMethod.push("sms");

                        $.ajax({
                            type: 'POST',
                            url: "../Tenant/Switch2FA",
                            data: { data: postData, SolnId: SolutionId, deliveryMethod: _2fadeliveryMethod.toString() }

                        }).done(function (data) {
                            let _data = JSON.parse(data);
                            if (_data.res) {
                                this.Connections.SolutionInfo.Is2faEnabled = postData;
                                if (postData) {
                                    EbMessage("show", { Message: "Two factor authentication turned ON" });
                                    $("#emailcheckbox").prop("disabled", true);
                                    $("#smscheckbox").prop("disabled", true);
                                }
                                else {
                                    EbMessage("show", { Message: "Two factor authentication turned OFF" });
                                    if (this.Connections.IsEmailIntegrated) {
                                        $("#emailcheckbox").prop("disabled", false);
                                    }
                                    if (this.Connections.IsSmsIntegrated) {
                                        $("#smscheckbox").prop("disabled", false);
                                    }
                                }
                            } else {//error case
                                //if (postData)
                                //    $("#2faSwitch").bootstrapToggle('off');
                                //else
                                //    $("#2faSwitch").bootstrapToggle('on');
                                EbMessage("show", {
                                    Message: "Something went wrong. Please try again", Background: "red"
                                });
                            }
                        }.bind(this));
                    }
                    else if (name === "Cancel" || name === "close") {
                        $("#2faSwitch").bootstrapToggle('off');
                    }
                }.bind(this)
            });
    };

    this.OtpSigninSwitch = function (e) {
        var postData = e.target.checked;
        let msg = "Are you sure you want to turn ON Otp Sign-in?";
        SolutionId = this.Sid;


        if (this.Connections.SolutionInfo.Is2faEnabled) {
            msg = "Are you sure you want to turn OFF Otp Sign-in?";
        }
        else if ($('div.checkbox-group :checkbox:checked').length < 1) {
            if (postData)
                $("#otpsigninswitch").bootstrapToggle('off');
            EbMessage("show", {
                Message: "Please select OTP delivery method", Background: "red"
            });
            return;
        }
        EbDialog("show",
            {
                Message: msg,
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
                    if (name === "Confirm") {
                        let _deliveryMethod = [];
                        if ($("input[id='emailcheckbox_signin']:checked").length === 1)
                            _deliveryMethod.push("email");
                        if ($("input[id='smscheckbox_signin']:checked").length === 1)
                            _deliveryMethod.push("sms");

                        $.ajax({
                            type: 'POST',
                            url: "../Tenant/SwitchOtpSignin",
                            data: { data: postData, SolnId: SolutionId, deliveryMethod: _deliveryMethod.toString() }

                        }).done(function (data) {
                            let _data = JSON.parse(data);
                            if (_data.res) {
                                this.Connections.SolutionInfo.Is2faEnabled = postData;
                                if (postData) {
                                    EbMessage("show", { Message: "Otp Sign-in turned ON" });
                                    $("#emailcheckbox_signin").prop("disabled", true);
                                    $("#smscheckbox_signin").prop("disabled", true);
                                }
                                else {
                                    EbMessage("show", { Message: "Otp Sign-in turned OFF" });
                                    if (this.Connections.IsEmailIntegrated) {
                                        $("#emailcheckbox_signin").prop("disabled", false);
                                    }
                                    if (this.Connections.IsSmsIntegrated) {
                                        $("#smscheckbox_signin").prop("disabled", false);
                                    }
                                }
                            } else {//error case
                                //if (postData)
                                //    $("#2faSwitch").bootstrapToggle('off');
                                //else
                                //    $("#2faSwitch").bootstrapToggle('on');
                                EbMessage("show", {
                                    Message: "Something went wrong. Please try again", Background: "red"
                                });
                            }
                        }.bind(this));
                    }
                    else if (name === "Cancel" || name === "close") {
                        $("#otpsigninswitch").bootstrapToggle('off');
                    }
                }.bind(this)
            });
    };

    this.DeleteSolution = function () {
        SolutionId = this.Sid;
        EbDialog("show",
            {
                Message: "Enter External Solution Id to confirm permanant deletion of the solution '" + sname + "'",
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
                IsPrompt: true,
                CallBack: function (name, prompt) {
                    if (name === "Confirm") {
                        if (prompt === esid) {
                            $.ajax({
                                type: 'POST',
                                url: "../Tenant/DeleteSolution",
                                data: { SolnId: SolutionId, EsolnId: esid, prompt_esid: prompt }
                            }).done(function (data) {
                                if (data) {
                                    window.location.href = '../';
                                    EbMessage("show", { Message: "Permanantly deleted" });
                                }
                                else {
                                    EbMessage("show", { Message: "Something went wrong.", Background: "red" });
                                }
                            }.bind(this));
                        }
                        else {
                            EbMessage("show", { Message: "External Solution Id doesn't match.", Background: "red" });
                        }
                    }
                }
            });
    };

    this.CleanupSolution = function () {
        SolutionId = this.Sid;
        EbDialog("show",
            {
                Message: "Enter Internal Solution Id to confirm data cleanup of solution '" + sname + "'",
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
                IsPrompt: true,
                CallBack: function (name, prompt) {
                    if (name === "Confirm") {
                        if (prompt === SolutionId) {
                            $.ajax({
                                type: 'POST',
                                url: "../Tenant/CleanupSolution",
                                data: { SolnId: SolutionId, prompt_isid: prompt }
                            }).done(function (data) {
                                if (data) {
                                    window.location.href = '../';
                                    EbMessage("show", { Message: "Cleanup completed" });
                                }
                                else {
                                    EbMessage("show", { Message: "Something went wrong.", Background: "red" });
                                }
                            }.bind(this));
                        }
                        else {
                            EbMessage("show", { Message: "Internal Solution Id doesn't match.", Background: "red" });
                        }
                    }
                }
            });
    };

    this.init = function () {
        //Versioning
        if (this.versioning === 'True') {
            $("#VersioningSwitch").bootstrapToggle('on');
        }

        //2FA
        if (this.Connections.SolutionInfo.Is2faEnabled) {
            $("#2faSwitch").bootstrapToggle('on');
            if (this.Connections.SolutionInfo.OtpDelivery2fa !== undefined) {
                let p = this.Connections.SolutionInfo.OtpDelivery2fa.split(",");
                for (i = 0; i < p.length; i++) {
                    if (p[i] === "email") {
                        $("#emailcheckbox").prop("checked", true);
                    }
                    else if (p[i] === "sms") {
                        $("#smscheckbox").prop("checked", true);
                    }
                }
            }
            $("#emailcheckbox").prop("disabled", true);
            $("#smscheckbox").prop("disabled", true);
        }
        else {
            if (!this.Connections.IsEmailIntegrated) {
                $("#emailcheckbox").prop("disabled", true);
            }
            if (!this.Connections.IsSmsIntegrated) {
                $("#smscheckbox").prop("disabled", true);
            }
        }

        // OTP sign-in
        if (this.Connections.SolutionInfo.IsOtpSigninEnabled) {
            $("#otpsigninswitch").bootstrapToggle('on');
            if (this.Connections.SolutionInfo.OtpDeliverySignin !== undefined) {
                let p = this.Connections.SolutionInfo.OtpDeliverySignin.split(",");
                for (i = 0; i < p.length; i++) {
                    if (p[i] === "email") {
                        $("#emailcheckbox_signin").prop("checked", true);
                    }
                    else if (p[i] === "sms") {
                        $("#smscheckbox_signin").prop("checked", true);
                    }
                }
            }

            $("#emailcheckbox_signin").prop("disabled", true);
            $("#smscheckbox_signin").prop("disabled", true);
        }
        else {
            if (!this.Connections.IsEmailIntegrated) {
                $("#emailcheckbox_signin").prop("disabled", true);
            }
            if (!this.Connections.IsSmsIntegrated) {
                $("#smscheckbox_signin").prop("disabled", true);
            }
        }
        $("#InputEmailvendor").change(this.SMTPautoFill.bind(this));
        $("#VersioningSwitch").change(this.VersioningSwitch.bind(this));
        $("#2faSwitch").change(this.TwoFASwitch.bind(this));
        $("#otpsigninswitch").change(this.OtpSigninSwitch.bind(this));
        $("#del-soln-outer").on("click", this.DeleteSolution.bind(this));
        $("#clean-soln-outer").on("click", this.CleanupSolution.bind(this));
        $("#GoogleDriveInputJSONUpload").change(this.getgoogledrivefile.bind(this));
        $("#IntegrationSubmit").on("submit", this.IntegrationSubmit.bind(this));
        $("#dbConnectionSubmit").on("submit", this.dbconnectionsubmit.bind(this));
        $("#filesDbConnectionSubmit").on("submit", this.FilesDbSubmit.bind(this));
        $("#emailConnectionSubmit").on("submit", this.emailConnectionSubmit.bind(this));
        $("#TwilioConnectionSubmit").on("submit", this.twilioAccountSubmit.bind(this));
        $("#UnifonicConnectionSubmit").on("submit", this.UnifonicAccountSubmit.bind(this));
        $("#ExpertConnectionSubmit").on("submit", this.expertAccountSubmit.bind(this));
        $("#TextLocalConnectionSubmit").on("submit", this.textLocalAccountSubmit.bind(this));
        $("#SmsBuddyConnectionSubmit").on("submit", this.smsBuddyAccountSubmit.bind(this));
        $("#CloudnaryConnectionSubmit").on("submit", this.CloudnaryConSubmit.bind(this));
        $("#FtpConnectionSubmit").on("submit", this.ftpOnSubmit.bind(this));
        $("#MapsConnectionSubmit").on("submit", this.mapOnSubmit.bind(this));
        //$("#OSMConnectionSubmit").on("submit", this.OSMOnSubmit.bind(this));
        $("#MobileConfigSubmit").on("submit", this.MobileConfigConnectionSubmit.bind(this));
        $("#GoogleDriveConnectionSubmit").on("submit", this.GoogleDriveOnSubmit.bind(this));
        $("#SendGridConnectionSubmit").on("submit", this.SendGridOnSubmit.bind(this));
        $("#DropBoxConnectionSubmit").on("submit", this.DropBoxOnSubmit.bind(this));
        $("#AWSS3ConnectionSubmit").on("submit", this.AWSS3OnSubmit.bind(this));
        $("#SlackConnectionSubmit").on("submit", this.SlackOnSubmit.bind(this));
        $("#facebookConnectionSubmit").on("submit", this.facebookOnSubmit.bind(this));
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
        $('.db-type-set').on("click", function (e) {
            var DatabaseName = $(e.currentTarget).attr("data-whatever");
            this.db_modal_show_append(DatabaseName);
        }.bind(this));
        $('.input-clear ').on('show.bs.modal', function (event) {
            this.AllInputClear();
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
        this.integration_IChat_all();
        this.integration_AUTHENTICATION_all();
        this.integration_MobileConf_all();
        this.integration_SUPPORTINGDATA_all();


        $(".Inter_modal_list").on("click", this.ShowIntreationModalList.bind(this));
        //$("#IntegrationsCall").trigger("click");
        //$("#MyIntegration").trigger("click");
        //$(".inteConfContainer").on("click", this.AllInputClear.bind(this));
    };

    this.init();

};