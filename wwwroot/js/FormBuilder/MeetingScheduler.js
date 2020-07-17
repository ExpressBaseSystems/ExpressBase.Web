var DatePick;
var meetingScheduler = function (ctrl, ctrlOpts, type) {
    this.Ctrl = ctrl;
    this.type = type;
    this.SlotIncr = 0;
    this.SlotList = [];
    this.MeetingScheduleObj = {
        Title: '', Description: '', Location: '', Integration:'', IsSingleMeeting: 'T', IsMultipleMeeting: 'F', Date: '',
        TimeFrom: '', TimeTo: '', Duration: '', MaxHost: 1, MinHost: 1, MaxAttendee: 1, MinAttendee: 1,
        EligibleHosts: '', EligibleAttendees: '', Host: '', Attendee: '', IsRecuring: 'F', DayCode: 0, MeetingType: this.Ctrl.MeetingType,
        SlotList: this.SlotList
    };
    //this.ParticipantsList = {}
    //this.ParticipantsList = JSON.parse(ctrl.ParticipantsList);
    this.HostParticipantsList = JSON.parse(ctrl.HostParticipantsList);
    this.AttendeeParticipantsList = JSON.parse(ctrl.AttendeeParticipantsList);
    var _UsrArrHost = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: $.map(this.HostParticipantsList, function (obj, index) {
            return { id: obj.Id, name: obj.Name, type: obj.Type };
        }.bind(this))
    });
    _UsrArrHost.initialize();

    var _UsrArrAttendee = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: $.map(this.AttendeeParticipantsList, function (obj, index) {
            return { id: obj.Id, name: obj.Name, type: obj.Type };
        }.bind(this))
    });
    _UsrArrAttendee.initialize();

    this.tagsinputFn = function () {
        var temp = $(`.tb-host`).tagsinput({
            typeaheadjs: [
                {
                    highlight: false
                },
                {
                    name: 'usersname',
                    displayKey: 'name',
                    //valueKey: 1,
                    source: _UsrArrHost.ttAdapter()
                }
            ],
            itemValue: "id",
            itemText: function (item) {
                return item.name;
            }.bind(this),
            freeInput: false
        });
        var temp2 = $(`.tb-attendee`).tagsinput({
            typeaheadjs: [
                {
                    highlight: false
                },
                {
                    name: 'usersname',
                    displayKey: 'name',
                    //valueKey: 1,
                    source: _UsrArrAttendee.ttAdapter()
                }
            ],
            itemValue: "id",
            itemText: function (item) {
                return item.name;
            }.bind(this),
            freeInput: false
        });
        $('.tb-host').on('itemAdded', function (event) {
            let pos = event.target.closest('tr').getAttribute("data-id");
            this.SlotList[pos].Hosts.push(event.item);
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        $('.tb-attendee').on('itemAdded', function (event) {
            let pos = event.target.closest('tr').getAttribute("data-id");
            this.SlotList[pos].Attendees.push(event.item);
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        $('.tb-attendee').on('itemRemoved', function (event) {
            // event.item: contains the item
            let pos = event.target.closest('tr').getAttribute("data-id");
            const index = this.SlotList[pos].Attendees.indexOf(event.item);
            if (index > -1) {
                this.SlotList[pos].attendees.splice(index, 1);
            }
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));

        $('.tb-host').on('itemRemoved', function (event) {
            // event.item: contains the item
            let pos = event.target.closest('tr').getAttribute("data-id");
            const index = this.SlotList[pos].Hosts.indexOf(event.item);
            if (index > -1) {
                this.SlotList[pos].Hosts.splice(index, 1);
            }
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
    };


    this.tagsinputFn();

    //var temp3 = $(`.eligible-userids`).tagsinput({
    //    typeaheadjs: [
    //        {
    //            highlight: false
    //        },
    //        {
    //            name: 'usersname',
    //            displayKey: 'name',
    //            //valueKey: 'id',
    //            source: _UsrArr.ttAdapter()
    //        }
    //    ],
    //    itemValue: "id",
    //    itemText: "name",
    //    freeInput: false
    //});

    //this.txtLocations.on('itemAdded', function (event) {
    //    //console.log(event.item);
    //    if (getKeyByVal(this.LocCntr.curItems, event.item.id)) {
    //        this.LocCntr.options.deleted.splice(this.LocCntr.options.deleted.indexOf(this.LocCntr.curItems[event.item.id]), 1);
    //    }
    //    else {
    //        this.LocCntr.options.added.push(event.item.id);
    //    }
    //}.bind(this));

    this.AddParticipantList = function (obj) {

        if (obj == null) {
            var Obj = {};
            this.SlotList.push(Obj);
        }
        else {

        }
    };

    //public int Position { get; set; }
    // public string TimeFrom { get; set; }
    // public string TimeTo { get; set; }
    // public string EligibleHosts { get; set; }
    // public string EligibleAttendees { get; set; }
    // public string FixedHost { get; set; }
    // public string FixedAttendee { get; set; }
    // public List < Participants > Hosts { get; set; }
    // public List < Participants > Attendees { get; set; }
    this.AddSlotList = function () {
        SlotObj = {};
        SlotObj.Position = this.SlotIncr;
        SlotObj.TimeFrom = '';
        SlotObj.TimeTo = '';
        SlotObj.Hosts = [];
        SlotObj.Attendees = [];
        this.SlotList.push(SlotObj);
    };
    this.AddSlotList();
    var jsonStr = $(`#${this.Ctrl.EbSid}_MeetingJson`);
    jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");

    this.InitDatePicker = function () {
        DatePick = $(`#${this.Ctrl.EbSid}_meeting-date`).datepicker({
            dateFormat: "yy-mm-dd",
            showOtherMonths: true,
            minDate: 0,
            changeYear: false,
            selectOtherMonths: true,
        });
    }

    this.initSpinner = function () {
        //$(`#${this.Ctrl.EbSid}_max-host`).spinner();
        //$(`#${this.Ctrl.EbSid}_min-host`).spinner();
        //$(`#${this.Ctrl.EbSid}_max-attendee`).spinner();
        //$(`#${this.Ctrl.EbSid}_max-attendee`).spinner();
        $(`.meeting-spinner`).spinner();

    }
    this.OnChangeUpdate = function () {
        this.Title = $(`#${this.Ctrl.EbSid}_meeting-title`);
        this.Description = $(`#${this.Ctrl.EbSid}_description`);
        this.Location = $(`#${this.Ctrl.EbSid}_location`);
        this.Integration = $(`#${this.Ctrl.EbSid}_integration`);
        //this.IsSingleMeeting = $(`#${this.Ctrl.EbSid}_single`);
        //this.IsMultipleMeeting = $(`#${this.Ctrl.EbSid}_multiple`);
        this.MeetingDate = $(`#${this.Ctrl.EbSid}_meeting-date`);
        this.TimeFrom = $(`.time-from`);
        this.TimeTo = $(`.time-to`);
        this.MaxHost = $(`#${this.Ctrl.EbSid}_max-host`);
        this.MinHost = $(`#${this.Ctrl.EbSid}_min-host`);
        this.MaxAttendee = $(`#${this.Ctrl.EbSid}_max-attendee`);
        this.MinAttendee = $(`#${this.Ctrl.EbSid}_min-attendee`);

        this.Host = $(`.tb-host`);
        this.Attendee = $(`.tb-attendee`);
        this.Duration = $(`#${this.Ctrl.EbSid}_duration`);

        this.Title.off('change').on("change", function (e) {
            this.MeetingScheduleObj.Title = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));

        this.Description.off('change').on("change", function (e) {
            this.MeetingScheduleObj.Description = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));

        //this.IsSingleMeeting.on("change", function (e) {
        //    this.MeetingScheduleObj.IsSingleMeeting = 'T';
        //    this.MeetingScheduleObj.IsMultipleMeeting = 'F';
        //    $(`#cont_${this.Ctrl.EbSid} .meeting-duration`).hide();
        //    //this.drawSlots();
        //    jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        //}.bind(this));
        //this.IsMultipleMeeting.on("change", function (e) {
        //    this.MeetingScheduleObj.IsSingleMeeting = 'F';
        //    this.MeetingScheduleObj.IsMultipleMeeting = 'T';
        //    $(`#cont_${this.Ctrl.EbSid} .meeting-duration`).show();
        //    //this.drawSlots();
        //    jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        //}.bind(this));
        this.MeetingDate.off('change').on("change", function (e) {
            this.MeetingScheduleObj.Date = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        this.Location.off('change').on("change", function (e) {
            this.MeetingScheduleObj.Location = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        this.Integration.off('change').on("change", function (e) {
            this.MeetingScheduleObj.Integration = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        this.TimeFrom.off('change').on("change", function (e) {
            let pos = e.target.closest('tr').getAttribute("data-id");
            this.SlotList[pos].TimeFrom = e.target.value;
            //this.drawSlots();
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj));
        }.bind(this));
        this.TimeTo.off('change').on("change", function (e) {
            let pos = e.target.closest('tr').getAttribute("data-id");
            this.SlotList[pos].TimeTo = e.target.value;
            //this.drawSlots();
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        this.MaxHost.off('change').on("change", function (e) {
            this.MeetingScheduleObj.MaxHost = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        this.MinHost.off('change').on("change", function (e) {
            this.MeetingScheduleObj.MinHost = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        this.MaxAttendee.off('change').on("change", function (e) {
            this.MeetingScheduleObj.MaxAttendee = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        this.MinAttendee.off('change').on("change", function (e) {
            this.MeetingScheduleObj.MinAttendee = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));

        //this.Host.on("change", function (e) {
        //    this.MeetingScheduleObj.Host = e.target.value;
        //    //this.SetMeetingOption();
        //    jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        //}.bind(this));
        //this.Attendee.on("change", function (e) {
        //    this.MeetingScheduleObj.EligibleAttendees = e.target.value;
        //    //this.SetMeetingOption();
        //    jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        //}.bind(this));
        //this.FixedHost.on("change", function (e) {
        //    this.MeetingScheduleObj.Host = e.target.value;
        //    $(`#${this.Ctrl.EbSid}_max-host`).val(this.MeetingScheduleObj.Host.split(",").length);
        //    this.SetMeetingOption();
        //    this.slotValChange();
        //    jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        //}.bind(this));
        //this.FixedAttendee.on("change", function (e) {
        //    this.MeetingScheduleObj.Attendee = e.target.value;
        //    $(`#${this.Ctrl.EbSid}_max-attendee`).val(this.MeetingScheduleObj.Attendee.split(",").length);
        //    this.SetMeetingOption();
        //    this.slotValChange();
        //    jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        //}.bind(this));
        this.Duration.on("change", function (e) {
            this.MeetingScheduleObj.Duration = e.target.value;
            //this.SetMeetingOption();
            //this.drawSlots();
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));

        $(`#${this.Ctrl.EbSid}_recuring-days .checkbox-inline`).on("change", function (e) {
            let $chkd = $(`#${this.Ctrl.EbSid}_recuring-days input:checkbox:checked`);
            let _daysCode = 0;
            for (let i = 0; i < $chkd.length; i++) {
                _daysCode += Math.pow(2, $($chkd[i]).attr('data-code'));
                this.MeetingScheduleObj.DayCode = _daysCode;
            }
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
    }

    this.slotValChange = function () {
        if (this.MeetingScheduleObj.IsSingleMeeting == 'T' && this.MeetingScheduleObj.TimeFrom != '' && this.MeetingScheduleObj.TimeTo !== '') {

        }
        else {

        }
    };

    this.drawSlots = function () {
        this.SlotList = [];
        this.CurrentSlotId = 0;
        html = '';
        if (this.MeetingScheduleObj.IsSingleMeeting == 'T' && this.MeetingScheduleObj.TimeFrom != '' && this.MeetingScheduleObj.TimeTo !== '') {
            let timefr = this.TimeFormat(this.MeetingScheduleObj.TimeFrom);
            let timeto = this.TimeFormat(this.MeetingScheduleObj.TimeTo);
            html += `<tr><td>1</td>
                    <td>${timefr}</td>
                    <td>${timeto}</td>
                    <td><input type='text' id='${this.Ctrl.EbSid}_host_0' class='mc-input tb-slots'/></td>
                    <td><input type='text'  id='${this.Ctrl.EbSid}_attendee_0' class='mc-input tb-slots'/></td>
                    </tr>
                `;
            $(`#${this.Ctrl.EbSid}_slots tbody`).empty().append(html);
            var Obj = {
                Position: 1, TimeFrom: `${this.MeetingScheduleObj.TimeFrom}`, TimeTo: `${this.MeetingScheduleObj.TimeTo}`,
                FixedHost: '', FixedAttendee: '', EligibleHosts: '', EligibleAttendees: ''
            }
            Obj.EligibleAttendees = this.EligibleAttendees.val();
            Obj.EligibleHosts = this.EligibleHosts.val();
            Obj.FixedAttendee = this.FixedAttendee.val();
            Obj.FixedHost = this.FixedHost.val();
            this.SlotList.push(Obj);
            this.MeetingScheduleObj.SlotList = this.SlotList;
        }
        else if (this.MeetingScheduleObj.IsSingleMeeting == 'F' && this.MeetingScheduleObj.TimeFrom != '' && this.MeetingScheduleObj.TimeTo !== '') {
            let slotNum = 60;
            let timefr = this.TimeFormat(this.MeetingScheduleObj.TimeFrom);
            let timeto = this.TimeFormat(this.MeetingScheduleObj.TimeTo);
            let hr = (parseInt(this.MeetingScheduleObj.TimeTo.split(":")[0]) - parseInt(this.MeetingScheduleObj.TimeFrom.split(":")[0])) * 60;
            let min = parseInt(this.MeetingScheduleObj.TimeTo.split(":")[1]) - parseInt(this.MeetingScheduleObj.TimeFrom.split(":")[1]);
            let dur_time = parseInt(this.MeetingScheduleObj.Duration.split(":")[0]) * 60 + parseInt(this.MeetingScheduleObj.Duration.split(":")[1]);
            if (dur_time !== 0) slotNum = (hr + min) / dur_time;
            let t1 = this.MeetingScheduleObj.TimeFrom;
            for (let i = 0; i < slotNum; i++) {
                //let t1 = moment.utc(this.MeetingScheduleObj.TimeFrom, 'hh:mm').add((dur_time * i), 'minutes').format('hh:mm A');
                let t1 = moment(this.MeetingScheduleObj.TimeFrom, 'HH:mm').add((dur_time * i), 'minutes').format('HH:mm');
                //let t2 = moment.utc(this.MeetingScheduleObj.TimeFrom, 'hh:mm').add((dur_time * (i + 1)), 'minutes').format('hh:mm A');
                let t2 = moment(this.MeetingScheduleObj.TimeFrom, 'HH:mm').add((dur_time * (i + 1)), 'minutes').format('HH:mm');
                var Obj = {
                    Position: 1, TimeFrom: `${t1}`, TimeTo: `${t2}`,
                    FixedHost: '', FixedAttendee: '', EligibleHosts: '', EligibleAttendees: ''
                }
                Obj.EligibleAttendees = this.EligibleAttendees.val();
                Obj.EligibleHosts = this.EligibleHosts.val();
                Obj.FixedAttendee = this.FixedAttendee.val();
                Obj.FixedHost = this.FixedHost.val();
                this.SlotList.push(Obj);
                html += `<tr><td> ${i + 1}</td>
                    <td>${moment.utc(t1, 'hh:mm').format('hh:mm A')}</td>
                    <td>${moment.utc(t2, 'hh:mm').format('hh:mm A')}</td>
                    <td><input type='text' id='${this.Ctrl.EbSid}_host_0' class='mc-input tb-slots tb-host'/></td>
                    <td><input type='text'  id='${this.Ctrl.EbSid}_attendee_0' class='mc-input tb-slots tb-attendee'/></td>
                    </tr>`;
            }
            this.MeetingScheduleObj.SlotList = this.SlotList;
            $(`#${this.Ctrl.EbSid}_slots tbody`).empty().append(html);
        }
        this.tagsinputFn();
        //$(".tb-host").off("change").on("change", this.HostListUpdate.bind(this));
        //$(".tb-attendee").off("change").on("change", this.AttendeeListUpdate.bind(this));
    };

    //this.HostListUpdate = function (e) {
    //    let val = e.target.getAttribute("id").split("_")[2];
    //    this.SlotList[val].FixedHost = e.target.value;

    //};
    //this.AttendeeListUpdate = function (e) {
    //    let val = e.target.getAttribute("id").split("_")[2];
    //    this.SlotList[val].FixedAttendee = e.target.value;
    //};

    this.SlotIdChange = function (e) {
        alert(e.target.id);
    }
    //this.Convert12to24 = function (a) {
    //    let abc = a.trim().split(" ");
    //    if(abc = )
    //}
    //this.SetMeetingOption = function () {
    //    if (this.FixedAttendee.val() !== '' && this.FixedHost.val() !== '') {
    //        this.MeetingScheduleObj.MeetingOpts = 1;
    //    }
    //    else if (this.FixedHost.val() != '' && this.FixedAttendee.val() === '') {
    //        this.MeetingScheduleObj.MeetingOpts = 2;
    //    }
    //    else if (this.FixedHost.val() === '' && this.FixedAttendee.val() !== '') {
    //        this.MeetingScheduleObj.MeetingOpts = 3;
    //    }
    //    else if (this.FixedHost.val() === '' && this.FixedAttendee.val() === '') {
    //        this.MeetingScheduleObj.MeetingOpts = 4;
    //    }
    //};
    this.RemoveSlotFromTable = function (e) {
        let index = e.target.closest('tr').getAttribute("data-id");
        e.target.closest('tr').remove();
        if (index != undefined) {
            this.SlotList.splice(index, 1);
        }
        this.UpdateDataIds();
    };

    this.addSlot2Table = function () {
        this.SlotIncr = this.SlotIncr + 1;
        let str = `<tr data-id='${this.SlotIncr}'>
            <td  class='time'><input type='time' id='${this.Ctrl.EbSid}_time-from'   class='mc-input time-from' /></td>
            <td class='time'><input type='time' id='${this.Ctrl.EbSid}_time-to'   class='mc-input time-to' /></td>
            <td><input type='text' id='${this.Ctrl.EbSid}_host'  class='meeting-participants tb-host'/></td>
            <td><input type='text' id='${this.Ctrl.EbSid}_attendee'  class='meeting-participants tb-attendee'/></td>
            <td style='width:5rem;'><button id='${this.Ctrl.EbSid}_remove-slot${this.SlotIncr}' class='remove-slot'><i class='fa fa-window-close'></i></button></td></tr>`;
        this.AddSlotList();
        $(`#${this.Ctrl.EbSid}_slot-table tbody`).append(str);
        $(`.remove-slot`).off("click").on("click", this.RemoveSlotFromTable.bind(this));
        this.tagsinputFn();
        this.OnChangeUpdate();
    };

    this.UpdateDataIds = function () {
        var Tarr = $("table tbody tr");
        $.each(Tarr, function (index, obj) {
            $(obj).attr("data-id", index);
        });
        this.SlotIncr = Tarr.length - 1;
    };

    this.init = function () {
        $(`#${this.Ctrl.EbSid}_add-new-slot`).off("click").on("click", this.addSlot2Table.bind(this));
        this.InitDatePicker();
        this.OnChangeUpdate();
        //this.initSpinner();
        $(`#${this.Ctrl.EbSid}_duration`).combodate({ firstItem: 'name', minuteStep: 1 });
    };
    this.init();
    this.TimeFormat = function (time) {
        let Timestr = "";
        if (parseInt(time.split(":")[0]) < 12) {
            Timestr += time.split(":")[0] + ":" + time.split(":")[1] + " AM";
        }
        else if (parseInt(time.split(":")[0]) > 12) {
            Timestr += "0";
            Timestr += time.split(":")[0] - 12 + ":" + time.split(":")[1] + " PM";
        }
        else {
            Timestr += time.split(":")[0] + ":" + time.split(":")[1] + " PM";
        }
        return Timestr;
    };
}