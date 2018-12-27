using ExpressBase.Common;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Common.Objects;
using ExpressBase.Common.Structures;
using ExpressBase.Data;
using ExpressBase.Objects;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security;
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

        public async Task<IViewComponentResult> InvokeAsync(string dvobjt, string dvRefId, bool flag, User _user, Eb_Solution _sol, string contextId, bool CustomColumn, string wc, string curloc, string submitId)
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
                EbDataVisualization TableVisObj = null;
                if (flag)
                    TableVisObj = getDVObject(dvobj, CustomColumn);
                else
                    TableVisObj = dvobj;
                if (TableVisObj.EbDataSource.FilterDialog != null)
                    EbControlContainer.SetContextId(TableVisObj.EbDataSource.FilterDialog, contextId);
                //if (flag)
                ViewBag.data = TableVisObj;
                //else
                //    ViewBag.data = dvobj;
            }
            ViewBag.dvRefId = dvRefId;
            ViewBag.wc = wc;
            ViewBag.curloc = curloc;
            //ViewBag.forWrap = forWrap;
            return View();
        }

        private EbDataVisualization getDVObject(EbDataVisualization dvobj, bool CustomColumn)
        {
            //DataSourceColumnsResponse columnresp = null;
            try
            {
                DataSourceColumnsResponse columnresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", dvobj.DataSourceRefId));
                if (columnresp == null || columnresp.Columns.Count == 0)
                {
                    Console.WriteLine("Column Object in Redis is null or count 0");
                    columnresp = this.ServiceClient.Get<DataSourceColumnsResponse>(new TableColumnsRequest { RefId = dvobj.DataSourceRefId, SolnId = ViewBag.cid, Params = (dvobj.EbDataSource.FilterDialog != null) ? dvobj.EbDataSource.FilterDialog.GetDefaultParams() : null });
                    if (columnresp == null || columnresp.Columns.Count == 0)
                    {
                        Console.WriteLine("Column Object from SS is null or count 0");
                        throw new Exception("Object Not found(Redis + SS)");
                    }
                }


                var __columns = (columnresp.Columns.Count > 1) ? columnresp.Columns[1] : columnresp.Columns[0];
                int _pos = __columns.Count + 100;

                var Columns = new DVColumnCollection();
                dvobj.IsPaged = columnresp.IsPaged.ToString();

                var indx = -1;
                foreach (EbDataColumn column in __columns)
                {
                    DVBaseColumn _col = null;

                    if (column.Type == EbDbTypes.String && column.ColumnName == "socialid")
                        _col = new DVStringColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos, RenderAs = StringRenderType.Image };
                    else if (column.Type == EbDbTypes.String && column.ColumnName == "latlong")
                        _col = new DVStringColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos, RenderAs = StringRenderType.Marker };
                    else if (column.Type == EbDbTypes.String)
                        _col = new DVStringColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos };
                    else if (column.Type == EbDbTypes.Int16 || column.Type == EbDbTypes.Int32 || column.Type == EbDbTypes.Int64 || column.Type == EbDbTypes.Double || column.Type == EbDbTypes.Decimal || column.Type == EbDbTypes.VarNumeric)
                        _col = new DVNumericColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos };
                    else if (column.Type == EbDbTypes.Boolean)
                        _col = new DVBooleanColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos };
                    else if (column.Type == EbDbTypes.DateTime || column.Type == EbDbTypes.Date || column.Type == EbDbTypes.Time)
                        _col = new DVDateTimeColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, sType = "date-uk", Type = column.Type, bVisible = true, sWidth = "100px", Pos = _pos };
                    _col.EbSid = column.Type.ToString() + column.ColumnIndex;
                    Columns.Add(_col);
                    indx = column.ColumnIndex;
                }
                //dvobj.Columns.Add(new DVNumericColumn { Data = ++indx, Name = "RATE_GRAFT", sTitle = "RATE+GRAFT", Type = EbDbTypes.Int32, bVisible = true, sWidth = "100px", ClassName = "tdheight dt-body-right",Formula = "T0.RATE+T0.GRAFT" });
                if (dvobj.Columns == null || dvobj.Columns.Count == 0)
                    dvobj.Columns = Columns;
                else
                    dvobj.Columns = compareDVColumns(dvobj.Columns, Columns, CustomColumn);
                dvobj.DSColumns = dvobj.Columns;
            }
            catch(Exception e)
            {
                Console.WriteLine("Exception (GetdvObject): " + e.StackTrace);
            }
            return dvobj;
        }

        private DVColumnCollection compareDVColumns(DVColumnCollection OldColumns, DVColumnCollection CurrentColumns, bool CustomColumn)
        {
            int _colindex = -1;
            var NewColumns = new DVColumnCollection();
            foreach (DVBaseColumn oldcol in OldColumns)
            {
                var tempCol = CurrentColumns.Pop(oldcol.Name, oldcol.Type);
                if (tempCol != null)
                {
                    oldcol.Data = tempCol.Data;
                    if (oldcol.EbSid == null || oldcol.EbSid == "")
                        oldcol.EbSid = oldcol.Type.ToString() + oldcol.Data;
                    NewColumns.Add(oldcol);
                }
            }

            foreach (DVBaseColumn curcol in CurrentColumns)
            {
                NewColumns.Add(curcol);
                _colindex = curcol.Data;
            }
            if (CustomColumn)
            {
                _colindex = NewColumns.Count;
                foreach (DVBaseColumn oldcol in OldColumns)
                {
                    if (oldcol.IsCustomColumn)
                    {
                        oldcol.Data = _colindex;
                        NewColumns.Add(oldcol);
                        _colindex++;
                    }
                }
            }

            return NewColumns;
        }
    }


}
