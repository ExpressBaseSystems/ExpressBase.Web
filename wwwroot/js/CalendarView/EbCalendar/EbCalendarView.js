var EbCalendarView = function (_ctrl, _renderer) {

    this.Ctrl = _ctrl;
    this.Renderer = _renderer;
    this.CalenderFormRefId = this.Renderer.FormRefId;
    this.CalendarObj;
    this.EventArr = [];

    this.InitCalendar = function () {
        //var calendarEl = $('#calendar').first();
        var calendarEl = document.getElementById(`${this.Ctrl.EbSid}`);
        let calendarViewConfigStr = [];
        if (this.Ctrl.MultiMonthYear)
            calendarViewConfigStr.push("multiMonthYear");
        if (this.Ctrl.DayGridYear)
            calendarViewConfigStr.push("dayGridYear");
        if (this.Ctrl.DayGridMonth)
            calendarViewConfigStr.push("dayGridMonth");
        if (this.Ctrl.TimeGridWeek)
            calendarViewConfigStr.push("timeGridWeek");
        if (this.Ctrl.TimeGridDay)
            calendarViewConfigStr.push("timeGridDay");
        if (this.Ctrl.ListWeek)
            calendarViewConfigStr.push("listWeek");

        this.CalendarObj = new FullCalendar.Calendar(calendarEl, {
            //height: '100%',
            expandRows: true,
            slotMinTime: this.Ctrl.SlotMinTime,
            slotMaxTime: this.Ctrl.SlotMaxTime,
            slotDuration: this.Ctrl.SlotDuration,
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
            selectable: this.Ctrl.Selectable,
            selectMirror: this.Ctrl.Selectable,
            slotEventOverlap: false,
            eventConstraint: {
                start: moment().format('YYYY-MM-DD'),
                end: '2100-01-01'
            },
            select: function (arg) {
                debugger;
                this.AddNewEvent(arg);
            }.bind(this),
            editable: this.Ctrl.Editable,
            eventClick: function (arg) {
                debugger;
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
        $(`[ctype="Calendar"] .eb-ctrl-label`).remove();
    };

    this.DropForm = function (info) {
        ebcontext.webform.PopupForm(this.Ctrl.FormRefId, btoa(JSON.stringify([{ Name: 'id', Type: 7, Value: info.event.id }])), 1,
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
        ebcontext.webform.PopupForm(this.Ctrl.FormRefId, btoa(JSON.stringify([{ Name: 'start_date', Type: 6, Value: moment(info.start) }, { Name: 'end_date', Type: 6, Value: moment(info.end) }])), 2,
            {
                srcCxt: this.Renderer.__MultiRenderCxt,
                initiator: this.Ctrl,
                locId: this.Renderer.getLocId(),
                Callback: function (dataId, isSaved, dataAsParams) {
                    if (isSaved) {
                        debugger;
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
        ebcontext.webform.PopupForm(this.Ctrl.FormRefId, btoa(JSON.stringify([{ Name: 'id', Type: 7, Value: info.event.id }])), 1,
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
    };
    this.Init = function () {
        this.InitCalendar();
    };
    this.Init();
};