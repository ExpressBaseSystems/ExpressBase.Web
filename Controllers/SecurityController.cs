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

		
		public IActionResult CommonList(string type)
		{
			IServiceClient client = this.ServiceClient;
			ViewBag.ListType = type;
			if (type == "TestUser")
			{
				var fr = this.ServiceClient.Get<GetUsersResponse1>(new GetUsersRequest1());
				ViewBag.dict = JsonConvert.SerializeObject(fr.Data);
			}
			else if (type == "TestRoles")
			{
				var fr = this.ServiceClient.Get<GetRolesResponse1>(new GetRolesRequest1());
				ViewBag.dict = JsonConvert.SerializeObject(fr.Data);
			}
			else if (type == "TestUserGroup")
			{
				var fr = this.ServiceClient.Get<GetUserGroupResponse1>(new GetUserGroupRequest1());
				ViewBag.dict = JsonConvert.SerializeObject(fr.Data);
			}
			else if (type == "usergroup")
			{
				var fr = this.ServiceClient.Get<GetUserGroupResponse>(new GetUserGroupRequest());
				ViewBag.dict = fr.Data;
			}
			
			else if (type == "roles")
			{
				var fr = this.ServiceClient.Get<GetRolesResponse>(new GetRolesRequest());
				ViewBag.dict = fr.Data;
			}
			else
			{
				var fr = this.ServiceClient.Get<GetUsersResponse>(new GetUsersRequest());
				ViewBag.dict = fr.Data;
			}
			if (ViewBag.isAjaxCall)
				return PartialView();
			else
				return View();
		}




		[HttpGet]
		public IActionResult UserPreferences()
		{
			var res = this.ServiceClient.Post<EditUserPreferenceResponse>(new EditUserPreferenceRequest());
			if (res.Data != null)
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
			var res = this.ServiceClient.Post<UserPreferenceResponse>(new UserPreferenceRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value) });
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
			List<string> UserStatus = new List<string>();
			foreach (var status in Enum.GetValues(typeof(EbUserStatus)))
			{
				UserStatus.Add(status.ToString());
			}
			ViewBag.UserStatusList = UserStatus;
			if (itemid > 0)
			{
				ViewBag.U_Info = fr.UserData;
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

		public int SaveUser(int userid, string roles, string usergroups, string usrinfo)
		{
			//var req = this.HttpContext.Request.Form;
			Dictionary<string, string> Dict = JsonConvert.DeserializeObject<Dictionary<string, string>>(usrinfo);
			//Dictionary<string, object> Dict = new Dictionary<string, object>();
			//Dict["roles"] = string.IsNullOrEmpty(roles) ? string.Empty : roles;
			//Dict["group"] = string.IsNullOrEmpty(usergroups) ? string.Empty : usergroups;

			//  IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
			SaveUserResponse res = this.ServiceClient.Post<SaveUserResponse>(new SaveUserRequest {
				Id = userid,
				FullName = Dict["fullname"],
				NickName = Dict["nickname"],
				EmailPrimary = Dict["email"],
				EmailSecondary = Dict["alternateemail"],
				DateOfBirth = Dict["dob"],
				Sex = Dict["sex"],
				PhonePrimary = Dict["phoneprimary"],
				PhoneSecondary = Dict["phonesecondary"],
				LandPhone = Dict["landline"],
				PhoneExtension = Dict["extension"],
				FbId = Dict["fbid"],
				FbName = Dict["fbname"],
				Roles = string.IsNullOrEmpty(Dict["roles"]) ? string.Empty : Dict["roles"],
				UserGroups = string.IsNullOrEmpty(Dict["usergroups"]) ? string.Empty : Dict["usergroups"],
				StatusId = Dict["statusid"],
				Hide = Dict["hide"]
			});
			return res.id;
		}

		public bool isValidEmail(string reqEmail)
		{
			var temp = this.ServiceClient.Post<bool>(new UniqueCheckRequest { email = reqEmail });
			return temp;
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
			//var req = this.HttpContext.Request.Form;
			//if (itemid > 0)
			//{
			//	var fr = this.ServiceClient.Get<GetManageUserGroupResponse>(new GetManageUserGroupRequest { id = itemid, TenantAccountId = ViewBag.cid });
			//	List<int> userlist = fr.Data.ContainsKey("userslist") ? fr.Data["userslist"].ToString().Replace("[", "").Replace("]", "").Split(',').Select(int.Parse).ToList() : new List<int>();
			//	ViewBag.UGName = fr.Data["name"];
			//	ViewBag.UGDescription = fr.Data["description"];
			//	ViewBag.itemid = itemid;
			//	string html = "";
			//	if (fr.Data.ContainsKey("userslist"))
			//	{
			//		foreach (var element in userlist)
			//		{
			//			html += "<div id ='@userid' class='alert alert-success columnDrag'>@users<button class='close' type='button' style='font-size: 15px;margin: 2px 0 0 4px;'>x</button></div>".Replace("@users", fr.Data[element.ToString()].ToString()).Replace("@userid", element.ToString());
			//		}

			//	}
			//	ViewBag.UserList = html;

			//}
			//else
			//{
			//	//int groupid = string.IsNullOrEmpty(req["groupid"]) ? 0 : Convert.ToInt32(req["groupid"]);
			//	Dictionary<string, object> Colval = new Dictionary<string, object>();
			//	Colval.Add(itemid.ToString(),"");
			//	GetManageUserGroupResponse res = this.ServiceClient.Post<GetManageUserGroupResponse>(new GetManageUserGroupRequest { Colvalues = Colval, id = itemid });
			//}

			var fr = this.ServiceClient.Get<GetManageUserGroupResponse>(new GetManageUserGroupRequest { id = itemid, TenantAccountId = ViewBag.cid });
			ViewBag.SelectedUserGroupInfo = JsonConvert.SerializeObject(fr.SelectedUserGroupInfo);
			ViewBag.UsersList = JsonConvert.SerializeObject(fr.UsersList);
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
