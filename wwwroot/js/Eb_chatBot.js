var Eb_chatBot = function () {
    this.$chatCont = $('<div class="eb-chat-cont"></div>');
    this.$chatHead = $('<div class="eb-chat-head"><span>EXPESSbase Bot <i class="fa fa-comment pull-right" aria-hidden="true"></i></span></div>');
    this.$chatBox = $('<div class="eb-chatBox"></div>');
    this.$inputCont = $('<div class="eb-chat-inp-cont"><input type="text" class="msg-inp"/><button class="btn btn-info msg-send"><i class="fa fa-paper-plane" aria-hidden="true"></i></button></div>');

    this.$form = null;
    this.formControls = [];
    this.formValues = {};

    this.init = function () {
        $("body").append(this.$chatCont);
        this.$chatCont.append(this.$chatHead);
        this.$chatCont.append(this.$chatBox);
        this.$chatCont.append(this.$inputCont);
        $("#chatbtn").click(this.chatBtn_click);
        $("body").on("click", ".eb-chat-inp-cont .msg-send", this.send_btn);
        $("body").on("click", ".chat-ctrl-cont [name=ctrlsubmit]", this.ctrlSend);
        $("body").on("click", ".eb-chatBox [name=formsubmit]", this.formSubmit);
        $("body").on("click", ".btn-box [idx=0]", this.startFormInteraction);
        $('.msg-inp').on("keyup", this.txtboxKeyup);
    };
    this.txtboxKeyup = function (e) {
        if (e.ctrlKey && e.which === 10)/////////////////////////////
            this.send_btn();
    }.bind(this);

    this.send_btn = function () {
        var $e = $('.msg-inp');
        var msg = $e.val().trim();
        if (!msg) {
            $e.val('');
            return;
        };
        this.sendMsg(msg);
        $('.eb-chatBox').scrollTop(999999999);
        $e.val('');

    }.bind(this);

    this.chatBtn_click = function (e) {
        this.$chatCont.toggle(200);
        this.greetings();
        this.Query("Apply leave ?", ["Yes", "No"]);

        //this.getMsg('The setting for a paragraph continues down here.There is a blockquote next to it.');
        //this.sendMsg('The setting for a paragraph continues down here. There is a blockquote next to it. You may want to make that stand out. The setting for a paragraph continues down here.');

    }.bind(this);

    this.sendMsg = function (msg) {
        var $msg = $('<div class="msg-cont-user"><div class="msg-wraper-user"></div></div>');
        $msg.find('.msg-wraper-user').text(msg);
        this.$chatBox.append($msg)
    };

    this.getMsg = function (msg) {
        var $msg = $('<div class="msg-cont-bot"><div class="msg-wraper-bot"></div></div>');
        $msg.find('.msg-wraper-bot').text(msg);
        this.$chatBox.append($msg)
    };

    this.greetings = function () {
        var time = new Date().getHours();
        var greeting = null;
        if (time < 12) {
            greeting = "Good morning!";
        }
        else if (time <= 12 && time > 16) {
            greeting = 'Good afternoon!';
        }
        else {
            greeting = 'Good evening!';
        }
        this.getMsg('Hello Roby, ' + greeting);
        this.getMsg('How can i help you ?');
    }.bind(this);

    this.Query = function (query, OptArr) {
        this.getMsg(query);
        var Options = this.getButtons(OptArr);
        this.getCtrl('<div class="btn-box">' + Options + '</div>');

    };

    this.getButtons = function (OptArr) {
        var Html = '';
        $.each(OptArr, function (i, opt) { Html += '<button class="btn" idx="' + i + '">' + opt + '</button>'; });
        return Html;
    };

    this.getForm = function () {
        $.post('../Eb_Object/GetObjHtml', {
            refid: "eb_roby_dev-eb_roby_dev-0-809-1488"
        },
            function (data) {
                this.$form = data;
                this.setFormControls();
            }.bind(this));
    }.bind(this);


    this.startFormInteraction = function () {
        $('.eb-chat-inp-cont').hide();
        this.getForm();
    }.bind(this);

    this.setFormControls = function () {
        var ctrls = $(this.$form).filter('.Eb-ctrlContainer');
        $.each(ctrls, function (i, control) {
            this.formControls.push($(control))
        }.bind(this));
        this.getNextControl();
    }.bind(this);

    this.ctrlSend = function (e) {
        var $btn = $(e.target).closest(".btn");
        var idx = parseInt($btn.attr('idx')) + 1;
        var id = $btn.siblings('.Eb-ctrlContainer').attr('id').slice(5).trim();
        this.formValues[id] = $('#' + id).val();
        $btn.html('<i class="fa fa-pencil-square-o" aria-hidden="true"></i>');
        if (idx !== this.formControls.length) {
            this.getNextControl(idx);
        }
        else
            this.getCtrl('<button class="btn" name="formsubmit">Confirm <i class="fa fa-check" aria-hidden="true"></i></button>');

    }.bind(this);

    this.getNextControl = function (idx) {
        idx = idx || 0;
        if (idx === this.formControls.length)
            return;
        var msg = '<div class="chat-ctrl-cont">' + this.formControls[idx].outerHTML() + '<button class="btn" idx=' + idx + ' name="ctrlsubmit"><i class="fa fa-paper-plane-o" aria-hidden="true"></i></button></div>';
        this.getCtrl(msg);
    }.bind(this);

    this.getCtrl = function (msg) {
        var $msg = $('<div class="msg-cont-bot"><div class="msg-wraper-bot">' + msg + '</div></div>');
        this.$chatBox.append($msg)
    };

    this.formSubmit = function (e) {
        this.renderSummary();
    }.bind(this);

    this.renderSummary = function () {
        var html = '<div>'
        $.each(this.formValues, function (name, value) {
            html += '<div><span><b>' + $('#' + name + 'Lbl').text().trim() + '</b></span> : <span>' + value + '<span></div>'
        });
        html += '</div>'
        this.getCtrl(html);
    }.bind(this);

    this.init();
};