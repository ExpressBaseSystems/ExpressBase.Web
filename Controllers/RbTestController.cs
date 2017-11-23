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
        private RbTestController Controller { get; set; }
        PdfTemplate total;

        public HeaderFooter(RbTestController _c) : base()
        {
            this.Controller = _c;
        }
        //public void onOpenDocument(PdfWriter writer, Document doc)
        //{
        //    Controller.PrintReportHeader(doc);
        //}
        //public override void OnCloseDocument(PdfWriter writer, Document document)
        //{
        //    //ColumnText.ShowTextAligned(total, Element.ALIGN_LEFT, new Phrase((writer.PageNumber - 1).ToString()), 2, 2, 0);
        //}
        //public override void OnEndPage(PdfWriter writer, Document doc)
        //{
        //    Controller.PrintPageHeader();
        //    Controller.PrintPageFooter();
        //}
    }
    public class RbTestController : EbBaseNewController
    {
        public RbTestController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }
        public RowColletion dt;
        DataSourceColumnsResponse cresp = new DataSourceColumnsResponse();
        DataSourceDataResponse dresp = new DataSourceDataResponse();
        ColumnColletion __columns = null;

        EbReport Report = new EbReport();
        Font f = FontFactory.GetFont(FontFactory.HELVETICA, 7);

        //float printHeight = 0;
        //float sTop = 0;
        //float sTopVal;
        //float dtheight = 0;

        public List<double> total = new List<double>();
        Dictionary<int, double> totalOfColumn = new Dictionary<int, double>();
        //int totalofColumnCounter = 0;
        //int gtot = 0;
        PdfContentByte cb;
        public IActionResult Index()
        {
            var resultlist = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = "eb_roby_dev-eb_roby_dev-3-875-1581" });
            Report = EbSerializers.Json_Deserialize<EbReport>(resultlist.Data[0].Json);

            cresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", Report.DataSourceRefId));
            if (cresp.IsNull)
                cresp = this.ServiceClient.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { RefId = Report.DataSourceRefId });

            __columns = (cresp.Columns.Count > 1) ? cresp.Columns[1] : cresp.Columns[0];

            dresp = this.ServiceClient.Get<DataSourceDataResponse>(new DataSourceDataRequest { RefId = Report.DataSourceRefId, Draw = 1, Start = 0, Length = 100 });
            dt = dresp.Data;


            //total.Clear();
            //totalOfColumn.Clear();
            //totalofColumnCounter = 0;
            //gtot = 0;

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
            MemoryStream ms1 = new MemoryStream();
            PdfWriter writer = PdfWriter.GetInstance(d, ms1);
            writer.Open();
            d.Open();
            writer.PageEvent = new HeaderFooter(this);
            writer.CloseStream = true;//important
            cb = writer.DirectContent;

            foreach (EbReportHeader r_header in Report.ReportHeaders)
            {

            }
            foreach (EbPageHeader p_header in Report.PageHeaders)
            {

            }
            //foreach (EbReportDetail detail in Report.Detail)
            //{

            //}

            foreach (EbPageFooter p_footer in Report.PageFooters)
            {

            }
            foreach (EbReportFooter r_footer in Report.ReportFooters)
            {
                //        dtheight = s.Height;
                //        sTopVal = sTop = /*s.Top*/ 842 - 50;
                //        CalculatePositions(s);
                //        addRows(cb, s, d);
            }

            ColumnText ct = new ColumnText(cb);
            ct.SetSimpleColumn(new Phrase("data"), 34, 750, 580, 317, 15, Element.ALIGN_LEFT);
            ct.Go();
            d.Close();
            ms1.Position = 0;
            return new FileStreamResult(ms1, "application/pdf");
        }

        //public void writeColumnname(PdfContentByte cb, EbReportSection s)
        //{
        //    foreach (EbReportField c in s.Fields)
        //    {
        //        foreach (var col in __columns)
        //        {
        //            if (col.ColumnName == c.Name)
        //            {
        //                ColumnText ct = new ColumnText(cb);
        //                ct.SetSimpleColumn(new Phrase(c.Title), c.Left, repdef.PaperSize.Height - (c.Top + c.Height), c.Left + c.Width, repdef.PaperSize.Height - c.Top, 15, Element.ALIGN_LEFT);
        //                ct.Go();
        //            }
        //        }
        //    }
        //}
        //public void addRows(PdfContentByte cb, EbReportSection s, Document d)
        //{
        //    float cHeight = 0;
        //    int rcount = 0;
        //    foreach (var drow in dresp.Data)
        //    {
        //        foreach (EbReportField c in s.Fields)
        //        {
        //            foreach (var col in __columns)
        //            {
        //                if (col.ColumnName == c.Name)
        //                {
        //                    if (drow[col.ColumnIndex].ToString() == "")
        //                        drow[col.ColumnIndex] = 0;
        //                    if (c.DecimalPlaces != 0)
        //                    {
        //                        decimal a = Convert.ToDecimal(drow[col.ColumnIndex]);
        //                        drow[col.ColumnIndex] = a.ToString(string.Format("F{0}", c.DecimalPlaces));
        //                    }
        //                    //CalculateTotalAndRounding(cb, s, drow, col);
        //                    string data = drow[col.ColumnIndex].ToString();
        //                    ColumnText ct = new ColumnText(cb);
        //                    ct.SetSimpleColumn(new Phrase(data), c.Left, sTop - c.Height, c.Left + c.Width, c.Top, 15, Element.ALIGN_LEFT);
        //                    ct.Go();
        //                }
        //            }
        //            cHeight = c.Height;
        //        }
        //        sTop -= cHeight;
        //        printHeight += cHeight;
        //        if (printHeight >= dtheight)
        //        {
        //            d.NewPage();
        //            printHeight = 0;
        //            sTop = sTopVal;
        //        }
        //        rcount++;
        //        if (rcount == dresp.Data.Count()) { gtot = 1; }
        //    }
        //   // grandTotal(s);
        //}
        //public void PrintPageHeader()
        //{
        //    foreach (EbReportSection s in repdef.PageHeaders)
        //    {
        //        writeColumnname(cb, s);
        //    }
        //}
        public void PrintPageFooter()
        {
            foreach (EbReportSection s in Report.PageFooters)
            {
                //pageTotal(s);
                //if (gtot == 1)
                //{
                //    grandTotal(s);
                //}
            }
        }
        //public void PrintReportHeader(Document d)
        //{
        //    foreach (EbReportSection s in repdef.ReportHeaders)
        //    {
        //        writeColumnname(cb, s);
        //        d.NewPage();
        //    }

        //}
        //public void CalculatePositions(EbReportSection s)//calculate positions of total, subtotal,rounding
        //{
        //    int i = 0;
        //    foreach (EbReportField c in s.Fields)
        //    {
        //        total.Add(0);
        //        if (c.Sum)
        //            totalOfColumn.Add(i, 0);
        //        i++;
        //    }
        //}
        //public void CalculateTotalAndRounding(PdfContentByte cb, EbReportSection s, EbDataRow drow, EbDataColumn col)
        //{
        //    int j = col.ColumnIndex;
        //    if (totalOfColumn.ContainsKey(j) && DBNull.Value != drow[j])
        //    {
        //        totalOfColumn[j] += Convert.ToDouble(drow[j]);
        //        total[j] += Convert.ToDouble(drow[j]);
        //    }
        //    else { total[j] += 0; }
        //}
        //public void pageTotal(EbReportSection s)
        //{
        //    string totval;
        //    foreach (EbReportField c in s.Fields)
        //    {
        //        foreach (var col in __columns)
        //        {
        //            if (col.ColumnName == c.Name)
        //            {
        //                if (totalOfColumn.ContainsKey((col.ColumnIndex)))
        //                {
        //                    if (c.DecimalPlaces != 0)
        //                    {
        //                        decimal a = Convert.ToDecimal(total[col.ColumnIndex]);
        //                        totval = a.ToString(string.Format("F{0}", c.DecimalPlaces));
        //                    }
        //                    else
        //                        totval = (total[col.ColumnIndex]).ToString("F");
        //                    ColumnText ct = new ColumnText(cb);
        //                    ct.SetSimpleColumn(new Phrase(totval), c.Left, repdef.PaperSize.Height - (c.Top + c.Height), c.Left + c.Width, c.Top, 15, Element.ALIGN_LEFT);
        //                    ct.Go();
        //                    total[col.ColumnIndex] = 0;
        //                }
        //                else
        //                {
        //                    ColumnText ct = new ColumnText(cb);
        //                    ct.SetSimpleColumn(new Phrase(""), c.Left, sTop - c.Height, c.Left + c.Width, sTop, 15, Element.ALIGN_LEFT);
        //                    ct.Go();
        //                }
        //            }
        //        }
        //    }
        //}
        //public void grandTotal(EbReportSection s)
        //{
        //    string gtotval;
        //    double[] dd = totalOfColumn.Values.Select(i => i).ToArray();
        //    foreach (EbReportFields c in s.Fields)
        //    {
        //        foreach (var col in __columns)
        //        {
        //            if (col.ColumnName == c.Name)
        //            {
        //                if (totalOfColumn.ContainsKey((col.ColumnIndex)))
        //                {
        //                    gtotval = (dd[totalofColumnCounter].ToString("F"));
        //                    total[col.ColumnIndex] = 0;
        //                    totalofColumnCounter++;
        //                }
        //                else
        //                {
        //                    gtotval = "";
        //                }
        //                ColumnText ct = new ColumnText(cb);
        //                ct.SetSimpleColumn(new Phrase(gtotval), c.Left, repdef.Height - (c.Top + c.Height), c.Left + c.Width, c.Top - 10, 15, Element.ALIGN_LEFT);
        //                ct.Go();
        //            }
        //        }
        //    }
        //}
        //public void repDefInitialize()
        //{
        //    EbReportPaperSize paperSize = new EbReportPaperSize { Name = "A4", Width = 595, Height = 842 };
        //    repdef.PaperSize = paperSize;
        //    EbReportMargins margins = new EbReportMargins(20, 20, 20, 20);
        //    repdef.Margins = margins;
        //    repdef.IsLandscape = false;
        //}
        //public void repfldInitialize()
        //{
        //    EbReportField cntrl1 = new EbReportField();
        //    EbReportField cntrl2 = new EbReportField();
        //    EbReportField cntrl3 = new EbReportField();
        //    EbReportField cntrl4 = new EbReportField();
        //    EbReportField cntrl5 = new EbReportField();
        //    EbReportField cntrl6 = new EbReportField();

        //    cntrl1.Name = "id";
        //    cntrl1.Title = "ID";
        //    cntrl1.Left = 20;
        //    cntrl1.Width = 50;
        //    cntrl1.Top = 20;
        //    cntrl1.Height = 20;
        //    // cntrl1.HAlign = 0;

        //    cntrl5.Name = "grossamt";
        //    cntrl5.Title = "Gross Amount";
        //    cntrl5.Left = 471;
        //    cntrl5.Width = 70;
        //    cntrl5.Top = 20;
        //    cntrl5.Height = 20;
        //    //cntrl5.Sum = true;
        //    //cntrl5.DecimalPlaces = 3;
        //    //cntrl5.HAlign = 0;

        //    cntrl2.Name = "sys_submitted_ts";
        //    cntrl2.Title = "Sys Submitted Ts";
        //    cntrl2.Left = 71;
        //    cntrl2.Width = 200;
        //    cntrl2.Top = 20;
        //    cntrl2.Height = 20;
        //    // cntrl2.HAlign = 0;

        //    cntrl3.Name = "sys_submitter_uid";
        //    cntrl3.Title = "Sys Submitter Uid";
        //    cntrl3.Left = 271;
        //    cntrl3.Width = 100;
        //    cntrl3.Top = 20;
        //    cntrl3.Height = 20;
        //    // cntrl3.HAlign = 0;

        //    cntrl4.Name = "acmaster1_xid";
        //    cntrl4.Title = "AcMaster1 XID";
        //    cntrl4.Left = 371;
        //    cntrl4.Width = 100;
        //    cntrl4.Top = 20;
        //    cntrl4.Height = 20;
        //    //cntrl4.HAlign = 0;



        //    cntrl6.Name = "netamt";
        //    cntrl6.Title = "Net Amount";
        //    cntrl6.Left = 571;
        //    cntrl6.Width = 100;
        //    cntrl6.Top = 20;
        //    cntrl6.Height = 20;
        //    // cntrl6.Sum = true;
        //    // cntrl6.DecimalPlaces = 4;
        //    // cntrl6.HAlign =0;

        //    //repdef.ReportHeaders.AddSection();
        //    foreach (EbReportSection s in repdef.ReportHeaders)
        //    {
        //        s.Height = 50;
        //        s.Fields = new List<EbReportFields>();
        //        //s.Controls.Add(cntrl1);
        //        //s.Controls.Add(cntrl2);
        //        //s.Controls.Add(cntrl3);
        //        //s.Controls.Add(cntrl4);
        //        s.Fields.Add(cntrl5);
        //        s.Fields.Add(cntrl6);
        //    }
        //    foreach (EbReportSection s in repdef.PageHeaders)
        //    {
        //        s.Height = 50;
        //        s.Fields = new List<EbReportFields>();
        //        s.Fields.Add(cntrl1);
        //        s.Fields.Add(cntrl2);
        //        s.Fields.Add(cntrl3);
        //        s.Fields.Add(cntrl4);
        //        s.Fields.Add(cntrl5);
        //        s.Fields.Add(cntrl6);
        //    }
        //    foreach (EbReportSection s in repdef.Detail)
        //    {
        //        s.Height = 600;
        //        // s.Top = 842 - 50;
        //        s.Fields = new List<EbReportFields>();
        //        s.Fields.Add(cntrl1);
        //        s.Fields.Add(cntrl2);
        //        s.Fields.Add(cntrl3);
        //        s.Fields.Add(cntrl4);
        //        s.Fields.Add(cntrl5);
        //        s.Fields.Add(cntrl6);
        //    }
        //    foreach (EbReportSection s in repdef.PageFooters)
        //    {
        //        s.Height = 50;
        //        // s.Top = 100;
        //        s.Fields = new List<EbReportFields>();
        //        s.Fields.Add(cntrl1);
        //        s.Fields.Add(cntrl2);
        //        s.Fields.Add(cntrl3);
        //        s.Fields.Add(cntrl4);
        //        s.Fields.Add(cntrl5);
        //        s.Fields.Add(cntrl6);
        //    }
        //}
    }
}