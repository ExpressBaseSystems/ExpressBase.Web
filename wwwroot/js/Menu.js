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

        console.log(this.resultObj);
        $(".modal-body #objList").empty();
        if (this.login === "dc") {
            $("#topmenu a").attr("href", "../Eb_Object/Index?objid=" + null + "&objtype=" + key + "");
            $.each(this.resultObj.Data[key].Objects, function (i, _obj) {
                $(".modal-body #objList").append(`<a href='../Eb_Object/Index?objid=${_obj.Id}&objtype=${_obj.EbObjectType}'>
                <div class='col-md-6 objitems' name='objBox'>
                    <div class='col-md-1 obj-icon'>
                        <div class='obj-ic-cir'>
                            <i class='fa fa-file-text' aria-hidden='true'></i>
                        </div>
                    </div>
                    <div class='col-md-10'>
                        <h4 name='head4' style='color:black;'>${_obj.ObjName}</h4>
                        <p class='text-justify'>${_obj.Description}</p>
                    </div>
                    <div class='col-md-1 objbox-footer'>
                        <input type='button' class='btn fa-input fa-lg' value='&#xf054;' style='font-family: FontAwesome;background: transparent;'>
                    </div>
                </div></a>`);
            });
        }
        else {
            var ctrlActObj = JSON.parse($(e.target).attr("data-action"));
            var Appid = $(e.target).attr("data-Appid")
            $.each(this.resultObj.Data[Appid].Types[key].Objects, function (i, _obj) {
                $(".modal-body #objList").append(`<a href='../${ctrlActObj.Controller}/${ctrlActObj.Action}?refid=${_obj.Refid}'>
                <div class='col-md-6 objitems' name='objBox'>
                    <div class='col-md-1 obj-icon'>
                        <div class='obj-ic-cir'>
                            <i class='fa fa-file-text' aria-hidden='true'></i>
                        </div>
                    </div>
                    <div class='col-md-10'>
                        <h4 name='head4' style='color:black;'>${_obj.ObjName}</h4>
                        <p class='text-justify'>${_obj.Description}</p>
                    </div>
                    <div class='col-md-1 objbox-footer'>
                        <input type='button' class='btn fa-input fa-lg' value='&#xf054;' style='font-family: FontAwesome;background: transparent;'>
                    </div>
                </div></a>`);
            });

        }
    }

    this.appendAppList = function (e) {
        $("#topmenu a").attr("href", "../Dev/CreateApplication");
        $(".modal-body #objList").empty();
        $.each(this.resultObj.AppList, function (i, _obj) {
            $(".modal-body #objList").append(`<a href='../Dev/CreateApplication?itemid=${i}'>
                <div class='col-md-6 objitems' name='objBox'>
                    <div class='col-md-1 obj-icon'>
                        <div class='obj-ic-cir'>
                            <i class='fa fa-file-text' aria-hidden='true'></i>
                        </div>
                    </div>
                    <div class='col-md-10'>
                        <h4 name='head4' style='color:black;'>${_obj.AppName}</h4>
                        <p class='text-justify'></p>
                    </div>
                    <div class='col-md-1 objbox-footer'>
                        <input type='button' class='btn fa-input fa-lg' value='&#xf054;' style='font-family: FontAwesome;background: transparent;'>
                    </div>
                </div></a>`);
        });
    }

    this.searchObjects = function (e) {
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
                                $(".modal-body #objList").append(`<a href='../Eb_Object/Index?objid=${_obj.Id}&objtype=${_obj.EbObjectType}'>
                                <div class='col-md-6 objitems' name='objBox'>
                                    <div class='col-md-1 obj-icon'>
                                        <div class='obj-ic-cir'>
                                            <i class='fa fa-file-text' aria-hidden='true'></i>
                                        </div>
                                    </div>
                                    <div class='col-md-10'>
                                        <h4 name='head4' style='color:black;'>${_obj.ObjName}</h4>
                                        <p class='text-justify'>${_obj.Description}</p>
                                    </div>
                                    <div class='col-md-1 objbox-footer'>
                                        <input type='button' class='btn fa-input fa-lg' value='&#xf054;' style='font-family: FontAwesome;background: transparent;'>
                                    </div>
                                </div></a>`);
                            }
                        });
                    });
                }
                else {
                    var url;
                    $.each(this.resultObj.Data, function (i, Apps) {
                        $.each(Apps.Types, function (j, Type) {
                            $.each(Type.Objects, function (l, _obj) {
                                        if (_obj.ObjName.toLowerCase().indexOf(srch) !== -1) {
                                            f = true;
                                            if (_obj.EbType == "TableVisualization" || _obj.EbType == "ChartVisualization") {
                                                url = "../DV/dv?refid=" + _obj.Refid;
                                            }
                                            $(".modal-body #objList").append(`<a href='${url}'>
                                            <div class='col-md-6 objitems' name='objBox'>
                                                <div class='col-md-1 obj-icon'>
                                                    <div class='obj-ic-cir'>
                                                        <i class='fa fa-file-text' aria-hidden='true'></i>
                                                    </div>
                                                </div>
                                                <div class='col-md-10'>
                                                    <h4 name='head4' style='color:black;'>${_obj.ObjName}</h4>
                                                    <p class='text-justify'>${_obj.Description}</p>
                                                </div>
                                                <div class='col-md-1 objbox-footer'>
                                                    <input type='button' class='btn fa-input fa-lg' value='&#xf054;' style='font-family: FontAwesome;background: transparent;'>
                                                </div>
                                            </div></a>`);
                                        }
                                    });
                            });
                    });
                }

                if (!f)
                    $("#notfound").text('Item not found.......');
                else
                    $("#notfound").text('');
            }
            
        }
    };

    this.init();
}