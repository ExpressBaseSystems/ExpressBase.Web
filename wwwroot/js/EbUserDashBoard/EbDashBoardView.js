let DashBoardViewWrapper = function (options) {
    this.Version = options.Version;
    this.ObjType = options.ObjType;
    this.EbObject = options.dvObj;
    this.Statu = options.Statu;
    this.TileCollection = {};
    this.CurrentTile;
    this.Wc = options.Wc;
    this.Cid = options.Cid;
    this.objGrid;
    this.googlekey = options.googlekey || null;
    this.DashBoardList = options.AllDashBoards || null;
    this.stickBtn;
    this.filtervalues = [];
    this.rowData = options.rowData ? JSON.parse(decodeURIComponent(escape(window.atob(options.rowData)))) : null;
    this.filtervalues = options.filterValues ? JSON.parse(decodeURIComponent(escape(window.atob(options.filterValues)))) : [];
    this.filterDialogRefid = this.EbObject.Filter_Dialogue ? this.EbObject.Filter_Dialogue : "";

    this.GridStackInit = function () {
        this.objGrid1 = $('.grid-stack').gridstack({ resizable: { handles: 'e, se, s, sw, w' } });
        this.grid = $('.grid-stack').data("gridstack");
    }
    this.GridStackInit();

    //Filter Dialogue
    this.getColumns = function () {
        $.post("../DashBoard/GetFilterBody", { dvobj: JSON.stringify(this.EbObject), contextId: "paramdiv" }, this.AppendFD.bind(this));
    };

    this.AppendFD = function (result) {
        $('.db-user-filter').remove();
        $("#dashbord-user-view").prepend(`
                <div id='paramdiv-Cont${this.TabNum}' class='db-user-filter'>
                <div id='paramdiv${this.TabNum}' class='param-div fd'>
                    <div class='pgHead'>
                        <h6 class='smallfont' style='font-size: 12px;display:inline'>Filter Dialogue</h6>
                        <div class="icon-cont  pull-right" id='close_paramdiv${this.TabNum}'><i class="fa fa-times" aria-hidden="true"></i></div>
                    </div>
                    </div>
                    </div>
                `);
        $('#paramdiv' + this.TabNum).append(result);
        $('#close_paramdiv' + this.TabNum).off('click').on('click', this.CloseParamDiv.bind(this));
        $("#btnGo").off("click").on("click", this.GetFilterValues.bind(this));
        if (typeof FilterDialog !== "undefined") {
            $(".param-div-cont").show();
            this.stickBtn = new EbStickButton({
                $wraper: $(".db-user-filter"),
                $extCont: $(".db-user-filter"),
                icon: "fa-filter",
                dir: "left",
                label: "Parameters",
                style: { top: "85px" }
            });
            this.filterDialog = FilterDialog;
            this.placefiltervalues();
            $("#btnGo").trigger("click");
        }
        else {
            $(".param-div-cont").hide();
            this.filterDialog = null;
        }
    };

    this.CloseParamDiv = function () {
        this.stickBtn.minimise();
    }

    this.placefiltervalues = function () {
        $.each(getFlatControls(this.filterDialog.FormObj), function (i, obj) {
            var mapobj = getObjByval(this.filtervalues, "Name", obj.Name);
            if (typeof mapobj !== "undefined") {
                let val = mapobj.Value;
                obj.setValue(val);
            }
        }.bind(this));
    }


    this.DashboardDropdown = function () {
        let k = Object.keys(this.DashBoardList);
        let html = [`<div id="UserDashBoardSwitchList" class="DropMenuUserDash"  hide>`];
        ebcontext.header.setNameAsHtml(`<button class="DropDown4DB" id="UserDashBoardSwitchBtn"> ${this.EbObject.DisplayName} <span class="caret"></span> </button> `);
        for (let i = 0; i < k.length; i++) {
            if (this.DashBoardList[k[i]].RefId) {
                html.push(`<div style="padding:3px;"> <button class="Btn4SwitchDB btn btn-default" type="button" value="${this.DashBoardList[k[i]].RefId}">${this.DashBoardList[k[i]].DisplayName} </button></div>`);
            }
        }
        html.push("</div>");
        $("body").append(html.join(""));
        $('#objname #DashBoardObjectSelection').val(this.EbObject.RefId);
        $('.Btn4SwitchDB').off("click").on("click", this.DashBoardSwitch.bind(this));
        $('#objname #UserDashBoardSwitchBtn').off("click").on("click", this.DashBoardSwitchMenuShow.bind(this));
        $('#objname #UserDashBoardSwitchBtn').off("focusout").on("focusout", this.DashBoardSwitchMenuHide.bind(this));
    };

    this.DashBoardSwitchMenuShow = function () {
        var p = $("#UserDashBoardSwitchBtn").last();
        var offset = p.offset();
        $("#UserDashBoardSwitchList").css({ "top": (offset.top + 18), "left": offset.left });
        $("#UserDashBoardSwitchList").toggle();

    }
    this.DashBoardSwitchMenuHide = function () {
        // $("#UserDashBoardSwitchList").hide();

    }

    this.DashBoardSwitch = function (e) {

        $('.Btn4SwitchDB').removeAttr("disabled");
        let refid = e.target.getAttribute("value");
        $(`[Value=${refid}]`).attr("disabled", true);
        this.grid.removeAll();
        this.Version = this.DashBoardList[refid].VersionNumber;
        this.EbObject = this.DashBoardList[refid];
        this.Statu = this.DashBoardList[refid].Status;
        this.TileCollection = {};
        this.CurrentTile;
        this.filterDialogRefid = this.EbObject.Filter_Dialogue ? this.EbObject.Filter_Dialogue : "";
        this.init();
    }

    this.init = function () {
        $(".grid-stack").removeAttr("style");
        if (this.DashBoardList) {
            this.DashboardDropdown();
        }
        else {
            ebcontext.header.setName(this.EbObject.DisplayName);
        }
        $(`[Value=${this.EbObject.RefId}]`).attr("disabled", true);
        $("title").empty().append(this.EbObject.DisplayName);
        //
        if (this.EbObject.Filter_Dialogue === null || this.EbObject.Filter_Dialogue === undefined || this.EbObject.Filter_Dialogue === "") {
            $('.db-user-filter').remove();
            if (this.stickBtn) { this.stickBtn.$stickBtn.remove(); }
            this.grid.removeAll();
            this.DrawTiles();
        }
        else {
            this.getColumns();
        }  
        $("#dashbord-user-view").off("click").on("click", ".tile-opt", this.TileOptions.bind(this));

    }

    this.DrawTiles = function () {

        $("#dashbord-user-view").css("background-color", "").css("background-color", this.EbObject.BackgroundColor);
        if (this.EbObject.Tiles.$values.length > 0) {

            for (let i = 0; i < this.EbObject.Tiles.$values.length; i++) {
                let tile_id = "t" + i;
                let t_id = "tile" + i;
                let x = this.EbObject.Tiles.$values[i].TileDiv.Data_x;
                let y = this.EbObject.Tiles.$values[i].TileDiv.Data_y;
                let dh = this.EbObject.Tiles.$values[i].TileDiv.Data_height;
                let dw = this.EbObject.Tiles.$values[i].TileDiv.Data_width;
                let flag = false;
                if (ebcontext.user.Roles.indexOf("SolutionOwner") !== -1 || ebcontext.user.Roles.indexOf("SolutionAdmin") !== -1)
                    flag = true;
                else {
                    var res = this.EbObject.Tiles.$values[i].RefId.split("-");
                    for (var j = 0; j < ebcontext.user.EbObjectIds.length; j++) {
                        if (parseInt(ebcontext.user.EbObjectIds[j]) == parseInt(res[3]))
                            flag = true;
                    }
                }
                if (flag == true) {
                    $('.grid-stack').data('gridstack').addWidget($(`<div id="${tile_id}"> 
                    <div class="grid-stack-item-content" id=${t_id}>
                    <div style="display:flex" id="">
                    <div class="db-title" name-id="${t_id}" style="display:float"></div>
                    <div style="float:right;display:flex" u-id="${t_id}">
                    <i class="fa fa-refresh tile-opt i-opt-restart" aria-hidden="true" link="restart-tile"></i>
                    <i class="fa fa-external-link tile-opt i-opt-obj" aria-hidden="true" link="ext-link"></i>
                    </div></div>
                    <div data-id="${t_id}" class="db-tbl-wraper">
                    </div></div></div>`), x, y, dw, dh, false);
                   
                    this.CurrentTile = t_id;
                    this.TileCollection[t_id] = this.EbObject.Tiles.$values[i];
                    let refid = this.EbObject.Tiles.$values[i].RefId;
                    this.Ajax4fetchVisualization(refid);

                }
            }
            this.Tilecontext()

        }
    }

    this.Ajax4fetchVisualization = function (refid) {
        if (refid !== "") {
            $.ajax(
                {
                    url: '../DashBoard/DashBoardGetObj',
                    type: 'POST',
                    data: { refid: refid },
                    success: this.TileRefidChangesuccess.bind(this, this.CurrentTile)
                });
        }
    }


    this.TileOptions = function (e) {
        var tileid = e.target.parentElement.getAttribute("u-id");
        this.CurrentTile = tileid;
        var id = e.target.getAttribute("link");
        if (id === "ext-link") {
            let TileRefid = this.TileCollection[tileid].RefId;
            //window.open(location.origin + "/DV/dv?refid=" + TileRefid, '_blank');
            let url = "../DV/dv?refid=" + TileRefid;

            let _form = document.createElement("form");
            _form.setAttribute("method", "post");
            _form.setAttribute("action", url);
            _form.setAttribute("target", "_blank");

            let input1 = document.createElement('input');
            input1.type = 'hidden';
            input1.name = "filterValues";
            input1.value = btoa(unescape(encodeURIComponent(JSON.stringify(this.filtervalues))));
            _form.appendChild(input1);

            document.body.appendChild(_form);

            _form.submit();
            document.body.removeChild(_form);
        }
        if (id === "restart-tile") {
            $(`[data-id="${this.CurrentTile}"]`).empty();
            let Refid = this.TileCollection[tileid].RefId;
            this.Ajax4fetchVisualization(Refid);
        }
    }


    this.Tilecontext = function () {
        //$.contextMenu({
        //    selector: '.grid-stack-item-content',
        //    trigger: 'right',
        //    items: {
        //        "FullScreenView": {
        //            name: "Open in NewTab ", icon: "fa-external-link", callback: this.FullScreenViewTrigger.bind(this),
        //        },
        //    }
        //});
    }

    this.TileRefidChangesuccess = function (id, data) {
        if (this.filtervalues.length === 0 || this.filtervalues === undefined) {
            this.GetFilterValues();
        }
        let obj = JSON.parse(data);
        $(`[name-id="${id}"]`).empty().append(obj.DisplayName);
        if (obj.$type.indexOf("EbTableVisualization") >= 0) {

            $(`[data-id="${id}"]`).append(`<div id="content_tb1${id}" class="wrapper-cont"><table id="tb1${id}" class="table display table-bordered compact"></table></div>`);
            var o = {};
            o.dsid = obj.DataSourceRefId;
            o.tableId = "tb1" + id;
            o.containerId = id;
            o.columns = obj.Columns.$values;
            o.dvObject = obj;
            o.IsPaging = false;
            o.showFilterRow = false;
            o.showCheckboxColumn = false;
            o.Source = "DashBoard";
            o.drawCallBack = this.drawCallBack.bind(this, id);
            o.filterValues = btoa(unescape(encodeURIComponent(JSON.stringify(this.filtervalues))));
            var dt = new EbCommonDataTable(o); 
        }
        else if (obj.$type.indexOf("EbChartVisualization") >= 0) {
            $(`[data-id="${id}"]`).append(`<div id="canvasDivtb1${id}" class="CanvasDiv"></div>`);
            var o = {};
            o.tableId = "tb1" + id;
            o.dvObject = obj;
            o.filtervalues = this.filtervalues;
            var dt = new EbBasicChart(o);
            $(`[data-id="${id}"]`).parent().removeAttr("style");
        }
        else if (obj.$type.indexOf("EbUserControl") >= 0) {
            $(`[data-id="${id}"]`).append(`<div id="${id}_UserCtrl" class="Db-user-ctrl"></div>`);
            let opts = {
                parentDiv: '#' + id + '_UserCtrl',
                refId: obj.RefId
            }
            new EbUserCtrlHelper(opts);
            $(`[data-id="${id}"]`).parent().css("background", "transparent");
            $(`[data-id="${id}"]`).parent().css("border", "0px solid");
            $(`[data-id="${id}"]`).parent().css("border", "0px solid");
            $(`#${id} .db-title`).css({ "font-size": "1.3em", "padding-bottom": "1.4em", "padding-left": "2px" });
            $(`#${id} .db-title`).parent().css("border","0px")
            $(`#${id} .i-opt-obj`).hide();
            $(`#${id} .i-opt-restart`).css({ "border": "solid 0px #dcdcdc" })
        }
        else if (obj.$type.indexOf("EbGoogleMap") >= 0) {
            $(`[data-id="${id}"]`).append(`<div id="canvasDivtb1${id}" class="CanvasDiv"></div>`);
            var o = {};
            o.tableId = "tb1" + id;
            o.dsobj = obj;
            o.Source = "Dashboard";
            o.filtervalues = this.filtervalues;
            o.googlekey = this.googlekey;
            var dt = new EbGoogleMap(o);
            $(`[data-id="${id}"]`).parent().removeAttr("style");
        }
    }

    this.drawCallBack = function (id) {
        $(`[data-id="${id}"]`).parent().removeAttr("style");
        let a = $(`#${id} .dataTables_scrollHeadInner`).height() - 5;
        $(`#${id} .dataTables_scrollBody`).css("max-height", `calc(100% - ${a}px)`);
    }.bind(this);

    this.GetFilterValues = function () {
        this.filtervalues = [];

        if (this.filterDialog)
            this.filtervalues = getValsForViz(this.filterDialog.FormObj);

        let temp = $.grep(this.filtervalues, function (obj) { return obj.Name === "eb_loc_id"; });
        if (temp.length === 0)
            this.filtervalues.push(new fltr_obj(11, "eb_loc_id", store.get("Eb_Loc-" + ebcontext.sid + ebcontext.user.UserId)));
        temp = $.grep(this.filtervalues, function (obj) { return obj.Name === "eb_currentuser_id"; });
        if (temp.length === 0)
            this.filtervalues.push(new fltr_obj(11, "eb_currentuser_id", ebcontext.user.UserId));
        if (this.filterDialogRefid !== "") {
            this.grid.removeAll();
            this.DrawTiles();
        }
        if (this.stickBtn) { this.stickBtn.minimise(); }
    };
    this.init();
}
