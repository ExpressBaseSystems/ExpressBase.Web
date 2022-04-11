﻿using ExpressBase.Common;
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
            ViewBag.RenderLimit = renderLimit;
            ViewBag.DispName = Report.DisplayName;
            return View();
        }

        public bool Render(string refid, List<Param> Params)
        {
            ReportRenderResponse Res = null;
            try
            {
                ProtoBufServiceClient pclient = new ProtoBufServiceClient(this.ServiceClient);
                Res = pclient.Get<ReportRenderResponse>(new ReportRenderRequest { Refid = refid, RenderingUserAuthId = this.LoggedInUser.AuthId, ReadingUserAuthId = this.LoggedInUser.AuthId, Params = Params });
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
            List<Param> param = (Params == null) ? null : JsonConvert.DeserializeObject<List<Param>>(Params);
            Render(refid, param);
            return Pdf;
        }

        public IActionResult Renderlink(string refid, string _params)
        {
            byte[] encodedDataAsBytes = System.Convert.FromBase64String(_params);
            string returnValue = System.Text.ASCIIEncoding.ASCII.GetString(encodedDataAsBytes);
            List<Param> param = (returnValue == null) ? null : JsonConvert.DeserializeObject<List<Param>>(returnValue);
            Render(refid, param);
            // visualizations logic to be implemented
            if ((Pdf as FileStreamResult).FileStream.Length > 0)
                return Pdf;
            else
                return Redirect("/StatusCode/500");
        }

        public IActionResult RenderlinkMulti(string refid, string _params)
        {
            try
            {
                ProtoBufServiceClient pclient = new ProtoBufServiceClient(this.ServiceClient);
                ReportRenderResponse Res = pclient.Get<ReportRenderResponse>(new ReportRenderMultipleRequest {
                    Refid = refid,
                    RenderingUserAuthId = this.LoggedInUser.AuthId, 
                    ReadingUserAuthId = this.LoggedInUser.AuthId,
                    Params = _params });
                Res.StreamWrapper.Memorystream.Position = 0;
                Pdf = new FileStreamResult(Res.StreamWrapper.Memorystream, "application/pdf");
                if ((Pdf as FileStreamResult).FileStream.Length > 0)
                    return Pdf;
            }
            catch (Exception e)
            {
                Console.WriteLine("--------------REPORT exception TS ---  " + e.Message + "\n" + e.StackTrace);
            }

            return Redirect("/StatusCode/500");
        }

        public IActionResult RenderforBot(string refid)
        {
            Render(refid, null);
            return Pdf;
        }
    }

}