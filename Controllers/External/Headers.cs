using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Controllers.External
{
    public class Headers : Controller
    {
        [Route("/headers")]
        public IActionResult Index()
        {
            string headers = "<div>" + HttpContext.Connection.RemoteIpAddress + "</div>";



            foreach (var x in Request.Headers)
            {
                headers += "<div>";
                if (x.Key != "Cookie")
                    headers += x.Key + "  :  " + x.Value;
                headers += "</div>";
            }

            ViewBag.headers = headers;

            return View();
        }
    }
}
