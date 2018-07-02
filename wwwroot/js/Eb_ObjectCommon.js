var Eb_ObjectCommon = function (refid, dsobj, cur_status, ver_num, tabNum, type, major, ssurl) {
    this.ver_Refid = refid;
    this.Current_obj = dsobj;
    //this.Current_obj.Status = cur_status;
    //this.Current_obj.VersionNumber = ver_num;
    this.tabNum = tabNum;
    this.ObjectType = type;
    this.ObjCollection = {};
    this.ObjWrapper = null;
    this.ssurl = ssurl;
    this.ControlCollection = {};
    this.tabchangeFlag = false;
    this.alertMsg = null;
    this.alertType = null;
    this.flagRun = false;
    this.FlagSave = false;
    this.messg = new EbAlert(
        {
            id: "dshbrd_alert",
            possition: "top-right"
        });
    this.saveOrCommitSuccess = function (refif) { };//edit by amal
    this.PreviewObject = function () { };//edits by amal
    

    this.init = function () {
        $('#status').off('click').on('click', this.LoadStatusPage.bind(this));
        $('#ver_his').off("click").on("click", this.Version_List.bind(this));
        $('#compare').off('click').on('click', this.Compare.bind(this));
        $('#save').off("click").on("click", this.Save.bind(this));
        $('#commit').off("click").on("click", this.Commit.bind(this, false));
        $('a[data-toggle="tab"].cetab').off("click").on('click', this.TabChangeSuccess.bind(this));
        $('.wrkcpylink').off("click").on("click", this.OpenPrevVer.bind(this));
        //$(window).bind('keydown', this.checkKeyDown.bind(this));
        $(window).off("keydown").on("keydown", this.checkKeyDown.bind(this));

        this.target = $("#versionNav li.active a").attr("href");//edits by amal
    }
    
    this.checkKeyDown = function (event) {
        if (event.ctrlKey || event.metaKey) {
            if (event.which === 83) {
                event.preventDefault();
                this.Save();
                //alert(111);
            }
        }
    }
    this.ShowMessage = function () {
        this.tags = $('#tags').val();
        this.UpdateDashboard();
        this.alertType = "success";
        this.messg.alert({
            head: "alert",
            body: this.alertMsg,
			type: this.alertType,
			delay: 3000
        })
        $.LoadingOverlay("hide");
        $('#close_popup').trigger('click');
    };

    this.UpdateTab = function (data) {
        //var target = $("#versionNav li.active a").attr("href");
        var target = this.target;//edits by amal
        this.ver_Refid = data;
        var getNav = $("#versionNav li.active a").attr("href");
        $(getNav).attr("data-id", this.ver_Refid);
        if (this.Current_obj.Status === null || this.Current_obj.Status === undefined){
            this.Current_obj.Status = "Dev";
        }
        if (this.Current_obj.VersionNumber !== null && this.Current_obj.VersionNumber !== undefined) {
            if (!this.FlagSave) {
                this.Current_obj.VersionNumber = this.Current_obj.VersionNumber.replace(/.w/g, '');
                this.alertMsg = "Commit Success";
            }
            else {
                this.alertMsg = "Save Success";
                this.FlagSave = false;
            }
        }
        else {
            if (this.FlagSave) {
                this.Current_obj.VersionNumber = "1.0.0.w";
                this.alertMsg = "Save Success";
                this.FlagSave = false;
            }
            else {
                this.Current_obj.VersionNumber = "1.0.0";
                this.alertMsg = "Commit Success";
            }
        }
        this.ObjCollection[target].EbObject = this.Current_obj;
        this.ObjCollection[target].Refid = this.ver_Refid;

        $(`#versionNav [href='${target}']`).attr("data-verNum", this.Current_obj.VersionNumber);//edits by amal
        $(`#versionNav [href='${target}']`).text("v." + this.Current_obj.VersionNumber);//edits by amal
        //$("#versionNav li.active a").attr("data-verNum", this.Current_obj.VersionNumber);
        //$("#versionNav li.active a").text("v." + this.Current_obj.VersionNumber);

        if (this.flagRun) {
            this.ObjCollection[target].SaveSuccess();
        }
        else
            this.ShowMessage();
        $.LoadingOverlay("hide");

        this.saveOrCommitSuccess(data);//edit by amal
    };

    this.UpdateDashboard = function () {
        $.post("../Eb_Object/UpdateObjectDashboard", { refid: this.ver_Refid }).done(this.UpdateDashboard_Success.bind(this));
    };

    this.UpdateDashboard_Success = function (data) {
		$('#object_Dashboard_main').empty().append(data);
		var words = this.ver_Refid.split("-");
		window.location.search.replace(null, words[3])
        menu.resultObj = null;//reload menu by amal on 27/04/2018
        menu.init();//reload menu by amal on 27/04/2018

        commonObj.init();
        $('#tags').tagsinput('add', this.tags);
    };

    this.LoadStatusPage = function () {
        $.LoadingOverlay("show");
        this.tabNum++;
        var navitem = "<li><a data-toggle='tab' href='#vernav" + this.tabNum + "'> Status " + this.Current_obj.VersionNumber + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + this.tabNum + "' class='tab-pane fade vernav'>";
        this.AddVerNavTab(navitem, tabitem);
        $('a[data-toggle="tab"]').on('click', this.TabChangeSuccess.bind(this));
        $("#obj_icons").empty();
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
        $('a[data-toggle="tab"]').on('click', this.TabChangeSuccess.bind(this));
        $("#obj_icons").empty();
        $.post("../Eb_Object/VersionHistory", { objid: this.ver_Refid, tabnum: this.tabNum, Objtype: type }, this.versionHistoryInner.bind(this));

    };

    this.versionHistoryInner = function (result) {
        $("#vernav" + this.tabNum).append(result);
        $("#vernav" + this.tabNum + " .view_code").off("click").on("click", this.OpenPrevVer.bind(this));
        $.LoadingOverlay("hide");
    };

    this.OpenPrevVer = function (e) {
        $.LoadingOverlay("show");
        this.ver_Refid = ($(e.target).attr("data-id")) === null ? $(e.target).parent().attr("data-id") : $(e.target).attr("data-id");

        $.post('../Eb_Object/VersionCodes', { objid: this.ver_Refid, objtype: this.ObjectType })
            .done(this.VersionCode_success.bind(this));
    };

    this.VersionCode_success = function (data) {
        this.tabNum++;
        this.Current_obj = JSON.parse(data);
        $.post('../Eb_Object/CallObjectEditor', { _dsobj: data, _tabnum: this.tabNum, objtype: this.ObjectType, _refid: this.ver_Refid, _ssurl: this.ssurl })
            .done(this.CallObjectEditor_success.bind(this));
    };

    this.CallObjectEditor_success = function (data) {
        var icon;
        if (this.Current_obj.VersionNumber.slice(-1) === 'w') {
            icon = "fa-pencil";
        }
        else {
            icon = "fa-lock";
        }

        var navitem = "<li><a data-toggle='tab' class='cetab' href='#vernav" + this.tabNum + "' data-verNum='" + this.Current_obj.VersionNumber + "'><i class='fa " + icon + "' aria-hidden='true'></i>   v." + this.Current_obj.VersionNumber + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + this.tabNum + "' class='tab-pane fade' data-id=" + this.ver_Refid + ">";
        this.AddVerNavTab(navitem, tabitem);
        $('a[data-toggle="tab"].cetab').on('click', this.TabChangeSuccess.bind(this));
        $('#vernav' + this.tabNum).append(data);
        if (this.Current_obj !== null)
            this.UpdateCreateVersionDD();
        $.LoadingOverlay("hide");

    };

    this.Compare = function () {
        this.tabNum++;
        $.post('../Eb_Object/CallDifferVC', { _tabnum: this.tabNum })
            .done(this.Load_differ.bind(this));
    }

    this.Load_differ = function (data) {
        var navitem = "<li><a data-toggle='tab' href='#vernav" + this.tabNum + "'> Diff <button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + this.tabNum + "' class='tab-pane fade'>";
        this.AddVerNavTab(navitem, tabitem);
        $('a[data-toggle="tab"]').on('click', this.TabChangeSuccess.bind(this));
        $("#obj_icons").empty();
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
                $('#selected_Ver_1_' + tabnum).append("<option value='Select Version' data-tokens='Select Version'>Select Version</option>");
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
        $.LoadingOverlay("show");
        var Refid1 = $('#selected_Ver_1_' + this.tabNum + ' option:selected').val();
        var Refid2 = $('#selected_Ver_2_' + this.tabNum + ' option:selected').val();
        var v1 = $('#selected_Ver_1_' + this.tabNum + ' option:selected').attr("data-tokens");
        var v2 = $('#selected_Ver_2_' + this.tabNum + ' option:selected').attr("data-tokens");
        var vernum1;
        var vernum2;
        if (v1 > v2) {
            vernum1 = v1;
            vernum2 = v2;
        }
        else {
            vernum1 = v2;
            vernum2 = v1;
        }
        if (Refid2 === "Select Version") {
            alert("Please Select A Version");
            $.LoadingOverlay("hide");
        }
        else {
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
        $.LoadingOverlay("hide");
    };

    this.TabChangeSuccess = function (e) {
        var jq = $(e.target).closest("a");
        if (jq.attr("id") === "preview_tab_btn")
            this.PreviewObject();
        else
            this.target = jq.attr("href");

        if ($(e.target).attr("data-vernum") !== undefined) {
            this.tabchangeFlag = true;
            var target = $(e.target).attr("href");
            this.ObjWrapper = this.ObjCollection[target];
            this.ver_Refid = this.ObjWrapper.Refid;
            this.Current_obj = this.ObjWrapper.EbObject;
            //this.ObjWrapper.propGrid.setObject(this.Current_obj, AllMetas["EbDataSource"]);
            this.UpdateCreateVersionDD();
            this.ObjWrapper.GenerateButtons();
            $('#save').show();
            $('#commit_outer').show();
            $('#create_button').show();
            $('#compare').show();
            $('#status').show();
            $('#ver_his').show();
        }
        else {
            $("#obj_icons").empty();
            $('#save').hide();
            $('#commit_outer').hide();
            $('#create_button').hide();
            $('#compare').show();
            $('#status').show();
            $('#ver_his').show();
        }
    };

    this.Save = function () {
        this.FlagSave = true;
        $.LoadingOverlay("show");
        var tagvalues = $('#tags').val();
        var apps = $("#apps").val();
        if (apps === "")
            apps = "0";
		var getNav = this.target;/*$("#versionNav li.active a").attr("href");*/
        if (this.ObjCollection[getNav].EbObject.$type.indexOf("Report") !== -1 || this.ObjCollection[getNav].EbObject.$type.indexOf("Email") !== -1) {
            this.ObjCollection[getNav].BeforeSave();
        }
        if (this.Current_obj.Validate === undefined || this.Current_obj.Validate()){
            $.post("../Eb_Object/SaveEbObject", {
                _refid: this.ver_Refid,
                _json: JSON.stringify(this.Current_obj),
                _rel_obj: this.ObjCollection[getNav].relatedObjects,
                _tags: tagvalues,
                _apps: apps
            }, this.UpdateTab.bind(this));
        }
    };

    this.Commit = function () {
        $.LoadingOverlay("show");
        var tagvalues = $('#tags').val();
        var apps = $("#apps").val();
        if (apps === "")
            apps = "0";
        var changeLog = $('#obj_changelog').val();
		var getNav = this.target; /*$("#versionNav li.active a").attr("href");*/
        if (this.ObjCollection[getNav].EbObject.$type.indexOf("Report") !== -1 || this.ObjCollection[getNav].EbObject.$type.indexOf("Email") !== -1) {
            this.ObjCollection[getNav].BeforeSave();
        }
        if (this.Current_obj.Validate === undefined || this.Current_obj.Validate()) {
            $.post("../Eb_Object/CommitEbObject", {
                _refid: this.ver_Refid, _changeLog: changeLog,
                _json: JSON.stringify(this.Current_obj),
                _rel_obj: this.ObjCollection[getNav].relatedObjects,
                _tags: tagvalues,
                _apps: apps
            }, this.UpdateTab.bind(this));
        }
    };

    this.UpdateCreateVersionDD = function () {
        $("#objname").text(this.Current_obj.Name);
        $('#create li').remove()
        var arr = this.Current_obj.VersionNumber.split(".")
        var vNumMajor = ("v." + (parseInt(major) + 1) + ".0.0.w");
        var vNumMinor = ("v." + arr[0] + "." + (parseInt(arr[1]) + 1) + ".0.w");
        var vNumPatch = ("v." + arr[0] + "." + arr[1] + "." + (parseInt(arr[2]) + 1) + ".w");

        $("#create").append(
            "<li id='_major' class='list-group-item'> Major Version - (" + vNumMajor + ") from(v." + this.Current_obj.VersionNumber + ")</li >" +
            "<li id= '_minor' class='list-group-item'> Minor Version - (" + vNumMinor + ") from(v." + this.Current_obj.VersionNumber + ")</li > " +
            "<li id='_patch' class='list-group-item'>Patch Version - (" + vNumPatch + ") from (v." + this.Current_obj.VersionNumber + ")</li>");
        $('#create').selectpicker('refresh');

        $('#create li').off('click').on("click", this.createVersion.bind(this));
        if (this.Current_obj.Status !== "Live") {
            $('#_patch').hide();
        }
    }

    this.createVersion = function (e) {
        var selected_opt = $(e.target).attr("id");

        if (selected_opt === "_major") {
            if (confirm('Are you sure you want to create Major version?')) {
                $.LoadingOverlay("show");
                $.post("../Eb_Object/Create_Major_Version", {
                    _refId: this.ver_Refid, _type: type
                }, this.OpenVersionAfterCreate.bind(this));
            }
        }
        if (selected_opt === "_minor") {
            if (confirm('Are you sure you want to create Minor version?')) {
                $.LoadingOverlay("show");
                $.post("../Eb_Object/Create_Minor_Version", {
                    _refId: this.ver_Refid,
                    _type: type
                }, this.OpenVersionAfterCreate.bind(this));
            }
        }
        if (selected_opt === "_patch") {
            if (confirm('Are you sure you want to create Patch version?')) {
                $.LoadingOverlay("show");
                $.post("../Eb_Object/Create_Patch_Version", {
                    _refId: this.ver_Refid,
                    _type: type
                }, this.OpenVersionAfterCreate.bind(this));
            }
        }
    };

    this.OpenVersionAfterCreate = function (_refid) {
        $.LoadingOverlay("show");
        this.ver_Refid = _refid;
        $.post('../Eb_Object/VersionCodes', { objid: this.ver_Refid, objtype: this.ObjectType })
            .done(this.VersionCode_success.bind(this));
        this.alertMsg = "Success";
        this.ShowMessage();
    }
    this.init();
};