using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using ServiceStack;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Objects;
using ExpressBase.Web.Filters;
using ExpressBase.Data;
using Newtonsoft.Json;
using System.IdentityModel.Tokens.Jwt;
using ExpressBase.Web.Controllers;
using ExpressBase.Common;
using ServiceStack.Redis;
using ExpressBase.Common.Objects;
using ExpressBase.Security;
using ExpressBase.Security.Core;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web2.Controllers
{
    public class TenantUserController : EbBaseIntController
    {

        public TenantUserController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }


        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }
        
        public IActionResult UserDashboard()
        {        
            return View();
        }

        [HttpGet]
        public IActionResult getSidebarMenu()
        {
            if (ViewBag.wc == "tc")
                return View("_SidebarMenu");
            else if(ViewBag.wc == "dc")
                return ViewComponent("SidebarmenuDev", new { solnid = ViewBag.cid, email = ViewBag.email, console = ViewBag.wc });
            else
                return ViewComponent("_SidebarmenuTUser", new {solnid = ViewBag.cid, email = ViewBag.email, console = ViewBag.wc});
        }

        [HttpGet]
        public IActionResult UserPreferences()
        {
            var res = this.ServiceClient.Post<EditUserPreferenceResponse>(new EditUserPreferenceRequest());
            if(res.Data != null)
            {
                ViewBag.dateformat = res.Data["dateformat"];
                ViewBag.timezone = res.Data["timezone"];
                ViewBag.numformat = res.Data["numformat"];
                ViewBag.timezoneabbre = res.Data["timezoneabbre"];
                ViewBag.timezonefull = res.Data["timezonefull"];
                ViewBag.locale = res.Data["locale"];

            }

            return View();
        }

        [HttpPost]
        public IActionResult UserPreferences(int i)
        {
            var req = this.HttpContext.Request.Form;
            var res = this.ServiceClient.Post<UserPreferenceResponse>(new UserPreferenceRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value)});
            return View();
        }     

        public IActionResult Logout()
        {
            ViewBag.Fname = null;
            // IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var abc = this.ServiceClient.Post(new Authenticate { provider = "logout" });
            HttpContext.Response.Cookies.Delete("bToken");
            HttpContext.Response.Cookies.Delete("rToken");
            return RedirectToAction("UsrSignIn", "Ext");
        }

		//public IActionResult ManageRoles2()
		//{
		//	return View();
		//}

		[HttpGet]
        public IActionResult ManageRoles()
        {

            var resultlist = this.ServiceClient.Get<GetApplicationResponse>(new GetApplicationRequest());
            ViewBag.dict = resultlist.Data;    // get application from application table
            return View();
        }

        [HttpPost]
        public IActionResult ManageRoles(int itemid)
        {
            var req = this.HttpContext.Request.Form;
            //IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);

            if (itemid > 0)
            {
                var fr = this.ServiceClient.Get<GetPermissionsResponse>(new GetPermissionsRequest { id = itemid, TenantAccountId = ViewBag.cid });
                //ViewBag.permissions = fr.Permissions;
                ViewBag.RoleName = fr.Data["rolename"];
                ViewBag.ApplicationId = fr.Data["applicationid"];
                ViewBag.ApplicationName = fr.Data["applicationname"];
                ViewBag.Description = fr.Data["description"];

            }

            var resultlist = this.ServiceClient.Get<GetApplicationResponse>(new GetApplicationRequest());
            ViewBag.dict = resultlist.Data;    // get application from application table
            ViewBag.roleid = itemid;

            return View();
        }

        public string GetRowAndColumn(string ApplicationId, int ObjectType, int RoleId)
        {
            // IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            List<string> _permissionsData = new List<string>(); // FOR NEW MODE

            if (RoleId > 0)
            {
                var fr = this.ServiceClient.Get<GetPermissionsResponse>(new GetPermissionsRequest { id = RoleId, TenantAccountId = ViewBag.cid });
                _permissionsData = fr.Permissions;
            }

            var resultlist = this.ServiceClient.Get<GetApplicationObjectsResponse>(new GetApplicationObjectsRequest { Id = Convert.ToInt32(ApplicationId), objtype = ObjectType});
            ViewBag.dict = resultlist.Data;
            string html = @"<thead><tr><th>@Header</th></tr></thead><tbody>@tbody</tbody>";
            string header = string.Empty;
            string tbody = string.Empty;

            if (ObjectType == 16)
            {
                foreach (var Op in Enum.GetValues(typeof(EbTableVisualization.Operations)))
                    header += "<th> @Operation </th>".Replace("@Operation", Op.ToString());

                foreach (var obj in resultlist.Data.Keys)
                {
                    tbody += "<tr>";
                    tbody += "<td>{0}</td>".Fmt(resultlist.Data[obj]);
                    foreach (var Op in Enum.GetValues(typeof(EbTableVisualization.Operations)))
                    {
                        var perm = string.Format("{0}_{1}", obj, (int)Op);
                        var checked_string = _permissionsData.Contains(perm) ? "checked" : string.Empty;
                        tbody += "<td><input type = 'checkbox' name ='permissions' value='{0}' class='form-check-input' aria-label='...' {1}></td>".Fmt(perm, checked_string);
                    }
                    tbody += "</tr>";
                }
            }

            else if (ObjectType == 17)
            {
                foreach (var Op in Enum.GetValues(typeof(EbChartVisualization.Operations)))
                    header += "<th> @Operation </th>".Replace("@Operation", Op.ToString());

                foreach (var obj in resultlist.Data.Keys)
                {
                    tbody += "<tr>";
                    tbody += "<td>{0}</td>".Fmt(resultlist.Data[obj]);
                    foreach (var Op in Enum.GetValues(typeof(EbChartVisualization.Operations)))
                    {
                        var perm = string.Format("{0}_{1}", obj, (int)Op);
                        var checked_string = _permissionsData.Contains(perm) ? "checked" : string.Empty;
                        tbody += "<td><input type = 'checkbox' name ='permissions' value='{0}' class='form-check-input' aria-label='...' {1}></td>".Fmt(perm, checked_string);
                    }
                    tbody += "</tr>";
                }
            }

            else if (ObjectType == 18)
            {
                foreach (var Op in Enum.GetValues(typeof(EbBotForm.Operations)))
                    header += "<th> @Operation </th>".Replace("@Operation", Op.ToString());

                foreach (var obj in resultlist.Data.Keys)
                {
                    tbody += "<tr>";
                    tbody += "<td>{0}</td>".Fmt(resultlist.Data[obj]);
                    foreach (var Op in Enum.GetValues(typeof(EbBotForm.Operations)))
                    {
                        var perm = string.Format("{0}_{1}", obj, (int)Op);
                        var checked_string = _permissionsData.Contains(perm) ? "checked" : string.Empty;
                        tbody += "<td><input type = 'checkbox' name ='permissions' value='{0}' class='form-check-input' aria-label='...' {1}></td>".Fmt(perm, checked_string);
                    }
                    tbody += "</tr>";
                }
            }

            else if (ObjectType == 3)
            {
                foreach (var Op in Enum.GetValues(typeof(EbReport.Operations)))
                    header += "<th> @Operation </th>".Replace("@Operation", Op.ToString());

                foreach (var obj in resultlist.Data.Keys)
                {
                    tbody += "<tr>";
                    tbody += "<td>{0}</td>".Fmt(resultlist.Data[obj]);
                    foreach (var Op in Enum.GetValues(typeof(EbReport.Operations)))
                    {
                        var perm = string.Format("{0}_{1}", obj, (int)Op);
                        var checked_string = _permissionsData.Contains(perm) ? "checked" : string.Empty;
                        tbody += "<td><input type = 'checkbox' name ='permissions' value='{0}' class='form-check-input' aria-label='...' {1}></td>".Fmt(perm, checked_string);
                    }
                    tbody += "</tr>";
                }
            }

            return html.Replace("@Header", header).Replace("@tbody", tbody);

        }
        public string GetSubRoles(int roleid, int applicationid)
        {
            string html = string.Empty;
            // IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            Dictionary<string, object> Dict = new Dictionary<string, object>();
            Dict.Add("applicationid", applicationid);
            var fr = this.ServiceClient.Get<GetSubRolesResponse>(new GetSubRolesRequest { id = roleid, Colvalues = Dict, TenantAccountId = ViewBag.cid });

            List<string> subroles = fr.Data.ContainsKey("roles") ? fr.Data["roles"].ToString().Replace("[", "").Replace("]", "").Split(new char[] { ',' }).ToList() : new List<string>();

            foreach (var key in fr.Data.Keys)
            {
                if (key != "roles")
                {
                    var checkedrole = subroles.Contains(key) ? "checked" : string.Empty;
                    html += @"
                <div class='row'>
                    <div class='col-md-1'>
                        <input type ='checkbox' @checkedrole name = '@roles' value = '@roleid' aria-label='...'>
                    </div>

                    <div class='col-md-8'>
                        <h4 name = 'head4' style='color:black;'>@roles</h4>
                        <p class='text-justify'>dsgfds dgfrdhg dfhgdrewteberyrt reyhrtu6trujhfg reyer5y54</p>
                        <h6>
                            <i style = 'font-style:italic;' > Created by Mr X on 12/09/2017 at 02:00 pm</i>
                        </h6>
                    </div>               
                </div> ".Replace("@roles", fr.Data[key].ToString()).Replace("@roleid", key).Replace("@checkedrole", checkedrole);
                }
            }
            return html;
        }

        public string SaveRoles(int RoleId, int ApplicationId, string RoleName, string Description, string users, string Permissions, string subrolesid)
        {
            var req = this.HttpContext.Request.Form;
            Dictionary<string, object> Dict = new Dictionary<string, object>();
            string return_msg;
            Dict["roleid"] = RoleId;
            Dict["applicationid"] = ApplicationId;
            Dict["role_name"] = RoleName;
            Dict["Description"] = Description;
            Dict["users"] = string.IsNullOrEmpty(users) ? string.Empty : users;
            Dict["permission"] = string.IsNullOrEmpty(Permissions) ? string.Empty : Permissions;
            Dict["dependants"] = string.IsNullOrEmpty(subrolesid) ? string.Empty : subrolesid;

            //  IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);

            RBACRolesResponse res = this.ServiceClient.Post<RBACRolesResponse>(new RBACRolesRequest { Colvalues = Dict });

            if (res.id == 0)
            {
                return_msg = "Success";
            }
            else
            {
                return_msg = "Failed";
            }
            return return_msg;

        }

        public IActionResult CommonList(string type)
        {
            IServiceClient client = this.ServiceClient;
            ViewBag.ListType = type;
            if (type == "user")
            {
                var fr = this.ServiceClient.Get<GetUsersResponse>(new GetUsersRequest());
                ViewBag.dict = fr.Data;

            }
            else if (type == "usergroup")
            {
                var fr = this.ServiceClient.Get<GetUserGroupResponse>(new GetUserGroupRequest());
                ViewBag.dict = fr.Data;
            }
            else if(type == "roles")
            {
                var fr = this.ServiceClient.Get<GetRolesResponse>(new GetRolesRequest());
                ViewBag.dict = fr.Data;
            }
			else
			{
				var fr = this.ServiceClient.Get<GetRolesResponse>(new GetRolesRequest());
				ViewBag.dict = fr.Data;
			}
            if (ViewBag.isAjaxCall)
                return PartialView();
            else
                return View();
        }

        public string GetRoles(int userid)
        {
            string html = string.Empty;
            var fr = this.ServiceClient.Get<GetUserRolesResponse>(new GetUserRolesRequest { id = userid, TenantAccountId = ViewBag.cid });
            List<string> subroles = fr.Data.ContainsKey("roles") ? fr.Data["roles"].ToString().Replace("[", "").Replace("]", "").Split(new char[] { ',' }).ToList() : new List<string>();

            foreach (var key in fr.Data.Keys)
            {
                if (key != "roles")
                {
                    var checkedrole = subroles.Contains(key) ? "checked" : string.Empty;
                    html += @"
                <div class='row'>
                    <div class='col-md-1'>
                        <input type ='checkbox' @checkedrole name = '@roles' value = '@roleid' aria-label='...'>
                    </div>

                    <div class='col-md-8'>
                        <h4 name = 'head4' style='color:black;'>@roles</h4>
                        <p class='text-justify'>dsgfds dgfrdhg dfhgdrewteberyrt reyhrtu6trujhfg reyer5y54</p>
                        <h6>
                            <i style = 'font-style:italic;' > Created by Mr X on 12/09/2017 at 02:00 pm</i>
                        </h6>
                    </div>               
                </div> ".Replace("@roles", fr.Data[key].ToString()).Replace("@roleid", key).Replace("@checkedrole", checkedrole);
                }
            }
            return html;
        }

		public string GetRoleUsers(int roleid)
        {

            string html = string.Empty;
            var fr = this.ServiceClient.Get<GetUsersRoleResponse>(new GetUsersRoleRequest { id = roleid, TenantAccountId = ViewBag.cid });

            foreach (var key in fr.Data.Keys)
            {
                html += "<div id ='@userid' class='alert alert-success columnDrag'>@users<button class='close' type='button' style='font-size: 15px;margin: 2px 0 0 4px;'>x</button></div>".Replace("@users", fr.Data[key].ToString()).Replace("@userid", key);
            }
            return html;
        }

        [HttpGet]
        public IActionResult UserGroups()
        {
            return View();
        }

        [HttpPost]
        public IActionResult UserGroups(int itemid)
        {
            var req = this.HttpContext.Request.Form;
            if (itemid > 0)
            {
                var fr = this.ServiceClient.Get<GetUserGroupResponse>(new GetUserGroupRequest { id = itemid, TenantAccountId = ViewBag.cid });
                List<int> userlist = fr.Data.ContainsKey("userslist") ? fr.Data["userslist"].ToString().Replace("[", "").Replace("]", "").Split(',').Select(int.Parse).ToList() : new List<int>();
                ViewBag.UGName = fr.Data["name"];
                ViewBag.UGDescription = fr.Data["description"];
                ViewBag.itemid = itemid;
                string html = "";
                if (fr.Data.ContainsKey("userslist"))
                {
                    foreach (var element in userlist)
                    {
                        html += "<div id ='@userid' class='alert alert-success columnDrag'>@users<button class='close' type='button' style='font-size: 15px;margin: 2px 0 0 4px;'>x</button></div>".Replace("@users", fr.Data[element.ToString()].ToString()).Replace("@userid", element.ToString());
                    }

                }
                ViewBag.UserList = html;

            }
            else
            {
                int groupid = string.IsNullOrEmpty(req["groupid"]) ? 0 : Convert.ToInt32(req["groupid"]);
                CreateUserGroupResponse res = this.ServiceClient.Post<CreateUserGroupResponse>(new CreateUserGroupRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value), Id = groupid });
            }
            return View();
        }

        public string GetUserGroups(int userid)
        {
            string html = string.Empty;
            var fr = this.ServiceClient.Get<GetUser2UserGroupResponse>(new GetUser2UserGroupRequest { id = userid, TenantAccountId = ViewBag.cid });
            List<string> usergrouplist = fr.Data.ContainsKey("usergroups") ? fr.Data["usergroups"].ToString().Replace("[", "").Replace("]", "").Split(new char[] { ',' }).ToList() : new List<string>();

            foreach (var key in fr.Data.Keys)
            {
                if (key != "usergroups")
                {
                    var checkedrole = usergrouplist.Contains(key) ? "checked" : string.Empty;
                    html += @"
                <div class='row'>
                    <div class='col-md-1'>
                        <input type ='checkbox' @checkedrole name = '@usergroup' value = '@id' aria-label='...'>
                    </div>

                    <div class='col-md-8'>
                        <h4 name = 'head4' style='color:black;'>@usergroup</h4>
                        <p class='text-justify'>dsgfds dgfrdhg dfhgdrewteberyrt reyhrtu6trujhfg reyer5y54</p>
                        <h6>
                            <i style = 'font-style:italic;' > Created by Mr X on 12/09/2017 at 02:00 pm</i>
                        </h6>
                    </div>               
                </div> ".Replace("@usergroup", fr.Data[key].ToString()).Replace("@id", key).Replace("@checkedrole", checkedrole);
                }
            }
            return html;
        }

		//[HttpGet]
		//public IActionResult CreateUser()
		//{
		//	var fr = this.ServiceClient.Get<GetUserEditResponse>(new GetUserEditRequest { Id = 0, TenantAccountId = ViewBag.cid });
		//	ViewBag.roles = JsonConvert.SerializeObject(fr.Roles);
		//	ViewBag.EBUserGroups = JsonConvert.SerializeObject(fr.EbUserGroups);
		//	List<EbRole> Sysroles = new List<EbRole>();
		//	foreach (var role in Enum.GetValues(typeof(SystemRoles)))
		//	{
		//		Sysroles.Add(new EbRole() { Name = role.ToString(), Description = "SystemRole_" + role, Id = (int)role });
		//	}
		//	ViewBag.SystemRoles = JsonConvert.SerializeObject(Sysroles);
		//	return View();
		//}

		[HttpGet]
		[HttpPost]
        public IActionResult CreateUser(int itemid)
        {
			List<EbRole> Sysroles = new List<EbRole>();
			foreach (var role in Enum.GetValues(typeof(SystemRoles)))
			{
				Sysroles.Add(new EbRole() { Name= role.ToString(), Description = "SystemRole_"+ role, Id = (int)role });
			}
			ViewBag.SystemRoles = JsonConvert.SerializeObject(Sysroles);
			var fr = this.ServiceClient.Get<GetUserEditResponse>(new GetUserEditRequest { Id = itemid, TenantAccountId = ViewBag.cid });
			ViewBag.Roles = JsonConvert.SerializeObject(fr.Roles);
			ViewBag.EBUserGroups = JsonConvert.SerializeObject(fr.EbUserGroups);
			if (itemid > 0)
			{
				ViewBag.U_Name = fr.UserData["name"];
				ViewBag.U_Email = fr.UserData["email"];
				ViewBag.U_Roles = JsonConvert.SerializeObject(fr.UserRoles);
				ViewBag.U_Groups = JsonConvert.SerializeObject(fr.UserGroups);
			}
			else
			{
				ViewBag.U_Roles = "";
				ViewBag.U_Groups = "";
			}
			ViewBag.itemid = itemid;
			return View();
        }

        public void SaveUser(int userid, string roles, string usergroups)
        {
            var req = this.HttpContext.Request.Form;
            Dictionary<string, object> Dict = new Dictionary<string, object>();

            Dict["firstname"] = req["firstname"];
            Dict["email"] = req["email"];
            Dict["pwd"] = req["pwd"];
            Dict["roles"] = string.IsNullOrEmpty(roles) ? string.Empty : roles;
            Dict["group"] = string.IsNullOrEmpty(usergroups) ? string.Empty : usergroups;

            //  IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);

            CreateUserResponse res = this.ServiceClient.Post<CreateUserResponse>(new CreateUserRequest { Id = userid, Colvalues = Dict });

        }

        public string GetAllUsers(string searchtext)
        {
            string html = string.Empty;
            Dictionary<string, object> Dict = new Dictionary<string, object>();
            Dict["searchtext"] = searchtext;
            var fr = this.ServiceClient.Get<GetUsersResponse>(new GetUsersRequest { Colvalues = Dict, TenantAccountId = ViewBag.cid });
            foreach (var key in fr.Data.Keys)
            {
                html += "<div id ='@userid' class='alert alert-success columnDrag'>@users</div>".Replace("@users", fr.Data[key].ToString()).Replace("@userid", key);
            }
            return html;
        }

    }
}

