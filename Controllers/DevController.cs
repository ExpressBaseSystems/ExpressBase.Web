using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpressBase.Web.Filters;
using Microsoft.Extensions.Options;
using ExpressBase.Web2;
using ServiceStack;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Objects;
using ExpressBase.Common;
using ServiceStack.Text;
using System.Net;
// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class DevController : EbBaseController
    {

        public DevController(IOptionsSnapshot<EbSetupConfig> ss_settings) : base(ss_settings) { }

        // GET: /<controller>/
        public IActionResult Index()
        {
            //return RedirectToAction("DevSignIn");
           return View();
        }

        public IActionResult DevConsole()
        {
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }

        public IActionResult objects()
        {
            ViewBag.EbConfig = this.EbConfig;
            return View();
        }

        public IActionResult DSList()
        {

            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);

            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            var rlist = resultlist.Data;
            Dictionary<int, EbObjectWrapper> ObjList = new Dictionary<int, EbObjectWrapper>();
            foreach (var element in rlist)
            {
                if (element.EbObjectType == ExpressBase.Objects.EbObjectType.DataSource)
                {
                    ObjList[element.Id] = element;
                }
            }
            ViewBag.DSList = ObjList;
            return View();
        }

        [HttpGet]
        public IActionResult code_editor()
        {
            ViewBag.VersionNumber = 1;
            ViewBag.Obj_id = 0;
            ViewBag.IsNew = "true";
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(ViewBag.Obj_id), TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            var rlist = resultlist.Data;
            ViewBag.EditorHint = "CodeMirror.hint.sql";
            ViewBag.EditorMode = "text/x-sql";
            ViewBag.Icon = "fa fa-database";
            ViewBag.ObjType = (int)EbObjectType.DataSource;
            // list filter dialogs
            IServiceClient fdclient = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var fdresultlist = fdclient.Get<EbObjectResponse>(new EbObjectRequest { TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            var fdrlist = fdresultlist.Data;
            Dictionary<int, EbObjectWrapper> filterDialogs = new Dictionary<int, EbObjectWrapper>();
            foreach (var element in fdrlist)
            {
                if (element.EbObjectType == EbObjectType.FilterDialog)
                {
                    filterDialogs[element.Id] = element;
                }
            }
            ViewBag.FilterDialogs = filterDialogs;
            return View();
        }

        [HttpPost]
        public IActionResult code_editor(int i)
        {
            ViewBag.Obj_id = HttpContext.Request.Form["objid"];

            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(ViewBag.Obj_id), TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            var rlist = resultlist.Data;
            foreach (var element in rlist)
            {
                ObjectLifeCycleStatus[] array = (ObjectLifeCycleStatus[])Enum.GetValues(typeof(ObjectLifeCycleStatus));
                List<ObjectLifeCycleStatus> lifeCycle = new List<ObjectLifeCycleStatus>(array);
                ViewBag.LifeCycle = lifeCycle;
                ViewBag.IsNew = "false";
                if (element.EbObjectType == ExpressBase.Objects.EbObjectType.DataSource)
                {
                    var dsobj = EbSerializers.ProtoBuf_DeSerialize<EbDataSource>(element.Bytea);
                    ViewBag.ObjectName = element.Name;
                    ViewBag.ObjectDesc = element.Description;
                    ViewBag.Code = dsobj.Sql;
                    ViewBag.Status = element.Status;
                    ViewBag.VersionNumber = element.VersionNumber;
                    ViewBag.EditorHint = "CodeMirror.hint.sql";
                    ViewBag.EditorMode = "text/x-sql";
                    ViewBag.Icon = "fa fa-database";
                    ViewBag.ObjType = (int)EbObjectType.DataSource;
                }
                if (element.EbObjectType == ExpressBase.Objects.EbObjectType.JavascriptFunction)
                {

                }
            }
            // list filter dialogs
            IServiceClient fdclient = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var fdresultlist = fdclient.Get<EbObjectResponse>(new EbObjectRequest { TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            var fdrlist = fdresultlist.Data;
            Dictionary<int, EbObjectWrapper> filterDialogs = new Dictionary<int, EbObjectWrapper>();
            foreach (var element in fdrlist)
            {
                if (element.EbObjectType == EbObjectType.FilterDialog)
                {
                    filterDialogs[element.Id] = element;
                }
            }
            ViewBag.FilterDialogs = filterDialogs;
            return View();
        }

        public JsonResult CommitEbDataSource()
        {
            var req = this.HttpContext.Request.Form;
            var _dict = JsonSerializer.DeserializeFromString<Dictionary<string, string>>(req["Colvalues"]);
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var ds = new EbObjectWrapper();
            if (_dict["id"] == "0")
            {
                ds.Id = 0;
                ds.ChangeLog = "";
            }
            else
            {
                ds.Id = Convert.ToInt32(_dict["id"]);
                ds.ChangeLog = _dict["changeLog"];
            }
            ds.Token = ViewBag.token;
            ds.TenantAccountId = _dict["tcid"];
            ds.EbObjectType = Objects.EbObjectType.DataSource;
            ds.Name = _dict["name"];
            ds.Description = _dict["description"];
            ds.Status = Objects.ObjectLifeCycleStatus.Live;
            ds.Bytea = EbSerializers.ProtoBuf_Serialize(new EbDataSource
            {
                Name = _dict["name"],
                Description = _dict["description"],
                Sql = _dict["code"],
                ChangeLog = ds.ChangeLog,
                EbObjectType = EbObjectType.DataSource
            });
            ViewBag.IsNew = "false";
            using (client.Post<HttpWebResponse>(ds)) { }
            return Json("Success");
        }

        public IActionResult ds_save()
        {
            return View();
        }

        public JsonResult SaveEbDataSource()
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var ds = new EbObjectWrapper();
            ds.IsSave = req["isSave"];
            ds.Token = ViewBag.token;
            ds.TenantAccountId = ViewBag.cid;
            ds.Id = Convert.ToInt32(req["Id"]);
            ds.VersionNumber = Convert.ToInt32(req["VersionNumber"]);
            ds.Name = req["Name"];
            ds.Description = req["Description"];
            ds.Bytea = EbSerializers.ProtoBuf_Serialize(new EbDataSource
            {
                Name = req["Name"],
                Description = req["Description"],
                Sql = req["Code"],
                EbObjectType = EbObjectType.DataSource
            });
            ds.Token = ViewBag.token;
            ViewBag.IsNew = "false";
            using (client.Post<HttpWebResponse>(ds)) { }
            return Json("Success");
        }

        public List<EbObjectWrapper> GetVersions()
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(req["Id"]), TenantAccountId = ViewBag.cid, Token = ViewBag.token, GetAllVer = true });
            var rlist = resultlist.Data;
            //List<EbObjectWrapper> ObjList = new List<EbObjectWrapper>();
            //foreach (var element in rlist)
            //{
            //     ObjList.Add(element);

            //}
            return rlist;
        }
    }
}
