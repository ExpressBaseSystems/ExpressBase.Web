using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack.Stripe;
using ServiceStack.Stripe.Types;
using System.IO;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Stripe;
using ExpressBase.Common;
using ExpressBase.Common.LocationNSolution;

namespace StripeApp.Controllers
{
    enum Month { Jan = 1, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec };
    public class StripeController : EbBaseIntCommonController
    {
        public StripeController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }
        public static int i = 0;
        public IActionResult Index()
        {
            ViewBag.pb_key = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_STRIPE_PUBLISHABLE_KEY);
            Eb_Solution soln = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}", ViewBag.cid));
            if (soln.PricingTier == 0)
            {
                ViewBag.Status = true;
            }
            else
            {
                ViewBag.Status = false;
                CheckCustomerSubscribedResponse cust = this.ServiceClient.Post<CheckCustomerSubscribedResponse>(new CheckCustomerSubscribedRequest
                {
                });
                ViewBag.Plan = cust.Plan;
                ViewBag.Users = cust.Users;
            }
            return View("Index");
        }

        public IActionResult CustomerInvoices()
        {
            string cust_id = "cus_FHCU2qwKlkSp3g";
            GetCustomerResponse cust = this.ServiceClient.Post<GetCustomerResponse>(new GetCustomerRequest
            {
                CustId = cust_id
            });
            ViewBag.EmailId = cust.Email;
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

            return View();
        }

        public IActionResult Payment2()
        {
            return View("Payment2");
        }

        public IActionResult StripeHome()
        {
            ViewBag.pb_key = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_STRIPE_PUBLISHABLE_KEY);
            Eb_Solution soln = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}", ViewBag.cid));
            string cust_id = "";
            if (soln.PricingTier == 0)
            {
                ViewBag.Status = true;
                // return View("Index");
            }
            else
            {
                ViewBag.Status = false;
                //---------------------------Plan------------------------
                CheckCustomerSubscribedResponse cust1 = this.ServiceClient.Post<CheckCustomerSubscribedResponse>(new CheckCustomerSubscribedRequest
                {
                });
                ViewBag.Plan = cust1.Plan;
                ViewBag.Users = cust1.Users;
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
        //public IActionResult Charge(string stripeEmail, string stripeToken)
        //{
        //    var customers = new CustomerService();
        //    var charges = new ChargeService();

        //    var customer = customers.Create(new CustomerCreateOptions
        //    {
        //        Email = stripeEmail,
        //        SourceToken = stripeToken
        //    });

        //    var charge = charges.Create(new ChargeCreateOptions
        //    {
        //        Amount = 500,
        //        Description = "Sample Charge",
        //        Currency = "usd",
        //        CustomerId = customer.Id
        //    });

        //    return View();
        //}

        [HttpPost]
        public Object Index(int user_no, string name, string email, string address, string city, string state, string zip, string country, string token, string sid)
        {
            //string planId = "TEST-PLAN-02";
            string CouponId = "COUPON-2-15-3-2-15000";
            StripeToken Token = JsonConvert.DeserializeObject<StripeToken>(token);
            string custid = "";
            string planId = "";
            string invoiceid = "";

            if (CheckCustomer(Token.Id, email, sid))
            {
                custid = CreateCustomer(Token.Id, email, sid);
            }
            else
            {
                custid = CreateCustomer(Token.Id, email, sid);
                UpdateCard(custid, Token.Id, Token.Card.Id, name, address, city, state, zip, country);
            }
            //planId = "plan_FH9R9kOAeqMdva";
            planId = "TestPlan-01";

            CreateCharge(custid);

            CreateSubscriptionResponse res = CreateSubscription(custid, planId, CouponId, user_no, sid);
            return res;
        }

        public bool CheckCustomer(string tokenid, string email, string sid)
        {
            CheckCustomerResponse res = this.ServiceClient.Post<CheckCustomerResponse>(new CheckCustomerRequest
            {
                EmailId = email,
                TokenId = tokenid,
                SolutionId = sid
            });
            return res.Status;
        }

        public void UpdateCard(string custid,string token_id, string cardid, string name, string address, string city, string state, string zip, string country)
        {
            this.ServiceClient.Post<UpdateCardResponse>(new UpdateCardRequest
            {
                CustId = custid,
                CardId = cardid,
                TokenId = token_id,
                Name = name,
                Address = address,
                City = city,
                State = state,
                Country = country,
                Zip = zip
            });
        }

        public void CreateInvoice(string custid)
        {
            this.ServiceClient.Post<CreateInvoiceResponse>(new CreateInvoiceRequest
            {
                CustId = custid,
                Total = Request.Form["tot"]
            });
        }

        public string CreateCustomer(string tokenid, string email, string sid)
        {
            CreateCustomerResponse res = this.ServiceClient.Post<CreateCustomerResponse>(new CreateCustomerRequest
            {
                EmailId = email,
                TokenId = tokenid,
                SolnId = sid
            });
            return res.CustomerId;
        }

        public void CreateCharge(string custid)
        {
            this.ServiceClient.Post<CreateChargeResponse>(new CreateChargeRequest { CustId = custid });
        }

        public void CreateCharge2(string custid)
        {
            this.ServiceClient.Post<CreateChargeResponse>(new CreateCharge2Request { CustId = custid, Total = Request.Form["tot"] });
        }
        public string CreatePlan()
        {
            CreatePlanResponse res = this.ServiceClient.Post<CreatePlanResponse>(new CreatePlanRequest { Total = Request.Form["tot"], Interval = 0, Interval_count = 1 });
            return res.PlanId;
        }

        public string CreateCoupon()
        {
            CreateCouponResponse res = this.ServiceClient.Post<CreateCouponResponse>(new CreateCouponRequest { Duration = 2, PercentageOff = 13, DurationInMonth = 2, RedeemBy = 3, MaxRedeem = 15000 });
            return res.CouponId;
        }

        public CreateSubscriptionResponse CreateSubscription(string custid, string planid, string coupid, int userno, string sid)
        {
            Eb_Solution soln = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}", sid));
            CreateSubscriptionResponse res = this.ServiceClient.Post<CreateSubscriptionResponse>(new CreateSubscriptionRequest
            {
                Total = userno,
                CustId = custid,
                PlanId = planid,
                CoupId = coupid,
                SolnId = sid
            });
            return res;
        }

        public IActionResult GetCustomerInvoice()
        {
            string custid = "cus_FFHCXlsSeXVYZJ";
            GetCustomerInvoiceResponse stripeinvoice = this.ServiceClient.Post<GetCustomerInvoiceResponse>(new GetCustomerInvoiceRequest
            {
                CustId = custid,
            });
            ViewBag.Count = stripeinvoice.Invoices.List.Count;
            string[] MonthStart = new string[stripeinvoice.Invoices.List.Count];
            string[] MonthEnd = new string[stripeinvoice.Invoices.List.Count];
            for (int i = 0; i < stripeinvoice.Invoices.List.Count; i++)
            {
                MonthStart[i] = Enum.GetName(typeof(Month), stripeinvoice.Invoices.List[i].PeriodStart.Month);
                MonthEnd[i] = Enum.GetName(typeof(Month), stripeinvoice.Invoices.List[i].PeriodEnd.Month);
            }
            ViewData["MonthStart"] = MonthStart;
            ViewData["MonthEnd"] = MonthEnd;
            ViewBag.StripeInvoice = stripeinvoice;
            return View();

        }

        public IActionResult GetCustomerUpcomingInvoice()
        {
            string custid = "cus_F2ZzkAQbINHXbc";
            GetCustomerUpcomingInvoiceResponse stripeupcominginvoice = this.ServiceClient.Post<GetCustomerUpcomingInvoiceResponse>(new GetCustomerUpcomingInvoiceRequest
            {
                CustId = custid
            });
            ViewBag.Count = stripeupcominginvoice.Invoice.Data.Count;
            ViewBag.Month = Enum.GetName(typeof(Month), stripeupcominginvoice.Invoice.Date.Month);
            ViewBag.StripeUpcomingInvoice = stripeupcominginvoice;
            return View();

        }


        public Object UpdateCustomerSubscription(int user_no, string sid)
        {
            string planId = "TestPlan-01";
            Eb_Solution soln = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}", ViewBag.cid));
            UpgradeSubscriptionResponse res = this.ServiceClient.Post<UpgradeSubscriptionResponse>(new UpgradeSubscriptionRequest
            {
                Total = user_no,
                PlanId = planId,
                SolnId = sid
            });
            return res;
        }

        public Object UpdateCustomerCard(string cust_id, string name, string email, string address, string city, string state, string zip, string country, string sid)
        {
            Eb_Solution soln = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}", ViewBag.cid));
            UpdateCustomerCardResponse res = this.ServiceClient.Post<UpdateCustomerCardResponse>(new UpdateCustomerCardRequest
            {
                CustId = cust_id,
                Name = name,
                Address = address,
                City = city,
                State = state,
                Country = country,
                Zip = zip,
                SolnId = sid
            });
            res.Email = email;
            return res;
        }
        public IActionResult ViewPlans(object ob)
        {
            GetPlansResponse stripeplans = this.ServiceClient.Post<GetPlansResponse>(new GetPlansRequest
            {
            });
            ViewBag.Count = stripeplans.Plans.Plans.Count;
            ViewBag.Plans = stripeplans;
            return View();
        }

    }
}