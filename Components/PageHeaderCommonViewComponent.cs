using ExpressBase.Common;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class PageHeaderCommonViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public PageHeaderCommonViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }

        public async Task<IViewComponentResult> InvokeAsync()
        {
            ViewBag.SolutionObject = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}", ViewBag.cid));
            return View();
        }
    }
}
