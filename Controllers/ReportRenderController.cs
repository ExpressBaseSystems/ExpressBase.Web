using ExpressBase.Common;
using ExpressBase.Common.Data;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

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

        public void BeforeRender(dvreport dvreport)
        {
            //List<Param> pp = EbSerializers.Json_Deserialize<List<Param>>(filterValues);
            var x = Render(dvreport.refid, dvreport.Params);
        }
        public bool Render(string refid, List<Param> Params)
        {
            //Console.WriteLine("--------------REPORT start ts ---  " + DateTime.Now);
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
        public IActionResult RenderforBot(string refid)
        {
            Render(refid, null);
            return Pdf;
        }
    }

    [DataContract]
    public class dvreport
    {
        [DataMember(Order =1)]
        public string refid { get; set; }

        [DataMember(Order = 2)]
        public List<Param> Params { get; set; }
    }
}