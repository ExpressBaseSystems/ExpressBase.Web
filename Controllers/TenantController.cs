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
using ExpressBase.Common.LocationNSolution;

namespace ExpressBase.Web.Controllers
{
    public class TenantController : EbBaseIntTenantController
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

        [HttpPost]
        public CreateSolutionFurtherResponse CreateSolution(int i)
        {
            if (ViewBag.wc == RoutingConstants.TC)
                return this.ServiceClient.Post(new CreateSolutionFurtherRequest());
            else
            {
                var r = new CreateSolutionFurtherResponse();
                r.ResponseStatus.Message = "No permission to create solution";
                return r;
            }
        }

        [HttpPost]
        public IActionResult CreateSolutionManual(int i)
        {
            var req = this.HttpContext.Request.Form;
            var response = this.ServiceClient.Post(new CreateSolutionRequest
            {
                SolutionName = req["Sname"],
                SolnUrl = req["SolnId"],
                DeployDB = true,
                Description = req["Desc"]
            });
            if (response.Id > 0)
            {
                return Redirect("/MySolutions");
            }
            return View();
        }

        [EbBreadCrumbFilter("MySolutions/ESid")]
        [HttpGet("MySolutions/{ESid}")]
        public IActionResult SolutionManager(string ESid)
        {
            if (HasTenantAccess(ESid))
            {
                string isid = this.GetIsolutionId(ESid);
                ViewBag.Title = "MySolutions/" + ESid;
                GetSolutioInfoResponses resp = this.ServiceClient.Get<GetSolutioInfoResponses>(new GetSolutioInfoRequests { IsolutionId = isid });
                //ViewBag.intergrationconfig = resp.IntegrationsConfig;
                //ViewBag.integrations = resp.Integrations;
                //ViewBag.SolutionInfo = resp.SolutionInfo;
                ViewBag.Connections = resp;
                ViewBag.cid = isid;
                ViewBag.Domain = this.HttpContext.Request.Host;
                ViewBag.rToken = Request.Cookies["rToken"];
                ViewBag.bToken = Request.Cookies["bToken"];
                return View();
            }
            else
            {
                return Redirect("/StatusCode/401");
            }
        }

        [HttpGet("Upgrade/{esid}")]
        [EbBreadCrumbFilter("MySolutions/Upgrade Solution", new string[] { "/MySolutions" })]
        public IActionResult EditSolution(string esid)
        {
            if (HasTenantAccess(esid))
            {
                CheckSolutionOwnerResp resp = this.ServiceClient.Get(new CheckSolutionOwnerReq
                {
                    ESolutionId = esid
                });

                if (resp.IsValid)
                {
                    ViewBag.SolutionInfo = resp.SolutionInfo;
                    ViewBag.Title = "Upgrade";
                }
                else
                {
                    return Redirect("/StatusCode/401");
                }
                return View();
            }
            else
            {
                return Redirect("/StatusCode/401");
            }
        }

        [HttpPost]
        public EditSolutionResponse UpgradeSolution()
        {
            EditSolutionResponse resp = null;
            IFormCollection form = this.HttpContext.Request.Form;
            Eb_Solution slno = this.Redis.Get<Eb_Solution>(String.Format("solution_{0}", form["isid"]));

            if (slno.SolutionName != form["sname"] || slno.Description != form["desc"] || (form["newesid"] != form["oldesid"]))
            {
                if (this.Redis.ContainsKey(string.Format(CoreConstants.SOLUTION_ID_MAP, form["newesid"])) && (form["newesid"] != form["oldesid"]))
                {
                    string _existing_isid = this.Redis.Get<string>(string.Format(CoreConstants.SOLUTION_ID_MAP, form["newesid"]));
                    if (_existing_isid != form["isid"])
                        return new EditSolutionResponse { Status = false, Message = "Solution URL unavailable. Try something else" };
                }
                else
                {
                    resp = this.ServiceClient.Post(new EditSolutionRequest
                    {
                        OldESolutionId = form["oldesid"],
                        NewESolutionId = form["newesid"],
                        SolutionName = form["sname"],
                        Description = form["desc"]
                    });
                    if (resp.Status)
                        resp.Message = "Solution upgraded successfully :)";
                    else
                        resp.Message = "Unable to upgrade!";
                }
            }
            else
            {
                resp = new EditSolutionResponse { Status = false, Message = "There is no change you made!" };
            }
            return resp;
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

        public string VersioningSwitch(bool data, string SolnId)
        {
            GetVersioning resp = new GetVersioning();
            try
            {
                resp = this.ServiceClient.Post<GetVersioning>(new SetVersioning { Versioning = data, solution_id = SolnId });
                this.MqClient.Post<RefreshSolutionConnectionsAsyncResponse>(new RefreshSolutionConnectionsBySolutionIdAsyncRequest()
                {
                    SolutionId = SolnId
                });

            }
            catch (Exception e)
            {
                resp.status = new ResponseStatus { Message = e.Message };
            }
            return JsonConvert.SerializeObject(resp);
        }
        [HttpGet("/UpdateSolutionMap")]
        public IActionResult UpdateSidMap()
        {
            UpdateSidMapResponse resp = this.ServiceClient.Post<UpdateSidMapResponse>(new UpdateSidMapRequest());
            return Redirect("/");
        }
        [HttpGet("/UpdateRedis")]
        public IActionResult UpdateRedisConnections()
        {
            UpdateRedisConnectionsResponse resp = this.ServiceClient.Post<UpdateRedisConnectionsResponse>(new UpdateRedisConnectionsRequest { });
            return Redirect("/");
        }
    }

}
