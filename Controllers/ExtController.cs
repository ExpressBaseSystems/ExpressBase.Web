using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Web.Filters;
using ExpressBase.Web2;
using ServiceStack;
using Microsoft.Extensions.Options;
using ExpressBase.Web2.Models;
using System.Net;
using System.IO;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.AspNetCore.Routing;
using ServiceStack.Auth;
using Microsoft.AspNetCore.Http;


// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class ExtController : EbBaseController
    {
        public ExtController(IOptionsSnapshot<EbSetupConfig> ss_settings) : base(ss_settings) { }

        // GET: /<controller>/
        public IActionResult Index()
        {
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }

        public IActionResult AboutUs()
        {
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }

        public IActionResult Platform()
        {
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }

        public IActionResult SignupSuccess()
        {            
            return View();
        }

        public IActionResult SignIn()
        {
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }

        public IActionResult Pricing()
        {
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }

        public IActionResult DevSignIn()
        {
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }

        public IActionResult UsrSignIn()
        {
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> TenantExtSignup()
        {
            var req = this.HttpContext.Request.Form;
            ViewBag.EbConfig = this.EbConfig;
            string token = req["g-recaptcha-response"];
            Recaptcha data = await RecaptchaResponse("6LcQuxgUAAAAAD5dzks7FEI01sU61-vjtI6LMdU4", token);
            if (!data.Success)
            {
                if (data.ErrorCodes.Count <= 0)
                {
                    return View();
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
                return View();
            }
            else
            {
                IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
                var res = client.Post<InfraResponse>(new InfraRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value) });
                if (res.id >= 0)
                {
                    return RedirectToAction("SignupSuccess","Ext");
                }
                else
                {
                    return View();
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

        [HttpPost]
        public async Task<IActionResult> TenantSignin(int i)
        {
            ViewBag.EbConfig = this.EbConfig;
            string url = this.HttpContext.Request.Headers["HOST"];
            string[] firstDomain = url.Split('.');
            string whichconsole = null;

            if (firstDomain.Length == 2)
            {
                ViewBag.cid = firstDomain[0];
                whichconsole = "uc";
            }
            else if (firstDomain.Length == 3)
            {
                ViewBag.cid = firstDomain[1];
                whichconsole = "dc";
            }
            else
            {
                ViewBag.cid = "expressbase";
                whichconsole = "tc";
            }        
            var req = this.HttpContext.Request.Form;
            MyAuthenticateResponse authResponse = null;

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
                try
                {
                    var authClient = this.EbConfig.GetServiceStackClient();
                    authResponse = authClient.Send<MyAuthenticateResponse>(new Authenticate
                    {
                        provider = CredentialsAuthProvider.Name,
                        UserName = ViewBag.cid + "/" + req["uname"],
                        Password = req["pass"],
                        Meta = new Dictionary<string, string> { { "wc",whichconsole } },
                        //UseTokenCookie = true
                    });

                }
                catch (WebServiceException wse)
                {
                    ViewBag.errormsg = wse.Message;
                    return View();
                }
                catch (Exception wse)
                {
                    ViewBag.errormsg = wse.Message;
                    return RedirectToAction("Error", "Ext");
                }

                if (authResponse != null && authResponse.ResponseStatus != null
                    && authResponse.ResponseStatus.ErrorCode == "EbUnauthorized")
                {
                    ViewBag.errormsg = "Please enter a valid Username/Password";
                    return RedirectToAction("Error", "Ext");
                }
                else
                {
                    CookieOptions options = new CookieOptions();

                    Response.Cookies.Append("Token", authResponse.BearerToken, options);
                    Response.Cookies.Append("rToken", authResponse.RefreshToken, options);

                    if (req.ContainsKey("remember"))
                    {
                        Response.Cookies.Append("UserName", req["uname"], options);
                    }


                    if(firstDomain.Length == 1)
                        return RedirectToAction("TenantDashboard", "Tenant");
                    else if (firstDomain.Length == 3 && authResponse.User.RoleCollection.HasSystemRole())
                        return RedirectToAction("DevConsole", "Tenant");
                    else
                        return RedirectToAction("UserDashboard", "TenantUser");
                    
                }
            }
        }


        [HttpGet]
        public IActionResult AfterSignInSocial(string provider, string providerToken, 
            string email, string socialId)
        {

            try
            {
                var authClient = this.EbConfig.GetServiceStackClient();
                MyAuthenticateResponse authResponse = authClient.Send<MyAuthenticateResponse>(new Authenticate
                {
                    provider = CredentialsAuthProvider.Name,
                    UserName = "expressbase/" + email + "/" + socialId,
                    Password = "NIL",
                    Meta =  new Dictionary<string, string> { { "wc", "dc" } },
                   // UseTokenCookie = true
                });

                if(authResponse.User != null)
                {
                    CookieOptions options = new CookieOptions();
                    Response.Cookies.Append("Token", authResponse.BearerToken, options);
                    Response.Cookies.Append("rToken", authResponse.RefreshToken, options);
                    return RedirectToAction("TenantDashboard", "Tenant");
                }
                else
                {
                    return RedirectToAction("Error", "Ext");
                }

            }
            catch (WebServiceException wse)
            {
                ViewBag.errormsg = wse.Message;
                return RedirectToAction("Error", "Ext");
            }

            
        }
    }

}
