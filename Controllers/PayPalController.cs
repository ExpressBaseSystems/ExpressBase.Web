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

namespace ExpressBase.Web.Controllers
{
    public class PayPalController : EbBaseIntCommonController
    {
        public PayPalController(IServiceClient _ssclient, IRedisClient _redis) : base(_ssclient, _redis)
        {
        }

        [HttpGet]
        public IActionResult Index()
        {
            PayPalPaymentRequest req = new PayPalPaymentRequest();
            var PayPalRes = this.ServiceClient.Post<PayPalPaymentResponse>(req);

            return Redirect(PayPalRes.ApprovalUrl);
        }

        public IActionResult ReturnSuccess(string token)
        {
            var Res = this.ServiceClient.Post(new PayPalSuccessReturnRequest
            {
                PaymentId = token
            });
            return View();
        }

        public IActionResult CancelAgreement(string token)
        {
            var Res = this.ServiceClient.Post(new PayPalFailureReturnRequest{});
            return View();
        }

        [HttpGet("Billing")]
        public IActionResult Billing()
        {
           
            return View();
        }

        public IActionResult PayPalPayment()
        {
            string Env = "";
            if (ViewBag.Env == "Development")
                Env = "https://eb-test.info";
            else if (ViewBag.Env == "Staging")
                Env = "https://eb-test.info";
            else if (ViewBag.Env == "Production")
                Env = "https://expressbase.com";

            var rsp = this.ServiceClient.Post<PayPalPaymentResponse>(new PayPalPaymentRequest
            {
                BillingMethod = PaymentMethod.paypal,
                Environment = Env
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
