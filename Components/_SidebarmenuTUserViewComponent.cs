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
using System.Runtime.Serialization;
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
            var resultlist = new SidebarUserResponse();
            resultlist = this.Redis.Get<SidebarUserResponse>(string.Format("{0}-{1}-{2}_response", solnid, email, console));
            if (resultlist == null)
            {
                User user = this.Redis.Get<User>(string.Format("{0}-{1}-{2}", solnid, email, console));
                var Ids = String.Join(",", user.EbObjectIds);
                resultlist = this.ServiceClient.Get<SidebarUserResponse>(new SidebarUserRequest { Ids = "{" + Ids + "}" });
                this.Redis.Set<SidebarUserResponse>(string.Format("{0}-{1}-{2}_response", solnid, email, console), resultlist);
            }

            StringBuilder sb = new StringBuilder();

            foreach (var obj in resultlist.Data)
            {
                sb.Append(@" 
                    <li><a href = '#' class='list-group-item collapsed' data-toggle='collapse' data-target='#dropdown1_" + obj.Key + @"'>
                        <i class='fa fa-cog'></i> " + resultlist.AppList[obj.Key].AppName + @"<i class='fa fa-caret-down pull-right'></i>
                    </a>
                    <ul class='sub-menuObj collapse' id='dropdown1_" + obj.Key + @"'>");

                foreach (var val in obj.Value.Types)
                {
                    ControlAction ctrlAction = new ControlAction();
                    if(val.Key == Convert.ToInt32(EbObjectType.TableVisualization) || val.Key == Convert.ToInt32(EbObjectType.ChartVisualization))
                    {
                        ctrlAction.Controller = "DV";
                        ctrlAction.Action = "dv";
                    }
                    var ctrlaction = JsonConvert.SerializeObject(ctrlAction);
                    sb.Append("<li><a class='list-group-item' href='#' data-key='"+ val.Key + "' data-Appid='"+ obj.Key + "' data-action = '" + ctrlaction + "'><i class='fa fa-caret-right'></i>" + (EbObjectType)val.Key + "(" + val.Value.Objects.Count + ")</a></li>");
                }
                sb.Append("</ul></li>");
            }

            ViewBag.Object = resultlist;
            ViewBag.menu = sb.ToString();
            return View();
        }
    }    

    [DataContract]
    public class ControlAction
    {
        [DataMember(Order = 1)]
        public string Controller { get; set; }

        [DataMember(Order = 2)]
        public string Action { get; set; }
    }
}
