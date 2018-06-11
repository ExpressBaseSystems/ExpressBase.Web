using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Data;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace ExpressBase.Web.Controllers
{
    public class ReportRenderController : EbBaseIntCommonController
    {
        private IActionResult Pdf { get; set; }

        public ReportRenderController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        public IActionResult Index(string refid, bool renderLimit = false)
        {
            ViewBag.Refid = refid;
            EbObjectParticularVersionResponse resultlist = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
            EbReport Report = EbSerializers.Json_Deserialize<EbReport>(resultlist.Data[0].Json);
            Report.AfterRedisGet(this.Redis, this.ServiceClient);
            ViewBag.Fd = Report;
            {
                ViewBag.Fd = Report;
            }

            ViewBag.RenderLimit = renderLimit;

            return View();
        }

        public bool Render(string refid, List<Param> Params)
        {

            ReportRenderResponse Res = null;
            try
            {
                var pclient = new ProtoBufServiceClient(this.ServiceClient);
                var x = string.Format(TokenConstants.SUB_FORMAT, ViewBag.cid, ViewBag.email, ViewBag.wc);
                User user = this.Redis.Get<User>(string.Format(TokenConstants.SUB_FORMAT, ViewBag.cid, ViewBag.email, ViewBag.wc));
                Res = pclient.Get<ReportRenderResponse>(new ReportRenderRequest { Refid = refid, Fullname = user.FullName, Params = Params });
                Res.StreamWrapper.Memorystream.Position = 0;
            }
            catch (Exception e)
            {
                Console.WriteLine("--------------REPORT exception TS ---  " + e.Message + "\n" + e.StackTrace);

            }

            Pdf = new FileStreamResult(Res.StreamWrapper.Memorystream, "application/pdf")
           // { FileDownloadName = Res.ReportName }
           ;
            return true;
        }

        public IActionResult RenderReport2(string refid, string Params)
        {
            List<Param> param = JsonConvert.DeserializeObject<List<Param>>(Params);
            Render(refid, param);

            return Pdf;
        }

        public IActionResult RenderforBot(string refid)
        {
            Render(refid, null);
            return Pdf;
        }
    }

}