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

        [EbBreadCrumbFilter()]
        [HttpGet("MySolutions")]
        public IActionResult TenantDashboard()
        {
            ViewBag.AppType = TempData["apptype"];
            ViewBag.IsSSO = TempData["SSO"];
            ViewBag.Msg = TempData[Msg];
            var result = this.ServiceClient.Get<GetSolutionResponse>(new GetSolutionRequest());
            ViewBag.Solutions = JsonConvert.SerializeObject(result.Data);
            return View();
        }

        [EbBreadCrumbFilter("MySolutions/Sid")]
        [HttpGet("MySolutions/{Sid}")]
        public IActionResult SolutionDashBoard(string Sid)
        {
            GetSolutioInfoResponse resp = this.ServiceClient.Get<GetSolutioInfoResponse>(new GetSolutioInfoRequest { IsolutionId = Sid });
            ViewBag.Connections = resp.EBSolutionConnections;
            ViewBag.SolutionInfo = resp.Data;
            ViewBag.cid = Sid;
            if(this.HttpContext.Request.IsHttps)
                ViewBag.Protocol = "https://";
            else
                ViewBag.Protocol = "http://";
            ViewBag.Domain = this.HttpContext.Request.Host;
            ViewBag.rToken = Request.Cookies["rToken"];
            ViewBag.bToken = Request.Cookies["bToken"];
            return View();
        }

        [HttpPost]
        public void EbCreateSolution(int i)
        {
            var req = this.HttpContext.Request.Form;
            string DbName = req["Isid"];
            var res = this.ServiceClient.Post<CreateSolutionResponse>(new CreateSolutionRequest
            {
                SolutionName = req["Sname"],
                Isid = req["Isid"],
                Esid = req["Isid"],
                Description = req["Desc"],
                Subscription = req["Subscription"]
            });
            if (res.Solnid > 0)
                TempData[Msg] = "New Solution Created.";
        }

        [HttpPost]
        public IActionResult CreateApplication(int i)
        {
            var req = this.HttpContext.Request.Form;
            string apptype = req["AppType"];
            var resultlist = this.ServiceClient.Post<CreateApplicationResponse>(new CreateApplicationRequest
            {
                AppName = req["AppName"],
                AppType = Convert.ToInt32(req["AppType"]),
                Description = req["DescApp"],
                AppIcon = req["AppIcon"],
                Sid = req["Sid"]
            });

            if (resultlist.id > 0)
            {
                TempData["SSO"] = "true";
                TempData["apptype"] = apptype;
                return RedirectToAction("TenantDashboard", "Tenant");
            }
            return View();
        }

        [EbBreadCrumbFilter("MySolutions/NewSolution")]
        public IActionResult CreateSolution()
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

    }
}
