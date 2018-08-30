using ExpressBase.Common.ServiceClients;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Web.Controllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;


// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web2.Controllers
{

    public class SampleController : EbBaseIntCommonController
    {
        public SampleController(IServiceClient _ssclient, IRedisClient _redis, IEbMqClient _mqc) : base(_ssclient, _redis, _mqc) { }

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

        [HttpGet]
        public IActionResult FileUpload()
        {
            return View();
        }

        [HttpGet]
        public IActionResult ImageUpload()
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
