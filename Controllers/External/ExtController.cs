using ExpressBase.Common;
using ExpressBase.Common.Extensions;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Web2.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using ServiceStack;
using ServiceStack.Auth;
using ServiceStack.Redis;
using Stripe;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Threading.Tasks;


// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class ExtController : EbBaseExtController
    {
        public const string RequestEmail = "reqEmail";
        public const string Email = "email";

        public ExtController(IServiceClient _client, IRedisClient _redis)
            : base(_client, _redis) { }

        // GET: /<controller>/
        [HttpPost]
        [HttpGet]
        public IActionResult Index()
        {
            ViewBag.useremail = TempData.Peek(RequestEmail);
            return View();
        }


        public IActionResult DevSignIn()
        {
            ViewBag.errMsg = TempData["ErrorMessage"] as string;
            ViewBag.ServiceUrl = this.ServiceClient.BaseUri;
            return View();
        }


        public IActionResult SignupSuccess(string email)
        {
            ViewBag.SignupEmail = email;
            return View();
        }

        // [AllowCrossSiteIFrame]  // for web forwarding with masking
        public IActionResult SignIn()
        {
            ViewBag.ServiceUrl = this.ServiceClient.BaseUri;
            ViewBag.errMsg = TempData["ErrorMessage"] as string;
            return View();
        }


        public IActionResult UsrSignIn()
        {
            ViewBag.errMsg = TempData["ErrorMessage"] as string;
            ViewBag.ServiceUrl = this.ServiceClient.BaseUri;
            return View();
        }

        // [AllowCrossSiteIFrame]
        public IActionResult SignUp()
        {
            ViewBag.ServiceUrl = this.ServiceClient.BaseUri;
            return View();
        }


        public IActionResult test()
        {

            ViewBag.StripePublishKey = "pk_test_s1b6p5MmoOrYVcev3IPk3UMd";
            return View();
        }


        [HttpPost]
        public IActionResult StripeResponse()
        {
            var json = new StreamReader(HttpContext.Request.Body).ReadToEnd();
            var stripeEvent = StripeEventUtility.ParseEvent(json);
            return View();
        }


        public ActionResult Charge(string stripeEmail, string stripeToken)
        {
            var req = this.HttpContext.Request.Form;
            var customers = new StripeCustomerService();
            var charges = new StripeChargeService();

            var customer = customers.Create(new StripeCustomerCreateOptions
            {
                Email = stripeEmail,
                SourceToken = stripeToken
            });

            var charge = charges.Create(new StripeChargeCreateOptions
            {
                Amount = 500,//charge in cents
                Description = "Sample Charge",
                Currency = "usd",
                CustomerId = customer.Id

            });

            StripeSubscriptionService subscriptionSvc = new StripeSubscriptionService();
            subscriptionSvc.Create(customer.Id, "EBSystems");

            var subscriptionOptions = new StripeSubscriptionUpdateOptions()
            {
                PlanId = "EBSystems",
                Prorate = false,
                TrialEnd = DateTime.Now.AddMinutes(2)
            };

            var subscriptionService = new StripeSubscriptionService();
            StripeSubscription subscription = subscriptionService.Update("sub_BlX0rziJyWis7k", subscriptionOptions);

            //StripeSubscriptionService subscriptionSvc = new StripeSubscriptionService();
            //subscriptionSvc.Create(customer.Id, "ebsystems_standard");
            // further application specific code goes here

            return View();
        }


        public IActionResult TenanatAcc()
        {
            return View();
        }


        [HttpPost]
        public async Task<IActionResult> TenantExtSignup()
        {
            // Recaptcha data = await RecaptchaResponse("6LcQuxgUAAAAAD5dzks7FEI01sU61-vjtI6LMdU4", req["g-recaptcha-response"]);
            //if (!data.Success)
            //{
            //    if (data.ErrorCodes.Count > 0)
            //    {
            //        var error = data.ErrorCodes[0].ToLower();
            //        switch (error)
            //        {
            //            case ("missing-input-secret"):
            //                ViewBag.CaptchaMessage = "The secret parameter is missing.";
            //                break;
            //            case ("invalid-input-secret"):
            //                ViewBag.CaptchaMessage = "The secret parameter is invalid or malformed.";
            //                break;

            //            case ("missing-input-response"):
            //                ViewBag.CaptchaMessage = "The captcha input is missing.";
            //                break;
            //            case ("invalid-input-response"):
            //                ViewBag.CaptchaMessage = "The captcha input is invalid or malformed.";
            //                break;

            //            default:
            //                ViewBag.CaptchaMessage = "Error occured. Please try again";
            //                break;
            //        }
            //    }
            //}
            //else
            //{

            try
            {
                string reqEmail = this.HttpContext.Request.Form[Email];
                TempData[RequestEmail] = reqEmail;

                if (!this.ServiceClient.Post<bool>(new UniqueRequest { email = reqEmail }))
                {
                    var res = this.ServiceClient.Post<RegisterResponse>(new RegisterRequest { Email = reqEmail, DisplayName = "expressbase" });

                    if (Convert.ToInt32(res.UserId) >= 0)
                        return RedirectToAction("EbOnBoarding", new RouteValueDictionary(new { controller = "Tenant", action = "EbOnBoarding" })); // convert get to post
                }
                else
                    return RedirectToAction("Index", new RouteValueDictionary(new { controller = "Ext", action = "Index" })); // convert get to post;
            }
            catch (WebServiceException e)
            {
            }
            // }

            return View();
        }


        private static async Task<Recaptcha> RecaptchaResponse(string secret, string token)
        {
            string url = string.Format("https://www.google.com/recaptcha/api/siteverify?secret={0}&response={1}", secret, token);
            var req = WebRequest.Create(url);
            var r = await req.GetResponseAsync().ConfigureAwait(false);
            var responseReader = new StreamReader(r.GetResponseStream());
            var responseData = await responseReader.ReadToEndAsync();
            var d = Newtonsoft.Json.JsonConvert.DeserializeObject<Recaptcha>(responseData);
            return d;
        }


        [HttpPost]
        public async Task<IActionResult> TenantSignin(int i)
        {
            var host = this.HttpContext.Request.Host;
            string[] hostParts = host.Host.Split('.');
            string whichconsole = null;
            var req = this.HttpContext.Request.Form;

            string _controller = null;
            string _action = null;

            //CHECK WHETHER SOLUTION ID IS VALID

            bool bOK2AttemptLogin = true;

            if (host.Host.EndsWith(RoutingConstants.EXPRESSBASEDOTCOM))
                this.DecideConsole(req["console"], hostParts[0], (hostParts.Length == 3), out whichconsole);

            else if (host.Host.EndsWith(RoutingConstants.EBTESTINFO))
                this.DecideConsole(req["console"], hostParts[0], (hostParts.Length == 3), out whichconsole);

            else if (host.Host.EndsWith(RoutingConstants.LOCALHOST))
                this.DecideConsole(req["console"], hostParts[0], (hostParts.Length == 2), out whichconsole);

            else
            {
                bOK2AttemptLogin = false;
                _controller = "Ext";
                _action = "Error";
            }

            if (bOK2AttemptLogin)
            {
                string token = req["g-recaptcha-response"];
                Recaptcha data = await RecaptchaResponse("6LcQuxgUAAAAAD5dzks7FEI01sU61-vjtI6LMdU4", token);
                if (!data.Success)
                {
                    if (data.ErrorCodes.Count <= 0)
                    {
                        return RedirectToAction("Error", "Ext");
                    }
                    var error = data.ErrorCodes[0].ToLower();
                    switch (error)
                    {
                        case ("missing-input-secret"):
                            ViewBag.CaptchaMessage = "The secret parameter is missing.";
                            break;
                        case ("invalid-input-secret"):
                            ViewBag.CaptchaMessage = "The secret parameter is invalid or malformed.";
                            break;

                        case ("missing-input-response"):
                            ViewBag.CaptchaMessage = "The captcha input is missing.";
                            break;
                        case ("invalid-input-response"):
                            ViewBag.CaptchaMessage = "The captcha input is invalid or malformed.";
                            break;

                        default:
                            ViewBag.CaptchaMessage = "Error occured. Please try again";
                            break;
                    }
                    return RedirectToAction("Error", "Ext");
                }
                else
                {
                    MyAuthenticateResponse authResponse = null;
                    try
                    {
                        string tenantid = ViewBag.cid;
                        var authClient = this.ServiceClient;
                        authResponse = authClient.Get<MyAuthenticateResponse>(new Authenticate
                        {
                            provider = CredentialsAuthProvider.Name,
                            UserName = req["uname"],
                            Password = (req["pass"] + req["uname"]).ToMD5Hash(),
                            Meta = new Dictionary<string, string> { { "wc", whichconsole }, { "cid", tenantid } },
                            //UseTokenCookie = true
                        });

                    }
                    catch (WebServiceException wse)
                    {
                        TempData["ErrorMessage"] = wse.Message;
                        return errorredirect(whichconsole);
                    }
                    catch (Exception wse)
                    {
                        TempData["ErrorMessage"] = wse.Message;
                        return errorredirect(whichconsole);
                    }
                    if (authResponse != null && authResponse.ResponseStatus != null && authResponse.ResponseStatus.ErrorCode == "EbUnauthorized")
                    {
                        TempData["ErrorMessage"] = "EbUnauthorized";
                        return errorredirect(whichconsole);
                    }
                    else //AUTH SUCCESS
                    {
                        CookieOptions options = new CookieOptions();

                        Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, authResponse.BearerToken, options);
                        Response.Cookies.Append(RoutingConstants.REFRESH_TOKEN, authResponse.RefreshToken, options);

                        if (req.ContainsKey("remember"))
                            Response.Cookies.Append("UserName", req["uname"], options);

                        this.RouteToDashboard(authResponse.User.HasSystemRole(), whichconsole, out _controller, out _action);
                    }
                }
            }

            return RedirectToAction(_action, _controller);
        }

        private void DecideConsole(string reqConsole, string cid, bool isNotTenantUser, out string whichconsole)
        {
            if (isNotTenantUser)
            {
                ViewBag.cid = cid;
                whichconsole = (!string.IsNullOrEmpty(reqConsole)) ? "dc" : "uc";
            }
            else // TENANT CONSOLE
            {
                ViewBag.cid = "expressbase";
                whichconsole = "tc";
            }
        }

        private void RouteToDashboard(bool hasSystemRole, string whichconsole, out string _controller, out string _action)
        {
            if (ViewBag.cid == "expressbase")
            {
                _controller = "Tenant";
                _action = "TenantDashboard";
            }
            else
            {
                if (hasSystemRole && whichconsole == "dc")
                {
                    _controller = "Dev";
                    _action = "DevConsole";
                }
                else if (whichconsole == "uc")
                {
                    _controller = "TenantUser";
                    _action = "UserDashboard";
                }
                else
                {
                    _controller = "Ext";
                    _action = "Error";
                }
            }
        }

        public IActionResult errorredirect(string console)
        {
            if (console == "tc")
                return RedirectToAction("SignIn", "Ext");
            else if (console == "dc")
                return RedirectToAction("DevSignIn", "Ext");
            else
                return RedirectToAction("UsrSignIn", "Ext");
        }


        [HttpGet]
        public IActionResult AfterSignInSocial(string provider, string providerToken,
            string email, string socialId, int lg)
        {

            try
            {
                var authClient = this.ServiceClient;
                MyAuthenticateResponse authResponse = authClient.Send<MyAuthenticateResponse>(new Authenticate
                {
                    provider = CredentialsAuthProvider.Name,
                    UserName = "NIL",
                    Password = "NIL",
                    Meta = new Dictionary<string, string> { { "wc", "tc" }, { "cid", "expressbase" }, { "socialId", socialId } },
                    // UseTokenCookie = true
                });

                if (authResponse.User != null)
                {
                    CookieOptions options = new CookieOptions();
                    Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, authResponse.BearerToken, options);
                    Response.Cookies.Append(RoutingConstants.REFRESH_TOKEN, authResponse.RefreshToken, options);
                    return RedirectToAction("TenantDashboard", "Tenant");
                    //if (lg <= 1)
                    //{
                    //    return RedirectToAction("ProfileSetup", "Tenant");
                    //}
                    //{
                    //}
                }
                else
                    return RedirectToAction("Error", "Ext");
            }
            catch (WebServiceException wse)
            {
                ViewBag.errormsg = wse.Message;
                return RedirectToAction("Error", "Ext");
            }


        }


        public IActionResult VerificationStatus()
        {
            var email = HttpContext.Request.Query["email"];
            var token = HttpContext.Request.Query["signup_tok"];
            var authClient = this.ServiceClient;
            MyAuthenticateResponse authResponse = authClient.Send<MyAuthenticateResponse>(new Authenticate
            {
                provider = CredentialsAuthProvider.Name,
                UserName = email,
                Password = "NIL",
                Meta = new Dictionary<string, string> { { "signup_tok", token }, { "wc", "tc" } },
                // UseTokenCookie = true
            });

            if (authResponse != null)
                ViewBag.SuccessMessage = "Successfully Verified";
            else
                ViewBag.SuccessMessage = "Verification failed";
            return View();
        }


        [HttpGet]
        public IActionResult SMSCallBack()
        {
            return View();
        }


        [HttpPost]
        public void SMSCallBack(int i)
        {
            var req = this.HttpContext.Request.Form;
            var smsSid = Request.Form["SmsSid"];
            var messageStatus = Request.Form["MessageStatus"];
            SMSSentRequest sMSSentRequest = new SMSSentRequest();
            sMSSentRequest.To = req["to"];
            sMSSentRequest.Body = "SMS Id: " + smsSid.ToString() + "/nMessageStatus:" + messageStatus.ToString();
            this.ServiceClient.Post(sMSSentRequest);
        }
    }

}
