using ExpressBase.Common.Constants;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.Objects;
using ExpressBase.Common.Structures;
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
        private User UserObject { get; set; }

        public _SidebarmenuTUserViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis;
        }

        private bool ValidateLocId(int locid)
        {
            if (this.UserObject.LocationIds.Contains(locid) || this.UserObject.LocationIds.Contains(-1))
                return true;
            else
                return false;
        }

        private List<string> GetAccessIds(int lid)
        {
            List<string> ObjIds = new List<string>();
            foreach (string perm in this.UserObject.Permissions)
            {
                string id = perm.Split(CharConstants.DASH)[2];
                int locid = Convert.ToInt32(perm.Split(CharConstants.COLON)[1]);
                if (lid == locid || locid == -1)
                    ObjIds.Add(id);
            }
            return ObjIds;
        }

        public async Task<IViewComponentResult> InvokeAsync(string solnid, string email, string console, int locid)
        {
            var resultlist = new SidebarUserResponse();
            this.UserObject = this.Redis.Get<User>(string.Format(TokenConstants.SUB_FORMAT, solnid, email, console));
            Dictionary<int, string> _dict = new Dictionary<int, string>();
            foreach (EbObjectType objectType in EbObjectTypes.Enumerator)
            {
                _dict.Add(objectType.IntCode, objectType.Name);
            }

            if (ValidateLocId(locid))
            {
                var Ids = String.Join(",", GetAccessIds(locid));

                resultlist = this.ServiceClient.Get<SidebarUserResponse>(new SidebarUserRequest { Ids = Ids, SysRole = this.UserObject.Roles });

                this.Redis.Set<SidebarUserResponse>(string.Format("{0}-{1}-{2}_response", solnid, email, console), resultlist);

                StringBuilder sb = new StringBuilder();
                foreach (KeyValuePair<int, AppObject> obj in resultlist.AppList)
                {
                    if (resultlist.Data.ContainsKey(obj.Key))
                        sb.Append(@"<li><a Appid='" + obj.Key + "' class='list-group-item inner_li Obj_link for_brd'> " + resultlist.AppList[obj.Key].AppName + "</a></li>");
                }
                ViewBag.Object = resultlist;
                ViewBag.menu = sb.ToString();
            }
            else
            {
                ViewBag.Object = resultlist;
                ViewBag.menu = string.Empty;
            }

            ViewBag.Types = JsonConvert.SerializeObject(_dict);
            ViewBag.Role = this.UserObject.Roles;
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
