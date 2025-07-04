﻿using System;
using System.Web;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text;
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
using Newtonsoft.Json;
using ServiceStack;
using ServiceStack.Redis;
using System.IO.Compression;

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
            string host = base.HttpContext.Request.Host.Host.Replace(RoutingConstants.WWWDOT, string.Empty);
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
            IFormCollection form = HttpContext.Request.Form;
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

        public FileContentResult DownloadPackageJson(int id)
        {
            GetOneFromAppstoreResponse packageresponse = ServiceClient.Get(new GetOneFromAppStoreRequest
            {
                Id = id,
            });
            string packageJson = EbSerializers.Json_Serialize4AppWraper(packageresponse.Package);
            Byte[] bytea = Encoding.ASCII.GetBytes(packageJson);
            string filename = (packageresponse.Title == "") ? packageresponse.Package.Name : packageresponse.Title;
            return File(bytea, "application/json", filename + ".json");
        }

        [HttpPost("UploadFiles")]
        public string UploadPackageJson(List<IFormFile> file)
        {
            string message="no response";
            try
            {
                StringBuilder result = new StringBuilder();
                using (StreamReader reader = new StreamReader(file[0]?.OpenReadStream()))
                {
                    while (reader.Peek() >= 0)
                        result.AppendLine(reader.ReadLine());
                }
                ExportPackage package = EbSerializers.Json_Deserialize<ExportPackage>(result.ToString());
                if (package != null)
                {
                    ImportApplicationResponse res = ServiceClient.Post<ImportApplicationResponse>(new ImportApplicationMqRequest
                    {
                        IsDemoApp = false,
                        SelectedSolutionId = ViewBag.cid,
                        Package = package,
                        UserId = this.ViewBag.uid,
                        UserAuthId = ViewBag.UAuthId,
                        WhichConsole = ViewBag.wc
                    });
                    message = "Success";
                }
            }

            catch (Exception e)
            {
                message = "Something went wrong";
            }
            return message;
        }



        public IActionResult Export(ExportPackageCollection App)
        {
            ExportApplicationResponse res = ServiceClient.Post<ExportApplicationResponse>(new ExportApplicationMqRequest
            {
                AppCollection = App.appColl,
                PackageName = App.packName,
                PackageDescription = App.packDesc,
                PackageIcon = App.packIcon,
                MasterSoln = App.MasterSoln
            });
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
                return true;
            }
            else
            {
                return false;
            }
        }

        public IActionResult ExportOSE(string _objdict, string Appdict)
        {
            Dictionary<int, ObjectVersionsDictionary> AppObjMap = new Dictionary<int, ObjectVersionsDictionary>();
            ObjectVersionsDictionary objdict = null;
            Dictionary<int, List<string>> appIdObjIdCollection = JsonConvert.DeserializeObject<Dictionary<int, List<string>>>(_objdict);
            Dictionary<int, string> appNameCollection = JsonConvert.DeserializeObject<Dictionary<int, string>>(Appdict);
            String ids = String.Join(", ", appIdObjIdCollection.Select(x => String.Join(", ", x.Value)));
            EbObjectObjListAllVerResponse resultlist = ServiceClient.Get(new EbAllObjNVerRequest { ObjectIds = ids });
            foreach (KeyValuePair<int, List<string>> app in appIdObjIdCollection)
            {
                if (!AppObjMap.ContainsKey(app.Key))
                {
                    objdict = new ObjectVersionsDictionary();
                    AppObjMap.Add(app.Key, objdict);
                }
                foreach (string objid in app.Value)
                {
                    if (resultlist.Data.ContainsKey(objid) && !objdict.ContainsKey(Convert.ToInt32(objid)))
                        objdict.Add(Convert.ToInt32(objid), resultlist.Data[objid]);
                }
            }
            ViewBag.AppObjMap = AppObjMap;
            ViewBag.appNameCollection = appNameCollection;
            GetPrimarySolutionsResponse result = this.ServiceClient.Get<GetPrimarySolutionsResponse>(new GetPrimarySolutionsRequest());
            ViewBag.PrimarySolutions = result.PrimarySolutions;
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