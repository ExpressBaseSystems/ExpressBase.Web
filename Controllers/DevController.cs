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
            ViewBag.ObjectName = "New";
            ViewBag.FilterDialogId = "null";//related to showing selected fd in select fd dropdown 
            ViewBag.FilterDialogs = GetFilterDialogs();
            return View();
        }

        [HttpPost]
        public IActionResult code_editor(int i)
        {
            ViewBag.Header = "Edit Datasource";
            var req = this.HttpContext.Request.Form;
            int obj_id = Convert.ToInt32(req["objid"]);
            //  var obj_type = (EbObjectType)Convert.ToInt32(req["obj_type"]);

            ViewBag.Obj_id = obj_id;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = obj_id, VersionId = -1, EbObjectType = (int)EbObjectType.DataSource, Token = ViewBag.token });
            var rlist = resultlist.Data;
            foreach (var element in rlist)
            {
                ObjectLifeCycleStatus[] array = (ObjectLifeCycleStatus[])Enum.GetValues(typeof(ObjectLifeCycleStatus));
                List<ObjectLifeCycleStatus> lifeCycle = new List<ObjectLifeCycleStatus>(array);
                ViewBag.LifeCycle = lifeCycle;
                ViewBag.IsNew = "false";
                //if (obj_type == ExpressBase.Objects.EbObjectType.DataSource)
                //{
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
                //}
                //if (element.EbObjectType == ExpressBase.Objects.EbObjectType.JavascriptFunction)
                //{

                //}
            }
            ViewBag.FilterDialogs = GetFilterDialogs();
            ViewBag.Allversions = GetVersions2(obj_id);
            return View();
        }

        public Dictionary<int, EbObjectWrapper> GetFilterDialogs()
        {
            IServiceClient fdclient = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var fdresultlist = fdclient.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.FilterDialog, Token = ViewBag.token });
            var fdrlist = fdresultlist.Data;
            Dictionary<int, EbObjectWrapper> filterDialogs = new Dictionary<int, EbObjectWrapper>();
            foreach (var element in fdrlist)
            {
                filterDialogs[element.Id] = element;
            }           
            return filterDialogs;
        }

        public List<EbObjectWrapper> GetVersions()
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(req["Id"]), VersionId = 0, EbObjectType = (int)EbObjectType.DataSource, Token = ViewBag.token });
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
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(objid), VersionId = 0, Token = ViewBag.token });
            var rlist = resultlist.Data;
            return rlist;
        }
        public JsonResult CommitEbDataSource()
        {
            var req = this.HttpContext.Request.Form;
            var _dict = JsonSerializer.DeserializeFromString<Dictionary<string, string>>(req["Colvalues"]);
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var ds = new EbObjectSaveOrCommitRequest();
            var bytes = Convert.FromBase64String(_dict["code"]);
            string code_decoded = Encoding.UTF8.GetString(bytes);

            ds.IsSave = false;
            ds.Id = Convert.ToInt32(_dict["id"]);//remember to pass 0 or value from view
            ds.EbObjectType = (int)EbObjectType.DataSource;
            ds.Name = _dict["name"];
            ds.Description = _dict["description"];
            ds.Bytea = EbSerializers.ProtoBuf_Serialize(new EbDataSource
            {
                Name = _dict["name"],
                Description = _dict["description"],
                Sql = code_decoded,
                ChangeLog = ds.ChangeLog,
                EbObjectType = EbObjectType.DataSource,
                FilterDialogId = Convert.ToInt32(_dict["filterDialogId"])
            });
            ds.Status = Objects.ObjectLifeCycleStatus.Live;
            ds.TenantAccountId = ViewBag.cid;
            if (_dict["id"] == "0")
            {
                ds.ChangeLog = "";
            }
            else
            {
                ds.ChangeLog = _dict["changeLog"];
            }
            ds.Token = ViewBag.token;//removed tcid

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

            ds.IsSave = Convert.ToBoolean(req["isSave"]);
            ds.Id = Convert.ToInt32(req["Id"]);
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

        [HttpPost]
        public string VersionCodes(int objid)
        {
            //var req = this.HttpContext.Request.Form;
            //var objid = Convert.ToInt32(req["objid"]);
           // var vers_id = Convert.ToInt32(req["vers_id"]);
           // var obj_type = (EbObjectType)Convert.ToInt32(req["obj_type"]);
            //EbObjectType content;
            //Enum.TryParse(req["obj_type"], out content);
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = objid, VersionId = objid, EbObjectType = (int)EbObjectType.DataSource, Token = ViewBag.token });
            var rlist = resultlist.Data;
            foreach (var element in rlist)
            {
                var dsobj = EbSerializers.ProtoBuf_DeSerialize<EbDataSource>(element.Bytea);
                ViewBag.Code = dsobj.Sql;
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
            var ds = new EbObjectSaveOrCommitRequest();

            ds.IsSave = false;
            ds.Id = Convert.ToInt32(req["id"]);
            ds.EbObjectType = (int)EbObjectType.FilterDialog;
            ds.Name = req["name"];
            ds.Description = req["description"];
            ds.Bytea = EbSerializers.ProtoBuf_Serialize(new EbFilterDialog
            {
                Name = req["name"],
                Description = req["description"],
                FilterDialogJson = req["filterdialogjson"],
                EbObjectType = EbObjectType.FilterDialog
            });
            ds.Status = Objects.ObjectLifeCycleStatus.Live;
            ds.Token = ViewBag.token;
            var CurrSaveId = client.Post<EbObjectSaveOrCommitResponse>(ds);
            return CurrSaveId.Id;
        }

        public JsonResult GetByteaEbObjects_json()
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(req["objid"]), VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.FilterDialog, Token = ViewBag.token });
            var rlist = resultlist.Data;
            Dictionary<int, EbFilterDialog> ObjList = new Dictionary<int, EbFilterDialog>();
            foreach (var element in rlist)
            {
                if (element.EbObjectType.ToString() == "FilterDialog")
                {
                    var dsobj = EbSerializers.ProtoBuf_DeSerialize<EbFilterDialog>(element.Bytea);
                    dsobj.EbObjectType = element.EbObjectType;
                    dsobj.Id = element.Id;
                    ObjList[element.Id] = dsobj;
                }
            }

            return Json(ObjList);
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
            var columnColletion = sscli.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { Id = dsid, Token = ViewBag.token, Params = paramsList });
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
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataSource, Token = ViewBag.token });
            var rlist = resultlist.Data;
            Dictionary<int, EbObjectWrapper> ObjDSList = new Dictionary<int, EbObjectWrapper>();
            Dictionary<int, EbObjectWrapper> ObjDSListAll = new Dictionary<int, EbObjectWrapper>();
            Dictionary<int, string> ObjDVListAll = new Dictionary<int, string>();
            foreach (var element in rlist)
            {
                ObjDSListAll[element.Id] = element;
            }
            ViewBag.DSListAll = ObjDSListAll;
            ViewBag.DSList = ObjDSList;
            resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataVisualization, Token = ViewBag.token });
            rlist = resultlist.Data;
            foreach (var element in rlist)
            {
                ObjDVListAll[element.Id] = element.Name;
            }
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
            ViewBag.Obj_id = objid;

            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(objid), VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataVisualization, Token = ViewBag.token });
            var rlist = resultlist.Data;
            foreach (var element in rlist)
            {
                //if (element.EbObjectType == EbObjectType.DataVisualization)
                //{
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
                // }
            }
            resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(ViewBag.dsid), VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataSource, Token = ViewBag.token });
            rlist = resultlist.Data;
            Dictionary<int, EbObjectWrapper> ObjList = new Dictionary<int, EbObjectWrapper>();
            foreach (var element in rlist)
            {
                //if (element.EbObjectType == ExpressBase.Objects.EbObjectType.DataSource)
                //{
                ObjList[element.Id] = element;
                //}
            }
            ViewBag.DSList = ObjList;

            resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataSource, Token = ViewBag.token });
            rlist = resultlist.Data;
            Dictionary<int, EbObjectWrapper> ObjListAll = new Dictionary<int, EbObjectWrapper>();
            foreach (var element in rlist)
            {
                //if (element.EbObjectType == EbObjectType.DataSource)
                //{
                ObjListAll[element.Id] = element;
                //}
            }
            ObjListAll.Remove(ObjList.Keys.First<int>());
            ViewBag.DSListAll = ObjListAll;
            Dictionary<int, string> ObjDVListAll = new Dictionary<int, string>();
            resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataVisualization, Token = ViewBag.token });
            rlist = resultlist.Data;
            foreach (var element in rlist)
            {
                ObjDVListAll[element.Id] = element.Name;
            }
            ViewBag.DVListAll = ObjDVListAll;
            return View();
        }

        public string GetColumns(int dsid)
        {
            var redis = this.EbConfig.GetRedisClient();
            var sscli = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var token = Request.Cookies[string.Format("T_{0}", ViewBag.cid)];


            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(dsid), VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataSource, Token = ViewBag.token });
            var rlist = resultlist.Data;
            var fdid = 0;
            foreach (var element in rlist)
            {
                var dsobj = EbSerializers.ProtoBuf_DeSerialize<EbDataSource>(element.Bytea);
                fdid = dsobj.FilterDialogId;
               
            }

            //redis.Remove(string.Format("{0}_ds_{1}_columns", "eb_roby_dev", dsid));
            //redis.Remove(string.Format("{0}_TVPref_{1}_uid_{2}", "eb_roby_dev", dsid, 1));
            DataSourceColumnsResponse result;
            var columnColletion = redis.Get<ColumnColletion>(string.Format("{0}_ds_{1}_columns", ViewBag.cid, dsid));
            if (columnColletion == null || columnColletion.Count == 0)
            {
                result = sscli.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { Id = dsid, Token = ViewBag.token });
                columnColletion = result.Columns;
            }
            var tvpref = this.GetColumn4DataTable(columnColletion, dsid, fdid);
            return tvpref;
        }

        private string GetColumn4DataTable(ColumnColletion __columnCollection, int dsid, int fdid)
        {
            string colDef = string.Empty;
            colDef = "{\"dsId\":" + dsid + ",\"fdId\":" + fdid + ",\"dvName\": \"<Untitled>\",\"renderAs\":\"table\",\"lengthMenu\":[ [100, 200, 300, -1], [100, 200, 300, \"All\"] ],";
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
            var ds = new EbObjectSaveOrCommitRequest();
            if (ds.Id > 0)
                ds.IsSave = true;
            ds.Id = dvid;
            ds.EbObjectType = (int)EbObjectType.DataVisualization;
            ds.Name = _dict["dvName"].ToString();
            ds.Description = "abcd";
            ds.ChangeLog = "";
            ds.Bytea = EbSerializers.ProtoBuf_Serialize(new EbDataVisualization
            {
                Name = _dict["dvName"].ToString(),
                settingsJson = _dict.ToString(),
                dsid = dsid,
                EbObjectType = EbObjectType.DataVisualization
            });
            ds.Status = Objects.ObjectLifeCycleStatus.Live;
            ds.Token = ViewBag.token;
            ds.TenantAccountId = ViewBag.cid;

            var result = client.Post<EbObjectSaveOrCommitResponse>(ds);
            if (result.Id > 0)
                dvid = result.Id;
            if (ViewBag.wc == "dc")
                this.EbConfig.GetRedisClient().Set(string.Format("{0}_TVPref_{1}", ViewBag.cid, dvid), json);
            else
                this.EbConfig.GetRedisClient().Set(string.Format("{0}_TVPref_{1}_uid_{2}", ViewBag.cid, dvid, ViewBag.UId), json);
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



            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = obj_id, VersionId = -1, EbObjectType = (int)EbObjectType.Application, Token = ViewBag.token });
            var rlist = resultlist.Data;
            foreach (var element in rlist)
            {
                ObjectLifeCycleStatus[] array = (ObjectLifeCycleStatus[])Enum.GetValues(typeof(ObjectLifeCycleStatus));
                List<ObjectLifeCycleStatus> lifeCycle = new List<ObjectLifeCycleStatus>(array);
                ViewBag.LifeCycle = lifeCycle;
                ViewBag.IsNew = "false";
                var dsobj = EbSerializers.ProtoBuf_DeSerialize<EbApplication>(element.Bytea);
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

        public JsonResult SaveApplications()
        { 
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            ViewBag.Header = "Create Application";
            var ds = new EbObjectSaveOrCommitRequest();

            ds.IsSave = false;
            ds.Id = 0;           //Convert.ToInt32(_dict["id"]);//remember to pass 0 or value from view
            ds.EbObjectType = (int)EbObjectType.Application;
            ds.Name = req["name"];
            ds.Description = req["description"];
            ds.Bytea = EbSerializers.ProtoBuf_Serialize(new EbApplication
            {
                Name = req["name"],
                EbObjectType = EbObjectType.Application
            });
            ds.Status = Objects.ObjectLifeCycleStatus.Live;
            ds.TenantAccountId = ViewBag.cid;
            ds.ChangeLog = "";
            //if (_dict["id"] == "0")
            //{

            //    ds.ChangeLog = "";
            //}
            //else
            //{
            //    ds.ChangeLog = _dict["changeLog"];
            //}
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
    }
}
