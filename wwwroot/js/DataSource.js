var tabNum = 0;
var DataSource = function (refid, ver_num, type, dsobj, cur_status) {
    this.Code;
    this.ObjectType = type;
    this.CommitBtn;
    this.SaveBtn;
    this.Versions;
    this.ver_Refid = refid;
    this.changeLog;
    this.commitUname;
    this.commitTs;
    this.Object_String_WithVal;
    this.Filter_Params;
    this.Parameter_Count;
    this.SelectedFdId;
    this.Rel_object;
    this.rel_arr = [];
    this.VersionCollection = {};
    this.PropGCollection = {};

    this.Current_obj = dsobj;
    //this.Current_obj.status = cur_status;
    //this.Current_obj.versionNumber = ver_num;
    this.VersionCollection["#vernav" + tabNum] = dsobj;
    this.PropGCollection["#vernav" + tabNum] = new Eb_PropertyGrid("dspropgrid" + tabNum);

    this.Init = function () {

        this.SaveBtn = $('#save');
        this.CommitBtn = $('#commit');

        //$('#ver_his').off("click").on("click", this.VerHistory.bind(this));
        $('#execute' + tabNum).off("click").on("click", this.Execute.bind(this));
        $('#runSqlFn0').off("click").on("click", this.RunSqlFn.bind(this));
        $('#testSqlFn0').off("click").on("click", this.TestSqlFn.bind(this));
        $(".selectpicker").selectpicker();
        $('#compare').off('click').on('click', this.Compare.bind(this));
        //$('#status').off('click').on('click', this.LoadStatusPage.bind(this));
        $('.wrkcpylink').off("click").on("click", this.OpenPrevVer.bind(this));
        $('a[data-toggle="tab"].cetab').on('click', this.TabChangeSuccess.bind(this));
        if (this.Current_obj === null) {
            this.Current_obj = new EbObjects["EbDataSource"]("EbDataSource1");
        }
        this.PropGCollection["#vernav" + tabNum].setObject(this.Current_obj, AllMetas["EbDataSource"]);
        this.Name = this.Current_obj.Name;

    }
    this.TabChangeSuccess = function (e) {
        var target = $(e.target).attr("href");
        this.Current_obj = this.VersionCollection[target];
        this.PropGCollection["#vernav" + tabNum].setObject(this.Current_obj, AllMetas["EbDataSource"]);
    };

    this.PropGCollection["#vernav" + tabNum].PropertyChanged = function (obj, pname) {
        this.Current_obj = obj;
        this.VersionCollection["#vernav" + tabNum] = this.Current_obj;
        if (pname === "FilterDialogRefId") {
            $('#paramdiv' + tabNum + ' #filterBox').remove();
            $('#paramdiv' + tabNum).show();
            $('#codewindow' + tabNum).removeClass("col-md-10");
            $('#codewindow' + tabNum).addClass("col-md-8");

            $.post("../CE/GetFilterBody", { "ObjId": obj.FilterDialogRefId },
                function (result) {
                    $('#paramdiv' + tabNum).append(result);
                    $.LoadingOverlay("hide");
                });
        }
    }.bind(this);

    this.SetValues = function () {
        this.Code = window.editor.getValue();
        this.changeLog = $('#obj_changelog').val();
    }

    this.AddVerNavTab = function (navitem, tabitem) {
        $("#versionNav a[href='#vernav" + tabNum + "']").tab('show');
        $('#versionNav').append(navitem);
        $('#versionTab').append(tabitem);
        $("#versionNav a[href='#vernav" + tabNum + "']").tab('show');
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
        //tabNum++;
        //$.post("../CE/GetVersions",
        //    {
        //        objid: this.ver_Refid
        //    }, this.Version_List.bind(this));
        //$.post("../Eb_Object/VersionHistory",{objid: this.ver_Refid, tabnum: tabNum}, this.Version_List.bind(this));
        this.Version_List();
    }

    this.Version_List = function () {
        $.LoadingOverlay("hide");
        this.SetValues();
        //this.Versions = result;
        tabNum++;
        var navitem = "<li><a data-toggle='tab' href='#vernav" + tabNum + "'>History<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + tabNum + "' class='tab-pane fade'></div>";
            //"<table class='table table-striped table-bordered col-md-12' id='versions" + tabNum + "'>" +
            //"<thead class='verthead" + tabNum + "'>" +
            //"<tr>" +
            //"<th class='col-md-1'>Version Number</th>" +
            //"<th class='col-md-4'>Change Log</th>" +
            //"<th class='col-md-1'>Committed By</th>" +
            //"<th class='col-md-2'>Committed At</th>" +
            //"<th class='col-md-1'> </th>" +
            //"</tr>" +
            //" </thead>" +
            //"<tbody id='vertbody" + tabNum + "' class='vertbody'></tbody>" +
            //"</table>" +
            //"</div>";
        this.AddVerNavTab(navitem, tabitem);
        $.post("../Eb_Object/VersionHistory", { objid: this.ver_Refid, tabnum: tabNum }, function (result) {
            $("#vernav" + tabNum).append(result);
            $.LoadingOverlay("hide");
        });
        var scrollPos = $('#versionTab').offset().top;
        $(window).scrollTop(scrollPos);
        $("#vernav" + tabNum +" .view_code").off("click").on("click", this.OpenPrevVer.bind(this));
        //this.ShowVersions();
    }

    this.ShowVersions = function () {
        $.each(this.Versions, this.ShowVersions_inner.bind(this));
    }

    this.ShowVersions_inner = function (i, obj) {
        //$('#vertbody' + tabNum).append("<tr>" +
        //    "<td>" + obj.versionNumber + "</td> " +
        //    "<td>" + obj.changeLog + "</td> " +
        //    "<td>" + obj.commitUname + "</td> " +
        //    "<td>" + obj.commitTs + "</td> " +
        //    "<td><input type='button' id='view_code" + tabNum + i + "' class='view_code' value='View' data-id=" + obj.refId + " data-verNum=" + obj.versionNumber + " data-changeLog=" + obj.changeLog + " data-commitUname=" + obj.commitUname + " data-commitTs=" + obj.commitTs + "></td>" +
        //    " </tr>");
        //$('#view_code' + tabNum + i).off("click").on("click", this.OpenPrevVer.bind(this));
    };

    this.OpenPrevVer = function (e) {
        $.LoadingOverlay("show");
        tabNum++;
        this.ver_Refid = $(e.target).attr("data-id");
        this.Current_obj.versionNumber = $(e.target).attr("data-verNum");
        //this.changeLog = $(e.target).attr("data-changeLog");
        // this.commitUname = $(e.target).attr("data-commitUname");
        //this.commitTs = $(e.target).attr("data-commitTs");
        $.post('../CE/Call_codeEditor', { refid: this.ver_Refid, objtype: this.ObjectType })
            .done(this.VersionCode_success.bind(this));
    }

    this.VersionCode_drpListItem = function (i, version) {
        var vnum = version.versionNumber;
        $('#vernav' + tabNum + " select").append("<option value='" + version.id + "' data-tokens='" + vnum + "'> v " + version.versionNumber + "</option>");
    };

    this.VersionCode_success = function (data) {
        this.Current_obj = data;
        var navitem = "<li><a data-toggle='tab' class='cetab' href='#vernav" + tabNum + "' data-verNum='" + this.Current_obj.versionNumber + "'>v." + this.Current_obj.versionNumber + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + tabNum + "' class='tab-pane fade' data-id=" + this.ver_Refid + ">";
        this.AddVerNavTab(navitem, tabitem);

        $('#vernav' + tabNum).append(
            "<div id='paramdiv" + tabNum + "' class='col-md-2' style='z-index:-1; padding:0px; height:100px; display:none'>" +
               "<h6 class='smallfont' style='font-size: 12px;display:inline'>Parameter Div</h6> "+
                "<button class='head-btn pull-right' id='close_paramdiv'><i class='fa fa-times' aria-hidden='true'></i></button>"+
            "</div>"+
            " <div class='col-md-10' id='codewindow" + tabNum + "' style='margin:0;padding: 0;'> " +
            "<textarea id='code" + tabNum + "' name='code' class='code'>" + atob(this.Current_obj.sql) + "</textarea>" +
            "</div>" +
            "<div class='col-md-2'>" +
            " <div id='dspropgrid" + tabNum + "' class='pull-right' style='padding:0px'></div>" +
            "</div>");

        this.VersionCollection["#vernav" + tabNum] = this.Current_obj;
        this.PropGCollection["#vernav" + tabNum] = new Eb_PropertyGrid("dspropgrid" + tabNum);
        this.PropGCollection["#vernav" + tabNum].setObject(this.Current_obj, AllMetas["EbDataSource"]);

        var _readonly = this.Current_obj.versionNumber.slice(-1);
        if (_readonly === "w")
            _readonly = false;
        else
            _readonly = true;
        window.editor1 = CodeMirror.fromTextArea(document.getElementById("code" + tabNum), {
            mode: "text/x-sql",
            lineNumbers: true,
            lineWrapping: true,
            autoRefresh: true,
            readOnly: _readonly,
            foldGutter: { rangeFinder: new CodeMirror.fold.combine(CodeMirror.fold.brace, CodeMirror.fold.comment) },
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
        });
        var getNav = $("#versionNav li.active a").attr("href");
        $(".selectpicker").selectpicker();
        $.LoadingOverlay("hide");
        setTimeout(function () {
            window.editor1.refresh();
        }, 500);
        $('.selectpicker').selectpicker({
            size: 4
        });

        $('.selectpicker').selectpicker('refresh');
        this.Init();
    };

    this.Execute = function () {
        if (!$('#execute' + tabNum).hasClass('collapsed')) {
            //dasdsd
        }
        else {
            this.Find_parameters(false, false, false);
            $.LoadingOverlay("show");
            if (this.Parameter_Count !== 0 && $('#fd' + tabNum + ' option:selected').text() === "Select Filter Dialog") {
                alert("Please select a filter dialog");
                $.LoadingOverlay("hide");
            }
            else if (this.Parameter_Count === 0) {
                $.LoadingOverlay("hide");
                var getNav = $("#versionNav li.active a").attr("href");
            }
            else {
                this.SetValues();
                this.Find_parameters(false, false, false);
                // this.Save(false);
                this.SelectedFdId = $('#fd' + tabNum + ' option:selected').val();
                this.Load_Fd();
            }
        }
    }

    this.RunSqlFn = function () {
        $.LoadingOverlay("show");
        this.SetValues();
        if ($('.fd option:selected').text() === "Select Filter Dialog") {
            alert("Please select a filter dialog");
            $.LoadingOverlay("hide");
        }
        this.Save(true);
    }

    this.TestSqlFn = function () {
        $.LoadingOverlay("show");
        alert("Test");
    }

    this.LoadStatusPage = function () {
        $.LoadingOverlay("show");
        tabNum++;
        var navitem = "<li><a data-toggle='tab' href='#vernav" + tabNum + "'> status " + this.Current_obj.versionNumber + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + tabNum + "' class='tab-pane fade'>";
        this.AddVerNavTab(navitem, tabitem);
        $.post("../Eb_Object/GetLifeCycle", { _tabnum: tabNum, cur_status: this.Current_obj.status,refid : this.ver_Refid }, function (text) {
            $('#vernav' + tabNum).append(text);
            $.LoadingOverlay("hide");
        });
    //    var getNav = $("#versionNav li.active a").attr("href");
    //    $('#vernav' + tabNum).append("<div class=' well col-md-12'>" +           
    //        "</div>" +
    //        "<div class='col-md-12 statwindow' id='statwindow" + tabNum + "'></div>");
    //    $(getNav + ' #statwindow' + tabNum).empty();
    //    $(getNav + ' #statwindow' + tabNum).append("<div class='container'>" +
    //        "<div class='row'>" +
    //        "<div class=''>" +
    //        "<ul class='timeline' id='timeline" + tabNum + "'>" +
    //        "<li class='timeline-item' id='stat0' > " +
    //        "<div class='timeline-badge' id='timeline-badge0'><i class='glyphicon glyphicon-check'></i></div>" +
    //        "<div class='timeline-panel'> " +
    //        "<div class='timeline-heading'> " +
    //        "<h5 class='timeline-title' style='display:inline'> Current Status :" + this.Current_obj.status + "</h5>" +
    //        "<select class='selectpicker btn' id='status_drpdwn" + tabNum + "' style='display:inline'></select>" +
    //        "</div>" +
    //        "<div class='timeline-body' > " +
    //        "<div class='st_chnglog' ><textarea id='StatChlog" + tabNum + "' class='StatChlog' style='width:100%;height: 35px;border-radius: 6px;margin-top: -3px; placeholder='Change log'></textarea></div>" +
    //        "<div class=''><button class='btn btn-primary pull-right' id='confirm_stat_change'>Apply</button></div>" +
    //        "</div> " +
    //        "</div> " +
    //        "</li>" +
    //        "</ul>" +
    //        "</div>" +
    //        "</div>" +
    //        "</div>");
    //    $('#status_drpdwn' + tabNum).append("<option value='Select Status'>Select Status</option>");
    //    if (this.Current_obj.status === "Dev") {
    //        $(getNav + ' #status_drpdwn' + tabNum).append("<option value='Test'>Test</option>");
    //    }
    //    if (this.Current_obj.status === "Test") {
    //        $(getNav + ' #status_drpdwn' + tabNum).append("<option value='Dev'>Dev</option>" +
    //            "<option value='UAT' id='uat'>UAT</option>" +
    //            "<option value='Live'>Live</option>");
    //    }
    //    if (this.Current_obj.status === "UAT") {
    //        $(getNav + ' #status_drpdwn' + tabNum).append("<option value='Live'>Live</option>");
    //    }
    //    if (this.Current_obj.status === "Live") {
    //        $(getNav + ' #status_drpdwn' + tabNum).append("<option value='Dev'>Dev</option>" +
    //            "<option value='Test'>Test</option>" +
    //            "<option value='Offline'>Offline</option>");
    //    }
    //    if (this.Current_obj.status === "Offline") {
    //        $(getNav + ' #status_drpdwn' + tabNum).append("<option value='Dev'>Dev</option>" +
    //            "<option value='Test'>Test</option>" +
    //            "<option value='Obsolete'>Obsolete</option>");
    //    }
    //    if (this.Current_obj.status === "Obsolete") {
    //        //do something
    //    }
    //    $('.selectpicker').selectpicker({
    //        size: 4
    //    });
    //    $('.selectpicker').selectpicker('refresh');
    //    var cid = this.Cid;
    //    $.post("../CE/GetStatusHistory", { _refid: this.ver_Refid }, function (data) {
            
    //        $.each(data, function (i, obj) {
    //            $('#timeline' + tabNum).append(" <li class='timeline-item' id= 'stat" + i + "' > " +
    //                "<div class='timeline-badge' id='timeline-badge" + i + "'><i class='glyphicon glyphicon-check'></i></div>" +
    //                "<div class='timeline-panel'> "+
    //                "<div class='timeline-heading col-md-12'> " +
    //                "<strong class='timeline-title col-md-1'>" + obj.status + "</strong>" +
    //                 "<div class='timeline-time col-md-8'>"+
    //                "<p><small class='text-muted col-md-10'><i class='glyphicon glyphicon-time'></i>" + obj.commitTs + "</small><small class='pull-left col-md-2' > " + obj.commitUname + "</small ></p> " +
    //                "</div> " +
    //                    "<img src= '../static/dp_29_micro.jpg" + "' class='img-circle pull-right col-md-2' />" +      
    //                "</div>" +
    //                "<div class='timeline-body' id='timeline-body"+i+"'> "+
    //                        "<p class='timeline-body-clickmore'>" + obj.changeLog + "</p>" +
    //                        "<a class='primary pull-right more'>more</a>" +
    //                "</div>" +
    //                "</div> "+
    //                "</li>");
    //            var classname;
    //            if (obj.status === "Test")
    //                classname = "info";
    //            if (obj.status === "UAT")
    //               classname = "primary";
    //            if (obj.status === "Live")
    //            {
    //                classname = "success";
    //                $(getNav + ' #stat' + i).addClass("livestat");
    //            }
    //            if (obj.status === "Offline")
    //                classname = "warning";
    //            if (obj.status === "Obsolete")
    //                classname = "danger";
    //            $(getNav + ' #timeline-badge' + i).addClass(classname);

    //            $('#stat' + i + ' .more').on('click', function () {
    //                var p_element = $('#stat' + i + ' #timeline-body'+i+' p');
    //                p_element.toggleClass("timeline-body-clickmore");
    //                var a_element = $('#stat' + i + ' #timeline-body' + i + ' a');
    //                if (a_element.text() === 'more')
    //                    a_element.text('less');
    //                else
    //                    a_element.text('more')
    //            });
    //        });
    //        $.LoadingOverlay("hide");
           
    //        //var scrollPos = $('#vernav' + tabNum).offset().top;
    //        //$(window).scrollTop(scrollPos);
    //    });
    //    $(getNav + ' #confirm_stat_change').off("click").on("click", this.ChangeStatus.bind(this));
    //}

    //this.ChangeStatus = function () {
    //    $.LoadingOverlay("show");
    //    var _chlog = $('#StatChlog' + tabNum).val();
    //    var _stat = $('#status_drpdwn' + tabNum + ' option:selected').val();

    //    $.post('../CE/ChangeStatus', { _refid: this.ver_Refid, _changelog: _chlog, _status: _stat }, this.ChangeStatusSuccess.bind(this, _stat));
    //}

    //this.ChangeStatusSuccess = function (_stat) {
    //    $.LoadingOverlay("hide");
    //    this.Current_obj.status = _stat;
    //    this.LoadStatusPage();
    //};

    //this.Load_version_list = function () {
    //    $("#versionNav a[href='#vernav" + tabNum + "']").tab('show');
    //    $('#loader_fd' + tabNum).show();
    //    $.post('../CE/GetVersions', { objid: this.ver_Refid },
    //        function (data) {
    //            $('#selected_Ver_1' + tabNum).append("<option value='Current' data-tokens='Select Version'>Current</option>");
    //            $('#selected_Ver_2' + tabNum).append("<option value='Select Version' data-tokens='Select Version'>Select version</option>");
    //            $.each(data, function (i, obj) {
    //                $('#selected_Ver_1' + tabNum).append("<option value='" + obj.refId + "' data-tokens='" + obj.versionNumber + "'> v " + obj.versionNumber + "</option>");
    //                $('#selected_Ver_2' + tabNum).append("<option value='" + obj.refId + "' data-tokens='" + obj.versionNumber + "'> v " + obj.versionNumber + "</option>");
    //            });
    //            $('.selectpicker').selectpicker({
    //                size: 4
    //            });
    //            $('.selectpicker').selectpicker('refresh');
    //            $('#loader_fd' + tabNum).hide();
    //        })
        
    };

    this.Compare = function () {
        tabNum++;
        var navitem = "<li><a data-toggle='tab' href='#vernav" + tabNum + "'> compare <button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + tabNum + "' class='tab-pane fade'>";
        this.AddVerNavTab(navitem, tabitem);
        $('#vernav' + tabNum).append("<div>" +
            "<div class='well'>" +
            " <div>" +
            " <div class='col-md-4 col-md-offset-3'>" +
            "<div class='verlist input-group col-md-6' style='display:inline-block'>" +
            "<select id='selected_Ver_1" + tabNum + "' class='selectpicker' name='selected_Ver_1' class='form-control selected_Ver selectpicker show-tick' data-live-search='true'>" +
            "</select>" +
            "</div>" +
            "<div class='verlist input-group col-md-6' style='display:inline-block'>" +
            "<select id='selected_Ver_2" + tabNum + "' class='selectpicker' name='selected_Ver_2' class='form-control selected_Ver selectpicker show-tick' data-live-search='true'>" +
            "</select>" +
            "</div>" +
            "<i class='fa fa-circle-o-notch fa-spin fa-1x fa-fw' id='loader_fd" + tabNum + "' style='display:none;color:dodgerblue;'></i>" +
            "</div>" +
            " </div>" +
            "<button id='compare_inner" + tabNum + "' class='compare_inner btn btn-primary'>Comapre</button>" +
            "</div>" +
            "<div id='compare_result" + tabNum + "'></div>" +
            " </div>");
        $('#compare_inner' + tabNum).off("click").on("click", this.Differ.bind(this));
        this.Load_version_list();
        $('.selectpicker').selectpicker({
            size: 4
        });

    };

    this.Differ = function () {
        var verRefid1 = $('#selected_Ver_1' + tabNum + ' option:selected').val();
        var verRefid2 = $('#selected_Ver_2' + tabNum + ' option:selected').val();
        if (verRefid2 === "Select Version") {
            alert("Please Select A Version");
            $.LoadingOverlay("hide");
        }
        else if (verRefid1 === "Current") {
            $.LoadingOverlay("show");
            var v1 = this.Current_obj.versionNumber;
            var v2 = $('#selected_Ver_2' + tabNum + ' option:selected').attr("data-tokens");
            this.SetValues();
            this.getSecondVersionCode(verRefid2, v1, v2, this.Code);

        }
        else {
            $.LoadingOverlay("show");
            var data_1;
            v1 = $('#selected_Ver_1' + tabNum + ' option:selected').attr("data-tokens");
            v2 = $('#selected_Ver_2' + tabNum + ' option:selected').attr("data-tokens");
            $.post('../CE/VersionCodes', { "objid": verRefid1, "objtype": this.ObjectType }, this.getSecondVersionCode.bind(this, verRefid2, v1, v2));
        }
        //  }
    }

    this.getSecondVersionCode = function (verRefid2, selected_ver_number_1, selected_ver_number_2, result) {
        $.post('../CE/VersionCodes', { "objid": verRefid2, "objtype": this.ObjectType }).done(this.CallDiffer.bind(this, result, selected_ver_number_1, selected_ver_number_2));
    }

    this.Init();

    this.Save = function (needRun) {
        $.LoadingOverlay("show");
        this.SetValues();
        if (this.ObjectType === 5) {
            this.SetSqlFnName();
        }
        this.Find_parameters(true, true, needRun);
    };

    this.Commit = function (needRun) {
        $.LoadingOverlay("show");
        this.SetValues();
        if (this.ObjectType === 5) {
            this.SetSqlFnName();
        }
        this.Find_parameters(true, false, needRun);
    }

    $(this.SaveBtn).off("click").on("click", this.Save.bind(this, false));
    $(this.CommitBtn).off("click").on("click", this.Commit.bind(this, false));

    this.Find_parameters = function (isCommitorSave, issave, needRun) {
        this.SetValues();
        var result = this.Code.match(/\@\w+/g);
        var filterparams = [];
        if (result !== null) {
            for (var i = 0; i < result.length; i++) {
                result[i] = result[i].substr(1);
                if (result[i] === "search" || result[i] === "and_search" || result[i] === "search_and" || result[i] === "where_search" || result[i] === "limit" || result[i] === "offset" || result[i] === "orderby") {
                    //
                }
                else {
                    if ($.inArray(result[i], filterparams) === -1)
                        filterparams.push(result[i]);
                }
            }
            filterparams.sort();
            this.Filter_Params = filterparams;
            this.Parameter_Count = filterparams.length;
        }
        else {
            this.Parameter_Count = 0;
        }
        if (isCommitorSave === true) {
            var _json = null;
            if (this.Parameter_Count !== 0 && ($('#fd' + tabNum + ' option:selected').text() === "Select Filter Dialog")) {
                if (confirm('Are you sure you want to save this without selecting a filter dialog?')) {
                    this.SetValues();
                    this.GetUsedSqlFns(needRun, issave);
                }
                else {
                    $.LoadingOverlay("hide");
                }
            }
            else {
                this.SetValues();
                this.GetUsedSqlFns(needRun, issave);
            }
        }
    }

    this.CreateObjString = function () {
        if (this.Parameter_Count !== 0) {
            var ObjString = "[";
            var filter_control_list = "datefrom,dateto";
            var myarray = filter_control_list.split(',');
            for (var i = 0; i < myarray.length; i++) {
                console.log($("#" + myarray[i]).val());
                var type = $('#' + myarray[i]).attr('data-ebtype');
                var name = $('#' + myarray[i]).attr('name');
                var value = $('#' + myarray[i]).val();
                if (type === '6')
                    value = value.substring(0, 10);

                ObjString += '{\"name\":\"' + name + '\",';
                ObjString += '\"type\":\"' + type + '\",';
                ObjString += '\"value\":\"' + value + '\"},';
            }
            ObjString = ObjString.slice(0, -1) + ']';
            this.Object_String_WithVal = ObjString;
        }
        else {
            this.Object_String_WithVal = null;
        }
        console.log("Object_String_WithVal" + this.Object_String_WithVal);
    }

    this.DrawTable = function () {
        $.LoadingOverlay("show");
        tabNum++;
        var navitem = "<li><a data-toggle='tab' href='#vernav" + tabNum + "'>Result-" + this.Current_obj.Name + "<button class='close closeTab' type='button' style='font-size: 20px;margin: -2px 0 0 10px;'>×</button></a></li>";
        var tabitem = "<div id='vernav" + tabNum + "' class='tab-pane fade'>";
        this.AddVerNavTab(navitem, tabitem);
        $('#vernav' + tabNum).append(" <div class=' filter_modal_body'>" +
            "<table class='table table-striped table-bordered' id='sample" + tabNum + "'></table>" +
            "</div>");
        $.post('GetColumns4Trial', {
            ds_refid: this.ver_Refid,
            parameter: this.Object_String_WithVal
        }, this.Load_Table_Columns.bind(this));
    };

    this.Load_Table_Columns = function (result) {
        if (result === "") {
            alert('Error in Query');
        }
        else {
            var cols = JSON.parse(result);
            $("#sample" + tabNum).dataTable({
                columns: cols,
                serverSide: true,
                lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
                scrollX: "100%",
                scrollY: "300px",
                processing: true,
                ajax: {
                    url: "http://localhost:8000/ds/data/" + this.ver_Refid,
                    type: "POST",
                    data: this.Load_tble_Data.bind(this),
                    crossDomain: true,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", "Bearer " + getToken());
                    },
                    dataSrc: function (dd) { return dd.data; },
                }
            });

            $("#versionNav a[href='#vernav" + tabNum + "']").tab('show');
            $.LoadingOverlay("hide");
        }
    };

    this.Load_tble_Data = function (dq) {
        delete dq.columns; delete dq.order; delete dq.search;
        dq.RefId = this.ver_Refid;
        dq.TFilters = [];
        dq.Params = this.Object_String_WithVal;
        return dq;
    };

    this.Load_Fd = function () {
        var getNav = $("#versionNav li.active a").attr("href");
        if ($(getNav + ' #inner_well' + tabNum).children().length === 0) {
            $.post("../CE/GetFilterBody", { "ObjId": this.SelectedFdId },
                function (result) {
                    $(getNav + ' #inner_well' + tabNum).append(result);

                }, $.LoadingOverlay("hide"));
        }
        else {
            $.LoadingOverlay("hide");
        }
    };

    this.RunDs = function () {
        $.LoadingOverlay("show");
        if (this.Parameter_Count === 0) {
            this.Save(false);
            this.Object_String_WithVal = "";
            // this.DrawTable();
        }
        else {
            this.Find_parameters(true, true, true);
        }
    };


    $("#run").off("click").on("click", this.RunDs.bind(this));

    this.CallDiffer = function (data_1, selected_ver_number, curr_ver, data_2) {
        var getNav = $("#versionNav li.active a").attr("href");
        this.SetValues();
        data_2 = atob(data_2.sql);
        if (selected_ver_number > curr_ver) {
            $.post("../CE/GetDiffer", {
                NewText: data_1, OldText: data_2
            })
                .done(this.showDiff.bind(this, selected_ver_number, curr_ver));
        }
        else {
            $.post("../CE/GetDiffer", {
                NewText: data_2, OldText: data_1
            })
                .done(this.showDiff.bind(this, curr_ver, selected_ver_number));
        }
    };

    this.showDiff = function (new_ver_num, old_ver_num, data) {
        var getNav = $("#versionNav li.active a").attr("href");

        $('#versionNav li.active a').text().replace('compare', "v." + old_ver_num + " v/s v." + new_ver_num);

        $('#compare_result' + tabNum).empty();
        $('#compare_result' + tabNum).append("<div id='oldtext" + tabNum + "'class='leftPane'>" +
            "</div>" +
            "  <div id='newtext" + tabNum + "' class='rightPane'>" +
            "</div>");
        $('#oldtext' + tabNum).html("<div class='diffHeader'>v." + old_ver_num + "</div>" + data[0]);
        $('#newtext' + tabNum).html("<div class='diffHeader'>v." + new_ver_num + "</div>" + data[1]);
        $('.leftPane').scroll(function () {
            $('.rightPane').scrollTop($(this).scrollTop());
            $('.rightPane').scrollLeft($(this).scrollLeft());
        });
        $('.rightPane').scroll(function () {
            $('.leftPane').scrollTop($(this).scrollTop());
            $('.leftPane').scrollLeft($(this).scrollLeft());
        });
        var scrollPos = $('#compare_result' + tabNum).offset().top;
        $(window).scrollTop(scrollPos);
        $.LoadingOverlay("hide");
    };

    this.SetSqlFnName = function () {
        var result = this.Code.match(/create\s*FUNCTION\s*|create\s*or\s*replace\s*function\s*(.[\s\S]*?\))/i);
        if (result.length > 0) {
            var fnName = result[1].replace(/\s\s+/g, ' ');
            var x = fnName.replace('(', "_v" + this.Current_obj.versionNumber + '(');
            var v = this.Code.replace(result[1], x);
            $('#obj_name').val(x);
            $('#code' + tabNum).val(v);
            editor.setValue(v);
        }
    };

    this.GetUsedSqlFns = function (needRun, issave) {

        this.rel_arr = [];
        this.Rel_object = null;
        $.post("../CE/GetObjects_refid_dict", { obj_type: 5 }, this.FetchUsedSqlFns.bind(this, issave, needRun));
    };

    this.FetchUsedSqlFns = function (issave, needRun, data) {
        $.each(data, this.FetchUsedSqlFns_inner.bind(this));

        var getNav = $("#versionNav li.active a").attr("href");
        var filter_dialog_refid = $(getNav + ' #fdlist' + tabNum + ' #fd' + tabNum + ' option:selected').val();

        if (filter_dialog_refid === "Select Filter Dialog") {
            filter_dialog_refid = null;
        }
        this.SetValues();
        this.rel_arr.push(filter_dialog_refid);
        this.Rel_object = this.rel_arr.toString();
        this.Current_obj.Sql = btoa(this.Code);
        var tagvalues = $('#tags').val();
        if (issave === true) {
            $.post("../Eb_ObjectController/SaveEbObject",
                {
                    "Id": this.ver_Refid,
                    "json": JSON.stringify(this.Current_obj),
                    "rel_obj": this.Rel_object,
                    "tags": tagvalues
                }, this.CallDrawTable.bind(this, needRun));
        }
        else {

            $.post("../Eb_ObjectController/CommitEbObject", {
                "id": this.ver_Refid,
                "changeLog": this.changeLog,
                "json": JSON.stringify(this.Current_obj),
                "rel_obj": this.Rel_object,
                "tags": tagvalues
            }, this.CallDrawTable.bind(this, needRun));
        }

    };
    this.CallDrawTable = function (needRun, result) {
        if (needRun === true) {
            var getNav = $("#versionNav li.active a").attr("href");
            this.ver_Refid = $(getNav).attr("data-id");
            if (this.ver_Refid === "new") {
                this.ver_Refid = result.refId;
                alert(this.ver_Refid);
            }
            this.CreateObjString();
            this.DrawTable();
        }
        alert("Success");
        $("#close_popup").click();
        $.LoadingOverlay("hide");
    };

    this.FetchUsedSqlFns_inner = function (i, sqlFn) {
        if (this.Code.indexOf(sqlFn.name) !== -1) {
            this.rel_arr.push(i);
        }
    };
}