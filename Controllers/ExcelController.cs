using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
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

        public FileStreamResult download()
        {
            char[] excel = { 'A', 'B','C','D', 'E', 'F', 'G', 'H', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U','V','W','X','Y','Z' };
            string _refid = "hairocraft_stagging-hairocraft_stagging-0-1193-1361-1193-1361";
            var response = this.ServiceClient.Get<ExcelDownloadResponse>(new ExcelDownloadRequest { _refid = _refid });

            string _excelName = response.formName + ".xlsx";

            using (ExcelEngine excelEngine = new ExcelEngine())
            {
                IApplication application = excelEngine.Excel;
                application.DefaultVersion = ExcelVersion.Excel2016;
                IWorkbook workbook = application.Workbooks.Create(1);
                IWorksheet worksheet = workbook.Worksheets[0];

                int colIndex = 1;
                foreach(var _col in response.colsInfo)
                {
                    string colId = excel[colIndex - 1].ToString() + 1 ;
                    worksheet.Range[1, colIndex].Text = _col.Label;
                    worksheet.Range[1, colIndex].AddComment().Text = JsonConvert.SerializeObject(new ExcelColumns { Name = _col.Name, TableName = _col.TableName });
                    IDataValidation _colValidation = worksheet.Range[colId].EntireColumn.DataValidation;
                    if (_col.DbType.ToString() == "String")
                        _colValidation.AllowType = ExcelDataType.Any;
                    if (_col.DbType.ToString() == "Date")
                        _colValidation.AllowType = ExcelDataType.Date;
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
    }
    public class ExcelColumns
    {
        public string Name { get; set; }

        public string TableName { get; set; }
    }
}
