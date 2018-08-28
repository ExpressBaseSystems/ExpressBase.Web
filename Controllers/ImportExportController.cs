using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using ExpressBase.Common;
using ExpressBase.Common.Objects;
using ExpressBase.Common.Objects.Attributes;
using ExpressBase.Objects;
using ExpressBase.Objects.Objects.DVRelated;
using ExpressBase.Objects.ReportRelated;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Web.BaseControllers;
using Microsoft.AspNetCore.Mvc;
using ProtoBuf;
using ServiceStack;
using ServiceStack.Redis;

namespace ExpressBase.Web.Controllers
{
    public class ImportExportController : EbBaseIntCommonController
    {
        public ImportExportController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet("AppStore")]
        public IActionResult AppStore()
        {
            GetAllFromAppstoreResponse resp = ServiceClient.Get(new GetAllFromAppStoreRequest { });
            ViewBag.StoreApps = resp.Apps;
            return View();
        }
        public EbObject GetObjfromDB(string _refid)
        {
            EbObjectParticularVersionResponse res = ServiceClient.Get(new EbObjectParticularVersionRequest { RefId = _refid });
            EbObject obj = EbSerializers.Json_Deserialize(res.Data[0].Json);
            obj.RefId = _refid;
            return obj;
        }

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

        public void Export(string refids)
        {
            ExportApplicationResponse res = ServiceClient.Post<ExportApplicationResponse>(new ExportApplicationRequest { Refids = refids });
        }

        public void Import(int Id)
        {
            ImportApplicationResponse res = ServiceClient.Get<ImportApplicationResponse>(new ImportApplicationRequest { Id = Id });
        }

        public IActionResult ExportOSE(string ids)
        {
            return View();
        }
        public Dictionary<string, List<EbObjectWrapper>> FetchObjectsAndVersions()
        {
            var resultlist = this.ServiceClient.Get<EbObjectObjListAllVerResponse>(new EbObjectObjLisAllVerRequest { EbObjectType = -1 });
            var ObjDVListAll = resultlist.Data;

            return ObjDVListAll;
        }
    }
}