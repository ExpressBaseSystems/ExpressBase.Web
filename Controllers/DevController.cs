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
            int objid = Convert.ToInt32(ViewBag.Obj_id);
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = objid, TenantAccountId = ViewBag.cid, Token = ViewBag.token });
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
                    ViewBag.FilterDialogId = dsobj.FilterDialogId;
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
            //all versions
            ViewBag.Allversions = GetVersions2(objid);
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
                EbObjectType = EbObjectType.DataSource,
                FilterDialogId = Convert.ToInt32(_dict["filterDialogId"])
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
                EbObjectType = EbObjectType.DataSource,
                FilterDialogId = Convert.ToInt32(req["FilterDialogId"])
            });
            ds.Token = ViewBag.token;
            ViewBag.IsNew = "false";
            using (client.Post<HttpWebResponse>(ds)) { }
            return Json("Success");
        }
        //for ajax call
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
        //for call from another action
        public List<EbObjectWrapper> GetVersions2(int objid)
        {
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(objid), TenantAccountId = ViewBag.cid, Token = ViewBag.token, GetAllVer = true });
            var rlist = resultlist.Data;
            //List<EbObjectWrapper> ObjList = new List<EbObjectWrapper>();
            //foreach (var element in rlist)
            //{
            //     ObjList.Add(element);

            //}
            return rlist;
        }
        [HttpPost]
        public string VersionCodes(/*int i*/)
        {
            var req = this.HttpContext.Request.Form;
            // var objid = this.HttpContext.Request.Query["objid"];
            // var ver_num = this.HttpContext.Request.Query["ver_num"];
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(req["objid"]), TenantAccountId = ViewBag.cid, Token = ViewBag.token, GetParticularVer = true });
            var rlist = resultlist.Data;
            foreach (var element in rlist)
            {
                var dsobj = EbSerializers.ProtoBuf_DeSerialize<EbDataSource>(element.Bytea);
                ViewBag.Code = dsobj.Sql;
                //ViewBag.VersionNumber = req["ver_num"];
                //ViewBag.EditorHint = "CodeMirror.hint.sql";
                //ViewBag.EditorMode = "text/x-sql";
                //ViewBag.Icon = "fa fa-database";
            }
            return ViewBag.Code;
        }

        public IActionResult Eb_formBuilder()
        {
            return View();
        }

        public int SaveFilterDialog()
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
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
                FilterDialogJson = req["filterdialogjson"],
                EbObjectType = EbObjectType.FilterDialog
            });
            var CurrSaveId = client.Post<EbObjectWrapperResponse>(ds);
            return CurrSaveId.id;
        }

        public JsonResult GetByteaEbObjects_json()
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(req["objid"]), TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            //List<EbObjectWrapper> rlist = new List<EbObjectWrapper>();
            var rlist = resultlist.Data;

            Dictionary<int, EbFilterDialog> ObjList = new Dictionary<int, EbFilterDialog>();
            foreach (var element in rlist)
            {
                if (element.EbObjectType.ToString() == "FilterDialog")
                {

                    var dsobj = EbSerializers.ProtoBuf_DeSerialize<EbFilterDialog>(element.Bytea);
                    // Dictionary<string, string> values = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, string>>(dsobj.FilterDialogJson);
                    dsobj.EbObjectType = element.EbObjectType;
                    dsobj.Id = element.Id;
                    //  ViewBag.Fdparms = values;
                    ObjList[element.Id] = dsobj;
                }
            }
            //Dictionary<int, EbObject> ObjList = new Dictionary<int, EbObject>();
            //foreach (var element in rlist)
            //{
            //    if (element.EbObjectType.ToString() == req["ebobjtype"].ToString())
            //    {
            //        if (element.EbObjectType.ToString()=="EbDataSource") { 
            //        var dsobj = EbSerializers.ProtoBuf_DeSerialize<EbDataSource>(element.Bytea);
            //            dsobj.EbObjectType = element.EbObjectType;
            //            ObjList[element.Id] = dsobj;
            //        }
            //        if (element.EbObjectType.ToString() == "FilterDialog")
            //        {
            //            var dsobj = EbSerializers.ProtoBuf_DeSerialize<EbObject>(element.Bytea);
            //            dsobj.EbObjectType = element.EbObjectType;
            //            ObjList[element.Id] = dsobj;
            //        }
            //    }
            //}
            return Json(ObjList);
            // return Json("Success");
        }

        public string GetColumns4Trial(int dsid, string parameter)
        {
            var redis = this.EbConfig.GetRedisClient();
            var sscli = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var token = Request.Cookies[string.Format("T_{0}", ViewBag.cid)];
            var paramsList = new List<Dictionary<string, string>>();
            if (parameter == null)
            {
                paramsList = null;
            }
            else
            {
                Newtonsoft.Json.Linq.JArray ja = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(parameter);
                foreach (Newtonsoft.Json.Linq.JToken jt in ja)
                {
                    var _dict = new Dictionary<string, string>();
                    foreach (Newtonsoft.Json.Linq.JProperty jp in jt.Children())
                        _dict.Add(jp.Name, jp.Value.ToString());
                    paramsList.Add(_dict);
                }

            }
            var columnColletion = sscli.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { Id = dsid, TenantAccountId = ViewBag.cid, Token = ViewBag.token, Params = paramsList });
            //redis.Set<ColumnColletion>(string.Format("{0}_ds_{1}_columns", ViewBag.cid, dsid), columnColletion.Columns);           
            if (columnColletion.Columns.Count == 0)
            {
                return "";
            }
            else
            {
                string colDef = "[";
                foreach (EbDataColumn column in columnColletion.Columns)
                {
                    colDef += "{";
                    colDef += "\"data\": " + columnColletion.Columns[column.ColumnName].ColumnIndex.ToString();
                    colDef += ",\"title\": \"" + column.ColumnName + "\"";
                    colDef += ",\"visible\": " + true.ToString().ToLower();
                    colDef += "},";
                }
                return colDef.Substring(0, colDef.Length - 1) + "]";
            }
        }
      

        [HttpGet]
        public IActionResult DVEditor()
        {
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            // ViewBag.TenantId = HttpContext.Request.Query["tacid"];
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            //List<EbObjectWrapper> rlist = new List<EbObjectWrapper>();
            var rlist = resultlist.Data;
            Dictionary<int, EbObjectWrapper> ObjDSList = new Dictionary<int, EbObjectWrapper>();
            Dictionary<int, EbObjectWrapper> ObjDSListAll = new Dictionary<int, EbObjectWrapper>();
            Dictionary<int, EbObjectWrapper> ObjDVListAll = new Dictionary<int, EbObjectWrapper>();
            foreach (var element in rlist)
            {
                if (element.EbObjectType == EbObjectType.DataSource)
                {
                    ObjDSListAll[element.Id] = element;
                }
                if (element.EbObjectType == EbObjectType.DataVisualization)
                {
                    ObjDVListAll[element.Id] = element;
                }
            }
            ViewBag.DSListAll = ObjDSListAll;
            ViewBag.DSList = ObjDSList;
            ViewBag.DVListAll = ObjDVListAll;
            ViewBag.Obj_id = 0;
            ViewBag.dsid = 0;
            ViewBag.tvpref = "{ }";
            ViewBag.isFromuser = 0;

            return View();
        }

        [HttpPost]
        public IActionResult DVEditor(int objid)
        {
            //if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
            //    ViewBag.Obj_id = i;
            //else
            ViewBag.Obj_id = objid;

            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(ViewBag.Obj_id), TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            var rlist = resultlist.Data;
            foreach (var element in rlist)
            {
                if (element.EbObjectType == EbObjectType.DataVisualization)
                {
                    var dsobj = EbSerializers.ProtoBuf_DeSerialize<EbDataVisualization>(element.Bytea);
                    ViewBag.ObjectName = element.Name;
                    ViewBag.dsid = dsobj.dsid;
                    if (ViewBag.wc == "dc")
                        ViewBag.tvpref = this.EbConfig.GetRedisClient().Get<string>(string.Format("{0}_TVPref_{1}", ViewBag.cid, ViewBag.Obj_id));
                    else
                    {
                        ViewBag.tvpref = this.EbConfig.GetRedisClient().Get<string>(string.Format("{0}_TVPref_{1}_uid_{2}", ViewBag.cid, objid, ViewBag.UId));
                        if (ViewBag.tvpref == null)
                            ViewBag.tvpref = this.EbConfig.GetRedisClient().Get<string>(string.Format("{0}_TVPref_{1}", ViewBag.cid, ViewBag.Obj_id));
                    }
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
                if (element.EbObjectType == EbObjectType.DataSource)
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
            DataSourceColumnsResponse result;
            var columnColletion = redis.Get<ColumnColletion>(string.Format("{0}_ds_{1}_columns", ViewBag.cid, dsid));
            if (columnColletion == null || columnColletion.Count == 0)
            {
                result = sscli.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { Id = dsid, TenantAccountId = ViewBag.cid, Token = ViewBag.token });
                columnColletion = result.Columns;
            }
            var tvpref = this.GetColumn4DataTable(columnColletion, dsid);
            return tvpref;
        }

        private string GetColumn4DataTable(ColumnColletion __columnCollection, int dsid)
        {
            string colDef = string.Empty;
            colDef = "{\"dsId\":" + dsid + ",\"dvName\": \"<Untitled>\",\"renderAs\":\"table\",\"options\":\"\", \"lengthMenu\":[ [100, 200, 300, -1], [100, 200, 300, \"All\"] ],";
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
                colDef += ",\"width\": \"100px\"";
                colDef += ",\"name\": \"" + column.ColumnName + "\"";
                colDef += ",\"type\": \"" + column.Type.ToString() + "\"";
                var cls = (column.Type.ToString() == "System.Int32" || column.Type.ToString() == "System.Decimal" || column.Type.ToString() == "System.Int64") ? "dt-right tdheight" : "tdheight";
                colDef += ",\"className\": \"" + cls + "\"";
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
                    colext += "\"name\":\"" + column.ColumnName + "\",\"RenderAs\":\"Default\",\"linkDv\":\"\"";
                colext += "},";
            }
            colext = colext.Substring(0, colext.Length - 1) + "]";
            return colDef + colext + "}";
        }

        public JsonResult SaveSettings(int dsid, string json, int dvid)
        {

            var req = this.HttpContext.Request.Form;
            Dictionary<string, object> _dict = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, object>>(json);
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var ds = new EbObjectWrapper();
            ds.Id = dvid;
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
                dsid = dsid,
                EbObjectType = EbObjectType.DataVisualization
            });

            var result = client.Post<EbObjectWrapperResponse>(ds);
            if (result.id > 0)
                dvid = result.id;
            if (ViewBag.wc == "dc")
                this.EbConfig.GetRedisClient().Set(string.Format("{0}_TVPref_{1}", ViewBag.cid, dvid), json);
            else
                this.EbConfig.GetRedisClient().Set(string.Format("{0}_TVPref_{1}_uid_{2}", ViewBag.cid, dvid, ViewBag.UId), json);
            return Json("Success");
        }

        public List<string> GetDiffer(string OldText,string NewText)
        {
            List<string> Diff = new List<string>();
            var d = new Differ();
            var inlineBuilder = new SideBySideDiffBuilder(d);

            var diffmodel = inlineBuilder.BuildDiffModel(OldText, NewText);
            Diff.Add(Differ(diffmodel.OldText));
            Diff.Add(Differ(diffmodel.NewText));
            return Diff;
        }
        public string Differ(DiffPaneModel text)
        {
            string spaceValue = "\u00B7";
            string tabValue = "\u00B7\u00B7";
            string html = "<div class=" + "'diffpane'" + "><table cellpadding='0' cellspacing='0' class='diffTable'>";

            //webbrowser1
            foreach (var diffLine in text.Lines)
            {
                html += "<tr>";
                html += "<td class='lineNumber'>";
                html += diffLine.Position.HasValue ? diffLine.Position.ToString() : "&nbsp;";
                html += "</td>";
                html += "<td class='line " + diffLine.Type.ToString() + "Line'>";
                html += "<span class='lineText'>";

                if (diffLine.Type == ChangeType.Deleted || diffLine.Type == ChangeType.Inserted || diffLine.Type == ChangeType.Unchanged)
                {
                    html += diffLine.Text.Replace(" ", spaceValue.ToString()).Replace("\t", tabValue.ToString());
                }
                else if (diffLine.Type == ChangeType.Modified)
                {
                    foreach (var character in diffLine.SubPieces)
                    {
                        if (character.Type == ChangeType.Imaginary) continue;
                        else
                        {
                            html += "<span class='" + character.Type.ToString() + "Character'>";
                            html += character.Text.Replace(" ", spaceValue.ToString()).Replace("\t", tabValue.ToString());
                            html += "</span>";
                        }
                    }
                }

                html += "</span>";
                html += "</td>";
                html += "</tr>";
            }

            html += "</table></div>";
            
            return html;

        }
        public ActionResult Diff()
        {
            return View();
        }

        public IActionResult EbObjectList(EbObjectType type)
        {
            ViewBag.EbObjectType = (int)type;

            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);

            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            var rlist = resultlist.Data;

            Dictionary<int, EbObjectWrapper> ObjList = new Dictionary<int, EbObjectWrapper>();

            foreach (var element in rlist)
            {
                if (element.EbObjectType == type)
                    ObjList[element.Id] = element;
            }

            ViewBag.Objlist = ObjList;

            return View();
        }
    }
}
