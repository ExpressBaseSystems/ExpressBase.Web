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

        [HttpPost]
        public IActionResult PaypalReturn(string res)
        {
            Console.WriteLine("POST Request Headers : ");
            foreach (var header in base.Request.Headers)
            {
                Console.WriteLine(header.Key + " : " + header.Value.ToString());
            }
            Console.WriteLine("\n\nPOST Request Body : ");
            Console.WriteLine(GetStringFromStream(base.Request.Body));
            Console.WriteLine("\n\nRESULT : " + res);

            if(res.ToLower().Trim() == "accept")
            {
                HandleApproval();
            }
            else
            {
                HandleCancelation();
            }

            return View();
        }
    }
}
