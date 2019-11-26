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

    this.GridStackInit = function () {
        this.objGrid1 = $('.grid-stack').gridstack({ resizable: { handles: 'e, se, s, sw, w' } });
        this.grid = $('.grid-stack').data("gridstack");
    }
    this.GridStackInit();
   
    this.DashboardDropdown = function () {
        let k = Object.keys(this.DashBoardList);
        let html = [`<div id="UserDashBoardSwitchList" class="DropMenuUserDash"  hide>`];
        ebcontext.header.setNameAsHtml(`<button class="DropDown4DB" id="UserDashBoardSwitchBtn"> ${this.EbObject.DisplayName} <span class="caret"></span> </button> `);
        for (let i = 1; i < k.length; i++) {
            html.push(`<div style="padding:3px;"> <button class="Btn4SwitchDB btn btn-default" type="button" value="${this.DashBoardList[k[i]].RefId}">${this.DashBoardList[k[i]].DisplayName} </button></div>`);
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
        $("#UserDashBoardSwitchList").css({ "top": ( offset.top + 18), "left": offset.left});
        $("#UserDashBoardSwitchList").toggle();
        
    }
    this.DashBoardSwitchMenuHide = function () {
       // $("#UserDashBoardSwitchList").hide();
        
    }

    this.DashBoardSwitch = function (e) {

        $('.Btn4SwitchDB').removeAttr("disabled");
        let refid = e.target.getAttribute("value");
        $(`[Value=${refid}]`).attr("disabled", true);
        //this.grid.removeAll();
        $(".grid-stack").empty();
        this.Version = this.DashBoardList[refid].VersionNumber;
        this.EbObject = this.DashBoardList[refid];
        this.Statu = this.DashBoardList[refid].Status;
        this.TileCollection = {};
        this.CurrentTile;

        this.init();

    }

    this.init = function () {
        $(".grid-stack").removeAttr("style");
        
        //ebcontext.header.setName("EFGFh")
        if (this.DashBoardList) {
           
            this.DashboardDropdown();
        }
        else {
            ebcontext.header.setName(this.EbObject.DisplayName);
        }
        $(`[Value=${this.EbObject.RefId}]`).attr("disabled", true);
        $("title").empty().append(this.EbObject.DisplayName);
   
        this.DrawTiles();

       
       
        //this.propGrid = new Eb_PropertyGrid({
        //    id: "propGridView",
        //    wc: this.Wc,
        //    cid: this.Cid,
        //    $extCont: $("#ppt-dash-view"),
        //    isDraggable: true
        //});
        //this.propGrid.setObject(this.EbObject, AllMetas["EbDashBoard"]);
        //this.propGrid.PropertyChanged = this.popChanged.bind(this);
         //this.propGrid.ClosePG();
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
                if (ebcontext.user.Roles.indexOf("SolutionOwner") !== -1)
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
                    //$(".grid-stack").append(`<div class="grid-stack-item " data-gs-x=${x} data-gs-y=${y} data-gs-width=${dw} data-gs-height=${dh} id=${tile_id}>
                    //<div class="grid-stack-item-content" id=${t_id}>
                    //<div style="display:flex" id="">
                    //<div class="db-title" name-id="${t_id}" style="display:float"></div>
                    //<div style="float:right;display:flex" u-id="${t_id}"><i class="fa fa-external-link tile-opt i-opt-obj" aria-hidden="true" link="ext-link"></i>
                    //</div></div>
                    //<div data-id="${t_id}" class="db-tbl-wraper"></div>
                    //</div></div>`);
                    //this.CurrentTile = t_id;
                    //this.TileCollection[t_id] = this.EbObject.Tiles.$values[i];
                    //let refid = this.EbObject.Tiles.$values[i].RefId;
                    //if (refid !== "") {
                    //    $.ajax(
                    //        {
                    //            url: '../DashBoard/DashBoardGetObj',
                    //            type: 'POST',
                    //            data: { refid: refid },
                    //            success: this.TileRefidChangesuccess.bind(this, this.CurrentTile)
                    //        });
                    //}
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

    //this.FullScreenViewTrigger = function (name, selector, event) {
    //    let id = selector.$trigger[0].getAttribute("id");
    //    let TileRefid = this.TileCollection[id].TileRefId;
    //    window.open(location.origin + "/DV/dv?refid=" + TileRefid, '_blank');
    //}

    this.TileRefidChangesuccess = function (id, data) {
        this.GetFilterValues();
        let obj = JSON.parse(data);
        $(`[name-id="${id}"]`).empty().append(obj.DisplayName);
        this.TileCollection[id].TileObject = obj;
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
            //$(`[data-id="${id}"]`).parent().removeAttr("style");
            //let a = $(`#${id} .dataTables_scrollHeadInner`).height() - 3;
            //$(`#${id} .dataTables_scrollBody`).css("height", `calc(100% - ${a}px)`);
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
            $(`[data-id="${id}"]`).append(`<div id="${id}_UserCtrl"></div>`);
            let opts = {
                parentDiv: '#' + id + '_UserCtrl',
                refId: obj.RefId
            }
            new EbUserCtrlHelper(opts);
            $(`[data-id="${id}"]`).parent().css("background", "transparent");
            $(`[data-id="${id}"]`).parent().css("border", "0px solid");
            $(`[name-id="${id}"]`).empty();
            $("#tile5 .i-opt-obj").hide();
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
        this.filtervalues.push(new fltr_obj(11, "eb_loc_id", store.get("Eb_Loc-" + ebcontext.sid + ebcontext.user.UserId)));
        this.filtervalues.push(new fltr_obj(11, "eb_currentuser_id", ebcontext.user.UserId));
    };

    //this.popChanged = function (obj, pname, newval, oldval) {
    //    if (pname === "TileCount") {
    //        //   $(".grid-stack").append(`<div class="grid-stack-item ui-draggable ui-resizable" data-gs-x="0" data-gs-y="0" data-gs-width="5" data-gs-height="4">
    //        //            <div class="grid-stack-item-content panel panel-primary ui-draggable-handle" id="tile1">
    //        //            </div>uj
    //        //        <div class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se" style="z-index: 90; display: block;"></div></div>`)
    //    }
    //    if (pname == "TileRefId") {
    //        $(`[name-id="${this.CurrentTile}"]`).empty();
    //        $(`[data-id="${this.CurrentTile}"]`).empty();
    //        $(`.eb-loader-prcbar`).remove();
    //        this.VisRefid = newval;
    //        $.ajax(
    //            {
    //                url: '../DashBoard/DashBoardGetObj',
    //                type: 'POST',
    //                data: { refid: this.VisRefid },
    //                success: this.TileRefidChangesuccess.bind(this, this.CurrentTile)
    //            });
    //    }
    //    if (pname === "BackgroundColor") {
    //        $("#dashbord-user-view").css("background-color", "").css("background-color", newval);
    //    }
    //}


    this.init();
}
