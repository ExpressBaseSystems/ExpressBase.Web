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
        public async Task<IViewComponentResult> InvokeAsync(string refid, string objname, string status, string vernum, string[] workcopies, string _tags, string _apps, EbObjectWrapper_Dashboard _dashbord_tiles)
        {
            ViewBag.Refid = refid;
            ViewBag.ObjName = objname;
            ViewBag.Status = status;
            //ViewBag._isUI = Enum.IsDefined(typeof(EbObjectTypesUI), _type);
            ViewBag.VersionNumber = vernum;           
            ViewBag.Workingcopy = workcopies;
            ViewBag.Tags = _tags;
            var resultlist = this.ServiceClient.Get<GetApplicationResponse>(new GetApplicationRequest());
            ViewBag.Apps =JsonConvert.SerializeObject(resultlist.Data);
            var result = this.ServiceClient.Get<EbObjectGetAllTagsResponse>(new EbObjectGetAllTagsRequest());
            ViewBag.AllTags = result.Data;
            ViewBag.AppId = _apps;
            if (_dashbord_tiles != null)
            {
                ViewBag._major = _dashbord_tiles.MajorVersionNumber;
                ViewBag._minor = _dashbord_tiles.MinorVersionNumber;
                ViewBag._patch = _dashbord_tiles.PatchVersionNumber;
                ViewBag.LastCommitedVersionRefid = _dashbord_tiles.LastCommitedVersionRefid;
                ViewBag.LastCommitedVersionNumber = _dashbord_tiles.LastCommitedVersionNumber;
                ViewBag.LastCommitedVersionCommit_ts = _dashbord_tiles.LastCommitedVersionCommit_ts;
                ViewBag.LastCommitedVersion_Status = _dashbord_tiles.LastCommitedVersion_Status;
                ViewBag.LastCommitedby_Name = _dashbord_tiles.LastCommitedby_Name;
                ViewBag.LastCommitedby_Id = _dashbord_tiles.LastCommitedby_Id;
                ViewBag.LiveVersionRefid = _dashbord_tiles.LiveVersionRefid;
                ViewBag.LiveVersionNumber = _dashbord_tiles.LiveVersionNumber;
                ViewBag.LiveVersionCommit_ts = _dashbord_tiles.LiveVersionCommit_ts;
                ViewBag.LiveVersion_Status = _dashbord_tiles.LiveVersion_Status;
                ViewBag.LiveVersionCommitby_Name = _dashbord_tiles.LiveVersionCommitby_Name;
                ViewBag.LiveVersionCommitby_Id = _dashbord_tiles.LiveVersionCommitby_Id;
                ViewBag.Owner_Name = _dashbord_tiles.OwnerName;
                ViewBag.Owner_Id = _dashbord_tiles.OwnerUid;
                ViewBag.Owner_Ts = _dashbord_tiles.OwnerTs;
            }
            else{
                ViewBag.Owner_Id = ViewBag.Uid;
                User u = this.Redis.Get<User>(string.Format(TokenConstants.SUB_FORMAT, ViewBag.cid, ViewBag.email, ViewBag.wc));
                ViewBag.Owner_Name =u.FullName;
                ViewBag.Owner_Ts = DateTime.UtcNow;
            }
            return View();

        }
    }
}
