using ExpressBase.Common.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
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
    public class SidebarmenuDevViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }
        protected IRedisClient Redis { get; set; }

        public SidebarmenuDevViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis;
        }

        public async Task<IViewComponentResult> InvokeAsync(string solnid, string email, string console)
        {
            var resultlist = new SidebarDevResponse();
            //resultlist = this.Redis.Get<SidebarDevResponse>(string.Format("{0}-{1}-{2}_response", solnid, email, console));
            if (resultlist == null || resultlist.Data == null)
            {
                resultlist = this.ServiceClient.Get<SidebarDevResponse>(new SidebarDevRequest ());
                this.Redis.Set<SidebarDevResponse>(string.Format("{0}-{1}-{2}_response", solnid, email, console), resultlist);
            }

            StringBuilder sb = new StringBuilder();

            foreach (var obj in resultlist.Data)
            {
                var json = JsonConvert.SerializeObject(resultlist.Data[obj.Key].Objects);
                sb.Append(@"<li><a class='list-group-item'><i class='fa fa-caret-right'></i>"+ ((EbObjectType)obj.Key).ToString() + @"</a></li>");
                sb.Append("<div id='EbType_" + obj.Key + "' style='display:none' data-json='" + json + "'></div>");
            }

            ViewBag.menu = sb.ToString();
            return View();
        }
    }
}
