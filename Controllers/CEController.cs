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

// For more information on enabling MVC for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ExpressBase.Web.Controllers
{
    public class CEController : EbBaseController
    {
        public CEController(IOptionsSnapshot<EbSetupConfig> ss_settings) : base(ss_settings) { }

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
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { RefId = obj_id, VersionId = -1, EbObjectType = (int)EbObjectType.DataSource, TenantAccountId = ViewBag.cid });
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
            //  var obj_type = (EbObjectType)Convert.ToInt32(req["obj_type"]);

            ViewBag.Obj_id = obj_id;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { RefId = obj_id, VersionId = -1, EbObjectType = (int)EbObjectType.SqlFunction, TenantAccountId = ViewBag.cid });
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
        //    var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { Id = id, VersionId = id, EbObjectType = Convert.ToInt32(objtype), TenantAccountId = ViewBag.cid });
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
            var fdresultlist = fdclient.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = obj_type, TenantAccountId = ViewBag.cid });
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
            var fdresultlist = fdclient.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = obj_type, TenantAccountId = ViewBag.cid });
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
            var fdresultlist = fdclient.Get<EbObjectResponse>(new EbObjectRequest { Id = 0, VersionId = Int32.MaxValue, EbObjectType = obj_type, TenantAccountId = ViewBag.cid });
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
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { RefId = objid, VersionId = 0, TenantAccountId = ViewBag.cid });
            var rlist = resultlist.Data;
            return rlist;
        }

        public JsonResult CommitEbDataSource()
        {
            var req = this.HttpContext.Request.Form;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var ds = new EbObjectSaveOrCommitRequest();
            ds.IsSave = false;
            ds.RefId = req["id"];
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
            ds.RefId = req["Id"];
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
            ds.TenantAccountId = ViewBag.cid;
            ds.Token = ViewBag.token;
            ds.Relations = req["rel_obj"];
            ds.ChangeLog = "";
            ViewBag.IsNew = "false";
            var CurrSaveId = client.Post<EbObjectSaveOrCommitResponse>(ds);
            return Json("Success");
        }
        //for ajax call

        [HttpPost]
        public string VersionCodes(string objid, int objtype)
        {
            var _EbObjectType = (EbObjectType)objtype;
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { RefId = objid, VersionId = Int32.MaxValue, EbObjectType = objtype, Token = ViewBag.token });
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

        public string GetByteaEbObjects_json()
        {
            var req = this.HttpContext.Request.Form;
            var _type = req["Ebobjtype"];
            BuilderType _EbObjectType = (BuilderType)Enum.Parse(typeof(BuilderType), _type, true);
            IServiceClient client = this.EbConfig.GetServiceStackClient(ViewBag.token, ViewBag.rToken);
            var resultlist = client.Get<EbObjectResponse>(new EbObjectRequest { RefId = req["objid"], VersionId = Int32.MaxValue, EbObjectType = (int)_EbObjectType, Token = ViewBag.token });
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


    }
}
