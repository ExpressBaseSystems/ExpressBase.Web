using ExpressBase.Common;
using ExpressBase.Common.Data;
using ExpressBase.Common.Structures;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Scheduler.Jobs;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
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

        [HttpPost]
        public void Schedule(string name, string expression, int objId, JobTypes type, string users, string groups, string cronstring)
        {
            List<Param> _param = new List<Param> { new Param { Name = "FromDate", Type = ((int)EbDbTypes.DateTime).ToString(), Value = DateTime.Now.ToString("yyyy-MM-dd") },
            new Param{ Name = "ToDate", Type = ((int)EbDbTypes.DateTime).ToString(), Value = DateTime.Now.ToString() } };

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
                    SolnId = ViewBag.cid,
                    UserId = ViewBag.UId,
                    UserAuthId = ViewBag.UAuthId,
                    ToUserIds = users,
                    ToUserGroupIds = groups
                }
            };

            var ds = this.ServiceClient.Post(new ScheduleMQRequest { Task = task });
        }

        [HttpGet]
        public IActionResult SchedulesList()
        {
            return View();
        }

        [HttpPost]
        public void UpdateSchedule(EbTask task, string triggerkey, string jobkey, int id)
        {
            var ds = this.ServiceClient.Post(new RescheduleMQRequest { Task = task, TriggerKey = triggerkey, JobKey = jobkey, Id = id });
        }

        [HttpPost]
        public void Unschedule(string triggerkey)
        {
            var ds = this.ServiceClient.Post(new UnscheduleMQRequest { TriggerKey = /*triggerkey*/"JobTrigger11/30/2018 12:04:14 PM" });
        }

        [HttpPost]
        public void DeleteJob(string jobkey, int id)
        {
            DeleteJobMQResponse ds = this.ServiceClient.Post(new DeleteJobMQRequest { JobKey = jobkey, Id = id });

        }
    }
}
