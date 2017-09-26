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
            ViewBag.IsNew = "false";
            return View();
        }

        [HttpPost]
        public DataSourceColumnsResponse GetColumns(String refID)
        {
            DataSourceColumnsResponse cresp = new DataSourceColumnsResponse();
            cresp = this.Redis.Get<DataSourceColumnsResponse>(string.Format("{0}_columns", refID));
            foreach(var columnCollection in cresp.Columns)
            {
                columnCollection.Sort(CompareEbDataColumn);
            }

            return cresp;
        }

        private int CompareEbDataColumn(object a, object b)
        {
            return (a as EbDataColumn).ColumnName.CompareTo((b as EbDataColumn).ColumnName);
        }
        public EbObjectSaveOrCommitResponse CommitReport()
        {
            var req = this.HttpContext.Request.Form;
            var ds = new EbObjectSaveOrCommitRequest();
            ds.IsSave = false;
            ds.RefId = req["id"];
            ds.EbObjectType = (int)EbObjectType.Report;
            ds.Name = req["name"];
            ds.Description = req["description"];
            ds.Json = req["json"];
            //ds.EbObject = EbSerializers.Json_Deserialize<EbDataSource>(req["json"]);
            //(ds.EbObject as EbDataSource).EbObjectType = EbObjectType.DataSource;
            ds.Status = ObjectLifeCycleStatus.Live;
            ds.UserId = ViewBag.UId;
            ds.ChangeLog = req["changeLog"];
            ds.Relations = req["rel_obj"];
            ViewBag.IsNew = "false";

            return this.ServiceClient.Post<EbObjectSaveOrCommitResponse>(ds);

        }
    }
}
