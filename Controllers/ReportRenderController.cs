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


namespace ExpressBase.Web.Controllers
{
    public partial class HeaderFooter : PdfPageEventHelper
    {
        private ReportRenderController Controller { get; set; }
        //  PdfTemplate total;

        //public override void OnOpenDocument(PdfWriter writer, Document d)
        //{
        //    base.OnOpenDocument(writer, d);
        //    Controller.DrawReportHeader();
        //}

        //public override void OnCloseDocument(PdfWriter writer, Document d)
        //{
        //    base.OnCloseDocument(writer,d);
        //    Controller.DrawReportFooter();
        //    //ColumnText.ShowTextAligned(total, Element.ALIGN_LEFT, new Phrase((writer.PageNumber - 1).ToString()), 2, 2, 0);
        //} 

        //public override void OnStartPage(PdfWriter writer, Document document)
        //{
        //    if (Controller.writer.PageNumber != 1)
        //    {
        //        Controller.printingTop = 0;
        //    }
        //    Controller.DrawPageHeader();
        //} 

        public override void OnEndPage(PdfWriter writer, Document d)
        {
            Controller.DrawPageHeader();

            Controller.DrawPageFooter();
        }

        public HeaderFooter(ReportRenderController _c) : base()
        {
            this.Controller = _c;
        }
    }
    public class ReportRenderController : EbBaseNewController
    {
        private RowColletion dt;
        private DataSourceColumnsResponse cresp = null;
        private DataSourceDataResponse dresp = null;
        private ColumnColletion __columns = null;

        private EbReport Report = null;
        private iTextSharp.text.Font f = FontFactory.GetFont(FontFactory.HELVETICA, 5);
        // private float printingTop = 0;
        private List<double> total = new List<double>(); // change
        private Dictionary<int, double> totalOfColumn = new Dictionary<int, double>(); //change
        private PdfContentByte cb;
        private ColumnText ct;
        private PdfWriter writer;
        private Document d;

        private float rh_height;
        private float ph_height;
        private float dt_height;
        private float pf_height;
        private float rf_height;
        private float rf_Yposition;
        private float pf_Yposition;
        private float ph_Yposition;
        private float dt_Yposition;
        private float detailprintingtop = 0;
        private float detail_section_height;
        private bool IsLastpage = false;

        public ReportRenderController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        public IActionResult Index(string refid)
        {
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

            iTextSharp.text.Rectangle rec = (Report.IsLandscape) ?
                new iTextSharp.text.Rectangle(Report.Height, Report.Width) : new iTextSharp.text.Rectangle(Report.Width, Report.Height);

            d = new Document(rec);
            MemoryStream ms1 = new MemoryStream();
            writer = PdfWriter.GetInstance(d, ms1);
            writer.Open();
            d.Open();
            writer.PageEvent = new HeaderFooter(this);
            writer.CloseStream = true;//important
            cb = writer.DirectContent;
            CalculateSectionHeights();
            d.NewPage();

            DrawReportHeader();
            DrawDetail();
            DrawReportFooter();
            d.Close();
            ms1.Position = 0;
            return new FileStreamResult(ms1, "application/pdf");
        }

        public void CalculateSectionHeights()
        {
            foreach (EbReportHeader r_header in Report.ReportHeaders)
            {
                rh_height += r_header.Height;
            }
            foreach (EbPageHeader p_header in Report.PageHeaders)
            {
                ph_height += p_header.Height;
            }
            foreach (EbPageFooter p_footer in Report.PageFooters)
            {
                pf_height += p_footer.Height;
            }
            foreach (EbReportFooter r_footer in Report.ReportFooters)
            {
                rf_height += r_footer.Height;
            }
            foreach (EbReportDetail detail in Report.Detail)
            {
                detail_section_height += detail.Height;
            }
            CalculateDetailHeight();
        }

        public void CalculateDetailHeight()
        {
            if(writer.PageNumber == 1 && IsLastpage == true)
                dt_height = Report.Height - (ph_height + pf_height + pf_height + rf_height);
            else if (writer.PageNumber == 1)
                dt_height = Report.Height - (rh_height + ph_height + pf_height);
            else if (IsLastpage == true) 
              dt_height = Report.Height - (ph_height + pf_height + rf_height);
            else
                dt_height = Report.Height - (ph_height + pf_height);
        }

        public void DrawReportHeader()
        {
            var rh_Yposition = 0;
            foreach (EbReportHeader r_header in Report.ReportHeaders)
            {
                foreach (EbReportField field in r_header.Fields)
                {
                    DrawFields(field, rh_Yposition,0,0);
                }
            }
        }

        public void DrawPageHeader()
        {
            ph_Yposition = (writer.PageNumber == 1) ? rh_height : 0;
            foreach (EbPageHeader p_header in Report.PageHeaders)
            {
                foreach (EbReportField field in p_header.Fields)
                {
                    DrawFields(field, ph_Yposition,0,0);
                }
            }
        }

        public void DrawDetail()
        {
            ph_Yposition = (writer.PageNumber == 1) ? rh_height : 0;
            dt_Yposition = ph_Yposition + ph_height;
            if (dt != null)
            {
                int i;
                for (i = 0; i < dt.Count; i++)
                {
                    if (detailprintingtop < dt_height && dt_height - detailprintingtop >= detail_section_height)
                    {
                        DoLoopInDetail(i);
                    }
                    else
                    {
                        detailprintingtop = 0;
                        d.NewPage();
                        DoLoopInDetail(i);
                    }
                }
                if (i == dt.Count)
                {
                    IsLastpage = true;
                    CalculateDetailHeight();
                }
            }
            else
            {
                IsLastpage = true;
                DoLoopInDetail(0);
             
            }

        }

        public void DoLoopInDetail(int i)
        {
            foreach (EbReportDetail detail in Report.Detail)
            {
                foreach (EbReportField field in detail.Fields)
                {
                    DrawFields(field, dt_Yposition, detailprintingtop,i);
                }

                detailprintingtop += detail.Height;
            }
        }

        public void DrawPageFooter()
        {
            CalculateDetailHeight();
            dt_Yposition = ph_Yposition + ph_height;
            pf_Yposition = dt_Yposition + dt_height;
            foreach (EbPageFooter p_footer in Report.PageFooters)
            {
                foreach (EbReportField field in p_footer.Fields)
                {
                    DrawFields(field, pf_Yposition,0,0);
                }
            }
        }

        public void DrawReportFooter()
        {
            CalculateDetailHeight();
            dt_Yposition = ph_Yposition + ph_height;
            pf_Yposition = dt_Yposition + dt_height;
            rf_Yposition = pf_Yposition + pf_height;
            foreach (EbReportFooter r_footer in Report.ReportFooters)
            {
                foreach (EbReportField field in r_footer.Fields)
                {
                    DrawFields(field, rf_Yposition,0,0);
                }
            }
        }

        public void DrawFields(EbReportField field, float section_Yposition, float detailprintingtop,int i)
        {
            var column_name = "";
            var column_val = "";

            if (field.GetType() == typeof(EbText))
            {
                column_val = field.Title;
                DrawTextBox(field, column_val, section_Yposition);
            }
            else if (field.GetType() == typeof(EbDataFieldBoolean) || field.GetType() == typeof(EbDataFieldDateTime) || field.GetType() == typeof(EbDataFieldNumeric) || field.GetType() == typeof(EbDataFieldText))
            {
                var table = field.Title.Split('.')[0];
                column_name = field.Title.Split('.')[1];
                column_val = GeFieldtData(column_name, i);
                DrawTextBox(field, column_val, section_Yposition);
            }
            else if (field.GetType() == typeof(EbCircle))
            {
                if (field.Height == field.Width)
                    DrawCircle(field, section_Yposition);
                else
                    DrawEllipse(field, section_Yposition);
            }
            else if (field.GetType() == typeof(EbRect))
            {
                DrawRectangle(field, section_Yposition);
            }
            else if (field.GetType() == typeof(EbHl))
            {
                DrawHLine(field, section_Yposition);
            }
            else if (field.GetType() == typeof(EbVl))
            {
                DrawVLine(field, section_Yposition);
            }
            else if (field.GetType() == typeof(EbArrR))
            {
                DrawArrowR(field, section_Yposition);
            }
            else if (field.GetType() == typeof(EbArrL))
            {
                DrawArrowL(field, section_Yposition);
            }
            else if (field.GetType() == typeof(EbArrU))
            {
                DrawArrowU(field, section_Yposition);
            }
            else if (field.GetType() == typeof(EbArrD))
            {
                DrawArrowD(field, section_Yposition);
            }
            else if (field.GetType() == typeof(EbByArrH))
            {
                DrawByArrH(field, section_Yposition);
            }
            else if (field.GetType() == typeof(EbByArrV))
            {
                DrawByArrV(field, section_Yposition);
            }
            else if (field.GetType() == typeof(EbPageNo))
            {
                column_val = writer.PageNumber.ToString();
                DrawTextBox(field, column_val, section_Yposition);
            }
            else if (field.GetType() == typeof(EbPageXY))
            {
              ///  column_val = writer.PageNumber + "/" + writer.PageCount;
                DrawTextBox(field, column_val, section_Yposition);
            }
            else if (field.GetType() == typeof(EbDateTime))
            {
                DrawTextBox(field, field.Title, section_Yposition);
            }
        }



        public string GeFieldtData(string column_name, int i)
        {
            var columnindex = 0;
            var column_val = "";
            foreach (var col in __columns)
            {
                if (col.ColumnName == column_name)
                {
                    column_val = dt[i][columnindex].ToString();
                    return column_val;
                }
                columnindex++;
            }
            return column_val;
        }

        public void DrawTextBox(EbReportField field, string column_val, float printingTop)
        {
            var urx = field.Width + field.Left;
            var ury = Report.Height - (printingTop + field.Top + detailprintingtop);
            var llx = field.Left;
            var lly = Report.Height - (printingTop + field.Top + field.Height + detailprintingtop);

            ColumnText ct1 = new ColumnText(cb);
            ct1.SetSimpleColumn(new Phrase(column_val), llx, lly, urx, ury, 15, Element.ALIGN_LEFT);
            ct1.Go();
        }



        public void DrawCircle(EbReportField field, float printingTop)
        {
            float radius = field.Width / 2;
            float xval = field.Left + radius;
            float yval = Report.Height - (printingTop + field.Top + radius);

            cb.SetColorStroke(GetColor(field.BorderColor));
            cb.SetColorFill(GetColor(field.BackColor));
            cb.SetLineWidth(field.Border);
            cb.Circle(xval, yval, radius);
            cb.FillStroke();
        }

        public void DrawEllipse(EbReportField field, float printingTop)
        {
            var x1 = field.Left;
            var y1 = Report.Height - (printingTop + field.Top + field.Height);
            var x2 = field.Left + field.Width;
            var y2 = Report.Height - (printingTop + field.Top);
            cb.SetColorStroke(GetColor(field.BorderColor));
            cb.SetColorFill(GetColor(field.BackColor));
            cb.SetLineWidth(field.Border);
            cb.Ellipse(x1, y1, x2, y2);
            cb.FillStroke();
        }

        public void DrawRectangle(EbReportField field, float printingTop)
        {
            float x = field.Left;
            float y = Report.Height - (printingTop + field.Top + field.Height);
            float w = field.Width;
            float h = field.Height;
            cb.SetColorStroke(GetColor(field.BorderColor));
            cb.SetColorFill(GetColor(field.BackColor));
            cb.SetLineWidth(field.Border);
            cb.Rectangle(x, y, w, h);
            cb.FillStroke();
        }

        public void DrawHLine(EbReportField field, float printingTop)
        {
            var x1 = field.Left;
            var y1 = Report.Height - (printingTop + field.Top);
            var x2 = field.Left + field.Width;
            var y2 = y1;
            cb.SetColorStroke(GetColor(field.BorderColor));
            cb.SetLineWidth(field.Border);
            cb.MoveTo(x1, y1);
            cb.LineTo(x2, y2);
            cb.Stroke();
        }

        public void DrawVLine(EbReportField field, float printingTop)
        {
            var x1 = field.Left;
            var y1 = Report.Height - (printingTop + field.Top);
            var x2 = x1;
            var y2 = Report.Height - (printingTop + field.Top + field.Height);
            cb.SetColorStroke(GetColor(field.BorderColor));
            cb.SetLineWidth(field.Border);
            cb.MoveTo(x1, y1);
            cb.LineTo(x2, y2);
            cb.Stroke();
        }

        public void DrawArrowR(EbReportField field, float printingTop)
        {
            DrawHLine(field, printingTop);
            var x = field.Left + field.Width;
            var y = Report.Height - (printingTop + field.Top);
            cb.SetColorStroke(GetColor(field.BorderColor));
            cb.SetColorFill(GetColor(field.BorderColor));
            cb.SetLineWidth(field.Border);
            cb.MoveTo(x, y);
            cb.LineTo(x - 3, y - 3);
            cb.LineTo(x - 3, y + 3);
            cb.ClosePathFillStroke();
        }

        public void DrawArrowL(EbReportField field, float printingTop)
        {
            DrawHLine(field, printingTop);
            var x = field.Left;
            var y = Report.Height - (printingTop + field.Top);
            cb.SetColorStroke(GetColor(field.BorderColor));
            cb.SetColorFill(GetColor(field.BorderColor));
            cb.SetLineWidth(field.Border);
            cb.MoveTo(x, y);
            cb.LineTo(x + 3, y + 3);
            cb.LineTo(x + 3, y - 3);
            cb.ClosePathFillStroke();
        }

        public void DrawArrowU(EbReportField field, float printingTop)
        {
            DrawVLine(field, printingTop);
            var x = field.Left;
            var y = Report.Height - (printingTop + field.Top);
            cb.SetColorStroke(GetColor(field.BorderColor));
            cb.SetColorFill(GetColor(field.BorderColor));
            cb.SetLineWidth(field.Border);
            cb.MoveTo(x, y);
            cb.LineTo(x + 3, y - 3);
            cb.LineTo(x - 3, y - 3);
            cb.ClosePathFillStroke();
        }

        public void DrawArrowD(EbReportField field, float printingTop)
        {
            DrawVLine(field, printingTop);
            var x = field.Left;
            var y = Report.Height - (printingTop + field.Top + field.Height);
            cb.SetColorStroke(GetColor(field.BorderColor));
            cb.SetColorFill(GetColor(field.BorderColor));
            cb.SetLineWidth(field.Border);
            cb.MoveTo(x, y);
            cb.LineTo(x - 3, y + 3);
            cb.LineTo(x + 3, y + 3);
            cb.ClosePathFillStroke();
        }

        public void DrawByArrH(EbReportField field, float printingTop)
        {
            DrawHLine(field, printingTop);
            var x1 = field.Left + field.Width;
            var y1 = Report.Height - (printingTop + field.Top);
            cb.SetColorStroke(GetColor(field.BorderColor));
            cb.SetColorFill(GetColor(field.BorderColor));
            cb.SetLineWidth(field.Border);
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

        public void DrawByArrV(EbReportField field, float printingTop)
        {
            DrawVLine(field, printingTop);
            var x1 = field.Left;
            var y1 = Report.Height - (printingTop + field.Top);
            cb.SetColorStroke(GetColor(field.BorderColor));
            cb.SetColorFill(GetColor(field.BorderColor));
            cb.SetLineWidth(field.Border);
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

        public BaseColor GetColor(string Color)
        {
            var colr = ColorTranslator.FromHtml(Color).ToArgb();
            return new BaseColor(colr);
        }
    }
}