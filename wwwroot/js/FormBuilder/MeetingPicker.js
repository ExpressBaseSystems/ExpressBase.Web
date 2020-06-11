var DatePick;
var meetingPicker = function (ctrl, ctrlOpts , type) {

    this.type = type;
    this.Url = "../EbMeeting/GetAllMeetingSlots";
    if (this.type === "Bot") {
        this.Url = "../Boti/GetAllMeetingSlots";
    }
    this.ctrl = ctrl;
    this.ctrlOpts = ctrlOpts;
    this.AllSlots = {};

    this.getTimeSlots = function () {
        let meet = 1;
        let date = $(`#${this.ctrl.EbSid}_date`).val();
        $.post(this.Url , { MeetingId: meet, date: date }, this.AppendSlots.bind(this));
    };

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
            Timestr += time.split(":")[0]+ ":" + time.split(":")[1] + " PM";
        }
        return Timestr;
    };

    this.AppendSlots = function (data) {
        this.AllSlots = JSON.parse(data);
        let html = "";
        if (this.AllSlots.length === 1 & this.AllSlots[0].Slot_id == "") {
            html += `<div> empty slots </div></br>
                <button id="add_slot" class="add slot"> Add Slots</button>`;
        }
        else {
            $.each(this.AllSlots, function (index, obj) {
                if (obj.Time_from !== "" && obj.Time_to !== "") {
                    let timeFrom = this.TimeFormat(this.AllSlots[index].Time_from);
                    let timeTo = this.TimeFormat(this.AllSlots[index].Time_to);
                    if (this.type === "Bot") {
                        if (this.AllSlots[index].IsHide) {
                            html += `<div id="${this.AllSlots[index].Slot_id}" m-id="${this.AllSlots[index].Meeting_Id}" is-approved="${this.AllSlots[index].Is_approved}"
                    class="solts-div blocked-slot"> <i class="fa fa-dot-circle-o" aria-hidden="true"></i> ${timeFrom} </div>`;
                        }
                        else {
                            html += `<div id="${this.AllSlots[index].Slot_id}" m-id="${this.AllSlots[0].Meeting_Id}"  is-approved="${this.AllSlots[index].Is_approved}"
                    class="solts-div unblocked-slot"> <i class="fa fa-dot-circle-o" aria-hidden="true"></i> ${timeFrom} </div>`;
                        }
                    }
                    else {
                        if (this.AllSlots[index].IsHide) {
                            html += `<div id="${this.AllSlots[index].Slot_id}" m-id="${this.AllSlots[index].Meeting_Id}" is-approved="${this.AllSlots[index].Is_approved}"
                    class="solts-div blocked-slot"> <i class="fa fa-dot-circle-o" aria-hidden="true"></i> ${timeFrom} to ${timeTo} </div>`;
                        }
                        else {
                            html += `<div id="${this.AllSlots[index].Slot_id}" m-id="${this.AllSlots[0].Meeting_Id}"  is-approved="${this.AllSlots[index].Is_approved}"
                    class="solts-div unblocked-slot"> <i class="fa fa-dot-circle-o" aria-hidden="true"></i> ${timeFrom} to ${timeTo} </div>`;
                        }
                    }
                }
            }.bind(this));
        }
        if (this.type === "Bot") {
            $(`#${this.ctrl.EbSid} .picker-cont`).empty().append(html);
        } else {
            $(`#cont_${this.ctrl.EbSid} .picker-cont`).empty().append(html);
        }
        $(".unblocked-slot").off("click").on("click", this.PickMeeting.bind(this));
        $("#add_slot").off("click").on("click", this.addSlot.bind(this));
    };
    this.addSlot = function () {
        this.SlotDetails = {};
        this.SlotDetails.Date = $(`#${this.ctrl.EbSid}_date`).val();
        $.post("../EbMeeting/AddMeetingTemp", { obj: this.SlotDetails }, this.addSlotSuccess.bind(this));
    };

    this.addSlotSuccess = function (data) {

    };



    this.PickMeeting = function (e) {
        let id = e.target.id;
        let time = e.target.textContent.trim();
        $(`#${this.ctrl.EbSid_CtxId}_slot_val`).val(id).trigger("change");
        $(`#${this.ctrl.EbSid_CtxId}_slot_time`).val(time);
        $(`#${this.ctrl.EbSid}_slot_change`).trigger("click");

       // this.SlotDetails = {};
       // this.SlotDetails.UserId = 1;
       // this.SlotDetails.RoleId = 1;
       // this.SlotDetails.UserGroupId = 1;
       // this.SlotDetails.Confirmation = 1;
       // this.SlotDetails.MeetingScheduleId = e.target.getAttribute("m-id");
       // this.SlotDetails.ApprovedSlotId = e.target.getAttribute("id");
       // this.SlotDetails.Is_approved = e.target.getAttribute("is-approved");
       // this.SlotDetails.StartDate = "2020-04-07";
       // this.SlotDetails.Name = "Nithin"
       // this.SlotDetails.Email = "Nithinmosco@gmail.com"
       // this.SlotDetails.PhoneNum = "+917565758585657"
       // this.SlotDetails.TypeOfUser = 2;
       // this.SlotDetails.Participant_type = 2;
       //// $.post("../Webform/UpdateMeetingFromAttendee", { Obj: this.SlotDetails ,}, this.PickMeetingSuccess.bind(this));
    };

    this.InitDatePicker = function () {
        DatePick = $(`#${this.ctrl.EbSid}_datepicker`).datepicker({
            dateFormat: "yy-mm-dd",
            showOtherMonths: true,
            minDate: 0,
            onSelect: function (date) {
                $(`#${this.ctrl.EbSid}_date`).val(date);
                $(`#${this.ctrl.EbSid}_date_change`).trigger("click");
                this.getTimeSlots();
            }.bind(this),
            changeYear: false,
            selectOtherMonths: true,
            beforeShowDay: function (date) {
                var day = date.getDay();
                return [(day != 5), ''];
            }
        });
    }
    this.datechanged = function () {
        //alert(DatePick.getDate());
        var abc = $(`#${this.ctrl.EbSid}_datepicker`).datepicker("getDate");
        alert(abc); 
    };

    this.init = function () {
        $(`#${this.ctrl.EbSid}_date_change`).on("click", function () { $(`#${this.ctrl.EbSid}_datepicker`).slideToggle(400); }.bind(this));
        $(`#${this.ctrl.EbSid}_slot_change`).on("click", function () { $(`#${this.ctrl.EbSid}_picker-cont`).slideToggle(400); }.bind(this));
        this.InitDatePicker();
        this.getTimeSlots();

    };
    this.init();

}

//var jsDate = $('#your_datepicker_id').datepicker('getDate');
//if (jsDate !== null) { // if any date selected in datepicker
//    jsDate instanceof Date; // -> true
//    jsDate.getDate();
//    jsDate.getMonth();
//    jsDate.getFullYear();
//}