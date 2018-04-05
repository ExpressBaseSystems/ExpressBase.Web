using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using iTextSharp.text;
using ServiceStack;
using ExpressBase.Objects.ReportRelated;
using ExpressBase.Common.Objects;
using ExpressBase.Data;
using iTextSharp.text.pdf;
using System.IO;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ServiceStack.Redis;
using ExpressBase.Common;
using ExpressBase.Objects;
using System.Drawing;
using static ExpressBase.Objects.ReportRelated.EbReportField;
using System.Net.Http;
using System.Net;
using System.Xml;
using System.Web;
using System.Text;
using Newtonsoft.Json;
using ExpressBase.Web2;
using ExpressBase.Security;
using ExpressBase.Common.Data;

namespace ExpressBase.Web.Controllers
{
    public class ReportRenderController : EbBaseIntController
    {
        private static IActionResult Pdf { get; set; }
        public ReportRenderController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }
        public IActionResult Index(string refid)
        {
            ViewBag.Refid = refid;
            EbObjectParticularVersionResponse resultlist = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
            EbReport Report = EbSerializers.Json_Deserialize<EbReport>(resultlist.Data[0].Json);
            Report.AfterRedisGet(this.Redis, this.ServiceClient);
            ViewBag.Fd = Report; /*if (Report.EbDataSource.FilterDialog != null)*/
            {
                ViewBag.Fd = Report;
                //  return ViewComponent("ParameterDiv", new { paramDiv = Report.EbDataSource.FilterDialog });
            }

            return View();
        }

        public void BeforeRender(string refid, string rowData, string filterValues, int tabNum)
        {
            List<Param> pp = EbSerializers.Json_Deserialize(filterValues);
            var x = Render(refid, pp);
        }
        public bool Render(string refid, List<Param> Params)
        {
            Console.WriteLine("--------------REPORT start ts ---  " + DateTime.Now);
            var pclient = new ProtoBufServiceClient(this.ServiceClient.BaseUri);
            pclient.BearerToken = this.ServiceClient.BearerToken;
            pclient.Timeout = TimeSpan.FromMinutes(3);
            ReportRenderResponse resultlist1 = null;
            try
            {
                var x = string.Format("{0}-{1}-{2}", ViewBag.cid, ViewBag.email, ViewBag.wc);
                User user = this.Redis.Get<User>(string.Format("{0}-{1}-{2}", ViewBag.cid, ViewBag.email, ViewBag.wc));
                resultlist1 = pclient.Get<ReportRenderResponse>(new ReportRenderRequest { Refid = refid, Fullname = user.FullName, Params = Params });
                resultlist1.StreamWrapper.Memorystream.Position = 0;
            }
            catch (Exception e)
            {
                Console.WriteLine("--------------REPORT exception TS ---  " + DateTime.Now + "\n " + e.Message + "\n" + e.StackTrace);

            }
            Pdf = new FileStreamResult(resultlist1.StreamWrapper.Memorystream, "application/pdf");
            return true;
        }

        public IActionResult RenderReport()
        {
            return Pdf;
        }
    }
}