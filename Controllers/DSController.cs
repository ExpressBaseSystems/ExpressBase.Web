using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Common.Data;
using ExpressBase.Common.Structures;
using ExpressBase.Objects;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class DSController : EbBaseIntCommonController
    {
        public DSController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        public DVColumnCollection GetColumns(ColumnColletion __columns)
        {
            //DataSourceColumnsResponse columnresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", DataSourceRefId));
            //if (columnresp == null || columnresp.Columns.Count == 0)
            //    columnresp = this.ServiceClient.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { RefId = DataSourceRefId, SolnId = ViewBag.cid });

            //var __columns = (columnresp.Columns.Count > 1) ? columnresp.Columns[1] : columnresp.Columns[0];

            var Columns = new DVColumnCollection();
            foreach (EbDataColumn column in __columns)
            {
                DVBaseColumn _col = null;
                if (column.Type == EbDbTypes.String)
                    _col = new DVStringColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", ClassName = "tdheight" };
                else if (column.Type == EbDbTypes.Int16 || column.Type == EbDbTypes.Int32 || column.Type == EbDbTypes.Int64 || column.Type == EbDbTypes.Double || column.Type == EbDbTypes.Decimal || column.Type == EbDbTypes.VarNumeric)
                    _col = new DVNumericColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", ClassName = "tdheight dt-body-right" };
                else if (column.Type == EbDbTypes.Boolean)
                    _col = new DVBooleanColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", ClassName = "tdheight" };
                else if (column.Type == EbDbTypes.DateTime || column.Type == EbDbTypes.Date || column.Type == EbDbTypes.Time)
                {
                    _col = new DVDateTimeColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", ClassName = "tdheight" };
                    if (column.Type == EbDbTypes.Time)
                        (_col as DVDateTimeColumn).Format = DateFormat.Time;
                }
                else if (column.Type == EbDbTypes.Bytea)
                    _col = new DVStringColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", ClassName = "tdheight" };
                _col.RenderType = _col.Type;
                Columns.Add(_col);
            }
            return Columns;
        }
        
        public List<DVColumnCollection> GetDVColumnCollection(List<ColumnColletion> _ColumnColl)
        {
            List<DVColumnCollection> dvColumnCollection = new List<DVColumnCollection>();
            foreach (ColumnColletion _columns in _ColumnColl)
                dvColumnCollection.Add(GetColumns(_columns));
            return dvColumnCollection;
        }

        public string GetColumnsFromApi(string url, List<ApiRequestHeader> headers, ApiMethods method)
        {
            ReturnColumns returnobj = new ReturnColumns();
            ApiConversionResponse resultlist1 = null;
            ApiConversionRequest request = new ApiConversionRequest();
            request.Url = url;
            request.Headers = headers;
            //request.Parameters = parameters;
            request.Method = method;
            try
            {
                this.ServiceClient.Timeout = new TimeSpan(0, 5, 0);
                resultlist1 = this.ServiceClient.Post<ApiConversionResponse>(request);
                returnobj.Columns = GetColumns(resultlist1.dataset.Tables[0].Columns);
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.ToString());
                if (resultlist1 != null)
                {
                    returnobj.Message = resultlist1.Message;
                }
                else
                    returnobj.Message = e.ToString();
            }
            //return resultlist1;
            return EbSerializers.Json_Serialize(returnobj.Columns);
        }

        public string GetColumns4Control(string DataSourceRefId)
        {
            DataSourceColumnsResponse columnresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", DataSourceRefId));
            if (columnresp == null || columnresp.Columns.Count == 0)
                columnresp = this.ServiceClient.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { RefId = DataSourceRefId, SolnId = ViewBag.cid });

            var __columns = (columnresp.Columns.Count > 1) ? columnresp.Columns[1] : columnresp.Columns[0];

            var Columns = GetColumns(__columns);

            return EbSerializers.Json_Serialize(Columns);
        }

        public DashboardControlReturn GetData4DashboardControl(string DataSourceRefId, List<Param> param)
        {
            DashboardControlReturn obj = new DashboardControlReturn();
            try
            {
                DataSourceDataSetResponse columnresp = this.ServiceClient.Post<DataSourceDataSetResponse>(new DataSourceDataSetRequest { RefId = DataSourceRefId, Params = param });
                var __columns = (columnresp.Columns.Count > 1) ? columnresp.Columns[1] : columnresp.Columns[0];

                 var Columns = GetColumns(__columns);
                if (columnresp != null && columnresp.DataSet != null && columnresp.DataSet.Tables[0] !=null && columnresp.DataSet.Tables[0].Rows[0] !=null &&  columnresp.DataSet.Tables[0].Rows[0].Count > 0 )
                {
                    var _row = columnresp.DataSet.Tables[0].Rows[0];
                    obj = new DashboardControlReturn { Columns = EbSerializers.Json_Serialize(Columns), Row = _row };
                }
                else
                {
                    EbDataRow row = new EbDataRow();
                    foreach (var abc in __columns)
                    {
                        if (abc.Type == EbDbTypes.Int32 || abc.Type == EbDbTypes.Int64 || abc.Type == EbDbTypes.Int16 || abc.Type == EbDbTypes.Int)
                            row.Add(0); 
                        else if (abc.Type == EbDbTypes.UInt16 || abc.Type == EbDbTypes.UInt32 || abc.Type == EbDbTypes.UInt64)
                            row.Add(0);
                        else if (abc.Type == EbDbTypes.Decimal || abc.Type == EbDbTypes.Double )
                            row.Add(0.0);
                        else if (abc.Type == EbDbTypes.Boolean || abc.Type == EbDbTypes.BooleanOriginal || abc.Type == EbDbTypes.Byte)
                            row.Add(false);
                        else
                            row.Add("");
                    }
                    obj = new DashboardControlReturn { Columns = EbSerializers.Json_Serialize(Columns), Row = row };
                }
                
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message, e.StackTrace);
            }

            return obj;
        }
    }

    public class DashboardControlReturn
    {
        public string Columns;
        public EbDataRow Row;
    }
}
