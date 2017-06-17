using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Web.Filters;
using ExpressBase.Web2;
using ServiceStack;
using Microsoft.Extensions.Options;


// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class ExtController : EbBaseController
    {
        public ExtController(IOptionsSnapshot<EbSetupConfig> ss_settings) : base(ss_settings) { }

        // GET: /<controller>/
        public IActionResult Index()
        {
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }

        public IActionResult AboutUs()
        {
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }

        public IActionResult Platform()
        {
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }

        public IActionResult Pricing()
        {
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }
    }
}
