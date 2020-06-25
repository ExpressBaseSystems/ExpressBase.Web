var DatePick;
var meetingScheduler = function (ctrl, ctrlOpts, type) {
    this.Ctrl = ctrl;
    this.type = type;
    this.SlotList = [];
    this.MeetingScheduleObj = {
        Title: '', Description: '', Location: '', IsSingleMeeting: 'T', IsMultipleMeeting: 'F', Date: '',
        TimeFrom: '', TimeTo: '', Duration: '', MaxHost: 1, MinHost: 1, MaxAttendee: 1, MinAttendee: 1,
        EligibleHosts: '', EligibleAttendees: '', Host: '', Attendee: '', IsRecuring: 'F', DayCode: 0, MeetingOpts: 1,
        SlotList: this.SlotList ,
    };
    this.UsersList = {};
    this.UsersList = ctrl.UsersList;
    var _UsrArr = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: $.map(this.UsersList, function (name, userid) {
            return { id: userid, name: name };
        }.bind(this))
    });
    _UsrArr.initialize();

    var temp = $(`#${this.Ctrl.EbSid}_host_list`).tagsinput({
        typeaheadjs: [
            {
                highlight: false
            },
            {
                name: 'usersname',
                displayKey: 'name',
                //valueKey: 'id',
                source: _UsrArr.ttAdapter()
            }
        ],
        itemValue: "id",
        itemText: "name",
        freeInput: false
    });
    var temp2 = $(`#${this.Ctrl.EbSid}_attendee_list`).tagsinput({
        typeaheadjs: [
            {
                highlight: false
            },
            {
                name: 'usersname',
                displayKey: 'name',
                //valueKey: 'id',
                source: _UsrArr.ttAdapter()
            }
        ],
        itemValue: "id",
        itemText: "name",
        freeInput: false
    });
    var temp3 = $(`#${this.Ctrl.EbSid}_eligible_host_list`).tagsinput({
        typeaheadjs: [
            {
                highlight: false
            },
            {
                name: 'usersname',
                displayKey: 'name',
                //valueKey: 'id',
                source: _UsrArr.ttAdapter()
            }
        ],
        itemValue: "id",
        itemText: "name",
        freeInput: false
    });
    var temp4 = $(`#${this.Ctrl.EbSid}_eligible_attendee_list`).tagsinput({
        typeaheadjs: [
            {
                highlight: false
            },
            {
                name: 'usersname',
                displayKey: 'name',
                //valueKey: 'id',
                source: _UsrArr.ttAdapter()
            }
        ],
        itemValue: "id",
        itemText: "name",
        freeInput: false
    });

    //this.txtLocations.on('itemAdded', function (event) {
    //    //console.log(event.item);
    //    if (getKeyByVal(this.LocCntr.curItems, event.item.id)) {
    //        this.LocCntr.options.deleted.splice(this.LocCntr.options.deleted.indexOf(this.LocCntr.curItems[event.item.id]), 1);
    //    }
    //    else {
    //        this.LocCntr.options.added.push(event.item.id);
    //    }
    //}.bind(this));

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
        this.IsSingleMeeting = $(`#${this.Ctrl.EbSid}_single`);
        this.IsMultipleMeeting = $(`#${this.Ctrl.EbSid}_multiple`);
        this.MeetingDate = $(`#${this.Ctrl.EbSid}_meeting-date`);
        this.TimeFrom = $(`#${this.Ctrl.EbSid}_time-from`);
        this.TimeTo = $(`#${this.Ctrl.EbSid}_time-to`);
        this.MaxHost = $(`#${this.Ctrl.EbSid}_max-host`);
        this.MinHost = $(`#${this.Ctrl.EbSid}_min-host`);
        this.MaxAttendee = $(`#${this.Ctrl.EbSid}_max-attendee`);
        this.MinAttendee = $(`#${this.Ctrl.EbSid}_min-attendee`);
        this.EligibleHosts = $(`#${this.Ctrl.EbSid}_eligible_host_list`);
        this.FixedHost = $(`#${this.Ctrl.EbSid}_host_list`);
        this.EligibleAttendees = $(`#${this.Ctrl.EbSid}_eligible_attendee_list`);
        this.FixedAttendee = $(`#${this.Ctrl.EbSid}_attendee_list`);

        this.Title.off('change').on("change", function (e) {
            this.MeetingScheduleObj.Title = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));

        this.Description.on("change", function (e) {
            this.MeetingScheduleObj.Description = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));

        this.IsSingleMeeting.on("change", function (e) {
            this.MeetingScheduleObj.IsSingleMeeting = 'T';
            this.MeetingScheduleObj.IsMultipleMeeting = 'F';
            $(`#cont_${this.Ctrl.EbSid} .meeting-duration`).hide();
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        this.IsMultipleMeeting.on("change", function (e) {
            this.MeetingScheduleObj.IsSingleMeeting = 'F';
            this.MeetingScheduleObj.IsMultipleMeeting = 'T';
            $(`#cont_${this.Ctrl.EbSid} .meeting-duration`).show();
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        this.MeetingDate.on("change", function (e) {
            this.MeetingScheduleObj.Date = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        this.TimeFrom.on("change", function (e) {
            this.MeetingScheduleObj.TimeFrom = e.target.value;
            this.drawSlots();
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj));
        }.bind(this));
        this.TimeTo.on("change", function (e) {
            this.MeetingScheduleObj.TimeTo = e.target.value;
            this.drawSlots();
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        this.MaxHost.on("change", function (e) {
            this.MeetingScheduleObj.MaxHost = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        this.MinHost.on("change", function (e) {
            this.MeetingScheduleObj.MinHost = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        this.MaxAttendee.on("change", function (e) {
            this.MeetingScheduleObj.MaxAttendee = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        this.MinAttendee.on("change", function (e) {
            this.MeetingScheduleObj.MinAttendee = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));

        this.EligibleHosts.on("change", function (e) {
            this.MeetingScheduleObj.EligibleHosts = e.target.value;
            this.SetMeetingOption();
            this.drawSlots();
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        this.EligibleAttendees.on("change", function (e) {
            this.MeetingScheduleObj.EligibleAttendees = e.target.value;
            this.SetMeetingOption();
            this.drawSlots();
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        this.FixedHost.on("change", function (e) {
            this.MeetingScheduleObj.Host = e.target.value;
            $(`#${this.Ctrl.EbSid}_max-host`).val(this.MeetingScheduleObj.Host.split(",").length);
            this.SetMeetingOption();
            this.drawSlots();
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        this.FixedAttendee.on("change", function (e) {
            this.MeetingScheduleObj.Attendee = e.target.value;
            $(`#${this.Ctrl.EbSid}_max-attendee`).val(this.MeetingScheduleObj.Attendee.split(",").length);
            this.SetMeetingOption();
            this.drawSlots();
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
    this.drawSlots = function () {
        this.SlotList = [];
        html = '';
        if (this.MeetingScheduleObj.IsSingleMeeting == 'T' && this.MeetingScheduleObj.TimeFrom != '' && this.MeetingScheduleObj.TimeTo !== '') {
            let timefr = this.TimeFormat(this.MeetingScheduleObj.TimeFrom);
            let timeto = this.TimeFormat(this.MeetingScheduleObj.TimeTo);
            html += `<div id="1" m-id="1" class="slot"> 
                <i class="fa fa-dot-circle-o" aria-hidden="true"></i> ${timefr} to ${timeto} </div>`;
            $(`#${this.Ctrl.EbSid}_meeting_slots`).empty().append(html);
            var Obj = {
                Position: 1,TimeFrom: `${this.MeetingScheduleObj.TimeFrom}`, TimeTo: `${this.MeetingScheduleObj.TimeTo}`,
                FixedHost: '', FixedAttendee: '', EligibleHosts: '', EligibleAttendees: ''
            }
            Obj.EligibleAttendees = this.EligibleAttendees.val();
            Obj.EligibleHosts = this.EligibleHosts.val();
            Obj.FixedAttendee = this.FixedAttendee.val();
            Obj.FixedHost = this.FixedHost.val();
            this.SlotList.push(Obj);
            this.MeetingScheduleObj.SlotList = this.SlotList;
        }
        else if (this.MeetingScheduleObj.IsSingleMeeting == 'F') {

        }
    };

    this.SetMeetingOption = function () {
        if (this.FixedAttendee.val() !== '' && this.FixedHost.val() !== '') {
            this.MeetingScheduleObj.MeetingOpts = 1;
        }
        else if (this.FixedHost.val() != '' && this.FixedAttendee.val() === '' ) {
            this.MeetingScheduleObj.MeetingOpts = 2;
        }
        else if (this.FixedHost.val() === '' && this.FixedAttendee.val() !== '') {
            this.MeetingScheduleObj.MeetingOpts = 3;
        }
        else if (this.FixedHost.val() === '' && this.FixedAttendee.val() === '') {
            this.MeetingScheduleObj.MeetingOpts = 4;
        }
    };

    this.init = function () {
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