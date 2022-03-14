using ExpressBase.Common;
using ExpressBase.Common.Connections;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Data;
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
    public class ApiBuilderViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public ApiBuilderViewComponent(IServiceClient _client, IRedisClient _redis)
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

            Dictionary<int, string> d = new Dictionary<int, string>();

            EbConnectionsConfig _connections = this.Redis.Get<EbConnectionsConfig>
                (string.Format(CoreConstants.SOLUTION_INTEGRATION_REDIS_KEY, ViewBag.cid));
            if (_connections != null)
            { 
                if (!(_connections.EmailConfigs?.ImapConfigs is null))
                    foreach (EbEmailConfig c in _connections.EmailConfigs?.ImapConfigs)
                        d.Add(c.Id, c.NickName); 
                
                if (!(_connections.EmailConfigs?.Pop3Configs is null))
                    foreach (EbEmailConfig c in _connections.EmailConfigs?.Pop3Configs)
                        d.Add(c.Id, c.NickName);
            }
            ViewBag.EmailRetrieveConnections = JsonConvert.SerializeObject(d);

            return View("ApiBuilder");
        }
    }
}
