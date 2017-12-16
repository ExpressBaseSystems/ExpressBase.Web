using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;

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
			return View();
		}


		public object GetObjectAndPermission(string roleId, int appId)
		{
			var fr = this.ServiceClient.Get<GetObjectAndPermissionResponse>(new GetObjectAndPermissionRequest { RoleId = Convert.ToInt32(roleId), AppId = appId });
			return JsonConvert.SerializeObject(fr);
		}

	}
}
