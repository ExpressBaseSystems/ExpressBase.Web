using ExpressBase.Common;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.Objects;
using ExpressBase.Security;
using ExpressBase.Objects;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Web.Controllers;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Common.Structures;

namespace ExpressBase.Web.Components
{
    public class CalendarCommonViewComponent: ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public CalendarCommonViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }

        public async Task<IViewComponentResult> InvokeAsync(string dvobjt, User _user, Eb_Solution _sol, string wc, bool flag, string curloc, string submitId)
        {
            var dvobj = EbSerializers.Json_Deserialize(dvobjt);
            ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
            ViewBag.serviceclient = this.ServiceClient;
            ViewBag.currentUser = _user;
            ViewBag.solution = _sol;
            ViewBag.submitId = submitId;
            if (dvobj != null)
            {
                dvobj.AfterRedisGet(this.Redis, this.ServiceClient);
                EbCalendarView TableVisObj = dvobj;
                if (TableVisObj.EbDataSource.FilterDialog != null)
                    EbControlContainer.SetContextId(TableVisObj.EbDataSource.FilterDialog, "param1");
                ViewBag.data = TableVisObj;
            }
            ViewBag.wc = wc;
            ViewBag.curloc = curloc;
            if(flag)
                ViewBag.Columns = GetColumns4Calendar(dvobjt);
            else
                ViewBag.Columns = new CalendarReturnColumns();
            return View();
        }

        public CalendarReturnColumns GetColumns4Calendar(string dvobjt)
        {
            EbDataVisualization dvobj = EbSerializers.Json_Deserialize(dvobjt);
            dvobj.AfterRedisGet(this.Redis, this.ServiceClient);
            CalendarReturnColumns returnobj = new CalendarReturnColumns();
            try
            {
                DataSourceColumnsResponse columnresp = new DataSourceColumnsResponse();
                columnresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", dvobj.DataSourceRefId));
                if (columnresp == null || columnresp.Columns == null || columnresp.Columns.Count == 0)
                {
                    Console.WriteLine("Column Object in Redis is null or count 0");
                    columnresp = this.ServiceClient.Get<DataSourceColumnsResponse>(new DataSourceDataSetColumnsRequest { RefId = dvobj.DataSourceRefId, SolnId = ViewBag.cid, Params = (dvobj.EbDataSource.FilterDialog != null) ? dvobj.EbDataSource.FilterDialog.GetDefaultParams() : null });
                    if (columnresp == null || columnresp.Columns.Count == 0)
                    {
                        Console.WriteLine("Column Object from SS is null or count 0");
                        throw new Exception("Object Not found(Redis + SS)");
                    }
                }
                DSController dscont = new DSController(this.ServiceClient, this.Redis);
                var __columns = (columnresp.Columns.Count > 1) ? columnresp.Columns[0].Concat(columnresp.Columns[1]) : columnresp.Columns[0];
                var __keyColumns = columnresp.Columns[0];
                var __linesColumns = columnresp.Columns[1];
                var Columns = new DVColumnCollection();
                var colindx = -1;
                var dvindex = -1;
                foreach (EbDataColumn column in __keyColumns)
                {
                    colindx++; dvindex++;
                    returnobj.KeyColumns.Add(GetDVBaseColumn(column, true, colindx, dvindex));
                    returnobj.Columns.Add(GetDVBaseColumn(column, true, colindx, dvindex));
                }
                colindx = -1;
                foreach (EbDataColumn column in __linesColumns)
                {
                    colindx++; dvindex++;
                    returnobj.LinesColumns.Add(GetDVBaseColumn(column, false, colindx, dvindex));
                    returnobj.Columns.Add(GetDVBaseColumn(column, false, colindx, dvindex));
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception (GetdvObject): " + e.StackTrace);
            }
            return returnobj;
        }

        public DVBaseColumn GetDVBaseColumn(EbDataColumn column, bool visiblity, int Colindex, int dvindex)
        {
            DVBaseColumn _col = null;
            if (column.Type == EbDbTypes.String)
                _col = new DVStringColumn { Data = dvindex, OIndex = Colindex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = visiblity };
            else if (column.Type == EbDbTypes.Int16 || column.Type == EbDbTypes.Int32 || column.Type == EbDbTypes.Int64 || column.Type == EbDbTypes.Double || column.Type == EbDbTypes.Decimal || column.Type == EbDbTypes.VarNumeric)
                _col = new DVNumericColumn { Data = dvindex, OIndex = Colindex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = visiblity };
            else if (column.Type == EbDbTypes.Boolean)
                _col = new DVBooleanColumn { Data = dvindex, OIndex = Colindex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = visiblity };
            else if (column.Type == EbDbTypes.DateTime || column.Type == EbDbTypes.Date || column.Type == EbDbTypes.Time)
                _col = new DVDateTimeColumn { Data = dvindex, OIndex = Colindex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = visiblity };
            _col.EbSid = column.Type.ToString() + dvindex;
            _col.RenderType = _col.Type;
            return _col;
        }
    }
}
