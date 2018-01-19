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
using System.Net.Http;
using System.Net;
using System.Xml;
using System.Web;
using System.Text;
using Newtonsoft.Json;

namespace ExpressBase.Web.Controllers
{
    public partial class HeaderFooter : PdfPageEventHelper
    {
        private ReportRenderController Controller { get; set; }
        public override void OnStartPage(PdfWriter writer, Document document)
        {
        }
        public override void OnEndPage(PdfWriter writer, Document d)
        {
            Controller.DrawPageHeader();
            Controller.DrawPageFooter();
            if (Controller.Report.IsLastpage == true) Controller.DrawReportFooter();
            Controller.Report.DrawWaterMark(Controller.pdfReader, d, writer);
        }

        public HeaderFooter(ReportRenderController _c) : base()
        {
            this.Controller = _c;
        }
    }
    public class ReportRenderController : EbBaseIntController
    {
        private DataSourceColumnsResponse cresp = null;
        private DataSourceDataResponse dresp = null;

        public EbReport Report = null;
        private iTextSharp.text.Font f = FontFactory.GetFont(FontFactory.HELVETICA, 12);
        private PdfContentByte canvas;
        private PdfWriter writer;
        private Document d;
        public PdfReader pdfReader;
        public PdfStamper stamp;
        public MemoryStream ms1;

        private float rh_Yposition;
        private float rf_Yposition;
        private float pf_Yposition;
        private float ph_Yposition;
        private float dt_Yposition;
        private float detailprintingtop = 0;

        public ReportRenderController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        public IActionResult Index(string refid)
        {
            var resultlist1 = this.ServiceClient.Get<ReportRenderResponse>(new ReportRenderRequest { Refid = refid });

            var resultlist = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
            Report = EbSerializers.Json_Deserialize<EbReport>(resultlist.Data[0].Json);
            Report.IsLastpage = false;
            Report.watermarkImages = new Dictionary<string, byte[]>();
            Report.WaterMarkList = new List<object>();
            if (Report.DataSourceRefId != string.Empty)
            {
                cresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", Report.DataSourceRefId));
                if (cresp.IsNull)
                    cresp = this.ServiceClient.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { RefId = Report.DataSourceRefId });

                Report.DataColumns = (cresp.Columns.Count > 1) ? cresp.Columns[1] : cresp.Columns[0];

                dresp = this.ServiceClient.Get<DataSourceDataResponse>(new DataSourceDataRequest { RefId = Report.DataSourceRefId, Draw = 1, Start = 0, Length = 100 });
                Report.DataRow = dresp.Data;
            }
            iTextSharp.text.Rectangle rec = new iTextSharp.text.Rectangle(Report.Width, Report.Height);

            d = new Document(rec);
            ms1 = new MemoryStream();
            writer = PdfWriter.GetInstance(d, ms1);
            writer.Open();
            d.Open();
            writer.PageEvent = new HeaderFooter(this);
            writer.CloseStream = true;//important
            canvas = writer.DirectContent;
            Report.PageNumber = writer.PageNumber;
            //Report.DataRow = __datarows;
            Report.InitializeSummaryFields();
            GetWatermarkImages();
            iTextSharp.text.Font link = FontFactory.GetFont("Arial", 12, iTextSharp.text.Font.UNDERLINE, BaseColor.DarkGray);
            Anchor anchor = new Anchor("xyz", link);
            anchor.Reference = "http://eb_roby_dev.localhost:5000/ReportRender?refid=eb_roby_dev-eb_roby_dev-3-1127-1854?tab=" + JsonConvert.SerializeObject(Report.DataRow[Report.SerialNumber - 1]);
            d.Add(anchor);
            d.NewPage();

            DrawReportHeader();
            DrawDetail();
            d.Close();
            ms1.Position = 0;//important
            return new FileStreamResult(ms1, "application/pdf");
        }
        public IActionResult SS_Report(string refid)
        {
            var resultlist1 = this.ServiceClient.Get<FileStreamResult>(new ReportRenderRequest { Refid = refid });
            return new FileStreamResult(resultlist1.memorystream, "application/pdf");
        }
            //public string BitLy()
            //{
            //    string statusCode = string.Empty;                       // The variable which we will be storing the status code of the server response
            //    string statusText = string.Empty;                       // The variable which we will be storing the status text of the server response
            //    string shortUrl = string.Empty;                         // The variable which we will be storing the shortened url
            //    string longUrl = string.Empty;                          // The variable which we will be storing the long url

            //    string urlToShorten =      // The url we want to shorten
            //    XmlDocument xmlDoc = new XmlDocument();                 // The xml document which we will use to parse the response from the server

            //    WebRequest request = WebRequest.Create("http://api.bitly.com/v3/shorten");
            //    byte[] data = Encoding.UTF8.GetBytes(string.Format("login={0}&apiKey={1}&longUrl={2}&format={3}",
            //     "o_6id5o5bl64",                             // Your username
            //     "R_9c60829c301c4fc9b68f5cf229f0efdf",                              // Your API key
            //     HttpUtility.UrlEncode(urlToShorten),         // Encode the url we want to shorten
            //     "xml"));                                     // The format of the response we want the server to reply with

            //    request.Method = "POST";
            //    request.ContentType = "application/x-www-form-urlencoded";
            //    request.ContentLength = data.Length;
            //    using (Stream ds = request.GetRequestStream())
            //    {
            //        ds.Write(data, 0, data.Length);
            //    }
            //    using (WebResponse response = request.GetResponse())
            //    {
            //        using (StreamReader sr = new StreamReader(response.GetResponseStream()))
            //        {
            //            xmlDoc.LoadXml(sr.ReadToEnd());
            //        }
            //    }

            //    statusCode = xmlDoc.GetElementsByTagName("status_code")[0].InnerText;
            //    statusText = xmlDoc.GetElementsByTagName("status_txt")[0].InnerText;
            //    shortUrl = xmlDoc.GetElementsByTagName("url")[0].InnerText;
            //    longUrl = xmlDoc.GetElementsByTagName("long_url")[0].InnerText;

            //    Console.WriteLine(statusCode);      // Outputs "200"
            //    Console.WriteLine(statusText);      // Outputs "OK"
            //    Console.WriteLine(shortUrl);        // Outputs "http://bit.ly/WVk1qN"
            //    Console.WriteLine(longUrl);         // Outputs "http://www.fluxbytes.com/"

            //    return shortUrl;
            //}

            public void GetWatermarkImages()
        {
            byte[] fileByte = null;
            if (Report.ReportObjects != null)
            {
                foreach (var field in Report.ReportObjects)
                {
                    if ((field as EbWaterMark).Image != string.Empty)
                    {
                        fileByte = this.ServiceClient.Post<byte[]>
                      (new DownloadFileRequest
                      {
                          FileDetails = new FileMeta
                          {
                              FileName = (field as EbWaterMark).Image + ".jpg",
                              FileType = "jpg"
                          }
                      });
                    }
                    Report.watermarkImages.Add((field as EbWaterMark).Image, fileByte);
                }
            }
        }
        public void DrawReportHeader()
        {
            rh_Yposition = 0;
            detailprintingtop = 0;
            foreach (EbReportHeader r_header in Report.ReportHeaders)
            {
                foreach (EbReportField field in r_header.Fields)
                {
                    DrawFields(field, rh_Yposition, 1);
                }
                rh_Yposition += r_header.Height;
            }
        }

        public void DrawPageHeader()
        {
            detailprintingtop = 0;
            ph_Yposition = (Report.PageNumber == 1) ? Report.ReportHeaderHeight : 0;
            foreach (EbPageHeader p_header in Report.PageHeaders)
            {
                foreach (EbReportField field in p_header.Fields)
                {
                    DrawFields(field, ph_Yposition, 1);
                }
                ph_Yposition += p_header.Height;
            }
        }

        public void DrawDetail()
        {
            if (Report.DataRow != null)
            {
                for (Report.SerialNumber = 1; Report.SerialNumber <= Report.DataRow.Count; Report.SerialNumber++)
                {
                    if (detailprintingtop < Report.DT_FillHeight && Report.DT_FillHeight - detailprintingtop >= Report.DetailHeight)
                    {
                        DoLoopInDetail(Report.SerialNumber);
                    }
                    else
                    {
                        detailprintingtop = 0;
                        d.NewPage();
                        Report.PageNumber = writer.PageNumber;
                        DoLoopInDetail(Report.SerialNumber);
                    }
                }
                if (Report.SerialNumber - 1 == Report.DataRow.Count)
                {
                    Report.IsLastpage = true;
                    // Report.CalculateDetailHeight(Report.IsLastpage, __datarows, Report.PageNumber);
                }
            }
            else
            {
                Report.IsLastpage = true;
                DoLoopInDetail(0);
            }
        }

        public void DoLoopInDetail(int serialnumber)
        {
            ph_Yposition = (Report.PageNumber == 1) ? Report.ReportHeaderHeight : 0;
            dt_Yposition = ph_Yposition + Report.PageHeaderHeight;
            foreach (EbReportDetail detail in Report.Detail)
            {
                foreach (EbReportField field in detail.Fields)
                {
                    DrawFields(field, dt_Yposition, serialnumber);
                }
                detailprintingtop += detail.Height;
            }
        }

        public void DrawPageFooter()
        {
            detailprintingtop = 0;
            ph_Yposition = (Report.PageNumber == 1) ? Report.ReportHeaderHeight : 0;
            dt_Yposition = ph_Yposition + Report.PageHeaderHeight;
            pf_Yposition = dt_Yposition + Report.DT_FillHeight;
            foreach (EbPageFooter p_footer in Report.PageFooters)
            {
                foreach (EbReportField field in p_footer.Fields)
                {
                    DrawFields(field, pf_Yposition, 1);
                }
                pf_Yposition += p_footer.Height;
            }
        }

        public void DrawReportFooter()
        {
            detailprintingtop = 0;
            dt_Yposition = ph_Yposition + Report.PageHeaderHeight;
            pf_Yposition = dt_Yposition + Report.DT_FillHeight;
            rf_Yposition = pf_Yposition + Report.PageFooterHeight;
            foreach (EbReportFooter r_footer in Report.ReportFooters)
            {
                foreach (EbReportField field in r_footer.Fields)
                {
                    DrawFields(field, rf_Yposition, 1);
                }
                rf_Yposition += r_footer.Height;
            }
        }

        //public void CallSummerize(string title, int i)
        //{
        //    var column_name = string.Empty;
        //    var column_val = string.Empty;

        //    List<object> SummaryList;
        //    if (Report.PageSummaryFields.ContainsKey(title))
        //    {
        //        SummaryList = Report.PageSummaryFields[title];
        //        foreach (var item in SummaryList)
        //        {
        //            var table = title.Split('.')[0];
        //            column_name = title.Split('.')[1];
        //            column_val = Report.GeFieldtData(column_name, i);
        //            (item as IEbDataFieldSummary).Summarize(column_val);
        //        }
        //    }
        //    if (Report.ReportSummaryFields.ContainsKey(title))
        //    {
        //        SummaryList = Report.ReportSummaryFields[title];
        //        foreach (var item in SummaryList)
        //        {
        //            var table = title.Split('.')[0];
        //            column_name = title.Split('.')[1];
        //            column_val = Report.GeFieldtData(column_name, i);
        //            (item as IEbDataFieldSummary).Summarize(column_val);
        //        }
        //    }

        //}

        //NEED FIX OO
        public void DrawFields(EbReportField field, float section_Yposition, int serialnumber)
        {
            var column_name = string.Empty;
            var column_val = string.Empty;
            if (Report.PageSummaryFields.ContainsKey(field.Title) || Report.ReportSummaryFields.ContainsKey(field.Title))
                Report.CallSummerize(field.Title, serialnumber);
            if (field is EbDataField)
            {
                if (field is IEbDataFieldSummary)
                {
                    column_val = (field as IEbDataFieldSummary).SummarizedValue.ToString();
                }
                else
                {
                    var table = field.Title.Split('.')[0];
                    column_name = field.Title.Split('.')[1];
                    column_val = Report.GeFieldtData(column_name, serialnumber);
                }
                field.DrawMe(canvas, Report.Height, section_Yposition, detailprintingtop, column_val);
            }
            if ((field is EbPageNo) || (field is EbPageXY) || (field is EbDateTime) || (field is EbSerialNumber))
            {
                if (field is EbPageNo)
                    column_val = Report.PageNumber.ToString();
                else if (field is EbPageXY)
                    column_val = Report.PageNumber + "/"/* + writer.PageCount*/;
                else if (field is EbDateTime)
                    column_val = DateTime.Now.ToString();
                else if (field is EbSerialNumber)
                    column_val = Report.SerialNumber.ToString();
                field.DrawMe(canvas, Report.Height, section_Yposition, detailprintingtop, column_val);
            }
            else if (field is EbImg)
            {
                byte[] fileByte = this.ServiceClient.Post<byte[]>
                     (new DownloadFileRequest
                     {
                         FileDetails = new FileMeta
                         {
                             FileName = (field as EbImg).Image + ".jpg",
                             FileType = "jpg"
                         }
                     });
                field.DrawMe(d, fileByte);
            }
            else if ((field is EbText) || (field is EbReportFieldShape))
            {
                field.DrawMe(canvas, Report.Height, section_Yposition, detailprintingtop);
            }
        }

        //public void DrawWaterMark()
        //{

        //    byte[] fileByte = null;
        //    if (Report.ReportObjects != null)
        //    {
        //        foreach (var field in Report.ReportObjects)
        //        {
        //            if ((field as EbWaterMark).Image != string.Empty)
        //            {
        //                fileByte = watermarkImages[(field as EbWaterMark).Image];
        //            }
        //        (field as EbWaterMark).DrawMe(pdfReader, d, writer, fileByte, Report.Height);
        //        }
        //    }
        //}
    }
}