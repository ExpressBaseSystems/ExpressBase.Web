using ExpressBase.Common;
using ExpressBase.Common.Objects;
using ExpressBase.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Reflection;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
	public class SecurityController : EbBaseNewController
	{
		public SecurityController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }
		// GET: /<controller>/
		public IActionResult Index()
        {
            return View();
        }
		public IActionResult ManageRoles2(int itemid)
		{
			var fr = this.ServiceClient.Get<GetManageRolesResponse>(new GetManageRolesRequest { id = itemid, TenantAccountId = ViewBag.cid });
			ViewBag.AppCollection = JsonConvert.SerializeObject(fr.ApplicationCollection);
			ViewBag.SelectedRoleInfo = JsonConvert.SerializeObject(fr.SelectedRoleInfo);
			ViewBag.PermissionList = JsonConvert.SerializeObject(fr.PermissionList);
			ViewBag.RoleId = itemid;
			TempData["_dict"] = GetPermissionOperationsAsJs();

			return View();
		}


		public object GetObjectAndPermission(string roleId, int appId)
		{
			var fr = this.ServiceClient.Get<GetObjectAndPermissionResponse>(new GetObjectAndPermissionRequest { RoleId = Convert.ToInt32(roleId), AppId = appId });
			return JsonConvert.SerializeObject(fr);
		}

		//GET  PERMISSION OPERATIONS AS JS
		private string GetPermissionOperationsAsJs()
		{
			Assembly assembly = Assembly.GetAssembly(typeof(EbWebForm)); //DO NOT CHANGE
			List<Eb_ObjectTypeOperations> _listObj = new List<Eb_ObjectTypeOperations>();
			//Dictionary<string, List<string>> _dict = new Dictionary<string, List<string>>();
			foreach (var ObjectType in Enum.GetValues(typeof(EbObjectTypesUI)))
			{
				string sObjectType = ObjectType.ToString();
				int sIntObj=(int)ObjectType;
				var eOperations = assembly.GetType(string.Format("ExpressBase.Objects.{0}+Operations", sObjectType));
				if (eOperations != null)
				{
					//_dict.Add(sObjectType, new List<string>());
					Eb_ObjectTypeOperations _obj = new Eb_ObjectTypeOperations() {Op_Id = sIntObj, Op_Name = sObjectType, Operations = new List<string>() };
					foreach (var Op in Enum.GetValues(eOperations))
						//_dict[ObjectType.ToString()].Add(Op.ToString());
						_obj.Operations.Add(Op.ToString());
					_listObj.Add(_obj);
				}
			}
			return EbSerializers.Json_Serialize(_listObj);
		}
	}
}
