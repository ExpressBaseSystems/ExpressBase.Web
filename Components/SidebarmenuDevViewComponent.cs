using ExpressBase.Common.Objects;
using ExpressBase.Common.Structures;
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
            var resultlist = this.ServiceClient.Get<SidebarDevResponse>(new SidebarDevRequest());
            StringBuilder sb = new StringBuilder();
            foreach (var obj in resultlist.Data)
            {
                if (obj.Key != 0)
                    sb.Append(@"<li><a Appid='" + obj.Key + "' class='list-group-item inner_li Obj_link for_brd'> " + resultlist.AppList[obj.Key].AppName + " </a></li>");
            }
            Dictionary<int, string> _dict = new Dictionary<int, string>();
            foreach (EbObjectType objectType in EbObjectTypes.Enumerator)
            {
                _dict.Add(objectType.IntCode, objectType.Name);
            }
            ViewBag.Types = JsonConvert.SerializeObject(_dict);
            ViewBag.menu = sb.ToString();
            ViewBag.Object = resultlist;

            return View();
        }
    }
}
