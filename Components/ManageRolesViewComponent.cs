using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Newtonsoft.Json;
using System.Reflection;
using ExpressBase.Objects;
using ExpressBase.Common.Structures;
using ExpressBase.Common;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Components
{
	public class ManageRolesViewComponent : ViewComponent
	{
		protected JsonServiceClient ServiceClient { get; set; }

		protected RedisClient Redis { get; set; }

		public ManageRolesViewComponent(IServiceClient _client, IRedisClient _redis)
		{
			this.ServiceClient = _client as JsonServiceClient;
			this.Redis = _redis as RedisClient;
		}
		public async Task<IViewComponentResult> InvokeAsync(int itemid)
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
		private string GetPermissionOperationsAsJs()
		{
			Assembly assembly = Assembly.GetAssembly(typeof(EbWebForm)); //DO NOT CHANGE
			List<Eb_ObjectTypeOperations> _listObj = new List<Eb_ObjectTypeOperations>();

			foreach (EbObjectType objectType in EbObjectTypes.Enumerator)
			{
				if (objectType.IsUserFacing)
				{
					var eOperations = assembly.GetType(string.Format("ExpressBase.Objects.Eb{0}", objectType.Name))
					.GetField("Operations").GetValue(null);

					if (eOperations != null)
					{
						var _obj = new Eb_ObjectTypeOperations { Op_Id = objectType.IntCode, Op_Name = objectType.Name, Operations = new List<string>() };
						foreach (var Op in (eOperations as EbOperations).Enumerator)
							_obj.Operations.Add(Op.ToString());

						_listObj.Add(_obj);
					}
				}
			}

			return EbSerializers.Json_Serialize(_listObj);
		}
	}
}
