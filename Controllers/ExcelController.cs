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
using OfficeOpenXml;
using OfficeOpenXml.DataValidation.Contracts;
using OfficeOpenXml.DataValidation;


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
            InsertBatchDataResponse response = null;
            IFormFileCollection files = Request.Form.Files;
            string _refid = Request.Form["RefId"];
            Stream stream = (files[0].OpenReadStream());
            using (ExcelPackage pkg = new ExcelPackage(stream))
            {
                foreach (ExcelWorksheet worksheet in pkg.Workbook.Worksheets)
                {
                    var hasHeader = true;
                    EbDataTable tbl = new EbDataTable();
                    int colIndex = 0;
                    foreach (var firstRowCells in worksheet.Cells[1, 1, 1, worksheet.Dimension.End.Column])
                    {
                        string s = firstRowCells.Comment.Text;
                        ExcelColumns colInfo = (ExcelColumns)JsonConvert.DeserializeObject(s, typeof(ExcelColumns));
                        EbDataColumn dc = new EbDataColumn { ColumnName = colInfo.Name, Type = colInfo.DbType, ColumnIndex = colIndex, TableName = colInfo.TableName };
                        tbl.Columns.Add(dc);
                        colIndex++;
                    }
                    var startRow = hasHeader ? 2 : 1;
                    for (int rowNum = startRow; rowNum <= worksheet.Dimension.End.Row; rowNum++)
                    {
                        var row = worksheet.Cells[rowNum, 1, rowNum, worksheet.Dimension.End.Column];
                        EbDataRow rr = tbl.NewDataRow2();
                        int colIndex1 = 0;
                        foreach (var cell in row)
                        {
                            if (tbl.Columns[colIndex1].Type == EbDbTypes.DateTime)
                            {
                                //string s = cell.Value.ToString();
                                //long dateNum = long.Parse(s);
                                DateTime dt = DateTime.FromOADate(Convert.ToDouble(cell.Value));
                                rr[cell.Start.Column - 1] = dt.ToString("yyyy-MM-dd HH:mm:ss");
                            }
                            else if(tbl.Columns[colIndex1].Type == EbDbTypes.Boolean)
                            {
                                if (cell.Value.ToString() == "Yes")
                                    cell.Value = 'T';
                                else
                                    cell.Value = "F";
                                rr[cell.Start.Column - 1] = cell.Value.ToString();
                            }
                            else
                                rr[cell.Start.Column - 1] = cell.Text;

                            colIndex1++;
                        }

                        tbl.Rows.Add(rr);
                        //colIndex1++;
                    }

                    if (tbl.Columns.Contains(new EbDataColumn("eb_loc_id", EbDbTypes.Int32)))
                    {
                        response = ServiceClient.Post<InsertBatchDataResponse>(new InsertBatchDataRequest { Data = tbl, RefId = _refid });
                    }
                    else
                    {
                        response = ServiceClient.Post<InsertBatchDataResponse>(new InsertBatchDataRequest { Data = tbl, LocId = 1, RefId = _refid });
                    }
                }
            }
        }

        public FileStreamResult download(string refid)
        {
            ExcelDownloadResponse response = this.ServiceClient.Get<ExcelDownloadResponse>(new ExcelDownloadRequest { _refid = refid });
            string _excelName = response.formName + ".xlsx";
            FileStreamResult fs = null;

            if (refid != null && refid != string.Empty)
            {
                MemoryStream ms = new MemoryStream();
                using (var excel = new ExcelPackage())
                {
                    var workSheet = excel.Workbook.Worksheets.Add("Worksheet Name");
                    int colIndex = 1;

                    foreach (ColumnsInfo _col in response.colsInfo)
                    {
                        workSheet.Cells[1, colIndex].Value = _col.Label;
                        string comment = JsonConvert.SerializeObject(new ExcelColumns { Name = _col.Name, DbType = _col.DbType, TableName = _col.TableName, Label = _col.Label });
                        workSheet.Cells[1, colIndex].AddComment(comment, "ExpressBase");
                        var range = ExcelRange.GetAddress(2, colIndex, ExcelPackage.MaxRows, colIndex);
                        if (_col.DbType.ToString() == "Decimal")
                        {
                            IExcelDataValidationDecimal validate = workSheet.DataValidations.AddDecimalValidation(range);
                            validate.ErrorStyle = ExcelDataValidationWarningStyle.stop;
                            validate.PromptTitle = "Enter a integer value here";
                            validate.Prompt = "Decimal only allowed";
                            validate.ShowInputMessage = true;
                            validate.ErrorTitle = "Invalid Value entered";
                            validate.Error = "This cell must be a valid positive number.";
                            validate.ShowErrorMessage = true;
                            validate.Operator = ExcelDataValidationOperator.greaterThanOrEqual;
                            validate.Formula.Value = 0D;
                            workSheet.Column(colIndex).Style.Numberformat.Format = "0";
                            validate.AllowBlank = true;
                        }

                        else if (_col.DbType.ToString() == "Date")
                        {
                            IExcelDataValidationDateTime validate = workSheet.DataValidations.AddDateTimeValidation(range);
                            validate.ErrorStyle = ExcelDataValidationWarningStyle.stop;
                            validate.PromptTitle = "Enter valid date here";
                            validate.Prompt = "YYYY-MM-DD format allowed";
                            validate.ShowInputMessage = true;
                            validate.ErrorTitle = "Invalid Date entered";
                            validate.Error = "This cell must be a date in YYYY-MM-DD format";
                            validate.ShowErrorMessage = true;
                            validate.Operator = ExcelDataValidationOperator.greaterThanOrEqual;
                            validate.Formula.Value = new DateTime(1800, 01, 01);
                            workSheet.Column(colIndex).Style.Numberformat.Format = "YYYY-MM-DD";
                            validate.AllowBlank = true;
                        }

                        else if (_col.DbType.ToString() == "DateTime")
                        {
                            IExcelDataValidationDateTime validate = workSheet.DataValidations.AddDateTimeValidation(range);
                            validate.ErrorStyle = ExcelDataValidationWarningStyle.stop;
                            validate.PromptTitle = "Enter valid Date Time";
                            validate.Prompt = "yyyy-MM-dd HH:mm:ss";
                            validate.ShowInputMessage = true;
                            validate.ErrorTitle = "Invalid Date Time entered";
                            validate.Error = "This cell must be a Date Time in yyyy-MM-dd HH:mm:ss format";
                            validate.ShowErrorMessage = true;
                            validate.Operator = ExcelDataValidationOperator.greaterThanOrEqual;
                            validate.Formula.Value = new DateTime(1800, 01, 01);
                            workSheet.Column(colIndex).Style.Numberformat.Format = "yyyy-MM-dd HH:mm:ss";
                            validate.AllowBlank = true;
                        }
                        
                        else if(_col.DbType.ToString() == "Boolean")
                        {
                            IExcelDataValidationList validate = workSheet.DataValidations.AddListValidation(range);
                            validate.ErrorStyle = ExcelDataValidationWarningStyle.stop;
                            validate.PromptTitle = "Enter Yes/No";
                            validate.Prompt = "Yes/No";
                            validate.ShowInputMessage = true;
                            validate.ErrorTitle = "Invalid formate";
                            validate.Error = "This cell must be in Yes/No format";
                            validate.ShowErrorMessage = true;
                            validate.Formula.Values.Add("Yes");
                            validate.Formula.Values.Add("No");
                            validate.AllowBlank = false;
                            
                        }
                        else { }
                        workSheet.Column(colIndex).AutoFit();
                        colIndex++;
                    }

                    excel.SaveAs(ms);
                }
                ms.Position = 0;
                fs = new FileStreamResult(ms, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                fs.FileDownloadName = _excelName;
            }
            return fs;
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
