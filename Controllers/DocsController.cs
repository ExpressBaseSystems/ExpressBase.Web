using ExpressBase.Common;
using ExpressBase.Common.EbServiceStack.ReqNRes;
using ExpressBase.Common.ServiceClients;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Web.BaseControllers;

namespace ExpressBase.Web.Controllers
{
    public class DocsController : EbBaseIntCommonController
    {
        public DocsController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        public IActionResult ImageUpHome()
        {
            return View();
        }
    }
}
