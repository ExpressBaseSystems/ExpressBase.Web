using System;
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
using ExpressBase.Data;
using System.Text.RegularExpressions;
using System.Collections;



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
            return View();
        }

        [HttpPost]
        public IActionResult TenantDashboard(int i)
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
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
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
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
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var fr = client.Get<TokenRequiredSelectResponse>(new TokenRequiredSelectRequest { Uid = Convert.ToInt32(ViewBag.UId), Token = ViewBag.token });
            ViewBag.dict = fr.returnlist;
            return View();

        }

        [HttpPost]
        public IActionResult TenantAccounts(int i)
        {

            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
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
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var abc= client.Post(new Authenticate { provider = "logout" });
            HttpContext.Response.Cookies.Delete("Token");
            HttpContext.Response.Cookies.Delete("rToken");
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
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
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
        [HttpGet]
        public IActionResult code_editor()
        {
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(ViewBag.Obj_id), TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            var rlist = resultlist.Data;
            List<string> filterDialogs = new List<string>();

            ViewBag.VersionNumber = 1;
            ViewBag.Obj_id = 0;
            ViewBag.IsNew = "true";
            foreach (var element in rlist)
            {
                if (element.EbObjectType == ExpressBase.Objects.EbObjectType.FilterDialog)
                {
                    filterDialogs.Add(element.Name);
                }
            }
            ViewBag.FilterDialogs = filterDialogs;
            ViewBag.EditorHint = "CodeMirror.hint.sql";
            ViewBag.EditorMode = "text/x-sql";
            ViewBag.Icon = "fa fa-database";
            ViewBag.ObjType = (int)EbObjectType.DataSource;

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
            IServiceClient fdclient = this.EbConfig.GetServiceStackClient();
            var fdresultlist = fdclient.Get<EbObjectResponse>(new EbObjectRequest { TenantAccountId = ViewBag.cid, Token = ViewBag.TUtoken });
            var fdrlist = fdresultlist.Data;
            List<string> filterDialogs = new List<string>();
            foreach (var element in fdrlist)
            {
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

            using (client.Post<HttpWebResponse>(ds)) { }
            return Json("Success");
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
            using (client.Post<HttpWebResponse>(ds)) { }
            return Json("Success");
        }

        public JsonResult GetEbObjects_json()
        {
            var req = this.HttpContext.Request.Form;
            var TenantId = req["TenantAccountId"];
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
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
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
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

        public JsonResult SaveFilterDialog()
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient();
            var ds = new EbObjectWrapper();
            if (req["id"] == "0")
            {
                ds.Id = 0;
            }
            else
            {
                ds.Id = Convert.ToInt32(req["id"]);
            }
            ds.Token = ViewBag.token;
            ds.TenantAccountId = ViewBag.cid;
            ds.EbObjectType = Objects.EbObjectType.FilterDialog;
            ds.Name = req["name"];
            ds.Description = req["description"];
            ds.Status = Objects.ObjectLifeCycleStatus.Live;
            ds.ChangeLog = "";
            ds.Bytea = EbSerializers.ProtoBuf_Serialize(new EbFilterDialog
            {
                Name = req["name"],
                Description = req["description"],
                DsId = req["dsid"],
                FilterDialogJson = req["FilterDialogJson"],
                EbObjectType = EbObjectType.FilterDialog
            });

            using (client.Post<HttpWebResponse>(ds)) { }
            return Json("Success");
        }

        public void CheckFilterParameters()
        {
            //check for parameters in the 
            var req = HttpContext.Request.Form;
            List<string> filterparams = new List<string>();
            MatchCollection mc = Regex.Matches(req["code"], @"\@\w+");
            if (mc.Count != 0)
            {
                foreach (Match m in mc)
                {
                    string filtervar = m.ToString().Substring(1, m.ToString().Length - 1);
                    if (filtervar == "search" || filtervar == "and_search" || filtervar == "search_and" || filtervar == "where_search" || filtervar == "limit" || filtervar == "offset" || filtervar == "orderby")
                    {

                    }
                    else
                    {
                        if (!filterparams.Contains(filtervar))
                        {
                            filterparams.Add(filtervar);
                        }
                    }
                }
                filterparams.Sort();
                ViewBag.filterparams = filterparams;
               
            }
        }

        public IActionResult objects()
        {
            return View();
        }

        public IActionResult ds_save()
        {
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

        public IActionResult CreateApplications()
        {
            return View();
        }

        public IActionResult DevConsole()
        {

            return View();
        }

        public IActionResult DVList()
        {
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { TenantAccountId = ViewBag.cid, Token = ViewBag.token });           
            var rlist = resultlist.Data;
            Dictionary<int, EbObjectWrapper> ObjList = new Dictionary<int, EbObjectWrapper>();
            foreach (var element in rlist)
            {
                if (element.EbObjectType == ExpressBase.Objects.EbObjectType.DataVisualization)
                {
                    ObjList[element.Id] = element;
                }
            }
            ViewBag.DVList = ObjList;
            return View();
        }

        [HttpGet]
        public IActionResult DVEditor()
        {
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            // ViewBag.TenantId = HttpContext.Request.Query["tacid"];
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            //List<EbObjectWrapper> rlist = new List<EbObjectWrapper>();
            var rlist = resultlist.Data;
            Dictionary<int, EbObjectWrapper> ObjList = new Dictionary<int, EbObjectWrapper>();
            Dictionary<int, EbObjectWrapper> ObjListAll = new Dictionary<int, EbObjectWrapper>();
            foreach (var element in rlist)
            {
                if (element.EbObjectType == ExpressBase.Objects.EbObjectType.DataSource)
                {
                    ObjListAll[element.Id] = element;
                }
            }
            ViewBag.DSListAll = ObjListAll;
            ViewBag.DSList = ObjList;
            ViewBag.Obj_id = 0;
            ViewBag.dsid = 0;
            ViewBag.tvpref = "{ }";
            return View();
        }

        [HttpPost]
        public IActionResult DVEditor(int i)
        {
            ViewBag.Obj_id = HttpContext.Request.Form["objid"];
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(ViewBag.Obj_id), TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            var rlist = resultlist.Data;
            foreach (var element in rlist)
            {
                if (element.EbObjectType == ExpressBase.Objects.EbObjectType.DataVisualization)
                {
                    var dsobj = EbSerializers.ProtoBuf_DeSerialize<EbDataVisualization>(element.Bytea);
                    ViewBag.ObjectName = element.Name;
                    ViewBag.dsid = dsobj.dsid;
                    ViewBag.tvpref = this.EbConfig.GetRedisClient().Get<string>(string.Format("{0}_TVPref_{1}", ViewBag.cid, dsobj.dsid));
                }
            }
            resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(ViewBag.dsid), TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            //List<EbObjectWrapper> rlist = new List<EbObjectWrapper>();
            rlist = resultlist.Data;
            Dictionary<int, EbObjectWrapper> ObjList = new Dictionary<int, EbObjectWrapper>();
            foreach (var element in rlist)
            {
                if (element.EbObjectType == ExpressBase.Objects.EbObjectType.DataSource)
                {
                    ObjList[element.Id] = element;
                }
            }
            ViewBag.DSList = ObjList;
            
           resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            //List<EbObjectWrapper> rlist = new List<EbObjectWrapper>();
           rlist = resultlist.Data;
            Dictionary<int, EbObjectWrapper> ObjListAll = new Dictionary<int, EbObjectWrapper>();
            foreach (var element in rlist)
            {
                if (element.EbObjectType == ExpressBase.Objects.EbObjectType.DataSource)
                {
                    ObjListAll[element.Id] = element;
                }
            }
            ObjListAll.Remove(ObjList.Keys.First<int>());
            ViewBag.DSListAll = ObjListAll;
            return View();
        }

        public string GetColumns(int dsid)
        {
            var redis = this.EbConfig.GetRedisClient();
            var sscli = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var token = Request.Cookies[string.Format("T_{0}", ViewBag.cid)];

            //redis.Remove(string.Format("{0}_ds_{1}_columns", "eb_roby_dev", dsid));
            //redis.Remove(string.Format("{0}_TVPref_{1}_uid_{2}", "eb_roby_dev", dsid, 1));

            var columnColletion = redis.Get<ColumnColletion>(string.Format("{0}_ds_{1}_columns", "eb_roby_dev", dsid));
            var tvpref = this.GetColumn4DataTable(columnColletion);
            return tvpref;
        }

        private string GetColumn4DataTable(ColumnColletion __columnCollection)
        {
            string colDef = string.Empty;
            colDef = "{\"dvName\": \"<Untitled>\",\"hideSerial\": false, \"hideCheckbox\": false, \"lengthMenu\":[ [100, 200, 300, -1], [100, 200, 300, \"All\"] ],";
            colDef += " \"scrollY\":300, \"rowGrouping\":\"\",\"leftFixedColumns\":0,\"rightFixedColumns\":0,\"columns\":[";
            colDef += "{\"width\":10, \"searchable\": false, \"orderable\": false, \"visible\":true, \"name\":\"serial\", \"title\":\"#\"},";
            colDef += "{\"width\":10, \"searchable\": false, \"orderable\": false, \"visible\":true, \"name\":\"checkbox\"},";
            foreach (EbDataColumn column in __columnCollection)
            {
                colDef += "{";
                colDef += "\"data\": " + __columnCollection[column.ColumnName].ColumnIndex.ToString();
                colDef += string.Format(",\"title\": \"{0}<span hidden>{0}</span>\"", column.ColumnName);
                var vis = (column.ColumnName == "id") ? false.ToString().ToLower() : true.ToString().ToLower();
                colDef += ",\"visible\": " + vis;
                colDef += ",\"width\": " + 100;
                colDef += ",\"name\": \"" + column.ColumnName + "\"";
                colDef += ",\"type\": \"" + column.Type.ToString() + "\"";
                //var cls = (column.Type.ToString() == "System.Boolean") ? "dt-center tdheight" : "tdheight";
                colDef += ",\"className\": \"tdheight\"";
                colDef += "},";
            }
            colDef = colDef.Substring(0, colDef.Length - 1) + "],";
            string colext = "\"columnsext\":[";
            colext += "{\"name\":\"serial\"},";
            colext += "{\"name\":\"checkbox\"},";
            foreach (EbDataColumn column in __columnCollection)
            {
                colext += "{";
                if (column.Type.ToString() == "System.Int32" || column.Type.ToString() == "System.Decimal" || column.Type.ToString() == "System.Int16" || column.Type.ToString() == "System.Int64")
                    colext += "\"name\":\"" + column.ColumnName + "\",\"AggInfo\":true,\"DecimalPlace\":2,\"RenderAs\":\"Default\"";
                else if (column.Type.ToString() == "System.Boolean")
                    colext += "\"name\":\"" + column.ColumnName + "\",\"IsEditable\":false,\"RenderAs\":\"Default\"";
                else if (column.Type.ToString() == "System.DateTime")
                    colext += "\"name\":\"" + column.ColumnName + "\",\"Format\":\"Date\"";
                else if (column.Type.ToString() == "System.String")
                    colext += "\"name\":\"" + column.ColumnName + "\",\"RenderAs\":\"Default\"";
                colext += "},";
            }
            colext = colext.Substring(0, colext.Length - 1) + "]";
            return colDef + colext + "}";
        }

        public JsonResult SaveSettings(int tvid, string json, int objId)
        {

            var req = this.HttpContext.Request.Form;
            Dictionary<string, object> _dict = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, object>>(json);
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var ds = new EbObjectWrapper();
            ds.Id = objId;
            if (ds.Id > 0)
                ds.IsSave = "true";
            ds.Token = ViewBag.token;
            ds.TenantAccountId = ViewBag.cid;
            ds.EbObjectType = Objects.EbObjectType.DataVisualization;
            ds.Name = _dict["dvName"].ToString();
            ds.Description = "abcd";
            ds.Status = Objects.ObjectLifeCycleStatus.Live;
            ds.Bytea = EbSerializers.ProtoBuf_Serialize(new EbDataVisualization
            {
                Name = _dict["dvName"].ToString(),
                settingsJson = _dict.ToString(),
                dsid = tvid,
                EbObjectType = EbObjectType.DataVisualization
            });

            using (client.Post<HttpWebResponse>(ds)) { }
            this.EbConfig.GetRedisClient().Set(string.Format("{0}_TVPref_{1}", ViewBag.cid, tvid), json);
            return Json("Success");
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
}
