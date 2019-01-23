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
using System.Runtime.Serialization;

namespace ExpressBase.Web.Controllers
{
    public class ApiController : EbBaseIntApiController
    {
        public ApiController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        [HttpGet]
        [HttpPost]
        [Microsoft.AspNetCore.Mvc.Route("/api/{_name}/{_version}")]
        public ApiResponse Api(string _name, string _version)
        {
            ApiResponse resp = null;
            Dictionary<string, object> d = null;
            if (this.HttpContext.Request.Method == "POST")
                d = this.F2D(this.HttpContext.Request.Form as FormCollection);
            if (ViewBag.IsValid)
            {
                resp = this.ServiceClient.Get(new ApiRequest
                {
                    Name = _name,
                    Version = _version,
                    Data = d
                });
            }
            else
                resp = new ApiResponse { Message = ViewBag.Message };

            return resp;
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
