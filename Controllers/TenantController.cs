using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using Microsoft.AspNetCore.Http;
using ExpressBase.ServiceStack.Services;
using Microsoft.AspNetCore.Routing;
using ExpressBase.ServiceStack;
using System.Net;
using System.IO;
using System.Reflection;
using System.IdentityModel.Tokens.Jwt;
using ExpressBase.Data;
using ServiceStack.Redis;
using ExpressBase.Objects;
////using Newtonsoft.Json;
using ExpressBase.Web2.Models;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.Extensions.Options;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web2.Controllers
{
    public class TenantController : Controller
    {
        private readonly EbSetupConfig EbConfig;

        public TenantController(IOptionsSnapshot<EbSetupConfig> ss_settings)
        {
            this.EbConfig = ss_settings.Value;
        }

        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }
        [HttpGet]
        public IActionResult DBCheck()
        {
            return View();
        }
        [HttpGet]
        public IActionResult TenantDashboard()
        {
            var redisClient = this.EbConfig.GetRedisClient();
            var token = Request.Cookies["Token"];
            var handler = new JwtSecurityTokenHandler();
            var tokenS = handler.ReadToken(token) as JwtSecurityToken;
            ViewBag.Fname = tokenS.Claims.First(claim => claim.Type == "Fname").Value;
            ViewBag.cid = tokenS.Claims.First(claim => claim.Type == "cid").Value;
            ViewBag.UId = Convert.ToInt32(HttpContext.Request.Query["id"]);
            ViewBag.token = token;
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var fr = client.Get<GetAccountResponse>(new GetAccount { Uid = ViewBag.UId, restype = "img", Token = token });
            //if (string.IsNullOrEmpty(ViewBag.cid))
            //{
            //    foreach (int element in fr.dict.Keys)
            //    {
            //        redisClient.Set<string>(string.Format("uid_{0}_profileimage", ViewBag.UId), fr.dict[element]);
            //    }
            //}

            ViewBag.EbConfig = this.EbConfig;
            return View();
        }

        [HttpPost]
        public IActionResult TenantDashboard(int i)
        {
            ViewBag.EbConfig = this.EbConfig;
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var res = client.Post<bool>(new DbCheckRequest { CId = Convert.ToInt32(req["id"]), DBColvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value) });
            if (res)
            {
                return View();
            }
            else
            {
                ViewBag.Message = "Error in Connection";
                return View();
            }

        }

        [HttpGet]
        public IActionResult PricingSelect()
        {
            var token = Request.Cookies["Token"];
            var handler = new JwtSecurityTokenHandler();
            var tokenS = handler.ReadToken(token) as JwtSecurityToken;
            ViewBag.Fname = tokenS.Claims.First(claim => claim.Type == "Fname").Value;
            ViewBag.UId = Convert.ToInt32(HttpContext.Request.Query["id"]);
            ViewBag.token = token;
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }

        [HttpPost]
        public IActionResult PricingSelect(int i)
        {

            var req = this.HttpContext.Request.Form;
            ViewBag.EbConfig = this.EbConfig;
            return RedirectToAction("TenantAddAccount", new RouteValueDictionary(new { controller = "Tenant", action = "TenantAddAccount", tier = req["tier"], id = req["tenantid"] }));
        }

        [HttpGet]
        public IActionResult TenantAddAccount()
        {

            var token = Request.Cookies["Token"];
            var handler = new JwtSecurityTokenHandler();
            var tokenS = handler.ReadToken(token) as JwtSecurityToken;
            ViewBag.Fname = tokenS.Claims.First(claim => claim.Type == "Fname").Value;
            ViewBag.tier = HttpContext.Request.Query["tier"];
            ViewBag.tenantid = HttpContext.Request.Query["id"];
            ViewBag.token = token;
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }

        [HttpPost]
        public IActionResult TenantAddAccount(int i)
        {

            var req = this.HttpContext.Request.Form;
            var token = Request.Cookies["Token"];
            var handler = new JwtSecurityTokenHandler();
            var tokenS = handler.ReadToken(token) as JwtSecurityToken;
            ViewBag.EbConfig = this.EbConfig;
            var id = tokenS.Claims.First(claim => claim.Type == "uid").Value;
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var res = client.Post<AccountResponse>(new AccountRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value), op = "insert", Token = token });
            if (res.id >= 0)
            {
                return RedirectToAction("TenantAccounts", new RouteValueDictionary(new { controller = "Tenant", action = "TenantAccounts", Id = req["tenantid"], aid = res.id }));

            }
            else
            {

                return View();
            }

        }
        [HttpGet]
        public IActionResult TenantAccounts()
        {
            var token = Request.Cookies["Token"];
            var handler = new JwtSecurityTokenHandler();
            var tokenS = handler.ReadToken(token) as JwtSecurityToken;
            ViewBag.Fname = tokenS.Claims.First(claim => claim.Type == "Fname").Value;
            ViewBag.UId = tokenS.Claims.First(claim => claim.Type == "uid").Value;
            ViewBag.accountid = HttpContext.Request.Query["aid"];
            ViewBag.token = token;
            ViewBag.EbConfig = this.EbConfig;
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var fr = client.Get<GetAccountResponse>(new GetAccount {Uid = Convert.ToInt32(ViewBag.UId), Token = token });
            ViewBag.dict = fr.returnlist;
            return View();
            //JsonServiceClient client = new JsonServiceClient("http://localhost:53125/");
            //var res = client.Get<AccountResponse>(new Services.GetAccount { Uid = ViewBag.UId });


        }

        [HttpPost]
        public IActionResult TenantAccounts(int i)
        {
            var token = Request.Cookies["Token"];
            var handler = new JwtSecurityTokenHandler();
            var tokenS = handler.ReadToken(token) as JwtSecurityToken;
            ViewBag.Fname = tokenS.Claims.First(claim => claim.Type == "Fname").Value;
            ViewBag.UId = Convert.ToInt32(HttpContext.Request.Query["id"]);
            ViewBag.token = token;
            ViewBag.EbConfig = this.EbConfig;
            //IServiceClient client = new JsonServiceClient("http://localhost:53125/").WithCache();
            //var fr = client.Get<AccountResponse>(new GetAccount { Uid = ViewBag.UId });
            //ViewBag.List = fr.aclist;
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var res = client.Post<AccountResponse>(new AccountRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value), op = "Dbcheck", TId = Convert.ToInt32(ViewBag.UId),Token=token });
            if (res.id >= 0)
            {
                return RedirectToAction("TenantAccounts", new RouteValueDictionary(new { controller = "Tenant", action = "TenantAccounts", Id = req["tenantid"] }));

            }
            else
            {
                return View();
            }


        }


        public IActionResult TenantHome()
        {
            return View();
        }

        public IActionResult TenantLogout()
        {
            ViewBag.Fname = null;
            return View();
        }

        public IActionResult ResetPassword()
        {
            return View();
        }
        [HttpGet]
        public IActionResult EmailConfirmation()
        {
            return View();
        }

        [HttpPost]
        public IActionResult EmailConfirmation(int i)
        {
            //var req = this.HttpContext.Request.Form;

            //JsonServiceClient client = new JsonServiceClient("http://localhost:53125/");
            //var res = client.Post<bool>(new Services.SendMail { Emailvals= req.ToDictionary(dict => dict.Key, dict => (object)dict.Value) });
            //if (res.id >= 0)
            //{
            //    return RedirectToAction("TenantProfile", new RouteValueDictionary(new { controller = "Tenant", action = "TenantProfile", Id = res.id }));

            //}
            //else
            {
                return View();
            }
        }

        [HttpGet]
        public IActionResult Signin()
        {
            ViewBag.cookie = Request.Cookies["UserName"];
            ViewBag.EbConfig = this.EbConfig;
            //IServiceClient client = this.EbConfig.GetServiceStackClient();
            //var fr = client.Get<GetAccountResponse>(new GetAccount { Uname = ViewBag.cookie, restype = "homeimg" });
            //ViewBag.dict = fr.dict;
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
                    Response.Cookies.Append("UserName", req["uname"], options);
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


        [HttpGet]
        public IActionResult TenantProfile()
        {
            ViewBag.logtype = HttpContext.Request.Query["t"];
            ViewBag.EbConfig = this.EbConfig;
            ViewBag.TId = Convert.ToInt32(HttpContext.Request.Query["Id"]);


            return View();
        }

        [HttpPost]
        public IActionResult TenantProfile(int i)
        {
            ViewBag.EbConfig = this.EbConfig;
            var req = this.HttpContext.Request.Form;
            var token = Request.Cookies["Token"];
            var handler = new JwtSecurityTokenHandler();
            var tokenS = handler.ReadToken(token) as JwtSecurityToken;
            var id = tokenS.Claims.First(claim => claim.Type == "uid").Value;
            if (Request.Form.Files.Count > 0)
            {
                var files = Request.Form.Files;

                Dictionary<string, object> dict = new Dictionary<string, object>();
                foreach (var file in files)
                {
                    if (file.Length > 0)
                    {
                        using (var fileStream = file.OpenReadStream())
                        using (var ms = new MemoryStream())
                        {
                            fileStream.CopyTo(ms);
                            var fileBytes = ms.ToArray();
                            string img = Convert.ToBase64String(fileBytes);
                            string imgbase = Convert.ToBase64String(fileBytes);
                            dict.Add("profileimg", imgbase);
                            dict.Add("id", id);
                            IServiceClient imgclient = this.EbConfig.GetServiceStackClient();
                            var imgres = imgclient.Post<InfraResponse>(new InfraRequest { ltype = "imgupload", Colvalues = dict });
                        }
                    }
                }
                return View();
            }
            else
            {
                IServiceClient client = this.EbConfig.GetServiceStackClient();
                var res = client.Post<InfraResponse>(new InfraRequest { ltype = "update", Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value) });
                if (res.id >= 0)
                {
                    return RedirectToAction("TenantDashboard", new RouteValueDictionary(new { controller = "Tenant", action = "TenantDashboard", Id = res.id }));

                }
                return View();
            }
        }


        public IActionResult UserPreferences()
        {
            return View();
        }
    }
}
