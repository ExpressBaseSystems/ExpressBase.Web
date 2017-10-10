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
    public class GoogleRelatedViewComponent :ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public GoogleRelatedViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }

        public async Task<IViewComponentResult> InvokeAsync(string dvobjt, string dvRefId)
        {
            var resultlist = this.ServiceClient.Get<GoogleMapResponse>(new GoogleMapRequest { });
            var rlist = resultlist.Data;
            ViewBag.data =JsonConvert.SerializeObject(rlist);
            return View();
        }
    }
}
