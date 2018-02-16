using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System.IO;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.Extensions.Options;
using ExpressBase.Web.Filters;
using ExpressBase.Common;
using ExpressBase.Objects;
using System.Net;
using ServiceStack.Text;
using ExpressBase.Data;
using System.Text.RegularExpressions;
using System.Collections;
using ServiceStack.Redis;
using ExpressBase.Security;
using ServiceStack.Auth;
using ExpressBase.Common.Extensions;
using Newtonsoft.Json;
using ExpressBase.Common.Connections;
using ExpressBase.Common.Constants;



// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class TenantController : EbBaseIntController
    {       
        public TenantController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public void ProfileSetup(int i)
        {
            var req = this.HttpContext.Request.Form;
            var res = this.ServiceClient.Post<CreateAccountResponse>(new CreateAccountRequest { op = "updatetenant", Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value), Token = ViewBag.token });           
            if (res.id >= 0)
            {
                MyAuthenticateResponse authResponse = this.ServiceClient.Get<MyAuthenticateResponse>(new Authenticate
                {
                    provider = CredentialsAuthProvider.Name,
                    UserName = req["Email"],
                    Password = (req["Password"] + req["Email"]).ToMD5Hash(),
                    Meta = new Dictionary<string, string> { { "wc", "tc" }, { "cid", CoreConstants.EXPRESSBASE } },
                    //UseTokenCookie = true
                });
                if (authResponse != null)
                {
                    CookieOptions options = new CookieOptions();
                    Response.Cookies.Append(RoutingConstants.BEARER_TOKEN, authResponse.BearerToken, options);
                    Response.Cookies.Append(RoutingConstants.REFRESH_TOKEN, authResponse.RefreshToken, options);
                    this.ServiceClient.BearerToken = authResponse.BearerToken;
                    this.ServiceClient.RefreshToken = authResponse.RefreshToken;
                }               
            }
        }

        [HttpGet]
        public IActionResult TenantDashboard()
        {
            ViewBag.AppType = TempData.Peek("apptype");
            ViewBag.IsSSO = TempData.Peek("SSO");
            //ViewBag.Email = TempData.Peek("reqEmail");
            var result = this.ServiceClient.Get<GetSolutionResponse>(new GetSolutionRequest());
            ViewBag.Solutions = JsonConvert.SerializeObject(result.Data);
            return View();
        }

        [HttpGet]
        public IActionResult SolutionDashBoard()
        {
            GetSolutioInfoResponse resp = this.ServiceClient.Get<GetSolutioInfoResponse>(new GetSolutioInfoRequest ());
            GetConnectionsResponse solutionConnections = this.ServiceClient.Post<GetConnectionsResponse>(new GetConnectionsRequest { ConnectionType = 0 });          
            ViewBag.Connections = JsonConvert.SerializeObject(solutionConnections.EBSolutionConnections);
            ViewBag.SolutionInfo = resp.Data;
            return View();
        }     

        [HttpGet]
        public IActionResult EbOnBoarding()
        {
            ViewBag.useremail = TempData.Peek("reqEmail");
            var ebids = this.ServiceClient.Get<AutoGenEbIdResponse>(new AutoGenEbIdRequest() { WhichId = "signup" });
            //for solution id WhichId = "sid",for appid WhichId = "appid"
            ViewBag.iSid = ebids.Sid;
            ViewBag.AppId = ebids.AppId;
            return View();
        }
        
        [HttpPost]
        public void EbCreateSolution(int i)
        {
            var req = this.HttpContext.Request.Form;
            string DbName = req["Isid"];
            var res = this.ServiceClient.Post<CreateSolutionResponse>(new CreateSolutionRequest
            {
                Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value)
            });            
        }

        [HttpPost]
        public IActionResult EbOnBoarding(int i)
        {
            var req = this.HttpContext.Request.Form;
            string apptype = req["AppType"];
            var resultlist = this.ServiceClient.Post<CreateApplicationResponse>(new CreateApplicationRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value), });
            if (resultlist.id > 0)
            {
                TempData["SSO"] = "true";
                TempData["apptype"] = apptype;
                return RedirectToAction("TenantDashboard", "Tenant");
            }
            return View();
        }

        [HttpGet]
        public IActionResult TenantAddAccount()
        {
            var resultset = this.ServiceClient.Get<GetProductPlanResponse>(new GetProductPlanRequest { });
            ViewBag.plans = JsonConvert.SerializeObject(resultset.Plans);
            //ViewBag.Sid = resultset.Sid;
            return View();
        }

        public IActionResult TenantHome()
        {
            return View();
        }

        public IActionResult Logout()
        {
            ViewBag.Fname = null;
            IServiceClient client = this.ServiceClient;
            var abc = client.Post(new Authenticate { provider = "logout" });
            HttpContext.Response.Cookies.Delete(RoutingConstants.BEARER_TOKEN);
            HttpContext.Response.Cookies.Delete(RoutingConstants.REFRESH_TOKEN);
            return RedirectToAction(RoutingConstants.INDEX, RoutingConstants.EXTCONTROLLER);

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

            {
                return View();
            }
        }

        [HttpGet]
        public IActionResult TenantProfile()
        {
            ViewBag.logtype = HttpContext.Request.Query["t"];
            ViewBag.TId = Convert.ToInt32(HttpContext.Request.Query["Id"]);

            return View();
        }

        [HttpPost]
        public IActionResult TenantProfile(int i)
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.ServiceClient;
            var res = client.Post<TokenRequiredUploadResponse>(new TokenRequiredUploadRequest { op = "updatetenant", Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value), Token = ViewBag.token });
            if (res.id >= 0)
            {
                return RedirectToAction("TenantDashboard", new RouteValueDictionary(new { controller = "Tenant", action = "TenantDashboard", Id = res.id }));
            }
            return View();

        }

        public IActionResult marketPlace()
        {
            return View();
        }

        public IActionResult dbConfig()
        {
            return View();
        }



        public IActionResult SimpleAdvanced()
        {
            return View();
        }

        public IActionResult SimpleDbConf()
        {
            return View();
        }

        public IActionResult Engineering()
        {
            return View();
        }

        //public JsonResult GetEbObjects_json()
        //  {
        //      var req = this.HttpContext.Request.Form;
        //      IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
        //      var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { TenantAccountId = ViewBag.cid, Token = ViewBag.token });
        //      var rlist = resultlist.Data;
        //      Dictionary<int, string> ObjList = new Dictionary<int, string>();
        //      foreach (var element in rlist)
        //      {
        //          if (element.EbObjectType.ToString() == req["ebobjtype"])
        //          {
        //              ObjList[element.Id] = element.Name;
        //          }
        //      }
        //      return Json(ObjList);
        //  }

        public IActionResult CreateApplications()
        {
            return View();
        }

        public class ObjectCaller
        {
            public int obj_id { get; set; }
            public int TenantId { get; set; }

            public ObjectCaller(int id, int cid)
            {
                this.obj_id = id;
                this.TenantId = cid;
            }

        }

    }
}
