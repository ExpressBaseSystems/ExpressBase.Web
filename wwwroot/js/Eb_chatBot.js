var Eb_chatBot = function () {
    this.$chatBox = $('<div class="eb-chatBox"></div>');

    this.init = function () {
        $("body").append(this.$chatBox);

        $("#chatbtn").click(this.chatBtn_click);
    };

    this.chatBtn_click = function (e) {
        this.$chatBox.toggle(200);

        for (var i = 0; i < 10; i++) {
            setTimeout(function () {
                this.reply("Hi  " + i * i);
                }.bind(this), 1000);
            }
        }.bind(this), 1000);

    this.reply = function (msg) {
        var $msg = $('<div class=   "msg-cont">' + msg +'</div>');
        this.$chatBox.append($msg)
    };
    this.init();
};