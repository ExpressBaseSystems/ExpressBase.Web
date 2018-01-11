var SolutionDashBoard = function () {

    this.editConnectionRow = function (e) {
        var whichModal = $(e.target).closest(".btn").attr("whichmodal");
        var whichRow = $(e.target).closest("tr").attr("id");
        $("#" + whichModal).modal("toggle");
        $.each($(e.target).closest("td").siblings(), function (i,obj) {
            var input = $(obj).attr("field");
            $("[name='" + input + "']").val($(obj).children().val());
        }).bind(this);
    };

    this.init = function () {
        $(".edit-btn").on("click", this.editConnectionRow.bind(this));
    };

    this.init();
};