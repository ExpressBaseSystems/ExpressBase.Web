using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Common.Excel;
using ExpressBase.Common.Structures;
using ExpressBase.Objects;
using ExpressBase.Objects.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using ServiceStack;
using ServiceStack.Redis;
using Syncfusion.XlsIO;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class ExcelController : EbBaseIntCommonController
    {
        // GET: /<controller>/

        public ExcelController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async void UploadExcelAsync()
        {
            IFormFileCollection files = Request.Form.Files;
            Stream stream = (files[0].OpenReadStream()); 

            using (ExcelEngine excelEngine = new ExcelEngine())
            {
                IApplication application = excelEngine.Excel;
                application.DefaultVersion = ExcelVersion.Excel2016; 
                IWorkbook workbook = application.Workbooks.Open(stream, ExcelOpenType.Automatic);
                foreach (IWorksheet worksheet in workbook.Worksheets)
                {
                    EbDataTable _ebtbl = new EbDataTable();
                    DataTable tbl = worksheet.ExportDataTable(worksheet.UsedRange, ExcelExportDataTableOptions.ColumnNames); 

                    //....set ebdatacolumns....
                    char[] excel = { 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' };
                     
                    for (int i = 1; i <= tbl.Columns.Count; i++)
                    {
                        string s = worksheet.Range[1, i].Comment.Text;
                        ExcelColumns colInfo = (ExcelColumns)JsonConvert.DeserializeObject(s, typeof(ExcelColumns));
                        EbDataColumn dc = new EbDataColumn { ColumnName = colInfo.Name, Type = colInfo.DbType, ColumnIndex = (i - 1), TableName = colInfo.TableName };
                        _ebtbl.Columns.Add(dc);
                    }

                    foreach (DataRow row in tbl.Rows)
                    {
                        EbDataRow rr = _ebtbl.NewDataRow2();
                        bool isNonEmpty = false;

                        for (int i = 0; i < tbl.Columns.Count; i++)
                        {
                            if (row[i] != null && row[i].ToString() != string.Empty)
                            {
                                isNonEmpty = true;
                                rr[i] = row[i];
                            }
                        }
                        if (isNonEmpty)
                            _ebtbl.Rows.Add(rr);

                    }

                    string _refid = "hairocraft_stagging-hairocraft_stagging-0-1193-1361-1193-1361";

                    if (_ebtbl.Columns.Contains(new EbDataColumn("eb_loc_id", EbDbTypes.Int32)))
                    {
                        InsertBatchDataResponse response = ServiceClient.Post<InsertBatchDataResponse>(new InsertBatchDataRequest { Data = _ebtbl, RefId = _refid });
                    }
                    else
                    {
                        InsertBatchDataResponse response = ServiceClient.Post<InsertBatchDataResponse>(new InsertBatchDataRequest { Data = _ebtbl, LocId = 1, RefId = _refid });
                    }                    
                }
            }
        } 

        public FileStreamResult download()
        {
            char[] excel = { 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' };
            string _refid = "hairocraft_stagging-hairocraft_stagging-0-1193-1361-1193-1361";
            ExcelDownloadResponse response = this.ServiceClient.Get<ExcelDownloadResponse>(new ExcelDownloadRequest { _refid = _refid });

            string _excelName = response.formName + ".xlsx";

            using (ExcelEngine excelEngine = new ExcelEngine())
            {
                IApplication application = excelEngine.Excel;
                application.DefaultVersion = ExcelVersion.Excel2016;
                IWorkbook workbook = application.Workbooks.Create(1);
                IWorksheet worksheet = workbook.Worksheets[0];
                int colIndex = 1;
                foreach (ColumnsInfo _col in response.colsInfo)
                {
                    string colId = excel[colIndex - 1].ToString() + 1;
                    worksheet.Range[1, colIndex].Text = _col.Label;
                    worksheet.Range[1, colIndex].AddComment().Text = JsonConvert.SerializeObject(new ExcelColumns { Name = _col.Name, DbType = _col.DbType, TableName = _col.TableName, Label = _col.Label });
                    IDataValidation _colValidation = worksheet.Range[colId].EntireColumn.DataValidation;
                    if (_col.DbType.ToString() == "String")
                        _colValidation.AllowType = ExcelDataType.Any;
                    if (_col.DbType.ToString() == "Date")
                    {

                        worksheet.Range[colId].EntireColumn.NumberFormat = "YYYY-MM-DD";
                        _colValidation.AllowType = ExcelDataType.Date;
                    }
                    if (_col.DbType.ToString() == "Decimal")
                        _colValidation.AllowType = ExcelDataType.Decimal;
                    if (_col.DbType.ToString() == "Int16" || _col.DbType.ToString() == "Int32" || _col.DbType.ToString() == "Int64")
                        _colValidation.AllowType = ExcelDataType.Integer;
                    if (_col.DbType.ToString() == "Time")
                        _colValidation.AllowType = ExcelDataType.Time;
                    colIndex++;
                }
                MemoryStream stream = new MemoryStream();
                workbook.SaveAs(stream);
                stream.Position = 0;
                //Download the Excel file in the browser
                FileStreamResult fileStreamResult = new FileStreamResult(stream, "application/excel");

                fileStreamResult.FileDownloadName = _excelName;

                return fileStreamResult;
            }
        }
        public void UploadAsync()
        {
            using (ExcelEngine excelEngine = new ExcelEngine())
            {
                //IWorkbook workbook = excelEngine.Excel.Workbooks.Open()
            }
        }
    }

    public class ExcelColumns
    {
        public string Name { get; set; }

        public EbDbTypes DbType { get; set; }

        public string Label { get; set; }

        public string TableName { get; set; }
    }
}
