using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.ServiceStack;
using ExpressBase.Web2.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Options;
using ServiceStack;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Threading.Tasks;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web2.Controllers
{
    public class TenantExtController : Controller
    {
        private readonly EbSetupConfig EbConfig;

        public TenantExtController(IOptionsSnapshot<EbSetupConfig> ss_settings)
        {
            this.EbConfig = ss_settings.Value;
        }

        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult Signin()
        {
            ViewBag.EbConfig = this.EbConfig;
            ViewBag.cookie = Request.Cookies["UserName"];
            ViewBag.Userid = Request.Cookies["UId"];
          
            if (!string.IsNullOrEmpty(ViewBag.cookie))
            {
                var redisClient = EbConfig.GetRedisClient();
                ViewBag.ProfileImage = redisClient.Get<string>(string.Format("uid_{0}_pimg", ViewBag.Userid));
            }

            return View();
        }

        [HttpGet]
        [Microsoft.AspNetCore.Mvc.Route("/login/{cid}")]
        public IActionResult Signin(string cid)
        {
            ViewBag.EbConfig = this.EbConfig;
            ViewBag.cookie = Request.Cookies["UserName"];
            ViewBag.cid = cid;
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Signin(int i)
        {
            ViewBag.EbConfig = this.EbConfig;
            var req = this.HttpContext.Request.Form;
            AuthenticateResponse authResponse = null;

            string token = req["g-recaptcha-response"];
            Recaptcha data = await RecaptchaResponse("6Lf3UxwUAAAAACIoZP76iHFxb-LVNEtj71FU2Vne", token);
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
                try
                {
                    var authClient = this.EbConfig.GetServiceStackClient();
                    authResponse = authClient.Send(new Authenticate
                    {
                        provider = MyJwtAuthProvider.Name,
                        UserName = req["uname"],
                        Password = req["pass"],
                        Meta = new Dictionary<string, string> { { "cid", req["cid"] }, { "Login", "Client" } },
                        UseTokenCookie = true
                    });

                    //var authreq = new Authenticate
                    //{
                    //    provider = MyJwtAuthProvider.Name,
                    //    UserName = req["uname"],
                    //    Password = req["pass"],
                    //    UseTokenCookie = true
                    //};
                    //authreq.Meta = new Dictionary<string, string>();
                    //authreq.Meta.Add("cid", req["cid"]);

                    //authResponse = authClient.Send(authreq);
                }
                catch (WebServiceException wse)
                {
                    ViewBag.errormsg = wse.Message;
                    return View();
                }
                catch (Exception wse)
                {
                    ViewBag.errormsg = wse.Message;
                    return View();
                }

                if (authResponse != null && authResponse.ResponseStatus != null
                    && authResponse.ResponseStatus.ErrorCode == "EbUnauthorized")
                {
                    ViewBag.errormsg = "Please enter a valid Username/Password";
                    return View();
                }  

                CookieOptions options = new CookieOptions();

                Response.Cookies.Append("Token", authResponse.BearerToken, options);

                if (req.ContainsKey("remember"))
                {
                    Response.Cookies.Append("UserName", req["uname"], options);
                    Response.Cookies.Append("UId", authResponse.UserId, options);
                }
                   
                return RedirectToAction("TenantDashboard", new RouteValueDictionary(new { controller = "Tenant", action = "TenantDashboard", id = authResponse.UserId }));

            }
        }

        [HttpGet]
        public IActionResult TenantSignup()
        {
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> TenantSignup(int i)
        {
            var req = this.HttpContext.Request.Form;
            ViewBag.EbConfig = this.EbConfig;
            ViewBag.cid = "";
            string token = req["g-recaptcha-response"];
            Recaptcha data = await RecaptchaResponse("6Lf3UxwUAAAAACIoZP76iHFxb-LVNEtj71FU2Vne", token);
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
                IServiceClient client = this.EbConfig.GetServiceStackClient();
                var res = client.Post<InfraResponse>(new InfraRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value) });
                if (res.id >= 0)
                {
                    return RedirectToAction("TenantProfile", new RouteValueDictionary(new { controller = "Tenant", action = "TenantProfile", Id = res.id }));
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

        [HttpGet]
        public async Task<IActionResult> Facebook()
        {            
            ViewBag.EbConfig = this.EbConfig;
            if (string.IsNullOrEmpty(HttpContext.Request.Query["access_token"])) return View(); //ERROR! No token returned from Facebook!!
            FacebookUser data = await GetFacebookUserJSON(HttpContext.Request.Query["access_token"]);

            Dictionary<string, Object> Dict = (from x in data.GetType().GetProperties() select x).ToDictionary(x => x.Name, x => (x.GetGetMethod().Invoke(data, null) == null ? "" : x.GetGetMethod().Invoke(data, null)));
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var res = client.Post<InfraResponse>(new InfraRequest { Colvalues = Dict, ltype = "fb" });
            if (res.id >= 0)
            {
                return RedirectToAction("TenantProfile", new RouteValueDictionary(new { controller = "Tenant", action = "TenantProfile", Id = res.id, t = 2 }));
            }
            return View();
        }

        private static async Task<FacebookUser> GetFacebookUserJSON(string access_token)
        {
            string url = string.Format("https://graph.facebook.com/me?access_token={0}&fields=email,name,first_name,last_name,link,birthday,locale,gender,location", access_token);
            var req = WebRequest.Create(url);
            var r = await req.GetResponseAsync().ConfigureAwait(false);
            var responseReader = new StreamReader(r.GetResponseStream());
            var responseData = await responseReader.ReadToEndAsync();
            var d = Newtonsoft.Json.JsonConvert.DeserializeObject<FacebookUser>(responseData);
            return d;
        }

        [HttpGet]
        public async Task<IActionResult> Google()
        {
            ViewBag.EbConfig = this.EbConfig;
            if (string.IsNullOrEmpty(HttpContext.Request.Query["accessToken"])) return View();
            GoogleUser oUser = await GetGoogleUserJSON(HttpContext.Request.Query["accessToken"]);
            Dictionary<string, Object> Dict = (from x in oUser.GetType().GetProperties() select x).ToDictionary(x => x.Name, x => (x.GetGetMethod().Invoke(oUser, null) == null ? "" : x.GetGetMethod().Invoke(oUser, null)));
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var res = client.Post<InfraResponse>(new InfraRequest { Colvalues = Dict, ltype = "G+" });
            if (res.id >= 0)
            {
                return RedirectToAction("TenantProfile", new RouteValueDictionary(new { controller = "Tenant", action = "TenantProfile", Id = res.id, t = 2 }));
            }
            return View();
        }

        private async Task<GoogleUser> GetGoogleUserJSON(string access_token)
        {
            string url = "https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + access_token;
            var req = WebRequest.Create(url);
            var r = await req.GetResponseAsync().ConfigureAwait(false);
            var responseReader = new StreamReader(r.GetResponseStream());
            var responseData = await responseReader.ReadToEndAsync();
            var d = Newtonsoft.Json.JsonConvert.DeserializeObject<GoogleUser>(responseData);
            return d;
        }

      
    }
}
