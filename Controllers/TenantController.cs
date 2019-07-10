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
using ExpressBase.Web.BaseControllers;

namespace ExpressBase.Web.Controllers
{
    public class TenantController : EbBaseIntCommonController
    {
        public const string Msg = "Msg";

        public TenantController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        [EbBreadCrumbFilter("Solutions")]
        [HttpGet("MySolutions")]
        public IActionResult TenantDashboard()
        {
            ViewBag.Title = "MySolutions";
            ViewBag.AppType = TempData["apptype"];
            ViewBag.IsSSO = TempData["SSO"];
            ViewBag.Msg = TempData[Msg];
            var result = this.ServiceClient.Get<GetSolutionResponse>(new GetSolutionRequest());
            ViewBag.Solutions = result.Data;
            return View();
        }

        //[EbBreadCrumbFilter("MySolutions/Sid")]
        //[HttpGet("MySolutions/{Sid}")]
        //public IActionResult SolutionDashBoard(string Sid)
        //{
        //    GetSolutioInfoResponse resp = this.ServiceClient.Get<GetSolutioInfoResponse>(new GetSolutioInfoRequest { IsolutionId = Sid });
        //    ViewBag.Connections = resp.EBSolutionConnections;
        //    ViewBag.SolutionInfo = resp.Data;
        //    ViewBag.cid = Sid;
        //    ViewBag.Domain = this.HttpContext.Request.Host;
        //    ViewBag.rToken = Request.Cookies["rToken"];
        //    ViewBag.bToken = Request.Cookies["bToken"];
        //    return View();
        //}

        [EbBreadCrumbFilter("MySolutions/Sid")]
        [HttpGet("MySolutions/{Sid}")]
        public IActionResult SolutionManager(string Sid)
        {
            ViewBag.Title = "MySolutions/"+ Sid;
            GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = Sid });
            //ViewBag.intergrationconfig = resp.IntegrationsConfig;
            //ViewBag.integrations = resp.Integrations;
            //ViewBag.SolutionInfo = resp.SolutionInfo;
            ViewBag.Connections = resp;
            ViewBag.cid = Sid;
            ViewBag.Domain = this.HttpContext.Request.Host;
            ViewBag.rToken = Request.Cookies["rToken"];
            ViewBag.bToken = Request.Cookies["bToken"];
            return View();
        }


        //this function has moved to ext controller
        //[HttpPost]
        //public CreateSolutionResponse EbCreateSolution(int i)
        //{
        //    var req = this.HttpContext.Request.Form;
        //    //string DbName = req["SolnId"];
        //    var res = this.ServiceClient.Post<CreateSolutionResponse>(new CreateSolutionRequest
        //    {
        //        SolutionName = req["Sname"],
        //        SolnUrl = req["SolnId"],
        //        Description = req["Desc"],
        //        DeployDB = Convert.ToBoolean(req["DeployDB"])

        //    });
        //    if (res.Status > 0)
        //        TempData[Msg] = "New Solution Created.";
        //    return res;
        //}

        [HttpGet("NewSolution")]
        [EbBreadCrumbFilter("MySolutions/NewSolution", new string[] { "/MySolutions" })]
        public IActionResult CreateSolution()
        {
            ViewBag.Title = "New Solution";
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

        [HttpGet]
        public IActionResult EmailConfirmation()
        {
            return View();
        }

        [HttpPost]
        public IActionResult EmailConfirmation(int i)
        {
            return View();
        }

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

        [HttpGet("PayNow")]
        public IActionResult PayNow()
        {
            return View();
        }
    }
}
