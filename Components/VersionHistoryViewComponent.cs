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
    public class VersionHistoryViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public VersionHistoryViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }

        public async Task<IViewComponentResult> InvokeAsync(string objid, int tabnum)
        {
            ViewBag.versions = GetVersions(objid);
            ViewBag.tabNum = tabnum;
            return View();
        }

        public List<EbObjectWrapper> GetVersions(string objid)
        {
            var resultlist = this.ServiceClient.Get<EbObjectAllVersionsResponse>(new EbObjectAllVersionsRequest { RefId = objid });
            var rlist = resultlist.Data;
            return rlist;
        }

    }
}
