using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Auth;

namespace ExpressBase.Web.Controllers
{
    public class ServerEventsController : EbBaseIntController
    {
        public ServerEventsController(IServiceClient _client) : base(_client) { }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Notificaions()
        {
            var client = new ServerEventsClient("http://localhost:8000/event-stream", channels: "notifications");

            return View();
        }
    }
}