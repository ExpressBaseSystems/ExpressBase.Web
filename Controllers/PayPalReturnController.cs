using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Options;
using System.Net;
using Newtonsoft.Json;
using System.Web;
using ExpressBase.Web.BaseControllers;
using ServiceStack;
using ServiceStack.Redis;
using Microsoft.AspNetCore.Mvc;
using Flurl.Http;
using System.Net.Http;

namespace ExpressBase.Web.Controllers
{
    public enum UserAcceptance { WAITING, ACCEPTED, CANCELED };

    public class PaymentReturnController : EbBaseExtController
    {
        private UserAcceptance accepted = UserAcceptance.WAITING;

        public PaymentReturnController (IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        public static string GetStringFromStream(System.IO.Stream stream)
        {
            System.IO.StreamReader reader = new System.IO.StreamReader(stream);
            return reader.ReadToEnd();
        }

        private void HandleApproval()
        {
            accepted = UserAcceptance.ACCEPTED;
            Console.WriteLine("Accepted By User");
        }

        private void HandleCancelation()
        {
            accepted = UserAcceptance.CANCELED;
            Console.WriteLine("Rejected By User");
        }

        private async Task<HttpResponseMessage> Send(FlurlRequest request)
        {
            return await request.SendAsync(HttpMethod.Post); 
        }

        private async Task<string> GetresponseString(HttpResponseMessage response)
        {
            return await response.Content.ReadAsStringAsync();
        }

        [HttpGet]
        public IActionResult PaypalReturn(string res, string tok, string token)
        {
            if(res.ToLower().Trim() == "accept")
            {
                Console.WriteLine("Before HttpPost");
                FlurlClient flurlClient = new FlurlClient();
                flurlClient.Headers.Add("Content-Type", "application/json");
                flurlClient.Headers.Add("Authorization", "Bearer " + tok);
                FlurlRequest fRequest = new FlurlRequest("https://api.sandbox.paypal.com/v1/payments/billing-agreements/" + token + "/agreement-execute/");
                fRequest.Client = flurlClient;
                var frespone = Send(fRequest).Result;
                string responseString = GetresponseString(frespone).Result;
                Console.WriteLine("HTTP Response : " + responseString);
            }
            else
            {
                HandleCancelation();
            }

            return View();
        }
    }
}
