var Eb_chatBot = function () {
    this.$chatCont = $('<div class="eb-chat-cont"></div>');
    this.$chatBox = $('<div class="eb-chatBox"></div>');
    this.$inputCont = $('<div class="eb-chat-inp-cont"><input type="text" class="msg-inp"/><button class="btn btn-info msg-send"><i class="fa fa-paper-plane" aria-hidden="true"></i></button></div>');
    this.$poweredby = $('<div class="poweredby-cont"><div class="poweredby"><i>powered by</i> EXPRESSbase</div><div class="poweredby"><a class="botlink" target="_blank" href="http://bot.expressbase.com">bot.expressbase.com</a></div></div>');
    this.$msgCont = $('<div class="msg-cont"></div>');
    this.$botMsgBox = this.$msgCont.clone().wrapInner($('<div class="msg-cont-bot"><div class="msg-wraper-bot"></div></div>'));
    this.$botMsgBox.prepend('<div class="bot-icon"></div>');
    this.$userMsgBox = this.$msgCont.clone().wrapInner($('<div class="msg-cont-user"><div class="msg-wraper-user"></div></div>'));
    this.$userMsgBox.append('<div class="bot-icon-user"></div>');
    this.ready = true;
    this.isAlreadylogined = true;
    this.bearerToken = null;
    this.refreshToken = null;
    this.botdpURL = 'url(../images/svg/chatBot.svg)center center no-repeat';
    this.ebbotThemeColor = '#31d031';
    this.initControls = new InitControls(this);
    this.typeDelay = 10;

    this.formsList = {};
    this.formsDict = {};
    this.formNames = [];
    this.curForm = {};
    this.formControls = [];
    this.formValues = {};
    this.editingCtrlName = null;
    this.lastCtrlIdx = 0;
    this.FB = null;
    this.FBResponse = {};
    this.EXPRESSbase_SOLUTION_ID;
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
        html.style.setProperty("--botThemeColor", this.ebbotThemeColor);

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
        $("body").on("click", ".card-btn-cont .btn", this.ctrlSend);
        $('.msg-inp').on("keyup", this.txtboxKeyup);
        this.showDate();
    };

    this.contactSubmit = function (e) {
        $(e.target).closest('.msg-cont').remove();
        this.msgFromBot("Thank you.");
    }.bind(this);

    this.postmenuClick = function (e, reply) {
        var $e = $(e.target);
        if (reply === undefined)
            reply = $e.text().trim();
        var idx = $e.attr("idx");
        $e.closest('.msg-cont').remove();
        this.sendMsg(reply);
        $('.eb-chat-inp-cont').hide();
        this.CurFormIdx = idx;
    }.bind(this);

    this.FBlogin = function (e) {
        this.postmenuClick(e);
        if (this.CurFormIdx == 0)
            this.login2FB();
        else
            this.collectContacts();
    }.bind(this);

    this.collectContacts = function () {
        this.msgFromBot("OK, No issues. Can you Please provide your contact Details ? so that i can understand you better.");
        this.msgFromBot($('<input type="email"><br/><input type="tel"><button name="contactSubmit">submit</button>'));
    };

    this.continueAsFBUser = function (e) {
        this.postmenuClick(e, "");
        if (this.CurFormIdx == 0)
            this.authenticate();
        else
            this.FB.logout(function (response) {
                this.msgFromBot("You are successfully logout from our App");
            }.bind(this));
    }.bind(this);

    this.startFormInteraction = function (e) {
        var RefId = $(e.target).attr("refid");
        this.postmenuClick(e);
        this.getForm(RefId);///////////////////
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
                this.formsList[RefId] = data;
                this.curForm = data;
                this.setFormControls();
            }.bind(this));
        }
        else {
            this.hideTypingAnim();
            this.curForm = this.formsList[RefId];
            this.setFormControls();
        }
    }

    this.txtboxKeyup = function (e) {
        if (e.which === 13)/////////////////////////////
            this.send_btn();
    }.bind(this);

    this.send_btn = function () {
        window.onmessage = function (e) {
            if (e.data == 'hello') {
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
        if (this.isAlreadylogined)
            this.Query(`Hello ${this.FBResponse.name}, ${greeting}`, [`Continue as ${this.FBResponse.name} ?`, `Not ${this.FBResponse.name}?`], "continueAsFBUser");
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

    this.getButtons = function (OptArr, For, ids) {
        var Html = '';
        $.each(OptArr, function (i, opt) {
            Html += `<button for="${For}" class="btn" idx="${i}" refid="${(ids !== undefined) ? ids[i] : i}">${opt} </button>`;
        });
        return Html;
    };

    this.setFormControls = function () {
        this.formControls = [];
        $.each(this.curForm.controls, function (i, control) { this.formControls.push($(`<div class='ctrl-wraper'>${control.bareControlHtml}</div>`)); }.bind(this));
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
        else
            var inpVal = $input.val();
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
        var inpVal = this.getValue($input);
        if (this.curCtrl.type === "ImageUploader")
            this.replyAsImage($msgDiv, $input[0], next_idx);
        else {
            if (this.curCtrl.type === "Cards") {
                this.lastval = $btn.text();
                inpVal = $btn.text();
            }
            else
                this.lastval = $('#' + id).val();
            this.sendCtrlAfter($msgDiv.hide(), inpVal + '&nbsp; <span class="img-edit" idx=' + (next_idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');
            this.callGetControl(this.lastCtrlIdx);
        }
        this.formValues[id] = this.lastval;
        this.editingCtrlName = null;
        this.lastval = null;
    }.bind(this);

    this.callGetControl = function (idx) {
        if (idx !== this.formControls.length) {
            if (!this.formValues[this.editingCtrlName])
                this.getControl(idx);
            else
                this.enableCtrledit();

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
        var $ctrlCont = $(this.formControls[idx][0].outerHTML);
        var control = this.formControls[idx][0].outerHTML;
        this.curCtrl = this.curForm.controls[idx];
        if (this.curCtrl && this.curCtrl.type === "Cards")
            var $CtrlCont = $(control);
        else
            var $CtrlCont = $(this.wrapIn_chat_ctrl_cont(idx, control));
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

                    if (this.curCtrl && this.curCtrl.type === "Cards") {
                        $msg.find(".ctrl-wraper").css("width", "100%").css("border", 'none');
                        $msg.find(".msg-wraper-bot").css("margin-left", "12px");
                    }

                    if (this.curCtrl && $('#' + this.curCtrl.name).length === 1) {
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
        if (this.initControls[this.curCtrl.type] !== undefined)
            this.initControls[this.curCtrl.type](this.curCtrl);
    }.bind(this);

    this.formSubmit = function (e) {
        var $btn = $(e.target).closest(".btn");
        this.sendMsg($btn.text());
        $('.msg-wraper-user [name=ctrledit]').remove();
        $btn.closest(".msg-cont").remove();
        this.showConfirm();
    }.bind(this);

    this.showConfirm = function () {
        this.formValues = {};
        this.lastCtrlIdx = 0;
        $(`[form=${this.curForm.name}]`).remove();
        var msg = 'Your leave application submitted successfully';
        this.msgFromBot(msg);
        this.Query("What do you want to do ?", this.formNames, "form-opt", Object.keys(this.formsDict));
    }.bind(this);

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
        $.post("../bote/AuthAndGetformlist",
            {
                "cid": "eb_roby_dev",
                "socialId": this.FBResponse.id,
                "wc": "uc",
            }, function (result) {
                this.hideTypingAnim();
                if (result === null)
                    this.authFailed();
                this.formsDict = result[1];
                this.bearerToken = result[0].bearerToken;
                this.refreshToken = result[0].refreshToken;
                this.formNames = Object.values(this.formsDict);
                this.Query("What do you want to do ?", this.formNames, "form-opt", Object.keys(this.formsDict));
            }.bind(this));
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
        this.Query("Hello I am EBbot, Nice to meet you. Do you mind loging into facebook?", ["Login", "No, Sorry"], "fblogin");
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

    this.init();
};