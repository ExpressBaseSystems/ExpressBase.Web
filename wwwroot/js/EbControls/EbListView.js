var EbListViewDev = function (_ctrl, _formObj, _renderer) {
    this.Ctrl = _ctrl;
    this.FormObj = _formObj;
    this.Renderer = _renderer | null;
    this.ColumnsList = [];
    this.drake = null;
    //this.CalenderFormRefId = this.Renderer.FormRefId;
    this.CalendarObj;
    this.EventArr = [];
    this.SelectedTableLayout;

    this.InitCalendar = function () {
        //var calendarEl = $('#calendar').first();
        var calendarEl = document.getElementById(`calendar-${this.Ctrl.EbSid}`);
        let calendarViewConfigStr = [];
        if (this.Ctrl.CalendarObject.MultiMonthYear)
            calendarViewConfigStr.push("multiMonthYear");
        if (this.Ctrl.CalendarObject.DayGridYear)
            calendarViewConfigStr.push("dayGridYear");
        if (this.Ctrl.CalendarObject.DayGridMonth)
            calendarViewConfigStr.push("dayGridMonth");
        if (this.Ctrl.CalendarObject.TimeGridWeek)
            calendarViewConfigStr.push("timeGridWeek");
        if (this.Ctrl.CalendarObject.TimeGridDay)
            calendarViewConfigStr.push("timeGridDay");
        if (this.Ctrl.CalendarObject.ListWeek)
            calendarViewConfigStr.push("listWeek");

        this.CalendarObj = new FullCalendar.Calendar(calendarEl, {
            //height: '100%',
            expandRows: true,
            slotMinTime: this.Ctrl.CalendarObject.SlotMinTime,
            slotMaxTime: this.Ctrl.CalendarObject.SlotMaxTime,
            slotDuration: this.Ctrl.CalendarObject.SlotDuration,
            themeSystem: 'bootstrap5',
            views: {
                dayGrid: {
                    // options apply to dayGridMonth, dayGridWeek, and dayGridDay views
                    weekday: 'long'
                },
                timeGrid: {
                    // options apply to timeGridWeek and timeGridDay views
                    weekday: 'long'
                },
                week: { weekday: 'long' },
                day: {
                    // options apply to dayGridDay and timeGridDay views
                    weekday: 'long'
                }
            },
            hiddenDays: [6, 7],
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: calendarViewConfigStr.join()
            },
            selectable: this.Ctrl.CalendarObject.Selectable,
            selectMirror: this.Ctrl.CalendarObject.Selectable,
            slotEventOverlap: false,
            eventConstraint: {
                start: moment().format('YYYY-MM-DD'),
                end: '2100-01-01'
            },
            editable: true,
            dayMaxEvents: true,
            events: this.GetEvents(),
            eventDisplay: 'block',
            eventContent: function (info) {
                return { html: info.event.title };
            },
            initialView: 'timeGridWeek',
            aspectRatio: 1.5

        });

        this.CalendarObj.render();
        $(`#calendar-${this.Ctrl.EbSid}`).off("click").on("click", this.SetObjectToPG.bind(this));
        //$(`#calendar-${obj.EbSid}`).remove();
    };
    this.GetEvents = function () {
        if (this.Renderer) {
            $.post("/WebForm/CalendarDataReaderRequest", { _refid: this.Renderer.formRefId, _triggerctrl: this.Ctrl.Name }).done(function (data) {
                var EventArr = [];
                $.each(JSON.parse(data), function (key, value) {
                    var abc = {};
                    abc["id"] = value.EventId;
                    abc["title"] = `<h6>${value.EventName}</h6>`;
                    abc["start"] = value.StartDate;
                    abc["end"] = value.EndDate;
                    abc["className"] = "test";
                    abc["eventContent"] = { html: '<i>some html</i>' };
                    if (value.Color) {
                        abc["backgroundColor"] = value.Color;
                        abc["borderColor"] = value.Color;
                    }
                    this.EventArr.push(abc);
                    this.CalendarObj.addEvent(abc);
                }.bind(this));
            }.bind(this));
        }
    };

    this.InitListViewContainer = function () {

        this.DrawTableLayout(this.Ctrl.ListViewLayout.RowLayouts.$values, 'listviewlayout');
        this.DrawTableLayout(this.Ctrl.ListViewFilterLayout.RowLayouts.$values, 'listview-filter');
        this.InitContextMenu();
        this.InitDragula();
    }

    this.DrawTableLayout = function (List, DivName) {

        $(`#cont_${this.Ctrl.EbSid} .${DivName}`).empty();
        var ListViewContainer = $(`#cont_${this.Ctrl.EbSid} .${DivName}`);
        List.forEach(function (rowItem, rowindex) {
            var tbody = $(document.createElement("tbody"));
            let tr = $(document.createElement("tr"));
            tr.attr("row", rowindex);
            rowItem.ColumnLayouts.$values.forEach(function (item, columnindex) {
                // let Width = Math.round(item.ColumnWidth * $(".listviewlayout table").width() / 100);
                if (!item.IsHidden) {
                    if (item.DataColumn) {
                        switch (item.DataColumn.EbType) {
                            case "ListViewDataColumn":
                                tr.append(`<td class="list-td ${DivName}-td" colspan=${item.ColumnSpan} rowspan=${item.RowSpan} row=${rowindex} column=${columnindex} style="width:${item.ColumnWidth}%"> 
                                    <div class='styl' name="${item.DataColumn.ColumnName}">
                                               <span> ${item.DataColumn.ColumnName}</span>
                                            </div>
                                    </td>`);
                                break;

                            case "ListViewButton":
                                tr.append(`<td class="list-td ${DivName}-td" colspan=${item.ColumnSpan} rowspan=${item.RowSpan} row=${rowindex} column=${columnindex} style="width:${item.ColumnWidth}%"> 
                                    <div class='list-view-form-link' name="${item.DataColumn.ButtonText}" style=${GetStyle(item.DataColumn)}>
                                     ${item.DataColumn.ButtonText} </div></td>`);
                                break;

                            case "ListViewFilterButton":
                                tr.append(`<td class="list-td ${DivName}-td" colspan=${item.ColumnSpan} rowspan=${item.RowSpan} row=${rowindex} column=${columnindex} style="width:${item.ColumnWidth}%"> 
                                    <div class='list-view-filter-btn' name="${item.DataColumn.ButtonText}" column-name=${item.DataColumn.FilterColumName} style=${GetStyle(item.DataColumn)}>
                                       ${item.DataColumn.ButtonText}
                                    </div></td>`);
                                break;
                            default:
                                tr.append(`<td class="list-td ${DivName}-td" colspan=${item.ColumnSpan} rowspan=${item.RowSpan} row=${rowindex} column=${columnindex} style="width:${item.ColumnWidth}%"></td>`);
                                break;
                        }
                    }
                    else {
                        tr.append(`<td class="list-td ${DivName}-td" colspan=${item.ColumnSpan} rowspan=${item.RowSpan} row=${rowindex} column=${columnindex} style="width:${item.ColumnWidth}%"></td>`);
                    }
                }
            });
            tbody.append(tr);
            ListViewContainer.append($(document.createElement("table")).append(tbody));

        }.bind(this));

        $(".styl").off("click").on("click", this.SetProperty.bind(this));
        $(".list-view-form-link").off("click").on("click", this.SetProperty.bind(this));
        $(".list-td").off("click").on("click", this.SetProperty.bind(this));
        $(".list-view-filter-btn").off("click").on("click", this.SetProperty.bind(this));
        //$(".list-view-filter-btn").off("click").on("click", this.SetProperty.bind(this));
    }
    this.SetProperty = function (e) {
        if ($(e.target).hasClass("styl")) {
            let row = $(e.target).closest("td").attr("row");
            let column = $(e.target).closest("td").attr("column");
            this.FormObj.PGobj.setObject(this.Ctrl.ListViewLayout.RowLayouts.$values[row].ColumnLayouts.$values[column].DataColumn, AllMetas["ListViewDataColumn"]);
        }
        else if ($(e.target).hasClass("list-view-form-link") || $(e.target).parent().hasClass("list-view-form-link")) {
            e.preventDefault();
            let row = $(e.target).closest("td").attr("row");
            let column = $(e.target).closest("td").attr("column");
            this.FormObj.PGobj.setObject(this.Ctrl.ListViewLayout.RowLayouts.$values[row].ColumnLayouts.$values[column].DataColumn, AllMetas["ListViewButton"]);
        }
        else if ($(e.target).hasClass("list-view-filter-btn")) {
            let row = $(e.target).closest("td").attr("row");
            let column = $(e.target).closest("td").attr("column");
            this.FormObj.PGobj.setObject(this.Ctrl.ListViewFilterLayout.RowLayouts.$values[row].ColumnLayouts.$values[column].DataColumn, AllMetas["ListViewFilterButton"]);
        }
        else if ($(e.target).hasClass("listview-filter-td")) {
            let row = $(e.target).attr("row");
            let column = $(e.target).attr("column");
            this.FormObj.PGobj.setObject(this.Ctrl.ListViewFilterLayout.RowLayouts.$values[row].ColumnLayouts.$values[column], AllMetas["ListViewColumnLayout"]);
        }
        else if ($(e.target).hasClass("listviewlayout-td")) {
            let row = $(e.target).attr("row");
            let column = $(e.target).attr("column");
            this.FormObj.PGobj.setObject(this.Ctrl.ListViewLayout.RowLayouts.$values[row].ColumnLayouts.$values[column], AllMetas["ListViewColumnLayout"]);
        }
    }
    this.stop = function (event, ui) {
        $(".list-td").each(function (index, item) {
            let Width = Math.round($(item).width() / $(".listviewlayout table").width() * 100);
            let row = parseInt($(item).attr("row"));
            let column = parseInt($(item).attr("column"));
            this.Ctrl.ListViewLayout.RowLayouts.$values[row].ColumnLayouts.$values[column].ColumnWidth = Width;
        }.bind(this));
        //let Width = Math.round(parseInt(ui.size.width) / $(".listviewlayout table").width() * 100);
        //let row = parseInt($(ui.element).attr("row"));
        //let column = parseInt($(ui.element).attr("column"));
        //this.Ctrl.ListViewLayout.RowLayouts.$values[row].ColumnLayouts.$values[column].ColumnWidth = Width;
    }
    this.InitContextMenu = function () {
        let MenuItems = {
            "colspan": {
                name: "Colspan", icon: "fa-columns", callback: this.tableLayoutLinks.bind(this)
            },
            "rowspan": { name: "Rowspan", icon: "fa-table", callback: this.tableLayoutLinks.bind(this) },
            "addrow": { name: "Add row", icon: "fa-table", callback: this.tableLayoutLinks.bind(this) },
            "addcolumn": { name: "Add column", icon: "fa-columns", callback: this.tableLayoutLinks.bind(this) },
            "deleterow": { name: "Delete row", icon: "fa-table", callback: this.tableLayoutLinks.bind(this) },
            "deletecolumn": { name: "Delete column", icon: "fa-columns", callback: this.tableLayoutLinks.bind(this) },
            "addbutton": { name: "Add Button", icon: "fa-html5", callback: this.tableLayoutLinks.bind(this) },
            "reset": { name: "Reset", icon: "fa-window-restore", callback: this.tableLayoutLinks.bind(this) },
        };

        $.contextMenu({
            selector: `#cont_${this.Ctrl.EbSid} .listviewlayout td`,
            items: MenuItems
        });

        $.contextMenu({
            selector: `#cont_${this.Ctrl.EbSid} .listview-filter td`,
            items: MenuItems
        });

    }
    this.tableLayoutLinks = function (key, options, selector, action, originalEvent) {

        this.SelectedTableLayout = options.$trigger.hasClass("listview-filter-td") ? this.Ctrl.ListViewFilterLayout : this.Ctrl.ListViewLayout;

        let row = parseInt(options.$trigger.attr("row"));
        let column = parseInt(options.$trigger.attr("column"));
        let colspan = parseInt(options.$trigger.attr("colspan"));
        let rowspan = parseInt(options.$trigger.attr("rowspan"));
        switch (key) {
            case "colspan":
                if (column !== this.SelectedTableLayout.RowLayouts.$values[row].ColumnLayouts.$values.length - 1) {
                    this.SelectedTableLayout.RowLayouts.$values[row].ColumnLayouts.$values[column].ColumnSpan = colspan + 1;
                    column += colspan;
                    this.SelectedTableLayout.RowLayouts.$values[row].ColumnLayouts.$values[column].IsHidden = true;
                }
                this.InitListViewContainer();
                break;
            case "rowspan":
                if (row !== this.Ctrl.ListViewLayout.RowLayouts.$values.length - 1) {
                    this.SelectedTableLayout.RowLayouts.$values[row].ColumnLayouts.$values[column].RowSpan = rowspan + 1;
                    row += rowspan;
                    this.SelectedTableLayout.RowLayouts.$values[row].ColumnLayouts.$values[column].IsHidden = true;
                }
                this.InitListViewContainer();
                break;
            case "addrow":

                this.SelectedTableLayout.RowLayouts.$values.push(new EbObjects_w.ListViewRowLayout());
                for (let i = 0; i < this.SelectedTableLayout.ColumnCount; i++) {

                    let Obj = new EbObjects_w.ListViewColumnLayout();
                    Obj.ColumnSpan = 1;
                    Obj.RowSpan = 1;
                    Obj.DataColumn = null;
                    Obj.ListViewButton = null;
                    this.SelectedTableLayout.RowLayouts.$values[this.SelectedTableLayout.RowCount]
                        .ColumnLayouts.$values.push(Obj);
                }
                this.SelectedTableLayout.RowCount++;
                this.InitListViewContainer();
                break;
            case "addcolumn":
                for (let i = 0; i < this.SelectedTableLayout.RowCount; i++) {
                    let Obj = new EbObjects_w.ListViewColumnLayout();
                    Obj.ColumnSpan = 1;
                    Obj.RowSpan = 1;
                    Obj.DataColumn = null;
                    Obj.ListViewButton = null;
                    this.SelectedTableLayout.RowLayouts.$values[i]
                        .ColumnLayouts.$values.push(Obj);
                }
                this.SelectedTableLayout.ColumnCount++;
                this.InitListViewContainer();
                break;
            case "deleterow":
                this.SelectedTableLayout.RowLayouts.$values.splice(row, 1);
                this.SelectedTableLayout.RowCount = this.SelectedTableLayout.RowLayouts.$values.length;
                this.SelectedTableLayout.RowLayouts.$values.forEach(function (item, rowindex) {
                    item.ColumnLayouts.$values.forEach(function (item, columnindex) {
                        item.ColumnSpan = 1;
                        item.RowSpan = 1;
                        item.IsHidden = false;
                    });

                }.bind(this));
                this.InitListViewContainer();
                break;

            case "deletecolumn":
                this.SelectedTableLayout.RowLayouts.$values.forEach(function (item, index) {
                    item.ColumnLayouts.$values.pop();
                });
                this.InitListViewContainer();
                break;

            case "reset":
                this.SelectedTableLayout.RowLayouts.$values.forEach(function (item, rowindex) {
                    item.ColumnLayouts.$values.forEach(function (item, columnindex) {
                        item.ColumnSpan = 1;
                        item.RowSpan = 1;
                        item.IsHidden = false;
                        item.DataColumn = null;
                        item.ListViewButton = null;
                    });

                }.bind(this));
                this.InitListViewContainer();
                break;
            case "addbutton":
                this.SelectedTableLayout.RowLayouts.$values[row].ColumnLayouts.$values[column].DataColumn = new EbObjects_w.ListViewButton();
                this.InitListViewContainer();
                break;
        }
        if (options.$trigger.hasClass("listview-filter-td"))
            this.DrawTableLayout(this.Ctrl.ListViewFilterLayout.RowLayouts.$values, 'listview-filter');

        else
            this.DrawTableLayout(this.Ctrl.ListViewLayout.RowLayouts.$values, 'listviewlayout');

        this.InitDragula();
        //this.InitResizableTable();
    }

    this.InitColumnTree = function () {

        $.ajax({
            type: "POST",
            url: "../DS/GetColumns4Control",
            data: { DataSourceRefId: this.Ctrl.DataSourceId },
            success: function (_Columns) {
                let Columns = JSON.parse(_Columns);
                Columns.$values.forEach(function (item, rowindex) {
                    let col = new EbObjects_w.ListViewDataColumn();
                    col.ColumnName = item.name;
                    this.ColumnsList.push(col);
                }.bind(this));
                this.drawColumnTree();
                //column-tree
            }.bind(this)
        });
    }
    this.drawColumnTree = function () {
        $("#column-tree-cont").show();
        $("#web-form-cont").removeClass("col-lg-10").addClass("col-lg-9");

        $ColumnsContainer = $(".web-form-buider-cont #column-collection");
        html = $(document.createElement("div"));
        html.attr("id", "draggable-columns")
        this.ColumnsList.forEach(function (item, rowindx) {
            html.append(`<div class='styl' name="${item.ColumnName}" id="${rowindx}">
                                <i class="fa fa-columns" aria-hidden="true"></i><span> ${item.ColumnName}</span>
                            </div>`);
        }.bind(this));
        $ColumnsContainer.append(html);

        this.InitDragula();
        //this.InitResizableTable();

    };



    this.InitResizableTable = function () {
        //var abc = $(".listviewlayout table").resizableColumns({
        //    store: window.store,
        //    minWidth: 1,
        //});

        $(".listviewlayout table td").resizable({
            stop: this.stop.bind(this)
        });
    }
    this.InitDragula = function () {
        try {
            this.drake.destroy()
        }
        catch (error) {

        }
        finally {
            containers = [].slice.call(document.querySelectorAll('.list-td'));
            //containers.unshift(document.getElementById(`label-${this.Ctrl.EbSid}`));
            containers.unshift(document.getElementById("draggable-columns"));
            this.drake = dragula(containers, {
                copy: true,
                accepts: this.acceptfn,
            });
            this.drake.off("drag").on("drag", this.columnsdrag.bind(this));
            //this.drake.off("shadow").on("shadow", this.columnsshadow.bind(this));
            this.drake.off("drop").on("drop", this.columnsdrop.bind(this));
        }
    }

    this.acceptfn = function (el, target, source, sibling) {
        if ($(el).hasClass("ui-resizable-handle")) {
            return false;
        }
        else if ($(target).hasClass("list-td"))
            return true;
        else
            return target !== document.getElementById('draggable-columns') && $(el).hasClass("styl");
    }
    this.columnsdrag = function (el, source) {
        debugger;
    }
    this.columnsdrop = function (el, target, source, sibling) {
        let td = $(target).closest("td");
        if (td.hasClass("listviewlayout-td")) {
            let row = td.attr("row");
            let column = td.attr("column");
            let obj = new EbObjects_w.ListViewDataColumn();
            obj.ColumnName = $(el).attr("name");
            this.Ctrl.ListViewLayout.RowLayouts.$values[row].ColumnLayouts.$values[column].DataColumn = obj;
            //$(target).empty().append(`<div class='styl' name="${obj.ColumnName}" column="${column}" row="${row}">
            //                   <span> ${obj.ColumnName}</span></div>`);
            //$(".styl").off("click").on("click", this.SetDataSourceColumn.bind(this));
        }
        else if (td.hasClass("listview-filter-td")) {
            let row = td.attr("row");
            let column = td.attr("column");
            let obj = new EbObjects_w.ListViewFilterButton();
            obj.FilterColumName = $(el).attr("name");
            this.Ctrl.ListViewFilterLayout.RowLayouts.$values[row].ColumnLayouts.$values[column].DataColumn = obj;
            $(target).empty().append(`<div class='list-view-filter-btn' name="${obj.ButtonName}" style=${GetStyle(obj)}>
                           ${obj.ButtonText}
                        </div>`);
            $(".styl").off("click").on("click", this.SetProperty.bind(this));
            $(".list-view-form-link").off("click").on("click", this.SetProperty.bind(this));
            $(".list-td").off("click").on("click", this.SetProperty.bind(this));
            //$(".styl").off("click").on("click", this.SetDataSourceColumn.bind(this));
        }
        //this.InitListViewContainer();
    }
    this.columnsdrag = function () {

    }
    this.popChanged = function (obj, pname, newval, oldval) {
        if (obj.ObjType == "ListView" && pname == 'DataSourceId') {
            this.InitCalendar();
            this.InitColumnTree();
        }
    };

    this.SetObjectToPG = function () {
        this.FormObj.PGobj.setObject(this.Ctrl.CalendarObject, AllMetas["EbCalendar"]);
    };
    this.Init = function () {
        this.InitListViewContainer();
        if (this.Ctrl.DataSourceId !== "") {
            this.InitCalendar();
            this.InitColumnTree();
        }
        this.FormObj.PGobj.PropertyChanged = this.popChanged.bind(this);
    };
    this.Init();
}

var EbListView = function (_ctrl, _renderer) {
    this.Ctrl = _ctrl;
    this.Renderer = _renderer;
    this.ColumnsList = [];
    this.drake = null;
    this.CalenderFormRefId = this.Renderer.FormRefId;
    this.CalendarObj;
    this.EventList = [];
    this.EventArr = [];
    this.EventObjList = [];

    this.InitCalendar = function () {
        var calendarEl = $('#calendar').first();
        var calendarEl = document.getElementById(`calendar-${this.Ctrl.EbSid}`);
        let calendarViewConfigStr = [];
        if (this.Ctrl.CalendarObject.MultiMonthYear)
            calendarViewConfigStr.push("multiMonthYear");
        if (this.Ctrl.CalendarObject.DayGridYear)
            calendarViewConfigStr.push("dayGridYear");
        if (this.Ctrl.CalendarObject.DayGridMonth)
            calendarViewConfigStr.push("dayGridMonth");
        if (this.Ctrl.CalendarObject.TimeGridWeek)
            calendarViewConfigStr.push("timeGridWeek");
        if (this.Ctrl.CalendarObject.TimeGridDay)
            calendarViewConfigStr.push("timeGridDay");
        if (this.Ctrl.CalendarObject.ListWeek)
            calendarViewConfigStr.push("listWeek");

        this.CalendarObj = new FullCalendar.Calendar(calendarEl, {
            height: '100%',
            expandRows: true,
            slotMinTime: this.Ctrl.CalendarObject.SlotMinTime,
            slotMaxTime: this.Ctrl.CalendarObject.SlotMaxTime,
            slotDuration: this.Ctrl.CalendarObject.SlotDuration,
            themeSystem: 'bootstrap5',
            views: {
                dayGrid: {
                    //options apply to dayGridMonth, dayGridWeek, and dayGridDay views
                    weekday: 'long'
                },
                timeGrid: {
                    // options apply to timeGridWeek and timeGridDay views
                    weekday: 'long'
                },
                week: { weekday: 'long' },
                day: {
                    // options apply to dayGridDay and timeGridDay views
                    weekday: 'long'
                }
            },
            hiddenDays: [],
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: calendarViewConfigStr.join()
            },
            selectable: this.Ctrl.CalendarObject.Selectable,
            selectMirror: this.Ctrl.CalendarObject.Selectable,
            slotEventOverlap: false,
            eventConstraint: {
                start: moment().format('YYYY-MM-DD'),
                end: '2100-01-01'
            },
            select: function (arg) {
                this.AddNewEvent(arg);
            }.bind(this),
            editable: this.Ctrl.CalendarObject.Editable,
            eventClick: function (arg) {
                this.PopupFormView(arg);
            }.bind(this),
            editable: true,
            dayMaxEvents: true,
            eventDrop: function (info) {
                this.DropForm(info);
            }.bind(this),
            eventResize: function (info) {
                this.DropForm(info);
            }.bind(this),
            events: this.GetEvents(),
            eventDisplay: 'block',
            eventContent: function (info) {
                return { html: info.event.title };
            },
            initialView: 'timeGridWeek',
            aspectRatio: 1.5

        });

        this.CalendarObj.render();
        //$(`#calendar-${this.Ctrl.EbSid}`).off("click").on("click", this.SetObjectToPG.bind(this));
        //$(`#calendar-${this.Ctrl.EbSid}`).remove();
    };

    this.DropForm = function (info) {
        ebcontext.webform.PopupForm(this.Ctrl.CalendarObject.FormRefId, btoa(JSON.stringify([{ Name: 'id', Type: 7, Value: info.event.id }])), 1,
            {
                srcCxt: this.Renderer.__MultiRenderCxt,
                initiator: this.Ctrl,
                locId: this.Renderer.getLocId(),
                editModePrefill: true,
                editModeAutoSave: true,
                editModePrefillParams: btoa(JSON.stringify([{ Name: 'start_date', Type: 6, Value: moment(info.event.start).format("YYYY-MM-DD HH:mm:ss") },
                { Name: 'end_date', Type: 6, Value: moment(info.event.end).format("YYYY-MM-DD HH:mm:ss") }])),
                Callback: function (dataId, isSaved, dataAsParams) {
                    if (!isSaved) {
                        info.revert();
                    }
                }

            });
    };
    this.AddNewEvent = function (info) {
        ebcontext.webform.PopupForm(this.Ctrl.CalendarObject.FormRefId, btoa(JSON.stringify([{ Name: 'start_date', Type: 6, Value: moment(info.start) }, { Name: 'end_date', Type: 6, Value: moment(info.end) }])), 2,
            {
                srcCxt: this.Renderer.__MultiRenderCxt,
                initiator: this.Ctrl,
                locId: this.Renderer.getLocId(),
                Callback: function (dataId, isSaved, dataAsParams) {
                    if (isSaved) {
                        const ParamMap = new Map();
                        dataAsParams.forEach(function (value, index, array) {
                            ParamMap.set(value.Name, value.Value);
                        });
                        var abc = {};
                        abc["id"] = ParamMap.get("id");
                        abc["title"] = `<h6>${ParamMap.get("title")}</h6>`;
                        abc["start"] = ParamMap.get("start_date");
                        abc["end"] = ParamMap.get("end_date");
                        if (ParamMap.get("color")) {
                            abc["backgroundColor"] = ParamMap.get("color");
                            abc["borderColor"] = ParamMap.get("color");
                        }
                        abc["extendedProps"] = {
                            department: 'BioChemistry'
                        };
                        this.EventArr.push(abc);
                        this.CalendarObj.addEvent(abc);
                    }
                }.bind(this)

            });
    };
    this.PopupFormView = function (info) {
        ebcontext.webform.PopupForm(this.Ctrl.CalendarObject.FormRefId, btoa(JSON.stringify([{ Name: 'id', Type: 7, Value: info.event.id }])), 1,
            {
                srcCxt: this.Renderer.__MultiRenderCxt,
                initiator: this.Ctrl,
                locId: this.Renderer.getLocId(),
                Callback: function (dataId, isSaved, dataAsParams) {
                    if (isSaved) {
                        arg.event.remove();
                        const ParamMap = new Map();
                        dataAsParams.forEach(function (value, index, array) {
                            ParamMap.set(value.Name, value.Value);
                        });
                        var abc = {};
                        abc["id"] = ParamMap.get("id");
                        abc["title"] = `<h6>${ParamMap.get("title")}</h6>`;
                        abc["start"] = ParamMap.get("start_date");
                        abc["end"] = ParamMap.get("end_date");
                        if (ParamMap.get("color")) {
                            abc["backgroundColor"] = ParamMap.get("color");
                            abc["borderColor"] = ParamMap.get("color");
                        }
                        abc["extendedProps"] = {
                            department: 'BioChemistry'
                        };
                        this.EventArr.push(abc);
                        this.CalendarObj.addEvent(abc);
                    }
                }.bind(this)

            });
    }
    this.GetEvents = function () {
        if (this.Renderer) {
            $.post("/WebForm/CalendarDataReaderRequest", { _refid: this.Renderer.formRefId, _triggerctrl: this.Ctrl.Name }).done(function (data) {
                this.EventList = JSON.parse(data);
                //this.InitListViewContainer();
                this.CreateEventList();
                $.each(this.EventList.EventList, function (key, value) {
                    var abc = {};
                    abc["id"] = value.EventId;
                    abc["title"] = `<h6>${value.EventName}</h6>`;
                    abc["start"] = value.StartDate;
                    abc["end"] = value.EndDate;
                    abc["className"] = "test";
                    abc["eventContent"] = { html: '<i>some html</i>' };
                    if (value.Color) {
                        abc["backgroundColor"] = value.Color;
                        abc["borderColor"] = value.Color;
                    }
                    this.EventArr.push(abc);
                    this.CalendarObj.addEvent(abc);
                }.bind(this));
            }.bind(this));
        }

    };

    //this.InitListViewContainer = function () {
    //    $.each(this.EventList.DataList, function (key, value) {
    //        var ListViewContainer = $(`#cont_${this.Ctrl.EbSid} .listviewlayout`);
    //        //ListViewContainer.empty();
    //        var tbody = $(document.createElement("tbody"));

    //        //html.attr("row", rowindex);
    //        this.Ctrl.ListViewLayout.RowLayouts.$values.forEach(function (item, rowindex) {
    //            var tr = $(document.createElement("tr"));
    //            tr.attr("row", rowindex);
    //            item.ColumnLayouts.$values.forEach(function (item, columnindex) {
    //                if (!item.IsHidden) {
    //                    let Width = Math.round(item.ColumnWidth * $(".listviewlayout table").width() / 100);
    //                    if (item.DataColumn) {
    //                        let data = value.Datarow.find((x) => x.ColumnName == item.DataColumn.ColumnName);
    //                        tr.append(`<td class="list-td" colspan=${item.ColumnSpan} rowspan=${item.RowSpan} row=${rowindex} column=${columnindex} style="width:${item.ColumnWidth}%"> 
    //                <div class='styl' name="${item.DataColumn.ColumnName}" column="${columnindex}" row="${rowindex}">
    //                           <span style="${GetFontCss(item.DataColumn.Font).replace(/"/g, "")}"> ${data.ColumnValue}</span>
    //                        </div>
    //                </td>`);
    //                    }
    //                    else if (item.ListViewButton) {
    //                        let idObject = value.Datarow.find((x) => x.ColumnName == "id")
    //                        tr.append(`<td class="list-td" colspan=${item.ColumnSpan} rowspan=${item.RowSpan} data-id=${idObject.ColumnValue} row=${rowindex} column=${columnindex} style="width:${item.ColumnWidth}%"> 
    //                    <div class='list-view-form-link' name="${item.ListViewButton.ButtonName}"  style=${GetStyle(item.ListViewButton)}>
    //                       ${item.ListViewButton.ButtonText}
    //                    </div></td>`);
    //                    }
    //                    else {
    //                        tr.append(`<td class="list-td" colspan=${item.ColumnSpan} rowspan=${item.RowSpan} row=${rowindex} column=${columnindex}></td>`);
    //                    }

    //                }
    //            }.bind(this));
    //            tbody.append(tr);
    //        }.bind(this));
    //        ListViewContainer.append(`<div class='event-list-pane' id='${key}-list-cont'></div>`);
    //        $(`#${key}-list-cont`).append($(document.createElement("table")).append(tbody));
    //        $(`#${key}-list-cont`).append(`<i class="fa fa-caret-right" aria-hidden="true"></i>`);
    //    }.bind(this));
    //    //$(".styl").on("click", this.SetDataSourceColumn.bind(this));
    //    $(".list-view-form-link").off("click").on("click", this.CallExternalform.bind(this));
    //}

    this.InitListViewContainer = function (DataList) {
        $(`#cont_${this.Ctrl.EbSid} .listviewlayout`).empty().hide();
        $.each(DataList, function (key, value) {
            this.DrawTableLayout(this.Ctrl.ListViewLayout.RowLayouts.$values, 'listviewlayout', value, key);
        }.bind(this));
        $(`#cont_${this.Ctrl.EbSid} .listviewlayout`).show("fast")
    }

    //this.InitFilterContainer = function () {

    //}
    this.CreateEventList = function () {
        $.each(this.EventList.DataList, function (key, value) {
            let event = {};
            value.Datarow.forEach(function (data, index) {
                switch (data.ColumnType) {
                    case "integer":
                        event[data.ColumnName] = parseInt(data.ColumnValue);
                        break;
                    case "timestamp":
                        event[data.ColumnName] = new Date(parseInt(data.ColumnValue.split("/Date(")[1].split(")/")[0]));
                        break;
                    case "text":
                        event[data.ColumnName] = data.ColumnValue;
                        break;
                }

            }.bind(this));
            this.EventObjList.push(event);
        }.bind(this));
        this.InitListViewContainer(this.EventObjList);
        this.DrawTableLayout(this.Ctrl.ListViewFilterLayout.RowLayouts.$values, 'listview-filter');
    };
    this.DrawTableLayout = function (List, DivName, Data, key) {
        var ListViewContainer = $(`#cont_${this.Ctrl.EbSid} .${DivName}`);
        //$(`#cont_${this.Ctrl.EbSid} .${DivName}`).append($(document.createElement("table").attr("id", key + "-table")));
        ListViewContainer.append(`<div class='event-list-pane' id='${key}-list-cont'></div>`);

        List.forEach(function (rowItem, rowindex) {
            var tbody = $(document.createElement("tbody"));
            let tr = $(document.createElement("tr"));
            tr.attr("row", rowindex);
            rowItem.ColumnLayouts.$values.forEach(function (item, columnindex) {
                // let Width = Math.round(item.ColumnWidth * $(".listviewlayout table").width() / 100);
                if (!item.IsHidden) {
                    if (item.DataColumn) {
                        switch (item.DataColumn.EbType) {

                            case "ListViewDataColumn":
                                //let data = Data.Datarow.find((x) => x.ColumnName == item.DataColumn.ColumnName);
                                tr.append(`<td class="list-td" colspan=${item.ColumnSpan} rowspan=${item.RowSpan} row=${rowindex} column=${columnindex} style="width:${item.ColumnWidth}%"> 
                                <div class='styl' name="${item.DataColumn.ColumnName}" column="${columnindex}" row="${rowindex}">
                                           <span style='${GetFontCss(item.DataColumn.Font)}'> ${this.TypeConvertion(Data[item.DataColumn.ColumnName])}</span>
                                        </div>
                                </td>`);
                                break;

                            case "ListViewButton":
                                //let idObject = Data.Datarow.find((x) => x.ColumnName == item.DataColumn.ColumnName)
                                tr.append(`<td class="list-td" colspan=${item.ColumnSpan} rowspan=${item.RowSpan} data=${Data[item.DataColumn.ColumnName]} row=${rowindex} column=${columnindex} style="width:${item.ColumnWidth}%"> 
                                <div class='list-view-form-link' name="${item.DataColumn.ButtonText}"  style="${GetStyle(item.DataColumn)}${GetFontCss(item.DataColumn.Font)}">
                                   ${item.DataColumn.ButtonText}
                                </div></td>`);
                                break;

                            case "ListViewFilterButton":
                                let FnName = `ListViewFilterButton${rowindex}${columnindex}`;
                                if (item.DataColumn.FilterScript) {
                                    this.CreateFilterFunction(FnName, item.DataColumn);
                                }
                                tr.append(`<td class="list-td ${DivName}-td" colspan=${item.ColumnSpan} rowspan=${item.RowSpan} row=${rowindex} column=${columnindex} style="width:${item.ColumnWidth}%"> 
                                    <div class='user-side-list-view-filter-btn'  id=${FnName ? FnName : ""}  name="${item.DataColumn.ButtonText}" column-name=${item.DataColumn.FilterColumName} style=${GetStyle(item.DataColumn)}>
                                       ${item.DataColumn.ButtonText}
                                       <div class="count"> (${window[FnName](this.EventObjList, item.DataColumn).length })</div>
                                    </div></td>`);
                                break;
                            default:
                                tr.append(`<td class="list-td ${DivName}-td" colspan=${item.ColumnSpan} rowspan=${item.RowSpan} row=${rowindex} column=${columnindex} style="width:${item.ColumnWidth}%"></td>`);
                                break;
                        }
                    }
                    else {
                        tr.append(`<td class="list-td ${DivName}-td" colspan=${item.ColumnSpan} rowspan=${item.RowSpan} row=${rowindex} column=${columnindex} style="width:${item.ColumnWidth}%"></td>`);
                    }
                }

                tbody.append(tr);
            }.bind(this));
            if (DivName == "listviewlayout") {
                //ListViewContainer.append(html);


                $(`#${key}-list-cont`).append($(document.createElement("table")).append(tbody));
                //$(`#${key}-list-cont`).append(`<i class="fa fa-caret-right" aria-hidden="true"></i>`);
            }
            else {
                //ListViewContainer.append(`<div class='event-filter-pane' id='${key}-list-cont'></div>`);
                $(`#${key}-list-cont`).append($(document.createElement("table")).append(tbody));
                //$(`#${key}-list-cont`).append(`<i class="fa fa-caret-right" aria-hidden="true"></i>`);
            }

        }.bind(this));

        //$(`#${data}`).on("click", this.CallFilterFunctions.bind(this))
        $(".user-side-list-view-filter-btn").off("click").on("click", this.FilterList.bind(this))
    }
    this.FilterList = function (e) {
        let id = $(e.target).closest(".user-side-list-view-filter-btn").attr("id");
        let row = $(e.target).closest("td").attr("row");
        let column = $(e.target).closest("td").attr("column");
        let datacolumn = this.Ctrl.ListViewFilterLayout.RowLayouts.$values[row].ColumnLayouts.$values[column].DataColumn
        if (datacolumn.FilterScript) {
            this.InitListViewContainer(window[id](this.EventObjList, datacolumn));
        }
        else if (datacolumn.FilterColumValue == "") {
            this.InitListViewContainer(this.EventObjList);
        }
        else {
            this.InitListViewContainer(this.EventObjList.filter((x) => x[datacolumn.FilterColumName] == [datacolumn.FilterColumValue]));
        }
    }
    //create filter function using EbScript
    this.CreateFilterFunction = function (FnName, Ctrl) {
        let script = $(document.createElement('script'));
        let ebscript = atob(Ctrl.FilterScript.Code);
        script.append(`function ${FnName}(Data,Control){
            debugger;
            this.Data = Data;
            this.Control = Control;
            return this.Data.filter( function(dataRow){${ebscript};}.bind(this));
        }`);
        $("head").append(script);
    }

    this.TypeConvertion = function (data) {
        switch (typeof(data)) {
            case "string":
                return data;
                break;
            case "integer":
                return data;
                break;
            case "object":
                if (data instanceof Date)
                    return moment(data).format(ebcontext.user.Preference.ShortDatePattern);
               
                break;
        }
    };
    this.CallExternalform = function (e) {
        let row = $(e.target).closest("td").attr("row");
        let column = $(e.target).closest("td").attr("column");
        let formRefid = this.Ctrl.ListViewLayout.RowLayouts.$values[row].ColumnLayouts.$values[column].ListViewButton.FormRefId
        ebcontext.webform.PopupForm(formRefid, btoa(JSON.stringify([{ Name: 'id', Type: 7, Value: $(e.target).closest("td").attr("data-id") }])), 1,
            {
                srcCxt: this.Renderer.__MultiRenderCxt,
                initiator: this.Ctrl,
                locId: this.Renderer.getLocId(),
                editModePrefill: true,
                editModeAutoSave: true,
                Callback: function (dataId, isSaved, dataAsParams) {
                    if (!isSaved) {
                        info.revert();
                    }
                }

            });
    }

    this.Init = function () {
        $(`#cont_${this.Ctrl.EbSid} .eb-ctrl-label`).remove();
        $(`#cont_${this.Ctrl.EbSid} .eb-list-view-continer`).removeClass("eb-list-view-continer").addClass("list-view-continer-userside")
        //this.InitListViewContainer();
        if (this.Ctrl.DataSourceId !== "") {
            this.InitCalendar();
        }

    };
    this.Init();
}



var GetStyle = function (obj) {
    let style = "";
    if (obj.BackgroundColor)
        style += "background-color:" + obj.BackgroundColor + ";"
    if (obj.BorderRadius)
        style += "border-radius:" + obj.BorderRadius + "px;";
    if (obj.BorderColor)
        style += "border-color:" + obj.BorderColor + ";"
    if (obj.ForeColor)
        style += "color:" + obj.ForeColor + ";"
    if (obj.Padding)
        style += "padding:" + obj.Padding + "px;"
    if (obj.Margin)
        style += "margin:" + obj.Margin + "px;"

    return style;
}