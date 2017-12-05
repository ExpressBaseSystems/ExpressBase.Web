﻿var Eb_chatBot = function () {
    this.$chatCont = $('<div class="eb-chat-cont"></div>');
    this.$chatBox = $('<div class="eb-chatBox"></div>');
    this.$inputCont = $('<div class="eb-chat-inp-cont"><input type="text" class="msg-inp"/><button class="btn btn-info msg-send"><i class="fa fa-paper-plane" aria-hidden="true"></i></button></div>');
    this.$msgCont = $('<div class="msg-cont"></div>');
    this.$botMsgBox = this.$msgCont.clone().wrapInner($('<div class="msg-cont-bot"><div class="msg-wraper-bot"></div></div>'));
    this.$botMsgBox.prepend('<div class="bot-icon"></div>');
    this.$userMsgBox = this.$msgCont.clone().wrapInner($('<div class="msg-cont-user"><div class="msg-wraper-user"></div></div>'));
    this.$userMsgBox.append('<div class="bot-icon-user"></div>');
    this.ready = true;
    this.bearerToken = null;
    this.refreshToken = null;
    this.userForms = null;

    this.$form = null;
    this.formControls = [];
    this.formValues = {};
    this.FB = null;
    this.EXPRESSbase_SOLUTION_ID;
    this.socialId = null;
    this.picture = null;
    this.init = function () {
        $("body").append(this.$chatCont);
        this.$chatCont.append(this.$chatBox);
        this.$chatCont.append(this.$inputCont);
        this.$TypeAnim = $(`<div><span class="chat-typing">Typing</span><svg class="lds-typing" width="10%" height="10%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
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
        $("body").on("click", ".eb-chat-inp-cont .msg-send", this.send_btn);
        $("body").on("click", ".msg-cont [name=ctrlsend]", this.ctrlSend);
        $("body").on("click", ".msg-cont [name=ctrledit]", this.ctrlEdit);
        $("body").on("click", ".eb-chatBox [name=formsubmit]", this.formSubmit);
        $("body").on("click", ".btn-box [name=form-opt]", this.startFormInteraction);
        $('.msg-inp').on("keyup", this.txtboxKeyup);
        this.showDate();
    };

    this.txtboxKeyup = function (e) {
        if (e.which === 13)/////////////////////////////
            this.send_btn();
    }.bind(this);

    this.send_btn = function () {
        $.post("../Bote/GetBotForms", {
            "refreshToken": this.refreshToken,
            "bearerToken": this.bearerToken
        }, function (data) {
            this.userForms = data;
            this.Query("What do you want to do ?");
        }.bind(this));
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
        this.$userMsgBox.find(".bot-icon-user").css('background', `url(${this.picture.data.url})center center no-repeat`);
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
        this.getMsg(`Hello ${name}, ${greeting}`);
    }.bind(this);

    this.Query = function (query) {
        var OptArr = []
        $.each(this.userForms, function (i, form) { OptArr.push(form.name); });
        this.getMsg(query);
        var Options = this.getButtons(OptArr);
        this.getMsg($('<div class="btn-box">' + Options + '</div>'));

    };

    this.getButtons = function (OptArr) {
        var Html = '';
        $.each(OptArr, function (i, opt) {
            Html += '<button name="form-opt" class="btn" idx="' + i + '">' + opt + '</button>';
        });
        return Html;
    };

    this.startFormInteraction = function (e) {
        var $e = $(e.target);
        var reply = $e.text().trim();
        var idx = $e.attr("idx");
        $e.closest('.msg-cont').remove();
        this.sendMsg(reply);
        $('.eb-chat-inp-cont').hide();
        this.CurFormIdx = idx;
        this.setFormControls(this.CurFormIdx);
    }.bind(this);

    this.setFormControls = function () {
        $.each(this.userForms[this.CurFormIdx].controls, function (i, control) {
            this.formControls.push($(control.bareControlHtml));
        }.bind(this));
        this.getNextControl();
    }.bind(this);

    this.ctrlSend = function (e) {
        var $btn = $(e.target).closest(".btn");
        var $msgDiv = $btn.closest('.msg-cont-bot');
        var idx = parseInt($btn.attr('idx')) + 1;
        var id = this.userForms[this.CurFormIdx].controls[idx - 1].name;
        var $input = $('#' + id);
        $input.off("blur").on("blur", function () { $btn.click() });
        this.sendCtrlAfter($msgDiv.hide(), $input.val() + '&nbsp; <span idx=' + (idx - 1) + ' name="ctrledit"> <i class="fa fa-pencil" aria-hidden="true"></i></span>');

        if (idx !== this.formControls.length) {
            if (!this.formValues[id])
                this.getNextControl(idx);
        }
        else {
            this.getMsg('Are you sure? Can I submit?');
            this.getMsg($('<div class="btn-box"><button name="formsubmit"" class="btn">Sure</button><button class="btn">Cancel</button></div>'));
        }
        this.formValues[id] = $('#' + id).val();

    }.bind(this);

    this.ctrlEdit = function (e) {
        var $btn = $(e.target).closest("span");
        var idx = $btn.attr('idx');
        $('.msg-cont-bot [idx=' + idx + ']').closest('.msg-cont-bot').show(200);
        $btn.closest('.msg-cont').remove();
    };

    this.getNextControl = function (idx) {
        idx = idx || 0;
        if (idx === this.formControls.length)
            return;
        var $ctrlCont = $(this.formControls[idx][0].outerHTML);
        var $control = $('<div class="chat-ctrl-cont">' + this.formControls[idx][0].outerHTML + '<button class="btn" idx=' + idx + ' name="ctrlsend"><i class="fa fa-paper-plane-o" aria-hidden="true"></i></button></div>');
        var lablel = this.userForms[this.CurFormIdx].controls[idx].label;
        this.getMsg(lablel + ' ?');
        this.getMsg($control);
        $ctrlCont.find(".helpText").remove();
    }.bind(this);

    this.showTypingAnim = function ($msg) {
        $msg.find('.msg-wraper-bot').html(this.$TypeAnim.clone());
    }.bind(this);

    this.sendMsg = function (msg) {
        var $msg = this.$userMsgBox.clone();
        $msg.find('.msg-wraper-user').text(msg).append(this.getTime());
        this.$chatBox.append($msg);
    };

    this.sendCtrl = function (msg) {
        var $msg = this.$userMsgBox.clone().wrapInner($(msg));
        this.$chatBox.append($msg)
        $('.eb-chatBox').scrollTop(99999999999);
    };

    this.sendCtrlAfter = function ($ctrl, msg) {
        var $msg = this.$userMsgBox.clone();
        $msg.find('.msg-wraper-user').html(msg).append(this.getTime());;
        $msg.insertAfter($ctrl);
        $('.eb-chatBox').scrollTop(99999999999);
    };

    this.getMsg = function (msg) {
        var $msg = this.$botMsgBox.clone();
        this.$chatBox.append($msg);
        this.showTypingAnim($msg);
        if (this.ready) {
            setTimeout(function () {
                if (msg instanceof jQuery) {
                    $msg.find('.bot-icon').remove();
                    $msg.find('.msg-wraper-bot').css("border", "none").css("background-color", "transparent").html(msg);
                    $msg.find(".msg-wraper-bot").css("padding-right", "3px");
                    $msg.css("margin-left", "26px");
                }
                else
                    $msg.find('.msg-wraper-bot').text(msg).append(this.getTime());
                this.ready = true;
            }.bind(this), 1000);
            this.ready = false;
        }
        else {
            $msg.remove();
            setTimeout(function () {
                this.getMsg(msg);
            }.bind(this), 1001);
        }
        $('.eb-chatBox').scrollTop(99999999999);
    }.bind(this);

    this.formSubmit = function (e) {
        var $btn = $(e.target).closest(".btn");
        this.sendMsg($btn.text());
        $('.msg-wraper-user [name=ctrledit]').remove();
        $btn.closest(".msg-cont").remove();
        this.showConfirm();
    }.bind(this);

    this.showConfirm = function () {
        var msg = 'Your leave application submitted successfully';
        this.getMsg(msg);
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

    this.init();
};