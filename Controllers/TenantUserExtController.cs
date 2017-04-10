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

        [HttpPost]
        [Microsoft.AspNetCore.Mvc.Route("{cid}")]
        public async Task<IActionResult> TenantUserLogin()
        {
            ViewBag.EbConfig = this.EbConfig;
            var req = this.HttpContext.Request.Form;
            AuthenticateResponse authResponse = null;

            //string token = req["g-recaptcha-response"];
            //Recaptcha data = await RecaptchaResponse("6LcCuhgUAAAAADMQr6bUkjZVPLsvTmWom52vWl3r",token);
            //if (!data.Success)
            //{
            //    if (data.ErrorCodes.Count <= 0)
            //    {
            //        return View();
            //    }
            //    var error = data.ErrorCodes[0].ToLower();
            //    switch (error)
            //    {
            //        case ("missing-input-secret"):
            //            ViewBag.CaptchaMessage = "The secret parameter is missing.";
            //            break;
            //        case ("invalid-input-secret"):
            //            ViewBag.CaptchaMessage = "The secret parameter is invalid or malformed.";
            //            break;

            //        case ("missing-input-response"):
            //            ViewBag.CaptchaMessage = "The captcha input is missing.";
            //            break;
            //        case ("invalid-input-response"):
            //            ViewBag.CaptchaMessage = "The captcha input is invalid or malformed.";
            //            break;

            //        default:
            //            ViewBag.CaptchaMessage = "Error occured. Please try again";
            //            break;
            //    }
            //    return View();
            //}
            //else
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
                    return View();
                }
                catch (Exception wse)
                {
                    return View();
                }

                if (authResponse != null && authResponse.ResponseStatus != null
                    && authResponse.ResponseStatus.ErrorCode == "EbUnauthorized")
                    return View();

                CookieOptions options = new CookieOptions();

                Response.Cookies.Append("Token", authResponse.BearerToken, options);

                if (req.ContainsKey("remember"))
                {
                    Response.Cookies.Append("UserName", req["uname"], options);
                    Response.Cookies.Append("UId", authResponse.UserId, options);
                }
                   
                return RedirectToAction("UserDashboard", new RouteValueDictionary(new { controller = "TenantUser", action = "UserDashboard", id = authResponse.UserId }));

            }
        }
    }
}
