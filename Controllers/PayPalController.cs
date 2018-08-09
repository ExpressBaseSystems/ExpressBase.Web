using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Runtime.Serialization.Json;
using System.Runtime.Serialization;
using System.Globalization;
using RestSharp;
using System.Net;
using RestSharp.Authenticators;
using Newtonsoft.Json;
using System.Collections.ObjectModel;
using Flurl.Http;
using ExpressBase.Web.BaseControllers;
using ServiceStack;
using ServiceStack.Redis;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Common.ServiceStack.ReqNRes;
using ExpressBase.Common.Enums;
using System.Net;
using System.IO;
using System.Net.Http;
using System.Web;


namespace ExpressBase.Web.Controllers
{
    public class PayPalController : EbBaseIntCommonController
    {
        public PayPalController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis)
        {
        }

        //[HttpGet]
        //public IActionResult Index()
        //{
        //    PayPalPaymentRequest req = new PayPalPaymentRequest();
        //    var PayPalRes = this.ServiceClient.Post<PayPalPaymentResponse>(req);

        //    return Redirect(PayPalRes.ApprovalUrl);
        //}
        [HttpPost]
        public void PayPalWebHook(string action, string environment = "sandbox")
        {
            var BodyStream = this.HttpContext.Request.Body;
            string content = string.Empty;
            using (var reader = new StreamReader(BodyStream))
                content = reader.ReadToEnd();
            var Response = this.ServiceClient.Post(new PayPalWebHookHandler
            {
                JsonBody = content,
                Action = action
            });
        }

        [HttpGet("PayPal/ReturnSuccess/{sid}")]
        public IActionResult ReturnSuccess(string sid, string token)
        {
            var Res = this.ServiceClient.Post(new PayPalSuccessReturnRequest
            {
                PaymentId = token,
                SolutionId = sid
            });
            return View();
        }

        [HttpGet("PayPal/CancelAgreement/{sid}")]
        public IActionResult CancelAgreement(string sid, string token)
        {
            var Res = this.ServiceClient.Post(new PayPalFailureReturnRequest{
                PaymentId=token,
                SolutionId=sid
            });
            return View();
        }

        [HttpGet("Billing")]
        public IActionResult Billing()
        {
           
            return View();
        }

        public IActionResult PayPalPayment()
        {
            int usercount = Convert.ToInt32(this.HttpContext.Request.Form["UserCount"]);
            string sid = this.HttpContext.Request.Form["Sid"];
            string Env = "";
            if (ViewBag.Env == "Development")
                Env = "https://myaccount.eb-test.info";
            else if (ViewBag.Env == "Staging")
                Env = "https://myaccount.eb-test.info";
            else if (ViewBag.Env == "Production")
                Env = "https://myaccount.expressbase.com";

            var rsp = this.ServiceClient.Post<PayPalPaymentResponse>(new PayPalPaymentRequest
            {
                BillingMethod = PaymentMethod.paypal,
                Environment = Env,
                SolutionId = sid,
                UserCount = usercount
            });
            if (rsp.ApprovalUrl.Length > 0)
                return Redirect(rsp.ApprovalUrl);
            return View();
        }
        
        public IActionResult GetApproval()
        {

            return View();
        }

    }

    
}
