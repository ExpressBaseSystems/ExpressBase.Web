﻿using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System.IO;
using ExpressBase.Objects.ServiceStack_Artifacts;
using Microsoft.Extensions.Options;
using ExpressBase.Web.Filters;
using ExpressBase.Common;
using ExpressBase.Objects;
using System.Net;
using ServiceStack.Text;


// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web2.Controllers
{
    public class TenantController : EbBaseController
    {
        public TenantController(IOptionsSnapshot<EbSetupConfig> ss_settings) : base(ss_settings) { }

        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult DBCheck()
        {
            return View();
        }

        [HttpGet]
        public IActionResult TenantDashboard()
        {
            //IServiceClient client = this.EbConfig.GetServiceStackClient();
            //var fr = client.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { Uid = ViewBag.UId, restype = "img", Token = ViewBag.token });
            //if (string.IsNullOrEmpty(ViewBag.cid))
            //{
            //    foreach (int element in fr.dict.Keys)
            //    {
            //        redisClient.Set<string>(string.Format("uid_{0}_profileimage", ViewBag.UId), fr.dict[element]);
            //    }
            //}

            return View();
        }

        [HttpPost]
        public IActionResult TenantDashboard(int i)
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var res = client.Post<bool>(new DbCheckRequest { CId = Convert.ToInt32(req["id"]), DBColvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value) });
            if (res)
            {
                return View();
            }
            else
            {
                ViewBag.Message = "Error in Connection";
                return View();
            }
        }

        [HttpGet]
        public IActionResult PricingSelect()
        {
            return View();
        }

        [HttpPost]
        public IActionResult PricingSelect(int i)
        {
            var req = this.HttpContext.Request.Form;
            return RedirectToAction("TenantAddAccount", new RouteValueDictionary(new { controller = "Tenant", action = "TenantAddAccount", tier = req["tier"], id = req["tenantid"] }));
        }

        [HttpGet]
        public IActionResult TenantAddAccount()
        {
            return View();
        }

        [HttpPost]
        public IActionResult TenantAddAccount(int i)
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var res = client.Post<TokenRequiredUploadResponse>(new TokenRequiredUploadRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value), op = "insertaccount", Token = ViewBag.token });
            if (res.id >= 0)
            {
                return RedirectToAction("TenantAccounts", new RouteValueDictionary(new { controller = "Tenant", action = "TenantAccounts", Id = req["tenantid"], aid = res.id }));
            }
            else
            {
                return View();
            }
        }

        [HttpGet]
        public IActionResult TenantAccounts()
        {
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var fr = client.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { Uid = Convert.ToInt32(ViewBag.UId), Token = ViewBag.token });
            ViewBag.dict = fr.returnlist;
            return View();

        }

        [HttpPost]
        public IActionResult TenantAccounts(int i)
        {

            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var res = client.Post<TokenRequiredUploadResponse>(new TokenRequiredUploadRequest { Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value), op = "insertaccount", Token = ViewBag.token });
            if (res.id >= 0)
            {
                return RedirectToAction("TenantAccounts", new RouteValueDictionary(new { controller = "Tenant", action = "TenantAccounts", Id = req["tenantid"], aid = res.id }));
            }
            else
            {
                return View();
            }
        }

        public IActionResult TenantHome()
        {
            return View();
        }

        public IActionResult TenantLogout()
        {
            ViewBag.Fname = null;
            return RedirectToAction("TenantSignup", "TenantExt");

        }

        public IActionResult ResetPassword()
        {
            return View();
        }

        [HttpGet]
        public IActionResult EmailConfirmation()
        {
            return View();
        }

        [HttpPost]
        public IActionResult EmailConfirmation(int i)
        {
            //var req = this.HttpContext.Request.Form;

            //JsonServiceClient client = new JsonServiceClient("http://localhost:53125/");
            //var res = client.Post<bool>(new Services.SendMail { Emailvals= req.ToDictionary(dict => dict.Key, dict => (object)dict.Value) });
            //if (res.id >= 0)
            //{
            //    return RedirectToAction("TenantProfile", new RouteValueDictionary(new { controller = "Tenant", action = "TenantProfile", Id = res.id }));

            //}
            //else
            {
                return View();
            }
        }

        [HttpGet]
        public IActionResult TenantProfile()
        {
            ViewBag.logtype = HttpContext.Request.Query["t"];
            ViewBag.EbConfig = this.EbConfig;
            ViewBag.TId = Convert.ToInt32(HttpContext.Request.Query["Id"]);

            return View();
        }

        [HttpPost]
        public IActionResult TenantProfile(int i)
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var res = client.Post<TokenRequiredUploadResponse>(new TokenRequiredUploadRequest { op = "updatetenant", Colvalues = req.ToDictionary(dict => dict.Key, dict => (object)dict.Value), Token = ViewBag.token });
            if (res.id >= 0)
            {
                return RedirectToAction("TenantDashboard", new RouteValueDictionary(new { controller = "Tenant", action = "TenantDashboard", Id = res.id }));
            }
            return View();

        }

        public IActionResult marketPlace()
        {
            return View();
        }
        public IActionResult dbConfig()
        {
            return View();
        }
        public IActionResult AddAccount2()
        {
            return View();
        }
        public IActionResult SimpleAdvanced()
        {
            return View();
        }
        public IActionResult SimpleDbConf()
        {
            return View();
        }
        public IActionResult Engineering()
        {
            return View();
        }

        [HttpPost]
        public IActionResult code_editor()
        {
            ViewBag.TenantId = HttpContext.Request.Form["tacid"];
            ViewBag.Obj_id = HttpContext.Request.Form["objid"];

            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(ViewBag.Obj_id), TenantAccountId = ViewBag.TenantId, Token = ViewBag.token });
            var rlist = resultlist.Data;
            List<string> filterDialogs = new List<string>();

            foreach (var element in rlist)
            {
                ObjectLifeCycleStatus[] array = (ObjectLifeCycleStatus[])Enum.GetValues(typeof(ObjectLifeCycleStatus));
                List<ObjectLifeCycleStatus> lifeCycle = new List<ObjectLifeCycleStatus>(array);
                ViewBag.LifeCycle = lifeCycle;
                if (element.EbObjectType == ExpressBase.Objects.EbObjectType.DataSource)
                {
                    var dsobj = EbSerializers.ProtoBuf_DeSerialize<EbDataSource>(element.Bytea);
                    ViewBag.ObjectName = dsobj.Name;
                    ViewBag.ObjectDesc = dsobj.Description;
                    ViewBag.Code = dsobj.Sql;
                    ViewBag.Status = element.Status;
                    ViewBag.VersionNumber = element.VersionNumber;
                    ViewBag.EditorHint = "CodeMirror.hint.sql";
                    ViewBag.EditorMode = "text/x-sql";
                    ViewBag.Icon = "fa fa-database";
                    ViewBag.ObjType = (int)EbObjectType.DataSource;

                }

                if (element.EbObjectType == ExpressBase.Objects.EbObjectType.JavascriptFunctions)
                {

                }
                if (element.EbObjectType == ExpressBase.Objects.EbObjectType.FilterDialog)
                {
                    filterDialogs.Add(element.Name);
                }
            }
            ViewBag.FilterDialogs = filterDialogs;
            return View();
        }

        public JsonResult CommitEbDataSource()
        {
            var req = this.HttpContext.Request.Form;
            var _dict = JsonSerializer.DeserializeFromString<Dictionary<string, string>>(req["Colvalues"]);
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var ds = new EbObjectWrapper();
            if (string.IsNullOrEmpty(_dict["id"]))
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

            using (client.Post<HttpWebResponse>(ds)) { }
            return Json("Success");
        }
        public JsonResult SaveEbDataSource()
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var ds = new EbObjectWrapper();
            ds.IsSave = req["isSave"];
            ds.Token = ViewBag.token;
            ds.TenantAccountId = req["tcid"];
            ds.Id = Convert.ToInt32(req["Id"]);
            ds.VersionNumber = Convert.ToInt32( req["VersionNumber"]);
            ds.Bytea = EbSerializers.ProtoBuf_Serialize(new EbDataSource
            {
                Name = req["Name"],
                Description = req["Description"],
                Sql = req["Code"],
                EbObjectType = EbObjectType.DataSource
            });
            ds.Token = ViewBag.token;
            using (client.Post<HttpWebResponse>(ds)) { }
            return Json("Success");
        }
        public JsonResult GetEbObjects_json()
        {
            var req = this.HttpContext.Request.Form;
            var TenantId = req["TenantAccountId"];
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { TenantAccountId = TenantId, Token = ViewBag.token });
            //List<EbObjectWrapper> rlist = new List<EbObjectWrapper>();
            var rlist = resultlist.Data;
            Dictionary<int, string> ObjList = new Dictionary<int, string>();
            foreach (var element in rlist)
            {
                if (element.EbObjectType == ExpressBase.Objects.EbObjectType.DataSource)
                {
                    ObjList[element.Id] = element.Name;
                }
            }
            return Json(ObjList);
        }
        public JsonResult GetByteaEbObjects_json()
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(req["obj_id"]), TenantAccountId = req["TenantAccountId"], Token = ViewBag.token });
            //List<EbObjectWrapper> rlist = new List<EbObjectWrapper>();
            var rlist = resultlist.Data;
            Dictionary<int, EbDataSource> ObjList = new Dictionary<int, EbDataSource>();
            foreach (var element in rlist)
            {
                if (element.EbObjectType == ExpressBase.Objects.EbObjectType.DataSource)
                {
                    var dsobj = EbSerializers.ProtoBuf_DeSerialize<EbDataSource>(element.Bytea);
                    dsobj.EbObjectType = element.EbObjectType;
                    ObjList[element.Id] = dsobj;
                }
            }
            return Json(ObjList);
        }
        public IActionResult objects()
        {
            ViewBag.TenantId = HttpContext.Request.Query["tacid"];
            return View();
        }
        public IActionResult ds_save()
        {
            return View();
        }
        public IActionResult DSList()
        {

            IServiceClient client = this.EbConfig.GetServiceStackClient();
            ViewBag.TenantId = HttpContext.Request.Query["tacid"];
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { TenantAccountId = ViewBag.TenantId, Token = ViewBag.token });
            //List<EbObjectWrapper> rlist = new List<EbObjectWrapper>();
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

        public IActionResult CreateApplications()
        {
            return View();
        }

        public IActionResult DevConsole()
        {

            return View();
        }
        public IActionResult DVEditor()
        {
            return View();
        }
        public IActionResult filterDialog(/*string execCode*/)
        {
            //ViewBag.ExecCode = execCode;
            return View();
        }

    }

    public class ObjectCaller
    {
        public int obj_id { get; set; }
        public int TenantId { get; set; }

        public ObjectCaller(int id, int cid)
        {
            this.obj_id = id;
            this.TenantId = cid;
        }
        
    }
  
}
