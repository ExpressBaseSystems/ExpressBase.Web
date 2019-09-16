using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Common.Constants;
using ExpressBase.Common.Objects;
using ExpressBase.Common.Objects.Attributes;
using ExpressBase.Common.ServiceClients;
using ExpressBase.Objects;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using ExpressBase.Web.Filters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;

namespace ExpressBase.Web.Controllers
{
    public class ImportExportController : EbBaseIntCommonController
    {
        public ImportExportController(IServiceClient sclient, IRedisClient redis, IEbMqClient _mqc) : base(sclient, redis, _mqc) { }

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult GetStore()
        {
            var host = base.HttpContext.Request.Host.Host.Replace(RoutingConstants.WWWDOT, string.Empty);
            string[] hostParts = host.Split(CharConstants.DOT);
            string sBToken = base.HttpContext.Request.Cookies[RoutingConstants.BEARER_TOKEN];
            string sRToken = base.HttpContext.Request.Cookies[RoutingConstants.REFRESH_TOKEN];
            if (!String.IsNullOrEmpty(sBToken) || !String.IsNullOrEmpty(sRToken))
            {
                if (IsTokensValid(sRToken, sBToken, hostParts[0]))
                {
                    return Redirect("/AppStore");
                }
                else
                {
                    return Redirect("/Store");
                }
            }
            else
            {
                return Redirect("/Store");
            }
        }

        [EbBreadCrumbFilter("Appstore")]
        [HttpGet("AppStore")]
        public IActionResult AppStore()
        {
            GetAllFromAppstoreResponse resp = ServiceClient.Get(new GetAllFromAppStoreInternalRequest
            {
                WhichConsole = ViewBag.wc
            });
            ViewBag.PrivateApps = resp.Apps;
            ViewBag.PublicApps = resp.PublicApps;
            return View();
        }
        public EbObject GetObjfromDB(string _refid)
        {
            EbObjectParticularVersionResponse res = ServiceClient.Get(new EbObjectParticularVersionRequest { RefId = _refid });
            EbObject obj = EbSerializers.Json_Deserialize(res.Data[0].Json);
            obj.RefId = _refid;
            return obj;
        }

        [EbBreadCrumbFilter("Appstore/ShareToPublic", new string[] { "/Appstore" })]
        [HttpGet]
        public IActionResult ShareToPublic(int id)
        {
            GetAppDetailsResponse resp = ServiceClient.Get(new GetAppDetailsRequest { Id = id });
            ViewBag.appid = id;
            if (resp.StoreCollection.Count > 0)
            {
                AppStore appstore = resp.StoreCollection[0];
                ViewBag.appstore = appstore;
            }
            else
            {
                ViewBag.appstore = new AppStore
                {
                    IsFree = "1",
                    Cost = 00.00m,
                    DetailId = 0
                };
            }
            return View();
        }

        [HttpPost]
        public IActionResult ShareToPublic()
        {
            var form = HttpContext.Request.Form;
            AppStore store = new AppStore
            {
                Id = Convert.ToInt32(form["appid"]),
                Title = form["title"],
                IsFree = form["price_option"],
                ShortDesc = form["short_description"],
                Tags = form["tags"],
                DetailedDesc = form["detailed_description"],
                DemoLinks = form["demo_link"],
                VideoLinks = form["video_links"],
                Images = form["images"],
                PricingDesc = form["pricing_description"],
                Cost = Convert.ToDecimal(form["price"]),
                DetailId = Convert.ToInt32(form["detailid"])
            };
            ShareToPublicResponse resp = ServiceClient.Post(new ShareToPublicRequest { Store = store });
            return RedirectToAction("AppStore");
        }

        public IActionResult Export(string refids, int appid)
        {
            ExportApplicationResponse res = ServiceClient.Post<ExportApplicationResponse>(new ExportApplicationMqRequest { Refids = refids, AppId = appid });
            return RedirectToAction("AppStore");
        }

        [HttpPost]
        public bool Import(int i)
        {
            IFormCollection req = this.HttpContext.Request.Form;
            string _sid = req["solution_url"];
            int _appid = Convert.ToInt32(req["appid"]);
            if (this.Redis.Exists(string.Format(CoreConstants.SOLUTION_INTEGRATION_REDIS_KEY, _sid)) != 0)
            {
                ImportApplicationResponse res = ServiceClient.Get<ImportApplicationResponse>(new ImportApplicationMqRequest
                {
                    Id = _appid,
                    IsDemoApp = false,
                    SelectedSolutionId = _sid,
                });
            }
            else
            {
                return false;
            }
            return true;
        }

        public IActionResult ExportOSE(string ids, int AppId)
        {
            EbObjectObjListAllVerResponse resultlist = ServiceClient.Get(new EbAllObjNVerRequest { ObjectIds = ids });
            ViewBag.objlist = resultlist.Data;
            ViewBag.appid = AppId;
            return View();
        }

        [EbBreadCrumbFilter("Store/Import To Solution", new string[] { "/Store" })]
        [HttpGet("Import/ImportToSln")]
        public IActionResult ImportToSolution(int appid)
        {
            AppAndsolutionInfoResponse result = this.ServiceClient.Get(new AppAndsolutionInfoRequest
            {
                AppId = appid,
                WhichConsole = ViewBag.wc
            });
            ViewBag.Solutions = result.Solutions;
            ViewBag.AppData = result.AppData;
            ViewBag.AppId = appid;
            return View();
        }
    }
}