var EbAlert = function (settings) {
    this.id = settings.id;
    this.top = settings.top;
    this.left = settings.left;
    this.right = settings.right;
    this.bottom = settings.bottom;
    this.possition = settings.possition;
    this.width = settings.width;

    this.alert = function (alert) {
        this.head = alert.head;
        this.body = alert.body;
        this.type = alert.type||"danger";
        this.$CurAlert = $('<div class="alert alert-' + this.type + ' alert-dismissable fade in">'
            + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
            + '<strong>' + alert.head + '</strong> &nbsp;' + alert.body
            + '</div> ');
        $('#' + this.id).append(this.$CurAlert);
        setTimeout(function () {
            this.fadeTo(300, 0).slideUp(300, function () {
                this.remove();
            });
        }.bind(this.$CurAlert), 4000);
    };
    this.Init = function () {
        if (this.possition) {
            this.top = ""; this.bottom = ""; this.left = ""; this.right = "";
        }
        if (this.possition === "top-right") {
            this.top = 0; this.right = 0;
        }
        else if (this.possition === "top-left") {
            this.top = 0; this.left = 0;
        }
        else if (this.possition === "bottom-right") {
            this.bottom = 0; this.right = 0;
        }
        else if (this.possition === "bottom-left") {
            this.bottom = 0; this.right = 0;
        }
        var $alertBox = $('<div id="' + this.id + '" style="top:' + this.top + 'px; bottom:' + this.bottom + 'px; left:' + this.left + 'px; right:' + this.right + 'px;" class="ebalert-cont eb-alertbox"></div >');
        $('body').append($alertBox);
        if (typeof this.width === "number")
            this.width += "px";
        $alertBox.css("width", this.width);
    };
    this.Init();
};