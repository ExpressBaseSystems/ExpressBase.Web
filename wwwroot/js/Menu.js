var menujs = function (login) {
    this.login = login;
    this.resultObj = null;

    this.init = function () {
        $('#submen').off("click").on("click", this.showModal.bind(this));
        $('#MyDropDownId li').click(function () { $('#dropbuttn').text($(this).text()); });
        $("#searchobj").off("keyup").on("keyup", this.searchObjects.bind(this));
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
                $(".sub-menuObj a").off("click").on("click", this.appendObjList.bind(this));
                $(".menuApp").off("click").on("click", this.appendAppList.bind(this));
            }.bind(this));
        }
        else {
            $('#EbsideBar').animate({ width: 'toggle' });
        }
    };

    this.appendObjList = function (e) {
        var key = $(e.target).attr("data-key");
        var url;
        console.log(this.resultObj);
        $(".modal-body #objList").empty();
        if (this.login === "dc") {
            $("#topmenu a").attr("href", "../Eb_Object/Index?objid=" + null + "&objtype=" + key + "");
            $.each(this.resultObj.Data[key].Objects, function (i, _obj) {
                url = `../Eb_Object/Index?objid=${_obj.Id}&objtype=${_obj.EbObjectType}`;
                this.code4AppendList(_obj, url);
            }.bind(this));
        }
        else {
            var ctrlActObj = JSON.parse($(e.target).attr("data-action"));
            var Appid = $(e.target).attr("data-Appid")
            $.each(this.resultObj.Data[Appid].Types[key].Objects, function (i, _obj) {
                url = `../${ctrlActObj.Controller}/${ctrlActObj.Action}?refid=${_obj.Refid}`;
                this.code4AppendList(_obj, url);
            }.bind(this));

        }
    }

    this.appendAppList = function (e) {
        $("#topmenu a").attr("href", "../Dev/CreateApplication");
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

    this.searchObjects = function (e) {
        var url;
        $(".modal-body #objList").empty();
        var srch = $(e.target).val().toLowerCase();
        if (srch !== "") {
            if ($('#dropbuttn').text().trim() === 'All') {
                var f = false;
                if (this.login === "dc") {
                    $.each(this.resultObj.Data, function (i, Types) {
                        $.each(Types.Objects, function (i, _obj) {
                            if (_obj.ObjName.toLowerCase().indexOf(srch) !== -1) {
                                f = true;
                                url = `../Eb_Object/Index?objid=${_obj.Id}&objtype=${_obj.EbObjectType}`;
                                this.code4AppendList(_obj, url);
                            }
                        }.bind(this));
                    }.bind(this));
                }
                else {
                    $.each(this.resultObj.Data, function (i, Apps) {
                        $.each(Apps.Types, function (j, Type) {
                            $.each(Type.Objects, function (l, _obj) {
                                        if (_obj.ObjName.toLowerCase().indexOf(srch) !== -1) {
                                            f = true;
                                            if (_obj.EbType == "TableVisualization" || _obj.EbType == "ChartVisualization") {
                                                url = "../DV/dv?refid=" + _obj.Refid;
                                            }
                                            this.code4AppendList(_obj, url);
                                        }
                                    }.bind(this));
                        }.bind(this));
                    }.bind(this));
                }

                if (!f)
                    $("#notfound").text('Item not found.......');
                else
                    $("#notfound").text('');
            }
            
        }
    };

    this.code4AppendList = function (_obj, url) {
        var appname ="Not Selected..";
        if (_obj.AppId > 0)
            appname = this.resultObj.AppList[_obj.AppId].AppName;
        $(".modal-body #objList").append(`
                <div class='col-md-6 objitems' name='objBox'>
                    <div class='col-md-1 obj-icon'>
                        <div class='obj-ic-cir'>
                            <i class='fa fa-file-text' aria-hidden='true'></i>
                        </div>
                    </div>
                    <div class='col-md-10'>
                        <h4 name='head4' style='color:black;font-size: 14px;'>${_obj.ObjName}</h4>
                        <p class='text-justify' style="font-size: 12px;">${_obj.Description}</p>
                        <h6>
                            <a>
                                <span name="Version" class="label label-default">V.${_obj.VersionNumber}</span>
                                <span class="label label-success">${_obj.EbType}</span>
                                <span name="Application" class="label label-danger">${appname}</span>
                            </a>
                        </h6>
                    </div>
                    <div class='col-md-1 objbox-footer'>
                        <a href='${url}' class='btn'><i class="fa fa-arrow-right" aria-hidden="true"></i></a>
                    </div>
                </div>`);

        if (this.login == "dc") {
            $("#objList span[name=Version]").hide();
        }
    };

    this.init();
}