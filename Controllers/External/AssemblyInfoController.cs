using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers.External
{
    public class AssemblyInfoController : EbBaseExtController
    {
        public AssemblyInfoController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }
        public IActionResult Index()
        {
            return View();
        }

        [Microsoft.AspNetCore.Mvc.Route("Assemblyversions")]
        public IActionResult GetAssmebly()
        {
            List<string> versions = new List<string> {
                    Redis.Get<string>("WebAssembly"),
                    Redis.Get<string>("ServiceStackAssembly"),
                    Redis.Get<string>("SchedulerAssembly"),
                    Redis.Get<string>("FileServerAssembly"),
                    Redis.Get<string>("MQAssembly"),
                    Redis.Get<string>("ServerEventsAssembly")
                };
            ViewBag.Versions = versions;
            return View();
        }
    }
}
