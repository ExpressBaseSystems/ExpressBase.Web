
this.TreeView_plugin = function (options) {
    let defaults = {
        checkItem: false,
        linkParent: false,
        //current_item: "-1",
        //elementAttrId: "selDefaultLoc", ////for setting any attribute value or show value of selected item
        //checkedItmId: finalLst, ////for 3 state check box- show checked items
        //callBackFn: this.treeViewCallBackFn ////function to execute in invoked page when item is selected
    };
    this.Data4SimTree = ebcontext.locations.loc_data;
    this.TreeRawData = ebcontext.locations.Locations;
    this.data = ebcontext.locations.data;
    this.CurrentItem = parseInt(options.current_item);

    this.Settings = $.extend({}, defaults, options);
    this.init = function () {
        this.item_parents = {};
        this.item_parent_id = {};
        this.item_count = this.TreeRawData.length;
        this.Tempdata = this.Data4SimTree;
        this.createModal();
        //do seperate initilisation
        this.CurrentItemObj = this.TreeRawData.filter(el => el.LocId === parseInt(this.CurrentItem))[0];
        this.findParent_loc();
       
        this.prevItem = this.CurrentItem;
        if (this.CurrentItemObj) {
            this.prev_item_name = this.CurrentItemObj.LongName || "";
            // $(`#${this.Settings.elementAttrId}`).val(this.CurrentItemObj.LongName);
        }
        this.drawLocsTree();
        this.setDefault();


        $("#treeView_OkBtn").off("click").on("click", this.selectItem.bind(this));
        $("#treeview_search").off("keyup").on("keyup", this.searchItems.bind(this));

        if (this.Settings.checkItem) {
            var cLen = options.checkedItmId.length;
            if (cLen > 0) {
                for (var i = 0; i < cLen; i++) {
                    var c = $('#treeviewMdlBody').find('[data-id=' + options.checkedItmId[i] + ']')
                    c.find('.sim-tree-checkbox').eq(0).trigger('click');

                    var y = c.parents('ul');
                    if (y.length) {
                        y.each(function () {
                            let k = $(this).closest("li");
                            if (k.length) {
                                var m = k.find('.sim-tree-spread:first');
                                if (m.hasClass('sim-icon-r'))
                               m.trigger('click');
                            }
                        });
                      
                    }
                }
            }
        }
        else {
            $("#treeviewMdlBody").off("dblclick").on("dblclick", "li a", this.confirmItemFn.bind(this));
            $("body").off("keydown").on("keydown", this.Keypress_selectItem.bind(this));
        }

        $("#treeview_Itemcnt").text(this.item_count + " location");

    }

    this.createModal = function () {
        $("#treeviewMdl").remove();
        var mHtml = `
                <div class="modal fade" class="treeviewMdlCls" id="treeviewMdl" role="dialog">
                    <div class="modal-dialog">

                     <div class="modal-content treeviewMdlBox">
                            <div class="modal-header treeviewMdlHder">
                                <button type="button" class="close treeviewMdlClose" data-dismiss="modal">&times;</button>
                                    <div class="treeview_search_div col-md-5 col-lg-5">
                                        <input type="text" class="form-control treeview_search" id="treeview_search" placeholder="Search." />
                                    </div>
                                <h4 class="modal-title treeviewMdltitle">Select Location</h4>

                                    <div class="treeview_crntItemWrp ">
                                        <span><i class="fa fa-check-circle-o "></i></span>  <span id="treeview_crntItem" loc_id="" style="font-size: 12px; cursor:pointer"> </span>
                                    </div>
                            </div>
                            <div class="modal-body treeviewMdlBody" id="treeviewMdlBody" style="max-height: 50vh;min-height: 50vh;overflow-y: auto;">
                            </div>
                            <div class="modal-footer" id="treeviewMdlftr">
                                 <span id="treeview_Itemcnt" class=" treeview_Itemcnt pull-left"></span>
                                    <button class="ebbtn eb_btnblue eb_btn-sm treeView_OkBtn pull-right" id="treeView_OkBtn">Select</button>
                            </div>
                        </div>

                    </div>
                </div>`;
        $('body').append(mHtml);
        if (this.item_count > 20) {
            $(".treeviewMdlBody").css('min-height', '70vh');
        }
        if (this.Settings.checkItem) {
            $('#treeview_search').css('display', 'none');
        }
    }
    this.ClickLocation = function (items) {
        if (!this.Settings.checkItem) {
            if (items.length > 0) {
                $(".treeviewMdlBox .treeviewMdlBody li").removeClass("active-loc");
                $(".treeviewMdlBox .treeviewMdlBody li[data-id=" + items[0].id + "]").addClass("active-loc").parents("ul").addClass("show");
                if (this.PrevLocation != items[0].id) {
                    $("#treeView_OkBtn").prop("disabled", false);
                }
                else {
                    $("#treeView_OkBtn").prop("disabled", true);
                }
                this.CurrentItem = items[0].id;
                this.CurrentItemObj = this.TreeRawData.filter(el => el.LocId === parseInt(this.CurrentItem))[0];
            }
            else {
                if ($("#treeviewMdl").is(":visible")) {
                    if ($('#treeview_search').val() !== "") {
                        this.setParentPath($('#treeview_search').val());
                    }
                }
            }
        }
        else {
            if (items.length > 0) {
                $(".treeviewMdlBox .treeviewMdlBody li").removeClass("active-item");
                this.Settings.checkedItmId = items.map(a => a.id);
                for (var i = 0; i < items.length; i++) {
                    $(".treeviewMdlBox .treeviewMdlBody li[data-id=" + items[i].id + "]").addClass("active-loc")
                }
            }
            else {
                if ($("#treeviewMdl").is(":visible")) {
                    this.setParentPath($('#treeview_search').val());
                }
                $('#treeview_crntItem').text(`${items.length} locations selected `);

            }
        }

    };

    this.drawLocsTree = function () {
        if (this.Tempdata.length > 0) {
            this.TreeApi = simTree({
                el: $("#treeviewMdlBody"),
                data: this.Tempdata,
                check: this.Settings.checkItem,
                linkParent: this.Settings.linkParent,
                onClick: this.ClickLocation.bind(this),
                //onChange: this.ChangeLocationSelector.bind(this)
            });
            if (this.Settings.checkItem) {
                this.showContextMenu();
            }
        }
        //else {
        //    $(EmptyLocs).show();
        //    $("#loc_tot_count").text("0 of " + this.loc_count + " location");
        //}
    };

    this.setParentPath = function (val) {
        let temoloc = this.TreeRawData.filter(qq => qq.LongName.toLowerCase().indexOf(val) >= 0 || qq.ShortName.toLowerCase().indexOf(val) >= 0);
        if (temoloc.length <= 100) {
            for (i = 0; i < temoloc.length; i++) {
                p = this.getParentPath(temoloc[i].LocId);
                let k = $(".treeviewMdlBox .treeviewMdlBody li[data-id=" + temoloc[i].LocId + "]").find('a')[0];
                $(k).prepend(`<span><span class="parent_path">${p}</span></span>`);
            }
        }
        $("#treeview_Itemcnt").text(temoloc.length + " of " + this.item_count + " location");
    };

    this.selectItem = function (e) {
        if (!this.Settings.checkItem) {
            if (this.prevItem !== this.CurrentItem) {
                this.prevItem = this.CurrentItem;
                this.prev_item_name = this.CurrentItemObj.LongName;
                $(`#${this.Settings.elementAttrId}`).attr("loc_itemId", this.CurrentItem);
                $(`#${this.Settings.elementAttrId}`).val(this.CurrentItemObj.LongName);
            }
        }
       
        else {
            var locLength = this.Settings.checkedItmId.length;
            if (locLength > 0) {
                let o = getObjByval(ebcontext.locations.Locations, 'LocId', this.Settings.checkedItmId[0]);
                var k = (o.LongName === o.ShortName) ? o.LongName : `${o.LongName}(${o.ShortName})`;
                if (locLength === 1) {
                    $(`#${this.Settings.elementAttrId}`).val(k);
                } else {
                    $(`#${this.Settings.elementAttrId}`).val(`${k} and ${locLength - 1} other locations `);
                }
            }   
            this.Settings.callBackFn();
        }
        $('#treeviewMdl').modal('toggle');
    };
   
    this.searchItems = function (e) {
        let val = $(e.target).val().toLowerCase();
        $(".treeviewMdlBody").empty();
        this.Tempdata = JSON.parse(JSON.stringify(this.data.filter(qq => qq.name.toLowerCase().indexOf(val) >= 0)));
        this.Tempdata.sort(function (a, b) {
            var textA = a.name.toUpperCase().trim();
            var textB = b.name.toUpperCase().trim();
            return textA.localeCompare(textB);
        });
        if ($("#treeview_search").val() == "") {
            $("#treeview_Itemcnt").text(this.item_count + " location");
        }
        this.drawLocsTree();
        this.setDefault();
    };

    this.setDefault = function () {
        if (!this.Settings.checkItem) {
            if (this.CurrentItem > 0) {
                let s = this.getParentPath(this.CurrentItem);
                $('#treeview_crntItem').text(s);
                $(".treeviewMdlBox").find(`li[data-id='${this.CurrentItem}'] a`).eq(0).trigger("click");
            }
        }
        else {
            $('#treeview_crntItem').text(`${this.Settings.checkedItmId.length} locations selected `);
        }

    };

    this.getParentPath = function (k) {
        if (this.item_parents.hasOwnProperty(k)) {
            let m = "";
            for (let i = 0; i < this.item_parents[k].length; i++) {
                m += this.item_parents[k][i];
                if (i < this.item_parents[k].length - 1) { m += " > "; }
                else if (i == this.item_parents[k].length - 1) {
                    let idx = this.TreeRawData.findIndex(x => x.LocId === k);
                    m += " (" + this.TreeRawData[idx].ShortName + ")";
                }
            }
            return m;
        }
        return;
    }
    this.findParent_loc = function () {
        for (let i = 0; i < this.TreeRawData.length; i++) {
            let t = [];
            let x = [];
            let l = this.TreeRawData[i].LocId;
            let p = this.TreeRawData[i].ParentId;
            let n = this.TreeRawData[i].LongName;
            t.push(n);
            x.push(l);
            while (p > 0) {
                idx = this.TreeRawData.findIndex(x => x.LocId === p);
                if (idx > 0) {
                    l = this.TreeRawData[idx].LocId;
                    p = this.TreeRawData[idx].ParentId;
                    n = this.TreeRawData[idx].LongName;
                    t.push(n);
                    x.push(l);
                }
                else {
                    break;
                }

            }
            t.reverse();
            x.reverse();
            this.item_parents[this.TreeRawData[i].LocId] = t;
            this.item_parent_id[this.TreeRawData[i].LocId] = x;

        }
    };

    this.confirmItemFn = function () {
        if (this.prevItem !== this.CurrentItem) {
            $("#confirmItem").remove();
            let shtml = (this.prev_item_name) ? `Change location from <strong> ${this.prev_item_name} </strong> to <strong> ${this.CurrentItemObj.LongName}</strong>.` : `Change location to <strong> ${this.CurrentItemObj.LongName}</strong>.`
            let m = `<div class="modal fade" id="confirmItem"  style="position: absolute;top: 58%;left: 50%;transform: translate(-50%, -50%);display: block;padding-right: 16px;" role="dialog">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-body" style="display: flex;justify-content: center;">
          <span id="confirmItemspan" style=" text-align:center; font-size:16px;">${shtml}</span>
        </div>
        <div class="modal-footer">
          <button type="button" id="item_cancel" style="background:red;color:white;" class="btn btn-default pull-left" data-dismiss="modal">Cancel</button>
          <button type="button" id="item_confirm" style="background:green;color:white;" class="btn btn-default pull-right" data-dismiss="modal">Confirm</button>
        </div>
      </div>
      
    </div>
  </div>`
            $('body').append(m);


            $('#confirmItem').modal('show');
            $("#item_confirm").off("click").on("click", this.confirm_ItemSwitch.bind(this));
        }
        else if (this.prevItem == this.CurrentItem) {
            this.confirm_ItemSwitch();
        }

    }.bind(this);

    this.confirm_ItemSwitch = function () {
        this.selectItem();
    }.bind(this);

    this.Keypress_selectItem = function (e) {
        if ($('#treeviewMdl').is(":visible")) {
            var keycode = (e.keyCode ? e.keyCode : e.which);
            if (keycode >= '37' && keycode <= '40') {
                e.preventDefault();
                e.stopPropagation();
            }
            if (keycode == '13') {
                if ($("#confirmItem").is(":visible")) {
                    this.confirm_ItemSwitch();
                    $('#confirmItem').modal('hide');
                }
                else {
                    this.confirmItemFn();
                }

            }
            else if (keycode == '27') {
                if ($("#confirmItem").is(":visible")) {
                    $('#confirmItem').modal('hide');
                }
                else {
                    $(LocModId).hide();
                    //$(".loc_switchModal_fade").hide();
                    $('#treeviewMdl').modal('toggle');
                }

            }
            else if (keycode == '8') {
                var y = $(".treeviewMdlBox .treeviewMdlBody [data-id='" + this.CurrentItem + "'] ");
                if (y.closest("ul.show").length) {
                    y = y.closest("ul.show");
                    let k = y.closest("li");
                    k.find("a:first").trigger('click');
                    k.find('.sim-tree-spread:first').trigger('click');
                }
            }
            else if (keycode == '37') {
                var y = $(".treeviewMdlBox .treeviewMdlBody [data-id='" + this.CurrentItem + "'] ");
                if (y.find("ul.show").length) {
                    y = y.find("ul.show:first");
                    while (y.hasClass("show")) {
                        let k = y.closest("li");
                        k.find("a:first").trigger('click');
                        k.find('.sim-tree-spread:first').trigger('click');
                    }
                }
            }
            else if (keycode == '38') {
                let y = $(".treeviewMdlBox .treeviewMdlBody [data-id='" + this.CurrentItem + "'] ");

                if (y.prev().length) {
                    let z = y.prev();
                    if (z.children("ul.show").length) {
                        z = z.find('ul.show:first').find('li:last')
                    }
                    z = z.find('a:first');
                    z.trigger('click');
                    z.focus();
                }
                else {
                    if (y.closest('ul.show').length) {
                        if (y.closest('ul.show').closest("li").length) {
                            y = y.closest('ul.show').closest("li");
                            y = y.find("a:first")
                            y.trigger('click');
                            y.focus();
                        }
                    }

                }
            }
            else if (keycode == '39') {
                let y = $(".treeviewMdlBox .treeviewMdlBody [data-id='" + this.CurrentItem + "'] ");

                if (y.children("ul:first").length) {
                    if (!y.children("ul:first").hasClass("show")) {
                        y.find('.sim-tree-spread:first').trigger('click');

                    }
                    else {
                        y = y.find("ul:first").find("li:first")
                        y = y.find("a:first")
                        y.trigger('click');
                        y.focus();
                    }
                }
            }
            else if (keycode == '40') {
                let y = $(".treeviewMdlBox .treeviewMdlBody [data-id='" + this.CurrentItem + "'] ");
                if (y.children("ul:first").hasClass("show")) {
                    y = y.find("ul:first").find("li:first")
                }
                else
                    if (y.next('li').length) {
                        y = y.next('li');
                    }
                    else {
                        let c = 0;
                        while ((c == 0) && (y.closest('ul.show').parent("li").length == 1)) {
                            if (y.closest('ul.show').parent("li").next("li").length) {
                                y = y.closest('ul.show').parent("li").next("li");
                                c = 1;
                            }
                            else {
                                y = y.closest('ul.show').parent("li");
                            }

                        }
                    }
                y = y.find("a:first")
                y.trigger('click');
                y.focus();

            }



        }

    }
    this.showContextMenu = function () {
        this.TreeApi.data.map(el => (el.children) ? $(`#treeviewMdlBody [data-id='${el.id}']`).addClass("parentNode") : $(`[data-id='${el.id}']`).addClass("childNode"));
        $.contextMenu({
            selector: ".parentNode",
            events: {
                show: function (options) {
                    if ($(event.target).closest("li").hasClass("childNode"))
                        return false;
                }
            },
            items: {
                "SelectAll": { name: "Select All", icon: "fa-check-square-o", callback: this.SelectAll.bind(this) },
                "DeSelectAll": { name: "DeSelect All", icon: "fa-square-o", callback: this.DeSelectAll.bind(this) }
            }
        });
    }


    this.SelectAll = function (key, opt, event) {
        opt.$trigger.find(".sim-tree-checkbox").toArray()
            .map(el => $(el).hasClass("checked") ? console.log("checked") : $(el).trigger("click"));
    };

    this.DeSelectAll = function (key, opt, event) {
        opt.$trigger.find(".sim-tree-checkbox").toArray()
            .map(el => $(el).hasClass("checked") ? $(el).trigger("click") : console.log("Unchecked"));
    };

    this.toggleModal = function () {
        $('#treeviewMdl').modal('toggle');
    }
    this.init();
}