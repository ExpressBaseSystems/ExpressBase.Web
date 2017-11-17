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

        [HttpGet]
        public IActionResult BotList()
        {
            int _sol_id = 100;
            var bot = new BotListRequest();
            bot.SolutionId = _sol_id;
            List<ChatBot> Bots = ServiceClient.Get<BotListResponse>(bot).Data;

            string _html = string.Empty;

            string BotTile = @"<div class='botlist-box'>
            <div class='Bot-tile'>
                <h4>@Name@</h4>
                <div class='bottile-icon'></div>
                <div class='sitename'>@WebsiteURL@</div>
                <div class='pull-left'>
                    <div class='created-lbl'>@CreatedBy@</div>
                    <div class='created-date'>@CreatedAt@</div>
                </div>
                <div class='pull-right'>

                    <div class='modified-lbl'>@LastModifiedBy@</div>
                    <div class='modified-date'>@LastModifiedAt@</div>
                </div>
            </div>
        </div>";

            foreach (ChatBot chatbot in Bots)
            {
                _html += BotTile.Replace("@botname@", chatbot.Name)
                    .Replace("@Name@", chatbot.WebsiteURL)
                    .Replace("@WebsiteURL@", chatbot.BotId)
                    .Replace("@LastModifiedBy@", chatbot.LastModifiedBy)
                    .Replace("@LastModifiedAt@", chatbot.LastModifiedAt.ToString())
                    .Replace("@CreatedBy@", chatbot.CreatedBy)
                    .Replace("@CreatedAt@", chatbot.CreatedAt.ToString());
            }
            ViewBag.tileshtml = _html;
            return View();
        }
    }
}
