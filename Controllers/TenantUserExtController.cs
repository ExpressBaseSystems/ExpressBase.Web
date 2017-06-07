using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using ExpressBase.Web2;
using ExpressBase.ServiceStack;
using ServiceStack;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using ExpressBase.Web2.Models;
using System.Net;
using System.IO;
using ExpressBase.Security;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web2.Controllers
{
    public class TenantUserExtController : Controller
    {
        private readonly EbSetupConfig EbConfig;

        public TenantUserExtController(IOptionsSnapshot<EbSetupConfig> ss_settings)
        {
            this.EbConfig = ss_settings.Value;
        }
        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }
      
        public IActionResult TenantUserLogin(int i)
        {
            var req = this.HttpContext.Request.Form;
            ViewBag.cid = req["cid"];
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }
       
        [HttpGet]
        [Microsoft.AspNetCore.Mvc.Route("{cid}")]
        public IActionResult TenantUserLogin(string cid)
        {
            ViewBag.EbConfig = this.EbConfig;
            ViewBag.cookie = Request.Cookies["UserName"];
            ViewBag.Userid = Request.Cookies["UId"];
            ViewBag.cid = cid;
            if (!string.IsNullOrEmpty(ViewBag.cookie))
            {
                var redisClient = EbConfig.GetRedisClient();
                ViewBag.ProfileImage = redisClient.Get<string>(string.Format("cid_{0}_uid_{1}_pimg",cid,ViewBag.Userid));
            }
            
            return View();
        }


        //[Microsoft.AspNetCore.Mvc.Route("{cid}")]
        [HttpPost]
        public async Task<IActionResult> TenantUserLogin()
        {
            ViewBag.EbConfig = this.EbConfig;
           
            var req = this.HttpContext.Request.Form;
            ViewBag.cid = req["cid"];
            MyAuthenticateResponse authResponse = null;
            
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
                    authResponse = authClient.Send<MyAuthenticateResponse>(new Authenticate
                    {
                        provider = MyJwtAuthProvider.Name,
                        UserName = req["uname"],
                        Password = req["pass"],
                        Meta = new Dictionary<string, string> { { "cid", req["cid"] }, { "Login", "Client" } },
                        UseTokenCookie = true
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
                    return View();
                }

                if (authResponse != null && authResponse.ResponseStatus != null
                    && authResponse.ResponseStatus.ErrorCode == "EbUnauthorized")
                {
                    ViewBag.errormsg = "Please enter a valid Username/Password";
                    return View("TenantUserLogin");
                }

                RoleCollection RoleCollection = authResponse.User.RoleCollection;
                CookieOptions options = new CookieOptions();

                if (RoleCollection.HasSystemRole())
                {
                    Response.Cookies.Append(string.Format("T_{0}", ViewBag.cid), authResponse.BearerToken, options);
                    Response.Cookies.Append("cid", ViewBag.cid);

                    if (req.ContainsKey("remember"))
                    {
                        Response.Cookies.Append("UserName", req["uname"], options);
                        Response.Cookies.Append("UId", authResponse.UserId, options);
                    }
                    return RedirectToAction("DevConsole", new RouteValueDictionary(new { controller = "Tenant", action = "DevConsole", id = authResponse.UserId }));
                }
                else
                {

                    Response.Cookies.Append(string.Format("T_{0}", ViewBag.cid), authResponse.BearerToken, options);

                    if (req.ContainsKey("remember"))
                    {
                        Response.Cookies.Append("UserName", req["uname"], options);
                        Response.Cookies.Append("UId", authResponse.UserId, options);
                    }

                    return RedirectToAction("UserDashboard", new RouteValueDictionary(new { controller = "TenantUser", action = "UserDashboard", id = authResponse.UserId }));
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
    }
}
