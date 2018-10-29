using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Common.Data;
using ExpressBase.Common.Structures;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Scheduler.Jobs;
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
            var ds = this.ServiceClient.Get(new CreateApplicationRequest { Description = desc, appid = appid });
        }

        public void schedule()
        {
            int _objId = 2236;
            int val = 1332423;
            string _solnId = "al_arz_sales";
            List<Param> _param = new List<Param> { new Param { Name = "ids", Type = ((int)EbDbTypes.Int32).ToString(), Value = val.ToString() } };

            EbTask _emailtask = new EbTask
            {
                Expression = "0 * * * * ?",
                JobType = JobTypes.EmailTask,
                Params = _param,
                ObjId = _objId,
                SolnId = _solnId
            };

            EbTask _smstask = new EbTask
            {
                Expression = "0/20 * * * * ?",
                JobType = JobTypes.SmsTask,
                Params = _param,
                ObjId = _objId,
                SolnId = _solnId
            };
            EbTask _testtask = new EbTask
            {
                Expression = "0/5 * * * * ?",
                JobType = JobTypes.MyJob
            };
            var ds = this.ServiceClient.Post(new SchedulerMQRequest { Task = _smstask });
        }
    }
}
