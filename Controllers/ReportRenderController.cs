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
    //public partial class HeaderFooter : PdfPageEventHelper
    //{
    //    private ReportRenderController Controller { get; set; }
    //    public override void OnStartPage(PdfWriter writer, Document document)
    //    {
    //    }
    //    public override void OnEndPage(PdfWriter writer, Document d)
    //    {
    //        Controller.DrawPageHeader();
    //        Controller.DrawPageFooter();
    //        if (Controller.Report.IsLastpage == true) Controller.DrawReportFooter();
    //        Controller.Report.DrawWaterMark(Controller.pdfReader, d, writer);
    //    }

    //    public HeaderFooter(ReportRenderController _c) : base()
    //    {
    //        this.Controller = _c;
    //    }
    //}
    public class ReportRenderController : EbBaseIntController
    {
        public ReportRenderController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        public IActionResult SS_Report(string refid)
        {
            var pclient = new ProtoBufServiceClient(this.ServiceClient.BaseUri);
            pclient.BearerToken = this.ServiceClient.BearerToken;
            ReportRenderResponse resultlist1 = null;
            try
            {
                resultlist1 = pclient.Get<ReportRenderResponse>(new ReportRenderRequest { Refid = refid });
            }
            catch (Exception e)
            {

            }
            resultlist1.StreamWrapper.Memorystream.Position = 0;
            return new FileStreamResult(resultlist1.StreamWrapper.Memorystream, "application/pdf");
        }

    }
}