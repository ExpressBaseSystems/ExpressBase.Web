using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ExpressBase.Web.Controllers
{
    public class BotController : Controller
    {
        [HttpGet]
        public IActionResult Bot(string tid)
        {
            ViewBag.tid = tid;
            return View();
        }
    }
}