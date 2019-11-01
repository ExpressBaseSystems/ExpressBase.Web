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
    public class ObjectLifeCycleViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public ObjectLifeCycleViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }
        public async Task<IViewComponentResult> InvokeAsync(int _tabnum, string _cur_status, string _refid)
        {
            ViewBag.tabNum = _tabnum;
            List<EbObjectWrapper> _wrp = GetStatusHistory(_refid);
            ViewBag.StatusHistory = _wrp;
            ViewBag.CurrStatus = _wrp[0].Status;
            ViewBag.Curr_refid = _refid;
            return View();
        }
        public List<EbObjectWrapper> GetStatusHistory(string _refid)
        {
            var resultlist = this.ServiceClient.Get<EbObjectStatusHistoryResponse>(new EbObjectStatusHistoryRequest { RefId = _refid });
            var rlist = resultlist.Data;
            return rlist;
        }

    }
}