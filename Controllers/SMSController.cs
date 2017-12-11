using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Twilio.Rest.Api.V2010.Account;

namespace ExpressBase.Web.Controllers
{
    public class SMSController : EbBaseNewController
    {
        public SMSController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis) { }

        [HttpGet]
        public IActionResult SendSMS()
        {
            return View();
        }

        [HttpPost]
        public IActionResult SendSMS(int i)
        {
            var req = this.HttpContext.Request.Form;
            SMSSentRequest sMSSentRequest = new SMSSentRequest();
            sMSSentRequest.To = req["to"];
            sMSSentRequest.From = req["from"];
            sMSSentRequest.Body = req["body"];
            this.ServiceClient.Post(sMSSentRequest);
            return View();
        }
    }
}
