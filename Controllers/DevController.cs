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
using ExpressBase.Objects.Attributes;
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
            ViewBag.Header = "New Datasource";
            ViewBag.VersionNumber = 1;
            ViewBag.Obj_id = 0;
            ViewBag.IsNew = "true";
            ViewBag.EditorHint = "CodeMirror.hint.sql";
            ViewBag.EditorMode = "text/x-sql";
            ViewBag.Icon = "fa fa-database";
            ViewBag.ObjType = (int)EbObjectType.DataSource;
            ViewBag.ObjectName = "*Untitled";
            ViewBag.FilterDialogId = "null";//related to showing selected fd in select fd dropdown 
           // ViewBag.FilterDialogs = GetObjects((int)EbObjectType.FilterDialog);
            ViewBag.SqlFns = Getsqlfns((int)EbObjectType.SqlFunction);
            return View();
        }

        [HttpPost]
        public IActionResult code_editor(int i)
        {
            ViewBag.Header = "Edit Datasource";
            var req = this.HttpContext.Request.Form;
            string obj_id = req["objid"].ToString();
            //  var obj_type = (EbObjectType)Convert.ToInt32(req["obj_type"]);

            ViewBag.Obj_id = obj_id;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { RefId = obj_id, VersionId = -1, EbObjectType = (int)EbObjectType.DataSource, Token = ViewBag.token });
            var rlist = resultlist.Data;
            foreach (var element in rlist)
            {
                ObjectLifeCycleStatus[] array = (ObjectLifeCycleStatus[])Enum.GetValues(typeof(ObjectLifeCycleStatus));
                List<ObjectLifeCycleStatus> lifeCycle = new List<ObjectLifeCycleStatus>(array);
                ViewBag.LifeCycle = lifeCycle;
                ViewBag.IsNew = "false";
               
                var dsobj = EbSerializers.Json_Deserialize<EbDataSource>(element.Json);
                ViewBag.ObjectName = element.Name;
                ViewBag.ObjectDesc = element.Description;
                ViewBag.Code = Encoding.UTF8.GetString(Convert.FromBase64String(dsobj.Sql));
                ViewBag.Status = element.Status;
                ViewBag.VersionNumber = element.VersionNumber;
                ViewBag.EditorHint = "CodeMirror.hint.sql";
                ViewBag.EditorMode = "text/x-pgsql";
                ViewBag.Icon = "fa fa-database";
                ViewBag.ObjType = (int)EbObjectType.DataSource;
                ViewBag.FilterDialogId = dsobj.FilterDialogRefId;
            }
            ViewBag.Allversions = GetVersions(obj_id);
            ViewBag.SqlFns = Getsqlfns((int)EbObjectType.SqlFunction);
            return View();
        }

        [HttpGet]
        public IActionResult SqlFunction_Editor()
        {
            ViewBag.Header = "New Sql Function";
            ViewBag.VersionNumber = 1;
            ViewBag.Obj_id = 0;
            ViewBag.Code = "CREATE OR REPLACE FUNCTION function_name(p1 type, p2 type) \nRETURNS type AS \n$BODY$ \nBEGIN \n\t-- logic \nEND \n$BODY$ \nLANGUAGE language_name";
            ViewBag.IsNew = "true";
            ViewBag.EditorHint = "CodeMirror.hint.sql";
            ViewBag.EditorMode = "text/x-pgsql";
            ViewBag.Icon = "fa fa-database";
            ViewBag.ObjType = (int)EbObjectType.SqlFunction;
            ViewBag.ObjectName = "*Untitled";
            ViewBag.FilterDialogId = "null";//related to showing selected fd in select fd dropdown 
         //   ViewBag.FilterDialogs = GetObjects((int)EbObjectType.FilterDialog);
            ViewBag.SqlFns = Getsqlfns((int)EbObjectType.SqlFunction);
            return View();
        }

        [HttpPost]
        public IActionResult SqlFunction_Editor(int i)
        {
            ViewBag.Header = "Edit Sql Function";
            var req = this.HttpContext.Request.Form;
            string obj_id = req["objid"].ToString();
            //  var obj_type = (EbObjectType)Convert.ToInt32(req["obj_type"]);

            ViewBag.Obj_id = obj_id;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { RefId = obj_id, VersionId = -1, EbObjectType = (int)EbObjectType.SqlFunction, Token = ViewBag.token });
            var rlist = resultlist.Data;
            foreach (var element in rlist)
            {
                ObjectLifeCycleStatus[] array = (ObjectLifeCycleStatus[])Enum.GetValues(typeof(ObjectLifeCycleStatus));
                List<ObjectLifeCycleStatus> lifeCycle = new List<ObjectLifeCycleStatus>(array);
                ViewBag.LifeCycle = lifeCycle;
                ViewBag.IsNew = "false";
                //if (obj_type == ExpressBase.Objects.EbObjectType.DataSource)
                //{
                var dsobj = EbSerializers.Json_Deserialize<EbSqlFunction>(element.Json);
                ViewBag.ObjectName = element.Name;
                ViewBag.ObjectDesc = element.Description;
                ViewBag.Code = dsobj.Sql;
                ViewBag.Status = element.Status;
                ViewBag.VersionNumber = element.VersionNumber;
                ViewBag.EditorHint = "CodeMirror.hint.sql";
                ViewBag.EditorMode = "text/x-sql";
                ViewBag.Icon = "fa fa-database";
                ViewBag.ObjType = (int)EbObjectType.SqlFunction;
                ViewBag.FilterDialogId = dsobj.FilterDialogId;

            }
           // ViewBag.FilterDialogs = GetObjects((int)EbObjectType.FilterDialog);
            ViewBag.SqlFns = Getsqlfns((int)EbObjectType.SqlFunction);
            ViewBag.Allversions = GetVersions(obj_id);
            return View();
        }

        //public string GetRefid(int id, string objtype)
        //{
        //    var _EbObjectType = (EbObjectType)Convert.ToInt32(objtype);
        //    IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
        //    var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = id, VersionId = id, EbObjectType = Convert.ToInt32(objtype), Token = ViewBag.token });
        //    var rlist = resultlist.Data;
        //    string refid =null;
        //    foreach (var element in rlist)
        //    {
        //        if (_EbObjectType == EbObjectType.FilterDialog)
        //        {
        //            refid = EbSerializers.Json_Deserialize<EbDataSource>(element.RefId).ToString();
        //        }
        //    }
        //    return refid;
        //}
        public Dictionary<int, EbObjectWrapper> GetObjects(int obj_type)
        {
            IServiceClient fdclient = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var fdresultlist = fdclient.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = obj_type, Token = ViewBag.token });
            var fdrlist = fdresultlist.Data;
            Dictionary<int, EbObjectWrapper> objects_dict = new Dictionary<int, EbObjectWrapper>();
            foreach (var element in fdrlist)
            {
                objects_dict[element.Id] = element;
            }
            return objects_dict;
        }

        public Dictionary<string, EbObjectWrapper> GetObjects_refid_dict(int obj_type)
        {
            IServiceClient fdclient = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var fdresultlist = fdclient.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = obj_type, Token = ViewBag.token });
            var fdrlist = fdresultlist.Data;
            Dictionary<string, EbObjectWrapper> objects_dict = new Dictionary<string, EbObjectWrapper>();
            foreach (var element in fdrlist)
            {
                objects_dict[element.RefId] = element;
            }
            return objects_dict;
        }

        public List<string> Getsqlfns(int obj_type)
        {
            IServiceClient fdclient = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var fdresultlist = fdclient.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = obj_type, Token = ViewBag.token });
            var fdrlist = fdresultlist.Data;
            List<string> objects_list = new List<string>();
            foreach (var element in fdrlist)
            {
                objects_list.Add(element.Name);
            }
            return objects_list;
        }

        public List<EbObjectWrapper> GetVersions(string objid)
        {
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { RefId = objid, VersionId = 0, Token = ViewBag.token });
            var rlist = resultlist.Data;
            return rlist;
        }

        public JsonResult CommitEbDataSource()
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var ds = new EbObjectSaveOrCommitRequest();
            ds.IsSave = false;
            ds.Id = Convert.ToInt32(req["id"]);
            ds.EbObjectType = (int)EbObjectType.DataSource;
            ds.Name = req["name"];
            ds.Description = req["description"];
            ds.Json = req["json"];
            ds.EbObject = EbSerializers.Json_Deserialize<EbDataSource>(req["json"]);
            (ds.EbObject as EbDataSource).EbObjectType = EbObjectType.DataSource;
            ds.Status = Objects.ObjectLifeCycleStatus.Live;
            ds.TenantAccountId = ViewBag.cid;
            ds.ChangeLog = req["changeLog"];
            ds.Token = ViewBag.token;//removed tcid
            ds.Relations = req["rel_obj"];
            ViewBag.IsNew = "false";

            var res = client.Post<EbObjectSaveOrCommitResponse>(ds);
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
            var ds = new EbObjectSaveOrCommitRequest();

            var _EbObjectType = (EbObjectType)Convert.ToInt32(req["ObjectType"]);
            ds.IsSave = Convert.ToBoolean(req["isSave"]);
            ds.Id = Convert.ToInt32(req["Id"]);
            ds.Name = req["Name"];
            ds.Description = req["Description"];
            if (_EbObjectType == EbObjectType.DataSource)
            {
                ds.Json = req["json"];
            }
            if (_EbObjectType == EbObjectType.SqlFunction)
            {
                ds.NeedRun = Convert.ToBoolean(req["NeedRun"]);
                ds.Json = req["json"];
            }

            ds.Token = ViewBag.token;
            ds.Relations = req["rel_obj"];
            ds.ChangeLog = "";
            ViewBag.IsNew = "false";
            var CurrSaveId = client.Post<EbObjectSaveOrCommitResponse>(ds);
            return Json("Success");
        }
        //for ajax call

        [HttpPost]
        public string VersionCodes(int objid, int objtype)
        {
            var _EbObjectType = (EbObjectType)objtype;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = objid, VersionId = objid, EbObjectType = objtype, Token = ViewBag.token });
            var rlist = resultlist.Data;
            foreach (var element in rlist)
            {
                if (_EbObjectType == EbObjectType.DataSource)
                {
                    var dsobj = EbSerializers.Json_Deserialize<EbDataSource>(element.Json);
                    ViewBag.Code = dsobj.Sql;
                }
                if (_EbObjectType == EbObjectType.SqlFunction)
                {
                    var dsobj = EbSerializers.Json_Deserialize<EbSqlFunction>(element.Json);
                    ViewBag.Code = dsobj.Sql;
                }
            }
            return ViewBag.Code;
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

            EbObjectWrapper FormObj = GetFormObj(Convert.ToInt32( req["objid"]), Convert.ToInt32(req["objtype"]));
            ViewBag.Json = FormObj.Json;
            ViewBag.Name = FormObj.Name;
            ViewBag.html = GetHtml2Render(_BuilderType, Convert.ToInt32(ViewBag.Objid));
            return View();

        }

        public string SaveFormBuilder()
        {
          var req = this.HttpContext.Request.Form;
           IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
          var ds = new EbObjectSaveOrCommitRequest();

            ds.IsSave = false;
            ds.Id = Convert.ToInt32(req["id"]);
            ds.EbObjectType = Convert.ToInt32(req["obj_type"]);
            ds.Name = req["name"];
            ds.Description = req["description"];
            ds.Json = req["filterdialogjson"];
            ds.Status = Objects.ObjectLifeCycleStatus.Live;
            ds.Token = ViewBag.token;
            ds.Relations = "";
            ds.ChangeLog = "";
            ds.NeedRun = false;
            var CurrSaveId = client.Post<EbObjectSaveOrCommitResponse>(ds);
            return CurrSaveId.RefId;
        }

        //Jith Builder related
        private string GetHtml2Render(BuilderType type, int objid)
        {
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(objid), VersionId = Int32.MaxValue, EbObjectType = (int)type, Token = ViewBag.token });
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

        public string GetByteaEbObjects_json()
        {
            var req = this.HttpContext.Request.Form;
            var _type = req["Ebobjtype"];
            BuilderType _EbObjectType = (BuilderType)Enum.Parse(typeof(BuilderType), _type, true);
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(req["objid"]), VersionId = Int32.MaxValue, EbObjectType = (int)_EbObjectType, Token = ViewBag.token });
            var rlist = resultlist.Data[0];
            string _html = "";
            string _head = "";
            var filterForm = EbSerializers.Json_Deserialize<EbFilterDialog>(rlist.Json);
            if (filterForm != null)
            {
                //_html = @"<div style='margin-top:10px;' id='filterBox'>";
                _html += filterForm.GetHtml();
                _head += filterForm.GetHead();
                //_html += @"</div>";
            }

            return _html + "<script>" + _head + "</script>";
        }

        public EbObjectWrapper GetFormObj(int objId, int objType)
        {
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = objId, VersionId = Int32.MaxValue, EbObjectType = objType, Token = ViewBag.token });
            var rlist = resultlist.Data[0];
            return rlist;
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
            var columnColletion = sscli.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { RefId = dsid.ToString(), Token = ViewBag.token, Params = paramsList });
            if (columnColletion.Columns == null || columnColletion.Columns.Count == 0)
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

        public PartialViewResult FilterDialog(int dsid)
        {
            if (dsid > 0)
            {
                //get datasource obj and get fdid
                IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
                var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = dsid, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataSource, Token = ViewBag.token });
                var fdid = EbSerializers.Json_Deserialize<EbDataSource>(resultlist.Data[0].Json).FilterDialogRefId;

                //get fd obj
                resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { RefId = fdid, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.FilterDialog, TenantAccountId = ViewBag.cid, Token = ViewBag.token });

                //redundant - REMOVE JITH
                var _filterDialog = EbSerializers.Json_Deserialize<EbFilterDialog>(resultlist.Data[0].Json);

                ViewBag.HtmlHead = _filterDialog.GetHead();
                ViewBag.HtmlBody = _filterDialog.GetHtml();
            }

            return PartialView();
        }

        public JsonResult SaveSettings(int dsid, string json, int dvid)
        {

            var req = this.HttpContext.Request.Form;
            Dictionary<string, object> _dict = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, object>>(json);
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var ds = new EbObjectSaveOrCommitRequest();
            if (ds.Id > 0)
                ds.IsSave = true;
            ds.Id = dvid;
            ds.EbObjectType = (int)EbObjectType.DataVisualization;
            ds.Name = _dict["dvName"].ToString();
            ds.Description = "abcd";
            ds.ChangeLog = "";
            ds.Json = EbSerializers.Json_Serialize(new EbDataVisualization
            {
                Name = _dict["dvName"].ToString(),
                settingsJson = _dict.ToString(),
                DataSourceRefId = dsid.ToString(),
                EbObjectType = EbObjectType.DataVisualization
            });
            ds.Status = Objects.ObjectLifeCycleStatus.Live;
            ds.Token = ViewBag.token;
            ds.TenantAccountId = ViewBag.cid;
            ds.Relations = dsid.ToString();

            var result = client.Post<EbObjectSaveOrCommitResponse>(ds);
            //if (result.Id > 0)
            //    dvid = result.Id;
            if (ViewBag.wc == "dc")
                this.EbConfig.GetRedisClient().Set(string.Format("{0}", result.RefId), json);
            else
                this.EbConfig.GetRedisClient().Set(string.Format("{0}_uid_{1}", result.RefId, ViewBag.UId), json);
            return Json("Success");
        }

        public List<string> GetDiffer(string OldText, string NewText)
        {
            List<string> Diff = new List<string>();
            var inlineBuilder = new SideBySideDiffBuilder(new Differ());

            var diffmodel = inlineBuilder.BuildDiffModel(OldText, NewText);
            Diff.Add(Differ(diffmodel.OldText));
            Diff.Add(Differ(diffmodel.NewText));

            return Diff;
        }

        private string Differ(DiffPaneModel text)
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


            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)type, TenantAccountId = ViewBag.cid, Token = ViewBag.token });
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
            var req = this.HttpContext.Request.Form;

            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            ViewBag.Header = "Edit Application";
            int obj_id = Convert.ToInt32(req["objid"]);
            ViewBag.Obj_id = obj_id;
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = obj_id/*, VersionId = null*/, EbObjectType = (int)EbObjectType.Application, Token = ViewBag.token });
            var rlist = resultlist.Data;
            foreach (var element in rlist)
            {
                ObjectLifeCycleStatus[] array = (ObjectLifeCycleStatus[])Enum.GetValues(typeof(ObjectLifeCycleStatus));
                List<ObjectLifeCycleStatus> lifeCycle = new List<ObjectLifeCycleStatus>(array);
                ViewBag.LifeCycle = lifeCycle;
                ViewBag.IsNew = "false";
                var dsobj = EbSerializers.Json_Deserialize<EbApplication>(element.Json);
                ViewBag.ObjectName = element.Name;
                ViewBag.ObjectDesc = element.Description;
                ViewBag.ObjType = (int)EbObjectType.Application;

            }

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
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            ViewBag.Header = "Create Application";
            var ds = new EbObjectSaveOrCommitRequest();
            ds.IsSave = false;
            ds.Id = (string.IsNullOrEmpty(req["objid"])) ? 0 : Convert.ToInt32(req["objid"]);           //Convert.ToInt32(_dict["id"]);//remember to pass 0 or value from view
            ds.EbObjectType = (int)EbObjectType.Application;
            ds.Name = req["name"];
            ds.Description = req["description"];
            ds.Json = EbSerializers.Json_Serialize(new EbApplication
            {
                Name = req["name"],
                EbObjectType = EbObjectType.Application
            });
            ds.Status = Objects.ObjectLifeCycleStatus.Live;
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
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var abc = client.Post(new Authenticate { provider = "logout" });
            HttpContext.Response.Cookies.Delete("Token");
            HttpContext.Response.Cookies.Delete("rToken");
            return RedirectToAction("DevSignIn", "Ext");

        }
        public IActionResult ReportBuilder()
        {
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = 2, TenantAccountId = ViewBag.cid, Token = ViewBag.token });
            var rlist = resultlist.Data;
            Dictionary<int, EbObjectWrapper> ObjList = new Dictionary<int, EbObjectWrapper>();
            foreach (var element in rlist)
            {               
                    ObjList[element.Id] = element;
            }
            ViewBag.Objlist = ObjList;
            return View();
        }
    }
}
