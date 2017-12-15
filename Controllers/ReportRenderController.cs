﻿using System;
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
        private iTextSharp.text.Font f = FontFactory.GetFont(FontFactory.HELVETICA, 12);
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
            
            iTextSharp.text.Rectangle rec = new iTextSharp.text.Rectangle(Report.Width, Report.Height);

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
            var a = dt.Count * detail_section_height;
            var b = Report.Height - (ph_height + pf_height + rh_height + rf_height);
            if (a < b && writer.PageNumber == 1)
                IsLastpage = true;
            if (writer.PageNumber == 1 && IsLastpage == true)
                dt_height = Report.Height - (ph_height + pf_height + rh_height + rf_height);
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
        public void CallSummerize(string title, int i)
        {
            var column_name = string.Empty;
            var column_val = string.Empty;

            List<object> SummaryList;
            if (PageSummaryFields.ContainsKey(title))
            {
                SummaryList = PageSummaryFields[title];
                foreach (var item in SummaryList)
                {
                    var table = title.Split('.')[0];
                    column_name = title.Split('.')[1];
                    column_val = GeFieldtData(column_name, i);
                    if (item is EbDataFieldNumericSummary)
                        (item as EbDataFieldNumericSummary).Summarize(column_val);
                    else if (item is EbDataFieldBooleanSummary)
                        (item as EbDataFieldBooleanSummary).Summarize();
                    else if (item is EbDataFieldTextSummary)
                        (item as EbDataFieldTextSummary).Summarize(column_val);
                    else if (item is EbDataFieldDateTimeSummary)
                        (item as EbDataFieldDateTimeSummary).Summarize(column_val);
                }
            }
            if (ReportSummaryFields.ContainsKey(title))
            {
                SummaryList = ReportSummaryFields[title];
                foreach (var item in SummaryList)
                {
                    var table = title.Split('.')[0];
                    column_name = title.Split('.')[1];
                    column_val = GeFieldtData(column_name, i);
                    if (item is EbDataFieldNumericSummary)
                        (item as EbDataFieldNumericSummary).Summarize(column_val);
                    else if (item is EbDataFieldBooleanSummary)
                        (item as EbDataFieldBooleanSummary).Summarize();
                    else if (item is EbDataFieldTextSummary)
                        (item as EbDataFieldTextSummary).Summarize(column_val);
                    else if (item is EbDataFieldDateTimeSummary)
                        (item as EbDataFieldDateTimeSummary).Summarize(column_val);
                }
            }

        }

        //NEED FIX OO
        public void DrawFields(EbReportField field, float section_Yposition, int i)
        {
            var column_name = string.Empty;
            var column_val = string.Empty;
            if (PageSummaryFields.ContainsKey(field.Title) || ReportSummaryFields.ContainsKey(field.Title))
                CallSummerize(field.Title, i);
            if ((field is EbDataField) || (field is EbPageNo) || (field is EbPageXY) || (field is EbDateTime))
            {
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
                }
                else if (field is EbPageNo)
                    column_val = writer.PageNumber.ToString();
                else if (field is EbPageXY)
                    column_val = writer.PageNumber + "/"/* + writer.PageCount*/;
                else if (field is EbDateTime)
                    column_val = DateTime.Now.ToString();

                field.DrawMe(canvas, Report.Height, section_Yposition, detailprintingtop, column_val);
            }
            else if ((field is EbText) || (field is EbCircle) || (field is EbRect) || (field is EbHl) || (field is EbVl) || (field is EbArrR) || (field is EbArrL) || (field is EbArrU) || (field is EbArrD) || (field is EbByArrH) || (field is EbByArrV))
            {
                field.DrawMe(canvas, Report.Height, section_Yposition, detailprintingtop);
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
    }
}