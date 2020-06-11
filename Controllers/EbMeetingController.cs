using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using Newtonsoft.Json;
using ExpressBase.Common.Structures;
using ExpressBase.Objects;
using ExpressBase.Common.Objects;
using ExpressBase.Common.Extensions;
using System.Reflection;
using ExpressBase.Common.Objects.Attributes;
using ExpressBase.Common.Data;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.Constants;
using ExpressBase.Objects.Objects;
using System.IO;

namespace ExpressBase.Web.Controllers
{
    public class EbMeetingController : EbBaseIntCommonController
    {
        public EbMeetingController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }  // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }

        public string GetAllMeetingSlots(int MeetingId, string date)
        {
            GetMeetingSlotsResponse Resp = this.ServiceClient.Post<GetMeetingSlotsResponse>(new GetMeetingSlotsRequest { MeetingScheduleId = MeetingId, Date = date });

            List<MeetingSlots> Slots = new List<MeetingSlots>();

            foreach (var Obj in Resp.AllSlots)
            {
                if (Obj.SlotAttendeeCount >= Obj.Max_Attendee)
                {
                    Slots.Add(
                        new MeetingSlots()
                        {
                            Meeting_Id = Obj.Meeting_Id,
                            Slot_id = Obj.Slot_id,
                            Is_approved = Obj.Is_approved,
                            Date = Obj.Date,
                            Description = Obj.Description,
                            Meeting_schedule_id = Obj.Meeting_schedule_id,
                            Time_from = Obj.Time_from,
                            Time_to = Obj.Time_to,
                            Title = Obj.Title,
                            IsHide = true,
                            Attendee_count = Obj.Attendee_count,
                            Host_count = Obj.Host_count,
                        }
                    );
                }
                else
                {
                    Slots.Add(
                        new MeetingSlots()
                        {
                            Meeting_Id = Obj.Meeting_Id,
                            Slot_id = Obj.Slot_id,
                            Is_approved = Obj.Is_approved,
                            Date = Obj.Date,
                            Description = Obj.Description,
                            Meeting_schedule_id = Obj.Meeting_schedule_id,
                            Time_from = Obj.Time_from,
                            Time_to = Obj.Time_to,
                            Title = Obj.Title,
                            IsHide = false,
                            Attendee_count = Obj.Attendee_count,
                            Host_count = Obj.Host_count,
                        }
                    );
                }

            }
            return JsonConvert.SerializeObject(Slots);
        }

        public string UpdateMeetingFromAttendee(SlotParticipants Obj)
        {
            MeetingSaveValidateResponse Resp = this.ServiceClient.Post<MeetingSaveValidateResponse>(new MeetingSaveValidateRequest { SlotParticipant = Obj });
            return JsonConvert.SerializeObject(Resp.ResponseStatus);
        }
        public string AddMeetingTemp(AddMeetingSlotRequest obj)
        {
            AddMeetingSlotResponse Resp = this.ServiceClient.Post<AddMeetingSlotResponse>(new AddMeetingSlotRequest { Date = obj.Date });
            return JsonConvert.SerializeObject(Resp.Status);
        }
        public string GetSlotDetails(int id)
        {
            SlotDetailsResponse Resp = this.ServiceClient.Post<SlotDetailsResponse>(new SlotDetailsRequest { Id = id });
            string htm = "";
            string hosts = "";
            string attendees = "";
            for (int i = 0; i < Resp.MeetingRequest.Count; i++)
            {
                if (Resp.MeetingRequest[i].ParticipantType == 1)
                {
                    hosts += $@" <div class='mr-hosts'>{Resp.MeetingRequest[i].fullname}</div>";
                }
                else
                {
                    attendees += $@" <div class='mr-attendees'>{Resp.MeetingRequest[i].fullname}</div>";
                }
            }

            if (Resp.MeetingRequest.Count > 0)
            {
                string TimeFrom = Convert.ToDateTime(Resp.MeetingRequest[0].TimeFrom).ToString("hh:mm tt");
                string TimeTo = Convert.ToDateTime(Resp.MeetingRequest[0].TimeTo).ToString("hh:mm tt");
                string Date = Convert.ToDateTime(Resp.MeetingRequest[0].MeetingDate).ToString("dddd, dd MMMM yyyy");
                htm += $@"   <div class='mr'><div class='mr-title'> {Resp.MeetingRequest[0].Title} </div></div>
                        	<div id='tabs'>
					  <ul>
						<li><a href='#tabs-1'>Details</a></li>
						<li><a href='#tabs-2'>Participants</a></li>
					    </ul>
						<div id='tabs-1'>
						<div class='mr'>
                        <div class='mr-description'> <i class='fa fa-info-circle' aria-hidden='true'></i> <div>{Resp.MeetingRequest[0].Description} </div> </div>
                        <div class='meeting-details'> 
                        <div class='mr-venue'> <i class='fa fa-map-marker' aria-hidden='true'></i> <div>{Resp.MeetingRequest[0].Venue}</div>  </div>
                        <div class='mr-date'> <i class='fa fa-calendar-o' aria-hidden='true'></i> <div>{Date}</div> </div>
                        <div class='mr-time'> <div>{TimeFrom}</div> <span>to</span> <div>{TimeTo}</div></div></div>
                        </div></div>
					  <div id='tabs-2'>
							<div class='mr-list'>
                            <div class='mr-attendees-list'><h5>Attendees</h5> {attendees}</div> 
							<div class='mr-hosts-list'><h5>Hosts</h5> {hosts}</div></div></div>  
					   </div> 
					   </div>
					</div>
                    <div class='mr-btn-grp'>
                    <button id='reject-meeting' data-id='{Resp.MeetingRequest[0].Slotid}' class='mr-btn'> Reject Meeting</button>
                    <button id='cancel-meeting' data-id='{Resp.MeetingRequest[0].Slotid}' class='mr-btn'> Cancel Meeting</button>
                    <button id='accept-meeting' data-id='{Resp.MeetingRequest[0].Slotid}' class='mr-btn'> Accept Meeting</button>
                    </div>
                    ";
            }
            else
            {
                htm += $@"</div> in valid request </div>";
            }
            return JsonConvert.SerializeObject(htm);
        }
        public string AcceptMeeting(int Slot, int myactionid)
        {
            MeetingUpdateByUsersResponse Resp = this.ServiceClient.Post<MeetingUpdateByUsersResponse>(new MeetingUpdateByUsersRequest { Id = Slot, UserInfo = this.LoggedInUser, MyActionId = myactionid });
            return JsonConvert.SerializeObject(Resp);
        }
        public string CancelMeeting(int Slot, int myactionid)
        {
            MeetingCancelByHostResponse Resp = this.ServiceClient.Post<MeetingCancelByHostResponse>(new MeetingCancelByHostRequest { SlotId = Slot, UserInfo = this.LoggedInUser, MyActionId = myactionid });
            return JsonConvert.SerializeObject(Resp);
        }
    }
}
