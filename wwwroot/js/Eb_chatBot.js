var Eb_chatBot = function () {
    this.$chatCont = $('<div class="eb-chat-cont"></div>');
    this.$chatHead = $('<div class="eb-chat-head"><span>EXPESSbase Bot <i class="fa fa-comment pull-right" aria-hidden="true"></i></span></div>');
    this.$chatBox = $('<div class="eb-chatBox"></div>');
    this.$inputCont = $('<div class="eb-chat-inp-cont"><input type="text" class="msg-inp"/><button class="btn btn-info msg-send"><i class="fa fa-paper-plane" aria-hidden="true"></i></button></div>');

    this.init = function () {
        $("body").append(this.$chatCont);
        this.$chatCont.append(this.$chatHead);
        this.$chatCont.append(this.$chatBox);
        this.$chatCont.append(this.$inputCont);

        $("#chatbtn").click(this.chatBtn_click);
        $("body").on("click", ".eb-chat-inp-cont .msg-send", this.send_btn);
    };

    this.send_btn = function (e) {
        var $e = $('.msg-inp');
        this.reply($e.val());
        $e.val('');
        $('.eb-chatBox').scrollTop($('.eb-chatBox').innerHeight());

    }.bind(this);

    this.chatBtn_click = function (e) {
        this.$chatCont.toggle(200);
        this.greetings();
        
        for (var i = 0; i < 10; i++) {
            this.reply("Hi  " + i * i);
            this.message("hello  " + i * i);
        }
        this.message('The setting for a paragraph continues down here.There is a blockquote next to it.');
        this.reply('The setting for a paragraph continues down here. There is a blockquote next to it. You may want to make that stand out. The setting for a paragraph continues down here.');

    }.bind(this);

    this.reply = function (msg) {
        var $msg = $('<div class="msg-cont-user"><div class="msg-wraper-user">' + msg + '</div></div>');
        this.$chatBox.append($msg)
    };

    this.message = function (msg) {
        var $msg = $('<div class="msg-cont-bot"><div class="msg-wraper-bot">' + msg + '</div></div>');
        this.$chatBox.append($msg)
    };
    this.init();
    this.greetings = function () {
        var time = new Date().getHours();
        var greeting = null;
        if (time < 12) {
            greeting = "Good morning!";
        }
        if (time > 12) {
            greeting = 'Good afternoon!';
        }
        this.message('Hello Roby, ' + greeting);
    }.bind(this);
};