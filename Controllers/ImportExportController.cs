using System;
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
        public void Export(string _refid)
        {
            int app_id = 1;
            OrderedDictionary ObjDictionary = new OrderedDictionary();
            EbObject obj = GetObjfromDB(_refid);
            GetApplicationResponse appRes = ServiceClient.Get(new GetApplicationRequest { Id = app_id });
            AppWrapper AppObj = appRes.AppInfo;
            AppObj.ObjCollection = new List<EbObject>();
            obj.DiscoverRelatedObjects(ServiceClient, ObjDictionary);

            #region MyRegion
            //if (obj is EbWebForm)
            //{
            //    EbWebForm _o = obj as EbWebForm;
            //    foreach (EbControl control in _o.Controls)
            //    {
            //        PropertyInfo[] _props = control.GetType().GetProperties();
            //        foreach (PropertyInfo _prop in _props)
            //        {
            //            if (_prop.IsDefined(typeof(OSE_ObjectTypes)))
            //                ObjectCollection.Add(GetObjfromDB(_prop.GetValue(obj, null).ToString()));
            //        }
            //    }
            //}
            //if (obj is EbBotForm)
            //{
            //    EbBotForm _o = obj as EbBotForm;
            //    foreach (EbControl control in _o.Controls)
            //    {
            //        PropertyInfo[] _props = control.GetType().GetProperties();
            //        foreach (PropertyInfo _prop in _props)
            //        {
            //            if (_prop.IsDefined(typeof(OSE_ObjectTypes)))
            //                ObjectCollection.Add(GetObjfromDB(_prop.GetValue(obj, null).ToString()));
            //        }
            //    }
            //} 
            #endregion
            var ObjectList= ObjDictionary.Values;
            foreach (var item in ObjectList)
            {
                AppObj.ObjCollection.Add(item as EbObject);
            }
            string stream = EbSerializers.Json_Serialize(AppObj);
            using (System.IO.StreamWriter file = new System.IO.StreamWriter(@"E:\ExportFile.txt"))
            {
                file.WriteLine(stream);
            }
        }

        public void Import()
        {
            Dictionary<string, string> RefidMap = new Dictionary<string, string>();
            string text = System.IO.File.ReadAllText(@"E:\ExportFile.txt");
            AppWrapper AppObj = (AppWrapper)EbSerializers.Json_Deserialize(text);
            List<EbObject> ObjectCollection = AppObj.ObjCollection;
            CreateApplicationResponse appres = ServiceClient.Post(new CreateApplicationDevRequest
            {
                AppName = AppObj.Name + "(7)",
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

                if (obj is EbDataSource)
                {
                    string fdid = (obj as EbDataSource).FilterDialogRefId;
                    if (RefidMap.ContainsKey(fdid))
                        (obj as EbDataSource).FilterDialogRefId = RefidMap[fdid];
                    else
                        (obj as EbDataSource).FilterDialogRefId = "failed-to-update-";
                }

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
                    SourceSolutionId = (obj.RefId.Split("-"))[0]
                };
                EbObject_Create_New_ObjectResponse res = ServiceClient.Post(ds);
                RefidMap[obj.RefId] = res.RefId;
            }

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