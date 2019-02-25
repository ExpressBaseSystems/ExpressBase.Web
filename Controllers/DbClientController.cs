using System;
using Npgsql;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using System.Collections;
using Newtonsoft.Json;
using ExpressBase.Web.BaseControllers;
using ServiceStack.Redis;
using ServiceStack;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Common;
using ExpressBase.Common.Structures;

namespace ExpressBase.Web.Controllers
{
    public class DbClientController : EbBaseIntCommonController
    {
        public DbClientController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }
        
        public IActionResult DbClient()
        {
            GetDbTablesResponse res = this.ServiceClient.Get(new GetDbTablesRequest { });
            ViewBag.Tables = res.Tables;
            return View();
        }

        public DbClientQueryResponse SqlQuery(string Query)
        {
            DbClientQueryResponse ress = new DbClientQueryResponse();
            ress = this.ServiceClient.Post<DbClientQueryResponse>(new DbClientQueryRequest {Query = Query });
            ress.RowCollection = new List<RowColletion>();
            ress.ColumnCollection = new List<DVColumnCollection>();
            foreach (EbDataTable _table in ress.Dataset.Tables)
            {
                ress.ColumnCollection.Add(ConvertColumns(_table.Columns));
                ress.RowCollection.Add(_table.Rows);
            }
            return ress;
        }

        public DVColumnCollection ConvertColumns(ColumnColletion __columns)
        {
            DVColumnCollection Columns = new DVColumnCollection();
            foreach (EbDataColumn column in __columns)
            {
                DVBaseColumn _col = null;
                 if (column.Type == EbDbTypes.String)
                    _col = new DVStringColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px"};
                else if (column.Type == EbDbTypes.Int16 || column.Type == EbDbTypes.Int32 || column.Type == EbDbTypes.Int64 || column.Type == EbDbTypes.Double || column.Type == EbDbTypes.Decimal || column.Type == EbDbTypes.VarNumeric)
                    _col = new DVNumericColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px" };
                else if (column.Type == EbDbTypes.Boolean)
                    _col = new DVBooleanColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px" };
                else if (column.Type == EbDbTypes.DateTime || column.Type == EbDbTypes.Date || column.Type == EbDbTypes.Time)
                    _col = new DVDateTimeColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, sType = "date-uk", Type = column.Type, bVisible = true, sWidth = "100px"};
                _col.EbSid = column.Type.ToString() + column.ColumnIndex;
                Columns.Add(_col);
            }
            return Columns;
        }        
    }
}
