using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class _SidebarmenuTUserViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }
        protected IRedisClient Redis { get; set; }

        public _SidebarmenuTUserViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis;
        }

        public async Task<IViewComponentResult> InvokeAsync()
        {
            User user = (User) this.HttpContext.Items["user"];
            var Ids = String.Join(",", user.EbObjectIds);
            var resultlist = this.ServiceClient.Get<SidebarUserResponse>(new SidebarUserRequest { Ids = "{"+ Ids + "}"});
            ViewBag.resultlist = resultlist.Data;
           
            return View();
        }
    }


}
