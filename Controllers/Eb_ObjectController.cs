using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServiceStack;
using ServiceStack.Redis;
using ExpressBase.Common;
using ExpressBase.Objects.ServiceStack_Artifacts;
using ExpressBase.Common.Objects;
using ExpressBase.Objects;
using System.Reflection;
using DiffPlex.DiffBuilder;
using DiffPlex;
using DiffPlex.DiffBuilder.Model;
using Newtonsoft.Json;
using System.Text;
using ExpressBase.Objects.ReportRelated;
using ExpressBase.Objects.EmailRelated;
using ExpressBase.Common.Structures;
using ExpressBase.Common.JsonConverters;
using ExpressBase.Web.BaseControllers;
using System.Text.RegularExpressions;
using ExpressBase.Web.Filters;

namespace ExpressBase.Web.Controllers
{
    public class Eb_ObjectController : EbBaseIntCommonController
    {
        private Context2Js _c2js;

        public Eb_ObjectController(IServiceClient sclient, IRedisClient redis) : base(sclient, redis) { }

        [EbBreadCrumbFilter("Builders/", "ObjectType")]
        [HttpGet]
        [HttpPost]
        public IActionResult Index(string objid, int objtype)
        {
            dynamic dsobj = null;
            Context2Js _c2js = new Context2Js();
            ViewBag.ServiceUrl = Environment.GetEnvironmentVariable(EnvironmentConstants.EB_SERVICESTACK_EXT_URL);
            var type = (EbObjectType)(objtype);
            this.HttpContext.Items["ObjectType"] = type;
            if (objid != "null")
            {
                ViewBag.Obj_id = objid;
                var resultlist = this.ServiceClient.Get<EbObjectExploreObjectResponse>(new EbObjectExploreObjectRequest { Id = Convert.ToInt32(objid) });
                var rlist = resultlist.Data;
                foreach (var element in rlist)
                {
                    ViewBag.IsNew = "false";
                    ViewBag.ObjectName = element.Name;
                    ViewBag.ObjectDesc = element.Description;
                    ViewBag.Status = element.Status;
                    ViewBag.VersionNumber = element.VersionNumber;
                    ViewBag.ObjType = objtype;
                    ViewBag.Refid = element.RefId;
                    ViewBag.Majorv = element.Dashboard_Tiles.MajorVersionNumber;
                    ViewBag.Tags = element.Tags;
                    ViewBag.AppId = element.Apps;
                    ViewBag.DashboardTiles = element.Dashboard_Tiles;

                    if (String.IsNullOrEmpty(element.Json_wc) && !String.IsNullOrEmpty(element.Json_lc))
                    {
                        ViewBag.ReadOnly = true;
                        dsobj = EbSerializers.Json_Deserialize(element.Json_lc);
                        ViewBag.dsObj = dsobj;
                        dsobj.Status = element.Status;
                        dsobj.VersionNumber = element.VersionNumber;
                        ViewBag.Workingcopy = element.Wc_All;
                    }
                    else if (String.IsNullOrEmpty(element.Json_lc) && !String.IsNullOrEmpty(element.Json_wc))
                    {
                        ViewBag.ReadOnly = false;
                        dsobj = EbSerializers.Json_Deserialize(element.Json_wc);
                        ViewBag.dsObj = dsobj;
                        dsobj.Status = element.Status;
                        dsobj.VersionNumber = element.VersionNumber;
                        ViewBag.Workingcopy = element.Wc_All;
                    }
                }
            }
            else
            {
                ViewBag.IsNew = "true";
                ViewBag.Refid = string.Empty;
                ViewBag.ObjectName = "*Untitled";
                ViewBag.Status = string.Empty;
                ViewBag.ObjectDesc = string.Empty;
                ViewBag.ReadOnly = false;
                ViewBag.ObjType = objtype;
                ViewBag.Majorv = 0;
                ViewBag.Workingcopy = new string[0];
                ViewBag.Tags = string.Empty;
                ViewBag.AppId = "";
                ViewBag.DashboardTiles = null;
                ViewBag.VersionNumber = "1.0.0.w";


            }
            if (type.Equals(EbObjectTypes.DataSource))
            {
                var typeArray = typeof(EbDatasourceMain).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.DataSource, typeof(EbDatasourceMain));
                //_jsResult = CSharpToJs.GenerateJs<EbDatasourceMain>(BuilderType.DataSource, typeArray);
                if (dsobj != null)
                {
                    dsobj.AfterRedisGet(this.Redis, this.ServiceClient);
                    ViewBag.dsObj = dsobj;
                }

            }
            else if (type.Equals(EbObjectTypes.TableVisualization) || type.Equals(EbObjectTypes.ChartVisualization))
            {
                var typeArray = typeof(EbDataVisualizationObject).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.DVBuilder, typeof(EbDataVisualizationObject));
                if (dsobj != null)
                {
                    dsobj.AfterRedisGet(this.Redis, this.ServiceClient);
                    ViewBag.dsObj = dsobj;
                }
            }
            else if (type.Equals(EbObjectTypes.Report))
            {
                var typeArray = typeof(EbReportObject).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.Report, typeof(EbReportObject));
                if (dsobj != null)
                {
                    dsobj.AfterRedisGet(this.Redis, this.ServiceClient);
                    ViewBag.dsObj = dsobj;
                }
            }
            else if (type.Equals(EbObjectTypes.EmailBuilder))
            {
                var typeArray = typeof(EbEmailTemplateBase).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.EmailBuilder, typeof(EbEmailTemplateBase));
                if (dsobj != null)
                {
                    dsobj.AfterRedisGet(this.Redis);
                    ViewBag.dsObj = dsobj;
                }
            }
            else if (type.Equals(EbObjectTypes.FilterDialog))
            {
                var typeArray = typeof(EbFilterDialog).GetTypeInfo().Assembly.GetTypes();
                _c2js = new Context2Js(typeArray, BuilderType.FilterDialog, typeof(EbFilterDialog));
                if (dsobj != null)
                {
                    dsobj.AfterRedisGet(this.Redis);
                    ViewBag.dsObj = dsobj;
                }
            }
            //else if (type.Equals(EbObjectTypes.BotForm))
            //{
            //	var typeArray = typeof(EbBotForm).GetTypeInfo().Assembly.GetTypes();
            //	_c2js = new Context2Js(typeArray, BuilderType.BotForm, typeof(EbBotForm));
            //	if (dsobj != null)
            //	{
            //		dsobj.AfterRedisGet(this.Redis);
            //		var settings = new JsonSerializerSettings();
            //		settings.TypeNameHandling = TypeNameHandling.All;
            //		settings.Converters.Add(new DictionaryConverter());
            //		ViewBag.dsObj = EbSerializers.Json_Serialize(dsobj, settings);
            //	}
            //}

            ViewBag.Meta = _c2js.AllMetas;
            ViewBag.JsObjects = _c2js.JsObjects;
            ViewBag.EbObjectTypes = _c2js.EbObjectTypes;

            return View();
        }

        public string CommitEbObject(string _refid, string _json, string _changeLog, string _rel_obj, string _tags, string _apps)
        {
            string refid;
            var obj = EbSerializers.Json_Deserialize(_json);
            if (obj is EbDataSource)
            {
                bool ContainsRestricted = CheckRestricted((obj as EbDataSource).Sql);
                if (ContainsRestricted) return "RestrictedStatementinQuerry";
            }
            if (string.IsNullOrEmpty(_refid))
            {
                var uniqnameresp = ServiceClient.Get(new UniqueObjectNameCheckRequest { ObjName = obj.Name });
                if (uniqnameresp.IsUnique)
                {
                    var ds = new EbObject_Create_New_ObjectRequest
                    {
                        Name = obj.Name,
                        Description = obj.Description,
                        Json = _json,
                        Status = ObjectLifeCycleStatus.Dev,
                        Relations = _rel_obj,
                        IsSave = false,
                        Tags = _tags,
                        Apps = _apps,
                        SourceSolutionId = ViewBag.cid,
                        SourceObjId = "0",
                        SourceVerID = "0"
                    };
                    EbObject_Create_New_ObjectResponse res = ServiceClient.Post(ds);
                    if (res.ExceptionMessage != string.Empty && res.RefId == null)
                    {
                        return res.ExceptionMessage;
                    }
                    refid = res.RefId;
                }
                else return "nameisnotunique";
            }
            else
            {
                var ds = new EbObject_CommitRequest
                {
                    Name = obj.Name,
                    Description = obj.Description,
                    Json = _json,
                    Relations = _rel_obj,
                    RefId = _refid,
                    ChangeLog = _changeLog,
                    Tags = _tags,
                    Apps = _apps
                };
                var res = ServiceClient.Post<EbObject_CommitResponse>(ds);
                refid = res.RefId;
            }

            return refid;
        }

        public string SaveEbObject(string _refid, string _json, string _rel_obj, string _tags, string _apps)
        {
            string refid;
            var obj = EbSerializers.Json_Deserialize(_json);
            if (obj is EbDataSource)
            {
                bool ContainsRestricted = CheckRestricted((obj as EbDataSource).Sql);
                if (ContainsRestricted) return "RestrictedStatementinQuerry";
            }
            if (string.IsNullOrEmpty(_refid))
            {
                var uniqnameresp = ServiceClient.Get(new UniqueObjectNameCheckRequest { ObjName = obj.Name });
                if (uniqnameresp.IsUnique)
                {
                    var ds = new EbObject_Create_New_ObjectRequest
                    {
                        Name = obj.Name,
                        Description = obj.Description,
                        Json = _json,
                        Status = ObjectLifeCycleStatus.Dev,
                        Relations = _rel_obj,
                        IsSave = true,
                        Tags = _tags,
                        Apps = _apps,
                        SourceSolutionId = ViewBag.cid,
                        SourceObjId = "0",
                        SourceVerID = "0"
                    };

                    var res = ServiceClient.Post<EbObject_Create_New_ObjectResponse>(ds);
                    refid = res.RefId;
                }
                else return "nameIsNotUnique";
            }
            else
            {
                var ds = new EbObject_SaveRequest
                {
                    RefId = _refid,
                    Name = obj.Name,
                    Description = obj.Description,
                    Json = _json,
                    Relations = _rel_obj,
                    Tags = _tags,
                    Apps = _apps
                };

                var res = this.ServiceClient.Post<EbObject_SaveResponse>(ds);
                refid = res.RefId;
            }
            return refid;
        }

        public IActionResult GetLifeCycle(int _tabNum, string cur_status, string refid)
        {
            return ViewComponent("ObjectLifeCycle", new { _tabnum = _tabNum, _cur_status = cur_status, _refid = refid });
        }

        public IActionResult VersionHistory(string objid, int tabNum)
        {
            return ViewComponent("VersionHistory", new { objid = objid, tabnum = tabNum });
        }

        [HttpPost]
        public string VersionCodes(string objid, int objtype)
        {
            var resultlist = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = objid });
            var dsobj = EbSerializers.Json_Deserialize(resultlist.Data[0].Json);
            dsobj.Status = resultlist.Data[0].Status;
            dsobj.VersionNumber = resultlist.Data[0].VersionNumber;

            return EbSerializers.Json_Serialize(dsobj);
        }


        [HttpPost]
        public dynamic GetVersionObj(string refid)
        {
            var resultlist = this.ServiceClient.Get<EbObjectParticularVersionResponse>(new EbObjectParticularVersionRequest { RefId = refid });
            var dsobj = EbSerializers.Json_Deserialize(resultlist.Data[0].Json);
            dsobj.Status = resultlist.Data[0].Status;
            dsobj.VersionNumber = resultlist.Data[0].VersionNumber;
            return dsobj;
        }

        [HttpPost]
        public IActionResult CallObjectEditor(string _dsobj, int _tabnum, int Objtype, string _refid, string _ssurl)
        {
            string VCName = string.Empty;
            if (Objtype == (int)EbObjectTypes.DataSource)
                VCName = "CodeEditor";
            else if (Objtype == (int)EbObjectTypes.TableVisualization)
                VCName = "DVTable";
            else if (Objtype == (int)EbObjectTypes.WebForm)
                VCName = "FormBuilder";
            else if (Objtype == (int)EbObjectTypes.Report)
                VCName = "ReportBuilder";
            else if (Objtype == (int)EbObjectTypes.EmailBuilder)
                VCName = "Emailbuilder";
            return ViewComponent(VCName, new { dsobj = _dsobj, tabnum = _tabnum, type = Objtype, refid = _refid, ssurl = _ssurl });

        }

        [HttpPost]
        public IActionResult CallDifferVC(int _tabnum)
        {
            return ViewComponent("ObjectDiffer", new { tabnum = _tabnum });
        }

        [HttpPost]
        public List<string> GetObjectsToDiff(string ver1refid, string ver2refid)
        {
            var first_obj = GetVersionObj(ver1refid);
            var second_obj = GetVersionObj(ver2refid);
            List<string> result = new List<string>();
            var v1 = first_obj.VersionNumber.Replace(".w", "");
            var v2 = second_obj.VersionNumber.Replace(".w", "");
            var version1 = new Version(v1);
            var version2 = new Version(v2);
            var res = version1.CompareTo(version2);
            if (res > 0)
            {
                result = GetDiffer(ToJSONusingReflection(second_obj), ToJSONusingReflection(first_obj));
            }
            else
            {
                result = GetDiffer(ToJSONusingReflection(first_obj), ToJSONusingReflection(second_obj));
            }

            return result;
        }

        private const char CURLY_BRACE_OPEN = '{';
        private const char CURLY_BRACE_CLOSE = '}';
        private const char NEW_LINE = '\n';
        private const char TAB = '\t';
        private const char COLON = ':';
        private const char COMMA = ',';
        private const char DOUBLE_QUOTE = '"';
        private const char SPACE = ' ';

        private string ToJSONusingReflection(object o)
        {
            StringBuilder sb = new StringBuilder();
            sb.Append(CURLY_BRACE_OPEN);

            var props = o.GetType().GetTypeInfo().GetProperties();
            foreach (var prop in props)
            {
                sb.Append(NEW_LINE);
                sb.Append(TAB);
                sb.Append(prop.Name);
                sb.Append(COLON);
                sb.Append(SPACE);
                if (prop.PropertyType == typeof(int))
                {
                    sb.Append(prop.GetValue(o).ToString());
                    sb.Append(COMMA);
                }
                else if (prop.PropertyType == typeof(string))
                {
                    sb.Append(DOUBLE_QUOTE);
                    sb.Append(prop.GetValue(o).ToString());
                    sb.Append(DOUBLE_QUOTE);
                    sb.Append(COMMA);
                }
            }

            sb.Append(NEW_LINE);
            sb.Append(CURLY_BRACE_CLOSE);
            return sb.ToString();
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
            const string spaceValue = "&nbsp;";
            const string tabValue = "&#9;";
            string html = "<div class=" + "'diffpane col-md-12'" + "><table cellpadding='0' cellspacing='0' class='diffTable'>";

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

        public List<EbObjectWrapper> GetVersions(string objid)
        {
            var resultlist = this.ServiceClient.Get<EbObjectAllVersionsResponse>(new EbObjectAllVersionsRequest { RefId = objid });
            var rlist = resultlist.Data;
            return rlist;
        }

        public string ChangeStatus(string _refid, string _changelog, string _status)
        {
            var ds = new EbObjectChangeStatusRequest();
            ds.RefId = _refid;
            ds.Status = (ObjectLifeCycleStatus)Enum.Parse(typeof(ObjectLifeCycleStatus), _status);
            ds.ChangeLog = _changelog;
            var res = this.ServiceClient.Post<EbObjectChangeStatusResponse>(ds);
            return "success";
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
        public IActionResult UpdateObjectDashboard(string refid)
        {
            var resultlist = this.ServiceClient.Get<EbObjectUpdateDashboardResponse>(new EbObjectUpdateDashboardRequest { Refid = refid });
            var rlist = resultlist.Data;
            string objname = "";
            string status = "";
            string vernum = "";
            string[] workcopies = { };
            string _tags = "";
            string _apps = "";
            EbObjectWrapper_Dashboard _dashbord_tiles = new EbObjectWrapper_Dashboard();
            foreach (var element in rlist)
            {
                objname = element.Name;
                status = element.Status;
                vernum = element.VersionNumber;
                workcopies = element.Wc_All;
                _tags = element.Tags;
                _apps = element.Apps;
                _dashbord_tiles = element.Dashboard_Tiles;
            }
            return ViewComponent("ObjectDashboard", new { refid, objname, status = status, vernum, workcopies, _tags, _apps, _dashbord_tiles });
        }

        public bool CheckRestricted(string _sql)
        {
            bool ContainsRestricted = Regex.IsMatch(_sql.ToLower(), @"\b(create\s|update\s|delete\s|insert\s|alter\s|truncate\s|drop\s)");
            return ContainsRestricted;
        }
    }
}
