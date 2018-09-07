using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Auth;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Twilio.Rest.Api.V2010.Account;

namespace ExpressBase.Web.Controllers
{
    public class SMSController : EbBaseExtController
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
            string[] subdomain = this.HttpContext.Request.Host.Host.Split('.');
            sMSSentRequest.SolnId = subdomain[0];

            var client = new JsonServiceClient(this.ServiceClient.BaseUri)
            {
                Credentials = new NetworkCredential("GATblcTqWNFI9ljZRWX-aUtidVYjJwoj", "")
            };
            client.Post(sMSSentRequest);
            return View();
        }

        [HttpPost("smscallback/{apikey}")]
        public void CallBack(string apikey)
        {
            var req = this.HttpContext.Request.Form;
            var smsSid = Request.Form["SmsSid"];
            var messageStatus = Request.Form["MessageStatus"];
            string stsbody = req.ToJson();
            SMSSentRequest sMSSentRequest = new SMSSentRequest();
            sMSSentRequest.To = "+919961596200";
            sMSSentRequest.Body = "SMS Id: "+smsSid.ToString()+"/nMessageStatus:" + messageStatus.ToString() +"/nFull Message:" + stsbody.ToString();
            string[] subdomain = this.HttpContext.Request.Host.Host.Split('.');
            sMSSentRequest.SolnId = subdomain[0];

            var client = new JsonServiceClient(this.ServiceClient.BaseUri)
            {
                Credentials = new NetworkCredential(apikey, "")
            };
            client.Post(sMSSentRequest);
        }
    }
}
