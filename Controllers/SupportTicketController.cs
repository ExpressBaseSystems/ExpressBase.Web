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
using System.Net.Http.Formatting;
using Microsoft.AspNetCore.Http;
using System.Collections.Specialized;

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
				ViewBag.soluids = ts.soldispid;
				ViewBag.solunames = ts.solname;
				ViewBag.isolu = ts.solid;
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

		public IActionResult imgtest()
		{
			
			return View();
		}
		public IActionResult imgtest1()
		{
			
			return View();
		}



		[HttpPost]

		public void testupload()
		{
			try
			{
				var req = this.HttpContext.Request.Form;
				for (int i = 0; i < HttpContext.Request.Form.Files.Count; i++)
				{
					var file = HttpContext.Request.Form.Files[i];

					//var fileName = Path.GetFileName(file.FileName);
				}
			}
			catch(Exception e)
			{

			}
			

		}





		public void SaveBugDetails(string title,string descp,string priority,string solid,string type_f_b)
		{
			string usrtyp = null;

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
			var httpreq = this.HttpContext.Request.Form;

			for (int i = 0; i < httpreq.Files.Count; i++)
			{
				var file = httpreq.Files[i];

				//var fileName = Path.GetFileName(file.FileName);
			}

			SaveBugResponse sbr = this.ServiceClient.Post<SaveBugResponse>(new SaveBugRequest
			{
				title = httpreq["title"].ToString(),
				description = httpreq["descp"].ToString(),
				priority = httpreq["priority"].ToString(),
				solutionid = httpreq["solid"].ToString(),
				type_b_f = httpreq["type_f_b"].ToString(),
				status = "onhold",
				usertype = usrtyp,
				fullname = this.LoggedInUser.FullName,
				email = this.LoggedInUser.Email,
				upload_files = httpreq.Files
			}); ;
		}


		public void UpdateTicket(string title, string descp, string priority,string tktid)
		{
			UpdateTicketResponse upr = this.ServiceClient.Post<UpdateTicketResponse>(new UpdateTicketRequest
			{
				ticketid=tktid,
				title=title,
				description=descp,
				priority=priority
			});
		}

	}
}
