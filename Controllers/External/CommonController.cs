using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class CommonController : EbBaseExtController
    {
        public CommonController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }
        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }
        
        //[HttpPost]
        //public string UniqueCheck(string text)
        //{
        //    Dictionary<string, object> Dict = new Dictionary<string, object>();
        //    Dict["email"] = text;
        //    var fr = this.ServiceClient.Get<bool>(new UniqueRequest { Colvalues = Dict });
        //    return fr.ToString();
        //}
        public IActionResult Pricing()
        {
            return View();
        }

        [HttpGet("AboutUs")]
        public IActionResult AboutUs()
        {
            return View();
        }

        public IActionResult Platform()
        {
            return View();
        }
        public IActionResult EbFAQS()
        {
            return View();
        }

        [HttpGet("SignIn")]
        public IActionResult SignIn()
        {
            return View();
        }

    }
}
