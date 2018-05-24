using ExpressBase.Common;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using OfficeOpenXml;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Controllers
{
    public class ExcelUploadController : EbBaseIntCommonController
    {
        public ExcelUploadController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        public IActionResult Excel()
        {

            return View();
        }

        //...........code for upload workbook........
        [HttpPost]

        public async Task<List<String>> GetWorksheetsAsync()
        {
            var files = Request.Form.Files;
            var path = Path.Combine(Directory.GetCurrentDirectory(), "ExcelFile", files[0].FileName);
            using (var stream = new FileStream(path, FileMode.Create))
            {
                await files[0].CopyToAsync(stream);
            }
            FileInfo uploadFile = new FileInfo(Path.Combine(Directory.GetCurrentDirectory(), "ExcelFile", files[0].FileName));
            var excel = new ExcelPackage(uploadFile);
            //int count = excel.Workbook.Worksheets.Count;
            int count = excel.Workbook.Worksheets.Count;
            List<String> sheets = new List<string>();

            //if (count > 0)
            //{
                for (int i = 1; i <= count; i++)
                {
                    var name = excel.Workbook.Worksheets[i].Name;
                    sheets.Add(name);
                }
                sheets.Add(path);
            //}
            return sheets;
        }

        public string ReadWorksheets(string selected_opt, string file_path)
        {
            DataTable tbl = new DataTable();
            tbl = readExcelSheet(selected_opt, file_path);
            string _html = "<table id='tbl' class='display nowrap' cellspacing='0' width='100 % '>";
            List<string> headers = getColHeaders(tbl);
            _html += "<thead><tr>";
            foreach (var header in headers)
            {
                _html += "<th>" + header + "</th>";
            }
            _html += "</tr></thead><tbody>";
            foreach (DataRow dr in tbl.Rows.Cast<DataRow>().Skip(1))
            {
                _html += "<tr>";
                foreach (object item in dr.ItemArray)
                {
                    _html += "<td>";
                    _html += item.ToString();
                    _html += "</td>";
                }
                _html += "</tr>";
            }
            _html += "</tbody></table>";
            return _html;
        }

        public List<string> SetColDataType(string selected_opt, string file_path)
        {
            DataTable tbl = readExcelSheet(selected_opt, file_path);
            List<string> headers = getColHeaders(tbl);
            string html = "<html><table id='col_cust' class='display nowrap' cellspacing='0' width='100 % '>";
            html += "<thead><tr><th>Column Names</th><th>Data Types</th></tr></thead><tbody>";
            int iter = 1;
            string[] type = { "text", "int", "numeric", "date", "time", "timestamp" };
            List<string> type_ary = type.ToList();
            type_ary.Sort();
            foreach (var header in headers)
            {
                string id1 = "col_name" + iter;
                string id2 = "col_type" + iter;
                iter++;
                html += "<tr><td><input class='form-control' id='" + id1 + "' type='text' value='" + header + "'/><td><td><select id='" + id2 + "' class='form-control'><option value='sel'>--Select--</option> ";
                foreach (var op in type_ary)
                {
                    html += "<option value='" + op + "'>" + op + "</option>";
                }
                html += "</select></td></tr>";
            }
            html += "</tbody></table></html>";
            List<string> rslt = new List<string>();
            rslt.Add(html);
            rslt.Add(headers.Count().ToString());
            return rslt;
        }

        public List<string> IsTableExist(string selected_opt, string file_path, string tblName)
        {
            List<string> rslt = new List<string>();
            string tbl = NamingConvention(tblName);
            var fr = this.ServiceClient.Get<CheckTblResponse>(new CheckTblRequest { tblName = tbl });
            string x = fr.msg[0].ToString();
            if (fr.msg[0].ToString() == "true")
            {
                rslt.Add("Table Name Already Exist!");
            }
            else
            {
                rslt = SetColDataType(selected_opt, file_path);
            }
            return rslt;
        }

        public void CreateTable(string selected_opt, string file_path, string tblName, string colcust)
        {
            CustomizeColParent parent = JsonConvert.DeserializeObject<CustomizeColParent>(colcust);
            //.....create table...............

            var res1 = this.ServiceClient.Get<CreateTblResponse>(new CreateTblRequest { tblName = tblName, headerList = parent });

            //......Read Content.............
            DataTable dtTbl = new DataTable();
            dtTbl = readExcelSheet(selected_opt, file_path);
            Dictionary<string, string> dict = new Dictionary<string, string>();
            for (int i = 0; i < parent.abc.Count; i++)
            {
                dict.Add(parent.abc[i].colName, parent.abc[i].dataType);
                dtTbl.Columns[i].ColumnName = parent.abc[i].colName;
            }

            //.....insert into table..........
            insertIntoTbl(tblName, dtTbl, dict);

        }

        public List<string> getColHeaders(DataTable dtTbl)
        {
            List<string> headers = new List<string>();
            foreach (DataColumn dc in dtTbl.Columns)
            {
                string header = NamingConvention(dc.ColumnName);
                headers.Add(header);
            }
            return headers;
        }

        public void insertIntoTbl(string tblName, DataTable tbl, Dictionary<string, string> dict)
        {
            var obj = JsonConvert.SerializeObject(tbl);
            var res2 = this.ServiceClient.Get<InsertIntoTblResponse>(new InsertIntoTblResponseRequest { tblName = tblName, dtTbl = obj, dataType = dict });
        }

        public string NamingConvention(String str)
        {
            string name = str.Replace(" ", "");
            name = name.ToLower();
            return name;
        }

        public DataTable readExcelSheet(string sheet, string path)
        {
            DataTable tbl = new DataTable();
            FileInfo fi = new FileInfo(path);
            using (var excel = new ExcelPackage(fi))
            {

                var ws = excel.Workbook.Worksheets[sheet];

                var hasHeader = true;  // adjust accordingly
                                       // add DataColumns to DataTable
                foreach (var firstRowCell in ws.Cells[1, 1, 1, ws.Dimension.End.Column])
                    tbl.Columns.Add(hasHeader ? firstRowCell.Text
                        : String.Format("Column {0}", firstRowCell.Start.Column));
                for (int rowNum = 1; rowNum <= ws.Dimension.End.Row; rowNum++)
                {
                    var wsRow = ws.Cells[rowNum, 1, rowNum, ws.Dimension.End.Column];
                    DataRow row = tbl.NewRow();

                    foreach (var cell in wsRow)
                        row[cell.Start.Column - 1] = cell.Text;
                    tbl.Rows.Add(row);
                }
            }
            return tbl;
        }

        //...........Retrieve all DB Tables..............
        public List<string> GetDBTables()
        {
            var fr = this.ServiceClient.Get<DBTableResponse>(new DBTableRequest());
            List<string> tbls = new List<string>();
            tbls = fr.list1;
            return fr.list1;
        }

        //......Retrieve all columns corresponding to specific table
        public List<string> GetDBColumns(string tbl_name, string excel_path, string sheet)
        {
            var fr = this.ServiceClient.Get<DBColumnResponse>(new DBColumnRequest { tblName = tbl_name });
            string html = "<table id='coltbl' class='display nowrap' cellspacing='0' width='100 % '><thead><tr><th>Column Name</th><th>Data Type</th></tr></thead><tbody>";

            DataTable tbl = readExcelSheet(sheet, excel_path);
            List<string> col_header = getColHeaders(tbl);
            List<string> returnstr = new List<string>();
            //List<string> operatelist = new List<string>();
            //...........................................
            if (col_header.Count != fr.tbl.Rows.Count)
            {
                returnstr.Add("column nos not matched");
            }
            else
            {


                //..........................................

                int i = 1;
                foreach (EbDataRow dr in fr.tbl.Rows)
                {
                    string sel_name = "sel" + i;
                    i++;
                    html += "<tr><td>" + dr[0] + "</td><td>" + dr[1] + "</td><td><select id='" + sel_name + "'>";


                    List<string> operatelist = new List<string>(col_header);


                    //........Auto Map.......................


                    if (operatelist.Contains(dr[0]))   //....chk excel db col header and existing db header
                    {
                        html += "<option value='" + dr[0] + "' selected>" + dr[0] + "</option>";
                        // html += "<input type='text' value='"+dr[0]+"'/>";
                        operatelist.Remove(dr[0].ToString());
                    }
                    else
                    {
                        html += "<option value='sel'>--Select--</option>";
                    }
                    foreach (var item in operatelist)
                    {
                        html += "<option value='" + item + "'>" + item + "</option>";
                    }

                    html += "</select></td></tr>";

                }
                html += "</tbody></table>";
                returnstr.Add(html);

                returnstr.Add(fr.tbl.Rows.Count.ToString());
            }
            return returnstr;
        }

        //.....Mapping function..........................
        public void ColumnMapping(string selected_opt, string file_path, String[] mapcol, string newtbl)
        {
            var fr = this.ServiceClient.Get<DBColumnResponse>(new DBColumnRequest { tblName = newtbl });

            DataTable tbl = new DataTable();

            tbl = readExcelSheet(selected_opt, file_path);

            Dictionary<string, string> datatype = new Dictionary<string, string>();
            //foreach(var col in fr.tbl.Columns)
            //{
            //    datatype.Add(col.ColumnName, col.Type);
            //}



            foreach (DataColumn dc in tbl.Columns)
            {
                tbl.Columns[dc.ColumnName].ColumnName = "_" + dc.ColumnName;


            }
            for (int i = 0; i < fr.tbl.Rows.Count; i++)
            {
                datatype.Add(fr.tbl.Rows[i][0].ToString(), fr.tbl.Rows[i][1].ToString());
            }


            for (int i = 0; i < mapcol.Length; i++)
            {
                string name = "_" + mapcol[i];
                //var x = fr.tbl.Rows[i][0].ToString();
                tbl.Columns[name].ColumnName = fr.tbl.Rows[i][0].ToString();
                //datatype.Add(fr.tbl.Rows[i][0].ToString(), fr.tbl.Rows[i][1].ToString());
            }

            insertIntoTbl(newtbl, tbl, datatype);
        }

        public string DeleteFile(string path)
        {
            FileInfo uploadFile = new FileInfo(path);
            if (uploadFile.Exists)
            {
                uploadFile.Delete();
            }
            return "Process Successfully Finished";
        }
        //**********************************************************************************************************************

    }
}
