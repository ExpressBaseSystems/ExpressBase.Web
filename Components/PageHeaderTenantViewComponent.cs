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
    public class PageHeaderTenantViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public PageHeaderTenantViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }

        public async Task<IViewComponentResult> InvokeAsync(string solnid, string email, string console)
        {
            //User _user = this.Redis.Get<User>(string.Format("{0}-{1}-{2}", solnid, email, console));
            //ViewBag.ImgSrc = _user.Proimg;
            return View();
        }
    }
}
