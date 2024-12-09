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
using System.IO;
using System.Runtime.Serialization;

namespace ExpressBase.Web.Controllers
{
    public class ReportRenderController : EbBaseIntCommonController
    {
        private IActionResult Pdf { get; set; }

        public ReportRenderController(IServiceClient sclient, IRedisClient redis, PooledRedisClientManager pooledRedisManager) : base(sclient, redis, pooledRedisManager) { }

        public IActionResult Index(string refid, bool renderLimit = false)
        {
            ViewBag.Refid = refid;
            EbReport Report = EbFormHelper.GetEbObject<EbReport>(refid, this.ServiceClient, this.Redis, null, this.PooledRedisManager);
            //EbObjectParticularVersionResponse resultlist = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
            //EbReport Report = EbSerializers.Json_Deserialize<EbReport>(resultlist.Data[0].Json);
            using (var redisReadOnly = this.PooledRedisManager.GetReadOnlyClient())
                Report.AfterRedisGet(Redis, this.ServiceClient, redisReadOnly as RedisClient);
            ViewBag.Fd = Report;
            ViewBag.RenderLimit = renderLimit;
            ViewBag.DispName = Report.DisplayName;
            return View();
        }

        public bool Render(string refid, List<Param> Params, bool useRwDb = false)
        {
            ReportRenderResponse Res = null;
            try
            {
                ProtoBufServiceClient pclient = new ProtoBufServiceClient(this.ServiceClient);
                Res = pclient.Get<ReportRenderResponse>(new ReportRenderRequest { Refid = refid, RenderingUserAuthId = this.LoggedInUser.AuthId, ReadingUserAuthId = this.LoggedInUser.AuthId, Params = Params, UseRwDb = useRwDb });
                Res.StreamWrapper.Memorystream.Position = 0;
                // Set the Content-Disposition header for the file name
                Response.Headers.Add("Content-Disposition", $"inline; filename={Res.ReportName + ".pdf"}");
            }
            catch (Exception e)
            {
                Console.WriteLine("--------------REPORT exception TS ---  " + e.Message + "\n" + e.StackTrace);
            } 


            // Return the PDF file 
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

        public IActionResult Renderlink(string refid, string _params, bool rw = false)
        {
            byte[] encodedDataAsBytes = System.Convert.FromBase64String(_params);
            string returnValue = System.Text.ASCIIEncoding.ASCII.GetString(encodedDataAsBytes);
            List<Param> param = (returnValue == null) ? null : JsonConvert.DeserializeObject<List<Param>>(returnValue);
            Render(refid, param, rw);
            // visualizations logic to be implemented
            if ((Pdf as FileStreamResult).FileStream.Length > 0)
                return Pdf;
            else
                return Redirect("/StatusCode/500");
        }

        public void RenderlinkMulti(string refid, string _params, string Sub)
        {
            try
            {
                ProtoBufServiceClient pclient = new ProtoBufServiceClient(this.ServiceClient);
                ReportRenderResponse Res = pclient.Get<ReportRenderResponse>(new ReportRenderMultipleRequest
                {
                    Refid = refid,
                    RenderingUserAuthId = this.LoggedInUser.AuthId,
                    ReadingUserAuthId = this.LoggedInUser.AuthId,
                    Params = _params,
                    SubscriptionId = Sub
                });
            }
            catch (Exception e)
            {
                Console.WriteLine("--------------REPORT exception TS ---  " + e.Message + "\n" + e.StackTrace);
            }
        }

        public IActionResult RenderLinkMultiSync(string refId, string rowId)
        {
            try
            {
                using (ProtoBufServiceClient pclient = new ProtoBufServiceClient(this.ServiceClient))
                {
                    List<Param> p = new List<Param> { new Param { Name = "id", Value = rowId, Type = "16" } };
                    ReportRenderMultipleSyncResponse Res = pclient.Get<ReportRenderMultipleSyncResponse>(new ReportRenderMultipleSyncRequest { Refid = refId, RenderingUserAuthId = this.LoggedInUser.AuthId, Params = p });
                    if (Res.Id > 0)
                        return Redirect(Res.Message);
                }
            }
            catch (Exception e) { }
            return Redirect("/StatusCode/500");
        }

        public IActionResult RenderforBot(string refid)
        {
            Render(refid, null);
            return Pdf;
        }
    }

}