var AppDashBoard = function (appid) {
    this.objectTab = $("#Objects");
    this.ExportCollection = [];
	this.AppId = appid;

    this.searchObjects = function (e) {
        var srchBody = $(".raw-objectTypeWrprBlk:visible");
        var srch = $(e.target).val().toLowerCase();
        var count = 0;
        $.each(srchBody.find(".objitems"), function (i, obj) {
            var cmpstr = $(obj).find(".head4").text().toLowerCase();
            if (cmpstr.indexOf(srch) !== -1) {
                $(obj).show();
                count++;
            }
            else
                $(obj).hide();
        });
    };

    this.expand = function(e) {
        let trigger = $(e.target).closest(".sidebar-objtypes-listitem").children("a").attr("link-id");
        $(".raw-objectTypeWrprBlk").hide();
        $(".active_type").removeClass("active_type");
        $(e.target).closest(".sidebar-objtypes-listitem").addClass("active_type");
        $(`#${trigger}`).fadeIn();
    }

    this.export = function (e) {
        this.ExportCollection.length = 0;
        this.objectTab.find(`input[name="ExportMark"]`).each(function (i, o) {
            if ($(o).is(":checked")) {
                this.ExportCollection.push($(o).attr("objid"));
            }
        }.bind(this));
        if (this.ExportCollection.length > 0)
            this.startExp();
    };

    this.startExp = function () {
        var form = document.createElement("form");
        form.style.display = "none";
        form.setAttribute("method", "post");
        form.setAttribute("action", "../ImportExport/ExportOSE");
        var ids = document.createElement("input");
        ids.setAttribute("name", "ids");
        ids.setAttribute("value", this.ExportCollection.join());
		form.appendChild(ids);
		var appid = document.createElement("input");
		appid.setAttribute("name", "AppId");
		appid.setAttribute("value", this.AppId);
		form.appendChild(appid);
        document.body.appendChild(form);
        form.submit();
    };

    this.start_exe = function () {
        $(".appdash_obj_container").off("keyup").on("keyup", "#obj_search_input", this.searchObjects.bind(this));
        $("#ExportBtn").off("click").on("click", this.export.bind(this));
        $(".sidebar-objtypes-listitem").off("click").on("click", this.expand.bind(this));
    }

    this.start_exe();
}