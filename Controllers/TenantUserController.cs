using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using ServiceStack;
using ExpressBase.ServiceStack;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System.IdentityModel.Tokens.Jwt;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Objects;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web2.Controllers
{
    public class TenantUserController : Controller
    {
        private readonly EbSetupConfig EbConfig;

        public TenantUserController(IOptionsSnapshot<EbSetupConfig> ss_settings)
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
            ViewBag.cid = cid;
            return View();
        }

        [HttpPost]
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
                    Response.Cookies.Append("UserName", req["uname"], options);
                return RedirectToAction("UserDashboard", new RouteValueDictionary(new { controller = "TenantUser", action = "UserDashboard", id = authResponse.UserId }));

            }
        }

        public IActionResult UserDashboard()
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
            var fr = client.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { Uid = ViewBag.UId, restype = "img" ,Token=token});
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

        [HttpGet]
        public IActionResult f(int fid, int id)
        {
            var token = Request.Cookies["Token"];
            var handler = new JwtSecurityTokenHandler();
            var tokenS = handler.ReadToken(token) as JwtSecurityToken;
            ViewBag.EbConfig = this.EbConfig;
            ViewBag.Fname = tokenS.Claims.First(claim => claim.Type == "Fname").Value;
            ViewBag.cid = tokenS.Claims.First(claim => claim.Type == "cid").Value;
            ViewBag.token = token;

            var redisClient = this.EbConfig.GetRedisClient();
            redisClient.Set<string>("token", token);
            Objects.EbForm _form = null;
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var fr = client.Get<EbObjectResponse>(new EbObjectRequest { Id = fid, Token = token });
            if (id > 0)
            {
                if (fr.Data.Count > 0)
                {
                    _form = Common.EbSerializers.ProtoBuf_DeSerialize<EbForm>(fr.Data[0].Bytea);
                    _form.Init4Redis();
                    _form.IsUpdate = true;
                    redisClient.Set<EbForm>(string.Format("form{0}", fid), _form);
                }
                string html = string.Empty;
                var vr = client.Get<ViewResponse>(new View { TableId = _form.Table.Id, ColId = id, FId = fid });
                redisClient.Set<EbForm>("cacheform", vr.ebform);
                ViewBag.EbForm = vr.ebform;
                ViewBag.FormId = fid;
                ViewBag.DataId = id;
                return View();
            }
            else
            {
                if (fr.Data.Count > 0)
                {
                    _form = Common.EbSerializers.ProtoBuf_DeSerialize<EbForm>(fr.Data[0].Bytea);
                    _form.Init4Redis();
                    _form.IsUpdate = false;
                    redisClient.Set<EbForm>(string.Format("form{0}", fid), _form);
                }
                ViewBag.EbForm = _form;
                ViewBag.FormId = fid;
                ViewBag.DataId = id;
                ViewBag.EbForm37 = redisClient.Get<EbForm>(string.Format("form{0}", 37));
                return View();
            }
        }

        [HttpPost]
        public IActionResult f()
        {

            var req = this.HttpContext.Request.Form;
            var fid = Convert.ToInt32(req["fId"]);

            var redisClient = this.EbConfig.GetRedisClient();
            ViewBag.EbConfig = this.EbConfig;
            Objects.EbForm _form = redisClient.Get<Objects.EbForm>(string.Format("form{0}", fid));
            bool b = _form.IsUpdate;
            ViewBag.EbForm = _form;
            ViewBag.FormId = fid;
            ViewBag.formcollection = req as FormCollection;
            //bool bStatus = Insert(req as FormCollection);

            //if (bStatus)
            //    return RedirectToAction("masterhome", "Sample");
            //else
            //    return RedirectToAction("Index", "Home");

            return View();
        }

    }
}
