var Eb_ObjectCommon = function (refid, dsobj, cur_status, ver_num, tabNum, type, major) {
    this.ver_Refid = refid;
    this.Current_obj = dsobj;
    this.Current_obj.Status = cur_status;
    this.Current_obj.VersionNumber = ver_num;
    this.tabNum = tabNum;
    this.ObjectType = type;
    this.ObjCollection = {};
    this.ObjWrapper = null;

    this.init = function () {
        $('#status').off('click').on('click', this.LoadStatusPage.bind(this));
        $('#ver_his').off("click").on("click", this.Version_List.bind(this));
        $('#compare').off('click').on('click', this.Compare.bind(this));
        $('#save').off("click").on("click", this.Save.bind(this, false));
        $('#commit').off("click").on("click", this.Commit.bind(this, false));
        $('a[data-toggle="tab"].cetab').on('click', this.TabChangeSuccess.bind(this));
        $('.wrkcpylink').off("click").on("click", this.OpenPrevVer.bind(this));
    }

    this.LoadStatusPage = function () {
        $.LoadingOverlay("show");
        this.tabNum++;
        var navitem = "<li><a data-toggle='tab' href='#vernav" + this.tabNum + "'> status " + this.Current_obj.VersionNumber + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + this.tabNum + "' class='tab-pane fade'>";
        this.AddVerNavTab(navitem, tabitem);
        $.post("../Eb_Object/GetLifeCycle", { _tabNum: this.tabNum, cur_status: this.Current_obj.Status, refid: this.ver_Refid }, this.getLifecyleInner.bind(this));
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
    
    this.Version_List = function () {
        $.LoadingOverlay("show");
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
    
    this.OpenPrevVer = function (e) {
        $.LoadingOverlay("show");
        this.ver_Refid = $(e.target).attr("data-id");
        $.post('../Eb_Object/VersionCodes', { objid: this.ver_Refid, objtype: this.ObjectType })
            .done(this.VersionCode_success.bind(this));
    };

    this.VersionCode_success = function (data) {
        this.tabNum++;
        this.Current_obj = JSON.parse(data);
        $.post('../Eb_Object/CallObjectEditor', { _dsobj: data, _tabnum: this.tabNum, objtype: this.ObjectType, _refid: this.ver_Refid })
            .done(this.CallObjectEditor_success.bind(this));
    };

    this.CallObjectEditor_success = function (data) {
        var navitem = "<li><a data-toggle='tab' class='cetab' href='#vernav" + this.tabNum + "' data-verNum='" + this.Current_obj.VersionNumber + "'>v." + this.Current_obj.VersionNumber + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + this.tabNum + "' class='tab-pane fade' data-id=" + this.ver_Refid + ">";
        this.AddVerNavTab(navitem, tabitem);
        $('a[data-toggle="tab"].cetab').on('click', this.TabChangeSuccess.bind(this));
        $('#vernav' + this.tabNum).append(data);
        this.UpdateCreateVersionDD();
        $.LoadingOverlay("hide");
    };

    this.Compare = function () {
        this.tabNum++;
        $.post('../Eb_Object/CallDifferVC', { _tabnum: this.tabNum })
            .done(this.Load_differ.bind(this));
    }

    this.Load_differ = function (data) {
        var navitem = "<li><a data-toggle='tab' href='#vernav" + this.tabNum + "'> compare <button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + this.tabNum + "' class='tab-pane fade'>";
        this.AddVerNavTab(navitem, tabitem);
        $('#vernav' + this.tabNum).append(data);
        this.Load_version_list();
        $('.selectpicker').selectpicker({
            size: 4
        });

        $('#compare_inner' + this.tabNum).off("click").on("click", this.Differ.bind(this));
    };

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

    this.Differ = function () {
        var Refid1 = $('#selected_Ver_1_' + this.tabNum + ' option:selected').val();
        var Refid2 = $('#selected_Ver_2_' + this.tabNum + ' option:selected').val();
        var v1 = $('#selected_Ver_1_' + this.tabNum + ' option:selected').attr("data-tokens");
        var v2 = $('#selected_Ver_2_' + this.tabNum + ' option:selected').attr("data-tokens");
        if (v1 > v2) {
            var vernum1 = v1;
            var vernum2 = v2;
        }
        else {
            var vernum1 = v2;
            var vernum2 = v1;
        }
        if (Refid2 === "Select Version") {
            alert("Please Select A Version");
            $.LoadingOverlay("hide");
        }
        else {
            $.LoadingOverlay("show");
            $.post('../Eb_Object/GetObjectsToDiff', { ver1refid: Refid1, ver2refid: Refid2 }).done(this.showDiff.bind(this, vernum1, vernum2));
        }
    };
   
    this.showDiff = function (new_ver_num, old_ver_num, data) {
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

    this.TabChangeSuccess = function (e) {
        var target = $(e.target).attr("href");
        this.ObjWrapper = this.ObjCollection[target];
        this.ver_Refid = this.ObjWrapper.Refid;
        this.Current_obj = this.ObjWrapper.DataSourceObj;
        this.ObjWrapper.propGrid.setObject(this.Current_obj, AllMetas["EbDataSource"]);
        this.UpdateCreateVersionDD();
    };

    this.Save = function () {
        var tagvalues = $('#tags').val();
        $.post("../Eb_Object/SaveEbObject", { _refid: this.ver_Refid, _json: JSON.stringify(this.Current_obj), _rel_obj: "", _tags: tagvalues});
    };

    this.Commit = function () {
        var tagvalues = $('#tags').val();
        var changeLog = $('#obj_changelog').val();
        $.post("../Eb_Object/CommitEbObject", {
            _refid: this.ver_Refid, _changeLog: changeLog, 
            _json: JSON.stringify(this.Current_obj),
            _rel_obj: "", _tags: tagvalues
        });
    };

    this.UpdateCreateVersionDD = function () {
        $('#create option').remove()
        $('#create').selectpicker('destroy');
        $('#create').selectpicker('refresh');
        var arr = this.Current_obj.VersionNumber.split(".")
        var vNumMajor = ("v." + (parseInt(major) + 1) + "." + arr[1] + "." + arr[2] + ".w");
        var vNumMinor = ("v." + arr[0] + "." + (parseInt(arr[1]) + 1) + "." + arr[2] + ".w");
        var vNumPatch = ("v." + arr[0] + "." + arr[1] + "." + (parseInt(arr[2]) + 1) + ".w");

        $("#create").append("<option>Create</option>"+
            "<option id='_major'> Major Version - (" + vNumMajor + ") from(v." + this.Current_obj.VersionNumber+")</option >"+
            "<option id= '_minor'> Minor Version - (" + vNumMinor + ") from(v." + this.Current_obj.VersionNumber +")</option > "+
            "<option id='_patch'>Patch Version - (" + vNumPatch + ") from (v." + this.Current_obj.VersionNumber + ")</option>");
        $('#create').selectpicker('refresh');
    }

    this.init();
};