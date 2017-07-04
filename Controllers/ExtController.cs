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

        public IActionResult DevSignIn()
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

        public IActionResult SignupSuccess(string email)
        {
            ViewBag.SignupEmail = email;
            //IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            //client.Post<EmailServicesResponse>(new EmailServicesRequest { To = email, Message = "XXXX", Subject = "YYYY" });
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

       

        public IActionResult UsrSignIn()
        {
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }

        public IActionResult SignUp()
        {
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }

        public IActionResult test()
        {
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }

        public IActionResult TenanatAcc()
        {
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> TenantExtSignup()
        {
            var req = this.HttpContext.Request.Form;
            ViewBag.EbConfig = this.EbConfig;
            Recaptcha data = await RecaptchaResponse("6LcQuxgUAAAAAD5dzks7FEI01sU61-vjtI6LMdU4", req["g-recaptcha-response"]);
            if (!data.Success)
            {
                if (data.ErrorCodes.Count > 0)
                {
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
                }
            }
            else
            {
                IServiceClient client = this.EbConfig.GetServiceStackClient();
                try
                {
                     var res = client.Post<RegisterResponse>(new Register { Email = req["email"], Password = req["password"] ,DisplayName = "expressbase" });

                    if (Convert.ToInt32(res.UserId) >= 0)
                    {
                        client.Post<EmailServicesResponse>(new EmailServicesRequest { To = req["email"], Message = string.Format("http://expressbase.org/Ext/VerificationStatus?signup_tok={0}&email={1}", res.UserName, req["email"]), Subject = "EXPRESSbase Signup Confirmation" });
                        return RedirectToAction("SignupSuccess", new RouteValueDictionary(new { controller = "Ext", action = "SignupSuccess", email = req["email"] })); // convert get to post
                    }

                }
                catch (WebServiceException e) {
                }
            }

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
            ViewBag.EbConfig = this.EbConfig;
           // string url = this.HttpContext.Request.Headers["HOST"];
            var host = this.HttpContext.Request.Host;
            string[] subdomain = host.Host.Split('.');
            string whichconsole = null;
            var req = this.HttpContext.Request.Form;

           

            if (host.Host.EndsWith("expressbase.com") || host.Host.EndsWith("expressbase.org"))
            {
                if (subdomain.Length == 3) // USER CONSOLE
                {
                    if (!string.IsNullOrEmpty(req["console"]))
                    {
                        ViewBag.cid = subdomain[0];
                        whichconsole = "dc";
                    }
                    else
                    {
                        ViewBag.cid = subdomain[0];
                        whichconsole = "uc";
                    }
                   
                }
                else // TENANT CONSOLE
                {
                    ViewBag.cid = "expressbase";
                    whichconsole = "tc";
                }
            }
            else if (host.Host.EndsWith("localhost"))
            {
                if (subdomain.Length == 2) // USER CONSOLE
                {
                    if (!string.IsNullOrEmpty(req["console"]))
                    {
                        ViewBag.cid = subdomain[0];
                        whichconsole = "dc";
                    }
                    else
                    {
                        ViewBag.cid = subdomain[0];
                        whichconsole = "uc";
                    }
                }
                else // TENANT CONSOLE
                {
                    ViewBag.cid = "expressbase";
                    whichconsole = "tc";
                }
            }
               
            
               


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
                        UserName = req["uname"],
                        Password = req["pass"],
                        Meta = new Dictionary<string, string> { { "wc",whichconsole }, { "cid", ViewBag.cid } },
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

                    if (host.Host.EndsWith("expressbase.com") || host.Host.EndsWith("expressbase.org"))
                    {
                        if (subdomain.Length == 3 && authResponse.User.RoleCollection.HasSystemRole() && whichconsole=="dc")
                            return RedirectToAction("DevConsole", "Dev");

                        else if (subdomain.Length == 3 && whichconsole == "uc") // USER CONSOLE
                            return RedirectToAction("UserDashboard", "TenantUser");

                        else if (authResponse.User.loginattempts <= 2) // TENANT CONSOLE
                            return RedirectToAction("ProfileSetup", "Tenant");
                        else
                            return RedirectToAction("TenantDashboard", "Tenant");
                    }

                    else if (host.Host.EndsWith("localhost"))
                    {
                        if (subdomain.Length == 2 && authResponse.User.RoleCollection.HasSystemRole() && whichconsole == "dc")
                            return RedirectToAction("DevConsole", "Dev");

                        else if (subdomain.Length == 2 && whichconsole == "uc") // USER CONSOLE
                            return RedirectToAction("UserDashboard", "TenantUser");

                        else if (authResponse.User.loginattempts == 2) // TENANT CONSOLE  
                            return RedirectToAction("ProfileSetup", "Tenant");
                        else
                            return RedirectToAction("TenantDashboard", "Tenant");            
                    }
                    else
                        return RedirectToAction("Error", "Ext");


                    //if (subdomain.Length == 2)
                    //{
                    //    if(authResponse.User.loginattempts <= 2)
                    //        return RedirectToAction("ProfileSetup", "Tenant");
                    //    else
                    //        return RedirectToAction("TenantDashboard", "Tenant");
                    //}                      
                    //else if (subdomain.Length == 3 && authResponse.User.RoleCollection.HasSystemRole())
                    //    return RedirectToAction("DevConsole", "Dev");
                    //else
                    //    return RedirectToAction("UserDashboard", "TenantUser");

                }
            }
        }


        [HttpGet]
        public IActionResult AfterSignInSocial(string provider, string providerToken, 
            string email, string socialId,int lg)
        {

            try
            {
                var authClient = this.EbConfig.GetServiceStackClient();
                MyAuthenticateResponse authResponse = authClient.Send<MyAuthenticateResponse>(new Authenticate
                {
                    provider = CredentialsAuthProvider.Name,
                    UserName =  email,
                    Password = "NIL",
                    Meta =  new Dictionary<string, string> { { "wc", "dc" }, { "cid", "expressbase" }, { "socialId", socialId } },
                   // UseTokenCookie = true
                });

                if(authResponse.User != null)
                {
                    CookieOptions options = new CookieOptions();
                    Response.Cookies.Append("Token", authResponse.BearerToken, options);
                    Response.Cookies.Append("rToken", authResponse.RefreshToken, options);
                    if(lg <= 1)
                    {
                        return RedirectToAction("ProfileSetup", "Tenant");
                    }
                    {
                        return RedirectToAction("TenantDashboard", "Tenant");
                    }                    
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


        public IActionResult VerificationStatus()
        {
            ViewBag.EbConfig = this.EbConfig;
            var email = HttpContext.Request.Query["email"];
            var token = HttpContext.Request.Query["signup_tok"];
            var authClient = this.EbConfig.GetServiceStackClient();
            MyAuthenticateResponse authResponse = authClient.Send<MyAuthenticateResponse>(new Authenticate
            {
                provider = CredentialsAuthProvider.Name,
                UserName =  email,
                Password = "NIL",
                Meta = new Dictionary<string, string> { { "signup_tok", token } , { "wc", "tc" } },
                // UseTokenCookie = true
            });

            if (authResponse != null)
                ViewBag.SuccessMessage = "Successfully Verified";
            else
                ViewBag.SuccessMessage = "Verification failed";
            return View();
        }
    }

}
