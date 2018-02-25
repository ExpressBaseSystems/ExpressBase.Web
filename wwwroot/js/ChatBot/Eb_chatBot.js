var Eb_chatBot = function (_solid, _appid, _themeColor, _botdpURL, ssurl) {
    this.EXPRESSbase_SOLUTION_ID = _solid;
    this.EXPRESSbase_APP_ID = _appid;
    this.ebbotThemeColor = _themeColor;
    this.botdpURL = 'url(' + _botdpURL + ')center center no-repeat';
    this.$chatCont = $('<div class="eb-chat-cont"></div>');
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
    this.initControls = new InitControls(this);
    this.typeDelay = 300;
    this.ChartCounter = 0;
    this.formsList = {};
    this.formsDict = {};
    this.formNames = [];
    this.curForm = {};
    this.formControls = [];
    this.formValues = {};
    this.airformValues = {};
    this.formValuesWithType = {}
    this.formFunctions = {};
    this.formFunctions.visibleIfs = {};
    this.editingCtrlName = null;
    this.lastCtrlIdx = 0;
    this.FB = null;
    this.FBResponse = {};
    this.ssurl = ssurl;


    this.AirpotObj = new Airport();


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
        $("body").on("click", "[name=contactSubmit]", this.contactSubmit);
        $("body").on("click", ".btn-box [for=form-opt]", this.startFormInteraction);
        $("body").on("click", ".btn-box [for=continueAsFBUser]", this.continueAsFBUser);
        $("body").on("click", ".btn-box [for=fblogin]", this.FBlogin);

        $("body").on("click", ".btn-box [for=bookaflight]", this.bookaflight);
        $("body").on("click", ".btn-box [for=rufrom]", this.rufrom);
        $("body").on("click", ".btn-box [for=near5]", this.near5);
        $("body").on("click", ".btn_book", this.btn_book);
        $("body").on("click", ".seatsubmit", this.seatsubmit);
        $("body").on("click", "#dtlsok", this.dtlsok);
        $("body").on("click", ".last", this.lastfn);

        $("body").on("click", ".card-btn-cont .btn", this.ctrlSend);
        $('.msg-inp').on("keyup", this.txtboxKeyup);

        $("body").on("keyup", "._country_search_input", this.portSearch);
        $("body").on("click", ".locDDitem", this.locDDClick);
        $("body").on("click", ".airCtrlSend", this.airCtrlSend);
        this.radioHTML = `<div class="airctrl-wraper">
        <div id="Duration" name="Duration" type="RadioGroup">
            <div>
                <input type="radio" id="Halfday" value="hd" name="Duration" checked="checked" > <span id="HalfdayLbl"> One way </span><br>
            </div>
            <div>
                <input type="radio" id="Fullday" value="fd" name="Duration"> <span id="FulldayLbl"> Round trip  </span><br>
            </div>
            <div>
                <input type="radio" id="Multipledays" value="md" name="Duration"> <span id="MultipledaysLbl"> Multi-city  </span><br>
            </div>
        </div>
    </div>`;
        this.placeHTML = `
<div class="airctrl-wraper"> 
<div class="_search_country_cont"> 
                <div class="_search_box">
                    <input type="text" name="airctrl"  placeholder="Airport" class="form-control _country_search_input"/>
                    <span class="_icon_search"><i class="glyphicon glyphicon-search"></i></span>
                </div>
                <div class="_search_box_res">
                </div>
                </div>
            </div>`;
        this.dateHTML = `
<div class="airctrl-wraper"> 
<div class="ctrl-wraper"> 
        <div class="input-group" style="width:100%;">
            <input id="DepartDT" for="departon" name="airctrl" data-ebtype="6" data-toggle="tooltip" title="" class="date" type="text" name="airctrl" autocomplete="on" tabindex="0" style="width:100%; background-color:#ffffff;color:#333333;display:inline-block; @fontStyle@ " required="" placeholder="" maxlength="10">
            <span class="input-group-addon" onclick="$('#DepartDT').focus().focus()"> <i id="DepartDTTglBtn" class="fa  fa-calendar" aria-hidden="true"></i> </span>
        </div></div></div>
`;
        this.psngrtypeHTML = `
<div class="airctrl-wraper">
    <div class="pgr-block">
        <pgrlabel>Adults</pgrlabel><br>
        <select class="adults">
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
        </select>
    </div>
    <div class="pgr-block">
        <pgrlabel>Children</pgrlabel><br>
        <select class="children">
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
        </select>
    </div>
    <div class="pgr-block">
        <pgrlabel>Infants</pgrlabel><br>
        <select class="infants">
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
    </div>
</div>`


        $("body").on("click", ".portclose", this.clearPortText);




        this.showDate();
    };

    this.lastfn = function (e) {
        var $e = $(e.target);
        $e.closest('.msgt').remove();
        this.$chatBox.append(`
            <div class="box1a msgt"> 
                <div class="payment_head">
                    Your Ticket has been booked  :)
                </div>
                </div>
</div>
`);
    }.bind(this)

    this.dtlsok = function (e) {
        var $e = $(e.target);
        $e.closest('.msgt').remove();
        this.$chatBox.append(`
            <div class="box1a msgt"> 
                <div class="payment_head">
                    Your estimated Amount <span>€ 63.67</span>
                </div>
                <div class="payment_body">
                    <div class="form-group">
                        <input type="text" class="form-control" value="Visa" placeholder="Card Type" />
                    </div>
                    <div class="form-group">
                        <input type="text" class="form-control"  value="1234567444898887" placeholder="Card Number" />
                    </div>
                    <div class="form-group">
                        <input type="text" class="form-control" value="${this.FBResponse.name}"   placeholder="Holder Name" />
                    </div>
                    <div class="form-group">
                        <input type="text" class="form-control"  value="10/20"  placeholder="Expiry Date" />
                    </div>
                    <div class="form-group">
                        <input type="text" class="form-control" placeholder="CVV" />
                    </div>
                    <div class="form-group">
                        <button class="btn btn-primary last" style="width:100%;">Confirm Payment</button>
                    </div>
                </div>
</div>
`);
        $('.eb-chatBox').scrollTop(99999999999);
    }.bind(this);

    this.seatsubmit = function (e) {
        var $e = $(e.target);
        $e.closest('.msgt').remove();
        this.$chatBox.append(`<div class="box1a msgt"> 
                <div class="payment_head">
                    Passenger Details
                </div>
                <div class="payment_body">
                    <div class="form-group">
                        <label>Name</label> <input class="form-control" value=${this.FBResponse.name}type="text"/>
                    </div>
                    <div class="form-group">
                        <label>Gender</label> <input name="kil" type="radio"/>Male <input name="kil"  type="radio"/>Female <input name="kil"  type="radio"/>other
                    </div>
                    <div class="form-group">
                        <label>Date of Birth</label> <input class="form-control" type="date"/>
                    </div>
                    <div class="form-group">
                        <label>Address</label> <textarea class="form-control"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Phone</label> <input class="form-control" type="phone"/>
                    </div>
                    <div class="form-group">
                        <button id="dtlsok"class="btn btn-primary" style="width:100%;">OK</button>
                    </div>
                </div>
</div>`);
        $('.eb-chatBox').scrollTop(99999999999);

    }.bind(this);

    this.btn_book = function (e) {
        var $e = $(e.target);
        var $btn = $(e.target).closest(".btn");
        $e.closest('.msg-cont').remove();
        this.$chatBox.append(`<div class="seat_book_card msgt"> 
                <div class="seat_book_list">

                </div>
                <div class="_notations">
                    <div><span class="not-seat-booked"></span><span>Booked</span></div>
                    <div><span class="not-seat-avail"></span><span>Available</span></div>
                    <div><span class="not-seat-restricted"></span><span>Restricted</span></div>
                </div>
                <button class="btn seatsubmit">Confirm</button>
            </div>`);
        $('.eb-chatBox').scrollTop(99999999999);
        this.ARchart = new AirResChart();
    }.bind(this);

    this.airCtrlSend = function (e) {
        var $btn = $(e.target).closest(".btn");
        var $inp = $btn.closest(".msg-wraper-bot").find("[name=airctrl]");
        var inpfor = $inp.attr("for");

        var val = $inp.val();

        var _for = $btn.attr("for");
        if (_for === "psngrtype") {
            inpfor = "passengertype";
            val = $(".adults").find(":selected").text();
            val = val + ", " + $(".children").find(":selected").text();
            val = val + ", " + $(".infants").find(":selected").text();
        }
        this.AirPostmenuClick(e, val);
        if (_for === "placefrom") {
            this.sendPlaceto();
            inpfor = "placefrom";
        }
        else if (_for === "placeto") {
            this.sendDeparton();
            inpfor = "placeto";
        }
        else if (_for === "psngrtype") {
            this.getFlightDtls();
        }
        else if (_for === "journytype") {
            this.journytype(e);
        }
        else if (_for === "departon") {
            this.sendPsngrtype();
            inpfor = "departon";
        }
        this.airformValues[inpfor] = val;

    }.bind(this);


    this.sendPsngrtype = function () {
        this.msgFromBot("Number of passengers ?");
        this.sendAirCtrl(this.psngrtypeHTML, "psngrtype");
    };

    this.sendPlaceFrom = function () {
        this.msgFromBot("Place From?");
        this.sendAirCtrl(this.placeHTML, "placefrom");
    };

    this.sendPlaceto = function () {
        this.msgFromBot("Place to?");
        this.sendAirCtrl(this.placeHTML, "placeto");
    };

    this.sendDeparton = function () {
        this.msgFromBot("Depart on ?");
        this.sendAirCtrl(this.dateHTML, "departon");
        this.initControls.Date("DepartDT");
    };

    this.bookaflight = function (e) {
        this.postmenuClick(e);
        if (this.CurFormIdx === 0) {
            this.msgFromBot("Journy type ?");
            this.sendAirCtrl(this.radioHTML, "journytype");
            this.airformValues["journytype"] = "oneway"
        }
    }.bind(this);

    this.rufrom = function (e) {
        var $btn = $(e.target).closest(".btn");
        this.AirPostmenuClick(e);
        var idx = $btn.index()
        if (idx === 0)
            this.airYes();
        else if (idx === 1)
            this.airNo5();
        else if (idx === 2)
            this.airLetMe();
    }.bind(this);

    this.airYes = function () {
        this.sendPlaceto();
        this.airformValues["placefrom"] = "Zurich-ZRH";
    }.bind(this);

    this.airNo5 = function () {
        this.QueryBtnOnly(this.AirpotObj.nearest5Airports, "near5");
    }.bind(this);

    this.near5 = function (e) {
        var $btn = $(e.target).closest(".btn");
        this.airformValues["placefrom"] = $btn.text();
        this.AirPostmenuClick(e);
        this.sendPlaceto();
    }.bind(this);

    this.journytype = function (e) {
        var $btn = $(e.target).closest(".btn");
        this.AirPostmenuClick(e);
        this.sendMsg("One way");
        this.Query(`Are you travelling from ${this.AirpotObj.nearestAirport} ?`, ["yes", "No, Show me nearest 5 Airports", "No, Let me choose"], "rufrom");
    }.bind(this);

    this.airLetMe = function () {
        this.sendPlaceFrom();
    }.bind(this);

    this.contactSubmit = function (e) {
        this.msgFromBot("Thank you.");
        this.authenticateAnon($("#anon_mail").val().trim(), $("#anon_phno").val().trim());
        $(e.target).closest('.msg-cont').remove();
    }.bind(this);


    this.authenticateAnon = function (email, phno) {
        this.showTypingAnim();
        {// REAL
            //$.post("../bote/AuthAndGetformlist",
            //    {
            //        "cid": this.EXPRESSbase_SOLUTION_ID,
            //        "appid": this.EXPRESSbase_APP_ID,
            //        "socialId": null,
            //        "wc": "bc",
            //        "anon_email": email,
            //        "anon_phno": phno
            //    }, function (result) {
            //        this.hideTypingAnim();
            //        if (result === null)
            //            this.authFailed();
            //        this.formsDict = result[1];
            //        this.bearerToken = result[0].bearerToken;
            //        this.refreshToken = result[0].refreshToken;
            //        this.formNames = Object.values(this.formsDict);
            //        this.AskWhatU();

            //        /////////////////////////////////////////////////
            //        //setTimeout(function () {
            //        //    //$(".btn-box .btn:last").click();
            //        //    $(".btn-box").find("[idx=4]").click();
            //        //}.bind(this), this.typeDelay * 2 + 100);
            //    }.bind(this));
        }
        this.StartAirTicketFlow()
    }.bind(this);

    this.AirPostmenuClick = function (e, reply) {
        var $e = $(e.target);
        if (reply === undefined)
            reply = $e.text().trim();
        $e.closest('.msg-cont').remove();
        this.sendMsg(reply);
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
        else
            this.collectContacts();
    }.bind(this);

    this.collectContacts = function () {
        this.msgFromBot("OK, No issues. Can you Please provide your contact Details ? so that i can understand you better.");
        this.msgFromBot($('<div class="contct-cont"><div class="contact-inp-wrap"><input id="anon_mail" type="email" class="plain-inp"><i class="fa fa-envelope-o" aria-hidden="true"></i></div><div class="contact-inp-wrap"><input id="anon_phno" type="tel" class="plain-inp"><i class="fa fa-phone" aria-hidden="true"></i></div><button name="contactSubmit" class="contactSubmit">Submit <i class="fa fa-chevron-right" aria-hidden="true"></i></button>'));
    };

    this.continueAsFBUser = function (e) {
        this.postmenuClick(e, "");
        if (this.CurFormIdx === 0)
            this.authenticate();
        else
            this.FB.logout(function (response) {
                this.msgFromBot("You are successfully logout from our App");
            }.bind(this));
    }.bind(this);

    this.startFormInteraction = function (e) {
        this.curRefid = $(e.target).attr("refid");
        this.curObjType = $(e.target).attr("obj-type");
        this.postmenuClick(e);
        this.getForm(this.curRefid);///////////////////
    }.bind(this);

    this.getForm = function (RefId) {
        this.showTypingAnim();
        if (!this.formsList[RefId]) {
            $.post("../Bote/GetCurForm", {
                "refreshToken": this.refreshToken,
                "bearerToken": this.bearerToken,
                "refid": RefId
            }, function (data) {
                this.hideTypingAnim();

                if (typeof data === "string") {
                    data = JSON.parse(data);
                    data.objType = data.ObjType;
                }


                this.formsList[RefId] = data;
                if (data.objType === "BotForm") {
                    this.curForm = data;
                    this.setFormControls();
                }
                else if (data.objType === "TableVisualization") {
                    data.BotCols = JSON.parse(data.BotCols);
                    data.BotData = JSON.parse(data.BotData);
                    this.curTblViz = data;
                    this.showTblViz();
                }
                else if (data.objType === "ChartVisualization") {
                    this.curChartViz = data;
                    this.showChartViz();
                }
            }.bind(this));
        }
        else {
            this.hideTypingAnim();
            this.curForm = this.formsList[RefId];

            var data = this.formsList[RefId];
            if (data.objType === "BotForm")
                this.curForm = data;
            else if (data.objType === "TableVisualization")
                this.curTblViz = data;
            else if (data.objType === "ChartVisualization")
                this.showChartViz();//////////////////////////////////////////////////////////////////////////////////

            this.setFormControls();
        }
    }

    this.showTblViz = function (e) {
        var $tableCont = $('<div class="table-cont">' + this.curTblViz.BareControlHtml + '</div>');
        this.$chatBox.append($tableCont.hide());
        this.showTypingAnim();
        $(`#${this.curTblViz.EbSid}`).DataTable({
            processing: true,
            serverSide: false,
            dom: 'rt',
            columns: this.curTblViz.BotCols,
            data: this.curTblViz.BotData,
            initComplete: function () {
                this.hideTypingAnim();
                this.AskWhatU();
                $tableCont.show(100);
            }.bind(this)
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
        });
    }.bind(this);

    this.showChartViz = function (e) {
        this.showTypingAnim();
        $.ajax({
            type: 'POST',
            url: 'http://localhost:8000/ds/data/' + this.curChartViz.DataSourceRefId,
            data: { draw: 1, RefId: this.curChartViz.DataSourceRefId, Start: 0, Length: 50, TFilters: [] },
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
            }.bind(this),
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
            datasets: this.dataset,
        };
        this.animateOPtions = (this.curChartViz.ShowValue) ? new animateObj(0) : false;
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
                        display: (this.type !== "pie") ? true : false
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
                mode: 'x',
            },
            pan: {
                enabled: true,
                mode: 'x',
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
        var canvas = document.getElementById(this.curChartViz.EbSid + this.ChartCounter);
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
        $('.eb-chatBox').scrollTop(99999999999);
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
            //setTimeout(function () {
            //    $(".btn-box").find("[idx=0]").click();
            //}.bind(this), this.typeDelay * 2 + 100);
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
        var Options = this.getButtons(OptArr, For, ids);
        this.msgFromBot($('<div class="btn-box" >' + Options + '</div>'));

    };


    this.QueryBtnOnly = function (OptArr, For, ids) {
        var Options = this.getButtons(OptArr, For, ids);
        this.msgFromBot($('<div class="btn-box" >' + Options + '</div>'));
    };


    this.getButtons = function (OptArr, For, ids) {
        var Html = '';
        $.each(OptArr, function (i, opt) {
            Html += `<button for="${For}" class="btn" idx="${i}" refid="${(ids !== undefined) ? ids[i] : i}">${opt} </button>`;
        });
        return Html;
    };

    this.setFormControls = function () {
        this.formControls = [];
        $.each(this.curForm.controls, function (i, control) {
            if (control.visibleIf.trim())//if visibleIf is Not empty
                this.formFunctions.visibleIfs[control.ebSid] = new Function("form", atob(control.visibleIf));
            this.formControls.push($(`<div class='ctrl-wraper'>${control.bareControlHtml}</div>`));
        }.bind(this));
        this.getControl(0);
    }.bind(this);

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
            inpVal = $(`input[name=${this.curCtrl.name}]:checked`).val()
        }
        else
            inpVal = $input.val();
        return inpVal.trim();
    }

    this.ctrlSend = function (e) {
        console.log("ctrlSend()");
        var id = this.editingCtrlName || this.curCtrl.name;
        var $btn = $(e.target).closest(".btn");
        var $msgDiv = $btn.closest('.msg-cont');
        var next_idx = parseInt($btn.attr('idx')) + 1;
        this.lastCtrlIdx = (next_idx > this.lastCtrlIdx) ? next_idx : this.lastCtrlIdx;
        var $input = $('#' + id);
        //$input.off("blur").on("blur", function () { $btn.click() });//when press Tab key send
        this.lastval = this.getValue($input);
        if (this.curCtrl.objType === "ImageUploader") {
            this.replyAsImage($msgDiv, $input[0], next_idx);
            this.formValues[id] = this.lastval;// last value set from outer fn
            this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.ebDbType];
        }
        else if (this.curCtrl.objType === "RadioGroup") {
            this.sendCtrlAfter($msgDiv.hide(), $('#' + id).val() + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
            this.formValues[id] = this.lastval;
            this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.ebDbType];
            this.callGetControl(this.lastCtrlIdx);
        }
        else {
            if (this.curCtrl.objType === "Cards") {
                this.lastval = $btn.closest(".card-cont").find(".card-label").text();
            }
            else {
                this.lastval = this.lastval || $('#' + id).val();
            }
            this.sendCtrlAfter($msgDiv.hide(), this.lastval + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
            this.formValues[id] = this.lastval;
            this.formValuesWithType[id] = [this.formValues[id], this.curCtrl.ebDbType];
            this.callGetControl(this.lastCtrlIdx);
        }
        this.editingCtrlName = null;
        this.lastval = null;
    }.bind(this);

    this.callGetControl = function (idx) {
        if (idx !== this.formControls.length) {
            if (!this.formValues[this.editingCtrlName]) {
                if (!this.formFunctions.visibleIfs[this.curForm.controls[idx].ebSid] || this.formFunctions.visibleIfs[this.curForm.controls[idx].ebSid](this.formValues))//checks isVisible or no isVisible defined
                    this.getControl(idx);
                else {
                    this.lastCtrlIdx++;
                    this.callGetControl(idx + 1);
                }
            }
            else
                this.enableCtrledit(idx);
        }
        else {
            if ($("[name=formsubmit]").length === 0) {
                this.msgFromBot('Are you sure? Can I submit?');
                this.msgFromBot($('<div class="btn-box"><button name="formsubmit" class="btn">Sure</button><button class="btn">Cancel</button></div>'));
            }
            this.enableCtrledit();
        }
    };

    this.getControl = function (idx) {
        if (idx === this.formControls.length)
            return;
        var $CtrlCont;
        var $ctrlCont = $(this.formControls[idx][0].outerHTML);
        var control = this.formControls[idx][0].outerHTML;
        this.curCtrl = this.curForm.controls[idx || 0];
        if (this.curCtrl && (this.curCtrl.objType === "Cards" || this.curCtrl.objType === "Locations"))
            $CtrlCont = $(control);
        else
            $CtrlCont = $(this.wrapIn_chat_ctrl_cont(idx, control));
        var lablel = this.curCtrl.label + ' ?';
        if (this.curCtrl.helpText)
            lablel += ` (${this.curCtrl.helpText})`;
        this.msgFromBot(lablel);
        this.msgFromBot($CtrlCont);
    }.bind(this);

    this.wrapIn_chat_ctrl_cont = function (idx, control) {
        return '<div class="chat-ctrl-cont">' + control + '<button class="btn" idx=' + idx + ' name="ctrlsend"><i class="fa fa-paper-plane-o" aria-hidden="true"></i></button></div>';
    };

    this.replyAsImage = function ($prevMsg, input, idx) {
        console.log("replyAsImage()");
        var ctrlname = this.curCtrl.name;
        var fname = input.files[0].name;
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
        var $imgtag = $(`<div class="img-box" for="${ctrlname}"><div class="img-loader"></div><span class="img-edit"  idx="${this.curForm.controls.indexOf(this.curCtrl)}"  for="${ctrlname}" name="ctrledit"><i class="fa fa-pencil" aria-hidden="true"></i></span><img src="${path}" alt="amal face" width="100%"><div class="file-name">${filename}</div>${this.getTime()}</div>`);
        $msg.find('.msg-wraper-user').append($imgtag);
        $msg.insertAfter($prevMsg);
        $('.eb-chatBox').scrollTop(99999999999);
    };

    this.uploadImage = function (url, ctrlname, idx) {
        console.log("uploadImage");
        var URL = url.substring(url.indexOf(",/") + 1);
        $.post("../Bote/UploadImageOrginal", {
            'base64': URL,
            "filename": ctrlname,
            "refreshToken": this.refreshToken,
            "bearerToken": this.bearerToken
        }).done(function (result) {
            $(`[for=${ctrlname}] .img-loader:last`).hide(100);
            this.callGetControl(idx);
            this.lastval = result;
        }.bind(this))
    };

    this.ctrlEdit = function (e) {
        var $btn = $(e.target).closest("span");
        var idx = $btn.attr('idx');
        $('.msg-cont-bot [idx=' + idx + ']').closest('.msg-cont').show(200);
        $btn.closest('.msg-cont').remove();
        this.editingCtrlName = this.curForm.controls[idx].name;
        $("#" + this.editingCtrlName).click().select();
        this.disableCtrledit();
    }.bind(this);

    this.sendMsg = function (msg) {
        if (!msg)
            return;
        var $msg = this.$userMsgBox.clone();
        $msg.find('.msg-wraper-user').text(msg).append(this.getTime());
        this.$chatBox.append($msg);
        $('.eb-chatBox').scrollTop(99999999999);
    };
    this.sendAirCtrl = function (msg, _for) {
        var $ctrl = $(msg);
        $ctrl.find("[name=airctrl]").attr("for", _for);
        var $msg = this.$botMsgBox.clone();
        $msg.find('.msg-wraper-bot').append(msg).append('<button class="btn airCtrlSend" for="' + _for + '"><i class="fa fa-paper-plane-o" aria-hidden="true"></i></button>');
        this.$chatBox.append($msg);

        $msg.find(".msg-wraper-bot").css("padding-right", "10px").css("width", "85%");
        $('.eb-chatBox').scrollTop(99999999999);
    };

    this.sendCtrl = function (msg) {
        var $msg = this.$userMsgBox.clone();
        $msg.find('.msg-wraper-user').append(msg).append(this.getTime());
        this.$chatBox.append($msg);
        $('.eb-chatBox').scrollTop(99999999999);
    };

    this.sendCtrlAfter = function ($prevMsg, msg) {
        var $msg = this.$userMsgBox.clone();
        $msg.find('.msg-wraper-user').html(msg).append(this.getTime());;
        $msg.insertAfter($prevMsg);
        $('.eb-chatBox').scrollTop(99999999999);
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

    this.msgFromBot = function (msg) {
        var $msg = this.$botMsgBox.clone();
        this.$chatBox.append($msg);
        this.startTypingAnim($msg);
        if (this.ready) {
            setTimeout(function () {
                if (msg instanceof jQuery) {
                    $msg.find('.bot-icon').remove();
                    $msg.find('.msg-wraper-bot').css("border", "none").css("background-color", "transparent").css("width", "99%").html(msg);
                    $msg.find(".msg-wraper-bot").css("padding-right", "3px");

                    if (this.curCtrl && (this.curCtrl.objType === "Cards" || this.curCtrl.objType === "Locations")) {
                        $msg.find(".ctrl-wraper").css("width", "100%").css("border", 'none');
                        $msg.find(".msg-wraper-bot").css("margin-left", "12px");
                    }

                    if (this.curCtrl && $('#' + this.curCtrl.name).length === 1 && ($msg.find(".ctrl-wraper").length === 1)) {
                        this.loadcontrol();
                    }
                    if (this.curForm)
                        $msg.attr("form", this.curForm.name);
                }
                else
                    $msg.find('.msg-wraper-bot').text(msg).append(this.getTime());
                this.ready = true;
            }.bind(this), this.typeDelay);
            this.ready = false;
        }
        else {
            $msg.remove();
            setTimeout(function () {
                this.msgFromBot(msg);
            }.bind(this), this.typeDelay + 1);
        }
        $('.eb-chatBox').scrollTop(99999999999);
    }.bind(this);

    //load control script
    this.loadcontrol = function () {
        if (!this.curCtrl)
            return;
        if (this.initControls[this.curCtrl.objType] !== undefined)
            this.initControls[this.curCtrl.objType](this.curCtrl);
    }.bind(this);

    this.formSubmit = function (e) {
        var $btn = $(e.target).closest(".btn");
        this.sendMsg($btn.text());
        $('.msg-wraper-user [name=ctrledit]').remove();
        $btn.closest(".msg-cont").remove();
        this.showConfirm();
    }.bind(this);

    this.showConfirm = function () {
        this.formFunctions.visibleIfs = {};
        this.lastCtrlIdx = 0;
        $(`[form=${this.curForm.name}]`).remove();
        var msg = `Your ${this.curForm.name} application submitted successfully`;
        this.msgFromBot(msg);
        this.DataCollection();
        this.AskWhatU();
    }.bind(this);

    this.DataCollection = function () {
        $.ajax({
            type: "POST",
            url: this.ssurl + "/bots",
            data: {
                TableName: this.curForm.name, Fields: JSON.stringify(this.formValuesWithType)
            },
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + this.bearerToken);
            }.bind(this),
            success: this.ajaxsuccess.bind(this),
        });
        this.formValues = {};
    };

    this.ajaxsuccess = function () {

    };

    this.AskWhatU = function () {
        this.Query("What do you want to do ?", this.formNames, "form-opt", Object.keys(this.formsDict));
    };

    this.showDate = function () {
        this.$chatBox.append(`<div class="chat-date"><span>13-Nov-17</span></div>`);
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
        {
            //$.post("../bote/AuthAndGetformlist",
            //    {
            //        "cid": this.EXPRESSbase_SOLUTION_ID,
            //        "appid": this.EXPRESSbase_APP_ID,
            //        "socialId": this.FBResponse.id,
            //        "wc": "bc",
            //        "anon_email": null,
            //        "anon_phno": null
            //    }, function (result) {
            //        this.hideTypingAnim();
            //        if (result === null)
            //            this.authFailed();
            //        this.formsDict = result[1];
            //        this.bearerToken = result[0].bearerToken;
            //        this.refreshToken = result[0].refreshToken;
            //        this.formNames = Object.values(this.formsDict);
            //        this.AskWhatU();

            //        /////////////////////////////////////////////////Form click
            //        setTimeout(function () {
            //            //$(".btn-box .btn:last").click();
            //            $(".btn-box").find("[idx=15]").click();
            //        }.bind(this), this.typeDelay * 2 + 100);
            //    }.bind(this));
        }

        this.StartAirTicketFlow()
    }.bind(this);

    this.FBLogined = function () {
        this.FB.api('/me?fields=id,name,picture', function (response) {
            this.FBResponse = response;
            this.$userMsgBox.find(".bot-icon-user").css('background', `url(${this.FBResponse.picture.data.url})center center no-repeat`);
            this.greetings();
        }.bind(this));
    }.bind(this);

    this.FBNotLogined = function () {
        this.isAlreadylogined = false;
        this.Query("Hello I am EBbot, Nice to meet you. Do you mind loging into facebook?", ["Login to facebook", "No, Sorry"], "fblogin");
    }.bind(this);

    this.login2FB = function () {
        this.FB.login(function (response) {
            if (response.authResponse) {
                statusChangeCallback(response);
            } else {
                this.collectContacts();
            }
        }.bind(this), { scope: 'email' });
    }

    this.StartAirTicketFlow = function () {
        setTimeout(function () {
            this.hideTypingAnim();
            //this.AskWhatU();
            this.QueryBtnOnly(["Book a flight ticket"], "bookaflight");
        }.bind(this), this.typeDelay);
    };

    this.locDDClick = function (e) {
        $("._country_search_input").val(e.target.innerText);
        e.target.style.backgroundColor = "#3333aa"
        $("._search_box_res").hide(100);
        $("._country_search_input").siblings("span").children("i").removeClass("glyphicon glyphicon-search");
        $("._country_search_input").siblings("span").children("i").addClass("fa fa-close portclose");
    };

    this.portSearch = function func(e) {
        $targetval = $(e.target).val();
        if (e.keyCode === 38 || e.keyCode === 40)
            this.modifyPort(e.keyCode);
        else if (e.keyCode === 13) {
            var actElement = $('._search_box_res').children(".xx");
            $("._country_search_input").val(actElement.text());
            $("._search_box_res").hide(100);
            $("._country_search_input").siblings("span").children("i").removeClass("glyphicon glyphicon-search");
            $("._country_search_input").siblings("span").children("i").addClass("fa fa-close portclose");
        }
        else {
            $('._search_box_res').empty().show(100);
            if ($targetval !== "") {
                for (index = 0; index < PortList.length; index++) {
                    if (PortList[index].name !== null) {
                        var airname = PortList[index].name.toLowerCase();
                        var aircode = PortList[index].iatacode.toLowerCase();
                        if (airname.startsWith($targetval.toLowerCase()) || aircode.startsWith($targetval.toLowerCase())) {
                            $('._search_box_res').append('<div tabindex="0" class="locDDitem">' + PortList[index].name + "-" + PortList[index].iatacode + "</div>");
                        }
                    }
                }
                $('._search_box_res div:eq(0)').addClass("xx");
                if (!$("._country_search_input").siblings("span").children("i").hasClass("glyphicon")) {
                    $("._country_search_input").siblings("span").children("i").removeClass("fa fa-close portclose");
                    $("._country_search_input").siblings("span").children("i").addClass("glyphicon glyphicon-search");
                }

            }

        }
    }.bind(this);

    this.modifyPort = function (keyCode, val) {
        var actElement = $('._search_box_res').children(".xx");
        if (keyCode === 38 && actElement.prev('div').length > 0) {
            actElement.removeClass("xx");
            currentElement = actElement.prev('div').addClass("xx");
        }
        else if (keyCode === 40 && actElement.next('div').length > 0) {
            actElement.removeClass("xx");
            currentElement = actElement.next('div').addClass("xx");
        }
    };

    this.clearPortText = function () {
        $("._country_search_input").val("");
        if (!$("._country_search_input").siblings("span").children("i").hasClass("glyphicon")) {
            $("._country_search_input").siblings("span").children("i").removeClass("fa fa-close portclose");
            $("._country_search_input").siblings("span").children("i").addClass("glyphicon glyphicon-search");
        }
    };

    this.getFlightDtls = function () {
        this.showTypingAnim();
        $.ajax({
            type: "POST",
            url: "../NDC/AirShoppingSearchAsync",
            data: { from: (this.airformValues["placefrom"]).split("-")[1], to: (this.airformValues['placeto']).split("-")[1], date: (this.airformValues['departon']).replace("/", "-").replace("/", "-") },
            success: this.getFlightDtlsSuccess.bind(this)
        });
    }

    this.getFlightDtlsSuccess = function (data) {
        this.hideTypingAnim();
        this.$chatBox.append("<div id='draw' class='airoffers'></div>");
        DrawInit(JSON.parse(data[0]), JSON.parse(data[1]), "draw");
    }


    this.init();
};




var AirResChart = function () {



    this.xml = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <ns2:SeatAvailabilityRS xmlns:ns2="http://www.iata.org/IATA/EDIST" xmlns:ns3="http://www.ibsplc.com/iFlyRes/simpleTypes" EchoToken="6546" TimeStamp="2018-02-24T13:37:08.518Z" Version="33" TransactionIdentifier="3">
            <ns2:Document>
                <ns2:Name>NDC</ns2:Name>
                <ns2:ReferenceVersion>15.2</ns2:ReferenceVersion>
            </ns2:Document>
            <ns2:Success/>
            <ns2:Processing/>
            <ns2:Flights>
                <ns2:FlightSegmentReferences>XQ_SEG_1501595748315</ns2:FlightSegmentReferences>
                <ns2:Cabin UpperDeckInd="false">
                    <ns2:Code>Y</ns2:Code>
                    <ns2:SeatDisplay>
                        <ns2:SeatDisplayKey>XQ_SEATDISPLAY_1518365975378</ns2:SeatDisplayKey>
                        <ns2:Columns>A</ns2:Columns>
                        <ns2:Columns>B</ns2:Columns>
                        <ns2:Columns>C</ns2:Columns>
                        <ns2:Columns>D</ns2:Columns>
                        <ns2:Columns>E</ns2:Columns>
                        <ns2:Columns>F</ns2:Columns>
                        <ns2:Rows>
                            <ns2:First>1</ns2:First>
                            <ns2:Last>34</ns2:Last>
                        </ns2:Rows>
                        <ns2:Component>
                            <ns2:Locations>
                                <ns2:Location>
                                    <ns2:Space>
                                        <ns2:RowRange>
                                            <ns2:Begin>1</ns2:Begin>
                                            <ns2:End>1</ns2:End>
                                        </ns2:RowRange>
                                        <ns2:ColumnRange>
                                            <ns2:Begin>C</ns2:Begin>
                                        </ns2:ColumnRange>
                                    </ns2:Space>
                                </ns2:Location>
                            </ns2:Locations>
                            <ns2:Type>
                                <ns2:Code>D</ns2:Code>
                            </ns2:Type>
                        </ns2:Component>
                        <ns2:Component>
                            <ns2:Locations>
                                <ns2:Location>
                                    <ns2:Space>
                                        <ns2:RowRange>
                                            <ns2:Begin>1</ns2:Begin>
                                            <ns2:End>1</ns2:End>
                                        </ns2:RowRange>
                                        <ns2:ColumnRange>
                                            <ns2:Begin>A</ns2:Begin>
                                        </ns2:ColumnRange>
                                    </ns2:Space>
                                </ns2:Location>
                            </ns2:Locations>
                            <ns2:Type>
                                <ns2:Code>D</ns2:Code>
                            </ns2:Type>
                        </ns2:Component>
                        <ns2:Component>
                            <ns2:Locations>
                                <ns2:Location/>
                            </ns2:Locations>
                            <ns2:Type>
                                <ns2:Code>702</ns2:Code>
                            </ns2:Type>
                        </ns2:Component>
                        <ns2:Component>
                            <ns2:Locations>
                                <ns2:Location>
                                    <ns2:Space>
                                        <ns2:RowRange>
                                            <ns2:Begin>34</ns2:Begin>
                                            <ns2:End>34</ns2:End>
                                        </ns2:RowRange>
                                        <ns2:ColumnRange>
                                            <ns2:Begin>A</ns2:Begin>
                                        </ns2:ColumnRange>
                                    </ns2:Space>
                                </ns2:Location>
                            </ns2:Locations>
                            <ns2:Type>
                                <ns2:Code>D</ns2:Code>
                            </ns2:Type>
                        </ns2:Component>
                        <ns2:Component>
                            <ns2:Locations>
                                <ns2:Location>
                                    <ns2:Space>
                                        <ns2:RowRange>
                                            <ns2:Begin>34</ns2:Begin>
                                            <ns2:End>34</ns2:End>
                                        </ns2:RowRange>
                                        <ns2:ColumnRange>
                                            <ns2:Begin>F</ns2:Begin>
                                        </ns2:ColumnRange>
                                    </ns2:Space>
                                </ns2:Location>
                            </ns2:Locations>
                            <ns2:Type>
                                <ns2:Code>D</ns2:Code>
                            </ns2:Type>
                        </ns2:Component>
                        <ns2:Component>
                            <ns2:Locations>
                                <ns2:Location/>
                            </ns2:Locations>
                            <ns2:Type>
                                <ns2:Code>702</ns2:Code>
                            </ns2:Type>
                        </ns2:Component>
                        <ns2:Component>
                            <ns2:Locations>
                                <ns2:Location/>
                            </ns2:Locations>
                            <ns2:Type>
                                <ns2:Code>702</ns2:Code>
                            </ns2:Type>
                        </ns2:Component>
                        <ns2:Component>
                            <ns2:Locations>
                                <ns2:Location/>
                            </ns2:Locations>
                            <ns2:Type>
                                <ns2:Code>702</ns2:Code>
                            </ns2:Type>
                        </ns2:Component>
                        <ns2:CabinType UpperDeckInd="false">
                            <ns2:Code>Y</ns2:Code>
                            <ns2:Name>ECONOMY</ns2:Name>
                        </ns2:CabinType>
                    </ns2:SeatDisplay>
                    <ns2:SeatReference>XQ_SEAT1A_1518365975380</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT1B_1518365975339</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT1C_1518365975340</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT2A_1518365975342</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT3A_1518365975328</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT4A_1518365975330</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT5A_1518365975332</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT6A_1518365975334</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT7A_1518365975352</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT8A_1518365975354</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT9A_1518365975356</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT10A_1518365975358</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT11A_1518365975344</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT12A_1518365975346</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT2B_1518365975348</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT3B_1518365975350</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT4B_1518365975304</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT5B_1518365975306</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT6B_1518365975308</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT7B_1518365975310</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT8B_1518365975296</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT9B_1518365975298</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT10B_1518365975300</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT11B_1518365975302</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT12B_1518365975320</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT2C_1518365975322</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT3C_1518365975324</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT4C_1518365975326</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT5C_1518365975312</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT6C_1518365975314</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT7C_1518365975316</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT8C_1518365975318</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT9C_1518365974760</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT10C_1518365974762</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT11C_1518365974764</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT12C_1518365974766</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT2D_1518365974752</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT3D_1518365974754</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT4D_1518365974756</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT5D_1518365974758</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT6D_1518365974776</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT7D_1518365974778</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT8D_1518365974780</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT9D_1518365974782</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT10D_1518365974768</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT11D_1518365974770</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT12D_1518365974772</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT2E_1518365974774</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT3E_1518365974728</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT4E_1518365974730</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT5E_1518365974732</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT6E_1518365974734</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT7E_1518365974720</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT8E_1518365974722</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT9E_1518365974724</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT10E_1518365974726</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT11E_1518365974744</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT12E_1518365974746</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT2F_1518365974748</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT3F_1518365974750</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT4F_1518365974736</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT5F_1518365974738</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT6F_1518365974740</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT7F_1518365974742</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT8F_1518365974696</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT9F_1518365974698</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT10F_1518365974700</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT11F_1518365974702</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT12F_1518365974688</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT14A_1518365974690</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT15A_1518365974692</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT16A_1518365974694</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT14B_1518365974712</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT15B_1518365974714</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT16B_1518365974716</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT14C_1518365974718</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT15C_1518365974704</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT16C_1518365974709</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT14D_1518365974711</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT15D_1518365974665</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT16D_1518365974667</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT14E_1518365974669</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT15E_1518365974671</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT16E_1518365974657</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT14F_1518365974659</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT15F_1518365974661</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT16F_1518365974663</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT18A_1518365974681</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT19A_1518365974683</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT20A_1518365974685</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT21A_1518365974687</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT22A_1518365974673</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT23A_1518365974675</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT24A_1518365974677</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT25A_1518365974679</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT26A_1518365974633</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT27A_1518365974635</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT28A_1518365974637</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT29A_1518365974639</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT30A_1518365974625</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT31A_1518365974627</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT32A_1518365974629</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT33A_1518365974631</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT34A_1518365974649</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT18B_1518365974651</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT19B_1518365974653</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT20B_1518365974655</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT21B_1518365974641</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT22B_1518365974643</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT23B_1518365974645</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT24B_1518365974647</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT25B_1518365974601</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT26B_1518365974603</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT27B_1518365974605</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT28B_1518365974607</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT29B_1518365974593</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT30B_1518365974595</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT31B_1518365974597</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT32B_1518365974599</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT33B_1518365974617</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT34B_1518365974619</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT18C_1518365974621</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT19C_1518365974623</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT20C_1518365974609</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT21C_1518365974611</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT22C_1518365974613</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT23C_1518365974615</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT24C_1518365974569</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT25C_1518365974571</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT26C_1518365974573</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT27C_1518365974575</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT28C_1518365974561</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT29C_1518365974563</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT30C_1518365974565</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT31C_1518365974567</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT32C_1518365974585</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT33C_1518365974587</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT34C_1518365974589</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT18D_1518365974591</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT19D_1518365974577</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT20D_1518365974579</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT21D_1518365974581</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT22D_1518365974583</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT23D_1518365974537</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT24D_1518365974539</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT25D_1518365974541</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT26D_1518365974543</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT27D_1518365974529</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT28D_1518365974531</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT29D_1518365974533</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT30D_1518365974535</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT31D_1518365974553</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT32D_1518365974555</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT33D_1518365974557</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT34D_1518365974559</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT18E_1518365974545</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT19E_1518365974547</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT20E_1518365974549</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT21E_1518365974551</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT22E_1518365975017</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT23E_1518365975019</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT24E_1518365975021</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT25E_1518365975023</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT26E_1518365975009</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT27E_1518365975011</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT28E_1518365975013</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT29E_1518365975015</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT30E_1518365975033</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT31E_1518365975035</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT32E_1518365975037</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT33E_1518365975039</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT34E_1518365975025</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT18F_1518365975027</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT19F_1518365975029</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT20F_1518365975031</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT21F_1518365974985</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT22F_1518365974987</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT23F_1518365974989</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT24F_1518365974991</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT25F_1518365974977</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT26F_1518365974979</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT27F_1518365974981</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT28F_1518365974983</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT29F_1518365975001</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT30F_1518365975003</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT31F_1518365975005</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT32F_1518365975007</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT33F_1518365974993</ns2:SeatReference>
                    <ns2:SeatReference>XQ_SEAT34F_1518365974995</ns2:SeatReference>
                </ns2:Cabin>
            </ns2:Flights>
            <ns2:Services>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975383">
                    <ns2:Name>Extra Legroom</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>XLEG</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Extra Legroom</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">8.510</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">7.210</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">1.300</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975338">
                    <ns2:Name>Extra Legroom</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>XLEG</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Extra Legroom</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">8.510</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">7.210</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">1.300</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975343">
                    <ns2:Name>Extra Legroom</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>XLEG</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Extra Legroom</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">8.510</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">7.210</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">1.300</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975329">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975331">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975333">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975335">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975353">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975355">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975357">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975359">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975345">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975347">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975349">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975351">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975305">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975307">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975309">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975311">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975297">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975299">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975301">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975303">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975321">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975323">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975325">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975327">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975313">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975315">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975317">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975319">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974761">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974763">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974765">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974767">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974753">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974755">
                    <ns2:Name>Extra Legroom</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>XLEG</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Extra Legroom</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">8.510</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">7.210</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">1.300</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974757">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974759">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974777">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974779">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974781">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974783">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974769">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974771">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974773">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974775">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974729">
                    <ns2:Name>Extra Legroom</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>XLEG</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Extra Legroom</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">8.510</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">7.210</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">1.300</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974731">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974733">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974735">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974721">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974723">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974725">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974727">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974745">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974747">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974749">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974751">
                    <ns2:Name>Extra Legroom</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>XLEG</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Extra Legroom</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">8.510</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">7.210</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">1.300</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974737">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974739">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974741">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974743">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974697">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974699">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974701">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974703">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974689">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974691">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974693">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974695">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974713">
                    <ns2:Name>Extra Legroom</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>XLEG</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Extra Legroom</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">8.510</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">7.210</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">1.300</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974715">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974717">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974719">
                    <ns2:Name>Extra Legroom</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>XLEG</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Extra Legroom</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">8.510</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">7.210</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">1.300</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974705">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974707">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974708">
                    <ns2:Name>Extra Legroom</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>XLEG</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Extra Legroom</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">8.510</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">7.210</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">1.300</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974710">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974664">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974666">
                    <ns2:Name>Extra Legroom</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>XLEG</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Extra Legroom</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">8.510</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">7.210</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">1.300</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974668">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974670">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974656">
                    <ns2:Name>Extra Legroom</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>XLEG</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Extra Legroom</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">8.510</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">7.210</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">1.300</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974658">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974660">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974662">
                    <ns2:Name>Extra Legroom</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>XLEG</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Extra Legroom</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">8.510</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">7.210</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">1.300</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974680">
                    <ns2:Name>Extra Legroom</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>XLEG</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Extra Legroom</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">8.510</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">7.210</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">1.300</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974682">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974684">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974686">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974672">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974674">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974676">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974678">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974632">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974634">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974636">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974638">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974624">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974626">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974628">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974630">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974648">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974650">
                    <ns2:Name>Extra Legroom</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>XLEG</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Extra Legroom</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">8.510</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">7.210</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">1.300</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974652">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974654">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974640">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974642">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974644">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974646">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974600">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974602">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974604">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974606">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974592">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974594">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974596">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974598">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974616">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974618">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974620">
                    <ns2:Name>Extra Legroom</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>XLEG</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Extra Legroom</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">8.510</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">7.210</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">1.300</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974622">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974608">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974610">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974612">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974614">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974568">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974570">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974572">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974574">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974560">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974562">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974564">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974566">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974584">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974586">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974588">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974590">
                    <ns2:Name>Extra Legroom</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>XLEG</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Extra Legroom</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">8.510</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">7.210</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">1.300</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974576">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974578">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974580">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974582">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974536">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974538">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974540">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974542">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974528">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974530">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974532">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974534">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974552">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974554">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974556">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974558">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974544">
                    <ns2:Name>Extra Legroom</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>XLEG</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Extra Legroom</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">8.510</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">7.210</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">1.300</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974546">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974548">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974550">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975016">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975018">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975020">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975022">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975008">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975010">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975012">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975014">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975032">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975034">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975036">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975038">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975024">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975026">
                    <ns2:Name>Extra Legroom</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>XLEG</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Extra Legroom</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">8.510</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">7.210</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">1.300</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975028">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975030">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974984">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974986">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974988">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974990">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974976">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974978">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974980">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974982">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975000">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975002">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975004">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365975006">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974992">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
                <ns2:Service ObjectKey="XQ_SEATSSR_1518365974994">
                    <ns2:Name>Standard Seat</ns2:Name>
                    <ns2:Encoding>
                        <ns2:Code>STRD</ns2:Code>
                    </ns2:Encoding>
                    <ns2:Descriptions>
                        <ns2:Description>
                            <ns2:Text>Standard Seats</ns2:Text>
                            <ns2:Application>DESCRIPTION</ns2:Application>
                        </ns2:Description>
                    </ns2:Descriptions>
                    <ns2:Price>
                        <ns2:Total Code="EUR">2.120</ns2:Total>
                        <ns2:Details>
                            <ns2:Detail>
                                <ns2:Amount Code="EUR">1.800</ns2:Amount>
                            </ns2:Detail>
                        </ns2:Details>
                        <ns2:Taxes>
                            <ns2:Breakdown>
                                <ns2:Tax refs="XQ_TAX_1518365975336">
                                    <ns2:Amount Code="EUR">0.320</ns2:Amount>
                                    <ns2:Nation>TR</ns2:Nation>
                                    <ns2:TaxCode>VT</ns2:TaxCode>
                                    <ns2:TaxType>TAX</ns2:TaxType>
                                </ns2:Tax>
                            </ns2:Breakdown>
                        </ns2:Taxes>
                        <ns2:PassengerReferences>XQ_PAX_1518365975337 XQ_PAX_1518365975382</ns2:PassengerReferences>
                    </ns2:Price>
                </ns2:Service>
            </ns2:Services>
            <ns2:DataLists>
                <ns2:AnonymousTravelerList>
                    <ns2:AnonymousTraveler ObjectKey="XQ_PAX_1518365975382">
                        <ns2:PTC Quantity="1">CHD</ns2:PTC>
                    </ns2:AnonymousTraveler>
                    <ns2:AnonymousTraveler ObjectKey="XQ_PAX_1518365975337">
                        <ns2:PTC Quantity="1">ADT</ns2:PTC>
                    </ns2:AnonymousTraveler>
                </ns2:AnonymousTravelerList>
                <ns2:FlightSegmentList>
                    <ns2:FlightSegment SegmentKey="XQ_SEG_1501595748315" refs="XQ_OD_1">
                        <ns2:Departure>
                            <ns2:AirportCode>ADA</ns2:AirportCode>
                            <ns2:Date>2017-08-30Z</ns2:Date>
                        </ns2:Departure>
                        <ns2:Arrival>
                            <ns2:AirportCode>AYT</ns2:AirportCode>
                            <ns2:Date>2017-08-30Z</ns2:Date>
                        </ns2:Arrival>
                        <ns2:MarketingCarrier>
                            <ns2:AirlineID>XQ</ns2:AirlineID>
                            <ns2:FlightNumber>7711</ns2:FlightNumber>
                        </ns2:MarketingCarrier>
                    </ns2:FlightSegment>
                </ns2:FlightSegmentList>
                <ns2:OriginDestinationList>
                    <ns2:OriginDestination OriginDestinationKey="XQ_OD_1">
                        <ns2:DepartureCode>ADA</ns2:DepartureCode>
                        <ns2:ArrivalCode>AYT</ns2:ArrivalCode>
                    </ns2:OriginDestination>
                </ns2:OriginDestinationList>
                <ns2:SeatList>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365975383" ListKey="XQ_SEAT1A_1518365975380">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>1</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365975338" ListKey="XQ_SEAT1B_1518365975339">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>1</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975343" ListKey="XQ_SEAT1C_1518365975340">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>1</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975329" ListKey="XQ_SEAT2A_1518365975342">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>2</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975331" ListKey="XQ_SEAT3A_1518365975328">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>3</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975333" ListKey="XQ_SEAT4A_1518365975330">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>4</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975335" ListKey="XQ_SEAT5A_1518365975332">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>5</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975353" ListKey="XQ_SEAT6A_1518365975334">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>6</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975355" ListKey="XQ_SEAT7A_1518365975352">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>7</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975357" ListKey="XQ_SEAT8A_1518365975354">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>8</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975359" ListKey="XQ_SEAT9A_1518365975356">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>9</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975345" ListKey="XQ_SEAT10A_1518365975358">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>10</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975347" ListKey="XQ_SEAT11A_1518365975344">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>11</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975349" ListKey="XQ_SEAT12A_1518365975346">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>12</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975351" ListKey="XQ_SEAT2B_1518365975348">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>2</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365975305" ListKey="XQ_SEAT3B_1518365975350">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>3</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975307" ListKey="XQ_SEAT4B_1518365975304">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>4</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975309" ListKey="XQ_SEAT5B_1518365975306">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>5</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975311" ListKey="XQ_SEAT6B_1518365975308">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>6</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975297" ListKey="XQ_SEAT7B_1518365975310">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>7</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975299" ListKey="XQ_SEAT8B_1518365975296">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>8</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975301" ListKey="XQ_SEAT9B_1518365975298">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>9</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365975303" ListKey="XQ_SEAT10B_1518365975300">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>10</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975321" ListKey="XQ_SEAT11B_1518365975302">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>11</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975323" ListKey="XQ_SEAT12B_1518365975320">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>12</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975325" ListKey="XQ_SEAT2C_1518365975322">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>2</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975327" ListKey="XQ_SEAT3C_1518365975324">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>3</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975313" ListKey="XQ_SEAT4C_1518365975326">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>4</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975315" ListKey="XQ_SEAT5C_1518365975312">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>5</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975317" ListKey="XQ_SEAT6C_1518365975314">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>6</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975319" ListKey="XQ_SEAT7C_1518365975316">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>7</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974761" ListKey="XQ_SEAT8C_1518365975318">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>8</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974763" ListKey="XQ_SEAT9C_1518365974760">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>9</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974765" ListKey="XQ_SEAT10C_1518365974762">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>10</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974767" ListKey="XQ_SEAT11C_1518365974764">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>11</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974753" ListKey="XQ_SEAT12C_1518365974766">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>12</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974755" ListKey="XQ_SEAT2D_1518365974752">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>2</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365974757" ListKey="XQ_SEAT3D_1518365974754">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>3</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974759" ListKey="XQ_SEAT4D_1518365974756">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>4</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974777" ListKey="XQ_SEAT5D_1518365974758">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>5</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974779" ListKey="XQ_SEAT6D_1518365974776">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>6</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974781" ListKey="XQ_SEAT7D_1518365974778">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>7</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974783" ListKey="XQ_SEAT8D_1518365974780">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>8</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974769" ListKey="XQ_SEAT9D_1518365974782">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>9</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974771" ListKey="XQ_SEAT10D_1518365974768">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>10</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974773" ListKey="XQ_SEAT11D_1518365974770">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>11</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974775" ListKey="XQ_SEAT12D_1518365974772">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>12</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365974729" ListKey="XQ_SEAT2E_1518365974774">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>2</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365974731" ListKey="XQ_SEAT3E_1518365974728">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>3</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974733" ListKey="XQ_SEAT4E_1518365974730">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>4</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974735" ListKey="XQ_SEAT5E_1518365974732">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>5</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974721" ListKey="XQ_SEAT6E_1518365974734">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>6</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974723" ListKey="XQ_SEAT7E_1518365974720">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>7</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974725" ListKey="XQ_SEAT8E_1518365974722">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>8</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974727" ListKey="XQ_SEAT9E_1518365974724">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>9</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974745" ListKey="XQ_SEAT10E_1518365974726">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>10</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974747" ListKey="XQ_SEAT11E_1518365974744">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>11</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974749" ListKey="XQ_SEAT12E_1518365974746">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>12</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974751" ListKey="XQ_SEAT2F_1518365974748">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>2</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365974737" ListKey="XQ_SEAT3F_1518365974750">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>3</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974739" ListKey="XQ_SEAT4F_1518365974736">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>4</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974741" ListKey="XQ_SEAT5F_1518365974738">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>5</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974743" ListKey="XQ_SEAT6F_1518365974740">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>6</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974697" ListKey="XQ_SEAT7F_1518365974742">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>7</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974699" ListKey="XQ_SEAT8F_1518365974696">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>8</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974701" ListKey="XQ_SEAT9F_1518365974698">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>9</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974703" ListKey="XQ_SEAT10F_1518365974700">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>10</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974689" ListKey="XQ_SEAT11F_1518365974702">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>11</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974691" ListKey="XQ_SEAT12F_1518365974688">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>12</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974693" ListKey="XQ_SEAT14A_1518365974690">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>14</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974695" ListKey="XQ_SEAT15A_1518365974692">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>15</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974713" ListKey="XQ_SEAT16A_1518365974694">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>16</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>E</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974715" ListKey="XQ_SEAT14B_1518365974712">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>14</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974717" ListKey="XQ_SEAT15B_1518365974714">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>15</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974719" ListKey="XQ_SEAT16B_1518365974716">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>16</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>E</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974705" ListKey="XQ_SEAT14C_1518365974718">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>14</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974707" ListKey="XQ_SEAT15C_1518365974704">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>15</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365974706 XQ_SEATSSR_1518365974708" ListKey="XQ_SEAT16C_1518365974709">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>16</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>E</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974710" ListKey="XQ_SEAT14D_1518365974711">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>14</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974664" ListKey="XQ_SEAT15D_1518365974665">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>15</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365974706 XQ_SEATSSR_1518365974666" ListKey="XQ_SEAT16D_1518365974667">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>16</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>E</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974668" ListKey="XQ_SEAT14E_1518365974669">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>14</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974670" ListKey="XQ_SEAT15E_1518365974671">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>15</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365974706 XQ_SEATSSR_1518365974656" ListKey="XQ_SEAT16E_1518365974657">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>16</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>E</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974658" ListKey="XQ_SEAT14F_1518365974659">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>14</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974660" ListKey="XQ_SEAT15F_1518365974661">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>15</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365974706 XQ_SEATSSR_1518365974662" ListKey="XQ_SEAT16F_1518365974663">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>16</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>E</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974680" ListKey="XQ_SEAT18A_1518365974681">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>18</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>E</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974682" ListKey="XQ_SEAT19A_1518365974683">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>19</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974684" ListKey="XQ_SEAT20A_1518365974685">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>20</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974686" ListKey="XQ_SEAT21A_1518365974687">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>21</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974672" ListKey="XQ_SEAT22A_1518365974673">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>22</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974674" ListKey="XQ_SEAT23A_1518365974675">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>23</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974676" ListKey="XQ_SEAT24A_1518365974677">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>24</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974678" ListKey="XQ_SEAT25A_1518365974679">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>25</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974632" ListKey="XQ_SEAT26A_1518365974633">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>26</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974634" ListKey="XQ_SEAT27A_1518365974635">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>27</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974636" ListKey="XQ_SEAT28A_1518365974637">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>28</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974638" ListKey="XQ_SEAT29A_1518365974639">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>29</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974624" ListKey="XQ_SEAT30A_1518365974625">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>30</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974626" ListKey="XQ_SEAT31A_1518365974627">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>31</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974628" ListKey="XQ_SEAT32A_1518365974629">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>32</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974630" ListKey="XQ_SEAT33A_1518365974631">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>33</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365974648" ListKey="XQ_SEAT34A_1518365974649">
                        <ns2:Location>
                            <ns2:Column>A</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>34</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365974706 XQ_SEATSSR_1518365974650" ListKey="XQ_SEAT18B_1518365974651">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>18</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>E</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974652" ListKey="XQ_SEAT19B_1518365974653">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>19</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974654" ListKey="XQ_SEAT20B_1518365974655">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>20</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974640" ListKey="XQ_SEAT21B_1518365974641">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>21</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365974642" ListKey="XQ_SEAT22B_1518365974643">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>22</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974644" ListKey="XQ_SEAT23B_1518365974645">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>23</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974646" ListKey="XQ_SEAT24B_1518365974647">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>24</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974600" ListKey="XQ_SEAT25B_1518365974601">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>25</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974602" ListKey="XQ_SEAT26B_1518365974603">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>26</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974604" ListKey="XQ_SEAT27B_1518365974605">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>27</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974606" ListKey="XQ_SEAT28B_1518365974607">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>28</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974592" ListKey="XQ_SEAT29B_1518365974593">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>29</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974594" ListKey="XQ_SEAT30B_1518365974595">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>30</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974596" ListKey="XQ_SEAT31B_1518365974597">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>31</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365974598" ListKey="XQ_SEAT32B_1518365974599">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>32</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365974616" ListKey="XQ_SEAT33B_1518365974617">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>33</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365974618" ListKey="XQ_SEAT34B_1518365974619">
                        <ns2:Location>
                            <ns2:Column>B</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>34</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365974706 XQ_SEATSSR_1518365974620" ListKey="XQ_SEAT18C_1518365974621">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>18</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>E</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974622" ListKey="XQ_SEAT19C_1518365974623">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>19</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974608" ListKey="XQ_SEAT20C_1518365974609">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>20</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974610" ListKey="XQ_SEAT21C_1518365974611">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>21</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974612" ListKey="XQ_SEAT22C_1518365974613">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>22</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974614" ListKey="XQ_SEAT23C_1518365974615">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>23</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974568" ListKey="XQ_SEAT24C_1518365974569">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>24</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974570" ListKey="XQ_SEAT25C_1518365974571">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>25</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974572" ListKey="XQ_SEAT26C_1518365974573">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>26</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974574" ListKey="XQ_SEAT27C_1518365974575">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>27</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974560" ListKey="XQ_SEAT28C_1518365974561">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>28</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974562" ListKey="XQ_SEAT29C_1518365974563">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>29</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974564" ListKey="XQ_SEAT30C_1518365974565">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>30</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974566" ListKey="XQ_SEAT31C_1518365974567">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>31</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365974584" ListKey="XQ_SEAT32C_1518365974585">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>32</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365974586" ListKey="XQ_SEAT33C_1518365974587">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>33</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365974588" ListKey="XQ_SEAT34C_1518365974589">
                        <ns2:Location>
                            <ns2:Column>C</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>34</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974590" ListKey="XQ_SEAT18D_1518365974591">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>18</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>E</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974576" ListKey="XQ_SEAT19D_1518365974577">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>19</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974578" ListKey="XQ_SEAT20D_1518365974579">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>20</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974580" ListKey="XQ_SEAT21D_1518365974581">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>21</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974582" ListKey="XQ_SEAT22D_1518365974583">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>22</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974536" ListKey="XQ_SEAT23D_1518365974537">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>23</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974538" ListKey="XQ_SEAT24D_1518365974539">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>24</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974540" ListKey="XQ_SEAT25D_1518365974541">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>25</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974542" ListKey="XQ_SEAT26D_1518365974543">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>26</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974528" ListKey="XQ_SEAT27D_1518365974529">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>27</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974530" ListKey="XQ_SEAT28D_1518365974531">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>28</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974532" ListKey="XQ_SEAT29D_1518365974533">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>29</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974534" ListKey="XQ_SEAT30D_1518365974535">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>30</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974552" ListKey="XQ_SEAT31D_1518365974553">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>31</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974554" ListKey="XQ_SEAT32D_1518365974555">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>32</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365974556" ListKey="XQ_SEAT33D_1518365974557">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>33</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365974558" ListKey="XQ_SEAT34D_1518365974559">
                        <ns2:Location>
                            <ns2:Column>D</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>34</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>A</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974544" ListKey="XQ_SEAT18E_1518365974545">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>18</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>E</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974546" ListKey="XQ_SEAT19E_1518365974547">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>19</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365974548" ListKey="XQ_SEAT20E_1518365974549">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>20</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974550" ListKey="XQ_SEAT21E_1518365974551">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>21</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975016" ListKey="XQ_SEAT22E_1518365975017">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>22</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365975018" ListKey="XQ_SEAT23E_1518365975019">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>23</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975020" ListKey="XQ_SEAT24E_1518365975021">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>24</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975022" ListKey="XQ_SEAT25E_1518365975023">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>25</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975008" ListKey="XQ_SEAT26E_1518365975009">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>26</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365975010" ListKey="XQ_SEAT27E_1518365975011">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>27</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975012" ListKey="XQ_SEAT28E_1518365975013">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>28</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975014" ListKey="XQ_SEAT29E_1518365975015">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>29</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975032" ListKey="XQ_SEAT30E_1518365975033">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>30</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975034" ListKey="XQ_SEAT31E_1518365975035">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>31</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365975036" ListKey="XQ_SEAT32E_1518365975037">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>32</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365975038" ListKey="XQ_SEAT33E_1518365975039">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>33</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975381 XQ_SEATSSR_1518365975024" ListKey="XQ_SEAT34E_1518365975025">
                        <ns2:Location>
                            <ns2:Column>E</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>34</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975026" ListKey="XQ_SEAT18F_1518365975027">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>18</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>E</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975028" ListKey="XQ_SEAT19F_1518365975029">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>19</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975030" ListKey="XQ_SEAT20F_1518365975031">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>20</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974984" ListKey="XQ_SEAT21F_1518365974985">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>21</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974986" ListKey="XQ_SEAT22F_1518365974987">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>22</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974988" ListKey="XQ_SEAT23F_1518365974989">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>23</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974990" ListKey="XQ_SEAT24F_1518365974991">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>24</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974976" ListKey="XQ_SEAT25F_1518365974977">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>25</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974978" ListKey="XQ_SEAT26F_1518365974979">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>26</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974980" ListKey="XQ_SEAT27F_1518365974981">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>27</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974982" ListKey="XQ_SEAT28F_1518365974983">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>28</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975000" ListKey="XQ_SEAT29F_1518365975001">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>29</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975002" ListKey="XQ_SEAT30F_1518365975003">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>30</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975004" ListKey="XQ_SEAT31F_1518365975005">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>31</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365975006" ListKey="XQ_SEAT32F_1518365975007">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>32</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974992" ListKey="XQ_SEAT33F_1518365974993">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>33</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                    <ns2:Seats refs="XQ_SEATSTATUS_1518365975341 XQ_SEATSSR_1518365974994" ListKey="XQ_SEAT34F_1518365974995">
                        <ns2:Location>
                            <ns2:Column>F</ns2:Column>
                            <ns2:Row>
                                <ns2:Number>34</ns2:Number>
                            </ns2:Row>
                            <ns2:Characteristics>
                                <ns2:Characteristic>
                                    <ns2:Code>W</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>location attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Code>N</ns2:Code>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                                <ns2:Characteristic>
                                    <ns2:Remarks>
                                        <ns2:Remark>facility attributes</ns2:Remark>
                                    </ns2:Remarks>
                                </ns2:Characteristic>
                            </ns2:Characteristics>
                        </ns2:Location>
                    </ns2:Seats>
                </ns2:SeatList>
            </ns2:DataLists>
            <ns2:Metadata>
                <ns2:Shopping>
                    <ns2:ShopMetadataGroup>
                        <ns2:Seat>
                            <ns2:SeatMetadatas>
                                <ns2:SeatMetadata MetadataKey="XQ_SEATSTATUS_1518365975381">
                                    <ns2:SeatStatus>
                                        <ns2:Code>F</ns2:Code>
                                        <ns2:Definition>Available</ns2:Definition>
                                    </ns2:SeatStatus>
                                </ns2:SeatMetadata>
                                <ns2:SeatMetadata MetadataKey="XQ_SEATSTATUS_1518365975341">
                                    <ns2:SeatStatus>
                                        <ns2:Code>O</ns2:Code>
                                        <ns2:Definition>Occupied</ns2:Definition>
                                    </ns2:SeatStatus>
                                </ns2:SeatMetadata>
                                <ns2:SeatMetadata MetadataKey="XQ_SEATSTATUS_1518365974706">
                                    <ns2:SeatStatus>
                                        <ns2:Code>Restricted</ns2:Code>
                                    </ns2:SeatStatus>
                                </ns2:SeatMetadata>
                            </ns2:SeatMetadatas>
                        </ns2:Seat>
                    </ns2:ShopMetadataGroup>
                </ns2:Shopping>
                <ns2:Other>
                    <ns2:OtherMetadata>
                        <ns2:PriceMetadatas>
                            <ns2:PriceMetadata MetadataKey="XQ_MDK_1518365974997">
                                <ns2:AugmentationPoint>
                                    <ns2:AugPoint Key="XQ_TAX_1518365975336">
                                        <ns3:TaxDetailAugPoint>
                                            <DisplayTaxCode>VT</DisplayTaxCode>
                                        </ns3:TaxDetailAugPoint>
                                    </ns2:AugPoint>
                                </ns2:AugmentationPoint>
                            </ns2:PriceMetadata>
                        </ns2:PriceMetadatas>
                    </ns2:OtherMetadata>
                </ns2:Other>
            </ns2:Metadata>
        </ns2:SeatAvailabilityRS>
    </soap:Body>
</soap:Envelope>`;



    this.seatLimit = 1;
    this.selArray = [];
    this.jsonObj = {};
    this.$container = $(".seat_book_list");
    this.ReturnObj = { CabinType: "" };
    this.start = function () {
        var d = $.ajax({
            url: "../NDC/XmlToJson",
            type: "POST",
            data: { xml: this.xml },
            success: function (result) {
                this.jsonObj = JSON.parse(result);
                this.ReturnObj.CabinType = this.jsonObj["soap:Envelope"]["soap:Body"]["ns2:SeatAvailabilityRS"]["ns2:Flights"]["ns2:Cabin"]["ns2:SeatDisplay"]["ns2:CabinType"]["ns2:Name"];
                this.seatAvail();
            }.bind(this)
        });
    };
    this.seatAvail = function () {
        if (!$.isEmptyObject(this.jsonObj))
            this.drawSeatAvail();
    };
    this.drawSeatAvail = function () {
        this.seatCol = this.jsonObj["soap:Envelope"]["soap:Body"]["ns2:SeatAvailabilityRS"]["ns2:Flights"]["ns2:Cabin"]["ns2:SeatDisplay"]["ns2:Columns"];
        this.rows = parseInt(this.jsonObj["soap:Envelope"]["soap:Body"]["ns2:SeatAvailabilityRS"]["ns2:Flights"]["ns2:Cabin"]["ns2:SeatDisplay"]["ns2:Rows"]["ns2:Last"]);
        this.seatArray = this.jsonObj["soap:Envelope"]["soap:Body"]["ns2:SeatAvailabilityRS"]["ns2:DataLists"]["ns2:SeatList"]["ns2:Seats"];
        for (var i = 1; i <= this.rows; i++) {
            this.$container.append(`<div class="seat_book_container_row"><span class="_row_seats" id="seat_row${i}"></span><span class="_row_no">${i}</span></div>`);
            this.appendSeatsToRow($(`#seat_row${i}`), i);
        }
        this.appendSeatKeyList();
    };
    this.appendSeatsToRow = function ($seatrow, i) {
        for (var j = 0; j < this.seatCol.length; j++) {
            var sep = j === Math.round(this.seatCol.length / 2) ? 100 / (this.seatCol.length + 2) : 1;
            if (i === 1)
                $seatrow.append(`<div class="seat" id="${this.seatCol[j] + i}" status="" seatKey = ""; style="width:${100 / (this.seatCol.length + 2)}%;margin-left:${sep}%"> <span class="seat_cat">${this.seatCol[j]}</span></div>`);
            else
                $seatrow.append(`<div class="seat" id="${this.seatCol[j] + i}" status="" seatKey = "" style="width:${100 / (this.seatCol.length + 2)}%;margin-left:${sep}%"> <span class="seat_cat"></span></div>`);
        }
    };
    this.appendSeatKeyList = function () {
        for (i = 0; i < this.seatArray.length; i++) {
            var seatno = this.seatArray[i]["ns2:Location"]["ns2:Column"] + this.seatArray[i]["ns2:Location"]["ns2:Row"]["ns2:Number"];
            $(`#${seatno}`).attr("seatKey", this.seatArray[i]["@ListKey"]).attr("status", this.seatArray[i]["@refs"].split(" ")[0]);
            if (this.seatArray[i]["@ListKey"] === "")
                $(`#${seatno}`).addClass("Restricted");
            this.checkAvail($(`#${seatno}`), this.seatArray[i]["@ListKey"]);
            $(`#${seatno}`).on("click", this.bookSeat.bind(this));
        }
        this.markRestricted();
    };
    this.checkAvail = function ($el, keyList) {
        var availArray = this.jsonObj["soap:Envelope"]["soap:Body"]["ns2:SeatAvailabilityRS"]["ns2:Metadata"]["ns2:Shopping"]["ns2:ShopMetadataGroup"]["ns2:Seat"]["ns2:SeatMetadatas"]["ns2:SeatMetadata"];
        for (var k = 0; k < availArray.length; k++) {
            if (availArray[k]["@MetadataKey"] === $el.attr("status"))
                $el.addClass(availArray[k]["ns2:SeatStatus"]["ns2:Definition"]);
            else if ($el.attr("status") === "")
                $el.addClass("Restricted");
        }
    };
    this.bookSeat = function (e) {
        var $el = $(event.target);
        if ($el.hasClass("Available") && !$el.hasClass("Booked") && !(this.selArray.length >= this.seatLimit)) {
            $el.addClass("Booked");
            this.selArray.push($el.attr("id"));
        }
        else if ($el.hasClass("Available") && $el.hasClass("Booked")) {
            $el.removeClass("Booked");
            var index = this.selArray.indexOf($el.attr("id"));
            if (index !== -1)
                this.selArray.splice(index, 1);
        }
    };

    this.markRestricted = function () {
        $.each($(".seat"), function (i, obj) {
            if ($(obj).hasClass("Available") === false && $(obj).hasClass("Occupied") === false)
                $(obj).addClass("Restricted");
        })
    };
    this.start();
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
















function DrawInit(jsonobj, jsonobj2, divid) {
    var newobj = [];
    this.ownerdata = [];
    this.ownerdata.push({ code: "XQ", Name: "Sun Express", Logo: "https://worldairlinenews.files.wordpress.com/2013/11/sunexpress-logo-1.jpg" });
    this.ownerdata.push({ code: "JW", Name: "Vanilla Air", Logo: "https://www.seatlink.com/images/logos/no-text/sm/vanilla-air.png" });
    var f = jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"].hasOwnProperty("ns2:Errors");
    var owner = !f ? jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:OffersGroup"]["ns2:AirlineOffers"]["ns2:Owner"] : null;
    if (owner !== null) {
        if (Array.isArray(jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:OffersGroup"]["ns2:AirlineOffers"]["ns2:AirlineOffer"])) {
            for (x = 0; x < jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:OffersGroup"]["ns2:AirlineOffers"]["ns2:AirlineOffer"].length; x++) {
                var price = jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:OffersGroup"]["ns2:AirlineOffers"]["ns2:AirlineOffer"][x]["ns2:PricedOffer"]["ns2:OfferPrice"]["ns2:RequestedDate"]["ns2:PriceDetail"]["ns2:BaseAmount"]["#text"];
                var arrtime = jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"][x]["ns2:Arrival"]["ns2:Time"];
                var deptime = jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"][x]["ns2:Departure"]["ns2:Time"];
                var duration = jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"][x]["ns2:FlightDetail"]["ns2:FlightDuration"]["ns2:Value"];
                newobj.push({ Depart: deptime, Arrive: arrtime, Duration: duration, Price: price, Airline: getName(owner), Logo: getLogo(owner) });
            }
        }
        else {
            var price = jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:OffersGroup"]["ns2:AirlineOffers"]["ns2:AirlineOffer"]["ns2:PricedOffer"]["ns2:OfferPrice"]["ns2:RequestedDate"]["ns2:PriceDetail"]["ns2:BaseAmount"]["#text"];
            var arrtime = jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"]["ns2:Arrival"]["ns2:Time"];
            var deptime = jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"]["ns2:Departure"]["ns2:Time"];
            var duration = jsonobj["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"]["ns2:FlightDetail"]["ns2:FlightDuration"]["ns2:Value"];
            newobj.push({ Depart: deptime, Arrive: arrtime, Duration: duration, Price: price, Airline: getName(owner), Logo: getLogo(owner) });
        }
    }

    var f2 = jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"].hasOwnProperty("ns2:Errors");
    var owner2 = !f2 ? jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:OffersGroup"]["ns2:AirlineOffers"]["ns2:Owner"] : null;
    if (owner2 !== null) {
        if (Array.isArray(jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:OffersGroup"]["ns2:AirlineOffers"]["ns2:AirlineOffer"])) {
            for (x2 = 0; x2 < jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:OffersGroup"]["ns2:AirlineOffers"]["ns2:AirlineOffer"].length; x2++) {
                var price2 = jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:OffersGroup"]["ns2:AirlineOffers"]["ns2:AirlineOffer"][x2]["ns2:PricedOffer"]["ns2:OfferPrice"]["ns2:RequestedDate"]["ns2:PriceDetail"]["ns2:BaseAmount"]["#text"];
                var arrtime2 = jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"][x2]["ns2:Arrival"]["ns2:Time"];
                var deptime2 = jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"][x2]["ns2:Departure"]["ns2:Time"];
                var duration2 = jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"][x2]["ns2:FlightDetail"]["ns2:FlightDuration"]["ns2:Value"];
                newobj.push({ Depart: deptime2, Arrive: arrtime2, Duration: duration2, Price: price2, Airline: getName(owner2), Logo: getLogo(owner2) });
            }
        }
        else {
            var price2 = jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:OffersGroup"]["ns2:AirlineOffers"]["ns2:AirlineOffer"]["ns2:PricedOffer"]["ns2:OfferPrice"]["ns2:RequestedDate"]["ns2:PriceDetail"]["ns2:BaseAmount"]["#text"];
            var arrtime2 = jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"]["ns2:Arrival"]["ns2:Time"];
            var deptime2 = jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"]["ns2:Departure"]["ns2:Time"];
            var duration2 = jsonobj2["soap:Envelope"]["soap:Body"]["ns2:AirShoppingRS"]["ns2:DataLists"]["ns2:FlightSegmentList"]["ns2:FlightSegment"]["ns2:FlightDetail"]["ns2:FlightDuration"]["ns2:Value"];
            newobj.push({ Depart: deptime2, Arrive: arrtime2, Duration: duration2, Price: price2, Airline: getName(owner2), Logo: getLogo(owner2) });
        }
    }

    getAirlines(newobj, $("#" + divid));
}

function getName(ownerid) {
    for (i = 0; i < this.ownerdata.length; i++)
        if (ownerid === this.ownerdata[i].code)
            return this.ownerdata[i].Name
}

function getLogo(ownerid) {
    for (i = 0; i < this.ownerdata.length; i++)
        if (ownerid === this.ownerdata[i].code)
            return this.ownerdata[i].Logo
}


function getAirlines(obj, $container) {
    if (!$.isEmptyObject(obj))
        this.drawAirlinesList(obj, $container);
};

function drawAirlinesList(obj, $container) {
    for (var i = 0; i < obj.length; i++) {
        $container.append(`<div class="airlne_container msgt">
                    <div class="airline_head">
                    <span class="_logo_air"><img class="img-circle" src="${obj[i].Logo}" /></span>
                    ${obj[i].Airline}
                    <span class="_price_val pull-right">${obj[i].Price}</span>
                </div>
                <div class="airline_body">
                    <div class="Depart_time"><div class="_head_inner">Depart</div><div class="_head_body_inner">${obj[i].Depart}</div></div>
                    <div class="Arrive_time"><div class="_head_inner">Arrive</div><div class="_head_body_inner">${obj[i].Arrive}</div></div>
                    <div class="Duration_time"><div class="_head_inner">Duration</div><div class="_head_body_inner">${obj[i].Duration}</div></div>
                    <div class="_Price"><button class="btn btn_book">Book</button></div>
                </div>
            </div>`);
    };
}