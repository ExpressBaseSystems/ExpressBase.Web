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
    public class BotiController : EbBaseIntController
    {
        public BotiController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        [HttpGet]
        public IActionResult addBot()
        {
            return View();
        }

        [HttpGet]
        public IActionResult BotDashBoard()
        {
            return View();
        }

        [HttpPost]
        public IActionResult BotDashBoard(string _name, string _fullname, string _url, string _sol_id, string _wel_msg, string chatid, string botid)
        {
            var bot = new CreateBotRequest();
            bot.BotName = _name;
            bot.FullName = _fullname;
            bot.WebURL = _url;
            bot.SolutionId = _sol_id;
            bot.WelcomeMsg = _wel_msg;
            bot.BotId = botid;
            bot.ChatId = chatid;

            var res = ServiceClient.Post<CreateBotResponse>(bot);
            ViewBag.botname = _name;
            ViewBag.url = _url;
            ViewBag.welcomemsg = _wel_msg;
            ViewBag.botid = botid;
            ViewBag.fullname = _fullname;
            if (chatid != null)
            {
                ViewBag.chatid = chatid;
            }
            else
                ViewBag.chatid = res.BotId;
            return View();
        }

        [HttpPost]
        public IActionResult addBot(string _name, string _fullname, string _url, string _sol_id, string _wel_msg, string chatid, string botid)
        {
            var bot = new CreateBotRequest();
            bot.BotName = _name;
            bot.FullName = _fullname;
            bot.WebURL = _url;
            bot.SolutionId = _sol_id;
            bot.WelcomeMsg = _wel_msg;
            bot.BotId = botid;
            bot.ChatId = chatid;

            var res = ServiceClient.Post<CreateBotResponse>(bot);
            ViewBag.botname = _name;
            ViewBag.url = _url;
            ViewBag.welcomemsg = _wel_msg;
            ViewBag.botid = botid;
            ViewBag.fullname = _fullname;
            if (chatid != null)
            {
                ViewBag.chatid = chatid;
            }
            else
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

            string BotTile = @"
        <form method='post' action='../Boti/addBot'>
             <div class='botlist-box' tabindex='1'>
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
            </div>
            <input type='hidden' value='@Name@' name='_name' />
            <input type='hidden' value='@fullname@' name='_fullname' />
            <input type='hidden' value='@WebsiteURL@' name='_url' />
            <input type='hidden' value='@ViewBag.chatid' name='_chat_id' />
            <input type='hidden' value='@welcomeMsg@' name='_wel_msg' />
            <input type='hidden' value='@ViewBag.solid' name='_sol_id' />
            <input type='hidden' value='@chatid@' name='chatid' />
            <input type='hidden' value='@botid@' name='botid' />
         </form>";

            foreach (ChatBot chatbot in Bots)
            {
                _html += BotTile.Replace("@Name@", chatbot.Name)
                    .Replace("@fullname@", chatbot.FullName)
                    .Replace("@WebsiteURL@", chatbot.WebsiteURL)
                    .Replace("@LastModifiedBy@", chatbot.LastModifiedBy)
                    .Replace("@LastModifiedAt@", chatbot.LastModifiedAt.ToString())
                    .Replace("@CreatedBy@", chatbot.CreatedBy)
                    .Replace("@CreatedAt@", chatbot.CreatedAt.ToString())
                    .Replace("@welcomeMsg@", chatbot.WelcomeMsg)
                    .Replace("@chatid@", chatbot.ChatId)
                    .Replace("@botid@", chatbot.BotId)
                    .Replace("@ViewBag.solid", "100");
            }
            ViewBag.tileshtml = _html;
            return View();
        }
    }
}
