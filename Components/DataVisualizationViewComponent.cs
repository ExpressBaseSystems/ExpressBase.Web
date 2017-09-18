using ExpressBase.Common;
using ExpressBase.Common.Objects;
using ExpressBase.Data;
using ExpressBase.Objects;
using ExpressBase.Objects.ObjectContainers;
using ExpressBase.Objects.Objects.DVRelated;
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
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class DataVisualizationViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public DataVisualizationViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }

        public async Task<IViewComponentResult> InvokeAsync(string dsRefid, string Meta, string dvRefId)
        {
            ViewBag.ServiceUrl = this.ServiceClient.BaseUri;
            if (!string.IsNullOrEmpty(dsRefid))
            {
                if (!string.IsNullOrEmpty(dvRefId))
                {
                    var dvObject = (ViewBag.wc == "dc") ? this.Redis.Get<EbDataVisualization>(dvRefId) : this.Redis.Get<EbDataVisualization>(dvRefId + ViewBag.UId);
                    if (dvObject == null)
                        dvObject = this.Redis.Get<EbDataVisualization>(dvRefId);
                    dvObject.AfterRedisGet(this.Redis);
                    ViewBag.data = dvObject;
                }
                else
                    ViewBag.data = getDVObject(dsRefid);
            }
            ViewBag.Meta = Meta.Replace("\\r\\n", string.Empty);
            ViewBag.dvRefId = dvRefId;
            return View();
        }
        
        private EbTableVisualization getDVObject(string dsRefid)
        {
            DataSourceColumnsResponse columnresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", dsRefid));
            if (columnresp == null || columnresp.Columns.Count == 0)
                columnresp = this.ServiceClient.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { RefId = dsRefid, TenantAccountId = ViewBag.cid });

            EbTableVisualization ebTable = new EbTableVisualization();

            //EbDataVisualization eb = new EbDataVisualization()
            //{
            //    DataSourceRefId = dsRefid,
            //    Name = "<Untitled>",
            //    IsPaged = columnresp.IsPaged.ToString().ToLower(),
            //    Columns = new DVColumnCollection()
            //};
            ebTable.AfterRedisGet(this.Redis);

            var __columns = (columnresp.Columns.Count > 1) ? columnresp.Columns[1] : columnresp.Columns[0];
            int _pos = __columns.Count+100;

            // Add Serial & Checkbox
            ebTable.Columns.Add(new DVNumericColumn { Name = "serial", sTitle = "#", Type = DbType.Int64, bVisible = true, sWidth = "10px", Pos = -2 });
            ebTable.Columns.Add(new DVBooleanColumn { Name = "checkbox", sTitle = "checkbox", Type = DbType.Boolean, bVisible = false, sWidth = "10px", Pos = -1 });


            foreach (EbDataColumn column in __columns)
            {
                DVBaseColumn _col = null;

                if (column.Type == DbType.String)
                    _col = new DVStringColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos , ClassName = "tdheight" };
                else if (column.Type == DbType.Int16 || column.Type == DbType.Int32 || column.Type == DbType.Int64 || column.Type == DbType.Double || column.Type == DbType.Decimal || column.Type == DbType.VarNumeric)
                    _col = new DVNumericColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos, ClassName = "tdheight" };
                else if (column.Type == DbType.Boolean)
                    _col = new DVBooleanColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos, ClassName = "tdheight" };
                else if (column.Type == DbType.DateTime || column.Type == DbType.Date || column.Type == DbType.Time)
                    _col = new DVDateTimeColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos, ClassName = "tdheight" };

                ebTable.Columns.Add(_col);
            }

            return ebTable;
        }
    }
   
}
