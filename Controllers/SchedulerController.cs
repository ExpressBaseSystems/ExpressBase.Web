using ExpressBase.Common;
using ExpressBase.Common.Data;
using ExpressBase.Common.Structures;
using ExpressBase.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Scheduler.Jobs;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;

namespace ExpressBase.Web.Controllers
{
    public class SchedulerController : EbBaseIntCommonController
    {
        public SchedulerController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        [HttpGet]
        public IActionResult Schedule()
        {
            return View();
        }

        public IActionResult SchedulelistCall(int obj)
        {
            return ViewComponent("SchedulerListing", new { objid = obj });
        }

        [HttpPost]
        public void Schedule(string name, string expression, int objId, JobTypes type, string message, string users, string groups, string cronstring)
        {
            string Refid = string.Empty;
            List<Param> _param = new List<Param>
            {
                new Param
                {
                    Name = "FromDate",
                    Type = ((int)EbDbTypes.DateTime).ToString(),
                    Value = DateTime.Now.ToString("yyyy-MM-dd")
                },
                new Param
                {
                    Name = "ToDate",
                    Type = ((int)EbDbTypes.DateTime).ToString(),
                    Value = DateTime.Now.ToString("yyyy-MM-dd")
                },
            };

            if (objId > 0)
            {
                EbObjectFetchLiveVersionResponse res = this.ServiceClient.Get<EbObjectFetchLiveVersionResponse>(new EbObjectFetchLiveVersionRequest() { Id = objId });
                if (res?.Data.Count > 0)
                {
                    EbApi api = EbSerializers.Json_Deserialize(res.Data[0].Json);
                    Refid = api?.RefId;
                }
            }

            EbTask task = new EbTask
            {
                Name = name,
                Expression = expression,
                JobType = type,
                CronString = cronstring,
                JobArgs = new EbJobArguments
                {
                    Params = _param,
                    ObjId = objId,
                    RefId = Refid,
                    SolnId = ViewBag.cid,
                    UserId = ViewBag.UId,
                    UserAuthId = ViewBag.UAuthId,
                    ToUserIds = users,
                    ToUserGroupIds = groups,
                    Message = message
                }
            };

            this.ServiceClient.Post(new ScheduleMQRequest { Task = task });
        }

        [HttpGet]
        public IActionResult SchedulesList()
        {
            return View();
        }

        [HttpPost]
        public void UpdateSchedule(EbTask task, string triggerkey, string jobkey, int id)
        {
            this.ServiceClient.Post(new RescheduleMQRequest { Task = task, TriggerKey = triggerkey, JobKey = jobkey, Id = id });
        }

        [HttpPost]
        public void Unschedule(string triggerkey)
        {
            this.ServiceClient.Post(new UnscheduleMQRequest { TriggerKey = triggerkey });
        }

        [HttpPost]
        public void DeleteJob(string jobkey, int id)
        {
            DeleteJobMQResponse ds = this.ServiceClient.Post(new DeleteJobMQRequest { JobKey = jobkey, Id = id });
        }

        [HttpPost]
        public string GetUser_Group()
        {
            GetAllUsersResponse res = this.ServiceClient.Get<GetAllUsersResponse>(new GetAllSlackRequest());

            return JsonConvert.SerializeObject(res);
        }
    }
}
