using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Common;
using ExpressBase.Common.SqlProfiler;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Common.Structures;

namespace ExpressBase.Web.Components
{
    public class SqlProfilerViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public SqlProfilerViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }
        public async Task<IViewComponentResult> InvokeAsync(string refid)
        {
            var res = GetTables(refid);
            //ViewBag.Log = res.Logs;
            ViewBag.Columns = ConvertColumns(res.ColumnCollection);
            ViewBag.Rows = res.data;
            var result = ServiceClient.Get<GetProfilersResponse>(new GetProfilersRequest { RefId = refid });
            ViewBag.Profiler = result.Profiler;//EbSerializers.Json_Serialize(result.Profiler);
            ViewBag.refid = refid;
            return View();
        }
        public ProfilerQueryResponse GetTables(string refid)
        {
            ProfilerQueryResponse ress = new ProfilerQueryResponse();
            ress = ServiceClient.Get<ProfilerQueryResponse>(new ProfilerQueryColumnRequest { RefId = refid });
            return ress;
        }

        public DVColumnCollection ConvertColumns(ColumnColletion __columns)
        {
            DVColumnCollection Columns = new DVColumnCollection();
            foreach (EbDataColumn column in __columns)
            {
                DVBaseColumn _col = null;
                if (column.Type == EbDbTypes.String)
                    _col = new DVStringColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px" };
                else if (column.Type == EbDbTypes.Int16 || column.Type == EbDbTypes.Int32 || column.Type == EbDbTypes.Int64 || column.Type == EbDbTypes.Double || column.Type == EbDbTypes.Decimal || column.Type == EbDbTypes.VarNumeric)
                    _col = new DVNumericColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px" };
                else if (column.Type == EbDbTypes.Boolean)
                    _col = new DVBooleanColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px" };
                else if (column.Type == EbDbTypes.DateTime || column.Type == EbDbTypes.Date || column.Type == EbDbTypes.Time)
                    _col = new DVDateTimeColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, sType = "date-uk", Type = column.Type, bVisible = true, sWidth = "100px" };
                _col.EbSid = column.Type.ToString() + column.ColumnIndex;
                Columns.Add(_col);
            }
            return Columns;
        }
    }
}
