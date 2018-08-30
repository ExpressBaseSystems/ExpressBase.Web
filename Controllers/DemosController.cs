using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;

namespace ExpressBase.Web.Controllers
{
    public class DemosController : EbBaseExtController
    {
        public DemosController(IServiceClient _client, IRedisClient _redis)
            : base(_client, _redis) { }

        public IActionResult Demos()
        {
            return View();
        }

        [HttpGet("signuptest")]
        public IActionResult SignUpTest()
        {
            return View();
        }
    }
}
