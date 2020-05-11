
function EB_MobilePage(option) {
    this.Config = $.extend({}, option);
    this.validate = function () {
        return true;
    };

    if (this.validate()) {
        if (window.MobilePage === null || window.MobilePage === undefined)
            window.MobilePage = {};
        window.MobilePage["Tab" + this.Config.TabNum] = {};
        window.MobilePage["Tab" + this.Config.TabNum].Constants = {};
        window.MobilePage["Tab" + this.Config.TabNum].Creator = new EbMobStudio(this.Config);
        return window.MobilePage["Tab" + this.Config.TabNum].Creator;
    }
    else {
        console.log("initialization error");
        return null;
    }
}

function EbMobStudio(config) {
    this.Conf = config;
    this.EditObj = $.isEmptyObject(this.Conf.DsObj) ? null : this.Conf.DsObj;
    this.EbObject = null;
    this.Procs = {};
    this.droparea = `#eb_mobpage_pane${this.Conf.TabNum}`;
    this.Controls = {};
    this.Menu = {};
    this.Mode = this.EditObj === null ? "new" : "edit";
    this.ContainerType = null;

    this.GenerateButtons = function () { };

    this.pg = new Eb_PropertyGrid({
        id: "eb_mobpage_properties" + this.Conf.TabNum,
        wc: this.Conf.Wc,
        cid: this.Conf.TenantId,
        $extCont: $("#eb_mobpage_property_wrapr" + this.Conf.TabNum)
    });

    this.refreshControl = function (obj) {
        var NewHtml = obj.$Control.outerHTML();
        var metas = AllMetas[$("#" + obj.EbSid).attr("eb-type")];
        $.each(metas, function (i, meta) {
            var name = meta.name;
            if (meta.IsUIproperty) {
                NewHtml = NewHtml.replace('@' + name + ' ', obj[name]);
            }
        });
        $("#" + obj.EbSid).replaceWith(NewHtml);
        $("#" + obj.EbSid).off("focus").on("focus", this.elementOnFocus.bind(this));
        $("#" + obj.EbSid).off("click").on("click", function (evt) { evt.stopPropagation(); });
    };

    this.elementOnFocus = function (event) {
        event.stopPropagation();
        var curControl = $(event.target);//.closest(".eb_stacklayout")
        var curObject = this.Procs[curControl.attr("id")];
        var type = curControl.attr('eb-type');
        this.pg.setObject(curObject, AllMetas[type]);
        this.pg.__extension.hideBlackListed(curObject);
    };

    this.newMobPage = function () {
        let name = "tab_" + this.Conf.TabNum + "MobilePage" + Date.now();
        this.EbObject = new EbObjects["EbMobilePage"](name);
        this.pg.setObject(this.EbObject, AllMetas["EbMobilePage"]);
    };

    this.getType = function (assembly) {
        return assembly.split(",")[0].split(".")[2];
    };

    this.editMobPage = function () {
        this.EbObject = new EbObjects["EbMobilePage"](this.EditObj.Name);
        {
            var _o = $.extend(true, {}, this.EditObj);
            $.extend(this.EbObject, _o);
        }
        this.pg.setObject(this.EbObject, AllMetas["EbMobilePage"]);
        this.EbObject.Container = null;
        this.setContainerOnEdit();
    };

    this.setContainerOnEdit = function () {
        let ebtype = this.getType(this.EditObj.Container.$type);
        this.ContainerType = ebtype;
        let id = "Tab" + this.Conf.TabNum + "_" + ebtype + CtrlCounters[ebtype.replace("Eb", "") + "Counter"]++;
        let o = new EbObjects[ebtype](id);
        $.extend(o, this.EditObj.Container);
        this.Procs[id] = o;
        expand(o);
        $(this.droparea).append(o.$Control.outerHTML());

        switch (ebtype) {
            case "EbMobileForm":
                this.Controls.initForm(o);
                break;
            case "EbMobileVisualization":
                this.Controls.initVisualization(o);
                break;
            case "EbMobileDashBoard":
                this.Controls.initDashBoard(o);
                break;
            default:
                console.error("undefined container");
        }
        $(`#${o.EbSid}`).on("click", this.ContainerOnClick.bind(this));
        this.EditObj = null;
    };

    this.setCtrls = function ($container, controllCollection) {
        for (let i = 0; i < controllCollection.length; i++) {
            let edit_obj = controllCollection[i];
            let ebtype = this.getType(edit_obj.$type);
            let o = this.makeElement(ebtype, ebtype);
            $.extend(o, edit_obj);
            $container.append(o.$Control.outerHTML());
            this.refreshControl(o);
            let tobj = o.trigger(this);
            if (ebtype === "EbMobileDataGrid") {
                tobj.fillControls(tobj.CellCollection.$values, this);//fill table cells
                this.setCtrls($(`#${o.EbSid} .ctrl_as_container .control_container`), o.ChildControls.$values);
            }
        }
    };

    this.makeDragable = function () {
        $(".draggable,.container_draggable,.draggable_dashctrl").draggable({
            cancel: "a.ui-icon",
            revert: "invalid",
            helper: "clone",
            cursor: "move",
            appendTo: "body",
            drag: function (event, ui) {
                $(ui.helper).css({
                    "background": "white",
                    "border": "1px dotted black",
                    "width": "auto",
                    "padding": "15px",
                    "border-radius": "4"
                });
            }
        });
    };

    this.makeDropable = function (ebsid, ebtype) {
        $(`#${ebsid} .eb_mob_container_inner,#${ebsid} .ctrl_as_container .control_container`).droppable({
            accept: this.getDropAcceptClass(ebtype),
            hoverClass: "drop-hover-layout",
            tolerance: "fit",
            greedy: true,
            drop: this.onDropFn.bind(this)
        });
    };

    this.getDropAcceptClass = function (ebtype) {
        if (ebtype === "EbMobileForm")
            return ".draggable";
        else if (ebtype === "EbMobileDashBoard")
            return ".draggable_dashctrl";
        else
            return ".draggable";
    };

    this.ContainerOnClick = function (evt) {
        let div = $(evt.target).closest(".mob_container");
        let type = div.attr("eb-type");
        this.pg.setObject(this.Procs[div.attr("id")], AllMetas[type]);
    };

    this.makeSortable = function (ebsid) {
        $(`#${ebsid} .eb_mob_container_inner, #${ebsid} .ctrl_as_container .control_container`).sortable({
            axis: "y",
            appendTo: document.body
        });
    };

    this.onDropFn = function (event, ui) {
        let dragged = $(ui.draggable);
        let ebtype = dragged.attr("eb-type");
        let ctrlname = dragged.attr("ctrname");
        let o = this.makeElement(ebtype, ctrlname);
        $(event.target).append(o.$Control.outerHTML());
        this.refreshControl(o);
        o.trigger(this);

        //set tree col if form
        if (this.ContainerType === "EbMobileForm")
            this.Controls.refreshColumnTree();

        return o;
    };

    this.containerOnDrop = function (event, ui) {
        let dropLoc = $(event.target);
        let draged = $(ui.draggable);

        if (dropLoc.find(".mob_container").length <= 0) {
            let ebtype = draged.attr("eb-type");
            let ctrlname = draged.attr("ctrname");
            this.ContainerType = ebtype;
            let o = this.makeElement(ebtype, ctrlname);
            dropLoc.append(o.$Control.outerHTML());
            expand(o);
            switch (ebtype) {
                case "EbMobileForm":
                    this.Controls.initForm(o);
                    break;
                case "EbMobileVisualization":
                    this.Controls.initVisualization(o);
                    break;
                case "EbMobileDashBoard":
                    this.makeDropable(o.EbSid, ebtype);
                    break;
                default:
                    console.error("undefined container");
            }
            $(`#${o.EbSid}`).off("click").on("click", this.ContainerOnClick.bind(this));
        }
    };

    this.makeElement = function (ebtype, ctrlname) {
        let counter = CtrlCounters[ebtype.replace("Eb", "") + "Counter"]++;
        var id = "Tab" + this.Conf.TabNum + "_" + ctrlname + counter;
        this.Procs[id] = new EbObjects[ebtype](id);
        this.Procs[id].Label = ctrlname + counter;
        expand(this.Procs[id]);
        return this.Procs[id];
    };

    //save
    this.BeforeSave = function () {
        let container = $(this.droparea).find(".mob_container");
        if (this.isReadyToSave(container)) {
            let div = container[0];
            this.EbObject.Container = this.Procs[div.id];

            if ($(div).hasClass("eb_mob_form_container")) {
                this.EbObject.Container.ChildControls.$values.length = 0;
                $(div).find(".eb_mob_container_inner").children(".mob_control").each(function (i, o) {
                    this.findFormContainerItems(i, o, this.EbObject.Container.ChildControls);
                }.bind(this));
            }
            else if ($(div).hasClass("eb_mob_vis_container")) {
                this.findVisContainerItems($(div).find(".eb_mob_tablelayout")[0]);
            }
            else if ($(div).hasClass("eb_mob_dashboard_container")) {
                this.EbObject.Container.ChildControls.$values.length = 0;
                $(div).find(".mob_dash_control").each(this.findDashContainerItems.bind(this));
            }
            //set root object to objdash current object
            commonO.Current_obj = this.EbObject;
            return true;
        }
        else
            return false;
    };

    this.isReadyToSave = function ($container) {
        if ($container.length <= 0) {
            EbPopBox("show", { Message: "A page must have a container :(" });
            return false;
        }
        if (!this.EbObject.DisplayName) {
            EbPopBox("show", { Message: "DisplayName not specified :(" });
            return false;
        }
        return true;
    };

    //form save
    this.findFormContainerItems = function (i, o, ebContainer) {
        let jsobj = this.Procs[o.id];
        let ebtype = this.getType(jsobj.$type);
        if (ebtype === "EbMobileDataGrid")
            jsobj.setObject(this);
        ebContainer.$values.push(jsobj);
    };

    //dash save
    this.findDashContainerItems = function (i, o) {
        let jsobj = this.Procs[o.id];
        this.EbObject.Container.ChildControls.$values.push(jsobj);
    };

    //vis save
    this.findVisContainerItems = function (table) {
        let o = this.Procs[table.id];
        o.setObject();
        this.EbObject.Container.DataLayout = o;

        this.EbObject.Container.FilterControls.$values.length = 0;
        $(`#${o.EbSid}`).closest(".mob_container").find(".vis-filter-container .mob_control").each(function (j, obj) {
            this.findFormContainerItems(j, obj, this.EbObject.Container.FilterControls);
        }.bind(this));

        this.EbObject.Container.SortColumns.$values.length = 0;
        $(`#${o.EbSid}`).closest(".mob_container").find(".vis-sort-container .data_column").each(function (j, obj) {
            let data_col = this.Procs[obj.id];
            this.EbObject.Container.SortColumns.$values.push(data_col);
        }.bind(this));
    };

    this.getColums4ListView = function (obj) {
        this.dataSourceColumn(obj.DataSourceRefId, function (vis, result) {
            vis.DataSourceParams.$values = result.paramsList || [];
            this.Controls.drawDsColTree(result.columns);
            $(".branch").click();
            if (!$(`#eb_mobtree_body_${this.Conf.TabNum}`).is(":visible"))
                $(`#eb_mobtree_body_${this.Conf.TabNum}`).animate({ width: ["toggle", "swing"] });
        }.bind(this, obj));
    };

    this.dataSourceColumn = function (ds_refid, callback) {
        if (!callback)
            console.error("dataSourceColumn must have callback function");

        if (ds_refid) {
            $.ajax({
                url: "../RB/GetColumns",
                type: "POST",
                cache: false,
                data: { refID: ds_refid },
                beforeSend: function () { $("#eb_common_loader").EbLoader("show"); },
                success: function (result) {
                    $("#eb_common_loader").EbLoader("hide");
                    callback(result);
                }.bind(this),
                error: function () {
                    $("#eb_common_loader").EbLoader("hide");
                }
            });
        }
    };

    //pg onchange
    this.pg.PropertyChanged = function (obj, pname) {
        if (pname === "Label" && obj.constructor.name !== "EbMobileDataGrid") {
            this.refreshControl(obj);
        }
        else if (pname === "Label" && obj.constructor.name === "EbMobileDataGrid") {
            $(`#${obj.EbSid}`).children(".ctrl_label").text(obj.Label);
        }
        else if (obj.constructor.name === "EbMobileSimpleSelect" && pname === "DataSourceRefId") {
            obj.getColumns(obj.DataSourceRefId, this);
        }
        else if (obj.constructor.name === "EbMobileVisualization" && pname === "DataSourceRefId") {
            this.getColums4ListView(obj);
        }
        else if (obj.constructor.name === "EbMobileGeoLocation" && pname === "HideSearchBox") {
            obj._toggleSearchBar();
        }
        else if (pname === "DisplayName" && obj.constructor.name === "EbMobilePage") {
            this.setEmulatorTitle(obj[pname]);
        }
        else {
            console.log("pg changed");
        }

        if ("propertyChanged" in obj)
            obj.propertyChanged(pname);

        //set tree col if form
        if (this.ContainerType === "EbMobileForm" && (pname === "Name" || pname === "TableName"))
            this.Controls.refreshColumnTree();
    }.bind(this);

    this.labelOnDoubleClick = function (e) {
        let label = $(e.target).closest(".ctrl_label");
        label.prop("contenteditable", true);
        label.addClass("content-editable");
        label.focus();
        label.off("focusout").on("focusout", function (e) {
            let o = this.Procs[label.closest(".eb_stacklayout").attr("id")];
            o.Label = label.text().trim();
            label.removeClass("content-editable");
            this.pg.refresh();
        }.bind(this));
    };

    this.refreshEmulator = function () {
        let h = $(`#eb_mobpage_toolbox${this.Conf.TabNum}`).height();
        $(`#eb_mobpage_wraper${this.Conf.TabNum} .eb_mobpage_pane_layout`).height(h - 10);
        $(`#eb_mobpage_wraper${this.Conf.TabNum} .eb_mobtree_body`).height(h);
    };

    this.setEmulatorTitle = function (value) {
        $("#eb_emulater_title" + this.Conf.TabNum).text(value);
    };

    this.exe = function () {
        this.Controls = new MobileControls(this);
        if (this.EditObj === null || this.EditObj === undefined)
            this.newMobPage();
        else
            this.editMobPage();

        this.makeDragable();

        $(this.droparea).droppable({
            accept: ".container_draggable",
            hoverClass: "drop-hover",
            drop: this.containerOnDrop.bind(this)
        });
        this.Menu = new MobileMenu(this);
        $("body").on("dblclick", ".ctrl_label", this.labelOnDoubleClick.bind(this));
        this.refreshEmulator();
        this.setEmulatorTitle(this.EbObject.DisplayName || "Untitled");
        $(window).resize(function () { this.refreshEmulator(); }.bind(this));
        this.pg.__extension = new PgHelperMobile(this.pg);
    };

    this.exe();
}
function MobileControls(root) {
    this.Root = root;
    this.FilterControls = [];//only for vis filter

    this.initForm = function (o) {
        this.Root.makeDropable(o.EbSid, "EbMobileForm");
        this.Root.makeSortable(o.EbSid);
        this.setColumnTree(o);

        if (this.Root.Mode === "edit" && this.Root.EditObj !== null) {
            this.Root.setCtrls($(`#${o.EbSid} .eb_mob_container_inner`), this.Root.EditObj.Container.ChildControls.$values);
            this.refreshColumnTree();
        }
    };

    this.initVisualization = function (o) {

        let tobj = this.Root.makeElement("EbMobileTableLayout", "TableLayout");
        $(`#${o.EbSid} .eb_mob_container_inner .vis-table-container`).append(tobj.$Control.outerHTML());
        if (this.Root.Mode === "edit") {
            $.extend(tobj, this.Root.EditObj.Container.DataLayout);
        }
        tobj.trigger(this.Root);
        this.makeFilterColsDropable(o);

        if (this.Root.Mode === "edit" && this.Root.EditObj !== null) {
            tobj.fillControls(this.Root.EditObj.Container.DataLayout.CellCollection.$values, this.Root);//fill table cells

            let filterControls = this.Root.EditObj.Container.FilterControls.$values;
            this.Root.setCtrls($(`#${o.EbSid} .eb_mob_container_inner .vis-filter-container`), filterControls);
            this.Root.getColums4ListView(o);
            this.setSortColumns(o);

            this.getLinkFormControls(o, function (json) {
                var controls = (json === null || json === undefined) ? [] : JSON.parse(json).$values;
                this.FilterControls = controls;//store controls in vis object
                if (controls.length > 0)
                    this.drawFormControls(controls);
            }.bind(this));
        }
    };

    this.initDashBoard = function (o) {
        this.Root.makeDropable(o.EbSid, "EbMobileDashBoard");
        if (this.Root.Mode === "edit" && this.Root.EditObj !== null) {
            this.Root.setCtrls($(`#${o.EbSid} .eb_mob_container_inner`), o.ChildControls.$values);//need to change
        }
    };

    this.makeFilterColsDropable = function (container) {
        $(`#${container.EbSid} .vis-filter-container`).droppable({
            accept: this.Root.getDropAcceptClass("EbMobileForm") + ",.filter_controls",
            hoverClass: "drop-hover-td",
            tolerance: "fit",
            greedy: true,
            drop: function (event, ui) {
                let o = this.Root.onDropFn(event, ui);
                if ($(ui.draggable).hasClass("filter_controls")) {
                    let name = $(ui.draggable).attr("name");
                    let ctrl = this.FilterControls.find(el => el.Name === name) || {};
                    $.extend(true, o, ctrl);
                    this.Root.refreshControl(o);
                }
            }.bind(this)
        });

        $(`#${container.EbSid} .vis-sort-container`).droppable({
            accept: ".draggable_column",
            hoverClass: "drop-hover-td",
            drop: function (event, ui) {
                let dragged = $(ui.draggable);
                let ctrlname = dragged.attr("ctrname");
                let obj = this.Root.makeElement("EbMobileDataColumn", ctrlname);
                obj.Type = dragged.attr("DbType");
                obj.ColumnName = dragged.attr("ColName");
                obj.ColumnIndex = dragged.attr("index");
                obj.TableIndex = dragged.attr("tableIndex");
                $(event.target).append(obj.$Control.outerHTML());
                obj.blackListProps = Array.from(["TextFormat","Font","Required"]);//for pghelper extension
                this.Root.refreshControl(obj);
            }.bind(this)
        });
    };

    this.getLinkFormControls = function (vis, callback) {
        if (vis.LinkRefId) {
            $.ajax({
                url: "../Dev/GetMobileFormControls",
                type: "GET",
                cache: false,
                data: { refid: vis.LinkRefId },
                beforeSend: function () { $("#eb_common_loader").EbLoader("show"); },
                success: function (result) {
                    $("#eb_common_loader").EbLoader("hide");
                    callback(result);
                }.bind(this),
                error: function () {
                    $("#eb_common_loader").EbLoader("hide");
                }
            });
        }
    };

    this.setSortColumns = function (vis) {
        let filters = vis.SortColumns.$values;
        for (let i = 0; i < filters.length; i++) {
            let obj = this.Root.makeElement("EbMobileDataColumn", "DataColumn");
            $.extend(obj, filters[i]);
            $(`#${vis.EbSid} .vis-sort-container`).append(obj.$Control.outerHTML());
            this.Root.refreshControl(obj);
            obj.blackListProps = Array.from(["TextFormat", "Font", "Required"]);//for pghelper extension
        }
    };

    this.drawFormControls = function (controls) {
        //sow tab
        $(`#eb_mobtree_body_${this.Root.Conf.TabNum} #form_controls_tab`).show();

        for (let i = 0; i < controls.length; i++) {

            let ebtype = this.Root.getType(controls[i].$type);

            $(`#form_controls_list${this.Root.Conf.TabNum}`).append(`
            <div class="filter_controls" eb-type="${ebtype}" ctrname="${ebtype.replace("EbMobile", "")}" name="${controls[i].Name}">
                <i class="fa ${controls[i].Icon}" style="margin-right:10px;"></i>
                ${controls[i].Name}
            </div>`);
        }

        //make filter controls draggable
        $(`.filter_controls`).draggable({
            cancel: "a.ui-icon",
            revert: "invalid",
            helper: "clone",
            cursor: "move",
            appendTo: "body",
            drag: function (event, ui) {
                $(ui.helper).css({ "background": "white", "border": "1px dotted black", "width": "auto", "padding": "5px", "border-radius": "4" });
            }
        });
    };

    this.drawDsColTree = function (colList) {
        $(`#ds_parameter_list${this.Root.Conf.TabNum}`).empty();
        var type = "EbMobileDataColumn";
        $.each(colList, function (i, columnCollection) {
            $(`#ds_parameter_list${this.Root.Conf.TabNum}`).append("<li><a>Table " + i + "</a><ul id='t" + i + "'></ul></li>");
            $.each(columnCollection, function (j, obj) {
                let icon = this.getIconByType(obj.type);
                let $div = $(`#ds_parameter_list${this.Root.Conf.TabNum} ul[id='t${i}']`);
                $div.append(`<li class='styl'>
                                <span eb-type='${type}'
                                    ctrname="DataColumn"
                                    tableIndex="${i}"
                                    index='${obj.columnIndex}'
                                    DbType='${obj.type}'
                                    ColName='${obj.columnName}'
                                    class='draggable_column'>
                                    <i class='fa ${icon} column_tree_typeicon'></i> ${obj.columnName}
                                </span>
                            </li>`);
            }.bind(this));
        }.bind(this));
        $(`#ds_parameter_list${this.Root.Conf.TabNum}`).killTree();
        $(`#ds_parameter_list${this.Root.Conf.TabNum}`).treed();
        this.makeTreeNodeDraggable();
    };

    this.makeTreeNodeDraggable = function () {
        $(`.draggable_column`).draggable({
            cancel: "a.ui-icon",
            revert: "invalid",
            helper: "clone",
            cursor: "move",
            appendTo: "body",
            drag: function (event, ui) {
                $(ui.helper).css({ "background": "white", "border": "1px dotted black", "width": "auto", "padding": "5px", "border-radius": "4" });
            }
        });
    };

    this.setColumnTree = function () {
        $(`#eb_mobtree_body_${this.Root.Conf.TabNum}`).animate({ width: ["toggle", "swing"] });
    };

    var tableCounter = 0;

    this.refreshColumnTree = function () {
        tableCounter = 0;
        let html = {};
        let container = $(this.Root.droparea).find(".mob_container");
        if (container.length <= 1 || container.length >= 0) {
            let divObj = this.Root.Procs[container[0].id];
            html[divObj.Name] = [];
            html[divObj.Name].push(`<li><a>${divObj.TableName || "Table " + tableCounter++}</a><ul>`);

            container.find(".eb_mob_container_inner").children(".mob_control").each(this.loopControlContainer.bind(this, html, divObj.Name));
            html[divObj.Name].push(`</ul></li>`);
        }

        let htmlString = "";
        for (var key in html) {
            if (html.hasOwnProperty(key)) {
                htmlString += html[key].join("");
            }
        }

        $(`#ds_parameter_list${this.Root.Conf.TabNum}`).empty().append(htmlString);
        $(`#ds_parameter_list${this.Root.Conf.TabNum}`).killTree();
        $(`#ds_parameter_list${this.Root.Conf.TabNum}`).treed();
        $(".branch").click();
        this.makeTreeNodeDraggable();
    };

    var nonPersistControls = ["EbMobileTableLayout", "EbMobileDataGrid", "EbMobileFileUpload"];

    this.loopControlContainer = function (html, propName, i, o) {
        let jsobj = this.Root.Procs[o.id];
        let ebtype = this.Root.getType(jsobj.$type);
        if (nonPersistControls.includes(ebtype)) {
            if (ebtype === "EbMobileDataGrid") {
                html[jsobj.Name] = [];
                html[jsobj.Name].push(`<li><a>${jsobj.TableName || "Table " + tableCounter++}</a><ul>`);
                $(`#${jsobj.EbSid} .ctrl_as_container .control_container`).find(".mob_control").each(this.loopControlContainer.bind(this, html, jsobj.Name));
                html[jsobj.Name].push(`</ul></li>`);
            }
        }
        else {
            html[propName].push(`<li class='styl'>
                                    <span eb-type='EbMobileDataColumn'
                                          ctrname="DataColumn"
                                          DbType='${jsobj.EbDbType}'
                                          ColName='${jsobj.Name}' 
                                          class='draggable_column'><i class='fa ${this.getIconByType(jsobj.EbDbType)} column_tree_typeicon'></i> ${jsobj.Name} 
                                    </span>
                                </li>`);
        }
    };

    this.getIconByType = function (type) {
        if (type === 16)
            return "fa-font";
        else if ([7, 8, 10, 11, 12, 21].includes(type))
            return "fa-sort-numeric-asc";
        else if (type === 30)
            return "fa-check";
        else if ([5, 6, 17, 26].includes(type))
            return "fa-calendar";
        else
            return "fa-question";
    };
}

function MobileMenu(option) {
    this.Root = option;

    this.contextMenudelete = function (eType, selector, action, originalEvent) {
        let id = selector.$trigger.attr("id");
        let o = this.Root.Procs[id];
        let eb_type = this.Root.getType(o.$type);

        delete this.Root.Procs[id];
        this.Root.pg.removeFromDD(id);

        if (eb_type === "mob_container") {
            this.Root.Procs = {};
            $(`#ds_parameter_list${this.Root.Conf.TabNum} ul[class='ds_cols']`).empty();
            $(`#eb_mobtree_body_${this.Root.Conf.TabNum}`).hide();
        }
        $(selector.$trigger).remove();
        if (this.Root.ContainerType === "EbMobileForm")
            this.Root.Controls.refreshColumnTree();
    };

    this.tableLayoutLinks = function (eType, selector, action, originalEvent) {
        let $table = selector.$trigger.closest(".eb_mob_tablelayout");
        let obj = this.Root.Procs[$table.attr("id")];
        if (eType === "add_row") {
            let colcount = $table.find("tr:first-child td").length;

            let html = ["<tr class='eb_tablelayout_tr'>"];
            for (let i = 0; i < colcount; i++) {
                html.push(`<td class="eb_tablelayout_td"></td>`);
            }
            html.push("</tr>");
            $table.find("tbody").append(html.join(""));
            obj.droppable();
        }
        else if (eType === "add_column") {
            $table.find("tr").each(function (i, o) {
                $(o).append(`<td class="eb_tablelayout_td"></td>`);
            });
            obj.droppable();
            obj.resizable();
        }
        else if (eType === "delete_row") {
            let $row = selector.$trigger.find(".eb_tablelayout_tr:last-child");
            let rowcount = $table.find(".eb_tablelayout_tr").length;
            if (rowcount > 2) {
                $row.remove();
            }
        }
        else if (eType === "delete_column") {
            let $cols = selector.$trigger.find(".eb_tablelayout_td:last-child");
            if ($cols.length > 1)
                $cols.remove();
        }
    };

    this.disableMenuItem = function (key, opt) {
        let flag = opt.$trigger.data('cutDisabled');
        let ebtype = opt.$trigger.attr("eb-type");

        if (key === "delete") {
            if (ebtype === "EbMobileTableLayout" && opt.$trigger.closest(".mob_container").hasClass("eb_mob_vis_container")) {
                flag = !opt.$trigger.data('cutDisabled');
            }
            else if (ebtype === "EbMobileTableLayout" && opt.$trigger.closest(".ctrl_as_container").length > 0) {
                flag = !opt.$trigger.data('cutDisabled');
            }
        }
        return flag;
    };

    this.options = {
        "delete": {
            name: "Delete",
            icon: "delete",
            callback: this.contextMenudelete.bind(this),
            disabled: this.disableMenuItem.bind(this)
        }
    };

    this.ContextLinks = {
        "TableLayout": {
            "add_row": { name: "Add Row", icon: "plus", callback: this.tableLayoutLinks.bind(this) },
            "add_column": { name: "Add Column", icon: "plus", callback: this.tableLayoutLinks.bind(this) },
            "delete_row": { name: "Delete Row", icon: "plus", callback: this.tableLayoutLinks.bind(this) },
            "delete_column": { name: "Delete Column", icon: "plus", callback: this.tableLayoutLinks.bind(this) }
        }
    };

    this.initContextMenu = function () {
        $.contextMenu({
            selector: '#eb_mobpage_pane' + this.Root.Conf.TabNum + ' .dropped',
            autoHide: true,
            build: function ($trigger, e) {
                return { items: this.getMenu($trigger, e) };
            }.bind(this)
        });
    };

    this.getMenu = function ($trigger, e) {
        let m = $.extend({}, this.options);
        let ebtype = $trigger.attr("eb-type");
        if (ebtype === "EbMobileTableLayout") {
            $.extend(m, this.ContextLinks["TableLayout"]);
        }
        return m;
    };

    this.initContextMenu();
}
(function (doc) {
    var d = doc || document;

    window.getCurrent = function () {
        var id = $("#versionTab .tab-pane.active").attr("id");
        let creator = window.MobilePage["Tab" + id.charAt(id.length - 1)].Creator;
        console.log("mode : " + creator.Mode);
        return creator.EbObject;
    };

    window.expand = function (o) {
        let constructor = o.constructor.name;
        let common = {
            tab: "",
            trigger: function (root) {
                this.tab = root.Conf.TabNum || "";
            },
            setObject: function () { return null; },
            propertyChanged: function (propname) { },
            blackListProps: []
        };

        $.extend(o, common, window.expandable[constructor] || {});
    };

    window.expandable = {
        "EbMobileSimpleSelect": {
            getColumns: function (ds_refid, root) {
                //root is the main object
                root.dataSourceColumn(ds_refid, function (data) {
                    let keys = Object.keys(data.columns).length;
                    let c = 1;
                    this.Columns.$values.length = 0;
                    this.Parameters.$values = data.paramsList;
                    $.each(data.columns, function (i, columnCollection) {
                        for (let i = 0; i < columnCollection.length; i++) {

                            let o = new EbObjects.EbMobileDataColumn(columnCollection[i].columnName);
                            o.ColumnIndex = columnCollection[i].columnIndex;
                            o.ColumnName = columnCollection[i].columnName;
                            o.Type = columnCollection[i].type;

                            this.Columns.$values.push(o);
                        }
                        if (c === keys) {
                            root.pg.refresh();
                        }
                        c++;
                    }.bind(this));
                }.bind(this));
            }
        },
        "EbMobileGeoLocation": {
            _toggleSearchBar: function () {
                if (this.HideSearchBox) {
                    $(`#${this.EbSid} .eb_mob_textbox`).hide();
                }
                else {
                    $(`#${this.EbSid} .eb_mob_textbox`).show();
                }
            }
        },
        "EbMobileTableLayout": {
            trigger: function (root) {
                this.tab = "Tab" + root.Conf.TabNum;
                $(`#${this.EbSid} .eb_mob_tablelayout_inner`).append(this.getHtml());
                this.droppable();
                this.resizable();
            },
            getHtml: function () {
                let html = [];
                html.push(`<table class='eb_tablelayout_table'>`);
                for (let i = 0; i < this.RowCount; i++) {
                    html.push(`<tr class='eb_tablelayout_tr'>`);
                    for (let k = 0; k < this.ColumCount; k++) {
                        html.push('<td class="eb_tablelayout_td"></td>');
                    }
                    html.push(`</tr>`);
                }
                html.push(`</table>`);
                return html.join("");
            },
            droppable: function () {
                $(`#${this.EbSid} .eb_tablelayout_td`).droppable({
                    accept: ".draggable_column",
                    hoverClass: "drop-hover-td",
                    drop: this.onDrop.bind(this)
                });
            },
            onDrop: function (event, ui) {
                let dragged = $(ui.draggable);
                let ebtype = dragged.attr("eb-type");
                let ctrlname = dragged.attr("ctrname");
                let o = window.MobilePage[this.tab].Creator.makeElement(ebtype, ctrlname);
                $(event.target).append(o.$Control.outerHTML());

                if (ebtype === "EbMobileDataColumn") {
                    o.Type = dragged.attr("DbType");
                    o.ColumnName = dragged.attr("ColName");
                    o.ColumnIndex = dragged.attr("index");
                    o.TableIndex = dragged.attr("tableIndex");
                }
                window.MobilePage[this.tab].Creator.refreshControl(o);
            },
            resizable: function () {
                $(`#${this.EbSid} .eb_tablelayout_tr:first-child .eb_tablelayout_td:not(:last-child)`).resizable({
                    handles: "e",
                    stop: function () { }.bind(this)
                });
            },
            fillControls: function (cells, root) {
                for (let i = 0; i < cells.length; i++) {
                    let ctrls = cells[i].ControlCollection.$values;

                    for (let k = 0; k < ctrls.length; k++) {
                        let ebtype = root.getType(ctrls[k].$type);
                        let o = root.makeElement(ebtype, ebtype);
                        $.extend(o, ctrls[k]);

                        $(`#${this.EbSid} tr:eq(${cells[i].RowIndex}) td:eq(${cells[i].ColIndex})`).append(o.$Control.outerHTML());
                        let $tr = $(`#${this.EbSid} tr:eq(${cells[i].RowIndex})`);
                        if ($tr.is(":first-child")) {
                            $(`#${this.EbSid} tr:eq(${cells[i].RowIndex}) td:eq(${cells[i].ColIndex})`).not(":last-child").css("width", `${cells[i].Width}%`);
                        }

                        root.refreshControl(o);
                        o.trigger(root);
                    }
                }
            },
            setObject: function () {
                this.CellCollection.$values.length = 0;
                this.RowCount = $(`#${this.EbSid} .eb_tablelayout_tr`).length;
                this.ColumCount = $(`#${this.EbSid} .eb_tablelayout_tr:first-child .eb_tablelayout_td`).length;

                $(`#${this.EbSid} .eb_tablelayout_td`).each(function (i, td) {
                    let rowindex = $(td).closest(".eb_tablelayout_tr").index();
                    let colindex = $(td).index();

                    let cell = new EbObjects.EbMobileTableCell(`TableCell_${rowindex}_${colindex}`);
                    cell.RowIndex = rowindex;
                    cell.ColIndex = colindex;
                    cell.Width = parseFloat($(td).width() / $(`#${this.EbSid}`).width() * 100);

                    $(td).find(".mob_control").each(function (i, ctrl) {
                        let ebo = window.MobilePage[this.tab].Creator.Procs[ctrl.id];
                        cell.ControlCollection.$values.push(ebo);
                    }.bind(this));

                    this.CellCollection.$values.push(cell);
                }.bind(this));
            }
        },
        "EbMobileDataGrid": {
            trigger: function (root) {
                root.makeDropable(this.EbSid, "EbMobileForm");
                root.makeSortable(this.EbSid);

                let tobj = root.makeElement("EbMobileTableLayout", "TableLayout");
                $(`#${this.EbSid} .ctrl_as_container .data_layout`).append(tobj.$Control.outerHTML());
                if (root.Mode === "edit") {
                    $.extend(tobj, this.DataLayout || {});
                }
                tobj.trigger(root);
                return tobj;
            },
            setObject: function (root) {
                this.ChildControls.$values.length = 0;
                let tableLayout = $(`#${this.EbSid} .data_layout div[eb-type="EbMobileTableLayout"]`)[0];
                let tobj = root.Procs[tableLayout.id];
                tobj.setObject();
                this.DataLayout = tobj;

                $(`#${this.EbSid} .control_container`).find(".mob_control").each(function (k, obj) {
                    root.findFormContainerItems(k, obj, this.ChildControls);
                }.bind(this));
            }
        },
        "EbMobileNumericBox": {
            trigger: function (root) {
                this.propertyChanged("RenderType");
            },
            propertyChanged: function (propname) {
                if (propname === "RenderType") {
                    if (this.RenderType === 1) {
                        $(`#${this.EbSid} .eb_mob_numericbox`).hide();
                        $(`#${this.EbSid} .eb_mob_numericbox-btntype`).show();
                    }
                    else {
                        $(`#${this.EbSid} .eb_mob_numericbox`).show();
                        $(`#${this.EbSid} .eb_mob_numericbox-btntype`).hide();
                    }
                }
            }
        }
    };
})(jQuery);

function PgHelperMobile(g) {

    this.grid = g;

    this.hideBlackListed = function (o) {
        let props = o.blackListProps;
        for (let i = 0; i < props.length; i++) {
            let el = this.grid.$PGcontainer.find(`tr[name="${props[i]}Tr"]`);

            if (el.prevAll(":visible:first").hasClass("pgGroupRow") && el.next(":visible:first").hasClass("pgGroupRow")) {
                el.prevAll(":visible:first").hide();
            }
            el.hide();
        }
    };
}

function EB_MobilePage(option) {
    this.Config = $.extend({}, option);
    this.validate = function () {
        return true;
    };

    if (this.validate()) {
        if (window.MobilePage === null || window.MobilePage === undefined)
            window.MobilePage = {};
        window.MobilePage["Tab" + this.Config.TabNum] = {};
        window.MobilePage["Tab" + this.Config.TabNum].Constants = {};
        window.MobilePage["Tab" + this.Config.TabNum].Creator = new EbMobStudio(this.Config);
        return window.MobilePage["Tab" + this.Config.TabNum].Creator;
    }
    else {
        console.log("initialization error");
        return null;
    }
}

function EbMobStudio(config) {
    this.Conf = config;
    this.EditObj = $.isEmptyObject(this.Conf.DsObj) ? null : this.Conf.DsObj;
    this.EbObject = null;
    this.Procs = {};
    this.droparea = `#eb_mobpage_pane${this.Conf.TabNum}`;
    this.Controls = {};
    this.Menu = {};
    this.Mode = this.EditObj === null ? "new" : "edit";
    this.ContainerType = null;

    this.GenerateButtons = function () { };

    this.pg = new Eb_PropertyGrid({
        id: "eb_mobpage_properties" + this.Conf.TabNum,
        wc: this.Conf.Wc,
        cid: this.Conf.TenantId,
        $extCont: $("#eb_mobpage_property_wrapr" + this.Conf.TabNum)
    });

    this.refreshControl = function (obj) {
        var NewHtml = obj.$Control.outerHTML();
        var metas = AllMetas[$("#" + obj.EbSid).attr("eb-type")];
        $.each(metas, function (i, meta) {
            var name = meta.name;
            if (meta.IsUIproperty) {
                NewHtml = NewHtml.replace('@' + name + ' ', obj[name]);
            }
        });
        $("#" + obj.EbSid).replaceWith(NewHtml);
        $("#" + obj.EbSid).off("focus").on("focus", this.elementOnFocus.bind(this));
        $("#" + obj.EbSid).off("click").on("click", function (evt) { evt.stopPropagation(); });
    };

    this.elementOnFocus = function (event) {
        event.stopPropagation();
        var curControl = $(event.target);//.closest(".eb_stacklayout")
        var curObject = this.Procs[curControl.attr("id")];
        var type = curControl.attr('eb-type');
        this.pg.setObject(curObject, AllMetas[type]);
        this.pg.__extension.hideBlackListed(curObject);
    };

    this.newMobPage = function () {
        let name = "tab_" + this.Conf.TabNum + "MobilePage" + Date.now();
        this.EbObject = new EbObjects["EbMobilePage"](name);
        this.pg.setObject(this.EbObject, AllMetas["EbMobilePage"]);
    };

    this.getType = function (assembly) {
        return assembly.split(",")[0].split(".")[2];
    };

    this.editMobPage = function () {
        this.EbObject = new EbObjects["EbMobilePage"](this.EditObj.Name);
        {
            var _o = $.extend(true, {}, this.EditObj);
            $.extend(this.EbObject, _o);
        }
        this.pg.setObject(this.EbObject, AllMetas["EbMobilePage"]);
        this.EbObject.Container = null;
        this.setContainerOnEdit();
    };

    this.setContainerOnEdit = function () {
        let ebtype = this.getType(this.EditObj.Container.$type);
        this.ContainerType = ebtype;
        let id = "Tab" + this.Conf.TabNum + "_" + ebtype + CtrlCounters[ebtype.replace("Eb", "") + "Counter"]++;
        let o = new EbObjects[ebtype](id);
        $.extend(o, this.EditObj.Container);
        this.Procs[id] = o;
        expand(o);
        $(this.droparea).append(o.$Control.outerHTML());

        switch (ebtype) {
            case "EbMobileForm":
                this.Controls.initForm(o);
                break;
            case "EbMobileVisualization":
                this.Controls.initVisualization(o);
                break;
            case "EbMobileDashBoard":
                this.Controls.initDashBoard(o);
                break;
            default:
                console.error("undefined container");
        }
        $(`#${o.EbSid}`).on("click", this.ContainerOnClick.bind(this));
        this.EditObj = null;
    };

    this.setCtrls = function ($container, controllCollection) {
        for (let i = 0; i < controllCollection.length; i++) {
            let edit_obj = controllCollection[i];
            let ebtype = this.getType(edit_obj.$type);
            let o = this.makeElement(ebtype, ebtype);
            $.extend(o, edit_obj);
            $container.append(o.$Control.outerHTML());
            this.refreshControl(o);
            let tobj = o.trigger(this);
            if (ebtype === "EbMobileDataGrid") {
                tobj.fillControls(tobj.CellCollection.$values, this);//fill table cells
                this.setCtrls($(`#${o.EbSid} .ctrl_as_container .control_container`), o.ChildControls.$values);
            }
        }
    };

    this.makeDragable = function () {
        $(".draggable,.container_draggable,.draggable_dashctrl").draggable({
            cancel: "a.ui-icon",
            revert: "invalid",
            helper: "clone",
            cursor: "move",
            appendTo: "body",
            drag: function (event, ui) {
                $(ui.helper).css({
                    "background": "white",
                    "border": "1px dotted black",
                    "width": "auto",
                    "padding": "15px",
                    "border-radius": "4"
                });
            }
        });
    };

    this.makeDropable = function (ebsid, ebtype) {
        $(`#${ebsid} .eb_mob_container_inner,#${ebsid} .ctrl_as_container .control_container`).droppable({
            accept: this.getDropAcceptClass(ebtype),
            hoverClass: "drop-hover-layout",
            tolerance: "fit",
            greedy: true,
            drop: this.onDropFn.bind(this)
        });
    };

    this.getDropAcceptClass = function (ebtype) {
        if (ebtype === "EbMobileForm")
            return ".draggable";
        else if (ebtype === "EbMobileDashBoard")
            return ".draggable_dashctrl";
        else
            return ".draggable";
    };

    this.ContainerOnClick = function (evt) {
        let div = $(evt.target).closest(".mob_container");
        let type = div.attr("eb-type");
        this.pg.setObject(this.Procs[div.attr("id")], AllMetas[type]);
    };

    this.makeSortable = function (ebsid) {
        $(`#${ebsid} .eb_mob_container_inner, #${ebsid} .ctrl_as_container .control_container`).sortable({
            axis: "y",
            appendTo: document.body
        });
    };

    this.onDropFn = function (event, ui) {
        let dragged = $(ui.draggable);
        let ebtype = dragged.attr("eb-type");
        let ctrlname = dragged.attr("ctrname");
        let o = this.makeElement(ebtype, ctrlname);
        $(event.target).append(o.$Control.outerHTML());
        this.refreshControl(o);
        o.trigger(this);

        //set tree col if form
        if (this.ContainerType === "EbMobileForm")
            this.Controls.refreshColumnTree();

        return o;
    };

    this.containerOnDrop = function (event, ui) {
        let dropLoc = $(event.target);
        let draged = $(ui.draggable);

        if (dropLoc.find(".mob_container").length <= 0) {
            let ebtype = draged.attr("eb-type");
            let ctrlname = draged.attr("ctrname");
            this.ContainerType = ebtype;
            let o = this.makeElement(ebtype, ctrlname);
            dropLoc.append(o.$Control.outerHTML());
            expand(o);
            switch (ebtype) {
                case "EbMobileForm":
                    this.Controls.initForm(o);
                    break;
                case "EbMobileVisualization":
                    this.Controls.initVisualization(o);
                    break;
                case "EbMobileDashBoard":
                    this.makeDropable(o.EbSid, ebtype);
                    break;
                default:
                    console.error("undefined container");
            }
            $(`#${o.EbSid}`).off("click").on("click", this.ContainerOnClick.bind(this));
        }
    };

    this.makeElement = function (ebtype, ctrlname) {
        let counter = CtrlCounters[ebtype.replace("Eb", "") + "Counter"]++;
        var id = "Tab" + this.Conf.TabNum + "_" + ctrlname + counter;
        this.Procs[id] = new EbObjects[ebtype](id);
        this.Procs[id].Label = ctrlname + counter;
        expand(this.Procs[id]);
        return this.Procs[id];
    };

    //save
    this.BeforeSave = function () {
        let container = $(this.droparea).find(".mob_container");
        if (this.isReadyToSave(container)) {
            let div = container[0];
            this.EbObject.Container = this.Procs[div.id];

            if ($(div).hasClass("eb_mob_form_container")) {
                this.EbObject.Container.ChildControls.$values.length = 0;
                $(div).find(".eb_mob_container_inner").children(".mob_control").each(function (i, o) {
                    this.findFormContainerItems(i, o, this.EbObject.Container.ChildControls);
                }.bind(this));
            }
            else if ($(div).hasClass("eb_mob_vis_container")) {
                this.findVisContainerItems($(div).find(".eb_mob_tablelayout")[0]);
            }
            else if ($(div).hasClass("eb_mob_dashboard_container")) {
                this.EbObject.Container.ChildControls.$values.length = 0;
                $(div).find(".mob_dash_control").each(this.findDashContainerItems.bind(this));
            }
            //set root object to objdash current object
            commonO.Current_obj = this.EbObject;
            return true;
        }
        else
            return false;
    };

    this.isReadyToSave = function ($container) {
        if ($container.length <= 0) {
            EbPopBox("show", { Message: "A page must have a container :(" });
            return false;
        }
        if (!this.EbObject.DisplayName) {
            EbPopBox("show", { Message: "DisplayName not specified :(" });
            return false;
        }
        return true;
    };

    //form save
    this.findFormContainerItems = function (i, o, ebContainer) {
        let jsobj = this.Procs[o.id];
        let ebtype = this.getType(jsobj.$type);
        if (ebtype === "EbMobileDataGrid")
            jsobj.setObject(this);
        ebContainer.$values.push(jsobj);
    };

    //dash save
    this.findDashContainerItems = function (i, o) {
        let jsobj = this.Procs[o.id];
        this.EbObject.Container.ChildControls.$values.push(jsobj);
    };

    //vis save
    this.findVisContainerItems = function (table) {
        let o = this.Procs[table.id];
        o.setObject();
        this.EbObject.Container.DataLayout = o;

        this.EbObject.Container.FilterControls.$values.length = 0;
        $(`#${o.EbSid}`).closest(".mob_container").find(".vis-filter-container .mob_control").each(function (j, obj) {
            this.findFormContainerItems(j, obj, this.EbObject.Container.FilterControls);
        }.bind(this));

        this.EbObject.Container.SortColumns.$values.length = 0;
        $(`#${o.EbSid}`).closest(".mob_container").find(".vis-sort-container .data_column").each(function (j, obj) {
            let data_col = this.Procs[obj.id];
            this.EbObject.Container.SortColumns.$values.push(data_col);
        }.bind(this));
    };

    this.getColums4ListView = function (obj) {
        this.dataSourceColumn(obj.DataSourceRefId, function (vis, result) {
            vis.DataSourceParams.$values = result.paramsList || [];
            this.Controls.drawDsColTree(result.columns);
            $(".branch").click();
            if (!$(`#eb_mobtree_body_${this.Conf.TabNum}`).is(":visible"))
                $(`#eb_mobtree_body_${this.Conf.TabNum}`).animate({ width: ["toggle", "swing"] });
        }.bind(this, obj));
    };

    this.dataSourceColumn = function (ds_refid, callback) {
        if (!callback)
            console.error("dataSourceColumn must have callback function");

        if (ds_refid) {
            $.ajax({
                url: "../RB/GetColumns",
                type: "POST",
                cache: false,
                data: { refID: ds_refid },
                beforeSend: function () { $("#eb_common_loader").EbLoader("show"); },
                success: function (result) {
                    $("#eb_common_loader").EbLoader("hide");
                    callback(result);
                }.bind(this),
                error: function () {
                    $("#eb_common_loader").EbLoader("hide");
                }
            });
        }
    };

    //pg onchange
    this.pg.PropertyChanged = function (obj, pname) {
        if (pname === "Label" && obj.constructor.name !== "EbMobileDataGrid") {
            this.refreshControl(obj);
        }
        else if (pname === "Label" && obj.constructor.name === "EbMobileDataGrid") {
            $(`#${obj.EbSid}`).children(".ctrl_label").text(obj.Label);
        }
        else if (obj.constructor.name === "EbMobileSimpleSelect" && pname === "DataSourceRefId") {
            obj.getColumns(obj.DataSourceRefId, this);
        }
        else if (obj.constructor.name === "EbMobileVisualization" && pname === "DataSourceRefId") {
            this.getColums4ListView(obj);
        }
        else if (obj.constructor.name === "EbMobileGeoLocation" && pname === "HideSearchBox") {
            obj._toggleSearchBar();
        }
        else if (pname === "DisplayName" && obj.constructor.name === "EbMobilePage") {
            this.setEmulatorTitle(obj[pname]);
        }
        else {
            console.log("pg changed");
        }

        if ("propertyChanged" in obj)
            obj.propertyChanged(pname);

        //set tree col if form
        if (this.ContainerType === "EbMobileForm" && (pname === "Name" || pname === "TableName"))
            this.Controls.refreshColumnTree();
    }.bind(this);

    this.labelOnDoubleClick = function (e) {
        let label = $(e.target).closest(".ctrl_label");
        label.prop("contenteditable", true);
        label.addClass("content-editable");
        label.focus();
        label.off("focusout").on("focusout", function (e) {
            let o = this.Procs[label.closest(".eb_stacklayout").attr("id")];
            o.Label = label.text().trim();
            label.removeClass("content-editable");
            this.pg.refresh();
        }.bind(this));
    };

    this.refreshEmulator = function () {
        let h = $(`#eb_mobpage_toolbox${this.Conf.TabNum}`).height();
        $(`#eb_mobpage_wraper${this.Conf.TabNum} .eb_mobpage_pane_layout`).height(h - 10);
        $(`#eb_mobpage_wraper${this.Conf.TabNum} .eb_mobtree_body`).height(h);
    };

    this.setEmulatorTitle = function (value) {
        $("#eb_emulater_title" + this.Conf.TabNum).text(value);
    };

    this.exe = function () {
        this.Controls = new MobileControls(this);
        if (this.EditObj === null || this.EditObj === undefined)
            this.newMobPage();
        else
            this.editMobPage();

        this.makeDragable();

        $(this.droparea).droppable({
            accept: ".container_draggable",
            hoverClass: "drop-hover",
            drop: this.containerOnDrop.bind(this)
        });
        this.Menu = new MobileMenu(this);
        $("body").on("dblclick", ".ctrl_label", this.labelOnDoubleClick.bind(this));
        this.refreshEmulator();
        this.setEmulatorTitle(this.EbObject.DisplayName || "Untitled");
        $(window).resize(function () { this.refreshEmulator(); }.bind(this));
        this.pg.__extension = new PgHelperMobile(this.pg);
    };

    this.exe();
}