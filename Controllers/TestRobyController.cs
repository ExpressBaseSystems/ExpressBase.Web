using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class TestRobyController : EbBaseIntCommonController
    {
        public TestRobyController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }
        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }
        public IActionResult map()
        {
            return View();
        }

        public IActionResult route()
        {
            return View();
        }
        public IActionResult chart()
        {
            return View();
        }

        public IActionResult Anoy()
        {
            ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
            return View();
        }

        public void test(string desc, int appid)
        {
            Dictionary<string, object> xx = new Dictionary<string, object>();
            xx["AppName"] = "EXPRESSbase bot(Chatbot)";
            xx["DescApp"] = desc;
            var ds = this.ServiceClient.Get(new CreateApplicationRequest { Description = desc, appid = appid});
        }
    }
}
