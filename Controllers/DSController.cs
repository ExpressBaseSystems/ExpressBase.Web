using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Common.Structures;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class DSController : EbBaseIntController
    {
        public DSController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        public string GetColumns(string DataSourceRefId)
        {
            DataSourceColumnsResponse columnresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", DataSourceRefId));
            if (columnresp == null || columnresp.Columns.Count == 0)
                columnresp = this.ServiceClient.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { RefId = DataSourceRefId, TenantAccountId = ViewBag.cid });
            
            var __columns = (columnresp.Columns.Count > 1) ? columnresp.Columns[1] : columnresp.Columns[0];

            //var Columns = new ColumnColletion();
            //foreach (EbDataColumn column in __columns)
            //{
            //    //DVBaseColumn _col = null;

            //    //if (column.Type == EbDbTypes.String && column.ColumnName == "socialid")
            //    //    _col = new DVStringColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px",ClassName = "tdheight", RenderAs = StringRenderType.Image };
            //    //else if (column.Type == EbDbTypes.String && column.ColumnName == "latlong")
            //    //    _col = new DVStringColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px",ClassName = "tdheight", RenderAs = StringRenderType.Marker };
            //    //else if (column.Type == EbDbTypes.String)
            //    //    _col = new DVStringColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", ClassName = "tdheight" };
            //    //else if (column.Type == EbDbTypes.Int16 || column.Type == EbDbTypes.Int32 || column.Type == EbDbTypes.Int64 || column.Type == EbDbTypes.Double || column.Type == EbDbTypes.Decimal || column.Type == EbDbTypes.VarNumeric)
            //    //    _col = new DVNumericColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", ClassName = "tdheight dt-body-right" };
            //    //else if (column.Type == EbDbTypes.Boolean)
            //    //    _col = new DVBooleanColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px",ClassName = "tdheight" };
            //    //else if (column.Type == EbDbTypes.DateTime || column.Type == EbDbTypes.Date || column.Type == EbDbTypes.Time)
            //    //    _col = new DVDateTimeColumn { Data = column.ColumnIndex, Name = column.ColumnName, sTitle = column.ColumnName, Type = column.Type, bVisible = true, sWidth = "100px", ClassName = "tdheight" };

            //    Columns.Add(_col);
            //}
            return EbSerializers.Json_Serialize(__columns);
        }
    }
}
