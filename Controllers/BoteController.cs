using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using ServiceStack.Auth;
using Microsoft.AspNetCore.Http;

namespace ExpressBase.Web.Controllers
{
    public class BoteController : EbBaseNewController
    {
        public BoteController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }
        [HttpGet]
        public IActionResult Bot(string tid)
        {
            ViewBag.tid = tid;
            return View();
        }


        [HttpPost]
        public string GetObjHtml(string refid, string socialId)
        
{
            var host = this.HttpContext.Request.Host;
            string[] subdomain = host.Host.Split('.');
            string whichconsole = null;
            var req = this.HttpContext.Request.Form;
            if (host.Host.EndsWith("azurewebsites.net"))
            {
                if (subdomain.Length == 4) // USER CONSOLE
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

            MyAuthenticateResponse authResponse = this.ServiceClient.Send<MyAuthenticateResponse>(new Authenticate
            {
                provider = CredentialsAuthProvider.Name,
                UserName = "NIL",
                Password = "NIL",
                Meta = new Dictionary<string, string> { { "wc", whichconsole }, { "cid", ViewBag.cid }, { "socialId", socialId } },
                // UseTokenCookie = true
            });
            if(authResponse != null)
            {
                CookieOptions options = new CookieOptions();
                Response.Cookies.Append("bToken", authResponse.BearerToken, options);
                Response.Cookies.Append("rToken", authResponse.RefreshToken, options);
                this.ServiceClient.BearerToken = authResponse.BearerToken;
                this.ServiceClient.RefreshToken = authResponse.RefreshToken;
                var resultlist = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
                var dsobj = Common.EbSerializers.Json_Deserialize(resultlist.Data[0].Json);
                dsobj.Status = resultlist.Data[0].Status;
                dsobj.VersionNumber = resultlist.Data[0].VersionNumber;
                return dsobj.GetHtml();

            }
            {
                return "SocialId not in Database";
            }
           
          
        }
    }
}