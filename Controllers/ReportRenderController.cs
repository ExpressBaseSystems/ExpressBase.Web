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

        EbReport Report = null;
        Font f = FontFactory.GetFont(FontFactory.HELVETICA, 5);
        float printingTop = 0;
        public List<double> total = new List<double>();
        Dictionary<int, double> totalOfColumn = new Dictionary<int, double>();
        PdfContentByte cb;
        ColumnText ct;

        public IActionResult Index(string refid)
        {
            //var resultlist = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = "eb_roby_dev-eb_roby_dev-3-889-1606" });
            var resultlist = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
            Report = EbSerializers.Json_Deserialize<EbReport>(resultlist.Data[0].Json);

            if (Report.DataSourceRefId != string.Empty)
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
            Document d = new Document(rec);

            MemoryStream ms1 = new MemoryStream();
            PdfWriter writer = PdfWriter.GetInstance(d, ms1);
            writer.Open();
            d.Open();
            writer.PageEvent = new HeaderFooter(this);
            writer.CloseStream = true;//important
            cb = writer.DirectContent;
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
                DrawDetails(detail);
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

        public void DrawFields(dynamic section)
        {
            var column_name = "";
            var column_val = "";
            foreach (EbReportFields field in section.Fields)
            {
                if (field.GetType() == typeof(EbText))
                {
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
                else if (field.GetType() == typeof(EbRect))
                {
                    DrawRectangle(field);
                }
                else if (field.GetType() == typeof(EbHl))
                {
                    DrawHLine(field);
                }
                else if (field.GetType() == typeof(EbVl))
                {
                    DrawVLine(field);
                }
                else if (field.GetType() == typeof(EbArrR))
                {
                    DrawArrowR(field);
                }
                else if (field.GetType() == typeof(EbArrL))
                {
                    DrawArrowL(field);
                }
                else if (field.GetType() == typeof(EbArrU))
                {
                    DrawArrowU(field);
                }
                else if (field.GetType() == typeof(EbArrD))
                {
                    DrawArrowD(field);
                }
                else if (field.GetType() == typeof(EbByArrH))
                {
                    DrawByArrH(field);
                }
                else if (field.GetType() == typeof(EbByArrV))
                {
                    DrawByArrV(field);
                }
            }
            printingTop += section.Height;
        }
        public void DrawDetails(dynamic section)
        {
            float detailtop = 0;
            var column_name = "";
            var column_val = "";
            foreach (EbReportFields field in section.Fields)
            {
                if (field.GetType() == typeof(EbReportCol))
                {
                    var table = field.Title.Split('.')[0];
                    column_name = field.Title.Split('.')[1];
                    var columnindex = 0;
                    foreach (var col in __columns)
                    {
                        if (col.ColumnName == column_name)
                        {
                            detailtop = 0;
                            for (int i = 0; detailtop < section.Height && i < dt.Count; i++)
                            {
                                column_val = dt[i][columnindex].ToString();
                                detailtop += field.Height;
                                DrawDetailTextBox(field, column_val, detailtop);
                            }
                        }
                        columnindex++;
                    }
                }
            }
            printingTop += section.Height;
        }

        public void DrawTextBox(EbReportFields field, string column_val)
        {
            var urx = field.Width + field.Left;
            var ury = Report.Height - (printingTop + field.Top);
            var llx = field.Left;
            var lly = Report.Height - (printingTop + field.Top + field.Height);

            ColumnText ct1 = new ColumnText(cb);
            ct1.SetSimpleColumn(new Phrase(column_val), llx, lly, urx, ury, 15, Element.ALIGN_LEFT);
            ct1.Go();
        }

        public void DrawDetailTextBox(EbReportFields field, string column_val, float detailtop)
        {
            var urx = field.Width + field.Left;
            var ury = Report.Height - (printingTop + field.Top + detailtop);
            var llx = field.Left;
            var lly = Report.Height - (printingTop + field.Top + field.Height + detailtop);

            ColumnText ct1 = new ColumnText(cb);
            ct1.SetSimpleColumn(new Phrase(column_val), llx, lly, urx, ury, 15, Element.ALIGN_LEFT);
            ct1.Go();
        }

        public void DrawCircle(EbReportFields field)
        {
            float radius = field.Width / 2;
            float xval = field.Left + radius;
            float yval = Report.Height - (printingTop + field.Top + radius);


           // cb.SetColorStroke(BaseColor.
            cb.Circle(xval, yval, radius);
            cb.Stroke();
        }

        public void DrawRectangle(EbReportFields field)
        {
            float x = field.Left;
            float y = Report.Height - (printingTop + field.Top + field.Height);
            float w = field.Width;
            float h = field.Height;

            cb.Rectangle(x, y, w, h);
            cb.Stroke();
        }

        public void DrawHLine(EbReportFields field)
        {
            var x1 = field.Left;
            var y1 = Report.Height - (printingTop + field.Top);
            var x2 = field.Left + field.Width;
            var y2 = y1;

            cb.MoveTo(x1, y1);
            cb.LineTo(x2, y2);
            cb.Stroke();
        }

        public void DrawVLine(EbReportFields field)
        {
            var x1 = field.Left;
            var y1 = Report.Height - (printingTop + field.Top);
            var x2 = x1;
            var y2 = Report.Height - (printingTop + field.Top + field.Height);
            cb.MoveTo(x1, y1);
            cb.LineTo(x2, y2);
            cb.Stroke();
        }

        public void DrawArrowR(EbReportFields field)
        {
            DrawHLine(field);
            var x = field.Left + field.Width;
            var y = Report.Height - (printingTop + field.Top);
            cb.SetColorFill(BaseColor.Black);
            cb.MoveTo(x, y);
            cb.LineTo(x - 3, y - 3);
            cb.LineTo(x - 3, y + 3);
            cb.ClosePathFillStroke();
        }

        public void DrawArrowL(EbReportFields field)
        {
            DrawHLine(field);
            var x = field.Left;
            var y = Report.Height - (printingTop + field.Top);
            cb.SetColorFill(BaseColor.Black);
            cb.MoveTo(x, y);
            cb.LineTo(x + 3, y + 3);
            cb.LineTo(x + 3, y - 3);
            cb.ClosePathFillStroke();
        }

        public void DrawArrowU(EbReportFields field)
        {
            DrawVLine(field);
            var x = field.Left;
            var y = Report.Height - (printingTop + field.Top);
            cb.SetColorFill(BaseColor.Black);
            cb.MoveTo(x, y);
            cb.LineTo(x + 3, y - 3);
            cb.LineTo(x - 3, y - 3);
            cb.ClosePathFillStroke();
        }
        public void DrawArrowD(EbReportFields field)
        {
            DrawVLine(field);
            var x = field.Left;
            var y = Report.Height - (printingTop + field.Top + field.Height);
            cb.SetColorFill(BaseColor.Black);
            cb.MoveTo(x, y);
            cb.LineTo(x - 3, y + 3);
            cb.LineTo(x + 3, y + 3);
            cb.ClosePathFillStroke();
        }
        public void DrawByArrH(EbReportFields field)
        {
            DrawHLine(field);
            var x1 = field.Left + field.Width;
            var y1 = Report.Height - (printingTop + field.Top);
            cb.SetColorFill(BaseColor.Black);
            cb.MoveTo(x1, y1);
            cb.LineTo(x1 - 3, y1 - 3);
            cb.LineTo(x1 - 3, y1 + 3);
            var x2 = field.Left;
            var y2 = Report.Height - (printingTop + field.Top);
            cb.MoveTo(x2, y2);
            cb.LineTo(x2 + 3, y2 + 3);
            cb.LineTo(x2 + 3, y2 - 3);
            cb.ClosePathFillStroke();
        }
        public void DrawByArrV(EbReportFields field)
        {
            DrawVLine(field);
            var x1 = field.Left;
            var y1 = Report.Height - (printingTop + field.Top);
            cb.SetColorFill(BaseColor.Black);
            cb.MoveTo(x1, y1);
            cb.LineTo(x1 + 3, y1 - 3);
            cb.LineTo(x1 - 3, y1 - 3);
            var x2 = field.Left;
            var y2 = Report.Height - (printingTop + field.Top + field.Height);
            cb.MoveTo(x2, y2);
            cb.LineTo(x2 - 3, y2 + 3);
            cb.LineTo(x2 + 3, y2 + 3);
            cb.ClosePathFillStroke();
        }
    }
}