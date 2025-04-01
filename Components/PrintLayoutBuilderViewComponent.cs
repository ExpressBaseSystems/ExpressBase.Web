using ExpressBase.Common.Structures;
using Microsoft.AspNetCore.Mvc;
using ServiceStack.Redis;
using ServiceStack;
using System.Threading.Tasks;
using System;
using System.Linq;

namespace ExpressBase.Web.Components
{
    public class PrintLayoutBuilderViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public PrintLayoutBuilderViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }

        public async Task<IViewComponentResult> InvokeAsync(string dsobj, int tabnum, int type, string refid, string ssurl)
        {
            ViewBag.dsObj = dsobj;
            ViewBag.tabnum = tabnum;
            ViewBag.ObjType = type;
            ViewBag.Refid = refid;
            ViewBag.ssurl = ssurl;
            ViewBag.EbDbType = Enum.GetValues(typeof(EbDbTypes))
               .Cast<EbDbTypes>()
               .ToDictionary(t => t.ToString(), t => (int)t);

            return View("PrintLayoutBuilder");
        }
    }
}
