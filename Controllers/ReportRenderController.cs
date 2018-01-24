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

namespace ExpressBase.Web.Controllers
{
    public class ReportRenderController : EbBaseIntController
    {
        public ReportRenderController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        public IActionResult SS_Report(string refid)
        {
            var pclient = new ProtoBufServiceClient(this.ServiceClient.BaseUri);
            pclient.BearerToken = this.ServiceClient.BearerToken;
            pclient.Timeout = TimeSpan.FromMinutes(3);
            ReportRenderResponse resultlist1 = null;
            try
            {
                resultlist1 = pclient.Get<ReportRenderResponse>(new ReportRenderRequest { Refid = refid });
                resultlist1.StreamWrapper.Memorystream.Position = 0;
            }
            catch (Exception e)
            {

            }
            return new FileStreamResult(resultlist1.StreamWrapper.Memorystream, "application/pdf");
        }

    }
}