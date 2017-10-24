using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web2.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using ServiceStack;
using ServiceStack.Auth;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Threading.Tasks;


// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class ExtController : EbBaseNewController
    {
        public ExtController(IServiceClient _client, IRedisClient _redis)
            : base(_client, _redis) { }

        // GET: /<controller>/
        public IActionResult Index()
        {

            return View();
        }

        public IActionResult DevSignIn()
        {
            ViewBag.ServiceUrl = this.ServiceClient.BaseUri;
            return View();
        }

        public IActionResult AboutUs()
        {
            return View();
        }

        public IActionResult Platform()
        {
            return View();
        }

        public IActionResult SignupSuccess(string email)
        {
            ViewBag.SignupEmail = email;
            return View();
        }

        public IActionResult SignIn()
        {
            ViewBag.ServiceUrl = this.ServiceClient.BaseUri;
            return View();
        }

        public IActionResult Pricing()
        {
            return View();
        }

        public IActionResult UsrSignIn()
        {
            ViewBag.ServiceUrl = this.ServiceClient.BaseUri;
            return View();
        }

        public IActionResult SignUp()
        {
            ViewBag.ServiceUrl = this.ServiceClient.BaseUri;
            return View();
        }

        public IActionResult test()
        {
            return View();
        }

        public IActionResult TenanatAcc()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> TenantExtSignup()
        {
            var req = this.HttpContext.Request.Form;
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
                IServiceClient client = this.ServiceClient;
                try
                {
                    var res = client.Post<RegisterResponse>(new RegisterRequest { Email = req["email"], Password = req["password"], DisplayName = "expressbase" });

                    if (Convert.ToInt32(res.UserId) >= 0)
                    {
                        return RedirectToAction("SignupSuccess", new RouteValueDictionary(new { controller = "Ext", action = "SignupSuccess", email = req["email"] })); // convert get to post
                    }

                }
                catch (WebServiceException e)
                {
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
            else if (host.Host.EndsWith("nip.io") || host.Host.EndsWith("xip.io"))
            {
                if (subdomain.Length == 7) // USER CONSOLE
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
                    string tenantid = ViewBag.cid;
                    var authClient = this.ServiceClient;
                    authResponse = authClient.Send<MyAuthenticateResponse>(new Authenticate
                    {
                        provider = CredentialsAuthProvider.Name,
                        UserName = req["uname"],
                        Password = req["pass"],
                        Meta = new Dictionary<string, string> { { "wc", whichconsole }, { "cid", tenantid } },
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
                        if (ViewBag.cid == "expressbase")
                        {
                            if (subdomain.Length == 3 && authResponse.User.HasEbSystemRole() && whichconsole == "dc")
                                return RedirectToAction("DevConsole", "Dev");

                            else if (subdomain.Length == 3 && authResponse.User.Roles.Contains("Eb_User") && whichconsole == "uc") // USER CONSOLE
                                return RedirectToAction("UserDashboard", "TenantUser");

                            else if (authResponse.User.loginattempts <= 2) // TENANT CONSOLE
                                return RedirectToAction("ProfileSetup", "Tenant");
                            else
                                return RedirectToAction("TenantDashboard", "Tenant");
                        }
                        else
                        {
                            if (subdomain.Length == 2 && authResponse.User.HasSystemRole() && whichconsole == "dc")
                                return RedirectToAction("DevConsole", "Dev");

                            else if (subdomain.Length == 2 && whichconsole == "uc") // USER CONSOLE
                                return RedirectToAction("UserDashboard", "TenantUser");

                            else if (authResponse.User.loginattempts <= 2) // TENANT CONSOLE
                                return RedirectToAction("ProfileSetup", "Tenant");
                            else
                                return RedirectToAction("TenantDashboard", "Tenant");
                        }

                    }

                    else if (host.Host.EndsWith("localhost"))
                    {
                        if (ViewBag.cid == "expressbase")
                        {
                            if (subdomain.Length == 2 && authResponse.User.HasEbSystemRole() && whichconsole == "dc")
                                return RedirectToAction("DevConsole", "Dev");

                            else if (subdomain.Length == 2 && authResponse.User.Roles.Contains("Eb_User") && whichconsole == "uc") // USER CONSOLE
                                return RedirectToAction("UserDashboard", "TenantUser");

                            else if (authResponse.User.loginattempts <= 2) // TENANT CONSOLE
                                return RedirectToAction("ProfileSetup", "Tenant");
                            else
                                return RedirectToAction("TenantDashboard", "Tenant");
                        }
                        else
                        {
                            if (subdomain.Length == 2 && authResponse.User.HasSystemRole() && whichconsole == "dc")
                                return RedirectToAction("DevConsole", "Dev");

                            else if (subdomain.Length == 2 && whichconsole == "uc") // USER CONSOLE
                                return RedirectToAction("UserDashboard", "TenantUser");

                            else if (authResponse.User.loginattempts == 2) // TENANT CONSOLE  
                                return RedirectToAction("ProfileSetup", "Tenant");
                            else
                                return RedirectToAction("TenantDashboard", "Tenant");
                        }
                    }
                    else if (host.Host.EndsWith("nip.io") || host.Host.EndsWith("xip.io"))
                    {
                        if (ViewBag.cid == "expressbase")
                        {
                            if (subdomain.Length == 7 && authResponse.User.HasEbSystemRole() && whichconsole == "dc")
                                return RedirectToAction("DevConsole", "Dev");

                            else if (subdomain.Length == 7  && authResponse.User.Roles.Contains("Eb_User") && whichconsole == "uc") // USER CONSOLE
                                return RedirectToAction("UserDashboard", "TenantUser");

                            else if (authResponse.User.loginattempts == 2) // TENANT CONSOLE  
                                return RedirectToAction("ProfileSetup", "Tenant");
                            else
                                return RedirectToAction("TenantDashboard", "Tenant");
                        }
                        else
                        {
                            if (subdomain.Length == 7 && authResponse.User.HasSystemRole() && whichconsole == "dc")
                                return RedirectToAction("DevConsole", "Dev");

                            else if (subdomain.Length == 7 && whichconsole == "uc") // USER CONSOLE
                                return RedirectToAction("UserDashboard", "TenantUser");

                            else if (authResponse.User.loginattempts == 2) // TENANT CONSOLE  
                                return RedirectToAction("ProfileSetup", "Tenant");
                            else
                                return RedirectToAction("TenantDashboard", "Tenant");
                        }
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
            string email, string socialId, int lg)
        {

            try
            {
                var authClient = this.ServiceClient;
                MyAuthenticateResponse authResponse = authClient.Send<MyAuthenticateResponse>(new Authenticate
                {
                    provider = CredentialsAuthProvider.Name,
                    UserName = email,
                    Password = "NIL",
                    Meta = new Dictionary<string, string> { { "wc", "tc" }, { "cid", "expressbase" }, { "socialId", socialId } },
                    // UseTokenCookie = true
                });

                if (authResponse.User != null)
                {
                    CookieOptions options = new CookieOptions();
                    Response.Cookies.Append("Token", authResponse.BearerToken, options);
                    Response.Cookies.Append("rToken", authResponse.RefreshToken, options);
                    if (lg <= 1)
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
    }

}
