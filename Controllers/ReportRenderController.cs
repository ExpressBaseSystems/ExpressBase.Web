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
        private PdfContentByte canvas;
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

        private Dictionary<string, List<object>> PageSummaryFields = new Dictionary<string, List<object>>();
        private Dictionary<string, List<object>> ReportSummaryFields = new Dictionary<string, List<object>>();
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
            canvas = writer.DirectContent;
            CalculateSectionHeights();
            InitializeSummaryFields();
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
            if (writer.PageNumber == 1 && IsLastpage == true)
                dt_height = Report.Height - (ph_height + pf_height + pf_height + rf_height);
            else if (writer.PageNumber == 1)
                dt_height = Report.Height - (rh_height + ph_height + pf_height);
            else if (IsLastpage == true)
                dt_height = Report.Height - (ph_height + pf_height + rf_height);
            else
                dt_height = Report.Height - (ph_height + pf_height);
        }

        public void InitializeSummaryFields()
        {
            List<object> SummaryFieldsList = null;
            foreach (EbPageFooter p_footer in Report.PageFooters)
            {
                foreach (EbReportField field in p_footer.Fields)
                {
                    if (field is EbDataFieldNumericSummary || field is EbDataFieldBooleanSummary || field is EbDataFieldTextSummary || field is EbDataFieldDateTimeSummary)
                    {
                        dynamic f = field;
                        if (field is EbDataFieldNumericSummary)
                        {
                            f = field as EbDataFieldNumericSummary;
                        }
                        if (field is EbDataFieldBooleanSummary)
                        {
                            f = field as EbDataFieldBooleanSummary;
                        }
                        if (field is EbDataFieldTextSummary)
                        {
                            f = field as EbDataFieldTextSummary;
                        }
                        if (field is EbDataFieldDateTimeSummary)
                        {
                            f = field as EbDataFieldDateTimeSummary;
                        }
                        if (!PageSummaryFields.ContainsKey(f.DataField))
                        {
                            SummaryFieldsList = new List<object>();
                            SummaryFieldsList.Add(f);
                            PageSummaryFields.Add(f.DataField, SummaryFieldsList);
                        }
                        else
                        {
                          //  SummaryFieldsList.Add(f);
                        PageSummaryFields[f.DataField].Add(f);
                        }
                    }
                }
            }

            foreach (EbReportFooter r_footer in Report.ReportFooters)
            {
                foreach (EbReportField field in r_footer.Fields)
                {
                    if (field is EbDataFieldNumericSummary || field is EbDataFieldBooleanSummary || field is EbDataFieldTextSummary || field is EbDataFieldDateTimeSummary)
                    {
                        dynamic f = null;
                        if (field is EbDataFieldNumericSummary)
                        {
                            f = field as EbDataFieldNumericSummary;
                        }
                        if (field is EbDataFieldBooleanSummary)
                        {
                            f = field as EbDataFieldBooleanSummary;
                        }
                        if (field is EbDataFieldTextSummary)
                        {
                            f = field as EbDataFieldTextSummary;
                        }
                        if (field is EbDataFieldDateTimeSummary)
                        {
                            f = field as EbDataFieldDateTimeSummary;
                        }

                        if (!ReportSummaryFields.ContainsKey(f.DataField))
                        {
                            SummaryFieldsList = new List<object>();
                            SummaryFieldsList.Add(f);
                            ReportSummaryFields.Add(f.DataField, SummaryFieldsList);
                        }
                        else
                        {
                            //SummaryFieldsList.Add(f);
                            ReportSummaryFields[f.DataField].Add(f);
                        }
                    }
                }
            }

        }

        public void DrawReportHeader()
        {

            var rh_Yposition = 0;
            detailprintingtop = 0;
            foreach (EbReportHeader r_header in Report.ReportHeaders)
            {
                foreach (EbReportField field in r_header.Fields)
                {
                    DrawFields(field, rh_Yposition, 0);
                }
            }
        }

        public void DrawPageHeader()
        {
            detailprintingtop = 0;
            ph_Yposition = (writer.PageNumber == 1) ? rh_height : 0;
            foreach (EbPageHeader p_header in Report.PageHeaders)
            {
                foreach (EbReportField field in p_header.Fields)
                {
                    DrawFields(field, ph_Yposition, 0);
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
                    DrawFields(field, dt_Yposition, i);
                }
                detailprintingtop += detail.Height;
            }
        }

        public void DrawPageFooter()
        {
            detailprintingtop = 0;
            CalculateDetailHeight();
            dt_Yposition = ph_Yposition + ph_height;
            pf_Yposition = dt_Yposition + dt_height;
            foreach (EbPageFooter p_footer in Report.PageFooters)
            {
                foreach (EbReportField field in p_footer.Fields)
                {
                    DrawFields(field, pf_Yposition, 0);
                }
            }
        }

        public void DrawReportFooter()
        {
            detailprintingtop = 0;
            CalculateDetailHeight();
            dt_Yposition = ph_Yposition + ph_height;
            pf_Yposition = dt_Yposition + dt_height;
            rf_Yposition = pf_Yposition + pf_height;
            foreach (EbReportFooter r_footer in Report.ReportFooters)
            {
                foreach (EbReportField field in r_footer.Fields)
                {
                    DrawFields(field, rf_Yposition, 0);
                }
            }
        }

        //NEED FIX OO
        public void DrawFields(EbReportField field, float section_Yposition, int i)
        {
            var column_name = string.Empty;
            var column_val = string.Empty;

            if (PageSummaryFields.ContainsKey(field.Title) || ReportSummaryFields.ContainsKey(field.Title))
            {
                List<object> SummaryList;
                if (PageSummaryFields.ContainsKey(field.Title))
                {
                    SummaryList = PageSummaryFields[field.Title];
                    foreach (var item in SummaryList)
                    {
                        var table = field.Title.Split('.')[0];
                        column_name = field.Title.Split('.')[1];
                        column_val = GeFieldtData(column_name, i);
                        if (item is EbDataFieldNumericSummary)
                            (item as EbDataFieldNumericSummary).Summarize(column_val);
                        if (item is EbDataFieldBooleanSummary)
                            (item as EbDataFieldBooleanSummary).Summarize();
                        if (item is EbDataFieldTextSummary)
                            (item as EbDataFieldTextSummary).Summarize(column_val);
                        if (item is EbDataFieldDateTimeSummary)
                            (item as EbDataFieldDateTimeSummary).Summarize(column_val);
                    }
                }
                if (ReportSummaryFields.ContainsKey(field.Title))
                {
                    SummaryList = ReportSummaryFields[field.Title];
                    foreach (var item in SummaryList)
                    {
                        var table = field.Title.Split('.')[0];
                        column_name = field.Title.Split('.')[1];
                        column_val = GeFieldtData(column_name, i);
                        if (item is EbDataFieldNumericSummary)
                            (item as EbDataFieldNumericSummary).Summarize(column_val);
                        if (item is EbDataFieldBooleanSummary)
                            (item as EbDataFieldBooleanSummary).Summarize();
                        if (item is EbDataFieldTextSummary)
                            (item as EbDataFieldTextSummary).Summarize(column_val);
                        if (item is EbDataFieldDateTimeSummary)
                            (item as EbDataFieldDateTimeSummary).Summarize(column_val);
                    }
                }
            }

            if (field is EbDataField)
            {
                if (field is EbDataFieldNumericSummary)
                    column_val = (field as EbDataFieldNumericSummary).SummarizedValue.ToString();
                else if (field is EbDataFieldBooleanSummary)
                    column_val = (field as EbDataFieldBooleanSummary).SummarizedValue.ToString();
                else if (field is EbDataFieldTextSummary)
                    column_val = (field as EbDataFieldTextSummary).SummarizedValue.ToString();
                else if (field is EbDataFieldDateTimeSummary)
                    column_val = (field as EbDataFieldDateTimeSummary).SummarizedValue.ToString();
                else
                {
                    var table = field.Title.Split('.')[0];
                    column_name = field.Title.Split('.')[1];
                    column_val = GeFieldtData(column_name, i);
                }
               (field as EbDataField).DrawMe(canvas, Report.Height, section_Yposition, detailprintingtop, column_val);
            }

            if (field is EbText)
            {
                column_val = field.Title;
                DrawTextBox(field, column_val, section_Yposition);
            }
            //else if (field is EbDataFieldNumericSummary)
            //{
            //    EbDataFieldNumericSummary f = field as EbDataFieldNumericSummary;
            //    var val = f.SummarizedValue.ToString();
            //    DrawTextBox(field, val, section_Yposition);
            //}
            //else if (field is EbDataFieldBoolean || field is EbDataFieldDateTime || field is EbDataFieldNumeric || field is EbDataFieldText)
            //{
            //    var table = field.Title.Split('.')[0];
            //    column_name = field.Title.Split('.')[1];
            //    column_val = GeFieldtData(column_name, i);
            //    DrawTextBox(field, column_val, section_Yposition);
            //}
            else if (field is EbCircle)
            {
                if (field.Height == field.Width)
                    DrawCircle(field, section_Yposition);
                else
                    DrawEllipse(field, section_Yposition);
            }
            else if (field is EbRect)
            {
                DrawRectangle(field, section_Yposition);
            }
            else if (field is EbHl)
            {
                DrawHLine(field, section_Yposition);
            }
            else if (field is EbVl)
            {
                DrawVLine(field, section_Yposition);
            }
            else if (field is EbArrR)
            {
                DrawArrowR(field, section_Yposition);
            }
            else if (field is EbArrL)
            {
                DrawArrowL(field, section_Yposition);
            }
            else if (field is EbArrU)
            {
                DrawArrowU(field, section_Yposition);
            }
            else if (field is EbArrD)
            {
                DrawArrowD(field, section_Yposition);
            }
            else if (field is EbByArrH)
            {
                DrawByArrH(field, section_Yposition);
            }
            else if (field is EbByArrV)
            {
                DrawByArrV(field, section_Yposition);
            }
            else if (field is EbPageNo)
            {
                column_val = writer.PageNumber.ToString();
                DrawTextBox(field, column_val, section_Yposition);
            }
            else if (field is EbPageXY)
            {
                column_val = writer.PageNumber + "/"/* + writer.PageCount*/;
                DrawTextBox(field, column_val, section_Yposition);
            }
            else if (field is EbDateTime)
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

            ColumnText ct = new ColumnText(canvas);
            ct.SetSimpleColumn(new Phrase(column_val), llx, lly, urx, ury, 15, Element.ALIGN_LEFT);
            ct.Go();
        }



        public void DrawCircle(EbReportField field, float printingTop)
        {
            float radius = field.Width / 2;
            float xval = field.Left + radius;
            float yval = Report.Height - (printingTop + field.Top + radius + detailprintingtop);

            canvas.SetColorStroke(GetColor(field.BorderColor));
            canvas.SetColorFill(GetColor(field.BackColor));
            canvas.SetLineWidth(field.Border);
            canvas.Circle(xval, yval, radius);
            canvas.FillStroke();
        }

        public void DrawEllipse(EbReportField field, float printingTop)
        {
            var x1 = field.Left;
            var y1 = Report.Height - (printingTop + field.Top + field.Height + detailprintingtop);
            var x2 = field.Left + field.Width;
            var y2 = Report.Height - (printingTop + field.Top + detailprintingtop);
            canvas.SetColorStroke(GetColor(field.BorderColor));
            canvas.SetColorFill(GetColor(field.BackColor));
            canvas.SetLineWidth(field.Border);
            canvas.Ellipse(x1, y1, x2, y2);
            canvas.FillStroke();
        }

        public void DrawRectangle(EbReportField field, float printingTop)
        {
            float x = field.Left;
            float y = Report.Height - (printingTop + field.Top + field.Height + detailprintingtop);
            float w = field.Width;
            float h = field.Height;
            canvas.SetColorStroke(GetColor(field.BorderColor));
            canvas.SetColorFill(GetColor(field.BackColor));
            canvas.SetLineWidth(field.Border);
            canvas.Rectangle(x, y, w, h);
            canvas.FillStroke();
        }

        public void DrawHLine(EbReportField field, float printingTop)
        {
            var x1 = field.Left;
            var y1 = Report.Height - (printingTop + field.Top + detailprintingtop);
            var x2 = field.Left + field.Width;
            var y2 = y1 + detailprintingtop;
            canvas.SetColorStroke(GetColor(field.BorderColor));
            canvas.SetLineWidth(field.Border);
            canvas.MoveTo(x1, y1);
            canvas.LineTo(x2, y2);
            canvas.Stroke();
        }

        public void DrawVLine(EbReportField field, float printingTop)
        {
            var x1 = field.Left;
            var y1 = Report.Height - (printingTop + field.Top + detailprintingtop);
            var x2 = x1;
            var y2 = Report.Height - (printingTop + field.Top + field.Height + detailprintingtop);
            canvas.SetColorStroke(GetColor(field.BorderColor));
            canvas.SetLineWidth(field.Border);
            canvas.MoveTo(x1, y1);
            canvas.LineTo(x2, y2);
            canvas.Stroke();
        }

        public void DrawArrowR(EbReportField field, float printingTop)
        {
            DrawHLine(field, printingTop);
            var x = field.Left + field.Width;
            var y = Report.Height - (printingTop + field.Top + detailprintingtop);
            canvas.SetColorStroke(GetColor(field.BorderColor));
            canvas.SetColorFill(GetColor(field.BorderColor));
            canvas.SetLineWidth(field.Border);
            canvas.MoveTo(x, y);
            canvas.LineTo(x - 3, y - 3);
            canvas.LineTo(x - 3, y + 3);
            canvas.ClosePathFillStroke();
        }

        public void DrawArrowL(EbReportField field, float printingTop)
        {
            DrawHLine(field, printingTop);
            var x = field.Left;
            var y = Report.Height - (printingTop + field.Top + detailprintingtop);
            canvas.SetColorStroke(GetColor(field.BorderColor));
            canvas.SetColorFill(GetColor(field.BorderColor));
            canvas.SetLineWidth(field.Border);
            canvas.MoveTo(x, y);
            canvas.LineTo(x + 3, y + 3);
            canvas.LineTo(x + 3, y - 3);
            canvas.ClosePathFillStroke();
        }

        public void DrawArrowU(EbReportField field, float printingTop)
        {
            DrawVLine(field, printingTop);
            var x = field.Left;
            var y = Report.Height - (printingTop + field.Top + detailprintingtop);
            canvas.SetColorStroke(GetColor(field.BorderColor));
            canvas.SetColorFill(GetColor(field.BorderColor));
            canvas.SetLineWidth(field.Border);
            canvas.MoveTo(x, y);
            canvas.LineTo(x + 3, y - 3);
            canvas.LineTo(x - 3, y - 3);
            canvas.ClosePathFillStroke();
        }

        public void DrawArrowD(EbReportField field, float printingTop)
        {
            DrawVLine(field, printingTop);
            var x = field.Left;
            var y = Report.Height - (printingTop + field.Top + field.Height + detailprintingtop);
            canvas.SetColorStroke(GetColor(field.BorderColor));
            canvas.SetColorFill(GetColor(field.BorderColor));
            canvas.SetLineWidth(field.Border);
            canvas.MoveTo(x, y);
            canvas.LineTo(x - 3, y + 3);
            canvas.LineTo(x + 3, y + 3);
            canvas.ClosePathFillStroke();
        }

        public void DrawByArrH(EbReportField field, float printingTop)
        {
            DrawHLine(field, printingTop);
            var x1 = field.Left + field.Width;
            var y1 = Report.Height - (printingTop + field.Top + detailprintingtop);
            canvas.SetColorStroke(GetColor(field.BorderColor));
            canvas.SetColorFill(GetColor(field.BorderColor));
            canvas.SetLineWidth(field.Border);
            canvas.MoveTo(x1, y1);
            canvas.LineTo(x1 - 3, y1 - 3);
            canvas.LineTo(x1 - 3, y1 + 3);

            var x2 = field.Left;
            var y2 = Report.Height - (printingTop + field.Top + detailprintingtop);
            canvas.MoveTo(x2, y2);
            canvas.LineTo(x2 + 3, y2 + 3);
            canvas.LineTo(x2 + 3, y2 - 3);
            canvas.ClosePathFillStroke();
        }

        public void DrawByArrV(EbReportField field, float printingTop)
        {
            DrawVLine(field, printingTop);
            var x1 = field.Left;
            var y1 = Report.Height - (printingTop + field.Top + detailprintingtop);
            canvas.SetColorStroke(GetColor(field.BorderColor));
            canvas.SetColorFill(GetColor(field.BorderColor));
            canvas.SetLineWidth(field.Border);
            canvas.MoveTo(x1, y1);
            canvas.LineTo(x1 + 3, y1 - 3);
            canvas.LineTo(x1 - 3, y1 - 3);
            var x2 = field.Left;
            var y2 = Report.Height - (printingTop + field.Top + field.Height + detailprintingtop);
            canvas.MoveTo(x2, y2);
            canvas.LineTo(x2 - 3, y2 + 3);
            canvas.LineTo(x2 + 3, y2 + 3);
            canvas.ClosePathFillStroke();
        }

        public BaseColor GetColor(string Color)
        {
            var colr = ColorTranslator.FromHtml(Color).ToArgb();
            return new BaseColor(colr);
        }
    }
}