using System;
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
using System.Reflection;
using System.Data;
using ExpressBase.Web.BaseControllers;
using Newtonsoft.Json;
using ExpressBase.Common.Data;
using ExpressBase.Common.LocationNSolution;

namespace ExpressBase.Web.Controllers
{
    public class RBController : EbBaseIntCommonController
    {
        public RBController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        [HttpPost]
        public DataSourceColumnsResponse GetColumns(string refID)
        {
            DataSourceColumnsResponse DsColumns = null;
            try
            {
                EbDataReader ds = this.Redis.Get<EbDataReader>(refID);
                List<Param> FilterParams = null;
                if (ds == null)
                {
                    EbObjectParticularVersionResponse dsresult = this.ServiceClient.Get(new EbObjectParticularVersionRequest { RefId = refID });
                    ds = EbSerializers.Json_Deserialize<EbDataReader>(dsresult.Data[0].Json);
                    this.Redis.Set<EbDataReader>(refID, ds);
                }

                if (!string.IsNullOrEmpty(ds.FilterDialogRefId))
                {
                    ds.AfterRedisGet(this.Redis, this.ServiceClient);
                    FilterParams = (ds.FilterDialog != null) ? ds.FilterDialog.GetDefaultParams() : null;
                }
                else
                {
                    FilterParams = ds.GetParams(this.Redis);
                }

                DsColumns = this.ServiceClient.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest
                {
                    RefId = refID,
                    Params = FilterParams
                });
                Redis.Set<DataSourceColumnsResponse>(string.Format("{0}_columns", refID), DsColumns);
                DsColumns.ParamsList = FilterParams;

                foreach (var columnCollection in DsColumns.Columns)
                {
                    columnCollection.Sort(CompareEbDataColumn);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            return DsColumns;
        }

        private int CompareEbDataColumn(object a, object b)
        {
            return (a as EbDataColumn).ColumnName.CompareTo((b as EbDataColumn).ColumnName);
        }

        public string ValidateCalcExpression(string refid, string expression)
        {
            EbDataReader ds = this.Redis.Get<EbDataReader>(refid);
            if (ds.FilterDialogRefId != string.Empty)
                ds.AfterRedisGet(this.Redis, this.ServiceClient);
            List<Param> FilterControls = (ds.FilterDialog != null) ? ds.FilterDialog.GetDefaultParams() : null;
            ValidateCalcExpressionResponse res = this.ServiceClient.Get<ValidateCalcExpressionResponse>(new ValidateCalcExpressionRequest { DataSourceRefId = refid, ValueExpression = expression, Parameters = FilterControls });
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
