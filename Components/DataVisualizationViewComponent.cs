using ExpressBase.Common;
using ExpressBase.Data;
using ExpressBase.Objects;
using ExpressBase.Objects.ObjectContainers;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.Filters;
using ExpressBase.Web.Models;
using ExpressBase.Web2;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class DataVisualizationViewComponent : ViewComponent
    {
        protected IServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public DataVisualizationViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }

        public async Task<IViewComponentResult> InvokeAsync(string dsRefid)
        {
            RetValObj xxx = null;
            if (!string.IsNullOrEmpty(dsRefid))
            {
                var resultlist = this.ServiceClient.Get<EbObjectResponse>(new EbObjectRequest { RefId = dsRefid, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataSource, TenantAccountId = ViewBag.cid });
                var fdid = EbSerializers.Json_Deserialize<EbDataSource>(resultlist.Data[0].Json).FilterDialogRefId;

                if (!string.IsNullOrEmpty(fdid))
                {
                    //get fd obj
                    resultlist = this.ServiceClient.Get<EbObjectResponse>(new EbObjectRequest { RefId = fdid, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.FilterDialog, TenantAccountId = ViewBag.cid });

                    //redundant - REMOVE JITH
                    var _filterDialog = EbSerializers.Json_Deserialize<EbFilterDialog>(resultlist.Data[0].Json);

                    ViewBag.HtmlHead = _filterDialog.GetHead();
                    ViewBag.HtmlBody = _filterDialog.GetHtml();
                }

                ViewBag.data = getDVObject(dsRefid);
                //Dictionary<string, object> _dict = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, object>>(data);
                //ViewBag.dsid = _dict["DataSourceRefId"];
                ////ViewBag.dvname = _dict["dvName"];
                //ViewBag.tableId = "dv" + ViewBag.dsid.ToString();
                //ViewBag.data = data;
                //xxx = new RetValObj { DSId = _dict["DataSourceRefId"].ToString(), DVName = _dict["Name"].ToString(), TableId = "dv" + _dict["DataSourceRefId"].ToString(), Data = data };
            }

            return View();
        }

        
        public string GetColumns(string dsRefid)
        {
            //var resultlist = sscli.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(dsid), VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataSource, Token = ViewBag.token });
            //var rlist = resultlist.Data;
            //var fdid = 0;
            //foreach (var element in rlist)
            //{
            //    var dsobj = EbSerializers.Json_Deserialize<EbDataSource>(element.Json);
            //    fdid = dsobj.FilterDialogId;
            //}

            //redis.Remove(string.Format("{0}_ds_{1}_columns", "eb_roby_dev", dsid));
            //redis.Remove(string.Format("{0}_TVPref_{1}_uid_{2}", "eb_roby_dev", dsid, 1));
            //redis.Remove(string.Format("{0}_ds_{1}_columns", ViewBag.cid, dsid));
            DataSourceColumnsResponse columnresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", dsRefid));
            if (columnresp == null || columnresp.IsNull)
                columnresp = this.ServiceClient.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { RefId = dsRefid, TenantAccountId = ViewBag.cid });

            //var tvpref = this.GetColumn4DataTable(columnresp.Columns, dsid, fdid, columnresp.IsPaged);
            return null;
            //dv(dsid, tvpref);

        }

        private string GetColumn4DataTable(ColumnColletion __columnCollection, int dsid, int fdid, bool isPaged)
        {
            var i = 0;
            string colDef = string.Empty;
            colDef = "{\"dsId\":" + dsid + ",\"fdId\":" + fdid + ",\"dvName\": \"<Untitled>\",\"renderAs\":\"table\",\"lengthMenu\":[ [100, 200, 300, -1], [100, 200, 300, \"All\"] ],";
            colDef += " \"scrollY\":300, \"rowGrouping\":\"\",\"leftFixedColumns\":0,\"rightFixedColumns\":0,\"IsPaged\":" + isPaged.ToString().ToLower() + ",\"columns\":[";
            colDef += "{\"width\":10, \"searchable\": false, \"orderable\": false, \"visible\":true, \"name\":\"serial\", \"title\":\"#\",\"type\":\"System.Int64\"},";
            colDef += "{\"width\":10, \"searchable\": false, \"orderable\": false, \"visible\":true, \"name\":\"checkbox\",\"type\":\"System.Boolean\"},";
            foreach (EbDataColumn column in __columnCollection)
            {
                colDef += "{";
                colDef += "\"data\": " + __columnCollection[column.ColumnName].ColumnIndex.ToString();
                colDef += string.Format(",\"title\": \"{0}<span hidden>{0}</span>\"", column.ColumnName);
                var vis = (column.ColumnName == "id") ? false.ToString().ToLower() : true.ToString().ToLower();
                colDef += ",\"visible\": " + true.ToString().ToLower();
                colDef += ",\"width\": \"100px\"";
                colDef += ",\"name\": \"" + column.ColumnName + "\"";
                colDef += ",\"type\": \"" + column.Type.ToString() + "\"";
                var cls = (column.Type.ToString() == "System.Double" || column.Type.ToString() == "System.Int32" || column.Type.ToString() == "System.Decimal" || column.Type.ToString() == "System.Int64") ? "dt-right tdheight" : "tdheight";
                colDef += ",\"className\": \"" + cls + "\"";
                colDef += ",\"pos\": \"" + (__columnCollection.Count + 100).ToString() + "\"";
                colDef += "},";
            }
            colDef = colDef.Substring(0, colDef.Length - 1) + "],";
            string colext = "\"columnsext\":[";
            colext += "{\"name\":\"serial\"},";
            colext += "{\"name\":\"checkbox\"},";
            foreach (EbDataColumn column in __columnCollection)
            {
                colext += "{";
                if (column.Type.ToString() == "System.Double" || column.Type.ToString() == "System.Int32" || column.Type.ToString() == "System.Decimal" || column.Type.ToString() == "System.Int16" || column.Type.ToString() == "System.Int64")
                    colext += "\"name\":\"" + column.ColumnName + "\",\"AggInfo\":true,\"DecimalPlace\":2,\"RenderAs\":\"Default\",\"linkDv\":\"\"";
                else if (column.Type.ToString() == "System.Boolean")
                    colext += "\"name\":\"" + column.ColumnName + "\",\"IsEditable\":false,\"RenderAs\":\"Default\"";
                else if (column.Type.ToString() == "System.DateTime")
                    colext += "\"name\":\"" + column.ColumnName + "\",\"Format\":\"Date\"";
                else if (column.Type.ToString() == "System.String")
                    colext += "\"name\":\"" + column.ColumnName + "\",\"RenderAs\":\"Default\",\"linkDv\":\"\"";
                colext += "},";
            }
            colext = colext.Substring(0, colext.Length - 1) + "]";
            return colDef + colext + "}";
        }

        private EbDataVisualization getDVObject(string dsRefid)
        {
            DataSourceColumnsResponse columnresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", dsRefid));
            if (columnresp == null || columnresp.IsNull)
                columnresp = this.ServiceClient.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { RefId = dsRefid, TenantAccountId = ViewBag.cid });
            EbDataVisualization eb = new EbDataVisualization();
            eb.DataSourceRefId = dsRefid;
            eb.Name = "<untittled>";
            eb.AfterRedisGet(this.Redis);
            eb.IsPaged = columnresp.IsPaged.ToString().ToLower();
            List<DTColumnDef> coldeflist = new List<DTColumnDef>();
            foreach(EbDataColumn column in columnresp.Columns)
            {
                DTColumnDef coldef = new DTColumnDef(column.ColumnIndex,column.ColumnName,column.Type.ToString());
                coldeflist.Add(coldef);
            }
            eb.columns = coldeflist;
            return eb;
        }
    }
   
}
