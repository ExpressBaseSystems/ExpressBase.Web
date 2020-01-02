﻿using ExpressBase.Common;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class SchedulerWindowViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public SchedulerWindowViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }
        public async Task<IViewComponentResult> InvokeAsync(int objid, JobTypes tasktype)
        {
            GetAllUsersResponse Res = ServiceClient.Get<GetAllUsersResponse>(new GetAllUsersRequest());
            ViewBag.users = Res.Users;
            ViewBag.usergroups = Res.UserGroups;
            ViewBag.Slackusers = Res.SlackUsers;
            ViewBag.SlackChannnel = Res.SlackChannels;
            ViewBag.Tasktype = tasktype;
            ViewBag.Obj_id = objid;
            return View("schWindow");
        }
    }
}
