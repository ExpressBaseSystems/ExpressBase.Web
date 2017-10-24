var Eb_ObjectCommon = function (refid, dsobj, cur_status, ver_num, tabNum, type) {
    this.ver_Refid = refid;
    this.Current_obj = dsobj;
    this.Current_obj.status = cur_status;
    this.Current_obj.versionNumber = ver_num;
    this.tabNum = tabNum;
    this.ObjectType = type;

    this.init = function () {
        $('#status').off('click').on('click', this.LoadStatusPage.bind(this));
        $('#ver_his').off("click").on("click", this.VerHistory.bind(this));
    }

    this.LoadStatusPage = function () {
        $.LoadingOverlay("show");
        this.tabNum++;
        var navitem = "<li><a data-toggle='tab' href='#vernav" + this.tabNum + "'> status " + this.Current_obj.versionNumber + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + this.tabNum + "' class='tab-pane fade'>";
        this.AddVerNavTab(navitem, tabitem);
        $.post("../Eb_Object/GetLifeCycle", { _tabnum: this.tabNum, cur_status: this.Current_obj.status, refid: this.ver_Refid }, this.getLifecyleInner.bind(this) );
    };

    this.getLifecyleInner = function (text) {
        $('#vernav' + this.tabNum).append(text);
        $.LoadingOverlay("hide");
    };

    this.AddVerNavTab = function (navitem, tabitem) {
        $("#versionNav a[href='#vernav" + this.tabNum + "']").tab('show');
        $('#versionNav').append(navitem);
        $('#versionTab').append(tabitem);
        $("#versionNav a[href='#vernav" + this.tabNum + "']").tab('show');
        $('.closeTab').off("click").on("click", this.deleteTab.bind(this));
    }

    this.deleteTab = function (e) {
        var tabContentId = $(e.target).parent().attr("href");
        $(e.target).parent().parent().remove(); //remove li of tab
        $(tabContentId).remove();
        $('#versionNav a:last').tab('show'); // Select first tab        
    };

    this.VerHistory = function () {
        $.LoadingOverlay("show");
        this.Version_List();
    }

    this.Version_List = function () {
        $.LoadingOverlay("hide");
        this.SetValues();
        this.tabNum++;
        var navitem = "<li><a data-toggle='tab' href='#vernav" + this.tabNum + "'>History<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + this.tabNum + "' class='tab-pane fade'></div>";
        this.AddVerNavTab(navitem, tabitem);
        $.post("../Eb_Object/VersionHistory", { objid: this.ver_Refid, tabnum: this.tabNum, Objtype: type }, this.versionHistoryInner.bind(this));
        
    };

    this.versionHistoryInner = function (result) {
        $("#vernav" + this.tabNum).append(result);
        var scrollPos = $('#versionTab').offset().top;
        $(window).scrollTop(scrollPos);
        $("#vernav" + this.tabNum + " .view_code").off("click").on("click", this.OpenPrevVer.bind(this));
        $.LoadingOverlay("hide");
    };

    this.SetValues = function () {
        this.Code = window.editor.getValue();
        this.changeLog = $('#obj_changelog').val();
    }

    this.OpenPrevVer = function (e) {
        $.LoadingOverlay("show");
        this.ver_Refid = $(e.target).attr("data-id");
        this.Current_obj.versionNumber = $(e.target).attr("data-verNum");
        $.post('../Eb_Object/VersionCodes', { objid: this.ver_Refid, objtype: this.ObjectType })
            .done(this.VersionCode_success.bind(this));
    };
    

    this.VersionCode_success = function (data) {
        this.tabNum++;
        this.Current_obj =JSON.parse(data);
        $.post('../Eb_Object/CallObjectEditor', { _dsobj: data, tabnum: this.tabNum, objtype: this.ObjectType })
            .done(this.CallObjectEditor_success.bind(this));
    };

    this.CallObjectEditor_success = function (data) {
        var navitem = "<li><a data-toggle='tab' class='cetab' href='#vernav" + this.tabNum + "' data-verNum='" + this.Current_obj.versionNumber + "'>v." + this.Current_obj.versionNumber + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + this.tabNum + "' class='tab-pane fade' data-id=" + this.ver_Refid + ">";
        this.AddVerNavTab(navitem, tabitem);

        $('#vernav' + this.tabNum).append(data);
        $.LoadingOverlay("hide");
    };

    this.init();
};