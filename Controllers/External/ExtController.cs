using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Extensions;
using ExpressBase.Common.Structures;
using ExpressBase.Objects.Helpers;
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
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;


// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class ExtController : EbBaseExtController
    {
        public const string RequestEmail = "reqEmail";
        //public const string Email = "email";

        public ExtController(IServiceClient _client, IRedisClient _redis)
            : base(_client, _redis) { }

        [HttpGet]
        public IActionResult ResetPassword()
        {

            return View();
        }

        [HttpGet]
        public IActionResult ForgotPassword()
        {
            ViewBag.message = TempData["Message"];
            return View();
        }

        [HttpPost]
        public IActionResult ForgotPassword(int i)
        {
            string Email = this.HttpContext.Request.Form["Email"];
            UniqueRequestResponse result = this.ServiceClient.Post<UniqueRequestResponse>(new UniqueRequest { email = Email });
            if (!result.isUniq)
            {
                this.ServiceClient.Post(new EmailServicesMqRequest() { refid = "expressbase-expressbase-15-26-26", TenantAccountId = CoreConstants.EXPRESSBASE, newuserid = 0, To = Email, UserId = 0 });
                TempData["Message"] = string.Format("we've sent a password reset link to {0}", Email);
                return RedirectToAction(RoutingConstants.INDEX);
            }
            else
            {
                TempData["Message"] = string.Format("{0} invalid!", Email);
                return RedirectToAction("ForgotPassword");
            }

        }

        public IActionResult UsrSignIn()
        {
            var host = base.HttpContext.Request.Host.Host.Replace(RoutingConstants.WWWDOT, string.Empty);
            string[] hostParts = host.Split(CharConstants.DOT);

            string sBToken = base.HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN];
            string sRToken = base.HttpContext.Request.Cookies[RoutingConstants.REFRESH_TOKEN];

            if (!String.IsNullOrEmpty(sBToken) || !String.IsNullOrEmpty(sRToken))
            {
                if (IsTokensValid(sRToken, sBToken, hostParts[0]))
                {
                    if (hostParts[0].EndsWith(RoutingConstants.DASHDEV))
                        return Redirect(RoutingConstants.MYAPPLICATIONS);
                    else
                        return RedirectToAction("UserDashboard", "TenantUser");
                }
            }
            ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
            ViewBag.ErrorMsg = TempData["ErrorMessage"];
            return View();
        }

        public IActionResult TenantSignIn()
        {
            var host = base.HttpContext.Request.Host.Host.Replace(RoutingConstants.WWWDOT, string.Empty);
            string[] hostParts = host.Split(CharConstants.DOT);

            string sBToken = base.HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN];
            string sRToken = base.HttpContext.Request.Cookies[RoutingConstants.REFRESH_TOKEN];

            if (!String.IsNullOrEmpty(sBToken) || !String.IsNullOrEmpty(sRToken))
            {
                if (IsTokensValid(sRToken, sBToken, hostParts[0]))
                    return Redirect(RoutingConstants.MYSOLUTIONS);
            }
            ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
            ViewBag.ErrorMsg = TempData["ErrorMessage"];

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
                string reqEmail = this.HttpContext.Request.Form[TokenConstants.EMAIL];
                TempData[RequestEmail] = reqEmail;
                UniqueRequestResponse result = this.ServiceClient.Post<UniqueRequestResponse>(new UniqueRequest { email = reqEmail });
                if (result.isUniq)
                {
                    var res = this.ServiceClient.Post<RegisterResponse>(new RegisterRequest { Email = reqEmail, DisplayName = CoreConstants.EXPRESSBASE });

                    if (Convert.ToInt32(res.UserId) >= 0)
                        return RedirectToAction("EbOnBoarding", new { Email = reqEmail }); // convert get to post
                }
                else
                    return RedirectToAction(RoutingConstants.INDEX, new RouteValueDictionary(new { controller = RoutingConstants.EXTCONTROLLER, action = RoutingConstants.INDEX })); // convert get to post;
            }
            catch (WebServiceException e)
            {
                Console.WriteLine("Exception:" + e.ToString());
            }
            // }

            return View();
        }

        [HttpGet]
        public IActionResult EbOnBoarding(string Email)
        {
            ViewBag.useremail = Email;
            var ebids = this.ServiceClient.Get<AutoGenSidResponse>(new AutoGenSidRequest());
            ViewBag.iSid = ebids.Sid;
            return View();
        }

        [HttpPost]
        public void ProfileSetup(int i)
        {
            var req = this.HttpContext.Request.Form;
            var res = this.ServiceClient.Post<CreateAccountResponse>(new CreateAccountRequest
            {
                Op = "updatetenant",
                Name = req["Name"],
                Company = req["Company"],
                Password = req["Password"],
                Country = req["Country"],
                Token = ViewBag.token,
                Email = req["Email"]
            });
            if (res.id >= 0)
            {
                MyAuthenticateResponse authResponse = this.ServiceClient.Get<MyAuthenticateResponse>(new Authenticate
                {
                    provider = CredentialsAuthProvider.Name,
                    UserName = req["Email"],
                    Password = (req["Password"] + req["Email"]).ToMD5Hash(),
                    Meta = new Dictionary<string, string> { { RoutingConstants.WC, RoutingConstants.TC }, { TokenConstants.CID, CoreConstants.EXPRESSBASE } },
                    //UseTokenCookie = true
                });
                if (authResponse != null)
                {
                    CookieOptions options = new CookieOptions();
                    Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, authResponse.BearerToken, options);
                    Response.Cookies.Append(RoutingConstants.REFRESH_TOKEN, authResponse.RefreshToken, options);
                    this.ServiceClient.BearerToken = authResponse.BearerToken;
                    this.ServiceClient.RefreshToken = authResponse.RefreshToken;
                }
            }
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

        public IActionResult SwitchContext()
        {
            Console.WriteLine("Inside Context Switch");
            var req = this.HttpContext.Request.Form;
            string btoken = req["Btoken"].ToString();
            string rtoken = req["Rtoken"].ToString();
            string console = req["WhichConsole"];

            if (TenantSingleSignOn(btoken, rtoken, console))
            {
                if (console == RoutingConstants.DC)
                    return RedirectToAction("DevDashBoard", "Dev");
                else if (console == RoutingConstants.UC)
                    return RedirectToAction("UserDashboard", "TenantUser");
            }
            return View();
        }

        public bool TenantSingleSignOn(string btoken, string rtoken, string wc)
        {
            var host = this.HttpContext.Request.Host;
            string[] hostParts = host.Host.Split(CharConstants.DOT);
            string whichconsole = wc;

            ////CHECK WHETHER SOLUTION ID IS VALID

            string email = ValidateTokensAndGetUserName(btoken, rtoken);
            if (string.IsNullOrEmpty(email))
                return false;

            //CHECK WHETHER SOLUTION ID IS VALID

            bool bOK2AttemptLogin = true;

            this.DecideConsole(hostParts[0], out whichconsole);


            //if (Environment.GetEnvironmentVariable(EnvironmentConstants.ASPNETCORE_ENVIRONMENT) == CoreConstants.PRODUCTION)
            //    this.DecideConsole(hostParts[0], (hostParts.Length == 3), out whichconsole);

            //else if (Environment.GetEnvironmentVariable(EnvironmentConstants.ASPNETCORE_ENVIRONMENT) == CoreConstants.STAGING)
            //    this.DecideConsole(hostParts[0], (hostParts.Length == 3), out whichconsole);

            //else if (Environment.GetEnvironmentVariable(EnvironmentConstants.ASPNETCORE_ENVIRONMENT) == CoreConstants.DEVELOPMENT)
            //    this.DecideConsole(hostParts[0], (hostParts.Length == 2), out whichconsole);

            //else
            //    bOK2AttemptLogin = false;

            if (bOK2AttemptLogin)
            {
                MyAuthenticateResponse authResponse = null;
                try
                {
                    var authClient = this.ServiceClient;
                    authResponse = authClient.Get<MyAuthenticateResponse>(new Authenticate
                    {
                        provider = CredentialsAuthProvider.Name,
                        UserName = email,
                        Password = "NIL",
                        Meta = new Dictionary<string, string> { { RoutingConstants.WC, whichconsole }, { TokenConstants.CID, ViewBag.cid }, { "sso", "true" } },
                    });

                }
                catch (WebServiceException wse) { Console.WriteLine("Exception:" + wse.ToString()); }
                catch (Exception wse) { Console.WriteLine("Exception:" + wse.ToString()); }
                if (authResponse != null && authResponse.ResponseStatus != null && authResponse.ResponseStatus.ErrorCode == "EbUnauthorized") { }
                else //AUTH SUCCESS
                {
                    CookieOptions options = new CookieOptions();

                    Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, authResponse.BearerToken, options);
                    Response.Cookies.Append(RoutingConstants.REFRESH_TOKEN, authResponse.RefreshToken, options);

                    return true;
                }
            }

            return false;
        }

        [HttpPost]
        public async Task<IActionResult> TenantSignin(int i)
        {
            var host = this.HttpContext.Request.Host;
            string[] hostParts = host.Host.Split(CharConstants.DOT);
            string whichconsole = null;
            var req = this.HttpContext.Request.Form;

            string _redirectUrl = null;

            //CHECK WHETHER SOLUTION ID IS VALID

            bool bOK2AttemptLogin = true;

            this.DecideConsole(hostParts[0], out whichconsole);

            //Not needed (Consult Febin)

            //if (Environment.GetEnvironmentVariable(EnvironmentConstants.ASPNETCORE_ENVIRONMENT) == CoreConstants.PRODUCTION)
            //    this.DecideConsole(hostParts[0], (hostParts.Length == 3), out whichconsole);

            //else if (Environment.GetEnvironmentVariable(EnvironmentConstants.ASPNETCORE_ENVIRONMENT) == CoreConstants.STAGING)
            //    this.DecideConsole(hostParts[0], (hostParts.Length == 3), out whichconsole);

            //else if (Environment.GetEnvironmentVariable(EnvironmentConstants.ASPNETCORE_ENVIRONMENT) == CoreConstants.DEVELOPMENT)

            //    this.DecideConsole(hostParts[0], (hostParts.Length == 2), out whichconsole);

            //else
            //{
            //    bOK2AttemptLogin = false;
            //    _controller = RoutingConstants.EXTCONTROLLER;
            //    _action = "Error";
            //}

            if (bOK2AttemptLogin)
            {
                string token = req["g-recaptcha-response"];
                Recaptcha data = await RecaptchaResponse("6LcQuxgUAAAAAD5dzks7FEI01sU61-vjtI6LMdU4", token);
                if (!data.Success)
                {
                    if (data.ErrorCodes.Count <= 0)
                    {
                        return RedirectToAction("Error", RoutingConstants.EXTCONTROLLER);
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
                    return RedirectToAction("Error", RoutingConstants.EXTCONTROLLER);
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
                            Meta = new Dictionary<string, string> { { RoutingConstants.WC, whichconsole }, { TokenConstants.CID, tenantid } },
                            RememberMe = true
                            //UseTokenCookie = true
                        });

                    }
                    catch (WebServiceException wse)
                    {
                        Console.WriteLine("Exception:" + wse.ToString());
                        TempData["ErrorMessage"] = wse.Message;
                        return errorredirect(whichconsole);
                    }
                    catch (Exception wse)
                    {
                        Console.WriteLine("Exception:" + wse.ToString());
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
                        Response.Cookies.Append(TokenConstants.USERAUTHID, authResponse.User.AuthId, options);
                        Response.Cookies.Append("UserDisplayName", authResponse.User.FullName, options);

                        //Response.Cookies.Append(CacheConstants.X_SS_PID, authResponse.SessionId, options);

                        if (req.ContainsKey("remember"))
                            Response.Cookies.Append("UserName", req["uname"], options);

                        this.RouteToDashboard(authResponse.User.HasSystemRole(), whichconsole, out _redirectUrl);
                    }
                }
            }

            return Redirect(_redirectUrl);
        }

        private void DecideConsole(string subDomain, out string whichconsole)
        {
            string cid = null;
            if (subDomain == RoutingConstants.MYACCOUNT)
            {
                cid = CoreConstants.EXPRESSBASE;
                whichconsole = EbAuthContext.TenantContext;
            }
            else
            {
                if (subDomain.EndsWith(RoutingConstants.DASHBOT) || subDomain.EndsWith(RoutingConstants.DASHMOB) || subDomain.EndsWith(RoutingConstants.DASHDEV))
                {
                    cid = subDomain.Substring(0, subDomain.LastIndexOf(CharConstants.DASH));

                    if (subDomain.EndsWith(RoutingConstants.DASHBOT))
                        whichconsole = EbAuthContext.BotUserContext;
                    else if (subDomain.EndsWith(RoutingConstants.DASHMOB))
                        whichconsole = EbAuthContext.MobileUserContext;
                    else //if (subDomain.EndsWith("-dev"))
                        whichconsole = EbAuthContext.DeveloperContext;
                }
                else //User Console
                {
                    cid = subDomain;
                    whichconsole = EbAuthContext.WebUserContext;
                }
            }

            ViewBag.cid = cid;
        }

        private void RouteToDashboard(bool hasSystemRole, string whichconsole, out string _redirectUrl)
        {
            _redirectUrl = RoutingConstants.EXTERROR;
            if (ViewBag.cid == CoreConstants.EXPRESSBASE)
            {
                _redirectUrl = RoutingConstants.MYSOLUTIONS;
            }
            else
            {
                if (hasSystemRole && whichconsole == RoutingConstants.DC)
                {
                    _redirectUrl = RoutingConstants.MYAPPLICATIONS;
                }
                else if (whichconsole == RoutingConstants.UC)
                {
                    _redirectUrl = "/TenantUser/UserDashboard";
                }
            }
        }

        public IActionResult errorredirect(string console)
        {
            return Redirect("/");
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
                    Meta = new Dictionary<string, string> { { RoutingConstants.WC, RoutingConstants.TC }, { TokenConstants.CID, CoreConstants.EXPRESSBASE }, { TokenConstants.SOCIALID, socialId } },
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
                    return Redirect(RoutingConstants.EXTERROR);
            }
            catch (WebServiceException wse)
            {
                Console.WriteLine("Exception:" + wse.ToString());
                ViewBag.errormsg = wse.Message;
                return Redirect(RoutingConstants.EXTERROR);
            }


        }

        public IActionResult VerificationStatus()
        {
            var email = HttpContext.Request.Query[TokenConstants.EMAIL];
            var token = HttpContext.Request.Query[TokenConstants.SIGNUP_TOK];
            var authClient = this.ServiceClient;
            MyAuthenticateResponse authResponse = authClient.Send<MyAuthenticateResponse>(new Authenticate
            {
                provider = CredentialsAuthProvider.Name,
                UserName = email,
                Password = "NIL",
                Meta = new Dictionary<string, string> { { TokenConstants.SIGNUP_TOK, token }, { RoutingConstants.WC, RoutingConstants.TC } },
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

        public string ValidateTokensAndGetUserName(string btoken, string rtoken, string _wc = RoutingConstants.TC, string _cid = CoreConstants.EXPRESSBASE)
        {
            if (VerifySignature(btoken) && VerifySignature(rtoken))
            {
                try
                {
                    var jwtToken = new JwtSecurityToken(btoken);
                    var cid = jwtToken.Payload[TokenConstants.CID];
                    var uid = jwtToken.Payload[TokenConstants.UID];
                    var email = jwtToken.Payload[TokenConstants.EMAIL];
                    var wc = jwtToken.Payload[TokenConstants.WC];
                    var sub = jwtToken.Payload[TokenConstants.SUB];
                    long iat = Convert.ToInt64(jwtToken.Payload[TokenConstants.IAT]);
                    long exp = Convert.ToInt64(jwtToken.Payload[TokenConstants.EXP]);
                    DateTime startDate = new DateTime(1970, 1, 1);
                    DateTime iat_time = startDate.AddSeconds(iat);
                    DateTime exp_time = startDate.AddSeconds(exp);

                    if (!(wc.ToString().Equals(_wc) && cid.ToString().Equals(_cid)))
                    {
                        Console.WriteLine("wc/cid mismatch");
                        return string.Empty;
                    }
                    if (iat_time < DateTime.Now && exp_time > DateTime.Now)
                    {
                        Console.WriteLine("Valid btoken");
                        return email.ToString();
                    }
                    else
                    {
                        Console.WriteLine("btoken expired");
                        var jwtrToken = new JwtSecurityToken(rtoken);
                        var rsub = jwtrToken.Payload[TokenConstants.SUB];
                        long riat = Convert.ToInt64(jwtrToken.Payload[TokenConstants.IAT]);
                        long rexp = Convert.ToInt64(jwtrToken.Payload[TokenConstants.EXP]);
                        DateTime riat_time = startDate.AddSeconds(riat);
                        DateTime rexp_time = startDate.AddSeconds(rexp);
                        if (riat_time < DateTime.Now && rexp_time > DateTime.Now && rsub.Equals(sub))
                        {
                            Console.WriteLine("Valid rtoken");
                            return email.ToString();
                        }
                        else
                            Console.WriteLine("rtoken expired or invalid");
                    }
                }
                catch (Exception e) { Console.WriteLine("Exception:" + e.ToString()); }
            }
            return string.Empty;
        }

    }

}
