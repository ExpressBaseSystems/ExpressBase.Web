using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class BotiController : EbBaseNewController
    {
        public BotiController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        [HttpGet]
        public IActionResult addBot()
        {
            return View();
        }

        [HttpGet]
        public IActionResult BotList()
        {
            return View();
        }

        [HttpPost]
        public IActionResult addBot(string _name, string _url, string _sol_id, string _wel_msg)
        {
            var bot = new CreateBotRequest();
            bot.BotName = _name;
            bot.WebURL = _url;
            bot.SolutionId = _sol_id;
            bot.WelcomeMsg = _wel_msg;

            var res = ServiceClient.Post<CreateBotResponse>(bot);
            ViewBag.botname = _name;
            ViewBag.url = _url;
            ViewBag.welcomemsg = _wel_msg;
            ViewBag.chatid = res.BotId;
            return View();
        }
    }
}
