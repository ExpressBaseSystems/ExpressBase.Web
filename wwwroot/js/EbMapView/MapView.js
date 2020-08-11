

//var mapView = function (options) {
//    this.TabNum = options.tabNum;
//    this.Wc = options.Wc;
//    this.Cid = options.Cid;
//    this.EbObject = options.dsobj;
//    this.GoogleKey = options.googlekey;
//    this.Refid = options.refid;
//    this.CurrentStatus = options.cur_status;
//    this.SSUrl = options.ssurl;
//    this.Ver_Num = options.ver_num;
//    this.Login = options.login;
//    this.TenantId = options.TenantId;
//    this.UserId = options.UserId;

//    this.initPropertyGrid = function () {
//        this.propGrid = new Eb_PropertyGrid({
//            id: `propGrid-${this.TabNum}`,
//            wc: this.Wc,
//            cid: this.Cid,
//            $extCont: $(`#pgt-cont-${this.TabNum}`),
//            isDraggable: true
//        });

//        if (this.EbObject === null) {
//            this.EbObject = new EbObjects.EbOpenStreetMap(`EbMapView${Date.now()}`);
//        }
//        commonO.Current_obj = this.EbObject;
//        this.propGrid.setObject(this.EbObject, AllMetas["EbOpenStreetMap"]);
//        this.propGrid.PropertyChanged = this.popChanged.bind(this);

//    };

//    this.popChanged = function (obj, pname, newval, oldval) {
//        if (pname === "DataSourceRefId") {
//            if (obj[pname] !== null) {
//                //this.PcFlag = true;
//                //this.EbObject.Columns.$values = [];
//                //this.EbObject.DSColumns.$values = [];
//                //this.EbObject.LatLong = null;
//                this.call2FD();
//            }
//        }
//    };

//    this.call2FD = function () {
//        this.relatedObjects = this.EbObject.DataSourceRefId;
//        $("#eb_common_loader").EbLoader("show");
//        $.ajax({
//            type: "POST",
//            url: "../DV/dvCommon",
//            data: { dvobj: JSON.stringify(this.EbObject), dvRefId: this.Refid, _flag: this.PcFlag, login: this.login, contextId: this.ContextId, _curloc: store.get("Eb_Loc-" + this.TenantId + this.UserId) },
//            success: this.ajaxSucc
//        });

//    };

//    this.ajaxSucc = function (text) {
//        this.AppendFD(text);
//    }.bind(this);

//    this.AppendFD = function (result) {
//        $('.param-div-cont').remove();
//        $(`#column-cont-${this.TabNum}`).prepend(`
//                <div id='paramdiv-Cont${this.TabNum}' class='param-div-cont'>
//                <div id='paramdiv${this.TabNum}' class='param-div fd'>
//                    <div class='pgHead'>
//                        <h6 class='smallfont' style='font-size: 12px;display:inline'>Filter Dialogue</h6>
//                        <div class="icon-cont  pull-right" id='close_paramdiv${this.TabNum}'><i class="fa fa-times" aria-hidden="true"></i></div>
//                    </div>
//                    </div>
//                    </div>
//                `);

//        $('#paramdiv' + this.tabNum).append(result);
//        $('#close_paramdiv' + this.TabNum).off('click').on('click', this.CloseParamDiv.bind(this));
//        $("#btnGo").off("click").on("click", this.GetFilterValues.bind(this));
//        if (typeof FilterDialog !== "undefined") {
//            $(".param-div-cont").show();
//            this.stickBtn = new EbStickButton({
//                $wraper: $(".param-div-cont"),
//                $extCont: $(".param-div-cont"),
//                icon: "fa-filter",
//                dir: "left",
//                label: "Parameters",
//                style: { top: "230px" }
//            });
//            this.filterDialog = FilterDialog;
//        }
//        else {
//            $(".param-div-cont").hide();
//            this.filterDialog = null;
//        }
//    };

//    this.GetFilterValues = function () {
//        this.filtervalues = [];
//        if (this.filterDialog)
//            this.filtervalues = getValsForViz(this.filterDialog.FormObj);

//        let temp = $.grep(this.filtervalues, function (obj) { return obj.Name === "eb_loc_id"; });
//        if (temp.length === 0)
//            this.filtervalues.push(new fltr_obj(11, "eb_loc_id", store.get("Eb_Loc-" + ebcontext.sid + ebcontext.user.UserId)));
//        temp = $.grep(this.filtervalues, function (obj) { return obj.Name === "eb_currentuser_id"; });
//        if (temp.length === 0)
//            this.filtervalues.push(new fltr_obj(11, "eb_currentuser_id", ebcontext.user.UserId));
//        if (this.stickBtn) { this.stickBtn.minimise(); }
//    };

//    this.CloseParamDiv = function () {
//        this.stickBtn.minimise();
//    };

//    this.init = function () {
//        this.initPropertyGrid();
//    };

//    this.init();
//}



var informaion = function (nam, val) {
    this.name = nam;
    this.value = val;
};

var BuilderMode = {
    NEW: "new",
    EDIT: "edit"
};
var mapView = function (option) {
    this.propGrid = option.PGobj || null;
    this.data = null;
    this.ssurl = option.ssurl;
    this.EbObject = option.dsobj || null;
    this.Refid = option.refid || "";
    this.tabNum = option.tabNum || 0;
    this.tableId = option.tableId || null;
    this.drake = null;
    this.PcFlag = false;
    this.login = option.login || "dc";
    this.relatedObjects = null;
    this.FD = false;
    this.MainData = option.data || null;
    this.isPipped = false;
    this.isContextual = false;
    this.filterValues = (option.filterValues !== "" && option.filterValues !== undefined && option.filterValues !== null) ? JSON.parse(decodeURIComponent(escape(window.atob(option.filterValues)))) : [];
    this.rowData = (option.rowData !== undefined && option.rowData !== null && option.rowData !== "") ? JSON.parse(decodeURIComponent(escape(window.atob(option.rowData)))) : null;
    this.isTagged = false;
    this.bot = false;
    this.cellData = option.cellData;
    this.filterHtml = "";
    this.isSecondTime = false;
    this.Mode = null;
    this.counter = option.counter || 0;
    this.TenantId = option.TenantId;
    this.UserId = option.UserId;
    this.googlekey = option.googlekey;
    this.Source = option.Source || "Visualization";
    this.ObjCollection = {};
    this.CurrentMapType = this.EbObject ? this.EbObject.Maptype : 0;
    this.TempEbObject;
    this.Temp2EbObject;
    this.MapEnum = {};
    this.MapEnum[0] = "EbOpenStreetMap";
    this.MapEnum[1] = "EbGoogleMap";

    if (this.Source === "Visualization") {
        let split_window = new splitWindow("parent-div0", "contBox");

        split_window.windowOnFocus = function (ev) {
            $("#Relateddiv").hide();
            if ($(ev.target).attr("class") !== undefined) {
                if ($(ev.target).attr("class").indexOf("sub-windows") !== -1) {
                    var id = $(ev.target).attr("id");
                    focusedId = id;
                }
            }
        }.bind(this);

        this.init = function () {
            if (this.EbObject === null) {
                this.EbObject = new EbObjects.EbOpenStreetMap(`EbMapView${Date.now()}`);
                this.Mode = BuilderMode.NEW;
            }
            else {
                this.CurrentMapType = this.EbObject.Maptype;
                this.Mode = BuilderMode.EDIT;
            }
            this.MapObjectCollFn();
            if (this.MainData !== null)
                split_window.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter, "EbGoogleMap", prevfocusedId);
            else
                split_window.createContentWindow(this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter, "EbGoogleMap");
            if (this.propGrid === null) {
                this.CreatePg();
            }
            else {
                $(".form-group #ppt-grid").remove();
                $(".form-group").prepend(`<button class="btn filter_menu" id="ppt-grid">
                                    <i class="fa fa-cog" aria-expanded="false"></i>
                                </button>`);
                $(".stickBtn").hide();
                this.PropertyDiv = $("#pp_inner");
                $("#ppt-grid").off("click").on("click", this.togglePG.bind(this));
                $("#pp_inner .pull-right.pgpin").remove();
                $("#pp_inner .pgHead").append(`<div class="icon-cont  pull-right" id="${this.tabNum}_pg-close">
                <i class="fa fa-thumb-tack" style="transform: rotate(90deg);"></i></div>`);
                $(`#${this.tabNum}_pg-close`).off("click").on("click", this.togglePG.bind(this));
            }
            this.InitParamWindow();
            if (this.Mode === BuilderMode.EDIT)
                this.call2FD();
        };

        this.MapObjectCollFn = function () {
            if (this.EbObject.Maptype === 0) {
                this.Temp2EbObject = $.extend(new EbObjects.EbGoogleMap(`EbMapView${Date.now()}`), this.EbObject);
                this.TempEbObject = $.extend(new EbObjects.EbOpenStreetMap(`EbMapView${Date.now()}`), this.EbObject);
                this.Temp2EbObject.Maptype = 1;
            }
            else {
                this.TempEbObject = $.extend(new EbObjects.EbOpenStreetMap(`EbMapView${Date.now()}`), this.EbObject);
                this.Temp2EbObject = $.extend(new EbObjects.EbGoogleMap(`EbMapView${Date.now()}`), this.EbObject);
                this.TempEbObject.Maptype = 0;
            }
        };

        this.CreatePg = function () {
            $(".form-group #ppt-grid").remove();
            $(".form-group").prepend(`<button class="btn filter_menu" id="ppt-grid">
                                    <i class="fa fa-cog" aria-expanded="false"></i>
                                </button>`);
            this.propGrid = new Eb_PropertyGrid({
                id: "pp_inner",
                wc: "dc",
                cid: this.cid,
                $extCont: $(".ppcont")
            });
            this.propGrid.PropertyChanged = this.tmpPropertyChanged;
            commonO.Current_obj = this.EbObject;
            this.MapSwitch(this.EbObject, this.CurrentMapType);
            $(".stickBtn").hide();
            this.PropertyDiv = $("#pp_inner");
            $("#ppt-grid").off("click").on("click", this.togglePG.bind(this));
            $("#pp_inner .pull-right.pgpin").remove();
            $("#pp_inner .pgHead").append(`<div class="icon-cont  pull-right" id="${this.tabNum}_pg-close">
                <i class="fa fa-thumb-tack" style="transform: rotate(90deg);"></i></div>`);
            $(`#${this.tabNum}_pg-close`).off("click").on("click", this.togglePG.bind(this));
        };
        this.togglePG = function () {
            this.PropertyDiv.toggle('drop', { direction: 'right' }, 150);
        };
        this.MapSwitch = function (obj, newVal) {
            if (this.CurrentMapType == 0) {
                this.TempEbObject.Maptype = 0;
                this.Temp2EbObject.Maptype = 1;
            }
            else {
                this.Temp2EbObject.Maptype = 1;
                this.TempEbObject.Maptype = 0;
            }
            if (newVal === 0) {
                this.propGrid.setObject(this.TempEbObject, AllMetas["EbOpenStreetMap"]);
                this.EbObject = $.extend(new EbObjects.EbOpenStreetMap(`EbMapView${Date.now()}`), this.TempEbObject);
            }
            else if (newVal === 1) {
                this.propGrid.setObject(this.Temp2EbObject, AllMetas["EbGoogleMap"]);
                this.EbObject = $.extend(new EbObjects.EbGoogleMap(`EbMapView${Date.now()}`), this.Temp2EbObject);
            }
        };

        this.InitParamWindow = function () {
            this.tableId = "dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter;
            this.ContextId = "filterWindow_" + this.tableId;
            this.FDCont = $(`<div id='${this.ContextId}' class='filterCont fd'></div>`);
            $("#parent-div0").before(this.FDCont);
            this.FDCont.hide();

            if (this.login === "dc") {
                $(".form-group #filter-dg").remove();
                $(".form-group").prepend(`<button class="btn filter_menu" id="filter-dg">
                                    <i class="fa fa-filter" aria-expanded="false"></i>
                                </button>`);
                this.FilterBtn = $("#filter-dg");
                this.FilterBtn.off("click").on("click", this.FilterToggle.bind(this));
                //this.stickBtn = new EbStickButton({
                //    $wraper: this.FDCont,
                //    $extCont: this.FDCont,
                //    //$scope: $(subDivId),
                //    icon: "fa-filter",
                //    dir: "left",
                //    label: "Parameters",
                //    //btnTop: 42,
                //    style: { top: "112px" }
                //});
            }
        };

        this.tmpPropertyChanged = function (obj, Pname, newval, oldval) {
            if (Pname === "DataSourceRefId") {
                if (obj[Pname] !== null) {
                    this.Temp2EbObject.DataSourceRefId = newval;
                    this.TempEbObject.DataSourceRefId = newval;
                    this.MapSwitch(obj, obj.Maptype);
                    this.PcFlag = true;
                    this.EbObject.Columns.$values = [];
                    this.EbObject.DSColumns.$values = [];
                    this.EbObject.LatLong = null;
                    this.call2FD();
                }
            }
            else if (Pname === "Name") {
                $("#objname").text(obj.DisplayName);
            }
            else if (Pname === "Maptype") {
                this.Temp2EbObject.DataSourceRefId = obj.DataSourceRefId;
                this.TempEbObject.DataSourceRefId = obj.DataSourceRefId;
                this.MapSwitch(obj, obj.Maptype);
            }
        }.bind(this);
    }

    this.init4Other = function () {
        this.Mode === BuilderMode.EDIT;
        this.getDataCall();
    }

    this.call2FD = function () {
        this.relatedObjects = this.EbObject.DataSourceRefId;
        $("#eb_common_loader").EbLoader("show");
        $.ajax({
            type: "POST",
            url: "../DV/dvCommon",
            data: { dvobj: JSON.stringify(this.EbObject), dvRefId: this.Refid, _flag: this.PcFlag, login: this.login, contextId: this.ContextId, _curloc: store.get("Eb_Loc-" + this.TenantId + this.UserId) },
            success: this.ajaxSucc
        });

    };

    this.ajaxSucc = function (text) {
        if (this.login === "uc")
            $("#ppcont").hide();
        if (this.MainData !== null) {
            $("#Pipped").show();
            $("#Pipped").text("Pipped From: " + this.EbObject.Pippedfrom);
            this.isPipped = true;
            //this.filterValues = dvcontainerObj.dvcol[prevfocusedId].filterValues;
        }
        else if (this.rowData !== null && this.rowData !== "") {
            this.isContextual = true;
        }
        else
            this.isTagged = true;

        $("#obj_icons").empty();
        $("#obj_icons").append("<button id='btnGo" + this.tabNum + "' class='btn commonControl'><i class='fa fa-play' aria-hidden='true'></i></button>");
        $("#btnGo" + this.tabNum).click(this.Getdata.bind(this));
        var subDivId = "#sub_window_dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter;
        $("#content_dv" + this.EbObject.EbSid + "_" + this.tabNum + "_" + this.counter).empty();
        this.filterHtml = text;

        this.FDCont = $("#filterWindow_" + this.tableId);
        $("#filterWindow_" + this.tableId).empty();
        $("#filterWindow_" + this.tableId).append("<div class='pgHead'> Param window <div class='icon-cont  pull-right' id='close_paramdiv_" + this.tableId + "'><i class='fa fa-thumb-tack' style='transform: rotate(90deg);'></i></div></div>");//
        $("#filterWindow_" + this.tableId).children().find('#close_paramdiv_' + this.tableId).off('click').on('click', this.CloseParamDiv.bind(this));
        $("#filterWindow_" + this.tableId).append(text);
        $("#filterWindow_" + this.tableId).children().find("#btnGo").click(this.Getdata.bind(this));

        this.FilterDialog = (typeof (FilterDialog) !== "undefined") ? FilterDialog : {};
        if (this.login === "uc") {
            $(".form-group #filter-dg").remove();
            $(".form-group").prepend(`<button class="btn filter_menu" id="filter-dg">
                                    <i class="fa fa-filter" aria-expanded="false"></i>
                                </button>`);
            this.FilterBtn = $("#filter-dg");
            this.FilterBtn.off("click").on("click", this.FilterToggle.bind(this));
            //this.stickBtn = new EbStickButton({
            //    $wraper: $(".dv-body"),
            //    $extCont: this.FDCont,
            //    $scope: $("#" + focusedId),
            //    icon: "fa-filter",
            //    dir: "left",
            //    label: "Parameters",
            //    //btnTop: 42,
            //    style: { position: "absolute", top: "41px" }
            //});
        }

        if (typeof commonO !== "undefined")
            this.EbObject = commonO.Current_obj;
        else
            this.EbObject = dvcontainerObj.currentObj;

        if ($("#" + this.ContextId).children("#filterBox").length === 0) {
            this.FD = false;
            this.FDCont.hide();
            if (this.login === "dc") {
                //this.stickBtn.hide();
                this.FilterBtn.hide();
            }
            else {
                //dvcontainerObj.dvcol[focusedId].stickBtn.hide();
                this.FilterBtn.hide();
            }
            $("#btnGo" + this.tabNum).trigger("click");
            $("#eb_common_loader").EbLoader("hide");
        }
        else {
            this.FD = true;
            if (this.isPipped || this.isContextual) {
                this.placefiltervalues();
                $("#btnGo" + this.tabNum).trigger("click");
            }
            else {
                this.FDCont.show();
                this.FDCont.css("visibility", "visible");
            }
            $("#eb_common_loader").EbLoader("hide");
        }
        $(subDivId).focus();
        this.PcFlag = false;
        this.FDCont.css("right", "0");
    }.bind(this);

    this.FilterToggle = function () {
        $(".filterCont").toggle('drop', { direction: 'right' }, 150);
    };
    this.CloseParamDiv = function () {
        //this.stickBtn.minimise();
        this.FilterToggle();
    };

    this.Getdata = function () {
        this.EbObject = this.EbObject;
        //$.event.props.push('dataTransfer');
        this.CreateGoggleDiv();
        this.appendColumns();
        this.appendLatLong();
        if (this.login === "uc") {
            this.collapseGraph();
        }
        //this.propGrid.ClosePG();
        this.PropertyDiv.hide();
        if (this.FD) {
            this.FilterToggle();
            //this.stickBtn.minimise();
        }
        else {
            this.FilterBtn.hide();
            //this.stickBtn.hide();
        }

        filterChanged = false;
        if (this.MainData !== null && !this.isSecondTime) {
            this.drawMapHelper(this.MainData.data);
        }
        else {
            if (this.login === "uc") {
                dvcontainerObj.currentObj.Pippedfrom = "";
                $("#Pipped").text("");
                this.isPipped = false;
            }
            if (this.isContextual) {
                if (this.isSecondTime) {
                    if (this.FilterDialog.IsFDValidationOK && !this.FilterDialog.IsFDValidationOK())
                        return;
                    this.filterValues = this.getFilterValues();
                }
            }
            else {
                if (this.FilterDialog.IsFDValidationOK && !this.FilterDialog.IsFDValidationOK())
                    return;
                this.filterValues = this.getFilterValues();
            }
            $("#eb_common_loader").EbLoader("show");
            this.getDataCall();
            this.isSecondTime = true;
        }
        this.GenerateButtons();

    };

    this.getDataCall = function () {
        $.ajax({
            type: 'POST',
            url: "../DV/getdata",
            data: { DataVizObjString: JSON.stringify(this.EbObject), draw: 1, RefId: this.EbObject.DataSourceRefId, Start: 0, Length: 50, TFilters: [], Params: this.filterValues, dvRefId: this.Refid },
            //beforeSend: function (xhr) {
            //    xhr.setRequestHeader("Authorization", "Bearer " + getToken());
            //},
            success: this.getDataSuccess.bind(this),
            error: function () { }
        });
    };

    this.getFilterValues = function () {
        var fltr_collection = [];

        if (this.FD)
            fltr_collection = getValsForViz(this.FilterDialog.FormObj);

        return fltr_collection;
    };

    this.CreateGoggleDiv = function () {
        $("#content_" + this.tableId).empty();
        $("#content_" + this.tableId).append(
            `<div id='graphcontainer_tab${this.tableId}' style='height:inherit;' class='chartCont'>
                <div class='col-md-2 no-padd' id='columnsDisplay${this.tableId}' style='height:inherit;'>
                <div class='tag-cont'>
                  <div class='tag-wraper'><div class='pgHead'>Data</div><div class='tag-scroll'><div id='ColumnCont${this.tableId}'></div>
                    <ul id="data-table-list_${this.tableId}" class="tool-box-items">
                        <li>
                            <a>Columns</a>
                            <ul id="Columns${this.tableId}"></ul>
                        </li>
                    </ul>
                </div></div>
                </div>
                </div>
                <div class='col-md-10 canvasParentDiv' id='canvasParentDiv${this.tableId}'>
                    <div id='xy${this.tableId}' style='vertical-align: top;'> 
                        <div class='input-group' >
                            <span class='input-group-addon' id='basic-addon3'> LatLong</span> 
                            <div class='form-control' style='padding: 4px;height:33px' id='LatLong${this.tableId}' ></div> 
                        </div>                
                    </div> 
                <div id='canvasDiv${this.tableId}' class="canvasstyle" ><canvas id='myChart${this.tableId}'></canvas></div> 
                </div> 
                </div>`);
    };

    this.getDataSuccess = function (result) {
        if (this.Source === "Visualization") {
            $("#eb_common_loader").EbLoader("hide");
            if (this.login === "uc")
                dvcontainerObj.currentObj.data = result;
        }
        this.MainData = result;
        this.data = result.data;
        this.formatedData = result.formattedData;
        if (this.EbObject.Maptype === 1) {
            this.drawMapHelper();
        }
        else { this.drawOSMapHelper(); }
    };

    //this.drawOSMapHelper = function () {

    //};

    this.drawOSMapHelper = function (datain) {
        if (datain)
            this.data = datain;
        if (this.EbObject.LatLong !== null)
            this.drawOSMap();
    };

    this.drawOSMap = function () {
        $("#canvasDiv" + this.tableId).children("iframe").remove();
        $("#myChart" + this.tableId).remove();
        if ($("#map" + this.tableId).children().length === 0)
            $("#canvasDiv" + this.tableId).append("<div id='map" + this.tableId + "' style='height:100%;width:100%;'></div>");
        Xlabel = this.XLabel;
        Ylabel = this.YLabel;
        showRoute = this.EbObject.ShowRoute;
        //if (!this.isMyScriptLoaded("https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js")) {
        //    $("#layout_div").prepend(`
        //    <script data-hai="aa" src= 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js' ></script>
        //    <script data-hai="aa" async defer
        //        src='https://maps.googleapis.com/maps/api/js?key=${this.googlekey}&callback=initMap2'>
        //    </script>`);
        //}
        //else {
        //    $("#map" + this.tableId).empty();
        //    initMap2();
        //}
        if (this.login === "uc")
            $(".canvasParentDiv").css("padding", " 10px 0px");
        $("#eb_common_loader").EbLoader("hide");
        this.initOSM(this.EbObject, `map${this.tableId}`);
    };


    this.initOSM = function (Ebobject, id) {
        this.getData4GoogleMap();
        this.Ebobject = Ebobject;
        let selector = id;
        //var mymap = L.map(selector).setView([51.505, -0.09], 13);
        //L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        //    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        //    maxZoom: 18,
        //    id: 'mapbox/streets-v11',
        //    tileSize: 512,
        //    zoomOffset: -1,
        //    accessToken: 'pk.eyJ1Ijoibml0aGludmFzdWRldmFuIiwiYSI6ImNrODZ4cmJ5MDAyam4zaXFzNzI1cXp6N2UifQ.qvc5HjqC79yEAR2nhgbYJA'
        //}).addTo(mymap);
        //var marker = L.marker([51.5, -0.09]).addTo(mymap);


        let google = window.google;
        if (this.Lat.length > 0) {
            var mid = Math.floor(this.Lat.length / 2);
            var mymap = L.map(selector).setView([this.Lat[mid], this.Long[mid]], 13);
            L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox/streets-v11',
                tileSize: 512,
                zoomOffset: -1,
                accessToken: 'pk.eyJ1Ijoibml0aGludmFzdWRldmFuIiwiYSI6ImNrODZ4cmJ5MDAyam4zaXFzNzI1cXp6N2UifQ.qvc5HjqC79yEAR2nhgbYJA'
            }).addTo(mymap);
            //var marker, i;
            //for (i = 0; i < this.Lat.length; i++) {
            //    var marker = L.marker([this.Lat[i], this.Long[i]]).addTo(mymap);
            //}

            var markerArray = [];
            var marker, i;
            for (i = 0; i < this.Lat.length; i++) {
                var marker = L.marker([this.Lat[i], this.Long[i]]).addTo(mymap);
                var content = "", url = "";
                $.each(this.Inform, function (k, obj) {
                    content += obj.value[i] + "</br>";
                });
                if (this.MarkerLink) {
                    url = `../webform/index?refid=${this.MarkerLink}&_params=${btoa(JSON.stringify([this.markerParams[i]]))}&_mode=1&_locId=${store.get("Eb_Loc-" + Te_id + Usr_id)}`;
                    content += `<a href="#" onclick='window.open("${url}","_blank");'>Details</a>`;
                }
                if (content === "")
                    content = "no details";

                marker.bindPopup(`<div>${content}</div>`).openPopup();
                markerArray.push(marker);

                if (this.AutoZoom)
                    if (i == this.Lat.length - 1) {//this is the case when all the markers would be added to array
                        var group = L.featureGroup(markerArray); //add markers array to featureGroup
                        mymap.fitBounds(group.getBounds());
                    }
            }

        }
        else {
            $(`#map${this.tableId}`).append("<div class='map_inner'>No Data Available</div>");
        }
    }


    this.GenerateButtons = function () {
        $("#objname").text(this.EbObject.DisplayName);
        $("#obj_icons").empty();
        $("#obj_icons").append("<button id='btnGo" + this.tableId + "' class='btn commonControl'><i class='fa fa-play' aria-hidden='true'></i></button>");
        $("#btnGo" + this.tableId).click(this.Getdata.bind(this));
        $("#obj_icons").append(`           
            <button id='btnColumnCollapse${ this.tableId}' class='btn' style='display: inline-block;'>
            <i class="fa fa-cogs" aria-hidden="true"></i>
            </button>`);

        if (this.login === "uc") {
            dvcontainerObj.modifyNavigation();
            $(`#btnColumnCollapse${this.tableId}`).hide();
        }
        this.bindEvents();

        if (this.bot) {
            $("#columnsDisplay" + this.tableId).empty();
            $("#columnsDisplay" + this.tableId).append(`<div class="pgHead">User:<label></label></div>`);
            $("#xy" + this.tableId).hide();
            $(".toolicons").hide();
            $("#canvasParentDiv" + this.tableId).removeClass("col-md-10").addClass("col-md-9");
            $("#columnsDisplay" + this.tableId).removeClass("col-md-2").addClass("col-md-3").addClass("botdata_cont").show();

        }
    };

    this.bindEvents = function () {
        $("#btnColumnCollapse" + this.tableId).off("click").on("click", this.collapseGraph.bind(this));
    };

    this.appendColumns = function () {
        this.appendColumns4Google();
        $('#data-table-list_' + this.tableId).killTree();
        $('#data-table-list_' + this.tableId).treed();
        $('#data-table-list_' + this.tableId + ' .branch a').trigger("click");
        this.updateDragula();
    };

    this.appendColumns4Google = function () {
        let temparray = [];
        if (this.EbObject.LatLong)
            temparray = this.EbObject.Columns.$values.filter((obj) => obj.name !== this.EbObject.LatLong.name);
        else
            temparray = this.EbObject.Columns.$values;
        $.each(temparray, function (i, obj) {
            this.AppendColumnInsideFn(obj);
        }.bind(this));
    };

    this.AppendColumnInsideFn = function (obj) {
        if (obj.Type === 16)
            _classname = "fa-font";
        else if (obj.Type === 5 || obj.Type === 6)
            _classname = "fa-calendar";
        else if (obj.Type === 8 || obj.Type === 7 || obj.Type === 11 || obj.Type === 12)
            _classname = "fa-sort-numeric-asc";

        $("#Columns" + this.tableId).append(`<li class='colTiles' style='display: list-item;' id='li${obj.name}' data-id='${obj.data}' data-type=${obj.Type}><span><i class='fa ${_classname}'></i></span>${obj.name}</li>`);
    };

    this.appendLatLong = function () {
        if (this.EbObject.LatLong !== null) {
            let obj = this.EbObject.LatLong;
            $("#LatLong" + this.tableId).empty();
            $("#LatLong" + this.tableId).append("<li class='colTiles columnDrag' id='li" + obj.name + "' data-id='" + obj.data + "' data-type='" + obj.Type + "'>" + obj.name + "<button class='close' type='button'>x</button></li>");

        }
        $("#LatLong" + this.tableId + " button[class=close]").off("click").on("click", this.RemoveAndAddToColumns.bind(this));
    };

    this.updateDragula = function (status) {
        if (this.drake)
            this.drake.destroy();
        this.drake = new dragula([document.getElementById("Columns" + this.tableId), document.getElementById("LatLong" + this.tableId)], {
            accepts: this.acceptDrop1.bind(this)
        });
        this.drake.off("drop").on("drop", this.colDrop.bind(this));
        this.propGrid.setObject(this.EbObject, AllMetas["EbGoogleMap"]);
    };

    this.acceptDrop1 = function (el, target, source, sibling) {
        if ($(source).attr("id") === "Columns" + this.tableId && $(target).attr("id") === "LatLong" + this.tableId) {
            if ($(target).children().length > 0) {
                return false;
            }
            else
                return true;
        }
        return false;
    };

    this.colDrop = function (el, target, source, sibling) {
        $(el).addClass("columnDrag");
        $(el).children("span").remove();
        $(el).children(".close").remove();
        var temp;
        $(el).css("display", "inline-block");
        var name = $(el).text();
        $(el).append("<button class='close' type='button'>x</button>");


        if ($(target).attr("id") === "LatLong" + this.tableId) {
            let temp = $.grep(this.EbObject.Columns.$values, function (obj) { return obj.name === name; });
            this.EbObject.LatLong = temp[0];
            this.drawMapHelper(this.data);
        }
        $("#LatLong" + this.tableId + " button[class=close]").off("click").on("click", this.RemoveAndAddToColumns.bind(this));
    };

    this.RemoveAndAddToColumns = function (e) {
        var str = $(e.target).parent().text();
        let tempObj = new Object();
        tempObj.Type = parseInt($(e.target).parent().attr("data-type"));
        tempObj.name = str.substr(0, str.length - 1).trim();
        tempObj.data = $(e.target).parent().attr("data-id");

        this.AppendColumnInsideFn(tempObj);
        $(e.target).parent().remove();

        this.EbObject.LatLong = null;
        $("#map" + this.tableId).remove();
        $("#myChart" + this.tableId).remove();
        $("#canvasDiv" + this.tableId).append("<canvas id='myChart" + this.tableId + "' width='auto' height='auto'></canvas>");
    };

    this.drawMapHelper = function (datain) {
        if (datain)
            this.data = datain;
        if (this.EbObject.LatLong !== null)
            this.drawMap();
    };

    this.drawMap = function () {
        this.getData4GoogleMap();
        $("#canvasDiv" + this.tableId).children("iframe").remove();
        $("#myChart" + this.tableId).remove();
        if ($("#map" + this.tableId).children().length === 0)
            $("#canvasDiv" + this.tableId).append("<div id='map" + this.tableId + "' style='height:100%;width:100%;'></div>");
        Xlabel = this.XLabel;
        Ylabel = this.YLabel;
        showRoute = this.EbObject.ShowRoute;
        if (!this.isMyScriptLoaded("https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js")) {
            $("#layout_div").prepend(`
            <script data-hai="aa" src= 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js' ></script>
            <script data-hai="aa" async defer
                src='https://maps.googleapis.com/maps/api/js?key=${this.googlekey}&callback=initMap2'>
            </script>`);
        }
        else {
            $("#map" + this.tableId).empty();
            initMap2();
        }
        if (this.login === "uc")
            $(".canvasParentDiv").css("padding", " 10px 0px");
        $("#eb_common_loader").EbLoader("hide");
    };

    this.getData4GoogleMap = function () {
        if (this.EbObject.LatLong !== null) {
            this.getData4LatLong();
            this.getData4MarkerLabel();
            this.getData4InfoWindow();

            if (this.EbObject.Zoomlevel)
                this.zoomlevel = this.EbObject.Zoomlevel;
            this.showRoute = this.EbObject.ShowRoute;
            this.AutoZoom = this.EbObject.AutoZoom;
            this.MarkerLink = this.EbObject.MarkerLink;

            if (this.EbObject.FormParameter.$values.length > 0) {
                let obj = this.EbObject.FormParameter.$values[0];
                $.each(this.data, function (k, value) {
                    this.markerParams.push(new fltr_obj(obj.Type, obj.name, value[obj.data]));
                }.bind(this));
                Te_id = TenantId;
                Usr_id = UserId;
            }
        }
    };

    this.getData4LatLong = function () {
        this.Lat = [], this.Long = [];

        $.each(this.data, function (k, value) {
            if (value[this.EbObject.LatLong.data] && value[this.EbObject.LatLong.data] !== "0,0") {
                let _data = value[this.EbObject.LatLong.data].split(",");
                this.Lat.push(_data[0]);
                this.Long.push(_data[1]);
            }
        }.bind(this));
    };

    this.getData4MarkerLabel = function () {
        let ml = [];
        if (this.EbObject.MarkerLabel) {
            $.each(this.EbObject.MarkerLabel.$values, function (i, obj) {
                if (i === 0)
                    ml.push(obj.data);
            });

            if (ml.length > 0) {
                $.each(this.data, function (i, value) {
                    this.markLabel.push(value[ml[0]].charAt(0));
                }.bind(this));
            }
        }
    };

    this.getData4InfoWindow = function () {
        this.Inform = [];
        if (this.EbObject.InfoWindow) {
            $.each(this.EbObject.InfoWindow.$values, function (i, obj) {
                let info = [];
                $.each(this.formatedData, function (k, value) {
                    info.push(value[obj.data]);
                });
                this.Inform.push(new informaion(obj.name, info));
            }.bind(this));
        }
    };

    window.initMap2 = function () {
        let google = window.google;
        if (this.Lat.length > 0) {
            var infowindow = new google.maps.InfoWindow();
            var directionsService = new google.maps.DirectionsService();
            var directionsDisplay = new google.maps.DirectionsRenderer();
            var bounds = new google.maps.LatLngBounds();
            var mid = Math.floor(this.Lat.length / 2);
            var map = new google.maps.Map(document.getElementById('map' + this.tableId), {
                center: new google.maps.LatLng(this.Lat[mid], this.Long[mid]),
                gestureHandling: 'greedy'
                // mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            if (!this.AutoZoom)
                map.setZoom(this.zoomlevel);
            directionsDisplay.setMap(map);
            var request = {
                travelMode: google.maps.TravelMode.DRIVING
            };
            var marker, i;
            for (i = 0; i < this.Lat.length; i++) {
                var latlng = new google.maps.LatLng(this.Lat[i], this.Long[i]);

                marker = new google.maps.Marker({
                    position: latlng,
                    map: map,
                    //label: markLabel[i]
                });

                if (i === 0) request.origin = marker.getPosition();
                else if (i === this.Lat.length - 1) request.destination = marker.getPosition();
                else {
                    if (!request.waypoints) request.waypoints = [];
                    request.waypoints.push({
                        location: marker.getPosition(),
                        stopover: true
                    });
                }

                var content = "", url = "";
                $.each(this.Inform, function (k, obj) {
                    content += obj.value[i] + "</br>";
                });
                if (this.MarkerLink) {
                    url = `../webform/index?refid=${this.MarkerLink}&_params=${btoa(JSON.stringify([this.markerParams[i]]))}&_mode=1&_locId=${store.get("Eb_Loc-" + Te_id + Usr_id)}`;
                    content += `<a href="#" onclick='window.open("${url}","_blank");'>Details</a>`;
                }
                if (content === "")
                    content = "no details";
                infowindow.setContent(content);
                infowindow.setOptions({ maxWidth: 200 });

                google.maps.event.addListener(marker, 'mouseover', (function (marker, content, infowindow) {
                    return function () {
                        infowindow.setContent(content);
                        infowindow.open(map, marker);
                    };
                })(marker, content, infowindow));

                marker.addListener('click', function () {
                    if (url !== "")
                        window.open(url, "_blank");
                });
                map.addListener('click', function () {
                    infowindow.close(map, marker);
                });
                if (this.AutoZoom)
                    bounds.extend(latlng);
            }
            if (this.showRoute) {
                directionsService.route(request, function (result, status) {
                    if (status === google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(result);
                    }
                });
            }
            if (this.AutoZoom)
                map.fitBounds(bounds);
        }
        else {
            $(`#map${this.tableId}`).append("<div class='map_inner'>No Data Available</div>");
        }

    }.bind(this);

    this.isMyScriptLoaded = function (url) {
        var scripts = document.getElementsByTagName('script');
        for (var i = scripts.length; i--;) {
            if (scripts[i].src === url) return true;
        }
        return false;
    };

    this.collapseGraph = function () {
        $("#columnsDisplay" + this.tableId).toggle();
        $("#xy" + this.tableId).toggle();
        if ($("#columnsDisplay" + this.tableId).css("display") === "none") {
            $("#canvasParentDiv" + this.tableId).removeClass("col-md-10").addClass("col-md-12");
            $("#canvasDiv" + this.tableId).css("height", "100%");
        }
        else {
            $("#canvasParentDiv" + this.tableId).removeClass("col-md-12").addClass("col-md-10");
            $("#canvasDiv" + this.tableId).css("height", "calc(100% - 67px)");
        }
    };
    if (this.Source === "Visualization")
        this.init();
    else
        this.init4Other();

};

$.fn.extend({
    treed: function (o) {
        var openedClass = 'fa-minus-square-o';
        var closedClass = 'fa-plus-square-o';
        var ic = o || 'fa-plus-square-o';

        if (typeof o !== 'undefined') {
            if (typeof o.openedClass !== 'undefined') {
                //openedClass = o.openedClass;
            }
            if (typeof o.closedClass !== 'undefined') {
                //closedClass = o.closedClass;
            }
        }
        var tree = $(this);
        tree.addClass("tree");
        tree.find('li').has("ul").each(function () {
            var branch = $(this);
            branch.prepend("<i class='indicator fa " + ic + "'></i>");
            branch.addClass('branch');
            branch.off("click").on('click', function (e) {
                if (this === e.target) {
                    var icon = $(this).children('i:first');
                    icon.toggleClass(openedClass + " " + closedClass);
                    $(this).children().children().toggle();
                }
            });
            branch.children().children().toggle();
        });
        tree.find('.branch .indicator').each(function () {
            $(this).off("click").on('click', function (e) {
                $(this).closest('li').click();
            });
        });
        tree.find('.branch>a').each(function () {
            $(this).off("click").on('click', function (e) {
                $(this).closest('li').click();
                e.preventDefault();
            });
        });
        tree.find('.branch>button').each(function () {
            $(this).off("off").on('click', function (e) {
                $(this).closest('li').click();
                e.preventDefault();
            });
        });
    }
});

$.fn.extend({
    killTree: function (o) {
        var tree = $(this);
        tree.removeClass("tree");
        tree.find('li').has("ul").each(function () {
            var branch = $(this);
            branch.children().children().show();
            branch.children("i").remove();
            branch.removeClass('branch');
            branch.off("click");
        });
    }
});


