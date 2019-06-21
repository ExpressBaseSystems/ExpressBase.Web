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

namespace StripeApp.Controllers
{
    enum Month { xyz, Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec };
    public class StripeController : EbBaseIntCommonController
    {
        public StripeController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }
        public static int i = 0;
        public StripeGateway gateway = new StripeGateway("");
        public IActionResult Index()
        {
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
            
            GetCustomerUpcomingInvoiceResponse stripeupcominginvoice = this.ServiceClient.Post<GetCustomerUpcomingInvoiceResponse>(new GetCustomerUpcomingInvoiceRequest
            {
                CustId = cust_id
            });
            ViewBag.UpCount = stripeupcominginvoice.Invoice.Data.Count;
            ViewBag.UpMonthStart = Enum.GetName(typeof(Month), stripeupcominginvoice.Invoice.Data[0].PeriodStart.Month);
            ViewBag.UpMonthEnd = Enum.GetName(typeof(Month), stripeupcominginvoice.Invoice.Data[0].PeriodEnd.Month);
            ViewBag.StripeUpcomingInvoice = stripeupcominginvoice;
          
            return View();
        }

        public IActionResult Payment2()
        {
            return View("Payment2");
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
        public ActionResult Index(object obj)
        {
            //string planId = "TEST-PLAN-02";
            string CouponId = "COUPON-2-15-3-2-15000";
            StripeToken Token = JsonConvert.DeserializeObject<StripeToken>(Request.Form["token"]);

            //var json = new StreamReader(HttpContext.Request.Body).ReadToEnd();
            //var stripeEvent = EventUtility.ParseEvent(json);
            string custid = "";
            string planId = "";
            string invoiceid = "";

            if (CheckCustomer(Token.Id))
            {
                custid = CreateCustomer(Token.Id);
            }
            else
            {
                custid = CreateCustomer(Token.Id);
                UpdateCard(custid, Token.Card.Id);
            }

            //planId = CreatePlan();
            //planId = "plan_FH9R9kOAeqMdva";
            planId = "TestPlan-01";

            CreateCharge(custid);

            CreateSubscriptionResponse res = CreateSubscription(custid, planId,CouponId);

            //////////CreateInvoice(custid);
            //////////CreateCharge2(custid);
            //return Redirect(res.Url);
            return RedirectToAction("SubscribedView",res);
        }

        public ActionResult SubscribedView(CreateSubscriptionResponse res)
        {
            ViewBag.SubscribeObjects = res;
            return View();
        }

        public bool CheckCustomer(string tokenid)
        {
            CheckCustomerResponse res = this.ServiceClient.Post<CheckCustomerResponse>(new CheckCustomerRequest
            {
                EmailId = Request.Form["emailid"],
                TokenId = tokenid,
                SolutionId = "" /*ViewBag.cid*/
            });
            return res.Status;
        }
        
        public void UpdateCard(string custid, string cardid)
        {
            this.ServiceClient.Post<UpdateCardResponse>(new UpdateCardRequest
            {
                CustId = custid,
                CardId = cardid,
                Name = Request.Form["name"],
                Address = Request.Form["add1"],
                City = Request.Form["city"],
                State = Request.Form["state"],
                Country = Request.Form["country"],
                Zip = Request.Form["zip"]
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

        public string CreateCustomer(string tokenid)
        {
            CreateCustomerResponse res = this.ServiceClient.Post<CreateCustomerResponse>(new CreateCustomerRequest
            {
                EmailId = Request.Form["emailid"],
                TokenId = tokenid,
                SolutionId = "" /*ViewBag.cid*/
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

        public CreateSubscriptionResponse CreateSubscription(string custid, string planid, string coupid)
        {
            CreateSubscriptionResponse res = this.ServiceClient.Post<CreateSubscriptionResponse>(new CreateSubscriptionRequest
            {
                Total = Int32.Parse(Request.Form["usrno"]),
                CustId = custid,
                PlanId = planid,
                CoupId = coupid
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

        public IActionResult UpdateCustomerSubscription()
        {
            return View();
        }
        [HttpPost]
        public IActionResult UpdateCustomerSubscription(object ob)
        {
            string planid = CreatePlan();
            string custid = "cus_FCzs13hytyth1r";
            this.ServiceClient.Post<UpgradeSubscriptionResponse>(new UpgradeSubscriptionRequest
            {
                CustId = custid,
                PlanId = planid
            });
            return View();
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