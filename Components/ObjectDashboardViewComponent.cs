using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Common.Objects;
using ServiceStack.Redis;
using ServiceStack;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security;
using Newtonsoft.Json;
using ExpressBase.Common.Constants;
using System.Text;
using ExpressBase.Common;

namespace ExpressBase.Web.Components
{
    public class ObjectDashboardViewComponent : ViewComponent
    {

        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public ObjectDashboardViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }
        public async Task<IViewComponentResult> InvokeAsync(string refid, string objname, string status, string vernum, string[] workcopies, string _tags, string _apps, EbObj_Dashboard _dashbord_tiles)
        {
            ViewBag.Refid = refid;
            ViewBag.ObjName = objname;
            ViewBag.Status = status;
            ViewBag.VersionNumber = vernum;           
            ViewBag.Workingcopy = workcopies;
            ViewBag.Tags = _tags;
            GetApplicationResponse resultlist = ServiceClient.Get(new GetApplicationRequest());
            ViewBag.Apps =JsonConvert.SerializeObject(resultlist.Data);
            EbObjectGetAllTagsResponse result = ServiceClient.Get<EbObjectGetAllTagsResponse>(new EbObjectGetAllTagsRequest());
            ViewBag.AllTags = result.Data;
            ViewBag.AppId = _apps;
            if (_dashbord_tiles != null)
                ViewBag.tile = _dashbord_tiles;
            else
            {
                User u = this.Redis.Get<User>(string.Format(TokenConstants.SUB_FORMAT, ViewBag.cid, ViewBag.email, ViewBag.wc));
                ViewBag.tile = new EbObj_Dashboard { OwnerUid = ViewBag.Uid, OwnerName = u.FullName, OwnerTs = DateTime.UtcNow };
            }

            return View();
        }
    }
}
