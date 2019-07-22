using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Stripe;
using Microsoft.AspNetCore.Authorization;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class StripeWebhookController : EbBaseExtController
    {
        public StripeWebhookController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        [HttpPost]
        public IActionResult Index()
        {
            Stripewebhook();
            return View();
        }

        [AllowAnonymous]
        [HttpPost]
        [Microsoft.AspNetCore.Mvc.Route("Stripewebhook")]
        public void Stripewebhook()
        {
            string json = new StreamReader(HttpContext.Request.Body).ReadToEnd();
            Console.WriteLine("Web Hook Json in web:  " + json);
            this.ServiceClient.Post<StripewebhookResponse>(new StripewebhookRequest
            {
                Json = json
            });
        }
    }
}
