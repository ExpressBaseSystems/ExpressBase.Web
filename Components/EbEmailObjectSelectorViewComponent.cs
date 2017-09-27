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
    public class EbEmailObjectSelectorViewComponent : ViewComponent
    {

        protected JsonServiceClient ServiceClient { get; set; }

        protected IRedisClient redis { get; set; }

        public EbEmailObjectSelectorViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.redis = _redis;
        }

        public async Task<IViewComponentResult> InvokeAsync(int Type)
        {
            var resultlist = this.ServiceClient.Get<EbObjectObjListResponse>(new EbObjectObjListRequest { EbObjectType = Type });
            var rlist = resultlist.Data;
            Dictionary<string, EbObjectWrapper> ObjList = new Dictionary<string, EbObjectWrapper>();
            foreach (var element in rlist)
            {
                ObjList[element.RefId] = element;
            }
            ViewBag.Objlist = ObjList;

            return View();
        }
    }
}
