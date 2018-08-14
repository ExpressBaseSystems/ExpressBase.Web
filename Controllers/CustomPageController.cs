using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common.Structures;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class CustomPageController : EbBaseIntCommonController
	{
		public CustomPageController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

		//public IActionResult LeadManagement(string ac)
		//{
		//	//mode=0 -> new customer
		//	int mode = 0;
		//	if (!ac.IsNullOrEmpty())
		//		mode = 1;
		//	else
		//		ac = "null";

		//	var fr = this.ServiceClient.Get<GetManageLeadResponse>(new GetManageLeadRequest { AccId = ac, RequestMode = mode, TenantAccountId = ViewBag.cid });

		//	ViewBag.MC_Mode = mode;
		//	ViewBag.AccId = ac;
		//	ViewBag.CustomerData = fr.CustomerDataDict;
		//	ViewBag.CostCenter = fr.CostCenterDict;
		//	if(mode == 1)
		//	{
		//		ViewBag.FeedbackList = JsonConvert.SerializeObject(fr.FeedbackList);
		//	}		

		//	return View();
		//}

		//public int SaveCustomer(int Mode, string CustomerInfo)
		//{
		//	SaveCustomerResponse res = this.ServiceClient.Post<SaveCustomerResponse>(new SaveCustomerRequest { CustomerData = CustomerInfo, RequestMode = Mode });
		//	return res.Status;
		//}

		//public int SaveFollowup(string FollowupInfo)
		//{
		//	SaveCustomerFollowupResponse res = this.ServiceClient.Post<SaveCustomerFollowupResponse>(new SaveCustomerFollowupRequest { Data = FollowupInfo, UserName = this.LoggedInUser.FullName });
		//	return res.Status;
		//}


	}
}
