using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Common.Objects;
using ServiceStack.Redis;
using ServiceStack;
using ExpressBase.Objects.ServiceStack_Artifacts;

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
        public async Task<IViewComponentResult> InvokeAsync(string refid, string objname, string status, string desc, bool _readonly, int _type, int major, int minor, int patch, string[] workcopies, string _tags, int _appId)
        {
            ViewBag._Refid = refid;
            ViewBag.ObjName = objname;
            //ViewBag.TotalVersions = totVer;
            ViewBag.Status = status;
            ViewBag.description = desc;
            ViewBag._ReadOnly = _readonly;
            ViewBag._objtype = _type;
            ViewBag._isUI = Enum.IsDefined(typeof(EbObjectTypesUI), _type);
            ViewBag._major = major;
            ViewBag._minor = minor;
            ViewBag._patch = patch;
            ViewBag.Workingcopy = workcopies;
            ViewBag.Tags = _tags;
            var resultlist = this.ServiceClient.Get<GetApplicationResponse>(new GetApplicationRequest());
            ViewBag.Apps = resultlist.Data;
            ViewBag.AppId = _appId;
            return View();

        }
    }
}
