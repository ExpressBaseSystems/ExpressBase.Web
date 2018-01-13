var SolutionDashBoard = function () {

    this.editConnectionRow = function (e) {
        var whichModal = $(e.target).closest(".btn").attr("whichmodal");        
        $("#" + whichModal).modal("toggle");
        $("#" + whichModal + " [name='IsNew']").val(false);
        $.each($(e.target).closest("td").siblings(), function (i,obj) {
            var input = $(obj).attr("field");
            $("#" + whichModal+" [name='" + input + "']").val($(obj).text());
        }).bind(this);
    };

    this.addConnectionRow = function (e) {
        var whichModal = $(e.target).closest(".btn").attr("whichmodal"); 
        $("#" + whichModal).modal("toggle");       
        $.each($("#" + whichModal).children().find("input"), function (i, obj) {
            $(obj).val("");
        }).bind(this);
        $("#" + whichModal + " [name='IsNew']").val(true);
    };
    this.dbconnectionsubmit = function (e) {
        e.preventDefault();
        var postData = $(e.target).serializeArray();
        $.ajax({
            type: 'POST',
            url: "../ConnectionManager/DataDb",           
            data: postData,
            beforeSend: function () {

            }
        }).done(function (data) {
           
        }.bind(this));      
    };

    this.init = function () {
        $(".edit-btn").on("click", this.editConnectionRow.bind(this));
        $(".addConnection").on("click", this.addConnectionRow.bind(this));
        $("#dbConnectionSubmit").on("submit", this.dbconnectionsubmit.bind(this));
    };

    this.init();
};