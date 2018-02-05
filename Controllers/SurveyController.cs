using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class SurveyController : EbBaseIntController
    {
        public SurveyController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }
        // GET: /<controller>/
        public IActionResult CreateSurvey()
        {
            return View();
        }
    }
}
