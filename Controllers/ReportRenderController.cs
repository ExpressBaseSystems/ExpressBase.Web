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
            Controller.DrawWaterMark();
        }

        public HeaderFooter(ReportRenderController _c) : base()
        {
            this.Controller = _c; 
        }
    }
    public class ReportRenderController : EbBaseNewController
    {
        private RowColletion __datarows;
        private DataSourceColumnsResponse cresp = null;
        private DataSourceDataResponse dresp = null;
        private ColumnColletion __columns = null;

        private EbReport Report = null;
        private iTextSharp.text.Font f = FontFactory.GetFont(FontFactory.HELVETICA, 12);
        private PdfContentByte canvas;
        private PdfWriter writer;
        private Document d;
        public PdfReader pdfReader;
        public PdfStamper stamp;
        public MemoryStream ms1;

        private float rf_Yposition;
        private float pf_Yposition;
        private float ph_Yposition;
        private float dt_Yposition;
        private float detailprintingtop = 0;

        private List<object> WaterMarkList = new List<object>();
        private Dictionary<string, byte[]> watermarkImages = new Dictionary<string, byte[]>();

        public ReportRenderController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        public IActionResult Index(string refid)
        {
            var resultlist = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
            Report = EbSerializers.Json_Deserialize<EbReport>(resultlist.Data[0].Json);
            Report.IsLastpage = false;
            if (Report.DataSourceRefId != string.Empty)
            {
                cresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", Report.DataSourceRefId));
                if (cresp.IsNull)
                    cresp = this.ServiceClient.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { RefId = Report.DataSourceRefId });

                __columns = (cresp.Columns.Count > 1) ? cresp.Columns[1] : cresp.Columns[0];

                dresp = this.ServiceClient.Get<DataSourceDataResponse>(new DataSourceDataRequest { RefId = Report.DataSourceRefId, Draw = 1, Start = 0, Length = 100 });
                __datarows = dresp.Data;
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
            Report.DataRowCount = __datarows.Count;
            Report.InitializeSummaryFields();
            GetWatermarkImages();
            d.NewPage();

            DrawReportHeader();
            DrawDetail();
            DrawReportFooter();
            d.Close();
            ms1.Position = 0;//important
            return new FileStreamResult(ms1, "application/pdf");
        }

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
                    watermarkImages.Add((field as EbWaterMark).Image, fileByte);
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
                    DrawFields(field, rh_Yposition, 1);
                }
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
            }
        }

        public void DrawDetail()
        {
            if (__datarows != null)
            {
                for (Report.SerialNumber = 1; Report.SerialNumber <= __datarows.Count; Report.SerialNumber++)
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
                if (Report.SerialNumber - 1 == __datarows.Count)
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
            dt_Yposition = ph_Yposition + Report.PageHeaderHeight;
            pf_Yposition = dt_Yposition + Report.DT_FillHeight;
            foreach (EbPageFooter p_footer in Report.PageFooters)
            {
                foreach (EbReportField field in p_footer.Fields)
                {
                    DrawFields(field, pf_Yposition, 1);
                }
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
            }
        }
        public void CallSummerize(string title, int i)
        {
            var column_name = string.Empty;
            var column_val = string.Empty;

            List<object> SummaryList;
            if (Report.PageSummaryFields.ContainsKey(title))
            {
                SummaryList = Report.PageSummaryFields[title];
                foreach (var item in SummaryList)
                {
                    var table = title.Split('.')[0];
                    column_name = title.Split('.')[1];
                    column_val = GeFieldtData(column_name, i);
                    (item as IEbDataFieldSummary).Summarize(column_val);
                }
            }
            if (Report.ReportSummaryFields.ContainsKey(title))
            {
                SummaryList = Report.ReportSummaryFields[title];
                foreach (var item in SummaryList)
                {
                    var table = title.Split('.')[0];
                    column_name = title.Split('.')[1];
                    column_val = GeFieldtData(column_name, i);
                    (item as IEbDataFieldSummary).Summarize(column_val);
                }
            }

        }

        //NEED FIX OO
        public void DrawFields(EbReportField field, float section_Yposition, int serialnumber)
        {
            var column_name = string.Empty;
            var column_val = string.Empty;
            if (Report.PageSummaryFields.ContainsKey(field.Title) || Report.ReportSummaryFields.ContainsKey(field.Title))
                CallSummerize(field.Title, serialnumber);
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
                    column_val = GeFieldtData(column_name, serialnumber);
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

        public string GeFieldtData(string column_name, int i)
        {
            var columnindex = 0;
            var column_val = "";
            foreach (var col in __columns)
            {
                if (col.ColumnName == column_name)
                {
                    column_val = __datarows[i - 1][columnindex].ToString();
                    return column_val;
                }
                columnindex++;
            }
            return column_val;
        }

        public void DrawWaterMark()
        {

            byte[] fileByte = null;
            if (Report.ReportObjects != null)
            {
                foreach (var field in Report.ReportObjects)
                {
                    if ((field as EbWaterMark).Image != string.Empty)
                    {
                        fileByte = watermarkImages[(field as EbWaterMark).Image];
                    }
                (field as EbWaterMark).DrawMe(pdfReader, d, writer, fileByte, Report.Height);
                }
            }
        }
    }
}