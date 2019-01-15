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
            return ds.GetInputParams();
        }
    }
}
