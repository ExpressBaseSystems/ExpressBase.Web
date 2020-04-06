﻿//import { Array, Object } from "core-js/library/web/timers";

var Eb_chatBot = function (_solid, _appid, settings, ssurl, _serverEventUrl) {
    this.EXPRESSbase_SOLUTION_ID = _solid;
    this.EXPRESSbase_APP_ID = _appid;
    this.ebbotThemeColor = settings.ThemeColor || "#055c9b";
    this.welcomeMessage = settings.WelcomeMessage || "Hi, I am EBbot from EXPRESSbase!";
    this.ServerEventUrl = _serverEventUrl;
    this.botdpURL = 'url(' + window.atob(settings.DpUrl || window.btoa('../images/businessmantest.png')) + ')center center no-repeat';
    this.$chatCont = $(`<div class="eb-chat-cont" eb-form='true'  eb-root-obj-container isrendermode='true'></div>`);
    this.$chatBox = $('<div class="eb-chatBox"></div>');
    this.$inputCont = $('<div class="eb-chat-inp-cont"><input type="text" class="msg-inp"/><button class="btn btn-info msg-send"><i class="fa fa-paper-plane" aria-hidden="true"></i></button></div>');
    this.$poweredby = $('<div class="poweredby-cont"><div class="poweredby"><i>powered by</i> EXPRESSbase</div></div>');
    this.$msgCont = $('<div class="msg-cont"></div>');
    this.$botMsgBox = this.$msgCont.clone().wrapInner($('<div class="msg-cont-bot"><div class="msg-wraper-bot"></div></div>'));
    this.$botMsgBox.prepend('<div class="bot-icon"></div>');
    this.$userMsgBox = this.$msgCont.clone().wrapInner($('<div class="msg-cont-user"><div class="msg-wraper-user"></div></div>'));
    this.$userMsgBox.append('<div class="bot-icon-user"></div>');
    this.ready = true;
    this.isAlreadylogined = true;
    this.bearerToken = null;
    this.refreshToken = null;
    this.initControls = new InitControls({
        botBuilder: this,
        wc: "bc"
    });
    this.typeDelay = 200;
    this.ChartCounter = 0;
    this.formsList = {};
    this.formsDict = {};
    this.formNames = [];
    this.formIcons = [];
    this.curForm = {};
    this.formControls = [];
    this.formValues = {};
    this.formValuesWithType = {};
    this.formFunctions = {};
    this.formFunctions.visibleIfs = {};
    this.formFunctions.valueExpressions = {};
    this.nxtCtrlIdx = 0;
    this.IsDpndgCtrEdt = false;
    this.FB = null;
    this.FBResponse = {};
    this.userDtls = {};
    this.ssurl = ssurl;
    this.userLoc = {};

    this.init = function () {
        $("body").append(this.$chatCont);
        this.$chatCont.append(this.$chatBox);
        this.$chatCont.append(this.$inputCont);
        this.$chatCont.append(this.$poweredby);
        this.$TypeAnim = $(`<div><svg class="lds-typing" width="30px" height="30px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                    <circle cx="27.5" cy="40.9532" r="5" fill="#999">
                        <animate attributeName="cy" calcMode="spline" keySplines="0 0.5 0.5 1;0.5 0 1 0.5;0.5 0.5 0.5 0.5" repeatCount="indefinite" values="62.5;37.5;62.5;62.5" keyTimes="0;0.25;0.5;1" dur="1s" begin="-0.5s"></animate>
                    </circle>
                    <circle cx="42.5" cy="56.4907" r="5" fill="#aaa">
                        <animate attributeName="cy" calcMode="spline" keySplines="0 0.5 0.5 1;0.5 0 1 0.5;0.5 0.5 0.5 0.5" repeatCount="indefinite" values="62.5;37.5;62.5;62.5" keyTimes="0;0.25;0.5;1" dur="1s" begin="-0.375s"></animate>
                    </circle>
                    <circle cx="57.5" cy="62.5" r="5" fill="#bbb">
                        <animate attributeName="cy" calcMode="spline" keySplines="0 0.5 0.5 1;0.5 0 1 0.5;0.5 0.5 0.5 0.5" repeatCount="indefinite" values="62.5;37.5;62.5;62.5" keyTimes="0;0.25;0.5;1" dur="1s" begin="-0.25s"></animate>
                    </circle>
                </svg><div>`);

        var html = document.getElementsByTagName('html')[0];
        html.style.setProperty("--botdpURL", this.botdpURL);
        //html.style.setProperty("--botThemeColor", this.ebbotThemeColor);

        var $botMsgBox = this.$botMsgBox.clone();
        $botMsgBox.find('.msg-wraper-bot').html(this.$TypeAnim.clone()).css("width", "82px");
        this.$TypeAnimMsg = $botMsgBox;

        $("body").on("click", ".eb-chat-inp-cont .msg-send", this.send_btn);
        $("body").on("click", ".msg-cont [name=ctrlsend]", this.ctrlSend);
        $("body").on("click", ".msg-cont [name=ctrledit]", this.ctrlEdit);
        $("body").on("click", ".eb-chatBox [name=formsubmit]", this.formSubmit);
        $("body").on("click", ".eb-chatBox [name=formcancel]", this.formCancel);
        $("body").on("click", ".eb-chatBox [name=formsubmit_fm]", this.formSubmit_fm);
        $("body").on("click", ".eb-chatBox [name=formcancel_fm]", this.formCancel_fm);
        $("body").on("click", "[name=contactSubmit]", this.contactSubmit);
        $("body").on("click", ".btn-box_botformlist [for=form-opt]", this.startFormInteraction);
        $("body").on("click", ".btn-box [for=continueAsFBUser]", this.continueAsFBUser);
        $("body").on("click", ".btn-box [for=fblogin]", this.FBlogin);
        $("body").on("click", ".cards-btn-cont .btn", this.ctrlSend);
        $("body").on("click", ".survey-final-btn .btn", this.ctrlSend);
        $('.msg-inp').on("keyup", this.txtboxKeyup);
        this.initConnectionCheck();
        this.showDate();
        this.showTypingAnim();
        //$('body').confirmation({
        //    selector: '.eb-chatBox'
        //});
    };


    //if anonimous user /not loggegin using fb
    this.contactSubmit = function (e) {
        let emailReg = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        let phoneReg = /^([+]{0,1})([0-9]{10,})$/;
        let email = $("#anon_mail").val().trim();
        let phone = $("#anon_phno").val().trim();
        if (!((emailReg.test(email) || email === "") && (phoneReg.test(phone) || phone === "") && email !== phone)) {
            EbMessage("show", { Message: "Please enter valid email/phone", AutoHide: true, Background: '#bf1e1e', Delay: 4000 });
            return;
        }
        this.msgFromBot("Thank you.");
        this.authenticateAnon(email, phone);
        $(e.target).closest('.msg-cont').remove();
    }.bind(this);

    //check user is valid / is user authenticated
    this.ajaxSetup4Future = function () {
        $.ajaxSetup({
            beforeSend: function (xhr) { xhr.setRequestHeader('bToken', this.bearerToken); xhr.setRequestHeader('rToken', this.refreshToken); }.bind(this),
            complete: function (resp) { this.bearerToken = resp.getResponseHeader("btoken"); }.bind(this)
        });
    };

    this.authenticateAnon = function (email, phno) {
        this.showTypingAnim();

        $.post("../bote/AuthAndGetformlist",
            {
                "cid": this.EXPRESSbase_SOLUTION_ID,
                "appid": this.EXPRESSbase_APP_ID,
                "socialId": null,
                "wc": "bc",
                "anon_email": email,
                "anon_phno": phno,
                "user_ip": this.userDtls.ip,
                "user_browser": this.userDtls.browser,
                "user_name": this.userDtls.name || null
            }, function (result) {
                this.hideTypingAnim();
                if (result === null)
                    this.authFailed();
                this.bearerToken = result[0];
                this.refreshToken = result[1];
                this.formsDict = result[2];
                window.ebcontext.user = JSON.parse(result[3]);
                //this.formNames = Object.values(this.formsDict);
                this.formNames = Object.values(result[4]);
                this.formIcons = result[5];
                this.AskWhatU();
                this.ajaxSetup4Future();
                /////////////////////////////////////////////////
                //setTimeout(function () {
                //    //$(".btn-box .btn:last").click();
                //    $(".btn-box").find("[idx=4]").click();
                //}.bind(this), this.typeDelay * 2 + 100);
            }.bind(this));

    }.bind(this);



    this.postmenuClick = function (e, reply) {
        var $e = $(e.target);
        if (reply === undefined)
            reply = $e.text().trim();
        var idx = parseInt($e.attr("idx"));
        $e.closest('.msg-cont').remove();
        this.sendMsg(reply);
        $('.eb-chat-inp-cont').hide();
        this.CurFormIdx = idx;
    }.bind(this);



    this.FBlogin = function (e) {
        this.postmenuClick(e);
        if (this.CurFormIdx === 0)
            this.login2FB();
        else {
            this.collectContacts();

        }
    }.bind(this);

    this.collectContacts = function () {
        this.msgFromBot("OK, No issues. Can you Please provide your contact Details ? so that I can understand you better.");
        this.msgFromBot($('<div class="contct-cont"><div class="contact-inp-wrap"><input id="anon_mail" type="email" placeholder="Email" class="plain-inp"></div><div class="contact-inp-wrap"><input id="anon_phno" type="tel" placeholder="Phone Number" class="plain-inp"></div><button name="contactSubmit" class="contactSubmit">Submit <i class="fa fa-chevron-right" aria-hidden="true"></i></button>'));
    };

    this.continueAsFBUser = function (e) {
        this.postmenuClick(e, "");
        if (this.CurFormIdx === 0) {
            this.sendCtrl("Continue as " + this.userDtls.name);
            this.authenticate();
        }
        else
            this.FB.logout(function (response) {
                //this.msgFromBot("You are successfully logout from our App");///////////////////////
                this.sendCtrl("Not " + this.userDtls.name);
                this.collectContacts();
            }.bind(this));
    }.bind(this);

    this.startFormInteraction = function (e) {
        this.curRefid = $(e.target).closest(".btn").attr("refid");
        this.curObjType = $(e.target).attr("obj-type");
        this.postmenuClick(e);
        this.getForm(this.curRefid);///////////////////
    }.bind(this);

    //this.setDataModel = function (form) {
    //    for (let i = 0; i < form.Controls.$values.length; i++) {
    //        getSingleColumn(form.Controls.$values[i]);
    //    }
    //};


    this.getForm = function (RefId) {
        this.showTypingAnim();
        if (!this.formsList[RefId]) {
            $.ajax({
                type: "POST",
                //url: "../Boti/GetCurForm",
                url: "../Boti/GetCurForm_New",
                data: { refid: RefId },

                success: function (res) {
                    let result = JSON.parse(res);
                    let form = JSON.parse(result.object);
                    this.curFormObj = form;
                    let DataRes = JSON.parse(result.data);
                    if (DataRes.Status === 200) {
                        this.CurDataMODEL = DataRes.FormData.MultipleTables;
                        this.CurRowId = this.CurDataMODEL[form.TableName][0].RowId;
                        this.hideTypingAnim();
                        //data = JSON.parse(data);

                        attachModalCellRef_form(form, this.CurDataMODEL);

                        //this.setDataModel(form);
                        JsonToEbControls(form);

                        //if (typeof data === "string") {
                        //    data = JSON.parse(data);
                        //    data.ObjType = data.ObjType;
                        //}
                        this.formsList[RefId] = form;
                        if (form.ObjType === "BotForm") {
                            this.curForm = form;
                            this.setFormControls();
                        }
                        else if (form.ObjType === "TableVisualization") {
                            //form.BotCols = JSON.parse(form.BotCols);
                            //form.BotData = JSON.parse(form.BotData);
                            this.curTblViz = form;
                            this.showTblViz();
                        }
                        else if (form.ObjType === "ChartVisualization") {
                            this.curChartViz = form;
                            this.showChartViz();
                        }
                    }
                    else if (DataRes.Status === 403) {
                        EbMessage("show", { Message: "Access denied to update this data entry!", AutoHide: true, Background: '#aa0000' });
                        console.error(DataRes.MessageInt);
                    }
                    else {
                        EbMessage("show", { Message: DataRes.Message, AutoHide: true, Background: '#aa0000' });
                        console.error(DataRes.MessageInt);
                    }
                }.bind(this)

            });
            //$.post("../Boti/GetCurForm", {
            //    "refid": RefId
            //}, function (data) {
            //    this.hideTypingAnim();

            //    if (typeof data === "string") {
            //        data = JSON.parse(data);
            //        data.ObjType = data.ObjType;
            //    }


            //    this.formsList[RefId] = data;
            //    if (data.ObjType === "BotForm") {
            //        this.curForm = data;
            //        this.setFormControls();
            //    }
            //    else if (data.ObjType === "TableVisualization") {
            //        data.BotCols = JSON.parse(data.BotCols);
            //        data.BotData = JSON.parse(data.BotData);
            //        this.curTblViz = data;
            //        this.showTblViz();
            //    }
            //    else if (data.ObjType === "ChartVisualization") {
            //        this.curChartViz = data;
            //        this.showChartViz();
            //    }
            //    }.bind(this));

        }
        else {
            this.hideTypingAnim();
            this.curForm = this.formsList[RefId];

            var form = this.formsList[RefId];
            if (form.ObjType === "BotForm")
                this.curForm = form;
            else if (form.ObjType === "TableVisualization")
                this.curTblViz = form;
            else if (form.ObjType === "ChartVisualization")
                this.showChartViz();//////////////////////////////////////////////////////////////////////////////////

            this.setFormControls();
        }
    };

    this.showTblViz = function (e) {
        var $tableCont = $('<div class="table-cont">' + this.curTblViz.bareControlHtml + '</div>');
        this.$chatBox.append($tableCont);
        this.showTypingAnim();
        //$(`#${this.curTblViz.EbSid}`).DataTable({//change ebsid to name
        //    processing: true,
        //    serverSide: false,
        //    dom: 'rt',
        //    columns: this.curTblViz.BotCols,
        //    data: this.curTblViz.BotData,
        //    initComplete: function () {
        //        this.hideTypingAnim();
        //        this.AskWhatU();
        //        $tableCont.show(100);
        //    }.bind(this)
        //dom: "rt",
        //ajax: {
        //    url: 'http://localhost:8000/ds/data/' + this.curTblViz.DataSourceRefId,
        //    type: 'POST',
        //    timeout: 180000,
        //    data: function (dq) {
        //        delete dq.columns; delete dq.order; delete dq.search;
        //        dq.RefId = this.curTblViz.DataSourceRefId;
        //        return dq;
        //    }.bind(this),
        //    dataSrc: function (dd) {
        //        return dd.data;
        //    },
        //    beforeSend: function (xhr) {
        //        xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
        //    }.bind(this),
        //    crossDomain: true
        //}
        //});

        var o = new Object();
        o.containerId = this.curTblViz.name + "Container";
        o.dsid = this.curTblViz.dataSourceRefId;
        o.tableId = this.curTblViz.name + "tbl";
        o.showSerialColumn = true;
        o.showCheckboxColumn = false;
        o.showFilterRow = false;
        o.IsPaging = false;
        o.wc = 'bc';
        //o.scrollHeight = this.scrollHeight + "px";
        //o.fnDblclickCallback = this.dblClickOnOptDDEventHand.bind(this);
        //o.fnKeyUpCallback = this.xxx.bind(this);
        //o.arrowFocusCallback = this.arrowSelectionStylingFcs;
        //o.arrowBlurCallback = this.arrowSelectionStylingBlr;
        //o.fninitComplete = this.initDTpost.bind(this);
        //o.hiddenFieldName = this.vmName;
        //o.showFilterRow = true;
        //o.keyPressCallbackFn = this.DDKeyPress.bind(this);
        o.columns = this.curTblViz.columns;//////////////////////////////////////////////////////
        this.datatable = new EbBasicDataTable(o);

        this.hideTypingAnim();
        this.AskWhatU();
    }.bind(this);

    this.showChartViz = function (e) {
        this.showTypingAnim();
        $.ajax({
            type: 'POST',
            url: '../boti/getData',
            data: { draw: 1, RefId: this.curChartViz.DataSourceRefId, Start: 0, Length: 50, TFilters: [] },
            //beforeSend: function (xhr) {
            //    xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
            //}.bind(this),
            success: this.getDataSuccess.bind(this),
            error: function () { }
        });
    }.bind(this);

    this.getDataSuccess = function (result) {
        this.Gdata = result.data;
        $canvasDiv = $('<div class="chart-cont">' + this.curChartViz.BareControlHtml + '</div>');
        $canvasDiv.find("canvas").attr("id", $canvasDiv.find("canvas").attr("id") + ++this.ChartCounter);
        this.$chatBox.append($canvasDiv);
        this.drawGeneralGraph();
        this.hideTypingAnim();
        this.AskWhatU();
    };

    this.drawGeneralGraph = function () {
        this.getBarData();
        this.gdata = {
            labels: this.XLabel,
            datasets: this.dataset
        };
        this.animateOPtions = this.curChartViz.ShowValue ? new animateObj(0) : false;
        this.goptions = {
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: (this.type !== "pie") ? true : false,
                        labelString: (this.curChartViz.YaxisTitle !== "") ? this.curChartViz.YaxisTitle : "YLabel",
                        fontColor: (this.curChartViz.YaxisTitleColor !== null && this.curChartViz.YaxisTitleColor !== "#ffffff") ? this.curChartViz.YaxisTitleColor : "#000000"
                    },
                    stacked: false,
                    gridLines: {
                        display: (this.curChartViz.Type !== "pie") ? true : false
                    },
                    ticks: {
                        fontSize: 10,
                        fontColor: (this.curChartViz.YaxisLabelColor !== null && this.curChartViz.YaxisTitleColor !== "#ffffff") ? this.curChartViz.YaxisLabelColor : "#000000"
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: (this.type !== "pie") ? true : false,
                        labelString: (this.curChartViz.XaxisTitle !== "") ? this.curChartViz.XaxisTitle : "XLabel",
                        fontColor: (this.curChartViz.XaxisTitleColor !== null && this.curChartViz.YaxisTitleColor !== "#ffffff") ? this.curChartViz.XaxisTitleColor : "#000000"
                    },
                    gridLines: {
                        display: this.type !== "pie" ? true : false
                    },
                    ticks: {
                        fontSize: 10,
                        fontColor: (this.curChartViz.XaxisLabelColor !== null && this.curChartViz.YaxisTitleColor !== "#ffffff") ? this.curChartViz.XaxisLabelColor : "#000000"
                    }
                }]
            },
            zoom: {
                // Boolean to enable zooming
                enabled: true,

                // Zooming directions. Remove the appropriate direction to disable 
                // Eg. 'y' would only allow zooming in the y direction
                mode: 'x'
            },
            pan: {
                enabled: true,
                mode: 'x'
            },
            legend: {
                //onClick: this.legendClick.bind(this)
            },

            tooltips: {
                enabled: this.curChartViz.ShowTooltip
            },
            animation: this.animateOPtions

        };
        if (this.curChartViz.Xaxis.$values.length > 0 && this.curChartViz.Xaxis.$values.length > 0)
            this.drawGraph();

    };

    this.getBarData = function () {
        this.Xindx = [];
        this.Yindx = [];
        this.dataset = [];
        this.XLabel = [];
        this.YLabel = [];
        var xdx = [], ydx = [];
        if (this.curChartViz.Xaxis.$values.length > 0 && this.curChartViz.Yaxis.$values.length > 0) {

            $.each(this.curChartViz.Xaxis.$values, function (i, obj) {
                xdx.push(obj.data);
            });

            $.each(this.curChartViz.Yaxis.$values, function (i, obj) {
                ydx.push(obj.data);
            });

            $.each(this.Gdata, this.getBarDataLabel.bind(this, xdx));

            for (k = 0; k < ydx.length; k++) {
                this.YLabel = [];
                for (j = 0; j < this.Gdata.length; j++)
                    this.YLabel.push(this.Gdata[j][ydx[k]]);
                if (this.curChartViz.Type !== "googlemap") {
                    if (this.curChartViz.Type !== "pie") {
                        this.piedataFlag = false;
                        this.dataset.push(new datasetObj(this.curChartViz.Yaxis.$values[k].name, this.YLabel, this.curChartViz.LegendColor.$values[k].color, this.curChartViz.LegendColor.$values[k].color, false));
                    }
                    else {
                        this.dataset.push(new datasetObj4Pie(this.curChartViz.Yaxis.$values[k].name, this.YLabel, this.curChartViz.LegendColor.$values[k].color, this.curChartViz.LegendColor.$values[k].color, false));
                        this.piedataFlag = true;
                    }
                }
            }
        }
    };

    this.getBarDataLabel = function (xdx, i, value) {
        for (k = 0; k < xdx.length; k++)
            this.XLabel.push(value[xdx[k]]);
    };

    this.drawGraph = function () {
        var canvas = document.getElementById(this.curChartViz.EbSid + this.ChartCounter);//change ebsid to name
        this.chartApi = new Chart(canvas, {
            type: this.curChartViz.Type,
            data: this.gdata,
            options: this.goptions,
        });
    };

    this.txtboxKeyup = function (e) {
        if (e.which === 13)/////////////////////////////
            this.send_btn();
    }.bind(this);

    this.send_btn = function () {
        window.onmessage = function (e) {
            if (e.data === 'hello') {
                //alert('It works!8888888888888888888888');
            }
        };

        var $e = $('.msg-inp');
        var msg = $e.val().trim();
        if (!msg) {
            $e.val('');
            return;
        };
        this.sendMsg(msg);
        //$('.eb-chatBox').scrollTop(99999999999);
        $e.val('');

    }.bind(this);

    this.greetings = function (name) {
        var time = new Date().getHours();
        var greeting = null;
        if (time < 12) {
            greeting = "Good morning!";
        }
        else if (time >= 12 && time < 16) {
            greeting = 'Good afternoon!';
        }
        else {
            greeting = 'Good evening!';
        }
        if (this.isAlreadylogined) {
            this.Query(`Hello ${this.FBResponse.name}, ${greeting}`, [`Continue as ${this.FBResponse.name} ?`, `Not ${this.FBResponse.name}?`], "continueAsFBUser");
            /////////////////////////////////////////////////
            setTimeout(function () {
                //$(".btn-box").find("[idx=0]").click();
            }.bind(this), this.typeDelay * 2 + 100);
        }
        else {
            this.msgFromBot(`Hello ${this.FBResponse.name}, ${greeting}`);
            setTimeout(function () {
                this.authenticate();
            }.bind(this), 901);
        }
    }.bind(this);

    this.Query = function (msg, OptArr, For, ids) {
        this.msgFromBot(msg);
        var Options = this.getButtons(OptArr.map((item) => { return item.replace(/_/g, " ") }), For, ids);
        this.msgFromBot($('<div class="btn-box" >' + Options + '</div>'));
    };

    this.getButtons = function (OptArr, For, ids) {
        var Html = '';
        $.each(OptArr, function (i, opt) {
            Html += `<button for="${For}" class="btn formname-btn" idx="${i}" refid="${(ids !== undefined) ? ids[i] : i}">${opt} </button>`;
        });
        return Html;
    };

    this.Query_botformlist = function (msg, OptArr, For, ids,icns) {
        this.msgFromBot(msg);
        var Options = this.getButtons_botformlist(OptArr.map((item) => { return item.replace(/_/g, " ") }), For, ids, icns);
        this.msgFromBot($('<div class="btn-box_botformlist" >' + Options + '</div>'));
    };

    this.getButtons_botformlist = function (OptArr, For, ids, icns) {
        var Html = '';
        $.each(OptArr, function (i, opt) {
            Html += `<button for="${For}" class="btn formname-btn_botformlist" idx="${i}" refid="${(ids !== undefined) ? ids[i] : i}"><i style="display:block;font-size: 28px; margin-bottom: 5px;" class="fa ${icns[i]}"></i>${opt} </button>`;
        });
        return Html;
    };

    this.initFormCtrls_fm = function () {
        $.each(this.curForm.Controls.$values, function (i, control) {//////////////////////////////////////
            this.initControls.init(control);
            $("#" + control.Name).on("blur", this.makeReqFm.bind(this, control)).on("focus", this.removeReqFm.bind(this, control));
        }.bind(this));
    }.bind(this);

    this.makeReqFm = function (control) {
        var $ctrl = $("#" + control.Name);
        if ($ctrl.length !== 0 && control.required && $ctrl.val().trim() === "")
            EbMakeInvalid(`[for=${control.Name}]`, '.ctrl-wraper');
    };

    this.removeReqFm = function (control) {
        EbMakeValid(`[for=${control.Name}]`, '.ctrl-wraper');
    };

    this.RenderForm = function () {
        var Html = `<div class='form-wraper'>`;
        $.each(this.curForm.Controls.$values, function (i, control) {
            if (!control.hidden)
                Html += `<label>${control.Label}</label><div for='${control.Name}'><div class='ctrl-wraper'>${control.BareControlHtml4Bot}</div></div><br/>`;
        });
        this.msgFromBot($(Html + '<div class="btn-box"><button name="formsubmit_fm" class="btn formname-btn">Submit</button><button name="formcancel_fm" class="btn formname-btn">Cancel</button></div></div>'), this.initFormCtrls_fm);
    };

    this.setFormControls = function () {
        this.formControls = [];
        $.each(this.curForm.Controls.$values, function (i, control) {
            if (control.VisibleExpr && control.VisibleExpr.Code.trim())//if visibleIf is Not empty
                this.formFunctions.visibleIfs[control.Name] = new Function("form", atob(control.VisibleExpr.Code));
            if (control.ValueExpression && control.ValueExpression.trim())//if valueExpression is Not empty
                this.formFunctions.valueExpressions[control.Name] = new Function("form", "user", atob(control.ValueExpression));
            this.formControls.push($(`<div class='ctrl-wraper'>${control.BareControlHtml4Bot}</div>`));
        }.bind(this));

        if (this.curForm.RenderAsForm)
            this.RenderForm();
        else {

            this.getControl(0);
        }
    }.bind(this);

    this.chooseClick = function (e) {
        $(e.target).attr("idx", this.nxtCtrlIdx);
        this.ctrlSend(e);
    }.bind(this);

    this.getCardsetValue = function (cardCtrl) {
        var resObj = {};
        var isPersistAnyField = false;
        this.curDispValue = '';
        $.each(cardCtrl.CardFields, function (h, fObj) {
            if (!fObj.DoNotPersist) {
                isPersistAnyField = true;
            }
        }.bind(this));

        if (!cardCtrl.MultiSelect && isPersistAnyField) {
            $(event.target).parents().find('.slick-current .card-btn-cont .btn').click();
        }
        if (isPersistAnyField) {
            $.each(cardCtrl.CardCollection, function (k, cObj) {
                if (cardCtrl.SelectedCards.indexOf(cObj.CardId) !== -1) {
                    var tempArray = new Array();
                    $.each(cardCtrl.CardFields, function (h, fObj) {
                        if (!fObj.DoNotPersist) {
                            tempArray.push(new Object({ Value: cObj.customFields[fObj.Name], Type: fObj.EbDbType, Name: fObj.Name }));
                        }
                        if (fObj.ObjType === 'CardTitleField') {//for display selected card names on submit
                            this.curDispValue += cObj.CustomFields[fObj.Name] + '<br/>';
                        }
                    }.bind(this));
                    resObj[cObj.CardId] = tempArray;
                }
            }.bind(this));
            if (cardCtrl.SelectedCards.length === 0 && cardCtrl.MultiSelect)
                this.curDispValue = 'Nothing Selected';
        }
        else {
            this.curDispValue = '';
        }
        //cardCtrl.selectedCards = [];
        return (JSON.stringify(resObj));
    };

    this.getValue = function ($input) {
        var inpVal;
        if ($input[0].tagName === "SELECT")
            inpVal = $input.find(":selected").text();
        else if ($input.attr("type") === "password")
            inpVal = $input.val().replace(/(^.)(.*)(.$)/, function (a, b, c, d) { return b + c.replace(/./g, '*') + d });
        else if ($input.attr("type") === "file") {
            inpVal = $input.val().split("\\");
            inpVal = inpVal[inpVal.length - 1];
        }
        else if ($input.attr("type") === "RadioGroup") {
            var $checkedCB = $(`input[name=${$input.attr("name")}]:checked`);
            inpVal = $checkedCB.val();
            this.curDispValue = $checkedCB.next().text();
        }
        else if (this.curCtrl.ObjType === "PowerSelect") {
            //inpVal = this.curCtrl.tempValue;
            //inpVal = this.curCtrl.selectedRow;
            inpVal = this.curCtrl.getValue();
            console.log("inp");
            console.log(inpVal);
            this.curDispValue = this.curCtrl._DisplayMembers[Object.keys(this.curCtrl._DisplayMembers)[0]].toString().replace(/,/g, ", ");
        }
        else if (this.curCtrl.ObjType === "InputGeoLocation") {
            inpVal = $("#" + $input[0].id + "lat").val() + ", " + $("#" + $input[0].id + "long").val();
        }
        else if (this.curCtrl.ObjType === "StaticCardSet" || this.curCtrl.ObjType === "DynamicCardSet") {
            inpVal = this.getCardsetValue(this.curCtrl);
        }
        else if (this.curCtrl.ObjType === "Survey") {
            inpVal = this.curCtrl.resultantJson;
        }
        else
            inpVal = $input.val();
        //return inpVal.trim();
        return inpVal;
    };

    this.checkRequired = function () {
        if (this.curCtrl.Required && !this.curVal) {
            EbMakeInvalid(`[for=${this.curCtrl.Name}]`, '.chat-ctrl-cont');
            return false;
        }
        else {
            EbMakeValid(`[for=${this.curCtrl.Name}]`, '.chat-ctrl-cont');
            return true;
        }
    };

    this.getDisplayText = function (ctrl) {
        let text = ctrl.getDisplayMemberFromDOM();
        if (ctrl.ObjType === "PowerSelect")
            text = JSON.stringify(text);
        return text;
    };

    this.ctrlSend = function (e) {
        this.curVal = null;
        this.displayValue = null;
        var $btn = $(e.target).closest("button");
        var $msgDiv = $btn.closest('.msg-cont');
        this.sendBtnIdx = parseInt($btn.attr('idx'));
        this.curCtrl = this.curForm.Controls.$values[this.sendBtnIdx];
        var id = this.curCtrl.Name;
        var next_idx = this.sendBtnIdx + 1;
        this.nxtCtrlIdx = (next_idx > this.nxtCtrlIdx) ? next_idx : this.nxtCtrlIdx;
        var $input = $('#' + this.curCtrl.EbSid);
        //varghese
        //for cards  this.curDispValue  is used
        // this.sendCtrlAfter($msgDiv.hide(), this.curDispValue + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
        this.curCtrl.DataVals.Value = this.curCtrl.getValueFromDOM();
        this.curVal = this.curCtrl.getValue();
        this.displayValue = this.getDisplayText(this.curCtrl);
        if (this.curCtrl.ObjType !== 'StaticCardSet') {
            this.sendCtrlAfter($msgDiv.hide(), this.displayValue + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
        }
        else {
            var $msg = this.$userMsgBox.clone();
            //let msgg = $btn.parent().parent().html() + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>';
            
            //$btn.hide();
            //$btn.parent().prev().children('button').hide();
            $btn.parent().parent().remove();
            $msg.find('.msg-wraper-user').html($btn.parent().prev().find('.slick-active').html()).append(this.getTime());
            $msg.insertAfter($msgDiv);
            $msgDiv.remove();
        }
        this.formValues[id] = this.curVal;
        this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.EbDbType];
        this.callGetControl(this.nxtCtrlIdx);



        //old code


        ////$input.off("blur").on("blur", function () { $btn.click() });//when press Tab key send
        //this.curVal = this.getValue($input);
        //if (this.curCtrl.ObjType === "ImageUploader") {
        //    if (!this.checkRequired()) { return; }
        //    this.replyAsImage($msgDiv, $input[0], next_idx, id);
        //    //if()
        //    //this.formValues[id] = this.curVal;// last value set from outer fn
        //    //this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.ebDbType];
        //}
        //else if (this.curCtrl.ObjType === "RadioGroup" || $input.attr("type") === "RadioGroup" || this.curCtrl.ObjType === "PowerSelect") {
        //    if (!this.checkRequired()) { return; }
        //    this.sendCtrlAfter($msgDiv.hide(), this.curDispValue + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
        //    this.formValues[id] = this.curVal;
        //    if (this.curCtrl.ObjType === "PowerSelect")//////////////////////////-------////////////
        //        this.formValuesWithType[id] = [this.curCtrl.TempValue, this.curCtrl.EbDbType];
        //    else
        //        this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.EbDbType];
        //    this.callGetControl(this.nxtCtrlIdx);
        //}
        //else if (this.curCtrl.ObjType === "StaticCardSet" || this.curCtrl.ObjType === "DynamicCardSet") {
        //    if (!this.checkRequired()) { return; }
        //    if (this.curCtrl.IsReadOnly) {
        //        $btn.css('display', 'none');
        //        $('#' + this.curCtrl.Name).attr('id', '');
        //    }
        //    else {
        //        this.sendCtrlAfter($msgDiv.hide(), this.curDispValue + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
        //        this.formValues[id] = this.curVal;
        //        this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.EbDbType];
        //    }
        //    this.callGetControl(this.nxtCtrlIdx);
        //}
        //else if (this.curCtrl.ObjType === "Survey") {
        //    this.sendCtrlAfter($msgDiv.hide(), this.curDispValue + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
        //    this.formValues[id] = this.curVal;
        //    this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.EbDbType];
        //    this.callGetControl(this.nxtCtrlIdx);
        //}
        //else if (this.curCtrl.ObjType === "Date" || this.curCtrl.ObjType === "DateTime" || this.curCtrl.ObjType === "Time") {
        //    this.sendCtrlAfter($msgDiv.hide(), this.curVal + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
        //    if (this.curCtrl.ObjType === "Date")
        //        this.curVal = moment(this.curVal, ebcontext.user.Preference.ShortDatePattern).format('YYYY-MM-DD');
        //    else if (this.curCtrl.ObjType === "DateTime")
        //        this.curVal = moment(this.curVal, ebcontext.user.Preference.ShortDatePattern + ' ' + ebcontext.user.Preference.ShortTimePattern).format('YYYY-MM-DD HH:mm:ss');
        //    else if (this.curCtrl.ObjType === "Time")
        //        this.curVal = moment(this.curVal, ebcontext.user.Preference.ShortTimePattern).format('YYYY-MM-DD HH:mm:ss');
        //    this.formValues[id] = this.curVal;
        //    this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.EbDbType];
        //    this.callGetControl(this.nxtCtrlIdx);
        //}
        //else {
        //    this.curVal = this.curVal || $('#' + id).val();
        //    if (!this.checkRequired()) { return; }
        //    this.sendCtrlAfter($msgDiv.hide(), this.curVal + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
        //    this.formValues[id] = this.curVal;
        //    this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.EbDbType];
        //    this.callGetControl(this.nxtCtrlIdx);
        //}

        this.IsEdtMode = false;
        this.IsDpndgCtrEdt = false;
        this.curVal = null;
    }.bind(this);

    this.valueExpHandler = function (nxtCtrl) {
        //var nxtCtrl = this.curForm.Controls.$values[this.nxtCtrlIdx];
        var valExpFunc = this.formFunctions.valueExpressions[nxtCtrl.Name];
        if (valExpFunc !== undefined) {
            this.formValues[nxtCtrl.Name] = valExpFunc(this.formValues, this.userDtls);
            this.formValuesWithType[nxtCtrl.Name] = [this.formValues[nxtCtrl.Name], nxtCtrl.ebDbType];
        }
        else if (nxtCtrl.autoIncrement) {
            this.formValuesWithType[nxtCtrl.Name] = [0, nxtCtrl.ebDbType, true];
        }
        //console.log(this.curForm.Controls.$values[0].selectedRow);//  hardcoding
    };

    this.callGetControl = function () {
        if (this.nxtCtrlIdx !== this.formControls.length) { // if not last control
            if (!this.IsEdtMode || this.IsDpndgCtrEdt) {   // (if not edit mode or IsDpndgCtr edit mode) if not skip calling getControl()
                var visibleIfFn = this.formFunctions.visibleIfs[this.curForm.Controls.$values[this.nxtCtrlIdx].Name];
                //if (this.curForm.Controls.$values[this.nxtCtrlIdx].hidden) {//////////////////////
                this.valueExpHandler(this.curForm.Controls.$values[this.nxtCtrlIdx]);
                //}
                if ((!visibleIfFn || visibleIfFn(this.formValues)) && !this.curForm.Controls.$values[this.nxtCtrlIdx].Hidden) {//checks isVisible or no isVisible defined                    
                    this.getControl(this.nxtCtrlIdx);
                }
                else {
                    this.nxtCtrlIdx++;
                    this.callGetControl();
                }
            }
        }
        else {  //if last control
            if (!this.curForm.IsReadOnly)
                this.showSubmit();
            else {
                //var $btn = $(event.target).closest(".btn");
                //this.sendMsg($btn.text());
                $('.msg-wraper-user [name=ctrledit]').remove();
                //$btn.closest(".msg-cont").remove();
                this.AskWhatU();
            }
        }
        this.enableCtrledit();
    };

    this.showSubmit = function () {
        if ($("[name=formsubmit]").length === 0) {
            this.msgFromBot('Are you sure? Can I submit?');
            this.msgFromBot($('<div class="btn-box"><button name="formsubmit" class="btn formname-btn">Sure</button><button name="formcancel" class="btn formname-btn">Cancel</button></div>'));
        }
    };

    this.getControl = function (idx) {
        if (idx === this.formControls.length)
            return;
        var controlHTML = this.formControls[idx][0].outerHTML;
        var $ctrlCont = $(controlHTML);
        this.curCtrl = this.curForm.Controls.$values[idx];
        var name = this.curCtrl.Name;
        //if (!(this.curCtrl && (this.curCtrl.ObjType === "Cards" || this.curCtrl.ObjType === "Locations" || this.curCtrl.ObjType === "InputGeoLocation" || this.curCtrl.ObjType === "Image")))
        if (!(this.curCtrl && this.curCtrl.IsFullViewContol))
            $ctrlCont = $(this.wrapIn_chat_ctrl_cont(idx, controlHTML));
        var label = this.curCtrl.Label;
        if (label) {
            if (this.curCtrl.HelpText)
                label += ` (${this.curCtrl.HelpText})`;
            this.msgFromBot(label);
        }
        if (this.curCtrl.ObjType === "Image") {
            this.msgFromBot($ctrlCont, function () { $(`#${name}`).select(); }, name);
            this.nxtCtrlIdx++;
            this.callGetControl();
        }
        else if (this.curCtrl.ObjType === "Labels") {
            this.sendLabels(this.curCtrl);
        }
        else
            this.msgFromBot($ctrlCont, function () { $(`#${name}`).select(); }, name);
    }.bind(this);

    this.sendLabels = function (ctrl) {
        $.each(ctrl.LabelCollection.$values, function (idx, label) {
            var lbl = label.Label.trim();
            if (lbl === "")
                return true;
            this.msgFromBot(label.Label);
        }.bind(this));
    };

    this.wrapIn_chat_ctrl_cont = function (idx, controlHTML) {
        return '<div class="chat-ctrl-cont">' + controlHTML + '<button class="btn" idx=' + idx + ' name="ctrlsend"><i class="fa fa-paper-plane-o" aria-hidden="true"></i></button></div>';
    };

    this.replyAsImage = function ($prevMsg, input, idx, ctrlname) {
        console.log("replyAsImage()");
        var fname = input.files[0].Name;
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                this.sendImgAfter($prevMsg.hide(), e.target.result, ctrlname, fname);
                $(`[for=${ctrlname}] .img-loader:last`).show(100);
                this.uploadImage(e.target.result, ctrlname, idx);
            }.bind(this);
            reader.readAsDataURL(input.files[0]);
        }
    };

    this.sendImgAfter = function ($prevMsg, path, ctrlname, filename) {
        console.log("sendImgAfter()");
        var $msg = this.$userMsgBox.clone();
        $msg.find(".msg-wraper-user").css("padding", "5px");
        var $imgtag = $(`<div class="img-box" for="${ctrlname}"><div class="img-loader"></div><span class="img-edit"  idx="${this.curForm.Controls.$values.indexOf(this.curCtrl)}"  for="${ctrlname}" name="ctrledit"><i class="fa fa-pencil" aria-hidden="true"></i></span><img src="${path}" alt="amal face" width="100%"><div class="file-name">${filename}</div>${this.getTime()}</div>`);
        $msg.find('.msg-wraper-user').append($imgtag);
        $msg.insertAfter($prevMsg);
        //$('.eb-chatBox').scrollTop(99999999999);
    };

    this.uploadImage = function (url, id, idx) {
        console.log("uploadImage");
        var URL = url.substring(url.indexOf(",/") + 1);
        var EbSE = new EbServerEvents({
            ServerEventUrl: this.ServerEventUrl,
            Channels: ["file-upload"],
            Rtoken: this.refreshToken
        });
        EbSE.onUploadSuccess = function (obj, e) {
            $(`[for=${id}] .img-loader:last`).hide(100);
            this.callGetControl(this.nxtCtrlIdx);

            this.formValues[id] = obj.objectId;
            this.formValuesWithType[id] = [this.formValues[id], 16];

        }.bind(this);

        $.post("../Boti/UploadFileAsync", {
            'base64': URL,
            "filename": id,
            "type": URL.trim(".")[URL.trim(".").length - 1]
        }).done(function (result) {
            //$(`[for=${id}] .img-loader:last`).hide(100);
            //this.callGetControl(this.nxtCtrlIdx);
            //this.curVal = result;
        }.bind(this));
    }.bind(this);

    this.ctrlEdit = function (e) {
        var $btn = $(e.target).closest("span");
        var idx = parseInt($btn.attr('idx'));
        this.curCtrl = this.curForm.Controls.$values[idx];
        var NxtRDpndgCtrlName = this.getNxtRndrdDpndgCtrlName(this.curCtrl.Name);
        if (NxtRDpndgCtrlName) {
            this.__idx = idx; this.__NxtRDpndgCtrlName = NxtRDpndgCtrlName; this.__$btn = $btn;
            this.initEDCP();
        }
        else
            this.ctrlEHelper(idx, $btn);
    }.bind(this);

    this.initEDCP = function () {
        this.$DPEBtn = $(`[name=ctrledit]`).filter(`[idx=${this.__idx}]`).closest(".msg-wraper-user");
        this.$DPEBtn.confirmation({
            placement: 'bottom',
            title: "Edit this field and restart from related point !",
            btnOkLabel: " Edit ",
            btnOkClass: "btn btn-sm btn-warning",
            btnOkIcon: "glyphicon glyphicon-pencil",
            btnCancelIcon: "glyphicon glyphicon-remove-circle",
            onConfirm: this.editDpndCtrl
            //onCancel: function () {
            //    alert("cancel");
            //    //this.$DPEBtn.confirmation('destroy');
            //}.bind(this)
        }).confirmation('show');
    }.bind(this);

    this.ctrlEHelper = function (idx, $btn) {
        this.disableCtrledit();
        this.IsEdtMode = true;
        $('.msg-cont-bot [idx=' + idx + ']').closest('.msg-cont').show(200);
        $("#" + this.curCtrl.Name).click().select();
        $btn.closest('.msg-cont').remove();
    };

    this.editDpndCtrl = function () {
        //this.$DPEBtn.confirmation('destroy');
        this.IsDpndgCtrEdt = true;
        this.nxtCtrlIdx = this.curForm.Controls.$values.indexOf(getObjByval(this.curForm.Controls.$values, "name", this.getNxtDpndgCtrlName(this.curCtrl.Name, this.formFunctions.visibleIfs)));
        this.curCtrl = this.curForm.Controls.$values[this.__idx];
        delKeyAndAfter(this.formValues, this.__NxtRDpndgCtrlName);
        delKeyAndAfter(this.formValuesWithType, this.__NxtRDpndgCtrlName);
        $('.eb-chatBox [for=' + this.__NxtRDpndgCtrlName + ']').prev().prev().nextAll().remove();
        this.ctrlEHelper(this.__idx, this.__$btn);
    }.bind(this);

    this.getNxtDpndgCtrlName = function (name, formFuncs) {
        var res = null;
        $.each(formFuncs, function (key, Fn) {
            Sfn = Fn.toString().replace(/ /g, '');
            if (RegExp("(form." + name + "\\b)|(form\\[" + name + "\\]\\b)").test(Sfn)) {
                res = key;
                return false;
            }
        }.bind(this));
        return res;
    }.bind(this);

    this.getNxtRndrdDpndgCtrlName = function (name) {
        var res = null;
        $.each(this.formFunctions.visibleIfs, function (key, Fn) {
            Sfn = Fn.toString().replace(/ /g, '');
            if (RegExp("(form." + name + "\\b)|(form\\[" + name + "\\]\\b)").test(Sfn) && $('.eb-chatBox [for=' + key + ']').length > 0) {
                res = key;
                return false;
            }
        }.bind(this));
        return res;
    }.bind(this);

    this.sendMsg = function (msg) {
        if (!msg)
            return;
        var $msg = this.$userMsgBox.clone();
        $msg.find('.msg-wraper-user').text(msg).append(this.getTime());
        this.$chatBox.append($msg);
        //$('.eb-chatBox').scrollTop(99999999999);
    };

    this.sendCtrl = function (msg) {
        var $msg = this.$userMsgBox.clone();
        $msg.find('.msg-wraper-user').append(msg).append(this.getTime());
        this.$chatBox.append($msg);
        //$('.eb-chatBox').scrollTop(99999999999);
    };

    this.sendCtrlAfter = function ($prevMsg, msg) {
        var $msg = this.$userMsgBox.clone();
        $msg.find('.msg-wraper-user').html(msg).append(this.getTime());;
        $msg.insertAfter($prevMsg);
        //$('.eb-chatBox').scrollTop(99999999999);
    };

    this.startTypingAnim = function ($msg) {
        $msg.find('.msg-wraper-bot').html(this.$TypeAnim.clone());
    }.bind(this);

    this.showTypingAnim = function () {
        this.$chatBox.append(this.$TypeAnimMsg);
    }.bind(this);

    this.hideTypingAnim = function () {
        this.$TypeAnimMsg.remove();
    }.bind(this);

    this.msgFromBot = function (msg, callbackFn, ctrlname) {
        var $msg = this.$botMsgBox.clone();
        this.$chatBox.append($msg);
        this.startTypingAnim($msg);
        if (this.ready) {
            setTimeout(function () {
                if (msg instanceof jQuery) {
                    if (ctrlname || typeof ctrlname === typeof "")
                        $msg.attr("for", ctrlname);
                    $msg.find('.bot-icon').remove();
                    $msg.find('.msg-wraper-bot').css("border", "none").css("background-color", "transparent").css("width", "99%").html(msg);
                    $msg.find(".msg-wraper-bot").css("padding-right", "3px");

                    if (this.curCtrl && this.curCtrl.IsFullViewContol) {
                        $msg.find(".ctrl-wraper").css("width", "100%").css("border", 'none');
                        $msg.find(".msg-wraper-bot").css("margin-left", "12px");
                    }

                    if (this.curCtrl && ($msg.find(".ctrl-wraper").length === 1)) {
                        if ($('#' + this.curCtrl.EbSid).length === 1)
                            this.loadcontrol();
                        else
                            console.error("loadcontrol() called before rendering 'id = " + this.curCtrl.Name + "' element");
                    }
                    if (this.curForm)
                        $msg.attr("form", this.curForm.Name);
                }
                else
                    $msg.find('.msg-wraper-bot').text(msg).append(this.getTime());
                this.ready = true;
                if (callbackFn && typeof callbackFn === typeof function () { })
                    callbackFn();
            }.bind(this), this.typeDelay);
            this.ready = false;
        }
        else {
            $msg.remove();
            setTimeout(function () {
                this.msgFromBot(msg, callbackFn, ctrlname);
            }.bind(this), this.typeDelay + 1);
        }
        //$('.eb-chatBox').scrollTop(99999999999);
        //$('.eb-chatBox').animate({ scrollTop: $('.eb-chatBox')[0].scrollHeight });

    }.bind(this);

    //load control script
    this.loadcontrol = function () {
        if (!this.curCtrl)
            return;
        if (this.initControls[this.curCtrl.ObjType] !== undefined)
            this.initControls[this.curCtrl.ObjType](this.curCtrl, {});
    };

    this.submitReqCheck = function () {
        var $firstCtrl = null;
        $.each(this.curForm.Controls.$values, function (i, control) {
            var $ctrl = $("#" + control.Name);
            if ($ctrl.length !== 0 && control.Required && $ctrl.val().trim() === "") {
                if (!$firstCtrl)
                    $firstCtrl = $ctrl;
                this.makeReqFm(control);
            }
        }.bind(this));

        if ($firstCtrl) {
            $firstCtrl.select();
            return false;
        }
        else
            return true;
    };

    this.formSubmit_fm = function (e) {
        if (!this.submitReqCheck())
            return;
        var $btn = $(e.target).closest(".btn");
        var html = "<div class='sum-box'><table style='font-size: inherit;'>";
        $.each(this.curForm.Controls.$values, function (i, control) {
            if (!control.Hidden) {
                this.curCtrl = control;
                var curval = this.getValue($('#' + control.Name));
                var name = control.Name;

                this.formValues[name] = curval;
                if (control.ObjType === "PowerSelect")
                    this.formValuesWithType[name] = [control.TempValue, control.EbDbType];
                else
                    this.formValuesWithType[name] = [curval, control.EbDbType];
                html += `<tr><td style='padding: 5px;'>${control.Label}</td> <td style='padding-left: 10px;'>${this.formValuesWithType[name][0]}</td></tr>`;
            }
            this.valueExpHandler(control);
        }.bind(this));
        this.sendCtrl($(html + "</table></div>"));
        this.sendMsg($btn.text());
        this.showConfirm();
    }.bind(this);

    this.formCancel_fm = function (e) {
        var $btn = $(e.target).closest(".btn");
        this.sendMsg($btn.text());
        $('.msg-wraper-user [name=ctrledit]').remove();
        $btn.closest(".msg-cont").remove();
        this.AskWhatU();
    }.bind(this);

    this.formSubmit = function (e) {
        var $btn = $(e.target).closest(".btn");
        this.sendMsg($btn.text());
        $('.msg-wraper-user [name=ctrledit]').remove();
        $btn.closest(".msg-cont").remove();
        this.showConfirm();
    }.bind(this);

    this.formCancel = function (e) {
        var $btn = $(e.target).closest(".btn");
        this.sendMsg($btn.text());
        $('.msg-wraper-user [name=ctrledit]').remove();
        $btn.closest(".msg-cont").remove();
        this.ClearFormVariables();
        this.AskWhatU();
    }.bind(this);

    this.showConfirm = function () {
        this.ClearFormVariables();
        this.DataCollection();
    }.bind(this);

    this.ClearFormVariables = function () {
        this.formFunctions.visibleIfs = {};
        this.formFunctions.valueExpressions = {};
        this.nxtCtrlIdx = 0;
        $(`[form=${this.curForm.Name}]`).remove();
    };

    this.getFormValuesObjWithTypeColl = function () {
        let WebformData = {};

        WebformData.MultipleTables = formatData4webform(this.CurDataMODEL);
        WebformData.ExtendedTables = {};
        console.log("form data --");


        //console.log("old data --");
        console.log(JSON.stringify(WebformData.MultipleTables));

        console.log("new data --");
        console.log(JSON.stringify(formatData4webform(this.DataMODEL)));
        return JSON.stringify(WebformData);
    };


    //this.getFormValuesWithTypeColl = function () {
    //    var FVWTcoll = [];
    //    this.CurDataMODEL;
    //    $.each(this.formValuesWithType, function (key, val) {
    //        FVWTcoll.push({ Name: key, Value: val[0], Type: val[1], AutoIncrement: val[2] });
    //    });
    //    this.formValuesWithType = {};
    //    this.formValues = {};
    //    return FVWTcoll;
    //};
    //save botform
    this.DataCollection = function () {
        this.showTypingAnim();
        $.ajax({
            type: "POST",
            //url: this.ssurl + "/bots",
            url: "../Boti/UpdateFormData",
            data: {
                RefId: this.curRefid, rowid: this.CurRowId, data: this.getFormValuesObjWithTypeColl()
            },
            //beforeSend: function (xhr) {
            //    xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
            //}.bind(this),
            success: this.ajaxsuccess.bind(this),
        });
        this.formValues = {};
    };

    this.ajaxsuccess = function (resp) {
        this.hideTypingAnim();
        let msg = '';
        let respObj = JSON.parse(resp);
        if (respObj.Status === 200) {
            //EbMessage("show", { Message: "DataCollection success", AutoHide: true, Background: '#1ebf1e', Delay: 4000 });
            msg = `Your ${this.curForm.DisplayName} form submitted successfully`;
        }
        else {
            EbMessage("show", { Message: "Something went wrong", AutoHide: true, Background: '#bf1e1e', Delay: 4000 });
            msg = `Your ${this.curForm.DisplayName} form submission failed`;
            console.log(respObj.MessageInt);
        }
        this.msgFromBot(msg);
        this.AskWhatU();
        //EbMessage("show", { Message: 'DataCollection Success', AutoHide: false, Backgorund: '#bf1e1e' });
    };

    this.AskWhatU = function () {
        //this.Query("Click to explore", this.formNames, "form-opt", Object.keys(this.formsDict));
        this.Query_botformlist("Click to explore", this.formNames, "form-opt", Object.keys(this.formsDict),this.formIcons);
    };

    this.showDate = function () {
        var today = new Date();
        var dd = today.getDate();
        var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
        var mmm = m_names[today.getMonth()]; //January is 0!
        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd;
        }
        today = dd + '-' + mmm + '-' + yyyy;
        this.$chatBox.append(`<div class="chat-date"><span>${today}</span></div>`);
    };

    this.getTime = function () {
        return `<div class='msg-time'>${new Date().getHours() % 12 + ':' + new Date().getMinutes() + 'pm'}</div>`;
    };

    this.loadCtrlScript = function () {
        $("head").append(this.CntrlHeads);
    };

    this.authFailed = function () {
        alert("auth failed");
    };

    this.enableCtrledit = function () {
        $('[name="ctrledit"]').show(50);
    };

    this.disableCtrledit = function () {
        $('[name="ctrledit"]').hide(50);
    };

    this.authenticate = function () {
        this.showTypingAnim();

        $.post("../bote/AuthAndGetformlist",
            {
                "cid": this.EXPRESSbase_SOLUTION_ID,
                "appid": this.EXPRESSbase_APP_ID,
                "socialId": this.FBResponse.id,
                "wc": "bc",
                "anon_email": this.userDtls.email,
                "anon_phno": null,
                "user_ip": this.userDtls.ip,
                "user_browser": this.userDtls.browser,
                "user_name": this.userDtls.name || null,
            }, function (result) {
                this.hideTypingAnim();
                if (result === null)
                    this.authFailed();
                this.bearerToken = result[0];
                this.refreshToken = result[1];
                this.formsDict = result[2];
                window.ebcontext.user = JSON.parse(result[3]);
                //this.formNames = Object.values(this.formsDict););
                this.formNames = Object.values(result[4]);
                this.AskWhatU();
                this.ajaxSetup4Future();
                /////////////////////////////////////////////////Form click
                setTimeout(function () {
                    //$(".btn-box .btn:last").click();
                    //$(".btn-box").find("[idx=3]").click();
                }.bind(this), this.typeDelay * 2 + 100);
            }.bind(this));
    }.bind(this);

    this.FBLogined = function () {
        this.FB.api('/me?fields=id,name,picture,email', function (response) {
            this.FBResponse = response;
            this.userDtls.name = this.FBResponse.name;
            this.userDtls.email = this.FBResponse.email;
            this.$userMsgBox.find(".bot-icon-user").css('background', `url(${this.FBResponse.picture.data.url})center center no-repeat`);
            this.hideTypingAnim();
            this.greetings();
        }.bind(this));
    }.bind(this);

    this.FBNotLogined = function () {
        this.hideTypingAnim();
        this.isAlreadylogined = false;
        this.msgFromBot(this.welcomeMessage);
        this.Query("Would you login with your facebook, So I can remember you !", ["Login with facebook", "I don't have facebook account"], "fblogin");
    }.bind(this);

    this.login2FB = function () {
        this.FB.login(function (response) {
            if (response.authResponse) {
                statusChangeCallback(response);
            } else {
                this.collectContacts();
            }
        }.bind(this), { scope: 'email' });
    };

    this.initConnectionCheck = function () {
        Offline.options = { checkOnLoad: true, checks: { image: { url: 'https://expressbase.com/images/logos/EB_Logo.png?' + Date.now() }, active: 'image' } };
        setInterval(this.connectionPing, 500000);///////////////////////////////////////////////////////////////
    };

    this.connectionPing = function () {
        Offline.options.checks.image.url = 'https://expressbase.com/images/logos/EB_Logo.png?' + Date.now();
        if (Offline.state === 'up')
            Offline.check();
        console.log(Offline.state);
    };
    this.init();
};

var datasetObj = function (label, data, backgroundColor, borderColor, fill) {
    this.label = label;
    this.data = data;
    this.backgroundColor = backgroundColor;
    this.borderColor = borderColor;
    this.fill = fill;
};

function getToken() {
    var b = document.cookie.match('(^|;)\\s*bToken\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}