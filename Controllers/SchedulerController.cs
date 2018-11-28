﻿using ExpressBase.Common;
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
        public void Schedule(string expression, int objId, JobTypes type, string users, string groups)
        {
            //int _objId = 2236;
            //int val = 1332423;
            List<Param> _param = new List<Param> { new Param { Name = "FromDate", Type = ((int)EbDbTypes.DateTime).ToString(), Value = DateTime.Now.ToString() },
            new Param{ Name = "ToDate", Type = ((int)EbDbTypes.DateTime).ToString(), Value = DateTime.Now.ToString() } };

            EbTask task = new EbTask
            {
                Expression = expression,
                JobType = type,
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

            var ds = this.ServiceClient.Post(new SchedulerMQRequest { Task = task });
        }

    }
}
