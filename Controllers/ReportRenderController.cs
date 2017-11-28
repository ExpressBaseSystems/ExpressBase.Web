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


namespace ExpressBase.Web.Controllers
{
    public partial class HeaderFooter : PdfPageEventHelper
    {
        private ReportRenderController Controller { get; set; }
        PdfTemplate total;

        public HeaderFooter(ReportRenderController _c) : base()
        {
            this.Controller = _c;
        }
    }
    public class ReportRenderController : EbBaseNewController
    {
        public ReportRenderController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }
        public RowColletion dt;
        DataSourceColumnsResponse cresp = new DataSourceColumnsResponse();
        DataSourceDataResponse dresp = new DataSourceDataResponse();
        ColumnColletion __columns = null;

        EbReport Report = new EbReport();
        Font f = FontFactory.GetFont(FontFactory.HELVETICA, 7);
        float printingTop = 0;
        public List<double> total = new List<double>();
        Dictionary<int, double> totalOfColumn = new Dictionary<int, double>();
        PdfContentByte cb;
        
       

        //public IActionResult Index()
        //{
        //    var resultlist = this.ServiceClient.Get<EbObjectListResponse>(new EbObjectObjListRequest { EbObjectType = 3 });
        //    ViewBag.reports = resultlist.Data;
        //    return View();
        //}

            public IActionResult Index()
        {
            var resultlist = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = "eb_roby_dev-eb_roby_dev-3-932-1649" });
            Report = EbSerializers.Json_Deserialize<EbReport>(resultlist.Data[0].Json);

            if(Report.DataSourceRefId != string.Empty)
            {
                cresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", Report.DataSourceRefId));
                if (cresp.IsNull)
                    cresp = this.ServiceClient.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { RefId = Report.DataSourceRefId });

                __columns = (cresp.Columns.Count > 1) ? cresp.Columns[1] : cresp.Columns[0];

                dresp = this.ServiceClient.Get<DataSourceDataResponse>(new DataSourceDataRequest { RefId = Report.DataSourceRefId, Draw = 1, Start = 0, Length = 100 });
                dt = dresp.Data;
            }
            
            Rectangle rec;
            if (Report.IsLandscape)
            {
                rec = new iTextSharp.text.Rectangle(Report.Height, Report.Width);
            }
            else
            {
                rec = new iTextSharp.text.Rectangle(Report.Width, Report.Height);
            }
            Document d = new Document(rec/*, repdef.Margins.Left, repdef.Margins.Right, repdef.Margins.Top, repdef.Margins.Bottom*/);
            MemoryStream ms1= new MemoryStream();
            PdfWriter writer = PdfWriter.GetInstance(d, ms1);
            writer.Open();
            d.Open();
            writer.PageEvent = new HeaderFooter(this);
            writer.CloseStream = true;//important
            cb = writer.DirectContent;
            ColumnText ct = new ColumnText(cb);
            ct.SetSimpleColumn(new Phrase("column_val"), 100F, 100F, 200F, 200F, 15, Element.ALIGN_LEFT);
            ct.Go();
            foreach (EbReportHeader r_header in Report.ReportHeaders)
            {
                DrawFields(r_header);

            }
            foreach (EbPageHeader p_header in Report.PageHeaders)
            {
                DrawFields(p_header);
            }
            foreach (EbReportDetail detail in Report.Detail)
            {
                DrawFields(detail);
            }
            foreach (EbPageFooter p_footer in Report.PageFooters)
            {
                DrawFields(p_footer);
            }
            foreach (EbReportFooter r_footer in Report.ReportFooters)
            {
                DrawFields(r_footer);
            }
            d.Close();
            ms1.Position = 0;
            return new FileStreamResult(ms1, "application/pdf");
        }

        public void DrawFields(dynamic section) {
            var column_name = "";
            var column_val = "";
            foreach (EbReportFields field in section.Fields)
            {
                if (field.GetType() == typeof(EbText)) {
                    column_val = field.Title;
                    DrawTextBox(field, column_val);
                }
                else if (field.GetType() == typeof(EbReportCol))
                {
                    var table = field.Title.Split('.')[0];
                    column_name = field.Title.Split('.')[1];
                    var columnindex = 0;
                    foreach (var col in __columns)
                    {
                        if (col.ColumnName == column_name)
                        {
                            column_val = dt[0][columnindex].ToString();
                            //continue;
                        }
                        columnindex++;
                    }
                    DrawTextBox(field, column_val);
                }
                else if (field.GetType() == typeof(EbCircle))
                {
                     DrawCircle(field);
                }               
            }
            printingTop += section.Height;
        }
        public void DrawTextBox(EbReportFields field, string column_val)
        {
            float urx = field.Width + field.Left;
            float ury = Report.Height - (printingTop + field.Height);
            float llx = field.Left;
            float lly = Report.Height - (printingTop + field.Top + field.Height);

            ColumnText ct = new ColumnText(cb);
            ct.SetSimpleColumn(new Phrase(column_val), llx, lly, urx, ury, 15, Element.ALIGN_LEFT);
            ct.Go();
        }
        public void DrawCircle(EbReportFields field)
        {
            float radius = field.Width / 2;
            float xval = field.Left + radius;
            float yval = Report.Height - (field.Top + radius);

            // cb.SetColorStroke();
            cb.Circle(xval, yval, radius);
            cb.Stroke();
        }
    }
}