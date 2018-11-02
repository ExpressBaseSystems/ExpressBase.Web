using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Auth;
using ServiceStack.Redis;

namespace ExpressBase.Web.Controllers
{
    public class DemosController : EbBaseExtController
    {
        public DemosController(IServiceClient _client, IRedisClient _redis)
            : base(_client, _redis) { }

        public IActionResult Demos()
        {
            return View();
        }

        [HttpGet("signuptest")]
        public IActionResult SignUpTest()
        {
            return View();
        }

        [HttpGet("GoToDemos")]
        public IActionResult DemoSSO()
        {
            string host = HttpContext.Request.Host.Host;
            if (host.Contains("-dev"))
                ViewBag.wc = "dc";
            else
                ViewBag.wc = "uc";

            return View();
        }

        public string DemoAuth(string Context, string FbId, string Name, string Email, string Cid)
        {
            Dictionary<string, string> _Meta = new Dictionary<string, string> {
                    { TokenConstants.WC, Context },
                    { TokenConstants.CID, Cid },
                    { TokenConstants.SOCIALID, FbId },
                    { "emailId", Email },
                    { "anonymous", "true" },
                    { "user_name", Name },
                    { "appid", "0" }
            };

            MyAuthenticateResponse authResponse = this.ServiceClient.Send<MyAuthenticateResponse>(new Authenticate
            {
                provider = CredentialsAuthProvider.Name,
                UserName = "NIL",
                Password = "NIL",
                Meta = _Meta,
            });
            if (authResponse != null)
            {
                CookieOptions options = new CookieOptions();

                Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, authResponse.BearerToken, options);
                Response.Cookies.Append(RoutingConstants.REFRESH_TOKEN, authResponse.RefreshToken, options);
                Response.Cookies.Append(TokenConstants.USERAUTHID, authResponse.User.AuthId, options);

                Console.WriteLine("demo fb auth success");

                if (Context == RoutingConstants.DC)
                {
                    return RoutingConstants.MYAPPLICATIONS;
                }
                else if (Context == RoutingConstants.UC)
                {
                    return RoutingConstants.USERDASHBOARD;
                }
                else
                {
                    return null;
                }
            }
            else
            {
                return null;
            }
        }
    }
}
