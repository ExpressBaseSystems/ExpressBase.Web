var DatePick;
var meetingScheduler = function(ctrl, ctrlOpts, type) {
    this.Ctrl = ctrl;
    this.type = type;
    this.UsersList = {};
    this.UsersList= ctrl.UsersList;
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
    var temp = $(`#${this.Ctrl.EbSid}_attendee_list`).tagsinput({
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

    this.MeetingScheduleObj = {
        Title: '', Description: '', Location: '', IsSingleMeeting: 'T', IsMultipleMeeting: 'F', Date: '',
        TimeFrom: '', TimeTo: '', Duration: '', MaxHost: 1, MinHost: 1, MaxAttendee: 1, MinAttendee: 1,
        EligibleHosts: '', EligibleAttendees: '', Host: '', Attendee: '', IsRecuring: 'F', DayCode: 0,
    };
    var jsonStr = $(`#${this.Ctrl.EbSid}_MeetingJson`);
    jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
    this.InitDatePicker = function() {
        DatePick = $(`#${this.Ctrl.EbSid}_meeting-date`).datepicker({
            dateFormat: "yy-mm-dd",
            showOtherMonths: true,
            minDate: 0,
            changeYear: false,
            selectOtherMonths: true,
        });
    }
    this.initSpinner = function() {
        //$(`#${this.Ctrl.EbSid}_max-host`).spinner();
        //$(`#${this.Ctrl.EbSid}_min-host`).spinner();
        //$(`#${this.Ctrl.EbSid}_max-attendee`).spinner();
        //$(`#${this.Ctrl.EbSid}_max-attendee`).spinner();
        $(`.meeting-spinner`).spinner();

    }
    this.OnChangeUpdate = function() {
        $(`#${this.Ctrl.EbSid}_meeting-title`).off('change').on("change", function(e) {
            this.MeetingScheduleObj.Title = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        $(`#${this.Ctrl.EbSid}_description`).on("change", function(e) {
            this.MeetingScheduleObj.Description = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        $(`#${this.Ctrl.EbSid}_single`).on("change", function(e) {
            this.MeetingScheduleObj.IsSingleMeeting = 'T';
            this.MeetingScheduleObj.IsMultipleMeeting = 'F';
            $(`#cont_${this.Ctrl.EbSid} .meeting-duration`).hide();
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        $(`#${this.Ctrl.EbSid}_multiple`).on("change", function(e) {
            this.MeetingScheduleObj.IsSingleMeeting = 'F';
            this.MeetingScheduleObj.IsMultipleMeeting = 'T';
            $(`#cont_${this.Ctrl.EbSid} .meeting-duration`).show();
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        $(`#${this.Ctrl.EbSid}_meeting-date`).on("change", function(e) {
            this.MeetingScheduleObj.Date = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        $(`#${this.Ctrl.EbSid}_time-from`).on("change", function(e) {
            this.MeetingScheduleObj.TimeFrom = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj));
        }.bind(this));
        $(`#${this.Ctrl.EbSid}_time-to`).on("change", function(e) {
            this.MeetingScheduleObj.TimeTo = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        $(`#${this.Ctrl.EbSid}_max-host`).on("change", function(e) {
            this.MeetingScheduleObj.MaxHost = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        $(`#${this.Ctrl.EbSid}_min-host`).on("change", function(e) {
            this.MeetingScheduleObj.MinHost = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        $(`#${this.Ctrl.EbSid}_max-attendee`).on("change", function(e) {
            this.MeetingScheduleObj.MaxAttendee = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        $(`#${this.Ctrl.EbSid}_min-attendee`).on("change", function(e) {
            this.MeetingScheduleObj.MinAttendee = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));

        $(`#${this.Ctrl.EbSid}_eligible_host_list`).on("change", function(e) {
            this.MeetingScheduleObj.EligibleHosts = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        $(`#${this.Ctrl.EbSid}_eligible-attendee_list`).on("change", function(e) {
            this.MeetingScheduleObj.EligibleAttendees = e.target.value;
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        $(`#${this.Ctrl.EbSid}_host_list`).on("change", function(e) {
            this.MeetingScheduleObj.Host = e.target.value;
            $(`#${this.Ctrl.EbSid}_max-host`).val(this.MeetingScheduleObj.Host.split(",").length);
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        $(`#${this.Ctrl.EbSid}_attendee_list`).on("change", function(e) {
            this.MeetingScheduleObj.Attendee = e.target.value;
            $(`#${this.Ctrl.EbSid}_max-attendee`).val(this.MeetingScheduleObj.Attendee.split(",").length);
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));

        $(`#${this.Ctrl.EbSid}_recuring-days .checkbox-inline`).on("change", function(e) {
            let $chkd = $(`#${this.Ctrl.EbSid}_recuring-days input:checkbox:checked`);  
            let _daysCode = 0;
            for (let i = 0; i < $chkd.length; i++) {
                _daysCode += Math.pow(2, $($chkd[i]).attr('data-code'));
                this.MeetingScheduleObj.DayCode = _daysCode;
            }
            jsonStr.val(JSON.stringify(this.MeetingScheduleObj)).trigger("change");
        }.bind(this));
        
    }
    this.init = function() {
        this.InitDatePicker();
        this.OnChangeUpdate();
        //this.initSpinner();
        $(`#${this.Ctrl.EbSid}_duration`).combodate({ firstItem: 'name', minuteStep: 1 });

    };
    this.init();
}