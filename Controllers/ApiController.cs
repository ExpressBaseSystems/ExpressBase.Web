using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Common;
using ExpressBase.Common.Connections;
using ExpressBase.Common.Data;
using ExpressBase.Common.Messaging;
using ExpressBase.Common.Messaging.ExpertTexting;
using ExpressBase.Common.Messaging.Twilio;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Objects;
using System.Collections.Specialized;
using Newtonsoft.Json.Linq;
using Microsoft.AspNetCore.Http;
using ExpressBase.Web.Models;

namespace ExpressBase.Web.Controllers
{
    public class ApiController : EbBaseIntCommonController
    {
        public ApiController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        [HttpGet]
        public string GetReq_respJson(string refid)
        {
            var obj = this.ServiceClient.Get(new EbObjectParticularVersionRequest { RefId = refid });
            EbDataSourceMain ds = EbSerializers.Json_Deserialize(obj.Data[0].Json);
            if (ds.InputParams == null || ds.InputParams.Count <= 0)
            {
                CEController cedit = new CEController(this.ServiceClient, this.Redis);
                return cedit.GetSqlParams(ds.Sql, obj.Data[0].EbObjectType);
            }
            else
            {
                return JsonConvert.SerializeObject(ds.InputParams);
            }
        }

        [HttpGet]
        [HttpPost]
        [Microsoft.AspNetCore.Mvc.Route("/api/{_name}/{_version}")]
        public object Api(string _name,string _version)
        {
            Dictionary<string, object> d = null;
            if (this.HttpContext.Request.Method == "POST")
                d = this.F2D(this.HttpContext.Request.Form as FormCollection);

            ApiResponse resp = this.ServiceClient.Get(new ApiRequest
            {
                Name = _name,
                Version = _version,
                Data = d
            });

            return JsonConvert.DeserializeObject(resp.Result);
        }

        private Dictionary<string, object> F2D(FormCollection collection)
        {
            Dictionary<string, object> dict = new Dictionary<string, object>();
            foreach (var pair in collection)
            {
                dict.Add(pair.Key, pair.Value);
            }
            return dict;
        }
    }
}
