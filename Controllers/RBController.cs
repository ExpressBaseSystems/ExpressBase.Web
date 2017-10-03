using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ServiceStack.Redis;
using ExpressBase.Common;
using ExpressBase.Common.Objects;
using ExpressBase.Objects;
using ExpressBase.Objects.ReportRelated;
using System.Reflection;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class RBController : EbBaseNewController
    {
        public RBController(IServiceClient _client, IRedisClient _redis) : base (_client, _redis) { }

        [HttpGet]
        public IActionResult ReportBuilder()
        {
            var typeArray = typeof(EbReportObject).GetTypeInfo().Assembly.GetTypes();

            var _jsResult = CSharpToJs.GenerateJs<EbReportObject>(BuilderType.Report, typeArray);

     
            ViewBag.Meta = _jsResult.Meta;
            ViewBag.JsObjects = _jsResult.JsObjects;
            //ViewBag.ReportSections = _jsResult.ReportSections;
            ViewBag.EbObjectTypes = _jsResult.EbObjectTypes;

            ViewBag.IsNew = "true";
            return View();
        }

        [HttpPost]
        public IActionResult ReportBuilder(int i)
        {
            
            ViewBag.Header = "Edit Report";
            var req = this.HttpContext.Request.Form;
            int obj_id = Convert.ToInt32(req["objid"]);
            ViewBag.Obj_id = obj_id;
            var resultlist = this.ServiceClient.Get<EbObjectExploreObjectResponse>(new EbObjectExploreObjectRequest { Id = obj_id });
            var rlist = resultlist.Data;
            foreach (var element in rlist)
            {
                ObjectLifeCycleStatus[] array = (ObjectLifeCycleStatus[])Enum.GetValues(typeof(ObjectLifeCycleStatus));
                List<ObjectLifeCycleStatus> lifeCycle = new List<ObjectLifeCycleStatus>(array);
                ViewBag.LifeCycle = lifeCycle;
                ViewBag.IsNew = "false";
                ViewBag.Objtype = EbObjectType.Report;
                ViewBag.ObjectName = element.Name;
                ViewBag.ObjectDesc = element.Description;
                ViewBag.Status = element.Status;
                ViewBag.VersionNumber = element.VersionNumber;
                ViewBag.Icon = "fa fa-database";
                ViewBag.ObjType = (int)EbObjectType.Report;
                ViewBag.Refid = element.RefId;
                ViewBag.Majorv = element.MajorVersionNumber;
                ViewBag.Minorv = element.MinorVersionNumber;
                ViewBag.Patchv = element.PatchVersionNumber;
                if (String.IsNullOrEmpty(element.Json_wc) && !String.IsNullOrEmpty(element.Json_lc))
                {
                    EbReport dsobj = EbSerializers.Json_Deserialize<EbReport>(element.Json_lc);
                    ViewBag.Name = dsobj.Name;
                    ViewBag.Json = element.Json_lc;
                    //ViewBag.html = dsobj.GetHtml();
                }
                else
                {
                    EbReport dsobj = EbSerializers.Json_Deserialize<EbReport>(element.Json_wc);
                    ViewBag.Name = dsobj.Name;
                    ViewBag.Json = element.Json_wc;
                    //ViewBag.html = dsobj.GetHtml();
                }
            }
            return View();
        }

        [HttpPost]
        public DataSourceColumnsResponse GetColumns(String refID)
        {
            DataSourceColumnsResponse cresp = new DataSourceColumnsResponse();
            cresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", refID));
            foreach (var columnCollection in cresp.Columns)
            {
                columnCollection.Sort(CompareEbDataColumn);
            }

            return cresp;
        }

        private int CompareEbDataColumn(object a, object b)
        {
            return (a as EbDataColumn).ColumnName.CompareTo((b as EbDataColumn).ColumnName);
        }

        public EbObject_Create_New_ObjectResponse CommitReport()
        {
            var req = this.HttpContext.Request.Form;
            var jsonD = EbSerializers.Json_Deserialize<EbReport>(req["json"]);
            ViewBag.IsNew = "false";

            return this.ServiceClient.Post<EbObject_Create_New_ObjectResponse>(
                new EbObject_Create_New_ObjectRequest
                {
                    IsSave = false,
                    RefId = req["id"],
                    EbObjectType = (int)EbObjectType.Report,
                    Name = req["name"],
                    Description = req["description"],
                    Json = req["json"],
                    Status = ObjectLifeCycleStatus.Development,
                    UserId = ViewBag.UId,
                    Relations = req["rel_obj"]
                });
        }
    }
}
