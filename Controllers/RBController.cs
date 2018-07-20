﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ServiceStack.Redis;
using ExpressBase.Common;
using ExpressBase.Common.Objects;
using ExpressBase.Objects;
using ExpressBase.Objects.ReportRelated;
using System.Reflection;
using System.Data;
using ExpressBase.Web.BaseControllers;
using Newtonsoft.Json;
using ExpressBase.Common.Data;
using ExpressBase.Common.LocationNSolution;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class RBController : EbBaseIntCommonController
    {
        public RBController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        [HttpPost]
        public DataSourceColumnsResponse GetColumns(String refID)
        {
            EbDataSource ds = null;
            List<Param> FilterControls = new List<Param>();
            DataSourceColumnsResponse cresp = new DataSourceColumnsResponse();
            //cresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", refID));
            //if (cresp == null || cresp.Columns.Count == 0)
            {
                ds = this.Redis.Get<EbDataSource>(refID);
                if (ds == null)
                {
                    EbObjectParticularVersionResponse dsresult = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refID });
                    ds = EbSerializers.Json_Deserialize<EbDataSource>(dsresult.Data[0].Json);
                    Redis.Set<EbDataSource>(refID, ds);
                }

                if (ds.FilterDialogRefId != string.Empty)
                    ds.AfterRedisGet(this.Redis, this.ServiceClient);
                FilterControls = (ds.FilterDialog != null) ? ds.FilterDialog.GetDefaultParams() : null;
                cresp = this.ServiceClient.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { RefId = refID, Params = FilterControls });
                Redis.Set<DataSourceColumnsResponse>(string.Format("{0}_columns", refID), cresp);
            }
            if (FilterControls == null)
            {
                ds = this.Redis.Get<EbDataSource>(refID);
                if (ds == null)
                {
                    EbObjectParticularVersionResponse dsresult = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refID });
                    ds = EbSerializers.Json_Deserialize<EbDataSource>(dsresult.Data[0].Json);
                    Redis.Set<EbDataSource>(refID, ds);
                }
                if (ds.FilterDialogRefId != string.Empty)
                    ds.AfterRedisGet(this.Redis, this.ServiceClient);
                FilterControls = (ds.FilterDialog != null) ? ds.FilterDialog.GetDefaultParams() : null;
            }
            cresp.ParamsList = FilterControls;
            foreach (var columnCollection in cresp.Columns)
            {
                columnCollection.Sort(CompareEbDataColumn);
            }

            return cresp;
        }

        private int CompareEbDataColumn(object a, object b)
        {
            return (a as EbDataColumn).ColumnName.CompareTo((b as EbDataColumn).ColumnName);
        }

        public string ValidateCalcExpression(string refid, string expression)
        {
            EbDataSource ds = this.Redis.Get<EbDataSource>(refid);
            if (ds.FilterDialogRefId != string.Empty)
                ds.AfterRedisGet(this.Redis, this.ServiceClient);
            List<Param> FilterControls = (ds.FilterDialog != null) ? ds.FilterDialog.GetDefaultParams() : null;
            ValidateCalcExpressionResponse res = this.ServiceClient.Get<ValidateCalcExpressionResponse>(new ValidateCalcExpressionRequest { DataSourceRefId = refid, ValueExpression = expression ,Parameters = FilterControls });
            return JsonConvert.SerializeObject(res);
        }

        public List<string> GetLocConfigKeys()
        {
            var resp = ServiceClient.Get<LocationInfoResponse>(new LocationInfoRequest { });
            List<EbLocationCustomField> KeysConf = resp.Config;
            List<string> Keys = new List<string>();
            foreach (EbLocationCustomField c in KeysConf)
            {
                Keys.Add(c.Name);
            }
            return Keys;
        }
    }
}
