using ExpressBase.Common.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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

        public async Task<IViewComponentResult> InvokeAsync(string solnid, string email, string console)
        {
            User user = this.Redis.Get<User>(string.Format("{0}-{1}-{2}", solnid, email, console));
            var Ids = String.Join(",", user.EbObjectIds);
            var resultlist = this.ServiceClient.Get<SidebarUserResponse>(new SidebarUserRequest { Ids = "{" + Ids + "}" });

            StringBuilder sb = new StringBuilder();

            foreach (var obj in resultlist.Data)
            {
                sb.Append(@" 
                    <li><a href = '#' class='list-group-item collapsed' data-toggle='collapse' data-target='#dropdown1_" + obj.Key + @"'>
                        <i class='fa fa-cog'></i> " + resultlist.AppList[obj.Key].AppName + @"<i class='fa fa-caret-down pull-right'></i>
                    </a>
                    <ul class='sub-menu collapse' id='dropdown1_" + obj.Key + @"'>");

                foreach (var val in obj.Value.Types)
                {
                    sb.Append("<li><a class='list-group-item' href='#'><i class='fa fa-caret-right'></i>" + (EbObjectType)val.Key + "(" + val.Value.Objects.Count + ")</a></li>");
                    var json = JsonConvert.SerializeObject(val.Value.Objects);
                    sb.Append("<div id='EbType_" + val.Key + "' style='display:none' data-json='" + json + "' ></div>");
                }
                sb.Append("</ul></li>");
            }

            ViewBag.menu = sb.ToString();
            return View();
        }
    }    
}
