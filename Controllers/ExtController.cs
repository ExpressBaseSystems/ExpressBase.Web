using ExpressBase.Common.Extensions;
using ExpressBase.Objects.ServiceStack_Artifacts;
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
    public class ExtController : EbBaseNewController
    {
        public ExtController(IServiceClient _client, IRedisClient _redis)
            : base(_client, _redis) { }

        // GET: /<controller>/
        public IActionResult Index(string email)
        {
            ViewBag.useremail = email;
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
            var req = this.HttpContext.Request.Form;
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
                IServiceClient client = this.ServiceClient;
                try
                {
                var unq = client.Post<bool>(new UniqueRequest { email = req["email"] });
                if (!unq)
                {
                    var res = client.Post<RegisterResponse>(new RegisterRequest { Email = req["email"], DisplayName = "expressbase" });

                    if (Convert.ToInt32(res.UserId) >= 0)
                    {
                       return RedirectToAction("ProfileSetup", new RouteValueDictionary(new { controller = "Tenant", action = "ProfileSetup", email = req["email"] })); // convert get to post
                    }
                }
                else
                {
                    return RedirectToAction("Index", new RouteValueDictionary(new { controller = "Ext", action = "Index", email = req["email"] })); // convert get to post;
                }
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
            else
            {
                if (subdomain.Length == 5) // USER CONSOLE
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
                else
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
                    Console.WriteLine("..............................In try for authenticate");
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
                if (authResponse != null && authResponse.ResponseStatus != null
                    && authResponse.ResponseStatus.ErrorCode == "EbUnauthorized")
                {
                    TempData["ErrorMessage"] = "EbUnauthorized";
                    return errorredirect(whichconsole);
                }
                else
                {
                    Console.WriteLine("...........................Authentication Success");
                    CookieOptions options = new CookieOptions();

                    Response.Cookies.Append("bToken", authResponse.BearerToken, options);
                    Response.Cookies.Append("rToken", authResponse.RefreshToken, options);

                    if (req.ContainsKey("remember"))
                    {
                        Response.Cookies.Append("UserName", req["uname"], options);
                    }

                    if (host.Host.EndsWith("expressbase.com") || host.Host.EndsWith("expressbase.org"))
                    {
                        Console.WriteLine("..........................Authentication Success expressbase.com/ expressbase.org");
                        if (ViewBag.cid == "expressbase")
                        {
                            Console.WriteLine("....................Authentication Success expressbase.com/ expressbase.org tenandid=expressbase");
                            if (subdomain.Length == 3 && authResponse.User.HasEbSystemRole() && whichconsole == "dc")
                            {
                                Console.WriteLine(".................Authentication Success expressbase.com/ expressbase.org tenandid=expressbase DevConsole");
                                return RedirectToAction("DevConsole", "Dev");
                            }
                            else if (subdomain.Length == 3 && authResponse.User.Roles.Contains("Eb_User") && whichconsole == "uc") // USER CONSOLE
                            {
                                Console.WriteLine("..................Authentication Success expressbase.com/ expressbase.org tenandid=expressbase UserConsole");
                                return RedirectToAction("UserDashboard", "TenantUser");
                            }
                            else if (authResponse.User.loginattempts <= 2) // TENANT CONSOLE
                            {
                                Console.WriteLine("........................Authentication Success expressbase.com/ expressbase.org tenandid=expressbase ProfileSetup");
                                return RedirectToAction("ProfileSetup", "Tenant");
                            }
                            else
                            {
                                Console.WriteLine("..................Authentication Success expressbase.com/ expressbase.org tenandid=expressbase TenantConsole");
                                return RedirectToAction("TenantDashboard", "Tenant");
                            }
                               
                        }
                        else
                        {
                            Console.WriteLine(".....................Authentication Success expressbase.com/ expressbase.org tenandid=eb_roby_dev");

                            if (subdomain.Length == 3 && authResponse.User.HasSystemRole() && whichconsole == "dc")
                            {
                                Console.WriteLine(".................Authentication Success expressbase.com/ expressbase.org tenandid=eb_roby_dev DevConsole");
                                return RedirectToAction("DevConsole", "Dev");
                            }                          
                            else if (subdomain.Length == 3 && whichconsole == "uc") // USER CONSOLE
                            {
                                Console.WriteLine(".....................Authentication Success expressbase.com/ expressbase.org tenandid=eb_roby_dev UserConsole");
                                return RedirectToAction("UserDashboard", "TenantUser");
                            }                                
                            else if (authResponse.User.loginattempts <= 2) // TENANT CONSOLE
                            {
                                Console.WriteLine("...................Authentication Success expressbase.com/ expressbase.org tenandid=eb_roby_dev ProfileSetup");
                                return RedirectToAction("ProfileSetup", "Tenant");
                            }                                
                            else
                            {
                                Console.WriteLine("...................Authentication Success expressbase.com/ expressbase.org tenandid=eb_roby_dev TenantConsole");
                                return RedirectToAction("TenantDashboard", "Tenant");
                            }
                                
                        }

                    }

                    else if (host.Host.EndsWith("localhost"))
                    {
                        Console.WriteLine(".....................Authentication Success localhost");
                        if (ViewBag.cid == "expressbase")
                        {
                            Console.WriteLine(".....................Authentication Success localhost tenandid=expressbase");
                            if (subdomain.Length == 2 && authResponse.User.HasEbSystemRole() && whichconsole == "dc")
                            {
                                Console.WriteLine(".................Authentication Success localhost tenandid=expressbase DevConsole");
                                return RedirectToAction("DevConsole", "Dev");
                            }
                            else if (subdomain.Length == 2 && authResponse.User.Roles.Contains("Eb_User") && whichconsole == "uc") // USER CONSOLE
                            {
                                Console.WriteLine(".................Authentication Success localhost tenandid=expressbase UserConsole");
                                return RedirectToAction("UserDashboard", "TenantUser");
                            }
                            else if (authResponse.User.loginattempts <= 2) // TENANT CONSOLE
                            {
                                Console.WriteLine(".................Authentication Success localhost tenandid=expressbase ProfileSetUp");
                                return RedirectToAction("ProfileSetup", "Tenant");
                            }
                            else
                            {
                                Console.WriteLine(".................Authentication Success localhost tenandid=expressbase TenantConsole");
                                return RedirectToAction("TenantDashboard", "Tenant");
                            }
                                
                        }
                        else
                        {
                            Console.WriteLine(".....................Authentication Success localhost tenandid=eb_roby_dev");
                            if (subdomain.Length == 2 && authResponse.User.HasSystemRole() && whichconsole == "dc")
                            {
                                Console.WriteLine(".................Authentication Success localhost tenandid=eb_roby_dev DevConsole");
                                return RedirectToAction("DevConsole", "Dev");
                            }
                            else if (subdomain.Length == 2 && whichconsole == "uc") // USER CONSOLE
                            {
                                Console.WriteLine(".................Authentication Success localhost tenandid=eb_roby_dev UserConsole");
                                return RedirectToAction("UserDashboard", "TenantUser");
                            }
                            else if (authResponse.User.loginattempts == 2) // TENANT CONSOLE  
                            {
                                Console.WriteLine(".................Authentication Success localhost tenandid=eb_roby_dev ProfileSetUp");
                                return RedirectToAction("ProfileSetup", "Tenant");
                            }      
                            else
                            {
                                Console.WriteLine(".................Authentication Success localhost tenandid=eb_roby_dev TenantConsole");
                                return RedirectToAction("TenantDashboard", "Tenant");
                            }
                               
                        }
                    }
                    else if (host.Host.EndsWith("nip.io") || host.Host.EndsWith("xip.io"))
                    {
                        Console.WriteLine(".....................Authentication Success nip.io/xip.io");
                        if (ViewBag.cid == "expressbase")
                        {
                            Console.WriteLine(".....................Authentication Success nip.io/xip.io tenantid=expressbase");
                            if (subdomain.Length == 7 && authResponse.User.HasEbSystemRole() && whichconsole == "dc")
                            {
                                Console.WriteLine(".....................Authentication Success nip.io/xip.io tenantid=expressbase DevConsole");
                                return RedirectToAction("DevConsole", "Dev");
                            }
                            else if (subdomain.Length == 7 && authResponse.User.Roles.Contains("Eb_User") && whichconsole == "uc") // USER CONSOLE
                            {
                                Console.WriteLine(".....................Authentication Success nip.io/xip.io tenantid=expressbase UserConsole");
                                return RedirectToAction("UserDashboard", "TenantUser");
                            }
                            else if (authResponse.User.loginattempts == 2) // TENANT CONSOLE  
                            {
                                Console.WriteLine(".....................Authentication Success nip.io/xip.io tenantid=expressbase ProfileSetup");
                                return RedirectToAction("ProfileSetup", "Tenant");
                            } 
                            else
                            {
                                Console.WriteLine(".....................Authentication Success nip.io/xip.io tenantid=expressbase TenantConsole");
                                return RedirectToAction("TenantDashboard", "Tenant");
                            }
                               
                        }
                        else
                        {
                            Console.WriteLine(".....................Authentication Success nip.io/xip.io tenantid=eb_roby_dev");
                            if (subdomain.Length == 7 && authResponse.User.HasSystemRole() && whichconsole == "dc")
                            {
                                Console.WriteLine(".....................Authentication Success nip.io/xip.io tenantid=eb_roby_dev DevConsole");
                                return RedirectToAction("DevConsole", "Dev");
                            }
                                

                            else if (subdomain.Length == 7 && whichconsole == "uc") // USER CONSOLE
                            {
                                Console.WriteLine(".....................Authentication Success nip.io/xip.io tenantid=eb_roby_dev UserConsole");
                                return RedirectToAction("UserDashboard", "TenantUser");
                            }
                            else if (authResponse.User.loginattempts == 2) // TENANT CONSOLE  
                            {
                                Console.WriteLine(".....................Authentication Success nip.io/xip.io tenantid=eb_roby_dev ProfileSetup");
                                return RedirectToAction("ProfileSetup", "Tenant");
                            }                       
                            else
                            {
                                Console.WriteLine(".....................Authentication Success nip.io/xip.io tenantid=eb_roby_dev TenantConsole");
                                return RedirectToAction("TenantDashboard", "Tenant");
                            }
                            
                        }
                    }
                    else
                    {
                        Console.WriteLine(".....................Authentication Success Normal IP");
                        if (ViewBag.cid == "expressbase")
                        {
                            Console.WriteLine(".....................Authentication Success Normal IP tenandid=expressbase");
                            if (subdomain.Length == 5 && authResponse.User.HasEbSystemRole() && whichconsole == "dc")
                            {
                                Console.WriteLine(".....................Authentication Success Normal IP tenandid=expressbase DevConsole");
                                return RedirectToAction("DevConsole", "Dev");
                            }
                            else if (subdomain.Length == 5 && authResponse.User.Roles.Contains("Eb_User") && whichconsole == "uc") // USER CONSOLE
                            {
                                Console.WriteLine(".....................Authentication Success Normal IP tenandid=expressbase UserConsole");
                                return RedirectToAction("UserDashboard", "TenantUser");
                            }
                            else if (authResponse.User.loginattempts == 2) // TENANT CONSOLE  
                            {
                                Console.WriteLine(".....................Authentication Success Normal IP tenandid=expressbase ProfileSetup");
                                return RedirectToAction("ProfileSetup", "Tenant");
                            }
                            else
                            {
                                Console.WriteLine(".....................Authentication Success Normal IP tenandid=expressbase TenantConsole");
                                return RedirectToAction("TenantDashboard", "Tenant");
                            }
                           
                        }
                        else
                        {
                            Console.WriteLine(".....................Authentication Success Normal IP tenandid=eb_roby_dev");
                            if (subdomain.Length == 5 && authResponse.User.HasSystemRole() && whichconsole == "dc")
                            {
                                Console.WriteLine(".....................Authentication Success Normal IP tenandid=eb_roby_dev DevConsole");
                                return RedirectToAction("DevConsole", "Dev");
                            }
                                

                            else if (subdomain.Length == 5 && whichconsole == "uc") // USER CONSOLE
                            {
                                Console.WriteLine(".....................Authentication Success Normal IP tenandid=eb_roby_dev UserConsole");
                                return RedirectToAction("UserDashboard", "TenantUser");
                            }    
                            else if (authResponse.User.loginattempts == 2) // TENANT CONSOLE  
                            {
                                Console.WriteLine(".....................Authentication Success Normal IP tenandid=eb_roby_dev ProfileSetup");
                                return RedirectToAction("ProfileSetup", "Tenant");
                            }          
                            else
                            {
                                Console.WriteLine(".....................Authentication Success Normal IP tenandid=eb_roby_dev TenantConsole");
                                return RedirectToAction("TenantDashboard", "Tenant");
                            }
                            
                        }
                    }


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
        public IActionResult errorredirect(string console)
        {
            if (console == "tc")
            {

                return RedirectToAction("SignIn", "Ext");
            }
            else if (console == "dc")
            {

                return RedirectToAction("DevSignIn", "Ext");
            }
            else
            {

                return RedirectToAction("UsrSignIn", "Ext");
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
                    UserName = "NIL",
                    Password = "NIL",
                    Meta = new Dictionary<string, string> { { "wc", "tc" }, { "cid", "expressbase" }, { "socialId", socialId } },
                    // UseTokenCookie = true
                });

                if (authResponse.User != null)
                {
                    CookieOptions options = new CookieOptions();
                    Response.Cookies.Append("bToken", authResponse.BearerToken, options);
                    Response.Cookies.Append("rToken", authResponse.RefreshToken, options);
                    //if (lg <= 1)
                    //{
                    //    return RedirectToAction("ProfileSetup", "Tenant");
                    //}
                    //{
                        return RedirectToAction("TenantDashboard", "Tenant");
                    //}
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
