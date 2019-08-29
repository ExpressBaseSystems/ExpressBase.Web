using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
	public class SupportTicketController : EbBaseIntCommonController
	{
		public SupportTicketController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }
		// GET: /<controller>/
		public IActionResult bugsupport()
		{
			if (ViewBag.wc.Equals("tc")){

				TenantSolutionsResponse ts = this.ServiceClient.Post<TenantSolutionsResponse>(new TenantSolutionsRequest { });
				ViewBag.soluids = ts.solid;
				ViewBag.solunames = ts.solname;
			}
			FetchSupportResponse fsr = this.ServiceClient.Post<FetchSupportResponse>(new FetchSupportRequest{});
			ViewBag.tkttable = JsonConvert.SerializeObject(fsr);


			return View();
		}

		public IActionResult EditTicket(string tktno)
		{
			SupportDetailsResponse sd = this.ServiceClient.Post<SupportDetailsResponse>(new SupportDetailsRequest {
				ticketno=tktno
			});
			ViewBag.tktdetails = JsonConvert.SerializeObject(sd);
			return View();
		}


		public void SaveBugDetails(string title,string descp,string priority,string solid,string type_f_b)
		{
			string usrtyp = "tenant";
			if (ViewBag.wc.Equals("dc"))
			{
				solid = ViewBag.cid;
				usrtyp = "developer";
			}
			if (ViewBag.wc.Equals("uc"))
			{
				solid = ViewBag.cid;
				usrtyp = "user";
			}
			if (ViewBag.wc.Equals("tc"))
			{
				usrtyp = "tenant";
			}

			//SaveBugResponse sbr = this.ServiceClient.Post<SaveBugResponse>(new SaveBugRequest
			//{
			//	title=title,
			//	description=descp,
			//	priority=priority,
			//	solutionid=solid,
			//	type_b_f= type_f_b,
			//	status="onhold",
			//	usertype= usrtyp
			//});
		}
	}
}
