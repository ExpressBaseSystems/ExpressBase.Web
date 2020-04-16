using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Common.Structures;
using ExpressBase.Objects;
using ExpressBase.Objects.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
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
            var files = Request.Form.Files;
            var path = Path.Combine(Directory.GetCurrentDirectory(), "Exceluploaded", files[0].FileName);
            using (var stream = new FileStream(path, FileMode.Create))
            {
                await files[0].CopyToAsync(stream);

            }

            using (ExcelEngine excelEngine = new ExcelEngine())
            {
                IApplication application = excelEngine.Excel;
                application.DefaultVersion = ExcelVersion.Excel2016;
                FileStream stream = new FileStream(path, FileMode.Open);
                IWorkbook workbook = application.Workbooks.Open(stream, ExcelOpenType.Automatic);
                foreach (var worksheet in workbook.Worksheets)
                {
                    DataTable tbl = new DataTable();
                    EbDataTable _ebtbl = new EbDataTable();
                    tbl = worksheet.ExportDataTable(worksheet.UsedRange, ExcelExportDataTableOptions.ColumnNames);
                    int cnt = tbl.Columns.Count;

                    string _refid = "hairocraft_stagging-hairocraft_stagging-0-1193-1361-1193-1361";

                    //....set ebdatacolumns....
                    char[] excel = { 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' };
                    int colcnt = tbl.Columns.Count;

                    for (int i = 1; i <= colcnt; i++)
                    {
                        string s = worksheet.Range[1, i].Comment.Text;
                        ExcelColumns colInfo = (ExcelColumns)JsonConvert.DeserializeObject(s, typeof(ExcelColumns));
                        EbDataColumn dc = new EbDataColumn { ColumnName = colInfo.Name, Type = colInfo.DbType, ColumnIndex = (i - 1) };
                        _ebtbl.Columns.Add(dc);
                    }

                    foreach (DataRow row in tbl.Rows)
                    {
                        _ebtbl.Rows.Add(new EbDataRow());
                        EbDataRow rr = new EbDataRow();
                    }

                    EbObjectParticularVersionResponse formObj = this.ServiceClient.Get(new EbObjectParticularVersionRequest() { RefId = _refid });
                    EbWebForm _form = EbSerializers.Json_Deserialize(formObj.Data[0].Json);

                    Dictionary<string, SingleTable> _multiTable = new Dictionary<string, SingleTable>();
                   // _multiTable.Add(tablename, new SingleTable { });
                    WebformData formdata = new WebformData { MultipleTables = _multiTable };
                    InsertDataFromWebformResponse resp = this.ServiceClient.Post(new InsertDataFromWebformRequest
                    {
                        RefId = _refid,
                        CurrentLoc = this.LoggedInUser.Preference.DefaultLocation,
                        FormData = formdata
                    });

                    //string PushJson = GetDataPusherJson(_form);
                    //InsertOrUpdateFormDataResp resp = this.ServiceClient.Any(new InsertOrUpdateFormDataRqst
                    //{
                    //    RefId = _refid,
                    //    PushJson = PushJson,
                    //    RecordId = 0,
                    //    UserObj = this.LoggedInUser,
                    //    LocId = this.LoggedInUser.Preference.DefaultLocation,
                    //    WhichConsole = "uc",
                    //    FormGlobals = new FormGlobals { Params = Globals.Params },
                    //    //TransactionConnection = TransactionConnection
                    //});
                }
            }
        }

        public string GetDataPusherJson(EbWebForm _form)
        {
            JObject Obj = new JObject();

            foreach (TableSchema _table in _form.FormSchema.Tables)
            {
                JObject o = new JObject();
                foreach (ColumnSchema _column in _table.Columns)
                {
                    o[_column.ColumnName] = "value";
                }
                JArray array = new JArray();
                array.Add(o);
                Obj[_table.TableName] = array;
            }
            return Obj.ToString();
        }
        public FileStreamResult download()
        {
            char[] excel = { 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' };
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
                foreach (var _col in response.colsInfo)
                {
                    string colId = excel[colIndex - 1].ToString() + 1;
                    worksheet.Range[1, colIndex].Text = _col.Label;
                    worksheet.Range[1, colIndex].AddComment().Text = JsonConvert.SerializeObject(new ExcelColumns { Name = _col.Name, DbType = _col.DbType, TableName = _col.TableName, Label = _col.Label });
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
