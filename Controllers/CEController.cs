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
            return View();
        }

        [HttpPost]
        public IActionResult code_editor(int i)
        {
            ViewBag.Header = "Edit Datasource";
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
            //   ViewBag.Allversions = GetVersions(obj_id);
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

        public Dictionary<string, EbObjectWrapper> GetObjects_refid_dict_all_ver(int obj_type)
        {
            var fdresultlist = this.ServiceClient.Get<EbObjectObjListAllVerResponse>(new EbObjectObjLisAllVerRequest { EbObjectType = obj_type });
            var fdrlist = fdresultlist.Data;
            Dictionary<string, EbObjectWrapper> objects_dict = new Dictionary<string, EbObjectWrapper>();
           
            foreach (var element in fdrlist)
            {
              //  objects_dict[element.id.] = element;
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
            if ( string.IsNullOrEmpty( req["id"]))
            {
                var ds = new EbObjectFirstCommitRequest();
                ds.EbObjectType = (int)EbObjectType.DataSource;
                ds.Name = req["name"];
                ds.Description = req["description"];
                ds.Json = req["json"];
                ds.EbObject = EbSerializers.Json_Deserialize<EbDataSource>(req["json"]);
                (ds.EbObject as EbDataSource).EbObjectType = EbObjectType.DataSource;
                ds.Status = ObjectLifeCycleStatus.Live;
                ds.UserId = ViewBag.UId;
                ds.Relations = req["rel_obj"];

                var res  = ServiceClient.Post<EbObjectFirstCommitResponse>(ds);
                refid = res.RefId;
             
            }
            else
            {
                var ds = new EbObjectSubsequentCommitRequest();
                ds.EbObjectType = (int)EbObjectType.DataSource;
                ds.Name = req["name"];
                ds.Description = req["description"];
                ds.Json = req["json"];
                ds.EbObject = EbSerializers.Json_Deserialize<EbDataSource>(req["json"]);
                (ds.EbObject as EbDataSource).EbObjectType = EbObjectType.DataSource;
                ds.Status = ObjectLifeCycleStatus.Live;
                ds.UserId = ViewBag.UId;
                ds.Relations = req["rel_obj"];
                ViewBag.IsNew = "false";
                ds.IsSave = false;
                ds.RefId = req["id"];
                ds.ChangeLog = req["changeLog"];
                var res = ServiceClient.Post<EbObjectSubsequentCommitResponse>(ds);
                refid = res.RefId;
            }

            return refid;
        }

        public IActionResult ds_save()
        {
            return View();
        }

        public EbObjectSubsequentCommitResponse SaveEbDataSource()
        {
            var req = this.HttpContext.Request.Form;
            var ds = new EbObjectSubsequentCommitRequest();

            var _EbObjectType = (EbObjectType)Convert.ToInt32(req["ObjectType"]);
            ds.IsSave = Convert.ToBoolean(req["isSave"]);
            ds.RefId = req["Id"];
            ds.Name = req["Name"];
            ds.Description = req["Description"];
            ds.EbObjectType = Convert.ToInt32(req["ObjectType"]);
            ds.Json = req["json"];
            //if (_EbObjectType == EbObjectType.SqlFunction)
            //{
            //    ds.NeedRun = Convert.ToBoolean(req["NeedRun"]);
            //}
            ds.UserId = ViewBag.UId;
            ds.Relations = req["rel_obj"];
            ds.ChangeLog = "";
            ViewBag.IsNew = "false";
            var x = this.ServiceClient.Post<EbObjectSubsequentCommitResponse>(ds);
            return x;
        }

        [HttpPost]
        public string VersionCodes(string objid, int objtype)
        {
            var _EbObjectType = (EbObjectType)objtype;
            var resultlist = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = objid });
            var rlist = resultlist.Data;
            foreach (var element in rlist)
            {
                if (_EbObjectType == EbObjectType.DataSource)
                {
                    var dsobj = EbSerializers.Json_Deserialize<EbDataSource>(element.Json);
                    ViewBag.Code = Encoding.UTF8.GetString(Convert.FromBase64String(dsobj.Sql));
                }
                if (_EbObjectType == EbObjectType.SqlFunction)
                {
                    var dsobj = EbSerializers.Json_Deserialize<EbSqlFunction>(element.Json);
                    ViewBag.Code = Encoding.UTF8.GetString(Convert.FromBase64String(dsobj.Sql));
                }
            }
            return ViewBag.Code;
        }

        public IActionResult GetFilterBody()
        {
            var req = this.HttpContext.Request.Form;
            var filterForm = this.Redis.Get<EbFilterDialog>(req["objid"]);
            return ViewComponent("ParameterDiv", new { paramDiv = filterForm });
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
