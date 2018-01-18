using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class TenantSideMenuViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }
        protected IRedisClient Redis { get; set; }

        public TenantSideMenuViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis;
        }

        public async Task<IViewComponentResult> InvokeAsync(string refid)
        {
            GetAppListResponse AppListResp = ServiceClient.Get<GetAppListResponse>(new AppListRequest());

            ViewBag.botApps = AppListResp.AppList["Bot"];
            ViewBag.webApps = AppListResp.AppList["Web"];
            ViewBag.mobApps = AppListResp.AppList["Mobile"];
            ViewBag.botlength = AppListResp.AppList["Mobile"].Count;
            return View();
        }
    }
}
