using ExpressBase.Common;
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
    public class ReportBuilderViewComponent: ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        public ReportBuilderViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
        }

        public async Task<IViewComponentResult> InvokeAsync(string dsobj, int tabnum, int type, string refid, string ssurl)
        {
            ViewBag.dsObj = dsobj;
            ViewBag.tabnum = tabnum;
            ViewBag.ObjType = type;
            ViewBag.Refid = refid;
            var resp = this.ServiceClient.Get<LocationInfoResponse>(new LocationInfoRequest { });
            ViewBag.LocConfig = JsonConvert.SerializeObject(resp.Config);
            return View();
        }       
    }
}
