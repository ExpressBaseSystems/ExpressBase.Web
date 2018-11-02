var EbAlert = function (settings) {
    this.id = settings.id;
    this.top = settings.top;
    this.left = settings.left;
    this.right = settings.right;
    this.bottom = settings.bottom;
    this.possition = settings.possition;
    this.width = settings.width;
    this.alertCount = 0;

    this.clearAlert = function (alertUid) {
        $("#" + alertUid).remove();
    };

    this.alert = function (alert) {
        this.alertUid = alert.id || "ebalert_" + this.alertCount;
        this.head = alert.head;
        this.body = alert.body;
        this.type = alert.type || "danger";
        this.delay = alert.delay || 1e7;
        this.$CurAlert = $('<div id=' + this.alertUid + ' class="alert alert-' + this.type + ' alert-dismissable fade in">'
            + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
            + '<strong>' + alert.head + '</strong> &nbsp;' + alert.body
            + '</div>');
        $('#' + this.id).append(this.$CurAlert);
        setTimeout(function () {
            this.fadeTo(600, 0).slideUp(600, function () {
                this.remove();
            });
        }.bind(this.$CurAlert), this.delay);
        this.alertCount++;
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