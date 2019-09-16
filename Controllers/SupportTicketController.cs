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
using System.IO;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
	public class SupportTicketController : EbBaseIntCommonController
	{
		public SupportTicketController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }
		// GET: /<controller>/
		public IActionResult bugsupport()
		{
			if (ViewBag.wc.Equals("tc"))
			{

				TenantSolutionsResponse ts = this.ServiceClient.Post<TenantSolutionsResponse>(new TenantSolutionsRequest { });
				ViewBag.soluids = ts.soldispid;
				ViewBag.solunames = ts.solname;
				ViewBag.isolu = ts.solid;
			}
			FetchSupportResponse fsr = this.ServiceClient.Post<FetchSupportResponse>(new FetchSupportRequest { });
			ViewBag.tkttable = JsonConvert.SerializeObject(fsr);


			return View();
		}

		public IActionResult EditTicket(string tktno)
		{
			SupportDetailsResponse sd = this.ServiceClient.Post<SupportDetailsResponse>(new SupportDetailsRequest
			{
				ticketno = tktno
			});


			for (var i = 0; i < sd.supporttkt.Count; i++)
			{
				var imgbyt = sd.supporttkt[i].Filecollection;
				if (imgbyt.Count > 0)
				{
					for (var j = 0; j < imgbyt.Count; j++)
					{
						byte[] imgs = imgbyt[j];
						string imageBase64Data = Convert.ToBase64String(imgs);
						string imageDataURL = string.Format("data:image/png;base64,{0}", imageBase64Data);
						sd.Filecollection1.Add(imageDataURL);
					}
					ViewBag.ImageData = sd.Filecollection1;
					ViewBag.ImageData1 = JsonConvert.SerializeObject(sd.Filecollection1);
				}


			}
			//byte[] imgs1= sd.supporttkt[0].Filecollection[0];


			ViewBag.tktdetails = JsonConvert.SerializeObject(sd);
			//return File(imgs1, "image/jpeg");
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







		public void SaveBugDetails(string title, string descp, string priority, string solid, string type_f_b, object fileCollection)
		{
			string usrtyp = null;
			SaveBugRequest sbrequest = new SaveBugRequest();
			var httpreq = this.HttpContext.Request.Form;
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
				solid = httpreq["solid"].ToString();
				usrtyp = "tenant";
			}

			if (httpreq.Files.Count > 0)
			{
				byte[] fileData = null;
				for (int i = 0; i < httpreq.Files.Count; i++)
				{
					var file = httpreq.Files[i];

					using (var memoryStream = new MemoryStream())
					{
						file.CopyTo(memoryStream);
						memoryStream.Seek(0, SeekOrigin.Begin);
						fileData = new byte[memoryStream.Length];
						memoryStream.ReadAsync(fileData, 0, fileData.Length);
						sbrequest.Filecollection.Add(fileData);
					}
				}
			}

			sbrequest.title = httpreq["title"].ToString();
			sbrequest.description = httpreq["descp"].ToString();
			sbrequest.priority = httpreq["priority"].ToString();
			sbrequest.solutionid = solid;
			sbrequest.type_b_f = httpreq["type_f_b"].ToString();
			sbrequest.status = "onhold";
			sbrequest.usertype = usrtyp;
			sbrequest.fullname = this.LoggedInUser.FullName;
			sbrequest.email = this.LoggedInUser.Email;


			SaveBugResponse sbr = this.ServiceClient.Post<SaveBugResponse>(sbrequest);
		}


		public void UpdateTicket(string title, string descp, string priority, string tktid)
		{
			UpdateTicketResponse upr = this.ServiceClient.Post<UpdateTicketResponse>(new UpdateTicketRequest
			{
				ticketid = tktid,
				title = title,
				description = descp,
				priority = priority
			});
		}

	}
}
