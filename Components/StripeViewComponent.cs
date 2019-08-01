using ExpressBase.Common;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExpressBase.Web.Components
{
    public class StripeViewComponent : ViewComponent
    {
        protected JsonServiceClient ServiceClient { get; set; }

        protected RedisClient Redis { get; set; }

        public StripeViewComponent(IServiceClient _client, IRedisClient _redis)
        {
            this.ServiceClient = _client as JsonServiceClient;
            this.Redis = _redis as RedisClient;
        }
        public async Task<IViewComponentResult> InvokeAsync(string sid)
        {
            ViewBag.pb_key = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_STRIPE_PUBLISHABLE_KEY);
            Eb_Solution soln = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}", sid));
            string cust_id = "";
            if (soln == null)
            {
                
                this.ServiceClient.Post(new UpdateSolutionRequest { SolnId = sid});
                soln = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}",sid));
            }
            ViewBag.MinUsers = soln.NumberOfUsers;
            if (soln.PricingTier == 0)
            {
                ViewBag.Status = true;
            }
            else
            {
                ViewBag.Status = false;
                //---------------------------Plan------------------------
                CheckCustomerSubscribedResponse cust1 = this.ServiceClient.Post<CheckCustomerSubscribedResponse>(new CheckCustomerSubscribedRequest
                {
                    SolnId = sid
                });
                ViewBag.Plan = cust1.Plan;
                ViewBag.Users = cust1.Users;
                ViewBag.CustId = cust1.CustId;
                cust_id = cust1.CustId;
                //--------------------------Customer----------------------
                GetCustomerResponse cust = this.ServiceClient.Post<GetCustomerResponse>(new GetCustomerRequest
                {
                    CustId = cust_id
                });
                ViewBag.Cust = cust;
                //-------------------------Card-------------------------------
                GetCardResponse resp = this.ServiceClient.Post<GetCardResponse>(new GetCardRequest
                {
                    CustId = cust_id
                });
                ViewBag.Card = resp;

                //---------------------------Invoice----------------------
                GetCustomerInvoiceResponse stripeinvoice = this.ServiceClient.Post<GetCustomerInvoiceResponse>(new GetCustomerInvoiceRequest
                {
                    CustId = cust_id,
                });
                ViewBag.Count = stripeinvoice.Invoices.List.Count;
                ViewBag.StripeInvoice = stripeinvoice;

                GetCustomerUpcomingInvoiceResponse stripeupcominginvoice = this.ServiceClient.Post<GetCustomerUpcomingInvoiceResponse>(new GetCustomerUpcomingInvoiceRequest
                {
                    CustId = cust_id
                });
                ViewBag.UpCount = stripeupcominginvoice.Invoice.Data.Count;
                ViewBag.StripeUpcomingInvoice = stripeupcominginvoice;
            }
            return View("StripeHome");
        }
    }

}
