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
        [HttpPost]
        public void ShareToPublic()
        {
            var req = HttpContext.Request.Form;
            var y = req;
        }

        public void Export2(string refids)
        {
            ExportApplicationResponse res = ServiceClient.Post<ExportApplicationResponse>(new ExportApplicationRequest { Refids = refids });
        }

        public void Import2(int Id)
        {
            ImportApplicationResponse res = ServiceClient.Get<ImportApplicationResponse>(new ImportApplicationRequest { Id = Id });
        }
    }
}