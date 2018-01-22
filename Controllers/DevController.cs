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
using Microsoft.AspNetCore.Routing;
using ExpressBase.Common.JsonConverters;
using System.Reflection;
using ExpressBase.Objects.EmailRelated;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class DevController : EbBaseIntController
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
             //var result = this.ServiceClient.Post<EbDbCreateResponse>(new EbDbCreateRequest { dbName = "TESTDB" });
            var resultlist = this.ServiceClient.Post<TestResponse>(new TestRequest { });
           // var x = resultlist;
            return View();
        }

        public IActionResult objects()
        {
            return View();
        }

        public IActionResult ListApplications()
        {

            IServiceClient client = this.ServiceClient;
            var resultlist = client.Get<GetApplicationResponse>(new GetApplicationRequest());
            ViewBag.dict = resultlist.Data;
            return View();
        }


        [HttpGet]
        public IActionResult Eb_formBuilder()
        {
            ViewBag.ObjType = this.HttpContext.Request.Query["objtype"];
            return View();
        }

        public IActionResult Eb_ChatFormBuilder()
        {
            ViewBag.ObjType = this.HttpContext.Request.Query["objtype"];
            return View();
        }

        [HttpPost]
        public IActionResult Eb_formBuilder(int i, int objtype)
        {
            //var req = this.HttpContext.Request.Form;
            //ViewBag.Objtype = req["objtype"];
            //ViewBag.Objid = req["objid"];

            //BuilderType _BuilderType = (BuilderType)Convert.ToInt32(ViewBag.Objtype);

            //EbObjectWrapper FormObj = GetFormObj(req["objid"].ToString(), Convert.ToInt32(req["objtype"]));
            //ViewBag.Json = FormObj.Json;
            //ViewBag.Name = FormObj.Name;
            //ViewBag.html = GetHtml2Render(_BuilderType, ViewBag.Objid);
            //return View();

            //================

            ViewBag.Header = "Edit WebForm";
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
                ViewBag.ObjType = objtype;
                ViewBag.ObjectName = element.Name;
                ViewBag.ObjectDesc = element.Description;
                ViewBag.Status = element.Status;
                ViewBag.VersionNumber = element.VersionNumber;
                ViewBag.Icon = "fa fa-database";
                ViewBag.Refid = element.RefId;
                ViewBag.Majorv = element.Dashboard_Tiles.MajorVersionNumber;
                ViewBag.Minorv = element.Dashboard_Tiles.MinorVersionNumber;
                ViewBag.Patchv = element.Dashboard_Tiles.PatchVersionNumber;

                if (String.IsNullOrEmpty(element.Json_wc) && !String.IsNullOrEmpty(element.Json_lc))
                {
                    EbWebForm dsobj = EbSerializers.Json_Deserialize<EbWebForm>(element.Json_lc);
                    ViewBag.Name = dsobj.Name;
                    ViewBag.Json = element.Json_lc;
                    ViewBag.html = dsobj.GetHtml();
                }
                else
                {
                    EbWebForm dsobj = EbSerializers.Json_Deserialize<EbWebForm>(element.Json_wc);
                    ViewBag.Name = dsobj.Name;
                    ViewBag.Json = element.Json_wc;
                    ViewBag.html = dsobj.GetHtml();
                }
            }

            return View();
        }

        public string CommitFormBuilder()
        {
            var req = this.HttpContext.Request.Form;
            string refid;
            if (string.IsNullOrEmpty(req["id"]))
            {
                var ds = new EbObject_Create_New_ObjectRequest();
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
                ds.Status = ObjectLifeCycleStatus.Dev;
                ds.Relations = "";
                ds.IsSave = false;

                var res = ServiceClient.Post<EbObject_Create_New_ObjectResponse>(ds);
                refid = res.RefId;

            }
            else
            {
                var ds = new EbObject_CommitRequest();
                ds.EbObjectType = Convert.ToInt32(req["obj_type"]);
                ds.Name = req["name"];
                ds.Description = req["description"];
                ds.Json = req["filterdialogjson"];
                ds.Relations = "";
                ds.RefId = req["id"];
                ds.ChangeLog = "";
                var res = ServiceClient.Post<EbObject_CommitResponse>(ds);
                refid = res.RefId;
            }

            return refid;
        }

        public string SaveFormBuilder()
        {
            var req = this.HttpContext.Request.Form;
            string refid;
            if (string.IsNullOrEmpty(req["id"]))
            {
                var ds = new EbObject_Create_New_ObjectRequest();
                ds.EbObjectType = Convert.ToInt32(req["obj_type"]);
                ds.Name = req["name"];
                ds.Description = req["description"];
                ds.Json = req["filterdialogjson"];
                ds.Status = ObjectLifeCycleStatus.Dev;
                ds.Relations = "";
                ds.IsSave = true;

                var res = ServiceClient.Post<EbObject_Create_New_ObjectResponse>(ds);
                refid = res.RefId;
            }
            else
            {

                var ds = new EbObject_SaveRequest();
                ds.RefId = req["Id"];
                ds.Name = req["Name"];
                ds.Description = req["Description"];
                ds.EbObjectType = Convert.ToInt32(req["obj_type"]);
                ds.Json = req["filterdialogjson"];
                ds.Relations = "";
                ViewBag.IsNew = "false";
                var res = this.ServiceClient.Post<EbObject_SaveResponse>(ds);
                refid = res.RefId;
            }
            return refid;
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
                _form = EbSerializers.Json_Deserialize<EbWebForm>(rlist.Json) as EbControlContainer;


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

            var resultlist = client.Get<EbObjectListResponse>(new EbObjectListRequest { EbObjectType = (int)type});
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

        public string GetObjectList(EbObjectType type)
        {
            IServiceClient client = this.ServiceClient;

            var resultlist = client.Get<EbObjectListResponse>(new EbObjectListRequest { EbObjectType = (int)type });
            var rlist = resultlist.Data;

            Dictionary<int, EbObjectWrapper> ObjList = new Dictionary<int, EbObjectWrapper>();
            var html = string.Empty;
            foreach (var element in rlist)
            {
                html += @"<a href='../Eb_Object/Index?objid="+ element.Id+ @"&objtype=" + (int)type + @"'>
                <div class='col-md-6 objitems' name='objBox'>
                    <div class='col-md-1 obj-icon'>
                        <div class='obj-ic-cir'>
                            <i class='fa fa-file-text' aria-hidden='true'></i>
                        </div>
                    </div>
                    <div class='col-md-10'>
                        <h4 name='head4' style='color:black;'>"+ element .Name+ @"</h4>
                        <p class='text-justify'>"+element.Description+@"</p>
                        <a id='labels'>
                            <span name='Version' class='label label-default'>v "+element.VersionNumber+@"</span>
                            <span name='Application' class='label objbox-label'>"+ type + @"</span>
                        </a>
                    </div>
                    <div class='col-md-1 objbox-footer'>
                        <input type='button' class='btn fa-input fa-lg' value='&#xf054;' style='font-family: FontAwesome;background: transparent;'>
                    </div>
                </div></a>";
            }
            return html;
            
        }

        [HttpGet][HttpPost]
        public IActionResult CreateApplication(int itemid)
        {
            if(itemid > 0)
            {
                IServiceClient client = this.ServiceClient;
                var resultlist = client.Get<GetApplicationResponse>(new GetApplicationRequest { id = itemid });
                ViewBag.applicationname = resultlist.Data["applicationname"];
                ViewBag.description = resultlist.Data["description"];
                ViewBag.Obj_id = itemid;
            }
            else
            {
                ViewBag.applicationname = "";
                ViewBag.description = "";
                ViewBag.Obj_id = "";
            }
            return View();
        }


        //public IActionResult CreateApplication(int i)
        //{
        //    var req = this.HttpContext.Request.Form;

        //    IServiceClient client = this.ServiceClient;
        //    var resultlist = client.Get<GetApplicationResponse>(new GetApplicationRequest{ id =Convert.ToInt32(req["itemid"]) });
        //    ViewBag.applicationname = resultlist.Data["applicationname"];
        //    ViewBag.description = resultlist.Data["description"];
        //    ViewBag.Obj_id = req["itemid"];
        //    return View();          
        //}       
        public IActionResult CreateApplicationModule()
        {
            return View();
        }

        //[HttpPost]
        //[ValidateAntiForgeryToken]
        //public JsonResult SaveApplications()
        //{
        //    var req = this.HttpContext.Request.Form;
        //    IServiceClient client = this.ServiceClient;
        //    ViewBag.Header = "Create Application";
        //    var ds = new EbObjectSaveOrCommitRequest();
        //    ds.IsSave = false;
        //    ds.RefId = (string.IsNullOrEmpty(req["objid"])) ? string.Empty : req["objid"].ToString();           //Convert.ToInt32(_dict["id"]);//remember to pass 0 or value from view
        //  //  ds.EbObjectType = (int)EbObjectType.Application;
        //    ds.Name = req["name"];
        //    ds.Description = req["description"];
        //    ds.Json = EbSerializers.Json_Serialize(new EbApplication
        //    {
        //        Name = req["name"],
        //       // EbObjectType = EbObjectType.Application
        //    });
        //    ds.Status = ObjectLifeCycleStatus.Live;
        //    ds.TenantAccountId = ViewBag.cid;
        //    ds.ChangeLog = "";
        //    ds.Relations = null;

        //    ViewBag.IsNew = "false";
        //    var res = client.Post<EbObjectSaveOrCommitResponse>(ds);
        //    if (res.Id > 0)
        //    {
        //        return Json("Success");
        //    }
        //    else
        //    {
        //        return Json("Failed");
        //    }
        //}

        public IActionResult Logout()
        {
            ViewBag.Fname = null;
            IServiceClient client = this.ServiceClient;
            var abc = client.Post(new Authenticate { provider = "logout" });
            HttpContext.Response.Cookies.Delete("bToken");
            HttpContext.Response.Cookies.Delete("rToken");
            return RedirectToAction("DevSignIn", "Ext");

        }
       
        [HttpGet]
        public IActionResult Eb_EmailBuilder()
        {
            ViewBag.Header = "New Email Template";

            ViewBag.VersionNumber = 1;
            ViewBag.Obj_id = null;
            ViewBag.Refid = null;
            ViewBag.IsNew = "true";
            ViewBag.EditorHint = "CodeMirror.hint.sql";
            ViewBag.EditorMode = "text/x-sql";
            ViewBag.Icon = "fa fa-database";
            ViewBag.ObjType = (int)EbObjectType.EmailBuilder;
            ViewBag.ObjectName = "*Untitled";
            ViewBag.FilterDialogId = "null";

            var typeArray = typeof(EbEmailTemplateBase).GetTypeInfo().Assembly.GetTypes();

            Context2Js _jsResult = new Context2Js(typeArray, BuilderType.EmailBuilder, typeof(EbEmailTemplateBase));
           
            ViewBag.Meta = _jsResult.AllMetas;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectTypes = _jsResult.EbObjectTypes;
        
            return View();
        }

        [HttpPost]
        public IActionResult Eb_EmailBuilder(string Htmlcode)
        {
            ViewBag.Header = "Edit Email";
            var req = this.HttpContext.Request.Form;
            int obj_id = Convert.ToInt32(req["objid"]);
            ViewBag.Obj_id = Convert.ToInt32(req["objid"]);
            var resultlist = this.ServiceClient.Get<EbObjectExploreObjectResponse>(new EbObjectExploreObjectRequest { Id = obj_id });
            var rlist = resultlist.Data;
            
            foreach (var element in rlist)
            {
                ObjectLifeCycleStatus[] array = (ObjectLifeCycleStatus[])Enum.GetValues(typeof(ObjectLifeCycleStatus));
                List<ObjectLifeCycleStatus> lifeCycle = new List<ObjectLifeCycleStatus>(array);
                ViewBag.LifeCycle = lifeCycle;
                ViewBag.IsNew = "false";
                ViewBag.ObjectName = element.Name;
                ViewBag.ObjectDesc = element.Description;
                ViewBag.Status = element.Status;
                ViewBag.VersionNumber = element.VersionNumber;
                ViewBag.Icon = "fa fa-database";
                ViewBag.ObjType = (int)EbObjectType.EmailBuilder;
                ViewBag.Refid = element.RefId;
                ViewBag.Majorv = element.Dashboard_Tiles.MajorVersionNumber;
                ViewBag.Minorv = element.Dashboard_Tiles.MinorVersionNumber;
                ViewBag.Patchv = element.Dashboard_Tiles.PatchVersionNumber;
                if (String.IsNullOrEmpty(element.Json_wc) && !String.IsNullOrEmpty(element.Json_lc))
                {
                    ViewBag.ReadOnly = true;
                    var dsobj = EbSerializers.Json_Deserialize<EbEmailTemplate>(element.Json_lc);
                    ViewBag.dsobj = dsobj;            
                    ViewBag.html = dsobj.Body;
                }
                else
                {
                    ViewBag.ReadOnly = false;
                    var dsobj = EbSerializers.Json_Deserialize<EbEmailTemplate>(element.Json_wc);
                    ViewBag.dsobj = dsobj;
                    ViewBag.html = dsobj.Body;
                }
                var typeArray = typeof(EbEmailTemplateBase).GetTypeInfo().Assembly.GetTypes();

                Context2Js _jsResult = new Context2Js(typeArray, BuilderType.EmailBuilder, typeof(EbEmailTemplateBase));

                ViewBag.Meta = _jsResult.AllMetas;
                ViewBag.JsObjects = _jsResult.JsObjects;
                ViewBag.EbObjectTypes = _jsResult.EbObjectTypes;
            }
            return View();
        }      


        public string EmailTemplateCommit(string _Refid, string Htmlcode, string PropObj, string ChangeLog)
        {
            IServiceClient client = this.ServiceClient;
            var emailobj = EbSerializers.Json_Deserialize<EbEmailTemplate>(PropObj);
            string refid="";
            if (string.IsNullOrEmpty(_Refid))
            {
                var ds = new EbObject_Create_New_ObjectRequest();
                ds.EbObjectType = (int)EbObjectType.EmailBuilder;
                ds.Name = emailobj.Name;
                ds.Description = emailobj.Description;

                ds.Json = EbSerializers.Json_Serialize(new EbEmailTemplate
                {
                    Body = emailobj.Body,
                    //EbObjectType = emailobj.EbObjectType,
                    Name = emailobj.Name,
                    Subject = emailobj.Subject,
                    DataSourceRefId = emailobj.DataSourceRefId

                });
                ds.Relations = "";
                ds.IsSave = false;

                var res = ServiceClient.Post<EbObject_Create_New_ObjectResponse>(ds);
                refid = res.RefId;
            }
            else
            {
                var ds = new EbObject_CommitRequest();
                ds.EbObjectType = (int)EbObjectType.EmailBuilder;
                ds.Name = emailobj.Name;
                ds.Description = emailobj.Description;
                ds.Json = EbSerializers.Json_Serialize(new EbEmailTemplate
                {
                    Body = emailobj.Body,
                    //EbObjectType = emailobj.EbObjectType,
                    Name = emailobj.Name,
                    Subject = emailobj.Subject,
                    DataSourceRefId = emailobj.DataSourceRefId

                });
                ds.Relations = "";
                ds.RefId = _Refid;
                ds.ChangeLog = ChangeLog;
                var res = ServiceClient.Post<EbObject_CommitResponse>(ds);
                refid = res.RefId;
            }
            return refid ;
        }

        public string EmailTemplateSave(string _Refid, string PropObj)
        {
            var req = this.HttpContext.Request.Form;

            var emailobj =  EbSerializers.Json_Deserialize<EbEmailTemplate>(PropObj);
            string refid;
            if (string.IsNullOrEmpty(_Refid))
            {
                var ds = new EbObject_Create_New_ObjectRequest();
                ds.EbObjectType = (int)EbObjectType.EmailBuilder;
                ds.Name = emailobj.Name;
                ds.Description = emailobj.Description;
                ds.Json = EbSerializers.Json_Serialize(new EbEmailTemplate
                {
                    Body = emailobj.Body,
                    //EbObjectType = emailobj.EbObjectType,
                    Name = emailobj.Name,
                    Subject = emailobj.Subject,
                    DataSourceRefId = emailobj.DataSourceRefId

                });
                ds.Relations ="";
                ds.IsSave = true;

                var res = ServiceClient.Post<EbObject_Create_New_ObjectResponse>(ds);
                refid = res.RefId;
            }
            else
            {

                var ds = new EbObject_SaveRequest();
                ds.RefId = _Refid;
                ds.Name = emailobj.Name;
                ds.Description = emailobj.Description;
                ds.EbObjectType = (int)EbObjectType.EmailBuilder;
                ds.Json = EbSerializers.Json_Serialize(new EbEmailTemplate
                {
                    Body = emailobj.Body,
                    //EbObjectType = emailobj.EbObjectType,
                    Name = emailobj.Name,
                    Subject = emailobj.Subject,
                    DataSourceRefId = emailobj.DataSourceRefId

                });
                ds.Relations = "";
                ViewBag.IsNew = "false";
                var res = this.ServiceClient.Post<EbObject_SaveResponse>(ds);
                refid = res.RefId;
            }
            return refid;
        }

    }
}
