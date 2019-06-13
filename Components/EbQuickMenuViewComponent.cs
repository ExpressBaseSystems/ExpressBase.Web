using ExpressBase.Common;
using ExpressBase.Common.Constants;
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
using System.Text;
using System.Threading.Tasks;


namespace ExpressBase.Web.Components
{
    public class EbQuickMenuViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected IRedisClient Redis { get; set; }

        private User UserObject { get; set; }

        public EbQuickMenuViewComponent(IServiceClient _client, IRedisClient _redis)
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
                int id = Convert.ToInt32(perm.Split(CharConstants.DASH)[2]);
                int locid = Convert.ToInt32(perm.Split(CharConstants.COLON)[1]);
                if ((lid == locid || locid == -1) && !ObjIds.Contains(id.ToString()))
                    ObjIds.Add(id.ToString());
            }
            return ObjIds;
        }

        public async Task<IViewComponentResult> InvokeAsync(string solnid, string email, string console, int locid = 0)
        {
            if (console.Equals(RoutingConstants.DC))
                this.DevConsole();
            else if (console.Equals(RoutingConstants.UC))
                this.UserConsole(solnid,email,console,locid);
            return View("EbQuickMenu");
        }

        private void UserConsole(string solnid, string email, string console, int locid)
        {
            var resultlist = new SidebarUserResponse();
            this.UserObject = this.Redis.Get<User>(string.Format(TokenConstants.SUB_FORMAT, solnid, email, console));
            Dictionary<int, EbObjectTypeWrap> _dict = new Dictionary<int, EbObjectTypeWrap>();

            foreach (EbObjectType objectType in EbObjectTypes.Enumerator)
            {
                _dict.Add(objectType.IntCode, new EbObjectTypeWrap
                {
                    Name = objectType.Name,
                    IntCode = objectType.IntCode,
                    BMW = objectType.BMW,
                    IsUserFacing = objectType.IsUserFacing,
                    Icon = objectType.Icon
                });
            }

            if (ValidateLocId(locid) || this.UserObject.Roles.Contains("SolutionOwner"))
            {
                var Ids = String.Join(",", GetAccessIds(locid));

                resultlist = this.ServiceClient.Get<SidebarUserResponse>(new SidebarUserRequest { Ids = Ids, SysRole = this.UserObject.Roles });

                StringBuilder sb = new StringBuilder();
                foreach (KeyValuePair<int, AppObject> obj in resultlist.AppList)
                {
                    if (resultlist.Data.ContainsKey(obj.Key))
                        sb.Append(@"<li trigger='menu' Appid='" + obj.Key + "'><a class='list-group-item inner_li Obj_link for_brd'> <div class='apibox'><i class='fa " + resultlist.AppList[obj.Key].AppIcon + "'></i></div>" + resultlist.AppList[obj.Key].AppName + "</a></li>");
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
        }

        private void DevConsole()
        {
            var resultlist = this.ServiceClient.Get<SidebarDevResponse>(new SidebarDevRequest());
            StringBuilder sb = new StringBuilder();
            foreach (var obj in resultlist.AppList)
            {
                sb.Append(@"<li trigger='menu' Appid='" + obj.Key + "'><a class='list-group-item inner_li Obj_link for_brd'><div class='apibox'><i class='fa " + resultlist.AppList[obj.Key].AppIcon + "'></i></div>" + resultlist.AppList[obj.Key].AppName + " </a></li>");
            }
            Dictionary<int, EbObjectTypeWrap> _dict = new Dictionary<int, EbObjectTypeWrap>();
            foreach (EbObjectType objectType in EbObjectTypes.Enumerator)
            {
                _dict.Add(objectType.IntCode, new EbObjectTypeWrap
                {
                    Name = objectType.Name,
                    IntCode = objectType.IntCode,
                    BMW = objectType.BMW,
                    IsUserFacing = objectType.IsUserFacing,
                    Icon = objectType.Icon
                });
            }

            ViewBag.Types = JsonConvert.SerializeObject(_dict);
            ViewBag.menu = sb.ToString();
            ViewBag.Object = resultlist;
        }
    }
}
