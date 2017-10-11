using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using ExpressBase.Web2;
using ExpressBase.Web.Filters;
using ExpressBase.Objects;
using DiffPlex.DiffBuilder.Model;
using DiffPlex.DiffBuilder;
using ExpressBase.Common;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Objects.ObjectContainers;
using ServiceStack;
using ExpressBase.Data;
using DiffPlex;
using System.Text;
using ServiceStack.Redis;
using ExpressBase.Common.Objects;
using System.Reflection;

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class CEController : EbBaseNewController
    {
        public CEController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult code_editor()
        {
            ViewBag.Header = "New Datasource";
            ViewBag.VersionNumber = 1;
            ViewBag.Obj_id = null;
            ViewBag.IsNew = "true";
            ViewBag.EditorHint = "CodeMirror.hint.sql";
            ViewBag.EditorMode = "text/x-sql";
            ViewBag.Icon = "fa fa-database";
            ViewBag.ObjType = (int)EbObjectType.DataSource;
            ViewBag.ObjectName = "*Untitled";
            ViewBag.FilterDialogId = "null";
            ViewBag.SqlFns = Getsqlfns((int)EbObjectType.SqlFunction);

            var typeArray = typeof(EbDatasourceMain).GetTypeInfo().Assembly.GetTypes();
            var _jsResult = CSharpToJs.GenerateJs<EbDatasourceMain>(BuilderType.DataSource, typeArray);
            ViewBag.Meta = _jsResult.Meta;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectTypes = _jsResult.EbObjectTypes;
            return View();
        }

        [HttpPost]
        public IActionResult code_editor(int i)
        {
            ViewBag.Header = "Edit Datasource";
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
                ViewBag.ObjectName = element.Name;
                ViewBag.ObjectDesc = element.Description;
                ViewBag.Status = element.Status;
                ViewBag.VersionNumber = element.VersionNumber;
                ViewBag.EditorHint = "CodeMirror.hint.sql";
                ViewBag.EditorMode = "text/x-pgsql";
                ViewBag.Icon = "fa fa-database";
                ViewBag.ObjType = (int)EbObjectType.DataSource;
                ViewBag.Refid = element.RefId;
                ViewBag.Majorv = element.MajorVersionNumber;
                ViewBag.Minorv = element.MinorVersionNumber;
                ViewBag.Patchv = element.PatchVersionNumber;
                ViewBag.Tags = element.Tags;

                if (String.IsNullOrEmpty(element.Json_wc) && !String.IsNullOrEmpty(element.Json_lc))
                {
                    ViewBag.ReadOnly = true;
                    var dsobj = EbSerializers.Json_Deserialize<EbDataSource>(element.Json_lc);
                    ViewBag.Code = dsobj.Sql;
                    ViewBag.dsObj = dsobj;
                    ViewBag.FilterDialogId = dsobj.FilterDialogRefId;
                    ViewBag.Workingcopy = element.Wc_All;
                }
                else if (String.IsNullOrEmpty(element.Json_lc) && !String.IsNullOrEmpty(element.Json_wc))
                {
                    ViewBag.ReadOnly = false;
                    var dsobj = EbSerializers.Json_Deserialize<EbDataSource>(element.Json_wc);
                    ViewBag.Code = dsobj.Sql;
                    ViewBag.dsObj = dsobj;
                    ViewBag.FilterDialogId = dsobj.FilterDialogRefId;
                    ViewBag.Workingcopy = element.Wc_All;
                }
            }
            var typeArray = typeof(EbDatasourceMain).GetTypeInfo().Assembly.GetTypes();
            var _jsResult = CSharpToJs.GenerateJs<EbDatasourceMain>(BuilderType.DataSource, typeArray);
            ViewBag.Meta = _jsResult.Meta;
            ViewBag.JsObjects = _jsResult.JsObjects;
            ViewBag.EbObjectTypes = _jsResult.EbObjectTypes;
            ViewBag.SqlFns = Getsqlfns((int)EbObjectType.SqlFunction);
            return View();
        }

        [HttpGet]
        public IActionResult SqlFunction_Editor()
        {
            ViewBag.Header = "New Sql Function";
            ViewBag.VersionNumber = 1;
            ViewBag.Obj_id = null;
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

            ViewBag.Obj_id = obj_id;
            var resultlist = this.ServiceClient.Get<EbObjectNonCommitedVersionResponse>(new EbObjectNonCommitedVersionRequest { RefId = obj_id });
            var rlist = resultlist.Data;
            foreach (var element in rlist)
            {
                ObjectLifeCycleStatus[] array = (ObjectLifeCycleStatus[])Enum.GetValues(typeof(ObjectLifeCycleStatus));
                List<ObjectLifeCycleStatus> lifeCycle = new List<ObjectLifeCycleStatus>(array);
                ViewBag.LifeCycle = lifeCycle;
                ViewBag.IsNew = "false";
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
            ViewBag.SqlFns = Getsqlfns((int)EbObjectType.SqlFunction);
            return View();
        }

        public Dictionary<string, EbObjectWrapper> GetObjects_refid_dict(int obj_type)
        {
            var fdresultlist = this.ServiceClient.Get<EbObjectObjListResponse>(new EbObjectObjListRequest { EbObjectType = obj_type });
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
            var fdresultlist = this.ServiceClient.Get<EbObjectObjListResponse>(new EbObjectObjListRequest { EbObjectType = obj_type });
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
            var resultlist = this.ServiceClient.Get<EbObjectAllVersionsResponse>(new EbObjectAllVersionsRequest { RefId = objid });
            var rlist = resultlist.Data;
            return rlist;
        }

        public string CommitEbDataSource()
        {
            var req = this.HttpContext.Request.Form;
            string refid;
            EbDataSource obj;
            if (string.IsNullOrEmpty(req["id"]))
            {
                var ds = new EbObject_Create_New_ObjectRequest();
                ds.EbObjectType = (int)EbObjectType.DataSource;
                obj = EbSerializers.Json_Deserialize<EbDataSource>(req["json"]);
                ds.Name = obj.Name;
                ds.Description = obj.Description;
                ds.Json = req["json"];
                ds.Status = ObjectLifeCycleStatus.Development;
                ds.Relations = req["rel_obj"];
                ds.IsSave = false;
                ds.Tags = req["tags"];

                var res = ServiceClient.Post<EbObject_Create_New_ObjectResponse>(ds);
                refid = res.RefId;

            }
            else
            {
                var ds = new EbObject_CommitRequest();
                ds.EbObjectType = (int)EbObjectType.DataSource;
                obj = EbSerializers.Json_Deserialize<EbDataSource>(req["json"]);
                ds.Name = obj.Name;
                ds.Description = obj.Description;
                ds.Json = req["json"];
                ds.Relations = req["rel_obj"];
                ds.RefId = req["id"];
                ds.ChangeLog = req["changeLog"];
                ds.Tags = req["tags"];
                var res = ServiceClient.Post<EbObject_CommitResponse>(ds);
                refid = res.RefId;
            }

            return refid;
        }

        public string SaveEbDataSource()
        {
            var req = this.HttpContext.Request.Form;
            string refid;
            EbDataSource obj;
            if (string.IsNullOrEmpty(req["id"]))
            {
                var ds = new EbObject_Create_New_ObjectRequest();
                ds.EbObjectType = (int)EbObjectType.DataSource;
                obj = EbSerializers.Json_Deserialize<EbDataSource>(req["json"]);
                ds.Name = obj.Name;
                ds.Description = obj.Description;
                ds.Json = req["json"];
                ds.Status = ObjectLifeCycleStatus.Development;
                ds.Relations = req["rel_obj"];
                ds.IsSave = true;
                ds.Tags = req["tags"];

                var res = ServiceClient.Post<EbObject_Create_New_ObjectResponse>(ds);
                refid = res.RefId;
            }
            else
            {

                var ds = new EbObject_SaveRequest();
                var _EbObjectType = (EbObjectType)Convert.ToInt32(req["ObjectType"]);
                ds.RefId = req["Id"];
                obj = EbSerializers.Json_Deserialize<EbDataSource>(req["json"]);
                ds.Name = obj.Name;
                ds.Description = obj.Description;
                ds.EbObjectType = Convert.ToInt32(req["ObjectType"]);
                ds.Json = req["json"];
                //if (_EbObjectType == EbObjectType.SqlFunction)
                //{
                //    ds.NeedRun = Convert.ToBoolean(req["NeedRun"]);
                //}
                ds.Relations = req["rel_obj"];
                ds.Tags = req["tags"];
                ViewBag.IsNew = "false";
                var res = this.ServiceClient.Post<EbObject_SaveResponse>(ds);
                refid = res.RefId;
            }
            return refid;
        }

        public string Create_Major_Version(string _refId, int _type)
        {
            var ds = new EbObject_Create_Major_VersionRequest();
            ds.RefId = _refId;
            ds.EbObjectType = _type;
            ds.Relations = null;
            var res = this.ServiceClient.Post<EbObject_Create_Major_VersionResponse>(ds);
            return res.RefId;
        }

        public string Create_Minor_Version(string _refId, int _type)
        {
            var ds = new EbObject_Create_Minor_VersionRequest();
            ds.RefId = _refId;
            ds.EbObjectType = _type;
            ds.Relations = null;
            var res = this.ServiceClient.Post<EbObject_Create_Minor_VersionResponse>(ds);
            return res.RefId;
        }

        public string Create_Patch_Version(string _refId, int _type)
        {
            var ds = new EbObject_Create_Patch_VersionRequest();
            ds.RefId = _refId;
            ds.EbObjectType = _type;
            ds.Relations = null;
            var res = this.ServiceClient.Post<EbObject_Create_Patch_VersionResponse>(ds);
            return res.RefId;
        }
        [HttpPost]
        public EbDataSource VersionCodes(string objid, int objtype)
        {
            EbDataSource dsobj = null;
            var _EbObjectType = (EbObjectType)objtype;
            var resultlist = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = objid });
            var rlist = resultlist.Data;
            foreach (var element in rlist)
            {
                if (_EbObjectType == EbObjectType.DataSource)
                {
                    dsobj = EbSerializers.Json_Deserialize<EbDataSource>(element.Json);
                    ViewBag.Code =dsobj.Sql;
                }
            }
            return dsobj;
        }

        public IActionResult GetFilterBody()
        {
            var req = this.HttpContext.Request.Form;
            var filterForm = this.Redis.Get<EbFilterDialog>(req["objid"]);
            return ViewComponent("ParameterDiv", new { paramDiv = filterForm });
        }

        public string ChangeStatus(string _refid, string _changelog, string _status)
        {
            var ds = new EbObjectChangeStatusRequest();
            ds.RefId = _refid;
            ds.Status = (ObjectLifeCycleStatus) Enum.Parse(typeof(ObjectLifeCycleStatus), _status);
            ds.ChangeLog = _changelog;
            var res = this.ServiceClient.Post<EbObjectChangeStatusResponse>(ds);
            return "success";
        }

        public List<EbObjectWrapper> GetStatusHistory(string _refid)
        {
            var resultlist = this.ServiceClient.Get<EbObjectStatusHistoryResponse>(new EbObjectStatusHistoryRequest { RefId = _refid });
            var rlist = resultlist.Data;
            return rlist;
        }

        public string GetColumns4Trial(string ds_refid, string parameter)
        {
            var redis = this.Redis;
            var sscli = this.ServiceClient;
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
            DataSourceColumnsResponse columnresp = sscli.Get<DataSourceColumnsResponse>(new DataSourceColumnsRequest { RefId = ds_refid.ToString(), Params = paramsList });
            if (columnresp.Columns == null || columnresp.Columns.Count == 0)
            {
                return "";
            }
            else
            {
                string colDef = "[";
                var __columns = (columnresp.Columns.Count > 1) ? columnresp.Columns[1] : columnresp.Columns[0];
                foreach (EbDataColumn column in __columns)
                {
                    colDef += "{";
                    colDef += "\"data\": " + __columns[column.ColumnName].ColumnIndex.ToString();
                    colDef += ",\"title\": \"" + column.ColumnName + "\"";
                    colDef += ",\"visible\": " + true.ToString().ToLower();
                    colDef += "},";
                }
                return colDef.Substring(0, colDef.Length - 1) + "]";
            }
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


    }
}
