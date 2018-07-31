using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.LocationNSolution;
using ExpressBase.Objects;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Security.Core;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Web.Controllers;
using ExpressBase.Web.Filters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ExpressBase.Web2.Controllers
{
    public class TenantUserController : EbBaseIntCommonController
    {
        public TenantUserController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        [EbBreadCrumbFilter()]
        [HttpGet("UserDashBoard")]
        public IActionResult UserDashboard()
        {
            return View();
        }

        [HttpGet]
        public IActionResult getSidebarMenu()
        {
            if (ViewBag.wc == "tc")
                return View("_SidebarMenu");
            else if (ViewBag.wc == "dc")
                return ViewComponent("SidebarmenuDev", new { solnid = ViewBag.cid, email = ViewBag.email, console = ViewBag.wc });
            else
                return ViewComponent("_SidebarmenuTUser", new { solnid = ViewBag.cid, email = ViewBag.email, console = ViewBag.wc });
        }

        public IActionResult Logout()
        {
            ViewBag.Fname = null;
            var abc = this.ServiceClient.Post(new Authenticate { provider = "logout" });
            HttpContext.Response.Cookies.Delete(RoutingConstants.BEARER_TOKEN);
            HttpContext.Response.Cookies.Delete(RoutingConstants.REFRESH_TOKEN);
            HttpContext.Response.Cookies.Delete(TokenConstants.USERAUTHID);
            return Redirect("/");
        }

        [HttpPost]
        public int CreateConfig(EbLocationCustomField conf)
        {
            var resp = ServiceClient.Post<CreateLocationConfigResponse>(new CreateLocationConfigRequest { Conf = conf });
            return resp.Id;
        }

        [EbBreadCrumbFilter("Locations")]
        [HttpGet]
        public IActionResult EbLocations(int id)
        {
            var resp = this.ServiceClient.Get<LocationInfoResponse>(new LocationInfoRequest { });
            ViewBag.Config = JsonConvert.SerializeObject(resp.Config);
            ViewBag.Locations = resp.Locations;
            return View();
        }

        [HttpPost]
        public int CreateLocation(string locid, string lname, string sname, string img, string meta)
        {
            if (img == null)
                img = "../img";
            var resp = ServiceClient.Post<SaveLocationMetaResponse>(new SaveLocationMetaRequest { Locid = Convert.ToInt32(locid), Longname = lname, Shortname = sname, Img = img, ConfMeta = meta });
            return resp.Id;
        }

        public int DeletelocConf(int id)
        {
            var resp = ServiceClient.Post<DeleteLocResponse>(new DeleteLocRequest { Id = id});
            return resp.id;
        }
    }
}

