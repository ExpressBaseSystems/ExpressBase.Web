using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
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
            using (SpreadsheetDocument doc = SpreadsheetDocument.Open(stream, false))
            {
                WorkbookPart workbookPart = doc.WorkbookPart;
                WorksheetPart worksheetPart = workbookPart.WorksheetParts.First();
                Worksheet sheet = worksheetPart.Worksheet;
                SharedStringTablePart sstpart = workbookPart.GetPartsOfType<SharedStringTablePart>().Count() > 0 ? 
                    workbookPart.GetPartsOfType<SharedStringTablePart>().First() : null;
                SharedStringTable sst = sstpart != null ? sstpart.SharedStringTable : null;
                var rows = sheet.Descendants<SheetData>().First().Elements<Row>();
                if (rows.Count() > 1)
                {
                    EbDataTable tbl = new EbDataTable();
                    int colIndex = 0;
                    List<ColumnsInfo> _colInfo = new List<ColumnsInfo>();
                    WorksheetCommentsPart commentsPart = worksheetPart.GetPartsOfType<WorksheetCommentsPart>().First();
                    foreach (Comment comment in commentsPart.Comments.CommentList)
                    {
                        string s = comment.InnerText;
                        //ExcelColumns colInfo = (ExcelColumns)JsonConvert.DeserializeObject(s, typeof(ExcelColumns));
                        ColumnsInfo colInfo = (ColumnsInfo)JsonConvert.DeserializeObject(s, typeof(ColumnsInfo));
                        _colInfo.Add(colInfo);
                        EbDataColumn dc = new EbDataColumn { ColumnName = colInfo.Name, Type = colInfo.DbType, ColumnIndex = colIndex, TableName = colInfo.TableName };
                        tbl.Columns.Add(dc);
                        colIndex++;
                    }
                    var startRow = 0;
                    foreach(Row row in rows)
                    {
                        if (startRow > 0)
                        {
                            EbDataRow rr = tbl.NewDataRow2();
                            int colIndex1 = 0;
                            foreach (Cell cell in row.Elements<Cell>())
                            {
                                string cellref = cell.CellReference.ToString();
                                colIndex1 = GetColumnIndex(cellref);
                                if (colIndex1 < tbl.Columns.Count)
                                {
                                    if (tbl.Columns[colIndex1].Type == EbDbTypes.DateTime)
                                    {
                                        DateTime dt = DateTime.FromOADate(Convert.ToDouble(cell.CellValue.First()));
                                        rr[colIndex1] = dt.ToString("yyyy-MM-dd HH:mm:ss");
                                    }
                                    else if (tbl.Columns[colIndex1].Type == EbDbTypes.Date)
                                    {
                                        DateTime dt = DateTime.FromOADate(Convert.ToDouble(cell.CellValue.InnerText));
                                        rr[colIndex1] = dt.ToString("yyyy-MM-dd");
                                    }
                                    else if (tbl.Columns[colIndex1].Type == EbDbTypes.Boolean)
                                    {
                                        var val = "false";
                                        if (cell.CellValue.ToString() == "Yes")
                                            val = "true";
                                        rr[colIndex1] = val;
                                    }
                                    else if (tbl.Columns[colIndex1].Type == EbDbTypes.BooleanOriginal)
                                    {
                                        var val = false;
                                        if (cell.CellValue.ToString() == "Yes")
                                            val = true;
                                        rr[colIndex1] = val;
                                    }
                                    else if (cell.DataType != null && cell.DataType == CellValues.SharedString)
                                    {
                                        int ssid = int.Parse(cell.CellValue.Text);
                                        string str = sst.ChildElements[ssid].InnerText;
                                        rr[colIndex1] = str;
                                    }
                                    else
                                        rr[colIndex1] = cell.CellValue.Text;
                                }
                            }

                            tbl.Rows.Add(rr);
                        }
                        startRow++;
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

        private int GetColumnIndex(string cellReference)
        {
            //remove digits
            string columnReference = Regex.Replace(cellReference.ToUpper(), @"[\d]", string.Empty);

            int columnNumber = -1;
            int mulitplier = 1;

            //working from the end of the letters take the ASCII code less 64 (so A = 1, B =2...etc)
            //then multiply that number by our multiplier (which starts at 1)
            //multiply our multiplier by 26 as there are 26 letters
            foreach (char c in columnReference.ToCharArray().Reverse())
            {
                columnNumber += mulitplier * ((int)c - 64);

                mulitplier = mulitplier * 26;
            }

            //the result is zero based so return columnnumber + 1 for a 1 based answer
            //this will match Excel's COLUMN function
            return columnNumber;
        }

        public IActionResult download(string refid)
        {
            string str = "hhhh.xlsx";
            if (!string.IsNullOrEmpty(refid))
            {
                ExcelDownloadResponse response = this.ServiceClient.Get<ExcelDownloadResponse>(new ExcelDownloadRequest { _refid = refid });
                return File(response.stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", str);
            }
            return null;
        }

    }

    //public class ExcelColumns
    //{
    //    public string Name { get; set; }

    //    public EbDbTypes DbType { get; set; }

    //    public string Label { get; set; }

    //    public string TableName { get; set; }
    //}
}