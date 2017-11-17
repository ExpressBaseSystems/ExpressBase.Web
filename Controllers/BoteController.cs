using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;

namespace ExpressBase.Web.Controllers
{
    public class BoteController : EbBaseNewController
    {
        public BoteController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }
        [HttpGet]
        public IActionResult Bot(string tid)
        {
            ViewBag.tid = tid;
            return View();
        }
    }
}