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
using ExpressBase.Data;
using DiffPlex;
using DiffPlex.DiffBuilder;
using DiffPlex.DiffBuilder.Model;
using System.Text;
using ExpressBase.Objects.Objects;
using Newtonsoft.Json;
using ExpressBase.Objects.ObjectContainers;
using ExpressBase.Common.Objects.Attributes;
using ServiceStack.Redis;
using ExpressBase.Common.Objects;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class DevController : EbBaseNewController
    {

        public DevController(IServiceClient _client, IRedisClient _redis) : base(_client, _redis) { }

        // GET: /<controller>/
        public IActionResult Index()
        {
            //return RedirectToAction("DevSignIn");
            return View();
        }

        public IActionResult DevConsole()
        {

            return View();
        }

        public IActionResult objects()
        {
            return View();
        }



        [HttpGet]
        public IActionResult Eb_formBuilder()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Eb_formBuilder(int i)
        {
            var req = this.HttpContext.Request.Form;
            ViewBag.Objtype = req["objtype"];
            ViewBag.Objid = req["objid"];

            BuilderType _BuilderType = (BuilderType)Convert.ToInt32(ViewBag.Objtype);

            EbObjectWrapper FormObj = GetFormObj(req["objid"].ToString(), Convert.ToInt32(req["objtype"]));
            ViewBag.Json = FormObj.Json;
            ViewBag.Name = FormObj.Name;
            ViewBag.html = GetHtml2Render(_BuilderType, ViewBag.Objid);
            return View();

        }

        public string SaveFormBuilder()
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.ServiceClient;
            var ds = new EbObjectFirstCommitRequest();


            ds.EbObjectType = Convert.ToInt32(req["obj_type"]);
            ds.Name = req["name"];
            ds.Description = req["description"];
            ds.Json = req["filterdialogjson"];

            //if (ds.EbObjectType == 0)
            //   ds.EbObject = EbSerializers.Json_Deserialize<EbForm>(req["filterdialogjson"]);
            //else if (ds.EbObjectType == 12)
            //{
            //    ds.EbObject = EbSerializers.Json_Deserialize<EbFilterDialog>(req["filterdialogjson"]);
            //    (ds.EbObject as EbFilterDialog).EbObjectType = EbObjectType.WebForm;
            //}

            //(ds.EbObject as EbFilterDialog).EbObjectType = EbObjectType.FilterDialog;
            ds.Status = ObjectLifeCycleStatus.Live;
            ds.Token = ViewBag.token;
            ds.TenantAccountId = ViewBag.cid;
            ds.Relations = "";          

            var CurrSaveId = client.Post<EbObjectFirstCommitResponse>(ds);
            return CurrSaveId.RefId;
        }

        //Jith Builder related
        private string GetHtml2Render(BuilderType type, string objid)
        {
            IServiceClient client = this.ServiceClient;
            var resultlist = client.Get<EbObjectLatestCommitedResponse>(new EbObjectLatestCommitedRequest { RefId = objid});
            var rlist = resultlist.Data[0];
            string _html = string.Empty;

            EbControlContainer _form = null;
            if (type == BuilderType.FilterDialog)
                _form = EbSerializers.Json_Deserialize<EbFilterDialog>(rlist.Json) as EbControlContainer;
            else if (type == BuilderType.WebForm)
                _form = EbSerializers.Json_Deserialize<EbForm>(rlist.Json) as EbControlContainer;


            if (_form != null)
                _html += _form.GetHtml();

            return _html;
        }

        public EbObjectWrapper GetFormObj(string objId, int objType)
        {
            IServiceClient client = this.ServiceClient;
            var resultlist = client.Get<EbObjectLatestCommitedResponse>(new EbObjectLatestCommitedRequest { RefId = objId});
            var rlist = resultlist.Data[0];
            return rlist;
        }

        
        public IActionResult EbObjectList(EbObjectType type)
        {
            ViewBag.EbObjectType = (int)type;

            IServiceClient client = this.ServiceClient;

            var resultlist = client.Get<EbObjectObjListResponse>(new EbObjectObjListRequest { EbObjectType = (int)type});
            var rlist = resultlist.Data;

            Dictionary<int, EbObjectWrapper> ObjList = new Dictionary<int, EbObjectWrapper>();

            foreach (var element in rlist)
            {
                if (element.EbObjectType == type)
                    ObjList[element.Id] = element;
            }

            ViewBag.Objlist = ObjList;

            if (ViewBag.isAjaxCall)
                return PartialView();
            else
                return View();
        }

        [HttpGet]
        public IActionResult CreateApplication()
        {
            return View();
        }

        [HttpPost]
        public IActionResult CreateApplication(int i)
        {
            //var req = this.HttpContext.Request.Form;

            //IServiceClient client = this.ServiceClient;
            //ViewBag.Header = "Edit Application";
            //int obj_id = Convert.ToInt32(req["objid"]);
            //ViewBag.Obj_id = obj_id;
            //var resultlist = client.Get<EbObjectlatestco>(new EbObjectRequest { Id = obj_id/*, VersionId = null*/, EbObjectType = (int)EbObjectType.Application, Token = ViewBag.token });
            //var rlist = resultlist.Data;
            //foreach (var element in rlist)
            //{
            //    ObjectLifeCycleStatus[] array = (ObjectLifeCycleStatus[])Enum.GetValues(typeof(ObjectLifeCycleStatus));
            //    List<ObjectLifeCycleStatus> lifeCycle = new List<ObjectLifeCycleStatus>(array);
            //    ViewBag.LifeCycle = lifeCycle;
            //    ViewBag.IsNew = "false";
            //    var dsobj = EbSerializers.Json_Deserialize<EbApplication>(element.Json);
            //    ViewBag.ObjectName = element.Name;
            //    ViewBag.ObjectDesc = element.Description;
            //    ViewBag.ObjType = (int)EbObjectType.Application;

            //}

            return View();
        }

        public IActionResult CreateApplicationModule()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public JsonResult SaveApplications()
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.ServiceClient;
            ViewBag.Header = "Create Application";
            var ds = new EbObjectSaveOrCommitRequest();
            ds.IsSave = false;
            ds.RefId = (string.IsNullOrEmpty(req["objid"])) ? string.Empty : req["objid"].ToString();           //Convert.ToInt32(_dict["id"]);//remember to pass 0 or value from view
            ds.EbObjectType = (int)EbObjectType.Application;
            ds.Name = req["name"];
            ds.Description = req["description"];
            ds.Json = EbSerializers.Json_Serialize(new EbApplication
            {
                Name = req["name"],
                EbObjectType = EbObjectType.Application
            });
            ds.Status = ObjectLifeCycleStatus.Live;
            ds.TenantAccountId = ViewBag.cid;
            ds.ChangeLog = "";
            ds.Relations = null;
            ds.Token = ViewBag.token;//removed tcid

            ViewBag.IsNew = "false";
            var res = client.Post<EbObjectSaveOrCommitResponse>(ds);
            if (res.Id > 0)
            {
                return Json("Success");
            }
            else
            {
                return Json("Failed");
            }
        }

        public IActionResult DevLogout()
        {
            ViewBag.Fname = null;
            IServiceClient client = this.ServiceClient;
            var abc = client.Post(new Authenticate { provider = "logout", Meta = new Dictionary<string, string> { { "wc", ViewBag.wc }, { "cid", ViewBag.cid } } });
            HttpContext.Response.Cookies.Delete("Token");
            HttpContext.Response.Cookies.Delete("rToken");
            return RedirectToAction("DevSignIn", "Ext");

        }
        public IActionResult ReportBuilder()
        {
            IServiceClient client = this.ServiceClient;
            var resultlist = client.Get<EbObjectObjListResponse>(new EbObjectObjListRequest {EbObjectType = 2 });
            var rlist = resultlist.Data;
            Dictionary<int, EbObjectWrapper> ObjList = new Dictionary<int, EbObjectWrapper>();
            foreach (var element in rlist)
            {
                ObjList[element.Id] = element;
            }
            ViewBag.Objlist = ObjList;
            return View();
        }
        [HttpGet]
        public IActionResult Eb_EmailBuilder()
        {
            ViewBag.Header = "New Email Template";
            ViewBag.VersionNumber = 1;
            ViewBag.Obj_id = null;
            ViewBag.IsNew = "true";
            ViewBag.EditorHint = "CodeMirror.hint.sql";
            ViewBag.EditorMode = "text/x-sql";
            ViewBag.Icon = "fa fa-database";
            ViewBag.ObjType = (int)EbObjectType.EmailBuilder;
            ViewBag.ObjectName = "*Untitled";
            ViewBag.FilterDialogId = "null";
            //ViewBag.SqlFns = Getsqlfns((int)EbObjectType.SqlFunction);
            return View();
          
        }

        [HttpPost]
        public IActionResult Eb_EmailBuilder(string Htmlcode)
        {
       
            
          //  return CurrSaveId.RefId;
            return View();
        }

        public string EmailTemplateSave()
        {
            IServiceClient client = this.ServiceClient;
            var req = this.HttpContext.Request.Form;
            var ds = new EbObject_Create_New_ObjectRequest();


            ds.EbObjectType = (int)EbObjectType.EmailBuilder;
            ds.Name = req["Name"];
            ds.Description = req["Description"];
            ds.Json = EbSerializers.Json_Serialize(new EbEmailBuilder
            {
                Name = req["name"],
                EbObjectType = EbObjectType.EmailBuilder,
                html = req["Htmlcode"],


            });


            //(ds.EbObject as EbFilterDialog).EbObjectType = EbObjectType.FilterDialog;
            ds.Status = ObjectLifeCycleStatus.Live;
            ds.Token = ViewBag.token;
            ds.TenantAccountId = ViewBag.cid;
            ds.Relations = "";

            var CurrSaveId = client.Post<EbObject_Create_New_ObjectResponse>(ds);

            return CurrSaveId.RefId.ToString();
        }
    }
}
