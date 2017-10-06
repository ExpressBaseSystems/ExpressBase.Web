using ExpressBase.Common.Connections;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.Controllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using System;


// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web2.Controllers
{

    public class SampleController : EbBaseNewController
    {
        public SampleController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult MongoDBAsync()
        {
            return View();
        }
        
        public IActionResult dragNdrop()
        {
            return View();
        }

        public IActionResult Eb_formBuilder()
        {
            return View();
        }

        public IActionResult GetData()
        {
            return View();
        }

        public string sample()
        {

            return "{'name':'haii'}";
        }

        public IActionResult Table()
        {
            return View();
        }

        public IActionResult Masterhome()
        {
            return View();
        }

        //[ValidateAntiForgeryToken]
        public IActionResult RForm(int id)
        {
            ViewBag.FormId = id;
            return View();
        }
    }
}
