using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExpressBase.Common.Constants;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
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
            return View();
        }

        public IActionResult DemoAuth(string Context,string FbId, string Name, string Email, string Cid)
        {
            Dictionary<string, string> _Meta = new Dictionary<string, string> {
                    { TokenConstants.WC, "bc" },
                    { TokenConstants.CID, Cid },
                    { TokenConstants.SOCIALID, FbId },
                    { "emailId", Email },
                    { "anonymous", "true" },
                    { "user_name", Name }
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
                this.ServiceClient.BearerToken = authResponse.BearerToken;
                this.ServiceClient.RefreshToken = authResponse.RefreshToken;
                Console.WriteLine("demo fb auth success");

                return Redirect("/");
            }
            else
            {
                return null;
            }
        }
    }
}
