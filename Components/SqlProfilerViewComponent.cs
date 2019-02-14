using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Common;
using ExpressBase.Common.SqlProfiler;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Objects.ServiceStack_Artifacts;

namespace ExpressBase.Web.Components
{
    public class SqlProfilerViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

       public SqlProfilerViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }
        public async Task<IViewComponentResult> InvokeAsync(string refid )
        {
            var res = ServiceClient.Get<GetExecLogsResponse>(new GetExecLogsRequest { RefId=refid});
            ViewBag.Log = res.Logs;
            var result = ServiceClient.Get<GetProfilersResponse>(new GetProfilersRequest { RefId = refid });
            ViewBag.Profiler = result.Profiler;//EbSerializers.Json_Serialize(result.Profiler);
            return View();
        }
    }
}
