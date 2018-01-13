using ExpressBase.Common;
using ExpressBase.Common.Objects;
using ExpressBase.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security.Core;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
	public class SecurityController : EbBaseIntController
	{
		public SecurityController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }
		// GET: /<controller>/
		public IActionResult Index()
        {
            return View();
        }

		public IActionResult ConnectToFb()
		{
			return View();
		}
		//--------------MANAGE USER START------------------------------------
		public IActionResult ManageUser(int itemid)
		{
			List<EbRole> Sysroles = new List<EbRole>();
			foreach (var role in Enum.GetValues(typeof(SystemRoles)))
			{
				Sysroles.Add(new EbRole() { Name = role.ToString(), Description = "SystemRole_" + role, Id = (int)role });
			}
			ViewBag.SystemRoles = JsonConvert.SerializeObject(Sysroles);
			var fr = this.ServiceClient.Get<GetManageUserResponse>(new GetManageUserRequest { Id = itemid, TenantAccountId = ViewBag.cid });
			ViewBag.Roles = JsonConvert.SerializeObject(fr.Roles);
			ViewBag.EBUserGroups = JsonConvert.SerializeObject(fr.EbUserGroups);
			ViewBag.Role2RoleList = JsonConvert.SerializeObject(fr.Role2RoleList);
			if (itemid > 0)
			{
				ViewBag.U_Name = fr.UserData["name"];
				ViewBag.U_Email = fr.UserData["email"];
				ViewBag.U_Fb_Id = fr.UserData["socialid"];
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

		public int SaveUser(int userid, string roles, string usergroups)
		{
			var req = this.HttpContext.Request.Form;
			Dictionary<string, object> Dict = new Dictionary<string, object>();

			Dict["firstname"] = req["firstname"];
			Dict["email"] = req["email"];
			Dict["pwd"] = req["pwd"];
			Dict["roles"] = string.IsNullOrEmpty(roles) ? string.Empty : roles;
			Dict["group"] = string.IsNullOrEmpty(usergroups) ? string.Empty : usergroups;

			//  IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);

			SaveUserResponse res = this.ServiceClient.Post<SaveUserResponse>(new SaveUserRequest { Id = userid, Colvalues = Dict });
			return res.id;
		}


		//----------------MANAGE USERGROUPS START----------------------------
		//[HttpGet]
		//public IActionResult ManageUserGroups()
		//{
		//	return View();
		//}

		//[HttpPost]
		public IActionResult ManageUserGroups(int itemid)
		{
			var req = this.HttpContext.Request.Form;
			if (itemid > 0)
			{
				var fr = this.ServiceClient.Get<GetManageUserGroupResponse>(new GetManageUserGroupRequest { id = itemid, TenantAccountId = ViewBag.cid });
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
				GetManageUserGroupResponse res = this.ServiceClient.Post<GetManageUserGroupResponse>(new GetManageUserGroupRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value), id = groupid });
			}
			return View();
		}


		//---------------MANAGE ROLES START----------------------------------
		public IActionResult ManageRoles(int itemid)
		{
			var fr = this.ServiceClient.Get<GetManageRolesResponse>(new GetManageRolesRequest { id = itemid, TenantAccountId = ViewBag.cid });
			ViewBag.AppCollection = JsonConvert.SerializeObject(fr.ApplicationCollection);
			ViewBag.SelectedRoleInfo = JsonConvert.SerializeObject(fr.SelectedRoleInfo);
			ViewBag.PermissionList = JsonConvert.SerializeObject(fr.PermissionList);
			ViewBag.RoleId = itemid;
			TempData["_dict"] = GetPermissionOperationsAsJs();
			ViewBag.RoleList = JsonConvert.SerializeObject(fr.RoleList);
			ViewBag.Role2RoleList = JsonConvert.SerializeObject(fr.Role2RoleList);
			ViewBag.UsersList = JsonConvert.SerializeObject(fr.UsersList);
			return View();
		}

		//public object GetObjectAndPermission(string roleId, int appId)
		//{
		//	var fr = this.ServiceClient.Get<GetObjectAndPermissionResponse>(new GetObjectAndPermissionRequest { RoleId = Convert.ToInt32(roleId), AppId = appId });
		//	return JsonConvert.SerializeObject(fr);
		//}

		//GET  PERMISSION OPERATIONS AS JS
		private string GetPermissionOperationsAsJs()
		{
			Assembly assembly = Assembly.GetAssembly(typeof(EbWebForm)); //DO NOT CHANGE
			List<Eb_ObjectTypeOperations> _listObj = new List<Eb_ObjectTypeOperations>();
			foreach (var ObjectType in Enum.GetValues(typeof(EbObjectTypesUI)))
			{
				string sObjectType = ObjectType.ToString();
				int sIntObj=(int)ObjectType;
				var eOperations = assembly.GetType(string.Format("ExpressBase.Objects.{0}+Operations", sObjectType));
				if (eOperations != null)
				{
					Eb_ObjectTypeOperations _obj = new Eb_ObjectTypeOperations() {Op_Id = sIntObj, Op_Name = sObjectType, Operations = new List<string>() };
					foreach (var Op in Enum.GetValues(eOperations))
						_obj.Operations.Add(Op.ToString());
					_listObj.Add(_obj);
				}
			}
			return EbSerializers.Json_Serialize(_listObj);
		}

		public object GetUserDetails(string srchTxt)
		{
			var fr = this.ServiceClient.Get<GetUserDetailsResponse>(new GetUserDetailsRequest { SearchText=srchTxt, TenantAccountId = ViewBag.cid });
			return fr.UserList;
		}

		public string SaveRole(int _roleId,string _roleName,string _roleDesc,int _appId,string _permission, string _role2role, string _users)
		{
			Dictionary<string, object> Dict = new Dictionary<string, object>();
			string return_msg;
			Dict["roleid"] = _roleId;
			Dict["applicationid"] = _appId;
			Dict["role_name"] = _roleName;
			Dict["Description"] = _roleDesc;
			Dict["users"] = string.IsNullOrEmpty(_users) ? string.Empty : _users;
			Dict["permission"] = string.IsNullOrEmpty(_permission) ? string.Empty : _permission;
			Dict["dependants"] = string.IsNullOrEmpty(_role2role) ? string.Empty : _role2role;

			SaveRoleResponse res = this.ServiceClient.Post<SaveRoleResponse>(new SaveRoleRequest { Colvalues = Dict });
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



	}
}
