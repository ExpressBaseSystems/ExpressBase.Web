var Eb_ObjectCommon = function (refid, dsobj, cur_status, ver_num, tabNum, type) {
    this.ver_Refid = refid;
    this.Current_obj = dsobj;
    this.Current_obj.Status = cur_status;
    this.Current_obj.VersionNumber = ver_num;
    this.tabNum = tabNum;
    this.ObjectType = type;
    this.ObjCollection = {};

    this.init = function () {
        $('#status').off('click').on('click', this.LoadStatusPage.bind(this));
        $('#ver_his').off("click").on("click", this.VerHistory.bind(this));
        $('#compare').off('click').on('click', this.Compare.bind(this));
        $('a[data-toggle="tab"].cetab').on('click', this.TabChangeSuccess.bind(this));
    }

    this.LoadStatusPage = function () {
        $.LoadingOverlay("show");
        this.tabNum++;
        var navitem = "<li><a data-toggle='tab' href='#vernav" + this.tabNum + "'> status " + this.Current_obj.VersionNumber + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + this.tabNum + "' class='tab-pane fade'>";
        this.AddVerNavTab(navitem, tabitem);
        $.post("../Eb_Object/GetLifeCycle", { _tabNum: this.tabNum, cur_status: this.Current_obj.Status, refid: this.ver_Refid }, this.getLifecyleInner.bind(this) );
    };

    this.getLifecyleInner = function (text) {
        $('#vernav' + this.tabNum).append(text);
        $.LoadingOverlay("hide");
    };

    this.AddVerNavTab = function (navitem, tabitem) {
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
        this.Code = window["editor"+this.tabNum].getValue();
        this.changeLog = $('#obj_changelog').val();
    }

    this.OpenPrevVer = function (e) {
        $.LoadingOverlay("show");
        this.ver_Refid = $(e.target).attr("data-id");
        //this.Current_obj.VersionNumber = $(e.target).attr("data-verNum");
        $.post('../Eb_Object/VersionCodes', { objid: this.ver_Refid, objtype: this.ObjectType })
            .done(this.VersionCode_success.bind(this));
    };

    this.VersionCode_success = function (vernum, data) {
        this.tabNum++;
        this.Current_obj = JSON.parse(data);
        $.post('../Eb_Object/CallObjectEditor', { _dsobj: data, _tabnum: this.tabNum, objtype: this.ObjectType })
            .done(this.CallObjectEditor_success.bind(this));
    };

    this.CallObjectEditor_success = function (data) {
        var navitem = "<li><a data-toggle='tab' class='cetab' href='#vernav" + this.tabNum + "' data-verNum='" + this.Current_obj.VersionNumber + "'>v." + this.Current_obj.VersionNumber + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + this.tabNum + "' class='tab-pane fade' data-id=" + this.ver_Refid + ">";
        this.AddVerNavTab(navitem, tabitem);

        $('#vernav' + this.tabNum).append(data);
        $.LoadingOverlay("hide");
    };

    this.Compare = function () {

        this.tabNum++;
        $.post('../Eb_Object/CallDifferVC', { _tabnum: this.tabNum})
            .done(this.Load_differ.bind(this));
    }
    this.Load_differ =function(data){
        var navitem = "<li><a data-toggle='tab' href='#vernav" + this.tabNum + "'> compare <button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + this.tabNum + "' class='tab-pane fade'>";
        this.AddVerNavTab(navitem, tabitem);
        $('#vernav' + this.tabNum).append(data);
        $('#compare_inner' + this.tabNum).off("click").on("click", this.Differ.bind(this));
        this.Load_version_list();
        $('.selectpicker').selectpicker({
            size: 4
        });

    };

    this.Differ = function () {
        var verRefid1 = $('#selected_Ver_1_' + this.tabNum + ' option:selected').val();
        var verRefid2 = $('#selected_Ver_2_' + this.tabNum + ' option:selected').val();
        if (verRefid2 === "Select Version") {
            alert("Please Select A Version");
            $.LoadingOverlay("hide");
        }
        else if (verRefid1 === "Current") {
            $.LoadingOverlay("show");
            var v1 = this.Current_obj.versionNumber;
            var v2 = $('#selected_Ver_2_' + this.tabNum + ' option:selected').attr("data-tokens");
            this.SetValues();
            this.getSecondVersionCode(verRefid2, v1, v2, this.Code);

        }
        else {
            $.LoadingOverlay("show");
            var data_1;
            v1 = $('#selected_Ver_1_' + this.tabNum + ' option:selected').attr("data-tokens");
            v2 = $('#selected_Ver_2_' + this.tabNum + ' option:selected').attr("data-tokens");
            $.post('../Eb_Object/VersionCodesAsObj', { "objid": verRefid1, "objtype": this.ObjectType }, this.getSecondVersionCode.bind(this, verRefid2, v1, v2));
        }
    }

    this.Load_version_list = function () {
        $('#loader_fd' + this.tabNum).show();
        var tabnum = this.tabNum;
        $.post('../Eb_Object/GetVersions', { objid: this.ver_Refid },
            function (data) {
                $('#selected_Ver_1_' + tabnum).append("<option value='Current' data-tokens='Select Version'>Current</option>");
                $('#selected_Ver_2_' + tabnum).append("<option value='Select Version' data-tokens='Select Version'>Select version</option>");
                $.each(data, function (i, obj) {
                    $('#selected_Ver_1_' + tabnum).append("<option value='" + obj.refId + "' data-tokens='" + obj.versionNumber + "'> v " + obj.versionNumber + "</option>");
                    $('#selected_Ver_2_' + tabnum).append("<option value='" + obj.refId + "' data-tokens='" + obj.versionNumber + "'> v " + obj.versionNumber + "</option>");
                });
                $('.selectpicker').selectpicker({
                    size: 4
                });
                $('.selectpicker').selectpicker('refresh');
                $('#loader_fd' + tabnum).hide();
            })

    };

    this.getSecondVersionCode = function (verRefid2, selected_ver_number_1, selected_ver_number_2, result) {
        $.post('../Eb_Object/VersionCodesAsObj', { "objid": verRefid2, "objtype": this.ObjectType }).done(this.CallDiffer.bind(this, result, selected_ver_number_1, selected_ver_number_2));
    };

    this.CallDiffer = function (data_1, selected_ver_number, curr_ver, data_2) {
        data_1 = JSON.stringify(JSON.parse(data_1), null, 2);
        data_2 = JSON.stringify(JSON.parse(data_2), null, 2);
        var getNav = $("#versionNav li.active a").attr("href");
        this.SetValues();
        if (selected_ver_number > curr_ver) {
            $.post("../Eb_Object/GetDiffer", {
                NewText: data_1, OldText: data_2
            })
                .done(this.showDiff.bind(this, selected_ver_number, curr_ver));
        }
        else {
            $.post("../Eb_Object/GetDiffer", {
                NewText: data_2, OldText: data_1
            })
                .done(this.showDiff.bind(this, curr_ver, selected_ver_number));
        }
    };

    this.showDiff = function (new_ver_num, old_ver_num, data) {
        var getNav = $("#versionNav li.active a").attr("href");

        $('#versionNav li.active a').text().replace('compare', "v." + old_ver_num + " v/s v." + new_ver_num);

        $('#compare_result' + this.tabNum).empty();
        $('#compare_result' + this.tabNum).append("<div id='oldtext" + this.tabNum + "'class='leftPane'>" +
            "</div>" +
            "  <div id='newtext" + this.tabNum + "' class='rightPane'>" +
            "</div>");
        $('#oldtext' + this.tabNum).html("<div class='diffHeader'>v." + old_ver_num + "</div>" + data[0]);
        $('#newtext' + this.tabNum).html("<div class='diffHeader'>v." + new_ver_num + "</div>" + data[1]);
        $('.leftPane').scroll(function () {
            $('.rightPane').scrollTop($(this).scrollTop());
            $('.rightPane').scrollLeft($(this).scrollLeft());
        });
        $('.rightPane').scroll(function () {
            $('.leftPane').scrollTop($(this).scrollTop());
            $('.leftPane').scrollLeft($(this).scrollLeft());
        });
        var scrollPos = $('#compare_result' + this.tabNum).offset().top;
        $(window).scrollTop(scrollPos);
        $.LoadingOverlay("hide");
    };

    this.init();
};