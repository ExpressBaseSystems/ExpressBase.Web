﻿var menujs = function (login) {
    this.login = login;
    this.resultObj = null;
    this.objTypes = null;

    this.init = function () {
        $('#submen').off("click").on("click", this.showModal.bind(this));
        $('#MyDropDownId li').click(function () { $('#dropbuttn').text($(this).text()); });      
        $("#searchobj").off("keyup").on("keyup", this.searchFAllObjects.bind(this));
        $("body").off("keyup").on("keyup", ".obj_search_input", this.searchObjects.bind(this));
    };

    this.searchObjects = function (e) {
        var srchBody = $(e.target).attr("search_body");
        var srch = $(e.target).val().toLowerCase();
        var count = 0;
        $.each($("#" + srchBody).children(".objitems"), function (i, obj) {
            var cmpstr = $(obj).children().children(".col-md-11").find(".head4").text().toLowerCase();
            if (cmpstr.indexOf(srch) !== -1) {
                $(obj).show();
                count++;
            }
            else
                $(obj).hide();
        });
        if (count === 0)
            $("#" + srchBody + " .not-found").show().text("Item not found....");
        else
            $("#" + srchBody + " .not-found").hide().text("");
    };

    this.setMainMenu = function () {
        console.log(this.result);
    };

    this.showModal = function () {
        if (this.login == "dc" || this.login == "uc") {
            $("#ObjModal").modal('show');
            $.LoadingOverlay("show");
            $("#EbsideBar").empty();
            $.get("../TenantUser/getSidebarMenu", function (result) {
                $("#EbsideBar").append(result);
                $.LoadingOverlay("hide");
                $(".Obj_link").off("click").on("click", this.appendObType.bind(this));
                //$(".sub-menuObj .Obj_link").off("click").on("click", this.appendObjList.bind(this));
                $(".menuApp").off("click").on("click", this.appendAppList.bind(this));
                $(".list-group-item[data-toggle=collapse]").off("click").on("click", this.changeIcon.bind(this));
            }.bind(this));
        }
        else {
            $('#EbsideBar').animate({ width: 'toggle' });
        }
    };

    this.appendObType = function (e) {
        var appid = $(e.target).attr("Appid");
        $(".modal-body #objList").empty();
        for (var otype in this.resultObj.Data[appid].Types) {
            var _obj = this.resultObj.Data[appid].Types[otype].Objects;
            $(".modal-body #objList").append(`<div class="objContainer_f_app">
                                                <div class="objContainer2">
                                                    <div class="form-inline obType_wrapper_head" obj_container="obtype_container${otype}" id="obType_wrapper_head${otype}"
                                                        len="${_obj.length}" data-toggle="collapse" data-target="#obtype_container${otype}" style="cursor:pointer;">
                                                       ${this.objTypes[otype]}<span class="obj_count">(${_obj.length})</span>
                                                        <div class="btn_container pull-right">
                                                       <a class="btn btn-sm table-btn ob_search"><i class="material-icons">search</i></a>
                                                        <input type="text" search_body="obtype_container${otype}" class="form-control obj_search_input" placeholder="Search" style="display:none;">                                    
                                                         </div>                                                    
                                                        </div>
                                                    <div class="obtype_container collapse" id="obtype_container${otype}">
                                                        <div class="not-found" style="display:none;"></div>
                                                    </div>
                                                </div>
                                            </div>`);
            //this.appendObjList($("#obtype_container" + otype[appid]), otype);
            this.apndOTypeContainer($("#obtype_container" + otype), _obj);
            if (this.login == "dc") {
                $(`#obType_wrapper_head${otype} .btn_container`).append(`<a class="btn new_btn pull-right" href="../Eb_Object/Index?objid=null&objtype=${otype}">
                                                            <i class="material-icons">add</i></a>`);
            }

        }
        $(".obType_wrapper_head").on("click", this.actionCollapse.bind(this));
        $(".new_btn").on("click", function (e) { e.stopPropagation(); });
        $(".obj_search_input").off("click").on("click",function (e) {e.stopPropagation();});
    };

    this.apndOTypeContainer = function ($ob, _objArray) {
        for (let i = 0; i < _objArray.length; i++) {
            this.code4AppendList(_objArray[i], $ob);
        }
    };

    this.actionCollapse = function (e) {
        var $div = $(e.target).closest(".obType_wrapper_head");
        if ($div.attr("aria-expanded") !== "true") {
            $div.closest(".objContainer_f_app").addClass("brd");
            $div.addClass("collapse_headBG").children(".btn_container").children("input").show();
            $div.children(".btn_container").children(".ob_search").hide();
            if (parseInt($div.attr("len")) < 1)
                $("#" + $div.attr("obj_container")).children(".not-found").show().text("empty.");
            else
                $("#" + $div.attr("obj_container")).children(".not-found").hide().text(" ");
        }
        else {
            $div.closest(".objContainer_f_app").removeClass("brd");
            $div.removeClass("collapse_headBG").children(".btn_container").children("input").hide();
            $div.children(".btn_container").children(".ob_search").show();
        }
    };

    this.appendObjList = function ($ob, otype) {
        var key = otype;
        var url;
        //console.log(this.resultObj);
        //$(".modal-body #objList").empty();
        if (this.login === "dc") {
            $("#topmenu .new_builder").attr("href", "../Eb_Object/Index?objid=" + null + "&objtype=" + key + "");
            $.each(this.resultObj.Data[key].Objects, function (i, _obj) {
                url = `../Eb_Object/Index?objid=${_obj.Id}&objtype=${_obj.EbObjectType}`;
                this.code4AppendList(_obj, url);
            }.bind(this));
        }
        else {
            //var ctrlActObj = JSON.parse($(e.target).attr("data-action"));
            //var Appid = $(e.target).attr("data-Appid")
            //$.each(this.resultObj.Data[appid].Types[key].Objects, function (i, _obj) {
            //    //url = `../${ctrlActObj.Controller}/${ctrlActObj.Action}?refid=${_obj.Refid}`;
            //    this.code4AppendList(_obj, url,$ob);
            //}.bind(this));

        }
    }

    this.appendAppList = function (e) {
        $("#topmenu .new_builder").attr("href", "../Dev/CreateApplication");
        $(".modal-body #objList").empty();
        $.each(this.resultObj.AppList, function (i, _obj) {
            var url = `../Dev/CreateApplication?itemid=${i}`;
            $(".modal-body #objList").append(`
                <div class='col-md-6 objitems' name='objBox'>
                    <div class='col-md-1 obj-icon'>
                        <div class='obj-ic-cir'>
                            <i class='fa fa-file-text' aria-hidden='true'></i>
                        </div>
                    </div>
                    <div class='col-md-10' style='padding-right: 0px !important;'>
                        <h4 name='head4' style='color:black;font-size: 14px;'>${_obj.AppName}</h4>
                        <p class="text-justify">dsgfds dgfrdhg </p>
                        <h6>
                            <i style="font-style:italic;">Created by Mr X on 12/09/2017 at 02:00 pm</i>
                            <a style="margin-left:10px;">
                                <span name="Status" class="label label-primary">Status</span>
                                <span name="Version" class="label label-default">Version</span>
                                <span class="label label-success">Dependency</span>
                                <span name="Application" class="label label-danger">Application</span>
                            </a>
                        </h6>
                    </div>
                    <div class='col-md-1 objbox-footer'>
                         <a href='${url}' class='btn'><i class="fa fa-arrow-right" aria-hidden="true"></i></a>
                    </div>
                </div>`);
        });
    }

    this.searchFAllObjects = function (e) {
        $(".modal-body #objList").empty();
        var srch = $(e.target).val().toLowerCase();
        if (srch !== "") {
                $.each(this.resultObj.Data, function (i, Types) {
                    $.each(Types.Types, function (i, _obj) {
                        _obj.Objects.forEach(function (obItem) {
                            if (obItem.ObjName.toLowerCase().indexOf(srch) !== -1) {
                                this.code4AppendList(obItem, $(".modal-body #objList"));
                            }
                        }.bind(this));
                    }.bind(this));
                }.bind(this));
            //}
            //else {
            //    $.each(this.resultObj.Data, function (i, Apps) {
            //        $.each(Apps.Types, function (j, Type) {
            //            $.each(Type.Objects, function (l, _obj) {
            //                if (_obj.ObjName.toLowerCase().indexOf(srch) !== -1) {
            //                    f = true;
            //                    if (_obj.EbType == "TableVisualization" || _obj.EbType == "ChartVisualization") {
            //                        url = "../DV/dv?refid=" + _obj.Refid;
            //                    }
            //                    else if (_obj.EbType == "Report") {
            //                        url = "../ReportRender/Index?refid=" + _obj.Refid;
            //                    }
            //                    this.code4AppendList(_obj, url);
            //                }
            //            }.bind(this));
            //        }.bind(this));
            //    }.bind(this));
            //}

            //if (!f)
            //    $("#notfound").text('Item not found.......');
            //else
            //    $("#notfound").text('');
            ////}
        }
    };

    this.decideUrl = function (_obj) {
        var _url = `../Eb_Object/Index?objid=${_obj.Id}&objtype=${_obj.EbObjectType}`;
        if (this.login === "uc") {
            if (_obj.EbType == "TableVisualization" || _obj.EbType == "ChartVisualization") {
                _url = "../DV/dv?refid=" + _obj.Refid;
            }
            else if (_obj.EbType == "Report") {
                _url = "../ReportRender/Index?refid=" + _obj.Refid;
            }            
        }
        return _url;
    };

    this.code4AppendList = function (_obj, $container) {

        var appname = "Not Selected..";
        if (_obj.AppId > 0)
            appname = this.resultObj.AppList[_obj.AppId].AppName;
        $container.append(`
                <div class='col-md-6 objitems' name='objBox'>
                    <div class="object_container">
                    <div class='col-md-11 col-lg-11 col-sm-11 pd-0'>
                        <h4 class='head4'>${_obj.ObjName}</h4>
                        <p class='text-justify'>${_obj.Description}</p>
                        <div class="label_container">
                                <span name="Version" class="label">V.${_obj.VersionNumber}</span>
                                <span class="label">${_obj.EbType}</span>
                                <span name="Application" class="label">${appname}</span>
                        </div>
                    </div>
                    <div class='col-md-1 pd-0 objbox-footer'>
                        <a href='${this.decideUrl(_obj)}' class='btn'><i class="fa fa-pencil" aria-hidden="true"></i></a>
                    </div>
                    </div>
                </div>`);
    };

    this.changeIcon = function (e) {
        if (this.login === "uc") {
            if ($(e.target).hasClass("collapsed"))
                $(e.target).children("i").attr("class", "fa fa-angle-down")
            else
                $(e.target).children("i").attr("class", "fa fa-angle-right")
        }
    };

    this.init();
}