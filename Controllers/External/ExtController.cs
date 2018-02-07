using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Extensions;
using ExpressBase.Common.Structures;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security;
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
using System.Linq;
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
            ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
            ViewBag.useremail = TempData.Peek(RequestEmail);
            ViewBag.message = TempData["Message"];

            return View();
        }


        public IActionResult DevSignIn()
        {
            ViewBag.errMsg = TempData["ErrorMessage"] as string;
            ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
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
            ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
            ViewBag.errMsg = TempData["ErrorMessage"] as string;
            return View();
        }

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
            ViewBag.errMsg = TempData["ErrorMessage"] as string;
            ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
            return View();
        }

        // [AllowCrossSiteIFrame]
        public IActionResult SignUp()
        {
            ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
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
                UniqueRequestResponse result = this.ServiceClient.Post<UniqueRequestResponse>(new UniqueRequest { email = reqEmail });
                if (result.isUniq)
                {
                    var res = this.ServiceClient.Post<RegisterResponse>(new RegisterRequest { Email = reqEmail, DisplayName = CoreConstants.EXPRESSBASE });

                    if (Convert.ToInt32(res.UserId) >= 0)
                        return RedirectToAction("EbOnBoarding", new RouteValueDictionary(new { controller = "Tenant", action = "EbOnBoarding" })); // convert get to post
                }
                else
                    return RedirectToAction(RoutingConstants.INDEX, new RouteValueDictionary(new { controller = RoutingConstants.EXTCONTROLLER, action = RoutingConstants.INDEX })); // convert get to post;
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




		//[HttpPost]//test social login
		//public async Task<IActionResult> TenantSingleSignOn()
		//{

		//	var host = this.HttpContext.Request.Host;
		//	string[] hostParts = host.Host.Split('.');
		//	string wc = "tc";
		//	string cid = hostParts[0];

		//	MyAuthenticateResponse authResponse = this.ServiceClient.Send<MyAuthenticateResponse>(new Authenticate
		//	{
		//		provider = CredentialsAuthProvider.Name,
		//		UserName = "NIL",
		//		Password = "NIL",
		//		Meta = new Dictionary<string, string> { { "wc", wc }, { "cid", cid }, { "socialId", "1258082321004736" } },
		//	});
		//	if (authResponse != null)
		//	{
		//		this.ServiceClient.BearerToken = authResponse.BearerToken;
		//		this.ServiceClient.RefreshToken = authResponse.RefreshToken;
		//		var tokenS = (new JwtSecurityTokenHandler()).ReadToken(authResponse.BearerToken) as JwtSecurityToken;

		//		string email = tokenS.Claims.First(claim => claim.Type == "email").Value;

		//		User user = this.Redis.Get<User>(string.Format("{0}-{1}-{2}", cid, email, wc));
		//		//var Ids = String.Join(",", user.EbObjectIds);
		//		//GetBotForm4UserResponse formlist = this.ServiceClient.Get<GetBotForm4UserResponse>(new GetBotForm4UserRequest { BotFormIds = "{" + Ids + "}", AppId = appid });
		//		//List<object> returnlist = new List<object>();
		//		//returnlist.Add(authResponse);
		//		//returnlist.Add(formlist.BotForms);
		//		//return returnlist;
		//	}
		//	else
		//	{
		//		return null;
		//	}
		//	var _controller = "TenantUser";
		//	var _action = "UserDashboard";
		//	return Json(new { result = "Redirect", url = Url.Action(_action, _controller) });

		//}




		[HttpPost]
		public IActionResult TenantSingleSignOn()
		{            
            var host = this.HttpContext.Request.Host;
            var req = this.HttpContext.Request.Form;
            string[] hostParts = host.Host.Split('.');
			string whichconsole = "dc";
            string btoken = req["Btoken"].ToString();
            string[] tokparts = btoken.ToString().Split('.');
			////CHECK WHETHER SOLUTION ID IS VALID

			var tokenS = (new JwtSecurityTokenHandler()).ReadToken(btoken) as JwtSecurityToken;
			string email = tokenS.Claims.First(claim => claim.Type == "email").Value;
			//expressbase-email-tc
			User user = this.Redis.Get<User>(string.Format("{0}-{1}-{2}", "eb_dbpjl5pgxleq20180130063835", email, "uc"));

			//bool bOK2AttemptLogin = true;

			//if (host.Host.EndsWith(RoutingConstants.EXPRESSBASEDOTCOM))
			//	this.DecideConsole(req["console"], hostParts[0], (hostParts.Length == 3), out whichconsole);

			//else if (host.Host.EndsWith(RoutingConstants.EBTESTINFO))
			//	this.DecideConsole(req["console"], hostParts[0], (hostParts.Length == 3), out whichconsole);

			//else if (host.Host.EndsWith(RoutingConstants.LOCALHOST))
			//	this.DecideConsole(req["console"], hostParts[0], (hostParts.Length == 2), out whichconsole);

			//else
			//{
			//	bOK2AttemptLogin = false;
			//	_controller = "Ext";
			//	_action = "Error";
			//}

			//if (bOK2AttemptLogin)
			//{
			MyAuthenticateResponse authResponse = null;
			try
			{
				//var jwtToken = new JwtSecurityToken(this.HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN]);
				//JwtSecurityTokenHandler handler = new JwtSecurityTokenHandler();
				//var user = handler.ValidateToken("eyJhbGciOi.....", validationParameters, out validatedToken);
				//var cid = jwtToken.Payload["cid"];
				//jwtToken;

				//string tenantid = ViewBag.cid;
				var authClient = this.ServiceClient;
				authResponse = authClient.Get<MyAuthenticateResponse>(new Authenticate
				{
					provider = CredentialsAuthProvider.Name,
					UserName = req["Email"],
					Password = "NIL",
					//Password = (req["pass"] + req["uname"]).ToMD5Hash(),
					Meta = new Dictionary<string, string> { { "wc", whichconsole }, { "cid", hostParts[0] }, { "sso", "true" } },
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

                return RedirectToAction("ApplicationDashBoard", "Tenant");
            }
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
				this.DecideConsole(hostParts[0], (hostParts.Length == 3), out whichconsole);

			else if (host.Host.EndsWith(RoutingConstants.EBTESTINFO))
				this.DecideConsole(hostParts[0], (hostParts.Length == 3), out whichconsole);

			else if (host.Host.EndsWith(RoutingConstants.LOCALHOST))
				this.DecideConsole(hostParts[0], (hostParts.Length == 2), out whichconsole);

			else
			{
				bOK2AttemptLogin = false;
				_controller = RoutingConstants.EXTCONTROLLER;
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

		private void DecideConsole(string subDomain, bool isNotTenantUser, out string whichconsole)
		{
			string cid = null;
			if (isNotTenantUser && !subDomain.Equals(CoreConstants.EXPRESSBASE))
			{
				if (subDomain.EndsWith("-bot") || subDomain.EndsWith("-mob") || subDomain.EndsWith("-dev"))
				{
					cid = subDomain.Substring(0, subDomain.LastIndexOf("-") - 1);

					if (subDomain.EndsWith("-bot"))
						whichconsole = EbAuthContext.BotUserContext;
					else if (subDomain.EndsWith("-mob"))
						whichconsole = EbAuthContext.MobileUserContext;
					else //if (subDomain.EndsWith("-dev"))
						whichconsole = EbAuthContext.DeveloperContext;
				}
				else
				{
					cid = subDomain;
					whichconsole = EbAuthContext.WebUserContext;
				}
			}
			else // TENANT CONSOLE
			{
				ViewBag.cid = CoreConstants.EXPRESSBASE;
				whichconsole = EbAuthContext.TenantContext;
			}

			ViewBag.cid = cid;
		}

        private void RouteToDashboard(bool hasSystemRole, string whichconsole, out string _controller, out string _action)
        {
            if (ViewBag.cid == CoreConstants.EXPRESSBASE)
            {
                _controller = "Tenant";
                _action = "TenantDashboard";
            }
            else
            {
                if (hasSystemRole && whichconsole == "dc")
                {
                    _controller = "Tenant";
                    _action = "SolutionDashBoard";
                }
                else if (whichconsole == "uc")
                {
                    _controller = "TenantUser";
                    _action = "UserDashboard";
                }
                else
                {
                    _controller = RoutingConstants.EXTCONTROLLER;
                    _action = "Error";
                }
            }
        }

        public IActionResult errorredirect(string console)
        {
            if (console == "tc")
                return RedirectToAction("SignIn", RoutingConstants.EXTCONTROLLER);
            else if (console == "dc")
                return RedirectToAction("DevSignIn", RoutingConstants.EXTCONTROLLER);
            else
                return RedirectToAction("UsrSignIn", RoutingConstants.EXTCONTROLLER);
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
                    Meta = new Dictionary<string, string> { { "wc", "tc" }, { "cid", CoreConstants.EXPRESSBASE }, { "socialId", socialId } },
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
                    return RedirectToAction("Error", RoutingConstants.EXTCONTROLLER);
            }
            catch (WebServiceException wse)
            {
                ViewBag.errormsg = wse.Message;
                return RedirectToAction("Error", RoutingConstants.EXTCONTROLLER);
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
