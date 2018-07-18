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

        public async Task<IViewComponentResult> InvokeAsync(string dvobjt, string dvRefId, bool flag)
        {
            var dvobj = EbSerializers.Json_Deserialize(dvobjt);
            ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
            ViewBag.serviceclient = this.ServiceClient;
            if (dvobj != null)
            {
                dvobj.AfterRedisGet(this.Redis, this.ServiceClient);
                if (flag)
                    ViewBag.data = getDVObject(dvobj);
                else
                    ViewBag.data = dvobj;
            }
            ViewBag.dvRefId = dvRefId;
            //ViewBag.forWrap = forWrap;
            return View();
        }
        
        private EbDataVisualization getDVObject(EbDataVisualization dvobj)
        {
            //DataSourceColumnsResponse columnresp = null;
            DataSourceColumnsResponse columnresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", dvobj.DataSourceRefId));
            if (columnresp == null || columnresp.Columns.Count == 0)
                columnresp = this.ServiceClient.Get<DataSourceColumnsResponse>(new TableColumnsRequest { RefId = dvobj.DataSourceRefId, TenantAccountId = ViewBag.cid, Params = (dvobj.EbDataSource.FilterDialog != null) ? dvobj.EbDataSource.FilterDialog.GetDefaultParams() :  null});


            var __columns = (columnresp.Columns.Count > 1) ? columnresp.Columns[1] : columnresp.Columns[0];
            int _pos = __columns.Count+100;

            var Columns = new DVColumnCollection();
            dvobj.IsPaged = columnresp.IsPaged.ToString();

            var indx = -1;
            foreach (EbDataColumn column in __columns)
            {
                DVBaseColumn _col = null;

                if (column.Type == EbDbTypes.String && column.ColumnName == "socialid")
                    _col = new DVStringColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos , ClassName = "tdheight", RenderAs = StringRenderType.Image };
                else if (column.Type == EbDbTypes.String && column.ColumnName == "latlong")
                    _col = new DVStringColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos, ClassName = "tdheight", RenderAs = StringRenderType.Marker };
                else if (column.Type == EbDbTypes.String)
                    _col = new DVStringColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos, ClassName = "tdheight" };
                else if (column.Type == EbDbTypes.Int16 || column.Type == EbDbTypes.Int32 || column.Type == EbDbTypes.Int64 || column.Type == EbDbTypes.Double || column.Type == EbDbTypes.Decimal || column.Type == EbDbTypes.VarNumeric)
                    _col = new DVNumericColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos, ClassName = "tdheight dt-body-right" };
                else if (column.Type == EbDbTypes.Boolean)
                    _col = new DVBooleanColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos, ClassName = "tdheight" };
                else if (column.Type == EbDbTypes.DateTime || column.Type == EbDbTypes.Date || column.Type == EbDbTypes.Time)
                    _col = new DVDateTimeColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, sType = "date-uk", Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos, ClassName = "tdheight" };
                _col.EbSid = column.Type.ToString() + column.ColumnIndex;
                Columns.Add(_col);
                indx = column.ColumnIndex;
            }
            //dvobj.Columns.Add(new DVNumericColumn { Data = ++indx, Name = "RATE_GRAFT", sTitle = "RATE+GRAFT", Type = EbDbTypes.Int32, bVisible = true, sWidth = "100px", ClassName = "tdheight dt-body-right",Formula = "T0.RATE+T0.GRAFT" });
            if (dvobj.Columns == null || dvobj.Columns.Count == 0)
                dvobj.Columns = Columns;
            else
                dvobj.Columns = compareDVColumns(dvobj.Columns, Columns);
            dvobj.DSColumns = dvobj.Columns;
            return dvobj;
        }

        private DVColumnCollection compareDVColumns(DVColumnCollection OldColumns, DVColumnCollection CurrentColumns)
        {
            var NewColumns = new DVColumnCollection();
            foreach(DVBaseColumn oldcol in OldColumns)
            {
                var tempCol = CurrentColumns.Pop(oldcol.Name, oldcol.Type);
                if (tempCol != null)
                {
                    oldcol.Data = tempCol.Data;
                    NewColumns.Add(oldcol);
                }
            }

            foreach (DVBaseColumn curcol in CurrentColumns)
                NewColumns.Add(curcol);

            return NewColumns;
        }
    }

    
}
