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
        public void Export(string _refids)
        {
            int app_id = 1;
            OrderedDictionary ObjDictionary = new OrderedDictionary();
            GetApplicationResponse appRes = ServiceClient.Get(new GetApplicationRequest { Id = app_id });
            AppWrapper AppObj = appRes.AppInfo;
            AppObj.ObjCollection = new List<EbObject>();
            string[] refs = _refids.Split(",");
            foreach (string _refid in refs)
            {
                EbObject obj = GetObjfromDB(_refid);
                obj.DiscoverRelatedObjects(ServiceClient, ObjDictionary);
            }
            ICollection ObjectList = ObjDictionary.Values;
            foreach (object item in ObjectList)
            {
                AppObj.ObjCollection.Add(item as EbObject);
            }
            string stream = EbSerializers.Json_Serialize(AppObj);
            SaveToAppStoreResponse x = ServiceClient.Post(new SaveToAppStoreRequest
            {
                Store = new AppStore
                {
                    Name = AppObj.Name,
                    Cost = 1000,
                    Currency = "USD",
                    Json = stream,
                    Status = 1,
                    AppType = 1,
                    Description = AppObj.Description,
                    Icon = AppObj.Icon
                }
            });
        }

        public void Import()
        {
            Dictionary<string, string> RefidMap = new Dictionary<string, string>();
            GetOneFromAppstoreResponse resp = ServiceClient.Get(new GetOneFromAppStoreRequest { Id = 6 });
            AppWrapper AppObj = resp.Wrapper;
            List<EbObject> ObjectCollection = AppObj.ObjCollection;
            CreateApplicationResponse appres = ServiceClient.Post(new CreateApplicationDevRequest
            {
                AppName = AppObj.Name + "(roby103)",
                AppType = AppObj.AppType,
                Description = AppObj.Description,
                AppIcon = AppObj.Icon
            });
            for (int i = ObjectCollection.Count - 1; i >= 0; i--)
            {
                UniqueObjectNameCheckResponse uniqnameresp;
                EbObject obj = ObjectCollection[i];

                do
                {
                    uniqnameresp = ServiceClient.Get(new UniqueObjectNameCheckRequest { ObjName = obj.Name });
                    if (!uniqnameresp.IsUnique)
                        obj.Name = obj.Name + "(1)";
                }
                while (!uniqnameresp.IsUnique);

                obj.ReplaceRefid(RefidMap);
                EbObject_Create_New_ObjectRequest ds = new EbObject_Create_New_ObjectRequest
                {
                    Name = obj.Name,
                    Description = obj.Description,
                    Json = EbSerializers.Json_Serialize(obj),
                    Status = ObjectLifeCycleStatus.Dev,
                    Relations = "_rel_obj",
                    IsSave = false,
                    Tags = "_tags",
                    Apps = appres.id.ToString(),
                    SourceSolutionId = (obj.RefId.Split("-"))[0],
                    SourceObjId = (obj.RefId.Split("-"))[3],
                    SourceVerID = (obj.RefId.Split("-"))[4]
                };
                EbObject_Create_New_ObjectResponse res = ServiceClient.Post(ds);
                RefidMap[obj.RefId] = res.RefId;
            }
        }
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
    }
}