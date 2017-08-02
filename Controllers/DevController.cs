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
            ViewBag.FilterDialogs = GetObjects((int)EbObjectType.FilterDialog);
            ViewBag.SqlFns = Getsqlfns((int)EbObjectType.SqlFunction);
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
                ViewBag.EditorMode = "text/x-pgsql";
                ViewBag.Icon = "fa fa-database";
                ViewBag.ObjType = (int)EbObjectType.DataSource;
                ViewBag.FilterDialogId = dsobj.FilterDialogId;
                //}
                //if (element.EbObjectType == ExpressBase.Objects.EbObjectType.JavascriptFunction)
                //{

                //}
            }
            //ViewBag.FilterDialogs = GetObjects((int)EbObjectType.FilterDialog);
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
            ViewBag.FilterDialogs = GetObjects((int)EbObjectType.FilterDialog);
            ViewBag.SqlFns = Getsqlfns((int)EbObjectType.SqlFunction);
            return View();
        }

        [HttpPost]
        public IActionResult SqlFunction_Editor(int i)
        {
            ViewBag.Header = "Edit Sql Function";
            var req = this.HttpContext.Request.Form;
            int obj_id = Convert.ToInt32(req["objid"]);
            //  var obj_type = (EbObjectType)Convert.ToInt32(req["obj_type"]);

            ViewBag.Obj_id = obj_id;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = obj_id, VersionId = -1, EbObjectType = (int)EbObjectType.SqlFunction, Token = ViewBag.token });
            var rlist = resultlist.Data;
            foreach (var element in rlist)
            {
                ObjectLifeCycleStatus[] array = (ObjectLifeCycleStatus[])Enum.GetValues(typeof(ObjectLifeCycleStatus));
                List<ObjectLifeCycleStatus> lifeCycle = new List<ObjectLifeCycleStatus>(array);
                ViewBag.LifeCycle = lifeCycle;
                ViewBag.IsNew = "false";
                //if (obj_type == ExpressBase.Objects.EbObjectType.DataSource)
                //{
                var dsobj = EbSerializers.ProtoBuf_DeSerialize<EbSqlFunction>(element.Bytea);
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
            ViewBag.FilterDialogs = GetObjects((int)EbObjectType.FilterDialog);
            ViewBag.SqlFns = Getsqlfns((int)EbObjectType.SqlFunction);
            ViewBag.Allversions = GetVersions(obj_id);
            return View();
        }

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

        public List<EbObjectWrapper> GetVersions(int objid)
        {
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = objid, VersionId = 0, Token = ViewBag.token });
            var rlist = resultlist.Data;
            return rlist;
        }

        public JsonResult CommitEbDataSource()
        {
            var req = this.HttpContext.Request.Form;
            var _dict = ServiceStack.Text.JsonSerializer.DeserializeFromString<Dictionary<string, string>>(req["Colvalues"]);
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var ds = new EbObjectSaveOrCommitRequest();
            var bytes = Convert.FromBase64String(_dict["code"]);
            string code_decoded = Encoding.UTF8.GetString(bytes);

            var _EbObjectType = (EbObjectType)Convert.ToInt32(_dict["objtype"]);
            ds.IsSave = false;
            ds.Id = Convert.ToInt32(_dict["id"]);
            ds.EbObjectType = Convert.ToInt32(_dict["objtype"]);
            ds.Name = _dict["name"];
            ds.Description = _dict["description"];
            if (_EbObjectType == EbObjectType.DataSource)
            {
                ds.Bytea = EbSerializers.ProtoBuf_Serialize(new EbDataSource
                {
                    Name = _dict["name"],
                    Description = _dict["description"],
                    Sql = code_decoded,
                    ChangeLog = ds.ChangeLog,
                    EbObjectType = _EbObjectType,
                    FilterDialogId = (_dict["filterDialogId"].ToString() == "Select Filter Dialog") ? 0 : Convert.ToInt32(_dict["filterDialogId"])
                });
            }

            if (_EbObjectType == EbObjectType.SqlFunction)
            {
                // ds.NeedRun = req["NeedRun"];
                ds.Bytea = EbSerializers.ProtoBuf_Serialize(new EbSqlFunction
                {
                    Name = _dict["name"],
                    Description = _dict["description"],
                    Sql = code_decoded,
                    ChangeLog = ds.ChangeLog,
                    EbObjectType = _EbObjectType,
                    FilterDialogId = (_dict["filterDialogId"].ToString() == "Select Filter Dialog") ? 0 : Convert.ToInt32(_dict["filterDialogId"])
                });
            }
            if (_dict["filterDialogId"].ToString() != "Select Filter Dialog")
            {
                _dict["rel_obj"] += Convert.ToInt32(_dict["filterDialogId"]);
            }
            ds.Status = Objects.ObjectLifeCycleStatus.Live;
            ds.TenantAccountId = ViewBag.cid;
            ds.ChangeLog = _dict["changeLog"];
            ds.Token = ViewBag.token;//removed tcid
            ds.Relations = _dict["rel_obj"];
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
                ds.Bytea = EbSerializers.ProtoBuf_Serialize(new EbDataSource
                {
                    Name = req["Name"],
                    Description = req["Description"],
                    Sql = req["Code"],
                    EbObjectType = _EbObjectType,
                    FilterDialogId = (req["FilterDialogId"].ToString() == "Select Filter Dialog") ? 0 : Convert.ToInt32(req["FilterDialogId"])

                });
            }
            if (_EbObjectType == EbObjectType.SqlFunction)
            {
                ds.NeedRun = Convert.ToBoolean(req["NeedRun"]);
                ds.Bytea = EbSerializers.ProtoBuf_Serialize(new EbSqlFunction
                {
                    Name = req["Name"],
                    Description = req["Description"],
                    Sql = req["Code"],
                    EbObjectType = _EbObjectType,
                    FilterDialogId = (req["FilterDialogId"].ToString() == "Select Filter Dialog") ? 0 : Convert.ToInt32(req["FilterDialogId"])
                });
            }

            ds.Token = ViewBag.token;

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
                    var dsobj = EbSerializers.ProtoBuf_DeSerialize<EbDataSource>(element.Bytea);
                    ViewBag.Code = dsobj.Sql;
                }
                if (_EbObjectType == EbObjectType.SqlFunction)
                {
                    var dsobj = EbSerializers.ProtoBuf_DeSerialize<EbSqlFunction>(element.Bytea);
                    ViewBag.Code = dsobj.Sql;
                }
            }
            return ViewBag.Code;
        }

        public IActionResult Eb_formBuilder()
        {
            return View();
        }
        [HttpPost]
        public IActionResult Eb_formBuilder(int i)
        {
            var req = this.HttpContext.Request.Form;
            ViewBag.Objtype = req["objtype"];
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
            ds.Relations = null;
            var CurrSaveId = client.Post<EbObjectSaveOrCommitResponse>(ds);
            return CurrSaveId.Id;
        }

        public string GetByteaEbObjects_json()
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(req["objid"]), VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.FilterDialog, Token = ViewBag.token });
            var rlist = resultlist.Data[0];
            string _html = "";
            string _head = "";
            var filterForm = EbSerializers.ProtoBuf_DeSerialize<EbFilterDialog>(rlist.Bytea);
            //string xjson = "{\"$type\": \"System.Collections.Generic.List`1[[ExpressBase.Objects.EbControl, ExpressBase.Objects]], mscorlib\", \"$values\": " +
            //    filterForm.FilterDialogJson + "}";
            try
            {
                var _form = JsonConvert.DeserializeObject(filterForm.FilterDialogJson,
                    new JsonSerializerSettings { TypeNameHandling = TypeNameHandling.All }) as EbForm;
                if (filterForm != null)
                {
                    _html = @"<div style='margin-top:10px;' id='filterBox'>";
                    _html += _form.GetHtml();
                    _head += _form.GetHead();
                    _html += @"</div>";
                }
            }
            catch (Exception e)
            {
            }
            return _html + "<script>" + _head + "</script>";

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
                var dsobj = EbSerializers.ProtoBuf_DeSerialize<EbDataVisualization>(element.Bytea);
                ViewBag.ObjectName = element.Name;
                ViewBag.dsid = dsobj.dsid;
                if (ViewBag.wc == "dc")
                {
                    //this.EbConfig.GetRedisClient().Remove(string.Format("{0}_TVPref_{1}", ViewBag.cid, ViewBag.Obj_id));
                    ViewBag.tvpref = this.EbConfig.GetRedisClient().Get<string>(string.Format("{0}_TVPref_{1}", ViewBag.cid, ViewBag.Obj_id));
                    //if (ViewBag.tvpref == null)
                    //    ViewBag.tvpref = GetColumns(dsobj.dsid);
                }
                else
                {
                    ViewBag.tvpref = this.EbConfig.GetRedisClient().Get<string>(string.Format("{0}_TVPref_{1}_uid_{2}", ViewBag.cid, objid, ViewBag.UId));
                    if (ViewBag.tvpref == null)
                        ViewBag.tvpref = this.EbConfig.GetRedisClient().Get<string>(string.Format("{0}_TVPref_{1}", ViewBag.cid, ViewBag.Obj_id));
                }
            }
            resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = Convert.ToInt32(ViewBag.dsid), VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataSource, Token = ViewBag.token });
            rlist = resultlist.Data;
            Dictionary<int, EbObjectWrapper> ObjList = new Dictionary<int, EbObjectWrapper>();
            foreach (var element in rlist)
                ObjList[element.Id] = element;
            ViewBag.DSList = ObjList;

            resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = (int)EbObjectType.DataSource, Token = ViewBag.token });
            rlist = resultlist.Data;
            Dictionary<int, EbObjectWrapper> ObjListAll = new Dictionary<int, EbObjectWrapper>();
            foreach (var element in rlist)
            {
                ObjListAll[element.Id] = element;
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
            //redis.Remove(string.Format("{0}_ds_{1}_columns", ViewBag.cid, dsid));
            DataSourceColumnsResponse columnresp = redis.Get<DataSourceColumnsResponse>(string.Format("{0}_ds_{1}_columns", ViewBag.cid, dsid));
            if (columnresp == null || columnresp.IsNull)
                columnresp = sscli.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { Id = dsid, Token = ViewBag.token });

            var tvpref = this.GetColumn4DataTable(columnresp.Columns, dsid, fdid, columnresp.IsPaged);
            return tvpref;
        }

        private string GetColumn4DataTable(ColumnColletion __columnCollection, int dsid, int fdid, bool isPaged)
        {
            var i = 0;
            string colDef = string.Empty;
            colDef = "{\"dsId\":" + dsid + ",\"fdId\":" + fdid + ",\"dvName\": \"<Untitled>\",\"renderAs\":\"table\",\"lengthMenu\":[ [100, 200, 300, -1], [100, 200, 300, \"All\"] ],";
            colDef += " \"scrollY\":300, \"rowGrouping\":\"\",\"leftFixedColumns\":0,\"rightFixedColumns\":0,\"IsPaged\":" + isPaged.ToString().ToLower() + ",\"columns\":[";
            colDef += "{\"width\":10, \"searchable\": false, \"orderable\": false, \"visible\":false, \"name\":\"serial\", \"title\":\"#\",\"type\":\"System.Int64\"},";
            colDef += "{\"width\":10, \"searchable\": false, \"orderable\": false, \"visible\":true, \"name\":\"checkbox\",\"type\":\"System.Boolean\"},";
            foreach (EbDataColumn column in __columnCollection)
            {
                colDef += "{";
                colDef += "\"data\": " + __columnCollection[column.ColumnName].ColumnIndex.ToString();
                colDef += string.Format(",\"title\": \"{0}<span hidden>{0}</span>\"", column.ColumnName);
                var vis = (column.ColumnName == "id") ? false.ToString().ToLower() : true.ToString().ToLower();
                colDef += ",\"visible\": " + false.ToString().ToLower();
                colDef += ",\"width\": \"100px\"";
                colDef += ",\"name\": \"" + column.ColumnName + "\"";
                colDef += ",\"type\": \"" + column.Type.ToString() + "\"";
                var cls = (column.Type.ToString() == "System.Double" || column.Type.ToString() == "System.Int32" || column.Type.ToString() == "System.Decimal" || column.Type.ToString() == "System.Int64") ? "dt-right tdheight" : "tdheight";
                colDef += ",\"className\": \"" + cls + "\"";
                colDef += ",\"pos\": \"" + ( __columnCollection.Count + 100).ToString() + "\"";
                colDef += "},";
            }
            colDef = colDef.Substring(0, colDef.Length - 1) + "],";
            string colext = "\"columnsext\":[";
            colext += "{\"name\":\"serial\"},";
            colext += "{\"name\":\"checkbox\"},";
            foreach (EbDataColumn column in __columnCollection)
            {
                colext += "{";
                if (column.Type.ToString() == "System.Double" || column.Type.ToString() == "System.Int32" || column.Type.ToString() == "System.Decimal" || column.Type.ToString() == "System.Int16" || column.Type.ToString() == "System.Int64")
                    colext += "\"name\":\"" + column.ColumnName + "\",\"AggInfo\":true,\"DecimalPlace\":2,\"RenderAs\":\"Default\",\"linkDv\":\"\"";
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
            ds.Relations = dsid.ToString();

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
            ds.Bytea = EbSerializers.ProtoBuf_Serialize(new EbApplication
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
            return View();
        }
    }
}
