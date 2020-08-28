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
                    List<ColumnsInfo> _colInfo = new List<ColumnsInfo>();
                    foreach (var firstRowCells in worksheet.Cells[1, 1, 1, worksheet.Dimension.End.Column])
                    {
                        string s = firstRowCells.Comment.Text;
                        //ExcelColumns colInfo = (ExcelColumns)JsonConvert.DeserializeObject(s, typeof(ExcelColumns));
                        ColumnsInfo colInfo = (ColumnsInfo)JsonConvert.DeserializeObject(s, typeof(ColumnsInfo));
                        _colInfo.Add(colInfo);
                        EbDataColumn dc = new EbDataColumn { ColumnName = colInfo.Name, Type = colInfo.DbType, ColumnIndex = colIndex, TableName = colInfo.TableName };
                        tbl.Columns.Add(dc);
                        colIndex++;
                    }
                    var startRow = hasHeader ? 2 : 1;
                    for (int rowNum = startRow; rowNum <= worksheet.Dimension.End.Row; rowNum++)
                    {
                        var row = worksheet.Cells[rowNum, 1, rowNum, worksheet.Dimension.End.Column];
                        if(row != null || row.ToString() != string.Empty)
                        {
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
                                else if (tbl.Columns[colIndex1].Type == EbDbTypes.Boolean)
                                {
                                    if (cell.Value.ToString() == "Yes")
                                        cell.Value = "true";
                                    else
                                        cell.Value = "false";
                                    rr[cell.Start.Column - 1] = cell.Value.ToString();
                                }
                                else if (tbl.Columns[colIndex1].Type == EbDbTypes.BooleanOriginal)
                                {
                                    if (cell.Value.ToString() == "Yes")
                                        cell.Value = true;
                                    else
                                        cell.Value = false;
                                    rr[cell.Start.Column - 1] = cell.Value.ToString();
                                }
                                //_colInfo.
                                else
                                    rr[cell.Start.Column - 1] = cell.Text;

                                colIndex1++;
                            }

                            tbl.Rows.Add(rr);
                        }
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

        public FileContentResult download(string refid)
        {
            FileContentResult file = null;
            if (refid != null && refid != string.Empty)
            {
                ExcelDownloadResponse response = this.ServiceClient.Get<ExcelDownloadResponse>(new ExcelDownloadRequest { _refid = refid });
                byte[] stream = response.stream;
                string fileName = response.fileName;
                file = File(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
                //FileStreamResult file = new FileStreamResult(stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                //file.FileDownloadName = response.fileName;  
            }
            return file;
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
