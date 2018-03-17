using ExpressBase.Common;
using ExpressBase.Common.Objects;
using ExpressBase.Common.Structures;
using ExpressBase.Data;
using ExpressBase.Objects;
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

        public async Task<IViewComponentResult> InvokeAsync(string dvobjt, string dvRefId)
        {
            var dvobj = EbSerializers.Json_Deserialize(dvobjt);
            ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
            if (dvobj != null)
            {
                //if (!string.IsNullOrEmpty(dvRefId))
                //{
                //    var dvObject = (ViewBag.wc == "dc") ? this.Redis.Get<EbDataVisualization>(dvRefId) : this.Redis.Get<EbDataVisualization>(dvRefId + ViewBag.UId);
                //    if (dvObject == null)
                //        dvObject = this.Redis.Get<EbDataVisualization>(dvRefId);
                //    dvObject.AfterRedisGet(this.Redis);
                //    ViewBag.data = dvObject;
                //}
                //else
                if (dvobj.Columns == null  || dvobj.Columns.Count == 0)
                    ViewBag.data = getDVObject(dvobj);
                else
                {
                    dvobj.AfterRedisGet(this.Redis);
                    ViewBag.data = dvobj;
                }
            }
            //ViewBag.Meta = Meta.Replace("\\r\\n", string.Empty);
            ViewBag.dvRefId = dvRefId;
            return View();
        }
        
        private EbDataVisualization getDVObject(EbDataVisualization dvobj)
        {
            //DataSourceColumnsResponse columnresp = null;
            DataSourceColumnsResponse columnresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", dvobj.DataSourceRefId));
            if (columnresp == null || columnresp.Columns.Count == 0)
                columnresp = this.ServiceClient.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { RefId = dvobj.DataSourceRefId, TenantAccountId = ViewBag.cid });

            dvobj.AfterRedisGet(this.Redis);

            var __columns = (columnresp.Columns.Count > 1) ? columnresp.Columns[1] : columnresp.Columns[0];
            int _pos = __columns.Count+100;

            dvobj.Columns = new DVColumnCollection();
            dvobj.IsPaged = columnresp.IsPaged.ToString();
            // Add Serial & Checkbox
            //dvobj.Columns.Add(new DVNumericColumn { Name = "serial", sTitle = "#", Type = DbType.Int64, bVisible = true, sWidth = "10px", Pos = -2 });
            //dvobj.Columns.Add(new DVBooleanColumn { Name = "checkbox", sTitle = "checkbox", Type = DbType.Boolean, bVisible = false, sWidth = "10px", Pos = -1 });


            foreach (EbDataColumn column in __columns)
            {
                DVBaseColumn _col = null;

                if ((int)column.Type == EbDbTypes.String && column.ColumnName == "socialid")
                    _col = new DVStringColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos , ClassName = "tdheight", RenderAs = StringRenderType.Image };
                else if ((int)column.Type == EbDbTypes.String && column.ColumnName == "latlong")
                    _col = new DVStringColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos, ClassName = "tdheight", RenderAs = StringRenderType.Marker };
                else if ((int)column.Type == EbDbTypes.String)
                    _col = new DVStringColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos, ClassName = "tdheight" };
                else if ((int)column.Type == EbDbTypes.Int16 || (int)column.Type == EbDbTypes.Int32 || (int)column.Type == EbDbTypes.Int64 || (int)column.Type == EbDbTypes.Double || (int)column.Type == EbDbTypes.Decimal || (int)column.Type == EbDbTypes.VarNumeric)
                    _col = new DVNumericColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos, ClassName = "tdheight dt-body-right" };
                else if ((int)column.Type == EbDbTypes.Boolean)
                    _col = new DVBooleanColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos, ClassName = "tdheight" };
                else if ((int)column.Type == EbDbTypes.DateTime || (int)column.Type == EbDbTypes.Date || (int)column.Type == EbDbTypes.Time)
                    _col = new DVDateTimeColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos, ClassName = "tdheight" };

                dvobj.Columns.Add(_col);
            }
            dvobj.DSColumns = dvobj.Columns;
            return dvobj;
        }
    }
   
}
