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
    //public enum HttpMethods { GET, POST, PUT, DELETE, HEAD, CONNECT, OPTIONS, PATCH };
    //public enum PlanType { FIXED, INFINITE };
    //public enum PlanState { CREATED, ACTIVE, INACTIVE };
    //public enum TermType { MONTHLY, WEEKLY, YEARLY };
    //public enum PaymentMethod { bank, paypal };
    //public enum CardState { expired, ok };

    public class PayPalController : EbBaseIntCommonController
    {
        //private const string OAuthTokenPath = "/v1/oauth2/token";
        //public static string Response;
        //public static int StatusCode;
        //public static string P_PayResponse;
        //public static int P_PayResCode;

        //public static System.IO.Stream GenerateStreamFromString(string s)
        //{
        //    var stream = new System.IO.MemoryStream();
        //    var writer = new System.IO.StreamWriter(stream);
        //    writer.Write(s);
        //    writer.Flush();
        //    stream.Position = 0;
        //    return stream;
        //}

        //public static System.IO.Stream GenerateStreamFromObject(object s)
        //{
        //    var stream = new System.IO.MemoryStream();
        //    var writer = new System.IO.StreamWriter(stream);
        //    writer.Write(s);
        //    writer.Flush();
        //    stream.Position = 0;
        //    return stream;
        //}

        //public static string GetStringFromStream(System.IO.Stream stream)
        //{
        //    System.IO.StreamReader reader = new System.IO.StreamReader(stream);
        //    string str = reader.ReadToEnd();
        //    return str;
        //}

        //private static async Task<string> GetResponseContents(HttpResponseMessage Response)
        //{
        //    return await Response.Content.ReadAsStringAsync();
        //}

        //private static void PayPalCallback(IRestResponse response, RestRequestAsyncHandle handle)
        //{
        //    if (response.StatusCode == HttpStatusCode.OK)
        //    {
        //        Response = response.Content;
        //        StatusCode = (int)response.StatusCode;
        //    }
        //    else
        //    {
        //        StatusCode = (int)response.StatusCode;
        //        Console.WriteLine("\nRequest Failed");
        //    }
        //}

        //private static async Task<HttpResponseMessage> Send(HttpMethod _method, Flurl.Http.FlurlRequest flurlRequest, string JsonBody)
        //{
        //    return await flurlRequest.SendAsync(_method, new Flurl.Http.Content.CapturedJsonContent(JsonBody));
        //}



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
