using ExpressBase.Common;
using ExpressBase.Common.Connections;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Data;
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
    public class DependancyMatrixViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public DependancyMatrixViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }

        public async Task<IViewComponentResult> InvokeAsync(Dictionary<int, ObjectVersionsDictionary> AppObjMap)
        {
            DependancyMatrixResponse response = this.ServiceClient.Post<DependancyMatrixResponse>(new DependancyMatrixRequest
            {
                AppObjectsMap = AppObjMap
            });
            ViewBag.Dominants = response.Dominants;
            return View();
        }
    }
}
