﻿var Eb_ObjectCommon = function (refid, dsobj, cur_status, ver_num, tabNum, type, major, ssurl) {
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
    this.alertBgColor = null;
    this.flagRun = false;
    this.FlagSave = false;
    this.saveOrCommitSuccess = function (refif) { };//edit by amal
    this.PreviewObject = function () { };//edits by amal
    this.RedColor = "#aa0000";
    this.GreenColor = "#00AD6E";

    this.init = function () {
        $('#status').off('click').on('click', this.LoadStatusPage.bind(this));
        $('#ver_his').off("click").on("click", this.Version_List.bind(this));
        $('#compare').off('click').on('click', this.Compare.bind(this));
        $('#save').off("click").on("click", this.Save.bind(this));
        $('#commit').off("click").on("click", this.Commit.bind(this, false));
        $('a[data-toggle="tab"].cetab').off("click").on('click', this.TabChangeSuccess.bind(this));
        $('.wrkcpylink').off("click").on("click", this.OpenPrevVer.bind(this));
        $(window).off("keydown").on("keydown", this.checkKeyDown.bind(this));
        $('#ProfilerHome').off('click').on('click', this.SqlProfilerHome.bind(this));
        $('#profiler').off('click').on('click', this.onProfilerClick.bind(this));
        $('#del_obj').off('click').on('click', this.DeleteObject.bind(this));
        this.target = $("#versionNav li.active a").attr("href");//edits by amal

        if (this.Current_obj !== null)
            if (this.Current_obj.VersionNumber !== "")
                if (this.Current_obj.VersionNumber.slice(-1) !== 'w') {
                    $('#save').hide();
                    $('#commit_outer').hide();
                }
                else {
                    $('#save').show();
                    $('#commit_outer').show();
                }
    };

    this.checkKeyDown = function (event) {
        if (event.ctrlKey || event.metaKey) {
            if (event.which === 83) {
                event.preventDefault();
                this.Save();
            }
        }
    };

    this.ShowMessage = function () {
        this.tags = $('#tags').val();
        this.UpdateDashboard();
        EbMessage("show", { Message: this.alertMsg, Background: this.alertBgColor });
        $("#eb_common_loader").EbLoader("hide");
        $('#close_popup').trigger('click');
    };

    this.showMessage = function (Delay = 4000) {
        EbMessage("show", { Message: this.alertMsg, Background: this.alertBgColor, AutoHide: true, Delay: Delay });
    };

    this.UpdateTab = function (data) {
        if (data.message !== null && data.message !== "") {
            if (data.message.indexOf("Specify a diffrent name.") > 0) {
                this.alertBgColor = this.RedColor;
                this.alertMsg = data.message;
                this.showMessage();
            }
            //var target = $("#versionNav li.active a").attr("href");
            else if (data.message === "RestrictedStatementinQuerry") {
                this.alertBgColor = this.RedColor;
                this.alertMsg = "Querry Contains Restricted Keywords !!";
                this.showMessage();
            }
            else if (data.message === "nameIsNotUnique") {
                this.alertBgColor = this.RedColor;
                this.alertMsg = "The Operation Can't be completed because an item with the name \"" + this.Current_obj.Name + "\"" + " already exists. Specify a diffrent name.";
                this.showMessage();
            }
            else {
                this.alertBgColor = this.RedColor;
                this.alertMsg = data.message;
                this.showMessage();
            }
        }
        else {
            var target = this.target;//edits by amal
            this.ver_Refid = data.refid;
            var getNav = $("#versionNav li.active a").attr("href");
            $(getNav).attr("data-id", this.ver_Refid);

            if (this.Current_obj.Status === null || this.Current_obj.Status === undefined) {
                this.Current_obj.Status = "Dev";
            }
            this.alertBgColor = this.GreenColor;
            if (this.Current_obj.VersionNumber !== null && this.Current_obj.VersionNumber !== undefined && this.Current_obj.VersionNumber !== "") {
                if (!this.FlagSave) {
                    this.Current_obj.VersionNumber = this.Current_obj.VersionNumber.replace(/.w/g, '');
                    this.alertMsg = "Commit Success";
                    if (this.ObjectType === 2)
                        this.AfterCommit();
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
                    if (this.ObjectType === 2)
                        this.AfterCommit();
                }
            }
            this.Current_obj.RefId = this.ver_Refid;
            this.ObjCollection[target].EbObject = this.Current_obj;
            this.ObjCollection[target].Refid = this.ver_Refid;
            $(`#versionNav [href='${target}']`).attr("data-verNum", this.Current_obj.VersionNumber);//edits by amal
            $(`#versionNav [href='${target}']`).text("v." + this.Current_obj.VersionNumber);//edits by amal
            //$("#versionNav li.active a").attr("data-verNum", this.Current_obj.VersionNumber);
            //$("#versionNav li.active a").text("v." + this.Current_obj.VersionNumber);

            if (this.flagRun)
                this.ObjCollection[target].SaveSuccess();

            this.ShowMessage();
            this.saveOrCommitSuccess(data);//edit by amal
        }
        //$.LoadingOverlay("hide");
        $("#eb_common_loader").EbLoader("hide");
    };

    this.UpdateDashboard = function () {
        $.post("../Eb_Object/UpdateObjectDashboard", { refid: this.ver_Refid }).done(this.UpdateDashboard_Success.bind(this));
    };

    this.UpdateDashboard_Success = function (data) {
        $('#object_Dashboard_main').empty().append(data);

        var words = this.ver_Refid.split("-");
        window.history.pushState("data", "Title", 'Index?objid=' + words[3] + '&objtype=' + words[2]);
        ebcontext.menu.resultObj = null;//reload menu by amal updated on 18/06/2019
        ebcontext.menu.start();//reload menu by amal updated on 18/06/2019


        if (this.target !== "#preview_tab")
            this.ObjCollection[this.target].GenerateButtons();
        commonObj.init();
        $('#tags').tagsinput('add', this.tags);
        if (this.Current_obj.VersionNumber.slice(-1) !== 'w') {
            $('#save').hide();
            $('#commit_outer').hide();
        }
        else {
            $('#save').show();
            $('#commit_outer').show();
        }
    };

    this.LoadStatusPage = function () {
        //$.LoadingOverlay("show");
        $("#eb_common_loader").EbLoader("show");
        this.tabNum++;
        var nav = "<li><a data-toggle='tab' href='#vernav" + this.tabNum + "'> Status " + this.Current_obj.VersionNumber + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tab = "<div id='vernav" + this.tabNum + "' class='tab-pane fade vernav'>";
        this.AddTab(nav, tab);
        //$('a[data-toggle="tab"]').on('click', this.TabChangeSuccess.bind(this));
        //$("#obj_icons").empty();
        $.post("../Eb_Object/GetLifeCycle", { _tabNum: this.tabNum, cur_status: this.Current_obj.Status, refid: this.ver_Refid }, this.getLifecyleInner.bind(this));
    };

    this.getLifecyleInner = function (text) {
        $('#vernav' + this.tabNum).append(text);
        //$.LoadingOverlay("hide");
        $("#eb_common_loader").EbLoader("hide");
    };

    this.AddTab = function (nav, tab, iscodEditor) {
        $('#versionNav').append(nav);
        $('#versionTab').append(tab);
        $("#versionNav a[href='#vernav" + this.tabNum + "']").tab('show');
        $('.closeTab').off("click").on("click", this.deleteTab.bind(this));
        $('a[data-toggle="tab"]').off('click').on('click', this.TabChangeSuccess.bind(this));

        if (iscodEditor) {
            if (this.Current_obj.VersionNumber.slice(-1) === 'w') {
                $('#save').show();
                $('#commit_outer').show();
            }
            $('#create_button').show();
            $("#obj_icons").show();
        }
        //else
        //    $('.toolicons').hide();

    };

    this.deleteTab = function (e) {
        var tabContentId = $(e.target).parent().attr("href");
        $(e.target).parent().parent().remove(); //remove li of tab
        $(tabContentId).remove();
        $('#versionNav a:last').tab('show'); // Select first tab        
    };

    this.Version_List = function () {
        //$.LoadingOverlay("show");
        $("#eb_common_loader").EbLoader("show");
        this.tabNum++;
        var nav = "<li><a data-toggle ='tab' href='#vernav" + this.tabNum + "'>History<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tab = "<div id='vernav" + this.tabNum + "' class='tab-pane fade'></div>";
        this.AddTab(nav, tab);
        //$('a[data-toggle="tab"]').on('click', this.TabChangeSuccess.bind(this));
        //$("#obj_icons").empty();
        $.post("../Eb_Object/VersionHistory", { objid: this.ver_Refid, tabnum: this.tabNum, Objtype: type }, this.versionHistoryInner.bind(this));

    };

    this.versionHistoryInner = function (result) {
        $("#vernav" + this.tabNum).append(result);
        $("#vernav" + this.tabNum + " .view_code").off("click").on("click", this.OpenPrevVer.bind(this));
        //$.LoadingOverlay("hide");
        $("#eb_common_loader").EbLoader("hide");
    };

    this.OpenPrevVer = function (e) {
        //$.LoadingOverlay("show");
        $("#eb_common_loader").EbLoader("show");
        this.ver_Refid = (($(e.target).attr("data-id")) === null || ($(e.target).attr("data-id")) === undefined) ? $(e.target).parent().attr("data-id") : $(e.target).attr("data-id");

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

        var nav = "<li><a data-toggle='tab' class='cetab' href='#vernav" + this.tabNum + "' data-verNum='" + this.Current_obj.VersionNumber + "'><i class='fa " + icon + "' aria-hidden='true'></i>   v." + this.Current_obj.VersionNumber + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tab = "<div id='vernav" + this.tabNum + "' class='tab-pane fade' data-id=" + this.ver_Refid + ">";
        this.AddTab(nav, tab, true);
        //$('a[data-toggle="tab"].cetab').on('click', this.TabChangeSuccess.bind(this));
        $('#vernav' + this.tabNum).append(data);
        if (this.Current_obj !== null)
            this.UpdateCreateVersionDD();
        //$.LoadingOverlay("hide");
        $("#eb_common_loader").EbLoader("hide");
    };

    this.Compare = function () {
        this.tabNum++;
        $.post('../Eb_Object/CallDifferVC', { _tabnum: this.tabNum })
            .done(this.Load_differ.bind(this));
    };

    this.Load_differ = function (data) {
        var nav = "<li><a data-toggle='tab' href='#vernav" + this.tabNum + "'> Diff <button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tab = "<div id='vernav" + this.tabNum + "' class='tab-pane fade'>";
        this.AddTab(nav, tab);
        //$('a[data-toggle="tab"]').on('click', this.TabChangeSuccess.bind(this));
        // $("#obj_icons").empty();
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
            });
    };

    this.Differ = function () {
        //$.LoadingOverlay("show");
        $("#eb_common_loader").EbLoader("show");
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
            //$.LoadingOverlay("hide");
            $("#eb_common_loader").EbLoader("hide");
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
        //$.LoadingOverlay("hide");
        $("#eb_common_loader").EbLoader("hide");
    };

    this.TabChangeSuccess = function (e) {
        var jq = $(e.target).closest("a");
        if (jq.attr("id") === "preview_tab_btn")
            this.PreviewObject();
        else
            this.target = jq.attr("href");
        let version = $(e.target).attr("data-vernum");
        if (version !== undefined) {
            this.tabchangeFlag = true;
            var target = $(e.target).attr("href");
            this.ObjWrapper = this.ObjCollection[target];
            this.ver_Refid = this.ObjWrapper.Refid;
            this.Current_obj = this.ObjWrapper.EbObject;
            //this.ObjWrapper.propGrid.setObject(this.Current_obj, AllMetas["EbDataSource"]);
            this.UpdateCreateVersionDD();
            this.ObjWrapper.GenerateButtons();
            if (version.slice(-1) === 'w') {
                $('#save').show();
                $('#commit_outer').show();
            }
            $('#create_button').show();
            $('#compare').show();
            $('#status').show();
            $('#ver_his').show();
            $("#obj_icons").show();
            $('.toolicons').show();
        }
        else {
            $("#obj_icons").hide();
            $('#save').hide();
            $('#commit_outer').hide();
            $('#create_button').hide();
            $('#compare').show();
            $('#status').show();
            $('#ver_his').show();
            // $('.toolicons').hide();
        }
    };

    this.Save = function () {
        this.FlagSave = true;
        $("#eb_common_loader").EbLoader("show");
        var tagvalues = $('#tags').val();
        var apps = $("#apps").val();
        if (apps === "")
            apps = "0";
        var getNav = this.target;/*$("#versionNav li.active a").attr("href");*/
        if (this.isBeforSaveImplemets(getNav)) {
            if (this.ObjCollection[getNav].BeforeSave())
                this.ajaxSave(tagvalues, apps, getNav);
            else
                $("#eb_common_loader").EbLoader("hide");
        }
        else
            this.ajaxSave(tagvalues, apps, getNav);
    };

    this.Commit = function () {
        $("#eb_common_loader").EbLoader("show");
        var tagvalues = $('#tags').val();
        var apps = $("#apps").val();
        if (apps === "")
            apps = "0";
        var changeLog = $('#obj_changelog').val();
        var getNav = this.target; /*$("#versionNav li.active a").attr("href");*/
        if (this.isBeforSaveImplemets(getNav)) {
            if (this.ObjCollection[getNav].BeforeSave())
                this.ajaxCommit(tagvalues, apps, getNav, changeLog);
            else
                $("#eb_common_loader").EbLoader("hide");
        }
        else
            this.ajaxCommit(tagvalues, apps, getNav, changeLog);
    };

    this.ajaxSave = function (tagvalues, apps, getNav) {
        if (this.Current_obj.Validate === undefined || this.Current_obj.Validate()) {
             $.post("../Eb_Object/SaveEbObject", {
                _refid: this.ver_Refid,
                _json: JSON.stringify(this.Current_obj),
                _rel_obj: this.ObjCollection[getNav].relatedObjects,
                _tags: tagvalues,
                _apps: apps
            }, this.UpdateTab.bind(this));
        }
        else
            EbMessage("show", { Message: "Validation faild! save uncompleted.", Background: this.RedColor });
    };

    this.ajaxCommit = function (tagvalues, apps, getNav, changeLog) {
        if (this.Current_obj.Validate === undefined || this.Current_obj.Validate()) {
            $.post("../Eb_Object/CommitEbObject", {
                _refid: this.ver_Refid, _changeLog: changeLog,
                _json: JSON.stringify(this.Current_obj),
                _rel_obj: this.ObjCollection[getNav].relatedObjects,
                _tags: tagvalues,
                _apps: apps
            }, this.UpdateTab.bind(this));
        }
        else
            EbMessage("show", { Message: "Validation faild! commit uncompleted.", Background: this.RedColor });
    };

    this.isBeforSaveImplemets = function (getNav) {
        if (this.ObjCollection[getNav].EbObject.$type.indexOf("Report") !== -1)
            return true;
        else if (this.ObjCollection[getNav].EbObject.$type.indexOf("Email") !== -1)
            return true;
        else if (this.ObjCollection[getNav].EbObject.$type.indexOf("Api") !== -1)
            return true;
        else if (this.ObjCollection[getNav].EbObject.$type.indexOf("TableVisualization") !== -1)
            return true;
        else
            return false;
    };

    this.AfterCommit = function () {
        this.ObjCollection[this.target].AfterCommit();
    };

    this.UpdateCreateVersionDD = function () {
        $("#objname").text(this.Current_obj.DisplayName);
        $('#create li').remove();
        var arr = this.Current_obj.VersionNumber.split(".");
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
    };

    this.createVersion = function (e) {
        var selected_opt = $(e.target).attr("id");

        if (selected_opt === "_major") {
            if (confirm('Are you sure you want to create Major version?')) {
                $("#eb_common_loader").EbLoader("show");
                $.post("../Eb_Object/Create_Major_Version", {
                    _refId: this.ver_Refid, _type: type
                }, this.OpenVersionAfterCreate.bind(this));
            }
        }
        if (selected_opt === "_minor") {
            if (confirm('Are you sure you want to create Minor version?')) {
                $("#eb_common_loader").EbLoader("show");
                $.post("../Eb_Object/Create_Minor_Version", {
                    _refId: this.ver_Refid,
                    _type: type
                }, this.OpenVersionAfterCreate.bind(this));
            }
        }
        if (selected_opt === "_patch") {
            if (confirm('Are you sure you want to create Patch version?')) {
                $("#eb_common_loader").EbLoader("show");
                $.post("../Eb_Object/Create_Patch_Version", {
                    _refId: this.ver_Refid,
                    _type: type
                }, this.OpenVersionAfterCreate.bind(this));
            }
        }
    };

    this.OpenVersionAfterCreate = function (_refid) {
        $("#eb_common_loader").EbLoader("show");
        this.ver_Refid = _refid;
        $.post('../Eb_Object/VersionCodes', { objid: this.ver_Refid, objtype: this.ObjectType })
            .done(this.VersionCode_success.bind(this));
        this.alertBgColor = this.GreenColor;
        this.alertMsg = "Success";
        this.ShowMessage();
    };

    this.getVersion = function () {
        return $("#versionNav li.active a").attr("data-vernum");
    };

    this.DeleteObject = function () {
        EbDialog("show",
            {
                Message: 'Do you really want to delete ' + this.Current_obj.DisplayName + ' ?',
                Buttons: {
                    "Yes": {
                        Background: this.GreenColor,
                        Align: "left",
                        FontColor: "white;"
                    },
                    "No": {
                        Background: this.RedColor,
                        Align: "right",
                        FontColor: "white;"
                    }
                },
                CallBack: function (res) {
                    if (res === "Yes") {
                        $("#eb_common_loader").EbLoader("show");
                        $.post("../Eb_Object/DeleteObject",
                            { objid: this.ver_Refid.split("-")[3] },
                            function (result) {
                                $("#eb_common_loader").EbLoader("hide");
                                if (result) {
                                    EbMessage("show", { Message: "Deleted", Background: this.GreenColor });
                                    window.location.replace("../MyApplications");
                                }
                                else
                                    EbMessage("show", { Message: "failed. Please retry", Background: this.RedColor });
                            }.bind(this));
                    }
                }.bind(this)
            });
    };

    this.SqlProfilerHome = function () {
        $("#eb_common_loader").EbLoader("show");
        $.ajax({
            url: "../Eb_Object/GetProfilerView",
            type: "get",
            data: {
                "refid": this.Current_obj.RefId
            },
            success: function (response) {
                $('#builderDashB_bdy').html(response);
                $("#eb_common_loader").EbLoader("hide");
            }
        });
    };

    this.onProfilerClick = function () {
        $.ajax({
            url: "../Eb_Object/EnableLogging",
            type: "post",
            data: {
                "ProfilerValue": document.getElementById("profiler").checked,
                "objid": this.ver_Refid.split("-")[3]
            },
            success: function (response) {
                var Background;
                if (response.indexOf("Sorry") === -1)
                    Background = this.GreenColor;
                else
                    Background = this.RedColor;

                EbMessage("show", { Message: response, Background: Background });
            }
        });
    };
    this.init();
};